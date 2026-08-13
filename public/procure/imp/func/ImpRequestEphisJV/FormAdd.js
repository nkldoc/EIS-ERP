Ext.HDR_ID = null;

const saveHdr = function(type) {
  let msg = "";
 
  if (Ext.getCmp("c_period_no").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณากรอก เอกสารค่าใช้จ่ายอ้างอิง</span><br>";
  }
  if (Ext.getCmp("dc_expense_budget_type_id").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณาเลือก แหล่งเงิน</span><br>";
  }
 
  if (Ext.getCmp("d_doc_date").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณากรอก วันที่จ่ายเงิน</span><br>";
  }

  if (msg == "") {
    Ext.getCmp("frm-Add")
      .getEl()
      .mask("Please wait...", "x-mask-loading");
    Ext.Ajax.request({
      url: "api/mn_ImpRequestEphis.php",
      method: "POST",
      params: {
        mode: Ext.getCmp("role-form-mode").getValue(),
        i_type_menu : Ext.I_MENU_JVCR,
        id: Ext.getCmp("id").getValue(),
        c_period_no: Ext.getCmp("c_period_no").getValue(),
        c_doc: Ext.getCmp("c_doc").getValue(),
        dc_expense_budget_type_id: Ext.getCmp("dc_expense_budget_type_id").getValue(),  
        d_doc_date: (Ext.I_MENU_JVCR=="1") ? Ext.util.Format.date(Ext.getCmp("d_doc_date").getValue(), "Y-m-d") : "",
        d_jv_date: (Ext.I_MENU_JVCR=="1") ? "" : Ext.util.Format.date(Ext.getCmp("d_doc_date").getValue(), "Y-m-d"),
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
          Ext.Msg.minWidth = 200;
          Ext.Msg.alert("แจ้งเตือน", "บันทึกเรียบร้อย");
          Ext.HDR_ID = jsonData.id;

          // ============ PanelDtl ============ //
          let PanelDtl = new formPanelDtl();
          Ext.getCmp("contenterCenter").add(PanelDtl);
          Ext.getCmp("contenterCenter").setActiveTab(PanelDtl);
        } else {
          Ext.MessageBox.minWidth = 200;
          Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg);
        }
      },
      failure: function(result, request) {
        Ext.MessageBox.minWidth = 200;
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
                    fieldLabel: "เลขที่นำเข้าใบเบิก",
                    id: "c_code",
                    name: "c_code",
                    width: 150,
                    disabled: true
                  },
                  {
                    xtype: "textfield",
                    fieldLabel: "เอกสารอ้างอิง",
                    id: "c_period_no",
                    name: "c_period_no",
                    width: 200,
                    disabled: (Ext.I_MENU_JVCR=="1") ? false : true
                  },
                  {
                    xtype: "textfield",
                    fieldLabel: "รอบที่",
                    id: "c_doc",
                    name: "c_doc",
                    width: 200,
                    disabled: (Ext.I_MENU_JVCR=="1") ? false : true
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
                    width: 450,
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    disabled: (Ext.I_MENU_JVCR=="1") ? false : true,
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
                    fieldLabel: (Ext.I_MENU_JVCR=="1") ? "วันที่ทำรายการ" : "วันที่บันทึกบัญชีตั้งหนี้",
                    id: "d_doc_date", 
                    name: (Ext.I_MENU_JVCR=="1") ? "d_doc_date" : "d_jv_date",
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
