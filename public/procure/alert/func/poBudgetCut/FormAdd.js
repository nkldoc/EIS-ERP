Ext.HDR_ID = null;

const saveHdr = function(type) {
  let msg = "";

  if (Ext.getCmp("d_doc_date").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณากรอก วันที่หักงบประมาณ</span><br>";
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
        po_expense_id: Ext.getCmp("po_expense_id").getValue(),
        c_booking: Ext.getCmp("c_booking").getValue(),
        c_comment: Ext.getCmp("c_comment").getValue()
      },
      success: function(result, request) {
        Ext.getCmp("frm-Add")
          .getEl()
          .unmask();
        let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
        if (jsonData.success == true) {
          Ext.store.load({
            params: {
              mode: ""
            }
          });
          Ext.getCmp("id").setValue(jsonData.id);
          Ext.getCmp("role-form-mode").setValue("EDIT");
          Ext.HDR_ID = jsonData.id;
          if (type) {
            Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not errer
          }
          Ext.Msg.alert("แจ้งเตือน", jsonData.msg);
          Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
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
        bodyStyle: {
          padding: "10px 20px"
        },
        defaults: {
          anchor: "100%",
          msgTarget: "side",
          allowBlank: false
        },
        items: [
          {
            xtype: "container",
            layout: "hbox",
            align: "stretch",
            RemoveHeight: true,
            defaults: {
              xtype: "fieldset",
              flex: 1,
              margins: "0px 3px",
              autoHeight: true
            },
            items: [
              {
                title: "บันทึกข้อมูล " + Ext.title_panel,
                RemoveCls: "x-box-item",
                collapsible: true,
                collapsed: false,
                defaults: {
                  labelStyle: "width:200px;",
                  allowBlank: true
                },
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
                  new Ext.form.ComboBox({
                    fieldLabel: "รายจ่ายย่อย",
                    id: "po_expense_id",
                    name: "po_expense_id",
                    mode: "local",
                    store: Ext.po_expense,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    width: 500,
                    listeners: {
                      afterrender: function() {
                        this.fn = function() {};
                      },
                      Change: function() {
                        this.fn();
                      },
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
                    xtype: "textfield",
                    fieldLabel: "ปีงบประมาณ",
                    id: "i_budget_year",
                    name: "i_budget_year",
                    width: 200,
                    readOnly: true,
                    listeners: {
                      afterrender: function() {
                        this.fn = function() {
                          this.setValue(parseInt(this.getValue()) + 543);
                        };
                      }
                    }
                  },
                  {
                    xtype: "textfield",
                    fieldLabel: "ใช้เงินปีงบประมาณ",
                    id: "i_budget_year_overlap",
                    name: "i_budget_year_overlap",
                    width: 200,
                    readOnly: true,
                    listeners: {
                      afterrender: function() {
                        this.fn = function() {
                          this.setValue(parseInt(this.getValue()) + 543);
                        };
                      }
                    }
                  },
                  {
                    xtype: "buttongroup",
                    fieldLabel: "เลขที่ใบกันเงิน",
                    frame: false,
                    items: [
                      {
                        xtype: "textfield",
                        name: "c_booking",
                        id: "c_booking",
                        width: 100
                      },
                      {
                        xtype: "tbspacer",
                        width: 4
                      },
                      {
                        xtype: "label",
                        style: { color: "red" },
                        text: "* กรณีเป็นใบเบิกเหลื่อมปี"
                      }
                    ]
                  },

                  {
                    xtype: "datefield",
                    fieldLabel: "วันที่หักงบประมาณ",
                    id: "d_doc_date",
                    width: 200,
                    name: "d_status_date"
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
            text: "&nbsp;ส่งหัวหน้าฝ่ายการคลังลงนาม&nbsp;",
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
