function checkAll(ele) {
  for (var i = 1; i < Ext.objChk.length; i++) {
    var ind = Ext.objChk[i];
    if (ind != "") {
      if (document.getElementById(ind)) {
        document.getElementById(ind).checked = ele;
      }
    }
  }
  changeTotal();
}

const changeTotal = function() {
  let total = 0;
  for (var i = 1; i < Ext.objChk.length; i++) {
    var ind = Ext.objChk[i];
    if (ind != "") {
      if (document.getElementById(ind)) {
        if (document.getElementById(ind).checked == true) {
          let id = document.getElementById(ind).value;
          total += parseFloat(getStoreItems(Ext.store, id, "f_total").replace(/,/g, ""), 2);
        }
      }
    }
  }

  Ext.getCmp("total").setValue(floatRenderer(total.toFixed(2)));
};

Ext.onReady(function() {
  Ext.QuickTips.init();
  Ext.objChk = [];
  /*===============================================*/
  Ext.title_panel = "ตัดจ่ายเจ้าหนี้";
  /*===============================================*/

  const sendData = function() {
    let msg = "";
    var check = false;
    var jsonArr = [];

    $("input[id^=chk]").each(function(i, val) {
      if (val.checked == true) {
        check = true;
        jsonArr.push(val.value);
      }
    });

    if (check == false) {
      msg += "- กรุณาเลือก รายการ อย่างน้อย 1 รายการ<br>";
    }

    if (msg == "") {
      new Ext.Window({
        title: "บันทึก",
        id: "win-pop-dtl",
        modal: true,
        preventBodyReset: true,
        closable: true,
        autoScroll: true,
        height: 140,
        width: 350,
        layout: "fit",
        border: false,
        items: [
          new Ext.FormPanel({
            labelWidth: 75, // label settings here cascade unless overridden
            frame: true,
            bodyStyle: "padding:5px 5px 0",
            border: false,
            items: [
              {
                xtype: "datefield",
                fieldLabel: "วันที่จ่ายจริง",
                id: "d_pay_date",
                width: 200
              }
            ]
          })
        ],
        buttonAlign: "left",
        buttons: [
          {
            text: Ext.GLOBAL_BU_SAVE_TH,
            iconCls: "icon-save",
            handler: function() {
              if (Ext.getCmp("d_pay_date").getValue() == "") {
                msg += "<span style='white-space: nowrap;'>- กรุณากรอก วันที่จ่ายจริง</span><br>";
              } else {
                msg = "";
              }

              if (msg == "") {
                Ext.getCmp("win-pop-dtl")
                  .getEl()
                  .mask("Please wait...", "x-mask-loading");
                Ext.Ajax.request({
                  url: "api/mn_creditorCut.php",
                  method: "POST",
                  params: {
                    mode: "SEND_DATA",
                    d_pay_date: Ext.util.Format.date(Ext.getCmp("d_pay_date").getValue(), "Y-m-d"),
                    data: JSON.stringify(jsonArr)
                  },
                  success: function(result, request) {
                    Ext.getCmp("win-pop-dtl")
                      .getEl()
                      .unmask();
                    let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                    if (jsonData.success == true) {
                      Ext.store.load();
                      Ext.getCmp("win-pop-dtl").destroy();
                    } else {
                      Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg);
                    }
                  },
                  failure: function(result, request) {
                    Ext.MessageBox.alert("Failed", result.responseText); // connect error
                  }
                });
              } else {
                Ext.Msg.alert("แจ้งเตือน", msg);
              }
            }
          },
          {
            text: Ext.GLOBAL_BU_BACK_TH,
            handler: function() {
              Ext.getCmp("win-pop-dtl").destroy();
            }
          }
        ]
      }).show();
    } else {
      Ext.Msg.alert("แจ้งเตือน", msg);
    }
  };

  const resetCheque = function(id) {
    new Ext.Window({
      id: "win-msg-delete",
      title: "แจ้งเตือน",
      modal: true,
      width: 250,
      height: 130,
      html: "ท่านต้องการที่จะส่งคืนรายการใช่หรือไม่ ?",
      buttons: [
        {
          iconCls: "icon-save",
          text: "ยืนยัน",
          handler: function() {
            Ext.getCmp("win-msg-delete")
              .getEl()
              .mask("Please wait...", "x-mask-loading");
            Ext.Ajax.request({
              url: "api/mn_creditorCut.php",
              method: "POST",
              params: { mode: "RESET_CHEQUE", id: id },
              success: function(result, request) {
                var jsonData = Ext.util.JSON.decode(result.responseText); // decode json
                if (jsonData.success == true) {
                  Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg); // alert massage success
                } else {
                  Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg); // alert massage error
                }
                Ext.getCmp("win-msg-delete").destroy(); // clear memory :: garbage collection
                Ext.store.load();
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
            Ext.getCmp("win-msg-delete").destroy();
          }
        }
      ]
    }).show();
  };

  const comment = function(record) {
    new Ext.Window({
      title: "บันทึก",
      id: "win-pop-dtl",
      modal: true,
      preventBodyReset: true,
      closable: true,
      autoScroll: true,
      height: 190,
      width: 450,
      layout: "fit",
      border: false,
      items: [
        new Ext.FormPanel({
          id: "form-dtl",
          labelWidth: 75, // label settings here cascade unless overridden
          frame: true,
          bodyStyle: "padding:5px 5px 0",
          border: false,
          items: [
            {
              xtype: "textarea",
              fieldLabel: "หมายเหตุ",
              id: "c_comment",
              width: 300
            }
          ]
        })
      ],
      buttonAlign: "left",
      buttons: [
        {
          text: Ext.GLOBAL_BU_SAVE_TH,
          iconCls: "icon-save",
          handler: function() {
            let msg = "";
            if (msg == "") {
              Ext.getCmp("win-pop-dtl")
                .getEl()
                .mask("Please wait...", "x-mask-loading");
              Ext.Ajax.request({
                url: "api/mn_creditorCut.php",
                method: "POST",
                params: {
                  mode: "SAVE_COMMENT",
                  id: record.data.id,
                  c_comment: Ext.getCmp("c_comment").getValue()
                },
                success: function(result, request) {
                  Ext.getCmp("win-pop-dtl")
                    .getEl()
                    .unmask();
                  let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                  if (jsonData.success == true) {
                    Ext.store.load();
                    Ext.getCmp("win-pop-dtl").destroy();
                  } else {
                    Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg);
                  }
                },
                failure: function(result, request) {
                  Ext.MessageBox.alert("Failed", result.responseText); // connect error
                }
              });
            } else {
              Ext.Msg.alert("แจ้งเตือน", msg);
            }
          }
        },
        {
          text: Ext.GLOBAL_BU_BACK_TH,
          handler: function() {
            Ext.getCmp("win-pop-dtl").destroy();
          }
        }
      ]
    }).show();

    Ext.getCmp("form-dtl")
      .getForm()
      .loadRecord(record);
  };

  // ================================ gridMain ================================ //
  cellClick = function(grid, rowIndex, columnIndex, e) {
    let record = grid.getStore().getAt(rowIndex);
    if (columnIndex == grid.getColumnModel().getIndexById("i_chk") && record.data.i_status != 1) {
      if (document.getElementById("chk[" + record.data.id + "]").checked) {
        document.getElementById("chk[" + record.data.id + "]").checked = false;
      } else {
        document.getElementById("chk[" + record.data.id + "]").checked = true;
      }
      changeTotal();
    } else if (columnIndex == grid.getColumnModel().getIndexById("c_comment")) {
      comment(record);
    } else {
      if (columnIndex == grid.getColumnModel().getIndexById("i_chk")) {
        resetCheque(record.data.id);
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
      Ext.store.setBaseParam("dc_expense_budget_type_id", Ext.getCmp("dc_expense_budget_type_id").getValue());
      Ext.store.setBaseParam("i_expire", Ext.getCmp("s_i_expire").getValue());
      Ext.store.setBaseParam(
        "f_total",
        Ext.getCmp("s_f_total")
          .getValue()
          .replace(/,/g, "")
      );
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
                    ["c_cheque", "เลขที่เช็ค"]
                  ]
                }),
                value: "c_approve",
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
                id: "dc_expense_budget_type_id",
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
          },
          {
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", text: "สถานะ : " },
              { xtype: "tbspacer", width: 4 },
              new Ext.form.ComboBox({
                id: "s_i_expire",
                mode: "local",
                store: Ext.expire,
                valueField: "id",
                displayField: "c_name",
                triggerAction: "all",
                forceSelection: true,
                selectOnFocus: true,
                typeAhead: false,
                emptyText: "กรุณาเลือก...",
                width: 130,
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
              }),
              { xtype: "tbspacer", width: 4 },
              { xtype: "label", text: "จำนวนเงิน : " },
              { xtype: "tbspacer", width: 4 },
              {
                xtype: "textfield",
                id: "s_f_total",
                width: 163,
                fieldLabel: "fieldLabel",
                emptyText: "คำที่ต้องการค้นหา",
                style: "text-align: right; font-weight: bold;",
                listeners: {
                  afterrender: function() {
                    this.fn = function() {
                      let value = floatMinus(this.getValue().replace(/,/g, ""), 2);
                      this.setValue(floatRenderer(value));
                    };
                  },
                  Change: function(value) {
                    this.fn();
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
              search();
            }
          }
        ]
      }
    ],
    columns: [
      {
        header: "วันที่ทำทะเบียนจ่าย",
        sortable: true,
        align: "center",
        dataIndex: "d_doc_date",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          return value != "" ? shortThaiDate(value) : "";
        }
      },
      { header: "เลขที่ฏีกา", sortable: true, align: "center", dataIndex: "c_approve" },
      {
        header: "แหล่งเงิน",
        sortable: true,
        align: "center",
        width: 200,
        dataIndex: "budget_name",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "style='text-align:left;'";
          return value;
        }
      },
      {
        header: "หมวดค่าใช้จ่าย",
        sortable: true,
        align: "center",
        dataIndex: "c_expense_group",
        width: 150,
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "style='text-align:left;'";
          return value;
        }
      },
      {
        header: "รายจ่ายย่อย",
        sortable: true,
        align: "center",
        dataIndex: "c_expense",
        width: 150,
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "style='text-align:left;'";
          return value;
        }
      },
      {
        header: "ผู้เบิก/ผู้รับเงิน",
        sortable: true,
        align: "center",
        dataIndex: "c_creditor",
        width: 200,
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          return value;
        }
      },
      {
        header: "เลขที่เช็ค",
        sortable: true,
        align: "center",
        dataIndex: "c_cheque",
        width: 100,
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          return value;
        }
      },
      {
        id: "i_chk",
        header: "<div class='topAlign'><input id='checkAll' type='checkbox' onclick='checkAll(this.checked)'></div>",
        sortable: false,
        align: "center",
        width: 100,
        dataIndex: "id",
        renderer: function(value, metaData, record, row, col, store, gridView) {
          if (record.get("i_status") != 1) {
            Ext.objChk[value] = "chk[" + value + "]";
            return "<input type='checkbox' id='chk[" + value + "]' value=" + value + " " + (record.get("i_status") ? "checked" : "") + ">";
          } else {
            return "<button style='font-size:11px; cursor:pointer;'>ส่งคืนรายการ</button>";
          }
        }
      },
      {
        header: "จำนวนเงิน",
        sortable: false,
        align: "center",
        width: 100,
        dataIndex: "f_total",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = 'style="text-align: right;"';
          return floatRenderer(floatMinus(value, 2));
        }
      },
      {
        header: "วันที่จ่ายจริง",
        sortable: true,
        align: "center",
        dataIndex: "d_pay_date",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          return value != "" ? shortThaiDate(value) : "";
        }
      },
      {
        header: "สถานะ",
        sortable: true,
        align: "center",
        dataIndex: "i_status",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          return value == 1 ? "<font color=green>สมบูรณ์</font>" : "<font color=red>รอดำเนินการ</font>";
        }
      },
      {
        header: "หมายเหตุ",
        sortable: true,
        align: "center",
        dataIndex: "c_comment",
        width: 300,
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "style='text-align:left;'";
          return value;
        }
      },
      {
        id: "c_comment",
        header: "-",
        sortable: false,
        align: "center",
        width: 100,
        dataIndex: "id",
        renderer: function(value, metaData, record, row, col, store, gridView) {
          return "<button style='font-size:11px; cursor:pointer;'>หมายเหตุ</button>";
        }
      }
    ],
    bbar: [
      { xtype: "tbfill" },
      {
        xtype: "buttongroup",
        columns: 1,
        border: false,
        defaults: { scale: "small", style: "float: right" },
        items: [
          {
            xtype: "buttongroup",
            frame: false,
            border: false,
            items: [
              { xtype: "label", text: "จำนวนเงินรวม : " },
              { xtype: "tbspacer", width: 4 },
              { id: "total", xtype: "textfield", value: "0.00", style: "text-align: right; font-weight: bold;", width: 100, readOnly: true },
              { xtype: "tbspacer", width: 4 },
              { xtype: "label", text: "บาท" }
            ]
          }
        ]
      },
      {
        iconCls: "icon-save",
        xtype: "button",
        style: "padding: 1px 10px",
        scale: "medium",
        text: "บันทึกรายการ&nbsp;",
        handler: function() {
          sendData();
        }
      }
    ]
    //     autoExpandColumn: "c_name",
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
  // let myComboStores = [Ext.dc_expense_budget_type, Ext.po_expense];
  // chkLoadingStore(myComboStores, "contenterCenter", function() {});

  new Ext.KeyNav("tabpanel1", {
    enter: function(e) {
      search();
    },
    scope: this
  });
});
