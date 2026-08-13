Ext.onReady(function() {
  Ext.QuickTips.init();
  /*===============================================*/ 
  if (Ext.I_MENU_JVCR=="1") {
    Ext.title_panel = "นำเข้าใบเบิก e-PHIS";
  } else if (Ext.I_MENU_JVCR=="2") { 
    Ext.title_panel = "บันทึกบัญชีตั้งหนี้ใบเบิก (e-PHIS)";
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
      html: "ท่านต้องการที่จะลบข้อมูลหรือไม่ ?",
      buttons: [
        {
          text: "ยืนยัน",
          handler: function() {
            Ext.getCmp("win-msg-delete")
              .getEl()
              .mask("Please wait...", "x-mask-loading");
            Ext.Ajax.request({
              url: "api/mn_ImpRequestEphis.php",
              method: "POST",
              params: {
                mode: mode,
                id: id
              },
              success: function(result, request) {
                let jsonData = Ext.util.JSON.decode(result.responseText); // decode json
                Ext.MessageBox.minWidth = 200;
                if (jsonData.success == true) {
                  Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg); // alert massage success
                } else {
                  Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg); // alert massage error
                }
                Ext.getCmp("win-msg-delete").hide(); // hidden window-panel
                Ext.getCmp("win-msg-delete").destroy(); // clear memory :: garbage collection
                Ext.store.reload();
              },
              failure: function(result, request) {
                Ext.MessageBox.alert("แจ้งเตือน", result.responseText); // connect error
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
      Ext.getCmp("saveDtl").hide();
      Ext.getCmp("saveHdr").hide();
      Ext.getCmp("add_dtl").hide();
      Ext.getCmp("saveDtlGenJV").hide(); 
    } 
    else {
      if (Ext.I_MENU_JVCR=="1") {
        Ext.getCmp("saveDtlGenJV").hide();  
      } else {
        Ext.getCmp("saveDtlGenJV").show(); 
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

  const controllTab = function(record, butt) {
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
      Ext.getCmp("form-widgets")
        .getForm()
        .loadRecord(record);
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
    // else if (butt == "send_success") {
    //   sendSuccess();
    // }
  }; // controllTab

  // ================================ gridMain ================================ //
  cellClick = function(grid, rowIndex, columnIndex, e) {
    let record = grid.getStore().getAt(rowIndex);
    if (columnIndex == grid.getColumnModel().getIndexById("view")) {
      controllTab(record, "view");
    } else if (columnIndex == grid.getColumnModel().getIndexById("edit")) {
 
        if (Ext.I_MENU_JVCR=="1")
        {
          if ((record.get("i_enable") == 2) || (record.get("i_status") == 3) || (record.get("i_status") == 4)) { 
          }  else {
            controllTab(record, "edit");
          }
        }
        else if (Ext.I_MENU_JVCR=="2")
        {
          if ((record.get("i_status") == 2) || (record.get("i_status") == 3))
          {
            controllTab(record, "edit");
          }
          
        }
        
      
    } else if (columnIndex == grid.getColumnModel().getIndexById("delete")) {  

        if (Ext.I_MENU_JVCR=="1")
        { //MENU IMPORT JV  
          if ((record.get("i_status") == 1) || (record.get("i_status") == 2))
          {
            deleteHdr(record.get("id"), "DELETE");
          }
        }
        else
        { //MENU JV 
          if (record.get("i_status") == 4)
          {
            deleteHdr(record.get("id"), "DELETE_GX");
          }
        }        
    } else if (columnIndex == grid.getColumnModel().getIndexById("print")) {
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
                  data: [["c_period_no", "เอกสารอ้างอิง"],["c_code", "เลขที่นำเข้าใบเบิก e-PHIS"]]
                }),
                value: "c_period_no",
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
              { xtype: "label", text: "สถานะรายการ : " },
              { xtype: "tbspacer", width: 4 },
              {
                id: "i_status",
                xtype: "combo",
                width: 130,
                mode: "local",
                store: new Ext.data.SimpleStore({
                  fields: ["value", "text"],
                  data: [
                    ["99", "- เลือกรายการทั้งหมด -"],
                    ["1", "อยู่ระหว่างนำเข้าใบเบิก"],
                    ["2", "นำเข้าใบเบิกสมบูรณ์"],
                    ["3", "อยู่ระหว่างบันทึกบัญชี"],
                    ["4", "บันทึกบัญชีสมบูรณ์"],
                  ]
                }),
                value: "99",
                valueField: "value",
                displayField: "text",
                allowBlank: false,
                editable: false,
                triggerAction: "all",
                typeAhead: false,
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
              },
              { xtype: "tbspacer", width: 2 },
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
                width: 200,
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
              { xtype: "label", text: "วันที่เอกสาร : " },
              { xtype: "tbspacer", width: 4 },
              {
                id: "s_d_doc_date1",
                xtype: "datefield",
                width: 154,
                listeners: {
                  afterrender: function() {
                    var date = new Date();
                   date = new Date(date.getFullYear()+543, date.getMonth()-1, 1); 
                    this.setValue(date);
                  }
                }
              },
              { xtype: "tbspacer", width: 5 },
              { xtype: "label", text: "ถึงวันที่ : " },
              { xtype: "tbspacer", width: 4 },
              {
                id: "s_d_doc_date2",
                xtype: "datefield",
                width: 154,
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
          {
            text: "เพิ่มข้อมูล",
            id: "buAdd",
            iconCls: "icon-add",
            handler: function(grid, rowIndex, colIndex) {
              controllTab({}, "add");
            }
          }
          // ,{
          //   text: "&nbsp;ผ่านการตรวจสอบ&nbsp;",
          //   iconCls: "icon-save",
          //   handler: function(grid, rowIndex, colIndex) {
          //     controllTab({}, "send_success");
          //   }
          // }
          , { xtype: "tbfill" },
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
                Ext.store.setBaseParam("i_status", Ext.getCmp("i_status").getValue());

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
        id: "view",
        header: "-",
        sortable: false,
        align: "center",
        width: 50,
        dataIndex: "id",
        renderer: function(value, metaData, record, row, col, store, gridView) {
          return "<button style='font-size:11px; cursor:pointer; color: blue;'>แสดง</button>";
        }
      },
      {
        id: "edit",
        header: "-",
        sortable: false,
        align: "center",
        width: 100,
        dataIndex: "id",
        renderer: function(value, metaData, record, row, col, store, gridView) { 

          if (Ext.I_MENU_JVCR=="1")
          {
            if ((record.get("i_enable") == 2) || (record.get("i_status") == 3) || (record.get("i_status") == 4)) {
              return "";
            }  else {
              return "<button style='font-size:11px; cursor:pointer; color: green;'>แก้ไข</button>";
            }
          }
          else if (Ext.I_MENU_JVCR=="2")
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
          else
          {
            return "";
          }
        }
      },
      {
        id: "delete",
        header: "-",
        sortable: false,
        align: "center",
        width: 75,
        dataIndex: "id",
        renderer: function(value, metaData, record, row, col, store, gridView) {
 
            if (Ext.I_MENU_JVCR=="2")
            { //MENU JV 
              if (record.get("i_status") == 4)
              {
                if (record.get("i_is_post") == 2)
                  return "<button style='font-size:11px; cursor:pointer; color: red;'>ยกเลิก GX</button>";
                else
                  return "";
              }
              else
              {
                return "";
              }
            }
            else
            { //MENU IMPORT
              if ((record.get("i_status") == 1) || (record.get("i_status") == 2))
              {
                return "<button style='font-size:11px; cursor:pointer; color: red;'>ลบ</button>";
              }
              else
              {
                return "";
              }
            } 
           
        }
      }
      ,{
        header: "สถานะรายการ",
        sortable: false,
        align: "center",
        dataIndex: "c_status",
        width: 140,
         renderer: function(value, metaData, record, rowIndex, colIndex, store) 
         {
          i_s     = record.get("i_status") ;
          
          if (i_s == 1) {
            metaData.attr = "style='color:#0589c7;'";
            return value;
          } else if (i_s == 2) {
            metaData.attr = "style='color:green;'";
            return value;
          } else if (i_s == 3) {
            metaData.attr = "style='color:violet;'";
            return value;
          } else if (i_s == 4) {
            metaData.attr = "style='color:#CC3300;'";
            return value;
          }  {
            return "<font color=red>รอตรวจสอบ</font>";
          }
        }
      }
      ,{
        header: "เลขที่นำเข้าใบเบิก e-PHIS",
        sortable: false,
        align: "center",
        dataIndex: "c_code",
        width: 120,
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          return value;
        }
      },{
        header: "เลขที่บันทึกบัญชีตั้งหนี้",
        id: "print",
        sortable: true,
        width: 120,
        dataIndex: "c_code_jv",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "align='center'";
          if (record.data.i_is_post > 1) { 
            return '<div style="cursor:pointer"><img src="../images/icons/printer_mono.png" style="margin-right:1px;"); />' + value + "<div>";
          }
        },
      },
      { id: "c_period_no", header: "เอกสารอ้างอิง", sortable: false, align: "center", dataIndex: "c_period_no" },
      {
        header: "แหล่งเงิน",
        sortable: false,
        align: "center",
        dataIndex: "dc_expense_budget_type_name",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "style='text-align:left;'";
          return value;
        }
      },
      {
        header: "วันที่เอกสาร",
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
      { header: "หน่วยงานที่ทำรายการล่าสุด", sortable: true, dataIndex: "dc_user_update_cost_id" },
      { width: 40, dataIndex: "" }
    ],
    // autoExpandColumn: "c_code",
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
  let myComboStores = [Ext.dc_expense_budget_type_all, Ext.dc_expense_budget_type, Ext.dc_expense_group_vsn, Ext.dc_expense_acc_vsn_full,Ext.gl_dc_config_creditor,Ext.storeItemEPHIS,Ext.store_dc_acc_last,Ext.store_dc_creditor];
  chkLoadingStore(myComboStores, "contenterCenter", function() {});
});
