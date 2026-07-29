Ext.HDR_ID = null;

if (Ext.I_STATUS == 6) {
  Ext.txt_save = "ส่งผู้บริหารลงนาม";
} else if (Ext.I_STATUS == 7) {
  Ext.txt_save = "ส่งจัดทำเช็ค";
} else if (Ext.I_STATUS == 9) {
  Ext.txt_save = "ส่งผู้บริหารลงนามเช็ค";
} else if (Ext.I_STATUS == 10) {
  Ext.txt_save = "ส่งทำทะเบียนจ่าย";
}

const saveHdr = function (type) {
  let msg = "";
  if (Ext.dataSelect.i_status_edit == 1 && Ext.getCmp("i_edit_pdfIDs1").getValue() == false) {
    var i_not_edit_pdf = 1; // ไม่อัพโหลด
  } else if (Ext.dataSelect.i_status_edit == 1 && Ext.getCmp("i_edit_pdfIDs1").getValue() == true) {
    var i_not_edit_pdf = 2; // อัพโหลด
  } else {
    var i_not_edit_pdf = 3; // อัพโหลด
  }

  if (Ext.I_STATUS == 9 || Ext.I_STATUS == 10) {
    var i_is_url_pdf_hdr = Ext.i_is_url_pdf_hdr;
    var i_is_url_pdf_dtl = Ext.i_is_url_pdf_dtl;
    var pdf_hdr = Ext.pdf_hdr;
    var pdf_dtl = Ext.pdf_dtl;
  } else {
    if (Ext.pdf_hdr != null) {
      if (i_not_edit_pdf != 1) {
        let file1 = Ext.get("upload_pdf1-file").dom.files[0];
        let parts1 = null;
        try {
          parts1 = file1.name.split(".");
        } catch (err) {}

        if (file1 == "" || file1 == undefined) {
          msg += "<span style='white-space: nowrap;'>กรุณาเลือกไฟล์ที่ต้องการ</span><br>";
        } else if (parts1[parts1.length - 1] != "pdf") {
          if (parts1[parts1.length - 1] != "PDF"){
            msg += "<span style='white-space: nowrap;'>กรุณาเลือกไฟล์ (.pdf)</span><br>";
          }
        }
      }
    }

    var i_is_url_pdf_hdr = Ext.pdf_hdr == null ? null : 0;
    var i_is_url_pdf_dtl = Ext.i_is_url_pdf_dtl;
    var pdf_hdr = Ext.HDR_ID + "_" + Ext.I_STATUS + "_hdr.pdf";
    var pdf_dtl = Ext.pdf_dtl;
  }

  if (Ext.getCmp("d_doc_date").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณากรอก วันที่ส่ง</span><br>";
  }

  if (msg == "") {
    Ext.Msg.wait("Uploading...");
    Ext.Ajax.request({
      url: "api/mn_poWorking.php",
      method: "POST",
      params: {
        mode: "SEND_STATUS",
        id: Ext.HDR_ID,
        i_status: Ext.I_STATUS,
        d_doc_date: Ext.util.Format.date(Ext.getCmp("d_doc_date").getValue(), "Y-m-d"),
        c_comment: Ext.getCmp("c_comment").getValue(),
        i_is_url_pdf_hdr: i_is_url_pdf_hdr,
        i_is_url_pdf_dtl: i_is_url_pdf_dtl,
        pdf_hdr: pdf_hdr,
        pdf_dtl: pdf_dtl,
      },
      success: function (result, request) {
        let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
        if (jsonData.success == true) {
          Ext.store.load({ params: { mode: "" } });
          if (i_not_edit_pdf != 1) {
            Ext.getCmp("form-widgets")
              .getForm()
              .submit({
                standardSubmit: true,
                url: "api/mn_poWorking.php",
                params: {
                  mode: "SEND_STATUS_UPLOADFILE",
                  id: Ext.HDR_ID,
                  i_status: Ext.I_STATUS,
                },
                success: function (result, request) {
                  Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not errer
                  Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + jsonData.msg + "</span>");
                },
                failure: function (result, request) {
                  Ext.MessageBox.alert("Failed", result.responseText);
                },
              });
          } else {
            Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not errer
            Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + jsonData.msg + "</span>");
          }
        } else {
          Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + jsonData.msg + "</span>");
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
    layout: {
      type: "vbox",
      align: "stretch",
      pack: "start",
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
                    style: "font-weight: bold;color: red;",
                    width: 200,
                    readOnly: true,
                  },
                  {
                    xtype: "textfield",
                    fieldLabel: "เลขที่ฏีกา",
                    name: "c_approve",
                    style: "font-weight: bold;color: blue;",
                    width: 200,
                    readOnly: true,
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
                    fieldLabel: "วันที่ส่ง",
                    id: "d_doc_date",
                    name: "d_status_date",
                  },
                  {
                    xtype: "textarea",
                    fieldLabel: "หมายเหตุ",
                    id: "c_comment",
                    name: "c_comment_status",
                    width: 300,
                  },
                  {
                    xtype: "button",
                    id: "btn_pdf",
                    iconCls: "icon-pdf",
                    fieldLabel: " ",
                    text: "ดาวน์โหลดเอกสารใบเบิก",
                    handler: function () {
                      if (Ext.i_is_url_pdf_hdr == 0) {
                        window.open(Ext.part_file_pdf + Ext.pdf_hdr, "_blank");

                        // downloadFile(Ext.part_file_pdf + Ext.pdf_hdr, "อนุมัติฏีกา_" + Ext.getCmp('c_code').getValue());
                      } else if (Ext.i_is_url_pdf_hdr == 1) {
                        window.open(Ext.pdf_hdr);
                        // downloadFile('https://drive.google.com/file/d/1DEb_BbMbGYRViAHAAZ9kQmapf6UxNkv8/view?usp=sharing', "อนุมัติฏีกา_" + Ext.getCmp('c_code').getValue());
                      }
                    },
                    listeners: {
                      afterrender: function () {
                        if (Ext.pdf_hdr == null || Ext.I_STATUS == 9 || Ext.I_STATUS == 10) {
                          Ext.getCmp("btn_pdf").hide();
                        }
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
                        if (Ext.dataSelect.i_status_edit != 1) {
                          Ext.getCmp("i_edit_pdfID").hide();
                        }
                        if (Ext.pdf_hdr == null) {
                          Ext.getCmp("i_edit_pdfID").hide();
                        }
                        if (Ext.I_STATUS == 9 || Ext.I_STATUS == 10) {
                          Ext.getCmp("i_edit_pdfID").hide();
                        }
                      },
                      change: function (combo, newValue) {
                        if (Ext.getCmp("i_edit_pdfIDs1").getValue() == true) {
                          Ext.getCmp("upload_pdf1").show();
                        } else {
                          Ext.getCmp("upload_pdf1").hide();
                        }
                      },
                    },
                  },
                  {
                    xtype: "fileuploadfield",
                    id: "upload_pdf1",
                    width: 300,
                    emptyText: "เลือกไฟล์ (.pdf)",
                    fieldLabel: "เอกสารใบขอเบิก",
                    name: "upload_pdf1",
                    buttonText: "",
                    buttonCfg: {
                      iconCls: "icon-pdf",
                    },
                    listeners: {
                      afterrender: function () {
                        if (Ext.pdf_hdr == null || Ext.I_STATUS == 9 || Ext.I_STATUS == 10) {
                          Ext.getCmp("upload_pdf1").hide();
                        }
                        if (Ext.dataSelect.i_status_edit == 1) {
                          Ext.getCmp("upload_pdf1").hide();
                        }
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
            text: "&nbsp;" + Ext.txt_save + "&nbsp;",
            id: "btn_save_hdr",
            iconCls: "icon-save",
            disabled: Ext.butt == "add" || Ext.butt == "edit" ? false : true,
            handler: function () {
              saveHdr(true);
            },
            listeners: {
              afterrender: function () {
                console.log(Ext.dataSelect.i_status_last);
                if (Ext.I_STATUS_BEFORE != Ext.dataSelect.i_status_last && Ext.I_STATUS != Ext.dataSelect.i_status_last) {
                  Ext.getCmp("btn_save_hdr").disable();
                } else {
                  if (Ext.I_STATUS == Ext.dataSelect.i_status_last) {
                    Ext.getCmp("btn_save_hdr").setText("&nbsp;บันทึกการแก้ไข&nbsp;");
                  }
                  Ext.getCmp("btn_save_hdr").enable();
                }
              },
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
      new Ext.Panel({
        flex: 1,
        hidden: Ext.I_STATUS == 9 || Ext.I_STATUS == 10 ? false : true,
        html: "<iframe name='printf' src='../po/preview/Pre_Pocheque.php?id=" + Ext.HDR_ID + "' style='width:100%; height:100%; border-style: none;'></iframe>",
      }),
    ],
  });
}; // formAdd
Ext.extend(formAdd, Ext.Panel, {});
