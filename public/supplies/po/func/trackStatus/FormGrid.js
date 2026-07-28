Ext.onReady(function() {
  Ext.QuickTips.init();
  /*===============================================*/
  Ext.title_panel = "ติดตามสถานะใบเบิก";
  /*===============================================*/

  const Preview = function(id) {
    let url = "../po/preview/Pre_Working.php";
    let loader_display = '<div id="loader_display" style="display: flex; padding: 15px 15px; font-size:14px;"><div class="loader"></div><p>&nbsp;&nbsp;กำลังโหลดสถานะกรุณารอสักครู่...</p></div>';


    new Ext.Window({
      title: "แสดงสถานะใบขอเบิก",
      id: "Preview",
      modal: true,
      preventBodyReset: true,
      closable: true,
      autoScroll: true,
      maximized: true, // เต็มจอ auto
      html: loader_display + '<iframe name="printf" src="' + url + "?id=" + id + '" style="width:100%; height:100%; border-style:hidden;"></iframe>',
      buttonAlign: "left",
      buttons: [
        {
          text: "&nbsp;" + Ext.GLOBAL_BU_PRINT_TH + "&nbsp;",
          iconCls: "printer_mono",
          handler: function() {
            document.printf.window.print();
          }
        },
        {
          text: Ext.GLOBAL_BU_BACK_TH,
          handler: function() {
            Ext.getCmp("Preview").destroy();
          }
        }
      ],
      listeners: {
        afterrender: function () {
          $("iframe")
            .load(function () {
              document.getElementById("loader_display").remove();
            })
            .show();
        },
      },
    }).show();
  };

  // ================================ gridMain ================================ //
  cellClick = function(grid, rowIndex, columnIndex, e) {
    let record = grid.getStore().getAt(rowIndex);
    if (columnIndex == grid.getColumnModel().getIndexById("print")) {
      Preview(record.data.id);
    }
  }; //cellClick

  const search = function() {
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
      Ext.store.setBaseParam("dc_expense_budget_type_id", Ext.getCmp("s_dc_expense_budget_type_id").getValue());
      Ext.store.setBaseParam("po_creditor_id", Ext.getCmp("s_po_creditor_id").getValue());

      Ext.store.setBaseParam("i_budget_year", Ext.getCmp("i_budget_year").getValue());
      Ext.store.setBaseParam("i_budget_year_overlap", Ext.getCmp("i_budget_year_overlap").getValue());
      Ext.store.setBaseParam("i_booking", Ext.getCmp("i_booking").getValue() ? "1" : "0");

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
      getRowClass: function(record) {
        if (record.data.i_enable != 1) {
          return "td-error";
        } else if (record.data.i_success == 1) {
          return "td-success";
        }
      }
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
                  data: [
                    ["c_approve", "เลขที่ฏีกา"],
                    ["c_code_ref", "เลขที่ขอเบิก"]
                  ]
                }),
                value: "c_code_ref",
                valueField: "value",
                displayField: "text",
                allowBlank: false,
                editable: false,
                triggerAction: "all",
                typeAhead: false
              },
              { xtype: "tbspacer", width: 4 },
              {
                xtype: "textfield",
                id: "value-box",
                width: 200,
                fieldLabel: "fieldLabel",
                emptyText: "คำที่ต้องการค้นหา"
              }
            ]
          },
          {
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", text: "แหล่งเงิน : " },
              { xtype: "tbspacer", width: 4 },
              new Ext.form.ComboBox({
                id: "s_dc_expense_budget_type_id",
                mode: "local",
                store: Ext.dc_expense_budget_type,
                valueField: "id",
                displayField: "c_name",
                triggerAction: "all",
                forceSelection: true,
                selectOnFocus: true,
                typeAhead: false,
                emptyText: "กรุณาเลือก...",
                width: 354,
                value: "0",
                listeners: {
                  afterrender: function() {
                    this.fn = function() {};
                  },
                  change: function(combo, newValue) {
                    if (newValue == "") {
                      combo.reset();
                    }
                  },
                  beforequery: function(q) {
                    if (q.query) {
                      var length = q.query.length;
                      q.query = new RegExp(Ext.escapeRe(q.query));
                      q.query.length = length;
                    }
                  },
                  blur: function() {
                    this.getStore().clearFilter();
                  }
                }
              })
            ]
          },
          {
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", text: "จ่ายให้ : " },
              { xtype: "tbspacer", width: 4 },
              new Ext.form.ComboBox({
                id: "s_po_creditor_id",
                mode: "local",
                store: Ext.po_creditor,
                valueField: "id",
                displayField: "c_name",
                triggerAction: "all",
                forceSelection: true,
                selectOnFocus: true,
                typeAhead: false,
                emptyText: "กรุณาเลือก...",
                width: 354,
                value: "0",
                listeners: {
                  afterrender: function() {
                    this.fn = function() {};
                  },
                  change: function(combo, newValue) {
                    if (newValue == "") {
                      combo.reset();
                    }
                  },
                  beforequery: function(q) {
                    if (q.query) {
                      var length = q.query.length;
                      q.query = new RegExp(Ext.escapeRe(q.query));
                      q.query.length = length;
                    }
                  },
                  blur: function() {
                    this.getStore().clearFilter();
                  }
                }
              })
            ]
          }
        ],
        buttonAlign: "left",
        buttons: [
          { xtype: "tbfill" },
          {
            text: "ค้นหา",
            iconCls: "icon-magnifier",
            handler: function() {
              search();
            }
          }
        ]
      },
      {
        xtype: "buttongroup",
        title: "ระบุเงื่อนไขงบประมาณ",
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
                id: "i_budget_year",
                mode: "local",
                store: Ext.store_year,
                valueField: "id",
                displayField: "c_name",
                triggerAction: "all",
                forceSelection: true,
                selectOnFocus: true,
                typeAhead: false,
                emptyText: "กรุณาเลือก...",
                width: 250,
                value: "0",
                listeners: {
                  afterrender: function() {
                    this.fn = function() {};
                  },
                  change: function(combo, newValue) {
                    if (newValue == "") {
                      combo.reset();
                    }
                  },
                  beforequery: function(q) {
                    if (q.query) {
                      var length = q.query.length;
                      q.query = new RegExp(Ext.escapeRe(q.query));
                      q.query.length = length;
                    }
                  },
                  blur: function() {
                    this.getStore().clearFilter();
                  }
                }
              })
            ]
          },
          {
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", text: "ปีที่ใช้งบประมาณ : " },
              { xtype: "tbspacer", width: 4 },
              new Ext.form.ComboBox({
                id: "i_budget_year_overlap",
                mode: "local",
                store: Ext.store_year,
                valueField: "id",
                displayField: "c_name",
                triggerAction: "all",
                forceSelection: true,
                selectOnFocus: true,
                typeAhead: false,
                emptyText: "กรุณาเลือก...",
                width: 250,
                value: "0",
                listeners: {
                  afterrender: function() {
                    this.fn = function() {};
                  },
                  change: function(combo, newValue) {
                    if (newValue == "") {
                      combo.reset();
                    }
                  },
                  beforequery: function(q) {
                    if (q.query) {
                      var length = q.query.length;
                      q.query = new RegExp(Ext.escapeRe(q.query));
                      q.query.length = length;
                    }
                  },
                  blur: function() {
                    this.getStore().clearFilter();
                  }
                }
              })
            ]
          },
          {
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", text: " : " },
              { xtype: "tbspacer", width: 4 },
              new Ext.form.Checkbox({
                boxLabel: "แสดงรายละเอียด",
                inputValue: 1,
                checked: false,
                listeners: {
                  afterrender: function() {
                    this.fn = function(val) {
                      let check = val == true ? false : true;

                      gridMain.getColumnModel().setHidden(gridMain.getColumnModel().getIndexById("i_budget_year"), check);
                      gridMain.getColumnModel().setHidden(gridMain.getColumnModel().getIndexById("i_budget_year_overlap"), check);
                      gridMain.getColumnModel().setHidden(gridMain.getColumnModel().getIndexById("c_booking"), check);
                    };
                    this.fn(false);
                  },
                  check: function(combo, newValue) {
                    this.fn(newValue);
                  }
                }
              }),
              { xtype: "tbspacer", width: 7 },
              new Ext.form.Checkbox({
                id: "i_booking",
                boxLabel: "มีเลขที่ใบกันเงิน",
                inputValue: 1,
                checked: false,
                listeners: {
                  check: function(combo, newValue) {
                    search();
                  }
                }
              }),
              { xtype: "tbspacer", width: 58 }
            ]
          }
        ]
      }
    ],
    columns: [
      new Ext.grid.RowNumberer({
        header: "ที่",
        width: 30,
        renderer: function(value, metaData, record, row, col, store, gridView) {
          return record.get("no");
        }
      }),
      {
        header: "-",
        id: "print",
        sortable: true,
        dataIndex: "id",
        width: 40,
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "align='center'";
          return "<div style='cursor:pointer'><img src='../images/icons/printer_mono.png' style='margin-right:1px;' /><div>";
        }
      },
      {
        header: "เอกสารใบเบิก",
        sortable: false,
        width: 105,
        align: "center",
        dataIndex: "pdf_hdr",
        editor: new Ext.form.TextField({}),
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          var BtnText = "<img src='../images/icons/page_white_acrobat.png' style='margin-right:1px;' /><div><spen style='font-size:11px'>&nbspเอกสารใบเบิก</spen>";
          if (record.data.i_is_url_pdf_hdr == null) {
            return "-";
          } else if (record.data.i_is_url_pdf_hdr == 0) {
            return '<button style="display: flex" onclick="window.open(\'' + Ext.part_file_pdf + value + '\')" type="button">' + BtnText + "</button>";
          } else if (record.data.i_is_url_pdf_hdr == 1) {
            return '<button style="display: flex" onclick="window.open(\'' + value + '\')" type="button">' + BtnText + "</button>";
          }
        },
      },
      {
        header: "เอกสารประกอบใบเบิก",
        sortable: false,
        width: 140,
        align: "center",
        dataIndex: "pdf_dtl",
        editor: new Ext.form.TextField({}),
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          var BtnText = "<img src='../images/icons/page_white_acrobat.png' style='margin-right:1px;' /><div><spen style='font-size:11px'>&nbspเอกสารประกอบใบเบิก</spen>";
          if (record.data.i_is_url_pdf_dtl == null) {
            return "-";
          } else if (record.data.i_is_url_pdf_dtl == 0) {
            return '<button style="display: flex" onclick="window.open(\'' + Ext.part_file_pdf + value + '\')" type="button">' + BtnText + "</button>";
          } else if (record.data.i_is_url_pdf_dtl == 1) {
            return '<button style="display: flex" onclick="window.open(\'' + value + '\')" type="button">' + BtnText + "</button>";
          }
        },
      },
      {
        header: "เลขที่ใบขอเบิก",
        sortable: false,
        align: "center",
        width: 100,
        dataIndex: "c_code_ref",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = 'style="font-weight: bold; color: green;"';
          return value;
        }
      },
      {
        header: "เลขที่ฏีกา",
        sortable: false,
        align: "center",
        width: 100,
        dataIndex: "c_approve",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          return value;
        }
      },
      {
        id: "i_budget_year",
        header: "ปีงบประมาณ",
        sortable: true,
        align: "center",
        width: 100,
        dataIndex: "i_budget_year",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          return value + 543;
        }
      },
      {
        id: "i_budget_year_overlap",
        header: "ปีที่ใช้งบประมาณ",
        sortable: true,
        align: "center",
        width: 100,
        dataIndex: "i_budget_year_overlap",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          return value + 543;
        }
      },
      {
        id: "c_booking",
        header: "เลขที่ใบกันเงิน",
        sortable: false,
        align: "center",
        width: 100,
        dataIndex: "c_booking",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          return value;
        }
      },
      {
        header: "จ่ายให้",
        sortable: false,
        align: "center",
        width: 300,
        dataIndex: "creditor_name",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = 'style="text-align: left;"';
          return value;
        }
      },
      {
        header: "จำนวนเงินขอเบิก",
        sortable: false,
        align: "center",
        width: 100,
        dataIndex: "f_total",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = 'style="font-weight: bold; color: #5692ff; text-align: right;"';
          return floatRenderer(floatMinus(value, 2));
        }
      },
      {
        header: "ฝ่ายคลังรับใบขอเบิก",
        sortable: true,
        align: "center",
        width: 120,
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          return record.data.d_date1 != "" ? record.data.c_user_name1 + "<br>" + shortThaiDate(record.data.d_date1) : "";
        }
      },
      {
        header: "ทักท้วง",
        sortable: true,
        align: "center",
        width: 120,
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          // let note = "";
          // if (record.data.i_protest > 0) {
          //   for (let i = 1; i <= record.data.i_protest; i++) {
          //     note += "*";
          //   }
          // }
          // note = note != "" ? " <font color=red>" + note + "</font>" : "";
          // return value != "" ? shortThaiDate(value) + note : "";
          return record.data.d_date3 != "" ? record.data.c_user_name3 + "<br>" + shortThaiDate(record.data.d_date3) : "";
        }
      },
      {
        header: "อนุมัติฏีกา",
        sortable: true,
        align: "center",
        width: 120,
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          return record.data.d_date4 != "" ? record.data.c_user_name4 + "<br>" + shortThaiDate(record.data.d_date4) : "";
        }
      },
      {
        header: "หักงบประมาณ",
        sortable: true,
        align: "center",
        width: 120,
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          return record.data.d_date5 != "" ? record.data.c_user_name5 + "<br>" + shortThaiDate(record.data.d_date5) : "";
        }
      },
      {
        header: "หัวหน้าฝ่ายการคลัง<br>ลงนาม",
        sortable: true,
        align: "center",
        width: 120,
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          return record.data.d_date6 != "" ? record.data.c_user_name6 + "<br>" + shortThaiDate(record.data.d_date6) : "";
        }
      },
      {
        header: "ผู้บริหาร<br>ลงนาม",
        sortable: true,
        align: "center",
        width: 120,
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          return record.data.d_date7 != "" ? record.data.c_user_name7 + "<br>" + shortThaiDate(record.data.d_date7) : "";
        }
      },
      {
        header: "จัดทำเช็ค",
        sortable: true,
        align: "center",
        width: 120,
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          return record.data.d_date8 != "" ? record.data.c_user_name8 + "<br>" + shortThaiDate(record.data.d_date8) : "";
        }
      },
      {
        header: "หัวหน้าฝ่ายการคลัง<br>ลงนามเช็ค",
        sortable: true,
        align: "center",
        width: 120,
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          return record.data.d_date9 != "" ? record.data.c_user_name9 + "<br>" + shortThaiDate(record.data.d_date9) : "";
        }
      },
      {
        header: "ผู้บริหาร<br>ลงนามเช็ค",
        sortable: true,
        align: "center",
        width: 120,
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          return record.data.d_date10 != "" ? record.data.c_user_name10 + "<br>" + shortThaiDate(record.data.d_date10) : "";
        }
      },
      {
        header: "ทำทะเบียนจ่าย",
        sortable: true,
        align: "center",
        width: 120,
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          return record.data.d_date11 != "" ? record.data.c_user_name11 + "<br>" + shortThaiDate(record.data.d_date11) : "";
        }
      },
      { width: 40, dataIndex: "" }
    ],
    //     // autoExpandColumn: "c_name",
    bbar: Ext.pagingBar
  }); //gridMain
  /*====================== CENTER ======================*/
  center = new Ext.TabPanel({
    region: "center",
    border: false,
    //activeTab: 0, //default Tab
    id: "contenterCenter",
    defaults: { autoScroll: true },
    items: [gridMain]
  });
  // SET ref Grid&Tab
  Ext.getCmp("tabpanel1").on("cellclick", cellClick, this);
  // SetTab Controller Loads
  Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
  /*====================== RENDER ======================*/
  new Ext.Viewport({
    layout: "border",
    items: [center]
  });

  let myComboStores = [Ext.dc_expense_budget_type, Ext.po_creditor];
  chkLoadingStore(myComboStores, "contenterCenter", function() {});

  new Ext.KeyNav("tabpanel1", {
    enter: function(e) {
      search();
    },
    scope: this
  });
});
