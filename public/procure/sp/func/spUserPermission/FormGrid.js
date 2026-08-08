Ext.onReady(function () {
  Ext.QuickTips.init();
  /*===============================================*/
  Ext.title_panel = "กำหนดสิทธิ์ผู้ใช้งาน";
  /*===============================================*/
  const DisbledButton = function (t, record) {
    if (t) {
      Ext.getCmp("saveHdr").hide();
    } else {
      Ext.getCmp("saveHdr").show();
    }
  };

  const controllTab = function (record, butt) {
    Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not errer
    Ext.butt = butt;
    if (butt == "add") {
      let frmAdd = new formAdd();
      Ext.getCmp("contenterCenter").add(frmAdd);
      Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
      Ext.getCmp("role-form-mode").setValue("ADD");
    } else if (butt == "edit" || butt == "view") {
      // ============ formAdd ============ //
      Ext.HDR_ID = record.data.id;
      let frmAdd = new formAdd(record.data);
      Ext.getCmp("contenterCenter").add(frmAdd);
      Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
      Ext.getCmp("role-form-mode").setValue("EDIT");
      Ext.getCmp("form-widgets").getForm().loadRecord(record);
      if (butt == "view") {
        DisbledButton(true, record);
      } else {
        DisbledButton(false, record);
      }
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
      var menu = new Ext.menu.Menu();
      menu.add({
        text: 'คัดลอก "' + record.data.c_name + '"',
        icon: "../images/icons/page_copy.png",
        scope: this,
        handler: function (e) {
          copyToClipboard(record.data.c_name);
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
          text: "(console_record)",
          icon: "../images/icons/script.png",
          scope: this,
          handler: function (e) {
            console.log(record);
          },
        });

        menu.add({
          text: "dc_user_id : " + record.data.id,
          icon: "../images/icons/script.png",
          scope: this,
          handler: function (e) {
            copyToClipboard(record.data.id);
          },
        });

        menu.add({
          text: "dc_cost_acc_id : " + record.data.dc_cost_acc_id,
          icon: "../images/icons/script.png",
          scope: this,
          handler: function (e) {
            copyToClipboard(record.data.dc_cost_acc_id);
          },
        });
      }
      menu.showAt(e.getXY());
    }
  }; //rowContextmenu

  // ================================ gridMain ================================ //
  cellClick = function (grid, rowIndex, columnIndex, e) {
    let record = grid.getStore().getAt(rowIndex);
    if (columnIndex == grid.getColumnModel().getIndexById("view")) {
      controllTab(record, "view");
    } else if (columnIndex == grid.getColumnModel().getIndexById("edit")) {
      controllTab(record, "edit");
    }
  }; //cellClick

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
        title: "ระบุเงื่อนไขในการค้นหาข้อมูล",
        columns: 1,
        defaults: { scale: "small", style: "float: right" },
        items: [
          {
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", text: "ส่วนงาน : " },
              { xtype: "tbspacer", width: 4 },
              new Ext.form.ComboBox({
                id: "s_dc_cost_acc_id",
                mode: "local",
                store: Ext.dc_cost_sys_main,
                valueField: "id",
                displayField: "c_name",
                triggerAction: "all",
                forceSelection: true,
                selectOnFocus: true,
                typeAhead: false,
                emptyText: "กรุณาเลือก...",
                width: 355,
                listeners: {
                  afterrender: function () {
                    this.fn = function () {};
                    this.change_set = function () {
                      Ext.store.setBaseParam("dc_cost_acc_id", this.getValue());
                      Ext.store.load();
                      // Ext.dc_expense_budget_type_all.load({ params: { dc_cost_acc_id: this.value } });
                      // Ext.getCmp("s_dc_expense_budget_type_id").setValue("0");
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
            ],
          },
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
                  data: [["c_full_name", "ชื่อ"]],
                }),
                value: "c_full_name",
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
          {
            text: "เพิ่มข้อมูล",
            id: "buAdd",
            hidden: true,
            iconCls: "icon-add",
            handler: function (grid, rowIndex, colIndex) {
              controllTab({}, "add");
            },
          },
          { xtype: "tbfill" },
          {
            text: "ค้นหา",
            iconCls: "icon-magnifier",
            handler: function () {
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
        id: "view",
        header: "-",
        sortable: false,
        align: "center",
        width: 50,
        dataIndex: "id",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          return "<button style='font-size:11px; cursor:pointer; color: blue;'>แสดง</button>";
        },
      },
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
      {
        id: "c_name",
        header: "ชื่อ",
        sortable: false,
        align: "center",
        dataIndex: "c_name",
        width: 300,
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "style='text-align: center;'";
          return value;
        },
      },
      {
        header: "ผู้ตรวจ",
        sortable: false,
        align: "center",
        dataIndex: "i_approve",
        width: 150,
        renderer: function (value, metaData, record, row, col, store, gridView) {
          if (value == 1) {
            return '<img src="../images/icons/bullet_tick.png");/>';
          } else {
            return '<img src="../images/icons/bullet_cross.png");/>';
          }
        },
      },
      {
        header: "ผู้อนุมัติ",
        sortable: false,
        align: "center",
        dataIndex: "i_executive",
        width: 150,
        renderer: function (value, metaData, record, row, col, store, gridView) {
          if (value == 1) {
            return '<img src="../images/icons/bullet_tick.png");/>';
          } else {
            return '<img src="../images/icons/bullet_cross.png");/>';
          }
        },
      },
      {
        header: "ผู้อนุมัติ (หลัก)<br><span style='color: red; font-size: 8px;'>*(ส่วนงานละ 1 คน)</spen>",
        sortable: false,
        align: "center",
        dataIndex: "i_executive_main",
        width: 150,
        renderer: function (value, metaData, record, row, col, store, gridView) {
          if (value == 1) {
            return '<img src="../images/icons/bullet_tick.png");/>';
          } else {
            return '<img src="../images/icons/bullet_cross.png");/>';
          }
        },
      },
      {
        header: "เข้าถึงสิทธิ์เมนูระบบ<br>สนับสนุนการบริหารงานจัดซื้อจัดจ้าง",
        sortable: false,
        align: "center",
        dataIndex: "i_permission",
        width: 250,
        renderer: function (value, metaData, record, row, col, store, gridView) {
          if (value == 1) {
            return '<img src="../images/icons/bullet_tick.png");/>';
          } else {
            return '<img src="../images/icons/bullet_cross.png");/>';
          }
        },
      },
      { width: 40, dataIndex: "" },
    ],
    // autoExpandColumn: "c_name",
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
  Ext.getCmp("tabpanel1").on("rowContextmenu", rowContextmenu, this);
  // SetTab Controller Loads
  Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
  /*====================== RENDER ======================*/
  new Ext.Viewport({
    layout: "border",
    items: [center],
  });
});
