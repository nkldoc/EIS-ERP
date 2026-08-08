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

// save dtl ADD && EDIT
const saveDtl = function (mode) {
  let msg = "";
  let jsonArr = [];
  let sto = Ext.getCmp("gridEditor").store.data.items;

  sto.forEach(function (v) {
    if (v.data.i_type == "0") {
      jsonArr.push({
        imp_assetall_dtl_id: v.data.imp_assetall_dtl_id,
        c_code: v.data.c_code,
        asset_name: v.data.asset_name,
        receive_date: v.data.receive_date ? Ext.util.Format.gridDate(v.data.receive_date, "Y-m-d") : "",
        quantity: v.data.quantity,
        dc_unit_type: v.data.dc_unit_type,
        f_unit_cost: v.data.f_unit_cost ? v.data.f_unit_cost.replace(/,/g, "") : "",
        stockpile: v.data.stockpile,
        Segment: v.data.Segment,
        workandproject: v.data.workandproject,
        fund: v.data.fund,
        event_id: v.data.event_id,
        i_yyyy: v.data.i_yyyy,
        budget_source: v.data.budget_source,
        c_detail: v.data.c_detail,
        c_brand: v.data.c_brand,
        c_model: v.data.c_model,
        c_serial: v.data.c_serial,
        got: v.data.got,
        salvage: v.data.salvage,
        i_period_year: v.data.i_period_year,
        c_commet: v.data.c_commet,
        c_codeold2: v.data.c_codeold2,
        c_codeold1: v.data.c_codeold1,
        receipt_number: v.data.receipt_number,
        insurance_start: v.data.insurance_start,
        insurance_year: v.data.insurance_year,
        insurance_month: v.data.insurance_month,
        insurance_end: v.data.insurance_end,
        insurance_mote: v.data.insurance_mote,
        c_location: v.data.c_location,
        c_code_building: v.data.c_code_building,
        car_register: v.data.car_register,
        car_type: v.data.car_type,
        code_caretaker: v.data.code_caretaker,
        name_caretaker: v.data.name_caretaker,
        image_file: v.data.image_file,
        barcode_status: v.data.barcode_status,
      });
    }
  });

  // console.log(jsonArr);
  // return;
  if (msg == "") {
    Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
    Ext.Ajax.request({
      url: "api/mn_ImpAssetAllSupplies.php",
      method: "POST",
      params: {
        mode: mode,
        id: Ext.HDR_ID,
        i_import_excel: Ext.i_import_excel,
        data: JSON.stringify(jsonArr),
      },
      success: function (result, request) {
        Ext.getCmp("contenterCenter").getEl().unmask();
        let json = Ext.util.JSON.decode(result.responseText); //decode json
        Ext.storeDtl.load({ params: { hdr_id: Ext.HDR_ID } });
        Ext.i_import_excel = false;
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

const impData = function () {
  let json = [];
  let ii = 0;
  dataDtl.forEach((obj) => {
    let json_row = [];
    let i = 0;
    // console.log(obj);
    Object.entries(obj).forEach(([key, value]) => {
      json_row[i++] = value ? value : "";
    });
    // console.log(json_row);
    let receive_date = json_row[2] ? json_row[2].split("/") : "";
    receive_date = json_row[2] ? Ext.util.Format.date(receive_date[1] + "/" + receive_date[0] + "/" + (parseInt(receive_date[2]) + 543), "d-m-Y") : "";
    json.push({
      no: ++ii,
      i_type: "0",
      imp_assetall_dtl_id: "0",
      c_code: json_row[0],
      asset_name: json_row[1],
      receive_date: receive_date,
      quantity: json_row[3],
      dc_unit_type: json_row[4],
      f_unit_cost: json_row[5],
      stockpile: json_row[8],
      Segment: json_row[9],
      workandproject: json_row[10],
      fund: json_row[11],
      event_id: json_row[12],
      i_yyyy: json_row[13],
      budget_source: json_row[14],
      c_detail: json_row[15],
      c_brand: json_row[17],
      c_model: json_row[18],
      c_serial: json_row[19],
      got: json_row[20],
      salvage: json_row[21],
      i_period_year: json_row[22],
      c_commet: json_row[26],
      c_codeold2: json_row[27],
      c_codeold1: json_row[28],
      receipt_number: json_row[29],
      insurance_start: json_row[30],
      insurance_year: json_row[31],
      insurance_month: json_row[32],
      insurance_end: json_row[33],
      insurance_mote: json_row[34],
      c_location: json_row[35],
      c_code_building: json_row[36],
      car_register: json_row[37],
      car_type: json_row[38],
      code_caretaker: json_row[39],
      name_caretaker: json_row[40],
      image_file: json_row[41],
      barcode_status: json_row[42],
    });
  });
  Ext.storeDtl.loadData({ data: json });
  Ext.i_import_excel = true;
}; // impData

cellClickDtl = function (grid, rowIndex, columnIndex, e) {
  let record = grid.getStore().getAt(rowIndex);
  if (columnIndex == grid.getColumnModel().getIndexById("no") && record.data.i_type == "0") {
    let record = Ext.storeDtl.getAt(rowIndex);
    record.set("i_status", record.data.i_status == 1 ? 0 : 1);
  }
}; //cellClick
const popDtlExcel = function () {
  new Ext.Window({
    title: "นำเข้าไฟล์",
    id: "win-pop-excel",
    layout: "fit",
    modal: true,
    width: Ext.getBody().getViewSize().width * 0.6,
    listeners: {
      afterrender: function (component) {
        new Ext.ux.form.FileUploadField({
          id: "dtl_import",
          name: "dtl_import",
          emptyText: "เลือกไฟล์ excel...	",
          buttonText: "",
          width: 300,
          buttonCfg: { iconCls: "import_excel" },
          listeners: {
            fileselected: async function (fp, filename) {},
          },
          renderTo: "Ext_dtl_import",
        });
      },
    },
    items: [
      {
        xtype: "form",
        id: "form-excel",
        border: false,
        fileUpload: true,
        bodyStyle: { padding: "10px 20px" },
        html:
          "<table border='0' cellspacing='2' cellpadding='0' width='100%' style='padding: 4px; 0px;'>" +
          "<input type='hidden' name='mode' value='IMPORT_EXCEL'>" +
          "<input type='hidden' name='id' value='" +
          Ext.HDR_ID +
          "'>" +
          "<colgroup width='50%'></colgroup>" +
          "<colgroup width='50%'></colgroup>" +
          "<tr>" +
          "<td align='right'>เลือก file Excel (.xlsx, .xls) : </td>" +
          "<td><div id='Ext_dtl_import'></div></td>" +
          "</tr>" +
          "</table>",
      },
    ],
    buttonAlign: "left",
    buttons: [
      {
        text: "&nbsp;โหลดข้อมูล&nbsp;&nbsp;",
        iconCls: "icon-save",
        handler: async function () {
          let msg = "";
          let file = Ext.get("dtl_import-file").dom.files[0];
          let parts = null;
          try {
            parts = file.name.split(".");
          } catch (err) {}
          if (file == "" || file == undefined) {
            msg += "<span style='white-space: nowrap;'>กรุณาเลือกไฟล์ที่ต้องการ</span><br>";
          } else if (parts[parts.length - 1] != "xlsx" && parts[parts.length - 1] != "xls") {
            msg += "<span style='white-space: nowrap;'>กรุณาเลือก excel เป็นไฟล์ (.xlsx, .xls)</span><br>";
          }
          if (msg == "") {
            try {
              Ext.getCmp("win-pop-excel").getEl().mask("Please wait...", "x-mask-loading");
              let jsonExcel = await loadExcelJson(file);
              if (jsonExcel.success == true) {
                Ext.getCmp("win-pop-excel").getEl().unmask();
                dataDtl = jsonExcel.data[0];
                // console.log(jsonExcel);
                await impData();
                Ext.getCmp("win-pop-excel").destroy();
              }
            } catch (err) {
              console.log(err);
            }
          } else {
            Ext.Msg.alert("แจ้งเตือน", msg);
          }
        },
      },
      {
        text: Ext.GLOBAL_BU_BACK_TH,
        handler: function () {
          Ext.getCmp("win-pop-excel").destroy();
        },
      },
    ],
  }).show();
}; // popDtlExcel

// Class Extend
formPanelDtl = function (args) {
  formPanelDtl.superclass.constructor.call(this, {
    title: "รายละเอียด" + Ext.title_panel,
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
            text: "เพิ่มแถว",
            iconCls: "icon-add",
            handler: function (grid, rowIndex, colIndex) {
              let myNewRecord = new storeDtlRecord({
                no: "",
                i_type: "0",
                id: "",
                imp_assetall_dtl_id: "",
                c_code: "",
                asset_name: "",
                receive_date: "",
                quantity: "",
                dc_unit_type: "",
                f_unit_cost: undefined,
                stockpile: "",
                Segment: "",
                workandproject: "",
                fund: "",
                event_id: "",
                i_yyyy: "",
                budget_source: "",
                c_detail: "",
                c_brand: "",
                c_model: "",
                c_serial: "",
                got: "",
                salvage: "",
                i_period_year: "",
                c_commet: "",
                c_codeold2: "",
                c_codeold1: "",
                receipt_number: "",
                insurance_start: "",
                insurance_year: "",
                insurance_month: "",
                insurance_end: "",
                insurance_mote: "",
                c_location: "",
                c_code_building: "",
                car_register: "",
                car_type: "",
                code_caretaker: "",
                name_caretaker: "",
                image_file: "",
                barcode_status: "",
              });
              Ext.storeDtl.insert(0, myNewRecord);
            },
          },
          { xtype: "tbspacer", width: 4 },
          {
            xtype: "button",
            text: "นำเข้าไฟล์ excel",
            id: "add_dtl",
            iconCls: "import_excel",
            handler: function (grid, rowIndex, colIndex) {
              popDtlExcel();
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
                callback: function (records, operation, success) {
                },
              });
              Ext.getCmp("saveDtl").enable();
              Ext.getCmp("label_red").hide();
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
          { width: 100, dataIndex: "" },
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
          { xtype: "label", id: "label_red", hidden: true, style: "padding: 10px 10px; color:red; font-size:12px;", text: "(เมื่อทำการขยายเวลากันเงิน จะไม่สามารถบันทึกรายการได้)" },
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
