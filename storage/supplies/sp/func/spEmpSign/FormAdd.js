Ext.HDR_ID = null;

const submit_save = function (type) {
  Ext.Ajax.request({
    url: "api/mn_poSendStatusAll.php",
    method: "POST",
    isUpload: true, //set upload file
    form: Ext.getCmp("upload_pdf").formUpload.getForm().getEl().dom,
    params: {
      mode: type == "ADD" ? "SEND_STATUS" : "EDIT_STATUS",
      id: Ext.HDR_ID,
      begin_hdr_id: Ext.BEGIN_HDR_ID,
      i_status: Ext.I_STATUS,
      i_sub_status: Ext.I_SUB_STATUS,
      d_doc_date: Ext.util.Format.date(Ext.getCmp("d_doc_date").getValue(), "Y-m-d"),
      c_comment: Ext.getCmp("c_comment_status").getValue(),
      dc_user_sign_id: Ext.session.user_id,

      i_cost_sign_out: Ext.getCmp("i_cost_sign_out").checked ? 1 : 0,
    },
    success: function (result, request) {
      Ext.Msg.wait("Uploading...");
      if (error_json(result.responseText, request.params)) return;
      let jsonData = Ext.util.JSON.decode(result.responseText);
      if (jsonData.success == true) {
        Ext.store.load({ params: { mode: "" } });

        Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + jsonData.msg + "</span>");
        Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
        Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Dtl"), true) || {};
      } else {
        if (jsonData.request_data_sign == true) {
          console.log("sign outside");
          Ext.Msg.hide();
          edit_user_for_sigh(jsonData.data);
        } else {
          Ext.Msg.alert("แจ้งเตือน", "<span color='red' style='white-space: nowrap;'>" + jsonData.msg + "</span>");
        }
      }
    },
    failure: function (result, request) {
      Ext.MessageBox.alert("Failed", result.responseText); // connect error
      Ext.getCmp("MessageBox_re").hide();
      Ext.getCmp("MessageBox_re").destroy();
    },
  });
};

const saveHdr = function (type) {
  let msg = "";
  if (!Ext.getCmp("d_doc_date").getValue()) {
    msg += "<span style='white-space: nowrap;'>- กรุณาระบุ วันที่ทำรายการ</span><br>";
  }
  if (Ext.getCmp("i_cost_sign_out").checked && Ext.getCmp("upload_pdf").canSumit == false) {
    msg += "<span style='white-space: nowrap;'>- กรุณาเลือกไฟล์ (.pdf)</span><br>";
  }
  if (msg == "") {
    Ext.Msg.wait("uploading...");
    Ext.Msg.hide();
    if (Ext.getCmp("i_cost_sign_out").checked) {
      var win = new Ext.Window({
        id: "MessageBox_re",
        title: "ยันยืนการผ่านรายการ ",
        modal: true,
        width: 410,
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
              // {
              //   xtype: "displayfield",
              //   id: "displaytext",
              //   width: 200,
              //   value: "การถอยสถานะจะไม่สามารถกู้คืนสถานะที่ถูกลบได้",
              //   style: "text-align: center; color:red; white-space: nowrap;",
              // },
              {
                xtype: "displayfield",
                value: `
                  <b style='color: red; font-size: 18px;'>ผู้ขอเบิกลงนามนอกระบบ</b><br>
                  <span style='color:blue; font-size: 15px;'>
                    (ผู้ขอเบิกไม่ต้องเข้ามากดภายในระบบหลังจากขั้นตอนนี้)<br>
                    ท่านต้องการยืนยันหรือไม่ ?
                  </span>`,
                // value: "ท่านต้องการให้ผู้ขอเบิกลงนามนอกระบบหรือไม่",
                width: 100,
              },
            ],
          },
        ],
        buttonAlign: "left",
        buttons: [
          {
            text: "ตกลง",
            id: "confirm_signout",
            handler: function () {
              // Ext.getCmp("frm-Add").getEl().mask("Please wait...", "x-mask-loading");
              Ext.Msg.wait("Saving...");
              submit_save(type);
              Ext.getCmp("MessageBox_re").hide();
              Ext.getCmp("MessageBox_re").destroy();
            },
          },
          { xtype: "tbfill" },
          {
            text: "ย้อนกลับ",
            handler: function () {
              Ext.getCmp("MessageBox_re").hide();
              Ext.getCmp("MessageBox_re").destroy();
              Ext.Msg.hide();
            },
          },
        ],
      }).show();
    } else if (!Ext.getCmp("i_cost_sign_out").checked) {
      Ext.Msg.wait("Saving...");
      submit_save(type);
    }
  } else {
    Ext.Msg.alert("แจ้งเตือน", msg);
  }
}; // saveHdr

const saveHdr_MutiSave = function () {
  let msg = "";
  var check = false;
  var ids = Ext.list_check_data.map(function (record) {
    check = true;
    return [record.get("id"), record.get("po_working_begin_hdr_id")];
  });

  if (check == false) {
    msg += "<span style='white-space: nowrap;'>- กรุณาเลือก รายการ อย่างน้อย 1 รายการ</span><br>";
  }
  if (!Ext.getCmp("d_doc_date").getValue()) {
    msg += "<span style='white-space: nowrap;'>- กรุณาระบุ วันที่ทำรายการ</span><br>";
  }

  if (msg == "") {
    Progress_Default_Step("start", "กำลังทำรายการกรุณารอสักครู่...", "");
    Ext.Ajax.request({
      url: "api/mn_poSendStatusAll.php",
      method: "POST",
      params: {
        mode: "SEND_STATUS",
        i_status: Ext.I_STATUS,
        i_sub_status: Ext.I_SUB_STATUS,
        d_doc_date: Ext.util.Format.date(Ext.getCmp("d_doc_date").getValue(), "Y-m-d"),
        c_comment: Ext.getCmp("c_comment_status").getValue(),
        dc_user_sign_id: Ext.session.user_id,
        muit_id: JSON.stringify(ids),
      },
      success: function (result, request) {
        Progress_Default_Step("success", function () {
          Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
          if (error_json(result.responseText, request.params)) return;
          let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
          if (jsonData.success == true) {
            Ext.store.load();
            Ext.storeMutiSave.load();
            Ext.list_check_data = [];
            document.getElementById("text_conut").innerHTML = "";
            Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + jsonData.msg + "</span>");
          } else {
            if (jsonData.request_data_sign == true) {
              Ext.Msg.hide();
              edit_user_for_sigh(jsonData.data);
            } else {
              Ext.Msg.alert("แจ้งเตือน", "<span color='red' style='white-space: nowrap;'>" + jsonData.msg + "</span>");
            }
          }
        });
      },
      failure: function (result, request) {
        Progress_Default_Step("stop");
        Ext.MessageBox.alert("Failed", result.responseText); // connect error
      },
    });
  } else {
    Ext.Msg.alert("แจ้งเตือน", msg);
  }
}; //saveHdr_MutiSave

const Obj_MutiSave = [
  {
    xtype: "buttongroup",
    frame: false,
    items: [
      { xtype: "label", text: "วันที่ทำรายการ : ", style: "font-size: 14px; " },
      { xtype: "tbspacer", width: 4 },
      {
        xtype: "datefield",
        id: "d_doc_date",
        style: "font-size: 14px;",
        width: 100,
      },
      { xtype: "tbspacer", width: 100 },
    ],
  },
  {
    xtype: "buttongroup",
    frame: false,
    items: [
      { xtype: "label", text: "หมายเหตุ : ", style: "font-size: 14px; " },
      { xtype: "tbspacer", width: 4 },
      {
        xtype: "textarea",
        fieldLabel: "หมายเหตุ",
        id: "c_comment_status",
        height: 40, // Set the height here
        width: 200,
      },
    ],
  },
]; // Obj_MutiSave

function show_pin(chk) {
  var type = chk.checked ? "text" : "password";
  for (var i = 0; i <= 3; i++) {
    document.getElementById("pin_code_" + i).type = type;
  }
}

const win_input_pin = function (data) {
  let msg = "";

  if (msg == "") {
    Ext.pin_sig = "";
    const win_input_pin_id = "win_input_pin_id";
    const display_name_pin = "ระบุ PIN เพื่อลงนาม";
    const limit_num = 4;
    var pin_code = "";
    for (var i = 0, html_input = ""; i <= limit_num - 1; i++) {
      html_input += `<input id="pin_code_` + i + `" maxlength="1" type="password" readonly>`;
    }
    var html =
      `<br><h1 class="h-pin">` +
      display_name_pin +
      `</h1>
        <div class="show-pin">
          <input id="checkbox_show_pin" type="checkbox" onchange="show_pin(this)">
          <label for="pin-checkbox">&nbsp;แสดง PIN</label>
        </div>
        <div class="pin-code">
        ` +
      html_input +
      `</div>
        <div style="padding-left: 22px; padding-top: 5px;">
          <span id="msg_pin_code_txt" style="color:red;  white-space: nowrap;"></span>
        </div>
      `;
    return new Ext.Window({
      id: win_input_pin_id,
      title: "",
      modal: true,
      autoScroll: true,
      width: 50 * limit_num + 70,
      height: 190,
      bodyStyle: "background:#fff;",
      html: html,
      resizable: false,
      listeners: {
        render: function (c) {},
        afterrender: function () {
          var messageBoxWindow = Ext.getCmp(win_input_pin_id);
          messageBoxWindow.cascade(function (component) {
            component.el.on("keydown", function (event) {
              var keyCode = event.which || event.keyCode;
              if (keyCode == 8) {
                pin_code = pin_code.slice(0, -1);
                for (var i = 0; i <= limit_num - 1; i++) {
                  if (i <= pin_code.length - 1) {
                    document.getElementById("pin_code_" + i).value = pin_code[i];
                  } else {
                    document.getElementById("pin_code_" + i).value = "";
                  }
                }
                document.getElementById("msg_pin_code_txt").innerHTML = "";
              } else {
                if ((keyCode >= 96 && keyCode <= 105) || (keyCode >= 48 && keyCode <= 57)) {
                  if (pin_code.length != limit_num) {
                    if (pin_code.length < limit_num) {
                      var key = String.fromCharCode(keyCode);
                      if (keyCode >= 96 && keyCode <= 105) {
                        key = String.fromCharCode(keyCode - 48);
                      }
                      pin_code += key;
                      for (var i = 0; i <= pin_code.length - 1; i++) {
                        document.getElementById("pin_code_" + i).value = pin_code[i];
                      }
                    }
                    if (pin_code.length == limit_num) {
                      Ext.pin_sig = pin_code;
                      Ext.Ajax.request({
                        url: "api/All_c_pin.php",
                        method: "POST",
                        params: {
                          mode: "C_PIN_CHECK",
                          id: Ext.session.user_id,
                          c_pin: Ext.Text_Encode(Ext.pin_sig),
                        },
                        success: function (result, request) {
                          try {
                            var jsonData = Ext.util.JSON.decode(result.responseText);
                          } catch (err) {
                            Ext.MessageBox.alert("เกิดความผิดพลาด : C_PIN_CHECK", "<span style='white-space:nowrap; color:red'>เกิดความผิดพลาดกรุณาติดต่อผู้ดูแลระบบ</span>");
                            return;
                          }
                          if (jsonData.success == "Success") {
                            if (jsonData.pin == true) {
                              saveHdr(true);
                              Ext.getCmp("win_input_pin_id").destroy();
                              Ext.store.load();
                            } else {
                              document.getElementById("msg_pin_code_txt").innerHTML = "● PIN ไม่ถูกต้อง";
                            }
                          } else {
                            Ext.MessageBox.alert("Failed", result.responseText);
                          }
                        },
                        failure: function (result, request) {
                          Ext.MessageBox.alert("Failed", result.responseText);
                        },
                      });
                    } else {
                      document.getElementById("msg_pin_code_txt").innerHTML = "";
                    }
                  }
                }
              }
            });
          });
        },
      },
    }).show();
  } else {
    Ext.Msg.alert("แจ้งเตือน", msg);
  }
}; //win_pin
// Class Extend
formAdd = function (args) {
  formAdd.superclass.constructor.call(this, {
    region: "center",
    title: "ข้อมูล" + Ext.title_panel,
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
        frame: true,
        labelAlign: "right",
        labelWidth: 200,
        bodyStyle: { padding: "10px 20px" },
        defaults: { anchor: "100%", msgTarget: "side", allowBlank: false },
        items: [
          new Ext.toolbar_btn_menu({
            id: "btn_menu",
          }).mini,
          {
            xtype: "container",
            layout: "hbox",
            align: "stretch",
            RemoveHeight: true,
            defaults: { xtype: "fieldset", flex: 1, margins: "0px 3px", autoHeight: true },
            items: [
              {
                title: "บันทึกข้อมูล " + Ext.title_panel,
                RemoveCls: "x-box-item",
                collapsible: true,
                collapsed: false,
                defaults: { labelStyle: "width:200px;", allowBlank: true },
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
                    xtype: "textfield",
                    fieldLabel: "เลขที่ใบขอเบิก",
                    id: "c_code",
                    name: "c_code",
                    style: "text-align:center; font-weight:bold; background:#eee;",
                    width: 180,
                    readOnly: true,
                  },
                  {
                    xtype: "datefield",
                    fieldLabel: "วันที่เจ้าหน้าที่ลงนาม",
                    name: "d_status_date",
                    id: "d_doc_date",
                  },
                  {
                    xtype: "textarea",
                    fieldLabel: "หมายเหตุ",
                    id: "c_comment_status",
                    name: "c_comment_status",
                    width: 300,
                  },
                  {
                    xtype: "checkbox",
                    id: "i_cost_sign_out",
                    style: {
                      width: "19px",
                      height: "19px",
                    },
                    boxLabel: "<b style='color: red; font-size: 18px;'>ผู้ขอเบิกลงนามนอกระบบ</b>",
                    hidden: Ext.dataSelect.i_inside_cost != 1 ? false : true,
                    inputValue: 1,
                    checked: false,
                    listeners: {
                      afterrender: function () {
                        setTimeout(() => {
                          Ext.getCmp("upload_pdf").hide();
                        }, 50);
                      },
                      check: function (combo, newValue) {
                        if (newValue) {
                          Ext.getCmp("text_pdf_up").show();
                          Ext.getCmp("upload_pdf").show();
                        } else {
                          Ext.getCmp("text_pdf_up").hide();
                          Ext.getCmp("upload_pdf").hide();
                        }
                      },
                    },
                  },
                  {
                    xtype: "radiogroup",
                    id: "text_pdf_up",
                    columns: 1,
                    hidden: true,
                    items: [
                      {
                        xtype: "label",
                        html: `
                          <span style='color:blue; font-size: 15px;'>
                            *กรุณาแนบเอกสารใบขอเบิกที่ผู้ขอเบิกลงนามแล้ว + เอกสารประกอบ
                            <br>(ผู้ขอเบิกไม่ต้องเข้ามากดภายในระบบหลังจากขั้นตอนนี้)
                          </span>
                        `,
                      },
                    ],
                  },
                  new Ext.ux.FileUpload({
                    id: "upload_pdf",
                    constructorForm: "frm-Add",
                    uploadLabel: "เอกสาร (PDF)",
                    uploadEmptyText: "แก้ไขเอกสารประกอบใบเบิก* เลือกไฟล์ (.pdf)",
                    buttonText: "ดาวน์โหลดเอกสารประกอบใบเบิก",
                    fileExt: "pdf",
                    iconCls: "icon-pdf",
                    editForm: false,
                    width: 300,
                    // hidden: true,
                    btnViewClick: function () {
                      Po_OpenPdf(Ext.dataSelect.pdf_dtl, Ext.dataSelect.c_code);
                    },
                    fileSelecte: function () {},
                  }).mini,

                  // new Ext.ux.FileUpload({
                  //   id: "upload_pdf",
                  //   constructorForm: "frm-Add",
                  //   uploadLabel: "เอกสาร (PDF)",
                  //   uploadEmptyText: "แก้ไขเอกสารประกอบใบเบิก* เลือกไฟล์ (.pdf)",
                  //   buttonText: "ดาวน์โหลดเอกสารประกอบใบเบิก",
                  //   fileExt: "pdf",
                  //   iconCls: "icon-pdf",
                  //   editForm: Ext.i_status <= Ext.I_STATUS_BEFORE ? false : true,
                  //   width: 300,
                  //   // hidden: true,
                  //   btnViewClick: function () {
                  //     Po_OpenPdf(Ext.dataSelect.pdf_dtl, Ext.dataSelect.c_code);
                  //   },
                  //   fileSelecte: function () {},
                  // }).mini,
                ],
              },
            ],
          },
        ],
        buttonAlign: "left",
        buttons: [
          {
            text: "&nbsp;เจ้าหน้าที่ลงนาม&nbsp;",
            id: "btn_save_hdr",
            iconCls: "icon-save",
            disabled: Ext.butt == "add" || Ext.butt == "edit" ? false : true,
            handler: function () {
              if (Ext.SING_CONFIG) {
                win_input_pin();
              } else {
                var vv = Ext.dataSelect.i_sub_status;
                var type = vv == Ext.I_SUB_STATUS_BEFORE ? "ADD" : "EDIT";
                saveHdr(type);
              }
            },
            listeners: {
              afterrender: function () {
                var vv = Ext.dataSelect.i_sub_status;
                if (vv == Ext.I_SUB_STATUS_BEFORE) {
                  btn_set_color(this, "green"); //color : green, red, yellow, orange
                  Ext.getCmp("btn_save_hdr").enable();
                } else if (vv == Ext.I_SUB_STATUS) {
                  btn_set_color(this, "yellow"); //color : green, red, yellow, orange
                  Ext.getCmp("btn_save_hdr").setText("&nbsp;บันทึกการแก้ไข&nbsp;");
                } else {
                  btn_set_color(this, "yellow"); //color : green, red, yellow, orange
                  Ext.getCmp("btn_save_hdr").disable();
                  Ext.getCmp("btn_save_hdr").setText("&nbsp;บันทึกการแก้ไข&nbsp;");
                }
              },
            },
          },
          {
            text: Ext.GLOBAL_BU_BACK_TH,
            handler: function () {
              Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
              Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Dtl"), true) || {};
            },
          },
        ],
      },
    ],
  });
}; // formAdd
Ext.extend(formAdd, Ext.Panel, {});
