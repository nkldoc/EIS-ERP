/* global Ext */

Ext.HDR_ID = null;

name_credirtor = function (name) {
  var txt_title_name = Ext.getCmp("dc_title_id").lastSelectionText;
  var dc_title_id = Ext.getCmp('dc_title_id').getValue();
  var txt_c_name = Ext.getCmp('tax_c_nameID').getValue();
  var txt_last_name = Ext.getCmp('tax_c_last_name').getValue();
  console.log(Ext.butt);
  // var txt_title_name = dc_title_id == 1 ? "" :  txt_title_name; 
            if(Ext.butt == "add") {
                  if (name == "last_name") {
                      var txt = txt_last_name == ""  ? txt_title_name +  txt_c_name :  txt_title_name +  txt_c_name + " " + txt_last_name 
                    }else if (name == "title_name") {
                      var txt = txt_title_name +  txt_c_name + " " + txt_last_name
                    } else {
                    if(Ext.getCmp('tax_c_last_name').getValue() != ""){
                      var txt = txt_title_name +  txt_c_name + " " + txt_last_name
                    }else{
                      var txt = txt_title_name   +   txt_c_name 
                    }
                  }
                  Ext.getCmp("c_nameID").setValue(txt);
                  Ext.getCmp("c_map_vsnID").setValue(txt);
                  Ext.getCmp("c_map_ephisID").setValue(txt);
                  Ext.getCmp("inv_nameID").setValue(txt);

            } else if (Ext.butt == "edit") {
              if (name == "last_name") {
                var txt = txt_last_name == ""  ? txt_title_name +  txt_c_name :  txt_title_name +  txt_c_name + " " + txt_last_name ;
                Ext.getCmp("inv_nameID").setValue(txt);
              }else if (name == "title_name") {
                var txt = txt_last_name == ""  ? txt_title_name +  txt_c_name : txt_title_name +  txt_c_name + " " + txt_last_name;
              } else {
              var txt = txt_title_name + " "  +   txt_c_name 
            }
            Ext.getCmp("inv_nameID").setValue(txt);
            Ext.getCmp("c_nameID").setValue(txt);
          }
};


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
        labelWidth: 250,
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
                    xtype: "buttongroup",
                    frame: false,
                    border: false,
                    fieldLabel: "ชื่อ - นามสกุล",
                    items: [
                      new Ext.form.ComboBox({
                        mode: "local",
                        store: Ext.dc_title,
                        width: 150,
                        valueField: "id",
                        displayField: "c_name",
                        name: "tax_c_title",
                        id: "dc_title_id",
                        triggerAction: "all",
                        // forceSelection: true,

                        selectOnFocus: true,
                        typeAhead: false,
                        emptyText: "คำนำหน้า",
                        submitValue: true,
                        listeners: {
                          render: function (c) {
                            var text_ToolTip = "<span style='white-space:nowrap;'>คำนำหน้า</span>";
                            new Ext.ToolTip({
                              target: c.id,
                              anchor: "top",
                              html: text_ToolTip,
                            });
                          },
                          afterrender: function () {
                            this.fn = function () {};
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
                          change: function () {
                            name_credirtor("title_name")
                          },
                        },
                      }),
                      {
                        xtype: "label",
                        name: "red_star",
                        style: { color: "red", "white-space": "nowrap", paddingRight: "9.5px" },
                        width: 10,
                        text: "*",
                      },
                      {
                        xtype: "textfield",
                        id: "tax_c_nameID",
                        name: "tax_c_name",
                        width: 155,
                        emptyText: "ชื่อ",
                        listeners: {
                          render: function (c) {
                            var text_ToolTip = "<span style='white-space:nowrap;'>ชื่อ</span>";
                            new Ext.ToolTip({
                              target: c.id,
                              anchor: "top",
                              html: text_ToolTip,
                            });
                          },
                          change: function () {
                            name_credirtor("c_name")
                          },
                        },
                      },
                      {
                        xtype: "label",
                        name: "red_star",
                        style: { color: "red", "white-space": "nowrap", paddingRight: "9.5px" },
                        width: 10,
                        text: "*",
                      },
                      {
                        xtype: "tbspacer",
                        width: 15,
                      },
                      {
                        xtype: "textfield",
                        id: "tax_c_last_name",
                        name: "tax_c_last_name",
                        width: 155,
                        emptyText: "นามสกุล",
                        listeners: {
                          render: function (c) {
                            var text_ToolTip = "<span style='white-space:nowrap;'>นามสกุล</span>";
                            new Ext.ToolTip({
                              target: c.id,
                              anchor: "top",
                              html: text_ToolTip,
                            });
                          },
                          change: function () {
                            name_credirtor("last_name")
                          },
                        },
                      },
                    ],
                  },
                  {
                    xtype: "textfield",
                    fieldLabel: "ชื่อ",
                    id: "c_nameID",
                    name: "c_name",
                    width: 250,
                    listeners: {
                      change: function () {
                        var txt = this.getValue();
                        Ext.getCmp("c_map_vsnID").setValue(txt);
                        Ext.getCmp("c_map_ephisID").setValue(txt);
                        Ext.getCmp("inv_nameID").setValue(txt);
                        // Ext.getCmp("c_tax_number_impID").focus();
                      },
                    },
                  },
                  {
                    xtype: "textfield",
                    fieldLabel: "ข้อความ Map เจ้าหนี้ของ(MIS/Vision Net)",
                    id: "c_map_vsnID",
                    name: "c_map_vsn",
                    width: 250,
                  },
                  {
                    xtype: "textfield",
                    fieldLabel: "ข้อความ Map เจ้าหนี้ของ(MIS/e-PHIS)",
                    id: "c_map_ephisID",
                    name: "c_map_ephis",
                    width: 250,
                  },
                  {
                    xtype: "textfield",
                    fieldLabel: "ข้อความ Map เจ้าหนี้ของ(Supplies)",
                    id: "inv_nameID",
                    name: "inv_name",
                    width: 250,
                    validator: function (val) {
                      if (!Ext.isEmpty(val)) {
                        return true;
                      } else {
                        return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                      }
                    },
                  },
                  /* {
                    xtype: "textfield",
                    fieldLabel: "เลขผู้เสียภาษี เจ้าหนี้ของ(Supplies)",
                    id: "c_tax_number_impID",
                    name: "c_tax_number_imp",
                    width: 250,
                    validator: function (val) {
                            if (!Ext.isEmpty(val)) {
                                return true;
                            } else {
                                return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                            }
                     } 
                  }, */
                  {
                    xtype: "radiogroup",
                    id: "i_key",
                    fieldLabel: "ประเภทรายการ",
                    columns: [100, 100],
                    vertical: true,
                    items: [
                      { boxLabel: "ใช้กับใบเบิก", name: "i_key", inputValue: 1, checked: true },
                      { boxLabel: "ไม่ใช้กับใบเบิก", name: "i_key", inputValue: 9 },
                    ],
                  },
                  {
                    xtype: "textarea",
                    fieldLabel: "หมายเหตุ",
                    id: "c_comment",
                    name: "c_comment",
                    width: 300,
                  },
                  {
                    xtype: "radiogroup",
                    id: "i_enableID",
                    name: "i_enable",
                    fieldLabel: "ประเภทกาารใช้งาน",
                    columns: [100, 100],
                    vertical: true,
                    items: [
                      { boxLabel: "ใช้งาน", name: "i_enable", inputValue: 1, checked: true },
                      { boxLabel: "ไม่ใช้งาน", name: "i_enable", inputValue: 2 },
                    ],
                  },
                ],
              },

            ],
          },
          {
            xtype: "container",
            layout: "hbox",
            align: "stretch",
            RemoveHeight: true,
            defaults: { xtype: "fieldset", flex: 1, margins: "0px 3px", autoHeight: true },
            items: [
              {
                title: "ข้อมูลผู้เสียภาษี",
                RemoveCls: "x-box-item",
                collapsible: true,
                id: "Form-edit_creditor_datatax",
                collapsed: false,
                defaults: { labelStyle: "width:200px;", allowBlank: true },
                items: [
                  {
                    xtype: "buttongroup",
                    frame: false,
                    border: false,
                    fieldLabel: "เลขผู้เสียภาษี เจ้าหนี้ของ(Supplies)",
                    items: [
                      {
                        xtype: "textfield",
                        id: "c_tax_number_imp",
                        name: "c_tax_number_imp",
                        width: 200,
                        emptyText: "เลขประจําตัวผู้เสียภาษี",
                        minLength: 13,
                        maxLength: 13,
                        enforceMaxLength: true,
                        maskRe: /[0-9]/,
                        listeners: {
                          render: function (c) {
                            var text_ToolTip = "<span style='white-space:nowrap;'>เลขประจําตัวผู้เสียภาษี (13 หลัก) </span>";
                            new Ext.ToolTip({
                              target: c.id,
                              anchor: "top",
                              html: text_ToolTip,
                            });
                          },
                        },
                      },
                      {
                        xtype: "label",
                        name: "red_star",
                        style: { color: "red", "white-space": "nowrap", paddingRight: "9.5px" },
                        width: 10,
                        text: "*",
                      },
                    ],
                  },
                  { xtype: "container", height: 5 },
                  {
                    xtype: "buttongroup",
                    frame: false,
                    border: false,
                    fieldLabel: "ประเภทกิจการทางภาษี",
                    items: [
                      new Ext.form.ComboBox({
                        mode: "local",
                        store: Ext.dc_tax_customer,
                        width: 250,
                        submitValue: true,
                        name: "dc_tax_customer_id",
                        id: "dc_tax_customer_id",
                        valueField: "id",
                        displayField: "c_name",
                        triggerAction: "all",
                        forceSelection: true,
                        selectOnFocus: true,
                        typeAhead: false,
                        emptyText: "ประเภทกิจการทางภาษี",
                        listeners: {
                          render: function (c) {
                            var text_ToolTip = "<span style='white-space:nowrap;'>ประเภทกิจการทางภาษี</span>";
                            new Ext.ToolTip({
                              target: c.id,
                              anchor: "top",
                              html: text_ToolTip,
                            });
                          },
                          afterrender: function () {
                            this.fn = function () {};
                          },
                          Change: function (combo, newValue) {
                            this.fn();
                            if (newValue) {
                              var record = this.getStore().getById(newValue);
                              Ext.getCmp("c_name_tax_income").setValue(record.get("c_name_tax_income"));
                            } else {
                              Ext.getCmp("c_name_tax_income").setValue("");
                            }

                            var labels = Ext.getCmp("Form-edit_creditor_datatax").find("name", "red_star");
                            var red_star = Ext.getCmp("c_name_tax_income").getValue() == "" ? " " : "*";
                            for (var i = 0; i < labels.length; i++) {
                              var label = labels[i];
                              label.setText(red_star);
                            }
                          },
                          select: function (combo, record, index) {
                            var newValue = record.data.id;
                            if (this.getValue()) {
                              var record = this.getStore().getById(this.getValue());
                              Ext.getCmp("c_name_tax_income").setValue(record.get("c_name_tax_income"));
                            } else {
                              Ext.getCmp("c_name_tax_income").setValue("");
                            }

                            var labels = Ext.getCmp("Form-edit_creditor_datatax").find("name", "red_star");
                            var red_star = Ext.getCmp("c_name_tax_income").getValue() == "" ? " " : "*";
                            for (var i = 0; i < labels.length; i++) {
                              var label = labels[i];
                              label.setText(red_star);
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
                        xtype: "label",
                        style: { color: "red", "white-space": "nowrap", paddingRight: "9.5px" },
                        width: 10,
                        text: "*",
                      },
                      {
                        xtype: "textfield",
                        id: "c_name_tax_income",
                        name: "c_name_tax_income",
                        width: 75,
                        emptyText: "",
                        style: {
                          labelAlign: "center",
                          background: "#EEEEEE",
                          "text-align": "center",
                          border: "1px solid #ADADAD",
                        },
                        readOnly: true,
                      },
                    ],
                  },
                  { xtype: "container", height: 5 },

                  { xtype: "container", height: 5 },
                  {
                    xtype: "buttongroup",
                    frame: false,
                    border: false,
                    fieldLabel: "ที่อยู่",
                    items: [
                      {
                        xtype: "textfield",
                        id: "tax_c_branch",
                        name: "tax_c_branch",
                        width: 50,
                        emptyText: "สาขาที่",
                        maskRe: /[0-9]/,
                        listeners: {
                          render: function (c) {
                            var text_ToolTip = "<span style='white-space:nowrap;'>สาขาที่</span>";
                            new Ext.ToolTip({
                              target: c.id,
                              anchor: "top",
                              html: text_ToolTip,
                            });
                          },
                        },
                      },
                      {
                        xtype: "tbspacer",
                        width: 15,
                      },
                      {
                        xtype: "textfield",
                        id: "tax_c_bldg",
                        name: "tax_c_bldg",
                        width: 197,
                        emptyText: "ชื่ออาคาร",
                        listeners: {
                          render: function (c) {
                            var text_ToolTip = "<span style='white-space:nowrap;'>ชื่ออาคาร</span>";
                            new Ext.ToolTip({
                              target: c.id,
                              anchor: "top",
                              html: text_ToolTip,
                            });
                          },
                        },
                      },
                      {
                        xtype: "tbspacer",
                        width: 15,
                      },
                      {
                        xtype: "textfield",
                        id: "tax_c_room_no",
                        name: "tax_c_room_no",
                        width: 80,
                        emptyText: "ห้องที่",
                        listeners: {
                          render: function (c) {
                            var text_ToolTip = "<span style='white-space:nowrap;'>ห้องที่</span>";
                            new Ext.ToolTip({
                              target: c.id,
                              anchor: "top",
                              html: text_ToolTip,
                            });
                          },
                        },
                      },
                      {
                        xtype: "tbspacer",
                        width: 15,
                      },
                      {
                        xtype: "textfield",
                        id: "tax_c_floor",
                        naem: "tax_c_floor",
                        width: 80,
                        emptyText: "ชั้นที่",
                        listeners: {
                          render: function (c) {
                            var text_ToolTip = "<span style='white-space:nowrap;'>ชั้นที่</span>";
                            new Ext.ToolTip({
                              target: c.id,
                              anchor: "top",
                              html: text_ToolTip,
                            });
                          },
                        },
                      },
                      {
                        xtype: "tbspacer",
                        width: 15,
                      },
                      {
                        xtype: "textfield",
                        id: "tax_c_village",
                        name: "tax_c_village",
                        width: 187,
                        emptyText: "หมู่บ้าน",
                        listeners: {
                          render: function (c) {
                            var text_ToolTip = "<span style='white-space:nowrap;'>หมู่บ้าน</span>";
                            new Ext.ToolTip({
                              target: c.id,
                              anchor: "top",
                              html: text_ToolTip,
                            });
                          },
                        },
                      },
                    ],
                  },
                  { xtype: "container", height: 5 },
                  {
                    xtype: "buttongroup",
                    frame: false,
                    border: false,
                    fieldLabel: " ",
                    labelSeparator : "",                    
                    items: [
                      {
                        xtype: "textfield",
                        id: "tax_c_house_no",
                        name: "tax_c_house_no",
                        width: 150,
                        emptyText: "เลขที่",
                        maskRe: /[0-9\/,-]/, 
                        listeners: {
                          render: function (c) {
                            var text_ToolTip = "<span style='white-space:nowrap;'>เลขที่</span>";
                            new Ext.ToolTip({
                              target: c.id,
                              anchor: "top",
                              html: text_ToolTip,
                            });
                          },
                        },
                      },
                      {
                        xtype: "label",
                        name: "red_star",
                        style: { color: "red", "white-space": "nowrap", paddingRight: "9.5px" },
                        width: 10,
                        text: "*",
                      },
                      {
                        xtype: "textfield",
                        id: "tax_c_village_no",
                        name: "tax_c_village_no",
                        width: 80,
                        emptyText: "หมู่ที่",
                        listeners: {
                          render: function (c) {
                            var text_ToolTip = "<span style='white-space:nowrap;'>หมู่ที่</span>";
                            new Ext.ToolTip({
                              target: c.id,
                              anchor: "top",
                              html: text_ToolTip,
                            });
                          },
                        },
                      },
                      {
                        xtype: "tbspacer",
                        width: 15,
                      },
                      {
                        xtype: "textfield",
                        id: "tax_c_lane",
                        name: "tax_c_lane",
                        width: 195,
                        emptyText: "ตรอก/ซอย",
                        listeners: {
                          render: function (c) {
                            var text_ToolTip = "<span style='white-space:nowrap;'>ตรอก/ซอย</span>";
                            new Ext.ToolTip({
                              target: c.id,
                              anchor: "top",
                              html: text_ToolTip,
                            });
                          },
                        },
                      },
                      {
                        xtype: "tbspacer",
                        width: 15,
                      },
                      {
                        xtype: "textfield",
                        id: "tax_c_road",
                        name: "tax_c_road",
                        width: 185,
                        emptyText: "ถนน",
                        listeners: {
                          render: function (c) {
                            var text_ToolTip = "<span style='white-space:nowrap;'>ถนน</span>";
                            new Ext.ToolTip({
                              target: c.id,
                              anchor: "top",
                              html: text_ToolTip,
                            });
                          },
                        },
                      },
                    ],
                  },
                  { xtype: "container", height: 5 },
                  {
                    xtype: "buttongroup",
                    frame: false,
                    border: false,
                    fieldLabel: " ",
                    labelSeparator : "",
                    items: [
                      new Ext.form.ComboBox({
                        mode: "local",
                        store: Ext.dc_province,
                        width: 174,
                        valueField: "id",
                        displayField: "c_name",
                        name: "tax_c_province",
                        id: "dc_province_id",
                        triggerAction: "all",
                        // forceSelection: true,
                        selectOnFocus: true,
                        typeAhead: false,
                        emptyText: "จังหวัด",
                        submitValue: true,
                        listeners: {
                          render: function (c) {
                            var text_ToolTip = "<span style='white-space:nowrap;'>จังหวัด</span>";
                            new Ext.ToolTip({
                              target: c.id,
                              anchor: "top",
                              html: text_ToolTip,
                            });
                          },
                          afterrender: function () {
                            this.fn = function () {};
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
                          change: function (combo, newValue) {
                            Ext.dc_district.removeAll();
                            Ext.dc_tambon.removeAll();
                            Ext.c_post_code.removeAll();
                            Ext.getCmp("dc_district_id").setValue("");
                            Ext.getCmp("dc_tambon_id").setValue("");
                            Ext.getCmp("tax_c_post_code").setValue("");

                            if (newValue) {
                              Ext.dc_district.setBaseParam("dc_province_id", newValue);
                              Ext.dc_district.load();
                            }
                          },
                          select: function () {
                            Ext.getCmp("dc_district_id").setValue("");
                            Ext.getCmp("dc_tambon_id").setValue("");
                            Ext.getCmp("tax_c_post_code").setValue("");
                          },
                        },
                      }),
                      {
                        xtype: "label",
                        name: "red_star",
                        style: { color: "red", "white-space": "nowrap", paddingRight: "9.5px" },
                        width: 10,
                        text: "*",
                      },
                      new Ext.form.ComboBox({
                        mode: "local",
                        store: Ext.dc_district,
                        width: 174,
                        valueField: "id",
                        displayField: "c_name",
                        name: "tax_c_district",
                        id: "dc_district_id",
                        triggerAction: "all",
                        // forceSelection: true,
                        selectOnFocus: true,
                        typeAhead: false,
                        emptyText: "เขต/อำเภอ",
                        submitValue: true,
                        listeners: {
                          render: function (c) {
                            var text_ToolTip = "<span style='white-space:nowrap;'>เขต/อำเภอ</span>";
                            new Ext.ToolTip({
                              target: c.id,
                              anchor: "top",
                              html: text_ToolTip,
                            });
                          },
                          afterrender: function () {
                            this.fn = function () {};
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
                          change: function (combo, newValue) {
                            Ext.dc_tambon.removeAll();
                            Ext.c_post_code.removeAll();
                            Ext.getCmp("dc_tambon_id").setValue("");
                            Ext.getCmp("tax_c_post_code").setValue("");
                            if (newValue) {
                              Ext.dc_tambon.setBaseParam("dc_district_id", newValue);
                              Ext.dc_tambon.load();
                            }
                          },
                          select: function () {
                            Ext.getCmp("dc_tambon_id").setValue("");
                            Ext.getCmp("tax_c_post_code").setValue("");
                          },
                        },
                      }),
                      {
                        xtype: "label",
                        name: "red_star",
                        style: { color: "red", "white-space": "nowrap", paddingRight: "9.5px" },
                        width: 10,
                        text: "*",
                      },
                      new Ext.form.ComboBox({
                        mode: "local",
                        store: Ext.dc_tambon,
                        width: 171,
                        valueField: "id",
                        displayField: "c_name",
                        name: "dc_tambon_id",
                        id: "dc_tambon_id",
                        triggerAction: "all",
                        // forceSelection: true,
                        selectOnFocus: true,
                        typeAhead: false,
                        emptyText: "แขวง/ตำบล",
                        submitValue: true,
                        listeners: {
                          render: function (c) {
                            var text_ToolTip = "<span style='white-space:nowrap;'>แขวง/ตำบล</span>";
                            new Ext.ToolTip({
                              target: c.id,
                              anchor: "top",
                              html: text_ToolTip,
                            });
                          },
                          afterrender: function () {
                            this.fn = function () {};
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
                          change: function (combo, newValue) {
                            Ext.c_post_code.removeAll();
                            Ext.getCmp("tax_c_post_code").setValue("");
                            if (newValue) {
                              var c_post_code_all = Ext.dc_tambon.getById(newValue).data.c_post_code_all;
                              var parts = c_post_code_all.split("/");
                              var dataToAdd = parts.map(function (part) {
                                return { c_code: part };
                              });
                              Ext.c_post_code.loadData(dataToAdd);
                            }
                          },
                          select: function () {
                            Ext.getCmp("tax_c_post_code").setValue("");
                          },
                        },
                      }),
                      {
                        xtype: "label",
                        name: "red_star",
                        style: { color: "red", "white-space": "nowrap", paddingRight: "9.5px" },
                        width: 10,
                        text: "*",
                      },
                      new Ext.form.ComboBox({
                        mode: "local",
                        store: Ext.c_post_code,
                        width: 90,
                        valueField: "c_code",
                        displayField: "c_code",
                        name: "tax_c_post_code",
                        id: "tax_c_post_code",
                        triggerAction: "all",
                        forceSelection: true,
                        // selectOnFocus: true,
                        typeAhead: false,
                        emptyText: "รหัสไปรษณีย์",
                        submitValue: true,
                        listeners: {
                          render: function (c) {
                            var text_ToolTip = "<span style='white-space:nowrap;'>รหัสไปรษณีย์</span>";
                            new Ext.ToolTip({
                              target: c.id,
                              anchor: "top",
                              html: text_ToolTip,
                            });
                          },
                          afterrender: function () {
                            this.fn = function () {};
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
                        xtype: "label",
                        name: "red_star",
                        style: { color: "red", "white-space": "nowrap", paddingRight: "9.5px" },
                        width: 10,
                        text: "*",
                      },
                    ],
                  },
                  { xtype: "container", height: 5 },
                  {
                    xtype: "buttongroup",
                    frame: false,
                    fieldLabel: "ข้อมูลการติดต่อ",
                    border: false,
                    items: [
                      {
                        xtype: "textfield",
                        id: "c_tele_imp",
                        name: "c_tele_imp",
                        width: 174,
                        emptyText: "เบอร์โทรศัพท์",
                        maskRe: /[0-9,\-]/,
                        listeners: {
                          render: function (c) {
                            var text_ToolTip = "<span style='white-space:nowrap;'>เบอร์โทรศัพท์</span>";
                            new Ext.ToolTip({
                              target: c.id,
                              anchor: "top",
                              html: text_ToolTip,
                            });
                          },
                        },
                      },
                      {
                        xtype: "tbspacer",
                        width: 15,
                      },
                      {
                        xtype: "textfield",
                        id: "c_email",
                        name: "c_email",
                        width: 364,
                        emptyText: "อีเมล",
                        validator: function (value) {
                          var emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
                          if (value === "") {
                            return true;
                          } else if (emailPattern.test(value)) {
                            return true;
                          } else {
                            return "<span style='white-space:nowrap;'>กรุณากรอบ email ให้ถูกต้อง</span>";
                          }
                        },
                        listeners: {
                          render: function (c) {
                            var text_ToolTip = "<span style='white-space:nowrap;'>อีเมล</span>";
                            new Ext.ToolTip({
                              target: c.id,
                              anchor: "top",
                              html: text_ToolTip,
                            });
                          },
                        },
                      },
                    ],
                  },
                ],
              },
            ]
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
              // saveHdr(false);
              // console.log(Ext.HDR_ID);
              let msg = "";

              if (["", null, undefined].includes(Ext.getCmp("dc_tax_customer_id").getValue())) {
                msg += "<span style='white-space: nowrap;'>- กรุณาระบุ ประเภทกิจการทางภาษี</span><br>";
              }
              if (Ext.getCmp("c_name_tax_income").getValue() != "") {
                // if (!Ext.getCmp("Form-edit_creditor_datatax").getForm().isValid()) {
                //   msg += "<span style='white-space: nowrap;'>- กรุณาระบุข้อมูลให้ถูกต้อง</span>";
                // }
                if (["", null, undefined].includes(Ext.getCmp("c_tax_number_imp").getValue())) {
                  msg += "<span style='white-space: nowrap;'>- กรุณากรอก เลขประจําตัวผู้เสียภาษี</span><br>";
                }
                if (["", null, undefined].includes(Ext.getCmp("tax_c_house_no").getValue())) {
                  msg += "<span style='white-space: nowrap;'>- กรุณากรอก เลขที่</span><br>";
                }
                if (["", null, undefined].includes(Ext.getCmp("dc_province_id").getValue())) {
                  msg += "<span style='white-space: nowrap;'>- กรุณาระบุ จังหวัด</span><br>";
                }
                if (["", null, undefined].includes(Ext.getCmp("dc_district_id").getValue())) {
                  msg += "<span style='white-space: nowrap;'>- กรุณาระบุ เขต/อำเภอ</span><br>";
                }
                if (["", null, undefined].includes(Ext.getCmp("dc_tambon_id").getValue())) {
                  msg += "<span style='white-space: nowrap;'>- กรุณาระบุ แขวง/ตำบล</span><br>";
                }
                if (["", null, undefined].includes(Ext.getCmp("tax_c_post_code").getValue())) {
                  msg += "<span style='white-space: nowrap;'>- กรุณาระบุ รหัสไปรษณีย์</span><br>";
                }
              }
              if (["", null, undefined].includes(Ext.getCmp("dc_title_id").getValue())) {
                msg += "<span style='white-space: nowrap;'>- กรุณาระบุ คำนำหน้า</span><br>";
              }
              if (["", null, undefined].includes(Ext.getCmp("tax_c_nameID").getValue())) {
                msg += "<span style='white-space: nowrap;'>- กรุณากรอก ชื่อ</span><br>";
              }
              if (msg == "") {
                Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
                // SAVE_CREDITOR_ADD
                // console.log(red) ;
                Ext.Ajax.request({
                  url: "../po/api/mn_poEditCreditorTax.php",
                  method: "POST",
                  params: {
                    mode: (Ext.butt == "edit")? "SAVE_CREDITOR_TAX" : "SAVE_CREDITOR_ADD",
                    dc_creditor_id: Ext.HDR_ID,
                    c_name : Ext.getCmp("c_nameID").getValue(),
                    c_comment : Ext.getCmp("c_comment").getValue(),
                    inv_name: Ext.getCmp("inv_nameID").getValue(),

                    c_map_vsn : Ext.getCmp("c_map_vsnID").getValue(),
                    c_map_ephis : Ext.getCmp("c_map_ephisID").getValue(),
                    c_tax_number_imp: Ext.getCmp("c_tax_number_imp").getValue(),
                    dc_tax_customer_id: Ext.getCmp("dc_tax_customer_id").getValue(),
                    i_key : Ext.getCmp("i_key").getValue().inputValue,
                    i_enable : Ext.getCmp("i_enableID").getValue().inputValue,
                    tax_c_title: Ext.getCmp("dc_title_id").lastSelectionText,
                    tax_c_name: Ext.getCmp("tax_c_nameID").getValue(),
                    tax_c_last_name: Ext.getCmp("tax_c_last_name").getValue(),
                    tax_c_branch: Ext.getCmp("tax_c_branch").getValue(),
                    tax_c_bldg: Ext.getCmp("tax_c_bldg").getValue(),
                    tax_c_room_no: Ext.getCmp("tax_c_room_no").getValue(),
                    tax_c_floor: Ext.getCmp("tax_c_floor").getValue(),
                    tax_c_village: Ext.getCmp("tax_c_village").getValue(),
                    tax_c_house_no: Ext.getCmp("tax_c_house_no").getValue(),
                    tax_c_village_no: Ext.getCmp("tax_c_village_no").getValue(),
                    tax_c_lane: Ext.getCmp("tax_c_lane").getValue(),
                    tax_c_road: Ext.getCmp("tax_c_road").getValue(),
                    tax_c_province: Ext.getCmp("dc_province_id").lastSelectionText,
                    tax_c_district: Ext.getCmp("dc_district_id").lastSelectionText,
                    tax_c_tambon: Ext.getCmp("dc_tambon_id").lastSelectionText,
                    tax_c_post_code: Ext.getCmp("tax_c_post_code").lastSelectionText,
                    dc_tambon_id: Ext.getCmp("dc_tambon_id").getValue(),
                    c_tele_imp: Ext.getCmp("c_tele_imp").getValue(),
                    c_email: Ext.getCmp("c_email").getValue(),
                  },
                  success: function (result, request) {
                    Ext.getCmp("contenterCenter").getEl().unmask();
                    let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                    // Ext.storeDtl.load({ params: { mode: "" } });
                    if (jsonData.success == true) {
                      Ext.Msg.alert("แจ้งเตือน", "บันทึกเรียบร้อย");
                      Ext.transfer = jsonData.id;
                      // Ext.getCmp("dc_tax_customer_idID").setValue(Ext.getCmp("dc_tax_customer_id").getValue());
                      // Ext.getCmp("window-edit-creditor").hide();
                      Ext.getCmp("frm-Add").destroy();
                      Ext.store.load();
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
