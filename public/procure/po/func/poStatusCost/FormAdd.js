Ext.HDR_ID = null;

Ext.txt_save = "รับคืนทักท้วง";

const saveHdr = function (type) {
  let msg = "";
  if (Ext.pdf_hdr != null) {
    if (Ext.getCmp("i_edit_pdf1IDs1").getValue()) {
      let file1 = Ext.get("upload_pdf1-file").dom.files[0];
      let parts1 = null;
      try {
        parts1 = file1.name.split(".");
      } catch (err) {}
      if (file1 == "" || file1 == undefined) {
        msg = "<span style='white-space: nowrap;'>กรุณาเลือกไฟล์ที่ต้องการ</span><br>";
      } else if (parts1[parts1.length - 1] != "pdf") {
        if (parts1[parts1.length - 1] != "PDF") {
          msg = "<span style='white-space: nowrap;'>กรุณาเลือกไฟล์ (.pdf)</span><br>";
        }
      } else if (file1.size > 512000000) {
        msg = "<span style='white-space: nowrap;'>กรุณาเลือก ไฟล์ PDF ขนาดไม่เกิน 500000 (kB)</span>";
      }
    }

    if (Ext.getCmp("i_edit_pdf2IDs1").getValue()) {
      let file2 = Ext.get("upload_pdf2-file").dom.files[0];
      let parts2 = null;
      try {
        parts2 = file2.name.split(".");
      } catch (err) {}
      if (file2 == "" || file2 == undefined) {
        msg = "<span style='white-space: nowrap;'>กรุณาเลือกไฟล์ที่ต้องการ</span><br>";
      } else if (parts2[parts2.length - 1] != "pdf") {
        if (parts2[parts2.length - 1] != "PDF") {
          msg = "<span style='white-space: nowrap;'>กรุณาเลือกไฟล์ (.pdf)</span><br>";
        }
      } else if (file2.size > 512000000) {
        msg = "<span style='white-space: nowrap;'>กรุณาเลือก ไฟล์ PDF ขนาดไม่เกิน 500000 (kB)</span>";
      }
    }

    if (Ext.getCmp("i_edit_pdf3IDs1").getValue()) {
      let file3 = Ext.get("upload_pdf3-file").dom.files[0];
      let parts3 = null;
      try {
        parts3 = file3.name.split(".");
      } catch (err) {}
      if (file3 == "" || file3 == undefined) {
        msg = "<span style='white-space: nowrap;'>กรุณาเลือกไฟล์ที่ต้องการ</span><br>";
      } else if (parts3[parts3.length - 1] != "pdf") {
        if (parts3[parts3.length - 1] != "PDF") {
          msg = "<span style='white-space: nowrap;'>กรุณาเลือกไฟล์ (.pdf)</span><br>";
        }
      } else if (file3.size > 512000000) {
        msg = "<span style='white-space: nowrap;'>กรุณาเลือก ไฟล์ PDF ขนาดไม่เกิน 500000 (kB)</span>";
      }
    }
  }

  // if (Ext.getCmp("i_edit_pdf1IDs1").getValue() == false && Ext.getCmp("i_edit_pdf2IDs1").getValue() == false && Ext.getCmp("i_edit_pdf3IDs1").getValue() == false) {
  //   msg = "<span style='white-space: nowrap;'>กรุณาเลือกไฟล์เอกสารที่ต้องการแก้ไข</span>";
  // }

  if (Ext.getCmp("form-widgets").getForm().isValid() == false) {
    msg = "<span style='white-space: nowrap;'>กรุณากรอกข้อมูลให้ครบ</span>";
  }

  if (msg == "") {
    Ext.Msg.wait("Uploading...");
    // Ext.store.load({ params: { mode: "" } });
    Ext.getCmp("form-widgets")
      .getForm()
      .submit({
        // waitMsg: "Saving Data...",
        standardSubmit: true,
        url: "api/mn_poEditCost.php",
        params: {
          mode: "PO_EDIT_BY_COST",
          id: Ext.HDR_ID,
          i_status: Ext.dataSelect.i_status_last,
          c_file_name_1: Ext.dataSelect.pdf_hdr,
          c_file_name_2: Ext.dataSelect.pdf_dtl,
          c_file_name_3: Ext.dataSelect.pdf_pay,
          i_PdfUp1: Ext.getCmp("i_edit_pdf1IDs1").getValue(),
          i_PdfUp2: Ext.getCmp("i_edit_pdf2IDs1").getValue(),
          i_PdfUp3: Ext.getCmp("i_edit_pdf3IDs1").getValue(),
        },
        success: function (form, action) {
          let jsonData = action.result; //decode json
          if (jsonData.success == "success") {
            Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + jsonData.msg + "</span>");
            Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not errer
            chkLoadingStore(Ext.myComboStores, "contenterCenter", function () {});
            Ext.po_creditor_transfer.load();
            Ext.po_creditor.load();
            Ext.po_emp.load();
            Ext.store.load();
          } else {
            Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + jsonData.msg + "</span>");
          }
        },
        failure: function (form, action) {
          let jsonData = action.result; //decode json
          Ext.MessageBox.alert("Failed", "<span style='white-space: nowrap;'>ผิดผลาด</span>");
        },
      });
    // Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + jsonData.msg + "</span>");
  } else {
    Ext.Msg.alert("แจ้งเตือน", msg);
  }
}; // saveHdr

// Class Extend
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
        labelWidth: 200,
        bodyStyle: { padding: "10px 20px" },
        defaults: { anchor: "100%", msgTarget: "side" },
        items: [
          {
            layout: "column",
            modal: true,
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
                    RemoveHeight: true,
                    defaults: { xtype: "fieldset", flex: 1, margins: "0px 3px", autoHeight: true },
                    items: [
                      {
                        title: "ข้อมูลรายการ",
                        RemoveCls: "x-box-item",
                        collapsible: false,
                        collapsed: false,
                        border: false,
                        defaults: { labelStyle: "width:200px;" },
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
                            allowBlank: false,
                            name: "c_code_ref",
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
                          new Ext.form.ComboBox({
                            mode: "local",
                            allowBlank: false,
                            fieldLabel: "ปีงบประมาณ",
                            submitValue: true,
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
                          new Ext.form.ComboBox({
                            mode: "local",
                            fieldLabel: "ใช้เงินปีงบประมาณ",
                            allowBlank: false,
                            submitValue: true,
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
                          new Ext.form.ComboBox({
                            mode: "local",
                            store: Ext.dc_expense_budget_type,
                            fieldLabel: "แหล่งเงิน",
                            allowBlank: false,
                            anchor: "90%",
                            submitValue: true,
                            name: "dc_expense_budget_type_idTxt",
                            hiddenName: "dc_expense_budget_type_id", //bg_expense_group_id
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
                          }),
                          new Ext.form.ComboBox({
                            mode: "local",
                            store: Ext.bg_expense,
                            allowBlank: false,
                            valueField: "id",
                            displayField: "c_name",
                            anchor: "90%",
                            submitValue: true,
                            name: "c_detail",
                            hiddenName: "bg_expense_id",
                            id: "bg_expense_id",
                            triggerAction: "all",
                            allBlank: true,
                            forceSelection: true,
                            selectOnFocus: true,
                            fieldLabel: "รายการย่อย",
                            width: 200,
                            typeAhead: false,
                            emptyText: "กรุณาเลือกใช้จ่าย...",
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
                                console.log(this);
                              },
                            },
                          }),
                          new Ext.form.ComboBox({
                            mode: "local",
                            store: Ext.dc_cost,
                            readOnly: true,
                            allowBlank: false,
                            anchor: "90%",
                            fieldLabel: "หน่วยงานที่รับผิดชอบ",
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
                              change: function (combo, newValue) {
                                if (newValue == "" && Ext.SS_I_TYPE_USER == 3) {
                                  Ext.getCmp("dc_cost_idID").setValue(Ext.SS_DC_COST_ID);
                                  Ext.getCmp("dc_cost_idID").readOnly = true;
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
                            mode: "local",
                            store: Ext.po_creditor,
                            allowBlank: false,
                            valueField: "id",
                            displayField: "c_name",
                            anchor: "90%",
                            submitValue: true,
                            name: "po_creditor_name",
                            hiddenName: "po_creditor_id",
                            id: "po_creditor_idID",
                            triggerAction: "all",
                            forceSelection: false,
                            allBlank: true,
                            selectOnFocus: true,
                            fieldLabel: "จ่ายให้",
                            width: 200,
                            typeAhead: false,
                            emptyText: "กรุณาเลือก...",
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
                          }),
                          new Ext.form.ComboBox({
                            mode: "local",
                            store: Ext.po_creditor_transfer,
                            valueField: "id",
                            allowBlank: false,
                            displayField: "c_name",
                            anchor: "90%",
                            submitValue: true,
                            name: "po_creditor_transfer_name",
                            hiddenName: "po_creditor_transfer_id",
                            id: "po_creditor_transfer_id",
                            triggerAction: "all",
                            forceSelection: false,
                            allBlank: true,
                            selectOnFocus: true,
                            fieldLabel: "โดยมอบให้",
                            width: 200,
                            typeAhead: false,
                            emptyText: "กรุณาเลือก...",
                            listeners: {
                              beforequery: function (q) {
                                if (q.query) {
                                  var length = q.query.length;
                                  q.query = new RegExp(Ext.escapeRe(q.query));
                                  q.query.length = length;
                                  console.log(Ext.selectRow);
                                }
                              },
                              blur: function () {
                                this.getStore().clearFilter();
                              },
                            },
                          }),
                          {
                            xtype: "textfield",
                            allowBlank: false,
                            anchor: "90%",
                            fieldLabel: "เลขที่ใบแจ้งหนี้",
                            name: "c_code_invoice",
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
                            xtype: "container",
                            layout: "hbox",
                            align: "stretch",
                            RemoveHeight: true,
                            width: 680,
                            defaults: { xtype: "fieldset", flex: 1, margins: "0px 3px", autoHeight: true },
                            items: [
                              {
                                title: Ext.file_edit_enable == 1 ? "แก้ไขเอกสาร" : "แสดงเอกสาร",
                                RemoveCls: "x-box-item",
                                collapsible: false,
                                collapsed: false,
                                defaults: { labelStyle: "width:200px;", allowBlank: true },
                                items: [
                                  {
                                    xtype: "buttongroup",
                                    frame: false,
                                    items: [
                                      { xtype: "tbspacer", width: 187 },
                                      {
                                        xtype: "checkboxgroup",
                                        fieldLabel: "",
                                        name: "i_edit_pdf1",
                                        id: "i_edit_pdf1ID",
                                        columns: 1,
                                        items: [
                                          {
                                            name: "i_edit_pdf1s1",
                                            id: "i_edit_pdf1IDs1",
                                            boxLabel: "",
                                            inputValue: 1,
                                          },
                                        ],
                                        listeners: {
                                          afterrender: function () {
                                            if (Ext.file_edit_enable != 1) {
                                              Ext.getCmp("i_edit_pdf1ID").hide();
                                            }
                                            if (Ext.pdf_hdr == null) {
                                              Ext.getCmp("i_edit_pdf1ID").hide();
                                            }
                                          },
                                          change: function (combo, newValue) {
                                            if (Ext.getCmp("i_edit_pdf1IDs1").getValue() == true) {
                                              Ext.getCmp("upload_pdf1").show();
                                            } else {
                                              Ext.getCmp("upload_pdf1").hide();
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
                                        text: "ดาวน์โหลดเอกสารใบเบิก",
                                        handler: function () {
                                          if (Ext.i_is_url_pdf_hdr == 0) {
                                            Po_OpenPdf(Ext.pdf_hdr, document.getElementsByName("c_code_ref")[0].value);
                                            // window.open(Ext.part_file_pdf + Ext.pdf_pay + "?pdf=" + Math.floor(Math.random() * 100000), "_blank");
                                          }
                                        },
                                        listeners: {
                                          afterrender: function () {
                                            if (Ext.pdf_hdr == null) {
                                              Ext.getCmp("btn_pdf1").hide();
                                            } else if (Ext.dataSelect.i_status_edit != 1) {
                                              Ext.getCmp("btn_pdf1").hide();
                                            }
                                          },
                                        },
                                      },
                                    ],
                                  },
                                  {
                                    xtype: "fileuploadfield",
                                    id: "upload_pdf1",
                                    width: 300,
                                    emptyText: "แก้ไขเอกสารใบขอเบิก* เลือกไฟล์ (.pdf)",
                                    fieldLabel: "",
                                    name: "upload_pdf1",
                                    buttonText: "",
                                    buttonCfg: {
                                      iconCls: "icon-pdf",
                                    },
                                    listeners: {
                                      afterrender: function () {
                                        Ext.getCmp("upload_pdf1").hide();
                                      },
                                    },
                                  },
                                  {
                                    xtype: "buttongroup",
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
                                          },
                                        ],
                                        listeners: {
                                          afterrender: function () {
                                            if (Ext.file_edit_enable != 1) {
                                              Ext.getCmp("i_edit_pdf2ID").hide();
                                            }
                                            if (Ext.pdf_dtl == null) {
                                              Ext.getCmp("i_edit_pdf2ID").hide();
                                            }
                                          },
                                          change: function (combo, newValue) {
                                            if (Ext.getCmp("i_edit_pdf2IDs1").getValue() == true) {
                                              Ext.getCmp("upload_pdf2").show();
                                            } else {
                                              Ext.getCmp("upload_pdf2").hide();
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
                                            Po_OpenPdf(Ext.pdf_dtl, document.getElementsByName("c_code_ref")[0].value);
                                            // window.open(Ext.part_file_pdf + Ext.pdf_pay + "?pdf=" + Math.floor(Math.random() * 100000), "_blank");
                                          }
                                        },
                                        listeners: {
                                          afterrender: function () {
                                            if (Ext.pdf_dtl == null) {
                                              Ext.getCmp("btn_pdf2").hide();
                                            } else if (Ext.dataSelect.i_status_edit != 1) {
                                              Ext.getCmp("btn_pdf2").hide();
                                            }
                                          },
                                        },
                                      },
                                    ],
                                  },
                                  {
                                    xtype: "fileuploadfield",
                                    id: "upload_pdf2",
                                    width: 300,
                                    emptyText: "แก้ไขเอกสารประกอบใบเบิก* เลือกไฟล์ (.pdf)",
                                    fieldLabel: "",
                                    name: "upload_pdf2",
                                    buttonText: "",
                                    buttonCfg: {
                                      iconCls: "icon-pdf",
                                    },
                                    listeners: {
                                      afterrender: function () {
                                        Ext.getCmp("upload_pdf2").hide();
                                      },
                                    },
                                  },
                                  {
                                    xtype: "buttongroup",
                                    frame: false,
                                    items: [
                                      { xtype: "tbspacer", width: 187 },
                                      {
                                        xtype: "checkboxgroup",
                                        fieldLabel: "",
                                        name: "i_edit_pdf3",
                                        id: "i_edit_pdf3ID",
                                        columns: 1,

                                        items: [
                                          {
                                            name: "i_edit_pdf3s1",
                                            id: "i_edit_pdf3IDs1",
                                            boxLabel: "",
                                            inputValue: 1,
                                          },
                                        ],
                                        listeners: {
                                          afterrender: function () {
                                            if (Ext.pdf_pay == null) {
                                              Ext.getCmp("i_edit_pdf3ID").hide();
                                            }
                                          },
                                          change: function (combo, newValue) {
                                            if (Ext.getCmp("i_edit_pdf3IDs1").getValue() == true) {
                                              Ext.getCmp("upload_pdf3").show();
                                            } else {
                                              Ext.getCmp("upload_pdf3").hide();
                                            }
                                          },
                                        },
                                      },
                                      { xtype: "tbspacer", width: 5 },
                                      {
                                        xtype: "button",
                                        id: "btn_pdf3",
                                        iconCls: "icon-pdf",
                                        fieldLabel: " ",
                                        text: "ดาวน์โหลดเอกสารการจ่ายเงิน",
                                        handler: function () {
                                          if (Ext.i_is_url_pdf_hdr == 0) {
                                            Po_OpenPdf(Ext.pdf_pay, document.getElementsByName("c_code_ref")[0].value);
                                            // window.open(Ext.part_file_pdf + Ext.pdf_pay + "?pdf=" + Math.floor(Math.random() * 100000), "_blank");
                                          }
                                        },
                                        listeners: {
                                          afterrender: function () {
                                            if (Ext.pdf_pay == null) {
                                              Ext.getCmp("btn_pdf3").hide();
                                            } else if (Ext.dataSelect.i_status_edit != 1) {
                                              Ext.getCmp("btn_pdf3").hide();
                                            }
                                          },
                                        },
                                      },
                                    ],
                                  },
                                  {
                                    xtype: "fileuploadfield",
                                    id: "upload_pdf3",
                                    width: 300,
                                    emptyText: "แก้ไขเอกสารการจ่ายเงิน* เลือกไฟล์ (.pdf)",
                                    fieldLabel: "",
                                    name: "upload_pdf3",
                                    buttonText: "",
                                    buttonCfg: {
                                      iconCls: "icon-pdf",
                                    },
                                    listeners: {
                                      afterrender: function () {
                                        Ext.getCmp("upload_pdf3").hide();
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
              },
              {
                // column 1
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
                    defaults: { xtype: "fieldset", flex: 1, margins: "0px 3px", autoHeight: true },
                    items: [
                      {
                        title: "รายละเอียดการขอเบิก",
                        RemoveCls: "x-box-item",
                        collapsible: false,
                        collapsed: false,
                        border: false,
                        defaults: { labelStyle: "width:200px;" },
                        items: [
                          {
                            xtype: "textfield",
                            fieldLabel: "จำนวนรายการ",
                            name: "c_qty",
                            allowBlank: false,
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
                            allowBlank: false,
                            fieldLabel: "จำนวนเงินขอเบิก",
                            name: "f_total",
                            id: "f_total",
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
                            },
                          },
                          // {
                          //   xtype: "textfield",
                          //   fieldLabel: "จำนวนเงินขอเบิก",
                          //   id: "f_total",
                          //   name: "f_total",
                          //   style: "text-align: right; font-weight: bold;",
                          //   width: 200,
                          //   readOnly: true,
                          //   listeners: {
                          //     afterrender: function () {
                          //       this.fn = function () {
                          //         let value = floatMinus(this.getValue().replace(/,/g, ""), 2);
                          //         this.setValue(floatRenderer(value));
                          //       };
                          //     },
                          //     Change: function (value) {
                          //       this.fn();
                          //     },
                          //   },
                          // },
                          {
                            xtype: "datefield",
                            fieldLabel: "วันที่ตรวจรับ",
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
                            hiddenName: "po_emp_id", //bg_expense_group_id
                            name: "po_emp_name",
                            valueField: "id",
                            displayField: "c_name",
                            triggerAction: "all",
                            forceSelection: false,
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
                          {
                            xtype: "datefield",
                            allowBlank: false,
                            fieldLabel: "วันที่ใบขอเบิก",
                            name: "d_doc_date",
                          },
                          {
                            xtype: "textarea",
                            allowBlank: false,
                            fieldLabel: "คำอธิบายรายการ",
                            name: "c_comment",
                            validator: function (val) {
                              return true;
                            },
                            width: 200,
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
        buttonAlign: "left",
        buttons: [
          {
            text: "&nbsp;แก้ไขเอกสาร&nbsp;",
            iconCls: "icon-save",
            disabled: Ext.file_edit_enable == 1 ? false : true,
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
