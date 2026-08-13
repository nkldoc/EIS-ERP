const SaveAdjust = function () {
  let msg = "";
  let jsonArr = [];
  let i_chk = false;
  let sto = Ext.getCmp("secondGrid").store.data.items;
  sto.forEach(function (v) {
    var f_dr = v.data.f_dr != "" ? parseFloat(v.data.f_dr.replace(/,/g, "")) : "";
    var f_cr = v.data.f_cr != "" ? parseFloat(v.data.f_cr.replace(/,/g, "")) : "";

    if (f_dr != "" && f_cr != "") {
      msg += "<span style='white-space: nowrap;'>- ลำดับที่ " + v.data.no + ' ใส่ยอดเงินเฉพาะ "เพิ่ม" หรือ "คืน" เท่านั้น</span><br>';
    } else if (f_dr == "" && f_cr == "") {
      msg += "<span style='white-space: nowrap;'>- ลำดับที่ " + v.data.no + ' กรุณาระบุยอดเงิน "เพิ่ม" หรือ "คืน"</span><br>';
    }

    jsonArr.push({
      ar_cut_item_id: v.data.id,
      f_dr: f_dr,
      f_cr: f_cr,
      c_comment: v.data.c_comment,
    });
    i_chk = true;
  });

  if (i_chk == false) {
    msg += "<span style='white-space: nowrap;'>- กรุณาเลือกอย่างน้อย 1 รายการ</span><br>";
  }

  if (msg == "") {
    Ext.getCmp("win-pop").getEl().mask("Please wait...", "x-mask-loading");
    Ext.Ajax.request({
      url: "api/mn_arCutAdjust.php",
      method: "POST",
      params: {
        mode: "SAVE_ADJUST",
        data: JSON.stringify(jsonArr),
      },
      success: function (result, request) {
        Ext.getCmp("win-pop").getEl().unmask();
        var obj = $.parseJSON(result.responseText);
        if (obj.success == true) {
          Ext.store.load();
          Ext.getCmp("win-pop").destroy();
        }
      },
      failure: function (result, request) {
        Ext.MessageBox.alert("Failed", result.responseText);
      },
    });
  } else {
    Ext.MessageBox.alert("แจ้งเตือน", msg);
  }
};

const firstSearch = function () {
  var msg = "";
  if (msg == "") {
    if (Ext.getCmp("first-c_code_cut").getValue() != "") {
      Ext.storeFrist.setBaseParam("c_code_cut", Ext.getCmp("first-c_code_cut").getValue());
    } else {
      Ext.storeFrist.setBaseParam("c_code_cut", "");
    }

    if (Ext.getCmp("first-c_hn").getValue() != "") {
      Ext.storeFrist.setBaseParam("c_hn", Ext.getCmp("first-c_hn").getValue());
    } else {
      Ext.storeFrist.setBaseParam("c_hn", "");
    }
    Ext.storeFrist.setBaseParam("mode", "SEARCH");
    Ext.storeFrist.load();
  } else {
    Ext.Msg.alert("แจ้งเตือน", msg);
  }
};

const popDtl = function () {
  colsF = [
    new Ext.grid.RowNumberer({
      header: "ที่",
      width: 30,
      renderer: function (value, metaData, record, row, col, store, gridView) {
        return record.get("no");
      },
    }),
    {
      header: "เลขที่ตัดชำระ",
      sortable: false,
      align: "center",
      width: 100,
      dataIndex: "c_code_cut",
      renderer: function (value, metaData, record, rowIndex, colIndex, store) {
        metaData.attr = "align='center'";
        return value;
      },
    },
    {
      header: "วันที่ตัดชำระ",
      sortable: true,
      align: "center",
      dataIndex: "d_cut_date",
      width: 100,
      renderer: function (value, metaData, record, rowIndex, colIndex, store) {
        return value != "" ? shortThaiDate(value) : "";
      },
    },
    { header: "สิทธิ์การรักษา", sortable: false, align: "center", width: 180, dataIndex: "ar_treat_right_name" },
    { header: "หน่วยงาน", sortable: false, align: "center", width: 180, dataIndex: "ar_cost_name" },
    { header: "HN", sortable: false, align: "center", width: 75, dataIndex: "c_hn" },
    { header: "AN", sortable: false, align: "center", width: 75, dataIndex: "c_an" },
    {
      header: "ชื่อผู้ป่วย",
      sortable: false,
      align: "center",
      width: 130,
      dataIndex: "c_patient",
      renderer: function (value, metaData, record, rowIndex, colIndex, store) {
        metaData.attr = "style='text-align:left;'";
        return value;
      },
    },
    {
      header: "วันที่รับบริการ",
      sortable: true,
      align: "center",
      dataIndex: "d_service_date",
      width: 90,
      renderer: function (value, metaData, record, rowIndex, colIndex, store) {
        return value != "" ? shortThaiDate(value) + "<br>" + record.data.c_service_time : "";
      },
    },
    {
      header: "วันที่จำหน่าย",
      sortable: true,
      align: "center",
      dataIndex: "d_encash_date",
      width: 90,
      renderer: function (value, metaData, record, rowIndex, colIndex, store) {
        return value != "" ? shortThaiDate(value) + "<br>" + record.data.c_encash_time : "";
      },
    },
    {
      header: "จำนวนเงินตัดชำระ",
      sortable: false,
      align: "center",
      width: 100,
      dataIndex: "f_cut",
      renderer: function (value, metaData, record, rowIndex, colIndex, store) {
        metaData.attr = "style='text-align: right; color: blue; font-weight: bold;'";
        return floatRenderer(floatMinus(value.replace(/,/g, ""), 2));
      },
    },
  ];
  colsS = [
    new Ext.grid.RowNumberer({
      header: "ที่",
      width: 30,
      renderer: function (value, metaData, record, row, col, store, gridView) {
        return record.get("no");
      },
    }),
    {
      header: "เลขที่ตัดชำระ",
      sortable: false,
      align: "center",
      width: 100,
      dataIndex: "c_code_cut",
      renderer: function (value, metaData, record, rowIndex, colIndex, store) {
        metaData.attr = "align='center'";
        return value;
      },
    },
    {
      header: "วันที่ตัดชำระ",
      sortable: true,
      align: "center",
      dataIndex: "d_cut_date",
      width: 100,
      renderer: function (value, metaData, record, rowIndex, colIndex, store) {
        return value != "" ? shortThaiDate(value) : "";
      },
    },
    { header: "สิทธิ์การรักษา", sortable: false, align: "center", width: 180, dataIndex: "ar_treat_right_name" },
    { header: "หน่วยงาน", sortable: false, align: "center", width: 180, dataIndex: "ar_cost_name" },
    { header: "HN", sortable: false, align: "center", width: 75, dataIndex: "c_hn" },
    { header: "AN", sortable: false, align: "center", width: 75, dataIndex: "c_an" },
    {
      header: "ชื่อผู้ป่วย",
      sortable: false,
      align: "center",
      width: 130,
      dataIndex: "c_patient",
      renderer: function (value, metaData, record, rowIndex, colIndex, store) {
        metaData.attr = "style='text-align:left;'";
        return value;
      },
    },
    {
      header: "วันที่รับบริการ",
      sortable: true,
      align: "center",
      dataIndex: "d_service_date",
      width: 90,
      renderer: function (value, metaData, record, rowIndex, colIndex, store) {
        return value != "" ? shortThaiDate(value) + "<br>" + record.data.c_service_time : "";
      },
    },
    {
      header: "วันที่จำหน่าย",
      sortable: true,
      align: "center",
      dataIndex: "d_encash_date",
      width: 90,
      renderer: function (value, metaData, record, rowIndex, colIndex, store) {
        return value != "" ? shortThaiDate(value) + "<br>" + record.data.c_encash_time : "";
      },
    },
    {
      header: "จำนวนเงินตัดชำระ",
      sortable: false,
      align: "center",
      width: 100,
      dataIndex: "f_cut",
      renderer: function (value, metaData, record, rowIndex, colIndex, store) {
        metaData.attr = "style='text-align: right; color: blue; font-weight: bold;'";
        return floatRenderer(floatMinus(value.replace(/,/g, ""), 2));
      },
    },
    {
      header: "รับเพิ่ม",
      sortable: false,
      align: "center",
      dataIndex: "f_dr",
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
        if (value) {
          metaData.attr = "style='text-align: right;'";
          return floatRenderer(floatMinus(value.replace(/,/g, ""), 2));
        } else {
          metaData.attr = "style='text-align: right; color:red;'";
          return "-";
        }
      },
    },
    {
      header: "คืนเงิน",
      sortable: false,
      align: "center",
      dataIndex: "f_cr",
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
        if (value) {
          metaData.attr = "style='text-align: right;'";
          return floatRenderer(floatMinus(value.replace(/,/g, ""), 2));
        } else {
          metaData.attr = "style='text-align: right; color:red;'";
          return "-";
        }
      },
    },
    {
      header: "หมายเหตุ",
      sortable: false,
      align: "center",
      dataIndex: "c_comment",
      width: 300,
      editor: new Ext.form.TextArea({
        listeners: {
          afterrender: function () {
            this.fn = function () {};
          },
          Change: function (value) {
            this.fn();
          },
        },
      }),
      renderer: function (value, metaData, record, rowIndex, colIndex, store) {
        metaData.attr = "style='text-align: left;'";
        return "<pre>" + value + "<pre>";
      },
    },
    { width: 40, dataIndex: "" },
  ];

  /* แสดงรายการตัดชำระ */
  var firstGrid = new Ext.grid.GridPanel({
    layout: "fit",
    id: "firstGrid",
    border: true,
    stripeRows: true,
    loadMask: true,
    enableDragDrop: true,
    store: Ext.storeFrist,
    flex: 2,
    ddGroup: "firstGridDDGroup",
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
              { xtype: "label", text: "เลขที่ตัดชำระ : " },
              { xtype: "tbspacer", width: 4 },
              {
                xtype: "textfield",
                id: "first-c_code_cut",
                width: 200,
              },
            ],
          },
          {
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", text: "HN : " },
              { xtype: "tbspacer", width: 4 },
              {
                xtype: "textfield",
                id: "first-c_hn",
                width: 200,
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
              firstSearch();
            },
          },
        ],
      },
    ],
    columns: colsF,
  }); // firstGrid

  /* รายการเลือก */
  var secondGrid = new Ext.grid.EditorGridPanel({
    title: "รายการที่เลือก",
    layout: "fit",
    id: "secondGrid",
    border: true,
    stripeRows: true,
    loadMask: false,
    flex: 1,
    store: Ext.storeSecond,
    clicksToEdit: 1,
    viewConfig: {
      emptyText: "ไม่มีข้อมูล..",
      deferEmptyText: false,
    },
    listeners: {
      render: function (panel) {
        new Ext.dd.DropTarget(secondGrid.getView().scroller.dom, {
          ddGroup: "firstGridDDGroup",
          notifyDrop: function (ddSource, e, data) {
            var records = ddSource.dragData.selections;
            Ext.each(records, ddSource.grid.store.remove, ddSource.grid.store);
            secondGrid.store.add(records);
            secondGrid.store.sort("no", "DESC");
            return true;
          },
        });
      },
    },
    columns: colsS,
  }); // secondGrid

  new Ext.Window({
    title: "รายการตัดชำระ",
    id: "win-pop",
    modal: true,
    layout: "fit",
    height: Ext.getBody().getViewSize().height * 0.98,
    width: Ext.getBody().getViewSize().width * 0.98,
    listeners: {
      afterrender: function (obj, eOpts) {
        Ext.storeFrist.removeAll();
        Ext.storeSecond.removeAll();
      },
    },
    items: [
      new Ext.Panel({
        layout: "vbox",
        border: false,
        defaults: { flex: 1 }, //auto stretch
        layoutConfig: { align: "stretch" },
        items: [firstGrid, secondGrid],
        bbar: [
          {
            text: "&nbsp;" + Ext.GLOBAL_BU_SAVE_TH + "&nbsp;",
            id: "saveDtl",
            iconCls: "icon-save",
            handler: function () {
              SaveAdjust();
            },
          },
        ],
      }),
    ],
  }).show();

  new Ext.KeyNav("win-pop", {
    enter: function (e) {
      firstSearch();
    },
    scope: this,
  });
};
