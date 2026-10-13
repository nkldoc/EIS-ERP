genTextButton1 = function (val) {
  var text = "";
  if (val == 1) {
    // text = "<button style='font-size:11px; cursor:pointer; color: red; width: 100%;'>คำนวณค่าเสื่อมอีกครั้ง</button>";
    text = "<text style='font-size:11px; cursor:pointer; color: red; width: 100%;'disabled>คำนวณค่าเสื่อมแล้ว</text>";
  } else if (val == 2) {
    text = "-";
  } else {
    text = "<button style='font-size:11px; cursor:pointer; color: green; width: 100%;'>คำนวณค่าเสื่อม</button>";
  }
  return text;
};

genTextButton2 = function (val) {
  var text = "";
  if (val == 1) {
    // text = "<button style='font-size:11px; cursor:pointer; color: red; width: 100%;'>คำนวณสินทรัพย์บริจาคอีกครั้ง</button>";
    text = "<button style='font-size:11px; cursor:pointer; color: red; width: 100%; 'disabled>คำนวณสินทรัพย์บริจาคแล้ว</button>";
  } else if (val == 2) {
    text = "-";
  } else {
    text = "<button style='font-size:11px; cursor:pointer; color: green; width: 100%;'>คำนวณสินทรัพย์บริจาค</button>";
  }
  return text;
};

Ext.onReady(function () {
  Ext.QuickTips.init();
  Ext.objChk = [];
  /*===============================================*/
  Ext.title_panel = "ประมวลผลค่าเสื่อม";

  const sendData = function (data, type) {
    let msg = "";

    if (type == "process_am_cal_depre") {
      txt = "คำนวณค่าเสื่อม";
    } else if (type == "process_am_send_donate") {
      txt = "คำนวณสินทรัพย์บริจาค";
    }

    if (msg == "") {
      new Ext.Window({
        title: "บันทึก",
        id: "win-pop-dtl",
        title: "แจ้งเตือน",
        modal: true,
        width: 250,
        height: 130,
        html: "<div style='text-align:center; background: #fff; width: 100%; height: 100%;'><span style='font-size: 16px; font-weight: bold;'>" + txt + "</span><br>ท่านต้องการประมวลผลลูกหนี้ค้างรับประจำเดือน<br>" + data.s_mm + "  " + data.s_yyyy + "</div>",
        buttons: [
          {
            text: Ext.GLOBAL_BU_SAVE_TH,
            iconCls: "icon-save",
            handler: function () {
              Ext.getCmp("win-pop-dtl").getEl().mask("Please wait...", "x-mask-loading");
              Ext.Ajax.request({
                url: "api/mn_amCalDepre.php",
                method: "POST",
                params: {
                  mode: type,
                  // type: type,
                  c_mm: data.c_mm,
                  c_yyyy: data.c_yyyy,
                  i_budget_year: Ext.getCmp("i_year").getValue(),
                  c_yyyy_mm: data.c_yyyy_mm,
                  am_cal_depre_id: data.am_cal_depre_id,
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
                  Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>กรุณาประมวลผล ใหม่อีกครั้ง !!!</span>");
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

  // const LookReport = function (type, c_mm, c_yyyy) {
  //   var msg = "";

  //   var href = "report/Rep_BIAccruedIncomeMonthGroup.php";

  //   var resultUrl = "";

  //   resultUrl += "&type=" + type;
  //   resultUrl += "&c_mm=" + c_mm;
  //   resultUrl += "&c_yyyy=" + c_yyyy;

  //   resultUrl = resultUrl != "" ? "?" + resultUrl.substring(1) : "";

  //   window.open(href + resultUrl, href);
  //   window.focus();
  // };

  // ================================ gridMain ================================ //
  cellClick = function (grid, rowIndex, columnIndex, e) {
    let record = grid.getStore().getAt(rowIndex);

    if (columnIndex == grid.getColumnModel().getIndexById("i_am_cal_depre")) {
      if (record.data.i_am_cal_depre == 0) {
        sendData(record.data, "process_am_cal_depre");
      }
    }
    if (columnIndex == grid.getColumnModel().getIndexById("i_am_send_donate")) {
      if (record.data.i_am_send_donate == 0) {
        sendData(record.data, "process_am_send_donate");
      }
    }

    // if (columnIndex == grid.getColumnModel().getIndexById("i_report")) {
    //   if (record.data.i_is_process == 1) {
    //     var c_mm = record.data.c_mm;
    //     var c_yyyy = record.data.c_yyyy;
    //     LookReport("html", c_mm, c_yyyy);
    //   }
    // }
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
                // readOnly: true,
                valueField: "id",
                displayField: "c_name",
                triggerAction: "all",
                forceSelection: true,
                selectOnFocus: true,
                typeAhead: false,
                emptyText: "กรุณาเลือก...",
                width: 200,
                value: new Date().getMonth() < 10 ? new Date().getFullYear() : new Date().getFullYear(),
                listeners: {
                  afterrender: function () {
                    this.fn = function () {};
                    search();
                  },
                  select: function (combo, newValue) {
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
        header: "เดือน ปี ที่ประมวลผล",
        sortable: true,
        width: 150,
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = 'style="text-align:center;"';
          return record.data.s_mm + "  " + record.data.s_yyyy;
        },
      },
      {
        id: "i_am_cal_depre",
        header: "#",
        sortable: true,
        width: 160,
        dataIndex: "i_am_cal_depre",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = 'style="text-align:center;"';
          return genTextButton1(value);
        },
      },
      
      { width: 120, dataIndex: "" },
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
