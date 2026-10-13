Ext.HDR_ID = null;

const saveHdr = function(type) {
  let msg = "";

  if (Ext.getCmp("d_doc_date").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณากรอก วันที่อนุมัติฏีกา</span><br>";
  }
  if (Ext.getCmp("c_approve").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณากรอก เลขที่ฏีกา</span><br>";
  }

  if (msg == "") {
    Ext.getCmp("frm-Add")
      .getEl()
      .mask("Please wait...", "x-mask-loading");
    Ext.Ajax.request({
      url: "api/mn_poWorking.php",
      method: "POST",
      params: {
        mode: "SEND_STATUS",
        id: Ext.HDR_ID,
        i_status: Ext.I_STATUS,
        c_approve: Ext.getCmp("c_approve").getValue(),
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
          Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not errer
        }
        Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + jsonData.msg + "</span>");
      },
      failure: function(result, request) {
        Ext.MessageBox.alert("Failed", result.responseText); // connect error
      }
    });
  } else {
    Ext.Msg.alert("แจ้งเตือน", msg);
  }
}; // saveHdr

const saveBack = function() {
  let msg = "";
  if (Ext.getCmp("back_d_doc_date").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณากรอก วันที่ทักท้วง</span><br>";
  }

  if (msg == "") {
    Ext.getCmp("frm-Add")
      .getEl()
      .mask("Please wait...", "x-mask-loading");
    Ext.Ajax.request({
      url: "api/mn_poWorking.php",
      method: "POST",
      params: {
        mode: "SEND_STATUS",
        id: Ext.HDR_ID,
        i_status: 3,
        d_doc_date: Ext.util.Format.date(Ext.getCmp("back_d_doc_date").getValue(), "Y-m-d"),
        c_comment: Ext.getCmp("back_c_comment").getValue()
      },
      success: function(result, request) {
        Ext.getCmp("frm-Add")
          .getEl()
          .unmask();
        let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
        if (jsonData.success == true) {
          Ext.store.load({ params: { mode: "" } });
          Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not errer
          Ext.getCmp("win-pop").destroy();
        }
        Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + jsonData.msg + "</span>");
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
                    fieldLabel: "เลขที่ใบขอเบิก",
                    name: "c_code",
                    style: "font-weight: bold;color: red;",
                    width: 200,
                    readOnly: true
                  },
                  {
                    xtype: "textfield",
                    fieldLabel: "จำนวนเงินขอเบิก",
                    id: "f_total",
                    name: "f_total",
                    style: "text-align: right; font-weight: bold;",
                    width: 200,
                    readOnly: true,
                    listeners: {
                      afterrender: function() {
                        this.fn = function() {
                          let value = floatMinus(this.getValue().replace(/,/g, ""), 2);
                          this.setValue(floatRenderer(value));
                        };
                      },
                      Change: function(value) {
                        this.fn();
                      }
                    }
                  },
                  {
                    xtype: "datefield",
                    fieldLabel: "วันที่อนุมัติฏีกา",
                    name: "d_status_date",
                    id: "d_doc_date"
                  },
                  {
                    xtype: "textfield",
                    fieldLabel: "เลขที่ฏีกา",
                    id: "c_approve",
                    width: 200
                  },
                  {
                    xtype: "textarea",
                    fieldLabel: "หมายเหตุ",
                    id: "c_comment",
                    name: "c_comment_status",
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
            text: "&nbsp;ส่งหักงบประมาณ&nbsp;",
            iconCls: "icon-save",
            disabled: Ext.butt == "add" || Ext.butt == "edit" ? false : true,
            handler: function() {
              saveHdr(true);
            }
          },
          {
            text: "&nbsp;ส่งทักท้วง&nbsp;",
            disabled: Ext.butt == "add" || Ext.butt == "edit" ? false : true,
            handler: function() {
              pop_back();
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

const pop_back = function() {
  try {
    let index_id = Ext.store.findExact("id", "" + Ext.HDR_ID + "");
    back_d_doc_date = Ext.store.data.items[index_id].data.back_d_doc_date;
    back_c_comment = Ext.store.data.items[index_id].data.back_c_comment;
  } catch (err) {}

  new Ext.Window({
    title: "เลือกข้อมูล",
    id: "win-pop",
    layout: "fit",
    modal: true,
    border: false,
    items: [
      {
        xtype: "form",
        frame: true,
        labelAlign: "right",
        // labelWidth: 200,
        width: 500,
        height: 250,
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
                title: "บันทึกข้อมูลทักท้วง",
                RemoveCls: "x-box-item",
                collapsible: false,
                collapsed: false,
                defaults: { allowBlank: true },
                items: [
                  {
                    xtype: "datefield",
                    fieldLabel: "วันที่ทักท้วง",
                    id: "back_d_doc_date",
                    value: back_d_doc_date
                  },

                  {
                    xtype: "textarea",
                    fieldLabel: "หมายเหตุ",
                    id: "back_c_comment",
                    value: back_c_comment,
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
            text: "&nbsp;บันทึกส่งทักท้วง&nbsp;",
            iconCls: "icon-save",
            disabled: Ext.butt == "add" || Ext.butt == "edit" ? false : true,
            handler: function() {
              saveBack();
            }
          },
          {
            text: Ext.GLOBAL_BU_BACK_TH,
            handler: function() {
              Ext.getCmp("win-pop").destroy();
            }
          }
        ]
      }
    ]
  }).show();
};
