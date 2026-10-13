dataDtl = [];

const statusbar = function (type) {
  if (type) {
    $("#statusbar").html("<div style='padding: 3px 6px 2px;'><img src='../images/icons/accept.png'><span style='position: relative; top: -4px; left: 5px;'>Ready</span></div>");
  } else {
    $("#statusbar").html(
      "<div style='padding: 3px 6px 2px;'><img style='animation-name: spin; animation-duration: 100ms;animation-iteration-count: infinite;animation-timing-function: linear;' src='../images/icons/hourglass.png'><span style='position: relative; top: -4px; left: 5px;'>Loading</span></div>"
    );
  }
};

// save dtl ADD && EDIT
const saveDtl = function (mode) {
  let msg = "";
  let jsonArr = [];
  let sto = Ext.getCmp("gridEditor").store.data.items;
  console.log(sto);
  sto.forEach(function (v) {
    jsonArr.push({
      po_budget_dtl_id: v.data.id,
      po_expense_id: v.data.po_expense_id,
      f_total: v.data.f_total ? v.data.f_total.replace(/,/g, "") : "",
      c_comment: v.data.c_comment,
    });
  });

  if (msg == "") {
    Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
    Ext.Ajax.request({
      url: "api/mn_poBudgetHdr.php",
      method: "POST",
      params: {
        mode: mode,
        id: Ext.HDR_ID,
        data: JSON.stringify(jsonArr),
      },
      success: function (result, request) {
        Ext.getCmp("contenterCenter").getEl().unmask();
        let json = Ext.util.JSON.decode(result.responseText); //decode json
        Ext.storeDtl.load({ params: { hdr_id: Ext.HDR_ID } });
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

// Class Extend
formPanelDtl = function (args) {
  formPanelDtl.superclass.constructor.call(this, {
    title: "รายละเอียด" + Ext.title_panel,
    id: "PanelDtl",
    iconCls: "icon-application-view-list",
    region: "center",
    layout: "fit",
    border: false,
    stripeRows: true,
    loadMask: true,
    listeners: {
      afterrender: function (obj, eOpts) {
        Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
        Ext.storeDtl.load({
          params: { hdr_id: Ext.HDR_ID },
          callback: function (records, operation, success) {
            Ext.getCmp("contenterCenter").getEl().unmask();
          },
        });
      },
    },
    items: [
      new Ext.grid.EditorGridPanel({
        id: "gridEditor",
        region: "center",
        layout: "fit",
        border: true,
        stripeRows: true,
        loadMask: true,
        clicksToEdit: 1,
        store: Ext.storeDtl,
        viewConfig: {
          emptyText: "ไม่มีข้อมูล..",
          deferEmptyText: false,
          getRowClass: function (record, index, rowParams) {
            return index % 2 == 0 ? "grid-odd padd-6" : "grid-even padd-6";
          },
        },
        tbar: [
          {
            text: "โหลดข้อมูลใหม่",
            iconCls: "icon-refresh",
            handler: function (grid, rowIndex, colIndex) {
              Ext.storeDtl.load({ params: { hdr_id: Ext.HDR_ID } });
            },
          },
          "-",
          {
            text: "เพิ่มแถว",
            iconCls: "icon-add",
            handler: function (grid, rowIndex, colIndex) {
              let myNewRecord = new storeDtlRecord({
                id: "",
                po_expense_id: "",
                f_total: "",
                c_comment: "",
              });
              Ext.storeDtl.insert(0, myNewRecord);
            },
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
            header: "ประเภทรายจ่าย",
            sortable: false,
            align: "center",
            dataIndex: "po_expense_id",
            width: 400,
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (value != "" && value != undefined) {
                metaData.attr = "style='text-align: left;'";
                let name = getStoreItems(Ext.po_expense, value, "c_group_name");
                return name;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
            },
          },
          {
            header: "รายจ่ายย่อย",
            sortable: false,
            align: "center",
            dataIndex: "po_expense_id",
            width: 400,
            editor: new Ext.form.ComboBox({
              mode: "local",
              id: "editor_po_expense_id",
              store: Ext.po_expense,
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
                metaData.attr = "style='text-align: left;'";
                let name = getStoreItems(Ext.po_expense, value, "c_name");
                return name;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
            },
          },
          {
            header: "จำนวนเงินตามแผน<br>งบประมาณรายจ่าย",
            sortable: false,
            align: "center",
            dataIndex: "f_total",
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
            editor: new Ext.form.TextField({
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
              return value;
            },
          },
          { width: 20, dataIndex: "" },
        ],
        bbar: [
          {
            text: "&nbsp;" + Ext.GLOBAL_BU_SAVE_TH + "รายละเอียดฯ&nbsp;",
            id: "saveDtl",
            iconCls: "icon-save",
            handler: function () {
              saveDtl("SAVE_DTL");
            },
          },
          "->",
          {
            xtype: "label",
            id: "statusbar",
            html: "<div style='padding: 3px 6px 2px;'><img src='../images/icons/accept.png'><span style='position: relative; top: -4px; left: 5px;'>Ready</span></div>",
          },
        ],
      }),
    ],
  });
}; // formPanelDtl
Ext.extend(formPanelDtl, Ext.Panel, {});
