/* global Ext, user_right_add, user_right_edit, user_right_delete */

Ext.url_process = './tor/api/mnMedSupPeriodBillController.php';

// เมนูนี้ทั้งหน้าเป็นของฝ่ายเวชภัณฑ์การแพทย์โดยเฉพาะ (ST00092) - ใช้ dc_cost_id ของ
// หน่วยงานนี้ตรงๆ เสมอ ไม่ใช้ dc_cost_id ของผู้ใช้ที่ล็อกอินอยู่ (Ext.session.dc_cost_id)
// เพราะเจ้าหน้าที่จากหน่วยงานอื่น (เช่นฝ่ายพัสดุ) ก็อาจเข้ามาบันทึกรายการแทนได้ ถ้าใช้
// dc_cost_id ของผู้ใช้จะทำให้ค้นใบกันเหลื่อมผิดหน่วยงาน/บันทึกสัญญาผิดหน่วยงานไปด้วย
Ext.MEDSUP_DC_COST_ID = 82;

// ตัดรหัสตัวเลขนำหน้าออกจากชื่อค่าใช้จ่าย ("010200010001 : ค่าจ้างประจำ" -> "ค่าจ้างประจำ")
// ใช้ตั้งชื่อโครงการอัตโนมัติ ทั้งตอนเลือกชื่อค่าใช้จ่ายเองและตอนดึงมาจากใบกันเหลื่อม
Ext.fnProjectNameFromExpense = function (cName) {
    var parts = String(cName).split(":");
    return parts.length > 1 ? parts.slice(1).join(":").replace(/^\s+/, "") : cName;
};

// ext-all-debug.js ที่ระบบนี้ใช้ (เช็คแล้วที่ js/ext-3.4.0/ext-all-debug.js) เป็นบิลด์ที่
// ComboBox.doQuery เรียก this.store.filter(this.displayField, q) เฉยๆ โดยไม่ส่ง
// this.anyMatch/this.caseSensitive ต่อให้ store.filter ตามที่ ExtJS 3.4 มาตรฐานควรทำ - ทำให้
// ตั้ง anyMatch:true ที่คอนฟิกคอมโบเฉยๆ ไม่มีผลอะไร (ค้นหาได้แค่ขึ้นต้นด้วยคำนั้นเท่านั้น
// เช่น ถ้า c_name ขึ้นต้นด้วยรหัสตัวเลข พิมพ์ชื่อเป็นตัวอักษรจะไม่เจอเลย) ต้อง override
// doQuery เองสำหรับคอมโบที่อยากให้ค้นหาแบบ "มีคำนี้อยู่ตรงไหนก็ได้ในชื่อ" - โค้ดข้างล่างนี้
// เหมือนกับ doQuery ต้นฉบับของเฟรมเวิร์กทุกอย่าง ต่างแค่ส่ง this.anyMatch/this.caseSensitive
// ให้ store.filter ด้วย
Ext.fnAnyMatchDoQuery = function (q, forceAll) {
    q = Ext.isEmpty(q) ? '' : q;
    var qe = {query: q, forceAll: forceAll, combo: this, cancel: false};
    if (this.fireEvent('beforequery', qe) === false || qe.cancel) {
        return false;
    }
    q = qe.query;
    forceAll = qe.forceAll;
    if (forceAll === true || (q.length >= this.minChars)) {
        if (this.lastQuery !== q) {
            this.lastQuery = q;
            if (this.mode == 'local') {
                this.selectedIndex = -1;
                if (forceAll) {
                    this.store.clearFilter();
                } else {
                    this.store.filter(this.displayField, q, this.anyMatch, this.caseSensitive);
                }
                this.onLoad();
            } else {
                this.store.baseParams[this.queryParam] = q;
                this.store.load({params: this.getParams(q)});
                this.expand();
            }
        } else {
            this.selectedIndex = -1;
            this.onLoad();
        }
    }
};

// รายการปีงบประมาณ (พ.ศ.) สำหรับ dropdown - รูปแบบเดียวกับที่ใช้ในหน้าอื่นของระบบ
Ext.yearThPeriodBill = function () {
    var years = [];
    var currentTime = new Date();
    var now = currentTime.getFullYear() + 1;
    var id = currentTime.getFullYear() - 3;
    while (id <= now) {
        years.push({id: id, c_name: id + 543});
        id++;
    }
    return years;
};

Ext.storeYearPeriodBill = new Ext.data.JsonStore({
    fields: ["id", "c_name"],
    autoDestroy: false,
    autoLoad: false,
    data: Ext.yearThPeriodBill(),
});

// ตัวเลือกประเภทของสัญญา (ตามที่ระบุไว้ในไฟล์ออกแบบ)
Ext.storeContractTypePeriodBill = new Ext.data.JsonStore({
    fields: ["id", "c_name"],
    autoDestroy: false,
    autoLoad: false,
    data: [
        {id: "จัดซื้อจะขาย", c_name: "จัดซื้อจะขาย"},
        {id: "ใบสั่งซื้อ", c_name: "ใบสั่งซื้อ"},
        {id: "สัญญา", c_name: "สัญญา"},
    ],
});

// รายการ PR ที่สร้างไว้จากเมนู "การจัดทำ PR (หน่วยงาน) เวชภัณฑ์" (regTorMedSup.js) แต่ยัง
// ไม่ถูกนำไปทำสัญญา (c_contract_code เป็น null) - ใช้กับ dropdown "เลือกจาก PR ที่มีอยู่"
// ในฟอร์มนี้ตอน "เพิ่มรายการใหม่" เท่านั้น ใช้ endpoint/type เดียวกับกริดของเมนูนั้นเลย
Ext.storeMedSupPrLookup = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "tor/api/List_MedSupPeriodBill.php",
    baseParams: {type: "medsup_pr_list"},
    root: "data",
    idProperty: "sp_tor_period_bill_id",
    totalProperty: "totalCount",
    fields: [
        "sp_tor_period_bill_id", "sp_tor_period_bill_hdr_id", "c_pr_code", "c_project_name",
        "i_budget_year", "c_ap_dept_type", "po_expense_id", "c_expense_name",
        "dc_expense_budget_type_id", "c_fund_source", "f_fund_amt",
        "dc_expense_budget_type_id2", "c_fund_source2", "f_fund_amt2",
        "dc_expense_budget_type_id3", "c_fund_source3", "f_fund_amt3",
        "bg_reserve_money_id", "bg_reserve_money_id2", "bg_reserve_money_id3",
    ],
});

// ตัวเลือกหน่วยงานที่ใช้ออกเลข AP (เดิมเป็นข้อความคงที่ "APMS - เวชภัณฑ์" อย่างเดียว
// ตอนนี้เลือกได้จริง มีผลกับ prefix ตอนออกเลข AP จริงที่เมนู "ตรวจรับ (เวชภัณฑ์)")
Ext.storeApDeptTypePeriodBill = new Ext.data.JsonStore({
    fields: ["id", "c_name"],
    autoDestroy: false,
    autoLoad: false,
    data: [
        {id: "APPS", c_name: "APPS - พัสดุ"},
        {id: "APMD", c_name: "APMD - เภสัช"},
        {id: "APMS", c_name: "APMS - เวชภัณฑ์"},
    ],
});

// ผู้ใช้ของ พัสดุ(38)/เภสัช(50)/เวชภัณฑ์(82) ล็อกประเภทตามหน่วยงานตัวเอง เหลือรายการเดียวและ
// ไม่มี dropdown - admin/หน่วยงานอื่นเห็นครบทั้ง 3 รายการและเลือกเองได้ (แมพเดียวกับ
// Ext.MEDSUP_AP_DEPT_COST ใน regTorMedSup.js)
Ext.userApDeptPeriodBill = (function () {
    // admin (user_id = 1) ไม่ถูกล็อกเสมอ
    if (parseInt(Ext.session && Ext.session.user_id) === 1) { return null; }
    var map = {38: "APPS", 50: "APMD", 82: "APMS"};
    return map[parseInt(Ext.session && Ext.session.dc_cost_id)] || null;
})();
if (Ext.userApDeptPeriodBill) {
    Ext.storeApDeptTypePeriodBill.filter("id", Ext.userApDeptPeriodBill);
}

// ค่าใช้จ่ายเริ่มต้นของเภสัช/เวชภัณฑ์ = bg_expense_id 133 (030300090001 : ค่ายาและเวชภัณฑ์
// อวัยวะเทียม) ล็อกไม่ให้เลือกเอง
Ext.expenseLockedPeriodBill = Ext.userApDeptPeriodBill === "APMD" || Ext.userApDeptPeriodBill === "APMS";
Ext.DEFAULT_EXPENSE_ID_PERIOD_BILL = "133";
// เติมค่าเริ่มต้นลงช่องค่าใช้จ่าย/ชื่อโครงการ (ชื่อโครงการเติมเฉพาะตอนยังว่าง) - ต้องรอทั้ง
// store และ combo พร้อม จึงถูกเรียกทั้งตอน store โหลดเสร็จและตอน combo render
Ext.fnApplyDefaultExpensePeriodBill = function () {
    var combo = Ext.getCmp("po_expense_idID");
    var rec = Ext.storePoExpensePeriodBill.getById(Ext.DEFAULT_EXPENSE_ID_PERIOD_BILL);
    if (!combo || !combo.rendered || !rec || combo.getValue()) { return; }
    combo.setValue(rec.get("id"));
    Ext.getCmp("c_expense_nameID").setValue(rec.get("c_name"));
    var nameFld = Ext.getCmp("c_nameID");
    if (nameFld && !nameFld.getValue()) {
        nameFld.setValue(Ext.fnProjectNameFromExpense(rec.get("c_name")));
    }
};

Ext.storeContractLookup = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "tor/api/List_MedSupPeriodBill.php",
    baseParams: {type: "lookup_contract"},
    root: "data",
    idProperty: "sp_tor_contract_id",
    fields: ["sp_tor_contract_id", "sp_tor_id", "c_contract_code", "c_name", "i_yyyy"],
});

Ext.storePeriodLookup = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "tor/api/List_MedSupPeriodBill.php",
    baseParams: {type: "lookup_period"},
    root: "data",
    idProperty: "sp_tor_hdr_period_id",
    fields: ["sp_tor_hdr_period_id", "i_period", "sp_tor_contract_id", "i_yyyy"],
});

// แหล่งเงิน: ใช้ตาราง dc_expense_budget_type ตัวเดียวกับที่ระบบใช้ทั้งระบบ
// (endpoint เดียวกับที่ addPo.js/contract.js ใช้) อ่านอย่างเดียว ไม่ได้เขียนอะไร
// ลงตารางนี้ - ค่าที่เลือกจะถูกเก็บแยกไว้ในตาราง sp_tor_period_bill ของเมนูนี้เอง
Ext.storeExpenseBudgetTypePeriodBill = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: {type: "dc_expense_budget_type"},
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
});

// เงิน "กันเหลื่อม" (เงินกันเงินเหลื่อมปี) ที่ยังมีวงเงินเหลือของหน่วยงานนี้ - endpoint/query
// เดียวกับที่หน้าจออื่นของระบบ (เช่น ใบขอซื้อ/ตรวจรับ) ใช้เลือกใบกันเหลื่อม อ้างอิงจาก
// bg_overlap_hdr โหลดแบบ on-demand ตอนผู้ใช้เลือกตัวเลือก "กันเหลื่อม" ของแหล่งเงินนั้นๆ
// เท่านั้น (ใช้ store เดียวกันทั้ง 3 แหล่งเงิน เพราะรายการที่เลือกได้เหมือนกันหมด
// ต่างกันแค่ค่าที่ถูกเลือกไว้ต่อช่อง)
// ส่ง dc_cost_id + i_yyyy_overlap (ปีของใบกันเหลื่อม) - endpoint จะคืนใบกันเหลื่อมทุก
// แหล่งเงินของปีนั้น มา dc_expense_budget_type_id/f_total ต่อใบให้เติมแหล่งเงิน/จำนวนเงิน
// ให้อัตโนมัติทันทีที่เลือก (ไม่ต้องรู้แหล่งเงินล่วงหน้า)
Ext.storeBookingPeriodBill = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: {type: "booking_store"},
    root: "data",
    idProperty: "id",
    fields: ["id", "c_booking", "i_year", "dc_cost_id", "bg_expense_id", "dc_expense_budget_type_id", "f_total"],
});

// "แหล่งเงินของงวดนี้" ไม่ค้นหาจากรายการแหล่งเงินทั้งระบบซ้ำ แต่ไล่ตามแหล่งเงินที่
// เลือกไว้ในส่วนหัวเท่านั้น (แหล่งเงินที่ 1/2/3 ที่กรอกไว้ด้านบน) - รีเฟรชทุกครั้งที่
// แหล่งเงินระดับหัวเรื่องเปลี่ยน
Ext.storeHeaderFundChoicesPeriodBill = new Ext.data.JsonStore({
    fields: ["id", "c_name", "amt"],
    autoDestroy: false,
    autoLoad: false,
    data: [],
});

Ext.fnRefreshHeaderFundChoices = function () {
    var arr = [];
    for (var n = 1; n <= 3; n++) {
        var suffix = n === 1 ? "" : String(n);
        var idFld = Ext.getCmp("dc_expense_budget_type_id" + suffix + "ID");
        var nameFld = Ext.getCmp("c_fund_source" + suffix + "ID");
        var amtFld = Ext.getCmp("f_fund_amt" + suffix + "ID");
        if (idFld && nameFld && idFld.getValue() && nameFld.getValue()) {
            arr.push({
                id: idFld.getValue(),
                c_name: "แหล่งเงินที่ " + n + ": " + nameFld.getValue(),
                amt: amtFld ? amtFld.getValue() : "",
            });
        }
    }
    Ext.storeHeaderFundChoicesPeriodBill.loadData(arr);
    Ext.fnAutoFillAllPeriodFundSources();
};

// ถ้าแหล่งเงินที่เลือกไว้ด้านบนมีอยู่ทางเลือกเดียว ให้เติม "แหล่งเงินของงวดนี้" และ
// "จำนวนเงินจากแหล่งเงินนี้" (ล้อมาจากจำนวนเงินของแหล่งเงินนั้นที่กรอกไว้ด้านบน) ให้
// งวดนั้นๆ อัตโนมัติเลย ไม่ต้องให้ผู้ใช้กดเลือก/กรอกเอง (เพราะไม่มีทางเลือกอื่นอยู่แล้ว)
// ถ้ามีมากกว่า 1 แหล่ง ผู้ใช้ต้องเลือกเองว่าใช้แหล่งไหนสำหรับงวดนั้น ถ้าไม่มีแหล่งเงิน
// ที่เลือกไว้เลย ให้เคลียร์ค่าทิ้ง (กันกรณีแหล่งเงินที่เคยเลือกไว้ถูกลบไปแล้ว)
Ext.fnAutoFillPeriodFundSource = function (line) {
    var combo = Ext.getCmp("dc_expense_budget_type_id_dtlID[" + line + "]");
    var hidden = Ext.getCmp("c_fund_source_dtlID[" + line + "]");
    var amtFld = Ext.getCmp("f_fund_amt_dtlID[" + line + "]");
    if (!combo || !hidden || !amtFld) {
        return;
    }
    if (Ext.storeHeaderFundChoicesPeriodBill.getCount() === 1) {
        var rec = Ext.storeHeaderFundChoicesPeriodBill.getAt(0);
        combo.setValue(rec.get("id"));
        combo.setRawValue(rec.get("c_name"));
        hidden.setValue(rec.get("c_name").replace(/^แหล่งเงินที่ \d+:\s*/, ""));
        amtFld.setValue(rec.get("amt"));
    } else if (Ext.storeHeaderFundChoicesPeriodBill.getCount() === 0) {
        combo.setValue("");
        combo.setRawValue("");
        hidden.setValue("");
        amtFld.setValue("");
    }
};

Ext.fnAutoFillAllPeriodFundSources = function () {
    (Ext.activePeriodLines || []).forEach(function (line) {
        Ext.fnAutoFillPeriodFundSource(line);
    });
};

// ตรวจก่อนบันทึกเสมอ: ผลรวม "จำนวนเงินจากแหล่งเงินนี้" ของทุกงวดที่ผูกกับแหล่งเงินเดียวกัน
// ต้องไม่เกิน "จำนวนเงิน" ที่จองไว้ของแหล่งเงินนั้น (ที่กรอก/ดึงมาจากใบกันเหลื่อมด้านบน)
Ext.fnValidatePeriodAmounts = function () {
    var usedByFund = {};
    (Ext.activePeriodLines || []).forEach(function (line) {
        var combo = Ext.getCmp("dc_expense_budget_type_id_dtlID[" + line + "]");
        var amtFld = Ext.getCmp("f_fund_amt_dtlID[" + line + "]");
        var fundId = combo ? combo.getValue() : "";
        if (!combo || !amtFld || !fundId) {
            return;
        }
        var amt = parseFloat(String(amtFld.getValue()).replace(/,/g, "")) || 0;
        usedByFund[fundId] = (usedByFund[fundId] || 0) + amt;
    });

    for (var n = 1; n <= 3; n++) {
        var suffix = n === 1 ? "" : String(n);
        var idFld = Ext.getCmp("dc_expense_budget_type_id" + suffix + "ID");
        var fundId = idFld ? idFld.getValue() : "";
        if (!idFld || !fundId) {
            continue;
        }
        var nameFld = Ext.getCmp("c_fund_source" + suffix + "ID");
        var limitFld = Ext.getCmp("f_fund_amt" + suffix + "ID");
        var limit = parseFloat(String(limitFld ? limitFld.getValue() : "").replace(/,/g, "")) || 0;
        var used = usedByFund[fundId] || 0;
        // เผื่อคลาดเคลื่อนจากการปัดเศษทศนิยม
        if (used - limit > 0.01) {
            Ext.Msg.alert(
                "แจ้งเตือน",
                "จำนวนเงินในงวดเกินจากแหล่งเงินที่จองมา<br>แหล่งเงินที่ " + n + ": " + (nameFld ? nameFld.getValue() : "")
                + "<br>ยอดรวมที่กรอกในงวด: " + Ext.floatRenderer(used) + " บาท"
                + "<br>วงเงินที่จองมา: " + Ext.floatRenderer(limit) + " บาท"
            );
            return false;
        }
    }
    return true;
};

// ชื่อค่าใช้จ่าย: คือฟิลด์เดียวกับ "รายการย่อย" ในหน้าสัญญาหลัก (contract.js)
// ผูกกับตาราง po_expense ตัวเดียวกับที่ระบบใช้ทั้งระบบ อ่านอย่างเดียวเช่นกัน
Ext.storePoExpensePeriodBill = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: {type: "po_expense"},
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
});
if (Ext.expenseLockedPeriodBill) {
    Ext.storePoExpensePeriodBill.on("load", Ext.fnApplyDefaultExpensePeriodBill);
}

Ext.storeCreditorLookupPeriodBill = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "tor/api/List_MedSupPeriodBill.php",
    baseParams: {type: "lookup_creditor"},
    root: "data",
    idProperty: "dc_creditor_id",
    fields: ["dc_creditor_id", "c_code", "c_name", "c_tax_no"],
});

// แต่ละงวดที่เพิ่ม[+] มีเลขงวดเป็นลำดับอัตโนมัติ (1,2,3...) ฟังก์ชันนี้เช็คว่า
// เลขงวดนั้นตรงกับ sp_tor_hdr_period_id ของสัญญาที่มีอยู่แล้วหรือไม่ (เผื่อผูก id
// จริงไว้ใช้กับเมนู ST00093 ต่อ) ถ้าเป็นสัญญา/งวดใหม่ที่ยังไม่มีในระบบ จะหาไม่เจอ
// ก็ปล่อยว่างไว้ ไม่ error
Ext.fnMatchPeriodId = function (line) {
    var match = null;
    Ext.storePeriodLookup.each(function (rec) {
        if (rec.get("i_period") === line) {
            match = rec;
        }
    });
    var fld = Ext.getCmp("sp_tor_hdr_period_idID[" + line + "]");
    if (fld) {
        fld.setValue(match ? match.get("sp_tor_hdr_period_id") : null);
    }
};

// จำกัดจำนวนงวดตามประเภทของสัญญา: ใบสั่งซื้อ ทำได้แค่ 1 งวด ส่วนสัญญา/จัดซื้อจะขาย
// เพิ่มได้ไม่จำกัด
Ext.fnGetPeriodLimit = function () {
    var type = Ext.getCmp("c_contract_typeID") ? Ext.getCmp("c_contract_typeID").getValue() : "";
    if (type === "ใบสั่งซื้อ") {
        return 1;
    }
    return 999;
};

Ext.fnUpdateAddPeriodButton = function () {
    var btn = Ext.getCmp("addMedSupPeriodBtnID");
    if (!btn) {
        return;
    }
    if ((Ext.currentLineCount || 0) >= Ext.fnGetPeriodLimit()) {
        btn.hide();
    } else {
        btn.show();
    }
};

Ext.fnAddMedSupItems = function (li) {
    var total = Ext.getCmp('win-frm-medsupID').items.length;
    var totalCount = total + 2;
    var line = Ext.objLine;

    Ext.getCmp('win-frm-medsupID').insert(totalCount, new Ext.form.FieldSet({
        title: 'งวดที่ ' + (Ext.objLine),
        collapsible: true,
        autoHeight: true,
        id: "medsupLegendID[" + line + "]",
        anchor: "60%",
        defaults: {width: 320},
        defaultType: 'textfield',
        items: [
            {
                xtype: "hidden",
                id: "i_periodID[" + line + "]",
                name: "i_period[" + line + "]",
                value: line,
            },
            {
                xtype: "hidden",
                id: "sp_tor_hdr_period_idID[" + line + "]",
                name: "sp_tor_hdr_period_id[" + line + "]",
            },
            {
                xtype: "textfield",
                id: "c_doc_refID[" + line + "]",
                name: "c_doc_ref[" + line + "]",
                width: 220,
                fieldLabel: "เลขงวด",
                // default เป็นเลขงวดตามลำดับที่เพิ่ม (01, 02, 03, ...) ทุกครั้งที่เพิ่มงวดใหม่
                // - ใบสั่งซื้อมีได้แค่งวดเดียวอยู่แล้ว (Ext.fnGetPeriodLimit) จึงได้ "01" เสมอ
                // โดยไม่ต้องแยกเงื่อนไขตามประเภทสัญญา ยังแก้ไขเป็นค่าอื่นเองได้ตามปกติ
                value: (line < 10 ? "0" : "") + line,
                validator: function (val) {
                    return Ext.isEmpty(val) ? "กรุณากรอกข้อมูลให้ถูกต้อง" : true;
                }
            },
            {
                fieldLabel: "วันที่ครบกำหนดส่งของ",
                id: "d_doc_dateSubID[" + line + "]",
                name: "d_doc_dateSub[" + line + "]",
                xtype: "datefield",
                width: 220,
                validator: function (val) {
                    return Ext.isEmpty(val) ? "กรุณาระบุวันที่ครบกำหนดส่งของ" : true;
                }
            },
            {
                xtype: "textarea",
                name: "c_detail[" + line + "]",
                id: "c_detailID[" + line + "]",
                width: 320,
                height: 50,
                fieldLabel: "รายละเอียด"
            },
            new Ext.form.ComboBox({
                id: "dc_expense_budget_type_id_dtlID[" + line + "]",
                hiddenName: "dc_expense_budget_type_id_dtl[" + line + "]",
                width: 320,
                fieldLabel: "แหล่งเงินของงวดนี้",
                mode: "local",
                // ไม่ค้นหาแหล่งเงินทั้งระบบซ้ำ - เลือกได้เฉพาะแหล่งเงินที่เลือกไว้
                // ในส่วนหัวด้านบนเท่านั้น (โฟลตามแหล่งเงินที่ผู้ใช้เลือกไว้แล้ว)
                store: Ext.storeHeaderFundChoicesPeriodBill,
                valueField: "id",
                displayField: "c_name",
                triggerAction: "all",
                forceSelection: true,
                typeAhead: false,
                // พิมพ์ค้นหาได้จากคำที่อยู่ตรงไหนก็ได้ในชื่อ ไม่ใช่แค่ขึ้นต้นด้วยคำนั้น
                anyMatch: true,
                caseSensitive: false,
                doQuery: Ext.fnAnyMatchDoQuery,
                // autoSelect ของ ComboBox ค่า default เป็น true ซึ่งจะเลือกรายการแรก
                // ในสโตร์ให้อัตโนมัติทันทีที่สโตร์โหลด/รีเฟรช (แม้ผู้ใช้ไม่ได้คลิกเลือก) -
                // ปิดไว้เพื่อให้ผู้ใช้ต้องเลือกเองเสมอ ไม่งั้นทุกงวดจะโดนเติม "แหล่งเงินที่ 1" ให้อัตโนมัติ
                autoSelect: false,
                emptyText: "เลือกจากแหล่งเงินที่เลือกไว้ด้านบน...",
                listeners: {
                    select: function (combo, record) {
                        var plain = record.get("c_name").replace(/^แหล่งเงินที่ \d+:\s*/, "");
                        Ext.getCmp("c_fund_source_dtlID[" + line + "]").setValue(plain);
                        // ล้อจำนวนเงินตามแหล่งเงินที่เลือกมาให้อัตโนมัติด้วย (แก้ไขเองต่อได้)
                        Ext.getCmp("f_fund_amt_dtlID[" + line + "]").setValue(record.get("amt"));
                    }
                }
            }),
            {xtype: "hidden", id: "c_fund_source_dtlID[" + line + "]", name: "c_fund_source_dtl[" + line + "]"},
            {
                xtype: "textfield",
                id: "f_fund_amt_dtlID[" + line + "]",
                name: "f_fund_amt_dtl[" + line + "]",
                width: 220,
                fieldLabel: "จำนวนเงินจากแหล่งเงินนี้",
                style: "text-align: right",
                validator: function (val) {
                    return Ext.isEmpty(val) ? "กรุณาระบุจำนวนเงิน" : true;
                },
                listeners: {
                    beforerender: function () {
                        this.fn = function () {
                            var val = this.getValue();
                            if (Ext.isEmpty(val)) {
                                return;
                            }
                            var f_total = parseFloat(String(val).replace(/,/g, "") / 1);
                            this.setValue(isNaN(f_total) ? "" : Ext.floatRenderer(f_total));
                        };
                    },
                    change: function () { this.fn(); },
                    blur: function () { this.fn(); },
                    afterrender: function () { this.fn(); }
                }
            },
            {
                xtype: "button",
                name: "button",
                iconCls: "icon-drop",
                text: " - ลบงวดที่ " + Ext.objLine + "",
                id: "medsupDelID[" + line + "]",
                width: "60px",
                handler: function () {
                    Ext.getCmp('win-frm-medsupID').remove(Ext.getCmp("medsupLegendID[" + line + "]"));
                    Ext.currentLineCount = Math.max(0, (Ext.currentLineCount || 0) - 1);
                    var idx = (Ext.activePeriodLines || []).indexOf(line);
                    if (idx > -1) {
                        Ext.activePeriodLines.splice(idx, 1);
                    }
                    Ext.fnUpdateAddPeriodButton();
                }
            }
        ]
    }));
    Ext.getCmp('win-frm-medsupID').doLayout();
    Ext.fnMatchPeriodId(line);
    Ext.activePeriodLines = Ext.activePeriodLines || [];
    Ext.activePeriodLines.push(line);
    Ext.fnAutoFillPeriodFundSource(line);
    Ext.currentLineCount = (Ext.currentLineCount || 0) + 1;
    Ext.fnUpdateAddPeriodButton();
};

// สร้าง panel 1 แถวของ "แหล่งเงินที่ N" (combo + จำนวนเงิน วางคู่กันในแถวเดียว
// ให้ดูกระชับ) สูงสุด 3 แหล่งต่อหัวเรื่อง ตามรูปแบบหน้าจอเปลี่ยนแปลงแหล่งเงินใน
// contract.js - แหล่งที่ 2/3 ซ่อนไว้ก่อน กดปุ่ม "+ เพิ่มแหล่งเงิน" ถึงจะโผล่มา
// hoistOverlapControls = true: ไม่ใส่ตัวเลือก "ประเภทงบประมาณ"/ปีของใบกัน/เลขที่ใบกัน
// ไว้ในพาเนลของแหล่งเงินนี้ (เอาไปแปะที่อื่นในฟอร์มแทน ผ่าน panel.reserveTypeGroup /
// panel.overlapYearCombo / panel.overlapCombo ที่แนบไว้ให้ผู้เรียกไปประกอบเลย์เอาต์เอง)
function fundSourceFieldSet(n, required, hoistOverlapControls) {
    var suffix = n === 1 ? "" : String(n);
    var comboId = "dc_expense_budget_type_id" + suffix + "ID";
    var hiddenNameField = "dc_expense_budget_type_id" + suffix;
    var nameHiddenId = "c_fund_source" + suffix + "ID";
    var nameField = "c_fund_source" + suffix;
    var amtId = "f_fund_amt" + suffix + "ID";
    var amtField = "f_fund_amt" + suffix;
    var panelId = "fundSourcePanel" + n + "ID";

    var combo = new Ext.form.ComboBox({
        id: comboId,
        hiddenName: hiddenNameField,
        anchor: "95%",
        fieldLabel: "แหล่งเงินที่ " + n,
        labelWidth: 100,
        mode: "local",
        store: Ext.storeExpenseBudgetTypePeriodBill,
        valueField: "id",
        displayField: "c_name",
        triggerAction: "all",
        forceSelection: true,
        typeAhead: false,
        anyMatch: true,
        caseSensitive: false,
        doQuery: Ext.fnAnyMatchDoQuery,
        emptyText: "กรุณาเลือกแหล่งเงิน...",
        validator: function (val) {
            return (required && Ext.isEmpty(val)) ? "กรุณาเลือกแหล่งเงินที่ 1" : true;
        },
        listeners: {
            select: function (combo, record) {
                Ext.getCmp(nameHiddenId).setValue(record.get("c_name"));
                Ext.fnRefreshHeaderFundChoices();
                Ext.fnRestoreFundSourceReserveStatus(n);
            }
        }
    });

    var columns = [
        {columnWidth: 0.55, layout: "form", border: false, items: [combo]},
        {
            columnWidth: 0.35, layout: "form", border: false,
            items: [{
                xtype: "textfield",
                id: amtId,
                name: amtField,
                anchor: "95%",
                fieldLabel: "จำนวนเงิน",
                labelWidth: 70,
                style: "text-align: right",
                validator: function (val) {
                    return (required && Ext.isEmpty(val)) ? "กรุณาระบุจำนวนเงิน" : true;
                },
                listeners: {
                    beforerender: function () {
                        this.fn = function () {
                            var val = this.getValue();
                            if (Ext.isEmpty(val)) {
                                return;
                            }
                            var f_total = parseFloat(String(val).replace(/,/g, "") / 1);
                            this.setValue(isNaN(f_total) ? "" : Ext.floatRenderer(f_total));
                        };
                    },
                    change: function () {
                        this.fn();
                        Ext.fnRefreshHeaderFundChoices();
                        Ext.fnRestoreFundSourceReserveStatus(n);
                    },
                    blur: function () {
                        this.fn();
                        Ext.fnRefreshHeaderFundChoices();
                        Ext.fnRestoreFundSourceReserveStatus(n);
                    },
                    afterrender: function () { this.fn(); }
                }
            }]
        },
    ];

    if (n > 1) {
        columns.push({
            columnWidth: 0.1, layout: "form", border: false,
            items: [{
                xtype: "button",
                text: "ลบ",
                iconCls: "icon-drop",
                handler: function () {
                    Ext.getCmp(comboId).setReadOnly(false);
                    Ext.getCmp(comboId).clearValue();
                    Ext.getCmp(nameHiddenId).setValue("");
                    Ext.getCmp(amtId).setValue("");
                    Ext.getCmp("i_bg_reserve_type" + suffix + "GroupID").items.each(function (radio) {
                        radio.setValue(radio.inputValue === 0);
                    });
                    Ext.getCmp("i_yyyy_overlap" + suffix + "ID").hide();
                    Ext.getCmp("i_yyyy_overlap" + suffix + "ID").clearValue();
                    Ext.getCmp("c_overlap" + suffix + "ID").hide();
                    Ext.getCmp("c_overlap" + suffix + "ID").clearValue();
                    Ext.getCmp("i_budget_year_overlap" + suffix + "ID").setValue("");
                    Ext.getCmp(panelId).hide();
                    Ext.fundSourceCount = Math.max(1, (Ext.fundSourceCount || 1) - 1);
                    Ext.fnUpdateAddFundButton();
                    Ext.fnRefreshHeaderFundChoices();
                    Ext.fnRestoreFundSourceReserveStatus(n);
                }
            }]
        });
    }

    // ตัวเลือก "ปีต่อปี" (งบประมาณปีปัจจุบัน - ค่าเริ่มต้น) / "กันเหลื่อม" (เงินกันเงิน
    // เหลื่อมปี) ต่อแหล่งเงินที่ n - เลือก "กันเหลื่อม" แล้วเลือกปีงบของใบกันเหลื่อม แล้ว
    // เลือกเลขที่ใบกันเหลื่อม จะดึง "แหล่งเงินที่ n" และ "จำนวนเงิน" มาเติมให้อัตโนมัติจาก
    // ตัวใบกันเหลื่อมเอง (ไม่ต้องเลือกแหล่งเงินเองก่อน) - endpoint api/All_PoWorkingImpHdr.php
    // type=booking_store (query จาก bg_overlap_hdr แบบเดียวกับหน้าใบขอซื้อ/ตรวจรับ) แสดง
    // ใบกันเหลื่อมทุกแหล่งเงินของปีงบนั้น พร้อม dc_expense_budget_type_id/f_total ต่อใบ
    var overlapYearCombo = new Ext.form.ComboBox({
        id: "i_yyyy_overlap" + suffix + "ID",
        hiddenName: "i_yyyy_overlap" + suffix,
        anchor: "95%",
        fieldLabel: "ปีงบประมาณของใบกันเหลื่อม",
        labelWidth: 150,
        hidden: true,
        mode: "local",
        store: Ext.storeYearPeriodBill,
        valueField: "id",
        displayField: "c_name",
        triggerAction: "all",
        forceSelection: true,
        typeAhead: false,
        anyMatch: true,
        caseSensitive: false,
        doQuery: Ext.fnAnyMatchDoQuery,
        emptyText: "กรุณาเลือกปีงบประมาณ...",
        validator: function (val) {
            return (this.isVisible() && Ext.isEmpty(val)) ? "กรุณาเลือกปีงบประมาณของใบกันเหลื่อม" : true;
        },
        listeners: {
            select: function () {
                overlapCombo.clearValue();
                Ext.getCmp("i_budget_year_overlap" + suffix + "ID").setValue("");
                var reqParams = {dc_cost_id: Ext.MEDSUP_DC_COST_ID, i_yyyy_overlap: overlapYearCombo.getValue()};
                console.log("โหลดใบกันเหลื่อม params =", reqParams);
                Ext.storeBookingPeriodBill.load({
                    params: reqParams,
                    callback: function (records, options, success) {
                        console.log("โหลดใบกันเหลื่อม success =", success, "จำนวน =", records ? records.length : 0);
                        if (success && (!records || records.length === 0)) {
                            Ext.Msg.alert("แจ้งเตือน", "ไม่พบใบกันเหลื่อมของหน่วยงานนี้ (dc_cost_id=" + reqParams.dc_cost_id + ") สำหรับปีงบประมาณที่เลือก");
                        } else if (!success) {
                            Ext.Msg.alert("แจ้งเตือน", "ดึงรายการใบกันเหลื่อมไม่สำเร็จ กรุณาเปิด console เพื่อดูรายละเอียด");
                        }
                    }
                });
            }
        }
    });

    var overlapCombo = new Ext.form.ComboBox({
        id: "c_overlap" + suffix + "ID",
        hiddenName: "c_overlap" + suffix,
        anchor: "95%",
        fieldLabel: "เลขที่ใบกันเหลื่อม",
        labelWidth: 100,
        hidden: true,
        mode: "local",
        store: Ext.storeBookingPeriodBill,
        valueField: "c_booking",
        displayField: "c_booking",
        triggerAction: "all",
        forceSelection: true,
        typeAhead: false,
        anyMatch: true,
        caseSensitive: false,
        doQuery: Ext.fnAnyMatchDoQuery,
        emptyText: "กรุณาเลือกเลขที่ใบกันเหลื่อม...",
        validator: function (val) {
            return (this.isVisible() && Ext.isEmpty(val)) ? "กรุณาเลือกเลขที่ใบกันเหลื่อม" : true;
        },
        listeners: {
            // เลือกใบกันเหลื่อมแล้ว เติม "แหล่งเงินที่ n" + "จำนวนเงิน" ให้อัตโนมัติจากตัว
            // ใบกันเหลื่อมเอง แล้วล็อกแหล่งเงินไว้ (ผูกกับใบกันเหลื่อมนี้ตายตัว) ส่วนจำนวน
            // เงินยังแก้ลดลงเองได้ ถ้าจะจองไม่เต็มวงเงินที่เหลือ - แหล่งเงินที่ 1 (n===1) ยังเติม
            // "ชื่อค่าใช้จ่าย"/"ชื่อโครงการ" (ฟิลด์ระดับหัวเรื่อง มีค่าเดียว ไม่แยกตามแหล่งเงิน)
            // ให้อัตโนมัติจาก bg_expense_id ของใบกันเหลื่อมด้วย
            select: function (cmb, record) {
                Ext.getCmp("i_budget_year_overlap" + suffix + "ID").setValue(record.get("i_year"));
                var fundIdx = Ext.storeExpenseBudgetTypePeriodBill.findExact("id", record.get("dc_expense_budget_type_id"));
                var fundRec = fundIdx > -1 ? Ext.storeExpenseBudgetTypePeriodBill.getAt(fundIdx) : null;
                combo.setValue(record.get("dc_expense_budget_type_id"));
                combo.setRawValue(fundRec ? fundRec.get("c_name") : "");
                Ext.getCmp(nameHiddenId).setValue(fundRec ? fundRec.get("c_name") : "");
                Ext.getCmp(amtId).setValue(Ext.floatRenderer(parseFloat(String(record.get("f_total")).replace(/,/g, "")) || 0));
                if (n === 1 && !Ext.expenseLockedPeriodBill) {
                    var expenseIdx = Ext.storePoExpensePeriodBill.findExact("id", record.get("bg_expense_id"));
                    var expenseRec = expenseIdx > -1 ? Ext.storePoExpensePeriodBill.getAt(expenseIdx) : null;
                    var expenseCombo = Ext.getCmp("po_expense_idID");
                    if (expenseCombo) {
                        expenseCombo.setValue(record.get("bg_expense_id"));
                        expenseCombo.setRawValue(expenseRec ? expenseRec.get("c_name") : "");
                    }
                    Ext.getCmp("c_expense_nameID").setValue(expenseRec ? expenseRec.get("c_name") : "");
                    Ext.getCmp("c_nameID").setValue(expenseRec ? Ext.fnProjectNameFromExpense(expenseRec.get("c_name")) : "");
                }
                combo.setReadOnly(true);
                Ext.fnRefreshHeaderFundChoices();
                Ext.fnRestoreFundSourceReserveStatus(n);
            }
        }
    });

    var reserveTypeGroup = new Ext.form.RadioGroup({
        id: "i_bg_reserve_type" + suffix + "GroupID",
        fieldLabel: "ประเภทงบประมาณ",
        columns: [90, 90],
        items: [
            {name: "i_bg_reserve_type_radio" + suffix, inputValue: 0, boxLabel: "ปีต่อปี", checked: true},
            {name: "i_bg_reserve_type_radio" + suffix, inputValue: 1, boxLabel: "กันเหลื่อม"},
        ],
        listeners: {
            change: function (group, checked) {
                var isOverlap = !!checked && checked.inputValue === 1;
                if (isOverlap) {
                    overlapYearCombo.show();
                    overlapCombo.show();
                } else {
                    overlapYearCombo.hide();
                    overlapYearCombo.clearValue();
                    overlapCombo.hide();
                    overlapCombo.clearValue();
                    Ext.getCmp("i_budget_year_overlap" + suffix + "ID").setValue("");
                    // ค่าที่เคยดึงมาจากใบกันเหลื่อมใช้ไม่ได้แล้ว เคลียร์ทิ้งให้เลือก/กรอกใหม่
                    combo.setReadOnly(false);
                    combo.clearValue();
                    Ext.getCmp(nameHiddenId).setValue("");
                    Ext.getCmp(amtId).setValue("");
                }
                Ext.fnRefreshHeaderFundChoices();
                Ext.fnRestoreFundSourceReserveStatus(n);
            }
        }
    });

    var panelItems = [
        {xtype: "hidden", id: nameHiddenId, name: nameField},
        new Ext.Panel({layout: "column", border: false, items: columns}),
    ];
    if (!hoistOverlapControls) {
        panelItems.push(reserveTypeGroup, overlapYearCombo, overlapCombo);
    }
    panelItems.push(
        {xtype: "hidden", id: "i_budget_year_overlap" + suffix + "ID", name: "i_budget_year_overlap" + suffix},
        {
            xtype: "displayfield",
            id: "reserveStatusID" + n,
            fieldLabel: "สถานะจองเงิน",
            hidden: true,
            value: "ยังไม่ได้จองเงิน",
        },
        {
            xtype: "button",
            id: "reserveBtnID" + n,
            iconCls: "icon-add",
            text: "จองเงิน",
            hidden: true,
            handler: function () {
                Ext.fnReserveFundSource(n);
            }
        },
        {
            xtype: "button",
            id: "cancelReserveBtnID" + n,
            iconCls: "icon-drop",
            text: "ยกเลิกการจองเงิน",
            hidden: true,
            handler: function () {
                Ext.fnCancelReserveFundSource(n);
            }
        }
    );

    var fundPanel = new Ext.Panel({
        id: panelId,
        layout: "form",
        border: false,
        hidden: n > 1,
        bodyStyle: "padding-bottom:6px;",
        items: panelItems
    });
    // แนบ component ที่ยกไปแปะที่อื่นไว้กับตัวพาเนล ให้ผู้เรียกเอาไปวางในเลย์เอาต์เอง
    // (ต้องประกอบ Ext.Panel ของ reserveTypeGroup/overlapYearCombo/overlapCombo ไปแล้ว
    // เพื่อให้ listener/ตัวแปรปิด (closure) ต่างๆ ที่อ้างถึง n/suffix/combo ยังผูกถูกจุดเดิม)
    if (hoistOverlapControls) {
        fundPanel.reserveTypeGroup = reserveTypeGroup;
        fundPanel.overlapYearCombo = overlapYearCombo;
        fundPanel.overlapCombo = overlapCombo;
    }
    return fundPanel;
}

Ext.fnUpdateAddFundButton = function () {
    var btn = Ext.getCmp("addFundSourceBtnID");
    if (!btn) {
        return;
    }
    if ((Ext.fundSourceCount || 1) >= 3) {
        btn.hide();
    } else {
        btn.show();
    }
};

// แสดงสถานะจองเงิน + ปุ่มจองเงิน/ยกเลิก ของแหล่งเงินที่ n - เช็คว่ามีแหล่งเงิน+จำนวนเงิน
// สดๆ จากฟอร์มตอนนี้เลย (ไม่ใช่แค่ตอนเปิดหน้าต่างครั้งแรก) เพราะผู้ใช้อาจเพิ่งกด "+
// เพิ่มแหล่งเงิน" แล้วเลือก/กรอกแหล่งเงินใหม่ระหว่างที่หน้าต่างเปิดอยู่ - ถ้าจองแล้วให้
// ล็อกช่องแหล่งเงิน/จำนวนเงินของสล็อตนั้นไม่ให้แก้ไข (เงินถูกจองไปแล้วจริง เปลี่ยนยอด
// ทีหลังจะไม่ตรงกับที่จองไว้)
Ext.fnRestoreFundSourceReserveStatus = function (n) {
    var suffix = n === 1 ? "" : String(n);
    var statusCmp = Ext.getCmp("reserveStatusID" + n);
    var reserveBtn = Ext.getCmp("reserveBtnID" + n);
    var cancelBtn = Ext.getCmp("cancelReserveBtnID" + n);
    if (!statusCmp) {
        return;
    }
    // จองเงินได้เฉพาะรายการที่บันทึกแล้ว (มี hdr_id) เท่านั้น
    var hdrIdFld = Ext.getCmp("sp_tor_period_bill_hdr_idID");
    var hdrId = hdrIdFld ? hdrIdFld.getValue() : null;
    var comboFld = Ext.getCmp("dc_expense_budget_type_id" + suffix + "ID");
    var amtFld = Ext.getCmp("f_fund_amt" + suffix + "ID");
    var hasFundSource = hdrId && comboFld && comboFld.getValue() && amtFld && amtFld.getValue();
    if (!hasFundSource) {
        statusCmp.hide();
        reserveBtn.hide();
        cancelBtn.hide();
        return;
    }
    var reserveId = Ext.selectRow ? Ext.selectRow.get("bg_reserve_money_id" + suffix) : null;
    var reserveTypeGroupCmp = Ext.getCmp("i_bg_reserve_type" + suffix + "GroupID");
    var overlapComboCmp = Ext.getCmp("c_overlap" + suffix + "ID");
    var overlapYearComboCmp = Ext.getCmp("i_yyyy_overlap" + suffix + "ID");
    statusCmp.show();
    if (reserveId) {
        statusCmp.setValue("จองเงินแล้ว (รหัสอ้างอิง " + reserveId + ") เมื่อ " + Ext.selectRow.get("d_ap_reserve" + suffix));
        reserveBtn.hide();
        cancelBtn.show();
        // ล็อกแหล่งเงินที่จองแล้ว ไม่ให้แก้ไข/ลบ จนกว่าจะยกเลิกจอง (รวมประเภทงบประมาณ/
        // เลขที่ใบกันเหลื่อมด้วย เพราะจองไปแล้วเปลี่ยนไม่ได้เช่นกัน)
        comboFld.disable();
        amtFld.setReadOnly(true);
        if (reserveTypeGroupCmp) { reserveTypeGroupCmp.disable(); }
        if (overlapComboCmp) { overlapComboCmp.disable(); }
        if (overlapYearComboCmp) { overlapYearComboCmp.disable(); }
    } else if (Ext.selectRow && Ext.selectRow.get("erp_reserve_status" + suffix)
            && String(comboFld.getValue()) === String(Ext.selectRow.get("dc_expense_budget_type_id" + suffix))) {
        // สัญญาที่นำเข้าจากไฟล์และระบบ ERP เวชภัณฑ์จองเงินไว้ในระบบงบแล้ว - ไม่ให้จองซ้ำจากเมนูนี้
        // และไม่มีปุ่มยกเลิก (รายการจองเป็นของ ERP ต้องยกเลิกจากฝั่ง ERP) ล็อกแหล่งเงินเหมือนจองแล้ว
        statusCmp.setValue(Ext.selectRow.get("erp_reserve_status" + suffix));
        reserveBtn.hide();
        cancelBtn.hide();
        comboFld.disable();
        amtFld.setReadOnly(true);
        if (reserveTypeGroupCmp) { reserveTypeGroupCmp.disable(); }
        if (overlapComboCmp) { overlapComboCmp.disable(); }
        if (overlapYearComboCmp) { overlapYearComboCmp.disable(); }
    } else {
        statusCmp.setValue("ยังไม่ได้จองเงิน");
        reserveBtn.show();
        cancelBtn.hide();
        if (reserveTypeGroupCmp) { reserveTypeGroupCmp.enable(); }
        if (overlapComboCmp) { overlapComboCmp.enable(); }
        if (overlapYearComboCmp) { overlapYearComboCmp.enable(); }
    }
};

// เรียกตอนเปิดแก้ไขรายการเดิม - ถ้าแหล่งเงินที่ n เคยบันทึกไว้เป็น "กันเหลื่อม" (มี
// c_overlap[n] อยู่) ให้ติ๊กตัวเลือก "กันเหลื่อม" และโหลด/เลือกเลขที่ใบกันเหลื่อมเดิมกลับ
// มาแสดงให้ตรงกับที่เคยเลือกไว้ (ไม่ต้องมีคอลัมน์เก็บ "ประเภท" แยกต่างหาก - ดูจากมี/ไม่มี
// c_overlap[n] ก็พอ)
Ext.fnRestoreFundSourceOverlap = function (n) {
    var suffix = n === 1 ? "" : String(n);
    var savedOverlap = Ext.selectRow ? Ext.selectRow.get("c_overlap" + suffix) : null;
    var savedYear = Ext.selectRow ? Ext.selectRow.get("i_budget_year_overlap" + suffix) : null;
    var groupCmp = Ext.getCmp("i_bg_reserve_type" + suffix + "GroupID");
    var overlapCombo = Ext.getCmp("c_overlap" + suffix + "ID");
    var yearFld = Ext.getCmp("i_budget_year_overlap" + suffix + "ID");
    if (!savedOverlap || !groupCmp || !overlapCombo) {
        return;
    }
    var yearCombo = Ext.getCmp("i_yyyy_overlap" + suffix + "ID");
    var bgTypeCombo = Ext.getCmp("dc_expense_budget_type_id" + suffix + "ID");
    groupCmp.items.each(function (radio) {
        if (radio.inputValue === 1) {
            radio.setValue(true);
        }
    });
    if (yearCombo) {
        yearCombo.show();
        yearCombo.setValue(savedYear);
    }
    overlapCombo.show();
    if (yearFld) { yearFld.setValue(savedYear); }
    overlapCombo.setValue(savedOverlap);
    overlapCombo.setRawValue(savedOverlap);
    if (bgTypeCombo) { bgTypeCombo.setReadOnly(true); }
    if (savedYear) {
        Ext.storeBookingPeriodBill.load({params: {dc_cost_id: Ext.MEDSUP_DC_COST_ID, i_yyyy_overlap: savedYear}});
    }
};

// จองเงินงบประมาณจริง (production) สำหรับ "แหล่งเงินที่ n" ทั้งก้อน (ไม่ใช่ต่องวดแล้ว)
// เรียก AP-API ภายนอกจริงผ่าน backend (mode RESERVE_FUND_SOURCE) ทำได้เฉพาะรายการที่
// บันทึกแล้ว (มี hdr_id) เท่านั้น - ปิดหน้าต่างแล้วโหลดกริดใหม่หลังทำสำเร็จเสมอ เพื่อให้
// เห็นสถานะล่าสุดที่ถูกต้อง ไม่พยายามอัปเดต UI สดในหน้าต่างเดิม
Ext.fnReserveFundSource = function (n) {
    var hdrIdFld = Ext.getCmp("sp_tor_period_bill_hdr_idID");
    var hdrId = hdrIdFld ? hdrIdFld.getValue() : null;
    if (!hdrId) {
        Ext.Msg.alert("แจ้งเตือน", "กรุณาบันทึกรายการนี้ก่อน แล้วเปิดแก้ไขใหม่อีกครั้งเพื่อจองเงิน");
        return;
    }
    // ข้อความยืนยัน: แสดงแหล่งเงิน/ค่าใช้จ่าย/จำนวนเงินจริงของสล็อตนี้ให้ตรวจก่อนกด
    var sfx = n === 1 ? "" : String(n);
    var fundCmb = Ext.getCmp("dc_expense_budget_type_id" + sfx + "ID");
    var amtCmp = Ext.getCmp("f_fund_amt" + sfx + "ID");
    var expCmb = Ext.getCmp("po_expense_idID");
    var amtNum = parseFloat(String(amtCmp ? amtCmp.getValue() : 0).replace(/,/g, "")) || 0;
    Ext.Msg.confirm(
        "ยืนยันการจองเงิน",
        "<b>แหล่งเงินที่ " + n + ":</b> " + Ext.util.Format.htmlEncode(fundCmb ? fundCmb.getRawValue() : "") + "<br>"
        + "<b>ค่าใช้จ่าย:</b> " + Ext.util.Format.htmlEncode(expCmb ? expCmb.getRawValue() : "") + "<br>"
        + "<b>จำนวนเงินที่จอง: " + Ext.floatRenderer(amtNum) + " บาท</b><br><br>"
        + "<span style='color:red;font-weight:bold;'>ระบบจะตัดงบประมาณจริงทันที หากจองผิดสามารถกดปุ่ม \"ยกเลิกการจองเงิน\" หรือติดต่อฝ่ายการคลัง</span><br><br>"
        + "ต้องการจองเงินใช่หรือไม่?",
        function (btn) {
            if (btn !== "yes") {
                return;
            }
            Ext.getCmp("win-medsupID").getEl().mask("กำลังจองเงิน...", "x-mask-loading");
            Ext.Ajax.request({
                url: Ext.url_process,
                method: "POST",
                params: {mode: "RESERVE_FUND_SOURCE", sp_tor_period_bill_hdr_id: hdrId, slot: n},
                success: function (result) {
                    Ext.getCmp("win-medsupID").getEl().unmask();
                    var jd = Ext.util.JSON.decode(result.responseText);
                    // ลิงก์จองเงินที่ backend ยิงจริง (สำเร็จหรือไม่ก็ตาม) - เปิด console เพื่อตรวจว่า
                    // ส่งอะไรไปจองบ้าง (บันทึกไว้ที่คอลัมน์ c_ap_api_response ด้วย)
                    console.log("RESERVE_FUND_SOURCE sent:", jd.sent, jd);
                    Ext.Msg.alert(jd.reval === 0 ? "สำเร็จ" : "ผิดพลาด", jd.msg + (jd.sent ? "<br><br><b>ลิงก์ API ที่ส่ง (แยกทีละลิงก์ - อย่าเปิดในเบราว์เซอร์ เพราะเป็นการสั่งจอง/ยกเลิกจริง):</b><br><span style='font-size:11px;word-break:break-all;'>" + Ext.util.Format.htmlEncode(jd.sent).split("  ➜  ").join("<br><br>") + "</span>" : ""), function () {
                        if (jd.reval === 0) {
                            Ext.getCmp("tabpanel1").getStore().reload();
                            Ext.getCmp("win-medsupID").destroy();
                        }
                    });
                },
                failure: function () {
                    Ext.getCmp("win-medsupID").getEl().unmask();
                    Ext.Msg.alert("ผิดพลาด", "เชื่อมต่อไม่สำเร็จ");
                }
            });
        }
    );
};

// ยกเลิกการจองเงินของแหล่งเงินที่ n - backend ยิงลิงก์ยกเลิกเดิมของ ERP (mode/PUT ... i_enable/2)
// คืนเงินกลับงบประมาณ แล้วเคลียร์สถานะจองให้จองใหม่ได้
Ext.fnCancelReserveFundSource = function (n) {
    var hdrIdFld = Ext.getCmp("sp_tor_period_bill_hdr_idID");
    var hdrId = hdrIdFld ? hdrIdFld.getValue() : null;
    Ext.Msg.confirm(
        "ยืนยันการยกเลิกการจองเงิน",
        "ต้องการยกเลิกการจองเงินแหล่งเงินที่ " + n + " และคืนเงินกลับงบประมาณใช่หรือไม่?",
        function (btn) {
            if (btn !== "yes") {
                return;
            }
            Ext.getCmp("win-medsupID").getEl().mask("กำลังยกเลิกการจอง...", "x-mask-loading");
            Ext.Ajax.request({
                url: Ext.url_process,
                method: "POST",
                params: {mode: "CANCEL_RESERVE_FUND_SOURCE", sp_tor_period_bill_hdr_id: hdrId, slot: n},
                success: function (result) {
                    Ext.getCmp("win-medsupID").getEl().unmask();
                    var jd = Ext.util.JSON.decode(result.responseText);
                    console.log("CANCEL_RESERVE_FUND_SOURCE sent:", jd.sent, jd);
                    Ext.Msg.alert(jd.reval === 0 ? "สำเร็จ" : "ผิดพลาด", jd.msg + (jd.sent ? "<br><br><b>ลิงก์ API ที่ส่ง (แยกทีละลิงก์ - อย่าเปิดในเบราว์เซอร์ เพราะเป็นการสั่งจอง/ยกเลิกจริง):</b><br><span style='font-size:11px;word-break:break-all;'>" + Ext.util.Format.htmlEncode(jd.sent).split("  ➜  ").join("<br><br>") + "</span>" : ""), function () {
                        if (jd.reval === 0) {
                            Ext.getCmp("tabpanel1").getStore().reload();
                            Ext.getCmp("win-medsupID").destroy();
                        }
                    });
                },
                failure: function () {
                    Ext.getCmp("win-medsupID").getEl().unmask();
                    Ext.Msg.alert("ผิดพลาด", "เชื่อมต่อไม่สำเร็จ");
                }
            });
        }
    );
};

function winMedSupPeriodBill(rec) {
    Ext.ev = rec;
    Ext.objLine = 0;

    // สร้างพาเนลแหล่งเงินที่ 1 ไว้ก่อน (hoist=true) เพื่อเอาตัวเลือก "ประเภทงบประมาณ"/
    // ปีของใบกัน/เลขที่ใบกันเหลื่อม ไปวางไว้ใต้ "ชื่อโครงการ" แทนที่จะอยู่ในกล่องแหล่งเงิน
    var fundPanel1 = fundSourceFieldSet(1, true, true);

    var comboContract = new Ext.form.ComboBox({
        id: "contractComboID",
        fieldLabel: "เลขที่สัญญา",
        anchor: "70%",
        store: Ext.storeContractLookup,
        valueField: "sp_tor_contract_id",
        displayField: "c_contract_code",
        hiddenName: "sp_tor_contract_id",
        name: "c_contract_code_display",
        mode: "remote",
        minChars: 1,
        queryParam: "query",
        triggerAction: "all",
        forceSelection: false,
        typeAhead: false,
        // autoSelect ของ ComboBox ค่า default เป็น true จะผูกกับรายการแรกที่ query
        // เจอให้อัตโนมัติแบบเงียบๆ แม้ผู้ใช้แค่พิมพ์ค้นหาโดยไม่ได้กดเลือกเลย (บั๊กเดียว
        // กับที่เคยเจอที่ช่องแหล่งเงิน) ทำให้ผูกกับสัญญาอื่นที่ไม่ตั้งใจ - ปิดไว้เสมอ
        autoSelect: false,
        // ถ้ามีเลขที่สัญญาอยู่แล้วให้พิมพ์/เลือกได้เอง ถ้าไม่มี (ปล่อยว่าง) ระบบจะออกเลขที่
        // ให้อัตโนมัติตอนบันทึก (prefix ตามประเภทหน่วยงานที่เลือก - ดู mode ADD/UPDATE
        // ใน mnMedSupPeriodBillController.php) จึงไม่บังคับกรอกอีกต่อไป
        emptyText: "พิมพ์เลขที่สัญญา (ถ้ามีอยู่แล้ว) หรือปล่อยว่างไว้ให้ระบบออกเลขที่ให้อัตโนมัติ",
        listeners: {
            select: function (combo, record) {
                // เลือกสัญญาที่มีอยู่แล้วในระบบ - ดึงข้อมูลมาเติมให้เป็นค่าเริ่มต้น (แก้ไขได้)
                Ext.getCmp("c_contract_codeID").setValue(record.get("c_contract_code"));
                // pr_id ของ AP-API - มีเฉพาะตอนเลือกสัญญาที่มีอยู่จริงเท่านั้น (จำเป็น
                // สำหรับปุ่ม "จองเงิน" ทีหลัง) ถ้าพิมพ์เลขสัญญาใหม่เองจะว่างเปล่า
                Ext.getCmp("sp_tor_idID").setValue(record.get("sp_tor_id"));
                Ext.getCmp("c_nameID").setValue(record.get("c_name"));
                Ext.getCmp("i_budget_yearID").setValue(record.get("i_yyyy"));
                Ext.getCmp("d_start_dateID").setValue(record.get("d_start_date"));
                Ext.getCmp("d_end_dateID").setValue(record.get("d_end_date"));
                Ext.getCmp("c_po_noID").setValue(record.get("c_po_no"));
                Ext.getCmp("dc_creditor_idComboID").setValue(record.get("dc_creditor_id"));
                Ext.getCmp("dc_creditor_idComboID").setRawValue(record.get("c_creditor_name"));
                Ext.getCmp("c_creditor_nameID").setValue(record.get("c_creditor_name"));
                Ext.getCmp("c_tax_number_impID").setValue(record.get("c_creditor_tax_no"));
                Ext.storePeriodLookup.setBaseParam("sp_tor_contract_id", record.get("sp_tor_contract_id"));
                Ext.storePeriodLookup.load();
            },
            blur: function (combo) {
                // ไม่บังคับต้องเลือกจาก dropdown แล้ว - พิมพ์เลขสัญญาใหม่เองได้ ให้ sync
                // ข้อความที่พิมพ์จริงลงฟิลด์ที่จะ submit เสมอ
                var typed = combo.getRawValue();
                Ext.getCmp("c_contract_codeID").setValue(typed);
                // เช็คว่าข้อความที่พิมพ์ตรงกับสัญญาที่มีอยู่จริงหรือไม่ (เผื่อเลือกแล้วพิมพ์
                // ทับ/ลบบางส่วนทีหลัง) ถ้าไม่ตรงแล้วให้เคลียร์ pr_id ทิ้ง (จองเงินไม่ได้)
                var matched = null;
                combo.store.each(function (rec) {
                    if (rec.get("c_contract_code") === typed) {
                        matched = rec;
                    }
                });
                Ext.getCmp("sp_tor_idID").setValue(matched ? matched.get("sp_tor_id") : "");
                // กันค่า sp_tor_contract_id ค้างจากการพิมพ์ค้นหาโดยไม่ได้เลือกจริง - แก้ที่
                // hiddenField ตรงๆ (ไม่ใช้ combo.setValue เพราะจะไปล้างข้อความที่พิมพ์ไว้ทิ้ง
                // ด้วย ซึ่งจะทำให้พิมพ์เลขที่สัญญาใหม่เองไม่ได้)
                if (combo.hiddenField) {
                    combo.hiddenField.value = matched ? matched.get("sp_tor_contract_id") : "";
                }
            },
            beforequery: function (q) {
                q.query = q.query || '';
                q.forceAll = true;
            }
        }
    });

    var comboCreditorPeriodBill = new Ext.form.ComboBox({
        id: "dc_creditor_idComboID",
        fieldLabel: "ผู้ขาย/ผู้รับจ้าง",
        anchor: "70%",
        store: Ext.storeCreditorLookupPeriodBill,
        valueField: "dc_creditor_id",
        displayField: "c_name",
        hiddenName: "dc_creditor_id",
        name: "c_creditor_name_display",
        mode: "remote",
        minChars: 1,
        queryParam: "query",
        triggerAction: "all",
        forceSelection: false,
        typeAhead: false,
        emptyText: "พิมพ์เพื่อค้นหาผู้ขาย...",
        listeners: {
            select: function (combo, record) {
                Ext.getCmp("c_creditor_nameID").setValue(record.get("c_name"));
                Ext.getCmp("c_tax_number_impID").setValue(record.get("c_tax_no"));
            },
            blur: function (combo) {
                Ext.getCmp("c_creditor_nameID").setValue(combo.getRawValue());
            },
            beforequery: function (q) {
                q.query = q.query || '';
                q.forceAll = true;
            }
        }
    });

    var winMedSup = new Ext.Window({
        id: "win-medsupID",
        title: "บันทึกรายละเอียดในสัญญา (เวชภัณฑ์)",
        modal: true,
        plain: true,
        collapsible: true,
        maximizable: true,
        layout: "fit",
        items: new Ext.FormPanel({
            id: "win-frm-medsupID",
            url: Ext.url_process,
            autoScroll: true,
            width: Ext.getCmp("contenterCenter").getWidth() - 50,
            height: Ext.getCmp("contenterCenter").getHeight() - 50,
            labelWidth: 160,
            bodyStyle: "padding:5px;",
            items: [
                {
                    xtype: "hidden",
                    name: "mode",
                    id: "modeID",
                    value: (Ext.ev == 'add' ? "ADD" : "UPDATE"),
                },
                {
                    xtype: "hidden",
                    name: "sp_tor_period_bill_hdr_id",
                    id: "sp_tor_period_bill_hdr_idID",
                },
                {
                    xtype: "hidden",
                    name: "c_contract_code",
                    id: "c_contract_codeID",
                },
                {
                    // pr_id ของ AP-API - มีค่าเฉพาะตอนผูกกับสัญญาที่มีอยู่จริงในระบบ
                    // (จำเป็นสำหรับปุ่ม "จองเงิน" ทีหลัง)
                    xtype: "hidden",
                    name: "sp_tor_id",
                    id: "sp_tor_idID",
                },
                {
                    // PR ต้นทาง (hdr_id ของแถว PR ที่เลือกจากช่องด้านล่าง) - ใช้เป็น pr_id ตอนจอง
                    // เงินขั้นสัญญา (ต้องมี PR ที่จองเงินไว้แล้วก่อน ตามระบบ ERP เดิม)
                    xtype: "hidden",
                    name: "pr_hdr_id",
                    id: "pr_hdr_idID",
                },
                {
                    // เลือกได้เฉพาะตอน "เพิ่มรายการใหม่" เท่านั้น (ตอนแก้ไขสัญญาที่มีอยู่
                    // แล้วมี hdr_id ของตัวเองอยู่แล้ว ไม่เกี่ยวกับ PR ที่ยังไม่ผูกสัญญา)
                    xtype: "combo",
                    id: "prLookupComboID",
                    // ไม่มี name/hiddenName ให้ตั้งใจ - เป็นตัวช่วยเลือก UI เท่านั้น ค่าที่
                    // เลือกจะถูกคัดลอกไปใส่ในฟิลด์ซ่อนอื่นๆ ผ่าน listener select ด้านล่าง
                    // อยู่แล้ว ถ้าไม่ปิด submitValue ฟอร์มจะส่ง id ของ component นี้ไปเป็น
                    // ชื่อพารามิเตอร์แทน (ExtJS fallback ไปใช้ id เป็น name เมื่อไม่ได้ตั้ง)
                    // ทำให้ backend เอาไปต่อ SQL เป็นชื่อคอลัมน์ผิดๆ แล้ว error "Invalid
                    // column name 'prLookupComboID'"
                    submitValue: false,
                    hidden: Ext.ev !== "add",
                    anchor: "70%",
                    fieldLabel: "เลือกจาก PR ที่มีอยู่",
                    mode: "local",
                    store: Ext.storeMedSupPrLookup,
                    valueField: "sp_tor_period_bill_id",
                    displayField: "c_pr_code",
                    tpl: '<tpl for="."><div class="x-combo-list-item">{c_pr_code} - {c_project_name}<tpl if="bg_reserve_money_id || bg_reserve_money_id2 || bg_reserve_money_id3"> <span style="color:green;">[จองเงินแล้ว]</span></tpl><tpl if="!(bg_reserve_money_id || bg_reserve_money_id2 || bg_reserve_money_id3)"> <span style="color:red;">[ยังไม่จองเงิน]</span></tpl></div></tpl>',
                    triggerAction: "all",
                    forceSelection: true,
                    typeAhead: false,
                    anyMatch: true,
                    caseSensitive: false,
                    doQuery: Ext.fnAnyMatchDoQuery,
                    emptyText: "กรุณาเลือก PR ที่สร้างไว้แล้ว (ถ้ามี)...",
                    listeners: {
                        select: function (combo, record) {
                            // แค่ copy ข้อมูลมา prefill ฟอร์มเท่านั้น - ไม่ผูก/เขียนทับแถว PR
                            // เดิม (สัญญาที่บันทึกจะได้ hdr_id ใหม่ของตัวเองเสมอ ดู mode ADD
                            // ใน mnMedSupPeriodBillController.php) PR เดิมจึงยังอยู่ครบ
                            // จัดการแยกจากหน้า "การจัดทำ PR (หน่วยงาน) เวชภัณฑ์" ได้อิสระ
                            // ผูกสัญญากับ PR ต้นทาง (เพื่อจองเงินขั้นสัญญา) + เตือนถ้า PR ยังไม่จองเงิน
                            Ext.getCmp("pr_hdr_idID").setValue(record.get("sp_tor_period_bill_hdr_id"));
                            if (!(record.get("bg_reserve_money_id") || record.get("bg_reserve_money_id2") || record.get("bg_reserve_money_id3"))) {
                                Ext.Msg.alert("แจ้งเตือน", "PR นี้ยังไม่ได้จองเงิน<br>บันทึกสัญญาได้ แต่จะกดจองเงินที่หน้านี้ไม่ได้ ต้องไปจองเงินของ PR ที่เมนู \"การจัดทำ PR (หน่วยงาน) เวชภัณฑ์\" ก่อน<br>หรือถ้าต้องการจองที่หน้าสัญญานี้เลย ให้เปิดสัญญาใหม่โดยไม่เลือก PR (ระบบจะจองขั้น PR ให้อัตโนมัติ)");
                            }
                            if (!Ext.userApDeptPeriodBill) {
                                Ext.getCmp("c_ap_dept_typeID").setValue(record.get("c_ap_dept_type") || "APMS");
                            }
                            if (!Ext.expenseLockedPeriodBill) {
                                Ext.getCmp("po_expense_idID").setValue(record.get("po_expense_id"));
                                Ext.getCmp("po_expense_idID").setRawValue(record.get("c_expense_name"));
                                Ext.getCmp("c_expense_nameID").setValue(record.get("c_expense_name"));
                            }
                            Ext.getCmp("c_nameID").setValue(record.get("c_project_name"));
                            Ext.getCmp("i_budget_yearID").setValue(record.get("i_budget_year"));
                            Ext.getCmp("dc_expense_budget_type_idID").setValue(record.get("dc_expense_budget_type_id"));
                            Ext.getCmp("dc_expense_budget_type_idID").setRawValue(record.get("c_fund_source"));
                            Ext.getCmp("c_fund_sourceID").setValue(record.get("c_fund_source"));
                            Ext.getCmp("f_fund_amtID").setValue(record.get("f_fund_amt"));
                            if (record.get("dc_expense_budget_type_id2") > 0) {
                                Ext.getCmp("dc_expense_budget_type_id2ID").setValue(record.get("dc_expense_budget_type_id2"));
                                Ext.getCmp("dc_expense_budget_type_id2ID").setRawValue(record.get("c_fund_source2"));
                                Ext.getCmp("c_fund_source2ID").setValue(record.get("c_fund_source2"));
                                Ext.getCmp("f_fund_amt2ID").setValue(record.get("f_fund_amt2"));
                                Ext.getCmp("fundSourcePanel2ID").show();
                                Ext.fundSourceCount = Math.max(Ext.fundSourceCount || 1, 2);
                            }
                            if (record.get("dc_expense_budget_type_id3") > 0) {
                                Ext.getCmp("dc_expense_budget_type_id3ID").setValue(record.get("dc_expense_budget_type_id3"));
                                Ext.getCmp("dc_expense_budget_type_id3ID").setRawValue(record.get("c_fund_source3"));
                                Ext.getCmp("c_fund_source3ID").setValue(record.get("c_fund_source3"));
                                Ext.getCmp("f_fund_amt3ID").setValue(record.get("f_fund_amt3"));
                                Ext.getCmp("fundSourcePanel3ID").show();
                                Ext.fundSourceCount = Math.max(Ext.fundSourceCount || 1, 3);
                            }
                            Ext.fnUpdateAddFundButton();
                            Ext.fnRefreshHeaderFundChoices();
                            // ล็อกไม่ให้แก้ "เลือกจาก PR ที่มีอยู่" ซ้ำ (เลือกครั้งเดียวพอ
                            // กันสับสนว่าจะยึดค่าจาก PR ไหนกันแน่ถ้าเปลี่ยนใจเลือกใหม่)
                            combo.setReadOnly(true);
                        }
                    }
                },
                {
                    xtype: "combo",
                    id: "c_ap_dept_typeID",
                    hiddenName: "c_ap_dept_type",
                    anchor: "70%",
                    fieldLabel: "ประเภท",
                    mode: "local",
                    store: Ext.storeApDeptTypePeriodBill,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    typeAhead: false,
                    editable: false,
                    value: Ext.userApDeptPeriodBill || "APMS",
                    readOnly: !!Ext.userApDeptPeriodBill,
                    hideTrigger: !!Ext.userApDeptPeriodBill,
                },
                fundPanel1.reserveTypeGroup,
                fundPanel1.overlapYearCombo,
                fundPanel1.overlapCombo,
                {
                    xtype: "combo",
                    id: "po_expense_idID",
                    hiddenName: "po_expense_id",
                    anchor: "70%",
                    fieldLabel: "ชื่อค่าใช้จ่าย",
                    mode: "local",
                    store: Ext.storePoExpensePeriodBill,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    typeAhead: false,
                    anyMatch: true,
                    caseSensitive: false,
                    doQuery: Ext.fnAnyMatchDoQuery,
                    emptyText: "กรุณาเลือกชื่อค่าใช้จ่าย...",
                    // เภสัช/เวชภัณฑ์ ล็อกเป็น "030300090001 : ค่ายาและเวชภัณฑ์ อวัยวะเทียม" (ไม่มี
                    // dropdown) - พัสดุ/admin เลือกเองได้เหมือนเดิม
                    readOnly: Ext.expenseLockedPeriodBill,
                    hideTrigger: Ext.expenseLockedPeriodBill,
                    listeners: {
                        render: function () {
                            if (Ext.expenseLockedPeriodBill) { Ext.fnApplyDefaultExpensePeriodBill(); }
                        },
                        select: function (combo, record) {
                            Ext.getCmp("c_expense_nameID").setValue(record.get("c_name"));
                            Ext.getCmp("c_nameID").setValue(Ext.fnProjectNameFromExpense(record.get("c_name")));
                        }
                    }
                },
                {
                    xtype: "hidden",
                    id: "c_expense_nameID",
                    name: "c_expense_name",
                },
                {
                    xtype: "textfield",
                    id: "c_nameID",
                    name: "c_project_name",
                    anchor: "70%",
                    fieldLabel: "ชื่อโครงการ",
                    emptyText: "เลือกชื่อค่าใช้จ่ายด้านบนก่อน จะเติมให้อัตโนมัติ",
                },
                comboContract,
                {
                    xtype: "combo",
                    id: "c_contract_typeID",
                    hiddenName: "c_contract_type",
                    anchor: "70%",
                    fieldLabel: "ประเภทของสัญญา",
                    mode: "local",
                    store: Ext.storeContractTypePeriodBill,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    typeAhead: false,
                    anyMatch: true,
                    caseSensitive: false,
                    doQuery: Ext.fnAnyMatchDoQuery,
                    emptyText: "กรุณาเลือกประเภทของสัญญา...",
                    listeners: {
                        select: function () {
                            Ext.fnUpdateAddPeriodButton();
                        }
                    }
                },
                {
                    xtype: "fieldset",
                    title: "แหล่งเงิน (เลือกได้สูงสุด 3 แหล่ง)",
                    collapsible: true,
                    autoHeight: true,
                    anchor: "90%",
                    items: [
                        fundPanel1,
                        fundSourceFieldSet(2, false),
                        fundSourceFieldSet(3, false),
                        {
                            xtype: "button",
                            id: "addFundSourceBtnID",
                            iconCls: "icon-add",
                            text: "+ เพิ่มแหล่งเงิน",
                            handler: function () {
                                Ext.fundSourceCount = (Ext.fundSourceCount || 1) + 1;
                                Ext.getCmp("fundSourcePanel" + Ext.fundSourceCount + "ID").show();
                                Ext.fnUpdateAddFundButton();
                            }
                        }
                    ]
                },
                {
                    xtype: "combo",
                    id: "i_budget_yearID",
                    hiddenName: "i_budget_year",
                    anchor: "70%",
                    fieldLabel: "ปีงบประมาณ",
                    mode: "local",
                    store: Ext.storeYearPeriodBill,
                    value: Ext.ev == 'add' ? new Date().getFullYear() : undefined,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    typeAhead: false,
                    anyMatch: true,
                    caseSensitive: false,
                    doQuery: Ext.fnAnyMatchDoQuery,
                    emptyText: "กรุณาเลือกปีงบประมาณ...",
                },
                {
                    xtype: "datefield",
                    id: "d_start_dateID",
                    name: "d_start_date",
                    anchor: "70%",
                    fieldLabel: "วันที่เริ่มสัญญา",
                },
                {
                    xtype: "datefield",
                    id: "d_end_dateID",
                    name: "d_end_date",
                    anchor: "70%",
                    fieldLabel: "วันที่สิ้นสุดสัญญา",
                },
                {xtype: "hidden", id: "c_po_noID", name: "c_po_no"},
                comboCreditorPeriodBill,
                {
                    xtype: "hidden",
                    id: "c_creditor_nameID",
                    name: "c_creditor_name",
                },
                {
                    xtype: "textfield",
                    id: "c_tax_number_impID",
                    name: "c_tax_number_imp",
                    anchor: "70%",
                    fieldLabel: "เลขประจำตัวผู้เสียภาษี",
                },
                {
                    xtype: "button",
                    id: "addMedSupPeriodBtnID",
                    iconCls: "icon-add",
                    text: "เพิ่ม [ + ] งวด",
                    handler: function () {
                        Ext.fnAddMedSupItems(Ext.objLine++);
                    }
                },
            ],
            buttonAlign: "left",
            buttons: [
                {
                    text: "บันทึกรายการ",
                    iconCls: "icon-save",
                    handler: function () {
                        var form = Ext.getCmp('win-frm-medsupID').getForm();

                        var it = form.items.items;
                        it.forEach(function (v) {
                            if (v.name && v.name.match(/f_amt/)) {
                                v.setValue(parseFloat(String(v.getValue()).replace(/,/g, "") / 1));
                            }
                        });

                        if (!Ext.fnValidatePeriodAmounts()) {
                            return;
                        }

                        if (form.isValid()) {
                            form.submit({
                                waitMsg: 'Saving Data...',
                                success: function (form, action) {
                                    Ext.Msg.alert("Success", "<span style='white-space: nowrap;'>" + action.result.msg + "</span>", function () {
                                        Ext.getCmp("tabpanel1").getStore().reload();
                                        Ext.selectRow = null;
                                        Ext.getCmp('win-medsupID').destroy();
                                    });
                                },
                                failure: function (form, action) {
                                    switch (action.failureType) {
                                        case Ext.form.Action.CLIENT_INVALID:
                                            Ext.Msg.alert('Failure', 'ข้อมูลใน fields ไม่ถูกต้อง');
                                            break;
                                        case Ext.form.Action.CONNECT_FAILURE:
                                            Ext.Msg.alert('Failure', 'พบข้อผิดพลาดในการเชื่อมต่อเครือข่าย');
                                            break;
                                        case Ext.form.Action.SERVER_INVALID:
                                            Ext.Msg.alert('Failure', action.result.msg);
                                    }
                                }
                            });
                        }
                    }
                },
                {
                    text: Ext.GLOBAL_BU_BACK_TH,
                    iconCls: "icon-clear",
                    handler: function () {
                        Ext.getCmp("win-medsupID").destroy();
                    }
                }
            ],
            listeners: {
                afterrender: function () {
                    Ext.currentLineCount = 0;
                    Ext.activePeriodLines = [];
                    Ext.fundSourceCount = 1;
                    if (Ext.ev == "add") {
                        Ext.storeMedSupPrLookup.load({params: {limit: 200}});
                        Ext.fnAddMedSupItems(Ext.objLine++);
                    } else {
                        var hdrId = Ext.selectRow.get("sp_tor_period_bill_hdr_id");
                        Ext.getCmp("sp_tor_period_bill_hdr_idID").setValue(hdrId);
                        Ext.getCmp("contractComboID").setValue(Ext.selectRow.get("c_contract_code"));
                        Ext.getCmp("contractComboID").setRawValue(Ext.selectRow.get("c_contract_code"));
                        Ext.getCmp("c_contract_codeID").setValue(Ext.selectRow.get("c_contract_code"));
                        Ext.getCmp("sp_tor_idID").setValue(Ext.selectRow.get("sp_tor_id"));
                        Ext.getCmp("pr_hdr_idID").setValue(Ext.selectRow.get("pr_hdr_id"));

                        // ฟิลด์อ้างอิงของสัญญา (ชื่อโครงการ/ปีงบ/PO/ผู้ขาย/วันที่เริ่ม-สิ้นสุด)
                        // อ่านจากค่าที่เคยบันทึกไว้ในแถวนี้โดยตรง (กรอกเองได้แล้ว จึงต้องใช้
                        // ค่าที่บันทึกจริง ไม่ใช่ค่าปัจจุบันของสัญญาในระบบ)
                        Ext.getCmp("c_nameID").setValue(Ext.selectRow.get("c_project_name"));
                        Ext.getCmp("c_contract_typeID").setValue(Ext.selectRow.get("c_contract_type"));
                        Ext.getCmp("c_ap_dept_typeID").setValue(Ext.userApDeptPeriodBill || Ext.selectRow.get("c_ap_dept_type") || "APMS");
                        Ext.getCmp("c_expense_nameID").setValue(Ext.selectRow.get("c_expense_name"));
                        Ext.getCmp("po_expense_idID").setValue(Ext.selectRow.get("po_expense_id"));
                        Ext.getCmp("po_expense_idID").setRawValue(Ext.selectRow.get("c_expense_name"));
                        Ext.getCmp("c_fund_sourceID").setValue(Ext.selectRow.get("c_fund_source"));
                        Ext.getCmp("dc_expense_budget_type_idID").setValue(Ext.selectRow.get("dc_expense_budget_type_id"));
                        Ext.getCmp("dc_expense_budget_type_idID").setRawValue(Ext.selectRow.get("c_fund_source"));
                        Ext.getCmp("f_fund_amtID").setValue(Ext.selectRow.get("f_fund_amt"));
                        Ext.getCmp("c_fund_source2ID").setValue(Ext.selectRow.get("c_fund_source2"));
                        Ext.getCmp("dc_expense_budget_type_id2ID").setValue(Ext.selectRow.get("dc_expense_budget_type_id2"));
                        Ext.getCmp("dc_expense_budget_type_id2ID").setRawValue(Ext.selectRow.get("c_fund_source2"));
                        Ext.getCmp("f_fund_amt2ID").setValue(Ext.selectRow.get("f_fund_amt2"));
                        Ext.getCmp("c_fund_source3ID").setValue(Ext.selectRow.get("c_fund_source3"));
                        Ext.getCmp("dc_expense_budget_type_id3ID").setValue(Ext.selectRow.get("dc_expense_budget_type_id3"));
                        Ext.getCmp("dc_expense_budget_type_id3ID").setRawValue(Ext.selectRow.get("c_fund_source3"));
                        Ext.getCmp("f_fund_amt3ID").setValue(Ext.selectRow.get("f_fund_amt3"));
                        // เผยแหล่งเงินที่ 2/3 ถ้าเคยบันทึกไว้
                        if (Ext.selectRow.get("dc_expense_budget_type_id2")) {
                            Ext.getCmp("fundSourcePanel2ID").show();
                            Ext.fundSourceCount = 2;
                        }
                        if (Ext.selectRow.get("dc_expense_budget_type_id3")) {
                            Ext.getCmp("fundSourcePanel3ID").show();
                            Ext.fundSourceCount = 3;
                        }
                        Ext.fnUpdateAddFundButton();
                        Ext.fnRefreshHeaderFundChoices();
                        Ext.fnRestoreFundSourceReserveStatus(1);
                        Ext.fnRestoreFundSourceReserveStatus(2);
                        Ext.fnRestoreFundSourceReserveStatus(3);
                        Ext.fnRestoreFundSourceOverlap(1);
                        Ext.fnRestoreFundSourceOverlap(2);
                        Ext.fnRestoreFundSourceOverlap(3);
                        Ext.getCmp("i_budget_yearID").setValue(Ext.selectRow.get("i_budget_year"));
                        Ext.getCmp("d_start_dateID").setValue(Ext.selectRow.get("d_start_date"));
                        Ext.getCmp("d_end_dateID").setValue(Ext.selectRow.get("d_end_date"));
                        Ext.getCmp("c_po_noID").setValue(Ext.selectRow.get("c_po_no"));
                        Ext.getCmp("c_creditor_nameID").setValue(Ext.selectRow.get("c_creditor_name"));
                        Ext.getCmp("dc_creditor_idComboID").setValue(Ext.selectRow.get("dc_creditor_id"));
                        Ext.getCmp("dc_creditor_idComboID").setRawValue(Ext.selectRow.get("c_creditor_name"));
                        Ext.getCmp("c_tax_number_impID").setValue(Ext.selectRow.get("c_tax_number_imp"));

                        Ext.storeMedSupDtl.setBaseParam("sp_tor_period_bill_hdr_id", hdrId);
                        Ext.storeMedSupDtl.load({
                            callback: function (records, operation, success) {
                                if (success) {
                                    for (var i = 0, l = records.length; i < l; i++) {
                                        Ext.objLine = i + 1;
                                        Ext.fnAddMedSupItems(Ext.objLine);
                                        // งวดที่นำเข้าจากไฟล์อาจไม่มีเลขงวด - ว่าง = ใช้เลขงวดอัตโนมัติตามลำดับงวด (01, 02, 03, ...)
                                        var docRef = records[i].get("c_doc_ref");
                                        if (Ext.isEmpty(docRef)) {
                                            var pNo = parseInt(records[i].get("i_period"), 10) || Ext.objLine;
                                            docRef = (pNo < 10 ? "0" : "") + pNo;
                                        }
                                        Ext.getCmp("c_doc_refID[" + Ext.objLine + "]").setValue(docRef);
                                        Ext.getCmp("d_doc_dateSubID[" + Ext.objLine + "]").setValue(records[i].get('d_doc_dateSub'));
                                        Ext.getCmp("c_detailID[" + Ext.objLine + "]").setValue(records[i].get('c_detail'));
                                        // ทับค่าเลขงวด/id ที่ auto-match ไว้ ด้วยค่าที่เคยบันทึกจริง
                                        Ext.getCmp("i_periodID[" + Ext.objLine + "]").setValue(records[i].get('i_period'));
                                        Ext.getCmp("sp_tor_hdr_period_idID[" + Ext.objLine + "]").setValue(records[i].get('sp_tor_hdr_period_id'));
                                        Ext.getCmp("dc_expense_budget_type_id_dtlID[" + Ext.objLine + "]").setValue(records[i].get('dc_expense_budget_type_id_dtl'));
                                        Ext.getCmp("dc_expense_budget_type_id_dtlID[" + Ext.objLine + "]").setRawValue(records[i].get('c_fund_source_dtl'));
                                        Ext.getCmp("c_fund_source_dtlID[" + Ext.objLine + "]").setValue(records[i].get('c_fund_source_dtl'));
                                        Ext.getCmp("f_fund_amt_dtlID[" + Ext.objLine + "]").setValue(records[i].get('f_fund_amt_dtl'));
                                    }
                                }
                                Ext.fnUpdateAddPeriodButton();
                            }
                        });
                    }
                }
            }
        })
    }).show();
}

Ext.AppUx = function (app, menu) {
    Ext.user_right_add = user_right_add;
    Ext.user_right_edit = user_right_edit;
    Ext.user_right_delete = user_right_delete;
    Ext.title = Ext.menu_name + " " + Ext.menu_code;
    Ext.selectRow = [];

    Ext.storeMedSupList = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "tor/api/List_MedSupPeriodBill.php",
        baseParams: {type: "medsup_period_bill"},
        root: "data",
        idProperty: "id",
        totalProperty: "totalCount",
        fields: [
            "no", "id", "sp_tor_period_bill_hdr_id", "sp_tor_contract_id", "sp_tor_id", "pr_hdr_id", "sp_tor_hdr_period_id",
            "c_contract_code", "i_period", "c_project_name", "c_contract_type", "c_ap_dept_type",
            "dc_expense_budget_type_id", "c_fund_source", "f_fund_amt", "c_overlap", "i_budget_year_overlap",
            "dc_expense_budget_type_id2", "c_fund_source2", "f_fund_amt2", "c_overlap2", "i_budget_year_overlap2",
            "dc_expense_budget_type_id3", "c_fund_source3", "f_fund_amt3", "c_overlap3", "i_budget_year_overlap3",
            "po_expense_id", "c_expense_name",
            "i_budget_year", "d_start_date", "d_end_date",
            "c_po_no", "dc_creditor_id", "c_creditor_name", "c_tax_number_imp",
            "n_lines", "f_total_amt", "d_create", "c_create_name",
            "bg_reserve_money_id", "d_ap_reserve",
            "bg_reserve_money_id2", "d_ap_reserve2",
            "bg_reserve_money_id3", "d_ap_reserve3",
            "erp_reserve_status", "erp_reserve_status2", "erp_reserve_status3",
        ],
    });

    Ext.storeMedSupDtl = new Ext.data.JsonStore({
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

    Ext.loadStore = function () {};

    function cellClick(grid, rowIndex, columnIndex, e) {
        var record = grid.getStore().getAt(rowIndex);
        Ext.selectRow = record;
        if (columnIndex === grid.getColumnModel().getIndexById("editMedSupID")) {
            winMedSupPeriodBill("edit");
        } else if (columnIndex === grid.getColumnModel().getIndexById("delMedSupID")) {
            Ext.MessageBox.show({
                title: "ยืนยัน",
                msg: "คุณต้องการที่จะลบรายการที่เลือกนี้ใช่หรือไม่ ?",
                buttons: Ext.MessageBox.OKCANCEL,
                icon: Ext.MessageBox.WARNING,
                id: 'row-del-medsup',
                fn: function (btn) {
                    if (btn === "ok") {
                        Ext.Ajax.request({
                            url: Ext.url_process,
                            method: "POST",
                            params: {mode: "DELETE", sp_tor_period_bill_hdr_id: record.get('sp_tor_period_bill_hdr_id')},
                            success: function () {
                                Ext.getCmp("tabpanel1").getStore().reload();
                                Ext.selectRow = null;
                                Ext.getCmp('row-del-medsup').destroy();
                            }
                        });
                    }
                }
            });
        }
    }

    // ดับเบิลคลิกที่แถวไหนก็ได้ (ไม่ต้องเล็งไอคอน "แก้ไข" โดยเฉพาะ) ให้เปิดหน้าต่าง
    // แก้ไข/เพิ่มงวดของรายการนั้นได้เลย เหมือนกับกดไอคอนดินสอ
    function rowDblClick(grid, rowIndex) {
        var record = grid.getStore().getAt(rowIndex);
        Ext.selectRow = record;
        winMedSupPeriodBill("edit");
    }

    var MenuButton = function () {
        var menuList = new Ext.menu.Menu({id: "mainMenu", border: false});
        var tb = new Ext.Toolbar({text: " รายการเมนู ", border: false, iconCls: "menu", menu: menuList});
        tb.add({text: " รายการเมนู ", iconCls: "bmenu", border: false, menu: menuList});
        menuList.addSeparator();
        menuList.add({text: "ค้นหาข้อมูล", icon: "../images/icons/book_magnify.png"})
            .on("click", function () {
                var v = Ext.Msg.prompt("ค้นหา", "เลขที่สัญญา", function (btn, text) {
                    if (btn === "ok") {
                        Ext.storeMedSupList.setBaseParam("act", "SEARCH");
                        Ext.storeMedSupList.setBaseParam("c_contract_code", text);
                        Ext.storeMedSupList.load();
                    }
                });
            });
        menuList.add({text: "เพิ่มรายการบันทึกรายละเอียดในสัญญา (เวชภัณฑ์)", icon: "../images/icons/add.png"})
            .on("click", function () {
                winMedSupPeriodBill("add");
            });
        tb.doLayout();
        return tb;
    };

    Ext.extend(
        (gridMain = function () {
            var colmnn = [
                new Ext.grid.RowNumberer({header: "ที่", dataIndex: "no", width: 40}),
                {header: "รหัส", dataIndex: "id", hidden: true},
                {header: "เลขที่สัญญา", dataIndex: "c_contract_code", width: 150},
                {header: "งวดสูงสุด", dataIndex: "i_period", width: 70, align: "center"},
                {header: "ประเภทของสัญญา", dataIndex: "c_contract_type", width: 110},
                {header: "ชื่อโครงการ", dataIndex: "c_project_name", width: 180},
                {header: "ชื่อค่าใช้จ่าย", dataIndex: "c_expense_name", width: 180},
                {header: "แหล่งเงิน", dataIndex: "c_fund_source", width: 130},
                {header: "เลข PO", dataIndex: "c_po_no", width: 100},
                {header: "ผู้ขาย/ผู้รับจ้าง", dataIndex: "c_creditor_name", width: 180},
                {header: "จำนวนงวด", dataIndex: "n_lines", width: 80, align: "center"},
                {header: "จำนวนเงินรวม", dataIndex: "f_total_amt", width: 120, align: "right"},
                {header: "ผู้บันทึก", dataIndex: "c_create_name", width: 150},
                {
                    header: "วันที่บันทึก", dataIndex: "d_create", width: 130,
                    renderer: function (val) {
                        return shortThaiDate(val);
                    }
                },
                {
                    header: "แก้ไข", sortable: false, hideable: false, draggable: false, align: "center",
                    id: "editMedSupID", width: 40, dataIndex: "id",
                    renderer: function () {
                        return '<img src="../images/icons/document_edit.gif" style="cursor:pointer"/>';
                    }
                },
                {
                    header: "ลบ", sortable: false, hideable: false, draggable: false, align: "center",
                    id: "delMedSupID", width: 35, dataIndex: "id",
                    renderer: function () {
                        return '<img src="../images/icons/table_delete.png" style="cursor:pointer"/>';
                    }
                },
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
                        this.on("cellclick", cellClick, this);
                        this.on("rowdblclick", rowDblClick, this);
                    },
                },
                store: Ext.storeMedSupList,
                tbar: MenuButton(),
                columns: colmnn,
                bbar: new Ext.PagingToolbar({
                    pageSize: 20,
                    store: Ext.storeMedSupList,
                    displayInfo: true,
                    displayMsg: "Displaying topics {0} - {1} of {2}",
                }),
            });
        }),
        Ext.grid.GridPanel,
        {}
    );
};
