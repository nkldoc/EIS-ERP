Ext.onReady(function() {
  Ext.QuickTips.init();

  /* =============================================== */
  title_panel = "รายงานสรุปเงินกันเหลื่อมปี";
  /* =============================================== */

  Ext.dc_expense_budget_type = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_RepPoBudgetHdrOverlap.php",
    baseParams: { type: "dc_expense_budget_type", all: "all" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
    listeners: {
      load: function(t, records, options) {
        Ext.getCmp("dc_expense_budget_type_id").setValue("0");
      }
    }
  });

  // storeYear
  var years = [];
  var currentTime = new Date();
  var now = currentTime.getFullYear();
  var yy_en = Ext.START_YEAR_ACC;
  while (yy_en <= now) {
    years.push({ id: yy_en, c_name: yy_en + 543 });
    yy_en++;
  }

  store_year = new Ext.data.JsonStore({
    fields: ["id", "c_name"],
    data: years
  });

  LookReport = function(type) {
    var msg = "";

    if (Ext.getCmp("dc_expense_budget_type_id").getValue() == "") {
      msg += "- กรุณาเลือก แหล่งเงิน<br>";
    }

    if (msg == "") {
      href = "report/Rep_RepBudgetOverlap.php";

      var resultUrl = "";

      resultUrl += "&type=" + type;
      resultUrl += "&i_year=" + Ext.getCmp("i_year").getValue();
      resultUrl += "&dc_expense_budget_type_id=" + Ext.getCmp("dc_expense_budget_type_id").getValue();
      resultUrl += "&d_date_start=" + Ext.util.Format.date(Ext.getCmp("d_date_start").getValue(), "Y-m-d");
      resultUrl += "&d_date_end=" + Ext.util.Format.date(Ext.getCmp("d_date_end").getValue(), "Y-m-d");
      resultUrl += "&i_status=" + Ext.getCmp("i_status").getValue().inputValue;
      resultUrl += "&i_level1=" + (Ext.getCmp("i_level[1]").checked ? 1 : 0);
      resultUrl += "&i_level2=" + (Ext.getCmp("i_level[2]").checked ? 1 : 0);
      resultUrl += "&i_level3=" + (Ext.getCmp("i_level[3]").checked ? 1 : 0);
      resultUrl += "&i_level4=" + (Ext.getCmp("i_level[4]").checked ? 1 : 0);

      resultUrl = resultUrl != "" ? "?" + resultUrl.substring(1) : "";

      window.open(href + resultUrl, href);
      window.focus();
    } else {
      Ext.MessageBox.alert("แจ้งเตือน", msg);
    }
  };

  var panelForm = new Ext.Panel({
    region: "center",
    title: title_panel,
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
          allowBlank: false
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
              autoHeight: true
            },
            items: [
              {
                title: "เมนู " + title_panel,
                RemoveCls: "x-box-item",
                defaults: {
                  labelStyle: "width:200px;",
                  allowBlank: true
                },
                items: [
                  new Ext.form.ComboBox({
                    id: "i_year",
                    fieldLabel: "เงินกันปี",
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
                    value: new Date().getFullYear(),
                    listeners: {
                      change: function(combo, newValue) {
                        if (newValue == "") {
                          combo.reset();
                        }
                      },
                      beforequery: function(q) {
                        if (q.query) {
                          var length = q.query.length;
                          q.query = new RegExp(Ext.escapeRe(q.query));
                          q.query.length = length;
                        }
                      },
                      blur: function() {
                        this.getStore().clearFilter();
                      }
                    }
                  }),
                  {
                    xtype: "compositefield",
                    fieldLabel: "จ่ายเงินระหว่างวันที่",
                    msgTarget: "under",
                    items: [
                      {
                        xtype: "datefield",
                        id: "d_date_start",
                        width: 127,
                        value: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                      },
                      {
                        xtype: "displayfield",
                        value: "ถึงวันที่",
                        width: 36,
                        align: "center"
                      },
                      {
                        xtype: "datefield",
                        id: "d_date_end",
                        width: 127,
                        value: addY(543)
                      }
                    ]
                  },
                  new Ext.form.ComboBox({
                    id: "dc_expense_budget_type_id",
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
                      change: function(combo, newValue) {
                        if (newValue == "") {
                          combo.reset();
                        }
                      },
                      beforequery: function(q) {
                        if (q.query) {
                          var length = q.query.length;
                          q.query = new RegExp(Ext.escapeRe(q.query));
                          q.query.length = length;
                        }
                      },
                      blur: function() {
                        this.getStore().clearFilter();
                      }
                    }
                  }),
                  {
                    xtype: "compositefield",
                    fieldLabel: "แสดงรายการ",
                    anchor: "100%",
                    msgTarget: "under",
                    items: [
                      {
                        xtype: "checkbox",
                        id: "i_level[1]",
                        boxLabel: "LV1",
                        inputValue: 1,
                        checked: true
                      },
                      { xtype: "displayfield", value: "|" },
                      {
                        xtype: "checkbox",
                        id: "i_level[2]",
                        boxLabel: "LV2",
                        inputValue: 1,
                        checked: true
                      },
                      { xtype: "displayfield", value: "|" },
                      {
                        xtype: "checkbox",
                        id: "i_level[3]",
                        boxLabel: "LV3",
                        inputValue: 1,
                        checked: true
                      },
                      { xtype: "displayfield", value: "|" },
                      {
                        xtype: "checkbox",
                        id: "i_level[4]",
                        boxLabel: "LV4",
                        inputValue: 1,
                        checked: true
                      }
                    ]
                  },
                  {
                    xtype: "radiogroup",
                    id: "i_status",
                    fieldLabel: "สถานะ",
                    columns: [100, 100],
                    items: [
                      {
                        boxLabel: "หักงบประมาณ",
                        name: "i_status",
                        inputValue: 5,
                        checked: true
                      },
                      {
                        boxLabel: "เบิกจ่ายแล้ว",
                        name: "i_status",
                        inputValue: 11
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ],
        buttonAlign: "left",
        buttons: [
          {
            text: Ext.GLOBAL_BU_SHOW_TH + "สำหรับ HTML",
            iconCls: "page_magnify",
            handler: function() {
              LookReport("html");
            } // End Handle
          },
          {
            text: Ext.GLOBAL_BU_SHOW_TH + "สำหรับ Excel",
            iconCls: "icon-excel",
            handler: function() {
              LookReport("excel");
            } // End Handle
          }
        ]
      }
    ]
  }); // panelForm

  /* ====================== CENTER ====================== */
  var center = new Ext.TabPanel({
    region: "center",
    border: false,
    activeTab: 0, // default Tab
    id: "contenterCenter",
    defaults: { autoScroll: true },
    items: [panelForm]
  });

  /* ====================== RENDER ====================== */
  new Ext.Viewport({
    layout: "border",
    items: [center]
  });
});
