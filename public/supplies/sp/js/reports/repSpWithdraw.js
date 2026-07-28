/* global Ext */
Ext.onReady(function () {
  Ext.QuickTips.init();
  Ext.idRep = "frm-repTor";
  //Spring Boot cross context
  Ext.urlReport = true ? "../../reports/repSpWithdraw" : "../../reports/printr.php?get=true"; //DEBUG
  // Ext.urlReport = false ? "../../reports/RepSpWithdraw" : "../../reports/printr.php?get=true"; //DEBUG
  // Spring Boot
  Ext.titleReport = "รายงานรายการที่ขอเบิก";
  Ext.sp_tor_status = new Ext.data.JsonStore({
    autoLoad: true,
    url: "api/All_RepSpTorStatus.php",
    baseParams: { type: "sp_tor_status", 
                },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name","i_menu"],
  });
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
  function getTitleReport(v) {
    // alert(Ext.newStr);
    // return false ; 
      Ext.getCmp('getReportTypeID').setValue(v);
      Ext.getCmp("dis_d_date_startID").setValue(Ext.util.Format.date(Ext.getCmp("d_date_startID").getValue(), "Y-m-d"));
      Ext.getCmp("dis_d_date_endID").setValue(Ext.util.Format.date(Ext.getCmp("d_date_endID").getValue(), "Y-m-d"));
      // Ext.getCmp("dis_sp_tor_status_idID").setValue(getStoreItems(Ext.sp_tor_status,Ext.getCmp("sp_tor_status_id").getValue() , "id"));
    }
  function frmWithOutAjax(value) {
          getTitleReport(value);
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
    var html = {
      text: "html",
      scale: "small",
      id: "rep-exp2pdf",
      iconCls: "icon-html",
      handler: function () {
        frmWithOutAjax("exp2html");
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
                title: "รายงานใบเบิก",
                RemoveCls: "x-box-item",
                defaults: { labelStyle: "width:200px;", allowBlank: true },
                items: [
                  { xtype: "hidden", id: "titleReportID", name: "titleReport", value: Ext.titleReport },
                  { xtype: "hidden", id: "getReportTypeID", name: "getReportType", value: "pdf" },
                  { xtype: "hidden", name: "jasperName", value: "repSpWithdraw" },
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                  { xtype: "hidden", id: "dis_d_date_startID", name: "dis_d_date_start", value: "ทั้งหมด" },
                  { xtype: "hidden", id: "dis_d_date_endID", name: "dis_d_date_end", value: "ทั้งหมด" },
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



