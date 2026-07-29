/* global Ext */
Ext.onReady(function () {
  Ext.QuickTips.init();
  Ext.idRep = "frm-repTor";
  //Spring Boot cross context
  Ext.urlReport = true ? "../../reports/repSp_Status" : "../../reports/printr.php?get=true"; //DEBUG
  // Ext.urlReport = false ? "../../reports/repSp_Status" : "../../reports/printr.php?get=true"; //DEBUG
  // Spring Boot
  Ext.titleReport = "สถานะรายการ";
  Ext.sp_tor_status = new Ext.data.JsonStore({
    autoLoad: true,
    url: "api/All_RepSpTorStatus.php",
    baseParams: { type: "sp_tor_status", 
                  // i_level: 4, 
                  // show: "all" 
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
      // Ext.getCmp("dis_d_date_startID").setValue(Ext.util.Format.date(Ext.getCmp("d_date_startID").getValue(), "Y-m-d"));
      // Ext.getCmp("dis_d_date_endID").setValue(Ext.util.Format.date(Ext.getCmp("d_date_endID").getValue(), "Y-m-d"));
      Ext.getCmp("dis_sp_tor_status_idID").setValue(Ext.newStr);
      Ext.getCmp("dis_i_is_registerID").setValue(Ext.i_is_register) ; 
      // Ext.getCmp("dis_i_is_register2ID").setValue(Ext.i_is_register2) ; 
      // Ext.getCmp("dis_sp_tor_status_idID").setValue(getStoreItems(Ext.sp_tor_status,Ext.getCmp("sp_tor_status_id").getValue() , "id"));
    }
  function frmWithOutAjax(value) {
    if (Ext.newStr == null || Ext.newStr == ""  ) {
      Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกเมนู");
      return false ;
    } 
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
                title: "สถานะเมนู",
                RemoveCls: "x-box-item",
                defaults: { labelStyle: "width:200px;", allowBlank: true },
                items: [
                  { xtype: "hidden", id: "titleReportID", name: "titleReport", value: Ext.titleReport },
                  { xtype: "hidden", id: "getReportTypeID", name: "getReportType", value: "pdf" },
                  { xtype: "hidden", name: "jasperName", value: "repSp_Status" },
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                  // { xtype: "hidden", id: "dis_d_date_startID", name: "dis_d_date_start", value: "ทั้งหมด" },
                  { xtype: "hidden", id: "dis_i_is_registerID", name: "i_is_register", value: "ทั้งหมด" },
                  // { xtype: "hidden", id: "dis_i_is_register2ID", name: "i_is_register", value: "ทั้งหมด" },
                  { xtype: "hidden", id: "dis_sp_tor_status_idID", name: "dis_sp_tor_status_id", value: "ทั้งหมด" },
                  {
                    xtype: "radiogroup",
                    columns: [500,500,500,500],
                    fieldLabel: "ลักษณะจองเงิน",
                    id: "i_type_bgID",
                    hidden: true,
                    // hidden: Ext.isAudit ? true :  false,
                    name: "i_type_bg",
                    items: [
                        {
                          inputValue: 0,
                          name: "i_type_bg",
                          boxLabel: "<font style='padding-left:15px; font-weight:bold; color:#000000'>ทั้งหมด</font>",
                        },
                        {
                            checked: true,
                            inputValue: 1,
                            name: "i_type_bg",
                            boxLabel: "การจัดทำ PR ปกติ",
                            boxLabel: "<font style='padding-left:15px; font-weight:bold; color:#000000'>การจัดทำ PR ปกติ</font>",  
                        },
                        {
                            inputValue: 2,
                            name: "i_type_bg",
                            boxLabel: "<font style='padding-left:15px; font-weight:bold; color:#116CEF'>การจัดทำ PR หลักโครงการต่อเนื่อง</font>",
                            // boxLabel: "<font style='font-weight:bold; color:#116CEF'>การจัดทำ PR หลักโครงการต่อเนื่อง(ไม่จองเงิน)</font>",

                        },
                        {
                            inputValue: 4,
                            name: "i_type_bg",
                            boxLabel: "<font style='padding-left:15px; font-weight:bold; color:#CD8114'>การจัดทำ PR ไม่จองเงิน (ใช้เงินกันเหลื่อม)</font>",
                            // boxLabel: "<font style='font-weight:bold; color:#CD8114'>การจัดทำ PR ไม่จองเงิน (ใช้เงินกันเหลื่อม)</font>",
                        },
                        {
                            inputValue: 5,
                            name: "i_type_bg",
                            boxLabel: "<font style='padding-left:15px; font-weight:bold; color:#52CD14'>การจัดทำ PR จองเงินข้ามส่งเบิก</font>",
                        },
                        {
                            inputValue: 6,
                            name: "i_type_bg",
                            boxLabel: "<font style='padding-left:15px; font-weight:bold; color:#52CD14'>การจัดทำ PR จองเงินทำถึงสัญญา</font>",
                        },
                        {
                            inputValue: 7,
                            name: "i_type_bg",
                            boxLabel: "<font style='padding-left:15px; font-weight:bold; color:#52CD14'>การจัดทำ PR จองเงินทำถึงตรวจรับ</font>",

                        },
                        {
                            inputValue: 8,
                            name: "i_type_bg",
                            boxLabel: "<font style='padding-left:15px; font-weight:bold; color:#AE00FF'>การจัดทำ PR จองเงินตรวจรับ</font>",

                        },
                    ], //radiogroup
                },
                {
                  xtype: "radiogroup",
                  id: "i_is_registerID2",
                  fieldLabel: "สถานะ",
                  columns: [100, 200, 150, 50],
                  items: [
                    {
                      boxLabel: "สายงาน",
                      name: "i_is_register2",
                      inputValue: 0,
                      // hidden: true,
                      checked: true,
                    },
                    {
                      boxLabel: "รายการที่ยังไม่ถึงฝ่ายจัดสรร",
                      name: "i_is_register2",
                      inputValue: 2,
                      // hidden: true
                    },
                    {
                      boxLabel: "รายการที่อยู่ที่ฝ่ายจัดสรร",
                      name: "i_is_register2",
                      inputValue: 3,
                      // checked: true,

                    },
                  ],
                  listeners: {
                    change: function (obj, value) {
                      var  replace_id1 = "0,1,2";
                      if (value.inputValue == 0) {
                        Ext.getCmp("sp_tor_status_id").show();
                        Ext.newStr = null ;
                      } else if (value.inputValue == 2) {
                        Ext.getCmp("sp_tor_status_id").hide();
                        replace_id1 = "0";
                        Ext.newStr = "24,25,26,13" ; 
                      } else if (value.inputValue == 3) {
                        Ext.getCmp("sp_tor_status_id").hide();
                        replace_id1 = "1,2";
                        Ext.newStr = 13 ; 
                      }
                      Ext.i_is_register =  replace_id1  ;
                    },
                  },
                },
                new Ext.ux.form.LovCombo({
                  id: "sp_tor_status_id",
                  fieldLabel: "เมนู",
                  width: 600,
                  mode: "local",
                  // hidden: true ,
                  store: Ext.sp_tor_status,
                  valueField: "id",
                  displayField: "c_name",
                  triggerAction: "all",
                  forceSelection: true,
                  selectOnFocus: true,
                  typeAhead: false,
                  emptyText: "กรุณาเลือก...",
                  // value: "0",
                  listeners :{  
                    Change: function (){
                        var myStr = this.value;
                        Ext.replace_id = myStr.replaceAll(";", ",");
                        Ext.newStr =  Ext.replace_id  ;
                        // console.log(Ext.newStr)
                    // }
                  }
                  }
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
                  new Ext.Viewport({
                    layout: "border",
                    items: panelForm,
                  });
});



