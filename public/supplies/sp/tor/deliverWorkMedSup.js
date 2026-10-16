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
    fields: [
        "id", "sp_tor_period_bill_id", "c_receive_code", "d_receive_date", "c_detail", "f_amt", "c_ir_code", "d_ir_issue", "c_ap_code", "d_ap_issue", "c_erp_stock_code",
        "draft_f_total_vat", "draft_b_vat", "draft_f_vat_percent", "draft_b_wht", "draft_f_wht_percent",
        "draft_f_penalty", "draft_b_guarantee", "draft_f_guarantee_percent", "draft_f_other",
        "draft_f_vat_amt", "draft_f_wht_amt", "b_ir_confirm", "b_ap_unlock",
    ],
});

// กริดแสดงผลจริง - แถวที่มี c_ir_code เดียวกันถูกยุบรวมเป็น 1 แถวสรุป (isGroup:true,
// เลือก/แก้ไข/ลบไม่ได้ เพราะออกเลขไปแล้ว) ส่วนแถวที่ยังไม่มีเลข IR แสดงแยกตามปกติ
// (isGroup:false) - สร้างใหม่ทุกครั้งที่ Ext.storeDeliverMedSupReceive โหลดเสร็จ
Ext.storeDeliverMedSupReceiveDisplay = new Ext.data.JsonStore({
    autoDestroy: false,
    fields: ["id", "isGroup", "hasDraft", "isConfirmed", "isLocked", "isUnlocked", "unlockId", "c_receive_code", "d_receive_date", "c_detail", "f_amt", "c_ir_code", "d_ir_issue", "c_ap_code", "d_ap_issue", "c_erp_stock_code"],
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

// Ext.floatRenderer ตัดทศนิยมตำแหน่งที่ 3 เป็นต้นไปทิ้งเฉยๆ (ตัดปัด ไม่ใช่ปัดเศษ) ทำให้
// ค่าที่หารไม่ลงตัว เช่น 100/1.07=93.4579... แสดงผลผิดเป็น 93.45 ทั้งที่ปัดแบบ 5/4 ที่ถูก
// ต้องคือ 93.46 - ปัดเศษให้ถูกต้อง (round half up) เป็น 2 ตำแหน่งก่อนเสมอ ก่อนส่งเข้า
// moneyStr ทุกครั้งที่เป็นยอดเงินที่คำนวณได้
// ห้ามใช้ Math.round(v * 100) / 100 (แม้บวก Number.EPSILON แล้ว) - floating point ทำให้ปัด
// ลงผิดที่ .xx5 จริง เช่น 64.50 x 7% = 4.515 -> 4.515*100 = 451.49999999999994 -> ได้ 4.51
// (ที่ถูกคือ 4.52 - ทดสอบ 0.01-5,000.00 ที่ 7%/1% ผิด 598 กรณี) ตัดเศษ float ทิ้งด้วย
// toPrecision(12) ก่อน แล้วเลื่อนทศนิยมผ่านสตริง "e2"/"e-2" (ไม่คูณ 100 ตรงๆ) ติดลบปัดตาม
// ขนาด (-4.515 -> -4.52) ให้ตรงกับ round() ของ PHP ฝั่ง SAVE_CHECKING
function round2(v) {
    var n = Number(Number(v).toPrecision(12));
    if (!isFinite(n) || Math.abs(n) < 0.000001) {
        return 0;
    }
    var sign = n < 0 ? -1 : 1;
    return sign * Number(Math.round(Number(Math.abs(n) + "e2")) + "e-2");
}

// ยอด VAT ของรายการรับของ 1 แถว (ร่างเก็บแยกรายการ) - สูตรเดียวกับ medsupRowMoney ใน
// tor/api/medsupVatDraft.php: ใช้ยอด VAT ที่บันทึกไว้ได้ก็ต่อเมื่อร่างยังตรงกับจำนวนเงินของ
// แถวตอนนี้ (ยอดรวม VAT - VAT = จำนวนเงิน) ไม่งั้นคิดจาก % (ไม่มีร่าง = VAT 7%)
// ค่าร่างจาก API เป็นข้อความ number_format (มีจุลภาค) ต้องตัดออกก่อน parseFloat
function rowVatMoney(r) {
    function num(v) {
        return parseFloat(String(v == null ? "" : v).replace(/,/g, "")) || 0;
    }
    function has(v) {
        return v !== "" && v !== null && typeof v !== "undefined";
    }
    var amt = round2(num(r.get("f_amt")));
    var hasDraft = has(r.get("draft_f_total_vat"));
    var bVat = hasDraft ? !!r.get("draft_b_vat") : true;
    var vatPct = hasDraft && has(r.get("draft_f_vat_percent")) ? num(r.get("draft_f_vat_percent")) : 7;
    var bWht = hasDraft ? !!r.get("draft_b_wht") : true;
    var whtPct = hasDraft && has(r.get("draft_f_wht_percent")) ? num(r.get("draft_f_wht_percent")) : 1;
    // [ผู้ใช้ยืนยัน] "ถอด VAT" - จำนวนเงินที่คีย์ของรายการ = จำนวนเงินรวม VAT แล้ว (เช่น 107)
    // ยอดก่อน VAT = 107/1.07 = 100, VAT = 7, หัก ณ ที่จ่ายคิดจากยอดก่อน VAT (1% = 1)
    // ใช้ยอดที่บันทึกไว้ได้ = เคยบันทึกร่าง VAT ของรายการนี้ และยอดรวม VAT ของร่างยังเท่ากับ
    // จำนวนเงินปัจจุบัน - ไม่ตรง/ไม่มีร่าง = ถอด VAT ใหม่จาก % ถือว่าถูกต้อง
    var useSaved = hasDraft && has(r.get("draft_f_vat_amt"))
        && Math.abs(round2(num(r.get("draft_f_total_vat"))) - amt) < 0.005;
    // ยอดของรายการใช้ยืนยันได้ - ผิดจริงคือจำนวนเงินเป็น 0/ติดลบ (สูตรเดียวกับ PHP)
    var confirmed = amt > 0;
    var vat, wht;
    if (useSaved) {
        vat = bVat ? round2(num(r.get("draft_f_vat_amt"))) : 0;
    } else {
        vat = bVat && vatPct > 0 ? round2(amt - amt / (1 + vatPct / 100)) : 0;
    }
    var before = round2(amt - vat);
    if (useSaved && bWht && has(r.get("draft_f_wht_amt"))) {
        wht = round2(num(r.get("draft_f_wht_amt")));
    } else {
        wht = bWht ? round2(before * whtPct / 100) : 0;
    }
    return {
        before: before, vat: vat, total: amt, wht: wht,
        penalty: hasDraft ? round2(num(r.get("draft_f_penalty"))) : 0,
        other: hasDraft ? round2(num(r.get("draft_f_other"))) : 0,
        hasDraft: hasDraft, confirmed: confirmed, vatPct: vatPct, whtPct: whtPct,
    };
}

// สถานะล็อกของเลข IR: [ผู้ใช้ยืนยัน] ออกเลขตรวจรับ (AP) แล้ว = ล็อก แก้ VAT/จำนวนเงินไม่ได้
// จนกว่าผู้ดูแลระบบจะปลดล็อกด้วย "ID ปลดล็อก" (= id แถวแรกของ IR ที่ขึ้นบนหน้าจอ ผู้ใช้แจ้งให้
// admin - ดู mode UNLOCK_AP) คืน {ap, locked, unlocked, unlockId}
function irLockInfo(irCode) {
    var info = {ap: "", locked: false, unlocked: false, unlockId: 0};
    if (!irCode) {
        return info;
    }
    Ext.storeDeliverMedSupReceive.each(function (r) {
        if (r.get("c_ir_code") !== irCode) {
            return;
        }
        var id = parseInt(r.get("id"), 10) || 0;
        if (id && (!info.unlockId || id < info.unlockId)) {
            info.unlockId = id;
        }
        if (r.get("c_ap_code") && !info.ap) {
            info.ap = r.get("c_ap_code");
        }
        if (parseInt(r.get("b_ap_unlock"), 10)) {
            info.unlocked = true;
        }
    });
    info.unlocked = !!info.ap && info.unlocked;
    info.locked = !!info.ap && !info.unlocked;
    return info;
}

// ผู้ใช้ปัจจุบันเป็นผู้ดูแลระบบไหม (ตั้งจาก type=medsup_whoami ตอนเปิดเมนู - ใช้โชว์ปุ่ม/เมนู
// ปลดล็อกเท่านั้น เซิร์ฟเวอร์เช็คสิทธิ์ซ้ำเสมอใน mode UNLOCK_AP)
Ext.medsupIsAdmin = false;

// ปลดล็อกเลข IR ที่ออกเลขตรวจรับแล้ว ด้วย "ID ปลดล็อก" (เฉพาะผู้ดูแลระบบ) - ใช้ทั้งเมนู
// "ปลดล็อกเลขตรวจรับ (Admin)" และปุ่ม "ปลดล็อก" ในกล่อง ID กลางจอ
function medsupUnlockAp(unlockId) {
    Ext.Ajax.request({
        url: "tor/api/mnMedSupPeriodBillReceiveController.php",
        method: "POST",
        params: {mode: "UNLOCK_AP", unlock_id: unlockId},
        success: function (resp) {
            var r = Ext.decode(resp.responseText);
            if (r.reval === 0) {
                Ext.Msg.alert("สำเร็จ", "ปลดล็อกเลข IR <b>" + r.c_ir_code + "</b> (เลขตรวจรับ " + r.c_ap_code + ") เรียบร้อยแล้ว"
                    + "<br>ผู้ใช้แก้ไข VAT ได้ แก้เสร็จกด \"ยืนยันยอด\" แล้วจะล็อกกลับเอง");
                if (Ext.getCmp("win-deliver-medsupID")) {
                    Ext.storeDeliverMedSupReceive.reload();
                }
            } else {
                Ext.Msg.alert("แจ้งเตือน", r.msg || "ปลดล็อกไม่สำเร็จ");
            }
        },
        failure: function () {
            Ext.Msg.alert("แจ้งเตือน", "ปลดล็อกไม่สำเร็จ");
        }
    });
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
                // เคยกด "บันทึกร่าง" VAT/ภาษีไว้แล้ว - แสดงลิงก์ "แก้ไข VAT" ท้ายแถว
                hasDraft: r.get("draft_f_total_vat") !== "" && r.get("draft_f_total_vat") != null,
                c_receive_code: r.get("c_receive_code"),
                d_receive_date: r.get("d_receive_date"),
                c_detail: r.get("c_detail"),
                f_amt: r.get("f_amt"),
                c_ir_code: "",
                d_ir_issue: "",
                c_ap_code: r.get("c_ap_code"),
                d_ap_issue: r.get("d_ap_issue"),
                c_erp_stock_code: r.get("c_erp_stock_code"),
            });
            return;
        }
        if (!groups[ir]) {
            groups[ir] = {
                count: 0, amt: 0, lastDate: "", lastErpStockCode: "", allConfirmed: true,
                d_ir_issue: r.get("d_ir_issue"), c_ap_code: r.get("c_ap_code"), d_ap_issue: r.get("d_ap_issue")
            };
            groupOrder.push(ir);
        }
        groups[ir].count++;
        // IR "ยืนยันยอดแล้ว" = ทุกแถวของ IR มี b_ir_confirm (เงื่อนไขเดียวกับ filter หน้าตรวจรับ)
        if (!parseInt(r.get("b_ir_confirm"), 10)) {
            groups[ir].allConfirmed = false;
        }
        groups[ir].amt += parseFloat(String(r.get("f_amt")).replace(/,/g, "")) || 0;
        // เอาวันที่รับของ/เลขรับเข้าคลัง ERP "ล่าสุด" ของกลุ่มมาแสดง (ไม่ใช่วันที่ออกเลข IR)
        if (dateSortKey(r.get("d_receive_date")) >= dateSortKey(groups[ir].lastDate)) {
            groups[ir].lastDate = r.get("d_receive_date");
            groups[ir].lastErpStockCode = r.get("c_erp_stock_code");
        }
    });
    groupOrder.forEach(function (ir) {
        var g = groups[ir];
        var lock = irLockInfo(ir);
        rows.push({
            id: "grp-" + ir,
            isGroup: true,
            isConfirmed: g.allConfirmed,
            isLocked: lock.locked,
            isUnlocked: lock.unlocked,
            unlockId: lock.unlockId,
            // "เลขที่ใบรับของ" ของแถวสรุป = เลข IR ที่รวมกันไปแล้วนั่นเอง ไม่ต้องมีคอลัมน์
            // "เลขที่ IR" แยกซ้ำอีกที (ปล่อยว่างไว้)
            c_receive_code: ir,
            d_receive_date: g.lastDate,
            c_detail: g.count + " รายการ",
            f_amt: Ext.floatRenderer(g.amt),
            c_ir_code: "",
            d_ir_issue: g.d_ir_issue,
            c_ap_code: g.c_ap_code,
            d_ap_issue: g.d_ap_issue,
            c_erp_stock_code: g.lastErpStockCode,
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
            var contractFld = Ext.getCmp("deliverMedSupContractCodeID");
            if (contractFld) {
                contractFld.setValue(rec.get("c_contract_code"));
            }
            var dueDateFld = Ext.getCmp("deliverMedSupDueDateID");
            if (dueDateFld && r0) {
                dueDateFld.setValue(r0.get("d_doc_dateSub"));
            }
        }
    });

    Ext.storeDeliverMedSupReceive.setBaseParam("sp_tor_period_bill_id", periodId);
    Ext.storeDeliverMedSupReceive.load();

    var checkboxSm = new Ext.grid.CheckboxSelectionModel();

    // id ของแถวที่กำลังแก้ไขอยู่ (null = โหมดเพิ่มรายการใหม่) - แก้ไขแล้วไม่แตะ
    // c_ir_code/c_ap_code เลย ถ้าเคยออกเลขไปแล้วจะยังคงเลขเดิมไว้ ไม่ออกใหม่
    var editingId = null;

    var receiveColumns = [
        checkboxSm,
        {
            header: "เลขที่ใบรับของ", dataIndex: "c_receive_code", width: 150,
            // แถวสรุป (isGroup:true) = ออกเลข IR รวมยอดไปแล้ว - ทำตัวเลขเป็นสีเขียวให้ user
            // รู้ชัดเจนว่ารายการที่ถูกจับกลุ่มไปออกเลข IR นั้นออกเลขไปแล้ว ไม่ต้องกดออกเลขซ้ำ
            // ส่วนแถวที่ยังไม่ออกเลข IR เป็นตัวสีแดง + "(รอออกเลข)" ให้เห็นชัดว่ายังค้างอยู่
            renderer: function (v, p, record) {
                if (record.get("isGroup")) {
                    return "<span style=\"color:#080;font-weight:bold;\">" + v + "</span>";
                }
                return "<span style=\"color:#c00;\">" + Ext.util.Format.htmlEncode(v || "") + " (รอออกเลข)</span>";
            }
        },
        {header: "เลขรับเข้าคลังของ ERP", dataIndex: "c_erp_stock_code", width: 190},
        {header: "วันรับของ", dataIndex: "d_receive_date", width: 100, align: "center"},
        {header: "รายละเอียด", dataIndex: "c_detail", width: 220},
        {header: "จำนวนเงิน", dataIndex: "f_amt", width: 100, align: "right"},
        {
            // เปิด popup ร่าง VAT/ภาษีหัก ณ ที่จ่าย "ของแถวนี้" (ร่างเก็บแยกรายการ) - ทุกแถวที่
            // ยังไม่ออกเลข IR (ยังไม่เคยบันทึกร่าง = "กรอก VAT") คลิกจับที่ cellclick ของกริด
            // (ดู listeners ด้านล่าง) แถวที่ออกเลข IR แล้วแก้จากหน้าต่างรายการย่อยของ IR แทน
            // แถวเลข IR (isGroup) = ลิงก์ "ยืนยันยอด" เปิดหน้าต่างตรวจยอด VAT รวมของทั้ง IR ก่อน
            // ส่งไปหน้าตรวจรับ (ยืนยันแล้วขึ้น "ยืนยันแล้ว" สีเขียว คลิกดูยอดได้) - winConfirmIr
            header: "", dataIndex: "hasDraft", width: 100, align: "center", sortable: false, menuDisabled: true,
            renderer: function (v, p, record) {
                if (record.get("isGroup")) {
                    // [ผู้ใช้ยืนยัน] ออกเลขตรวจรับ (AP) แล้ว = ล็อก แก้ VAT/จำนวนเงินไม่ได้อีก
                    // (คลิกเปิดดูยอดได้อย่างเดียว) โชว์ "ID ปลดล็อก" ให้ผู้ใช้แจ้ง admin ปลดล็อก
                    if (record.get("isLocked")) {
                        return "<a href=\"#\" class=\"locked-ir\" style=\"color:#666;\" title=\"ออกเลขตรวจรับ "
                            + Ext.util.Format.htmlEncode(record.get("c_ap_code")) + " แล้ว - แจ้ง ID นี้ให้ผู้ดูแลระบบเพื่อปลดล็อก\">"
                            + "<img src=\"../images/icons/lock.png\" style=\"vertical-align:middle;\"> ล็อก (ID "
                            + record.get("unlockId") + ")</a>";
                    }
                    // ผู้ดูแลระบบปลดล็อกแล้ว - แก้ VAT ได้ แก้เสร็จกดยืนยันยอดแล้วล็อกกลับเอง
                    if (record.get("isUnlocked")) {
                        return "<a href=\"#\" class=\"confirm-ir\" style=\"color:#c60;font-weight:bold;\">"
                            + "<img src=\"../images/icons/lock_open.png\" style=\"vertical-align:middle;\"> ปลดล็อกแล้ว - ยืนยันยอด</a>";
                    }
                    return record.get("isConfirmed")
                        ? "<a href=\"#\" class=\"confirm-ir\" style=\"color:#080;font-weight:bold;\">&#10004; ยืนยันแล้ว</a>"
                        : "<a href=\"#\" class=\"confirm-ir\" style=\"color:#c60;font-weight:bold;\">ยืนยันยอด</a>";
                }
                return "<a href=\"#\" class=\"edit-vat-draft\">" + (v ? "แก้ไข VAT" : "กรอก VAT") + "</a>";
            }
        },
    ];

    // ฟอร์มเพิ่ม/แก้ไขรายการรับของ 1 แถว - ใช้ฟอร์มเดียวกันทั้งเพิ่มและแก้ไข สลับโหมด
    // ด้วย editingId (กด "แก้ไข" ในกริดจะดึงค่าเดิมมาเติมในฟอร์มนี้ให้)
    var addReceiveCodeFld = new Ext.form.TextField({fieldLabel: "ใบแจ้งหนี้/รับของ", width: 110, emptyText: "ใบแจ้งหนี้/รับของ"});
    var addReceiveDateFld = new Ext.form.DateField({fieldLabel: "วันรับของ", width: 100, emptyText: "วันรับของ"});
    var addReceiveDetailFld = new Ext.form.TextField({fieldLabel: "รายละเอียด", width: 220, emptyText: "รายละเอียด"});
    var addReceiveAmtFld = new Ext.form.NumberField({fieldLabel: "จำนวนเงิน", width: 90, emptyText: "จำนวนเงิน"});
    var addErpStockCodeFld = new Ext.form.TextField({fieldLabel: "เลขรับเข้าคลังของ ERP", width: 140, emptyText: "เลขรับเข้าคลังของ ERP"});
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
        addErpStockCodeFld.setValue("");
        saveReceiveBtn.setText("+ เพิ่ม");
        cancelEditBtn.hide();
        // กำลังแก้ไขรายการ/จำนวนเงินอยู่เผื่อกรอกผิด ไม่ให้กดออกเลข IR/ลบสลับไปมาได้จนกว่า
        // จะบันทึกแก้ไข/ยกเลิกแก้ไขเสร็จก่อน - ซ่อนปุ่มไปเลยระหว่างแก้ไข
        issueIrBtn.show();
        deleteSelectedBtn.show();
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
            c_erp_stock_code: opts.erpStockCode,
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

    // เลข AP (เลขตรวจรับ) ของเลข IR นี้ ถ้ายัง "ล็อก" อยู่ ("" = ไม่ล็อก: ยังไม่ออก AP / ยังไม่มี
    // เลข IR / ผู้ดูแลระบบปลดล็อกแล้ว - ดู irLockInfo)
    function irApCode(irCode) {
        var lock = irLockInfo(irCode);
        return lock.locked ? lock.ap : "";
    }
    // [ผู้ใช้ยืนยัน] คลิก "ล็อก (ID ..)" ท้ายแถว IR = โชว์ "ID ปลดล็อก" ตัวใหญ่กลางจอ ให้ผู้ใช้
    // จด/แจ้งผู้ดูแลระบบได้ง่าย (admin ใส่ ID นี้ที่เมนู "ปลดล็อกเลขตรวจรับ (Admin)") - มีปุ่ม
    // "ดูยอด" เปิดหน้าต่างยืนยันยอดแบบอ่านอย่างเดียวได้ด้วย
    function showUnlockId(irCode) {
        var lock = irLockInfo(irCode);
        Ext.Msg.show({
            title: "ล็อก - ออกเลขตรวจรับแล้ว",
            msg: "<div style=\"text-align:center;padding:6px 10px;\">"
                + "<img src=\"../images/icons/lock.png\" style=\"vertical-align:middle;\"> เลข IR <b>" + Ext.util.Format.htmlEncode(irCode) + "</b>"
                + "<br>ออกเลขตรวจรับ (AP) <b>" + Ext.util.Format.htmlEncode(lock.ap) + "</b> แล้ว"
                + "<br><br>ต้องการแก้ไข กรุณาแจ้ง ID นี้ให้ผู้ดูแลระบบปลดล็อก"
                + "<div style=\"font-size:36px;font-weight:bold;color:#c00;margin:12px 0 4px;letter-spacing:2px;\">ID " + lock.unlockId + "</div>"
                + "</div>",
            minWidth: 360,
            // ผู้ดูแลระบบ: มีปุ่ม "ปลดล็อก" ให้กดปลดได้เลยจากตรงนี้ (ไม่ต้องไปหาเมนู Admin)
            buttons: Ext.medsupIsAdmin ? {ok: "ปลดล็อก", yes: "ดูยอด", no: "ปิด"} : {yes: "ดูยอด", no: "ปิด"},
            fn: function (btn) {
                if (btn === "yes") {
                    winConfirmIr(irCode);
                } else if (btn === "ok") {
                    Ext.Msg.confirm("ปลดล็อก", "ปลดล็อกเลข IR <b>" + Ext.util.Format.htmlEncode(irCode) + "</b> (ID " + lock.unlockId + ") ให้แก้ไข VAT ได้ใช่หรือไม่?", function (b) {
                        if (b === "yes") {
                            medsupUnlockAp(lock.unlockId);
                        }
                    });
                }
            }
        });
    }
    function lockMsg(irCode) {
        var lock = irLockInfo(irCode);
        return "เลข IR " + irCode + " ออกเลขตรวจรับ (AP) " + lock.ap + " แล้ว - ล็อก"
            + "<br>ต้องการแก้ไข กรุณาแจ้ง <b style=\"font-size:14px;\">ID ปลดล็อก: " + lock.unlockId + "</b> ให้ผู้ดูแลระบบปลดล็อก";
    }

    // popup กรอก/แก้ร่าง VAT/ภาษีหัก ณ ที่จ่าย/ค่าประกันผลงาน ของรายการรับของ "ทีละรายการ"
    // ([ผู้ใช้ยืนยัน] เลือก IR-01 แก้ VAT ได้เฉพาะของ IR-01) เปิดจาก: หลังกด "+ เพิ่ม" (แถว
    // ที่เพิ่งเพิ่ม), ลิงก์ "แก้ไข VAT"/ดับเบิลคลิกแถวที่ยังไม่ออกเลข IR, ปุ่ม "แก้ไข VAT" ใน
    // หน้าต่างรายการย่อยของเลข IR (แถวที่เลือก) - เก็บเป็น "ร่าง" ที่แถวรับของเอง (mode
    // SAVE_VAT_DRAFT) ยอดของเลข IR ที่หน้าตรวจรับ (ST00096) = ผลรวมร่างของทุกรายการใน IR
    // (ดู tor/api/medsupVatDraft.php) ถ้า IR นั้นบันทึกตรวจรับแล้ว เซิร์ฟเวอร์อัปเดตยอดใน
    // ข้อมูลตรวจรับตามให้ด้วย
    function winVatDraftPopup(pid, receiveId) {
        var pending = [];
        Ext.storeDeliverMedSupReceive.each(function (r) {
            if (r.get("id") == receiveId) {
                pending.push(r);
            }
        });
        if (!pending.length) {
            return;
        }
        var receiveRec = pending[0];
        // [ผู้ใช้ยืนยัน] IR ออกเลขตรวจรับ (AP) แล้ว = ล็อก แก้ VAT ไม่ได้ (เซิร์ฟเวอร์เช็คซ้ำ)
        var apLock = irApCode(receiveRec.get("c_ir_code"));
        if (apLock) {
            Ext.Msg.alert("ล็อก", lockMsg(receiveRec.get("c_ir_code")));
            return;
        }

        var draftSrc = null;
        pending.forEach(function (r) {
            if (!draftSrc && r.get("draft_f_total_vat") !== "" && r.get("draft_f_total_vat") != null) {
                draftSrc = r;
            }
        });
        var sumAmt = 0;
        pending.forEach(function (r) {
            sumAmt += parseFloat(String(r.get("f_amt")).replace(/,/g, "")) || 0;
        });

        // กริดรายการด้านบนของ popup แก้ไขได้ตรงๆ (ดับเบิลคลิก/คลิกช่อง) - แก้แล้วยังไม่บันทึก
        // จนกว่าจะกด "บันทึกร่าง" (saveDraft ส่ง UPDATE แถวที่แก้ก่อน แล้วค่อยบันทึกร่าง VAT)
        // f_amt จาก API เป็นข้อความ number_format (มีจุลภาค) - แปลงเป็นตัวเลขก่อน ไม่งั้น
        // NumberField editor อ่าน "1,000.00" ได้แค่ 1
        var draftGridStore = new Ext.data.JsonStore({
            idProperty: "id",
            fields: ["id", "c_receive_code", "d_receive_date", "c_detail", {name: "f_amt", type: "float"}, "c_erp_stock_code"],
            data: pending.map(function (r) {
                return Ext.apply({}, {f_amt: parseFloat(String(r.get("f_amt")).replace(/,/g, "")) || 0}, r.data);
            }),
        });
        // DateField editor ของแอพนี้ใช้ปี พ.ศ. (getRawValue ได้ "01-10-2569") แต่ค่าที่ commit
        // ลง record เป็น JS Date - ใน validateedit ต้องเปลี่ยนเป็น raw string แทน (เหมือนที่
        // ฟอร์มหลักส่ง getRawValue() ไปให้ PHP bc_to_ad)
        var draftDateEditor = new Ext.form.DateField({});

        var AMT_WIDTH = 100;
        // "จำนวนเงินรวม VAT" คือยอดรวมที่รวม VAT ไว้แล้ว (grand total) = ยอดรวมรายการ +
        // VAT ตาม % (ดู recalcVatFromPercent)
        var f_total_vatFld = new Ext.form.NumberField({
            fieldLabel: "จำนวนเงินรวม VAT", width: 200,
            // ค่าร่างจาก API ถูก number_format มาแล้ว (มีจุลภาค เช่น "1,070.00") - NumberField
            // ใช้ parseFloat ซึ่งจะอ่านได้แค่ 1 ต้องตัดจุลภาคออกก่อนเสมอ
            // ไม่มีร่าง = ยอดรวมรายการ (recalcVatFromPercent ตอนเปิดจะบวก VAT ตาม % เข้าไปให้เอง)
            value: draftSrc ? String(draftSrc.get("draft_f_total_vat")).replace(/,/g, "") : sumAmt,
        });
        var f_before_vatFld = new Ext.form.DisplayField({fieldLabel: "จำนวนเงินก่อน VAT", width: 200, value: "0.00"});
        var b_vatChk = new Ext.form.Checkbox({boxLabel: "", width: 22, checked: draftSrc ? !!draftSrc.get("draft_b_vat") : true});
        // แก้ไขเองได้ (ไม่ใช่แค่ DisplayField) เผื่อยอด VAT จริงในใบแจ้งหนี้ปัดเศษไม่ตรงกับ
        // ที่คำนวณได้พอดี - ตั้งต้นด้วยค่าคำนวณอัตโนมัติให้ก่อนเสมอ แก้เองทับได้ภายหลัง
        var f_vat_amtFld = new Ext.form.NumberField({width: AMT_WIDTH, value: "0.00", style: "font-weight:bold;color:#c00;"});
        var f_vat_percentFld = new Ext.form.NumberField({width: 45, value: draftSrc && draftSrc.get("draft_f_vat_percent") != null ? draftSrc.get("draft_f_vat_percent") : 7});
        var f_request_amtFld = new Ext.form.DisplayField({fieldLabel: "จำนวนเงินขอเบิก", width: 200, value: "0.00"});
        var b_whtChk = new Ext.form.Checkbox({boxLabel: "", width: 22, checked: draftSrc ? !!draftSrc.get("draft_b_wht") : true});
        // แก้ไขเองได้เหมือนกับยอด VAT (f_vat_amtFld) - ตั้งต้นด้วยค่าคำนวณอัตโนมัติให้ก่อน
        // เสมอ แก้เองทับได้ภายหลัง
        var f_wht_amtFld = new Ext.form.NumberField({width: AMT_WIDTH, value: "0.00", style: "font-weight:bold;color:#c00;"});
        var f_wht_percentFld = new Ext.form.NumberField({width: 45, value: draftSrc && draftSrc.get("draft_f_wht_percent") != null ? draftSrc.get("draft_f_wht_percent") : 1});
        var f_penaltyFld = new Ext.form.NumberField({fieldLabel: "ค่าปรับ", width: 200, value: draftSrc ? (String(draftSrc.get("draft_f_penalty") || 0).replace(/,/g, "")) : 0});
        var b_guaranteeChk = new Ext.form.Checkbox({boxLabel: "", width: 22, checked: draftSrc ? !!draftSrc.get("draft_b_guarantee") : false});
        var f_guarantee_amtFld = new Ext.form.DisplayField({width: AMT_WIDTH, value: "0.00", style: "font-weight:bold;color:#c00;"});
        var f_guarantee_percentFld = new Ext.form.NumberField({width: 45, value: draftSrc && draftSrc.get("draft_f_guarantee_percent") != null ? draftSrc.get("draft_f_guarantee_percent") : 0});
        var f_otherFld = new Ext.form.NumberField({fieldLabel: "อื่นๆ", width: 200, value: draftSrc ? (String(draftSrc.get("draft_f_other") || 0).replace(/,/g, "")) : 0});
        var f_pay_amtFld = new Ext.form.DisplayField({fieldLabel: "จำนวนเงินที่จ่าย", width: 200, value: "0.00", style: "font-weight:bold;font-size:14px;color:#060;"});

        // applyFinal() คำนวณยอดที่เหลือทั้งหมดจาก "ค่าปัจจุบันในฟิลด์" เสมอ: ยอดก่อน VAT =
        // ยอดรวม VAT - ยอด VAT, ขอเบิก = ยอดรวม VAT, [ผู้ใช้ยืนยัน] "จำนวนเงินที่จ่าย" = ยอด
        // รวม VAT - หัก ณ ที่จ่าย - ค่าปรับ - ค่าประกันผลงาน - อื่นๆ (107 -> 107 - 1 = 106)
        // setValue ไม่ยิง event "change" เองใน ExtJS 3 จึงต้องเรียกฟังก์ชันต่อกันตรงๆ
        function applyFinal() {
            var total = round2(parseFloat(String(f_total_vatFld.getValue()).replace(/,/g, "")) || 0);
            var vatAmt = round2(parseFloat(String(f_vat_amtFld.getValue()).replace(/,/g, "")) || 0);
            var beforeVat = round2(total - vatAmt);
            var whtAmt = round2(parseFloat(String(f_wht_amtFld.getValue()).replace(/,/g, "")) || 0);
            var guaranteePercent = b_guaranteeChk.getValue() ? (parseFloat(f_guarantee_percentFld.getValue()) || 0) : 0;
            var guaranteeAmt = b_guaranteeChk.getValue() ? round2(beforeVat * guaranteePercent / 100) : 0;
            var penalty = parseFloat(String(f_penaltyFld.getValue()).replace(/,/g, "")) || 0;
            var other = parseFloat(String(f_otherFld.getValue()).replace(/,/g, "")) || 0;
            var payAmt = round2(total - whtAmt - penalty - guaranteeAmt - other);

            f_before_vatFld.setValue(moneyStr(beforeVat));
            f_request_amtFld.setValue(moneyStr(total));
            f_guarantee_amtFld.setValue(moneyStr(guaranteeAmt));
            f_pay_amtFld.setValue(moneyStr(payAmt));
        }
        // [ผู้ใช้ยืนยัน] "ถอด VAT" - จำนวนเงินรายการด้านบน = ยอดรวม VAT แล้ว (คีย์ 107) ->
        // ยอดรวม VAT = 107, ก่อน VAT = 107/1.07 = 100, VAT = 7, หัก ณ ที่จ่าย = % ของยอดก่อน
        // VAT (1), จ่าย = 107 - 1 = 106 แก้จำนวนเงินรายการ = ถอด VAT/คิดหัก ณ ที่จ่ายใหม่ตาม %
        // เสมอ - ยอด VAT/หัก ณ ที่จ่าย/ยอดรวม VAT ยังแก้เองทับได้ (เผื่อใบแจ้งหนี้ปัดเศษไม่ตรง)
        function itemsSum() {
            var sum = 0;
            draftGridStore.each(function (r) {
                sum += parseFloat(r.get("f_amt")) || 0;
            });
            return round2(sum);
        }
        function currentVatAmt() {
            return round2(parseFloat(String(f_vat_amtFld.getValue()).replace(/,/g, "")) || 0);
        }
        function recalcWhtFromPercent() {
            var total = round2(parseFloat(String(f_total_vatFld.getValue()).replace(/,/g, "")) || 0);
            var beforeVat = round2(total - currentVatAmt());
            var whtPercent = parseFloat(f_wht_percentFld.getValue()) || 0;
            var whtAmt = b_whtChk.getValue() ? round2(beforeVat * whtPercent / 100) : 0;
            f_wht_amtFld.setValue(moneyStr(whtAmt));
            applyFinal();
        }
        // ตั้งยอดรวม VAT = ยอดรวมรายการ แล้วถอด VAT ใหม่จาก % (ตอนเปิด/แก้จำนวนเงินรายการ/
        // แก้ % หรือติ๊ก VAT)
        function recalcVatFromPercent() {
            f_total_vatFld.setValue(itemsSum());
            recalcFromTotal();
        }
        // ถอด VAT จากยอดรวม VAT ในช่อง (พิมพ์เองได้) - หารย้อนกลับหายอดก่อน VAT (107 VAT 7%
        // -> ก่อน VAT 100, VAT 7) แล้วคิดหัก ณ ที่จ่ายต่อจากยอดก่อน VAT
        function recalcFromTotal() {
            var total = round2(parseFloat(String(f_total_vatFld.getValue()).replace(/,/g, "")) || 0);
            var vatPercent = b_vatChk.getValue() ? (parseFloat(f_vat_percentFld.getValue()) || 0) : 0;
            var beforeVat = vatPercent > 0 ? total / (1 + vatPercent / 100) : total;
            f_vat_amtFld.setValue(moneyStr(round2(total - beforeVat)));
            recalcWhtFromPercent();
        }
        // แก้ยอด VAT เอง - ยอดรวม VAT คงเดิม ยอดก่อน VAT = ยอดรวม VAT - VAT ใหม่ แล้วคิดหัก ณ
        // ที่จ่ายต่อ
        function recalcTotalFromVatAmt() {
            recalcWhtFromPercent();
        }
        // แก้จำนวนเงินรายการด้านบน - คิด VAT/หัก ณ ที่จ่ายใหม่ตาม % จากยอดใหม่
        function recalcTotalFromItems() {
            recalcVatFromPercent();
        }
        f_vat_percentFld.on("change", recalcVatFromPercent);
        b_vatChk.on("check", recalcVatFromPercent);
        f_total_vatFld.on("change", recalcFromTotal);
        f_vat_amtFld.on("change", recalcTotalFromVatAmt);
        f_wht_percentFld.on("change", recalcWhtFromPercent);
        b_whtChk.on("check", recalcWhtFromPercent);
        f_wht_amtFld.on("change", applyFinal);
        [f_penaltyFld, f_guarantee_percentFld, f_otherFld].forEach(function (fld) {
            fld.on("change", applyFinal);
        });
        b_guaranteeChk.on("check", applyFinal);

        // บันทึกแถวที่แก้ในกริดด้านบน (UPDATE ทีละแถว เรียงกันไป) - ตรวจยอดรวมไม่เกิน
        // วงเงินงวดก่อนยิงจริง โดยแทนยอดของแถวที่แก้ด้วยยอดใหม่ทั้งหมดพร้อมกัน (ใช้
        // validateAndSaveReceive ทีละแถวไม่ได้ เพราะมันเทียบกับยอดเก่าของแถวอื่นที่ยังไม่บันทึก)
        function saveEditedItems(onDone) {
            var modified = draftGridStore.getModifiedRecords();
            if (!modified.length) {
                onDone();
                return;
            }
            var newAmtById = {};
            for (var i = 0; i < modified.length; i++) {
                var amt = modified[i].get("f_amt");
                if (Ext.isEmpty(amt) || isNaN(parseFloat(amt))) {
                    Ext.Msg.alert("แจ้งเตือน", "กรุณากรอกจำนวนเงินของรายการ " + (modified[i].get("c_receive_code") || ""));
                    return;
                }
                newAmtById[modified[i].get("id")] = parseFloat(amt);
            }
            var used = 0;
            Ext.storeDeliverMedSupReceive.each(function (r) {
                var id = r.get("id");
                used += newAmtById.hasOwnProperty(id) ? newAmtById[id] : (parseFloat(String(r.get("f_amt")).replace(/,/g, "")) || 0);
            });
            if (used - periodTotal > 0.01) {
                Ext.Msg.alert(
                    "แจ้งเตือน",
                    "จำนวนเงินรวมเกินวงเงินของงวดนี้<br>วงเงินงวดนี้: " + moneyStr(periodTotal) + " บาท"
                    + "<br>ยอดรวมหลังแก้ไข: " + moneyStr(used) + " บาท"
                );
                return;
            }
            var idx = 0;
            (function next() {
                if (idx >= modified.length) {
                    onDone();
                    return;
                }
                var r = modified[idx++];
                Ext.Ajax.request({
                    url: "tor/api/mnMedSupPeriodBillReceiveController.php",
                    method: "POST",
                    params: {
                        mode: "UPDATE",
                        sp_tor_period_bill_receive_id: r.get("id"),
                        sp_tor_period_bill_id: pid,
                        c_receive_code: r.get("c_receive_code"),
                        c_detail: r.get("c_detail"),
                        f_amt: r.get("f_amt"),
                        d_receive_date: r.get("d_receive_date"),
                        c_erp_stock_code: r.get("c_erp_stock_code"),
                    },
                    success: next,
                    failure: function () {
                        Ext.Msg.alert("แจ้งเตือน", "บันทึกรายการ " + (r.get("c_receive_code") || "") + " ไม่สำเร็จ");
                        Ext.storeDeliverMedSupReceive.reload();
                    }
                });
            })();
        }

        function saveDraft() {
            saveEditedItems(saveDraftValues);
        }

        function saveDraftValues() {
            Ext.Ajax.request({
                url: "tor/api/mnMedSupPeriodBillReceiveController.php",
                method: "POST",
                params: {
                    mode: "SAVE_VAT_DRAFT",
                    sp_tor_period_bill_id: pid,
                    sp_tor_period_bill_receive_id: receiveId,
                    f_total_vat: f_total_vatFld.getValue(),
                    b_vat: b_vatChk.getValue() ? 1 : 0,
                    f_vat_percent: f_vat_percentFld.getValue(),
                    b_wht: b_whtChk.getValue() ? 1 : 0,
                    f_wht_percent: f_wht_percentFld.getValue(),
                    f_penalty: f_penaltyFld.getValue(),
                    b_guarantee: b_guaranteeChk.getValue() ? 1 : 0,
                    f_guarantee_percent: f_guarantee_percentFld.getValue(),
                    f_other: f_otherFld.getValue(),
                    f_vat_amt: f_vat_amtFld.getValue(),
                    f_wht_amt: f_wht_amtFld.getValue(),
                },
                success: function (response) {
                    var res = Ext.decode(response.responseText);
                    if (res.reval === 0) {
                        Ext.storeDeliverMedSupReceive.reload();
                        win.destroy();
                    } else {
                        Ext.Msg.alert("แจ้งเตือน", res.msg || "บันทึกร่างไม่สำเร็จ");
                    }
                },
                failure: function () {
                    Ext.Msg.alert("แจ้งเตือน", "บันทึกร่างไม่สำเร็จ");
                }
            });
        }

        var win = new Ext.Window({
            title: (draftSrc ? "แก้ไขร่าง" : "กรอกร่าง") + " VAT / ภาษีหัก ณ ที่จ่าย - "
                + (receiveRec.get("c_receive_code") || "")
                + (receiveRec.get("c_ir_code") ? " (เลข IR " + receiveRec.get("c_ir_code") + ")" : " (ยังไม่ออกเลข IR)"),
            width: 720,
            height: 500,
            modal: true,
            layout: "border",
            closeAction: "destroy",
            items: [
                {
                    region: "north",
                    xtype: "editorgrid",
                    title: "รายการรับของ (คลิกที่ช่องเพื่อแก้ไข)",
                    height: 90,
                    border: true,
                    stripeRows: true,
                    clicksToEdit: 1,
                    store: draftGridStore,
                    viewConfig: {emptyText: "ไม่มีรายการ..", deferEmptyText: true},
                    columns: [
                        {header: "เลขที่ใบรับของ", dataIndex: "c_receive_code", width: 120, editor: new Ext.form.TextField({})},
                        {header: "เลขรับเข้าคลังของ ERP", dataIndex: "c_erp_stock_code", width: 150, editor: new Ext.form.TextField({})},
                        {header: "วันรับของ", dataIndex: "d_receive_date", width: 100, align: "center", editor: draftDateEditor},
                        {header: "รายละเอียด", dataIndex: "c_detail", width: 170, editor: new Ext.form.TextField({})},
                        {
                            header: "จำนวนเงิน", dataIndex: "f_amt", width: 100, align: "right",
                            editor: new Ext.form.NumberField({allowBlank: false, allowNegative: false}),
                            renderer: function (v) { return moneyStr(round2(parseFloat(v) || 0)); }
                        },
                    ],
                    listeners: {
                        validateedit: function (e) {
                            if (e.field === "d_receive_date") {
                                e.value = draftDateEditor.getRawValue();
                            }
                        },
                        afteredit: function (e) {
                            if (e.field === "f_amt") {
                                recalcTotalFromItems();
                            }
                        }
                    }
                },
                {
                    region: "center",
                    xtype: "form",
                    border: false,
                    bodyStyle: "padding:10px;",
                    autoScroll: true,
                    defaults: {labelWidth: 150, labelSeparator: ":"},
                    items: [
                        f_total_vatFld,
                        f_before_vatFld,
                        {
                            xtype: "compositefield",
                            fieldLabel: "ภาษีมูลค่าเพิ่ม",
                            items: [b_vatChk, f_vat_amtFld, {xtype: "displayfield", value: "(%)", width: 22}, f_vat_percentFld],
                        },
                        f_request_amtFld,
                        {
                            xtype: "compositefield",
                            fieldLabel: "ภาษีหัก ณ ที่จ่าย",
                            items: [b_whtChk, f_wht_amtFld, {xtype: "displayfield", value: "(%)", width: 22}, f_wht_percentFld],
                        },
                        f_penaltyFld,
                        {
                            xtype: "compositefield",
                            fieldLabel: "ค่าประกันผลงาน",
                            items: [b_guaranteeChk, f_guarantee_amtFld, {xtype: "displayfield", value: "(%)", width: 22}, f_guarantee_percentFld],
                        },
                        f_otherFld,
                        f_pay_amtFld,
                    ],
                }
            ],
            buttons: [
                {text: "บันทึกร่าง", iconCls: "icon-save", handler: saveDraft},
                {text: "ปิด", iconCls: "icon-clear", handler: function () { win.destroy(); }}
            ],
        });
        win.show();
        // ร่างที่มียอด VAT/หัก ณ ที่จ่ายบันทึกไว้แล้ว ใช้ยอดนั้นตรงๆ (อาจแก้เองหรือคงค่าเดิมไว้
        // ตอนแก้จำนวนเงินรายการ) ไม่คำนวณใหม่จาก % - ร่างเก่าที่ยังไม่มียอด คำนวณจาก % ตามเดิม
        // (ลำดับเดียวกับ acceptMedSup.js ตอนเติมค่าจาก medsup_checking_by_ir)
        var draftVatAmt = draftSrc ? draftSrc.get("draft_f_vat_amt") : "";
        var draftWhtAmt = draftSrc ? draftSrc.get("draft_f_wht_amt") : "";
        // ใช้ยอด VAT/หัก ณ ที่จ่ายที่บันทึกไว้ได้ก็ต่อเมื่อร่างนั้นยังตรงกับรายการปัจจุบัน (ถอด
        // VAT: ยอดรวม VAT ของร่าง ต้องเท่ากับจำนวนเงินรายการตอนนี้) - เจอจริง: บันทึกร่างไว้
        // แล้วแก้จำนวนเงินรายการจากหน้าต่างอื่น ยอดเก่าใช้ไม่ได้ ร่างที่ไม่ตรงให้ถอด VAT ใหม่จาก %
        var draftTotalNum = draftSrc ? round2(parseFloat(String(draftSrc.get("draft_f_total_vat")).replace(/,/g, "")) || 0) : 0;
        var draftMatchesItems = Math.abs(draftTotalNum - itemsSum()) < 0.005;
        if (draftVatAmt !== "" && draftVatAmt != null && draftMatchesItems) {
            f_vat_amtFld.setValue(draftVatAmt);
            f_total_vatFld.setValue(itemsSum());
            if (draftWhtAmt !== "" && draftWhtAmt != null) {
                f_wht_amtFld.setValue(draftWhtAmt);
                applyFinal();
            } else {
                recalcWhtFromPercent();
            }
        } else {
            recalcVatFromPercent();
        }
    }

    function saveReceiveRow() {
        // เพิ่มรายการใหม่ (ไม่ใช่แก้ไขของเดิม) เสร็จแล้ว เปิด popup ให้กรอกร่าง VAT/ภาษี
        // หัก ณ ที่จ่ายไว้ล่วงหน้าทันที (ยังออกเลข IR ไม่ได้ตอนนี้ - ดู winVatDraftPopup)
        var isAdd = !editingId;
        validateAndSaveReceive({
            id: editingId,
            code: addReceiveCodeFld.getValue(),
            date: addReceiveDateFld.getRawValue(),
            detail: addReceiveDetailFld.getValue(),
            amt: addReceiveAmtFld.getValue(),
            erpStockCode: addErpStockCodeFld.getValue(),
            onSuccess: function () {
                resetReceiveForm();
                Ext.storeDeliverMedSupReceive.reload({
                    callback: function () {
                        if (!isAdd) {
                            return;
                        }
                        // แถวที่เพิ่งเพิ่ม = id มากที่สุดของงวดนี้ (identity) - ADD ไม่ได้คืน id กลับมา
                        var newId = 0;
                        Ext.storeDeliverMedSupReceive.each(function (r) {
                            newId = Math.max(newId, parseInt(r.get("id"), 10) || 0);
                        });
                        if (newId) {
                            winVatDraftPopup(periodId, newId);
                        }
                    }
                });
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
        // เผลอติ๊กแถวสรุปที่ออกเลข IR ไปแล้วมาด้วย (isGroup:true) - แจ้งเตือนบอกเลข IR ที่
        // เคยออกไปแล้วตรงๆ ให้ user รู้ทันที แทนที่จะปล่อยให้ออกเลขซ้ำ/สับสน
        var alreadyIssued = [];
        selected.forEach(function (r) {
            if (r.get("isGroup")) {
                alreadyIssued.push(r.get("c_receive_code"));
            }
        });
        if (alreadyIssued.length) {
            Ext.Msg.alert(
                "แจ้งเตือน",
                "ไม่สามารถออกเลข IR ได้ เพราะมีรายการที่เลือกบางส่วนเคยออกเลข IR ไปแล้ว"
                    + "<br>เลข IR ที่เคยออกไปแล้ว: <b>" + alreadyIssued.join(", ") + "</b>"
                    + "<br>กรุณายกเลิกการติ๊กแถวดังกล่าวแล้วลองใหม่อีกครั้ง"
            );
            return;
        }
        var ids = selected.map(function (sel) { return sel.get("id"); });
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
                    success: function (response) {
                        // เซิร์ฟเวอร์ปฏิเสธได้ (เช่น เลือกรายการจากคนละหน่วยงานปนกัน) - ต้อง
                        // แจ้งข้อความให้เห็น ไม่ใช่รีโหลดเงียบๆ เหมือนออกเลขสำเร็จ
                        var res = Ext.decode(response.responseText);
                        if (res.reval !== 0) {
                            Ext.Msg.alert("แจ้งเตือน", res.msg || "ออกเลข IR ไม่สำเร็จ");
                        }
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
            fields: ["id", "c_receive_code", "d_receive_date", "c_detail", "f_amt", "c_erp_stock_code", "f_total_vat_row", "f_before_vat_row", "f_vat_row"],
            idProperty: "id",
            data: [],
        });

        function refreshGroupStore() {
            var rows = [];
            Ext.storeDeliverMedSupReceive.each(function (r) {
                if (r.get("c_ir_code") === irCode) {
                    // ยอดรวม VAT/ยอดก่อน VAT ของแต่ละรายการ (ร่าง VAT แยกรายการ - ดู rowVatMoney)
                    var m = rowVatMoney(r);
                    rows.push(Ext.apply({}, {f_total_vat_row: m.total, f_before_vat_row: m.before, f_vat_row: m.vat}, r.data));
                }
            });
            groupStore.loadData(rows);
            // ลบจนไม่เหลือรายการในกลุ่มนี้แล้ว - ปิดหน้าต่างนี้ไปเลยเพราะไม่มีอะไรให้ดู/แก้ต่อ
            if (!rows.length && win.rendered) {
                win.destroy();
            }
        }

        var groupEditingId = null;
        var groupCodeFld = new Ext.form.TextField({fieldLabel: "ใบแจ้งหนี้/รับของ", width: 110, emptyText: "ใบแจ้งหนี้/รับของ"});
        var groupDateFld = new Ext.form.DateField({fieldLabel: "วันรับของ", width: 100, emptyText: "วันรับของ"});
        var groupDetailFld = new Ext.form.TextField({fieldLabel: "รายละเอียด", width: 200, emptyText: "รายละเอียด"});
        var groupAmtFld = new Ext.form.NumberField({fieldLabel: "จำนวนเงิน", width: 90, emptyText: "จำนวนเงิน"});
        var groupErpStockCodeFld = new Ext.form.TextField({fieldLabel: "เลขรับเข้าคลังของ ERP", width: 140, emptyText: "เลขรับเข้าคลังของ ERP"});
        var groupSaveBtn = new Ext.Toolbar.Button({text: "บันทึกแก้ไข", iconCls: "icon-save-edit", hidden: true});
        var groupCancelBtn = new Ext.Toolbar.Button({text: "ยกเลิก", iconCls: "icon-clear", hidden: true});
        var groupEditBtn = new Ext.Toolbar.Button({text: "แก้ไขรายการที่เลือก", iconCls: "icon-save-edit", disabled: true});
        var groupDelBtn = new Ext.Toolbar.Button({text: "ลบรายการที่เลือก", iconCls: "icon-delete", disabled: true});
        // แก้ร่าง VAT/ภาษีของ "รายการที่เลือก" ในกลุ่ม IR นี้ ([ผู้ใช้ยืนยัน] เลือก IR-01 ขึ้น
        // VAT ของ IR-01 เท่านั้น) แก้ได้แม้บันทึกตรวจรับที่ ST00096 ไปแล้ว (หน้าตรวจรับล็อกไว้
        // แสดงอย่างเดียว) ฝั่ง PHP (SAVE_VAT_DRAFT) รวมยอดทั้ง IR ใหม่แล้วอัปเดตข้อมูลตรวจรับ
        // (sp_tor_period_bill_checking) ตามไปให้ด้วย
        // [ผู้ใช้ยืนยัน] IR ออกเลขตรวจรับ (AP) แล้ว = ล็อก: ปุ่มแก้ไข VAT/ลบรายการใช้ไม่ได้ (ไอคอน
        // กุญแจ) แก้ไขรายการได้เฉพาะเลขที่/วันที่/รายละเอียด (จำนวนเงินล็อก) - เซิร์ฟเวอร์เช็คซ้ำ
        var groupApLock = irApCode(irCode);
        groupAmtFld.setDisabled(!!groupApLock);
        var groupVatBtn = new Ext.Toolbar.Button({
            text: groupApLock ? "แก้ไข VAT (ล็อก)" : "แก้ไข VAT",
            iconCls: groupApLock ? "" : "icon-save-edit",
            icon: groupApLock ? "../images/icons/lock.png" : undefined,
            disabled: true,
            handler: function () {
                var record = groupSm.getSelected();
                if (record) {
                    winVatDraftPopup(periodId, record.get("id"));
                }
            }
        });

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
            groupErpStockCodeFld.setValue("");
            groupErpStockCodeFld.hide();
            groupSaveBtn.hide();
            groupCancelBtn.hide();
            groupEditBtn.show();
            groupEditBtn.setDisabled(!groupSm.hasSelection());
            groupDelBtn.show();
            groupDelBtn.setDisabled(!groupSm.hasSelection() || !!groupApLock);
            groupVatBtn.show();
            groupVatBtn.setDisabled(!groupSm.hasSelection() || !!groupApLock);
        }

        groupSm.on("selectionchange", function (sm) {
            if (groupSaveBtn.hidden === false) {
                // กำลังแก้ไขอยู่ (ฟอร์มโชว์อยู่) ไม่ต้องยุ่งกับสถานะปุ่มจากการเลือกแถว
                return;
            }
            var has = sm.hasSelection();
            groupEditBtn.setDisabled(!has);
            groupDelBtn.setDisabled(!has || !!groupApLock);
            groupVatBtn.setDisabled(!has || !!groupApLock);
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
            groupErpStockCodeFld.setValue(record.get("c_erp_stock_code"));
            groupErpStockCodeFld.show();
            groupSaveBtn.show();
            groupCancelBtn.show();
            groupEditBtn.hide();
            groupDelBtn.hide();
            groupVatBtn.hide();
        });
        groupCancelBtn.setHandler(resetGroupForm);
        groupSaveBtn.setHandler(function () {
            validateAndSaveReceive({
                id: groupEditingId,
                code: groupCodeFld.getValue(),
                date: groupDateFld.getRawValue(),
                detail: groupDetailFld.getValue(),
                amt: groupAmtFld.getValue(),
                erpStockCode: groupErpStockCodeFld.getValue(),
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
            title: "รายการย่อยของเลขที่ " + irCode
                + (groupApLock ? " &nbsp;<img src=\"../images/icons/lock.png\" style=\"vertical-align:middle;\"> ออกเลขตรวจรับ " + groupApLock
                    + " แล้ว - ล็อกแก้ไข VAT/จำนวนเงิน (แจ้ง ID ปลดล็อก: <b>" + irLockInfo(irCode).unlockId + "</b> ให้ผู้ดูแลระบบ)" : ""),
            width: 1100,
            height: 380,
            modal: true,
            layout: "fit",
            closeAction: "destroy",
            maximizable: true, // ปุ่มขยายเต็มจอ (เหมือนหน้าต่างรายละเอียดงวด)
            items: [
                {
                    xtype: "grid",
                    border: true,
                    stripeRows: true,
                    store: groupStore,
                    sm: groupSm,
                    viewConfig: {emptyText: "ไม่มีรายการ..", deferEmptyText: true},
                    columns: [
                        // ความกว้างพอให้หัวคอลัมน์ขึ้นครบ ไม่ถูกตัดเป็น "..." (ผู้ใช้ขอให้ชัดเจน)
                        {header: "ใบแจ้งหนี้/รับของ", dataIndex: "c_receive_code", width: 125},
                        {header: "เลขรับเข้าคลังของ ERP", dataIndex: "c_erp_stock_code", width: 165},
                        {header: "วันรับของ", dataIndex: "d_receive_date", width: 90, align: "center"},
                        {header: "รายละเอียด", dataIndex: "c_detail", width: 150},
                        {header: "จำนวนเงิน", dataIndex: "f_amt", width: 105, align: "right"},
                        // ลำดับตามที่ผู้ใช้ขอ: จำนวนเงิน -> รวม VAT -> ก่อน VAT -> ภาษีมูลค่าเพิ่ม
                        {
                            header: "จำนวนเงินรวม VAT", dataIndex: "f_total_vat_row", width: 145, align: "right",
                            renderer: function (v) { return moneyStr(v); }
                        },
                        {
                            header: "จำนวนเงินก่อน VAT", dataIndex: "f_before_vat_row", width: 145, align: "right",
                            renderer: function (v) { return moneyStr(v); }
                        },
                        {
                            header: "ภาษีมูลค่าเพิ่ม", dataIndex: "f_vat_row", width: 115, align: "right",
                            renderer: function (v) { return moneyStr(v); }
                        },
                    ],
                    tbar: [
                        groupEditBtn, " ", groupDelBtn, " ", groupVatBtn,
                        "-",
                        groupCodeFld, " ", groupErpStockCodeFld, " ",
                        groupDateFld, " ", groupDetailFld, " ", groupAmtFld, " ",
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

    // [ผู้ใช้ยืนยัน] หน้าต่าง "ยืนยันยอด" ของเลข IR (ลิงก์ท้ายแถว IR ในกริดหลัก) - ด้านบน
    // รายการย่อยทั้งหมดใน IR (dtl) พร้อมยอดรวม VAT/ก่อน VAT ของแต่ละรายการ ด้านล่างยอด VAT
    // ที่รวมทุกรายการแล้ว (เช่น 100 + 200 -> รวม VAT 321) กด "ยืนยันยอด" แล้วเซิร์ฟเวอร์
    // (mode CONFIRM_IR) เช็คว่าทุกรายการบันทึก VAT ถูกต้องแล้ว - ผ่าน = IR ไหลไปหน้าตรวจรับ
    // (ST00096) ไม่ผ่าน = แจ้งเตือนให้กลับไปแก้ VAT ของรายการที่ผิด (IR ไม่ขึ้นหน้าตรวจรับ)
    function winConfirmIr(irCode) {
        var confirmApLock = irApCode(irCode);
        var rows = [];
        var sum = {total: 0, before: 0, vat: 0, wht: 0, penalty: 0, other: 0};
        var hasProblem = false;
        var isConfirmed = true;
        Ext.storeDeliverMedSupReceive.each(function (r) {
            if (r.get("c_ir_code") !== irCode) {
                return;
            }
            var m = rowVatMoney(r);
            ["total", "before", "vat", "wht", "penalty", "other"].forEach(function (k) {
                sum[k] = round2(sum[k] + m[k]);
            });
            if (!m.confirmed) {
                hasProblem = true;
            }
            if (!parseInt(r.get("b_ir_confirm"), 10)) {
                isConfirmed = false;
            }
            rows.push(Ext.apply({}, {
                f_total_vat_row: m.total, f_before_vat_row: m.before, f_vat_row: m.vat,
                row_status: m.confirmed ? "" : "จำนวนเงินต้องมากกว่า 0",
            }, r.data));
        });
        if (!rows.length) {
            return;
        }
        // [ผู้ใช้ยืนยัน] จ่าย = ยอดรวม VAT - หัก ณ ที่จ่าย - ค่าปรับ - อื่นๆ (107 - 1 = 106)
        var payAmt = round2(sum.total - sum.wht - sum.penalty - sum.other);

        var confirmStore = new Ext.data.JsonStore({
            fields: ["id", "c_receive_code", "c_erp_stock_code", "d_receive_date", "c_detail", "f_amt",
                "f_total_vat_row", "f_before_vat_row", "f_vat_row", "row_status"],
            data: rows,
        });
        function moneyCol(header, dataIndex) {
            // กว้างพอให้หัวคอลัมน์ "จำนวนเงินรวม VAT"/"จำนวนเงินก่อน VAT" ขึ้นครบ ไม่ถูกตัด
            return {header: header, dataIndex: dataIndex, width: 140, align: "right", renderer: function (v) { return moneyStr(v); }};
        }
        function sumFld(label, v, style) {
            return {xtype: "displayfield", fieldLabel: label, value: moneyStr(v), style: style || ""};
        }

        var win = new Ext.Window({
            title: "ยืนยันยอด VAT ของเลข IR " + irCode,
            width: 1230,
            height: 520,
            modal: true,
            maximizable: true,
            layout: "border",
            closeAction: "destroy",
            items: [
                {
                    region: "north",
                    xtype: "grid",
                    title: "รายการย่อยในเลข IR " + irCode,
                    height: 200,
                    border: true,
                    stripeRows: true,
                    store: confirmStore,
                    viewConfig: {emptyText: "ไม่มีรายการ..", deferEmptyText: true},
                    columns: [
                        {header: "ใบแจ้งหนี้/รับของ", dataIndex: "c_receive_code", width: 125},
                        {header: "เลขรับเข้าคลังของ ERP", dataIndex: "c_erp_stock_code", width: 165},
                        {header: "วันรับของ", dataIndex: "d_receive_date", width: 90, align: "center"},
                        {header: "รายละเอียด", dataIndex: "c_detail", width: 130},
                        {header: "จำนวนเงิน", dataIndex: "f_amt", width: 105, align: "right"},
                        moneyCol("จำนวนเงินรวม VAT", "f_total_vat_row"),
                        moneyCol("จำนวนเงินก่อน VAT", "f_before_vat_row"),
                        moneyCol("ภาษีมูลค่าเพิ่ม", "f_vat_row"),
                        {
                            // รายการที่ VAT ยังไม่ถูกต้อง (ยืนยันไม่ผ่าน) แสดงสาเหตุเป็นตัวแดง
                            header: "สถานะ VAT", dataIndex: "row_status", width: 170,
                            renderer: function (v) {
                                return v ? "<span style=\"color:#c00;font-weight:bold;\">" + v + "</span>"
                                    : "<span style=\"color:#080;\">&#10004; ถูกต้อง</span>";
                            }
                        },
                    ],
                },
                {
                    region: "center",
                    xtype: "form",
                    border: false,
                    bodyStyle: "padding:10px;",
                    autoScroll: true,
                    labelWidth: 170,
                    title: "ยอด VAT รวมทุกรายการ",
                    items: [
                        {
                            xtype: "displayfield", hideLabel: true,
                            value: confirmApLock
                                ? "<span style=\"color:#666;font-weight:bold;\"><img src=\"../images/icons/lock.png\" style=\"vertical-align:middle;\"> "
                                    + lockMsg(irCode) + "</span>"
                                : hasProblem
                                ? "<span style=\"color:#c00;font-weight:bold;\">มีรายการที่ยอด VAT ยังไม่ถูกต้อง (ตัวแดงด้านบน) - กรุณากลับไปแก้ไข VAT ของรายการนั้นก่อน</span>"
                                : (isConfirmed ? "<span style=\"color:#080;font-weight:bold;\">&#10004; ยืนยันยอดแล้ว - รายการแสดงที่หน้าตรวจรับ (ST00096)</span>" : ""),
                        },
                        sumFld("จำนวนเงินรวม VAT", sum.total, "font-weight:bold;"),
                        sumFld("จำนวนเงินก่อน VAT", sum.before),
                        sumFld("ภาษีมูลค่าเพิ่ม", sum.vat, "color:#c00;font-weight:bold;"),
                        sumFld("จำนวนเงินขอเบิก", sum.total),
                        sumFld("ภาษีหัก ณ ที่จ่าย", sum.wht, "color:#c00;font-weight:bold;"),
                        sumFld("ค่าปรับ", sum.penalty),
                        sumFld("อื่นๆ", sum.other),
                        sumFld("จำนวนเงินที่จ่าย", payAmt, "font-weight:bold;font-size:14px;color:#060;"),
                    ],
                }
            ],
            buttons: [
                {
                    text: isConfirmed ? "ยืนยันยอดอีกครั้ง" : "ยืนยันยอด", iconCls: "icon-save",
                    hidden: !!confirmApLock, // ออกเลขตรวจรับแล้ว = ล็อก ดูยอดได้อย่างเดียว
                    handler: function () {
                        // เช็คฝั่ง client ก่อนเพื่อแจ้งทันที (เซิร์ฟเวอร์เช็คซ้ำเสมอใน CONFIRM_IR)
                        if (hasProblem) {
                            Ext.Msg.alert("แจ้งเตือน", "ยอด VAT คำนวณผิด / ยังไม่ถูกต้อง กรุณากลับไปแก้ไขรายการ"
                                + "<br>(รายการที่เป็นตัวแดงในตาราง - ดับเบิลคลิกเลข IR &gt; เลือกรายการ &gt; แก้ไข VAT &gt; บันทึกร่าง)");
                            return;
                        }
                        Ext.Msg.confirm(
                            "ยืนยันยอด",
                            "ยืนยันยอดเลข IR " + irCode + "<br>จำนวนเงินรวม VAT <b>" + moneyStr(sum.total) + "</b> บาท"
                                + "<br>ยืนยันแล้วรายการจะไปแสดงที่หน้าตรวจรับ (ST00096) ใช่หรือไม่?",
                            function (btn) {
                                if (btn !== "yes") {
                                    return;
                                }
                                Ext.Ajax.request({
                                    url: "tor/api/mnMedSupPeriodBillReceiveController.php",
                                    method: "POST",
                                    params: {mode: "CONFIRM_IR", c_ir_code: irCode},
                                    success: function (response) {
                                        var res = Ext.decode(response.responseText);
                                        if (res.reval === 0) {
                                            Ext.storeDeliverMedSupReceive.reload();
                                            win.destroy();
                                            Ext.Msg.alert("สำเร็จ", "ยืนยันยอดเลข IR " + irCode + " เรียบร้อยแล้ว<br>รายการจะแสดงที่หน้าตรวจรับ (ST00096)");
                                        } else {
                                            Ext.Msg.alert("แจ้งเตือน", res.msg || "ยืนยันยอดไม่สำเร็จ");
                                        }
                                    },
                                    failure: function () {
                                        Ext.Msg.alert("แจ้งเตือน", "ยืนยันยอดไม่สำเร็จ");
                                    }
                                });
                            }
                        );
                    }
                },
                {text: "ปิด", iconCls: "icon-clear", handler: function () { win.destroy(); }}
            ],
        });
        win.show();
    }

    new Ext.Window({
        id: "win-deliver-medsupID",
        title: "รายละเอียดงวดที่ " + rec.get("i_period") + " - เลขที่สัญญา " + rec.get("c_contract_code"),
        width: 1100,
        height: 640,
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
                        height: 320,
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
                            {id: "deliverMedSupContractCodeID", fieldLabel: "เลขสัญญา", value: ""},
                            {
                                id: "deliverMedSupDueDateID",
                                fieldLabel: "วันที่ครบกำหนดส่งของ",
                                labelWidth: 200,
                                labelStyle: "white-space:nowrap;",
                                value: "",
                            },
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
                            // ลิงก์ "แก้ไข VAT" ท้ายแถว (คอลัมน์สุดท้าย) - stopEvent กันไม่ให้
                            // href="#" เปลี่ยน hash ของหน้า (แอพนี้ใช้ hash เป็น routing เมนู)
                            cellclick: function (grid, rowIndex, colIndex, e) {
                                if (e.getTarget("a.edit-vat-draft")) {
                                    e.stopEvent();
                                    winVatDraftPopup(periodId, grid.getStore().getAt(rowIndex).get("id"));
                                } else if (e.getTarget("a.locked-ir")) {
                                    e.stopEvent();
                                    showUnlockId(grid.getStore().getAt(rowIndex).get("c_receive_code"));
                                } else if (e.getTarget("a.confirm-ir")) {
                                    e.stopEvent();
                                    winConfirmIr(grid.getStore().getAt(rowIndex).get("c_receive_code"));
                                }
                            },
                            // แถวสรุป (isGroup:true - ออกเลข IR รวมแล้ว) ดับเบิลคลิกเพื่อเปิด
                            // ดูรายการย่อยทั้งหมดที่ถูกรวมไว้ใต้เลข IR นั้น (แก้ไข/ลบได้จาก
                            // ในหน้าต่างนั้น) ส่วนแถวที่ยังไม่ได้ออกเลข ดับเบิลคลิกเพื่อเปิด
                            // popup "แก้ไข VAT" (แก้ได้ทั้งรายการรับของในกริดด้านบนของ popup
                            // และค่า VAT/ภาษี ในที่เดียว - เหมือนกดลิงก์ "แก้ไข VAT" ท้ายแถว)
                            rowdblclick: function (grid, rowIndex) {
                                var record = grid.getStore().getAt(rowIndex);
                                if (record.get("isGroup")) {
                                    winReceiveGroupDetail(record.get("c_receive_code"));
                                } else {
                                    winVatDraftPopup(periodId, record.get("id"));
                                }
                            }
                        },
                        tbar: [
                            {xtype: "tbtext", text: "เพิ่มรายการรับของ:"}, " ",
                            addReceiveCodeFld, " ", addErpStockCodeFld, " ",
                            addReceiveDateFld, " ", addReceiveDetailFld, " ", addReceiveAmtFld, " ",
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
        // [ผู้ใช้ยืนยัน] เมนูปลดล็อกเลข IR ที่ออกเลขตรวจรับ (AP) แล้ว - เฉพาะผู้ดูแลระบบ (ถาม
        // เซิร์ฟเวอร์ก่อนว่าเป็น admin ไหมถึงจะโชว์เมนู เซิร์ฟเวอร์เช็คสิทธิ์ซ้ำตอนปลดล็อกจริงเสมอ)
        // ใส่ "ID ปลดล็อก" ที่ผู้ใช้แจ้งมา (ขึ้นบนหน้าจอผู้ใช้ข้างไอคอนกุญแจ)
        Ext.Ajax.request({
            url: "tor/api/List_MedSupPeriodBill.php",
            method: "GET",
            params: {type: "medsup_whoami"},
            success: function (response) {
                var res = Ext.decode(response.responseText);
                if (!res || !res.is_admin) {
                    return;
                }
                Ext.medsupIsAdmin = true;
                menuList.addSeparator();
                menuList.add({text: "ปลดล็อกเลขตรวจรับ (Admin)", icon: "../images/icons/lock_open.png"})
                    .on("click", function () {
                        Ext.Msg.prompt("ปลดล็อกเลขตรวจรับ (Admin)", "ใส่ ID ปลดล็อกที่ผู้ใช้แจ้งมา", function (btn, text) {
                            if (btn !== "ok" || !String(text).trim()) {
                                return;
                            }
                            medsupUnlockAp(String(text).trim());
                        });
                    });
            }
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
                {header: "เลขงวด", dataIndex: "c_doc_ref", width: 160},
                {header: "วันที่ครบกำหนดส่งของ", dataIndex: "d_doc_dateSub", width: 100, align: "center"},
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
