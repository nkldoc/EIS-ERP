function checkAll(ele) {
  for (var i = 1; i < Ext.objChk.length; i++) {
    var ind = Ext.objChk[i];
    if (ind != "") {
      if (document.getElementById(ind)) {
        document.getElementById(ind).checked = ele;
      }
    }
  }
  changePrice();
}

const changePrice = function () {
  var f_select = 0;
  Ext.store.each(function (record, id) {
    if (record.id > 0 && document.getElementById(Ext.objChk[record.id]).checked == true) {
      f_bill = record.get("f_bill").replace(/,/g, "");
      f_select += parseFloat(f_bill, 2);
    }
  });

  Ext.getCmp("text_month").setValue(getStoreItems(Ext.groupdate, Ext.getCmp("i_groupdate").getValue(), "c_name"));
  Ext.getCmp("f_select").setValue(floatRenderer(parseFloat(f_select).toFixed(2)));
  Ext.getCmp("f_approve").setValue(floatRenderer(parseFloat(Ext.f_approve).toFixed(2)));
  Ext.getCmp("f_total").setValue(floatRenderer(parseFloat(Ext.f_total).toFixed(2)));
};

Ext.onReady(function () {
  Ext.QuickTips.init();
  Ext.objChk = [];
  /*===============================================*/
  Ext.title_panel = "ตรวจสอบใบเรียกเก็บ";

  const Preview = function (id) {
    let url = "http://localhost/nmu/ar/report/Rep_ArBill.php?type=preview&preview_id=" + id;

    new Ext.Window({
      title: "แสดงสถานะใบขอเบิก",
      id: "Preview",
      modal: true,
      preventBodyReset: true,
      closable: true,
      autoScroll: true,
      maximized: true, // เต็มจอ auto
      html: '<iframe name="printf" src="' + url + '" style="width:100%; height:100%; border-style:hidden; background: white;"></iframe>',
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

  const sendData = function () {
    let msg = "";
    var check = false;
    var jsonArr = [];

    $("input[id^=chk]").each(function (i, val) {
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
        title: "แจ้งเตือน",
        modal: true,
        width: 250,
        height: 130,
        html: "ท่านต้องการบันทึกข้อมูล ?",
        buttons: [
          {
            text: Ext.GLOBAL_BU_SAVE_TH,
            iconCls: "icon-save",
            handler: function () {
              Ext.getCmp("win-pop-dtl").getEl().mask("Please wait...", "x-mask-loading");
              Ext.Ajax.request({
                url: "api/mn_arBillApprove.php",
                method: "POST",
                params: {
                  mode: "SEND_DATA",
                  d_start: Ext.util.Format.gridDate(getStoreItems(Ext.groupdate, Ext.getCmp("i_groupdate").getValue(), "d_start"), "Y-m-d"),
                  d_end: Ext.util.Format.gridDate(getStoreItems(Ext.groupdate, Ext.getCmp("i_groupdate").getValue(), "d_end"), "Y-m-d"),
                  data: JSON.stringify(jsonArr),
                },
                success: function (result, request) {
                  Ext.getCmp("win-pop-dtl").getEl().unmask();
                  let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                  if (jsonData.success) {
                    Ext.store.load();
                  } else {
                    Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + jsonData.msg + "</span>");
                  }
                  Ext.getCmp("win-pop-dtl").destroy();
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
              Ext.getCmp("win-pop-dtl").destroy();
            },
          },
        ],
      }).show();
    } else {
      Ext.Msg.alert("แจ้งเตือน", msg);
    }
  };

  const backData = function (id) {
    let msg = "";

    if (msg == "") {
      new Ext.Window({
        title: "บันทึก",
        id: "win-pop-dtl",
        title: "แจ้งเตือน",
        modal: true,
        width: 250,
        height: 130,
        html: "ท่านต้องการคืนค่าข้อมูล ?",
        buttons: [
          {
            text: Ext.GLOBAL_BU_SAVE_TH,
            iconCls: "icon-save",
            handler: function () {
              Ext.getCmp("win-pop-dtl").getEl().mask("Please wait...", "x-mask-loading");
              Ext.Ajax.request({
                url: "api/mn_arBillApprove.php",
                method: "POST",
                params: {
                  mode: "BACK_DATA",
                  id: id,
                },
                success: function (result, request) {
                  Ext.getCmp("win-pop-dtl").getEl().unmask();
                  let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                  if (jsonData.success) {
                    Ext.store.load();
                  } else {
                    Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + jsonData.msg + "</span>");
                  }
                  Ext.getCmp("win-pop-dtl").destroy();
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
              Ext.getCmp("win-pop-dtl").destroy();
            },
          },
        ],
      }).show();
    } else {
      Ext.Msg.alert("แจ้งเตือน", msg);
    }
  };

  const saveLogApprove = function () {
    let msg = "";

    if (msg == "") {
      new Ext.Window({
        title: "บันทึก",
        id: "win-pop-dtl",
        title: "แจ้งเตือน",
        modal: true,
        width: 250,
        height: 130,
        html: "ท่านต้องการประมวลรายการ ?",
        buttons: [
          {
            text: Ext.GLOBAL_BU_SAVE_TH,
            iconCls: "icon-save",
            handler: function () {
              Ext.getCmp("win-pop-dtl").getEl().mask("Please wait...", "x-mask-loading");
              Ext.Ajax.request({
                url: "api/mn_arBillApprove.php",
                method: "POST",
                params: {
                  mode: "SAVE_LOG_APPROVE",
                  d_start: Ext.util.Format.gridDate(getStoreItems(Ext.groupdate, Ext.getCmp("i_groupdate").getValue(), "d_start"), "Y-m-d"),
                  d_end: Ext.util.Format.gridDate(getStoreItems(Ext.groupdate, Ext.getCmp("i_groupdate").getValue(), "d_end"), "Y-m-d"),
                },
                success: function (result, request) {
                  Ext.getCmp("win-pop-dtl").getEl().unmask();
                  let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                  if (jsonData.success) {
                    chkLoadingStore(myComboStores, "contenterCenter", function () {
                      search();
                    });
                  }
                  if (jsonData.msg != "") {
                    Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + jsonData.msg + "</span>");
                  }
                  Ext.getCmp("win-pop-dtl").destroy();
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
              Ext.getCmp("win-pop-dtl").destroy();
            },
          },
        ],
      }).show();
    } else {
      Ext.Msg.alert("แจ้งเตือน", msg);
    }
  };
  // ================================ gridMain ================================ //
  cellClick = function (grid, rowIndex, columnIndex, e) {
    let record = grid.getStore().getAt(rowIndex);
    if (record.data.ar_bill_hdr_id > 0) {
      if (record.data.i_status == 1) {
        if (columnIndex == grid.getColumnModel().getIndexById("checked")) {
          backData(record.data.ar_bill_hdr_id);
        }
      } else {
        if (columnIndex != grid.getColumnModel().getIndexById("checked")) {
          if (document.getElementById("chk[" + record.data.id + "]").checked) {
            document.getElementById("chk[" + record.data.id + "]").checked = false;
          } else {
            document.getElementById("chk[" + record.data.id + "]").checked = true;
          }
        }
        changePrice();
      }
    }

    if (columnIndex == grid.getColumnModel().getIndexById("print")) {
      if (record.get("preview_id") > 0) {
        Preview(record.data.preview_id);
      }
    }
  }; //cellClick

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

      let d_start = getStoreItems(Ext.groupdate, Ext.getCmp("i_groupdate").getValue(), "d_start");
      let d_end = getStoreItems(Ext.groupdate, Ext.getCmp("i_groupdate").getValue(), "d_end");

      Ext.store.setBaseParam("d_start", Ext.util.Format.gridDate(d_start, "Y-m-d"));
      Ext.store.setBaseParam("d_end", Ext.util.Format.gridDate(d_end, "Y-m-d"));
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
      deferEmptyText: false,
      getRowClass: function (record) {
        if (record.data.i_type == 2) {
          if (record.data.i_status == 1) {
            return "td-success";
          } else {
            return "td-error";
          }
        }
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
                width: 120,
                mode: "local",
                store: new Ext.data.SimpleStore({
                  fields: ["value", "text"],
                  data: [["c_code_bill", "เลขที่ใบเรียกเก็บ"]],
                }),
                value: "c_code_bill",
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
                width: 180,
                fieldLabel: "fieldLabel",
                emptyText: "คำที่ต้องการค้นหา",
              },
            ],
          },
          {
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", text: "วันที่แก้ไขล่าสุด : " },
              { xtype: "tbspacer", width: 4 },
              new Ext.form.ComboBox({
                id: "i_groupdate",
                mode: "local",
                store: Ext.groupdate,
                valueField: "id",
                displayField: "c_name",
                triggerAction: "all",
                forceSelection: true,
                selectOnFocus: true,
                typeAhead: false,
                emptyText: "กรุณาเลือก...",
                width: 304,
                value: 1,
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
      {
        header: "เลขที่ใบเรียกเก็บ",
        sortable: false,
        align: "center",
        width: 100,
        dataIndex: "c_code_bill",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = 'style="font-weight: bold; color: green;"';
          return value;
        },
      },
      {
        header: "-",
        id: "print",
        sortable: true,
        dataIndex: "preview_id",
        width: 40,
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "align='center'";
          if (record.get("preview_id") > 0) {
            return "<div style='cursor:pointer'><img src='../images/icons/printer_mono.png' style='margin-right:1px;' /><div>";
          } else {
            return "";
          }
        },
      },
      {
        header: "วันที่เรียกเก็บเงิน",
        sortable: true,
        align: "center",
        dataIndex: "d_bill_date",
        width: 100,
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          return value != "" ? shortThaiDate(value) : "";
        },
      },
      {
        header: "ประเภทลูกหนี้",
        sortable: false,
        align: "center",
        width: 200,
        dataIndex: "ar_debtor_type_name",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          return value;
        },
      },
      {
        header: "หน่วยงาน",
        sortable: false,
        align: "center",
        width: 240,
        dataIndex: "ar_cost_name",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          return value;
        },
      },
      {
        header: "กลุ่มสิทธิ์การรักษา",
        sortable: false,
        align: "center",
        width: 200,
        dataIndex: "ar_treat_right_group_name",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          return value;
        },
      },
      {
        id: "ar_treat_right",
        header: "สิทธิ์การรักษา",
        sortable: false,
        align: "center",
        width: 200,
        dataIndex: "ar_treat_right_name",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          if (record.data.i_type == 1) {
            metaData.attr = 'style="text-align: left;"';
            return value;
          } else {
            metaData.attr = 'style="text-align: right;"';
            return "รวมทั้งหมด";
          }
        },
      },
      {
        id: "checked",
        header: "<div class='topAlign'><input id='checkAll' type='checkbox' onclick='checkAll(this.checked)'></div>",
        sortable: false,
        align: "center",
        width: 50,
        dataIndex: "ar_bill_hdr_id",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          if (record.get("ar_bill_hdr_id") > 0) {
            if (record.get("i_status") == 1) {
              return "<button style='font-size:11px; cursor:pointer; color: red;'>คืนค่า</button>";
            } else {
              Ext.objChk[value] = "chk[" + value + "]";
              return "<input type='checkbox' id='chk[" + value + "]' value=" + value + " " + (record.get("i_chk") ? "checked" : "") + ">";
            }
          } else {
            return "";
          }
        },
      },
      {
        header: "จำนวนเงินเรียกเก็บ",
        sortable: false,
        align: "center",
        width: 140,
        dataIndex: "f_bill",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          if (record.data.i_type == 1) {
            metaData.attr = 'style="text-align: right;"';
          } else {
            metaData.attr = 'style="font-weight: bold; text-align: right;"';
          }
          return floatRenderer(floatMinus(value, 2));
        },
      },
      { width: 40, dataIndex: "" },
    ],
    autoExpandColumn: "ar_treat_right",
    bbar: [
      { xtype: "tbfill" },
      {
        xtype: "buttongroup",
        columns: 1,
        defaults: { scale: "small", style: "float: right" },
        items: [
          {
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", text: "ช่วงเดือน : " },
              { xtype: "tbspacer", width: 4 },
              { id: "text_month", xtype: "displayfield", style: "text-align: left; font-weight: bold;", width: 175, readOnly: true },
            ],
          },
          {
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", text: "จำนวนเงินที่เลือก : " },
              { xtype: "tbspacer", width: 4 },
              { id: "f_select", xtype: "textfield", style: "text-align: right; font-weight: bold;", width: 150, readOnly: true },
              { xtype: "tbspacer", width: 4 },
              { xtype: "label", text: "บาท" },
            ],
          },
          {
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", text: "จำนวนที่ตรวจสอบ : " },
              { xtype: "tbspacer", width: 4 },
              { id: "f_approve", xtype: "textfield", style: "text-align: right; font-weight: bold;", width: 150, readOnly: true },
              { xtype: "tbspacer", width: 4 },
              { xtype: "label", text: "บาท" },
            ],
          },
          {
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", text: "จำนวนเงินทั้งหมด : " },
              { xtype: "tbspacer", width: 4 },
              { id: "f_total", xtype: "textfield", style: "text-align: right; font-weight: bold;", width: 150, readOnly: true },
              { xtype: "tbspacer", width: 4 },
              { xtype: "label", text: "บาท" },
            ],
          },
          {
            xtype: "buttongroup",
            frame: false,
            items: [
              {
                text: "&nbsp;บันทึกตรวจสอบรายการ&nbsp;",
                iconCls: "icon-save",
                style: "padding-top: 10px",
                // scale: "medium",
                handler: function () {
                  sendData();
                },
              },
              { xtype: "tbspacer", width: 80 },
              {
                text: "&nbsp;ประมวลผลรายการ&nbsp;",
                iconCls: "database_start",
                style: "padding-top: 10px",
                // scale: "medium",
                handler: function () {
                  saveLogApprove();
                },
              },
            ],
          },
        ],
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

  let myComboStores = [Ext.groupdate];
  chkLoadingStore(myComboStores, "contenterCenter", function () {
    search();
  });

  new Ext.KeyNav("tabpanel1", {
    enter: function (e) {
      search();
    },
    scope: this,
  });
});
