dataDtl = [];
arrS = [
  { success: false, pk: 1 },
  { success: false, pk: 2 },
  { success: false, pk: 3 }
];

// save dtl ADD && EDIT
const saveDtl = function() {
  let msg = "";
  let jsonArr = [];
  let sto = Ext.getCmp("girdDtl").store.data.items;
  sto.forEach(function(v) {
    if (v.data.d_date_service != "") {
      var d_service = v.data.d_date_service.substring(0, 2);
      var m_service = v.data.d_date_service.substring(3, 5);
      var y_service = v.data.d_date_service.substring(6, 10) - 543;
    }

    let d_charge = v.data.d_save_charge.substring(0, 2);
    let m_charge = v.data.d_save_charge.substring(3, 5);
    let y_charge = v.data.d_save_charge.substring(6, 10) - 543;

    let d_pay = v.data.d_save_pay.substring(0, 2);
    let m_pay = v.data.d_save_pay.substring(3, 5);
    let y_pay = v.data.d_save_pay.substring(6, 10) - 543;

    if (v.data.d_receipt != "") {
      var d_receipt = v.data.d_receipt.substring(0, 2);
      var m_receipt = v.data.d_receipt.substring(3, 5);
      var y_receipt = v.data.d_receipt.substring(6, 10) - 543;
    }

    jsonArr.push({
      dtl_id: v.data.id,
      dc_debtor_type_id: v.data.dc_debtor_type_id,
      dc_debtor_claim_id: v.data.dc_debtor_claim_id,
      dc_cost_debtor_id: v.data.dc_cost_debtor_id,
      c_hn: v.data.c_hn,
      c_an: v.data.c_an,
      c_patient: v.data.c_patient,
      d_date_service: v.data.d_date_service != "" ? Ext.util.Format.date(m_service + "-" + d_service + "-" + y_service, "Y-m-d") : "",
      i_date_admission: v.data.i_date_admission,
      f_charge: v.data.f_charge,
      c_no_charge: v.data.c_no_charge,
      d_save_charge: Ext.util.Format.date(m_charge + "-" + d_charge + "-" + y_charge, "Y-m-d"),
      f_pay: v.data.f_pay,
      c_no_pay: v.data.c_no_pay,
      d_save_pay: Ext.util.Format.date(m_pay + "-" + d_pay + "-" + y_pay, "Y-m-d"),
      c_receipt: v.data.c_receipt,
      d_receipt: v.data.d_receipt != "" ? Ext.util.Format.date(m_receipt + "-" + d_receipt + "-" + y_receipt, "Y-m-d") : ""
    });
  });

  if (msg == "") {
    Ext.getCmp("contenterCenter")
      .getEl()
      .mask("Please wait...", "x-mask-loading");
    Ext.Ajax.request({
      url: "api/mn_ImpDebtorPay.php",
      method: "POST",
      params: {
        mode: "imp_debtor_pay_dtl",
        hdr_id: Ext.HDR_ID,
        data: JSON.stringify(jsonArr)
      },
      success: function(result, request) {
        Ext.getCmp("contenterCenter")
          .getEl()
          .unmask();
        let json = Ext.util.JSON.decode(result.responseText); //decode json
        if (json.success == true) {
          EXT_GRID_DTL(); // refresh gird
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

const chkConfig = function() {
  let sr = arrS.find(({ success }) => success === false || success === undefined);
  if (sr === undefined) {
    impData();
  } else {
    if (sr.pk == 1) {
      // ประเภทลูกหนี้
      let jsonArr = [];
      $.each(dataDtl, async function(index, v) {
        await jsonArr.push(v.ประเภทลูกหนี้);
      });
      Ext.getCmp("contenterCenter")
        .getEl()
        .mask("Please wait...", "x-mask-loading");
      Ext.storeDebtorTypeChk.load({
        params: { data: JSON.stringify([...new Set(jsonArr)]) },
        callback: function(records, operation, success) {
          Ext.getCmp("contenterCenter")
            .getEl()
            .unmask();
          popConfig("dc_debtor_type");
        }
      });
    } else if (sr.pk == 2) {
      // สิทธิ์การรักษา
      let jsonArr = [];
      $.each(dataDtl, async function(index, v) {
        await jsonArr.push(v.สิทธิ์การรักษา);
      });
      Ext.getCmp("contenterCenter")
        .getEl()
        .mask("Please wait...", "x-mask-loading");
      Ext.storeDebtorClaimChk.load({
        params: { data: JSON.stringify([...new Set(jsonArr)]) },
        callback: function(records, operation, success) {
          Ext.getCmp("contenterCenter")
            .getEl()
            .unmask();
          popConfig("dc_debtor_claim");
        }
      });
    } else if (sr.pk == 3) {
      // สิทธิ์การรักษา
      let jsonArr = [];
      $.each(dataDtl, async function(index, v) {
        await jsonArr.push(v.หน่วยงาน);
      });
      Ext.getCmp("contenterCenter")
        .getEl()
        .mask("Please wait...", "x-mask-loading");
      Ext.storeCostDebtorChk.load({
        params: { data: JSON.stringify([...new Set(jsonArr)]) },
        callback: function(records, operation, success) {
          Ext.getCmp("contenterCenter")
            .getEl()
            .unmask();
          popConfig("dc_cost_debtor");
        }
      });
    } else {
      console.log("not found");
    }
  }
}; // chkConfig

// นำเข้าข้อมูล Excel พร้อมแปลง data
const impExcel = function() {
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
          emptyText: "เลือกไฟล์ Excel...	",
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
          id +
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
                // set def...
                dataDtl = jsonExcel.data[0];
                arrS = [
                  { success: false, pk: 1 },
                  { success: false, pk: 2 },
                  { success: false, pk: 3 }
                ];
                chkConfig();
                Ext.getCmp("win-pop-excel").destroy();
              }
            } catch (err) {}
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
}; // impExcel

// render ข้อมูล
const impData = function() {
  let json = [];
  let ii = 0;
  dataDtl.forEach(v => {
    let dc_debtor_type_id = "";
    let dc_debtor_claim_id = "";
    let dc_cost_debtor_id = "";
    // ประเภทลูกหนี้
    try {
      let index_id = Ext.dc_debtor_type.findExact("c_name", "" + v.ประเภทลูกหนี้ + "");
      dc_debtor_type_id = Ext.dc_debtor_type.data.items[index_id].id;
    } catch (err) {}
    // สิทธิ์การรักษา
    try {
      let index_id = Ext.dc_debtor_claim.findExact("c_name", "" + v.สิทธิ์การรักษา + "");
      dc_debtor_claim_id = Ext.dc_debtor_claim.data.items[index_id].id;
    } catch (err) {}
    // หน่วยงาน
    try {
      let index_id = Ext.dc_cost_debtor.findExact("c_name", "" + v.หน่วยงาน + "");
      dc_cost_debtor_id = Ext.dc_cost_debtor.data.items[index_id].id;
    } catch (err) {}

    json.push({
      no: ++ii,
      id: "",
      hdr_id: Ext.HDR_ID,
      dc_debtor_type_id: dc_debtor_type_id,
      dc_debtor_claim_id: dc_debtor_claim_id,
      dc_cost_debtor_id: dc_cost_debtor_id,
      c_hn: v.HN ? v.HN : "",
      c_an: v.AN ? v.AN : "",
      c_patient: v.ชื่อผู้ป่วย ? v.ชื่อผู้ป่วย : "",
      d_date_service: v.วันที่มารับบริการ ? Ext.util.Format.date(v.วันที่มารับบริการ, "d-m-") + (parseInt(Ext.util.Format.date(v.วันที่มารับบริการ, "Y")) + 543) : "",
      i_date_admission: v.วันที่รับเข้าหอ ? v.วันที่รับเข้าหอ : "",
      f_charge: v.จำนวนเงินเรียกเก็บ.replace(/,/g, "") ? v.จำนวนเงินเรียกเก็บ.replace(/,/g, "") : "",
      c_no_charge: v.เลขที่เรียกเก็บเงิน ? v.เลขที่เรียกเก็บเงิน : "",
      d_save_charge: v.วันที่บันทึกเรียกเก็บเงิน ? Ext.util.Format.date(v.วันที่บันทึกเรียกเก็บเงิน, "d-m-") + (parseInt(Ext.util.Format.date(v.วันที่บันทึกเรียกเก็บเงิน, "Y")) + 543) : "",
      c_no_pay: v.เลขที่ใบตัดหนี้ ? v.เลขที่ใบตัดหนี้ : "",
      d_save_pay: v.วันที่บันทึกตัดหนี้ ? Ext.util.Format.date(v.วันที่บันทึกตัดหนี้, "d-m-") + (parseInt(Ext.util.Format.date(v.วันที่บันทึกตัดหนี้, "Y")) + 543) : "",
      f_pay: v.จำนวนเงินรับชำระ.replace(/,/g, "") ? v.จำนวนเงินรับชำระ.replace(/,/g, "") : "",
      f_total: parseFloat(v.จำนวนเงินเรียกเก็บ.replace(/,/g, "")) - parseFloat(v.จำนวนเงินรับชำระ.replace(/,/g, "")),
      c_no_pay: v.เลขที่ใบตัดหนี้ ? v.เลขที่ใบตัดหนี้ : "",
      c_receipt: v.เลขที่ใบเสร็จ ? v.เลขที่ใบเสร็จ : "",
      d_receipt: v.วันที่ออกใบเสร็จ ? Ext.util.Format.date(v.วันที่ออกใบเสร็จ, "d-m-") + (parseInt(Ext.util.Format.date(v.วันที่ออกใบเสร็จ, "Y")) + 543) : ""
    });
  });
  Ext.storeDtl.loadData({ data: json });
}; // impData

// grid แสดงรายการ
const EXT_GRID_DTL = function() {
  $("#EXT_GRID_DTL").empty();
  cellClickDtl = function(grid, rowIndex, columnIndex, e) {
    if (columnIndex == grid.getColumnModel().getIndexById("delete")) {
      let index = grid.getSelectionModel().getSelectedCell();
      if (!index) {
        return false;
      }
      let rec = grid.store.getAt(index[0]);
      grid.store.remove(rec);
    }
  };

  new Ext.Panel({
    title: "ข้อมูลรายละเอียดตัดชำระ",
    autoScroll: true,
    listeners: {
      afterrender: function() {
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
      }
    },
    tbar: [
      {
        text: "นำเข้าไฟล์ Excel",
        id: "add_dtl",
        iconCls: "icon-add",
        handler: function(grid, rowIndex, colIndex) {
          impExcel();
        }
      }
    ],
    items: [
      new Ext.grid.EditorGridPanel({
        id: "girdDtl",
        border: false,
        stripeRows: true,
        loadMask: true,
        clicksToEdit: 1,
        store: Ext.storeDtl,
        height: 300,
        viewConfig: {
          emptyText: "ไม่มีข้อมูล..",
          deferEmptyText: false
        },
        columns: [
          new Ext.grid.RowNumberer({
            header: "ที่",
            width: 30,
            renderer: function(value, metaData, record, row, col, store, gridView) {
              metaData.attr = "style= 'cursor:pointer; text-align:center;';";
              return record.get("no");
            }
          }),
          {
            header: "ประเภทลูกหนี้",
            sortable: false,
            align: "center",
            dataIndex: "dc_debtor_type_id",
            width: 250,
            editor: new Ext.form.ComboBox({
              mode: "local",
              store: Ext.dc_debtor_type,
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
              let c_name = "<font color=red>ระบุรายการ</font>";
              let vv = "";
              if (value != "" && value != undefined) {
                let name = getStoreItems(Ext.dc_debtor_type, value, "c_name");
                c_name = name;
                vv = value;
              }
              return c_name;
            }
          },
          {
            header: "สิทธิ์การรักษา",
            sortable: false,
            align: "center",
            dataIndex: "dc_debtor_claim_id",
            width: 250,
            editor: new Ext.form.ComboBox({
              mode: "local",
              store: Ext.dc_debtor_claim,
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
              let c_name = "<font color=red>ระบุรายการ</font>";
              let vv = "";
              if (value != "" && value != undefined) {
                let name = getStoreItems(Ext.dc_debtor_claim, value, "c_name");
                c_name = name;
                vv = value;
              }
              return c_name;
            }
          },
          {
            header: "หน่วยงานลูกหนี้",
            sortable: false,
            align: "center",
            dataIndex: "dc_cost_debtor_id",
            width: 250,
            editor: new Ext.form.ComboBox({
              mode: "local",
              store: Ext.dc_cost_debtor,
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
              let c_name = "<font color=red>ระบุรายการ</font>";
              let vv = "";
              if (value != "" && value != undefined) {
                let name = getStoreItems(Ext.dc_cost_debtor, value, "c_name");
                c_name = name;
                vv = value;
              }
              return c_name;
            }
          },
          {
            header: "HN",
            sortable: false,
            align: "center",
            dataIndex: "c_hn",
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = "style='color:green;'";
              return value;
            }
          },
          { header: "AN", sortable: false, align: "center", dataIndex: "c_an" },
          {
            header: "ชื่อผู้ป่วย",
            sortable: false,
            align: "center",
            dataIndex: "c_patient",
            width: 200,
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = "style='text-align:left;'";
              return value;
            }
          },
          {
            header: "วันที่มารับบริการ",
            sortable: false,
            align: "center",
            dataIndex: "d_date_service",
            width: 130,
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              return value != "" ? shortThaiDate(value) : "";
            }
          },
          { header: "วันที่รับเข้าหอ", sortable: false, align: "center", dataIndex: "i_date_admission" },
          {
            header: "จำนวนเงินเรียกเก็บ",
            sortable: false,
            align: "center",
            dataIndex: "f_charge",
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = "style='text-align: right; color: blue;'";
              return floatRenderer(floatMinus(value, 2));
            }
          },
          { header: "เลขที่เรียกเก็บเงิน", sortable: false, align: "center", dataIndex: "c_no_charge" },
          {
            header: "วันที่บันทึกเรียกเก็บเงิน",
            sortable: false,
            align: "center",
            dataIndex: "d_save_charge",
            width: 130,
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              return value != "" ? shortThaiDate(value) : "";
            }
          },
          { header: "เลขที่ใบตัดหนี้", sortable: false, align: "center", dataIndex: "c_no_pay" },
          {
            header: "วันที่บันทึกตัดหนี้",
            sortable: false,
            align: "center",
            dataIndex: "d_save_pay",
            width: 130,
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              return value != "" ? shortThaiDate(value) : "";
            }
          },
          {
            header: "จำนวนเงินรับชำระ",
            sortable: false,
            align: "center",
            dataIndex: "f_pay",
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = "style='text-align: right;'";
              return floatRenderer(floatMinus(value, 2));
            }
          },
          {
            header: "ค้างชำระ",
            sortable: false,
            align: "center",
            dataIndex: "f_total",
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              if (value > 0) {
                metaData.attr = "style='text-align: right; color: red;'";
              } else {
                metaData.attr = "style='text-align: right;'";
              }

              return floatRenderer(floatMinus(value, 2));
            }
          },
          { header: "เลขที่ใบเสร็จ", sortable: false, align: "center", dataIndex: "c_receipt" },
          {
            header: "วันที่ออกใบเสร็จ",
            sortable: false,
            align: "center",
            dataIndex: "d_receipt",
            width: 130,
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              return value != "" ? shortThaiDate(value) : "";
            }
          },
          {
            header: "-",
            id: "delete",
            sortable: false,
            align: "center",
            dataIndex: "id",
            width: 30,
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = "style='text-align:center; cursor: pointer;'";
              return "<img src='../images/icons/bin.gif'>";
            }
          },
          { width: 20, dataIndex: "" }
        ]
      })
    ],
    buttonAlign: "left",
    buttons: [
      {
        text: "&nbsp;บันทึกรายละเอียดเรียกเก็บ&nbsp;",
        iconCls: "icon-save",
        handler: function() {
          saveDtl();
        }
      },
      {
        text: Ext.GLOBAL_BU_BACK_TH,
        handler: function() {
          Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
        }
      }
    ],
    renderTo: "EXT_GRID_DTL"
  });
  Ext.getCmp("girdDtl").on("cellclick", cellClickDtl, this);
}; // EXT_GRID_DTL
