Ext.onReady(function () {
  Ext.QuickTips.init();

  /* =============================================== */
  Ext.title_panel = "รายงานสถิติการเบิกจ่ายฏีกาจัดซื้อจัดจ้าง";
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
    url: "api/All_StatisticPurchase.php",
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

    href = type == "chart" ? "report-chart/Rep_StatisticPurchase_Chart.php" : "report/Rep_StatisticPurchase.php";

    var resultUrl = "";

    resultUrl += "&type=" + type;
    resultUrl += "&dc_cost_id=" + Ext.getCmp("dc_cost_id").getValue();
    resultUrl += "&dc_expense_budget_type_id=" + Ext.getCmp("dc_expense_budget_type_id").getValue();
    resultUrl += "&po_creditor_id=" + Ext.getCmp("po_creditor_id").getValue();
    resultUrl += "&d_date_start=" + Ext.util.Format.date(Ext.getCmp("d_date_start").getValue(), "Y-m-d");
    resultUrl += "&d_date_end=" + Ext.util.Format.date(Ext.getCmp("d_date_end").getValue(), "Y-m-d");
    resultUrl += "&i_than15=" + (Ext.getCmp("i_than15").checked ? 1 : 0);
    resultUrl += "&i_than30=" + (Ext.getCmp("i_than30").checked ? 1 : 0);
    resultUrl += "&i_than60=" + (Ext.getCmp("i_than60").checked ? 1 : 0);
    resultUrl += "&i_than90=" + (Ext.getCmp("i_than90").checked ? 1 : 0);
    resultUrl += "&i_over90=" + (Ext.getCmp("i_over90").checked ? 1 : 0);

    resultUrl = resultUrl != "" ? "?" + resultUrl.substring(1) : "";

    window.open(href + resultUrl, href);
    window.focus();
  };

  const panelForm = new Ext.Panel({
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
                    xtype: "compositefield",
                    fieldLabel: "ทำทะเบียนจ่ายระหว่างวันที่",
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
                    xtype: "compositefield",
                    fieldLabel: "แสดงรายการ",
                    anchor: "100%",
                    msgTarget: "under",
                    items: [
                      {
                        xtype: "checkbox",
                        id: "i_than15",
                        boxLabel: "ไม่เกิน 15 วัน",
                        inputValue: 1,
                        checked: true,
                      },
                      {
                        xtype: "checkbox",
                        id: "i_than30",
                        boxLabel: "ไม่เกิน 30 วัน",
                        inputValue: 1,
                        checked: true,
                      },
                      { xtype: "displayfield", value: "|" },
                      {
                        xtype: "checkbox",
                        id: "i_than60",
                        boxLabel: "ไม่เกิน 60 วัน",
                        inputValue: 1,
                        checked: true,
                      },
                      { xtype: "displayfield", value: "|" },
                      {
                        xtype: "checkbox",
                        id: "i_than90",
                        boxLabel: "ไม่เกิน 90 วัน",
                        inputValue: 1,
                        checked: true,
                      },
                      { xtype: "displayfield", value: "|" },
                      {
                        xtype: "checkbox",
                        id: "i_over90",
                        boxLabel: "มากกว่า 90 วัน",
                        inputValue: 1,
                        checked: true,
                      },
                    ],
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
