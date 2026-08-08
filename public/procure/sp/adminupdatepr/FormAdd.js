Ext.HDR_ID = null;

const saveHdr = function (type) {
  let msg = "";

  // if (Ext.getCmp("dc_expense_budget_type_id").getValue() == "") {
  //   msg += "<span style='white-space: nowrap;'>- กรุณาเลือก แหล่งเงิน</span><br>";
  // }
  // if (Ext.getCmp("i_budget_year").getValue() == "") {
  //   msg += "<span style='white-space: nowrap;'>- กรุณาเลือก ปีงบประมาณ</span><br>";
  // }
  // if (Ext.getCmp("i_pr_year").getValue() == "") {
  //   msg += "<span style='white-space: nowrap;'>- กรุณาเลือก ใช้เงินปีงบประมาณ</span><br>";
  // }
  // if (Ext.getCmp("dc_expense_budget_type_id").getValue() == "") {
  //   msg += "<span style='white-space: nowrap;'>- กรุณาเลือก แหล่งเงิน</span><br>";
  // }
  // if (Ext.getCmp("dc_cost_id").getValue() == "") {
  //   msg += "<span style='white-space: nowrap;'>- กรุณาเลือก หน่วยงานที่รับผิดชอบ</span><br>";
  // }
  // if (Ext.getCmp("po_creditor_id").getValue() == "") {
  //   msg += "<span style='white-space: nowrap;'>- กรุณาเลือก จ่ายให้</span><br>";
  // }
  // if (Ext.getCmp("po_creditor_transfer_id").getValue() == "") {
  //   msg += "<span style='white-space: nowrap;'>- กรุณาเลือก โดยมอบให้</span><br>";
  // }
  // if (Ext.getCmp("c_qty").getValue() == "") {
  //   msg += "<span style='white-space: nowrap;'>- กรุณากรอก จำนวนรายการ</span><br>";
  // }
  // if (Ext.getCmp("f_total").getValue() == "") {
  //   msg += "<span style='white-space: nowrap;'>- กรุณากรอก จำนวนเงิน</span><br>";
  // }
  // if (Ext.getCmp("d_doc_date").getValue() == "") {
  //   msg += "<span style='white-space: nowrap;'>- กรุณากรอก วันที่ใบขอเบิก</span><br>";
  // }
  // if (Ext.getCmp("dc_approve_id").getValue() == "") {
  //   msg += "<span style='white-space: nowrap;'>- กรุณาเลือก ผู้ตรวจอนุมัติฎีกา</span><br>";
  // }
  // if (Ext.getCmp("c_approve").getValue() == "") {
  //   msg += "<span style='white-space: nowrap;'>- กรุณากรอก เลขที่ฏีกา</span><br>";
  // }
  // if (Ext.getCmp("d_approve_date").getValue() == "") {
  //   msg += "<span style='white-space: nowrap;'>- กรุณากรอก วันที่อนุมัติฏีกา</span><br>";
  // }

  if (msg == "") {
    var win = new Ext.Window({
      id: "MessageBox_re",
      title: "ยันยืนการแก้ไข ",
      modal: true,
      width: 310,
      // height: 150,
      items: [
        {
          xtype: "form",
          id: "form-widgets2",
          frame: true,
          labelAlign: "right",
          labelWidth: 0.1,
          bodyStyle: { padding: "10px 20px" },
          defaults: { anchor: "100%", msgTarget: "side" },
          items: [
            // {
            //   xtype: "displayfield",
            //   id: "displaytext",
            //   width: 200,
            //   value: "การถอยสถานะจะไม่สามารถกู้คืนสถานะที่ถูกลบได้",
            //   style: "text-align: center; color:red; white-space: nowrap;",
            // },
            {
              xtype: "radiogroup",
              /*ss*/
              // width: 200,
              columns: [100, 200],
              id: "i_logID",
              // fieldLabel: "วิธีการอัพเดท",
              items: [
                {
                  name: "i_log",
                  inputValue: 1,
                  checked: true,
                  boxLabel: "อัพเดทเก็บ log",
                },
                {
                  name: "i_log",
                  inputValue: 2,
                  boxLabel: "อัพเดทไม่เก็บ log",
                },
              ],
              listeners: {
                change: function (cb, rec, ind) {},
                afterrender: function (obj, eOpts) {},
              },
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
          text: "บันทึกรายการ1",
          id: "Save_cancel_over",
          iconCls: "icon-save",
          disabled: true,
          handler: function () {
            Ext.getCmp("MessageBox_re").hide();
            Ext.getCmp("MessageBox_re").destroy();
            var form = Ext.getCmp("form-widgets"); // ID ของ FormPanel
            // return ;
            // ดักจับการส่งฟอร์ม
            // form.on("beforeaction", function (form, action) {
            //     if (action.type === "submit") {
            //         // ดึงค่าจาก LovCombo
            //         var combo = Ext.getCmp("table_updateID");
            //         var selectedIds = combo.getValue().split(",");

            //         // ดึงข้อมูลจาก store
            //         var selectedData = [];
            //         combo.getStore().each(function (record) {
            //             if (selectedIds.indexOf(record.get("id")) !== -1) {
            //                 selectedData.push({
            //                     id: record.get("id"),
            //                     text: record.get("text"),
            //                 });
            //             }
            //         });

            //         // แปลงข้อมูลเป็น JSON
            //         var jsonData = Ext.encode(selectedData);

            //         // ตั้งค่าใหม่ให้ฟอร์ม
            //         form.findField("hidden_table_updateID").setValue(jsonData);
            //     }
            // });

            // ส่งฟอร์ม
            form.getForm().submit({
              url: "adminupdatepr/php/mn_spWorkingAdvancedEdit.php", // URL ที่จะส่งข้อมูลไป
              method: "POST",
              success: function (form, action) {
                Ext.Msg.alert("สำเร็จ", "ข้อมูลถูกบันทึกเรียบร้อยแล้ว!");
                Ext.store.load();
                // Ext.store.load();
                // Ext.Msg.alert('Success', 'Form submitted successfully!');
                Ext.getCmp("frm-Add").destroy();
              },
              failure: function (form, action) {
                Ext.Msg.alert("ล้มเหลว", "ไม่สามารถบันทึกข้อมูลได้!");
              },
            });
          },
          /* handler: function () {


            // Ext.getCmp("frm-Add").getEl().mask("Please wait...", "x-mask-loading");
            // Ext.Ajax.request({
            //   url: "api/mn_poWorkingAdvancedEdit.php",
            //   method: "POST",
            //   params: {
            //     mode: "EDIT",
            //     id: Ext.HDR_ID,
            //     c_code_ref: Ext.getCmp("c_code_ref").getValue(),
            //     i_yyyy: Ext.getCmp("i_yyyy").getValue(),
            //     i_pr_year: Ext.getCmp("i_pr_year").getValue(),
            //     dc_expense_budget_type_id: Ext.getCmp("dc_expense_budget_type_id").getValue(),
            //     po_expense_id: Ext.getCmp("po_expense_id").getValue(),
            //     dc_cost_id: Ext.getCmp("dc_cost_id").getValue(),
            //     dc_cost2_id: Ext.getCmp("dc_cost2_id").getValue(),
            //     po_creditor_id: Ext.getCmp("po_creditor_id").getValue(),
            //     po_creditor_transfer_id: Ext.getCmp("po_creditor_transfer_id").getValue(),
            //     c_qty: Ext.getCmp("c_qty").getValue(),
            //     f_total: Ext.getCmp("f_total").getValue().replace(/,/g, ""),
            //     d_audit_date: Ext.util.Format.date(Ext.getCmp("d_audit_date").getValue(), "Y-m-d"),
            //     po_emp_id: Ext.getCmp("po_emp_id").getValue(),
            //     d_doc_date: Ext.util.Format.date(Ext.getCmp("d_doc_date").getValue(), "Y-m-d"),
            //     dc_approve_id: Ext.getCmp("dc_approve_id").getValue(),
            //     d_inv_date: Ext.util.Format.date(Ext.getCmp("d_inv_date").getValue(), "Y-m-d"),
            //     c_comment: Ext.getCmp("c_comment").getValue(),
            //     c_approve: Ext.getCmp("c_approve").getValue(),
            //     d_approve_date: Ext.util.Format.date(Ext.getCmp("d_approve_date").getValue(), "Y-m-d"),
            //     c_booking: Ext.getCmp("c_booking").getValue(),
            //     i_protest: Ext.getCmp("i_protest").getValue(),
            //     i_enable: Ext.getCmp("i_enable").getValue().inputValue,
            //   },
            //   success: function (result, request) {
            //     Ext.getCmp("frm-Add").getEl().unmask();
            //     let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
            //     if (jsonData.success == true) {
            //       Ext.store.load({ params: { mode: "" } });
            //       Ext.Msg.alert("แจ้งเตือน", jsonData.msg);
            //       Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not errer
            //       Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
            //       Ext.getCmp("MessageBox_re").hide();
            //       Ext.getCmp("MessageBox_re").destroy();
            //     } else {
            //       Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg);
            //       Ext.getCmp("MessageBox_re").hide();
            //       Ext.getCmp("MessageBox_re").destroy();
            //     }
            //   },
            //   failure: function (result, request) {
            //     Ext.MessageBox.alert("Failed", result.responseText); // connect error
            //     Ext.getCmp("MessageBox_re").hide();
            //     Ext.getCmp("MessageBox_re").destroy();
            //   },
            // });
          },*/
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
}; // saveHdr
const deleteHdr = function (type) {
  let msg = "";

  if (msg == "") {
    var win = new Ext.Window({
      id: "MessageBox_re",
      title: "ยันยืนการลบใบขอเบิก ",
      modal: true,
      width: 310,
      // height: 150,
      items: [
        {
          xtype: "form",
          id: "form-widgets2",
          frame: true,
          labelAlign: "right",
          labelWidth: 0.1,
          bodyStyle: { padding: "10px 20px" },
          defaults: { anchor: "100%", msgTarget: "side" },
          items: [
            // {
            //   xtype: "displayfield",
            //   id: "displaytext",
            //   width: 200,
            //   value: "การลบใบขอเบิกจะไม่สามารถกู้คืนได้",
            //   style: "text-align: center; color:red; white-space: nowrap;",
            // },
            {
              xtype: "textfield",
              enableKeyEvents: true,
              id: "confirm_text",
              width: 200,
              value: "",
              style: "text-align: center;",
              emptyText: 'กรุณากรอก "ยืนยัน" เพื่อลบรายการ',
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
          text: "บันทึกรายการ2",
          id: "Save_cancel_over",
          iconCls: "icon-save",
          disabled: true,
          handler: function () {
            // Ext.getCmp("frm-Add").getEl().mask("Please wait...", "x-mask-loading");
            Ext.Ajax.request({
              url: "api/mn_poWorkingAdvancedEdit.php",
              method: "POST",
              params: {
                mode: "DELETE",
                id: Ext.HDR_ID,
                c_code_ref: Ext.select_row.c_code_ref,
              },
              success: function (result, request) {
                Ext.getCmp("frm-Add").getEl().unmask();
                let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                if (jsonData.success == true) {
                  Ext.store.load({ params: { mode: "" } });
                  Ext.MessageBox.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + jsonData.msg + "</span>");
                  Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
                  Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {};
                  Ext.getCmp("MessageBox_re").hide();
                  Ext.getCmp("MessageBox_re").destroy();
                } else {
                  Ext.MessageBox.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + jsonData.msg + "</span>");
                  Ext.getCmp("MessageBox_re").hide();
                  Ext.getCmp("MessageBox_re").destroy();
                }
              },
              failure: function (result, request) {
                Ext.MessageBox.alert("Failed", result.responseText);
                Ext.getCmp("MessageBox_re").hide();
                Ext.getCmp("MessageBox_re").destroy();
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
}; // delectHdr

function showCustomEditForm(rec) {
  try {
    rec.set("i_yyyy", rec.get("i_pr_year"));
    Ext.gridEditMoney = Ext.gridEditMoneyfn(rec);
    Ext.gridEditMoneyOverlap = Ext.gridEditMoneyOverlapfn(rec);
    var val = Number(rec.get("i_send_gl_dr"));
    Ext.glAcctionNo = false;
    if ([3, 4, 5, 6, 99].includes(val)) {
      //            alert('ไม่สามารถดำเนินการได้ สำหรับรหัส: ' + val+' ได้ดำเนินการบันทึก GL แล้ว');
      Ext.glAcctionNo = true;
    }
    var val2 = rec.get("c_overlap");
    Ext.OverlapNo = false;
    if (val2 != "") {
      // มีเลขกันเหลื่อม
      Ext.OverlapNo = true;
    }

    var win = new Ext.Window({
      title: "111 แก้ไขข้อมูล (Custom) " + rec.get("gl_dr"),
      id: "win-edit-custom-form",
      layout: "fit",
      modal: true,
      maximizable: true,
      width: 710,
      height: 560,
      items: [
        {
          xtype: "tabpanel",
          id: "tabpanel-edit-custom",
          activeTab: 0,
          frame: true,
          items: [
            // TAB 1: ข้อมูลตรวจรับพัสดุ/ครุภัณฑ์ (Product Inspection/Equipment Info)
            {
              title: "ข้อมูลตรวจรับพัสดุ/ครุภัณฑ์",
              id: "tab-product-inspect-custom",
              xtype: "form",
              frame: true,
              labelAlign: "right",
              bodyStyle: { padding: "15px" },
              autoScroll: true,
              defaults: { anchor: "100%", msgTarget: "side", allowBlank: false },
              items: [
                { xtype: "hidden", name: "id", value: rec ? rec.data.id : "" },
                { xtype: "textfield", fieldLabel: "เลขสัญญา", name: "c_code", value: rec && rec.data ? rec.data.c_code || "" : "", readOnly: true, style: { background: "#EEEEEE", "font-weight": "bold", color: "black" } },
                { xtype: "textfield", fieldLabel: "เลขใบเบิก", name: "c_code_po", value: rec && rec.data ? rec.data.c_code_po || "" : "", readOnly: true, style: { background: "#EEEEEE", "font-weight": "bold", color: "#008000" } },

                {
                  xtype: "compositefield",
                  fieldLabel: "ประเภทวัสดุหรือครุภัณฑ์",
                  anchor: "100%",
                  items: [
                    {
                      xtype: "combo",
                      hiddenName: "i_product_type", // เปลี่ยนจาก name เป็น hiddenName
                      id: "combo_i_product_type", // เพิ่ม id
                      flex: 1, // ให้ Combo ขยายพื้นที่เต็มที่เหลือ
                      mode: "local",
                      store: new Ext.data.SimpleStore({
                        fields: ["value", "text"],
                        data: [
                          ["", "ไม่ระบุของ"],
                          ["1", "1 - วัสดุ"],
                          ["2", "2 - ครุภัณฑ์"],
                          ["0", "0 - ไม่ระบุของ"],
                        ],
                      }),
                      value: rec && rec.data ? rec.data.i_product_type || "" : "",
                      valueField: "value",
                      displayField: "text",
                      allowBlank: false,
                      editable: false,
                      triggerAction: "all",
                      typeAhead: false,
                      style: { background: "#EEEEEE", "font-weight": "bold", color: "red" },
                    },
                    {
                      xtype: "button",
                      text: "บันทึก", // เปลี่ยนจาก 'ตรวจสอบ' เป็น 'บันทึก'
                      width: 80,
                      iconCls: "icon-building-edit", // (ถ้ามี) ใส่เพื่อให้มีไอคอนสวยงามขึ้น
                      handler: function () {
                        // ดึงค่าประเภทวัสดุจาก Combo ข้างๆ
                        var comboField = this.previousSibling();
                        var selectedType = comboField.getValue();
                        var selectedTypeDisplay = comboField.getRawValue();

                        if (!Ext.selectRow.data) {
                          Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกข้อมูลในตาราง");
                          return;
                        }
                        if (!selectedType) {
                          Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกประเภทวัสดุหรือครุภัณฑ์ก่อนบันทึก");
                          return;
                        }
                        if (Ext.glAcctionNo) {
                          Ext.Msg.alert("แจ้งเตือน", "รายการได้ทำการลงบัญชีไปแล้ว ถ้าต้องการแก้ไขส่งคำร้องเพื่อยกเลิก gl");
                          return;
                        }
                        // ยืนยันก่อนอัพเดท
                        Ext.Msg.confirm("ยืนยัน", 'คุณต้องการเปลี่ยนประเภทเป็น "' + selectedTypeDisplay + '" ใช่หรือไม่?', function (btn) {
                          if (btn == "yes") {
                            // updateModifyDate(); // อัปเดตวันที่แก้ไข
                            // ส่ง AJAX Request ไปยัง Backend เพื่ออัพเดท i_pr_type1
                            Ext.Ajax.request({
                              url: "tor/api/mnCheckingController.php", // API endpoint
                              method: "POST",
                              params: {
                                mode: "updateMaterialType",
                                action: "updateMaterialType",
                                i_product_type: Ext.getCmp("combo_i_product_type").getValue(), // ค่าที่เลือกใน Combo
                                sp_tor_id: Ext.selectRow.get("sp_tor_id"), // ดึง sp_tor_id จาก selected row
                                sp_tor_contract_id: Ext.selectRow.get("sp_tor_contract_id"),
                                sp_check_period_hdr_id: Ext.selectRow.get("sp_check_period_hdr_id"),
                                sp_tor_hdr_period_id: Ext.selectRow.get("sp_tor_hdr_period_id"),
                                i_product_types: JSON.stringify([Ext.getCmp("combo_i_product_type").getValue()]), // ส่งเป็น array
                              },
                              success: function (response) {
                                try {
                                  var result = Ext.decode(response.responseText);
                                  if (result.success === "Success" || result.reval === 0) {
                                    Ext.Msg.alert("สำเร็จ", result.msg || "อัพเดทประเภทวัสดุเรียบร้อยแล้ว", function () {
                                      // ตั้งค่าใหม่ให้ Combo แสดงค่าที่เลือก
                                      if (comboField) {
                                        comboField.setValue(selectedType);
                                        comboField.el.dom.style.background = "#CCFFCC"; // เปลี่ยนสีเป็นเขียวเบา เพื่อบ่งชี้การบันทึกสำเร็จ

                                        // หลังจาก 1 วินาที ให้เปลี่ยนกลับเป็นสีปกติ
                                        setTimeout(function () {
                                          comboField.el.dom.style.background = "#EEEEEE";
                                        }, 1000);
                                      }

                                      // updateModifyDate("ประเภทวัสดุหรือครุภัณฑ์"); // อัปเดตวันที่แก้ไข

                                      // โหลดข้อมูลใหม่
                                      if (Ext.storeDtl) {
                                        Ext.storeDtl.reload();
                                      }
                                    });
                                  } else {
                                    Ext.Msg.alert("ข้อผิดพลาด", result.msg || "เกิดข้อผิดพลาดในการอัพเดท");
                                  }
                                } catch (e) {
                                  console.error("Parse error:", e);
                                  console.error("Response:", response.responseText);
                                  Ext.Msg.alert("สำเร็จ", "บันทึกข้อมูลเรียบร้อยแล้ว (ตอบกลับมี: " + response.responseText + ")");
                                }
                              },
                              failure: function (response) {
                                Ext.Msg.alert("ข้อผิดพลาด", "ไม่สามารถติดต่อ Server");
                                console.error("Update failed:", response);
                              },
                            });
                          }
                        });
                      },
                    },
                  ],
                },
                {
                  xtype: "compositefield",
                  fieldLabel: "ประเภทการจองเงิน",
                  anchor: "100%",
                  items: [
                    {
                      xtype: "combo",
                      // ใช้ name ให้ชัดเจน (ไม่ใช้ hiddenName)
                      name: "i_pr_type1",
                      id: "combo_i_pr_type", // เพิ่ม id ให้หา element ได้ง่าย
                      flex: 1,
                      mode: "local",
                      valueField: "value",
                      displayField: "text",
                      store: new Ext.data.SimpleStore({
                        fields: ["value", "text"],
                        data: [
                          ["1", "1 - เงินแผน"],
                          ["2", "2 - เงินงวด"],
                        ],
                      }),
                      // ค่าเริ่มต้น: จากเรคคอร์ด หากไม่มี ให้ลองอ่านจาก localStorage
                      value: (function () {
                        var pid = rec && rec.data ? rec.data.sp_tor_hdr_period_id : null;
                        var stored = pid ? localStorage.getItem("bookingType_" + pid) : null;
                        return rec && rec.data ? rec.data.i_pr_type1 || stored || "" : stored || "";
                      })(),
                      allowBlank: false,
                      editable: false, // ป้องกันการพิมพ์ที่จะไป filter ข้อมูลออก
                      triggerAction: "all", // สำคัญ: กดแล้วต้องโชว์รายการทั้งหมดเสมอ
                      forceSelection: true, // บังคับให้เลือกตาม list เพื่อให้ text แสดงค้างไว้
                      style: { background: "#EEEEEE", "font-weight": "bold", color: "red" },
                      listeners: {
                        select: function (cb, recSel) {
                          var pid = rec && rec.data ? rec.data.sp_tor_hdr_period_id : null;
                          var val = cb.getValue();
                          if (pid) {
                            localStorage.setItem("bookingType_" + pid, val);
                          }
                          if (val) {
                            Ext.Ajax.request({
                              url: "tor/api/mnCheckingController.php",
                              method: "POST",
                              params: {
                                mode: "updateBookingType1",
                                i_pr_type: val,
                                sp_tor_id: rec.get("sp_tor_id"),
                                sp_tor_contract_id: rec.get("sp_tor_contract_id"),
                                sp_check_period_hdr_id: rec.get("sp_check_period_hdr_id"),
                                sp_tor_hdr_period_id: rec.get("sp_tor_hdr_period_id"),
                                sp_tor_hdr_period_ids: JSON.stringify([rec.get("sp_tor_hdr_period_id")]),
                                i_pr_types: JSON.stringify([val]),
                              },
                              success: function (response) {
                                var result = Ext.decode(response.responseText);
                                if (result.success === "Success" || result.reval === 0) {
                                  if (rec && rec.set) {
                                    rec.set("i_pr_type1", val);
                                    rec.set("tc_i_pr_type2", val);
                                  }
                                  if (pid) {
                                    localStorage.removeItem("bookingType_" + pid);
                                  }
                                }
                              },
                            });
                          }
                        },
                      },
                    },

                    {
                      xtype: "button",
                      text: "บันทึก", // เปลี่ยนจาก 'ตรวจสอบ' เป็น 'บันทึก'
                      width: 80,
                      iconCls: "icon-building-edit", // (ถ้ามี) ใส่เพื่อให้มีไอคอนสวยงามขึ้น
                      handler: function () {
                        var comboField = this.previousSibling();
                        var selectedType = comboField.getValue();
                        var selectedTypeDisplay = comboField.getRawValue();

                        if (!selectedType) {
                          Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกประเภทการจองเงินก่อนบันทึก");
                          return;
                        }
                        if (Ext.glAcctionNo) {
                          Ext.Msg.alert("แจ้งเตือน", "รายการได้ทำการลงบัญชีไปแล้ว ถ้าต้องการแก้ไขส่งคำร้องเพื่อยกเลิก gl");
                          return;
                        }
                        Ext.Msg.confirm("ยืนยัน", 'คุณต้องการเปลี่ยนประเภทเป็น "' + selectedTypeDisplay + '" ใช่หรือไม่?', function (btn) {
                          if (btn == "yes") {
                            // updateModifyDate();
                            Ext.Ajax.request({
                              url: "tor/api/mnCheckingController.php",
                              method: "POST",
                              params: {
                                mode: "updateBookingType1",
                                i_pr_type: selectedType,
                                sp_tor_id: Ext.selectRow.get("sp_tor_id"),
                                sp_tor_contract_id: Ext.selectRow.get("sp_tor_contract_id"),
                                sp_check_period_hdr_id: Ext.selectRow.get("sp_check_period_hdr_id"),
                                sp_tor_hdr_period_id: Ext.selectRow.get("sp_tor_hdr_period_id"),
                                sp_tor_hdr_period_ids: JSON.stringify([Ext.selectRow.get("sp_tor_hdr_period_id")]),
                                i_pr_types: JSON.stringify([selectedType]),
                              },
                              success: function (response) {
                                try {
                                  var result = Ext.decode(response.responseText);
                                  if (result.success === "Success" || result.reval === 0) {
                                    Ext.Msg.alert("สำเร็จ", result.msg || "อัพเดทประเภทการจองเงินเรียบร้อยแล้ว", function () {
                                      // update the local record so reopening the form keeps the value
                                      if (rec && rec.set) {
                                        rec.set("i_pr_type1", selectedType);
                                      }
                                      // clear storage as soon as save succeeds
                                      var pid = rec && rec.data ? rec.data.sp_tor_hdr_period_id : null;
                                      if (pid) localStorage.removeItem("bookingType_" + pid);
                                      if (comboField) {
                                        comboField.setValue(selectedType);
                                        comboField.el.dom.style.background = "#CCFFCC";
                                        setTimeout(function () {
                                          comboField.el.dom.style.background = "#EEEEEE";
                                        }, 1000);
                                      }
                                      // updateModifyDate("ประเภทการจองเงิน");
                                      if (Ext.storeDtl) {
                                        Ext.storeDtl.reload();
                                      }
                                    });
                                  } else {
                                    Ext.Msg.alert("ข้อผิดพลาด", result.msg || "เกิดข้อผิดพลาดในการอัพเดท");
                                  }
                                } catch (e) {
                                  console.error("Parse error:", e);
                                  console.error("Response:", response.responseText);
                                  Ext.Msg.alert("สำเร็จ", "บันทึกข้อมูลเรียบร้อยแล้ว (ตอบกลับมี: " + response.responseText + ")");
                                }
                              },
                              failure: function (response) {
                                Ext.Msg.alert("ข้อผิดพลาด", "ไม่สามารถติดต่อ Server");
                                console.error("Update failed:", response);
                              },
                            });
                          }
                        });
                      },
                    },
                  ],
                },
                {
                  xtype: "compositefield",
                  fieldLabel: "วันที่เอกสารสมบูรณ์",
                  anchor: "100%",
                  items: [
                    {
                      xtype: "datefield",
                      name: "d_doc_arrive_dt",
                      flex: 1,
                      value: rec && rec.data ? rec.data.d_doc_arrive_dt || "" : "",
                      readOnly: false,
                      format: "d-m-Y",
                      submitFormat: "d-m-Y",
                      // กำหนดสีพื้นหลังและตัวหนาตามที่คุณต้องการ
                      style: { background: "#EEEEEE", "font-weight": "bold", color: "black" },
                    },
                    {
                      xtype: "button",
                      text: "บันทึก", // เปลี่ยนจาก 'ตรวจสอบ' เป็น 'บันทึก'
                      width: 80,
                      iconCls: "icon-building-edit", // (ถ้ามี) ใส่เพื่อให้มีไอคอนสวยงามขึ้น
                      handler: function () {
                        // ตัวอย่าง Logic การดึงค่าจากช่อง Textfield ข้างๆ มาใช้งาน
                        var codeValue = this.previousSibling().getValue();

                        if (!codeValue) {
                          Ext.Msg.alert("แจ้งเตือน", "กรุณากรอกเลขที่ตรวจรับก่อนบันทึก");
                          return;
                        }
                        if (Ext.glAcctionNo) {
                          Ext.Msg.alert("แจ้งเตือน", "รายการได้ทำการลงบัญชีไปแล้ว ถ้าต้องการแก้ไขส่งคำร้องเพื่อยกเลิก gl");
                          return;
                        }
                        //               console.log(Ext.util.Format.gridDate(codeValue, "Y-m-d"));
                        //               return false;
                        // ส่วนนี้คือที่ที่คุณจะใส่ AJAX หรือคำสั่ง Save ข้อมูล
                        Ext.Msg.confirm("ยืนยัน", "คุณต้องการบันทึกข้อมูลนี้ใช่หรือไม่?", function (btn) {
                          if (btn == "yes") {
                            // updateModifyDate();
                            Ext.Ajax.request({
                              url: "tor/api/mnCheckingController.php",
                              method: "POST",
                              params: {
                                mode: "updateBillingDate",
                                d_doc_arrive_dt: Ext.util.Format.gridDate(codeValue, "Y-m-d"),
                                sp_tor_id: Ext.selectRow.get("sp_tor_id"),
                                sp_tor_contract_id: Ext.selectRow.get("sp_tor_contract_id"),
                                sp_check_period_hdr_id: Ext.selectRow.get("sp_check_period_hdr_id"),
                                sp_tor_hdr_period_id: Ext.selectRow.get("sp_tor_hdr_period_id"),
                                sp_tor_hdr_period_ids: JSON.stringify([Ext.selectRow.get("sp_tor_hdr_period_id")]),
                                d_doc_arrive_dts: JSON.stringify([Ext.util.Format.gridDate(codeValue, "Y-m-d")]),
                              },
                              success: function (response) {
                                try {
                                  var result = Ext.decode(response.responseText);
                                  if (result.success === "Success" || result.reval === 0) {
                                    Ext.Msg.alert("สำเร็จ", result.msg || "อัพเดทประเภทการจองเงินเรียบร้อยแล้ว", function () {
                                      // update the local record so reopening the form keeps the value
                                      if (rec && rec.set) {
                                        rec.set("i_pr_type1", codeValue);
                                      }

                                      // updateModifyDate("วันที่วางบิล");
                                      if (Ext.storeDtl) {
                                        Ext.storeDtl.reload();
                                      }
                                    });
                                  } else {
                                    Ext.Msg.alert("ข้อผิดพลาด", result.msg || "เกิดข้อผิดพลาดในการอัพเดท");
                                  }
                                } catch (e) {
                                  console.error("Parse error:", e);
                                  console.error("Response:", response.responseText);
                                  Ext.Msg.alert("สำเร็จ", "บันทึกข้อมูลเรียบร้อยแล้ว (ตอบกลับมี: " + response.responseText + ")");
                                }
                              },
                              failure: function (response) {
                                Ext.Msg.alert("ข้อผิดพลาด", "ไม่สามารถติดต่อ Server");
                                console.error("Update failed:", response);
                              },
                            });
                          }
                        });
                      },
                    },
                  ],
                },
                {
                  xtype: "compositefield",
                  fieldLabel: "วันที่ตรวจรับ",
                  anchor: "100%",
                  items: [
                    {
                      xtype: "datefield",
                      name: "d_checking_date",
                      flex: 1,
                      value: rec && rec.data ? rec.data.d_checking_date || "" : "",
                      readOnly: false,
                      format: "d-m-Y",
                      submitFormat: "d-m-Y",
                      style: { background: "#EEEEEE", "font-weight": "bold", color: "black" },
                    },
                    {
                      xtype: "button",
                      text: "บันทึก", // เปลี่ยนจาก 'ตรวจสอบ' เป็น 'บันทึก'
                      width: 80,
                      iconCls: "icon-building-edit", // (ถ้ามี) ใส่เพื่อให้มีไอคอนสวยงามขึ้น
                      handler: function () {
                        // ตัวอย่าง Logic การดึงค่าจากช่อง Textfield ข้างๆ มาใช้งาน
                        var codeValue = this.previousSibling().getValue();

                        if (!codeValue) {
                          Ext.Msg.alert("แจ้งเตือน", "กรุณากรอกเลขที่ตรวจรับก่อนบันทึก");
                          return;
                        }
                        if (Ext.glAcctionNo) {
                          Ext.Msg.alert("แจ้งเตือน", "รายการได้ทำการลงบัญชีไปแล้ว ถ้าต้องการแก้ไขส่งคำร้องเพื่อยกเลิก gl");
                          return;
                        }
                        //               console.log(Ext.util.Format.gridDate(codeValue, "Y-m-d"));
                        //               return false;
                        // ส่วนนี้คือที่ที่คุณจะใส่ AJAX หรือคำสั่ง Save ข้อมูล
                        Ext.Msg.confirm("ยืนยัน", "คุณต้องการบันทึกข้อมูลนี้ใช่หรือไม่?", function (btn) {
                          if (btn == "yes") {
                            // updateModifyDate();
                            Ext.Ajax.request({
                              url: "tor/api/mnCheckingController.php",
                              method: "POST",
                              params: {
                                mode: "updateBillingDate",
                                d_checking_date: Ext.util.Format.gridDate(codeValue, "Y-m-d"),
                                sp_tor_id: Ext.selectRow.get("sp_tor_id"),
                                sp_tor_contract_id: Ext.selectRow.get("sp_tor_contract_id"),
                                sp_check_period_hdr_id: Ext.selectRow.get("sp_check_period_hdr_id"),
                                sp_tor_hdr_period_id: Ext.selectRow.get("sp_tor_hdr_period_id"),
                                sp_tor_hdr_period_ids: JSON.stringify([Ext.selectRow.get("sp_tor_hdr_period_id")]),
                                d_checking_dates: JSON.stringify([Ext.util.Format.gridDate(codeValue, "Y-m-d")]),
                              },
                              success: function (response) {
                                try {
                                  var result = Ext.decode(response.responseText);
                                  if (result.success === "Success" || result.reval === 0) {
                                    Ext.Msg.alert("สำเร็จ", result.msg || "อัพเดทประเภทการจองเงินเรียบร้อยแล้ว", function () {
                                      // update the local record so reopening the form keeps the value
                                      if (rec && rec.set) {
                                        rec.set("i_pr_type1", codeValue);
                                      }

                                      // updateModifyDate("วันที่วางบิล");
                                      if (Ext.storeDtl) {
                                        Ext.storeDtl.reload();
                                      }
                                    });
                                  } else {
                                    Ext.Msg.alert("ข้อผิดพลาด", result.msg || "เกิดข้อผิดพลาดในการอัพเดท");
                                  }
                                } catch (e) {
                                  console.error("Parse error:", e);
                                  console.error("Response:", response.responseText);
                                  Ext.Msg.alert("สำเร็จ", "บันทึกข้อมูลเรียบร้อยแล้ว (ตอบกลับมี: " + response.responseText + ")");
                                }
                              },
                              failure: function (response) {
                                Ext.Msg.alert("ข้อผิดพลาด", "ไม่สามารถติดต่อ Server");
                                console.error("Update failed:", response);
                              },
                            });
                          }
                        });
                      },
                    },
                  ],
                },

                {
                  xtype: "compositefield",
                  fieldLabel: "เลขที่ EGP",
                  anchor: "100%",
                  items: [
                    {
                      xtype: "textfield",
                      name: "c_egp_no",
                      flex: 1,
                      value: rec && rec.data ? rec.data.c_egp_no || "" : "",
                      readOnly: false,
                      // รักษาสไตล์ตัวหนาสีแดงตามต้นฉบับของคุณ
                      style: { background: "#EEEEEE", "font-weight": "bold", color: "red" },
                    },
                    {
                      xtype: "button",

                      text: "บันทึก", // เปลี่ยนจาก 'ตรวจสอบ' เป็น 'บันทึก'
                      width: 80,
                      iconCls: "icon-building-edit", // (ถ้ามี) ใส่เพื่อให้มีไอคอนสวยงามขึ้น
                      handler: function () {
                        // ตัวอย่าง Logic การดึงค่าจากช่อง Textfield ข้างๆ มาใช้งาน
                        var codeValue = this.previousSibling().getValue();

                        if (!codeValue) {
                          Ext.Msg.alert("แจ้งเตือน", "กรุณากรอกเลขที่ตรวจรับก่อนบันทึก");
                          return;
                        }

                        // ส่วนนี้คือที่ที่คุณจะใส่ AJAX หรือคำสั่ง Save ข้อมูล
                        Ext.Msg.confirm("ยืนยัน", "คุณต้องการบันทึกข้อมูลนี้ใช่หรือไม่?", function (btn) {
                          if (btn == "yes") {
                            // ใส่คำสั่งบันทึกข้อมูล (เช่น Ext.Ajax.request) ตรงนี้
                            console.log("บันทึกข้อมูล: " + codeValue);
                          }
                        });
                      },
                    },
                  ],
                },
                {
                  xtype: "compositefield",
                  fieldLabel: "รายการส่งเบิก",
                  anchor: "100%",
                  items: [
                    {
                      xtype: "textarea",
                      name: "c_name",
                      flex: 1,
                      height: 80,
                      value: rec && rec.data ? rec.data.c_name || "" : "",
                      // หากต้องการให้แก้ไขได้เพื่อบันทึกใหม่ ควรเปลี่ยน readOnly เป็น false
                      readOnly: true,
                      style: { background: "#EEEEEE", "font-weight": "bold", color: "black" },
                    },
                    {
                      xtype: "button",
                      text: "บันทึก", // เปลี่ยนจาก 'ตรวจสอบ' เป็น 'บันทึก'
                      width: 80,
                      iconCls: "icon-save", // (ถ้ามี) ใส่เพื่อให้มีไอคอนสวยงามขึ้น
                      handler: function () {
                        // ตัวอย่าง Logic การดึงค่าจากช่อง Textfield ข้างๆ มาใช้งาน
                        var codeValue = this.previousSibling().getValue();

                        if (!codeValue) {
                          Ext.Msg.alert("แจ้งเตือน", "กรุณากรอกเลขที่ตรวจรับก่อนบันทึก");
                          return;
                        }

                        // ส่วนนี้คือที่ที่คุณจะใส่ AJAX หรือคำสั่ง Save ข้อมูล
                        Ext.Msg.confirm("ยืนยัน", "คุณต้องการบันทึกข้อมูลนี้ใช่หรือไม่?", function (btn) {
                          if (btn == "yes") {
                            // ใส่คำสั่งบันทึกข้อมูล (เช่น Ext.Ajax.request) ตรงนี้
                            console.log("บันทึกข้อมูล: " + codeValue);
                          }
                        });
                      },
                    },
                  ],
                },
                {
                  xtype: "textfield",
                  fieldLabel: "วันที่แก้ไข",
                  name: "d_update",
                  allowBlank: true,
                  readOnly: true,
                  style: {
                    background: "#EEEEEE",
                    "font-weight": "bold",
                    color: "red",
                  },
                  listeners: {
                    afterrender: function (field) {
                      if (!rec) return;

                      // ถ้ามีค่าจาก DB อยู่แล้ว
                      if (rec.get("d_update")) {
                        field.setValue(rec.get("d_update"));
                      } else {
                        // สร้างวันที่ปัจจุบัน
                        var d = new Date();
                        var day = String(d.getDate()).padStart(2, "0");
                        var month = String(d.getMonth() + 1).padStart(2, "0");
                        var year = d.getFullYear() + 543;

                        var dateStr = day + "-" + month + "-" + year;

                        field.setValue(dateStr);

                        // ✅ เขียนค่ากลับเข้า record ด้วย
                        rec.set("d_update", dateStr);
                      }
                    },
                  },
                },
                {
                  xtype: "displayfield",
                  value: "password ** " + Ext.pOntimePass,
                  listeners: {
                    afterrender: function () {
                      console.log(Ext.session);
                    },
                  },
                },
              ],
            },
            // TAB 2: เลขที่ตรวจรับ (General Information)
            {
              title: "่แหล่งเงิน/ประเภทงบและค่าใช้จ่าย/รายการย่อย",
              id: "tab-info-custom",
              xtype: "form",
              frame: true,
              labelAlign: "right",
              labelWidth: 180,
              bodyStyle: { padding: "15px" },
              autoScroll: true,
              defaults: { anchor: "100%", msgTarget: "side", allowBlank: false },
              items: [
                { xtype: "hidden", name: "id", value: rec ? rec.data.id : "" },
                {
                  xtype: "compositefield",
                  fieldLabel: "ใช้เงินปีงบประมาณ",
                  hidden: true,
                  anchor: "100%",
                  items: [
                    {
                      xtype: "combo",
                      flex: 1, // ให้ Combo ขยายพื้นที่เต็มที่เหลือ
                      mode: "local",
                      value: rec && rec.data ? rec.data.i_yyyy_overlapTxt || "" : "",
                      fieldLabel: "ใช้เงินปีงบประมาณ",
                      allowBlank: false,
                      submitValue: true,
                      hidden: true,
                      id: "i_yyyy_overlapIDs",
                      hiddenName: "i_yyyy_overlap",
                      name: "i_yyyy_overlapTxt",
                      store: Ext.store_year,
                      valueField: "id",
                      displayField: "c_name",
                      //                        value: Ext.bgYear,
                      triggerAction: "all",
                      forceSelection: true,
                      selectOnFocus: true,
                      typeAhead: false,
                      style: { background: "#EEEEEE", "font-weight": "bold", color: "black" },
                    },
                    {
                      xtype: "button",
                      text: "บันทึก", // เปลี่ยนจาก 'ตรวจสอบ' เป็น 'บันทึก'
                      width: 80,
                      hidden: true,
                      iconCls: "icon-building-edit", // (ถ้ามี) ใส่เพื่อให้มีไอคอนสวยงามขึ้น
                      handler: function () {
                        // ดึงค่าประเภทวัสดุจาก Combo ข้างๆ
                        var comboField = this.previousSibling();
                        var selectedType = comboField.getValue();
                        var selectedTypeDisplay = comboField.getRawValue();
                        if (!Ext.selectRow.data) {
                          Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกข้อมูลในตาราง");
                          return;
                        }
                        if (!selectedType) {
                          Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกประเภทวัสดุหรือครุภัณฑ์ก่อนบันทึก");
                          return;
                        }
                        if (Ext.glAcctionNo) {
                          Ext.Msg.alert("แจ้งเตือน", "รายการได้ทำการลงบัญชีไปแล้ว ถ้าต้องการแก้ไขส่งคำร้องเพื่อยกเลิก gl");
                          return;
                        }
                        // ยืนยันก่อนอัพเดท
                        Ext.Msg.confirm("ยืนยัน", 'คุณต้องการเปลี่ยนประเภทเป็น "' + selectedTypeDisplay + '" ใช่หรือไม่?', function (btn) {
                          if (btn == "yes") {
                            // updateModifyDate(); // อัปเดตวันที่แก้ไข
                            // ส่ง AJAX Request ไปยัง Backend เพื่ออัพเดท i_pr_type1
                            Ext.Ajax.request({
                              url: "tor/api/mnCheckingController.php", // API endpoint
                              method: "POST",
                              params: {
                                mode: "updateIyyyyOverlap",
                                action: "updateIyyyyOverlap",
                                i_yyyy_overlap: Ext.getCmp("i_yyyy_overlapIDs").getValue(), // ค่าที่เลือกใน Combo
                                sp_tor_id: Ext.selectRow.get("sp_tor_id"), // ดึง sp_tor_id จาก selected row
                                sp_tor_contract_id: Ext.selectRow.get("sp_tor_contract_id"),
                                sp_check_period_hdr_id: Ext.selectRow.get("sp_check_period_hdr_id"),
                                sp_tor_hdr_period_id: Ext.selectRow.get("sp_tor_hdr_period_id"),
                                i_yyyy_overlaps: JSON.stringify([Ext.getCmp("i_yyyy_overlapIDs").getValue()]), // ส่งเป็น array
                              },
                              success: function (response) {
                                try {
                                  var result = Ext.decode(response.responseText);
                                  if (result.success === "Success" || result.reval === 0) {
                                    Ext.Msg.alert("สำเร็จ", result.msg || "อัพเดทประเภทวัสดุเรียบร้อยแล้ว", function () {
                                      // ตั้งค่าใหม่ให้ Combo แสดงค่าที่เลือก
                                      if (comboField) {
                                        comboField.setValue(selectedType);
                                        comboField.el.dom.style.background = "#CCFFCC"; // เปลี่ยนสีเป็นเขียวเบา เพื่อบ่งชี้การบันทึกสำเร็จ

                                        // หลังจาก 1 วินาที ให้เปลี่ยนกลับเป็นสีปกติ
                                        setTimeout(function () {
                                          comboField.el.dom.style.background = "#EEEEEE";
                                        }, 1000);
                                      }

                                      // updateModifyDate("แหล่งเงิน/ประเภทงบประมาณ"); // อัปเดตวันที่แก้ไข

                                      // โหลดข้อมูลใหม่
                                      if (Ext.storeDtl) {
                                        Ext.storeDtl.reload();
                                      }
                                    });
                                  } else {
                                    Ext.Msg.alert("ข้อผิดพลาด", result.msg || "เกิดข้อผิดพลาดในการอัพเดท");
                                  }
                                } catch (e) {
                                  console.error("Parse error:", e);
                                  console.error("Response:", response.responseText);
                                  Ext.Msg.alert("สำเร็จ", "บันทึกข้อมูลเรียบร้อยแล้ว (ตอบกลับมี: " + response.responseText + ")");
                                }
                              },
                              failure: function (response) {
                                Ext.Msg.alert("ข้อผิดพลาด", "ไม่สามารถติดต่อ Server");
                                console.error("Update failed:", response);
                              },
                            });
                          }
                        });
                      },
                    },
                  ],
                },
                // {
                //   xtype: "compositefield",
                //   fieldLabel: "เลขกันใบกัน",
                //   anchor: "100%",
                //   hidden: rec && rec.data && rec.data.c_overlap ? false : true,
                //   items: [
                //     {
                //       xtype: "combo",
                //       flex: 1, // ให้ Combo ขยายพื้นที่เต็มที่เหลือ
                //       mode: "local",
                //       value: rec && rec.data ? rec.data.c_overlap || "" : "",
                //       fieldLabel: "ใช้เงินปีงบประมาณ",
                //       store: Ext.booking_store,
                //       allowBlank: false,
                //       valueField: "id",
                //       displayField: "c_booking",
                //       width: 181,
                //       submitValue: true,
                //       name: "c_booking",
                //       hiddenName: "c_booking",
                //       id: "c_bookingID",
                //       triggerAction: "all",
                //       forceSelection: true,
                //       selectOnFocus: true,
                //       typeAhead: false,
                //       style: { background: "#EEEEEE", "font-weight": "bold", color: "blue" },
                //     },
                //     {
                //       xtype: "button",
                //       text: "บันทึก", // เปลี่ยนจาก 'ตรวจสอบ' เป็น 'บันทึก'
                //       width: 80,
                //       hidden: true,
                //       iconCls: "icon-building-edit", // (ถ้ามี) ใส่เพื่อให้มีไอคอนสวยงามขึ้น
                //       handler: function () {
                //         // ดึงค่าประเภทวัสดุจาก Combo ข้างๆ
                //         var comboField = this.previousSibling();
                //         var selectedType = comboField.getValue();
                //         var selectedTypeDisplay = comboField.getRawValue();
                //         if (!Ext.selectRow.data) {
                //           Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกข้อมูลในตาราง");
                //           return;
                //         }
                //         if (!selectedType) {
                //           Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกประเภทวัสดุหรือครุภัณฑ์ก่อนบันทึก");
                //           return;
                //         }
                //         if (Ext.glAcctionNo) {
                //           Ext.Msg.alert("แจ้งเตือน", "รายการได้ทำการลงบัญชีไปแล้ว ถ้าต้องการแก้ไขส่งคำร้องเพื่อยกเลิก gl");
                //           return;
                //         }
                //         // ยืนยันก่อนอัพเดท
                //         Ext.Msg.confirm("ยืนยัน", 'คุณต้องการเปลี่ยนประเภทเป็น "' + selectedTypeDisplay + '" ใช่หรือไม่?', function (btn) {
                //           if (btn == "yes") {
                //             updateModifyDate(); // อัปเดตวันที่แก้ไข
                //             // ส่ง AJAX Request ไปยัง Backend เพื่ออัพเดท i_pr_type1
                //             Ext.Ajax.request({
                //               url: "tor/api/mnCheckingController.php", // API endpoint
                //               method: "POST",
                //               params: {
                //                 mode: "updateExpenseType",
                //                 action: "updateExpenseType",
                //                 i_yyyy_overlap: Ext.getCmp("i_yyyy_overlapIDs").getValue(), // ค่าที่เลือกใน Combo
                //                 sp_tor_id: Ext.selectRow.get("sp_tor_id"), // ดึง sp_tor_id จาก selected row
                //                 sp_tor_contract_id: Ext.selectRow.get("sp_tor_contract_id"),
                //                 sp_check_period_hdr_id: Ext.selectRow.get("sp_check_period_hdr_id"),
                //                 sp_tor_hdr_period_id: Ext.selectRow.get("sp_tor_hdr_period_id"),
                //                 i_yyyy_overlaps: JSON.stringify([Ext.getCmp("i_yyyy_overlapIDs").getValue()]), // ส่งเป็น array
                //               },
                //               success: function (response) {
                //                 try {
                //                   var result = Ext.decode(response.responseText);
                //                   if (result.success === "Success" || result.reval === 0) {
                //                     Ext.Msg.alert("สำเร็จ", result.msg || "อัพเดทประเภทวัสดุเรียบร้อยแล้ว", function () {
                //                       // ตั้งค่าใหม่ให้ Combo แสดงค่าที่เลือก
                //                       if (comboField) {
                //                         comboField.setValue(selectedType);
                //                         comboField.el.dom.style.background = "#CCFFCC"; // เปลี่ยนสีเป็นเขียวเบา เพื่อบ่งชี้การบันทึกสำเร็จ

                //                         // หลังจาก 1 วินาที ให้เปลี่ยนกลับเป็นสีปกติ
                //                         setTimeout(function () {
                //                           comboField.el.dom.style.background = "#EEEEEE";
                //                         }, 1000);
                //                       }

                //                       updateModifyDate("แหล่งเงิน/ประเภทงบประมาณ"); // อัปเดตวันที่แก้ไข

                //                       // โหลดข้อมูลใหม่
                //                       if (Ext.storeDtl) {
                //                         Ext.storeDtl.reload();
                //                       }
                //                     });
                //                   } else {
                //                     Ext.Msg.alert("ข้อผิดพลาด", result.msg || "เกิดข้อผิดพลาดในการอัพเดท");
                //                   }
                //                 } catch (e) {
                //                   console.error("Parse error:", e);
                //                   console.error("Response:", response.responseText);
                //                   Ext.Msg.alert("สำเร็จ", "บันทึกข้อมูลเรียบร้อยแล้ว (ตอบกลับมี: " + response.responseText + ")");
                //                 }
                //               },
                //               failure: function (response) {
                //                 Ext.Msg.alert("ข้อผิดพลาด", "ไม่สามารถติดต่อ Server");
                //                 console.error("Update failed:", response);
                //               },
                //             });
                //           }
                //         });
                //       },
                //     },
                //   ],
                // },

                {
                  xtype: "textfield",
                  fieldLabel: "วันที่แก้ไข",
                  name: "d_update",
                  allowBlank: true,
                  readOnly: true,
                  hidden: true,
                  style: { background: "#EEEEEE", "font-weight": "bold", color: "red" },
                  listeners: {
                    afterrender: function (field) {
                      // ถ้ามีค่าที่โหลดมาแล้ว (จาก loadRecord) ให้ใช้นั่น
                      if (field.getValue()) {
                        return; // ใช้ค่าที่โหลดมา
                      }

                      // ถ้าไม่มีค่า ให้ใช้วันที่ปัจจุบัน
                      var d = new Date();
                      var day = String(d.getDate()).padStart(2, "0");
                      var month = String(d.getMonth() + 1).padStart(2, "0");
                      var year = d.getFullYear() + 543;
                      field.setValue(day + "-" + month + "-" + year);
                    },
                  },
                },
                {
                  xtype: "container",
                  layout: "column",
                  items: [
                    {
                      columnWidth: 0.6,
                      xtype: "fieldset",
                      title: "ข้อมูลรายละเอียดการจองเงิน PR 1",
                      labelWidth: 140,
                      labelAlign: "right",
                      style: "margin-right: 5px;",
                      items: [
                        {
                          xtype: "textfield",
                          width: 80,
                          fieldLabel: "bg_reserve_money_pr",
                          value: rec.get("bg_reserve_money_pr1"),
                          style: "text-align: center;font-weight:bold;background:#eee;",
                          readOnly: true,
                        },
                        {
                          xtype: "textfield",
                          fieldLabel: "วันที่สร้าง",
                          value: rec.get("d_create_reserve1"),
                          readOnly: true,
                          width: 100,
                        },
                        {
                          xtype: "combo",
                          id: "dc_budget_type_bg_id_pr",
                          name: "dc_budget_type_bg_id_pr",
                          fieldLabel: "แหล่งเงิน : " + rec.get("dc_expense_budget_type_id") + " ",
                          mode: "local",
                          store: Ext.dc_expense_budget_type,
                          value: rec.get("dc_expense_budget_type_id"),
                          valueField: "id",
                          displayField: "c_name",
                          triggerAction: "all",
                          forceSelection: true,
                          selectOnFocus: true,
                          anchor: "95%",
                          editable: true,
                        },
                        {
                          xtype: "radiogroup",
                          columns: [98, 98, 98],
                          fieldLabel: "ประเภทการจอง",
                          id: "i_pr_type",
                          name: "i_pr_type",
                          items: [
                            {
                              checked: true,
                              name: "i_pr_type",
                              inputValue: 1,
                              boxLabel: "จองแผน",
                            },
                            {
                              inputValue: 2,
                              name: "i_pr_type",
                              boxLabel: "จองงวด",
                            },
                          ], //radiogroup
                          listeners: {
                            change: function () {
                              // Ext.getCmp("i_type_fix_rateGb").fn();
                            },
                            afterrender: function () {
                              // console.log(this.getValue());
                            },
                          },
                        },
                        {
                          xtype: "combo",
                          id: "bg_expense_bg_id_pr",
                          name: "bg_expense_bg_id_pr",
                          fieldLabel: "รายการย่อย : " + rec.get("bg_expense_id_pr") + " ",
                          mode: "local",
                          store: Ext.bg_expense,
                          value: rec.get("bg_expense_id_pr"),
                          valueField: "id",
                          displayField: "c_name",
                          triggerAction: "all",
                          forceSelection: true,
                          selectOnFocus: true,
                          anchor: "95%",
                          editable: true,
                        },
                        {
                          xtype: "textfield",
                          id: "f_total_pr",
                          name: "f_total_pr",
                          fieldLabel: "จำนวนเงินPR",
                          value: floatRenderer(rec.get("f_amt_pr1")),
                          style: "text-align: right; bold;color: blue; font-weight: bold;",
                          width: 200,
                          listeners: {
                            afterrender: function () {
                              this.fn = function () {
                                let value = floatMinus(this.getValue().replace(/,/g, ""), 2);
                                this.setValue(floatRenderer(value));
                              };
                            },
                            Change: function (value) {
                              this.fn();
                            },
                          },
                        },
                        {
                          xtype: "container",
                          layout: "hbox",
                          layoutConfig: { pack: "end" },
                          style: "margin-top: 10px; margin-right: 10px; margin-bottom: 5px;",
                          items: [
                            {
                              xtype: "button",
                              text: "บันทึก PR 1",
                              width: 100,
                              style: "font-weight: bold;",
                              handler: function () {
                                if (!rec.get("id")) {
                                  Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกข้อมูลในตาราง");
                                  return;
                                }
                                Ext.Msg.confirm("ยืนยัน", "คุณต้องการบันทึกข้อมูลการจองเงิน PR 1 ใช่หรือไม่?", function (btn) {
                                  if (btn == "yes") {
                                    Ext.Ajax.request({
                                      url: "tor/api/mnEditPRController.php",
                                      method: "POST",
                                      params: {
                                        mode: "UPDATE_RESERVE_PR1",
                                        tor_id: rec.get("id"),
                                        dc_budget_type_id: Ext.getCmp("dc_budget_type_bg_id_pr").getValue(),
                                        i_pr_type: Ext.getCmp("i_pr_type").getValue().inputValue,
                                        bg_expense_id: Ext.getCmp("bg_expense_bg_id_pr").getValue(),
                                        f_amt: Ext.getCmp("f_total_pr").getValue(),
                                        dc_cost_id: rec.get("dc_cost_id"),
                                        bg_reserve_id: rec.get("bg_reserve_money_pr1"),
                                      },
                                      success: function (response) {
                                        var result = Ext.decode(response.responseText);
                                        if (result.success === "Success" || result.reval === 0) {
                                          Ext.Msg.alert("สำเร็จ", "บันทึกข้อมูล PR 1 เรียบร้อยแล้ว", function () {
                                            if (Ext.storeDtl) Ext.storeDtl.reload();
                                          });
                                        } else {
                                          Ext.Msg.alert("ข้อผิดพลาด", result.msg || "เกิดข้อผิดพลาดในการอัพเดท");
                                        }
                                      },
                                    });
                                  }
                                });
                              },
                            },
                            {
                              xtype: "button",
                              text: "ยกเลิกจองเงิน",
                              width: 100,
                              style: "font-weight: bold;",
                              handler: function () {
                                if (!rec.get("id")) {
                                  Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกข้อมูลในตาราง");
                                  return;
                                }
                                Ext.Msg.confirm("ยืนยัน", "คุณต้องการยกเลิกจองเงิน PR 1 ใช่หรือไม่?", function (btn) {
                                  if (btn == "yes") {
                                    Ext.Ajax.request({
                                      url: "tor/api/mnEditPRController.php",
                                      method: "POST",
                                      params: {
                                        mode: "CANCEL_RESERVE_PR1",
                                        tor_id: rec.get("id"),
                                        dc_budget_type_id: Ext.getCmp("dc_budget_type_bg_id_pr").getValue(),
                                        bg_expense_id: Ext.getCmp("bg_expense_bg_id_pr").getValue(),
                                        bg_reserve_id: rec.get("bg_reserve_money_pr1"),
                                      },
                                      success: function (response) {
                                        var result = Ext.decode(response.responseText);
                                        if (result.success === "Success" || result.reval === 0) {
                                          Ext.Msg.alert("สำเร็จ", "ยกเลิกจองเงิน PR 1 เรียบร้อยแล้ว", function () {
                                            if (Ext.storeDtl) Ext.storeDtl.reload();
                                          });
                                        } else {
                                          Ext.Msg.alert("ข้อผิดพลาด", result.msg || "เกิดข้อผิดพลาดในการอัพเดท");
                                        }
                                      },
                                    });
                                  }
                                });
                              },
                            },
                          ],
                        },
                      ],
                    },
                    {
                      columnWidth: 0.5,
                      xtype: "fieldset",
                      title: "ข้อมูลรายละเอียดการจองเงิน PO 1",
                      hidden: true,
                      labelWidth: 140,
                      labelAlign: "right",
                      style: "margin-left: 5px;",
                      items: [
                        {
                          xtype: "textfield",
                          width: 80,
                          fieldLabel: "bg_reserve_money_po",
                          value: rec.get("bg_reserve_money_po1"),
                          style: "text-align: center;font-weight:bold;background:#eee;",
                          readOnly: true,
                        },
                        {
                          xtype: "textfield",
                          fieldLabel: "วันที่สร้าง",
                          value: rec.get("d_create_reserve2"),
                          readOnly: true,
                          width: 100,
                        },
                        {
                          xtype: "combo",
                          id: "dc_budget_type_bg_id_po",
                          name: "dc_budget_type_bg_id_po",
                          fieldLabel: "แหล่งเงิน : " + rec.get("dc_expense_budget_type_id_po") + " ",
                          mode: "local",
                          store: Ext.dc_expense_budget_type,
                          value: rec.get("dc_expense_budget_type_id_po"),
                          valueField: "id",
                          displayField: "c_name",
                          triggerAction: "all",
                          forceSelection: true,
                          selectOnFocus: true,
                          anchor: "95%",
                          editable: true,
                        },
                        {
                          xtype: "combo",
                          id: "bg_expense_bg_id_po",
                          name: "bg_expense_bg_id_po",
                          fieldLabel: "รายการย่อย : " + rec.get("bg_expense_bg_id2") + " ",
                          mode: "local",
                          store: Ext.bg_expense,
                          value: rec.get("bg_expense_bg_id2"),
                          valueField: "id",
                          displayField: "c_name",
                          triggerAction: "all",
                          forceSelection: true,
                          selectOnFocus: true,
                          anchor: "95%",
                          editable: true,
                        },
                        {
                          xtype: "textfield",
                          fieldLabel: "จำนวนเงินbg2",
                          value: floatRenderer(rec.get("f_amt_reserve2")),
                          style: "text-align: right; bold;color: blue; font-weight: bold; background:#eee;",
                          width: 200,
                          readOnly: true,
                        },
                        {
                          xtype: "container",
                          layout: "hbox",
                          layoutConfig: { pack: "end" },
                          style: "margin-top: 10px;",
                          items: [
                            {
                              xtype: "button",
                              text: "บันทึก PO 1",
                              width: 100,
                              style: "font-weight: bold;",
                              handler: function () {
                                if (!rec.get("id")) {
                                  Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกข้อมูลในตาราง");
                                  return;
                                }
                                Ext.Msg.confirm("ยืนยัน", "คุณต้องการบันทึกข้อมูลการจองเงิน PO 1 ใช่หรือไม่?", function (btn) {
                                  if (btn == "yes") {
                                    Ext.Ajax.request({
                                      url: "tor/api/mnEditPRController.php",
                                      method: "POST",
                                      params: {
                                        mode: "UPDATE_RESERVE_PO1",
                                        tor_id: rec.get("id"),
                                        dc_budget_type_id: Ext.getCmp("dc_budget_type_bg_id_po").getValue(),
                                        bg_expense_id: Ext.getCmp("bg_expense_bg_id_po").getValue(),
                                        bg_reserve_id: rec.get("bg_reserve_money_po1"),
                                      },
                                      success: function (response) {
                                        var result = Ext.decode(response.responseText);
                                        if (result.success === "Success" || result.reval === 0) {
                                          Ext.Msg.alert("สำเร็จ", "บันทึกข้อมูล PO 1 เรียบร้อยแล้ว", function () {
                                            if (Ext.storeDtl) Ext.storeDtl.reload();
                                          });
                                        } else {
                                          Ext.Msg.alert("ข้อผิดพลาด", result.msg || "เกิดข้อผิดพลาดในการอัพเดท");
                                        }
                                      },
                                    });
                                  }
                                });
                              },
                            },
                            {
                              xtype: "button",
                              text: "ยกเลิกจองเงิน PO 1",
                              width: 100,
                              style: "font-weight: bold;",
                              handler: function () {
                                if (!rec.get("id")) {
                                  Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกข้อมูลในตาราง");
                                  return;
                                }
                                Ext.Msg.confirm("ยืนยัน", "คุณต้องการยกเลิกจองเงิน PR 1 ใช่หรือไม่?", function (btn) {
                                  if (btn == "yes") {
                                    Ext.Ajax.request({
                                      url: "tor/api/mnEditPRController.php",
                                      method: "POST",
                                      params: {
                                        mode: "CANCEL_RESERVE_PO1",
                                        tor_contract_id: rec.get("sp_tor_contract_id"),
                                        dc_budget_type_id: Ext.getCmp("dc_budget_type_bg_id_pr").getValue(),
                                        bg_expense_id: Ext.getCmp("bg_expense_bg_id_pr").getValue(),
                                        bg_reserve_id: rec.get("bg_reserve_money_po1"),
                                      },
                                      success: function (response) {
                                        var result = Ext.decode(response.responseText);
                                        if (result.success === "Success" || result.reval === 0) {
                                          Ext.Msg.alert("สำเร็จ", "ยกเลิกจองเงิน PR 1 เรียบร้อยแล้ว", function () {
                                            if (Ext.storeDtl) Ext.storeDtl.reload();
                                          });
                                        } else {
                                          Ext.Msg.alert("ข้อผิดพลาด", result.msg || "เกิดข้อผิดพลาดในการอัพเดท");
                                        }
                                      },
                                    });
                                  }
                                });
                              },
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  xtype: "container",
                  layout: "column",
                  items: [
                    {
                      columnWidth: 0.6,
                      xtype: "fieldset",
                      title: "ข้อมูลรายละเอียดการจองเงิน PR 2",
                      labelWidth: 140,
                      labelAlign: "right",
                      style: "margin-right: 5px;",
                      items: [
                        {
                          xtype: "textfield",
                          width: 80,
                          fieldLabel: "bg_reserve_money_pr",
                          value: rec.get("bg_reserve_money_pr2"),
                          style: "text-align: center;font-weight:bold;background:#eee;",
                          readOnly: true,
                        },
                        {
                          xtype: "textfield",
                          fieldLabel: "วันที่สร้าง",
                          value: rec.get("d_create_reserve1"),
                          readOnly: true,
                          width: 100,
                        },
                        {
                          xtype: "combo",
                          id: "dc_expense_budget_type2_id",
                          name: "dc_expense_budget_type2_id",
                          fieldLabel: "แหล่งเงิน : " + rec.get("dc_expense_budget_type2_id") + " ",
                          mode: "local",
                          store: Ext.dc_expense_budget_type,
                          value: rec.get("dc_expense_budget_type2_id"),
                          valueField: "id",
                          displayField: "c_name",
                          triggerAction: "all",
                          forceSelection: true,
                          selectOnFocus: true,
                          anchor: "95%",
                          editable: true,
                        },
                        {
                          xtype: "radiogroup",
                          columns: [98, 98, 98],
                          fieldLabel: "ประเภทการจอง",
                          id: "i_pr_type2",
                          name: "i_pr_type2",
                          items: [
                            {
                              checked: true,
                              name: "i_pr_type2",
                              inputValue: 1,
                              boxLabel: "จองแผน",
                            },
                            {
                              inputValue: 2,
                              name: "i_pr_type2",
                              boxLabel: "จองงวด",
                            },
                          ], //radiogroup
                          listeners: {
                            change: function () {
                              // Ext.getCmp("i_type_fix_rateGb").fn();
                            },
                            afterrender: function () {
                              // console.log(this.getValue());
                            },
                          },
                        },
                        {
                          xtype: "combo",
                          id: "bg_expense_id2_pr",
                          name: "bg_expense_id2_pr",
                          fieldLabel: "รายการย่อย : " + rec.get("bg_expense_id2_pr") + " ",
                          mode: "local",
                          store: Ext.bg_expense,
                          value: rec.get("bg_expense_id2_pr"),
                          valueField: "id",
                          displayField: "c_name",
                          triggerAction: "all",
                          forceSelection: true,
                          selectOnFocus: true,
                          anchor: "95%",
                          editable: true,
                        },
                        {
                          xtype: "textfield",
                          id: "f_total_pr2",
                          name: "f_total_pr2",
                          fieldLabel: "จำนวนเงินPR",
                          value: floatRenderer(rec.get("f_amt_pr2")),
                          style: "text-align: right; bold;color: blue; font-weight: bold;",
                          width: 200,
                          listeners: {
                            afterrender: function () {
                              this.fn = function () {
                                let value = floatMinus(this.getValue().replace(/,/g, ""), 2);
                                this.setValue(floatRenderer(value));
                              };
                            },
                            Change: function (value) {
                              this.fn();
                            },
                          },
                        },
                        {
                          xtype: "container",
                          layout: "hbox",
                          layoutConfig: { pack: "end" },
                          style: "margin-top: 10px;",
                          items: [
                            {
                              xtype: "button",
                              text: "บันทึก PR 2",
                              width: 100,
                              style: "font-weight: bold;",
                              handler: function () {
                                if (!rec.get("id")) {
                                  Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกข้อมูลในตาราง");
                                  return;
                                }
                                Ext.Msg.confirm("ยืนยัน", "คุณต้องการบันทึกข้อมูลการจองเงิน PR 2 ใช่หรือไม่?", function (btn) {
                                  if (btn == "yes") {
                                    Ext.Ajax.request({
                                      url: "tor/api/mnEditPRController.php",
                                      method: "POST",
                                      params: {
                                        mode: "UPDATE_RESERVE_PR2",
                                        tor_id: rec.get("id"),
                                        dc_budget_type_id: Ext.getCmp("dc_expense_budget_type2_id").getValue(),
                                        i_pr_type: Ext.getCmp("i_pr_type2").getValue().inputValue,
                                        bg_expense_id: Ext.getCmp("bg_expense_bg_id_pr").getValue(),
                                        f_amt: Ext.getCmp("f_total_pr2").getValue(),
                                        dc_cost_id: rec.get("dc_cost_id"),
                                        bg_reserve_id: rec.get("bg_reserve_money_pr2"),
                                      },
                                      success: function (response) {
                                        var result = Ext.decode(response.responseText);
                                        if (result.success === "Success" || result.reval === 0) {
                                          Ext.Msg.alert("สำเร็จ", "บันทึกข้อมูล PR 2 เรียบร้อยแล้ว", function () {
                                            if (Ext.storeDtl) Ext.storeDtl.reload();
                                          });
                                        } else {
                                          Ext.Msg.alert("ข้อผิดพลาด", result.msg || "เกิดข้อผิดพลาดในการอัพเดท");
                                        }
                                      },
                                    });
                                  }
                                });
                              },
                            },
                            {
                              xtype: "button",
                              text: "ยกเลิกจองเงินPR",
                              width: 100,
                              style: "font-weight: bold;",
                              handler: function () {
                                if (!rec.get("id")) {
                                  Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกข้อมูลในตาราง");
                                  return;
                                }
                                Ext.Msg.confirm("ยืนยัน", "คุณต้องการยกเลิกจองเงิน PR 2 ใช่หรือไม่?", function (btn) {
                                  if (btn == "yes") {
                                    Ext.Ajax.request({
                                      url: "tor/api/mnEditPRController.php",
                                      method: "POST",
                                      params: {
                                        mode: "CANCEL_RESERVE_PR2",
                                        tor_id: rec.get("id"),
                                        dc_budget_type_id: Ext.getCmp("dc_budget_type_bg_id_pr").getValue(),
                                        bg_expense_id: Ext.getCmp("bg_expense_bg_id_pr").getValue(),
                                        bg_reserve_id: rec.get("bg_reserve_money_pr1"),
                                      },
                                      success: function (response) {
                                        var result = Ext.decode(response.responseText);
                                        if (result.success === "Success" || result.reval === 0) {
                                          Ext.Msg.alert("สำเร็จ", "ยกเลิกจองเงิน PR 2 เรียบร้อยแล้ว", function () {
                                            if (Ext.storeDtl) Ext.storeDtl.reload();
                                          });
                                        } else {
                                          Ext.Msg.alert("ข้อผิดพลาด", result.msg || "เกิดข้อผิดพลาดในการอัพเดท");
                                        }
                                      },
                                    });
                                  }
                                });
                              },
                            },
                          ],
                        },
                      ],
                    },
                    {
                      columnWidth: 0.5,
                      xtype: "fieldset",
                      title: "ข้อมูลรายละเอียดการจองเงิน PO 2",
                      hidden: true,
                      labelWidth: 140,
                      labelAlign: "right",
                      style: "margin-left: 5px;",
                      items: [
                        {
                          xtype: "textfield",
                          width: 80,
                          fieldLabel: "bg_reserve_money_po2",
                          value: rec.get("bg_reserve_money_po2"),
                          style: "text-align: center;font-weight:bold;background:#eee;",
                          readOnly: true,
                        },
                        {
                          xtype: "textfield",
                          fieldLabel: "วันที่สร้าง",
                          value: rec.get("d_create_reserve2"),
                          readOnly: true,
                          width: 100,
                        },
                        {
                          xtype: "combo",
                          id: "dc_budget_type_bg_id_po2",
                          name: "dc_budget_type_bg_id_po2",
                          fieldLabel: "แหล่งเงิน : " + rec.get("dc_expense_budget_type2_id_po") + " ",
                          mode: "local",
                          store: Ext.dc_expense_budget_type,
                          value: rec.get("dc_expense_budget_type2_id_po"),
                          valueField: "id",
                          displayField: "c_name",
                          triggerAction: "all",
                          forceSelection: true,
                          selectOnFocus: true,
                          anchor: "95%",
                          editable: true,
                        },
                        {
                          xtype: "combo",
                          id: "bg_expense_bg_id_po2",
                          name: "bg_expense_bg_id_po2",
                          fieldLabel: "รายการย่อย : " + rec.get("bg_expense_id2_po") + " ",
                          mode: "local",
                          store: Ext.bg_expense,
                          value: rec.get("bg_expense_id2_po"),
                          valueField: "id",
                          displayField: "c_name",
                          triggerAction: "all",
                          forceSelection: true,
                          selectOnFocus: true,
                          anchor: "95%",
                          editable: true,
                        },
                        {
                          xtype: "textfield",
                          fieldLabel: "จำนวนเงินbg2",
                          value: floatRenderer(rec.get("f_amt_reserve2")),
                          style: "text-align: right; bold;color: blue; font-weight: bold; background:#eee;",
                          width: 200,
                          readOnly: true,
                        },
                        {
                          xtype: "container",
                          layout: "hbox",
                          layoutConfig: { pack: "end" },
                          style: "margin-top: 10px;",
                          items: [
                            {
                              xtype: "button",
                              text: "บันทึก PO 2",
                              width: 100,
                              style: "font-weight: bold;",
                              handler: function () {
                                if (!rec.get("id")) {
                                  Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกข้อมูลในตาราง");
                                  return;
                                }
                                Ext.Msg.confirm("ยืนยัน", "คุณต้องการบันทึกข้อมูลการจองเงิน PO 2 ใช่หรือไม่?", function (btn) {
                                  if (btn == "yes") {
                                    Ext.Ajax.request({
                                      url: "tor/api/mnEditPRController.php",
                                      method: "POST",
                                      params: {
                                        mode: "UPDATE_RESERVE_PO2",
                                        tor_id: rec.get("id"),
                                        dc_budget_type_id: Ext.getCmp("dc_budget_type_bg_id_po2").getValue(),
                                        bg_expense_id: Ext.getCmp("bg_expense_bg_id_po2").getValue(),
                                        bg_reserve_id: rec.get("bg_reserve_money_po2"),
                                      },
                                      success: function (response) {
                                        var result = Ext.decode(response.responseText);
                                        if (result.success === "Success" || result.reval === 0) {
                                          Ext.Msg.alert("สำเร็จ", "บันทึกข้อมูล PO 2 เรียบร้อยแล้ว", function () {
                                            if (Ext.storeDtl) Ext.storeDtl.reload();
                                          });
                                        } else {
                                          Ext.Msg.alert("ข้อผิดพลาด", result.msg || "เกิดข้อผิดพลาดในการอัพเดท");
                                        }
                                      },
                                    });
                                  }
                                });
                              },
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  xtype: "container",
                  layout: "column",
                  items: [
                    {
                      columnWidth: 0.6,
                      xtype: "fieldset",
                      title: "ข้อมูลรายละเอียดการจองเงิน PR 3",
                      labelWidth: 140,
                      labelAlign: "right",
                      style: "margin-right: 5px;",
                      items: [
                        {
                          xtype: "textfield",
                          width: 80,
                          fieldLabel: "bg_reserve_money_pr",
                          value: rec.get("bg_reserve_money_pr3"),
                          style: "text-align: center;font-weight:bold;background:#eee;",
                          readOnly: true,
                        },
                        {
                          xtype: "textfield",
                          fieldLabel: "วันที่สร้าง",
                          value: rec.get("d_create_reserve1"),
                          readOnly: true,
                          width: 100,
                        },
                        {
                          xtype: "combo",
                          id: "dc_expense_budget_type3_id",
                          name: "dc_expense_budget_type3_id",
                          fieldLabel: "แหล่งเงิน : " + rec.get("dc_expense_budget_type_id3_pr") + " ",
                          mode: "local",
                          store: Ext.dc_expense_budget_type,
                          value: rec.get("dc_expense_budget_type_id3_pr"),
                          valueField: "id",
                          displayField: "c_name",
                          triggerAction: "all",
                          forceSelection: true,
                          selectOnFocus: true,
                          anchor: "95%",
                          editable: true,
                        },
                        {
                          xtype: "radiogroup",
                          columns: [98, 98, 98],
                          fieldLabel: "ประเภทการจอง",
                          id: "i_pr_type3",
                          name: "i_pr_type3",
                          items: [
                            {
                              checked: true,
                              name: "i_pr_type3",
                              inputValue: 1,
                              boxLabel: "จองแผน",
                            },
                            {
                              inputValue: 2,
                              name: "i_pr_type3",
                              boxLabel: "จองงวด",
                            },
                          ], //radiogroup
                          listeners: {
                            change: function () {
                              // Ext.getCmp("i_type_fix_rateGb").fn();
                            },
                            afterrender: function () {
                              // console.log(this.getValue());
                            },
                          },
                        },
                        {
                          xtype: "combo",
                          id: "bg_expense_id3_pr",
                          name: "bg_expense_id3_pr",
                          fieldLabel: "รายการย่อย : " + rec.get("bg_expense_id3_pr") + " ",
                          mode: "local",
                          store: Ext.bg_expense,
                          value: rec.get("bg_expense_id3_pr"),
                          valueField: "id",
                          displayField: "c_name",
                          triggerAction: "all",
                          forceSelection: true,
                          selectOnFocus: true,
                          anchor: "95%",
                          editable: true,
                        },
                        {
                          xtype: "textfield",
                          id: "f_total_pr3",
                          name: "f_total_pr3",
                          fieldLabel: "จำนวนเงินPR",
                          value: floatRenderer(rec.get("f_amt_pr3")),
                          style: "text-align: right; bold;color: blue; font-weight: bold;",
                          width: 200,
                          listeners: {
                            afterrender: function () {
                              this.fn = function () {
                                let value = floatMinus(this.getValue().replace(/,/g, ""), 2);
                                this.setValue(floatRenderer(value));
                              };
                            },
                            Change: function (value) {
                              this.fn();
                            },
                          },
                        },
                        {
                          xtype: "container",
                          layout: "hbox",
                          layoutConfig: { pack: "end" },
                          style: "margin-top: 10px;",
                          items: [
                            {
                              xtype: "button",
                              text: "บันทึก PR 3",
                              width: 100,
                              style: "font-weight: bold;",
                              handler: function () {
                                if (!rec.get("id")) {
                                  Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกข้อมูลในตาราง");
                                  return;
                                }
                                Ext.Msg.confirm("ยืนยัน", "คุณต้องการบันทึกข้อมูลการจองเงิน PR 3 ใช่หรือไม่?", function (btn) {
                                  if (btn == "yes") {
                                    Ext.Ajax.request({
                                      url: "tor/api/mnEditPRController.php",
                                      method: "POST",
                                      params: {
                                        mode: "UPDATE_RESERVE_PR3",
                                        tor_id: rec.get("id"),
                                        dc_budget_type_id: Ext.getCmp("dc_expense_budget_type3_id").getValue(),
                                        i_pr_type: Ext.getCmp("i_pr_type3").getValue().inputValue,
                                        bg_expense_id: Ext.getCmp("bg_expense_bg_id_pr").getValue(),
                                        f_amt: Ext.getCmp("f_total_pr3").getValue(),
                                        dc_cost_id: rec.get("dc_cost_id"),
                                        bg_reserve_id: rec.get("bg_reserve_money_pr3"),
                                      },
                                      success: function (response) {
                                        var result = Ext.decode(response.responseText);
                                        if (result.success === "Success" || result.reval === 0) {
                                          Ext.Msg.alert("สำเร็จ", "บันทึกข้อมูล PR 3 เรียบร้อยแล้ว", function () {
                                            if (Ext.storeDtl) Ext.storeDtl.reload();
                                          });
                                        } else {
                                          Ext.Msg.alert("ข้อผิดพลาด", result.msg || "เกิดข้อผิดพลาดในการอัพเดท");
                                        }
                                      },
                                    });
                                  }
                                });
                              },
                            },
                            {
                              xtype: "button",
                              text: "ยกเลิกจองเงิน",
                              width: 100,
                              style: "font-weight: bold;",
                              handler: function () {
                                if (!rec.get("id")) {
                                  Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกข้อมูลในตาราง");
                                  return;
                                }
                                Ext.Msg.confirm("ยืนยัน", "คุณต้องการยกเลิกจองเงิน PR 1 ใช่หรือไม่?", function (btn) {
                                  if (btn == "yes") {
                                    Ext.Ajax.request({
                                      url: "tor/api/mnEditPRController.php",
                                      method: "POST",
                                      params: {
                                        mode: "CANCEL_RESERVE_PR3",
                                        tor_id: rec.get("id"),
                                        dc_budget_type_id: Ext.getCmp("dc_budget_type_bg_id_pr").getValue(),
                                        bg_expense_id: Ext.getCmp("bg_expense_bg_id_pr").getValue(),
                                        bg_reserve_id: rec.get("bg_reserve_money_pr3"),
                                      },
                                      success: function (response) {
                                        var result = Ext.decode(response.responseText);
                                        if (result.success === "Success" || result.reval === 0) {
                                          Ext.Msg.alert("สำเร็จ", "ยกเลิกจองเงิน PR 3 เรียบร้อยแล้ว", function () {
                                            if (Ext.storeDtl) Ext.storeDtl.reload();
                                          });
                                        } else {
                                          Ext.Msg.alert("ข้อผิดพลาด", result.msg || "เกิดข้อผิดพลาดในการอัพเดท");
                                        }
                                      },
                                    });
                                  }
                                });
                              },
                            },
                          ],
                        },
                      ],
                    },
                    {
                      columnWidth: 0.5,
                      xtype: "fieldset",
                      title: "ข้อมูลรายละเอียดการจองเงิน PO 3",
                      hidden: true,
                      labelWidth: 140,
                      labelAlign: "right",
                      style: "margin-left: 5px;",
                      items: [
                        {
                          xtype: "textfield",
                          width: 80,
                          fieldLabel: "bg_reserve_money_po3",
                          value: rec.get("bg_reserve_money_po3"),
                          style: "text-align: center;font-weight:bold;background:#eee;",
                          readOnly: true,
                        },
                        {
                          xtype: "textfield",
                          fieldLabel: "วันที่สร้าง",
                          value: rec.get("d_create_reserve2"),
                          readOnly: true,
                          width: 100,
                        },
                        {
                          xtype: "combo",
                          id: "dc_budget_type_bg_id_po3",
                          name: "dc_budget_type_bg_id_po3",
                          fieldLabel: "แหล่งเงิน : " + rec.get("dc_expense_budget_type3_id_po") + " ",
                          mode: "local",
                          store: Ext.dc_expense_budget_type,
                          value: rec.get("dc_expense_budget_type3_id_po"),
                          valueField: "id",
                          displayField: "c_name",
                          triggerAction: "all",
                          forceSelection: true,
                          selectOnFocus: true,
                          anchor: "95%",
                          editable: true,
                        },
                        {
                          xtype: "combo",
                          id: "bg_expense_bg_id_po3",
                          name: "bg_expense_bg_id_po3",
                          fieldLabel: "รายการย่อย : " + rec.get("bg_expense_id3_po") + " ",
                          mode: "local",
                          store: Ext.bg_expense,
                          value: rec.get("bg_expense_id3_po"),
                          valueField: "id",
                          displayField: "c_name",
                          triggerAction: "all",
                          forceSelection: true,
                          selectOnFocus: true,
                          anchor: "95%",
                          editable: true,
                        },
                        {
                          xtype: "textfield",
                          fieldLabel: "จำนวนเงินbg2",
                          value: floatRenderer(rec.get("f_amt_reserve2")),
                          style: "text-align: right; bold;color: blue; font-weight: bold; background:#eee;",
                          width: 200,
                          readOnly: true,
                        },
                        {
                          xtype: "container",
                          layout: "hbox",
                          layoutConfig: { pack: "end" },
                          style: "margin-top: 10px;",
                          items: [
                            {
                              xtype: "button",
                              text: "บันทึก PO 3",
                              width: 100,
                              style: "font-weight: bold;",
                              handler: function () {
                                if (!rec.get("id")) {
                                  Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกข้อมูลในตาราง");
                                  return;
                                }
                                Ext.Msg.confirm("ยืนยัน", "คุณต้องการบันทึกข้อมูลการจองเงิน PO 3 ใช่หรือไม่?", function (btn) {
                                  if (btn == "yes") {
                                    Ext.Ajax.request({
                                      url: "tor/api/mnEditPRController.php",
                                      method: "POST",
                                      params: {
                                        mode: "UPDATE_RESERVE_PO3",
                                        tor_id: rec.get("id"),
                                        dc_budget_type_id: Ext.getCmp("dc_budget_type_bg_id_po3").getValue(),
                                        bg_expense_id: Ext.getCmp("bg_expense_bg_id_po3").getValue(),
                                        bg_reserve_id: rec.get("bg_reserve_money_po3"),
                                      },
                                      success: function (response) {
                                        var result = Ext.decode(response.responseText);
                                        if (result.success === "Success" || result.reval === 0) {
                                          Ext.Msg.alert("สำเร็จ", "บันทึกข้อมูล PO 3 เรียบร้อยแล้ว", function () {
                                            if (Ext.storeDtl) Ext.storeDtl.reload();
                                          });
                                        } else {
                                          Ext.Msg.alert("ข้อผิดพลาด", result.msg || "เกิดข้อผิดพลาดในการอัพเดท");
                                        }
                                      },
                                    });
                                  }
                                });
                              },
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
              buttonAlign: "left",
            },
            // TAB 3: เลขสัญญาและเลขที่เอกสาร (Document Codes)
            {
              title: "การจองงบประมาณ ปีปัจจุบัน/กันเหลื่อม",
              id: "tab-codes-custom",
              xtype: "form",
              frame: true,
              labelAlign: "right",
              labelWidth: 140,
              bodyStyle: { padding: "5px" },
              defaults: { anchor: "100%", msgTarget: "side", allowBlank: false },
              items: [Ext.gridEditMoney, Ext.gridEditMoneyOverlap],
              buttonAlign: "left",
            },
            // TAB 4: ข้อมูลเลขรับของ/ตรวจรับ (Document Receive/Check Info)
            {
              title: "รายการจองเงิน",
              id: "tab-receive-custom",
              xtype: "form",
              frame: true,
              labelAlign: "right",
              labelWidth: 140,
              bodyStyle: { padding: "15px" },
              defaults: { anchor: "100%", msgTarget: "side", allowBlank: false },
              //              items: [Ext.gridEditOverlap]
            },
            // TAB 5: รายละเอียด (Details)
            {
              title: "รายละเอียด",
              id: "tab-details-custom",
              xtype: "form",
              frame: true,
              labelAlign: "right",
              labelWidth: 140,
              bodyStyle: { padding: "15px" },
              defaults: { anchor: "100%", msgTarget: "side", allowBlank: false },
              items: [
                { xtype: "hidden", name: "id", value: rec ? rec.data.id : "" },
                { xtype: "textarea", fieldLabel: "รายการส่งเบิก", name: "c_name", value: rec && rec.data ? rec.data.c_name || "" : "", readOnly: true, height: 100, style: { background: "#EEEEEE", "font-weight": "bold", color: "black" } },
                {
                  xtype: "textfield",
                  fieldLabel: "วันที่แก้ไข",
                  name: "d_update",
                  allowBlank: true,
                  readOnly: true,
                  style: { background: "#EEEEEE", "font-weight": "bold", color: "red" },
                  listeners: {
                    afterrender: function (field) {
                      if (field.getValue()) {
                        return;
                      }
                      var d = new Date();
                      var day = String(d.getDate()).padStart(2, "0");
                      var month = String(d.getMonth() + 1).padStart(2, "0");
                      var year = d.getFullYear() + 543;
                      field.setValue(day + "-" + month + "-" + year);
                    },
                  },
                },
              ],
              buttonAlign: "left",
              buttons: [
                {
                  text: "บันทึกแท็บนี้",
                  iconCls: "icon-save",
                  id: "btn-save-details-tab",
                  handler: function () {
                    var form = Ext.getCmp("tab-details-custom").getForm();
                    if (form.isValid()) {
                      Ext.MessageBox.alert("สำเร็จ", "บันทึกข้อมูลแท็บรายละเอียดเรียบร้อยแล้ว");
                    }
                  },
                },
              ],
            },
          ],
        },
      ],
      buttonAlign: "left",
      buttons: [
        {
          text: "ปิด",
          iconCls: "icon-cancel", // (ถ้ามี) ใส่เพื่อให้มีไอคอนสวยงามขึ้น
          handler: function () {
            // เซฟค่า d_update ปัจจุบันไปยังฐานข้อมูลก่อนปิด
            //            saveCurrentModifyDate();
            // ปิดหน้าต่างหลังจาก save เสร็จ
            setTimeout(function () {
              win.close();
            }, 100);
          },
        },
        {
          text: "OTP Generator",
          iconCls: "icon-star", // (ถ้ามี) ใส่เพื่อให้มีไอคอนสวยงามขึ้น
          handler: function () {
            Ext.Ajax.request({
              url: "tor/api/mnCheckingController.php",
              method: "GET", // กำหนดเป็น GET (ตัวพิมพ์ใหญ่)
              // พารามิเตอร์ที่จะถูกแนบไปกับ URL เช่น ?action=getData&id=123
              params: {
                mode: "generateOnetimeOTP",
                action: "generateOnetimeOTP",
                id: "123",
              },
              // ทำงานเมื่อเซิร์ฟเวอร์ตอบกลับสำเร็จ (Status Code 200)
              success: function (response) {
                try {
                  Ext.getBody().unmask();

                  var rawText = response.responseText.trim();
                  var cleanText = rawText;

                  // แก้ปัญหา JSON ซ้อนกันสองก้อน โดยแยกและเอาเฉพาะก้อนแรกมาแปลงข้อมูล
                  if (rawText.match(/}{/)) {
                    cleanText = rawText.split("}{")[0] + "}";
                  }

                  var result = Ext.decode(cleanText);

                  if (result.success === true || result.success === "Success") {
                    // กรณีที่ Server ส่งรหัส OTP กลับมาด้วย ให้แสดงกล่องข้อความสไตล์ OTP
                    if (result.otp) {
                      Ext.Msg.show({
                        title: "ส่งรหัส OTP สำเร็จ",
                        msg:
                          '<div style="text-align: center; font-family: sans-serif;">' +
                          '  <p style="font-size: 14px; color: #555;">' +
                          (result.msg || "รหัส OTP ของคุณคือ") +
                          "</p>" +
                          '  <h1 style="font-size: 32px; color: #1e88e5; letter-spacing: 4px; margin: 10px 0;">' +
                          result.otp +
                          "</h1>" +
                          '  <p style="font-size: 12px; color: #888;">*กรุณากรอกรหัสภายในเวลาที่กำหนด</p>' +
                          "</div>",
                        buttons: Ext.Msg.OK,
                        icon: Ext.Msg.INFO,
                        fn: function () {
                          if (typeof grid !== "undefined" && grid.getStore()) {
                            grid.getStore().reload();
                          }
                        },
                      });
                    } else {
                      // กรณีบันทึกข้อมูลทั่วไปที่ไม่มี OTP
                      Ext.Msg.alert("สำเร็จ", result.msg || "บันทึกข้อมูลเรียบร้อยแล้ว", function () {
                        if (typeof grid !== "undefined" && grid.getStore()) {
                          grid.getStore().reload();
                        }
                      });
                    }
                  } else {
                    // กรณีเกิดข้อผิดพลาดจากฝั่ง Logic ของ Server (success เป็น false)
                    Ext.Msg.show({
                      title: "ล้มเหลว",
                      msg: result.msg || "ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง",
                      buttons: Ext.Msg.OK,
                      icon: Ext.Msg.ERROR,
                    });
                  }
                } catch (e) {
                  // กรณีที่เกิดข้อผิดพลาดในการประมวลผลคำสั่ง JavaScript จริงๆ
                  Ext.Msg.show({
                    title: "ข้อผิดพลาดของระบบ",
                    msg: "ระบบประมวลผลข้อมูลตอบกลับไม่สำเร็จ แต่ข้อมูลอาจถูกบันทึกแล้วในฝั่งฐานข้อมูล",
                    buttons: Ext.Msg.OK,
                    icon: Ext.Msg.WARNING,
                  });
                  console.error("JSON Parsing/Execution Error: ", e);
                }
              },

              // ทำงานเมื่อเชื่อมต่อล้มเหลว (เช่น Server Error 500, ไม่พบหน้า 404, หรือเน็ตหลุด)
              failure: function (response, opts) {
                Ext.Msg.alert("ผิดพลาด", "เซิร์ฟเวอร์ตอบกลับด้วยรหัสข้อผิดพลาด: " + response.status);
              },
            });
          },
        },
      ],
    });

    // Helper function to load record data into forms
    var loadRecordToTabs = function (rec) {
      if (rec && rec.data) {
        Ext.getCmp("tab-product-inspect-custom") && Ext.getCmp("tab-product-inspect-custom").getForm().loadRecord(rec);
        Ext.getCmp("tab-info-custom") && Ext.getCmp("tab-info-custom").getForm().loadRecord(rec);
        Ext.getCmp("tab-codes-custom") && Ext.getCmp("tab-codes-custom").getForm().loadRecord(rec);
        Ext.getCmp("tab-details-custom") && Ext.getCmp("tab-details-custom").getForm().loadRecord(rec);
        Ext.getCmp("tab-receive-custom") && Ext.getCmp("tab-receive-custom").getForm().loadRecord(rec);
      }
    };

    win.show();
    loadRecordToTabs(rec);

    // remember this period id so we can reopen after F5
    if (rec && rec.data && rec.data.sp_tor_hdr_period_id) {
      localStorage.setItem("lastBookingPeriod", rec.data.sp_tor_hdr_period_id);
      try {
        localStorage.setItem("lastBookingRec", Ext.encode(rec.data));
      } catch (e) {
        console.error("unable to save booking rec to storage", e);
      }
    }

    // save combo value when page is about to unload (F5/refresh/close)
    var saveBookingOnUnload = function () {
      var combo = Ext.getCmp("combo_i_pr_type");
      var pid = rec && rec.data ? rec.data.sp_tor_hdr_period_id : null;
      if (pid && combo) {
        localStorage.setItem("bookingType_" + pid, combo.getValue());
      }
    };
    window.addEventListener("beforeunload", saveBookingOnUnload);
    // remove listener when window closed normally
    win.on("close", function () {
      window.removeEventListener("beforeunload", saveBookingOnUnload);
      if (rec && rec.data && rec.data.sp_tor_hdr_period_id) {
        localStorage.removeItem("bookingType_" + rec.data.sp_tor_hdr_period_id);
      }
      localStorage.removeItem("lastBookingPeriod");
      localStorage.removeItem("lastBookingRec");
    });
  } catch (e) {
    console.error("showCustomEditForm error", e);
  }
}

var updateModifyDate = function (fieldLabel) {
  var d = new Date();
  var day = String(d.getDate()).padStart(2, "0");
  var month = String(d.getMonth() + 1).padStart(2, "0");
  var year = d.getFullYear() + 543;
  var dateStr = day + "-" + month + "-" + year;

  // สร้างข้อความ: "วันที่ * อัพเดท..."
  var updateMsg = dateStr;
  if (fieldLabel) {
    updateMsg = updateMsg + " * อัพเดท" + fieldLabel + ":";
  }

  // ค้นหา d_update field และอัปเดตค่า ในทุกแท็บ
  var tabPanel = Ext.getCmp("tabpanel-edit-custom");
  if (tabPanel) {
    Ext.each(tabPanel.items.items, function (tab) {
      if (tab.getForm) {
        var field = tab.getForm().findField("d_update");
        if (field) {
          // ถ้ามี fieldLabel แสดงว่ากำลังเปลี่ยนฟิลด์ จึงควรอัพเดตความคิดเห็น
          if (fieldLabel) {
            field.setValue(updateMsg);
            // ไฮไลต์สูงเพื่อบ่งชี้อัปเดต
            if (field.el && field.el.dom) {
              field.el.dom.style.background = "#FFFFCC";
              setTimeout(function () {
                if (field.el && field.el.dom) {
                  field.el.dom.style.background = "#EEEEEE";
                }
              }, 2000);
            }
          }
        }
      }
    });
  }

  // บันทึก d_update ไปยังฐานข้อมูล
  if (Ext.selectRow) {
    // ดึงค่าจากแท็บปัจจุบัน (ที่มี activeTab)
    var currentValue = updateMsg;
    var tabPanel = Ext.getCmp("tabpanel-edit-custom");
    if (tabPanel && tabPanel.items.items.length > 0) {
      // ลองดึงจากแท็บ active ก่อน
      var activeTab = tabPanel.getActiveTab();
      if (activeTab && activeTab.getForm) {
        var field = activeTab.getForm().findField("d_update");
        if (field && field.getValue()) {
          currentValue = field.getValue();
        }
      }
    }
    if (!Ext.selectRow.data) {
      Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกข้อมูลในตาราง");
      return;
    }

    Ext.Ajax.request({
      url: "tor/api/mnCheckingController.php",
      method: "POST",
      params: {
        mode: "updateModifyDate",
        action: "updateModifyDate",
        d_update: currentValue,
        sp_tor_id: Ext.selectRow.get("sp_tor_id"),
        sp_check_period_hdr_id: Ext.selectRow.get("sp_check_period_hdr_id"),
        sp_tor_hdr_period_id: Ext.selectRow.get("sp_tor_hdr_period_id"),
        sp_tor_contract_id: Ext.selectRow.get("sp_tor_contract_id"),
      },
      success: function (response) {
        try {
          var result = Ext.decode(response.responseText);
          console.log("Update modify date saved:", result);
        } catch (e) {
          console.log("Modify date saved to DB");
        }
      },
      failure: function (response) {
        console.error("Failed to save modify date:", response);
      },
    });
  }
};
Ext.gridEditMoneyfn = (rec) => {
  console.log(rec);
  console.log(rec.get("id"));
  // =====================================================
  // STORE
  // =====================================================
  var store = new Ext.data.JsonStore({
    url: "tor/api/List_mnChck_book.php",
    root: "rows",
    autoLoad: true,
    baseParams: {
      type: "po_money",
      pr_id: rec.get("id"),
    },
    fields: [
      "bg_reserve_money_id",
      "i_sys",
      "pr_id",
      "po_id",
      "chk_id",
      "i_year",
      "i_pr_type",
      "i_reserve",
      "dc_cost_id",
      "dc_budget_type_id",
      "bg_expense_id",
      "i_finish",
      "i_last",
      "f_amt",
      "i_enable",
      "d_create",
      "d_update",
      "dc_cost_acc_id",
      "c_comment",
    ],
  });
  // =====================================================
  // EDITOR
  // =====================================================
  var txtEditor = new Ext.form.TextField();
  var numEditor = new Ext.form.NumberField({
    decimalPrecision: 2,
  });
  // =====================================================
  // ROW SELECTION MODEL
  // =====================================================
  var sm = new Ext.grid.RowSelectionModel({
    singleSelect: true,
    listeners: {
      rowselect: function (selModel, rowIndex, rec) {
        console.log(rec.data);
      },
    },
  });
  // =====================================================
  // GRID Config Variables
  // =====================================================
  var targetTorPeriodId = rec.get("sp_tor_contract_id");
  var targetChkId = rec.get("id");
  var targetExpId = rec.get("po_expense_id");
  var targetTypeExpId = rec.get("dc_expense_budget_type_id");

  // สร้างตัวแปรอ้างอิง Grid ไว้ก่อนเพื่อเรียกใช้ภายใน tbar/bbar สไตล์ ExtJS 3
  var grid;

  grid = new Ext.grid.EditorGridPanel({
    width: 1800,
    height: 300,
    title: "เงินประจำปีอ้างอิงจาก เลข PR_ID => " + targetChkId + " PO_ID =>" + targetTorPeriodId + " เลขประเภทรายได้=>" + targetTypeExpId + " เลขค่าใช้จ่าย =>" + targetExpId,
    store: store,
    sm: sm,
    stripeRows: true,
    frame: true,
    clicksToEdit: 2,
    columns: [
      new Ext.grid.RowNumberer({
        width: 35,
      }),
      {
        header: "bg_reserve_money_id",
        dataIndex: "bg_reserve_money_id",
        width: 130,
        editor: numEditor,
      },
      {
        header: "f_amt",
        dataIndex: "f_amt",
        width: 120,
        align: "right",
        renderer: function (v) {
          return '<span style="color:blue;">' + Ext.util.Format.number(v, "0,000.00") + "</span>";
        },
        editor: numEditor,
      },
      {
        header: "pr_id",
        dataIndex: "pr_id",
        width: 80,
        align: "center",
        editor: numEditor,
      },
      {
        header: "po_id",
        dataIndex: "po_id",
        width: 80,
        align: "center",
        editor: numEditor,
      },
      {
        header: "chk_id",
        dataIndex: "chk_id",
        width: 80,
        align: "center",
        editor: numEditor,
      },
      {
        header: "i_year",
        dataIndex: "i_year",
        width: 80,
        align: "center",
        editor: numEditor,
      },
      {
        header: "i_pr_type",
        dataIndex: "i_pr_type",
        width: 80,
        align: "center",
        editor: numEditor,
      },
      {
        header: "i_reserve",
        dataIndex: "i_reserve",
        width: 80,
        align: "center",
        editor: numEditor,
      },
      {
        header: "dc_cost_id",
        dataIndex: "dc_cost_id",
        width: 90,
        align: "center",
        editor: numEditor,
      },
      {
        header: "dc_budget_type_id",
        dataIndex: "dc_budget_type_id",
        width: 130,
        align: "center",
        editor: numEditor,
      },
      {
        header: "bg_expense_id",
        dataIndex: "bg_expense_id",
        width: 110,
        align: "center",
        editor: numEditor,
      },
      {
        header: "i_finish",
        dataIndex: "i_finish",
        width: 80,
        align: "center",
        editor: numEditor,
      },
      {
        header: "i_last",
        dataIndex: "i_last",
        width: 70,
        align: "center",
        editor: numEditor,
      },
      {
        header: "i_enable",
        dataIndex: "i_enable",
        width: 80,
        align: "center",
        editor: numEditor,
      },
      {
        header: "d_create",
        dataIndex: "d_create",
        width: 150,
        editor: txtEditor,
      },
      {
        header: "d_update",
        dataIndex: "d_update",
        width: 150,
        editor: txtEditor,
      },
      {
        header: "dc_cost_acc_id",
        dataIndex: "dc_cost_acc_id",
        width: 110,
        align: "center",
        editor: numEditor,
      },
    ],
    viewConfig: {
      forceFit: false,
      getRowClass: function (record) {
        if (record.get("id") == targetChkId) {
          return "row-highlight";
        }
        return "";
      },
    },
    tbar: [
      {
        text: "รายละเอียดข้อมูล",
        iconCls: "icon-view",
        handler: function () {
          // ดึงข้อมูลจากแถวที่เลือกใน Grid
          var selectedRec = grid.getSelectionModel().getSelected();
          if (!selectedRec) {
            Ext.Msg.alert("Warning", "กรุณาเลือกข้อมูลที่ต้องการดูรายละเอียด");
            return;
          }

          // 1. สร้าง FormPanel หลัก (ใช้ layout: 'form' เพื่อรองรับการวาด FieldLabel)
          var detailForm = new Ext.form.FormPanel({
            labelWidth: 160,
            labelAlign: "right",
            bodyStyle: "padding:15px; background:#fff;", // เปลี่ยนพื้นหลังเป็นสีขาวให้เห็นฟิลด์ชัดเจน
            border: false,
            autoScroll: true, // ป้องกันกรณีหน้าจอย่อเล็กแล้วฟิลด์ล้น
            defaults: {
              readOnly: true,
              style: "background:#f4f4f4; color:#333; border: 1px solid #ccc;",
            },
            items: [
              {
                // ใช้ layout: 'column' เพื่อแบ่งฝั่ง ซ้าย-ขวา
                layout: "column",
                border: false,
                bodyStyle: "background:transparent;",
                defaults: {
                  layout: "form", // สำคัญมาก: ข้างใน Column ต้องประกาศ layout: 'form' เพื่อให้ FieldLabel แสดงผล
                  border: false,
                  bodyStyle: "background:transparent;",
                  defaults: {
                    xtype: "textfield",
                    anchor: "95%", // คุมความกว้างของฟิลด์ในคอลัมน์ไม่ให้ล้นออกไปทางขวา
                    readOnly: true,
                    style: "background:#f4f4f4; color:#333; border: 1px solid #ccc;",
                  },
                },
                items: [
                  {
                    columnWidth: 0.5,
                    items: [
                      { fieldLabel: "ID เงินจองประจำปี", value: selectedRec.get("bg_reserve_money_id") },
                      { fieldLabel: "ระบบที่ใช้งาน (i_sys)", value: selectedRec.get("i_sys") },
                      { fieldLabel: "เลขที่ PR (pr_id)", value: selectedRec.get("pr_id") },
                      { fieldLabel: "เลขที่ PO (po_id)", value: selectedRec.get("po_id") },
                      { fieldLabel: "เลขที่ตรวจรับ (chk_id)", value: selectedRec.get("chk_id") },
                      { fieldLabel: "ปีงบประมาณ (i_year)", value: selectedRec.get("i_year") },
                      { fieldLabel: "ประเภท PR (i_pr_type)", value: selectedRec.get("i_pr_type") },
                      { fieldLabel: "ประเภทเงินจอง (i_reserve)", value: selectedRec.get("i_reserve") },
                      { fieldLabel: "รหัสศูนย์ต้นทุน (dc_cost_id)", value: selectedRec.get("dc_cost_id") },
                    ],
                  },
                  {
                    columnWidth: 0.5,
                    items: [
                      { fieldLabel: "รหัสบัญชีต้นทุน (dc_cost_acc_id)", value: selectedRec.get("dc_cost_acc_id") },
                      { fieldLabel: "ประเภทงบประมาณ", value: selectedRec.get("dc_budget_type_id") },
                      { fieldLabel: "รหัสค่าใช้จ่าย (bg_expense_id)", value: selectedRec.get("bg_expense_id") },
                      {
                        fieldLabel: "จำนวนเงิน (f_amt)",
                        value: Ext.util.Format.number(selectedRec.get("f_amt"), "0,000.00"),
                        style: "background:#f4f4f4; color:blue; font-weight:bold; border: 1px solid #ccc;",
                      },
                      { fieldLabel: "สถานะสิ้นสุด (i_finish)", value: selectedRec.get("i_finish") },
                      { fieldLabel: "สถานะล่าสุด (i_last)", value: selectedRec.get("i_last") },
                      { fieldLabel: "สถานะใช้งาน (i_enable)", value: selectedRec.get("i_enable") },
                      { fieldLabel: "วันที่สร้าง (d_create)", value: selectedRec.get("d_create") },
                      { fieldLabel: "วันที่อัปเดต (d_update)", value: selectedRec.get("d_update") },
                    ],
                  },
                ],
              },
              {
                // เพิ่ม textarea หมายเหตุนอก column แต่อยู่ใน FormPanel เดียวกัน
                xtype: "textarea",
                fieldLabel: "หมายเหตุ (c_comment)",
                value: selectedRec.get("c_comment"),
                anchor: "97%",
                height: 50,
                style: "background:#f4f4f4; color:#333; border: 1px solid #ccc;",
              },
            ],
          });

          // 2. สร้าง Window ครอบ FormPanel
          var win = new Ext.Window({
            title: "รายละเอียดข้อมูลเงินประจำปีอ้างอิง ID: " + selectedRec.get("bg_reserve_money_id"),
            width: 900,
            height: 430, // ปรับความสูงเพิ่มขึ้นเล็กน้อยเพื่อให้เหมาะสมกับข้อมูล
            layout: "fit", // ใช้ fit เพื่อบังคับให้ FormPanel ยืดเต็มพื้นที่ของหน้าต่างพอดี
            modal: true,
            resizable: false,
            items: detailForm,
            buttons: [
              {
                text: "ปิดหน้าต่าง",
                iconCls: "icon-close",
                handler: function () {
                  win.close();
                },
              },
            ],
          });

          win.show();
        },
      },
      "-",
      {
        text: "เพิ่มรายการ (Insert)",
        iconCls: "icon-add",
        handler: function () {
          // สร้าง Record ใหม่ตามโครงสร้างฟิลด์ของ Store
          var NewRecord = grid.getStore().recordType;
          var newRec = new NewRecord({
            bg_reserve_money_id: 0, // หรือใส่ว่างไว้รอฐานข้อมูล Generate
            pr_id: rec.get("sp_tor_id"), // ใช้ค่าตั้งต้นจากตัวแปรหลัก
            po_id: rec.get("po_id") || "",
            chk_id: targetChkId,
            i_year: new Date().getFullYear(), // ปี พ.ศ. ปัจจุบันเบื้องต้น
            f_amt: 0.0,
            i_enable: 1,
          });

          grid.stopEditing();
          grid.getStore().insert(0, newRec); // แทรกแถวใหม่ที่บรรทัดบนสุด
          grid.startEditing(0, 1); // ให้โฟกัสเพื่อแก้ไขที่คอลัมน์ f_amt ทันที
        },
      },
      {
        text: "คัดลอกข้อมูล (Copy)",
        iconCls: "icon-copy",
        handler: function () {
          var selectedRec = grid.getSelectionModel().getSelected();
          if (!selectedRec) {
            Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกแถวที่ต้องการคัดลอก");
            return;
          }

          // โคลนข้อมูลจากแถวที่เลือก ยกเว้น Primary Key หลัก
          var NewRecord = grid.getStore().recordType;
          var copiedRec = new NewRecord(Ext.apply({}, selectedRec.data));
          copiedRec.set("bg_reserve_money_id", 0); // เคลียร์ ID หลักเพื่อไม่ให้ชนกันตอนเซฟเป็นแถวใหม่

          grid.stopEditing();
          grid.getStore().insert(0, copiedRec);
          grid.startEditing(0, 1);
          Ext.get(grid.getView().getRow(0)).highlight(); // แสดง Effect ไฮไลท์แถวใหม่
        },
      },
      "-",
      {
        text: "บันทึกการแก้ไข (Update)",
        iconCls: "icon-report-start",
        handler: function () {
          grid.stopEditing();

          // ดึงเฉพาะ Record ที่มีการเปลี่ยนแปลง (ทั้งเพิ่มใหม่ และแก้ไข)
          var modifiedRecords = grid.getStore().getModifiedRecords();
          if (modifiedRecords.length === 0) {
            Ext.Msg.alert("แจ้งเตือน", "ไม่มีข้อมูลที่มีการเปลี่ยนแปลง");
            return;
          }

          var dataJson = [];
          Ext.each(modifiedRecords, function (item) {
            dataJson.push(item.data);
          });

          Ext.getBody().mask("กำลังบันทึกข้อมูล...");

          Ext.Ajax.request({
            url: "tor/api/mnCheckingController.php",
            method: "POST",
            params: {
              mode: "saveGridReserveMoney",
              action: "saveGridReserveMoney",
              data: Ext.encode(dataJson), // ส่ง Data array ในรูปแบบ JSON String
            },
            success: function (response) {
              Ext.getBody().unmask();
              var result = Ext.decode(response.responseText);
              if (result.success) {
                Ext.Msg.alert("สำเร็จ", "บันทึกข้อมูลเรียบร้อยแล้ว");
                grid.getStore().commitChanges(); // เคลียร์สถานะดอกจันสีแดงบนแถวของ Grid
                grid.getStore().reload();
              } else {
                Ext.Msg.alert("ล้มเหลว", result.msg || "เกิดข้อผิดพลาดจากระบบ");
              }
            },
            failure: function () {
              Ext.getBody().unmask();
              Ext.Msg.alert("ผิดพลาด", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
            },
          });
        },
      },
      "->",
      {
        text: "ยกเลิกรายการจอง",
        iconCls: "icon-cancel",
        handler: function () {
          var selectedRec = grid.getSelectionModel().getSelected();
          if (!selectedRec) {
            Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกรายการ");
            return;
          }

          var pr_id = selectedRec.get("pr_id");
          var po_id = selectedRec.get("po_id");
          var chk_id = selectedRec.get("chk_id");
          var f_amt = selectedRec.get("f_amt");
          var i_enabled = 2;

          Ext.Msg.confirm(
            "Confirm",
            '<div style="font-size:12px;">' +
              "<b>ยืนยันการยกเลิกรายการจอง ?</b><br><br>" +
              "PR ID : <b>" +
              pr_id +
              "</b><br>" +
              "PO ID : <b>" +
              po_id +
              "</b><br>" +
              "CHK ID : <b>" +
              chk_id +
              "</b><br>" +
              'จำนวนเงิน : <b style="color:red;">' +
              Ext.util.Format.number(f_amt, "0,000.00") +
              "</b> บาท" +
              "</div>",
            function (btn) {
              if (btn == "yes") {
                Ext.Ajax.request({
                  url: "tor/api/mnCheckingController.php",
                  params: {
                    mode: "updateReserveMoney",
                    i_enabled: i_enabled,
                    bg_reserve_money_id: selectedRec.get("bg_reserve_money_id"),
                    pr_id: pr_id,
                    po_id: po_id,
                    chk_id: chk_id,
                  },
                  success: function (response) {
                    var obj = Ext.decode(response.responseText);
                    if (obj.success) {
                      Ext.Msg.alert("Success", "ยกเลิกรายการเรียบร้อย");
                      grid.getStore().reload();
                    } else {
                      Ext.Msg.alert("Error", obj.message);
                    }
                  },
                  failure: function () {
                    Ext.Msg.alert("Error", "Server Error");
                  },
                });
              }
            },
          );
        },
      },
      "-",
      {
        text: "ยกเลิกรายการตรวจรับทั้งชุด",
        iconCls: "icon-table_delete",
        handler: function () {
          var me = this;
          Ext.Msg.prompt(
            "ยืนยันตัวตน",
            "กรุณาระบุรหัส One-Time Password (OTP):",
            function (btnOtp, otpValue) {
              if (btnOtp == "ok") {
                if (Ext.isEmpty(otpValue.trim())) {
                  Ext.Msg.alert("แจ้งเตือน", "กรุณาระบุรหัส OTP ก่อนตกลง");
                  return false;
                }

                Ext.Msg.prompt(
                  "ยืนยันการยกเลิก",
                  "กรุณาระบุเหตุผลในการยกเลิกรายการ:",
                  function (btnReason, reasonText) {
                    if (btnReason == "ok") {
                      if (Ext.isEmpty(reasonText.trim())) {
                        Ext.Msg.alert("แจ้งเตือน", "กรุณาระบุเหตุผลก่อนตกลง");
                        return false;
                      }
                      Ext.getBody().mask("กำลังดำเนินการยกเลิกรายการ...");
                      Ext.Ajax.request({
                        url: "tor/api/mnCheckingController.php",
                        method: "POST",
                        params: {
                          mode: "updateOnetimeRemoveChecking",
                          action: "updateOnetimeRemoveChecking",
                          otp: otpValue.trim(),
                          reason: reasonText.trim(),
                          sp_check_period_hdr_id: targetChkId,
                          sp_tor_hdr_period_id: targetTorPeriodId,
                        },
                        success: function (response) {
                          try {
                            Ext.getBody().unmask();
                            var result = Ext.decode(response.responseText);
                            if (result.success) {
                              Ext.Msg.alert("สำเร็จ", "ยกเลิกรายการเรียบร้อยแล้ว", function () {
                                grid.getStore().reload();
                              });
                            } else {
                              Ext.Msg.alert("ล้มเหลว", result.msg || "ไม่สามารถดำเนินการได้");
                            }
                          } catch (e) {
                            Ext.Msg.alert("สำเร็จ", "บันทึกข้อมูลเรียบร้อยแล้ว (ตอบกลับมี: " + response.responseText + ")");
                          }
                        },
                        failure: function (response) {
                          Ext.getBody().unmask();
                          Ext.Msg.alert("ผิดพลาด", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
                        },
                      });
                    }
                  },
                  me,
                  true,
                );
              }
            },
            me,
            false,
          );
        },
      },
      "-",
    ],
    bbar: [
      {
        text: "Refresh Data",
        iconCls: "icon-refresh", // กำหนดคลาสไอคอนตามที่มีในระบบของคุณ เช่น icon-reload หรือ icon-refresh
        handler: function () {
          grid.stopEditing(); // หยุดการแก้ไขฟิลด์ค้างไว้ก่อนโหลดใหม่
          grid.getStore().reload(); // สั่งรีโหลด Store ของ Grid
        },
      },
      "-",
    ],
  });

  return grid;
};
Ext.gridEditMoneyOverlapfn = (rec) => {
  // =====================================================
  // STORE
  // =====================================================
  var store = new Ext.data.JsonStore({
    url: "tor/api/List_mnChck_book.php",
    root: "rows",
    autoLoad: true,
    baseParams: {
      type: "po_money_overlap",
      pr_id: rec.get("id"),
      po_id: rec.get("sp_tor_contract_id"),
      sp_tor_id: rec.get("sp_tor_id"),
    },
    fields: [
      "bg_reserve_overlap_id",
      "c_code_overlap",
      "i_sys",
      "pr_id",
      "po_id",
      "chk_id",
      "i_year",
      "i_pr_type",
      "i_reserve",
      "dc_cost_id",
      "dc_budget_type_id",
      "bg_expense_id",
      "i_finish",
      "i_last",
      "f_amt",
      "i_enable",
      "d_create",
      "d_update",
      "dc_cost_acc_id",
    ],
  });
  // =====================================================
  // EDITOR
  // =====================================================
  var txtEditor = new Ext.form.TextField();
  var numEditor = new Ext.form.NumberField({
    decimalPrecision: 2,
  });
  // =====================================================
  // ROW SELECTION MODEL
  // =====================================================
  var sm = new Ext.grid.RowSelectionModel({
    singleSelect: true,
    listeners: {
      rowselect: function (selModel, rowIndex, rec) {
        console.log(rec.data);
        //                Ext.Msg.alert(
        //                    'Select Row',
        //                    'ID : ' + rec.get('bg_reserve_money_id')
        //                    + '<br>Amount : '
        //                    + Ext.util.Format.number(
        //                        rec.get('f_amt'),
        //                        '0,000.00'
        //                    )
        //                );
      },
    },
  });
  // =====================================================
  // GRID
  // =====================================================
  var targetChkId = rec.get("id");
  return new Ext.grid.EditorGridPanel({
    //        renderTo : 'gridReserveMoney',
    width: 1800,
    height: 300,
    title: "เงินกันเหลื่อม อ้างอิงจากเลข PR  ID => " + targetChkId,
    store: store,
    sm: sm,
    stripeRows: true,
    frame: true,
    clicksToEdit: 2,
    columns: [
      new Ext.grid.RowNumberer({
        width: 35,
      }),

      {
        header: "bg_reserve_overlap_id",
        dataIndex: "bg_reserve_overlap_id",
        width: 130,
        editor: numEditor,
      },
      {
        header: "c_code_overlap",
        dataIndex: "c_code_overlap",
        width: 120,
        align: "right",

        renderer: function (v) {
          return '<span style="color:gray;">' + v + "</span>";
        },

        editor: txtEditor,
      },
      {
        header: "f_amt",
        dataIndex: "f_amt",
        width: 120,
        align: "right",

        renderer: function (v) {
          return '<span style="color:blue;">' + Ext.util.Format.number(v, "0,000.00") + "</span>";
        },

        editor: numEditor,
      },

      {
        header: "pr_id",
        dataIndex: "pr_id",
        width: 80,
        align: "center",
        editor: numEditor,
      },

      {
        header: "po_id",
        dataIndex: "po_id",
        width: 80,
        align: "center",
        editor: numEditor,
      },

      {
        header: "chk_id",
        dataIndex: "chk_id",
        width: 80,
        align: "center",
        editor: numEditor,
      },

      {
        header: "i_year",
        dataIndex: "i_year",
        width: 80,
        align: "center",
        editor: numEditor,
      },

      {
        header: "i_pr_type",
        dataIndex: "i_pr_type",
        width: 80,
        align: "center",
        editor: numEditor,
      },

      {
        header: "i_reserve",
        dataIndex: "i_reserve",
        width: 80,
        align: "center",
        editor: numEditor,
      },

      {
        header: "dc_cost_id",
        dataIndex: "dc_cost_id",
        width: 90,
        align: "center",
        editor: numEditor,
      },

      {
        header: "dc_budget_type_id",
        dataIndex: "dc_budget_type_id",
        width: 130,
        align: "center",
        editor: numEditor,
      },

      {
        header: "bg_expense_id",
        dataIndex: "bg_expense_id",
        width: 110,
        align: "center",
        editor: numEditor,
      },

      {
        header: "i_finish",
        dataIndex: "i_finish",
        width: 80,
        align: "center",
        editor: numEditor,
      },

      {
        header: "i_last",
        dataIndex: "i_last",
        width: 70,
        align: "center",
        editor: numEditor,
      },

      {
        header: "i_enable",
        dataIndex: "i_enable",
        width: 80,
        align: "center",
        editor: numEditor,
      },

      {
        header: "d_create",
        dataIndex: "d_create",
        width: 150,
        editor: txtEditor,
      },

      {
        header: "d_update",
        dataIndex: "d_update",
        width: 150,
        editor: txtEditor,
      },

      {
        header: "dc_cost_acc_id",
        dataIndex: "dc_cost_acc_id",
        width: 110,
        align: "center",
        editor: numEditor,
      },
    ],

    viewConfig: {
      forceFit: false,
      getRowClass: function (record) {
        if (record.get("chk_id") == targetChkId) {
          return "row-highlight";
        }
        return "";
      },
    },
    bbar: [
      {
        text: "ทำรายการจองตรวจรับ",
        iconCls: "icon-report-start",
        handler: function () {
          var rec = Ext.gridEditMoney.getSelectionModel().getSelected();
          if (rec) {
            //                        console.log(rec.data);
            Ext.Msg.alert("Selected", "Reserve ID : " + rec.get("bg_reserve_money_id"));
          } else {
            Ext.Msg.alert("Warning", "กรุณาเลือกข้อมูล");
          }
        },
      },
      "-",
    ],
    tbar: [
      {
        text: "รายละเอียดข้อมูล",
        iconCls: "icon-view",
        handler: function () {
          var rec = Ext.gridEditMoneyOverlap.getSelectionModel().getSelected();

          if (rec) {
            //                        console.log(rec.data);

            Ext.Msg.alert("Selected", "Reserve ID : " + rec.get("bg_reserve_overlap_id"));
          } else {
            Ext.Msg.alert("Warning", "กรุณาเลือกข้อมูล");
          }
        },
      },
      "-",
      {
        text: "ยกเลิกรายการจอง",
        iconCls: "icon-cancel",
        handler: function () {
          // 1. GET SELECTED ROW
          var rec = Ext.gridEditMoneyOverlap.getSelectionModel().getSelected();

          if (!rec) {
            Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกรายการ");
            return;
          }

          // 2. DEFINE DATA
          var c_overlap = rec.get("c_code_overlap");
          var f_amt = rec.get("f_amt");
          // 3. CREATE CUSTOM DIALOG WITH RADIO BUTTONS
          var win = new Ext.Window({
            title: "ยืนยันการยกเลิกรายการจอง",
            width: 400,
            layout: "form",
            padding: 10,
            modal: true,
            items: [
              {
                xtype: "label",
                html: '<div style="margin-bottom:10px;">' + "เลขใบกัน/ขยายเหลื่อม : <b>" + c_overlap + "</b><br>" + 'จำนวนเงิน : <b style="color:red;">' + Ext.util.Format.number(f_amt, "0,000.00") + "</b> บาท" + "</div>",
              },
              {
                xtype: "radiogroup",
                fieldLabel: "ขั้นตอนจอง (i_reserve)",
                columns: 1,
                id: "rgReserveStep",
                items: [
                  { boxLabel: "1 = PR", name: "rb-step", inputValue: 1, checked: rec.get("i_reserve") == 1, disabled: true },
                  { boxLabel: "2 = PO", name: "rb-step", inputValue: 2, checked: rec.get("i_reserve") == 2 },
                  { boxLabel: "3 = CHK", name: "rb-step", inputValue: 3, checked: rec.get("i_reserve") == 3 },
                ],
              },
            ],
            buttons: [
              {
                text: "ยืนยันยกเลิก",
                handler: function () {
                  var selectedStep = Ext.getCmp("rgReserveStep").getValue().inputValue;

                  if (rec.get("chk_id") != targetChkId && rec.get("chk_id") != 0) {
                    console.log(rec.get("chk_id"), targetChkId);
                    Ext.Msg.alert("แจ้งเตือน", "รายการตรวจรับ [" + targetChkId + "] ไม่ตรงกับรายการที่จะเลือกแก้ไข [" + rec.get("chk_id") + "]");
                    return;
                  }

                  //               return false;
                  // 4. PROCESS CANCEL VIA AJAX
                  Ext.Ajax.request({
                    url: "tor/api/mnCheckingController.php",
                    params: {
                      mode: "updateReserveOverlp",
                      bg_reserve_overlap_id: rec.get("bg_reserve_overlap_id"),
                      pr_id: rec.get("pr_id"),
                      po_id: rec.get("po_id"),
                      chk_id: targetChkId,
                      i_reserve: selectedStep, // Send the manually selected radio value
                    },
                    success: function (response) {
                      var obj = Ext.decode(response.responseText);
                      if (obj.success) {
                        Ext.Msg.alert("Success", "ยกเลิกรายการเรียบร้อย");
                        Ext.gridEditMoneyOverlap.getStore().reload();
                        win.close();
                      } else {
                        Ext.Msg.alert("Error", obj.message);
                      }
                    },
                    failure: function () {
                      Ext.Msg.alert("Error", "Server Error");
                    },
                  });
                },
              },
              {
                text: "ยกเลิก",
                handler: function () {
                  win.close();
                },
              },
            ],
          });

          win.show();
        },
      },
    ],
  });
};
//สถานะที่แก้ไขได้ gl_dr => 3,4,5,6,99
// gridEditMoneyfn

// Class Extend
formAdd = function (args) {
  formAdd.superclass.constructor.call(this, {
    region: "center",
    title: "ข้อมูล" + Ext.title_panel,
    iconCls: "icon-application-form-add",
    id: "frm-Add",
    // layout: "fit",
    border: false,
    stripeRows: true,
    loadMask: true,
    listeners: {
      afterrender: function (obj, eOpts) {
        // console.log(Ext.getCmp("form-widgets"));
      },
    },
    // layout: {
    //   // type: "vbox",
    //   align: "stretch",
    //   pack: "start",
    // },
    items: [
      // new Ext.FormPanel({
      //   id: "form-widgets",
      //   autoScroll: true,
      //   frame: true,
      //   height: Ext.getBody().getViewSize().height * 1 - 30,
      //   width: Ext.getBody().getViewSize().width * 1,
      {
        xtype: "form",
        id: "form-widgets",
        fileUpload: true,
        // disabled: true,
        frame: true,
        labelAlign: "right",
        labelWidth: 150,
        bodyStyle: { padding: "10px 20px" },
        defaults: { anchor: "100%", msgTarget: "side" },
        items: [
          // new Ext.FormPanel({
          //   id: "form-widgets",
          //   autoScroll: true,
          //   frame: true,
          //   height: Ext.getBody().getViewSize().height * 1 - 30,
          //   width: Ext.getBody().getViewSize().width * 1,

          // items: [
          {
            xtype: "fieldset",
            title: "ข้อมูลรายการ",
            // collapsible: true,
            layout: "column",
            labelWidth: 140, // label settings here cascade unless overridden
            labelAlign: "right",
            items: [
              {
                // column 1
                columnWidth: 0.55,
                xtype: "fieldset",
                border: false,
                items: [
                  {
                    xtype: "hidden",
                    id: "role-form-mode",
                    name: "mode",
                    readOnly: true,
                  },
                  {
                    xtype: "hidden",
                    id: "id",
                    name: "id",
                    readOnly: true,
                  },
                  {
                    xtype: "hidden",
                    id: "sp_tor_contract_id",
                    name: "sp_tor_contract_id",
                    readOnly: true,
                  },
                  {
                    xtype: "hidden",
                    id: "sp_tor_dtl_id",
                    name: "sp_tor_dtl_id",
                    readOnly: true,
                  },
                  {
                    xtype: "buttongroup",
                    fieldLabel: "hdr_id, contract_id",
                    frame: false,
                    border: false,
                    items: [
                      {
                        xtype: "textfield",
                        width: 80,
                        value: Ext.select_row.id,
                        style: "text-align: center;font-weight:bold;background:#eee;",
                        readOnly: true,
                      },
                      {
                        xtype: "textfield",
                        width: 80,
                        value: Ext.select_row.sp_tor_contract_id,
                        style: "text-align: center;font-weight:bold;background:#eee;",
                        readOnly: true,
                      },
                      {
                        iconCls: "icon-delete",
                        xtype: "button",
                        // scale: "medium",
                        text: "&nbsp;แก้ไข PR&nbsp;",
                        handler: function () {
                          showCustomEditForm(Ext.selectRow);
                        },
                      },
                    ],
                  },
                  {
                    fieldLabel: "เลขที่ PR",
                    xtype: "textfield",
                    id: "c_code",
                    name: "c_code",
                    style: "font-weight: bold;color: blue;",
                    width: 300,
                    // readOnly: true,
                  },
                  {
                    fieldLabel: "เลขที่ PR",
                    xtype: "textfield",
                    id: "c_code_po",
                    name: "c_code_po",
                    style: "font-weight: bold;color: blue;",
                    width: 300,
                    // readOnly: true,
                  },
                  new Ext.form.ComboBox({
                    fieldLabel: "ปีงบประมาณ",
                    id: "i_yyyy",
                    name: "i_yyyy",
                    mode: "local",
                    store: Ext.store_year,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    width: 200,
                    listeners: {
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
                  new Ext.form.ComboBox({
                    fieldLabel: "ปีที่สร้าง PR",
                    id: "i_pr_year",
                    name: "i_pr_year",
                    mode: "local",
                    store: Ext.store_year,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    width: 200,
                    listeners: {
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
                  new Ext.form.ComboBox({
                    fieldLabel: "แหล่งเงิน : " + Ext.select_row.dc_expense_budget_type_id + " ",
                    id: "dc_expense_budget_type_id",
                    name: "dc_expense_budget_type_id",
                    mode: "local",
                    store: Ext.dc_expense_budget_type,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    width: 400,
                    listeners: {
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
                  new Ext.form.ComboBox({
                    fieldLabel: "รายการย่อย : " + Ext.select_row.po_expense_id + " ",
                    id: "po_expense_id",
                    name: "po_expense_id",
                    mode: "local",
                    store: Ext.bg_expense,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    width: 400,
                    listeners: {
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
                  new Ext.form.ComboBox({
                    fieldLabel: "หน่วยงานที่รับผิดชอบ : " + Ext.select_row.dc_cost_id + " ",
                    id: "dc_cost_id",
                    name: "dc_cost_id",
                    mode: "local",
                    store: Ext.dc_cost,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    width: 400,
                    listeners: {
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
                  new Ext.form.ComboBox({
                    fieldLabel: "หน่วยงานที่รับผิดชอบ : " + Ext.select_row.dc_cost2_id + " ",
                    id: "dc_cost2_id",
                    name: "dc_cost2_id",
                    mode: "local",
                    store: Ext.dc_cost,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    width: 400,
                    listeners: {
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
                  new Ext.form.ComboBox({
                    fieldLabel: "ผู้ขายผู้รับจ้าง PO : " + Ext.select_row.dc_creditor_id + " ",
                    id: "dc_creditor_id",
                    name: "dc_creditor_id",
                    mode: "local",
                    store: Ext.dc_creditor,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    width: 400,
                    listeners: {
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
                  new Ext.form.ComboBox({
                    fieldLabel: " bidder_hdr : " + Ext.select_row.dc_creditor_bidder_hdr + " ",
                    id: "dc_creditor_bidder_hdr",
                    name: "dc_creditor_bidder_hdr",
                    mode: "local",
                    store: Ext.dc_creditor,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    width: 400,
                    listeners: {
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
                  new Ext.form.ComboBox({
                    fieldLabel: " bidder_dtl : " + Ext.select_row.dc_creditor_bidder_dtl + " ",
                    id: "dc_creditor_bidder_dtl",
                    name: "dc_creditor_bidder_dtl",
                    mode: "local",
                    store: Ext.dc_creditor,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    width: 400,
                    listeners: {
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
                  new Ext.form.ComboBox({
                    fieldLabel: " victory : " + Ext.select_row.dc_creditor_victory + " ",
                    id: "dc_creditor_victory",
                    name: "dc_creditor_victory",
                    mode: "local",
                    store: Ext.dc_creditor,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    width: 400,
                    listeners: {
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
                  {
                    xtype: "textfield",
                    width: 150,
                    fieldLabel: "สถานะ",
                    value: Ext.select_row.c_name_status,
                    style: "text-align: center;font-weight:bold;background:#eee;",
                    readOnly: true,
                  },
                  // {
                  //   xtype: "textfield",
                  //   width: 150,
                  //   fieldLabel: "วิธีการดำเนินงาน",
                  //   value: Ext.select_row.c_type_name,
                  //   style: "text-align: center;font-weight:bold;background:#eee;",
                  //   readOnly: true,
                  // },
                  // {
                  //   xtype: "textfield",
                  //   width: 150,
                  //   fieldLabel: "การดำเนินงาน",
                  //   value: Ext.select_row.i_purchase,
                  //   style: "text-align: center;font-weight:bold;background:#eee;",
                  //   readOnly: true,
                  // },
                  new Ext.form.ComboBox({
                    mode: "local",
                    store: Ext.torType,
                    anchor: "40%",
                    fieldLabel: "วิธีดำเนินงาน",
                    submitValue: true,
                    hiddenName: "tor_type_id",
                    name: "c_type_id",
                    id: "tor_type_idID",
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก",
                    validator: function (val) {
                      if (!Ext.isEmpty(val)) {
                        return true;
                      } else {
                        return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                      }
                    },
                    listeners: {
                      afterrender: function () {
                        this.fn = function () {
                          if (this.getValue() == 1) {
                            //tor_type_id === 1 (เจาะจง)
                            Ext.getCmp("lableLessID").show();
                          } else {
                            Ext.getCmp("lableLessID").hide();
                          }
                        };
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
                  {
                    xtype: "radiogroup",
                    columns: [98, 98, 98],
                    fieldLabel: "การดำเนินงาน",
                    id: "i_purchaseID",
                    name: "i_purchase",
                    items: [
                      {
                        checked: true,
                        name: "i_purchase",
                        inputValue: 1,
                        boxLabel: "จัดซื้อ",
                      },
                      {
                        inputValue: 2,
                        name: "i_purchase",
                        boxLabel: "จัดจ้าง",
                      },
                      {
                        name: "i_purchase",
                        inputValue: 3,
                        boxLabel: "จัดเช่า",
                      },
                    ], //radiogroup
                    listeners: {
                      change: function () {
                        // Ext.getCmp("i_type_fix_rateGb").fn();
                      },
                      afterrender: function () {
                        // console.log(this.getValue());
                      },
                    },
                  }, ///i_purchase
                  {
                    xtype: "textfield",
                    width: 150,
                    fieldLabel: "ประเภท PR",
                    value: Ext.select_row.i_type_bg,
                    style: "text-align: center;font-weight:bold;background:#eee;",
                    readOnly: true,
                  },
                  {
                    xtype: "textfield",
                    id: "f_total",
                    name: "f_total",
                    fieldLabel: "จำนวนเงินPR",
                    style: "text-align: right; bold;color: blue; font-weight: bold;",
                    width: 200,
                    listeners: {
                      afterrender: function () {
                        this.fn = function () {
                          let value = floatMinus(this.getValue().replace(/,/g, ""), 2);
                          this.setValue(floatRenderer(value));
                        };
                      },
                      Change: function (value) {
                        this.fn();
                      },
                    },
                  },
                ],
              },
              {
                // column 2
                columnWidth: 0.45,
                xtype: "fieldset",
                border: false,
                items: [
                  {
                    xtype: "textfield",
                    width: 80,
                    fieldLabel: "dlt_id",
                    value: Ext.select_row.sp_tor_dtl_id,
                    style: "text-align: center;font-weight:bold;background:#eee;",
                    readOnly: true,
                  },
                  {
                    xtype: "textarea",
                    fieldLabel: "ชื่อรายการ",
                    id: "c_name",
                    name: "c_name",
                    width: 300,
                  },
                  // {
                  //   fieldLabel: "จำนวนรายการ",
                  //   xtype: "textfield",
                  //   id: "c_qty",
                  //   name: "c_qty",
                  //   width: 200,
                  // },
                  {
                    xtype: "numberfield",
                    width: 80,
                    fieldLabel: "จำนวนวันที่นำมาคำนวน",
                    value: Ext.select_row.i_delivery,
                    style: "text-align: center;font-weight:bold;background:#eee;",
                    // readOnly: true,
                  },
                  {
                    xtype: "datefield",
                    fieldLabel: "วันที่เริ่มสัญญา",
                    id: "d_doc_date",
                    name: "d_doc_date",
                    width: 100,
                  },
                  {
                    xtype: "datefield",
                    fieldLabel: "วันที่เริ่มเข้าพื้นที่",
                    id: "d_start_date",
                    name: "d_start_date",
                    width: 100,
                  },
                  {
                    xtype: "datefield",
                    fieldLabel: "วันที่สิ้นสุด",
                    id: "d_due_date",
                    name: "d_due_date",
                    width: 100,
                  },
                  new Ext.form.ComboBox({
                    fieldLabel: "แหล่งเงิน : " + Ext.select_row.dc_bg_budget_type_id + " ",
                    id: "dc_bg_budget_type_id",
                    name: "dc_bg_budget_type_id",
                    mode: "local",
                    store: Ext.dc_expense_budget_type,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    width: 400,
                    listeners: {
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
                  new Ext.form.ComboBox({
                    fieldLabel: "รายการย่อย : " + Ext.select_row.po_expense_dtl_id + " ",
                    id: "po_expense_dtl_id",
                    name: "po_expense_dtl_id",
                    mode: "local",
                    store: Ext.bg_expense,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    width: 400,
                    listeners: {
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
                  new Ext.form.ComboBox({
                    fieldLabel: "ผู้ดำเนินการ : " + Ext.select_row.sp_emp_id + " ",
                    id: "sp_emp_idID",
                    name: "sp_emp_name",
                    hiddenName: "sp_emp_id",
                    mode: "local",
                    store: Ext.sp_emp,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    width: 200,
                    listeners: {
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

                  new Ext.form.ComboBox({
                    fieldLabel: "สานงาน : " + Ext.select_row.dc_department_id + " ",
                    id: "dc_department_idID",
                    name: "dc_department",
                    hiddenName: "dc_department_id",
                    mode: "local",
                    store: Ext.dc_department,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    width: 200,
                    listeners: {
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
                  new Ext.form.ComboBox({
                    fieldLabel: "เมนู : " + Ext.select_row.tor_status_id + " ",
                    id: "tor_status_idID",
                    name: "tor_status",
                    hiddenName: "tor_status_id",
                    mode: "local",
                    store: Ext.tor_status_id,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    width: 200,
                    listeners: {
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
                  // {
                  //   xtype: "textfield",
                  //   width: 150,
                  //   fieldLabel: "เลขที่ พวช",
                  //   value: Ext.select_row.d_doc_ref_pr,
                  //   style: "text-align: center;font-weight:bold;background:#eee;",
                  //   readOnly: true,
                  // },
                  /*    {
                    xtype: "datefield",
                    fieldLabel: "วันที่ใบขอเบิก",
                    id: "d_doc_date",
                    name: "d_doc_date",
                    width: 100,
                  },
                  {
                    xtype: "datefield",
                    fieldLabel: "วันที่ฝ่ายคลังรับใบขอเบิก",
                    id: "d_inv_date",
                    name: "d_inv_date",
                    width: 100,
                  },
                  */
                  {
                    xtype: "textarea",
                    fieldLabel: "หมายเหตุ",
                    id: "c_text",
                    name: "c_text",
                    readOnly: true,
                    value: "อัพเดทได้แค่ (ชื่อรายการ,ผู้ดำเนินการ,สายงาน,เมนู,วันที่เริ่มสัญญา,วันที่เข้าพื้นที,วันที่สิ้นสุดสัญญา)",
                    width: 300,
                  },
                  {
                    xtype: "textfield",
                    width: 150,
                    fieldLabel: "เลขที่ พวช",
                    value: Ext.select_row.d_doc_ref_pr,
                    style: "text-align: center;font-weight:bold;background:#eee;",
                    readOnly: true,
                  },
                  {
                    xtype: "textfield",
                    id: "f_total_dtl",
                    name: "f_total_dtl",
                    fieldLabel: "จำนวนเงินdtl",
                    style: "text-align: right; bold;color: blue; font-weight: bold;",
                    width: 200,
                    listeners: {
                      afterrender: function () {
                        this.fn = function () {
                          let value = floatMinus(this.getValue().replace(/,/g, ""), 2);
                          this.setValue(floatRenderer(value));
                        };
                      },
                      Change: function (value) {
                        this.fn();
                      },
                    },
                  },
                ],
              },
            ],
          },
          {
            xtype: "fieldset",
            title: "ส่งมอบงาน",
            // collapsible: true,
            layout: "column",
            labelWidth: 140, // label settings here cascade unless overridden
            labelAlign: "right",
            items: [
              {
                // column 1
                columnWidth: 0.55,
                xtype: "fieldset",
                border: false,
                items: [],
              },
              {
                columnWidth: 0.45,
                xtype: "fieldset",
                border: false,
                items: [
                  new Ext.form.ComboBox({
                    fieldLabel: "ผู้ดำเนินการ : " + Ext.select_row.sp_emp_mn_id + " ",
                    id: "sp_emp_nn_idID",
                    name: "sp_emp_mn_id",
                    hiddenName: "sp_emp_mn_id",
                    mode: "local",
                    store: Ext.sp_emp,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    width: 200,
                    listeners: {
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
                  {
                    xtype: "hidden",
                    id: "sp_mn_contract_hdr_id",
                    name: "sp_mn_contract_hdr_id", // ใช้ชื่อเดียวกันกับฟิลด์ LovCombo
                  },

                  // {
                  //   xtype: "radiogroup",
                  //   /*ss*/
                  //   columns: [100, 200],
                  //   id: "i_enable",
                  //   fieldLabel: "สถานะการใช้งาน",
                  //   items: [
                  //     {
                  //       name: "i_enable",
                  //       inputValue: 1,
                  //       checked: true,
                  //       boxLabel: "ใช้งาน",
                  //     },
                  //     {
                  //       name: "i_enable",
                  //       inputValue: 2,
                  //       boxLabel: "ยกเลิก",
                  //     },
                  //   ],
                  //   listeners: {
                  //     change: function (cb, rec, ind) {},
                  //     afterrender: function (obj, eOpts) {},
                  //   },
                  // },
                  // {
                  //   xtype: "buttongroup",
                  //   frame: false,
                  //   items: [
                  //     { xtype: "tbspacer", width: 330 },
                  //     // { xtype: "label", text: "ลบรายการ : " },
                  //     {
                  //       iconCls: "icon-delete",
                  //       xtype: "button",
                  //       // scale: "medium",
                  //       text: "&nbsp;ลบใบขอเบิก&nbsp;",
                  //       handler: function () {
                  //         deleteHdr();
                  //       },
                  //     },
                  //   ],
                  // },
                ],
              },
            ],
          },
          {
            xtype: "fieldset",
            title: "ข้อมูลรายละเอียดการจองเงิน",
            // collapsible: true,
            layout: "column",
            labelWidth: 140, // label settings here cascade unless overridden
            labelAlign: "right",
            items: [
              {
                // column 1
                columnWidth: 0.55,
                xtype: "fieldset",
                border: false,
                items: [
                  {
                    xtype: "textfield",
                    width: 80,
                    fieldLabel: "bg_reserve_money_pr",
                    id: "bg_reserve_money_i_reserve1",
                    name: "bg_reserve_money_i_reserve1",
                    style: "text-align: center;font-weight:bold;background:#eee;",
                    readOnly: true,
                  },
                  {
                    xtype: "textfield",
                    fieldLabel: "วันที่สร้าง",
                    id: "d_create_reserve1",
                    name: "d_create_reserve1",
                    readOnly: true,
                    width: 100,
                  },
                  new Ext.form.ComboBox({
                    fieldLabel: "แหล่งเงิน : " + Ext.select_row.dc_budget_type_bg_id + " ",
                    id: "dc_budget_type_bg_id",
                    name: "dc_budget_type_bg_id",
                    mode: "local",
                    store: Ext.dc_expense_budget_type,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    width: 400,
                    listeners: {
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
                  new Ext.form.ComboBox({
                    fieldLabel: "รายการย่อย : " + Ext.select_row.bg_expense_bg_id + " ",
                    id: "bg_expense_bg_id",
                    name: "bg_expense_bg_id",
                    mode: "local",
                    store: Ext.bg_expense,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    width: 400,
                    listeners: {
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
                  {
                    xtype: "textfield",
                    id: "f_amt_reserve1",
                    name: "f_amt_reserve1",
                    fieldLabel: "จำนวนเงินbg1",
                    style: "text-align: right; bold;color: blue; font-weight: bold;",
                    width: 200,
                    listeners: {
                      afterrender: function () {
                        this.fn = function () {
                          let value = floatMinus(this.getValue().replace(/,/g, ""), 2);
                          this.setValue(floatRenderer(value));
                        };
                      },
                      Change: function (value) {
                        this.fn();
                      },
                    },
                  },
                  // {
                  //   fieldLabel: "เลขที่ฏีกา",
                  //   xtype: "textfield",
                  //   id: "bg_reserve_money_idasd",
                  //   name: "bg_reserve_money_idasd",
                  //   width: 300,
                  // },
                  // {
                  //   fieldLabel: "เลขที่ใบกันเงิน",
                  //   xtype: "textfield",
                  //   id: "c_booking",
                  //   name: "c_booking",
                  //   width: 300,
                  // },
                ],
              },
              {
                // column 2
                columnWidth: 0.45,
                xtype: "fieldset",
                border: false,
                items: [
                  {
                    fieldLabel: "bg_reserve_money_po",
                    xtype: "textfield",
                    width: 80,
                    id: "bg_reserve_money_i_reserve2",
                    name: "bg_reserve_money_i_reserve2",
                    style: "text-align: center;font-weight:bold;background:#eee;",
                    readOnly: true,
                  },
                  {
                    xtype: "textfield",
                    fieldLabel: "วันที่สร้าง",
                    id: "d_create_reserve2",
                    name: "d_create_reserve2",
                    readOnly: true,
                    width: 100,
                  },
                  new Ext.form.ComboBox({
                    fieldLabel: "แหล่งเงิน : " + Ext.select_row.dc_budget_type_bg_id2 + " ",
                    id: "dc_budget_type_bg_id2",
                    name: "dc_budget_type_bg_id2",
                    mode: "local",
                    store: Ext.dc_expense_budget_type,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    width: 400,
                    listeners: {
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
                  new Ext.form.ComboBox({
                    fieldLabel: "รายการย่อย : " + Ext.select_row.bg_expense_bg_id2 + " ",
                    id: "bg_expense_bg_id2",
                    name: "bg_expense_bg_id2",
                    mode: "local",
                    store: Ext.bg_expense,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    width: 400,
                    listeners: {
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
                  {
                    xtype: "textfield",
                    id: "f_amt_reserve2",
                    name: "f_amt_reserve2",
                    fieldLabel: "จำนวนเงินbg2",
                    style: "text-align: right; bold;color: blue; font-weight: bold;",
                    width: 200,
                    listeners: {
                      afterrender: function () {
                        this.fn = function () {
                          let value = floatMinus(this.getValue().replace(/,/g, ""), 2);
                          this.setValue(floatRenderer(value));
                        };
                      },
                      Change: function (value) {
                        this.fn();
                      },
                    },
                  },
                  /*{
                    fieldLabel: "จำนวนการทักท้วง",
                    xtype: "textfield",
                    id: "i_protest",
                    name: "i_protest",
                    style: "text-align: center; font-weight: bold;",
                    width: 50,
                    listeners: {
                      afterrender: function () {
                        this.fn = function () {
                          let value = floatMinus(this.getValue().replace(/,/g, ""), 0);
                          value = value == "" ? "0" : value;
                          this.setValue(floatRenderer(value));
                        };
                      },
                      Change: function (value) {
                        this.fn();
                      },
                    },
                  },*/
                ],
              },
            ],
          },
          {
            xtype: "fieldset",
            title: "ข้อมูลการตัดเงิน ณ ตรวจรับ",
            // collapsible: true,
            hidden: Ext.select_row.c_booking == null && (Ext.select_row.i_sav_by_sys == 5 || Ext.select_row.i_sav_by_sys == 4) ? false : true,
            layout: "column",
            labelWidth: 140, // label settings here cascade unless overridden
            labelAlign: "right",
            items: [
              {
                // column 1
                columnWidth: 0.55,
                xtype: "fieldset",
                border: false,
                items: [
                  {
                    xtype: "buttongroup",
                    fieldLabel: "pr_id, po_id, chk_id",
                    frame: false,
                    border: false,
                    items: [
                      {
                        xtype: "textfield",
                        id: "dis_re_pr_id",
                        width: 80,
                        style: "text-align: center;font-weight:bold;background:#eee;",
                        readOnly: true,
                      },
                      {
                        xtype: "textfield",
                        id: "dis_re_po_id",
                        width: 80,
                        style: "text-align: center;font-weight:bold;background:#eee;",
                        readOnly: true,
                      },
                      {
                        xtype: "textfield",
                        id: "dis_re_chk_id",
                        width: 80,
                        style: "text-align: center;font-weight:bold;background:#eee;",
                        readOnly: true,
                      },
                    ],
                  },
                  {
                    fieldLabel: "แหล่งเงิน",
                    id: "dis_re_dc_expense_budget_type_name",
                    xtype: "textfield",
                    width: 400,
                    readOnly: true,
                    style: {
                      // "text-align": "center",
                      background: "#EEEEEE",
                      color: "#333",
                      border: "1px solid #ADADAD",
                    },
                  },
                  {
                    fieldLabel: "รายการย่อย",
                    id: "dis_re_bg_expense_name",
                    xtype: "textfield",
                    width: 400,
                    readOnly: true,
                    style: {
                      // "text-align": "center",
                      background: "#EEEEEE",
                      color: "#333",
                      border: "1px solid #ADADAD",
                    },
                  },
                  {
                    fieldLabel: "หน่วยงาน",
                    id: "dis_re_dc_cost_name",
                    xtype: "textfield",
                    width: 400,
                    readOnly: true,
                    style: {
                      // "text-align": "center",
                      background: "#EEEEEE",
                      color: "#333",
                      border: "1px solid #ADADAD",
                    },
                  },
                  {
                    fieldLabel: "จำนวนเงิน",
                    id: "dis_re_f_amt",
                    xtype: "textfield",
                    width: 150,
                    readOnly: true,
                    style: {
                      "text-align": "right",
                      "font-weight": "bold",
                      background: "#EEEEEE",
                      color: "#333",
                      border: "1px solid #ADADAD",
                    },
                  },
                ],
              },
              {
                // column 2
                columnWidth: 0.45,
                xtype: "fieldset",
                border: false,
                items: [
                  {
                    fieldLabel: "โดยระบบ",
                    id: "dis_re_sys_name",
                    xtype: "textfield",
                    width: 200,
                    hidden: true,
                    readOnly: true,
                    style: {
                      // "text-align": "center",
                      background: "#EEEEEE",
                      color: "#333",
                      border: "1px solid #ADADAD",
                    },
                  },
                ],
              },
            ],
          },
          {
            xtype: "fieldset",
            title: "ข้อมูลใบกันเงิน",
            // collapsible: true,
            hidden: Ext.select_row.c_booking == null ? true : false,
            layout: "column",
            labelWidth: 140, // label settings here cascade unless overridden
            labelAlign: "right",
            items: [
              {
                // column 1
                columnWidth: 0.55,
                xtype: "fieldset",
                border: false,
                items: [
                  {
                    fieldLabel: "bg_budget_dtl_overlap_id",
                    id: "dis_bg_budget_dtl_overlap_id",
                    xtype: "textfield",
                    width: 100,
                    readOnly: true,
                    style: {
                      "text-align": "center",
                      "font-weight": "bold",
                      background: "#EEEEEE",
                      color: "#333",
                      border: "1px solid #ADADAD",
                    },
                  },
                  {
                    fieldLabel: "เลขที่ใบกันเงิน",
                    id: "dis_c_code_ref",
                    xtype: "textfield",
                    width: 150,
                    readOnly: true,
                    style: {
                      "text-align": "center",
                      background: "#EEEEEE",
                      color: "#333",
                      border: "1px solid #ADADAD",
                    },
                  },
                  {
                    fieldLabel: "ปีงบประมาณ",
                    id: "dis_i_year",
                    xtype: "textfield",
                    width: 55,
                    readOnly: true,
                    style: {
                      "text-align": "center",
                      background: "#EEEEEE",
                      color: "#333",
                      border: "1px solid #ADADAD",
                    },
                  },
                  {
                    fieldLabel: "แหล่งเงิน",
                    id: "dis_dc_expense_budget_type_name",
                    xtype: "textfield",
                    width: 400,
                    readOnly: true,
                    style: {
                      background: "#EEEEEE",
                      color: "#333",
                      border: "1px solid #ADADAD",
                    },
                  },
                  {
                    fieldLabel: "รายการย่อย",
                    id: "dis_bg_expense_name",
                    xtype: "textfield",
                    width: 400,
                    readOnly: true,
                    style: {
                      background: "#EEEEEE",
                      color: "#333",
                      border: "1px solid #ADADAD",
                    },
                  },
                  {
                    fieldLabel: "หน่วยงาน",
                    id: "dis_dc_cost_name",
                    xtype: "textfield",
                    width: 400,
                    readOnly: true,
                    style: {
                      background: "#EEEEEE",
                      color: "#333",
                      border: "1px solid #ADADAD",
                    },
                  },
                  {
                    fieldLabel: "การก่อหนี้/เจ้าหนี้",
                    id: "dis_c_creditor",
                    xtype: "textfield",
                    width: 400,
                    readOnly: true,
                    style: {
                      background: "#EEEEEE",
                      color: "#333",
                      border: "1px solid #ADADAD",
                    },
                  },
                ],
              },
              {
                // column 2
                columnWidth: 0.45,
                xtype: "fieldset",
                border: false,
                items: [
                  {
                    fieldLabel: "จำนวนครั้งที่ขยาย",
                    id: "dis_i_extend_time",
                    xtype: "textfield",
                    width: 50,
                    readOnly: true,
                    style: "text-align: center;",
                    style: {
                      "text-align": "center",
                      background: "#EEEEEE",
                      color: "#333",
                      border: "1px solid #ADADAD",
                    },
                  },
                  {
                    fieldLabel: "วันที่สิ้นสุดใบกันเงิน",
                    xtype: "datefield",
                    id: "dis_d_end_date",
                    readOnly: true,
                    width: 100,
                    style: {
                      "text-align": "center",
                      background: "#EEEEEE",
                      color: "#333",
                      border: "1px solid #ADADAD",
                    },
                  },
                  {
                    xtype: "textfield",
                    id: "dis_f_overlap",
                    fieldLabel: "จำนวนเงินกัน",
                    readOnly: true,
                    width: 150,
                    style: {
                      "text-align": "right",
                      "font-weight": "bold",
                      background: "#EEEEEE",
                      border: "1px solid #ADADAD",
                    },
                  },
                  {
                    xtype: "textfield",
                    id: "dis_f_cancel",
                    fieldLabel: "จำนวนเงินกันที่ถูกยกเลิก",
                    readOnly: true,
                    style: {
                      "text-align": "right",
                      "font-weight": "bold",
                      background: "#EEEEEE",
                      color: "red",
                      border: "1px solid #ADADAD",
                    },
                    width: 150,
                  },
                  {
                    xtype: "textfield",
                    id: "dis_f_reserve",
                    fieldLabel: "จำนวนจองเงินกัน",
                    readOnly: true,
                    style: {
                      "text-align": "right",
                      "font-weight": "bold",
                      background: "#EEEEEE",
                      color: "red",
                      border: "1px solid #ADADAD",
                    },
                    width: 150,
                  },
                  {
                    xtype: "textfield",
                    id: "dis_f_working",
                    fieldLabel: "จำนวนเงินที่เบิก",
                    readOnly: true,
                    style: {
                      "text-align": "right",
                      "font-weight": "bold",
                      background: "#EEEEEE",
                      color: "red",
                      border: "1px solid #ADADAD",
                    },
                    width: 150,
                  },
                  {
                    xtype: "textfield",
                    id: "dis_f_total",
                    fieldLabel: "จำนวนเงินกันคงเหลือ",
                    readOnly: true,
                    style: {
                      "text-align": "right",
                      "font-weight": "bold",
                      background: "#EEEEEE",
                      color: "green",
                      border: "1px solid #ADADAD",
                    },
                    width: 150,
                  },
                ],
              },
            ],
          },
          {
            xtype: "fieldset",
            title: "ข้อมูลสถานะอื่น ๆ",
            // collapsible: true,
            layout: "column",
            labelWidth: 140, // label settings here cascade unless overridden
            labelAlign: "right",
            items: [
              {
                // column 1
                columnWidth: 0.55,
                xtype: "fieldset",
                border: false,
                items: [
                  // {
                  //   fieldLabel: "hdr_id",
                  //   xtype: "textfield",
                  //   style: "font-weight: bold;",
                  //   width: 100,
                  //   value: Ext.select_row.id,
                  //   readOnly: true,
                  //   style: {
                  //     "text-align": "center",
                  //     "font-weight": "bold",
                  //     background: "#EEEEEE",
                  //     border: "1px solid #ADADAD",
                  //   },
                  // },
                  // {
                  //   fieldLabel: "dlt_id",
                  //   xtype: "textfield",
                  //   style: "font-weight: bold;",
                  //   width: 100,
                  //   value: Ext.select_row.po_working_dtl_id,
                  //   readOnly: true,
                  //   style: {
                  //     "text-align": "center",
                  //     "font-weight": "bold",
                  //     background: "#EEEEEE",
                  //     border: "1px solid #ADADAD",
                  //   },
                  // },
                ],
              },
              {
                columnWidth: 0.45,
                xtype: "fieldset",
                border: false,
                items: [
                  // {
                  //   id: "filter_update",
                  //   xtype: "combo",
                  //   fieldLabel: "table_update",
                  //   width: 150,
                  //   mode: "local",
                  //   store: new Ext.data.SimpleStore({
                  //     fields: ["value", "text"],
                  //     data: [
                  //       ["all", "all"],
                  //       ["sp_tor_id", "sp_tor_id"],
                  //       ["sp_tor_dtl_id", "sp_tor_dtl_id"],
                  //       ["sp_tor_bidder_hdr_id", "sp_tor_bidder_hdr_id"],
                  //       ["sp_tor_bidder_dtl_id", "sp_tor_bidder_dtl_id"],
                  //       ["sp_tor_victory", "sp_tor_victory"],
                  //       ["bg_reserve_money_pr_id", "bg_reserve_money_pr_id"],
                  //       ["bg_reserve_money_po_id", "bg_reserve_money_po_id"],

                  //     ],
                  //   }),
                  //   value: "sp_tor_id",
                  //   valueField: "value",
                  //   displayField: "text",
                  //   allowBlank: false,
                  //   editable: false,
                  //   triggerAction: "all",
                  //   typeAhead: false,
                  // },
                  // // new Ext.ux.form.LovCombo({
                  // //   id: "table_updateID",
                  // //   fieldLabel: "table_update",
                  // //   width: 250,
                  // //   mode: "local",
                  // //   store: new Ext.data.SimpleStore({
                  // //     fields: ["id", "text"],
                  // //     data: [
                  // //       ["all", "all"],
                  // //       ["sp_tor_id", "sp_tor_id"],
                  // //       ["sp_tor_dtl_id", "sp_tor_dtl_id"],
                  // //       ["sp_tor_bidder_hdr_id", "sp_tor_bidder_hdr_id"],
                  // //       ["sp_tor_bidder_dtl_id", "sp_tor_bidder_dtl_id"],
                  // //       ["sp_tor_victory", "sp_tor_victory"],
                  // //       ["bg_reserve_money_pr_id", "bg_reserve_money_pr_id"],
                  // //       ["bg_reserve_money_po_id", "bg_reserve_money_po_id"],

                  // //     ],
                  // //   }),
                  // //   valueField: "id",
                  // //   displayField: "text",
                  // //   triggerAction: "all",
                  // //   forceSelection: true,
                  // //   selectOnFocus: true,
                  // //   typeAhead: false,
                  // //   emptyText: "กรุณาเลือก...",
                  // // }),
                  {
                    xtype: "hidden",
                    id: "hidden_table_updateID",
                    name: "table_updateID", // ใช้ชื่อเดียวกันกับฟิลด์ LovCombo
                  },
                  new Ext.ux.form.LovCombo({
                    id: "table_updateID",
                    fieldLabel: "table_update",
                    width: 250,
                    mode: "local",
                    store: new Ext.data.SimpleStore({
                      fields: ["id", "text"],
                      data: [
                        // ["all", "all"],
                        ["sp_tor_id", "sp_tor_id"],
                        ["sp_tor_dtl_id", "sp_tor_dtl_id"],
                        ["sp_tor_bidder_hdr_id", "sp_tor_bidder_hdr_id"],
                        ["sp_tor_bidder_dtl_id", "sp_tor_bidder_dtl_id"],
                        ["sp_tor_victory", "sp_tor_victory"],
                        ["bg_reserve_money_pr_id", "bg_reserve_money_pr_id"],
                        ["bg_reserve_money_po_id", "bg_reserve_money_po_id"],
                      ],
                    }),
                    valueField: "id",
                    displayField: "text",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    //   listeners: {
                    //     select: function (combo, record) {
                    //         // หากเลือก "all" ให้เลือกทั้งหมด
                    //         if (record.get("id") === "all") {
                    //             var allValues = [];
                    //             combo.getStore().each(function (rec) {
                    //                 if (rec.get("id") !== "all") {
                    //                     allValues.push(rec.get("id"));
                    //                 }
                    //             });

                    //             combo.setValue(allValues.join(","));
                    //         }
                    //     },
                    //     change: function (combo, newValue) {
                    //         // ดึงข้อมูลจาก Store ของรายการที่เลือก
                    //         var selectedIds = newValue ? newValue.split(",") : [];
                    //         var selectedData = [];

                    //         combo.getStore().each(function (rec) {
                    //             if (selectedIds.indexOf(rec.get("id")) !== -1) {
                    //                 selectedData.push({
                    //                     id: rec.get("id"),
                    //                     text: rec.get("text"),
                    //                 });
                    //             }
                    //         });

                    //         // ตรวจสอบข้อมูลที่จะส่ง
                    //         console.log("ข้อมูลที่ถูกเลือก:", selectedData);

                    //         // ส่งข้อมูลไปยัง backend
                    //         Ext.Ajax.request({
                    //             url: "your_backend_url.php", // URL สำหรับส่งข้อมูล
                    //             method: "POST",
                    //             params: {
                    //                 table_updateID: Ext.encode(selectedData), // ส่งข้อมูลในรูปแบบ JSON
                    //             },
                    //             success: function (response) {
                    //                 Ext.Msg.alert("สำเร็จ", "ข้อมูลถูกส่งสำเร็จ!");
                    //             },
                    //             failure: function (response) {
                    //                 Ext.Msg.alert("ล้มเหลว", "ไม่สามารถส่งข้อมูลได้!");
                    //             },
                    //         });
                    //     }
                    // }
                  }),

                  {
                    xtype: "radiogroup",
                    /*ss*/
                    columns: [100, 200],
                    id: "i_enable",
                    fieldLabel: "สถานะการใช้งาน",
                    items: [
                      {
                        name: "i_enable",
                        inputValue: 1,
                        checked: true,
                        boxLabel: "ใช้งาน",
                      },
                      {
                        name: "i_enable",
                        inputValue: 2,
                        boxLabel: "ยกเลิก",
                      },
                    ],
                    listeners: {
                      change: function (cb, rec, ind) {},
                      afterrender: function (obj, eOpts) {},
                    },
                  },
                  {
                    xtype: "buttongroup",
                    frame: false,
                    items: [
                      { xtype: "tbspacer", width: 330 },
                      // { xtype: "label", text: "ลบรายการ : " },
                      {
                        iconCls: "icon-delete",
                        xtype: "button",
                        // scale: "medium",
                        text: "&nbsp;ลบใบขอเบิก&nbsp;",
                        handler: function () {
                          deleteHdr();
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        buttonAlign: "left",
        buttons: [
          {
            text: "&nbsp;" + Ext.GLOBAL_BU_SAVE_TH + "&nbsp;",
            id: "saveHdr",
            iconCls: "icon-save",
            disabled: Ext.butt == "add" || Ext.butt == "edit" ? false : true,
            handler: function () {
              saveHdr(false);
            },
          },
          {
            text: Ext.GLOBAL_BU_BACK_TH,
            handler: function () {
              Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not errer
            },
          },
        ],
        // }),
      },
    ],
  });
}; // formAdd
Ext.extend(formAdd, Ext.Panel, {});
