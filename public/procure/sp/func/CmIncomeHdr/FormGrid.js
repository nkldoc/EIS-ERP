Ext.onReady(function () {
  Ext.QuickTips.init();
  /*===============================================*/

  switch (Ext.I_REC_MENU_TYPE) {
    case Ext.DATA_REC_MENU_TYPE_CASH:
      Ext.title_panel = " Load ใบเสร็จ (เงินสด)";
      Ext.title_panel_rec = "(เงินสด)";
      break;
    case Ext.DATA_REC_MENU_TYPE_CHEQUE:
      Ext.title_panel = " Load ใบเสร็จ (เช็ค)";
      Ext.title_panel_rec = "(เช็ค)";
      break;
    case Ext.DATA_REC_MENU_TYPE_TRANF:
      Ext.title_panel = " Load ใบเสร็จ (เงินโอน)";
      Ext.title_panel_rec = "(เงินโอน)";
      break;
    case Ext.DATA_REC_MENU_TYPE_BORROW_CASH:
      Ext.title_panel = " Load ใบเสร็จ คืนเงินยืม#(เงินสด)";
      Ext.title_panel_rec = "คืนเงินยืม#(เงินสด)";
      break;
    case Ext.DATA_REC_MENU_TYPE_BORROW_TRANF:
      Ext.title_panel = " Load ใบเสร็จ คืนเงินยืม#(เงินโอน)";
      Ext.title_panel_rec = "คืนเงินยืม#(เงินโอน)";
      break;
    default:
      Ext.title_panel = " Load ใบเสร็จ (OTHER)";
      Ext.title_panel_rec = "(อื่นๆ)";
      break;
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
              url: "api/mn_ImportCmIncomeHdr.php",
              method: "POST",
              params: {
                mode: mode,
                id: id,
              },
              success: function (result, request) {
                var jsonData = Ext.util.JSON.decode(result.responseText); // decode json
                if (jsonData.success == true) {
                  Ext.MessageBox.alert("Success", jsonData.msg); // alert massage success
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
      Ext.getCmp("saveHdr").hide();
      Ext.getCmp("add_dtl").hide();
      Ext.getCmp("dtl_menu").hide();
    } else {
      Ext.getCmp("add_dtl").show();
      Ext.getCmp("dtl_menu").hide();
      Ext.getCmp("saveHdr").show();
    }
  };

  const Preview_IMRC = function (id, c_code_gx) {
    new Ext.Window({
      title: "แสดงรายละเอียด Load ใบเสร็จ",
      id: "Preview_IMRC",
      modal: true,
      preventBodyReset: true,
      closable: true,
      autoScroll: true,
      maximized: true, // เต็มจอ auto
      html: '<iframe name="printf" src="../cm/preview/Pre_IMRC.php?id=' + id + '" style="width:100%; height:100%; border-style:hidden;"></iframe>',
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
          text: "&nbsp;&nbsp;PDF&nbsp;&nbsp;",
          iconCls: "icon-pdf",
          handler: function () {
            window.open("../lib/htmlToPdf_horizontal.php/JV_PDF.pdf?locat=" + encodeURI("cm/preview/Pre_IMRC&GX_CODE=" + c_code_gx + "&id=" + id));
          },
        },
        {
          text: Ext.GLOBAL_BU_BACK_TH,
          handler: function () {
            Ext.getCmp("Preview_IMRC").destroy();
          },
        },
      ],
    }).show();
  };

  const controllTab = function (record, butt) {
    Ext.select_row = record;
    Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not errer
    Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
    Ext.butt = butt;
    if (butt == "add") {
      let frmAdd = new formAdd();
      Ext.getCmp("contenterCenter").add(frmAdd);
      Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
      Ext.getCmp("role-form-mode").setValue("ADD");
    } else if (butt == "edit" || butt == "view") {
      Ext.dc_expense_budget_type.setBaseParam("dc_cost_ids", record.data.dc_cost_id);
      Ext.dc_map_bookbank_acc.setBaseParam("dc_expense_budget_type_ids", "");
      Ext.dc_map_bookbank_acc.load();
      Ext.dc_expense_budget_type.reload({
        callback: function () {
          // Ext.getCmp("dc_expense_budget_type_id").setValue(record.data.dc_expense_budget_type_id);
        },
      });
      // Ext.dc_map_bookbank_acc.setBaseParam("dc_bank_acc_hdr_id", record.data.dc_bank_acc_company_hdr_id);
      Ext.dc_map_bookbank_acc.load();
      if (Ext.I_REC_MENU_TYPE == Ext.DATA_REC_MENU_TYPE_TRANF || Ext.I_REC_MENU_TYPE == Ext.DATA_REC_MENU_TYPE_BORROW_TRANF) {
        // Ext.dc_map_bookbank_acc.setBaseParam("dc_map_bookbank_acc_ids", record.data.dc_bank_acc_company_id);
        // Ext.dc_map_bookbank_acc.reload({
        //   callback: function () {
        //     Ext.getCmp("dc_acc_id").setValue(record.data.dc_acc_id);
        //   },
        // });

        Ext.vw_dc_bank_acc_company_full1.setBaseParam("dc_cost_id_for_bookbank", record.data.dc_cost_id);
        Ext.vw_dc_bank_acc_company_full1.reload({
          callback: function () {
            Ext.getCmp("dc_bank_acc_company_id").setValue(record.data.dc_bank_acc_company_id);
          },
        });
      }

      if (Ext.I_REC_MENU_TYPE == Ext.DATA_REC_MENU_TYPE_CASH || Ext.I_REC_MENU_TYPE == Ext.DATA_REC_MENU_TYPE_CHEQUE) {
        Ext.gl_dc_config_cash_tranf.setBaseParam("dc_cost_ids", record.data.dc_cost_id);
        Ext.gl_dc_config_cash_tranf.reload({
          callback: function () {
            Ext.getCmp("gl_dc_config_id").setValue(record.data.gl_dc_config_id);
          },
        });
      }

      // ============ formAdd ============ //
      Ext.HDR_ID = record.data.id;
      Ext.HDR_c_yyyy_mm = record.data.c_yyyy_mm;
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
      if (record.get("c_code") != "") {
        controllTab(record, "view");
      }
    } else if (columnIndex == grid.getColumnModel().getIndexById("edit")) {
      if (record.get("top1_gx_id") == 0 && record.get("top_gx_id") == 0) {
        controllTab(record, "edit");
      }
    } else if (columnIndex == grid.getColumnModel().getIndexById("delete")) {
      if (record.get("top1_gx_id") > 0) {
        return "";
      } else if (record.get("i_enable") != 1) {
        return "";
      } else {
        deleteHdr(record.get("id"), "DELETE", "ต้องการยกเลิกรายการใช่หรือไม่ ?");
      }
    } else if (columnIndex == grid.getColumnModel().getIndexById("printIMRC")) {
      if (record.data.c_is_gen_code == "I") {
        Preview_IMRC(record.data.id, record.data.c_code);
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
                    ["c_code", "เลขที่ Load ใบเสร็จ"],
                    ["c_doc", "เอกสารอ้างอิง"],
                  ],
                }),
                value: "c_code",
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
              { xtype: "label", text: "วันที่ Load ใบเสร็จ : " },
              { xtype: "tbspacer", width: 4 },
              {
                id: "s_d_doc_date1",
                xtype: "datefield",
                width: 154,
                listeners: {
                  afterrender: function () {
                    var date = new Date();
                    date = new Date(date.getFullYear() + 543, date.getMonth() - 1, 1);
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
          {
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", text: "ส่วนงาน : " },
              { xtype: "tbspacer", width: 5 },
              new Ext.form.ComboBox({
                id: "s_dc_cost_id",
                name: "s_dc_cost_id",
                fieldLabel: "ส่วนงาน",
                store: Ext.store_search_dc_cost,
                valueField: "id",
                displayField: "c_name",
                mode: "local",
                triggerAction: "all",
                emptyText: "..กรุณาเลือกเมื่อต้องการค้นหา..",
                width: 300,
                forceSelection: true,
                selectOnFocus: true,
                typeAhead: false,
                listeners: {
                  afterrender: function () {},
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
              { xtype: "tbspacer", width: 100 },
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
          {
            xtype: "form",
            html: "<div style='padding:10px 20px; text-align: left;'><ul><li style='color:#005aff;'><a href=../cm/pdf/LoadCash.pdf target=_blank>*ใบแนบการโหลดใบเสร็จ*</a></li></ul></div>",
          },
          "-",
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

                Ext.store.setBaseParam("i_enable", Ext.getCmp("i_enableID").getValue());
                Ext.store.setBaseParam("dc_expense_budget_type_id", Ext.getCmp("s_dc_expense_budget_type_id").getValue());
                Ext.store.setBaseParam("d_doc_date1", Ext.util.Format.date(Ext.getCmp("s_d_doc_date1").getValue(), "Y-m-d"));
                Ext.store.setBaseParam("d_doc_date2", Ext.util.Format.date(Ext.getCmp("s_d_doc_date2").getValue(), "Y-m-d"));
                Ext.store.setBaseParam("s_dc_cost_id", Ext.getCmp("s_dc_cost_id").getValue());
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
          if (record.get("c_code") != "") {
            return "<button style='font-size:11px; cursor:pointer; color: blue;'>แสดง</button>";
          }
        },
      },
      {
        id: "edit",
        header: "-",
        sortable: false,
        align: "center",
        width: 50,
        dataIndex: "id",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          if (record.get("i_enable") == 1 && record.get("top1_gx_id") == "0" && record.get("top_gx_id") == 0) {
            return "<button style='font-size:11px; cursor:pointer; color: green;'>แก้ไข</button>";
          } else {
            return "";
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
          if (record.get("top1_gx_id") > 0) {
            return "GX/GL มีสถานะใช้งาน";
          } else if (record.get("i_enable") != 1) {
            return "ยกเลิกรายการ";
          } else {
            return "<button style='font-size:11px; cursor:pointer; color: red;'>ลบ</button>";
          }
        },
      },
      { header: "เลขที่ Load ใบเสร็จ", sortable: false, align: "center", width: 200, dataIndex: "c_code" },
      { header: "ประเภทการรับเงิน", sortable: false, align: "center", width: 150, dataIndex: "c_receive_type_name" },
      {
        header: "-",
        id: "printIMRC",
        width: 50,
        sortable: true,
        dataIndex: "c_is_gen_code",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "align='center'";
          if (record.data.c_is_gen_code == "I" && record.data.i_enable == "1") {
            return '<div style="cursor:pointer"><img src="../images/icons/printer_mono.png" style="margin-right:1px;"); /><div>';
          }
        },
      },
      {
        id: "top1_gx_id",
        header: "สถานะบัญชี",
        sortable: false,
        align: "center",
        width: 100,
        dataIndex: "id",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          if (record.get("top1_gx_id") > 0) {
            return "ลงบัญชี";
          } else if (record.get("top1_gx_id") == 0 && record.get("c_code") == "" && record.get("i_enable") == 2) {
            return "ยกเลิกใบเสร็จ";
          } else if (record.get("top1_gx_id") == 0 && record.get("c_code") != "") {
            return "รอลงบัญชี";
          } else {
            return "-";
          }
        },
      },
      { header: "ส่วนงาน", sortable: true, width: 200, dataIndex: "c_cost_name" },
      { header: "แหล่งเงิน", sortable: true, width: 250, dataIndex: "dc_expense_budget_type_dtl_name" },
      { header: "เอกสารอ้างอิง", sortable: true, width: 130, dataIndex: "c_doc" },
      {
        header: "วันที่นำเข้า",
        sortable: true,
        align: "center",
        dataIndex: "d_import_date",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          return value != "" ? shortThaiDate(value) : "";
        },
      },
      {
        header: "จำนวนเงิน DR",
        sortable: false,
        align: "right",
        width: 100,
        dataIndex: "f_sum_dtl_dr",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          return floatRenderer(floatMinus(value, 2));
        },
      },
      {
        header: "จำนวนเงิน CR",
        sortable: false,
        align: "right",
        width: 100,
        dataIndex: "f_sum_dtl_cr",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          return floatRenderer(floatMinus(value, 2));
        },
      },
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
  //, Ext.vw_dc_bank_acc_company_full2
  let myComboStores = [Ext.dc_expense_budget_type, Ext.dc_map_bookbank_acc, Ext.dc_expense_budget_type_all, Ext.vw_dc_bank_acc_company_full1, Ext.store_search_dc_cost, Ext.dc_cost];
  chkLoadingStore(myComboStores, "contenterCenter", function () {});
});
