Ext.HDR_ID = null;
Ext.DataTemp = null;

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
    msg += "<span style='white-space: nowrap;'>- กรุณากรอก วันที่หักงบประมาณ</span><br>";
  }

  if (msg == "") {
    Ext.Msg.wait('Uploading.');
    Ext.Ajax.request({
      url: "api/mn_poWorking.php",
      method: "POST",
      params: {
        mode: "SEND_STATUS",
        id: Ext.HDR_ID,
        i_status: Ext.I_STATUS,
        i_status_last: i_status_last,
        d_doc_date: Ext.util.Format.date(Ext.getCmp("d_doc_date").getValue(), "Y-m-d"),
        bg_expense_id: Ext.getCmp("bg_expense_id").getValue(),
        bg_budget_dtl_overlap_id: Ext.getCmp("bg_budget_dtl_overlap_id").getValue(),
        c_comment1: Ext.getCmp("c_comment").getValue(),
        c_comment: Ext.getCmp("c_comment_status").getValue(),
        i_is_url_pdf_hdr: Ext.pdf_hdr == null ? null : 0,
        i_is_url_pdf_dtl: Ext.i_is_url_pdf_dtl,
        pdf_hdr: Ext.HDR_ID + "_" + Ext.I_STATUS + "_hdr.pdf",
        pdf_dtl: Ext.pdf_dtl,
      },
      success: function (result, request) {
        
        let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
        if (jsonData.success == true) {
          Ext.store.load({
            params: {
              mode: "",
            },
          });
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
                  if (type) {
                    Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + jsonData.msg + "</span>");
                    Ext.getCmp("id").setValue(jsonData.id);
                    Ext.getCmp("role-form-mode").setValue("EDIT");
                    Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not errer
                  }
                  Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
                },
                failure: function (result, request) {
                  Ext.MessageBox.alert("Failed", result.responseText);
                },
              });
          } else {
            Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + jsonData.msg + "</span>");
            Ext.getCmp("id").setValue(jsonData.id);
            Ext.getCmp("role-form-mode").setValue("EDIT");
            Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not errer
          }
          Ext.HDR_ID = jsonData.id;
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
}; // saveHdr

// Class Extend
formAdd = function (args) {
  if (args.i_status_last >= 11) {
    readOnly_s = true;
  } else {
    readOnly_s = false;
  }
  if (args.i_status_last > 4) {
    name_buttom = "&nbsp;บันทึกการแก้ไข&nbsp;";
  } else {
    name_buttom = "&nbsp;ส่งหัวหน้าฝ่ายการคลังลงนาม&nbsp;";
  }
  i_status_last = args.i_status_last;
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
        bodyStyle: {
          padding: "10px 20px",
        },
        defaults: {
          anchor: "100%",
          msgTarget: "side",
          allowBlank: false,
        },
        items: [
          {
            xtype: "container",
            layout: "hbox",
            align: "stretch",
            RemoveHeight: true,
            defaults: {
              xtype: "fieldset",
              flex: 1,
              margins: "0px 3px",
              autoHeight: true,
            },
            items: [
              {
                title: "บันทึกข้อมูล " + Ext.title_panel,
                RemoveCls: "x-box-item",
                collapsible: true,
                collapsed: false,
                defaults: {
                  labelStyle: "width:200px;",
                  allowBlank: true,
                },
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
                  new Ext.form.ComboBox({
                    fieldLabel: "รายจ่ายย่อย",
                    id: "bg_expense_id",
                    name: "bg_expense_id",
                    mode: "local",
                    store: Ext.bg_expense,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    readOnly: readOnly_s,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    width: 500,
                    listeners: {
                      afterrender: function () {
                        this.fn = function () {
                          let data = Ext.DataTemp;

                          Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
                          Ext.bg_budget_overlap.load({
                            params: {
                              i_year: data.i_budget_year_overlap,
                              dc_expense_budget_type_id: data.dc_expense_budget_type_id,
                              dc_cost_id: data.dc_cost_id,
                              bg_expense_id: Ext.getCmp("bg_expense_id").getValue() != "" ? Ext.getCmp("bg_expense_id").getValue() : "0",
                            },
                            callback: function (records, operation, success) {
                              let bg_budget_dtl_overlap_id = "";
                              try {
                                let index_id = Ext.bg_budget_overlap.findExact("id", "" + data.bg_budget_dtl_overlap_id + "");
                                bg_budget_dtl_overlap_id = Ext.bg_budget_overlap.data.items[index_id].id;
                              } catch (err) {}

                              Ext.getCmp("contenterCenter").getEl().unmask();
                              Ext.getCmp("bg_budget_dtl_overlap_id").setValue(bg_budget_dtl_overlap_id);
                              Ext.getCmp("bg_budget_dtl_overlap_id").fn();
                            },
                          });
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
                    xtype: "textfield",
                    fieldLabel: "ปีงบประมาณ",
                    id: "i_budget_year",
                    name: "i_budget_year",
                    width: 200,
                    readOnly: true,
                    listeners: {
                      afterrender: function () {
                        this.fn = function () {
                          this.setValue(parseInt(this.getValue()) + 543);
                        };
                      },
                    },
                  },
                  {
                    xtype: "textfield",
                    fieldLabel: "ใช้เงินปีงบประมาณ",
                    id: "i_budget_year_overlap",
                    name: "i_budget_year_overlap",
                    width: 200,
                    readOnly: true,
                    listeners: {
                      afterrender: function () {
                        this.fn = function () {
                          this.setValue(parseInt(this.getValue()) + 543);
                        };
                      },
                    },
                  },
                  {
                    xtype: "buttongroup",
                    fieldLabel: "เลขที่ใบกันเงิน",
                    frame: false,
                    readOnly: readOnly_s,
                    items: [
                      new Ext.form.ComboBox({
                        fieldLabel: "เลือกใบกันเงิน",
                        id: "bg_budget_dtl_overlap_id",
                        name: "bg_budget_dtl_overlap_id",
                        mode: "local",
                        // readOnly: readOnly_s, // (ปิด / เปิด การแก้ไข้เลขที่ใบกันเงิน)
                        store: Ext.bg_budget_overlap,
                        valueField: "id",
                        displayField: "c_code_ref",
                        triggerAction: "all",
                        forceSelection: true,
                        selectOnFocus: true,
                        typeAhead: false,
                        emptyText: "กรุณาเลือก...",
                        width: 200,
                        listeners: {
                          afterrender: function () {
                            this.fn = function () {
                              if (this.getValue() == "") {
                                Ext.getCmp("id_overlap").hide();
                              } else {
                                Ext.getCmp("id_overlap").show();

                                let c_code_ref = getStoreItems(Ext.bg_budget_overlap, this.getValue(), "c_code_ref");
                                let i_year = getStoreItems(Ext.bg_budget_overlap, this.getValue(), "i_year");
                                let dc_expense_budget_type_name = getStoreItems(Ext.bg_budget_overlap, this.getValue(), "dc_expense_budget_type_name");
                                let dc_cost_name = getStoreItems(Ext.bg_budget_overlap, this.getValue(), "dc_cost_name");
                                let bg_expense_name = getStoreItems(Ext.bg_budget_overlap, this.getValue(), "bg_expense_name");
                                let f_total = getStoreItems(Ext.bg_budget_overlap, this.getValue(), "f_total");
                                let f_cancel = getStoreItems(Ext.bg_budget_overlap, this.getValue(), "f_cancel");

                                f_total = floatRenderer(floatMinus(f_total.replace(/,/g, ""), 2));
                                f_cancel = floatRenderer(floatMinus(f_cancel.replace(/,/g, ""), 2));

                                let text = "";
                                text += "<div>เลขใบกันเงิน : " + c_code_ref + "</div>";
                                text += "<div>ปีที่ใช้งบประมาณ : " + i_year + "</div>";
                                text += "<div>แหล่งเงิน : " + dc_expense_budget_type_name + "</div>";
                                text += "<div>หน่วยงาน : " + dc_cost_name + "</div>";
                                text += "<div>รายจ่ายย่อย : " + bg_expense_name + "</div>";
                                text += "<div>จำนวนเงิน : " + f_total + "</div>";
                                text += "<div>จำนวนเงินยกเลิก : " + f_cancel + "</div>";

                                $("#span_overlap").html(text);
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
                        xtype: "tbspacer",
                        width: 4,
                      },
                      {
                        xtype: "label",
                        style: { color: "red" },
                        text: "* กรณีเป็นใบเบิกเหลื่อมปี",
                      },
                    ],
                  },
                  {
                    xtype: "displayfield",
                    fieldLabel: "&nbsp;",
                    id: "id_overlap",
                    hidden: true,
                    html: "<div id='span_overlap' style='width: 290px; background: #fff; border: 1px solid #b5b8c8; padding: 4px 5px;'>sdfsdf</div>",
                  },
                  {
                    xtype: "datefield",
                    fieldLabel: "วันที่หักงบประมาณ",
                    id: "d_doc_date",
                    readOnly: readOnly_s,
                    width: 200,
                    name: "d_status_date",
                  },
                  {
                    xtype: "textarea",
                    fieldLabel: "คำอธิบายรายการ",
                    id: "c_comment",
                    name: "c_comment",
                    width: 300,
                  },
                  {
                    xtype: "textarea",
                    fieldLabel: "หมายเหตุ",
                    id: "c_comment_status",
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
            text: name_buttom,
            id: "btn_save_hdr",
            iconCls: "icon-save",
            disabled: Ext.butt == "add" || Ext.butt == "edit" ? false : true,
            handler: function () {
              if(Ext.getCmp('i_budget_year_overlap').getValue() != Ext.getCmp('i_budget_year').getValue() && Ext.getCmp('bg_budget_dtl_overlap_id').getValue() == ''){
                var win = new Ext.Window({
                  id: "MessageBox_re",
                  title: "แจ้งเแตือน",
                  modal: true,
                  width: 260,
                  height: 140,
                  html: "<br><center><p style='font-size:12px; color: red;'>รายการนี้เป็นใบเบิกเหลื่อมปี<br>ควรระบุเลขที่ใบกันเงินก่อนบันทึกรายการ<br><b>(คลิก \"บันทึกรายการ\" เพื่อบันทึกรายการ)</b></p></center>",
                  buttonAlign: "left",
                  buttons: [
                    {
                      text: "บันทักรายการ",
                      iconCls: "icon-save",
                      handler: function () {
                        Ext.getCmp("MessageBox_re").hide();
                        Ext.getCmp("MessageBox_re").destroy();
                        saveHdr(true);
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
              }else{
                saveHdr(true);
              }
            },
            // listeners: {
            //   afterrender: function () {
            //     if (Ext.I_STATUS_BEFORE != Ext.dataSelect.i_status_last && Ext.I_STATUS != Ext.dataSelect.i_status_last) {
            //       Ext.getCmp("btn_save_hdr").disable();
            //     } else {
            //       Ext.getCmp("btn_save_hdr").enable();
            //     }
            //   },
            // },
          },
          {
            text: Ext.GLOBAL_BU_BACK_TH,
            handler: function () {
              Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
              Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
            },
          },
        ],
      },
    ],
  });
}; // formAdd
Ext.extend(formAdd, Ext.Panel, {});
