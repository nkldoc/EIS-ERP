Ext.onReady(function () {
  Ext.QuickTips.init();

  /* =============================================== */
  title_panel = "ทะเบียนคุมการเบิกจ่ายเงินงบประมาณ";
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

  Ext.po_expense_lv1 = new Ext.data.JsonStore({
    autoLoad: true,
    url: "api/All_RepBudgetControl.php",
    baseParams: { type: "po_expense", i_level: 1, show: "all" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
  });

  Ext.po_expense_lv2 = new Ext.data.JsonStore({
    autoLoad: true,
    url: "api/All_RepBudgetControl.php",
    baseParams: { type: "po_expense", i_level: 2, show: "all" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
  });

  Ext.po_expense_lv3 = new Ext.data.JsonStore({
    autoLoad: true,
    url: "api/All_RepBudgetControl.php",
    baseParams: { type: "po_expense", i_level: 3, show: "all" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
  });

  Ext.po_expense_lv4 = new Ext.data.JsonStore({
    autoLoad: true,
    url: "api/All_RepBudgetControl.php",
    baseParams: { type: "po_expense", i_level: 4, show: "all" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
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
    data: years,
  });

  LookReport = function (type) {
    var msg = "";

    let po_expense_id_lv1 = "";
    let po_expense_id_lv2 = "";
    let po_expense_id_lv3 = "";
    let po_expense_id_lv4 = "";

    if (Ext.getCmp("dc_expense_budget_type_id").getValue() == "") {
      msg += "- กรุณาเลือก แหล่งเงิน<br>";
    }

    if (Ext.getCmp("i_expense").getValue().inputValue == 1) {
      if (Ext.getCmp("po_expense_id_lv1").getValue() == "") {
        msg += "- กรุณาเลือก ประเภทรายจ่าย Lv1 อย่างน้อย 1 รายการ<br>";
      } else {
        po_expense_id_lv1 = Ext.getCmp("po_expense_id_lv1").getValue();
      }
    } else if (Ext.getCmp("i_expense").getValue().inputValue == 2) {
      if (Ext.getCmp("po_expense_id_lv2").getValue() == "") {
        msg += "- กรุณาเลือก ประเภทรายจ่าย Lv2 อย่างน้อย 1 รายการ<br>";
      } else {
        po_expense_id_lv2 = Ext.getCmp("po_expense_id_lv2").getValue();
      }
    } else if (Ext.getCmp("i_expense").getValue().inputValue == 3) {
      if (Ext.getCmp("po_expense_id_lv3").getValue() == "") {
        msg += "- กรุณาเลือก ประเภทรายจ่าย Lv3 อย่างน้อย 1 รายการ<br>";
      } else {
        po_expense_id_lv3 = Ext.getCmp("po_expense_id_lv3").getValue();
      }
    } else {
      if (Ext.getCmp("po_expense_id_lv4").getValue() == "") {
        msg += "- กรุณาเลือก ประเภทรายจ่าย Lv4 อย่างน้อย 1 รายการ<br>";
      } else {
        po_expense_id_lv4 = Ext.getCmp("po_expense_id_lv4").getValue();
      }
    }

    if (msg == "") {
      href = "report/Rep_Budget.php";

      var resultUrl = "";

      resultUrl += "&type=" + type;
      resultUrl += "&i_year=" + Ext.getCmp("i_year").getValue();
      resultUrl += "&dc_expense_budget_type_id=" + Ext.getCmp("dc_expense_budget_type_id").getValue();
      resultUrl += "&d_date_start=" + Ext.util.Format.date(Ext.getCmp("d_date_start").getValue(), "Y-m-d");
      resultUrl += "&d_date_end=" + Ext.util.Format.date(Ext.getCmp("d_date_end").getValue(), "Y-m-d");
      resultUrl += "&i_expense=" + Ext.getCmp("i_expense").getValue().inputValue;
      resultUrl += "&po_expense_id_lv1=" + po_expense_id_lv1;
      resultUrl += "&po_expense_id_lv2=" + po_expense_id_lv2;
      resultUrl += "&po_expense_id_lv3=" + po_expense_id_lv3;
      resultUrl += "&po_expense_id_lv4=" + po_expense_id_lv4;
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

  const panelForm = new Ext.Panel({
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
                  new Ext.form.ComboBox({
                    id: "i_year",
                    fieldLabel: "ประจำปี",
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
                    fieldLabel: "เบิกจ่ายระหว่างวันที่",
                    msgTarget: "under",
                    items: [
                      {
                        xtype: "datefield",
                        id: "d_date_start",
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
                        id: "d_date_end",
                        width: 177,
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
                    width: 400,
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
                    id: "i_expense",
                    fieldLabel: "ประเภทรายจ่าย",
                    columns: [50, 50, 50, 50],
                    items: [
                      {
                        boxLabel: "Lv1",
                        name: "i_expense",
                        inputValue: 1,
                        checked: true,
                      },
                      {
                        boxLabel: "Lv2",
                        name: "i_expense",
                        inputValue: 2,
                      },
                      {
                        boxLabel: "Lv3",
                        name: "i_expense",
                        inputValue: 3,
                      },
                      {
                        boxLabel: "Lv4",
                        name: "i_expense",
                        inputValue: 4,
                      },
                    ],
                    listeners: {
                      change: function (obj, value) {
                        if (value.inputValue == 1) {
                          Ext.getCmp("po_expense_id_lv1").show();
                          Ext.getCmp("po_expense_id_lv2").hide();
                          Ext.getCmp("po_expense_id_lv3").hide();
                          Ext.getCmp("po_expense_id_lv4").hide();
                        } else if (value.inputValue == 2) {
                          Ext.getCmp("po_expense_id_lv1").hide();
                          Ext.getCmp("po_expense_id_lv2").show();
                          Ext.getCmp("po_expense_id_lv3").hide();
                          Ext.getCmp("po_expense_id_lv4").hide();
                        } else if (value.inputValue == 3) {
                          Ext.getCmp("po_expense_id_lv1").hide();
                          Ext.getCmp("po_expense_id_lv2").hide();
                          Ext.getCmp("po_expense_id_lv3").show();
                          Ext.getCmp("po_expense_id_lv4").hide();
                        } else {
                          Ext.getCmp("po_expense_id_lv1").hide();
                          Ext.getCmp("po_expense_id_lv2").hide();
                          Ext.getCmp("po_expense_id_lv3").hide();
                          Ext.getCmp("po_expense_id_lv4").show();
                        }
                      },
                    },
                  },
                  new Ext.ux.form.LovCombo({
                    id: "po_expense_id_lv1",
                    fieldLabel: "ประเภทรายจ่าย Lv1",
                    width: 400,
                    mode: "local",
                    store: Ext.po_expense_lv1,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                  }),
                  new Ext.ux.form.LovCombo({
                    id: "po_expense_id_lv2",
                    fieldLabel: "ประเภทรายจ่าย Lv2",
                    width: 400,
                    mode: "local",
                    store: Ext.po_expense_lv2,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    hidden: true,
                  }),
                  new Ext.ux.form.LovCombo({
                    id: "po_expense_id_lv3",
                    fieldLabel: "ประเภทรายจ่าย Lv3",
                    width: 400,
                    mode: "local",
                    store: Ext.po_expense_lv3,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    hidden: true,
                  }),
                  new Ext.ux.form.LovCombo({
                    id: "po_expense_id_lv4",
                    fieldLabel: "ประเภทรายจ่าย Lv4",
                    width: 400,
                    mode: "local",
                    store: Ext.po_expense_lv4,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    hidden: true,
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
                        checked: true,
                      },
                      { xtype: "displayfield", value: "|" },
                      {
                        xtype: "checkbox",
                        id: "i_level[2]",
                        boxLabel: "LV2",
                        inputValue: 1,
                        checked: true,
                      },
                      { xtype: "displayfield", value: "|" },
                      {
                        xtype: "checkbox",
                        id: "i_level[3]",
                        boxLabel: "LV3",
                        inputValue: 1,
                        checked: true,
                      },
                      { xtype: "displayfield", value: "|" },
                      {
                        xtype: "checkbox",
                        id: "i_level[4]",
                        boxLabel: "LV4",
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
        ],
      },
    ],
  }); // panelForm

  /* ====================== CENTER ====================== */
  const center = new Ext.TabPanel({
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
