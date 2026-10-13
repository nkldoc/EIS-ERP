Ext.dc_user = new Ext.data.JsonStore({
  autoLoad: true,
  url: "api/All_user_find.php",
  baseParams: {
    type: "dc_user",
    show: "all",
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name", "c_name2", "c_user"],
});

Ext.onReady(function () {
  Ext.QuickTips.init();
  /*===============================================*/

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
      getRowClass: function (record, index, rowParams) {
        // if (record.data.i_enable == 2) {
        //   return "color-red";
        // }
      },
    },
    tbar: [
      {
        text: "เพิ่มข้อมูล",
        id: "buAdd",
        iconCls: "icon-add",
        handler: function (grid, rowIndex, colIndex) {
          new Ext.Window({
            title: "",
            id: "win-pop-user",
            layout: "fit",
            modal: true,
            width: Ext.getBody().getViewSize().width * 0.5,
            width: 500,
            resizable: false,
            listeners: {
              afterrender: function (component) {
                new Ext.form.ComboBox({
                  id: "dc_user_id",
                  fieldLabel: "ชื่อพนักงาน",
                  width: 300,
                  mode: "local",
                  store: Ext.dc_user,
                  valueField: "id",
                  displayField: "c_name",
                  triggerAction: "all",
                  forceSelection: true,
                  selectOnFocus: true,
                  typeAhead: false,
                  emptyText: "",
                  //value: new Date().getFullYear(),
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
                  renderTo: "Ext_dtl_import",
                });
              },
            },
            items: [
              {
                xtype: "form",
                id: "form-excel",
                border: false,
                fileUpload: true,
                bodyStyle: { padding: "10px 20px" },
                html:
                  "<table border='0' cellspacing='2' cellpadding='0' width='100%' style='padding: 4px; 0px;'>" +
                  "<input type='hidden' name='mode' value='IMPORT_EXCEL'>" +
                  "<input type='hidden' name='id' value='" +
                  Ext.HDR_ID +
                  "'>" +
                  "<colgroup width='50%'></colgroup>" +
                  "<colgroup width='50%'></colgroup>" +
                  "<tr>" +
                  "<td align='right'>เลือกชื่อพนักงาน : </td>" +
                  "<td><div id='Ext_dtl_import'></div></td>" +
                  "</tr>" +
                  "<tr>" +
                  "</tr>" +
                  "</table>",
              },
            ],
            buttonAlign: "left",
            buttons: [
              {
                text: "&nbsp;ยืนยัน&nbsp;&nbsp;",
                iconCls: "icon-save",
                handler: async function () {
                  Ext.HDR_ID = Ext.getCmp("dc_user_id").getValue();
                  var index = Ext.dc_user.findExact("id", Ext.HDR_ID);
                  var record_user = Ext.dc_user.getAt(index);
                  controllTab({}, "add");
                  Ext.getCmp("s_dc_user_id").setValue(Ext.HDR_ID);
                  Ext.getCmp("s_dc_user_name").setText(record_user.data.c_name2);
                  Ext.getCmp("win-pop-user").destroy();
                },
              },
              // {
              //   text: Ext.GLOBAL_BU_BACK_TH,
              //   handler: function () {
              //     Ext.getCmp("win-pop-user").destroy();
              //   },
              // },
            ],
          }).show();
        },
      },
      {
        xtype: "tbfill",
      },
      "",
      "",
      "-",
      {
        id: "filter",
        xtype: "combo",
        width: 130,
        mode: "local",
        value: "c_full_name",
        store: new Ext.data.SimpleStore({
          fields: ["value", "text"],
          data: [
            ["c_full_name", "ชื่อพนักงาน"],
            ["c_user_name", "ชื่อผู้ใช้งานระบบ"],
          ],
        }),
        valueField: "value",
        displayField: "text",
        allowBlank: false,
        editable: false,
        triggerAction: "all",
        typeAhead: false,
        emptyText: "เลือกตัวกรอง",
      },
      "-",
      {
        id: "value-box",
        xtype: "textfield",
        width: 130,
        fieldLabel: "fieldLabel",
        emptyText: "คำที่ต้องการค้าหา",
      },
      "",
      "-",
      {
        text: "ค้นหา",
        iconCls: "icon-magnifier",
        handler: function () {
          search();
        },
      },
      "",
      "-",
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
        id: "edit",
        header: "-",
        sortable: false,
        align: "center",
        width: 50,
        dataIndex: "id",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          return "<button style='font-size:11px; cursor:pointer; color: green;'>แก้ไข</button>";
        },
      },
      { header: "ชื่อผู้ใช้งานระบบ", sortable: false, width: 100, dataIndex: "c_user_name" },
      { header: "ชื่อพนักงาน", sortable: false, width: 200, dataIndex: "c_full_name", id: "c_name" },
      { header: "สิทธิ์", sortable: false, width: 200, dataIndex: "c_type_view_name" },
      { width: 40, dataIndex: "" },
    ],
    autoExpandColumn: "c_name",
    bbar: Ext.pagingBar,
  }); //gridMain
  /*====================== CENTER ======================*/
  center = new Ext.TabPanel({
    region: "center",
    border: false,
    //activeTab: 0, //default Tab
    id: "contenterCenter",
    defaults: { autoScroll: false },
    items: [gridMain],
  });

  // SetTab Controller Loads
  Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
  /*====================== RENDER ======================*/
  new Ext.Viewport({
    layout: "border",
    items: [
      new Ext.Window({
        title: "",
        id: "win-pop-user",
        layout: "fit",
        modal: true,
        width: Ext.getBody().getViewSize().width * 0.5,
        width: 500,
        resizable: false,
        listeners: {
          afterrender: function (component) {
            new Ext.form.ComboBox({
              id: "dc_user_id",
              fieldLabel: "ชื่อพนักงาน",
              width: 300,
              mode: "local",
              store: Ext.dc_user,
              valueField: "id",
              displayField: "c_name",
              triggerAction: "all",
              forceSelection: true,
              selectOnFocus: true,
              typeAhead: false,
              emptyText: "",
              //value: new Date().getFullYear(),
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
              renderTo: "Ext_dtl_import",
            });
          },
        },
        items: [
          {
            xtype: "form",
            id: "form-excel",
            border: false,
            fileUpload: true,
            bodyStyle: { padding: "25px 10px" },
            html:
              "<table border='0' cellspacing='2' cellpadding='0' width='100%' style='padding: 4px; 0px;'>" +
              "<input type='hidden' name='mode' value='IMPORT_EXCEL'>" +
              "<input type='hidden' name='id' value='" +
              Ext.HDR_ID +
              "'>" +
              "<colgroup width='50%'></colgroup>" +
              "<colgroup width='50%'></colgroup>" +
              "<tr>" +
              "<td align='right'>เลือกชื่อพนักงาน : </td>" +
              "<td><div id='Ext_dtl_import'></div></td>" +
              "</tr>" +
              "<div style='padding:5px 10px; text-align: left;'><ul><li style='color:#ff0000;'><a href=https://shorturl.at/ze42z target=_blank>*หากไม่มีชื่อของท่านคลิกที่นี่*</a></li></ul></div> " +
              "</table>",
          },
        ],
        buttonAlign: "left",
        buttons: [
          {
            text: "&nbsp;แสดงข้อมูล&nbsp;&nbsp;",
            iconCls: "icon-save",
            handler: async function () {
              // Ext.getCmp('dc_user_id').getValue()
              // Ext.dc_user.findExact("id", Ext.getCmp('dc_user_id').getValue())
              var index = Ext.dc_user.findExact("id", Ext.getCmp("dc_user_id").getValue());
              var record = Ext.dc_user.getAt(index);
              Ext.Msg.alert("แจ้งเตือน", "username : " + record.data.c_user);
            },
          },
          // {
          //   text: Ext.GLOBAL_BU_BACK_TH,
          //   handler: function () {
          //     Ext.getCmp("win-pop-user").destroy();
          //   },
          // },
        ],
      }).show(),
    ],
  });
  // let myComboStores = [Ext.dc_cost];
  // chkLoadingStore(myComboStores, "contenterCenter", function () {});

  new Ext.KeyNav("tabpanel1", {
    enter: function (e) {
      search();
    },
    scope: this,
  });
});
