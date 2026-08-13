genText = function (val) {
  var text = "";
  if (val == -1) {
    text = "-";
  } else if (val == 3) {
    text = "<font color=green>สมบูรณ์</font>";
  } else if (val == 2) {
    text = "<font color=blue>รอประมวลผลบัญชี</font>";
  } else if (val == 1) {
    text = "<button style='font-size:11px; cursor:pointer; color: red; width: 100%;'>โหลด API อีกครั้ง</button>";
  } else {
    text = "<button style='font-size:11px; cursor:pointer; color: green; width: 100%;'>โหลด API</button>";
  }
  return text;
};

Ext.onReady(function () {
  Ext.QuickTips.init();
  Ext.objChk = [];
  /*===============================================*/
  Ext.title_panel = "ข้อมูล api";

  const sendData = function (data, type) {
    let msg = "";

    if (type == "bill") {
      txt = "เรียกเก็บ";
    } else if (type == "bill_cancel") {
      txt = "ยกเลิกเรียกเก็บ";
    } else if (type == "cut") {
      txt = "ตัดชำระ";
    } else if (type == "cut_cancel") {
      txt = "ยกเลิกตัดชำระ";
    }

    if (msg == "") {
      new Ext.Window({
        title: "บันทึก",
        id: "win-pop-dtl",
        title: "แจ้งเตือน",
        modal: true,
        width: 250,
        height: 130,
        html: "<div style='text-align:center; background: #fff; width: 100%; height: 100%;'><span style='font-size: 16px; font-weight: bold;'>" + txt + "</span><br>ท่านต้องการโหลด API<br>ณ วันที่ " + data.d_start + " : " + data.d_end + "</div>",
        buttons: [
          {
            text: Ext.GLOBAL_BU_SAVE_TH,
            iconCls: "icon-save",
            handler: function () {
              Ext.getCmp("win-pop-dtl").getEl().mask("Please wait...", "x-mask-loading");
              Ext.Ajax.request({
                url: "api/mn_arLoadApi.php",
                method: "POST",
                params: {
                  mode: "LOAD_API",
                  type: type,
                  d_start: Ext.util.Format.gridDate(data.d_start, "Y-m-d"),
                  d_end: Ext.util.Format.gridDate(data.d_end, "Y-m-d"),
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
                  Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>กรุณาโหลด api ใหม่อีกครั้ง !!!</span>");
                  Ext.getCmp("win-pop-dtl").destroy();
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

    if (columnIndex == grid.getColumnModel().getIndexById("i_bill")) {
      if (record.data.i_success_bill == 0 || record.data.i_success_bill == 1) {
        sendData(record.data, "bill");
      }
    } else if (columnIndex == grid.getColumnModel().getIndexById("i_bill_cancel")) {
      if (record.data.i_success_bill_cancel == 0 || record.data.i_success_bill_cancel == 1) {
        sendData(record.data, "bill_cancel");
      }
    } else if (columnIndex == grid.getColumnModel().getIndexById("i_cut")) {
      if (record.data.i_success_cut == 0 || record.data.i_success_cut == 1) {
        sendData(record.data, "cut");
      }
    } else if (columnIndex == grid.getColumnModel().getIndexById("i_cut_cancel")) {
      if (record.data.i_success_cut_cancel == 0 || record.data.i_success_cut_cancel == 1) {
        sendData(record.data, "cut_cancel");
      }
    }
  }; //cellClick

  const search = function () {
    var msg = "";
    if (msg == "") {
      Ext.store.setBaseParam("mode", "SEARCH");
      Ext.store.setBaseParam("i_year", Ext.getCmp("i_year").getValue());
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
              { xtype: "label", text: "ปีงบประมาณ : " },
              { xtype: "tbspacer", width: 4 },
              new Ext.form.ComboBox({
                id: "i_year",
                mode: "local",
                store: Ext.store_year,
                valueField: "id",
                displayField: "c_name",
                triggerAction: "all",
                forceSelection: true,
                selectOnFocus: true,
                typeAhead: false,
                emptyText: "กรุณาเลือก...",
                width: 200,
                value: new Date().getMonth() < 10 ? new Date().getFullYear() : new Date().getFullYear() - 1,
                listeners: {
                  afterrender: function () {
                    this.fn = function () {};
                    search();
                  },
                  change: function (combo, newValue) {
                    if (newValue == "") {
                      combo.reset();
                    }
                    search();
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
        id: "d_date",
        header: "วันที่",
        sortable: true,
        width: 150,
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = 'style="text-align:center;"';

          var d_start = shortThaiDate(record.data.d_start);
          var d_end = shortThaiDate(record.data.d_end);

          return d_start.slice(0, -5) + " - " + d_end;
        },
      },
      {
        id: "i_bill",
        header: "เรียกเก็บ<br>(วันที่แก้ไขล่าสุด)",
        sortable: true,
        dataIndex: "i_success_bill",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = 'style="text-align:center;"';
          return genText(value);
        },
      },
      {
        id: "i_bill_cancel",
        header: "ยกเลิกเรียกเก็บ<br>(วันที่ยกเลิก)",
        sortable: true,
        dataIndex: "i_success_bill_cancel",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = 'style="text-align:center;"';
          return genText(value);
        },
      },
      {
        id: "i_cut",
        header: "ตัดชำระ<br>(วันที่แก้ไขล่าสุด)",
        sortable: true,
        dataIndex: "i_success_cut",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = 'style="text-align:center;"';
          return genText(value);
        },
      },
      {
        id: "i_cut_cancel",
        header: "ยกเลิกตัดชำระ<br>(วันที่ยกเลิก)",
        sortable: true,
        dataIndex: "i_success_cut_cancel",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = 'style="text-align:center;"';
          return genText(value);
        },
      },

      { width: 40, dataIndex: "" },
    ],
    autoExpandColumn: "d_date",
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

  new Ext.KeyNav("tabpanel1", {
    enter: function (e) {
      search();
    },
    scope: this,
  });
});
