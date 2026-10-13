/* global Ext */
Ext.onReady(function () {
  Ext.QuickTips.init();
  Ext.idRep = "frm-repTor";
  //Spring Boot cross context
  Ext.urlReport = true ? "https://eis.nmu.ac.th:8443/reports/repSpContractStatistic" : "https://eis.nmu.ac.th:8443/reports/printr.php?get=true"; //DEBUG
  // Ext.urlReport = false ? "https://eis.nmu.ac.th:8443/reports/repSpTorPAuser" : "https://eis.nmu.ac.th:8443/reports/printr.php?get=true"; //DEBUG
  // Spring Boot
  Ext.titleReport = "รายงานทะเบียนคุมสถิติการจัดซื้อจัดจ้างประจำปี";

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

  Ext.dc_creditor = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_RepSpContractStatistic.php",
    baseParams: { type: "dc_creditor", all: "all" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
    listeners: {
      load: function (t, records, options) {
        Ext.getCmp("dc_creditor_idID").setValue("0");
      },
    },
  });

  Ext.torType = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_RepSpContractStatistic.php",
    baseParams: { type: "sp_type_status", i_is_type_tor: true, all: "all" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
    listeners: {
      load: function (t, records, options) {
        Ext.getCmp("tor_type_idID").setValue("0");
      },
    },
  });

  function getTitleReport(v) {
    Ext.getCmp("getReportTypeID").setValue(v);

    var y543 = Ext.getCmp("i_yyyyID").getValue() > 0 ? 543 : 0;
    var dis_i_purchase = Ext.getCmp("i_purchaseID").getValue().inputValue == 0 ? "- เลือกทั้งหมด -" : Ext.getCmp("i_purchaseID").getValue().boxLabel;
    var i_type_fix_rate = Ext.getCmp("i_purchaseID").getValue().inputValue >= 2 ? 0 : Ext.getCmp("i_type_fix_rateIDs1").getValue() == true ? 1 : 0;
    var y543 = Ext.getCmp("i_yyyyID").getValue() > 0 ? 543 : 0;

    Ext.getCmp("dis_i_yyyyID").setValue(parseInt(Ext.getCmp("i_yyyyID").getValue()) + y543 > 0 ? parseInt(Ext.getCmp("i_yyyyID").getValue()) + y543 : "- เลือกทั้งหมด -");
    Ext.getCmp("dis_tor_type_idID").setValue(getStoreItems(Ext.torType, Ext.getCmp("tor_type_idID").getValue(), "c_name"));
    Ext.getCmp("dis_dc_creditor_idID").setValue(getStoreItems(Ext.dc_creditor, Ext.getCmp("dc_creditor_idID").getValue(), "c_name"));
    Ext.getCmp("dis_i_purchaseID").setValue(dis_i_purchase);
    Ext.getCmp("dis_i_type_fix_rateID").setValue(i_type_fix_rate == 1 ? "จะซื้อ/ขาย" : "- เลือกทั้งหมด -");
    Ext.getCmp("i_type_fix_rate").setValue(i_type_fix_rate);
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
    return [pdfReport, excelReport /*, exp2pdf, exp2xlsx*/];
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
                title: "รายงานทะเบียนคุมสถิติการจัดซื้อจัดจ้างประจำปี",
                RemoveCls: "x-box-item",
                defaults: { labelStyle: "width:200px;", allowBlank: true },
                items: [
                  { xtype: "hidden", id: "titleReportID", name: "titleReport", value: Ext.titleReport },
                  { xtype: "hidden", id: "rptID", name: "rpt", value: 5 },
                  { xtype: "hidden", id: "getReportTypeID", name: "getReportType", value: "pdf" },
                  { xtype: "hidden", name: "jasperName", value: "RepSpTorPAuser" },

                  { xtype: "hidden", id: "dis_dc_creditor_idID", name: "dis_dc_creditor_id", value: "ทั้งหมด" },
                  { xtype: "hidden", id: "dis_i_yyyyID", name: "dis_i_yyyy", value: "ทั้งหมด" },
                  { xtype: "hidden", id: "dis_tor_type_idID", name: "dis_tor_type_id", value: "ทั้งหมด" },
                  { xtype: "hidden", id: "dis_i_purchaseID", name: "dis_i_purchase", value: "ทั้งหมด" },
                  { xtype: "hidden", id: "dis_i_type_fix_rateID", name: "dis_i_type_fix_rate", value: "ทั้งหมด" },
                  { xtype: "hidden", id: "i_type_fix_rate", name: "i_type_fix_rate", value: "ทั้งหมด" },
                  new Ext.form.ComboBox({
                    id: "dc_creditor_idID",
                    fieldLabel: "ชื่อคู่สัญญา",
                    hiddenName: "dc_creditor_id",
                    store: Ext.dc_creditor,
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
                    id: "tor_type_idID",
                    hiddenName: "tor_type_id",
                    fieldLabel: "วิธีดำเนินงาน",
                    store: Ext.torType,
                    valueField: "id",
                    displayField: "c_name",
                    mode: "local",
                    triggerAction: "all",
                    emptyText: "กรุณาเลือก...",
                    width: 150,
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
                    xtype: "radiogroup",
                    columns: [90, 60, 60, 60],
                    fieldLabel: "ขอดำเนินการ",
                    id: "i_purchaseID",
                    name: "i_purchase",
                    items: [
                      {
                        checked: true,
                        name: "i_purchase",
                        inputValue: 0,
                        boxLabel: "เลือกทั้งหมด",
                      },
                      {
                        name: "i_purchase",
                        inputValue: 1,
                        boxLabel: "จัดซื้อ",
                      },
                      {
                        inputValue: 2,
                        name: "i_purchase",
                        boxLabel: "จัดจ้าง",
                      },
                      {
                        name: "i_purchase",
                        inputValue: 3,
                        boxLabel: "จัดเช่า",
                      },
                    ], //radiogroup
                    listeners: {
                      change: function () {
                        if (this.getValue().inputValue == 0 || this.getValue().inputValue == 1) {
                          Ext.getCmp("i_type_fix_rateGID").show();
                        } else {
                          Ext.getCmp("i_type_fix_rateGID").hide();
                          Ext.getCmp("i_type_fix_rateGID").checked = false;
                        }
                      },
                    },
                  },
                  {
                    xtype: "checkboxgroup",
                    fieldLabel: "ประเภทสัญญา",
                    name: "i_type_fix_rate",
                    id: "i_type_fix_rateGID",
                    columns: 1,
                    items: [
                      {
                        id: "i_type_fix_rateIDs1",
                        boxLabel: "จะซื้อ/ขาย",
                        name: "i_type_fix_rate",
                        inputValue: 1,
                      },
                    ],
                    listeners: {
                      afterrender: function () {
                        if (Ext.buAct == "update") {
                          if (Ext.selectRow.get("i_type_fix_rate") == true) {
                            Ext.getCmp("i_type_fix_rateIDs1").setValue(true);
                          }
                        }
                      },
                    },
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
