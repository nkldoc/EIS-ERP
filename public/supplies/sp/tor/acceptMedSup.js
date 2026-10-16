/* global Ext, user_right_add, user_right_edit, user_right_delete */

// เมนู "ตรวจรับ (เวชภัณฑ์)" (ST00096) - คิวรอออกเลข AP ต่อจากเมนู "ส่งมอบงาน (เวชภัณฑ์)"
// (ST00095) ที่ออกเลข IR ไว้แล้ว อ่าน/เขียนตาราง sp_tor_period_bill_receive ตัวเดียวกัน
// 1 แถวในกริดหลัก = 1 เลข IR (รวมยอด/จำนวนรายการย่อยทุกแถวที่แชร์เลข IR เดียวกัน) แสดง
// ทั้งที่ยังไม่ออกเลข AP และออกไปแล้ว (ผู้ใช้ต้องการเห็นรายการที่ออกเลข AP ไปแล้วค้างอยู่
// ในหน้านี้ด้วย ไม่ให้หายไปจากคิว - ดู type=medsup_ir_pending_ap ใน List_MedSupPeriodBill.php)
// แก้ไข/ลบรายการย่อยดิบทำที่เมนู "ส่งมอบงาน (เวชภัณฑ์)" เท่านั้น เมนูนี้ทำได้แค่ดู
// รายละเอียด + ออกเลข AP

// Ext.floatRenderer (ตัว global ของระบบ) คืนค่า "" (ว่าง) เมื่อ value เป็น 0 (falsy) -
// ครอบอีกชั้นให้ขึ้น "0.00" แทนปล่อยว่างตอนแสดงยอดเงิน
function moneyStrAccept(v) {
    return Ext.floatRenderer(v) || "0.00";
}

// Ext.floatRenderer ตัดทศนิยมตำแหน่งที่ 3 เป็นต้นไปทิ้งเฉยๆ (ตัดปัด ไม่ใช่ปัดเศษ) ทำให้
// ค่าที่หารไม่ลงตัว เช่น 100/1.07=93.4579... แสดงผลผิดเป็น 93.45 ทั้งที่ปัดแบบ 5/4 ที่ถูก
// ต้องคือ 93.46 - ปัดเศษให้ถูกต้อง (round half up) เป็น 2 ตำแหน่งก่อนเสมอ ก่อนส่งเข้า
// moneyStrAccept ทุกครั้งที่เป็นยอดเงินที่คำนวณได้
// ห้ามใช้ Math.round(v * 100) / 100 (แม้บวก Number.EPSILON แล้ว) - floating point ทำให้ปัด
// ลงผิดที่ .xx5 จริง เช่น 64.50 x 7% = 4.515 -> ได้ 4.51 (ที่ถูกคือ 4.52) ตัดเศษ float ทิ้ง
// ด้วย toPrecision(12) ก่อน แล้วเลื่อนทศนิยมผ่านสตริง "e2"/"e-2" - สูตรเดียวกับ round2 ใน
// deliverWorkMedSup.js และ round() ของ PHP ฝั่ง SAVE_CHECKING
function round2Accept(v) {
    var n = Number(Number(v).toPrecision(12));
    if (!isFinite(n) || Math.abs(n) < 0.000001) {
        return 0;
    }
    var sign = n < 0 ? -1 : 1;
    return sign * Number(Math.round(Number(Math.abs(n) + "e2")) + "e-2");
}

// คัดลอกข้อความไปคลิปบอร์ด - ใช้ Clipboard API สมัยใหม่ก่อน ถ้าใช้ไม่ได้ (เช่นเปิดผ่าน
// http ไม่ใช่ https/localhost) fallback เป็นวิธี textarea + execCommand แบบเดิม
Ext.fnCopyToClipboard = function (text) {
    if (!text) {
        return;
    }
    function fallbackCopy() {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        try {
            document.execCommand("copy");
        } catch (e) {
            // เงียบไว้ - ไม่มีอะไรทำต่อได้ถ้าเบราว์เซอร์ไม่รองรับจริงๆ
        }
        document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
            Ext.example && Ext.example.msg ? Ext.example.msg("คัดลอกแล้ว", text) : null;
        }, fallbackCopy);
    } else {
        fallbackCopy();
    }
};

Ext.storeAcceptMedSupList = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "tor/api/List_MedSupPeriodBill.php",
    baseParams: {type: "medsup_ir_pending_ap"},
    root: "data",
    idProperty: "id",
    totalProperty: "totalCount",
    fields: [
        "id", "c_ir_code", "sp_tor_period_bill_id", "c_contract_code", "c_project_name", "c_expense_name",
        "i_period", "i_budget_year", "c_ap_dept_type", "n_lines", "c_detail", "f_total_amt", "d_receive_date_last", "d_ir_issue",
        "c_create_name", "c_ap_code", "d_ap_issue", "i_checking_ready",
        "c_overlap", "i_budget_year_overlap", "c_overlap2", "i_budget_year_overlap2", "c_overlap3", "i_budget_year_overlap3",
    ],
});

Ext.storeAcceptMedSupDtl = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "tor/api/List_MedSupPeriodBill.php",
    baseParams: {type: "medsup_receive_by_ir"},
    root: "data",
    idProperty: "id",
    fields: ["id", "c_receive_code", "d_receive_date", "c_detail", "f_amt"],
});

// หน่วยงาน (dc_cost) - ตัวเลือกเดียวกับที่ใช้ทั่วทั้งระบบ (โหลดจาก endpoint กลาง
// api/All_PoWorkingImpHdr.php type=dc_cost) ใช้กับ "หน่วยงานผู้รับผิดชอบ"/
// "หน่วยงานเจ้าของเรื่อง" ในฟอร์มรายละเอียดตรวจรับ
Ext.dc_cost = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: {type: "dc_cost"},
    root: "data",
    idProperty: "id",
    fields: ["id", "c_code", "c_name"],
});

// ชื่อค่าใช้จ่าย (bg_expense) - master list เดียวกับที่ใช้ทั่วทั้งระบบ (เช่น
// medSupPeriodBill.js) ใช้หา "รายการย่อย" จาก bg_expense_id ของใบกันเหลื่อมที่เลือก
// ตอนผู้ใช้เปลี่ยน "เลขที่ใบกันเหลื่อม" ในหน้าตรวจรับ
Ext.storePoExpenseAccept = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: {type: "po_expense"},
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
});

// แหล่งเงิน (dc_expense_budget_type) - master list เดียวกับที่ใช้ทั่วทั้งระบบ (เช่น
// medSupPeriodBill.js ตอนบันทึกรายละเอียดสัญญา) ใช้กับตัวกรอง "แหล่งเงิน" ในแถบค้นหา
// ให้เลือกได้ทุกแหล่งเงิน ไม่ใช่แค่แหล่งที่เคยมีรายการเข้ามาแล้วในคิวนี้
Ext.storeExpenseBudgetTypeAccept = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: {type: "dc_expense_budget_type"},
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
});

// รายการปีงบประมาณ (พ.ศ.) สำหรับ dropdown - ช่วงเดียวกับ Ext.yearThPeriodBill() ใน
// medSupPeriodBill.js (ปีปัจจุบัน-3 ถึง ปีปัจจุบัน+1) ใช้กับตัวกรอง "ปีงบประมาณ"/
// "ปีที่ใช้ประมาณ" ให้เลือกได้ทุกปีในช่วงที่ระบบใช้งานจริง ไม่ใช่แค่ปีที่เคยมีรายการ
function yearThAccept() {
    var years = [];
    var now = new Date().getFullYear() + 1;
    var y = new Date().getFullYear() - 3;
    while (y <= now) {
        years.push(y + 543);
        y++;
    }
    return years;
}

// เมนูนี้ทั้งหน้าเป็นของฝ่ายเวชภัณฑ์การแพทย์โดยเฉพาะ (dc_cost_id=82) เหมือนเมนู
// "บันทึกรายละเอียดในสัญญา (เวชภัณฑ์)"/"ส่งมอบงาน (เวชภัณฑ์)" - ใช้ค่านี้เป็นค่า
// เริ่มต้นของ "หน่วยงานเจ้าของเรื่อง" เสมอ
var MEDSUP_DC_COST_ID = 82;

// หน้าต่างดูรายละเอียดรายการย่อยจริงภายใต้เลข IR หนึ่งๆ (อ่านอย่างเดียว - แก้ไข/ลบทำที่
// เมนู "ส่งมอบงาน (เวชภัณฑ์)" เท่านั้น)
function winAcceptMedSupDetail(rec) {
    Ext.storeAcceptMedSupDtl.setBaseParam("c_ir_code", rec.get("c_ir_code"));
    Ext.storeAcceptMedSupDtl.load();

    var win = new Ext.Window({
        title: "รายการย่อยของเลขที่ IR " + rec.get("c_ir_code") + " - เลขที่สัญญา " + rec.get("c_contract_code"),
        width: 620,
        height: 400,
        modal: true,
        layout: "fit",
        closeAction: "destroy",
        items: [
            {
                xtype: "grid",
                border: true,
                stripeRows: true,
                loadMask: true,
                store: Ext.storeAcceptMedSupDtl,
                viewConfig: {emptyText: "ไม่มีรายการ..", deferEmptyText: true},
                columns: [
                    new Ext.grid.RowNumberer({header: "ที่", width: 40}),
                    {header: "เลขที่รับของ", dataIndex: "c_receive_code", width: 120},
                    {header: "วันรับของ", dataIndex: "d_receive_date", width: 100, align: "center"},
                    {header: "รายละเอียด", dataIndex: "c_detail", width: 200},
                    {header: "จำนวนเงิน", dataIndex: "f_amt", width: 100, align: "right"},
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
    });
    win.show();
}

// ฟอร์ม "รายละเอียดตรวจรับ" ของเลข IR หนึ่งๆ - เลียนแบบฟิลด์ของเมนู "ตรวจรับ
// พัสดุ/ครุภัณฑ์" (ST0013 - checking.js) เฉพาะที่ต้องการ ไม่ผูก GL/ตัดงบจริงเหมือน
// ต้นฉบับ เปิดเป็นแท็บเต็มจอ (เพิ่มเข้า contenterCenter ตรงๆ ไม่ใช่ modal window)
// ตามที่ขอ - ต้องกรอก "รายการส่งเบิก" ให้ครบก่อนถึงจะออกเลข AP ให้เลข IR นี้ได้
// (บังคับจริงฝั่งเซิร์ฟเวอร์ที่ mode SAVE_CHECKING/ISSUE_AP)
function winCheckingDetailTab(rec) {
    var tabId = "checkingTab-" + rec.get("c_ir_code");
    var center = Ext.getCmp("contenterCenter");
    var existingTab = Ext.getCmp(tabId);
    if (existingTab) {
        center.setActiveTab(existingTab);
        return;
    }

    var periodTotal = parseFloat(String(rec.get("f_total_amt")).replace(/,/g, "")) || 0;

    // เช็คว่างวดนี้บันทึกเป็น "กันเหลื่อมปี" ไว้หรือไม่ (สูงสุด 3 แหล่งเงิน เอาแหล่งแรก
    // ที่มีค่า) - ถ้าใช่ ต้องโชว์เลขที่ใบกันเหลื่อมและเปลี่ยนปีงบประมาณที่ใช้ให้ตรงกับ
    // ที่บันทึกไว้จริงตอน "บันทึกรายละเอียดในสัญญา (เวชภัณฑ์)" ไม่ใช่ปีงบประมาณปัจจุบัน
    var overlapCode = rec.get("c_overlap") || rec.get("c_overlap2") || rec.get("c_overlap3") || "";
    var overlapYear = rec.get("c_overlap") ? rec.get("i_budget_year_overlap")
        : rec.get("c_overlap2") ? rec.get("i_budget_year_overlap2")
        : rec.get("c_overlap3") ? rec.get("i_budget_year_overlap3") : "";
    var isOverlap = !!overlapCode;

    // ความกว้างฟอร์มทั้งหมด (FORM_WIDTH) ตายตัว แทนการใช้ anchor แบบ % ล้วน - กันปัญหาที่
    // เจอจริง: compositefield (checkbox+ยอดคำนวณ+% ) ไม่ได้กำหนดความกว้างของแต่ละช่อง
    // ครบทุกช่อง ทำให้ความกว้างรวมของแถวเกินพื้นที่จริงของแท็บ ผลคือฟอร์มกว้างเกิน
    // จนต้องเลื่อนแนวนอนไปดู กลายเป็นป้ายชื่อฟิลด์ (label) หลุดจอไปทางซ้าย มองไม่เห็น
    var FORM_WIDTH = 1000;
    var AMT_WIDTH = 100;

    // "รายละเอียดเงิน" ทั้งหมดแก้ไขที่หน้านี้ไม่ได้ (ผู้ใช้ยืนยัน) - ค่าเริ่มต้นดึงจาก "ร่าง
    // VAT" ที่กรอกไว้ที่หน้าส่งมอบงาน (ST00095 ปุ่ม "แก้ไข VAT") มาตรงๆ ผ่าน
    // medsup_checking_by_ir (ดูตอนโหลดท้ายฟังก์ชัน) จะแก้ยอดต้องกลับไปแก้ที่หน้าส่งมอบงาน
    // ช่องทั้งหมดยังเป็น NumberField/Checkbox เดิม (saveChecking อ่านค่าส่งไปบันทึกเหมือนเดิม)
    // แค่ล็อกไม่ให้พิมพ์/ติ๊ก
    var RO_STYLE = "background:#f0f0f0;";
    var f_total_vatFld = new Ext.form.NumberField({fieldLabel: "จำนวนเงินรวม VAT", width: 200, value: 0, readOnly: true, style: RO_STYLE});
    var f_before_vatFld = new Ext.form.DisplayField({fieldLabel: "จำนวนเงินก่อน VAT", width: 200, value: "0.00"});
    var b_vatChk = new Ext.form.Checkbox({boxLabel: "", width: 22, checked: true, disabled: true});
    var f_vat_amtFld = new Ext.form.NumberField({width: AMT_WIDTH, value: "0.00", readOnly: true, style: RO_STYLE + "font-weight:bold;color:#c00;"});
    var f_vat_percentFld = new Ext.form.NumberField({width: 45, value: 7, readOnly: true, style: RO_STYLE});
    var f_request_amtFld = new Ext.form.DisplayField({fieldLabel: "จำนวนเงินขอเบิก", width: 200, value: "0.00"});
    var b_whtChk = new Ext.form.Checkbox({boxLabel: "", width: 22, checked: true, disabled: true});
    var f_wht_amtFld = new Ext.form.NumberField({width: AMT_WIDTH, value: "0.00", readOnly: true, style: RO_STYLE + "font-weight:bold;color:#c00;"});
    var f_wht_percentFld = new Ext.form.NumberField({width: 45, value: 1, readOnly: true, style: RO_STYLE});
    var f_penaltyFld = new Ext.form.NumberField({fieldLabel: "ค่าปรับ", width: 200, value: 0, readOnly: true, style: RO_STYLE});
    var b_guaranteeChk = new Ext.form.Checkbox({boxLabel: "", width: 22, checked: false, disabled: true});
    var f_guarantee_amtFld = new Ext.form.DisplayField({width: AMT_WIDTH, value: "0.00", style: "font-weight:bold;color:#c00;"});
    var f_guarantee_percentFld = new Ext.form.NumberField({width: 45, value: 0, readOnly: true, style: RO_STYLE});
    var f_otherFld = new Ext.form.NumberField({fieldLabel: "อื่นๆ", width: 200, value: 0, readOnly: true, style: RO_STYLE});
    // แจ้งที่มาของยอดเงิน (เปลี่ยนข้อความตามผลโหลดท้ายฟังก์ชัน)
    var moneySourceFld = new Ext.form.DisplayField({
        hideLabel: true, width: 380,
        value: "ยอดเงินดึงจากหน้าส่งมอบงาน (ST00095) - แก้ไขได้ที่ปุ่ม \"แก้ไข VAT\" หน้าส่งมอบงาน",
        style: "color:#08c;"
    });
    var f_pay_amtFld = new Ext.form.DisplayField({fieldLabel: "จำนวนเงินที่จ่าย", width: 200, value: "0.00", style: "font-weight:bold;font-size:14px;color:#060;"});

    // คำนวณยอดใหม่ทุกครั้งที่แก้ตัวเลข/ติ๊ก checkbox - ใช้แสดงผลให้ผู้ใช้เห็นก่อนบันทึก
    // เท่านั้น ยอดจริงที่เก็บลง DB คำนวณซ้ำอีกทีฝั่งเซิร์ฟเวอร์เสมอ (ดู mode SAVE_CHECKING)
    // ตัวเลขที่กรอกในช่อง "จำนวนเงินรวม VAT" คือยอดรวม (grand total) ที่รวม VAT ไว้แล้วจริงๆ
    // - หักลบย้อนกลับหา "ยอดก่อน VAT" ด้วยการหาร (เช่น กรอก 107 VAT 7% ต้องได้ยอดก่อน VAT
    // = 107/1.07 = 100.00 พอดี, VAT = 107-100 = 7.00 พอดี) ภาษีหัก ณ ที่จ่าย/ค่าประกัน
    // ผลงาน คิดจาก "ยอดก่อน VAT" ที่หักลบมาแล้วนี้ (ไม่ใช่จากยอดรวม) ตามธรรมเนียมการหัก
    // ภาษี ณ ที่จ่ายทั่วไป - สูตรเดียวกับหน้า "ตรวจรับ" ต้นแบบ ST0013 "จำนวนเงินที่จ่าย"
    // หักจาก "ยอดก่อน VAT" ไม่ใช่ยอดรวม (VAT จ่ายแยกต่างหาก ไม่รวมอยู่ในยอดที่จ่ายจริงให้
    // ผู้ขาย ตามที่ผู้ใช้ยืนยัน) = ยอดก่อน VAT - หัก ณ ที่จ่าย - ค่าปรับ - ค่าประกันผลงาน -
    // อื่นๆ
    //
    // ยอด VAT (f_vat_amtFld) และยอดหัก ณ ที่จ่าย (f_wht_amtFld) แก้ไขเองได้ทั้งคู่ - ยอด
    // ที่เหลือทั้งหมดจึงต้องคำนวณต่อจาก "ค่าปัจจุบันในฟิลด์" เสมอ (ไม่ว่าจะมาจากสูตร
    // อัตโนมัติหรือ user แก้เอง) แยกเป็น 3 ชั้น: recalcVatFromPercent() คำนวณ VAT ใหม่จาก
    // % (เรียกเมื่อยอดรวม/%VAT เปลี่ยน) -> recalcWhtFromPercent() คำนวณ ณ ที่จ่ายใหม่จาก %
    // โดยอิง "ยอดก่อน VAT" ปัจจุบัน (เรียกเมื่อยอด VAT เปลี่ยนด้วย เผื่อยอดก่อน VAT เปลี่ยน
    // ตาม หรือ %หัก ณ ที่จ่ายเปลี่ยนเอง) -> applyFinal() คำนวณยอดที่เหลือทั้งหมดจากค่า
    // ปัจจุบันในทุกฟิลด์ (setValue ไม่ยิง event "change" เองใน ExtJS 3 จึงต้องเรียก
    // ฟังก์ชันต่อกันตรงๆ ไม่พึ่ง event chain)
    function applyFinal() {
        var total = round2Accept(parseFloat(String(f_total_vatFld.getValue()).replace(/,/g, "")) || 0);
        var vatAmt = round2Accept(parseFloat(String(f_vat_amtFld.getValue()).replace(/,/g, "")) || 0);
        var beforeVat = round2Accept(total - vatAmt);
        var whtAmt = round2Accept(parseFloat(String(f_wht_amtFld.getValue()).replace(/,/g, "")) || 0);
        var guaranteePercent = b_guaranteeChk.getValue() ? (parseFloat(f_guarantee_percentFld.getValue()) || 0) : 0;
        var guaranteeAmt = b_guaranteeChk.getValue() ? round2Accept(beforeVat * guaranteePercent / 100) : 0;
        var penalty = parseFloat(String(f_penaltyFld.getValue()).replace(/,/g, "")) || 0;
        var other = parseFloat(String(f_otherFld.getValue()).replace(/,/g, "")) || 0;
        // [ผู้ใช้ยืนยัน] จ่าย = ยอดรวม VAT - หัก ณ ที่จ่าย - ค่าปรับ - ค่าประกันผลงาน - อื่นๆ
        // (ถอด VAT: 107 -> 107 - 1 = 106) สูตรเดียวกับหน้าส่งมอบงานและ SAVE_CHECKING
        var payAmt = round2Accept(total - whtAmt - penalty - guaranteeAmt - other);

        f_before_vatFld.setValue(moneyStrAccept(beforeVat));
        f_request_amtFld.setValue(moneyStrAccept(total));
        f_guarantee_amtFld.setValue(moneyStrAccept(guaranteeAmt));
        f_pay_amtFld.setValue(moneyStrAccept(payAmt));
    }
    function recalcWhtFromPercent() {
        var total = round2Accept(parseFloat(String(f_total_vatFld.getValue()).replace(/,/g, "")) || 0);
        var vatAmt = round2Accept(parseFloat(String(f_vat_amtFld.getValue()).replace(/,/g, "")) || 0);
        var beforeVat = round2Accept(total - vatAmt);
        var whtPercent = b_whtChk.getValue() ? (parseFloat(f_wht_percentFld.getValue()) || 0) : 0;
        var whtAmt = b_whtChk.getValue() ? round2Accept(beforeVat * whtPercent / 100) : 0;
        f_wht_amtFld.setValue(moneyStrAccept(whtAmt));
        applyFinal();
    }
    function recalcVatFromPercent() {
        var total = round2Accept(parseFloat(String(f_total_vatFld.getValue()).replace(/,/g, "")) || 0);
        var vatPercent = b_vatChk.getValue() ? (parseFloat(f_vat_percentFld.getValue()) || 0) : 0;
        var beforeVat = vatPercent > 0 ? total / (1 + vatPercent / 100) : total;
        var vatAmt = round2Accept(total - beforeVat);
        f_vat_amtFld.setValue(moneyStrAccept(vatAmt));
        recalcWhtFromPercent();
    }
    [f_total_vatFld, f_vat_percentFld].forEach(function (fld) {
        fld.on("change", recalcVatFromPercent);
    });
    b_vatChk.on("check", recalcVatFromPercent);
    f_vat_amtFld.on("change", recalcWhtFromPercent);
    f_wht_percentFld.on("change", recalcWhtFromPercent);
    b_whtChk.on("check", recalcWhtFromPercent);
    f_wht_amtFld.on("change", applyFinal);
    [f_penaltyFld, f_guarantee_percentFld, f_otherFld].forEach(function (fld) {
        fld.on("change", applyFinal);
    });
    b_guaranteeChk.on("check", applyFinal);

    // ยังไม่เคยกรอกร่าง VAT ที่หน้าส่งมอบงานเลย - คิดค่าเริ่มต้นแบบเดียวกับ popup ร่างที่
    // ST00095: ยอดก่อน VAT = ยอดรวมรายการรับของของ IR นี้ (periodTotal), VAT/หัก ณ ที่จ่าย
    // = % ของยอดก่อน VAT, ยอดรวม VAT = ก่อน VAT + VAT (คิดไปข้างหน้า ไม่หารย้อนกลับ)
    // [ผู้ใช้ยืนยัน] "ถอด VAT" - ยอดรายการรับของ (periodTotal) = ยอดรวม VAT แล้ว: ก่อน VAT =
    // ยอดรวม/(1+%VAT), หัก ณ ที่จ่าย = % ของยอดก่อน VAT (สูตรเดียวกับ ST00095/medsupRowMoney)
    function defaultFromItems(msg) {
        f_total_vatFld.setValue(round2Accept(periodTotal));
        recalcVatFromPercent();
        moneySourceFld.setValue(msg || "ยังไม่ได้กรอกร่าง VAT ที่หน้าส่งมอบงาน (ST00095) - ใช้ค่าเริ่มต้น VAT 7% / หัก ณ ที่จ่าย 1%");
    }
    // ค่าเงินจาก API ถูก number_format มา (มีจุลภาค เช่น "1,070.00") - NumberField ใช้
    // parseFloat ซึ่งอ่านได้แค่ 1 ต้องตัดจุลภาคออกก่อนเสมอ
    function numStr(v) {
        return String(v == null ? "" : v).replace(/,/g, "");
    }

    var d_doc_completeFld = new Ext.form.DateField({fieldLabel: "วันที่รับของเอกสารสมบูรณ์", width: 200});
    var d_checkingFld = new Ext.form.DateField({fieldLabel: "วันที่บันทึกการตรวจรับ", width: 200, allowBlank: false});
    var c_egp_noFld = new Ext.form.TextField({fieldLabel: "เลขที่ EGP", width: 200, allowBlank: false});
    var c_disburse_detailFld = new Ext.form.TextArea({
        fieldLabel: "รายการส่งเบิก",
        width: 420,
        height: 60,
        allowBlank: false,
    });
    // "ใช้เงินปีงบประมาณ" ต้องเป็น dropdown ให้เลือก (เหมือนหน้า ST0013 ต้นแบบ) ไม่ใช่
    // กล่องพิมพ์ตัวเลขเฉยๆ - ใช้ช่วงปีเดียวกับตัวกรอง "ปีงบประมาณ" ในแถบค้นหา
    var i_budget_year_useData = [];
    yearThAccept().forEach(function (y) { i_budget_year_useData.push([y, y]); });
    var i_budget_year_useFld = new Ext.form.ComboBox({
        fieldLabel: "ใช้เงินปีงบประมาณ", width: 200,
        mode: "local", triggerAction: "all", forceSelection: true, editable: false,
        store: new Ext.data.ArrayStore({fields: ["v", "t"], data: i_budget_year_useData}),
        valueField: "v", displayField: "t",
        value: isOverlap ? overlapYear : rec.get("i_budget_year"),
    });
    // 3 ฟิลด์นี้เดิมเป็นแค่ displayfield อ่านจากสัญญาต้นทาง (rec) เฉยๆ - ผู้ใช้ระบุว่า
    // ต้องแก้ไขได้ในฟอร์มนี้โดยเฉพาะ จึงเปลี่ยนเป็นฟิลด์แก้ไขได้จริง ค่าเริ่มต้นยังดึงจาก
    // สัญญาต้นทางเหมือนเดิม แต่ถ้าแก้แล้วบันทึกจะเก็บค่าที่แก้แยกไว้ในตาราง sp_tor_period_
    // bill_checking เอง (ดู mode SAVE_CHECKING)
    // เงินกันเงินเหลื่อมปี (bg_overlap_hdr) ของหน่วยงานเวชภัณฑ์ - endpoint/query เดียวกับที่
    // เมนู "บันทึกรายละเอียดในสัญญา (เวชภัณฑ์)" (medSupPeriodBill.js) ใช้ตอนผู้ใช้เลือก
    // เลขที่ใบกันเหลื่อมครั้งแรก เป็น store แยกต่อแท็บ (ไม่ใช้ store กลางร่วมกัน) เพราะ
    // แต่ละแท็บที่เปิดพร้อมกันอาจเป็นคนละปีงบประมาณกันเหลื่อม ใช้ store กลางจะโหลดทับกัน
    // ข้ามแท็บได้
    var storeOverlapBookingAccept = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: false,
        url: "api/All_PoWorkingImpHdr.php",
        baseParams: {type: "booking_store"},
        root: "data",
        idProperty: "id",
        fields: ["id", "c_booking", "i_year", "dc_cost_id", "bg_expense_id", "dc_expense_budget_type_id", "f_total"],
    });
    var c_overlap_noFld = new Ext.form.ComboBox({
        fieldLabel: "เลขที่ใบกันเหลื่อม", width: 200,
        store: storeOverlapBookingAccept, mode: "local",
        valueField: "c_booking", displayField: "c_booking",
        triggerAction: "all", forceSelection: true, typeAhead: false,
        emptyText: "กรุณาเลือกเลขที่ใบกันเหลื่อม...",
        value: overlapCode,
        listeners: {
            // ผู้ใช้เลือกใบกันเหลื่อม "ใบอื่น" (แก้ของเดิมที่เลือกผิดมา) - เติม "รายการ
            // ย่อย"/"หน่วยงานผู้รับผิดชอบ"/"หน่วยงานเจ้าของเรื่อง" ให้ตรงกับใบกันเหลื่อม
            // ใบใหม่ที่เลือกให้อัตโนมัติทันที (bg_expense_id/dc_cost_id ติดมากับใบกัน
            // เหลื่อมแต่ละใบอยู่แล้วจาก storeOverlapBookingAccept) - ผู้ใช้ยืนยันว่าทั้ง
            // 3 ช่องนี้ต้องเปลี่ยนตามใบกันเหลื่อมที่เลือกเสมอ ไม่ใช่แค่บางช่อง
            select: function (cmb, record) {
                var expenseIdx = Ext.storePoExpenseAccept.findExact("id", record.get("bg_expense_id"));
                var expenseRec = expenseIdx > -1 ? Ext.storePoExpenseAccept.getAt(expenseIdx) : null;
                if (expenseRec) {
                    c_item_nameFld.setValue(expenseRec.get("c_name"));
                }
                var newDcCostId = record.get("dc_cost_id");
                if (newDcCostId) {
                    dc_cost_responsible_idFld.setValue(newDcCostId);
                    dc_cost_owner_idFld.setValue(newDcCostId);
                }
            }
        }
    });
    // โหลดรายการใบกันเหลื่อมของหน่วยงานเวชภัณฑ์ตามปีงบประมาณกันเหลื่อมที่บันทึกไว้จริง
    // (overlapYear) มาให้เลือกใน dropdown - โหลดเฉพาะตอนงวดนี้เป็นกันเหลื่อมปีเท่านั้น
    // ส่ง b_include_all=1 เพราะมาถึงหน้านี้ใบกันเหลื่อมมักถูกใช้ไปแล้ว (วงเงินคงเหลือ = 0)
    // และ/หรือหมดอายุไปแล้ว - ถ้ากรองแบบเดียวกับตอนจองเงินใหม่ (วงเงินเหลือ>0/ยังไม่หมด
    // อายุ) รายการที่ถูกต้องจะหายไปจาก list จนแก้ไม่ได้ ต้องการเห็นทุกใบของหน่วยงาน/ปีนี้
    // ไม่ว่าจะใช้ไปแล้วหรือหมดอายุหรือไม่ก็ตาม
    // overlapYear ที่ได้จาก rec (List_MedSupPeriodBill.php) ถูกแปลงเป็น พ.ศ. แล้ว (+543)
    // แต่คอลัมน์ i_year ใน vw_bg_budget_overlap ที่ endpoint นี้ query เก็บเป็น ค.ศ. ดิบ
    // (แบบเดียวกับที่ endpoint type=storeOverlap ใน api/All.php ต้อง +543 ตอนส่งออกเช่น
    // กัน) ต้องแปลงกลับเป็น ค.ศ. ก่อนส่งไปเป็น i_yyyy_overlap ไม่งั้นเทียบปีไม่ตรงกันเลย
    // สักปี ได้ผลลัพธ์ว่างเปล่าเสมอ (ต้นเหตุที่ dropdown นี้ไม่เคยมีรายการให้เลือก)
    if (isOverlap) {
        var overlapReqParams = {dc_cost_id: MEDSUP_DC_COST_ID, i_yyyy_overlap: overlapYear - 543, b_include_all: 1};
        console.log("โหลดใบกันเหลื่อม (ตรวจรับ) params =", overlapReqParams);
        storeOverlapBookingAccept.load({
            params: overlapReqParams,
            callback: function (records, options, success) {
                console.log("โหลดใบกันเหลื่อม (ตรวจรับ) success =", success, "จำนวน =", records ? records.length : 0, records);
                if (success && (!records || records.length === 0)) {
                    Ext.Msg.alert("แจ้งเตือน", "ไม่พบใบกันเหลื่อมของหน่วยงานนี้ (dc_cost_id=" + overlapReqParams.dc_cost_id + ") สำหรับปีงบประมาณ " + overlapReqParams.i_yyyy_overlap);
                } else if (!success) {
                    Ext.Msg.alert("แจ้งเตือน", "ดึงรายการใบกันเหลื่อมไม่สำเร็จ กรุณาเปิด console เพื่อดูรายละเอียด");
                }
            }
        });
    }
    var i_budget_year_refData = [];
    yearThAccept().forEach(function (y) { i_budget_year_refData.push([y, y]); });
    var i_budget_year_refFld = new Ext.form.ComboBox({
        fieldLabel: "ปีงบประมาณ", width: 200,
        mode: "local", triggerAction: "all", forceSelection: true, editable: false,
        store: new Ext.data.ArrayStore({fields: ["v", "t"], data: i_budget_year_refData}),
        valueField: "v", displayField: "t",
        value: rec.get("i_budget_year"),
    });
    var c_item_nameFld = new Ext.form.TextField({fieldLabel: "รายการย่อย", width: 420, value: rec.get("c_expense_name")});
    var dc_cost_responsible_idFld = new Ext.form.ComboBox({
        fieldLabel: "หน่วยงานผู้รับผิดชอบ", width: 420,
        store: Ext.dc_cost, mode: "local", valueField: "id", displayField: "c_name",
        triggerAction: "all", forceSelection: true, typeAhead: false,
        emptyText: "กรุณาเลือกหน่วยงาน...",
    });
    var dc_cost_owner_idFld = new Ext.form.ComboBox({
        fieldLabel: "หน่วยงานเจ้าของเรื่อง", width: 420,
        store: Ext.dc_cost, mode: "local", valueField: "id", displayField: "c_name",
        triggerAction: "all", forceSelection: true, typeAhead: false,
        emptyText: "กรุณาเลือกหน่วยงาน...",
        value: MEDSUP_DC_COST_ID,
    });

    function saveChecking() {
        if (!d_checkingFld.isValid() || !c_egp_noFld.isValid() || !c_disburse_detailFld.isValid()) {
            Ext.Msg.alert("แจ้งเตือน", "กรุณากรอกวันที่บันทึกการตรวจรับ / เลขที่ EGP / รายการส่งเบิก ให้ครบ");
            return;
        }
        Ext.Ajax.request({
            url: "tor/api/mnMedSupPeriodBillReceiveController.php",
            method: "POST",
            params: {
                mode: "SAVE_CHECKING",
                c_ir_code: rec.get("c_ir_code"),
                d_doc_complete: d_doc_completeFld.getRawValue(),
                d_checking: d_checkingFld.getRawValue(),
                c_egp_no: c_egp_noFld.getValue(),
                c_disburse_detail: c_disburse_detailFld.getValue(),
                c_overlap_no: c_overlap_noFld.getValue(),
                i_budget_year_ref: i_budget_year_refFld.getValue(),
                c_item_name: c_item_nameFld.getValue(),
                i_budget_year_use: i_budget_year_useFld.getValue(),
                f_total_vat: f_total_vatFld.getValue(),
                b_vat: b_vatChk.getValue() ? 1 : 0,
                f_vat_percent: f_vat_percentFld.getValue(),
                // ค่า VAT ที่โชว์อยู่ตอนนี้ (อาจเป็นค่าที่คำนวณจาก % หรือ user แก้ไขเองทับ
                // ก็ได้) - ส่งไปให้ฝั่ง PHP ใช้ตรงๆ แทนการคำนวณจาก % ซ้ำอีกที
                f_vat_amt: f_vat_amtFld.getValue(),
                b_wht: b_whtChk.getValue() ? 1 : 0,
                f_wht_percent: f_wht_percentFld.getValue(),
                // ค่าภาษีหัก ณ ที่จ่ายที่โชว์อยู่ตอนนี้ (อาจเป็นค่าที่คำนวณจาก % หรือ user
                // แก้ไขเองทับก็ได้) - ส่งไปให้ฝั่ง PHP ใช้ตรงๆ แทนการคำนวณจาก % ซ้ำอีกที
                f_wht_amt: f_wht_amtFld.getValue(),
                f_penalty: f_penaltyFld.getValue(),
                b_guarantee: b_guaranteeChk.getValue() ? 1 : 0,
                f_guarantee_percent: f_guarantee_percentFld.getValue(),
                f_other: f_otherFld.getValue(),
                dc_cost_responsible_id: dc_cost_responsible_idFld.getValue(),
                dc_cost_owner_id: dc_cost_owner_idFld.getValue(),
            },
            success: function (response) {
                var res = Ext.decode(response.responseText);
                if (res.reval === 0) {
                    // ปุ่ม "บันทึก" นี้บันทึกรายละเอียดตรวจรับ + ออกเลข AP ให้เลข IR นี้
                    // ในขั้นตอนเดียวกันเลย (ฝั่งเซิร์ฟเวอร์ทำต่อให้อัตโนมัติหลังบันทึก
                    // สำเร็จ - ดู mode SAVE_CHECKING) เดิมพอบันทึกเสร็จจะปิดแท็บทิ้งทันที
                    // ทำให้ไม่เห็นเลข AP ที่เพิ่งออก - ตอนนี้เอาเลขที่เซิร์ฟเวอร์ส่งกลับมา
                    // (res.c_ap_code) ไปอัปเดตค้างไว้ที่ป้ายด้านบนฟอร์ม แล้ว "ไม่" ปิดแท็บ
                    // ให้อัตโนมัติอีกต่อไป ผู้ใช้กด "ปิดแท็บนี้" เองตอนก๊อปเลขเสร็จแล้ว
                    var apFld = Ext.getCmp("apCodeDisplayID-" + rec.get("c_ir_code"));
                    if (apFld && res.c_ap_code) {
                        apFld.setValue("<b>" + res.c_ap_code + "</b>");
                    }
                    Ext.storeAcceptMedSupList.reload();
                    Ext.Msg.alert(
                        "สำเร็จ",
                        "บันทึกรายละเอียดตรวจรับและออกเลข AP เรียบร้อยแล้ว"
                            + (res.c_ap_code ? "<br>เลข AP: <b>" + res.c_ap_code + "</b>" : "")
                    );
                } else {
                    Ext.Msg.alert("แจ้งเตือน", res.msg || "บันทึกไม่สำเร็จ");
                }
            },
            failure: function () {
                Ext.Msg.alert("แจ้งเตือน", "บันทึกไม่สำเร็จ");
            }
        });
    }

    var leftItems = [
        d_doc_completeFld,
        d_checkingFld,
        c_egp_noFld,
        c_disburse_detailFld,
        {xtype: "displayfield", fieldLabel: "", width: 380, value: "* ระบุงวด แสดงที่ใบส่งเบิก", style: "color:#c00;"},
        {
            xtype: "displayfield", fieldLabel: "การใช้เงิน", width: 250,
            value: isOverlap ? "ใช้เงินปีงบประมาณกันเหลื่อม" : "ใช้เงินปีงบประมาณปัจจุบัน",
            style: "font-weight:bold;color:#08c;"
        },
    ];
    // แสดงเฉพาะงวดที่บันทึกไว้เป็นกันเหลื่อมปีเท่านั้น (ผูกกับ c_overlap[n]/
    // i_budget_year_overlap[n] ที่บันทึกไว้จริงตอน "บันทึกรายละเอียดในสัญญา
    // (เวชภัณฑ์)" - ค่าเริ่มต้นเอามาจากตรงนี้ แต่แก้ไขได้ผ่าน c_overlap_noFld
    if (isOverlap) {
        leftItems.push(c_overlap_noFld);
    }
    leftItems.push(
        i_budget_year_refFld,
        i_budget_year_useFld
    );

    // การ์ดฟอร์มความกว้างคงที่ (FORM_WIDTH) อยู่กึ่งกลางแท็บเสมอไม่ว่าจอจะกว้างแค่ไหน -
    // กันปัญหาฟอร์มลอยกว้างเกินพื้นที่จริง/เหลือพื้นที่ว่างข้างๆ ดูไม่เป็นระเบียบ - จัด
    // แนวนอน 2 คอลัมน์ตามที่ขอ: ฝั่งซ้ายข้อมูลเอกสาร/หน่วยงาน ฝั่งขวา "รายละเอียดเงิน"
    var card = new Ext.Panel({
        // ยืดเต็มพื้นที่แท็บทั้งกว้างและสูงจริงๆ (layout:"fit" ของ tab ด้านล่าง) - พื้น
        // สีขาวของฟอร์มนี้คือพื้นหลังที่ต้องการให้เต็มจอ ไม่ใช่กล่องเล็กๆ ลอยอยู่กลาง
        // พื้นที่สีอื่น ถ้าเนื้อหาสูงเกินพื้นที่จริงค่อย autoScroll (ไม่ใช่ "ล้น" ออกไป
        // ให้เห็นแนวนอน แค่มีสกอลบาร์แนวตั้งให้เลื่อนดูภายในกรอบเดิม)
        autoScroll: true,
        bodyStyle: "padding:16px 8px 6px 16px;",
        border: false,
        layout: "form",
        labelWidth: 170,
        defaults: {labelWidth: 170, labelSeparator: ":"},
        items: [
            {
                xtype: "displayfield", id: "apCodeDisplayID-" + rec.get("c_ir_code"),
                fieldLabel: "เลขตรวจรับ AP", width: 260,
                value: rec.get("c_ap_code") ? "<b>" + rec.get("c_ap_code") + "</b>" : "(ยังไม่ออกเลข)",
            },
            {xtype: "displayfield", fieldLabel: "เลขข้างอิงเอกสารในการรับของ", width: 200, value: rec.get("c_ir_code")},
            {
                xtype: "panel",
                layout: "column",
                border: false,
                items: [
                    {
                        columnWidth: 0.55,
                        border: false,
                        layout: "form",
                        labelWidth: 170,
                        defaults: {labelWidth: 170, labelSeparator: ":"},
                        items: leftItems.concat([
                            {
                                xtype: "fieldset",
                                title: "รายการย่อย/หน่วยงาน",
                                autoHeight: true,
                                defaults: {labelWidth: 170, labelSeparator: ":"},
                                items: [
                                    c_item_nameFld,
                                    dc_cost_responsible_idFld,
                                    dc_cost_owner_idFld,
                                ]
                            },
                        ]),
                    },
                    {width: 12, border: false},
                    {
                        columnWidth: 0.44,
                        border: false,
                        layout: "form",
                        labelWidth: 150,
                        items: [
                            {
                                xtype: "fieldset",
                                title: "รายละเอียดเงิน",
                                autoHeight: true,
                                defaults: {labelWidth: 150, labelSeparator: ":"},
                                items: [
                                    moneySourceFld,
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
                                ]
                            },
                        ],
                    },
                ],
            },
        ],
        buttons: [
            {text: "บันทึก", iconCls: "icon-save", handler: saveChecking},
            {
                text: "ปิดแท็บนี้",
                iconCls: "icon-clear",
                handler: function () {
                    center.remove(tab);
                }
            }
        ],
    });

    var tab = new Ext.Panel({
        id: tabId,
        title: "ตรวจรับ IR " + rec.get("c_ir_code"),
        closable: true,
        border: false,
        layout: "fit",
        items: [card],
        listeners: {
            // แท็บที่เพิ่งถูก add() เข้า TabPanel อาจคำนวณ layout ครั้งแรกจากขนาดค้าง
            // (ตอนยังไม่ active/แสดงผลจริง) ทำให้พื้นหลังไม่เต็มพื้นที่จริงของจอ - สั่ง
            // doLayout() ซ้ำตอน activate เพื่อคำนวณขนาดใหม่จากพื้นที่จริงหลังแสดงผลแล้ว
            activate: function () {
                this.doLayout();
            }
        }
    });

    center.add(tab);
    center.setActiveTab(tab);
    tab.doLayout();

    function hasVal(v) {
        return v !== "" && v !== null && typeof v !== "undefined";
    }
    // ช่อง "รายละเอียดเงิน" - จากร่างที่หน้าส่งมอบงาน หรือจากที่บันทึกตรวจรับไว้แล้ว
    function fillMoney(d) {
        f_total_vatFld.setValue(numStr(d.f_total_vat));
        b_vatChk.setValue(!!d.b_vat);
        if (hasVal(d.f_vat_percent)) {
            f_vat_percentFld.setValue(d.f_vat_percent);
        }
        b_whtChk.setValue(!!d.b_wht);
        if (hasVal(d.f_wht_percent)) {
            f_wht_percentFld.setValue(d.f_wht_percent);
        }
        f_penaltyFld.setValue(numStr(d.f_penalty || 0));
        b_guaranteeChk.setValue(!!d.b_guarantee);
        if (hasVal(d.f_guarantee_percent)) {
            f_guarantee_percentFld.setValue(d.f_guarantee_percent);
        }
        f_otherFld.setValue(numStr(d.f_other || 0));
        // d_checking มีเฉพาะแถวจาก sp_tor_period_bill_checking จริง (บันทึกตรวจรับแล้ว)
        // ไม่มี = ค่าร่างจากหน้าส่งมอบงาน
        if (typeof d.d_checking !== "undefined") {
            moneySourceFld.setValue("ยอดเงินตามที่บันทึกตรวจรับไว้แล้ว - แก้ไขได้ที่ปุ่ม \"แก้ไข VAT\" หน้าส่งมอบงาน (ST00095)");
        }
        // มียอด VAT/หัก ณ ที่จ่ายที่บันทึกไว้ตรงๆ (ร่างใหม่ หรือบันทึกตรวจรับแล้ว) ใช้ยอดนั้น
        // ได้ก็ต่อเมื่อยังตรงกับรายการรับของตอนนี้ (ถอด VAT: ยอดรวม VAT ที่บันทึกไว้ = ยอดรวม
        // รายการของ IR นี้ periodTotal) - รายการถูกแก้/เพิ่มหลังบันทึกไปแล้ว ยอดเก่าใช้ไม่ได้
        // ถอด VAT ใหม่จาก % ที่บันทึกไว้แทน ร่างเก่าที่มีแค่ % ก็คิดจาก % เช่นกัน
        var savedTotal = round2Accept(parseFloat(numStr(d.f_total_vat)) || 0);
        var matchesItems = Math.abs(savedTotal - round2Accept(periodTotal)) < 0.005;
        if (hasVal(d.f_vat_amt) && matchesItems) {
            f_vat_amtFld.setValue(numStr(d.f_vat_amt));
            if (hasVal(d.f_wht_amt)) {
                f_wht_amtFld.setValue(numStr(d.f_wht_amt));
                applyFinal();
            } else {
                recalcWhtFromPercent();
            }
        } else if (hasVal(d.f_vat_amt)) {
            defaultFromItems("รายการรับของถูกแก้ไขหลังบันทึกยอดเงิน - คำนวณใหม่ตาม % จากยอดรายการปัจจุบัน"
                + " (กดแก้ไข VAT > บันทึกร่าง ที่หน้าส่งมอบงานเพื่อบันทึกยอดใหม่)");
        } else {
            defaultFromItems("ยอดเงินคำนวณตาม % จากร่างที่หน้าส่งมอบงาน (ST00095)");
        }
    }
    // ช่องอื่นของฟอร์มตรวจรับ - มีเฉพาะตอนเคยบันทึกตรวจรับไว้แล้ว (ร่างไม่มีฟิลด์พวกนี้)
    function fillOthers(d) {
        if (hasVal(d.d_doc_complete)) {
            d_doc_completeFld.setValue(d.d_doc_complete);
        }
        if (hasVal(d.d_checking)) {
            d_checkingFld.setValue(d.d_checking);
        }
        if (hasVal(d.c_egp_no)) {
            c_egp_noFld.setValue(d.c_egp_no);
        }
        if (hasVal(d.c_disburse_detail)) {
            c_disburse_detailFld.setValue(d.c_disburse_detail);
        }
        if (d.c_overlap_no) {
            c_overlap_noFld.setValue(d.c_overlap_no);
        }
        if (d.i_budget_year_ref) {
            i_budget_year_refFld.setValue(d.i_budget_year_ref);
        }
        if (d.c_item_name) {
            c_item_nameFld.setValue(d.c_item_name);
        }
        if (hasVal(d.i_budget_year_use)) {
            i_budget_year_useFld.setValue(d.i_budget_year_use);
        }
        if (d.dc_cost_responsible_id) {
            dc_cost_responsible_idFld.setValue(d.dc_cost_responsible_id);
        }
        if (d.dc_cost_owner_id) {
            dc_cost_owner_idFld.setValue(d.dc_cost_owner_id);
        }
    }

    // ถ้าเคยกรอกไว้แล้ว (แก้ไขซ้ำ) ดึงค่าเดิมมาเติมให้
    Ext.Ajax.request({
        url: "tor/api/List_MedSupPeriodBill.php",
        method: "GET",
        params: {type: "medsup_checking_by_ir", c_ir_code: rec.get("c_ir_code")},
        success: function (response) {
            // เจอจริง: หน้าจอค้างที่ค่าตั้งต้น (ยอด 0 ทั้งหมด) ทั้งที่มีร่างแล้ว = callback นี้
            // พังกลางทาง (JSON จาก PHP อ่านไม่ได้ หรือ setValue ช่องอื่นก่อนถึงช่องเงิน error)
            // - เติม "ช่องเงิน" ก่อนเสมอ ช่องอื่นเติมเฉพาะที่ API ส่งมาจริง (ร่างไม่มี
            // d_doc_complete/d_checking/c_egp_no ฯลฯ) และดัก error ขึ้นแจ้งเตือนให้เห็นสาเหตุ
            var d;
            try {
                var res = Ext.decode(response.responseText);
                d = res && res.data && res.data[0];
            } catch (e) {
                defaultFromItems();
                Ext.Msg.alert("แจ้งเตือน", "โหลดยอดเงินจากหน้าส่งมอบงานไม่สำเร็จ (ข้อมูลจากเซิร์ฟเวอร์ผิดรูปแบบ)<br>"
                    + Ext.util.Format.htmlEncode(String(response.responseText).substring(0, 300)));
                return;
            }
            if (!d) {
                defaultFromItems();
            } else {
                try {
                    fillMoney(d);
                } catch (e) {
                    Ext.Msg.alert("แจ้งเตือน", "เติมยอดเงินไม่สำเร็จ: " + Ext.util.Format.htmlEncode(e.message));
                }
                try {
                    fillOthers(d);
                } catch (e) {
                    Ext.Msg.alert("แจ้งเตือน", "เติมข้อมูลตรวจรับเดิมไม่สำเร็จ: " + Ext.util.Format.htmlEncode(e.message));
                }
            }
            // ยอดเงินของ IR ยังไม่ผ่านเงื่อนไขออกเลข AP (รายการย่อยยังไม่ยืนยัน VAT / ยอดไม่ตรง
            // ผลรวมรายการย่อย) - เตือนสีแดงในกล่องรายละเอียดเงินตั้งแต่เปิด (ตอนกดบันทึก
            // เซิร์ฟเวอร์เช็คซ้ำและขึ้นแจ้งเตือนเต็มให้อีกที) ออกเลข AP ไปแล้วไม่ต้องเตือน
            if (res.vat_warning && !rec.get("c_ap_code")) {
                moneySourceFld.setValue("<span style=\"color:#c00;font-weight:bold;\">" + res.vat_warning + "</span>");
            }
        },
        failure: function () {
            defaultFromItems();
        }
    });
}

Ext.AppUx = function (app, menu) {
    Ext.user_right_add = user_right_add;
    Ext.user_right_edit = user_right_edit;
    Ext.user_right_delete = user_right_delete;
    Ext.title = Ext.menu_name + " " + Ext.menu_code;
    Ext.selectRow = [];

    Ext.loadStore = function () {};

    var checkboxSm = new Ext.grid.CheckboxSelectionModel();

    // ออกเลข AP ให้เลข IR ที่ติ๊กเลือกไว้ - เลือกได้หลายเลข IR พร้อมกัน แล้วทุกเลข IR ที่
    // เลือกในครั้งนี้จะได้ "เลข AP เดียวกัน" (รวมยอดกันเป็นก้อนเดียว) ส่งเป็น ir_codes ไป
    // ให้ฝั่ง PHP ขยายเป็นรายการย่อยจริงเองแทนที่จะต้องโหลดรายการย่อยมาไว้ล่วงหน้า
    function issueApForSelected() {
        var selected = checkboxSm.getSelections();
        if (!selected.length) {
            Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกเลขที่ IR ที่จะออกเลข AP อย่างน้อย 1 รายการ");
            return;
        }
        // เช็คหน่วยงานปนกันตั้งแต่ฝั่ง UI ก่อน (เซิร์ฟเวอร์เช็คซ้ำอีกชั้นเป็นตัวจริง) -
        // กันเลือกข้าม APPS/APMD/APMS มาออกเลข AP รวมกัน ซึ่งจะได้ prefix ผิดสำหรับ
        // บางรายการในกลุ่ม
        var deptTypes = selected.map(function (r) { return r.get("c_ap_dept_type") || "APMS"; }).filter(function (v, i, arr) { return arr.indexOf(v) === i; });
        if (deptTypes.length > 1) {
            Ext.Msg.alert("แจ้งเตือน", "รายการที่เลือกมาจากคนละหน่วยงานกัน (" + deptTypes.join(", ") + ") ออกเลข AP รวมกันไม่ได้ กรุณาแยกออกเลขทีละหน่วยงาน");
            return;
        }
        // ต้องกรอกรายละเอียดตรวจรับ (รายการส่งเบิก) ให้ครบทุกเลข IR ที่เลือกก่อน - เช็ค
        // ฝั่ง UI จาก i_checking_ready ที่โหลดมาพร้อมกริดแล้ว (เซิร์ฟเวอร์เช็คซ้ำอีกชั้น
        // เป็นตัวจริงตอน ISSUE_AP)
        var notReady = selected.filter(function (r) { return !r.get("i_checking_ready"); });
        if (notReady.length) {
            var notReadyCodes = notReady.map(function (r) { return r.get("c_ir_code"); });
            Ext.Msg.alert(
                "แจ้งเตือน",
                "กรุณากรอกรายละเอียดตรวจรับ (รายการส่งเบิก) ให้ครบก่อนออกเลข AP<br>เลข IR ที่ยังไม่ได้กรอก: " + notReadyCodes.join(", ")
            );
            return;
        }
        var irCodes = selected.map(function (r) { return r.get("c_ir_code"); });
        var sumAmt = 0;
        selected.forEach(function (r) {
            sumAmt += parseFloat(String(r.get("f_total_amt")).replace(/,/g, "")) || 0;
        });
        Ext.Msg.confirm(
            "ยืนยันออกเลข AP",
            "รวม " + selected.length + " เลข IR เป็นเลข AP เดียวกัน ยอดรวม " + moneyStrAccept(sumAmt) + " บาท ใช่หรือไม่?",
            function (btn) {
                if (btn !== "yes") {
                    return;
                }
                Ext.Ajax.request({
                    url: "tor/api/mnMedSupPeriodBillReceiveController.php",
                    method: "POST",
                    params: {mode: "ISSUE_AP", ir_codes: Ext.encode(irCodes)},
                    success: function (response) {
                        // controller ตอบ HTTP 200 เสมอแม้ปฏิเสธด้วยเหตุผลทางธุรกิจ (เช่น
                        // เลือกข้ามหน่วยงานกัน) ต้องเช็ค reval จาก body จริงๆ ก่อน จะดู
                        // แค่ success ของ Ajax เฉยๆ ไม่พอ
                        var res = Ext.decode(response.responseText);
                        if (res.reval === 0) {
                            Ext.storeAcceptMedSupList.reload();
                        } else {
                            Ext.Msg.alert("แจ้งเตือน", res.msg || "ออกเลข AP ไม่สำเร็จ");
                        }
                    },
                    failure: function () {
                        Ext.Msg.alert("แจ้งเตือน", "ออกเลข AP ไม่สำเร็จ");
                    }
                });
            }
        );
    }

    function rowDblClick(grid, rowIndex) {
        var record = grid.getStore().getAt(rowIndex);
        winCheckingDetailTab(record);
    }

    // ปุ่ม "รายการเมนู" และ "ออกเลข AP ที่เลือก" เอาออกจากแถบด้านบนไปก่อนตามที่ขอ (เพื่อ
    // เคลียร์พื้นที่ให้กริดขึ้นก่อน) - ฟังก์ชัน issueApForSelected ยังอยู่ครบ พร้อมผูกกับ
    // ปุ่มใหม่ได้ทันทีเมื่อจะเอากลับมาแสดง (เช่น ใส่กลับเข้า tbar หรือใน FilterPanelLeft)

    // แถบค้นหา/กรองข้อมูล - เลย์เอาต์ 2 กล่องเลียนแบบหน้า "ตรวจรับพัสดุ/ครุภัณฑ์" (ST0013)
    // เฉพาะฟิลด์ที่มีข้อมูลรองรับจริงในคิวนี้ - "เลขที่ตรวจรับ"/"เลขที่ใบเบิก" ใน
    // ตัวเลือก "ค้นหาโดย" ของ ST0013 ไม่มีในนี้เพราะเมนูนี้ไม่ได้ออกเลขตรวจรับ/ไม่มี
    // เลขที่ใบเบิกแยกต่างหาก (ดูหมายเหตุที่คอลัมน์กริดด้านล่างประกอบ)
    var searchByCombo = new Ext.form.ComboBox({
        width: 150, mode: "local", triggerAction: "all", forceSelection: true, editable: false,
        store: new Ext.data.ArrayStore({
            fields: ["v", "t"],
            data: [
                ["c_contract_code", "เลขสัญญา"],
                ["c_ir_code", "เลขที่รับของ (IR)"],
                ["c_ap_code", "เลขตรวจรับ (AP)"],
                ["c_overlap", "เลขที่ใบกัน"],
                ["c_creditor_name", "ผู้ขาย/ผู้รับจ้าง"],
                ["c_tax_number_imp", "เลขประจำตัวผู้เสียภาษีผู้ขาย/ผู้รับจ้าง"],
            ],
        }),
        valueField: "v", displayField: "t", value: "c_contract_code",
    });
    var searchTextFld = new Ext.form.TextField({width: 150, emptyText: "คำที่ต้องการค้นหา"});
    var searchFundCombo = new Ext.form.ComboBox({
        width: 160, mode: "local", triggerAction: "all", forceSelection: true, editable: false,
        store: new Ext.data.ArrayStore({fields: ["v", "t"], data: [["", "- เลือกทั้งหมด -"]]}),
        valueField: "v", displayField: "t", value: "", emptyText: "แหล่งเงิน",
    });
    var searchReadyCombo = new Ext.form.ComboBox({
        width: 130, mode: "local", triggerAction: "all", forceSelection: true, editable: false,
        store: new Ext.data.ArrayStore({
            fields: ["v", "t"],
            data: [["", "ทั้งหมด"], ["1", "กรอกแล้ว"], ["0", "ยังไม่กรอก"]],
        }),
        valueField: "v", displayField: "t", value: "",
    });
    var searchDeptCombo = new Ext.form.ComboBox({
        width: 130, mode: "local", triggerAction: "all", forceSelection: true, editable: false,
        store: new Ext.data.ArrayStore({
            fields: ["v", "t"],
            data: [["", "ทั้งหมด"], ["APPS", "APPS พัสดุ"], ["APMD", "APMD เภสัช"], ["APMS", "APMS เวชภัณฑ์"]],
        }),
        valueField: "v", displayField: "t", value: "",
    });
    // ปีงบประมาณ/ปีที่ใช้ประมาณ - รายการปีคงที่จากช่วงเดียวกับ yearThAccept() (ปีปัจจุบัน
    // -3 ถึง +1) ให้เลือกค้นหาได้ทุกปีในช่วงที่ระบบใช้งาน ไม่ใช่แค่ปีที่เคยมีรายการเข้ามา
    var yearOptionsAccept = [["", "- เลือกทั้งหมด -"]];
    yearThAccept().forEach(function (y) { yearOptionsAccept.push([y, y]); });
    var searchYearCombo = new Ext.form.ComboBox({
        width: 160, mode: "local", triggerAction: "all", forceSelection: true, editable: false,
        store: new Ext.data.ArrayStore({fields: ["v", "t"], data: yearOptionsAccept}),
        valueField: "v", displayField: "t", value: "",
    });
    var searchYearUseCombo = new Ext.form.ComboBox({
        width: 160, mode: "local", triggerAction: "all", forceSelection: true, editable: false,
        store: new Ext.data.ArrayStore({fields: ["v", "t"], data: yearOptionsAccept}),
        valueField: "v", displayField: "t", value: "",
    });
    // ประเภทสัญญา - ตัวเลือกชุดเดียวกับที่ใช้ในหน้า "บันทึกรายละเอียดในสัญญา (เวชภัณฑ์)"
    // (Ext.storeContractTypePeriodBill ในไฟล์นั้น) เป็น master list คงที่ ไม่ต้องดึงจาก
    // ฐานข้อมูลซ้ำ
    var searchContractTypeCombo = new Ext.form.ComboBox({
        width: 160, mode: "local", triggerAction: "all", forceSelection: true, editable: false,
        store: new Ext.data.ArrayStore({
            fields: ["v", "t"],
            data: [["", "ทั้งหมด"], ["จัดซื้อจะขาย", "จัดซื้อจะขาย"], ["ใบสั่งซื้อ", "ใบสั่งซื้อ"], ["สัญญา", "สัญญา"]],
        }),
        valueField: "v", displayField: "t", value: "",
    });
    var searchReservedCombo = new Ext.form.ComboBox({
        width: 130, mode: "local", triggerAction: "all", forceSelection: true, editable: false,
        store: new Ext.data.ArrayStore({
            fields: ["v", "t"],
            data: [["", "ทั้งหมด"], ["1", "จองแล้ว"], ["0", "ยังไม่จอง"]],
        }),
        valueField: "v", displayField: "t", value: "",
    });
    var searchOwnChk = new Ext.form.Checkbox({boxLabel: "แสดงรายการของตัวเอง"});

    // แหล่งเงิน - ใช้ master list กลาง (Ext.storeExpenseBudgetTypeAccept) ให้เลือกค้นหา
    // ได้ทุกแหล่งเงินที่มีในระบบ ไม่ใช่แค่แหล่งที่เคยมีรายการเข้ามาในคิวนี้แล้วเท่านั้น
    function loadFundOptions() {
        var fundData = [["", "- เลือกทั้งหมด -"]];
        Ext.storeExpenseBudgetTypeAccept.each(function (r) { fundData.push([r.get("c_name"), r.get("c_name")]); });
        searchFundCombo.getStore().loadData(fundData);
    }
    if (Ext.storeExpenseBudgetTypeAccept.getCount()) {
        loadFundOptions();
    }
    Ext.storeExpenseBudgetTypeAccept.on("load", loadFundOptions);

    function doSearch() {
        Ext.storeAcceptMedSupList.setBaseParam("search_by", searchByCombo.getValue());
        Ext.storeAcceptMedSupList.setBaseParam("search_text", searchTextFld.getValue());
        Ext.storeAcceptMedSupList.setBaseParam("c_fund_source", searchFundCombo.getValue());
        Ext.storeAcceptMedSupList.setBaseParam("i_checking_ready", searchReadyCombo.getValue());
        Ext.storeAcceptMedSupList.setBaseParam("c_ap_dept_type", searchDeptCombo.getValue());
        Ext.storeAcceptMedSupList.setBaseParam("i_budget_year", searchYearCombo.getValue());
        Ext.storeAcceptMedSupList.setBaseParam("i_budget_year_use", searchYearUseCombo.getValue());
        Ext.storeAcceptMedSupList.setBaseParam("c_contract_type", searchContractTypeCombo.getValue());
        Ext.storeAcceptMedSupList.setBaseParam("i_reserved", searchReservedCombo.getValue());
        Ext.storeAcceptMedSupList.setBaseParam("own_only", searchOwnChk.getValue() ? 1 : 0);
        Ext.storeAcceptMedSupList.load({params: {start: 0}});
    }
    function clearSearch() {
        searchByCombo.setValue("c_contract_code");
        searchTextFld.setValue("");
        searchFundCombo.setValue("");
        searchReadyCombo.setValue("");
        searchDeptCombo.setValue("");
        searchYearCombo.setValue("");
        searchYearUseCombo.setValue("");
        searchContractTypeCombo.setValue("");
        searchReservedCombo.setValue("");
        searchOwnChk.setValue(false);
        doSearch();
    }

    // กล่องซ้าย: "ระบุเงื่อนไขในการค้นหาข้อมูล" - ระยะห่างระหว่าง 2 กล่องใช้คอลัมน์ว่าง
    // คั่นกลางจริงๆ (ดู FilterBar ด้านล่าง) ไม่ใช่ CSS margin ที่ลองมาก่อนแล้วไม่ได้ผลจริง
    // หัวข้อใช้เป็น item ธรรมดาในบอดี้ (ไม่ใช่ title ของ panel) เพราะ panel ที่มี title
    // จะมี header แถบสูงกว่าอีกกล่องที่ไม่มี title ทำให้แถวข้อมูลของ 2 กล่องเยื้องกัน
    // ไม่ตรงแนว (บั๊กที่เจอจริง - "ขี่กัน") ใส่เป็น item ปกติแทนเพื่อให้สูงเท่ากับกล่อง
    // ขวาที่มีหัวข้อแบบเดียวกัน
    var FilterPanelLeft = function () {
        return new Ext.Panel({
            columnWidth: 0.5,
            border: true,
            bodyStyle: "padding:8px;",
            layout: "form",
            defaults: {anchor: "95%"},
            items: [
                {xtype: "displayfield", value: "ระบุเงื่อนไขในการค้นหาข้อมูล", hideLabel: true, style: "font-weight:bold;"},
                {
                    xtype: "compositefield", fieldLabel: "ค้นหาโดย", anchor: "100%",
                    items: [searchByCombo, searchTextFld],
                },
                {xtype: "compositefield", fieldLabel: "แหล่งเงิน", anchor: "100%", items: [searchFundCombo]},
                {
                    xtype: "compositefield", fieldLabel: "สถานะตรวจรับ", anchor: "100%",
                    items: [searchReadyCombo, {xtype: "displayfield", value: "ประเภท:", width: 45}, searchDeptCombo],
                },
                {
                    xtype: "compositefield", hideLabel: true,
                    items: [
                        {xtype: "button", text: "ค้นหา", iconCls: "icon-search", width: 90, handler: doSearch},
                        {xtype: "displayfield", value: "", width: 16},
                        {xtype: "button", text: "ล้างตัวกรอง", iconCls: "icon-clear", width: 100, handler: clearSearch},
                    ]
                },
            ],
        });
    };

    // กล่องขวา: ปีงบประมาณ/ปีที่ใช้ประมาณ/ประเภทสัญญา/สถานะการจอง/แสดงรายการของตัวเอง
    var FilterPanelRight = function () {
        return new Ext.Panel({
            columnWidth: 0.5,
            border: true,
            bodyStyle: "padding:8px;",
            layout: "form",
            defaults: {anchor: "95%"},
            items: [
                {xtype: "displayfield", value: "&#160;", hideLabel: true},
                {xtype: "compositefield", fieldLabel: "ปีงบประมาณ", anchor: "100%", items: [searchYearCombo]},
                {xtype: "compositefield", fieldLabel: "ปีที่ใช้ประมาณ", anchor: "100%", items: [searchYearUseCombo]},
                {
                    xtype: "compositefield", fieldLabel: "ประเภทสัญญา", anchor: "100%",
                    items: [searchContractTypeCombo, searchOwnChk],
                },
                {xtype: "compositefield", fieldLabel: "สถานะการจอง", anchor: "100%", items: [searchReservedCombo]},
            ],
        });
    };

    var FilterBar = function () {
        return new Ext.Panel({
            layout: "column",
            border: false,
            bodyStyle: "background:transparent;",
            // ใช้คอลัมน์ว่างคั่นกลางจริงๆ (columnWidth: 0.02) แทนการพึ่ง CSS margin บน
            // ตัว panel เอง - margin แบบเดิมไม่ได้ทำให้ "ช่องคอลัมน์" ที่ ColumnLayout
            // จัดสรรพื้นที่ให้เปลี่ยนแปลง มันแค่ทำให้เนื้อหาข้างในเยื้องเข้ามาเฉยๆ ผลคือ
            // ขอบยังชนกันอยู่จริงตามพื้นที่คอลัมน์ (บั๊กที่ยังเจอซ้ำ) คอลัมน์ว่างคั่นกลาง
            // แก้ปัญหานี้ตรงจุดเพราะเป็นการเว้นพื้นที่จริงระหว่าง 2 กล่อง
            items: [FilterPanelLeft(), {width: 12, border: false}, FilterPanelRight()],
        });
    };

    Ext.extend(
        (gridMain = function () {
            // ลำดับ/ชื่อคอลัมน์เลียนแบบกริดของ ST0013 "ตรวจรับพัสดุ/ครุภัณฑ์" เท่าที่มี
            // ข้อมูลรองรับจริงในคิวนี้ - "เลขที่ตรวจรับ" ของ ST0013 เป็นเลขที่ออกจริง
            // แยกต่างหาก แต่ที่นี่ตกลงกันแล้วว่าไม่ออกเลขแยก ใช้สถานะกรอก/ไม่กรอกแทน
            // (ดูคอลัมน์ "สถานะตรวจรับ") - ส่วน "เลขที่วางบิล"/"เลขที่ใบเบิก (เอกสาร
            // จริง)"/"สถานะการลงบัญชี" ของ ST0013 ไม่มีแนวคิดที่ตรงกันใน flow เวชภัณฑ์นี้
            // (ไม่มีขั้นตอนวางบิล/ลงบัญชี GL) จึงยังไม่ใส่คอลัมน์เหล่านี้
            var colmnn = [
                checkboxSm,
                new Ext.grid.RowNumberer({header: "ที่", width: 40}),
                {header: "เลขที่สัญญา", dataIndex: "c_contract_code", width: 110},
                {header: "เลขรับของ (IR)", dataIndex: "c_ir_code", width: 110},
                {header: "ประเภท", dataIndex: "c_ap_dept_type", width: 70, align: "center"},
                {
                    id: "checkingReadyID", header: "สถานะตรวจรับ", dataIndex: "i_checking_ready", width: 130, align: "center",
                    renderer: function (v) {
                        return v
                            ? '<span style="color:#080;cursor:pointer;">&#10003; กรอกแล้ว (แก้ไข)</span>'
                            : '<span style="color:#c00;cursor:pointer;font-weight:bold;">&#10007; ยังไม่กรอก</span>';
                    }
                },
                {header: "เลข AP", dataIndex: "c_ap_code", width: 100},
                {header: "จำนวนเงิน", dataIndex: "f_total_amt", width: 100, align: "right"},
                {header: "ชื่อโครงการ/รายการ", dataIndex: "c_project_name", width: 220},
                {header: "รายละเอียด", dataIndex: "c_detail", width: 90, align: "center"},
                {header: "วันที่รับของล่าสุด", dataIndex: "d_receive_date_last", width: 110, align: "center"},
                {header: "วันที่ออกเลข IR", dataIndex: "d_ir_issue", width: 110, align: "center"},
                {header: "วันที่ออกเลข AP", dataIndex: "d_ap_issue", width: 110, align: "center"},
                {header: "ชื่อเจ้าหน้าที่", dataIndex: "c_create_name", width: 150},
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
                sm: checkboxSm,
                viewConfig: {emptyText: "ไม่มีรายการ..", deferEmptyText: true},
                listeners: {
                    afterrender: function (g) {
                        this.on("rowdblclick", rowDblClick, this);
                        this.on("cellclick", function (grid, rowIndex, columnIndex) {
                            if (columnIndex === grid.getColumnModel().getIndexById("checkingReadyID")) {
                                winCheckingDetailTab(grid.getStore().getAt(rowIndex));
                            }
                        });
                        // คลิกขวาที่แถว - ก๊อปเลขรับของ (IR) / เลข AP ของแถวนั้นไปคลิปบอร์ด
                        // (ตามที่ขอ ไม่ต้องเปิดรายละเอียดก่อนถึงจะก๊อปได้)
                        this.on("rowcontextmenu", function (grid, rowIndex, e) {
                            e.stopEvent();
                            var record = grid.getStore().getAt(rowIndex);
                            grid.getSelectionModel().selectRow(rowIndex);
                            var irCode = record.get("c_ir_code");
                            var apCode = record.get("c_ap_code");
                            var menu = new Ext.menu.Menu({
                                items: [
                                    {
                                        text: "คัดลอกเลขรับของ (IR): " + (irCode || "-"),
                                        iconCls: "icon-copy",
                                        disabled: !irCode,
                                        handler: function () { Ext.fnCopyToClipboard(irCode); }
                                    },
                                    {
                                        text: "คัดลอกเลข AP: " + (apCode || "ยังไม่ออกเลข"),
                                        iconCls: "icon-copy",
                                        disabled: !apCode,
                                        handler: function () { Ext.fnCopyToClipboard(apCode); }
                                    },
                                ]
                            });
                            menu.showAt(e.getXY());
                        });
                    },
                },
                store: Ext.storeAcceptMedSupList,
                // เอา MenuButton() (ปุ่ม "รายการเมนู") กับปุ่ม "ออกเลข AP ที่เลือก" ออก
                // จากแถบด้านบนไปก่อนตามที่ขอ - FilterBar() เป็น Panel ที่สร้างไว้แล้ว
                // (ไม่ใช่ config ธรรมดา) เมื่อส่งเป็น tbar ตรงๆ (ไม่ห่อ array) ExtJS จะ
                // ใช้เป็น topToolbar ของกริดนี้ทั้งแถบเลย ทำให้ได้พื้นที่เต็มความสูงตาม
                // ธรรมชาติของ panel นี้ ไม่ถูกบีบเหมือนตอนพยายามห่อด้วย border layout
                // ครอบกริดอีกที (ทำให้กริดว่างเปล่าจนกว่าจะคลิกโดนเข้า - บั๊กที่เจอจริง)
                tbar: FilterBar(),
                columns: colmnn,
                bbar: new Ext.PagingToolbar({
                    pageSize: 20,
                    store: Ext.storeAcceptMedSupList,
                    displayInfo: true,
                    displayMsg: "Displaying topics {0} - {1} of {2}",
                }),
            });
        }),
        Ext.grid.GridPanel,
        {}
    );
};
