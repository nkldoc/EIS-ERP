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
  let mini_msg = "";
  let jsonArr = [];
  let sto = Ext.getCmp("gridEditor").store.data.items;
  sto.forEach(function(v) {

    let d_doc = v.data.d_doc ? v.data.d_doc.split("-") : "";
    d_doc     = v.data.d_doc ? Ext.util.Format.date(parseInt(d_doc[2]) - 543 + "-" + d_doc[1] + "-" + d_doc[0], "Y-m-d") : "";
 
    let d_dks = v.data.d_dkdate ? v.data.d_dkdate.split("-") : "";
    d_dks     = v.data.d_dkdate ? Ext.util.Format.date(parseInt(d_dks[2]) + "-" + d_dks[1] + "-" + d_dks[0], "Y-m-d") : "";
 
    let d_paid = v.data.d_paydate ? v.data.d_paydate.split("-") : "";
    d_paid     = v.data.d_paydate ? Ext.util.Format.date(parseInt(d_paid[2]) + "-" + d_paid[1] + "-" + d_paid[0], "Y-m-d") : "";

    let d_waive = v.data.d_canceldate ? v.data.d_canceldate.split("-") : "";
    d_waive     = v.data.d_canceldate ? Ext.util.Format.date(parseInt(d_waive[2]) + "-" + d_waive[1] + "-" + d_waive[0], "Y-m-d") : "";
    
  //  console.log(v.data.c_request,"<<== JSON SAVE = วันที่ d_pay format Exp 03-03-2563 : ", d_paid," D CANCEL= ",d_waive);
    var c_spaces = "&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&nbsp;";
    if (Ext.I_MENU_JVCR=="2")
    { //Validate เฉพาะเมนู บันทึกบัญชีตั้งหนี้
      mini_msg = "";
      if (v.data.c_request_desc==null)
      { 
        mini_msg += "กรุณาบันทึก เลขที่ตั้งหนี้<br>"; 
      }
       
      if (v.data.c_budget_year==null)
      { 
        mini_msg += (mini_msg=="") ? "กรุณาเลือก ปีงบประมาณ<br>": c_spaces+"ปีงบประมาณ<br>";  
      }

      if (v.data.dc_expense_group_vsn_id==null)
      { 
        mini_msg += (mini_msg=="") ? "กรุณาเลือก หมวดรายจ่าย<br>" : c_spaces+"หมวดรายจ่าย<br>"; 
      } 

      if (v.data.dc_expense_acc_vsn_id==null)
      { 
        mini_msg += (mini_msg=="") ?"กรุณาเลือก รายจ่ายย่อย<br>" : c_spaces+"รายจ่ายย่อย<br>";  
      } 

      if (v.data.gl_dc_config_id==null)
      { 
        mini_msg += (mini_msg=="") ?"กรุณาเลือก ผังบัญชีเจ้าหนี้(CR)<br>" : c_spaces+"ผังบัญชีเจ้าหนี้(CR)<br>";  
      } 

      if ((v.data.f_inv==null) || (v.data.f_inv=="") || (v.data.f_inv=="0.00"))
      { 
        mini_msg += (mini_msg=="") ? "กรุณาบันทึก จำนวนขอเบิกทั้งสิ้น<br>" : c_spaces+"จำนวนขอเบิกทั้งสิ้น<br>"; 
      }  

      msg += (mini_msg!="") ? "แถวที่ "+v.data.no+"."+mini_msg : "";

    }

    //console.log("MENU="+Ext.I_MENU_JVCR+" c budget="+v.data.c_budget_year+' msg errr='+msg);

    jsonArr.push({
      imp_request_ephis_dtl_id: v.data.id,
      dc_expense_group_vsn_id: v.data.dc_expense_group_vsn_id,
      dc_expense_acc_vsn_id: v.data.dc_expense_acc_vsn_id, 
      c_budget_year: v.data.c_budget_year,
      i_type_year: v.data.i_type_year,
      d_doc: d_doc,
      c_request: v.data.c_request,
      c_request_desc: v.data.c_request_desc,      
      c_rcvtime: v.data.c_rcvtime,
      c_approve: v.data.c_approve,
      d_dkdate:d_dks,   
      f_inv: v.data.f_inv.replace(/,/g, ""),
      f_vat: v.data.f_vat.replace(/,/g, ""),
      f_tax_personal: v.data.f_tax_personal.replace(/,/g, ""),
      f_tax_corporate: v.data.f_tax_corporate.replace(/,/g, ""),
      f_social_security: v.data.f_social_security.replace(/,/g, ""), 
      f_fine: v.data.f_fine.replace(/,/g, ""),
      c_creditor: v.data.c_creditor, 
      c_bglst: v.data.c_bglst,
      c_acc_item: v.data.c_acc_item,
      d_paydate:d_paid,
      d_canceldate:d_waive,
      c_budget_type_name: v.data.c_budget_type_name, 
      c_bgdktypename: v.data.c_bgdktypename, 
      i_cal_gl: v.data.i_cal_gl,
      gl_dc_config_id : v.data.gl_dc_config_id,
      i_send_jv: v.data.i_send_jv,
      dc_creditor_id:v.data.dc_creditor_id
    });
  });

  if (msg == "") 
  {
    Ext.getCmp("contenterCenter")
      .getEl()
      .mask("Please wait...", "x-mask-loading");
    Ext.Ajax.request({
      url: "api/mn_ImpRequestEphis.php",
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
          Ext.Msg.minWidth = 200;
          Ext.Msg.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย");
          Ext.store.load();
          Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
          Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer          
        }
      },
      failure: function(result, request) {
        Ext.MessageBox.alert("Failed", result.responseText); // connect error
      }
    });
  } else {
    Ext.Msg.minWidth =300;
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

    // // หมวดรายจ่าย
    // try {
    //   let index_id = Ext.dc_expense_group_vsn.findExact("c_name", "" + v.หมวดรายจ่าย + "");
    //   dc_expense_group_vsn_id = Ext.dc_expense_group_vsn.data.items[index_id].id;
    // } catch (err) {}
    // // รายจ่ายย่อย
    // try {
    //   let index_id = Ext.dc_expense_acc_vsn_full.findExact("c_name", "" + v.bglstnm + "");
    //   dc_expense_acc_vsn_id = Ext.dc_expense_acc_vsn_full.data.items[index_id].id;
    // } catch (err) {}

    let d_doc = v.rcvdate ? v.rcvdate.split("/") : ""; 
    d_doc     = v.rcvdate ? Ext.util.Format.date(d_doc[1] + "/" + d_doc[0] + "/" + (parseInt(d_doc[2]) + 543), "d-m-Y") : "";
   
    let d_dk  = v.dkdate ? v.dkdate.split("/") : ""; 
    d_dk      = v.dkdate ? Ext.util.Format.date(d_dk[1] + "/" + d_dk[0] + "/" + (parseInt(d_dk[2])), "d-m-Y") : "";

    let d_pay  = v.paydate ? v.paydate.split("/") : ""; 
    d_pay      = v.paydate ? Ext.util.Format.date(d_pay[1] + "/" + d_pay[0] + "/" + (parseInt(d_pay[2])), "d-m-Y") : "";

    let d_cancel  = v.canceldate ? v.canceldate.split("/") : ""; 
    d_cancel      = v.canceldate ? Ext.util.Format.date(d_cancel[1] + "/" + d_cancel[0] + "/" + (parseInt(d_cancel[2])), "d-m-Y") : "";
 
    //console.log(" JSON PUSH = วันที่ d_pay format Exp 03-03-2563 : ", d_pay," D CANCEL= ",d_cancel);

    json.push({
      no: ++ii,
      imp_request_ephis_hdr_id: Ext.HDR_ID,
      dc_expense_group_vsn_id: dc_expense_group_vsn_id,
      dc_expense_acc_vsn_id: dc_expense_acc_vsn_id,
      c_budget_year: c_budget_year,
      i_type_year: 1,
      d_doc: d_doc,
      c_request: v.rcvno,
      c_request_desc:'',
      c_rcvtime: v.rcvtime,
      c_approve: v.dkno,
      d_dkdate : d_dk,  
      f_inv: v.dkamt.replace(/,/g, ""),
      f_vat: v.vatamt.replace(/,/g, ""),
      f_tax_personal: v.taxntramt.replace(/,/g, ""),
      f_tax_corporate: v.taxjrtamt.replace(/,/g, ""),
      f_social_security: v.socamt.replace(/,/g, ""), 
      f_fine: v.fineamt.replace(/,/g, ""),
      c_creditor: v.paytonm, 
      c_bglst: v.bglst,
      c_acc_item: v.name,
      d_paydate: d_pay,
      d_canceldate: d_cancel,
      c_budget_type_name: v.bgtypenm,
      c_bgdktypename : v.bgdktypenm,  
      i_cal_gl: 2,
      gl_dc_config_id  : Ext.GL_CFG_DEFAULT_CREDITOR_PRODUCT,
      i_send_jv:1,
      dc_creditor_id:""
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
            return index % 2 == 0 ? "grid-odd padd-6" : "grid-even padd-6";
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
          })
         // ,{ header: "เลขที่ใบเบิก", sortable: false, align: "center", dataIndex: "c_request" } 
          ,{
            header: "เลขที่ใบเบิก",
            sortable: false,
            align: "center",
            dataIndex: "c_request",
            width: 120,
            editor: {
              xtype: "textfield",
              listeners: {
                afterrender: function() {
                  this.fn = function() { 
                  };
                },
                Change: function(value) {
                  this.fn();
                }
              }
            },
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = "style='text-align: left;'";
              return value;
            }
          }
          ,{
            header: "เลขที่ตั้งหนี้",
            sortable: false,
            align: "center",
            dataIndex: "c_request_desc",
            width: 120,
            editor: {
              xtype: "textfield",
              listeners: {
                afterrender: function() {
                  this.fn = function() { 
                  };
                },
                Change: function(value) {
                  this.fn();
                }
              }
            },
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = "style='text-align: left;'";
              return value;
            }
          },
          {
            header: "วันที่ใบเบิก/ตั้งหนี้",
            sortable: false,
            align: "center",
            dataIndex: "d_doc",
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              return value != "" ? shortThaiDate(value) : "";
            }
          },
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
            header: "วันที่ยกเลิกใบเบิก/ตั้งหนี้",
            sortable: false,
            align: "center",
            dataIndex: "d_canceldate",
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              return value != "" ? shortThaiDate(value) : "";
            }
          }
          ,{
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
          },{
            header: "<font color=#005aff>** </font>เลือกบันทึกบัญชี",
            sortable: false,
            align: "center",
            dataIndex: "i_send_jv",
            width: 130,
            editor: new Ext.form.ComboBox({
              mode: "local",
              store: Ext.store_send_jv,
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
                let name = getStoreItems(Ext.store_send_jv, value, "c_name");
                return name;
              } else {
                metaData.attr = "style='color:red;'";
                return "-";
              }
            }
          }   
          ,{
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
            header: "<font color=#005aff>** </font>ผังบัญชี (DR)",
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
          }
          ,{ header: "รายการ", sortable: false, width: 300, dataIndex: "c_acc_item" }
          ,{
            header: "<font color=#005aff>** </font>ผังบัญชีเจ้าหนี้ (CR)",
            sortable: false,
            align: "center",
            dataIndex: "gl_dc_config_id",
            width: 300,
            editor: new Ext.form.ComboBox({
              id: "editor_gl_dc_config",
              mode: "local",
              store: Ext.gl_dc_config_creditor,
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
                return getStoreItems(Ext.gl_dc_config_creditor, value, "c_name");
              } else {
                metaData.attr = "style='color:red;'";
                return "-";
              }
            }
          }
          ,{
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
            header: "จำนวนเงินภาษีมูลค่าเพิ่ม",
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
          },{
            header: "<font color=#005aff>** </font>Vendor",
            sortable: false,
            align: "center",
            dataIndex: "dc_creditor_id",
            width: 300,
            editor: new Ext.form.ComboBox({
              id: "dc_creditor_id",
              mode: "local",
              store: Ext.store_dc_creditor,
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
                    return getStoreItems(Ext.store_dc_creditor, value, "c_name");
 
              } else {
                metaData.attr = "style='color:red;'";
                return "-";
              }
            }
          }         
          ,{ header: "ชื่อผู้รับเงิน", sortable: false, width: 300, dataIndex: "c_creditor" },
          { header: "หมวดรายจ่าย", sortable: false, align: "center", width: 150, dataIndex: "c_bglst" },
          
          { width: 20, dataIndex: "" }
        ],
        bbar: 
        [
          {
            text: "&nbsp;" + Ext.GLOBAL_BU_SAVE_TH + "รายละเอียดฯ&nbsp;",
            id: "saveDtl",
            iconCls: "icon-save",
            handler: function() {
              saveDtl("SAVE_DTL");
            }
          }
          ,{ xtype: "tbseparator" }
          ,{
            text: "&nbsp;บันทึกเลขที่เอกสาร&nbsp;",
            id: "saveDtlGen",
            iconCls: "icon-save",
            handler: function () {
              saveDtl("GENCODE");
            },
          },
          { xtype: "tbseparator", hidden: (Ext.I_MENU_JVCR=="1") ?  true : false },
          {
            text: "&nbsp;&nbsp;บันทึกบัญชี&nbsp;&nbsp;",
            id: "saveDtlGenJV",
            iconCls: "icon-save",
            hidden: (Ext.I_MENU_JVCR=="1") ? true : false,
            handler: function () {
              Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
              $.ajax({
                url: "api/mn_ImpRequestEphis.php",
                type: "POST",
                data: {
                  mode: "GENCODEJV",
                  id: Ext.HDR_ID,
                },
                success: function (result) {
                  Ext.getCmp("contenterCenter").getEl().unmask();
                  let data = $.parseJSON(result);
                  if (data.success == true) {
                    Ext.store.load();
                    Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
                    Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
                  }
                  Ext.Msg.minWidth = 200;
                  Ext.Msg.alert("แจ้งเตือน", data.msg);
                },
              });
            },
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
