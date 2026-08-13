Ext.i_import_excel = false; // เช็คค่าว่าเป็นการ นำเข้า Excel หรือไม่
dataDtl = [];

const statusbar = function(type) {
  if (type) {
    $("#statusbar").html("<div style='padding: 3px 6px 2px;'><img src='../images/icons/accept.png'><span style='position: relative; top: -4px; left: 5px;'>Ready</span></div>");
  } else {
    $("#statusbar").html(
      "<div style='padding: 3px 6px 2px;'><img style='animation-name: spin; animation-duration: 100ms;animation-iteration-count: infinite;animation-timing-function: linear;' src='../images/icons/hourglass.png'><span style='position: relative; top: -4px; left: 5px;'>Loading</span></div>"
    );
  }
};

// save dtl ADD && EDIT
const saveDtl = function(mode) {
  let msg = "";
  let jsonArr = [];
  let sto = Ext.getCmp("gridEditor").store.data.items;
  sto.forEach(function(v) {
    let d_doc = v.data.d_doc ? v.data.d_doc.split("-") : "";
    d_doc = v.data.d_doc ? Ext.util.Format.date(parseInt(d_doc[2]) - 543 + "-" + d_doc[1] + "-" + d_doc[0], "Y-m-d") : "";

    jsonArr.push({
      imp_expense_ephis_dtl_id: v.data.id,
      dc_expense_group_vsn_id: v.data.dc_expense_group_vsn_id,
      dc_expense_acc_vsn_id: v.data.dc_expense_acc_vsn_id,
      c_booking: v.data.c_booking,
      c_budget_year: v.data.c_budget_year,
      i_type_year: v.data.i_type_year,
      d_doc: d_doc,
      c_request: v.data.c_request,
      c_approve: v.data.c_approve,
      c_expense_group_main: v.data.c_expense_group_main,
      c_expense_group_sub: v.data.c_expense_group_sub,
      c_acc_item: v.data.c_acc_item,
      c_budget_type_name: v.data.c_budget_type_name,
      c_pay_time: v.data.c_pay_time,
      c_bglst: v.data.c_bglst,
      c_creditor: v.data.c_creditor,
      c_bank_name: v.data.c_bank_name,
      c_bank_branch_name: v.data.c_bank_branch_name,
      c_cheque_numbers: v.data.c_cheque_numbers,
      c_note: v.data.c_note,
      f_inv: v.data.f_inv.replace(/,/g, ""),
      f_vat: v.data.f_vat.replace(/,/g, ""),
      f_tax_personal: v.data.f_tax_personal.replace(/,/g, ""),
      f_tax_corporate: v.data.f_tax_corporate.replace(/,/g, ""),
      f_social_security: v.data.f_social_security.replace(/,/g, ""),
      f_money1: v.data.f_money1.replace(/,/g, ""),
      f_fine: v.data.f_fine.replace(/,/g, ""),
      f_total: v.data.f_total.replace(/,/g, ""),
      f_check_total: v.data.f_check_total.replace(/,/g, ""),
      i_cal_gl: v.data.i_cal_gl,
      imp_request_ephis_dtl_id: v.data.imp_request_ephis_dtl_id
    });
  });

  if (msg == "") {
    Ext.getCmp("contenterCenter")
      .getEl()
      .mask("Please wait...", "x-mask-loading");
    Ext.Ajax.request({
      url: "api/mn_ImpExpenseEphis.php",
      method: "POST",
      params: {
        mode: mode,
        id: Ext.HDR_ID,
        i_import_excel: Ext.i_import_excel,
        data: JSON.stringify(jsonArr)
      },
      success: function(result, request) {
        Ext.getCmp("contenterCenter")
          .getEl()
          .unmask();
        let json = Ext.util.JSON.decode(result.responseText); //decode json

        Ext.storeDtl.load({ params: { hdr_id: Ext.HDR_ID } });
        Ext.i_import_excel = false;
        Ext.Msg.alert("แจ้งเตือน", json.msg);

        if (json.success == true) {
          Ext.Msg.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย");
          Ext.store.load();
        }
      },
      failure: function(result, request) {
        Ext.MessageBox.alert("Failed", result.responseText); // connect error
      }
    });
  } else {
    Ext.Msg.alert("แจ้งเตือน", msg);
  }
}; // saveDtl

// render ข้อมูล
const impData = function() {
  let json = [];
  let ii = 0;
  dataDtl.forEach(v => {
    let c_budget_year = "";
    let dc_expense_group_vsn_id = "";
    let dc_expense_acc_vsn_id = "";
    // ปีงบประมาณ
    try {
      let index_id = Ext.store_year.findExact("c_name", parseInt(v.ปีงบ));
      c_budget_year = Ext.store_year.data.items[index_id].id;
    } catch (err) {}
    // หมวดรายจ่าย
    try {
      let index_id = Ext.dc_expense_group_vsn.findExact("c_name", "" + v.หมวดรายจ่าย + "");
      dc_expense_group_vsn_id = Ext.dc_expense_group_vsn.data.items[index_id].id;
    } catch (err) {}
    // รายจ่ายย่อย
    try {
      let index_id = Ext.dc_expense_acc_vsn_full.findExact("c_name", "" + v.bglstnm + "");
      dc_expense_acc_vsn_id = Ext.dc_expense_acc_vsn_full.data.items[index_id].id;
    } catch (err) {}

    let d_doc = v.paydate ? v.paydate.split("/") : "";

    d_doc = v.paydate ? Ext.util.Format.date(d_doc[1] + "/" + d_doc[0] + "/" + (parseInt(d_doc[2]) + 543), "d-m-Y") : "";
    
//    imp_request_ephis_dtl_id = Ext.imp_request_ephis_dtl_id.data.items[index_id].id;

    //console.log("วันที่ format Exp 03-03-2563 : ", d_doc);

    json.push({
      no: ++ii,
      imp_expense_ephis_hdr_id: Ext.HDR_ID,
      dc_expense_group_vsn_id: dc_expense_group_vsn_id,
      dc_expense_acc_vsn_id: dc_expense_acc_vsn_id,
      c_budget_year: c_budget_year,
      i_type_year: 1,
      d_doc: d_doc,
      c_request: v.rcvno,
      c_approve: v.dkno,
      c_expense_group_main: v.หมวดรายจ่าย,
      c_expense_group_sub: v.bglstnm,
      c_acc_item: v.lstnm,
      c_budget_type_name: v.bgtyptnm,
      c_pay_time: v.paytime,
      c_bglst: v.bglst,
      c_creditor: v.paytonm,
      c_bank_name: v.banknm,
      c_bank_branch_name: v.branchnm,
      c_cheque_numbers: v.checksno,
      c_note: v.note,
      f_inv: v.dkamt.replace(/,/g, ""),
      f_vat: v.vatamt.replace(/,/g, ""),
      f_tax_personal: v.taxntramt.replace(/,/g, ""),
      f_tax_corporate: v.taxjrtamt.replace(/,/g, ""),
      f_social_security: v.socamt.replace(/,/g, ""),
      f_money1: v.pljobperamt.replace(/,/g, ""),
      f_fine: v.fineamt.replace(/,/g, ""),
      f_total: v.total.replace(/,/g, ""),
      f_check_total: v.checksamt.replace(/,/g, ""),
      i_cal_gl: 2
   //   ,imp_request_ephis_dtl_id : imp_request_ephis_dtl_id
    });
  });
  Ext.storeDtl.loadData({ data: json });
  Ext.i_import_excel = true;
}; // impData

const popDtlExcel = function() {
  new Ext.Window({
    title: "นำเข้าไฟล์",
    id: "win-pop-excel",
    layout: "fit",
    modal: true,
    width: Ext.getBody().getViewSize().width * 0.6,
    listeners: {
      afterrender: function(component) {
        new Ext.ux.form.FileUploadField({
          id: "dtl_import",
          name: "dtl_import",
          emptyText: "เลือกไฟล์ excel...	",
          buttonText: "",
          width: 300,
          buttonCfg: { iconCls: "import_excel" },
          listeners: {
            fileselected: async function(fp, filename) {}
          },
          renderTo: "Ext_dtl_import"
        });
      }
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
          "</table>"
      }
    ],
    buttonAlign: "left",
    buttons: [
      {
        text: "&nbsp;โหลดข้อมูล&nbsp;&nbsp;",
        iconCls: "icon-save",
        handler: async function() {
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
              Ext.getCmp("win-pop-excel")
                .getEl()
                .mask("Please wait...", "x-mask-loading");
              let jsonExcel = await loadExcelJson(file);
              if (jsonExcel.success == true) {
                Ext.getCmp("win-pop-excel")
                  .getEl()
                  .unmask();
                dataDtl = jsonExcel.data[0];
                await impData();
                Ext.getCmp("win-pop-excel").destroy();
              }
            } catch (err) {
              console.log(err);
            }
          } else {
            Ext.Msg.alert("แจ้งเตือน", msg);
          }
        }
      },
      {
        text: Ext.GLOBAL_BU_BACK_TH,
        handler: function() {
          Ext.getCmp("win-pop-excel").destroy();
        }
      }
    ]
  }).show();
}; // popDtlExcel

// Class Extend
formPanelDtl = function(args) {
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
      afterrender: function(obj, eOpts) {
        Ext.getCmp("contenterCenter")
          .getEl()
          .mask("Please wait...", "x-mask-loading");
        Ext.storeDtl.load({
          params: { hdr_id: Ext.HDR_ID },
          callback: function(records, operation, success) {
            Ext.getCmp("contenterCenter")
              .getEl()
              .unmask();
          }
        });
        Ext.i_import_excel = false;
      }
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
          getRowClass: function(record, index, rowParams) {
           
           if (record.data.imp_request_ephis_dtl_id>0) { //แถวที่มีการบันทึกบัญชีตั้งหนี้จากใบเบิกแล้ว 
              return "tr_pink"; 
           }
           else
           {
              return index % 2 == 0 ? "grid-odd padd-6" : "grid-even padd-6";
           }
          }
        },
        listeners: {
          afteredit: function(e) {
            let rec = e.record;
            if (e.field == "dc_expense_group_vsn_id") {
              rec.set("dc_expense_acc_vsn_id", "");
              statusbar(false);
              Ext.dc_expense_acc_vsn.load({
                params: { dc_expense_group_vsn_id: 0 },
                callback: function(records, operation, success) {
                  statusbar(true);
                }
              });
            }
          },
          beforeedit: function(e) {
            if (e.field == "dc_expense_acc_vsn_id") {
              let storeEditor = Ext.getCmp("editor_dc_expense_acc_vsn_id").getStore();
              statusbar(false);
              storeEditor.load({
                params: { dc_expense_group_vsn_id: e.record.data.dc_expense_group_vsn_id },
                callback: function(records, operation, success) {
                  statusbar(true);
                  let recordNumber = storeEditor.findExact("id", e.record.data.dc_expense_acc_vsn_id, 0);
                  if (recordNumber == -1) return -1;
                  let displayValue = storeEditor.getAt(recordNumber).data["c_name"];
                  Ext.getCmp("editor_dc_expense_acc_vsn_id").setRawValue(displayValue);
                  Ext.getCmp("editor_dc_expense_acc_vsn_id").setValue(e.record.data.dc_expense_acc_vsn_id);
                }
              });
            }
          }
        },
        tbar: [
          {
            text: "นำเข้าไฟล์ excel",
            id: "add_dtl",
            iconCls: "import_excel",
            handler: function(grid, rowIndex, colIndex) {
              popDtlExcel();
            }
          },
          "-",
          {
            text: "โหลดข้อมูลใหม่",
            iconCls: "icon-refresh",
            handler: function(grid, rowIndex, colIndex) {
              Ext.storeDtl.load({ params: { hdr_id: Ext.HDR_ID } });
              Ext.i_import_excel = false;
            }
          },
          "->",
          {
            xtype: "form",
            html: "<div style='padding:10px 20px; text-align: left;'><ul><li style='color:#005aff;'>** : มีผลกับการออก GX</li></ul></div>"
          }
        ],
        columns: [
          new Ext.grid.RowNumberer({
            header: "ที่",
            width: 30,
            renderer: function(value, metaData, record, row, col, store, gridView) {
              metaData.attr = "style='cursor:pointer; text-align:center;';";
              return record.get("no");
            }
          }),
          {
            header: "เงื่อนไขงบประมาณ",
            sortable: false,
            align: "center",
            dataIndex: "i_type_year",
            width: 100,
            editor: new Ext.form.ComboBox({
              mode: "local",
              store: Ext.store_type_year,
              valueField: "id",
              displayField: "c_name",
              triggerAction: "all",
              forceSelection: true,
              selectOnFocus: true,
              typeAhead: false,
              editable: false,
              emptyText: "กรุณาเลือก...",
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
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              if (value != "" && value != undefined) {
                let name = getStoreItems(Ext.store_type_year, value, "c_name");
                return name;
              } else {
                metaData.attr = "style='color:red;'";
                return "-";
              }
            }
          },
          {
            header: "ปีงบประมาณ",
            sortable: false,
            align: "center",
            dataIndex: "c_budget_year",
            width: 90,
            editor: new Ext.form.ComboBox({
              mode: "local",
              store: Ext.store_year,
              valueField: "id",
              displayField: "c_name",
              triggerAction: "all",
              forceSelection: true,
              selectOnFocus: true,
              typeAhead: false,
              emptyText: "กรุณาเลือก...",
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
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              if (value != "" && value != undefined) {
                return parseInt(value) + 543;
              } else {
                metaData.attr = "style='color:red;'";
                return "-";
              }
            }
          },
          {
            header: "<font color=#005aff>** </font>สถานะการบันทึกบัญชี",
            sortable: false,
            align: "center",
            dataIndex: "i_cal_gl",
            width: 130,
            editor: new Ext.form.ComboBox({
              mode: "local",
              store: Ext.store_cal_gl,
              valueField: "id",
              displayField: "c_name",
              triggerAction: "all",
              forceSelection: true,
              selectOnFocus: true,
              typeAhead: false,
              editable: false,
              emptyText: "กรุณาเลือก...",
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
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              if (value != "" && value != undefined) {
                let name = getStoreItems(Ext.store_cal_gl, value, "c_name");
                return name;
              } else {
                metaData.attr = "style='color:red;'";
                return "-";
              }
            }
          },
          {
            header: "เลขที่ใบขอกันเงิน",
            sortable: false,
            align: "center",
            dataIndex: "c_booking",
            width: 100,
            editor: { xtype: "textfield" },
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              return value;
            }
          },
          {
            header: "<font color=#005aff>** </font>หมวดรายจ่าย",
            sortable: false,
            align: "center",
            dataIndex: "dc_expense_group_vsn_id",
            width: 250,
            editor: new Ext.form.ComboBox({
              mode: "local",
              store: Ext.dc_expense_group_vsn,
              valueField: "id",
              displayField: "c_name",
              triggerAction: "all",
              forceSelection: true,
              selectOnFocus: true,
              typeAhead: false,
              emptyText: "กรุณาเลือก...",
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
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              if (value != "" && value != undefined) {
                return getStoreItems(Ext.dc_expense_group_vsn, value, "c_name");
              } else {
                metaData.attr = "style='color:red;'";
                return "-";
              }
            }
          },
          {
            header: "<font color=#005aff>** </font>รายจ่ายย่อย",
            sortable: false,
            align: "center",
            dataIndex: "dc_expense_acc_vsn_id",
            width: 300,
            editor: new Ext.form.ComboBox({
              id: "editor_dc_expense_acc_vsn_id",
              mode: "local",
              store: Ext.dc_expense_acc_vsn,
              loadMask: true,
              valueField: "id",
              displayField: "c_name",
              triggerAction: "all",
              forceSelection: true,
              selectOnFocus: true,
              typeAhead: false,
              emptyText: "กรุณาเลือก...",
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
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              if (value != "" && value != undefined) {
                metaData.attr = "style='text-align:left;'";
                return getStoreItems(Ext.dc_expense_acc_vsn_full, value, "c_name");
              } else {
                metaData.attr = "style='color:red;'";
                return "-";
              }
            }
          },
          {
            header: "<font color=#005aff>** </font>ผังบัญชี",
            sortable: false,
            align: "center",
            dataIndex: "",
            width: 250,
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              let row = record.data;
              if (row.dc_expense_acc_vsn_id > 0 && row.dc_expense_acc_vsn_id != null) {
                metaData.attr = "style='color: green; text-align: left;'";
                if (parseInt(row.i_type_year) == 1) {
                  let acc_code = getStoreItems(Ext.dc_expense_acc_vsn_full, row.dc_expense_acc_vsn_id, "acc_code");
                  let acc_name = getStoreItems(Ext.dc_expense_acc_vsn_full, row.dc_expense_acc_vsn_id, "acc_name");
                  return acc_code + " : " + acc_name;
                } else {
                  let acc_code = getStoreItems(Ext.dc_expense_acc_vsn_full, row.dc_expense_acc_vsn_id, "acc_code_overlap");
                  let acc_name = getStoreItems(Ext.dc_expense_acc_vsn_full, row.dc_expense_acc_vsn_id, "acc_name_overlap");
                  return acc_code + " : " + acc_name;
                }
              } else {
                metaData.attr = "style='color: red; text-align: center;'";
                return "- ยังไม่ระบุรายจ่ายย่อย -";
              }
            }
          },
          {
            header: "เลขที่ฎีกา",
            sortable: false,
            align: "center",
            dataIndex: "c_approve",
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              return value;
            }
          },
          {
            header: "วันที่ดำเนินการ<br>จัดทำทะเบียนจ่าย",
            sortable: false,
            align: "center",
            dataIndex: "d_doc",
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              return value != "" ? shortThaiDate(value) : "";
            }
          },
          {
            header: "<font color=#005aff>** </font>จำนวนขอเบิกทั้งสิ้น",
            sortable: false,
            align: "center",
            dataIndex: "f_inv",
            width: 120,
            editor: {
              xtype: "textfield",
              listeners: {
                afterrender: function() {
                  this.fn = function() {
                    this.setValue(floatMinus(this.getValue().replace(/,/g, ""), 2));
                  };
                },
                Change: function(value) {
                  this.fn();
                }
              }
            },
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = "style='text-align: right;'";
              return floatRenderer(floatMinus(value, 2));
            }
          },
          {
            header: "<font color=#005aff>** </font>จำนวนเงินภาษีมูลค่าเพิ่ม",
            sortable: false,
            align: "center",
            dataIndex: "f_vat",
            width: 120,
            editor: {
              xtype: "textfield",
              listeners: {
                afterrender: function() {
                  this.fn = function() {
                    this.setValue(floatMinus(this.getValue().replace(/,/g, ""), 2));
                  };
                },
                Change: function(value) {
                  this.fn();
                }
              }
            },
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = "style='text-align: right;'";
              return floatRenderer(floatMinus(value, 2));
            }
          },
          {
            header: "ภาษีเงินได้บุคคลธรรมดา",
            sortable: false,
            align: "center",
            dataIndex: "f_tax_personal",
            width: 120,
            editor: {
              xtype: "textfield",
              listeners: {
                afterrender: function() {
                  this.fn = function() {
                    this.setValue(floatMinus(this.getValue().replace(/,/g, ""), 2));
                  };
                },
                Change: function(value) {
                  this.fn();
                }
              }
            },
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = "style='text-align: right;'";
              return floatRenderer(floatMinus(value, 2));
            }
          },
          {
            header: "ภาษีเงินได้นิติบุคคล",
            sortable: false,
            align: "center",
            dataIndex: "f_tax_corporate",
            width: 120,
            editor: {
              xtype: "textfield",
              listeners: {
                afterrender: function() {
                  this.fn = function() {
                    this.setValue(floatMinus(this.getValue().replace(/,/g, ""), 2));
                  };
                },
                Change: function(value) {
                  this.fn();
                }
              }
            },
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = "style='text-align: right;'";
              return floatRenderer(floatMinus(value, 2));
            }
          },
          {
            header: "ค่าประกันสังคม",
            sortable: false,
            align: "center",
            dataIndex: "f_social_security",
            width: 110,
            editor: {
              xtype: "textfield",
              listeners: {
                afterrender: function() {
                  this.fn = function() {
                    this.setValue(floatMinus(this.getValue().replace(/,/g, ""), 2));
                  };
                },
                Change: function(value) {
                  this.fn();
                }
              }
            },
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = "style='text-align: right;'";
              return floatRenderer(floatMinus(value, 2));
            }
          },
          {
            header: "ค่าปรับ",
            sortable: false,
            align: "center",
            dataIndex: "f_fine",
            width: 110,
            editor: {
              xtype: "textfield",
              listeners: {
                afterrender: function() {
                  this.fn = function() {
                    this.setValue(floatMinus(this.getValue().replace(/,/g, ""), 2));
                  };
                },
                Change: function(value) {
                  this.fn();
                }
              }
            },
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = "style='text-align: right;'";
              return floatRenderer(floatMinus(value, 2));
            }
          },
          {
            header: "จำนวนเงินที่จ่าย",
            sortable: false,
            align: "center",
            dataIndex: "f_total",
            width: 110,
            editor: {
              xtype: "textfield",
              listeners: {
                afterrender: function() {
                  this.fn = function() {
                    this.setValue(floatMinus(this.getValue().replace(/,/g, ""), 2));
                  };
                },
                Change: function(value) {
                  this.fn();
                }
              }
            },
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = "style='text-align: right;'";
              return floatRenderer(floatMinus(value, 2));
            }
          },
          {
            header: "เลขที่เช็ค",
            sortable: false,
            align: "center",
            dataIndex: "c_cheque_numbers",
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              return value;
            }
          },
          { header: "เลขที่เอกสารตั้งหนี้", sortable: false, align: "center", dataIndex: "c_request" },
          { header: "ชื่อผู้รับเงิน", sortable: false, width: 300, dataIndex: "c_creditor" },
          { header: "หมวดรายจ่าย", sortable: false, align: "center", width: 150, dataIndex: "c_expense_group_main" },
          { header: "รายการ", sortable: false, width: 300, dataIndex: "c_acc_item" }
          ,{
            header: "<font color=#005aff>** </font>เลขที่เอกสารตั้งหนี้จากใบเบิก",
            sortable: false,
            align: "center",
            dataIndex: "imp_request_ephis_dtl_id",
            width: 400,
            editor: new Ext.form.ComboBox({
              id: "editor_imp_request_ephis_dtl",
              mode: "local",
              store: Ext.imp_request_ephis_dtl_gx,
              loadMask: true,
              valueField: "id",
              displayField: "c_name",
              triggerAction: "all",
              forceSelection: true,
              selectOnFocus: true,
              typeAhead: false,
              emptyText: "กรุณาเลือก...",
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
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              if (value != "" && value != undefined) {
                metaData.attr = "style='text-align:left;'";
                return getStoreItems(Ext.imp_request_ephis_dtl_gx, value, "c_name");
              } else {
                metaData.attr = "style='color:red;'";
                return "-";
              }
            }
          }
          ,{ width: 20, dataIndex: "" }
        ],
        bbar: [
          {
            text: "&nbsp;" + Ext.GLOBAL_BU_SAVE_TH + "รายละเอียดฯ&nbsp;",
            id: "saveDtl",
            iconCls: "icon-save",
            handler: function() {
              saveDtl("SAVE_DTL");
            }
          },
          "->",
          {
            xtype: "label",
            id: "statusbar",
            html: "<div style='padding: 3px 6px 2px;'><img src='../images/icons/accept.png'><span style='position: relative; top: -4px; left: 5px;'>Ready</span></div>"
          }
        ]
      })
    ]
  });
}; // formPanelDtl
Ext.extend(formPanelDtl, Ext.Panel, {});
