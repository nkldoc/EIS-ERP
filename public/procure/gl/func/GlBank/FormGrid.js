Ext.onReady(function() {
  Ext.QuickTips.init();

  /*===============================================*/
  if (CANCEL_GL == true) {
    Ext.title_panel = "ยกเลิกบันทึกบัญชีโอนระหว่างธนาคาร";
  } else if (ITYPE_CHEQUE == true) {
    Ext.title_panel = "ระบุเช็คจ่ายธนาคาร";
  } else {
    Ext.title_panel = "โอนระหว่างธนาคาร";
  }
  /*===============================================*/
  // pagingBar
  Ext.pagingBar = new Ext.PagingToolbar({
    pageSize: 20,
    store: Ext.store,
    displayInfo: true,
    displayMsg: "Displaying topics {0} - {1} of {2}"
  });

  const deleteHdr = function(id, mode) {
    new Ext.Window({
      id: "win-msg-delete",
      title: "แจ้งเตือน",
      modal: true,
      width: 250,
      height: 130,
      html: "ท่านต้องการที่จะลบข้อมูล ?",
      buttons: [
        {
          text: "Confirm",
          handler: function() {
            Ext.getCmp("win-msg-delete")
              .getEl()
              .mask("Please wait...", "x-mask-loading");
            Ext.Ajax.request({
              url: "api/mn_GlBank.php",
              method: "POST",
              params: {
                mode: mode,
                id: id
              },
              success: function(result, request) {
                var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                if (jsonData.success == true) {
                  Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg); // alert massage success
                  Ext.store.reload();
                } else {
                  Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg); // alert massage error
                }
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
          text: Ext.GLOBAL_BU_BACK_TH,
          handler: function() {
            Ext.getCmp("win-msg-delete").hide();
            Ext.getCmp("win-msg-delete").destroy();
          }
        }
      ]
    }).show();
  };

  const DisbledButton = function(t, record) {
    if (t) {
      Ext.getCmp("saveHdr").hide();
    } else {
      Ext.getCmp("saveHdr").show();
    }
  };

  const Preview = function(id) {
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
    Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not errer
    Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
    Ext.butt = butt;
    if (butt == "add") {
      Ext.HDR_ID = null;
      var frmAdd = new formAdd();

      Ext.getCmp("contenterCenter").add(frmAdd);
      Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
      Ext.getCmp("role-form-mode").setValue("ADD");

      Ext.getCmp("GENCODE").hide();
    } else if (butt == "edit" || butt == "view") {
      Ext.HDR_ID = record.data.id;
      var frmAdd = new formAdd();

      Ext.getCmp("contenterCenter").add(frmAdd);
      Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
      Ext.getCmp("role-form-mode").setValue("EDIT");
      Ext.getCmp("form-widgets")
        .getForm()
        .loadRecord(record);

      if (butt == "view") {
        DisbledButton(true, record);
        Ext.getCmp("Budc_bank_acc_company_id_target").disable(true);
        Ext.getCmp("Budc_bank_acc_company_id_source").disable(true);
        Ext.getCmp("Budc_bank_acc_company_id_source2").disable(true);
      } else {
        DisbledButton(false, record);
        Ext.getCmp("GENCODE").show();
      }
      Ext.getCmp("GENCODE").hide();
      Ext.getCmp("dc_bank_acc_company_id_target_Name").setValue(record.data.dc_bank_acc_company_id_target_name);
      Ext.getCmp("dc_bank_acc_company_id_source_Name").setValue(record.data.dc_bank_acc_company_id_source_name);
      Ext.getCmp("dc_bank_acc_company_id_source2_Name").setValue(record.data.dc_bank_acc_company_id_source2_name);

      Ext.getCmp("f_money").fn();
      Ext.getCmp("dc_acc_id").fn(true);
    } else if (butt == "edit_mini") {
      Ext.HDR_ID = record.data.id;
      popMiniDtl(record);
    } else if (butt == "cheque") {
      Ext.HDR_ID = record.data.id;
      Ext.dc_cheque.setBaseParam("gl_bank_id", record.data.id);
      Ext.dc_cheque.setBaseParam("dc_bank_acc_company_id_source", record.data.dc_bank_acc_company_id_source);
      // ============ PanelDtl ============ //
      let PanelDtl = new formPanelDtl();
      Ext.getCmp("contenterCenter").add(PanelDtl);
      Ext.getCmp("contenterCenter").setActiveTab(PanelDtl);

      let f_money = parseFloat(record.data.f_money);
      Ext.getCmp("total_bank").setValue(floatRenderer(f_money.toFixed(2)));
    } else if (butt == "DELETE" || butt == "CANCEL") {
      deleteHdr(record.data.id, butt);
    } else if (butt == "CANCEL_GL") {
      Ext.HDR_ID = record.data.id;
      popCancel(record);
    }
  }; // controllTab

  // ================================ gridMain ================================ //
  cellClick = function(grid, rowIndex, columnIndex, e) {
    var record = grid.getStore().getAt(rowIndex);
    if (columnIndex == grid.getColumnModel().getIndexById("view")) {
      if (record.data.i_status == 2) {
      } else if (ITYPE_CHEQUE == false && CANCEL_GL == false) controllTab(record, "view");
    } else if (columnIndex == grid.getColumnModel().getIndexById("edit")) {
      if (record.data.i_status == 2) {
      } else if ((record.data.i_is_post_bank == 3 || record.data.i_is_post == 3) && ITYPE_CHEQUE == false && CANCEL_GL == false) {
        if (record.data.i_enable == 1) {
          controllTab(record, "edit_mini");
        }
      } else if ((record.data.i_is_post_bank == 2 || record.data.i_is_post == 2) && (record.data.i_enable_gx_bank == 2 || record.data.i_enable_gx == 2) && ITYPE_CHEQUE == false && CANCEL_GL == false) {
      } else if ((record.data.i_is_post_bank == 2 || record.data.i_is_post == 2) && record.data.i_enable_gx_bank == 1 && record.data.i_enable_gx == 1 && ITYPE_CHEQUE == false && CANCEL_GL == false) {
        controllTab(record, "edit_mini");
      } else if (record.get("i_enable") == 1 && ITYPE_CHEQUE == false && CANCEL_GL == false) {
        controllTab(record, "edit");
      }
    } else if (columnIndex == grid.getColumnModel().getIndexById("DELETE")) {
      if (record.data.i_status == 2) {
      } else if ((record.data.i_is_post_bank == 3 || record.data.i_is_post == 3) && ITYPE_CHEQUE == false && CANCEL_GL == false) {
      } else if ((record.data.i_is_post_bank == 2 || record.data.i_is_post == 2) && (record.data.i_enable_gx_bank == 2 || record.data.i_enable_gx == 2) && ITYPE_CHEQUE == false && CANCEL_GL == false) {
      } else if ((record.data.i_is_post_bank == 2 || record.data.i_is_post == 2) && record.data.i_enable_gx_bank == 1 && record.data.i_enable_gx == 1 && ITYPE_CHEQUE == false && CANCEL_GL == false) {
        controllTab(record, "CANCEL");
      } else if (record.get("i_enable") == 1 && ITYPE_CHEQUE == false && CANCEL_GL == false) {
        controllTab(record, "DELETE");
      }
    } else if (columnIndex == grid.getColumnModel().getIndexById("cheque")) {
      if (record.data.i_enable == 1 && ITYPE_CHEQUE == true && CANCEL_GL == false) {
        controllTab(record, "cheque");
      }
    } else if (columnIndex == grid.getColumnModel().getIndexById("CANCEL_GL")) {
      if (record.get("i_enable") == 1 && record.get("i_status") == 1 && CANCEL_GL == true) {
        controllTab(record, "CANCEL_GL");
      }
    } else if (columnIndex == grid.getColumnModel().getIndexById("print")) {
      if (record.data.i_is_post > 1) {
        Preview(record.data.gl_tran_hdr_id);
      }
    } else if (columnIndex == grid.getColumnModel().getIndexById("printBank")) {
      if (record.data.i_is_post_bank > 1) {
        Preview(record.data.gl_tran_hdr_id_bank_id);
      }
    } else if (columnIndex == grid.getColumnModel().getIndexById("printBankCancel")) {
      if (record.data.gl_tran_hdr_bank_id_cancel > 0) {
        Preview(record.data.gl_tran_hdr_bank_id_cancel);
      }
    } else if (columnIndex == grid.getColumnModel().getIndexById("printCancel")) {
      if (record.data.gl_tran_hdr_id_cancel > 0) {
        Preview(record.data.gl_tran_hdr_id_cancel);
      }
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
      Ext.store.setBaseParam("d_doc_date1", Ext.util.Format.date(Ext.getCmp("s_d_doc_date1").getValue(), "Y-m-d"));
      Ext.store.setBaseParam("d_doc_date2", Ext.util.Format.date(Ext.getCmp("s_d_doc_date2").getValue(), "Y-m-d"));
      Ext.store.setBaseParam("dc_expense_budget_type_id", Ext.getCmp("s_dc_expense_budget_type_id").getValue());
      Ext.store.setBaseParam("dc_user_id", Ext.getCmp("dc_user_id").getValue());
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
                    ["c_code", "รหัส"],
                    ["c_code_gl_bank", "รหัสอ้างอิงใบปะหน้า"],
                    ["c_code_gl", "รหัสอ้างอิงค่าใช้จ่าย"]
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
              { xtype: "label", text: "วันที่เอกสาร : " },
              { xtype: "tbspacer", width: 4 },
              {
                id: "s_d_doc_date1",
                xtype: "datefield",
                width: 153,
                listeners: {
                  afterrender: function() {
                    var date = new Date();
                    date = new Date(date.getFullYear(), date.getMonth(), 1);
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
          },
          {
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", text: "ผู้สร้างรายการ : " },
              { xtype: "tbspacer", width: 4 },
              new Ext.form.ComboBox({
                id: "dc_user_id",
                width: 355,
                mode: "local",
                store: Ext.vw_dc_user,
                valueField: "id",
                displayField: "c_name",
                triggerAction: "all",
                forceSelection: true,
                selectOnFocus: true,
                typeAhead: false,
                emptyText: "กรุณาเลือก...",
                value: "0",
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
              { xtype: "label", text: "แหล่งเงิน : " },
              { xtype: "tbspacer", width: 4 },
              new Ext.form.ComboBox({
                id: "s_dc_expense_budget_type_id",
                width: 355,
                mode: "local",
                store: Ext.dc_expense_budget_type_all,
                valueField: "id",
                displayField: "c_name",
                triggerAction: "all",
                forceSelection: true,
                selectOnFocus: true,
                typeAhead: false,
                emptyText: "กรุณาเลือก...",
                value: "0",
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
          }
        ],
        buttonAlign: "left",
        buttons: [
          {
            text: "เพิ่มข้อมูล",
            id: "buAdd",
            iconCls: "icon-add",
            hidden: ITYPE_CHEQUE == true || CANCEL_GL == true ? true : false,
            handler: function(grid, rowIndex, colIndex) {
              controllTab({}, "add");
            }
          },
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
        id: "view",
        header: "-",
        sortable: false,
        align: "center",
        width: 50,
        dataIndex: "id",
        hidden: ITYPE_CHEQUE == true || CANCEL_GL == true ? true : false,
        renderer: function(value, metaData, record, row, col, store, gridView) {
          if (record.data.i_status == 2) {
          } else if (ITYPE_CHEQUE == false) {
            return "<button style='font-size:11px; cursor:pointer; color: blue;'>แสดง</button>";
          }
        }
      },
      {
        id: "edit",
        header: "-",
        sortable: false,
        align: "center",
        width: 100,
        dataIndex: "id",
        hidden: ITYPE_CHEQUE == true || CANCEL_GL == true ? true : false,
        renderer: function(value, metaData, record, row, col, store, gridView) {
          if (record.data.i_status == 2) {
          } else if ((record.data.i_is_post_bank == 3 || record.data.i_is_post == 3) && ITYPE_CHEQUE == false && CANCEL_GL == false) {
            if (record.data.i_enable == 1) {
              return "<button style='font-size:11px; cursor:pointer; color: green;'>แก้ไขรายละเอียด</button>";
            }
          } else if ((record.data.i_is_post_bank == 2 || record.data.i_is_post == 2) && (record.data.i_enable_gx_bank == 2 || record.data.i_enable_gx == 2) && ITYPE_CHEQUE == false && CANCEL_GL == false) {
          } else if ((record.data.i_is_post_bank == 2 || record.data.i_is_post == 2) && record.data.i_enable_gx_bank == 1 && record.data.i_enable_gx == 1 && ITYPE_CHEQUE == false && CANCEL_GL == false) {
            return "<button style='font-size:11px; cursor:pointer; color: green;'>แก้ไขรายละเอียด</button>";
          } else if (record.get("i_enable") == 1 && ITYPE_CHEQUE == false && CANCEL_GL == false) {
            return "<button style='font-size:11px; cursor:pointer; color: green;'>แก้ไข</button>";
          }
        }
      },
      {
        id: "DELETE",
        header: "-",
        sortable: false,
        align: "center",
        width: 100,
        dataIndex: "id",
        hidden: ITYPE_CHEQUE == true || CANCEL_GL == true ? true : false,
        renderer: function(value, metaData, record, row, col, store, gridView) {
          if (record.data.i_status == 2) {
            return "<font color=red>ยกเลิกรายการแล้ว</font>";
          } else if ((record.data.i_is_post_bank == 3 || record.data.i_is_post == 3) && ITYPE_CHEQUE == false && CANCEL_GL == false) {
          } else if ((record.data.i_is_post_bank == 2 || record.data.i_is_post == 2) && (record.data.i_enable_gx_bank == 2 || record.data.i_enable_gx == 2) && ITYPE_CHEQUE == false && CANCEL_GL == false) {
          } else if ((record.data.i_is_post_bank == 2 || record.data.i_is_post == 2) && record.data.i_enable_gx_bank == 1 && record.data.i_enable_gx == 1 && ITYPE_CHEQUE == false && CANCEL_GL == false) {
            return "<button style='font-size:11px; cursor:pointer;'>ยกเลิก GX</button>";
          } else if (record.get("i_enable") == 1 && ITYPE_CHEQUE == false && CANCEL_GL == false) {
            return "<button style='font-size:11px; cursor:pointer; color: red;'>ลบ</button>";
          }
        }
      },
      {
        id: "cheque",
        header: "-",
        sortable: false,
        align: "center",
        width: 100,
        dataIndex: "id",
        hidden: ITYPE_CHEQUE == false || CANCEL_GL == true ? true : false,
        renderer: function(value, metaData, record, row, col, store, gridView) {
          if (record.get("i_enable") == 1 && ITYPE_CHEQUE == true && CANCEL_GL == false) {
            return "<button style='font-size:11px; cursor:pointer; color: green;'>ระบุเช็คจ่าย</button>";
          }
        }
      },
      {
        id: "CANCEL_GL",
        header: "-",
        sortable: false,
        align: "center",
        width: 120,
        dataIndex: "id",
        hidden: CANCEL_GL == true ? false : true,
        renderer: function(value, metaData, record, row, col, store, gridView) {
          if (record.get("i_enable") == 1 && record.get("i_status") == 1 && CANCEL_GL == true) {
            return "<button style='font-size:11px; cursor:pointer;'>ยกเลิกรายการ</button>";
          } else if (record.get("i_enable") == 1 && CANCEL_GL == true) {
            if (record.get("i_status") == 2) {
              return "<font color=red>ยกเลิกรายการแล้ว</font>";
            } else if (record.get("i_status") == 3) {
              return "<font color=pink>ยังไม่ได้ระบุเลขที่เช็ค</font>";
            }
          }
        }
      },
      { header: "รหัส", sortable: false, align: "center", width: 100, dataIndex: "c_code" },
      {
        header: "รหัสอ้างอิงใบปะหน้า",
        id: "printBank",
        sortable: true,
        width: 150,
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "align='center'";
          if (record.data.i_is_post_bank == 3) {
            return "<div style='cursor:pointer'><img src='../images/icons/printer_mono.png' style='margin-right:1px;'); /> <font color=green>" + record.data.c_code_gl_bank + "</font><div>";
          } else if (record.data.i_is_post_bank == 2) {
            if (record.data.i_enable_gx_bank == 1) {
              return "<div style='cursor:pointer'><img src='../images/icons/printer_mono.png' style='margin-right:1px;'); /> " + record.data.c_code_gx_bank + "<div>";
            } else {
              return "<div style='cursor:pointer'><img src='../images/icons/printer_mono.png' style='margin-right:1px;'); /> " + record.data.c_code_gx_bank + " <font color=red>(ไม่ใช้งาน)</font><div>";
            }
          }
        }
      },
      {
        header: "รหัสอ้างอิงค่าใช้จ่าย",
        id: "print",
        sortable: true,
        width: 150,
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "align='center'";
          if (record.data.i_is_post == 3) {
            return "<div style='cursor:pointer'><img src='../images/icons/printer_mono.png' style='margin-right:1px;'); /> <font color=green>" + record.data.c_code_gl + "</font><div>";
          } else if (record.data.i_is_post == 2) {
            if (record.data.i_enable_gx == 1) {
              return "<div style='cursor:pointer'><img src='../images/icons/printer_mono.png' style='margin-right:1px;'); /> " + record.data.c_code_gx + "<div>";
            } else {
              return "<div style='cursor:pointer'><img src='../images/icons/printer_mono.png' style='margin-right:1px;'); /> " + record.data.c_code_gx + " <font color=red>(ไม่ใช้งาน)</font><div>";
            }
          }
        }
      },
      {
        header: "ยกเลิก รหัสอ้างอิงใบปะหน้า (GX)",
        id: "printBankCancel",
        sortable: true,
        hidden: CANCEL_GL == true ? false : true,
        dataIndex: "c_code_bank_cancel",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "align='center'";
          if (record.data.gl_tran_hdr_bank_id_cancel > 0) {
            return (val = "<div style='cursor:pointer;'><img src='../images/icons/printer_mono.png' style='margin-right:1px;' />" + value + "</div>");
          }
        }
      },
      {
        header: "ยกเลิก รหัสอ้างอิงค่าใช้จ่าย (GX)",
        id: "printCancel",
        sortable: true,
        hidden: CANCEL_GL == true ? false : true,
        dataIndex: "c_code_cancel",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "align='center'";
          if (record.data.gl_tran_hdr_id_cancel > 0) {
            return (val = "<div style='cursor:pointer;'><img src='../images/icons/printer_mono.png' style='margin-right:1px;' />" + value + "</div>");
          }
        }
      },
      { header: "แหล่งเงิน", width: 230, sortable: true, align: "center", dataIndex: "dc_expense_budget_type_name" },
      {
        header: "สถานะใช้งาน",
        sortable: true,
        align: "center",
        dataIndex: "i_enable",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          if (value == 1) {
            return "<img src='../images/icons/yes.gif');/>";
          } else {
            return "<img src='../images/icons/no.gif');/>";
          }
        }
      },
      { header: "วันที่เอกสาร", sortable: true, align: "center", renderer: shortThaiDate, dataIndex: "d_doc_date" },
      { header: "วันที่บันทึกบัญชี", sortable: true, align: "center", renderer: shortThaiDate, dataIndex: "d_save_jv_date" },
      { header: "เลขที่บัญชีโอน", width: 200, sortable: true, dataIndex: "dc_bank_acc_company_id_target_name" },
      { header: "รับโอน", width: 200, sortable: true, dataIndex: "dc_bank_acc_company_id_source_name" },
      { header: "เลขที่บัญชีเงินฝาก", width: 200, sortable: true, dataIndex: "dc_bank_acc_company_id_source2_name" },
      { header: "รหัสบัญชี", width: 200, sortable: true, dataIndex: "dc_acc_name" },
      {
        header: "จำนวนเงิน",
        sortable: true,
        dataIndex: "f_money",
        renderer: function(value, metaData, record, row, col, store, gridView) {
          metaData.attr = "align='right';";
          return floatRenderer(value);
        }
      },
      {
        header: "ผู้สร้างรายการ",
        sortable: true,
        align: "center",
        dataIndex: "dc_user_create"
      },
      {
        header: "วันที่สร้างรายการ",
        sortable: true,
        align: "center",
        dataIndex: "d_create",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          return value != "" ? shortThaiDate(value) : "";
        }
      },
      {
        header: "หน่วยงานที่สร้างรายการ",
        sortable: true,
        width: 150,
        align: "center",
        dataIndex: "dc_user_create_cost"
      },
      {
        header: "ผู้ทำรายการล่าสุด",
        sortable: true,
        align: "center",
        dataIndex: "dc_user_update"
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
        align: "center",
        dataIndex: "dc_user_update_cost"
      },
      { width: 40, dataIndex: "" }
    ],
    //     autoExpandColumn: "c_name",
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
  let myComboStores = [Ext.vw_dc_user, Ext.dc_expense_budget_type, Ext.dc_expense_budget_type_all, Ext.gl_dc_book_type, Ext.dc_acc];
  chkLoadingStore(myComboStores, "contenterCenter", function() {});

  new Ext.KeyNav("tabpanel1", {
    enter: function(e) {
      search();
    },
    scope: this
  });
});
