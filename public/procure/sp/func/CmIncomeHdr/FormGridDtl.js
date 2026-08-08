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
      cm_income_dtl_id: v.data.id,
      i_type_year: v.data.i_type_year,
      c_budget_year: v.data.c_budget_year,
      dc_expense_budget_type_id: v.data.dc_expense_budget_type_id,
      dc_acc_id_dr: v.data.dc_acc_id_dr,
      dc_acc_id: v.data.dc_acc_id,
      d_statement: Ext.util.Format.gridDate(v.data.d_statement, "Y-m-d"),
      c_statement_detail: v.data.c_statement_detail,
    });
  });

  if (msg == "") {
    Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
    Ext.Ajax.request({
      url: "api/mn_ImportCmIncomeHdr.php",
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
          Ext.dc_map_bookbank_acc.setBaseParam("dc_bank_acc_hdr_id", Ext.getCmp('dc_bank_acc_company_id').getValue());
          Ext.dc_map_bookbank_acc.setBaseParam("dc_expense_budget_type_ids", "");
          Ext.dc_map_bookbank_acc.load();
          // Ext.dc_map_bookbank_acc.load();
          // Ext.dc_map_bookbank_acc.reload({
          //   callback: function () {
          //       var record = Ext.storeDtl.data.dc_acc_id_dr;
          //       record.set("dc_acc_id_dr", Ext.dc_map_bookbank_acc.data.c_name);
          //       record.commit();
          //   },
          // });
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
        url: "api/mn_ImportCmIncomeHdr.php",
        border: false,
        fileUpload: true,
        bodyStyle: { padding: "10px 20px" },
                html: "<table border='0' cellspacing='2' cellpadding='0' width='100%' style='padding: 4px; 0px;'>" +
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
                  "</table>"
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
    url: "api/mn_ImportCmIncomeHdr.php",
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
    url: "api/mn_ImportCmIncomeHdr.php",
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
            record.set("dc_expense_budget_type_id", value.dc_expense_budget_type_id);
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
    title: "รายละเอียดนำเข้าใบเสร็จ =>" + Ext.title_panel_rec,
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
            if (record.data.i_status == "2") {
              return "tr_green";
            } else if (record.data.i_status == "8" || record.data.i_status == "9" || record.data.i_status == "10") {
              return "tr_orange";
            } else if (record.data.dc_acc_id == null || record.data.dc_acc_id == "0") {
              return "tr_yellow";
            } else if (record.data.cm_income_dtl_id_duplicate > 0) {
              return "tr_red";
            } else if (record.data.c_yyyy_mm_receive != Ext.HDR_c_yyyy_mm) {
              return "tr_blue";
            } else {
              return "grid-odd padd-6";
              //: "grid-even padd-6";
              //    return (index % 2 == 0) ? "grid-odd padd-6" : "grid-even padd-6";
            }
          },
        },
        listeners: {
          afterrender: function () {},
          afteredit: function (e) {},
          beforeedit: function (editor) {
            // let row = editor.record.data;
            // console.log(Ext.dc_map_bookbank_acc.data.items.length);
            // console.log(Ext.dc_map_bookbank_acc.data.items);
            // if (Ext.dc_map_bookbank_acc.data.items.length == 1) {
            //   getStoreItems(Ext.dc_map_bookbank_acc, Ext.dc_map_bookbank_acc.data.items[0].id, "id");
            // }
            // getStoreItems(Ext.dc_map_bookbank_acc, dc_expense_budget_type_id, "id");
            // let dc_expense_budget_type_id = row.dc_expense_budget_type_id;
            // let id_2 = getStoreItems(Ext.dc_map_bookbank_acc, dc_expense_budget_type_id, "id");
            // editor_bg_expense_id.bindStore(Ext.bg_expense);
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
            html: "<div style='padding:10px 20px; text-align: left;'><ul><li style='color:#005aff;'>* : สามารถแก้ไขได้</li></ul><ul><li style='color:#06A425;'>แถวสีเขียว สถานะ : ลงบัญชีแล้ว</li></ul><ul><li style='color:#ED9A08;'>แถวสีส้ม สถานะ : ใบเสร็จที่ยกเลิก</li></ul><ul><li style='color:#26F0F9;'>แถวสีฟ้า สถานะ : เดือนปีที่รับเงิน ไม่ตรงกับ วันที่ในใบเสร็จ</li></ul><ul><li style='color:#B6AB05;'>แถวสีเหลือง สถานะ : ยังไม่ระบุผังบัญชี (EIS)</li></ul><ul><li style='color:#FD6E5B;'>แถวสีแดง สถานะ : เลขที่ใบเสร็จซ้ำ</li></ul></div>",
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
            header: "วันที่ในใบเสร็จ",
            sortable: false,
            align: "center",
            dataIndex: "d_receive_show",
            width: 100,
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              return value != "" ? shortThaiDate(value) : "";
            },
          },
          {
            header: "เลขที่ใบเสร็จ",
            sortable: false,
            align: "center",
            dataIndex: "c_receive_no",
            width: 100,
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = "style='cursor:pointer; text-align:left;';";
              return value;
            },
          },

          {
            header: "<font color=#005aff>* </font>เงื่อนไขงบประมาณ",
            sortable: false,
            align: "center",
            dataIndex: "i_type_year",
            width: 120,
            editor: new Ext.form.ComboBox({
              mode: "local",
              store: Ext.store_type_year,
              readOnly: Ext.butt == "add" || Ext.butt == "edit" ? false : true,
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
            header: "<font color=#005aff>* </font>แหล่งเงิน",
            sortable: false,
            align: "center",
            dataIndex: "dc_expense_budget_type_id",
            width: 250,
            editor: new Ext.form.ComboBox({
              mode: "local",
              store: Ext.dc_expense_budget_type,
              readOnly: Ext.butt == "add" || Ext.butt == "edit" ? false : true,
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
                select: function () {
                  var row = this.gridEditor.row;
                  var Value = this.getValue();
                  Ext.dc_map_bookbank_acc.setBaseParam("dc_expense_budget_type_ids", Value);
                  Ext.dc_map_bookbank_acc.reload({
                    callback: function () {
                      if (Ext.dc_map_bookbank_acc.data.items.length == 1) {
                        var record = Ext.storeDtl.getAt(row);
                        record.set("dc_acc_id_dr", Ext.dc_map_bookbank_acc.data.items[0].id);
                        record.commit();
                      }
                    },
                  });

                },
                beforequery: function (q) {
                  if (q.query) {
                    var length = q.query.length;
                    q.query = new RegExp(Ext.escapeRe(q.query));
                    q.query.length = length;
                  }
                },
                blur: function () {
                  // var row = this.gridEditor.row;
                  // var Value = this.getValue();
                  // Ext.dc_map_bookbank_acc.setBaseParam("dc_expense_budget_type_ids", Value);
                  // Ext.dc_map_bookbank_acc.reload({
                  //   callback: function () {
                  //     if (Ext.dc_map_bookbank_acc.data.items.length == 1) {
                  //       var record = Ext.storeDtl.getAt(row);
                  //       record.set("dc_acc_id_dr", Ext.dc_map_bookbank_acc.data.items[0].id);
                  //       record.commit();
                  //     }
                  //   },
                  // });
                },
              },
            }),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (value != "" && value != undefined) {
                let name = getStoreItems(Ext.dc_expense_budget_type, value, "c_name");
                return name;
              } else {
                metaData.attr = "style='color:red;'";
                return "-";
              }
            },
          },
          {
            header: "<font color=#005aff>* </font>ผังบัญชีฝั่งเดบิต",
            sortable: false,
            align: "center",
            dataIndex: "dc_acc_id_dr",
            hidden: Ext.I_REC_MENU_TYPE == Ext.DATA_REC_MENU_TYPE_TRANF || Ext.I_REC_MENU_TYPE == Ext.DATA_REC_MENU_TYPE_BORROW_TRANF ? false : true,
            width: 280,
            editor: new Ext.form.ComboBox({
              mode: "local",
              id: "dc_map_bookbank_acc_ids",
              store: Ext.dc_map_bookbank_acc,
              readOnly: Ext.butt == "add" || Ext.butt == "edit" ? false : true,
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
                focus: function(combo) {
                  var row = this.gridEditor.row;
                  var record = Ext.storeDtl.getAt(row);
                  Ext.dc_map_bookbank_acc.setBaseParam("dc_expense_budget_type_ids", record.data.dc_expense_budget_type_id);
                  Ext.dc_map_bookbank_acc.load();
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
                  Ext.dc_map_bookbank_acc.setBaseParam("dc_expense_budget_type_ids", "");
                  Ext.dc_map_bookbank_acc.load();
                },
              },
            }),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = "style='cursor:pointer; text-align:left;';";
              // Ext.dc_map_bookbank_acc.setBaseParam("dc_bank_acc_hdr_id", record.data.dc_bank_acc_company_hdr_id);
              // Ext.dc_map_bookbank_acc.load();
              if (value != "" && value != undefined) {
                let name = getStoreItems(Ext.dc_map_bookbank_acc, value, "c_name");
                return name;
              } else {
                metaData.attr = "style='color:red;'";
                return "-";
              }
              
            },
          },
          {
            header: "<font color=#005aff>* </font>ปีงบประมาณ",
            sortable: false,
            align: "center",
            dataIndex: "c_budget_year",
            width: 90,
            editor: new Ext.form.ComboBox({
              mode: "local",
              store: Ext.store_year,
              readOnly: Ext.butt == "add" || Ext.butt == "edit" ? false : true,
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
            header: "เลขที่เอกสารอ้างอิง",
            sortable: false,
            align: "center",
            dataIndex: "c_receive_ref",
            width: 100,
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = "style='cursor:pointer; text-align:left;';";
              return value;
            },
          },
          {
            header: "เจ้าหนี้/ลูกหนี้",
            sortable: false,
            align: "center",
            dataIndex: "c_creditor",
            width: 200,
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = "style='cursor:pointer; text-align:left;';";
              return value;
            },
          },
          {
            header: "รหัสบัญชี (MIS)",
            sortable: false,
            align: "center",
            dataIndex: "c_acc_code_mis",
            width: 100,
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              return value;
            },
          },
          {
            header: "ชื่อบัญชี (MIS)",
            sortable: false,
            align: "center",
            dataIndex: "c_acc_name_mis",
            width: 300,
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = "style='cursor:pointer; text-align:left;';";
              return value;
            },
          },
          {
            header: "<font color=#005aff>* </font>ผังบัญชี EIS",
            sortable: false,
            align: "center",
            dataIndex: "dc_acc_id",
            width: 300,
            editor: new Ext.form.ComboBox({
              id: "dc_acc_id",
              mode: "local",
              store: Ext.store_dc_acc_with_gl_map_acc_receive_hdr,
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
                return getStoreItems(Ext.store_dc_acc_with_gl_map_acc_receive_hdr, value, "c_name");
              } else {
                metaData.attr = "style='color:red;'";
                return "-กรุณาเลือกผังบัญชี EIS-";
              }
            },
          },
          {
            header: "เดบิต",
            sortable: false,
            align: "center",
            dataIndex: "f_dr",
            width: 100,
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
              metaData.attr = "style='cursor:pointer; text-align:right;';";
              return floatRenderer(floatMinus(value, 2));
            },
          },
          {
            header: "เครดิต",
            sortable: false,
            align: "center",
            dataIndex: "f_cr",
            width: 100,
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
              metaData.attr = "style='cursor:pointer; text-align:right;';";
              return floatRenderer(floatMinus(value, 2));
            },
          },
          {
            header: "รายการ (ใบเสร็จ)",
            sortable: false,
            align: "center",
            dataIndex: "c_receive_detail",
            width: 300,
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = "style='cursor:pointer; text-align:left;';";
              return value;
            },
          },
          {
            header: "<font color=#005aff>* </font>วันที่ Statement",
            sortable: true,
            align: "center",
            dataIndex: "d_statement",
            width: 100,
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              return value != "" ? shortThaiDate(value) : "";
            },
            editor: new Ext.form.DateField(),
          },
          {
            header: "<font color=#005aff>* </font>รายการ (Statement)",
            sortable: false,
            align: "center",
            dataIndex: "c_statement_detail",
            width: 200,
            editor: { xtype: "textfield" },
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = "style='cursor:pointer; text-align:left;';";
              return value;
            },
          },
          {
            header: "สถานะใบเสร็จ",
            sortable: false,
            align: "center",
            dataIndex: "c_status",
            width: 100,
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = "style='cursor:pointer; text-align:center;';";
              return value;
            },
          },
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
