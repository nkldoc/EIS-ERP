Ext.onReady(function() {
  Ext.QuickTips.init();
  //   /*===============================================*/
  if (typeMenu == "EP") {
    Ext.title_panel = "ระบุเช็คจ่าย (e-PHIS)";
  } else {
    Ext.title_panel = "ระบุเช็คจ่าย (Vision Net)";
  }
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
    Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
    Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelCheque"), true) || {}; // null obj not errer
    Ext.butt = butt;
    if (butt == "edit" || butt == "view") {
      // ============ formAdd ============ //
      Ext.HDR_ID = record.data.id;
      let frmAdd = new formAdd(record.data);
      Ext.getCmp("contenterCenter").add(frmAdd);
      Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
      Ext.getCmp("role-form-mode").setValue("EDIT");
      Ext.getCmp("form-widgets")
        .getForm()
        .loadRecord(record);
      // ============ PanelDtl ============ //
      let PanelDtl = new formPanelDtl();
      Ext.getCmp("contenterCenter").add(PanelDtl);
      Ext.getCmp("contenterCenter").setActiveTab(PanelDtl);
    }
  }; // controllTab

  // ================================ gridMain ================================ //
  cellClick = function(grid, rowIndex, columnIndex, e) {
    let record = grid.getStore().getAt(rowIndex);
    if (columnIndex == grid.getColumnModel().getIndexById("edit")) {
      controllTab(record, "edit");
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
                    ["c_code", "เลขที่ค่าใช้จ่าย"],
                    [typeMenu == "EP" ? "c_expense_period_no" : "c_expense_vsn_period_no", "เอกสารค่าใช้จ่ายอ้างอิง"]
                  ]
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
          },
          {
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", text: "แหล่งเงิน : " },
              { xtype: "tbspacer", width: 4 },
              new Ext.form.ComboBox({
                id: "s_dc_expense_budget_type_id",
                store: Ext.dc_expense_budget_type_all,
                valueField: "id",
                displayField: "c_name",
                mode: "local",
                triggerAction: "all",
                emptyText: "กรุณาเลือก...",
                width: 354,
                forceSelection: true,
                selectOnFocus: true,
                typeAhead: false,
                value: 0,
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
              })
            ]
          },
          {
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", text: "วันที่จ่ายเงิน : " },
              { xtype: "tbspacer", width: 4 },
              {
                id: "s_d_doc_date1",
                xtype: "datefield",
                width: 153,
                listeners: {
                  afterrender: function() {
                    var date = new Date();
                    date = new Date(date.getFullYear() + 543, 1, 1);
                    this.setValue(date);
                  }
                }
              },
              { xtype: "tbspacer", width: 6 },
              { xtype: "label", text: "ถึงวันที่ : " },
              { xtype: "tbspacer", width: 4 },
              {
                id: "s_d_doc_date2",
                xtype: "datefield",
                width: 153,
                listeners: {
                  afterrender: function() {
                    this.setValue(addY(543));
                  }
                }
              }
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
                Ext.store.setBaseParam("d_doc_date1", Ext.util.Format.date(Ext.getCmp("s_d_doc_date1").getValue(), "Y-m-d"));
                Ext.store.setBaseParam("d_doc_date2", Ext.util.Format.date(Ext.getCmp("s_d_doc_date2").getValue(), "Y-m-d"));
                Ext.store.load();
              } else {
                Ext.Msg.alert("แจ้งเตือน", msg);
              }
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
          return "<button style='font-size:11px; cursor:pointer; color: green;'>ระบุเช็คจ่าย</button>";
        }
      },
      {
        header: "เลขที่ค่าใช้จ่าย",
        sortable: false,
        align: "center",
        width: 120,
        renderer: function(value, metaData, record, row, col, store, gridView) {
          let c_code = "";

          if (record.data.i_post == 2) {
            c_code = record.data.c_code;
            return "<font color=red>" + c_code + "</font>";
          } else if (record.data.i_post == 3) {
            c_code = record.data.c_gx_code;
            return "<font color=green>" + c_code + "</font>";
          } else {
            return c_code;
          }
        }
      },
      {
        header: "สถานะผ่านรายการบัญชี",
        sortable: false,
        align: "center",
        width: 120,
        renderer: function(value, metaData, record, row, col, store, gridView) {
          let str = "";

          if (record.data.i_post == 2) {
            str = "ยังไม่ผ่านรายการ";
          } else if (record.data.i_post == 3) {
            str = "ผ่านรายการแล้ว";
          } else {
            str = "รายการรอลงบัญชี";
          }

          return str;
        }
      },
      { header: "เอกสารค่าใช้จ่ายอ้างอิง", sortable: true, align: "center", width: 130, dataIndex: typeMenu == "EP" ? "c_expense_period_no" : "c_expense_vsn_period_no" },
      { header: "แหล่งเงิน", sortable: true, width: 300, align: "center", dataIndex: "dc_expense_budget_type_name" },
      {
        header: "วันที่จ่ายเงิน",
        sortable: true,
        align: "center",
        dataIndex: "d_doc_date",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          return value != "" ? shortThaiDate(value) : "";
        }
      },
      {
        header: "สถานะใช้งาน",
        sortable: true,
        align: "center",
        dataIndex: "i_enable",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          if (value == 1) {
            return "<span style='color:green;'>" + record.data.show_enable + "</span>";
          } else {
            return "<span style='color:red;'>" + record.data.show_enable + "</span>";
          }
        }
      },
      { header: "ผู้ทำรายการล่าสุด", sortable: true, dataIndex: "dc_user_update_id" },
      {
        header: "วันที่ทำรายการล่าสุด",
        sortable: true,
        align: "center",
        dataIndex: "d_update",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          return value != "" ? shortThaiDate(value) : "";
        }
      },
      { header: "หน่วยงานที่ทำรายการล่าสุด", sortable: true, dataIndex: "dc_user_update_cost_id", width: 150 },
      { width: 40, dataIndex: "" }
    ],
    //     // autoExpandColumn: "c_name",
    bbar: Ext.pagingBar
  }); //gridMain
  /* ====================== CENTER ====================== */
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
  let myComboStores = [Ext.dc_expense_budget_type_all, Ext.vw_dc_bank_acc_company_full, Ext.dc_expense_budget_type];
  chkLoadingStore(myComboStores, "contenterCenter", function() {});
});
