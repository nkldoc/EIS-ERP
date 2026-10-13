Ext.HDR_ID = null;
Ext.onReady(function() {
  Ext.QuickTips.init();
  /*===============================================*/
  Ext.title_panel = "จัดทำเช็ค (ยกเลิก)";
  /*===============================================*/
  // pagingBar
  Ext.pagingBar = new Ext.PagingToolbar({
    pageSize: 20,
    store: Ext.store,
    displayInfo: true,
    displayMsg: "Displaying topics {0} - {1} of {2}"
  });

  const Preview = function(id) {
    let url = "../po/preview/Pre_Working.php";
    new Ext.Window({
      title: "แสดงสถานะใบขอเบิก",
      id: "Preview",
      modal: true,
      preventBodyReset: true,
      closable: true,
      autoScroll: true,
      maximized: true, // เต็มจอ auto
      html: '<iframe name="printf" src="' + url + "?id=" + id + '" style="width:100%; height:100%; border-style:hidden;"></iframe>',
      buttonAlign: "left",
      buttons: [
        {
          text: "&nbsp;" + Ext.GLOBAL_BU_PRINT_TH + "&nbsp;",
          iconCls: "printer_mono",
          handler: function() {
            document.printf.window.print();
          }
        },
        {
          text: Ext.GLOBAL_BU_BACK_TH,
          handler: function() {
            Ext.getCmp("Preview").destroy();
          }
        }
      ]
    }).show();
  };

  const controllTab = function(record, butt) {
    Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
    Ext.butt = butt;
    if (butt == "edit" || butt == "view") {
      Ext.HDR_ID = record.data.id;
      Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
      // ============ PanelDtl ============ //
      let PanelDtl = new formPanelDtl();
      Ext.getCmp("contenterCenter").add(PanelDtl);
      Ext.getCmp("contenterCenter").setActiveTab(PanelDtl);

      try {
        let index_id = Ext.store.findExact("id", Ext.HDR_ID);
        let dd = Ext.store.data.items[index_id].data;
        Ext.getCmp("dtl_c_approve").setValue(dd.c_approve);
        Ext.getCmp("dtl_c_creditor").setValue(dd.creditor_name);
      } catch (err) {}
    }
  }; // controllTab

  // ================================ gridMain ================================ //
  cellClick = function(grid, rowIndex, columnIndex, e) {
    let record = grid.getStore().getAt(rowIndex);
    if (columnIndex == grid.getColumnModel().getIndexById("edit")) {
      controllTab(record, "edit");
    } else if (columnIndex == grid.getColumnModel().getIndexById("print")) {
      Preview(record.data.id);
    }
  }; //cellClick

  const search = function() {
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
      Ext.store.setBaseParam("dc_expense_budget_type_id", Ext.getCmp("s_dc_expense_budget_type_id").getValue());
      Ext.store.load();
    } else {
      Ext.Msg.alert("แจ้งเตือน", msg);
    }
  };
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
      {
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
                  data: [
                    ["c_approve", "เลขที่ฏีกา"],
                    ["c_code_ref", "เลขที่ขอเบิก"]
                  ]
                }),
                value: Ext.I_STATUS != 4 ? "c_approve" : "c_code_ref",
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
          },
          {
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", text: "แหล่งเงิน : " },
              { xtype: "tbspacer", width: 4 },
              new Ext.form.ComboBox({
                id: "s_dc_expense_budget_type_id",
                mode: "local",
                store: Ext.dc_expense_budget_type,
                valueField: "id",
                displayField: "c_name",
                triggerAction: "all",
                forceSelection: true,
                selectOnFocus: true,
                typeAhead: false,
                emptyText: "กรุณาเลือก...",
                width: 354,
                value: "0",
                listeners: {
                  afterrender: function() {
                    this.fn = function() {};
                  },
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
              })
            ]
          }
        ],
        buttonAlign: "left",
        buttons: [
          { xtype: "tbfill" },
          {
            text: "ค้นหา",
            iconCls: "icon-magnifier",
            handler: function() {
              search();
            }
          }
        ]
      }
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
        width: 100,
        dataIndex: "id",
        renderer: function(value, metaData, record, row, col, store, gridView) {
          return "<button style='font-size:11px; cursor:pointer; color: green;'>แก้ไขเช็ค</button>";
        }
      },
      {
        header: "-",
        id: "print",
        sortable: true,
        dataIndex: "id",
        width: 40,
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "align='center'";
          return "<div style='cursor:pointer'><img src='../images/icons/printer_mono.png' style='margin-right:1px;' /><div>";
        }
      },
      {
        header: "เลขที่ใบขอเบิก",
        sortable: false,
        align: "center",
        width: 100,
        dataIndex: "c_code",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = 'style="font-weight: bold; color: green;"';
          return value;
        }
      },
      {
        header: "เลขที่ฏีกา",
        sortable: false,
        align: "center",
        width: 100,
        dataIndex: "c_approve",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          return value;
        }
      },
      {
        header: "วันที่อนุมัติฏีกา",
        sortable: true,
        align: "center",
        dataIndex: "d_approve_date",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          return value != "" ? shortThaiDate(value) : "";
        }
      },
      {
        header: "หน่วยงาน",
        sortable: false,
        align: "center",
        width: 200,
        dataIndex: "cost_name",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = 'style="text-align: left;"';
          return value;
        }
      },
      {
        header: "แหล่งเงิน",
        sortable: false,
        align: "center",
        width: 200,
        dataIndex: "budget_name",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = 'style="text-align: left;"';
          return value;
        }
      },
      {
        header: "รายการย่อย",
        sortable: false,
        align: "center",
        width: 200,
        dataIndex: "po_expense_name",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = 'style="text-align: left;"';
          return value;
        }
      },
      {
        header: "จำนวนเงินขอเบิก",
        sortable: false,
        align: "center",
        width: 100,
        dataIndex: "f_total",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = 'style="color: blue; text-align: right;"';
          return floatRenderer(floatMinus(value, 2));
        }
      },
      { width: 40, dataIndex: "" }
    ],
    //     // autoExpandColumn: "c_name",
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
  let myComboStores = [Ext.dc_expense_budget_type];
  chkLoadingStore(myComboStores, "contenterCenter", function() {});

  new Ext.KeyNav("tabpanel1", {
    enter: function(e) {
      search();
    },
    scope: this
  });
});
