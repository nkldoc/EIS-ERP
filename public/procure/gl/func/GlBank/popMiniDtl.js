// แก้ไขรายละเอียด
popMiniDtl = function(record) {
  new Ext.Window({
    title: "เลือกข้อมูล",
    id: "win-pop-edit",
    modal: true,
    border: false,
    //			height: (Ext.getBody().getViewSize().height * 0.95),
    height: 296,
    width: Ext.getBody().getViewSize().width * 0.5,
    items: [
      new Ext.FormPanel({
        labelWidth: 200, // label settings here cascade unless overridden
        labelAlign: "right",
        frame: true,
        items: [
          {
            xtype: "fieldset",
            title: "ข้อมูลนำเข้า",
            defaults: { xtype: "displayfield" },
            items: [
              { xtype: "hidden", id: "pop_gl_bank_id" },
              { id: "pop_c_code", fieldLabel: "รหัส", style: "color:blue; font-weight: bold;", width: "100%" },
              { id: "pop_dc_acc_name", fieldLabel: "ผังบัญชี", width: "100%" },
              { id: "pop_f_money", fieldLabel: "จำนวนเงิน", width: "100%" },
              new Ext.form.RadioGroup({
                fieldLabel: "สถานะเป็นรายการหักส่งคืน",
                id: "pop_i_return",
                columns: [75, 75, 60],
                items: [
                  { boxLabel: "หักส่งคืน", name: "pop_i_return", inputValue: 1 },
                  { boxLabel: "ปรับปรุง", name: "pop_i_return", inputValue: 2 },
                  { boxLabel: "ไม่ระบุ", name: "pop_i_return", inputValue: 3, checked: true }
                ]
              }),
              new Ext.form.RadioGroup({
                fieldLabel: "ปีงบประมาณ",
                id: "pop_i_type_year",
                columns: [95, 75, 60],
                items: [
                  { boxLabel: "ปีงบประมาณ", name: "pop_i_type_year", inputValue: 1 },
                  { boxLabel: "เหลื่อมปี", name: "pop_i_type_year", inputValue: 2 },
                  { boxLabel: "ไม่ระบุ", name: "pop_i_type_year", inputValue: 9, checked: true }
                ],
                listeners: {
                  afterrender: function() {
                    this.fn = function() {
                      var i_type_year = Ext.getCmp("pop_i_type_year").getValue().inputValue;
                      if (i_type_year == 1 || i_type_year == 2) {
                        Ext.getCmp("pop_c_budget_year").show();
                      } else {
                        Ext.getCmp("pop_c_budget_year").hide();
                      }
                    };
                  },
                  Change: function(value) {
                    this.fn();
                  }
                }
              }),
              new Ext.form.ComboBox({
                id: "pop_c_budget_year",
                store: Ext.store_year,
                valueField: "id",
                displayField: "c_name",
                mode: "local",
                triggerAction: "all",
                emptyText: "กรุณาเลือก...",
                forceSelection: true,
                selectOnFocus: true,
                typeAhead: false,
                width: 240,
                hidden: true,
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
              new Ext.form.ComboBox({
                fieldLabel: "แหล่งเงิน",
                id: "pop_dc_expense_budget_type_id",
                store: Ext.dc_expense_budget_type,
                valueField: "id",
                displayField: "c_name",
                mode: "local",
                triggerAction: "all",
                emptyText: "กรุณาเลือก...",
                width: 240,
                forceSelection: true,
                selectOnFocus: true,
                typeAhead: false,
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
                  },
                  change: function(qq) {}
                }
              })
            ]
          }
        ],
        buttonAlign: "left",
        buttons: [
          {
            text: "&nbsp;" + Ext.GLOBAL_BU_SAVE_TH + "&nbsp;",
            iconCls: "icon-save",
            handler: function() {
              var msg = "";
              var i_type_year = Ext.getCmp("pop_i_type_year").getValue().inputValue;
              var c_budget_year = Ext.getCmp("pop_c_budget_year").getValue();

              if (i_type_year == 1 || i_type_year == 2) {
                if (c_budget_year == "" || c_budget_year == null) {
                  msg += "- กรุณาเลือกปี<br>";
                }
              } else {
                c_budget_year = null;
              }

              if (msg == "") {
                new Ext.Window({
                  id: "win-pop-confirm-mini",
                  title: "ยืนยันรายการ",
                  modal: true,
                  autoHeight: true,
                  width: 270,
                  html: "<div style='font-size: 14px; padding: 8px 2px; background: #fff; height: 45px;'>ต้องการแก้ไขปีงบประมาณหรือไม่ ?</div>",
                  buttons: [
                    {
                      text: "Confirm",
                      handler: function() {
                        Ext.getCmp("win-pop-confirm-mini")
                          .getEl()
                          .mask("Please wait...", "x-mask-loading");
                        Ext.Ajax.request({
                          url: "api/mn_GlBank.php",
                          method: "POST",
                          params: {
                            mode: "POP_SAVE",
                            id: Ext.getCmp("pop_gl_bank_id").getValue(),
                            i_return: Ext.getCmp("pop_i_return").getValue().inputValue,
                            i_type_year: i_type_year,
                            c_budget_year: c_budget_year,
                            dc_expense_budget_type_id: Ext.getCmp("pop_dc_expense_budget_type_id").getValue()
                          },
                          success: function(result, request) {
                            Ext.getCmp("win-pop-confirm-mini")
                              .getEl()
                              .unmask();
                            var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                            if (jsonData.success == true) {
                              Ext.MessageBox.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย"); // alert massage success
                              Ext.getCmp("win-pop-confirm-mini").destroy();
                              Ext.getCmp("win-pop-edit").destroy();
                              Ext.store.load();
                            } else {
                              Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg); // alert massage error
                            }
                          },
                          failure: function(result, request) {
                            Ext.MessageBox.alert("Failed", result.responseText); // connect error
                          }
                        });
                      }
                    },
                    {
                      text: Ext.GLOBAL_BU_BACK_TH,
                      handler: function() {
                        Ext.getCmp("win-pop-confirm-mini").destroy();
                      }
                    }
                  ]
                }).show();
              } else {
                Ext.Msg.alert("แจ้งเตือน", msg);
              }
            }
          },
          {
            text: Ext.GLOBAL_BU_BACK_TH,
            handler: function() {
              Ext.getCmp("win-pop-edit").destroy();
            }
          }
        ]
      })
    ]
  }).show();

  /* LOAD */
  Ext.getCmp("pop_gl_bank_id").setValue(record.data.id);
  Ext.getCmp("pop_c_code").setValue(record.data.c_code);
  Ext.getCmp("pop_dc_acc_name").setValue(record.data.dc_acc_code + " " + record.data.dc_acc_name);
  Ext.getCmp("pop_f_money").setValue(floatRenderer(floatMinus(record.data.f_money, 2)));
  Ext.getCmp("pop_i_return").setValue(record.data.i_return);
  Ext.getCmp("pop_i_type_year").setValue(record.data.i_type_year);
  Ext.getCmp("pop_i_type_year").fn();
  Ext.getCmp("pop_c_budget_year").setValue(record.data.c_budget_year);
  Ext.getCmp("pop_dc_expense_budget_type_id").setValue(record.data.dc_expense_budget_type_id);
}; // popMiniDtl
