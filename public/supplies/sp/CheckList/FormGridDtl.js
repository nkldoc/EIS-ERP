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
var cellClick2 = function (grid, rowIndex, columnIndex, e) {
  Ext.selectRow3 = this.selModel.selections.items[0];
  console.log(Ext.selectRow3);
  console.log(this.selModel.selections);
  if (columnIndex === grid.getColumnModel().getIndexById("print")) {
    PrintPreview(Ext.selectRow3.data.po_working_hdr_id);
  }
};
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
        Ext.storePerDtl.load({ params: { id: Ext.HDR_ID, sp_tor_contract: Ext.contract_id } });
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
  var index = Ext.storePerDtl.findExact("i_checked_primary", 1);
  var record = Ext.storePerDtl.getAt(index);

  if (msg == "") {
    var win = new Ext.Window({
      id: "MessageBox_re",
      title: " ยันยืนการเปลื่ยนสถานะ ", //Ext.select_row.c_code_ref +
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
                  Ext.storePerDtl.load({
                    params: { id: Ext.HDR_ID, sp_tor_contract: Ext.contract_id },
                    callback: function (_records, _operation, _success) {},
                  });
                  Ext.getCmp("gridEditor").getColumnModel().setHidden(1, true);
                  Ext.getCmp("bu_change_status_cancel").hide();
                  Ext.getCmp("bu_change_status").show();
                  // Ext.getCmp("bu_delete_status").show();
                  Ext.getCmp("save_change_status").hide();
                  Ext.getCmp("save_edit_item").show();

                  var num = Ext.getCmp("gridEditor").store.data.items.length - 1;
                  var row = 0;
                  while (num >= row) {
                    document.getElementById("chk_" + row).checked = false;
                    var r_record = Ext.storePerDtl.getAt(row);
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
  var index = Ext.storePerDtl.findExact("i_checked", 1);
  var record = Ext.storePerDtl.getAt(index);

  var j = Ext.storePerDtl.totalLength;
  var maxstatus = 0;
  for (var i = 0; i < j; i++) {
    var i_status = Ext.storePerDtl.getAt(i).get("i_status");
    maxstatus = i_status > maxstatus ? i_status : maxstatus;
  }
  if (record.data.i_status == maxstatus) {
    msg += "<span style='white-space: nowrap;'>- ไม่สามารถเลือกรายการสถานะล่าสุดได้</span><br>";
  }
  if (msg == "") {
    var win = new Ext.Window({
      id: "MessageBox_re",
      title: " ยันยืนการถอยสถานะ ", //Ext.select_row.c_code_ref +
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
                  Ext.storePerDtl.load({
                    params: { id: Ext.HDR_ID, sp_tor_contract: Ext.contract_id },
                    callback: function (_records, _operation, _success) {},
                  });
                  Ext.getCmp("gridEditor").getColumnModel().setHidden(1, true);
                  Ext.getCmp("bu_delete_status_cancel").hide();
                  // Ext.getCmp("bu_delete_status").show();
                  Ext.getCmp("save_delete_status").hide();
                  Ext.getCmp("save_edit_item").show();
                  Ext.delete_status = false;

                  var num = Ext.getCmp("gridEditor").store.data.items.length - 1;
                  var row = 0;
                  while (num >= row) {
                    document.getElementById("chk_" + row).checked = false;
                    var record = Ext.storePerDtl.getAt(row);
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
      var record = Ext.storePerDtl.getAt(row);
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
      var record = Ext.storePerDtl.getAt(row);
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
      var record = Ext.storePerDtl.getAt(row);
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
      var record = Ext.storePerDtl.getAt(row);
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
}

// Class Extend
formPanelDtl = function (args, store) {
  formPanelDtl.superclass.constructor.call(this, {
    title: "รายละเอียด PR แบบงวด",
    id: "PanelDtl",
    iconCls: "icon-application-view-list",
    region: "center",
    // layout: "fit",
    border: false,
    stripeRows: true,
    loadMask: true,
    items: [
      new Ext.grid.GridPanel({
        //EditorGridPanel
        id: "gridEditor",
        region: "center",
        layout: "fit",
        height: 400,
        border: true,
        stripeRows: true,
        loadMask: true,
        clicksToEdit: 1,
        store: Ext.storePerDtl,
        viewConfig: {
          emptyText: "ไม่มีข้อมูล..",
          deferEmptyText: false,
          getRowClass: function (record, index, rowParams) {
            // console.log(record);
            // console.log(Ext.select_row);
            return "td-primary";
            return "td-delete";
            return "disabled-row";
            return "td-select";

            if (record.data.i_checked == 1 || record.data.i_checked == 2) {
              return "td-select";
            } else if (record.data.i_checked == 3) {
            }
            if (record.data.i_checked_primary == 1) {
            }
            // if (Ext.select_row.i_status_last == record.data.i_status) {
            // }
            // if (Ext.select_row.i_enabled == 2 || Ext.select_row.i_enabled == 2  ) {
            // }
          },
        },
        listeners: {
          dblclick: function (dataview, index, item, e) {
            Ext.buAct = "update";
            Ext.selectDefault = Ext.selectRow;

            Ext.loadStore("edit", true); // app,data.load
          },
          viewready: function (g) {
            //
          },
          // Allow rows to be rendered.
          beforeedit: function (g) {
            if (g.rowIdx == 1) return false;
          },
          // Allow rows to be rendered. console.log(value.format('d-m-Y'));
          afteredit: function (g) {
            console.log(Ext.storeDtl);
            // console.log(g.record.get('d_inv_date').format('d-m-Y'));
          },
          afterrender: function (grid) {
            //g.getStore().getAt(rowIndex);
            var element = Ext.get(grid.getView().mainHd.id);
            element.on("contextmenu", function (e, t) {
              e.stopEvent();
              var menu = new Ext.menu.Menu();
              menu.add({
                text: "Refresh",
                icon: "../images/icons/arrow_refresh_small.png",
                scope: this,
                handler: function (e) {
                  grid.store.load();
                },
              });
              if (Ext.session.user_id == 1) {
                menu.addSeparator();
                menu.add(
                  new Ext.menu.Item({
                    text: "show only admin",
                    disabled: true,
                    cls: "menu-separator-text",
                  })
                );
                menu.add({
                  text: "Inspect SQL",
                  icon: "../images/icons/script_lightning.png",
                  scope: this,
                  handler: function (e) {
                    grid.store.load({ params: { show_sql: 1, id: Ext.sp_tor_id } });
                  },
                });
              }
              menu.showAt(e.getXY());
            });
            this.on("cellclick", cellClick2, this); //cellClick
            this.on(
              "contextmenu",
              function (e, grid, rowIndex, columnIndex) {
                e.stopEvent();
                // this.contextMenu.showAt(e.getXY());
              },
              this
            );


          },
           contextmenu: function (e) {
            e.stopEvent();
            var mymenu = new Ext.menu.Menu({
              items: [
                {
                  text: 'คัดลอก "' + Ext.selectRow3.data.c_code + '"',
                  hidden: Ext.selectRow3.data.c_code == null ? true : false,
                  icon: "../images/icons/page_copy.png",
                  scope: this,
                  handler: function (e) {
                    copyToClipboard(Ext.selectRow3.data.c_code);
                  },
                },
                {
                  text: 'คัดลอก "' + Ext.selectRow3.data.c_arrive_code + '"',
                  hidden: Ext.selectRow3.data.c_arrive_code == null ? true : false,
                  icon: "../images/icons/page_copy.png",
                  scope: this,
                  handler: function (e) {
                    // console.log(Ext.selectRow3.data)
                    copyToClipboard(Ext.selectRow3.data.c_arrive_code);
                  },
                },
                {
                  text: 'คัดลอก "' + Ext.selectRow3.data.c_code_chk + '"',
                  hidden: Ext.selectRow3.data.c_code_chk == null ? true : false,
                  icon: "../images/icons/page_copy.png",
                  scope: this,
                  handler: function (e) {
                    copyToClipboard(Ext.selectRow3.data.c_code_chk);
                  },
                },
                {
                  text: 'คัดลอก "' + Ext.selectRow3.data.d_doc_billing + '"',
                  hidden: Ext.selectRow3.data.d_doc_billing == null ? true : false,
                  icon: "../images/icons/page_copy.png",
                  scope: this,
                  handler: function (e) {
                    copyToClipboard(Ext.selectRow3.data.d_doc_billing);
                  },
                },
                {
                  text: 'คัดลอก "' + Ext.selectRow3.data.c_code_d + '"',
                  hidden: Ext.selectRow3.data.c_code_d == null ? true : false,
                  icon: "../images/icons/page_copy.png",
                  scope: this,
                  handler: function (e) {
                    copyToClipboard(Ext.selectRow3.data.c_code_d);
                  },
                },
              ],
              listeners: {
                beforerender: function () {
                  Ext.receiveJson = function (obj, id) {
                    let Date_now = new Date();
                    let jsonApplay = Ext.apply(obj, {
                      client_datetime: Date_now.format("Y-m-d H:i:s"),
                      user_sent_id: Ext.session.user_id,
                      user_id: id,
                      user_sent_name: Ext.session.user_name,
                      c_menu: "checking",
                      dc_department_id: 0,
                      dc_cost_id: 32,
                      i_status: 1,
                    });
                    if (id != 0)
                      //sent all
                      Ext.Ajax.request({
                        url: "../php-notic/insertLoger.php",
                        method: "POST",
                        params: jsonApplay,
                        success: function (response) {},
                      });
                  };
                },
                hide: function () {
                  setTimeout(function () {
                    mymenu.destroy();
                  }, 0);
                },
              },
            });
            mymenu.showAt(e.getXY());
          },
        },
        tbar: [
          {
            xtype: "buttongroup",
            columns: 1,
            // title: "ระบุเงื่อนไขในการค้นหาข้อมูล",
            defaults: { scale: "small", style: "float: left" },
            listeners: {
              // afterrender: function (cmp) {
            },
            items: [
              {
                xtype: "buttongroup",
                frame: false,
                items: [
                  { xtype: "tbspacer", width: 55 },
                  { xtype: "label", text: "สถานะสัญญา", style: "text-align: center;font-weight:bold;background:#eee;" },
                ],
              },
              {
                xtype: "buttongroup",
                frame: false,
                items: [
                  // { xtype: "label", text: "วันที่เริ่มสัญญา : " },
                  // { xtype: "tbspacer", width: 14 },textAlign
                  {
                    xtype: "textarea",
                    width: 200,
                    value: store.stats_con,
                    style: {
                      textAlign: "center", // จัดข้อความให้อยู่กลางแนวนอน
                      fontWeight: "bold", // จัดข้อความให้อยู่กลางแนวนอน
                      background: "#eee", // จัดข้อความให้อยู่กลางแนวนอน
                      fontSize: "18px", // จัดข้อความให้อยู่กลางแนวนอน
                      paddingTop: "15px", // ปรับ padding ด้านบนเพื่อให้ข้อความอยู่ตรงกลาง
                      boxSizing: "border-box", // ป้องกัน padding ทำให้ขนาด textarea เปลี่ยน
                    },
                    readOnly: true,
                  },
                ],
              },
            ],
          },
          {
            xtype: "buttongroup",
            columns: 1,
            // title: "ระบุเงื่อนไขในการค้นหาข้อมูล",
            defaults: { scale: "small", style: "float: left" },
            listeners: {
              // afterrender: function (cmp) {
            },
            items: [
              {
                xtype: "buttongroup",
                frame: false,
                items: [
                  { xtype: "label", text: "เลข PR : " },
                  { xtype: "tbspacer", width: 20 },
                  {
                    xtype: "textfield",
                    width: 150,
                    value: store.c_code,
                    style: "text-align: center;font-weight:bold;background:#eee;",
                    readOnly: true,
                  },
                ],
              },
              {
                xtype: "buttongroup",
                frame: false,
                items: [
                  {
                    xtype: "buttongroup",
                    frame: false,
                    items: [
                      { xtype: "label", text: "เลข พวช : " },
                      { xtype: "tbspacer", width: 15 },
                      {
                        xtype: "textfield",
                        width: 150,
                        value: store.d_doc_ref,
                        style: "text-align: center;font-weight:bold;background:#eee;",
                        readOnly: true,
                      },
                    ],
                  },
                ],
              },
              {
                xtype: "buttongroup",
                frame: false,
                items: [
                  {
                    xtype: "buttongroup",
                    frame: false,
                    items: [
                      { xtype: "label", text: "เลขสัญญา : " },
                      { xtype: "tbspacer", width: 4 },
                      {
                        xtype: "textfield",
                        width: 150,
                        value: store.code,
                        style: "text-align: center;font-weight:bold;background:#eee;",
                        readOnly: true,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            xtype: "buttongroup",
            columns: 1,
            // title: "ระบุเงื่อนไขในการค้นหาข้อมูล",
            defaults: { scale: "small", style: "float: left" },
            listeners: {
              // afterrender: function (cmp) {
            },
            items: [
              {
                xtype: "buttongroup",
                frame: false,
                items: [
                  {
                    xtype: "buttongroup",
                    frame: false,
                    items: [
                      { xtype: "label", text: "ชื่อรายการ : " },
                      { xtype: "tbspacer", width: 4 },
                      {
                        xtype: "textfield",
                        width: 545,
                        // fieldLabel: "เลขที่ พวชฟหกฟหกฟหกฟหกฟหกฟหกดฟหก",
                        value: store.c_name,
                        style: "text-align: left;font-weight:bold;background:#eee;",
                        readOnly: true,
                        listeners: {
                          render: function (textfield) {
                            // console.log(textfield);
                            tooltip_TextField(textfield, "tesasdasd");
                          },
                        },
                      },
                    ],
                  },
                ],
              },
              {
                xtype: "buttongroup",
                frame: false,
                items: [
                  {
                    xtype: "buttongroup",
                    frame: false,
                    items: [
                      { xtype: "label", text: "เลขผู้เสียภาษี : " },
                      { xtype: "tbspacer", width: 18 },
                      {
                        xtype: "textfield",
                        width: 150,
                        value: store.c_tax_number_imp,
                        style: "text-align: center;font-weight:bold;background:#eee;",
                        readOnly: true,
                      },
                      { xtype: "tbspacer", width: 15 },
                      { xtype: "label", text: "ผู้ขายผู้รับจ้าง : " },
                      {
                        xtype: "textfield",
                        width: 280,
                        value: store.dc_creditor_name,
                        style: "text-align: left;font-weight:bold;background:#eee;",
                        readOnly: true,
                      },
                    ],
                  },
                ],
              },
              {
                xtype: "buttongroup",
                frame: false,
                items: [
                  // { xtype: "tbspacer", width: 4 },
                  { xtype: "label", text: "จำนวนเงิน PR : " },
                  { xtype: "tbspacer", width: 7 },
                  {
                    xtype: "textfield",
                    width: 150,
                    // fieldLabel: "เลขที่ พวช",
                    value: store.f_total_amt,
                    readOnly: true,
                    style: {
                      labelAlign: "right",
                      "font-weight": "bold",
                      padding: "1px",
                      margin: "1px",
                      color: "blue",
                      background: "#eee",
                      "text-align": "right",
                    },
                  },
                  { xtype: "tbspacer", width: 17 },
                  { xtype: "label", text: " สัญญา : " },
                  {
                    xtype: "textfield",
                    width: 150,
                    // fieldLabel: "เลขที่ พวช",
                    value: store.f_total_contract,
                    readOnly: true,
                    style: {
                      labelAlign: "right",
                      "font-weight": "bold",
                      padding: "1px",
                      margin: "1px",
                      color: "blue",
                      background: "#eee",
                      "text-align": "right",
                    },
                  },
                ],
              },
            ],
          },
          {
            xtype: "buttongroup",
            columns: 1,
            // title: "ระบุเงื่อนไขในการค้นหาข้อมูล",
            defaults: { scale: "small", style: "float: left" },
            listeners: {
              // afterrender: function (cmp) {
            },
            items: [
              {
                xtype: "buttongroup",
                frame: false,
                items: [
                  { xtype: "label", text: "วันที่เริ่มสัญญา : " },
                  { xtype: "tbspacer", width: 14 },
                  {
                    xtype: "textfield",
                    width: 150,
                    value: store.d_doc_content,
                    style: "text-align: center;font-weight:bold;background:#eee;",
                    readOnly: true,
                  },
                ],
              },
              {
                xtype: "buttongroup",
                frame: false,
                items: [
                  {
                    xtype: "buttongroup",
                    frame: false,
                    items: [
                      { xtype: "label", text: "วันที่เริ่มทำงาน: " },
                      { xtype: "tbspacer", width: 20 },
                      {
                        xtype: "textfield",
                        width: 150,
                        value: store.d_start_content,
                        style: "text-align: center;font-weight:bold;background:#eee;",
                        readOnly: true,
                      },
                    ],
                  },
                ],
              },
              {
                xtype: "buttongroup",
                frame: false,
                items: [
                  {
                    xtype: "buttongroup",
                    frame: false,
                    items: [
                      { xtype: "label", text: "วันที่สิ้นสุดสัญญา : " },
                      { xtype: "tbspacer", width: 3 },
                      {
                        xtype: "textfield",
                        width: 150,
                        value: store.d_due_content,
                        style: "text-align: center;font-weight:bold;background:#eee;",
                        readOnly: true,
                      },
                    ],
                  },
                ],
              },
            ],
          },

          {
            text: "เปลี่ยนสถานะ",
            id: "bu_change_status",
            hidden: true,
            iconCls: "icon-application-edit",
            handler: function (_grid, _rowIndex, _colIndex) {
              Ext.delete_status = true;
              Ext.storePerDtl.load({
                params: { id: Ext.HDR_ID },
                callback: function (_records, _operation, _success) {},
              });
              Ext.getCmp("gridEditor").getColumnModel().setHidden(1, false);
              this.hide();
              // Ext.getCmp("bu_change_status_cancel").show();
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
              Ext.storePerDtl.load({
                params: { id: Ext.HDR_ID },
                callback: function (_records, _operation, _success) {},
              });
              Ext.getCmp("gridEditor").getColumnModel().setHidden(1, true);
              this.hide();
              Ext.getCmp("bu_change_status").show();
              // Ext.getCmp("bu_delete_status").show();
              Ext.getCmp("save_change_status").hide();
              Ext.getCmp("save_edit_item").show();

              var num = Ext.getCmp("gridEditor").store.data.items.length - 1;
              var row = 0;
              while (num >= row) {
                document.getElementById("chk_P" + row).checked = false;
                var record = Ext.storePerDtl.getAt(row);
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
            hidden: true,
            iconCls: "icon-application-view-list",
            handler: function (_grid, _rowIndex, _colIndex) {
              Ext.delete_status = true;
              Ext.storePerDtl.load({
                params: { id: Ext.HDR_ID },
                callback: function (_records, _operation, _success) {},
              });
              Ext.getCmp("gridEditor").getColumnModel().setHidden(2, false);
              this.hide();
              // Ext.getCmp("bu_delete_status_cancel").show();
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
              Ext.storePerDtl.load({
                params: { id: Ext.HDR_ID, sp_tor_contract: Ext.contract_id },
                callback: function (_records, _operation, _success) {},
              });
              Ext.getCmp("gridEditor").getColumnModel().setHidden(2, true);
              this.hide();
              // Ext.getCmp("bu_delete_status").show();
              Ext.getCmp("bu_change_status").show();
              Ext.getCmp("save_delete_status").hide();
              Ext.getCmp("save_edit_item").show();

              var num = Ext.getCmp("gridEditor").store.data.items.length - 1;
              var row = 0;
              while (num >= row) {
                document.getElementById("chk_" + row).checked = false;
                var record = Ext.storePerDtl.getAt(row);
                record.set("i_checked", 0);
                record.commit();
                row++;
              }
            },
          },
          { xtype: "tbfill" },
          {
            xtype: "label",
            // text: Ext.select_row.c_code_ref,
            id: "text_conut",
            style: "font-size: 15px; font-weight: bold; color: blue;",
          },
          {
            xtype: "container",
            items: [
              { xtype: "container", height: 92 },
              {
                xtype: "label",
                html: '<img src="../images/icons/information.png">',
                layout: {
                  pack: "center",
                  type: "hbox",
                },
                listeners: {
                  render: function (c) {
                    var style_dot_color = "font-size:20px; -webkit-text-stroke: 0.5px black;";
                    var text_ToolTip = "<span style='white-space:nowrap;'><span style='" + style_dot_color + "color: #E4FFE4;'>∎</span>ผ่านรายการ</span>";
                    text_ToolTip += "<span style='white-space:nowrap;'><span style='" + style_dot_color + "color: #FEF8C2;'>∎</span>บันทึกรายการสัญญา</span><br>";
                    //   text_ToolTip += "<span style='white-space:nowrap;'><span style='" + style_dot_color + "color: #FFEBEB;'>∎</span> รายการยกเลิก</span><br>";
                    new Ext.ToolTip({
                      target: c.id,
                      anchor: "top",
                      html: text_ToolTip,
                      bodyStyle: {
                        backgroundColor: "#FFFFFF",
                      },
                    });
                  },
                },
              },
            ],
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
              return (
                "<input style='margin-top:3px; margin-bottom:2px;' type='checkbox' onchange='check_P_ID(" +
                row +
                ")' id='chk_P" +
                row +
                "' value='" +
                record.data.am_asset_hdr_id +
                "'" +
                checked +
                " " +
                readonly +
                "> "
              );
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
              return (
                "<input style='margin-top:3px; margin-bottom:2px;' type='checkbox' onchange='checkID(" +
                row +
                ")' id='chk_" +
                row +
                "' value='" +
                record.data.am_asset_hdr_id +
                "'" +
                checked +
                " " +
                readonly +
                "> "
              );
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
            header: "เอกสารขอใบเบิก",
            sortable: false,
            width: 109,
            align: "center",
            dataIndex: "c_file_pdf_hdr",
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              var BtnText =
                "<img src='../images/icons/page_white_acrobat.png' style='margin-right:1px;' /><div><spen style='font-size:11px; color: green;'>&nbsp<b>" + record.data.c_code_d + "</b>&nbsp</spen>";
              if (record.data.i_is_url_pdf_hdr == null) {
                return "-";
              } else if (record.data.i_is_url_pdf_hdr == 0) {
                return '<button style="display: flex; height: 18px; padding: 0px;" onclick="Po_OpenPdf(\'' + value + "', '" + record.data.c_code_d + '\')" type="button">' + BtnText + "</button>";
              } else {
                return "-";
              }
            },
          },
          {
            header: "เอกสารประกอบ",
            sortable: false,
            width: 109,
            align: "center",
            dataIndex: "c_file_pdf_dtl",
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_pdf_dtl_outside == 1) {
                var BtnText = "<img src='../images/icons/page_white_acrobat.png' style='margin-right:1px;' /><div><spen style='font-size:11px; color:red;'>ㅤนอกระบบㅤㅤ</spen>";
              } else {
                var BtnText = "<img src='../images/icons/page_white_acrobat.png' style='margin-right:1px;' /><div><spen style='font-size:11px'>&nbspเอกสารประกอบ&nbsp</spen>";
              }
              if (record.data.i_is_url_pdf_dtl == null) {
                return "-";
              } else if (record.data.i_is_url_pdf_dtl == 0) {
                return '<button style="display: flex; height: 18px; padding: 0px;" onclick="Po_OpenPdf(\'' + value + "', '" + record.data.c_code_d + '\')" type="button">' + BtnText + "</button>";
              } else {
                return "-";
              }
            },
          },
          {
            header: "-",
            id: "print",
            sortable: true,
            dataIndex: "po_working_hdr_id",
            width: 40,
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = "align='center'";
              if (record.data.po_working_hdr_id == null) {
                return "-";
              } else if (record.data.po_working_hdr_id !=  null) {
                return "<div style='cursor:pointer'><img src='../images/icons/printer_mono.png' style='margin-right:1px;' /><div>";
              } else {
                return "-";
              }
            },
          },
          {
            header: "สถานะงวด",
            sortable: false,
            align: "center",
            width: 120,
            dataIndex: "stats_period",
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = 'style="text-align: center;"';
              return value;
            },
          },
          {
            header: "เลขที่รับของ",
            sortable: false,
            align: "center",
            width: 120,
            dataIndex: "c_arrive_code",
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = 'style="text-align: center;"';
              return value;
            },
          },
          {
            header: "วันที่รับของ",
            sortable: true,
            align: "center",
            width: 120,
            dataIndex: "d_arrive_date",
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              return value != "" ? shortThaiDate(value) : "";
            },
          },
          {
            header: "เลขที่ตรวจรับ",
            sortable: false,
            align: "center",
            width: 120,
            dataIndex: "c_code_chk",
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = 'style="text-align: center;"';
              return value;
            },
          },
          {
            header: "วันที่ตรวจรับ",
            sortable: true,
            align: "center",
            width: 120,
            dataIndex: "d_checking_date",
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              return value != "" ? shortThaiDate(value) : "";
            },
          },
          {
            header: "เลขที่วางบิล",
            sortable: false,
            align: "center",
            width: 120,
            dataIndex: "c_code_bl",
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = 'style="text-align: center;"';
              return value;
            },
          },
          {
            header: "วันที่วางบิล",
            sortable: true,
            align: "center",
            width: 120,
            dataIndex: "d_doc_billing",
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              return value != "" ? shortThaiDate(value) : "";
            },
          },
          {
            header: "เลขที่ใบเบิก",
            sortable: false,
            align: "center",
            width: 120,
            dataIndex: "c_code_d",
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = 'style="text-align: center;"';
              return value;
            },
          },
          {
            header: "วันที่สร้างใบเบิก",
            sortable: true,
            align: "center",
            width: 120,
            dataIndex: "d_po_working_hdr",
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              return value != "" ? shortThaiDate(value) : "";
            },
          },
          // {
          //   header: "วันที่ส่ง",
          //   sortable: true,
          //   align: "center",
          //   dataIndex: "d_doc_arrive_dt",
          //   width: 120,
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     return value != "" ? shortThaiDate(value) : "";
          //   },
          //   editor: new Ext.form.DateField(),
          // },
          // {
          //   header: " ",
          //   sortable: true,
          //   align: "center",
          //   dataIndex: "d_receive_date",
          //   width: 40,
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     return "  |";
          //     if (record.data.i_status == 3) {
          //       return value != "" ? shortThaiDate(value) : "";
          //     } else {
          //     }
          //   },
          //   editor: new Ext.form.DateField(),
          // },
          // {
          //   id: "c_overlap",
          //   header: "เลขที่ใบกันเหลื่อม",
          //   sortable: true,
          //   align: "center",
          //   dataIndex: "c_overlap",
          //   width: 120,
          //   renderer: function (value, metaData, record, rowIndex, colIndex,d store) {
          //     metaData.attr = 'style="text-align: left;"';
          //     return "<pre>" + value + "</pre>";
          //   },
          //   editor: new Ext.form.TextArea(),
          // },
          // {
          //   id: "c_billing_code",
          //   header: "เลขที่วางบิล",
          //   sortable: true,
          //   align: "center",
          //   dataIndex: "c_billing_code",
          //   width: 120,
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     metaData.attr = 'style="text-align: left;"';
          //     return "<pre>" + value + "</pre>";
          //   },
          //   editor: new Ext.form.TextArea(),
          // },
          {
            id: "c_comment",
            header: "หมายเหตุ",
            sortable: true,
            align: "center",
            dataIndex: "c_comment",
            width: 120,
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = 'style="text-align: left;"';
              return "<pre>" + "" + "</pre>";
            },
            editor: new Ext.form.TextArea(),
          },
          // { header: "ผู้ทำรายการล่าสุด", sortable: true, align: "center", dataIndex: "dc_user_update_id" },

          // { header: "หน่วยงานที่ทำรายการล่าสุด", sortable: true, align: "center", width: 150, dataIndex: "dc_user_update_cost_id" },
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
                hidden: true,
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
// var cellClick = function (grid, rowIndex, columnIndex, e) {
//   Ext.selectRow = this.selModel.selection.record;
//   if (columnIndex === grid.getColumnModel().getIndexById("check_pdfID")) {
//     if (Ext.selectRow.data.check_pdf > 0) {
//       var linkDownload = window.location.protocol + "//" + window.location.hostname + "/sp_mn/api/upload_eis_Chk/";
//       if (Ext.isEmpty(Ext.selectRow)) Ext.MessageBox.alert("แจ้งเตือน", "กรุณากดเลือกข้อมูลที่จะแสดง/ออกเลข PR ก่อน");
//       window.open(linkDownload + Ext.selectRow.get("c_arrive_code") + ".pdf?T=Tap_" + Math.floor(Math.random() * 100000), "_blank", 'fullscreen="yes"');
//     }
//   } else {
//     Ext.period_status = false;
//   }
// };
Ext.extend(formPanelDtl, Ext.Panel, {});
