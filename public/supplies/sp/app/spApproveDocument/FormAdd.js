Ext.HDR_ID = null;

const saveHdr = function(type) {
  let msg = ""; 
  if (Ext.getCmp("c_name").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณากรอก ผู้ดำเนินการ</span><br>";
  }

  if (msg == "") {
    Ext.getCmp("frm-Add")
      .getEl()
      .mask("Please wait...", "x-mask-loading");
    Ext.Ajax.request({
      url: "api/mn_poEmp.php",
      method: "POST",
      params: {
        mode: Ext.getCmp("role-form-mode").getValue(),
        id: Ext.getCmp("id").getValue(),
        c_name: Ext.getCmp("c_name").getValue(),
        c_comment: Ext.getCmp("c_comment").getValue()
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
    title: "ข้อมูล " + Ext.title,
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
        defaults: { anchor: "100%", msgTarget: "side", allowBlank: false, },
        items: [
          {
            xtype: "container",
            layout: "hbox",
            align: "stretch",
            RemoveHeight: true,
            defaults: { xtype: "fieldset", flex: 1, margins: "0px 3px", autoHeight: true },
            items: [
              {
                title: "บันทึกข้อมูล " + Ext.title,
                RemoveCls: "x-box-item",
                collapsible: true,
                collapsed: false,
                defaults: { labelStyle: "width:200px;", allowBlank: true, },
                items: [
                  {
                    xtype: "hidden",
                    id: "role-form-mode",
                    name: "mode",
                    readOnly: true
                  },
                  {
                    xtype: "hidden",
                    id: " step_document_id", //  step_sign status_approve approve_by
                    name: "step_document_id", 
                    readOnly: true
 
                  },
                  {
                    xtype: "hidden",
                    id: "id",
                    name: "id",
                    readOnly: true
                  },     
               new Ext.form.ComboBox({
                fieldLabel: "เอกสารที่ดำเนินการ",    
                mode: "local",
                store: Ext.sp_status_document_items,
                id: "approved_document_val",
                hiddenName: "approved_document_val",
                name: "approved_document_val",
                valueField: "id",
                displayField: "c_name",
                width:400,
                triggerAction: "all",
                forceSelection: true,
                selectOnFocus: true,
                typeAhead: false,
                emptyText: "กรุณาเลือก...", 
                editable: false, 
                resizable: true, // optional for manual resizing
                listeners: {
                    expand: function(cb) {
                        // Automatically adjust list width based on longest option
                        var max = 0;
                        cb.store.each(function(rec) {
                            var len = rec.get(cb.displayField).length;
                            if (len > max) {
                                max = len;
                            }
                        });

                        var newWidth = (max * 7) + 30; // 7 is approx avg char width in px
                        cb.list.setWidth(Math.max(cb.getWidth(), newWidth));
                    }
                }
//                listeners: {
//                        change: function (combo, newValue) {
//                            if (newValue == "") {
//                                combo.reset();
//                            }
//                        },
//                        beforequery: function (q) {
//                            if (q.query) {
//                                var length = q.query.length;
//                                q.query = new RegExp(Ext.escapeRe(q.query));
//                                q.query.length = length;
//                            }
//                        },
//                        blur: function () {
//                            this.getStore().clearFilter();
//                        },
//                    },

              }),
                  {
                    xtype: "textfield",
                    fieldLabel: "ผู้ดำเนินการ",
                    id: "c_name",
                    name: "c_name",
                    width:400,
                  },
                  {
                    xtype: "textarea",
                    fieldLabel: "หมายเหตุ",
                    id: "c_comment",
                    name: "c_comment",
                    width:400,
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
            disabled: Ext.butt == "ADD" || Ext.butt == "EDIT" ? false : true,
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
