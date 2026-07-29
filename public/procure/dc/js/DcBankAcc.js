Ext.onReady(function() {
  Ext.QuickTips.init();

  /*===============================================*/
  var title_panel = "สมุดบัญชีธนาคาร";
  /*===============================================*/
  var store = new Ext.data.JsonStore({
    storeId: "myStore",
    autoDestroy: true,
    autoLoad: true,
    url: "api/List_DcBankAcc.php",
    root: "data",
    baseParams: { i_read: user_right_read }, //Permission i_read
    idProperty: "id",
    totalProperty: "totalCount",
    fields: [
      { name: "no" },
      { name: "id" },
      { name: "dc_bank_deposit_type_id" },
      { name: "dc_bank_deposit_type_name" },
      { name: "dc_bank_id" },
      { name: "dc_bank_name" },
      { name: "dc_bank_branch_id" },
      { name: "dc_bank_branch_name" },
      { name: "dc_acc_id" },
      { name: "dc_acc_name" },
      { name: "dc_area_id" },
      { name: "dc_area_name" },
      { name: "c_code" },
      { name: "c_name" },
      { name: "i_main" },
      { name: "c_comment" },
      { name: "i_enable" },
      { name: "i_delete" },
      { name: "dc_user_create_id" },
      { name: "dc_user_create_cost_id" },
      { name: "d_create" },
      { name: "dc_user_update_id" },
      { name: "dc_user_update_cost_id" },
      { name: "d_update" }
    ]
  });

  Ext.store_bank = new Ext.data.JsonStore({
    autoDestroy: true,
    autoLoad: true,
    url: "api/All_DcBankAcc.php",
    root: "data",
    baseParams: { type: "bank" },
    fields: [{ name: "id" }, { name: "c_name" }]
  });

  var store_bank_all = new Ext.data.JsonStore({
    autoDestroy: true,
    autoLoad: true,
    url: "api/All_DcBankAcc.php",
    root: "data",
    baseParams: { type: "bank_all" },
    fields: [{ name: "id" }, { name: "c_name" }],
    listeners: {
      load: function(t, records, options) {
        Ext.getCmp("s_bank_id").setValue("0");
      }
    }
  });

  Ext.store_bank_branch = new Ext.data.JsonStore({
    autoDestroy: true,
    autoLoad: true,
    url: "api/All_DcBankAcc.php",
    root: "data",
    baseParams: { type: "bank_branch" },
    fields: [{ name: "id" }, { name: "c_name" }]
  });

  Ext.store_bank_deposit_type = new Ext.data.JsonStore({
    autoDestroy: true,
    autoLoad: true,
    url: "api/All_DcBankAcc.php",
    root: "data",
    baseParams: { type: "bank_deposit_type" },
    fields: [{ name: "id" }, { name: "c_name" }]
  });

  Ext.store_area = new Ext.data.JsonStore({
    autoDestroy: true,
    autoLoad: true,
    url: "api/All_DcBankAcc.php",
    root: "data",
    baseParams: { type: "area" },
    fields: [{ name: "id" }, { name: "c_name" }]
  });

  Ext.store_acc = new Ext.data.JsonStore({
    autoDestroy: true,
    autoLoad: true,
    url: "api/All_DcBankAcc.php",
    root: "data",
    baseParams: { type: "acc" },
    fields: [{ name: "id" }, { name: "c_name" }]
  });

  // pagingBar
  var pagingBar = new Ext.PagingToolbar({
    pageSize: 20,
    store: store,
    displayInfo: true,
    displayMsg: "Displaying topics {0} - {1} of {2}"
  });

  var gridMain = new Ext.grid.GridPanel({
    region: "center",
    layout: "fit",
    title: "แสดงรายการ" + title_panel,
    id: "tabpanel1",
    border: false,
    stripeRows: true,
    loadMask: true,
    store: store,
    viewConfig: {
      emptyText: "ไม่มีข้อมูล..",
      deferEmptyText: false
    },
    tbar: [
      {
        text: "เพิ่มข้อมูล",
        id: "buAdd",
        iconCls: "icon-add",
        handler: function(grid, rowIndex, colIndex) {
          Ext.getCmp("icon-save").show();
          Ext.getCmp("tabpanel2").setDisabled(false);
          Ext.getCmp("contenterCenter").setActiveTab("tabpanel2");
          Ext.getCmp("form-widgets")
            .getForm()
            .reset();
          Ext.getCmp("role-form-mode").setValue("ADD");
        }
      },
      { xtype: "tbfill" },
      "-",
      {
        id: "filter",
        xtype: "combo",
        width: 80,
        mode: "local",
        store: new Ext.data.SimpleStore({
          fields: ["value", "text"],
          data: [["c_code", "เลขที่บัญชี"], ["c_name", "ชื่อธนาคาร"]]
        }),
        value: "c_code",
        valueField: "value",
        displayField: "text",
        allowBlank: false,
        editable: false,
        triggerAction: "all",
        typeAhead: false
      },
      "-",
      {
        id: "value-box",
        xtype: "textfield",
        width: 150,
        fieldLabel: "fieldLabel",
        emptyText: "คำที่ต้องการค้นหา"
      },
      "-",
      "สถานะ",
      "-",
      {
        id: "status",
        xtype: "combo",
        width: 100,
        mode: "local",
        store: new Ext.data.SimpleStore({
          fields: ["value", "text"],
          data: [["0", "ทั้งหมด"], ["1", "ใช้งาน"], ["2", "ไม่ใช้งาน"]]
        }),
        value: "0",
        valueField: "value",
        displayField: "text",
        allowBlank: false,
        editable: false,
        triggerAction: "all",
        typeAhead: false
      },
      "-",
      "ธนาคาร",
      "-",
      {
        id: "s_bank_id",
        xtype: "combo",
        width: 350,
        mode: "local",
        store: store_bank_all,
        valueField: "id",
        displayField: "c_name",
        allowBlank: false,
        editable: false,
        triggerAction: "all",
        typeAhead: false
      },
      "-",
      {
        text: "ค้นหา",
        iconCls: "icon-magnifier",
        handler: function() {
          if (Ext.getCmp("value-box").getValue() != "") {
            store.setBaseParam("value", Ext.getCmp("value-box").getValue());
            store.setBaseParam("filter", Ext.getCmp("filter").getValue());
          } else {
            store.setBaseParam("value", "");
            store.setBaseParam("filter", "");
          }
          store.setBaseParam("mode", "SEARCH");
          store.setBaseParam("status", Ext.getCmp("status").getValue());
          store.setBaseParam("dc_bank_id", Ext.getCmp("s_bank_id").getValue());
          store.load();
        }
      }
    ],
    columns: [
      new Ext.grid.RowNumberer({
        width: 30,
        header: "ที่ ",
        renderer: function(value, metaData, record, row, col, store, gridView) {
          return record.get("no");
        }
      }),
      { header: "เลขที่บัญชี", sortable: true, width: 90, align: "center", dataIndex: "c_code" },
      { header: "ชื่อธนาคาร", sortable: true, width: 200, dataIndex: "c_name" },
      {
        header: "สถานะธนาคารหลัก",
        sortable: true,
        width: 120,
        align: "center",
        renderer: function(value, metaData, record, row, col, store, gridView) {
          var i_main = record.get("i_main");
          if (i_main == 5) {
            return '<img src="../images/icons/bullet_cross.png");/>';
          } else {
            return '<img src="../images/icons/bullet_tick.png");/>';
          }
        }
      },
      { header: "ธนาคาร", sortable: true, dataIndex: "dc_bank_name" },
      { header: "สาขา", sortable: true, dataIndex: "dc_bank_branch_name" },
      { header: "ประเภทเงินฝาก", sortable: true, dataIndex: "dc_bank_deposit_type_name" },
      { header: "หน่วยธุรกิจ", sortable: true, dataIndex: "dc_area_name" },
      { header: "ผังบัญชี", sortable: true, dataIndex: "dc_acc_name" },
      {
        header: "สถานะ",
        sortable: false,
        width: 50,
        align: "center",
        renderer: function(value, metaData, record, row, col, store, gridView) {
          var i_enable = record.get("i_enable");
          if (i_enable == 1) {
            return '<img src="../images/icons/yes.gif");/>';
          } else {
            return '<img src="../images/icons/no.gif");/>';
          }
        }
      }
    ],
    //autoExpandColumn: "c_name",
    bbar: pagingBar
  });

  function cellClick(grid, rowIndex, columnIndex, e) {
    var record = grid.getStore().getAt(rowIndex);

    if (columnIndex == grid.getColumnModel().getIndexById("edit")) {
      Ext.getCmp("icon-save").show();
      Ext.getCmp("tabpanel2").setDisabled(false);
      Ext.getCmp("contenterCenter").setActiveTab("tabpanel2");
      Ext.getCmp("form-widgets")
        .getForm()
        .reset();
      Ext.getCmp("form-widgets")
        .getForm()
        .loadRecord(record);
      Ext.getCmp("role-form-mode").setValue("EDIT");
    } else if (columnIndex == grid.getColumnModel().getIndexById("view")) {
      Ext.getCmp("icon-save").hide();
      Ext.getCmp("tabpanel2").setDisabled(false);
      Ext.getCmp("contenterCenter").setActiveTab("tabpanel2");
      Ext.getCmp("form-widgets")
        .getForm()
        .reset();
      Ext.getCmp("form-widgets")
        .getForm()
        .loadRecord(record);
      Ext.getCmp("role-form-mode").setValue("EDIT");
    } else if (columnIndex == grid.getColumnModel().getIndexById("remove")) {
      var win = new Ext.Window({
        id: "win-msg-delete",
        title: "Remove",
        modal: true,
        width: 250,
        height: 130,
        html: "ท่านต้องการที่จะลบข้อมูล ?",
        buttons: [
          {
            text: "Confirm",
            handler: function() {
              Ext.Ajax.request({
                url: "api/mn_DcBankAcc.php",
                method: "POST",
                params: {
                  mode: "DELETE",
                  id: record.get("id")
                },
                success: function(result, request) {
                  var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                  if (jsonData.success) {
                    //Ext.MessageBox.alert("Success", jsonData.msg);		// alert massage success
                  } else {
                    Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                  }
                  Ext.getCmp("win-msg-delete").hide(); // hidden window-panel
                  Ext.getCmp("win-msg-delete").destroy(); // clear memory :: garbage collection
                  store.reload();
                  Ext.getCmp("tabpanel2").setDisabled(true);
                },
                failure: function(result, request) {
                  Ext.MessageBox.alert("Failed", result.responseText); // connect error
                }
              });
            }
          },
          {
            text: "Cancel",
            handler: function() {
              Ext.getCmp("win-msg-delete").hide();
              Ext.getCmp("win-msg-delete").destroy();
            }
          }
        ]
      }).show();
    }
  }

  let panelForm = {
    region: "center",
    //layout:"fit",
    title: "ข้อมูล" + title_panel,
    xtype: "panel",
    id: "tabpanel2",
    border: false,
    disabled: true,
    stripeRows: true,
    loadMask: true,
    store: store,
    items: [
      {
        xtype: "form",
        id: "form-widgets",
        url: "api/mn_DcBankAcc.php",
        frame: true,
        labelWidth: 200,
        bodyStyle: { padding: "10px 20px" },
        defaults: { anchor: "100%", msgTarget: "side", allowBlank: false },
        items: [
          {
            xtype: "container",
            layout: "hbox",
            align: "stretch",
            defaults: { xtype: "fieldset", flex: 1, margins: "0px 3px", autoHeight: true },
            items: [
              {
                title: "บันทึกข้อมูล " + title_panel,
                defaults: { labelStyle: "width:200px;", allowBlank: true },
                items: [
                  {
                    id: "role-form-mode",
                    xtype: "hidden",
                    name: "mode",
                    readOnly: true
                  },
                  {
                    xtype: "hidden",
                    name: "id",
                    id: "id",
                    readOnly: true
                  },
                  new Ext.form.ComboBox({
                    fieldLabel: "ธนาคาร",
                    id: "dc_bank_id",
                    name: "dc_bank_id",
                    mode: "local",
                    store: Ext.store_bank,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    width: 350,
                    listeners: {
                      afterrender: function() {
                        this.fn = function() {};
                      },
                      change: function(combo, newValue) {
                        if (newValue == "") {
                          combo.reset();
                        }
                        this.fn();
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
                    fieldLabel: "สาขา",
                    id: "dc_bank_branch_id",
                    name: "dc_bank_branch_id",
                    mode: "local",
                    store: Ext.store_bank_branch,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    width: 350,
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
                    fieldLabel: "ประเภทเงินฝาก",
                    id: "dc_bank_deposit_type_id",
                    name: "dc_bank_deposit_type_id",
                    mode: "local",
                    store: Ext.store_bank_deposit_type,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    width: 350,
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
                    fieldLabel: "เลขที่บัญชี",
                    anchor: "100%",
                    msgTarget: "under",
                    items: [
                      {
                        xtype: "textfield",
                        id: "c_code",
                        name: "c_code",
                        autoCreate: { tag: "input", type: "text", autocomplete: "off", maxLength: 20 },
                        width: 350
                      },
                      { xtype: "displayfield", value: '<span style="color: red;">*เลขที่บัญชีเงินฝาก 13-20 หลัก</span>' }
                    ]
                  },
                  {
                    xtype: "textfield",
                    fieldLabel: "ชื่อบัญชี",
                    id: "c_name",
                    name: "c_name",
                    width: 350
                  },
                  new Ext.form.ComboBox({
                    fieldLabel: "หน่วยธุรกิจ",
                    id: "dc_area_id",
                    name: "dc_area_id",
                    mode: "local",
                    store: Ext.store_area,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    width: 350,
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
                    fieldLabel: "ผังบัญชี",
                    id: "dc_acc_id",
                    name: "dc_acc_id",
                    mode: "local",
                    store: Ext.store_acc,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    width: 350,
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
                    xtype: "textarea",
                    fieldLabel: "หมายเหตุ",
                    id: "c_comment",
                    name: "c_comment",
                    width: 350
                  },
                  {
                    xtype: "checkbox",
                    fieldLabel: "สถานะ",
                    id: "i_enable",
                    name: "i_enable",
                    boxLabel: "ใช้งาน",
                    checked: true,
                    inputValue: 1
                  },
                  {
                    xtype: "checkbox",
                    fieldLabel: "สถานะรายการ",
                    id: "i_main",
                    name: "i_main",
                    boxLabel: "เป็นบัญชีหลัก สำหรับรายการจ่าย ด้วยวิธีโอนผ่านบัญชีธนาคาร",
                    checked: false,
                    inputValue: 1,
                    listeners: {
                      check: function(combo, newValue) {
                        if (newValue == true) {
                          Ext.getCmp("tabpanel2")
                            .getEl()
                            .mask("Please wait...", "x-mask-loading");
                          $.ajax({
                            url: "api/mn_DcBankAcc.php",
                            type: "POST",
                            data: {
                              type: "check_main",
                              mode: Ext.getCmp("role-form-mode").getValue(),
                              id: Ext.getCmp("id").getValue(),
                              value: 1 // checked
                            },
                            success: function(result) {
                              var obj = $.parseJSON(result);
                              if (obj.success == false) {
                                Ext.Msg.alert("Warning", "มีรายการบัญชีหลักอยู่แล้ว หากต้องการระบุรายการบัญชีหลักเป็นบัญชีอื่นๆ<br>กรุณาแก้ไขข้อมูลรายการบัญชีหลักของเลขที่บัญชี " + obj.data + " ก่อน");
                                if (Ext.getCmp("i_main").checked == true) {
                                }
                                Ext.getCmp("i_main").setValue(false);
                              }
                              Ext.getCmp("tabpanel2")
                                .getEl()
                                .unmask();
                            }
                          });
                        }
                      }
                    }
                  }
                ]
              }
            ]
          }
        ],
        buttonAlign: "left",
        buttons: [
          {
            text: "&nbsp;บันทึกรายการ&nbsp;",
            id: "icon-save",
            iconCls: "icon-save",
            handler: function() {
              var form = Ext.getCmp("form-widgets").getForm();
              var msg = "";

              if (Ext.getCmp("dc_bank_id").getValue() == "") {
                msg += "- กรุณาเลือกธนาคาร<br>";
              }
              if (Ext.getCmp("dc_bank_branch_id").getValue() == "") {
                msg += "- กรุณาเลือกสาขาธนาคาร<br>";
              }
              if (Ext.getCmp("dc_bank_deposit_type_id").getValue() == "") {
                msg += "- กรุณาเลือกประเภทเงินฝาก<br>";
              }
              if (Ext.getCmp("c_code").getValue() == "") {
                msg += "- กรุณากรอกเลขที่บัญชี<br>";
              } else if (Ext.getCmp("c_code").getValue().length < 13) {
                msg += "- กรุณากรอกเลขที่บัญชี 13-20 หลัก<br>";
              }
              if (Ext.getCmp("c_name").getValue() == "") {
                msg += "- กรุณากรอกชื่อบัญชี<br>";
              }
              if (Ext.getCmp("dc_area_id").getValue() == "") {
                msg += "- กรุณาเลือกหน่วยธุรกิจ<br>";
              }
              if (Ext.getCmp("dc_acc_id").getValue() == "") {
                msg += "- กรุณาเลือกผังบัญชี<br>";
              }

              if (msg == "") {
                Ext.getCmp("tabpanel2")
                  .getEl()
                  .mask("Please wait...", "x-mask-loading");
                var i_enabled = Ext.getCmp("i_enable").checked == true ? 1 : 2;
                var i_main = Ext.getCmp("i_main").checked == true ? 5 : 1; // 5 FIX บริษัท , 1 ไม่ FIX

                Ext.Ajax.request({
                  url: "api/mn_DcBankAcc.php",
                  method: "POST",
                  params: {
                    mode: Ext.getCmp("role-form-mode").getValue(),
                    id: Ext.getCmp("id").getValue(),
                    dc_bank_id: Ext.getCmp("dc_bank_id").getValue(),
                    dc_bank_branch_id: Ext.getCmp("dc_bank_branch_id").getValue(),
                    dc_bank_deposit_type_id: Ext.getCmp("dc_bank_deposit_type_id").getValue(),
                    c_code: Ext.getCmp("c_code").getValue(),
                    c_name: Ext.getCmp("c_name").getValue(),
                    dc_area_id: Ext.getCmp("dc_area_id").getValue(),
                    dc_acc_id: Ext.getCmp("dc_acc_id").getValue(),
                    c_comment: Ext.getCmp("c_comment").getValue(),
                    i_enable: i_enabled,
                    i_main: i_main
                  },
                  success: function(result, request) {
                    var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                    if (jsonData.success) {
                      store.load();
                      Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
                      Ext.getCmp("tabpanel2").setDisabled(true);
                      Ext.getCmp("role-form-mode").setValue("");
                    } else {
                      Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                    }
                    Ext.getCmp("tabpanel2")
                      .getEl()
                      .unmask();
                  },
                  failure: function(result, request) {
                    Ext.MessageBox.alert("Failed", result.responseText); // connect error
                  }
                });
              } else {
                Ext.Msg.alert("Warning", msg);
              }
            }
          },
          {
            text: "Cancel",
            handler: function() {
              Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
              Ext.getCmp("tabpanel2").setDisabled(true);
            }
          }
        ]
      }
    ]
  };

  /*====================== CENTER ======================*/
  var center = new Ext.TabPanel({
    region: "center",
    border: false,
    //activeTab: 0, //default Tab
    id: "contenterCenter",
    defaults: { autoScroll: true },
    items: [gridMain, panelForm]
  });
  // SET ref Grid&Tab
  Ext.getCmp("tabpanel1").on("cellclick", cellClick, this);

  // SetTab Controller Loads
  Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
  InfoMainGrid("tabpanel1", false, false, false, false, false, false);

  /*====================== RENDER ======================*/
  new Ext.Viewport({
    layout: "border",
    items: [center]
  });
});
