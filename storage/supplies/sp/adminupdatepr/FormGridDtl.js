Ext.delete_status = false;

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

const sendData = function () {
  let msg = "";
  let jsonArr = [];
  let sto = Ext.getCmp("gridEditor").store.data.items;
  sto.forEach(function (v) {
    if (v.dirty) {
      jsonArr.push({
        id: v.data.id,
        i_status: v.data.i_status,
        d_doc_date: Ext.util.Format.gridDate(v.data.d_doc_date, "Y-m-d"),
        d_receive_date: v.data.i_status == 3 ? Ext.util.Format.gridDate(v.data.d_receive_date, "Y-m-d") : "",
        c_comment: v.data.c_comment,
      });
    }
  });

  if (msg == "") {
    // Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
    Ext.Ajax.request({
      url: "api/mn_poWorkingAdvanced.php",
      method: "POST",
      params: {
        mode: "SAVE_DTL",
        id: Ext.HDR_ID,
        data: JSON.stringify(jsonArr),
      },
      success: function (result, request) {
        Ext.getCmp("contenterCenter").getEl().unmask();
        let json = Ext.util.JSON.decode(result.responseText); //decode json
        Ext.storeDtl.load({ params: { id: Ext.HDR_ID , sp_tor_contract : Ext.contract_id } });
        Ext.Msg.alert("แจ้งเตือน", json.msg);
      },
      failure: function (result, request) {
        Ext.MessageBox.alert("Failed", result.responseText); // connect error
      },
    });
  } else {
    Ext.Msg.alert("แจ้งเตือน", msg);
  }
};
const saveChangeStatus = function () {
  var msg = "";
  var index = Ext.storeDtl.findExact("i_checked_primary", 1);
  var record = Ext.storeDtl.getAt(index);

  if (msg == "") {
    var win = new Ext.Window({
      id: "MessageBox_re",
      title: Ext.select_row.c_code_ref + " ยันยืนการเปลื่ยนสถานะ ",
      modal: true,
      width: 310,
      // height: 150,
      items: [
        {
          xtype: "form",
          id: "form-widgets",
          frame: true,
          labelAlign: "right",
          labelWidth: 0.1,
          bodyStyle: { padding: "10px 20px" },
          defaults: { anchor: "100%", msgTarget: "side" },
          items: [
            {
              xtype: "displayfield",
              id: "displaytext",
              // fieldLabel: "กรุณาตรวจสอบจำนวนเงินที่ถูกยกเลิกก่อนยืนยันการทำรายการ",
              width: 200,
              // value: "การถอยสถานะจะไม่สามารถกู้คืนสถานะที่ถูกลบได้",
              style: "text-align: center; color:red; white-space: nowrap;",
            },
            {
              xtype: "textfield",
              enableKeyEvents: true,
              id: "confirm_text",
              width: 200,
              value: "",
              style: "text-align: center;",
              emptyText: 'กรุณากรอก "ยืนยัน" เพื่อบันทึกรายการ',
              listeners: {
                keyup: function () {
                  if (Ext.getCmp("confirm_text").getValue() == "ยืนยัน") {
                    Ext.getCmp("Save_cancel_over").setDisabled(false);
                  } else {
                    Ext.getCmp("Save_cancel_over").setDisabled(true);
                  }
                },
              },
            },
          ],
        },
      ],
      buttonAlign: "left",
      buttons: [
        {
          text: "บันทึกรายการ",
          id: "Save_cancel_over",
          iconCls: "icon-save",
          disabled: true,
          handler: function () {
            // Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
            Ext.Ajax.request({
              url: "api/mn_poWorkingAdvancedEdit.php",
              method: "POST",
              params: {
                mode: "CHANGE_STATUS",
                id: Ext.HDR_ID,
                i_status: record.data.i_status,
                c_status: record.data.c_status,
              },
              success: function (result, request) {
                Ext.getCmp("contenterCenter").getEl().unmask();
                var jsonData = Ext.util.JSON.decode(result.responseText);
                if (jsonData.success) {
                  Ext.storeDtl.load({
                    params: { id: Ext.HDR_ID , sp_tor_contract : Ext.contract_id },
                    callback: function (_records, _operation, _success) {},
                  });
                  Ext.getCmp("gridEditor").getColumnModel().setHidden(1, true);
                  Ext.getCmp("bu_change_status_cancel").hide();
                  Ext.getCmp("bu_change_status").show();
                  Ext.getCmp("bu_delete_status").show();
                  Ext.getCmp("save_change_status").hide();
                  Ext.getCmp("save_edit_item").show();

                  var num = Ext.getCmp("gridEditor").store.data.items.length - 1;
                  var row = 0;
                  while (num >= row) {
                    document.getElementById("chk_" + row).checked = false;
                    var r_record = Ext.storeDtl.getAt(row);
                    r_record.set("i_checked", 0);
                    r_record.commit();
                    row++;
                  }

                  Ext.Msg.alert("แจ้งเตือน", jsonData.msg);
                  Ext.select_row.i_status_last = record.data.i_status;
                  Ext.select_row.c_status_last = record.data.c_status;
                  var num_page = Ext.pagingBar.getPageData().activePage;
                  Ext.store.load({
                    callback: function (_records, _operation, _success) {
                      Ext.pagingBar.changePage(num_page);
                    },
                  });
                  Ext.getCmp("MessageBox_re").hide();
                  Ext.getCmp("MessageBox_re").destroy();
                } else {
                  Ext.MessageBox.alert("Failed", jsonData.msg);
                  Ext.getCmp("contenterCenter").getEl().unmask();
                  Ext.getCmp("MessageBox_re").hide();
                  Ext.getCmp("MessageBox_re").destroy();
                }
              },
              failure: function (result, request) {
                Ext.getCmp("contenterCenter").getEl().unmask();
                Ext.MessageBox.alert("Failed", result.responseText);
              },
            });
          },
        },
        { xtype: "tbfill" },
        {
          text: "ย้อนกลับ",
          handler: function () {
            Ext.getCmp("MessageBox_re").hide();
            Ext.getCmp("MessageBox_re").destroy();
          },
        },
      ],
    }).show();
  } else {
    Ext.Msg.alert("แจ้งเตือน", msg);
  }
};
const saveDeleteStatus = function () {
  var msg = "";
  var index = Ext.storeDtl.findExact("i_checked", 1);
  var record = Ext.storeDtl.getAt(index);

  var j = Ext.storeDtl.totalLength;
  var maxstatus = 0;
  for (var i = 0; i < j; i++) {
    var i_status = Ext.storeDtl.getAt(i).get("i_status");
    maxstatus = i_status > maxstatus ? i_status : maxstatus;
  }
  if (record.data.i_status == maxstatus) {
    msg += "<span style='white-space: nowrap;'>- ไม่สามารถเลือกรายการสถานะล่าสุดได้</span><br>";
  }
  if (msg == "") {
    var win = new Ext.Window({
      id: "MessageBox_re",
      title: Ext.select_row.c_code_ref + " ยันยืนการถอยสถานะ ",
      modal: true,
      width: 310,
      // height: 150,
      items: [
        {
          xtype: "form",
          id: "form-widgets",
          frame: true,
          labelAlign: "right",
          labelWidth: 0.1,
          bodyStyle: { padding: "10px 20px" },
          defaults: { anchor: "100%", msgTarget: "side" },
          items: [
            {
              xtype: "displayfield",
              id: "displaytext",
              // fieldLabel: "กรุณาตรวจสอบจำนวนเงินที่ถูกยกเลิกก่อนยืนยันการทำรายการ",
              width: 200,
              value: "การถอยสถานะจะไม่สามารถกู้คืนสถานะที่ถูกลบได้",
              style: "text-align: center; color:red; white-space: nowrap;",
            },
            {
              xtype: "textfield",
              enableKeyEvents: true,
              id: "confirm_text",
              width: 200,
              value: "",
              style: "text-align: center;",
              emptyText: 'กรุณากรอก "ยืนยัน" เพื่อบันทึกรายการ',
              listeners: {
                keyup: function () {
                  if (Ext.getCmp("confirm_text").getValue() == "ยืนยัน") {
                    Ext.getCmp("Save_cancel_over").setDisabled(false);
                  } else {
                    Ext.getCmp("Save_cancel_over").setDisabled(true);
                  }
                },
              },
            },
          ],
        },
      ],
      buttonAlign: "left",
      buttons: [
        {
          text: "บันทึกรายการ",
          id: "Save_cancel_over",
          iconCls: "icon-save",
          disabled: true,
          handler: function () {
            // Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
            Ext.Ajax.request({
              url: "api/mn_poWorkingAdvancedEdit.php",
              method: "POST",
              params: {
                mode: "DELETE_STATUS_ITEM",
                id: Ext.HDR_ID,
                i_status: record.data.i_status,
              },
              success: function (result, request) {
                Ext.getCmp("contenterCenter").getEl().unmask();
                var jsonData = Ext.util.JSON.decode(result.responseText);
                if (jsonData.success) {
                  Ext.storeDtl.load({
                    params: { id: Ext.HDR_ID , sp_tor_contract : Ext.contract_id },
                    callback: function (_records, _operation, _success) {},
                  });
                  Ext.getCmp("gridEditor").getColumnModel().setHidden(1, true);
                  Ext.getCmp("bu_delete_status_cancel").hide();
                  Ext.getCmp("bu_delete_status").show();
                  Ext.getCmp("save_delete_status").hide();
                  Ext.getCmp("save_edit_item").show();
                  Ext.delete_status = false;

                  var num = Ext.getCmp("gridEditor").store.data.items.length - 1;
                  var row = 0;
                  while (num >= row) {
                    document.getElementById("chk_" + row).checked = false;
                    var record = Ext.storeDtl.getAt(row);
                    record.set("i_checked", 0);
                    record.commit();
                    row++;
                  }

                  Ext.Msg.alert("แจ้งเตือน", jsonData.msg);
                  Ext.select_row.i_status_last = record.data.i_status;
                  Ext.select_row.c_status_last = record.data.c_status;
                  var num_page = Ext.pagingBar.getPageData().activePage;
                  Ext.store.load({
                    callback: function (_records, _operation, _success) {
                      Ext.pagingBar.changePage(num_page);
                    },
                  });
                  Ext.getCmp("MessageBox_re").hide();
                  Ext.getCmp("MessageBox_re").destroy();
                } else {
                  Ext.MessageBox.alert("Failed", jsonData.msg);
                  Ext.getCmp("contenterCenter").getEl().unmask();
                  Ext.getCmp("MessageBox_re").hide();
                  Ext.getCmp("MessageBox_re").destroy();
                }
                // Ext.store.load({
                //   params: { hdr_id: Ext.HDR_ID },
                // });
              },
              failure: function (result, request) {
                Ext.getCmp("contenterCenter").getEl().unmask();
                Ext.MessageBox.alert("Failed", result.responseText);
              },
            });
          },
        },
        { xtype: "tbfill" },
        {
          text: "ย้อนกลับ",
          handler: function () {
            Ext.getCmp("MessageBox_re").hide();
            Ext.getCmp("MessageBox_re").destroy();
          },
        },
      ],
    }).show();
  } else {
    Ext.Msg.alert("แจ้งเตือน", msg);
  }
};

function check_P_ID(RowCheck) {
  var checked = document.getElementById("chk_P" + RowCheck).checked;

  if (checked) {
    var num = Ext.getCmp("gridEditor").store.data.items.length - 1;
    var row = 0;
    while (num >= row) {
      var record = Ext.storeDtl.getAt(row);
      if (RowCheck == row) {
        record.set("i_checked_primary", 1);
        record.commit();
        document.getElementById("chk_P" + row).checked = true;
      } else {
        record.set("i_checked_primary", 0);
        record.commit();
        document.getElementById("chk_P" + row).checked = false;
      }
      row++;
    }
  } else {
    var num = Ext.getCmp("gridEditor").store.data.items.length - 1;
    var row = 0;
    while (num >= row) {
      var record = Ext.storeDtl.getAt(row);
      record.set("i_checked_primary", 0);
      record.commit();
      row++;
    }
  }

  var num = Ext.getCmp("gridEditor").store.data.items.length - 1;
  var row = 0;
  while (num >= row) {
    if (RowCheck != row) {
      document.getElementById("chk_P" + row).disabled = checked;
    }
    row++;
  }
}
function checkID(RowCheck) {
  var checked = document.getElementById("chk_" + RowCheck).checked;

  if (checked) {
    var num = Ext.getCmp("gridEditor").store.data.items.length - 1;
    var row = 0;
    while (num >= row) {
      var record = Ext.storeDtl.getAt(row);
      if (RowCheck >= row) {
        record.set("i_checked", row == RowCheck ? 1 : 2);
        record.commit();
        document.getElementById("chk_" + row).checked = true;
      } else {
        record.set("i_checked", 3);
        record.commit();
        document.getElementById("chk_" + row).checked = false;
      }
      row++;
    }
  } else {
    var num = Ext.getCmp("gridEditor").store.data.items.length - 1;
    var row = 0;
    while (num >= row) {
      var record = Ext.storeDtl.getAt(row);
      record.set("i_checked", 0);
      record.commit();
      row++;
    }
  }

  var num = Ext.getCmp("gridEditor").store.data.items.length - 1;
  var row = 0;
  while (num >= row) {
    if (RowCheck != row) {
      document.getElementById("chk_" + row).disabled = checked;
    }
    row++;
  }
  // Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
  // Ext.Ajax.request({
  //   url: "api/mn_AmAssetGroup.php",
  //   method: "POST",
  //   params: {
  //     mode: "PRIMARY_CHECKED",
  //     am_asset_hdr_id: document.getElementById("chk_" + RowCheck).value,
  //     i_primary: checked ? "1" : "0",
  //   },
  //   success: function (result, request) {
  //     Ext.getCmp("contenterCenter").getEl().unmask();
  //     var jsonData = Ext.util.JSON.decode(result.responseText);
  //     if (jsonData.success) {
  //     } else {
  //       Ext.MessageBox.alert("Failed", jsonData.msg);
  //     }
  //     // Ext.store.load({
  //     //   params: { hdr_id: Ext.HDR_ID },
  //     // });
  //   },
  //   failure: function (result, request) {
  //     Ext.getCmp("contenterCenter").getEl().unmask();
  //     Ext.MessageBox.alert("Failed", result.responseText);
  //   },
  // });
}

// Class Extend
formPanelDtl = function (args) {
  formPanelDtl.superclass.constructor.call(this, {
    title: "รายละเอียดใบขอเบิก",
    id: "PanelDtl",
    iconCls: "icon-application-view-list",
    region: "center",
    // layout: "fit",
    border: false,
    stripeRows: true,
    loadMask: true,
    items: [
      new Ext.grid.EditorGridPanel({
        id: "gridEditor",
        region: "center",
        layout: "fit",
        height: 400,
        border: true,
        stripeRows: true,
        loadMask: true,
        clicksToEdit: 1,
        store: Ext.storeDtl,
        viewConfig: {
          emptyText: "ไม่มีข้อมูล..",
          deferEmptyText: false,
          getRowClass: function (record, index, rowParams) {
            console.log(record); 
            console.log(Ext.select_row); 

            if (record.data.i_checked == 1 || record.data.i_checked == 2) {
              return "td-select";
            } else if (record.data.i_checked == 3) {
              return "td-delete";
            }
            if (record.data.i_checked_primary == 1) {
              return "td-select";
            }
            if (Ext.select_row.i_status_last == record.data.i_status) {
              return "td-primary";
            }
            if (Ext.select_row.i_enabled == 2 || Ext.select_row.i_enabled == 2  ) {
              return 'disabled-row';
          }
          },
        },
        listeners: {
          beforeedit: function (editor) {
            // let row = editor.record.data;
            if (Ext.delete_status) {
              return false;
            }
          },
        },
        tbar: [
          {
            text: "เปลี่ยนสถานะ",
            id: "bu_change_status",
            iconCls: "icon-application-edit",
            handler: function (_grid, _rowIndex, _colIndex) {
              Ext.delete_status = true;
              Ext.storeDtl.load({
                params: { id: Ext.HDR_ID },
                callback: function (_records, _operation, _success) {},
              });
              Ext.getCmp("gridEditor").getColumnModel().setHidden(1, false);
              this.hide();
              Ext.getCmp("bu_change_status_cancel").show();
              Ext.getCmp("bu_delete_status").hide();
              Ext.getCmp("save_change_status").show();
              Ext.getCmp("save_edit_item").hide();
            },
          },
          {
            text: "ยกเลิก เปลี่ยนสถานะ",
            id: "bu_change_status_cancel",
            hidden: true,
            iconCls: "icon-delete",
            handler: function (_grid, _rowIndex, _colIndex) {
              Ext.delete_status = false;
              Ext.storeDtl.load({
                params: { id: Ext.HDR_ID },
                callback: function (_records, _operation, _success) {},
              });
              Ext.getCmp("gridEditor").getColumnModel().setHidden(1, true);
              this.hide();
              Ext.getCmp("bu_change_status").show();
              Ext.getCmp("bu_delete_status").show();
              Ext.getCmp("save_change_status").hide();
              Ext.getCmp("save_edit_item").show();

              var num = Ext.getCmp("gridEditor").store.data.items.length - 1;
              var row = 0;
              while (num >= row) {
                document.getElementById("chk_P" + row).checked = false;
                var record = Ext.storeDtl.getAt(row);
                record.set("i_checked_primary", 0);
                record.commit();
                row++;
              }
            },
          },
          "-",
          {
            text: "ถอยรายการ",
            id: "bu_delete_status",
            iconCls: "icon-application-view-list",
            handler: function (_grid, _rowIndex, _colIndex) {
              Ext.delete_status = true;
              Ext.storeDtl.load({
                params: { id: Ext.HDR_ID },
                callback: function (_records, _operation, _success) {},
              });
              Ext.getCmp("gridEditor").getColumnModel().setHidden(2, false);
              this.hide();
              Ext.getCmp("bu_delete_status_cancel").show();
              Ext.getCmp("bu_change_status").hide();
              Ext.getCmp("save_delete_status").show();
              Ext.getCmp("save_edit_item").hide();
            },
          },
          {
            text: "ยกเลิก ถอยรายการ",
            id: "bu_delete_status_cancel",
            hidden: true,
            iconCls: "icon-delete",
            handler: function (_grid, _rowIndex, _colIndex) {
              Ext.delete_status = false;
              Ext.storeDtl.load({
                params: { id: Ext.HDR_ID , sp_tor_contract : Ext.contract_id },
                callback: function (_records, _operation, _success) {},
              });
              Ext.getCmp("gridEditor").getColumnModel().setHidden(2, true);
              this.hide();
              Ext.getCmp("bu_delete_status").show();
              Ext.getCmp("bu_change_status").show();
              Ext.getCmp("save_delete_status").hide();
              Ext.getCmp("save_edit_item").show();

              var num = Ext.getCmp("gridEditor").store.data.items.length - 1;
              var row = 0;
              while (num >= row) {
                document.getElementById("chk_" + row).checked = false;
                var record = Ext.storeDtl.getAt(row);
                record.set("i_checked", 0);
                record.commit();
                row++;
              }
            },
          },
          { xtype: "tbfill" },
          {
            xtype: "label",
            text: Ext.select_row.c_code_ref,
            id: "text_conut",
            style: "font-size: 15px; font-weight: bold; color: blue;",
          },
          { width: 50 },
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
            hidden: true,
            sortable: false,
            align: "center",
            dataIndex: "i_checked_primary",
            width: 40,
            renderer: function (value, metaData, record, row, col, store, gridView) {
              var checked = "";
              var readonly = "";
              if (record.data.i_checked_primary == 1) {
                checked = "checked";
                readonly = value != 1 ? "disabled" : "";
              } else {
                readonly = value != 0 ? "disabled" : "";
              }
              return "<input style='margin-top:3px; margin-bottom:2px;' type='checkbox' onchange='check_P_ID(" + row + ")' id='chk_P" + row + "' value='" + record.data.am_asset_hdr_id + "'" + checked + " " + readonly + "> ";
            },
          },
          {
            header: "-",
            hidden: true,
            sortable: false,
            align: "center",
            dataIndex: "i_checked",
            width: 40,
            renderer: function (value, metaData, record, row, col, store, gridView) {
              var checked = "";
              var readonly = "";
              if (record.data.i_checked == 1 || record.data.i_checked == 2) {
                checked = "checked";
                readonly = value != 1 ? "disabled" : "";
              } else {
                readonly = value != 0 ? "disabled" : "";
              }
              return "<input style='margin-top:3px; margin-bottom:2px;' type='checkbox' onchange='checkID(" + row + ")' id='chk_" + row + "' value='" + record.data.am_asset_hdr_id + "'" + checked + " " + readonly + "> ";
            },
          },
          {
            header: "-",
            sortable: false,
            hidden: true,
            align: "center",
            width: 150,
            dataIndex: "c_billing_code",
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = 'style="text-align: left;"';
              return value;
            },
          },
          {
            header: "สถานะ",
            sortable: false,
            align: "center",
            width: 80,
            dataIndex: "i_enabled",
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = 'style="text-align: center;"';
              return value;
            },
          },
          {
            header: "hdr_period_id",
            sortable: false,
            align: "center",
            width: 120,
            dataIndex: "id",
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = 'style="text-align: center;"';
              return value;
            },
          },
          {
            header: "dtl_period_id",
            sortable: false,
            align: "center",
            width: 120,
            dataIndex: "sp_tor_dtl_period_id",
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = 'style="text-align: center;"';
              return value;
            },
          },
          {
            header: "check_hdr_id",
            sortable: false,
            align: "center",
            width: 120,
            dataIndex: "sp_check_period_hdr_id",
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = 'style="text-align: center;"';
              return value;
            },
          },
          {
            header: "check_dtl_id",
            sortable: false,
            align: "center",
            width: 120,
            dataIndex: "sp_check_period_dtl_id",
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = 'style="text-align: center;"';
              return value;
            },
          },
          {
            header: "วันที่ส่ง",
            sortable: true,
            align: "center",
            dataIndex: "d_doc_arrive_dt",
            width: 120,
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              return value != "" ? shortThaiDate(value) : "";
            },
            editor: new Ext.form.DateField(),
          },
          {
            header: "วันที่รับทักท้วง",
            sortable: true,
            align: "center",
            dataIndex: "d_receive_date",
            width: 120,
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_status == 3) {
                return value != "" ? shortThaiDate(value) : "";
              } else {
                return "-";
              }
            },
            editor: new Ext.form.DateField(),
          },
          {
            id: "c_overlap",
            header: "เลขที่ใบกันเหลื่อม",
            sortable: true,
            align: "center",
            dataIndex: "c_overlap",
            width: 120,
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = 'style="text-align: left;"';
              return "<pre>" + value + "</pre>";
            },
            editor: new Ext.form.TextArea(),
          },
          {
            id: "c_billing_code",
            header: "เลขที่วางบิล",
            sortable: true,
            align: "center",
            dataIndex: "c_billing_code",
            width: 120,
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = 'style="text-align: left;"';
              return "<pre>" + value + "</pre>";
            },
            editor: new Ext.form.TextArea(),
          },
          {
            id: "c_comment",
            header: "หมายเหตุ",
            sortable: true,
            align: "center",
            dataIndex: "c_comment",
            width: 120,
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = 'style="text-align: left;"';
              return "<pre>" + value + "</pre>";
            },
            editor: new Ext.form.TextArea(),
          },
          { header: "ผู้ทำรายการล่าสุด", sortable: true, align: "center", dataIndex: "dc_user_update_id" },
          {
            header: "วันที่ทำรายการล่าสุด",
            sortable: true,
            align: "center",
            dataIndex: "d_update",
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              return value != "" ? shortThaiDate(value) : "";
            },
          },
          { header: "หน่วยงานที่ทำรายการล่าสุด", sortable: true, align: "center", width: 150, dataIndex: "dc_user_update_cost_id" },
          { width: 40, dataIndex: "" },
        ],
        bbar: [
          {
            xtype: "buttongroup",
            frame: false,
            items: [
              {
                text: "&nbsp;" + Ext.GLOBAL_BU_SAVE_TH + "&nbsp;",
                id: "save_edit_item",
                iconCls: "icon-save",
                scale: "medium",
                handler: function () {
                  sendData();
                },
              },
              {
                text: "&nbsp;" + "ยืนยันการถอยรายการ" + "&nbsp;",
                id: "save_delete_status",
                iconCls: "icon-application-view-list",
                scale: "medium",
                hidden: true,
                handler: function () {
                  saveDeleteStatus();
                },
              },
              {
                text: "&nbsp;" + "ยืนยันการเปลี่ยนสถานะ" + "&nbsp;",
                id: "save_change_status",
                iconCls: "icon-application-edit",
                scale: "medium",
                hidden: true,
                handler: function () {
                  saveChangeStatus();
                },
              },
              { width: 200 },
            ],
          },
        ],
        autoExpandColumn: "c_comment",
      }),
    ],
  });
}; // formPanelDtl
Ext.extend(formPanelDtl, Ext.Panel, {});
