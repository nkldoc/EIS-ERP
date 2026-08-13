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

const saveSuccess = function() {
  let msg = "";
  let check = false;
  let jsonArr = [];

  $("input[id^=chk]").each(function(i, val) {
    if (val.checked == true) {
      check = true;
      jsonArr.push({ id: val.value });
    }
  });

  if (check == false) {
    msg += "<span style='white-space: nowrap;'>กรุณาเลือก รายการ อย่างน้อย 1 รายการ</span>";
  }
  if (msg == "") {
    Ext.getCmp("win-success")
      .getEl()
      .mask("Please wait...", "x-mask-loading");
    Ext.Ajax.request({
      url: "api/mn_ImpExpenseEphis.php",
      method: "POST",
      params: {
        mode: "SAVE_SEND",
        data: JSON.stringify(jsonArr)
      },
      success: function(result, request) {
        Ext.getCmp("win-success")
          .getEl()
          .unmask();
        let json = Ext.util.JSON.decode(result.responseText); //decode json
        if (json.success == true) {
          Ext.Msg.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย");
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

const sendSuccess = function() {
  new Ext.Window({
    title: "ผ่านรายการตรวจสอบ",
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
          { id: "c_expense_period_no", header: "เอกสารอ้างอิง", sortable: false, align: "center", width: 100, dataIndex: "c_expense_period_no" },
          {
            header: "แหล่งเงิน",
            sortable: false,
            align: "center",
            dataIndex: "dc_expense_budget_type_name",
            width: 150,
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              return value;
            }
          },
          {
            header: "วันที่จ่ายเงิน",
            sortable: true,
            align: "center",
            dataIndex: "d_doc_date",
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              return value != "" ? shortThaiDate(value) : "";
            }
          },
          {
            header: "สถานะใช้งาน",
            sortable: true,
            align: "center",
            dataIndex: "i_enable",
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              if (value == 1) {
                return "<span style='color:green;'>" + record.data.show_enable + "</span>";
              } else {
                return "<span style='color:red;'>" + record.data.show_enable + "</span>";
              }
            }
          },
          { header: "ผู้ทำรายการล่าสุด", sortable: true, align: "center", width: 150, dataIndex: "dc_user_update_id" },
          {
            header: "วันที่ทำรายการล่าสุด",
            sortable: true,
            align: "center",
            dataIndex: "d_update",
            width: 150,
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              return value != "" ? shortThaiDate(value) : "";
            }
          },
          { header: "หน่วยงานที่ทำรายการล่าสุด", sortable: true, align: "center", width: 200, dataIndex: "dc_user_update_cost_id" },
          { width: 40, dataIndex: "" }
        ],
        autoExpandColumn: "c_expense_period_no",
        bbar: [
          {
            text: "&nbsp;บันทึกผ่านรายการตรวจสอบ&nbsp;",
            iconCls: "icon-save",
            handler: function() {
              saveSuccess();
            }
          }
        ]
      })
    ]
  }).show();
};
