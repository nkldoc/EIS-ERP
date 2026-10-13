/* global Ext, user_right_add, user_right_edit, user_right_delete */

// เมนู "ส่งมอบงาน (เวชภัณฑ์)" (ST00095) - แสดงเฉพาะสัญญาที่บันทึกผ่านเมนู
// "บันทึกรายละเอียดในสัญญา (เวชภัณฑ์)" (ST00092) อ่านจากตาราง sp_tor_period_bill
// โดยตรง (คนละตาราง/โฟลว์กับ "ส่งมอบงาน" เดิม ST0012 ที่อ่านจาก sp_mn_contract_hdr)
// กริดหลักแสดงทุกงวดของทุกสัญญาแยกเป็นคนละแถวเลย (1 แถว = 1 งวด) ดับเบิลคลิกแถวไหนก็ได้
// จะเปิดหน้าต่างแสดงรายละเอียดครบทุกงวดของสัญญานั้น (เหมือนเดิม) - ใช้ endpoint เดียวกับ
// ที่เมนู ST00092 ใช้อยู่แล้วทั้งหมด (tor/api/List_MedSupPeriodBill.php) ไม่ต้องเพิ่ม API ใหม่

Ext.storeDeliverMedSupList = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "tor/api/List_MedSupPeriodBill.php",
    baseParams: {type: "medsup_period_bill_flat"},
    root: "data",
    idProperty: "id",
    totalProperty: "totalCount",
    fields: [
        "no", "id", "sp_tor_period_bill_id", "sp_tor_period_bill_hdr_id", "sp_tor_contract_id", "sp_tor_hdr_period_id",
        "c_contract_code", "i_period", "c_doc_ref", "d_doc_dateSub", "f_period_amt", "c_detail",
        "dc_expense_budget_type_id_dtl", "c_fund_source_dtl", "f_fund_amt_dtl",
        "c_project_name", "c_contract_type", "po_expense_id", "c_expense_name", "i_budget_year",
        "c_po_no", "dc_creditor_id", "c_creditor_name", "c_tax_number_imp",
    ],
});

Ext.storeDeliverMedSupDtl = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "tor/api/List_MedSupPeriodBill.php",
    baseParams: {type: "medsup_period_bill_dtl1"},
    root: "data",
    idProperty: "row",
    fields: [
        "row", "id", "sp_tor_period_bill_hdr_id", "sp_tor_contract_id", "sp_tor_hdr_period_id",
        "c_contract_code", "i_period", "c_doc_ref", "d_doc_dateSub", "f_period_amt", "c_detail",
        "dc_expense_budget_type_id_dtl", "c_fund_source_dtl", "f_fund_amt_dtl",
    ],
});

// รายการ "รับของ" ย่อยของงวดที่เลือก (1 งวดรับของทยอยได้หลายครั้ง) - เก็บลง
// sp_tor_period_bill_receive จริง (ข้อมูลดิบ ไม่ยุ่งอะไรกับมัน เก็บไว้ครบทุกแถวเพื่อใช้
// ทำรายการต่อในหน้าถัดไป) ส่วนที่แสดงในกริดจะรวมแถวที่มีเลข IR เดียวกันให้เหลือ "1 แถว
// สรุปยอด" ต่างหาก (ดู Ext.storeDeliverMedSupReceiveDisplay + buildReceiveDisplayRows
// ด้านล่าง) - รายการที่ยังไม่ออกเลข IR ยังคงแสดงแยกเป็นรายแถวตามปกติ
Ext.storeDeliverMedSupReceive = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "tor/api/List_MedSupPeriodBill.php",
    baseParams: {type: "medsup_period_bill_receive"},
    root: "data",
    idProperty: "id",
    fields: ["id", "sp_tor_period_bill_id", "c_receive_code", "d_receive_date", "c_detail", "f_amt", "c_ir_code", "d_ir_issue", "c_ap_code", "d_ap_issue"],
});

// กริดแสดงผลจริง - แถวที่มี c_ir_code เดียวกันถูกยุบรวมเป็น 1 แถวสรุป (isGroup:true,
// เลือก/แก้ไข/ลบไม่ได้ เพราะออกเลขไปแล้ว) ส่วนแถวที่ยังไม่มีเลข IR แสดงแยกตามปกติ
// (isGroup:false) - สร้างใหม่ทุกครั้งที่ Ext.storeDeliverMedSupReceive โหลดเสร็จ
Ext.storeDeliverMedSupReceiveDisplay = new Ext.data.JsonStore({
    autoDestroy: false,
    fields: ["id", "isGroup", "c_receive_code", "d_receive_date", "c_detail", "f_amt", "c_ir_code", "d_ir_issue", "c_ap_code", "d_ap_issue"],
    data: [],
});

// แปลงวันที่รูปแบบ "d-m-Y" (ปี พ.ศ. ตามธรรมเนียมของแอพนี้) ให้เป็นตัวเลขเทียบลำดับได้
// (yyyy*10000+mm*100+dd) ใช้หาวันที่ล่าสุดของกลุ่ม - เทียบตรงๆ แบบ string ไม่ได้เพราะ
// รูปแบบเป็น d-m-Y ไม่ใช่ Y-m-d
function dateSortKey(dStr) {
    var parts = String(dStr || "").split("-");
    if (parts.length !== 3) {
        return 0;
    }
    return (parseInt(parts[2], 10) || 0) * 10000 + (parseInt(parts[1], 10) || 0) * 100 + (parseInt(parts[0], 10) || 0);
}

// Ext.floatRenderer คืนค่า "" (ว่าง) เมื่อ value เป็น 0 (falsy) - ใช้ตรงจุดแสดงยอดเงิน
// ที่ "0 บาท" เป็นค่าที่ถูกต้องและต้องขึ้นเลข 0.00 ให้เห็น (เช่น ยอดคงเหลือ/ใช้ไปแล้ว)
// ไม่ใช่ปล่อยว่าง
function moneyStr(v) {
    return Ext.floatRenderer(v) || "0.00";
}

function buildReceiveDisplayRows() {
    var groups = {};
    var groupOrder = [];
    var rows = [];
    Ext.storeDeliverMedSupReceive.each(function (r) {
        var ir = r.get("c_ir_code");
        if (!ir) {
            rows.push({
                id: r.get("id"),
                isGroup: false,
                c_receive_code: r.get("c_receive_code"),
                d_receive_date: r.get("d_receive_date"),
                c_detail: r.get("c_detail"),
                f_amt: r.get("f_amt"),
                c_ir_code: "",
                d_ir_issue: "",
                c_ap_code: r.get("c_ap_code"),
                d_ap_issue: r.get("d_ap_issue"),
            });
            return;
        }
        if (!groups[ir]) {
            groups[ir] = {
                count: 0, amt: 0, lastDate: "",
                d_ir_issue: r.get("d_ir_issue"), c_ap_code: r.get("c_ap_code"), d_ap_issue: r.get("d_ap_issue")
            };
            groupOrder.push(ir);
        }
        groups[ir].count++;
        groups[ir].amt += parseFloat(String(r.get("f_amt")).replace(/,/g, "")) || 0;
        // เอาวันที่รับของ "ล่าสุด" ของกลุ่มมาแสดง (ไม่ใช่วันที่ออกเลข IR)
        if (dateSortKey(r.get("d_receive_date")) >= dateSortKey(groups[ir].lastDate)) {
            groups[ir].lastDate = r.get("d_receive_date");
        }
    });
    groupOrder.forEach(function (ir) {
        var g = groups[ir];
        rows.push({
            id: "grp-" + ir,
            isGroup: true,
            // "เลขที่รับของ" ของแถวสรุป = เลข IR ที่รวมกันไปแล้วนั่นเอง ไม่ต้องมีคอลัมน์
            // "เลขที่ IR" แยกซ้ำอีกที (ปล่อยว่างไว้)
            c_receive_code: ir,
            d_receive_date: g.lastDate,
            c_detail: g.count + " รายการ",
            f_amt: Ext.floatRenderer(g.amt),
            c_ir_code: "",
            d_ir_issue: g.d_ir_issue,
            c_ap_code: g.c_ap_code,
            d_ap_issue: g.d_ap_issue,
        });
    });
    // store นี้ไม่ได้ตั้ง root ไว้ (ไม่ได้โหลดผ่าน URL/AJAX) - loadData() ต้องส่ง array
    // ดิบตรงๆ ห้ามห่อเป็น {data: rows} เหมือน response จาก server ไม่งั้น reader หา
    // records ไม่เจอ (ไม่มี root ให้แกะ) กริดเลยว่างเปล่าตลอด (บั๊กที่เจอจริง)
    Ext.storeDeliverMedSupReceiveDisplay.loadData(rows);
}

// หน้าต่างแสดงรายละเอียดเฉพาะงวดที่ดับเบิลคลิก (อ่านอย่างเดียว) - งวดใครงวดมัน ไม่รวม
// งวดอื่นของสัญญาเดียวกันมาด้วย จึงกรองด้วย sp_tor_period_bill_id ของแถวนั้นตรงๆ (ไม่ใช่
// sp_tor_period_bill_hdr_id ซึ่งจะได้ทุกงวดของสัญญานั้นมาทั้งหมด)
function winDeliverWorkMedSup(rec) {
    var periodId = rec.get("sp_tor_period_bill_id");
    var periodTotal = parseFloat(String(rec.get("f_period_amt")).replace(/,/g, "")) || 0;

    // อัปเดตยอด "คงเหลือ" หลังหักรายการรับของที่บันทึกไปแล้วทั้งหมด - เรียกทุกครั้งที่
    // กริดรับของโหลด/รีเฟรช (ตอนเปิดครั้งแรก, หลังเพิ่มรายการ, หลังออกเลข IR/AP)
    function updateRemainDisplay() {
        var used = 0;
        Ext.storeDeliverMedSupReceive.each(function (r) {
            used += parseFloat(String(r.get("f_amt")).replace(/,/g, "")) || 0;
        });
        var remainFld = Ext.getCmp("deliverMedSupRemainID");
        if (remainFld) {
            remainFld.setValue(moneyStr(periodTotal - used) + " บาท (ใช้ไปแล้ว " + moneyStr(used) + " บาท)");
        }
    }
    Ext.storeDeliverMedSupReceive.on("load", updateRemainDisplay);
    Ext.storeDeliverMedSupReceive.on("load", buildReceiveDisplayRows);

    Ext.storeDeliverMedSupDtl.setBaseParam("sp_tor_period_bill_id", periodId);
    Ext.storeDeliverMedSupDtl.load({
        callback: function (records) {
            var r0 = records && records[0];
            var totalFld = Ext.getCmp("deliverMedSupTotalID");
            if (totalFld && r0) {
                totalFld.setValue(r0.get("f_period_amt") + " บาท");
            }
            var docFld = Ext.getCmp("deliverMedSupDocRefID");
            if (docFld && r0) {
                docFld.setValue(r0.get("c_doc_ref") + " (วันที่ " + r0.get("d_doc_dateSub") + ")");
            }
        }
    });

    Ext.storeDeliverMedSupReceive.setBaseParam("sp_tor_period_bill_id", periodId);
    Ext.storeDeliverMedSupReceive.load();

    // แถวสรุป (isGroup:true - ออกเลข IR ไปแล้ว) เลือกได้ด้วย เพื่อให้ติ๊กรวมกับรายการใหม่
    // แล้วกด "ออกเลข IR ที่เลือก" เป็นการรวมรายการใหม่เข้ากลุ่มเดิมได้ (ต้องติ๊กแถวสรุป
    // มาด้วยตรงๆ เท่านั้นถึงจะรวม - ไม่ใช่รวมอัตโนมัติแค่เพราะอยู่งวดเดียวกัน)
    var checkboxSm = new Ext.grid.CheckboxSelectionModel();

    // id ของแถวที่กำลังแก้ไขอยู่ (null = โหมดเพิ่มรายการใหม่) - แก้ไขแล้วไม่แตะ
    // c_ir_code/c_ap_code เลย ถ้าเคยออกเลขไปแล้วจะยังคงเลขเดิมไว้ ไม่ออกใหม่
    var editingId = null;

    var receiveColumns = [
        checkboxSm,
        {header: "เลขที่รับของ", dataIndex: "c_receive_code", width: 120},
        {header: "วันรับของ", dataIndex: "d_receive_date", width: 100, align: "center"},
        {header: "รายละเอียด", dataIndex: "c_detail", width: 220},
        {header: "จำนวนเงิน", dataIndex: "f_amt", width: 100, align: "right"},
    ];

    // ฟอร์มเพิ่ม/แก้ไขรายการรับของ 1 แถว - ใช้ฟอร์มเดียวกันทั้งเพิ่มและแก้ไข สลับโหมด
    // ด้วย editingId (กด "แก้ไข" ในกริดจะดึงค่าเดิมมาเติมในฟอร์มนี้ให้)
    var addReceiveCodeFld = new Ext.form.TextField({fieldLabel: "เลขที่รับของ", width: 110, emptyText: "เลขที่รับของ"});
    var addReceiveDateFld = new Ext.form.DateField({fieldLabel: "วันรับของ", width: 100, emptyText: "วันรับของ"});
    var addReceiveDetailFld = new Ext.form.TextField({fieldLabel: "รายละเอียด", width: 220, emptyText: "รายละเอียด"});
    var addReceiveAmtFld = new Ext.form.NumberField({fieldLabel: "จำนวนเงิน", width: 90, emptyText: "จำนวนเงิน"});
    var saveReceiveBtn = new Ext.Toolbar.Button({text: "+ เพิ่ม", iconCls: "icon-add"});
    var cancelEditBtn = new Ext.Toolbar.Button({text: "ยกเลิกแก้ไข", iconCls: "icon-clear", hidden: true});
    var issueIrBtn = new Ext.Toolbar.Button({text: "ออกเลข IR ที่เลือก", iconCls: "icon-save"});
    var deleteSelectedBtn = new Ext.Toolbar.Button({text: "ลบรายการที่เลือก", iconCls: "icon-delete"});

    function resetReceiveForm() {
        editingId = null;
        addReceiveCodeFld.setValue("");
        addReceiveDateFld.setValue("");
        addReceiveDetailFld.setValue("");
        addReceiveAmtFld.setValue("");
        saveReceiveBtn.setText("+ เพิ่ม");
        cancelEditBtn.hide();
        // กำลังแก้ไขรายการ/จำนวนเงินอยู่เผื่อกรอกผิด ไม่ให้กดออกเลข IR/ลบสลับไปมาได้จนกว่า
        // จะบันทึกแก้ไข/ยกเลิกแก้ไขเสร็จก่อน - ซ่อนปุ่มไปเลยระหว่างแก้ไข
        issueIrBtn.show();
        deleteSelectedBtn.show();
    }

    function startEditReceive(record) {
        editingId = record.get("id");
        addReceiveCodeFld.setValue(record.get("c_receive_code"));
        addReceiveDateFld.setValue(record.get("d_receive_date"));
        addReceiveDetailFld.setValue(record.get("c_detail"));
        addReceiveAmtFld.setValue(record.get("f_amt"));
        saveReceiveBtn.setText("บันทึกแก้ไข");
        cancelEditBtn.show();
        issueIrBtn.hide();
        deleteSelectedBtn.hide();
    }

    // ลบรายการรับของ 1 แถวจริง (ยิง AJAX) - ใช้ร่วมกันทั้งกริดหลักและหน้าต่างรายการย่อย
    // ของกลุ่ม IR (ลบได้แม้ออกเลข IR ไปแล้ว เพราะ IR ผูกกับ "ยอดที่ยืนยันแล้ว" ไม่ใช่
    // ตัวแถวดิบ ผู้ใช้ยืนยันให้แก้ไข/ลบรายการย่อยในกลุ่มที่ออกเลขแล้วได้ตามปกติ)
    function performDeleteReceive(id, onSuccess) {
        Ext.Ajax.request({
            url: "tor/api/mnMedSupPeriodBillReceiveController.php",
            method: "POST",
            params: {mode: "DELETE", sp_tor_period_bill_receive_id: id},
            success: function () {
                if (onSuccess) {
                    onSuccess();
                }
            },
            failure: function () {
                Ext.Msg.alert("แจ้งเตือน", "ลบรายการรับของไม่สำเร็จ");
            }
        });
    }

    // ลบหลายแถวพร้อมกันตามที่ติ๊กเลือกไว้ (checkboxSm ตัวเดียวกับที่ใช้ออกเลข IR - เลือกแถว
    // สรุปของกลุ่ม IR ได้ด้วย แต่ลบจากตรงนี้ไม่ได้เพราะไม่ใช่แถวจริง ต้องลบรายการย่อยจาก
    // หน้าต่างรายละเอียดกลุ่มแทน)
    function deleteSelectedReceive() {
        var selected = checkboxSm.getSelections();
        if (!selected.length) {
            Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกรายการที่จะลบอย่างน้อย 1 รายการ");
            return;
        }
        if (selected.some(function (r) { return r.get("isGroup"); })) {
            Ext.Msg.alert("แจ้งเตือน", "ไม่สามารถลบแถวสรุปของกลุ่ม IR จากตรงนี้ได้ กรุณาดับเบิลคลิกแถวนั้นเพื่อลบรายการย่อยแทน");
            return;
        }
        Ext.Msg.confirm(
            "ยืนยัน",
            "ต้องการลบรายการรับของที่เลือกไว้ " + selected.length + " รายการใช่หรือไม่?",
            function (btn) {
                if (btn !== "yes") {
                    return;
                }
                var selectedIds = selected.map(function (r) { return r.get("id"); });
                var remaining = selected.length;
                selected.forEach(function (r) {
                    performDeleteReceive(r.get("id"), function () {
                        remaining--;
                        if (remaining === 0) {
                            if (selectedIds.indexOf(editingId) !== -1) {
                                resetReceiveForm();
                            }
                            Ext.storeDeliverMedSupReceive.reload();
                        }
                    });
                });
            }
        );
    }
    deleteSelectedBtn.setHandler(deleteSelectedReceive);

    // บันทึกเพิ่ม/แก้ไขรายการรับของ 1 แถวจริง (ยิง AJAX) - ใช้ร่วมกันทั้งฟอร์มบนกริดหลัก
    // และฟอร์มแก้ไขในหน้าต่างรายการย่อยของกลุ่ม IR ไม่แตะ c_ir_code/c_ap_code เลย ถ้าเคย
    // ออกเลขไปแล้วจะยังคงเลขเดิมไว้เสมอ (ฝั่ง PHP mode UPDATE ไม่ได้ SET สองคอลัมน์นี้)
    function validateAndSaveReceive(opts) {
        if (Ext.isEmpty(opts.amt)) {
            Ext.Msg.alert("แจ้งเตือน", "กรุณากรอกจำนวนเงิน");
            return;
        }
        // ห้ามรับของรวมเกินจำนวนเงินของงวดนี้ - รวมยอดของแถวอื่นทั้งหมด (ไม่รวมแถวที่
        // กำลังแก้ไขอยู่ ถ้ามี เพราะจะถูกแทนที่ด้วยยอดใหม่) + จำนวนเงินที่กำลังจะบันทึก
        // เทียบกับ periodTotal ก่อนยิง AJAX ทุกครั้ง (นับรวมทุกแถวไม่ว่าจะออกเลข IR
        // ไปแล้วหรือไม่ เพราะ periodTotal เป็นวงเงินของทั้งงวด)
        var used = 0;
        Ext.storeDeliverMedSupReceive.each(function (r) {
            if (r.get("id") !== opts.id) {
                used += parseFloat(String(r.get("f_amt")).replace(/,/g, "")) || 0;
            }
        });
        var newAmt = parseFloat(String(opts.amt).replace(/,/g, "")) || 0;
        if (used + newAmt - periodTotal > 0.01) {
            Ext.Msg.alert(
                "แจ้งเตือน",
                "จำนวนเงินรวมเกินวงเงินของงวดนี้<br>วงเงินงวดนี้: " + moneyStr(periodTotal) + " บาท"
                + "<br>รับของไปแล้ว (ไม่รวมแถวนี้): " + moneyStr(used) + " บาท"
                + "<br>คงเหลือ: " + moneyStr(periodTotal - used) + " บาท"
            );
            return;
        }
        var params = {
            mode: opts.id ? "UPDATE" : "ADD",
            sp_tor_period_bill_id: periodId,
            c_receive_code: opts.code,
            c_detail: opts.detail,
            f_amt: opts.amt,
            // DateField.getValue() คืนเป็น JS Date object ไม่ใช่ string - ถ้าส่งตรงๆ
            // ผ่าน Ext.Ajax.request (ไม่ได้ผ่าน form.submit()) จะโดนแปลงเป็น
            // toString() ของ Date ซึ่งไม่มีรูปแบบ "d-m-Y" ทำให้ bc_to_ad ฝั่ง PHP
            // แยกวัน/เดือน/ปีไม่ได้ (explode('-') ไม่เจอ) - ผู้เรียกต้องส่ง getRawValue()
            // ของ DateField มา (ข้อความที่พิมพ์ไว้ตรงๆ เช่น "17-09-2569" ปี พ.ศ.)
            d_receive_date: opts.date,
        };
        if (opts.id) {
            params.sp_tor_period_bill_receive_id = opts.id;
        }
        Ext.Ajax.request({
            url: "tor/api/mnMedSupPeriodBillReceiveController.php",
            method: "POST",
            params: params,
            success: function () {
                if (opts.onSuccess) {
                    opts.onSuccess();
                }
            },
            failure: function () {
                Ext.Msg.alert("แจ้งเตือน", "บันทึกรายการรับของไม่สำเร็จ");
            }
        });
    }

    function saveReceiveRow() {
        validateAndSaveReceive({
            id: editingId,
            code: addReceiveCodeFld.getValue(),
            date: addReceiveDateFld.getRawValue(),
            detail: addReceiveDetailFld.getValue(),
            amt: addReceiveAmtFld.getValue(),
            onSuccess: function () {
                resetReceiveForm();
                Ext.storeDeliverMedSupReceive.reload();
            }
        });
    }
    saveReceiveBtn.setHandler(saveReceiveRow);
    cancelEditBtn.setHandler(resetReceiveForm);

    // ออกเลข IR ให้แถวที่ติ๊กเลือกไว้ - เลือกได้หลายรายการพร้อมกัน แล้วทุกรายการที่เลือก
    // ในครั้งนี้จะรวมกันได้ "เลข IR เดียวกัน" (รวมยอดกันเป็นก้อนเดียว เช่น เลือก 2 รายการ
    // 20+20 จะได้ IR เดียวกัน ยอดรวม 40) ให้ยืนยันยอดรวมก่อนออกเลขจริงเสมอ - หน้านี้ทำได้
    // แค่ "ออกเลข IR" เท่านั้น (จำลอง/mock ไปก่อน - ยังไม่เชื่อม API ออกเลข IR จริง)
    function issueIrForSelected() {
        var selected = checkboxSm.getSelections();
        if (!selected.length) {
            Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกรายการที่จะออกเลข IR อย่างน้อย 1 รายการ");
            return;
        }
        // ติ๊กแถวสรุปของกลุ่ม IR เดิม (isGroup:true) มาด้วย = ต้องการรวมรายการใหม่ที่ติ๊ก
        // เข้ากลุ่มเดิมนั้นตรงๆ - ขยายแถวสรุปเป็นรายการย่อยจริงทั้งหมดของกลุ่มก่อนส่งไป
        // ฝั่ง PHP (ฝั่ง PHP จะออกเลขเดิมซ้ำก็ต่อเมื่อพบรายการที่มีเลข IR อยู่แล้วในชุดที่
        // ส่งมา ถ้าติ๊กแค่รายการใหม่ล้วนๆ จะได้เลข IR ใหม่เสมอ ไม่ไปรวมกับกลุ่มอื่นในงวด
        // เดียวกันเองโดยอัตโนมัติ)
        var ids = [];
        var hasNewItem = false;
        selected.forEach(function (sel) {
            if (sel.get("isGroup")) {
                var ir = sel.get("c_receive_code");
                Ext.storeDeliverMedSupReceive.each(function (r) {
                    if (r.get("c_ir_code") === ir) {
                        ids.push(r.get("id"));
                    }
                });
            } else {
                ids.push(sel.get("id"));
                hasNewItem = true;
            }
        });
        if (!hasNewItem) {
            Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกรายการที่ยังไม่ออกเลข IR ด้วยอย่างน้อย 1 รายการ");
            return;
        }
        var sumAmt = 0;
        selected.forEach(function (r) {
            sumAmt += parseFloat(String(r.get("f_amt")).replace(/,/g, "")) || 0;
        });
        Ext.Msg.confirm(
            "ยืนยันออกเลข IR",
            "รวม " + ids.length + " รายการ เป็นเลข IR เดียวกัน ยอดรวม " + moneyStr(sumAmt) + " บาท ใช่หรือไม่?",
            function (btn) {
                if (btn !== "yes") {
                    return;
                }
                Ext.Ajax.request({
                    url: "tor/api/mnMedSupPeriodBillReceiveController.php",
                    method: "POST",
                    params: {mode: "ISSUE_IR", ids: Ext.encode(ids)},
                    success: function () {
                        Ext.storeDeliverMedSupReceive.reload();
                    },
                    failure: function () {
                        Ext.Msg.alert("แจ้งเตือน", "ออกเลข IR ไม่สำเร็จ");
                    }
                });
            }
        );
    }
    issueIrBtn.setHandler(issueIrForSelected);

    // หน้าต่างแสดงรายการย่อยที่ถูกรวมอยู่ใต้แถวสรุป (isGroup:true) ของเลข IR หนึ่งๆ -
    // ดับเบิลคลิกแถวสรุปในกริดหลักแล้วเปิดมาดูได้ว่า "N รายการ" ที่รวมยอดกันไว้นั้น
    // มีอะไรบ้าง และแก้ไข/ลบรายการย่อยแต่ละอันได้แม้ออกเลข IR ไปแล้ว (c_ir_code ของ
    // แถวที่เหลือจะยังคงเดิม ไม่ถูกยกเลิก ไม่ต้องออกเลขใหม่)
    function winReceiveGroupDetail(irCode) {
        var groupStore = new Ext.data.JsonStore({
            fields: ["id", "c_receive_code", "d_receive_date", "c_detail", "f_amt"],
            idProperty: "id",
            data: [],
        });

        function refreshGroupStore() {
            var rows = [];
            Ext.storeDeliverMedSupReceive.each(function (r) {
                if (r.get("c_ir_code") === irCode) {
                    rows.push(r.data);
                }
            });
            groupStore.loadData(rows);
            // ลบจนไม่เหลือรายการในกลุ่มนี้แล้ว - ปิดหน้าต่างนี้ไปเลยเพราะไม่มีอะไรให้ดู/แก้ต่อ
            if (!rows.length && win.rendered) {
                win.destroy();
            }
        }

        var groupEditingId = null;
        var groupCodeFld = new Ext.form.TextField({fieldLabel: "เลขที่รับของ", width: 110, emptyText: "เลขที่รับของ"});
        var groupDateFld = new Ext.form.DateField({fieldLabel: "วันรับของ", width: 100, emptyText: "วันรับของ"});
        var groupDetailFld = new Ext.form.TextField({fieldLabel: "รายละเอียด", width: 200, emptyText: "รายละเอียด"});
        var groupAmtFld = new Ext.form.NumberField({fieldLabel: "จำนวนเงิน", width: 90, emptyText: "จำนวนเงิน"});
        var groupSaveBtn = new Ext.Toolbar.Button({text: "บันทึกแก้ไข", iconCls: "icon-save-edit", hidden: true});
        var groupCancelBtn = new Ext.Toolbar.Button({text: "ยกเลิก", iconCls: "icon-clear", hidden: true});
        var groupEditBtn = new Ext.Toolbar.Button({text: "แก้ไขรายการที่เลือก", iconCls: "icon-save-edit", disabled: true});
        var groupDelBtn = new Ext.Toolbar.Button({text: "ลบรายการที่เลือก", iconCls: "icon-delete", disabled: true});

        var groupSm = new Ext.grid.RowSelectionModel({singleSelect: true});

        function resetGroupForm() {
            groupEditingId = null;
            groupCodeFld.setValue("");
            groupCodeFld.hide();
            groupDateFld.setValue("");
            groupDateFld.hide();
            groupDetailFld.setValue("");
            groupDetailFld.hide();
            groupAmtFld.setValue("");
            groupAmtFld.hide();
            groupSaveBtn.hide();
            groupCancelBtn.hide();
            groupEditBtn.show();
            groupEditBtn.setDisabled(!groupSm.hasSelection());
            groupDelBtn.show();
            groupDelBtn.setDisabled(!groupSm.hasSelection());
        }

        groupSm.on("selectionchange", function (sm) {
            if (groupSaveBtn.hidden === false) {
                // กำลังแก้ไขอยู่ (ฟอร์มโชว์อยู่) ไม่ต้องยุ่งกับสถานะปุ่มจากการเลือกแถว
                return;
            }
            var has = sm.hasSelection();
            groupEditBtn.setDisabled(!has);
            groupDelBtn.setDisabled(!has);
        });

        groupEditBtn.setHandler(function () {
            var record = groupSm.getSelected();
            if (!record) {
                return;
            }
            groupEditingId = record.get("id");
            groupCodeFld.setValue(record.get("c_receive_code"));
            groupCodeFld.show();
            groupDateFld.setValue(record.get("d_receive_date"));
            groupDateFld.show();
            groupDetailFld.setValue(record.get("c_detail"));
            groupDetailFld.show();
            groupAmtFld.setValue(record.get("f_amt"));
            groupAmtFld.show();
            groupSaveBtn.show();
            groupCancelBtn.show();
            groupEditBtn.hide();
            groupDelBtn.hide();
        });
        groupCancelBtn.setHandler(resetGroupForm);
        groupSaveBtn.setHandler(function () {
            validateAndSaveReceive({
                id: groupEditingId,
                code: groupCodeFld.getValue(),
                date: groupDateFld.getRawValue(),
                detail: groupDetailFld.getValue(),
                amt: groupAmtFld.getValue(),
                onSuccess: function () {
                    resetGroupForm();
                    Ext.storeDeliverMedSupReceive.reload();
                }
            });
        });
        groupDelBtn.setHandler(function () {
            var record = groupSm.getSelected();
            if (!record) {
                return;
            }
            Ext.Msg.confirm("ยืนยัน", "ต้องการลบรายการรับของนี้ใช่หรือไม่?", function (btn) {
                if (btn !== "yes") {
                    return;
                }
                performDeleteReceive(record.get("id"), function () {
                    Ext.storeDeliverMedSupReceive.reload();
                });
            });
        });

        // store กลาง (Ext.storeDeliverMedSupReceive) โหลดใหม่ทุกครั้งที่แก้ไข/ลบสำเร็จ
        // (ทั้งจากหน้าต่างนี้เองและจากกริดหลัก) - ต้อง sync กริดในหน้าต่างนี้ตามไปด้วยเสมอ
        Ext.storeDeliverMedSupReceive.on("load", refreshGroupStore);

        var win = new Ext.Window({
            title: "รายการย่อยของเลขที่ " + irCode,
            width: 780,
            height: 380,
            modal: true,
            layout: "fit",
            closeAction: "destroy",
            items: [
                {
                    xtype: "grid",
                    border: true,
                    stripeRows: true,
                    store: groupStore,
                    sm: groupSm,
                    viewConfig: {emptyText: "ไม่มีรายการ..", deferEmptyText: true},
                    columns: [
                        {header: "เลขที่รับของ", dataIndex: "c_receive_code", width: 120},
                        {header: "วันรับของ", dataIndex: "d_receive_date", width: 100, align: "center"},
                        {header: "รายละเอียด", dataIndex: "c_detail", width: 170},
                        {header: "จำนวนเงิน", dataIndex: "f_amt", width: 100, align: "right"},
                    ],
                    tbar: [
                        groupEditBtn, " ", groupDelBtn,
                        "-",
                        groupCodeFld, " ", groupDateFld, " ", groupDetailFld, " ", groupAmtFld, " ",
                        groupSaveBtn, " ", groupCancelBtn,
                    ],
                }
            ],
            buttons: [
                {
                    text: Ext.GLOBAL_BU_BACK_TH,
                    iconCls: "icon-clear",
                    handler: function () {
                        win.destroy();
                    }
                }
            ],
            listeners: {
                destroy: function () {
                    Ext.storeDeliverMedSupReceive.un("load", refreshGroupStore);
                }
            }
        });
        win.show();
        resetGroupForm();
        refreshGroupStore();
    }

    new Ext.Window({
        id: "win-deliver-medsupID",
        title: "รายละเอียดงวดที่ " + rec.get("i_period") + " - เลขที่สัญญา " + rec.get("c_contract_code"),
        width: 1100,
        height: 600,
        modal: true,
        layout: "fit",
        closeAction: "destroy",
        maximizable: true, // สามารถขยายเต็มจอได้ (เหมือนหน้าตรวจรับพัสดุ/ครุภัณฑ์ - checking.js)
        items: [
            {
                xtype: "panel",
                layout: "border",
                items: [
                    {
                        // border layout ของ ExtJS 3 ต้องกำหนด height ให้ north/south region
                        // ตรงๆ เสมอ (ไม่รองรับ autoHeight) ไม่งั้น panel จะถูกบีบจนสูง 0 มองไม่เห็น
                        region: "north",
                        height: 280,
                        xtype: "form",
                        border: false,
                        bodyStyle: "padding:8px;",
                        labelWidth: 160,
                        defaults: {xtype: "displayfield", anchor: "100%"},
                        items: [
                            {fieldLabel: "งวดที่", value: rec.get("i_period")},
                            {fieldLabel: "ปีงบประมาณ", value: rec.get("i_budget_year")},
                            {fieldLabel: "ชื่อโครงการ", value: rec.get("c_project_name")},
                            {fieldLabel: "ชื่อค่าใช้จ่าย", value: rec.get("c_expense_name")},
                            {fieldLabel: "ผู้ขาย/ผู้รับจ้าง", value: rec.get("c_creditor_name")},
                            {fieldLabel: "แหล่งเงิน", value: rec.get("c_fund_source_dtl")},
                            {id: "deliverMedSupTotalID", fieldLabel: "จำนวนเงินงวดนี้", value: ""},
                            {id: "deliverMedSupRemainID", fieldLabel: "คงเหลือ", value: "", style: "font-weight:bold;"},
                            {id: "deliverMedSupDocRefID", fieldLabel: "เลขที่ใบส่งของ/ใบแจ้งหนี้", value: ""},
                        ]
                    },
                    {
                        region: "center",
                        xtype: "grid",
                        border: true,
                        stripeRows: true,
                        loadMask: true,
                        viewConfig: {emptyText: "ยังไม่มีรายการรับของ..", deferEmptyText: true},
                        store: Ext.storeDeliverMedSupReceiveDisplay,
                        sm: checkboxSm,
                        columns: receiveColumns,
                        listeners: {
                            // แถวสรุป (isGroup:true - ออกเลข IR รวมแล้ว) ดับเบิลคลิกเพื่อเปิด
                            // ดูรายการย่อยทั้งหมดที่ถูกรวมไว้ใต้เลข IR นั้น (แก้ไข/ลบได้จาก
                            // ในหน้าต่างนั้น) ส่วนแถวที่ยังไม่ได้ออกเลข ดับเบิลคลิกเพื่อแก้ไข
                            // รายการนั้นตรงๆ ในฟอร์มด้านบนกริดนี้เลย
                            rowdblclick: function (grid, rowIndex) {
                                var record = grid.getStore().getAt(rowIndex);
                                if (record.get("isGroup")) {
                                    winReceiveGroupDetail(record.get("c_receive_code"));
                                } else {
                                    startEditReceive(record);
                                }
                            }
                        },
                        tbar: [
                            {xtype: "tbtext", text: "เพิ่มรายการรับของ:"}, " ",
                            addReceiveCodeFld, " ", addReceiveDateFld, " ", addReceiveDetailFld, " ", addReceiveAmtFld, " ",
                            saveReceiveBtn, " ", cancelEditBtn,
                            "-",
                            issueIrBtn, " ", deleteSelectedBtn,
                        ],
                    }
                ]
            }
        ],
        buttons: [
            {
                text: Ext.GLOBAL_BU_BACK_TH,
                iconCls: "icon-clear",
                handler: function () {
                    Ext.getCmp("win-deliver-medsupID").destroy();
                }
            }
        ],
        listeners: {
            // ต้องถอด listener "load" ตัวนี้ออกตอนปิดหน้าต่างเสมอ เพราะ
            // Ext.storeDeliverMedSupReceive เป็น store กลางตัวเดียวใช้ร่วมกันทุกครั้งที่เปิด
            // หน้าต่างนี้ - ถ้าไม่ถอด เปิดปิดหลายรอบจะมี closure ของ periodTotal/periodId
            // เก่าค้างอยู่หลายตัว คำนวณคงเหลือผิดสัญญาไขว้กันตอนงวดอื่นโหลดทีหลัง
            destroy: function () {
                Ext.storeDeliverMedSupReceive.un("load", updateRemainDisplay);
                Ext.storeDeliverMedSupReceive.un("load", buildReceiveDisplayRows);
            }
        }
    }).show();
}

Ext.AppUx = function (app, menu) {
    Ext.user_right_add = user_right_add;
    Ext.user_right_edit = user_right_edit;
    Ext.user_right_delete = user_right_delete;
    Ext.title = Ext.menu_name + " " + Ext.menu_code;
    Ext.selectRow = [];

    Ext.loadStore = function () {};

    function rowDblClick(grid, rowIndex) {
        var record = grid.getStore().getAt(rowIndex);
        Ext.selectRow = record;
        winDeliverWorkMedSup(record);
    }

    var MenuButton = function () {
        var menuList = new Ext.menu.Menu({id: "mainMenu", border: false});
        var tb = new Ext.Toolbar({text: " รายการเมนู ", border: false, iconCls: "menu", menu: menuList});
        tb.add({text: " รายการเมนู ", iconCls: "bmenu", border: false, menu: menuList});
        menuList.addSeparator();
        menuList.add({text: "ค้นหาข้อมูล", icon: "../images/icons/book_magnify.png"})
            .on("click", function () {
                Ext.Msg.prompt("ค้นหา", "เลขที่สัญญา", function (btn, text) {
                    if (btn === "ok") {
                        Ext.storeDeliverMedSupList.setBaseParam("act", "SEARCH");
                        Ext.storeDeliverMedSupList.setBaseParam("c_contract_code", text);
                        Ext.storeDeliverMedSupList.load();
                    }
                });
            });
        tb.doLayout();
        return tb;
    };

    Ext.extend(
        (gridMain = function () {
            var colmnn = [
                new Ext.grid.RowNumberer({header: "ที่", dataIndex: "no", width: 40}),
                {header: "เลขที่สัญญา", dataIndex: "c_contract_code", width: 110},
                {header: "งวดที่", dataIndex: "i_period", width: 55, align: "center"},
                {header: "ปีงบประมาณ", dataIndex: "i_budget_year", width: 85, align: "center"},
                {header: "ชื่อโครงการ", dataIndex: "c_project_name", width: 200},
                {header: "ชื่อค่าใช้จ่าย", dataIndex: "c_expense_name", width: 200},
                {header: "เลขที่ใบส่งของ/ใบแจ้งหนี้", dataIndex: "c_doc_ref", width: 160},
                {header: "วันที่เอกสาร", dataIndex: "d_doc_dateSub", width: 100, align: "center"},
                {header: "แหล่งเงินของงวดนี้", dataIndex: "c_fund_source_dtl", width: 160},
                {header: "จำนวนเงินจากแหล่งเงินนี้", dataIndex: "f_fund_amt_dtl", width: 130, align: "right"},
                {header: "รายละเอียด", dataIndex: "c_detail", width: 200},
                {header: "ผู้ขาย/ผู้รับจ้าง", dataIndex: "c_creditor_name", width: 180},
                {header: "เลข PO", dataIndex: "c_po_no", width: 100},
            ];

            gridMain.superclass.constructor.call(this, {
                region: "center",
                title: Ext.title,
                xtype: "grid",
                id: "tabpanel1",
                border: true,
                stripeRows: true,
                loadMask: true,
                layout: "fit",
                viewConfig: {emptyText: "ไม่มีข้อมูล..", deferEmptyText: true},
                listeners: {
                    afterrender: function (g) {
                        this.on("rowdblclick", rowDblClick, this);
                    },
                },
                store: Ext.storeDeliverMedSupList,
                tbar: MenuButton(),
                columns: colmnn,
                bbar: new Ext.PagingToolbar({
                    pageSize: 20,
                    store: Ext.storeDeliverMedSupList,
                    displayInfo: true,
                    displayMsg: "Displaying topics {0} - {1} of {2}",
                }),
            });
        }),
        Ext.grid.GridPanel,
        {}
    );
};
