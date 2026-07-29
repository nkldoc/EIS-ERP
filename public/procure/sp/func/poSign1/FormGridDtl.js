function checkAll(ele) {
  for (var i = 1; i < Ext.objChk.length; i++) {
    var ind = Ext.objChk[i];
    if (ind != "") {
      if (document.getElementById(ind)) {
        document.getElementById(ind).checked = ele;
      }
    }
  }
}

Ext.objChk = [];

const sendData = function() {
  let msg = "";
  var check = false;
  var jsonArr = [];

  $("input[id^=chk]").each(function(i, val) {
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
          labelWidth: 75, // label settings here cascade unless overridden
          frame: true,
          bodyStyle: "padding:5px 5px 0",
          border: false,
          items: [
            {
              xtype: "datefield",
              fieldLabel: "วันที่ลงนาม",
              id: "pop_d_doc_date",
              width: 200
            }
          ]
        })
      ],
      buttonAlign: "left",
      buttons: [
        {
          text: Ext.GLOBAL_BU_SAVE_TH,
          iconCls: "icon-save",
          handler: function() {
            if (Ext.getCmp("pop_d_doc_date").getValue() == "") {
              msg += "<span style='white-space: nowrap;'>- กรุณากรอก วันที่ลงนาม</span><br>";
            } else {
              msg = "";
            }

            if (msg == "") {
              Ext.getCmp("win-pop-dtl")
                .getEl()
                .mask("Please wait...", "x-mask-loading");
              Ext.Ajax.request({
                url: "api/mn_poSign1.php",
                method: "POST",
                params: {
                  mode: "SEND_DATA",
                  i_status: Ext.I_STATUS,
                  d_doc_date: Ext.util.Format.date(Ext.getCmp("pop_d_doc_date").getValue(), "Y-m-d"),
                  data: JSON.stringify(jsonArr)
                },
                success: function(result, request) {
                  Ext.getCmp("win-pop-dtl")
                    .getEl()
                    .unmask();
                  let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                  if (jsonData.msg != "") {
                    Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + jsonData.msg + "</span>");
                  }
                  Ext.store.load();
                  Ext.storeSign.load();
                  Ext.getCmp("win-pop-dtl").destroy();
                },
                failure: function(result, request) {
                  Ext.MessageBox.alert("Failed", result.responseText); // connect error
                }
              });
            } else {
              Ext.Msg.alert("แจ้งเตือน", msg);
            }
          }
        },
        {
          text: Ext.GLOBAL_BU_BACK_TH,
          handler: function() {
            Ext.getCmp("win-pop-dtl").destroy();
          }
        }
      ]
    }).show();
  } else {
    Ext.Msg.alert("แจ้งเตือน", msg);
  }
};

// Class Extend
formPanelDtl = function(args) {
  formPanelDtl.superclass.constructor.call(this, {
    title: "ลงนามหลายใบ",
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
        store: Ext.storeSign,
        viewConfig: {
          emptyText: "ไม่มีข้อมูล..",
          deferEmptyText: false
        },
        columns: [
          {
            header: Ext.I_STATUS == 6 ? "วันที่หักงบประมาณ" : "วันที่ลงนาม<br>ฝ่ายการคลัง",
            sortable: true,
            dataIndex: "d_doc_date",
            align: "center",
            width: 100,
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = 'style="text-align:center;"';
              return value != "" ? shortThaiDate(value) : "";
            }
          },
          {
            header: "แหล่งเงิน",
            sortable: true,
            dataIndex: "budget_name",
            align: "center",
            width: 200,
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = 'style="text-align:left;"';
              return value;
            }
          },
          {
            header: "รายจ่ายย่อย",
            sortable: true,
            dataIndex: "expense_name",
            align: "center",
            width: 200,
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = 'style="text-align:left;"';
              return value;
            }
          },
          {
            header: "<div class='topAlign'><input id='checkAll' type='checkbox' onclick='checkAll(this.checked)'></div>",
            sortable: false,
            align: "center",
            width: 50,
            dataIndex: "id",
            renderer: function(value, metaData, record, row, col, store, gridView) {
              if (record.get("id") > 0) {
                Ext.objChk[value] = "chk[" + value + "]";
                return "<input type='checkbox' id='chk[" + value + "]' value=" + value + " " + (record.get("i_chk") ? "checked" : "") + ">";
              } else {
                return "";
              }
            }
          },
          {
            header: "ใบขอเบิก",
            sortable: true,
            dataIndex: "c_code",
            align: "center",
            width: 100,
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = 'style="text-align:center; color: green; font-weight:bold;"';
              return value;
            }
          },
          {
            header: "เลขที่ฏีกา",
            sortable: true,
            dataIndex: "c_approve",
            align: "center",
            width: 100,
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = 'style="text-align:center;"';
              return value;
            }
          },
          {
            header: "จ่ายให้",
            sortable: true,
            dataIndex: "c_creditor",
            align: "center",
            width: 200,
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 2 || record.data.i_type == 3) {
                metaData.attr = 'style="text-align:right; font-weight: bold;"';
              }
              return value;
            }
          },
          {
            header: "จำนวนเงิน",
            sortable: true,
            align: "center",
            width: 100,
            dataIndex: "f_total",
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 2 || record.data.i_type == 3) {
                metaData.attr = 'style="text-align:right; font-weight: bold;"';
              } else {
                metaData.attr = 'style="text-align: right;"';
              }
              return floatRenderer(floatMinus(value, 2));
            }
          },
          { width: 40, dataIndex: "" }
        ],
        bbar: [
          { xtype: "tbfill" },
          {
            iconCls: "icon-save",
            xtype: "button",
            style: "padding: 6px 20px",
            scale: "medium",
            text: "บันทึกรายการ&nbsp;",
            handler: function() {
              sendData();
            }
          }
        ]
        //                 autoExpandColumn: "c_name"
      })
    ]
  });

  cellClickDtl = function(grid, rowIndex, columnIndex, e) {
    let record = grid.getStore().getAt(rowIndex);
    if (record.data.id > 0) {
      if (document.getElementById("chk[" + record.data.id + "]").checked) {
        document.getElementById("chk[" + record.data.id + "]").checked = false;
      } else {
        document.getElementById("chk[" + record.data.id + "]").checked = true;
      }
    }
  }; //cellClickDtl
  Ext.getCmp("grid_dtl").on("cellclick", cellClickDtl, this);
}; // formPanelDtl
Ext.extend(formPanelDtl, Ext.Panel, {});
