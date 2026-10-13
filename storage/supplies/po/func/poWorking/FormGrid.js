Ext.part_file_pdf = "http://" + location.host + "/pdf_po/";
Ext.onReady(function () {
  Ext.QuickTips.init();
  /*===============================================*/
  if (Ext.I_STATUS == 3) {
    Ext.title_panel = "รับคืนทักท้วง";
  } else if (Ext.I_STATUS == 4) {
    Ext.title_panel = "อนุมัติฏีกา";
  } else if (Ext.I_STATUS == 5) {
    Ext.title_panel = "หักงบประมาณ";
  } else if (Ext.I_STATUS == 6) {
    Ext.title_panel = "หัวหน้าฝ่ายการคลังลงนาม";
  } else if (Ext.I_STATUS == 7) {
    Ext.title_panel = "ผู้บริหารลงนาม";
  } else if (Ext.I_STATUS == 8) {
    Ext.title_panel = "จัดทำเช็ค";
  } else if (Ext.I_STATUS == 9) {
    Ext.title_panel = "หัวหน้าฝ่ายการคลังลงนามเช็ค";
  } else if (Ext.I_STATUS == 10) {
    Ext.title_panel = "ผู้บริหารลงนามเช็ค";
  } else if (Ext.I_STATUS == 11) {
    Ext.title_panel = "ทำทะเบียนจ่าย";
  } else if (Ext.I_STATUS == 12) {
    Ext.title_panel = "ตัดจ่ายเจ้าหนี้";
  }

  Ext.COLOR_STATUS = [];
  Ext.COLOR_STATUS[2] = "red";
  Ext.COLOR_STATUS[4] = "#9100ff";
  Ext.COLOR_STATUS[5] = "#00a75a";
  Ext.COLOR_STATUS[6] = "#1000ff";
  Ext.COLOR_STATUS[7] = "#a9a9a9";
  Ext.COLOR_STATUS[8] = "#0ba2b1";
  Ext.COLOR_STATUS[9] = "#e4dd00";
  Ext.COLOR_STATUS[10] = "#000000";
  Ext.COLOR_STATUS[11] = "#e067e8";
  Ext.COLOR_STATUS[12] = "green";
  /*===============================================*/
  if (Ext.I_STATUS == 5) {
    s_i_status = false;
  } else {
    s_i_status = true;
  }
  // pagingBar
  Ext.pagingBar = new Ext.PagingToolbar({
    pageSize: 20,
    store: Ext.store,
    displayInfo: true,
    displayMsg: "Displaying topics {0} - {1} of {2}",
  });

  const Preview = function (id) {
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
          handler: function () {
            document.printf.window.print();
          },
        },
        {
          text: Ext.GLOBAL_BU_BACK_TH,
          handler: function () {
            Ext.getCmp("Preview").destroy();
          },
        },
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

  const controllTab = function (record, butt) {
    Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not errer
    Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
    Ext.butt = butt;
    if (butt == "edit" || butt == "view") {
      // ============ formAdd ============ //
      Ext.HDR_ID = record.data.id;
      Ext.i_is_url_pdf_hdr = record.data.i_is_url_pdf_hdr;
      Ext.i_is_url_pdf_dtl = record.data.i_is_url_pdf_dtl;
      Ext.pdf_hdr = record.data.pdf_hdr;
      Ext.pdf_dtl = record.data.pdf_dtl;
      Ext.dataSelect = record.data;
      let frmAdd = new formAdd(record.data);
      Ext.getCmp("contenterCenter").add(frmAdd);
      Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
      Ext.getCmp("role-form-mode").setValue("EDIT");
      Ext.getCmp("form-widgets").getForm().loadRecord(record);
      Ext.getCmp("f_total").fn();
      if (Ext.I_STATUS == 5) {
        Ext.DataTemp = record.data;
        Ext.getCmp("i_budget_year").fn();
        Ext.getCmp("i_budget_year_overlap").fn();
        Ext.getCmp("bg_expense_id").fn();
      }
    }
  }; // controllTab

  // ================================ gridMain ================================ //
  cellClick = function (grid, rowIndex, columnIndex, e) {
    let record = grid.getStore().getAt(rowIndex);
    if (columnIndex == grid.getColumnModel().getIndexById("edit")) {
      if (parseInt(record.get("i_status_last")) == 3 && Ext.I_STATUS != 3) {
      } else if (parseInt(Ext.I_STATUS) == 3) {
        controllTab(record, "edit");
      } else if (parseInt(Ext.I_STATUS) == 5) {
        controllTab(record, "edit");
      } else if (parseInt(record.get("i_status_edit")) != 1) {
        controllTab(record, "edit");
      } else {
        controllTab(record, "edit");
      }
    } else if (columnIndex == grid.getColumnModel().getIndexById("print")) {
      Preview(record.data.id);
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
      Ext.store.setBaseParam("i_budget_year", Ext.getCmp("s_i_budget_year").getValue());
      Ext.store.setBaseParam("i_budget_year_overlap", Ext.getCmp("s_i_budget_year_overlap").getValue());
      Ext.store.setBaseParam("dc_expense_budget_type_id", Ext.getCmp("s_dc_expense_budget_type_id").getValue());
      Ext.store.setBaseParam("i_status_last", Ext.getCmp("s_i_status_last").getValue());
      Ext.store.setBaseParam("checkbox_overlab_no_booking", Ext.getCmp("checkbox_overlab_no_booking").getValue() ? 1 : 0);
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
              { xtype: "label", text: "ค้นหาโดย : " },
              { xtype: "tbspacer", width: 4 },
              {
                id: "filter",
                xtype: "combo",
                width: 135,
                mode: "local",
                store: new Ext.data.SimpleStore({
                  fields: ["value", "text"],
                  data: [
                    ["c_approve", "เลขที่ฏีกา"],
                    ["c_code_ref", "เลขที่ขอเบิก"],
                  ],
                }),
                value: Ext.I_STATUS != 4 ? "c_approve" : "c_code_ref",
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
                width: 235,
                fieldLabel: "fieldLabel",
                emptyText: "คำที่ต้องการค้นหา",
              },
            ],
          },
          {
            xtype: "buttongroup",
            frame: false,
            hidden: s_i_status,
            items: [
              { xtype: "label", text: "ปีงบประมาณ : " },
              { xtype: "tbspacer", width: 4 },
              {
                id: "s_i_budget_year",
                xtype: "combo",
                width: 135,
                mode: "local",
                store: Ext.store_year_all,
                valueField: "id",
                displayField: "c_name",
                triggerAction: "all",
                forceSelection: true,
                selectOnFocus: true,
                typeAhead: false,
                emptyText: "กรุณาเลือก...",
                value: "0",
              },
              { xtype: "tbspacer", width: 9 },
              { xtype: "label", text: "ใช้เงินปีงบประมาณ : " },
              { xtype: "tbspacer", width: 4 },
              {
                id: "s_i_budget_year_overlap",
                xtype: "combo",
                width: 135,
                mode: "local",
                store: Ext.store_year_all,
                valueField: "id",
                displayField: "c_name",
                triggerAction: "all",
                forceSelection: true,
                selectOnFocus: true,
                typeAhead: false,
                emptyText: "กรุณาเลือก...",
                value: "0",
              },
            ],
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
                width: 374,
                value: "0",
                listeners: {
                  afterrender: function () {
                    this.fn = function () {};
                  },
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
              }),
            ],
          },

          {
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", hidden: s_i_status, text: "สถานะ : " },
              { xtype: "tbspacer", width: 4 },
              {
                id: "s_i_status_last",
                xtype: "combo",
                width: 374,
                fieldLabel: "สถานะ",
                mode: "local",
                store: new Ext.data.SimpleStore({
                  fields: ["value", "text"],
                  data: [
                    ["0", "- เลือกทั้งหมด -"],
                    ["4", "รอหักงบประมาณ"],
                    ["5", "รอหัวหน้าฝ่ายการคลังลงนาม"],
                    ["6", "รอผู้บริหารลงนาม"],
                    ["7", "รอจัดทำเช็ค"],
                    ["8", "รอหัวหน้าฝ่ายการคลังลงนามเช็ค"],
                    ["9", "รอผู้บริหารลงนามเช็ค"],
                    ["10", "รอทำทะเบียนจ่าย"],
                    ["11", "ทำทะเบียนจ่ายเสร็จสิ้น"],
                  ],
                }),
                value: "0",
                valueField: "value",
                displayField: "text",
                allowBlank: false,
                hidden: s_i_status,
                editable: false,
                triggerAction: "all",
                typeAhead: false,
              },
            ],
          },
          {
            xtype: "buttongroup",
            hidden: s_i_status,
            fieldLabel: "",
            height: 22,
            frame: false,
            items: [
              new Ext.form.Checkbox({
                id: "checkbox_overlab_no_booking",
                boxLabel: "",
                inputValue: 1,
                checked: false,
                listeners: {
                  afterrender: function () {},
                  check: function (combo, newValue) {},
                },
              }),
              { xtype: "tbspacer", width: 4 },
              { xtype: "label", text: " รายการเหลื่อมปีที่ยังไม่ได้ระบุเลขที่ใบกันเงิน" },
              { xtype: "tbspacer", width: 155 },
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
          return record.get("no");
        },
      }),
      //       {
      //         id: "view",
      //         header: "-",
      //         sortable: false,
      //         align: "center",
      //         width: 50,
      //         dataIndex: "id",
      //         renderer: function(value, metaData, record, row, col, store, gridView) {
      //           return "<button style='font-size:11px; cursor:pointer; color: blue;'>แสดง</button>";
      //         }
      //       },
      {
        id: "edit",
        header: "-",
        sortable: false,
        align: "center",
        width: 170,
        dataIndex: "id",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          if (parseInt(record.get("i_status_last")) == 3 && Ext.I_STATUS != 3) {
          } else if (Ext.I_STATUS_BEFORE != record.get("i_status_last") && Ext.I_STATUS != record.get("i_status_last")) {
            return "<button style='font-size:11px; cursor:pointer; color: blue;'>แสดง</button>";
          }

          if (parseInt(record.get("i_status_last")) == 3 && Ext.I_STATUS != 3) {
          } else if (parseInt(Ext.I_STATUS) == 3) {
            return "<button style='font-size:11px; cursor:pointer; color: green;'>" + Ext.title_panel + "</button>";
          } else if (parseInt(record.get("i_status_edit")) != 1) {
            return "<button style='font-size:11px; cursor:pointer; color: green;'>" + Ext.title_panel + "</button>";
          } else {
            return "<button style='font-size:11px; cursor:pointer; color: green;'>แก้ไข</button>";
          }
        },
      },
      {
        header: "-",
        id: "print",
        sortable: true,
        dataIndex: "id",
        width: 40,
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "align='center'";
          return "<div style='cursor:pointer'><img src='../images/icons/printer_mono.png' style='margin-right:1px;' /><div>";
        },
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
        dataIndex: "c_code",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = 'style="font-weight: bold; color: green;"';
          return value;
        },
      },
      {
        header: "เลขที่ฏีกา",
        sortable: false,
        align: "center",
        width: 100,
        dataIndex: "c_approve",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          return value;
        },
      },
      // {
      //   header: "เลขที่ใบแจ้งหนี้",
      //   sortable: false,
      //   align: "center",
      //   width: 100,
      //   dataIndex: "c_approve",
      //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
      //     return value;
      //   },
      // },
      {
        header: "วันที่ตรวจรับเอกสาร<br>สถานะรายการล่าสุด",
        sortable: true,
        align: "center",
        dataIndex: "d_status_date_last",
        width: 120,
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          let note = "";
          if (record.data.i_protest > 0) {
            for (let i = 1; i <= record.data.i_protest; i++) {
              note += "*";
            }
          }
          note = note != "" ? " <font color=red>" + note + "</font>" : "";

          return value != "" ? shortThaiDate(value) + note : "";
        },
      },
      {
        header: "สถานะดำเนินการ",
        sortable: true,
        align: "center",
        dataIndex: "c_status_last",
        width: 190,
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          let vv = record.data.i_status_last;
          metaData.attr = 'style="font-weight: bold; color: ' + Ext.COLOR_STATUS[vv] + ';"';
          return value;
        },
      },
      {
        header: "วันที่อนุมัติฏีกา",
        sortable: true,
        align: "center",
        dataIndex: "d_approve_date",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          return value != "" ? shortThaiDate(value) : "";
        },
      },
      {
        header: "หน่วยงาน",
        sortable: false,
        align: "center",
        width: 200,
        dataIndex: "cost_name",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = 'style="text-align: left;"';
          return value;
        },
      },
      {
        header: "แหล่งเงิน",
        sortable: false,
        align: "center",
        width: 200,
        dataIndex: "budget_name",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = 'style="text-align: left;"';
          return value;
        },
      },
      {
        header: "รายการย่อย",
        sortable: false,
        align: "center",
        width: 200,
        dataIndex: "bg_expense_name",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = 'style="text-align: left;"';
          return value;
        },
      },
      {
        header: "จำนวนเงินขอเบิก",
        sortable: false,
        align: "center",
        width: 100,
        dataIndex: "f_total",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = 'style="color: blue; text-align: right;"';
          return floatRenderer(floatMinus(value, 2));
        },
      },
      { header: "ผู้ทำรายการล่าสุด", sortable: true, dataIndex: "dc_user_update_id" },
      {
        header: "วันที่ทำรายการล่าสุด",
        sortable: true,
        align: "center",
        dataIndex: "d_update",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          return value != "" ? shortThaiDate(value) : "";
        },
      },
      { header: "หน่วยงานที่ทำรายการล่าสุด", sortable: true, dataIndex: "dc_user_update_cost_id" },
      { width: 40, dataIndex: "" },
    ],
    //     // autoExpandColumn: "c_name",
    bbar: Ext.pagingBar,
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
  let myComboStores = [Ext.bg_expense, Ext.dc_expense_budget_type, Ext.po_parcel_officer, Ext.po_reason_protest];
  chkLoadingStore(myComboStores, "contenterCenter", function () {});

  new Ext.KeyNav("tabpanel1", {
    enter: function (e) {
      search();
    },
    scope: this,
  });
});
