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

const saveStatus = function() {
  let msg = "";
  let check = false;
  let jsonArr = [];

  $("input[id^=chk]").each(function(i, val) {
    if (val.checked == true) {
      check = true;
      jsonArr.push({ id: val.value });
    }
  });

  if (Ext.getCmp("send_d_doc_date").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณากรอก วันที่ส่งใบขอเบิก</span><br>";
  }
  if (Ext.getCmp("send_dc_approve_id").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณาเลือก ผู้ตรวจอนุมัติฏีกา</span><br>";
  }

  if (check == false) {
    msg += "<span style='white-space: nowrap;'>กรุณาเลือก รายการ อย่างน้อย 1 รายการ</span>";
  }
  if (msg == "") {
    Ext.getCmp("win-success")
      .getEl()
      .mask("Please wait...", "x-mask-loading");
    Ext.Ajax.request({
      url: "api/mn_poWorkingImpHdr.php",
      method: "POST",
      params: {
        mode: "SAVE_SEND",
        d_doc_date: Ext.util.Format.date(Ext.getCmp("send_d_doc_date").getValue(), "Y-m-d"),
        dc_approve_id: Ext.getCmp("send_dc_approve_id").getValue(),
        data: JSON.stringify(jsonArr)
      },
      success: function(result, request) {
        Ext.getCmp("win-success")
          .getEl()
          .unmask();
        let json = Ext.util.JSON.decode(result.responseText); //decode json
        if (json.success == true) {
          Ext.Msg.alert("แจ้งเตือน", json.msg);
          Ext.store.load();
          Ext.getCmp("win-success").destroy();
        }
      },
      failure: function(result, request) {
        Ext.MessageBox.alert("Failed", result.responseText); // connect error
      }
    });
  } else {
    Ext.MessageBox.show({ title: "แจ้งเตือน", msg: msg, buttons: Ext.MessageBox.OK });
  }
};

const sendStatus = function() {
  new Ext.Window({
    title: "ส่งใบเบิก",
    id: "win-success",
    modal: true,
    layout: "fit",
    height: Ext.getBody().getViewSize().height * 0.9,
    width: Ext.getBody().getViewSize().width * 0.9,
    listeners: {
      afterrender: function(obj, eOpts) {
        Ext.getCmp("contenterCenter")
          .getEl()
          .mask("Please wait...", "x-mask-loading");
        Ext.storeIS.load({
          callback: function(records, operation, success) {
            Ext.getCmp("contenterCenter")
              .getEl()
              .unmask();
          }
        });
      }
    },
    items: [
      new Ext.grid.EditorGridPanel({
        region: "center",
        layout: "fit",
        border: false,
        stripeRows: true,
        loadMask: true,
        clicksToEdit: 1,
        store: Ext.storeIS,
        viewConfig: {
          emptyText: "ไม่มีข้อมูล..",
          deferEmptyText: false
        },
        tbar: [
          { xtype: "label", text: "วันที่ส่งใบขอเบิก : " },
          {
            xtype: "datefield",
            id: "send_d_doc_date"
          },
          "-",
          { xtype: "label", text: "ผู้ตรวจอนุมัติฏีกา : " },
          new Ext.form.ComboBox({
            mode: "local",
            id: "send_dc_approve_id",
            store: Ext.po_user_permission,
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
          })
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
            header: "<div class='topAlign'><input id='checkAll' type='checkbox' onclick='checkAll(this.checked)'></div>",
            sortable: false,
            align: "center",
            width: 50,
            dataIndex: "id",
            renderer: function(value, metaData, record, row, col, store, gridView) {
              Ext.objChk[value] = "chk[" + value + "]";
              return "<input type='checkbox' id='chk[" + value + "]' value=" + value + ">";
            }
          },
          {
            header: "เลขที่ใบขอเบิก",
            sortable: false,
            align: "center",
            dataIndex: "c_code",
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              return value;
            }
          },
          {
            header: "หน่วยงาน",
            sortable: false,
            align: "center",
            dataIndex: "dc_cost_id",
            width: 250,
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              if (value != "" && value != undefined) {
                metaData.attr = "style='text-align: left;'";
                return getStoreItems(Ext.dc_cost, value, "c_code") + " : " + getStoreItems(Ext.dc_cost, value, "c_name");
              } else {
                metaData.attr = "style='color:red; text-align: center;'";
                return "-";
              }
            }
          },
          {
            header: "ประเภทงบ",
            sortable: false,
            align: "center",
            dataIndex: "dc_expense_budget_type_id",
            width: 250,
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              if (value != "" && value != undefined) {
                metaData.attr = "style='text-align: left;'";
                return getStoreItems(Ext.dc_expense_budget_type, value, "c_name");
              } else {
                metaData.attr = "style='color:red; text-align: center;'";
                return "-";
              }
            }
          },
          {
            header: "รายการย่อย",
            sortable: false,
            align: "center",
            dataIndex: "bg_expense_id",
            width: 250,
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              if (value != "" && value != undefined) {
                metaData.attr = "style='text-align: left;'";
                return getStoreItems(Ext.bg_expense, value, "c_name");
              } else {
                metaData.attr = "style='color:red; text-align: center;'";
                return "-";
              }
            }
          },
          {
            header: "วันที่ตรวจรับ",
            sortable: false,
            align: "center",
            dataIndex: "d_audit_date",
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              return value != "" ? shortThaiDate(value) : "";
            }
          },
          {
            header: "วันที่ใบขอเบิก",
            sortable: false,
            align: "center",
            dataIndex: "d_doc_date",
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              return value != "" ? shortThaiDate(value) : "";
            }
          },
          {
            header: "วันที่ฝ่ายคลังรับใบขอเบิก",
            sortable: false,
            align: "center",
            dataIndex: "d_inv_date",
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              return value != "" ? shortThaiDate(value) : "";
            }
          },
          {
            header: "จ่ายให้",
            sortable: false,
            align: "center",
            width: 300,
            dataIndex: "c_cnt_name",
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = "style='text-align: left;'";
              return value;
            }
          },
          {
            header: "รายละเอียด",
            sortable: false,
            align: "center",
            width: 300,
            dataIndex: "c_detail",
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = "style='text-align: left;'";
              return value;
            }
          },
          {
            header: "จำนวนรายการ",
            sortable: false,
            align: "center",
            dataIndex: "c_qty",
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              return value;
            }
          },
          {
            header: "จำนวนเงิน",
            sortable: false,
            align: "center",
            dataIndex: "f_total",
            width: 110,
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = "style='text-align: right;'";
              return floatRenderer(floatMinus(value, 2));
            }
          },
          {
            header: "ผู้ดำเนินการ",
            sortable: false,
            align: "center",
            dataIndex: "po_emp_id",
            width: 150,
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              if (value != "" && value != undefined) {
                metaData.attr = "style='text-align: left;'";
                return getStoreItems(Ext.po_emp, value, "c_name");
              } else {
                metaData.attr = "style='color:red; text-align: center;'";
                return "-";
              }
            }
          },
          {
            header: "ผู้ตรวจสอบ",
            sortable: false,
            align: "center",
            dataIndex: "po_audit_id",
            width: 150,
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              if (value != "" && value != undefined) {
                metaData.attr = "style='text-align: left;'";
                return getStoreItems(Ext.po_emp, value, "c_name");
              } else {
                metaData.attr = "style='color:red; text-align: center;'";
                return "-";
              }
            }
          },
          { width: 20, dataIndex: "" }
        ],
        bbar: [
          {
            text: "&nbsp;บันทึกผ่านรายการตรวจสอบ&nbsp;",
            iconCls: "icon-save",
            handler: function() {
              saveStatus();
            }
          }
        ]
      })
    ]
  }).show();
};
