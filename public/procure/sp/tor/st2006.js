/* global Ext, user_right_add, user_right_edit, user_right_delete */
Ext.AppUx = function (app, menu) {
  Ext.AppConfig();
  //interlizing
  Ext.menuCode = "ST0005"; //go to
  //
  Ext.status = Ext.runStatus(menu);
  Ext.storeDtl.setBaseParam("type_menu", 2); //set สายงาน
  //Load
  var AppPoStore = function (statuss) {
    var comboCost = new Ext.form.ComboBox({
      mode: "local",
      readOnly: true,
      store: Ext.dc_cost,
      anchor: "100%",
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
      anchor: "100%",
      readOnly: true ,
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
    var comboUsedBgYear = new Ext.form.ComboBox({
      mode: "local",
      readOnly: true,
      fieldLabel: "ปีงบประมาณ",
      submitValue: true,
      hiddenName: "i_yyyy",
      name: "i_year",
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
    var col1 = [
      new Ext.grid.RowNumberer({ width: 35, header: " No ", dataIndex: "no" }),
      { header: "ID System", hidden: true, dataIndex: "id" },
      { header: "งวดที่", align: "center", dataIndex: "i_seq", width: 10 },
      {
        header: "วันที่ส่งมอบ",
        align: "center",
        dataIndex: "d_period_date",
        width: 25,
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          if (value == "รวม") {
            metaData.attr = "style='font-weight:bold;color:blue'; align='right'";
            return Ext.floatRenderer(value);
          } else {
            metaData.attr = "";
            if (record.get("i_is_dtl")) {
              return "";
            } else {
              return DategetShortDateMonthName(value);
            }
          }
        },
      },
      {
        header: "รายละเอียด จัดซื้อ",
        dataIndex: "c_name",
        width: 35,
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          if (value.substring(0, 3) == "รวม") {
            metaData.attr = "style='font-weight:bold;color:blue'; align='right'";
          } else {
            metaData.attr = "";
          }
          return value; //DategetShortDateMonthName(value);
        },
      },
      { header: "จำนวน", dataIndex: "f_quan", width: 20, align: "right" },
      { header: "ก่อน VAT", dataIndex: "f_unit_cost", align: "right", width: 25 },
      { header: "รวม VAT", dataIndex: "f_unit_cost_vat", align: "right", width: 25 },
      {
        header: "บันทึกรายละเอียดในงวดงาน",
        sortable: false,
        hideable: false,
        draggable: false,
        align: "center",
        id: "edit21",
        width: 25,
        dataIndex: "id",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          if (record.get("id") == "grandtotal" || record.get("i_is_dtl")) {
            return "";
          } else {
            if (record.get("buStatus") == true) {
              return '<img src="../images/icons/document_edit.gif"); style="cursor:pointer"/>';
            } else {
              return record.get("buStatus");
            }
          }
        },
      },
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
          listeners: {
            afterrender: function() {
                Ext.getCmp("i_pr_type1ID").setValue(Ext.selectRow.json.i_pr_type1);
                Ext.getCmp("i_pr_type2ID").setValue(Ext.selectRow.json.i_pr_type2);
                Ext.getCmp("i_pr_type3ID").setValue(Ext.selectRow.json.i_pr_type3);
                Ext.getCmp("f_type_amtID").setValue(Ext.selectRow.json.f_total_amt);
                Ext.getCmp("f_type_amtID2").setValue(Ext.selectRow.json.f_type2_amt);
                Ext.getCmp("f_type_amtID3").setValue(Ext.selectRow.json.f_type3_amt);
            },
        },
          items: [
            {
              layout: "column",
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
                      id: "torHdrID", //i_is_more
                    },
                    {
                      xtype: "hidden",
                      name: "dc_emp_id",
                      id: "dc_emp_idID", //i_is_more
                    },
                    {
                      xtype: "hidden",
                      name: "sp_emp_id",
                      id: "sp_emp_idID", //i_is_more
                    },
                    {
                      xtype: "hidden",
                      name: "dc_department_id",
                      id: "dc_department_idID", //i_is_more
                    },
                    {
                      xtype: disp,
                      readOnly: true,
                      fieldLabel: "รหัส PR",
                      id: "codeHdrID",
                      style: "text-align: center;font-weight:bold;background:#eee;",
                      readOnly: true,
                      name: "c_code",
                    },
                    {
                      xtype: "textarea",
                      width: 500,
                      height : 35 ,
                      fieldLabel: "เรื่อง/โครงการ",
                      name: "c_name",
                    },
                    comboUsedBgYear,
                    // { xtype: "displayfield", fieldLabel: "ชื่อโครงการ", name: "c_budget_dtl_project" },
                    comboCost,
                    comboCost2,
                    {
                      xtype: "buttongroup",
                      fieldLabel: "วันที่",
                      frame: false,
                      border: false,
                      items: [
                        {
                          xtype: "datefield",
                          name: "d_tor_date",
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
                          text: "* วันที่บันทึกรายการ",
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
                    {
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
                    },
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
                      xtype: "buttongroup",
                      fieldLabel: "วันที่บันทีกแจ้งเตือน",
                      frame: false,
                      border: false,
                      items: [
                        {
                          xtype: "datefield",
                          name: "DateAdd1",
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
                          text: "* แจ้งเตือน จากวันถัดไป " + Ext.menu_i_alarm + " วัน",
                        },
                      ],
                    },
                    {
                      xtype: "buttongroup",
                      fieldLabel: "วันที่บันทีก PA",
                      frame: false,
                      border: false,
                      items: [
                        {
                          xtype: "datefield",
                          name: "DateAdd2",
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
                            width: "150px",
                          },
                          text: "* นับ PA จากวันถัดไป " + Ext.menu_i_day + " วัน",
                        },
                      ],
                    },
                    {
                      fieldLabel: "วันที่บันทึก",
                      xtype: "datefield",
                      name: "d_tor_status_date",
                      validator: function (val) {
                        if (!Ext.isEmpty(val)) {
                          return true;
                        } else {
                          return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                        }
                      },
                    },
                    {
                      xtype: "textarea",
                      width: 400,
                      name: "c_comment",
                      //
                    },
                    Ext.getBodyMultiBudget(Ext.selectRow,'st2006'),
                    {
                      xtype: "radiogroup",
                      columns: [180],
                      fieldLabel: "โหมดการบันทึก",
                      id: "modesubID",
                      hidden: true,
                      style: {
                        "font-weight": "bold",
                      },
                      items: [
                        {
                          name: "mode",
                          checked: true,
                          inputValue: "UPDATEFORMSTSATUS",
                          boxLabel: "อัพเดทรายการ",
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
          buttonAlign: "center",
          buttons: [
            {
              text: "บันทึกรายการ",
              id: "buSaveSubID",
              iconCls: "icon-save",
              handler: function () {
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
                                            Ext.HDR_ID = Ext.selectRow.data.po_working_hdr_id;
                                            Ext.tor_type_id = Ext.selectRow.data.tor_type_id; // default start เจาะจงน้อวกว่า 5 แสน
                                            Ext.i_is_more = Ext.selectRow.data.i_is_more;

                                            if (!Ext.selectRow.get("po_expense_id")) Ext.selectRow.set("po_expense_id", null);
                                            if (!Ext.selectRow.get("po_creditor_id")) Ext.selectRow.set("po_creditor_id", null);
                                            if (!Ext.selectRow.get("dc_expense_budget_type_id")) Ext.selectRow.set("dc_expense_budget_type_id", null);
                                            if (!Ext.selectRow.get("bg_budget_dtl_project_id")) Ext.selectRow.set("bg_budget_dtl_project_id", null);
                                            if (!Ext.selectRow.get("dc_department_id")) Ext.selectRow.set("dc_department_id", null);
                                            if (!Ext.selectRow.get("dc_cost_id")) Ext.selectRow.set("dc_cost_id", null);

                                            var winApp = AppPoStore(statusx);
                                            Ext.getCmp("winChequeID").items.items[0].getForm().loadRecord(Ext.selectRow);
                                            winApp.show();
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
