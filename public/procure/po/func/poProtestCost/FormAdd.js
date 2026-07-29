Ext.HDR_ID = null;

Ext.txt_save = "ส่งทักท้วง";

WinParent = function (type) {
  var comboBgYear = new Ext.form.ComboBox({
    mode: "local",
    fieldLabel: "ปีงบประมาณ",
    allowBlank: false,
    submitValue: true,
    hiddenName: "i_budget_year",
    name: "i_budget_yearTxt",
    store: store_year,
    valueField: "id",
    displayField: "c_name",
    // value: Ext.bgYear,
    triggerAction: "all",
    forceSelection: true,
    selectOnFocus: true,
    typeAhead: false,
    emptyText: "กรุณาเลือกปีงบประมาณ...",
    value: Ext.dataSelect.i_budget_year,
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
    allowBlank: false,
    submitValue: true,
    hiddenName: "i_budget_year_overlap",
    name: "i_budget_year_overlapTxt",
    store: store_year,
    valueField: "id",
    displayField: "c_name",
    value: Ext.bgYear,
    triggerAction: "all",
    forceSelection: true,
    selectOnFocus: true,
    typeAhead: false,
    emptyText: "กรุณาเลือกปีงบประมาณ...",
    value: Ext.dataSelect.i_budget_year_overlap,
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
    store: Ext.dc_expense_budget_type2,
    allowBlank: false,
    fieldLabel: "แหล่งเงิน",
    anchor: "100%",
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
    value: Ext.dataSelect.dc_expense_budget_type_id,
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
    store: Ext.bg_expense,
    allowBlank: false,
    valueField: "id",
    displayField: "c_name",
    anchor: "100%",
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
    value: Ext.dataSelect.bg_expense_id,
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
  });
  var comboCost = new Ext.form.ComboBox({
    mode: "local",
    store: Ext.dc_cost,
    anchor: "100%",
    allowBlank: false,
    fieldLabel: "หน่วยงานที่รับผิดชอบ",
    valueField: "id",
    displayField: "c_name",
    hiddenName: "dc_cost_id",
    name: "c_cost_name",
    triggerAction: "all",
    forceSelection: true,
    selectOnFocus: true,
    typeAhead: false,
    emptyText: "กรุณาเลือก...",
    readOnly: true,
    value: Ext.dataSelect.dc_cost_id,

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
  var comboCreditor = new Ext.form.ComboBox({
    mode: "local",
    store: Ext.po_creditor,
    allowBlank: false,
    valueField: "id",
    displayField: "c_name",
    anchor: "100%",
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
    emptyText: "กรุณาเลือกคีย์เพิ่มหรือว่างไว้",
    value: Ext.dataSelect.po_creditor_id,
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
    store: Ext.po_creditor_transfer,
    allowBlank: false,
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
    fieldLabel: "โดยมอบให้",
    width: 200,
    typeAhead: false,
    emptyText: "กรุณาเลือกคีย์เพิ่มหรือว่างไว้",
    value: Ext.dataSelect.po_creditor_id,
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
  var comboEmp = new Ext.form.ComboBox({
    mode: "local",
    store: Ext.po_emp,
    allowBlank: false,
    anchor: "100%",
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
    emptyText: "กรุณาเลือกคีย์เพิ่มหรือว่างไว้",
    value: Ext.dataSelect.po_emp_id,
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
    allowBlank: false,
    anchor: "100%",
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
    hidden: true,
    value: Ext.dataSelect.dc_approve_id,

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

  saveParent = function () {
    var form = Ext.getCmp("Form-Parent").getForm();
    if (form.isValid()) {
      var msg = "";
      let file1 = Ext.get("upload_pdf11-file").dom.files[0];
      let parts1 = null;
      try {
        parts1 = file1.name.split(".");
      } catch (err) {}

      let file2 = Ext.get("upload_pdf22-file").dom.files[0];
      let parts2 = null;
      try {
        parts2 = file2.name.split(".");
      } catch (err) {}

      if (file1 == "" || file1 == undefined || file2 == "" || file2 == undefined) {
        msg += "<span style='white-space: nowrap;'>กรุณาเลือกไฟล์ให้ครบ</span><br>";
      } else if (parts1[parts1.length - 1] != "pdf" || parts2[parts2.length - 1] != "pdf") {
        if (parts1[parts1.length - 1] != "PDF" || parts2[parts2.length - 1] != "PDF") {
          msg += "<span style='white-space: nowrap;'>กรุณาเลือกไฟล์ (.pdf)</span><br>";
        }
      }

      if (file1.size > 512000000 || file2.size > 512000000) {
        msg += "<span style='white-space: nowrap;'>กรุณาเลือก ไฟล์ PDF ขนาดไม่เกิน 500000 (kB)</span>";
      }
      if (msg != "") {
        Ext.MessageBox.alert("แจ้งเตือน", msg);
        return;
      }
      form.submit({
        waitMsg: "Saving Data...",
        success: function (form, action) {
          if (action.result.success == "Success" || action.result.success == true) {
            Ext.Msg.alert("Success", action.result.msg, function (form, action) {
              Ext.getCmp("tabpanel1").getStore().reload();
              Ext.selectRow = null;
              Ext.getCmp("win-Parent").hide();
              Ext.getCmp("win-Parent").destroy();
              Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
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
    } else {
      Ext.MessageBox.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>กรุณากรอกข้อมูลให้ครบ</span>");
    }
  };

  var window = new Ext.Window({
    collapsible: true,
    maximizable: true,
    title: "เพิ่มใบเบิกโดยการยกเลิกใบเบิกเดิม",
    width: 1200,
    id: "win-Parent",
    height: 500,
    minWidth: 850,
    minHeight: 450,
    layout: "fit",
    modal: true,
    plain: true,
    bodyStyle: "padding:1px;",
    buttonAlign: "center",
    items: new Ext.FormPanel({
      id: "Form-Parent",
      url: "reg/controller/mnPoWorkingHdrBegin.php",
      fileUpload: true,
      frame: true,
      labelAlign: "left",
      bodyStyle: "padding:1px",
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
            /* validator: function (val) {
               if (!Ext.isEmpty(val)) {
                 return true;
               } else {
                 if (this.hiddenName === "bg_expense_id") return true;
                 if (this.hiddenName === "po_creditor_id") return true;
                 if (this.hiddenName === "po_creditor_transfer_id") return true;
                 else return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
               }
             },*/
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
          autoScroll: true,
          loadMask: true,
          items: [
            {
              xtype: "hidden",
              name: "id",
              value: "",
            },
            {
              xtype: "hidden",
              name: "Parent_Mode",
              value: "1",
            },
            {
              xtype: "hidden",
              name: "po_working_hdr_id",
            },
            {
              xtype: "hidden",
              name: "po_working_dtl_id",
            },
            {
              xtype: "radiogroup",
              hidden: true,
              columns: [100, 200],
              id: "i_is_parentID",
              fieldLabel: "สถานะรายการ",
              items: [
                {
                  name: "i_is_parent",
                  id: "i_is_parent1ID",
                  inputValue: 1,
                  boxLabel: "ทำรายการใหม่",
                },
                {
                  name: "i_is_parent",
                  id: "i_is_parent2ID",
                  checked: true,
                  inputValue: 2,
                  boxLabel: "เพิ่มรายการโดยการยกเลิกใบเบิกเดิม",
                },
              ],
            },
            {
              xtype: "hidden",
              id: "i_parent_idID",
              name: "i_parent_id",
              value: Ext.dataSelect.id,
              // fieldLabel: "เลือกเลขที่ใบเบิกที่ยกเลิก",
            },
            {
              xtype: "textfield",
              id: "txti_parentID",
              fieldLabel: "เลขที่ใบเบิกที่ยกเลิก",
              value: Ext.dataSelect.c_code,
              // style: "text-align: center;font-weight:bold;background:#eee;",
              readOnly: true,
              style: {
                "font-weight": "bold",
                padding: "1px",
                margin: "1px",
                color: "red",
                "background-color": "#eee !important",
                "text-align": "center",
              },
            },
            {
              xtype: "textfield",
              fieldLabel: "เลขที่ใบขอเบิก",
              allowBlank: false,
              name: "c_code_ref",
              value: Ext.dataSelect.c_code,
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
            comboBgYear,
            comboUsedBgYear,
            comboTypeBg,
            comboExpense,
            comboCost,
            comboCreditor,
            comboCreditortransfer,

            {
              xtype: "textfield",
              anchor: "100%",
              fieldLabel: "เลขที่ใบแจ้งหนี้",
              allowBlank: false,
              name: "c_code_invoice",
              enableKeyEvents: true,
              value: Ext.dataSelect.c_code_invoice,
              listeners: {
                keyup: function (me, e) {
                  var maxlength = 255;
                  if (me.getValue().length >= maxlength) {
                    var newval = me.getValue().substring(0, maxlength);
                    me.setValue(newval);
                  }
                },
              },
              // style: {
              //   "font-weight": "bold",
              //   padding: "1px",
              //   margin: "1px",
              //   color: "#000",
              //   "background-color": "#eee !important",
              //   "text-align": "center",
              // },
            },
            {
              xtype: "fileuploadfield",
              id: "upload_pdf11",
              allowBlank: false,
              width: "100%",
              emptyText: "เลือกไฟล์ (.pdf)",
              fieldLabel: "เอกสารใบเบิก (PDF)",
              name: "upload_pdf1",
              buttonText: "",
              buttonCfg: {
                iconCls: "icon-pdf",
              },
              listeners: {},
            },
            {
              xtype: "fileuploadfield",
              id: "upload_pdf22",
              allowBlank: false,
              width: "100%",
              emptyText: "เลือกไฟล์ (.pdf)",
              fieldLabel: "เอกสารประกอบใบเบิก (PDF)",
              name: "upload_pdf2",
              buttonText: "",
              buttonCfg: {
                iconCls: "icon-pdf",
              },
              listeners: {},
            },
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
              value: Ext.dataSelect.c_qty,
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
              fieldLabel: "จำนวนเงิน",
              name: "f_total",
              id: "f_totalID",
              value: Ext.dataSelect.f_total,
              listeners: {
                blur: function () {
                  var f_total = parseFloat(this.getValue().replace(/,/g, "") / 1);
                  this.setValue(Ext.floatRenderer(f_total));
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
            {
              xtype: "datefield",
              fieldLabel: "วันที่ตรวจรับ",
              name: "d_audit_date",
              id: "d_audit_date",
              value: Ext.dataSelect.d_audit_date,
            },
            comboEmp,
            {
              xtype: "datefield",
              fieldLabel: "วันที่ใบขอเบิก",
              name: "d_doc_date",
              value: Ext.dataSelect.d_doc_date,
            },
            document_inspector,
            {
              xtype: "datefield",
              hidden: true,
              fieldLabel: "วันที่ฝ่ายคลังรับใบขอเบิก",
              name: "d_inv_date",
              // value: Ext.dataSelect.d_inv_date,
              value: addY(543),
            },
            {
              xtype: "buttongroup",
              fieldLabel: "วันที่ส่งใบขอเบิก",
              hidden: true,
              frame: false,
              border: false,
              items: [
                {
                  xtype: "datefield",
                  name: "d_approve_date",
                  // value: Ext.dataSelect.d_approve_date1,
                  value: addY(543),
                  validator: function (val) {
                    if (!Ext.isEmpty(val)) {
                      return true;
                    } else {
                      return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                    }
                  },
                },
                {
                  xtype: "tbspacer",
                  width: 4,
                },
                {
                  xtype: "label",
                  style: { color: "red" },
                  text: "* เริ่มต้นนับวัน",
                },
              ],
            },

            {
              xtype: "radiogroup",
              columns: [80, 70],
              id: "i_enableID",
              hidden: true,
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
                  id: "i_enable2ID",
                  inputValue: 2,
                  //                                                  checked : true ,
                  boxLabel: "ยกเลิก",
                },
              ],
            },
            {
              xtype: "textarea",
              fieldLabel: "คำอธิบายรายการ",
              name: "c_comment",
              value: Ext.dataSelect.c_comment,
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
            {
              xtype: "hidden",
              id: "modesubID",
              name: "mode",
              value: "ADD",
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
            saveParent();
          },
        },
        {
          text: Ext.GLOBAL_BU_BACK_TH,
          handler: function () {
            Ext.getCmp("win-Parent").hide();
            Ext.getCmp("win-Parent").destroy();
          },
        },
      ],
    }),
  }).show();
};

// if ((Ext.getCmp("c_url_pdf_hdr").getValue() == "" && Ext.getCmp("c_url_pdf_dtl").getValue() != "") || (Ext.getCmp("c_url_pdf_hdr").getValue() != "" && Ext.getCmp("c_url_pdf_dtl").getValue() == "")) {
const saveHdr = function (type) {
  let msg = "";

  if (Ext.getCmp("d_receive_date").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณากรอก วันที่รับคืน</span><br>";
  }
  if (Ext.pdf_hdr != null) {
    // let file1 = Ext.get("upload_pdf1-file").dom.files[0];
    // let parts1 = null;
    // try {
    //   parts1 = file1.name.split(".");
    // } catch (err) {}
    // let file2 = Ext.get("upload_pdf2-file").dom.files[0];
    // let parts2 = null;
    // try {
    //   parts2 = file1.name.split(".");
    // } catch (err) {}

    // if (file1 == "" || file1 == undefined || file2 == "" || file2 == undefined) {
    //   msg += "<span style='white-space: nowrap;'>กรุณาเลือกไฟล์ให้ครบ</span><br>";
    // } else if (parts1[parts1.length - 1] != "pdf" || parts2[parts2.length - 1] != "pdf") {
    //   if (parts1[parts1.length - 1] != "PDF" || parts2[parts2.length - 1] != "PDF") {
    //     msg += "<span style='white-space: nowrap;'>กรุณาเลือกไฟล์ (.pdf)</span><br>";
    //   }
    // }
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
  }
  // if ((Ext.getCmp("c_url_pdf_hdr").getValue() == "" && Ext.getCmp("c_url_pdf_dtl").getValue() != "") || (Ext.getCmp("c_url_pdf_hdr").getValue() != "" && Ext.getCmp("c_url_pdf_dtl").getValue() == "")) {
  //   msg += "<span style='white-space: nowrap;'>- กรุณากรอก เอกสารใบเบิก (URL) และ เอกสารประกอบใบเบิก (URL)</span><br>";
  // }

  if (msg == "") {
    Ext.Msg.wait("uploading...");
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
        pdf_hdr: Ext.getCmp("i_edit_pdf1IDs1").getValue() == true ? Ext.HDR_ID + "_" + Ext.I_STATUS + "_hdr.pdf" : Ext.pdf_hdr,
        pdf_dtl: Ext.getCmp("i_edit_pdf2IDs1").getValue() == true ? Ext.HDR_ID + "_" + Ext.I_STATUS + "_dtl.pdf" : Ext.pdf_dtl,
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
          if ((Ext.pdf_hdr != null && Ext.getCmp("i_edit_pdf1IDs1").getValue() == true) || (Ext.pdf_hdr != null && Ext.getCmp("i_edit_pdf2IDs1").getValue() == true)) {
            Ext.getCmp("form-widgets")
              .getForm()
              .submit({
                standardSubmit: true,
                url: "api/mn_poWorking.php",
                params: {
                  mode: "SEND_RECEIVE_UPLOADFILE_CUSTOM",
                  id: Ext.HDR_ID,
                  i_status: Ext.I_STATUS,
                },
                success: function (result, request) {
                  if (type) {
                    Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>บันทึกเรียบร้อย</span>");
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
            Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>บันทึกเรียบร้อย</span>");
            Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not errer
          }
        } else {
          Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + jsonData.msg + "</span>");
          // Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not errer
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
    title: "ข้อมูลส่งทักท้วง",
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
                title: "บันทึกข้อมูล ส่งทักท้วง",
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
                    listeners: {
                      afterrender: function () {
                        if (Ext.SS_I_TYPE_USER == 3) {
                          this.setReadOnly(true);
                        }
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
                            Po_OpenPdf(Ext.pdf_hdr, document.getElementsByName("c_code")[0].value);
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
                            Po_OpenPdf(Ext.pdf_dtl, document.getElementsByName("c_code")[0].value);
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
                  // {
                  //   xtype: "fileuploadfield",
                  //   id: "upload_pdf1",
                  //   width: "400",
                  //   emptyText: "เลือกไฟล์ (.pdf)",
                  //   fieldLabel: "เอกสารใบเบิก (PDF)",
                  //   name: "upload_pdf1",
                  //   buttonText: "",
                  //   buttonCfg: {
                  //     iconCls: "icon-pdf",
                  //   },
                  //   listeners: {
                  //     afterrender: function () {
                  //       // if (Ext.selectRow.length == 0) {
                  //       // } else {
                  //       if (Ext.dataSelect.pdf_hdr == undefined) {
                  //         Ext.getCmp("upload_pdf1").hide();
                  //       }
                  //       // }
                  //     },
                  //   },
                  // },
                  // {
                  //   xtype: "fileuploadfield",
                  //   id: "upload_pdf2",
                  //   width: "400",
                  //   emptyText: "เลือกไฟล์ (.pdf)",
                  //   fieldLabel: "เอกสารประกอบใบเบิก (PDF)",
                  //   name: "upload_pdf2",
                  //   buttonText: "",
                  //   buttonCfg: {
                  //     iconCls: "icon-pdf",
                  //   },
                  //   listeners: {
                  //     afterrender: function () {
                  //       // if (Ext.selectRow.length == 0) {
                  //       //   // Ext.getCmp("upload_pdf2").hide();
                  //       // } else {
                  //       if (Ext.dataSelect.pdf_hdr == undefined) {
                  //         Ext.getCmp("upload_pdf2").hide();
                  //       }
                  //       // }
                  //     },
                  //   },
                  // },
                  // {
                  //   xtype: "button",
                  //   id: "btn_pdf1",
                  //   width: 200,
                  //   iconCls: "icon-pdf",
                  //   fieldLabel: "เอกสารใบเบิก (PDF)",
                  //   text: "เอกสารใบเบิก",
                  //   handler: function () {
                  //     if (Ext.i_is_url_pdf_hdr == 0) {
                  //       Po_OpenPdf(Ext.pdf_hdr, document.getElementsByName("c_code")[0].value);
                  //       // window.open(Ext.part_file_pdf + Ext.pdf_hdr + "?pdf=" + Math.floor(Math.random() * 100000), "_blank");
                  //     } else if (Ext.i_is_url_pdf_hdr == 1) {
                  //       window.open(Ext.pdf_hdr);
                  //     }
                  //   },
                  //   listeners: {
                  //     afterrender: function () {
                  //       // if (Ext.dataSelect.length == 0) {
                  //       //   Ext.getCmp("btn_pdf1").hide();
                  //       // } else {
                  //       if (Ext.dataSelect.pdf_hdr == null) {
                  //         Ext.getCmp("btn_pdf1").hide();
                  //       } else {
                  //         Ext.getCmp("upload_pdf1").hide();
                  //       }
                  //       // }
                  //     },
                  //   },
                  // },
                  // {
                  //   xtype: "button",
                  //   id: "btn_pdf2",
                  //   width: 200,
                  //   iconCls: "icon-pdf",
                  //   fieldLabel: "เอกสารประกอบใบเบิก (PDF)",
                  //   text: "เอกสารประกอบใบเบิก",
                  //   handler: function () {
                  //     if (Ext.i_is_url_pdf_dtl == 0) {
                  //       Po_OpenPdf(Ext.pdf_dtl, document.getElementsByName("c_code")[0].value);
                  //       // window.open(Ext.part_file_pdf + Ext.pdf_dtl + "?pdf=" + Math.floor(Math.random() * 100000), "_blank");
                  //     } else if (Ext.i_is_url_pdf_dtl == 1) {
                  //       window.open(Ext.pdf_dtl);
                  //     }
                  //   },
                  //   listeners: {
                  //     afterrender: function () {
                  //       // if (Ext.selectRow.length == 0) {
                  //       //   Ext.getCmp("btn_pdf2").hide();
                  //       // }else{
                  //       if (Ext.dataSelect.pdf_hdr == null) {
                  //         Ext.getCmp("btn_pdf2").hide();
                  //       } else {
                  //         Ext.getCmp("upload_pdf2").hide();
                  //       }
                  //       // }
                  //     },
                  //   },
                  // },
                  // {
                  //   xtype: "checkboxgroup",
                  //   fieldLabel: "",
                  //   name: "i_edit_pdf",
                  //   id: "i_edit_pdfID",
                  //   columns: 1,
                  //   items: [
                  //     {
                  //       name: "i_edit_pdfs1",
                  //       id: "i_edit_pdfIDs1",
                  //       boxLabel: "แก้ไขเอกสาร",
                  //       inputValue: 1,
                  //     },
                  //   ],
                  //   listeners: {
                  //     afterrender: function () {
                  //       // if (Ext.selectRow.length == 0) {
                  //       //   Ext.getCmp("i_edit_pdfID").hide();
                  //       // }else{
                  //       if (Ext.dataSelect.pdf_hdr == undefined) {
                  //         Ext.getCmp("i_edit_pdfID").hide();
                  //       }
                  //       // }
                  //     },
                  //     change: function (combo, newValue) {
                  //       if (Ext.getCmp("i_edit_pdfIDs1").getValue() == true) {
                  //         Ext.getCmp("upload_pdf1").show();
                  //         Ext.getCmp("upload_pdf2").show();
                  //         Ext.getCmp("btn_pdf1").hide();
                  //         Ext.getCmp("btn_pdf2").hide();
                  //       } else {
                  //         Ext.getCmp("upload_pdf1").hide();
                  //         Ext.getCmp("upload_pdf2").hide();
                  //         Ext.getCmp("btn_pdf1").show();
                  //         Ext.getCmp("btn_pdf2").show();
                  //       }
                  //     },
                  //   },
                  //   // listeners: {
                  //   //   afterrender: function () {
                  //   //     if (Ext.buAct == "update") {
                  //   //       if (Ext.selectRow.get("i_type_fix_rate") == true) {
                  //   //         Ext.getCmp("i_type_fix_rateIDs1").setValue(true);
                  //   //       }
                  //   //     }
                  //   //   },
                  //   // },
                  // },
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
          { xtype: "tbspacer", width: 170 },
          {
            text: "&nbsp;เพิ่มใบเบิกโดยการยกเลิกใบเบิกเดิม&nbsp;",
            iconCls: "icon-build",
            handler: function () {
              WinParent(true);
            },
          },
        ],
      },
    ],
  });
}; // formAdd
Ext.extend(formAdd, Ext.Panel, {});
