Ext.HDR_ID = null;

Ext.txt_save = "รับคืนทักท้วง";

const deleteHdr = function (type) {
  let msg = "";

  if (msg == "") {
    var DeleteComit = function (type) {
      Ext.getCmp("frm-Add").getEl().mask("Please wait...", "x-mask-loading");
      Ext.Ajax.request({
        url: "api/mn_poReg.php",
        method: "POST",
        params: {
          mode: "DELETE",
          id: Ext.HDR_ID,
          c_code_ref: Ext.dataSelect.c_code_ref,
        },
        success: function (result, request) {
          Ext.getCmp("frm-Add").getEl().unmask();
          let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
          if (jsonData.success == "Success") {
            Ext.store.load({ params: { mode: "" } });
            Ext.MessageBox.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + jsonData.msg + "</span>");
            Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not errer
            chkLoadingStore(Ext.myComboStores, "contenterCenter", function () {});
            Ext.po_creditor_transfer.load();
            Ext.po_creditor.load();
            Ext.po_emp.load();
            Ext.store.load();
            Ext.getCmp("MessageBox_re").hide();
            Ext.getCmp("MessageBox_re").destroy();
          } else {
            Ext.MessageBox.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + jsonData.msg + "</span>");
            Ext.getCmp("MessageBox_re").hide();
            Ext.getCmp("MessageBox_re").destroy();
          }
        },
        failure: function (result, request) {
          Ext.MessageBox.alert("Failed", result.responseText);
          Ext.getCmp("MessageBox_re").hide();
          Ext.getCmp("MessageBox_re").destroy();
        },
      });
    };

    var win = new Ext.Window({
      id: "MessageBox_re",
      title: "ยันยืนการลบใบขอเบิก ",
      modal: true,
      width: 310,
      // height: 150,
      items: [
        {
          xtype: "form",
          id: "form-widgets",
          frame: true,
          labelAlign: "right",
          labelWidth: 0.1,
          bodyStyle: { padding: "10px 20px" },
          defaults: { anchor: "100%", msgTarget: "side" },
          items: [
            {
              xtype: "displayfield",
              id: "displaytext",
              width: 200,
              value: "การลบใบขอเบิกจะไม่สามารถกู้คืนได้",
              style: "text-align: center; color:red; white-space: nowrap;",
            },
            {
              xtype: "textfield",
              enableKeyEvents: true,
              id: "confirm_text",
              width: 200,
              value: "",
              style: "text-align: center;",
              emptyText: 'กรุณากรอก "ยืนยัน" เพื่อลบรายการ',
              listeners: {
                keyup: function () {
                  if (Ext.getCmp("confirm_text").getValue() == "ยืนยัน") {
                    Ext.getCmp("Save_cancel_over").setDisabled(false);
                  } else {
                    Ext.getCmp("Save_cancel_over").setDisabled(true);
                  }
                },
              },
            },
          ],
        },
      ],
      buttonAlign: "left",
      buttons: [
        {
          text: "บันทึกรายการ",
          id: "Save_cancel_over",
          iconCls: "icon-save",
          disabled: true,
          handler: function () {
            DeleteComit();
          },
        },
        { xtype: "tbfill" },
        {
          text: "ย้อนกลับ",
          handler: function () {
            Ext.getCmp("MessageBox_re").hide();
            Ext.getCmp("MessageBox_re").destroy();
          },
        },
      ],
    }).show();
  } else {
    Ext.Msg.alert("แจ้งเตือน", msg);
  }
}; // delectHdr

const load_f_income_total = function (i_budget_year, dc_expense_budget_type_id, bg_expense_id, dc_cost_id) {
  Ext.f_income_total.load({
    params: {
      i_budget_year: i_budget_year,
      dc_expense_budget_type_id: dc_expense_budget_type_id,
      bg_expense_id: bg_expense_id,
      dc_cost_id: dc_cost_id,
    },
    callback: function (records, operation, success) {
      if (success) {
        var f_income_total = Ext.f_income_total.getAt(0).data.f_income_total;
        if (Ext.getCmp("f_income_total")) Ext.getCmp("f_income_total").setValue(f_income_total);
        // Ext.getCmp("f_income_total").fn();
      }
    },
  });
};

function StoreLoadWithPromise(store, params) {
  return new Promise((resolve, reject) => {
    store.load({
      params: params,
      callback: (records, operation, success) => {
        success ? resolve(records) : reject(`Failed to load ${store}`);
      },
    });
  });
}

creditor_taxdata_load = function (dc_creditor_id) {
  if (dc_creditor_id) {
    Ext.creditor_taxdata.load({
      params: { dc_creditor_id: dc_creditor_id },
      callback: function (recordx, operation, success) {
        if (Ext.creditor_taxdata.getAt(0)) {
          var data = Ext.creditor_taxdata.getAt(0).data;
          var title_district = data.tax_c_province == "กรุงเทพมหานคร" ? "เขต" : "อำเภอ";
          var title_tambon = data.tax_c_province == "กรุงเทพมหานคร" ? "แขวง" : "ตำบล";
          var text_tax = "เลขประจำตัวผู้เสียภาษี: " + data.c_tax_number_imp + "\n";
          text_tax += "ประเภทกิจการทางภาษี: " + data.c_name_tax_customer + " : " + data.c_name_tax_income + "\n";
          text_tax += "ชื่อ: " + data.tax_c_title + data.tax_c_name + (data.tax_c_middle_name ? " " + data.tax_c_middle_name : "") + (data.tax_c_last_name ? " " + data.tax_c_last_name : "") + "\n";
          text_tax += data.tax_c_branch ? "สาขา: " + data.tax_c_branch + "\n" : "";
          text_tax += "ที่อยู่: " + (data.tax_c_bldg ? "อาคาร " + data.tax_c_bldg + " " : "") + (data.tax_c_room_no ? "ห้อง " + data.tax_c_room_no + " " : "") + (data.tax_c_floor ? "ชั้น " + data.tax_c_floor + " " : "") + (data.tax_c_village ? "หมู่บ้าน " + data.tax_c_village + " " : "") + "\n";
          text_tax += "        " + (data.tax_c_house_no ? "เลขที่ " + data.tax_c_house_no + " " : "") + (data.tax_c_village_no ? "หมู่ที่ " + data.tax_c_village_no + " " : "") + (data.tax_c_lane ? "ซอย" + data.tax_c_lane + " " : "") + (data.tax_c_road ? "ถนน" + data.tax_c_road + " " : "") + "\n";
          text_tax += "        " + (data.tax_c_tambon ? title_tambon + data.tax_c_tambon + " " : "") + (data.tax_c_district ? title_district + data.tax_c_district + " " : "") + (data.tax_c_province ? "จังหวัด" + data.tax_c_province + " " : "") + data.tax_c_post_code + "\n";
          text_tax += "เบอร์โทรศัพท์: " + data.c_tele_imp + "\n";
          text_tax += "อีเมล: " + data.c_email;
          Ext.getCmp("textarea_tax").setValue(text_tax);

          var msg = "";
          if (["", null, undefined].includes(data.c_name_tax_customer)) {
            msg += "<span style='white-space: nowrap;'>&nbsp;&nbsp;&nbsp;&nbsp;กรุณาระบุ ประเภทกิจการทางภาษี</span><br>";
          }
          if (data.c_name_tax_income != "") {
            if (["", null, undefined].includes(data.c_tax_number_imp)) {
              msg += "<span style='white-space: nowrap;'>&nbsp;&nbsp;&nbsp;&nbsp;กรุณากรอก เลขประจําตัวผู้เสียภาษี</span><br>";
            }
            if (["", null, undefined].includes(data.tax_c_title)) {
              msg += "<span style='white-space: nowrap;'>&nbsp;&nbsp;&nbsp;&nbsp;กรุณาระบุ คำนำหน้า</span><br>";
            }
            if (["", null, undefined].includes(data.tax_c_name)) {
              msg += "<span style='white-space: nowrap;'>&nbsp;&nbsp;&nbsp;&nbsp;กรุณากรอก ชื่อ</span><br>";
            }
            if (["", null, undefined].includes(data.tax_c_house_no)) {
              msg += "<span style='white-space: nowrap;'>&nbsp;&nbsp;&nbsp;&nbsp;กรุณากรอก เลขที่</span><br>";
            }
            if (["", null, undefined].includes(data.tax_c_province)) {
              msg += "<span style='white-space: nowrap;'>&nbsp;&nbsp;&nbsp;&nbsp;กรุณาระบุ จังหวัด</span><br>";
            }
            if (["", null, undefined].includes(data.tax_c_district)) {
              msg += "<span style='white-space: nowrap;'>&nbsp;&nbsp;&nbsp;&nbsp;กรุณาระบุ เขต/อำเภอ</span><br>";
            }
            if (["", null, undefined].includes(data.tax_c_tambon)) {
              msg += "<span style='white-space: nowrap;'>&nbsp;&nbsp;&nbsp;&nbsp;กรุณาระบุ แขวง/ตำบล</span><br>";
            }
            if (["", null, undefined].includes(data.tax_c_post_code)) {
              msg += "<span style='white-space: nowrap;'>&nbsp;&nbsp;&nbsp;&nbsp;กรุณาระบุ รหัสไปรษณีย์</span><br>";
            }
          }
          Ext.tax_msg = msg == "" ? "" : "<span style='white-space: nowrap;'>- ข้อมูลทางภาษีไม่ครบถ้วน</span><br>" + msg;
        }
      },
    });
  }
};
const edit_creditor_datatax = function (data) {
  var msg = "";
  if (data.getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณาระบุจ่ายให้</span><br>";
  }
  if (msg == "") {
    Ext.creditor_taxdata.load({
      params: { dc_creditor_id: data.getValue() },
      callback: function (recordx, operation, success) {
        var data_ = Ext.creditor_taxdata.getAt(0).data;
        Ext.dc_district.load({
          params: { dc_province_id: data_.dc_province_id },
          callback: function (recordx, operation, success) {
            Ext.dc_tambon.load({
              params: { dc_district_id: data_.dc_district_id },
              callback: function (recordx, operation, success) {
                var c_post_code_all = data_.c_post_code_all;
                if (c_post_code_all) {
                  var parts = c_post_code_all.split("/");
                  var dataToAdd = parts.map(function (part) {
                    return { c_code: part };
                  });
                  Ext.c_post_code.loadData(dataToAdd);
                }
                return new Ext.Window({
                  id: "window-edit-creditor",
                  title: "ข้อมูลผู้เสียภาษี : " + data.lastSelectionText,
                  modal: true,
                  width: 695,
                  resizable: false,
                  // layout: 'fit',
                  items: new Ext.FormPanel({
                    id: "Form-edit_creditor_datatax",
                    frame: true,
                    labelAlign: "left",
                    bodyStyle: "padding:1px",
                    listeners: {
                      afterrender: function () {
                        Ext.getCmp("Form-edit_creditor_datatax").getForm().loadRecord(Ext.creditor_taxdata.getAt(0));
                        var labels = Ext.getCmp("Form-edit_creditor_datatax").find("name", "red_star");
                        var red_star = Ext.getCmp("c_name_tax_income").getValue() == "" ? " " : "*";
                        for (var i = 0; i < labels.length; i++) {
                          var label = labels[i];
                          label.setText(red_star);
                        }
                      },
                    },
                    items: [
                      {
                        xtype: "buttongroup",
                        frame: false,
                        border: false,
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
                      {
                        xtype: "buttongroup",
                        frame: false,
                        border: false,
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
                            id: "tax_c_name",
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
                            id: "tax_c_middle_name",
                            name: "tax_c_middle_name",
                            width: 150,
                            emptyText: "ชื่อกลาง",
                            listeners: {
                              render: function (c) {
                                var text_ToolTip = "<span style='white-space:nowrap;'>ชื่อกลาง</span>";
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
                            },
                          },
                        ],
                      },
                      { xtype: "container", height: 5 },
                      {
                        xtype: "buttongroup",
                        frame: false,
                        border: false,
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
                  }),
                  buttons: [
                    {
                      text: "ยืนยัน",
                      handler: function () {
                        let msg = "";
                        if (["", null, undefined].includes(Ext.getCmp("dc_tax_customer_id").getValue())) {
                          msg += "<span style='white-space: nowrap;'>- กรุณาระบุ ประเภทกิจการทางภาษี</span><br>";
                        }
                        if (Ext.getCmp("c_name_tax_income").getValue() != "") {
                          if (!Ext.getCmp("Form-edit_creditor_datatax").getForm().isValid()) {
                            msg += "<span style='white-space: nowrap;'>- กรุณาระบุข้อมูลให้ถูกต้อง</span>";
                          }
                          if (["", null, undefined].includes(Ext.getCmp("c_tax_number_imp").getValue())) {
                            msg += "<span style='white-space: nowrap;'>- กรุณากรอก เลขประจําตัวผู้เสียภาษี</span><br>";
                          }
                          if (["", null, undefined].includes(Ext.getCmp("dc_title_id").getValue())) {
                            msg += "<span style='white-space: nowrap;'>- กรุณาระบุ คำนำหน้า</span><br>";
                          }
                          if (["", null, undefined].includes(Ext.getCmp("tax_c_name").getValue())) {
                            msg += "<span style='white-space: nowrap;'>- กรุณากรอก ชื่อ</span><br>";
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

                        if (msg == "") {
                          Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
                          Ext.Ajax.request({
                            url: "api/mn_poEditCreditorTax.php",
                            method: "POST",
                            params: {
                              mode: "SAVE_CREDITOR_TAX",
                              dc_creditor_id: data.getValue(),

                              c_tax_number_imp: Ext.getCmp("c_tax_number_imp").getValue(),
                              dc_tax_customer_id: Ext.getCmp("dc_tax_customer_id").getValue(),

                              tax_c_title: Ext.getCmp("dc_title_id").lastSelectionText,
                              tax_c_name: Ext.getCmp("tax_c_name").getValue(),
                              tax_c_middle_name: Ext.getCmp("tax_c_middle_name").getValue(),
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
                                Ext.getCmp("dc_tax_customer_idID").setValue(Ext.getCmp("dc_tax_customer_id").getValue());
                                creditor_taxdata_load(data.getValue());
                                Ext.getCmp("window-edit-creditor").hide();
                                Ext.getCmp("window-edit-creditor").destroy();
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
                        Ext.getCmp("window-edit-creditor").hide();
                        Ext.getCmp("window-edit-creditor").destroy();
                      },
                    },
                  ],
                }).show();
              },
            });
          },
        });
      },
    });
  } else {
    Ext.Msg.alert("แจ้งเตือน", msg);
  }
}; //edit_creditor_datatax

f_per_pay_sum = function () {
  var f_per_pay =
    Ext.getCmp("f_inv_vat").getValue().replace(/,/g, "") -
    Ext.getCmp("f_tax_personal").getValue().replace(/,/g, "") -
    Ext.getCmp("f_social_security").getValue().replace(/,/g, "") -
    Ext.getCmp("f_prov_fund").getValue().replace(/,/g, "") -
    Ext.getCmp("f_fine").getValue().replace(/,/g, "") -
    Ext.getCmp("f_warranty").getValue().replace(/,/g, "") -
    Ext.getCmp("f_other").getValue().replace(/,/g, "");

  Ext.getCmp("f_pay").setValue(floatRenderer(floatMinus(f_per_pay.toFixed(2), 2)));
};

calculate_vat = function (record, type) {
  var data = { f_inv: null, f_vat: null, f_inv_vat: null };
  if (type == 1 && record.data.f_inv) {
    var f_inv = record.data.f_inv;
    var f_vat = f_inv.replace(/,/g, "") * 0.07;
    f_vat = Math.round(f_vat * 100) / 100;
    f_vat = f_vat.toFixed(2);

    var f_inv_vat = parseFloat(f_inv.replace(/,/g, "")) + parseFloat(f_vat.replace(/,/g, ""));
    f_inv_vat = f_inv_vat.toFixed(2);
    // Ext.getCmp("f_inv").setValue(floatRenderer(floatMinus(f_inv.toFixed(2), 2)));

    data = { f_inv: f_inv, f_vat: f_vat, f_inv_vat: f_inv_vat };
  } else if (type == 2 && record.data.f_inv_vat) {
    var f_inv_vat = record.data.f_inv_vat;
    var f_vat = (f_inv_vat.replace(/,/g, "") / 1.07) * 0.07;
    f_vat = Math.round(f_vat * 100) / 100;
    f_vat = f_vat.toFixed(2);

    var f_inv = f_inv_vat.replace(/,/g, "") - f_vat.replace(/,/g, "");
    f_inv = f_inv.toFixed(2);
    // Ext.getCmp("f_inv").setValue(floatRenderer(floatMinus(f_inv.toFixed(2), 2)));
    data = { f_inv: f_inv, f_vat: f_vat, f_inv_vat: f_inv_vat };
  }
  return data;
};

rowContextmenu_gridAcc = function (grid, rowIndex, e) {
  e.stopEvent();
  // grid.getSelectionModel().selectRow(rowIndex);
  var record = grid.store.getAt(rowIndex);
  var menu = new Ext.menu.Menu();
  menu.showAt(e.getXY());
  if (record.data.f_inv) {
    menu.add({
      text: "คำนวณ Vat",
      icon: "../images/icons/calculator.png",
      scope: this,
      handler: function (e) {
        var cal_vat = calculate_vat(record, 1);
        record.set("f_inv", cal_vat.f_inv);
        record.set("f_vat", cal_vat.f_vat);
        record.set("f_inv_vat", cal_vat.f_inv_vat);
        sum_debt_label();
      },
    });
  }
  if (record.data.f_inv_vat) {
    menu.add({
      text: "ถอด Vat",
      icon: "../images/icons/calculator.png",
      scope: this,
      handler: function (e) {
        var cal_vat = calculate_vat(record, 2);
        record.set("f_inv", cal_vat.f_inv);
        record.set("f_vat", cal_vat.f_vat);
        record.set("f_inv_vat", cal_vat.f_inv_vat);
        sum_debt_label();
      },
    });
  }
};

function sum_debt_label() {
  var sum_debt = 0;
  Ext.po_working_begin_item.each(function (record) {
    var f_inv_vat = record.get("f_inv_vat") ? record.get("f_inv_vat") : "0";
    sum_debt += parseFloat(parseFloat(f_inv_vat.replace(/,/g, "")).toFixed(2));
  });
  sum_debt = parseFloat(sum_debt).toFixed(2);
  document.getElementById("sum_debt_label").innerHTML = floatRenderer(floatMinus(sum_debt.replace(/,/g, ""), 2));
}

function sum_begin_item(field) {
  var sum_debt = 0;
  Ext.po_working_begin_item.each(function (record) {
    var f_inv_vat = record.get(field) ? record.get(field) : "0";
    sum_debt += parseFloat(parseFloat(f_inv_vat.replace(/,/g, "")).toFixed(2));
  });
  sum_debt = parseFloat(sum_debt).toFixed(2);
  sum_debt = floatRenderer(floatMinus(sum_debt.replace(/,/g, ""), 2));
  return sum_debt;
  document.getElementById("sum_debt_label").innerHTML = floatRenderer(floatMinus(sum_debt.replace(/,/g, ""), 2));
}

ReadOnly_set = function (eleId, set) {
  Ext.getCmp(eleId).setReadOnly(set);
  Ext.getCmp(eleId).getEl().dom.style.background = set ? "#EEEEEE" : "";
};
setReadOnlyForProtest = function (set) {
  ReadOnly_set("dc_cost_acc_id", set);
  ReadOnly_set("dc_cost_idID", set);
  ReadOnly_set("i_working_type", set);
  ReadOnly_set("i_budget_year", set);
  ReadOnly_set("i_budget_year_overlap", set);
};

setReadOnly_D_AP = function () {
  ReadOnly_set("dc_cost_acc_id", true);
  ReadOnly_set("dc_cost_idID", true);
  ReadOnly_set("i_working_type", true);
  ReadOnly_set("i_budget_year", true);
  ReadOnly_set("c_code_per", true);
  ReadOnly_set("i_budget_year_overlap", true);
  ReadOnly_set("c_bookingID", true);
  ReadOnly_set("c_heading", true);
  ReadOnly_set("dc_expense_budget_type_id", true);
  ReadOnly_set("bg_expense_id", true);
  ReadOnly_set("c_code_invoice", true);
  ReadOnly_set("dc_creditor_idID", true);
  ReadOnly_set("dc_creditor_transfer_id", true);
  ReadOnly_set("dc_bank_acc_creditor_id", true);
  ReadOnly_set("i_type_transfer", true);
  ReadOnly_set("c_qtyID", true);
  ReadOnly_set("f_total", true);
  ReadOnly_set("d_audit_date", true);
  ReadOnly_set("c_commentID", true);
  ReadOnly_set("i_doc_duo", true);
  Ext.getCmp("i_doc_duo").disable();
  ReadOnly_set("f_inv", true);
  ReadOnly_set("check_vat", true);
  Ext.getCmp("check_vat").disable();
  ReadOnly_set("f_vat", true);
  ReadOnly_set("f_vat_rate", true);
  ReadOnly_set("check_tax_personal", true);
  Ext.getCmp("check_tax_personal").disable();
  ReadOnly_set("f_tax_personal", true);
  ReadOnly_set("f_tax_personal_rate", true);
  ReadOnly_set("f_social_security", true);
  ReadOnly_set("f_prov_fund", true);
  ReadOnly_set("f_fine", true);
  ReadOnly_set("f_warranty", true);
  ReadOnly_set("f_other", true);

  ReadOnly_set("c_debt_month", true);
  ReadOnly_set("c_debt_year", true);
  Ext.getCmp("button_add_acc").hide();
  // Ext.getCmp("delete").hide();
  if (!(Ext.session.user_id == 1)) {
    Ext.getCmp("gridAcc").on("beforeedit", function (editor) {
      /** เปลื่ยน 0 เป็น dc_user_id ที่ต้องการให้แก้ vat ได้ **/
      if ([0].includes(parseInt(Ext.session.user_id))) {
        if (![3, 4].includes(editor.column)) {
          return false;
        }
      } else {
        return false;
      }
    });
  }
  Ext.getCmp("gridAcc").getColumnModel().setHidden(Ext.getCmp("gridAcc").getColumnModel().getIndexById("delete"), true);
};

Ext.Poplov_in = Ext.extend(Ext.Button, {
  config: {},
  initComponent: function () {
    this.mini = this.Minipop();
    this.isCellClickGrid = false;
    this.isSetFilter = false;
    this.setReset();
  },

  setReset: function (t) {
    if (t) {
      Ext.getCmp(this.id + "_Name").setValue();
      Ext.getCmp(this.id).setValue();
    }
  },
  afterrender: function () {},
  uiSearch: function (id) {
    var store = this.store;
    var headerGrid = this.headerGrid;
    var id = id;

    var setDefaultFilter = [
      // ["c_code", "รหัส"],
      ["c_code_per", "เลขอ้างอิง"],
      // ["c_title", "ชื่อเรื่อง"],
    ];
    var setFilter = this.setFilter;

    var filterGrid = new Ext.data.SimpleStore({
      fields: ["value", "text"],
      data: this.isSetFilter ? setFilter : setDefaultFilter,
    });
    var store = this.store;

    var filterGrid = Ext.isEmpty(this.filterGrid) ? filterGrid : this.filterGrid; //comb&store filter
    var defFilter = this.defFilter; //default filter

    return [
      {
        id: "filter" + id,
        xtype: "combo",
        width: 130,
        mode: "local",
        store: filterGrid,
        valueField: "value",
        displayField: "text",
        allowBlank: false,
        editable: false,
        triggerAction: "all",
        typeAhead: false,
        value: Ext.isEmpty(defFilter) ? "c_title" : defFilter,
      },
      "-",
      {
        id: "value-box" + id,
        xtype: "textfield",
        width: 130,
        fieldLabel: "fieldLabel",
        emptyText: "คำที่ต้องการค้นหา",
        listeners: {
          specialkey: function (f, e) {
            if (e.getKey() == e.ENTER) {
              store.setBaseParam("mode", "SEARCH");
              store.setBaseParam("filter", Ext.getCmp("filter" + id).getValue());
              store.setBaseParam("value", Ext.getCmp("value-box" + id).getValue());
              Ext.getCmp("win-pop-lov-modal-" + id)
                .getStore()
                .load();
            }
          },
        },
      },
    ];
  },

  uiSearchExtra: function (id) {
    var store = this.store;
    var headerGrid = this.headerGrid;
    var id = id;
    if (id == "select_dataID_wm") {
      return [
        {
          id: "i_type_" + "select_dataID_wm",
          xtype: "combo",
          width: 130,
          mode: "local",
          store: new Ext.data.SimpleStore({
            fields: ["id", "c_name"],
            data: [
              ["1", "รายการปกติ"],
              ["2", "กองทุนคณะแพทย์"],
              ["3", "รายการจัดกลุ่ม(ปกติ)"],
              ["4", "รายการจัดกลุ่ม(กองทุนคณะแพทย์)"],
            ],
          }),
          valueField: "id",
          displayField: "c_name",
          allowBlank: false,
          editable: false,
          triggerAction: "all",
          typeAhead: false,
          value: "1",
        },
        "-",
      ];
    }
    if (id == "select_dataID_wt") {
      return [
        {
          id: "i_type_" + "select_dataID_wt",
          xtype: "combo",
          width: 130,
          mode: "local",
          store: new Ext.data.SimpleStore({
            fields: ["id", "c_name"],
            data: [
              ["1", "(TF) โอนงบประมาณ"],
              ["2", "(RGA) จัดสรรรายได้ส่วนงาน"],
            ],
          }),
          valueField: "id",
          displayField: "c_name",
          allowBlank: false,
          editable: false,
          triggerAction: "all",
          typeAhead: false,
          value: "1",
        },
        "-",
      ];
    } else {
      return [];
    }
  },

  Minipop: function () {
    /******/
    var me = this;
    var store = this.store;
    var headerGrid = this.headerGrid;
    var id = this.id;
    var nameID = this.id + "_Name";
    var widthText = isNaN(this.widthText) ? 198 : this.widthText;
    var uiSearch = this.uiSearch(id);
    var uiSearchExtra = this.uiSearchExtra(id);

    /*****/
    var afterrenderPop = function () {};
    afterrenderPop = this.afterrenderPop ? this.afterrenderPop : afterrenderPop;

    function SearchGrid(store, id) {
      if (Ext.getCmp("value-box" + id).getValue() != "") {
        store.setBaseParam("mode", "SEARCH");
        store.setBaseParam("filter", Ext.getCmp("filter" + id).getValue());
        store.setBaseParam("value", Ext.getCmp("value-box" + id).getValue());
        Ext.getCmp("win-pop-lov-modal-" + id)
          .getStore()
          .load();
      } else {
        store.setBaseParam("mode", "");
        Ext.getCmp("win-pop-lov-modal-" + id)
          .getStore()
          .load();
      }
    }

    var cellClick_lov = function (grid, rowIndex, columnIndex, e) {
      var record = grid.getStore().getAt(rowIndex);
      var TextShow = record.data.c_code + " " + record.data.c_name;

      Ext.getCmp(id).setValue(record.data.id);
      Ext.getCmp(nameID).setValue(TextShow);

      Ext.getCmp("win-pop-lov" + id).hide();
      Ext.getCmp("win-pop-lov" + id).destroy();
    };

    cellClick_lov = this.isCellClickGrid ? this.cellClickGrid : cellClick_lov;

    return {
      fieldLabel: this.fieldLabel,
      xtype: "radiogroup",
      id: "pop_" + this.id,
      columns: [0, widthText, 40],
      hidden: this.hidden == true ? true : false,
      listeners: {
        afterrender: this.afterrender,
      },
      items: [
        {
          xtype: "hidden",
          name: this.valueHidden,
          id: id,
          value: this.value,
        },
        {
          xtype: "textfield",
          name: "txt" + this.id,
          emptyText: this.text,
          id: nameID,
          readOnly: true,
        },
        {
          xtype: "button",
          id: "Bu" + this.id,
          name: "Bu" + this.id,
          iconCls: this.iconCls,
          handler: function () {
            // store.setBaseParam("hdr_id", Ext.HDR_ID);

            var win = new Ext.Window({
              id: "win-pop-lov" + id,
              title: "เลือกข้อมูล",
              modal: true,
              plain: true,
              layout: "fit",
              maximizable: true,
              constrainHeader: true,
              closable: true,
              listeners: {
                afterrender: function (obj, eOpts) {
                  this.fn = function (widht, height) {
                    //percentage
                    var width = Ext.getBody().getViewSize().width * widht;
                    var height = Ext.getBody().getViewSize().height * height;
                    this.setSize(width, height);
                  };
                  this.fn(0.8, 0.85);
                  afterrenderPop(me);
                  store.load();
                },
                maximize: function (window, opts) {
                  //when property minimizable
                  window.setWidth(Ext.getBody().getViewSize().width * 0.99);
                  window.expand("", false);
                  window.center();
                },
              },
              items: [
                {
                  xtype: "grid",
                  id: "win-pop-lov-modal-" + id,
                  border: false,
                  stripeRows: true,
                  loadMask: true,
                  store: store,
                  tbar: [
                    uiSearchExtra,
                    uiSearch,
                    {
                      text: "ค้นหา",
                      id: "magnifier_" + id,
                      iconCls: "icon-magnifier",
                      handler: function () {
                        if (id == "select_dataID_wm") {
                          if (Ext.getCmp("i_type_" + id).getValue() == "1") {
                            store.setBaseParam("i_group", 0);
                            store.setBaseParam("i_fund", 0);
                          } else if (Ext.getCmp("i_type_" + id).getValue() == "2") {
                            store.setBaseParam("i_group", 0);
                            store.setBaseParam("i_fund", 1);
                          } else if (Ext.getCmp("i_type_" + id).getValue() == "3") {
                            store.setBaseParam("i_group", 1);
                            store.setBaseParam("i_fund", 0);
                          } else if (Ext.getCmp("i_type_" + id).getValue() == "4") {
                            store.setBaseParam("i_group", 1);
                            store.setBaseParam("i_fund", 1);
                          }
                        } else if (id == "select_dataID_wt") {
                          if (Ext.getCmp("i_type_" + id).getValue() == "1") {
                            store.setBaseParam("c_type_code", "TF");
                          } else if (Ext.getCmp("i_type_" + id).getValue() == "2") {
                            store.setBaseParam("c_type_code", "RGA");
                          }
                        }
                        SearchGrid(store, id); /*SearchEngin(store,id);*/
                      },
                    },
                  ],
                  columns: headerGrid,
                  listeners: {
                    afterrender: function (grid, eOpts) {
                      this.fn = function (widht, height) {
                        var width = Ext.getBody().getViewSize().width * widht;
                        var height = Ext.getBody().getViewSize().height * height;
                        this.setSize(width, height);
                      };
                      this.fn(0.5, 0.4);

                      /** righ click **/
                      var element = Ext.get(grid.getView().mainHd.id);
                      element.on("contextmenu", function (e, t) {
                        e.stopEvent();
                        var menu = new Ext.menu.Menu();
                        menu.add({
                          text: "Refresh",
                          icon: "../images/icons/arrow_refresh_small.png",
                          scope: this,
                          handler: function (e) {
                            grid.store.load();
                          },
                        });
                        if (Ext.session.user_id == 1) {
                          menu.addSeparator();
                          menu.add(
                            new Ext.menu.Item({
                              text: "show only admin",
                              disabled: true,
                              cls: "menu-separator-text",
                            })
                          );
                          menu.add({
                            text: "Inspect SQL",
                            icon: "../images/icons/script_lightning.png",
                            scope: this,
                            handler: function (e) {
                              grid.store.load({ params: { show_sql: 1 } });
                            },
                          });
                        }
                        menu.showAt(e.getXY());
                      });
                    },
                  },
                  autoExpandColumn: "c_title",
                  bbar: new Ext.PagingToolbar({
                    pageSize: 15,
                    store: store,
                    displayInfo: true,
                    displayMsg: "Displaying topics {0} - {1} of {2}",
                  }),
                },
              ],
            });

            win.show();
            Ext.getCmp("win-pop-lov-modal-" + id).on("cellclick", cellClick_lov, this);
          },
        },
      ],
    };
  }, //Mini
});

const select_begin = function (re) {
  var record = re;
  // console.log(record.Ajaxdata.po_creditor_id);
  // let index_id = Ext.store.findExact("id", record.data.po_creditor_id);
  // var record = Ext.storeDtl.getAt(index);
  Promise.all([])
    .then(() => {
      Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
    })
    .then(() => {
      return StoreLoadWithPromise(Ext.dc_expense_budget_type, { dc_cost_acc_id: record.data.dc_cost_acc_id });
    })
    .then(() => {
      return StoreLoadWithPromise(Ext.dc_cost, { dc_cost_acc_id: record.data.dc_cost_acc_id });
    })
    .then(() => {
      return new Promise((resolve, reject) => {
        Ext.getCmp("form-widgets").getForm().reset();
        Ext.getCmp("form-widgets").getForm().loadRecord(record);
        Ext.getCmp("gl_tran_hdr_id").setValue(record.data.gl_tran_hdr_id);
        Ext.getCmp("c_code_debt").setValue(record.data.c_code_debt);
        Ext.getCmp("d_debt_date").setValue(record.data.d_debt_date);
        Ext.getCmp("c_debt_month").setValue(record.data.c_debt_month);
        Ext.getCmp("c_debt_year").setValue(record.data.c_debt_year);
        resolve();
      });
    })
    .then(() => {
      return new Promise((resolve, reject) => {
        Ext.getCmp("f_total").fn();
        Ext.getCmp("f_inv").fn();
        Ext.getCmp("f_vat_rate").fn();
        Ext.getCmp("f_vat").fn();
        Ext.getCmp("f_inv_vat").fn();
        Ext.getCmp("f_tax_personal").fn();
        Ext.getCmp("f_tax_personal_rate").fn();
        Ext.getCmp("f_social_security").fn();
        Ext.getCmp("f_prov_fund").fn();
        Ext.getCmp("f_fine").fn();
        Ext.getCmp("f_warranty").fn();
        Ext.getCmp("f_other").fn();
        Ext.getCmp("f_pay").fn();

        if (Ext.getCmp("i_budget_year").getValue() > Ext.getCmp("i_budget_year_overlap").getValue()) {
          Ext.getCmp("c_booking_radiogroup").show();
        } else {
          Ext.getCmp("c_booking_radiogroup").hide();
        }

        Ext.getCmp("i_edit_pdf1ID").hide();
        Ext.getCmp("btn_pdf1").hide();
        Ext.getCmp("btn_pdf2").hide();
        Ext.getCmp("i_edit_pdf2ID").hide();

        if (Ext.getCmp("f_vat_rate").getValue() > 0) {
          var checkbox = Ext.getCmp("check_vat");
          var checkHandler = checkbox.initialConfig.listeners.check;
          checkbox.un("check", checkHandler);
          checkbox.setValue(true);
          checkbox.on("check", checkHandler);
          Ext.getCmp("f_vat").setReadOnly(false);
          Ext.getCmp("f_vat").el.setStyle("background", "#fff");
        } else {
          var checkbox = Ext.getCmp("check_vat");
          var checkHandler = checkbox.initialConfig.listeners.check;
          checkbox.un("check", checkHandler);
          checkbox.setValue(false);
          checkbox.on("check", checkHandler);
          Ext.getCmp("f_vat").setReadOnly(true);
          Ext.getCmp("f_vat").el.setStyle("background", "#eee");
        }

        if (Ext.getCmp("f_tax_personal_rate").getValue() > 0) {
          var checkbox = Ext.getCmp("check_tax_personal");
          var checkHandler = checkbox.initialConfig.listeners.check;
          checkbox.un("check", checkHandler);
          checkbox.setValue(true);
          checkbox.on("check", checkHandler);
          Ext.getCmp("f_tax_personal").setReadOnly(false);
          Ext.getCmp("f_tax_personal").el.setStyle("background", "#fff");
        } else {
          var checkbox = Ext.getCmp("check_tax_personal");
          var checkHandler = checkbox.initialConfig.listeners.check;
          checkbox.un("check", checkHandler);
          checkbox.setValue(false);
          checkbox.on("check", checkHandler);
          Ext.getCmp("f_tax_personal").setReadOnly(true);
          Ext.getCmp("f_tax_personal").el.setStyle("background", "#eee");
        }

        if (Ext.getCmp("pdf_upload_mode").getValue().inputValue == 1) {
          Ext.getCmp("BuGroupPdf1").hide();
          Ext.getCmp("upload_pdf1").hide();
        }
        if (Ext.getCmp("modesubID").getValue().inputValue == "ADD") {
          Ext.getCmp("i_edit_pdf2ID").setValue({ i_edit_pdf2IDs1: true });
          Ext.getCmp("upload_pdf2").show();
          Ext.getCmp("title_pdf").setTitle("เอกสารประกอบการใบขอเบิก");
          Ext.getCmp("title_pdf").setTitle("เอกสารประกอบการใบขอเบิก");
          if (!(Ext.butt == "edit")) {
            Ext.getCmp("i_edit_pdf1ID").setValue({ i_edit_pdf1IDs1: true });
            Ext.getCmp("upload_pdf1").show();
          }
        }
        resolve();
      });
    })
    .then(() => {
      if (record.data.dc_creditor_id > 0) {
        creditor_taxdata_load(record.data.dc_creditor_id);
      }
      load_f_income_total(record.data.i_budget_year, record.data.dc_expense_budget_type_id, record.data.bg_expense_id, record.data.dc_cost_id);
      Ext.dc_bank_acc_creditor.load({
        params: { dc_creditor_id: record.data.dc_creditor_transfer_id },
        callback: function (recordx, operation, success) {
          if (Ext.dc_bank_acc_creditor.totalLength > 1) {
            Ext.getCmp("dc_bank_acc_creditor_id").setValue(Ext.dc_bank_acc_creditor.getAt(1).data.id);
          } else {
            Ext.getCmp("dc_bank_acc_creditor_id").setValue(0);
          }
        },
      });
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => {
      Ext.getCmp("contenterCenter").getEl().unmask();
    });
};

cellClick_gridAcc = function (grid, rowIndex, columnIndex, e) {
  let record = grid.getStore().getAt(rowIndex);
  if (columnIndex == grid.getColumnModel().getIndexById("delete")) {
    Ext.po_working_begin_item.removeAt(rowIndex);
    grid.getView().refresh();
  }
}; //cellClick

var data_items_dtl_1 = [];
var data_items_dtl_2 = [];
const window_items_dtl = function () {
  // (data_record, data_rowIndex, data_type) {
  new Ext.Window({
    title: "รายละเอียดการจ่าย : ", // + data_record.data.c_creditor,
    // title: "รายละเอียดการจ่าย : ",
    id: "window-items-dtl",
    layout: "fit",
    modal: true,
    border: false,
    items: [
      new Ext.grid.EditorGridPanel({
        region: "center",
        layout: "fit",
        id: "gridItemDtl",
        width: 750,
        height: 330,
        stripeRows: true,
        loadMask: true,
        clicksToEdit: 1,
        store: Ext.po_working_pay_item,
        viewConfig: {
          emptyText: "ไม่มีข้อมูล..",
          deferEmptyText: true,
        },
        listeners: {
          afterRender: function (grid) {
            this.store.removeAll();
            var data_item = data_items_dtl_1[0];
            if (data_item) {
              Ext.each(data_item, function (v, index, allItems) {
                let myNewRecord = new po_working_pay_item_Record({
                  id: v.id,
                  c_code_bank_acc: v.c_code_bank_acc,
                  c_name_bank_acc: v.c_name_bank_acc,
                  dc_bank_id: v.dc_bank_id,
                  f_total: v.f_total,
                });
                Ext.po_working_pay_item.add(myNewRecord);
              });
            }
            // if (Ext.HDR_ID) {
            //   this.store.load();
            // }
            var element = Ext.get(grid.getView().mainHd.id);
            element.on("contextmenu", function (e, t) {
              e.stopEvent();
              var menu = new Ext.menu.Menu();
              menu.add({
                text: "Refresh",
                icon: "../images/icons/arrow_refresh_small.png",
                scope: this,
                handler: function (e) {
                  grid.store.load();
                },
              });
              if (Ext.session.user_id == 1) {
                menu.addSeparator();
                menu.add(
                  new Ext.menu.Item({
                    text: "show only admin",
                    disabled: true,
                    cls: "menu-separator-text",
                  })
                );
                menu.add({
                  text: "Inspect SQL",
                  icon: "../images/icons/script_lightning.png",
                  scope: this,
                  handler: function (e) {
                    grid.store.load({ params: { show_sql: 1 } });
                  },
                });
              }
              menu.showAt(e.getXY());
            });
          },
        },
        tbar: [
          {
            text: "เพิ่มข้อมูล",
            iconCls: "icon-add",
            handler: function (grid, rowIndex, colIndex) {
              let myNewRecord = new po_working_pay_item_Record({
                id: "",
                c_code_bank_acc: "",
                c_name_bank_acc: "",
                dc_bank_id: "",
                f_total: "",
              });
              Ext.po_working_pay_item.add(myNewRecord);
            },
          },
          "->",
          {
            text: "นำเข้าไฟล์ excel",
            id: "add_dtl",
            iconCls: "import_excel",
            handler: function (grid, rowIndex, colIndex) {
              popDtlExcel();
            },
          },
        ],
        columns: [
          new Ext.grid.RowNumberer(),
          {
            header: "เลขที่บัญชีธนาคาร",
            sortable: false,
            align: "center",
            dataIndex: "c_code_bank_acc",
            width: 160,
            editor: new Ext.form.TextField({
              listeners: {
                afterrender: function () {
                  this.fn = function () {};
                },
                Change: function (value) {
                  this.fn();
                },
              },
            }),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = "style='text-align: left;'";
              return value;
            },
          },
          {
            header: "ชื่อเจ้าของบัญชีธนาคาร",
            sortable: false,
            id: "gridItemDtl_autoExpandColumn_id",
            align: "center",
            dataIndex: "c_name_bank_acc",
            width: 160,
            editor: new Ext.form.TextField({
              listeners: {
                afterrender: function () {
                  this.fn = function () {};
                },
                Change: function (value) {
                  this.fn();
                },
              },
            }),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = "style='text-align: left;'";
              return value;
            },
          },

          {
            header: "ธนาคาร",
            sortable: false,
            align: "center",
            dataIndex: "dc_bank_id",
            width: 160,
            editor: new Ext.form.ComboBox({
              mode: "local",
              id: "editor_dc_bank_id",
              store: Ext.dc_bank,
              valueField: "id",
              displayField: "c_name",
              triggerAction: "all",
              forceSelection: true,
              selectOnFocus: true,
              typeAhead: false,
              emptyText: "กรุณาเลือก...",
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
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (value != "" && value != undefined) {
                metaData.attr = "style='text-align: left;'";
                let name = getStoreItems(Ext.dc_bank, value, "c_name");
                return name;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
            },
          },

          {
            header: "จำนวนเงิน",
            sortable: false,
            align: "center",
            dataIndex: "f_total",
            width: 110,
            editor: new Ext.form.TextField({
              style: "text-align: right; color:blue;",
              listeners: {
                afterrender: function () {
                  this.fn = function () {
                    this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                  };
                },
                Change: function (value) {
                  this.fn();
                },
              },
            }),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (value) {
                metaData.attr = "style='text-align: right; color:blue;'";
                return floatRenderer(floatMinus(value.replace(/,/g, ""), 2));
              } else {
                metaData.attr = "style='text-align: right; color:red;'";
                return "-";
              }
            },
          },
          {
            header: "ลบ",
            align: "center",
            id: "delete",
            sortable: false,
            width: 30,
            dataIndex: "id",
            renderer: function (value, metaData, record, row, col, store, gridView) {
              return '<img src="../images/icons/table_delete.png"); style="cursor:pointer"/>';

              // return '<img src="../images/icons/document_delete.gif"); style="cursor:pointer"/>';
            },
          },
          { width: 5, dataIndex: "" },
        ],
        autoExpandColumn: "gridItemDtl_autoExpandColumn_id",
      }),
    ],
    buttonAlign: "left",
    buttons: [
      {
        text: "&nbsp;บันทึกรายการ&nbsp;",
        iconCls: "icon-save",
        handler: async function () {
          let msg = "";
          let jsonArr = [];
          let sto = Ext.getCmp("gridItemDtl").store.data.items;
          sto.forEach(function (v) {
            jsonArr.push({
              id: "",
              c_code_bank_acc: v.data.c_code_bank_acc,
              c_name_bank_acc: v.data.c_name_bank_acc,
              dc_bank_id: v.data.dc_bank_id,
              f_total: String(v.data.f_total).replace(/,/g, ""),
            });
          });
          // if (data_type == 1) {
          data_items_dtl_1[0] = jsonArr;
          // } else {
          //   data_items_dtl_2[data_rowIndex] = jsonArr;
          // }
          text_show_item_pay_update(data_items_dtl_1[0]);
          Ext.getCmp("window-items-dtl").destroy();
        },
      },
      // {
      //   text: Ext.GLOBAL_BU_BACK_TH,
      //   handler: function () {
      //     Ext.getCmp("window-items-dtl").destroy();
      //   },
      // },
    ],
  }).show();
  cellClick_gridItemDtl = function (grid, rowIndex, columnIndex, e) {
    let record = grid.getStore().getAt(rowIndex);
    if (columnIndex == grid.getColumnModel().getIndexById("delete")) {
      Ext.po_working_pay_item.removeAt(rowIndex);
      grid.getView().refresh();
    }
  };
  Ext.getCmp("gridItemDtl").on("cellclick", cellClick_gridItemDtl, this);
}; // window_items_dtl

const popDtlExcel = function () {
  new Ext.Window({
    title: "นำเข้าไฟล์",
    id: "win-pop-excel",
    modal: true,
    width: 450,
    stripeRows: true,
    loadMask: true,
    labelAlign: "right",
    labelWidth: 200,
    bodyStyle: { padding: "10px 20px" },
    listeners: {
      afterrender: function () {
        setTimeout(() => {
          this.setWidth(451);
        }, 100);
      },
    },
    items: [
      {
        xtype: "container",
        layout: "hbox",
        align: "stretch",
        RemoveHeight: true,
        frame: false,
        defaults: { xtype: "fieldset", flex: 1, margins: "0px 3px", autoHeight: true },
        items: [
          {
            title: "Column สำหรับนำเข้าข้อมูล",
            frame: false,
            RemoveCls: "x-box-item",
            defaults: { labelStyle: "width:130px;", allowBlank: true },
            items: [
              {
                xtype: "textfield",
                fieldLabel: "เลขที่บัญชีธนาคาร",
                width: 130,
                value: "c_code_bank_acc",
                style: "text-align: center;font-weight:bold;background:#eee;",
                readOnly: true,
              },
              {
                xtype: "textfield",
                fieldLabel: "ชื่อเจ้าของบัญชีธนาคาร",
                width: 130,
                value: "c_name_bank_acc",
                style: "text-align: center;font-weight:bold;background:#eee;",
                readOnly: true,
              },
              {
                xtype: "textfield",
                fieldLabel: "ธนาคาร",
                width: 130,
                value: "c_name_bank",
                style: "text-align: center;font-weight:bold;background:#eee;",
                readOnly: true,
                listeners: {
                  render: function (c) {
                    var text = "กรุณาใช้ชื่อธนาคารตามต่อไปนี้";
                    text += "<br>- ธนาคารกรุงไทย";
                    text += "<br>- ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร";
                    text += "<br>- ธนาคารเกียรตินาคินภัทร";
                    text += "<br>- ธนาคารออมสิน";
                    text += "<br>- ธนาคารกรุงเทพ";
                    text += "<br>- ธนาคารไทยพาณิชย์";
                    text += "<br>- ธนาคารอาคารสงเคราะห์";
                    text += "<br>- ธนาคารกสิกรไทย";
                    text += "<br>- ธนาคารทหารไทยธนชาต";
                    text += "<br>- ธนาคารอิสลาม";

                    var text_ToolTip = text;
                    new Ext.ToolTip({
                      target: c.id,
                      anchor: "top",
                      width: 230,
                      dismissDelay: 0, // Tooltip stays visible until mouseout
                      html: text_ToolTip,
                    });
                  },
                },
              },
              {
                xtype: "textfield",
                fieldLabel: "จำนวนเงิน",
                width: 130,
                value: "f_total",
                style: "text-align: center;font-weight:bold;background:#eee;",
                readOnly: true,
              },
              {
                xtype: "button",
                iconCls: "page-copy-icon",
                width: 120,
                fieldLabel: " ",
                labelSeparator: "",
                style: "padding: 0px 5px",
                // scale: "medium",
                text: "คัดลอก Column",
                listeners: {
                  render: function (c) {
                    var text_ToolTip = "<span style='white-space:nowrap;'>คัดลอกข้อมูลหัวตาราง หลังจากคลิกแล้ว </span><br>สามารถกด (Ctrl+v) เพื่อวางบนโปรแกรม Excel ได้";
                    new Ext.ToolTip({
                      target: c.btnEl.id,
                      anchor: "top",
                      html: text_ToolTip,
                    });
                  },
                },
                handler: function () {
                  var text_copy = "";
                  text_copy += "c_code_bank_acc";
                  text_copy += "\t" + "c_name_bank_acc";
                  text_copy += "\t" + "c_name_bank";
                  text_copy += "\t" + "f_total";
                  copyToClipboard(text_copy);
                },
              },
              { xtype: "container", height: 3 },
              {
                xtype: "button",
                iconCls: "import_excel",
                width: 120,
                fieldLabel: " ",
                labelSeparator: "",
                style: "padding: 0px 5px",
                // scale: "medium",
                text: "แบบฟอร์ม xlsx",
                listeners: {
                  render: function (c) {
                    var text_ToolTip = `<span style='white-space:nowrap;'>ดาวน์โหลดแบบฟอร์ม (.xlsx) สำหรับนำเข้าข้อมูล</span>
                      <br><span style='white-space:nowrap;'>*หัวตารางกรุณาใช้ข้อความตามที่กำหนดและใช้รูปแบบ \"General\" </span>`;
                    new Ext.ToolTip({
                      target: c.btnEl.id,
                      anchor: "top",
                      html: text_ToolTip,
                    });
                  },
                },
                handler: function () {
                  function download(url, filename) {
                    var file_path = url;
                    var file_name = filename;
                    var a = document.createElement("A");
                    a.href = file_path;
                    a.download = file_name;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }
                  download("xlsx_format/แบบฟอร์มนำเข้า_รายละเอียดเงินเบิกจ่าย.xlsx", "แบบฟอร์มนำเข้า_รายละเอียดเงินเบิกจ่าย.xlsx");
                },
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
        frame: false,
        defaults: { xtype: "fieldset", flex: 1, margins: "0px 3px", autoHeight: true },
        items: [
          {
            title: "",
            RemoveCls: "x-box-item",
            border: false,
            defaults: { labelStyle: "width:100px;", allowBlank: true },
            items: [
              {
                xtype: "fileuploadfield",
                id: "dtl_import",
                name: "dtl_import",
                emptyText: "เลือก file Excel (.xlsx, .xls)",
                fieldLabel: "เลือก file Excel",
                buttonText: "",
                width: 260,
                buttonCfg: { iconCls: "import_excel" },
                listeners: {
                  render: function (cmp) {
                    document.getElementById(this.fileInput.id).accept = ".xlsx, .xls";
                  },
                  fileselected: async function (fp, filename) {},
                },
              },
            ],
          },
        ],
      },
    ],
    buttonAlign: "left",
    buttons: [
      {
        text: "&nbsp;โหลดข้อมูล&nbsp;&nbsp;",
        iconCls: "icon-save",
        handler: async function () {
          var msg = "";
          let file = Ext.get(Ext.getCmp("dtl_import").fileInput.id).dom.files[0];
          var file_ext = file.name.split(".").pop();
          var file_ext_arr = "xlsx,xls"
            .replace(/\s/g, "")
            .split(",")
            .map((ext) => ext.toUpperCase());

          if (!file_ext_arr.includes(file_ext.toUpperCase())) {
            msg += "<span style='white-space: nowrap;'>- กรุณาเลือกไฟล์ (.xlsx, .xls)</span>";
          }
          if (msg == "") {
            try {
              Ext.getCmp("win-pop-excel").getEl().mask("Please wait...", "x-mask-loading");
              let jsonExcel = await loadExcelJson(file);
              if (jsonExcel.success == true) {
                let json = [];
                let i = 0;
                Ext.getCmp("win-pop-excel").getEl().unmask();
                dataDtl = [];
                dataDtl = jsonExcel.data[0];
                console.log(dataDtl);
                dataDtl.forEach((v) => {
                  try {
                    let index_id = Ext.dc_bank.findExact("c_name", "" + v.c_name_bank + "");
                    dc_bank_id = Ext.dc_bank.data.items[index_id].id;
                  } catch (err) {}

                  json.push({
                    id: "",
                    c_code_bank_acc: v.c_code_bank_acc,
                    c_name_bank_acc: v.c_name_bank_acc,
                    dc_bank_id: dc_bank_id,
                    f_total: v.f_total.replace(/,/g, ""),
                  });
                });
                Ext.po_working_pay_item.loadData({ data: json });
                Ext.getCmp("win-pop-excel").destroy();
              }
            } catch (err) {
              console.log(err);
            }
          } else {
            Ext.Msg.alert("นำเข้าไฟล์ไม่สำเร็จ!", msg);
          }
        },
      },
      // {
      //   text: Ext.GLOBAL_BU_BACK_TH,
      //   handler: function () {
      //     Ext.getCmp("win-pop-excel").destroy();
      //   },
      // },
    ],
  }).show();
}; // popDtlExcel

const saveMoneyHdr = function () {
  var check_edit = Ext.getCmp("check_edit_bank").getValue();
  var cm_pay_type = Ext.getCmp("cm_pay_type_id").getValue().split("_");
  var cm_pay_type_id = cm_pay_type[0];
  var i_pay_outside = cm_pay_type[1];

  var jsonArr = [];
  jsonArr.push({
    id: Ext.HDR_ID,
    c_creditor: Ext.dataSelect.creditor_name,
    f_per_pay: Ext.dataSelect.f_per_pay,
    f_per_tax_personal: Ext.dataSelect.f_per_tax_personal ? Ext.dataSelect.f_per_tax_personal.replace(/,/g, "") : "",
    f_per_social_security: Ext.dataSelect.f_per_social_security ? Ext.dataSelect.f_per_social_security.replace(/,/g, "") : "",
  });

  var jsonArrCheque = [];
  var sto = Ext.getCmp("gridCheque_1").store.data.items;
  var i = 0;
  sto.forEach(function (v) {
    var data_item = data_items_dtl_1[i] ?? [];

    jsonArrCheque.push({
      id: v.data.id,
      cm_pay_type_id: v.data.cm_pay_type_id,
      c_cheque: v.data.c_cheque,
      c_creditor: v.data.c_creditor,
      f_total: v.data.f_total ? v.data.f_total.replace(/,/g, "") : "",
      i_money_type: 1,
      data_item: data_item,
    });
    i++;
  });

  var sto = Ext.getCmp("gridCheque_2").store.data.items;
  var i = 0;
  sto.forEach(function (v) {
    var data_item = data_items_dtl_2[i] ?? [];
    jsonArrCheque.push({
      id: v.data.id,
      cm_pay_type_id: v.data.cm_pay_type_id,
      c_cheque: v.data.c_cheque,
      c_creditor: v.data.c_creditor,
      f_total: v.data.f_total ? v.data.f_total.replace(/,/g, "") : "",
      i_money_type: 2,
      data_item: data_item,
    });
    i++;
  });

  Ext.Msg.wait("Uploading...");
  Ext.Ajax.request({
    url: "api/mn_poSetPayType.php",
    method: "POST",
    params: {
      mode: "PO_SET_PAY_TYPE",
      cm_pay_type_id: cm_pay_type_id,
      i_pay_outside: i_pay_outside,
      d_pre_date: Ext.getCmp("d_pre_date").getValue(),
      d_pay_date: Ext.getCmp("d_pay_date").getValue(),
      c_cheque: Ext.getCmp("c_cheque").getValue(),
      check_edit_bank: Ext.getCmp("c_name_bank_acc").getValue() ? 1 : 0,
      c_name_bank_acc: check_edit ? Ext.getCmp("c_name_bank_acc").getValue() : "",
      c_name_bank: check_edit ? Ext.getCmp("c_name_bank").getValue() : "",
      c_code_bank_acc: check_edit ? Ext.getCmp("c_code_bank_acc").getValue() : "",
      dc_bank_acc_creditor_id: check_edit ? Ext.getCmp("dc_bank_acc_creditor_id").getValue() : "",
      f_total_bulk: Ext.getCmp("f_total_bulk").getValue() ? Ext.getCmp("f_total_bulk").getValue().replace(/,/g, "") : "",
      f_total_cheque: Ext.getCmp("f_total_cheque").getValue() ? Ext.getCmp("f_total_cheque").getValue().replace(/,/g, "") : "",
      data: JSON.stringify(jsonArr),
      data_cheque: JSON.stringify(jsonArrCheque),

      dc_user_sign_id: Ext.session.user_id,
    },
    success: function (result, request) {
      if (error_json(result.responseText, request.params)) return;
      let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
      if (jsonData.success == true) {
        if (jsonData.i_back == 0) {
          Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not errer
          Ext.getCmp("win-pop").destroy();
        }
        Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + jsonData.msg + "</span>");
        Ext.store.reload();
      } else {
        if (jsonData.request_data_sign == true) {
          Ext.Msg.hide();
          edit_user_for_sigh(jsonData.data);
        } else {
          Ext.Msg.alert("แจ้งเตือน", "<span color='red' style='white-space: nowrap;'>" + jsonData.msg + "</span>");
        }
      }
    },
    failure: function (result, request) {
      Ext.MessageBox.alert("Failed", result.responseText); // connect error
    },
  });
}; // saveMoneyHdr

const text_show_item_pay_update = function (data) {
  if (data) {
    let sum = 0;
    data.forEach((item) => {
      if (item.f_total) {
        const parts = item.f_total.match(/\d+(\.\d+)?/g);
        if (parts) {
          sum += parts.reduce((acc, num) => acc + parseFloat(num), 0);
        }
      }
    });
    sum = floatRenderer(floatMinus(sum), 2);
    var text = `( ${data.length} รายการ ) : ${sum} `;
    Ext.getCmp("text_show_item_pay").setValue(text); // Set the text value
  } else {
    Ext.getCmp("text_show_item_pay").setValue("");
  }
}; // text_show_item_pay_update
