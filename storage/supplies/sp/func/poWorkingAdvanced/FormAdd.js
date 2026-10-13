Ext.HDR_ID = null;

const saveHdr = function (type) {
  let msg = "";

  if (Ext.getCmp("dc_expense_budget_type_id").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณาเลือก แหล่งเงิน</span><br>";
  }
  if (Ext.getCmp("i_budget_year").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณาเลือก ปีงบประมาณ</span><br>";
  }
  if (Ext.getCmp("i_budget_year_overlap").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณาเลือก ใช้เงินปีงบประมาณ</span><br>";
  }
  if (Ext.getCmp("dc_expense_budget_type_id").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณาเลือก แหล่งเงิน</span><br>";
  }
  if (Ext.getCmp("dc_cost_id").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณาเลือก หน่วยงานที่รับผิดชอบ</span><br>";
  }
  if (Ext.getCmp("po_creditor_id").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณาเลือก จ่ายให้</span><br>";
  }
  if (Ext.getCmp("po_creditor_transfer_id").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณาเลือก โดยมอบให้</span><br>";
  }
  if (Ext.getCmp("c_qty").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณากรอก จำนวนรายการ</span><br>";
  }
  if (Ext.getCmp("f_total").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณากรอก จำนวนเงิน</span><br>";
  }
  if (Ext.getCmp("d_doc_date").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณากรอก วันที่ใบขอเบิก</span><br>";
  }
  if (Ext.getCmp("dc_approve_id").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณาเลือก ผู้ตรวจอนุมัติฎีกา</span><br>";
  }
  if (Ext.getCmp("c_approve").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณากรอก เลขที่ฏีกา</span><br>";
  }
  if (Ext.getCmp("d_approve_date").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณากรอก วันที่อนุมัติฏีกา</span><br>";
  }

  if (msg == "") {
    Ext.getCmp("frm-Add").getEl().mask("Please wait...", "x-mask-loading");
    Ext.Ajax.request({
      url: "api/mn_poWorkingAdvanced.php",
      method: "POST",
      params: {
        mode: "EDIT",
        id: Ext.HDR_ID,
        i_budget_year: Ext.getCmp("i_budget_year").getValue(),
        i_budget_year_overlap: Ext.getCmp("i_budget_year_overlap").getValue(),
        dc_expense_budget_type_id: Ext.getCmp("dc_expense_budget_type_id").getValue(),
        po_expense_id: Ext.getCmp("po_expense_id").getValue(),
        dc_cost_id: Ext.getCmp("dc_cost_id").getValue(),
        po_creditor_id: Ext.getCmp("po_creditor_id").getValue(),
        po_creditor_transfer_id: Ext.getCmp("po_creditor_transfer_id").getValue(),
        c_qty: Ext.getCmp("c_qty").getValue(),
        f_total: Ext.getCmp("f_total").getValue().replace(/,/g, ""),
        d_audit_date: Ext.util.Format.date(Ext.getCmp("d_audit_date").getValue(), "Y-m-d"),
        po_emp_id: Ext.getCmp("po_emp_id").getValue(),
        d_doc_date: Ext.util.Format.date(Ext.getCmp("d_doc_date").getValue(), "Y-m-d"),
        dc_approve_id: Ext.getCmp("dc_approve_id").getValue(),
        d_inv_date: Ext.util.Format.date(Ext.getCmp("d_inv_date").getValue(), "Y-m-d"),
        c_comment: Ext.getCmp("c_comment").getValue(),
        c_approve: Ext.getCmp("c_approve").getValue(),
        d_approve_date: Ext.util.Format.date(Ext.getCmp("d_approve_date").getValue(), "Y-m-d"),
        c_booking: Ext.getCmp("c_booking").getValue(),
      },
      success: function (result, request) {
        Ext.getCmp("frm-Add").getEl().unmask();
        let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
        if (jsonData.success == true) {
          Ext.store.load({ params: { mode: "" } });
          Ext.Msg.alert("แจ้งเตือน", jsonData.msg);
          Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not errer
          Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
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
      afterrender: function (obj, eOpts) {},
    },
    layout: {
      type: "vbox",
      align: "stretch",
      pack: "start",
    },
    items: [
      new Ext.FormPanel({
        id: "form-widgets",
        frame: true,
        width: Ext.getBody().getViewSize().width * 1,
        items: [
          {
            xtype: "fieldset",
            title: "ข้อมูลรายการ",
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
                    fieldLabel: "เลขที่ใบขอเบิก",
                    xtype: "textfield",
                    id: "c_code_ref",
                    name: "c_code_ref",
                    style: "font-weight: bold;color: blue;",
                    width: 300,
                    readOnly: true,
                  },
                  new Ext.form.ComboBox({
                    fieldLabel: "ปีงบประมาณ",
                    id: "i_budget_year",
                    name: "i_budget_year",
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
                    fieldLabel: "ใช้เงินปีงบประมาณ",
                    id: "i_budget_year_overlap",
                    name: "i_budget_year_overlap",
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
                    fieldLabel: "แหล่งเงิน",
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
                    fieldLabel: "รายการย่อย",
                    id: "po_expense_id",
                    name: "po_expense_id",
                    mode: "local",
                    store: Ext.po_expense,
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
                    fieldLabel: "หน่วยงานที่รับผิดชอบ",
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
                    fieldLabel: "จ่ายให้",
                    id: "po_creditor_id",
                    name: "po_creditor_id",
                    mode: "local",
                    store: Ext.po_creditor,
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
                    fieldLabel: "โดยมอบให้",
                    id: "po_creditor_transfer_id",
                    name: "po_creditor_transfer_id",
                    mode: "local",
                    store: Ext.po_creditor,
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
                ],
              },
              {
                // column 2
                columnWidth: 0.45,
                xtype: "fieldset",
                border: false,
                items: [
                  {
                    fieldLabel: "จำนวนรายการ",
                    xtype: "textfield",
                    id: "c_qty",
                    name: "c_qty",
                    width: 200,
                  },
                  {
                    xtype: "textfield",
                    id: "f_total",
                    name: "f_total",
                    fieldLabel: "จำนวนเงิน",
                    style: "text-align: right; font-weight: bold;",
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
                    xtype: "datefield",
                    fieldLabel: "วันที่ตรวจรับ",
                    id: "d_audit_date",
                    name: "d_audit_date",
                    width: 100,
                  },
                  new Ext.form.ComboBox({
                    fieldLabel: "ผู้ดำเนินการ",
                    id: "po_emp_id",
                    name: "po_emp_id",
                    mode: "local",
                    store: Ext.po_emp,
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
                    xtype: "datefield",
                    fieldLabel: "วันที่ใบขอเบิก",
                    id: "d_doc_date",
                    name: "d_doc_date",
                    width: 100,
                  },
                  new Ext.form.ComboBox({
                    fieldLabel: "ผู้ตรวจอนุมัติฎีกา",
                    id: "dc_approve_id",
                    name: "dc_approve_id",
                    mode: "local",
                    store: Ext.dc_approve,
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
                    xtype: "datefield",
                    fieldLabel: "วันที่ฝ่ายคลังรับใบขอเบิก",
                    id: "d_inv_date",
                    name: "d_inv_date",
                    width: 100,
                  },
                  {
                    xtype: "textarea",
                    fieldLabel: "หมายเหตุ",
                    id: "c_comment",
                    name: "c_comment",
                    width: 300,
                  },
                ],
              },
            ],
          },
          {
            xtype: "fieldset",
            title: "ข้อมูลรายละเอียดฏีกา",
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
                    fieldLabel: "เลขที่ฏีกา",
                    xtype: "textfield",
                    id: "c_approve",
                    name: "c_approve",
                    width: 300,
                  },
                  {
                    fieldLabel: "เลขที่ใบกันเงิน",
                    xtype: "textfield",
                    id: "c_booking",
                    name: "c_booking",
                    width: 300,
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
                    xtype: "datefield",
                    fieldLabel: "วันที่อนุมัติฏีกา",
                    id: "d_approve_date",
                    name: "d_approve_date",
                    width: 100,
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
      }),
    ],
  });
}; // formAdd
Ext.extend(formAdd, Ext.Panel, {});
