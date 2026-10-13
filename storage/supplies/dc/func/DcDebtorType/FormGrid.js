Ext.onReady(function() {
  Ext.QuickTips.init();
  /*===============================================*/
  Ext.title_panel = "ประเภทลูกหนี้";
  /*===============================================*/

  // pagingBar
  Ext.pagingBar = new Ext.PagingToolbar({
    pageSize: 20,
    store: Ext.store,
    displayInfo: true,
    displayMsg: "Displaying topics {0} - {1} of {2}"
  });

  const controllTab = function(record, butt) {
    Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not errer

    Ext.butt = butt;

    if (butt == "add") {
      let frmAdd = new formAdd();
      Ext.getCmp("contenterCenter").add(frmAdd);
      Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
      Ext.getCmp("role-form-mode").setValue("ADD");
    } else if (butt == "edit" || butt == "view") {
      let frmAdd = new formAdd(record.data);
      Ext.getCmp("contenterCenter").add(frmAdd);
      Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
      Ext.getCmp("role-form-mode").setValue("EDIT");
      Ext.getCmp("form-widgets")
        .getForm()
        .loadRecord(record);
    } else if (butt == "DELETE") {
      new Ext.Window({
        id: "win-msg-delete",
        title: "แจ้งเตือน",
        modal: true,
        width: 250,
        height: 130,
        html: "ท่านต้องการที่จะลบข้อมูลหรือไม่ ?",
        buttons: [
          {
            text: "&nbsp;" + Ext.GLOBAL_BU_SAVE_TH + "&nbsp;",
            iconCls: "icon-save",
            handler: function() {
              Ext.getCmp("win-msg-delete")
                .getEl()
                .mask("Please wait...", "x-mask-loading");
              Ext.Ajax.request({
                url: "api/mn_DcDebtorType.php",
                method: "POST",
                params: {
                  mode: butt,
                  id: record.data.id
                },
                success: function(result, request) {
                  var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                  if (jsonData.success == true) {
                    Ext.store.reload();
                  }
                  Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg); // alert massage error
                  Ext.getCmp("win-msg-delete").hide(); // hidden window-panel
                  Ext.getCmp("win-msg-delete").destroy(); // clear memory :: garbage collection
                },
                failure: function(result, request) {
                  Ext.MessageBox.alert("Failed", result.responseText); // connect error
                }
              });
            }
          },
          {
            text: Ext.GLOBAL_BU_CANCEL_TH,
            handler: function() {
              Ext.getCmp("win-msg-delete").hide();
              Ext.getCmp("win-msg-delete").destroy();
            }
          }
        ]
      }).show();
    }
  }; // controllTab

  // ================================ gridMain ================================ //
  cellClick = function(grid, rowIndex, columnIndex, e) {
    let record = grid.getStore().getAt(rowIndex);
    if (columnIndex == grid.getColumnModel().getIndexById("edit")) {
      controllTab(record, "edit");
    } else if (columnIndex == grid.getColumnModel().getIndexById("delete")) {
      controllTab(record, "DELETE");
    }
  }; //cellClick

  // gridMain
  const gridMain = new Ext.grid.GridPanel({
    region: "center",
    layout: "fit",
    title: "แสดงรายการ" + Ext.title_panel,
    id: "tabpanel1",
    border: false,
    stripeRows: true,
    loadMask: true,
    store: Ext.store,
    viewConfig: {
      emptyText: "ไม่มีข้อมูล..",
      deferEmptyText: false
    },
    tbar: [
      new Ext.ButtonGroup({
        xtype: "buttongroup",
        title: "ระบุเงื่อนไขในการค้นหาข้อมูล",
        columns: 1,
        defaults: { scale: "small", style: "float: right" },
        items: [
          {
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", text: "ค้นหาโดย : " },
              { xtype: "tbspacer", width: 4 },
              {
                id: "filter",
                xtype: "combo",
                width: 150,
                mode: "local",
                store: new Ext.data.SimpleStore({
                  fields: ["value", "text"],
                  data: [["c_code", "เลขที่เอกสาร"]]
                }),
                value: "c_code",
                valueField: "value",
                displayField: "text",
                allowBlank: false,
                editable: false,
                triggerAction: "all",
                typeAhead: false
              },
              { xtype: "tbspacer", width: 4 },
              {
                xtype: "textfield",
                id: "value-box",
                width: 200,
                fieldLabel: "fieldLabel",
                emptyText: "คำที่ต้องการค้นหา"
              }
            ]
          }
        ],
        buttonAlign: "left",
        buttons: [
          {
            text: "เพิ่มข้อมูล",
            iconCls: "icon-add",
            handler: function(grid, rowIndex, colIndex) {
              controllTab({}, "add");
            }
          },
          { xtype: "tbfill" },
          {
            text: "ค้นหา",
            iconCls: "icon-magnifier",
            handler: function() {
              var msg = "";
              if (msg == "") {
                if (Ext.getCmp("value-box").getValue() != "") {
                  Ext.store.setBaseParam("value", Ext.getCmp("value-box").getValue());
                  Ext.store.setBaseParam("filter", Ext.getCmp("filter").getValue());
                } else {
                  Ext.store.setBaseParam("value", "");
                  Ext.store.setBaseParam("filter", "");
                }
                Ext.store.setBaseParam("mode", "SEARCH");
                Ext.store.load();
              } else {
                Ext.Msg.alert("แจ้งเตือน", msg);
              }
            }
          }
        ]
      })
    ],
    columns: [
      new Ext.grid.RowNumberer({
        header: "ที่",
        width: 30,
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
          return "<button style='font-size:11px; cursor:pointer; color: green;'>แก้ไข</button>";
        }
      },
      {
        id: "delete",
        header: "-",
        sortable: false,
        align: "center",
        dataIndex: "id",
        renderer: function(value, metaData, record, row, col, store, gridView) {
          return "<button style='font-size:11px; cursor:pointer; color: red;'>ยกเลิกรายการ</button>";
        }
      },
      { header: "เลขที่เอกสาร", sortable: true, align: "center", width: 150, dataIndex: "c_code" },
      { id: "c_name", header: "ชื่อประเภทลูกหนี้", sortable: true, dataIndex: "c_name" },
      {
        header: "สถานะรายการ",
        sortable: true,
        align: "center",
        dataIndex: "i_enable",
        width: 170,
        renderer: function(value, metaData, record, row, col, store, gridView) {
          if (value == 1) {
            return "<font color=green>ใช้งาน</font>";
          } else {
            return "<font color=red>ไม่ใช้งาน</font>";
          }
        }
      },
      {
        header: "ผู้ทำรายการล่าสุด",
        sortable: true,
        dataIndex: "c_update_name"
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
        width: 150,
        dataIndex: "c_cost_update_name"
      },
      { width: 40, dataIndex: "" }
    ],
    autoExpandColumn: "c_name",
    bbar: Ext.pagingBar
  }); //gridMain

  /*====================== CENTER ======================*/
  center = new Ext.TabPanel({
    region: "center",
    border: false,
    //activeTab: 0, //default Tab
    id: "contenterCenter",
    defaults: { autoScroll: true },
    items: [gridMain]
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

  //   let myComboStores = [Ext.vw_customer_name, Ext.vw_detail_dc_emp, Ext.dc_acc, Ext.dc_acc_other, Ext.dc_cost, Ext.dc_tax2, Ext.dc_penalty];
  //   chkLoadingStore(myComboStores, "contenterCenter", function() {});
});
