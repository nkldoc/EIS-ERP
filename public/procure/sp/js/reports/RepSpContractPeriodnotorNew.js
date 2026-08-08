/* global Ext */
Ext.onReady(function () {
  Ext.QuickTips.init();
  Ext.idRep = "frm-repTor";
  //Spring Boot cross context
Ext.urlReport     = true ? "../../reports/repSpContract_registrationGL" : "../../reports/printr.php?get=true"; //DEBUG (PDF/Excel เดิม) — TODO: ปรับ path ให้ตรงกับ endpoint spring boot ฝั่ง EIS_PROCURE ถ้าใช้คนละ endpoint กับฝั่งคณะแพทย์
Ext.urlReportHTML = "report/RepSpContract_registrationGL_html.php"; // endpoint HTML ใหม่
  // Spring Boot
  Ext.titleReport = "รายงานทะเบียนคุมสัญญา (มหาวิทยาลัย)";
  // หมายเหตุ: ตัด combo "ดูรายงานตามสิทธิ์" (PermissionEmp) ออกจากฟอร์มแบบง่ายแล้ว
  // ค่า i_view ถูกส่งเป็น hidden field แทน (ดูใน items ของฟอร์มด้านล่าง)
  Ext.sp_department = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "api/All_RepSpContractPeriodnotor.php",
    baseParams: { type: "sp_department", all: "all" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
    listeners: {
      load: function (t, records, options) {
        // Ext.getCmp("dc_department_idID").setValue("0");
        // alert("sp_department") ;
      },
    },
  });
  Ext.sp_tor_contract = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "api/All_RepSpContract.php",
    baseParams: { type: "sp_tor_contract", all: "all", i_sys: "3" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_code"],
    listeners: {
      load: function (t, records, options) {
        Ext.getCmp("sp_tor_contract_idID").setValue("0");
        // alert("sp_tor_contract") ;
      },
    },
  });
    // storeYear
    var years = [];
    var currentTime = new Date();
    var now = currentTime.getFullYear() + 1;
    var yy_en = Ext.START_YEAR_ACC;
    years.push({id: "0", c_name: "- เลือกทั้งหมด -"});
    while (yy_en <= now) {
        years.push({id: yy_en, c_name: yy_en + 543});
        yy_en++;
    }

    Ext.store_year_all = new Ext.data.JsonStore({
        fields: ["id", "c_name"],
        data: years,
    });
    let Date_now = new Date();
    Date_now = Date_now.toISOString().split("T")[0].split("-");
    Ext.bgYear = Date_now[0] - 0 + ((Date_now[1] < 10 ? 0 : 1) - 0);
  
    store_year = new Ext.data.JsonStore({
    fields: ["id", "c_name"],
    data: years,
    });
    Ext.dc_expense_budget_type = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/All_RepSpTorExp.php",
        baseParams: {type: "dc_expense_budget_type", all: "all"},
        root: "data",
        idProperty: "id",
        fields: ["id", "c_name"],
        listeners: {
            load: function (t, records, options) {
                Ext.getCmp("dc_expense_budget_type_idID").setValue("0");
            },
        },
    });
  Ext.sp_emp = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_RepSpContractPeriodnotor.php",
    baseParams: { type: "sp_emp", all: "all", i_sys: "3" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
    listeners: {
      load: function (t, records, options) {
        Ext.getCmp("sp_emp_idID").setValue("0");
      },
    },
  });
  Ext.dc_expense_budget_type = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_RepSpTorExp.php",
    baseParams: { type: "dc_expense_budget_type", all: "all", i_sys: "3" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
    listeners: {
      load: function (t, records, options) {
      Ext.getCmp("dc_expense_budget_type_idID").setValue("0");
      },
    },
  });
  Ext.po_expense = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_RepSpTorExp.php",
    baseParams: {
        type: "po_expense",
        all: "all",
        i_sys: "3",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
    listeners: {
        load: function (t, records, options) {
            Ext.getCmp("po_expense_idID").setValue("0");
        },
    },
});
Ext.dc_creditor = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_PoWorkingImpHdr.php", // ใช้ endpoint เดียวกับ RepSpContractPeriodnotorNew.js (คืน record "ทั้งหมด" ให้ถูกต้อง)
    baseParams: { type: "dc_creditor", Repall: "Repall" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_code", "c_name"],
    listeners: {
        load: function (t, records, options) {
            Ext.getCmp("dc_creditor_idID").setValue(0);
        },
    },
});
// var pu_arr = [];
  // pu_arr[1]="จัดซื้อ";
  // pu_arr[2]="จัดจ้าง";
  // pu_arr[3]="จัดเช่า";
  // Ext.getCmp("dis_i_purchaseID").setValue(pu_arr[Ext.getCmp("i_purchaseID").items.items[(Ext.getCmp("i_purchaseID").getValue().inputValue];
  function getTitleReport(v) {
       Ext.getCmp('getReportTypeID').setValue(v);
       var y543 = Ext.getCmp("i_yyyyID").getValue() > 0 ? 543 : 0;

       //
      Ext.getCmp("dis_dc_department_idID").setValue(getStoreItems(Ext.sp_department,Ext.getCmp("dc_department_idID").getValue() , "c_name"));
      Ext.getCmp("dis_sp_emp_idID").setValue(getStoreItems(Ext.sp_emp,Ext.getCmp("sp_emp_idID").getValue() , "c_name"));
      Ext.getCmp("dis_sp_tor_contract_idID").setValue(getStoreItems(Ext.sp_tor_contract,Ext.getCmp("sp_tor_contract_idID").getValue() , "c_code"));
      // หมายเหตุ: ตัดฟิลด์ i_type_Rep (radiogroup เรียงตาม) ออกจากฟอร์มแบบง่ายแล้ว จึงไม่ต้อง sync ค่า dis_i_type_RepID ตรงนี้อีกต่อไป
      // ช่วงวันที่เริ่มสัญญา (d_date_start/d_date_end) เพิ่มกลับเข้ามาแล้ว ให้ sync ค่า dis_d_date_startID / dis_d_date_endID ด้วย
      Ext.getCmp("dis_d_date_startID").setValue(Ext.util.Format.date(Ext.getCmp("d_date_startID").getValue(), "Y-m-d"));
      Ext.getCmp("dis_d_date_endID").setValue(Ext.util.Format.date(Ext.getCmp("d_date_endID").getValue(), "Y-m-d"));
      Ext.getCmp("dis_i_yyyyID").setValue(parseInt(Ext.getCmp("i_yyyyID").getValue()) + y543 > 0 ? parseInt(Ext.getCmp("i_yyyyID").getValue()) + y543 : "- เลือกทั้งหมด -");
      Ext.getCmp("dis_dc_expense_budget_type_idID").setValue(getStoreItems(Ext.dc_expense_budget_type, Ext.getCmp("dc_expense_budget_type_idID").getValue(), "c_name"));
      Ext.getCmp("dis_po_expense_idID").setValue(getStoreItems(Ext.po_expense, Ext.getCmp("po_expense_idID").getValue(), "c_name"));
      Ext.getCmp("dis_dc_creditor_idID").setValue(getStoreItems(Ext.dc_creditor, Ext.getCmp("dc_creditor_idID").getValue(), "c_name"));
      // ส่วนงาน (เลือกได้หลายรายการ) — combo จะอัพเดต dis_dc_cost_acc_idID ให้เองทุกครั้งที่เลือก/ยกเลิกเลือก
      // แต่ sync ซ้ำอีกครั้งตรงนี้เผื่อกรณี field ยังไม่เคย trigger listener
      var dcCostCombo = Ext.getCmp("dc_cost_acc_idID");
      if (dcCostCombo && typeof dcCostCombo.updateDisplay === "function") {
        dcCostCombo.updateDisplay();
      }
    }
  function frmWithOutAjax(value) {
    getTitleReport(value);
    var frm = Ext.getCmp(Ext.idRep).getForm().el.dom;
    frm.setAttribute("target", Ext.idRep);
    frm.setAttribute("action", Ext.urlReport);
    frm.submit();
    frm.focus();
  }
  // เปิดรายงาน HTML ใน tab ใหม่ (ส่ง params ผ่าน URL querystring)
  function frmHtmlReport() {
    getTitleReport("html");
    var form   = Ext.getCmp(Ext.idRep).getForm();
    var values = form.getValues();
    // ข้อมูลซื้อจ้าง (i_sys) ถูกแทนที่ด้วยฟิลด์ "ส่วนงาน" (dc_cost_acc_id) แล้ว
    // คงค่า i_sys ไว้ตามค่าจาก hidden field เดิม (ค่าเริ่มต้น "0" = ไม่กรองแยกระบบ)
    // อ่านค่า i_type_Rep จาก DOM โดยตรง (1=PR, 2=เลขสัญญา, 0=ทั้งหมด)
    var checkedRep = document.querySelector('input[name="i_type_Rep"]:checked');
    values['i_type_Rep'] = checkedRep ? checkedRep.value : '1';
    var qs = [];
    for (var k in values) {
        if (values.hasOwnProperty(k)) {
            qs.push(encodeURIComponent(k) + '=' + encodeURIComponent(values[k]));
        }
    }
    var url = Ext.urlReportHTML + '?' + qs.join('&');
    window.open(url, '_blank');
}
  // เปิดรายงาน HTML แบบเดียวกัน แต่สั่ง auto export เป็น Excel ทันที
  // (ใช้คิวรี่ชุดเดียวกับรายงาน HTML ผ่าน RepSpContract_registrationGL_data.php)
  function frmExcelReport() {
    getTitleReport("excel");
    var form   = Ext.getCmp(Ext.idRep).getForm();
    var values = form.getValues();
    // ข้อมูลซื้อจ้าง (i_sys) ถูกแทนที่ด้วยฟิลด์ "ส่วนงาน" (dc_cost_acc_id) แล้ว
    var checkedRep = document.querySelector('input[name="i_type_Rep"]:checked');
    values['i_type_Rep'] = checkedRep ? checkedRep.value : '1';
    values['auto'] = 'excel'; // บอกหน้า HTML report ให้ดาวน์โหลด Excel อัตโนมัติหลังโหลดข้อมูลเสร็จ
    var qs = [];
    for (var k in values) {
        if (values.hasOwnProperty(k)) {
            qs.push(encodeURIComponent(k) + '=' + encodeURIComponent(values[k]));
        }
    }
    var url = Ext.urlReportHTML + '?' + qs.join('&');
    window.open(url, '_blank');
  }
  function setButtonReport() {
    var htmlReport = {
      text: "\u0e41\u0e2a\u0e14\u0e07\u0e23\u0e32\u0e22\u0e07\u0e32\u0e19", // แสดงรายงาน
      scale: "small",
      iconCls: "icon-pdf",
      handler: function () {
        frmHtmlReport();
      },
    };
    var excelReport = {
      text: Ext.GLOBAL_BU_EXCEL_TH,
      scale: "small",
      id: "rep-excel",
      iconCls: "icon-excel",
      handler: function () {
        frmExcelReport();
      },
    };
    return [htmlReport, excelReport];
  }
  var panelForm = new Ext.Panel({
    region: "center",
    title: Ext.titleReport,
    border: false,
    stripeRows: true,
    loadMask: true,
    items: [
      {
        xtype: "form",
        id: Ext.idRep,
        frame: true,
        labelAlign: "right",
        labelWidth: 200,
        bodyStyle: { padding: "10px 20px" },
        defaults: { anchor: "100%", msgTarget: "side", allowBlank: false },
        items: [
          {
            xtype: "container",
            layout: "hbox",
            align: "stretch",
            RemoveHeight: true,
            defaults: { xtype: "fieldset", flex: 1, margins: "0px 3px", autoHeight: true },
            items: [
              {
                title: "รายงานรายระเอียดสัญญางวด",
                RemoveCls: "x-box-item",
                defaults: { labelStyle: "width:200px;", allowBlank: true },
                items: [
                  { xtype: "hidden", id: "titleReportID", name: "titleReport", value: Ext.titleReport },
                  { xtype: "hidden", id: "getReportTypeID", name: "getReportType", value: "pdf" },
                  { xtype: "hidden", name: "jasperName", value: "RepSpContractPeriodnotorNew" },
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                  // แบบฟอร์มแบบง่าย (อ้างอิงจาก RepSpContractPeriodnotorNew.js) — เหลือแค่ 6 ฟิลด์ตามที่ต้องการ
                  // dc_department_id เปลี่ยนจาก hidden เป็น ComboBox ที่เลือกได้ (ดูใน items ด้านล่าง) แล้ว
                  { xtype: "hidden", id: "dis_dc_department_idID", name: "dis_dc_department_id", value: "ทั้งหมด" },
                  { xtype: "hidden", id: "dis_sp_tor_contract_idID", name: "dis_sp_tor_contract_id", value: "ทั้งหมด" },
                  { xtype: "hidden", id: "dis_d_date_startID", name: "dis_d_date_start", value: "ทั้งหมด" },
                  { xtype: "hidden", id: "dis_d_date_endID", name: "dis_d_date_end", value: "ทั้งหมด" },
                  { xtype: "hidden", id: "dis_sp_emp_idID", name: "dis_sp_emp_id", value: "ทั้งหมด" },
                  {xtype: "hidden", id: "dis_dc_expense_budget_type_idID", name: "dis_dc_expense_budget_type_id", value: "ทั้งหมด"},
                  {xtype: "hidden", id: "dis_po_expense_idID", name: "dis_po_expense_id", value: "ทั้งหมด"},
                  {xtype: "hidden", id: "dis_dc_creditor_idID", name: "dis_dc_creditor_id", value: "ทั้งหมด"},
                  {xtype: "hidden", id: "dis_i_yyyyID", name: "dis_i_yyyy", value: "ทั้งหมด"},
                  // ไม่มี UI ให้เลือกสิทธิ์การดูข้อมูล/เรียงลำดับ/ส่วนงานแล้ว ใช้ค่า default ที่เหมาะสมแทน
                  { xtype: "hidden", id: "viewID", name: "i_view", value: (Ext.session.i_level || 1) },
                  { xtype: "hidden", id: "i_type_RepID", name: "i_type_Rep", value: "1" },
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                  new Ext.form.ComboBox({
                    id: "i_yyyyID",
                    fieldLabel: "ประจำปี",
                    width: 163,
                    mode: "local",
                    store: store_year,
                    hiddenName: "i_yyyy",
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    value: "0",
                    listeners: {
                      change: function (combo, newValue) {
                        if (newValue == "") {
                          combo.reset();
                        }
                      },
                      select: function (combo, newValue) {
                        Ext.getCmp("d_date_startID").setValue("01-10" + (newValue.id - 1));
                        Ext.getCmp("dis_d_date_startID").setValue("01-10" + (newValue.id - 1));
                        if (newValue.id == Ext.bgYear) {
                          Ext.getCmp("d_date_endID").setValue(addY(543));
                          Ext.getCmp("dis_d_date_endID").setValue(addY(543));
                        } else {
                          Ext.getCmp("d_date_endID").setValue("30-09" + newValue.id);
                          Ext.getCmp("dis_d_date_endID").setValue("30-09" + newValue.id);
                        }
                      },
                      beforequery: function (q) {
                        if (q.query) {
                          var length = q.query.length;
                          q.query = new RegExp(Ext.escapeRe(q.query));
                          q.query.length = length;
                        }
                      },
                      blur: function () {
                        this.getStore().clearFilter();
                      },
                    },
                  }),
                  {
                    xtype: "compositefield",
                    fieldLabel: "ระหว่างวันที่เริ่มสัญญา",
                    msgTarget: "under",
                    items: [
                      {
                        xtype: "datefield",
                        id: "d_date_startID",
                        width: 177,
                        value: "01-10" + (Ext.bgYear - 1),
                      },
                      {
                        xtype: "displayfield",
                        value: "ถึงวันที่",
                        width: 36,
                        align: "center",
                      },
                      {
                        xtype: "datefield",
                        id: "d_date_endID",
                        width: 177,
                        value: addY(543),
                      },
                    ],
                  },
                  new Ext.form.ComboBox({
                    id: "dc_expense_budget_type_idID",
                    hiddenName: "dc_expense_budget_type_id",
                    fieldLabel: "แหล่งเงิน",
                    store: Ext.dc_expense_budget_type,
                    valueField: "id",
                    displayField: "c_name",
                    mode: "local",
                    triggerAction: "all",
                    emptyText: "- เลือกทั้งหมด -",
                    width: 500,
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    value: "0",
                    listeners: {
                      change: function (combo, newValue) {
                        if (newValue == "") {
                          combo.reset();
                        }
                      },
                      beforequery: function (q) {
                        if (q.query) {
                          var length = q.query.length;
                          q.query = new RegExp(Ext.escapeRe(q.query));
                          q.query.length = length;
                        }
                      },
                      blur: function () {
                        this.getStore().clearFilter();
                      },
                    },
                  }),
                  new Ext.form.ComboBox({
                    id: "po_expense_idID",
                    hiddenName: "po_expense_id",
                    fieldLabel: "รายการย่อย",
                    store: Ext.po_expense,
                    valueField: "id",
                    displayField: "c_name",
                    mode: "local",
                    triggerAction: "all",
                    emptyText: "- เลือกทั้งหมด -",
                    width: 500,
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    value: "0",
                    listeners: {
                      change: function (combo, newValue) {
                        if (newValue == "") {
                          combo.reset();
                        }
                      },
                      beforequery: function (q) {
                        if (q.query) {
                          var length = q.query.length;
                          q.query = new RegExp(Ext.escapeRe(q.query));
                          q.query.length = length;
                        }
                      },
                      blur: function () {
                        this.getStore().clearFilter();
                      },
                    },
                  }),
                  new Ext.form.ComboBox({
                    id: "sp_tor_contract_idID",
                    fieldLabel: "เลขที่สัญญา",
                    hiddenName: "sp_tor_contract_id",
                    store: Ext.sp_tor_contract,
                    valueField: "id",
                    displayField: "c_code",
                    mode: "local",
                    triggerAction: "all",
                    width: 260,
                    listWidth: 320,
                    forceSelection: true,
                    selectOnFocus: true,
                    emptyText: "- เลือกทั้งหมด -",
                    value: "0",
                  }),
                  new Ext.form.ComboBox({
                    id: "dc_department_idID",
                    hiddenName: "dc_department_id",
                    fieldLabel: "แผนก",
                    store: Ext.sp_department,
                    valueField: "id",
                    displayField: "c_name",
                    mode: "local",
                    triggerAction: "all",
                    emptyText: "- เลือกทั้งหมด -",
                    width: 350,
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    value: "0",
                    listeners: {
                      change: function (combo, newValue) {
                        if (newValue == "") {
                          combo.reset();
                        }
                      },
                      beforequery: function (q) {
                        if (q.query) {
                          var length = q.query.length;
                          q.query = new RegExp(Ext.escapeRe(q.query));
                          q.query.length = length;
                        }
                      },
                      blur: function () {
                        this.getStore().clearFilter();
                      },
                    },
                  }),
                  new Ext.form.ComboBox({
                    id: "sp_emp_idID",
                    hiddenName: "sp_emp_id",
                    fieldLabel: "ชื่อพนักงาน",
                    store: Ext.sp_emp,
                    valueField: "id",
                    displayField: "c_name",
                    mode: "local",
                    triggerAction: "all",
                    emptyText: "- เลือกทั้งหมด -",
                    width: 350,
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    value: "0",
                    listeners: {
                      change: function (combo, newValue) {
                        if (newValue == "") {
                          combo.reset();
                        }
                      },
                      beforequery: function (q) {
                        if (q.query) {
                          var length = q.query.length;
                          q.query = new RegExp(Ext.escapeRe(q.query));
                          q.query.length = length;
                        }
                      },
                      blur: function () {
                        this.getStore().clearFilter();
                      },
                    },
                  }),
                  new Ext.form.ComboBox({
                    id: "dc_creditor_idID",
                    hiddenName: "dc_creditor_id",
                    fieldLabel: "ผู้ขายผู้รับจ้าง",
                    store: Ext.dc_creditor,
                    valueField: "id",
                    displayField: "c_name",
                    mode: "local",
                    triggerAction: "all",
                    emptyText: "- เลือกทั้งหมด -",
                    width: 500,
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    value: "0",
                  }),
                ],
              },
            ],
          },
        ],
        buttonAlign: "left",
        buttons: setButtonReport(),
      },
    ],
  });

  
  
  Ext.sp_department.reload({
    callback: function (record, operation, success) {
        if (success) { ////
          Ext.sp_tor_contract.reload({
            callback: function (record, operation, success) {
                if (success) { 
                  new Ext.Viewport({
                    layout: "border",
                    items: panelForm,
                  });
               }
            },
          });
        }
    },
  });
});