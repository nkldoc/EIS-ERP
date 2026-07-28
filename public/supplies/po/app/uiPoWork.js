/*!
 * Ext JS Library 3.4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
let Date_now = new Date();
Date_now = Date_now.toISOString().split("T")[0].split("-");
Ext.bgYear = Date_now[0] - 0 + ((Date_now[1] < 10 ? 0 : 1) - 0);
const Preview = function (id) {
  // Ext.url_post = "http://" + location.host.slice(0, -5) + "/NMU/po/preview/Pre_Working_Cost.php";
  let url =  Ext.session.HOST_NMU + "/po/preview/Pre_Working_Cost.php";  //"../nmu/po/preview/Pre_Working_Cost.php";
  let loader_display = '<div id="loader_display" style="display: flex; padding: 15px 15px; font-size:14px;"><div class="loader"></div><p>&nbsp;&nbsp;กำลังโหลดสถานะกรุณารอสักครู่...</p></div>';

  new Ext.Window({
    title: "แสดงสถานะใบขอเบิก",
    id: "Preview",
    modal: true,
    preventBodyReset: true,
    closable: true,
    autoScroll: true,
    maximized: true, // เต็มจอ auto
    html: loader_display + '<iframe name="printf" src="' + url + "?id=" + id + '" style="width:100%; height:100%; border-style:hidden;"></iframe>',
    buttonAlign: "left",
    buttons: [
      {
        text: "&nbsp;" + Ext.GLOBAL_BU_PRINT_TH + "&nbsp;",
        iconCls: "printer_mono",
        handler: function () {
          document.printf.window.print();
        },
      },
      {
        text: Ext.GLOBAL_BU_BACK_TH,
        handler: function () {
          Ext.getCmp("Preview").destroy();
        },
      },
    ],
    listeners: {
      afterrender: function () {
        $("iframe")
          .load(function () {
            document.getElementById("loader_display").remove();
          })
          .show();
      },
    },
  }).show();
};
Ext.SP_TOR_ITEM = function (rs) {
  Ext.Ajax.request({
      url: "tor/api/mnArrivalCode.php",
      method: "POST",
      params: {
          mode: "WITHDRAWSPTORITEMS",
          sp_check_period_hdr_id:rs.get('sp_check_period_hdr_id'), //checking_hdr_id 
      },
      success: function (result, request) {

          let json = Ext.util.JSON.decode(result.responseText); 
          if (request.success) {
              
          }
      },
      failure: function (result, request) {
          Ext.MessageBox.alert("Failed", result.responseText);
      }
  }); 
};
Ext.closeBooking = function (rs) {
  var rs = Ext.selectRow;
  var link = '';
  var ip = Ext.session.ip_booking; // 192
  // var ip = 'localhost';
  if (rs.get("i_overlap") == null ){
      link = Ext.session.IPAPIBG + '/?/bg/mn_BgReserveMoney/mode/PUT/bg_reserve_money_id/' + rs.get('bg_checking_money_id') + '/i_finish/1';
  } else {
      link = Ext.session.IPAPIBG + '/?/bg/mn_BgReserveMoney/mode/PUT/bg_reserve_overlap_id/' + rs.get('bg_reserve_overlap_id') + '/i_finish/1';
  }
  Ext.SP_TOR_ITEM(rs);
  Ext.Ajax.request({
      url: link, //record,linkGetMoney
      method: "GET", //POST
      disableCaching: false,
      success: function (result, request) {
          var jsonData = Ext.util.JSON.decode(result.responseText); //decode json 

          // Ext.MessageBox.alert("Success", "เรียบร้อยแล้ว", function () {
              Ext.upMoneyCheckingId(rs.get('sp_check_period_hdr_id'));
          // }); 
          return false;
      },
      failure: function (result, request) {
          Ext.MessageBox.alert("Failed", result.responseText); // connect error
      },
  });

};
Ext.upMoneyCheckingId = function (id) {

  Ext.Ajax.request({
      url: "tor/api/mnPeriodController.php",
      method: "POST",
      params: {
          mode: "UP_BG_CHECKING_CLOSE_BOOKING_HDR",
          sp_check_period_hdr_id: id, //checking_hdr_id 
      },
      success: function (result, request) {

          let json = Ext.util.JSON.decode(result.responseText);

          if (request.success) {
              Ext.selectRow = null;
              // Ext.getCmp("panelForm").destroy();
              Ext.getCmp("tabpanel1").getStore().reload();
              // Ext.getCmp(Ext.poFormID).show();
              // Ext.getCmp(Ext.poFormID).getEl().unmask();
          }
      },
      failure: function (result, request) {
          Ext.MessageBox.alert("Failed", result.responseText);
      }
  });
};
Ext.part_file_pdf =  + "/pdf_po/";
function Po_OpenPdf(file_id, file_name) {
  file_name = file_name.replaceAll("/", "-");
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = today.getFullYear();
  today = yyyy + "-" + mm + "-" + dd;
  var tap_random = "Tap_" + Math.floor(Math.random() * 100000);
  if (file_id.indexOf("hdr") > 0) {
    file_name = file_name + "_" + "เอกสารใบเบิก_" + today;
  } else if (file_id.indexOf("dtl") > 0) {
    file_name = file_name + "_" + "เอกสารประกอบใบเบิก_" + today;
  } else if (file_id.indexOf("pay") > 0) {
    file_name = file_name + "_" + "เอกสารการจ่ายเงิน_" + today;
  } else if (file_id.indexOf("all") > 0) {
    file_name = file_name + "_" + "เอกสาร_" + today;
  }
  function enc(str) {
    var encoded = "";
    for (i = 0; i < str.length; i++) {
      var a = str.charCodeAt(i);
      var b = a ^ 123; // bitwise XOR with any number, e.g. 123
      encoded = encoded + String.fromCharCode(b);
    }
    return encoded;
  }
  // var Url = "http://" + location.hostname + "/nmu/po/api/PDF_View.php/" + file_name + ".pdf?code_F=" + enc(file_id.slice(0, -4)) + "&file_name=" + file_name;
  // window.open(Url);
  // return;
  var mapForm = document.createElement("form");
  mapForm.target = tap_random;
  mapForm.method = "GET"; //GET & POST
  mapForm.action = Ext.session.HOST_NMU + "/po/api/PDF_View.php/" + file_name + ".pdf?T=" + tap_random;

  var mapInput = document.createElement("input");
  mapInput.type = "text";
  mapInput.name = "code_F";
  mapInput.value = enc(file_id.slice(0, -4));
  mapForm.appendChild(mapInput);

  var mapInput2 = document.createElement("input");
  mapInput2.type = "text";
  mapInput2.name = "file_name";
  mapInput2.value = file_name;
  mapForm.appendChild(mapInput2);

  var mapInput3 = document.createElement("input");
  mapInput3.type = "text";
  mapInput3.name = "T";
  mapInput3.value = tap_random;
  mapForm.appendChild(mapInput3);

  document.body.appendChild(mapForm);
  map = window.open("", tap_random);
  if (map) {
    mapForm.submit();
  } else {
    alert("ไฟล์ PDF มีปัญหา");
  }
}

const saveHdr = function (type) {
  // if(Ext.getCmp("modesubID").getValue().inputValue === "POSTPO")  { 
  // ADD
 
  // }

  var formSubmit = function () {
    // function submit(id, form){
      // alert("tsaet");
      var checkfalse = false;
      // form.fileUpload = false;
      if (Ext.getCmp('modesubID').getValue().inputValue == "POSTPO") {
        var msg = "";
        let file1 = Ext.get("upload_pdf1-file").dom.files[0];
        let parts1 = null;
        // console.log(file1);
        try {
          parts1 = file1.name.split(".");
        } catch (err) {}
        let file2 = Ext.get("upload_pdf2-file").dom.files[0];
        let parts2 = null;
        try {isUpload
          parts2 = file2.name.split(".");
        } catch (err) {}
        if (Ext.getCmp("f_totalID").getValue() != Ext.getCmp("f_per_inv_vat").getValue()) {
          msg += "<span style='white-space: nowrap;'>- จำนวนเงินขอเบิกไม่ถูกต้อง</span><br>";
        }
        if (file1 != undefined && file2 != undefined) {
          if (parts1[parts1.length - 1] != "pdf" && parts1[parts1.length - 1] != "PDF") {
            msg += "<span style='white-space: nowrap;'>กรุณาเลือกไฟล์ (.pdf)</span><br>";
          // } else if (parts2[parts2.length - 1] != "pdf" && parts2[parts2.length - 1] != "PDF") { ถามไอซ์
            msg += "<span style='white-space: nowrap;'>กรุณาเลือกไฟล์ (.pdf)</span><br>";
          } else if (file1.size > 512000000 || file2.size > 512000000) {
            msg += "<span style='white-space: nowrap;'>กรุณาเลือก ไฟล์ PDF ขนาดไม่เกิน 500000 (kB)</span>";
          }
        } else {
          if ((file1 == undefined && file2 != undefined) || (file1 != undefined && file2 == undefined)) {
            msg += "<span style='white-space: nowrap;'>กรุณาเลือกไฟล์ให้ครบ</span><br>";
          }
        }
        if (Ext.getCmp(Ext.poFormID).getForm().isValid() == false) {
          msg += "<span style='white-space: nowrap;'>กรุณากรอกเลขที่ใบขอเบิก</span>";
          // msg += "<span style='white-space: nowrap;'>กรุณากรอกข้อมูลให้ครบ</span>";
        }
        msg += Ext.tax_msg;
        if (msg != "") {
          Ext.MessageBox.alert("แจ้งเตือน", msg);
          return;
        }
          if (Ext.getCmp('upload_pdf1').getValue() != "" && Ext.getCmp('upload_pdf2').getValue() != "") {
              checkfalse = true;
          } else {
              checkfalse = false;
          }
      } else {
          checkfalse = true;
      }
    if (Ext.getCmp("bg_expense_id").getValue() == "") {
      msg = "<span style='white-space: nowrap;'>กรุณาเลือก รายการย่อย</span>";
      Ext.Msg.alert("แจ้งเตือน", msg);
      return false;
    }
    let jsonArr = [];
    let sto = Ext.getCmp("gridAcc").store.data.items;
    // console.log(sto);
    sto.forEach(function (v) {
      // console.log(v);
      jsonArr.push({
        id: v.data.id,
        dc_acc_id: v.data.dc_acc_id,
        f_inv: v.data.f_inv ? v.data.f_inv.replace(/,/g, "") : "",
        f_vat: v.data.f_vat ? v.data.f_vat.replace(/,/g, "") : "",
        f_inv_vat: v.data.f_inv_vat ? v.data.f_inv_vat.replace(/,/g, "") : "",
      });
    });
    if (checkfalse) {
      var idform = Ext.getCmp(Ext.poFormID).form.el.id;
      var form = document.getElementById(idform);
      var formData = new FormData(form);
      var xhr = new XMLHttpRequest();
      xhr.open('POST', Ext.url_post , true);

      xhr.onload = function () {
        var response = Ext.decode(xhr.responseText); 
        if (xhr.status >= 200 && xhr.status < 300) {
          document.addEventListener('DOMContentLoaded', function () {
            // var form = document.getElementById(form);
            
            form.addEventListener('input', function (event) {
              // This function will be called whenever an input field in the form is edited
              console.log('Form edited!');
              alert(1)
            });
          
            form.addEventListener('submit', function (event) {
              event.preventDefault(); // Prevent the form from submitting for this example
              console.log('Form submitted!');
              alert(2)

            });
          });
          if(response.success == 'Success') {
            console.log(Ext.getCmp('modesubID'));
            if(Ext.getCmp('modesubID').getValue().inputValue == "POSTPO") {
                          Ext.closeBooking();
            }
            Ext.MessageBox.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + response.msg + "</span>");
            Ext.getCmp("tabpanel1").getStore().reload();
            Ext.selectRow = null;
            Ext.getCmp("winChequeID").hide();
            Ext.getCmp("winChequeID").destroy();
          } else {
            if (location.host != 'localhost:8080') {
              var alert_text = "แจ้งเตือนใบเบิกมีข้อมูลซ้ำ\n";
              alert_text +=  response.msg + "\n";
              alert_text += "Time : " + new Date().toLocaleString('en-ZA') + "\n";
              alert_text += "Host : " + location.host + "\n";
              alert_text += "File : po/app/uiPoWork.js \n";
              alert_text += "ชื่อผู้ทำรายการ : " + Ext.session.user_name + "\n";
              alert_text += "เลขที่ใบขอเบิก : " + Ext.getCmp("c_code_ref").getValue() + "\n";
              alert_text += "เลขที่ใบวางบิล : " + Ext.getCmp("c_code_invoiceID").getValue() + "\n";
              alert_text += "เลขที่ตรวจรับ : " + Ext.getCmp("c_arrive_code").getValue() + "\n";
              alert_text += "เลขที่สัญญา :  " + Ext.getCmp("c_contract_code").getValue() + "\n";
                  Ext.Ajax.request({
                    url: Ext.session.Notif_line ,
                    method: "POST",
                      params: {
                          msg: alert_text,
                          mode: 2
                      },
                  });
              
              }
            Ext.MessageBox.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + response.msg + "</span>");
            return false;
          }
        } else {
          Ext.MessageBox.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + response.msg + "</span>");
          return false;
        }
      };
      xhr.onerror = function () {
        // There was a network error
        console.error('Network error');
      };
      xhr.send(formData);
      return false ; 
      form.submit({
        waitMsg: "Saving Data...",
        params: {
          data: JSON.stringify(jsonArr),
        },
        success: function (form, action) {
          // if (error_json(action.response.responseText, action.options.params)) return;
          // if (action.result.success == "Success" || action.result.success == true) {   ถามไอซ์
            // Ext.Msg.alert("Success", "upload success", function (form, action) { ที่จะใช้
            // Ext.Msg.alert("Success", action.result.msg, function (form, action) {
              if (Ext.getCmp('upload_pdf1').getValue() == ""){
                var msg = "บันทีกเรียบร้อยแล้ว"
              } else {
                var msg = "ส่งเบิกเรียบร้อย"
              }
              Ext.Msg.alert("Success", msg, function (form, action) {
              Ext.getCmp("tabpanel1").getStore().reload();
              Ext.selectRow = null;
              Ext.getCmp("winChequeID").hide();
              Ext.getCmp("winChequeID").destroy();
            });
          // } else { 
            // Ext.MessageBox.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + action.result.msg + "</span>");  ถามไอซ์
          // }
        },
        failure: function (form, action) {
          // if (error_json(action.response.responseText, action.options.params)) return;
          switch (action.failureType) {
            case Ext.form.Action.CLIENT_INVALID:
              Ext.Msg.alert("Failure", "Form fields may not be submitted with invalid values");
              break;
            case Ext.form.Action.CONNECT_FAILURE:
              Ext.Msg.alert("Failure", "พลข้อผิดพลาดในการเชื่อต่อเครือข่าย");
              break;
            case Ext.form.Action.SERVER_INVALID:
              Ext.Msg.alert("Failure", action.result.msg);
          }
        },
      });
    }else {
      Ext.Msg.alert('Failure', 'ตรวจไฟล์ PDF');
    } 
  };
  var form = Ext.getCmp(Ext.poFormID).getForm();
  form.fileUpload = false;
  // if (form.isValid()) {
    if (Ext.getCmp("modesubID").getValue().inputValue == "VIEW") {
    } else if (Ext.getCmp("modesubID").getValue().inputValue == "DELETE") {
      Ext.MessageBox.show({
        title: "Icon Support",
        msg: "คุณต้องการที่จะลบ รายการที่เลือกนี้ใช่ใหม ?",
        buttons: Ext.MessageBox.OKCANCEL,
        icon: Ext.MessageBox.WARNING,
        fn: function (btn) {
          if (btn === "ok") {
            formSubmit(form);
          } else {
            return;
          }
        },
      });
    } else {
      formSubmit(form);
    }
  // } //isValid
  // formSubmit(form);
};


const edit_creditor_datatax = function (data) {
  var msg = "";
  if (data.getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณาระบุจ่ายให้</span><br>";
  }
  if (msg == "") {
    Ext.creditor_taxdata.load({
      params: { dc_creditor_id: data.getValue() },
      callback: function (recordx, operation, success) {
        var data_ = Ext.creditor_taxdata.getAt(0).data;
        Ext.dc_district.load({
          params: { dc_province_id: data_.dc_province_id },
          callback: function (recordx, operation, success) {
            Ext.dc_tambon.load({
              params: { dc_district_id: data_.dc_district_id },
              callback: function (recordx, operation, success) {
                var c_post_code_all = data_.c_post_code_all;
                if (c_post_code_all) {
                  var parts = c_post_code_all.split("/");
                  var dataToAdd = parts.map(function (part) {
                    return { c_code: part };
                  });
                  Ext.c_post_code.loadData(dataToAdd);
                }
                return new Ext.Window({
                  id: "window-edit-creditor",
                  title: "ข้อมูลผู้เสียภาษี : " + data.lastSelectionText,
                  modal: true,
                  width: 695,
                  resizable: false,
                  // layout: 'fit',
                  items: new Ext.FormPanel({
                    id: "Form-edit_creditor_datatax",
                    frame: true,
                    labelAlign: "left",
                    bodyStyle: "padding:1px",
                    listeners: {
                      afterrender: function () {
                        Ext.getCmp("Form-edit_creditor_datatax").getForm().loadRecord(Ext.creditor_taxdata.getAt(0));
                        var labels = Ext.getCmp("Form-edit_creditor_datatax").find("name", "red_star");
                        var red_star = Ext.getCmp("c_name_tax_income").getValue() == "" ? " " : "*";
                        for (var i = 0; i < labels.length; i++) {
                          var label = labels[i];
                          label.setText(red_star);
                        }
                      },
                    },
                    items: [
                      {
                        xtype: "buttongroup",
                        frame: false,
                        border: false,
                        items: [
                          {
                            xtype: "textfield",
                            id: "c_tax_number_imp",
                            name: "c_tax_number_imp",
                            width: 200,
                            emptyText: "เลขประจําตัวผู้เสียภาษี",
                            minLength: 13,
                            maxLength: 13,
                            enforceMaxLength: true,
                            maskRe: /[0-9]/,
                            listeners: {
                              render: function (c) {
                                var text_ToolTip = "<span style='white-space:nowrap;'>เลขประจําตัวผู้เสียภาษี (13 หลัก) </span>";
                                new Ext.ToolTip({
                                  target: c.id,
                                  anchor: "top",
                                  html: text_ToolTip,
                                });
                              },
                            },
                          },
                          {
                            xtype: "label",
                            name: "red_star",
                            style: { color: "red", "white-space": "nowrap", paddingRight: "9.5px" },
                            width: 10,
                            text: "*",
                          },
                        ],
                      },
                      { xtype: "container", height: 5 },
                      {
                        xtype: "buttongroup",
                        frame: false,
                        border: false,
                        items: [
                          new Ext.form.ComboBox({
                            mode: "local",
                            store: Ext.dc_tax_customer,
                            width: 250,
                            submitValue: true,
                            name: "dc_tax_customer_id",
                            id: "dc_tax_customer_id",
                            valueField: "id",
                            displayField: "c_name",
                            triggerAction: "all",
                            forceSelection: true,
                            selectOnFocus: true,
                            typeAhead: false,
                            emptyText: "ประเภทกิจการทางภาษี",
                            listeners: {
                              render: function (c) {
                                var text_ToolTip = "<span style='white-space:nowrap;'>ประเภทกิจการทางภาษี</span>";
                                new Ext.ToolTip({
                                  target: c.id,
                                  anchor: "top",
                                  html: text_ToolTip,
                                });
                              },
                              afterrender: function () {
                                this.fn = function () {};
                              },
                              Change: function (combo, newValue) {
                                this.fn();
                                if (newValue) {
                                  var record = this.getStore().getById(newValue);
                                  Ext.getCmp("c_name_tax_income").setValue(record.get("c_name_tax_income"));
                                } else {
                                  Ext.getCmp("c_name_tax_income").setValue("");
                                }
                                
                                var labels = Ext.getCmp("Form-edit_creditor_datatax").find("name", "red_star");
                                var red_star = Ext.getCmp("c_name_tax_income").getValue() == "" ? " " : "*";
                                for (var i = 0; i < labels.length; i++) {
                                  var label = labels[i];
                                  label.setText(red_star);
                                }
                              },
                              select: function (combo, record, index) {
                                var newValue = record.data.id;
                                if (this.getValue()) {
                                  var record = this.getStore().getById(this.getValue());
                                  Ext.getCmp("c_name_tax_income").setValue(record.get("c_name_tax_income"));
                                } else {
                                  Ext.getCmp("c_name_tax_income").setValue("");
                                }

                                var labels = Ext.getCmp("Form-edit_creditor_datatax").find("name", "red_star");
                                var red_star = Ext.getCmp("c_name_tax_income").getValue() == "" ? " " : "*";
                                for (var i = 0; i < labels.length; i++) {
                                  var label = labels[i];
                                  label.setText(red_star);
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
                            xtype: "label",
                            style: { color: "red", "white-space": "nowrap", paddingRight: "9.5px" },
                            width: 10,
                            text: "*",
                          },
                          {
                            xtype: "textfield",
                            id: "c_name_tax_income",
                            name: "c_name_tax_income",
                            width: 75,
                            emptyText: "",
                            style: {
                              labelAlign: "center",
                              background: "#EEEEEE",
                              "text-align": "center",
                              border: "1px solid #ADADAD",
                            },
                            readOnly: true,
                          },
                        ],
                      },
                      { xtype: "container", height: 5 },
                      {
                        xtype: "buttongroup",
                        frame: false,
                        border: false,
                        items: [
                          new Ext.form.ComboBox({
                            mode: "local",
                            store: Ext.dc_title,
                            width: 150,
                            valueField: "id",
                            displayField: "c_name",
                            name: "tax_c_title",
                            id: "dc_title_id",
                            triggerAction: "all",
                            // forceSelection: true,

                            selectOnFocus: true,
                            typeAhead: false,
                            emptyText: "คำนำหน้า",
                            submitValue: true,
                            listeners: {
                              render: function (c) {
                                var text_ToolTip = "<span style='white-space:nowrap;'>คำนำหน้า</span>";
                                new Ext.ToolTip({
                                  target: c.id,
                                  anchor: "top",
                                  html: text_ToolTip,
                                });
                              },
                              afterrender: function () {
                                this.fn = function () {};
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
                            name: "red_star",
                            style: { color: "red", "white-space": "nowrap", paddingRight: "9.5px" },
                            width: 10,
                            text: "*",
                          },
                          {
                            xtype: "textfield",
                            id: "tax_c_name",
                            name: "tax_c_name",
                            width: 155,
                            emptyText: "ชื่อ",
                            listeners: {
                              render: function (c) {
                                var text_ToolTip = "<span style='white-space:nowrap;'>ชื่อ</span>";
                                new Ext.ToolTip({
                                  target: c.id,
                                  anchor: "top",
                                  html: text_ToolTip,
                                });
                              },
                            },
                          },
                          {
                            xtype: "label",
                            name: "red_star",
                            style: { color: "red", "white-space": "nowrap", paddingRight: "9.5px" },
                            width: 10,
                            text: "*",
                          },
                          {
                            xtype: "textfield",
                            id: "tax_c_middle_name",
                            name: "tax_c_middle_name",
                            width: 150,
                            emptyText: "ชื่อกลาง",
                            listeners: {
                              render: function (c) {
                                var text_ToolTip = "<span style='white-space:nowrap;'>ชื่อกลาง</span>";
                                new Ext.ToolTip({
                                  target: c.id,
                                  anchor: "top",
                                  html: text_ToolTip,
                                });
                              },
                            },
                          },
                          {
                            xtype: "tbspacer",
                            width: 15,
                          },
                          {
                            xtype: "textfield",
                            id: "tax_c_last_name",
                            name: "tax_c_last_name",
                            width: 155,
                            emptyText: "นามสกุล",
                            listeners: {
                              render: function (c) {
                                var text_ToolTip = "<span style='white-space:nowrap;'>นามสกุล</span>";
                                new Ext.ToolTip({
                                  target: c.id,
                                  anchor: "top",
                                  html: text_ToolTip,
                                });
                              },
                            },
                          },
                        ],
                      },
                      { xtype: "container", height: 5 },
                      {
                        xtype: "buttongroup",
                        frame: false,
                        border: false,
                        items: [
                          {
                            xtype: "textfield",
                            id: "tax_c_branch",
                            name: "tax_c_branch",
                            width: 50,
                            emptyText: "สาขาที่",
                            maskRe: /[0-9]/,
                            listeners: {
                              render: function (c) {
                                var text_ToolTip = "<span style='white-space:nowrap;'>สาขาที่</span>";
                                new Ext.ToolTip({
                                  target: c.id,
                                  anchor: "top",
                                  html: text_ToolTip,
                                });
                              },
                            },
                          },
                          {
                            xtype: "tbspacer",
                            width: 15,
                          },
                          {
                            xtype: "textfield",
                            id: "tax_c_bldg",
                            name: "tax_c_bldg",
                            width: 197,
                            emptyText: "ชื่ออาคาร",
                            listeners: {
                              render: function (c) {
                                var text_ToolTip = "<span style='white-space:nowrap;'>ชื่ออาคาร</span>";
                                new Ext.ToolTip({
                                  target: c.id,
                                  anchor: "top",
                                  html: text_ToolTip,
                                });
                              },
                            },
                          },
                          {
                            xtype: "tbspacer",
                            width: 15,
                          },
                          {
                            xtype: "textfield",
                            id: "tax_c_room_no",
                            name: "tax_c_room_no",
                            width: 80,
                            emptyText: "ห้องที่",
                            listeners: {
                              render: function (c) {
                                var text_ToolTip = "<span style='white-space:nowrap;'>ห้องที่</span>";
                                new Ext.ToolTip({
                                  target: c.id,
                                  anchor: "top",
                                  html: text_ToolTip,
                                });
                              },
                            },
                          },
                          {
                            xtype: "tbspacer",
                            width: 15,
                          },
                          {
                            xtype: "textfield",
                            id: "tax_c_floor",
                            naem: "tax_c_floor",
                            width: 80,
                            emptyText: "ชั้นที่",
                            listeners: {
                              render: function (c) {
                                var text_ToolTip = "<span style='white-space:nowrap;'>ชั้นที่</span>";
                                new Ext.ToolTip({
                                  target: c.id,
                                  anchor: "top",
                                  html: text_ToolTip,
                                });
                              },
                            },
                          },
                          {
                            xtype: "tbspacer",
                            width: 15,
                          },
                          {
                            xtype: "textfield",
                            id: "tax_c_village",
                            name: "tax_c_village",
                            width: 187,
                            emptyText: "หมู่บ้าน",
                            listeners: {
                              render: function (c) {
                                var text_ToolTip = "<span style='white-space:nowrap;'>หมู่บ้าน</span>";
                                new Ext.ToolTip({
                                  target: c.id,
                                  anchor: "top",
                                  html: text_ToolTip,
                                });
                              },
                            },
                          },
                        ],
                      },
                      { xtype: "container", height: 5 },
                      {
                        xtype: "buttongroup",
                        frame: false,
                        border: false,
                        items: [
                          {
                            xtype: "textfield",
                            id: "tax_c_house_no",
                            name: "tax_c_house_no",
                            width: 150,
                            emptyText: "เลขที่",
                            maskRe: /[0-9\/]/,
                            listeners: {
                              render: function (c) {
                                var text_ToolTip = "<span style='white-space:nowrap;'>เลขที่</span>";
                                new Ext.ToolTip({
                                  target: c.id,
                                  anchor: "top",
                                  html: text_ToolTip,
                                });
                              },
                            },
                          },
                          {
                            xtype: "label",
                            name: "red_star",
                            style: { color: "red", "white-space": "nowrap", paddingRight: "9.5px" },
                            width: 10,
                            text: "*",
                          },
                          {
                            xtype: "textfield",
                            id: "tax_c_village_no",
                            name: "tax_c_village_no",
                            width: 80,
                            emptyText: "หมู่ที่",
                            listeners: {
                              render: function (c) {
                                var text_ToolTip = "<span style='white-space:nowrap;'>หมู่ที่</span>";
                                new Ext.ToolTip({
                                  target: c.id,
                                  anchor: "top",
                                  html: text_ToolTip,
                                });
                              },
                            },
                          },
                          {
                            xtype: "tbspacer",
                            width: 15,
                          },
                          {
                            xtype: "textfield",
                            id: "tax_c_lane",
                            name: "tax_c_lane",
                            width: 195,
                            emptyText: "ตรอก/ซอย",
                            listeners: {
                              render: function (c) {
                                var text_ToolTip = "<span style='white-space:nowrap;'>ตรอก/ซอย</span>";
                                new Ext.ToolTip({
                                  target: c.id,
                                  anchor: "top",
                                  html: text_ToolTip,
                                });
                              },
                            },
                          },
                          {
                            xtype: "tbspacer",
                            width: 15,
                          },
                          {
                            xtype: "textfield",
                            id: "tax_c_road",
                            name: "tax_c_road",
                            width: 185,
                            emptyText: "ถนน",
                            listeners: {
                              render: function (c) {
                                var text_ToolTip = "<span style='white-space:nowrap;'>ถนน</span>";
                                new Ext.ToolTip({
                                  target: c.id,
                                  anchor: "top",
                                  html: text_ToolTip,
                                });
                              },
                            },
                          },
                        ],
                      },
                      { xtype: "container", height: 5 },
                      {
                        xtype: "buttongroup",
                        frame: false,
                        border: false,
                        items: [
                          new Ext.form.ComboBox({
                            mode: "local",
                            store: Ext.dc_province,
                            width: 174,
                            valueField: "id",
                            displayField: "c_name",
                            name: "tax_c_province",
                            id: "dc_province_id",
                            triggerAction: "all",
                            // forceSelection: true,
                            selectOnFocus: true,
                            typeAhead: false,
                            emptyText: "จังหวัด",
                            submitValue: true,
                            listeners: {
                              render: function (c) {
                                var text_ToolTip = "<span style='white-space:nowrap;'>จังหวัด</span>";
                                new Ext.ToolTip({
                                  target: c.id,
                                  anchor: "top",
                                  html: text_ToolTip,
                                });
                              },
                              afterrender: function () {
                                this.fn = function () {};
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
                                Ext.dc_district.removeAll();
                                Ext.dc_tambon.removeAll();
                                Ext.c_post_code.removeAll();
                                Ext.getCmp("dc_district_id").setValue("");
                                Ext.getCmp("dc_tambon_id").setValue("");
                                Ext.getCmp("tax_c_post_code").setValue("");

                                if (newValue) {
                                  Ext.dc_district.setBaseParam("dc_province_id", newValue);
                                  Ext.dc_district.load();
                                }
                              },
                              select: function () {
                                Ext.getCmp("dc_district_id").setValue("");
                                Ext.getCmp("dc_tambon_id").setValue("");
                                Ext.getCmp("tax_c_post_code").setValue("");
                              },
                            },
                          }),
                          {
                            xtype: "label",
                            name: "red_star",
                            style: { color: "red", "white-space": "nowrap", paddingRight: "9.5px" },
                            width: 10,
                            text: "*",
                          },
                          new Ext.form.ComboBox({
                            mode: "local",
                            store: Ext.dc_district,
                            width: 174,
                            valueField: "id",
                            displayField: "c_name",
                            name: "tax_c_district",
                            id: "dc_district_id",
                            triggerAction: "all",
                            // forceSelection: true,
                            selectOnFocus: true,
                            typeAhead: false,
                            emptyText: "เขต/อำเภอ",
                            submitValue: true,
                            listeners: {
                              render: function (c) {
                                var text_ToolTip = "<span style='white-space:nowrap;'>เขต/อำเภอ</span>";
                                new Ext.ToolTip({
                                  target: c.id,
                                  anchor: "top",
                                  html: text_ToolTip,
                                });
                              },
                              afterrender: function () {
                                this.fn = function () {};
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
                                Ext.dc_tambon.removeAll();
                                Ext.c_post_code.removeAll();
                                Ext.getCmp("dc_tambon_id").setValue("");
                                Ext.getCmp("tax_c_post_code").setValue("");
                                if (newValue) {
                                  Ext.dc_tambon.setBaseParam("dc_district_id", newValue);
                                  Ext.dc_tambon.load();
                                }
                              },
                              select: function () {
                                Ext.getCmp("dc_tambon_id").setValue("");
                                Ext.getCmp("tax_c_post_code").setValue("");
                              },
                            },
                          }),
                          {
                            xtype: "label",
                            name: "red_star",
                            style: { color: "red", "white-space": "nowrap", paddingRight: "9.5px" },
                            width: 10,
                            text: "*",
                          },
                          new Ext.form.ComboBox({
                            mode: "local",
                            store: Ext.dc_tambon,
                            width: 171,
                            valueField: "id",
                            displayField: "c_name",
                            name: "dc_tambon_id",
                            id: "dc_tambon_id",
                            triggerAction: "all",
                            // forceSelection: true,
                            selectOnFocus: true,
                            typeAhead: false,
                            emptyText: "แขวง/ตำบล",
                            submitValue: true,
                            listeners: {
                              render: function (c) {
                                var text_ToolTip = "<span style='white-space:nowrap;'>แขวง/ตำบล</span>";
                                new Ext.ToolTip({
                                  target: c.id,
                                  anchor: "top",
                                  html: text_ToolTip,
                                });
                              },
                              afterrender: function () {
                                this.fn = function () {};
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
                                Ext.c_post_code.removeAll();
                                Ext.getCmp("tax_c_post_code").setValue("");
                                if (newValue) {
                                  var c_post_code_all = Ext.dc_tambon.getById(newValue).data.c_post_code_all;
                                  var parts = c_post_code_all.split("/");
                                  var dataToAdd = parts.map(function (part) {
                                    return { c_code: part };
                                  });
                                  Ext.c_post_code.loadData(dataToAdd);
                                }
                              },
                              select: function () {
                                Ext.getCmp("tax_c_post_code").setValue("");
                              },
                            },
                          }),
                          {
                            xtype: "label",
                            name: "red_star",
                            style: { color: "red", "white-space": "nowrap", paddingRight: "9.5px" },
                            width: 10,
                            text: "*",
                          },
                          new Ext.form.ComboBox({
                            mode: "local",
                            store: Ext.c_post_code,
                            width: 90,
                            valueField: "c_code",
                            displayField: "c_code",
                            name: "tax_c_post_code",
                            id: "tax_c_post_code",
                            triggerAction: "all",
                            forceSelection: true,
                            // selectOnFocus: true,
                            typeAhead: false,
                            emptyText: "รหัสไปรษณีย์",
                            submitValue: true,
                            listeners: {
                              render: function (c) {
                                var text_ToolTip = "<span style='white-space:nowrap;'>รหัสไปรษณีย์</span>";
                                new Ext.ToolTip({
                                  target: c.id,
                                  anchor: "top",
                                  html: text_ToolTip,
                                });
                              },
                              afterrender: function () {
                                this.fn = function () {};
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
                            name: "red_star",
                            style: { color: "red", "white-space": "nowrap", paddingRight: "9.5px" },
                            width: 10,
                            text: "*",
                          },
                        ],
                      },
                      { xtype: "container", height: 5 },
                      {
                        xtype: "buttongroup",
                        frame: false,
                        border: false,
                        items: [
                          {
                            xtype: "textfield",
                            id: "c_tele_imp",
                            name: "c_tele_imp",
                            width: 174,
                            emptyText: "เบอร์โทรศัพท์",
                            maskRe: /[0-9,\-]/,
                            listeners: {
                              render: function (c) {
                                var text_ToolTip = "<span style='white-space:nowrap;'>เบอร์โทรศัพท์</span>";
                                new Ext.ToolTip({
                                  target: c.id,
                                  anchor: "top",
                                  html: text_ToolTip,
                                });
                              },
                            },
                          },
                          {
                            xtype: "tbspacer",
                            width: 15,
                          },
                          {
                            xtype: "textfield",
                            id: "c_email",
                            name: "c_email",
                            width: 364,
                            emptyText: "อีเมล",
                            validator: function (value) {
                              var emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
                              if (value === "") {
                                return true;
                              } else if (emailPattern.test(value)) {
                                return true;
                              } else {
                                return "<span style='white-space:nowrap;'>กรุณากรอบ email ให้ถูกต้อง</span>";
                              }
                            },
                            listeners: {
                              render: function (c) {
                                var text_ToolTip = "<span style='white-space:nowrap;'>อีเมล</span>";
                                new Ext.ToolTip({
                                  target: c.id,
                                  anchor: "top",
                                  html: text_ToolTip,
                                });
                              },
                            },
                          },
                        ],
                      },
                    ],
                  }),
                  buttons: [
                    {
                      text: "ยืนยัน",
                      hidden: true,
                      handler: function () {
                        let msg = "";

                        if (["", null, undefined].includes(Ext.getCmp("dc_tax_customer_id").getValue())) {
                          msg += "<span style='white-space: nowrap;'>- กรุณาระบุ ประเภทกิจการทางภาษี</span><br>";
                        }
                        if (Ext.getCmp("c_name_tax_income").getValue() != "") {
                          if (!Ext.getCmp("Form-edit_creditor_datatax").getForm().isValid()) {
                            msg += "<span style='white-space: nowrap;'>- กรุณาระบุข้อมูลให้ถูกต้อง</span>";
                          }
                          if (["", null, undefined].includes(Ext.getCmp("c_tax_number_imp").getValue())) {
                            msg += "<span style='white-space: nowrap;'>- กรุณากรอก เลขประจําตัวผู้เสียภาษี</span><br>";
                          }
                          if (["", null, undefined].includes(Ext.getCmp("dc_title_id").getValue())) {
                            msg += "<span style='white-space: nowrap;'>- กรุณาระบุ คำนำหน้า</span><br>";
                          }
                          if (["", null, undefined].includes(Ext.getCmp("tax_c_name").getValue())) {
                            msg += "<span style='white-space: nowrap;'>- กรุณากรอก ชื่อ</span><br>";
                          }
                          if (["", null, undefined].includes(Ext.getCmp("tax_c_house_no").getValue())) {
                            msg += "<span style='white-space: nowrap;'>- กรุณากรอก เลขที่</span><br>";
                          }
                          if (["", null, undefined].includes(Ext.getCmp("dc_province_id").getValue())) {
                            msg += "<span style='white-space: nowrap;'>- กรุณาระบุ จังหวัด</span><br>";
                          }
                          if (["", null, undefined].includes(Ext.getCmp("dc_district_id").getValue())) {
                            msg += "<span style='white-space: nowrap;'>- กรุณาระบุ เขต/อำเภอ</span><br>";
                          }
                          if (["", null, undefined].includes(Ext.getCmp("dc_tambon_id").getValue())) {
                            msg += "<span style='white-space: nowrap;'>- กรุณาระบุ แขวง/ตำบล</span><br>";
                          }
                          if (["", null, undefined].includes(Ext.getCmp("tax_c_post_code").getValue())) {
                            msg += "<span style='white-space: nowrap;'>- กรุณาระบุ รหัสไปรษณีย์</span><br>";
                          }
                        }

                        if (msg == "") {
                          Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
                          Ext.Ajax.request({
                            url: "../po/api/mn_poEditCreditorTax.php",
                            method: "POST",
                            params: {
                              mode: "SAVE_CREDITOR_TAX",
                              dc_creditor_id: data.getValue(),

                              c_tax_number_imp: Ext.getCmp("c_tax_number_imp").getValue(),
                              dc_tax_customer_id: Ext.getCmp("dc_tax_customer_id").getValue(),

                              tax_c_title: Ext.getCmp("dc_title_id").lastSelectionText,
                              tax_c_name: Ext.getCmp("tax_c_name").getValue(),
                              tax_c_middle_name: Ext.getCmp("tax_c_middle_name").getValue(),
                              tax_c_last_name: Ext.getCmp("tax_c_last_name").getValue(),
                              tax_c_branch: Ext.getCmp("tax_c_branch").getValue(),
                              tax_c_bldg: Ext.getCmp("tax_c_bldg").getValue(),
                              tax_c_room_no: Ext.getCmp("tax_c_room_no").getValue(),
                              tax_c_floor: Ext.getCmp("tax_c_floor").getValue(),
                              tax_c_village: Ext.getCmp("tax_c_village").getValue(),
                              tax_c_house_no: Ext.getCmp("tax_c_house_no").getValue(),
                              tax_c_village_no: Ext.getCmp("tax_c_village_no").getValue(),
                              tax_c_lane: Ext.getCmp("tax_c_lane").getValue(),
                              tax_c_road: Ext.getCmp("tax_c_road").getValue(),
                              tax_c_province: Ext.getCmp("dc_province_id").lastSelectionText,
                              tax_c_district: Ext.getCmp("dc_district_id").lastSelectionText,
                              tax_c_tambon: Ext.getCmp("dc_tambon_id").lastSelectionText,
                              tax_c_post_code: Ext.getCmp("tax_c_post_code").lastSelectionText,
                              dc_tambon_id: Ext.getCmp("dc_tambon_id").getValue(),

                              c_tele_imp: Ext.getCmp("c_tele_imp").getValue(),
                              c_email: Ext.getCmp("c_email").getValue(),
                            },
                            success: function (result, request) {
                              Ext.getCmp("contenterCenter").getEl().unmask();
                              let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                              Ext.storeDtl.load({ params: { mode: "" } });
                              if (jsonData.success == true) {
                                Ext.Msg.alert("แจ้งเตือน", "บันทึกเรียบร้อย");
                                Ext.transfer = jsonData.id;
                                Ext.getCmp("dc_tax_customer_idID").setValue(Ext.getCmp("dc_tax_customer_id").getValue());
                                creditor_taxdata_load(data.getValue());
                                Ext.getCmp("window-edit-creditor").hide();
                                Ext.getCmp("window-edit-creditor").destroy();
                              } else {
                                Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg);
                              }
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
                        Ext.getCmp("window-edit-creditor").hide();
                        Ext.getCmp("window-edit-creditor").destroy();
                      },
                    },
                  ],
                }).show();
              },
            });
          },
        });
      },
    });
  } else {
    Ext.Msg.alert("แจ้งเตือน", msg);
  }
}; //edit_creditor_datatax

creditor_taxdata_load = function (dc_creditor_id) {
  // console.log('test');
  Ext.creditor_taxdata.load({
    params: { dc_creditor_id: dc_creditor_id },
    callback: function (recordx, operation, success) {
      var data = Ext.creditor_taxdata.getAt(0).data;
      var title_district = data.tax_c_province == "กรุงเทพมหานคร" ? "เขต" : "อำเภอ";
      var title_tambon = data.tax_c_province == "กรุงเทพมหานคร" ? "แขวง" : "ตำบล";
      var text_tax = "เลขประจำตัวผู้เสียภาษี: " + data.c_tax_number_imp + "\n";
      text_tax += "ประเภทกิจการทางภาษี: " + data.c_name_tax_customer + " : " + data.c_name_tax_income + "\n";
      text_tax += "ชื่อ: " + data.tax_c_title + data.tax_c_name + (data.tax_c_middle_name ? " " + data.tax_c_middle_name : "") + (data.tax_c_last_name ? " " + data.tax_c_last_name : "") + "\n";
      text_tax += data.tax_c_branch ? "สาขา: " + data.tax_c_branch + "\n" : "";
      text_tax += "ที่อยู่: " + (data.tax_c_bldg ? "อาคาร " + data.tax_c_bldg + " " : "") + (data.tax_c_room_no ? "ห้อง " + data.tax_c_room_no + " " : "") + (data.tax_c_floor ? "ชั้น " + data.tax_c_floor + " " : "") + (data.tax_c_village ? "หมู่บ้าน " + data.tax_c_village + " " : "") + "\n";
      text_tax += "        " + (data.tax_c_house_no ? "เลขที่ " + data.tax_c_house_no + " " : "") + (data.tax_c_village_no ? "หมู่ที่ " + data.tax_c_village_no + " " : "") + (data.tax_c_lane ? "ซอย" + data.tax_c_lane + " " : "") + (data.tax_c_road ? "ถนน" + data.tax_c_road + " " : "") + "\n";
      text_tax += "        " + (data.tax_c_tambon ? title_tambon + data.tax_c_tambon + " " : "") + (data.tax_c_district ? title_district + data.tax_c_district + " " : "") + (data.tax_c_province ? "จังหวัด" + data.tax_c_province + " " : "") + data.tax_c_post_code + "\n";
      text_tax += "เบอร์โทรศัพท์: " + data.c_tele_imp + "\n";
      text_tax += "อีเมล: " + data.c_email;
      Ext.getCmp("textarea_tax").setValue(text_tax);

      var msg = "";
      if (["", null, undefined].includes(data.c_name_tax_customer)) {
        msg += "<span style='white-space: nowrap;'>&nbsp;&nbsp;&nbsp;&nbsp;กรุณาระบุ ประเภทกิจการทางภาษี</span><br>";
      }
      if (data.c_name_tax_income != "") {
        if (["", null, undefined].includes(data.c_tax_number_imp)) {
          msg += "<span style='white-space: nowrap;'>&nbsp;&nbsp;&nbsp;&nbsp;กรุณากรอก เลขประจําตัวผู้เสียภาษี</span><br>";
        }
        if (["", null, undefined].includes(data.tax_c_title)) {
          msg += "<span style='white-space: nowrap;'>&nbsp;&nbsp;&nbsp;&nbsp;กรุณาระบุ คำนำหน้า</span><br>";
        }
        if (["", null, undefined].includes(data.tax_c_name)) {
          msg += "<span style='white-space: nowrap;'>&nbsp;&nbsp;&nbsp;&nbsp;กรุณากรอก ชื่อ</span><br>";
        }
        if (["", null, undefined].includes(data.tax_c_house_no)) {
          msg += "<span style='white-space: nowrap;'>&nbsp;&nbsp;&nbsp;&nbsp;กรุณากรอก เลขที่</span><br>";
        }
        if (["", null, undefined].includes(data.tax_c_province)) {
          msg += "<span style='white-space: nowrap;'>&nbsp;&nbsp;&nbsp;&nbsp;กรุณาระบุ จังหวัด</span><br>";
        }
        if (["", null, undefined].includes(data.tax_c_district)) {
          msg += "<span style='white-space: nowrap;'>&nbsp;&nbsp;&nbsp;&nbsp;กรุณาระบุ เขต/อำเภอ</span><br>";
        }
        if (["", null, undefined].includes(data.tax_c_tambon)) {
          msg += "<span style='white-space: nowrap;'>&nbsp;&nbsp;&nbsp;&nbsp;กรุณาระบุ แขวง/ตำบล</span><br>";
        }
        if (["", null, undefined].includes(data.tax_c_post_code)) {
          msg += "<span style='white-space: nowrap;'>&nbsp;&nbsp;&nbsp;&nbsp;กรุณาระบุ รหัสไปรษณีย์</span><br>";
        }
      }
      Ext.tax_msg = msg == "" ? "" : "<span style='white-space: nowrap;'>- ข้อมูลทางภาษีไม่ครบถ้วน</span><br>" + msg;
    },
  });
};
f_per_pay_sum = function () {
  var f_per_pay =
    Ext.getCmp("f_per_inv_vat").getValue().replace(/,/g, "") -
    Ext.getCmp("f_per_tax_personal").getValue().replace(/,/g, "") -
    Ext.getCmp("f_per_social_security").getValue().replace(/,/g, "") -
    Ext.getCmp("f_per_prov_fund").getValue().replace(/,/g, "") -
    Ext.getCmp("f_per_fine").getValue().replace(/,/g, "") -
    Ext.getCmp("f_per_warranty").getValue().replace(/,/g, "") -
    Ext.getCmp("f_per_other").getValue().replace(/,/g, "");

    Ext.getCmp("f_per_pay").setValue(floatRenderer(floatMinus(f_per_pay.toFixed(2), 2)));
  };

/* global Ext */
//(Ext.Poplov_in)ใช้เฉพาะหน้า บันทึกใบขอเบิก
Ext.part_file_pdf = "http://" + location.hostname + "/pdf_po/";
Ext.Poplov_in = Ext.extend(Ext.Button, {
  config: {
    //    	   		mini 		: null,
    //    	   		widthText	: 0,
    //    	   		headerGrid	: [], 	//json
  },
  initComponent: function () {
    this.mini = this.Minipop();
    this.isCellClickGrid = false;
    this.isSetFilter = false;
    this.setReset();
  },

  setReset: function (t) {
    if (t) {
      Ext.getCmp(this.id + "_Name").setValue();
      Ext.getCmp(this.id).setValue();
    }
  },
  afterrender: function () {},
  uiSearch: function (id) {
    var store = this.store;
    var headerGrid = this.headerGrid;
    var id = id;
    var setDefaultFilter = [
      ["c_code", "เลขที่ใบตรวจรับ"],
      ["c_arrive_code", "เลขที่ใบรับของ"],
      ["c_name", "รายการ"],
  ];
    var setDefaultFilter = [
      ["c_code_chk", "เลขที่ตรวจรับ"],
      ["c_code", "เลขที่สัญญา"],
      // ["c_name", "รายการ"],
    ];
    var setFilter = [["c_name", "รายการ"]];

    var filterGrid = new Ext.data.SimpleStore({
      fields: ["value", "text"],
      data: this.isSetFilter ? setFilter : setDefaultFilter,
    });
    var store = this.store;

    var filterGrid = Ext.isEmpty(this.filterGrid) ? filterGrid : this.filterGrid; //comb&store filter
    var defFilter = this.defFilter; //default filter

    return [
      {
        id: "filter" + id,
        xtype: "combo",
        width: 130,
        mode: "local",
        store: filterGrid,
        valueField: "value",
        displayField: "text",
        allowBlank: false,
        editable: false,
        triggerAction: "all",
        typeAhead: false,
        value: Ext.isEmpty(defFilter) ? "c_code" : defFilter,
      },
      "-",
      {
        id: "value-box" + id,
        xtype: "textfield",
        width: 130,
        fieldLabel: "fieldLabel",
        emptyText: "คำที่ต้องการค้นหา",
        listeners: {
          specialkey: function (f, e) {
            if (e.getKey() == e.ENTER) {
              store.setBaseParam("mode", "SEARCH");
              store.setBaseParam("filter", Ext.getCmp("filter" + id).getValue());
              store.setBaseParam("value", Ext.getCmp("value-box" + id).getValue());
              Ext.getCmp("win-pop-lov-modal-" + id)
                .getStore()
                .load();
            }
          },
        },
      },
    ];
  },

  Minipop: function () {
    /******/
    var store = this.store;
    var headerGrid = this.headerGrid;
    var id = this.id;
    var nameID = this.id + "_Name";
    var widthText = isNaN(this.widthText) ? 198 : this.widthText;
    var uiSearch = this.uiSearch(id);

    /*****/
    function SearchGrid(store, id) {
      if (Ext.getCmp("value-box" + id).getValue() != "") {
        store.setBaseParam("mode", "SEARCH");
        store.setBaseParam("filter", Ext.getCmp("filter" + id).getValue());
        store.setBaseParam("value", Ext.getCmp("value-box" + id).getValue());
        Ext.getCmp("win-pop-lov-modal-" + id)
          .getStore()
          .load();
      } else {
        store.setBaseParam("mode", "");
        Ext.getCmp("win-pop-lov-modal-" + id)
          .getStore()
          .load();
      }
    }

    var cellClick_lov = function (grid, rowIndex, columnIndex, e) {
      var record = grid.getStore().getAt(rowIndex);
      var TextShow = record.data.c_code + " " + record.data.c_name;
      Ext.getCmp(id).setValue(record.data.id);
      Ext.getCmp(nameID).setValue(TextShow);

      Ext.getCmp("win-pop-lov" + id).hide();
      Ext.getCmp("win-pop-lov" + id).destroy();
    };

    cellClick_lov = this.isCellClickGrid ? this.cellClickGrid : cellClick_lov;

    return {
      fieldLabel: this.fieldLabel,
      xtype: "radiogroup",
      id: "pop_" + this.id,
      columns: [0, widthText, 40],
      hidden: this.hidden == true ? true : false,
      listeners: {
        afterrender: this.afterrender,
      },
      items: [
        {
          xtype: "hidden",
          name: this.valueHidden,
          id: id,
          value: this.value,
        },
        {
          xtype: "textfield",
          name: "txt" + this.id,
          emptyText: this.text,
          id: nameID,
          readOnly: true,
        },
        {
          xtype: "button",
          id: "Bu" + this.id,
          name: "Bu" + this.id,
          iconCls: this.iconCls,
          handler: function () {
            /* //Load Store Begin SearchGrid */
            store.setBaseParam("mode", "");
            store.load();

            var win = new Ext.Window({
              id: "win-pop-lov" + id,
              title: "เลือกข้อมูล",
              modal: true,
              plain: true,
              layout: "fit",
              maximizable: true,
              constrainHeader: true,
              closable: true,
              listeners: {
                afterrender: function (obj, eOpts) {
                  this.fn = function (widht, height) {
                    var width = Ext.getBody().getViewSize().width * widht;
                    var height = Ext.getBody().getViewSize().height * height;
                    this.setSize(width, height);
                  };
                  this.fn(0.8, 0.85);
                },
                maximize: function (window, opts) {
                  window.setWidth(Ext.getBody().getViewSize().width * 0.99);
                  window.expand("", false);
                  window.center();
                },
              },
              items: [
                {
                  xtype: "grid",
                  id: "win-pop-lov-modal-" + id,
                  border: false,
                  stripeRows: true,
                  loadMask: true,
                  store: store,
                  tbar: [
                    uiSearch,
                    " ",
                    "-",
                    {
                      text: "ค้นหา",
                      id: "magnifier_" + id,
                      iconCls: "icon-magnifier",
                      handler: function () {
                        SearchGrid(store, id);
                      },
                    },
                    " ",
                  ],
                  columns: headerGrid,
                  listeners: {
                    afterrender: function (obj, eOpts) {
                      this.fn = function (widht, height) {
                        //percentage

                        var width = Ext.getBody().getViewSize().width * widht;
                        var height = Ext.getBody().getViewSize().height * height;
                        this.setSize(width, height);
                      };
                      this.fn(0.5, 0.4);
                    },
                  },
                  autoExpandColumn: "c_name",
                  bbar: new Ext.PagingToolbar({
                    pageSize: 15,
                    store: store,
                    displayInfo: true,
                    displayMsg: "Displaying topics {0} - {1} of {2}",
                  }),
                },
              ],
            });

            win.show();
            Ext.getCmp("win-pop-lov-modal-" + id).on("cellclick", cellClick_lov, this);
          },
        },
      ],
    };
  }, //Mini
});

Ext.AppUx = function (app, menu) {
  Ext.HDR_ID = null;
  // storeYear
  Ext.selectRow = null;
  Ext.menuEditGrid = false;
  Ext.menuRightEditgrid = true;
  let years = [];
  let currentTime = new Date();
  let now = currentTime.getFullYear() + 1;
  let id = currentTime.getFullYear() - 4;
  while (id <= now) {
    let c_name = id + 543;
    years.push({ id, c_name });
    id++;
  }

  // Ext.bgYear = now - 1;

  function CopyToClipboard(rec, arrDataCopy) {
    var input = rec;
    var textToClipboard = "";
    //text on
    var success = true;
    for (var i = 0; i < arrDataCopy.length; i++) {
      textToClipboard += ", " + input.get(arrDataCopy[i]);
    }

    if (window.clipboardData) {
      // Internet Explorer
      window.clipboardData.setData("Text", textToClipboard);
    } else {
      var forExecElement = CreateElementForExecCommand(textToClipboard);
      SelectContent(forExecElement);
      var supported = true;
      // UniversalXPConnect privilege is required for clipboard access in Firefox
      try {
        if (window.netscape && netscape.security) {
          netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        }
        success = document.execCommand("copy", false, null);
      } catch (e) {
        success = false;
      }
      document.body.removeChild(forExecElement);
    }

    if (success) {
      console.log("The text is on the clipboard, try to paste it!");
    } else {
      console.log("Your browser doesn't allow clipboard access!");
    }
  }

  function CreateElementForExecCommand(textToClipboard, arrDataCopy) {
    var forExecElement = document.createElement("div");
    forExecElement.style.position = "absolute";
    forExecElement.style.left = "-10000px";
    forExecElement.style.top = "-10000px";
    forExecElement.textContent = textToClipboard;
    document.body.appendChild(forExecElement);
    forExecElement.contentEditable = true;
    return forExecElement;
  }

  function SelectContent(element) {
    // first create a range
    var rangeToSelect = document.createRange();
    rangeToSelect.selectNodeContents(element);
    // select the contents
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(rangeToSelect);
  }

  function cellClick(grid, rowIndex, columnIndex, e) {
      Ext.selectRow = grid.store.getAt(rowIndex);
  }
  cellClick = function (grid, rowIndex, columnIndex, e) {
    let record = grid.getStore().getAt(rowIndex);
    if (columnIndex == grid.getColumnModel().getIndexById("print")) {
      // console.log(record);
      if(record.data.po_working_hdr_id > 0){
        Preview(record.data.po_working_hdr_id);
      } else {
        Ext.example.msg("แจ้งเตือน","ยังไม่ส่งเบิกไม่สามารถดูข้อมูลได้", 1);
        $(this).next("text copied");
        setTimeout(function () {
        $(this).next().remove();
        }, 6000);
        return;
      }
    }
  }; //cellClick

  cellClick_gridAcc = function (grid, rowIndex, columnIndex, e) {
    let record = grid.getStore().getAt(rowIndex);
    if (columnIndex == grid.getColumnModel().getIndexById("delete")) {
      Ext.po_working_begin_item.removeAt(rowIndex);
      grid.getView().refresh();
    }
  }; //cellClick

  Ext.po_user = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "../po/api/All_PoWorkingImpHdrWork.php",
    baseParams: {
      type: "po_user",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
  });
  // copy text in cell on select row no
  Ext.po_emp = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "../po/api/All_PoWorkingImpHdrWork.php",
    baseParams: {
      type: "po_emp",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_code", "c_name"],
  });
  Ext.po_user_permission = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "../po/api/All_PoWorkingImpHdrWork.php",    
    baseParams: {
      type: "po_user_permission",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
  });
  Ext.dc_cost = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "../po/api/All_PoWorkingImpHdrWork.php",
    baseParams: {
      type: "dc_cost",
    },

    root: "data",
    idProperty: "id",
    fields: ["id", "c_code", "c_name"],
  });
  let po_working_begin_item_Record = Ext.data.Record.create([{ name: "no" }, { name: "id" }, { name: "dc_acc_id" }, { name: "dc_acc_name" }, { name: "f_inv" }, { name: "f_vat" }, { name: "f_inv_vat" }]);
  Ext.po_working_begin_item = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "../po/api/List_PoWorkingDtlWork.php",
    baseParams: {
      type: "po_working_begin_item",
    },
    root: "data",
    idProperty: "id",
    fields: po_working_begin_item_Record,
  });
  Ext.dc_acc_expense = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "../po/api/All_PoWorkingImpHdrWork.php",
    baseParams: {
      type: "dc_acc_expense",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_code", "c_name"],
  });
  Ext.dc_creditor_po = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "../po/api/All_PoWorkingImpHdrWork.php",
    baseParams: {
      type: "dc_creditor_po",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_code", "po_creditor_id", "c_tax_number_imp", "dc_tax_customer_id", "c_name"],
  });
  Ext.dc_creditor_po_transfer = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "../po/api/All_PoWorkingImpHdrWork.php",
    baseParams: {
      type: "dc_creditor_po_transfer",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_code", "po_creditor_id", "c_tax_number_imp", "c_name"],
  });
  Ext.po_creditor = new Ext.data.JsonStore({ 
    autoDestroy: false,
    autoLoad: true,
    url: "../po/api/All_PoWorkingImpHdrWork.php",
    baseParams: {
      type: "po_creditor",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_code", "c_name"],
  });
  Ext.po_creditor_transfer = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "../po/api/All_PoWorkingImpHdr.php",
    baseParams: {
      type: "po_creditor_transfer",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_code", "c_name"],
  });
  Ext.dc_bank_acc_creditor = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "../po/api/All_PoWorkingImpHdrWork.php",
    baseParams: {
      type: "dc_bank_acc_creditor",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name_full", "c_code", "c_name_bank_acc", "c_name_bank"],
  });
  Ext.dc_expense_budget_type = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "../po/api/All_PoWorkingImpHdrWork.php",
    baseParams: {
      type: "dc_expense_budget_type",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
  });
  Ext.bg_expense_group = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "../po/api/All_PoWorkingImpHdrWork.php",
    baseParams: {
      type: "bg_expense_group",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
  });
  Ext.bg_expense = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "../po/api/All_PoWorkingImpHdrWork.php",
    baseParams: {
      type: "bg_expense",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
  });
  Ext.bg_expense_expire = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "../po/api/All_PoWorkingImpHdrWork.php",
    baseParams: {
      type: "bg_expense_expire",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
  });
  Ext.dc_tax_customer = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "../po/api/All_PoWorkingImpHdrWork.php",
    baseParams: {
      type: "dc_tax_customer",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name", "i_is_type", "i_dec_person", "i_type_tax", "dc_tax_income_id", "c_name_tax_income"],
  });
  Ext.dc_province = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "../po/api/All_PoWorkingImpHdrWork.php",
    baseParams: {
      type: "dc_province",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
  });
  Ext.dc_district = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "../po/api/All_PoWorkingImpHdrWork.php",
    baseParams: {
      type: "dc_district",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
  });
  Ext.dc_tambon = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "../po/api/All_PoWorkingImpHdrWork.php",
    baseParams: {
      type: "dc_tambon",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name", "c_post_code_all"],
  });
  Ext.dc_title = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "../po/api/All_PoWorkingImpHdrWork.php",
    baseParams: {
      type: "dc_title",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
  });
  Ext.c_post_code = new Ext.data.JsonStore({
    fields: ["c_code"],
  });
  Ext.creditor_taxdata = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "../po/api/All_PoWorkingImpHdrWork.php",
    baseParams: { type: "CREDITOR_TAXDATA" },
    root: "data",
    idProperty: "id",
    fields: [
      "id",
      "c_tax_number_imp",
      "dc_tax_customer_id",
      "c_name_tax_customer",
      "c_name_tax_income",
      "tax_c_title",
      "tax_c_name",
      "tax_c_middle_name",
      "tax_c_last_name",
      "tax_c_branch",
      "tax_c_bldg",
      "tax_c_room_no",
      "tax_c_floor",
      "tax_c_village",
      "tax_c_house_no",
      "tax_c_village_no",
      "tax_c_lane",
      "tax_c_road",
      "tax_c_province",
      "tax_c_district",
      "tax_c_tambon",
      "tax_c_post_code",
      "dc_tambon_id",
      "c_email",
      "c_tele_imp",
      "dc_tambon_id",
      "dc_district_id",
      "dc_province_id",
      "c_post_code_all",
    ],
  });
  Ext.spChecking = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "../po/reg/DAO/sp_listChecking.php",
    baseParams: {
        type: "checkingList", id: 0
    },
    root: "data",
    idProperty: "id",
    fields: [{name: "no"},
        {name: "id"},
        {name: "checking_id"},
        {name: "sp_check_period_hdr_id"},
        {name: "dc_creditor_id"},
        {name: "sp_gl_monthly_hdr_id"},
        {name: "sp_tor_contract_id"},
        {name: "c_status_last"},
        {name: "dc_cost_idTxt"},
        {name: "dc_cost2_id"},
        {name: "dc_cost2_idTxt"},
        {name: "i_product_type"},
        {name: "i_product_typeTxt"},
        {name: "c_approve_name"},
        {name: "c_arrive_code"},
        {name: "c_name"},
        {name: "c_code"},
        {name: "c_contract_code"},
        {name: "dc_expense_budget_type_idTxt"},
        {name: "bg_expense_group_idTxt"},
        {name: "po_working_hdr_id"},
        {name: "po_working_dtl_id"},
        {name: "i_budget_year"},
        {name: "i_yyyy_overlap"},
        {name: "c_overlap"},
        {name: "i_budget_year_overlap"},
        {name: "i_type_year"},
        {name: "dc_cost_id"},
        {name: "po_creditor_transfer_id"},
        {name: "po_creditor_id"},
        {name: "dc_expense_budget_type_id"},
        {name: "bg_expense_group_id"},
        {name: "bg_expense_id"},
        {name: "bg_expense_idTxt"},
        {name: "d_audit_date"},
        {name: "d_approve_date"},
        {name: "po_emp_id"},
        {name: "dc_approve_id"},
        {name: "c_code_ref"},
        {name: "d_doc_date"},
        {name: "d_checking_date"},
        {name: "c_code_invoice"},
        {name: "d_inv_date"},
        {name: "po_creditor_id"},
        {name: "po_creditor_name"},
        {name: "sp_emp_name"},
        {name: "sp_emp_id"},
        {name: "c_detail"},
        {name: "c_qty"},
        {name: "f_total"},
        {name: "c_comment"},
        {name: "i_is_url_pdf_hdr"},
        {name: "i_is_url_pdf_dtl"},
        {name: "f_total_add_vat_amt"},
        {name: "f_vat_amt"},
        {name: "f_rate_vat"},
        {name: "pdf_hdr"},
        {name: "pdf_dtl"}],
});
Ext.spChecking_PR = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "../po/reg/DAO/sp_listChecking.php",
  baseParams: {
      type: "checkingList_PR", id: 0
  },
  root: "data",
  idProperty: "id",
  fields: [{name: "no"},
  {name: "id"},
  {name: "sp_tor_id"},
  {name: "status_name"},
  {name: "pr_code"},
  {name: "chk_code"},
  {name: "c_name"},
  {name: "bg_expense_id"},
  {name: "expense_name"},
  {name: "dc_expense_budget_type_id"},
  {name: "dc_expense_budget_type_idTxt"},
  {name: "i_type_bg"},
  {name: "i_yyyy"},
  {name: "f_total_amt"},
  {name: "sp_status_hdr_id"},
  {name: "d_sent_date"},
  {name: "sp_emp_id"},
  {name: "sp_emp_name"},
  {name: "sp_withdraw_id"},
  {name: "c_invoice"},
  {name: "d_doc_date"},
  {name: "d_audit_date"},
  {name: "i_product_type"},
  {name: "dc_creditor_id"},
  {name: "c_code_invoice"},
  ],
});
  Ext.storeCont = new Ext.data.JsonStore({
    //autoLoad: true,
    storeId: "myStoreCont",
    url: "api/List_PoWorkingDtlCancelWork.php", //List_PoWorkingDtlCancel.php
    baseParams: { type: "storeDtlCancel", id: 0 },
    root: "data",
    idProperty: "po_working_hdr_id",
    totalProperty: "totalCount",
    fields: [
      { name: "no" },
      { name: "id" },
      { name: "c_code" },
      { name: "c_name" },
      { name: "c_status_last" },
      { name: "dc_cost_idTxt" },
      { name: "dc_expense_budget_type_idTxt" },
      { name: "bg_expense_group_idTxt" },
      { name: "po_working_hdr_id" },
      { name: "po_working_dtl_id" },
      { name: "i_budget_year" },
      { name: "i_budget_year_overlap" },
      { name: "i_type_year" },
      { name: "dc_cost_id" },
      { name: "po_creditor_transfer_id" },
      { name: "po_creditor_id" },
      { name: "dc_expense_budget_type_id" },
      { name: "bg_expense_group_id" },
      { name: "c_approve_name" },
      { name: "bg_expense_id" },
      { name: "bg_expense_idTxt" },
      { name: "d_audit_date" },
      { name: "d_approve_date" },
      { name: "po_emp_id" },
      { name: "dc_approve_id" },
      { name: "c_code_ref" },
      { name: "d_doc_date" },
      { name: "d_inv_date" },
      { name: "po_creditor_id" },
      { name: "po_creditor_name" },
      { name: "c_detail" },
      { name: "c_qty" },
      { name: "f_total" },
      { name: "c_comment" },
    ],
  });
  Ext.storeDtl = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "../po/api/List_PoWorkingDtlWork.php",

    baseParams: {
      type: "po_working_dtl",
      keyData: Ext.keyData,
    },
    root: "data",
    idProperty: "id",
    totalProperty: "totalCount",
    fields: [
      {name: "no"},
      {name: "id"},
      {name: "checking_id"},
      {name: "i_period"},
      {name: "i_type_bg"},
      {name: "bg_checking_money_id"},
      {name: "i_is_withdraw"},
      {name: "po_working_hdr_id"},
      {name: "sp_check_period_hdr_id"},
      {name: "sp_gl_monthly_hdr_id"},
      {name: "d_receive_date"},
      {name: "c_checking_code"},
      {name: "c_contract_code"},
      {name: "sp_tor_contract_id"},
      {name: "i_yyyy"}, {name: "now_yyyy"},
      {name: "i_yyyy_overlap"},
      {name: "dc_expense_budget_type_id"},
      {name: "sp_emp_id"},
      {name: "sp_emp_name"},
      {name: "c_qty"},
      {name: "c_code_invoice"},
      {name: "dc_cost_id"},
      {name: "f_total"},
      {name: "url"},
      {name: "c_overlap"},
      {name: "i_overlap"},
      {name: "bg_reserve_overlap_id"},
      {name: "i_statusTxt"},
      {name: "bg_expense_id"},
      {name: "po_emp_id"},
      {name: "po_creditor_transfer_id"},
      {name: "po_creditor_id"},
      {name: "po_emp_name"},
      {name: "po_creditor_transfer_name"},
      {name: "po_creditor_name"},
      {name: "dc_creditor_name"},
      {name: "c_comment"},

      {name: "c_file_pdf_hdr"},
      {name: "c_file_pdf_dtl"},
      {name: "po_working_status"},
      {name: "working_code"},
      {name: "enable_working"},
      {name: "parent"},

      {name: "i_budget_year"},
      {name: "i_budget_year_overlap"},
      {name: "i_is_warranty"},
      {name: "i_warranty_age"},
      {name: "i_before"},
      {name: "c_arrive_code"},
      {name: "d_warranty_date"},
      {name: "d_doc_date"}, 
      {name: "d_checking_date"},
      {name: "d_audit_date"},
      {name: "c_code"},
      {name: "dc_bg_budget_type_idTxt"},
      {name: "po_expense_idTxt"},
      {name: "sp_contract_id"},
      {name: "dc_creditor_chk_id"},
      {name: "dc_creditor_id"},
      {name: "dc_creditor_transfer_id"},
      // {name: "dc_creditor_name"},
      {name: "sp_tor_hdr_period_id"},
      {name: "sp_tor_contract_id"},
      {name: "sp_po_id", type: "int"},
      {name: "i_period", type: "int"},
      {name: "f_total_amt", type: "string"},
      {name: "d_period_date"}, 
      {name: "d_arrive_date"},
      {name: "c_arrive_code"}, 
      {name: "c_code_ref"},
      {name: "dc_bank_acc_creditor_id"}, 
          
      {name: "f_per_inv"},
      {name: "f_per_vat"},
      {name: "f_per_vat_rate"},
      {name: "f_per_inv_vat"},
      {name: "f_per_tax_personal"},
      {name: "f_per_tax_personal_rate"},
      {name: "f_per_social_security"},
      {name: "f_per_prov_fund"},
      {name: "f_per_fine"},
      {name: "f_per_warranty"},
      {name: "f_per_other"},
      {name: "f_per_pay"},
    ],
  });
  Ext.store_year = new Ext.data.JsonStore({
    fields: ["id", "c_name"],
    autoDestroy: false,
    autoLoad: false,
    data: years,
  });

  function DisbledButton(t) {
    //Disabled etc...
    if (t) {
      Ext.getCmp("buSaveID").hide();
    } else {
      Ext.getCmp("buSaveID").show();
    }
  }
  //Ext
  Ext.keyData = 1; //type data key in
  Ext.title = "ข้อของการขอเบิก";
  Ext.poFormID = "grid-form-cheque";
  Ext.getDate = Ext.apply({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDay(),
    getNowCarlen: function () {
      var day = new Date();
      var dd = day.getDate();
      var mm = day.getMonth() + 1;
      var yy = day.getFullYear() + 543;
      mm = mm < 10 ? "0" + mm : mm;
      dd = dd < 10 ? "0" + dd : dd;
      return dd + "-" + mm + "-" + yy;
    },
    defaultDate: function (typeStartDate) {
      var day = new Date();
      var dd = day.getDate();
      var mm = day.getMonth() + 1;
      var yy = day.getFullYear() + 543;
      if (typeStartDate === 1) {
        // วันที่เริ่ม -1 เดือน
        dd = "01";
        mm = "0" + mm.toString();
      } else {
        dd = "0" + dd.toString();
        mm = "0" + mm.toString();
      }
      return dd.substr(-2) + "-" + mm.substr(-2) + "-" + yy.toString();
    },
  });
  //interlizing
  Ext.loadStore = function (status, show) {
    var statusx = status;
    var winx = show;
    if (statusx == "edit" && Ext.isEmpty(Ext.selectRow))
      Ext.Msg.alert("แจ้งเตือน", "กรุณา click เลือกข้อมูลที่จะแก้ไขใน data grid", function (form, action) {
        return false;
      });
    else
      Ext.po_creditor.reload({
        callback: function (recordx, operation, success) {
          if (success) {
            Ext.po_creditor_transfer.reload({
              callback: function (recordx, operation, success) {
                if (success) {
                  Ext.dc_cost.reload({
                    callback: function (recordx, operation, success) {
                      if (success) {
                        Ext.po_emp.reload({
                          callback: function (recordx, operation, success) {
                            if (success) {
                              Ext.po_user_permission.reload({
                                callback: function (recordx, operation, success) {
                                  if (success) {
                                    Ext.dc_expense_budget_type.reload({
                                      callback: function (recordx, operation, success) {
                                        if (success) {
                                          Ext.bg_expense_group.reload({
                                            callback: function (recordx, operation, success) {
                                              if (success) {
                                                Ext.bg_expense.reload({
                                                  callback: function (recordx, operation, success) {
                                                    if (success) {
                                                      Ext.bg_expense_expire.reload({
                                                        callback: function (recordx, operation, success) {
                                                          if (statusx === "load") {
                                                          } else AppPoStore(statusx).show();

                                                          if (statusx === "add") {
                                                            Ext.po_working_begin_item.clearData();
                                                            Ext.po_working_begin_item.removeAll();
                                                            Ext.dc_bank_acc_creditor.load();

                                                            Ext.selectRow = null;
                                                            Ext.HDR_ID = null;
                                                            Ext.pdf_hdr = null;
                                                            Ext.pdf_dtl = null;
                                                            Ext.i_is_url_pdf_hdr = null;
                                                            Ext.i_is_url_pdf_dtl = null;
                                                            Ext.getCmp("btn_pdf1").hide();
                                                            Ext.getCmp("btn_pdf2").hide();
                                                            Ext.getCmp("i_edit_pdfID").hide();
                                                            var checkbox = Ext.getCmp("check_vat");
                                                            var checkHandler = checkbox.initialConfig.listeners.check;
                                                            checkbox.un("check", checkHandler);
                                                            checkbox.setValue(false);
                                                            checkbox.on("check", checkHandler);
                                                            Ext.getCmp("f_per_vat").setReadOnly(true);
                                                            Ext.getCmp("f_per_vat").el.setStyle("background", "#eee");

                                                            var checkbox = Ext.getCmp("check_tax_personal");
                                                            var checkHandler = checkbox.initialConfig.listeners.check;
                                                            checkbox.un("check", checkHandler);
                                                            checkbox.setValue(false);
                                                            checkbox.on("check", checkHandler);
                                                            Ext.getCmp("f_per_tax_personal").setReadOnly(true);
                                                            Ext.getCmp("f_per_tax_personal").el.setStyle("background", "#eee");
                                                            Ext.getCmp("i_cont_dis_idID_PR").hide();
                                                          } else if (statusx === "edit") {
                                                            if(Ext.selectRow.data.i_type_bg == 5 ){
                                                              Ext.getCmp("i_cont_dis_idID").hide();
                                                              Ext.getCmp("c_arrive_code").hide();
                                                              Ext.getCmp("c_contract_code").hide();
                                                              Ext.getCmp("c_overlap").hide();
                                                              Ext.getCmp("d_checking_date").setReadOnly(false);
                                                            }
                                                            Ext.getCmp("i_cont_dis_idID").hide();
                                                            Ext.getCmp("i_is_parentID").hide();
                                                            Ext.getCmp("i_cont_dis_idID_PR").hide();
                                                              Ext.dc_creditor_po.load({
                                                                params: { dc_creditor_id: Ext.selectRow.data.dc_creditor_id },
                                                                callback: function (recordx, operation, success) {
                                                                },
                                                              });
                                                              if (Ext.selectRow.get("po_working_hdr_id") == 0 ){
                                                                              Ext.getCmp("buSaveSubID").show();
                                                                      }else{
                                                                              Ext.getCmp("buSaveSubID").hide();
                                                                      }
                                                            Ext.dc_acc_expense.load({ params: { bg_expense_id: Ext.selectRow.data.bg_expense_id } });
                                                            // Ext.po_working_begin_item.load({ params: { po_working_begin_hdr_id: Ext.selectRow.data.po_working_begin_hdr_id } });

                                                            let row = Ext.selectRow.data;
                                                            let editor_bg_expense_id = Ext.getCmp("bg_expense_id");
                                                            let bg_expense_id = row.bg_expense_id;
                                                            let id_1 = getStoreItems(Ext.bg_expense_expire, bg_expense_id, "id");
                                                            let id_2 = getStoreItems(Ext.bg_expense, bg_expense_id, "id");
                                                            if (id_1 != id_2) {
                                                              editor_bg_expense_id.bindStore(Ext.bg_expense);
                                                            } else {
                                                              editor_bg_expense_id.bindStore(Ext.bg_expense_expire);
                                                            }

                                                            Ext.HDR_ID = Ext.selectRow.data.po_working_hdr_id;
                                                            Ext.pdf_hdr = Ext.selectRow.data.pdf_hdr;
                                                            Ext.pdf_dtl = Ext.selectRow.data.pdf_dtl;
                                                            Ext.i_is_url_pdf_hdr = Ext.selectRow.data.i_is_url_pdf_hdr;
                                                            Ext.i_is_url_pdf_dtl = Ext.selectRow.data.i_is_url_pdf_dtl;
                                                            Ext.getCmp("winChequeID").items.items[0].getForm().loadRecord(Ext.selectRow);
                                                            Ext.getCmp("f_totalID").fn();

                                                            if (Ext.selectRow.data.dc_creditor_id > 0) {
                                                              creditor_taxdata_load(Ext.selectRow.data.dc_creditor_id);
                                                            }

                                                            Ext.dc_bank_acc_creditor.load({
                                                              params: { dc_creditor_id: Ext.selectRow.data.dc_creditor_transfer_id },
                                                              callback: function (recordx, operation, success) {
                                                                if (Ext.dc_bank_acc_creditor.totalLength > 1) {
                                                                  var dc_bank_acc_creditor_id = Ext.selectRow.data.dc_bank_acc_creditor_id;
                                                                  var index = dc_bank_acc_creditor_id > 0 ? dc_bank_acc_creditor_id : 0;
                                                                  Ext.getCmp("dc_bank_acc_creditor_id").setValue(index);
                                                                } else {
                                                                  Ext.getCmp("dc_bank_acc_creditor_id").setValue(0);
                                                                }
                                                              },
                                                            });
                                                            if (Ext.selectRow == null) {
                                                              Ext.getCmp("btn_pdf1").hide();
                                                              Ext.getCmp("btn_pdf2").hide();
                                                            } else {
                                                              if (Ext.selectRow.data.pdf_hdr == null) {
                                                                Ext.getCmp("btn_pdf1").hide();
                                                                Ext.getCmp("btn_pdf2").hide();
                                                              } else {
                                                                Ext.getCmp("upload_pdf1").hide();
                                                                Ext.getCmp("upload_pdf2").hide();
                                                              }
                                                            }
                                                            Ext.getCmp("f_per_inv").fn();
                                                            Ext.getCmp("f_per_vat_rate").fn();
                                                            Ext.getCmp("f_per_vat").fn();
                                                            Ext.getCmp("f_per_inv_vat").fn();
                                                            Ext.getCmp("f_per_tax_personal").fn();
                                                            Ext.getCmp("f_per_tax_personal_rate").fn();
                                                            Ext.getCmp("f_per_social_security").fn();
                                                            Ext.getCmp("f_per_prov_fund").fn();
                                                            Ext.getCmp("f_per_fine").fn();
                                                            Ext.getCmp("f_per_warranty").fn();
                                                            Ext.getCmp("f_per_other").fn();
                                                            Ext.getCmp("f_per_pay").fn();
                                                            if (Ext.getCmp("f_per_vat_rate").getValue() > 0) {
                                                              var checkbox = Ext.getCmp("check_vat");
                                                              var checkHandler = checkbox.initialConfig.listeners.check;
                                                              checkbox.un("check", checkHandler);
                                                              checkbox.setValue(true);
                                                              checkbox.on("check", checkHandler);
                                                              Ext.getCmp("f_per_vat").setReadOnly(false);
                                                              Ext.getCmp("f_per_vat").el.setStyle("background", "#fff");
                                                            } else {
                                                              var checkbox = Ext.getCmp("check_vat");
                                                              var checkHandler = checkbox.initialConfig.listeners.check;
                                                              checkbox.un("check", checkHandler);
                                                              checkbox.setValue(false);
                                                              checkbox.on("check", checkHandler);
                                                              Ext.getCmp("f_per_vat").setReadOnly(true);
                                                              Ext.getCmp("f_per_vat").el.setStyle("background", "#eee");
                                                            }

                                                            if (Ext.getCmp("f_per_tax_personal_rate").getValue() > 0) {
                                                              var checkbox = Ext.getCmp("check_tax_personal");
                                                              var checkHandler = checkbox.initialConfig.listeners.check;
                                                              checkbox.un("check", checkHandler);
                                                              checkbox.setValue(true);
                                                              checkbox.on("check", checkHandler);
                                                              Ext.getCmp("f_per_tax_personal").setReadOnly(false);
                                                              Ext.getCmp("f_per_tax_personal").el.setStyle("background", "#fff");
                                                            } else {
                                                              var checkbox = Ext.getCmp("check_tax_personal");
                                                              var checkHandler = checkbox.initialConfig.listeners.check;
                                                              checkbox.un("check", checkHandler);
                                                              checkbox.setValue(false);
                                                              checkbox.on("check", checkHandler);
                                                              Ext.getCmp("f_per_tax_personal").setReadOnly(true);
                                                              Ext.getCmp("f_per_tax_personal").el.setStyle("background", "#eee");
                                                            }
                                                          }
                                                        },
                                                      }); //bg_expense_expire
                                                      //
                                                    }
                                                  },
                                                }); //bg_expense
                                              }
                                            },
                                          }); //bg_expense_group
                                        }
                                      },
                                    }); //dc_expense_budget_type
                                  }
                                },
                              }); //po_user_permission
                            }
                          },
                        }); //po_emp
                      }
                    },
                  }); //dc_cost
                }
              },
            }); //po_creditor
          }
        },
      }); //po_creditor_transfer
  };
  var AppPoStore = function (statuss) {
    var comboEmp = new Ext.form.ComboBox({
      mode: "local",
      store: Ext.po_emp,
      anchor: "100%",
      fieldLabel: "ผู้ดำเนินการ",
      submitValue: true,
      hiddenName: "po_emp_id", //bg_expense_group_id
      name: "po_emp_name",
      id: "po_emp_id",
      valueField: "id",
      displayField: "c_name",
      triggerAction: "all",
      forceSelection: false,
      selectOnFocus: true,
      typeAhead: false,
      emptyText: "กรุณาเลือกคีย์เพิ่มหรือว่างไว้",
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
    });

    var document_inspector = new Ext.form.ComboBox({
      mode: "local",
      store: Ext.po_user_permission,
      anchor: "100%",
      hidden:true,
      fieldLabel: "ผู้ตรวจอนุมัติฎีกา",
      submitValue: true,
      hiddenName: "dc_approve_id", //bg_expense_group_id
      name: "c_checker_name",
      valueField: "id",
      displayField: "c_name",
      triggerAction: "all",
      forceSelection: true,
      selectOnFocus: true,
      typeAhead: false,
      emptyText: "กรุณาเลือกผู้ตรวจอนุมัติฎีกา...",
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
    });
    var comboCost = new Ext.form.ComboBox({
      mode: "local",
      store: Ext.dc_cost,
      anchor: "100%",
      fieldLabel: "หน่วยงานที่ขอเบิก",
      valueField: "id",
      displayField: "c_name",
      hiddenName: "dc_cost_id",
      id:"dc_cost_idID",
      name: "c_cost_name",
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
    });
    var comboTypeBg = new Ext.form.ComboBox({
      mode: "local",
      store: Ext.dc_expense_budget_type,
      fieldLabel: "แหล่งเงิน",
      readOnly : true,
      anchor: "100%",
      submitValue: true,
      name: "dc_expense_budget_type_idTxt",
      hiddenName: "dc_expense_budget_type_id", //bg_expense_group_id
      id : "dc_expense_budget_type_idID",
      valueField: "id",
      displayField: "c_name",
      triggerAction: "all",
      forceSelection: true,
      selectOnFocus: true,
      typeAhead: false,
      emptyText: "กรุณาเลือกแหล่งเงิน...",
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
    });
    var comboBgYear = new Ext.form.ComboBox({
      mode: "local",
      fieldLabel: "ปีงบประมาณ",
      submitValue: true,
      hiddenName: "i_budget_year",
      id : "i_budget_yearID",
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
    });
    var comboUsedBgYear = new Ext.form.ComboBox({
      mode: "local",
      fieldLabel: "ใช้เงินปีงบประมาณ",
      submitValue: true,
      hiddenName: "i_budget_year_overlap",
      id: "i_budget_year_overlap",
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
    });
    var comboExpenseGroup = new Ext.form.ComboBox({
      mode: "local",
      store: Ext.bg_expense_group,
      valueField: "id",
      displayField: "c_name",
      submitValue: true,
      hiddenName: "bg_expense_group_id",
      name: "bg_expense_group_idTxt",
      triggerAction: "all",
      forceSelection: true,
      selectOnFocus: true,
      fieldLabel: "ประเภทรายจ่าย",
      width: 200,
      typeAhead: false,
      emptyText: "กรุณาเลือกประเภทรายจ่าย...",
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
    });
    var comboExpense = new Ext.form.ComboBox({
      mode: "local",
      store: Ext.bg_expense_expire,
      valueField: "id",
      displayField: "c_name",
      anchor: "100%",
      submitValue: true,
      name: "c_detail",
      hiddenName: "bg_expense_id",
      id: "bg_expense_id",
      triggerAction: "all",
      allBlank: true,
      readOnly:true,
      forceSelection: true,
      selectOnFocus: true,
      fieldLabel: "รายการย่อย",
      width: 200,
      typeAhead: false,
      emptyText: "กรุณาเลือกใช้จ่าย...",
      listeners: {
        afterrender: function () {
          this.fn = function () {};
          this.dc_acc_expense_load = function () {
            Ext.dc_acc_expense.load({
              params: { bg_expense_id: this.getValue() },
              callback: function (recordx, operation, success) {
                var num = Ext.po_working_begin_item.data.items.length - 1;
                for (row = 0; num >= row; row++) {
                  var record = Ext.po_working_begin_item.getAt(row);
                  record.set("dc_acc_id", null);
                  record.commit();
                }
              },
            });
          };
        },
        Change: function () {
          this.fn();
          this.dc_acc_expense_load();
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
    });

    var comboCreditor = new Ext.form.ComboBox({
      mode: "local",
      hidden: true,
      store: Ext.po_creditor,
      valueField: "id",
      displayField: "c_name",
      anchor: "100%",
      submitValue: true,
      name: "po_creditor_name",
      hiddenName: "po_creditor_id",
      id: "po_creditor_id",
      triggerAction: "all",
      forceSelection: false,
      allBlank: true,
      selectOnFocus: true,
      fieldLabel: "จ่ายให้  (po)",
      width: 200,
      typeAhead: false,
      emptyText: "กรุณาเลือกคีย์เพิ่มหรือว่างไว้",
      listeners: {
        afterrender: function () {
          this.fn = function () {};
        },
        Change: function () {
          var f_id = Ext.isEmpty(Ext.getCmp("po_creditor_transfer_id").getValue());
          if (f_id) Ext.getCmp("po_creditor_transfer_id").setValue(this.getValue());
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
    });
    var comboCreditortransfer = new Ext.form.ComboBox({
      mode: "local",
      hidden: true,
      store: Ext.po_creditor_transfer,
      valueField: "id",
      displayField: "c_name",
      anchor: "100%",
      submitValue: true,
      name: "po_creditor_transfer_name",
      hiddenName: "po_creditor_transfer_id",
      id: "po_creditor_transfer_id",
      triggerAction: "all",
      forceSelection: false,
      allBlank: true,
      selectOnFocus: true,
      fieldLabel: "โดยมอบให้  (po)",
      width: 200,
      typeAhead: false,
      emptyText: "กรุณาเลือกคีย์เพิ่มหรือว่างไว้",
      listeners: {
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
    });

    var columnMini = [
      {
        header: "ID System",
        sortable: true,
        hidden: true,
        dataIndex: "id",
      },
      {
        header: "เลขที่สัญญา",
        width: 150,
        sortable: true,
        dataIndex: "c_contract_code",
      },
      {
        header: "เลขที่ตรวจรับ",
        sortable: true,
        dataIndex: "c_code",
      },
      {
        header: "จ่ายให้",
        width: 250,
        sortable: true,
        dataIndex: "po_creditor_name",
      },
      {
        header: "รายการ",
        sortable: true,
        id: "c_name",
        dataIndex: "c_name",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = "style='cursor:pointer';";
          return value;
        },
      },

      {
        header: "จำนวนเงินตรวจรับ",
        // width: 250,
        sortable: true,
        dataIndex: "f_total",
        
      },
    ];
    var columnMiniPR = [
      {
        header: "ID System",
        sortable: true,
        hidden: true,
        dataIndex: "id",
    },
    {
        header: "เลขที่ PR",
        sortable: true,
        dataIndex: "pr_code",
    },
    {
      header: "เลขที่ PR",
      sortable: true,
      width: 100,
      dataIndex: "chk_code",
  },
    {
        header: "ปีงบประมาณ",
        width: 100,
        sortable: true,
        dataIndex: "i_yyyy",
    },
    {
        header: "พนักงานผู้ร้บผิดชอบ",
        width: 250,
        sortable: true,
        dataIndex: "sp_emp_name",
    },
    {
        header: "รายการ",
        sortable: true,
        width: 250,
        id: "c_name",
        dataIndex: "c_name",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
            metaData.attr = "style='cursor:pointer';";
            return value;
        },
    },
    ];
    var PopContForm = new Ext.Poplov_in({
      text: "เลือกข้อมูลการตรวจรับ",
      id: "i_parentID",
      iconCls: "page_magnify",
      valueHidden: "i_parent_id",
      store: Ext.spChecking,
      headerGrid: columnMini,
      widthText: 330,
      fieldLabel: "เลือกข้อมูลการตรวจรับ",  
      isCellClickGrid: true,
      cellClickGrid: function (grid, rowIndex, columnIndex, e) {
        var id = "i_parentID";
        var nameID = id + "_Name";
        var record = grid.getStore().getAt(rowIndex);
        var TextShow = record.data.c_code + " " + record.data.c_name;
        Ext.getCmp(id).setValue(record.data.po_working_hdr_id);
        Ext.getCmp("c_code_invoiceID").setValue(record.data.c_code_invoice);
        Ext.getCmp("dc_cost_idID").setValue(record.data.dc_cost_id);
        Ext.getCmp("f_per_inv").setValue(record.data.f_total);  
        Ext.getCmp("f_per_inv_vat").setValue(record.data.f_total);
        Ext.getCmp("f_per_pay").setValue(record.data.f_total);  
        record.set("po_emp_name", record.get('sp_emp_name')); // pure
        Ext.dc_creditor_po.load({
              params: { dc_creditor_id: record.data.dc_creditor_id },
              callback: function (recordx, operation, success) {
                  Ext.getCmp("dc_creditor_po_idID").setValue(null);
                  Ext.getCmp("dc_creditor_transfer_id").setValue(null);
                  Ext.getCmp("po_creditor_id").setValue(null);
                  Ext.getCmp("po_creditor_transfer_id").setValue(null);
                },
              });
          record.set("id", null);
          record.set("po_working_hdr_id", null);
          record.set("po_working_dtl_id", null);
          record.set("c_code", null);
          record.set("po_creditor_id", null);
          record.set("po_creditor_transfer_id", null);
          record.set("c_status_last", null);
          Ext.getCmp(Ext.poFormID).getForm().loadRecord(record);
        // }
        Ext.getCmp(nameID).setValue(TextShow);
        Ext.getCmp("win-pop-lov" + id).hide();
        Ext.getCmp("win-pop-lov" + id).destroy();
      },
    });
    var PopContForm2 = new Ext.Poplov_in({
      text: "เลือกข้อมูล PR",
      id: "i_parent2ID",
      // hidden: true,
      iconCls: "page_magnify",
      valueHidden: "i_parent_id2",
      store: Ext.spChecking_PR,
      headerGrid: columnMiniPR,
      widthText: 330,
      fieldLabel: "เลือกข้อมูลการตรวจรับ",  
      isCellClickGrid: true,
      cellClickGrid: function (grid, rowIndex, columnIndex, e) {
        var id = "i_parent2ID";
        var nameID = id + "_Name";
        var record = grid.getStore().getAt(rowIndex);
        var TextShow =  record.data.c_name;
        Ext.getCmp(id).setValue(record.data.po_working_hdr_id);
        record.set("id", null);
        record.set("dc_cost_id", Ext.SS_DC_COST_ACC_ID);
        record.set("po_emp_name", record.get('sp_emp_name')); // pure
        Ext.dc_creditor_po.load({
          params: { dc_creditor_id: record.data.dc_creditor_id },
          callback: function (recordx, operation, success) {
              Ext.getCmp("dc_creditor_po_idID").setValue(null);
              Ext.getCmp("dc_creditor_transfer_id").setValue(null);
              Ext.getCmp("po_creditor_id").setValue(null);
              Ext.getCmp("po_creditor_transfer_id").setValue(null);
          },
        });
        
        Ext.getCmp("f_per_inv").setValue(record.data.f_total_amt);  
        Ext.getCmp("f_per_inv_vat").setValue(record.data.f_total_amt);
        Ext.getCmp("f_per_pay").setValue(record.data.f_total_amt); 
        Ext.getCmp("c_commentID").setValue(record.json.c_name);
        Ext.getCmp("f_totalID").setValue(record.json.f_total_amt);
        Ext.getCmp("sp_tor_contract_id").setValue(record.json.sp_tor_contract_id);
        Ext.getCmp("sp_check_period_hdr_id").setValue(record.json.sp_check_period_hdr_id);
        record.set("c_code_ref", null);
        record.set("c_status_last", null);
        record.set("po_creditor_id", null);
        record.set("po_creditor_transfer_id", null);
        Ext.getCmp(Ext.poFormID).getForm().loadRecord(record);
        Ext.getCmp(nameID).setValue(TextShow);
        Ext.getCmp("win-pop-lov" + id).hide();
        Ext.getCmp("win-pop-lov" + id).destroy();
    },
    });
    var statusx = statuss;
    return new Ext.Window({
      collapsible: true,
      maximizable: true,
      title: "ทำรายการขอเบิก",
      width: 1050,
      id: "winChequeID",
      height: 500,
      minWidth: 850,
      minHeight: 450,
      layout: "fit",
      modal: true,
      plain: true,
      bodyStyle: "padding:1px;",
      buttonAlign: "center",
      items: new Ext.FormPanel({
        id: Ext.poFormID,
        url:   Ext.url_post, //"reg/controller/mnPoWorkingHdrBeginWork.php", //file //  
        fileUpload: true,
        frame: true,
        labelAlign: "left",
        bodyStyle: "padding:1px; overflow-y: auto;",
        layout: "column",
        items: [
          {
            columnWidth: 0.6,
            xtype: "fieldset",
            id: "win-cheque",
            labelWidth: 150,
            title: "ข้อมูลรายการ",
            defaults: {
              width: "65%",
              border: false,
            },
            // Default config options for child items
            defaultType: "textfield",
            autoHeight: true,
            bodyStyle: Ext.isIE ? "padding:0 0 1px 5px;" : "padding:0px 1px;",
            border: false,
            style: {
              "margin-left": "3px",
              // when you add custom margin in IE 6...
              "margin-right": Ext.isIE6 ? (Ext.isStrict ? "-4px" : "-5px") : "0", // you have to adjust for it somewhere else
            },
            frame: true,
            // autoScroll: true,
            loadMask: true,
            items: [
              {
                xtype: "hidden",
                name: "id",
              },
              {
                xtype: "hidden",
                name: "po_working_hdr_id",
              },
              {
                xtype: "hidden",
                name: "pdf_hdr",
              },
              {
                xtype: "hidden",
                name: "sp_gl_monthly_hdr_id",
              },
              {
                xtype: "hidden",
                name: "sp_check_period_hdr_id",
                id: "sp_check_period_hdr_id",
              },
              {
                xtype: "hidden",
                name: "sp_tor_contract_id",
                id: "sp_tor_contract_id",
              },
              {
                xtype: "hidden",
                name: "sp_tor_id",
                id:   "sp_tor_id",
              },
              {
                xtype: "hidden",
                name: "sp_emp_id",
              },
              {
                xtype: "hidden",
                name: "user_id",
                value: Ext.session.user_id
              },
              {
                xtype: "hidden",
                name: "i_status_billing",
                value: 5
              },
              {/*dc_cost_id: 38, user_id: 60061*/
                xtype: "hidden",
                name: "dc_cost_ref_id",
                value: Ext.session.dc_cost_id
              },
              {
                xtype: "hidden",
                name: "COST_user_id",
                value: 86,
            },
            {
                xtype: "hidden",
                name: "COST_cost_id",
                value: 38,
            },
              { 
                xtype: "hidden",
                name: "pdf_dtl",
              },
              {
                xtype: "hidden",
                name: "po_working_dtl_id",
              },
              {
                xtype: "hidden",
                name: "dc_tax_customer_id",
                id: "dc_tax_customer_idID",
              }, 
              {
                xtype: "radiogroup",
                /*ss*/
                columns: [100, 200],
                id: "i_is_parentID",
                fieldLabel: "สถานะรายการ",
                items: [
                  {
                    name: "i_is_parent",
                    // id: "i_is_parent1ID",
                    inputValue: 1,
                    checked: true,
                    boxLabel: "เพิ่มรายการใหม่",
                  },
                  {
                    name: "i_is_parent",
                    // id: "i_is_parent2ID",
                    inputValue: 2,
                    // hidden: true,
                    boxLabel: "เพิ่มรายการใหม่(ไม่มีเลขที่สัญญา)",
                  },
                ],
                listeners: {
                  change: function (cb, rec, ind) {
                    this.fn(rec.inputValue);
                      if (rec.inputValue === 1) {
                        Ext.getCmp("i_parent2ID_Name").setValue(null).hide();
                      } else {
                        Ext.getCmp("i_parent2ID_Name").setValue(null).show();
                      }
                    // }
                  },
                  afterrender: function (obj, eOpts) {
                    this.fn = function (i) {
                      if (i === 1) {
                        Ext.getCmp("i_cont_dis_idID_PR").setValue(null).hide();
                        Ext.getCmp("i_cont_dis_idID").show();
                        Ext.getCmp("c_arrive_code").show();
                        Ext.getCmp("c_contract_code").show();
                        Ext.getCmp("c_overlap").show();
                        Ext.getCmp("d_checking_date").setReadOnly(true);
                        Ext.getCmp("c_code_invoiceID").setValue(null);
                        Ext.getCmp("c_qtyID").setValue(null);
                        Ext.getCmp("f_totalID").setValue(null);
                        Ext.getCmp("f_per_inv").setValue(null);
                        Ext.getCmp("f_per_inv_vat").setValue(null);
                        Ext.getCmp("f_per_pay").setValue(null);
                        Ext.getCmp("dc_expense_budget_type_idID").setValue(null);
                        Ext.getCmp("bg_expense_id").setValue(null);
                        Ext.getCmp("dc_cost_idID").setValue(null);
                      } else {
                        Ext.getCmp("i_parentID").setValue(null);
                        Ext.getCmp("i_parentID_Name").setValue(null);
                        Ext.getCmp("i_cont_dis_idID").setValue(null).hide();
                        Ext.getCmp("i_cont_dis_idID_PR").show();
                        Ext.getCmp("c_arrive_code").setValue(null).hide();
                        Ext.getCmp("c_contract_code").setValue(null).hide();
                        Ext.getCmp("c_overlap").setValue(null).hide();
                        Ext.getCmp("d_checking_date").setReadOnly(false);
                        Ext.getCmp("c_code_invoiceID").setValue(null);
                        Ext.getCmp("c_qtyID").setValue(null);
                        Ext.getCmp("f_totalID").setValue(null);
                        Ext.getCmp("f_per_inv").setValue(null);
                        Ext.getCmp("f_per_inv_vat").setValue(null);
                        Ext.getCmp("f_per_pay").setValue(null);
                        Ext.getCmp("dc_expense_budget_type_idID").setValue(null);
                        Ext.getCmp("bg_expense_id").setValue(null);
                        Ext.getCmp("dc_cost_idID").setValue(null);

                      }
                    }; //fn
                    this.fn(Ext.getCmp("i_is_parentID").getValue().inputValue);
                  },
                },
              },
              {
                xtype: "radiogroup",
                columns: [98, 98],
                fieldLabel: "ของที่ได้มา",
                name: "i_product_type",
                // id: "i_product_typeID",
                items: [
                    {
                        checked: true,
                        name: "i_product_type",
                        inputValue: 1,
                        boxLabel: "วัสดุ",
                    },
                    {
                        inputValue: 2,
                        name: "i_product_type",
                        boxLabel: "ครุภัณฑ์",
                    },
                    {
                        inputValue: 0,
                        name: "i_product_type",
                        boxLabel: "ไม่มีของ",
                    },
                ], //radiogroup
                listeners: {
                    change: function () {
                    },
                    afterrender: function () {
                        if (this.getValue().inputValue == 2) {
                        } else {
                        }
                    },
                },
            },
              {
                xtype: "compositefield",
                id: "i_cont_dis_idID",
                fieldLabel: "เลือกข้อมูลการตรวจรับ",
                msgTarget: "side",
                anchor: "-20",
                defaults: {
                  flex: 1,
                },
                listeners: {
                  afterrender: function (obj, eOpts) {
                      this.fn = function (i) {
                          if (i == "edit") {
                              Ext.getCmp("i_cont_dis_idID").hide();
                          } else {
                              Ext.getCmp("i_cont_dis_idID").show();
                          }
                      }; //fn
                      this.fn(Ext.buAct);
                  },
              },
                items: [PopContForm.mini],
              },
              {
                xtype: "compositefield",
                id: "i_cont_dis_idID_PR",
                hidden: true,
                fieldLabel: "เลือกข้อมูลจากPR",
                msgTarget: "side",
                anchor: "-20",
                defaults: {
                  flex: 1,
                },
                listeners: {
                  afterrender: function (obj, eOpts) {
                      this.fn = function (i) {
                          if (i == "edit") {
                              Ext.getCmp("i_cont_dis_idID_PR").hide();
                          } else {
                              Ext.getCmp("i_cont_dis_idID_PR").show();
                          }
                      }; //fn
                      this.fn(Ext.buAct);
                  },
              },
                items: [PopContForm2.mini],
              },
              {
                xtype: "textfield",
                fieldLabel: "เลขที่ใบขอเบิก",
                name: "c_code_ref",
                id: "c_code_ref",
                allowBlank: false,
                style: {
                  "font-weight": "bold",
                  padding: "1px",
                  margin: "1px",
                  color: "#000",
                  "background-color": "#eee !important",
                  "text-align": "center",
                },
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
                fieldLabel: "เลขที่ตรวจรับ",
                name: "c_arrive_code",
                id : "c_arrive_code",
                readOnly:true,
              },
              {
                xtype: "textfield",
                fieldLabel: "เลขที่สัญญา",
                name: "c_contract_code",
                id: "c_contract_code",
                readOnly:true,
              },
              {
                xtype: "textfield",
                fieldLabel: "เลขที่ใบกันเหลื่อม",
                name: "c_overlap",
                id: "c_overlap",
                readOnly: true,
            },
              comboBgYear,
              comboUsedBgYear,
              comboTypeBg,
              /*  comboExpenseGroup,*/
              comboExpense,
              comboCost,
              {
                xtype: "textfield",
                allowBlank: true,
                emptyText: 'https://docs.google.com/document/pdrf/view?usp=sharing',
                anchor: "90%",
                fieldLabel: "url drive link pdf",
                name: "url",
                id: "url",
            },
              comboCreditor,

              comboCreditortransfer,
              { xtype: "container", height: 15 },
              // {
              //   xtype: "textfield",
              //   anchor: "100%",
              //   fieldLabel: "เลขที่ใบส่งของ / ใบส่งมอบงาน ", 
              //   name: "c_code_invoice",
              //   id:"c_code_invoiceID",
              //   enableKeyEvents: true,
              //   listeners: {
              //     keyup: function (me, e) {
              //       var maxlength = 255;
              //       if (me.getValue().length >= maxlength) {
              //         var newval = me.getValue().substring(0, maxlength);
              //         me.setValue(newval);
              //       }
              //     },
              //   },
              // },
              {
                xtype: "textfield",
                anchor: "100%",
                fieldLabel: "เลขที่ใบแจ้งหนี้ ",  //เลขที่ใบแจ้งหนี้
                name: "c_code_invoice",
                id:"c_code_invoiceID",
                enableKeyEvents: true,
                listeners: {
                  keyup: function (me, e) {
                    var maxlength = 255;
                    if (me.getValue().length >= maxlength) {
                      var newval = me.getValue().substring(0, maxlength);
                      me.setValue(newval);
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
                    store: Ext.dc_creditor_po,
                    anchor: "100%",
                    // fieldLabel: "จ่ายให้",
                    valueField: "id",
                    displayField: "c_name",
                    hiddenName: "dc_creditor_id",
                    name: "dc_creditor_name",
                    id: "dc_creditor_po_idID",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    submitValue: true,
                    listeners: {
                      afterrender: function () {
                        this.fn = function () {};
                      },
                      change: function (combo, newValue) {
                        this.fn();
                        var record = this.getStore().getAt(this.getStore().findExact("id", newValue));
                        if (record) {
                          var po_creditor = record.data.po_creditor_id > 0 ? record.data.po_creditor_id : record.data.c_name;
                          Ext.getCmp("po_creditor_id").setValue(po_creditor);

                          var f_id = Ext.isEmpty(Ext.getCmp("dc_creditor_transfer_id").getValue());
                          if (f_id) {
                            Ext.getCmp("dc_creditor_transfer_id").setValue(this.getValue());
                            // Ext.getCmp("c_tax_number_imp").setValue(record.data.c_tax_number_imp);
                            Ext.dc_bank_acc_creditor.load({
                              params: { dc_creditor_id: this.getValue() },
                              callback: function (recordx, operation, success) {
                                if (Ext.dc_bank_acc_creditor.totalLength > 1) {
                                  Ext.getCmp("dc_bank_acc_creditor_id").setValue(Ext.dc_bank_acc_creditor.getAt(1).data.id);
                                } else {
                                  Ext.getCmp("dc_bank_acc_creditor_id").setValue(0);
                                }
                              },
                            });
                          }
                          // Ext.getCmp("dc_tax_customer_id").setValue(record.data.dc_tax_customer_id > 0 ? record.data.dc_tax_customer_id : null);
                          creditor_taxdata_load(this.getValue());
                        }
                      },
                      select: function (combo, record, index) {
                        var po_creditor = record.data.po_creditor_id > 0 ? record.data.po_creditor_id : record.data.c_name;
                        if (this.getValue() > 0) {
                          creditor_taxdata_load(this.getValue());
                        }
                        Ext.getCmp("po_creditor_id").setValue(po_creditor);

                        var f_id = Ext.isEmpty(Ext.getCmp("dc_creditor_transfer_id").getValue());
                        if (f_id) {
                          Ext.getCmp("dc_creditor_transfer_id").setValue(this.getValue());
                          // Ext.getCmp("c_tax_number_imp").setValue(record.data.c_tax_number_imp);
                          Ext.getCmp("po_creditor_transfer_id").setValue(po_creditor);
                          Ext.dc_bank_acc_creditor.load({
                            params: { dc_creditor_id: this.getValue() },
                            callback: function (recordx, operation, success) {
                              if (Ext.dc_bank_acc_creditor.totalLength > 1) {
                                Ext.getCmp("dc_bank_acc_creditor_id").setValue(Ext.dc_bank_acc_creditor.getAt(1).data.id);
                              } else {
                                Ext.getCmp("dc_bank_acc_creditor_id").setValue(0);
                              }
                            },
                          });
                        }
                        // Ext.getCmp("dc_tax_customer_id").setValue(record.data.dc_tax_customer_id > 0 ? record.data.dc_tax_customer_id : null);
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
                    handler: function () {
                      edit_creditor_datatax(Ext.getCmp("dc_creditor_po_idID"));
                    },
                  },
                ],
              },
              {
                xtype: "textarea",
                fieldLabel: "ข้อมูลทางภาษี",
                anchor: "100%",
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
                store: Ext.dc_creditor_po_transfer,
                anchor: "100%",
                fieldLabel: "โดยมอบให้",
                valueField: "id",
                displayField: "c_name",
                name: "dc_creditor_po_transfer_name",
                hiddenName: "dc_creditor_transfer_id",
                id: "dc_creditor_transfer_id",
                triggerAction: "all",
                forceSelection: true,
                selectOnFocus: true,
                typeAhead: false,
                emptyText: "กรุณาเลือก...",
                listeners: {
                  afterrender: function () {
                    this.fn = function () {};
                  },
                  resize: function (win, width, height) {
                    Ext.getCmp("dc_creditor_po_idID").setWidth(width - 105.5);
                  },
                  change: function (combo, newValue) {
                    this.fn();
                    var record = this.getStore().getAt(this.getStore().findExact("id", newValue));
                    if (record) {
                      var po_creditor = record.data.po_creditor_id > 0 ? record.data.po_creditor_id : record.data.c_name;
                      Ext.getCmp("po_creditor_transfer_id").setValue(po_creditor);
                      Ext.getCmp("c_tax_number_imp").setValue(record.data.c_tax_number_imp);
                      Ext.dc_bank_acc_creditor.load({
                        params: { dc_creditor_id: this.getValue() },
                        callback: function (recordx, operation, success) {
                          if (Ext.dc_bank_acc_creditor.totalLength > 1) {
                            Ext.getCmp("dc_bank_acc_creditor_id").setValue(Ext.dc_bank_acc_creditor.getAt(1).data.id);
                          } else {
                            Ext.getCmp("dc_bank_acc_creditor_id").setValue(0);
                          }
                        },
                      });
                    } else {
                      Ext.dc_bank_acc_creditor.load();
                      Ext.getCmp("c_tax_number_imp").setValue("");
                      Ext.getCmp("dc_bank_acc_creditor_id").setValue(0);
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
                  select: function (combo, record, index) {
                    var po_creditor = record.data.po_creditor_id > 0 ? record.data.po_creditor_id : record.data.c_name;
                    Ext.getCmp("po_creditor_transfer_id").setValue(po_creditor);
                    // Ext.getCmp("c_tax_number_imp").setValue(record.data.c_tax_number_imp);
                    Ext.dc_bank_acc_creditor.load({
                      params: { dc_creditor_id: this.getValue() },
                      callback: function (recordx, operation, success) {
                        if (Ext.dc_bank_acc_creditor.totalLength > 1) {
                          Ext.getCmp("dc_bank_acc_creditor_id").setValue(Ext.dc_bank_acc_creditor.getAt(1).data.id);
                        } else {
                          Ext.getCmp("dc_bank_acc_creditor_id").setValue(0);
                        }
                      },
                    });
                  },
                },
              }),
              // {
              //   xtype: "textfield",
              //   anchor: "100%",
              //   fieldLabel: "เลขที่ประจำตัวผู้เสียภาษี",
              //   id: "c_tax_number_imp",
              //   name: "c_tax_number_imp",
              //   enableKeyEvents: true,
              //   listeners: {
              //     keyup: function (me, e) {
              //       var maxlength = 255;
              //       if (me.getValue().length >= maxlength) {
              //         var newval = me.getValue().substring(0, maxlength);
              //         me.setValue(newval);
              //       }
              //     },
              //   },
              // },
              new Ext.form.ComboBox({
                mode: "local",
                store: Ext.dc_bank_acc_creditor,
                fieldLabel: "บัญชีธนาคาร",
                anchor: "100%",
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
                emptyText: "กรุณาเลือกบัญชีธนาคาร...",
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
              // new Ext.form.ComboBox({
              //   mode: "local",
              //   store: Ext.dc_tax_customer,
              //   fieldLabel: "ประเภทกิจการทางภาษี",
              //   anchor: "100%",
              //   submitValue: true,
              //   name: "dc_tax_customerTxt",
              //   hiddenName: "dc_tax_customer_id",
              //   id: "dc_tax_customer_id",
              //   valueField: "id",
              //   displayField: "c_name",
              //   triggerAction: "all",
              //   forceSelection: true,
              //   selectOnFocus: true,
              //   typeAhead: false,
              //   emptyText: "กรุณาเลือกประเภทกิจการทางภาษี...",
              //   listeners: {
              //     afterrender: function () {
              //       this.fn = function () {};
              //     },
              //     Change: function () {
              //       this.fn();
              //     },
              //     beforequery: function (q) {
              //       if (q.query) {
              //         var length = q.query.length;
              //         q.query = new RegExp(Ext.escapeRe(q.query));
              //         q.query.length = length;
              //       }
              //     },
              //     blur: function () {
              //       this.getStore().clearFilter();
              //     },
              //   },
              // }),
              { xtype: "container", height: 15 },
              {
                xtype: "fileuploadfield",
                id: "upload_pdf1",
                anchor: "100%",
                emptyText: "เลือกไฟล์ (.pdf)",
                fieldLabel: "เอกสารใบเบิก (PDF)",
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
                  afterrender: function () {
                    if (Ext.selectRow == null) {
                    } else {
                      if (Ext.selectRow.data.pdf_hdr !== undefined) {
                        // Ext.getCmp("upload_pdf1").hide();
                      }
                    }
                  },
                },
              },
              {
                xtype: "fileuploadfield",
                id: "upload_pdf2",
                anchor: "100%",
                emptyText: "เลือกไฟล์ (.pdf)",
                fieldLabel: "เอกสารประกอบใบเบิก (PDF)",
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
                  afterrender: function () {
                    if (Ext.selectRow == null) {
                      // Ext.getCmp("upload_pdf2").hide();
                    } else {
                      if (Ext.selectRow.data.pdf_hdr != undefined) {
                        // Ext.getCmp("upload_pdf2").hide();
                      }
                    }
                  },
                },
              },
              {
                xtype: "hidden",
                name: "isUpload",
                id: "isUploadID",
            },
              {
                xtype: "button",
                id: "btn_pdf1",
                width: 200,
                iconCls: "icon-pdf",
                fieldLabel: "เอกสารใบเบิก (PDF)",
                text: "เอกสารใบเบิก",
                handler: function () {
                  if (Ext.i_is_url_pdf_hdr == 0) {
                    Po_OpenPdf(Ext.pdf_hdr, document.getElementsByName("c_code_ref")[0].value);
                    // window.open(Ext.part_file_pdf + Ext.pdf_hdr + "?pdf=" + Math.floor(Math.random() * 100000), "_blank");
                  } else if (Ext.i_is_url_pdf_hdr == 1) {
                    window.open(Ext.pdf_hdr);
                  }
                },
                listeners: {
                  afterrender: function () {
                    // if (Ext.selectRow == null) {
                    //   Ext.getCmp("btn_pdf1").hide();
                    // } else {
                    //   if (Ext.selectRow.data.pdf_hdr == null) {
                    //     Ext.getCmp("btn_pdf1").hide();
                    //   } else {
                    //     Ext.getCmp("upload_pdf1").hide();
                    //   }
                    // }
                  },
                },
              },
              {
                xtype: "button",
                id: "btn_pdf2",
                width: 200,
                iconCls: "icon-pdf",
                fieldLabel: "เอกสารประกอบใบเบิก (PDF)",
                text: "เอกสารประกอบใบเบิก",
                handler: function () {
                  if (Ext.i_is_url_pdf_dtl == 0) {
                    Po_OpenPdf(Ext.pdf_dtl, document.getElementsByName("c_code_ref")[0].value);
                    // window.open(Ext.part_file_pdf + Ext.pdf_dtl + "?pdf=" + Math.floor(Math.random() * 100000), "_blank");
                  } else if (Ext.i_is_url_pdf_pdf == 1) {
                    window.open(Ext.pdf_dtl);
                  }
                },
                listeners: {
                  afterrender: function () {
                    // if (Ext.selectRow == null) {
                    //   Ext.getCmp("btn_pdf2").hide();
                    // } else {
                    //   if (Ext.selectRow.data.pdf_hdr == null) {
                    //     Ext.getCmp("btn_pdf2").hide();
                    //   } else {
                    //     Ext.getCmp("upload_pdf2").hide();
                    //   }
                    // }
                  },
                },
              },
              {
                xtype: "checkboxgroup",
                fieldLabel: "",
                name: "i_edit_pdf",
                id: "i_edit_pdfID",
                columns: 1,
                items: [
                  {
                    name: "i_edit_pdfs1",
                    id: "i_edit_pdfIDs1",
                    boxLabel: "แก้ไขเอกสาร",
                    inputValue: 1,
                  },
                ],
                listeners: {
                  afterrender: function () {
                    if (Ext.selectRow == null) {
                      Ext.getCmp("i_edit_pdfID").hide();
                    } else {
                      if (Ext.selectRow.data.pdf_hdr == undefined) {
                        Ext.getCmp("i_edit_pdfID").hide();
                      }
                    }
                  },
                  change: function (combo, newValue) {
                    if (Ext.getCmp("i_edit_pdfIDs1").getValue() == true) {
                      Ext.getCmp("upload_pdf1").show();
                      Ext.getCmp("upload_pdf2").show();
                      Ext.getCmp("btn_pdf1").hide();
                      Ext.getCmp("btn_pdf2").hide();
                      var width = Ext.getCmp("dc_creditor_transfer_id").lastSize.width;
                      Ext.getCmp("upload_pdf1").setWidth(width - 0.5);
                      Ext.getCmp("upload_pdf2").setWidth(width - 0.5);
                    } else {
                      Ext.getCmp("upload_pdf1").hide();
                      Ext.getCmp("upload_pdf2").hide();
                      Ext.getCmp("btn_pdf1").show();
                      Ext.getCmp("btn_pdf2").show();
                    }
                  },
                },
              },
              // { xtype: "container", height: 20 },
              /***** EditorGridPanel *****/
              new Ext.grid.EditorGridPanel({
                region: "center",
                layout: "fit",
                // title: "รายการบัญชี",
                hidden: true,
                id: "gridAcc",
                height: 200,
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
                  afterrender: function () {
                    Ext.getCmp("gridAcc").on("cellclick", cellClick_gridAcc, this);
                  },
                },
                tbar: [
                  {
                    text: "โหลดผังบัญชีตามรายการย่อย",
                    iconCls: "icon-refresh",
                    handler: function (grid, rowIndex, colIndex) {
                      var msg = "";
                      var bg_expense_id = Ext.getCmp("bg_expense_id").getValue();
                      if (bg_expense_id) {
                        Ext.dc_acc_expense.load({
                          params: {
                            bg_expense_id: Ext.getCmp("bg_expense_id").getValue(),
                          },
                          callback: function (records, operation, success) {
                            if (Ext.dc_acc_expense.data.length) {
                              Ext.example.msg("Success", "โหลดข้อมูลผังบัญชีสำเร็จ", 1);
                              $(this).next("text copied");
                              setTimeout(function () {
                                $(this).next().remove();
                              }, 2000);
                            } else {
                              msg += "<span style='white-space: nowrap;'>ไม่มีข้อมูลผังบัญชีในรายการย่อย</span><br>";
                              Ext.MessageBox.alert("แจ้งเตือน", msg);
                            }
                          },
                        });
                      } else {
                        msg += "<span style='white-space: nowrap;'>- กรุณาระบุรายการย่อย</span><br>";
                        Ext.MessageBox.alert("แจ้งเตือน", msg);
                      }
                    },
                  },
                  { xtype: "tbfill" },
                  {
                    text: "เพิ่มข้อมูลรายการบัญชี",
                    iconCls: "icon-add",
                    handler: function (grid, rowIndex, colIndex) {
                      let myNewRecord = new po_working_begin_item_Record({
                        id: "",
                        dc_acc_id: "",
                        f_inv: "",
                        f_inv: "",
                        f_inv: "",
                        c_comment: "",
                      });
                      // Ext.po_working_begin_item.insert(0, myNewRecord);
                      Ext.po_working_begin_item.add(myNewRecord);
                    },
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
                    id: "dc_acc_id",
                    header: "ชื่อผังบัญชี",
                    sortable: false,
                    width: 250,
                    align: "center",
                    dataIndex: "dc_acc_id",
                    editor: new Ext.form.ComboBox({
                      mode: "local",
                      id: "editor_dc_acc_id",
                      store: Ext.dc_acc_expense,
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
                        let name = getStoreItems(Ext.dc_acc_expense, value, "c_name");
                        return name;
                      } else {
                        metaData.attr = "style='text-align: center; color:red;'";
                        return "-";
                      }
                    },
                  },
                  {
                    header: "จำนวนเงิน",
                    sortable: false,
                    align: "center",
                    dataIndex: "f_inv",
                    width: 110,
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
                    header: "ภาษีมูลค่าเพิ่ม",
                    sortable: false,
                    align: "center",
                    dataIndex: "f_vat",
                    width: 110,
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
                    header: "จำนวนเงิน + ภาษีมูลค่าเพิ่ม",
                    sortable: false,
                    align: "center",
                    dataIndex: "f_inv_vat",
                    width: 110,
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
                autoExpandColumn: "dc_acc_id",
                // bbar: Ext.pagingBar,
              }),
              /***** EditorGridPanel (END) *****/
              { xtype: "container", height: 40 },
             /* {
                xtype: "radiogroup",
                columns: [180],
                fieldLabel: "โหมดการบันทึก",
                id: "",
                listeners: {
                  afterrender: function () {},
                },
                style: {
                  "font-weight": "bold",
                },
                items:
                  statusx === "add"
                    ? [
                        {
                          name: "mode",
                          inputValue: "ADD",
                          checked: true,
                          boxLabel: "เพิ่มรายการใหม่",
                          id: "modesubaddID",
                        },
                      ]
                    : [
                        {
                          name: "mode",
                          checked: true,
                          inputValue: "UPDATE",
                          boxLabel: "อัพเดทรายการ",
                        },
                        {
                          name: "mode",
                          inputValue: "ADD",
                          boxLabel: "เพิ่มรายการใหม่",
                          id: "modesubaddID",
                        },
                        {
                          name: "mode",
                          inputValue: "DELETE",
                          id: "modesubdelID",
                          boxLabel: "ลบรายการ",
                        },
                      ], //radiogroup
              },*/
            ],
          },
          {
            columnWidth: 0.4,
            xtype: "fieldset",
            id: "win-chequeID",
            labelWidth: 150,
            title: "รายละเอียดการขอเบิก",
            defaults: {
              width: "90%",
              border: false,
              validator: function (val) {
                if (!Ext.isEmpty(val)) {
                  return true;
                } else {
                  if (this.hiddenName === "po_emp_id") return true;
                  else return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                }
              },
            },
            // Default config options for child items
            defaultType: "textfield",
            autoHeight: true,
            bodyStyle: Ext.isIE ? "padding:3px 0 3px 10px;" : "padding:3px 3px;",
            border: false,
            style: {
              "margin-left": "5px",
              // when you add custom margin in IE 6...
              "margin-right": Ext.isIE6 ? (Ext.isStrict ? "-4px" : "-5px") : "0", // you have to adjust for it somewhere else
            },
            items: [
              {
                xtype: "textfield",
                fieldLabel: "จำนวนรายการ",
                name: "c_qty",
                id: "c_qtyID",
                style: {
                  //                                                 'labelAlign' : 'right' ,
                  //                                              'font-weight' : 'bold' ,
                  padding: "1px",
                  margin: "1px",
                  "background-color": "#fff",
                  "text-align": "left",
                  width: "100px",
                },
              },
              {
                xtype: "textfield",
                fieldLabel: "จำนวนเงินขอเบิก",
                name: "f_total",
                id: "f_totalID",
                enableKeyEvents: true,
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
                    Ext.getCmp("f_per_inv_vat").setValue(floatRenderer(floatMinus(Ext.getCmp("f_totalID").getValue().replace(/,/g, ""))));
                    if (Ext.getCmp("f_per_vat_rate").getValue() != "") {
                      var f_per_vat = Ext.getCmp("f_per_inv_vat").getValue().replace(/,/g, "") / 1.07 * 0.07;
                      f_per_vat = f_per_vat.toFixed(2);
                      Ext.getCmp("f_per_vat").setValue(floatRenderer(floatMinus(f_per_vat, 2)));
                    }
                    
                    var f_per_inv = Ext.getCmp("f_per_inv_vat").getValue().replace(/,/g, "") - Ext.getCmp("f_per_vat").getValue().replace(/,/g, "");
                    Ext.getCmp("f_per_inv").setValue(floatRenderer(floatMinus(f_per_inv, 2)));

                    if (Ext.getCmp("f_per_tax_personal_rate").getValue() != "") {
                      var f_per_tax_personal = Ext.getCmp("f_per_inv").getValue().replace(/,/g, "") * 0.01;
                      Ext.getCmp("f_per_tax_personal").setValue(floatRenderer(floatMinus(f_per_tax_personal.toFixed(2), 2)));
                    }
                    f_per_pay_sum();
                  },
                },
                style: {
                  labelAlign: "right",
                  "font-weight": "bold",
                  padding: "1px",
                  margin: "1px",
                  color: "blue",
                  "background-color": "#fff",
                  "text-align": "right",
                },
              },
              /*comboAudit,*/
              {
                xtype: "datefield",
                fieldLabel: "วันที่ตรวจรับ",
                name: "d_checking_date",
                id: "d_checking_date",
                readOnly:true,
              },
              comboEmp,
              {
                xtype: "datefield",
                fieldLabel: "วันที่ใบขอเบิก",
                name: "d_doc_date",
                id:"d_doc_date"
              },
              {
                xtype: "radiogroup",
                columns: [180],
                fieldLabel: "โหมดการบันทึก",
                id: "modesubID",
                listeners: {
                    change: function (cb, nv, ov) {
                        this.fnUrl();
                    },
                    beforrender: function () {
                        Ext.url_post = "../po/reg/controller/mnPoWorkingHdrBeginSupplies.php";
                    },
                    afterrender: function () {

                        this.fnUrl = function () {
                            if (this.getValue().inputValue == 'POSTPO') {
                                Ext.Msg.alert('Warning', 'คุณกำลังจะส่งรายการส่งเบิก ? กรุณาอัพโหลดไฟล์เอกสารให้ครบถ้วน');
                                Ext.getCmp('upload_pdf1').show();
                                Ext.getCmp('upload_pdf2').show();
                                var width = Ext.getCmp("dc_creditor_transfer_id").lastSize.width;
                                Ext.getCmp("upload_pdf1").setWidth(width - 0.5);
                                Ext.getCmp("upload_pdf2").setWidth(width - 0.5);
                                Ext.url_post = Ext.session.HOST_NMU + "/po/reg/controller/mnPoWorkingHdrBeginSupplies.php";
                            } else {
                                Ext.getCmp('upload_pdf1').hide();
                                Ext.getCmp('upload_pdf2').hide();
                                Ext.url_post = "../po/reg/controller/mnPoWorkingHdrBeginSupplies.php";
                            }
                            Ext.getCmp(Ext.poFormID).getForm().url = Ext.url_post;
                        }
                        this.fnUrl();
                    },
                },
                style: {
                    "font-weight": "bold",
                },
                items: (statusx === "add" ? [{
                        name: "mode",
                        checked: true,
                        inputValue: "ADD",
                        boxLabel: "เพิ่มรายการเบิก",
                    }] : [
                    {
                        name: "mode",
                        checked: false,
                        inputValue: "POSTPO",
                        boxLabel: "ส่งรายการเบิกฝ่ายคลัง",
                        id: "modesubapostpoID",
                    },
                    {
                        name: "mode",
                        inputValue: "UPDATE",
                        checked: true,
                        boxLabel: "อัพเดทรายการ",
                        id: "modesubaupdateID",
                    },
                    {
                        name: "mode",
                        inputValue: "DISABLED",
                        hidden: false,
                        id: "modesubdisabledID",
                        boxLabel: "ยกเลิกรายการเบิก",
                    },
                    {
                        name: "mode",
                        inputValue: "DELETE",
                        hidden: false,
                        id: "modesubdelID",
                        boxLabel: "ลบรายการ",
                    },
                ]), //radiogroup
            },
              {
                xtype: "radiogroup",
                columns: [80, 70],
                id: "i_enableID",
                hidden : true,
                fieldLabel: "สถานะรายการ",
                items: [
                  {
                    name: "i_enable",
                    id: "i_enable1ID",
                    inputValue: 1,
                    checked: true,
                    boxLabel: "ใช้งาน",
                  },
                  {
                    name: "i_enable",
                    hidden: true,
                    id: "i_enable2ID",
                    inputValue: 2,
                    boxLabel: "ยกเลิก",
                  },
                ],
              },
              {
                xtype: "textarea",
                fieldLabel: "คำอธิบายรายการ",
                name: "c_comment",
                id : "c_commentID",
                validator: function (val) {
                  return true;
                },
                width: 200,
                enableKeyEvents: true,
                listeners: {
                  keyup: function (me, e) {
                    var maxlength = 255;
                    if (me.getValue().length >= maxlength) {
                      var newval = me.getValue().substring(0, maxlength);
                      me.setValue(newval);
                    }
                  },
                },
              },
              { xtype: "container", height: 10 },
              {
                xtype: "container",
                layout: "hbox",
                align: "stretch",
                RemoveHeight: true,
                width: 380,
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
                            name: "f_per_inv",
                            id: "f_per_inv", 
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
                                var f_per_inv_vat = parseFloat(Ext.getCmp("f_per_inv").getValue().replace(/,/g, "")) + parseFloat(Ext.getCmp("f_per_vat").getValue().replace(/,/g, "") - 0);
                                Ext.getCmp("f_per_inv_vat").setValue(floatRenderer(floatMinus(f_per_inv_vat.toFixed(2), 2)));

                                if (Ext.getCmp("f_per_tax_personal_rate").getValue() != "") {
                                  var f_per_tax_personal = Ext.getCmp("f_per_inv").getValue().replace(/,/g, "") * 0.01;
                                  Ext.getCmp("f_per_tax_personal").setValue(floatRenderer(floatMinus(f_per_tax_personal.toFixed(2), 2)));
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
                                  Ext.getCmp("f_per_vat").setReadOnly(false);
                                  Ext.getCmp("f_per_vat").el.setStyle("background", "#fff");

                                  Ext.getCmp("f_per_vat_rate").setValue("7");
                                  var f_per_vat = Ext.getCmp("f_per_inv_vat").getValue().replace(/,/g, "") / 1.07 * 0.07;
                                  f_per_vat = f_per_vat.toFixed(2);
                                  Ext.getCmp("f_per_vat").setValue(floatRenderer(floatMinus(f_per_vat, 2)));

                                  var f_per_inv = Ext.getCmp("f_per_inv_vat").getValue().replace(/,/g, "") - Ext.getCmp("f_per_vat").getValue().replace(/,/g, "");
                                  Ext.getCmp("f_per_inv").setValue(floatRenderer(floatMinus(f_per_inv, 2)));
                                } else {
                                  Ext.getCmp("f_per_vat").setReadOnly(true);
                                  Ext.getCmp("f_per_vat").el.setStyle("background", "#eee");

                                  Ext.getCmp("f_per_vat_rate").setValue("");
                                  Ext.getCmp("f_per_vat").setValue("");

                                  // Ext.getCmp("f_per_inv_vat").setValue(Ext.getCmp("f_totalID").getValue());

                                  var f_per_inv = Ext.getCmp("f_per_inv_vat").getValue().replace(/,/g, "") - Ext.getCmp("f_per_vat").getValue().replace(/,/g, "");
                                  Ext.getCmp("f_per_inv").setValue(floatRenderer(floatMinus(f_per_inv, 2)));
                                }
                                if (Ext.getCmp("f_per_tax_personal_rate").getValue() != "") {
                                  var f_per_tax_personal = Ext.getCmp("f_per_inv").getValue().replace(/,/g, "") * 0.01;
                                  Ext.getCmp("f_per_tax_personal").setValue(floatRenderer(floatMinus(f_per_tax_personal.toFixed(2), 2)));
                                }
                                f_per_pay_sum();
                              },
                              checkchange: function (combo, newValue) {
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
                            name: "f_per_vat",
                            id: "f_per_vat",
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
                                var f_per_inv_vat = parseFloat(Ext.getCmp("f_per_inv").getValue().replace(/,/g, "")) + parseFloat(Ext.getCmp("f_per_vat").getValue().replace(/,/g, ""));
                                Ext.getCmp("f_per_inv_vat").setValue(floatRenderer(floatMinus(f_per_inv_vat.toFixed(2), 2)));
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
                            width: 35,
                            name: "f_per_vat_rate",
                            id: "f_per_vat_rate",
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
                        xtype: "buttongroup", // กองทุนสำรองเลื้ยงชีพ
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
                            name: "f_per_inv_vat",
                            id: "f_per_inv_vat",
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
                                  Ext.getCmp("f_per_tax_personal_rate").setValue("1");
                                  Ext.getCmp("f_per_tax_personal").setReadOnly(false);
                                  Ext.getCmp("f_per_tax_personal").el.setStyle("background", "#fff");
                                  var f_per_tax_personal = Ext.getCmp("f_per_inv").getValue().replace(/,/g, "") * 0.01;
                                  Ext.getCmp("f_per_tax_personal").setValue(floatRenderer(floatMinus(f_per_tax_personal.toFixed(2), 2)));
                                  f_per_pay_sum();
                                } else {
                                  Ext.getCmp("f_per_tax_personal").setReadOnly(true);
                                  Ext.getCmp("f_per_tax_personal").el.setStyle("background", "#eee");
                                  Ext.getCmp("f_per_tax_personal_rate").setValue("");
                                  Ext.getCmp("f_per_tax_personal").setValue("");
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
                            name: "f_per_tax_personal",
                            id: "f_per_tax_personal",
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
                            name: "f_per_tax_personal_rate",
                            id: "f_per_tax_personal_rate",
                            width: 35,
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
                            name: "f_per_social_security",
                            id: "f_per_social_security",
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
                            name: "f_per_prov_fund",
                            id: "f_per_prov_fund",
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
                            name: "f_per_fine",
                            id: "f_per_fine",
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
                            name: "f_per_warranty",
                            id: "f_per_warranty",
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
                            name: "f_per_other",
                            id: "f_per_other",
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
                            name: "f_per_pay",
                            id: "f_per_pay",
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
        ],
        buttons: [
          {
            text: "ทำรายการ",
            id: "buSaveSubID",
            iconCls: "icon-save",
            listeners: {
              afterrender: function () {},
            },
            handler: function () {
              let msg = "";
              // if (["", null, undefined].includes(Ext.getCmp("dc_tax_customer_id").getValue())) {
              //   msg += "<span style='white-space: nowrap;'>- กรุณาระบุ ประเภทกิจการทางภาษี</span><br>";
              // }
              // if (Ext.getCmp("c_name_tax_income").getValue() != "") {
              //   if (!Ext.getCmp("Form-edit_creditor_datatax").getForm().isValid()) {
              //     msg += "<span style='white-space: nowrap;'>- กรุณาระบุข้อมูลให้ถูกต้อง</span>";
              //   }
              //   if (["", null, undefined].includes(Ext.getCmp("c_tax_number_imp").getValue())) {
              //     msg += "<span style='white-space: nowrap;'>- กรุณากรอก เลขประจําตัวผู้เสียภาษี</span><br>";
              //   }
              //   if (["", null, undefined].includes(Ext.getCmp("dc_title_id").getValue())) {
              //     msg += "<span style='white-space: nowrap;'>- กรุณาระบุ คำนำหน้า</span><br>";
              //   }
              //   if (["", null, undefined].includes(Ext.getCmp("tax_c_name").getValue())) {
              //     msg += "<span style='white-space: nowrap;'>- กรุณากรอก ชื่อ</span><br>";
              //   }
              //   if (["", null, undefined].includes(Ext.getCmp("tax_c_house_no").getValue())) {
              //     msg += "<span style='white-space: nowrap;'>- กรุณากรอก เลขที่</span><br>";
              //   }
              //   if (["", null, undefined].includes(Ext.getCmp("dc_province_id").getValue())) {
              //     msg += "<span style='white-space: nowrap;'>- กรุณาระบุ จังหวัด</span><br>";
              //   }
              //   if (["", null, undefined].includes(Ext.getCmp("dc_district_id").getValue())) {
              //     msg += "<span style='white-space: nowrap;'>- กรุณาระบุ เขต/อำเภอ</span><br>";
              //   }
                if (["", null, undefined,0].includes(Ext.getCmp("po_emp_id").getValue())) {
                msg += "<span style='white-space: nowrap;'>- กรุณาระบุ ผู้ดำเนินรายการ</span><br>";
                }
                if (Ext.getCmp("i_budget_yearID").getValue()  !=  Ext.bgYear ) {
                  msg += "<span style='white-space: nowrap;'>- ปีงบประมาณ ไม่ตรงกับปีงบประมาณปัจจุบัน</span><br>";
                }
                if (Ext.getCmp("c_overlap").getValue() != '' && (Ext.getCmp("i_budget_year_overlap").getValue() ==  Ext.bgYear)) {
                    msg += "<span style='white-space: nowrap;'>- รายการนี้เป็นงบประมาณกันเหลื่อม ไม่สามารถใช้ปีปัจจุบันได้</span><br>";
                }
                if (["", null, undefined,0].includes(Ext.getCmp("d_checking_date").getValue())) {
                  msg += "<span style='white-space: nowrap;'>- กรุณาระบุ วันที่ตรวจรับ</span><br>";
                }
              //   // po_creditor_id
                if (["", null, undefined,0].includes(Ext.getCmp("po_creditor_id").getValue())) {
                  msg += "<span style='white-space: nowrap;'>- กรุณาระบุ จ่ายให้</span><br>";
                }
                if (["", null, undefined,0].includes(Ext.getCmp("po_creditor_transfer_id").getValue())) {
                  msg += "<span style='white-space: nowrap;'>- กรุณาระบุ โดยมอบให้</span><br>";
                }
                if (["", null, undefined,0].includes(Ext.getCmp("po_creditor_transfer_id").getValue())) {
                //   msg += "<span style='white-space: nowrap;'>- กรุณาระบุ บัญชีธนาคาร</span><br>";
                // }
              }
              if (Ext.getCmp("f_totalID").getValue() != Ext.getCmp("f_per_inv_vat").getValue()) {
                msg += "<span style='white-space: nowrap;'>- จำนวนเงินขอเบิกไม่ถูกต้อง</span><br>";
              }
                if (msg == "") {
                  saveHdr();
                } else {
                  Ext.Msg.alert("แจ้งเตือน", msg);
                }
              }
            // }, //haddler
          },
          {
            text: Ext.GLOBAL_BU_BACK_TH,
            handler: function () {
              Ext.getCmp("winChequeID").hide();
              Ext.getCmp("winChequeID").destroy();
            },
          },
        ],
      }),
      listeners: {
        afterrender: function () {},
      },
    });
  };
  var MenuButton = function () {
    // show Menu Edit Grid
    var editm = Ext.menuEditGrid;
    var menu = new Ext.menu.Menu({
      id: "mainMenu",
      border: false,
      style: {
        overflow: "visible",
      },
      // items: [
      //   {
      //     text: "ประเภทข้อมูล",
      //     icon: "../images/icons/application_form_magnify.png",
      //     menu: {
      //       items: [
      //         '<b class="menu-title">  เลือกประเภทข้อมูล </b>',
      //         {
      //           text: " เลือกประเภทข้อมูลบันทึกจากระบบเท่านั้น",
      //           checked: false,
      //           id: "keyDatat1",
      //           uri: 1,
      //           group: "theme",
      //           checkHandler: onLocationCheck,
      //         },
      //         {
      //           text: " เลือกประเภทนำเข้าจากการ import Excel เท่านั้น",
      //           checked: false,
      //           uri: 0,
      //           id: "keyDatat2",
      //           group: "theme",
      //           checkHandler: onLocationCheck,
      //         },
      //         {
      //           text: " เลือกประเภทข้อมูลที่ทั้งหมด",
      //           checked: true,
      //           id: "keyDatat3",
      //           uri: null,
      //           group: "theme",
      //           checkHandler: onLocationCheck,
      //         },
      //       ],
      //     },
      //   },
      // ],
    });
    var tb = new Ext.Toolbar({
      text: " รายการเมนู ",
      border: false,
      icon: "../images/icons/text_list_bullets.png",
      iconCls: "menu",
      menu: menu,
    });
    tb.add({
      text: " รายการเมนู ",
      icon: "../images/icons/text_list_bullets.png",
      iconCls: "bmenu",
      border: false,
      bodyStyle: "padding:0px 0px 0px 0px !important;",
      menu: menu,
    });
    menu.addSeparator();
    // menu
    //   .add({
    //     text: "เพิ่มข้อมูล",
    //     icon: "../images/icons/add.png",
    //   })
    //   .on(
    //     "click",
    //     (click = function () {
    //       Ext.loadStore("add", false);
    //     })
    //   );
    menu
      .add({
        text: "จัดการข้อมูล View/Copy/Edit/Delete",
        icon: "../images/icons/application_edit.png",
      })
      .on(
        "click",
        (click = function () {
          Ext.loadStore("edit", true);
        })
      );

    if (editm === true) {
      menu
        .add({
          text: "แก้ไขข้อมูลผ่าน Data Grid",
          icon: "../images/icons/application_form_add.png",
        })
        .on(
          "click",
          (click = function () {
            Ext.gridMainfn(true);
          })
        );
      menu
        .add({
          text: "ยกเลิกการแก้ไขฝ่าน Data Grid",
          icon: "../images/icons/application_form_delete.png",
        })
        .on(
          "click",
          (click = function () {
            Ext.gridMainfn(false);
          })
        );
    }
    tb.doLayout();
    return tb;
  };

  Ext.gridMainfn = function (editAbled) {
    if (!Ext.isEmpty(Ext.getCmp("tabpanel1"))) Ext.getCmp("contenterCenter").remove(Ext.getCmp("tabpanel1"), true) || {};

    var gridMains = new gridMain();
    Ext.getCmp("contenterCenter").add(gridMains);
    Ext.getCmp("contenterCenter").setActiveTab(gridMains);
    Ext.getCmp("tabpanel1").on("beforeedit", function () {
      return editAbled;
    });
    if (editAbled) Ext.getCmp("buSaveGridID").show();
    else Ext.getCmp("buSaveGridID").hide();

    return gridMains;
  };
  var onLocationCheck = function (item) {
    var i = item.uri;
    Ext.History.add(i);
    var storeBg = Ext.storeDtl;
    storeBg.setBaseParam("keyData", i);
    storeBg.load();
  };

  Ext.extend(
    (searchGrid = function () {
      var mnController = "reg/controller/mnPoWorkingHdrBegin.php";
      //classOverride
      searchGrid.superclass.constructor.call(this, {
        initComponent: function () {
          searchGrid.superclass.initComponent.call(this);
          this.fn(this);
          /*console.log('Loading...');*/
        },
        listeners: {
          afterrender: function (obj, eOpts) {
            /*console.log('Load Finish');*/
          },
        },
        fn: function () {},
        id: "frm-grid-searchID",
        frame: true,
        bodyStyle: "padding:1px",
        autoHeight: true,
        border: false,
        width: 460,
        url: mnController,
        labelWidth: 80,
        defaults: {
          anchor: "0",
        },
        items: [
          {
            xtype: "hidden",
            name: "mode",
            value: "saveDataGrid",
          },
          {
            xtype: "hidden",
            name: "gridMain",
            id: "gridMainID",
          },
          menu ? MenuButton() : [],
          {
            xtype: "compositefield",
            fieldLabel: "คำที่ค้นหา",
            msgTarget: "side",
            anchor: "-5",
            defaults: {
              flex: 1,
            },
            items: [
              {
                xtype: "textfield",
                id: "val-ID",
                name: "value",
                width: 130,
              },
              {
                xtype: "combo",
                id: "filter-ID",
                store: new Ext.data.SimpleStore({
                  fields: ["id", "c_name"],
                  data: [
                    ["c_code_ref", "เลขที่ขอเบิก"],
                    ["c_name", "รายการที่ขอเบิก"],
                    ["po_creditor_name", "จ่ายให้"],
                    ["c_invoice", "เลขที่ใบแจ้งหนี้"],
                    ["c_contract_code", "เลขที่สัญญา"],


                  ],
                }),
                value: "c_code_ref",
                valueField: "id",
                width: 180,
                displayField: "c_name",
                submitValue: true,
                hiddenName: "filter",
                mode: "local",
                triggerAction: "all",
                forceSelection: true,
                selectOnFocus: true,
                editable: false,
                listeners: {
                  select: function (combo, record, index) {
                    var newValue = record.data.id;
                  },
                },
              },
            ],
          },
          {
            xtype: "buttongroup",
            frame: false,
            items: [
              // { xtype: "label", text: "ผู้ทำรายการ : " },
              // { xtype: "tbspacer", width: 25 },
              // {
              //   xtype: "combo",
              //   id: "userid-ID",
              //   // fieldLabel: "ผู้ทำรายการ", //Ext.po_user
              //   store: Ext.po_user,
              //   valueField: "id",
              //   width: 250,
              //   displayField: "c_name",
              //   submitValue: true,
              //   hiddenName: "filter",
              //   mode: "local",
              //   triggerAction: "all",
              //   forceSelection: true,
              //   selectOnFocus: true,
              //   editable: false,
              //   listeners: {
              //     select: function (combo, record, index) {
              //       var newValue = record.data.id;
              //     },
              //     afterrender: function () {
              //       this.store.reload({
              //         callback: function (record, operation, success) {
              //           if (success) {
              //             Ext.getCmp("userid-ID").setValue(0);
              //           }
              //         },
              //       });
              //     },
              //   },
              // },
              { xtype: "tbspacer", width: 10 },
              new Ext.form.Checkbox({
                id: "i_pdf",
                boxLabel: "ที่มีเอกสาร PDF",
                inputValue: 1,
                hidden: true,
                checked: false,
                listeners: {
                  check: function (combo, newValue) {
                    search();
                  },
                },
              }),
            ],
          },
        ],
        buttonAlign: "left",
        buttons: [
          {
            text: "บันทึกรายการ",
            id: "buSaveGridID",
            iconCls: "icon-save",
            listeners: {
              afterrender: function () {
                this.hide();
              },
            },
            handler: function () {
              var formSubmit = function () {
                form.submit({
                  waitMsg: "Saving Data...",
                  success: function (form, action) {
                    if (action.result.success == "Success" || action.result.success == true) {
                      Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                        Ext.getCmp("tabpanel1").getStore().reload();
                        Ext.getCmp("winChequeID").hide();
                        Ext.getCmp("winChequeID").destroy();
                      });
                    } else {
                      Ext.MessageBox.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + action.result.msg + "</span>");
                    }
                  },
                  failure: function (form, action) {
                    switch (action.failureType) {
                      case Ext.form.Action.CLIENT_INVALID:
                        Ext.Msg.alert("Failure", "Form fields may not be submitted with invalid values");
                        break;
                      case Ext.form.Action.CONNECT_FAILURE:
                        Ext.Msg.alert("Failure", "พลข้อผิดพลาดในการเชื่อต่อเครือข่าย");
                        break;
                      case Ext.form.Action.SERVER_INVALID:
                        Ext.Msg.alert("Failure", action.result.msg);
                    }
                  },
                });
              }; //func submit
              var saveDtl = function (mode) {
                let msg = "";
                let jsonArr = [];
                let sto = Ext.getCmp("tabpanel1").store.data.items;
                sto.forEach(function (v) {
                  jsonArr.push({
                    po_working_dtl_id: v.data.id,
                    d_audit_date: Ext.isEmpty(v.data.d_audit_date) ? null : v.data.d_audit_date.add("Y", -543).dateFormat("Y-m-d"),
                    d_checking_date: Ext.isEmpty(v.data.d_checking_date) ? null : v.data.d_checking_date.add("Y", -543).dateFormat("Y-m-d"),
                    d_approve_date: v.data.d_approve_date.add("Y", -543).dateFormat("Y-m-d"),
                    d_doc_date: v.data.d_doc_date.add("Y", -543).dateFormat("Y-m-d"),
                    d_inv_date: v.data.d_inv_date.add("Y", -543).dateFormat("Y-m-d"),
                  });
                });

                //TODO @ setGridDirty to idCmp
                Ext.getCmp("gridMainID").setValue(JSON.stringify(jsonArr));
                formSubmit(form); //submit grid form
              }; // saveDtl

              var form = Ext.getCmp("frm-grid-searchID").getForm();
              if (form.isValid()) {
                Ext.MessageBox.show({
                  title: "Icon Support",
                  msg: "คุณต้องการที่จะบันทึกข้อมูลใน Data Grid ใช่ใหม ?",
                  buttons: Ext.MessageBox.OKCANCEL,
                  icon: Ext.MessageBox.WARNING,
                  fn: function (btn) {
                    if (btn === "ok") {
                      //TODO @ setGridDirty to idCmp
                      saveDtl();
                    } else {
                      return;
                    }
                  },
                });
              }
            }, //haddler
          },
          {
            xtype: "tbfill",
          },
          {
            text: "ค้นหา",
            id: "buSearchID",
            iconCls: "icon-magnifier",
            handler: function () {
              search();
            },
          },
          {
            text: "เริ่มใหม",
            iconCls: "icon-reset",
            handler: function () {
              Ext.getCmp("frm-grid-searchID").getForm().reset();
            },
          },
        ],
      });
    }),
    Ext.FormPanel,
    {}
  );

  // gridMain
  Ext.extend(
    (gridMain = function () {
      gridMain.superclass.constructor.call(this, {
        region: "center",
        layout: "fit",
        title: Ext.title,
        xtype: "grid",
        id: "tabpanel1",
        border: false,
        stripeRows: true,
        loadMask: true,
        clicksToEdit: 2,
        viewConfig: {
          emptyText: "ไม่มีข้อมูล..",
          deferEmptyText: true,
          getRowClass: function (record, index, rowParams) {
            if (record.data.d_approve_date == "") {
              return "td-cost";
            }
          },
        },
        listeners: {
          viewready: function (g) {
            // g.getSelectionModel().selectRow(0);
          }, // Allow rows to be rendered.
          beforeedit: function (g) {
            // if (g.rowIdx == 0) return false;
          }, // Allow rows to be rendered. console.log(value.format('d-m-Y'));
          afteredit: function (g) {},
          beforerender: function () {
            this.contextMenu = new Ext.menu.Menu({
              items: [
                // {
                //   text: "เพิ่มข้อมูล",
                //   icon: "../images/icons/add.png",
                //   handler: function (e) {
                //     Ext.loadStore("add", true); // app,data.load
                //   },
                //   scope: this,
                // },
                {
                  text: "จัดการข้อมูล View/Copy/Edit/Delete",
                  icon: "../images/icons/application_edit.png",
                  handler: function (e) {
                    Ext.loadStore("edit", true); // app,data.load
                  },
                  scope: this,
                },
                {
                  text: "คัดลอกข้อมูลใน copy data in cell grid",
                  icon: "../images/icons/page_copy.png",
                  handler: function (e) {
                    //field
                    var arrDataCopy = ["c_detail", "c_code_ref", "po_creditor_name"];
                    var rowx = Ext.selectRow;

                    if (!Ext.isEmpty(rowx) && !Ext.isEmpty(arrDataCopy))
                      //if Ctlr+c
                      CopyToClipboard(rowx, arrDataCopy);
                  },
                  scope: this,
                },
              ],
            });
          },
          afterrender: function () {
            this.on("cellclick", cellClick, this); //cellClick
            this.on(
              "rowcontextmenu",
              function (grid, rowIndex, e) {
                e.stopEvent();
                grid.getSelectionModel().selectRow(rowIndex);
                Ext.selectRow = grid.store.getAt(rowIndex);
                this.contextMenu.showAt(e.getXY());
              },
              this
            );
            // //  Ctlr+c
            // new Ext.KeyMap(Ext.get("tabpanel1"), [
            //   {
            //     key: "c",
            //     ctrl: true,
            //     scope: this,
            //     fn: function (e, ele) {
            //       ele.preventDefault();
            //       var arrDataCopy = ["c_detail", "c_code_ref", "po_creditor_name"];
            //       var rowx = Ext.selectRow;
            //       if (!Ext.isEmpty(rowx) && !Ext.isEmpty(arrDataCopy))
            //         //if Ctlr+c
            //         CopyToClipboard(rowx, arrDataCopy);
            //     },
            //   },
            // ]);
            // //end key
          },
        },
        store: Ext.storeDtl,
        sm: new Ext.grid.RowSelectionModel({
          singleSelect: true,
          // listeners: {
          //   rowselect: function (sm, row, rec) {
          //     Ext.selectRow = rec; //handle row in grid
          //   },
          // },
        }),
        tbar: [new searchGrid()],
        columns: [
          new Ext.grid.RowNumberer({
            header: "ที่",
            dataIndex: "id",
            id: "idID",
            width: 30,
            renderer: function (value, metaData, record, row, col, store, gridView) {
              metaData.attr = "style='cursor:pointer; text-align:center;';";
              return record.get("no");
            },
          }),
          {
            header: "เลขที่ใบขอเบิก",
            sortable: false,
            align: "left",
            dataIndex: "id",
            hidden: true,
          },
          {
            header: "เลขที่ใบขอเบิก",
            sortable: false,
            align: "left",
            dataIndex: "c_code_ref",
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              // metaData.attr = "style='color:red;'";
              return value ? value : "-";
            },
          },
          {
            header: "เลขที่สัญญา",
            sortable: false,
            align: "center",
            width: 120,
            dataIndex: "c_contract_code", 
          },
          {
            header: "งวดที่",
            sortable: false,
            align: "center",
            width: 100,
            dataIndex: "i_period", 
          },
          {
            header: "เอกสารใบเบิก",
            sortable: false,
            width: 105,
            align: "center",
            dataIndex: "c_file_pdf_hdr",
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              // var BtnText = "<img src='../images/icons/page_white_acrobat.png' style='margin-right:1px;' /><div><spen style='font-size:11px'>&nbspเอกสารใบเบิก</spen>";
              var BtnText = "<img src='../images/icons/page_white_acrobat.png' style='margin-right:1px;' /><div><spen style='font-size:11px'>&nbspเอกสารใบเบิก</spen>";
              if (record.data.c_file_pdf_hdr == 0) {
                return "-";
              } else {
                return '<button style="display: flex" onclick="Po_OpenPdf(\''
                + value + "', '" + record.data.c_code_ref + '\')" type="button">' + BtnText + "</button>";
              } 
            },
          },
          {
            header: "เอกสารประกอบใบเบิก",
            sortable: false,
            width: 140,
            align: "center",
            dataIndex: "c_file_pdf_dtl",
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              var BtnText = "<img src='../images/icons/page_white_acrobat.png' style='margin-right:1px;' /><div><spen style='font-size:11px'>&nbspเอกสารประกอบใบเบิก</spen>";
              if (record.data.c_file_pdf_dtl == 0) {
                return "-";
              } else {
                return '<button style="display: flex" onclick="Po_OpenPdf(\'' + value + "', '" + record.data.c_code_ref + '\')" type="button">' + BtnText + "</button>";
                // return '<button style="display: flex" onclick="window.open(\'' + Ext.part_file_pdf + value + "?pdf=" + Math.floor(Math.random() * 100000) + '\')" type="button">' + BtnText + "</button>";
              } 
              // else if (record.data.i_is_url_pdf_dtl == 1) {
              //   return '<button style="display: flex" onclick="window.open(\'' + value + '\')" type="button">' + BtnText + "</button>";
              // }
            },
          },
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
            header: "วันที่ ฝ่ายคลัง รับใบขอเบิก",
            sortable: false,
            align: "center",
            hidden: true,
            width: 150,
            dataIndex: "d_inv_date",
            editor: new Ext.form.DateField({}),
            renderer: function (val, metaData, record, rowIndex, colIndex, store) {
              return shortThaiDate(val);
            },
          },
          {
            header: "ปีงบประมาณ",
            sortable: false,
            align: "center",
            dataIndex: "i_budget_year",
            width: 90,
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (value !== "" && value !== undefined) {
                return parseInt(value+543);
              } else {
                metaData.attr = "style='color:red;'";
                return "-";
              }
            },
          },
          {
            header: "สถานะปัจจุบัน",
            sortable: true,
            align: "left",
            dataIndex: "c_status_last",
            renderer: function (value, metaData, record, row, col, store, gridView) {
              // alert(record.get('po_working_status'));
              if ((record.get('po_working_status') == 2) && (record.get('enable_working') == 1 )) {
                  return  "<span style='padding-left:3px;color:blue;'>คลังรับเรื่องแล้ว</span>";
              } else if ((record.get('po_working_status') == 3)&& (record.get('enable_working') == 1 )) {
                  return  "<span style='padding-left:3px;color:red;'>ทักท้วง</span>";
              } else if ((record.get('po_working_status') == 4) &&  (record.get('enable_working') == 1 )) {
                  return  "<span style='padding-left:3px;color:green;'>อนุมัติแล้ว</span>";
              } else if ((record.get('po_working_status') == 1) && (record.get('enable_working') == 1 )) {
                  return  "<span style='padding-left:3px;color:Orange;'>ส่งเบิกแล้ว</span>";
              } else if ((record.get('po_working_status') == 3)  && (record.get('enable_working') == 2 ) && (record.get('working_code')  != null ) ) {
                  return  "<span style='padding-left:3px;color:red;'>ยกเลิกใบเก่าใช้ใบใหม่</span>";
              } else if ((record.get('po_working_status') == 3)  && (record.get('enable_working') == 2 ) && (record.get('working_code') == null ) ) {
                  return  "<span style='padding-left:3px;color:red;'>ยกเลิกใบเบิก</span>";
              } else if ((record.get('po_working_status') == 0 )  && (record.get('po_working_hdr_id') > 0 ) ) {
                  return  "<span style='padding-left:3px;color:red;'>เลขใบเบิกมีการเปลี่ยนแปลง</span>";
              } else if ((record.get('po_working_status') == 0 )  && (record.get('po_working_hdr_id') == 0 ) ) {
                  return  "<span style='padding-left:3px;color:red;'>ยังไม่ส่งเบิกคลัง</span>";
              } else {
                  // console.log(record.get('po_working_hdr_id') +'||'+ record.get('po_working_status')+'||' + record.get('enable_working') )
                  return "<span style='padding-left:3px;color:red;'>ติดต่อadmin</span>";
              }
            }, 
          },
          {
            header: "รายการย่อย",
            sortable: false,
            align: "center",
            width: 300,
            hidden: true,
            dataIndex: "bg_expense_idTxt", 
          },
          {
            header: "หน่วยงาน",
            sortable: false,
            hidden: true,
            align: "center",
            dataIndex: "dc_cost_idTxt",
            width: 250,
          },
          {
            header: "แหล่งเงิน",
            sortable: false,
            hidden: true,
            dataIndex: "dc_expense_budget_type_idTxt",
            width: 250,
          },
          {
            header: "วันที่ตรวจรับ(คลัง)",
            readOnly:true,
            sortable: false,
            hidden: true,
            align: "center",
            dataIndex: "d_audit_date",
            editor: new Ext.form.DateField({}),
            renderer: function (val, metaData, record, rowIndex, colIndex, store) {
              // var vals = val; // val.add(Date.YEAR, 543);
              // return vals !== null && vals !== "" ? vals.dateFormat("d-m-Y") : "";
              return shortThaiDate(val);
            },
          },
          {
            header: "วันที่ตรวจรับ",
            readOnly:true,
            sortable: false,
            align: "center",
            dataIndex: "d_checking_date",
            editor: new Ext.form.DateField({}),
            renderer: function (val, metaData, record, rowIndex, colIndex, store) {
              // var vals = val; // val.add(Date.YEAR, 543);
              // return vals !== null && vals !== "" ? vals.dateFormat("d-m-Y") : "";
              return shortThaiDate(val);
            },
          },
          {
            header: "วันที่ใบขอเบิก",
            sortable: false,
            align: "center",
            dataIndex: "d_doc_date",
            editor: new Ext.form.DateField({}),
            renderer: function (val, metaData, record, rowIndex, colIndex, store) {
              // var vals = val; // val.add(Date.YEAR, 543);
              // return vals !== null && vals !== "" ? vals.dateFormat("d-m-Y") : "";
              return shortThaiDate(val);
            },
          },
          {
            header: "จ่ายให้",
            sortable: false,
            align: "center",
            width: 300,
            dataIndex: "dc_creditor_name", //
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (value !== "" && value !== undefined) {
                metaData.attr = "style='text-align: left;'";
                // var vals = getStoreItems(Ext.dc_cnt, value, "c_name");
                return value;
              } else {
                metaData.attr = "style='color:red; text-align: left;'";
                return "-";
              }
            },
          },
          // {
          //   header: "จำนวนรายการ",
          //   sortable: false,
          //   align: "left",
          //   dataIndex: "c_qty",
          //   editor: new Ext.form.TextField({}),
          // },
          {
            header: "จำนวนเงินขอเบิก",
            sortable: false,
            align: "center",
            dataIndex: "f_total",
            width: 110,
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = "style='color:blue;text-align: right;'";
              return floatRenderer(floatMinus(value, 2));
            },
          },
          {
            width: 20,
            dataIndex: "",
          },
        ],
        bbar: new Ext.PagingToolbar({
          pageSize: 20,
          store: Ext.storeDtl,
          displayInfo: true,
          displayMsg: "Displaying topics {0} - {1} of {2}",
        }),
      });
    }),
    Ext.grid.EditorGridPanel,
    {}
  );
  // EditorGridPanel
  const search = function () {
    var msg = "";
    if (msg == "") {
      Ext.storeDtl.setBaseParam("mode", "SEARCH");
      Ext.storeDtl.setBaseParam("filter", Ext.getCmp("filter-ID").getValue());
      Ext.storeDtl.setBaseParam("value", Ext.getCmp("val-ID").getValue());
      // Ext.storeDtl.setBaseParam("userid", Ext.getCmp("userid-ID").getValue());
      Ext.storeDtl.setBaseParam("i_pdf", Ext.getCmp("i_pdf").getValue() ? "1" : "0");
      Ext.getCmp("tabpanel1").getStore().load();
    } else {
      Ext.Msg.alert("แจ้งเตือน", msg);
    }
  };
};
