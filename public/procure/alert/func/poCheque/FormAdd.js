Ext.HDR_ID = null;

Ext.txt_date = Ext.I_STATUS == 8 ? "วันที่เสนอฝ่ายลงนาม" : "วันที่จ่าย";
Ext.txt_save = Ext.I_STATUS == 8 ? "ส่งหัวหน้าฝ่ายการคลังลงนามเช็ค" : "บันทึกรายการสมบูรณ์";

const saveHdr = function(type) {
  let msg = "";

  if (Ext.getCmp("d_doc_date").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณากรอก " + Ext.txt_date + "</span><br>";
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
          Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
        }
        Ext.MessageBox.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + jsonData.msg + "</span>");
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
                    fieldLabel: "เลขที่ฏีกา",
                    name: "c_approve",
                    style: "font-weight: bold;color: blue;",
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
                    xtype: "buttongroup",
                    fieldLabel: Ext.txt_date,
                    frame: false,
                    items: [
                      {
                        xtype: "datefield",
                        id: "d_doc_date",
                        name: "d_status_date"
                      },
                      { xtype: "tbspacer", width: 4 },
                      {
                        xtype: "button",
                        text: "ระบุเลขที่เช็ค",
                        width: 100,
                        handler: function() {
                          Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
                          // ============ PanelDtl ============ //
                          let PanelDtl = new formPanelDtl();
                          Ext.getCmp("contenterCenter").add(PanelDtl);
                          Ext.getCmp("contenterCenter").setActiveTab(PanelDtl);

                          try {
                            let index_id = Ext.store.findExact("id", Ext.HDR_ID);
                            let dd = Ext.store.data.items[index_id].data;
                            Ext.getCmp("dtl_c_approve").setValue(dd.c_approve);
                            Ext.getCmp("dtl_c_creditor").setValue(dd.creditor_name);
                          } catch (err) {}
                        }
                      }
                    ]
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
            text: "&nbsp;" + Ext.txt_save + "&nbsp;",
            iconCls: "icon-save",
            disabled: Ext.butt == "add" || Ext.butt == "edit" ? false : true,
            handler: function() {
              saveHdr(true);
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
