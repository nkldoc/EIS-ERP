Ext.HDR_ID = null;

Ext.dc_cost_supplies = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_ParcelOfficer.php",
  baseParams: { type: "dc_cost_supplies", i_level: "all" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});

const saveHdr = function (type) {
  let msg = "";

  if (Ext.getCmp("c_name").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณากรอก ชื่อ</span><br>";
  }
  if (Ext.getCmp("dc_cost_name").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณากรอก ฝ่ายงาน</span><br>";
  }
// console.log (Ext.getCmp("i_enable").getEl()); return false;
  if (msg == "") {
    Ext.getCmp("frm-Add").getEl().mask("Please wait...", "x-mask-loading");
    Ext.Ajax.request({
      url: "api/mn_poParcelOfficer.php",
      method: "POST",
      params: {
        mode: Ext.getCmp("role-form-mode").getValue(),
        id: Ext.getCmp("id").getValue(),
        c_name: Ext.getCmp("c_name").getValue(),
        dc_cost_id: Ext.getCmp("dc_cost_name").getValue(),
        i_enable: Ext.getCmp("i_enable").getValue().inputValue
       // c_comment: Ext.getCmp("c_comment").getValue(),
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
                    xtype: "textfield",
                    fieldLabel: "ชื่อ",
                    id: "c_name",
                    name: "c_name",
                    width: 300,
                  },
                  new Ext.form.ComboBox({
                    fieldLabel: "ฝ่ายงาน",
                    id: "dc_cost_name",
                    name: "dc_cost_name",
                    mode: "local",
                    store: Ext.dc_cost_supplies,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    width: 300,
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
                    fieldLabel: "สถานะการใช้งาน",
                    id: "i_enable",
                    xtype: "radiogroup",
                    columns: [120, 100],
                    items: [
                      { boxLabel: "ใช้งาน", checked: true, name: "i_enable", inputValue: 1 },
                      { boxLabel: "ไม่ใช้งาน",  name: "i_enable", inputValue: 2 },
                    ],
                  },
                  // {
                  //   xtype: "textarea",
                  //   fieldLabel: "หมายเหตุ",
                  //   id: "c_comment",
                  //   name: "c_comment",
                  //   width: 300
                  // }
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
