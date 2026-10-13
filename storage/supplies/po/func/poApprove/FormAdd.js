Ext.HDR_ID = null;
// var itemFile = null;
// const downloadFile = function (part, name) {
//   var file_path = part;
//   var file_name = name;
//   var a = document.createElement("A");
//   a.href = file_path;
//   a.download = file_name.substr(file_name.lastIndexOf("/") + 1);
//   document.body.appendChild(a);
//   a.click();
//   document.body.removeChild(a);
// };

const saveHdr = function (type) {
  let msg = "";
  if (Ext.dataSelect.i_status_edit == 1 && Ext.getCmp("i_edit_pdfIDs1").getValue() == false) {
    var i_not_edit_pdf = 1; // ไม่อัพโหลด
  } else if (Ext.dataSelect.i_status_edit == 1 && Ext.getCmp("i_edit_pdfIDs1").getValue() == true) {
    var i_not_edit_pdf = 2; // อัพโหลด
  } else {
    var i_not_edit_pdf = 3; // อัพโหลด
  }

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

  if (Ext.getCmp("d_doc_date").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณากรอก วันที่อนุมัติฏีกา</span><br>";
  }
  if (Ext.getCmp("c_approve").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณากรอก เลขที่ฏีกา</span><br>";
  }

  if (msg == "") {
    Ext.Msg.wait('uploading...');
    // Ext.getCmp("frm-Add").getEl().mask("Please wait...", "x-mask-loading");
    // Ext.MessageBox.wait('Procesando..., por favor espere')
    Ext.Ajax.request({
      // waitMsg: "Saving Data...",
      url: "api/mn_poWorking.php",
      method: "POST",
      params: {
        mode: "SEND_STATUS",
        id: Ext.HDR_ID,
        i_status: Ext.I_STATUS,
        i_is_url_pdf_hdr: Ext.pdf_hdr == null ? null : 0,
        i_is_url_pdf_dtl: Ext.i_is_url_pdf_dtl,
        pdf_hdr: Ext.HDR_ID + "_" + Ext.I_STATUS + "_hdr.pdf",
        pdf_dtl: Ext.pdf_dtl,
        c_approve: Ext.getCmp("c_approve").getValue(),
        d_doc_date: Ext.util.Format.date(Ext.getCmp("d_doc_date").getValue(), "Y-m-d"),
        c_comment: Ext.getCmp("c_comment").getValue(),
      },
      success: function (result, request) {
        // Ext.MessageBox.wait('uploading...')
        Ext.Msg.wait('Uploading...');
        // Ext.getCmp("frm-Add").getEl().unmask();
        let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
        if (jsonData.success == true) {
          Ext.store.load({ params: { mode: "" } });
          if (i_not_edit_pdf != 1) {
            Ext.getCmp("form-widgets")
              .getForm()
              .submit({
                // waitMsg: "Saving Data...",
                standardSubmit: true,
                url: "api/mn_poWorking.php",
                params: {
                  mode: "SEND_STATUS_UPLOADFILE",
                  id: Ext.HDR_ID,
                  i_status: Ext.I_STATUS,
                },
                success: function (result, request) {
                  Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + jsonData.msg + "</span>");
                  Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not errer
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
        }
      },
      failure: function (result, request) {
        Ext.MessageBox.alert("Failed", result.responseText); // connect error
      },
    });
    // Ext.Msg.unmask();
  } else {
    Ext.Msg.alert("แจ้งเตือน", msg);
  }
}; // saveHdr

const saveBack = function () {
  let msg = "";
  if (Ext.getCmp("back_d_doc_date").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณากรอก วันที่ทักท้วง</span><br>";
  }

  if (msg == "") {
    Ext.getCmp("frm-Add").getEl().mask("Please wait...", "x-mask-loading");
    Ext.Ajax.request({
      url: "api/mn_poWorking.php",
      method: "POST",
      params: {
        mode: "SEND_STATUS",
        id: Ext.HDR_ID,
        i_is_url_pdf_hdr: Ext.i_is_url_pdf_hdr,
        i_is_url_pdf_dtl: Ext.i_is_url_pdf_dtl,
        pdf_hdr: Ext.pdf_hdr,
        pdf_dtl: Ext.pdf_dtl,
        po_reason_protest_id_s: Ext.getCmp("po_reason_protest").getValue(),
        po_parcel_officer_id: Ext.getCmp("po_parcel_officer").getValue(),
        i_status: 3,
        d_doc_date: Ext.util.Format.date(Ext.getCmp("back_d_doc_date").getValue(), "Y-m-d"),
        c_comment: Ext.getCmp("back_c_comment").getValue(),
      },
      success: function (result, request) {
        Ext.getCmp("frm-Add").getEl().unmask();
        let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
        if (jsonData.success == true) {
          Ext.store.load({ params: { mode: "" } });
          Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not errer
          Ext.getCmp("win-pop").destroy();
        }
        Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + jsonData.msg + "</span>");
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
                    id: "c_code",
                    name: "c_code",
                    style: "font-weight: bold;color: red;",
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
                    fieldLabel: "วันที่อนุมัติฏีกา",
                    name: "d_status_date",
                    id: "d_doc_date",
                  },
                  {
                    xtype: "textfield",
                    fieldLabel: "เลขที่ฏีกา",
                    id: "c_approve",
                    width: 200,
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
                        if (Ext.pdf_hdr == null) {
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
                        if (Ext.pdf_hdr == null) {
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
            text: "&nbsp;ส่งหักงบประมาณ&nbsp;",
            id: "btn_save_hdr",
            iconCls: "icon-save",
            disabled: Ext.butt == "add" || Ext.butt == "edit" ? false : true,
            handler: function () {
              saveHdr(true);
            },
            listeners: {
              afterrender: function () {
                if (Ext.I_STATUS_BEFORE != Ext.dataSelect.i_status_last && Ext.I_STATUS != Ext.dataSelect.i_status_last) {
                  Ext.getCmp("btn_save_hdr").disable();
                } else {
                  if(Ext.I_STATUS == Ext.dataSelect.i_status_last){
                    Ext.getCmp('btn_save_hdr').setText("&nbsp;บันทึกการแก้ไข&nbsp;");
                  }
                  Ext.getCmp("btn_save_hdr").enable();
                }
              },
            },
          },
          {
            text: "&nbsp;ส่งทักท้วง&nbsp;",
            id: "btn_approve_hdr",
            disabled: Ext.butt == "add" || Ext.butt == "edit" ? false : true,
            handler: function () {
              Ext.po_reason_protest.load();
              pop_back();
            },
            listeners: {
              afterrender: function () {
                if ((Ext.I_STATUS_BEFORE != Ext.dataSelect.i_status_last && Ext.I_STATUS != Ext.dataSelect.i_status_last) || Ext.I_STATUS == Ext.dataSelect.i_status_last) {
                  Ext.getCmp("btn_approve_hdr").disable();
                } else {
                  Ext.getCmp("btn_approve_hdr").enable();
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
    ],
  });
}; // formAdd
Ext.extend(formAdd, Ext.Panel, {});

const pop_back = function () {
  try {
    let index_id = Ext.store.findExact("id", "" + Ext.HDR_ID + "");
    back_d_doc_date = Ext.store.data.items[index_id].data.back_d_doc_date;
    back_c_comment = Ext.store.data.items[index_id].data.back_c_comment;
  } catch (err) {}

  new Ext.Window({
    title: "เลือกข้อมูล",
    id: "win-pop",
    layout: "fit",
    modal: true,
    border: false,
    items: [
      {
        xtype: "form",
        frame: true,
        labelAlign: "right",
        // labelWidth: 200,
        width: 950,
        height: 250,
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
                title: "บันทึกข้อมูลทักท้วง",
                RemoveCls: "x-box-item",
                collapsible: false,
                collapsed: false,
                defaults: { allowBlank: true },
                items: [
                  {
                    xtype: "datefield",
                    fieldLabel: "วันที่ทักท้วง",
                    id: "back_d_doc_date",
                    value: back_d_doc_date,
                  },
                  new Ext.form.ComboBox({
                    fieldLabel: "เจ้าหน้าที่พัสดุ",
                    id: "po_parcel_officer",
                    name: "po_parcel_officer",
                    mode: "local",
                    store: Ext.po_parcel_officer,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    width: 300,
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
                  new Ext.ux.form.LovCombo({
                    id: "po_reason_protest",
                    fieldLabel: "ข้อทักท้วง",
                    width: 680,
                    mode: "local",
                    store: Ext.po_reason_protest,
                    valueField: "i_row",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    //hidden: true,
                    emptyText: "กรุณาเลือก...",
                  }),
                  {
                    xtype: "textarea",
                    fieldLabel: "หมายเหตุ",
                    id: "back_c_comment",
                    value: back_c_comment,
                    width: 300,
                  },
                ],
              },
            ],
          },
        ],
        buttonAlign: "left",
        buttons: [
          {
            text: "&nbsp;บันทึกส่งทักท้วง&nbsp;",
            iconCls: "icon-save",

            disabled: Ext.butt == "add" || Ext.butt == "edit" ? false : true,
            handler: function () {
              saveBack();
            },
          },
          {
            text: Ext.GLOBAL_BU_BACK_TH,
            handler: function () {
              Ext.getCmp("win-pop").destroy();
            },
          },
        ],
      },
    ],
  }).show();
};
