/* global Ext */
Ext.onReady(function () {
  Ext.QuickTips.init();
  Ext.idRep = "frm-repTor";
  //Spring Boot cross context
    Ext.urlReport = true ? "https://eis.nmu.ac.th:8443/reports/repProSpContract" : "https://eis.nmu.ac.th:8443/reports/printr.php?get=true"; //DEBUG
//    Ext.urlReport = false ? "https://eis.nmu.ac.th:8443/reports/repSpContract" : "https://eis.nmu.ac.th:8443/reports/printr.php?get=true"; //DEBUG
  // Spring Boot
  Ext.titleReport = "รายงานผลจัดทำสัญญาหรือข้อตกลงเป็นหนังสือ";

  Ext.dc_cost = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_RepSpContract.php",
    baseParams: { type: "dc_cost", all: "all",c_sub:" AND c_sub between '01' and '07'" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
    listeners: {
      load: function (t, records, options) {
        Ext.getCmp("dc_cost_idID").setValue("0");
      },
    },
  });

  Ext.dc_expense_budget_type = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_RepSpContract.php",
    baseParams: { type: "dc_expense_budget_type", all: "all" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
    listeners: {
      load: function (t, records, options) {
        Ext.getCmp("dc_expense_budget_type_idID").setValue("0");
      },
    },
    });


    function getTitleReport(v) {
        Ext.getCmp('getReportTypeID').setValue(v);
    Ext.getCmp("dis_dc_cost_idID").setValue(getStoreItems(Ext.dc_cost, Ext.getCmp("dc_cost_idID").getValue(), "c_name"));
    Ext.getCmp("dis_dc_expense_budget_type_idID").setValue(getStoreItems(Ext.dc_expense_budget_type, Ext.getCmp("dc_expense_budget_type_idID").getValue(), "c_name"));
    Ext.getCmp("dis_d_date_startID").setValue(Ext.util.Format.date(Ext.getCmp("d_date_startID").getValue(), "Y-m-d"));
    Ext.getCmp("dis_d_date_endID").setValue(Ext.util.Format.date(Ext.getCmp("d_date_endID").getValue(), "Y-m-d"));
  }

  function frmWithOutAjax(value) {
    //set display title report
    getTitleReport(value);
    //set submit post report with ajax
    var frm = Ext.getCmp(Ext.idRep).getForm().el.dom;
    frm.setAttribute("target", Ext.idRep);
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
        return [pdfReport, excelReport/*, exp2pdf, exp2xlsx*/];
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
                title: "รายงานผลจัดทำสัญญาหรือข้อตกลงเป็นหนังสือ",
                RemoveCls: "x-box-item",
                defaults: { labelStyle: "width:200px;", allowBlank: true },
                items: [
                  { xtype: "hidden", id: "titleReportID", name: "titleReport", value: Ext.titleReport },
                  { xtype: "hidden", id: "rptID", name: "rpt", value: 5 },
                  { xtype: "hidden", id: "getReportTypeID", name: "getReportType", value: "pdf" },
                  { xtype: "hidden", name: "jasperName", value: "RepSpContract" },

                  { xtype: "hidden", id: "dis_dc_cost_idID", name: "dis_dc_cost_id", value: "ทั้งหมด" },
                  { xtype: "hidden", id: "dis_dc_expense_budget_type_idID", name: "dis_dc_expense_budget_type_id", value: "ทั้งหมด" },
                  { xtype: "hidden", id: "dis_d_date_startID", name: "dis_d_date_start", value: "ทั้งหมด" },
                  { xtype: "hidden", id: "dis_d_date_endID", name: "dis_d_date_end", value: "ทั้งหมด" },
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
                    id: "dc_expense_budget_type_idID",
                    hiddenName: "dc_expense_budget_type_id",
                    fieldLabel: "แหล่งเงิน",
                    store: Ext.dc_expense_budget_type,
                    valueField: "id",
                    displayField: "c_name",
                    mode: "local",
                    triggerAction: "all",
                    emptyText: "กรุณาเลือก...",
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
  new Ext.Viewport({
    layout: "border",
    items: panelForm,
  });
});
