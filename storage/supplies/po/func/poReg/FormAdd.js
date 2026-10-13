Ext.HDR_ID = null;

Ext.txt_save = "รับคืนทักท้วง";
const saveHdr = function (type_save) {
  var mode = Ext.butt == "add" ? "ADD" : Ext.getCmp("modesubID").getValue().inputValue;
  let msg = "";
  let jsonArr = [];

  let chk = false;
  // console.log(document.getElementById("sum_debt_label").innerHTML);
  // return false ;
  Ext.getCmp("gridAcc").store.data.items.forEach(function (v) {
    if (v.data.dc_acc_id == "") {
      chk = true;
    }
  });
  if (chk == true) {
    msg += "<span style='white-space: nowrap;'>- กรุณากรอกข้อมูลตั้งหนี้ให้ครบ</span><br>";
  }
  var sum_begin_inv = sum_begin_item("f_inv");
  var sum_begin_inv = [null, undefined, NaN, "", "0", ".00", false].includes(sum_begin_inv) ? "0.00" : sum_begin_inv;
  var f_inv_dtl = [null, undefined, NaN, "", "0", ".00", false].includes(Ext.getCmp("f_inv").getValue()) ? "0.00" : Ext.getCmp("f_inv").getValue();

  if (f_inv_dtl != "0.00" || sum_begin_inv != "0.00") {
    if (sum_begin_item("f_inv") != Ext.getCmp("f_inv").getValue()) {
      msg += "<span style='white-space: nowrap;'>- จำนวนเงิน (ก่อน vat)ไม่ตรงกับข้อมูลตั้งหนี้</span><br>";
    }
  }
  var sum_begin_vat = sum_begin_item("f_vat");
  var sum_begin_vat = [null, undefined, NaN, "", "0", ".00", false].includes(sum_begin_vat) ? "0.00" : sum_begin_vat;
  var f_vat_dtl = [null, undefined, NaN, "", "0", ".00", false].includes(Ext.getCmp("f_vat").getValue()) ? "0.00" : Ext.getCmp("f_vat").getValue();

  if (f_vat_dtl != "0.00" || sum_begin_vat != "0.00") {
    if (sum_begin_item("f_vat") != Ext.getCmp("f_vat").getValue()) {
      msg += "<span style='white-space: nowrap;'>- จำนวนเงิน (vat)ไม่ตรงกับข้อมูลตั้งหนี้</span><br>";
    }
  }

  if (Ext.getCmp("c_heading").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณากรอกเรื่อง/โครงการ</span><br>";
  }
  if (Ext.getCmp("c_commentID").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณากรอกคำอธิบายรายการ</span><br>";
  }

  if (Ext.getCmp("form-widgets").getForm().isValid() == false) {
    msg += "<span style='white-space: nowrap;'>- กรุณากรอกข้อมูลให้ครบ</span><br>";
  }
  if (![10].includes(Ext.getCmp("i_working_type").getValue())) {
    if (!(Ext.po_working_begin_item.data.length > 0)) {
      msg += "<span style='white-space: nowrap;'>- กรุณากรอกรายการในตาราง</span><br>";
    }
  }
  if (Ext.INSIDE_COST == true) {
    if (Ext.getCmp("dc_approve_id").getValue() == "") {
      msg += "<span style='white-space: nowrap;'>- กรุณาระบุผู้ตรวจสอบ</span><br>";
    }
  }
  if ([2].includes(Ext.getCmp("i_working_type").getValue())) {
    if (Ext.getCmp("i_type_transfer").getValue().inputValue != 2) {
      if (["0", 0, null, undefined].includes(Ext.getCmp("dc_bank_acc_creditor_id").getValue())) {
        msg += "<span style='white-space: nowrap;'>- กรุณาระบุบัญชีธนาคาร</span><br>";
        msg += "<span style='white-space: nowrap; color: red'>*(หากในระบบไม่มีข้อมูลบัญชีธนาคาร กรุณาแจ้งเจ้าหน้าที่ฝ่ายการคลัง)</span><br>";
      }
    }
  }

  if (Ext.getCmp("f_inv_vat").getValue() != document.getElementById("sum_debt_label").innerHTML) {
    msg += "<span style='white-space: nowrap;'>- จำนวนเงินไม่ตรงกับข้อมูลตั้งหนี้</span><br>";
  }
  if (Ext.I_SUB_STATUS == "0.30" && Ext.HDR_ID == null) {
    if (Ext.getCmp("i_working_type").getValue() == 4 && !Ext.getCmp("fi_br_hdr_id").getValue()) {
      msg += "<span style='white-space: nowrap;'>- กรุณาดึงข้อมูลจากระบบเงินยืม</span><br>";
    }
  }

  if (Ext.getCmp("i_working_type").getValue() != 4 && [9439, 10415, 10417, 10418, 10419, 10420, 10421].includes(parseInt(Ext.getCmp("dc_creditor_idID").getValue()))) {
    msg += "<span style='white-space: nowrap;'>- หากต้องการเลือก จ่ายให้:เงินยืม กรุณาเลือก (F : ชดใช้เงินยืม)</span><br>";
  }

  if (Ext.getCmp("i_working_type").getValue() == 2 && ["50", "82"].includes(Ext.getCmp("dc_cost_idID").getValue()) && (Ext.getCmp("sp_sbill_hdr_id").getValue() ? "1" : "0") == "0") {
    msg += "<span style='white-space: nowrap;'>- กรุณาระบุรายการใบแจ้งหนี้</span><br>";
  }

  var currentDate = new Date();
  // Remove the time part of currentDate for date-only comparison
  currentDate.setHours(0, 0, 0, 0);
  if (Ext.getCmp("d_audit_date").getValue() > currentDate) {
    msg += "<span style='white-space: nowrap;'>- กรุณาระบุวันที่เกิดค่าใช่จ่าย/วันที่ตรวจรับ ไม่เกินวันที่ปัจจุบัน</span><br>";
  }

  let file2 = Ext.get("upload_pdf2-file").dom.files[0];
  let parts2 = null;
  if (file2 != undefined) {
    try {
      parts2 = file2.name.split(".");
    } catch (err) {}
    if (file2 == "" || file2 == undefined) {
      msg += "<span style='white-space: nowrap;'>- กรุณาเลือกไฟล์ที่ต้องการ</span><br>";
    } else if (parts2[parts2.length - 1] != "pdf") {
      if (parts2[parts2.length - 1] != "PDF") {
        msg += "<span style='white-space: nowrap;'>- กรุณาเลือกไฟล์ (.pdf)</span><br>";
      }
    } else if (file2.size > 512000000) {
      msg += "<span style='white-space: nowrap;'>- กรุณาเลือก ไฟล์ PDF ขนาดไม่เกิน 500,000 (KB)</span><br>";
    }
  } else {
    if (mode == "ADD") {
      msg += "<span style='white-space: nowrap;'>- กรุณานำเข้าข้อมูลเอกสารประกอบใบเบิก (.pdf)</span><br>";
    } else {
      if (Ext.getCmp("i_edit_pdf2IDs1").getValue() == true) {
        msg += "<span style='white-space: nowrap;'>- กรุณานำเข้าข้อมูลเอกสารประกอบใบเบิก (.pdf)</span><br>";
      }
    }
  }

  if (msg == "") {
    var submitData = function (type) {
      let jsonArr = [];
      let sto = Ext.getCmp("gridAcc").store.data.items;
      let chk = false;

      sto.forEach(function (v) {
        if (v.data.dc_acc_id == "") {
          chk = true;
        }
        jsonArr.push({
          id: v.data.id,
          c_month: v.data.c_month,
          dc_acc_id: v.data.dc_acc_id,
          f_inv: v.data.f_inv ? v.data.f_inv.replace(/,/g, "") : "",
          f_vat: v.data.f_vat ? v.data.f_vat.replace(/,/g, "") : "",
          f_inv_vat: v.data.f_inv_vat ? v.data.f_inv_vat.replace(/,/g, "") : "",
        });
      });

      var mode = Ext.butt == "add" ? "ADD" : Ext.getCmp("modesubID").getValue().inputValue;
      var pdf_hdr = mode == "ADD" ? Ext.DateNow + "/" + Ext.HDR_ID + "_" + Ext.I_SUB_STATUS.replace(/\./g, "@") + "_hdr.pdf" : Ext.pdf_hdr;
      var pdf_dtl = mode == "ADD" ? Ext.DateNow + "/" + Ext.HDR_ID + "_" + Ext.I_SUB_STATUS.replace(/\./g, "@") + "_dtl.pdf" : Ext.pdf_dtl;
      Ext.Msg.wait("Uploading...");
      // Ext.store.load({ params: { mode: "" } });
      Ext.getCmp("form-widgets")
        .getForm()
        .submit({
          standardSubmit: true,
          url: "api/mn_poReg.php",
          params: {
            mode: mode,
            type_save: type_save == "EDIT" ? "WORKINT_EDIT" : "WORKINT_SAVE",
            id: Ext.HDR_ID,
            po_working_begin_hdr_id: Ext.getCmp("modesubID").getValue().inputValue == "ADD" && Ext.butt == "edit" ? 0 : Ext.getCmp("po_working_begin_hdr_id").getValue(),
            bg_request_money_income_id: Ext.getCmp("modesubID").getValue().inputValue == "ADD" ? 0 : Ext.butt == "add" ? 0 : Ext.dataSelect.bg_request_money_income_id,
            i_working_type: Ext.getCmp("i_working_type").getValue(),
            i_sub_status: Ext.getCmp("modesubID").getValue().inputValue == "SEND" ? "0.30" : "0.30",
            po_working_pay_item: JSON.stringify(data_items_dtl_1),

            /** test add **/
            // mode: "ADD",
            // id: Ext.HDR_ID,
            // po_working_begin_hdr_id: 0,
            // bg_request_money_income_id: 0,
            // i_working_type: Ext.getCmp("i_working_type").getValue(),
            // i_purchase: Ext.getCmp("i_purchase").getValue(),
            // i_sub_status: "0.30",

            i_status: 0,
            pdf_hdr: pdf_hdr,
            pdf_dtl: pdf_dtl,
            i_PdfUp2: Ext.getCmp("i_edit_pdf2IDs1").getValue(),
            data: JSON.stringify(jsonArr),
          },
          success: function (form, action) {
            if (error_json(action.response.responseText, action.options.params)) return;
            let jsonData = action.result; //decode json
            if (jsonData.success == true) {
              Ext.dc_cost.load({ params: { dc_cost_acc_id: Ext.getCmp("dc_cost_acc_id").getValue() } });
              Ext.dc_expense_budget_type.load({ params: { dc_cost_acc_id: Ext.getCmp("dc_cost_acc_id").getValue() } });
              if (jsonData.request_money) {
                Ext.Msg.alert(
                  "แจ้งเตือน",
                  "<span style='white-space: nowrap;'>จำนวนเงินไม่เพียงพอ กรุณาส่งใบขอเบิกอีกครั้งในภายหลัง</span>",
                  function (btn, text) {
                    if (btn == "ok" || btn == "cancel") {
                      Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not errer
                      chkLoadingStore(Ext.myComboStores, "contenterCenter", function () {});
                      Ext.po_creditor_transfer.load();
                      Ext.po_creditor.load();
                      Ext.po_emp.load();
                      Ext.store.load();
                    }
                  },
                  this,
                  false
                );
              } else {
                if (jsonData.c_code_ref) {
                  var win = new Ext.Window({
                    id: "MessageBox_re",
                    title: "ใบขอเบิก ",
                    modal: true,
                    closable: false,
                    maximizable: false,
                    resizable: false,
                    width: 310,
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
                            xtype: "container",
                            layout: {
                              type: "hbox",
                              pack: "center",
                              align: "middle",
                            },
                            items: [
                              {
                                xtype: "label",
                                text: "เลขที่ใบขอเบิก",
                                style: "font-weight: bold; font-size: 12px;",
                              },
                            ],
                          },
                          {
                            xtype: "textfield",
                            id: "c_code_show",
                            style: "font-weight:bold;background:#eee; text-align: center;",
                            value: jsonData.c_code_ref,
                            readOnly: true,
                          },
                          {
                            xtype: "button",
                            id: "btn_overlap_dl",
                            fieldLabel: "",
                            text: "<img src='../images/icons/page_white_acrobat.png' style='margin-right:1px;' /><span id='btn_overlap_dl'>ใบขอเบิก</span>",
                            handler: function () {
                              // window.open("../bg/pdf/PDF_PoOverlapReg.php/เอกสารขอกันเงิน.pdf" + "?id=" + Ext.Text_Encode(Ext.HDR_ID), "ใบขอกันเงินเหลื่อมปี 5 ก ");
                              // window.focus();
                              Po_OpenPdf(jsonData.pdf_hdr, jsonData.c_code_ref);
                            },
                          },
                        ],
                      },
                    ],
                    buttonAlign: "right",
                    buttons: [
                      { xtype: "tbfill" },
                      {
                        text: "ตกลง",
                        handler: function () {
                          Ext.getCmp("MessageBox_re").hide();
                          Ext.getCmp("MessageBox_re").destroy();
                          Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not errer
                          Ext.Msg.hide();
                        },
                      },
                    ],
                  }).show();
                } else {
                  Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not errer
                  Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + jsonData.msg + "</span>");
                }
                chkLoadingStore(Ext.myComboStores, "contenterCenter", function () {});
                Ext.po_creditor_transfer.load();
                Ext.po_creditor.load();
                Ext.po_emp.load();
                Ext.store.load();
              }
            } else {
              Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap; color:red;' >" + jsonData.msg + "</span>");
            }
          },
          failure: function (form, action) {
            if (error_json(action.response.responseText, action.options.params)) return;
            let jsonData = action.result; //decode json
            Ext.MessageBox.alert("Failed", "<span style='white-space: nowrap;'>ผิดผลาด</span>");
          },
        });
    };
    if (Ext.getCmp("modesubID").getValue().inputValue == "SEND") {
      var text = "<span style='white-space: nowrap;'>ยืนยันการส่งใบเบิก ?</span><br>";
      text += "<span style='white-space: nowrap; color:red;'>(คุณจะไม่สามารถแก้ไขรายการนี้ได้อีก)</span>";
      Ext.Msg.confirm("ยืนยันการส่งใบเบิก", text, function (btn) {
        if (btn == "yes") {
          if (1 == 1) {
            Ext.Msg.wait("กำลังตรวจสอบ...");
            if (!["5", "6", "8", "9", "10"].includes(String(Ext.getCmp("i_working_type").getValue()))) {
              if (Ext.getCmp("i_budget_year").getValue() == Ext.getCmp("i_budget_year_overlap").getValue()) {
                if (Ext.getCmp("i_working_type").getValue() == 3 && Ext.getCmp("bg_expense_id").getValue() == 4) {
                  submitData();
                  // Ext.bg_expense_one_4.load({
                  //   params: {
                  //     i_year: Ext.getCmp("i_budget_year_overlap").getValue(),
                  //     dc_cost_acc_id: Ext.getCmp("dc_cost_acc_id").getValue(),
                  //     dc_expense_budget_type_id: Ext.getCmp("dc_expense_budget_type_id").getValue(),
                  //   },
                  //   callback: function (records, operation, success) {
                  //     Ext.Msg.hide();
                  //     var bg_expense_money = Ext.bg_expense_one_4.getAt(0);
                  //     if (bg_expense_money) {
                  //       if (parseFloat(bg_expense_money.data.f_sum) >= parseFloat(Ext.getCmp("f_total").getValue().replace(/,/g, ""))) {
                  //         // Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap; color:green;'>จำนวนเงินเพียงพอ</span>");
                  //         submitData();
                  //       } else {
                  //         Ext.Msg.alert(
                  //           "แจ้งเตือน",
                  //           `<span style='white-space:nowrap; color:red;'>** จำนวนเงินอนุมัติไม่เพียงพอ **</span><br><br>
                  //           <span style='white-space:nowrap; color:red; font-size:9.5px;'>จำนวนเงินคงเหลือ : ` +
                  //             floatRenderer(floatMinus(bg_expense_money.data.f_sum, 2)) +
                  //             `</span><br>
                  //           <span style='white-space:nowrap; color:red; font-size:9.5px;'>จำนวนเงินขอเบิก : ` +
                  //             floatRenderer(floatMinus(Ext.getCmp("f_total").getValue().replace(/,/g, ""), 2)) +
                  //             `</span>
                  //           `
                  //         );
                  //       }
                  //     } else {
                  //       Ext.Msg.alert("แจ้งเตือน", `<span style='white-space:nowrap; color:red;'>จำนวนเงินอนุมัติไม่เพียงพอ</span>`);
                  //     }
                  //   },
                  // });
                } else {
                  /**ตรวจสอบเงินงบประมาณเงินที่ได้รับจริง คงเหลื่อ**/
                  Ext.bg_expense_pop_one.load({
                    params: {
                      i_have: 1,
                      bg_expense_id: Ext.getCmp("bg_expense_id").getValue(),
                      i_budget_year: Ext.getCmp("i_budget_year").getValue(),
                      dc_expense_budget_type_id: Ext.getCmp("dc_expense_budget_type_id").getValue(),
                      dc_cost_acc_id: Ext.getCmp("dc_cost_acc_id").getValue(),
                      dc_cost_id: Ext.getCmp("dc_cost_idID").getValue(),
                      i_working_type: Ext.getCmp("i_working_type").getValue(),
                    },
                    callback: function (records, operation, success) {
                      Ext.Msg.hide();
                      var bg_expense_money = Ext.bg_expense_pop_one.getAt(0);
                      if (bg_expense_money) {
                        if (parseFloat(bg_expense_money.data.f_income_total) >= parseFloat(Ext.getCmp("f_total").getValue().replace(/,/g, ""))) {
                          // Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap; color:green;'>จำนวนเงินเพียงพอ</span>");
                          submitData();
                        } else {
                          Ext.Msg.alert(
                            "แจ้งเตือน",
                            `<span style='white-space:nowrap; color:red;'>** จำนวนเงินไม่เพียงพอ **</span><br><br>
                            <span style='white-space:nowrap; color:red; font-size:9.5px;'>จำนวนเงินคงเหลือ : ` +
                              floatRenderer(floatMinus(bg_expense_money.data.f_income_total, 2)) +
                              `</span><br>
                            <span style='white-space:nowrap; color:red; font-size:9.5px;'>จำนวนเงินขอเบิก : ` +
                              floatRenderer(floatMinus(Ext.getCmp("f_total").getValue().replace(/,/g, ""), 2)) +
                              `</span>
                            `
                          );
                        }
                      } else {
                        Ext.Msg.alert("แจ้งเตือน", `<span style='white-space:nowrap; color:red;'>จำนวนเงินไม่เพียงพอ</span>`);
                      }
                    },
                  });
                }
              } else {
                if (!["1", "2", "3"].includes(String(Ext.getCmp("i_sys").getValue()))) {
                  /**ตรวจสอบใบกันเงินเหลื่อมปี คงเหลือ**/
                  Ext.booking_store_one.load({
                    params: {
                      dc_cost_acc_id: Ext.getCmp("dc_cost_acc_id").getValue(),
                      dc_cost_id: Ext.getCmp("dc_cost_idID").getValue(),
                      c_booking: Ext.getCmp("c_bookingID").lastSelectionText,
                    },
                    callback: function (records, operation, success) {
                      Ext.Msg.hide();
                      var booking_money = Ext.booking_store_one.getAt(0);
                      console.log(parseFloat(booking_money.data.f_total));
                      if (booking_money) {
                        if (parseFloat(booking_money.data.f_total) >= parseFloat(Ext.getCmp("f_total").getValue().replace(/,/g, ""))) {
                          // Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap; color:green;'>** จำนวนเงินเพียงพอ **</span>");
                          if (booking_money.data.i_dont_start == 1) {
                            Ext.Msg.alert(
                              "แจ้งเตือน",
                              `<span style='white-space:nowrap; color:red; font-size:9.5px;'>เลขที่ใบกันเงิน : ` +
                                booking_money.data.c_booking +
                                `</span><br>
                              <span style='white-space:nowrap; color:red; font-size:9.5px;'>จะสามารถใช้ได้ตั้งแต่วันที่  ` +
                                shortThaiDate(booking_money.data.d_start_date) +
                                `</span><br>`
                            );
                          } else {
                            submitData();
                          }
                        } else {
                          Ext.Msg.alert(
                            "แจ้งเตือน",
                            `<span style='white-space:nowrap; color:red;'>** จำนวนเงินไม่เพียงพอ **</span><br><br>
                            <span style='white-space:nowrap; color:red; font-size:9.5px;'>เลขที่ใบกันเงิน : ` +
                              booking_money.data.c_booking +
                              `</span><br>
                            <span style='white-space:nowrap; color:red; font-size:9.5px;'>จำนวนเงินใบกันคงเหลือ : ` +
                              floatRenderer(floatMinus(booking_money.data.f_total, 2)) +
                              `</span><br>
                            <span style='white-space:nowrap; color:red; font-size:9.5px;'>จำนวนเงินขอเบิก : ` +
                              floatRenderer(floatMinus(Ext.getCmp("f_total").getValue().replace(/,/g, ""), 2)) +
                              `</span>
                            `
                          );
                        }
                      } else {
                        Ext.Msg.alert("แจ้งเตือน", `<span style='white-space:nowrap; color:red;'>จำนวนเงินไม่เพียงพอ</span>`);
                      }
                    },
                  });
                } else {
                  Ext.Msg.hide();
                  submitData();
                }
              }
            } else if (Ext.getCmp("i_working_type").getValue() == "6") {
              Ext.money_working_type_a.load({
                params: {
                  i_budget_year: Ext.getCmp("i_budget_year").getValue(),
                  dc_cost_acc_id: Ext.getCmp("dc_cost_acc_id").getValue(),
                },
                callback: function (records, operation, success) {
                  if (records[0]) {
                    if (parseFloat(Ext.getCmp("f_total").getValue().replace(/,/g, "")) <= parseFloat(records[0].data.f_money_working_type_a)) {
                      submitData();
                    } else {
                      Ext.Msg.alert(
                        "แจ้งเตือน",
                        `<span style='white-space:nowrap; color:red;'>** จำนวนเงินทดรองไม่เพียงพอ **</span><br><br>
                        <span style='white-space:nowrap; color:red; font-size:9.5px;'>จำนวนเงินทดรองคงเหลือ : ` +
                          floatRenderer(floatMinus(records[0].data.f_money_working_type_a, 2)) +
                          `</span><br>
                        <span style='white-space:nowrap; color:red; font-size:9.5px;'>จำนวนเงินขอเบิก : ` +
                          floatRenderer(floatMinus(Ext.getCmp("f_total").getValue().replace(/,/g, ""), 2)) +
                          `</span>
                        `
                      );
                    }
                  } else {
                    Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap; color:red;'>จำนวนเงินทดรองไม่เพียงพอ</span>");
                  }
                },
              });
            } else {
              Ext.Msg.hide();
              submitData();
            }
          } else {
            Ext.Msg.hide();
            submitData();
          }
        }
      });
    } else {
      submitData();
    }
  } else {
    Ext.Msg.alert("แจ้งเตือน", msg);
  }
}; // saveHdr

const select_acc_loop = function (record) {
  Ext.po_working_begin_item.removeAll();
  var arr_dc_acc = [];
  for (let i = 1; i <= 10; i++) {
    var dc_acc_id = `dc_acc_id${i}`;
    var c_acc_month = `c_acc_month${i}`;
    var f_acc_inv = `f_acc_inv${i}`;
    var f_acc_vat = `f_acc_vat${i}`;
    var f_acc_inv_vat = `f_acc_inv_vat${i}`;
    var arr_acc_data = [record.data[dc_acc_id], record.data[c_acc_month], record.data[f_acc_inv], record.data[f_acc_vat], record.data[f_acc_inv_vat]];
    console.log(record.data[dc_acc_id]);
    if (record.data[dc_acc_id]) arr_dc_acc.push(arr_acc_data);
  }
  // console.log(arr_dc_acc);
  if (arr_dc_acc.length == 1) {
    setTimeout(() => {
      var myNewRecord = new po_working_begin_item_Record({
        id: "",
        c_month: Ext.getCmp("c_debt_month").getValue(),
        dc_acc_id: String(arr_dc_acc[0][0]),
        f_inv: Ext.getCmp("f_inv").getValue(),
        f_vat: Ext.getCmp("f_vat").getValue(),
        f_inv_vat: Ext.getCmp("f_inv_vat").getValue(),
        c_comment: "",
      });
      Ext.po_working_begin_item.add(myNewRecord);
      sum_debt_label();
    }, 250);
  } else {
    arr_dc_acc.forEach((dc_acc) => {
      var myNewRecord = new po_working_begin_item_Record({
        id: "",
        c_month: String(dc_acc[1]) ? String(dc_acc[1]) : Ext.getCmp("c_debt_month").getValue(),
        dc_acc_id: dc_acc[0] == null ? null : String(dc_acc[0]),
        f_inv: dc_acc[2] == null ? null : String(dc_acc[2]),
        f_vat: dc_acc[3] == null ? null : String(dc_acc[3]),
        f_inv_vat: dc_acc[4] == null ? null : String(dc_acc[4]),
        c_comment: "",
      });
      Ext.po_working_begin_item.add(myNewRecord);
      sum_debt_label();
    });
  }
};
const show_sp_sbill_item = function (sp_sbill_hdr_id) {
  var index = Ext.sp_sbill_pop.findExact("id", String(sp_sbill_hdr_id));
  var record = Ext.sp_sbill_pop.getAt(index);
  new Ext.Window({
    title: "เลขที่สัญญา " + record.data.c_contract_code,
    id: "win-pop",
    layout: "fit",
    modal: true,
    border: false,
    items: [
      new Ext.grid.GridPanel({
        region: "center",
        width: 600,
        height: 200,
        layout: "fit",
        border: true,
        stripeRows: true,
        loadMask: true,
        clicksToEdit: 1,
        store: Ext.sp_sbill_pop_item,
        viewConfig: {
          emptyText: "ไม่มีข้อมูล..",
          deferEmptyText: false,
        },
        listeners: {
          afterrender: function () {
            Ext.sp_sbill_pop_item.load({ params: { sp_sbill_hdr_id: record.data.id } });
          },
        },
        columns: [
          new Ext.grid.RowNumberer(),
          // {
          //   header: "เลขที่ใบแจ้งหนี้ / วางบิล",
          //   align: "center",
          //   width: 160,
          //   dataIndex: "c_doc_result_ref",
          // },
          {
            header: "เลขที่ใบส่งของ/ใบแจ้งหนี้",
            align: "center",
            width: 160,
            dataIndex: "c_doc_ref",
          },
          {
            header: "วันที่เอกสาร",
            sortable: false,
            align: "center",
            dataIndex: "d_doc_date",
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.css = "cell-edit";
              return value != "" && value != null ? shortThaiDate(value) : "";
            },
          },
          {
            header: "จำนวนเงิน (รวม Vat)",
            align: "center",
            width: 120,
            dataIndex: "f_period_amt",
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = 'style="color: blue; text-align: right;"';
              return floatRenderer(floatMinus(value, 2));
            },
          },
          { width: 20, dataIndex: "" },
        ],
      }),
    ],
  }).show();
};

formAdd = function (args) {
  formAdd.superclass.constructor.call(this, {
    region: "center",
    title: "ข้อมูลใบขอเบิก",
    iconCls: "icon-application-form-add",
    id: "frm-Add",
    border: false,
    stripeRows: true,
    loadMask: true,
    listeners: {
      afterrender: function (obj, eOpts) {},
    },
    items: [
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
          {
            xtype: "container",
            layout: "hbox",
            align: "stretch",
            id: "group_input_box_1",
            RemoveHeight: true,
            labelWidth: 180,
            width: 680,
            defaults: { xtype: "fieldset", flex: 1, margins: "0px 3px", autoHeight: true },
            items: [
              {
                title: "",
                RemoveCls: "x-box-item",
                collapsible: false,
                collapsed: false,
                items: [
                  new Ext.form.ComboBox({
                    fieldLabel: "ส่วนงาน",
                    id: "dc_cost_acc_id",
                    hiddenName: "dc_cost_acc_id",
                    mode: "local",
                    store: Ext.dc_cost_sys_main,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    allowBlank: false,
                    emptyText: "กรุณาเลือก...",
                    value: Ext.dc_cost_acc_default,
                    width: 300,
                    listeners: {
                      afterrender: function (combo) {
                        this.ReadOnly_set = function (set) {
                          this.setReadOnly(set);
                          this.getEl().dom.style.background = set ? "#EEEEEE" : "";
                        };
                        this.fn = function () {};
                        this.change_set = function () {
                          var c_ = Ext.getCmp("dc_cost_acc_id").getValue() == "77" ? "77" : "99";
                          var i_working_type = Ext.getCmp("i_working_type").getValue();
                          var c_type_select = "";
                          var c_select = "";
                          if (["1", "2"].includes(i_working_type)) {
                            c_type_select = "_ss_" + c_;
                            c_select = "ระบบจัดซื้อจัดจ้าง" + (c_ == "77" ? " (คณะแพทย์ศาสตร์ชิรพยาบาล)" : " (สำนักงานอธิการบดี)");
                          } else if (["4"].includes(i_working_type)) {
                            c_ = "99";
                            c_type_select = "_bb_" + c_;
                            c_select = "ระบบเงืนยืม";
                          } else if (["5"].includes(i_working_type)) {
                            c_ = "99";
                            c_type_select = "_ee_" + c_;
                            c_select = "ระบบเงืนยืม";
                          }
                          Ext.getCmp("i_select_data").setValue(false);
                          Ext.getCmp("pop_select_dataID_ss_77").hide();
                          Ext.getCmp("pop_select_dataID_ss_99").hide();
                          Ext.getCmp("pop_select_dataID_bb_99").hide();
                          Ext.getCmp("pop_select_dataID_ee_99").hide();
                          Ext.getCmp("pop_select_dataID_wm").hide();
                          Ext.getCmp("pop_select_dataID_wt").hide();
                          if (c_type_select != "") {
                            Ext.getCmp("i_select_data").show();
                            var idEl = Ext.getCmp("i_select_data").getEl().dom.nextSibling.id;
                            document.getElementById(idEl).innerHTML = "ดึงข้อมูลจาก" + c_select;
                          } else {
                            Ext.getCmp("i_select_data").hide();
                          }
                        };
                      },
                      select: function () {
                        this.change_set();
                      },
                      Change: function () {
                        this.change_set();
                        Ext.dc_cost.load({ params: { dc_cost_acc_id: this.value } });
                        Ext.dc_expense_budget_type.load({ params: { dc_cost_acc_id: this.value } });
                        Ext.dc_user_approve.load({ params: { dc_cost_acc_id: this.value } });
                        Ext.getCmp("dc_cost_idID").setValue("");
                        Ext.getCmp("dc_expense_budget_type_id").setValue("");
                        Ext.getCmp("dc_approve_id").setValue("");
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
                  new Ext.form.ComboBox({
                    mode: "local",
                    store: Ext.dc_cost,
                    // readOnly: true,
                    allowBlank: false,
                    width: 300,
                    fieldLabel: "หน่วยงาน",
                    valueField: "id",
                    displayField: "c_name",
                    id: "dc_cost_idID",
                    hiddenName: "dc_cost_id",
                    name: "c_cost_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    listeners: {
                      afterRender: function () {
                        this.ReadOnly_set = function (set) {
                          this.setReadOnly(set);
                          this.getEl().dom.style.background = set ? "#EEEEEE" : "";
                        };
                        this.change_set = function () {
                          if (Ext.getCmp("i_budget_year").getValue() > Ext.getCmp("i_budget_year_overlap").getValue()) {
                            Ext.booking_store.load({
                              params: {
                                i_budget_year_overlap: Ext.getCmp("i_budget_year_overlap").getValue(),
                                dc_cost_acc_id: Ext.getCmp("dc_cost_acc_id").getValue(),
                                dc_cost_id: Ext.getCmp("dc_cost_idID").getValue(),
                                in_id: Ext.I_SUB_STATUS_BEFORE == "3.00" ? Ext.dataSelect.id : 0,
                              },
                            });
                          }
                          Ext.getCmp("bg_expense_id").setValue("");
                          Ext.getCmp("c_bookingID").setValue("");
                          Ext.getCmp("dc_expense_budget_type_id").setValue("");

                          var i_budget_year = Ext.getCmp("i_budget_year").getValue();
                          var dc_expense_budget_type_id = Ext.getCmp("dc_expense_budget_type_id").getValue();
                          var bg_expense_id = Ext.getCmp("bg_expense_id").getValue();
                          load_f_income_total(i_budget_year, dc_expense_budget_type_id, bg_expense_id, dc_cost_idID);
                        };
                      },
                      change: function (combo, newValue) {
                        this.change_set();
                        // if (newValue == "" && Ext.SS_I_TYPE_USER == 3) {
                        //   Ext.getCmp("dc_cost_idID").setValue(Ext.SS_DC_COST_ID);
                        //   Ext.getCmp("dc_cost_idID").readOnly = true;
                        // }
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
                      select: function () {
                        this.change_set();
                      },
                    },
                  }),

                  new Ext.form.ComboBox({
                    fieldLabel: "ประเภทใบขอเบิก",
                    id: "i_working_type",
                    mode: "local",
                    allowBlank: false,
                    store: new Ext.data.SimpleStore({
                      fields: ["id", "c_name"],
                      data: [
                        ["1", "F : ค่าใช้จ่าย"],
                        ["2", "D : จัดซื้อ/จัดจ้าง/จัดเช่า"],
                        ["3", "F : เงินเดือน/ค่าจ้าง/ค่าตอบแทน"],
                        ["4", "F : ชดใช้เงินยืม"],
                        ["5", "W : ถอนคืนเงินยืม"],
                        ["6", "A : ใบถอนเงินทดรองจ่าย"],
                        // ["7", "BR : สัญญายืม"],
                        ["8", "G : ใบถอนเงินทั่วไป"],
                        ["9", "WM : ใบถอนเงินรับฝาก/อื่นๆ"],
                        ["10", "WT : ใบถอนโอนเงิน"],
                      ],
                    }),
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    width: 170,
                    listeners: {
                      afterrender: function () {
                        this.ReadOnly_set = function (set) {
                          this.setReadOnly(set);
                          this.getEl().dom.style.background = set ? "#EEEEEE" : "";
                        };
                        this.fn = function () {};
                        this.change_set = function () {
                          var c_ = Ext.getCmp("dc_cost_acc_id").getValue() == "77" ? "77" : "99";
                          var i_working_type = Ext.getCmp("i_working_type").getValue();
                          var c_type_select = "";
                          var c_select = "";
                          if (i_working_type == 1) {
                            ReadOnly_set("c_code_invoice", true);
                            Ext.getCmp("c_code_invoice").setValue("-");

                            // ReadOnly_set("d_audit_date", true);
                            Ext.getCmp("d_audit_date").setValue(addY(543));
                          } else {
                            ReadOnly_set("c_code_invoice", false);
                            Ext.getCmp("c_code_invoice").setValue("");

                            ReadOnly_set("d_audit_date", false);
                            Ext.getCmp("d_audit_date").setValue("");
                          }

                          if (i_working_type == 2) {
                            Ext.getCmp("c_bookingID").forceSelection = false;
                            Ext.getCmp("c_bookingID").setValue("");
                          } else {
                            Ext.getCmp("c_bookingID").forceSelection = true;
                            Ext.getCmp("c_bookingID").setValue("");
                          }

                          if (i_working_type == 3) {
                            Ext.getCmp("group_type_3").show();
                          } else {
                            Ext.getCmp("group_type_3").hide();
                          }
                          /* 50 : ฝ่ายเภสัชกรรม, 82 : งานเวชภัณฑ์ทางการแพทย์, 38 : ฝ่ายพัสดุ */
                          if (i_working_type == 2 && ["50", "82"].includes(Ext.getCmp("dc_cost_idID").getValue())) {
                            var checkbox = Ext.getCmp("check_vat");
                            Ext.getCmp("c_bookingID").forceSelection = true;
                            checkbox.setValue(true);

                            var checkbox = Ext.getCmp("check_tax_personal");
                            checkbox.setValue(true);

                            Ext.getCmp("group_sp_sbill").show();
                            Ext.getCmp("c_code_invoice").hide();
                            Ext.getCmp("c_code_invoice").setValue("-");
                          } else {
                            Ext.getCmp("group_sp_sbill").hide();
                            Ext.getCmp("c_code_invoice").show();
                            if (i_working_type != 1) Ext.getCmp("c_code_invoice").setValue("");
                          }

                          if (i_working_type == 2) {
                            ReadOnly_set("c_code_per", false);
                          } else {
                            if (i_working_type != 1) Ext.getCmp("c_code_invoice").setValue("");
                            ReadOnly_set("c_code_per", true);
                          }

                          if (["1", "3"].includes(i_working_type)) {
                            // setReadOnly_D_AP();
                            // var checkbox = Ext.getCmp("i_filter_acc");
                            // checkbox.setValue(true);
                          } else {
                            // var checkbox = Ext.getCmp("i_filter_acc");
                            // checkbox.setValue(false);
                          }
                          document.getElementById(Ext.getCmp("c_code_per").label.id).innerHTML = "เลขที่อ้างอิง:";
                          document.getElementById(Ext.getCmp("d_audit_date").label.id).innerHTML = "วันที่เกิดค่าใช่จ่าย:";

                          if (["1", "2"].includes(i_working_type)) {
                            if (Ext.getCmp("dc_cost_idID").getValue() == 81) c_ = 99;
                            c_type_select = "_ss_" + c_;
                            c_select = "ระบบจัดซื้อจัดจ้าง" + (c_ == "77" ? " (คณะแพทย์ศาสตร์ชิรพยาบาล)" : " (สำนักงานอธิการบดี)");
                            document.getElementById(Ext.getCmp("c_code_per").label.id).innerHTML = "เลขที่สัญญา / งวด:";
                            if (i_working_type == "2") {
                              document.getElementById(Ext.getCmp("d_audit_date").label.id).innerHTML = "วันที่ตรวจรับ:";
                            }
                          } else if (["4"].includes(i_working_type)) {
                            c_ = "99";
                            c_type_select = "_bb_" + c_;
                            c_select = "ระบบเงืนยืม";
                          } else if (["5"].includes(i_working_type)) {
                            c_ = "99";
                            c_type_select = "_ee_" + c_;
                            c_select = "ระบบเงืนยืม";
                          } else if (["6"].includes(i_working_type)) {
                            if (Ext.getCmp("dc_cost_idID").getValue() == 81) c_ = 99;
                            c_type_select = "_ss_" + c_;
                            c_select = "ระบบจัดซื้อจัดจ้าง" + (c_ == "77" ? " (คณะแพทย์ศาสตร์ชิรพยาบาล)" : " (สำนักงานอธิการบดี)");
                            document.getElementById(Ext.getCmp("c_code_per").label.id).innerHTML = "เลขที่สัญญา / งวด:";
                            document.getElementById(Ext.getCmp("d_audit_date").label.id).innerHTML = "วันที่ตรวจรับ:";
                          } else if (["9"].includes(i_working_type)) {
                            c_type_select = "_wm";
                            c_select = "เงินรับฝาก";
                            document.getElementById(Ext.getCmp("c_code_per").label.id).innerHTML = "เลขที่ใบเสร็จ:";
                            document.getElementById(Ext.getCmp("d_audit_date").label.id).innerHTML = "วันที่พ้นภาระผูกพัน:";
                          } else if (["10"].includes(i_working_type)) {
                            c_type_select = "_wt";
                            c_select = "การโอนงบประมาณ";
                            document.getElementById(Ext.getCmp("c_code_per").label.id).innerHTML = "เลขที่อ้างอิง:";
                            document.getElementById(Ext.getCmp("d_audit_date").label.id).innerHTML = "วันที่โอนเงิน:";
                          }
                          Ext.getCmp("i_select_data").setValue(false);
                          Ext.getCmp("pop_select_dataID_ss_77").hide();
                          Ext.getCmp("pop_select_dataID_ss_99").hide();
                          Ext.getCmp("pop_select_dataID_bb_99").hide();
                          Ext.getCmp("pop_select_dataID_ee_99").hide();
                          Ext.getCmp("pop_select_dataID_wm").hide();
                          Ext.getCmp("pop_select_dataID_wt").hide();
                          if (c_type_select != "") {
                            Ext.getCmp("i_select_data").show();
                            var idEl = Ext.getCmp("i_select_data").getEl().dom.nextSibling.id;
                            document.getElementById(idEl).innerHTML = "ดึงข้อมูลจาก" + c_select;
                          } else {
                            Ext.getCmp("i_select_data").hide();
                          }
                          if (["5", "6", "8", "9", "10"].includes(this.getValue())) {
                            // Ext.getCmp("c_booking").show();
                            Ext.bg_expense_have.load();
                            Ext.getCmp("BuPopSelectID").disable();
                          } else {
                            Ext.getCmp("bg_expense_id").setValue("");
                            Ext.bg_expense_have.load({
                              params: {
                                type: "bg_expense",
                                i_have: 1,
                                i_budget_year: Ext.getCmp("i_budget_year").getValue(),
                                dc_expense_budget_type_id: Ext.getCmp("dc_expense_budget_type_id").getValue(),
                                dc_cost_acc_id: Ext.getCmp("dc_cost_acc_id").getValue(),
                                dc_cost_id: Ext.getCmp("dc_cost_idID").getValue(),
                                i_working_type: Ext.getCmp("i_working_type").getValue(),
                              },
                            });
                            Ext.getCmp("BuPopSelectID").enable();
                          }
                          if (Ext.getCmp("i_working_type").getValue() == 4) {
                            Ext.getCmp("c_code_per").setValue();
                          }
                        };
                      },
                      change: function (combo, newValue) {
                        this.change_set();
                        if (newValue == "") {
                          combo.reset();
                        }
                      },
                      select: function () {
                        this.change_set();
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
                    xtype: "compositefield",
                    anchor: "100%",
                    msgTarget: "under",
                    items: [
                      {
                        xtype: "checkbox",
                        id: "i_select_data",
                        boxLabel: "ดึงข้อมูลจากระบบ",
                        inputValue: 1,
                        // hidden: true,
                        checked: false,
                        listeners: {
                          check: function (combo, newValue) {
                            Ext.getCmp("pop_select_dataID_ss_77").hide();
                            Ext.getCmp("pop_select_dataID_ss_99").hide();
                            Ext.getCmp("pop_select_dataID_bb_99").hide();
                            Ext.getCmp("pop_select_dataID_ee_99").hide();
                            Ext.getCmp("pop_select_dataID_wm").hide();
                            Ext.getCmp("pop_select_dataID_wt").hide();
                            if (newValue) {
                              var c_ = Ext.getCmp("dc_cost_acc_id").getValue() == "77" ? "77" : "99";
                              var i_working_type = String(Ext.getCmp("i_working_type").getValue());
                              var c_type_select = "";
                              if (["1", "2"].includes(i_working_type)) {
                                if (Ext.getCmp("dc_cost_idID").getValue() == 81) c_ = 99;
                                c_type_select = "_ss_" + c_;
                              } else if (["4"].includes(i_working_type)) {
                                c_ = "99";
                                c_type_select = "_bb_" + c_;
                              } else if (["5"].includes(i_working_type)) {
                                c_ = "99";
                                c_type_select = "_ee_" + c_;
                              } else if (["6"].includes(i_working_type)) {
                                if (Ext.getCmp("dc_cost_idID").getValue() == 81) c_ = 99;
                                c_type_select = "_ss_" + c_;
                              } else if (["9"].includes(i_working_type)) {
                                c_type_select = "_wm";
                              } else if (["10"].includes(i_working_type)) {
                                c_type_select = "_wt";
                              }
                              console.log(c_type_select);
                              if (c_type_select != "") {
                                Ext.getCmp("pop_select_dataID" + c_type_select).show();
                              }
                              Ext.getCmp("modesubID").setValue("SEND");
                              Ext.getCmp("upload_pdf2").show();
                            } else {
                              Ext.getCmp("modesubID").items.items[1].show();
                              Ext.getCmp("upload_pdf2").show();
                            }
                          },
                          afterRender: function () {
                            setTimeout(function () {
                              Ext.getCmp("i_select_data").hide();
                            }, 250);
                          },
                        },
                      },
                    ],
                  },
                  /********************* SELECT_DATA ***********************/
                  /**ระบบจัดซื้อจัดจ้าง (คณะแพทย์ศาสตร์ชิรพยาบาล)**/
                  new Ext.Poplov_in({
                    text: "ดึงข้อมูลจากระบบจัดซื้อจัดจ้าง (คณะแพทย์ศาสตร์ชิรพยาบาล)",
                    id: "select_dataID_ss_77",
                    iconCls: "page_magnify",
                    valueHidden: "select_data",
                    defFilter: "c_code_per",
                    store: Ext.select_data_ss_77,
                    hidden: true,
                    headerGrid: [
                      { header: "ID System", hidden: true, dataIndex: "id" },
                      { header: "ที่", align: "center", width: 40, dataIndex: "no" },
                      { header: "เลขอ้างอิง", align: "left", width: 250, dataIndex: "c_code_per" },
                      {
                        header: "ชื่อเรื่อง",
                        id: "c_heading",
                        dataIndex: "c_heading",
                        width: 300,
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          metaData.attr = "style='cursor:pointer';";
                          return value;
                        },
                      },
                      {
                        header: "ชื่อโครงการ",
                        id: "c_title",
                        dataIndex: "c_title",
                        hidden: true,
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          metaData.attr = "style='cursor:pointer';";
                          return value;
                        },
                      },
                      {
                        header: "รายการย่อย",
                        id: "bg_expense_name",
                        width: 300,
                        dataIndex: "bg_expense_name",
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          metaData.attr = "style='cursor:pointer';";
                          return value;
                        },
                      },
                      {
                        header: "จำนวนเงิน",
                        dataIndex: "f_per_inv_vat",
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          metaData.attr = 'style= "text-align:right";';
                          return floatRenderer(value);
                        },
                      },
                      { width: 40, dataIndex: "" },
                    ],
                    widthText: 350,
                    fieldLabel: "รายการเตรียมขอเบิก",
                    isCellClickGrid: true,
                    afterrenderPop: function (c) {
                      c.store.setBaseParam("mode", "");
                      c.store.setBaseParam("i_working_type", Ext.getCmp("i_working_type").getValue());
                      c.store.setBaseParam("dc_cost_acc_id", Ext.getCmp("dc_cost_acc_id").getValue());
                      c.store.setBaseParam("dc_cost_id", Ext.getCmp("dc_cost_idID").getValue());
                      if (Ext.getCmp("id").getValue() > 0) {
                        c.store.setBaseParam("edit_id", Ext.getCmp("id").getValue());
                      }
                    },
                    cellClickGrid: function (grid, rowIndex, columnIndex, e) {
                      var poplov_id = "select_dataID_ss_77";
                      var record = grid.getStore().getAt(rowIndex);

                      var select = function (record) {
                        Ext.selectRow_begin = record;
                        var TextShow = record.data.c_code_per;
                        // Ext.getCmp("win-pop-lov" + poplov_id).hide();
                        if (Ext.getCmp("win-pop-lov" + poplov_id)) {
                          Ext.getCmp("win-pop-lov" + poplov_id).destroy();
                        }
                        if (Ext.I_SUB_STATUS_BEFORE == "3.00") {
                          setTimeout(() => {
                            Ext.getCmp("modeProtestID").setValue("SEND");
                          }, 500);
                        } else if (Ext.getCmp("id").getValue() > 0 && Ext.I_SUB_STATUS_BEFORE != "3.00") {
                          setTimeout(() => {
                            Ext.getCmp("modeEditID").setValue("SEND");
                          }, 500);
                        }
                        select_begin(Ext.selectRow_begin);

                        Ext.getCmp(poplov_id).setValue(record.data.id);
                        Ext.getCmp(poplov_id + "_Name").setValue(TextShow);
                        setTimeout(function () {
                          Ext.getCmp("select_pop_status").setValue(1);
                          Ext.getCmp("btn_pdf2").hide();
                          Ext.getCmp("i_edit_pdf2ID").hide();
                          Ext.getCmp("i_edit_pdf2ID").setValue({ i_edit_pdf2IDs1: true });
                          Ext.getCmp("modesubID").items.items[1].hide();
                          Ext.getCmp("c_receive_comment").hide();
                          ReadOnly_set("dc_cost_acc_id", true);
                          ReadOnly_set("dc_cost_idID", true);
                          ReadOnly_set("i_working_type", true);
                          Ext.getCmp("i_select_data").hide();

                          var checkbox = Ext.getCmp("i_filter_acc");
                          checkbox.setValue(true);
                          var checkbox = Ext.getCmp("i_filter_acc");
                          checkbox.setValue(false);
                          setTimeout(() => {
                            select_acc_loop(Ext.selectRow_begin);
                          }, 600);
                          // var checkbox = Ext.getCmp("i_filter_acc");
                          // checkbox.setValue(true);
                          setTimeout(() => {
                            Ext.getCmp("upload_pdf2").show();
                          }, 800);
                          if (Ext.getCmp("dc_creditor_idID").getValue() > 0) {
                            creditor_taxdata_load(Ext.getCmp("dc_creditor_idID").getValue());
                          }
                          if (Ext.getCmp("i_budget_year").getValue() > Ext.getCmp("i_budget_year_overlap").getValue()) {
                            Ext.getCmp("c_booking_radiogroup").show();
                            Ext.bg_expense_have.load();
                            Ext.getCmp("BuPopSelectID").disable();
                            Ext.booking_store.load({
                              params: {
                                i_budget_year_overlap: Ext.getCmp("i_budget_year_overlap").getValue(),
                                dc_cost_acc_id: Ext.getCmp("dc_cost_acc_id").getValue(),
                                dc_cost_id: Ext.getCmp("dc_cost_idID").getValue(),
                                in_id: Ext.I_SUB_STATUS_BEFORE == "3.00" ? Ext.dataSelect.id : 0,
                              },
                            });
                          } else {
                            // Ext.getCmp("bg_expense_id").setValue("");
                            // Ext.getCmp("c_bookingID").setValue("");
                            // ReadOnly_set("dc_expense_budget_type_id", false);
                            // Ext.getCmp("dc_expense_budget_type_id").setValue("");
                            // ReadOnly_set("bg_expense_id", false);

                            Ext.bg_expense_have.load({
                              params: {
                                type: "bg_expense",
                                i_have: 1,
                                i_budget_year: Ext.getCmp("i_budget_year").getValue(),
                                dc_expense_budget_type_id: Ext.getCmp("dc_expense_budget_type_id").getValue(),
                                dc_cost_acc_id: Ext.getCmp("dc_cost_acc_id").getValue(),
                                dc_cost_id: Ext.getCmp("dc_cost_idID").getValue(),
                                i_working_type: Ext.getCmp("i_working_type").getValue(),
                              },
                            });
                            Ext.bg_expense_have.load();
                            Ext.getCmp("c_booking_radiogroup").hide();
                            Ext.getCmp("BuPopSelectID").enable();
                          }
                          Ext.dc_bank_acc_creditor.load({
                            params: { dc_creditor_id: Ext.getCmp("dc_creditor_transfer_id").getValue() },
                            callback: function (recordx, operation, success) {
                              if (Ext.dc_bank_acc_creditor.totalLength > 1) {
                                if (Ext.selectRow_begin.data.dc_bank_acc_creditor_id) {
                                  Ext.getCmp("dc_bank_acc_creditor_id").setValue(Ext.selectRow_begin.data.dc_bank_acc_creditor_id);
                                } else {
                                  if (Ext.dc_bank_acc_creditor.getAt(1).data.i_main == 1) {
                                    Ext.getCmp("dc_bank_acc_creditor_id").setValue(Ext.dc_bank_acc_creditor.getAt(1).data.id);
                                  } else {
                                    Ext.getCmp("dc_bank_acc_creditor_id").setValue(0);
                                  }
                                }
                              } else {
                                Ext.getCmp("dc_bank_acc_creditor_id").setValue(0);
                              }
                            },
                          });
                          setTimeout(() => {
                            setReadOnly_D_AP();
                          }, 250);
                        }, 250);
                      };
                      if (Ext.getCmp("i_working_type").getValue() == "6") {
                        Ext.money_working_type_a.load({
                          params: {
                            i_budget_year: Ext.getCmp("i_budget_year").getValue(),
                            dc_cost_acc_id: Ext.getCmp("dc_cost_acc_id").getValue(),
                          },
                          callback: function (records, operation, success) {
                            if (records[0]) {
                              if (parseFloat(record.data.f_total) < parseFloat(records[0].data.f_money_working_type_a)) {
                                select(record);
                              } else {
                                Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap; color:red;'>จำนวนเงินทดรองไม่เพียงพอ</span>");
                                console.log("[0]: " + record.data.f_total, "< [1]:" + records[0].data.f_money_working_type_a);
                              }
                            } else {
                              Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap; color:red;'>จำนวนเงินทดรองไม่เพียงพอ</span>");
                            }
                          },
                        });
                      } else {
                        if (record.data.i_budget_year == record.data.i_budget_year_overlap) {
                          Ext.bg_expense_pop.load({
                            params: {
                              i_have: 1,
                              bg_expense_id: record.data.bg_expense_id,
                              i_budget_year: record.data.i_budget_year,
                              dc_expense_budget_type_id: record.data.dc_expense_budget_type_id,
                              dc_cost_acc_id: record.data.dc_cost_acc_id,
                              dc_cost_id: record.data.dc_cost_id,
                              i_working_type: record.data.i_working_type,
                            },
                            callback: function (records, operation, success) {
                              var index = records.findIndex((item) => item.get("id") == record.data.bg_expense_id);
                              if (index >= 0) {
                                var record_ = records[index].data;
                                if (record_.f_income_total > 0) {
                                  select(record);
                                } else {
                                  Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>ไม่พบรายการงบประมาณที่พร้อมเบิก</span>");
                                }
                              } else {
                                Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>ไม่พบรายการงบประมาณที่พร้อมเบิก</span>");
                              }
                            },
                          });
                        } else {
                          Ext.getCmp("BuPopSelectID").disable(true);
                          select(record);
                        }
                      }
                    },
                  }).mini,
                  /**ระบบจัดซื้อจัดจ้าง (สำนักงานอธิการบดี)**/
                  new Ext.Poplov_in({
                    text: "ดึงข้อมูลจากระบบจัดซื้อจัดจ้าง (สำนักงานอธิการบดี)",
                    id: "select_dataID_ss_99",
                    iconCls: "page_magnify",
                    valueHidden: "select_data",
                    defFilter: "c_code_per",
                    store: Ext.select_data_ss_99,
                    hidden: true,
                    headerGrid: [
                      { header: "ID System", hidden: true, dataIndex: "id" },
                      { header: "ที่", align: "center", width: 40, dataIndex: "no" },
                      { header: "เลขอ้างอิง", align: "left", width: 250, dataIndex: "c_code_per" },
                      {
                        header: "ชื่อเรื่อง",
                        id: "c_heading",
                        dataIndex: "c_heading",
                        width: 300,
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          metaData.attr = "style='cursor:pointer';";
                          return value;
                        },
                      },
                      {
                        header: "ชื่อโครงการ",
                        id: "c_title",
                        hidden: true,
                        dataIndex: "c_title",
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          metaData.attr = "style='cursor:pointer';";
                          return value;
                        },
                      },
                      {
                        header: "รายการย่อย",
                        id: "bg_expense_name",
                        width: 300,
                        dataIndex: "bg_expense_name",
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          metaData.attr = "style='cursor:pointer';";
                          return value;
                        },
                      },
                      {
                        header: "จำนวนเงิน",
                        dataIndex: "f_per_inv_vat",
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          metaData.attr = 'style= "text-align:right";';
                          return floatRenderer(value);
                        },
                      },
                      { width: 40, dataIndex: "" },
                    ],
                    widthText: 350,
                    fieldLabel: "รายการเตรียมขอเบิก",
                    isCellClickGrid: true,
                    afterrenderPop: function (c) {
                      c.store.setBaseParam("mode", "");
                      c.store.setBaseParam("i_working_type", Ext.getCmp("i_working_type").getValue());
                      c.store.setBaseParam("dc_cost_acc_id", Ext.getCmp("dc_cost_acc_id").getValue());
                      c.store.setBaseParam("dc_cost_id", Ext.getCmp("dc_cost_idID").getValue());
                      if (Ext.getCmp("id").getValue() > 0) {
                        c.store.setBaseParam("edit_id", Ext.getCmp("id").getValue());
                      }
                    },
                    cellClickGrid: function (grid, rowIndex, columnIndex, e) {
                      var poplov_id = "select_dataID_ss_99";
                      var record = grid.getStore().getAt(rowIndex);
                      var select = function (record) {
                        Ext.selectRow_begin = record;
                        var TextShow = record.data.c_code_per;
                        // Ext.getCmp("win-pop-lov" + poplov_id).hide();
                        Ext.getCmp("win-pop-lov" + poplov_id).destroy();
                        if (Ext.I_SUB_STATUS_BEFORE == "3.00") {
                          setTimeout(() => {
                            Ext.getCmp("modeProtestID").setValue("SEND");
                          }, 500);
                        } else if (Ext.getCmp("id").getValue() > 0 && Ext.I_SUB_STATUS_BEFORE != "3.00") {
                          setTimeout(() => {
                            Ext.getCmp("modeEditID").setValue("SEND");
                          }, 500);
                        }
                        select_begin(Ext.selectRow_begin);
                        Ext.getCmp(poplov_id).setValue(record.data.id);
                        Ext.getCmp(poplov_id + "_Name").setValue(TextShow);
                        setTimeout(function () {
                          Ext.getCmp("btn_pdf2").hide();
                          Ext.getCmp("i_edit_pdf2ID").hide();
                          Ext.getCmp("i_edit_pdf2ID").setValue({ i_edit_pdf2IDs1: true });
                          Ext.getCmp("modesubID").items.items[1].hide();
                          Ext.getCmp("c_receive_comment").hide();
                          ReadOnly_set("dc_cost_acc_id", true);
                          ReadOnly_set("dc_cost_idID", true);
                          ReadOnly_set("i_working_type", true);
                          Ext.getCmp("i_select_data").hide();

                          var checkbox = Ext.getCmp("i_filter_acc");
                          checkbox.setValue(true);
                          var checkbox = Ext.getCmp("i_filter_acc");
                          checkbox.setValue(false);

                          setTimeout(() => {
                            select_acc_loop(Ext.selectRow_begin);
                          }, 600);
                          // var checkbox = Ext.getCmp("i_filter_acc");
                          // checkbox.setValue(true);

                          setTimeout(() => {
                            Ext.getCmp("upload_pdf2").show();
                          }, 800);
                          if (Ext.getCmp("dc_creditor_idID").getValue() > 0) {
                            creditor_taxdata_load(Ext.getCmp("dc_creditor_idID").getValue());
                          }
                          if (Ext.getCmp("i_budget_year").getValue() > Ext.getCmp("i_budget_year_overlap").getValue()) {
                            Ext.getCmp("c_booking_radiogroup").show();
                            Ext.bg_expense_have.load();
                            Ext.getCmp("BuPopSelectID").disable();
                            Ext.booking_store.load({
                              params: {
                                i_budget_year_overlap: Ext.getCmp("i_budget_year_overlap").getValue(),
                                dc_cost_acc_id: Ext.getCmp("dc_cost_acc_id").getValue(),
                                dc_cost_id: Ext.getCmp("dc_cost_idID").getValue(),
                                in_id: Ext.I_SUB_STATUS_BEFORE == "3.00" ? Ext.dataSelect.id : 0,
                              },
                            });
                          } else {
                            // Ext.getCmp("bg_expense_id").setValue("");
                            // Ext.getCmp("c_bookingID").setValue("");
                            // ReadOnly_set("dc_expense_budget_type_id", false);
                            // Ext.getCmp("dc_expense_budget_type_id").setValue("");
                            // ReadOnly_set("bg_expense_id", false);

                            Ext.bg_expense_have.load({
                              params: {
                                type: "bg_expense",
                                i_have: 1,
                                i_budget_year: Ext.getCmp("i_budget_year").getValue(),
                                dc_expense_budget_type_id: Ext.getCmp("dc_expense_budget_type_id").getValue(),
                                dc_cost_acc_id: Ext.getCmp("dc_cost_acc_id").getValue(),
                                dc_cost_id: Ext.getCmp("dc_cost_idID").getValue(),
                                i_working_type: Ext.getCmp("i_working_type").getValue(),
                              },
                            });
                            Ext.bg_expense_have.load();
                            Ext.getCmp("c_booking_radiogroup").hide();
                            Ext.getCmp("BuPopSelectID").enable();
                          }
                          Ext.dc_bank_acc_creditor.load({
                            params: { dc_creditor_id: Ext.getCmp("dc_creditor_transfer_id").getValue() },
                            callback: function (recordx, operation, success) {
                              if (Ext.dc_bank_acc_creditor.totalLength > 1) {
                                if (Ext.selectRow_begin.data.dc_bank_acc_creditor_id) {
                                  Ext.getCmp("dc_bank_acc_creditor_id").setValue(Ext.selectRow_begin.data.dc_bank_acc_creditor_id);
                                } else {
                                  if (Ext.dc_bank_acc_creditor.getAt(1).data.i_main == 1) {
                                    Ext.getCmp("dc_bank_acc_creditor_id").setValue(Ext.dc_bank_acc_creditor.getAt(1).data.id);
                                  } else {
                                    Ext.getCmp("dc_bank_acc_creditor_id").setValue(0);
                                  }
                                }
                              } else {
                                Ext.getCmp("dc_bank_acc_creditor_id").setValue(0);
                              }
                            },
                          });
                          if (Ext.I_SUB_STATUS_BEFORE == "3.00") {
                            Ext.getCmp("modeProtestID").setValue("SEND");
                          }
                          setTimeout(() => {
                            setReadOnly_D_AP();
                          }, 250);
                        }, 250);
                      };
                      if (Ext.getCmp("i_working_type").getValue() == "6") {
                        Ext.money_working_type_a.load({
                          params: {
                            i_budget_year: Ext.getCmp("i_budget_year").getValue(),
                            dc_cost_acc_id: Ext.getCmp("dc_cost_acc_id").getValue(),
                          },
                          callback: function (records, operation, success) {
                            if (records[0]) {
                              if (parseFloat(record.data.f_total) < parseFloat(records[0].data.f_money_working_type_a)) {
                                select(record);
                              } else {
                                Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap; color:red;'>จำนวนเงินทดรองไม่เพียงพอ</span>");
                                console.log("[0]: " + record.data.f_total, "< [1]:" + records[0].data.f_money_working_type_a);
                              }
                            } else {
                              Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap; color:red;'>จำนวนเงินทดรองไม่เพียงพอ</span>");
                            }
                          },
                        });
                      } else {
                        if (record.data.i_budget_year == record.data.i_budget_year_overlap) {
                          Ext.bg_expense_pop.load({
                            params: {
                              i_have: 1,
                              bg_expense_id: record.data.bg_expense_id,
                              i_budget_year: record.data.i_budget_year,
                              dc_expense_budget_type_id: record.data.dc_expense_budget_type_id,
                              dc_cost_acc_id: record.data.dc_cost_acc_id,
                              dc_cost_id: record.data.dc_cost_id,
                              i_working_type: record.data.i_working_type,
                            },
                            callback: function (records, operation, success) {
                              var index = records.findIndex((item) => item.get("id") == record.data.bg_expense_id);
                              if (index >= 0) {
                                var record_ = records[index].data;
                                if (record_.f_income_total > 0) {
                                  select(record);
                                } else {
                                  Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>ไม่พบรายการงบประมาณที่พร้อมเบิก</span>");
                                }
                              } else {
                                Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>ไม่พบรายการงบประมาณที่พร้อมเบิก</span>");
                              }
                            },
                          });
                        } else {
                          Ext.getCmp("BuPopSelectID").disable(true);
                          select(record);
                        }
                      }
                    },
                  }).mini,
                  /**ระบบเงินยืม**/
                  new Ext.Poplov_in({
                    text: "ดึงข้อมูลเงินยืม",
                    id: "select_dataID_bb_99",
                    iconCls: "page_magnify",
                    valueHidden: "select_data",
                    defFilter: "c_code_per",
                    store: Ext.select_data_bb_99,
                    hidden: true,
                    headerGrid: [
                      { header: "ID System", hidden: true, dataIndex: "id" },
                      { header: "ที่", align: "center", width: 40, dataIndex: "no" },
                      { header: "เลขอ้างอิง", align: "left", width: 85, dataIndex: "c_code_per" },
                      {
                        header: "ชื่อเรื่อง",
                        id: "c_heading",
                        width: 250,
                        dataIndex: "c_heading",
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          metaData.attr = "style='cursor:pointer';";
                          return value;
                        },
                      },
                      {
                        header: "ชื่อโครงการ",
                        id: "c_title",
                        hidden: true,
                        width: 250,
                        dataIndex: "c_title",
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          metaData.attr = "style='cursor:pointer';";
                          return value;
                        },
                      },
                      {
                        header: "จำนวนเงินยืม",
                        dataIndex: "f_money_br",
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          metaData.attr = 'style= "text-align:right";';
                          return floatRenderer(value);
                        },
                      },
                      {
                        header: "จำนวนเงินส่งใช้เงินยืม<br>เป็นเงินสด",
                        dataIndex: "f_money_clear_by_cash",
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          metaData.attr = 'style= "text-align:right";';
                          return floatRenderer(value);
                        },
                      },
                      {
                        header: "จำนวนเบิกชดใช้<br>เงินยืมรออนุมัติ",
                        dataIndex: "f_working_sum",
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          metaData.attr = 'style= "text-align:right";';
                          return floatRenderer(value);
                        },
                      },
                      {
                        header: "จำนวนเงินส่งใช้เงินยืม<br>เป็นเอกสาร/ใบสำคัญ",
                        dataIndex: "f_money_clear_by_doc",
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          metaData.attr = 'style= "text-align:right";';
                          return floatRenderer(value);
                        },
                      },
                      {
                        header: "จำนวนเงินยืมคงค้าง",
                        dataIndex: "f_money_remain",
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          metaData.attr = 'style= "text-align:right";';
                          return floatRenderer(value);
                        },
                      },
                      { width: 40, dataIndex: "" },
                    ],
                    widthText: 350,
                    fieldLabel: "รายการเตรียมขอเบิก",
                    isCellClickGrid: true,
                    afterrenderPop: function (c) {
                      c.store.setBaseParam("mode", "");
                      c.store.setBaseParam("dc_cost_acc_id", Ext.getCmp("dc_cost_acc_id").getValue());
                      c.store.setBaseParam("dc_cost_id", Ext.getCmp("dc_cost_idID").getValue());
                    },
                    cellClickGrid: function (grid, rowIndex, columnIndex, e) {
                      var poplov_id = "select_dataID_bb_99";
                      var record = grid.getStore().getAt(rowIndex);
                      Ext.selectRow_begin = record;
                      var TextShow = record.data.c_code_per;
                      Ext.getCmp("win-pop-lov" + poplov_id).hide();
                      Ext.getCmp("win-pop-lov" + poplov_id).destroy();
                      select_begin(Ext.selectRow_begin);
                      select_acc_loop(Ext.selectRow_begin);
                      setTimeout(function () {
                        Ext.getCmp("select_pop_status").setValue(1);
                        Ext.getCmp(poplov_id).setValue(record.data.id);
                        Ext.getCmp(poplov_id + "_Name").setValue(TextShow);
                        Ext.getCmp("btn_pdf2").hide();
                        Ext.getCmp("i_edit_pdf2ID").hide();
                        Ext.getCmp("i_edit_pdf2ID").setValue({ i_edit_pdf2IDs1: true });
                        Ext.getCmp("modesubID").items.items[1].hide();
                        ReadOnly_set("dc_cost_acc_id", true);
                        ReadOnly_set("dc_cost_idID", true);
                        ReadOnly_set("i_working_type", true);
                        Ext.getCmp("i_select_data").hide();

                        Ext.getCmp("upload_pdf2").show();
                        var checkbox = Ext.getCmp("i_filter_acc");
                        checkbox.setValue(false);
                        // var checkbox = Ext.getCmp("i_filter_acc");
                        // checkbox.setValue(true);
                        if (Ext.I_SUB_STATUS_BEFORE == "3.00") {
                          Ext.getCmp("modeProtestID").setValue("SEND");
                        }
                      }, 250);
                    },
                  }).mini,
                  /**ระบบเงินยืม**/
                  new Ext.Poplov_in({
                    text: "ดึงข้อมูลถอนคืนเงินยืม",
                    id: "select_dataID_ee_99",
                    iconCls: "page_magnify",
                    valueHidden: "select_data",
                    defFilter: "c_code_per",
                    store: Ext.select_data_ee_99,
                    hidden: true,
                    headerGrid: [
                      { header: "ID System", hidden: true, dataIndex: "id" },
                      { header: "ที่", align: "center", width: 40, dataIndex: "no" },
                      { header: "เลขอ้างอิง", align: "left", width: 250, dataIndex: "c_code_per" },
                      {
                        header: "ชื่อเรื่อง",
                        id: "c_title",
                        hidden: true,
                        dataIndex: "c_title",
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          metaData.attr = "style='cursor:pointer';";
                          return value;
                        },
                      },
                      {
                        header: "ชื่อเรื่อง/ชื่อโครงการ",
                        id: "c_comment",
                        width: 200,
                        dataIndex: "c_comment",
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          metaData.attr = "style='cursor:pointer';";
                          return value;
                        },
                      },
                      {
                        header: "จำนวนเงินยืม",
                        dataIndex: "f_money_br",
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          metaData.attr = 'style= "text-align:right";';
                          return floatRenderer(value);
                        },
                      },
                      {
                        header: "จำนวนเงินส่งใช้เงินยืม<br>เป็นเงินสด",
                        dataIndex: "f_money_clear_by_cash",
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          metaData.attr = 'style= "text-align:right";';
                          return floatRenderer(value);
                        },
                      },
                      {
                        header: "จำนวนเงินส่งใช้เงินยืม<br>เป็นเอกสาร/ใบสำคัญ",
                        dataIndex: "f_money_clear_by_doc",
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          metaData.attr = 'style= "text-align:right";';
                          return floatRenderer(value);
                        },
                      },
                      {
                        header: "จำนวนเงินยืมคงค้าง",
                        dataIndex: "f_money_remain",
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          metaData.attr = 'style= "text-align:right";';
                          return floatRenderer(value);
                        },
                      },
                      {
                        header: "จำนวนเงินเบิกเกินเงินยืน",
                        dataIndex: "f_total",
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          metaData.attr = 'style= "text-align:right";';
                          return floatRenderer(value);
                        },
                      },
                      { width: 40, dataIndex: "" },
                    ],
                    widthText: 350,
                    fieldLabel: "รายการเตรียมขอเบิก",
                    isCellClickGrid: true,
                    afterrenderPop: function (c) {
                      c.store.setBaseParam("mode", "");
                      c.store.setBaseParam("dc_cost_acc_id", Ext.getCmp("dc_cost_acc_id").getValue());
                      c.store.setBaseParam("dc_cost_id", Ext.getCmp("dc_cost_idID").getValue());
                    },
                    cellClickGrid: function (grid, rowIndex, columnIndex, e) {
                      var poplov_id = "select_dataID_ee_99";
                      var record = grid.getStore().getAt(rowIndex);
                      Ext.selectRow_begin = record;
                      var TextShow = record.data.c_code_per;
                      Ext.getCmp("win-pop-lov" + poplov_id).hide();
                      Ext.getCmp("win-pop-lov" + poplov_id).destroy();
                      select_begin(Ext.selectRow_begin);
                      select_acc_loop(Ext.selectRow_begin);
                      setTimeout(function () {
                        Ext.getCmp("select_pop_status").setValue(1);
                        Ext.getCmp(poplov_id).setValue(record.data.id);
                        Ext.getCmp(poplov_id + "_Name").setValue(TextShow);
                        Ext.getCmp("c_heading").setValue(record.data.c_comment);
                        Ext.getCmp("btn_pdf2").hide();
                        Ext.getCmp("i_edit_pdf2ID").hide();
                        Ext.getCmp("i_edit_pdf2ID").setValue({ i_edit_pdf2IDs1: true });
                        Ext.getCmp("modesubID").items.items[1].hide();
                        ReadOnly_set("dc_cost_acc_id", true);
                        ReadOnly_set("dc_cost_idID", true);
                        ReadOnly_set("i_working_type", true);
                        Ext.getCmp("i_select_data").hide();

                        Ext.getCmp("upload_pdf2").show();
                        var checkbox = Ext.getCmp("i_filter_acc");
                        checkbox.setValue(false);
                        var checkbox = Ext.getCmp("i_filter_acc");
                        checkbox.setValue(true);
                      }, 250);
                      if (Ext.I_SUB_STATUS_BEFORE == "3.00") {
                        Ext.getCmp("modeProtestID").setValue("SEND");
                      }
                    },
                  }).mini,
                  /**ถอนเงินรับฝาก**/
                  new Ext.Poplov_in({
                    text: "ดึงข้อมูลถอนเงินรับฝาก",
                    id: "select_dataID_wm",
                    iconCls: "page_magnify",
                    valueHidden: "select_data",
                    defFilter: "c_code_per",
                    store: Ext.select_data_wm,
                    hidden: true,
                    isSetFilter: true,
                    setFilter: [
                      ["c_code_per", "เลขอ้างอิง"],
                      ["c_doc_ref1", "เลขที่ใบเสร็จเดิม"],
                      ["c_fund", "กองทุน"],
                    ],
                    headerGrid: [
                      { header: "ID System", hidden: true, dataIndex: "id" },
                      { header: "ที่", align: "center", width: 40, dataIndex: "no" },
                      { header: "เลขที่ใบเสร็จ", align: "left", width: 130, dataIndex: "c_code_per" },
                      {
                        header: "ชื่อเรื่อง",
                        id: "c_title",
                        width: 200,
                        dataIndex: "c_title",
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          metaData.attr = "style='cursor:pointer';";
                          return value;
                        },
                      },
                      {
                        header: "เลขที่ใบเสร็จเดิม",
                        id: "c_doc_ref1",
                        width: 200,
                        dataIndex: "c_doc_ref1",
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          metaData.attr = "style='cursor:pointer';";
                          return value;
                        },
                      },
                      {
                        header: "ชื่อผู้ชำระเงิน",
                        id: "name_receive",
                        dataIndex: "name_receive",
                        width: 200,
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          metaData.attr = "style='cursor:pointer';";
                          return value;
                        },
                      },
                      {
                        header: "เลขที่ PR",
                        id: "pr_tor",
                        dataIndex: "pr_tor",
                        width: 100,
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          metaData.attr = "style='cursor:pointer';";
                          return value;
                        },
                      },
                      {
                        header: "เลขที่สัญญา",
                        id: "c_contract_number",
                        dataIndex: "c_contract_number",
                        width: 100,
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          metaData.attr = "style='cursor:pointer';";
                          return value;
                        },
                      },
                      {
                        header: "วงเงินค้ำประกัน",
                        dataIndex: "f_guarantee_contract",
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          metaData.attr = 'style= "text-align:right";';
                          return floatRenderer(value);
                        },
                      },
                      {
                        header: "ประเภทเมนู",
                        id: "i_type_menu_sub",
                        dataIndex: "i_type_menu_sub",
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          metaData.attr = "style='cursor:pointer';";
                          return value;
                        },
                      },
                      {
                        header: "จำนวนเงินยืม",
                        dataIndex: "f_money_br",
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          metaData.attr = 'style= "text-align:right";';
                          return floatRenderer(value);
                        },
                      },
                      {
                        header: "จำนวนเงินส่งใช้เงินยืม<br>เป็นเงินสด",
                        dataIndex: "f_money_clear_by_cash",
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          metaData.attr = 'style= "text-align:right";';
                          return floatRenderer(value);
                        },
                      },
                      {
                        header: "จำนวนเงินส่งใช้เงินยืม<br>เป็นเอกสาร/ใบสำคัญ",
                        dataIndex: "f_money_clear_by_doc",
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          metaData.attr = 'style= "text-align:right";';
                          return floatRenderer(value);
                        },
                      },
                      {
                        header: "จำนวนเงินยืมคงค้าง",
                        dataIndex: "f_money_remain",
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          metaData.attr = 'style= "text-align:right";';
                          return floatRenderer(value);
                        },
                      },
                      {
                        header: "จำนวนเงินเบิกเกินเงินยืน",
                        dataIndex: "f_total",
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          metaData.attr = 'style= "text-align:right";';
                          return floatRenderer(value);
                        },
                      },
                      { width: 40, dataIndex: "" },
                    ],
                    widthText: 350,
                    fieldLabel: "รายการเตรียมขอเบิก",
                    isCellClickGrid: true,
                    afterrenderPop: function (c) {
                      c.store.setBaseParam("mode", "");
                      c.store.setBaseParam("dc_cost_acc_id", Ext.getCmp("dc_cost_acc_id").getValue());
                      c.store.setBaseParam("dc_cost_id", Ext.getCmp("dc_cost_idID").getValue());
                      c.store.setBaseParam("i_fund", 0);
                      c.store.setBaseParam("i_group", 0);
                    },
                    cellClickGrid: function (grid, rowIndex, columnIndex, e) {
                      var poplov_id = "select_dataID_wm";
                      var record = grid.getStore().getAt(rowIndex);
                      Ext.selectRow_begin = record;
                      var TextShow = record.data.c_code_per;
                      Ext.getCmp("win-pop-lov" + poplov_id).hide();
                      Ext.getCmp("win-pop-lov" + poplov_id).destroy();
                      select_begin(Ext.selectRow_begin);
                      select_acc_loop(Ext.selectRow_begin);
                      setTimeout(function () {
                        Ext.getCmp("select_pop_status").setValue(1);
                        Ext.getCmp(poplov_id).setValue(record.data.id);
                        Ext.getCmp(poplov_id + "_Name").setValue(TextShow);
                        Ext.getCmp("btn_pdf2").hide();
                        Ext.getCmp("i_edit_pdf2ID").hide();
                        Ext.getCmp("i_edit_pdf2ID").setValue({ i_edit_pdf2IDs1: true });
                        Ext.getCmp("modesubID").items.items[1].hide();
                        ReadOnly_set("dc_cost_acc_id", true);
                        ReadOnly_set("dc_cost_idID", true);
                        ReadOnly_set("i_working_type", true);
                        Ext.getCmp("i_select_data").hide();

                        Ext.getCmp("upload_pdf2").show();
                        var checkbox = Ext.getCmp("i_filter_acc");
                        checkbox.setValue(false);
                        var checkbox = Ext.getCmp("i_filter_acc");
                        checkbox.setValue(true);
                        if (Ext.I_SUB_STATUS_BEFORE == "3.00") {
                          Ext.getCmp("modeProtestID").setValue("SEND");
                        }
                      }, 250);
                    },
                  }).mini,
                  /**ถอนโอนงบประมาณ**/
                  new Ext.Poplov_in({
                    text: "ดึงข้อมูลถอนโอนงบประมาณ",
                    id: "select_dataID_wt",
                    iconCls: "page_magnify",
                    valueHidden: "select_data",
                    defFilter: "c_code_per",
                    store: Ext.select_data_wt,
                    hidden: true,
                    headerGrid: [
                      { header: "ID System", hidden: true, dataIndex: "id" },
                      { header: "ที่", align: "center", width: 40, dataIndex: "no" },
                      { header: "เลขที่ใบโอน", align: "left", width: 100, dataIndex: "c_code_per" },
                      {
                        header: "ชื่อเรื่อง",
                        id: "c_heading",
                        width: 280,
                        dataIndex: "c_heading",
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          metaData.attr = "style='cursor:pointer';";
                          return value;
                        },
                      },
                      {
                        header: "ชื่อโครงการ",
                        hidden: true,
                        id: "c_title",
                        dataIndex: "c_title",
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          metaData.attr = "style='cursor:pointer';";
                          return value;
                        },
                      },
                      {
                        header: "ส่วนงาน (รับโอน)",
                        width: 150,
                        id: "dc_cost_acc_name",
                        dataIndex: "dc_cost_acc_name",
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          metaData.attr = "style='cursor:pointer';";
                          return value;
                        },
                      },
                      {
                        header: "แหล่งเงิน",
                        width: 180,
                        id: "dc_expense_budget_type_name",
                        dataIndex: "dc_expense_budget_type_name",
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          metaData.attr = "style='cursor:pointer';";
                          return value;
                        },
                      },
                      {
                        header: "จำนวนเงิน",
                        dataIndex: "f_total",
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                          metaData.attr = 'style= "color:blue; text-align:right";';
                          return floatRenderer(value);
                        },
                      },
                      { width: 40, dataIndex: "" },
                    ],
                    widthText: 350,
                    fieldLabel: "รายการเตรียมขอเบิก",
                    isCellClickGrid: true,
                    afterrenderPop: function (c) {
                      c.store.setBaseParam("mode", "");
                      c.store.setBaseParam("i_budget_year", Ext.getCmp("i_budget_year").getValue());
                      c.store.setBaseParam("dc_cost_acc_id", Ext.getCmp("dc_cost_acc_id").getValue());
                      c.store.setBaseParam("dc_cost_id", Ext.getCmp("dc_cost_idID").getValue());
                    },
                    cellClickGrid: function (grid, rowIndex, columnIndex, e) {
                      var poplov_id = "select_dataID_wt";
                      var record = grid.getStore().getAt(rowIndex);
                      Ext.selectRow_begin = record;
                      var TextShow = record.data.c_code_per;

                      Ext.getCmp("win-pop-lov" + poplov_id).hide();
                      Ext.getCmp("win-pop-lov" + poplov_id).destroy();
                      select_begin(Ext.selectRow_begin);
                      select_acc_loop(Ext.selectRow_begin);
                      Ext.dc_creditor.load({
                        params: {
                          cost_creditor: 1,
                        },
                      });
                      setTimeout(function () {
                        Ext.getCmp("select_pop_status").setValue(1);
                        Ext.getCmp(poplov_id).setValue(record.data.id);
                        Ext.getCmp(poplov_id + "_Name").setValue(TextShow);
                        Ext.getCmp("btn_pdf2").hide();
                        Ext.getCmp("i_edit_pdf2ID").hide();
                        Ext.getCmp("i_edit_pdf2ID").setValue({ i_edit_pdf2IDs1: true });
                        Ext.getCmp("modesubID").items.items[1].hide();
                        ReadOnly_set("dc_cost_acc_id", true);
                        ReadOnly_set("dc_cost_idID", true);
                        ReadOnly_set("i_working_type", true);
                        Ext.getCmp("i_select_data").hide();

                        Ext.getCmp("upload_pdf2").show();
                        var checkbox = Ext.getCmp("i_filter_acc");
                        checkbox.setValue(false);
                        // var checkbox = Ext.getCmp("i_filter_acc");
                        // checkbox.setValue(true);
                        if (Ext.I_SUB_STATUS_BEFORE == "3.00") {
                          Ext.getCmp("modeProtestID").setValue("SEND");
                        }
                      }, 250);
                    },
                  }).mini,
                  /********************* SELECT_DATA (END) ***********************/
                  {
                    xtype: "radiogroup",
                    columns: [200, 200, 300],
                    fieldLabel: "วิธีการบันทึกเอกสารใบขอเบิก",
                    id: "pdf_upload_mode",
                    hidden: true,
                    listeners: {
                      afterrender: function () {},
                    },
                    style: {
                      "font-weight": "bold",
                    },
                    items: [
                      {
                        name: "pdf_upload_mode",
                        checked: true,
                        inputValue: 1,
                        boxLabel: "ออกเอกสารใบขอเบิกโดยระบบ",
                        listeners: {
                          render: function (c) {
                            // var text_ToolTip = "<span style='white-space:nowrap;'>แก้ไขข้อมูลใบขอเบิก</span>";
                            // new Ext.ToolTip({
                            //   target: c.positionEl.id,
                            //   anchor: "top",
                            //   html: text_ToolTip,
                            // });
                          },
                        },
                      },
                      {
                        name: "pdf_upload_mode",
                        inputValue: 2,
                        boxLabel: "นำเข้าเอกสารใบขอเบิก",
                        listeners: {
                          render: function (c) {
                            // var text_ToolTip = "<span style='white-space:nowrap;'>สร้างรายการใบขอเบิกรายการใหม่<br>(จำเป็นต้องอัพโหลดเอกสารประกอบใบเบิกใหม่)</span>";
                            // new Ext.ToolTip({
                            //   target: c.positionEl.id,
                            //   anchor: "top",
                            //   html: text_ToolTip,
                            // });
                          },
                        },
                      },
                      // {
                      //   name: "pdf_upload_mode",
                      //   inputValue: 3,
                      //   boxLabel: "เอกสารนอกระบบ (กรณีเอกสารเป็นกระดาษ)",
                      //   listeners: {
                      //     render: function (c) {
                      //       // var text_ToolTip = "<span style='white-space:nowrap;'>สร้างรายการใบขอเบิกรายการใหม่<br>(จำเป็นต้องอัพโหลดเอกสารประกอบใบเบิกใหม่)</span>";
                      //       // new Ext.ToolTip({
                      //       //   target: c.positionEl.id,
                      //       //   anchor: "top",
                      //       //   html: text_ToolTip,
                      //       // });
                      //     },
                      //   },
                      // },
                    ],
                    listeners: {
                      afterrender: function () {
                        // if (Ext.butt == "edit") {
                        //   Ext.getCmp("i_edit_pdf2ID").show();
                        // } else {
                        //   Ext.getCmp("i_edit_pdf2ID").hide();
                        // }
                      },
                      change: function (combo, newValue) {
                        if (this.getValue().inputValue == 1) {
                          //*--
                          Ext.getCmp("upload_pdf1").hide();
                          Ext.getCmp("BuGroupPdf1").hide();
                          // Ext.getCmp("i_edit_pdf1ID").hide();
                        } else {
                          Ext.getCmp("i_edit_pdf1ID").setValue({ i_edit_pdf1IDs1: true });
                          // Ext.getCmp("i_edit_pdf1ID").show();
                          Ext.getCmp("upload_pdf1").show();
                          Ext.getCmp("BuGroupPdf1").show();
                        }
                      },
                    },
                  },
                ],
              },
            ],
          },
          {
            layout: "column",
            modal: true,
            id: "group_input_box_2",
            border: false,
            items: [
              {
                // column 1
                columnWidth: 0.6,
                layout: "fit",
                // height: Ext.getBody().getViewSize().height * 0.8,
                // width: Ext.getBody().getViewSize().width * 0.0,
                border: false,
                items: [
                  {
                    xtype: "container",
                    layout: "hbox",
                    align: "stretch",
                    labelWidth: 120,
                    RemoveHeight: true,
                    defaults: { xtype: "fieldset", flex: 1, margins: "0px 3px", autoHeight: true },
                    items: [
                      {
                        title: "ข้อมูลรายการ",
                        RemoveCls: "x-box-item",
                        collapsible: false,
                        collapsed: false,
                        border: false,
                        defaults: { labelStyle: "width:120px;" },
                        items: [
                          {
                            xtype: "hidden",
                            id: "role-form-mode",
                            name: "mode",
                            readOnly: true,
                          },
                          {
                            xtype: "hidden",
                            name: "save_protest",
                            value: Ext.I_SUB_STATUS_BEFORE == "3.00" ? 1 : 0,
                            readOnly: true,
                          },
                          {
                            xtype: "hidden",
                            id: "select_pop_status",
                            name: "select_pop_status",
                            value: 0,
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
                            id: "i_sys",
                            name: "i_sys",
                            readOnly: true,
                          },
                          {
                            xtype: "hidden",
                            id: "pr_id",
                            name: "pr_id",
                            readOnly: true,
                          },
                          {
                            xtype: "hidden",
                            id: "po_id",
                            name: "po_id",
                            readOnly: true,
                          },
                          {
                            xtype: "hidden",
                            id: "per_id",
                            name: "per_id",
                            readOnly: true,
                          },
                          {
                            xtype: "hidden",
                            id: "chk_id",
                            name: "chk_id",
                            readOnly: true,
                          },
                          {
                            xtype: "hidden",
                            id: "fi_br_hdr_id",
                            name: "fi_br_hdr_id",
                            readOnly: true,
                          },
                          {
                            xtype: "hidden",
                            id: "bg_budget_hdr_change_id",
                            name: "bg_budget_hdr_change_id",
                            readOnly: true,
                          },
                          {
                            xtype: "hidden",
                            id: "cm_receive_tran_hdr_id",
                            name: "cm_receive_tran_hdr_id",
                            readOnly: true,
                          },
                          {
                            xtype: "hidden",
                            id: "cm_group_receive_for_wm_hdr_id",
                            name: "cm_group_receive_for_wm_hdr_id",
                            readOnly: true,
                          },
                          {
                            xtype: "hidden",
                            id: "gl_tran_hdr_id",
                            name: "gl_tran_hdr_id",
                            readOnly: true,
                          },
                          {
                            xtype: "hidden",
                            id: "po_working_begin_hdr_id",
                            name: "po_working_begin_hdr_id",
                            readOnly: true,
                          },
                          {
                            xtype: "hidden",
                            name: "dc_tax_customer_id",
                            id: "dc_tax_customer_idID",
                            readOnly: true,
                          },
                          {
                            xtype: "hidden",
                            name: "i_inside_cost",
                            id: "i_inside_cost",
                            value: Ext.INSIDE_COST ? 1 : 0,
                            readOnly: true,
                          },
                          {
                            xtype: "hidden",
                            name: "i_extend_time",
                            id: "i_extend_time",
                            readOnly: true,
                          },
                          {
                            xtype: "textfield",
                            fieldLabel: "เลขที่สัญญา / งวด",
                            iconCls: "icon-information",
                            width: 190,
                            name: "c_code_per",
                            id: "c_code_per",
                            // style: {
                            //   "font-weight": "bold",
                            //   padding: "1px",
                            //   margin: "1px",
                            //   color: "#000",
                            //   "text-align": "center",
                            //   background: "#EEEEEE",
                            //   color: "#333",
                            //   border: "1px solid #ADADAD",
                            // },
                            // readOnly: true,
                            enableKeyEvents: true,
                            listeners: {
                              keyup: function (me, e) {
                                var maxlength = 50;
                                if (me.getValue().length >= maxlength) {
                                  var newval = me.getValue().substring(0, maxlength);
                                  me.setValue(newval);
                                }
                              },
                            },
                          },
                          {
                            xtype: "textfield",
                            fieldLabel: "เลขที่ใบขอเบิก",
                            iconCls: "icon-information",
                            width: 190,
                            name: "c_code_ref",
                            style: {
                              "font-weight": "bold",
                              padding: "1px",
                              margin: "1px",
                              color: "#000",
                              "text-align": "center",
                              background: "#EEEEEE",
                              color: "#333",
                              border: "1px solid #ADADAD",
                            },
                            readOnly: true,
                            enableKeyEvents: true,
                            listeners: {
                              keyup: function (me, e) {
                                var maxlength = 50;
                                if (me.getValue().length >= maxlength) {
                                  var newval = me.getValue().substring(0, maxlength);
                                  me.setValue(newval);
                                }
                              },
                            },
                          },

                          new Ext.form.ComboBox({
                            mode: "local",
                            // allowBlank: false,
                            fieldLabel: "ปีงบประมาณ",
                            submitValue: true,
                            allowBlank: false,
                            id: "i_budget_year",
                            hiddenName: "i_budget_year",
                            name: "i_budget_yearTxt",
                            store: Ext.store_year,
                            valueField: "id",
                            displayField: "c_name",
                            value: Ext.bgYear,
                            triggerAction: "all",
                            forceSelection: true,
                            selectOnFocus: true,
                            typeAhead: false,
                            emptyText: "กรุณาเลือกปีงบประมาณ...",
                            config: {
                              requireMe: false,
                            },
                            listeners: {
                              afterrender: function () {
                                ReadOnly_set("i_budget_year", true);
                                this.ReadOnly_set = function (set) {
                                  this.setReadOnly(set);
                                  this.getEl().dom.style.background = set ? "#EEEEEE" : "";
                                };
                                this.fn = function () {};
                                this.select_value = function () {
                                  if (Ext.getCmp("i_budget_year").getValue() > Ext.getCmp("i_budget_year_overlap").getValue()) {
                                    Ext.getCmp("c_booking_radiogroup").show();
                                    Ext.getCmp("BuPopSelectID").disable();
                                    Ext.bg_expense_have.load();
                                  } else {
                                    Ext.getCmp("c_booking_radiogroup").hide();
                                    Ext.getCmp("BuPopSelectID").enable();
                                  }

                                  var i_budget_year = Ext.getCmp("i_budget_year").getValue();
                                  var dc_expense_budget_type_id = Ext.getCmp("dc_expense_budget_type_id").getValue();
                                  var bg_expense_id = Ext.getCmp("bg_expense_id").getValue();
                                  var dc_cost_idID = Ext.getCmp("dc_cost_idID").getValue();
                                  load_f_income_total(i_budget_year, dc_expense_budget_type_id, bg_expense_id, dc_cost_idID);
                                };
                              },
                              select: function () {
                                this.select_value();
                              },
                              Change: function () {
                                this.fn();
                                this.select_value();
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
                            mode: "local",
                            fieldLabel: "ใช้เงินปีงบประมาณ",
                            allowBlank: false,
                            submitValue: true,
                            id: "i_budget_year_overlap",
                            hiddenName: "i_budget_year_overlap",
                            name: "i_budget_year_overlapTxt",
                            store: Ext.store_year,
                            valueField: "id",
                            displayField: "c_name",
                            value: Ext.bgYear,
                            triggerAction: "all",
                            forceSelection: true,
                            selectOnFocus: true,
                            typeAhead: false,
                            emptyText: "กรุณาเลือกปีงบประมาณ...",
                            listeners: {
                              afterrender: function () {
                                this.ReadOnly_set = function (set) {
                                  this.setReadOnly(set);
                                  this.getEl().dom.style.background = set ? "#EEEEEE" : "";
                                };
                                this.fn = function () {};
                                this.select_value = function () {
                                  if (Ext.getCmp("i_budget_year").getValue() > Ext.getCmp("i_budget_year_overlap").getValue()) {
                                    Ext.getCmp("c_booking_radiogroup").show();
                                    Ext.bg_expense_have.load();
                                    Ext.getCmp("BuPopSelectID").disable();
                                  } else {
                                    Ext.getCmp("bg_expense_id").setValue("");
                                    Ext.getCmp("c_bookingID").setValue("");
                                    ReadOnly_set("dc_expense_budget_type_id", false);
                                    Ext.getCmp("dc_expense_budget_type_id").setValue("");
                                    ReadOnly_set("bg_expense_id", false);

                                    Ext.bg_expense_have.load({
                                      params: {
                                        i_have: 1,
                                        type: "bg_expense",
                                        i_budget_year: Ext.getCmp("i_budget_year").getValue(),
                                        dc_expense_budget_type_id: Ext.getCmp("dc_expense_budget_type_id").getValue(),
                                        dc_cost_acc_id: Ext.getCmp("dc_cost_acc_id").getValue(),
                                        dc_cost_id: Ext.getCmp("dc_cost_idID").getValue(),
                                        i_working_type: Ext.getCmp("i_working_type").getValue(),
                                      },
                                    });
                                    Ext.bg_expense_have.load();
                                    Ext.getCmp("c_booking_radiogroup").hide();
                                    Ext.getCmp("BuPopSelectID").enable();
                                  }
                                };
                              },
                              select: function () {
                                this.fn();
                                this.select_value();
                              },
                              Change: function () {
                                this.fn();
                                this.select_value();

                                if (Ext.getCmp("i_budget_year").getValue() > Ext.getCmp("i_budget_year_overlap").getValue()) {
                                  Ext.getCmp("contenterCenter").getEl().mask("กำลังดึงข้อมูลใบกันเงินเหลื่อมปี...", "x-mask-loading");
                                  Ext.booking_store.load({
                                    params: {
                                      i_budget_year_overlap: Ext.getCmp("i_budget_year_overlap").getValue(),
                                      dc_cost_acc_id: Ext.getCmp("dc_cost_acc_id").getValue(),
                                      dc_cost_id: Ext.getCmp("dc_cost_idID").getValue(),
                                      in_id: Ext.I_SUB_STATUS_BEFORE == "3.00" ? Ext.dataSelect.id : 0,
                                    },
                                    callback: function () {
                                      Ext.getCmp("contenterCenter").getEl().unmask();
                                    },
                                  });
                                }
                                document.getElementById("label_extend_overlap").innerHTML = "";
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
                            fieldLabel: "เลขที่ใบกันเงินเหลื่อมปี",
                            id: "c_booking_radiogroup",
                            xtype: "radiogroup",
                            columns: [0, 80],
                            listeners: {},
                            items: [
                              new Ext.form.ComboBox({
                                mode: "local",
                                store: Ext.booking_store,
                                allowBlank: false,
                                valueField: "id",
                                displayField: "c_booking",
                                width: 181,
                                submitValue: true,
                                name: "c_booking",
                                hiddenName: "c_booking",
                                id: "c_bookingID",
                                triggerAction: "all",
                                forceSelection: true,
                                selectOnFocus: true,
                                typeAhead: false,
                                listeners: {
                                  afterrender: function () {
                                    this.fn = function () {};
                                    this.change_set = function () {
                                      if (this.getValue()) {
                                        var index = Ext.booking_store.findExact("id", this.getValue());
                                        var record = Ext.booking_store.getAt(index);
                                        Ext.getCmp("dc_expense_budget_type_id").setValue(record.data.dc_expense_budget_type_id);
                                        Ext.getCmp("bg_expense_id").setValue(record.data.bg_expense_id);
                                        ReadOnly_set("dc_expense_budget_type_id", true);
                                        ReadOnly_set("bg_expense_id", true);
                                        var checkbox = Ext.getCmp("i_filter_acc");
                                        checkbox.setValue(false);
                                        var checkbox = Ext.getCmp("i_filter_acc");
                                        checkbox.setValue(true);
                                        Ext.getCmp("i_extend_time").setValue(record.data.i_extend_time);
                                      } else {
                                        ReadOnly_set("dc_expense_budget_type_id", false);
                                        Ext.getCmp("dc_expense_budget_type_id").setValue("");
                                        ReadOnly_set("bg_expense_id", false);
                                        Ext.getCmp("bg_expense_id").setValue("");
                                        Ext.getCmp("i_extend_time").setValue(null);
                                      }
                                      if (record.data.i_extend_time > 0) {
                                        document.getElementById("label_extend_overlap").innerHTML = "ㅤขยายครั้งที่ " + record.data.i_extend_time + "";
                                      } else {
                                        document.getElementById("label_extend_overlap").innerHTML = "";
                                      }
                                    };
                                  },
                                  Change: function () {
                                    this.fn();
                                    this.change_set();
                                  },
                                  select: function () {
                                    this.change_set();
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
                                xtype: "label",
                                id: "label_extend_overlap",
                                style: { "white-space": "nowrap", "font-size": "12px", color: "blue" },
                              },
                              // new Ext.ux.PopMutiSelect({
                              //   id: "booking_PopSelectID",
                              //   iconCls: "icon-application-view-columns",
                              //   text: "รายละเอียด",
                              //   // hidden: true,
                              //   title: "เลือกข้อมูลที่ต้องการ",
                              //   multiSelect: false,
                              //   disabledBtnClickDestroy: true,
                              //   store: Ext.booking_store,
                              //   setFilter: [
                              //     ["c_code", "เลขที่"],
                              //     ["c_name", "ชื่อรายการ"],
                              //   ],
                              //   defFilter: "c_name",
                              //   headerGrid: [
                              //     {
                              //       header: "เลขที่",
                              //       align: "center",
                              //       width: 90,
                              //       dataIndex: "c_code",
                              //     },
                              //     {
                              //       header: "ชื่อรายการ",
                              //       // align: "",
                              //       width: 280,
                              //       id: "c_name",
                              //       dataIndex: "c_name",
                              //     },
                              //     {
                              //       header: "เงินงบประมาณ",
                              //       align: "center",
                              //       width: 100,
                              //       dataIndex: "f_plan",
                              //       renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                              //         metaData.attr = 'style="color: blue; text-align: right;"';
                              //         return floatRenderer(floatMinus(value, 2));
                              //       },
                              //     },
                              //     {
                              //       header: "เงินรายได้รับจริง",
                              //       align: "center",
                              //       width: 100,
                              //       dataIndex: "f_income",
                              //       renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                              //         metaData.attr = 'style="color: blue; text-align: right;"';
                              //         return floatRenderer(floatMinus(value, 2));
                              //       },
                              //     },
                              //     {
                              //       header: "คงเหลือรายได้รับจริง",
                              //       align: "center",
                              //       width: 100,
                              //       dataIndex: "f_income_total",
                              //       renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                              //         metaData.attr = 'style="color: ' + (value > 0 ? "green" : "red") + '; text-align: right;"';
                              //         return floatRenderer(floatMinus(value, 2));
                              //       },
                              //     },
                              //     { width: 20, dataIndex: "" },
                              //   ],
                              //   beforePop: function (c) {
                              //     c.msg = "";
                              //     if (Ext.getCmp("dc_cost_acc_id").getValue() == "") {
                              //       c.msg += "<span style='white-space: nowrap;'>- กรุณาเลือก ส่วนงาน</span><br>";
                              //     }
                              //     if (Ext.getCmp("dc_cost_idID").getValue() == "") {
                              //       c.msg += "<span style='white-space: nowrap;'>- กรุณาเลือก หน่วยงาน</span><br>";
                              //     }
                              //     if (Ext.getCmp("i_budget_year").getValue() == "") {
                              //       c.msg += "<span style='white-space: nowrap;'>- กรุณาเลือก ปีงบประมาณ</span><br>";
                              //     }
                              //     c.checkID = []; //resetSelect
                              //   },
                              //   afterrenderPop: function (c) {
                              //     c.checkID = []; //resetSelect
                              //     c.store.setBaseParam("i_have", 1);
                              //     c.store.setBaseParam("i_budget_year", Ext.getCmp("i_budget_year").getValue());
                              //     c.store.setBaseParam("dc_expense_budget_type_id", Ext.getCmp("dc_expense_budget_type_id").getValue());
                              //     c.store.setBaseParam("dc_cost_acc_id", Ext.getCmp("dc_cost_acc_id").getValue());
                              //     c.store.setBaseParam("dc_cost_id", Ext.getCmp("dc_cost_idID").getValue());
                              //     c.store.setBaseParam("i_working_type", Ext.getCmp("i_working_type").getValue());
                              //     c.store.setBaseParam("mode", "");
                              //   },
                              //   BtnClick: function (c) {
                              //     var id = c.checkID[0];
                              //     var index = Ext.bg_expense_pop.findExact("id", id.toString());
                              //     var record = Ext.bg_expense_pop.getAt(index);
                              //     if (record.get("f_income_total") > 0) {
                              //       Ext.getCmp("bg_expense_id").setValue(id);
                              //       c.destroy_window();
                              //     } else {
                              //       Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>รายการที่เลือกจำนวนเงินไม่พอ</span>");
                              //     }
                              //   },
                              // }).mini,
                            ],
                          },
                          // {
                          //   xtype: "textfield",
                          //   fieldLabel: "เลขที่ใบกันเงินเหลื่อมปี",
                          //   iconCls: "icon-information",
                          //   name: "c_booking",
                          //   id: "c_booking",
                          //   // hidden: Ext.getCmp("i_budget_year").getValue() > Ext.getCmp("i_budget_year_overlap").getValue() ? false : true,
                          //   width: 190,
                          //   style: {
                          //     // "font-weight": "bold",
                          //     padding: "1px",
                          //     margin: "1px",
                          //     color: "#000",
                          //     "background-color": "#eee !important",
                          //     // "text-align": "center",
                          //   },
                          //   enableKeyEvents: true,
                          //   listeners: {
                          //     keyup: function (me, e) {
                          //       var maxlength = 50;
                          //       if (me.getValue().length >= maxlength) {
                          //         var newval = me.getValue().substring(0, maxlength);
                          //         me.setValue(newval);
                          //       }
                          //     },
                          //   },
                          // },
                          {
                            fieldLabel: "เรื่อง/โครงการ",
                            // xtype: "textfield",
                            xtype: "textarea",
                            name: "c_heading",
                            id: "c_heading",
                            iconCls: "icon-information",
                            anchor: "90%",
                            height: "50px",
                            // allowBlank: false,
                            style: {
                              // "font-weight": "bold",
                              padding: "1px",
                              margin: "1px",
                              color: "#000",
                              "background-color": "#eee !important",
                              // "text-align": "center",
                            },
                            enableKeyEvents: true,
                            listeners: {
                              keyup: function (me, e) {
                                var maxlength = 1000;
                                if (me.getValue().length >= maxlength) {
                                  var newval = me.getValue().substring(0, maxlength);
                                  me.setValue(newval);
                                }
                              },
                            },
                          },
                          {
                            fieldLabel: "ชื่อโครงการ",
                            xtype: "textfield",
                            name: "c_title",
                            id: "c_title",
                            hidden: true,
                            iconCls: "icon-information",
                            anchor: "90%",
                            // allowBlank: false,
                            style: {
                              // "font-weight": "bold",
                              padding: "1px",
                              margin: "1px",
                              color: "#000",
                              "background-color": "#eee !important",
                              // "text-align": "center",
                            },
                            enableKeyEvents: true,
                            listeners: {
                              afterrender: function () {
                                ReadOnly_set("c_title", true);
                              },
                              keyup: function (me, e) {
                                var maxlength = 255;
                                if (me.getValue().length >= maxlength) {
                                  var newval = me.getValue().substring(0, maxlength);
                                  me.setValue(newval);
                                }
                              },
                            },
                          },
                          new Ext.form.ComboBox({
                            mode: "local",
                            store: Ext.dc_expense_budget_type,
                            fieldLabel: "แหล่งเงิน",
                            allowBlank: false,
                            anchor: "90%",
                            submitValue: true,
                            name: "dc_expense_budget_type_idTxt",
                            hiddenName: "dc_expense_budget_type_id", //bg_expense_group_id
                            id: "dc_expense_budget_type_id", //bg_expense_group_id
                            valueField: "id",
                            displayField: "c_name",
                            triggerAction: "all",
                            forceSelection: true,
                            selectOnFocus: true,
                            typeAhead: false,
                            emptyText: "กรุณาเลือกแหล่งเงิน...",
                            listeners: {
                              render: function (combo) {
                                tooltip_ComboBox(combo, "c_name");
                              },
                              afterrender: function () {
                                this.fn = function () {};
                                this.change_set = function () {
                                  if (!["5", "6", "8", "9", "10"].includes(Ext.getCmp("i_working_type").getValue())) {
                                    if (Ext.getCmp("i_budget_year").getValue() == Ext.getCmp("i_budget_year_overlap").getValue()) {
                                      Ext.getCmp("bg_expense_id").setValue("");
                                      Ext.bg_expense_have.load({
                                        params: {
                                          type: "bg_expense",
                                          i_have: 1,
                                          i_budget_year: Ext.getCmp("i_budget_year").getValue(),
                                          dc_expense_budget_type_id: Ext.getCmp("dc_expense_budget_type_id").getValue(),
                                          dc_cost_acc_id: Ext.getCmp("dc_cost_acc_id").getValue(),
                                          dc_cost_id: Ext.getCmp("dc_cost_idID").getValue(),
                                          i_working_type: Ext.getCmp("i_working_type").getValue(),
                                        },
                                      });

                                      var i_budget_year = Ext.getCmp("i_budget_year").getValue();
                                      var dc_expense_budget_type_id = Ext.getCmp("dc_expense_budget_type_id").getValue();
                                      var bg_expense_id = Ext.getCmp("bg_expense_id").getValue();
                                      var dc_cost_idID = Ext.getCmp("dc_cost_idID").getValue();
                                      load_f_income_total(i_budget_year, dc_expense_budget_type_id, bg_expense_id, dc_cost_idID);
                                    } else {
                                      if (Ext.getCmp("dc_expense_budget_type_id").getValue() == 8) {
                                        Ext.getCmp("c_bookingID").allowBlank = true;
                                        Ext.getCmp("c_bookingID").validate();
                                      } else {
                                        Ext.getCmp("c_bookingID").allowBlank = false;
                                        Ext.getCmp("c_bookingID").validate();
                                      }
                                    }
                                  }
                                };
                              },
                              Change: function () {
                                this.fn();
                                this.change_set();
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
                              select: function () {
                                this.change_set();
                              },
                            },
                          }),
                          {
                            fieldLabel: "รายการย่อย",
                            xtype: "radiogroup",
                            columns: [0, 80],
                            listeners: {},
                            items: [
                              new Ext.form.ComboBox({
                                mode: "local",
                                store: Ext.bg_expense_have,
                                allowBlank: false,
                                valueField: "id",
                                displayField: "c_name",
                                anchor: "100%",
                                submitValue: true,
                                name: "c_detail",
                                hiddenName: "bg_expense_id",
                                id: "bg_expense_id",
                                triggerAction: "all",
                                forceSelection: true,
                                selectOnFocus: true,
                                fieldLabel: "รายการย่อย",
                                typeAhead: false,
                                emptyText: "กรุณาเลือกใช้จ่าย...",
                                listeners: {
                                  render: function (combo) {
                                    tooltip_ComboBox(combo, "c_name");
                                  },
                                  afterrender: function () {
                                    this.fn = function () {};
                                    this.fn_change = function () {
                                      var i_budget_year = Ext.getCmp("i_budget_year").getValue();
                                      var dc_expense_budget_type_id = Ext.getCmp("dc_expense_budget_type_id").getValue();
                                      var bg_expense_id = Ext.getCmp("bg_expense_id").getValue();
                                      var dc_cost_idID = Ext.getCmp("dc_cost_idID").getValue();
                                      load_f_income_total(i_budget_year, dc_expense_budget_type_id, bg_expense_id, dc_cost_idID);

                                      var checkbox = Ext.getCmp("i_filter_acc");
                                      checkbox.setValue(false);
                                      var checkbox = Ext.getCmp("i_filter_acc");
                                      checkbox.setValue(true);

                                      var index = Ext.bg_expense_have.findExact("id", Ext.getCmp("bg_expense_id").getValue());
                                      var record = Ext.bg_expense_have.getAt(index);
                                      if (["07", "10"].includes(record.data.c_name.slice(0, 2))) {
                                        // Ext.getCmp("group_po_working_program").show();
                                      } else {
                                        Ext.getCmp("group_po_working_program").hide();
                                      }
                                    };
                                  },
                                  Change: function () {
                                    this.fn();
                                    this.fn_change();
                                  },
                                  select: function () {
                                    this.fn_change();
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
                              new Ext.ux.PopMutiSelect({
                                id: "PopSelectID",
                                iconCls: "icon-application-view-columns",
                                text: "รายละเอียด",
                                title: "เลือกข้อมูลที่ต้องการ",
                                multiSelect: false,
                                disabledBtnClickDestroy: true,
                                store: Ext.bg_expense_pop,
                                setFilter: [
                                  ["c_code", "เลขที่"],
                                  ["c_name", "ชื่อรายการ"],
                                ],
                                defFilter: "c_name",
                                headerGrid: [
                                  {
                                    header: "เลขที่",
                                    align: "center",
                                    width: 90,
                                    dataIndex: "c_code",
                                  },
                                  {
                                    header: "ชื่อรายการ",
                                    // align: "",
                                    width: 280,
                                    id: "c_name",
                                    dataIndex: "c_name",
                                  },
                                  {
                                    header: "เงินงบประมาณ",
                                    align: "center",
                                    width: 100,
                                    dataIndex: "f_plan",
                                    renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                      metaData.attr = 'style="color: blue; text-align: right;"';
                                      return floatRenderer(floatMinus(value, 2));
                                    },
                                  },
                                  {
                                    header: "เงินรายได้รับจริง",
                                    align: "center",
                                    width: 100,
                                    dataIndex: "f_income",
                                    renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                      metaData.attr = 'style="color: blue; text-align: right;"';
                                      return floatRenderer(floatMinus(value, 2));
                                    },
                                  },
                                  {
                                    header: "คงเหลือรายได้รับจริง",
                                    align: "center",
                                    width: 100,
                                    dataIndex: "f_income_total",
                                    renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                      metaData.attr = 'style="color: ' + (value > 0 ? "green" : "red") + '; text-align: right;"';
                                      return floatRenderer(floatMinus(value, 2));
                                    },
                                  },
                                  { width: 20, dataIndex: "" },
                                ],
                                beforePop: function (c) {
                                  c.msg = "";
                                  if (Ext.getCmp("dc_cost_acc_id").getValue() == "") {
                                    c.msg += "<span style='white-space: nowrap;'>- กรุณาเลือก ส่วนงาน</span><br>";
                                  }
                                  if (Ext.getCmp("dc_cost_idID").getValue() == "") {
                                    c.msg += "<span style='white-space: nowrap;'>- กรุณาเลือก หน่วยงาน</span><br>";
                                  }
                                  if (Ext.getCmp("i_budget_year").getValue() == "") {
                                    c.msg += "<span style='white-space: nowrap;'>- กรุณาเลือก ปีงบประมาณ</span><br>";
                                  }
                                  if (Ext.getCmp("dc_expense_budget_type_id").getValue() == "") {
                                    c.msg += "<span style='white-space: nowrap;'>- กรุณาเลือก แหล่งเงิน</span><br>";
                                  }
                                  c.checkID = []; //resetSelect
                                },
                                afterrenderPop: function (c) {
                                  c.checkID = []; //resetSelect
                                  c.store.setBaseParam("i_have", 1);
                                  c.store.setBaseParam("i_budget_year", Ext.getCmp("i_budget_year").getValue());
                                  c.store.setBaseParam("dc_expense_budget_type_id", Ext.getCmp("dc_expense_budget_type_id").getValue());
                                  c.store.setBaseParam("dc_cost_acc_id", Ext.getCmp("dc_cost_acc_id").getValue());
                                  c.store.setBaseParam("dc_cost_id", Ext.getCmp("dc_cost_idID").getValue());
                                  c.store.setBaseParam("i_working_type", Ext.getCmp("i_working_type").getValue());
                                  c.store.setBaseParam("mode", "");
                                },
                                BtnClick: function (c) {
                                  var id = c.checkID[0];
                                  var index = Ext.bg_expense_pop.findExact("id", id.toString());
                                  var record = Ext.bg_expense_pop.getAt(index);
                                  if (record.get("f_income_total") > 0) {
                                    Ext.getCmp("bg_expense_id").setValue(id);
                                    c.destroy_window();

                                    var checkbox = Ext.getCmp("i_filter_acc");
                                    checkbox.setValue(false);
                                    var checkbox = Ext.getCmp("i_filter_acc");
                                    checkbox.setValue(true);

                                    if (["07", "10"].includes(record.data.c_code.slice(0, 2))) {
                                      // Ext.getCmp("group_po_working_program").show();
                                    } else {
                                      Ext.getCmp("group_po_working_program").hide();
                                    }
                                  } else {
                                    Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>รายการที่เลือกจำนวนเงินไม่พอ</span>");
                                  }
                                },
                              }).mini,
                            ],
                          },
                          {
                            fieldLabel: "ค่าใช้จ่ายโครงการ",
                            xtype: "radiogroup",
                            id: "group_po_working_program",
                            columns: [0, 80],
                            listeners: {
                              afterRender: function () {
                                setTimeout(() => {
                                  this.hide();
                                }, 1);
                              },
                            },
                            items: [
                              new Ext.form.ComboBox({
                                mode: "local",
                                store: Ext.po_working_program,
                                valueField: "id",
                                displayField: "c_code",
                                submitValue: true,
                                name: "po_working_program_hdr_text",
                                hiddenName: "po_working_program_hdr_id",
                                id: "po_working_program_hdr_id",
                                triggerAction: "all",
                                emptyText: "กรุณาเลือกรายการ...",
                                listeners: {
                                  afterrender: function () {
                                    ReadOnly_set("po_working_program_hdr_id", true);
                                  },
                                },
                              }),
                              new Ext.ux.PopMutiSelect({
                                id: "po_working_program_pop",
                                iconCls: "icon-application-view-columns",
                                text: "รายการ",
                                title: "ดึงข้อมูลใบแจ้งหนี้",
                                multiSelect: false,
                                disabledBtnClickDestroy: true,
                                store: Ext.po_working_program_pop,
                                setFilter: [["c_code", "เลขค่าใช้จ่ายโครงการ"]],
                                defFilter: "c_code",
                                headerGrid: [
                                  {
                                    header: "เลขค่าใช้จ่ายโครงการ",
                                    align: "center",
                                    width: 180,
                                    dataIndex: "c_code",
                                  },
                                  {
                                    header: "รายการย่อย",
                                    align: "center",
                                    width: 280,
                                    dataIndex: "bg_expense_name",
                                  },
                                  {
                                    header: "จำนวนเงิน",
                                    align: "center",
                                    width: 120,
                                    dataIndex: "f_sum",
                                    renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                      metaData.attr = 'style="color: blue; text-align: right;"';
                                      return floatRenderer(floatMinus(value, 2));
                                    },
                                  },
                                  { width: 20, dataIndex: "" },
                                ],
                                beforePop: function (c) {
                                  c.msg = "";
                                  // if (Ext.getCmp("dc_cost_idID").getValue() == "") {
                                  //   c.msg += "<span style='white-space: nowrap;'>- กรุณาเลือก หน่วยงาน</span><br>";
                                  // }
                                  // if (Ext.getCmp("i_working_type").getValue() == "") {
                                  //   c.msg += "<span style='white-space: nowrap;'>- กรุณาเลือก ประเภทใบขอเบิก</span><br>";
                                  // }
                                  c.checkID = []; //resetSelect
                                },
                                afterrenderPop: function (c) {
                                  c.checkID = []; //resetSelect
                                  c.store.setBaseParam("i_have", 1);
                                  c.store.setBaseParam("dc_cost_id", Ext.getCmp("dc_cost_idID").getValue());
                                  c.store.setBaseParam("mode", "");
                                },
                                BtnClick: function (c) {
                                  var id = c.checkID[0];
                                  var index = Ext.po_working_program_pop.findExact("id", id.toString());
                                  var record = Ext.po_working_program_pop.getAt(index);

                                  Ext.po_working_program.setBaseParam("po_working_program_hdr_id", record.data.id);
                                  Ext.po_working_program.load({
                                    callback: function () {
                                      Ext.getCmp("po_working_program_hdr_id").setValue(record.data.id);
                                      Ext.getCmp("f_total").setValue(record.data.f_sum);
                                      Ext.getCmp("f_total").fn();

                                      Ext.getCmp("f_inv_vat").setValue(floatRenderer(floatMinus(Ext.getCmp("f_total").getValue().replace(/,/g, ""))));
                                      if (Ext.getCmp("f_vat_rate").getValue() != "") {
                                        var f_vat = (Ext.getCmp("f_inv_vat").getValue().replace(/,/g, "") / 1.07) * 0.07;
                                        f_vat = f_vat.toFixed(2);
                                        Ext.getCmp("f_vat").setValue(floatRenderer(floatMinus(f_vat, 2)));
                                      }

                                      var f_inv = Ext.getCmp("f_inv_vat").getValue().replace(/,/g, "") - Ext.getCmp("f_vat").getValue().replace(/,/g, "");
                                      Ext.getCmp("f_inv").setValue(floatRenderer(floatMinus(f_inv.toFixed(2), 2)));

                                      if (Ext.getCmp("f_tax_personal_rate").getValue() != "") {
                                        var f_tax_personal = Ext.getCmp("f_inv").getValue().replace(/,/g, "") * 0.01;
                                        f_tax_personal = Math.round(f_tax_personal * 100) / 100;
                                        Ext.getCmp("f_tax_personal").setValue(floatRenderer(floatMinus(f_tax_personal.toFixed(2), 2)));
                                      }

                                      f_per_pay_sum();
                                    },
                                  });
                                  c.destroy_window();
                                },
                              }).mini,
                            ],
                          },
                          { xtype: "container", height: 15 },
                          {
                            fieldLabel: "รายการใบแจ้งหนี้",
                            xtype: "radiogroup",
                            id: "group_sp_sbill",
                            columns: [0, 80],
                            listeners: {
                              afterRender: function () {
                                setTimeout(() => {
                                  this.hide();
                                }, 1);
                              },
                            },
                            items: [
                              new Ext.form.ComboBox({
                                mode: "local",
                                store: Ext.sp_sbill,
                                valueField: "id",
                                displayField: "c_contract_code",
                                submitValue: true,
                                name: "sp_sbill_text",
                                hiddenName: "sp_sbill_hdr_id",
                                id: "sp_sbill_hdr_id",
                                triggerAction: "all",
                                emptyText: "กรุณาเลือกรายการ...",
                                listeners: {
                                  afterrender: function () {
                                    ReadOnly_set("sp_sbill_hdr_id", true);
                                  },
                                },
                              }),
                              new Ext.ux.PopMutiSelect({
                                id: "sp_sbill_pop",
                                iconCls: "icon-application-view-columns",
                                text: "รายการ",
                                title: "ดึงข้อมูลใบแจ้งหนี้",
                                multiSelect: false,
                                disabledBtnClickDestroy: true,
                                store: Ext.sp_sbill_pop,
                                setFilter: [["c_contract_code", "เลขที่สัญญา"]],
                                defFilter: "c_contract_code",
                                headerGrid: [
                                  {
                                    header: "เลขที่สัญญา",
                                    align: "center",
                                    width: 180,
                                    dataIndex: "c_contract_code",
                                  },
                                  {
                                    header: "จำนวนใบแจ้งหนี้",
                                    align: "center",
                                    width: 90,
                                    id: "count",
                                    dataIndex: "count",
                                    renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                      metaData.attr = 'style="color: blue; text-align: center;"';
                                      var link = "<a href='#' onclick='show_sp_sbill_item(" + record.data.id + ")'>( " + value + " รายการ)</a>";
                                      return link;
                                    },
                                  },
                                  {
                                    header: "จำนวนเงิน (รวม Vat)",
                                    align: "center",
                                    width: 120,
                                    dataIndex: "f_sum",
                                    renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                      metaData.attr = 'style="color: blue; text-align: right;"';
                                      return floatRenderer(floatMinus(value, 2));
                                    },
                                  },
                                  { width: 20, dataIndex: "" },
                                ],
                                beforePop: function (c) {
                                  c.msg = "";
                                  if (Ext.getCmp("dc_cost_idID").getValue() == "") {
                                    c.msg += "<span style='white-space: nowrap;'>- กรุณาเลือก หน่วยงาน</span><br>";
                                  }
                                  if (Ext.getCmp("i_working_type").getValue() == "") {
                                    c.msg += "<span style='white-space: nowrap;'>- กรุณาเลือก ประเภทใบขอเบิก</span><br>";
                                  }
                                  c.checkID = []; //resetSelect
                                },
                                afterrenderPop: function (c) {
                                  c.checkID = []; //resetSelect
                                  c.store.setBaseParam("i_have", 1);
                                  c.store.setBaseParam("dc_cost_id", Ext.getCmp("dc_cost_idID").getValue());
                                  c.store.setBaseParam("mode", "");
                                },
                                BtnClick: function (c) {
                                  var id = c.checkID[0];
                                  var index = Ext.sp_sbill_pop.findExact("id", id.toString());
                                  var record = Ext.sp_sbill_pop.getAt(index);

                                  Ext.sp_sbill.setBaseParam("sp_sbill_hdr_id", record.data.id);
                                  Ext.sp_sbill.load({
                                    callback: function () {
                                      Ext.getCmp("sp_sbill_hdr_id").setValue(record.data.id);
                                      Ext.getCmp("f_total").setValue(record.data.f_sum);
                                      Ext.getCmp("f_total").fn();

                                      Ext.getCmp("f_inv_vat").setValue(floatRenderer(floatMinus(Ext.getCmp("f_total").getValue().replace(/,/g, ""))));
                                      if (Ext.getCmp("f_vat_rate").getValue() != "") {
                                        var f_vat = (Ext.getCmp("f_inv_vat").getValue().replace(/,/g, "") / 1.07) * 0.07;
                                        f_vat = f_vat.toFixed(2);
                                        Ext.getCmp("f_vat").setValue(floatRenderer(floatMinus(f_vat, 2)));
                                      }

                                      var f_inv = Ext.getCmp("f_inv_vat").getValue().replace(/,/g, "") - Ext.getCmp("f_vat").getValue().replace(/,/g, "");
                                      Ext.getCmp("f_inv").setValue(floatRenderer(floatMinus(f_inv.toFixed(2), 2)));

                                      if (Ext.getCmp("f_tax_personal_rate").getValue() != "") {
                                        var f_tax_personal = Ext.getCmp("f_inv").getValue().replace(/,/g, "") * 0.01;
                                        f_tax_personal = Math.round(f_tax_personal * 100) / 100;
                                        Ext.getCmp("f_tax_personal").setValue(floatRenderer(floatMinus(f_tax_personal.toFixed(2), 2)));
                                      }

                                      f_per_pay_sum();
                                    },
                                  });
                                  c.destroy_window();
                                },
                              }).mini,
                            ],
                          },
                          {
                            xtype: "textfield",
                            allowBlank: false,
                            anchor: "90%",
                            fieldLabel: "เลขที่ใบแจ้งหนี้",
                            id: "c_code_invoice",
                            name: "c_code_invoice",
                            listeners: {
                              keyup: function (me, e) {
                                var maxlength = 255;
                                if (me.getValue().length >= maxlength) {
                                  var newval = me.getValue().substring(0, maxlength);
                                  me.setValue(newval);
                                  i_edit_pdf2ID;
                                }
                              },
                            },
                          },
                          {
                            fieldLabel: "จ่ายให้",
                            xtype: "radiogroup",
                            columns: [0, 100],
                            listeners: {},
                            items: [
                              new Ext.form.ComboBox({
                                mode: "local",
                                store: Ext.dc_creditor,
                                anchor: "100%",
                                // fieldLabel: "จ่ายให้",
                                valueField: "id",
                                displayField: "c_name",
                                hiddenName: "dc_creditor_id",
                                name: "dc_creditor_name",
                                id: "dc_creditor_idID",
                                triggerAction: "all",
                                forceSelection: true,
                                selectOnFocus: true,
                                typeAhead: false,
                                emptyText: "กรุณาเลือก...",
                                submitValue: true,
                                allowBlank: false,
                                listeners: {
                                  render: function (combo) {
                                    tooltip_ComboBox(combo, "c_name");
                                  },
                                  afterrender: function () {
                                    this.fn = function () {};
                                    this.fn_change = function () {
                                      if (this.getValue() > 0) {
                                        creditor_taxdata_load(this.getValue());
                                      }
                                      var f_id = Ext.isEmpty(Ext.getCmp("dc_creditor_transfer_id").getValue());
                                      if (f_id) {
                                        Ext.getCmp("dc_creditor_transfer_id").setValue(this.getValue());
                                        Ext.dc_bank_acc_creditor.load({
                                          params: { dc_creditor_id: this.getValue() },
                                          callback: function (recordx, operation, success) {
                                            if (Ext.dc_bank_acc_creditor.totalLength > 1) {
                                              if (Ext.dc_bank_acc_creditor.getAt(1).data.i_main == 1) {
                                                Ext.getCmp("dc_bank_acc_creditor_id").setValue(Ext.dc_bank_acc_creditor.getAt(1).data.id);
                                              } else {
                                                Ext.getCmp("dc_bank_acc_creditor_id").setValue(0);
                                              }
                                            } else {
                                              Ext.getCmp("dc_bank_acc_creditor_id").setValue(0);
                                            }
                                          },
                                        });
                                      }
                                    };
                                  },
                                  change: function (combo, newValue) {
                                    this.fn();
                                    var record = this.getStore().getAt(this.getStore().findExact("id", newValue));
                                    if (Ext.getCmp("dc_creditor_idID").lastSelectionText.includes("ทดรองจ่าย")) {
                                      Ext.getCmp("c_code_advance").show();
                                    } else {
                                      Ext.getCmp("c_code_advance").hide();
                                    }
                                    if (record) {
                                      this.fn_change();
                                    } else {
                                      Ext.getCmp("dc_creditor_transfer_id").setValue(null);
                                      Ext.getCmp("dc_bank_acc_creditor_id").setValue(null);
                                      Ext.dc_bank_acc_creditor.load();
                                      Ext.getCmp("dc_bank_acc_creditor_id").setValue(null);
                                      Ext.getCmp("textarea_tax").setValue("");
                                    }
                                  },
                                  select: function (combo, record, index) {
                                    this.fn_change();
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
                                xtype: "button",
                                text: "แก้ไขข้อมูลภาษี",
                                iconCls: "icon-building-edit",
                                disabled: true,
                                handler: function () {
                                  edit_creditor_datatax(Ext.getCmp("dc_creditor_idID"));
                                },
                              },
                            ],
                          },
                          {
                            xtype: "textarea",
                            fieldLabel: "ข้อมูลทางภาษี",
                            anchor: "90%",
                            id: "textarea_tax",
                            validator: function (val) {
                              return true;
                            },
                            readOnly: true,
                            height: 140,
                            style: {
                              background: "#EEEEEE",
                              color: "#333",
                              border: "1px solid #ADADAD",
                            },
                          },
                          new Ext.form.ComboBox({
                            mode: "local",
                            store: Ext.dc_creditor,
                            anchor: "90%",
                            fieldLabel: "โดยมอบให้",
                            valueField: "id",
                            displayField: "c_name",
                            id: "dc_creditor_transfer_id",
                            hiddenName: "dc_creditor_transfer_id",
                            name: "dc_creditor_transfer_name",
                            triggerAction: "all",
                            forceSelection: true,
                            selectOnFocus: true,
                            typeAhead: false,
                            allowBlank: false,
                            emptyText: "กรุณาเลือก...",
                            listeners: {
                              render: function (combo) {
                                tooltip_ComboBox(combo, "c_name");
                              },
                              afterrender: function () {
                                this.fn = function () {};
                                this.fn_change = function () {
                                  Ext.dc_bank_acc_creditor.load({
                                    params: { dc_creditor_id: this.getValue() },
                                    callback: function (recordx, operation, success) {
                                      if (Ext.dc_bank_acc_creditor.totalLength > 1) {
                                        if (Ext.dc_bank_acc_creditor.getAt(1).data.i_main == 1) {
                                          Ext.getCmp("dc_bank_acc_creditor_id").setValue(Ext.dc_bank_acc_creditor.getAt(1).data.id);
                                        } else {
                                          Ext.getCmp("dc_bank_acc_creditor_id").setValue(0);
                                        }
                                      } else {
                                        Ext.getCmp("dc_bank_acc_creditor_id").setValue(0);
                                      }
                                    },
                                  });
                                };
                              },
                              resize: function (win, width, height) {
                                Ext.getCmp("dc_creditor_idID").setWidth(width - 101.5);
                                Ext.getCmp("bg_expense_id").setWidth(width - 80.5);
                                Ext.getCmp("sp_sbill_hdr_id").setWidth(width - 80.5);
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
                              change: function (combo, newValue) {
                                this.fn();
                                var record = this.getStore().getAt(this.getStore().findExact("id", newValue));
                                if (record) {
                                  this.fn_change();
                                } else {
                                  Ext.dc_bank_acc_creditor.load();
                                  Ext.getCmp("dc_bank_acc_creditor_id").setValue(0);
                                }
                              },
                              select: function (combo, record, index) {
                                this.fn_change();
                              },
                            },
                          }),
                          {
                            xtype: "radiogroup",
                            columns: [100, 100],
                            id: "i_type_transfer",
                            fieldLabel: "รูปแบบการจ่าย",
                            items: [
                              {
                                name: "i_type_transfer",
                                inputValue: 1,
                                checked: true,
                                boxLabel: "โอนจ่าย",
                              },
                              {
                                name: "i_type_transfer",
                                inputValue: 2,
                                boxLabel: "เช็คจ่าย",
                              },
                            ],
                            listeners: {
                              change: function (cb, rec, ind) {
                                if (Ext.getCmp("i_type_transfer").getValue().inputValue == 2) {
                                  Ext.getCmp("dc_bank_acc_creditor_id").setValue(0);
                                } else {
                                  if (Ext.dc_bank_acc_creditor.totalLength > 1) {
                                    if (Ext.dc_bank_acc_creditor.getAt(1).data.i_main == 1) {
                                      Ext.getCmp("dc_bank_acc_creditor_id").setValue(Ext.dc_bank_acc_creditor.getAt(1).data.id);
                                    } else {
                                      Ext.getCmp("dc_bank_acc_creditor_id").setValue(0);
                                    }
                                  }
                                }
                              },
                              afterrender: function (obj, eOpts) {
                                // if (Ext.dc_bank_acc_creditor.totalLength > 1) {
                                //   Ext.getCmp("i_type_transfer").setValue(1);
                                // } else {
                                //   Ext.getCmp("i_type_transfer").setValue(2);
                                // }
                              },
                            },
                          },
                          new Ext.form.ComboBox({
                            mode: "local",
                            store: Ext.dc_bank_acc_creditor,
                            fieldLabel: "บัญชีธนาคาร",
                            anchor: "90%",
                            submitValue: true,
                            name: "dc_bank_acc_creditorTxt",
                            hiddenName: "dc_bank_acc_creditor_id",
                            id: "dc_bank_acc_creditor_id",
                            valueField: "id",
                            displayField: "c_name_full",
                            triggerAction: "all",
                            forceSelection: true,
                            selectOnFocus: true,
                            typeAhead: false,
                            allowBlank: false,
                            emptyText: "กรุณาเลือกบัญชีธนาคาร...",
                            listeners: {
                              render: function (combo) {
                                tooltip_ComboBox(combo, "c_name_full");
                              },
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
                          {
                            xtype: "textfield",
                            // allowBlank: false,
                            hidden: true,
                            anchor: "40%",
                            fieldLabel: "เลขใบถอนเงินทดรอง",
                            id: "c_code_advance",
                            name: "c_code_advance",
                            // listeners: {
                            //   keyup: function (me, e) {
                            //     var maxlength = 255;
                            //     if (me.getValue().length >= maxlength) {
                            //       var newval = me.getValue().substring(0, maxlength);
                            //       me.setValue(newval);
                            //       i_edit_pdf2ID;
                            //     }
                            //   },
                            // },
                          },
                          // { xtype: "container", height: 15 },
                          {
                            fieldLabel: "ข้อมูลโอน (รายบุคคล)",
                            xtype: "radiogroup",
                            id: "group_type_3",
                            columns: [250, 80],
                            listeners: {
                              afterRender: function () {
                                setTimeout(() => {
                                  this.hide();
                                }, 1);
                              },
                            },
                            items: [
                              {
                                xtype: "textfield",
                                id: "text_show_item_pay",
                                width: 350,
                                style: {
                                  "font-weight": "bold",
                                  padding: "1px",
                                  margin: "1px",
                                  color: "#000",
                                  "text-align": "center",
                                  background: "#EEEEEE",
                                  color: "#333",
                                  border: "1px solid #ADADAD",
                                },
                                readOnly: true,
                              },
                              {
                                xtype: "button",
                                iconCls: "icon-application-view-columns",
                                text: "<span id='btn_text_show_item_pay'>ข้อมูลโอน</span>",
                                handler: function () {
                                  window_items_dtl();
                                },
                              },
                            ],
                          },
                          // new Ext.form.ComboBox({
                          //   mode: "local",
                          //   store: Ext.dc_creditor,
                          //   valueField: "id",
                          //   allowBlank: false,
                          //   displayField: "c_name",
                          //   anchor: "90%",
                          //   submitValue: true,
                          //   name: "dc_creditor_transfer_name",
                          //   hiddenName: "dc_creditor_transfer_id",
                          //   id: "dc_creditor_transfer_id",
                          //   triggerAction: "all",
                          //   forceSelection: false,
                          //   allBlank: true,
                          //   selectOnFocus: true,
                          //   fieldLabel: "โดยมอบให้",
                          //   width: 200,
                          //   typeAhead: false,
                          //   emptyText: "กรุณาเลือก...",
                          //   listeners: {
                          //     beforequery: function (q) {
                          //       if (q.query) {
                          //         var length = q.query.length;
                          //         q.query = new RegExp(Ext.escapeRe(q.query));
                          //         q.query.length = length;
                          //         console.log(Ext.selectRow);
                          //       }
                          //     },
                          //     blur: function () {
                          //       this.getStore().clearFilter();
                          //     },
                          //   },
                          // }),
                          { xtype: "container", height: 8 },

                          { xtype: "container", height: 10 },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                // column 2
                columnWidth: 0.4,
                layout: "fit",
                // height: Ext.getBody().getViewSize().height * 0.8,
                // width: Ext.getBody().getViewSize().width * 0.25,
                border: false,
                items: [
                  {
                    xtype: "container",
                    layout: "hbox",
                    align: "stretch",
                    RemoveHeight: true,
                    labelWidth: 120,
                    defaults: { xtype: "fieldset", flex: 1, margins: "0px 3px", autoHeight: true },
                    items: [
                      {
                        title: "รายละเอียดการขอเบิก",
                        RemoveCls: "x-box-item",
                        collapsible: false,
                        collapsed: false,
                        border: false,
                        defaults: { labelStyle: "width:120px;" },
                        items: [
                          {
                            xtype: "textfield",
                            fieldLabel: "จำนวนรายการ",
                            name: "c_qty",
                            allowBlank: false,
                            id: "c_qtyID",
                            style: {
                              padding: "1px",
                              margin: "1px",
                              "background-color": "#fff",
                              "text-align": "left",
                              width: "100px",
                            },
                          },
                          {
                            xtype: "textfield",
                            allowBlank: false,
                            fieldLabel: "จำนวนเงินขอเบิก",
                            name: "f_total",
                            id: "f_total",
                            style: {
                              labelAlign: "right",
                              "font-weight": "bold",
                              padding: "1px",
                              margin: "1px",
                              color: "green",
                              "background-color": "#fff",
                              "text-align": "right",
                            },
                            listeners: {
                              afterrender: function () {
                                this.fn = function () {
                                  this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                                };
                              },
                              focus: function (value) {
                                this.setValue(this.getValue().replace(/,/g, ""));
                              },
                              Change: function (value) {
                                this.fn();
                                Ext.getCmp("f_inv_vat").setValue(floatRenderer(floatMinus(Ext.getCmp("f_total").getValue().replace(/,/g, ""))));
                                if (Ext.getCmp("f_vat_rate").getValue() != "") {
                                  var f_vat = (Ext.getCmp("f_inv_vat").getValue().replace(/,/g, "") / 1.07) * 0.07;
                                  f_vat = f_vat.toFixed(2);
                                  Ext.getCmp("f_vat").setValue(floatRenderer(floatMinus(f_vat, 2)));
                                }

                                var f_inv = Ext.getCmp("f_inv_vat").getValue().replace(/,/g, "") - Ext.getCmp("f_vat").getValue().replace(/,/g, "");
                                Ext.getCmp("f_inv").setValue(floatRenderer(floatMinus(f_inv.toFixed(2), 2)));

                                if (Ext.getCmp("f_tax_personal_rate").getValue() != "") {
                                  var f_tax_personal = Ext.getCmp("f_inv").getValue().replace(/,/g, "") * 0.01;
                                  f_tax_personal = Math.round(f_tax_personal * 100) / 100;
                                  Ext.getCmp("f_tax_personal").setValue(floatRenderer(floatMinus(f_tax_personal.toFixed(2), 2)));
                                }

                                f_per_pay_sum();
                              },
                              keyup: function () {
                                Ext.getCmp("f_inv_vat").setValue(floatRenderer(floatMinus(Ext.getCmp("f_total").getValue().replace(/,/g, ""))));
                                if (Ext.getCmp("f_vat_rate").getValue() != "") {
                                  var f_vat = (Ext.getCmp("f_inv_vat").getValue().replace(/,/g, "") / 1.07) * 0.07;
                                  f_vat = f_vat.toFixed(2);
                                  Ext.getCmp("f_vat").setValue(floatRenderer(floatMinus(f_vat, 2)));
                                }

                                var f_inv = Ext.getCmp("f_inv_vat").getValue().replace(/,/g, "") - Ext.getCmp("f_vat").getValue().replace(/,/g, "");
                                Ext.getCmp("f_inv").setValue(floatRenderer(floatMinus(f_inv.toFixed(2), 2)));

                                if (Ext.getCmp("f_tax_personal_rate").getValue() != "") {
                                  var f_tax_personal = Ext.getCmp("f_inv").getValue().replace(/,/g, "") * 0.01;
                                  f_tax_personal = Math.round(f_tax_personal * 100) / 100;
                                  Ext.getCmp("f_tax_personal").setValue(floatRenderer(floatMinus(f_tax_personal.toFixed(2), 2)));
                                }

                                f_per_pay_sum();
                              },
                            },
                          },
                          {
                            xtype: "datefield",
                            fieldLabel: "วันที่เกิดค่าใช่จ่าย/<br>วันที่ตรวจรับ",
                            allowBlank: false,
                            name: "d_audit_date",
                            id: "d_audit_date",
                          },
                          new Ext.form.ComboBox({
                            mode: "local",
                            allowBlank: false,
                            store: Ext.po_emp,
                            anchor: "90%",
                            fieldLabel: "ผู้ดำเนินการ",
                            submitValue: true,
                            id: "po_emp_id", //bg_expense_group_id
                            hiddenName: "po_emp_id", //bg_expense_group_id
                            name: "po_emp_name",
                            valueField: "id",
                            displayField: "c_name",
                            triggerAction: "all",
                            forceSelection: false,
                            selectOnFocus: true,
                            typeAhead: false,
                            // emptyText: "กรุณาเลือก...",
                            listeners: {
                              afterrender: function () {
                                this.fn = function () {};
                                ReadOnly_set("po_emp_id", true);
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
                            xtype: "datefield",
                            allowBlank: false,
                            fieldLabel: "วันที่ใบขอเบิก",
                            id: "d_doc_date",
                            name: "d_doc_date",
                            listeners: {
                              afterrender: function () {
                                this.fn = function () {};
                                ReadOnly_set("d_doc_date", true);
                              },
                            },
                          },
                          new Ext.form.ComboBox({
                            mode: "local",
                            // allowBlank: false,
                            hidden: Ext.INSIDE_COST ? false : true,
                            store: Ext.dc_user_approve,
                            anchor: "90%",
                            fieldLabel: "ผู้ตรวจสอบ",
                            submitValue: true,
                            id: "dc_approve_id",
                            hiddenName: "dc_approve_id",
                            name: "dc_approve_name",
                            valueField: "id",
                            displayField: "c_name",
                            triggerAction: "all",
                            forceSelection: false,
                            selectOnFocus: true,
                            typeAhead: false,
                            // emptyText: "กรุณาเลือก...",
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
                          {
                            xtype: "textarea",
                            // allowBlank: false,
                            fieldLabel: "คำอธิบายรายการ",
                            id: "c_commentID",
                            name: "c_comment",
                            // validator: function (val) {
                            //   return true;
                            // },
                            width: 200,
                            // height: "190",
                          },
                          // { xtype: "container", height: 4 },
                          {
                            xtype: "checkbox",
                            id: "i_reserve_pay",
                            boxLabel: "<b style='color: green; font-size: 12px;'>ผู้ทดรองจ่าย</b>",
                            // hidden: Ext.INSIDE_COST == 1 ? false : true,
                            inputValue: 1,
                            checked: false,
                            listeners: {
                              check: function (combo, newValue) {
                                if (newValue) {
                                  Ext.dc_acc.load({
                                    params: { bg_expense_id: Ext.getCmp("bg_expense_id").getValue() },
                                    callback: function () {
                                      if (Ext.dc_acc.data.length == 0) {
                                        Ext.getCmp("i_filter_acc").setValue(false);
                                      }
                                    },
                                  });
                                } else Ext.dc_acc.load();
                              },
                            },
                          },
                          {
                            xtype: "checkbox",
                            id: "i_doc_duo",
                            boxLabel: "<b style='color: blue; font-size: 12px;'>ใบเบิกแบบคู่</b>",
                            // hidden: Ext.INSIDE_COST == 1 ? false : true,
                            inputValue: 1,
                            checked: false,
                            listeners: {
                              check: function (combo, newValue) {
                                if (newValue) {
                                  Ext.dc_acc.load({
                                    params: { bg_expense_id: Ext.getCmp("bg_expense_id").getValue() },
                                    callback: function () {
                                      if (Ext.dc_acc.data.length == 0) {
                                        Ext.getCmp("i_filter_acc").setValue(false);
                                      }
                                    },
                                  });
                                } else Ext.dc_acc.load();
                              },
                            },
                          },
                          { xtype: "container", height: 20 },
                          {
                            xtype: "container",
                            layout: "hbox",
                            align: "stretch",
                            RemoveHeight: true,
                            width: 500,
                            defaults: { xtype: "fieldset", flex: 1, margins: "0px 3px", autoHeight: true },
                            items: [
                              {
                                title: "รายละเอียดเงิน",
                                RemoveCls: "x-box-item",
                                collapsible: false,
                                collapsed: false,
                                defaults: { labelStyle: "width:200px;", allowBlank: true },
                                items: [
                                  {
                                    xtype: "buttongroup", // เงินที่ได้รับจริงคงเหลือ
                                    frame: false,
                                    border: false,
                                    hidden: true,
                                    items: [
                                      {
                                        xtype: "tbspacer",
                                        width: 20,
                                      },
                                      {
                                        xtype: "label",
                                        style: { "white-space": "nowrap", "font-size": "12px" },
                                        text: "เงินที่ได้รับจริงคงเหลือ:",
                                      },
                                      {
                                        xtype: "tbspacer",
                                        width: 4,
                                      },
                                      {
                                        xtype: "textfield",
                                        width: 130,
                                        // name: "f_income_total",
                                        id: "f_income_total",
                                        style: {
                                          labelAlign: "right",
                                          "font-weight": "bold",
                                          padding: "1px",
                                          margin: "1px",
                                          color: "#FF6203",
                                          "background-color": "#fff",
                                          "text-align": "right",
                                          background: "#eee",
                                        },
                                        // style: "text-align: center;font-weight:bold; background:#eee;",
                                        readOnly: true,
                                        listeners: {
                                          afterrender: function (field) {
                                            this.fn = function () {
                                              this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                                            };
                                          },
                                          focus: function (value) {
                                            this.setValue(this.getValue().replace(/,/g, ""));
                                          },
                                          Change: function (value) {
                                            this.fn();
                                          },
                                        },
                                      },
                                      {
                                        xtype: "tbspacer",
                                        width: 5,
                                      },
                                      {
                                        text: "",
                                        iconCls: "icon-refresh",
                                        handler: function (grid, rowIndex, colIndex) {
                                          var i_budget_year = Ext.getCmp("i_budget_year").getValue();
                                          var dc_expense_budget_type_id = Ext.getCmp("dc_expense_budget_type_id").getValue();
                                          var bg_expense_id = Ext.getCmp("bg_expense_id").getValue();
                                          var dc_cost_idID = Ext.getCmp("dc_cost_idID").getValue();
                                          load_f_income_total(i_budget_year, dc_expense_budget_type_id, bg_expense_id, dc_cost_idID);
                                        },
                                        listeners: {
                                          render: function (c) {
                                            var text_ToolTip = "<span style='white-space:nowrap;'>ดึงข้อมูลเงินอีกครั้ง</span>";
                                            new Ext.ToolTip({
                                              target: c.btnEl.id,
                                              anchor: "top",
                                              html: text_ToolTip,
                                            });
                                          },
                                        },
                                      },
                                    ],
                                  },
                                  { xtype: "container", height: 10 },
                                  {
                                    xtype: "buttongroup", // จำนวนเงิน
                                    frame: false,
                                    border: false,
                                    items: [
                                      {
                                        xtype: "tbspacer",
                                        width: 80,
                                      },
                                      {
                                        xtype: "label",
                                        style: { "white-space": "nowrap", "font-size": "12px" },
                                        text: "จำนวนเงิน:",
                                      },
                                      {
                                        xtype: "tbspacer",
                                        width: 4,
                                      },
                                      {
                                        xtype: "textfield",
                                        width: 130,
                                        name: "f_inv",
                                        allowBlank: false,
                                        id: "f_inv",
                                        enableKeyEvents: true,
                                        style: {
                                          labelAlign: "right",
                                          "font-weight": "bold",
                                          padding: "1px",
                                          margin: "1px",
                                          color: "blue",
                                          "background-color": "#fff",
                                          "text-align": "right",
                                        },

                                        listeners: {
                                          afterrender: function (field) {
                                            this.fn = function () {
                                              this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                                            };
                                          },
                                          focus: function (value) {
                                            this.setValue(this.getValue().replace(/,/g, ""));
                                          },
                                          Change: function (value) {
                                            this.fn();
                                          },
                                          keyup: function (me, e) {
                                            var f_inv_vat = parseFloat(Ext.getCmp("f_inv").getValue().replace(/,/g, "")) + parseFloat(Ext.getCmp("f_vat").getValue().replace(/,/g, "") - 0);
                                            Ext.getCmp("f_inv_vat").setValue(floatRenderer(floatMinus(f_inv_vat.toFixed(2), 2)));

                                            if (Ext.getCmp("f_tax_personal_rate").getValue() != "") {
                                              var f_tax_personal = Ext.getCmp("f_inv").getValue().replace(/,/g, "") * 0.01;
                                              f_tax_personal = Math.round(f_tax_personal * 100) / 100;
                                              Ext.getCmp("f_tax_personal").setValue(floatRenderer(floatMinus(f_tax_personal.toFixed(2), 2)));
                                            }
                                            f_per_pay_sum();
                                          },
                                        },
                                      },
                                    ],
                                  },
                                  {
                                    xtype: "buttongroup", // ภาษีมูลค่าเพิ่ม
                                    frame: false,
                                    border: false,
                                    items: [
                                      {
                                        xtype: "tbspacer",
                                        width: 38,
                                      },
                                      {
                                        xtype: "label",
                                        style: { "white-space": "nowrap", "font-size": "12px" },
                                        text: "ภาษีมูลค่าเพิ่ม :",
                                      },
                                      {
                                        xtype: "tbspacer",
                                        width: 5,
                                      },
                                      {
                                        xtype: "checkbox",
                                        boxLabel: "",
                                        id: "check_vat",
                                        inputValue: 1,
                                        checked: false,
                                        listeners: {
                                          check: function (combo, newValue) {
                                            if (newValue) {
                                              Ext.getCmp("f_vat").setReadOnly(false);
                                              Ext.getCmp("f_vat").el.setStyle("background", "#fff");

                                              Ext.getCmp("f_vat_rate").setReadOnly(false);
                                              Ext.getCmp("f_vat_rate").setValue("7");
                                              Ext.getCmp("f_vat_rate").el.setStyle("background", "#fff");

                                              var f_vat = (Ext.getCmp("f_inv_vat").getValue().replace(/,/g, "") / 1.07) * 0.07;
                                              f_vat = Math.round(f_vat * 100) / 100;

                                              f_vat = f_vat.toFixed(2);
                                              Ext.getCmp("f_vat").setValue(floatRenderer(floatMinus(f_vat, 2)));

                                              var f_inv = Ext.getCmp("f_inv_vat").getValue().replace(/,/g, "") - Ext.getCmp("f_vat").getValue().replace(/,/g, "");
                                              Ext.getCmp("f_inv").setValue(floatRenderer(floatMinus(f_inv.toFixed(2), 2)));
                                            } else {
                                              Ext.getCmp("f_vat").setReadOnly(true);
                                              Ext.getCmp("f_vat").el.setStyle("background", "#eee");

                                              Ext.getCmp("f_vat_rate").setReadOnly(true);
                                              Ext.getCmp("f_vat_rate").setValue();
                                              Ext.getCmp("f_vat_rate").el.setStyle("background", "#eee");

                                              Ext.getCmp("f_vat_rate").setValue("");
                                              Ext.getCmp("f_vat").setValue("");

                                              // Ext.getCmp("f_inv_vat").setValue(Ext.getCmp("f_totalID").getValue().toFixed(2));

                                              var f_inv = Ext.getCmp("f_inv_vat").getValue().replace(/,/g, "") - Ext.getCmp("f_vat").getValue().replace(/,/g, "");
                                              Ext.getCmp("f_inv").setValue(floatRenderer(floatMinus(f_inv.toFixed(2), 2)));
                                            }
                                            if (Ext.getCmp("f_tax_personal_rate").getValue() != "") {
                                              var f_tax_personal = Ext.getCmp("f_inv").getValue().replace(/,/g, "") * 0.01;
                                              f_tax_personal = Math.round(f_tax_personal * 100) / 100;
                                              Ext.getCmp("f_tax_personal").setValue(floatRenderer(floatMinus(f_tax_personal.toFixed(2), 2)));
                                            }
                                            f_per_pay_sum();
                                          },
                                          checkchange: function (combo, newValue) {},
                                        },
                                      },
                                      {
                                        xtype: "tbspacer",
                                        width: 4,
                                      },
                                      {
                                        xtype: "textfield",
                                        width: 130,
                                        name: "f_vat",
                                        id: "f_vat",
                                        enableKeyEvents: true,
                                        style: {
                                          labelAlign: "right",
                                          "font-weight": "bold",
                                          padding: "1px",
                                          margin: "1px",
                                          color: "blue",
                                          "background-color": "#fff",
                                          "text-align": "right",
                                        },
                                        listeners: {
                                          afterrender: function () {
                                            this.fn = function () {
                                              this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                                            };
                                          },
                                          focus: function (value) {
                                            this.setValue(this.getValue().replace(/,/g, ""));
                                          },
                                          Change: function (value) {
                                            this.fn();
                                          },
                                          keyup: function (me, e) {
                                            var f_inv_vat = parseFloat(Ext.getCmp("f_inv").getValue().replace(/,/g, "")) + parseFloat(Ext.getCmp("f_vat").getValue().replace(/,/g, ""));
                                            Ext.getCmp("f_inv_vat").setValue(floatRenderer(floatMinus(f_inv_vat.toFixed(2), 2)));
                                            f_per_pay_sum();
                                          },
                                        },
                                      },
                                      {
                                        xtype: "tbspacer",
                                        width: 10,
                                      },
                                      {
                                        xtype: "label",
                                        style: { "white-space": "nowrap", "font-size": "12px" },
                                        text: "(%): ",
                                      },
                                      {
                                        xtype: "tbspacer",
                                        width: 4,
                                      },
                                      {
                                        xtype: "textfield",
                                        width: 25,
                                        name: "f_vat_rate",
                                        id: "f_vat_rate",
                                        style: {
                                          labelAlign: "right",
                                          "font-weight": "bold",
                                          padding: "1px",
                                          margin: "1px",
                                          color: "blue",
                                          "background-color": "#fff",
                                          background: "#eee",
                                          "text-align": "center",
                                        },
                                        readOnly: true,
                                        maskRe: /[0-9.-]/,
                                        listeners: {
                                          afterrender: function () {
                                            this.fn = function () {
                                              // this.setValue(floatRenderer(this.getValue().replace(/,/g, "")));
                                            };
                                          },
                                          focus: function (value) {
                                            this.setValue(this.getValue().replace(/,/g, ""));
                                          },
                                          Change: function (value) {
                                            this.fn();
                                          },
                                        },
                                      },
                                    ],
                                  },
                                  {
                                    xtype: "buttongroup", // จำนวนเงินขอเบิก
                                    frame: false,
                                    border: false,
                                    items: [
                                      {
                                        xtype: "tbspacer",
                                        width: 46,
                                      },
                                      {
                                        xtype: "label",
                                        style: { "white-space": "nowrap", "font-size": "12px" },
                                        text: "จำนวนเงินขอเบิก: ",
                                      },
                                      {
                                        xtype: "tbspacer",
                                        width: 4,
                                      },
                                      {
                                        xtype: "textfield",
                                        width: 130,
                                        allowBlank: false,
                                        name: "f_inv_vat",
                                        id: "f_inv_vat",
                                        style: {
                                          labelAlign: "right",
                                          "font-weight": "bold",
                                          padding: "1px",
                                          margin: "1px",
                                          color: "green",
                                          "background-color": "#fff",
                                          background: "#eee",
                                          "text-align": "right",
                                        },
                                        readOnly: true,
                                        listeners: {
                                          afterrender: function () {
                                            this.fn = function () {
                                              this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                                            };
                                          },
                                          focus: function (value) {
                                            this.setValue(this.getValue().replace(/,/g, ""));
                                          },
                                          Change: function (value) {
                                            this.fn();
                                          },
                                        },
                                      },
                                    ],
                                  },
                                  { xtype: "container", height: 10 },
                                  {
                                    xtype: "buttongroup", // ภาษีหัก ณ ที่จ่าย
                                    frame: false,
                                    border: false,
                                    items: [
                                      {
                                        xtype: "tbspacer",
                                        width: 30,
                                      },
                                      {
                                        xtype: "label",
                                        style: { "white-space": "nowrap", "font-size": "12px" },
                                        text: "ภาษีหัก ณ ที่จ่าย: ",
                                      },
                                      {
                                        xtype: "tbspacer",
                                        width: 5,
                                      },
                                      {
                                        xtype: "checkbox",
                                        boxLabel: "",
                                        id: "check_tax_personal",
                                        inputValue: 1,
                                        checked: false,
                                        listeners: {
                                          check: function (combo, newValue) {
                                            if (newValue) {
                                              Ext.getCmp("f_tax_personal_rate").setReadOnly(false);
                                              Ext.getCmp("f_tax_personal_rate").setValue("1");
                                              Ext.getCmp("f_tax_personal_rate").el.setStyle("background", "#fff");

                                              Ext.getCmp("f_tax_personal").setReadOnly(false);
                                              Ext.getCmp("f_tax_personal").el.setStyle("background", "#fff");
                                              var f_tax_personal = Ext.getCmp("f_inv").getValue().replace(/,/g, "") * 0.01;
                                              f_tax_personal = Math.round(f_tax_personal * 100) / 100;
                                              Ext.getCmp("f_tax_personal").setValue(floatRenderer(floatMinus(f_tax_personal.toFixed(2), 2)));
                                              f_per_pay_sum();
                                            } else {
                                              Ext.getCmp("f_tax_personal").setReadOnly(true);
                                              Ext.getCmp("f_tax_personal").el.setStyle("background", "#eee");
                                              Ext.getCmp("f_tax_personal_rate").setReadOnly(true);
                                              Ext.getCmp("f_tax_personal_rate").setValue("");
                                              Ext.getCmp("f_tax_personal_rate").el.setStyle("background", "#eee");
                                              Ext.getCmp("f_tax_personal").setValue("");
                                              f_per_pay_sum();
                                            }
                                          },
                                        },
                                      },
                                      {
                                        xtype: "tbspacer",
                                        width: 4,
                                      },
                                      {
                                        xtype: "textfield",
                                        width: 130,
                                        name: "f_tax_personal",
                                        id: "f_tax_personal",
                                        enableKeyEvents: true,
                                        style: {
                                          labelAlign: "right",
                                          "font-weight": "bold",
                                          padding: "1px",
                                          margin: "1px",
                                          color: "red",
                                          "background-color": "#fff",
                                          "text-align": "right",
                                        },
                                        listeners: {
                                          afterrender: function () {
                                            this.fn = function () {
                                              this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                                            };
                                          },
                                          focus: function (value) {
                                            this.setValue(this.getValue().replace(/,/g, ""));
                                          },
                                          Change: function (value) {
                                            this.fn();
                                          },
                                          keyup: function () {
                                            f_per_pay_sum();
                                          },
                                        },
                                      },
                                      {
                                        xtype: "tbspacer",
                                        width: 10,
                                      },
                                      {
                                        xtype: "label",
                                        style: { "white-space": "nowrap", "font-size": "12px" },
                                        text: "(%): ",
                                      },
                                      {
                                        xtype: "tbspacer",
                                        width: 4,
                                      },
                                      {
                                        xtype: "textfield",
                                        name: "f_tax_personal_rate",
                                        id: "f_tax_personal_rate",
                                        maskRe: /[0-9.-]/,
                                        width: 25,
                                        enableKeyEvents: true,
                                        style: {
                                          labelAlign: "right",
                                          "font-weight": "bold",
                                          padding: "1px",
                                          margin: "1px",
                                          color: "red",
                                          "background-color": "#fff",
                                          background: "#eee",
                                          "text-align": "center",
                                        },
                                        readOnly: true,
                                        maskRe: /[0-9.-]/,
                                        listeners: {
                                          afterrender: function () {
                                            this.fn = function () {
                                              // this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                                            };
                                          },
                                          focus: function (value) {
                                            this.setValue(this.getValue().replace(/,/g, ""));
                                          },
                                          Change: function (value) {
                                            this.fn();
                                          },
                                          keyup: function () {
                                            f_per_pay_sum();
                                          },
                                        },
                                      },
                                    ],
                                  },
                                  {
                                    xtype: "buttongroup", // ค่าประกันสังคม
                                    frame: false,
                                    border: false,
                                    items: [
                                      {
                                        xtype: "tbspacer",
                                        width: 57,
                                      },
                                      {
                                        xtype: "label",
                                        style: { "white-space": "nowrap", "font-size": "12px" },
                                        text: "ค่าประกันสังคม: ",
                                      },
                                      {
                                        xtype: "tbspacer",
                                        width: 4,
                                      },
                                      {
                                        xtype: "textfield",
                                        width: 130,
                                        name: "f_social_security",
                                        id: "f_social_security",
                                        enableKeyEvents: true,
                                        style: {
                                          labelAlign: "right",
                                          "font-weight": "bold",
                                          padding: "1px",
                                          margin: "1px",
                                          color: "red",
                                          "background-color": "#fff",
                                          "text-align": "right",
                                        },
                                        listeners: {
                                          afterrender: function () {
                                            this.fn = function () {
                                              this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                                            };
                                          },
                                          focus: function (value) {
                                            this.setValue(this.getValue().replace(/,/g, ""));
                                          },
                                          Change: function (value) {
                                            this.fn();
                                          },
                                          keyup: function () {
                                            f_per_pay_sum();
                                          },
                                        },
                                      },
                                    ],
                                  },
                                  {
                                    xtype: "buttongroup", // กองทุนสำรองเลื้ยงชีพ
                                    frame: false,
                                    border: false,
                                    items: [
                                      {
                                        xtype: "tbspacer",
                                        width: 23,
                                      },
                                      {
                                        xtype: "label",
                                        style: { "white-space": "nowrap", "font-size": "12px" },
                                        text: "กองทุนสำรองเลื้ยงชีพ: ",
                                      },
                                      {
                                        xtype: "tbspacer",
                                        width: 4,
                                      },
                                      {
                                        xtype: "textfield",
                                        width: 130,
                                        name: "f_prov_fund",
                                        id: "f_prov_fund",
                                        enableKeyEvents: true,
                                        style: {
                                          labelAlign: "right",
                                          "font-weight": "bold",
                                          padding: "1px",
                                          margin: "1px",
                                          color: "red",
                                          "background-color": "#fff",
                                          "text-align": "right",
                                        },
                                        listeners: {
                                          afterrender: function () {
                                            this.fn = function () {
                                              this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                                            };
                                          },
                                          focus: function (value) {
                                            this.setValue(this.getValue().replace(/,/g, ""));
                                          },
                                          Change: function (value) {
                                            this.fn();
                                          },
                                          keyup: function () {
                                            f_per_pay_sum();
                                          },
                                        },
                                      },
                                    ],
                                  },
                                  {
                                    xtype: "buttongroup", // ค่าปรับ
                                    frame: false,
                                    border: false,
                                    items: [
                                      {
                                        xtype: "tbspacer",
                                        width: 98,
                                      },
                                      {
                                        xtype: "label",
                                        style: { "white-space": "nowrap", "font-size": "12px" },
                                        text: "ค่าปรับ: ",
                                      },
                                      {
                                        xtype: "tbspacer",
                                        width: 4,
                                      },
                                      {
                                        xtype: "textfield",
                                        width: 130,
                                        name: "f_fine",
                                        id: "f_fine",
                                        enableKeyEvents: true,
                                        style: {
                                          labelAlign: "right",
                                          "font-weight": "bold",
                                          padding: "1px",
                                          margin: "1px",
                                          color: "red",
                                          "background-color": "#fff",
                                          "text-align": "right",
                                        },
                                        listeners: {
                                          afterrender: function () {
                                            this.fn = function () {
                                              this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                                            };
                                          },
                                          focus: function (value) {
                                            this.setValue(this.getValue().replace(/,/g, ""));
                                          },
                                          Change: function (value) {
                                            this.fn();
                                          },
                                          keyup: function () {
                                            f_per_pay_sum();
                                          },
                                        },
                                      },
                                    ],
                                  },
                                  {
                                    xtype: "buttongroup", // ค่าประกันผลงาน
                                    frame: false,
                                    border: false,
                                    items: [
                                      {
                                        xtype: "tbspacer",
                                        width: 52,
                                      },
                                      {
                                        xtype: "label",
                                        style: { "white-space": "nowrap", "font-size": "12px" },
                                        text: "ค่าประกันผลงาน: ",
                                      },
                                      {
                                        xtype: "tbspacer",
                                        width: 4,
                                      },
                                      {
                                        xtype: "textfield",
                                        width: 130,
                                        name: "f_warranty",
                                        id: "f_warranty",
                                        enableKeyEvents: true,
                                        style: {
                                          labelAlign: "right",
                                          "font-weight": "bold",
                                          padding: "1px",
                                          margin: "1px",
                                          color: "red",
                                          "background-color": "#fff",
                                          "text-align": "right",
                                        },
                                        listeners: {
                                          afterrender: function () {
                                            this.fn = function () {
                                              this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                                            };
                                          },
                                          focus: function (value) {
                                            this.setValue(this.getValue().replace(/,/g, ""));
                                          },
                                          Change: function (value) {
                                            this.fn();
                                          },
                                          keyup: function () {
                                            f_per_pay_sum();
                                          },
                                        },
                                      },
                                    ],
                                  },
                                  {
                                    xtype: "buttongroup", // อื่นๆ
                                    frame: false,
                                    border: false,
                                    items: [
                                      {
                                        xtype: "tbspacer",
                                        width: 111,
                                      },
                                      {
                                        xtype: "label",
                                        style: { "white-space": "nowrap", "font-size": "12px" },
                                        text: "อื่นๆ: ",
                                      },
                                      {
                                        xtype: "tbspacer",
                                        width: 4,
                                      },
                                      {
                                        xtype: "textfield",
                                        width: 130,
                                        name: "f_other",
                                        id: "f_other",
                                        enableKeyEvents: true,
                                        style: {
                                          labelAlign: "right",
                                          "font-weight": "bold",
                                          padding: "1px",
                                          margin: "1px",
                                          color: "red",
                                          "background-color": "#fff",
                                          "text-align": "right",
                                        },
                                        listeners: {
                                          afterrender: function () {
                                            this.fn = function () {
                                              this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                                            };
                                          },
                                          focus: function (value) {
                                            this.setValue(this.getValue().replace(/,/g, ""));
                                          },
                                          Change: function (value) {
                                            this.fn();
                                          },
                                          keyup: function () {
                                            f_per_pay_sum();
                                          },
                                        },
                                      },
                                    ],
                                  },
                                  {
                                    xtype: "buttongroup", // จำนวนเงินที่จ่าย
                                    frame: false,
                                    border: false,
                                    items: [
                                      {
                                        xtype: "tbspacer",
                                        width: 53,
                                      },
                                      {
                                        xtype: "label",
                                        style: { "white-space": "nowrap", "font-size": "12px" },
                                        text: "จำนวนเงินที่จ่าย: ",
                                      },
                                      {
                                        xtype: "tbspacer",
                                        width: 4,
                                      },
                                      {
                                        xtype: "textfield",
                                        width: 130,
                                        name: "f_pay",
                                        id: "f_pay",
                                        readOnly: true,
                                        enableKeyEvents: true,
                                        style: {
                                          labelAlign: "right",
                                          "font-weight": "bold",
                                          padding: "1px",
                                          margin: "1px",
                                          color: "blue",
                                          "background-color": "#fff",
                                          background: "#eee",
                                          "text-align": "right",
                                        },
                                        listeners: {
                                          afterrender: function () {
                                            this.fn = function () {
                                              this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                                            };
                                          },
                                          focus: function (value) {
                                            this.setValue(this.getValue().replace(/,/g, ""));
                                          },
                                          Change: function (value) {
                                            this.fn();
                                          },
                                          keyup: function () {
                                            // f_per_pay_sum();
                                          },
                                        },
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                      {
                        xtype: "hidden", //afterrender_end
                        listeners: {
                          afterrender: function () {
                            // setTimeout(function () {
                            // if (Ext.butt == "edit") {
                            //   Ext.getCmp("i_edit_pdf1ID").show();
                            //   Ext.getCmp("btn_pdf1").show();
                            //   Ext.getCmp("upload_pdf1").hide();
                            //   Ext.getCmp("btn_pdf2").show();
                            //   Ext.getCmp("upload_pdf2").hide();
                            //   Ext.getCmp("i_edit_pdf2ID").show();
                            // } else {
                            //   Ext.getCmp("i_edit_pdf1ID").hide();
                            //   Ext.getCmp("btn_pdf1").hide();
                            //   Ext.getCmp("btn_pdf2").hide();
                            //   Ext.getCmp("i_edit_pdf2ID").hide();
                            // }
                            // if (Ext.getCmp("pdf_upload_mode").getValue().inputValue == 1) {
                            //   Ext.getCmp("BuGroupPdf1").hide();
                            //   Ext.getCmp("upload_pdf1").hide();
                            // }
                            // if (Ext.getCmp("modesubID").getValue().inputValue == "ADD") {
                            //   Ext.getCmp("i_edit_pdf2ID").setValue({ i_edit_pdf2IDs1: true });
                            //   Ext.getCmp("upload_pdf2").show();
                            //   Ext.getCmp("title_pdf").setTitle("เอกสารประกอบการใบขอเบิก");
                            //   Ext.getCmp("title_pdf").setTitle("เอกสารประกอบการใบขอเบิก");
                            //   if (!(Ext.butt == "edit")) {
                            //     Ext.getCmp("i_edit_pdf1ID").setValue({ i_edit_pdf1IDs1: true });
                            //     Ext.getCmp("upload_pdf1").show();
                            //   }
                            // }
                            // }, 1000);
                          },
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
            layout: "hbox",
            id: "group_input_box_3",
            align: "stretch",
            defaults: { margins: "0px 3px" },
            items: [
              new Ext.grid.EditorGridPanel({
                region: "center",
                layout: "fit",
                // title: "รายการบัญชี",
                id: "gridAcc",
                height: 260,
                // border: false,
                stripeRows: true,
                loadMask: true,
                clicksToEdit: 1,
                store: Ext.po_working_begin_item,
                viewConfig: {
                  forceFit: true,
                  emptyText: "ไม่มีข้อมูล..",
                  deferEmptyText: false,
                },
                listeners: {
                  afterRender: function (grid) {
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
                            grid.store.load({ params: { show_sql: 1 } });
                          },
                        });
                      }
                      menu.showAt(e.getXY());
                    });
                  },
                },
                tbar: [
                  {
                    xtype: "buttongroup",
                    title: "ข้อมูลการตั้งหนี้",
                    columns: 1,
                    frame: false,
                    defaults: { scale: "small", style: "float: left" },
                    listeners: {
                      afterrender: function () {
                        var headerEl = Ext.get(this.header.id);
                        if (headerEl) headerEl.setStyle("text-align", "left");
                      },
                    },
                    items: [
                      {
                        xtype: "buttongroup",
                        frame: false,
                        items: [
                          { xtype: "tbspacer", width: 70 },
                          { xtype: "label", text: "เลขที่ตั้งหนี้ : " },
                          { xtype: "tbspacer", width: 4 },
                          {
                            xtype: "textfield",
                            width: 120,
                            id: "c_code_debt",
                            name: "c_code_debt",
                            readOnly: true,
                            // value: "AP0320241000001",
                            style: {
                              "font-weight": "bold",
                              padding: "1px",
                              margin: "1px",
                              color: "#000",
                              "text-align": "center",
                              background: "#EEEEEE",
                              color: "#333",
                              border: "1px solid #ADADAD",
                            },
                          },
                          { xtype: "tbspacer", width: 9 },
                          { xtype: "label", text: "วันที่ตั้งหนี้ : " },
                          { xtype: "tbspacer", width: 4 },
                          {
                            xtype: "textfield",
                            width: 90,
                            id: "d_debt_date",
                            name: "d_debt_date",
                            readOnly: true,
                            style: {
                              "font-weight": "bold",
                              padding: "1px",
                              margin: "1px",
                              color: "#000",
                              "text-align": "center",
                              background: "#EEEEEE",
                              color: "#333",
                              border: "1px solid #ADADAD",
                            },
                          },
                        ],
                      },
                      { xtype: "container", height: 3 },
                      {
                        xtype: "buttongroup",
                        frame: false,
                        items: [
                          { xtype: "tbspacer", width: 25 },
                          { xtype: "label", text: "เดือนปีที่เกิดค่าใช่จ่าย : " },
                          { xtype: "tbspacer", width: 4 },
                          {
                            id: "c_debt_month",
                            name: "c_debt_month",
                            hiddenName: "c_debt_month",
                            xtype: "combo",
                            width: 175,
                            mode: "local",
                            store: new Ext.data.SimpleStore({
                              fields: ["id", "c_name"],
                              data: [
                                ["01", "มกราคม (ม.ค.)"],
                                ["02", "กุมภาพันธ์ (ก.พ.)"],
                                ["03", "มีนาคม (มี.ค.)"],
                                ["04", "เมษายน (เม.ย.)"],
                                ["05", "พฤษภาคม (พ.ค.)"],
                                ["06", "มิถุนายน (มิ.ย.)"],
                                ["07", "กรกฎาคม (ก.ค.)"],
                                ["08", "สิงหาคม (ส.ค.)"],
                                ["09", "กันยายน (ก.ย.)"],
                                ["10", "ตุลาคม (ต.ค.)"],
                                ["11", "พฤศจิกายน (พ.ย.)"],
                                ["12", "ธันวาคม (ธ.ค.)"],
                              ],
                            }),
                            valueField: "id",
                            displayField: "c_name",
                            triggerAction: "all",
                            forceSelection: true,
                            selectOnFocus: true,
                            typeAhead: false,
                            emptyText: "กรุณาเลือก...",
                            value: (new Date().getMonth() + 1).toString().padStart(2, "0"),
                          },
                          { xtype: "tbspacer", width: 9 },
                          {
                            id: "c_debt_year",
                            name: "c_debt_year",
                            hiddenName: "c_debt_year",
                            xtype: "combo",
                            width: 90,
                            mode: "local",
                            store: Ext.store_year,
                            valueField: "id",
                            displayField: "c_name",
                            triggerAction: "all",
                            forceSelection: true,
                            selectOnFocus: true,
                            typeAhead: false,
                            emptyText: "กรุณาเลือก...",
                            value: new Date().getFullYear(),
                          },
                          { xtype: "tbspacer", width: 3 },
                        ],
                      },
                      {
                        xtype: "buttongroup",
                        frame: false,
                        items: [
                          {
                            text: "เพิ่มข้อมูลรายการ",
                            id: "button_add_acc",
                            iconCls: "icon-add",
                            handler: function (grid, rowIndex, colIndex) {
                              if (Ext.po_working_begin_item.data.length > 0) {
                                var myNewRecord = new po_working_begin_item_Record({
                                  id: "",
                                  c_month: Ext.getCmp("c_debt_month").getValue(),
                                  dc_acc_id: "",
                                  f_inv: "",
                                  f_vat: "",
                                  f_inv_vat: "",
                                  c_comment: "",
                                });
                                Ext.po_working_begin_item.add(myNewRecord);
                              } else {
                                var myNewRecord = new po_working_begin_item_Record({
                                  id: "",
                                  c_month: Ext.getCmp("c_debt_month").getValue(),
                                  dc_acc_id: Ext.dc_acc.data.length == 1 ? Ext.dc_acc.getAt(0).data.id : "",
                                  f_inv: Ext.getCmp("f_inv").getValue(),
                                  f_vat: Ext.getCmp("f_vat").getValue(),
                                  f_inv_vat: Ext.getCmp("f_inv_vat").getValue(),
                                  c_comment: "",
                                });
                                Ext.po_working_begin_item.add(myNewRecord);
                                sum_debt_label();
                              }
                            },
                          },
                          { xtype: "tbspacer", width: 30 },
                          {
                            xtype: "label",
                            text: "*กรณีเกิดค่าใช้จ่ายหลายเดือน ให้ระบุเดือนสุดท้าย",
                            style: { color: "red" },
                          },
                          { xtype: "tbspacer", width: 30 },
                          // {
                          //   xtype: "checkbox",
                          //   id: "i_filter_acc",
                          //   boxLabel: "<b style='color: blue; font-size: 12px;'>กรองเฉพาะรายการค่าใช้จ่าย</b>",
                          //   // hidden: Ext.INSIDE_COST == 1 ? false : true,
                          //   inputValue: 1,
                          //   checked: false,
                          //   listeners: {
                          //     check: function (combo, newValue) {
                          //       if (newValue) Ext.dc_acc.load({ params: { i_filter_acc: "5" } });
                          //       else Ext.dc_acc.load();
                          //     },
                          //   },
                          // },
                          {
                            xtype: "checkbox",
                            id: "i_filter_acc",
                            boxLabel: "<b style='color: blue; font-size: 12px;'>กรองรายการตามระบบ</b>",
                            // hidden: Ext.INSIDE_COST == 1 ? false : true,
                            inputValue: 1,
                            checked: false,
                            listeners: {
                              check: function (combo, newValue) {
                                if (newValue) {
                                  Ext.dc_acc.load({
                                    params: { bg_expense_id: Ext.getCmp("bg_expense_id").getValue() },
                                    callback: function () {
                                      if (Ext.dc_acc.data.length == 0) {
                                        Ext.getCmp("i_filter_acc").setValue(false);
                                      }
                                    },
                                  });
                                } else Ext.dc_acc.load();
                              },
                            },
                          },
                        ],
                      },
                      { xtype: "container", height: 4 },
                    ],
                  },
                ],
                columns: [
                  new Ext.grid.RowNumberer(),
                  // new Ext.grid.RowNumberer({
                  //   header: "ที่",
                  //   width: 30,
                  //   renderer: function (value, metaData, record, row, col, store, gridView) {
                  //     return record.get("no");
                  //   },
                  // }),
                  // {
                  //   id: "edit",
                  //   header: "-",
                  //   sortable: false,
                  //   align: "center",
                  //   width: 50,
                  //   dataIndex: "id",
                  //   renderer: function (value, metaData, record, row, col, store, gridView) {
                  //     return "<button style='font-size:11px; cursor:pointer; color: green;'>แก้ไข</button>";
                  //   },
                  // },
                  // {
                  //   id: "dc_acc_id",
                  //   header: "รายการบัญชีย่อย",
                  //   sortable: false,
                  //   align: "center",
                  //   width: 300,
                  //   dataIndex: "dc_acc_id",
                  // },
                  {
                    header: "เดือนเกิดค่าใช้จ่าย",
                    sortable: false,
                    width: 50,
                    align: "center",
                    dataIndex: "c_month",
                    editor: new Ext.form.ComboBox({
                      mode: "local",
                      id: "editor_c_month",
                      store: new Ext.data.SimpleStore({
                        fields: ["id", "c_name"],
                        data: [
                          ["01", "มกราคม (ม.ค.)"],
                          ["02", "กุมภาพันธ์ (ก.พ.)"],
                          ["03", "มีนาคม (มี.ค.)"],
                          ["04", "เมษายน (เม.ย.)"],
                          ["05", "พฤษภาคม (พ.ค.)"],
                          ["06", "มิถุนายน (มิ.ย.)"],
                          ["07", "กรกฎาคม (ก.ค.)"],
                          ["08", "สิงหาคม (ส.ค.)"],
                          ["09", "กันยายน (ก.ย.)"],
                          ["10", "ตุลาคม (ต.ค.)"],
                          ["11", "พฤศจิกายน (พ.ย.)"],
                          ["12", "ธันวาคม (ธ.ค.)"],
                        ],
                      }),
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
                        let name = getStoreItems(
                          new Ext.data.SimpleStore({
                            fields: ["id", "c_name"],
                            data: [
                              ["01", "มกราคม (ม.ค.)"],
                              ["02", "กุมภาพันธ์ (ก.พ.)"],
                              ["03", "มีนาคม (มี.ค.)"],
                              ["04", "เมษายน (เม.ย.)"],
                              ["05", "พฤษภาคม (พ.ค.)"],
                              ["06", "มิถุนายน (มิ.ย.)"],
                              ["07", "กรกฎาคม (ก.ค.)"],
                              ["08", "สิงหาคม (ส.ค.)"],
                              ["09", "กันยายน (ก.ย.)"],
                              ["10", "ตุลาคม (ต.ค.)"],
                              ["11", "พฤศจิกายน (พ.ย.)"],
                              ["12", "ธันวาคม (ธ.ค.)"],
                            ],
                          }),
                          value,
                          "c_name"
                        );
                        return name;
                      } else {
                        metaData.attr = "style='text-align: center; color:red;'";
                        return "-";
                      }
                    },
                  },
                  {
                    id: "dc_acc_id",
                    header: "รายการ",
                    sortable: false,
                    width: 250,
                    align: "center",
                    dataIndex: "dc_acc_id",
                    editor: new Ext.form.ComboBox({
                      mode: "local",
                      id: "editor_dc_acc_id",
                      store: Ext.dc_acc,
                      valueField: "id",
                      displayField: "c_name",
                      triggerAction: "all",
                      forceSelection: true,
                      selectOnFocus: true,
                      typeAhead: false,
                      emptyText: "กรุณาเลือก...",
                      listeners: {
                        render: function (combo) {
                          tooltip_ComboBox(combo, "c_name");
                        },
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
                        let name = getStoreItems(Ext.dc_acc, value, "c_name");
                        return name;
                      } else {
                        metaData.attr = "style='text-align: center; color:red;'";
                        return "-";
                      }
                    },
                  },
                  {
                    header: "จำนวนเงิน<br>(ก่อน Vat)",
                    sortable: false,
                    align: "center",
                    dataIndex: "f_inv",
                    width: 60,
                    editor: new Ext.form.TextField({
                      style: "text-align: right; color:blue;",
                      listeners: {
                        afterrender: function () {
                          this.fn = function () {
                            this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                          };
                        },
                        Change: function (value) {
                          this.fn();
                          setTimeout(() => {
                            var record = this.gridEditor.record;
                            if (record.data.f_vat) {
                              var cal = calculate_vat(record, 1);
                              record.set("f_vat", cal.f_vat);
                              record.set("f_inv_vat", cal.f_inv_vat);
                            } else {
                              record.set("f_inv_vat", record.data.f_inv);
                            }
                            sum_debt_label();
                          }, 250);
                        },
                      },
                    }),
                    renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                      if (value) {
                        metaData.attr = "style='text-align: right; color:blue;'";
                        return floatRenderer(floatMinus(value.replace(/,/g, ""), 2));
                      } else {
                        metaData.attr = "style='text-align: right; color:red;'";
                        return "-";
                      }
                    },
                  },
                  {
                    header: "ภาษีมูลค่าเพิ่ม",
                    sortable: false,
                    align: "center",
                    dataIndex: "f_vat",
                    width: 60,
                    editor: new Ext.form.TextField({
                      style: "text-align: right; color:blue;",
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
                        metaData.attr = "style='text-align: right; color:blue;'";
                        return floatRenderer(floatMinus(value.replace(/,/g, ""), 2));
                      } else {
                        metaData.attr = "style='text-align: right; color:red;'";
                        return "-";
                      }
                    },
                  },
                  {
                    header: "จำนวนเงิน<br>(รวม Vat)",
                    sortable: false,
                    align: "center",
                    dataIndex: "f_inv_vat",
                    width: 60,
                    editor: new Ext.form.TextField({
                      style: "text-align: right; color:blue;",
                      listeners: {
                        afterrender: function () {
                          this.fn = function () {
                            this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                            setTimeout(() => {
                              sum_debt_label();
                            }, 500);
                          };
                        },
                        Change: function (value) {
                          this.fn();
                        },
                      },
                    }),
                    renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                      if (value) {
                        metaData.attr = "style='text-align: right; color:blue;'";
                        return floatRenderer(floatMinus(value.replace(/,/g, ""), 2));
                      } else {
                        metaData.attr = "style='text-align: right; color:red;'";
                        return "-";
                      }
                    },
                  },
                  {
                    header: "ลบ",
                    align: "center",
                    id: "delete",
                    sortable: false,
                    width: 30,
                    dataIndex: "id",
                    renderer: function (value, metaData, record, row, col, store, gridView) {
                      return '<img src="../images/icons/table_delete.png"); style="cursor:pointer"/>';

                      // return '<img src="../images/icons/document_delete.gif"); style="cursor:pointer"/>';
                    },
                  },
                  { width: 10, dataIndex: "" },
                ],
                bbar: [
                  // {
                  //   text: "รายละเอียดรายการจ่าย",
                  //   icon: "../images/icons/application_view_list.png",
                  //   handler: function (grid, rowIndex, colIndex) {
                  //     formWindow(1, Ext.dataSelect)
                  //   },
                  // },
                  "->",
                  {
                    xtype: "label",
                    text: "จำนวนเงินทั้งหมด (รวม Vat) :",
                    style: {
                      "font-weight": "bold",
                      "font-size": "14px",
                    },
                  },
                  { xtype: "tbspacer", width: 10 },
                  {
                    xtype: "label",
                    id: "sum_debt_label",
                    text: "ㅤㅤㅤㅤㅤㅤㅤㅤㅤ",
                    style: {
                      color: "green",
                      "font-weight": "bold",
                      "text-align": "right",
                      "font-size": "14px",
                    },
                  },
                  { xtype: "tbspacer", width: 70 },
                ],
                autoExpandColumn: "dc_acc_id",
                // bbar: Ext.pagingBar,
              }),
            ],
          },
          {
            xtype: "container",
            layout: "hbox",
            id: "group_input_box_4",
            align: "stretch",
            RemoveHeight: true,
            width: 680,
            defaults: { xtype: "fieldset", flex: 1, margins: "0px 3px", autoHeight: true },
            items: [
              {
                title: Ext.butt == "add" ? "เอกสารประกอบการใบขอเบิก" : "แก้ไขเอกสารประกอบการใบขอเบิก",
                id: "title_pdf",
                RemoveCls: "x-box-item",
                collapsible: false,
                collapsed: false,
                defaults: { labelStyle: "width:150px;", allowBlank: true },
                items: [
                  {
                    xtype: "checkbox",
                    name: "i_pdf_dtl_outside",
                    id: "i_pdf_dtl_outside",
                    style: {
                      width: "19px",
                      height: "19px",
                    },
                    boxLabel: "<b style='color: blue; font-size: 18px;'>กรุณา ✓ กรณีที่ใช้เอกสารประกอบนอกระบบ</b>",
                    // hidden: Ext.INSIDE_COST == 1 ? false : true,
                    inputValue: 1,
                    checked: false,
                  },
                  {
                    xtype: "buttongroup",
                    id: "BuGroupPdf1", //*--
                    frame: false,
                    items: [
                      { xtype: "tbspacer", width: 187 },
                      {
                        xtype: "checkboxgroup",
                        fieldLabel: "",
                        name: "i_edit_pdf1",
                        id: "i_edit_pdf1ID",
                        columns: 1,
                        hidden: true,
                        items: [
                          {
                            name: "i_edit_pdf1s1",
                            id: "i_edit_pdf1IDs1",
                            boxLabel: "",
                            inputValue: 1,
                            listeners: {
                              render: function (c) {
                                var text_ToolTip = "<span style='white-space: nowrap;'> ✓ เพื่อแก้ไขเอกสาร </span>";
                                new Ext.ToolTip({
                                  target: c.id,
                                  anchor: "top",
                                  html: text_ToolTip,
                                });
                              },
                            },
                          },
                        ],
                        listeners: {
                          change: function (combo, newValue) {
                            if (Ext.getCmp("modesubID").getValue().inputValue == "ADD") {
                              Ext.getCmp("i_edit_pdf1ID").setValue({ i_edit_pdf1IDs1: true });
                              Ext.getCmp("upload_pdf1").show();
                            } else {
                              if (Ext.getCmp("i_edit_pdf1IDs1").getValue() == true) {
                                Ext.getCmp("upload_pdf1").show();
                              } else {
                                Ext.getCmp("upload_pdf1").hide();
                              }
                            }
                          },
                        },
                      },
                      { xtype: "tbspacer", width: 5 },
                      {
                        xtype: "button",
                        id: "btn_pdf1",
                        iconCls: "icon-pdf",
                        fieldLabel: " ",
                        hidden: true,
                        text: "ดาวน์โหลดเอกสารใบขอเบิก",
                        handler: function () {
                          if (Ext.i_is_url_pdf_hdr == 0) {
                            console.log(Ext.pdf_dt);
                            Po_OpenPdf(Ext.pdf_dtl, document.getElementsByName("c_code_ref")[0].value);
                            // window.open(Ext.part_file_pdf + Ext.pdf_pay + "?pdf=" + Math.floor(Math.random() * 100000), "_blank");
                          }
                        },
                        listeners: {},
                      },
                    ],
                  },
                  {
                    xtype: "fileuploadfield",
                    id: "upload_pdf1",
                    width: 300,
                    hidden: true,
                    fieldLabel: "เอกสารใบขอเบิก (PDF)",
                    emptyText: "เลือกไฟล์ (.pdf)",
                    name: "upload_pdf1",
                    buttonText: "",
                    buttonCfg: {
                      iconCls: "icon-pdf",
                    },
                    listeners: {
                      render: function (c) {
                        document.getElementById(this.fileInput.id).accept = ".pdf";
                        var text_ToolTip = "<span style='white-space:nowrap;'>กรุณาเลือก ไฟล์ (.pdf) ขนาดไม่เกิน 500,000 (KB)</span>";
                        new Ext.ToolTip({
                          target: c.positionEl.id,
                          anchor: "top",
                          html: text_ToolTip,
                        });
                      },
                    },
                  },
                  { xtype: "container", height: 5 },
                  {
                    xtype: "buttongroup",
                    id: "BuGroupPdf2", //*--
                    frame: false,
                    items: [
                      { xtype: "tbspacer", width: 187 },
                      {
                        xtype: "checkboxgroup",
                        fieldLabel: "",
                        name: "i_edit_pdf2",
                        id: "i_edit_pdf2ID",
                        columns: 1,

                        items: [
                          {
                            name: "i_edit_pdf2s1",
                            id: "i_edit_pdf2IDs1",
                            boxLabel: "",
                            inputValue: 1,
                            listeners: {
                              render: function (c) {
                                var text_ToolTip = "<span style='white-space: nowrap;'> ✓ เพื่อแก้ไขเอกสาร </span>";
                                new Ext.ToolTip({
                                  target: c.id,
                                  anchor: "top",
                                  html: text_ToolTip,
                                });
                              },
                            },
                          },
                        ],
                        listeners: {
                          change: function (combo, newValue) {
                            if (Ext.getCmp("modeProtestID").getValue().inputValue == "SEND") {
                              Ext.getCmp("i_edit_pdf2ID").setValue({ i_edit_pdf2IDs1: true });
                              Ext.getCmp("upload_pdf2").show();
                            } else if (Ext.getCmp("modesubID").getValue().inputValue == "ADD") {
                              Ext.getCmp("i_edit_pdf2ID").setValue({ i_edit_pdf2IDs1: true });
                              Ext.getCmp("upload_pdf2").show();
                            } else {
                              if (Ext.getCmp("i_edit_pdf2IDs1").getValue() == true) {
                                Ext.getCmp("upload_pdf2").show();
                              } else {
                                Ext.getCmp("upload_pdf2").hide();
                              }
                            }

                            if (Ext.getCmp("modesubID").getValue().inputValue == "modeProtestID") {
                              Ext.getCmp("i_edit_pdf2ID").setValue({ i_edit_pdf2IDs1: true });
                              Ext.getCmp("upload_pdf2").show();
                            }
                          },
                        },
                      },
                      { xtype: "tbspacer", width: 5 },
                      {
                        xtype: "button",
                        id: "btn_pdf2",
                        iconCls: "icon-pdf",
                        fieldLabel: " ",
                        text: "ดาวน์โหลดเอกสารประกอบใบเบิก",
                        handler: function () {
                          if (Ext.i_is_url_pdf_hdr == 0) {
                            console.log(Ext.pdf_dt);
                            Po_OpenPdf(Ext.pdf_dtl, document.getElementsByName("c_code_ref")[0].value);
                            // window.open(Ext.part_file_pdf + Ext.pdf_pay + "?pdf=" + Math.floor(Math.random() * 100000), "_blank");
                          }
                        },
                        listeners: {},
                      },
                    ],
                  },
                  {
                    xtype: "fileuploadfield",
                    id: "upload_pdf2",
                    width: 300,
                    fieldLabel: "เอกสารประกอบใบเบิก (PDF)",
                    emptyText: "เลือกไฟล์ (.pdf)",
                    name: "upload_pdf2",
                    buttonText: "",
                    buttonCfg: {
                      iconCls: "icon-pdf",
                    },
                    listeners: {
                      render: function (c) {
                        document.getElementById(this.fileInput.id).accept = ".pdf";
                        var text_ToolTip = "<span style='white-space:nowrap;'>กรุณาเลือก ไฟล์ (.pdf) ขนาดไม่เกิน 500,000 (KB)</span>";
                        new Ext.ToolTip({
                          target: c.positionEl.id,
                          anchor: "top",
                          html: text_ToolTip,
                        });
                      },
                    },
                  },
                ],
              },
            ],
          },
          {
            xtype: "container",
            hidden: true,
            layout: "hbox",
            id: "group_input_box_doc_protest",
            align: "stretch",
            RemoveHeight: true,
            labelWidth: 100,
            width: 680,
            defaults: { xtype: "fieldset", flex: 1, margins: "0px 3px", autoHeight: true },
            items: [
              {
                title: "เอกสารทักท้วงจากผู้ตรวจสอบ",
                RemoveCls: "x-box-item",
                collapsible: false,
                collapsed: false,
                defaults: { labelStyle: "width:200px;", allowBlank: true },
                items: [
                  {
                    xtype: "buttongroup",
                    id: "c_file_pdf_protest_hdr_buttongroup",
                    frame: false,
                    items: [
                      { xtype: "tbspacer", width: 187 },
                      {
                        xtype: "button",
                        iconCls: "icon-pdf",
                        fieldLabel: " ",
                        text: "เอกสารใบขอเบิก (ทักท้วง)",
                        handler: function () {
                          OpenPdf(Ext.dataSelect.c_file_pdf_protest_hdr, "เอกสารใบขอเบิก (ทักท้วง)");
                        },
                        listeners: {},
                      },
                    ],
                  },
                  { xtype: "container", height: 5 },
                  {
                    xtype: "buttongroup",
                    id: "c_file_pdf_protest_dtl_buttongroup",
                    frame: false,
                    items: [
                      { xtype: "tbspacer", width: 187 },
                      {
                        xtype: "button",
                        iconCls: "icon-pdf",
                        fieldLabel: " ",
                        text: "เอกสารประกอบใบเบิก (ทักท้วง)",
                        handler: function () {
                          OpenPdf(Ext.dataSelect.c_file_pdf_protest_dtl, "เอกสารประกอบใบเบิก (ทักท้วง)");
                        },
                        listeners: {},
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            xtype: "container",
            hidden: Ext.I_SUB_STATUS_BEFORE == "3.00" ? false : true,
            layout: "hbox",
            id: "group_input_box_5",
            align: "stretch",
            RemoveHeight: true,
            labelWidth: 100,
            width: 680,
            defaults: { xtype: "fieldset", flex: 1, margins: "0px 3px", autoHeight: true },
            items: [
              {
                title: "โหมดการบันทึก",
                RemoveCls: "x-box-item",
                collapsible: false,
                collapsed: false,
                // defaults: { labelStyle: "width:200px;", allowBlank: true },
                items: [
                  {
                    xtype: "radiogroup",
                    columns: [200, 200],
                    // fieldLabel: "โหมดการบันทึก",
                    id: "modeProtestID",
                    listeners: {
                      afterrender: function () {},
                    },
                    style: {
                      "font-weight": "bold",
                    },
                    items: [
                      {
                        name: "mode_protest",
                        checked: true,
                        inputValue: "SEND_RECEIVE",
                        id: "mode_protest_value1",
                        boxLabel: "อัพเดตรายการและส่งคืนทักท้วง",
                        listeners: {
                          render: function (c) {
                            var text_ToolTip = "<span style='white-space:nowrap;'>แก้ไขข้อมูลใบขอเบิก และส่งให้ผู้ตรวจอีกครั้ง</span>";
                            new Ext.ToolTip({
                              target: c.positionEl.id,
                              anchor: "top",
                              html: text_ToolTip,
                            });
                          },
                        },
                      },
                      {
                        name: "mode_protest",
                        inputValue: "SEND",
                        id: "mode_protest_value2",
                        boxLabel: "เพิ่มใบเบิกโดยการยกเลิกใบเบิกเดิม",
                        listeners: {
                          render: function (c) {
                            var text_ToolTip = "<span style='white-space:nowrap;'>ส่งรายการใบขอเบิกใหม่ โดยยกเลิกใบขอเบิกเดิม</span>";
                            new Ext.ToolTip({
                              target: c.positionEl.id,
                              anchor: "top",
                              html: text_ToolTip,
                            });
                          },
                        },
                      },
                    ],
                    listeners: {
                      afterrender: function () {
                        // if (Ext.butt == "edit") {
                        //   Ext.getCmp("i_edit_pdf2ID").show();
                        // } else {
                        //   Ext.getCmp("i_edit_pdf2ID").hide();
                        // }
                      },
                      change: function (combo, newValue) {
                        if (this.getValue().inputValue == "SEND_RECEIVE") {
                          Ext.getCmp("d_receive_date").show();
                          // Ext.getCmp("c_receive_comment").show();
                          Ext.getCmp("c_add_comment").show();
                          Ext.getCmp("modesubID").setValue("UPDATE");

                          if (Ext.dataSelect.i_protect_only_doc == 1 && Ext.dataSelect.i_protest_only_doc_hdr != 1) {
                            Ext.getCmp("group_input_box_1").getEl().setStyle("display", "none");
                            Ext.getCmp("group_input_box_2").getEl().setStyle("display", "none");
                            Ext.getCmp("group_input_box_3").getEl().setStyle("display", "none");
                            Ext.getCmp("i_pdf_dtl_outside").hide();
                            Ext.getCmp("mode_protest_value2").hide();
                            Ext.getCmp("i_edit_pdf2ID").setValue({ i_edit_pdf2IDs1: false });
                          }
                          if (Ext.dataSelect.i_protect_only_doc != 1 && Ext.dataSelect.i_protest_only_doc_hdr == 1) {
                            Ext.getCmp("group_input_box_4").getEl().setStyle("display", "none");
                          }
                          Ext.getCmp("d_doc_date").setValue(Ext.dataSelect.d_doc_date);
                        } else if (this.getValue().inputValue == "SEND") {
                          Ext.getCmp("d_receive_date").hide();
                          // Ext.getCmp("c_receive_comment").hide();
                          Ext.getCmp("c_add_comment").hide();
                          Ext.getCmp("modesubID").setValue("ADD");

                          Ext.getCmp("i_edit_pdf2ID").setValue({ i_edit_pdf2IDs1: true });
                          Ext.getCmp("upload_pdf2").show();
                          Ext.getCmp("title_pdf").setTitle("เอกสารประกอบการใบขอเบิก");

                          Ext.getCmp("group_input_box_1").getEl().setStyle("display", "unset");
                          Ext.getCmp("group_input_box_2").getEl().setStyle("display", "unset");
                          Ext.getCmp("group_input_box_3").getEl().setStyle("display", "unset");
                          Ext.getCmp("group_input_box_4").getEl().setStyle("display", "unset");
                          Ext.getCmp("i_pdf_dtl_outside").show();
                          Ext.getCmp("mode_protest_value2").show();
                          Ext.getCmp("d_doc_date").setValue(addY(543));
                        }
                        var set = this.getValue().inputValue == "SEND_RECEIVE" ? true : false;

                        setReadOnlyForProtest(set);
                        // ReadOnly_set("i_working_type", set);
                        // Ext.getCmp("dc_cost_acc_id").ReadOnly_set(set);
                        // Ext.getCmp("dc_cost_idID").ReadOnly_set(set);
                        // Ext.getCmp("i_working_type").ReadOnly_set(set);
                        //   Ext.getCmp("i_edit_pdf2ID").setValue({ i_edit_pdf2IDs1: true });
                        //   Ext.getCmp("upload_pdf2").show();
                        //   Ext.getCmp("title_pdf").setTitle("เอกสารประกอบการใบขอเบิก");
                        // } else {
                        //   if (Ext.butt != "add") {
                        //     Ext.getCmp("title_pdf").setTitle("แก้ไขเอกสารประกอบการใบขอเบิก");
                        //   }
                        // }
                      },
                    },
                  },
                  { xtype: "container", height: 10 },
                  {
                    xtype: "datefield",
                    fieldLabel: "วันที่รับคืนทักท้วง",
                    id: "d_receive_date",
                    name: "d_receive_date",
                    readOnly: true,
                    style: {
                      background: "#eee",
                      "text-align": "center",
                    },
                  },
                  {
                    xtype: "textarea",
                    fieldLabel: "หมายเหตุ",
                    id: "c_receive_comment",
                    name: "c_receive_comment",
                    readOnly: true,
                    width: 500,
                    height: 120,
                    style: {
                      background: "#eee",
                      "font-size": "14px",
                      color: "red",
                    },
                    listeners: {
                      afterrender: function () {
                        if (Ext.SS_I_TYPE_USER == 3) {
                          this.setReadOnly(true);
                        }
                      },
                    },
                  },
                  {
                    xtype: "textarea",
                    fieldLabel: "หมายเหตุเพิ่มเติม",
                    id: "c_add_comment",
                    name: "c_add_comment",
                    width: 300,
                    listeners: {
                      afterrender: function () {
                        if (Ext.SS_I_TYPE_USER == 3) {
                          this.setReadOnly(true);
                        }
                      },
                    },
                  },
                ],
              },
            ],
          },
          {
            xtype: "container",
            hidden: Ext.I_SUB_STATUS == "0.30" && Ext.butt == "add" ? false : true,
            layout: "hbox",
            align: "stretch",
            RemoveHeight: true,
            labelWidth: 10,
            width: 680,
            defaults: { xtype: "fieldset", flex: 1, margins: "0px 3px", autoHeight: true },
            items: [
              {
                title: "โหมดการบันทึก",
                RemoveCls: "x-box-item",
                collapsible: false,
                collapsed: false,
                // defaults: { labelStyle: "width:200px;", allowBlank: true },
                items: [
                  {
                    xtype: "radiogroup",
                    columns: [150, 150, 530, 150],
                    // fieldLabel: "โหมดการบันทึก",
                    id: "modesubID",
                    listeners: {
                      afterrender: function () {},
                    },
                    style: {
                      "font-weight": "bold",
                    },
                    items: [
                      {
                        name: "mode",
                        checked: Ext.I_SUB_STATUS_BEFORE == "3.00" ? true : Ext.butt == "add" ? false : Ext.dataSelect.i_sub_status == "0.20" ? true : false,
                        hidden: Ext.I_SUB_STATUS_BEFORE == "3.00" ? false : Ext.butt == "add" ? true : Ext.dataSelect.i_sub_status == "0.20" ? false : true,
                        inputValue: "UPDATE",
                        boxLabel: "อัพเดทรายการ",
                        listeners: {
                          render: function (c) {
                            var text_ToolTip = "<span style='white-space:nowrap;'>แก้ไขข้อมูลใบขอเบิก</span>";
                            new Ext.ToolTip({
                              target: c.positionEl.id,
                              anchor: "top",
                              html: text_ToolTip,
                            });
                          },
                        },
                      },
                      {
                        name: "mode",
                        inputValue: "ADD",
                        checked: Ext.I_SUB_STATUS_BEFORE == "3.00" ? false : Ext.butt == "add" ? true : Ext.dataSelect.i_sub_status < "0.30" ? false : true,
                        boxLabel: Ext.butt == "add" ? "บันทึกร่างใบขอเบิก" : "บันทึกร่างใบขอเบิก",
                        id: "modesubaddID",
                        hidden: true,
                        listeners: {
                          render: function (c) {
                            // console.log(c.positionEl.id);
                            var text_ToolTip = "<span style='white-space:nowrap;'>สร้างรายการใบขอเบิกรายการใหม่<br>(จำเป็นต้องอัพโหลดเอกสารประกอบใบเบิกใหม่)</span>";
                            new Ext.ToolTip({
                              target: c.positionEl.id,
                              anchor: "top",
                              html: text_ToolTip,
                            });
                            document.getElementById(c.positionEl.id).style.display = "none";
                          },
                        },
                      },
                      {
                        name: "mode",
                        inputValue: "SEND",
                        checked: Ext.butt == "add" ? true : Ext.dataSelect.i_sub_status != "0.21" ? false : true,
                        hidden: Ext.butt == "add" ? false : Ext.dataSelect.i_sub_status <= "0.21" ? false : true,
                        boxLabel: "ส่งใบเบิก",
                        listeners: {
                          // render: function (c) {
                          //   var text_ToolTip = "<b>หากจำนวนเงินที่ได้รับจริงไม่เพียงพอจะทำการขอจัดสรร ไปที่ฝ่ายงบประมาณ</b><br><span style='white-space: nowrap; color:red;'>(คุณจะไม่สามารถแก้ไขรายการนี้ได้อีกหลังจากบันทึกรายการ)</span>";
                          //   new Ext.ToolTip({
                          //     target: c.positionEl.id,
                          //     anchor: "top",
                          //     html: text_ToolTip,
                          //   });
                          // },
                        },
                      },

                      // {
                      //   name: "mode",
                      //   inputValue: "DELETE",
                      //   id: "modesubdelID",
                      //   boxLabel: "ลบรายการ",
                      // },
                    ],
                    listeners: {
                      afterrender: function () {
                        // if (Ext.butt == "edit") {
                        //   Ext.getCmp("i_edit_pdf2ID").show();
                        // } else {
                        //   Ext.getCmp("i_edit_pdf2ID").hide();
                        // }
                      },
                      change: function (combo, newValue) {
                        if (this.getValue().inputValue == "ADD") {
                          Ext.getCmp("i_edit_pdf2ID").setValue({ i_edit_pdf2IDs1: true });
                          Ext.getCmp("upload_pdf2").show();
                          Ext.getCmp("title_pdf").setTitle("เอกสารประกอบการใบขอเบิก");
                        } else {
                          if (Ext.butt != "add") {
                            Ext.getCmp("title_pdf").setTitle("แก้ไขเอกสารประกอบการใบขอเบิก");
                          }
                        }
                      },
                    },
                  },
                ],
              },
            ],
          },
          {
            xtype: "container",
            hidden: Ext.can_edit ? false : true,
            layout: "hbox",
            align: "stretch",
            RemoveHeight: true,
            labelWidth: 100,
            width: 680,
            defaults: { xtype: "fieldset", flex: 1, margins: "0px 3px", autoHeight: true },
            items: [
              {
                title: "โหมดการบันทึก",
                RemoveCls: "x-box-item",
                collapsible: false,
                collapsed: false,
                // defaults: { labelStyle: "width:200px;", allowBlank: true },
                items: [
                  {
                    xtype: "radiogroup",
                    columns: [150, 200],
                    id: "modeEditID",
                    listeners: {
                      afterrender: function () {},
                    },
                    style: {
                      "font-weight": "bold",
                    },
                    items: [
                      {
                        name: "mode_edit",
                        checked: true,
                        inputValue: "SEND_RECEIVE",
                        id: "mode_edit_value1",
                        boxLabel: "แก้ไขรายการ",
                        listeners: {
                          render: function (c) {
                            var text_ToolTip = "<span style='white-space:nowrap;'>แก้ไขข้อมูลใบขอเบิก และส่งให้ผู้ตรวจอีกครั้ง</span>";
                            new Ext.ToolTip({
                              target: c.positionEl.id,
                              anchor: "top",
                              html: text_ToolTip,
                            });
                          },
                        },
                      },
                      {
                        name: "mode_edit",
                        inputValue: "SEND",
                        id: "mode_edit_value2",
                        boxLabel: "เพิ่มใบเบิกโดยการยกเลิกใบเบิกเดิม",
                        listeners: {
                          render: function (c) {
                            var text_ToolTip = "<span style='white-space:nowrap;'>ส่งรายการใบขอเบิกใหม่ โดยยกเลิกใบขอเบิกเดิม</span>";
                            new Ext.ToolTip({
                              target: c.positionEl.id,
                              anchor: "top",
                              html: text_ToolTip,
                            });
                          },
                        },
                      },
                    ],
                    listeners: {
                      afterrender: function () {
                        // if (Ext.butt == "edit") {
                        //   Ext.getCmp("i_edit_pdf2ID").show();
                        // } else {
                        //   Ext.getCmp("i_edit_pdf2ID").hide();
                        // }
                      },
                      change: function (combo, newValue) {
                        if (this.getValue().inputValue == "SEND_RECEIVE") {
                          Ext.getCmp("d_receive_date").show();
                          // Ext.getCmp("c_receive_comment").show();
                          Ext.getCmp("c_add_comment").show();
                          Ext.getCmp("modesubID").setValue("UPDATE");
                          Ext.getCmp("d_doc_date").setValue(Ext.dataSelect.d_doc_date);
                        } else if (this.getValue().inputValue == "SEND") {
                          Ext.getCmp("d_receive_date").hide();
                          // Ext.getCmp("c_receive_comment").hide();
                          Ext.getCmp("c_add_comment").hide();
                          Ext.getCmp("modesubID").setValue("ADD");

                          Ext.getCmp("i_edit_pdf2ID").setValue({ i_edit_pdf2IDs1: true });
                          Ext.getCmp("upload_pdf2").show();
                          Ext.getCmp("title_pdf").setTitle("เอกสารประกอบการใบขอเบิก");
                          Ext.getCmp("d_doc_date").setValue(addY(543));
                        }
                        var set = this.getValue().inputValue == "SEND_RECEIVE" ? true : false;

                        setReadOnlyForProtest(set);
                        // ReadOnly_set("i_working_type", set);
                        // Ext.getCmp("dc_cost_acc_id").ReadOnly_set(set);
                        // Ext.getCmp("dc_cost_idID").ReadOnly_set(set);
                        // Ext.getCmp("i_working_type").ReadOnly_set(set);
                        //   Ext.getCmp("i_edit_pdf2ID").setValue({ i_edit_pdf2IDs1: true });
                        //   Ext.getCmp("upload_pdf2").show();
                        //   Ext.getCmp("title_pdf").setTitle("เอกสารประกอบการใบขอเบิก");
                        // } else {
                        //   if (Ext.butt != "add") {
                        //     Ext.getCmp("title_pdf").setTitle("แก้ไขเอกสารประกอบการใบขอเบิก");
                        //   }
                        // }
                      },
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
            text: "&nbsp;บันทึกรายการ&nbsp;",
            iconCls: "icon-save",
            hidden: Ext.I_SUB_STATUS_BEFORE == "3.00" ? true : false,
            handler: function () {
              var i_budget_year = Ext.getCmp("i_budget_year").getValue();
              var dc_expense_budget_type_id = Ext.getCmp("dc_expense_budget_type_id").getValue();
              var bg_expense_id = Ext.getCmp("bg_expense_id").getValue();
              var dc_cost_id = Ext.getCmp("dc_cost_idID").getValue();

              Ext.f_income_total.load({
                params: {
                  i_budget_year: i_budget_year,
                  dc_expense_budget_type_id: dc_expense_budget_type_id,
                  bg_expense_id: bg_expense_id,
                  dc_cost_id: dc_cost_id,
                },
                callback: function (records, operation, success) {
                  if (success) {
                    var f_income_total = Ext.f_income_total.getAt(0).data.f_income_total;
                    Ext.getCmp("f_income_total").setValue(f_income_total);
                    // Ext.getCmp("f_income_total").fn();

                    if (f_income_total >= Ext.getCmp("f_total").getValue()) {
                    } else {
                    }
                  }
                },
              });
              saveHdr(true);
            },
            listeners: {
              afterrender: function () {
                if (Ext.butt == "edit") {
                  this.hide();
                }
                btn_set_color(this, "green"); //color : green, red, yellow, orange
              },
            },
          },
          {
            text: "&nbsp;ยืนยันการทำรายการ&nbsp;",
            iconCls: "icon-save",
            hidden: Ext.I_SUB_STATUS_BEFORE != "3.00" ? true : false,
            handler: function () {
              // var matchingComponents = Ext.ComponentMgr.all.filterBy(function (cmp) {
              //   return cmp.id && cmp.id.indexOf("select_dataID_") === 0;
              // });
              // matchingComponents.each(function (cmp) {
              //   Ext.getCmp(cmp.id).getValue();
              // });
              var i_budget_year = Ext.getCmp("i_budget_year").getValue();
              var dc_expense_budget_type_id = Ext.getCmp("dc_expense_budget_type_id").getValue();
              var bg_expense_id = Ext.getCmp("bg_expense_id").getValue();
              var dc_cost_id = Ext.getCmp("dc_cost_idID").getValue();

              Ext.f_income_total.load({
                params: {
                  i_budget_year: i_budget_year,
                  dc_expense_budget_type_id: dc_expense_budget_type_id,
                  bg_expense_id: bg_expense_id,
                  dc_cost_id: dc_cost_id,
                },
                callback: function (records, operation, success) {
                  if (success) {
                    var f_income_total = Ext.f_income_total.getAt(0).data.f_income_total;
                    Ext.getCmp("f_income_total").setValue(f_income_total);
                    // Ext.getCmp("f_income_total").fn();

                    if (f_income_total >= Ext.getCmp("f_total").getValue()) {
                    } else {
                    }
                  }
                },
              });
              saveHdr(true);
            },
          },
          {
            text: "&nbsp;ยืนยันการทำรายการ&nbsp;",
            iconCls: "icon-save",
            hidden: Ext.can_edit ? false : true,
            listeners: {
              afterrender: function () {
                btn_set_color(this, "yellow"); //color : green, red, yellow, orange
              },
            },
            handler: function () {
              var i_budget_year = Ext.getCmp("i_budget_year").getValue();
              var dc_expense_budget_type_id = Ext.getCmp("dc_expense_budget_type_id").getValue();
              var bg_expense_id = Ext.getCmp("bg_expense_id").getValue();
              var dc_cost_id = Ext.getCmp("dc_cost_idID").getValue();

              Ext.f_income_total.load({
                params: {
                  i_budget_year: i_budget_year,
                  dc_expense_budget_type_id: dc_expense_budget_type_id,
                  bg_expense_id: bg_expense_id,
                  dc_cost_id: dc_cost_id,
                },
                callback: function (records, operation, success) {
                  if (success) {
                    var f_income_total = Ext.f_income_total.getAt(0).data.f_income_total;
                    Ext.getCmp("f_income_total").setValue(f_income_total);
                    // Ext.getCmp("f_income_total").fn();

                    if (f_income_total >= Ext.getCmp("f_total").getValue()) {
                    } else {
                    }
                  }
                },
              });
              saveHdr("EDIT");
            },
          },
          {
            text: Ext.GLOBAL_BU_BACK_TH,
            handler: function () {
              Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
            },
          },
          "->",
          {
            text: "&nbsp;ลขข้อมูล&nbsp;",
            iconCls: "icon-delete",
            disabled: true,
            hidden: true,
            handler: function () {
              deleteHdr(true);
            },
          },
        ],
      },
    ],
  });
  Ext.getCmp("gridAcc").on("cellclick", cellClick_gridAcc, this);
  Ext.getCmp("gridAcc").on("rowContextmenu", rowContextmenu_gridAcc, this);
}; // formAdd
Ext.extend(formAdd, Ext.Panel, {});
