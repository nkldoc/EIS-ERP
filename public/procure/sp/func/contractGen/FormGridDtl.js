Ext.i_import_excel = false; // เช็คค่าว่าเป็นการ นำเข้า Excel หรือไม่
Ext.f_sum_dtl = 0;
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
   // if (v.data.i_type == "0") {
      jsonArr.push({

        am_mode_name: v.data.am_mode_name,
        am_mode_small: v.data.am_mode_small,
        asset_name: v.data.asset_name,
        quantity: v.data.quantity, // ? v.data.quantity.replace(/,/g, "") : "",
        dc_unit_type: v.data.dc_unit_type,
        f_unit_cost: v.data.f_unit_cost, // ? v.data.f_unit_cost.replace(/,/g, "") : "",
        workandproject: v.data.workandproject,
        c_brand: v.data.c_brand,
        c_model: v.data.c_model,
        c_serial: v.data.c_serial,
        i_period_year: v.data.i_period_year, // ? v.data.i_period_year.replace(/,/g, "") : "",
        f_runis: v.data.f_runis, // ? v.data.f_runis.replace(/,/g, "") : "",
        c_comment: v.data.c_comment,
        insurance_start: v.data.insurance_start,
        insurance_year: v.data.insurance_year,
        insurance_month: v.data.insurance_month,
        insurance_end: v.data.insurance_end,
        insurance_mote: v.data.insurance_mote,
        c_location: v.data.c_location,
        c_code_building: v.data.c_code_building,
        car_register: v.data.car_register,
        car_type: v.data.car_type,
        c_code_parent: v.data.c_code_parent,
      });
  //  }
  });

  // console.log(jsonArr);
  // return;
  if (msg == "") {
    Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
    Ext.Ajax.request({
      url: "api/mn_AmImpPurchase.php",
      method: "POST",
      params: {
        mode: mode,
        i_import_excel : Ext.i_import_excel,
        tor_id : Ext.getCmp("tor_id").getValue(),
        sp_tor_contract_id : Ext.getCmp("sp_tor_contract_id").getValue(),
        sp_tor_hdr_period_id : Ext.getCmp("sp_tor_hdr_period_id").getValue(),
        sp_check_period_hdr_id : Ext.getCmp("sp_check_period_hdr_id").getValue(),
        tor_type_id :  Ext.getCmp("tor_type_id").getValue(),
        c_code_contract : Ext.getCmp("c_code").getValue(),
        c_name_contract : Ext.getCmp("c_name").getValue(),
        tor_type_name : Ext.getCmp("tor_type_name").getValue(),
        i_period : Ext.getCmp("i_period").getValue(),
        c_system : Ext.getCmp("c_system").getValue(),
        dc_creditor_id : Ext.getCmp("dc_creditor_id").getValue(),
        po_expense_id : Ext.getCmp("po_expense_id").getValue(),
        c_code_check : Ext.getCmp("c_code_check").getValue(),
        c_code_d : Ext.getCmp("c_code_d").getValue(),
        d_checking_date : Ext.getCmp("d_checking_date").getValue(),
        d_arrive_date : Ext.getCmp("d_arrive_date").getValue(),
        d_doc_date : Ext.getCmp("d_doc_date").getValue(),
        dc_expense_budget_type_id : Ext.getCmp("dc_expense_budget_type_id").getValue(),
        c_budget_type : Ext.getCmp("c_budget_type").getValue(),
        dc_cost_id : Ext.getCmp("dc_cost_id").getValue(),
        dc_cost_acc_id : Ext.getCmp("dc_cost_acc_id").getValue(),
        c_cost_name : Ext.getCmp("c_cost_name").getValue(),
        f_workin0 : Ext.getCmp("f_workin0").getValue(), //จำนวนเงินได้ของ
        f_workin1 : Ext.getCmp("f_workin1").getValue(), //จำนวนเงินระหว่างดำเนินการ
        f_workin2 : Ext.getCmp("f_workin2").getValue(), //จำนวนเงินระหว่างดำเนินการ/ได้ของ
        f_total : Ext.getCmp("f_total").getValue(),
        f_before : Ext.getCmp("f_before").getValue(), 
        f_donate : Ext.getCmp("f_donate").getValue(),
        data: JSON.stringify(jsonArr),
      },
      success: function (result, request) {
        Ext.getCmp("contenterCenter").getEl().unmask();
        let json = Ext.util.JSON.decode(result.responseText); //decode json
        //Ext.storeDtl.load({ params: { hdr_id: Ext.HDR_ID } });
        Ext.storeDtl.reload();
        Ext.i_import_excel = false;
        Ext.Msg.alert("แจ้งเตือน", json.msg);
        if (json.success == true) {
          Ext.Msg.alert("แจ้งเตือน", "ขึ้นทะเบียนครุภัณฑ์เรียบร้อย");
          Ext.store.load();
          Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
          Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
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
  Ext.f_sum_dtl = 0;
  dataDtl.forEach((obj) => {
    let json_row = [];
    let i = 0;
    let f_sum_cost = 0 ;
    let f_cost_sum = 0;
    let f_4 = 0;
   
    // console.log(obj);
    Object.entries(obj).forEach(([key, value]) => {
      json_row[i++] = value ? value : "";
    });
    //console.log(json_row);
    f_sum_cost = parseFloat(json_row[6].replaceAll(",", "")); //มูลค่ารวม
    f_cost_sum = 0;//มูลค่ารวมตามจำนวนรายการ
    // สร้างรายการตามจำนวน
    for($q=1; $q<=json_row[3];$q++){
      f_cost_sum += parseFloat(json_row[5].replaceAll(",", ""));
      if ($q==json_row[3]){       
        f_dff = f_sum_cost-f_cost_sum;
        f_4=parseFloat(json_row[5].replaceAll(",", ""))+f_dff;
       }else f_4 = parseFloat(json_row[5].replaceAll(",", ""));
      json.push({
        no: ++ii,
        am_mode_name: json_row[0],
        am_mode_small: json_row[1],
        asset_name: json_row[2],
        quantity: 1,
        dc_unit_type: json_row[4],
        f_unit_cost: f_4.toFixed(2),
        workandproject: json_row[7],
        c_brand: json_row[8],
        c_model: json_row[9],
        c_serial: json_row[10],
        i_period_year: json_row[11],
        f_runis: json_row[12],
        c_comment: json_row[13],
        insurance_start: json_row[14],
        insurance_year: json_row[15],
        insurance_month: json_row[16],
        insurance_end: json_row[17],
        insurance_mote: json_row[18],
        c_location: json_row[19],
        c_code_building: json_row[20],
        car_register: json_row[21],
        car_type: json_row[22],
        c_code_parent: json_row[23]
      });
      Ext.f_sum_dtl +=parseFloat(f_4.toFixed(2));
    }
    
  });
  Ext.storeDtl.loadData({ data: json });
  Ext.i_import_excel = true;
  let ff_dtl =  floatRenderer(floatMinus(Ext.f_sum_dtl.toFixed(2), 2));
  Ext.getCmp("f_sum_dtl").setValue(ff_dtl);
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
                //console.log(jsonExcel.data);
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
          /*{
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
                c_comment: "",
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
          */
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
            header: "หมวดครุภัณฑ์",
            sortable: false,
            align: "center",
            dataIndex: "am_mode_name",
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
            header: "หมวดครุภัณฑ์ย่อ",
            sortable: false,
            align: "center",
            dataIndex: "am_mode_small",
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
              /*
              if (record.data.i_type == 1 || record.data.i_type == 2) {
                return "";
              } else if (value) {
                metaData.attr = "style='text-align: center;'";
                return value;
              } else {
                metaData.attr = "style='text-align: center; color:red;'";
                return "-";
              }*/
              return value;
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
            header: "มูลค่าซาก",
            sortable: false,
            align: "center",
            dataIndex: "f_runis",
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
            dataIndex: "c_comment",
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
            header: "อาคาร",
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
            header: "รหัสครุภัณฑ์เดิม",
            sortable: false,
            align: "center",
            dataIndex: "c_code_parent",
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
            text: "&nbsp;ขึ้นทะเบียนครุภัณฑ์",// + Ext.GLOBAL_BU_SAVE_TH + "รายละเอียดฯ&nbsp;",
            id: "saveDtl",
            iconCls: "icon-save",
            handler: function (grid, rowIndex, colIndex) {
              let msg = "";
              if (Ext.getCmp("f_sum_dtl").getValue() !==Ext.getCmp("f_sum_hdr").getValue() ){
                msg += "ยอดเงินไม่เท่ากัน <br>";
              } 
              if (msg == ""){
                saveDtl("SAVE_DTL");
              }else
              Ext.MessageBox.alert("แจ้งเตือน", msg); // error
              console.log (Ext.getCmp("f_sum_dtl"));
              
            },
              
           
              //saveDtl("SAVE_DTL");
            
          },
          "->",
          { xtype: "label", id: "label_red1", style: "padding: 10px 10px; font-size:12px;", text: "มูลค่ารวมในสัญญา :" }
          ,{
            xtype: "textfield",
            id: "f_sum_hdr",
            name: "f_sum_hdr",
            readOnly: true,
            width: 120,
            style: {
                "font-size":"12px",
                labelAlign: "right",
                "font-weight": "bold",
                padding: "1px",
                margin: "1px",
                color: "green",
                "background-color": "#fff",
                "text-align": "right",
            }
          },
          { xtype: "label", id: "label_red2", style: "padding: 10px 10px; font-size:12px;", text: "มูลค่ารวมสินทรัพย์ :" }
          ,{
            xtype: "textfield",
            id: "f_sum_dtl",
            name: "f_sum_dtl",
            readOnly: true,
            width: 120,
            style: {
                "font-size":"12px",
                labelAlign: "right",
                "font-weight": "bold",
                padding: "1px",
                margin: "1px",
                color: "green",
                "background-color": "#fff",
                "text-align": "right",
            }
          },
          {
            xtype: "label",
            id: "statusbar",
            html: "<div style='padding: 3px 6px 2px;'><span style='position: relative; top: -4px; left: 5px;'>  </span></div>",
          },
        ],
      }),
    ],
  });
}; // formPanelDtl

Ext.extend(formPanelDtl, Ext.Panel, {});
