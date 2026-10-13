/* global Ext, user_right_add, user_right_edit, user_right_delete */

// เมนู "การจัดทำ PR (หน่วยงาน) เวชภัณฑ์" - สร้างแถวแรกของ hdr ใหม่ใน sp_tor_period_bill
// ไว้ล่วงหน้า (ระดับ "PR" เท่านั้น: เรื่อง/โครงการ, ปีงบประมาณ, แหล่งเงินสูงสุด 3 แหล่ง,
// ค่าใช้จ่าย) ก่อนที่จะมีสัญญาจริง - ไม่ใช้ตาราง dbo.sp_tor (ตาราง PR ทั่วไปของทั้งระบบ)
// เลย เพราะเมนูนี้เฉพาะเวชภัณฑ์เท่านั้น และ sp_tor_period_bill มีคอลัมน์ที่จำเป็นครบอยู่
// แล้ว (ออกแบบเผื่อไว้ตั้งแต่ต้นแต่ไม่เคยมี UI ระดับ "PR" มาก่อน) เมนู "บันทึกรายละเอียด
// ในสัญญา (เวชภัณฑ์)" (medSupPeriodBill.js) จะมาเลือกแถวที่สร้างจากเมนูนี้ไปทำสัญญาต่อ
// ทีหลัง (ดูปุ่ม "เลือกจาก PR ที่มีอยู่" ในเมนูนั้น) ใช้ controller เดียวกัน
// (mnMedSupPeriodBillController.php) แค่เพิ่ม mode ADD_PR ใหม่ ไม่แตะ mode เดิม

var MEDSUP_DC_COST_ID = 82;

Ext.storeMedSupPrList = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "tor/api/List_MedSupPeriodBill.php",
    baseParams: {type: "medsup_pr_list"},
    root: "data",
    idProperty: "id",
    totalProperty: "totalCount",
    fields: [
        "no", "id", "sp_tor_period_bill_id", "sp_tor_period_bill_hdr_id",
        "c_pr_code", "c_project_name", "i_budget_year", "c_ap_dept_type", "i_type_bg", "dc_cost_id",
        "po_expense_id", "c_expense_name",
        "dc_expense_budget_type_id", "c_fund_source", "f_fund_amt", "i_pr_type",
        "dc_expense_budget_type_id2", "c_fund_source2", "f_fund_amt2", "i_pr_type2",
        "dc_expense_budget_type_id3", "c_fund_source3", "f_fund_amt3", "i_pr_type3",
        "i_purchase", "i_product_type", "c_pr_doc_ref", "d_pr_doc_ref",
        "d_create", "c_create_name",
    ],
});

// หน่วยงาน (dc_cost) - ใช้แค่แสดงชื่อ "หน่วยงานเจ้าของเรื่อง" (ล็อกเป็นเวชภัณฑ์เสมอ ไม่ให้
// เลือกหน่วยงานอื่น เพราะเมนูนี้เฉพาะเวชภัณฑ์เท่านั้น)
Ext.storeMedSupCost = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: {type: "dc_cost"},
    root: "data",
    idProperty: "id",
    fields: ["id", "c_code", "c_name"],
});

// แหล่งเงิน (dc_expense_budget_type) - master list เดียวกับที่ใช้ทั่วทั้งระบบ
Ext.storeMedSupExpenseBudgetType = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: {type: "dc_expense_budget_type"},
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
});

// ประเภท PR (dbo.sp_type_bg) - master list เดียวกับที่เมนู PR ทั่วไป (regTor.js) ใช้
// (Ext.i_type_bg ของไฟล์นั้น) โหลดจาก endpoint กลางตัวเดียวกันเลย
Ext.storeMedSupTypeBg = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_spAlert.php",
    baseParams: {type: "sp_type_bg", i_type_bg: true},
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
});

// ค่าใช้จ่าย/รายการย่อย (po_expense) - master list เดียวกับที่ใช้ทั่วทั้งระบบ
Ext.storeMedSupPoExpense = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: {type: "po_expense"},
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
});

// ประเภทหน่วยงานที่ใช้ออกเลข AP/ต่อท้ายเลข PR (APPS พัสดุ/APMD เภสัช/APMS เวชภัณฑ์) -
// รูปแบบเดียวกับ Ext.storeApDeptTypePeriodBill ใน medSupPeriodBill.js
Ext.storeMedSupApDeptType = new Ext.data.JsonStore({
    fields: ["id", "c_name"],
    autoDestroy: false,
    autoLoad: false,
    data: [
        {id: "APPS", c_name: "APPS - พัสดุ"},
        {id: "APMD", c_name: "APMD - เภสัช"},
        {id: "APMS", c_name: "APMS - เวชภัณฑ์"},
    ],
});

function yearThMedSupPr() {
    var years = [];
    var now = new Date().getFullYear() + 1;
    var y = new Date().getFullYear() - 3;
    while (y <= now) {
        years.push(y + 543);
        y++;
    }
    return years;
}

// ฟอร์มสร้าง/แก้ไข PR - เพิ่ม "แหล่งเงิน" ได้สูงสุด 3 แหล่ง (แหล่งที่ 1 แสดงตลอด กด
// "เพิ่มแหล่งเงิน" เพื่อเผยแหล่งที่ 2 แล้วแหล่งที่ 3 ตามลำดับ) รวมยอดอัตโนมัติทุกครั้งที่
// แก้จำนวนเงินแหล่งใดแหล่งหนึ่ง - ส่ง rec (record จากกริด ตอนดับเบิลคลิกแก้ไข) มาเพื่อ
// เปิดในโหมดแก้ไข ถ้าไม่ส่งมาเลยถือเป็นโหมดสร้างใหม่
function winAddMedSupPr(rec) {
    var isEdit = !!rec;
    function sumFundAmounts() {
        var f1 = parseFloat(String(Ext.getCmp("f_fund_amtID").getValue() || "0").replace(/,/g, "")) || 0;
        var f2 = Ext.getCmp("fundSource2GroupID").isVisible() ? parseFloat(String(Ext.getCmp("f_fund_amt2ID").getValue() || "0").replace(/,/g, "")) || 0 : 0;
        var f3 = Ext.getCmp("fundSource3GroupID").isVisible() ? parseFloat(String(Ext.getCmp("f_fund_amt3ID").getValue() || "0").replace(/,/g, "")) || 0 : 0;
        Ext.getCmp("f_totalDisplayID").setValue(Ext.floatRenderer(f1 + f2 + f3) + " บาท");
    }

    // "ประเภท PR" - รายการจริงจาก dbo.sp_type_bg (Ext.storeMedSupTypeBg) ค่าเริ่มต้น
    // sp_type_bg_id=1 = "PR ปกติ" - หมายเหตุ: flow เวชภัณฑ์นี้ยังไม่มี logic จองเงินผ่าน
    // AP-API แบบเมนู PR ทั่วไป (บางประเภทเช่น "จองเงินข้ามส่งเบิก" จึงยังไม่มีผลอะไรจริง
    // นอกจากบันทึกค่าไว้)
    var i_type_bgFld = new Ext.form.ComboBox({
        fieldLabel: "ประเภท PR", width: 260,
        mode: "local", triggerAction: "all", forceSelection: true, typeAhead: false,
        store: Ext.storeMedSupTypeBg, valueField: "id", displayField: "c_name",
        value: 1,
    });

    // รหัส PR ออกให้อัตโนมัติหลังกด "บันทึกรายการ" สำเร็จ (ผ่าน SP_GEN_CODE เหมือนเมนู PR
    // ทั่วไป) ก่อนบันทึกจึงว่างไว้ก่อนเสมอ
    var c_pr_codeFld = new Ext.form.DisplayField({
        fieldLabel: "รหัส PR", value: "(จะออกให้หลังบันทึก)",
        style: "text-align:left;font-weight:bold;background:#eee;padding:3px;",
    });

    var c_project_nameFld = new Ext.form.TextArea({fieldLabel: "เรื่อง/โครงการ", width: 420, height: 50, allowBlank: false});

    var i_budget_yearData = [];
    yearThMedSupPr().forEach(function (y) { i_budget_yearData.push([y, y]); });
    var i_budget_yearFld = new Ext.form.ComboBox({
        fieldLabel: "ปีงบประมาณ", width: 200,
        mode: "local", triggerAction: "all", forceSelection: true, editable: false,
        store: new Ext.data.ArrayStore({fields: ["v", "t"], data: i_budget_yearData}),
        valueField: "v", displayField: "t",
        value: new Date().getFullYear() + 543 + (new Date().getMonth() >= 9 ? 1 : 0),
    });

    // เลือกได้ทุกหน่วยงาน (ไม่ล็อกเหมือนเมนูเวชภัณฑ์อื่นๆ) เพราะเจ้าหน้าที่จากหน่วยงาน
    // อื่นก็อาจเข้ามาบันทึก PR แทนได้ - default ไว้ที่เวชภัณฑ์การแพทย์ (82) เพราะเมนูนี้
    // ใช้งานหลักโดยฝ่ายเวชภัณฑ์
    var dc_cost_idFld = new Ext.form.ComboBox({
        fieldLabel: "หน่วยงานเจ้าของเรื่อง", width: 300,
        store: Ext.storeMedSupCost, mode: "local", valueField: "id", displayField: "c_name",
        triggerAction: "all", forceSelection: true, typeAhead: false,
        emptyText: "กรุณาเลือกหน่วยงาน...", value: MEDSUP_DC_COST_ID,
    });

    // ขอดำเนินการ (1=จัดซื้อ/2=จัดจ้าง/3=จัดเช่า) - ค่า/ชื่อตรงกับเมนู PR ทั่วไป
    var i_purchaseFld = new Ext.form.RadioGroup({
        fieldLabel: "ขอดำเนินการ", columns: [90, 90, 90],
        items: [
            {name: "i_purchase", inputValue: 1, boxLabel: "จัดซื้อ", checked: true},
            {name: "i_purchase", inputValue: 2, boxLabel: "จัดจ้าง"},
            {name: "i_purchase", inputValue: 3, boxLabel: "จัดเช่า"},
        ],
    });

    // ของที่ได้มา (1=วัสดุ/2=ครุภัณฑ์)
    var i_product_typeFld = new Ext.form.RadioGroup({
        fieldLabel: "ของที่ได้มา", columns: [90, 90],
        items: [
            {name: "i_product_type", inputValue: 1, boxLabel: "วัสดุ", checked: true},
            {name: "i_product_type", inputValue: 2, boxLabel: "ครุภัณฑ์"},
        ],
    });

    var po_expense_idFld = new Ext.form.ComboBox({
        fieldLabel: "ค่าใช้จ่าย", width: 300,
        store: Ext.storeMedSupPoExpense, mode: "local", valueField: "id", displayField: "c_name",
        triggerAction: "all", forceSelection: true, typeAhead: false,
        emptyText: "กรุณาเลือกค่าใช้จ่าย...",
    });

    var c_ap_dept_typeFld = new Ext.form.ComboBox({
        fieldLabel: "ประเภท", width: 200,
        store: Ext.storeMedSupApDeptType, mode: "local", valueField: "id", displayField: "c_name",
        triggerAction: "all", forceSelection: true, typeAhead: false, editable: false,
        value: "APMS",
    });

    // แหล่งเงินที่ 1 (แสดงตลอด) - แบบแผน/แบบงวด ต่อแหล่ง (ผูกกับ i_pr_type/2/3 ที่มีอยู่
    // แล้วในฟอร์มต้นแบบของเมนู PR ทั่วไป แต่ sp_tor_period_bill เพิ่งมีคอลัมน์นี้ ต้อง
    // เพิ่มใหม่)
    var dc_expense_budget_type_idFld = new Ext.form.ComboBox({
        id: "dc_expense_budget_type_idID", fieldLabel: "แหล่งเงินที่ 1", width: 260,
        store: Ext.storeMedSupExpenseBudgetType, mode: "local", valueField: "id", displayField: "c_name",
        triggerAction: "all", forceSelection: true, typeAhead: false,
        emptyText: "กรุณาเลือกแหล่งเงิน...", allowBlank: false,
    });
    // ต้องกำหนด width ตรงๆ (ไม่ใช่แค่ columns) ไม่งั้น RadioGroup จะขยายเต็มพื้นที่ที่
    // เหลือใน compositefield แล้วไปเบียดช่อง "จำนวนเงิน" จนมองไม่เห็น (บั๊กที่เจอจริง)
    var i_pr_typeFld = new Ext.form.RadioGroup({
        width: 170, columns: [80, 80],
        items: [
            {name: "i_pr_type", inputValue: 1, boxLabel: "แบบแผน", checked: true},
            {name: "i_pr_type", inputValue: 2, boxLabel: "แบบงวด"},
        ],
    });
    var f_fund_amtFld = new Ext.form.NumberField({
        id: "f_fund_amtID", emptyText: "จำนวนเงิน...", width: 140, allowBlank: false,
        listeners: {blur: function () { sumFundAmounts(); }},
    });

    // แหล่งเงินที่ 2/3 - ซ่อนไว้ก่อน กด "เพิ่มแหล่งเงิน" ถึงจะแสดง (สูงสุด 3 แหล่ง)
    var dc_expense_budget_type_id2Fld = new Ext.form.ComboBox({
        id: "dc_expense_budget_type_id2ID", width: 260,
        store: Ext.storeMedSupExpenseBudgetType, mode: "local", valueField: "id", displayField: "c_name",
        triggerAction: "all", forceSelection: true, typeAhead: false, emptyText: "กรุณาเลือกแหล่งเงิน...",
    });
    var i_pr_type2Fld = new Ext.form.RadioGroup({
        width: 170, columns: [80, 80],
        items: [
            {name: "i_pr_type2", inputValue: 1, boxLabel: "แบบแผน", checked: true},
            {name: "i_pr_type2", inputValue: 2, boxLabel: "แบบงวด"},
        ],
    });
    var f_fund_amt2Fld = new Ext.form.NumberField({
        id: "f_fund_amt2ID", width: 140, emptyText: "จำนวนเงิน...",
        listeners: {blur: function () { sumFundAmounts(); }},
    });
    var removeFund2Btn = new Ext.Toolbar.Button({
        text: "ลบ",
        handler: function () {
            dc_expense_budget_type_id2Fld.clearValue();
            f_fund_amt2Fld.setValue("");
            i_pr_type2Fld.setValue(1);
            Ext.getCmp("fundSource2GroupID").hide();
            if (Ext.getCmp("fundSource3GroupID").isVisible()) {
                // แหล่งที่ 3 ยังอยู่แต่ที่ 2 ถูกลบ - เลื่อนที่ 3 มาแทนที่ 2 แทนการไล่เรียงใหม่
                dc_expense_budget_type_id2Fld.setValue(dc_expense_budget_type_id3Fld.getValue());
                f_fund_amt2Fld.setValue(f_fund_amt3Fld.getValue());
                i_pr_type2Fld.setValue(i_pr_type3Fld.getValue().inputValue);
                dc_expense_budget_type_id3Fld.clearValue();
                f_fund_amt3Fld.setValue("");
                i_pr_type3Fld.setValue(1);
                Ext.getCmp("fundSource3GroupID").hide();
                Ext.getCmp("fundSource2GroupID").show();
            }
            Ext.getCmp("addFundSourceBtnID").show();
            sumFundAmounts();
        },
    });

    var dc_expense_budget_type_id3Fld = new Ext.form.ComboBox({
        id: "dc_expense_budget_type_id3ID", width: 260,
        store: Ext.storeMedSupExpenseBudgetType, mode: "local", valueField: "id", displayField: "c_name",
        triggerAction: "all", forceSelection: true, typeAhead: false, emptyText: "กรุณาเลือกแหล่งเงิน...",
    });
    var i_pr_type3Fld = new Ext.form.RadioGroup({
        width: 170, columns: [80, 80],
        items: [
            {name: "i_pr_type3", inputValue: 1, boxLabel: "แบบแผน", checked: true},
            {name: "i_pr_type3", inputValue: 2, boxLabel: "แบบงวด"},
        ],
    });
    var f_fund_amt3Fld = new Ext.form.NumberField({
        id: "f_fund_amt3ID", width: 140, emptyText: "จำนวนเงิน...",
        listeners: {blur: function () { sumFundAmounts(); }},
    });
    var removeFund3Btn = new Ext.Toolbar.Button({
        text: "ลบ",
        handler: function () {
            dc_expense_budget_type_id3Fld.clearValue();
            f_fund_amt3Fld.setValue("");
            i_pr_type3Fld.setValue(1);
            Ext.getCmp("fundSource3GroupID").hide();
            Ext.getCmp("addFundSourceBtnID").show();
            sumFundAmounts();
        },
    });

    var addFundSourceBtn = new Ext.Toolbar.Button({
        id: "addFundSourceBtnID",
        fieldLabel: "เพิ่มแหล่งเงิน",
        text: "เลือกแหล่งเงิน ไม่เกิน 3 แหล่ง",
        iconCls: "icon-add",
        handler: function () {
            if (Ext.getCmp("fundSource2GroupID").isVisible()) {
                Ext.getCmp("fundSource3GroupID").show();
                addFundSourceBtn.hide();
            } else {
                Ext.getCmp("fundSource2GroupID").show();
            }
        },
    });

    var f_totalDisplayFld = new Ext.form.DisplayField({
        id: "f_totalDisplayID", fieldLabel: "จำนวนเงิน รวมทุกแหล่งเงิน", value: "0.00 บาท",
        style: "font-weight:bold;color:#060;",
    });

    // รหัสเอกสารอ้างอิง/พวช (เช่น เลขที่บันทึกข้อความขอซื้อขอจ้าง) + วันที่เอกสาร -
    // เอกสารต้นทางที่หน่วยงานขอมา คนละเรื่องกับ "เลขที่ใบส่งของ/ใบแจ้งหนี้" ที่กรอกทีหลัง
    // ตอนบันทึกรายละเอียดสัญญา
    var c_pr_doc_refFld = new Ext.form.TextField({fieldLabel: "รหัสเอกสารอ้างอิง/พวช", width: 260});
    var d_pr_doc_refFld = new Ext.form.DateField({fieldLabel: "วันที่เอกสารอ้างอิง", width: 130});

    // โหมดการบันทึก - แค่บอกสถานะ ไม่มีให้เลือกจริง (สร้างใหม่/แก้ไข แยกกันคนละหน้าต่าง
    // อยู่แล้วผ่าน isEdit)
    var modesubFld = new Ext.form.RadioGroup({
        fieldLabel: "โหมดการบันทึก",
        style: {"font-weight": "bold"},
        items: [{name: "mode_display", checked: true, boxLabel: isEdit ? "แก้ไขรายการ" : "เพิ่มรายการใหม่", readOnly: true}],
    });

    function saveNewPr() {
        if (!c_project_nameFld.isValid() || !po_expense_idFld.isValid() || !dc_expense_budget_type_idFld.isValid() || !f_fund_amtFld.isValid()) {
            Ext.Msg.alert("แจ้งเตือน", "กรุณากรอกเรื่อง/โครงการ, ค่าใช้จ่าย, แหล่งเงินที่ 1 และจำนวนเงินให้ครบ");
            return;
        }
        var params = {
            mode: isEdit ? "UPDATE_PR" : "ADD_PR",
            sp_tor_period_bill_id: isEdit ? rec.get("sp_tor_period_bill_id") : null,
            i_type_bg: i_type_bgFld.getValue(),
            dc_cost_id: dc_cost_idFld.getValue(),
            c_project_name: c_project_nameFld.getValue(),
            i_budget_year: i_budget_yearFld.getValue(),
            i_purchase: i_purchaseFld.getValue().inputValue,
            i_product_type: i_product_typeFld.getValue().inputValue,
            po_expense_id: po_expense_idFld.getValue(),
            c_expense_name: po_expense_idFld.getRawValue(),
            c_ap_dept_type: c_ap_dept_typeFld.getValue(),
            dc_expense_budget_type_id: dc_expense_budget_type_idFld.getValue(),
            c_fund_source: dc_expense_budget_type_idFld.getRawValue(),
            f_fund_amt: f_fund_amtFld.getValue(),
            i_pr_type: i_pr_typeFld.getValue().inputValue,
            c_pr_doc_ref: c_pr_doc_refFld.getValue(),
            d_pr_doc_ref: d_pr_doc_refFld.getRawValue(),
        };
        if (Ext.getCmp("fundSource2GroupID").isVisible() && dc_expense_budget_type_id2Fld.getValue()) {
            params.dc_expense_budget_type_id2 = dc_expense_budget_type_id2Fld.getValue();
            params.c_fund_source2 = dc_expense_budget_type_id2Fld.getRawValue();
            params.f_fund_amt2 = f_fund_amt2Fld.getValue();
            params.i_pr_type2 = i_pr_type2Fld.getValue().inputValue;
        }
        if (Ext.getCmp("fundSource3GroupID").isVisible() && dc_expense_budget_type_id3Fld.getValue()) {
            params.dc_expense_budget_type_id3 = dc_expense_budget_type_id3Fld.getValue();
            params.c_fund_source3 = dc_expense_budget_type_id3Fld.getRawValue();
            params.f_fund_amt3 = f_fund_amt3Fld.getValue();
            params.i_pr_type3 = i_pr_type3Fld.getValue().inputValue;
        }
        Ext.Ajax.request({
            url: "tor/api/mnMedSupPeriodBillController.php",
            method: "POST",
            params: params,
            success: function (response) {
                var res = Ext.decode(response.responseText);
                if (res.success) {
                    Ext.Msg.alert("สำเร็จ", res.msg || "บันทึก PR เรียบร้อยแล้ว", function () {
                        Ext.storeMedSupPrList.reload();
                        win.destroy();
                    });
                } else {
                    Ext.Msg.alert("แจ้งเตือน", res.msg || "บันทึกไม่สำเร็จ");
                }
            },
            failure: function () {
                Ext.Msg.alert("แจ้งเตือน", "บันทึกไม่สำเร็จ");
            }
        });
    }

    var win = new Ext.Window({
        title: isEdit ? "แก้ไข PR" : "ข้อมูลรายละเอียด PR",
        buttonAlign: "left",
        // เต็มพื้นที่จอเกือบทั้งหมด (แบบเดียวกับหน้าต่าง "บันทึก PR" ของเมนู PR ทั่วไป -
        // regTor.js) ไม่ใช่ popup เล็กๆ อยู่กลางจอ
        width: Ext.getCmp("contenterCenter").getWidth() - 5,
        height: Ext.getCmp("contenterCenter").getHeight() - 5,
        minWidth: 900,
        minHeight: 564,
        maximizable: true,
        modal: true,
        layout: "form",
        autoScroll: true,
        bodyStyle: "padding:12px;",
        labelWidth: 150,
        defaults: {labelWidth: 150, labelSeparator: ":", anchor: "60%"},
        items: [
            // "ประเภท" (APPS/APMD/APMS) ย้ายมาไว้บนสุด เหนือ "ประเภท PR" ตามที่ขอ
            c_ap_dept_typeFld,
            i_type_bgFld,
            i_budget_yearFld,
            c_pr_codeFld,
            c_project_nameFld,
            dc_cost_idFld,
            i_purchaseFld,
            i_product_typeFld,
            po_expense_idFld,
            {
                xtype: "displayfield", hideLabel: true,
                value: "<span style='font-size:12px;color:#000;font-weight:bold;'>แหล่งเงิน <span style='color:red'>*</span> สามารถเลือกได้มากกว่า 1 แหล่งเงิน ซึ่งจะต้องแยกเงินในรายละเอียดรายการซื้อจ้าง</span>",
            },
            addFundSourceBtn,
            // ทุกช่องของแหล่งเงินกลับมาอยู่บรรทัดเดียวกันเหมือนฟอร์มต้นแบบ - ที่เคยโดนตัด
            // มองไม่เห็นก่อนหน้านี้ไม่ใช่เพราะ anchor แคบไป แต่เพราะ RadioGroup
            // (i_pr_typeFld) ไม่ได้กำหนด width ตรงๆ เลยขยายเบียดช่องอื่นแทน (แก้ที่ต้นตอ
            // ตรงจุดประกาศตัวแปรด้านบนแล้ว - ใส่ width: 170 ให้ชัดเจน)
            {
                xtype: "compositefield", fieldLabel: "แหล่งเงินที่ 1", anchor: "98%",
                items: [dc_expense_budget_type_idFld, i_pr_typeFld, f_fund_amtFld, {xtype: "displayfield", value: "<span style='color:red'>*</span>", width: 12}],
            },
            {
                xtype: "compositefield", fieldLabel: "แหล่งเงินที่ 2", id: "fundSource2GroupID", hidden: true, anchor: "98%",
                items: [dc_expense_budget_type_id2Fld, i_pr_type2Fld, f_fund_amt2Fld, removeFund2Btn],
            },
            {
                xtype: "compositefield", fieldLabel: "แหล่งเงินที่ 3", id: "fundSource3GroupID", hidden: true, anchor: "98%",
                items: [dc_expense_budget_type_id3Fld, i_pr_type3Fld, f_fund_amt3Fld, removeFund3Btn],
            },
            f_totalDisplayFld,
            {
                xtype: "displayfield", hideLabel: true,
                value: "<span style='font-size:12px;color:#000;font-weight:bold;'>รหัสเอกสารอ้างอิง <span style='color:red'>*</span> ชื่อเรื่อง/หน่วยงาน/จำนวนเงิน ระบบจะแจ้งหากซ้ำ</span>",
            },
            c_pr_doc_refFld,
            d_pr_doc_refFld,
            // ใช้ border-top แทน <hr> เปล่าๆ (ที่เคยเจอปัญหาเรนเดอร์เป็นจุดเล็กๆ ตอน
            // เปิดฟอร์มครั้งแรกก่อน doLayout) กันปัญหาเดิมซ้ำ
            {xtype: "box", autoEl: {tag: "div", style: "border-top:1px solid #b5c7de;margin:8px 0;height:0;"}},
            modesubFld,
        ],
        buttons: [
            {text: "บันทึกรายการ", iconCls: "icon-save", handler: saveNewPr},
            {text: Ext.GLOBAL_BU_BACK_TH, iconCls: "icon-clear", handler: function () { win.destroy(); }},
        ],
    });
    win.show();

    // โหมดแก้ไข (ดับเบิลคลิกแถวในกริด) - เติมค่าเดิมทุกช่องจาก record ที่เลือก รวมทั้งเผย
    // แหล่งเงินที่ 2/3 ถ้าเคยกรอกไว้ (loadRecord ใช้ไม่ได้ตรงๆ เพราะฟอร์มนี้เป็น items
    // array ธรรมดาไม่ได้ห่อด้วย Ext.FormPanel) - ต้องทำหลัง win.show() เท่านั้น เพราะ
    // ช่องที่มี id (fundSource2GroupID ฯลฯ) ยังไม่ถูกสร้างจริงจนกว่าหน้าต่างจะ render
    // (เรียก Ext.getCmp() ก่อนหน้านี้จะได้ undefined แล้ว error - บั๊กที่เจอจริง)
    if (isEdit) {
        i_type_bgFld.setValue(rec.get("i_type_bg") || 1);
        c_pr_codeFld.setValue(rec.get("c_pr_code") || "(ยังไม่ได้ออกเลข)");
        c_project_nameFld.setValue(rec.get("c_project_name"));
        i_budget_yearFld.setValue(rec.get("i_budget_year"));
        dc_cost_idFld.setValue(rec.get("dc_cost_id") || MEDSUP_DC_COST_ID);
        i_purchaseFld.setValue(rec.get("i_purchase") || 1);
        i_product_typeFld.setValue(rec.get("i_product_type") || 1);
        po_expense_idFld.setValue(rec.get("po_expense_id"));
        po_expense_idFld.setRawValue(rec.get("c_expense_name"));
        c_ap_dept_typeFld.setValue(rec.get("c_ap_dept_type") || "APMS");
        dc_expense_budget_type_idFld.setValue(rec.get("dc_expense_budget_type_id"));
        dc_expense_budget_type_idFld.setRawValue(rec.get("c_fund_source"));
        f_fund_amtFld.setValue(String(rec.get("f_fund_amt") || "0").replace(/,/g, ""));
        i_pr_typeFld.setValue(rec.get("i_pr_type") || 1);
        c_pr_doc_refFld.setValue(rec.get("c_pr_doc_ref"));
        d_pr_doc_refFld.setValue(rec.get("d_pr_doc_ref"));
        if (rec.get("dc_expense_budget_type_id2") > 0) {
            dc_expense_budget_type_id2Fld.setValue(rec.get("dc_expense_budget_type_id2"));
            dc_expense_budget_type_id2Fld.setRawValue(rec.get("c_fund_source2"));
            f_fund_amt2Fld.setValue(String(rec.get("f_fund_amt2") || "0").replace(/,/g, ""));
            i_pr_type2Fld.setValue(rec.get("i_pr_type2") || 1);
            Ext.getCmp("fundSource2GroupID").show();
        }
        if (rec.get("dc_expense_budget_type_id3") > 0) {
            dc_expense_budget_type_id3Fld.setValue(rec.get("dc_expense_budget_type_id3"));
            dc_expense_budget_type_id3Fld.setRawValue(rec.get("c_fund_source3"));
            f_fund_amt3Fld.setValue(String(rec.get("f_fund_amt3") || "0").replace(/,/g, ""));
            i_pr_type3Fld.setValue(rec.get("i_pr_type3") || 1);
            Ext.getCmp("fundSource3GroupID").show();
            Ext.getCmp("addFundSourceBtnID").hide();
        }
        sumFundAmounts();
    }
}

Ext.AppUx = function (app, menu) {
    Ext.user_right_add = user_right_add;
    Ext.user_right_edit = user_right_edit;
    Ext.user_right_delete = user_right_delete;
    // Ext.menu_name/Ext.menu_code ไม่ได้ถูกตั้งค่าไว้สำหรับ template หน้าเดี่ยวๆ แบบนี้
    // (newTorMedSup.php ไม่ได้ผ่าน contract.php ที่ตั้งค่าตัวแปรพวกนี้ให้) ถ้าใช้ตรงๆ
    // จะได้ข้อความ "undefined undefined" ที่แท็บ (บั๊กที่เจอจริง) ใช้ชื่อคงที่แทน
    Ext.title = "บันทึก PR";
    Ext.selectRow = [];

    Ext.loadStore = function () {};

    var MenuButton = function () {
        var menuList = new Ext.menu.Menu({id: "mainMenu", border: false});
        var tb = new Ext.Toolbar({text: " รายการเมนู ", border: false, iconCls: "menu", menu: menuList});
        tb.add({text: " รายการเมนู ", iconCls: "bmenu", border: false, menu: menuList});
        menuList.addSeparator();
        menuList.add({text: "สร้าง PR ใหม่", icon: "../images/icons/add.png"})
            .on("click", function () {
                winAddMedSupPr();
            });
        tb.doLayout();
        return tb;
    };

    Ext.extend(
        (gridMain = function () {
            var colmnn = [
                new Ext.grid.RowNumberer({header: "ที่", dataIndex: "no", width: 40}),
                {header: "รหัส PR", dataIndex: "c_pr_code", width: 160},
                {header: "เรื่อง/โครงการ", dataIndex: "c_project_name", width: 260},
                {header: "ปีงบประมาณ", dataIndex: "i_budget_year", width: 80, align: "center"},
                {header: "ประเภท", dataIndex: "c_ap_dept_type", width: 80, align: "center"},
                {header: "ค่าใช้จ่าย", dataIndex: "c_expense_name", width: 220},
                {
                    header: "ขอดำเนินการ", dataIndex: "i_purchase", width: 90, align: "center",
                    renderer: function (v) { return {1: "จัดซื้อ", 2: "จัดจ้าง", 3: "จัดเช่า"}[v] || ""; },
                },
                {
                    header: "ของที่ได้มา", dataIndex: "i_product_type", width: 90, align: "center",
                    renderer: function (v) { return {1: "วัสดุ", 2: "ครุภัณฑ์"}[v] || ""; },
                },
                {header: "แหล่งเงินที่ 1", dataIndex: "c_fund_source", width: 150},
                {header: "จำนวนเงิน", dataIndex: "f_fund_amt", width: 100, align: "right"},
                {header: "รหัสเอกสารอ้างอิง", dataIndex: "c_pr_doc_ref", width: 130},
                {header: "วันที่สร้าง", dataIndex: "d_create", width: 130},
                {header: "ผู้สร้างรายการ", dataIndex: "c_create_name", width: 150},
                {
                    header: "แก้ไข", sortable: false, hideable: false, draggable: false, align: "center",
                    id: "editPrID", width: 40, dataIndex: "sp_tor_period_bill_id",
                    renderer: function () {
                        return '<img src="../images/icons/document_edit.gif" style="cursor:pointer"/>';
                    }
                },
                {
                    header: "ลบ", sortable: false, hideable: false, draggable: false, align: "center",
                    id: "delPrID", width: 35, dataIndex: "sp_tor_period_bill_id",
                    renderer: function () {
                        return '<img src="../images/icons/table_delete.png" style="cursor:pointer"/>';
                    }
                },
            ];

            // แก้ไข/ลบ PR ได้อิสระจากหน้านี้เอง ไม่กระทบสัญญาที่เคยเลือก PR นี้ไปสร้างแล้ว
            // (แยกคนละแถว/คนละ hdr_id กันตั้งแต่ตอนบันทึกสัญญาแล้ว - ดู mode ADD ใน
            // mnMedSupPeriodBillController.php)
            function cellClick(grid, rowIndex, columnIndex) {
                var record = grid.getStore().getAt(rowIndex);
                if (columnIndex === grid.getColumnModel().getIndexById("editPrID")) {
                    winAddMedSupPr(record);
                } else if (columnIndex === grid.getColumnModel().getIndexById("delPrID")) {
                    Ext.MessageBox.show({
                        title: "ยืนยัน",
                        msg: "คุณต้องการที่จะลบ PR รายการนี้ใช่หรือไม่ ?",
                        buttons: Ext.MessageBox.OKCANCEL,
                        icon: Ext.MessageBox.WARNING,
                        fn: function (btn) {
                            if (btn === "ok") {
                                Ext.Ajax.request({
                                    url: "tor/api/mnMedSupPeriodBillController.php",
                                    method: "POST",
                                    params: {mode: "DELETE", sp_tor_period_bill_hdr_id: record.get("sp_tor_period_bill_hdr_id")},
                                    success: function () {
                                        Ext.storeMedSupPrList.reload();
                                    },
                                    failure: function () {
                                        Ext.Msg.alert("แจ้งเตือน", "ลบไม่สำเร็จ");
                                    }
                                });
                            }
                        }
                    });
                }
            }

            gridMain.superclass.constructor.call(this, {
                region: "center",
                title: Ext.title,
                xtype: "grid",
                id: "tabpanel1",
                border: true,
                stripeRows: true,
                loadMask: true,
                layout: "fit",
                viewConfig: {emptyText: "ยังไม่มี PR ที่สร้างจากเมนูนี้..", deferEmptyText: true},
                store: Ext.storeMedSupPrList,
                tbar: MenuButton(),
                columns: colmnn,
                listeners: {
                    cellclick: cellClick,
                    rowdblclick: function (grid, rowIndex) {
                        winAddMedSupPr(grid.getStore().getAt(rowIndex));
                    },
                },
                bbar: new Ext.PagingToolbar({
                    pageSize: 20,
                    store: Ext.storeMedSupPrList,
                    displayInfo: true,
                    displayMsg: "Displaying topics {0} - {1} of {2}",
                }),
            });
        }),
        Ext.grid.GridPanel,
        {}
    );
};

// หน้านี้เป็น template แบบเดียวกับ newTor.php/regTor.js (body ว่างเปล่า ไม่ได้ผ่าน
// contract.php ที่มี viewport/contenterCenter สร้างไว้ให้แล้วเหมือนเมนูอื่นในตระกูล
// เวชภัณฑ์ เช่น acceptMedSup.js/deliverWorkMedSup.js/medSupPeriodBill.js) จึงต้องสร้าง
// Ext.Viewport เองที่นี่ แล้วค่อยเรียก Ext.AppUx() ก่อน - ถ้าลืมส่วนนี้ไป หน้าจะว่างเปล่า
// เพราะไม่มีอะไรถูก mount ลง DOM เลย (บั๊กที่เจอจริงตอนทดสอบครั้งแรก)
Ext.onReady(function () {
    Ext.QuickTips.init();
    Ext.user_right_add = user_right_add;
    Ext.user_right_edit = user_right_edit;
    Ext.user_right_delete = user_right_delete;
    Ext.AppUx("SP", "การจัดทำ PR (หน่วยงาน) เวชภัณฑ์");
    new Ext.Viewport({
        layout: "border",
        items: new Ext.TabPanel({
            region: "center",
            border: false,
            id: "contenterCenter",
            defaults: {autoScroll: true, layout: "fit"},
            items: [new gridMain()],
        }),
    });
    Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
});
