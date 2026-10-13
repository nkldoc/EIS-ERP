/* global Ext, user_right_add, user_right_edit, user_right_delete */
/*dc_creditor save to sp_tor_victory*/

AddTor = function (record, butt) {
  Ext.DTL = null;
  Ext.dc_creditor_id = null;
  Ext.HDR_ID = Ext.selectRow.data.id;
  if (butt == "ADD") {
      winADD(butt);
  }
  if (butt == "EDIT") {
      Ext.sp_tor_id = Ext.selectRow_dtl.get("sp_tor_id");
      Ext.dc_creditor_id = Ext.selectRow_dtl.get("dc_creditor_id");
      winADD(butt);
  }
};
Delete_tor_victory = function (record) {
  Ext.sp_tor_id = Ext.selectRow_dtl.get("sp_tor_id");
  Ext.dc_creditor_id = Ext.selectRow_dtl.get("dc_creditor_id");
  var win = new Ext.Window({
      id: "win-msg-delete",
      title: "Remove",
      modal: true,
      width: 250,
      height: 130,
      html: "ท่านต้องการที่จะลบข้อมูล ?",
      buttons: [
          {
              text: "Confirm",
              handler: function () {
                  Ext.Ajax.request({
                      url: "tor/api/mnTorController.php",
                      params: {
                          mode: "DELETE_TOR_VICTORY",
                          tor_id: Ext.sp_tor_id,
                          dc_creditor_id: Ext.dc_creditor_id,
                      },
                      method: "GET", //POST
                      success: function (result, request) {
                          Ext.getCmp("gridSub2ID").getStore().reload();
                          // Ext.selectRow = null;
                          Ext.getCmp("win-msg-delete").destroy();
                          Ext.store2.load({params: {id: Ext.HDR_ID}});
                          // Ext.Msg.alert("แจ้งเตือน", "ลบข้อมูลเรียบร้อย");
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
                  Ext.getCmp("tabpanel1").getStore().reload();
              },
          },
      ],
  }).show();
};
winADD = function (butt) {
  Ext.dc_creditor = new Ext.data.JsonStore({
      autoDestroy: false,
      autoLoad: true,
      url: "api/All_PoWorkingImpHdr.php",
      baseParams: {
          tor_id: Ext.HDR_ID,
          mode: butt,
          dc_creditor_id: Ext.dc_creditor_id,
          type: "dc_creditor_st0007",
      },
      root: "data",
      idProperty: "id",
      fields: ["id", "c_name"],
  });
  let myComboStores = [Ext.dc_creditor];
  chkLoadingStore(myComboStores, "contenterCenter", function () {});
  var tabs = new Ext.FormPanel({
      id: "frm_dtl_add",
      // labelWidth: 150,
      url: "tor/api/mnTorController.php",
      border: false,
      // width: 500,
      items: {
          xtype: "tabpanel",

          activeTab: 0,
          defaults: {
              autoHeight: true,
              bodyStyle: "padding:10px",
          },
          items: [
              {
                  title: "เลือกผู้ชนะ",
                  layout: "form",
                  // defaults: { width: 250 },
                  defaultType: "textfield",
                  items: [
                      {
                          xtype: "hidden",
                          name: "sp_tor_id",
                          value: Ext.HDR_ID,
                          readOnly: true,
                      },
                      {
                          xtype: "hidden",
                          name: "dc_creditor_id_old",
                          // value: Ext.HDR_ID,
                          readOnly: true,
                      },
                      {
                          xtype: "hidden",
                          name: "mode",
                          value: "UPDATE_TOR_VICTORY",
                          readOnly: true,
                      },
                      new Ext.form.ComboBox({
                          mode: "local",
                          store: Ext.dc_creditor,
                          fieldLabel: "ผู้ชนะ",
                          anchor: "100%",
                          submitValue: true,
                          id: "dc_creditor_idID",
                          name: "dc_creditor_name",
                          hiddenName: "dc_creditor_id",
                          valueField: "id",
                          displayField: "c_name",
                          allBlank: true,
                          triggerAction: "all",
                          forceSelection: true,
                          selectOnFocus: true,
                          typeAhead: false,
                          emptyText: "กรุณาเลือกผู้ชนะ...",
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
                      {
                          xtype: "radiogroup",
                          columns: [90, 110],
                          fieldLabel: "สถานะการใช้งาน",
                          hidden: true,
                          name: "i_enabled",
                          id: "i_enabledID",
                          items: [
                              {
                                  name: "i_enabled",
                                  checked: true,
                                  inputValue: 1,
                                  boxLabel: "ใช้งาน",
                              },
                              {
                                  name: "i_enabled",
                                  inputValue: 2,
                                  boxLabel: "ไม่ใช้งาน",
                              },
                          ], //radiogroup
                      },
                  ],
              },
          ],
      },

      buttons: [
          {
              text: "Save",
              handler: function () {
                  msg = "";
                  if (Ext.getCmp("dc_creditor_idID").getValue() == "") {
                      msg += "<span style='white-space: nowrap;'>- กรุณาเลือก ผู้ชนะ</span><br>";
                  }
                  if (msg == "") {
                      var formSubmit = function () {
                          form.submit({
                              waitMsg: "Saving Data...",
                              success: function (form, action) {
                                  Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                      Ext.getCmp("gridSub2ID").getStore().reload();
                                      // Ext.selectRow = null;
                                      Ext.getCmp("win-frm-dtlID").destroy();
                                  });
                              },
                              failure: function (form, action) {
                                  switch (action.failureType) {
                                      case Ext.form.Action.CLIENT_INVALID:
                                          Ext.Msg.alert("Failure", "Form fields may not be submitted with invalid values");
                                          break;
                                      case Ext.form.Action.CONNECT_FAILURE:
                                          Ext.Msg.alert("Failure", "พลข้อผิดพลาดในการเชื่อต่อเครือข่าย");
                                          break;
                                      case Ext.form.Action.SERVER_INVALID:
                                          Ext.Msg.alert("Failure", action.result.msg);
                                  }
                              },
                          });
                      }; //END
                  } else {
                      Ext.Msg.alert("แจ้งเตือน", msg);
                  }

                  var form = Ext.getCmp("frm_dtl_add").getForm();
                  if (form.isValid()) {
                      if (Ext.getCmp("modesubID").getValue().inputValue === "VIEW") {
                      } else if (Ext.getCmp("modesubID").getValue().inputValue === "DELETE") {
                          Ext.MessageBox.show({
                              title: "Icon Support",
                              msg: "คุณต้องการที่จะลบ รายการที่เลือกนี้ใช่ใหม ?",
                              buttons: Ext.MessageBox.OKCANCEL,
                              icon: Ext.MessageBox.WARNING,
                              fn: function (btn) {
                                  if (btn === "ok") {
                                      formSubmit(form);
                                  } else {
                                      return;
                                  }
                              },
                          });
                      } else {
                          if (msg == "") {
                              formSubmit(form);
                          }
                      }
                  }
              },
          },
          {
              text: "Cancel",
              handler: function () {
                  // Ext.saveDTL(false);
                  Ext.getCmp("win-frm-dtlID").destroy();
              },
          },
      ],
  });

  Ext.store2.load({
      callback: function (recordx, operation, success) {
          if (success) {
              var win = new Ext.Window({
                  id: "win-frm-dtlID",
                  layout: "fit",
                  width: 600,
                  height: 150,
                  //  closeAction: 'hide',
                  plain: true,
                  modal: true,
                  items: tabs,
              });
              var rec = Ext.selectRow_dtl;
              if (butt == "EDIT") {
                  Ext.getCmp("win-frm-dtlID").items.items[0].getForm().loadRecord(rec);
              } else if (butt == "ADD") {
              }
              win.show();
          }
      },
  });
};
Ext.AppUx = function (app, menu) {
  Ext.tor_type_id = 1; // default start เจาะจงน้อวกว่า 5 แสน
  Ext.i_is_more = 0;
  Ext.tor_type_idTxt = Ext.apply({
      tor_type_id1: {
          0: "แบบมี หัวงาน/ฝ่ายพิจารณาผล(ไม่เกิน 5 แสนบาท)",
          1: "แบบมีคณะกรรมการพิจารณาผล(เกิน 5 แสนแสนบาท)",
      },
  });
  function cellClick(grid, rowIndex, columnIndex, e) {
      var record = grid.getStore().getAt(rowIndex);
      if (columnIndex === grid.getColumnModel().getIndexById("edit")) {
          Ext.selectRow_dtl = record;
          AddTor(record, "EDIT");
      }
      if (columnIndex === grid.getColumnModel().getIndexById("delete")) {
          Ext.selectRow_dtl = record;
          Delete_tor_victory(record);
      }
  }
  Ext.store2 = new Ext.data.JsonStore({
      storeId: "myStore2",
      autoLoad: false,
      url: "tor/api/mnTorController.php",
      root: "data",
      baseParams: {
          mode: "TOR_VICTORY",
          i_read: user_right_read,
          sp_tor_id: Ext.HDR_ID,
      }, //Permission i_read
      idProperty: "id",
      totalProperty: "totalCount",
      fields: [{name: "no"}, {name: "sp_tor_id"}, {name: "dc_creditor_id"}, {name: "dc_creditor_id_old"}, {name: "dc_creditor_name", type: "string"}, {name: "i_enabled"}],
  });

  Ext.AppConfig();
  //interlizing
  Ext.menuCode = "ST0008"; //go to
  //
  Ext.storeDtl.setBaseParam("type_menu", 2); //set สายงาน
  Ext.status = Ext.runStatus(menu);
  //Load
  var AppPoStore = function (statuss) {
      var comboCost = new Ext.form.ComboBox({
          mode: "local",
          readOnly: true,
          store: Ext.dc_cost,
          width: 400,
          fieldLabel: "หน่วยงานที่รับผิดชอบ",
          valueField: "id",
          displayField: "c_name",
          hiddenName: "dc_cost_id",
          name: "c_cost_name",
          triggerAction: "all",
          forceSelection: true,
          selectOnFocus: true,
          typeAhead: false,
          emptyText: "กรุณาเลือก...",
          validator: function (val) {
              if (!Ext.isEmpty(val)) {
                  return true;
              } else {
                  return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
              }
          },
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
      });
      var comboCost2 = new Ext.form.ComboBox({
          mode: "local",
          store: Ext.dc_cost,
          width: 400,
          readOnly: true,
          value: Ext.costID,
          fieldLabel: "หน่วยงานเจ้าของเรื่อง",
          valueField: "id",
          displayField: "c_name",
          hiddenName: "dc_cost2_id",
          name: "c_cost_name",
          triggerAction: "all",
          forceSelection: true,
          selectOnFocus: true,
          typeAhead: false,
          emptyText: "กรุณาเลือก...",
          validator: function (val) {
              if (!Ext.isEmpty(val)) {
                  return true;
              } else {
                  return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
              }
          },
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

          }
      });
      var comboTypeBg = new Ext.form.ComboBox({
          mode: "local",
          readOnly: true,
          store: Ext.dc_expense_budget_type,
          fieldLabel: "แหล่งเงิน",
          width: 400,
          submitValue: true,
          name: "dc_expense_budget_type_idTxt",
          hiddenName: "dc_expense_budget_type_id",
          //po_expense_group_id
          valueField: "id",
          displayField: "c_name",
          triggerAction: "all",
          forceSelection: true,
          selectOnFocus: true,
          typeAhead: false,
          emptyText: "กรุณาเลือกแหล่งเงิน...",
          validator: function (val) {
              if (!Ext.isEmpty(val)) {
                  return true;
              } else {
                  return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
              }
          },
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
      });
      var comboUsedBgYear = new Ext.form.ComboBox({
          mode: "local",
        //   readOnly: true,
          fieldLabel: "ปีงบประมาณ",
          submitValue: true,
          hiddenName: "i_year",
          name: "i_yyyy",
          store: Ext.store_year,
          valueField: "id",
          displayField: "c_name",
          value: Ext.bgYear,
          triggerAction: "all",
          forceSelection: true,
          selectOnFocus: true,
          typeAhead: false,
          emptyText: "กรุณาเลือกปีงบประมาณ...",
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
      });
      var comboExpense = new Ext.form.ComboBox({
          mode: "local",
          readOnly: true,
          store: Ext.po_expense,
          valueField: "id",
          displayField: "c_name",
          width: 400,
          submitValue: true,
          name: "c_detail",
          hiddenName: "po_expense_id",
          triggerAction: "all",
          allBlank: true,
          forceSelection: true,
          selectOnFocus: true,
          fieldLabel: "รายการย่อย",
          typeAhead: false,
          emptyText: "กรุณาเลือกใช้จ่าย...",
          validator: function (val) {
              if (!Ext.isEmpty(val)) {
                  return true;
              } else {
                  return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
              }
          },
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
                  console.log(this);
              },
          },
      });
      var columnMini = [
          {
              header: "ID System",
              sortable: true,
              hidden: true,
              dataIndex: "id",
          },
          {
              header: "เลขที่ใบเบิก",
              sortable: true,
              dataIndex: "c_code",
          },
          {
              header: "รายการ­",
              sortable: true,
              id: "c_name",
              dataIndex: "c_name",
              renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                  metaData.attr = "style='cursor:pointer';";
                  return value;
              },
          },
      ];

      var statusx = statuss;

      if (statusx == "add") {
          Ext.getCmp("tabpanel1").getSelectionModel().clearSelections();
      }
      // var typeTor = ;
      var bgProject = new Ext.form.ComboBox({
          mode: "local",
          store: Ext.bgProject,
          id: "projectID",
          anchor: "100%",
          fieldLabel: "ชื่อโครงการ",
          submitValue: true,
          hiddenName: "bg_budget_dtl_project_id",
          name: "c_budget_dtl_project_id",
          valueField: "id",
          displayField: "c_name",
          triggerAction: "all",
          forceSelection: false,
          selectOnFocus: true,
          typeAhead: false,
          emptyText: "กรุณาเลือก",
          validator: function (val) {
              if (!Ext.isEmpty(val)) {
                  return true;
              } else {
                  return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
              }
          },
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
      });
 
      var col2 = [
          new Ext.grid.RowNumberer({width: 35, header: " No ", dataIndex: "no"}),
          {
              id: "edit",
              header: "-",
              sortable: false,
              align: "center",
              width: 2,
              dataIndex: "id",
              renderer: function (value, metaData, record, row, col, store, gridView) {
                  return "<button style='font-size:11px; cursor:pointer; color: green;'>แก้ไข</button>";
              },
          },
          {
              id: "delete",
              header: "-",
              sortable: false,
              align: "center",
              width: 1.5,
              dataIndex: "id",
              renderer: function (value, metaData, record, row, col, store, gridView) {
                  return "<button style='font-size:11px; cursor:pointer; color: red;'>ลบ</button>";
              },
          },
          {header: "ID System", hidden: true, dataIndex: "id"},
          {
              header: "ผู้ชนะ",
              dataIndex: "dc_creditor_name",
              width: 20,
              renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                  value = String(value);
                  if (value.substring(0, 3) == "รวม") {
                      metaData.attr = "style='font-weight:bold;color:blue'; align='right'";
                  } else {
                      metaData.attr = "";
                  }
                  return value; //DategetShortDateMonthName(value);
              },
          },
          {width: 1, dataIndex: ""},
                  //  {header: "รวม VAT", dataIndex: 'f_unit_cost_vat', align: 'right', width: 25, },
                  //             {
                  //                 header: "บันทึกรายละเอียดในงวดงาน",
                  //                 sortable: false,
                  //                 hideable: false, draggable: false,
                  //                 align: 'center',
                  //                 id: 'edit21',
                  //                 width: 25,
                  //                 dataIndex: 'id',
                  //                 renderer: function (value, metaData, record, row, col, store, gridView) {
                  //                     if (record.get('id') == "grandtotal" || record.get('i_is_dtl')) {
                  //                         return '';
                  //                     } else {
                  //                         if (record.get('buStatus') == true) {
                  //                             return '<img src="../images/icons/document_edit.gif"); style="cursor:pointer"/>';
                  //                         } else {
                  //                             return record.get('buStatus');
                  //                         }
                  //                     }
                  //                 }
                  //             }
      ];

      var disp = false ? "displayfield" : "textfield";
      if (!Ext.isEmpty(Ext.getCmp("winChequeID"))) {
          Ext.getCmp("winChequeID").destroy();
      }
      return new Ext.Window({
          collapsible: true,
          maximizable: true,
          title: Ext.title,
          width: 1000,
          id: "winChequeID",
          height: 500,
          minWidth: 850,
          minHeight: 450,
          layout: "fit",
          modal: true,
          plain: true,
          bodyStyle: "padding:1px;",
          buttonAlign: "center",
          items: [
              new Ext.FormPanel({
                  id: Ext.poFormID,
                  columnWidth: 1,
                  url: "tor/api/mnTorController.php",
                  frame: true,
                  autoScroll: true,
                  labelAlign: "left",
                  bodyStyle: "padding:1px",
                  labelWidth: 120,
                  items: [
                      {
                          //   layout: "column",
                          border: false,
                          items: [
                              {
                                  columnWidth: 0.6,
                                  layout: "form",
                                  border: true,
                                  items: [
                                      {
                                          xtype: "hidden",
                                          name: "id",
                                          id: "torHdrID", 
                                      },
                                      {
                                        xtype: "hidden",
                                        name: "confirm_overlap",
                                        id: "confirm_overlapID", 
                                        value : 1,
                                    },
                                    {
                                        xtype: "hidden",
                                        name: "i_is_overlap",
                                        id: "i_is_overlapID", 
                                        value :  2,
                                    },
                                    {
                                        xtype: "hidden",
                                        name: "i_type_bg",
                                        id: "i_type_bgID", 
                                        value : 4,
                                    },
                                      {
                                        xtype: "hidden",
                                        name: "sp_tor_contract_id",
                                        id: "sp_tor_contract_idID", 
                                    },
                                        {
                                            xtype: "hidden",
                                            name: "dc_department_id",
                                            id: "dc_department_idID", 
                                        },
                                        {
                                            xtype: disp,
                                            readOnly: true,
                                            fieldLabel: "เลขที่สัญญา",
                                            id: "codeHdrID",
                                            style: "text-align: center;font-weight:bold;background:#eee;",
                                            readOnly: true,
                                            name: "c_code",
                                        },
                                        {
                                            xtype: "textfield",
                                            fieldLabel: "ผู้ขายผู้รับจ้าง",
                                            width: 300,  
                                            // id: "codeHdrID",
                                            //   style: "text-align: center;font-weight:bold;background:#eee;",
                                            readOnly: true,
                                            name: "inv_name",
                                        },
                                        {
                                            xtype: "textfield",
                                            fieldLabel: "เลขประจำตัวผู้เสียภาษี",
                                            // id: "codeHdrID",
                                            // style: "text-align: center;font-weight:bold;background:#eee;",
                                            readOnly: true,
                                            name: "c_tax_number_imp",
                                        },
                                        {
                                            xtype: "textarea",
                                            width: 500,
                                            height: 35,
                                            readOnly: true,
                                            fieldLabel: "เรื่อง/โครงการ",
                                            name: "c_name",
                                        },
                                    //   {
                                    //     xtype: "datefield",
                                    //     width: 500,
                                    //     height: 35,
                                    //     readOnly: true,
                                    //     fieldLabel: "ผู้ขายผู้รับจ้าง",
                                    //     name: "inv_name",
                                    // },
                                    // {
                                    //     xtype: "datefield",
                                    //     width: 500,
                                    //     height: 35,
                                    //     readOnly: true,
                                    //     fieldLabel: "เลขที่ประจำตัวผู้เสียภาษี",
                                    //     name: "c_tax_number_imp",
                                    // },
                                      comboUsedBgYear,
                                      // {
                                      //   xtype: "displayfield",
                                      //   fieldLabel: "ชื่อโครงการ",
                                      //   name: "c_budget_dtl_project",
                                      // },
                                      comboTypeBg,
                                      comboExpense,
                                      comboCost,
                                      comboCost2,
                                      {
                                          xtype: "buttongroup",
                                          fieldLabel: "วันที่เริ่มเอกสาร",
                                          frame: false,
                                          border: false,
                                          items: [
                                              {
                                                  xtype: "datefield",
                                                  name: "d_doc_date",
                                                  readOnly: true,
                                                  validator: function (val) {
                                                      if (!Ext.isEmpty(val)) {
                                                          return true;
                                                      } else {
                                                          return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                                      }
                                                  },
                                              },
                                              {
                                                  xtype: "tbspacer",
                                                  width: 18,
                                              },
                                              {
                                                  xtype: "label",
                                                  style: {
                                                      color: "red",
                                                      width: "100px",
                                                  },
                                                //   text: "* วันที่ตามเอกสาร PR",
                                              },
                                          ],
                                      },
                                      {
                                        xtype: "buttongroup",
                                        fieldLabel: "วันที่สิ้นสุดสัญญา",
                                        frame: false,
                                        border: false,
                                        items: [
                                            {
                                                xtype: "datefield",
                                                name: "d_due_date",
                                                readOnly: true,
                                                validator: function (val) {
                                                    if (!Ext.isEmpty(val)) {
                                                        return true;
                                                    } else {
                                                        return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                                    }
                                                },
                                            },
                                            {
                                                xtype: "tbspacer",
                                                width: 18,
                                            },
                                            {
                                                xtype: "label",
                                                style: {
                                                    color: "red",
                                                    width: "100px",
                                                },
                                                // text: "* วันที่ตามเอกสาร PR",
                                            },
                                        ],
                                    },
                                      {
                                          xtype: "combo",
                                          readOnly: true,
                                          mode: "local",
                                          store: Ext.torType,
                                          anchor: "40%",
                                          fieldLabel: "วิธีดำเนินงาน",
                                          submitValue: true,
                                          hiddenName: "tor_type_id",
                                          name: "c_type_id",
                                          id: "tor_type_idID",
                                          valueField: "id",
                                          displayField: "c_name",
                                          triggerAction: "all",
                                          forceSelection: false,
                                          selectOnFocus: true,
                                          typeAhead: false,
                                          emptyText: "กรุณาเลือก",
                                          validator: function (val) {
                                              if (!Ext.isEmpty(val)) {
                                                  return true;
                                              } else {
                                                  return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                              }
                                          },
                                          listeners: {
                                              afterrender: function () {
                                                  this.fn = function () {
                                                      if (this.getValue() == 1) {
                                                          //tor_type_id === 1 (เจาะจง)
                                                          Ext.getCmp("lableLessID").show();
                                                      } else {
                                                          Ext.getCmp("lableLessID").hide();
                                                      }
                                                  };
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
                                      },
                                      /*{
                                          xtype: "displayfield",
                                          fieldLabel: "แบบ ",
                                          name: "lableLess",
                                          value: Ext.tor_type_idTxt.tor_type_id1[Ext.i_is_more], //i_is_more
                                          id: "lableLessID",
                                          listeners: {
                                              beforerender: function () {},
                                              afterrender: function () {
                                                  this.fn = function () {
                                                      var tor_type_idID = Ext.getCmp("tor_type_idID").getValue();
                                                      if (Ext.getCmp("tor_type_idID").getValue() != 1) {
                                                          this.hide();
                                                      } else {
                                                          this.show();
                                                      }
                                                  };
                                                  this.fn();
                                              },
                                          },
                                      },*/
                                      {
                                          xtype: "buttongroup",
                                          fieldLabel: "จำนวนเงิน",
                                          frame: false,
                                          border: false,
                                          items: [
                                              {
                                                  xtype: "textfield",
                                                  readOnly: true,
                                                  fieldLabel: "จำนวนเงิน",
                                                  name: "f_total_amt",
                                                  id: "f_totalID",
                                                  listeners: {
                                                      blur: function () {
                                                          this.fn();
                                                      },
                                                      afterrender: function () {
                                                          this.fn = function () {
                                                              var val = 0;
                                                              val = this.getValue();
                                                              var f_total = parseFloat(val.replace(/,/g, "") / 1);
                                                              this.setValue(Ext.floatRenderer(f_total));
                                                          };
                                                          this.fn();
                                                      },
                                                  },
                                              },
                                          ],
                                      },
                                      {
                                          xtype: "textfield",
                                          readOnly: true,
                                          fieldLabel: "รหัสเอกสารอ้างอิง",
                                          name: "d_doc_ref",
                                      },
                                      {
                                          xtype: "textarea",
                                          width: 400,
                                          name: "c_comment",
                                          //
                                      },
                                      {
                                          xtype: "radiogroup",
                                          columns: [180],
                                          fieldLabel: "โหมดการบันทึก",
                                          id: "modesubID",
                                          style: {
                                              "font-weight": "bold",
                                          },
                                          items: [
                                              {
                                                  name: "mode",
                                                  checked: true,
                                                  inputValue: "UPDATE_OVERLAP2",
                                                  boxLabel: "อัพเดทรายการ",
                                              },
                                          ],
                                      },
                                      {
                                          title: "ข้อมูลผู้ชนะ ",
                                          id: "tabpanelMainID3",
                                          hidden: true, // ยังไม่ได้ใช้ ซ่อนไว้ก่อนน้าาา
                                          layout: "form",
                                          items: [
                                              {
                                                  xtype: "grid",
                                                  id: "gridSub2ID",
                                                  border: true,
                                                  stripeRows: true,
                                                  loadMask: true,
                                                  width: 1000,
                                                  height: 300,
                                                  store: Ext.store2,
                                                  tbar: [
                                                      {
                                                          xtype: "button",
                                                          iconCls: "icon-add",
                                                          text: "เพิ่มผู้ชนะ",
                                                          handler: function () {
                                                              AddTor({}, "ADD");
                                                          },
                                                      },
                                                      {
                                                          xtype: "button",
                                                          iconCls: "icon-excel",
                                                          hidden: true,
                                                          text: "นำเข้า xls",
                                                          handler: function () {},
                                                      },
                                                  ],
                                                  columns: col2,
                                                  viewConfig: {forceFit: true},
                                                  listeners: {
                                                      afterRender: function (thisForm, options) {
                                                          this.on("cellclick", cellClick, this); //cellClick
                                                      },
                                                  },
                                              },
                                          ],
                                      },
                                  ],
                              },
                              {
                                  columnWidth: 0.4,
                                  layout: "table",
                              },
                          ],
                      },
                  ],
                  listeners: {
                      afterterrender: function () {
                          Ext.getCmp("winChequeID").setHeight(Ext.getCmp("tabpanel1").getSize().height - 110);
                          alert();
                      }
                  },
                  buttonAlign: "center",
                  buttons: [
                      {
                          text: "บันทึกรายการ",
                          id: "buSaveSubID",
                          iconCls: "icon-save",
                          handler: function () {
                            Ext.Msg.show({
                                title: "แจ้งเตือน!",
                                    msg: "คุณต้องการยืนยันรายการกันเหลื่อม  "+ Ext.selectRow.data.c_code,
                                    width: 400,
                                    icon: Ext.MessageBox.WARNING,
                                    buttons: Ext.MessageBox.YESNO,
                                    fn: function (btn, text) {
                                        if (btn === "yes"){
                                            var formSubmit = function () {
                                                form.submit({
                                                    waitMsg: "Saving Data...",
                                                    success: function (form, action) {
                                                        Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                                            Ext.getCmp("tabpanel1").getStore().reload();
                                                            Ext.selectRow = null;
                                                            Ext.getCmp("winChequeID").destroy();
                                                        });
                                                    },
                                                    failure: function (form, action) {
                                                        switch (action.failureType) {
                                                            case Ext.form.Action.CLIENT_INVALID:
                                                                Ext.Msg.alert("Failure", "Form fields may not be submitted with invalid values");
                                                                break;
                                                            case Ext.form.Action.CONNECT_FAILURE:
                                                                Ext.Msg.alert("Failure", "พลข้อผิดพลาดในการเชื่อต่อเครือข่าย");
                                                                break;
                                                            case Ext.form.Action.SERVER_INVALID:
                                                                Ext.Msg.alert("Failure", action.result.msg);
                                                        }
                                                    },
                                                });
                                            }; //END
                                            var form = Ext.getCmp(Ext.poFormID).getForm();
                                            if (form.isValid()) {
                                                if (Ext.getCmp("modesubID").getValue().inputValue === "VIEW") {
                                                } else if (Ext.getCmp("modesubID").getValue().inputValue === "DELETE") {
                                                    Ext.MessageBox.show({
                                                        title: "Icon Support",
                                                        msg: "คุณต้องการที่จะลบ รายการที่เลือกนี้ใช่ใหม ?",
                                                        buttons: Ext.MessageBox.OKCANCEL,
                                                        icon: Ext.MessageBox.WARNING,
                                                        fn: function (btn) {
                                                            if (btn === "ok") {
                                                                formSubmit(form);
                                                            } else {
                                                                return;
                                                            }
                                                        },
                                                    });
                                                } else {
                                                    formSubmit(form);
                                                }
                                            }
                                        } else {
                                            null;
                                        }
                                    },
                                });
                                },
                                //haddler
                        },
                        {
                            text: Ext.GLOBAL_BU_BACK_TH,
                            handler: function () {
                                Ext.getCmp("winChequeID").hide();
                                Ext.getCmp("winChequeID").destroy();
                            },
                        },
                    ],
                }),
            ],
        });
    };

    Ext.loadStore = function (status, show) {
        var statusx = status;
        var winx = show;
        if (statusx === "edit" && Ext.isEmpty(Ext.selectRow))
            Ext.Msg.alert("แจ้งเตือน", "กรุณา click เลือกข้อมูลที่จะแก้ไขใน data grid", function (form, action) {
                return false;
            });
        else
            Ext.dc_cost.reload({
                callback: function (recordx, operation, success) {
                    if (success) {
                        Ext.po_emp.reload({
                            callback: function (recordx, operation, success) {
                                if (success) {
                                    Ext.po_user_permission.reload({
                                        callback: function (recordx, operation, success) {
                                            if (success) {
                                                Ext.dc_expense_budget_type.reload({
                                                    callback: function (recordx, operation, success) {
                                                        if (success) {
                                                            Ext.po_expense_group.reload({
                                                                callback: function (recordx, operation, success) {
                                                                    if (success) {
                                                                        Ext.po_expense.reload({
                                                                            callback: function (recordx, operation, success) {
                                                                                if (success) {
                                                                                    //AppPoStore(statusx).show();

                                                                                    if (statusx == "add") {
                                                                                        Ext.HDR_ID = null;
                                                                                        Ext.selectRow = null;
                                                                                        Ext.i_is_more = 0;
                                                                                        var winApp = AppPoStore(statusx);
                                                                                        winApp.show();
                                                                                    } else if (statusx === "edit") {
                                                                                        //
                                                                                        Ext.HDR_ID = Ext.selectRow.data.id;
                                                                                        Ext.tor_type_id = Ext.selectRow.data.tor_type_id; // default start เจาะจงน้อวกว่า 5 แสน
                                                                                        Ext.i_is_more = Ext.selectRow.data.i_is_more;

                                                                                        if (!Ext.selectRow.get("po_expense_id"))
                                                                                            Ext.selectRow.set("po_expense_id", null);
                                                                                        if (!Ext.selectRow.get("po_creditor_id"))
                                                                                            Ext.selectRow.set("po_creditor_id", null);
                                                                                        if (!Ext.selectRow.get("dc_expense_budget_type_id"))
                                                                                            Ext.selectRow.set("dc_expense_budget_type_id", null);
                                                                                        if (!Ext.selectRow.get("bg_budget_dtl_project_id"))
                                                                                            Ext.selectRow.set("bg_budget_dtl_project_id", null);
                                                                                        if (!Ext.selectRow.get("dc_department_id"))
                                                                                            Ext.selectRow.set("dc_department_id", null);
                                                                                        if (!Ext.selectRow.get("dc_cost_id"))
                                                                                            Ext.selectRow.set("dc_cost_id", null);

                                                                                        var winApp = AppPoStore(statusx);
                                                                                        Ext.getCmp("winChequeID").items.items[0].getForm().loadRecord(Ext.selectRow);
                                                                                        winApp.show();
                                                                                        Ext.store2.setBaseParam("sp_tor_id", Ext.HDR_ID);
                                                                                        Ext.store2.load();
                                                                                    }

                                                                                    //
                                                                                }
                                                                            },
                                                                        }); //po_expense
                                                                    }
                                                                },
                                                            }); //po_expense_group
                                                        }
                                                    },
                                                }); //dc_expense_budget_type
                                            }
                                        },
                                    }); //po_user_permission
                                }
                            },
                        }); //po_emp
                    }
                },
            });
    };
    };
