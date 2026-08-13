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

function popCancel(arr) {
  Ext.objChk = [];
  new Ext.Window({
    title: "เลือกข้อมูล",
    id: "win-pop-cancel",
    layout: "column",
    modal: true,
    border: false,
    items: [
      {
        // column 1
        columnWidth: 0.4,
        layout: "fit",
        height: Ext.getBody().getViewSize().height * 0.8,
        width: Ext.getBody().getViewSize().width * 0.25,
        border: false,
        items: [
          new Ext.FormPanel({
            labelWidth: 140, // label settings here cascade unless overridden
            labelAlign: "right",
            frame: true,
            items: [
              {
                xtype: "fieldset",
                title: "ยกเลิกรายการ",
                defaults: { xtype: "displayfield", width: "90%", readOnly: true },
                items: [
                  { fieldLabel: "เลขที่ฏีกา", style: "color:red; font-weight: bold;", value: arr.data.c_code },
                  { fieldLabel: "รหัสอ้างอิงใบปะหน้า", value: arr.data.c_code_gl_bank },
                  { fieldLabel: "รหัสอ้างอิงค่าใช้จ่าย", value: arr.data.c_code_gl },
                  { fieldLabel: "วันที่เอกสาร", value: shortThaiDate(arr.data.d_doc_date) },
                  { fieldLabel: "วันที่บันทึกบัญชี", value: shortThaiDate(arr.data.d_save_jv_date) },
                  { fieldLabel: "เลขที่บัญชีโอน", value: arr.data.dc_bank_acc_company_id_target_name },
                  { fieldLabel: "รับโอน", value: arr.data.dc_bank_acc_company_id_source_name },
                  { fieldLabel: "เลขที่บัญชีเงินฝาก", value: arr.data.dc_bank_acc_company_id_source2_name },
                  { fieldLabel: "รหัสบัญชี", value: arr.data.dc_acc_name },
                  { fieldLabel: "จำนวนขอเบิก", value: floatRenderer(arr.data.f_money) },
                  {
                    xtype: "compositefield",
                    fieldLabel: "วันที่บันทึกบัญชียกเลิกฎีกา",
                    anchor: "100%",
                    msgTarget: "under",
                    readOnly: false,
                    items: [
                      { id: "d_save_jv_cancel", fieldLabel: "วันที่บันทึกบัญชียกเลิกฎีกา", xtype: "datefield", width: 128, readOnly: false },
                      { xtype: "displayfield", value: "<font color=red>*</font>" }
                    ]
                  }
                ]
              }
            ],
            buttons: [
              {
                text: "&nbsp;" + Ext.GLOBAL_BU_SAVE_TH + "&nbsp;",
                iconCls: "icon-save",
                handler: function() {
                  var msg = "";
                  var check = false;
                  var jsonArr = [];

                  $("input[id^=chk]").each(function(i, val) {
                    if (val.checked == true) {
                      check = true;
                      jsonArr.push({ cheque_id: val.value });
                    }
                  });

                  if (Ext.getCmp("d_save_jv_cancel").getValue() == "") {
                    msg += "กรุณากรอก วันที่บันทึกบัญชียกเลิกฎีกา<br>";
                  }
                  if (check == false) {
                    msg += "- กรุณาเลือกเช็ค อย่างน้อย 1 รายการ<br>";
                  }

                  if (msg == "") {
                    new Ext.Window({
                      id: "win-pop-confirm",
                      title: "ยืนยันรายการ",
                      modal: true,
                      autoHeight: true,
                      width: 270,
                      html: "<div style='font-size: 14px; padding: 8px 2px; background: #fff; height: 45px;'>ท่านต้องการยกเลิกรายการเช็คหรือไม่ ?</div>",
                      buttons: [
                        {
                          text: "Confirm",
                          handler: function() {
                            Ext.getCmp("win-pop-confirm")
                              .getEl()
                              .mask("Please wait...", "x-mask-loading");
                            Ext.Ajax.request({
                              url: "api/mn_GlBank.php",
                              method: "POST",
                              params: {
                                mode: "CANCEL_GL",
                                id: arr.data.id,
                                gl_tran_hdr_id: arr.data.gl_tran_hdr_id,
                                gl_tran_hdr_id_bank_id: arr.data.gl_tran_hdr_id_bank_id,
                                d_save_jv_cancel: Ext.util.Format.date(Ext.getCmp("d_save_jv_cancel").getValue(), "Y-m-d"),
                                data: JSON.stringify(jsonArr)
                              },
                              success: function(result, request) {
                                Ext.getCmp("win-pop-confirm")
                                  .getEl()
                                  .unmask();
                                var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                                if (jsonData.success == true) {
                                  //Ext.MessageBox.alert("Success", jsonData.msg);		// alert massage success
                                  Ext.store.reload();
                                }
                                Ext.getCmp("win-pop-confirm").destroy();
                                Ext.getCmp("win-pop-cancel").destroy();
                                Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg); // alert massage error
                              },
                              failure: function(result, request) {
                                Ext.MessageBox.alert("Failed", result.responseText); // connect error
                              }
                            });
                          }
                        },
                        {
                          text: Ext.GLOBAL_BU_BACK_TH,
                          handler: function() {
                            Ext.getCmp("win-pop-confirm").destroy();
                          }
                        }
                      ]
                    }).show();
                  } else {
                    Ext.Msg.alert("แจ้งเตือน", msg);
                  }
                }
              },
              {
                text: Ext.GLOBAL_BU_BACK_TH,
                handler: function() {
                  Ext.getCmp("win-pop-cancel").destroy();
                }
              }
            ]
          })
        ]
      },
      {
        // column 2
        columnWidth: 0.6,
        layout: "fit",
        height: Ext.getBody().getViewSize().height * 0.8,
        width: Ext.getBody().getViewSize().width * 0.65,
        items: [
          {
            xtype: "grid",
            border: false,
            stripeRows: true,
            loadMask: true,
            store: Ext.gl_bank_cheque_cancel,
            viewConfig: {
              emptyText: "ไม่มีข้อมูล..",
              deferEmptyText: false
            },
            listeners: {
              afterrender: function() {
                this.getStore().setBaseParam("gl_bank_id", arr.data.id);
                this.getStore().load({
                  callback: function(records, operation, success) {
                    if (success) {
                      $("#checkAll").prop("checked", true);
                      checkAll(true);
                    }
                  }
                });
              }
            },
            columns: [
              new Ext.grid.RowNumberer({
                header: "ที่",
                width: 30,
                renderer: function(value, metaData, record, row, col, store, gridView) {
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
                  return "<input type='checkbox' id='chk[" + value + "]' value=" + value + " checked>";
                }
              },
              { header: "เลขที่เช็ค", sortable: false, align: "center", width: 300, dataIndex: "c_name" },
              {
                header: "วันที่เช็ค",
                sortable: true,
                align: "center",
                dataIndex: "d_cheque",
                renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                  return value != "" ? shortThaiDate(value) : "";
                }
              },
              {
                header: "จำนวนเงิน",
                sortable: false,
                align: "right",
                dataIndex: "f_cheque",
                renderer: function(value, metaData, record, row, col, store, gridView) {
                  return floatRenderer(floatMinus(value, 2));
                }
              }
            ]
          }
        ]
      }
    ]
  }).show();
}
