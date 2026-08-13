const saveHdr = function(type) {
  let msg = "";

  if (Ext.getCmp("c_name").getValue() == "" || Ext.getCmp("c_name").getValue() == null) {
    msg += "<span style='white-space: nowrap;'>- กรุณากรอก ชื่อหน่วยงานลูกหนี้</span><br>";
  }

  if (msg == "") {
    Ext.getCmp("frm-Add")
      .getEl()
      .mask("Please wait...", "x-mask-loading");
    Ext.Ajax.request({
      url: "api/mn_DcCostDebtor.php",
      method: "POST",
      params: {
        mode: type ? "GENCODE" : Ext.getCmp("role-form-mode").getValue(),
        id: Ext.getCmp("id").getValue(),
        c_name: Ext.getCmp("c_name").getValue(),
        c_comment: Ext.getCmp("c_comment").getValue(),
        i_enable: Ext.getCmp("i_enable").getValue() == true ? 1 : 2
      },
      success: function(result, request) {
        Ext.getCmp("frm-Add")
          .getEl()
          .unmask();
        let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
        if (jsonData.success == true) {
          Ext.store.load({ params: { mode: "" } });
          Ext.Msg.alert("แจ้งเตือน", "บันทึกเรียบร้อย");
          Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
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
                    xtype: "displayfield",
                    fieldLabel: "เลขที่เอกสาร",
                    style: "font-weight: bold; color: red;",
                    name: "c_code"
                  },
                  new Ext.form.TextField({
                    fieldLabel: "ชื่อหน่วยงานลูกหนี้",
                    id: "c_name",
                    name: "c_name",
                    width: 350
                  }),
                  {
                    xtype: "textarea",
                    fieldLabel: "หมายเหตุ",
                    id: "c_comment",
                    name: "c_comment",
                    width: 350
                  },
                  new Ext.form.Checkbox({
                    fieldLabel: "สถานะ",
                    id: "i_enable",
                    name: "i_enable",
                    boxLabel: "ใช้งาน",
                    inputValue: 1,
                    checked: true,
                    listeners: {
                      afterrender: function() {
                        this.fn = function() {};
                      },
                      Check: function(value) {
                        this.fn();
                      }
                    }
                  })
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
            }
          }
        ]
      }
    ]
  });
}; // formAdd
Ext.extend(formAdd, Ext.Panel, {});
