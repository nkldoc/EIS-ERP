/* global Ext */
Ext.onReady(function () {
  Ext.QuickTips.init();
  Ext.idRep = "frm-repTor";
  //Spring Boot cross context
Ext.urlReport = true ? "../../reports/repSpTorCheck" : "../../reports/printr.php?get=true"; //DEBUG
// Ext.urlReport = false ? "../../reports/repSpTorCheck" : "../../reports/printr.php?get=true"; //DEBUG
  // Spring Boot
  Ext.titleReport = "รายงานคุม PR";

  // storeYear
  var years = [];
  var currentTime = new Date();
  var now = currentTime.getFullYear() + 1;
  var yy_en = Ext.START_YEAR_ACC;
  years.push({ id: "0", c_name: "- เลือกทั้งหมด -" });
  while (yy_en <= now) {
    years.push({ id: yy_en, c_name: yy_en + 543 });
    yy_en++;
  }
  Ext.store_year_all = new Ext.data.JsonStore({
    fields: ["id", "c_name"],
    data: years,
  });

  Ext.sp_user = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_RepSpTorPAuser.php",
    baseParams: { type: "sp_emp_department", all: "all" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
    listeners: {
      load: function (t, records, options) {
        Ext.getCmp("sp_user_idID").setValue("0");
      },
    },
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

Ext.po_expense = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_RepSpTorExp.php",
    baseParams: {
        type: "po_expense",
        all: "all",
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

  Ext.sp_department = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "api/All_RepSpContractPeriodnotor.php",
    baseParams: { type: "sp_department_type", all: "all" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
    listeners: {
      load: function (t, records, options) {
        Ext.getCmp("dc_department_idID").setValue("0");
      },
    },
  });

  Ext.dc_cost = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_RepSpContract.php",
    baseParams: { type: "dc_cost", all: "all" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
    listeners: {
      load: function (t, records, options) {
        Ext.getCmp("dc_cost_idID").setValue("0");
      },
    },
  });
  function getTitleReport(v) {
    var y543 = Ext.getCmp("i_yyyyID").getValue() > 0 ? 543 : 0;
    Ext.getCmp("getReportTypeID").setValue(v);
    Ext.getCmp("dis_i_yyyyID").setValue(parseInt(Ext.getCmp("i_yyyyID").getValue()) + y543 > 0 ? parseInt(Ext.getCmp("i_yyyyID").getValue()) + y543 : "- เลือกทั้งหมด -");
    Ext.getCmp("dis_sp_user_idID").setValue(getStoreItems(Ext.sp_user, Ext.getCmp("sp_user_idID").getValue(), "c_name"));
    Ext.getCmp("dis_dc_department_idID").setValue(getStoreItems(Ext.sp_department,Ext.getCmp("dc_department_idID").getValue() , "c_name"));
    Ext.getCmp("dis_d_date_startID").setValue(Ext.util.Format.date(Ext.getCmp("d_date_startID").getValue(), "Y-m-d"));
    Ext.getCmp("dis_d_date_endID").setValue(Ext.util.Format.date(Ext.getCmp("d_date_endID").getValue(), "Y-m-d"));
    Ext.getCmp("dis_dc_cost_idID").setValue(getStoreItems(Ext.dc_cost, Ext.getCmp("dc_cost_idID").getValue(), "c_name"));
    Ext.getCmp("dis_dc_expense_budget_type_idID").setValue(getStoreItems(Ext.dc_expense_budget_type, Ext.getCmp("dc_expense_budget_type_idID").getValue(), "c_name"));
    Ext.getCmp("dis_po_expense_idID").setValue(getStoreItems(Ext.po_expense, Ext.getCmp("po_expense_idID").getValue(), "c_name"));
  }

  function frmWithOutAjax(value) {
    //set display title report
    getTitleReport(value);
    //set submit post report with ajax
    var frm = Ext.getCmp(Ext.idRep).getForm().el.dom;
    // frm.setAttribute("target", Ext.idRep);
    frm.setAttribute("target","_blank");
    frm.setAttribute("action", Ext.urlReport);
    frm.submit();
    frm.focus();
  }

  function setButtonReport() {
    var pdfReport = {
      text: Ext.GLOBAL_BU_REPORT_TH,
      scale: "small",
      iconCls: "icon-pdf",
      handler: function () {
        frmWithOutAjax("pdf");
      },
    };
    var excelReport = {
      text: Ext.GLOBAL_BU_EXCEL_TH,
      scale: "small",
      id: "rep-excel",
      iconCls: "icon-excel",
      handler: function () {
        frmWithOutAjax("excel");
      },
    };
    var exp2pdf = {
      text: "Export Pdf",
      scale: "small",
      id: "rep-exp2pdf",
      iconCls: "icon-export",
      handler: function () {
        frmWithOutAjax("exp2pdf");
      },
    };
    var exp2xlsx = {
      text: "Export Xlsx",
      scale: "small",
      id: "rep-exp2xlsx",
      iconCls: "icon-export",
      handler: function () {
        frmWithOutAjax("exp2xlsx");
      },
    };
        return [pdfReport, excelReport/**/, exp2pdf, exp2xlsx];
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
                title: "รายงานคุม PR",
                RemoveCls: "x-box-item",
                defaults: { labelStyle: "width:200px;", allowBlank: true },
                items: [
                  { xtype: "hidden", id: "titleReportID", name: "titleReport", value: Ext.titleReport },
                  { xtype: "hidden", id: "rptID", name: "rpt", value: 5 },
                  { xtype: "hidden", id: "getReportTypeID", name: "getReportType", value: "pdf" },
                  { xtype: "hidden", name: "jasperName", value: "RepSpTorCheck" },
                  { xtype: "hidden", id: "dis_dc_department_idID", name: "dis_dc_department_id", value: "ทั้งหมด" },
                  { xtype: "hidden", id: "dis_i_yyyyID", name: "dis_i_yyyy", value: "ทั้งหมด" },
                  { xtype: "hidden", id: "dis_sp_user_idID", name: "dis_sp_user_id", value: "ทั้งหมด" },
                  { xtype: "hidden", id: "dis_d_date_startID", name: "dis_d_date_start", value: "ทั้งหมด" },
                  { xtype: "hidden", id: "dis_d_date_endID", name: "dis_d_date_end", value: "ทั้งหมด" },
                  { xtype: "hidden", id: "dis_dc_cost_idID", name: "dis_dc_cost_id", value: "ทั้งหมด" },
                  { xtype: "hidden", id: "dis_dc_expense_budget_type_idID", name: "dis_dc_expense_budget_type_id", value: "ทั้งหมด"},
                  { xtype: "hidden", id: "dis_po_expense_idID", name: "dis_po_expense_id", value: "ทั้งหมด"},


                  new Ext.form.ComboBox({
                    id: "i_yyyyID",
                    fieldLabel: "ปีงบประมาณ",
                    hiddenName: "i_yyyy",
                    store: Ext.store_year_all,
                    valueField: "id",
                    displayField: "c_name",
                    mode: "local",
                    triggerAction: "all",
                    width: 150,
                    forceSelection: true,
                    selectOnFocus: true,
                    value: "0", 
                  }),
                  new Ext.form.ComboBox({
                    id: "dc_expense_budget_type_idID",
                    hiddenName: "dc_expense_budget_type_id",
                    fieldLabel: "แหล่งเงิน",
                    store: Ext.dc_expense_budget_type,
                    valueField: "id",
                    displayField: "c_name",
                    mode: "local",
                    triggerAction: "all",
                    emptyText: "กรุณาเลือก...",
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
                    emptyText: "กรุณาเลือก...",
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
                    id: "dc_department_idID",
                    fieldLabel: "สายงาน",
                    hiddenName: "dc_department_id",
                    store: Ext.sp_department,
                    valueField: "id",
                    displayField: "c_name",
                    mode: "local",
                    triggerAction: "all",
                    width: 350,
                    forceSelection: true,
                    selectOnFocus: true,
                    value: "0",
                  }),
                  new Ext.form.ComboBox({
                    id: "dc_cost_idID",
                    fieldLabel: "หน่วยงานเจ้าของเรื่อง",
                    hiddenName: "dc_cost_id",
                    store: Ext.dc_cost,
                    valueField: "id",
                    displayField: "c_name",
                    mode: "local",
                    triggerAction: "all",
                    width: 350,
                    forceSelection: true,
                    selectOnFocus: true,
                    value: "0",
                  }),
                  new Ext.form.ComboBox({
                    id: "sp_user_idID",
                    hiddenName: "sp_user_id",
                    fieldLabel: "ชื่อพนักงาน",
                    store: Ext.sp_user,
                    valueField: "id",
                    displayField: "c_name",
                    mode: "local",
                    triggerAction: "all",
                    emptyText: "กรุณาเลือก...",
                    width: 200,
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
                  {
                    xtype: "compositefield",
                    fieldLabel: "ระหว่างวันที่",
                    msgTarget: "under",
                    items: [
                      {
                        xtype: "datefield",
                        id: "d_date_startID",
                        width: 177,
                        value: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
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
  Ext.sp_department.load({
    callback: function (record, operation, success) {
        if (success) { ////
          
    new Ext.Viewport({
      layout: "border",
      items: panelForm,
    });
        }
    },
  });
  new Ext.Viewport({
    layout: "border",
    items: panelForm,
  });
  
});
