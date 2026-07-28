Ext.onReady(function () {
  Ext.QuickTips.init();
  Ext.objChk = [];
  /*===============================================*/
  Ext.title_panel = "ครุภัณฑ์";

  // ================================ gridMain ================================ //
  cellClick = function (grid, rowIndex, columnIndex, e) {
    let record = grid.getStore().getAt(rowIndex);

    if (columnIndex == grid.getColumnModel().getIndexById("view_item")) {
      // if (record.data.i_am_cal_depre == 0) {
      // sendData(record.data, "process_am_cal_depre");
      // }
      controllTab(record, "edit");
    }
  }; //cellClick

  const controllTab = function (record, butt) {
    Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not errer
    Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
    Ext.butt = butt;
    if (butt == "add") {
      let frmAdd = new formAdd();
      Ext.getCmp("contenterCenter").add(frmAdd);
      Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
      Ext.getCmp("role-form-mode").setValue("ADD");
      // Ext.getCmp("btn_f_cancel_over").hide();
    } else if (butt == "edit" || butt == "view") {
      // ============ formAdd ============ //
      Ext.HDR_ID = record.data.id;
      // Ext.imp_assetall_dtl.load({
      //   params: { hdr_id: Ext.HDR_ID },
      // });
      // let frmAdd = new formAdd(record.data);
      // Ext.getCmp("contenterCenter").add(frmAdd);
      // Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
      // Ext.getCmp("role-form-mode").setValue("EDIT");
      // Ext.getCmp("form-widgets").getForm().loadRecord(record);
      // ============ PanelDtl ============ //
      let PanelDtl = new formPanelDtl();
      Ext.getCmp("contenterCenter").add(PanelDtl);
      Ext.getCmp("contenterCenter").setActiveTab(PanelDtl);
      // Ext.getCmp("btn_f_cancel_over").show();
      // Ext.getCmp("saveDtl").hide();
      // if (butt == "view") {
      //   DisbledButton(true, record);
      // } else {
      //   DisbledButton(false, record);
      // }
    }
  }; // controllTab

  const search = function () {
    var msg = "";
    if (msg == "") {
      Ext.store.setBaseParam("mode", "SEARCH");
      Ext.store.setBaseParam("c_acc_code", Ext.getCmp("acc_name").getValue());
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
        title: "ระบุเงื่อนไขในการค้นหาครุภัณฑ์",
        columns: 1,
        defaults: { scale: "small", style: "float: right" },
        items: [
          {
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", text: "หมวดครุภัณฑ์ : " },
              { xtype: "tbspacer", width: 4 },
              {
                id: "acc_name",
                xtype: "combo",
                width: 200,
                mode: "local",
                store: Ext.acc_mode,
                valueField: "c_acc_code",
                displayField: "c_acc_name",
                triggerAction: "all",
                forceSelection: true,
                selectOnFocus: true,
                typeAhead: false,
                emptyText: "กรุณาเลือก...",
                listeners: {
                  select: function () {
                    search();
                  },
                  change: function (combo, newValue) {
                    if (newValue == "") {
                      combo.reset();
                      Ext.getCmp("acc_name").setValue("10205010101");
                      search();
                    }
                  },
                },
              },
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
        id: "view_item",
        header: "-",
        sortable: false,
        align: "center",
        width: 150,
        dataIndex: "id",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          return "<button style='font-size:11px; cursor:pointer; color: green;'>รายละเอียดรายการ</button>";
        },
      },
      {
        header: "รหัสครุภัณฑ์",
        sortable: false,
        align: "center",
        width: 300,
        dataIndex: "c_code",
      },

      {
        header: "รหัสหมวดครุภัณฑ์",
        sortable: false,
        align: "center",
        width: 150,
        dataIndex: "acc_code",
      },
      {
        header: "ชื่อหมวดครุภัณฑ์",
        sortable: false,
        align: "center",
        width: 200,
        dataIndex: "acc_name",
      },
      {
        header: "ชื่อครุภัณฑ์",
        sortable: false,
        align: "center",
        width: 300,
        dataIndex: "c_name",
      },

      {
        header: "มูลค่าเริ่มต้น",
        sortable: false,
        align: "center",
        dataIndex: "f_unit_cost",
        width: 110,
        editor: new Ext.form.TextField({
          style: "text-align: right",
          listeners: {
            afterrender: function () {
              this.fn = function () {
                this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
              };
            },
            Change: function (value) {
              this.fn();
            },
          },
        }),
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          if (record.data.i_type == 1 || record.data.i_type == 2) {
            metaData.attr = "style='text-align: right; font-weight: bold;'";
            return floatRenderer(floatMinus(String(value).replace(/,/g, ""), 2));
          } else if (value) {
            metaData.attr = "style='text-align: right;'";
            return floatRenderer(floatMinus(String(value).replace(/,/g, ""), 2));
          } else {
            metaData.attr = "style='text-align: right; color:red;'";
            return "-";
          }
        },
      },
      // {
      //   header: "มูลค่าที่ได้มา",
      //   sortable: false,
      //   align: "center",
      //   width: 150,
      //   dataIndex: "f_unit_cost",
      // },
      {
        header: "อายุการใช้งาน",
        sortable: false,
        align: "center",
        width: 100,
        dataIndex: "i_period_year",
      },
      {
        header: "ปีงบประมาณ",
        sortable: false,
        align: "center",
        width: 100,
        dataIndex: "i_budget_year",
      },
      {
        header: "วันที่บันทึกรายการ",
        sortable: true,
        align: "center",
        dataIndex: "d_receive_date",
        width: 120,
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          return value != "" ? shortThaiDate(value) : "";
        },
      },
      { width: 120, dataIndex: "" },
    ],
    bbar: (pagingBar = new Ext.PagingToolbar({
      pageSize: 40,
      store: Ext.store,
      displayInfo: true,
      displayMsg: "Displaying topics {0} - {1} of {2}",
    })),
    // autoExpandColumn: "d_date",
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
});
