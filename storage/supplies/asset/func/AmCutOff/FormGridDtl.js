Ext.i_import_excel = false; // เช็คค่าว่าเป็นการ นำเข้า Excel หรือไม่
dataDtl = [];
Ext.text_conut = "";
const statusbar = function (type) {
  if (type) {
    $("#statusbar").html("<div style='padding: 3px 6px 2px;'><img src='../images/icons/accept.png'><span style='position: relative; top: -4px; left: 5px;'>Ready</span></div>");
  } else {
    $("#statusbar").html(
      "<div style='padding: 3px 6px 2px;'><img style='animation-name: spin; animation-duration: 100ms;animation-iteration-count: infinite;animation-timing-function: linear;' src='../images/icons/hourglass.png'><span style='position: relative; top: -4px; left: 5px;'>Loading</span></div>"
    );
  }
};

win_delele = function (record) {
  new Ext.Window({
    id: "win-msg-delete",
    title: "Remove",
    modal: true,
    width: 250,
    height: 130,
    html: "ท่านต้องการที่จะลบข้อมูลการแก้ไขครุภัณฑ์ ? <br>&nbsp;&nbsp;&nbsp;" + record.get("c_code"),
    buttons: [
      {
        text: "Confirm",
        handler: function () {
          Ext.Ajax.request({
            url: "api/mn_AmCutOff.php",
            method: "POST",
            params: {
              mode: "DELETE",
              am_asset_hdr_id: record.get("am_asset_hdr_id"),
              am_cutoff_hdr_id: Ext.HDR_ID,
            },
            success: function (result, request) {
              var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
              if (jsonData.success) {
                //Ext.MessageBox.alert("Success", jsonData.msg);		// alert massage success
              } else {
                Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
              }
              Ext.getCmp("win-msg-delete").hide(); // hidden window-panel
              Ext.getCmp("win-msg-delete").destroy(); // clear memory :: garbage collection
              Ext.storeDtl.load({
                params: { hdr_id: Ext.HDR_ID },
              });
              // Ext.imp_assetall_dtl.load({
              //   params: { hdr_id: Ext.HDR_ID },
              // });
            },
            failure: function (result, request) {
              Ext.MessageBox.alert("Failed", result.responseText); // connect error
            },
          });
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

function checkID(ID_Check) {
  if (document.getElementById("chk_" + ID_Check).checked) {
    Ext.checkID.push(ID_Check);
  } else {
    var index = Ext.checkID.indexOf(ID_Check);
    if (index > -1) {
      Ext.checkID.splice(index, 1);
    }
  }
  Ext.text_conut = "";
  Ext.text_conut = Ext.checkID.length > 0 ? "จำนวนรายการที่เลือก " + Ext.checkID.length + " รายการ " : "";
  Ext.getCmp("text_conut").setText(Ext.text_conut);
}

Ext.Poplov_checkID = Ext.extend(Ext.Button, {
  config: {
    //    	   		mini 		: null,
    //    	   		widthText	: 0,
    //    	   		headerGrid	: [], 	//json
  },
  initComponent: function () {
    this.mini = this.Minipop();
    this.isCellClickGrid = false;
    this.isSetFilter = false;
    this.setReset();
  },

  setReset: function (t) {
    if (t) {
      Ext.getCmp(this.id + "_Name").setValue();
      Ext.getCmp(this.id).setValue();
    }
  },
  afterrender: function () {},
  uiSearch: function (id) {
    var store = this.store;
    var headerGrid = this.headerGrid;
    var id = id;

    var setDefaultFilter = [
      ["c_code", "รหัสครุภัณฑ์"],
      ["c_name", "ชื่อครุภัณฑ์"],
    ];
    var setFilter = [["c_name", "รายการ"]];

    var filterGrid = new Ext.data.SimpleStore({
      fields: ["value", "text"],
      data: this.isSetFilter ? setFilter : setDefaultFilter,
    });
    var store = this.store;

    var filterGrid = Ext.isEmpty(this.filterGrid) ? filterGrid : this.filterGrid; //comb&store filter
    var defFilter = this.defFilter; //default filter

    return [
      {
        id: "filter" + id,
        xtype: "combo",
        width: 130,
        mode: "local",
        store: filterGrid,
        valueField: "value",
        displayField: "text",
        allowBlank: false,
        editable: false,
        triggerAction: "all",
        typeAhead: false,
        value: Ext.isEmpty(defFilter) ? "c_code" : defFilter,
      },
      "-",
      {
        id: "value-box" + id,
        xtype: "textfield",
        width: 130,
        fieldLabel: "fieldLabel",
        emptyText: "คำที่ต้องการค้นหา",
        listeners: {
          specialkey: function (f, e) {
            if (e.getKey() == e.ENTER) {
              store.setBaseParam("mode", "SEARCH");
              store.setBaseParam("filter", Ext.getCmp("filter" + id).getValue());
              store.setBaseParam("value", Ext.getCmp("value-box" + id).getValue());
              Ext.getCmp("win-pop-lov-modal-" + id)
                .getStore()
                .load();
            }
          },
        },
      },
    ];
  },

  Minipop: function () {
    /******/
    var store = this.store;
    var headerGrid = this.headerGrid;
    var id = this.id;
    var nameID = this.id + "_Name";
    var widthText = isNaN(this.widthText) ? 198 : this.widthText;
    var uiSearch = this.uiSearch(id);

    /*****/
    function SearchGrid(store, id) {
      if (Ext.getCmp("value-box" + id).getValue() != "") {
        store.setBaseParam("mode", "SEARCH");
        store.setBaseParam("filter", Ext.getCmp("filter" + id).getValue());
        store.setBaseParam("value", Ext.getCmp("value-box" + id).getValue());
        Ext.getCmp("win-pop-lov-modal-" + id)
          .getStore()
          .load();
      } else {
        store.setBaseParam("mode", "");
        Ext.getCmp("win-pop-lov-modal-" + id)
          .getStore()
          .load();
      }
    }

    return {
      fieldLabel: this.fieldLabel,
      xtype: "radiogroup",
      id: "pop_" + this.id,
      // columns: [0, widthText, 40],
      hidden: this.hidden == true ? true : false,
      listeners: {
        afterrender: this.afterrender,
      },
      items: [
        // {
        //   xtype: "hidden",
        //   name: this.valueHidden,
        //   id: id,
        //   value: this.value,
        // },
        // {
        //   xtype: "textfield",
        //   name: "txt" + this.id,
        //   emptyText: this.text,
        //   id: nameID,
        //   readOnly: true,
        // },
        {
          xtype: "button",
          id: "Bu" + this.id,
          text: "เพิ่มข้อมูล",
          name: "Bu" + this.id,
          iconCls: "icon-add",
          handler: function () {
            Ext.checkID = [];
            /* //Load Store Begin SearchGrid */
            store.setBaseParam("mode", "");
            store.load();

            var win = new Ext.Window({
              id: "win-pop-lov" + id,
              title: "เลือกข้อมูล",
              modal: true,
              plain: true,
              layout: "fit",
              maximizable: true,
              constrainHeader: true,
              closable: true,
              listeners: {
                afterrender: function (obj, eOpts) {
                  this.fn = function (widht, height) {
                    //percentage
                    var width = Ext.getBody().getViewSize().width * widht;
                    var height = Ext.getBody().getViewSize().height * height;
                    this.setSize(width, height);
                  };
                  this.fn(0.8, 0.85);
                },
                maximize: function (window, opts) {
                  //when property minimizable
                  window.setWidth(Ext.getBody().getViewSize().width * 0.99);
                  window.expand("", false);
                  window.center();
                },
              },
              items: [
                {
                  xtype: "grid",
                  id: "win-pop-lov-modal-" + id,
                  border: false,
                  stripeRows: true,
                  loadMask: true,
                  store: store,
                  tbar: [
                    uiSearch,
                    " ",
                    "-",
                    {
                      text: "ค้นหา",
                      id: "magnifier_" + id,
                      iconCls: "icon-magnifier",
                      handler: function () {
                        SearchGrid(store, id); /*SearchEngin(store,id);*/
                      },
                    },
                    { xtype: "tbfill" },
                    {
                      xtype: "label",
                      id: "text_conut",
                      style: "color: green",
                    },
                  ],
                  columns: headerGrid,
                  listeners: {
                    afterrender: function (obj, eOpts) {
                      this.fn = function (widht, height) {
                        //percentage

                        var width = Ext.getBody().getViewSize().width * widht;
                        var height = Ext.getBody().getViewSize().height * height;
                        this.setSize(width, height);
                      };
                      this.fn(0.5, 0.4);
                    },
                  },
                  autoExpandColumn: "c_name",
                  bbar: [
                    new Ext.PagingToolbar({
                      pageSize: 20,
                      store: store,
                      displayInfo: true,
                      displayMsg: "Displaying topics {0} - {1} of {2}",
                    }),
                    { xtype: "tbfill" },
                    {
                      text: "ยันยืนข้อมูล",
                      // id: "",
                      iconCls: "icon-save",
                      handler: function (grid, rowIndex, colIndex) {
                        saveDtl("SAVE_DTL");
                      },
                    },
                  ],
                },
              ],
            });
            win.show();
            // Ext.getCmp("win-pop-lov-modal-" + id).on("cellclick", cellClick_lov, this);
          },
        },
      ],
    };
  }, //Mini
});

// save dtl ADD && EDIT
const saveDtl = function (mode) {
  let msg = "";
  // let jsonArr = [];
  // let sto = Ext.getCmp("gridEditor").store.data.items;

  if (msg == "") {
    Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
    Ext.Ajax.request({
      url: "api/mn_AmCutOff.php",
      method: "POST",
      params: {
        mode: mode,
        id: Ext.HDR_ID,
        // i_import_excel: Ext.i_import_excel,
        data: JSON.stringify(Ext.checkID),
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

          Ext.getCmp("win-pop-lovam_asset_hdr_idID").hide();
          Ext.getCmp("win-pop-lovam_asset_hdr_idID").destroy();
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
  if (columnIndex == grid.getColumnModel().getIndexById("delete") && record.data.i_type != 99) {
    win_delele(record);
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
            if (record.data.i_type == 99) {
              return "td-cost padd-2";
            }
            // } else if (record.data.i_type == 2) {
            //   return "td-total padd-2";
            // }
            // let line = record.data.i_status == 1 ? "" : "strikeout";
            // return index % 2 == 0 ? "grid-odd " + line : "grid-even " + line;
          },
        },
        listeners: {
          beforeedit: function (editor) {
            let row = editor.record.data;
            if (row.i_type == 99) {
              return false;
            }
          },
        },
        tbar: [
          new Ext.Poplov_checkID({
            text: "เลือกรายการครุภัณฑ์...",
            id: "am_asset_hdr_idID",
            iconCls: "page_magnify",
            valueHidden: "am_asset_hdr_id",
            store: Ext.am_asset_hdr,
            headerGrid: [
              { header: "ID System", sortable: true, hidden: true, dataIndex: "id" },
              { header: "ที่", align: "center", width: 40, sortable: true, dataIndex: "no" },
              {
                sortable: false,
                align: "center",
                dataIndex: "id",
                width: 60,
                renderer: function (value, metaData, record, row, col, store, gridView) {
                  var checked = Ext.checkID.includes(parseInt(value)) == true ? "checked" : "";
                  return "<input style='margin-top:3px; margin-bottom:2px;' type='checkbox' onchange='checkID(" + value + ")' id='chk_" + value + "' value='" + value + "'" + checked + "> ";
                },
              },
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
              {
                header: "วันที่ได้รับ",
                sortable: true,
                align: "center",
                dataIndex: "receive_date",
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                  return value != "" ? shortThaiDate(value) : "";
                },
              },
              {
                header: "อายุครุภัณฑ์(ปี)",
                sortable: true,
                align: "center",
                dataIndex: "i_period_year",
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
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                  metaData.attr = "style='text-align: right;'";
                  return floatRenderer(floatMinus(value.replace(/,/g, ""), 2));
                },
              },
              {
                header: "ค่าเสื่อมสะสม",
                sortable: false,
                align: "center",
                dataIndex: "f_depre",
                width: 110,
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                  metaData.attr = "style='text-align: right;'";
                  return floatRenderer(floatMinus(value.replace(/,/g, ""), 2));
                },
              },
              {
                header: "ราคาตามบัญชี",
                sortable: false,
                align: "center",
                dataIndex: "f_acc_cost",
                width: 110,
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                  metaData.attr = "style='text-align: right;'";
                  return floatRenderer(floatMinus(value.replace(/,/g, ""), 2));
                },
              },
              { width: 20, dataIndex: "" },
            ],
            widthText: 450,
            fieldLabel: "บัญชี",
            isCellClickGrid: true,
            cellClickGrid: function (grid, rowIndex, columnIndex, e) {
              var poplov_id = "am_asset_hdr_idID";
              var record = grid.getStore().getAt(rowIndex);
              var TextShow = record.data.c_code;
              Ext.getCmp(poplov_id).setValue(record.data.id);
              Ext.getCmp(poplov_id + "_Name").setValue(TextShow);

              Ext.getCmp("win-pop-lov" + poplov_id).hide();
              Ext.getCmp("win-pop-lov" + poplov_id).destroy();

              if (Ext.getCmp("am_asset_hdr_idID").getValue() > 0) {
                Ext.getCmp("container_sup").show();
                loadForm(Ext.getCmp("am_asset_hdr_idID").getValue());
              } else {
                Ext.getCmp("container_sup").hide();
              }
            },
          }).mini,
          // { xtype: "tbspacer", width: 4 },
          // {
          //   xtype: "button",
          //   text: "นำเข้าไฟล์ excel",
          //   id: "add_dtl",
          //   iconCls: "import_excel",
          //   handler: function (grid, rowIndex, colIndex) {
          //     popDtlExcel();
          //   },
          // },
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
            // editor: new Ext.form.TextField({
            //   style: "text-align: center",
            // }),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = "style='text-align: center;'";
              return value;
            },
          },
          {
            header: "ชื่อครุภัณฑ์",
            sortable: false,
            align: "center",
            dataIndex: "asset_name",
            width: 600,
            // editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              // if (record.data.i_type == 1 || record.data.i_type == 2) {
              //   return "";
              // } else if (value) {
              metaData.attr = "style='text-align: left;'";
              return value;
              // } else {
              //   metaData.attr = "style='text-align: left; color:red;'";
              //   return "-";
              // }
            },
          },
          {
            header: "วันที่รับ",
            sortable: false,
            align: "center",
            dataIndex: "receive_date",
            // editor: new Ext.form.DateField(),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              // if (record.data.i_type == 99) {
              //   metaData.attr = "style='text-align: right; font-weight: bold;'";
              //   return "รวมทั้งสิ้น";
              // } else {
              return value != "" && value != null ? shortThaiDate(value) : "";
              // }
            },
          },
          {
            header: "อายุครุภัณฑ์(ปี)",
            sortable: false,
            align: "center",
            dataIndex: "i_period_year",
            width: 80,
            // editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 99) {
                metaData.attr = "style='text-align: right; font-weight: bold;'";
                return "รวมทั้งสิ้น";
              } else {
                metaData.attr = "style='text-align: center;'";
                return value;
              }
              // } else {
              //   metaData.attr = "style='text-align: center; color:red;'";
              //   return "-";
              // }
            },
          },
          // {
          //   header: "จ.น. รับ  (DR)",
          //   sortable: false,
          //   align: "center",
          //   dataIndex: "quantity",
          //   width: 80,
          //   editor: new Ext.form.TextField({}),
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     if (record.data.i_type == 1 || record.data.i_type == 2) {
          //       return "";
          //     } else if (value) {
          //       metaData.attr = "style='text-align: center;'";
          //       return value;
          //     } else {
          //       metaData.attr = "style='text-align: center; color:red;'";
          //       return "-";
          //     }
          //   },
          // },
          // {
          //   header: "หน่วยนับ",
          //   sortable: false,
          //   align: "center",
          //   dataIndex: "dc_unit_type",
          //   width: 100,
          //   editor: new Ext.form.TextField({}),
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     if (record.data.i_type == 1 || record.data.i_type == 2) {
          //       return "";
          //     } else if (value) {
          //       metaData.attr = "style='text-align: center;'";
          //       return value;
          //     } else {
          //       metaData.attr = "style='text-align: center; color:red;'";
          //       return "-";
          //     }
          //   },
          // },
          {
            header: "มูลค่าเริ่มต้น",
            sortable: false,
            align: "center",
            dataIndex: "f_unit_cost",
            width: 110,
            // editor: new Ext.form.TextField({
            //   style: "text-align: right",
            //   listeners: {
            //     afterrender: function () {
            //       this.fn = function () {
            //         this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
            //       };
            //     },
            //     Change: function (value) {
            //       this.fn();
            //     },
            //   },
            // }),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 99) {
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
            header: "ค่าเสื่อมสะสม",
            sortable: false,
            align: "center",
            dataIndex: "f_depre",
            width: 110,
            // editor: new Ext.form.TextField({
            //   style: "text-align: right",
            //   listeners: {
            //     afterrender: function () {
            //       this.fn = function () {
            //         this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
            //       };
            //     },
            //     Change: function (value) {
            //       this.fn();
            //     },
            //   },
            // }),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 99) {
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
            header: "ราคาตามบัญชี",
            sortable: false,
            align: "center",
            dataIndex: "f_acc_cost",
            width: 110,
            // editor: new Ext.form.TextField({
            //   style: "text-align: right",
            //   listeners: {
            //     afterrender: function () {
            //       this.fn = function () {
            //         this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
            //       };
            //     },
            //     Change: function (value) {
            //       this.fn();
            //     },
            //   },
            // }),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_type == 99) {
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
          // {
          //   header: "มูลค่าคำนวณค่าเสื่อม",
          //   sortable: false,
          //   align: "center",
          //   dataIndex: "f_unit_cost",
          //   width: 110,
          //   // editor: new Ext.form.TextField({
          //   //   style: "text-align: right",
          //   //   listeners: {
          //   //     afterrender: function () {
          //   //       this.fn = function () {
          //   //         if (this.getValue() < 10000) {
          //   //           this.setValue(0.0);
          //   //         } else {
          //   //           this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
          //   //         }
          //   //       };
          //   //     },
          //   //     Change: function (value) {
          //   //       this.fn();
          //   //     },
          //   //   },
          //   // }),
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     if (record.data.i_type == 1 || record.data.i_type == 2) {
          //       metaData.attr = "style='text-align: right; font-weight: bold;'";
          //       return floatRenderer(floatMinus(String(record.data.f_unit_cost2).replace(/,/g, ""), 2));
          //     } else if (value) {
          //       metaData.attr = "style='text-align: right;'";
          //       if (String(value).replace(/,/g, "") < 10000) {
          //         return "0.00";
          //       } else {
          //         return floatRenderer(floatMinus(String(value).replace(/,/g, ""), 2));
          //       }
          //     } else {
          //       return "0.00";
          //     }
          //   },
          // },
          // {
          //   header: "มูลค่าคงเหลือ",
          //   sortable: false,
          //   align: "center",
          //   dataIndex: "f_unit_cost",
          //   width: 110,
          //   // editor: new Ext.form.TextField({
          //   //   style: "text-align: right",
          //   //   listeners: {
          //   //     afterrender: function () {
          //   //       this.fn = function () {
          //   //         if (this.getValue() < 10000) {
          //   //           this.setValue(0.0);
          //   //         } else {
          //   //           this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
          //   //         }
          //   //       };
          //   //     },
          //   //     Change: function (value) {
          //   //       this.fn();
          //   //     },
          //   //   },
          //   // }),
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     if (record.data.i_type == 1 || record.data.i_type == 2) {
          //       metaData.attr = "style='text-align: right; font-weight: bold;'";
          //       return floatRenderer(floatMinus(String(record.data.f_unit_cost3).replace(/,/g, ""), 2));
          //     } else if (value) {
          //       metaData.attr = "style='text-align: right;'";
          //       if (String(value).replace(/,/g, "") < 10000) {
          //         return "0.00";
          //       } else {
          //         return floatRenderer(floatMinus(String(value).replace(/,/g, ""), 2));
          //       }
          //     } else {
          //       return "0.00";
          //     }
          //   },
          // },
          // {
          //   header: "คลังพัสดุ",
          //   sortable: false,
          //   align: "center",
          //   dataIndex: "stockpile",
          //   width: 220,
          //   editor: new Ext.form.TextField({}),
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     if (record.data.i_type == 1 || record.data.i_type == 2) {
          //       return "";
          //     } else if (value) {
          //       metaData.attr = "style='text-align: center;'";
          //       return value;
          //     } else {
          //       metaData.attr = "style='text-align: center; color:red;'";
          //       return "-";
          //     }
          //   },
          // },
          // {
          //   header: "ส่วนงาน",
          //   sortable: false,
          //   align: "center",
          //   dataIndex: "Segment",
          //   width: 220,
          //   editor: new Ext.form.TextField({}),
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     if (record.data.i_type == 1 || record.data.i_type == 2) {
          //       return "";
          //     } else if (value) {
          //       metaData.attr = "style='text-align: center;'";
          //       return value;
          //     } else {
          //       metaData.attr = "style='text-align: center; color:red;'";
          //       return "-";
          //     }
          //   },
          // },
          // {
          //   header: "งาน/โครงการ",
          //   sortable: false,
          //   align: "center",
          //   dataIndex: "workandproject",
          //   width: 220,
          //   editor: new Ext.form.TextField({}),
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     if (record.data.i_type == 1 || record.data.i_type == 2) {
          //       return "";
          //     } else if (value) {
          //       metaData.attr = "style='text-align: center;'";
          //       return value;
          //     } else {
          //       metaData.attr = "style='text-align: center; color:red;'";
          //       return "-";
          //     }
          //   },
          // },
          // {
          //   header: "กองทุน",
          //   sortable: false,
          //   align: "center",
          //   dataIndex: "fund",
          //   width: 220,
          //   editor: new Ext.form.TextField({}),
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     if (record.data.i_type == 1 || record.data.i_type == 2) {
          //       return "";
          //     } else if (value) {
          //       metaData.attr = "style='text-align: center;'";
          //       return value;
          //     } else {
          //       metaData.attr = "style='text-align: center; color:red;'";
          //       return "-";
          //     }
          //   },
          // },
          // {
          //   header: "รหัสกิจกรรม",
          //   sortable: false,
          //   align: "center",
          //   dataIndex: "event_id",
          //   width: 150,
          //   editor: new Ext.form.TextField({}),
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     if (record.data.i_type == 1 || record.data.i_type == 2) {
          //       return "";
          //     } else if (value) {
          //       metaData.attr = "style='text-align: center;'";
          //       return value;
          //     } else {
          //       metaData.attr = "style='text-align: center; color:red;'";
          //       return "-";
          //     }
          //   },
          // },
          // {
          //   header: "ปีงบ",
          //   sortable: false,
          //   align: "center",
          //   dataIndex: "i_yyyy",
          //   width: 80,
          //   editor: new Ext.form.TextField({}),
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     if (record.data.i_type == 1 || record.data.i_type == 2) {
          //       return "";
          //     } else if (value) {
          //       metaData.attr = "style='text-align: center;'";
          //       return value;
          //     } else {
          //       metaData.attr = "style='text-align: center; color:red;'";
          //       return "-";
          //     }
          //   },
          // },
          // {
          //   header: "แหล่งเงิน",
          //   sortable: false,
          //   align: "center",
          //   dataIndex: "budget_source",
          //   width: 220,
          //   editor: new Ext.form.TextField({}),
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     if (record.data.i_type == 1 || record.data.i_type == 2) {
          //       return "";
          //     } else if (value) {
          //       metaData.attr = "style='text-align: center;'";
          //       return value;
          //     } else {
          //       metaData.attr = "style='text-align: center; color:red;'";
          //       return "-";
          //     }
          //   },
          // },
          // {
          //   header: "คุณสมบัติเฉพาะ(ยี่ห้อ/รุ่น)",
          //   sortable: false,
          //   align: "center",
          //   dataIndex: "c_detail",
          //   width: 180,
          //   editor: new Ext.form.TextField({}),
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     if (record.data.i_type == 1 || record.data.i_type == 2) {
          //       return "";
          //     } else if (value) {
          //       metaData.attr = "style='text-align: center;'";
          //       return value;
          //     } else {
          //       metaData.attr = "style='text-align: center; color:red;'";
          //       return "-";
          //     }
          //   },
          // },
          // {
          //   header: "ยี่ห้อ",
          //   sortable: false,
          //   align: "center",
          //   dataIndex: "c_brand",
          //   width: 100,
          //   editor: new Ext.form.TextField({}),
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     if (record.data.i_type == 1 || record.data.i_type == 2) {
          //       return "";
          //     } else if (value) {
          //       metaData.attr = "style='text-align: center;'";
          //       return value;
          //     } else {
          //       metaData.attr = "style='text-align: center; color:red;'";
          //       return "-";
          //     }
          //   },
          // },
          // {
          //   header: "รุ่น",
          //   sortable: false,
          //   align: "center",
          //   dataIndex: "c_model",
          //   width: 150,
          //   editor: new Ext.form.TextField({}),
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     if (record.data.i_type == 1 || record.data.i_type == 2) {
          //       return "";
          //     } else if (value) {
          //       metaData.attr = "style='text-align: center;'";
          //       return value;
          //     } else {
          //       metaData.attr = "style='text-align: center; color:red;'";
          //       return "-";
          //     }
          //   },
          // },
          // {
          //   header: "Serial Number",
          //   sortable: false,
          //   align: "center",
          //   dataIndex: "c_serial",
          //   width: 150,
          //   editor: new Ext.form.TextField({}),
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     if (record.data.i_type == 1 || record.data.i_type == 2) {
          //       return "";
          //     } else if (value) {
          //       metaData.attr = "style='text-align: center;'";
          //       return value;
          //     } else {
          //       metaData.attr = "style='text-align: center; color:red;'";
          //       return "-";
          //     }
          //   },
          // },
          // {
          //   header: "วิธีการได้มา",
          //   sortable: false,
          //   align: "center",
          //   dataIndex: "got",
          //   width: 120,
          //   editor: new Ext.form.TextField({}),
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     if (record.data.i_type == 1 || record.data.i_type == 2) {
          //       return "";
          //     } else if (value) {
          //       metaData.attr = "style='text-align: center;'";
          //       return value;
          //     } else {
          //       metaData.attr = "style='text-align: center; color:red;'";
          //       return "-";
          //     }
          //   },
          // },
          // {
          //   header: "วิธีคำนวณค่าเสื่อม",
          //   sortable: false,
          //   align: "center",
          //   dataIndex: "salvage",
          //   width: 120,
          //   editor: new Ext.form.TextField({}),
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     if (record.data.i_type == 1 || record.data.i_type == 2) {
          //       return "";
          //     } else if (value) {
          //       metaData.attr = "style='text-align: center;'";
          //       return value;
          //     } else {
          //       metaData.attr = "style='text-align: center; color:red;'";
          //       return "-";
          //     }
          //   },
          // },

          // {
          //   header: "หมายเหตุ",
          //   sortable: false,
          //   align: "center",
          //   dataIndex: "c_commet",
          //   width: 220,
          //   editor: new Ext.form.TextField({}),
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     if (record.data.i_type == 1 || record.data.i_type == 2) {
          //       return "";
          //     } else if (value) {
          //       metaData.attr = "style='text-align: center;'";
          //       return value;
          //     } else {
          //       metaData.attr = "style='text-align: center; color:red;'";
          //       return "-";
          //     }
          //   },
          // },
          // {
          //   header: "หมายเลขครุภัณฑ์เดิม2",
          //   sortable: false,
          //   align: "center",
          //   dataIndex: "c_codeold2",
          //   width: 180,
          //   editor: new Ext.form.TextField({}),
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     if (record.data.i_type == 1 || record.data.i_type == 2) {
          //       return "";
          //     } else if (value) {
          //       metaData.attr = "style='text-align: center;'";
          //       return value;
          //     } else {
          //       metaData.attr = "style='text-align: center; color:red;'";
          //       return "-";
          //     }
          //   },
          // },
          // {
          //   header: "หมายเลขครุภัณฑ์เดิม1",
          //   sortable: false,
          //   align: "center",
          //   dataIndex: "c_codeold1",
          //   width: 180,
          //   editor: new Ext.form.TextField({}),
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     if (record.data.i_type == 1 || record.data.i_type == 2) {
          //       return "";
          //     } else if (value) {
          //       metaData.attr = "style='text-align: center;'";
          //       return value;
          //     } else {
          //       metaData.attr = "style='text-align: center; color:red;'";
          //       return "-";
          //     }
          //   },
          // },
          // {
          //   header: "เลขที่ใบตรวจรับ",
          //   sortable: false,
          //   align: "center",
          //   dataIndex: "receipt_number",
          //   width: 120,
          //   editor: new Ext.form.TextField({}),
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     if (record.data.i_type == 1 || record.data.i_type == 2) {
          //       return "";
          //     } else if (value) {
          //       metaData.attr = "style='text-align: center;'";
          //       return value;
          //     } else {
          //       metaData.attr = "style='text-align: center; color:red;'";
          //       return "-";
          //     }
          //   },
          // },
          // {
          //   header: "วันที่เริ่มรับประกัน",
          //   sortable: false,
          //   align: "center",
          //   dataIndex: "insurance_start",
          //   width: 100,
          //   editor: new Ext.form.TextField({}),
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     if (record.data.i_type == 1 || record.data.i_type == 2) {
          //       return "";
          //     } else if (value) {
          //       metaData.attr = "style='text-align: center;'";
          //       return value;
          //     } else {
          //       metaData.attr = "style='text-align: center; color:red;'";
          //       return "-";
          //     }
          //   },
          // },
          // {
          //   header: "รับประกัน....ปี",
          //   sortable: false,
          //   align: "center",
          //   dataIndex: "insurance_year",
          //   width: 50,
          //   editor: new Ext.form.TextField({}),
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     if (record.data.i_type == 1 || record.data.i_type == 2) {
          //       return "";
          //     } else if (value) {
          //       metaData.attr = "style='text-align: center;'";
          //       return value;
          //     } else {
          //       metaData.attr = "style='text-align: center; color:red;'";
          //       return "-";
          //     }
          //   },
          // },
          // {
          //   header: "รับประกัน....เดือน",
          //   sortable: false,
          //   align: "center",
          //   dataIndex: "insurance_month",
          //   width: 50,
          //   editor: new Ext.form.TextField({}),
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     if (record.data.i_type == 1 || record.data.i_type == 2) {
          //       return "";
          //     } else if (value) {
          //       metaData.attr = "style='text-align: center;'";
          //       return value;
          //     } else {
          //       metaData.attr = "style='text-align: center; color:red;'";
          //       return "-";
          //     }
          //   },
          // },
          // {
          //   header: "วันที่สิ้นสุดรับประกัน",
          //   sortable: false,
          //   align: "center",
          //   dataIndex: "insurance_end",
          //   width: 180,
          //   editor: new Ext.form.TextField({}),
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     if (record.data.i_type == 1 || record.data.i_type == 2) {
          //       return "";
          //     } else if (value) {
          //       metaData.attr = "style='text-align: center;'";
          //       return value;
          //     } else {
          //       metaData.attr = "style='text-align: center; color:red;'";
          //       return "-";
          //     }
          //   },
          // },
          // {
          //   header: "หมายเหตุรับประกัน",
          //   sortable: false,
          //   align: "center",
          //   dataIndex: "insurance_mote",
          //   width: 180,
          //   editor: new Ext.form.TextField({}),
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     if (record.data.i_type == 1 || record.data.i_type == 2) {
          //       return "";
          //     } else if (value) {
          //       metaData.attr = "style='text-align: center;'";
          //       return value;
          //     } else {
          //       metaData.attr = "style='text-align: center; color:red;'";
          //       return "-";
          //     }
          //   },
          // },
          // {
          //   header: "สถานที่ตั้ง",
          //   sortable: false,
          //   align: "center",
          //   dataIndex: "c_location",
          //   width: 180,
          //   editor: new Ext.form.TextField({}),
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     if (record.data.i_type == 1 || record.data.i_type == 2) {
          //       return "";
          //     } else if (value) {
          //       metaData.attr = "style='text-align: center;'";
          //       return value;
          //     } else {
          //       metaData.attr = "style='text-align: center; color:red;'";
          //       return "-";
          //     }
          //   },
          // },
          // {
          //   header: "รหัสอาคาร",
          //   sortable: false,
          //   align: "center",
          //   dataIndex: "c_code_building",
          //   width: 180,
          //   editor: new Ext.form.TextField({}),
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     if (record.data.i_type == 1 || record.data.i_type == 2) {
          //       return "";
          //     } else if (value) {
          //       metaData.attr = "style='text-align: center;'";
          //       return value;
          //     } else {
          //       metaData.attr = "style='text-align: center; color:red;'";
          //       return "-";
          //     }
          //   },
          // },
          // {
          //   header: "เลขทะเบียนรถ",
          //   sortable: false,
          //   align: "center",
          //   dataIndex: "car_register",
          //   width: 180,
          //   editor: new Ext.form.TextField({}),
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     if (record.data.i_type == 1 || record.data.i_type == 2) {
          //       return "";
          //     } else if (value) {
          //       metaData.attr = "style='text-align: center;'";
          //       return value;
          //     } else {
          //       metaData.attr = "style='text-align: center; color:red;'";
          //       return "-";
          //     }
          //   },
          // },
          // {
          //   header: "ประเภทรถ",
          //   sortable: false,
          //   align: "center",
          //   dataIndex: "car_type",
          //   width: 180,
          //   editor: new Ext.form.TextField({}),
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     if (record.data.i_type == 1 || record.data.i_type == 2) {
          //       return "";
          //     } else if (value) {
          //       metaData.attr = "style='text-align: center;'";
          //       return value;
          //     } else {
          //       metaData.attr = "style='text-align: center; color:red;'";
          //       return "-";
          //     }
          //   },
          // },
          // {
          //   header: "รหัสผู้ดูแล",
          //   sortable: false,
          //   align: "center",
          //   dataIndex: "code_caretaker",
          //   width: 180,
          //   editor: new Ext.form.TextField({}),
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     if (record.data.i_type == 1 || record.data.i_type == 2) {
          //       return "";
          //     } else if (value) {
          //       metaData.attr = "style='text-align: center;'";
          //       return value;
          //     } else {
          //       metaData.attr = "style='text-align: center; color:red;'";
          //       return "-";
          //     }
          //   },
          // },
          // {
          //   header: "ชื่อผู้ดูแลครุภัณฑ์",
          //   sortable: false,
          //   align: "center",
          //   dataIndex: "name_caretaker",
          //   width: 180,
          //   editor: new Ext.form.TextField({}),
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     if (record.data.i_type == 1 || record.data.i_type == 2) {
          //       return "";
          //     } else if (value) {
          //       metaData.attr = "style='text-align: center;'";
          //       return value;
          //     } else {
          //       metaData.attr = "style='text-align: center; color:red;'";
          //       return "-";
          //     }
          //   },
          // },
          // {
          //   header: "แฟ้มรูปภาพ",
          //   sortable: false,
          //   align: "center",
          //   dataIndex: "image_file",
          //   width: 180,
          //   editor: new Ext.form.TextField({}),
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     if (record.data.i_type == 1 || record.data.i_type == 2) {
          //       return "";
          //     } else if (value) {
          //       metaData.attr = "style='text-align: center;'";
          //       return value;
          //     } else {
          //       metaData.attr = "style='text-align: center; color:red;'";
          //       return "-";
          //     }
          //   },
          // },
          // {
          //   header: "สถานะพิมพ์บาร์โค้ด",
          //   sortable: false,
          //   align: "center",
          //   dataIndex: "barcode_status",
          //   width: 180,
          //   editor: new Ext.form.TextField({}),
          //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          //     if (record.data.i_type == 1 || record.data.i_type == 2) {
          //       return "";
          //     } else if (value) {
          //       metaData.attr = "style='text-align: center;'";
          //       return value;
          //     } else {
          //       metaData.attr = "style='text-align: center; color:red;'";
          //       return "-";
          //     }
          //   },
          // },
          {
            id: "delete",
            header: "ลบ",
            sortable: false,
            align: "center",
            width: 30,
            dataIndex: "id",
            renderer: function (value, metaData, record, row, col, store, gridView) {
              // if (record.data.sp_tor_dtl_id < 1 ?? 0 == 0)
              if (record.data.i_type == 99) {
              } else {
                return '<img src="../images/icons/table_delete.png"); style="cursor:pointer"/>';
              }
            },
          },
          { width: 15, dataIndex: "" },
        ],
        bbar: [
          {
            text: "&nbsp;ยืนยันตัดจำหน่าย&nbsp;",
            id: "saveDtl",
            iconCls: "icon-save",
            handler: function (grid, rowIndex, colIndex) {
              new Ext.Window({
                id: "win-msg-cutoff",
                title: "ยืนยันตัดจำหน่าย",
                modal: true,
                width: 250,
                height: 130,
                html: "ท่านยืนยันตัดจำหน่าย ? <br>",
                buttons: [
                  {
                    text: "&nbsp;ยืนยัน&nbsp;",
                    iconCls: "icon-save",
                    handler: function () {
                      Ext.Ajax.request({
                        url: "api/mn_AmCutOff.php",
                        method: "POST",
                        params: {
                          mode: "CAL_CUTOFF_DEPRE",
                          am_cutoff_hdr_id: Ext.HDR_ID,
                        },
                        success: function (result, request) {
                          var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                          if (jsonData.success) {
                            Ext.MessageBox.alert("Success", "ตัดจำหน่ายสำเร็จ"); // alert massage success
                          } else {
                            Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                          }
                          Ext.getCmp("win-msg-cutoff").hide(); // hidden window-panel
                          Ext.getCmp("win-msg-cutoff").destroy(); // clear memory :: garbage collection
                          Ext.store.load();
                          Ext.storeDtl.load({
                            params: { hdr_id: Ext.HDR_ID },
                          });
                          Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not errer
                          Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
                        },
                        failure: function (result, request) {
                          Ext.MessageBox.alert("Failed", result.responseText); // connect error
                        },
                      });
                    },
                  },
                  {
                    text: "ย้อนกลับ",
                    handler: function () {
                      Ext.getCmp("win-msg-cutoff").hide();
                      Ext.getCmp("win-msg-cutoff").destroy();
                    },
                  },
                ],
              }).show();
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
