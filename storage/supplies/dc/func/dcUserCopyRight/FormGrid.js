Ext.onReady(function () {
  Ext.QuickTips.init();
  /*===============================================*/

  Ext.title_panel = "เพิ่มสิทธิ์ตามกลุ่ม";

  /*===============================================*/

  const sendData = function () {
    let msg = "";
    var check = false;
    var ids = Ext.list_check_data.map(function (record) {
      check = true;
      return record.get("id");
    });

    if (msg == "") {
      Progress_Default_Step("start", "กำลังดำเนินการ", "");
      Ext.Ajax.request({
        url: "api/mn_dcUserCopyRight.php",
        method: "POST",
        params: {
          mode: "Goooooooo",
          dc_menu_hdr_id: Ext.getCmp("dc_menu_hdr_id").getValue(),
          data: JSON.stringify(ids),

          dc_user_sign_id: Ext.session.user_id,
        },
        success: function (result, request) {
          Progress_Default_Step("success", function () {
            Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
            let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
            if (jsonData.msg != "") {
              Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + jsonData.msg + "</span>");
            }
            Ext.store.load();
            Ext.list_check_data = [];
            document.getElementById("text_conut").innerHTML = "";
          });
        },
        failure: function (result, request) {
          Progress_Default_Step("stop");
          Ext.MessageBox.alert("Failed", result.responseText); // connect error
        },
      });
    } else {
      Ext.Msg.alert("แจ้งเตือน", msg);
    }
  };

  SetReadOnly = function (id, status) {
    var Cmp = Ext.getCmp(id);
    Cmp.setReadOnly(status);
    Cmp.el.setStyle("background", status ? "#eee" : "#fff");
  };

  // ================================ gridMain ================================ //
  cellClick = function (grid, rowIndex, columnIndex, e) {
    let record = grid.getStore().getAt(rowIndex);
    if (columnIndex == grid.getColumnModel().getIndexById("col_check")) {
      cellClick_check_col(record);
    } else if (columnIndex == grid.getColumnModel().getIndexById("print")) {
      Preview(record.data.id);
    }
  }; //cellClick

  const search = function () {
    var msg = "";
    var cm_pay_type_id = "";
    var i_pay_outside = "";
    if (msg == "") {
      if (Ext.getCmp("value-box").getValue() != "") {
        Ext.store.setBaseParam("value", Ext.getCmp("value-box").getValue());
        Ext.store.setBaseParam("filter", Ext.getCmp("filter").getValue());
      } else {
        Ext.store.setBaseParam("value", "");
        Ext.store.setBaseParam("filter", "");
      }
      
      Ext.store.setBaseParam("mode", "SEARCH");
      Ext.store.setBaseParam("i_set_pv", Ext.getCmp("s_i_set_pv").getValue() ? "1" : "0");
      Ext.store.setBaseParam("checkbox_date", Ext.getCmp("checkbox_date").getValue() ? "1" : "0");
      Ext.store.setBaseParam("dc_cost_acc_id", Ext.getCmp("s_dc_cost_acc_id").getValue());

      Ext.store.load();
    } else {
      Ext.Msg.alert("แจ้งเตือน", msg);
    }
  };
  // gridMain
  const gridMain = new Ext.grid.GridPanel({
    region: "center",
    layout: "fit",
    title: Ext.title_panel,
    id: "tabpanel1",
    border: false,
    stripeRows: true,
    loadMask: true,
    store: Ext.store,
    viewConfig: {
      emptyText: "ไม่มีข้อมูล..",
      deferEmptyText: false,
      getRowClass: function (record, index, rowParams) {
        if (Ext.I_STATUS >= 5 && record.data.i_status_last == Ext.I_STATUS - 1 && record.data.i_quick == 1) {
          return "td-quick";
        }
      },
    },
    listeners: {
      afterRender: function (grid) {
        var element = Ext.get(grid.getView().mainHd.id);
        element.on("contextmenu", function (e, t) {
          e.stopEvent();
          var menu = new Ext.menu.Menu();
          menu.add({
            text: "Refresh",
            icon: "../images/icons/arrow_refresh_small.png",
            scope: this,
            handler: function (e) {
              grid.store.load();
            },
          });
          if (Ext.session.user_id == 1) {
            menu.addSeparator();
            menu.add(
              new Ext.menu.Item({
                text: "show only admin",
                disabled: true,
                cls: "menu-separator-text",
              })
            );
            menu.add({
              text: "Inspect SQL",
              icon: "../images/icons/script_lightning.png",
              scope: this,
              handler: function (e) {
                grid.store.load({ params: { show_sql: 1 } });
              },
            });
          }
          menu.showAt(e.getXY());
        });
      },
    },
    tbar: [
      {
        xtype: "buttongroup",
        title: "",
        columns: 1,
        defaults: { scale: "small", style: "float: right" },
        items: [
          {
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", text: "กลุ่มผู้ใช้งานระบบ : " },
              { xtype: "tbspacer", width: 4 },
              new Ext.form.ComboBox({
                id: "dc_menu_hdr_id",
                mode: "local",
                store: Ext.dc_group_menu,
                valueField: "id",
                displayField: "c_name",
                triggerAction: "all",
                forceSelection: true,
                selectOnFocus: true,
                typeAhead: false,
                emptyText: "กรุณาเลือก...",
                width: 356,
                listeners: {
                  afterrender: function () {
                    this.fn = function () {};
                    this.change_set = function () {
                      
                    };
                  },
                  select: function () {
                    this.change_set();
                  },
                  change: function (combo, newValue) {
                    this.change_set();
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
              { xtype: "tbspacer", width: 103 },
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
        header: "<div class='topAlign'><input id='checkAll' type='checkbox' onclick='checkAll(this.checked)'></div>",
        sortable: false,
        align: "center",
        width: 100,
        id: "col_check",
        dataIndex: "id",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          return "<input type='checkbox' id='chk[" + value + "]' onclick='checkRow(this.checked ," + value + ")' value=" + value + " >";
        },
      },
      {
        header: "ผู้ใช้งานระบบ",
        sortable: false,
        align: "left",
        width: 200,
        dataIndex: "c_user_name",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          return value;
        },
      },
      {
        header: "ชื่อพนักงาน",
        sortable: false,
        align: "left",
        width: 200,
        dataIndex: "c_full_name",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          return value;
        },
      },
      
      { width: 40, dataIndex: "" },
    ],
    //     // autoExpandColumn: "c_name",
    bbar: [
      { xtype: "tbspacer", width: 20 },
      {
        xtype: "label",
        width: 180,
        id: "text_conut",
        style: "font-size: 15px; font-weight: bold; color: blue; display: inline-block",
      },
      { xtype: "tbfill" },
      { xtype: "tbspacer", width: 4 },
      {
        iconCls: "icon-save",
        xtype: "button",
        style: "padding: 6px 20px",
        scale: "medium",
        text: "ยืนยันรายการ&nbsp;",
        handler: function () {
          sendData();
        },
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

  new Ext.KeyNav("tabpanel1", {
    enter: function (e) {
      search();
    },
    scope: this,
  });
  // Ext.getCmp("cm_pay_type_id").hide();
});

/*********** function for cellClick check_col************/
Ext.list_check_data = [];
function checkAll(ele) {
  if (ele) {
    $("input[id^=chk]").each(function (i, val) {
      var id = String(val.value);
      document.getElementById("chk[" + id + "]").checked = ele;
      var data = Ext.store.getById(val.value);
      var index = Ext.list_check_data.findIndex((item) => item.get("id") == id);
      if (!(index >= 0)) Ext.list_check_data.push(data);
    });
  } else {
    $("input[id^=chk]").each(function (i, val) {
      var id = String(val.value);
      document.getElementById("chk[" + id + "]").checked = ele;
      var index = Ext.list_check_data.findIndex((item) => item.get("id") == id);
      if (index >= 0) Ext.list_check_data.splice(index, 1);
    });
  }
  document.getElementById("text_conut").innerHTML = "( " + Ext.list_check_data.length + " รายการ )";
}
function checkRow(ele, id) {
  document.getElementById("chk[" + id + "]").checked = ele ? false : true;
}
function cellClick_check_col(record) {
  if (document.getElementById("chk[" + record.data.id + "]").checked) {
    document.getElementById("chk[" + record.data.id + "]").checked = false;
    var index = Ext.list_check_data.findIndex((item) => item.get("id") == record.data.id);
    if (index >= 0) Ext.list_check_data.splice(index, 1);
  } else {
    document.getElementById("chk[" + record.data.id + "]").checked = true;
    Ext.list_check_data.push(record);
  }
  document.getElementById("checkAll").checked = Ext.list_check_data.length == Ext.store.data.length ? true : false;
  document.getElementById("text_conut").innerHTML = "( " + Ext.list_check_data.length + " รายการ )";
}
/***********************************************************/
