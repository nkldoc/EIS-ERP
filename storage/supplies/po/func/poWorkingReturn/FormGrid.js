Ext.onReady(function () {
  Ext.QuickTips.init();
  /*===============================================*/
  Ext.title_panel = "บันทึกรับคืนใบเบิก";
  /*===============================================*/

  const search = function () {
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

  const Preview = function (id) {
    let url = "../po/preview/Pre_Working.php";
    let loader_display = '<div id="loader_display" style="display: flex; padding: 15px 15px; font-size:14px;"><div class="loader"></div><p>&nbsp;&nbsp;กำลังโหลดสถานะกรุณารอสักครู่...</p></div>';
    new Ext.Window({
      title: "แสดงสถานะใบขอเบิก",
      id: "Preview",
      modal: true,
      preventBodyReset: true,
      closable: true,
      autoScroll: true,
      maximized: true, // เต็มจอ auto
      html: loader_display + '<iframe name="printf" src="' + url + "?id=" + id + '" style="width:100%; height:100%; border-style:hidden;"></iframe>',
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
      listeners: {
        afterrender: function () {
          $("iframe")
            .load(function () {
              document.getElementById("loader_display").remove();
            })
            .show();
        },
      },
    }).show();
  };

  Ext.pagingBar = new Ext.PagingToolbar({
    pageSize: 20,
    store: Ext.store,
    displayInfo: true,
    displayMsg: "Displaying topics {0} - {1} of {2}",
  });
  const sendData = function () {
    let msg = "";
    let jsonArr = [];
    let sto = Ext.getCmp("tabpanel1").store.data.items;
    sto.forEach(function (v) {
      //var f_dr = v.data.id != null ? v.data.id.replace(/,/g, "") : "";

      // if (v.dirty) {
      //   if (v.data.c_code_cut == "") {
      //     msg += "<span style='white-space: nowrap;'>- กรุณากรอก เลขที่ตัดชำระ</span><br>";
      //   }
      //   if (v.data.d_cut_date == "") {
      //     msg += "<span style='white-space: nowrap;'>- กรุณากรอก วันที่ตัดชำระ</span><br>";
      //   }
      //   if (v.data.ar_treat_right_id == "") {
      //     msg += "<span style='white-space: nowrap;'>- กรุณาเลือก สิทธิ์การรักษา</span><br>";
      //   }
      //   if (v.data.ar_cost_id == "") {
      //     msg += "<span style='white-space: nowrap;'>- กรุณาเลือก หน่วยงาน</span><br>";
      //   }
      //   if (v.data.c_patient == "") {
      //     msg += "<span style='white-space: nowrap;'>- กรุณากรอก ชื่อผู้ป่วย</span><br>";
      //   }
      //   if (f_dr == "" && f_cr == "") {
      //     msg += "<span style='white-space: nowrap;'>- กรุณากรอก จ่ายเพิ่ม หรือ เรียกคืน</span><br>";
      //   } else if (f_dr != "" && f_cr != "") {
      //     msg += '<span style=\'white-space: nowrap;\'>- ใส่ยอดเงินเฉพาะ "จ่ายเพิ่ม" หรือ "เรียกคืน" เท่านั้น</span><br>';
      //   }
      if (v.dirty == true) {
        var f_return = v.data.f_return != null ? v.data.f_return.replace(/,/g, "") : 0;
        jsonArr.push({
          dtl_id: v.data.dtl_id,
          f_return: f_return,
        });
      }
      // }
    });
    console.log(jsonArr);

    if (msg == "") {
      Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
      Ext.Ajax.request({
        url: "api/mn_poWorkingReturn.php",
        method: "POST",
        params: {
          mode: "SAVE_DATA",
          data: JSON.stringify(jsonArr),
        },
        success: function (result, request) {
          Ext.getCmp("contenterCenter").getEl().unmask();
          let json = Ext.util.JSON.decode(result.responseText); //decode json
          Ext.store.load();
          Ext.Msg.alert("แจ้งเตือน", json.msg);
        },
        failure: function (result, request) {
          Ext.MessageBox.alert("Failed", result.responseText); // connect error
        },
      });
    } else {
      Ext.Msg.alert("แจ้งเตือน", msg);
    }
  };

  const deleteAdjust = function (id) {
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
          handler: function () {
            Ext.getCmp("win-msg-delete").getEl().mask("Please wait...", "x-mask-loading");
            Ext.Ajax.request({
              url: "api/mn_poWorkingReturn.php",
              method: "POST",
              params: {
                mode: "DELETE",
                id: id,
              },
              success: function (result, request) {
                var jsonData = Ext.util.JSON.decode(result.responseText); // decode json
                if (jsonData.success == true) {
                  Ext.MessageBox.alert("Success", jsonData.msg); // alert massage success
                } else {
                  Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                }
                Ext.getCmp("win-msg-delete").destroy(); // clear memory :: garbage collection
                Ext.store.reload();
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
  // ================================ gridMain ================================ //
  cellClick = function (grid, rowIndex, columnIndex, e) {
    let record = grid.getStore().getAt(rowIndex);
    if (columnIndex == grid.getColumnModel().getIndexById("delete")) {
      deleteAdjust(record.get("id"), "DELETE");
    } else if (columnIndex == grid.getColumnModel().getIndexById("print")) {
      Preview(record.data.id);
    }
  }; //cellClick

  // gridMain
  const gridMain = new Ext.grid.EditorGridPanel({
    region: "center",
    layout: "fit",
    title: "แสดงรายการ" + Ext.title_panel,
    id: "tabpanel1",
    border: false,
    stripeRows: true,
    loadMask: true,
    store: Ext.store,
    clicksToEdit: 1,
    viewConfig: {
      emptyText: "ไม่มีข้อมูล..",
      deferEmptyText: false,
      getRowClass: function (record, index, rowParams) {
        return index % 2 == 0 ? "grid-odd padd-6" : "grid-even padd-6";
      },
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
                    ["c_code_ref", "เลขที่ขอเบิก"],
                  ],
                }),
                value: "c_code_ref",
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
                mode: "local",
                store: Ext.dc_expense_budget_type_all,
                valueField: "id",
                displayField: "c_name",
                triggerAction: "all",
                forceSelection: true,
                selectOnFocus: true,
                typeAhead: false,
                emptyText: "กรุณาเลือก...",
                width: 354,
                // value: "0",
                listeners: {
                  afterrender: function () {
                    this.fn = function () {};
                  },
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
        ],
        buttonAlign: "left",
        buttons: [
          { xtype: "tbfill" },
          {
            text: "ค้นหา",
            iconCls: "icon-magnifier",
            handler: function () {
              search();
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
      // {
      //   id: "delete",
      //   header: "-",
      //   sortable: false,
      //   align: "center",
      //   width: 50,
      //   dataIndex: "id",
      //   renderer: function (value, metaData, record, row, col, store, gridView) {
      //     return "<button style='font-size:11px; cursor:pointer; color: red;'>รับคืน</button>";
      //   },
      // },
      {
        header: "-",
        id: "print",
        sortable: true,
        dataIndex: "id",
        width: 40,
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "align='center'";
          return "<div style='cursor:pointer'><img src='../images/icons/printer_mono.png' style='margin-right:1px;' /><div>";
        },
      },
      {
        hidden: true,
        id: "dtl_id",
        dataIndex: "dtl_id",
      },
      {
        header: "เลขที่ใบเบิก",
        sortable: false,
        align: "center",
        dataIndex: "c_code_ref",
        width: 100,
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          if (value) {
            metaData.attr = "style='text-align: center;'";
            return value;
          } else {
            metaData.attr = "style='text-align: center; color:red;'";
            return "-";
          }
        },
      },
      {
        header: "เลขที่ฏีกา",
        sortable: false,
        align: "center",
        dataIndex: "c_approve",
        width: 100,
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          if (value) {
            metaData.attr = "style='text-align: center;'";
            return value;
          } else {
            metaData.attr = "style='text-align: center; color:red;'";
            return "-";
          }
        },
      },
      {
        header: "วันที่อนุมัติฏีกา",
        sortable: true,
        align: "center",
        dataIndex: "d_approve_date",
        width: 100,
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          return value != "" ? shortThaiDate(value) : "";
        },
      },
      {
        header: "หน่วยงาน",
        sortable: false,
        align: "center",
        dataIndex: "cost_name",
        width: 250,
      },
      {
        header: "แหล่งเงิน",
        sortable: false,
        align: "center",
        dataIndex: "budget_name",
        width: 250,
      },
      {
        header: "รายการย่อย",
        sortable: false,
        align: "center",
        dataIndex: "bg_expense_name",
        width: 250,
      },

      {
        header: "จำนวนเงินขอใบเบิก",
        sortable: false,
        align: "center",
        dataIndex: "f_total",
        width: 110,
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          if (value) {
            metaData.attr = "style='text-align: right;'";
            return floatRenderer(floatMinus(value.replace(/,/g, ""), 2));
          } else {
            metaData.attr = "style='text-align: right; color:red;'";
            return "-";
          }
        },
      },
      {
        header: "ยอดเงินรับคืน",
        sortable: false,
        align: "center",

        dataIndex: "f_return",
        width: 110,
        editor: new Ext.form.TextField({
          style: "text-align: right",
          listeners: {
            afterrender: function () {
              this.fn = function () {
                this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
              };
            },
            Change: function (value) {
              this.fn();
            },
          },
        }),
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          if (value) {
            metaData.attr = "style='text-align: right;'";
            return floatRenderer(floatMinus(value.replace(/,/g, ""), 2));
          } else {
            metaData.attr = "style='text-align: right; color:red;'";
            return "-";
          }
        },
      },
      // {
      //   header: "หมายเหตุ",
      //   sortable: false,
      //   align: "center",
      //   dataIndex: "c_comment",
      //   width: 300,
      //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
      //     metaData.attr = "style='text-align: left;'";
      //     return "<pre>" + value + "</pre>";
      //   },
      // },
      // {
      //   header: "ผู้ทำรายการล่าสุด",
      //   sortable: true,
      //   dataIndex: "dc_user_update_id",
      // },
      // {
      //   header: "วันที่ทำรายการล่าสุด",
      //   sortable: true,
      //   align: "center",
      //   dataIndex: "d_update",
      //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
      //     return value != "" ? shortThaiDate(value) : "";
      //   },
      // },
      // {
      //   header: "หน่วยงานที่ทำรายการล่าสุด",
      //   sortable: true,
      //   dataIndex: "dc_user_update_cost_id",
      // },
      { width: 40, dataIndex: "" },
    ],
    //     autoExpandColumn: "c_name",
    bbar: [
      {
        text: "&nbsp;บันทึกรายละเอียดฯ&nbsp;",
        id: "saveDtl",
        iconCls: "icon-save",
        handler: function () {
          sendData();
        },
      },
      "->",
      {
        xtype: "label",
        id: "statusbar",
        html: "<div style='padding: 3px 6px 2px;'><img src='../images/icons/accept.png'><span style='position: relative; top: -4px; left: 5px;'>Ready</span></div>",
      },
    ],
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

  let myComboStores = [Ext.dc_expense_budget_type_all, Ext.store];
  chkLoadingStore(myComboStores, "contenterCenter", function () {});

  new Ext.KeyNav("tabpanel1", {
    enter: function (e) {
      search();
    },
    scope: this,
  });
});
