Ext.i_import_excel = false; // เช็คค่าว่าเป็นการ นำเข้า Excel หรือไม่
dataDtl = [];

const statusbar = function (type) {
  if (type) {
    $("#statusbar").html("<div style='padding: 3px 6px 2px;'><img src='../images/icons/accept.png'><span style='position: relative; top: -4px; left: 5px;'>Ready</span></div>");
  } else {
    $("#statusbar").html(
      "<div style='padding: 3px 6px 2px;'><img style='animation-name: spin; animation-duration: 100ms;animation-iteration-count: infinite;animation-timing-function: linear;' src='../images/icons/hourglass.png'><span style='position: relative; top: -4px; left: 5px;'>Loading</span></div>"
    );
  }
};

function checkID(RowCheck) {
  var num = Ext.getCmp("gridEditor").store.data.items.length - 1;
  var row = 0;
  var checked = document.getElementById("chk_" + RowCheck).checked;
  while (num >= row) {
    if (RowCheck != row) {
      document.getElementById("chk_" + row).disabled = checked;
      document.getElementById("chk_" + row).value;
    }
    row++;
  }
  Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
  Ext.Ajax.request({
    url: "api/mn_AmAssetGroup.php",
    method: "POST",
    params: {
      mode: "PRIMARY_CHECKED",
      am_asset_hdr_id: document.getElementById("chk_" + RowCheck).value,
      i_primary: checked ? "1" : "0",
    },
    success: function (result, request) {
      Ext.getCmp("contenterCenter").getEl().unmask();
      var jsonData = Ext.util.JSON.decode(result.responseText);
      if (jsonData.success) {
      } else {
        Ext.MessageBox.alert("Failed", jsonData.msg);
      }
      // Ext.store.load({
      //   params: { hdr_id: Ext.HDR_ID },
      // });
    },
    failure: function (result, request) {
      Ext.getCmp("contenterCenter").getEl().unmask();
      Ext.MessageBox.alert("Failed", result.responseText);
    },
  });
}

loadForm = function (id) {
  Ext.getCmp("container_sup").getEl().mask("Please wait...", "x-mask-loading");
  Ext.Data_imp_assetall_dtl.load({
    params: { id: id },
    callback: function (records, operation, success) {
      if (success == true) {
        var record = Ext.Data_imp_assetall_dtl.getAt(0);
        Ext.getCmp("form-win").getForm().loadRecord(record);
        Ext.getCmp("f_unit_cost").setValue(floatRenderer(floatMinus(Ext.getCmp("f_unit_cost").getValue().replace(/,/g, ""), 2)));
        // var f_unit_cost1 = record.data.f_unit_cost < 10000.00 ? 0.00 : record.data.f_unit_cost;
        if (record.data.f_unit_cost < 10000) {
          Ext.getCmp("f_unit_cost1").setValue("0.00");
        } else {
          Ext.getCmp("f_unit_cost1").setValue(floatRenderer(floatMinus(record.data.f_unit_cost.replace(/,/g, ""), 2)));
        }
        if (record.data.f_unit_cost < 10000) {
          Ext.getCmp("f_unit_cost2").setValue("0.00");
        } else {
          Ext.getCmp("f_unit_cost2").setValue(floatRenderer(floatMinus(record.data.f_unit_cost.replace(/,/g, ""), 2)));
        }
        Ext.getCmp("Win_Sud").setWidth(Ext.getCmp("Win_Sud").getWidth() + 0.01);
      }
      Ext.getCmp("container_sup").getEl().unmask();
    },
  });
};

formSubmit = function () {
  var msg = "";
  // if (Ext.getCmp("bg_expense_id").getValue() == "") {
  //   msg += "<span style='white-space: nowrap;'>กรุณาเลือก รายการย่อย</span>";
  // }
  if (msg == "") {
    Ext.getCmp("form-win")
      .getForm()
      .submit({
        standardSubmit: true,
        url: "api/mn_AmAssetGroup.php",
        params: {
          mode: "SAVE_DTL",
          id: Ext.HDR_ID,
        },
        success: function (result, request) {
          Ext.store.load({
            params: { hdr_id: Ext.HDR_ID },
          });
          Ext.storeDtl.load({
            params: { hdr_id: Ext.HDR_ID },
          });
          Ext.imp_assetall_dtl.load({
            params: { hdr_id: Ext.HDR_ID },
          });
          Ext.getCmp("Win_Sud").hide();
          Ext.getCmp("Win_Sud").destroy();
          Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>บันทึกเรียบร้อย</span>");
        },
        failure: function (result, request) {
          Ext.MessageBox.alert("Failed", result.responseText);
        },
      });
  } else {
    Ext.MessageBox.alert("แจ้งเตือน", msg);
    return;
  }
};

Win_Sud = function (type) {
  var window = new Ext.Window({
    collapsible: true,
    maximizable: true,
    autoScroll: true,
    title: "ข้อมูลการแก้ไขครุภัณฑ์",
    id: "Win_Sud",
    width: 1150,
    height: 500,
    minWidth: 1150,
    minHeight: 250,
    layout: "fit",
    modal: true,
    plain: true,
    bodyStyle: "padding:1px;",
    buttonAlign: "center",
    items: {
      xtype: "form",
      id: "form-win",
      autoScroll: true,
      frame: true,
      labelAlign: "right",
      labelWidth: 100,
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
              title: "ค้นหารายการครุภัณฑ์ที่ต้องการเพิ่มลงในกลุ่ม ",
              RemoveCls: "x-box-item",
              // collapsible: true,
              // collapsed: false,
              defaults: { labelStyle: "width:100px;", allowBlank: true },
              items: [
                new Ext.ux.Poplov({
                  text: "เลือกรายการครุภัณฑ์...",
                  id: "am_asset_hdr_idID",
                  iconCls: "page_magnify",
                  valueHidden: "am_asset_hdr_id",
                  store: Ext.imp_assetall_dtl,
                  headerGrid: [
                    { header: "ID System", sortable: true, hidden: true, dataIndex: "id" },
                    { header: "ที่", align: "center", width: 40, sortable: true, dataIndex: "no" },
                    { header: "รหัสครุภัณฑ์", align: "center", width: 300, sortable: true, dataIndex: "c_code" },
                    {
                      header: "ชื่อครุภัณฑ์",
                      sortable: true,
                      id: "c_name",
                      dataIndex: "c_name",
                      renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                        metaData.attr = "style='cursor:pointer';";
                        return value;
                      },
                    },
                  ],
                  widthText: 450,
                  fieldLabel: "รหัสครุภัณฑ์",
                  isCellClickGrid: true,
                  cellClickGrid: function (grid, rowIndex, columnIndex, e) {
                    var poplov_id = "am_asset_hdr_idID";
                    var record = grid.getStore().getAt(rowIndex);
                    var TextShow = record.data.c_code;
                    Ext.getCmp(poplov_id).setValue(record.data.id);
                    Ext.getCmp(poplov_id + "_Name").setValue(TextShow);

                    Ext.getCmp("win-pop-lov" + poplov_id).hide();
                    Ext.getCmp("win-pop-lov" + poplov_id).destroy();

                    if (Ext.getCmp("am_asset_hdr_idID").getValue() > 0) {
                      Ext.getCmp("container_sup").show();
                      loadForm(Ext.getCmp("am_asset_hdr_idID").getValue());
                    } else {
                      Ext.getCmp("container_sup").hide();
                    }
                  },
                }).mini,
              ],
            },
          ],
        },
        {
          xtype: "container",
          layout: "hbox",
          id: "container_sup",

          hidden: true,
          align: "stretch",
          RemoveHeight: true,
          defaults: { xtype: "fieldset", flex: 1, margins: "0px 3px", autoHeight: true },
          items: [
            {
              title: "ข้อมูลครุภัณฑ์ ",
              RemoveCls: "x-box-item",
              // collapsible: true,
              // collapsed: false,
              defaults: { labelStyle: "width:200px;", allowBlank: true },
              items: [
                {
                  xtype: "textfield",
                  fieldLabel: "รหัสครุภัณฑ์",
                  // hidden: true,
                  id: "c_code",
                  name: "c_code",
                  readOnly: true,
                  width: 250,
                },
                {
                  xtype: "textfield",
                  fieldLabel: "ชื่อครุภัณฑ์",
                  id: "asset_name",
                  readOnly: true,
                  name: "asset_name",
                  width: 400,
                },
                {
                  fieldLabel: "วันที่รับ",
                  xtype: "datefield",
                  id: "receive_date",
                  name: "receive_date",
                  readOnly: true,
                  width: 150,
                  value: addY(543),
                },
                {
                  fieldLabel: "จ.น. รับ  (DR)",
                  xtype: "textfield",
                  id: "quantity",
                  name: "quantity",
                  hidden: true,
                  width: 150,
                },
                {
                  fieldLabel: "หน่วยนับ",
                  xtype: "textfield",
                  id: "dc_unit_type",
                  name: "dc_unit_type",
                  hidden: true,
                  width: 150,
                },
                {
                  xtype: "textfield",
                  allowBlank: false,
                  fieldLabel: "มูลค่าเริ่มต้น",
                  readOnly: true,
                  id: "f_unit_cost",
                  name: "f_unit_cost",
                  width: 150,
                  style: {
                    labelAlign: "right",
                    "font-weight": "bold",
                    padding: "1px",
                    margin: "1px",
                    color: "blue",
                    "background-color": "#fff",
                    "text-align": "right",
                  },
                  listeners: {
                    afterrender: function () {
                      this.fn = function () {
                        this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                      };
                    },
                    focus: function (value) {
                      this.setValue(this.getValue().replace(/,/g, ""));
                    },
                    Change: function (value) {
                      if (this.getValue() < 10000) {
                        Ext.getCmp("f_unit_cost1").setValue("0.00");
                        Ext.getCmp("f_unit_cost2").setValue("0.00");
                      } else {
                        Ext.getCmp("f_unit_cost1").setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                        Ext.getCmp("f_unit_cost2").setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                      }
                      this.fn();
                    },
                  },
                },
                {
                  xtype: "textfield",
                  allowBlank: false,
                  hidden: true,
                  readOnly: true,
                  fieldLabel: "มูลค่าคำนวณค่าเสื่อม",
                  id: "f_unit_cost1",
                  name: "f_unit_cost1",
                  width: 150,
                  style: {
                    labelAlign: "right",
                    "font-weight": "bold",
                    padding: "1px",
                    margin: "1px",
                    color: "#6D6D6D",
                    "background-color": "#fff",
                    "text-align": "right",
                  },
                  listeners: {
                    afterrender: function () {
                      this.fn = function () {
                        this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                      };
                    },
                    focus: function (value) {
                      this.setValue(this.getValue().replace(/,/g, ""));
                    },
                    Change: function (value) {
                      this.fn();
                    },
                  },
                },
                {
                  xtype: "textfield",
                  allowBlank: false,
                  hidden: true,
                  readOnly: true,
                  fieldLabel: "มูลค่าคงเหลือ",
                  id: "f_unit_cost2",
                  name: "f_unit_cost2",
                  width: 150,
                  style: {
                    labelAlign: "right",
                    "font-weight": "bold",
                    padding: "1px",
                    margin: "1px",
                    color: "#6D6D6D",
                    "background-color": "#fff",
                    "text-align": "right",
                  },
                  listeners: {
                    afterrender: function () {
                      this.fn = function () {
                        this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                      };
                    },
                    focus: function (value) {
                      this.setValue(this.getValue().replace(/,/g, ""));
                    },
                    Change: function (value) {
                      this.fn();
                    },
                  },
                },
                {
                  fieldLabel: "คลังพัสดุ",
                  xtype: "textfield",
                  id: "stockpile",
                  name: "stockpile",
                  hidden: true,
                  width: 700,
                },
                {
                  fieldLabel: "ส่วนงาน",
                  xtype: "textfield",
                  id: "Segment",
                  name: "Segment",
                  hidden: true,
                  width: 700,
                },
                {
                  fieldLabel: "งาน/โครงการ",
                  xtype: "textfield",
                  id: "workandproject",
                  name: "workandproject",
                  hidden: true,
                  width: 700,
                },
                {
                  fieldLabel: "กองทุน",
                  xtype: "textfield",
                  id: "fund",
                  name: "fund",
                  hidden: true,
                  width: 700,
                },
                {
                  fieldLabel: "รหัสกิจกรรม",
                  xtype: "textfield",
                  id: "event_id",
                  name: "event_id",
                  hidden: true,
                  width: 700,
                },
                {
                  fieldLabel: "ปีงบ",
                  xtype: "textfield",
                  id: "i_yyyy",
                  name: "i_yyyy",
                  readOnly: true,
                  width: 150,
                },
                {
                  fieldLabel: "แหล่งเงิน",
                  xtype: "textfield",
                  id: "budget_source",
                  name: "budget_source",
                  readOnly: true,
                  width: 700,
                },
                {
                  fieldLabel: "คุณสมบัติเฉพาะ(ยี่ห้อ/รุ่น)",
                  xtype: "textfield",
                  id: "c_detail",
                  name: "c_detail",
                  hidden: true,
                  width: 250,
                },
                {
                  fieldLabel: "ยี่ห้อ",
                  xtype: "textfield",
                  id: "c_brand",
                  name: "c_brand",
                  hidden: true,
                  width: 250,
                },
                {
                  fieldLabel: "รุ่น",
                  xtype: "textfield",
                  id: "c_model",
                  name: "c_model",
                  width: 250,
                  hidden: true,
                },
                {
                  fieldLabel: "Serial Number",
                  xtype: "textfield",
                  id: "c_serial",
                  name: "c_serial",
                  width: 250,
                  hidden: true,
                },
                {
                  fieldLabel: "ยี่ห้อ",
                  xtype: "textfield",
                  id: "c_brand",
                  name: "c_brand",
                  width: 250,
                  hidden: true,
                },
                {
                  fieldLabel: "วิธีการได้มา",
                  xtype: "textfield",
                  id: "got",
                  name: "got",
                  width: 250,
                  hidden: true,
                },
                {
                  fieldLabel: "วิธีคำนวณค่าเสื่อม",
                  xtype: "textfield",
                  id: "salvage",
                  name: "salvage",
                  width: 250,
                  hidden: true,
                },
                {
                  fieldLabel: "อายุครุภัณฑ์(ปี)",
                  xtype: "textfield",
                  id: "i_period_year",
                  name: "i_period_year",
                  readOnly: true,
                  width: 250,
                },
                {
                  fieldLabel: "หมายเหตุ",
                  xtype: "textfield",
                  id: "c_commet",
                  name: "c_commet",
                  width: 700,
                  hidden: true,
                },
                {
                  fieldLabel: "หมายเลขครุภัณฑ์เดิม2",
                  xtype: "textfield",
                  id: "c_codeold2",
                  name: "c_codeold2",
                  width: 250,
                  hidden: true,
                },
                {
                  fieldLabel: "หมายเลขครุภัณฑ์เดิม1",
                  xtype: "textfield",
                  id: "c_codeold1",
                  name: "c_codeold1",
                  width: 250,
                  hidden: true,
                },
                {
                  fieldLabel: "เลขที่ใบตรวจรับ",
                  xtype: "textfield",
                  id: "receipt_number",
                  name: "receipt_number",
                  width: 250,
                  hidden: true,
                },
                {
                  fieldLabel: "วันที่เริ่มรับประกัน",
                  xtype: "textfield",
                  id: "insurance_start",
                  name: "insurance_start",
                  width: 250,
                  hidden: true,
                },
                {
                  fieldLabel: "รับประกัน....ปี",
                  xtype: "textfield",
                  id: "insurance_year",
                  name: "insurance_year",
                  width: 250,
                  hidden: true,
                },
                {
                  fieldLabel: "รับประกัน....เดือน",
                  xtype: "textfield",
                  id: "insurance_month",
                  name: "insurance_month",
                  width: 250,
                  hidden: true,
                },
                {
                  fieldLabel: "วันที่สิ้นสุดรับประกัน",
                  xtype: "textfield",
                  id: "insurance_end",
                  name: "insurance_end",
                  width: 250,
                  hidden: true,
                },
                {
                  fieldLabel: "หมายเหตุรับประกัน",
                  xtype: "textfield",
                  id: "insurance_mote",
                  name: "insurance_mote",
                  width: 250,
                  hidden: true,
                },
                {
                  fieldLabel: "สถานที่ตั้ง",
                  xtype: "textfield",
                  id: "c_location",
                  name: "c_location",
                  width: 700,
                  hidden: true,
                },
                {
                  fieldLabel: "รหัสอาคาร",
                  xtype: "textfield",
                  id: "c_code_building",
                  name: "c_code_building",
                  hidden: true,
                  width: 250,
                },
                {
                  fieldLabel: "เลขทะเบียนรถ",
                  xtype: "textfield",
                  id: "car_register",
                  name: "car_register",
                  hidden: true,
                  width: 250,
                },
                {
                  fieldLabel: "ประเภทรถ",
                  xtype: "textfield",
                  id: "car_type",
                  name: "car_type",
                  hidden: true,
                  width: 250,
                },
                {
                  fieldLabel: "รหัสผู้ดูแล",
                  xtype: "textfield",
                  id: "code_caretaker",
                  name: "code_caretaker",
                  hidden: true,
                  width: 250,
                },
                {
                  fieldLabel: "รหัสผู้ดูแล",
                  xtype: "textfield",
                  id: "name_caretaker",
                  name: "name_caretaker",
                  width: 250,
                  hidden: true,
                },
                {
                  fieldLabel: "แฟ้มรูปภาพ",
                  xtype: "textfield",
                  id: "image_file",
                  name: "image_file",
                  width: 250,
                  hidden: true,
                },
                {
                  fieldLabel: "สถานะพิมพ์บาร์โค้ด",
                  xtype: "textfield",
                  id: "barcode_status",
                  name: "barcode_status",
                  width: 250,
                  hidden: true,
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
            formSubmit();
          },
        },
        {
          text: Ext.GLOBAL_BU_BACK_TH,
          handler: function () {
            Ext.getCmp("Win_Sud").hide();
            Ext.getCmp("Win_Sud").destroy();
          },
        },
      ],
    },
  }).show();
};
win_delele = function (record) {
  new Ext.Window({
    id: "win-msg-delete",
    title: "Remove",
    modal: true,
    width: 250,
    height: 130,
    html: "ท่านต้องการที่จะลบรายการครุภัณฑ์นี้ออกจาก ? <br>&nbsp;&nbsp;&nbsp;" + record.get("c_code"),
    buttons: [
      {
        text: "Confirm",
        handler: function () {
          Ext.Ajax.request({
            url: "api/mn_AmAssetGroup.php",
            method: "POST",
            params: {
              mode: "DELETE",
              id: record.get("am_asset_hdr_id"),
            },
            success: function (result, request) {
              var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
              if (jsonData.success) {
                //Ext.MessageBox.alert("Success", jsonData.msg);		// alert massage success
              } else {
                Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
              }
              Ext.getCmp("win-msg-delete").hide(); // hidden window-panel
              Ext.getCmp("win-msg-delete").destroy(); // clear memory :: garbage collection
              Ext.store.load({
                params: { hdr_id: Ext.HDR_ID },
              });
              Ext.storeDtl.load({
                params: { hdr_id: Ext.HDR_ID },
              });
              Ext.imp_assetall_dtl.load({
                params: { hdr_id: Ext.HDR_ID },
              });
            },
            failure: function (result, request) {
              Ext.MessageBox.alert("Failed", result.responseText); // connect error
            },
          });
        },
      },
      {
        text: "Cancel",
        handler: function () {
          Ext.getCmp("win-msg-delete").hide();
          Ext.getCmp("win-msg-delete").destroy();
        },
      },
    ],
  }).show();
};

// const impData = function () {
//   let json = [];
//   let ii = 0;
//   dataDtl.forEach((obj) => {
//     let json_row = [];
//     let i = 0;
//     // console.log(obj);
//     Object.entries(obj).forEach(([key, value]) => {
//       json_row[i++] = value ? value : "";
//     });
//     // console.log(json_row);
//     let receive_date = json_row[2] ? json_row[2].split("/") : "";
//     receive_date = json_row[2] ? Ext.util.Format.date(receive_date[1] + "/" + receive_date[0] + "/" + (parseInt(receive_date[2]) + 543), "d-m-Y") : "";
//     json.push({
//       no: ++ii,
//       i_type: "0",
//       imp_assetall_dtl_id: "0",
//       c_code: json_row[0],
//       asset_name: json_row[1],
//       receive_date: receive_date,
//       quantity: json_row[3],
//       dc_unit_type: json_row[4],
//       f_unit_cost: json_row[5],
//       stockpile: json_row[8],
//       Segment: json_row[9],
//       workandproject: json_row[10],
//       fund: json_row[11],
//       event_id: json_row[12],
//       i_yyyy: json_row[13],
//       budget_source: json_row[14],
//       c_detail: json_row[15],
//       c_brand: json_row[17],
//       c_model: json_row[18],
//       c_serial: json_row[19],
//       got: json_row[20],
//       salvage: json_row[21],
//       i_period_year: json_row[22],
//       c_commet: json_row[26],
//       c_codeold2: json_row[27],
//       c_codeold1: json_row[28],
//       receipt_number: json_row[29],
//       insurance_start: json_row[30],
//       insurance_year: json_row[31],
//       insurance_month: json_row[32],
//       insurance_end: json_row[33],
//       insurance_mote: json_row[34],
//       c_location: json_row[35],
//       c_code_building: json_row[36],
//       car_register: json_row[37],
//       car_type: json_row[38],
//       code_caretaker: json_row[39],
//       name_caretaker: json_row[40],
//       image_file: json_row[41],
//       barcode_status: json_row[42],
//     });
//   });
//   Ext.storeDtl.loadData({ data: json });
//   Ext.i_import_excel = true;
// }; // impData

cellClickDtl = function (grid, rowIndex, columnIndex, e) {
  let record = grid.getStore().getAt(rowIndex);
  if (columnIndex == grid.getColumnModel().getIndexById("delete")) {
    win_delele(record);
  }
}; //cellClick

// Class Extend
formPanelDtl = function (args) {
  formPanelDtl.superclass.constructor.call(this, {
    title: "เพิ่มรายการ" + Ext.title_panel,
    id: "PanelDtl",
    iconCls: "icon-application-view-list",
    region: "center",
    layout: "fit",
    border: false,
    stripeRows: true,
    loadMask: true,
    listeners: {
      afterrender: function (obj, eOpts) {
        Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
        Ext.storeDtl.load({
          params: { hdr_id: Ext.HDR_ID },
          callback: function (records, operation, success) {
            Ext.getCmp("contenterCenter").getEl().unmask();
            Ext.getCmp("gridEditor").on("cellclick", cellClickDtl, this);
          },
        });
        Ext.i_import_excel = false;
      },
    },
    items: [
      // new Ext.grid.EditorGridPanel({
      new Ext.grid.GridPanel({
        id: "gridEditor",
        region: "center",
        layout: "fit",
        border: true,
        stripeRows: true,
        loadMask: true,
        clicksToEdit: 1,
        store: Ext.storeDtl,
        viewConfig: {
          emptyText: "ไม่มีข้อมูล..",
          deferEmptyText: false,
          getRowClass: function (record, index, rowParams) {
            if (record.data.i_type == 1) {
              return "td-cost padd-2";
            } else if (record.data.i_type == 2) {
              return "td-total padd-2";
            }
            // let line = record.data.i_status == 1 ? "" : "strikeout";
            // return index % 2 == 0 ? "grid-odd " + line : "grid-even " + line;
          },
        },
        listeners: {
          beforeedit: function (editor) {
            let row = editor.record.data;
            if (row.i_type != 0) {
              return false;
            }
          },
        },
        tbar: [
          {
            text: "เพิ่มรายการ",
            iconCls: "icon-add",
            handler: function (grid, rowIndex, colIndex) {
              Win_Sud();
            },
          },
          { xtype: "tbspacer", width: 4 },
          {
            xtype: "button",
            text: "โหลดข้อมูลใหม่",
            iconCls: "icon-refresh",
            handler: function (grid, rowIndex, colIndex) {
              Ext.storeDtl.load({
                params: { hdr_id: Ext.HDR_ID },
                callback: function (records, operation, success) {},
              });
              Ext.imp_assetall_dtl.load({
                params: { hdr_id: Ext.HDR_ID },
              });
              Ext.i_import_excel = false;
            },
          },
        ],
        columns: [
          new Ext.grid.RowNumberer({
            id: "no",
            header: "ที่",
            width: 50,
            renderer: function (value, metaData, record, row, col, store, gridView) {
              metaData.attr = "style='cursor:pointer; text-align:center;';";
              return record.get("no");
            },
          }),
          {
            header: "รายการหลัก",
            sortable: false,
            align: "center",
            dataIndex: "i_primary",
            width: 70,
            renderer: function (value, metaData, record, row, col, store, gridView) {
              var checked = "";
              var readonly = "";
              if (Ext.i_primary) {
                checked = value == 1 ? "checked" : "";
                readonly = value == 1 ? "" : "disabled";
              }
              return "<input style='margin-top:3px; margin-bottom:2px;' type='checkbox' onchange='checkID(" + row + ")' id='chk_" + row + "' value='" + record.data.am_asset_hdr_id + "'" + checked + " " + readonly + "> ";
            },
          },

          {
            header: "รหัสครุภัณฑ์",
            sortable: false,
            align: "center",
            dataIndex: "c_code",
            width: 180,
            editor: new Ext.form.TextField({
              style: "text-align: center",
            }),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 1 || record.data.i_type == 2) {
                return "";
              } else if (value) {
                metaData.attr = "style='text-align: center;'";
                return value;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
            },
          },
          {
            header: "ชื่อครุภัณฑ์",
            sortable: false,
            align: "center",
            dataIndex: "asset_name",
            width: 210,
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 1 || record.data.i_type == 2) {
                return "";
              } else if (value) {
                metaData.attr = "style='text-align: center;'";
                return value;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
            },
          },
          {
            header: "วันที่รับ",
            sortable: false,
            align: "center",
            dataIndex: "receive_date",
            editor: new Ext.form.DateField(),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              return value != "" && value != null ? shortThaiDate(value) : "";
            },
          },
          {
            header: "จ.น. รับ  (DR)",
            sortable: false,
            align: "center",
            dataIndex: "quantity",
            width: 80,
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 1 || record.data.i_type == 2) {
                return "";
              } else if (value) {
                metaData.attr = "style='text-align: center;'";
                return value;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
            },
          },
          {
            header: "หน่วยนับ",
            sortable: false,
            align: "center",
            dataIndex: "dc_unit_type",
            width: 100,
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 1 || record.data.i_type == 2) {
                return "";
              } else if (value) {
                metaData.attr = "style='text-align: center;'";
                return value;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
            },
          },
          {
            header: "มูลค่าเริ่มต้น",
            sortable: false,
            align: "center",
            dataIndex: "f_unit_cost",
            width: 110,
            editor: new Ext.form.TextField({
              style: "text-align: right",
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
              if (record.data.i_type == 1 || record.data.i_type == 2) {
                metaData.attr = "style='text-align: right; font-weight: bold;'";
                return floatRenderer(floatMinus(String(value).replace(/,/g, ""), 2));
              } else if (value) {
                metaData.attr = "style='text-align: right;'";
                return floatRenderer(floatMinus(String(value).replace(/,/g, ""), 2));
              } else {
                metaData.attr = "style='text-align: right; color:red;'";
                return "-";
              }
            },
          },
          {
            header: "มูลค่าคำนวณค่าเสื่อม",
            sortable: false,
            align: "center",
            dataIndex: "f_unit_cost",
            width: 110,
            // editor: new Ext.form.TextField({
            //   style: "text-align: right",
            //   listeners: {
            //     afterrender: function () {
            //       this.fn = function () {
            //         if (this.getValue() < 10000) {
            //           this.setValue(0.0);
            //         } else {
            //           this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
            //         }
            //       };
            //     },
            //     Change: function (value) {
            //       this.fn();
            //     },
            //   },
            // }),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 1 || record.data.i_type == 2) {
                metaData.attr = "style='text-align: right; font-weight: bold;'";
                return floatRenderer(floatMinus(String(record.data.f_unit_cost2).replace(/,/g, ""), 2));
              } else if (value) {
                metaData.attr = "style='text-align: right;'";
                if (String(value).replace(/,/g, "") < 10000) {
                  return "0.00";
                } else {
                  return floatRenderer(floatMinus(String(value).replace(/,/g, ""), 2));
                }
              } else {
                return "0.00";
              }
            },
          },
          {
            header: "มูลค่าคงเหลือ",
            sortable: false,
            align: "center",
            dataIndex: "f_unit_cost",
            width: 110,
            // editor: new Ext.form.TextField({
            //   style: "text-align: right",
            //   listeners: {
            //     afterrender: function () {
            //       this.fn = function () {
            //         if (this.getValue() < 10000) {
            //           this.setValue(0.0);
            //         } else {
            //           this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
            //         }
            //       };
            //     },
            //     Change: function (value) {
            //       this.fn();
            //     },
            //   },
            // }),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 1 || record.data.i_type == 2) {
                metaData.attr = "style='text-align: right; font-weight: bold;'";
                return floatRenderer(floatMinus(String(record.data.f_unit_cost3).replace(/,/g, ""), 2));
              } else if (value) {
                metaData.attr = "style='text-align: right;'";
                if (String(value).replace(/,/g, "") < 10000) {
                  return "0.00";
                } else {
                  return floatRenderer(floatMinus(String(value).replace(/,/g, ""), 2));
                }
              } else {
                return "0.00";
              }
            },
          },
          {
            header: "คลังพัสดุ",
            sortable: false,
            align: "center",
            dataIndex: "stockpile",
            width: 220,
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 1 || record.data.i_type == 2) {
                return "";
              } else if (value) {
                metaData.attr = "style='text-align: center;'";
                return value;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
            },
          },
          {
            header: "ส่วนงาน",
            sortable: false,
            align: "center",
            dataIndex: "Segment",
            width: 220,
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 1 || record.data.i_type == 2) {
                return "";
              } else if (value) {
                metaData.attr = "style='text-align: center;'";
                return value;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
            },
          },
          {
            header: "งาน/โครงการ",
            sortable: false,
            align: "center",
            dataIndex: "workandproject",
            width: 220,
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 1 || record.data.i_type == 2) {
                return "";
              } else if (value) {
                metaData.attr = "style='text-align: center;'";
                return value;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
            },
          },
          {
            header: "กองทุน",
            sortable: false,
            align: "center",
            dataIndex: "fund",
            width: 220,
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 1 || record.data.i_type == 2) {
                return "";
              } else if (value) {
                metaData.attr = "style='text-align: center;'";
                return value;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
            },
          },
          {
            header: "รหัสกิจกรรม",
            sortable: false,
            align: "center",
            dataIndex: "event_id",
            width: 150,
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 1 || record.data.i_type == 2) {
                return "";
              } else if (value) {
                metaData.attr = "style='text-align: center;'";
                return value;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
            },
          },
          {
            header: "ปีงบ",
            sortable: false,
            align: "center",
            dataIndex: "i_yyyy",
            width: 80,
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 1 || record.data.i_type == 2) {
                return "";
              } else if (value) {
                metaData.attr = "style='text-align: center;'";
                return value;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
            },
          },
          {
            header: "แหล่งเงิน",
            sortable: false,
            align: "center",
            dataIndex: "budget_source",
            width: 220,
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 1 || record.data.i_type == 2) {
                return "";
              } else if (value) {
                metaData.attr = "style='text-align: center;'";
                return value;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
            },
          },
          {
            header: "คุณสมบัติเฉพาะ(ยี่ห้อ/รุ่น)",
            sortable: false,
            align: "center",
            dataIndex: "c_detail",
            width: 180,
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 1 || record.data.i_type == 2) {
                return "";
              } else if (value) {
                metaData.attr = "style='text-align: center;'";
                return value;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
            },
          },
          {
            header: "ยี่ห้อ",
            sortable: false,
            align: "center",
            dataIndex: "c_brand",
            width: 100,
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 1 || record.data.i_type == 2) {
                return "";
              } else if (value) {
                metaData.attr = "style='text-align: center;'";
                return value;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
            },
          },
          {
            header: "รุ่น",
            sortable: false,
            align: "center",
            dataIndex: "c_model",
            width: 150,
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 1 || record.data.i_type == 2) {
                return "";
              } else if (value) {
                metaData.attr = "style='text-align: center;'";
                return value;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
            },
          },
          {
            header: "Serial Number",
            sortable: false,
            align: "center",
            dataIndex: "c_serial",
            width: 150,
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 1 || record.data.i_type == 2) {
                return "";
              } else if (value) {
                metaData.attr = "style='text-align: center;'";
                return value;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
            },
          },
          {
            header: "วิธีการได้มา",
            sortable: false,
            align: "center",
            dataIndex: "got",
            width: 120,
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 1 || record.data.i_type == 2) {
                return "";
              } else if (value) {
                metaData.attr = "style='text-align: center;'";
                return value;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
            },
          },
          {
            header: "วิธีคำนวณค่าเสื่อม",
            sortable: false,
            align: "center",
            dataIndex: "salvage",
            width: 120,
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 1 || record.data.i_type == 2) {
                return "";
              } else if (value) {
                metaData.attr = "style='text-align: center;'";
                return value;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
            },
          },
          {
            header: "อายุครุภัณฑ์(ปี)",
            sortable: false,
            align: "center",
            dataIndex: "i_period_year",
            width: 80,
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 1 || record.data.i_type == 2) {
                return "";
              } else if (value) {
                metaData.attr = "style='text-align: center;'";
                return value;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
            },
          },
          {
            header: "หมายเหตุ",
            sortable: false,
            align: "center",
            dataIndex: "c_commet",
            width: 220,
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 1 || record.data.i_type == 2) {
                return "";
              } else if (value) {
                metaData.attr = "style='text-align: center;'";
                return value;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
            },
          },
          {
            header: "หมายเลขครุภัณฑ์เดิม2",
            sortable: false,
            align: "center",
            dataIndex: "c_codeold2",
            width: 180,
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 1 || record.data.i_type == 2) {
                return "";
              } else if (value) {
                metaData.attr = "style='text-align: center;'";
                return value;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
            },
          },
          {
            header: "หมายเลขครุภัณฑ์เดิม1",
            sortable: false,
            align: "center",
            dataIndex: "c_codeold1",
            width: 180,
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 1 || record.data.i_type == 2) {
                return "";
              } else if (value) {
                metaData.attr = "style='text-align: center;'";
                return value;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
            },
          },
          {
            header: "เลขที่ใบตรวจรับ",
            sortable: false,
            align: "center",
            dataIndex: "receipt_number",
            width: 120,
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 1 || record.data.i_type == 2) {
                return "";
              } else if (value) {
                metaData.attr = "style='text-align: center;'";
                return value;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
            },
          },
          {
            header: "วันที่เริ่มรับประกัน",
            sortable: false,
            align: "center",
            dataIndex: "insurance_start",
            width: 100,
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 1 || record.data.i_type == 2) {
                return "";
              } else if (value) {
                metaData.attr = "style='text-align: center;'";
                return value;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
            },
          },
          {
            header: "รับประกัน....ปี",
            sortable: false,
            align: "center",
            dataIndex: "insurance_year",
            width: 50,
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 1 || record.data.i_type == 2) {
                return "";
              } else if (value) {
                metaData.attr = "style='text-align: center;'";
                return value;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
            },
          },
          {
            header: "รับประกัน....เดือน",
            sortable: false,
            align: "center",
            dataIndex: "insurance_month",
            width: 50,
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 1 || record.data.i_type == 2) {
                return "";
              } else if (value) {
                metaData.attr = "style='text-align: center;'";
                return value;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
            },
          },
          {
            header: "วันที่สิ้นสุดรับประกัน",
            sortable: false,
            align: "center",
            dataIndex: "insurance_end",
            width: 180,
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 1 || record.data.i_type == 2) {
                return "";
              } else if (value) {
                metaData.attr = "style='text-align: center;'";
                return value;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
            },
          },
          {
            header: "หมายเหตุรับประกัน",
            sortable: false,
            align: "center",
            dataIndex: "insurance_mote",
            width: 180,
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 1 || record.data.i_type == 2) {
                return "";
              } else if (value) {
                metaData.attr = "style='text-align: center;'";
                return value;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
            },
          },
          {
            header: "สถานที่ตั้ง",
            sortable: false,
            align: "center",
            dataIndex: "c_location",
            width: 180,
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 1 || record.data.i_type == 2) {
                return "";
              } else if (value) {
                metaData.attr = "style='text-align: center;'";
                return value;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
            },
          },
          {
            header: "รหัสอาคาร",
            sortable: false,
            align: "center",
            dataIndex: "c_code_building",
            width: 180,
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 1 || record.data.i_type == 2) {
                return "";
              } else if (value) {
                metaData.attr = "style='text-align: center;'";
                return value;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
            },
          },
          {
            header: "เลขทะเบียนรถ",
            sortable: false,
            align: "center",
            dataIndex: "car_register",
            width: 180,
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 1 || record.data.i_type == 2) {
                return "";
              } else if (value) {
                metaData.attr = "style='text-align: center;'";
                return value;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
            },
          },
          {
            header: "ประเภทรถ",
            sortable: false,
            align: "center",
            dataIndex: "car_type",
            width: 180,
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 1 || record.data.i_type == 2) {
                return "";
              } else if (value) {
                metaData.attr = "style='text-align: center;'";
                return value;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
            },
          },
          {
            header: "รหัสผู้ดูแล",
            sortable: false,
            align: "center",
            dataIndex: "code_caretaker",
            width: 180,
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 1 || record.data.i_type == 2) {
                return "";
              } else if (value) {
                metaData.attr = "style='text-align: center;'";
                return value;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
            },
          },
          {
            header: "ชื่อผู้ดูแลครุภัณฑ์",
            sortable: false,
            align: "center",
            dataIndex: "name_caretaker",
            width: 180,
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 1 || record.data.i_type == 2) {
                return "";
              } else if (value) {
                metaData.attr = "style='text-align: center;'";
                return value;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
            },
          },
          {
            header: "แฟ้มรูปภาพ",
            sortable: false,
            align: "center",
            dataIndex: "image_file",
            width: 180,
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 1 || record.data.i_type == 2) {
                return "";
              } else if (value) {
                metaData.attr = "style='text-align: center;'";
                return value;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
            },
          },
          {
            header: "สถานะพิมพ์บาร์โค้ด",
            sortable: false,
            align: "center",
            dataIndex: "barcode_status",
            width: 180,
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 1 || record.data.i_type == 2) {
                return "";
              } else if (value) {
                metaData.attr = "style='text-align: center;'";
                return value;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
            },
          },
          {
            id: "delete",
            header: "ลบ",
            sortable: false,
            align: "center",
            width: 30,
            dataIndex: "id",
            renderer: function (value, metaData, record, row, col, store, gridView) {
              // if (record.data.sp_tor_dtl_id < 1 ?? 0 == 0)
              return '<img src="../images/icons/table_delete.png"); style="cursor:pointer"/>';
            },
          },
          { width: 100, dataIndex: "" },
        ],
        // bbar: [
        //   {
        //     text: "&nbsp;" + Ext.GLOBAL_BU_SAVE_TH + "รายละเอียดฯ&nbsp;",
        //     id: "saveDtl",
        //     iconCls: "icon-save",
        //     handler: function (grid, rowIndex, colIndex) {
        //       saveDtl("SAVE_DTL");
        //     },
        //   },
        //   "->",
        //   {
        //     xtype: "label",
        //     id: "statusbar",
        //     html: "<div style='padding: 3px 6px 2px;'><img src='../images/icons/accept.png'><span style='position: relative; top: -4px; left: 5px;'>Ready</span></div>",
        //   },
        // ],
      }),
    ],
  });
}; // formPanelDtl

Ext.extend(formPanelDtl, Ext.Panel, {});
