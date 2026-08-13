Ext.onReady(function() {
  Ext.QuickTips.init();

  /* =============================================== */
 

  title_panel = "รายงานนำเข้าข้อมูลใบเบิก";
  itype = null;
  /* =============================================== */
 
  dc_expense_budget_type = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_GlRep00022.php",
    baseParams: { type: "dc_expense_budget_type", itype: itype, all: "all" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"] 
  });

  dc_expense = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_GlRep00022.php",
    baseParams: { type: "dc_expense", all: "all" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
    listeners: {
      load: function(t, records, options) {
        Ext.getCmp("s_dc_expense_id").setValue("0");
      }
    }
  });

  dc_expense_acc_vsn = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_GlRep00022.php",
    baseParams: { type: "dc_expense_acc_vsn", all: "all" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
    listeners: {
      load: function(t, records, options) {
        Ext.getCmp("s_dc_expense_acc_vsn_id").setValue("0");
      }
    }
  });

  store_acc_s_parent = new Ext.data.JsonStore({
    autoLoad: true,
    url: "api/All_GlRep00022.php",
    baseParams: { type: "dc_acc_main", show: "all" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name", "cut_name"]
  });

  store_acc_s_parent_lv5 = new Ext.data.JsonStore({
    autoLoad: true,
    url: "api/All_GlRep00022.php",
    baseParams: { type: "dc_acc_main_lv5", show: "all" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name", "cut_name"]
  });

  store_acc_s = new Ext.data.JsonStore({
    autoLoad: true,
    url: "api/All_GlRep00022.php",
    baseParams: { type: "dc_acc", show: "all" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name", "cut_name"]
  });

  Ext.store_dc_user = new Ext.data.JsonStore({
    autoLoad: true,
    url: "api/All_GlRep00022.php",
    baseParams: { type: "dc_user", show: "all" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"]
  });

  // storeYear
  var years = [];
  var currentTime = new Date();
  var now = currentTime.getFullYear() + 1;
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

    let s_dc_acc_id_parent = "";
    let s_dc_acc_id_parent_lv5 = "";
    let s_dc_acc_id = "";
    let s_dc_user_id = "";

    if (Ext.getCmp("d_date_start").getValue() == "" || Ext.getCmp("d_date_end").getValue() == "") {
      msg += "- กรุณาเลือก ช่วงวันที่<br>";
    }
    if (Ext.getCmp("s_dc_expense_budget_type_id").getValue() == "") {
      msg += "- กรุณาเลือก แหล่งเงิน<br>";
    }

    if (Ext.getCmp("i_show_acc").getValue().inputValue == 1) {
      if (Ext.getCmp("s_dc_acc_id_parent").getValue() == "") {
        msg += "- กรุณาเลือก บัญชีคุม Lv4 อย่างน้อย 1 รายการ<br>";
      } else {
        s_dc_acc_id_parent = Ext.getCmp("s_dc_acc_id_parent").getValue();
      }
    } else if (Ext.getCmp("i_show_acc").getValue().inputValue == 3) {
      if (Ext.getCmp("s_dc_acc_id_parent_lv5").getValue() == "") {
        msg += "- กรุณาเลือก บัญชีคุม Lv5 อย่างน้อย 1 รายการ<br>";
      } else {
        s_dc_acc_id_parent_lv5 = Ext.getCmp("s_dc_acc_id_parent_lv5").getValue();
      }
    } else {
      if (Ext.getCmp("s_dc_acc_id").getValue() == "") {
        msg += "- กรุณาเลือก บัญชีย่อยอย่างน้อย 1 รายการ<br>";
      } else {
        s_dc_acc_id = Ext.getCmp("s_dc_acc_id").getValue();
      }
    }
    if (Ext.getCmp("s_dc_user_id").getValue() == "") {
      msg += "- กรุณาเลือก ผู้สร้างรายการ 1 รายการ<br>";
    } else {
      s_dc_user_id = Ext.getCmp("s_dc_user_id").getValue();
    }

    if (msg == "") {
      c_system = Ext.getCmp("i_system").getValue().inputValue;

      if (c_system== "1") {
        href = "report/Rep_GlRepE00022.php";
      } else if  (c_system== "2")   {
        href = "report/Rep_GlRepV00022.php";
      } else {
        href = "report/Rep_GlRepAll00022.php";
      }

       

      var resultUrl = "";

      // $.each(ArrD, function(key, vv) {
      //   if (key > 0) {
      //     resultUrl += "&i_btn" + key + "=" + (Ext.getCmp("i_btn[" + key + "]").checked ? 1 : 2);
      //     resultUrl += "&i_gx" + key + "=" + (Ext.getCmp("i_gx[" + key + "]").checked ? 1 : 2);
      //   }
      // });

      if (Ext.TYPE_PAGE == "ephys") {
        resultUrl += "&dc_expense_id=" + Ext.getCmp("s_dc_expense_id").getValue();
      } else if (Ext.TYPE_PAGE == "vsn1" || Ext.TYPE_PAGE == "vsn2" || Ext.TYPE_PAGE == "vsn3") {
        resultUrl += "&dc_expense_acc_vsn_id=" + Ext.getCmp("s_dc_expense_acc_vsn_id").getValue();
      }
      resultUrl += "&type=" + type;
      resultUrl += "&type_page=" + Ext.TYPE_PAGE;
      resultUrl += "&c_budget_year=" + Ext.getCmp("c_budget_year").getValue();
      resultUrl += "&i_type_year=" + Ext.getCmp("i_type_year").getValue().inputValue;
      resultUrl += "&i_cal_gl=" + Ext.getCmp("i_cal_gl").getValue().inputValue;
      resultUrl += "&i_system=" + Ext.getCmp("i_system").getValue().inputValue;

      resultUrl += "&d_date_start=" + Ext.util.Format.date(Ext.getCmp("d_date_start").getValue(), "Y-m-d");
      resultUrl += "&d_date_end=" + Ext.util.Format.date(Ext.getCmp("d_date_end").getValue(), "Y-m-d");
      resultUrl += "&dc_expense_budget_type_id=" + Ext.getCmp("s_dc_expense_budget_type_id").getValue();
      resultUrl += "&i_show_acc=" + Ext.getCmp("i_show_acc").getValue().inputValue;
      resultUrl += "&dc_acc_id_parent=" + s_dc_acc_id_parent;
      resultUrl += "&dc_acc_id_parent_lv5=" + s_dc_acc_id_parent_lv5;
      resultUrl += "&dc_acc_id=" + s_dc_acc_id;
      resultUrl += "&dc_user_create_id=" + s_dc_user_id;
      resultUrl += "&i_show_IRCEnV=" + (Ext.getCmp("i_show_IRCEnV").checked ? 1 : 0);
      resultUrl += "&i_show_gx=" + (Ext.getCmp("i_show_gx").checked ? 1 : 0);

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
                    id: "c_budget_year",
                    fieldLabel: "ปี",
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
                    xtype: "radiogroup",
                    id: "i_type_year",
                    fieldLabel: "&nbsp;",
                    columns: [65, 90, 70],
                    items: [
                      {
                        boxLabel: "ทั้งหมด",
                        name: "i_type_year",
                        inputValue: 0,
                        checked: true
                      },
                      {
                        boxLabel: "ปีงบประมาณ",
                        name: "i_type_year",
                        inputValue: 1
                      },
                      {
                        boxLabel: "เหลื่อมปี",
                        name: "i_type_year",
                        inputValue: 2
                      }
                    ]
                  },
                  {
                    xtype: "radiogroup",
                    id: "i_cal_gl",
                    fieldLabel: "&nbsp;",
                    columns: [65, 130, 110],
                    items: [
                      {
                        boxLabel: "ทั้งหมด",
                        name: "i_cal_gl",
                        inputValue: 0,
                        checked: true
                      },
                      {
                        boxLabel: "เงินเดือนจ่ายพนักงาน",
                        name: "i_cal_gl",
                        inputValue: 1
                      },
                      {
                        boxLabel: "จ่ายให้บริษัท",
                        name: "i_cal_gl",
                        inputValue: 2
                      }
                    ]
                  },
                  {
                    xtype: "radiogroup",
                    id: "i_system",
                    fieldLabel: "ระบบ",
                    columns: [65, 60, 100],
                    items: [
                      {
                        boxLabel: "ทั้งหมด",
                        name: "i_system",
                        inputValue: 0
                      },
                      {
                        boxLabel: "E-phis",
                        name: "i_system",
                        inputValue: 1
                      },
                      {
                        boxLabel: "Vision net",
                        name: "i_system",
                        inputValue: 2,
                        checked: true
                      }
                    ]
                  },
                  {
                    xtype: "compositefield",
                    fieldLabel: "วันที่ใบเบิกระหว่าง",
                    msgTarget: "under",
                    items: [
                      {
                        xtype: "datefield",
                        id: "d_date_start",
                        width: 127,
                        value: addY(543)
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
                  new Ext.ux.form.LovCombo({
                    id: "s_dc_expense_budget_type_id",
                    fieldLabel: "แหล่งเงิน",
                    width: 500,
                    mode: "local",
                    store: dc_expense_budget_type,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก..."
                  }),
                  new Ext.form.ComboBox({
                    id: "s_dc_expense_id",
                    fieldLabel: "รายจ่ายย่อย",
                    store: dc_expense,
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
                    hidden: Ext.TYPE_PAGE == "ephys" ? false : true,
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
                  new Ext.form.ComboBox({
                    id: "s_dc_expense_acc_vsn_id",
                    fieldLabel: "รายจ่ายย่อย",
                    store: dc_expense_acc_vsn,
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
                    hidden: Ext.TYPE_PAGE == "vsn" ? false : true,
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
                    xtype: "radiogroup",
                    id: "i_show_acc",
                    fieldLabel: "รายการบัญชี",
                    columns: [90, 90, 100],
                    items: [
                      {
                        boxLabel: "บัญชีคุม Lv4",
                        name: "i_show_acc",
                        inputValue: 1,
                        checked: true
                      },
                      {
                        boxLabel: "บัญชีคุม Lv5",
                        name: "i_show_acc",
                        inputValue: 3
                      },
                      {
                        boxLabel: "บัญชีย่อย",
                        name: "i_show_acc",
                        inputValue: 2
                      }
                    ],
                    listeners: {
                      change: function(obj, value) {
                        if (value.inputValue == 1) {
                          Ext.getCmp("s_dc_acc_id").hide();
                          Ext.getCmp("s_dc_acc_id_parent").show();
                          Ext.getCmp("s_dc_acc_id_parent_lv5").hide();
                        } else if (value.inputValue == 3) {
                          Ext.getCmp("s_dc_acc_id").hide();
                          Ext.getCmp("s_dc_acc_id_parent").hide();
                          Ext.getCmp("s_dc_acc_id_parent_lv5").show();
                        } else {
                          Ext.getCmp("s_dc_acc_id").show();
                          Ext.getCmp("s_dc_acc_id_parent").hide();
                          Ext.getCmp("s_dc_acc_id_parent_lv5").hide();
                        }
                      }
                    }
                  },
                  new Ext.ux.form.LovCombo({
                    id: "s_dc_acc_id_parent",
                    fieldLabel: "รายการบัญชีคุม Lv4",
                    width: 500,
                    mode: "local",
                    store: store_acc_s_parent,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก..."
                  }),
                  new Ext.ux.form.LovCombo({
                    id: "s_dc_acc_id_parent_lv5",
                    fieldLabel: "รายการบัญชีคุม Lv5",
                    width: 500,
                    mode: "local",
                    store: store_acc_s_parent_lv5,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    hidden: true,
                    emptyText: "กรุณาเลือก..."
                  }),
                  new Ext.ux.form.LovCombo({
                    id: "s_dc_acc_id",
                    fieldLabel: "รายการบัญชีย่อย",
                    width: 500,
                    mode: "local",
                    store: store_acc_s,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    hidden: true,
                    emptyText: "กรุณาเลือก..."
                  }),
                  new Ext.ux.form.LovCombo({
                    id: "s_dc_user_id",
                    fieldLabel: "ผู้สร้างรายการ",
                    width: 500,
                    mode: "local",
                    store: Ext.store_dc_user,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก..."
                  })
                  
                  ,{
                    xtype: "compositefield",
                    fieldLabel: "แสดงคอลัมภ์",
                    msgTarget: "under",
                    items: [
                      {
                        xtype: "checkbox",
                        id: "i_show_IRCEnV",
                        boxLabel: "เลขที่นำเข้าใบเบิก (IRCE/IRCV)",
                        inputValue: 1,
                        checked: false
                      },
                      { xtype: "displayfield", width: 4 },
                      {
                        xtype: "checkbox",
                        id: "i_show_gx",
                        boxLabel: "เลขที่บันทึกบัญชีตั้งหนี้ (GX/GL)",
                        inputValue: 1,
                        checked: false
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
