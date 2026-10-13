Ext.onReady(function() {
  Ext.QuickTips.init();

  const saveDtl = function() {
    let msg = "";
    let i_level = null;
    let refId = Ext.getCmp("referance_id").getValue();
    let mode = Ext.getCmp("condition_mode").getValue();

    if (Ext.getCmp("c_code1").getValue() == "" || Ext.getCmp("c_code2").getValue() == "" || Ext.getCmp("c_code3").getValue() == "" || Ext.getCmp("c_code4").getValue() == "") {
      msg += "<span style='white-space: nowrap;'>กรุณาระบุรหัสให้ครบถ้วน</span><br>";
    }
    if (Ext.getCmp("c_name").getValue() == "") {
      msg += "<span style='white-space: nowrap;'>กรุณาระบุชื่อรายการ</span><br>";
    }
    if (mode == "EDIT") {
      if (refId == "") {
        msg = "<span style='white-space: nowrap;'>กรุณาเลือกเมนูอ้างอิงก่อน</span>";
      }
    }
    if (mode == "") {
      msg = "<span style='white-space: nowrap;'>กรุณาเลือกเงื่อนไข</span>";
    }

    for (let i = 1; i <= 4; i++) {
      if (parseInt(Ext.getCmp("c_code" + i).getValue()) > 0) {
        i_level = i;
      }
    }

    if (msg == "") {
      Ext.Ajax.request({
        url: "api/mn_poExpense.php",
        method: "POST",
        params: {
          mode: mode,
          ref_id: refId,
          c_code: Ext.getCmp("c_code1").getValue() + Ext.getCmp("c_code2").getValue() + Ext.getCmp("c_code3").getValue() + Ext.getCmp("c_code4").getValue(),
          c_name: Ext.getCmp("c_name").getValue(),
          i_level: i_level,
          i_last: i_level == 4 ? "1" : "0",
          i_enable: Ext.getCmp("i_enable").getValue() == true ? 1 : 2
        },
        success: function(result, request) {
          let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
          if (jsonData.success == true) {
            treeMenu.getLoader().load(rootNode);
            Ext.getCmp("form-widgets")
              .getForm()
              .reset();
          }
          Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg);
        },
        failure: function(result, request) {
          Ext.MessageBox.alert("Failed", result.responseText); // connect error
        }
      });
    } else {
      Ext.MessageBox.alert("แจ้งเตือน", msg);
    }
  };

  const rootNode = new Ext.tree.AsyncTreeNode();
  const treeMenu = new Ext.tree.TreePanel({
    border: false,
    autoScroll: true,
    rootVisible: false,
    lines: false,
    singleExpand: false,
    useArrows: true,
    loader: Ext.storePoExpense,
    root: rootNode
  });

  treeMenu.on("click", function(n) {
    var sn = this.selModel.selNode || {};
    if (n.id != sn.id) {
      var parent = n;
      let parent_name = "";

      for (var i = 1; i <= n.attributes.lv; i++) {
        if (parent.attributes.c_name != null) {
          if (parent_name != "") {
            parent_name = parent.attributes.c_name + " => " + parent_name;
          } else {
            parent_name = parent.attributes.c_name;
          }
        }
      }

      Ext.getCmp("referance_id").setValue(n.id); // เมนูอ้างอิง
      Ext.getCmp("menu_referance").setValue(parent_name);
      Ext.getCmp("c_code1").setValue(parent.attributes.c_code1);
      Ext.getCmp("c_code2").setValue(parent.attributes.c_code2);
      Ext.getCmp("c_code3").setValue(parent.attributes.c_code3);
      Ext.getCmp("c_code4").setValue(parent.attributes.c_code4);
      Ext.getCmp("c_name").setValue(parent.attributes.c_name);
      Ext.getCmp("i_enable").setValue(parent.attributes.i_enable);
      Ext.getCmp("condition_mode").reset();
    }
  });

  const panelForm = new Ext.form.FormPanel({
    id: "form-widgets",
    frame: true,
    bodyStyle: { padding: "10px 20px" },
    defaults: { anchor: "100%", msgTarget: "side" },
    autoHeight: true,
    items: [
      { id: "referance_id", xtype: "hidden" },
      { id: "menu_referance", xtype: "textfield", fieldLabel: "ชื่อเมนูอ้างอิง", readOnly: true },
      {
        id: "condition_mode",
        xtype: "combo",
        fieldLabel: "เงื่อนไข",
        mode: "local",
        store: Ext.Condition,
        valueField: "value",
        displayField: "text",
        allowBlank: false,
        editable: false,
        triggerAction: "all",
        typeAhead: false,
        emptyText: "เลือกเงื่อนไข"
      },
      {
        xtype: "fieldset",
        title: "&nbsp;รายละเอียดข้อมูล&nbsp;",
        collapsible: false,
        hidden: false,
        labelWidth: 150,
        items: [
          {
            xtype: "buttongroup",
            fieldLabel: "รหัส",
            frame: false,
            items: [
              {
                xtype: "textfield",
                id: "c_code1",
                style: "text-align: center",
                width: 30,
                enableKeyEvents: true,
                listeners: {
                  afterrender: function() {
                    $("#c_code1").attr("maxlength", "2");
                    this.fn = function() {
                      let value = "00" + floatMinus(this.getValue().replace(/,/g, ""), 0);
                      this.setValue(value.slice(-2));
                    };
                  },
                  change: function() {
                    this.fn();
                  }
                }
              },
              { xtype: "tbspacer", html: "-", style: "padding: 0px 2px;" },
              {
                xtype: "textfield",
                id: "c_code2",
                style: "text-align: center",
                width: 30,
                enableKeyEvents: true,
                listeners: {
                  afterrender: function() {
                    $("#c_code2").attr("maxlength", "2");
                    this.fn = function() {
                      let value = "00" + floatMinus(this.getValue().replace(/,/g, ""), 0);
                      this.setValue(value.slice(-2));
                    };
                  },
                  change: function() {
                    this.fn();
                  }
                }
              },
              { xtype: "tbspacer", html: "-", style: "padding: 0px 2px;" },
              {
                xtype: "textfield",
                id: "c_code3",
                style: "text-align: center",
                width: 30,
                enableKeyEvents: true,
                listeners: {
                  afterrender: function() {
                    $("#c_code3").attr("maxlength", "2");
                    this.fn = function() {
                      let value = "00" + floatMinus(this.getValue().replace(/,/g, ""), 0);
                      this.setValue(value.slice(-2));
                    };
                  },
                  change: function() {
                    this.fn();
                  }
                }
              },
              { xtype: "tbspacer", html: "-", style: "padding: 0px 2px;" },
              {
                xtype: "textfield",
                id: "c_code4",
                style: "text-align: center",
                width: 40,
                enableKeyEvents: true,
                listeners: {
                  afterrender: function() {
                    $("#c_code4").attr("maxlength", "3");
                    this.fn = function() {
                      let value = "00" + floatMinus(this.getValue().replace(/,/g, ""), 0);
                      this.setValue(value.slice(-3));
                    };
                  },
                  change: function() {
                    this.fn();
                  }
                }
              }
            ]
          },
          {
            xtype: "textfield",
            id: "c_name",
            width: 700,
            fieldLabel: "ชื่อรายการ"
          },
          {
            xtype: "checkbox",
            id: "i_enable",
            fieldLabel: "สถานะ",
            boxLabel: "ใช้งาน",
            checked: true,
            inputValue: 1
          }
        ]
      }
    ],
    buttons: [
      {
        text: Ext.GLOBAL_BU_SAVE_TH,
        iconCls: "icon-save",
        handler: function() {
          saveDtl();
        }
      },
      {
        text: "Cancel",
        handler: function() {
          Ext.getCmp("form-widgets")
            .getForm()
            .reset();
        }
      }
    ]
  });

  /*====================== WEST ======================*/
  const west = new Ext.Panel({
    region: "west",
    title: "เมนูผังงบประมาณ",
    autoScroll: true,
    split: true,
    width: 500,
    items: [treeMenu]
  });

  /*====================== CENTER ======================*/
  const center = new Ext.Panel({
    layout: "fit",
    region: "center",
    title: "บันทึกข้อมูล",
    collapsible: false,
    items: [panelForm]
  });

  /*====================== RENDER ======================*/
  new Ext.Viewport({
    layout: "border",
    items: [west, center]
  });
});
