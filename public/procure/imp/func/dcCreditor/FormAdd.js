Ext.HDR_ID = null;

const saveHdr = function(type) {
  let msg = "";

  if (Ext.getCmp("c_name").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณากรอก ชื่อ</span><br>";
  }

  if (msg == "") {
    Ext.getCmp("frm-Add")
      .getEl()
      .mask("Please wait...", "x-mask-loading");
    Ext.Ajax.request({
      url: "api/mn_dcCreditor.php",
      method: "POST",
      params: {
        mode: Ext.getCmp("role-form-mode").getValue(),
        id: Ext.getCmp("id").getValue(),
        c_name: Ext.getCmp("c_name").getValue(),
        c_comment: Ext.getCmp("c_comment").getValue(),
        c_map_vsn: Ext.getCmp("c_map_vsn").getValue(),
        c_map_ephis: Ext.getCmp("c_map_ephis").getValue(),
        i_key: Ext.getCmp("i_key").getValue().inputValue
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
                    fieldLabel: "ชื่อ",
                    id: "c_name",
                    name: "c_name",
                    width: 250
                  },
                  {
                    xtype: "textfield",
                    fieldLabel: "ข้อความ Map เจ้าหนี้ของ(MIS/Vision Net)",
                    id: "c_map_vsn",
                    name: "c_map_vsn",
                    width: 250
                  },
                  {
                    xtype: "textfield",
                    fieldLabel: "ข้อความ Map เจ้าหนี้ของ(MIS/e-PHIS)",
                    id: "c_map_ephis",
                    name: "c_map_ephis",
                    width: 250
                  } 
                  , {
                    xtype: "radiogroup",
                    id: "i_key",
                    fieldLabel: "ประเภทรายการ",
                    columns: [ 100, 100],
                    vertical: true,
                    items: [
                      { boxLabel: "ใช้กับใบเบิก", name: "i_key", inputValue: 1, checked: true },
                      { boxLabel: "ไม่ใช้กับใบเบิก", name: "i_key", inputValue: 9 } 
                    ]
                  }
                  ,{
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
            }
          }
        ]
      }
    ]
  });
}; // formAdd
Ext.extend(formAdd, Ext.Panel, {});
