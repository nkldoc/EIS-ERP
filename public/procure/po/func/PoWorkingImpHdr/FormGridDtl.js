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
    let d_audit_date = v.data.d_audit_date ? v.data.d_audit_date.split("-") : "";
    let d_doc_date = v.data.d_doc_date ? v.data.d_doc_date.split("-") : "";
    let d_inv_date = v.data.d_inv_date ? v.data.d_inv_date.split("-") : "";

    d_audit_date = v.data.d_audit_date ? Ext.util.Format.date(parseInt(d_audit_date[2]) - 543 + "-" + d_audit_date[1] + "-" + d_audit_date[0], "Y-m-d") : "";
    d_doc_date = v.data.d_doc_date ? Ext.util.Format.date(parseInt(d_doc_date[2]) - 543 + "-" + d_doc_date[1] + "-" + d_doc_date[0], "Y-m-d") : "";
    d_inv_date = v.data.d_inv_date ? Ext.util.Format.date(parseInt(d_inv_date[2]) - 543 + "-" + d_inv_date[1] + "-" + d_inv_date[0], "Y-m-d") : "";

    jsonArr.push({
      po_working_dtl_id: v.data.id,
      i_budget_year: v.data.i_budget_year,
      i_budget_year_overlap: v.data.i_budget_year_overlap,
      dc_cost_id: v.data.dc_cost_id,
      dc_expense_budget_type_id: v.data.dc_expense_budget_type_id,
      bg_expense_id: v.data.bg_expense_id,
      d_audit_date: d_audit_date,
      c_code: v.data.c_code,
      d_doc_date: d_doc_date,
      d_inv_date: d_inv_date,
      c_cnt_name: v.data.c_cnt_name,
      c_detail: v.data.c_detail,
      c_qty: v.data.c_qty,
      f_total: v.data.f_total.replace(/,/g, ""),
      po_emp_id: v.data.po_emp_id
    });
  });

  if (msg == "") {
    Ext.getCmp("contenterCenter")
      .getEl()
      .mask("Please wait...", "x-mask-loading");
    Ext.Ajax.request({
      url: "api/mn_PoWorkingImpHdr.php",
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
    let dc_cost_id = "";
    let dc_expense_budget_type_id = "";
    let bg_expense_id = "";
    let po_emp_id = "";
    let po_audit_id = "";
    // หน่วยงาน
    try {
      let index_id = Ext.dc_cost.findExact("c_name", "" + v.หน่วยงาน + "");
      dc_cost_id = Ext.dc_cost.data.items[index_id].id;
    } catch (err) {}
    // ประเภทงบ
    try {
      let index_id = Ext.dc_expense_budget_type.findExact("c_name", "" + v.ประเภทงบ + "");
      dc_expense_budget_type_id = Ext.dc_expense_budget_type.data.items[index_id].id;
    } catch (err) {}
    // หน่วยงาน
    try {
      let index_id = Ext.bg_expense.findExact("c_name_excel", "" + v.หมวดค่าใช้จ่าย + "");
      bg_expense_id = Ext.bg_expense.data.items[index_id].id;
    } catch (err) {}

    // ผู้ดำเนินการ
    try {
      let index_id = Ext.po_emp.findExact("c_name", "" + v.ผู้ดำเนินการ + "");
      po_emp_id = Ext.po_emp.data.items[index_id].id;
    } catch (err) {}

    let d_audit_date = v.วันที่ตรวจรับ ? v.วันที่ตรวจรับ.split("/") : "";
    let d_doc_date = v.วันที่จัดทำใบขอเบิก ? v.วันที่จัดทำใบขอเบิก.split("/") : "";
    let d_inv_date = v.วันที่ฝ่ายคลังรับใบขอเบิก ? v.วันที่ฝ่ายคลังรับใบขอเบิก.split("/") : "";

    d_audit_date = v.วันที่ตรวจรับ ? Ext.util.Format.date(d_audit_date[1] + "/" + d_audit_date[0] + "/" + (parseInt(d_audit_date[2]) + 543), "d-m-Y") : "";
    d_doc_date = v.วันที่จัดทำใบขอเบิก ? Ext.util.Format.date(d_doc_date[1] + "/" + d_doc_date[0] + "/" + (parseInt(d_doc_date[2]) + 543), "d-m-Y") : "";
    d_inv_date = v.วันที่ฝ่ายคลังรับใบขอเบิก ? Ext.util.Format.date(d_inv_date[1] + "/" + d_inv_date[0] + "/" + (parseInt(d_inv_date[2]) + 543), "d-m-Y") : "";

    json.push({
      no: ++ii,
      id: "",
      po_working_hdr_id: Ext.HDR_ID,
      dc_cost_id: dc_cost_id,
      dc_expense_budget_type_id: dc_expense_budget_type_id,
      bg_expense_id: bg_expense_id,
      d_audit_date: d_audit_date,
      c_code: v.เลขที่ใบขอเบิก ? v.เลขที่ใบขอเบิก : "",
      d_doc_date: d_doc_date,
      d_inv_date: d_inv_date,
      c_cnt_name: v.จ่ายให้ ? v.จ่ายให้ : "",
      c_qty: v.จำนวนรายการ ? v.จำนวนรายการ : "",
      c_code: v.เลขที่ใบขอเบิก ? v.เลขที่ใบขอเบิก : "",
      i_budget_year: v.ปีงบประมาณ ? parseInt(v.ปีงบประมาณ) - 543 : "",
      i_budget_year_overlap: v.ปีงบประมาณที่ใช้งบ ? parseInt(v.ปีงบประมาณที่ใช้งบ) - 543 : "",
      f_total: v.จำนวนเงิน.replace(/,/g, "") ? v.จำนวนเงิน.replace(/,/g, "") : "",
      po_emp_id: po_emp_id,
      po_audit_id: po_audit_id
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
          "<td align='right'>เลือก file Excel (.xlsx) : </td>" +
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
          } else if (parts[parts.length - 1] != "xlsx") {
            msg += "<span style='white-space: nowrap;'>กรุณาเลือก excel เป็นไฟล์ .xlsx</span><br>";
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
            return index % 2 == 0 ? "grid-odd padd-6" : "grid-even padd-6";
          }
        },
        listeners: {
          afteredit: function(e) {
            // let rec = e.record;
            //             if (e.field == "dc_expense_group_vsn_id") {
            //               rec.set("dc_expense_acc_vsn_id", "");
            //               statusbar(false);
            //               Ext.dc_expense_acc_vsn.load({
            //                 params: { dc_expense_group_vsn_id: 0 },
            //                 callback: function(records, operation, success) {
            //                   statusbar(true);
            //                 }
            //               });
          },
          beforeedit: function(e) {
            //             if (e.field == "dc_expense_acc_vsn_id") {
            //               let storeEditor = Ext.getCmp("editor_dc_expense_acc_vsn_id").getStore();
            //               statusbar(false);
            //               storeEditor.load({
            //                 params: { dc_expense_group_vsn_id: e.record.data.dc_expense_group_vsn_id },
            //                 callback: function(records, operation, success) {
            //                   statusbar(true);
            //                   let recordNumber = storeEditor.findExact("id", e.record.data.dc_expense_acc_vsn_id, 0);
            //                   if (recordNumber == -1) return -1;
            //                   let displayValue = storeEditor.getAt(recordNumber).data["c_name"];
            //                   Ext.getCmp("editor_dc_expense_acc_vsn_id").setRawValue(displayValue);
            //                   Ext.getCmp("editor_dc_expense_acc_vsn_id").setValue(e.record.data.dc_expense_acc_vsn_id);
            //                 }
            //               });
            //             }
          }
        },
        tbar: [
          {
            text: "นำเข้าไฟล์ CSV",
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
            header: "ปีงบประมาณ",
            sortable: false,
            align: "center",
            dataIndex: "i_budget_year",
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
            header: "ปีที่ใช้งบประมาณ",
            sortable: false,
            align: "center",
            dataIndex: "i_budget_year_overlap",
            width: 100,
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
            header: "หน่วยงาน",
            sortable: false,
            align: "center",
            dataIndex: "dc_cost_id",
            width: 250,
            editor: new Ext.form.ComboBox({
              mode: "local",
              store: Ext.dc_cost,
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
                metaData.attr = "style='text-align: left;'";
                return getStoreItems(Ext.dc_cost, value, "c_code") + " : " + getStoreItems(Ext.dc_cost, value, "c_name");
              } else {
                metaData.attr = "style='color:red; text-align: center;'";
                return "-";
              }
            }
          },
          {
            header: "ประเภทงบ",
            sortable: false,
            align: "center",
            dataIndex: "dc_expense_budget_type_id",
            width: 250,
            editor: new Ext.form.ComboBox({
              mode: "local",
              store: Ext.dc_expense_budget_type,
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
                metaData.attr = "style='text-align: left;'";
                return getStoreItems(Ext.dc_expense_budget_type, value, "c_name");
              } else {
                metaData.attr = "style='color:red; text-align: center;'";
                return "-";
              }
            }
          },
          {
            header: "รายการย่อย",
            sortable: false,
            align: "center",
            dataIndex: "bg_expense_id",
            width: 250,
            editor: new Ext.form.ComboBox({
              mode: "local",
              store: Ext.bg_expense,
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
                metaData.attr = "style='text-align: left;'";
                return getStoreItems(Ext.bg_expense, value, "c_name");
              } else {
                metaData.attr = "style='color:red; text-align: center;'";
                return "-";
              }
            }
          },
          {
            header: "วันที่ตรวจรับ",
            sortable: false,
            align: "center",
            dataIndex: "d_audit_date",
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              return value != "" ? shortThaiDate(value) : "";
            }
          },
          {
            header: "เลขที่ใบขอเบิก",
            sortable: false,
            align: "center",
            dataIndex: "c_code",
            editor: { xtype: "textfield" },
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              return value;
            }
          },
          {
            header: "วันที่จัดทำใบขอเบิก",
            sortable: false,
            align: "center",
            dataIndex: "d_doc_date",
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              return value != "" ? shortThaiDate(value) : "";
            }
          },
          {
            header: "วันที่ฝ่ายคลังรับใบขอเบิก",
            sortable: false,
            align: "center",
            dataIndex: "d_inv_date",
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              return value != "" ? shortThaiDate(value) : "";
            }
          },
          {
            header: "จ่ายให้",
            sortable: false,
            align: "center",
            width: 300,
            dataIndex: "c_cnt_name",
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = "style='text-align: left;'";
              return value;
            }
          },
          {
            header: "จำนวนรายการ",
            sortable: false,
            align: "center",
            dataIndex: "c_qty",
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              return value;
            }
          },
          {
            header: "จำนวนเงิน",
            sortable: false,
            align: "center",
            dataIndex: "f_total",
            width: 110,
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = "style='text-align: right;'";
              return floatRenderer(floatMinus(value, 2));
            }
          },
          {
            header: "ผู้ดำเนินการ",
            sortable: false,
            align: "center",
            dataIndex: "po_emp_id",
            width: 150,
            editor: new Ext.form.ComboBox({
              mode: "local",
              store: Ext.po_emp,
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
                metaData.attr = "style='text-align: left;'";
                return getStoreItems(Ext.po_emp, value, "c_name");
              } else {
                metaData.attr = "style='color:red; text-align: center;'";
                return "-";
              }
            }
          },
          { width: 20, dataIndex: "" }
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
