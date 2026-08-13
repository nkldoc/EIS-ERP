Ext.onReady(function () {
  Ext.QuickTips.init();
  /*===============================================*/
  if (Ext.ITYPE_JV) {
    Ext.title_panel = "นำเข้าใบเบิกแบบพิเศษ (Vision Net)";
  } else {
    Ext.title_panel = "บันทึกบัญชีตั้งหนี้ใบเบิกแบบพิเศษ (Vision Net)";
  }
  /*===============================================*/
  // pagingBar
  Ext.pagingBar = new Ext.PagingToolbar({
    pageSize: 20,
    store: Ext.store,
    displayInfo: true,
    displayMsg: "Displaying topics {0} - {1} of {2}",
  });

  const deleteHdr = function (id, mode, html = "ท่านต้องการที่จะลบข้อมูล ?") {
    new Ext.Window({
      id: "win-msg-delete",
      title: "แจ้งเตือน",
      modal: true,
      width: 250,
      height: 130,
      html: html,
      buttons: [
        {
          text: "Confirm",
          handler: function () {
            Ext.getCmp("win-msg-delete").getEl().mask("Please wait...", "x-mask-loading");
            Ext.Ajax.request({
              url: "api/mn_ImpRequestVSNNone.php",
              method: "POST",
              params: {
                mode: mode,
                id: id,
              },
              success: function (result, request) {
                var jsonData = Ext.util.JSON.decode(result.responseText); // decode json
                if (jsonData.success == true) { 
                } else {
                  Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                }
                Ext.getCmp("win-msg-delete").hide(); // hidden window-panel
                Ext.getCmp("win-msg-delete").destroy(); // clear memory :: garbage collection
                Ext.store.reload();
                Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not errer
                Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
              },
              failure: function (result, request) {
                Ext.MessageBox.alert("Failed", result.responseText); // connect error
              },
            });
          },
        },
        {
          text: Ext.GLOBAL_BU_BACK_TH,
          handler: function () {
            Ext.getCmp("win-msg-delete").hide();
            Ext.getCmp("win-msg-delete").destroy();
          },
        },
      ],
    }).show();
  };

  const DisbledButton = function (t, record) {
    if (t) {
      Ext.getCmp("saveDtl").hide();
      Ext.getCmp("saveDtlGen").hide();
      Ext.getCmp("saveDtlGenJV").hide();
      Ext.getCmp("saveHdr").hide();
      Ext.getCmp("add_dtl").hide();
      Ext.getCmp("dtl_menu").hide();
      Ext.getCmp("saveDtlGen").hide();
    } else {
      if (Ext.ITYPE_JV) {
        Ext.getCmp("saveDtlGenJV").hide();
      } else {
        Ext.getCmp("saveDtlGenJV").show();
      }

      // vsn
      if (record.data.i_system == 2) {
        Ext.getCmp("add_dtl").show();
        Ext.getCmp("dtl_menu").show();
      } else {
        Ext.getCmp("add_dtl").hide();
        Ext.getCmp("dtl_menu").hide();
      }

      Ext.getCmp("saveHdr").show();
    }
  };

  const Preview = function (id) {
    new Ext.Window({
      title: "แสดงรายละเอียดสมุดรายวัน",
      id: "Preview",
      modal: true,
      preventBodyReset: true,
      closable: true,
      autoScroll: true,
      maximized: true, // เต็มจอ auto
       html: '<iframe name="printf" src="../gl/preview/Pre_GlTranHdr.php?id=' + id + '" style="width:100%; height:100%; border-style:hidden;"></iframe>',
      buttonAlign: "left",
      buttons: [
        {
          text: "&nbsp;" + Ext.GLOBAL_BU_PRINT_TH + "&nbsp;",
          iconCls: "printer_mono",
          handler: function () {
            document.printf.window.print();
          },
        },
        {
          text: Ext.GLOBAL_BU_BACK_TH,
          handler: function () {
            Ext.getCmp("Preview").destroy();
          },
        },
      ],
    }).show();
  };

  const controllTab = function (record, butt) {
    Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not errer
    Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
    Ext.butt = butt;
    if (butt == "add") {
      let frmAdd = new formAdd();
      Ext.getCmp("contenterCenter").add(frmAdd);
      Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
      Ext.getCmp("role-form-mode").setValue("ADD");
    } else if (butt == "edit" || butt == "view") {
      // ============ formAdd ============ //
      Ext.HDR_ID = record.data.id;
      let frmAdd = new formAdd(record.data);
      Ext.getCmp("contenterCenter").add(frmAdd);
      Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
      Ext.getCmp("role-form-mode").setValue("EDIT");
      Ext.getCmp("form-widgets").getForm().loadRecord(record);

      // ============ PanelDtl ============ //
      let PanelDtl = new formPanelDtl();
      Ext.getCmp("contenterCenter").add(PanelDtl);
      Ext.getCmp("contenterCenter").setActiveTab(PanelDtl);

      if (butt == "view") {
        DisbledButton(true, record);
      } else {
        DisbledButton(false, record);
      }
    }  
  }; // controllTab

  // ================================ gridMain ================================ //
  cellClick = function (grid, rowIndex, columnIndex, e) {
    let record = grid.getStore().getAt(rowIndex);
    if (columnIndex == grid.getColumnModel().getIndexById("view")) {
      controllTab(record, "view");
    } else if (columnIndex == grid.getColumnModel().getIndexById("edit")) {
      if (!(record.get("i_is_post") > 1) && record.data.i_enable == 1) {
        controllTab(record, "edit");
      }
    }   else if (columnIndex == grid.getColumnModel().getIndexById("delete")) {
      if (record.get("i_is_post") > 1 && record.get("i_enable_gx") == 1) {
        if (Ext.ITYPE_JV) {
        } else {
          if (record.get("i_is_post")==2)
          {
            deleteHdr(record.get("id"), "DELETE_GX");
          }
        }
      } else if (record.get("i_enable") != 1) {
      } else {
        if (record.get("i_system") == 1) {
          deleteHdr(record.get("id"), "DELETE", "ต้องการส่งคืนรายการใช่หรือไม่ ?");
        } else if (Ext.ITYPE_JV) {
          deleteHdr(record.get("id"), "DELETE");
        }
      }
    }  else if (columnIndex == grid.getColumnModel().getIndexById("print")) {
      if (record.data.i_is_post > 1) {
        Preview(record.data.gl_tran_hdr_rq_id);
      }
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
      deferEmptyText: false,
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
                    ["c_period_no", "เอกสารอ้างอิง"],
                    ["c_code", "เลขที่นำเข้าใบเบิกพิเศษ Vision Net"]
                    
                  ],
                }),
                value: "c_period_no",
                valueField: "value",
                displayField: "text",
                allowBlank: false,
                editable: false,
                triggerAction: "all",
                typeAhead: false,
              },
              { xtype: "tbspacer", width: 4 },
              {
                xtype: "textfield",
                id: "value-box",
                width: 200,
                fieldLabel: "fieldLabel",
                emptyText: "คำที่ต้องการค้นหา",
              },
            ],
          },
          {
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", text: "สถานะผ่านรายการบัญชี : " },
              { xtype: "tbspacer", width: 4 },
              {
                id: "s_i_post",
                xtype: "combo",
                width: 354,
                mode: "local",
                store: new Ext.data.SimpleStore({
                  fields: ["value", "text"],
                  data: [
                    ["0", "- เลือกรายการทั้งหมด -"],
                    ["1", "รายการรอลงบัญชี"],
                    ["2", "ยังไม่ผ่านรายการ"],
                    ["3", "ผ่านรายการแล้ว"],
                  ],
                }),
                value: "0",
                valueField: "value",
                displayField: "text",
                allowBlank: false,
                editable: false,
                triggerAction: "all",
                typeAhead: false,
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
              },
            ],
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
            ],
          },
          {
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", text: "วันที่เอกสาร : " },
              { xtype: "tbspacer", width: 4 },
              {
                id: "s_d_doc_date1",
                xtype: "datefield",
                width: 154,
                listeners: {
                  afterrender: function () {
                    var date = new Date();
                    date = new Date(date.getFullYear()+543, date.getMonth()-2, 1); 
                    this.setValue(date);
                  },
                },
              },
              { xtype: "tbspacer", width: 5 },
              { xtype: "label", text: "ถึงวันที่ : " },
              { xtype: "tbspacer", width: 4 },
              {
                id: "s_d_doc_date2",
                xtype: "datefield",
                width: 154,
                listeners: {
                  afterrender: function () {
                    this.setValue(addY(543));
                  },
                },
              },
            ],
          },
          {
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", text: "สถานะ : " },
              { xtype: "tbspacer", width: 4 },
              {
                id: "i_enableID",
                xtype: "combo",
                width: 154,
                fieldLabel: "สถานะ",
                mode: "local",
                store: new Ext.data.SimpleStore({
                  fields: ["value", "text"],
                  data: [
                    ["0", "- เลือกทั้งหมด -"],
                    ["1", "ใช้งาน"],
                    ["2", "ไม่ใช้งาน"],
                  ],
                }),
                value: "1",
                valueField: "value",
                displayField: "text",
                allowBlank: false,
                editable: false,
                triggerAction: "all",
                typeAhead: false,
              },
              { xtype: "tbspacer", width: 201 },
            ],
          },
        ],
        buttonAlign: "left",
        buttons: [
          {
            text: "เพิ่มข้อมูล",
            id: "buAdd",
            iconCls: "icon-add",
            hidden: Ext.ITYPE_JV ? false : true,
            handler: function (grid, rowIndex, colIndex) {
              controllTab({}, "add");
            },
          },
          { xtype: "tbfill" },
          {
            text: "ค้นหา",
            iconCls: "icon-magnifier",
            handler: function () {
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
                Ext.store.setBaseParam("i_post", Ext.getCmp("s_i_post").getValue());
                Ext.store.setBaseParam("i_enable", Ext.getCmp("i_enableID").getValue());

                Ext.store.setBaseParam("dc_expense_budget_type_id", Ext.getCmp("s_dc_expense_budget_type_id").getValue());
                Ext.store.setBaseParam("d_doc_date1", Ext.util.Format.date(Ext.getCmp("s_d_doc_date1").getValue(), "Y-m-d"));
                Ext.store.setBaseParam("d_doc_date2", Ext.util.Format.date(Ext.getCmp("s_d_doc_date2").getValue(), "Y-m-d"));
                Ext.store.load();
              } else {
                Ext.Msg.alert("แจ้งเตือน", msg);
              }
            },
          },
        ],
      },
    ],
    columns: [
      new Ext.grid.RowNumberer({
        header: "ที่",
        width: 30,
        renderer: function (value, metaData, record, row, col, store, gridView) {
          return record.get("no");
        },
      }),
      {
        id: "view",
        header: "-",
        sortable: false,
        align: "center",
        width: 50,
        dataIndex: "id",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          return "<button style='font-size:11px; cursor:pointer; color: blue;'>แสดง</button>";
        },
      },
      {
        id: "edit",
        header: "-",
        sortable: false,
        align: "center",
        width: 100,
        dataIndex: "id",
        renderer: function (value, metaData, record, row, col, store, gridView) {
 
          if (Ext.ITYPE_JV)
          {
            if ((record.get("i_enable") == 2) || (record.get("i_status") == 3) || (record.get("i_status") == 4)) {
              return "";
            }  else {
              return "<button style='font-size:11px; cursor:pointer; color: green;'>แก้ไข</button>";
            }
          }
          else  
          {
            if ((record.get("i_status") == 2) || (record.get("i_status") == 3))
            {
              return "<button style='font-size:11px; cursor:pointer; color: green;'>บันทึกบัญชี</button>";
            }
            else if (record.get("i_status") == 4)
            {
              return "";
            }
          }
          
        },
      }, 
      {
        id: "delete",
        header: "-",
        sortable: false,
        align: "center",
        width: 100,
        dataIndex: "id",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          if (record.get("i_is_post") > 1 && record.get("i_enable_gx") == 1) {
            if (Ext.ITYPE_JV) {
              return "GX มีสถานะใช้งาน";
            } else {
              //MENU ลงบัญชี 
              if (record.data.i_is_post == 2) {
                return "<button style='font-size:11px; cursor:pointer; color: red;'>ยกเลิก GX</button>"; 
              } else {
                str = "";
              } 
            }
          } else if (record.get("i_enable") != 1) {
            return "ยกเลิกรายการ";
          } else {
            if (record.get("i_system") == 1) {
              return "<button style='font-size:11px; cursor:pointer; color: red;'>ส่งคืนรายการ</button>";
            } else if (Ext.ITYPE_JV) {
              return "<button style='font-size:11px; cursor:pointer; color: red;'>ลบ</button>";
            }
          }
        },
      }, 
      {
        header: "เลขที่นำเข้าใบเบิกพิเศษ Vision Net",
        sortable: false,
        align: "center",
        dataIndex: "c_code",
        width: 120,
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          return value;
        }
      }   
      ,{ header: "เอกสารอ้างอิง", sortable: true, width: 130, dataIndex: "c_period_no" },
      { header: "แหล่งเงิน", sortable: true, width: 130, dataIndex: "dc_expense_budget_type" },
      {
        header: "วันที่นำเข้าใบเบิก พิเศษ",
        sortable: true,
        align: "center",
        dataIndex: "d_doc_date",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          return value != "" ? shortThaiDate(value) : "";
        },
      },
      { header: "หน่วยงาน", sortable: true, width: 130, dataIndex: "dc_cost_acc" },
      {
        header: "สถานะใช้งาน",
        sortable: true,
        align: "center",
        dataIndex: "i_enable",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          if (value == 1) {
            return "<span style='color:green;'>" + record.data.show_enable + "</span>";
          } else {
            return "<span style='color:red;'>" + record.data.show_enable + "</span>";
          }
        },
      },
      {
        header: "วันที่สร้าง",
        sortable: true,
        align: "center",
        dataIndex: "d_create",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          return value != "" ? shortThaiDate(value) : "";
        },
      },
      { header: "ผู้ทำรายการล่าสุด", sortable: true, dataIndex: "dc_user_update_id" },
      {
        header: "วันที่ทำรายการล่าสุด",
        sortable: true,
        align: "center",
        dataIndex: "d_update",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          return value != "" ? shortThaiDate(value) : "";
        },
      },
      { header: "หน่วยงานที่ทำรายการล่าสุด", sortable: true, width: 200, dataIndex: "dc_user_update_cost_id" },
      { width: 40, dataIndex: "" },
    ],
    // autoExpandColumn: "c_name",
    bbar: Ext.pagingBar,
  }); //gridMain
  /*====================== CENTER ======================*/
  center = new Ext.TabPanel({
    region: "center",
    border: false,
    //activeTab: 0, //default Tab
    id: "contenterCenter",
    defaults: { autoScroll: true },
    items: [gridMain],
  });
  // SET ref Grid&Tab
  Ext.getCmp("tabpanel1").on("cellclick", cellClick, this);
  // SetTab Controller Loads
  Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
  /*====================== RENDER ======================*/
  new Ext.Viewport({
    layout: "border",
    items: [center],
  });
  let myComboStores = [Ext.dc_expense_budget_type, Ext.dc_expense_budget_type_all, Ext.dc_expense_group_vsn, Ext.dc_expense_acc_vsn_full,Ext.gl_dc_config_creditor,Ext.storeItems,Ext.store_dc_acc_last];
  chkLoadingStore(myComboStores, "contenterCenter", function () {});
});
