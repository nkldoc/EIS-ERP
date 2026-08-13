Ext.HDR_ID = null;

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
                    fieldLabel: "เอกสารค่าใช้จ่ายอ้างอิง",
                    readOnly: true,
                    id: typeMenu == "EP" ? "c_expense_period_no" : "c_expense_vsn_period_no",
                    name: typeMenu == "EP" ? "c_expense_period_no" : "c_expense_vsn_period_no",
                    width: 200
                  },
                  {
                    xtype: "textfield",
                    fieldLabel: "รอบที่",
                    id: "c_doc",
                    name: "c_doc",
                    readOnly: true,
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
                    width: 200,
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    readOnly: true,
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
                    store: Ext.vw_dc_bank_acc_company_full,
                    valueField: "id",
                    displayField: "c_name",
                    mode: "local",
                    triggerAction: "all",
                    emptyText: "กรุณาเลือก...",
                    width: 600,
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    readOnly: true,
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
                    store: Ext.vw_dc_bank_acc_company_full,
                    valueField: "id",
                    displayField: "c_name",
                    mode: "local",
                    triggerAction: "all",
                    emptyText: "กรุณาเลือก...",
                    width: 600,
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    readOnly: true,
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
                    readOnly: true,
                    value: addY(543)
                  },
                  {
                    xtype: "textarea",
                    fieldLabel: "หมายเหตุ",
                    id: "c_comment",
                    name: "c_comment",
                    readOnly: true,
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
            text: Ext.GLOBAL_BU_BACK_TH,
            handler: function() {
              Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
              Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
              Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelCheque"), true) || {}; // null obj not errer
            }
          }
        ]
      }
    ]
  });
}; // formAdd
Ext.extend(formAdd, Ext.Panel, {});
