Ext.onReady(function () {
  Ext.QuickTips.init();
  /*===============================================*/
  Ext.title_panel = "รับและคืนเงินหลังตรวจสอบเวชระเบียน";
  /*===============================================*/

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
              url: "api/mn_arCutAdjust.php",
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

  const search = function () {
    var msg = "";
    if (msg == "") {
      if (Ext.getCmp("c_code_cut").getValue() != "") {
        Ext.store.setBaseParam("c_code_cut", Ext.getCmp("c_code_cut").getValue());
      } else {
        Ext.store.setBaseParam("c_code_cut", "");
      }
      if (Ext.getCmp("c_hn").getValue() != "") {
        Ext.store.setBaseParam("c_hn", Ext.getCmp("c_hn").getValue());
      } else {
        Ext.store.setBaseParam("c_hn", "");
      }
      Ext.store.setBaseParam("mode", "SEARCH");
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
              { xtype: "label", text: "เลขที่ตัดชำระ : " },
              { xtype: "tbspacer", width: 4 },
              {
                xtype: "textfield",
                id: "c_code_cut",
                width: 200,
              },
            ],
          },
          {
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", text: "HN : " },
              { xtype: "tbspacer", width: 4 },
              {
                xtype: "textfield",
                id: "c_hn",
                width: 200,
              },
            ],
          },
          {
            xtype: "buttongroup",
            frame: false,
            items: [{ xtype: "label", text: "** แสดงข้อมูลล่าสุด 50 รายการ" }],
          },
        ],
        buttonAlign: "left",
        buttons: [
          {
            text: "เพิ่มข้อมูล",
            id: "buAdd",
            iconCls: "icon-add",
            handler: function (grid, rowIndex, colIndex) {
              popDtl();
            },
          },
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
        header: "เลขที่ตัดชำระ",
        sortable: false,
        align: "center",
        width: 100,
        dataIndex: "c_code_cut",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "align='center'";
          return value;
        },
      },
      {
        header: "วันที่ตัดชำระ",
        sortable: true,
        align: "center",
        dataIndex: "d_cut_date",
        width: 100,
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          return value != "" ? shortThaiDate(value) : "";
        },
      },
      { header: "สิทธิ์การรักษา", sortable: false, align: "center", width: 180, dataIndex: "ar_treat_right_name" },
      { header: "หน่วยงาน", sortable: false, align: "center", width: 180, dataIndex: "ar_cost_name" },
      { header: "HN", sortable: false, align: "center", width: 75, dataIndex: "c_hn" },
      { header: "AN", sortable: false, align: "center", width: 75, dataIndex: "c_an" },
      {
        header: "ชื่อผู้ป่วย",
        sortable: false,
        align: "center",
        width: 130,
        dataIndex: "c_patient",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "style='text-align:left;'";
          return value;
        },
      },
      {
        header: "วันที่รับบริการ",
        sortable: true,
        align: "center",
        dataIndex: "d_service_date",
        width: 90,
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          return value != "" ? shortThaiDate(value) + "<br>" + record.data.c_service_time : "";
        },
      },
      {
        header: "วันที่จำหน่าย",
        sortable: true,
        align: "center",
        dataIndex: "d_encash_date",
        width: 90,
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          return value != "" ? shortThaiDate(value) + "<br>" + record.data.c_encash_time : "";
        },
      },
      {
        header: "จำนวนเงินตัดชำระ",
        sortable: false,
        align: "center",
        width: 100,
        dataIndex: "f_cut",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "style='text-align: right; color: blue; font-weight: bold;'";
          return floatRenderer(floatMinus(value.replace(/,/g, ""), 2));
        },
      },
      {
        header: "รับเพิ่ม",
        sortable: false,
        align: "center",
        dataIndex: "f_dr",
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
        header: "คืนเงิน",
        sortable: false,
        align: "center",
        dataIndex: "f_cr",
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
        header: "คงเหลือ",
        sortable: false,
        align: "center",
        dataIndex: "f_total",
        width: 110,
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          if (value) {
            metaData.attr = "style='text-align: right; color: blue; font-weight: bold;'";
            return floatRenderer(floatMinus(value.replace(/,/g, ""), 2));
          } else {
            metaData.attr = "style='text-align: right; color:red;'";
            return "-";
          }
        },
      },
      {
        header: "หมายเหตุ",
        sortable: false,
        align: "center",
        dataIndex: "c_comment",
        width: 300,
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "style='text-align: left;'";
          return "<pre>" + value + "</pre>";
        },
      },
      { width: 40, dataIndex: "" },
    ],
    //     autoExpandColumn: "c_name",
    bbar: Ext.pagingBar,
  }); //gridMain

  Ext.DELETE_ID = null;
  let menu = new Ext.menu.Menu({
    items: [
      {
        iconCls: "icon-delete",
        text: "ลบรายการ",
        handler: function () {
          deleteAdjust(Ext.DELETE_ID);
        },
      },
    ],
  });

  Ext.getCmp("tabpanel1").on("cellcontextmenu", function (record, rowIndex, cellIndex, e) {
    var record = Ext.store.getAt(rowIndex).data;
    Ext.DELETE_ID = record.id;
    menu.showAt(Ext.EventObject.getXY());
    Ext.EventObject.stopEvent();
  });
  /*====================== CENTER ======================*/
  center = new Ext.TabPanel({
    region: "center",
    border: false,
    //activeTab: 0, //default Tab
    id: "contenterCenter",
    defaults: { autoScroll: true },
    items: [gridMain],
  });
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
