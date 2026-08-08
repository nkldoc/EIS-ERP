Ext.ns("Ext.ux.Button");
/********************************************
/************** Examples of use *************
/********************************************

************** 1. Create component *************
  new Ext.ux.PopMutiSelect({
    id: "PopSelectID",
    iconCls: "icon-add",
    text: "เพิ่มรายการ",
    title: "เลือกข้อมูลที่ต้องการออกใบขออนุมัติกันเงินเหลื่อมปี",
    multiSelect: true,
    disabledBtnClickDestroy: false,
    store: Ext.storeDtlAdd,
    setFilter: [["c_code", "เลขที่ใบขอเบิก"]],
    defFilter: "c_name",
    headerGrid: [
      {
        header: "เลขที่",
        align: "center",
        width: 200,
        sortable: true,
        dataIndex: "c_code",
      },

      {
        header: "ชื่อ",
        align: "center",
        width: 100,
        sortable: true,
        id: "c_name",
        dataIndex: "c_name",
      },
      { width: 20, dataIndex: "" },
    ],
    beforePop: function (c) {
      if (!Ext.getCmp("i_year").getValue()) {
        c.msg += "<span style='white-space: nowrap;'>- กรุณาเลือก ปีงบประมาณ</span><br>";
      }
      if (!Ext.getCmp("dc_expense_budget_type_id").getValue()) {
        c.msg += "<span style='white-space: nowrap;'>- กรุณาเลือก แหล่งเงิน</span><br>";
      }
    },
    afterrenderPop: function (c) {
      c.checkID = []; //resetSelect
      c.store.setBaseParam("i_year", Ext.getCmp("i_year").getValue());
      c.store.setBaseParam("dc_expense_budget_type_id", Ext.getCmp("dc_expense_budget_type_id").getValue());
    },
    BtnClick: function (c) {
      Ext.storeDtlTemp.removeAll(); //resetStore
      var checkRecord = Ext.getCmp("bg_overlap_hdr_add_idID").checkRecord;
      for (var i = 0; i < checkRecord.length; i++) {
        var data_record = checkRecord[i].data;
        var myNewRecord = new storeDtlRecord({
          no: i + 1,
          id: data_record.id,
          c_code: data_record.c_code,
          c_name: data_record.c_name,
        });
        Ext.storeDtlTemp.insert(i, myNewRecord);
      }
    },
  }).mini,

**********************************************/

Ext.ux.PopMutiSelect = Ext.extend(Ext.Button, {
  config: {},
  initComponent: function () {
    this.mini = this.Minipop();
    this.setReset();
    this.msg = "";
    this.checkID = [];
    this.checkRecord = [];
  },
  setReset: function (t) {},
  afterrender: function () {},
  uiSearch: function (id) {
    var store = this.store;
    var headerGrid = this.headerGrid;
    var id = this.id;

    var setDefaultFilter = [
      ["c_code", "เลขที่"],
      ["c_name", "ชื่อ"],
    ];

    var filterGrid = new Ext.data.SimpleStore({
      fields: ["value", "text"],
      data: this.setFilter ? this.setFilter : setDefaultFilter,
    });
    var store = this.store;

    var filterGrid = Ext.isEmpty(this.filterGrid) ? filterGrid : this.filterGrid; //comb&store filter
    var defFilter = this.defFilter; //default filter

    return [
      {
        id: "filter" + id,
        xtype: "combo",
        width: 130,
        mode: "local",
        store: filterGrid,
        valueField: "value",
        displayField: "text",
        allowBlank: false,
        editable: false,
        triggerAction: "all",
        typeAhead: false,
        value: Ext.isEmpty(defFilter) ? "c_code" : defFilter,
      },
      "-",
      {
        id: "value-box" + id,
        xtype: "textfield",
        width: 130,
        fieldLabel: "fieldLabel",
        emptyText: "คำที่ต้องการค้นหา",
        listeners: {
          specialkey: function (f, e) {
            if (e.getKey() == e.ENTER) {
              store.setBaseParam("mode", "SEARCH");
              store.setBaseParam("filter", Ext.getCmp("filter" + id).getValue());
              store.setBaseParam("value", Ext.getCmp("value-box" + id).getValue());
              Ext.getCmp("win-pop-lov-modal-" + id)
                .getStore()
                .load();
            }
          },
        },
      },
    ];
  },
  pop_checkID: function (ID_Check) {
    var me = this;
    var store = me.store;
    if (document.getElementById("chk_" + ID_Check).checked) {
      var index = me.checkID.indexOf(ID_Check);
      if (index == -1) {
        me.checkID.push(ID_Check);
        var indexID = store.findExact("id", "" + ID_Check);
        var recordID = store.getAt(indexID);
        me.checkRecord.push(recordID);
      }
    } else {
      var index = me.checkID.indexOf(ID_Check);
      if (index > -1) {
        me.checkID.splice(index, 1);

        function findIndexByValue(array, value) {
          for (var i = 0; i < array.length; i++) {
            if (array[i].id === value) {
              return i; // Return the index if the value matches
            }
          }
          return -1; // Return -1 if the value is not found
        }
        me.checkRecord.splice(findIndexByValue(me.checkRecord, "" + ID_Check), 1);
      }
    }
    if (me.checkID.length == store.data.length) {
      document.getElementById("checkAll_" + me.id).checked = true;
    } else {
      document.getElementById("checkAll_" + me.id).checked = false;
    }

    Ext.text_conut = "";
    Ext.text_conut = me.checkID.length > 0 ? "จำนวนรายการที่เลือก " + me.checkID.length + " รายการ " : "";
    Ext.getCmp("text_conut").setText(Ext.text_conut);
  },
  pop_checkAll: function (ele) {
    var me = this;
    var store = me.store;
    if (ele) {
      for (var i = 0; i <= store.data.length - 1; i++) {
        me.checkID.push(parseInt(store.data.items[i].id));
        document.getElementById("chk_" + store.data.items[i].id).checked = true;

        var indexID = store.findExact("id", "" + store.data.items[i].id);
        var recordID = store.getAt(indexID);
        me.checkRecord.push(recordID);
      }
    } else {
      for (var i = 0; i <= store.data.length - 1; i++) {
        document.getElementById("chk_" + store.data.items[i].id).checked = false;
      }
      me.checkID = [];
      me.checkRecord = [];
    }
    Ext.text_conut = me.checkID.length > 0 ? "จำนวนรายการที่เลือก " + me.checkID.length + " รายการ " : "";
    Ext.getCmp("text_conut").setText(Ext.text_conut);
  },
  destroy_window: function (ele) {
    Ext.getCmp("win-pop-lov" + this.id).hide();
    Ext.getCmp("win-pop-lov" + this.id).destroy();
  },

  Minipop: function () {
    var me = this;
    /******/
    var store = this.store;
    var uiSearch = this.uiSearch(id);
    var headerGrid = this.headerGrid;
    var id = this.id;
    var disabledBtnClickDestroy = this.disabledBtnClickDestroy ? this.disabledBtnClickDestroy : false;

    function SearchGrid(store, id) {
      if (Ext.getCmp("value-box" + id).getValue() != "") {
        store.setBaseParam("mode", "SEARCH");
        store.setBaseParam("filter", Ext.getCmp("filter" + id).getValue());
        store.setBaseParam("value", Ext.getCmp("value-box" + id).getValue());
        Ext.getCmp("win-pop-lov-modal-" + id)
          .getStore()
          .load();
      } else {
        store.setBaseParam("mode", "");
        Ext.getCmp("win-pop-lov-modal-" + id)
          .getStore()
          .load();
      }
    }

    var beforePop = function () {};
    beforePop = this.beforePop ? this.beforePop : beforePop;

    var afterrenderPop = function () {};
    afterrenderPop = this.afterrenderPop ? this.afterrenderPop : afterrenderPop;

    var BtnClick = function () {};
    BtnClick = this.BtnClick ? this.BtnClick : BtnClick;
    var id_quo = '"' + id + '"';
    var headerStart = [
      { header: "ID System", sortable: true, hidden: true, dataIndex: "id" },
      { header: "ที่", align: "center", width: 40, sortable: true, dataIndex: "no" },
      {
        sortable: false,
        id: "col_check_" + id,
        header: "<div class='topAlign'><input id='checkAll_" + me.id + "' type='checkbox' onclick='Ext.getCmp(" + id_quo + ").pop_checkAll(this.checked)' " + (me.multiSelect ? "" : "disabled") + "></div>",
        align: "center",
        dataIndex: "id",
        width: 60,
        renderer: function (value, metaData, record, row, col, store, gridView) {
          var checked = me.checkID.includes(parseInt(value)) == true ? "checked" : "";
          return "<input style='margin-top:3px; margin-bottom:2px; pointer-events: none;' type='checkbox' onchange='Ext.getCmp(" + id_quo + ").pop_checkID(" + value + ")' id='chk_" + value + "' value='" + value + "'" + checked + "> ";
        },
      },
    ];
    headerGrid = headerStart.concat(headerGrid);
    /*****/
    return {
      fieldLabel: this.fieldLabel,
      xtype: "radiogroup",
      id: "pop_" + this.id,
      // columns: [0, widthText, 40],
      hidden: this.hidden == true ? true : false,
      listeners: {
        afterrender: this.afterrender,
      },
      items: [
        {
          xtype: "button",
          id: "Bu" + this.id,
          text: this.text,
          name: "Bu" + this.id,
          iconCls: this.iconCls,
          handler: function () {
            var msg = "";
            beforePop(me);
            msg = me.msg;
            if (msg == "") {
              var win = new Ext.Window({
                id: "win-pop-lov" + id,
                title: me.title,
                modal: true,
                plain: true,
                layout: "fit",
                maximizable: true,
                constrainHeader: true,
                closable: true,
                listeners: {
                  afterrender: function (obj, eOpts) {
                    this.fn = function (widht, height) {
                      //percentage
                      var width = Ext.getBody().getViewSize().width * widht;
                      var height = Ext.getBody().getViewSize().height * height;
                      this.setSize(width, height);
                    };
                    this.fn(0.8, 0.85);
                    afterrenderPop(me);
                    me.checkRecord = [];
                    store.load({
                      callback: function (records, operation, success) {
                        var store = me.store;
                        for (var ID_Check of me.checkID) {
                          var indexID = store.findExact("id", "" + ID_Check);
                          var recordID = store.getAt(indexID);
                          me.checkRecord.push(recordID);
                        }
                        if (me.checkID.length == store.data.length) {
                          if (store.data.length > 0) {
                            document.getElementById("checkAll_" + me.id).checked = true;
                          }
                        } else {
                          document.getElementById("checkAll_" + me.id).checked = false;
                        }
                      },
                    });
                  },
                  maximize: function (window, opts) {
                    //when property minimizable
                    window.setWidth(Ext.getBody().getViewSize().width * 0.99);
                    window.expand("", false);
                    window.center();
                  },
                },
                items: [
                  {
                    xtype: "grid",
                    id: "win-pop-lov-modal-" + id,
                    border: false,
                    stripeRows: true,
                    loadMask: true,
                    store: store,
                    tbar: [
                      uiSearch,
                      " ",
                      "-",
                      {
                        text: "ค้นหา",
                        id: "magnifier_" + id,
                        iconCls: "icon-magnifier",
                        handler: function () {
                          SearchGrid(store, id); /*SearchEngin(store,id);*/
                        },
                      },
                      { xtype: "tbfill" },
                      {
                        xtype: "label",
                        id: "text_conut",
                        style: "color: green",
                        text: "จำนวนรายการที่เลือก " + me.checkID.length + " รายการ ",
                      },
                    ],
                    columns: headerGrid,
                    listeners: {
                      afterrender: function (grid, eOpts) {
                        this.fn = function (widht, height) {
                          //percentage

                          var width = Ext.getBody().getViewSize().width * widht;
                          var height = Ext.getBody().getViewSize().height * height;
                          this.setSize(width, height);
                        };
                        this.fn(0.5, 0.4);

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
                    // autoExpandColumn: "c_code",
                    bbar: [
                      new Ext.PagingToolbar({
                        pageSize: 20,
                        store: store,
                        displayInfo: true,
                        displayMsg: "Displaying topics {0} - {1} of {2}",
                      }),
                      { xtype: "tbfill" },
                      {
                        text: "เลือกรายการ",
                        // id: "",
                        iconCls: "icon-save",
                        handler: function (grid, rowIndex, colIndex) {
                          BtnClick(me);
                          if (!disabledBtnClickDestroy) {
                            Ext.getCmp("win-pop-lov" + id).hide();
                            Ext.getCmp("win-pop-lov" + id).destroy();
                          }
                        },
                      },
                    ],
                  },
                ],
              });
              win.show();

              Ext.getCmp("win-pop-lov-modal-" + id).on(
                "cellclick",

                function (grid, rowIndex, columnIndex, e) {
                  if (columnIndex == grid.getColumnModel().getIndexById("col_check_" + me.id)) {
                    var record = grid.getStore().getAt(rowIndex);
                    var id = record.get("id");
                    if (!document.getElementById("chk_" + id).checked) {
                      if (me.checkID >= 1 && !me.multiSelect) {
                        Ext.example.msg("แจ้งเตือน.&nbsp;", "สามารถเลือกรายการสูงสุดได้ 1 รายการ", 1);
                      } else {
                        document.getElementById("chk_" + id).checked = true;
                      }
                    } else {
                      document.getElementById("chk_" + id).checked = false;
                    }
                    me.pop_checkID(parseInt(id));
                  }
                },
                this
              );

              Ext.getCmp("win-pop-lov-modal-" + id).on(
                "rowContextmenu",
                function (grid, rowIndex, e) {
                  if (me.multiSelect) {
                    e.stopEvent();
                    // grid.getSelectionModel().selectRow(rowIndex);
                    var record = grid.store.getAt(rowIndex);
                    if (record) {
                      new Ext.menu.Menu({
                        items: [
                          {
                            text: "เลือกรายการ",
                            icon: "../images/icons/bullet_tick.png",
                            scope: this,
                            handler: function (e) {
                              var selections = grid.selModel.getSelections();
                              for (var i = 0; i < selections.length; i++) {
                                var record = selections[i];
                                var id = record.get("id");
                                document.getElementById("chk_" + id).checked = true;
                                me.pop_checkID(parseInt(id));
                              }
                            },
                          },
                          {
                            text: "ยกเลิกการเลือก",
                            icon: "../images/icons/bullet_cross.png",
                            scope: this,
                            handler: function (e) {
                              var selections = grid.selModel.getSelections();
                              for (var i = 0; i < selections.length; i++) {
                                var record = selections[i];
                                var id = record.get("id");
                                document.getElementById("chk_" + id).checked = false;
                                me.pop_checkID(parseInt(id));
                              }
                            },
                          },
                        ],
                      }).showAt(e.getXY());
                    }
                  }
                },
                this
              );
            } else {
              Ext.Msg.alert("แจ้งเตือน", msg);
            }
          },
        },
      ],
    };
  }, //Mini
});
