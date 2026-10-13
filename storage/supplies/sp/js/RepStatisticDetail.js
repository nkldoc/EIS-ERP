Ext.onReady(function () {
  Ext.QuickTips.init();

  /* =============================================== */
  if (Ext.TYPE_PAGE == "RepStatisticDetail") {
    Ext.title_panel = "รายงานทะเบียนคุมสถิติการเบิกจ่าย";
  } else {
    Ext.title_panel = "รายงานทะเบียนคุมสรุปสถิติการเบิกจ่าย";
  }
  /* =============================================== */

  Ext.po_creditor = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_RepStatisticDetail.php",
    baseParams: { type: "po_creditor", all: "all" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
    listeners: {
      load: function (t, records, options) {
        Ext.getCmp("po_creditor_id").setValue("0");
      },
    },
  });

  Ext.dc_cost = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: { type: "dc_cost", all: "all" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
    listeners: {
      load: function (t, records, options) {
        Ext.getCmp("dc_cost_id").setValue("0");
      },
    },
  });

  Ext.dc_expense_budget_type = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_RepStatisticDetail.php",
    baseParams: { type: "dc_expense_budget_type", all: "all" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
    listeners: {
      load: function (t, records, options) {
        Ext.getCmp("dc_expense_budget_type_id").setValue("0");
      },
    },
  });

  LookReport = function (type) {
    var msg = "";

    if (msg == "") {
      if (Ext.TYPE_PAGE == "RepStatisticDetail") {
        href = "report/Rep_StatisticDetail.php";
      } else if (Ext.TYPE_PAGE == "Rep0001") {
        href = type == "chart" ? "report-chart/Rep_rep0001_Chart.php" : "report/Rep_rep0001.php";
      }

      var resultUrl = "";

      resultUrl += "&type=" + type;
      resultUrl += "&dc_cost_id=" + Ext.getCmp("dc_cost_id").getValue();
      resultUrl += "&dc_expense_budget_type_id=" + Ext.getCmp("dc_expense_budget_type_id").getValue();
      resultUrl += "&po_creditor_id=" + Ext.getCmp("po_creditor_id").getValue();
      resultUrl += "&i_date=" + Ext.getCmp("i_date").getValue().inputValue;
      resultUrl += "&d_date_start=" + Ext.util.Format.date(Ext.getCmp("d_date_start").getValue(), "Y-m-d");
      resultUrl += "&d_date_end=" + Ext.util.Format.date(Ext.getCmp("d_date_end").getValue(), "Y-m-d");
      resultUrl += "&i_success=" + Ext.getCmp("i_success").getValue().inputValue;
      resultUrl += "&i_parent=" + (Ext.getCmp("i_parent").checked ? 1 : 0);

      resultUrl = resultUrl != "" ? "?" + resultUrl.substring(1) : "";

      window.open(href + resultUrl, href);
      window.focus();
    } else {
      Ext.MessageBox.alert("แจ้งเตือน", msg);
    }
  };

  var panelForm = new Ext.Panel({
    region: "center",
    title: Ext.title_panel,
    border: false,
    stripeRows: true,
    loadMask: true,
    items: [
      {
        xtype: "form",
        frame: true,
        labelAlign: "right",
        labelWidth: 200,
        bodyStyle: { padding: "10px 20px" },
        defaults: {
          anchor: "100%",
          msgTarget: "side",
          allowBlank: false,
        },
        items: [
          {
            xtype: "container",
            layout: "hbox",
            align: "stretch",
            RemoveHeight: true,
            defaults: {
              xtype: "fieldset",
              flex: 1,
              margins: "0px 3px",
              autoHeight: true,
            },
            items: [
              {
                title: "เมนู " + Ext.title_panel,
                RemoveCls: "x-box-item",
                defaults: {
                  labelStyle: "width:200px;",
                  allowBlank: true,
                },
                items: [
                  new Ext.form.ComboBox({
                    id: "dc_cost_id",
                    fieldLabel: "หน่วยงาน",
                    store: Ext.dc_cost,
                    valueField: "id",
                    displayField: "c_name",
                    mode: "local",
                    triggerAction: "all",
                    emptyText: "กรุณาเลือก...",
                    width: 300,
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
                    id: "dc_expense_budget_type_id",
                    fieldLabel: "แหล่งเงิน",
                    store: Ext.dc_expense_budget_type,
                    valueField: "id",
                    displayField: "c_name",
                    mode: "local",
                    triggerAction: "all",
                    emptyText: "กรุณาเลือก...",
                    width: 300,
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
                    id: "po_creditor_id",
                    fieldLabel: "จ่ายให้",
                    store: Ext.po_creditor,
                    valueField: "id",
                    displayField: "c_name",
                    mode: "local",
                    triggerAction: "all",
                    emptyText: "กรุณาเลือก...",
                    width: 300,
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
                    id: "i_date",
                    fieldLabel: "&nbsp;",
                    columns: [80, 100],
                    items: [
                      {
                        boxLabel: "ฝ่ายคลังรับ",
                        name: "i_date",
                        inputValue: 0,
                        checked: true,
                      },
                      {
                        boxLabel: "ตรวจรับ",
                        name: "i_date",
                        inputValue: 1,
                      },
                    ],
                  },
                  {
                    xtype: "compositefield",
                    fieldLabel: "ระหว่างวันที่",
                    msgTarget: "under",
                    items: [
                      {
                        xtype: "datefield",
                        id: "d_date_start",
                        width: 127,
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
                        id: "d_date_end",
                        width: 127,
                        value: addY(543),
                      },
                    ],
                  },
                  {
                    xtype: "radiogroup",
                    id: "i_success",
                    fieldLabel: "สถานะ",
                    columns: [65, 100, 100],
                    items: [
                      {
                        boxLabel: "ทั้งหมด",
                        name: "i_success",
                        inputValue: 0,
                        checked: true,
                      },
                      {
                        boxLabel: "ทำทะเบียนจ่าย",
                        name: "i_success",
                        inputValue: 1,
                      },
                      {
                        boxLabel: "รอดำเนินการ",
                        name: "i_success",
                        inputValue: 2,
                      },
                    ],
                  },
                  {
                    fieldLabel: "&nbsp;",
                    xtype: "checkbox",
                    id: "i_parent",
                    boxLabel: "รายการที่มียกเลิกใบเบิก",
                    inputValue: 1,
                  },
                ],
              },
            ],
          },
        ],
        buttonAlign: "left",
        buttons: [
          {
            text: Ext.GLOBAL_BU_SHOW_TH + "สำหรับ HTML",
            iconCls: "page_magnify",
            handler: function () {
              LookReport("html");
            }, // End Handle
          },
          {
            text: Ext.GLOBAL_BU_SHOW_TH + "สำหรับ Excel",
            iconCls: "icon-excel",
            handler: function () {
              LookReport("excel");
            }, // End Handle
          },
          {
            text: Ext.GLOBAL_BU_SHOW_TH + " Chart",
            hidden: Ext.TYPE_PAGE == "Rep0001" ? false : true,
            iconCls: "icon-chart-pie",
            handler: function () {
              LookReport("chart");
            }, // End Handle
          },
        ],
      },
    ],
  }); // panelForm

  /* ====================== CENTER ====================== */
  var center = new Ext.TabPanel({
    region: "center",
    border: false,
    activeTab: 0, // default Tab
    id: "contenterCenter",
    defaults: { autoScroll: true },
    items: [panelForm],
  });

  /* ====================== RENDER ====================== */
  new Ext.Viewport({
    layout: "border",
    items: [center],
  });
});
