Ext.onReady(function() {
  Ext.QuickTips.init();

  /*===============================================*/
  var title_panel = "เลขที่เช็ค (จ่ายกระแส)";
  /*===============================================*/
  var store = new Ext.data.JsonStore({
    storeId: "myStore",
    autoDestroy: true,
    autoLoad: true,
    url: "api/List_DcCheque.php",
    root: "data",
    baseParams: { i_read: user_right_read }, //Permission i_read
    idProperty: "id",
    totalProperty: "totalCount",
    fields: [
      { name: "no" },
      { name: "id" },
      { name: "dc_bank_acc_company_id" },
      { name: "c_cheque" },
      { name: "c_show" },
      { name: "i_total" },
      { name: "d_doc" },
      { name: "d_gen" },
      { name: "f_money" },
      { name: "c_comment" },
      { name: "i_status" },
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

  var store_main = new Ext.data.JsonStore({
    autoDestroy: true,
    autoLoad: true,
    url: "api/All_DcBank.php",
    root: "data",
    baseParams: { type: "main" },
    fields: [{ name: "id" }, { name: "c_name" }]
  });

  var store_bank_acc_company = new Ext.data.JsonStore({
    autoDestroy: true,
    autoLoad: true,
    url: "api/All_DcBankAccCompany.php",
    root: "data",
    baseParams: { type: "bank_company_all_full" },
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
          data: [["c_cheque", "เลขที่เช็ค"], ["c_show", "ข้อมูลเช็ค"]]
        }),
        value: "c_cheque",
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
      {
        id: "edit",
        header: "-",
        sortable: false,
        align: "center",
        width: 90,
        dataIndex: "id",
        renderer: function(value, metaData, record, row, col, store, gridView) {
          if (record.data.i_status == 4) {
            return "<button style='font-size:11px; cursor:pointer; color: green;'>แก้ไข</button>";
          }
        }
      },
      {
        id: "delete",
        header: "-",
        sortable: false,
        align: "center",
        dataIndex: "id",
        renderer: function(value, metaData, record, row, col, store, gridView) {
          if (record.data.i_status == 4) {
            return "<button style='font-size:11px; cursor:pointer; color: red;'>ลบ</button>";
          }
        }
      },
      { header: "เลขที่เช็ค", sortable: true, align: "center", dataIndex: "c_cheque" },
      { header: "ข้อมูลเช็ค", sortable: true, width: 300, dataIndex: "c_show" },
      {
        id: "i_status",
        header: "สถานะเช็ค",
        sortable: true,
        dataIndex: "i_status",
        align: "center",
        renderer: function(value, metaData, record, row, col, store, gridView) {
          if (value == 4) {
            return "<font color=red>ว่าง</font>";
          } else if (value == 1) {
            return "<font color=green>จ่ายแล้ว</font>";
          }
        }
      },
      {
        header: "สถานะ",
        sortable: false,
        width: 50,
        align: "center",
        renderer: function(value, metaData, record, row, col, store, gridView) {
          var i_enable = record.get("i_enable");
          if (i_enable == 1) {
            return "<img src='../images/icons/yes.gif');/>";
          } else {
            return "<img src='../images/icons/no.gif');/>";
          }
        }
      },
      {
        header: "ผู้ทำรายการล่าสุด",
        sortable: true,
        dataIndex: "dc_user_update_id"
      },
      {
        header: "วันที่ทำรายการล่าสุด",
        sortable: true,
        align: "center",
        dataIndex: "d_update",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          return value != "" ? shortThaiDate(value) : "";
        }
      },
      {
        header: "หน่วยงานที่ทำรายการล่าสุด",
        sortable: true,
        dataIndex: "dc_user_update_cost_id"
      }
    ],
    //	autoExpandColumn: "c_show",
    bbar: pagingBar
  });

  function cellClick(grid, rowIndex, columnIndex, e) {
    var record = grid.getStore().getAt(rowIndex);

    Ext.getCmp("c_cheque").enable();
    Ext.getCmp("i_total").enable();

    if (columnIndex == grid.getColumnModel().getIndexById("edit")) {
      if (record.data.i_status == 4) {
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

        Ext.getCmp("c_cheque").disable();
        Ext.getCmp("i_total").disable();
      }
    } else if (columnIndex == grid.getColumnModel().getIndexById("delete")) {
      if (record.data.i_status == 4) {
        new Ext.Window({
          id: "win-msg-delete",
          title: "Remove",
          modal: true,
          width: 250,
          height: 130,
          html: "ท่านต้องการที่จะลบข้อมูล ?",
          buttons: [
            {
              text: "Confirm",
              handler: function() {
                Ext.Ajax.request({
                  url: "api/mn_DcCheque.php",
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
  }

  var panelForm = {
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
        url: "api/mn_DcCheque.php",
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
                defaults: { labelStyle: "width:120px;", allowBlank: false },
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
                    fieldLabel: "เลขที่บัญชีธนาคาร",
                    id: "dc_bank_acc_company_id",
                    store: store_bank_acc_company,
                    valueField: "id",
                    displayField: "c_name",
                    mode: "local",
                    triggerAction: "all",
                    emptyText: "กรุณาเลือก...",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    width: 600,
                    listeners: {
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
                    xtype: "textfield",
                    fieldLabel: "เลขที่เช็ค  [เริ่มต้น]",
                    id: "c_cheque",
                    name: "c_cheque",
                    width: 100
                  },
                  {
                    xtype: "textfield",
                    fieldLabel: "จำนวนเช็ค/เล่ม",
                    id: "i_total",
                    name: "i_total",
                    width: 100
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

              if (Ext.getCmp("dc_bank_acc_company_id").getValue() == "") {
                msg += "- กรุณาเลือก เลขที่บัญชีธนาคาร<br>";
              }
              if (Ext.getCmp("c_cheque").getValue() == "") {
                msg += "- กรุณากรอกชื่อเลขที่เช็ค (จ่าย)<br>";
              }

              if (msg == "") {
                Ext.getCmp("tabpanel2")
                  .getEl()
                  .mask("Please wait...", "x-mask-loading");
                Ext.Ajax.request({
                  url: "api/mn_DcCheque.php",
                  method: "POST",
                  params: {
                    mode: Ext.getCmp("role-form-mode").getValue(),
                    id: Ext.getCmp("id").getValue(),
                    dc_bank_acc_company_id: Ext.getCmp("dc_bank_acc_company_id").getValue(),
                    c_cheque: Ext.getCmp("c_cheque").getValue(),
                    i_total: Ext.getCmp("i_total").getValue()
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
    id: "contenterCenter",
    defaults: { autoScroll: true },
    items: [gridMain, panelForm]
  });
  // SET ref Grid&Tab
  Ext.getCmp("tabpanel1").on("cellclick", cellClick, this);

  // SetTab Controller Loads
  Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
  /*====================== RENDER ======================*/
  new Ext.Viewport({
    layout: "border",
    items: [center]
  });
});
