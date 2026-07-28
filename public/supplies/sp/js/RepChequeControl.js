Ext.onReady(function () {
  Ext.QuickTips.init();

  /* =============================================== */
  title_panel = "รายงานทะเบียนคุมเช็ค";
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
      load: function (t, records, options) {
        Ext.getCmp("dc_expense_budget_type_id").setValue("0");
      },
    },
  });

  LookReport = function (type) {
    var msg = "";

    //   let s_dc_acc_id_parent = "";
    //   let s_dc_acc_id_parent_lv5 = "";
    //   let s_dc_acc_id = "";
    //   let s_dc_user_id = "";

    //   if (Ext.getCmp("d_date_start").getValue() == "" || Ext.getCmp("d_date_end").getValue() == "") {
    //     msg += "- กรุณาเลือก ช่วงวันที่<br>";
    //   }
    // if (Ext.getCmp("dc_expense_budget_type_id").getValue() == "") {
    //   msg += "- กรุณาเลือก แหล่งเงิน<br>";
    // }

    //   if (Ext.getCmp("i_show_acc").getValue().inputValue == 1) {
    //     if (Ext.getCmp("s_dc_acc_id_parent").getValue() == "") {
    //       msg += "- กรุณาเลือก บัญชีคุม Lv4 อย่างน้อย 1 รายการ<br>";
    //     } else {
    //       s_dc_acc_id_parent = Ext.getCmp("s_dc_acc_id_parent").getValue();
    //     }
    //   } else if (Ext.getCmp("i_show_acc").getValue().inputValue == 3) {
    //     if (Ext.getCmp("s_dc_acc_id_parent_lv5").getValue() == "") {
    //       msg += "- กรุณาเลือก บัญชีคุม Lv5 อย่างน้อย 1 รายการ<br>";
    //     } else {
    //       s_dc_acc_id_parent_lv5 = Ext.getCmp("s_dc_acc_id_parent_lv5").getValue();
    //     }
    //   } else {
    //     if (Ext.getCmp("s_dc_acc_id").getValue() == "") {
    //       msg += "- กรุณาเลือก บัญชีย่อยอย่างน้อย 1 รายการ<br>";
    //     } else {
    //       s_dc_acc_id = Ext.getCmp("s_dc_acc_id").getValue();
    //     }
    //   }
    //   if (Ext.getCmp("s_dc_user_id").getValue() == "") {
    //     msg += "- กรุณาเลือก ผู้สร้างรายการ 1 รายการ<br>";
    //   } else {
    //     s_dc_user_id = Ext.getCmp("s_dc_user_id").getValue();
    //   }

    if (msg == "") {
      href = "report/Rep_RepChequeControl.php";

      var resultUrl = "";

      resultUrl += "&type=" + type;
      resultUrl += "&i_status=" + Ext.getCmp("i_status").getValue().inputValue;
      resultUrl += "&dc_expense_budget_type_id=" + Ext.getCmp("dc_expense_budget_type_id").getValue();
      resultUrl += "&d_date_start=" + Ext.util.Format.date(Ext.getCmp("d_date_start").getValue(), "Y-m-d");
      resultUrl += "&d_date_end=" + Ext.util.Format.date(Ext.getCmp("d_date_end").getValue(), "Y-m-d");
      resultUrl += "&i_success=" + (Ext.getCmp("i_success").getValue() ? 1 : 0);
      resultUrl += "&i_cheque=" + Ext.getCmp("i_cheque").getValue().inputValue;
      resultUrl += "&i_report=" + Ext.getCmp("i_report").getValue().inputValue;

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
                title: "เมนู " + title_panel,
                RemoveCls: "x-box-item",
                defaults: {
                  labelStyle: "width:200px;",
                  allowBlank: true,
                },
                items: [
                  {
                    xtype: "radiogroup",
                    id: "i_status",
                    fieldLabel: "สถานะ",
                    columns: [75, 100],
                    items: [
                      {
                        boxLabel: "จัดทำเช็ค",
                        name: "i_status",
                        inputValue: 8,
                        checked: true,
                      },
                      {
                        boxLabel: "ทำทะเบียนจ่าย",
                        name: "i_status",
                        inputValue: 11,
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
                    xtype: "checkbox",
                    fieldLabel: "สถานะ",
                    id: "i_success",
                    boxLabel: "ทำทะเบียนจ่ายแล้ว",
                    inputValue: 1,
                  },
                  {
                    xtype: "radiogroup",
                    id: "i_cheque",
                    fieldLabel: "สถานะรายการ",
                    columns: [65, 45, 75, 100],
                    items: [
                      {
                        boxLabel: "ทั้งหมด",
                        name: "i_cheque",
                        inputValue: 0,
                        checked: true,
                      },
                      {
                        boxLabel: "เช็ค",
                        name: "i_cheque",
                        inputValue: 1,
                      },
                      {
                        boxLabel: "ภาษีบริษัท",
                        name: "i_cheque",
                        inputValue: 2,
                      },
                      {
                        boxLabel: "ประกันสังคม",
                        name: "i_cheque",
                        inputValue: 3,
                      },
                    ],
                  },
                  {
                    xtype: "radiogroup",
                    id: "i_report",
                    fieldLabel: "รายงาน",
                    columns: [100, 120],
                    items: [
                      {
                        boxLabel: "ทะเบียนคุมเช็ค",
                        name: "i_report",
                        inputValue: 0,
                        checked: true,
                      },
                      {
                        boxLabel: "สำหรับลงนามเช็ค",
                        name: "i_report",
                        inputValue: 1,
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
