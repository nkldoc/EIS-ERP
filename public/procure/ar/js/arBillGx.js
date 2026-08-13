Ext.onReady(function () {
  Ext.QuickTips.init();

  /* =============================================== */
  Ext.title_panel = "ประมวลผลลูกหนี้";
  /* =============================================== */

  Ext.store = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "api/List_arBillGx.php",
    baseParams: { type: "ar_bill", i_read: user_right_read }, // Permission i_read
    root: "data",
    idProperty: "id",
    totalProperty: "totalCount",
    fields: [
      {
        name: "i_type",
      },
      { name: "no" },
      { name: "id" },
      { name: "c_name" },
      { name: "f_bill" },
      { name: "f_cut" },
    ],
  });

  Ext.groupdate = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "api/All_arBillGx.php",
    baseParams: { type: "GROUP_DATE" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name", "d_start", "d_end"],
    listeners: {
      load: function (t, records, options) {
        Ext.getCmp("i_groupdate").setValue("1");
      },
    },
  });

  const saveData = function (type) {
    let msg = "";
    var c_name = "";
    if (type == "bill") {
      c_name = "ใบเรียกเก็บ";
    } else if (type == "cut") {
      c_name = "ตัดชำระ";
    }

    if (msg == "") {
      new Ext.Window({
        title: "บันทึก",
        id: "win-pop-dtl",
        title: "แจ้งเตือน",
        modal: true,
        width: 400,
        height: 150,
        html: "<div style='padding-top: 16px; text-align: center; background: #fff; font-size: 15px;height: 100%;width: 100%;'>ท่านต้องการประมวลผล \"" + c_name + '" ใช่หรือไม่</div>',
        buttons: [
          {
            text: Ext.GLOBAL_BU_SAVE_TH,
            iconCls: "icon-save",
            handler: function () {
              Ext.getCmp("win-pop-dtl").getEl().mask("Please wait...", "x-mask-loading");
              Ext.Ajax.request({
                url: "api/mn_arBillGx.php",
                method: "POST",
                params: {
                  mode: "SAVE_DATA",
                  type: type,
                  d_start: Ext.util.Format.gridDate(getStoreItems(Ext.groupdate, Ext.getCmp("i_groupdate").getValue(), "d_start"), "Y-m-d"),
                  d_end: Ext.util.Format.gridDate(getStoreItems(Ext.groupdate, Ext.getCmp("i_groupdate").getValue(), "d_end"), "Y-m-d"),
                },
                success: function (result, request) {
                  Ext.getCmp("win-pop-dtl").getEl().unmask();
                  let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                  if (jsonData.success) {
                    Ext.store.load();
                    Ext.groupdate.load();
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

  const search = function () {
    Ext.store.setBaseParam("mode", "SEARCH");
    let d_start = getStoreItems(Ext.groupdate, Ext.getCmp("i_groupdate").getValue(), "d_start");
    let d_end = getStoreItems(Ext.groupdate, Ext.getCmp("i_groupdate").getValue(), "d_end");

    Ext.store.setBaseParam("d_start", Ext.util.Format.gridDate(d_start, "Y-m-d"));
    Ext.store.setBaseParam("d_end", Ext.util.Format.gridDate(d_end, "Y-m-d"));
    Ext.store.load();
  };

  const gridMain = new Ext.grid.GridPanel({
    region: "center",
    layout: "fit",
    border: true,
    stripeRows: true,
    loadMask: true,
    store: Ext.store,
    viewConfig: {
      emptyText: "ไม่มีข้อมูล..",
      deferEmptyText: false,
      getRowClass: function (record) {
        if (record.data.i_type == 2) {
          return "td-sum";
        }
      },
    },
    height: 300,
    columns: [
      {
        header: "กลุ่มสิทธิ์การรักษา",
        sortable: false,
        align: "center",
        width: 400,
        dataIndex: "c_name",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          if (record.data.i_type == 1) {
            metaData.attr = 'style="font-weight: bold; color: green;"';
          } else {
            metaData.attr = 'style="font-weight: bold; text-align: right;"';
          }
          return value;
        },
      },
      {
        header: "จำนวนเงินเรียกเก็บ",
        sortable: false,
        align: "center",
        width: 150,
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
      // {
      //   header: "ยกเลิกเรียกเก็บ",
      //   sortable: false,
      //   align: "center",
      //   width: 150,
      //   dataIndex: "f_bill_cancel",
      //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
      //     if (record.data.i_type == 1) {
      //       metaData.attr = 'style="text-align: right;"';
      //     } else {
      //       metaData.attr = 'style="font-weight: bold; text-align: right;"';
      //     }
      //     return floatRenderer(floatMinus(value, 2));
      //   },
      // },
      {
        header: "จำนวนเงินตัดชำระ",
        sortable: false,
        align: "center",
        width: 200,
        dataIndex: "f_cut",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          if (record.data.i_type == 1) {
            metaData.attr = 'style="text-align: right;"';
          } else {
            metaData.attr = 'style="font-weight: bold; text-align: right;"';
          }
          return floatRenderer(floatMinus(value, 2));
        },
      },
      {
        header: "จำนวนเงินยกเลิก",
        sortable: false,
        align: "center",
        width: 200,
        dataIndex: "f_total_amt3",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          if (record.data.i_type == 1) {
            metaData.attr = 'style="text-align: right;"';
          } else {
            metaData.attr = 'style="font-weight: bold; text-align: right;"';
          }
          return floatRenderer(floatMinus(value, 2));
        },
      },
    ],
    // autoExpandColumn: "ar_treat_right",
  }); //gridMain

  var panelForm = new Ext.Panel({
    region: "center",
    title: Ext.title_panel,
    border: false,
    stripeRows: true,
    loadMask: true,
    items: [
      {
        xtype: "form",
        frame: true,
        labelAlign: "right",
        labelWidth: 200,
        bodyStyle: { padding: "10px 20px" },
        defaults: {
          anchor: "100%",
          msgTarget: "side",
          allowBlank: false,
        },
        items: [
          {
            xtype: "container",
            layout: "hbox",
            align: "stretch",
            RemoveHeight: true,
            defaults: {
              xtype: "fieldset",
              flex: 1,
              margins: "0px 3px",
              autoHeight: true,
            },
            items: [
              {
                title: "เมนู " + Ext.title_panel,
                RemoveCls: "x-box-item",
                defaults: {
                  labelStyle: "width:200px;",
                  allowBlank: true,
                },
                items: [
                  new Ext.form.ComboBox({
                    fieldLabel: "วันที่แก้ไขล่าสุด",
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
        buttonAlign: "left",
        buttons: [
          {
            text: "ประมวลยอดเรียกเก็บ",
            iconCls: "database_start",
            handler: function () {
              saveData("bill");
            }, // End Handle
          },
          {
            text: "ประมวลยอดตัดชำระ",
            iconCls: "database_start",
            handler: function () {
              saveData("cut");
            }, // End Handle
          },
          // {
          //   text: "ประมวลยอดยกเลิก",
          //   iconCls: "database_start",
          //   handler: function () {
          //     // LookReport("html");
          //   }, // End Handle
          // },
        ],
      },
      {
        border: false,
        bodyStyle: { padding: "5px 10px" },
        defaults: { anchor: "100%", msgTarget: "side", allowBlank: false },
        buttonAlign: "left",
        items: [
          {
            xtype: "container",
            layout: "hbox",
            align: "stretch",
            defaults: { xtype: "fieldset", flex: 1, margins: "0px 3px", autoHeight: true },
            items: [
              {
                title: "เดือนปี ที่บันทึกงวดบัญชีแล้ว(เมนูปิดงวดเดือน)",
                defaults: { anchor: "100%" },
                items: [gridMain],
              },
            ],
          },
        ],
      },
    ],
  }); // panelForm

  /* ====================== CENTER ====================== */
  var center = new Ext.TabPanel({
    region: "center",
    border: false,
    activeTab: 0, // default Tab
    id: "contenterCenter",
    defaults: { autoScroll: true },
    items: [panelForm],
  });

  /* ====================== RENDER ====================== */
  new Ext.Viewport({
    layout: "border",
    items: [center],
  });

  let myComboStores = [Ext.groupdate];
  chkLoadingStore(myComboStores, "contenterCenter", function () {
    search();
  });
});
