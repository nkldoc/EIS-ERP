// 3/10/63 Ext.storeDtl เปลี่ยนเป็น Ext.storeItems
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
  let msg       = "";
  let mini_msg  = "";
  let show_msg  = ""; 
  let jsonArr   = [];
  let sto       = Ext.getCmp("gridEditor").store.data.items;
  let c_spaces  = ",&nbsp;";

  sto.forEach(function (v) {
    i_upd = 1; //Can update
    if (v.data.i_status=='3')
      i_upd = 9; //NOT update
    if (v.data.i_group_show>0)
      i_upd = 9; //NOT update

    jsonArr.push({
      imp_request_vsn_item_id: v.data.id,
      imp_request_vsn_dtl_id:v.data.imp_request_vsn_dtl_id,
      c_request:v.data.c_request,
      c_request_desc:v.data.c_request_desc,
      i_type_year: v.data.i_type_year,
      c_budget_year: v.data.c_budget_year,
      i_cal_gl: v.data.i_cal_gl, 
      dc_acc_id: v.data.dc_acc_id, 
      f_dr: v.data.f_dr.replace(/,/g, ""), 
      f_cr: v.data.f_cr.replace(/,/g, ""),
      i_type_show:v.data.i_type_show,
      i_rank_dr:v.data.i_rank_dr,
      i_send_jv:v.data.i_send_jv,
      dc_creditor_id:v.data.dc_creditor_id,
      i_status: v.data.i_status,
      i_group_show: v.data.i_group_show,
      i_upd : i_upd
    });
    
      mini_msg = "";
      f_money_row = 0;

      if (Ext.I_MENU_JVCR=="2")
      { //Validate เฉพาะเมนู บันทึกบัญชีตั้งหนี้ 
        if (v.data.dc_acc_id==null)
        {

          mini_msg +="กรุณาบันทึกผังบัญชี<br>"; 
        }


        fd = ((v.data.f_dr==null) || (v.data.f_dr==""))   ? 0.00 : v.data.f_dr;
        fc = ((v.data.f_cr==null) || (v.data.f_dr==""))   ? 0.00 : v.data.f_cr; 
        f_money_row = parseFloat(fd)+parseFloat(fc);      
        if (f_money_row==0)
        { 
          mini_msg += (mini_msg=="") ? "กรุณาบันทึก จำนวนเงินเดบิต (DR) หรือ จำนวนเงินเครดิต (CR) ให้มากกว่า 0<br>" : c_spaces+"จำนวนเงินเดบิต (DR) หรือ จำนวนเงินเครดิต (CR) ให้มากกว่า 0<br>"; 
        }  
        
        if ((fd>0) && (fc>0))
        { 
          mini_msg += (mini_msg=="") ? "กรุณาบันทึก จำนวนเงินเดบิต (DR) หรือ จำนวนเงินเครดิต (CR) เพียงฝั่งเดียว<br>" : c_spaces+"จำนวนเงินเดบิต (DR) หรือ จำนวนเงินเครดิต (CR) เพียงฝั่งเดียว<br>"; 
        }        
        show_msg += (mini_msg!="") ? "แถวที่ "+v.data.no+"."+mini_msg : ""; 
      }
  });

  msg +=show_msg;

  if (msg == "") {
    Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
    Ext.Ajax.request({
      url: "api/mn_ImpRequestVSN.php",
      method: "POST",
      params: {
        mode: mode,
        id: Ext.HDR_ID,
        data: JSON.stringify(jsonArr),
      },
      success: function (result, request) {
        Ext.getCmp("contenterCenter").getEl().unmask();
        let json = Ext.util.JSON.decode(result.responseText); //decode json

        Ext.storeItems.load({ params: { hdr_id: Ext.HDR_ID } });
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
    Ext.Msg.minWidth = 300;
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
        url: "api/mn_ImpRequestVSN.php",
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
                  Ext.storeItems.load({
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
                    var tt = "ไม่มีเลขที่ใบเบิก";
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
                    Ext.Msg.alert("Failure", "พบข้อผิดพลาดในการเชื่อมต่อเครือข่าย");
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
    url: "api/mn_ImpRequestVSN.php",
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
    url: "api/mn_ImpRequestVSN.php",
    method: "POST",
    params: {
      mode: "PASTE_DATA",
      id: Ext.HDR_ID,
    },
    success: function (result, request) {
      let json = Ext.util.JSON.decode(result.responseText); //decode json
      if (json.success == true) {
        $.each(json.data, function (key, value) {
          //var index = Ext.storeItems.findExact("c_approve", "" + value.c_approve + "");
          var index = Ext.storeItems.findExact("c_request", "" + value.c_request + "");
          if (index >= 0) {
            var record = Ext.storeItems.getAt(index);
            record.set("i_type_year", value.i_type_year);
            record.set("c_budget_year", value.c_budget_year);
            record.set("i_cal_gl", value.i_cal_gl); 
            record.set("dc_acc_id", value.dc_acc_id);
            record.set("f_dr", value.f_dr);
            record.set("f_cr", value.f_cr);
            record.set("i_send_jv", value.i_send_jv);

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
    title: "รายละเอียดนำเข้าใบเบิก (Vision Net)",
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
        Ext.storeItems.load({
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
        store: Ext.storeItems,
        viewConfig: {
          emptyText: "ไม่มีข้อมูล..",
          deferEmptyText: false,
          getRowClass: function (record, index, rowParams) { 

            if (record.data.i_status=='3')
            { 
               return "tr_green"; 
            }
            else if (record.data.i_group_show>0)
            { 
               return "tr_violet"; 
            }
            else 
            {
               return (index % 2 == 0) ? "grid-odd padd-6" : "grid-even padd-6";
            } 

          },
                  } ,
        // ,listeners: { 
          // afteredit: function (e) {
          //   let rec = e.record;
          //   if (e.field == "dc_expense_group_vsn_id") {
          //     rec.set("dc_expense_acc_vsn_id", "");
          //     statusbar(false);
          //     Ext.dc_expense_acc_vsn.load({
          //       params: { dc_expense_group_vsn_id: 0 },
          //       callback: function (records, operation, success) {
          //         statusbar(true);
          //       },
          //     });
          //   }
          // },
          // beforeedit: function (e) {
          //   if (e.field == "dc_expense_acc_vsn_id") {
          //     let storeEditor = Ext.getCmp("editor_dc_expense_acc_vsn_id").getStore();
          //     statusbar(false);
          //     storeEditor.load({
          //       params: { dc_expense_group_vsn_id: e.record.data.dc_expense_group_vsn_id },
          //       callback: function (records, operation, success) {
          //         statusbar(true);
          //         let recordNumber = storeEditor.findExact("id", e.record.data.dc_expense_acc_vsn_id, 0);
          //         if (recordNumber == -1) return -1;
          //         let displayValue = storeEditor.getAt(recordNumber).data["c_name"];

          //         Ext.getCmp("editor_dc_expense_acc_vsn_id").setRawValue(displayValue);
          //         Ext.getCmp("editor_dc_expense_acc_vsn_id").setValue(e.record.data.dc_expense_acc_vsn_id);
          //       },
          //     });
          //   }
          // },
              // }
              listeners:{
                      beforeedit : function ( g ) {
                          if ( g.record.get ( 'i_status' ) === 3 ) {
                              if ( g.rowIdx === g.grid.row )
                                  return false ;
                          }
              }
              } ,
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
              Ext.storeItems.load({ params: { hdr_id: Ext.HDR_ID } });
            },
          },
          "-",
          {
            text: "เมนู&nbsp;",
            id: "dtl_menu",
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
            html: "<div style='padding:10px 20px; text-align: left;'><ul><li style='color:#005aff;'>** : มีผลกับการออก GX<br><font color=#33CC00>แถวสีเขียวคือใบเบิกที่บันทึกบัญชีแล้ว</font>&nbsp;&nbsp;&nbsp;<font color=#CC99FF>ส่วนแถวสีม่วงคือใบเบิกที่จัดกลุ่มแล้วรอบันทึกบัญชี</font><br>ซึ่งใบเบิกที่มีสีเขียวหรือม่วง จะไม่สามารถแก้ไขข้อมูลได้</li></ul></div>",
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
          })
          ,{
            header: "เลขที่ใบเบิก",
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
               
                  if (record.get("i_type_show")=="1") { 
                    if (record.get("i_rank_dr")=="1") 
                      return value; 
                    else 
                      return "";
                  } 
                  else if (record.get("i_type_show")=="2") { 
                    return "";
                  }
                  else { 
                    return "-";
                  }
              
               
            }
          }
          ,{
            header: "เลขที่ตั้งหนี้",
            sortable: false,
            align: "center",
            dataIndex: "c_request",
            width: 150,
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
              if (record.get("i_type_show")=="1") { 
                if (record.get("i_rank_dr")=="1") 
                  return value; 
                else 
                  return "";
              } 
              else if (record.get("i_type_show")=="2") { 
                return "";
              }
              else { 
                return "-";
              }
            }
          }
          // ,{
          //   header: "เลขที่ตั้งหนี้",
          //   sortable: false,
          //   align: "center",
          //   width: 150,
          //   dataIndex: "c_request_desc",
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     if (record.get("i_type_show")=="1") { 
          //       if (record.get("i_rank_dr")=="1")
          //         return value;
          //       else 
          //         return "";
          //     } 
          //     else if (record.get("i_type_show")=="2") { 
          //       return "";
          //     }
          //     else { 
          //       return "-";
          //     }
          //   },
          // }
          ,{
            header: "<font color=#005aff>** </font>เงื่อนไขงบประมาณ",
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
            header: "<font color=#005aff>** </font>ปีงบประมาณ",
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
          } 
          // ,{
          //   header: "<font color=#005aff>** </font>หมวดรายจ่าย",
          //   sortable: false,
          //   align: "center",
          //   dataIndex: "dc_expense_group_vsn_id",
          //   width: 250,
          //   editor: new Ext.form.ComboBox({
          //     mode: "local",
          //     store: Ext.dc_expense_group_vsn,
          //     valueField: "id",
          //     displayField: "c_name",
          //     triggerAction: "all",
          //     forceSelection: true,
          //     selectOnFocus: true,
          //     typeAhead: false,
          //     emptyText: "กรุณาเลือก...",
          //     listeners: {
          //       afterrender: function () {
          //         this.fn = function () {};
          //       },
          //       Change: function () {
          //         this.fn();
          //       },
          //       beforequery: function (q) {
          //         if (q.query) {
          //           var length = q.query.length;
          //           q.query = new RegExp(Ext.escapeRe(q.query));
          //           q.query.length = length;
          //         }
          //       },
          //       blur: function () {
          //         this.getStore().clearFilter();
          //       },
          //     },
          //   }),
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     if (value != "" && value != undefined) {
          //       return getStoreItems(Ext.dc_expense_group_vsn, value, "c_name");
          //     } else {
          //       metaData.attr = "style='color:red;'";
          //       return "-";
          //     }
          //   },
          // },
          // {
          //   header: "<font color=#005aff>** </font>รายจ่ายย่อย",
          //   sortable: false,
          //   align: "center",
          //   dataIndex: "dc_expense_acc_vsn_id",
          //   width: 300,
          //   editor: new Ext.form.ComboBox({
          //     id: "editor_dc_expense_acc_vsn_id",
          //     mode: "local",
          //     store: Ext.dc_expense_acc_vsn,
          //     loadMask: true,
          //     valueField: "id",
          //     displayField: "c_name",
          //     triggerAction: "all",
          //     forceSelection: true,
          //     selectOnFocus: true,
          //     typeAhead: false,
          //     emptyText: "กรุณาเลือก...",
          //     listeners: {
          //       afterrender: function () {
          //         this.fn = function () {};
          //       },
          //       Change: function () {
          //         this.fn();
          //       },
          //       beforequery: function (q) {
          //         if (q.query) {
          //           var length = q.query.length;
          //           q.query = new RegExp(Ext.escapeRe(q.query));
          //           q.query.length = length;
          //         }
          //       },
          //       blur: function () {
          //         this.getStore().clearFilter();
          //       },
          //     },
          //   }),
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     if (value != "" && value != undefined) {
          //       metaData.attr = "style='text-align:left;'";
          //       return getStoreItems(Ext.dc_expense_acc_vsn_full, value, "c_name");
          //     } else {
          //       metaData.attr = "style='color:red;'";
          //       return "-";
          //     }
          //   },
          // },
          // {
          //   header: "<font color=#005aff>** </font>ผังบัญชีรายจ่าย (DR)",
          //   sortable: false,
          //   align: "center",
          //   dataIndex: "",
          //   width: 250,
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     let row = record.data;
          //     if (row.dc_expense_acc_vsn_id > 0 && row.dc_expense_acc_vsn_id != null) {
          //       metaData.attr = "style='color: green; text-align: left;'";
          //       if (parseInt(row.i_type_year) == 1) {
          //         let acc_code = getStoreItems(Ext.dc_expense_acc_vsn_full, row.dc_expense_acc_vsn_id, "acc_code");
          //         let acc_name = getStoreItems(Ext.dc_expense_acc_vsn_full, row.dc_expense_acc_vsn_id, "acc_name");
          //         return acc_code + " : " + acc_name;
          //       } else {
          //         let acc_code = getStoreItems(Ext.dc_expense_acc_vsn_full, row.dc_expense_acc_vsn_id, "acc_code_overlap");
          //         let acc_name = getStoreItems(Ext.dc_expense_acc_vsn_full, row.dc_expense_acc_vsn_id, "acc_name_overlap");
          //         return acc_code + " : " + acc_name;
          //       }
          //     } else {
          //       metaData.attr = "style='color: red; text-align: center;'";
          //       return "- ยังไม่ระบุรายจ่ายย่อย -";
          //     }
          //   },
          // }
          ,{
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
                //let name = getStoreItems(Ext.store_send_jv, value, "c_name");
                //return name;
                if (record.get("i_type_show")=="1") { 
                  if (record.get("i_rank_dr")=="1") 
                  { 
                    let name = getStoreItems(Ext.store_send_jv, value, "c_name");
                    return name; 
                  }
                  else 
                    return "";
                } 
                else 
                  return "";
                             
              } else {
                metaData.attr = "style='color:red;'";
                return "";
              }
            }
          } 
          ,{
            header: "<font color=#005aff>** </font>ผังบัญชี",
            sortable: false,
            align: "center",
            dataIndex: "dc_acc_id",
            width: 300,
            editor: new Ext.form.ComboBox({
              id: "dc_acc_id",
              mode: "local",
              store: Ext.store_dc_acc_last,
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
                return getStoreItems(Ext.store_dc_acc_last, value, "c_name");
              } else {
                metaData.attr = "style='color:red;'";
                return "-";
              }
            }
          } 
          ,{
            header: "วันที่ใบเบิก",
            sortable: false,
            align: "center",
            dataIndex: "d_doc",
            renderer: function (value, metaData, record, rowIndex, colIndex, store) { 
              if (record.get("i_type_show")=="1") { 
                if (record.get("i_rank_dr")=="1")
                  return value != "" ? shortThaiDate(value) : "";
                else 
                  return "";
              } 
              else if (record.get("i_type_show")=="2") { 
                return "";
              }
              else { 
                return "-";
              }
            },
          },
          {
            header: "<font color=#005aff>** </font>จำนวนเงินเดบิต (DR)",
            sortable: false,
            align: "center",
            dataIndex: "f_dr",
            width: 150,
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
            header: "<font color=#005aff>** </font>จำนวนเงินเครดิต CR",
            sortable: false,
            align: "center",
            dataIndex: "f_cr",
            width: 150,
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
          } ,{
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

                if (record.get("i_type_show")=="1") { 
                  if (record.get("i_rank_dr")=="1") 
                  { 
                    metaData.attr = "style='text-align:left;'";
                    return getStoreItems(Ext.store_dc_creditor, value, "c_name");
                  }
                  else 
                    return "";
                } 
                else 
                  return "";
              } else {
                metaData.attr = "style='color:red;'";
                return "-";
              }
            }
          } 
           ,{ header: "ชื่อผู้รับเงิน", sortable: false, width: 200, dataIndex: "c_creditor" 
            ,renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                if (record.get("i_type_show")=="1") { 
                  if (record.get("i_rank_dr")=="1")
                    return value;
                  else
                    return "";
                } 
                else if (record.get("i_type_show")=="2") { 
                  return "";
                }
                else { 
                  return "-";
                }
            },
          },
           { header: "รายการ", sortable: false, width: 400, dataIndex: "c_comment"
            ,renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.get("i_type_show")=="1") { 
                if (record.get("i_rank_dr")=="1")
                  return value;
                else
                  return "";
              } 
              else if (record.get("i_type_show")=="2") { 
                return "";
              }
              else { 
                return "-";
              }
            },
          },
           { header: "ผังบัญชีที่นำเข้า (MIS/Vision Net)", sortable: false, width: 300, dataIndex: "c_acc_code_imp_full" },
           { width: 50, dataIndex: "" },
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
                url: "api/mn_ImpRequestVSN.php",
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
