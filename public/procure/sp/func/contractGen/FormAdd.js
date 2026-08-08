Ext.HDR_ID = null;

const saveHdr = function (type) {
  let msg = "";

  if (msg == "") {
    Ext.getCmp("frm-Add").getEl().mask("Please wait...", "x-mask-loading");
    Ext.Ajax.request({
      url: "api/mn_AmImpPurchase.php",
      method: "POST",
      params: {
        mode: Ext.getCmp("role-form-mode").getValue(),
        id: Ext.HDR_ID,
        c_name: Ext.getCmp("c_name").getValue(),
        c_comment: Ext.getCmp("c_comment").getValue(),
      },
      success: function (result, request) {
        Ext.getCmp("frm-Add").getEl().unmask();
        let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
        if (jsonData.success == true) {
          Ext.store.load({ params: { mode: "" } });
          Ext.getCmp("id").setValue(jsonData.id);
          Ext.getCmp("role-form-mode").setValue("EDIT");
          Ext.Msg.alert("แจ้งเตือน", "บันทึกเรียบร้อย");
          Ext.HDR_ID = jsonData.id;
          // ============ PanelDtl ============ //
          let PanelDtl = new formPanelDtl();
          Ext.getCmp("contenterCenter").add(PanelDtl);
          Ext.getCmp("contenterCenter").setActiveTab(PanelDtl);
        } else {
          Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg);
        }
      },
      failure: function (result, request) {
        Ext.MessageBox.alert("Failed", result.responseText); // connect error
      },
    });
  } else {
    Ext.Msg.alert("แจ้งเตือน", msg);
  }
}; // saveHdr

const summoney = function (type) {
                          var f_workin0 =Ext.getCmp("f_workin0").getValue() ? Ext.getCmp("f_workin0").getValue():"0.00"
                          var f_workin2 =Ext.getCmp("f_workin2").getValue() ? Ext.getCmp("f_workin2").getValue():"0.00"
                          var f_before  =Ext.getCmp("f_before").getValue() ? Ext.getCmp("f_before").getValue():"0.00"
                          var f_donate  =Ext.getCmp("f_donate").getValue() ? Ext.getCmp("f_donate").getValue():"0.00"
                          var sum = 0
                          f_workin0 = floatMinus(f_workin0.replace(/,/g, ""), 2)/1
                          f_workin2 = floatMinus(f_workin2.replace(/,/g, ""), 2)/1
                          f_before  = floatMinus(f_before.replace(/,/g, ""), 2)/1
                          f_donate  = floatMinus(f_donate.replace(/,/g, ""), 2)/1
                         
                          sum = f_workin0+f_workin2+f_before+f_donate
                          sum = (floatRenderer(floatMinus(sum, 2)))
                          Ext.getCmp("f_sum_hdr").setValue(sum)
}; // saveHdr

// Class Extend
formAdd = function (args) {
  formAdd.superclass.constructor.call(this, {
    region: "center",
    title: "ข้อมูลการตรวจรับ",
    iconCls: "icon-application-form-add",
    id: "frm-Add",
    border: false,
    stripeRows: true,
    loadMask: true,
    listeners: {
      afterrender: function (obj, eOpts) {},
    },
    items: [
      {
        xtype: "form",
        id: "form-widgets",
        frame: true,
        labelAlign: "right",
        labelWidth: 200,
        bodyStyle: { padding: "10px 20px" },
        defaults: { anchor: "100%", msgTarget: "side", allowBlank: false },
        items: [
          {
            xtype: "container",
            layout: "hbox",
            align: "stretch",
            RemoveHeight: true,
            defaults: { xtype: "fieldset", flex: 1, margins: "0px 3px", autoHeight: true },
            items: [
              {
                columnWidth: 0.8,
                title: "ข้อมูลการตรวจรับ",
                RemoveCls: "x-box-item",
                collapsible: true,
                collapsed: false,
                defaults: { labelStyle: "width:200px;", allowBlank: true },
                items: [
                  {
                    xtype: "hidden",
                    id: "id",
                    name: "id",
                    readOnly: true,
                  },{
                    xtype: "hidden",
                    id: "c_system",
                    name: "c_system",
                    readOnly: true,
                  },{
                    xtype: "hidden",
                    id: "po_expense_id",
                    name: "po_expense_id",
                    readOnly: true,
                  },{
                    xtype: "hidden",
                    id: "dc_creditor_id",
                    name: "dc_creditor_id",
                    readOnly: true,
                  },{
                    xtype: "hidden",
                    id: "tor_id",
                    name: "tor_id",
                    readOnly: true,
                  },{
                    xtype: "hidden",
                    id: "sp_tor_contract_id",
                    name: "sp_tor_contract_id",
                    readOnly: true,
                  },{
                    xtype: "hidden",
                    id: "sp_tor_hdr_period_id",
                    name: "sp_tor_hdr_period_id",
                    readOnly: true,
                  },{
                    xtype: "hidden",
                    id: "sp_check_period_hdr_id",
                    name: "sp_check_period_hdr_id",
                    readOnly: true,
                  },{
                    xtype: "hidden",
                    id: "tor_type_id",
                    name: "tor_type_id",
                    readOnly: true,
                  },{
                    xtype: "hidden",
                    id: "dc_expense_budget_type_id",
                    name: "dc_expense_budget_type_id",
                    readOnly: true,
                  },{
                    xtype: "hidden",
                    id: "dc_cost_id",
                    name: "dc_cost_id",
                    readOnly: true,
                  },{
                    xtype: "hidden",
                    id: "dc_cost_acc_id",
                    name: "dc_cost_acc_id",
                    readOnly: true,
                    
                  },{
                    /*จำนวนเงินงานระหว่างดำเนินการ คงเหลือจากงวดก่อน */
                    xtype: "hidden",
                    id: "f_wip_after",
                    name: "f_wip_after",
                    readOnly: true,
                  },{
                    xtype: "hidden",
                    id: "f_total",
                    name: "f_total",
                    readOnly: true,
                  },{
                    xtype: "textfield",
                    fieldLabel: "เลขที่ตรวจรับ",
                    id: "c_code_check",
                    name: "c_code_check",
                    readOnly: true,
                    width: 150,
                    style: {
                      background: "#f1f1f1",
                      color: "#000000",
                      // border: "1px solid #f1f1f1",
                    },
                  },{
                    xtype: "textfield",
                    fieldLabel: "เลขที่ใบขอเบิก",
                    id: "c_code_d",
                    name: "c_code_d",
                    readOnly: true,
                    width: 150,
                  }, {
                    xtype: "datefield",
                    id: "d_checking_date",
                    name: "d_checking_date",
                    value: addY(543),
                    fieldLabel: "วันที่ตรวจรับ",
                    readOnly: true,
                    width: 150
                  }, {
                    xtype: "datefield",
                    id: "d_arrive_date",
                    name: "d_arrive_date",
                    value: addY(543),
                    fieldLabel: "วันที่รับของ",
                    readOnly: true,
                    width: 150
                  },{
                    xtype: "textfield",
                    fieldLabel: "เลขที่สัญญา",
                    id: "c_code",
                    name: "c_code",
                    readOnly: true,
                    width: 150,
                  },{
                    xtype: "datefield",
                    id: "d_doc_date",
                    name: "d_doc_date",
                    value: addY(543),
                    fieldLabel: "วันที่ทำสัญญา",
                    readOnly: true,
                    width: 150
                  },{
                    xtype: "textarea",
                    fieldLabel: "ชื่อโครงการ",
                    id: "c_name",
                    name: "c_name",
                    readOnly: true,
                    width: 450,
                  },{
                    xtype: "textfield",
                    fieldLabel: "วิธีการได้มา",
                    id: "tor_type_name",
                    name: "tor_type_name",
                    readOnly: true,
                    width: 150,
                  },{
                    xtype: "textfield",
                    fieldLabel: "งวดที่",
                    id: "i_period",
                    name: "i_period",
                    readOnly: true,
                    width: 40,
                  },{
                    xtype: "textfield",
                    fieldLabel: "หน่วยงาน",
                    id: "c_cost_name",
                    name: "c_cost_name",
                    readOnly: true,
                    width: 450,
                  },{
                    xtype: "textfield",
                    fieldLabel: "แหล่งเงิน",
                    id: "c_budget_type",
                    name: "c_budget_type",
                    readOnly: true,
                    width: 450,
                  },{
                    xtype: "textfield",
                    fieldLabel: "จำนวนเงินได้ของ",
                    id: "f_workin0",
                    name: "f_workin0",
                    readOnly: true,
                    width: 100,
                    style: {
                        labelAlign: "right",
                        "font-weight": "bold",
                        padding: "1px",
                        margin: "1px",
                        color: "blue",
                        "background-color": "#fff",
                        "text-align": "right",
                    } 
                  },{
                    xtype: "textfield",
                    fieldLabel: "จำนวนเงินระหว่างดำเนินการ",
                    id: "f_workin1",
                    name: "f_workin1",
                    readOnly: true,
                    width: 100,
                    style: {
                        labelAlign: "right",
                        "font-weight": "bold",
                        padding: "1px",
                        margin: "1px",
                        color: "blue",
                        "background-color": "#fff",
                        "text-align": "right",
                    } 
                  },{
                    xtype: "textfield",
                    fieldLabel: "จำนวนเงินระหว่างดำเนินการ/ได้ของ",
                    id: "f_workin2",
                    name: "f_workin2",
                    readOnly: true,
                    width: 100,
                    style: {
                        labelAlign: "right",
                        "font-weight": "bold",
                        padding: "1px",
                        margin: "1px",
                        color: "blue",
                        "background-color": "#fff",
                        "text-align": "right",
                    } 
                  }
                  ,
                  // {
                  //   xtype: "textfield",
                  //   fieldLabel: "แหล่งเงิน",
                  //   id: "dc_creditor_name",
                  //   name: "dc_creditor_name",
                  //   readOnly: true,
                  //   width: 450,
                  // }

                    
                ],
              },
                {
                  columnWidth: 0.2,
                  xtype: "fieldset",
                  id: "win-chequeID2",
                  labelWidth: 200,
                  title: "เงินที่ไม่ได้อยู่งวด",
                  listeners: {
                    afterrender: function (obj, eOpts) {},
                  },
                  items: [
                    {
                      xtype: "textfield",
                      fieldLabel: "เงินระหว่างดำเนินการ(งวดก่อนหน้า)",
                      id: "f_before",
                      name: "f_before",
                      
                      width: 100,
                      style: {
                          labelAlign: "right",
                          "font-weight": "bold",
                          padding: "1px",
                          margin: "1px",
                          enableKeyEvents: true,
                          color: "blue",
                          "background-color": "#fff",
                          "text-align": "right",
                      } ,
                      listeners: {
                        afterrender: function () {
                          this.fn = function () {
                            this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                          };
                        },
                        focus: function (value) {
                          this.setValue(this.getValue().replace(/,/g, ""));
                        },
                        Change: function (value) {
                          this.fn();
                          
                          summoney();
                          
                        },
                        keyup: function () {
                          // f_per_pay_sum();
                        },
                      },
                    },{
                      xtype: "textfield",
                      fieldLabel: "จำนวนเงินบริจาค",
                      id: "f_donate",
                      name: "f_donate",
                      
                      width: 100,
                      style: {
                          labelAlign: "right",
                          "font-weight": "bold",
                          padding: "1px",
                          margin: "1px",
                          enableKeyEvents: true,
                          color: "blue",
                          "background-color": "#fff",
                          "text-align": "right",
                      } ,
                      listeners: {
                        afterrender: function () {
                          this.fn = function () {
                            this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                          };
                        },
                        focus: function (value) {
                          this.setValue(this.getValue().replace(/,/g, ""));
                        },
                        Change: function (value) {
                          this.fn();
                          summoney();

                        },
                        keyup: function () {
                          // f_per_pay_sum();
                        },
                      },
                    },
                  ]                 
                  },
                  
            ],
            
          },
/*
          new Ext.grid.EditorGridPanel({
            region: "center",
            layout: "fit",
            // title: "รายการบัญชี",
            id: "gridDtl",
            height: 350,
            // border: false,
            stripeRows: true,
            loadMask: true,
            clicksToEdit: 1,
            store: Ext.storeDtl,
            viewConfig: {
              forceFit: true,
              emptyText: "ไม่มีข้อมูล..",
              deferEmptyText: false,
            },
            listeners: {

            },
            tbar: [
              // {
              //   text: "โหลดผังบัญชีตามรายการย่อย",
              //   iconCls: "icon-refresh",
              //   handler: function (grid, rowIndex, colIndex) {
              //     // var msg = "";
              //     // var bg_expense_id = Ext.getCmp("bg_expense_id").getValue();
              //     // if (bg_expense_id) {
              //     //   Ext.dc_acc_expense.load({
              //     //     params: {
              //     //       bg_expense_id: Ext.getCmp("bg_expense_id").getValue(),
              //     //     },
              //     //     callback: function (records, operation, success) {
              //     //       if (Ext.dc_acc_expense.data.length) {
              //     //         Ext.example.msg("Success", "โหลดข้อมูลผังบัญชีสำเร็จ", 1);
              //     //         $(this).next("text copied");
              //     //         setTimeout(function () {
              //     //           $(this).next().remove();
              //     //         }, 2000);
              //     //       } else {
              //     //         msg += "<span style='white-space: nowrap;'>ไม่มีข้อมูลผังบัญชีในรายการย่อย</span><br>";
              //     //         Ext.MessageBox.alert("แจ้งเตือน", msg);
              //     //       }
              //     //     },
              //     //   });
              //     // } else {
              //     //   msg += "<span style='white-space: nowrap;'>- กรุณาระบุรายการย่อย</span><br>";
              //     //   Ext.MessageBox.alert("แจ้งเตือน", msg);
              //     // }
              //   },
              // },
              // { xtype: "tbfill" },
            ],
            columns: [
              new Ext.grid.RowNumberer(),
              {
                header: "เลขที่ตรวจรับ",
                sortable: false,
                width: 100,
                align: "center",
                dataIndex: "i_year",
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                  metaData.css = "cell-edit";
                  if (value != "" && value != undefined) {
                    metaData.attr = "style='text-align: left;'";
                    let name = getStoreItemsYear(Ext.store_year, value, "c_name");
                    return name;
                  } else {
                    metaData.attr = "style='text-align: center; color:red;'";
                    return "-";
                  }
                },
              },
              {
                header: "เลขที่ใบขอเบิก",
                sortable: false,
                width: 100,
                align: "center",
                dataIndex: "dc_expense_budget_type_id",
                editor: new Ext.form.ComboBox({
                  mode: "local",
                  id: "editor_dc_expense_budget_type_id",
                  store: Ext.dc_expense_budget_type,
                  valueField: "id",
                  displayField: "c_name",
                  triggerAction: "all",
                  forceSelection: true,
                  selectOnFocus: true,
                  typeAhead: false,
                  emptyText: "กรุณาเลือก...",
                  
                }),
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                  metaData.css = "cell-edit";
                  if (value != "" && value != undefined) {
                    metaData.attr = "style='text-align: left;'";
                    let name = getStoreItems(Ext.dc_expense_budget_type, value, "c_name");
                    return name;
                  } else {
                    metaData.attr = "style='text-align: center; color:red;'";
                    return "-";
                  }
                },
              },
              {
                header: "วันที่ตรวจรับ",
                sortable: false,
                width: 250,
                align: "center",
                dataIndex: "bg_dc_budget_type_id",
                editor: new Ext.form.ComboBox({
                  mode: "local",
                  id: "editor_bg_dc_budget_type_id",
                  store: Ext.bg_dc_budget_type,
                  valueField: "id",
                  displayField: "c_name",
                  triggerAction: "all",
                  forceSelection: true,
                  selectOnFocus: true,
                  typeAhead: false,
                  emptyText: "กรุณาเลือก...",
                  
                }),
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                  metaData.css = "cell-edit";
                  if (value != "" && value != undefined) {
                    metaData.attr = "style='text-align: left;'";
                    let name = getStoreItems(Ext.bg_dc_budget_type, value, "c_name");
                    return name;
                  } else {
                    metaData.attr = "style='text-align: center; color:red;'";
                    return "-";
                  }
                },
              },
              {
                header: "วันที่รับของ",
                sortable: false,
                align: "center",
                dataIndex: "f_budget_amt",
                width: 110,
                editor: new Ext.form.TextField({
                  style: "text-align: right; color:blue;",
                  listeners: {
                    afterrender: function () {
                      this.fn = function () {
                        this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                      };
                    },
                    Change: function (value) {
                      this.fn();
                    },
                  },
                }),
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                  metaData.css = "cell-edit";
                  if (value) {
                    metaData.attr = "style='text-align: right; color:blue;'";
                    return floatRenderer(floatMinus(value.replace(/,/g, ""), 2));
                  } else {
                    metaData.attr = "style='text-align: right; color:red;'";
                    return "-";
                  }
                },
              },
              {
                header: "เลขที่สัญญา",
                sortable: false,
                align: "center",
                dataIndex: "c_comment",
                width: 200,
                editor: new Ext.form.TextField({
                  listeners: {
                    afterrender: function () {
                      this.fn = function () {};
                    },
                    Change: function (value) {
                      this.fn();
                    },
                  },
                }),
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                  metaData.attr = "style='text-align: left; '";
                  metaData.css = "cell-edit";
                  return value;
                },
              },{
                header: "ชื่อโครงการ",
                sortable: false,
                align: "center",
                dataIndex: "c_comment",
                width: 200,
                editor: new Ext.form.TextField({
                  listeners: {
                    afterrender: function () {
                      this.fn = function () {};
                    },
                    Change: function (value) {
                      this.fn();
                    },
                  },
                }),
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                  metaData.attr = "style='text-align: left; '";
                  metaData.css = "cell-edit";
                  return value;
                },
              },{
                header: "วิธีการได้มา",
                sortable: false,
                align: "center",
                dataIndex: "c_comment",
                width: 200,
                editor: new Ext.form.TextField({
                  listeners: {
                    afterrender: function () {
                      this.fn = function () {};
                    },
                    Change: function (value) {
                      this.fn();
                    },
                  },
                }),
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                  metaData.attr = "style='text-align: left; '";
                  metaData.css = "cell-edit";
                  return value;
                },
              },{
                header: "งวดที่",
                sortable: false,
                align: "center",
                dataIndex: "c_comment",
                width: 200,
                editor: new Ext.form.TextField({
                  listeners: {
                    afterrender: function () {
                      this.fn = function () {};
                    },
                    Change: function (value) {
                      this.fn();
                    },
                  },
                }),
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                  metaData.attr = "style='text-align: left; '";
                  metaData.css = "cell-edit";
                  return value;
                },
              },{
                header: "หน่วยงาน",
                sortable: false,
                align: "center",
                dataIndex: "c_comment",
                width: 200,
                editor: new Ext.form.TextField({
                  listeners: {
                    afterrender: function () {
                      this.fn = function () {};
                    },
                    Change: function (value) {
                      this.fn();
                    },
                  },
                }),
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                  metaData.attr = "style='text-align: left; '";
                  metaData.css = "cell-edit";
                  return value;
                },
              },{
                header: "แหล่งเงิน",
                sortable: false,
                align: "center",
                dataIndex: "c_comment",
                width: 200,
                editor: new Ext.form.TextField({
                  listeners: {
                    afterrender: function () {
                      this.fn = function () {};
                    },
                    Change: function (value) {
                      this.fn();
                    },
                  },
                }),
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                  metaData.attr = "style='text-align: left; '";
                  metaData.css = "cell-edit";
                  return value;
                },
              },{
                header: "จำนวนเงินได้ของ",
                sortable: false,
                align: "center",
                dataIndex: "c_comment",
                width: 200,
                editor: new Ext.form.TextField({
                  listeners: {
                    afterrender: function () {
                      this.fn = function () {};
                    },
                    Change: function (value) {
                      this.fn();
                    },
                  },
                }),
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                  metaData.attr = "style='text-align: left; '";
                  metaData.css = "cell-edit";
                  return value;
                },
              },
              // {
              //   header: "จำนวนเงินระหว่างดำเนินการ",
              //   sortable: false,
              //   align: "center",
              //   dataIndex: "c_comment",
              //   width: 200,
              //   editor: new Ext.form.TextField({
              //     listeners: {
              //       afterrender: function () {
              //         this.fn = function () {};
              //       },
              //       Change: function (value) {
              //         this.fn();
              //       },
              //     },
              //   }),
              //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              //     metaData.attr = "style='text-align: left; '";
              //     metaData.css = "cell-edit";
              //     return value;
              //   },
              // },
              // {
              //   header: "จำนวนเงินระหว่างดำเนินรายการ/ได้ของ",
              //   sortable: false,
              //   align: "center",
              //   dataIndex: "c_comment",
              //   width: 200,
              //   editor: new Ext.form.TextField({
              //     listeners: {
              //       afterrender: function () {
              //         this.fn = function () {};
              //       },
              //       Change: function (value) {
              //         this.fn();
              //       },
              //     },
              //   }),
              //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
              //     metaData.attr = "style='text-align: left; '";
              //     metaData.css = "cell-edit";
              //     return value;
              //   },
              // },
              
              { width: 10, dataIndex: "" },
            ],
            autoExpandColumn: "dc_acc_id",
            // bbar: Ext.pagingBar,
          }),*/
        ],
        buttonAlign: "left",
        buttons: [
          /*{
            text: "&nbsp;" + Ext.GLOBAL_BU_SAVE_TH + "&nbsp;",
            id: "saveHdr",
            iconCls: "icon-save",
            disabled: Ext.butt == "add" || Ext.butt == "edit" ? false : true,
            handler: function () {
              saveHdr(false);
            },
          },*/
          {
            text: Ext.GLOBAL_BU_BACK_TH,
            handler: function () {
              Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
              Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
            },
          },
        ],
      },
    ] 
  });
}; // formAdd 
Ext.extend(formAdd, Ext.Panel, {});
