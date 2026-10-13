Ext.HDR_ID = null;

const saveHdr = function (type) {
  let msg = "";
  Ext.d_cal_depre.load({
    callback: function (records, operation, success) {
      if (success) {
        // if (Ext.util.Format.date(Ext.getCmp("d_cutoff_date").getValue(), "Ym") <= Ext.d_cal_depre.getAt(0).get("d_cal_depre")) {
        //   msg += "<span style='white-space: nowrap;'>- วันที่ตัดจำหน่าย ได้ทำการคำนวณค่าเสื้อมไปแล้ว</span><br>";
        // }
        if (Ext.getCmp("d_doc_date").getValue() == "") {
          msg += "<span style='white-space: nowrap;'>- กรุณาระบุวันที่โอนย้าย</span><br>";
        }

        if (msg == "") {
          Ext.getCmp("frm-Add").getEl().mask("Please wait...", "x-mask-loading");
          Ext.Ajax.request({
            url: "api/mn_AmTranasset.php",
            method: "POST",
            params: {
              mode: Ext.getCmp("role-form-mode").getValue(),
              id: Ext.HDR_ID,
              c_code: Ext.getCmp("c_code").getValue(),
              c_doc: Ext.getCmp("c_doc").getValue(),
              dc_cost_id :Ext.getCmp("dc_cost_id").getValue(),
              dc_cost_id_new :Ext.getCmp("dc_cost_id_new").getValue(),
              d_doc_date: Ext.util.Format.date(Ext.getCmp("d_doc_date").getValue(), "Y-m-d"),
              c_comment: Ext.getCmp("c_comment").getValue(),
            },
            success: function (result, request) {
              Ext.getCmp("frm-Add").getEl().unmask();
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
            failure: function (result, request) {
              Ext.MessageBox.alert("Failed", result.responseText); // connect error
            },
          });
        } else {
          Ext.Msg.alert("แจ้งเตือน", msg);
        }
      }
    },
  });
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
                    fieldLabel: "เลขที่โอนย้าย",
                    id: "c_code",
                    name: "c_code",
                    width: 300,
                    readOnly: true,
                  },
                  {
                    xtype: "textfield",
                    fieldLabel: "เลขที่เอกสาร",
                    id: "c_doc",
                    name: "c_doc",
                    width: 300,
                  },
                  
                  new Ext.form.ComboBox({
                    id: "dc_cost_id",
                    name: "dc_cost_id",
                    fieldLabel: "หน่วยงานต้นทาง",
                    store: Ext.store_cost_s,
                    valueField: "id",
                    displayField: "c_name",
                    mode: "local",
                    triggerAction: "all",
                    emptyText: "กรุณาเลือก...",
                    width: 500,
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    // value: "0",
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
                    id: "dc_cost_id_new",
                    name: "dc_cost_id_new",
                    fieldLabel: "หน่วยงานปลายทาง",
                    store: Ext.store_cost_s,
                    valueField: "id",
                    displayField: "c_name",
                    mode: "local",
                    triggerAction: "all",
                    emptyText: "กรุณาเลือก...",
                    width: 500,
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    // value: "0",
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
                    xtype: "textfield",
                    fieldLabel: "เลขที่โอนย้าย",
                    id: "c_code",
                    name: "c_code",
                    width: 300,
                    readOnly: true,
                  },
                  {
                    xtype: "textfield",
                    fieldLabel: "เลขที่เอกสาร",
                    id: "c_doc",
                    name: "c_doc",
                    width: 300,
                  },
                  // {
                  //   fieldLabel: "วันที่ตัดจำหน่าย",
                  //   xtype: "datefield",
                  //   id: "d_cutoff_date",
                  //   name: "d_cutoff_date",
                  //   width: 150,
                  //   value: addY(543),
                  // },
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
              Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
            },
          },
        ],
      },
    ],
  });
}; // formAdd
Ext.extend(formAdd, Ext.Panel, {});
