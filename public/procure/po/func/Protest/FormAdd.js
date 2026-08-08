Ext.HDR_ID = null;

Ext.txt_save = "รับคืนทักท้วง";

const saveHdr = function (type) {
  let msg = "";

  if (Ext.getCmp("d_receive_date").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณากรอก วันที่รับคืน</span><br>";
  }

  if (Ext.pdf_hdr != null) {
    let file1 = Ext.get("upload_pdf1-file").dom.files[0];
    let parts1 = null;
    try {
      parts1 = file1.name.split(".");
    } catch (err) {}
    let file2 = Ext.get("upload_pdf2-file").dom.files[0];
    let parts2 = null;
    try {
      parts2 = file1.name.split(".");
    } catch (err) {}

    if (file1 == "" || file1 == undefined || file2 == "" || file2 == undefined) {
      msg += "<span style='white-space: nowrap;'>กรุณาเลือกไฟล์ให้ครบ</span><br>";
    } else if (parts1[parts1.length - 1] != "pdf" || parts2[parts2.length - 1] != "pdf") {
      if (parts1[parts1.length - 1] != "PDF" || parts2[parts2.length - 1] != "PDF"){
        msg += "<span style='white-space: nowrap;'>กรุณาเลือกไฟล์ (.pdf)</span><br>";
      }
    }
  }
  // if ((Ext.getCmp("c_url_pdf_hdr").getValue() == "" && Ext.getCmp("c_url_pdf_dtl").getValue() != "") || (Ext.getCmp("c_url_pdf_hdr").getValue() != "" && Ext.getCmp("c_url_pdf_dtl").getValue() == "")) {
  //   msg += "<span style='white-space: nowrap;'>- กรุณากรอก เอกสารใบเบิก (URL) และ เอกสารประกอบใบเบิก (URL)</span><br>";
  // }

  if (msg == "") {
    Ext.Msg.wait('uploading...');
    Ext.Ajax.request({
      url: "api/mn_poWorking.php",
      method: "POST",
      params: {
        mode: "SEND_RECEIVE",
        id: Ext.HDR_ID,
        i_status: Ext.I_STATUS,
        d_receive_date: Ext.util.Format.date(Ext.getCmp("d_receive_date").getValue(), "Y-m-d"),
        i_is_url_pdf_hdr: Ext.pdf_hdr == null ? null : 0,
        i_is_url_pdf_dtl: Ext.pdf_dtl == null ? null : 0,
        pdf_hdr: Ext.HDR_ID + "_" + Ext.I_STATUS + "_hdr.pdf",
        pdf_dtl: Ext.HDR_ID + "_" + Ext.I_STATUS + "_dtl.pdf",
        // i_is_url_pdf_hdr: Ext.getCmp("c_url_pdf_hdr").getValue() == "" ? null : 1,
        // i_is_url_pdf_dtl: Ext.getCmp("c_url_pdf_dtl").getValue() == "" ? null : 1,
        // c_url_pdf_hdr: Ext.getCmp("c_url_pdf_hdr").getValue(),
        // c_url_pdf_dtl: Ext.getCmp("c_url_pdf_dtl").getValue(),
        c_comment: Ext.getCmp("c_comment").getValue(),
      },
      success: function (result, request) {
        let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
        if (jsonData.success == true) {
          Ext.store.load({ params: { mode: "" } });
          if (Ext.pdf_hdr != null) {
            Ext.getCmp("form-widgets")
              .getForm()
              .submit({
                standardSubmit: true,
                url: "api/mn_poWorking.php",
                params: {
                  mode: "SEND_RECEIVE_UPLOADFILE",
                  id: Ext.HDR_ID,
                  i_status: Ext.I_STATUS,
                },
                success: function (result, request) {
                  if (type) {
                    Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + jsonData.msg + "</span>");
                    Ext.getCmp("id").setValue(jsonData.id);
                    Ext.getCmp("role-form-mode").setValue("EDIT");
                    Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not errer
                  }
                },
                failure: function (result, request) {
                  Ext.MessageBox.alert("Failed", result.responseText);
                },
              });
          } else {
            Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + jsonData.msg + "</span>");
            Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not errer
          }
        }else{
          Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + jsonData.msg + "</span>");
          Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not errer
        }
      },
      failure: function (result, request) {
        Ext.MessageBox.alert("Failed", result.responseText); // connect error
      },
    });
  } else {
    Ext.Msg.alert("แจ้งเตือน", msg);
  }
}; // saveHdr

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
                    name: "c_code",
                    width: 200,
                    disabled: true,
                  },
                  {
                    xtype: "textfield",
                    fieldLabel: "จำนวนเงินขอเบิก",
                    id: "f_total",
                    name: "f_total",
                    style: "text-align: right; font-weight: bold;",
                    width: 200,
                    readOnly: true,
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
                    xtype: "datefield",
                    fieldLabel: "วันที่รับคืนทักท้วง",
                    id: "d_receive_date",
                    name: "d_receive_date",
                  },
                  {
                    xtype: "textarea",
                    fieldLabel: "หมายเหตุ",
                    id: "c_comment",
                    name: "c_receive_comment",
                    width: 300,
                  },
                  // {
                  //   xtype: "textfield",
                  //   fieldLabel: "เอกสารใบเบิก (URL)",
                  //   id: "c_url_pdf_hdr",
                  //   name: "c_url_pdf_hdr",
                  //   width: 800,
                  // },
                  // {
                  //   xtype: "textfield",
                  //   fieldLabel: "เอกสารประกอบใบเบิก (URL)",
                  //   id: "c_url_pdf_dtl",
                  //   name: "c_url_pdf_dtl",
                  //   width: 800,
                  // },
                  {
                    xtype: "fileuploadfield",
                    id: "upload_pdf1",
                    width: "400",
                    emptyText: "เลือกไฟล์ (.pdf)",
                    fieldLabel: "เอกสารใบเบิก (PDF)",
                    name: "upload_pdf1",
                    buttonText: "",
                    buttonCfg: {
                      iconCls: "icon-pdf",
                    },
                    listeners: {
                      afterrender: function () {
                        // if (Ext.selectRow.length == 0) {
                        // } else {
                        if (Ext.dataSelect.pdf_hdr == undefined) {
                          Ext.getCmp("upload_pdf1").hide();
                        }
                        // }
                      },
                    },
                  },
                  {
                    xtype: "fileuploadfield",
                    id: "upload_pdf2",
                    width: "400",
                    emptyText: "เลือกไฟล์ (.pdf)",
                    fieldLabel: "เอกสารประกอบใบเบิก (PDF)",
                    name: "upload_pdf2",
                    buttonText: "",
                    buttonCfg: {
                      iconCls: "icon-pdf",
                    },
                    listeners: {
                      afterrender: function () {
                        // if (Ext.selectRow.length == 0) {
                        //   // Ext.getCmp("upload_pdf2").hide();
                        // } else {
                        if (Ext.dataSelect.pdf_hdr == undefined) {
                          Ext.getCmp("upload_pdf2").hide();
                        }
                        // }
                      },
                    },
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
                        window.open(Ext.part_file_pdf + Ext.pdf_hdr, "_blank");
                      } else if (Ext.i_is_url_pdf_hdr == 1) {
                        window.open(Ext.pdf_hdr);
                      }
                    },
                    listeners: {
                      afterrender: function () {
                        // if (Ext.dataSelect.length == 0) {
                        //   Ext.getCmp("btn_pdf1").hide();
                        // } else {
                        if (Ext.dataSelect.pdf_hdr == null) {
                          Ext.getCmp("btn_pdf1").hide();
                        } else {
                          Ext.getCmp("upload_pdf1").hide();
                        }
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
                        window.open(Ext.part_file_pdf + Ext.pdf_dtl, "_blank");
                      } else if (Ext.i_is_url_pdf_dtl == 1) {
                        window.open(Ext.pdf_dtl);
                      }
                    },
                    listeners: {
                      afterrender: function () {
                        // if (Ext.selectRow.length == 0) {
                        //   Ext.getCmp("btn_pdf2").hide();
                        // }else{
                        if (Ext.dataSelect.pdf_hdr == null) {
                          Ext.getCmp("btn_pdf2").hide();
                        } else {
                          Ext.getCmp("upload_pdf2").hide();
                        }
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
                        // if (Ext.selectRow.length == 0) {
                        //   Ext.getCmp("i_edit_pdfID").hide();
                        // }else{
                        if (Ext.dataSelect.pdf_hdr == undefined) {
                          Ext.getCmp("i_edit_pdfID").hide();
                        }
                        // }
                      },
                      change: function (combo, newValue) {
                        if (Ext.getCmp("i_edit_pdfIDs1").getValue() == true) {
                          Ext.getCmp("upload_pdf1").show();
                          Ext.getCmp("upload_pdf2").show();
                          Ext.getCmp("btn_pdf1").hide();
                          Ext.getCmp("btn_pdf2").hide();
                        } else {
                          Ext.getCmp("upload_pdf1").hide();
                          Ext.getCmp("upload_pdf2").hide();
                          Ext.getCmp("btn_pdf1").show();
                          Ext.getCmp("btn_pdf2").show();
                        }
                      },
                    },
                    // listeners: {
                    //   afterrender: function () {
                    //     if (Ext.buAct == "update") {
                    //       if (Ext.selectRow.get("i_type_fix_rate") == true) {
                    //         Ext.getCmp("i_type_fix_rateIDs1").setValue(true);
                    //       }
                    //     }
                    //   },
                    // },
                  },
                ],
              },
            ],
          },
        ],
        buttonAlign: "left",
        buttons: [
          {
            text: "&nbsp;" + Ext.txt_save + "&nbsp;",
            iconCls: "icon-save",
            disabled: Ext.butt == "add" || Ext.butt == "edit" ? false : true,
            handler: function () {
              saveHdr(true);
            },
          },
          {
            text: Ext.GLOBAL_BU_BACK_TH,
            handler: function () {
              Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
            },
          },
        ],
      },
    ],
  });
}; // formAdd
Ext.extend(formAdd, Ext.Panel, {});
