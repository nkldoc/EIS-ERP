dataDtl = [];

// save dtl ADD && EDIT
const saveDtl = function(mode) {
  let msg = "";
  let jsonArr = [];
  let sto = Ext.getCmp("gridEditor").store.data.items;

  sto.forEach(function(v) {
    jsonArr.push({
      dc_cheque_id: v.data.dc_cheque_id,
      f_cheque: v.data.f_cheque ? v.data.f_cheque.replace(/,/g, "") : ""
    });
  });

  if (msg == "") {
    Ext.getCmp("contenterCenter")
      .getEl()
      .mask("Please wait...", "x-mask-loading");
    Ext.Ajax.request({
      url: "api/mn_GlBank.php",
      method: "POST",
      params: {
        mode: mode,
        id: Ext.HDR_ID,
        data: JSON.stringify(jsonArr)
      },
      success: function(result, request) {
        Ext.getCmp("contenterCenter")
          .getEl()
          .unmask();
        let json = Ext.util.JSON.decode(result.responseText); //decode json
        Ext.storeDtl.load({ params: { hdr_id: Ext.HDR_ID } });
        Ext.Msg.alert("แจ้งเตือน", json.msg);
        if (json.success == true) {
          Ext.Msg.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย");
          Ext.store.load();
        }
      },
      failure: function(result, request) {
        Ext.MessageBox.alert("Failed", result.responseText); // connect error
      }
    });
  } else {
    Ext.Msg.alert("แจ้งเตือน", msg);
  }
}; // saveDtl

const changePrice = function() {
  var total = parseInt(0);
  var sum_total = parseInt(0);

  Ext.storeDtl.each(function(record, id) {
    f_cheque = record.get("f_cheque").replace(/,/g, "");
    if (f_cheque != "") {
      total += parseFloat(f_cheque, 2);
    }
  });

  sum_total =
    parseFloat(
      Ext.getCmp("total_bank")
        .getValue()
        .replace(/,/g, ""),
      2
    ) - parseFloat(total, 2);

  Ext.getCmp("total_cheque").setValue(floatRenderer(total.toFixed(2)));
  Ext.getCmp("sum_total").setValue(floatRenderer(sum_total.toFixed(2)));
};

// Class Extend
formPanelDtl = function(args) {
  cellClickDtl = function(grid, rowIndex, columnIndex, e) {
    if (columnIndex == grid.getColumnModel().getIndexById("DELETE")) {
      Ext.storeDtl.removeAt(rowIndex);
      changePrice();
    }
  }; //cellClick

  formPanelDtl.superclass.constructor.call(this, {
    title: "รายละเอียดเช็คจ่ายธนาคาร",
    id: "PanelDtl",
    iconCls: "icon-application-view-list",
    region: "center",
    layout: "fit",
    border: false,
    stripeRows: true,
    loadMask: true,
    listeners: {
      afterrender: function(obj, eOpts) {
        Ext.getCmp("contenterCenter")
          .getEl()
          .mask("Please wait...", "x-mask-loading");
        Ext.dc_cheque.load({
          callback: function(records, operation, success) {
            Ext.storeDtl.load({
              params: { hdr_id: Ext.HDR_ID },
              callback: function(records, operation, success) {
                Ext.getCmp("contenterCenter")
                  .getEl()
                  .unmask();
                changePrice();
              }
            });
          }
        });
      }
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
          getRowClass: function(record, index, rowParams) {
            return index % 2 == 0 ? "grid-odd padd-6" : "grid-even padd-6";
          }
        },
        tbar: [
          {
            text: "โหลดข้อมูลใหม่",
            iconCls: "icon-refresh",
            handler: function(grid, rowIndex, colIndex) {
              Ext.storeDtl.load({ params: { hdr_id: Ext.HDR_ID } });
            }
          },
          "-",
          {
            text: "เพิ่มแถว",
            iconCls: "icon-add",
            handler: function(grid, rowIndex, colIndex) {
              let myNewRecord = new storeDtlRecord({ no: "", id: "", dc_cheque_id: "", d_cheque: "", f_cheque: "" });
              Ext.storeDtl.insert(0, myNewRecord);
            }
          }
        ],
        columns: [
          new Ext.grid.RowNumberer({
            header: "ที่",
            width: 30,
            renderer: function(value, metaData, record, row, col, store, gridView) {
              metaData.attr = "style='cursor:pointer; text-align:center;';";
              return record.get("no");
            }
          }),
          {
            id: "dc_cheque_id",
            header: "เลขที่เช็ค",
            sortable: false,
            align: "center",
            dataIndex: "dc_cheque_id",
            width: 400,
            editor: new Ext.form.ComboBox({
              mode: "local",
              store: Ext.dc_cheque,
              valueField: "id",
              displayField: "c_name",
              triggerAction: "all",
              forceSelection: true,
              selectOnFocus: true,
              typeAhead: false,
              emptyText: "กรุณาเลือก...",
              listeners: {
                afterrender: function() {
                  this.fn = function() {};
                },
                Change: function() {
                  this.fn();
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
            }),
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              if (value != "" && value != undefined) {
                metaData.attr = "style='text-align: left;'";
                let name = getStoreItems(Ext.dc_cheque, value, "c_name");
                return name;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
            }
          },
          { header: "วันที่เช็ค", sortable: true, align: "center", renderer: shortThaiDate, dataIndex: "d_cheque" },
          {
            header: "จำนวนเงิน",
            sortable: false,
            align: "center",
            dataIndex: "f_cheque",
            width: 200,
            editor: new Ext.form.TextField({
              style: "text-align: right",
              listeners: {
                afterrender: function() {
                  this.fn = function() {
                    this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                  };
                },
                Change: function(value) {
                  this.fn();
                }
              }
            }),
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              changePrice();
              if (value) {
                metaData.attr = "style='text-align: right;'";
                return floatRenderer(floatMinus(value.replace(/,/g, ""), 2));
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
            }
          },
          { width: 20, dataIndex: "" },
          {
            id: "DELETE",
            header: "-",
            sortable: false,
            align: "center",
            dataIndex: "id",
            width: 30,
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              return "<div style='cursor:pointer'><img src='../images/icons/bin.gif' style='margin-right:1px;'); /><div>";
            }
          },
          { width: 20, dataIndex: "" }
        ],
        autoExpandColumn: "dc_cheque_id",
        bbar: [
          {
            text: "&nbsp;" + Ext.GLOBAL_BU_SAVE_TH + "รายละเอียดฯ&nbsp;",
            id: "saveDtl",
            iconCls: "icon-save",
            style: "padding: 1px 10px",
            scale: "medium",
            handler: function() {
              saveDtl("SAVE_CHEQUE");
            }
          },
          "->",
          {
            xtype: "buttongroup",
            columns: 1,
            defaults: { scale: "small", style: "float: right" },
            items: [
              {
                // แถวที่ 1
                xtype: "buttongroup",
                frame: false,
                items: [
                  { xtype: "label", style: "color: blue", text: "ยอดเงินธนาคาร : " },
                  { xtype: "tbspacer", width: 4 },
                  { id: "total_bank", xtype: "textfield", style: "text-align: right; font-weight: bold;", width: 100, readOnly: true },
                  { xtype: "tbspacer", width: 4 },
                  { xtype: "label", text: "บาท" }
                ]
              },
              {
                // แถวที่ 2
                xtype: "buttongroup",
                frame: false,
                items: [
                  { xtype: "label", style: "color: red", text: "จำนวนเงินรวมเช็ค : " },
                  { xtype: "tbspacer", width: 4 },
                  { id: "total_cheque", xtype: "textfield", value: "0.00", style: "text-align: right; font-weight: bold;", width: 100, readOnly: true },
                  { xtype: "tbspacer", width: 4 },
                  { xtype: "label", text: "บาท" }
                ]
              },
              {
                // แถวที่ 3
                xtype: "buttongroup",
                frame: false,
                items: [
                  { xtype: "label", text: "หักลบยอด : " },
                  { xtype: "tbspacer", width: 4 },
                  { id: "sum_total", xtype: "textfield", style: "text-align: right; font-weight: bold;", width: 100, readOnly: true },
                  { xtype: "tbspacer", width: 4 },
                  { xtype: "label", text: "บาท" }
                ]
              }
            ]
          }
        ]
      })
    ]
  });

  Ext.getCmp("gridEditor").on("cellclick", cellClickDtl, this);
}; // formPanelDtl
Ext.extend(formPanelDtl, Ext.Panel, {});
