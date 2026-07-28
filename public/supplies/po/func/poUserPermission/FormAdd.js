Ext.HDR_ID = null;

const saveHdr = function (type) {
  let msg = "";

  if (msg == "") {
    Ext.getCmp("frm-Add").getEl().mask("Please wait...", "x-mask-loading");
    Ext.Ajax.request({
      url: "api/mn_poUserPermission.php",
      method: "POST",
      params: {
        mode: Ext.getCmp("role-form-mode").getValue(),
        id: Ext.getCmp("id").getValue(),
        dc_cost_acc_id: Ext.getCmp("dc_cost_acc_id").getValue(),
        i_approve: Ext.getCmp("i_approve").getValue() ? "1" : "0",
        i_executive: Ext.getCmp("i_executive").getValue() ? "1" : "0",
        i_executive_main: Ext.getCmp("i_executive_main").getValue() ? "1" : "0",
        i_permission: Ext.getCmp("i_permission").getValue() ? "1" : "0",
      },
      success: function (result, request) {
        Ext.getCmp("frm-Add").getEl().unmask();
        let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
        if (jsonData.success == true) {
          Ext.store.load({ params: { mode: "" } });
          Ext.Msg.alert("แจ้งเตือน", "บันทึกเรียบร้อย");
          Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
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
                    xtype: "hidden",
                    id: "dc_cost_acc_id",
                    name: "dc_cost_acc_id",
                    readOnly: true,
                  },
                  {
                    xtype: "displayfield",
                    fieldLabel: "ชื่อ",
                    name: "c_name",
                    width: 300,
                  },
                  {
                    xtype: "displayfield",
                    fieldLabel: "ส่วนงาน",
                    name: "dc_cost_acc_name",
                    width: 300,
                  },
                  {
                    xtype: "checkbox",
                    fieldLabel: "ผู้ตรวจสอบ",
                    id: "i_approve",
                    name: "i_approve",
                    boxLabel: "แสดงรายการ",
                    inputValue: 1,
                    checked: true,
                  },
                  {
                    xtype: "checkbox",
                    fieldLabel: "ผู้อนุมัติ",
                    id: "i_executive",
                    name: "i_executive",
                    boxLabel: "แสดงรายการ",
                    inputValue: 1,
                    checked: true,
                  },
                  {
                    xtype: "checkbox",
                    fieldLabel: "<span style='color: red; font-size: 7px;'>(ส่วนงานละ 1 คน)*</spen><span style='color: black; font-size: 12px;'> ผู้อนุมัติหลัก</spen>",
                    id: "i_executive_main",
                    name: "i_executive_main",
                    boxLabel: "แสดงรายการ",
                    inputValue: 1,
                    checked: true,
                  },
                  {
                    xtype: "checkbox",
                    fieldLabel: "สิทธิ์เข้าถึงเมนูซื้อจ้าง",
                    id: "i_permission",
                    name: "i_permission",
                    boxLabel: "admin",
                    inputValue: 1,
                    checked: true,
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
              Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
            },
          },
        ],
      },
    ],
  });
}; // formAdd
Ext.extend(formAdd, Ext.Panel, {});
