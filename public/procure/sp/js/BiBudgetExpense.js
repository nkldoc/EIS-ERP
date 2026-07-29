Ext.onReady(function () {
  Ext.QuickTips.init();

  /* =============================================== */
  title_panel = "รายงานสินทรัพย์ตัดจำหน่ายแต่ละประเภท";
  /* =============================================== */

  // storeYear
  var years = [];
  var currentTime = new Date();
  var now = currentTime.getFullYear() + 1;
  var yy_en = 2020;
  while (yy_en <= now) {
    years.push({ id: yy_en, c_name: yy_en + 543 });
    yy_en++;
  }
  Ext.dc_cost = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_bgBudget.php",
    baseParams: { type: "dc_cost", all: "all" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
    listeners: {
      load: function (t, records, options) {
        Ext.getCmp("dc_cost_id").setValue("38");
      },
    },
  });
  Ext.dc_expense_budget_type = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_RepBudgetOverlap.php",
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
  Ext.store_year = new Ext.data.JsonStore({
    fields: ["id", "c_name"],
    data: years,
  });

  Ext.dc_acc = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_BiBudgetExpense.php",
    baseParams: { type: "dc_acc", all: "all" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
    listeners: {
      load: function (t, records, options) {
        // Ext.getCmp("dc_acc_id").setValue("0");
      },
    },
  });
  Ext.bg_expense_lv1 = new Ext.data.JsonStore({
    autoLoad: true,
    url: "api/All_RepBudgetControl.php",
    baseParams: { type: "bg_expense", i_level: 1, show: "all" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
    listeners:{
      load : function (t, records, options) {
        this.removeAt(0);      
      }

    }
  });

  Ext.bg_expense_lv2 = new Ext.data.JsonStore({
    autoLoad: true,
    url: "api/All_RepBudgetControl.php",
    baseParams: { type: "bg_expense", i_level: 2, show: "all" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
    listeners:{
      load : function (t, records, options) {
        this.removeAt(0);      
      }

    }
  });

  Ext.bg_expense_lv3 = new Ext.data.JsonStore({
    autoLoad: true,
    url: "api/All_RepBudgetControl.php",
    baseParams: { type: "bg_expense", i_level: 3, show: "all" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
    listeners:{
      load : function (t, records, options) {
        this.removeAt(0);      
      }

    }
  });

  Ext.bg_expense_lv4 = new Ext.data.JsonStore({
    autoLoad: true,
    url: "api/All_RepBudgetControl.php",
    baseParams: { type: "bg_expense", i_level: 4, show: "all" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
    listeners:{
      load : function (t, records, options) {
        this.removeAt(0);      
      }

    }
  });
  LookReport = function (type) {
    var msg = "";
    let bg_expense_id_lv1 = "";
    let bg_expense_id_lv2 = "";
    let bg_expense_id_lv3 = "";
    let bg_expense_id_lv4 = "";
    if (Ext.getCmp("i_year").getValue() < 2022) {
      msg += "- กรุณาเลือก ปีงบประมาณ มากกว่า 2564<br>";
    }

    if (Ext.getCmp("dc_expense_budget_type_id").getValue() == "") {
      msg += "- กรุณาเลือก แหล่งเงิน<br>";
    }

    

    if (Ext.getCmp("i_expense").getValue().inputValue == 1) {
      if (Ext.getCmp("bg_expense_id_lv1").getValue() == "") {
        msg += "- กรุณาเลือก ประเภทรายจ่าย Lv1 อย่างน้อย 1 รายการ<br>";
      } else {
        bg_expense_id_lv1 = Ext.getCmp("bg_expense_id_lv1").getValue();
      }
    } else if (Ext.getCmp("i_expense").getValue().inputValue == 2) {
      if (Ext.getCmp("bg_expense_id_lv2").getValue() == "") {
        msg += "- กรุณาเลือก ประเภทรายจ่าย Lv2 อย่างน้อย 1 รายการ<br>";
      } else {
        bg_expense_id_lv2 = Ext.getCmp("bg_expense_id_lv2").getValue();
      }
    } else if (Ext.getCmp("i_expense").getValue().inputValue == 3) {
      if (Ext.getCmp("bg_expense_id_lv3").getValue() == "") {
        msg += "- กรุณาเลือก ประเภทรายจ่าย Lv3 อย่างน้อย 1 รายการ<br>";
      } else {
        bg_expense_id_lv3 = Ext.getCmp("bg_expense_id_lv3").getValue();
      }
    } else {
      if (Ext.getCmp("bg_expense_id_lv4").getValue() == "") {
        msg += "- กรุณาเลือก ประเภทรายจ่าย Lv4 อย่างน้อย 1 รายการ<br>";
      } else {
        bg_expense_id_lv4 = Ext.getCmp("bg_expense_id_lv4").getValue();
      }
    }

    if (msg == "") {
      href = "report/BiBudgetExpense.php";

      var resultUrl = "";

      resultUrl += "&type=" + type;
      resultUrl += "&i_year=" + Ext.getCmp("i_year").getValue();
      resultUrl += "&dc_expense_budget_type_id=" + Ext.getCmp("dc_expense_budget_type_id").getValue();
      resultUrl += "&dc_cost_id=" + Ext.getCmp("dc_cost_id").getValue();
      // resultUrl += "&d_date_start1=" + Ext.util.Format.date(Ext.getCmp("d_date_start1").getValue(), "Y-m-d");
      // resultUrl += "&d_date_end1=" + Ext.util.Format.date(Ext.getCmp("d_date_end1").getValue(), "Y-m-d");
      // resultUrl += "&d_date_start2=" + Ext.util.Format.date(Ext.getCmp("d_date_start2").getValue(), "Y-m-d");
      // resultUrl += "&d_date_end2=" + Ext.util.Format.date(Ext.getCmp("d_date_end2").getValue(), "Y-m-d");
      resultUrl += "&i_expense=" + Ext.getCmp("i_expense").getValue().inputValue;
      resultUrl += "&bg_expense_id_lv1=" + bg_expense_id_lv1;
      resultUrl += "&bg_expense_id_lv2=" + bg_expense_id_lv2;
      resultUrl += "&bg_expense_id_lv3=" + bg_expense_id_lv3;
      resultUrl += "&bg_expense_id_lv4=" + bg_expense_id_lv4;
      // resultUrl += "&i_level1=" + (Ext.getCmp("i_level[1]").checked ? 1 : 0);
      // resultUrl += "&i_level2=" + (Ext.getCmp("i_level[2]").checked ? 1 : 0);
      // resultUrl += "&i_level3=" + (Ext.getCmp("i_level[3]").checked ? 1 : 0);
      // resultUrl += "&i_level4=" + (Ext.getCmp("i_level[4]").checked ? 1 : 0);
      // resultUrl += "&view_budget_erp=" + (Ext.getCmp("view_budget_erp").checked ? 1 : 0);
      // resultUrl += "&view_budget=" + (Ext.getCmp("view_budget").checked ? 1 : 0);
      // resultUrl += "&view_period=" + (Ext.getCmp("view_period").checked ? 1 : 0);
      // resultUrl += "&view_income=" + (Ext.getCmp("view_income").checked ? 1 : 0);
      // resultUrl += "&i_show_sum_work=" + (Ext.getCmp("i_show_sum_work").checked ? 1 : 0);

      resultUrl = resultUrl != "" ? "?" + resultUrl.substring(1) : "";

      window.open(href + resultUrl, href);
      window.focus();
    } else {
      Ext.MessageBox.alert("แจ้งเตือน", msg);
    }
  };

  function download(url, filename) {
    Ext.Msg.wait("downloading...");
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
      })
      .then((success) => {
        Ext.Msg.wait("downloading...").hide();
        console.log(success);
      })
      .catch(console.error);
  }

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
                    fieldLabel: "ปีงบประมาณ",
                    width: 163,
                    mode: "local",
                    store: Ext.store_year,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    value: new Date().getFullYear(),
                    listeners: {
                      select: function () {},
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
                  new Ext.form.ComboBox({
                    id: "dc_cost_id",
                    fieldLabel: "หน่วยงาน",
                    store: Ext.dc_cost,
                    valueField: "id",
                    displayField: "c_name",
                    mode: "local",
                    triggerAction: "all",
                    emptyText: "กรุณาเลือก...",
                    width: 400,
                    readonly : true , 
                    hidden: true,
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
                  new Ext.ux.form.LovCombo({
                    id: "dc_acc_id",
                    fieldLabel: "ประเภทสินทรัพย์",
                    width: 400,
                    mode: "local",
                    store: Ext.dc_acc,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    hidden: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
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
                          Ext.getCmp("bg_expense_id_lv1").show();
                          Ext.getCmp("bg_expense_id_lv2").hide();
                          Ext.getCmp("bg_expense_id_lv3").hide();
                          Ext.getCmp("bg_expense_id_lv4").hide();
                        } else if (value.inputValue == 2) {
                          Ext.getCmp("bg_expense_id_lv1").hide();
                          Ext.getCmp("bg_expense_id_lv2").show();
                          Ext.getCmp("bg_expense_id_lv3").hide();
                          Ext.getCmp("bg_expense_id_lv4").hide();
                        } else if (value.inputValue == 3) {
                          Ext.getCmp("bg_expense_id_lv1").hide();
                          Ext.getCmp("bg_expense_id_lv2").hide();
                          Ext.getCmp("bg_expense_id_lv3").show();
                          Ext.getCmp("bg_expense_id_lv4").hide();
                        } else {
                          Ext.getCmp("bg_expense_id_lv1").hide();
                          Ext.getCmp("bg_expense_id_lv2").hide();
                          Ext.getCmp("bg_expense_id_lv3").hide();
                          Ext.getCmp("bg_expense_id_lv4").show();
                        }
                      },
                    },
                  },
                  new Ext.ux.form.LovCombo({
                    id: "bg_expense_id_lv1",
                    fieldLabel: "ประเภทรายจ่าย Lv1",
                    width: 400,
                    mode: "local",
                    store: Ext.bg_expense_lv1,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    multiSelect: true,
                    hideOnSelect: false,
                    queryMode: "local",
                    emptyText: "กรุณาเลือก...",
                    listeners:{
                      beforerender:function(){
                          Ext.arr1 = [];
                      },
                      beforeselect:function (t, records, options) {
                          if(Ext.arr1.length==3 && records.get('checked')==false){
                              Ext.example.msg("แจ้งเตือน","ไม่สามารถเลือกรายการมากกว่า 3 รายการ", 1);
                              $(this).next("text copied");
                              setTimeout(function () {
                              $(this).next().remove();
                              }, 6000);
                              return false;
                          }
                      },
                      select:function (t, records, options) {
                          if(records.get('checked')==true){
                              Ext.arr1.push(records.get('id'));
                          }else{
                              Ext.arr1.shift(records.get('id'));
                              
                          } 
                      }
                  }
                  }),
                  new Ext.ux.form.LovCombo({
                    id: "bg_expense_id_lv2",
                    fieldLabel: "ประเภทรายจ่าย Lv2",
                    width: 400,
                    mode: "local",
                    store: Ext.bg_expense_lv2,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    hidden: true,
                    listeners:{
                      beforerender:function(){
                          Ext.arr2 = [];
                      },
                      beforeselect:function (t, records, options) {
                        if(Ext.arr2.length==3 && records.get('checked')==false){
                            Ext.example.msg("แจ้งเตือน","ไม่สามารถเลือกรายการมากกว่า 3 รายการ", 1);
                            $(this).next("text copied");
                            setTimeout(function () {
                            $(this).next().remove();
                            }, 6000);
                            return false;
                        }
                    },
                      select:function (t, records, options) {
                          if(records.get('checked')==true){
                              Ext.arr2.push(records.get('id'));
                          }else{
                              Ext.arr2.shift(records.get('id'));
                              
                          } 
                      }
                  }
                  }),
                  new Ext.ux.form.LovCombo({
                    id: "bg_expense_id_lv3",
                    fieldLabel: "ประเภทรายจ่าย Lv3",
                    width: 400,
                    mode: "local",
                    store: Ext.bg_expense_lv3,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    hidden: true,
                    listeners:{
                      beforerender:function(){
                          Ext.arr3 = [];
                      },
                      beforeselect:function (t, records, options) {
                        if(Ext.arr3.length==3 && records.get('checked')==false){
                            Ext.example.msg("แจ้งเตือน","ไม่สามารถเลือกรายการมากกว่า 3 รายการ", 1);
                            $(this).next("text copied");
                            setTimeout(function () {
                            $(this).next().remove();
                            }, 6000);
                            return false;
                        }
                    },
                      select:function (t, records, options) {
                          if(records.get('checked')==true){
                              Ext.arr3.push(records.get('id'));
                          }else{
                              Ext.arr3.shift(records.get('id'));
                              
                          } 
                      }
                  }
                  }),
                  new Ext.ux.form.LovCombo({
                    id: "bg_expense_id_lv4",
                    fieldLabel: "ประเภทรายจ่าย Lv4",
                    width: 400,
                    mode: "local",
                    store: Ext.bg_expense_lv4,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    hidden: true,
                    listeners:{
                      beforerender:function(){
                          Ext.arr4 = [];
                      },
                      beforeselect:function (t, records, options) {
                          if(Ext.arr4.length==3 && records.get('checked')==false){
                              Ext.example.msg("แจ้งเตือน","ไม่สามารถเลือกรายการมากกว่า 3 รายการ", 1);
                              $(this).next("text copied");
                              setTimeout(function () {
                              $(this).next().remove();
                              }, 6000);
                              return false;
                          }
                      },
                      select:function (t, records, options) {
                          if(records.get('checked')==true){
                              Ext.arr4.push(records.get('id'));
                          }else{
                              Ext.arr4.shift(records.get('id'));
                              
                          } 
                      }
                  }
                  }),
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
          // {
          //   text: "รายงาน Excel *(รองรับข้อมูลจำนวนมาก)",
          //   iconCls: "icon-excel",
          //   handler: function () {
          //     LookReport("excel2007");
          //   }, // End Handle
          // },
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
