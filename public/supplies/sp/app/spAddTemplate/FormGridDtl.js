// const search_dtl = function () {
//   var msg = "";
//   if (msg == "") {
//     if (Ext.getCmp("value-box_dtl").getValue() != "") {
//       Ext.storeMutiSave.setBaseParam("value", Ext.getCmp("value-box_dtl").getValue());
//       Ext.storeMutiSave.setBaseParam("filter", Ext.getCmp("filter_dtl").getValue());
//     } else {
//       Ext.storeMutiSave.setBaseParam("value", "");
//       Ext.storeMutiSave.setBaseParam("filter", "");
//     }
//     Ext.storeMutiSave.setBaseParam("mode", "SEARCH");
//     Ext.storeMutiSave.setBaseParam("po_creditor_id", Ext.getCmp("s_d_po_creditor_id").getValue());
//     Ext.storeMutiSave.setBaseParam("dc_cost_acc_id", Ext.getCmp("s_d_dc_cost_acc_id").getValue());
//     Ext.storeMutiSave.load({
//       callback: function (records, operation, success) {
//         $("input[id^=chk]").each(function (i, val) {
//           var id = String(val.value);
//           var index = Ext.list_check_id.indexOf(id);
//           if (index >= 0) document.getElementById("chk[" + id + "]").checked = true;
//         });
//       },
//     });
//   } else {
//     Ext.Msg.alert("แจ้งเตือน", msg);
//   }
// };

// Class Extend
formMutiSave = function (args) {
  formMutiSave.superclass.constructor.call(this, {
    title: "ทำหลายรายการ",
    id: "MutiSave",
    iconCls: "icon-application-view-list",
    region: "center",
    layout: "fit",
    border: false,
    stripeRows: true,
    loadMask: true,
    items: [
      new Ext.grid.GridPanel({
        id: "grid_dtl",
        border: false,
        stripeRows: true,
        loadMask: true,
        store: Ext.storeMutiSave,
        viewConfig: {
          emptyText: "ไม่มีข้อมูล..",
          deferEmptyText: false,
          getRowClass: function (record) {
            if (record.data.i_type == 2 || record.data.i_type == 3) {
              if (record.data.i_success == 1) {
                return "td-success";
              } else {
                return "td-error";
              }
            }
          },
        },
        listeners: {
          afterRender: function (grid) {
            this.store.setBaseParam("dc_cost_acc_id", Ext.dc_cost_acc_default);
            this.store.load();

            Ext.dc_user_approve.setBaseParam("dc_cost_acc_id", Ext.dc_cost_acc_default);
            Ext.dc_user_approve.load();

            Ext.dc_user_executive.setBaseParam("dc_cost_acc_id", Ext.dc_cost_acc_default);
            Ext.dc_user_executive.load();

            var element = Ext.get(grid.getView().mainHd.id);
            element.on("contextmenu", function (e, t) {
              e.stopEvent();
              var menu = new Ext.menu.Menu();
              menu.add({
                text: "Refresh",
                icon: "../images/icons/arrow_refresh_small.png",
                scope: this,
                handler: function (e) {
                  grid.store.load();
                },
              });
              if (Ext.session.user_id == 1) {
                menu.addSeparator();
                menu.add(
                  new Ext.menu.Item({
                    text: "show only admin",
                    disabled: true,
                    cls: "menu-separator-text",
                  })
                );
                menu.add({
                  text: "Inspect SQL",
                  icon: "../images/icons/script_lightning.png",
                  scope: this,
                  handler: function (e) {
                    grid.store.load({ params: { show_sql: 1 } });
                  },
                });
              }
              menu.showAt(e.getXY());
            });
          },
          sortchange: function (grid, sortInfo) {
            // var field = sortInfo.field; // The field being sorted
            // var direction = sortInfo.direction; // The sort direction ('ASC' or 'DESC')
            Ext.list_check_id.forEach(function (item, index) {
              document.getElementById("chk[" + item + "]").checked = true;
            });
          },
        },
        tbar: [
          {
            xtype: "buttongroup",
            // id: "buttongroup_search",
            // title: "ระบุเงื่อนไขในการค้นหาข้อมูล",
            columns: 1,
            defaults: { scale: "small", style: "float: right" },
            items: [
              {
                xtype: "buttongroup",
                frame: false,
                items: [
                  { xtype: "label", text: "ส่วนงาน : " },
                  { xtype: "tbspacer", width: 4 },
                  {
                    id: "dtl_s_dc_cost_acc_id",
                    xtype: "combo",
                    width: 300,
                    mode: "local",
                    store: Ext.dc_cost_sys_main,
                    value: Ext.dc_cost_acc_default,
                    valueField: "id",
                    displayField: "c_name",
                    allowBlank: false,
                    editable: false,
                    triggerAction: "all",
                    typeAhead: false,
                    listeners: {
                      select: function (combo, newValue) {
                        Ext.list_check_data = [];
                        document.getElementById("text_conut").innerHTML = "( " + Ext.list_check_data.length + " รายการ )";
                        Ext.storeMutiSave.setBaseParam("dc_cost_acc_id", Ext.getCmp("dtl_s_dc_cost_acc_id").getValue());
                        Ext.storeMutiSave.load();

                        Ext.dc_user_approve.setBaseParam("dc_cost_acc_id", Ext.getCmp("dtl_s_dc_cost_acc_id").getValue());
                        Ext.dc_user_approve.load({
                          callback: function () {
                            if (Ext.getCmp("dc_approve_id")) {
                              var records = Ext.dc_user_approve.data.items;
                              var record = records.filter((record) => record.get("i_main") == 1);
                              if (record.length === 0) record = records;
                              Ext.getCmp("dc_approve_id").setValue("");
                              Ext.getCmp("dc_approve_id").setValue(record[0].data.id);
                            }
                          },
                        });

                        Ext.dc_user_executive.setBaseParam("dc_cost_acc_id", Ext.getCmp("dtl_s_dc_cost_acc_id").getValue());
                        Ext.dc_user_executive.load({
                          callback: function () {
                            if (Ext.getCmp("dc_executive_id")) {
                              var records = Ext.dc_user_executive.data.items;
                              var record = records.filter((record) => record.get("i_main") == 1);
                              if (record.length === 0) record = records;
                              Ext.getCmp("dc_executive_id").setValue("");
                              Ext.getCmp("dc_executive_id").setValue(record[0].data.id);
                            }
                          },
                        });
                      },
                    },
                  },
                ],
              },
            ],
          },
        ],
        columns: [
          // {
          //   header: "<div class='topAlign'><input id='checkAll' type='checkbox' onclick='checkAll(this.checked)'></div>",
          //   sortable: false,
          //   align: "center",
          //   width: 50,
          //   id: "col_check",
          //   dataIndex: "po_working_hdr_id",
          //   renderer: function (value, metaData, record, row, col, store, gridView) {
          //     return "<input type='checkbox' id='chk[" + value + "]' onclick='checkRow(this.checked ," + value + ")' value=" + value + " >";
          //   },
          // },
          {
            header: "<div class='topAlign'><input id='checkAll' type='checkbox' onclick='checkAll(this.checked)'></div>",
            sortable: false,
            align: "center",
            width: 100,
            id: "col_check",
            dataIndex: "id",
            renderer: function (value, metaData, record, row, col, store, gridView) {
              return "<input type='checkbox' id='chk[" + value + "]' onclick='checkRow(this.checked ," + value + ")' value=" + value + " >";
            },
          },
          {
            header: "เอกสารขอใบเบิก",
            sortable: false,
            width: 109,
            align: "center",
            dataIndex: "pdf_hdr",
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              var BtnText = "<img src='../images/icons/page_white_acrobat.png' style='margin-right:1px;' /><div><spen style='font-size:11px; color: green;'>&nbsp<b>" + record.data.c_code + "</b>&nbsp</spen>";
              if (record.data.i_is_url_pdf_hdr == null) {
                return "-";
              } else if (record.data.i_is_url_pdf_hdr == 0) {
                return '<button style="display: flex; height: 18px; padding: 0px;" onclick="Po_OpenPdf(\'' + value + "', '" + record.data.c_code + '\')" type="button">' + BtnText + "</button>";
              } else {
                return "-";
              }
            },
          },
          {
            header: "เอกสารประกอบ",
            sortable: false,
            width: 109,
            align: "center",
            dataIndex: "pdf_dtl",
            editor: new Ext.form.TextField({}),
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              if (record.data.i_pdf_dtl_outside == 1) {
                var BtnText = "<img src='../images/icons/page_white_acrobat.png' style='margin-right:1px;' /><div><spen style='font-size:11px; color:red;'>ㅤนอกระบบㅤㅤ</spen>";
              } else {
                var BtnText = "<img src='../images/icons/page_white_acrobat.png' style='margin-right:1px;' /><div><spen style='font-size:11px'>&nbspเอกสารประกอบ&nbsp</spen>";
              }
              if (record.data.i_is_url_pdf_dtl == null) {
                return "-";
              } else if (record.data.i_is_url_pdf_dtl == 0) {
                return '<button style="display: flex; height: 18px; padding: 0px;" onclick="Po_OpenPdf(\'' + value + "', '" + record.data.c_code + '\')" type="button">' + BtnText + "</button>";
              } else {
                return "-";
              }
            },
          },
          {
            header: "เลขที่ฏีกา",
            sortable: false,
            hidden: Ext.I_STATUS >= 4 ? false : true,
            align: "center",
            width: 100,
            dataIndex: "c_approve",
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              return value;
            },
          },
          {
            header: "จำนวนเงินขอเบิก",
            sortable: false,
            align: "center",
            width: 100,
            dataIndex: "f_total",
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = 'style="color: blue; text-align: right;"';
              return floatRenderer(floatMinus(value, 2));
            },
          },
          {
            header: "สถานะดำเนินการ",
            sortable: true,
            align: "center",
            dataIndex: "c_status_last",
            width: 190,
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              let vv = record.data.i_sub_status;
              var index_status = SUB_STATUS.findIndex(([code]) => code == vv);
              let color = SUB_STATUS[index_status][2];
              metaData.attr = 'style="font-weight: bold; color: ' + color + ';"';
              return value;
            },
          },
          {
            header: "หน่วยงาน",
            sortable: false,
            align: "center",
            width: 200,
            dataIndex: "cost_name",
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = 'style="text-align: left;"';
              return value;
            },
          },
          {
            header: "แหล่งเงิน",
            sortable: false,
            align: "center",
            width: 200,
            dataIndex: "budget_name",
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = 'style="text-align: left;"';
              return value;
            },
          },
          {
            header: "รายการย่อย",
            sortable: false,
            align: "center",
            width: 200,
            dataIndex: "bg_expense_name",
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              metaData.attr = 'style="text-align: left;"';
              return value;
            },
          },
          { width: 40, dataIndex: "" },
        ],
        bbar: [
          { xtype: "tbspacer", width: 20 },
          {
            xtype: "label",
            width: 180,
            id: "text_conut",
            style: "font-size: 15px; font-weight: bold; color: blue; display: inline-block",
          },
          { xtype: "tbfill" },
          {
            xtype: "buttongroup",
            frame: false,
            columns: 1,
            defaults: { scale: "small", style: "float: right" },
            items: typeof Obj_MutiSave !== "undefined" ? Obj_MutiSave : [],
            // [
            //   {
            //     xtype: "buttongroup",
            //     frame: false,
            //     items: [
            //       { xtype: "label", text: "วันที่ทำรายการ : ", style: "font-size: 14px; " },
            //       { xtype: "tbspacer", width: 4 },
            //       {
            //         xtype: "datefield",
            //         id: "d_doc_date",
            //         style: "font-size: 14px;",
            //         width: 100,
            //       },
            //       { xtype: "tbspacer", width: 100 },
            //     ],
            //   },
            //   {
            //     xtype: "buttongroup",
            //     frame: false,
            //     items: [
            //       { xtype: "label", text: "หมายเหตุ : ", style: "font-size: 14px; " },
            //       { xtype: "tbspacer", width: 4 },
            //       {
            //         xtype: "textarea",
            //         fieldLabel: "หมายเหตุ",
            //         id: "c_comment_status",
            //         height: 40, // Set the height here
            //         width: 200,
            //       },
            //     ],
            //   },
            // ],
          },
          { xtype: "tbspacer", width: 4 },
          {
            iconCls: "icon-save",
            xtype: "button",
            style: "padding: 6px 20px",
            scale: "medium",
            text: "ยืนยันรายการ&nbsp;",
            handler: function () {
              saveHdr_MutiSave();
            },
          },
        ],
        //                 autoExpandColumn: "c_name"
      }),
    ],
  });

  // ================================ gridMain ================================ //
  cellClickDtl = function (grid, rowIndex, columnIndex, e) {
    let record = grid.getStore().getAt(rowIndex);
    if (columnIndex == grid.getColumnModel().getIndexById("col_check")) {
      cellClick_check_col(record);
    } else if (columnIndex == grid.getColumnModel().getIndexById("print")) {
      Preview(record.data.id);
    }
  }; //cellClickDtl

  const rowContextmenu = function (grid, rowIndex, e) {
    e.stopEvent();
    // grid.getSelectionModel().selectRow(rowIndex);
    var record = grid.store.getAt(rowIndex);
    if (record) {
      var menu = new Ext.menu.Menu();
      menu.add(
        new Ext.menu.Item({
          text: "shift หรือ ctrl เพื่อเลือกหลายรายการ",
          disabled: true,
          cls: "menu-separator-text",
        })
      );
      menu.add({
        text: "เลือกรายการ",
        icon: "../images/icons/bullet_tick.png",
        scope: this,
        handler: function (e) {
          var selections = grid.selModel.getSelections();
          for (var i = 0; i < selections.length; i++) {
            var record = selections[i];
            var id = record.get("id");
            document.getElementById("chk[" + id + "]").checked = true;
            var index = Ext.list_check_data.findIndex((item) => item.get("id") == id);
            if (!(index >= 0)) Ext.list_check_data.push(record);
          }
          document.getElementById("text_conut").innerHTML = "( " + Ext.list_check_data.length + " รายการ )";
        },
      });
      menu.add({
        text: "ยกเลิกการเลือก",
        icon: "../images/icons/bullet_cross.png",
        scope: this,
        handler: function (e) {
          var selections = grid.selModel.getSelections();
          for (var i = 0; i < selections.length; i++) {
            var record = selections[i];
            var id = record.get("id");
            document.getElementById("chk[" + id + "]").checked = false;
            var index = Ext.list_check_data.findIndex((item) => item.get("id") == id);
            if (index >= 0) Ext.list_check_data.splice(index, 1);
          }
          document.getElementById("text_conut").innerHTML = "( " + Ext.list_check_data.length + " รายการ )";
        },
      });

      if (Ext.session.user_id == 1) {
        menu.addSeparator();
        menu.add(
          new Ext.menu.Item({
            text: "show only admin",
            disabled: true,
            cls: "menu-separator-text",
          })
        );
        menu.add({
          text: "(console_record)",
          icon: "../images/icons/script.png",
          scope: this,
          handler: function (e) {
            console.log(record);
          },
        });

        menu.add({
          text: "po_working_hdr_id : " + record.data.id,
          icon: "../images/icons/script.png",
          scope: this,
          handler: function (e) {
            copyToClipboard(record.data.id);
          },
        });
      }
      menu.showAt(e.getXY());
    }
  }; //rowContextmenu
  Ext.getCmp("grid_dtl").on("cellclick", cellClickDtl, this);
  Ext.getCmp("grid_dtl").on("rowContextmenu", rowContextmenu, this);
}; // formMutiSave
Ext.extend(formMutiSave, Ext.Panel, {});

/*********** function for cellClick check_col************/
Ext.list_check_data = [];
function checkAll(ele) {
  if (ele) {
    $("input[id^=chk]").each(function (i, val) {
      var id = String(val.value);
      document.getElementById("chk[" + id + "]").checked = ele;
      var data = Ext.storeMutiSave.getById(val.value);
      var index = Ext.list_check_data.findIndex((item) => item.get("id") == id);
      if (!(index >= 0)) Ext.list_check_data.push(data);
      if (Ext.list_check_data.length == 100){
        Ext.Msg.alert("แจ้งเตือน", "เลือกได้สูงสุด 100 รายการ");
        return false;
      } 
    });
  } else {
    $("input[id^=chk]").each(function (i, val) {
      var id = String(val.value);
      document.getElementById("chk[" + id + "]").checked = ele;
      var index = Ext.list_check_data.findIndex((item) => item.get("id") == id);
      if (index >= 0) Ext.list_check_data.splice(index, 1);
    });
  }
  document.getElementById("text_conut").innerHTML = "( " + Ext.list_check_data.length + " รายการ )";
}
function checkRow(ele, id) {
  document.getElementById("chk[" + id + "]").checked = ele ? false : true;
}
function cellClick_check_col(record) {
  if (document.getElementById("chk[" + record.data.id + "]").checked) {
    document.getElementById("chk[" + record.data.id + "]").checked = false;
    var index = Ext.list_check_data.findIndex((item) => item.get("id") == record.data.id);
    if (index >= 0) Ext.list_check_data.splice(index, 1);
  } else {
    document.getElementById("chk[" + record.data.id + "]").checked = true;
    Ext.list_check_data.push(record);
  }
  document.getElementById("checkAll").checked = Ext.list_check_data.length == Ext.storeMutiSave.data.length ? true : false;
  document.getElementById("text_conut").innerHTML = "( " + Ext.list_check_data.length + " รายการ )";
}
/***********************************************************/
