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

const asset_select = function (data) {
  Ext.storeDtl.each(function (record, idx) {
    var c_code_mode = record.get("c_code_mode") ? record.get("c_code_mode") : "0000";
    var row = record.get("c_code_no") ? "00000" + record.get("c_code_no") : "00000";
    row = row.substr(row.length - 5);
    record.set("c_code", data.c_code + "-" + c_code_mode + "-" + row);
    record.set("d_receive_date", data.d_receive_date);
    record.set("i_budget_year", data.i_budget_year);
    record.set("budget_source", data.budget_source);
    // record.commit();
  });
};
const am_mode_select = function (e) {
  var am_mode = e.value ? Ext.am_mode_acc.getById(e.value).data : "";
  var record = e.record;
  var row = record.get("c_code_no") ? "00000" + record.get("c_code_no") : "00000";
  row = row.substr(row.length - 5);
  record.set("c_code", Ext.SELECT_ROW.c_code + "-" + (e.value ? am_mode.c_code : "0000") + "-" + row);
  record.set("acc_name", e.value ? am_mode.c_name_mode : null);
  record.set("acc_code", e.value ? am_mode.c_code : "0000");
  record.set("i_period_year", e.value ? am_mode.i_period_year : null);
};

const saveDtl = function (mode) {
  let msg = "";
  let jsonArr = [];
  let sto = Ext.getCmp("gridEditor").store.data.items;
  // console.log(sto);
  // return
  sto.forEach(function (v) {
    jsonArr.push({
      am_asset_hdr_id: v.data.id,
      c_code: v.data.c_code,
      c_name: v.data.c_name,
      am_mode_id: v.data.am_mode_id,
      acc_code: v.data.acc_code,
      acc_name: v.data.acc_name,
      i_period_year: v.data.i_period_year,
      f_unit_cost: v.data.f_unit_cost ? v.data.f_unit_cost.replace(/,/g, "") : "",
      d_receive_date: v.data.d_receive_date ? Ext.util.Format.gridDate(v.data.d_receive_date, "Y-m-d") : "",
      dc_expense_budget_type_id: v.data.dc_expense_budget_type_id,
      budget_source: v.data.budget_source,
      i_budget_year: v.data.i_budget_year,
    });
  });

  if (msg == "") {
    Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
    Ext.Ajax.request({
      url: "api/mn_AmAssetDetailRecord.php",
      method: "POST",
      params: {
        mode: mode,
        id: Ext.HDR_ID,
        data: JSON.stringify(jsonArr),
      },
      success: function (result, request) {
        Ext.getCmp("contenterCenter").getEl().unmask();
        let json = Ext.util.JSON.decode(result.responseText); //decode json
        Ext.storeDtl.load({ params: { hdr_id: Ext.HDR_ID } });
        Ext.Msg.alert("แจ้งเตือน", json.msg);
        if (json.success == true) {
          Ext.Msg.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย");
          Ext.store.load();
        }
      },
      failure: function (result, request) {
        Ext.MessageBox.alert("Failed", result.responseText); // connect error
      },
    });
  } else {
    Ext.Msg.alert("แจ้งเตือน", msg);
  }
}; // saveDtl

win_delele = function (rowIndex, record) {
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
          if (record.data.id > 0) {
            Ext.Ajax.request({
              url: "api/mn_AmAssetDetailRecord.php",
              method: "POST",
              params: {
                mode: "DELETE",
                id: record.get("id"),
              },
              success: function (result, request) {
                var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                if (jsonData.success) {
                  // Ext.MessageBox.alert("Success", "ลบสำเร็จ");		// alert massage success
                } else {
                  Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                }
                Ext.getCmp("win-msg-delete").hide(); // hidden window-panel
                Ext.getCmp("win-msg-delete").destroy(); // clear memory :: garbage collection
                Ext.store.load({
                  params: { hdr_id: Ext.HDR_ID },
                });
                // Ext.storeDtl.load({
                //   params: { hdr_id: Ext.HDR_ID },
                // });
                Ext.storeDtl.removeAt(rowIndex);
                Ext.imp_assetall_dtl.load({
                  params: { hdr_id: Ext.HDR_ID },
                });
              },
              failure: function (result, request) {
                Ext.MessageBox.alert("Failed", result.responseText); // connect error
              },
            });
          } else {
            Ext.storeDtl.removeAt(rowIndex);
            Ext.getCmp("win-msg-delete").hide();
            Ext.getCmp("win-msg-delete").destroy();
          }
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
    win_delele(rowIndex, record);
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
      new Ext.grid.EditorGridPanel({
        // new Ext.grid.GridPanel({
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
            // return index % 2 == 0 ? "grid-odd padd-6" : "grid-even padd-6";
          },
        },
        listeners: {
          beforeedit: function (editor) {
            // let row = editor.record.data;
            // if (row.i_type != 0) {
            //   return false;
            // }
          },
        },
        tbar: [
          {
            xtype: "buttongroup",
            // title: "ระบุเงื่อนไขในการค้นหาข้อมูล",
            columns: 1,
            defaults: {
              scale: "small",
              style: {
                float: "left",
                "padding-left": "8px",
                "padding-right": "8px",
              },
            },
            // bodyStyle: 'margin: 10px;',
            // padding: '10',
            items: [
              {
                xtype: "radiogroup",
                id: "i_expense",
                fieldLabel: "ประเภทรายจ่าย",
                columns: [70, 70],
                items: [
                  {
                    boxLabel: "มีมูลค่า",
                    name: "i_expense",
                    inputValue: 1,
                    checked: true,
                  },
                  {
                    boxLabel: "ไม่มีมูลค่า",
                    name: "i_expense",
                    inputValue: 2,
                  },
                ],
                listeners: {
                  change: function (obj, value) {},
                },
              },
              new Ext.ux.Poplov({
                text: "เลือกรายการครุภัณฑ์หลัก...",
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
                widthText: 600,
                fieldLabel: "รหัสครุภัณฑ์",
                isCellClickGrid: true,
                cellClickGrid: function (grid, rowIndex, columnIndex, e) {
                  var poplov_id = "am_asset_hdr_idID";
                  var record = grid.getStore().getAt(rowIndex);
                  Ext.HDR_c_code = record.data.c_code;
                  Ext.HDR_ID = record.data.id;
                  Ext.SELECT_ROW = record.data;
                  var TextShow = record.data.c_code + " : " + record.data.c_name;
                  Ext.getCmp(poplov_id).setValue(record.data.id);
                  Ext.getCmp(poplov_id + "_Name").setValue(TextShow);

                  Ext.getCmp("win-pop-lov" + poplov_id).hide();
                  Ext.getCmp("win-pop-lov" + poplov_id).destroy();

                  asset_select(record.data);
                },
              }).mini,
              {
                xtype: "buttongroup",
                frame: false,
                items: [
                  {
                    text: "เพิ่มรายการรายละเอียด",
                    iconCls: "icon-add",
                    handler: function (grid, rowIndex, colIndex) {
                      if (Ext.getCmp("am_asset_hdr_idID").getValue() > 0) {
                        Ext.c_code_no_gen++;
                        console.log(Ext.c_code_no_gen);
                        var c_code_no = "00000" + Ext.c_code_no_gen;
                        c_code_no = c_code_no.substr(c_code_no.length - 5);

                        let myNewRecord = new storeDtlRecord({
                          id: "",
                          c_code: Ext.SELECT_ROW.c_code + "-0000-" + c_code_no,
                          c_code_no: c_code_no,
                          c_name: "",
                          am_mode_id: "",
                          acc_code: "",
                          acc_name: "",
                          i_period_year: "",
                          f_unit_cost: "",
                          d_receive_date: Ext.SELECT_ROW.d_receive_date,
                          dc_expense_budget_type_id: Ext.SELECT_ROW.dc_expense_budget_type_id,
                          budget_source: Ext.SELECT_ROW.budget_source,
                          i_budget_year: Ext.SELECT_ROW.i_budget_year,
                        });
                        Ext.storeDtl.insert(0, myNewRecord);
                      } else {
                        Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>- กรุณาเลือกรายการครุภัณฑ์หลัก</span><br>");
                      }
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
              },
            ],
          },
        ],
        listeners: {
          afteredit: function (e) {
            if (e.field == "am_mode_id") {
              am_mode_select(e);
            }
          },
        },
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
            header: "รหัสครุภัณฑ์",
            sortable: false,
            align: "center",
            dataIndex: "c_code",
            width: 250,
            // editor: new Ext.form.TextField({
            //   style: "text-align: center",
            // }),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              return value;
            },
          },
          {
            header: "ชื่อครุภัณฑ์",
            sortable: false,
            align: "center",
            dataIndex: "c_name",
            width: 300,
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
            header: "หมวดครุภัณฑ์",
            sortable: false,
            align: "center",
            dataIndex: "am_mode_id",
            width: 210,
            editor: new Ext.form.ComboBox({
              mode: "local",
              id: "editor_am_mode_id",
              store: Ext.am_mode_acc,
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
                  // console.log(d);
                  this.fn();
                  // record.set("c_code_mode", );
                  // record.commit();
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
              if (record.data.i_type == 1 || record.data.i_type == 2) {
                metaData.attr = "style='text-align: right; font-weight: bold;'";
                let name = record.data.i_type == 1 ? getStoreItems(Ext.am_mode_acc, value, "c_name") : "รวมทั้งสิ้น";
                name = name != "" ? name : "- ไม่ระบุหมวดครุภัณฑ์ -";
                return name;
              } else if (value != "" && value != undefined) {
                metaData.attr = "style='text-align: left;'";
                let name = getStoreItems(Ext.am_mode_acc, value, "c_name");
                return name;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }
              // if (record.data.i_type == 1 || record.data.i_type == 2) {
              //   return "";
              // } else if (value) {
              //   metaData.attr = "style='text-align: center;'";
              //   return value;
              // } else {
              //   metaData.attr = "style='text-align: center; color:red;'";
              //   return "-";
              // }
            },
          },
          {
            header: "อายุการใช้งาน",
            sortable: false,
            align: "center",
            dataIndex: "i_period_year",
            width: 210,
            // editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              return value;
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
              if (value) {
                metaData.attr = "style='text-align: right;'";
                return floatRenderer(floatMinus(value.replace(/,/g, ""), 2));
              } else {
                metaData.attr = "style='text-align: right; color:red;'";
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
            // editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              return value;
            },
          },
          {
            header: "วันที่รับ",
            sortable: false,
            align: "center",
            dataIndex: "d_receive_date",
            // editor: new Ext.form.DateField(),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              return value != "" && value != null ? shortThaiDate(value) : "";
            },
          },
          {
            header: "ปีงบประมาณ",
            sortable: false,
            align: "center",
            dataIndex: "i_budget_year",
            width: 80,
            // editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              return value;
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
              return '<img src="../images/icons/table_delete.png"); style="cursor:pointer"/>';
            },
          },
          { width: 50, dataIndex: "" },
        ],
        bbar: [
          {
            text: "&nbsp;" + Ext.GLOBAL_BU_SAVE_TH + "รายละเอียดฯ&nbsp;",
            id: "saveDtl",
            iconCls: "icon-save",
            handler: function (grid, rowIndex, colIndex) {
              saveDtl("SAVE_DTL");
            },
          },
          "->",
          {
            xtype: "label",
            id: "statusbar",
            html: "<div style='padding: 3px 6px 2px;'><img src='../images/icons/accept.png'><span style='position: relative; top: -4px; left: 5px;'>Ready</span></div>",
          },
        ],
      }),
    ],
  });
}; // formPanelDtl

Ext.extend(formPanelDtl, Ext.Panel, {});
