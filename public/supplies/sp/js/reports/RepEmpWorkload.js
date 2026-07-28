/* global Ext */
Ext.onReady(function () {
  Ext.QuickTips.init();
  Ext.idRep = "frm-repTor";
  //Spring Boot cross context
  Ext.urlReport = true ? "../../reports/repSpTorPAuser" : "../../reports/printr.php?get=true"; //DEBUG
  // Ext.urlReport = false ? "../../reports/repSpTorPAuser" : "../../reports/printr.php?get=true"; //DEBUG
  // Spring Boot
  Ext.titleReport = "รายงานสถิตการทำงานบุคลากร (PA)";

  var years = [];
  var currentTime = new Date();
  var now = currentTime.getFullYear() + 1;
  var yy_en = Ext.START_YEAR_ACC;
  years.push({ id: "0", c_name: "- เลือกทั้งหมด -" });
  while (yy_en <= now) {
    years.push({ id: yy_en, c_name: yy_en + 543 });
    yy_en++;
  }

  store_year = new Ext.data.JsonStore({
    fields: ["id", "c_name"],
    data: years,
  });
  let Date_now = new Date();
  Date_now = [Date_now.getFullYear().toString(), (Date_now.getMonth() + 1).toString().padStart(2, "0"), Date_now.getDate().toString().padStart(2, "0")];
  Ext.bgYear = Date_now[0] - 0 + ((Date_now[1] < 10 ? 0 : 1) - 0);
  Ext.sp_user = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_RepSpTorPAuser.php",
    baseParams: { type: "sp_emp", all: "all" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
    listeners: {
      load: function (t, records, options) {
        if (Ext.session.i_level == 1 || Ext.session.sp_emp_id == 32) {
          Ext.getCmp("sp_emp_idID").setValue("0");
        } else if (Ext.session.i_level == 3) {
          Ext.getCmp("sp_emp_idID").setValue(Ext.session.sp_emp_id);
        } else if (Ext.session.i_level == 2) {
          Ext.getCmp("sp_emp_idID").setValue("0");
        }
      },
    },
  });
  LookReport = function (type) {
    var msg = "";
    // console.log(Ext.getCmp("sp_emp_idID").getValue())
    let i_working_type = "";
    if (Ext.getCmp("sp_emp_idID").getValue() == "") {
      msg += "- กรุณาเลือกพนักงาน<br>";
    }

    if (msg == "") {
      if (type == "pdf") {
        href = "pdf/PDF_RepPoWorkingPay.php" + "/รายงานทะเบียนจ่าย.pdf";
      } else {
        href = "../bi/reports/Rep_DetailByTypeV4.php";
      }

      const combo = Ext.getCmp("sp_emp_idID");
      console.log(combo);
      console.log("getCheckedDisplay =", combo.getCheckedDisplay());

      const ids = combo.getValue(); // id ที่เลือก เช่น "1,2,3"
      let names = combo.getCheckedDisplay(); // เป็น string
      names = names.replace(/^– เลือกทั้งหมด –\s*;\s*/, "").trim();
      console.log(names);
      var resultUrl = "";

      resultUrl += "&type=" + type;
      resultUrl += "&year_en=" + Ext.getCmp("i_budget_year").getValue();
      resultUrl += "&i_enabled=1";
      resultUrl += "&type_report_row=reportsemp";
      //   resultUrl += "&sp_emp_id=" + Ext.getCmp("sp_emp_idID").getValue();
        resultUrl += "&d_date_start=" + Ext.util.Format.date(Ext.getCmp("d_date_start").getValue(), "Y-m-d");
        resultUrl += "&d_date_end=" + Ext.util.Format.date(Ext.getCmp("d_date_end").getValue(), "Y-m-d");
      
      //   resultUrl += "&dc_expense_budget_type_id=" + Ext.getCmp("dc_expense_budget_type_id").getValue();
      //   resultUrl += "&dc_cost_acc_id=" + Ext.getCmp("dc_cost_acc_id").getValue();
      //   resultUrl += "&dc_cost_id=" + Ext.getCmp("dc_cost_id").getValue();
      //   resultUrl += "&i_working_type=" + (i_working_type[0] == "0" ? "0" : i_working_type);
      //   resultUrl += "&i_overlab=" + Ext.getCmp("i_overlab").getValue().inputValue;
      //   resultUrl += "&i_see_money=" + Ext.getCmp("i_see_money").getValue().inputValue;
      resultUrl += "&sp_emp_id=" + ids;
      resultUrl += "&emp_names=" + encodeURIComponent(names); // ✅ ส่งชื่อไปด้วย
      resultUrl = resultUrl != "" ? "?" + resultUrl.substring(1) : "";
      window.open(href + resultUrl, href);
      window.focus();
    } else {
      Ext.MessageBox.alert("แจ้งเตือน", msg);
    }
  };
  function getTitleReport(v) {
    Ext.getCmp("getReportTypeID").setValue(v);
    Ext.getCmp("d_contract_sID").setValue(Ext.getCmp("s_contract_dateID").getValue().format("Y-m-d"));
    Ext.getCmp("d_contract_eID").setValue(Ext.getCmp("e_contract_dateID").getValue().format("Y-m-d"));
    Ext.getCmp("dis_sp_emp_idID").setValue(getStoreItems(Ext.sp_user, Ext.getCmp("sp_emp_idID").getValue(), "c_name"));
  }

  //   function frmWithOutAjax(value) {
  //     //set display title report
  //     getTitleReport(value);
  //     //set submit post report with ajax
  //     var frm = Ext.getCmp(Ext.idRep).getForm().el.dom;
  //     frm.setAttribute("target", "_blank");
  //     frm.setAttribute("action", Ext.urlReport);
  //     frm.submit();
  //     frm.focus();
  //   }

  function setButtonReport() {
    var HtmlReport = {
      text: Ext.GLOBAL_BU_SHOW_TH + "สำหรับ HTML",
      scale: "small",
      iconCls: "page_magnify",
      handler: function () {
        LookReport("html");
      }, // End Handle
    };
    // var pdfReport = {
    //   text: Ext.GLOBAL_BU_REPORT_TH,
    //   scale: "small",
    //   iconCls: "icon-pdf",
    //   handler: function () {
    //     frmWithOutAjax("pdf");
    //   },
    // };
    // var excelReport = {
    //   text: Ext.GLOBAL_BU_EXCEL_TH,
    //   scale: "small",
    //   id: "rep-excel",
    //   iconCls: "icon-excel",
    //   handler: function () {
    //     frmWithOutAjax("excel");
    //   },
    // };
    // var exp2pdf = {
    //   text: "Export Pdf",
    //   scale: "small",
    //   id: "rep-exp2pdf",
    //   iconCls: "icon-export",
    //   handler: function () {
    //     frmWithOutAjax("exp2pdf");
    //   },
    // };
    // var exp2xlsx = {
    //   text: "Export Xlsx",
    //   scale: "small",
    //   id: "rep-exp2xlsx",
    //   iconCls: "icon-export",
    //   handler: function () {
    //     frmWithOutAjax("exp2xlsx");
    //   },
    // };
    return [HtmlReport];
  }

  var panelForm = new Ext.Panel({
    region: "center",
    id: "pFrmID",
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
                title: "รายงานสถิตการทำงานบุคลากร (PA)",
                RemoveCls: "x-box-item",
                defaults: { labelStyle: "width:200px;", allowBlank: true },
                id: "panelIDx",
                items: [
                  { xtype: "hidden", id: "titleReportID", name: "titleReport", value: Ext.titleReport },
                  { xtype: "hidden", id: "rptID", name: "rpt", value: 5 },
                  { xtype: "hidden", id: "getReportTypeID", name: "getReportType", value: "pdf" },
                  { xtype: "hidden", name: "jasperName", value: "RepSpTorPAuser" },

                  // { xtype: "hidden", id: "dis_i_yyyyID", name: "dis_i_yyyy", value: "ทั้งหมด" },
                  { xtype: "hidden", id: "dis_sp_emp_idID", name: "dis_sp_emp_id", value: "ทั้งหมด" },
                  { xtype: "hidden", id: "dc_department_idID", name: "dc_department_id", value: Ext.session.dc_department_id },
                  { xtype: "hidden", id: "i_level_idID", name: "i_level", value: Ext.session.i_level },
                  { xtype: "hidden", id: "d_contract_sID", name: "d_contract_s" },
                  { xtype: "hidden", id: "d_contract_eID", name: "d_contract_e" },
                  new Ext.form.ComboBox({
                    id: "i_budget_year",
                    fieldLabel: "ปีงบประมาณ",
                    width: 163,
                    mode: "local",
                    store: store_year,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    value: Ext.bgYear,
                    listeners: {
                      change: function (combo, newValue) {
                        if (newValue == "") {
                          combo.reset();
                        }
                      },
                      select: function (combo, newValue) {
                        Ext.getCmp("d_date_start").setValue("01-10" + (newValue.id - 1));
                        if (newValue.id == Ext.bgYear) {
                          Ext.getCmp("d_date_end").setValue(addY(543));
                        } else {
                          Ext.getCmp("d_date_end").setValue("30-09" + newValue.id);
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
                    fieldLabel: "วันที่ได้รับมอบหมาย",
                    msgTarget: "under",
                    items: [
                      {
                        xtype: "datefield",
                        id: "d_date_start",
                        width: 177,
                        value: "01-10" + (Ext.bgYear - 1),
                        // value: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                      },
                      {
                        xtype: "displayfield",
                        value: "ถึงวันที่",
                        width: 36,
                        align: "center",
                      },
                      {
                        xtype: "datefield",
                        id: "d_date_end",
                        width: 177,
                        value: addY(543),
                      },
                    ],
                  },
                  new Ext.ux.form.LovCombo({
                    id: "sp_emp_idID",
                    fieldLabel: "ชื่อพนักงาน",
                    width: 300,
                    mode: "local",
                    store: new Ext.data.JsonStore({
                      autoDestroy: false,
                      autoLoad: true,
                      url: "api/All_RepSpTorPAuser.php",
                      baseParams: { type: "sp_emp", all: "all" },
                      root: "data",
                      idProperty: "id",
                      fields: ["id", "c_name"],
                      listeners: {
                        load: function (t, records, options) {
                          //  Ext.getCmp("sp_emp_idID").setValue("0");
                        },
                      },
                    }),
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก..",
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
