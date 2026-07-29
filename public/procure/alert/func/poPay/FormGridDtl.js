function checkAll(ele) {
  for (var i = 1; i < Ext.objChk.length; i++) {
    var ind = Ext.objChk[i];
    if (ind != "") {
      if (document.getElementById(ind)) {
        document.getElementById(ind).checked = ele;
      }
    }
  }
  changePrice();
}

const changePrice = function () {
  var i_select = 0;
  Ext.storePay.each(function (record, id) {
    if (record.id > 0 && document.getElementById(Ext.objChk[record.id]).checked == true) {
      i_select += 1;
    }
  });
  Ext.getCmp("i_total").setValue(floatRenderer(parseFloat(i_select).toFixed(0)));
};

Ext.objChk = [];

const sendData = function () {
  let msg = "";
  var check = false;
  var jsonArr = [];

  $("input[id^=chk]").each(function (i, val) {
    if (val.checked == true) {
      check = true;
      jsonArr.push(val.value);
    }
  });

  if (check == false) {
    msg += "- กรุณาเลือก รายการ อย่างน้อย 1 รายการ<br>";
  }

  if (msg == "") {
    new Ext.Window({
      title: "บันทึก",
      id: "win-pop-dtl",
      modal: true,
      preventBodyReset: true,
      closable: true,
      autoScroll: true,
      height: 140,
      width: 350,
      layout: "fit",
      border: false,
      items: [
        new Ext.FormPanel({
          labelWidth: 100, // label settings here cascade unless overridden
          frame: true,
          bodyStyle: "padding:5px 5px 0",
          border: false,
          items: [
            {
              xtype: "datefield",
              fieldLabel: "วันที่ทำทะเบียนจ่าย",
              id: "pop_d_doc_date",
              width: 200,
            },
          ],
        }),
      ],
      buttonAlign: "left",
      buttons: [
        {
          text: Ext.GLOBAL_BU_SAVE_TH,
          iconCls: "icon-save",
          handler: function () {
            let msg = "";
            if (Ext.getCmp("pop_d_doc_date").getValue() == "") {
              msg += "<span style='white-space: nowrap;'>- กรุณากรอก วันที่ทำทะเบียนจ่าย</span><br>";
            } else {
              msg = "";
            }

            if (msg == "") {
              Ext.getCmp("win-pop-dtl").getEl().mask("Please wait...", "x-mask-loading");
              Ext.Ajax.request({
                url: "api/mn_poPay.php",
                method: "POST",
                params: {
                  mode: "SEND_DATA",
                  d_doc_date: Ext.util.Format.date(Ext.getCmp("pop_d_doc_date").getValue(), "Y-m-d"),
                  data: JSON.stringify(jsonArr),
                },
                success: function (result, request) {
                  Ext.getCmp("win-pop-dtl").getEl().unmask();
                  let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                  if (jsonData.msg != "") {
                    Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + jsonData.msg + "</span>");
                  }
                  Ext.store.load();
                  Ext.storePay.load();
                  Ext.getCmp("win-pop-dtl").destroy();
                },
                failure: function (result, request) {
                  Ext.MessageBox.alert("Failed", result.responseText); // connect error
                },
              });
            } else {
              Ext.Msg.alert("แจ้งเตือน", msg);
            }
          },
        },
        {
          text: Ext.GLOBAL_BU_BACK_TH,
          handler: function () {
            Ext.getCmp("win-pop-dtl").destroy();
          },
        },
      ],
    }).show();
  } else {
    Ext.Msg.alert("แจ้งเตือน", msg);
  }
};

const searchPay = function () {
  var msg = "";
  if (msg == "") {
    if (Ext.getCmp("pay-value-box").getValue() != "") {
      Ext.storePay.setBaseParam("value", Ext.getCmp("pay-value-box").getValue());
      Ext.storePay.setBaseParam("filter", Ext.getCmp("pay-filter").getValue());
    } else {
      Ext.storePay.setBaseParam("value", "");
      Ext.storePay.setBaseParam("filter", "");
    }
    Ext.storePay.setBaseParam("mode", "SEARCH");
    Ext.storePay.setBaseParam("dc_expense_budget_type_id", Ext.getCmp("pay-s_dc_expense_budget_type_id").getValue());
    Ext.storePay.load();
  } else {
    Ext.Msg.alert("แจ้งเตือน", msg);
  }
};

// Class Extend
formPanelDtl = function (args) {
  formPanelDtl.superclass.constructor.call(this, {
    title: "ทำทะเบียนจ่ายหลายใบ",
    id: "PanelDtl",
    iconCls: "icon-application-view-list",
    region: "center",
    layout: "fit",
    border: false,
    stripeRows: true,
    loadMask: true,
    items: [
      new Ext.grid.GridPanel({
        id: "grid_dtl",
        border: false,
        stripeRows: true,
        loadMask: true,
        store: Ext.storePay,
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
                    id: "pay-filter",
                    xtype: "combo",
                    width: 150,
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
                    id: "pay-value-box",
                    width: 200,
                    fieldLabel: "fieldLabel",
                    emptyText: "คำที่ต้องการค้นหา",
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
                    id: "pay-s_dc_expense_budget_type_id",
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
            ],
            buttonAlign: "left",
            buttons: [
              { xtype: "tbfill" },
              {
                text: "ค้นหา",
                iconCls: "icon-magnifier",
                handler: function () {
                  searchPay();
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
            id: "checked",
            header: "<div class='topAlign'><input id='checkAll' type='checkbox' onclick='checkAll(this.checked)'></div>",
            sortable: false,
            align: "center",
            width: 50,
            dataIndex: "id",
            renderer: function (value, metaData, record, row, col, store, gridView) {
              Ext.objChk[value] = "chk[" + value + "]";
              return "<input type='checkbox' id='chk[" + value + "]' value=" + value + " " + (record.get("i_chk") ? "checked" : "") + ">";
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
            dataIndex: "po_expense_name",
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
          // {
          //   header: Ext.I_STATUS == 9 ? "วันที่จัดทำเช็ค" : "วันที่ลงนาม<br>ฝ่ายการคลัง",
          //   sortable: true,
          //   dataIndex: "d_doc_date",
          //   align: "center",
          //   width: 100,
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     metaData.attr = 'style="text-align:center;"';
          //     return value != "" ? shortThaiDate(value) : "";
          //   },
          // },
          // {
          //   header: "แหล่งเงิน",
          //   sortable: true,
          //   dataIndex: "budget_name",
          //   align: "center",
          //   width: 200,
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     metaData.attr = 'style="text-align:left;"';
          //     return value;
          //   },
          // },
          // {
          //   header: "รายจ่ายย่อย",
          //   sortable: true,
          //   dataIndex: "expense_name",
          //   align: "center",
          //   width: 200,
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     metaData.attr = 'style="text-align:left;"';
          //     return value;
          //   },
          // },
          // {
          //   header: "ใบขอเบิก",
          //   sortable: true,
          //   dataIndex: "c_code",
          //   align: "center",
          //   width: 100,
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     metaData.attr = 'style="text-align:center; color: green; font-weight:bold;"';
          //     return value;
          //   },
          // },
          // {
          //   header: "เลขที่ฏีกา",
          //   sortable: true,
          //   dataIndex: "c_approve",
          //   align: "center",
          //   width: 100,
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     metaData.attr = 'style="text-align:center;"';
          //     return value;
          //   },
          // },
          // {
          //   header: "จ่ายให้",
          //   sortable: true,
          //   dataIndex: "c_creditor",
          //   align: "center",
          //   width: 200,
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     if (record.data.i_type == 2 || record.data.i_type == 3) {
          //       metaData.attr = 'style="text-align:right; font-weight: bold;"';
          //     }
          //     return value;
          //   },
          // },
          // {
          //   header: "<div class='topAlign'><input id='checkAll' type='checkbox' onclick='checkAll(this.checked)'></div>",
          //   sortable: false,
          //   align: "center",
          //   width: 50,
          //   dataIndex: "po_working_hdr_id",
          //   renderer: function (value, metaData, record, row, col, store, gridView) {
          //     if (record.get("po_working_hdr_id") > 0) {
          //       Ext.objChk[value] = "chk[" + value + "]";
          //       return "<input type='checkbox' id='chk[" + value + "]' value=" + value + " " + (record.get("i_chk") ? "checked" : "") + ">";
          //     } else {
          //       return "";
          //     }
          //   },
          // },
          // {
          //   header: "เลขที่เช็ค",
          //   sortable: true,
          //   align: "center",
          //   width: 80,
          //   dataIndex: "c_cheque",
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     if (value != null) {
          //       metaData.attr = 'style="cursor: pointer;"';
          //     }
          //     return value;
          //   },
          // },
          // {
          //   header: "จำนวนเงิน",
          //   sortable: true,
          //   align: "center",
          //   width: 100,
          //   dataIndex: "f_total",
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     if (record.data.i_type == 2 || record.data.i_type == 3) {
          //       metaData.attr = 'style="text-align:right; font-weight: bold;"';
          //     } else {
          //       metaData.attr = 'style="text-align: right;"';
          //     }
          //     return floatRenderer(floatMinus(value, 2));
          //   },
          // },
          { width: 40, dataIndex: "" },
        ],
        bbar: [
          { xtype: "tbfill" },
          {
            xtype: "buttongroup",
            columns: 1,
            defaults: { scale: "small", style: "float: right" },
            items: [
              {
                xtype: "buttongroup",
                frame: false,
                items: [
                  { xtype: "label", text: "จำนวนใบขอเบิกที่เลือก : " },
                  { xtype: "tbspacer", width: 4 },
                  { id: "i_total", xtype: "textfield", style: "text-align: right; font-weight: bold;", width: 59, readOnly: true },
                ],
              },
              {
                xtype: "buttongroup",
                frame: false,
                items: [
                  {
                    text: "&nbsp;" + Ext.GLOBAL_BU_SAVE_TH + "&nbsp;",
                    id: "saveCheque",
                    iconCls: "icon-save",
                    style: "padding-top: 10px",
                    // scale: "medium",
                    handler: function () {
                      sendData();
                    },
                  },
                ],
              },
            ],
          },
        ],
        //                 autoExpandColumn: "c_name"
      }),
    ],
  });

  cellClickDtl = function (grid, rowIndex, columnIndex, e) {
    let record = grid.getStore().getAt(rowIndex);
    if (columnIndex == grid.getColumnModel().getIndexById("print")) {
      Preview(record.data.id);
    } else if (columnIndex != grid.getColumnModel().getIndexById("checked")) {
      if (document.getElementById("chk[" + record.data.id + "]").checked) {
        document.getElementById("chk[" + record.data.id + "]").checked = false;
      } else {
        document.getElementById("chk[" + record.data.id + "]").checked = true;
      }
    }
    changePrice();
  }; //cellClickDtl
  Ext.getCmp("grid_dtl").on("cellclick", cellClickDtl, this);
}; // formPanelDtl
Ext.extend(formPanelDtl, Ext.Panel, {});
