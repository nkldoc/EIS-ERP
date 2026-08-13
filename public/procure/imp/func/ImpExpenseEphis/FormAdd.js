Ext.HDR_ID = null;

const saveHdr = function(type) {
  let msg = "";

  let dc_bank_source = Ext.getCmp("dc_bank_acc_company_id_source").getValue();
  let dc_bank_target = Ext.getCmp("dc_bank_acc_company_id_target").getValue();

  if (Ext.getCmp("c_expense_period_no").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณากรอก เอกสารค่าใช้จ่ายอ้างอิง</span><br>";
  }
  if (Ext.getCmp("dc_expense_budget_type_id").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณาเลือก แหล่งเงิน</span><br>";
  }
  if (dc_bank_source == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณาเลือก บัญชีโอน</span><br>";
  }
  if (dc_bank_target == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณาเลือก รับโอน</span><br>";
  }
  if (dc_bank_source != "" && dc_bank_target != "") {
    if (dc_bank_source == dc_bank_target) {
      msg += '<span style=\'white-space: nowrap;\'>- "บัญชีโอน" และ "รับโอน" ต้องไม่ซ้ำกัน</span><br>';
    }
  }
  if (Ext.getCmp("d_doc_date").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณากรอก วันที่จ่ายเงิน</span><br>";
  }

  if (msg == "") {
    Ext.getCmp("frm-Add")
      .getEl()
      .mask("Please wait...", "x-mask-loading");
    Ext.Ajax.request({
      url: "api/mn_ImpExpenseEphis.php",
      method: "POST",
      params: {
        mode: Ext.getCmp("role-form-mode").getValue(),
        id: Ext.getCmp("id").getValue(),
        c_expense_period_no: Ext.getCmp("c_expense_period_no").getValue(),
        c_doc: Ext.getCmp("c_doc").getValue(),
        dc_expense_budget_type_id: Ext.getCmp("dc_expense_budget_type_id").getValue(),
        dc_bank_acc_company_id_source: dc_bank_source,
        dc_bank_acc_company_id_target: dc_bank_target,
        d_doc_date: Ext.util.Format.date(Ext.getCmp("d_doc_date").getValue(), "Y-m-d"),
        c_comment: Ext.getCmp("c_comment").getValue()
      },
      success: function(result, request) {
        Ext.getCmp("frm-Add")
          .getEl()
          .unmask();
        let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
        if (jsonData.success == true) {
          Ext.store.load({ params: { mode: "" } });
          Ext.getCmp("id").setValue(jsonData.id);
          Ext.getCmp("role-form-mode").setValue("EDIT");
          Ext.Msg.alert("แจ้งเตือน", "บันทึกเรียบร้อย");
          Ext.HDR_ID = jsonData.id;

          // ============ PanelDtl ============ //
          let PanelDtl = new formPanelDtl();
          Ext.getCmp("contenterCenter").add(PanelDtl);
          Ext.getCmp("contenterCenter").setActiveTab(PanelDtl);
        } else {
          Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg);
        }
      },
      failure: function(result, request) {
        Ext.MessageBox.alert("Failed", result.responseText); // connect error
      }
    });
  } else {
    Ext.Msg.alert("แจ้งเตือน", msg);
  }
}; // saveHdr

// Class Extend
formAdd = function(args) {
  formAdd.superclass.constructor.call(this, {
    region: "center",
    title: "ข้อมูล" + Ext.title_panel,
    iconCls: "icon-application-form-add",
    id: "frm-Add",
    border: false,
    stripeRows: true,
    loadMask: true,
    listeners: {
      afterrender: function(obj, eOpts) {}
    },
    items: [
      {
        xtype: "form",
        id: "form-widgets",
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
                    readOnly: true
                  },
                  {
                    xtype: "hidden",
                    id: "id",
                    name: "id",
                    readOnly: true
                  },
                  {
                    xtype: "textfield",
                    fieldLabel: "เอกสารอ้างอิง",
                    id: "c_expense_period_no",
                    name: "c_expense_period_no",
                    width: 200
                  },
                  {
                    xtype: "textfield",
                    fieldLabel: "รอบที่",
                    id: "c_doc",
                    name: "c_doc",
                    width: 200
                  },
                  new Ext.form.ComboBox({
                    id: "dc_expense_budget_type_id",
                    name: "dc_expense_budget_type_id",
                    fieldLabel: "แหล่งเงิน",
                    store: Ext.dc_expense_budget_type,
                    valueField: "id",
                    displayField: "c_name",
                    mode: "local",
                    triggerAction: "all",
                    emptyText: "กรุณาเลือก...",
                    width: 350,
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    listeners: {
                      beforequery: function(q) {
                        if (q.query) {
                          var length = q.query.length;
                          q.query = new RegExp(Ext.escapeRe(q.query));
                          q.query.length = length;
                        }
                      },
                      blur: function() {
                        this.getStore().clearFilter();
                      }
                    }
                  }),
                  new Ext.form.ComboBox({
                    id: "dc_bank_acc_company_id_target",
                    name: "dc_bank_acc_company_id_target",
                    fieldLabel: "เลขที่บัญชีโอน",
                    store: Ext.vw_dc_bank_acc_company_full1,
                    valueField: "id",
                    displayField: "c_name",
                    mode: "local",
                    triggerAction: "all",
                    emptyText: "กรุณาเลือก...",
                    width: 600,
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    listeners: {
                      beforequery: function(q) {
                        if (q.query) {
                          var length = q.query.length;
                          q.query = new RegExp(Ext.escapeRe(q.query));
                          q.query.length = length;
                        }
                      },
                      blur: function() {
                        this.getStore().clearFilter();
                      }
                    }
                  }),
                  new Ext.form.ComboBox({
                    id: "dc_bank_acc_company_id_source",
                    name: "dc_bank_acc_company_id_source",
                    fieldLabel: "รับโอน",
                    store: Ext.vw_dc_bank_acc_company_full2,
                    valueField: "id",
                    displayField: "c_name",
                    mode: "local",
                    triggerAction: "all",
                    emptyText: "กรุณาเลือก...",
                    width: 600,
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    listeners: {
                      beforequery: function(q) {
                        if (q.query) {
                          var length = q.query.length;
                          q.query = new RegExp(Ext.escapeRe(q.query));
                          q.query.length = length;
                        }
                      },
                      blur: function() {
                        this.getStore().clearFilter();
                      }
                    }
                  }),
                  {
                    xtype: "datefield",
                    fieldLabel: "วันที่จ่ายเงิน",
                    id: "d_doc_date",
                    name: "d_doc_date",
                    value: addY(543)
                  },
                  {
                    xtype: "textarea",
                    fieldLabel: "หมายเหตุ",
                    id: "c_comment",
                    name: "c_comment",
                    width: 300
                  }
                ]
              }
            ]
          }
        ],
        buttonAlign: "left",
        buttons: [
          {
            text: "&nbsp;" + Ext.GLOBAL_BU_SAVE_TH + "&nbsp;",
            id: "saveHdr",
            iconCls: "icon-save",
            disabled: Ext.butt == "add" || Ext.butt == "edit" ? false : true,
            handler: function() {
              saveHdr(false);
            }
          },
          {
            text: Ext.GLOBAL_BU_BACK_TH,
            handler: function() {
              Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
              Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
            }
          }
        ]
      }
    ]
  });
}; // formAdd
Ext.extend(formAdd, Ext.Panel, {});
