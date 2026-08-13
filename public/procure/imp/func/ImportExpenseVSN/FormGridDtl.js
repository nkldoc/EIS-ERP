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
    jsonArr.push({
      imp_expense_vsn_dtl_id: v.data.id,
      i_type_year: v.data.i_type_year,
      i_cal_gl: v.data.i_cal_gl,
      c_budget_year: v.data.c_budget_year,
      c_booking: v.data.c_booking,
      dc_expense_group_vsn_id: v.data.dc_expense_group_vsn_id,
      dc_expense_acc_vsn_id: v.data.dc_expense_acc_vsn_id,
      f_inv: v.data.f_inv.replace(/,/g, ""),
      f_tax_personal: v.data.f_tax_personal.replace(/,/g, ""),
      f_social_security: v.data.f_social_security.replace(/,/g, ""),
      f_prov_fund: v.data.f_prov_fund.replace(/,/g, ""),
      f_fine: v.data.f_fine.replace(/,/g, ""),
      f_total: v.data.f_total.replace(/,/g, ""),
      i_system_show : v.data.i_system_show,
      imp_request_vsn_dtl_id: v.data.imp_request_vsn_dtl_id,
      imp_request_ephis_dtl_id: v.data.imp_request_ephis_dtl_id
    });
  });

  if (msg == "") {
    Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
    Ext.Ajax.request({
      url: "api/mn_ImportExpenseVSN.php",
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
          if (mode == "GENCODE") {
            Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
            Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
            Ext.Msg.alert("แจ้งเตือน", json.msg);
          }
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
          renderTo: "Ext_dtl_import",
        });
      },
    },
    items: [
      {
        xtype: "form",
        id: "form-excel",
        url: "api/mn_ImportExpenseVSN.php",
        border: false,
        fileUpload: true,
        bodyStyle: { padding: "10px 20px" },
        html:
          "	<table border='0' cellspacing='2' cellpadding='0' width='100%' style='padding: 4px; 0px;'>" +
          "<input type='hidden' name='mode' value='IMPORT_EXCEL'>" +
          "<input type='hidden' name='id' value='" +
          Ext.HDR_ID +
          "'>" +
          "<colgroup width='50%'></colgroup>" +
          "<colgroup width='50%'></colgroup>" +
          "<tr>" +
          "<td align='right'>เลือก file(*.csv (Comma delimited)) : </td>" +
          "<td><div id='Ext_dtl_import'></div></td>" +
          "</tr>" +
          "</table>",
      },
    ],
    buttonAlign: "left",
    buttons: [
      {
        text: Ext.GLOBAL_BU_SAVE_TH,
        iconCls: "icon-save",
        handler: function () {
          var form = Ext.getCmp("form-excel").getForm();
          var filename = Ext.getCmp("dtl_import").getValue();
          var parts = filename.split(".");
          var msg = "";

          if (filename == "") {
            msg += "<span style='white-space: nowrap;'>กรุณาเลือกไฟล์ที่ต้องการ</span><br>";
          } else if (parts[parts.length - 1] != "csv") {
            msg += "<span style='white-space: nowrap;'>กรุณาเลือก excel เป็นไฟล์ .csv</span><br>";
          }

          if (msg == "") {
            Ext.getCmp("win-pop-excel").getEl().mask("Please wait...", "x-mask-loading");
            form.submit({
              success: function (result, request) {
                Ext.getCmp("win-pop-excel").getEl().unmask();
                let obj = request.result;

                if (obj.success == true) {
                  Ext.store.load();
                  Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
                  Ext.storeDtl.load({
                    params: { hdr_id: Ext.HDR_ID },
                    callback: function (records, operation, success) {
                      Ext.getCmp("contenterCenter").getEl().unmask();
                    },
                  });
                  Ext.getCmp("win-pop-excel").destroy();
                }
                if (obj.msg != "") {
                  var msg = "";

                  if (obj.msg.num_payment > 0) {
                    var tt = "ไม่มีเลขที่ฎีกา";
                    msg += "<p><span style='border-bottom: 3px double; font-size: 16px;'><b>" + tt + "</b></span><p>บรรทัดที่(" + obj.msg.rec_payment + ")</p></p>";
                  }

                  new Ext.Window({
                    id: "win-ap-add-warning",
                    title: "แจ้งเตือน",
                    modal: true,
                    height: Ext.getBody().getViewSize().height * 0.7,
                    width: Ext.getBody().getViewSize().width * 0.7,
                    bodyStyle: { "background-color": "white", padding: "20px" },
                    closable: true,
                    autoScroll: true,
                    html: "<div style='font-size: 12px; word-wrap:break-word;'>" + msg + "</div>",
                    buttonAlign: "left",
                    buttons: [
                      {
                        text: "ปิด",
                        handler: function () {
                          Ext.getCmp("win-ap-add-warning").destroy();
                        },
                      },
                    ],
                  }).show();
                }
              },
              failure: function (form, action) {
                Ext.getCmp("win-pop-excel").getEl().unmask();
                switch (action.failureType) {
                  case Ext.form.Action.CLIENT_INVALID:
                    Ext.Msg.alert("Failure", "Form fields may not be submitted with invalid values");
                    break;
                  case Ext.form.Action.CONNECT_FAILURE:
                    Ext.Msg.alert("Failure", "พลข้อผิดพลาดในการเชื่อต่อเครือข่าย");
                    break;
                  case Ext.form.Action.SERVER_INVALID:
                    Ext.Msg.alert("Failure", "พบข้อผิดพลาดจากเซิฟเวอร์");
                }
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
          Ext.getCmp("win-pop-excel").destroy();
        },
      },
    ],
  }).show();
}; // popDtlExcel

const copyData = function () {
  Ext.MessageBox.show({
    title: "Please wait",
    msg: "กำลังคัดลอกข้อมูล...",
    progressText: "Initializing...",
    width: 300,
    progress: true,
    closable: false,
  });

  Ext.Ajax.request({
    url: "api/mn_ImportExpenseVSN.php",
    method: "POST",
    params: {
      mode: "COPY_DATA",
      id: Ext.HDR_ID,
    },
    success: function (result, request) {
      let json = Ext.util.JSON.decode(result.responseText); //decode json
      if (json.success == true) {
        // this hideous block creates the bogus progress
        var f = function (v) {
          return function () {
            if (v == 12) {
              Ext.MessageBox.hide();
            } else {
              var i = v / 11;
              Ext.MessageBox.updateProgress(i, Math.round(100 * i) + "% completed");
            }
          };
        };
        for (var i = 1; i < 13; i++) {
          setTimeout(f(i), i * 100);
        }
      } else {
        Ext.MessageBox.hide();
        Ext.Msg.alert("แจ้งเตือน", json.msg);
      }
    },
    failure: function (result, request) {
      Ext.MessageBox.alert("Failed", result.responseText); // connect error
    },
  });
};

const pasteData = function () {
  Ext.MessageBox.show({
    title: "Please wait",
    msg: "กำลังโหลดข้อมูล...",
    progressText: "Initializing...",
    width: 300,
    progress: true,
    closable: false,
  });

  Ext.Ajax.request({
    url: "api/mn_ImportExpenseVSN.php",
    method: "POST",
    params: {
      mode: "PASTE_DATA",
      id: Ext.HDR_ID,
    },
    success: function (result, request) {
      let json = Ext.util.JSON.decode(result.responseText); //decode json
      if (json.success == true) {
        $.each(json.data, function (key, value) {
          var index = Ext.storeDtl.findExact("c_approve", "" + value.c_approve + "");
          if (index >= 0) {
            var record = Ext.storeDtl.getAt(index);
            record.set("i_type_year", value.i_type_year);
            record.set("c_budget_year", value.c_budget_year);
            record.set("i_cal_gl", value.i_cal_gl);
            record.set("c_booking", value.c_booking);
            record.set("dc_expense_group_vsn_id", value.dc_expense_group_vsn_id);
            record.set("dc_expense_acc_vsn_id", value.dc_expense_acc_vsn_id);
            record.set("imp_request_vsn_dtl_id", value.imp_request_vsn_dtl_id);
            record.set("imp_request_ephis_dtl_id", value.imp_request_ephis_dtl_id);
            record.set("i_system_show", value.i_system_show);            
          }
        });
        // this hideous block creates the bogus progress
        var f = function (v) {
          return function () {
            if (v == 12) {
              Ext.MessageBox.hide();
            } else {
              var i = v / 11;
              Ext.MessageBox.updateProgress(i, Math.round(100 * i) + "% completed");
            }
          };
        };
        for (var i = 1; i < 13; i++) {
          setTimeout(f(i), i * 100);
        }
      } else {
        Ext.MessageBox.hide();
        Ext.Msg.alert("แจ้งเตือน", json.msg);
      }
    },
    failure: function (result, request) {
      Ext.MessageBox.alert("Failed", result.responseText); // connect error
    },
  });
};

// Class Extend
formPanelDtl = function (args) {
  formPanelDtl.superclass.constructor.call(this, {
    title: "รายละเอียดนำเข้าค่าใช้จ่าย (vision net)",
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
         
          },
        });

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
          
          
            if ( (record.data.i_system_show=='2') && (record.data.imp_request_vsn_dtl_id>0))
            { 
               return "tr_pink"; 
            }
            else if ( (record.data.i_system_show=='1') && (record.data.imp_request_ephis_dtl_id>0))
            { 
               return "tr_pink"; 
            }
            else 
            {
               return (index % 2 == 0) ? "grid-odd padd-6" : "grid-even padd-6";
            } 

          },
        },
        listeners: { 
          afterrender:function(){ 
 
            if (Ext.i_system_vsn_show==true)
            { /* VSN ให้ซ่อนคอลัมภ์ เลขที่ใบตั้งหนี้ e-PHIS */ 
              this.getColumnModel().setHidden(25,Ext.i_system_vsn_show); //ซ่อน e-PHIS
              this.getColumnModel().setHidden(24,Ext.i_system_ep_show);
            }
            else if (Ext.i_system_ep_show==true)
            { /* e-PHIS ให้ซ่อนคอลัมภ์ เลขที่ใบตั้งหนี้ Vision Net */ 
              this.getColumnModel().setHidden(24,Ext.i_system_ep_show); //ซ่อน Vision Net
              this.getColumnModel().setHidden(25,Ext.i_system_vsn_show);
            }
            else
            {  
              this.getColumnModel().setHidden(25,true); //ซ่อน e-PHIS
              this.getColumnModel().setHidden(24,true); //ซ่อน Vision Net
            }
          },
          afteredit: function (e) {
            let rec = e.record;
            if (e.field == "dc_expense_group_vsn_id") {
              rec.set("dc_expense_acc_vsn_id", "");
              statusbar(false);
              Ext.dc_expense_acc_vsn.load({
                params: { dc_expense_group_vsn_id: 0 },
                callback: function (records, operation, success) {
                  statusbar(true);
                },
              });
            }
          },
          beforeedit: function (e) {
            if (e.field == "dc_expense_acc_vsn_id") {
              let storeEditor = Ext.getCmp("editor_dc_expense_acc_vsn_id").getStore();
              statusbar(false);
              storeEditor.load({
                params: { dc_expense_group_vsn_id: e.record.data.dc_expense_group_vsn_id },
                callback: function (records, operation, success) {
                  statusbar(true);
                  let recordNumber = storeEditor.findExact("id", e.record.data.dc_expense_acc_vsn_id, 0);
                  if (recordNumber == -1) return -1;
                  let displayValue = storeEditor.getAt(recordNumber).data["c_name"];

                  Ext.getCmp("editor_dc_expense_acc_vsn_id").setRawValue(displayValue);
                  Ext.getCmp("editor_dc_expense_acc_vsn_id").setValue(e.record.data.dc_expense_acc_vsn_id);
                },
              });
            }
          },
        },
        tbar: [
          {
            text: "นำเข้าไฟล์ CSV",
            id: "add_dtl",
            iconCls: "import_excel",
            handler: function (grid, rowIndex, colIndex) {
              popDtlExcel();
            },
          },
          "-",
          {
            text: "โหลดข้อมูลใหม่",
            iconCls: "icon-refresh",
            handler: function (grid, rowIndex, colIndex) {
              Ext.storeDtl.load({ params: { hdr_id: Ext.HDR_ID } });
            },
          },
          "-",
          {
            text: "เมนู&nbsp;",
            id:"dtl_menu",
            iconCls: "icon-list",
            menu: {
              items: [
                {
                  text: "Copy",
                  iconCls: "page-copy-icon",
                  handler: copyData,
                },
                {
                  text: "Paste",
                  iconCls: "icon-paste",
                  handler: pasteData,
                },
              ],
            },
          },
          "->",
          {
            xtype: "form",
            html: "<div style='padding:10px 20px; text-align: left;'><ul><li style='color:#005aff;'>** : มีผลกับการออก GX</li><li style='color:#FF00FF;'>แถวที่มีสีชมพู มีการตั้งหนี้และบันทึกบัญชีจากใบเบิกแล้ว<br>กรุณาเลือก รายจ่ายย่อย ที่มีผังบัญชีเดียวกับคอลัมภ์ รหัสบัญชีตั้งหนี้ใบเบิก(CR) สำหรับการตัดหนี้ในครั้งนี้</li></ul></div>",
          },
        ],
        columns: [
          new Ext.grid.RowNumberer({
            header: "ที่",
            width: 30,
            renderer: function (value, metaData, record, row, col, store, gridView) {
              metaData.attr = "style='cursor:pointer; text-align:center;';";

              return record.get("no");

            },
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
                let name = getStoreItems(Ext.store_type_year, value, "c_name");
                return name;
              } else {
                metaData.attr = "style='color:red;'";
                return "-";
              }
            },
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
                return parseInt(value) + 543;
              } else {
                metaData.attr = "style='color:red;'";
                return "-";
              }
            },
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
                let name = getStoreItems(Ext.store_cal_gl, value, "c_name");
                return name;
              } else {
                metaData.attr = "style='color:red;'";
                return "-";
              }
            },
          },
          {
            header: "เลขที่ใบขอกันเงิน",
            sortable: false,
            align: "center",
            dataIndex: "c_booking",
            width: 100,
            editor: { xtype: "textfield" },
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              return value;
            },
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
                return getStoreItems(Ext.dc_expense_group_vsn, value, "c_name");
              } else {
                metaData.attr = "style='color:red;'";
                return "-";
              }
            },
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
                metaData.attr = "style='text-align:left;'";
                return getStoreItems(Ext.dc_expense_acc_vsn_full, value, "c_name");
              } else {
                metaData.attr = "style='color:red;'";
                return "-";
              }
            },
          },
          {
            header: "<font color=#005aff>** </font>ผังบัญชี",
            sortable: false,
            align: "center",
            dataIndex: "",
            width: 250,
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
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
            },
          },
          {
            header: "เลขที่ฎีกา",
            sortable: false,
            align: "center",
            dataIndex: "c_approve",
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              return value;
            },
          },
          {
            header: "วันที่ดำเนินการ<br>จัดทำทะเบียนจ่าย",
            sortable: false,
            align: "center",
            dataIndex: "d_doc",
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              return value != "" ? shortThaiDate(value) : "";
            },
          },
          {
            header: "<font color=#005aff>** </font>จำนวนขอเบิกทั้งสิ้น",
            sortable: false,
            align: "center",
            dataIndex: "f_inv",
            width: 110,
            editor: {
              xtype: "textfield",
              listeners: {
                afterrender: function () {
                  this.fn = function () {
                    this.setValue(floatMinus(this.getValue().replace(/,/g, ""), 2));
                  };
                },
                Change: function (value) {
                  this.fn();
                },
              },
            },
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = "style='text-align: right;'";
              return floatRenderer(floatMinus(value, 2));
            },
          },
          {
            header: "ภาษีเงินได้นิติบุคคล",
            sortable: false,
            align: "center",
            dataIndex: "f_tax_personal",
            width: 110,
            editor: {
              xtype: "textfield",
              listeners: {
                afterrender: function () {
                  this.fn = function () {
                    this.setValue(floatMinus(this.getValue().replace(/,/g, ""), 2));
                  };
                },
                Change: function (value) {
                  this.fn();
                },
              },
            },
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = "style='text-align: right;'";
              return floatRenderer(floatMinus(value, 2));
            },
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
                afterrender: function () {
                  this.fn = function () {
                    this.setValue(floatMinus(this.getValue().replace(/,/g, ""), 2));
                  };
                },
                Change: function (value) {
                  this.fn();
                },
              },
            },
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = "style='text-align: right;'";
              return floatRenderer(floatMinus(value, 2));
            },
          },
          {
            header: "กองทุนสำรองเลี้ยงชีพ",
            sortable: false,
            align: "center",
            dataIndex: "f_prov_fund",
            width: 110,
            editor: {
              xtype: "textfield",
              listeners: {
                afterrender: function () {
                  this.fn = function () {
                    this.setValue(floatMinus(this.getValue().replace(/,/g, ""), 2));
                  };
                },
                Change: function (value) {
                  this.fn();
                },
              },
            },
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = "style='text-align: right;'";
              return floatRenderer(floatMinus(value, 2));
            },
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
                afterrender: function () {
                  this.fn = function () {
                    this.setValue(floatMinus(this.getValue().replace(/,/g, ""), 2));
                  };
                },
                Change: function (value) {
                  this.fn();
                },
              },
            },
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = "style='text-align: right;'";
              return floatRenderer(floatMinus(value, 2));
            },
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
                afterrender: function () {
                  this.fn = function () {
                    this.setValue(floatMinus(this.getValue().replace(/,/g, ""), 2));
                  };
                },
                Change: function (value) {
                  this.fn();
                },
              },
            },
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = "style='text-align: right;'";
              return floatRenderer(floatMinus(value, 2));
            },
          },
          {
            header: "เลขที่เช็ค",
            sortable: false,
            align: "center",
            dataIndex: "c_cheque",
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              return value;
            },
          },
          {
            header: "วันที่ในเช็ค",
            sortable: false,
            align: "center",
            dataIndex: "d_cheque",
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              return value != "" ? shortThaiDate(value) : "";
            },
          },
          { header: "เลขที่จ่ายเงิน", sortable: false, align: "center", dataIndex: "c_request" },
          { header: "เลขที่ตั้งหนี้", sortable: false, align: "center", dataIndex: "c_request_desc" },
          { header: "เลขที่ใบเบิก", sortable: false, align: "center", dataIndex: "c_request_form" },
          { header: "ชื่อผู้รับเงิน", sortable: false, width: 300, dataIndex: "c_creditor" },
          { header: "หมวดรายจ่าย", sortable: false, align: "center", width: 150, dataIndex: "c_expense_group_main" },
          { header: "รายการ", sortable: false, width: 300, dataIndex: "c_acc_item" }
          ,{
            id : "panda_vsn",
            header: "<font color=#005aff>** </font>เลขที่เอกสารตั้งหนี้จากใบเบิก(VSN)",
            sortable: false,
            align: "center",
            dataIndex: "imp_request_vsn_dtl_id",
            width: 400, 
            editor: new Ext.form.ComboBox({
              id: "editor_imp_request_vsn_dtl",
              mode: "local",
              store: Ext.imp_request_vsn_dtl_gx,
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
                  return getStoreItems(Ext.imp_request_vsn_dtl_gx, value, "c_name"); 
                }
              
            }
          }
          ,{
            id : "panda_ephis",
            header: "<font color=#005aff>** </font>เลขที่เอกสารตั้งหนี้จากใบเบิก(e-PHIS)",
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
          // ,{ header: "เลขที่นำเข้าใบเบิก", sortable: false, width: 100, dataIndex: "c_import_rq_code" }
          // ,{ header: "เลขที่บันทึกบัญชีตั้งหนี้จากใบเบิก", sortable: false, width: 100, dataIndex: "c_import_rq_jv_code" }         
          // ,{ header: "รหัสบัญชีตั้งหนี้ใบเบิก(DR)", sortable: false, width: 200, dataIndex: "c_acc_dr_import" }
          // ,{ header: "<font color=#FF00FF>รหัสบัญชีตั้งหนี้ใบเบิก(CR)</font>", sortable: false, width: 200, dataIndex: "c_acc_cr_import" }
          // ,{ header: "รายการ(ใบเบิก)", sortable: false, width: 200, dataIndex: "c_acc_item_import" }

          ,{ width: 20, dataIndex: "" },
        ],
        bbar: [
          {
            text: "&nbsp;" + Ext.GLOBAL_BU_SAVE_TH + "รายละเอียดฯ&nbsp;",
            id: "saveDtl",
            iconCls: "icon-save",
            handler: function () {
              saveDtl("SAVE_DTL");
            },
          },
          { xtype: "tbseparator" },
          {
            text: "&nbsp;บันทึกเลขที่เอกสาร&nbsp;",
            id: "saveDtlGen",
            iconCls: "icon-save",
            handler: function () {
              saveDtl("GENCODE");
            },
          },
          { xtype: "tbseparator", hidden: Ext.ITYPE_JV ? true : false },
          {
            text: "&nbsp;บันทึกบัญชี&nbsp;",
            id: "saveDtlGenJV",
            iconCls: "icon-save",
            hidden: Ext.ITYPE_JV ? true : false,
            handler: function () {
              Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
              $.ajax({
                url: "api/mn_ImportExpenseVSN.php",
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
                  Ext.Msg.alert("แจ้งเตือน", data.msg);
                },
              });
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
