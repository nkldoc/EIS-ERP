Ext.onReady(function() {
  Ext.QuickTips.init();

  /* =============================================== */
  Ext.title_panel = "รายงานข้อมูลตัดชำระ";
  /* =============================================== */
  // dc_expense_budget_type = new Ext.data.JsonStore({
  //   autoDestroy: false,
  //   autoLoad: true,
  //   url: Ext.TYPE_PAGE == "all" ? "api/All_RepImpExpenseAll.php" : "api/All_ImportExpenseVSN.php",
  //   baseParams: { type: "dc_expense_budget_type", itype: itype, all: "all" },
  //   root: "data",
  //   idProperty: "id",
  //   fields: ["id", "c_name"]
  //   //		listeners : {
  //   //			load : function(t, records, options) {
  //   //				Ext.getCmp("s_dc_expense_budget_type_id").setValue("0");
  //   //			}
  //   //		}
  // });

  // Ext.dc_expense_budget_type = new Ext.data.JsonStore({
  //   autoDestroy: false,
  //   autoLoad: true,
  //   url: "api/All_RepPoBudgetHdrOverlap.php",
  //   baseParams: { type: "dc_expense_budget_type", all: "all" },
  //   root: "data",
  //   idProperty: "id",
  //   fields: ["id", "c_name"],
  //   listeners: {
  //     load: function(t, records, options) {
  //       Ext.getCmp("dc_expense_budget_type_id").setValue("0");
  //     }
  //   }
  // });

  // dc_expense_acc_vsn = new Ext.data.JsonStore({
  //   autoDestroy: false,
  //   autoLoad: true,
  //   url: "api/All_RepImportExpense.php",
  //   baseParams: { type: "dc_expense_acc_vsn", all: "all" },
  //   root: "data",
  //   idProperty: "id",
  //   fields: ["id", "c_name"],
  //   listeners: {
  //     load: function(t, records, options) {
  //       Ext.getCmp("s_dc_expense_acc_vsn_id").setValue("0");
  //     }
  //   }
  // });

  // store_acc_s_parent = new Ext.data.JsonStore({
  //   autoLoad: true,
  //   url: "api/All_RepImportExpense.php",
  //   baseParams: { type: "dc_acc_main", show: "all" },
  //   root: "data",
  //   idProperty: "id",
  //   fields: ["id", "c_name", "cut_name"]
  // });

  // store_acc_s_parent_lv5 = new Ext.data.JsonStore({
  //   autoLoad: true,
  //   url: "api/All_RepImportExpense.php",
  //   baseParams: { type: "dc_acc_main_lv5", show: "all" },
  //   root: "data",
  //   idProperty: "id",
  //   fields: ["id", "c_name", "cut_name"]
  // });

  // store_acc_s = new Ext.data.JsonStore({
  //   autoLoad: true,
  //   url: "api/All_RepImportExpense.php",
  //   baseParams: { type: "dc_acc", show: "all" },
  //   root: "data",
  //   idProperty: "id",
  //   fields: ["id", "c_name", "cut_name"]
  // });

  // Ext.store_dc_user = new Ext.data.JsonStore({
  //   autoLoad: true,
  //   url: "api/All_RepImportExpense.php",
  //   baseParams: { type: "dc_user", show: "all" },
  //   root: "data",
  //   idProperty: "id",
  //   fields: ["id", "c_name"]
  // });

  // // storeYear
  // var years = [];
  // var currentTime = new Date();
  // var now = currentTime.getFullYear() + 1;
  // var yy_en = Ext.START_YEAR_ACC;
  // while (yy_en <= now) {
  //   years.push({ id: yy_en, c_name: yy_en + 543 });
  //   yy_en++;
  // }

  // Ext.store_year = new Ext.data.JsonStore({
  //   fields: ["id", "c_name"],
  //   data: years
  // });

  LookReport = function(type) {
    var msg = "";

    //   let s_dc_acc_id_parent = "";
    //   let s_dc_acc_id_parent_lv5 = "";
    //   let s_dc_acc_id = "";
    //   let s_dc_user_id = "";

    // if (Ext.getCmp("dc_expense_budget_type_id").getValue() == "") {
    //   msg += "- กรุณาเลือก แหล่งเงิน<br>";
    // }
    //   if (Ext.getCmp("s_dc_expense_budget_type_id").getValue() == "") {
    //     msg += "- กรุณาเลือก แหล่งเงิน<br>";
    //   }

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
      //     if (Ext.TYPE_PAGE == "ephys") {
      href = "report/Rep_ArCut.php";
      //     } else if (Ext.TYPE_PAGE == "vsn") {
      //       href = "report/Rep_RepImpExpenseVSN.php";
      //     } else if (Ext.TYPE_PAGE == "all") {
      //       href = "report/Rep_RepImpExpenseALL.php";
      //     }

      var resultUrl = "";

      //     $.each(ArrD, function(key, vv) {
      //       if (key > 0) {
      //         resultUrl += "&i_btn" + key + "=" + (Ext.getCmp("i_btn[" + key + "]").checked ? 1 : 2);
      //         resultUrl += "&i_gx" + key + "=" + (Ext.getCmp("i_gx[" + key + "]").checked ? 1 : 2);
      //       }
      //     });

      //     if (Ext.TYPE_PAGE == "ephys") {
      //       resultUrl += "&dc_expense_id=" + Ext.getCmp("s_dc_expense_id").getValue();
      //     } else if (Ext.TYPE_PAGE == "vsn") {
      //       resultUrl += "&dc_expense_acc_vsn_id=" + Ext.getCmp("s_dc_expense_acc_vsn_id").getValue();
      //     }
      resultUrl += "&type=" + type;
      resultUrl += "&d_date_start=" + Ext.util.Format.date(Ext.getCmp("d_date_start").getValue(), "Y-m-d");
      resultUrl += "&d_date_end=" + Ext.util.Format.date(Ext.getCmp("d_date_end").getValue(), "Y-m-d");
      // resultUrl += "&i_year=" + Ext.getCmp("i_year").getValue();
      // resultUrl += "&dc_expense_budget_type_id=" + Ext.getCmp("dc_expense_budget_type_id").getValue();

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
                title: "เมนู " + Ext.title_panel,
                RemoveCls: "x-box-item",
                defaults: {
                  labelStyle: "width:200px;",
                  allowBlank: true
                },
                items: [
                  {
                    xtype: "compositefield",
                    fieldLabel: "ระหว่างวันที่",
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
                  }
                  // new Ext.form.ComboBox({
                  //   id: "i_year",
                  //   fieldLabel: "ปี",
                  //   width: 163,
                  //   mode: "local",
                  //   store: Ext.store_year,
                  //   valueField: "id",
                  //   displayField: "c_name",
                  //   triggerAction: "all",
                  //   forceSelection: true,
                  //   selectOnFocus: true,
                  //   typeAhead: false,
                  //   emptyText: "กรุณาเลือก...",
                  //   value: new Date().getFullYear(),
                  //   listeners: {
                  //     change: function(combo, newValue) {
                  //       if (newValue == "") {
                  //         combo.reset();
                  //       }
                  //     },
                  //     beforequery: function(q) {
                  //       if (q.query) {
                  //         var length = q.query.length;
                  //         q.query = new RegExp(Ext.escapeRe(q.query));
                  //         q.query.length = length;
                  //       }
                  //     },
                  //     blur: function() {
                  //       this.getStore().clearFilter();
                  //     }
                  //   }
                  // }),
                  // new Ext.form.ComboBox({
                  //   id: "dc_expense_budget_type_id",
                  //   fieldLabel: "แหล่งเงิน",
                  //   store: Ext.dc_expense_budget_type,
                  //   valueField: "id",
                  //   displayField: "c_name",
                  //   mode: "local",
                  //   triggerAction: "all",
                  //   emptyText: "กรุณาเลือก...",
                  //   width: 500,
                  //   forceSelection: true,
                  //   selectOnFocus: true,
                  //   typeAhead: false,
                  //   value: "0",
                  //   listeners: {
                  //     change: function(combo, newValue) {
                  //       if (newValue == "") {
                  //         combo.reset();
                  //       }
                  //     },
                  //     beforequery: function(q) {
                  //       if (q.query) {
                  //         var length = q.query.length;
                  //         q.query = new RegExp(Ext.escapeRe(q.query));
                  //         q.query.length = length;
                  //       }
                  //     },
                  //     blur: function() {
                  //       this.getStore().clearFilter();
                  //     }
                  //   }
                  // })
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
