Ext.onReady(function () {
  Ext.QuickTips.init();
  /*===============================================*/
  Ext.title_panel = "กำหนดสิทธิ์";
  /*===============================================*/
  // pagingBar
  Ext.pagingBar = new Ext.PagingToolbar({
    pageSize: 20,
    store: Ext.store,
    displayInfo: true,
    displayMsg: "Displaying topics {0} - {1} of {2}",
  });

  const DisbledButton = function (t, record) {
    if (t) {
      Ext.getCmp("saveHdr").disable();
    } else {
      // Ext.getCmp("saveHdr").enable();
    }
  };

  const controllTab = function (record, butt) {
    if (Ext.console) console.log(record);
    Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
    Ext.butt = butt;
    Ext.i_type_view = 1;
    if (butt == "add") {
      // Ext.HDR_ID = null;
      // console.log(formAdd())
      let frmAdd = new formAdd();
      Ext.getCmp("contenterCenter").add(frmAdd);
      Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
      // Ext.getCmp("role-form-mode").setValue("ADD");
      // Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
    } else if (butt == "edit" || butt == "view") {
      // ============ formAdd ============ //
      Ext.HDR_ID = record.data.id;
      Ext.select_row = record.data;
      Ext.i_type_view = record.data.i_type_view;
      let frmAdd = new formAdd(record.data);
      Ext.getCmp("contenterCenter").add(frmAdd);
      Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
      Ext.getCmp("s_dc_user_id").setValue(record.data.id);
      Ext.getCmp("s_dc_user_name").setText(record.data.c_full_name);

      Ext.getCmp("s_i_type_view").setValue(Ext.select_row.i_type_view);
      if (Ext.select_row.i_type_view == 1) {
        Ext.getCmp("gridEditor").getColumnModel().setHidden(0, false);
        Ext.getCmp("gridEditor").getColumnModel().setColumnHeader(2, "หน่วยงาน/ฝ่าย");
      } else if (Ext.select_row.i_type_view == 2) {
        Ext.getCmp("gridEditor").getColumnModel().setHidden(0, true);
        Ext.getCmp("gridEditor").getColumnModel().setColumnHeader(2, "ส่วนงาน/คณะ");
      }

      // Ext.getCmp("role-form-mode").setValue("EDIT");
      // Ext.getCmp("form-widgets").getForm().loadRecord(record);
      // Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
    }
  }; // controllTab

  function copyToClipboard(str) {
    var el = document.createElement("textarea");
    el.value = str;
    el.setAttribute("readonly", "");
    el.style.position = "absolute";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    var selected = document.getSelection().rangeCount > 0 ? document.getSelection().getRangeAt(0) : false;
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    if (selected) {
      document.getSelection().removeAllRanges();
      document.getSelection().addRange(selected);
    }
    /**example msg**/
    Ext.example.msg("Copied to Clipboard.&nbsp;", "- คัดลอกไปยังคลิปบอร์ดสำเร็จ", 1);
    $(this).next("text copied");
    setTimeout(function () {
      $(this).next().remove();
    }, 2000);
  }

  rowContextmenu = function (grid, rowIndex, e) {
    e.stopEvent();
    grid.getSelectionModel().selectRow(rowIndex);
    var record = grid.store.getAt(rowIndex);
    if (record) {
      new Ext.menu.Menu({
        items: [
          {
            text: 'คัดลอก "' + record.data.c_user_name + '"',
            icon: "../images/icons/page_copy.png",
            scope: this,
            handler: function (e) {
              copyToClipboard(record.data.c_user_name);
            },
          },
          {
            text: 'คัดลอก "' + record.data.c_full_name + '"',
            icon: "../images/icons/page_copy.png",
            scope: this,
            handler: function (e) {
              copyToClipboard(record.data.c_full_name);
            },
          },
        ],
      }).showAt(e.getXY());
    }
  }; //rowContextmenu

  // ================================ gridMain ================================ //
  cellClick = function (grid, rowIndex, columnIndex, e) {
    let record = grid.getStore().getAt(rowIndex);
    if (columnIndex == grid.getColumnModel().getIndexById("edit")) {
      controllTab(record, "edit");
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
  // SET ref Grid&Tab
  Ext.getCmp("tabpanel1").on("cellclick", cellClick, this);
  Ext.getCmp("tabpanel1").on("rowContextmenu", rowContextmenu, this);

  // SetTab Controller Loads
  Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
  /*====================== RENDER ======================*/
  new Ext.Viewport({
    layout: "border",
    items: [center],
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
