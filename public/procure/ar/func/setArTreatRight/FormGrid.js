Ext.onReady(function () {
  Ext.QuickTips.init();
  /*===============================================*/
  Ext.title_panel = "กำหนดสิทธิ์การรักษา";
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
      Ext.store.load();
    } else {
      Ext.Msg.alert("แจ้งเตือน", msg);
    }
  };

  // save dtl ADD && EDIT
  const saveDtl = function () {
    let msg = "";
    let jsonArr = [];
    let sto = Ext.getCmp("tabpanel1").store.data.items;
    sto.forEach(function (v) {
      jsonArr.push({
        ar_treat_right_id: v.data.id,
        ar_treat_right_group_id: v.data.ar_treat_right_group_id,
      });
    });

    if (msg == "") {
      Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
      Ext.Ajax.request({
        url: "api/mn_setArTreatRight.php",
        method: "POST",
        params: {
          mode: "EDIT",
          data: JSON.stringify(jsonArr),
        },
        success: function (result, request) {
          Ext.getCmp("contenterCenter").getEl().unmask();
          let json = Ext.util.JSON.decode(result.responseText); //decode json
          Ext.Msg.alert("แจ้งเตือน", json.msg);
          if (json.success == true) {
            Ext.Msg.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย");
            Ext.store.load();
          }
        },
        failure: function (result, request) {
          Ext.MessageBox.alert("Failed", result.responseText); // connect error
        },
      });
    } else {
      Ext.Msg.alert("แจ้งเตือน", msg);
    }
  }; // saveDtl

  // gridMain
  const gridMain = new Ext.grid.EditorGridPanel({
    region: "center",
    layout: "fit",
    title: "แสดงรายการ" + Ext.title_panel,
    id: "tabpanel1",
    border: false,
    stripeRows: true,
    loadMask: true,
    clicksToEdit: 1,
    store: Ext.store,
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
                  data: [["c_name", "ชื่อสิทธิ์"]],
                }),
                value: "c_name",
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
          metaData.attr = "style='cursor:pointer; text-align:center;';";
          return record.get("no");
        },
      }),
      {
        header: "กลุ่มสิทธิ์การรักษา",
        sortable: false,
        align: "center",
        dataIndex: "ar_treat_right_group_id",
        width: 200,
        editor: new Ext.form.ComboBox({
          mode: "local",
          id: "editor_ar_treat_right_group_id",
          store: Ext.ar_treat_right_group,
          valueField: "id",
          displayField: "c_name",
          triggerAction: "all",
          forceSelection: true,
          selectOnFocus: true,
          typeAhead: false,
          emptyText: "กรุณาเลือก...",
          listeners: {
            afterrender: function () {
              this.fn = function () {};
            },
            Change: function () {
              this.fn();
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
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          if (value != "" && value != undefined) {
            metaData.attr = "style='text-align: center;'";
            let name = getStoreItems(Ext.ar_treat_right_group, value, "c_name");
            return name;
          } else {
            metaData.attr = "style='text-align: center; color:red;'";
            return "-";
          }
        },
      },
      {
        header: "ชื่อสิทธิ์",
        sortable: false,
        align: "center",
        dataIndex: "c_name",
        width: 300,
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "style='text-align: left;'";
          return value;
        },
      },
      {
        header: "สถานะใช้งาน",
        sortable: true,
        align: "center",
        dataIndex: "i_enable",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          if (value == 1) {
            return "<span style='color:green;'>ใช้งาน</span>";
          } else {
            return "<span style='color:red;'>ไม่ใช้งาน</span>";
          }
        },
      },
      // {
      //   header: "วันที่ทำรายการล่าสุด",
      //   sortable: true,
      //   align: "center",
      //   dataIndex: "d_update",
      //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
      //     return value != "" ? shortThaiDate(value) : "";
      //   },
      // },
      { width: 20, dataIndex: "" },
    ],
    bbar: [
      {
        text: "&nbsp;" + Ext.GLOBAL_BU_SAVE_TH + "รายละเอียดฯ&nbsp;",
        id: "saveDtl",
        iconCls: "icon-save",
        handler: function () {
          saveDtl();
        },
      },
      "->",
      {
        xtype: "label",
        id: "statusbar",
        html: "<div style='padding: 3px 6px 2px;'><img src='../images/icons/accept.png'><span style='position: relative; top: -4px; left: 5px;'>Ready</span></div>",
      },
    ],
    //     autoExpandColumn: "c_name",
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
  // SetTab Controller Loads
  Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
  /*====================== RENDER ======================*/
  new Ext.Viewport({
    layout: "border",
    items: [center],
  });
  let myComboStores = [Ext.ar_treat_right_group, Ext.store];
  chkLoadingStore(myComboStores, "contenterCenter", function () {});

  new Ext.KeyNav("tabpanel1", {
    enter: function (e) {
      search();
    },
    scope: this,
  });
});
