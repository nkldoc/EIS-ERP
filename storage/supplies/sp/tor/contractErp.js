/* global Ext, user_right_add, user_right_edit, user_right_delete */

let years = [];
years.push({ id: "0", c_name: "- เลือกทั้งหมด -" });

let currentTime = new Date();
let now = currentTime.getFullYear() + 1;
let id = currentTime.getFullYear() - 3;

while (id <= now) {
  let c_name = id + 543;
  years.push({ id, c_name });
  id++;
}

Ext.store_year = new Ext.data.JsonStore({
  fields: ["id", "c_name"],
  data: years,
});
function win_hdr_periodAll(event, rec, mode) {
  var ev = event;
  Ext.stotrePeriodDtl = rec;
  //    console.log(rec);
  if (mode == "ADD") {
    set_dc_expense_budget_type_id = rec.data.dc_expense_budget_type_id;
  } else {
    set_dc_expense_budget_type_id = rec.data.dc_bg_budget_type_id;
  }
  Ext.am_mode_acc = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_AmModeAcc.php",
    baseParams: {
      type: "am_mode_acc",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_code", "c_name"],
  });
  Ext.inv_mode_acc = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_AmModeAcc.php",
    baseParams: {
      type: "inv_mode_acc",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_code", "c_name"],
  });
  Ext.storeSumPeriod = new Ext.data.JsonStore({
    storeId: "myStore3",
    autoLoad: true,
    url: "tor/api/mnTorController.php",
    root: "data",
    baseParams: {
      mode: "storeSumPeriod",
      sp_tor_contract_id: Ext.SP_TOR_CONTRACT_ID,
      sp_tor_hdr_period_id: Ext.SP_TOR_HDR_PERIOD_ID, //rec.data.id,
      i_period: rec.data.i_period,
    }, //Permission i_read
    idProperty: "id",
    totalProperty: "totalCount",
    fields: [{ name: "f_total_amt" }, { name: "f_total_amt2", type: "string" }, { name: "sum_period" }, { name: "sum_period_hdr" }],
  });
  var tabs = new Ext.FormPanel({
    labelWidth: 175,
    bodyStyle: "padding:1px",
    id: "form-widgets",
    url: "tor/api/mnTorController.php",
    border: false,
    width: 800,
    listeners: {
      afterrender: function (obj, eOpts) {
        if (ev == "ADD") {
          //                    console.log(Ext.selectRow.dataf_total_amt);
          //                    console.log(Ext.storeSUMcontract.data.items[0].json.sum_period);
          var i_per = Ext.storeSUMcontract.data.items[0].json.sum_period + 1;
          Ext.getCmp("d_doc_dateID").setValue(Ext.selectRow.data.d_doc_date);
          Ext.getCmp("dc_expense_budget_type_id1TxtID").setValue(Ext.selectRow.data.dc_expense_budget_type_id);
          Ext.getCmp("i_alertID").setValue(7);
          Ext.getCmp("i_periodID").setValue(i_per);
          Ext.getCmp("f_total_amtID").setValue(Ext.selectRow.data.f_total_amt);
          Ext.getCmp("dc_creditor_per_text").setValue(Ext.selectRow.data.dc_creditor_idTxt);
        }

        if (Ext.selectRow.data.i_is_join_venture == 1) {
          Ext.getCmp("dc_creditor_idID_pop").show();
          Ext.getCmp("dc_creditor_per_text").hide();
        } else {
          Ext.getCmp("dc_creditor_idID_pop").hide();
          Ext.getCmp("dc_creditor_per_text").show();
        }

        switch (event) {
          case "SHOW":
            Ext.getCmp("buSaveSub2ID").hide();
            Ext.getCmp("buSaveEditID").hide();
            break;
          case "EDIT":
            Ext.getCmp("buSaveSub2ID").hide();
            Ext.getCmp("buSaveEditID").show();
            break;
          case "ADD":
            Ext.getCmp("buSaveSub2ID").show();
            Ext.getCmp("buSaveEditID").hide();
            break;
        }
      },
    },
    items: {
      xtype: "tabpanel",
      activeTab: 0,
      defaults: {
        autoHeight: true,
        bodyStyle: "padding:10px",
      },
      items: [
        {
          //title: "รายละเอียดงวดงานในสัญญา", //htmleditor
          layout: "form",
          defaults: { width: 500 },
          border: false,
          defaultType: "textfield",
          items: [],
        },
      ],
      listeners: {
        afterrender: function () {
          if (Ext.selectRow_PeridHdr != null) {
            // Ext.getCmp("dc_creditor_id2ID_Name").setValue()
            console.log(Ext.SelectStore);
            // console.log(Ext.SelectStore);
            // console.log(Ext.store3);
            Ext.getCmp("dc_creditor_per_idID").setValue(Ext.SelectStore.data.dc_creditor_period_id);
            Ext.getCmp("dc_creditor_id2ID_Name").setValue(Ext.SelectStore.data.dc_creditor_period_name);
          }
        },
      },
    },
  });
  Ext.storeUnitType.load({
    callback: function (recordx, operation, success) {
      if (success) {
        Ext.store3.reload({
          callback: function (recSum, operation, success) {
            if (success) {
              Ext.recSum = recSum;
              //sum period all
              var win = new Ext.Window({
                id: "win-frm-dtlID",
                collapsible: true,
                maximizable: true,
                title: "รายละเอียดของงวด PO ย่อย",
                width: Ext.getCmp("contenterCenter").getWidth() - 105,
                height: Ext.getCmp("contenterCenter").getHeight() - 50,
                layout: "fit",
                modal: true,
                plain: true,
                border: false,
                items: [
                  new Ext.FormPanel({
                    id: "frm-panel-proID",
                    url: "tor/api/mnTorController.php",
                    //                            xtype: 'panel',
                    layout: "column",
                    border: false,
                    items: [
                      {
                        //colxx
                        columnWidth: 0.5,
                        layout: "form",
                        labelWidth: 175,
                        bodyStyle: "padding:2px",
                        border: false,
                        items: [
                          {
                            xtype: "hidden",
                            name: "mode",
                            value: "UP_SP_TOR_HDR_PERIOD_NEW",
                          },
                          {
                            xtype: "hidden",
                            name: "sp_tor_hdr_period_id",
                            value: Ext.SP_TOR_HDR_PERIOD_ID,
                          },
                          {
                            xtype: "hidden",
                            name: "tor_id",
                            value: Ext.TOR_ID,
                          },
                          {
                            xtype: "hidden",
                            name: "sp_tor_contract_id",
                            value: Ext.SP_TOR_CONTRACT_ID,
                          },
                          {
                            xtype: "hidden",
                            name: "i_is_join_ventureID",
                            value: Ext.selectRow.data.i_is_join_venture,
                            //                                                    },
                            //                                                    {
                            //                                                        xtype: "hidden",
                            //                                                        name: "po_expense_id",
                            //                                                        value: Ext.selectRow.data.po_expense_id,
                          },
                          {
                            xtype: "hidden",
                            name: "c_name",
                            value: Ext.selectRow.data.c_name,
                          },
                          {
                            xtype: "hidden",
                            name: "i_qty",
                            value: 1,
                          },
                          {
                            xtype: "hidden",
                            name: "dc_unit_type_id",
                            value: 24,
                          },
                          {
                            xtype: "hidden",
                            name: "i_is_po",
                            value: Ext.I_IS_PO,
                          },
                          {
                            xtype: "hidden",
                            name: "i_is_purchase",
                          },
                          {
                            xtype: "hidden",
                            name: "ap_po_hdr_id",
                          },
                          {
                            fieldLabel: "งวดงานที่ .",
                            xtype: "numberfield",
                            style: "text-align: center",
                            name: "i_period",
                            id: "i_periodID",
                            width: 50,
                            validator: function (val) {
                              var regex = /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\.)?$/;
                              if (!regex.test(val)) {
                                return "กรุณากรอก ตัวเลข";
                                return true;
                              } else {
                                return true;
                              }
                            },
                          },
                          {
                            xtype: "checkbox",
                            id: "i_is_lastID",
                            name: "i_is_last",
                            height: 20,
                            boxLabel: "กรณีเป็นงวดสุดท้าย/งวดเดียว/PO จะมีการแจ้งเตือนก่อนหมดสัญญา",
                            inputValue: "1",
                          },
                          {
                            xtype: "datefield",
                            fieldLabel: "วันที่เริ่มนับการส่งของในงวด  ",
                            id: "d_doc_dateID",
                            name: "d_doc_date",
                            width: 100,
                            validator: function (val) {
                              if (Ext.isEmpty(val)) {
                                return "กรุณากรอก วันที่เริ่มนับการส่งของในงวด ";
                              } else {
                                return true;
                              }
                            },
                            listeners: {
                              change: function () {
                                d_doc_dateID_Change();
                              },
                            },
                          },
                          {
                            xtype: "radiogroup",
                            columns: [150, 200],
                            fieldLabel: "ลักษณะบันทึกวันส่งงวด",
                            id: "i_day_useID",
                            name: "i_day_use",
                            items: [
                              {
                                checked: true,
                                inputValue: 1,
                                name: "i_day_use_l",
                                boxLabel: "วันที่กำหนดส่งในงวดงาน",
                              },
                              {
                                inputValue: 0,
                                name: "i_day_use_l",
                                boxLabel: "จำนวนวันที่กำหนดส่งในงวดงาน",
                              },
                            ], //radiogroup
                            listeners: {
                              change: function () {
                                if (this.getValue().inputValue == 0) {
                                  Ext.getCmp("group_period_date").hide();
                                  Ext.getCmp("group_i_day").show();
                                } else {
                                  Ext.getCmp("group_period_date").show();
                                  Ext.getCmp("group_i_day").hide();
                                }
                              },
                            },
                          },
                          {
                            xtype: "buttongroup",
                            fieldLabel: "วันที่กำหนดส่งในงวดงาน  ",
                            id: "group_period_date",
                            width: 500,
                            frame: false,
                            border: false,
                            items: [
                              {
                                xtype: "datefield",
                                id: "d_period_dateID",
                                name: "d_period_date",
                                width: 100,
                                validator: function (val) {
                                  if (Ext.isEmpty(val)) {
                                    return "กรุณากรอก วันที่กำหนดส่งในงวดงาน  ";
                                  } else {
                                    return true;
                                  }
                                },
                                listeners: {
                                  change: function () {
                                    d_period_dateID_change();
                                  },
                                },
                              },
                              {
                                xtype: "tbspacer",
                                width: 18,
                              },
                              {
                                xtype: "displayfield",
                                id: "txt_d_period_dateID",
                                value: "",
                                width: 400,
                                style: {
                                  color: "red",
                                },
                              },
                            ],
                          },
                          {
                            xtype: "buttongroup",
                            fieldLabel: "จำนวนวันที่กำหนดส่งในงวดงาน  ",
                            id: "group_i_day",
                            hidden: true,
                            hideMode: "offsets",
                            width: 500,
                            frame: false,
                            border: false,
                            items: [
                              {
                                xtype: "textfield",
                                id: "i_dayID",
                                style: "text-align: center",
                                name: "i_day",
                                width: 50,
                                validator: function (val) {
                                  var regex = /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\.)?$/;
                                  if (!regex.test(val)) {
                                    return "กรุณากรอก ตัวเลข";
                                    return true;
                                  } else {
                                    return true;
                                  }
                                },
                                listeners: {
                                  change: function () {
                                    i_dayID_Change();
                                  },
                                },
                              },
                              {
                                xtype: "displayfield",
                                value: "วัน",
                              },
                              {
                                xtype: "tbspacer",
                                width: 18,
                              },
                              {
                                xtype: "displayfield",
                                id: "txt_i_dayID",
                                value: "",
                                width: 400,
                              },
                            ],
                          },
                          {
                            xtype: "buttongroup",
                            fieldLabel: "จำนวนวันที่แจ้งเตือน  ",
                            id: "group_i_alert",
                            frame: false,
                            border: false,
                            items: [
                              {
                                xtype: "textfield",
                                id: "i_alertID",
                                style: "text-align: center",
                                name: "i_alert",
                                width: 50,
                                validator: function (val) {
                                  var regex = /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\.)?$/;
                                  if (!regex.test(val)) {
                                    return "กรุณากรอก ตัวเลข";
                                    return true;
                                  } else {
                                    return true;
                                  }
                                },
                                listeners: {
                                  change: function () {
                                    i_alertID_Change();
                                  },
                                },
                              },
                              {
                                xtype: "displayfield",
                                value: "วัน",
                              },
                              {
                                xtype: "tbspacer",
                                width: 18,
                              },
                              {
                                xtype: "displayfield",
                                id: "txt_i_alertID",
                                value: "",
                                width: 400,
                              },
                            ],
                          },
                          {
                            fieldLabel: "วงเงินในงวด",
                            id: "f_total_amtID",
                            xtype: "hidden",
                            width: 150,
                            name: "f_total_amt",
                            listeners: {
                              blur: function () {
                                var f_total = parseFloat(this.getValue().replace(/,/g, "") / 1);
                                this.setValue(Ext.floatRenderer(f_total));
                                Ext.getCmp("period_f_net_unit_price").setValue(Ext.floatRenderer(f_total));
                              },
                            },
                            style: {
                              labelAlign: "right",
                              "font-weight": "bold",
                              padding: "1px",
                              margin: "1px",
                              color: "blue",
                              "background-color": "#fff",
                              "text-align": "right",
                            },
                          },
                          {
                            xtype: "buttongroup",
                            fieldLabel: "แหล่งเงิน ",
                            frame: false,
                            border: false,
                            items: [
                              new Ext.form.ComboBox({
                                mode: "local",
                                store: Ext.dc_expense_budget_type2,
                                fieldLabel: "แหล่งเงินที่ ",
                                width: 400,
                                submitValue: true,
                                id: "dc_expense_budget_type_id1TxtID",
                                name: "dc_bg_budget_type_id",
                                hiddenName: "dc_expense_budget_type_id",
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
                                    this.fn = function () {
                                      console.log(this.store);
                                      // alert(this.getValue());
                                    };
                                    this.fn();
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
                                    //***************************************************************************************แผนหรืองวด*******************************************************************

                                    if (this.getValue() == 4 || this.getValue() == 5) {
                                      Ext.getCmp("i_pr_type2ID").setValue(2);
                                    } else {
                                      Ext.getCmp("i_pr_type2ID").setValue(1);
                                    }
                                    //*********************************************************************************************************************************************************************
                                    // alert(this.getValue());
                                  },
                                },
                              }),
                            ],
                          },
                          new Ext.form.ComboBox({
                            mode: "local",
                            //                    readOnly: true,
                            store: Ext.dc_cost,
                            width: 400,
                            fieldLabel: "หน่วยงานที่รับของ",
                            value: Ext.selectRow.get("dc_cost2_id"),
                            valueField: "id",
                            displayField: "c_name",
                            hiddenName: "dc_cost2_id",
                            id: "dc_cost2_idID",
                            name: "c_cost2_name",
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
                                this.fn = function () {
                                  this.store;
                                };
                                this.fn();
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
                            xtype: "hidden",
                            name: "dc_creditor_id",
                            id: "dc_creditor_per_idID",
                            value: Ext.selectRow.data.dc_creditor_id,
                          },
                          {
                            xtype: "hidden",
                            name: "i_is_join_venture_per",
                            id: "i_is_join_venture_perID",
                            value: Ext.selectRow.data.i_is_join_venture,
                          },
                          {
                            xtype: "textfield",
                            width: 250,
                            fieldLabel: "ผู้ขายผู้รับจ้าง",
                            hidden: true,
                            id: "dc_creditor_per_text",
                            style: "text-align: center;font-weight:bold;background:#eee;",
                            readOnly: true,
                            name: "c_code",
                          },
                          {
                            xtype: "compositefield",
                            id: "dc_creditor_idID_pop",
                            hidden: true,
                            fieldLabel: "เลือกผู้เสนอราคา",
                            msgTarget: "side",
                            anchor: "-20",
                            defaults: {
                              flex: 1,
                            },
                            items: [PopCreditorForm.mini],
                          },
                          {
                            xtype: "radiogroup",
                            columns: [98, 98],
                            fieldLabel: "",
                            id: "already_withdrawnID",
                            name: "already_withdrawn",
                            items: [
                              {
                                checked: true,
                                name: "already_withdrawn",
                                inputValue: 1,
                                boxLabel: "ยังไม่เบิก",
                              },
                              {
                                inputValue: 2,
                                name: "already_withdrawn",
                                boxLabel: "เบิกแล้ว",
                              },
                            ], //radiogroup
                          },
                          {
                            xtype: "radiogroup",
                            columns: [98, 98],
                            fieldLabel: "",
                            // hidden: true,
                            id: "i_pr_type2ID",
                            name: "i_pr_type1",
                            items: [
                              {
                                checked: true,
                                name: "i_pr_type1",
                                inputValue: 1,
                                boxLabel: "จองแบบแผน",
                              },
                              {
                                inputValue: 2,
                                name: "i_pr_type1",
                                boxLabel: "จองแบบงวด",
                              },
                            ], //radiogroup
                          },
                          {
                            fieldLabel: "",
                            id: "copy_contract_dtl_id",
                            name: "copy_contract_dtl",
                            xtype: "radiogroup",
                            columns: [150, 150],
                            items: [
                              {
                                checked: true,
                                inputValue: "save",
                                name: "copy_contract_dtl",
                                boxLabel: "บันทึกรายการ",
                              },
                              {
                                inputValue: "copy_period",
                                hidden: Ext.SP_TOR_HDR_PERIOD_ID > 0 ? false : true,
                                name: "copy_contract_dtl",
                                boxLabel: "คัดลอกรายการ",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        //col2x
                        columnWidth: 0.5,
                        layout: "form",
                        bodyStyle: "padding:2px",
                        labelWidth: 140,
                        border: false,
                        items: [
                          new Ext.form.ComboBox({
                            mode: "local",
                            hidden: false,
                            store: Ext.po_expense,
                            valueField: "id",
                            displayField: "c_name",
                            submitValue: true,
                            id: "period_po_expense_id",
                            name: "po_expense_id",
                            hiddenName: "sp_expense_id",
                            triggerAction: "all",
                            allBlank: true,
                            forceSelection: true,
                            selectOnFocus: true,
                            fieldLabel: "รายการย่อย",
                            width: 420,
                            typeAhead: false,
                            emptyText: "กรุณาเลือกใช้จ่าย...",
                            listeners: {
                              afterrender: function () {
                                this.setValue(Ext.selectRow.data.po_expense_id);
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
                            columns: [98, 110],
                            fieldLabel: "ลักษณะการจ้าง",
                            id: "period_i_hire_type",
                            name: "i_hire_type",
                            items: [
                              {
                                checked: true,
                                inputValue: 1,
                                name: "i_hire_type_l",
                                boxLabel: "จ้างแบบได้ของ",
                              },
                              {
                                inputValue: 0,
                                name: "i_hire_type_l",
                                boxLabel: "จ้างแบบไม่มีของ",
                              },
                            ], //radiogroup
                            listeners: {
                              change: function () {
                                if (this.getValue().inputValue == 0) {
                                  Ext.getCmp("period_i_product_type2").hide();
                                  Ext.getCmp("period_i_is_invG2").hide();
                                  Ext.getCmp("period_i_product_type2").setValue(0);
                                  //                                       Ext.getCmp('inv_mode_idID').hide();
                                  //                                    Ext.getCmp('am_mode_idID').hide();
                                } else {
                                  Ext.getCmp("period_i_product_type2").show();
                                  Ext.getCmp("period_i_is_invG2").show();
                                  //      Ext.getCmp('inv_mode_idID').show();
                                  //       Ext.getCmp('am_mode_idID').show();
                                }
                              },
                              afterrender: function () {
                                if (Ext.selectRow.get("i_purchase") == 1) this.hide();
                                else this.show();
                              },
                            },
                          },
                          {
                            xtype: "radiogroup",
                            columns: [98, 98, 98],
                            fieldLabel: "ของที่ได้มา",
                            id: "period_i_product_type2",
                            name: "i_product_type",
                            items: [
                              {
                                checked: true,
                                name: "i_product_type",
                                inputValue: 1,
                                boxLabel: "วัสดุทั่วไป",
                                id: "i_product_type1",
                              },
                              {
                                //                                    checked: true,
                                name: "i_product_type",
                                id: "i_product_type0",
                                inputValue: 0,
                                boxLabel: "ไม่มีของ",
                              },
                              {
                                inputValue: 2,
                                name: "i_product_type",
                                id: "i_product_type2",
                                boxLabel: "ครุภัณฑ์",
                              },
                            ], //radiogroup
                            listeners: {
                              change: function () {
                                // alert(this.getValue().inputValue);
                              },
                              afterrender: function () {
                                if (Ext.getCmp("period_i_hire_type").getValue().inputValue == 0) {
                                  Ext.getCmp("period_i_product_type2").hide();
                                  Ext.getCmp("period_i_is_invG2").hide();
                                } else {
                                  Ext.getCmp("period_i_product_type2").show();
                                  Ext.getCmp("period_i_is_invG2").show();
                                }
                              },
                            },
                          },
                          {
                            xtype: "hidden",
                            fieldLabel: "การจัดเก็บ",
                            name: "period_i_is_inv",
                            id: "period_i_is_invG2",
                            items: [
                              {
                                id: "period_i_is_invG2s1",
                                boxLabel: "เข้าคลัง",
                                name: "i_is_inv",
                                // inputValue: 1,
                                listeners: {
                                  afterrender: function () {
                                    if (Ext.selectRow_PeridDtl != null) {
                                      if (Ext.selectRow_PeridDtl.get("i_is_inv") == true) {
                                        Ext.getCmp("period_i_is_invG2s1").setValue(true);
                                      }
                                    }
                                  },
                                },
                              },
                            ],
                          },
                          {
                            fieldLabel: "ชื่อรายการ",
                            id: "period_c_name",
                            xtype: "textarea",
                            width: 300,
                            name: "c_name_dtl",
                            allowBlank: false,
                          },
                          {
                            fieldLabel: "จำนวน",
                            xtype: "numberfield",
                            id: "period_i_qty",
                            name: "i_qty",
                            readOnly: true,
                            value: 1,
                            style: {
                              labelAlign: "right",
                              "font-weight": "bold",
                              padding: "1px",
                              margin: "1px",
                              color: "blue",
                              "background-color": "#fff",
                              "text-align": "right",
                            },
                          },
                          {
                            fieldLabel: "ราคา/ต่อหน่วย",
                            id: "period_f_net_unit_price",
                            xtype: "textfield",
                            name: "f_net_unit_price",
                            listeners: {
                              blur: function () {
                                var f_total = parseFloat(this.getValue().replace(/,/g, "") / 1);
                                this.setValue(Ext.floatRenderer(f_total));
                                Ext.getCmp("f_total_amtID").setValue(Ext.floatRenderer(f_total));
                                if (this.getValue() == "" || this.getValue() == 0) {
                                  this.setValue("0.00");
                                }
                              },
                              afterrender: function () {
                                if (this.getValue() == "" || this.getValue() == 0) {
                                  this.setValue(Ext.stotrePeriodDtl.data.f_total_amt);
                                }
                              },
                            },
                            style: {
                              labelAlign: "right",
                              "font-weight": "bold",
                              padding: "1px",
                              margin: "1px",
                              color: "blue",
                              "background-color": "#fff",
                              "text-align": "right",
                            },
                          },
                          new Ext.form.ComboBox({
                            mode: "local",
                            fieldLabel: "หน่วยนับ",
                            submitValue: true,
                            // hiddenName: "dc_unit_type_id",
                            readOnly: true,
                            id: "period_dc_unit_type_id",
                            name: "dc_unit_type_id",
                            hiddenName: "sp_unit_type_id",
                            store: Ext.storeUnitType,
                            valueField: "id",
                            displayField: "c_name",
                            value: 24,
                            triggerAction: "all",
                            forceSelection: true,
                            selectOnFocus: true,
                            typeAhead: false,
                            emptyText: "กรุณาเลือกหน่วยนับ...",
                            listeners: {
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
                              aftereditems: function () {
                                // console.log(Ext.storeUnitType);
                                // this.setValue(24);
                              },
                            },
                          }),
                        ],
                      },
                    ],
                  }),
                ],
                buttonAlign: "left",
                buttons: [
                  {
                    text: "บันทึกรายการ",
                    id: "buSaveSubAllID",
                    iconCls: "icon-save",
                    handler: function () {
                      msg = "";
                      var form = Ext.getCmp("win-frm-dtlID").items.items[0].getForm();
                      var getContract = parseFloat((Ext.getCmp("DISPLAY_creditor_f_total_amt_dtl_period").getValue().replace(/,/g, "") / 1).toFixed(2));
                      var getSum = parseFloat((Ext.sum + Ext.getCmp("period_f_net_unit_price").getValue().replace(/,/g, "") / 1).toFixed(2));

                      //if(parseFloat(getSum)>parseFloat(getContract)){
                      //        alert(1);
                      //}else{
                      //      alert(2);
                      //}
                      //
                      //alert(getSum+" === "+getContract);
                      //return false;
                      if ([null, 0, "", "0.00", 0.0].includes(Ext.getCmp("period_f_net_unit_price").getValue())) {
                        Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>ยังไม่ได้ระบุจำนวนเงิน</span>");
                        //                                                Ext.getCmp("period_f_net_unit_price").focus();

                        return false;
                      } else if (Ext.getCmp("period_f_net_unit_price").getValue().replace(/,/g, "") / 1 == 0) {
                        Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>ระบุจำนวนเงินมากว่า 0</span>");
                        //                                                Ext.getCmp("period_f_net_unit_price").focus();

                        return false;
                      } else if (getSum > getContract) {
                        //                       54,998.00 มากว่าเงินในสัญญา 329,988.00
                        //                                                console.log(getSum);
                        //                                                console.log(getContract);
                        Ext.Msg.alert(
                          "แจ้งเตือน",
                          "<span style='white-space: nowrap;'>จำนวนเงินรวมในงวด " + Ext.floatRenderer(getSum) + " มากว่าเงินในสัญญา " + Ext.floatRenderer(getContract) + "</span>"
                        );
                        //                                                Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>จำนวนเงินรวมในงวด " + Ext.floatRenderer(getSum) + " มากว่าเงินในสัญญา " + Ext.floatRenderer(Ext.sum) + "</span>");

                        return false;
                      } else {
                        //                                                console.log(getSum);
                        //                                                console.log(Ext.sum);
                        //                                                return false;

                        var formSubmit = function () {
                          form.submit({
                            waitMsg: "Saving Data...",
                            success: function (form, action) {
                              Ext.getCmp("period-addAllID").setDisabled(false);
                              Ext.store3.reload();
                              Ext.getCmp("win-frm-dtlID").destroy();
                            },
                            failure: function (form, action) {
                              switch (action.failureType) {
                                case Ext.form.Action.CLIENT_INVALID:
                                  Ext.Msg.alert("แจ้งเตือน", "กรอกข้อมูลให้ครบถ้วน !!!");
                                  break;
                                case Ext.form.Action.CONNECT_FAILURE:
                                  Ext.Msg.alert("แจ้งเตือน", "พลข้อผิดพลาดในการเชื่อต่อเครือข่าย");
                                  break;
                                case Ext.form.Action.SERVER_INVALID:
                                  Ext.Msg.alert("แจ้งเตือน", action.result.msg);
                              }
                            },
                          });
                        }; //END
                        if (form.isValid()) {
                          formSubmit(form);
                        }
                      }
                    },
                  },
                  {
                    text: "ปิด",
                    icon: "../images/icons/bullet_cross.png",
                    handler: function () {
                      Ext.getCmp("period-addAllID").setDisabled(false);
                      Ext.getCmp("win-frm-dtlID").destroy();
                    },
                  },
                ],
                listeners: {
                  close: function () {
                    Ext.getCmp("period-addAllID").setDisabled(false);
                  },
                },
              });
              var rec = Ext.selectRow_PeridHdr;
              if (Ext.selectRow_PeridHdr != null) {
                Ext.getCmp("win-frm-dtlID").items.items[0].getForm().loadRecord(rec);
              } else {
                //                                Ext.getCmp("win-frm-dtlID").setTitle(Ext.floatRenderer(recSum.get('sum_period'))

                Ext.sum = 0;
                var i = 0;
                recSum.forEach(function (v) {
                  i++;
                  Ext.sum += parseFloat(v.get("f_total_amt").replace(/,/g, ""));

                  if (Ext.recSum.length == i) {
                    Ext.getCmp("win-frm-dtlID").setTitle("ยอดของสัญญา " + Ext.selectRow.get("f_total_amt") + ", ยอดรวมงวด " + Ext.floatRenderer(Ext.sum));
                    Ext.selectRow.set("i_period", Ext.recSum.length + 1 - 3);
                  }
                });
                Ext.selectRow.set("period_f_net_unit_price", Ext.selectRow.get("f_total_amt"));
                Ext.selectRow.set("c_name_dtl", Ext.selectRow.get("c_name"));
                Ext.getCmp("win-frm-dtlID").items.items[0].getForm().loadRecord(Ext.selectRow);
              }

              win.show();
            }
          },
        });
        //sum period all End
      }
    },
  });
} //End fun All

Ext.guarantee = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_spAlert.php",
  baseParams: { type: "sp_type_guarantee", i_is_type_tor: true },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});
Ext.storeedit = new Ext.data.JsonStore({
  storeId: "myStore2",
  autoLoad: true,
  url: "tor/api/mnTorController.php",
  root: "data",
  baseParams: { mode: "LIST_SP_EDIT_CONTRACT", i_read: user_right_read }, //Permission i_read
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [
    { name: "no" },
    // { name: "tor_id" },
    { name: "sp_tor_contract_editid" },
    { name: "sp_tor_id" },
    { name: "sp_tor_contract_id" },
    { name: "row_edit" },
    { name: "i_enabled" },
    { name: "i_type" },
    { name: "d_doc_date" },
    { name: "d_due_date" },
    { name: "dc_bank_id" },
    { name: "i_type_guarantee" },
    { name: "guarantee_on" },
    { name: "guarantee_seq" },
    { name: "f_warranty_guarantee" },
    { name: "d_guarantee_data" },
    { name: "c_remark_guarantee" },
    { name: "f_total_amt" },
    { name: "d_create" },
    { name: "dc_user_create_id" },
    { name: "dc_user_create_cost_id" },
    { name: "dc_user_update_id" },
    { name: "dc_user_update_cost_id" },
    { name: "d_update" },
    { name: "c_comment" },
  ],
});
const Uiedit_contract = function (rec) {
  const delete_edit_contract = function (rec) {
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
              url: "tor/api/mnEditContract.php",
              params: {
                mode: "DELETE_EDIT_CONTRACT",
                sp_tor_contract_editid: rec.data.sp_tor_contract_editid,
                i_enabled: 2,
              },
              method: "GET", //POST
              success: function (result, request) {
                Ext.storeDtl.reload();
                Ext.storeedit.reload();
                let itemStore = Ext.getCmp("gridSub1ID").getStore();
                itemStore.reload();
                Ext.getCmp("win-msg-delete").destroy();
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
  Ext.storeBank = new Ext.data.JsonStore({
    autoLoad: true,
    storeId: "myStoreCost",
    url: "api/All_ArCombo.php",
    baseParams: { type: "storeBank" },
    root: "data",
    idProperty: "id",
    totalProperty: "totalCount",
    fields: ["no", "id", "c_code", "c_name"],
  });
  Ext.ColumGridPop = [
    { header: "ID System", sortable: true, hidden: true, dataIndex: "id" },
    { header: "รหัส", sortable: true, dataIndex: "c_code" },
    {
      header: "่ชื่อ",
      sortable: true,
      id: "c_name",
      dataIndex: "c_name",

      renderer: function (value, metaData, record, rowIndex, colIndex, store) {
        metaData.attr = "style='cursor:pointer';";
        return value;
      },
    },
  ];
  var PopBank = new Ext.ux.Poplov({
    text: "ชื่อธนาคาร",
    id: "dc_bank_idID", //go to relation
    iconCls: "page_magnify",
    valueHidden: "dc_bank_id", //go to hidden
    store: Ext.storeBank,
    headerGrid: Ext.ColumGridPop,
    widthText: 280,
    fieldLabel: "ชื่อธนาคาร ",
    // listeners   : {'render' : function(p){ this.hide(); } }
  });
  var disp = false ? "displayfield" : "textfield";
  var comboCost = new Ext.form.ComboBox({
    mode: "local",
    readOnly: Ext.session.dc_center_user == 1 ? false : true,
    store: Ext.dc_cost,
    anchor: "80%",
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
  var colPOP = [
    new Ext.grid.RowNumberer({ width: 35, header: " No ", dataIndex: "no" }),
    { header: "ID System", hidden: true, dataIndex: "sp_tor_contract_editid" },
    // {
    //   header: "-",
    //   align: "center",
    //   dataIndex: "creditor_name",
    //   width: 42,
    //   id: "detailBidder",
    //   renderer: function (value, metaData, record, row, col, store, gridView) {
    //     return "<button>รายละเอียดการแก้ไข</button>";
    //   },
    // },
    {
      header: "แก้ไขครั้งที่",
      align: "center",
      dataIndex: "row_edit",
      width: 10,
    },
    {
      header: "เหตุผล",
      align: "left",
      dataIndex: "c_comment",
      width: 50,
    },
    {
      header: "วันที่แก้ไข",
      align: "center",
      dataIndex: "d_update",
      width: 10,
    },
    {
      header: "วันที่เริ่มสัญญา",
      align: "center",
      dataIndex: "d_doc_date",
      width: 10,
    },
    {
      header: "วันที่สิ้นสุดสัญญา",
      align: "center",
      dataIndex: "d_due_date",
      width: 10,
    },
    {
      header: "จำนวนเงิน",
      sortable: false,
      align: "center",
      dataIndex: "f_total_amt",
      width: 15,
      renderer: function (value, metaData, record, rowIndex, colIndex, store) {
        metaData.attr = "style='color:blue;text-align: right;'";
        return floatRenderer(value);
      },
    },
    // {
    //   header: "แก้ไข",
    //   sortable: false,
    //   hideable: false,
    //   draggable: false,
    //   align: "center",
    //   id: "edit_bidder_hdr",
    //   width: 15,
    //   dataIndex: "id",
    //   renderer: function (value, metaData, record, row, col, store, gridView) {
    //     return '<img src="../images/icons/document_edit.gif"); style="cursor:pointer"/>';
    //   },
    // },
    {
      id: "delete_edit_contract",
      header: "ลบ",
      sortable: false,
      align: "center",
      width: 8,
      dataIndex: "id",
      renderer: function (value, metaData, record, row, col, store, gridView) {
        return '<img src="../images/icons/table_delete.png"); style="cursor:pointer"/>';
      },
    },
    { width: 3, dataIndex: "" },
  ];
  var win = new Ext.Window({
    // var win = new Ext.Window({
    collapsible: true,
    maximizable: true,
    title: "แก้ไขสัญญา",
    width: 1500,
    id: "winMain1",
    height: 800,
    minWidth: 1000,
    minHeight: 1000,
    layout: "fit",
    modal: true,
    plain: true,
    bodyStyle: "padding:1px;",
    buttonAlign: "center",
    items: [
      {
        xtype: "tabpanel",
        activeTab: 0,
        labelWidth: 500,
        id: "winChequeEditID",
        // defaults: {autoHeight: true, bodyStyle: 'padding:10px'},
        items: [
          new Ext.FormPanel({
            title: "รายละเอียดสัญญา",
            id: "form_edit_contract",
            columnWidth: 1,
            url: "tor/api/mnEditContract.php",
            frame: true,
            autoScroll: true,
            fileUpload: true,
            labelAlign: "left",
            bodyStyle: "padding:1px",
            labelWidth: 500,
            listeners: {
              afterrender: function () {
                // Ext.getCmp("i_pr_type1ID").setValue(Ext.selectRow.json.i_pr_type1);
              },
            },
            items: [
              {
                xtype: "fieldset",
                title: "ข้อมูลปัจจุบัน&#x600D",
                collapsible: true,
                collapsed: false,
                labelWidth: 800,
                // height: 250,
                id: "groupProductTypeID",
                layout: "column", // กำหนด layout ให้เป็น column เพื่อให้แบ่งเป็นคอลัมน์ได้
                items: [
                  {
                    xtype: "panel",
                    layout: "form",
                    id: "formProductType",
                    columnWidth: 0.5, // คอลัมน์นี้ใช้พื้นที่ 50%
                    labelWidth: 160,
                    items: [
                      {
                        columnWidth: 0.6,
                        layout: "form",
                        border: true,
                        items: [
                          {
                            xtype: "hidden",
                            name: "sp_tor_id",
                            id: "sp_tor_idID", //i_is_more
                          },
                          {
                            xtype: "hidden",
                            name: "sp_tor_contract_id",
                            id: "sp_tor_contract_idID",
                          },
                          {
                            xtype: "hidden",
                            name: "i_enabled",
                            value: 1,
                          },
                          {
                            xtype: "hidden",
                            name: "mode",
                            value: "Edit_contrct",
                          },
                          {
                            xtype: disp,
                            readOnly: true,
                            fieldLabel: "เลขที่สัญญา",
                            id: "code_contactID",
                            style: "text-align: center;font-weight:bold;background:#eee;",
                            readOnly: true,
                            name: "c_code",
                          },
                          {
                            xtype: "textarea",
                            width: 500,
                            height: 35,
                            // readOnly: true,
                            fieldLabel: "เรื่อง/โครงการ",
                            name: "c_name",
                          },
                          // comboUsedBgYear,
                          // { xtype: "displayfield", fieldLabel: "ชื่อโครงการ", name: "c_budget_dtl_project" },
                          comboCost,
                          new Ext.form.ComboBox({
                            mode: "local",
                            store: Ext.dc_cost,
                            maxHeight: 200, // ความสูงสูงสุดของรายการใน Dropdown
                            anchor: "80%",
                            readOnly: Ext.session.dc_center_user == 1 ? false : true,
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
                            width: 400, // ความกว้างของ ComboBox
                            listWidth: 500, // ความกว้างของ Dropdown
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
                              select: function (combo, record) {
                                combo.setTooltip(record.get("c_name")); // กำหนด Tooltip เป็นข้อความเต็ม
                              },
                              blur: function () {
                                this.getStore().clearFilter();
                              },
                            },
                          }),
                          new Ext.form.ComboBox({
                            mode: "local",
                            store: Ext.po_expense,
                            valueField: "id",
                            displayField: "c_name",
                            anchor: "95%",
                            submitValue: true,
                            name: "c_detail",
                            id: "po_expense_hdr_idID",
                            hiddenName: "po_expense_id",
                            triggerAction: "all",
                            allBlank: true,
                            forceSelection: true,
                            selectOnFocus: true,
                            width: 400, // ความกว้างของ ComboBox
                            listWidth: 500, // ความกว้างของ Dropdown
                            readOnly: Ext.session.dc_center_user == 1 ? false : true,
                            fieldLabel: "รายการย่อย",
                            width: 200,
                            typeAhead: false,
                            emptyText: "กรุณาเลือกใช้จ่าย...",
                            listeners: {
                              afterrender: function () {
                                this.fn = function () {
                                  // Ext.getCmp('po_expense_id_dtlID').setValue(Ext.getCmp('po_expense_hdr_idID').getValue());
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
                              select: function (combo, record) {
                                combo.setTooltip(record.get("c_name")); // กำหนด Tooltip เป็นข้อความเต็ม
                              },
                              blur: function () {
                                this.getStore().clearFilter();
                                console.log(this);
                              },
                            },
                          }),
                          new Ext.form.ComboBox({
                            mode: "local",
                            store: Ext.dc_expense_budget_type,
                            fieldLabel: "แหล่งเงิน",
                            anchor: "80%",
                            submitValue: true,
                            name: "dc_expense_budget_type_idTxt",
                            hiddenName: "dc_expense_budget_type_id",
                            id: "dc_expense_budget_type_hdr_id1",
                            readOnly: Ext.session.dc_center_user == 1 ? false : true,
                            valueField: "id",
                            displayField: "c_name",
                            triggerAction: "all",
                            forceSelection: true,
                            selectOnFocus: true,
                            typeAhead: false,
                            emptyText: "กรุณาเลือกแหล่งเงิน...",

                            listeners: {
                              afterrender: function () {
                                this.fn = function () {
                                  Ext.i_bg_type = Ext.getStoreItems(this.store, this.getValue(), "i_bg_type");
                                };
                                this.fn();
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
                          new Ext.form.ComboBox({
                            mode: "local",
                            store: new Ext.data.JsonStore({
                              autoDestroy: false,
                              autoLoad: false,
                              url: "api/All_spAlert.php",
                              baseParams: {
                                type: "sp_type_status",
                                i_is_type_tor: true,
                                // all: "all",
                              },
                              root: "data",
                              idProperty: "id",
                              fields: ["id", "c_name"],
                            }),
                            anchor: "35%",
                            fieldLabel: "วิธีดำเนินงาน",
                            submitValue: true,
                            hiddenName: "stor_type_id",
                            name: "sc_type_id",
                            id: "stor_type_idID",
                            valueField: "id",
                            displayField: "c_name",
                            triggerAction: "all",
                            forceSelection: false,
                            selectOnFocus: true,
                            typeAhead: false,
                            emptyText: "กรุณาเลือก",
                            listeners: {
                              afterrender: function () {
                                //setLoad&&callback
                                this.store.load({
                                  callback: function (record, operation, success) {
                                    if (success) {
                                      Ext.getCmp("stor_type_idID").setValue(this.data.items[0].get("c_name"));
                                    }
                                  },
                                });
                              },
                            },
                          }),

                          // {
                          //   xtype: "buttongroup",
                          //   fieldLabel: "วันที่",
                          //   frame: false,
                          //   border: false,
                          //   items: [
                          //     {
                          //       xtype: "datefield",
                          //       name: "d_tor_date",
                          //       readOnly: true,
                          //       validator: function (val) {
                          //         if (!Ext.isEmpty(val)) {
                          //           return true;
                          //         } else {
                          //           return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                          //         }
                          //       },
                          //     },
                          //     {
                          //       xtype: "tbspacer",
                          //       width: 18,
                          //     },
                          //     {
                          //       xtype: "label",
                          //       style: {
                          //         color: "red",
                          //         width: "100px",
                          //       },
                          //       text: "* วันที่ตามเอกสาร PR",
                          //     },
                          //   ],
                          // },
                          // {
                          //   xtype: "textfield",
                          //   readOnly: true,
                          //   fieldLabel: "รหัสเอกสารอ้างอิง",
                          //   name: "d_doc_ref",
                          // },

                          // Ext.getBodyMultiBudget(Ext.selectRow, "st0005"),
                          // {
                          //   xtype: "radiogroup",
                          //   columns: [180],
                          //   fieldLabel: "โหมดการบันทึก",
                          //   id: "modesubID",
                          //   hidden: true,
                          //   style: {
                          //     "font-weight": "bold",
                          //   },
                          //   items: [
                          //     {
                          //       name: "mode",
                          //       checked: true,
                          //       inputValue: "UPDATEFORMSTSATUS",
                          //       boxLabel: "อัพเดทรายการ",
                          //     },
                          //   ],
                          // },
                          {
                            xtype: "textfield",
                            readOnly: true,
                            fieldLabel: "รหัสเอกสารอ้างอิง",
                            name: "d_doc_ref",
                          },
                        ],

                        buttonAlign: "left",
                        buttons: [
                          {
                            text: "บันทึกรายการ",
                            id: "buSaveSubID",
                            iconCls: "icon-save",
                            handler: function () {
                              msg = "";
                              var formSubmit = function () {
                                console.log(form);
                                form.submit({
                                  waitMsg: "Saving Data...",
                                  success: function (form, action) {
                                    Ext.storeDtl.reload();
                                    Ext.storeedit.reload();
                                    let itemStore = Ext.getCmp("gridSub1ID").getStore();
                                    itemStore.reload();
                                  },
                                });
                              };
                              var form = Ext.getCmp("form_edit_contract").getForm();
                              // if (form.isValid()) {
                              // }
                              if (Ext.getCmp("c_commentID").getValue() == "") {
                                msg += "กรุณาระบุเหตุผล ";
                              }
                              if (msg != "") {
                                Ext.example.msg("แจ้งเตือน", msg, 1);
                                $(this).next("text copied");
                                setTimeout(function () {
                                  $(this).next().remove();
                                }, 6000);
                                return;
                              } else {
                                formSubmit(form);
                              }
                              // return;
                            },
                          },
                        ],
                      },
                    ],
                  },
                  {
                    xtype: "panel",
                    layout: "form",
                    labelWidth: 100,
                    columnWidth: 0.5, // คอลัมน์นี้ใช้พื้นที่ 50%
                    items: [
                      {
                        xtype: "textarea",
                        width: 400,
                        fieldLabel: "เหตุผล",
                        name: "c_comment",
                        id: "c_commentID",
                      },
                      {
                        xtype: "buttongroup",
                        fieldLabel: "วันที่เริ่มสัญญา",
                        frame: false,
                        border: false,
                        items: [
                          {
                            xtype: "datefield",
                            name: "d_doc_date",
                            id: "d_doc_dateID",
                            readOnly: Ext.session.dc_center_user == 1 ? false : true,
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
                          // {
                          //   xtype: "label",
                          //   style: {
                          //     color: "red",
                          //     width: "100px",
                          //   },
                          //   text: "* วันที่ตามเอกสาร PR",
                          // },
                        ],
                      },
                      {
                        xtype: "buttongroup",
                        fieldLabel: "วันที่เข้าพื้นที่",
                        frame: false,
                        border: false,
                        items: [
                          {
                            xtype: "datefield",
                            name: "construction_start_date",
                            id: "construction_start_dateID",
                            value: new Date().format("d-m-Y"),
                            readOnly: Ext.session.dc_center_user == 1 ? false : true,
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
                            id: "d_due_dateID",
                            readOnly: Ext.session.dc_center_user == 1 ? false : true,
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
                        ],
                      },
                      {
                        xtype: "textfield",
                        fieldLabel: "จำนวนเงิน",
                        // readOnly: true,
                        readOnly: Ext.session.dc_center_user == 1 ? false : true,
                        name: "f_total_amt",
                        id: "f_totalID",
                        listeners: {
                          afterrender: function () {
                            this.fn = function () {
                              // Ext.getCmp("f_type_edit_amtID").setValue(Ext.selectRow.get("f_type_amt"));
                              // var val = 0;
                              // val = this.getValue();
                              // var f_total = parseFloat(val.replace(/,/g, "") / 1);
                              // this.setValue(Ext.floatRenderer(f_total));
                              this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                            };
                            this.fn();
                          },
                          blur: function () {
                            this.fn();
                          },
                          keyup: function () {
                            Ext.getCmp("f_totalID").setValue(floatRenderer(floatMinus(Ext.getCmp("f_type_amtID").getValue().replace(/,/g, ""))));
                          },
                        },
                        style: {
                          labelAlign: "right",
                          "font-weight": "bold",
                          padding: "1px",
                          margin: "1px",
                          color: "blue",
                          "background-color": "#fff",
                          "text-align": "right",
                        },
                      },
                      new Ext.form.ComboBox({
                        mode: "local",
                        store: Ext.guarantee,
                        anchor: "40%",
                        // hidden: true,
                        // value: 0,
                        fieldLabel: "หลักค้ำ",
                        submitValue: true,
                        hiddenName: "i_type_guarantee",
                        name: "i_type_guaranteehidden",
                        id: "i_is_guaranteeGID",
                        valueField: "id",
                        displayField: "c_name",
                        triggerAction: "all",
                        forceSelection: true,
                        selectOnFocus: true,
                        typeAhead: false,
                        emptyText: "กรุณาเลือก",
                        listeners: {
                          afterrender: function () {
                            this.fn = function () {
                              if (this.getValue() == 8) {
                                // } else if(this.getValue() == 8) {
                                Ext.getCmp("d_doc_guarantee_refID").show();
                                Ext.getCmp("d_guarantee_dateID").show();
                                Ext.getCmp("f_total_guarantee_ID").show();
                                Ext.getCmp("frmPopBankID").show();
                                // } else if(this.getValue() == 9) {
                              } else {
                                Ext.getCmp("d_doc_guarantee_refID").hide();
                                Ext.getCmp("d_guarantee_dateID").hide();
                                Ext.getCmp("f_total_guarantee_ID").hide();
                                Ext.getCmp("frmPopBankID").hide();
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
                      }),
                      {
                        xtype: "textfield",
                        hidden: true,
                        // readOnly: true,
                        fieldLabel: "เลขที่แคชเชียร์",
                        name: "d_doc_guarantee_ref",
                        id: "d_doc_guarantee_refID",
                      },
                      {
                        xtype: "datefield",
                        hidden: true,
                        fieldLabel: "วันที่แคชเชียร์",
                        id: "d_guarantee_dateID",
                        name: "d_guarantee_date",
                        width: 100,
                        value: new Date().format("d-m-Y"),
                        // readOnly:   true ,
                        validator: function (val) {
                          if (Ext.isEmpty(val)) {
                            return "กรุณากรอก วันที่แคชเชียร์ ";
                          } else {
                            return true;
                          }
                        },
                        listeners: {
                          change: function () {
                            // d_doc_dateID_Change();
                          },
                        },
                      },
                      {
                        xtype: "compositefield",
                        id: "frmPopBankID", //frmPopBankID
                        fieldLabel: "เลือกธนาคาร",
                        msgTarget: "side",
                        anchor: "20",
                        hidden: true,
                        defaults: {
                          flex: 1,
                        },
                        items: [PopBank.mini],
                      },
                      {
                        xtype: "textfield",
                        hidden: true,
                        fieldLabel: "จำนวนเงินเช็ค",
                        emptyText: "0",
                        name: "f_total_guarantee",
                        id: "f_total_guarantee_ID",
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
                        style: {
                          labelAlign: "right",
                          "font-weight": "bold",
                          padding: "1px",
                          margin: "1px",
                          color: "blue",
                          "background-color": "#fff",
                          "text-align": "right",
                        },
                      },
                    ],
                  },
                ],
              },
              {
                xtype: "fieldset",
                title: "รายการที่แก้ไข &#x2708; ", // &#x2714; &#x274C;
                collapsible: true,
                labelWidth: 100,
                collapsed: false,
                items: [
                  {
                    xtype: "grid",
                    id: "gridSub1ID",
                    border: true,
                    stripeRows: true,
                    loadMask: true,
                    height: 200,
                    store: Ext.storeedit,
                    listeners: {
                      beforerender: function () {
                        Ext.DidderHdr = function (evt, rec) {
                          var win = new Ext.Window({
                            labelWidth: 175,
                            collapsible: true,
                            maximizable: true,
                            modal: true,
                            title: "เพิ่มผู้เสนอราคา",
                            id: "win-frm-contractID",
                            layout: "fit",
                            border: false,
                            width: 630,
                            height: 300,
                            items: [{}],
                          });
                        };
                        this.thisCick = function (grid, rowIndex, columnIndex, e) {
                          var record = grid.getStore().getAt(rowIndex);
                          Ext.SelectStore = Ext.storeedit.getAt(rowIndex);
                          console.log(Ext.SelectStore.data.row_edit);
                          // Ext.store2.setBaseParam("tor_id", Ext.HDR_ID);
                          if (columnIndex === grid.getColumnModel().getIndexById("detailBidder")) {
                            alert(1);
                            Ext.SP_TOR_BIDDER_HDR_ID = Ext.SelectStore.data.sp_tor_bidder_hdr_id;
                            Ext.DC_CREDITOR_ID = Ext.SelectStore.data.dc_creditor_id;
                            Ext.store3.setBaseParam("sp_tor_id", Ext.SP_TOR_ID);
                            Ext.store3.setBaseParam("dc_creditor_id", Ext.DC_CREDITOR_ID);
                            Ext.store3.setBaseParam("sp_tor_bidder_hdr_id", Ext.SP_TOR_BIDDER_HDR_ID);
                            Ext.store3.load();
                            // TabNext(record, "view"); //on
                          } else if (columnIndex === grid.getColumnModel().getIndexById("edit_bidder_hdr")) {
                            Ext.SP_TOR_BIDDER_HDR_ID = Ext.SelectStore.data.sp_tor_bidder_hdr_id;
                            Ext.DidderHdr("edit_bidder_hdr", record);
                            var c_tax_number_imp = Ext.SelectStore.data.c_tax_number_imp == null ? "(ไม่มีเลขประจำตัวผู้เสียภาษี)" : Ext.SelectStore.data.c_tax_number_imp;
                            Ext.getCmp("dc_creditor_idID_Name").setValue(c_tax_number_imp + " : " + Ext.SelectStore.data.dc_creditor_name);
                            Ext.getCmp("dc_creditor_idID").setValue(Ext.SelectStore.data.dc_creditor_id);
                            if (Ext.SelectStore.data.i_is_guarantee == 8) {
                              Ext.getCmp("d_doc_guarantee_refID").show().setValue(Ext.SelectStore.data.d_doc_guarantee_ref);
                              Ext.getCmp("d_guarantee_dateID").show().setValue(Ext.SelectStore.data.d_guarantee_date);
                              Ext.getCmp("f_total_guarantee_ID").show().setValue(Ext.SelectStore.data.f_total_guarantee);
                              Ext.getCmp("frmPopBankID").show();
                              Ext.getCmp("dc_bank_idID_Name").setValue(Ext.SelectStore.data.dc_bank_name);
                              Ext.getCmp("dc_bank_idID").setValue(Ext.SelectStore.data.dc_bank_id);
                              Ext.getCmp("i_is_guaranteeGID").setValue(Ext.SelectStore.data.i_is_guarantee);
                            }
                          } else if (columnIndex === grid.getColumnModel().getIndexById("delete_edit_contract")) {
                            // Ext.SelectStore.data.sp_tor_contract_editid;
                            if (Ext.storeedit.data.length != Ext.SelectStore.data.row_edit) {
                              Ext.MessageBox.alert("แจ้งเตือน", "คุณไม่สามารถลบรายการก่อนลำดับได้");
                            } else {
                              delete_edit_contract(Ext.SelectStore);
                            }
                          }
                        };
                      },
                      afterrender: function () {
                        Ext.getCmp("gridSub1ID").on("cellclick", this.thisCick, this);
                      },
                    },
                    columns: colPOP,
                    viewConfig: {
                      forceFit: true,
                      emptyText: "ไม่มีข้อมูล..",
                      deferEmptyText: false,
                      getRowClass: function (record) {
                        // if (record.data.i_is_victory == true) {
                        return "td-succeed ";
                        // }
                      },
                    },
                    // tbar: [

                    // ]
                  },
                ],
              },
            ],
          }),
        ],
      },
    ],
    listeners: {
      afterrender: function (win) {
        win.maximize(); // สั่งให้หน้าต่างเต็มจอ
      },
    },
  }).show();
};
Ext.storeBank = new Ext.data.JsonStore({
  autoLoad: true,
  storeId: "myStoreCost",
  url: "api/All_ArCombo.php",
  baseParams: { type: "storeBank" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: ["no", "id", "c_code", "c_name"],
});
Ext.ColumGridPop = [
  { header: "ID System", sortable: true, hidden: true, dataIndex: "id" },
  { header: "รหัส", sortable: true, dataIndex: "c_code" },
  {
    header: "ชื่อ",
    sortable: true,
    id: "c_name",
    dataIndex: "c_name",
    renderer: function (value, metaData, record, rowIndex, colIndex, store) {
      metaData.attr = "style='cursor:pointer';";
      return value;
    },
  },
];
Ext.PopBank = new Ext.ux.Poplov({
  text: "ชื่อธนาคาร",
  id: "dc_bank_idID", //go to relation
  iconCls: "page_magnify",
  valueHidden: "dc_bank_id", //go to hidden
  store: Ext.storeBank,
  headerGrid: Ext.ColumGridPop,
  widthText: 280,
  fieldLabel: "ชื่อธนาคาร ",
  // listeners   : {'render' : function(p){ this.hide(); } }
});
const saveDtl = function (mode) {
  let msg = "";
  let jsonArr = [];
  var num = Ext.getCmp("gridEditor").store.data.items.length - 1;
  var row = 0;
  while (num >= row) {
    if (document.getElementById("chk_" + row).checked == true) {
      jsonArr.push({
        sp_tor_id: Ext.TOR_ID,
        sp_tor_dtl_id: document.getElementById("chk_" + row).value,
        sp_tor_contract_id: Ext.SP_TOR_CONTRACT_ID,
        sp_tor_hdr_period_id: Ext.SP_TOR_HDR_PERIOD_ID,
        i_qty: document.getElementById("num_" + row).value,
        // f_net_unit_price: document.getElementById("num_" + row).value,
        // c_name: Ext.getCmp("gridEditor").store.data.items[row].data.c_name,
      });
    }
    row++;
  }

  if (jsonArr.length <= 0) {
    msg += "<span style='white-space: nowrap;'>- กรุณาเลือกรายการ</span><br>";
  }
  if (msg == "") {
    Ext.Ajax.request({
      url: "tor/api/mnTorController.php",
      method: "POST",
      params: {
        mode: "UP_SP_TOR_DTL_PERIOD",
        data: JSON.stringify(jsonArr),
      },
      success: function (result, request) {
        Ext.getCmp("win-frm-perid-bal-dtlID").getEl().unmask();
        let json = Ext.util.JSON.decode(result.responseText);
        Ext.Msg.alert("แจ้งเตือน", json.msg);
        Ext.getCmp("win-frm-perid-bal-dtlID").destroy();
        Ext.store4.load({
          callback: function (record, operation, success) {
            if (success) {
              var i = this.data.length - 1;
              if (i >= 0) {
                Ext.getCmp("bbf_total_price4ID").setValue(record[i].get("f_total_amt"));
                Ext.getCmp("bbf_qty4ID").setValue(record[i].get("i_qty_amt"));
              } else {
                Ext.getCmp("bbf_total_price4ID").setValue("0");
                Ext.getCmp("bbf_qty4ID").setValue("0.00");
              }
            }
          },
        });
        if (json.success == true) {
          Ext.Msg.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย");
        }
      },
      failure: function (result, request) {
        Ext.MessageBox.alert("Failed", result.responseText);
      },
    });
  } else {
    Ext.Msg.alert("แจ้งเตือน", msg);
  }
};

const savePerid = function () {
  var i_purchase = Ext.selectRow.get("i_purchase"); // ซื้อ/จ้าง/เช่า
  var i_hire_type = Ext.getCmp("period_i_hire_type").getValue().inputValue; // ได้มาเป็นของ
  var i_product_type = Ext.getCmp("period_i_product_type2").getValue().inputValue; // วัสดุ หรือครุภัณธฑ์

  console.log("ซื้อ/จ้าง/เช่า " + i_purchase + " ได้มาเป็นของ " + i_hire_type + " วัสดุ หรือครุภัณธฑ์" + i_product_type + " ");

  //    return false;

  let msg = "";

  if (Ext.getCmp("period_dc_expense_budget_type_id").getValue() <= 0) {
    msg += "<span style='white-space: nowrap;'>- กรุณาเลือกแหล่งเงิน</span><br>";
  }
  if (Ext.getCmp("period_po_expense_id").getValue() <= 0) {
    msg += "<span style='white-space: nowrap;'>- กรุณาเลือกรายการย่อย</span><br>";
  }
  if (Ext.getCmp("period_c_name").getValue() == "") {
    msg += "<span style='white-space: nowrap;'>- กรุณาเลือกกรอกชื่อ</span><br>";
  }
  if (Ext.getCmp("period_i_qty").getValue() <= 0) {
    msg += "<span style='white-space: nowrap;'>- กรุณาระบุจำนวน</span><br>";
  }
  if (Ext.getCmp("period_dc_unit_type_id").getValue() <= 0) {
    msg += "<span style='white-space: nowrap;'>- กรุณาเลือกหน่วยนับ</span><br>";
  }

  let jsonArr = [];

  if (msg == "") {
    Ext.Ajax.request({
      url: "tor/api/mnTorController.php",
      method: "POST",
      params: {
        mode: "UP_SP_TOR_DTL_PERIOD_NEW",
        sp_tor_id: Ext.TOR_ID,
        sp_tor_contract_id: Ext.SP_TOR_CONTRACT_ID,
        sp_tor_hdr_period_id: Ext.SP_TOR_HDR_PERIOD_ID,
        sp_tor_dtl_period_id: Ext.SP_TOR_DTL_PERIOD_ID,
        dc_bg_budget_type_id: Ext.getCmp("period_dc_expense_budget_type_id").getValue(),
        po_expense_id: Ext.getCmp("period_po_expense_id").getValue(),
        i_hire_type: Ext.getCmp("period_i_hire_type").getValue().inputValue,
        i_product_type: Ext.getCmp("period_i_hire_type").getValue().inputValue == 1 ? Ext.getCmp("period_i_product_type2").getValue().inputValue : null,
        //       inv_mode_id: Ext.getCmp("period_i_product_type2").getValue().inputValue == 1 ? Ext.getCmp("inv_mode_idID").value : 0,
        //         am_mode_id: Ext.getCmp("period_i_product_type2").getValue().inputValue == 2 ? Ext.getCmp("am_mode_idID").value : 0,
        i_is_inv: Ext.getCmp("period_i_is_invG2s1").getValue() == true ? 1 : 0,
        c_name: Ext.getCmp("period_c_name").getValue(),
        i_qty: Ext.getCmp("period_i_qty").getValue(),
        f_net_unit_price: Ext.getCmp("period_f_net_unit_price").getValue(),
        dc_unit_type_id: Ext.getCmp("period_dc_unit_type_id").getValue(),
      },
      success: function (result, request) {
        Ext.getCmp("win-frm-perid-bal-dtl2ID").getEl().unmask();
        let json = Ext.util.JSON.decode(result.responseText);
        Ext.Msg.alert("แจ้งเตือน", json.msg);
        Ext.getCmp("win-frm-perid-bal-dtl2ID").destroy();
        Ext.store4.load({
          callback: function (record, operation, success) {
            if (success) {
              1673;
              if (i >= 0) {
                Ext.getCmp("bbf_total_price4ID").setValue(record[i].get("f_total_amt"));
                Ext.getCmp("bbf_qty4ID").setValue(record[i].get("i_qty_amt"));
              } else {
                Ext.getCmp("bbf_total_price4ID").setValue("0");
                Ext.getCmp("bbf_qty4ID").setValue("0.00");
              }
            }
          },
        });

        if (json.success == true) {
          Ext.Msg.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย");
        }
      },
      failure: function (result, request) {
        Ext.MessageBox.alert("Failed", result.responseText);
      },
    });
  } else {
    Ext.Msg.alert("แจ้งเตือน", msg);
  }
};

const delete_dtl_period = function () {
  var win = new Ext.Window({
    id: "win-msg-delete",
    title: "Remove",
    modal: true,
    width: 250,
    height: 130,
    html: "ท่านต้องการที่จะลบข้อมูล ?",
    buttons: [
      {
        text: "ตกลง",
        handler: function () {
          Ext.Ajax.request({
            url: "tor/api/mnTorController.php",
            params: {
              mode: "DELETE_SP_TOR_DTL_PERIOD",
              id: Ext.SP_TOR_DTL_PERIOD_ID,
            },
            method: "GET", //POST
            success: function (result, request) {
              Ext.getCmp("win-msg-delete").destroy();
              Ext.store4.load({
                callback: function (record, operation, success) {
                  if (success) {
                    var i = this.data.length - 1;
                    if (i >= 0) {
                      Ext.getCmp("bbf_total_price4ID").setValue(record[i].get("f_total_amt"));
                      Ext.getCmp("bbf_qty4ID").setValue(record[i].get("i_qty_amt"));
                    } else {
                      Ext.getCmp("bbf_total_price4ID").setValue("0");
                      Ext.getCmp("bbf_qty4ID").setValue("0.00");
                    }
                  }
                },
              });
            },
            failure: function (result, request) {
              Ext.MessageBox.alert("Failed", result.responseText); // connect error
            },
          });
          Ext.getCmp("gridSub3ID").getStore().reload();
          Ext.store3.load();
        },
      },
      {
        text: "ยกเลิก",
        handler: function () {
          Ext.getCmp("win-msg-delete").hide();
          Ext.getCmp("win-msg-delete").destroy();
          Ext.getCmp("tabpanel1").getStore().reload();
        },
      },
    ],
  }).show();
};
Ext.Poplov_in = Ext.extend(Ext.Button, {
  config: {},
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
      ["c_tax_number_imp", "เลขที่ประจำตัวผู้เสียภาษี"],
      ["c_name", "ชื่อ"],
    ];
    var setFilter = [["c_name", "ชื่อ"]];

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
        value: Ext.isEmpty(defFilter) ? "c_tax_number_imp" : defFilter,
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
              store.setBaseParam("type", "SEARCH");
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
        store.setBaseParam("type", "SEARCH");
        store.setBaseParam("filter", Ext.getCmp("filter" + id).getValue());
        store.setBaseParam("value", Ext.getCmp("value-box" + id).getValue());
        Ext.getCmp("win-pop-lov-modal-" + id)
          .getStore()
          .load();
      } else {
        store.setBaseParam("type", "");
        Ext.getCmp("win-pop-lov-modal-" + id)
          .getStore()
          .load();
      }
    }

    var cellClick_lov = function (grid, rowIndex, columnIndex, e) {
      var record = grid.getStore().getAt(rowIndex);
      var TextShow = record.data.c_tax_number_imp + " " + record.data.c_name;
      Ext.getCmp(id).setValue(record.data.id);
      Ext.getCmp(nameID).setValue(TextShow);

      Ext.getCmp("win-pop-lov" + id).hide();
      Ext.getCmp("win-pop-lov" + id).destroy();
    };

    cellClick_lov = this.isCellClickGrid ? this.cellClickGrid : cellClick_lov;
    //*++
    return {
      fieldLabel: this.fieldLabel,
      xtype: "radiogroup",
      id: "pop_" + this.id,
      columns: [0, widthText, 40],
      hidden: this.hidden == true ? true : false,
      listeners: {
        afterrender: this.afterrender,
      },
      items: [
        {
          xtype: "hidden",
          name: this.valueHidden,
          id: id,
          value: this.value,
        },
        {
          xtype: "textfield",
          name: "txt" + this.id,
          emptyText: this.text,
          id: nameID,
          readOnly: true,
        },
        {
          xtype: "button",
          id: "Bu" + this.id,
          name: "Bu" + this.id,
          iconCls: this.iconCls,
          handler: function () {
            /* //Load Store Begin SearchGrid */
            store.setBaseParam("type", "");
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
                        SearchGrid(store, id);
                      },
                    },
                    "->",
                    {
                      id: "buBackSub2ID",
                      xtype: "button",
                      iconCls: "icon-add",
                      text: "เพิ่มรายชื่อ",
                      disabled: true,

                      handler: function () {
                        //*--
                        Ext.DidderAdd();
                        // Ext.getCmp("winChequeID").setActiveTab(0);
                      },
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
                  bbar: new Ext.PagingToolbar({
                    pageSize: 20,
                    store: store,
                    displayInfo: true,
                    displayMsg: "Displaying topics {0} - {1} of {2}",
                  }),
                },
              ],
            });

            win.show();
            Ext.getCmp("win-pop-lov-modal-" + id).on("cellclick", cellClick_lov, this);
          },
        },
      ],
    };
  }, //Mini
});
Ext.storeCreditor = new Ext.data.JsonStore({
  //autoLoad: true,
  storeId: "myStoreCont",
  url: "tor/api/mnTorController.php",
  baseParams: { mode: "LIST_POP_CREDITOR", id: 0 },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [{ name: "no" }, { name: "dc_creditor_id2" }, { name: "c_tax_number_imp" }, { name: "c_name" }],
});
var columnMini = [
  {
    header: "ID System",
    sortable: true,
    hidden: true,
    dataIndex: "dc_creditor_id2",
  },
  {
    header: "",
    sortable: true,
    hidden: true,
    dataIndex: "c_code",
  },
  {
    header: "เลขที่ประจำตัวผู้เสียภาษี",
    align: "center",
    width: 150,
    sortable: true,
    dataIndex: "c_tax_number_imp",
  },
  {
    header: "ชื่อ",
    sortable: true,
    id: "c_name",
    dataIndex: "c_name",
    renderer: function (value, metaData, record, rowIndex, colIndex, store) {
      metaData.attr = "style='cursor:pointer';";
      return value;
    },
  },
];
var PopCreditorForm = new Ext.Poplov_in({
  text: "เลือกผู้เสนอราคา",
  id: "dc_creditor_id2ID",
  iconCls: "page_magnify",
  valueHidden: "dc_creditor_id2",
  store: Ext.storeCreditor,
  headerGrid: columnMini,
  widthText: 400,
  fieldLabel: "เลือกผู้เสนอราคา",
  isCellClickGrid: true,
  cellClickGrid: function (grid, rowIndex, columnIndex, e) {
    console.log(Ext.store3);
    var id = "dc_creditor_id2ID";
    var nameID = id + "_Name";
    var record = grid.getStore().getAt(rowIndex);
    var c_tax_number_imp = record.data.c_tax_number_imp == null ? "(ไม่มีเลขที่ประจำตัวผู้เสียภาษี)" : record.data.c_tax_number_imp;
    var TextShow = c_tax_number_imp + " : " + record.data.c_name;
    Ext.getCmp("dc_creditor_id2ID").setValue(record.data.dc_creditor_id);
    Ext.getCmp("dc_creditor_per_idID").setValue(record.json.dc_creditor_id);
    //         console.log(record);
    console.log(nameID);
    console.log(TextShow);
    // Ext.getCmp("d_end_dateID").setValue(record.data.d_due_date);
    // var f_total = parseFloat(record.data.f_total_amt.replace(/,/g, "") / 1);
    // Ext.getCmp("f_total_amtID").setValue(Ext.floatRenderer(f_total));  dc_creditor_id2ID_Name
    Ext.getCmp(nameID).setValue(TextShow);
    Ext.getCmp("win-pop-lov" + id).hide();
    Ext.getCmp("win-pop-lov" + id).destroy();
  },
});
const delete_htl_period = function () {
  var win = new Ext.Window({
    id: "win-msg-delete",
    title: "Remove",
    modal: true,
    width: 250,
    height: 130,
    html: "ท่านต้องการที่จะลบข้อมูล ?",
    buttonAlign: "left",
    buttons: [
      {
        text: "Confirm",
        handler: function () {
          Ext.Ajax.request({
            url: "tor/api/mnTorController.php",
            params: {
              mode: "DELETE_SP_TOR_HDR_PERIOD",
              id: Ext.SP_TOR_HDR_PERIOD_ID,
            },
            method: "GET", //POST
            success: function (result, request) {
              Ext.getCmp("win-msg-delete").destroy();
              Ext.store3.load({
                callback: function (record, operation, success) {
                  // if (success) {
                  //   var i = this.data.length - 1;
                  //   if (i >= 0) {
                  //     Ext.getCmp("bbf_total_price4ID").setValue(record[i].get("f_total_amt"));
                  //     Ext.getCmp("bbf_qty4ID").setValue(record[i].get("i_qty_amt"));
                  //   } else {
                  //     Ext.getCmp("bbf_total_price4ID").setValue("0");
                  //     Ext.getCmp("bbf_qty4ID").setValue("0.00");
                  //   }
                  // }
                },
              });
            },
            failure: function (result, request) {
              Ext.MessageBox.alert("Failed", result.responseText); // connect error
            },
          });
        },
      },
      {
        text: "ยกเลิก",
        handler: function () {
          Ext.getCmp("win-msg-delete").hide();
          Ext.getCmp("win-msg-delete").destroy();
          Ext.getCmp("tabpanel1").getStore().reload();
        },
      },
    ],
  }).show();
};

function checkID(id, row) {
  var num2 = Ext.getCmp("gridEditor").store.data.items[row].data.f_unit_price;
  num2 = num2 ? num2.replace(/,/g, "") : "";
  var num = Ext.getCmp("gridEditor").store.data.items[row].data.i_qty;
  if (document.getElementById("chk_" + row).checked == true) {
    document.getElementById("num_" + row).value = num;
    var sum = document.getElementById("num_" + row).value * num2;
    document.getElementById("txt_sum_" + row).innerHTML = floatRenderer(floatMinus(sum, 2) + "&nbsp;&nbsp;&nbsp;");
  } else {
    document.getElementById("num_" + row).value = null;
    document.getElementById("txt_sum_" + row).innerHTML = "&nbsp;";
    // var rowitem = Ext.getCmp("gridEditor").store.data.items[row];
    // rowitem.set("i_num_select", null);
  }
}

function change_checkbox(value, row) {
  var num2 = Ext.getCmp("gridEditor").store.data.items[row].data.f_unit_price;
  var num = Ext.getCmp("gridEditor").store.data.items[row].data.i_qty;
  num2 = num2 ? num2.replace(/,/g, "") : "";
  if (document.getElementById("num_" + row).value > 0 && document.getElementById("num_" + row).value <= num) {
    document.getElementById("chk_" + row).checked = true;
    var sum = document.getElementById("num_" + row).value * num2;
    document.getElementById("txt_sum_" + row).innerHTML = floatRenderer(floatMinus(sum, 2) + "&nbsp;&nbsp;&nbsp;");
  } else {
    if (document.getElementById("num_" + row).value > num) {
      Ext.Msg.alert("แจ้งเตือน", "กรุณาระบุจำนวนไม่เกินที่ Tor กำหนด");
    }
    document.getElementById("chk_" + row).checked = false;
    document.getElementById("num_" + row).value = null;
    document.getElementById("txt_sum_" + row).innerHTML = "&nbsp;";
  }
}

function checkAll(v) {
  if (v) {
    var num = Ext.getCmp("gridEditor").store.data.items.length - 1;
    var row = 0;
    while (num >= row) {
      document.getElementById("chk_" + row).checked = true;
      checkID("", row);
      row++;
    }
  } else {
    var num = Ext.getCmp("gridEditor").store.data.items.length - 1;
    var row = 0;
    while (num >= row) {
      document.getElementById("chk_" + row).checked = false;
      checkID("", row);
      row++;
    }
  }
}
var columnMini = [
  {
    header: "ID System",
    sortable: true,
    hidden: true,
    dataIndex: "dc_creditor_id",
  },
  {
    header: "",
    sortable: true,
    hidden: true,
    dataIndex: "c_code",
  },
  {
    header: "เลขที่ประจำตัวผู้เสียภาษี",
    align: "center",
    width: 150,
    sortable: true,
    dataIndex: "c_tax_number_imp",
  },
  {
    header: "ชื่อ",
    sortable: true,
    id: "c_name",
    dataIndex: "c_name",
    renderer: function (value, metaData, record, rowIndex, colIndex, store) {
      metaData.attr = "style='cursor:pointer';";
      return value;
    },
  },
];
function win_hdr_period(event, rec) {
  var ev = event;
  var tabs = new Ext.FormPanel({
    labelWidth: 175,
    bodyStyle: "padding:1px",
    id: "form-widgets",
    url: "tor/api/mnTorController.php",
    border: false,
    width: 1000,
    listeners: {
      afterrender: function (obj, eOpts) {
        if (ev == "ADD") {
          //                    console.log(Ext.selectRow.dataf_total_amt);
          //                    console.log(Ext.storeSUMcontract.data.items[0].json.sum_period);
          var i_per = Ext.storeSUMcontract.data.items[0].json.sum_period + 1;
          Ext.getCmp("d_doc_dateID").setValue(Ext.selectRow.data.d_doc_date);
          Ext.getCmp("dc_expense_budget_type_id1TxtID").setValue(Ext.selectRow.data.dc_expense_budget_type_id);
          Ext.getCmp("i_alertID").setValue(7);
          Ext.getCmp("i_periodID").setValue(i_per);
          Ext.getCmp("f_total_amtID").setValue(Ext.selectRow.data.f_total_amt);
          Ext.getCmp("dc_creditor_per_text").setValue(Ext.selectRow.data.dc_creditor_idTxt);
        }

        if (Ext.selectRow.data.i_is_join_venture == 1) {
          Ext.getCmp("dc_creditor_idID_pop").show();
          Ext.getCmp("dc_creditor_per_text").hide();
        } else {
          Ext.getCmp("dc_creditor_idID_pop").hide();
          Ext.getCmp("dc_creditor_per_text").show();
        }

        switch (event) {
          case "SHOW":
            Ext.getCmp("buSaveSub2ID").hide();
            Ext.getCmp("buSaveEditID").hide();
            break;
          case "EDIT":
            Ext.getCmp("buSaveSub2ID").hide();
            Ext.getCmp("buSaveEditID").show();
            break;
          case "ADD":
            Ext.getCmp("buSaveSub2ID").show();
            Ext.getCmp("buSaveEditID").hide();
            break;
        }
      },
    },
    items: {
      xtype: "tabpanel",
      activeTab: 0,
      defaults: {
        autoHeight: true,
        bodyStyle: "padding:10px",
      },
      items: [
        {
          title: "รายละเอียดงวดงานในสัญญา", //htmleditor
          layout: "form",
          defaults: { width: 500 },
          border: false,
          defaultType: "textfield",
          items: [
            {
              xtype: "hidden",
              name: "mode",
              value: "UP_SP_TOR_HDR_PERIOD_NEW",
            },
            {
              xtype: "hidden",
              name: "sp_tor_hdr_period_id",
              value: Ext.SP_TOR_HDR_PERIOD_ID,
            },
            {
              xtype: "hidden",
              name: "tor_id",
              value: Ext.TOR_ID,
            },
            {
              xtype: "hidden",
              name: "sp_tor_contract_id",
              value: Ext.SP_TOR_CONTRACT_ID,
            },
            {
              xtype: "hidden",
              name: "i_is_join_ventureID",
              value: Ext.selectRow.data.i_is_join_venture,
              //                        },
              //                        {
              //                            xtype: "hidden",
              //                            name: "po_expense_id",
              //                            value: Ext.selectRow.data.po_expense_id,
            },
            {
              xtype: "hidden",
              name: "c_name",
              value: Ext.selectRow.data.c_name,
            },
            {
              xtype: "hidden",
              name: "i_qty",
              value: 1,
            },
            {
              xtype: "hidden",
              name: "dc_unit_type_id",
              value: 24,
            },
            {
              xtype: "hidden",
              name: "i_is_po",
              value: Ext.I_IS_PO,
            },
            {
              xtype: "hidden",
              name: "i_is_purchase",
            },
            {
              xtype: "hidden",
              name: "ap_po_hdr_id",
            },
            {
              fieldLabel: "งวดงานที่ 0",
              xtype: "numberfield",
              style: "text-align: center",
              name: "i_period",
              id: "i_periodID",
              width: 50,
              validator: function (val) {
                var regex = /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\.)?$/;
                if (!regex.test(val)) {
                  return "กรุณากรอก ตัวเลข";
                  return true;
                } else {
                  return true;
                }
              },
            },
            {
              xtype: "checkbox",
              id: "i_is_lastID",
              name: "i_is_last",
              height: 20,
              boxLabel: "กรณีเป็นงวดสุดท้าย/งวดเดียว/PO จะมีการแจ้งเตือนก่อนหมดสัญญา",
              inputValue: "1",
            },
            {
              xtype: "datefield",
              fieldLabel: "วันที่เริ่มนับการส่งของในงวด  ",
              id: "d_doc_dateID",
              name: "d_doc_date",
              width: 100,
              validator: function (val) {
                if (Ext.isEmpty(val)) {
                  return "กรุณากรอก วันที่เริ่มนับการส่งของในงวด ";
                } else {
                  return true;
                }
              },
              listeners: {
                change: function () {
                  d_doc_dateID_Change();
                },
              },
            },
            {
              xtype: "radiogroup",
              columns: [150, 200],
              fieldLabel: "ลักษณะบันทึกวันส่งงวด",
              id: "i_day_useID",
              name: "i_day_use",
              items: [
                {
                  checked: true,
                  inputValue: 1,
                  name: "i_day_use_l",
                  boxLabel: "วันที่กำหนดส่งในงวดงาน",
                },
                {
                  inputValue: 0,
                  name: "i_day_use_l",
                  boxLabel: "จำนวนวันที่กำหนดส่งในงวดงาน",
                },
              ], //radiogroup
              listeners: {
                change: function () {
                  if (this.getValue().inputValue == 0) {
                    Ext.getCmp("group_period_date").hide();
                    Ext.getCmp("group_i_day").show();
                  } else {
                    Ext.getCmp("group_period_date").show();
                    Ext.getCmp("group_i_day").hide();
                  }
                },
              },
            },
            {
              xtype: "buttongroup",
              fieldLabel: "วันที่กำหนดส่งในงวดงาน  ",
              id: "group_period_date",
              width: 500,
              frame: false,
              border: false,
              items: [
                {
                  xtype: "datefield",
                  id: "d_period_dateID",
                  name: "d_period_date",
                  width: 100,
                  validator: function (val) {
                    if (Ext.isEmpty(val)) {
                      return "กรุณากรอก วันที่กำหนดส่งในงวดงาน  ";
                    } else {
                      return true;
                    }
                  },
                  listeners: {
                    change: function () {
                      d_period_dateID_change();
                    },
                  },
                },
                {
                  xtype: "tbspacer",
                  width: 18,
                },
                {
                  xtype: "displayfield",
                  id: "txt_d_period_dateID",
                  value: "",
                  width: 400,
                  style: {
                    color: "red",
                  },
                },
              ],
            },
            {
              xtype: "buttongroup",
              fieldLabel: "จำนวนวันที่กำหนดส่งในงวดงาน  ",
              id: "group_i_day",
              hidden: true,
              hideMode: "offsets",
              width: 500,
              frame: false,
              border: false,
              items: [
                {
                  xtype: "textfield",
                  id: "i_dayID",
                  style: "text-align: center",
                  name: "i_day",
                  width: 50,
                  validator: function (val) {
                    var regex = /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\.)?$/;
                    if (!regex.test(val)) {
                      return "กรุณากรอก ตัวเลข";
                      return true;
                    } else {
                      return true;
                    }
                  },
                  listeners: {
                    change: function () {
                      i_dayID_Change();
                    },
                  },
                },
                {
                  xtype: "displayfield",
                  value: "วัน",
                },
                {
                  xtype: "tbspacer",
                  width: 18,
                },
                {
                  xtype: "displayfield",
                  id: "txt_i_dayID",
                  value: "",
                  width: 400,
                },
              ],
            },
            {
              xtype: "buttongroup",
              fieldLabel: "จำนวนวันที่แจ้งเตือน  ",
              id: "group_i_alert",
              frame: false,
              border: false,
              items: [
                {
                  xtype: "textfield",
                  id: "i_alertID",
                  style: "text-align: center",
                  name: "i_alert",
                  width: 50,
                  validator: function (val) {
                    var regex = /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\.)?$/;
                    if (!regex.test(val)) {
                      return "กรุณากรอก ตัวเลข";
                      return true;
                    } else {
                      return true;
                    }
                  },
                  listeners: {
                    change: function () {
                      i_alertID_Change();
                    },
                  },
                },
                {
                  xtype: "displayfield",
                  value: "วัน",
                },
                {
                  xtype: "tbspacer",
                  width: 18,
                },
                {
                  xtype: "displayfield",
                  id: "txt_i_alertID",
                  value: "",
                  width: 400,
                },
              ],
            },

            {
              fieldLabel: "วงเงินในงวด",
              id: "f_total_amtID",
              width: 150,
              name: "f_total_amt",
              listeners: {
                blur: function () {
                  var f_total = parseFloat(this.getValue().replace(/,/g, "") / 1);
                  this.setValue(Ext.floatRenderer(f_total));
                },
              },
              style: {
                labelAlign: "right",
                "font-weight": "bold",
                padding: "1px",
                margin: "1px",
                color: "blue",
                "background-color": "#fff",
                "text-align": "right",
              },
            },
            {
              xtype: "buttongroup",
              fieldLabel: "แหล่งเงิน ",
              frame: false,
              border: false,
              items: [
                new Ext.form.ComboBox({
                  mode: "local",
                  store: Ext.dc_expense_budget_type2,
                  fieldLabel: "แหล่งเงินที่ ",
                  width: 300,
                  // value: Ext.selectRow.get('dtl_dc_expense_budget_type_id'), // เปิดใช้งานหลัง run ระบบ
                  submitValue: true,
                  id: "dc_expense_budget_type_id1TxtID",
                  name: "dc_bg_budget_type_id",
                  hiddenName: "dc_expense_budget_type_id",
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
                      this.fn = function () {
                        console.log(this.store);
                        // alert(this.getValue());
                      };
                      this.fn();
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
                      //***************************************************************************************แผนหรืองวด*******************************************************************

                      if (this.getValue() == 4 || this.getValue() == 5) {
                        Ext.getCmp("i_pr_type2ID").setValue(2);
                      } else {
                        Ext.getCmp("i_pr_type2ID").setValue(1);
                      }
                      //*********************************************************************************************************************************************************************
                      // alert(this.getValue());
                    },
                  },
                }),
              ],
            },
            new Ext.form.ComboBox({
              mode: "local",
              //                    readOnly: true,
              store: Ext.dc_cost,
              width: 400,
              fieldLabel: "หน่วยงานที่รับของ",
              value: Ext.selectRow.get("dc_cost2_id"),
              valueField: "id",
              displayField: "c_name",
              hiddenName: "dc_cost2_id",
              id: "dc_cost2_idID",
              name: "c_cost2_name",
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
                  this.fn = function () {
                    this.store;
                  };
                  this.fn();
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
              xtype: "hidden",
              name: "dc_creditor_id",
              id: "dc_creditor_per_idID",
              value: Ext.selectRow.data.dc_creditor_id,
            },
            {
              xtype: "hidden",
              name: "i_is_join_venture_per",
              id: "i_is_join_venture_perID",
              value: Ext.selectRow.data.i_is_join_venture,
            },
            {
              xtype: "textfield",
              width: 250,
              fieldLabel: "ผู้ขายผู้รับจ้าง",
              hidden: true,
              id: "dc_creditor_per_text",
              style: "text-align: center;font-weight:bold;background:#eee;",
              readOnly: true,
              name: "c_code",
            },
            {
              xtype: "radiogroup",
              columns: [98, 110],
              fieldLabel: "ลักษณะการจ้าง",
              id: "period_i_hire_typehdr",
              name: "i_hire_type",
              items: [
                {
                  checked: true,
                  inputValue: 1,
                  name: "i_hire_type_lhdr",
                  boxLabel: "จ้างแบบได้ของ",
                },
                {
                  inputValue: 0,
                  name: "i_hire_type_lhdr",
                  boxLabel: "จ้างแบบไม่มีของ",
                },
              ], //radiogroup
              listeners: {
                change: function () {
                  if (this.getValue().inputValue == 0) {
                    Ext.getCmp("period_i_product_typehdr").hide();
                    Ext.getCmp("period_i_is_invGhdr").hide();
                    //                                       Ext.getCmp('inv_mode_idID').hide();
                    //                                    Ext.getCmp('am_mode_idID').hide();
                  } else {
                    Ext.getCmp("period_i_product_typehdr").show();
                    Ext.getCmp("period_i_is_invGhdr").show();
                    //      Ext.getCmp('inv_mode_idID').show();
                    //       Ext.getCmp('am_mode_idID').show();
                  }
                },
                afterrender: function () {
                  if (Ext.selectRow.get("i_purchase") == 1) this.hide();
                  else this.show();
                },
              },
            },
            {
              xtype: "radiogroup",
              columns: [80, 80, 80, 80],
              id: "period_i_product_typehdr",
              fieldLabel: "ของที่ได้มา",
              name: "i_product_typehdr",
              items: [
                {
                  checked: true,
                  name: "i_product_typehdr",
                  inputValue: 1,
                  boxLabel: "วัสดุทั่วไป",
                  id: "i_product_typehdr1",
                },
                {
                  name: "i_product_typehdr",
                  id: "i_product_typehdr0",
                  inputValue: 0,
                  boxLabel: "ไม่มีของ",
                },
                {
                  inputValue: 2,
                  name: "i_product_typehdr",
                  id: "i_product_typehdr2",
                  boxLabel: "ครุภัณฑ์",
                },
              ], //radiogroup
              listeners: {
                afterrender: function () {
                  if (Ext.getCmp("period_i_hire_typehdr").getValue().inputValue == 0) {
                    Ext.getCmp("period_i_product_typehdr").hide();
                    Ext.getCmp("period_i_is_invGhdr").hide();
                  } else {
                    Ext.getCmp("period_i_product_typehdr").show();
                    Ext.getCmp("period_i_is_invGhdr").show();
                  }
                },
              },
            },
            {
              xtype: "checkboxgroup",
              fieldLabel: "การจัดเก็บ",
              name: "period_i_is_inv",
              id: "period_i_is_invGhdr",
              items: [
                {
                  id: "period_i_is_invGhdr2",
                  boxLabel: "เข้าคลัง",
                  name: "i_is_inv",
                  // inputValue: 1,
                  listeners: {
                    afterrender: function () {
                      if (Ext.selectRow_PeridDtl != null) {
                        if (Ext.selectRow_PeridDtl.get("i_is_inv") == true) {
                          Ext.getCmp("period_i_is_invGhdr2").setValue(true);
                        }
                      }
                    },
                  },
                },
              ],
            },
            {
              xtype: "compositefield",
              id: "dc_creditor_idID_pop",
              hidden: true,
              fieldLabel: "เลือกผู้เสนอราคา",
              msgTarget: "side",
              anchor: "-20",
              defaults: {
                flex: 1,
              },
              items: [PopCreditorForm.mini],
            },
            {
              xtype: "radiogroup",
              columns: [98, 98],
              fieldLabel: "",
              id: "already_withdrawnID",
              name: "already_withdrawn",
              items: [
                {
                  checked: true,
                  name: "already_withdrawn",
                  inputValue: 1,
                  boxLabel: "ยังไม่เบิก",
                },
                {
                  inputValue: 2,
                  name: "already_withdrawn",
                  boxLabel: "เบิกแล้ว",
                },
              ], //radiogroup
            },
            {
              xtype: "radiogroup",
              columns: [98, 98],
              fieldLabel: "",
              hidden: true,
              id: "i_pr_type2ID",
              name: "i_pr_type1",
              items: [
                {
                  checked: true,
                  name: "i_pr_type1",
                  inputValue: 1,
                  boxLabel: "จองแบบแผน",
                },
                {
                  inputValue: 2,
                  name: "i_pr_type1",
                  boxLabel: "จองแบบงวด",
                },
              ], //radiogroup
            },
            // {
            //     fieldLabel: "หมายเหตุ",
            //     id: "c_comment_product3ID",
            //     name: "c_discription3",
            //     xtype: "textarea",
            //     height: 40,
            //     width: 430,
            //     listeners: {
            //         render: function (p) {
            //             // this.hide();
            //         },
            //         afterrender: function () {
            //             if (Ext.SP_TOR_HDR_PERIOD_ID > 0) {
            //                 d_doc_dateID_Change();
            //             }
            //         },
            //     },
            // },
            {
              fieldLabel: "",
              id: "copy_contract_dtl_id",
              name: "copy_contract_dtl",
              xtype: "radiogroup",
              columns: [150, 150],
              items: [
                {
                  checked: true,
                  inputValue: "save",
                  name: "copy_contract_dtl",
                  boxLabel: "บันทึกรายการ",
                },
                {
                  inputValue: "copy_period",
                  hidden: Ext.SP_TOR_HDR_PERIOD_ID > 0 ? false : true,
                  name: "copy_contract_dtl",
                  boxLabel: "คัดลอกรายการ",
                },
              ],
            },
          ],
        },
      ],
      listeners: {
        afterrender: function () {
          if (Ext.selectRow_PeridHdr != null) {
            // Ext.getCmp("dc_creditor_id2ID_Name").setValue()
            console.log(Ext.SelectStore);
            // console.log(Ext.SelectStore);
            // console.log(Ext.store3);
            Ext.getCmp("dc_creditor_per_idID").setValue(Ext.SelectStore.data.dc_creditor_period_id);
            Ext.getCmp("dc_creditor_id2ID_Name").setValue(Ext.SelectStore.data.dc_creditor_period_name);
          }
        },
      },
    },
  });
  Ext.storeUnitType.load({
    callback: function (recordx, operation, success) {
      if (success) {
        var win = new Ext.Window({
          id: "win-frm-dtlID",
          width: 1000,
          height: 550,
          plain: true,
          modal: true,
          items: tabs,
          buttonAlign: "left",
          buttons: [
            {
              text: "บันทึกรายการ",
              id: "buSaveSub2ID",
              hidden: true,
              iconCls: "icon-save",
              handler: function () {
                msg = "";
                Ext.storeSUMcontract.setBaseParam("sp_tor_contract_id", Ext.selectRow.get("sp_tor_contract_id"));
                Ext.storeSUMcontract.load({
                  callback: function (record, operation, success) {
                    if (success) {
                      var rec = record[0];
                      var f_total = Ext.getCmp("f_total_amtID").getValue().replace(/,/g, "") / 1; // จำนวนเงินงวด
                      var f_unit_costID = Ext.selectRow.get("f_total_amt").replace(/,/g, "") / 1; // จำนวนเงินสัญญา
                      var f_total_amt = rec.get("f_total_amt"); //.replace(/,/g, "") / 1; // จำนวนเงินของทุกงวดรวมกัน
                      var copy_contract_dtl_id = Ext.getCmp("copy_contract_dtl_id").getValue().inputValue;
                      var f_total_sum = f_total + f_total_amt; // จำนวนเงินของทุกงวดที่บันทึกข้อมูลไปแล้ว + จำนวนเงินที่คีย์อยู่
                      if (f_total > f_unit_costID) {
                        Ext.Msg.alert("แจ้งเตือน", "ยอดเงินเกินวงเงินในสัญญา");
                        return false;
                      } else if (f_total_sum > f_unit_costID) {
                        Ext.Msg.alert("แจ้งเตือน", "ยอดรวมของทุกงวดเกินวงเงินในสัญญาสัญญา");
                        return false;
                      } else if ([null, 0, "", "0.00", 0.0].includes(Ext.getCmp("f_total_amtID").getValue())) {
                        Ext.Msg.alert("แจ้งเตือน", "ยังไม่ได้ระบุจำนวนเงิน");
                        return false;
                      } else {
                        var formSubmit = function () {
                          form.submit({
                            waitMsg: "Saving Data...",
                            success: function (form, action) {
                              Ext.SP_TOR_HDR_PERIOD_ID = action.result.id;
                              var d_period_date = action.result.d_period_date;
                              var i_period = action.result.i_period;
                              var c_doc_ref_contract = action.result.c_doc_ref_contract;
                              var dc_creditor_name = action.result.dc_creditor_name;
                              var f_total_amt = action.result.f_total_amt;
                              Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                Ext.getCmp("gridSub3ID").getStore().reload();
                                Ext.store3.load();
                                Ext.storeSUMcontract.load();
                                // Ext.selectRow = null;
                                Ext.getCmp("win-frm-dtlID").destroy();
                                Ext.store4.setBaseParam("tor_id", Ext.SP_TOR_HDR_PERIOD_ID);
                                Ext.store4.setBaseParam("sp_tor_hdr_period_id", Ext.SP_TOR_HDR_PERIOD_ID);
                                Ext.store4.load({
                                  callback: function (record, operation, success) {},
                                });
                                Ext.getCmp("DISPLAY_c_name_dtl_period").setValue(c_doc_ref_contract);
                                Ext.getCmp("DISPLAY_creditor_name_dtl_period").setValue(dc_creditor_name);
                                Ext.getCmp("DISPLAY_creditor_d_doc_date_dtl_period").setValue(d_period_date);
                                Ext.getCmp("DISPLAY_creditor_f_total_amt_dtl_period").setValue(f_total_amt);
                                Ext.getCmp("winChequeID").unhideTabStripItem(2);
                                Ext.getCmp("winChequeID").setActiveTab(1);

                                // if (Ext.getCmp("copy_contract_dtl_id").getValue().inputValue == 'save')
                                //     Ext.getCmp("winChequeID").setActiveTab(2);
                                // else
                              });
                            },
                            failure: function (form, action) {
                              switch (action.failureType) {
                                case Ext.form.Action.CLIENT_INVALID:
                                  Ext.Msg.alert("แจ้งเตือน", "กรอกข้อมูลให้ครบถ้วน !!!");
                                  break;
                                case Ext.form.Action.CONNECT_FAILURE:
                                  Ext.Msg.alert("แจ้งเตือน", "พลข้อผิดพลาดในการเชื่อต่อเครือข่าย");
                                  break;
                                case Ext.form.Action.SERVER_INVALID:
                                  Ext.Msg.alert("แจ้งเตือน", action.result.msg);
                              }
                            },
                          });
                        }; //END
                        var form = Ext.getCmp("form-widgets").getForm();
                        formSubmit(form);
                      }
                    }
                  },
                });
              },
            },
            {
              text: "แก้ไขรายการ",
              id: "buSaveEditID",
              iconCls: "icon-save-edit",
              hidden: true,
              handler: function () {
                msg = "";
                Ext.storeSUMcontract.setBaseParam("sp_tor_contract_id", Ext.selectRow.get("sp_tor_contract_id"));
                Ext.storeSUMcontract.load({
                  callback: function (record, operation, success) {
                    if (success) {
                      var rec = record[0];
                      var f_total = Ext.getCmp("f_total_amtID").getValue().replace(/,/g, "") / 1; // จำนวนเงินงวด
                      var f_period = Ext.selectRow_PeridHdr.get("f_total_amt").replace(/,/g, "") / 1; // จำนวนเงินงวด
                      var f_unit_costID = Ext.selectRow.get("f_total_amt").replace(/,/g, "") / 1; // จำนวนเงินสัญญา
                      var f_total_amt = rec.get("f_total_amt"); //.replace(/,/g, "") / 1; // จำนวนเงินของทุกงวดรวมกัน
                      var f_total_sum = f_total + f_total_amt; // จำนวนเงินของทุกงวดที่บันทึกข้อมูลไปแล้ว + จำนวนเงินที่คีย์อยู่
                      var f = f_total_amt - f_period + f_total;
                      if (f_total > f_unit_costID) {
                        Ext.Msg.alert("แจ้งเตือน", "ยอดเงินเกินวงเงินในสัญญา");
                        return false;
                      } else if (f > f_unit_costID) {
                        Ext.Msg.alert("แจ้งเตือน", "ยอดรวมของทุกงวดเกินวงเงินในสัญญาสัญญา");
                        return false;
                      } else {
                        var formSubmit = function () {
                          form.submit({
                            waitMsg: "Saving Data...",
                            success: function (form, action) {
                              Ext.SP_TOR_HDR_PERIOD_ID = action.result.id;
                              var d_period_date = action.result.d_period_date;
                              var i_period = action.result.i_period;
                              var c_doc_ref_contract = action.result.c_doc_ref_contract;
                              var dc_creditor_name = action.result.dc_creditor_name;
                              var f_total_amt = action.result.f_total_amt;
                              var i_period = action.result.i_period;

                              Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                Ext.getCmp("gridSub3ID").getStore().reload();
                                Ext.store3.load();
                                Ext.storeSUMcontract.load();
                                // Ext.selectRow = null;
                                Ext.getCmp("win-frm-dtlID").destroy();
                                Ext.store4.setBaseParam("tor_id", Ext.SP_TOR_HDR_PERIOD_ID);
                                Ext.store4.setBaseParam("sp_tor_hdr_period_id", Ext.SP_TOR_HDR_PERIOD_ID);
                                Ext.store4.load({
                                  callback: function (record, operation, success) {},
                                });
                                Ext.getCmp("DISPLAY_c_name_dtl_period").setValue(c_doc_ref_contract);
                                Ext.getCmp("DISPLAY_creditor_name_dtl_period").setValue(dc_creditor_name);
                                Ext.getCmp("DISPLAY_creditor_d_doc_date_dtl_period").setValue(d_period_date);
                                Ext.getCmp("DISPLAY_creditor_f_total_amt_dtl_period").setValue(f_total_amt);
                                Ext.getCmp("winChequeID").unhideTabStripItem(2);
                                Ext.getCmp("winChequeID").setActiveTab(1);
                              });
                            },
                            failure: function (form, action) {
                              switch (action.failureType) {
                                case Ext.form.Action.CLIENT_INVALID:
                                  Ext.Msg.alert("แจ้งเตือน", "กรอกข้อมูลให้ครบถ้วน !!!");
                                  break;
                                case Ext.form.Action.CONNECT_FAILURE:
                                  Ext.Msg.alert("แจ้งเตือน", "พลข้อผิดพลาดในการเชื่อต่อเครือข่าย");
                                  break;
                                case Ext.form.Action.SERVER_INVALID:
                                  Ext.Msg.alert("แจ้งเตือน", action.result.msg);
                              }
                            },
                          });
                        }; //END
                        var form = Ext.getCmp("form-widgets").getForm();
                        formSubmit(form);
                      }
                    }
                  },
                });
              },
            },
            {
              text: "ยกเลิก",
              handler: function () {
                Ext.getCmp("win-frm-dtlID").destroy();
              },
            },
          ],
        });
        var rec = Ext.selectRow_PeridHdr;
        if (Ext.selectRow_PeridHdr != null) {
          Ext.getCmp("win-frm-dtlID").items.items[0].getForm().loadRecord(rec);
        }
        win.show();
      }
    },
  });
}

function win_dtl_period(mode, rec) {
  Ext.stotrePeriodDtl = rec;
  if (mode == "ADD") {
    set_dc_expense_budget_type_id = rec.data.dc_expense_budget_type_id;
  } else {
    set_dc_expense_budget_type_id = rec.data.dc_bg_budget_type_id;
  }
  Ext.am_mode_acc = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_AmModeAcc.php",
    baseParams: {
      type: "am_mode_acc",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_code", "c_name"],
  });
  Ext.inv_mode_acc = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_AmModeAcc.php",
    baseParams: {
      type: "inv_mode_acc",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_code", "c_name"],
  });
  Ext.storeSumPeriod = new Ext.data.JsonStore({
    storeId: "myStore3",
    autoLoad: true,
    url: "tor/api/mnTorController.php",
    root: "data",
    baseParams: {
      mode: "storeSumPeriod",
      sp_tor_contract_id: Ext.SP_TOR_CONTRACT_ID,
      sp_tor_hdr_period_id: Ext.SP_TOR_HDR_PERIOD_ID, //rec.data.id,
      i_period: rec.data.i_period,
    }, //Permission i_read
    idProperty: "id",
    totalProperty: "totalCount",
    fields: [{ name: "f_total_amt" }, { name: "f_total_amt2", type: "string" }, { name: "sum_period" }, { name: "sum_period_hdr" }],
  });
  var tabs = new Ext.FormPanel({
    labelWidth: 200,
    autoHeight: true,
    autoScroll: true,
    border: false,
    width: 1000,
    items: {
      xtype: "tabpanel",
      activeTab: 0,
      autoHeight: true,
      defaults: {
        bodyStyle: "padding:10px",
      },
      items: [
        {
          title: "รายละเอียดของที่จัดซื้อไม่อยู่ใน TOR",
          id: "form-dtl-period",
          layout: "form",
          defaults: { width: 430 },
          autoHeight: true,
          defaultType: "textfield",
          // periodDtl
          items: [
            new Ext.form.ComboBox({
              mode: "local",
              store: Ext.dc_expense_budget_type2,
              fieldLabel: "แหล่งเงิน",
              anchor: "60%",
              submitValue: true,
              id: "period_dc_expense_budget_type_id",
              name: "dc_bg_budget_type_id",
              valueField: "id",
              displayField: "c_name",
              triggerAction: "all",
              forceSelection: true,
              selectOnFocus: true,
              typeAhead: false,
              emptyText: "กรุณาเลือกแหล่งเงิน...",
              listeners: {
                afterrender: function () {
                  this.setValue(set_dc_expense_budget_type_id);
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
            }), //
            new Ext.form.ComboBox({
              mode: "local",
              store: Ext.po_expense,
              valueField: "id",
              displayField: "c_name",
              width: 400,
              submitValue: true,
              id: "period_po_expense_id",
              name: "po_expense_id",
              triggerAction: "all",
              allBlank: true,
              forceSelection: true,
              selectOnFocus: true,
              fieldLabel: "รายการย่อย",
              typeAhead: false,
              emptyText: "กรุณาเลือกใช้จ่าย...",
              listeners: {
                afterrender: function () {
                  this.setValue(Ext.selectRow.data.po_expense_id);
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
              columns: [98, 110],
              fieldLabel: "ลักษณะการจ้าง",
              id: "period_i_hire_type",
              name: "i_hire_type",
              items: [
                {
                  checked: true,
                  inputValue: 1,
                  name: "i_hire_type_l",
                  boxLabel: "จ้างแบบได้ของ",
                },
                {
                  inputValue: 0,
                  name: "i_hire_type_l",
                  boxLabel: "จ้างแบบไม่มีของ",
                },
              ], //radiogroup
              listeners: {
                change: function () {
                  if (this.getValue().inputValue == 0) {
                    Ext.getCmp("period_i_product_type2").hide();
                    Ext.getCmp("period_i_is_invG2").hide();
                    //                                       Ext.getCmp('inv_mode_idID').hide();
                    //                                    Ext.getCmp('am_mode_idID').hide();
                  } else {
                    Ext.getCmp("period_i_product_type2").show();
                    Ext.getCmp("period_i_is_invG2").show();
                    //      Ext.getCmp('inv_mode_idID').show();
                    //       Ext.getCmp('am_mode_idID').show();
                  }
                },
                afterrender: function () {
                  if (Ext.selectRow.get("i_purchase") == 1) this.hide();
                  else this.show();
                },
              },
            },
            {
              xtype: "radiogroup",
              columns: [98, 98, 98],
              fieldLabel: "ของที่ได้มา",
              id: "period_i_product_type2",
              name: "i_product_type",
              items: [
                {
                  checked: true,
                  name: "i_product_type",
                  inputValue: 1,
                  boxLabel: "วัสดุทั่วไป",
                  id: "i_product_type1",
                },
                {
                  //                                    checked: true,
                  name: "i_product_type",
                  id: "i_product_type0",
                  inputValue: 0,
                  boxLabel: "ไม่มีของ",
                },
                {
                  inputValue: 2,
                  name: "i_product_type",
                  id: "i_product_type2",
                  boxLabel: "ครุภัณฑ์",
                },
              ], //radiogroup
              listeners: {
                afterrender: function () {
                  if (Ext.getCmp("period_i_hire_type").getValue().inputValue == 0) {
                    Ext.getCmp("period_i_product_type2").hide();
                    Ext.getCmp("period_i_is_invG2").hide();
                  } else {
                    Ext.getCmp("period_i_product_type2").show();
                    Ext.getCmp("period_i_is_invG2").show();
                  }
                },
              },
            },
            {
              xtype: "checkboxgroup",
              fieldLabel: "การจัดเก็บ",
              name: "period_i_is_inv",
              id: "period_i_is_invG2",
              items: [
                {
                  id: "period_i_is_invG2s1",
                  boxLabel: "เข้าคลัง",
                  name: "i_is_inv",
                  // inputValue: 1,
                  listeners: {
                    afterrender: function () {
                      if (Ext.selectRow_PeridDtl != null) {
                        if (Ext.selectRow_PeridDtl.get("i_is_inv") == true) {
                          Ext.getCmp("period_i_is_invG2s1").setValue(true);
                        }
                      }
                    },
                  },
                },
              ],
            },
            {
              fieldLabel: "ชื่อรายการ",
              id: "period_c_name",
              name: "c_name",
              allowBlank: false,
            },
            {
              fieldLabel: "จำนวน",
              xtype: "numberfield",
              id: "period_i_qty",
              name: "i_qty",
              value: 1,
            },
            {
              fieldLabel: "ราคา/ต่อหน่วย ",
              id: "period_f_net_unit_price",
              name: "f_net_unit_price",
              listeners: {
                Change: function () {},
                blur: function () {
                  var f_total = parseFloat(this.getValue().replace(/,/g, "") / 1);
                  this.setValue(Ext.floatRenderer(f_total));

                  if (this.getValue() == "" || this.getValue() == 0) {
                    this.setValue("0.00");
                  }
                },
                afterrender: function () {
                  if (this.getValue() == "" || this.getValue() == 0) {
                    this.setValue(Ext.stotrePeriodDtl.data.f_total_amt);
                  }
                },
              },
              style: {
                labelAlign: "right",
                "font-weight": "bold",
                padding: "1px",
                margin: "1px",
                color: "blue",
                "background-color": "#fff",
                "text-align": "right",
              },
            },
            new Ext.form.ComboBox({
              mode: "local",
              fieldLabel: "หน่วยนับ",
              submitValue: true,
              // hiddenName: "dc_unit_type_id",
              readOnly: true,
              id: "period_dc_unit_type_id",
              name: "dc_unit_type_id",
              store: Ext.storeUnitType,
              valueField: "id",
              displayField: "c_name",
              value: 24,
              triggerAction: "all",
              forceSelection: true,
              selectOnFocus: true,
              typeAhead: false,
              emptyText: "กรุณาเลือกหน่วยนับ...",
              listeners: {
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
                aftereditems: function () {
                  // console.log(Ext.storeUnitType);
                  // this.setValue(24);
                },
              },
            }),
          ],
        },
      ],
    },
    buttonAlign: "left",
    buttons: [
      {
        text: "บันทึกรายการ",
        id: "buSaveSub3ID",
        iconCls: "icon-save",
        //                            text: "Save",
        handler: function () {
          var msg = "";
          var rec = Ext.storeSumPeriod.data.items[0].data.f_total_amt2.replace(/,/g, "") / 1; // ยอดsum จากที่เคยคีย์
          var f_total_per = Ext.getCmp("period_f_net_unit_price").getValue().replace(/,/g, "") / 1; // ยอดที่กำลังคีย์
          var f_total_per_and_rec = f_total_per + rec;
          var f_total_period = Ext.storeSumPeriod.data.items[0].data.sum_period_hdr.replace(/,/g, "") / 1; // ยอดวงเงินในงวด
          //                    console.log(rec);
          //                    console.log(f_total_per);
          //                    console.log(f_total_per_and_rec);
          //                    console.log(f_total_period);
          //                    console.log(mode);
          if (mode == "EDIT") {
            if (f_total_per_and_rec > f_total_period) {
              msg += "- ยอดเงินเกิดจากงวด" + "\n";
            }

            if (Ext.getCmp("period_i_product_type2").getValue().inputValue != Ext.stotrePeriodDtl.get("i_product_type") / 1) {
              msg += "- การเลือกของที่ได้มาไม่ตรงกับงวด" + "\n";
            }
          } else {
          }

          if (msg != "") {
            Ext.example.msg("แจ้งเตือน", msg, 1);
            $(this).next("text copied");
            setTimeout(function () {
              $(this).next().remove();
            }, 6000);
            return;
          } else {
            savePerid();
            Ext.getCmp("gridSub3ID").getStore().reload();
            Ext.storeSumPeriod.load();
            Ext.store3.load();
          }
        },
      },
      {
        text: "ยกเลิก",
        handler: function () {
          Ext.getCmp("win-frm-perid-bal-dtl2ID").destroy();
        },
      },
    ],
  });
  var win = new Ext.Window({
    collapsible: true,
    maximizable: true,
    id: "win-frm-perid-bal-dtl2ID",
    layout: "fit",
    width: 1000,
    height: 400,
    title: "รายการของ",
    plain: true,
    modal: true,
    items: tabs,
    bbar: [{ xtype: "button" }],
  });
  var rec = Ext.selectRow_PeridDtl;
  if (Ext.selectRow_PeridDtl != null) {
    //        Ext.getCmp("win-frm-perid-bal-dtl2ID").items.items[0].getForm().loadRecord(rec);
    Ext.am_mode_acc.reload({
      callback: function (record, operation, success) {
        if (success) {
          Ext.am_mode_acc.reload({
            callback: function (record, operation, success) {
              if (success) {
                Ext.getCmp("win-frm-perid-bal-dtl2ID").items.items[0].getForm().loadRecord(rec);
              }
            },
          });
        }
      },
    });
  } else {
    //        Ext.selectRow.set('c_name', null);
    Ext.getCmp("win-frm-perid-bal-dtl2ID").items.items[0].getForm().loadRecord(Ext.selectRow);
  }
  win.show();

  /*if (Ext.getCmp('period_i_product_type2').getValue().inputValue == 1) { //วัสดุ
     Ext.getCmp('inv_mode_idID').show();
     Ext.getCmp('am_mode_idID').hide();

     } else {
     Ext.getCmp('ae_idID').show();
     Ext.getCmp('inv_mode_idID').hide();
     }*/

  // }
  // },
  // });
}

function i_alertID_Change() {
  if (Ext.getCmp("i_alertID").getValue() != "") {
    var Text_alert = "";
    if (Ext.getCmp("d_period_dateID").getValue() == "") {
      var Txt = Ext.getCmp("i_day_useID").getValue().inputValue == 0 ? "จำนวนวันที่กำหนดส่งในงวดงาน" : "วันที่กำหนดส่งในงวดงาน";
      Text_alert = "<font color='red'>* กรุณากรอก : " + Txt + "</font>";
    }
    if (Ext.getCmp("i_alertID").getValue() < 0) {
      Text_alert = "<font color='red'> * กรุณากรอก : จำนวนวัน ตั้งแต่ 0 ขึ้นไป</font>";
    }

    if (Text_alert == "") {
      var day = Ext.getCmp("i_alertID").getValue();
      var oneDay = 24 * 60 * 60 * 1000;
      var secondDate = new Date(Ext.util.Format.date(Ext.getCmp("d_period_dateID").getValue(), "Y/m/d"));
      var date = new Date(secondDate.getTime() - oneDay * day);

      var FullDay = date.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        weekday: "long",
      });
      var Txt2 = "";
      if (date.getTime() == addY(0).getTime()) {
        Txt2 = "<font color='red'> *(วันแจ้งเตือนเท่ากับวันปัจุบัน)</font>";
      }
      if (date.getTime() < addY(0).getTime()) {
        Txt2 = "<font color='red'> *(วันแจ้งเตือนน้อยกว่าวันปัจุบัน)</font>";
      }
      Ext.getCmp("txt_i_alertID").setValue("<font color='green'>แจ้งเตือน ณ " + FullDay + "</font> " + Txt2);
    } else {
      Ext.getCmp("txt_i_alertID").setValue(Text_alert);
      Ext.getCmp("i_alertID").setValue(null);
    }
  } else {
    Ext.getCmp("txt_i_alertID").setValue(null);
    Ext.getCmp("i_alertID").setValue(null);
  }
}

function i_dayID_Change() {
  if (Ext.getCmp("i_dayID").getValue() != "") {
    var Text_alert = "";
    if (Ext.getCmp("d_doc_dateID").getValue() == "") {
      Text_alert = "<font color='red'>* กรุณากรอก : วันที่ออกเอกสาร</font>";
    }
    if (Ext.getCmp("i_dayID").getValue() < 0) {
      Text_alert = "<font color='red'> * กรุณากรอก : จำนวนวัน ตั้งแต่ 0 ขึ้นไป</font>";
    }

    if (Text_alert == "") {
      var day = Ext.getCmp("i_dayID").getValue();
      var oneDay = 24 * 60 * 60 * 1000;
      var firstDate = new Date(Ext.util.Format.date(Ext.getCmp("d_doc_dateID").getValue(), "Y/m/d"));
      var date = new Date(firstDate.getTime() + oneDay * day);
      Ext.getCmp("d_period_dateID").setValue(new Date(firstDate.getTime() + oneDay * day));
      Ext.getCmp("txt_d_period_dateID").setValue("<font color='green'>จำนวน " + day + " วัน</font>");

      var FullDay = date.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        weekday: "long",
      });
      Ext.getCmp("txt_i_dayID").setValue("<font color='green'>" + FullDay + "</font>");

      if (Ext.getCmp("i_alertID").getValue() != "") {
        i_alertID_Change();
      }
    } else {
      Ext.getCmp("txt_i_dayID").setValue(Text_alert);
      Ext.getCmp("d_period_dateID").setValue("");
      Ext.getCmp("i_dayID").setValue(null);
      Ext.getCmp("i_alertID").setValue(null);
      Ext.getCmp("txt_i_alertID").setValue(null);
      Ext.getCmp("txt_d_period_dateID").setValue(null);
    }
  } else {
    Ext.getCmp("txt_i_dayID").setValue(null);
    Ext.getCmp("d_period_dateID").setValue("");
    Ext.getCmp("i_dayID").setValue(null);
    Ext.getCmp("i_alertID").setValue(null);
    Ext.getCmp("txt_i_alertID").setValue(null);
    Ext.getCmp("txt_d_period_dateID").setValue(null);
  }
}

function d_period_dateID_change() {
  if (Ext.getCmp("d_period_dateID").getValue() != "") {
    var Text_alert = "";
    if (Ext.getCmp("d_doc_dateID").getValue() == "") {
      Text_alert = "<font color='red'>* กรุณากรอก : วันที่ออกเอกสาร</font>";
    } else {
      var oneDay = 24 * 60 * 60 * 1000;
      var firstDate = new Date(Ext.util.Format.date(Ext.getCmp("d_doc_dateID").getValue(), "Y/m/d"));
      var secondDate = new Date(Ext.util.Format.date(Ext.getCmp("d_period_dateID").getValue(), "Y/m/d"));
      var days = Math.round(Math.abs((firstDate - secondDate) / oneDay));
      if (firstDate.getTime() > secondDate.getTime()) {
        Text_alert = "<font color='red'>* กรุณากรอกวันที่ให้มากกว่าวันที่ออกเอกสาร</font>";
      }
    }

    if (Text_alert == "") {
      Ext.getCmp("i_dayID").setValue(days);
      Ext.getCmp("txt_d_period_dateID").setValue("<font color='green'>จำนวน " + days + " วัน</font>");

      var date = new Date(Ext.util.Format.date(Ext.getCmp("d_period_dateID").getValue(), "Y/m/d"));
      var FullDay = date.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        weekday: "long",
      });
      Ext.getCmp("txt_i_dayID").setValue("<font color='green'>" + FullDay + "</font>");
      if (Ext.getCmp("i_alertID").getValue() != "") {
        i_alertID_Change();
      }
    } else {
      Ext.getCmp("txt_d_period_dateID").setValue(Text_alert);
      Ext.getCmp("d_period_dateID").setValue("");
      Ext.getCmp("txt_i_dayID").setValue(null);
      Ext.getCmp("i_dayID").setValue(null);
      Ext.getCmp("i_alertID").setValue(null);
      Ext.getCmp("txt_i_alertID").setValue(null);
    }
  } else {
    Ext.getCmp("txt_d_period_dateID").setValue(null);
    Ext.getCmp("d_period_dateID").setValue("");
    Ext.getCmp("txt_i_dayID").setValue(null);
    Ext.getCmp("i_dayID").setValue(null);
    Ext.getCmp("i_alertID").setValue(null);
    Ext.getCmp("txt_i_alertID").setValue(null);
  }
}

function d_doc_dateID_Change() {
  if (Ext.getCmp("d_doc_dateID").getValue() == "") {
    Ext.getCmp("d_period_dateID").setValue("");
    Ext.getCmp("txt_d_period_dateID").setValue("");
    Ext.getCmp("i_alertID").setValue("");
    Ext.getCmp("txt_i_alertID").setValue("");
    Ext.getCmp("i_dayID").setValue("");
    Ext.getCmp("txt_i_dayID").setValue("");
  } else {
    if (Ext.getCmp("d_period_dateID").getValue() != "") {
      if (Ext.getCmp("i_day_useID").getValue().inputValue == 1) {
        d_period_dateID_change();
      } else {
        i_dayID_Change();
      }
    }
  }
}

Ext.AppUx = function (app, menu) {
  //...
  
 
  Ext.status = Ext.apply({
      
    
    sendContractToErp:(t)=>{
//         console.log(Ext.URL_SERVER_API+"/po_send");
//         console.log(t);
//         return false;
         Ext.Ajax.request({
                url: Ext.URL_SERVER_API+"/po_send",
                params: {
                        sessId : t,
                        sp_contract_hdr_id:Ext.selectRow.get('sp_tor_contract_id')
                },
                method: "POST", //POST
                success: function (result, request) {
                         console.log(result);
                    return false;
                    var jsonData = Ext.util.JSON.decode(result.responseText); //decode json   
                    console.log(jsonData);
                    if (jsonData.retval) { 
                          var ds1 = jsonData.datas.data[0];
                          Ext.MessageBox.alert("Success", "ได้ส่งสัญญาเลขที่ "+ds1.contract_code+ "ให้กับระบบ ERP เรียบร้อยแล้ว"); 
                    } else {
                         Ext.MessageBox.alert("Failed", jsonData.msg['msg']+' = '+jsonData.msg['error']); // alert massage error
                         console.log(jsonData.msg);
                    }
            
                },
                failure: function (result, request) {
                    Ext.MessageBox.alert("Failed", result.responseText); // connect error
                }
            }); 
    },
    addIr:(record)=>{
            // console.log(record);
            Ext.Ajax.request({
                url: "tor/api/mnTorController.php",
                params: {
                        mode : 'GET_CONTRACTANDPO',
                        sp_contract_hdr_id:record.get('sp_tor_contract_id')
                },
                method: "POST", //POST
                success: function (result, request) {
                /*****************/      
                var jsonData = Ext.util.JSON.decode(result.responseText); //decode json 
                if(jsonData.data.length>0){
//                  console.log(jsonData);
//                  return false;
                  
//                    var rec = Ext.selectRow;
//                    rec.set("sp_mn_contract_hdr_id",null);
//                    rec.set("sp_contract_id",Ext.selectRow.get('sp_contract_id')); 
                        Ext.Ajax.request({
                            url: "tor/api/mnTorController.php",
                            params: {
                                    mode: "UP_SP_MN_CONTRACT_HDR_AUTO", //เขียนเพิ่มเติม
                                    sp_mn_contract_hdr_id:null,
                                    i_is_po: '',
                                    c_name_in: Ext.selectRow.get('c_name'),//'ซื้อหลอดไฟ XENON Lamp จำนวน 1 หลอด',
                                    d_doc_date:Ext.selectRow.get('d_doc_date'),// '11-01-2568',
                                    sp_contract_po_id: jsonData.data[0].sp_tor_contract_id,//2015,
                                    txtsp_contractID: Ext.selectRow.get('txtsp_contractID'),//'ซ.011379/2567',
                                    po_expense_name:Ext.selectRow.get('po_expense_name'),// 'ค่าวัสดุวิทยาศาสตร์ทางการแพทย์',
                                    d_start_date: jsonData.data[0].d_doc_date,//'11-01-2568',
                                    d_end_date: jsonData.data[0].d_due_date,//'27-12-2567',
                                    f_total_amt: jsonData.data[0].f_total_amt,// '45,000.00' 

                            },
                            method: "POST", //POST
                            success: function (result, request) {
                               var jsonData = Ext.util.JSON.decode(result.responseText); //decode json 
    //                           console.log(jsonData);
    //                                  return false; 
                              Ext.storeDtl.reload();
            //                  Ext.getCmp("winDcExpTypeDddID").destroy();
            //                  Ext.getCmp(Ext.poFormID).destroy();
                            },
                            failure: function (result, request) {
                              Ext.MessageBox.alert("Failed", result.responseText); // connect error
                            },
                      });
                  }
                },
                failure: function (result, request) {
                  Ext.MessageBox.alert("Failed", result.responseText); // connect error
                },
            });
             
    },  
    name: menu,
    process: function (menuCode, record) {
      Ext.getCmp("tabpanel1").getEl().mask("Please wait...", "x-mask-loading");
      Ext.Ajax.request({
        url: "tor/api/mnTorController.php",
        params: {
          mode: "UP_SP_MN_CONTRACT_HDR", 
          sp_contract_po_id: record.get("sp_tor_contract_id"),
          c_name_in: record.get("sp_tor_contract_id"),
          f_total_amt: record.get("f_total_amt"),
          d_doc_date: record.get("d_doc_date"),
          d_start_date: record.get("d_start_date"),
          d_end_date: record.get("d_due_date"),
        },
        method: "POST", //GET
        success: function (result, request) {
          Ext.Ajax.request({
            url: "tor/api/mnTorController.php",
            params: {
              mode: "UPSTATUS_CONTRACT",
              menuCode: menuCode,
              // tor_status_id: record.get("tor_status_id"),
              id: record.get("sp_tor_contract_id"),
            },
            method: "POST", //GET
            success: function (result, request) {
              var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
              if (jsonData.success) {
                Ext.getCmp("tabpanel1").getEl().unmask();
                Ext.MessageBox.alert("Success", jsonData.msg, function () {
                  Ext.getCmp("tabpanel1").getStore().reload();
                });
              } else {
                Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
              }
            },
            failure: function (result, request) {
              Ext.MessageBox.alert("Failed", result.responseText); // connect error
            },
          });
        },
        failure: function (result, request) {
          Ext.MessageBox.alert("Failed", result.responseText); // connect error
        },
      });
    },
  });
  Ext.chkBg = false;
  Ext.chkBg.status = false;
  Ext.chkBgfn = function (st, f, f_bg, cancle) {
    Ext.chkBg = Ext.apply({ status: st, f_amt: f, f_bg: f_bg });
    var cl = cancle || null;
    if (cl) {
      Ext.getCmp("disBgID").setValue(cl === true ? "เบิกได้ไม่ผ่าน" : "กรุณาตรวจสอบเงินตามงวด");
      Ext.getCmp("buSaveSubID").setText(cl === true ? "บันทึกรายการไม่ผ่าน" : "ตรวจสอบเงิน");
    } else {
      Ext.getCmp("disBgID").setValue(Ext.chkBg.status === true ? "เบิกได้" : "กรุณาตรวจสอบเงินตามงวด");
      Ext.getCmp("buSaveSubID").setText(Ext.chkBg.status === true ? "บันทึกรายการ" : "ตรวจสอบเงิน");
    }
  };
  Ext.user_right_add = user_right_add;
  Ext.user_right_edit = user_right_edit;
  Ext.user_right_delete = user_right_delete;
  Ext.title = Ext.menu_name + " " + Ext.menu_code;
  Ext.HDR_ID = null;
  // storeYear
  Ext.selectRow = [];
  Ext.menuEditGrid = true;
  Ext.menuRightEditgrid = true;
  let years = [];
  let currentTime = new Date();
  let now = currentTime.getFullYear() + 1;
  let id = currentTime.getFullYear() - 3;
  while (id <= now) {
    let c_name = id + 543;
    years.push({
      id,
      c_name,
    });
    id++;
  }
  Ext.bgYear = now - 1;
  // copy text in cell on select row no
  function CopyToClipboard(rec, arrDataCopy) {
    var input = rec;
    var textToClipboard = "";
    //text on
    var success = true;
    for (var i = 0; i < arrDataCopy.length; i++) {
      textToClipboard += ", " + input.get(arrDataCopy[i]);
    }

    if (window.clipboardData) {
      // Internet Explorer
      window.clipboardData.setData("Text", textToClipboard);
    } else {
      var forExecElement = CreateElementForExecCommand(textToClipboard);
      SelectContent(forExecElement);
      var supported = true;
      // UniversalXPConnect privilege is required for clipboard access in Firefox
      try {
        if (window.netscape && netscape.security) {
          netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        }
        success = document.execCommand("copy", false, null);
      } catch (e) {
        success = false;
      }
      document.body.removeChild(forExecElement);
    }

    if (success) {
      console.log("The text is on the clipboard, try to paste it!");
    } else {
      console.log("Your browser doesn't allow clipboard access!");
    }
  }
  function CreateElementForExecCommand(textToClipboard, arrDataCopy) {
    var forExecElement = document.createElement("div");
    forExecElement.style.position = "absolute";
    forExecElement.style.left = "-10000px";
    forExecElement.style.top = "-10000px";
    forExecElement.textContent = textToClipboard;
    document.body.appendChild(forExecElement);
    forExecElement.contentEditable = true;
    return forExecElement;
  }
  function SelectContent(element) {
    // first create a range
    var rangeToSelect = document.createRange();
    rangeToSelect.selectNodeContents(element);
    // select the contents
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(rangeToSelect);
  }

  function controller(rec, evt) {
    if (Ext.selectRow.get("i_type_bg") == 4 || Ext.selectRow.get("i_type_bg") == 8 || Ext.selectRow.get("i_type_bg") == 13) {
      i_type_bg = 1;
    } else {
      i_type_bg = 0;
    }
    // return ;
    if (Ext.isEmpty(rec)) {
      Ext.Msg.alert("แจ้งเตือน", "กรุณา click เลือกข้อมูลที่จะแก้ไขใน data grid", function (bu, action) {
        return false;
      });
    } else if (rec.json.i_status_overlap == 1 && rec.json.bg_reserve_overlap_id == 0) {
      Ext.Msg.alert("แจ้งเตือน", "ยังไม่ได้ระบุเลขที่ใบกัน", function (bu, action) {
        return false;
      });
    } else if (Ext.isPerioid == 0 && Ext.selectRow.get("i_type_contract") != 3) {
      Ext.Msg.alert("แจ้งเตือน", "งวดยังไม่ได้ระบุงวดสุดท้าย", function (bu, action) {
        return false;
      });
//    } else if (Ext.selectRow.get("c_bg_reserve_money1_id") == 0 && i_type_bg == 0 && rec.json.i_status_overlap != 1) {
//      Ext.Msg.alert("แจ้งเตือน", "ยังไม่ได้ทำการจองเงิน", function (bu, action) {
//        return false;
//      });
 
    } else {
      if (rec.data.i_contract_status == 1) {
        Ext.Msg.show({
          title: "แจ้งเตือน!",
          msg: "ลงนามในสัญญาหรือข้อตกลงเป็นหนังสือโดยสมบูรณ์  " + rec.data.c_code,
          width: 400,
          icon: Ext.MessageBox.info,
          // buttons: Ext.MessageBox.YESNOCANCEL,
          buttons: Ext.MessageBox.YESNO,
          fn: function (btn, text) {
            if (btn === "yes"){ 
                //@TODO
                Ext.status.process("ST0009", rec);
                Ext.status.addIr(rec);
            }else null;
          },
          //icon: Ext.MessageBox.ERROR
        });
      } else if (rec.data.i_contract_status == 2) {
        Ext.Msg.show({
          title: "แจ้งเตือน!",
          msg: "รายการนี้ผ่านรายการไปแล้ว",
          width: 185,
        });
      }
    }
  }
  function cellClick(grid, rowIndex, columnIndex, e) {
    Ext.selectRow = this.selModel.selection.record;
    Ext.isPerioid = Ext.selectRow.get("i_last_period");
    Ext.TOR_ID = Ext.selectRow.data.sp_tor_id;
    Ext.SP_TOR_CONTRACT_ID = Ext.selectRow.data.sp_tor_contract_id;
    Ext.I_IS_PO = Ext.selectRow.data.i_is_po;
    // var record = grid.getStore().getAt(rowIndex);
    if (columnIndex === grid.getColumnModel().getIndexById("processDueID")) {
      controller(Ext.selectRow); //on
    } else if (columnIndex === grid.getColumnModel().getIndexById("edit_contractID")) {
      Ext.loadStore("edit_contract", true);
    }
  }

  Ext.po_user = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: {
      type: "po_user",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
  });
  // copy text in cell on select row no
  Ext.po_emp = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: {
      type: "po_emp",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_code", "c_name"],
  });
  Ext.bgProject = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: {
      type: "bg_project",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name", "f_project"],
  });

  Ext.po_user_permission = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: {
      type: "po_user_permission",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
  });
  Ext.dc_cost = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: {
      type: "dc_cost",
    },

    root: "data",
    idProperty: "id",
    fields: ["id", "c_code", "c_name"],
  });
  Ext.dc_creditor = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "tor/api/mnTorController.php",
    baseParams: { mode: "LIST_POP_CREDITOR", id: 0 },
    root: "data",
    idProperty: "id",
    totalProperty: "totalCount",
    fields: [{ name: "no" }, { name: "dc_creditor_id" }, { name: "c_tax_number_imp" }, { name: "c_name" }],
  });

  Ext.dc_expense_budget_type = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: {
      type: "dc_expense_budget_type",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
  });
  Ext.dc_expense_budget_type2 = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: {
      type: "dc_expense_budget_type",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
  });
  Ext.po_expense_group = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_PoWorkingImpHdr.php",

    baseParams: {
      type: "po_expense_group",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
  });
  Ext.po_expense = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: {
      type: "po_expense",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
  });
  Ext.po_expense1 = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: {
      type: "po_expense",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
  });
 /*type: deliveries
keyData: 
tor_status_id: 
i_type_contract: 3
mode: SEARCH
filter: c_code_po
value: 
i_budget_year: 0
i_year_contract: 0
i_enable: 0*/
  Ext.storeDtl = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "tor/api/List_DeliveryStep.php",
    baseParams: {
      type: "deliveries",
      keyData: Ext.keyData,
      tor_status_id: Ext.menu_id,
      i_type_contract:3,
      mode: "SEARCH" 
    },
    root: "data",
    idProperty: "id",
    totalProperty: "totalCount",
    fields: [
      {
        name: "no",
      },
      {
        name: "id",
      },
      {
        name: "sp_tor_id",
      },
      {
        name: "count_period",
      },
      {
        name: "i_is_notor",
      },
      {
        name: "dc_cost2_id",
        type: "int",
      },
      {
        name: "sp_tor_contract_id",
      },
      {
        name: "dtl_po_expense_id1",
      },
      {
        name: "dtl_dc_bg_budget_type_id1",
      },
      {
        name: "dtl_i_pr_type1",
      },
      {
        name: "dtl_f_type_amt1",
      },
      {
        name: "bg_reserve_i_last1",
      },
      {
        name: "dtl_po_expense_id2",
      },
      {
        name: "dtl_dc_bg_budget_type_id2",
      },
      {
        name: "dtl_i_pr_type2",
      },
      {
        name: "dtl_f_type_amt2",
      },
      {
        name: "bg_reserve_i_last2",
      },
      {
        name: "dtl_po_expense_id3",
      },
      {
        name: "dtl_dc_bg_budget_type_id3",
      },
      {
        name: "dtl_i_pr_type3",
      },
      {
        name: "dtl_f_type_amt3",
      },
      {
        name: "i_yyyy",
      },
      {
        name: "dc_expense_id",
      },
      {
        name: "i_last_period",
      },
      {
        name: "c_expense_budget_type_name",
      },
      {
        name: "c_expense_name",
      },
      {
        name: "dtl_dc_expense_budget_type_id",
      },
      {
        name: "dtl_i_pr_type",
      },
      {
        name: "c_dc_expense_budget_type_id",
      },
      {
        name: "c_f_type_amt",
      },
      {
        name: "c_f_type3_amt",
      },
      {
        name: "c_i_pr_type2",
      },
      {
        name: "f_dtl1_amt",
      },
      {
        name: "f_dtl2_amt",
      },
      {
        name: "c_bg_reserve_money1_id",
      },
      {
        name: "c_dc_expense_budget_type2_id",
      },
      {
        name: "c_f_type2_amt",
      },
      {
        name: "c_i_pr_type2",
      },
      {
        name: "c_bg_reserve_money2_id",
      },
      {
        name: "c_bg_reserve_money3_id",
      },
      {
        name: "dc_expense_budget_type_id",
      },
      {
        name: "f_type_amt",
      },
      {
        name: "bg_reserve_money1_id",
      },
      {
        name: "dc_expense_budget_type2_id",
      },
      {
        name: "f_type2_amt",
      },
      {
        name: "bg_reserve_money2_id",
      },
      {
        name: "c_dc_expense_budget_type3_id",
      },
      {
        name: "dc_expense_budget_type3_id",
      },
      {
        name: "f_type3_amt",
      },
      {
        name: "bg_reserve_money3_id",
      },
      {
        name: "dc_expense_budget_type4_id",
      },
      {
        name: "f_type4_amt",
      },
      {
        name: "bg_reserve_money4_id",
      },
      {
        name: "dc_expense_budget_type5_id",
      },
      {
        name: "f_type5_amt",
      },
      {
        name: "bg_reserve_money5_id",
      },
      {
        name: "i_pr_type1",
      },
      {
        name: "i_pr_type2",
      },
      {
        name: "i_pr_type3",
      },
      {
        name: "i_pr_type4",
      },
      {
        name: "i_pr_type5",
 
      },
      {
        name: "po_expense_main_id",
      },
      {
        name: "d_due_date",
        type: "datetime", //d_due_date f_total_amt
      },
      {
        name: "i_is_po", //d_due_date f_total_amt
      },
      {
        name: "c_doc_ref",
      },
      {
        name: "dc_creditor_idTxt",
      },
      {
        name: "f_total_amt",
      },
      {
        name: "d_period_date",
      },
      {
        name: "c_code",
      },
      {
        name: "bg_budget_item_project_id",
      },
      {
        name: "c_budget_dtl_project",
      },
      {
        name: "c_name",
      },
      {
        name: "c_tax_number_imp",
      },
      {
        name: "c_tor_type",
      },
      {
        name: "tor_type_id",
      },
      {
        name: "c_purchase",
      },
      {
        name: "i_purchase",
      },
      {
        name: "i_type_contract",
      },
      {
        name: "i_parent",
      },
      {
        name: "i_is_parent",
      },
      {
        name: "dc_cost_id",
      },
      {
        name: "dc_cost_idTxt",
      },
      {
        name: "c_discription",
      },
      {
        name: "i_delivery",
      },
      {
        name: "i_type_fine",
      },
      {
        name: "f_fine",
      },
      {
        name: "i_year",
      },
      {
        name: "c_year",
      },
      {
        name: "dc_department_id",
      },
      {
        name: "c_department",
      },
      {
        name: "d_tor_date",
      },
      {
        name: "d_doc_ref",
      },
      {
        name: "dc_expense_budget_type_id",
      },
      {
        name: "dc_cost_id",
      },
      {
        name: "po_expense_id",
      },
      {
        name: "dc_user_create_id",
      },
      {
        name: "dc_user_create_cost_id",
      },
      {
        name: "d_create",
      },
      {
        name: "dc_user_update_id",
      },
      {
        name: "dc_user_update_cost_id",
      },
      {
        name: "d_update",
      },
      {
        name: "c_comment",
      },
      {
        name: "c_remake",
      },
      {
        name: "dc_creditor_id",
      },
      {
        name: "po_creditor_id",
      },
      {
        name: "po_creditor_idTxt",
      },
      {
        name: "start_date",
      },
      {
        name: "end_date",
      },
      {
        name: "c_doc_date",
      },
      {
        name: "c_due_date",
      },
      {
        name: "d_doc_date",
        type: "datetime",
      },
      {
        name: "d_po_date",
      },
      {
        name: "c_po_no",
      },
      {
        name: "i_contract_status",
      },
      { name: "d_doc_create" },
      { name: "i_is_warranty" },
      { name: "i_is_warranty_book" },
      { name: "c_books_receipt" },
      { name: "c_receipt_no" },
      { name: "d_book_date" },
      { name: "f_warranty_amt" },
      { name: "c_remark" },
      { name: "i_is_join_venture" },
      { name: "c_doc_no" },
      { name: "d_doc_date1" },
      { name: "dc_bank_id" },
      { name: "dc_bank_idID_Name" },
      { name: "f_warranty_amt1" },
      { name: "d_expire_warranty" },
      { name: "c_comment1" },
      { name: "i_type_bg" },
      { name: "i_status_overlap" },
      { name: "i_overlap" },
      // {name: "i_overlap"},z
      { name: "bg_reserve_overlap_id" },
      { name: "c_overlap" },
      { name: "i_booking_bg" },
      { name: "i_yyyy_overlap" }, 
      { name: "c_books_cashiercheque" },
      { name: "c_receipt_cashiercheque" },
      { name: "d_cashiercheque_date" },
      { name: "f_cashiercheque_warranty_amt2" },
      { name: "c_comment2" },
      { name: "d_start_date" },
      { name: "i_type_guarantee" },
    ],
  });

  //Ext
  Ext.keyData = 1; //type data key in

  Ext.poFormID = "grid-form-cheque";
  Ext.getDate = Ext.apply({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDay(),
    getNowCarlen: function () {
      var day = new Date();
      var dd = day.getDate();
      var mm = day.getMonth() + 1;
      var yy = day.getFullYear() + 543;
      mm = mm < 10 ? "0" + mm : mm;
      dd = dd < 10 ? "0" + dd : dd;
      return dd + "-" + mm + "-" + yy;
    },
    defaultDate: function (typeStartDate) {
      var day = new Date();
      var dd = day.getDate();
      var mm = day.getMonth() + 1;
      var yy = day.getFullYear() + 543;
      if (typeStartDate === 1) {
        // วันที่เริ่ม -1 เดือน
        dd = "01";
        mm = "0" + mm.toString();
      } else {
        dd = "0" + dd.toString();
        mm = "0" + mm.toString();
      }
      return dd.substr(-2) + "-" + mm.substr(-2) + "-" + yy.toString();
    },
  });
  //interlizing

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

    var statusx = statuss;

    if (statusx == "add") {
      Ext.getCmp("tabpanel1").getSelectionModel().clearSelections();
    }
    var col1 = [
      new Ext.grid.RowNumberer({ width: 35, header: " No ", dataIndex: "no" }),
      { header: "ID System", hidden: true, dataIndex: "id" },
      { header: "งวดงานที่", align: "center", dataIndex: "i_seq", width: 10 },
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
      {
        header: "ก่อน VAT",
        dataIndex: "f_unit_cost",
        align: "right",
        width: 25,
      },
      {
        header: "รวม VAT",
        dataIndex: "f_unit_cost_vat",
        align: "right",
        width: 25,
      },
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
    Ext.storeUnitType = new Ext.data.JsonStore({
      autoDestroy: false,
      autoLoad: true,
      url: "api/All_PoWorkingImpHdr.php",
      baseParams: {
        type: "dc_unit_type",
      },
      root: "data",
      idProperty: "id",
      fields: ["id", "c_code", "c_name"],
    });
    //คูสัญญา
    Ext.store1 = new Ext.data.JsonStore({
      storeId: "myStore2",
      autoLoad: false,
      url: "tor/api/mnTorController.php",
      root: "data",
      baseParams: { mode: "LISTCREDITOR", i_read: user_right_read }, //Permission i_read
      idProperty: "id",
      totalProperty: "totalCount",
      fields: [
        { name: "no" },
        { name: "id", type: "int" },
        { name: "sp_tor_id", type: "int" },
        { name: "dc_creditor_id", type: "int" },
        { name: "f_total_amt", type: "string" },
        { name: "c_name", type: "string" },
        { name: "i_enable", type: "int" },
        { name: "dc_user_create_id" },
        { name: "dc_user_create_cost_id" },
        { name: "d_create" },
        { name: "dc_user_update_id" },
        { name: "dc_user_update_cost_id" },
        { name: "d_update" },
      ],
    }); //dc_creditor
    //เลขสัญญา
    Ext.store2 = new Ext.data.JsonStore({
      storeId: "myStore2",
      autoLoad: false,
      url: "tor/api/mnTorController.php",
      root: "data",
      baseParams: { mode: "LISTCREDITOR", i_read: user_right_read }, //Permission i_read
      idProperty: "id",
      totalProperty: "totalCount",
      fields: [
        { name: "no" },
        { name: "id" },
        { name: "creditor_name", type: "string" },
        { name: "c_name", type: "string" },
        { name: "d_doc_date", type: "string" },
        { name: "c_doc_ref", type: "string" },
        { name: "f_total_amt", type: "string" },
        { name: "i_enabled", type: "int" },
        { name: "dc_user_create_id" },
        { name: "dc_user_create_cost_id" },
        { name: "d_create" },
        { name: "dc_user_update_id" },
        { name: "dc_user_update_cost_id" },
        { name: "d_update" },
      ],
    });
    //งวด
    Ext.store3 = new Ext.data.JsonStore({
      storeId: "myStore3",
      autoLoad: false,
      url: "tor/api/mnTorController.php",
      root: "data",
      baseParams: {
        mode: "LISTHDRPERIOD_NEW",
        sp_tor_contract_id: Ext.SP_TOR_CONTRACT_ID,
      }, //Permission i_read
      idProperty: "id",
      totalProperty: "totalCount",
      fields: [
        { name: "no" },
        { name: "id" },
        { name: "dc_creditor_id" },
        { name: "i_yyyy" },
        { name: "dc_expense_id" },
        { name: "dc_creditor_name" },
        { name: "sp_tor_contract_id", type: "string" },
        { name: "c_contract_code", type: "string" },
        { name: "c_doc_ref_contract" },
        { name: "sp_po_id", type: "int" },
        { name: "dc_cost2_id", type: "int" },
        { name: "bg_reserve_money_id" },
        { name: "i_period", type: "int" },
        { name: "f_total_amt", type: "string" },
        { name: "d_doc_date" },
        { name: "sum_period" },
        { name: "d_period_date" },
        { name: "i_day" },
        { name: "i_alert" },
        { name: "dtl_period_count" },
        { name: "i_is_last" },
        { name: "i_pr_type1" },
        { name: "dc_creditor_period_id" },
        { name: "dc_creditor_period_name" },
        { name: "c_tax_number_imp" },
        { name: "i_joint_venture" },
        { name: "dc_expense_budget_type_id" },
        { name: "bg_reserve_money_id" },
        { name: "c_discription" },
        { name: "sp_check_period" },
      ],
    });
    //ของ
    //ContractF
    Ext.storeSUMcontract = new Ext.data.JsonStore({
      storeId: "myStore3",
      autoLoad: false,
      url: "tor/api/mnTorController.php",
      root: "data",
      baseParams: {
        mode: "SUMcontract",
        sp_tor_contract_id: Ext.SP_TOR_CONTRACT_ID,
      }, //Permission i_read
      idProperty: "id",
      totalProperty: "totalCount",
      fields: [{ name: "f_total_amt" }, { name: "f_total_amt2", type: "string" }, { name: "sp_tor_chk" }],
    });
    function updateCloseBg(contract_id, ii) {
      Ext.Ajax.request({
        url: "tor/api/mnTorController.php",
        params: {
          mode: "UPDATE_CONTRACT_CLOSE_BG", //UPDATE_TOR_DTL_BG
          sp_tor_contract_id: contract_id, //sp_dtl_id
          ii: ii,
        },
        method: "POST", //POST
        success: function (result, request) {
          Ext.storeDtl.reload();
          Ext.getCmp("winDcExpTypeDddID").destroy();
          Ext.getCmp(Ext.poFormID).destroy();
        },
        failure: function (result, request) {
          Ext.MessageBox.alert("Failed", result.responseText); // connect error
        },
      });
    }

    function updateBookingContract(id, bg_reserve_money_id, ii) {
      //                            alert(id+' > '+bg_reserve_money_id+' > '+ii);
      //                            return false;
      if (ii == 1) {
        Ext.Ajax.request({
          url: "tor/api/mnTorController.php",
          params: {
            mode: "UPDATE_CONTRACT_BG", //UPDATE_TOR_DTL_BG
            sp_tor_contract_id: id, //sp_dtl_id
            bg_reserve_money1_id: bg_reserve_money_id,
            i_pr_type1: Ext.getCmp("i_pr_type1ID").getValue().inputValue,
            f_type_amt: Ext.getCmp("f_type_amtID").getValue(),
            ii: ii,
          },
          method: "POST", //POST
          success: function (result, request) {
            Ext.storeDtl.reload();
            Ext.getCmp("winDcExpTypeDddID").destroy();
            Ext.getCmp(Ext.poFormID).destroy();
          },
          failure: function (result, request) {
            Ext.MessageBox.alert("Failed", result.responseText); // connect error
          },
        });
      } else if (ii == 2) {
        Ext.Ajax.request({
          url: "tor/api/mnTorController.php",
          params: {
            mode: "UPDATE_CONTRACT2_BG", //UPDATE_TOR_DTL_BG
            sp_tor_contract_id: id, //sp_dtl_id
            bg_reserve_money2_id: bg_reserve_money_id,
            i_pr_type2: Ext.getCmp("i_pr_type2ID").getValue().inputValue,
            f_type2_amt: Ext.getCmp("f_type2_amtID").getValue(),
            ii: ii,
          },
          method: "POST", //POST
          success: function (result, request) {
            Ext.storeDtl.reload();
            Ext.getCmp("winDcExpTypeDddID").destroy();
            Ext.getCmp(Ext.poFormID).destroy();
          },
          failure: function (result, request) {
            Ext.MessageBox.alert("Failed", result.responseText); // connect error
          },
        });
      } else {
        Ext.Ajax.request({
          url: "tor/api/mnTorController.php",
          params: {
            mode: "UPDATE_CONTRACT3_BG", //UPDATE_TOR_DTL_BG
            sp_tor_contract_id: id, //sp_dtl_id
            bg_reserve_money3_id: bg_reserve_money_id,
            i_pr_type3: Ext.getCmp("i_pr_type2ID").getValue().inputValue,
            f_type3_amt: Ext.getCmp("f_type3_amtID").getValue(),
            ii: ii,
          },
          method: "POST", //POST
          success: function (result, request) {
            Ext.storeDtl.reload();
            Ext.getCmp("winDcExpTypeDddID").destroy();
            Ext.getCmp(Ext.poFormID).destroy();
          },
          failure: function (result, request) {
            Ext.MessageBox.alert("Failed", result.responseText); // connect error
          },
        });
      }
      Ext.getCmp("button" + ii).disable();
    }
    //BG
    function genBookBg(v, i) {
      var ii = i;
      //  var ip = 'localhost';  // 192
      var ip = Ext.session.ip_booking; // 192
      var dc_budget_type_id = 0;
      //  i_pr_type1 = 0;
      var i_pr_type1 = Ext.selectRow.get("i_pr_type1");
      if (Ext.selectRow.get("i_pr_type1") != Ext.getCmp("i_pr_type1ID").getValue()) {
        i_pr_type1 = Ext.getCmp("i_pr_type1ID").getValue().inputValue;
      }
   
      dc_budget_type_id = Ext.selectRow.get("dc_expense_budget_type_id");
//      console.log(Ext.selectRow);
//      console.log(Ext.session);
//      
//      return false;
      var link =
        Ext.session.IPAPIBG +
        "/?/bg/mn_BgReserveMoney/mode/POST" +
        "/i_sys/" +
        Ext.session.i_sys+
        "/pr_id/" +
        Ext.selectRow.get("sp_tor_id") +
        "/po_id/" +
        Ext.selectRow.get("sp_tor_contract_id") +
        "/chk_id/0" +
        "/i_year/" +
        Ext.selectRow.get("i_yyyy") +
        "/i_pr_type/" +
        i_pr_type1 + //  plan or period
        "/i_reserve/2" + // step 1 PR step 2 po step3 checking
        "/dc_cost_id/" +
        Ext.selectRow.get("dc_cost_id") +
        "/dc_budget_type_id/" +
        dc_budget_type_id +
        "/bg_expense_id/" +
        Ext.selectRow.get("po_expense_id") +
        "/i_last/" +
        (Ext.selectRow.get("i_type_contract") == 3 ? 0 : 1) +
        "/f_amt/" +
        v;

      Ext.Ajax.request({
        url: link,
        method: "GET", //POST
        disableCaching: false,
        success: function (result, request) {
          var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
          if (jsonData.success) {
            var c_name_dc_expense_budget_type = getStoreItems(Ext.dc_expense_budget_type, dc_budget_type_id, "c_name");
            var c_name_po_expense_id = getStoreItems(Ext.po_expense, Ext.selectRow.get("po_expense_id"), "c_name");
            Ext.MessageBox.alert("Success", "ทำการเรียบร้อยแล้ว", function () {
              var alert_text = "มีการจองเงิน PO " + "\n";
              alert_text += "วันเวลา : " + new Date().toLocaleString("en-ZA") + "\n";
              alert_text += "PR : " + Ext.selectRow.json.pr_code + "\n";
              alert_text += "เลขที่สัญญา : " + Ext.selectRow.data.c_code + "\n";
              // alert_text += "Host : " + location.host + "\n";
              alert_text += "แหล่งเงิน : " + c_name_dc_expense_budget_type + "\n";
              alert_text += "หมวดค่าใช้จ่าย : " + c_name_po_expense_id + "\n";
              // alert_text += "เหตุผล : " + Ext.getCmp("reason_Edit_bgID").getValue() + "\n";
              alert_text += "ชื่อผู้ดำเนินรายการ : " + Ext.session.user_name + "\n";
              alert_text += "ชื่อรายการ : " + Ext.selectRow.get("c_name") + "\n";
              alert_text += "จำนวนเงิน : " + floatRenderer(floatMinus(String(v).replace(/,/g, ""), 2)) + "\n";
              alert_text += "จำนวนเงิน : " + floatRenderer(floatMinus(String(v).replace(/,/g, ""), 2)) + "\n";
              Ext.Ajax.request({
                url: Ext.session.Notif_line,
                method: "POST",
                params: {
                  msg: alert_text,
                  mode: 3,
                },
              });
              updateBookingContract(Ext.selectRow.get("sp_tor_contract_id"), jsonData.bg_reserve_money_id, ii);
              Ext.getCmp("formDcExpTypeDddID").getEl().unmask();
            });
          } else {
            Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
            Ext.getCmp("formDcExpTypeDddID").getEl().unmask();
          }
        },
        failure: function (result, request) {
          console.log(result);
          Ext.MessageBox.alert("Failed", result.responseText); // connect error
          Ext.getCmp("formDcExpTypeDddID").getEl().unmask();
        },
      });
      return link;
    }

    function genBookBg2(v, i) {
      var ii = i;
      //  var ip = 'localhost';  // 192
      var ip = Ext.session.ip_booking; // 192
      var dc_budget_type_id = 0;
      var i_pr_type1 = 0;

      i_pr_type1 = Ext.selectRow.get("i_pr_type2")?Ext.selectRow.get("i_pr_type2"):Ext.selectRow.get("i_pr_type2");
//      i_pr_type1 = Ext.selectRow.get("i_pr_type2")?Ext.selectRow.get("i_pr_type2"):Ext.getCmp("i_pr_type1ID").getValue().inputValue;
      
      
//         console.log(i_pr_type1);
//      console.log(Ext.getCmp("i_pr_type1ID").getValue().inputValue);
//      return false;
      
      dc_budget_type_id = Ext.selectRow.get("dc_expense_budget_type2_id");
      var link =
        Ext.session.IPAPIBG +
        "/?/bg/mn_BgReserveMoney/mode/POST" +
        "/i_sys/3" +
        "/pr_id/" +
        Ext.selectRow.get("sp_tor_id") +
        "/po_id/" +
        Ext.selectRow.get("sp_tor_contract_id") +
        "/chk_id/0" +
        "/i_year/" +
        Ext.selectRow.get("i_yyyy") +
        "/i_pr_type/" +
        i_pr_type1 + //  plan or period
        "/i_reserve/2" + // step 1 PR step 2 po step3 checking
        "/dc_cost_id/" +
        Ext.selectRow.get("dc_cost2_id") +
        "/dc_budget_type_id/" +
        dc_budget_type_id +
        "/bg_expense_id/" +
        Ext.selectRow.get("po_expense_id") +
        "/i_last/" +
        (Ext.selectRow.get("i_type_contract") == 3 ? 0 : 1) +
        "/f_amt/" +
        v;
      Ext.Ajax.request({
        url: link,
        method: "GET", //POST
        disableCaching: false,
        success: function (result, request) {
          var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
          if (jsonData.success) {
            Ext.MessageBox.alert("Success", "ทำการเรียบร้อยแล้ว", function () {
              updateBookingContract(Ext.selectRow.get("sp_tor_contract_id"), jsonData.bg_reserve_money_id, ii);
              Ext.getCmp("formDcExpTypeDddID").getEl().unmask();
            });
          } else {
            Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
            Ext.getCmp("formDcExpTypeDddID").getEl().unmask();
          }
        },
        failure: function (result, request) {
          Ext.MessageBox.alert("Failed", result.responseText); // connect error
          Ext.getCmp("formDcExpTypeDddID").getEl().unmask();
        },
      });
      return link;
    }
    function genBookBg3(v, i) {
      var ii = i;
      //  var ip = 'localhost';  // 192
      var ip = Ext.session.ip_booking; // 192
      var dc_budget_type_id = 0;
      var i_pr_type1 = 0;

      i_pr_type1 = Ext.selectRow.get("i_pr_type3");
      dc_budget_type_id = Ext.selectRow.get("dc_expense_budget_type3_id");
      console.log(3);
      var link =
        Ext.session.IPAPIBG +
        "/?/bg/mn_BgReserveMoney/mode/POST" +
        "/i_sys/3" +
        "/pr_id/" +
        Ext.selectRow.get("sp_tor_id") +
        "/po_id/" +
        Ext.selectRow.get("sp_tor_contract_id") +
        "/chk_id/0" +
        "/i_year/" +
        Ext.selectRow.get("i_yyyy") +
        "/i_pr_type/" +
        i_pr_type1 + //  plan or period
        "/i_reserve/2" + // step 1 PR step 2 po step3 checking
        "/dc_cost_id/" +
        Ext.selectRow.get("dc_cost2_id") +
        "/dc_budget_type_id/" +
        dc_budget_type_id +
        "/bg_expense_id/" +
        Ext.selectRow.get("po_expense_id") +
        "/i_last/" +
        (Ext.selectRow.get("i_type_contract") == 3 ? 0 : 1) +
        "/f_amt/" +
        v;
      Ext.Ajax.request({
        url: link,
        method: "GET", //POST
        disableCaching: false,
        success: function (result, request) {
          var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
          if (jsonData.success) {
            Ext.MessageBox.alert("Success", "ทำการเรียบร้อยแล้ว", function () {
              updateBookingContract(Ext.selectRow.get("sp_tor_contract_id"), jsonData.bg_reserve_money_id, ii);
              Ext.getCmp("formDcExpTypeDddID").getEl().unmask();
            });
          } else {
            Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
            Ext.getCmp("formDcExpTypeDddID").getEl().unmask();
          }
        },
        failure: function (result, request) {
          Ext.MessageBox.alert("Failed", result.responseText); // connect error
          Ext.getCmp("formDcExpTypeDddID").getEl().unmask();
        },
      });
      return link;
    }

    function genBookBgClose(v, i) {
      var ii = i;
      //  var ip = 'localhost';  // 192
      var ip = Ext.session.ip_booking; // 192
      var dc_budget_type_id = 0;
      var bg_reserve_money_id = 0;
      var run = i > 1 ? "2" : "";
      if (Ext.selectRow.get("i_purchase") === 1) {
        dc_budget_type_id = Ext.selectRow.get("dtl_dc_expense_budget_type_id");
        bg_reserve_money_id = Ext.selectRow.get("c_bg_reserve_money1_id");
      } else {
        var run = i > 1 ? "2" : "";
        dc_budget_type_id = Ext.selectRow.get("dc_expense_budget_type" + run + "_id");
        bg_reserve_money_id = Ext.selectRow.get("c_bg_reserve_money1_id");
      }

//      console.log(4);

      var link =
        Ext.session.IPAPIBG +
        "/?/bg/mn_BgReserveMoney/mode/PUT" +
        "/bg_reserve_money_id/" +
        bg_reserve_money_id +
        "/i_year/" +
        Ext.selectRow.get("i_yyyy") +
        "/dc_budget_type_id/" +
        dc_budget_type_id +
        "/bg_expense_id/" +
        Ext.selectRow.get("po_expense_id") +
        "/i_last/1" +
        "/f_amt/" +
        v;
      Ext.Ajax.request({
        url: link,
        method: "GET", //POST
        disableCaching: false,
        success: function (result, request) {
          var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
          //                    console.log(jsonData);

          if (jsonData.success) {
            Ext.MessageBox.alert("Success", "ทำการเรียบร้อยแล้ว", function () {
              updateCloseBg(Ext.selectRow.get("sp_tor_contract_id"), ii);
              Ext.getCmp("formDcExpTypeDddID").getEl().unmask();
            });
          } else {
            Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
            Ext.getCmp("formDcExpTypeDddID").getEl().unmask();
          }
        },
        failure: function (result, request) {
          Ext.MessageBox.alert("Failed", result.responseText); // connect error
          Ext.getCmp("formDcExpTypeDddID").getEl().unmask();
        },
      });
      return link;
    }

    //----------------------------------------------------------------- -----------
    Ext.store4 = new Ext.data.JsonStore({
      storeId: "myStore4",
      autoLoad: false,
      url: "tor/api/mnTorController.php",
      root: "data",
      baseParams: {
        mode: "LISTDTLPERIODUSED",
        sp_tor_hdr_period_id: Ext.SP_TOR_HDR_PERIOD_ID,
      }, //Permission i_read
      idProperty: "id",
      totalProperty: "totalCount",
      fields: [
        { name: "no" },
        { name: "id" },
        { name: "sp_tor_dtl_period_id" },
        { name: "sp_tor_dtl_id" },
        { name: "dc_bg_budget_type_id" },
        { name: "po_expense_id" },
        { name: "i_period", type: "int" },
        { name: "c_code", type: "string" },
        { name: "c_name", type: "string" },
        { name: "dc_unit_type_id" },
        { name: "dc_unit_name", type: "string" },
        { name: "i_qty" },
        { name: "f_net_unit_price" }, // f_net_unit_price f_net_total_price
        { name: "f_net_total_price" }, // f_net_unit_price f_net_total_price
        { name: "i_qty_amt" }, //sum
        { name: "i_hire_type" },
        { name: "i_product_type" },
        { name: "i_is_inv" },
        { name: "f_total_amt" },
        { name: "c_comment_product", type: "string" },
        { name: "c_comment_asset", type: "string" },
        { name: "i_enable", type: "int" },
        { name: "dc_user_create_id" },
        { name: "dc_user_create_cost_id" },
        { name: "d_create" },
        { name: "dc_user_update_id" },
        { name: "dc_user_update_cost_id" },
        { name: "d_update" },
      ],
    });
    Ext.store5 = new Ext.data.JsonStore({
      storeId: "myStore4",
      autoLoad: false,
      url: "tor/api/mnTorController.php",
      root: "data",
      baseParams: {
        mode: "LISTTORDTL",
        sp_tor_hdr_period_id: Ext.SP_TOR_HDR_PERIOD_ID,
        sp_tor_id: Ext.TOR_ID,
        dc_creditor_id: Ext.DC_CREDITOR_ID,
      }, //Permission i_read
      idProperty: "id",
      totalProperty: "totalCount",
      fields: [
        { name: "no" },
        { name: "sp_tor_dtl_id" },
        { name: "sp_tor_id", type: "int" },
        { name: "c_name", type: "string" },
        { name: "i_qty" },
        { name: "i_qty_all" },
        { name: "c_unit" },
        { name: "f_unit_price" }, // f_net_unit_price f_net_total_price
        { name: "f_total_price" }, // f_net_unit_price f_net_total_price
      ],
    });

    var col4 = [
      new Ext.grid.RowNumberer({ width: 35, header: " No ", dataIndex: "no" }),
      { header: "ID System", hidden: true, dataIndex: "id" },
      {
        id: "edit_dtl_period",
        header: "แก้ไข",
        sortable: false,
        align: "center",
        width: 10,
        dataIndex: "id",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          return '<img src="../images/icons/table_edit.png"); style="cursor:pointer"/>';
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
      {
        header: "หน่วยนับ",
        align: "left",
        dataIndex: "dc_unit_name",
        width: 20,
      },
      { header: "จำนวน", dataIndex: "i_qty", width: 20, align: "right" },
      {
        header: "ราคา/หน่วย",
        dataIndex: "f_net_unit_price",
        align: "right",
        width: 25,
      },
      {
        header: "รวม",
        dataIndex: "f_net_total_price",
        align: "right",
        width: 25,
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          return value;
        },
      },

      {
        id: "delete_dtl_period",
        header: "ลบ",
        sortable: false,
        align: "left",
        width: 10,
        dataIndex: "id",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          return '<img src="../images/icons/table_delete.png"); style="cursor:pointer"/>';
        },
      }, //ของในงวด
    ];

    var colPeriod = [
      new Ext.grid.RowNumberer({ width: 35, header: " No ", dataIndex: "no" }),
      { header: "ID System", hidden: true, dataIndex: "id" },
      {
        header: "-",
        align: "center",
        width: 40,
        dataIndex: "i_period",
        id: "i_peridEditAll",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          if (record.get("no") > 9996) return "";
          else if (record.get("i_status") == 2) {
            return "" + record.get("i_period");
          } else {
            return '<span style="white-space: nowrap;">งวดที่ ' + record.get("i_period") + ' <img src="../images/icons/table_edit.png"); style="cursor:pointer"/></span>';
          }
        },
      },
      {
        header: "งวดที่",
        //                id: "i_peridEditAll",
        align: "center",
        width: 45,
        dataIndex: "i_period",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          var last = record.get("i_is_last");
          var lastTxt = last ? " งวดสุดท้าย" : "";
          if (record.get("no") > 9996) return "";
          else if (Ext.selectRow.get("i_type_contract") == 3) return "สัญญา " + record.get("c_contract_code") + lastTxt;
          else return "งวด " + value + lastTxt;
        },
      },
      {
        header: "วันที่เริ่มนับการส่งของในงวด",
        dataIndex: "d_doc_date",
        width: 50,
        align: "center",
      },
      {
        header: "วันที่กำหนดส่ง",
        width: 50,
        dataIndex: "d_period_date",
        align: "center",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          if (record.get("no") === 9999) return "ยอดรวม";
          else if (record.get("no") === 9998) return "ยอดที่ใช้ได้";
          else if (record.get("no") === 9997) return "คงเหลือ";
          else return value;
        },
      },
      {
        header: "ส่งภายใน",
        dataIndex: "d_date",
        align: "center",
        width: 50,
        hidden: true,
        // listeners: {
        //     change: function () {
        //         d_period_dateID_change();
        //     },
        // },
      },
      {
        header: "จำนวนเงิน",
        dataIndex: "f_total_amt",
        align: "right",
        width: 50,
      },
      {
        header: "สถานะ",
        width: 50,
        dataIndex: "id",
        align: "center",
        hidden: true,
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
          if (record.get("i_is_status") == 1) {
            return '<img src="../images/icons/accept.png"); style="cursor:pointer"/>';
          } else if (record.get("i_is_status") == 2) {
            return '<img src="../images/icons/arrow_redo.png"); style="cursor:pointer"/>';
          } else {
            return '<img src="../images/icons/add.png"); style="cursor:pointer"/>';
          }
        },
      },
      {
        header: "ลบ",
        align: "center",
        // hidden : true,
        width: 25,
        dataIndex: "i_period",
        id: "i_peridDel",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          if (record.get("no") > 9996) return "";
          else if (record.get("i_status") == 2) {
            return "";
          } else {
            return '<img src="../images/icons/table_delete.png"); style="cursor:pointer"/>';
          }
        },
      },
    ];

    var disp = false ? "displayfield" : "textfield";
    if (!Ext.isEmpty(Ext.getCmp("winChequeID"))) {
      Ext.getCmp("winChequeID").destroy();
    }

    Ext.poFormID = "win-frm-xxx001";

    const transfer = function (data) {
      return new Ext.Window({
        id: "transfermoney",
        title: "ยืนยันการเปลี่ยนแปลงข้อมูล",
        modal: true,
        width: 800,
        // height: 250,
        items: new Ext.FormPanel({
          id: "Form-Parent",
          //                    frame: true,
          labelAlign: "left",
          bodyStyle: "padding:1px",
          items: [
            {
              xtype: "displayfield",
              id: "displaytext",
              // fieldLabel: "กรุณาตรวจสอบจำนวนเงินที่ถูกยกเลิกก่อนยืนยันการทำรายการ",
              width: 200,
              value: "ข้อมูลใบกันเหลื่อมไม่ตรงกับข้อมูลในสัญญา",
              style: "text-align: center; color:red; white-space: nowrap;",
            },
            {
              xtype: "textfield",
              fieldLabel: "แหล่งเงิน (สัญญา)",
              emptyText: "กรุณาระบุ...",
              value: Ext.selectRow.get("c_expense_budget_type_name"),
              width: 400,
              style: "text-align: left;background:#eee;",
              readOnly: true,
            },
            {
              xtype: "textfield",
              fieldLabel: "แหล่งเงิน (ใบกันเหลื่อม)",
              abelWidth: 150,
              emptyText: "กรุณาระบุ...",
              value: Ext.overlap_budget_type.data.c_name,
              width: 400,
              style: "text-align: left;background:#eee;",
              readOnly: true,
            },
            {
              xtype: "textfield",
              fieldLabel: "หมวดค่าใช้จ่าย (สัญญา)",
              emptyText: "กรุณาระบุ...",
              value: Ext.po_expense_old.data.c_name,
              width: 400,
              style: "text-align: left;background:#eee;",
              readOnly: true,
            },
            {
              xtype: "textfield",
              fieldLabel: "หมวดค่าใช้จ่าย (ใบกันเหลื่อม)",
              labelWidth: 160,
              emptyText: "กรุณาระบุ...",
              value: Ext.overlap_expense.data.c_name,
              width: 400,
              style: "text-align: left;background:#eee;",
              readOnly: true,
            },
          ],
        }),
        buttons: [
          {
            text: "ยืนยัน",
            handler: function () {
              Ext.Ajax.request({
                url: "tor/api/mnTorController.php",
                method: "POST",
                params: {
                  mode: "UP_EXPENSE_BUDGET",
                  // id :  ""  ,
                  tor_id: Ext.TOR_ID,
                  po_expense_id: Ext.overlap_expense.data.id,
                  dc_expense_budget_type_id: Ext.overlap_budget_type.data.id,
                },
                success: function (result, request) {
                  Ext.getCmp("transfermoney").getEl().unmask();
                  Ext.getCmp("bg_budget_dtl_overlap_idID").getEl().unmask();
                  let json = Ext.util.JSON.decode(result.responseText);
                  Ext.getCmp("transfermoney").destroy();
                  // Ext.getCmp("bg_budget_dtl_overlap_idID").destroy();
                  if (json.success == "Success") {
                    Ext.Msg.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย");
                  } else {
                    Ext.Msg.alert("Error", "ติดต่อadmin", json.msg);
                  }
                },
                failure: function (result, request) {
                  Ext.MessageBox.alert("Failed", result.responseText);
                },
              });
            },
          },
          {
            text: "ย้อนกลับ",
            handler: function () {
              var id = "bg_budget_dtl_overlap_idID";
              var nameID = id + "_Name";
              Ext.getCmp("bg_budget_dtl_overlap_idID").setValue(""); //Ext.getCmp(bg_budget_dtl_overlap_idID).setValue(record.data.id);
              Ext.getCmp("dc_cost_idID").setValue("");
              Ext.getCmp("c_overlapID").setValue("");
              Ext.getCmp("i_yearOverlapID").setValue("");
              Ext.getCmp(nameID).setValue("");
              Ext.getCmp("transfermoney").hide();
              Ext.getCmp("transfermoney").destroy();
            },
          },
        ],
      }).show();
    };
    function popOverlap(rec) {
      Ext.storeDepartment = new Ext.data.JsonStore({
        storeId: "storeDepartment",
        autoLoad: true,
        url: "api/All.php",
        root: "data",
        baseParams: { type: "storeOverlap", start: 0, limit: 20, mode: null, dc_cost_id: rec.data.dc_cost2_id }, //Permission i_read
        idProperty: "id",
        totalProperty: "totalCount",
        //                                       fields: ["id", "c_department", "c_name"],
        fields: ["id", "bg_budget_dtl_overlap_id", "dc_costTxt", "c_name", "i_year", "c_code_ref", "dc_expense_budget_type_id", "dc_cost_id", "bg_expense_id", "d_end_date", "f_total"],
      });
      var columnMini = [
        { header: "ID System", sortable: true, hidden: true, dataIndex: "id" },
        {
          header: "ปีเลขที่ใบกัน",
          align: "center",
          width: 150,
          sortable: true,
          dataIndex: "i_year",
        },
        {
          header: "เลขที่ใบกัน",
          sortable: true,
          id: "c_name",
          //    align: "center",
          dataIndex: "c_name",
          renderer: function (value, metaData, record, rowIndex, colIndex, store) {
            metaData.attr = "style='cursor:pointer';";
            return value;
          },
        },
        { header: "วันหมดอายุใบกัน", sortable: true, dataIndex: "d_end_date" },
        { header: "หน่วยงาน", sortable: true, dataIndex: "dc_costTxt" },
        {
          header: "จำนวนเงิน",
          sortable: true,
          align: "RIGHT",
          dataIndex: "f_total",
        },
      ];
      Ext.PopDepartmentForm = new Ext.ux.Poplov({
        text: "เลขที่ใบกัน",
        id: "bg_budget_dtl_overlap_idID", //go to relation
        iconCls: "page_magnify",
        name: "bg_budget_dtl_overlap_id",
        valueHidden: "bg_budget_dtl_overlap_id", //go to hidden
        store: Ext.storeDepartment,
        headerGrid: columnMini,
        widthText: 280,
        fieldLabel: "เลขที่ใบกัน",
        isCellClickGrid: true,
        cellClickGrid: function (grid, rowIndex, columnIndex, e) {
          var id = "bg_budget_dtl_overlap_idID";
          var nameID = id + "_Name";
          var record = grid.getStore().getAt(rowIndex);
          Ext.overlap = record;
          var TextShow = record.data.c_code_ref;
          Ext.recs = record;
          Ext.getCmp(id).setValue(record.data.id); //Ext.getCmp(bg_budget_dtl_overlap_idID).setValue(record.data.id);
          Ext.getCmp("dc_cost_idID").setValue(record.data.dc_costTxt);
          Ext.getCmp("c_overlapID").setValue(TextShow);
          Ext.getCmp("i_yearOverlapID").setValue(record.data.i_year);
          Ext.getCmp(nameID).setValue(TextShow);
          Ext.getCmp("win-pop-lov" + id).hide();
          Ext.getCmp("win-pop-lov" + id).destroy();
          Ext.getCmp("bookOverlapID").hide();
          // console.log(record.data.dc_expense_budget_type_id);
          // console.log(record.data.bg_expense_id);
          // return ;
          if (record.data.dc_expense_budget_type_id != Ext.selectRow.get("dc_expense_budget_type_id")) {
            var index = Ext.dc_expense_budget_type.findExact("id", record.data.dc_expense_budget_type_id);
            Ext.overlap_budget_type = Ext.dc_expense_budget_type.getAt(index);
            var index = Ext.po_expense1.findExact("id", record.data.bg_expense_id);
            Ext.overlap_expense = Ext.po_expense1.getAt(index);
            var index = Ext.po_expense1.findExact("id", Ext.selectRow.get("po_expense_id") + "");
            Ext.po_expense_old = Ext.po_expense1.getAt(index);
            // Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'> ข้อมูลแหล่งเงินไม่ตรงกัน เมื่อกดปุ่มบันทึกรายการจะอัพเดทข้อมูล</span><br>");
            transfer();
            // msg += "<span style='white-space: nowrap;'>- กรุณา</span><br>";
          } else if (record.data.bg_expense_id != Ext.selectRow.get("po_expense_id")) {
            var index = Ext.dc_expense_budget_type.findExact("id", record.data.dc_expense_budget_type_id);
            Ext.overlap_budget_type = Ext.dc_expense_budget_type.getAt(index);
            var index = Ext.po_expense1.findExact("id", record.data.bg_expense_id);
            Ext.overlap_expense = Ext.po_expense1.getAt(index);
            var index = Ext.po_expense1.findExact("id", Ext.selectRow.get("po_expense_id") + "");
            Ext.po_expense_old = Ext.po_expense1.getAt(index);
            transfer();
          } else {
            return;
          }
        },
      });
    }

    function bgBagedOver(rec, i) {
      Ext.rec = rec;
      console.log(rec);
      var ip = Ext.session.ip_booking; // 192

      if (rec.get("i_overlap") === 2) return false;
      else
        return new Ext.Window({
          id: "winDcExpTypeDdd2ID",
          modal: true,
          width: 850,
          title: "ใช้เงินใบกันเหลื่อม" + Ext.selectRow.get("f_total_amt"),
          layout: "fit",
          height: 300,

          items: new Ext.FormPanel({
            //                    frame: true,
            labelWidth: 160,
            padding: "10px 10px 10px 10px",
            url: "tor/api/mnBgExpenseController3.php",
            //                    url: "tor/api/mnBgExpenseController2.php",
            id: "formDcExpTypeDddID",
            items: [
              {
                xtype: "hidden",
                name: "sp_tor_contract_id",
                value: Ext.selectRow.get("sp_tor_contract_id"),
                id: "sp_tor_contract_idID",
              },
              {
                xtype: "hidden",
                name: "i_overlap",
                value: Ext.selectRow.get("i_overlap"), //1 ก่อนจอง 2 จองแล้ว
                id: "i_overlapID",
              },
              {
                xtype: "hidden",
                name: "mode",
                id: "modesubID",
                value: "UPDATEIOVER1", //1 ก่อนจอง 2 จองแล้ว
              },
              Ext.PopDepartmentForm.mini,
              {
                xtype: "textfield",
                fieldLabel: "ปีเลขที่ของใบกัน",
                readOnly: true,
                name: "yearTxt",
                value: rec.get("i_yyyy_overlap"),
                id: "i_yearOverlapID",
              },
              {
                xtype: "displayfield",
                fieldLabel: "หน่วยงาน",
                name: "dc_costTxt",
                value: rec.get("dc_cost_idTxt"),
                id: "dc_cost_idID",
              },
              {
                xtype: "displayfield",
                fieldLabel: "แหล่งเงิน",
                name: "budget_typeTxt",
                value: rec.get("c_expense_budget_type_name"),
                id: "dc_expense_budget_type_idID",
              },
              {
                xtype: "displayfield",
                fieldLabel: "หมวดค่าใช้จ่ายย่อย",
                name: "c_expense_nameTxt",
                value: rec.get("c_expense_name"),
                id: "c_expenseID",
              },
              {
                xtype: "displayfield",
                fieldLabel: "เลขที่ใบกัน",
                name: "c_overlap",
                value: rec.get("c_overlap"),
                id: "c_overlapID",
              },
              {
                fieldLabel: "บันทึกใบกันเหลื่อมผ่าระบบงบประมาณ",
                xtype: "button",
                text: "บันทึกจองกันเหลื่อม",
                width: 80,
                name: "bookOverlap",
                hidden: true,
                id: "bookOverlapID",
                handler: function () {
                  function getCode(event) {
                    console.log(5);
                    switch (event) {
                      case "c_overlap":
                        link =
                          Ext.session.IPAPIBG +
                          "/?/bg/BgBudgetAllSupplies" +
                          "/i_year/" +
                          rec.get("i_yyyy_overlap") +
                          "/dc_expense_budget_type_id/" +
                          rec.get("dc_expense_budget_type_id") +
                          "/dc_cost_id/" +
                          rec.get("dc_cost2_id") +
                          "/bg_expense_id/" +
                          rec.get("po_expense_id") +
                          "/c_code_overlap/" +
                          encodeURIComponent(rec.get("c_overlap")) +
                          "/";
                        break;
                      case "c_overlap_book":
                        link =
                          Ext.session.IPAPIBG +
                          "/?/bg/mn_BgReserveMoney/mode/POST" +
                          "/i_sys/3" +
                          "/pr_id/" +
                          rec.get("sp_tor_id") +
                          "/po_id/" +
                          rec.get("sp_tor_contract_id") +
                          "/chk_id/0" +
                          "/i_year/" +
                          rec.get("i_yyyy") +
                          "/i_pr_type/" +
                          1 + //  plan or period
                          "/i_reserve/2" + // step 1 PR step 2 po step3 checking
                          "/dc_cost_id/" +
                          Ext.rec.get("dc_cost2_id") +
                          "/dc_budget_type_id/" +
                          rec.get("dc_expense_budget_type_id") +
                          "/bg_expense_id/" +
                          rec.get("po_expense_id") +
                          "/i_last/" +
                          (rec.get("i_type_contract") === 3 ? 0 : 1) + // pr มี สัญญาเดียว = 1
                          "/c_code_overlap/" +
                          encodeURIComponent(rec.get("c_overlap")) +
                          "/f_amt/" +
                          rec.get("f_total_amt");
                        break;
                    }
                    return link;
                  }
                  function your_func(link) {
                    Ext.Ajax.request({
                      url: link,
                      method: "GET", //POST
                      disableCaching: false,
                      success: function (result, request) {
                        let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                        if (jsonData.data[0].f_overlap_total < parseFloat(rec.get("f_total_amt").replace(/\,/g, ""))) {
                          Ext.Msg.alert("Success", "ไม่สารถใช้เงินกันเหลื่ยเนื่องจากเงินในใบกันไม่พอ", function (form, action) {
                            Ext.getCmp("winDcExpTypeDdd2ID").getEl().unmask();
                          });
                        } else {
                          //BOOK
                          Ext.Ajax.request({
                            url: getCode("c_overlap_book"),
                            method: "GET", //POST
                            disableCaching: false,
                            success: function (result, request) {
                              let jsonData = Ext.util.JSON.decode(result.responseText); //decode json

                              //UPDATE
                              Ext.Ajax.request({
                                url: "tor/api/mnBgExpenseController3.php",
                                method: "POST", //POST
                                params: {
                                  mode: "UPDATEIOVER2",
                                  sp_tor_contract_id: rec.get("sp_tor_contract_id"),
                                  bg_budget_dtl_overlap_id: jsonData.bg_reserve_overlap_id,
                                },
                                success: function (result, request) {
                                  let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                                  // console.log(jsonData);
                                  Ext.Msg.alert("Success", "บันทึกการใช้เงินใบกันเหลื่อมเรียบร้อยแล้ว", function (form, action) {
                                    Ext.storeDtl.reload({
                                      callback: function (record, operation, success) {
                                        if (success) {
                                          //บันทึกแล้ว
                                          Ext.each(record, function (value) {
                                            // console.log(value);
                                            if (rec.data.sp_tor_contract_id === value.data.sp_tor_contract_id) {
                                              Ext.selectRow = value;
                                              Ext.getCmp("winDcExpTypeDdd2ID").getEl().unmask();
                                              Ext.getCmp("winDcExpTypeDdd2ID").destroy();
                                              Ext.getCmp("tabpanel1").getStore().reload();
                                              // Ext.selectRow = null;
                                              Ext.getCmp(Ext.poFormID).destroy();
                                              Ext.buAct = "update";
                                              Ext.loadStore("edit", true);
                                            }
                                          });
                                          // record.forEach(function (v) {
                                          //     if (rec.data.sp_tor_contract_id === v.get('sp_tor_contract_id')) {
                                          //         // Override record
                                          //         Ext.selectRow = v;
                                          //         Ext.getCmp('winDcExpTypeDdd2ID').getEl().unmask();
                                          //         Ext.getCmp('winDcExpTypeDdd2ID').destroy();
                                          //         Ext.getCmp("tabpanel1").getStore().reload();
                                          //         Ext.selectRow = null;
                                          //         Ext.getCmp(Ext.poFormID).destroy();
                                          //         // Override window items
                                          //         // END
                                          //     }
                                          // });
                                        }
                                      },
                                    });
                                  });
                                },
                                failure: function (result, request) {
                                  Ext.MessageBox.alert("Failed", result.responseText); // connect
                                },
                              });
                            },
                            failure: function (result, request) {
                              Ext.MessageBox.alert("Failed", result.responseText); // connect
                            },
                          });
                        }
                      },
                      failure: function (result, request) {
                        Ext.MessageBox.alert("Failed", result.responseText); // connect
                      },
                    });
                  }
                  Ext.getCmp("winDcExpTypeDdd2ID").getEl().mask("กำลังจองใบกัน...", "x-mask-loading");

                  setTimeout(function () {
                    //                                    your_func(getCode('c_overlap_book'));
                    your_func(getCode("c_overlap"));
                  }, 5000);
                },
                listeners: {
                  afterrender: function () {
                    if (Ext.getCmp("c_overlapID").getValue() == "") {
                      Ext.getCmp("bookOverlapID").hide();
                    }
                  },
                },
              },
            ],
            buttonAlign: "center",
            buttons: [
              {
                text: "บันทึกรายการ",
                id: "buSaveOverLapSubID",
                iconCls: "icon-save",
                //disabled: true,
                listeners: {
                  afterrender: function () {},
                },
                handler: function () {
                  console.log("asdf");
                  var form = Ext.getCmp("formDcExpTypeDddID").getForm();
                  var msg = "";
                  // console.log(nameID);
                  // return ;
                  if (Ext.getCmp("bg_budget_dtl_overlap_idID_Name").getValue() == "") {
                    msg += "<span style='white-space: nowrap;'>- กรุณาเลือกใบกันเหลื่อม</span><br>";
                  }
                  if (msg == "") {
                    form.submit({
                      waitMsg: "Saving Data...",
                      success: function (form, action) {
                        Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                          Ext.storeDtl.reload({
                            callback: function (record, operation, success) {
                              if (success) {
                                //บันทึกแล้ว
                                record.forEach(function (v) {
                                  if (Ext.selectRow.get("sp_tor_contract_id") === v.get("sp_tor_contract_id")) {
                                    // Override record
                                    Ext.selectRow = v;
                                    Ext.getCmp("winDcExpTypeDdd2ID").destroy();
                                    // Override window items
                                    var win = bgBagedOver(v, 2);
                                    win.items.items[0].getForm().loadRecord(record);
                                    win.show();
                                    // END
                                  }
                                });
                              }
                            },
                          });
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
                  } else {
                    Ext.MessageBox.alert("แจ้งเตือน", msg);
                  }
                },
                //haddler
              },
              {
                text: Ext.GLOBAL_BU_BACK_TH,
                handler: function () {
                  Ext.getCmp("winDcExpTypeDdd2ID").destroy();
                },
              },
            ],
          }),
        });
    }

    function bgBagedType() {
      return new Ext.Window({
        id: "winDcExpTypeDddID",
        modal: true,
        width: 850,
        //                height: 430,
        title: "เปลี่ยนแปลงแหล่งเงินที่จัด ซื้อ/เช่า/จ้าง เงินในสัญญา " + Ext.selectRow.get("f_total_amt"),
        layout: "form",
        items: new Ext.FormPanel({
          frame: true,
          labelWidth: 160,
          padding: "10px 10px 10px 10px",
          url: "tor/api/mnBgExpenseController2.php",
          id: "formDcExpTypeDddID",
          items: [
            {
              xtype: "hidden",
              name: "tor_id",
              id: "tor_id",
              value: Ext.selectRow.get("sp_tor_id"),
            },
            {
              xtype: "displayfield",
              name: "f_contract_amt",
              fieldLabel: "เงินในสัญญา",
              value: Ext.selectRow.get("f_total_amt"),
            },
            {
              xtype: "hidden",
              name: "sp_tor_contract_id",
              id: "sp_tor_contract_idID",
              value: Ext.selectRow.get("sp_tor_contract_id"),
            },
            new Ext.form.ComboBox({
              mode: "local",
              store: Ext.dc_expense_budget_type,
              fieldLabel: "แหล่งเงินที่ 1",
              anchor: "60%",
              submitValue: true,
              id: "dc_expense_budget_type_id1TxtID",
              name: "dc_bg_budget_type_id",
              hiddenName: "dc_expense_budget_type_id",
              valueField: "id",
              displayField: "c_name",
              triggerAction: "all",
              forceSelection: true,
              selectOnFocus: true,
              typeAhead: false,
              emptyText: "กรุณาเลือกแหล่งเงิน...",
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
              xtype: "buttongroup",
              fieldLabel: "จำนวนเงินจากแหล่งเงิน 1",
              frame: false,
              border: false,

              items: [
                {
                  xtype: "displayfield",
                  name: "f_type_amt",
                },
                {
                  xtype: "textfield",
                  fieldLabel: "จำนวนเงินจากแหล่งเงิน",
                  disabled: (Ext.selectRow.get("c_bg_reserve_money1_id") > 0 && Ext.selectRow.get("c_f_type_amt").replace(/,/g, "")) > 0 ? true : false,
                  name: "c_f_type_amt",
                  id: "f_type_amtID",
                  value: 20,
                  listeners: {
                    blur: function () {
                      this.fn(true);
                    },
                    afterrender: function () {
                      this.fn = function (t) {
                        //                                        console.log('dddddddddd');
                        //                                        console.log(Ext.getCmp('f_totalID').getValue());
                        var val = 0;
                        val = this.getValue();
                        this.setValue(Ext.floatRenderer(parseFloat(val.replace(/,/g, "") / 1)));
                      };
                      this.fn();
                    },
                  },
                  style: {
                    labelAlign: "right",
                    "font-weight": "bold",
                    padding: "1px",
                    margin: "1px",
                    color: "blue",
                    "background-color": "#fff",
                    "text-align": "right",
                  },
                },
                {
                  xtype: "tbspacer",
                  width: 18,
                },
                {
                  xtype: "button",
                  text: "* บันทึกรายการจอง",
                  id: "button1",
                  listeners: {
                    afterrender: function () {
                      this.setDisabled((Ext.selectRow.get("c_bg_reserve_money1_id") > 0 && Ext.selectRow.get("c_f_type_amt").replace(/,/g, "")) > 0 ? true : false);
                    },
                  },
                  handler: function () {
                    if (Ext.isEmpty(Ext.getCmp("f_type_amtID").getValue())) {
                      Ext.MessageBox.alert("Failed", " กรุณากรอกเงินที่ทำสัญญา แยกแหล่งเงิน ");
                      return false;
                    } else {
                      Ext.getCmp("formDcExpTypeDddID").getEl().mask("Please wait...", "x-mask-loading");
                      //                                            alert(Ext.getCmp('f_type_amtID').getValue());
                      //                                            return false;
                      genBookBg(Ext.getCmp("f_type_amtID").getValue(), 1);
                    }
                  },
                },
                {
                  xtype: "radiogroup",
                  columns: [98, 98],
                  fieldLabel: "ขอดำเนินการ",
                  id: "i_pr_type1ID",
                  name: "i_pr_type1",
                  items: [
                    {
                      // checked: true,
                      name: "i_pr_type1",
                      inputValue: 1,
                      boxLabel: "จองแบบแผน",
                    },
                    {
                      inputValue: 2,
                      name: "i_pr_type1",
                      boxLabel: "จองแบบงวด",
                    },
                  ], //radiogroup
                },
              ],
            },
            {
              xtype: "buttongroup",
              fieldLabel: "ปิดสัญญาจองจะซื้อจะขาย 1",
              hidden: Ext.selectRow.get("i_type_contract") == 3 ? false : true,
              frame: false,
              border: false,
              items: [
                {
                  xtype: "button",
                  text: "* จะซื้อจะขาย/ส่งเลขสัญญาให้ ERP",
                  id: "button12",
                  hidden: Ext.isEmpty(Ext.idStatus) ? false : true,
                  handler: function () {
                    //                                        winDcExpTypeDddID
                    //                                        formDcExpTypeDddID
 

                   const authenErp = ()=>{
                       const url = Ext.URL_SERVER_API+"/loginErp"; 
                       Ext.Ajax.request({
                          url: url, //procure/poPeriod send to php callback erp and register i_erp_status 1 => 0
                          method: "POST",
                          params: {
                            mode: "login", 
                          },  
                          success: function (result, request) {
                              Ext.getCmp("formDcExpTypeDddID").getEl().unmask();
//                              console.log(result);
                              let json = Ext.util.JSON.decode(result.responseText);
                               console.log(json);
                           
                             
                              if(json.success){
                                    Ext.MessageBox.alert("Success","Login ERP Success" ); 
                                         Ext.Msg.show({
                                                        title: "Success",
                                                        msg: "Authen ERP เรียบร้อยแล้ว คุณต้องการส่งสัญญาเลขที่ " + Ext.selectRow.data.c_code+" ให้กับ ERP ใช่หรือไม่ ",
                                                        width: 400,
                                                        icon: Ext.MessageBox.info, 
                                                        buttons: Ext.MessageBox.YESNO,
                                                        fn: function (btn, text) {
                                                          if (btn === "yes"){ 
                                                              //@TODO 
                                                              Ext.status.sendContractToErp(json.session_id);
                                                          }else null;
                                                        }
                                                        //icon: Ext.MessageBox.ERROR
                                                      });
        
                                    Ext.getCmp("formDcExpTypeDddID").getEl().unmask();
                              }

                          }, 
                          failure: function (result, request) {
                            Ext.MessageBox.alert("Failed", result.responseText);
                            Ext.getCmp("formDcExpTypeDddID").getEl().unmask();
                          } 
                      }); 
                   };
                        
 
                    Ext.getCmp("formDcExpTypeDddID").getEl().mask("Please wait...", "x-mask-loading");
                    
                    // Call the login function
                        authenErp();
                    
                    //check login 
                    return false;
                    if(authenErp()){
                        Ext.url_erp = "https://api-eis.vajira.ac.th";
                        //@TODO เปลี่ยนเมื่อใช้จริง 
                        Ext.Ajax.request({
                          url: Ext.url_erp+ "/procure/po_send", //procure/poPeriod send to php callback erp and register i_erp_status 1 => 0
                          method: "POST",
                          params: {
                            mode: "CONTRACT_ERP",
                            tor_id: Ext.selectRow.get("sp_tor_id"),
                            sp_tor_contract_id: Ext.selectRow.get("sp_tor_contract_id"),
                          },
                          success: function (result, request) {
                            try {
                              let json = Ext.util.JSON.decode(result.responseText);
                              let jsons = json.results;

                              if (jsons.result.retid[0]) {
                                Ext.MessageBox.alert("Success", "ส่งข้อมูลสัญญาให้ทาง ERP เรียบร้อยแล้ว retid:" + jsons.result.retid[0], function () {
                                  Ext.getCmp("winDcExpTypeDddID").destroy();
                                  loadBgStore(jsons.result.retid[0]);
                                });
                              } else {
                                Ext.MessageBox.alert("Failed", "การส่งข้อมูลปลายทางมีปัญหา");
                                Ext.getCmp("winDcExpTypeDddID").destroy();
                              }
                              //Ext.Msg.alert('Status', 'Request successfully done .');
                            } catch (err) {
                              Ext.Msg.alert("Error", "Some error occured during execution.<br/></br>" + err);
                              Ext.getCmp("formDcExpTypeDddID").getEl().unmask();
                            }
                          },
                          failure: function (result, request) {
                            Ext.MessageBox.alert("Failed", result.responseText);
                            Ext.getCmp("formDcExpTypeDddID").getEl().unmask();
                          },
                        });
                      }else{
                           Ext.MessageBox.alert("Failed", "Login ERP ",()=>{
                               
                               alert('window submit login');
                               Ext.getCmp("formDcExpTypeDddID").getEl().unmask();
                               
                           });
                      }
                    
                   
                  },
                },
                {
                  xtype: "button",
                  text: "* ปิดสัญญา",
                  id: "button11",
                  disabled: Ext.selectRow.get("bg_reserve_i_last1") > 0 ? true : false,
                  handler: function () {
                    //                                        alert(Ext.selectRow.get('bg_reserve_i_last1'));
                    //                                        console.log(Ext.selectRow.get('bg_reserve_i_last1'));
                    //                                        return false;
                    Ext.Ajax.request({
                      url: "tor/api/mnValidGetBgPeriod.php",
                      method: "POST",
                      params: {
                        mode: "SUM_BG_TYPE_PERIOD",
                        dc_expense_budget_type_id: Ext.selectRow.get("dc_expense_budget_type_id"),
                        sp_tor_contract_id: Ext.selectRow.get("sp_tor_contract_id"),
                      },
                      success: function (result, request) {
                        let json = Ext.util.JSON.decode(result.responseText);
                        Ext.getCmp("formDcExpTypeDddID").getEl().mask("Please wait...", "x-mask-loading");
                        genBookBgClose(json.f_dtl_amt, 1);
                      },
                      failure: function (result, request) {
                        Ext.MessageBox.alert("Failed", result.responseText);
                      },
                    });
                  },
                },
                {
                  xtype: "tbspacer",
                  width: 18,
                },
                {
                  xtype: "displayfield",
                  value: "* ปิดสัญญา",
                  style: {
                    width: "200px",
                    padding: "1px",
                    margin: "1px",
                    color: "red",
                    "background-color": "#fff",
                    "text-align": "right",
                  },
                },
              ],
            },
            new Ext.form.ComboBox({
              mode: "local",
              store: Ext.dc_expense_budget_type,
              fieldLabel: "แหล่งเงินที่ 2",
              disabled: Ext.selectRow.get("dc_expense_budget_type2_id") > 0 ? false : true,
              anchor: "60%",
              submitValue: true,
              id: "dc_expense_budget_type2_idTxtID",
              name: "dc_bg_budget_type2_id",
              hiddenName: "dc_expense_budget_type2_id",
              valueField: "id",
              displayField: "c_name",
              triggerAction: "all",
              forceSelection: true,
              selectOnFocus: true,
              typeAhead: false,
              emptyText: "กรุณาเลือกแหล่งเงิน...",
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
              xtype: "buttongroup",
              fieldLabel: "จำนวนเงินจากแหล่งเงิน 2",
              frame: false,
              disabled: Ext.selectRow.get("c_bg_reserve_money2_id") > 0 ? true : false,
              border: false,
              items: [
                {
                  xtype: "displayfield",
                  name: "f_type2_amt",
                },
                {
                  xtype: "textfield",
                  fieldLabel: "จำนวนเงินจากแหล่งเงิน 2",
                  name: "c_f_type2_amt",
                  id: "f_type2_amtID",
                  disabled: Ext.selectRow.get("c_bg_reserve_money2_id") > 0 ? true : false,
                  listeners: {
                    blur: function () {
                      this.fn();
                    },
                    afterrender: function () {
                      this.fn = function () {
                        var val = 0;
                        val = this.getValue();
                        this.setValue(Ext.floatRenderer(parseFloat(val.replace(/,/g, "") / 1)));
                      };
                      this.fn();
                    },
                  },
                  style: {
                    labelAlign: "right",
                    "font-weight": "bold",
                    padding: "1px",
                    margin: "1px",
                    color: "blue",
                    "background-color": "#fff",
                    "text-align": "right",
                  },
                },
                {
                  xtype: "tbspacer",
                  width: 18,
                },
                {
                  xtype: "button",
                  text: "* บันทึกรายการจอง",
                  id: "button2",
                  handler: function () {
                    if (Ext.isEmpty(Ext.getCmp("f_type2_amtID").getValue())) {
                      Ext.MessageBox.alert("Failed", " กรุณากรอกเงินที่ทำสัญญา แยกแหล่งเงิน ");
                      return false;
                    } else {
                      Ext.getCmp("formDcExpTypeDddID").getEl().mask("Please wait...", "x-mask-loading");
                      genBookBg2(Ext.getCmp("f_type2_amtID").getValue(), 2);
                    }
                  },
                },
                {
                  xtype: "radiogroup",
                  columns: [98, 98],
                  fieldLabel: "ขอดำเนินการ",
                  id: "i_pr_type2ID",
                  disabled: Ext.selectRow.get("c_bg_reserve_money2_id") > 0 ? true : false,
                  name: "i_pr_type2",
                  items: [
                    {
                      //  checked: true,
                      name: "i_pr_type2",
                      inputValue: 1,
                      boxLabel: "จองแบบแผน",
                    },
                    {
                      inputValue: 2,
                      name: "i_pr_type2",
                      boxLabel: "จองแบบงวด",
                    },
                  ], //radiogroup
                },
              ],
            },
            new Ext.form.ComboBox({
              mode: "local",
              store: Ext.dc_expense_budget_type,
              fieldLabel: "แหล่งเงินที่ 3",
              disabled: Ext.selectRow.get("dc_expense_budget_type3_id") > 0 ? false : true,
              anchor: "60%",
              submitValue: true,
              id: "dc_expense_budget_type3_idTxtID",
              name: "dc_bg_budget_type3_id",
              hiddenName: "dc_expense_budget_type3_id",
              valueField: "id",
              displayField: "c_name",
              triggerAction: "all",
              forceSelection: true,
              selectOnFocus: true,
              typeAhead: false,
              emptyText: "กรุณาเลือกแหล่งเงิน...",
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
              xtype: "buttongroup",
              fieldLabel: "จำนวนเงินจากแหล่งเงิน 3",
              frame: false,
              disabled: Ext.selectRow.get("c_bg_reserve_money3_id") > 0 ? true : false,
              border: false,
              items: [
                {
                  xtype: "displayfield",
                  name: "f_type3_amt",
                },
                {
                  xtype: "textfield",
                  fieldLabel: "จำนวนเงินจากแหล่งเงิน 3",
                  name: "c_f_type3_amt",
                  id: "f_type3_amtID",
                  disabled: Ext.selectRow.get("c_bg_reserve_money3_id") > 0 ? true : false,
                  listeners: {
                    blur: function () {
                      this.fn();
                    },
                    afterrender: function () {
                      this.fn = function () {
                        var val = 0;
                        val = this.getValue();
                        this.setValue(Ext.floatRenderer(parseFloat(val.replace(/,/g, "") / 1)));
                      };
                      this.fn();
                    },
                  },
                  style: {
                    labelAlign: "right",
                    "font-weight": "bold",
                    padding: "1px",
                    margin: "1px",
                    color: "blue",
                    "background-color": "#fff",
                    "text-align": "right",
                  },
                },
                {
                  xtype: "tbspacer",
                  width: 18,
                },
                {
                  xtype: "button",
                  text: "* บันทึกรายการจอง",
                  id: "button3",
                  listeners: {
                    afterrender: function () {
                      this.setDisabled((Ext.selectRow.get("c_bg_reserve_money3_id") > 0 && Ext.selectRow.get("c_f_type3_amt").replace(/,/g, "")) > 0 ? true : false);
                    },
                  },
                  handler: function () {
                    if (Ext.isEmpty(Ext.getCmp("f_type3_amtID").getValue())) {
                      Ext.MessageBox.alert("Failed", " กรุณากรอกเงินที่ทำสัญญา แยกแหล่งเงิน ");
                      return false;
                    } else {
                      Ext.getCmp("formDcExpTypeDddID").getEl().mask("Please wait...", "x-mask-loading");
                      genBookBg3(Ext.getCmp("f_type3_amtID").getValue(), 3);
                    }
                  },
                },
                {
                  xtype: "radiogroup",
                  columns: [98, 98],
                  fieldLabel: "ขอดำเนินการ",
                  id: "i_pr_type3ID",
                  disabled: Ext.selectRow.get("c_bg_reserve_money3_id") > 0 ? true : false,
                  name: "i_pr_type3",
                  items: [
                    {
                      name: "i_pr_type3",
                      inputValue: 1,
                      boxLabel: "จองแบบแผน",
                    },
                    {
                      inputValue: 2,
                      name: "i_pr_type3",
                      boxLabel: "จองแบบงวด",
                    },
                  ], //radiogroup
                },
              ],
            },
            {
              xtype: "buttongroup",
              fieldLabel: "ปิดสัญญาจองจะซื้อจะขาย 2",
              hidden: Ext.selectRow.get("i_type_contract") == 3 ? false : true,
              frame: false,
              border: false,
              disabled: Ext.selectRow.get("c_bg_reserve_money2_id") > 0 ? false : true,
              items: [
                {
                  xtype: "button",
                  text: "* แก้เงินจอง",
                  id: "button22",
                  disabled: Ext.selectRow.get("bg_reserve_i_last2") > 0 ? true : false,
                  handler: function () {
                    Ext.Ajax.request({
                      url: "tor/api/mnValidGetBgPeriod.php",
                      method: "POST",
                      params: {
                        mode: "SUM_BG_TYPE_PERIOD",
                        dc_expense_budget_type_id: Ext.selectRow.get("dc_expense_budget_type2_id"),
                        sp_tor_contract_id: Ext.selectRow.get("sp_tor_contract_id"),
                      },
                      success: function (result, request) {
                        let json = Ext.util.JSON.decode(result.responseText);
                        Ext.getCmp("formDcExpTypeDddID").getEl().mask("Please wait...", "x-mask-loading");
                        genBookBgClose(json.f_dtl_amt, 2);
                      },
                      failure: function (result, request) {
                        Ext.MessageBox.alert("Failed", result.responseText);
                      },
                    });
                  },
                },
              ],
            },
          ],
          buttons: [
            {
              text: "Cancel",
              handler: function () {
                Ext.getCmp("winDcExpTypeDddID").destroy();
                //                                Ext.getCmp("winChequeID").destroy();
                //                                Ext.getCmp("winMain").destroy();
                Ext.storeDtl.reload();
              },
            },
          ],
        }),
      });
    }
    Ext.dc_expense_budget_type2.load({
      params: {
        c_dc_expense_budget_type2_id: Ext.selectRow.data.dtl_dc_bg_budget_type_id2,
        c_dc_expense_budget_type_id: Ext.selectRow.data.dtl_dc_bg_budget_type_id1,
        c_dc_expense_budget_type3_id: Ext.selectRow.data.dtl_dc_bg_budget_type_id3,
      },
    });
    Ext.po_expense.load({ params: { po_expense_id: Ext.selectRow.data.po_expense_id } });

    Ext.dc_creditor.load({
      params: {
        dc_creditor: Ext.selectRow.data.dc_creditor,
      },
    });
    //
    Ext.idStatus = null;
    loadBgStore = function (id) {
      Ext.idStatus = id;
      Ext.storeDtl.reload({
        callback: function (record, operation, success) {
          if (success) {
            //Override SelectRow Record
            record.forEach(function (v) {
              if (Ext.selectRow.get("sp_tor_contract_id") == v.get("sp_tor_contract_id")) {
                Ext.selectRow = v;
                var rec = v;
 
                if (Ext.selectRow.get("i_purchase") == 1) {
                  //แหล่งเงินที่ 1
                  Ext.selectRow.set("f_type_amt", rec.get("dtl_f_type_amt1"));
                  console.log(Ext.selectRow);
                  Ext.selectRow.set("i_pr_type1", rec.get("i_pr_type1") / 1);
                  Ext.selectRow.set("po_expense_id", parseInt(rec.get("dtl_po_expense_id1")) / 1);
                  Ext.selectRow.set("dc_expense_budget_type_id", parseInt(rec.get("dtl_dc_bg_budget_type_id1")) / 1);
                  //แหล่งเงินที่ 2
                  Ext.selectRow.set("f_type2_amt", rec.get("dtl_f_type_amt2"));
                  Ext.selectRow.set("i_pr_type2", rec.get("i_pr_type2") / 1);
                  Ext.selectRow.set("po_expense2_id", parseInt(rec.get("dtl_po_expense_id2")) / 1);
                  Ext.selectRow.set("dc_expense_budget_type2_id", parseInt(rec.get("dtl_dc_bg_budget_type_id2")) / 1);
                  //แหล่งเงินที่ 3
                  Ext.selectRow.set("f_type3_amt", rec.get("dtl_f_type_amt3"));
                  Ext.selectRow.set("i_pr_type3", rec.get("i_pr_type3") / 1);
                  Ext.selectRow.set("po_expense3_id", parseInt(rec.get("dtl_po_expense_id3")) / 1);
                  Ext.selectRow.set("dc_expense_budget_type3_id", parseInt(rec.get("dtl_dc_bg_budget_type_id3")) / 1);
                }

                if (Ext.selectRow.get("count_period") === 0 && Ext.selectRow.get("i_type_contract") !== 3) {
                  Ext.MessageBox.alert("Warning", " กรุณากรอกข้อมูลงวด /" + Ext.selectRow.get("count_period"));
                  return false;
                } else {
                  //                                                                                  console.log(Ext.selectRow);
                  //                                                                                   return false;
                  var win = bgBagedType();
                  win.items.items[0].getForm().loadRecord(Ext.selectRow);
                  win.show();
                } //else
              }
            });
          } //success
        }, //callback
      });
    };
    //
    return new Ext.Window({
      //            collapsible: true,
      //            maximizable: true,
      title: Ext.title,
      id: Ext.poFormID,
      width: Ext.getCmp("contenterCenter").getWidth() - 5,
      height: Ext.getCmp("contenterCenter").getHeight() - 5,
      layout: "fit",
      modal: true,
      plain: true,
      listeners: {
        afterrender: function (window) {
          window.maximize(); // Maximizes the window after rendering
        },
      },
      items: [
        {
          xtype: "tabpanel",
          activeTab: 0,
          id: "winChequeID",
          items: [
            //--รายละเอียด TOR
            new Ext.FormPanel({
              title: "รายละเอียดการลงนามในสัญญา ",
              id: "tap_main",
              iconCls: "icon-start",
              columnWidth: 1,
              url: "tor/api/mnTorController.php",
              //                            frame: true,
              autoScroll: true,
              labelAlign: "left",
              bodyStyle: "padding:1px",

              items: [
                {
                  layout: "column",
                  border: false,
                  items: [
                    {
                      columnWidth: 0.5,
                      layout: "form",
                      border: true,
                      labelWidth: 155,
                      items: [
                        {
                          xtype: "hidden",
                          name: "sp_tor_contract_id",
                          id: "sp_tor_contract_id",
                        },
                        {
                          xtype: "hidden",
                          name: "i_yyyy",
                          id: "i_yyyyID",
                        },
                        {
                          xtype: "hidden",
                          name: "dc_expense_budget_type_id",
                          id: "dc_expense_budget_type_idID",
                        }, ////i_yyyy dc_expense_budget_type_id po_expense_id
                        {
                          xtype: "hidden",
                          name: "po_expense_id",
                          id: "po_expense_idID",
                        },
                        {
                          xtype: disp,
                          readOnly: true,
                          fieldLabel: "เลขสัญญา",
                          id: "codeHdrID",
                          style: "text-align: center;font-weight:bold;background:#eee;",
                          name: "c_code",
                        },
                        {
                          xtype: disp,
                          readOnly: true,
                          fieldLabel: "แหล่งเงิน",
                          name: "c_expense_budget_type_name",
                          width: 300, // c_expense_name c_expense_budget_type_name
                        },
                        {
                          xtype: disp,
                          readOnly: true,
                          fieldLabel: "รายจ่าย",
                          name: "c_expense_name",
                          width: 300,
                        },
                        {
                          xtype: "textarea",
                          readOnly: true,
                          fieldLabel: "เรื่อง/โครงการ",
                          id: "main_c_nameID",
                          name: "c_name",
                          width: 500,
                          height: 50,
                        },
                        {
                          xtype: "datefield",
                          fieldLabel: "วันที่ออกเลขสัญญาในระบบ",
                          id: "d_doc_createID",
                          name: "d_doc_create",
                          readOnly: true,
                          width: 150,
                          listeners: {
                            change: function () {
                              // Ext.getCmp('d_due_dateMianID').fn();
                            },
                          },
                        },
                        {
                          xtype: "datefield",
                          fieldLabel: "วันที่เซ็นสัญญา",
                          id: "d_doc_dateMianID", //d_due_dateMianID d_doc_dateMianID
                          name: "d_doc_date",
                          width: 150,
                          listeners: {
                            change: function () {
                              // Ext.getCmp('d_due_dateMianID').fn();
                            },
                          },
                        },
                        {
                          xtype: "datefield",
                          fieldLabel: "วันเริ่มทำงาน",
                          id: "d_start_dateID", //d_due_dateMianID d_doc_dateMianID
                          name: "d_start_date",
                          width: 150,
                          listeners: {
                            change: function () {
                              // Ext.getCmp('d_due_dateMianID').fn();
                            },
                          },
                        },
                        {
                          xtype: "datefield",
                          fieldLabel: "วันที่สิ้นสุดสัญญา",
                          id: "d_due_dateMianID",
                          name: "d_due_date",
                          width: 150,
                          listeners: {
                            change: function () {
                              this.fn();
                            },
                            beforrender: function () {},
                            afterrender: function () {
                              this.fn = function () {
                                /*  ตัวคำนวณวัน ของ i_deliveryID จริงๆ จะมีข้อมุูลในระบบ
                                                                var oneDay = 24 * 60 * 60 * 1000;
                                                                var firstDate = new Date(Ext.util.Format.date(Ext.getCmp("d_doc_dateMianID").getValue(), "Y/m/d"));
                                                                // var firstDate2 = new Date(Ext.util.Format.date(Ext.getCmp("d_start_dateMianID").getValue(), "Y/m/d"));
                                                                var secondDate = new Date(Ext.util.Format.date(Ext.getCmp("d_due_dateMianID").getValue(), "Y/m/d"));
                                                                var days = Math.round(Math.abs((firstDate - secondDate) / oneDay));
                                                                Ext.getCmp('i_deliveryID').setValue((parseInt(days)));
                                                                */
                                // if (firstDate.getTime() > secondDate.getTime()) {
                                // Text_alert = "<font color='red'>* กรุณากรอกวันที่ให้มากกว่าวันที่ออกเอกสาร</font>";
                                // }
                                // var aa = Ext.util.Format.date(Ext.getCmp("d_doc_dateMianID").getValue(), "Y-m-d");
                                // var bb =  Ext.util.Format.date(Ext.getCmp("d_due_dateMianID").getValue(), "Y-m-d");
                                // var date1 = new Date(aa); //d_due_dateID d_doc_dateID
                                // var date2 = new Date(bb);
                                // const diffTime = Math.abs(date2 - date1);
                                // const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                // Ext.getCmp('i_deliveryID').setValue(diffDays);
                                // console.log(aa + ' == ' + bb);
                                // console.log(diffDays);
                              };
                            },
                          },
                        },
                        {
                          xtype: "datefield",
                          fieldLabel: "วันที่รับสนองราคา ",
                          id: "d_doc_resp_dateID",
                          name: "d_doc_resp_date",
                          width: 150,
                          listeners: {
                            render: function (p) {
                              this.hide();
                            },
                          },
                        },
                        {
                          xtype: "button",
                          name: "overlap",
                          id: "overlapID",
                          hidden: Ext.selectRow.json.i_status_overlap == 1 ? false : true,
                          fieldLabel: "ใช้ใบกันเหลื่อม",
                          text: "เลือกใช้/จอง ใบกัน",
                          listeners: {
                            render: function (p) {
                              if (Ext.selectRow.get("i_overlap") === 2) {
                                this.setText("บันทีกใบกันแล้ว " + Ext.selectRow.get("c_overlap"));
                              }
                            },
                          },
                          handler: function () {
                            var record = Ext.selectRow;
                            popOverlap(record);
                            var win = bgBagedOver(record, 2);
                            win.items.items[0].getForm().loadRecord(record);
                            win.show();
                          },
                        },
                        {
                          xtype: "button",
                          text: "จองเงินงบประมาณ",
                          name: "i_ren_bgType",
                          hidden: Ext.selectRow.json.i_status_overlap == 0 && Ext.selectRow.json.i_type_bg != 8 ? false : true,
                          id: "i_ren_bgTypeID",
                          // disabled: (Ext.selectRow.get('i_is_notor') || Ext.selectRow.get('i_type_bg') == 8  ) ? true : false   ,
                          fieldLabel: "จองเงินงบประมาณแหล่งเงิน",
                          listeners: {
                            beforerender: function () {
                              this.fn = function () {};
                            },
                            afterrender: function () {
                              // if (Ext.selectRow.get("i_is_notor") === 1) {
                              //     this.hide();
                              // } else {
                              //     this.show();
                              // }
                            },
                          },
                          handler: function () {
                            loadBgStore();
                          },
                        },
                        {
                          xtype: "displayfield",
                          fieldLabel: "รหัสเอกสารอ้างอิง",
                          name: "d_doc_ref",
                        },
                        {
                          fieldLabel: "เหตผล",
                          xtype: "textarea",
                          width: 400,
                          name: "c_discription",
                        },
                        {
                          xtype: "textfield",
                          fieldLabel: " เลขที่เอกสารรับสนองราคา ",
                          id: "c_doc_resp_noID",
                          name: "c_doc_resp_no",
                          width: 150,
                          listeners: {
                            render: function (p) {
                              this.hide();
                            },
                          },
                        },
                        {
                          xtype: "hidden",
                          //                                                    fieldLabel: " เลขที่เอกสารใบสั่งซื้อ/สั่งจ้าง/สั่งเช่า",
                          id: "c_po_noID",
                          name: "c_po_no",
                        },
                        {
                          xtype: "displayfield",
                          fieldLabel: "คู่สัญญา/ผู้ขาย ",
                          name: "dc_creditor_idTxt",
                          cls: "my-label-style",
                        },
                        {
                          fieldLabel: "กำหนดส่งภายใน ",
                          xtype: "radiogroup",
                          columns: [50, 150],
                          items: [
                            {
                              xtype: "textfield",
                              name: "i_delivery",
                              id: "i_deliveryID",
                              // value: 1,
                              validator: function (val) {
                                var regex = /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\.[0-9]{1,2})?$/;
                                var strMoney = val.replace(/\,/g, "");
                                if (!regex.test(val)) {
                                  return "กรุณากรอก จำนวนเงินเป็นจำนวนทศนิยม มูลค่ามากกว่า 0.00";
                                } else {
                                  return true;
                                }
                              },
                            },
                            {
                              xtype: "displayfield",
                              value: "วัน ",
                              cls: "my-label-style",
                            },
                          ],
                        },
                        {
                          xtype: "radiogroup",
                          columns: [250],
                          fieldLabel: "การคิดค่าปรับแบบ",
                          id: "type_fineID",
                          style: {
                            "font-weight": "bold",
                          },
                          items: [
                            {
                              name: "i_type_fine",
                              checked: true,
                              inputValue: 0,
                              boxLabel: "ปรับตามความสำเร็จของงานพร้อมกันทั้งหมด",
                            },
                            {
                              name: "i_type_fine",
                              inputValue: 1,
                              boxLabel: "ปรับแยกตามรายงวด",
                            },
                          ],
                        },
                        {
                          fieldLabel: "คิดจากวงเงินในสัญญาจำนวน ",
                          id: "i_is_fineID",
                          xtype: "radiogroup",
                          columns: [150, 150],
                          items: [
                            {
                              xtype: "textfield",
                              id: "i_is_fineTextID", //(i_fine_amt,i_fine_per) in i_is_fineTextID fn(cal)
                              name: "f_fine",
                              width: 430,
                              value: "0.00",
                              validator: function (val) {
                                var regex = /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\.[0-9]{1,2})?$/;
                                if (!regex.test(val)) {
                                  return "กรุณากรอก จำนวนเงินเป็นจำนวนทศนิยม มูลค่ามากกว่า 0.00";
                                } else {
                                  return true;
                                }
                              },
                            },
                            {
                              xtype: "displayfield",
                              id: "fpBt",
                              value: "(บาท)/วัน",
                              cls: "my-label-style",
                            },
                          ],
                        },
                        {
                          xtype: "checkbox",
                          id: "i_joint_ventureID",
                          name: "i_is_join_venture",
                          height: 20,
                          readOnly: true,
                          fieldLabel: "กิจการค้าร่วม ",
                          // value :  Ext.selectRow.data.i_is_join_venture,
                          boxLabel: "มีผู้ชายผู้รับจ้างในสัญญามากกว่า 1 ",
                          inputValue: "1",
                          listeners: {
                            check: function (checkbox, checked) {},
                            afterrender: function () {},
                          },
                        },
                        //>>>>>>>>>>>>>>>>>>>>>>>>
                        {
                          bodyStyle: "padding-left:0px;",
                          items: {
                            xtype: "fieldset",
                            id: "fieldsetID",
                            title: "ข้อมูลหลักประกันสัญญา ",
                            autoHeight: true,
                            // defaultType: 'radio', // each item will be a radio button
                            items: [
                              {
                                xtype: "checkbox",
                                id: "i_is_bank_warranty0ID",
                                name: "i_is_bank_warranty0",
                                height: 20,
                                boxLabel: "ไม่มีการค้ำประกัน ",
                                inputValue: "1",
                                checked: true,
                                listeners: {
                                  check: function (checkbox, checked) {
                                    if (checked) {
                                      Ext.getCmp("i_warranty_typeID").hide();
                                      Ext.getCmp("c_books_receiptID").hide();
                                      Ext.getCmp("c_receipt_noID").hide();
                                      Ext.getCmp("d_book_dateID").hide();
                                      Ext.getCmp("c_commentID").hide();
                                      Ext.getCmp("i_warranty_type1ID").hide();
                                      Ext.getCmp("c_doc_noID").hide();
                                      Ext.getCmp("d_doc_date1ID").hide();
                                      Ext.getCmp("c_comment1ID").hide();
                                      Ext.getCmp("d_expire_warrantyID").hide();
                                      Ext.getCmp("frmPopBankID").hide();

                                      Ext.getCmp("i_is_bank_warranty1ID").setValue(null);
                                      Ext.getCmp("i_is_bank_warrantyID").setValue(null);
                                      Ext.getCmp("i_is_cashiercheque_warrantyID").setValue(null);
                                    } else {
                                      Ext.getCmp("i_warranty_typeID").show();
                                      Ext.getCmp("c_books_receiptID").show();
                                      Ext.getCmp("c_receipt_noID").show();
                                      Ext.getCmp("d_book_dateID").show();
                                      Ext.getCmp("c_commentID").show();
                                    }
                                  },
                                },
                              },
                              {
                                xtype: "checkbox",
                                id: "i_is_bank_warrantyID",
                                name: "i_is_bank_warranty",
                                height: 20,
                                boxLabel: "เงินสด ",
                                inputValue: "1",
                                listeners: {
                                  check: function (checkbox, checked) {
                                    if (checked) {
                                      Ext.getCmp("i_warranty_typeID").show();
                                      Ext.getCmp("c_books_receiptID").show();
                                      Ext.getCmp("c_receipt_noID").show();
                                      Ext.getCmp("d_book_dateID").show();
                                      Ext.getCmp("c_commentID").show();
                                      // Ext.getCmp("i_is_bank_warranty1ID").setValue(null);
                                      Ext.getCmp("i_is_bank_warranty0ID").setValue(null);
                                      /* console.log(Ext.getCmp('i_is_bank_warrantyID'));
                                                                             console.log(Ext.getCmp('i_is_bank_warranty1ID')); */
                                    } else {
                                      Ext.getCmp("i_warranty_typeID").hide();
                                      Ext.getCmp("c_books_receiptID").hide();
                                      Ext.getCmp("c_receipt_noID").hide();
                                      Ext.getCmp("d_book_dateID").hide();
                                      Ext.getCmp("c_commentID").hide();
                                    }
                                  },
                                },
                              },
                              {
                                fieldLabel: "ใบเสร็จเล่มที่",
                                id: "c_books_receiptID",
                                name: "c_books_receipt",
                                xtype: "textfield",
                                hidden: true,
                                width: 200,
                                listeners: {
                                  render: function (p) {
                                    // this.hide();
                                  },
                                },
                              },
                              {
                                fieldLabel: "ใบเสร็จเลขที่",
                                id: "c_receipt_noID",
                                name: "c_receipt_no",
                                xtype: "textfield",
                                hidden: true,
                                width: 200,
                                listeners: {
                                  render: function (p) {
                                    // this.hide();
                                  },
                                }, //d_doc_date_M
                              },
                              {
                                fieldLabel: "วันที่รับเงิน ",
                                id: "d_book_dateID",
                                name: "d_book_date",
                                hidden: true,
                                xtype: "datefield",
                                width: 180,
                                listeners: {
                                  render: function (p) {
                                    // this.hide();
                                  },
                                }, //d_doc_date_M
                              },
                              {
                                fieldLabel: "วงเงินค้ำประกัน ",
                                layout: "column",
                                hidden: true,
                                id: "i_warranty_typeID",
                                items: [
                                  {
                                    fieldLabel: "วงเงินในสัญญา ",
                                    id: "f_warranty_amtID",
                                    name: "f_warranty_amt",
                                    xtype: "textfield",
                                    style: "color:blue; text-align: right;",
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
                                  // {
                                  //   xtype: "numberfield",
                                  //   id: "f_warranty_amtID",
                                  //   width: 150,
                                  //   name: "f_warranty_amt",
                                  //   value: "0.00",
                                  //   validator: function (val) {
                                  //     var regex =
                                  //       /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\.[0-9]{1,2})?$/;
                                  //     var strMoney = val.replace(
                                  //       ",",
                                  //       ""
                                  //     );
                                  //     if (!regex.test(val)) {
                                  //       return "กรุณากรอก จำนวนเงินเป็นจำนวนทศนิยม มูลค่ามากกว่า 0.00";
                                  //       return true;
                                  //     } else {
                                  //       return true;
                                  //     }
                                  //   },
                                  // },
                                  {
                                    xtype: "displayfield",
                                    id: "fpBt31",
                                    value: "บาท ",
                                    cls: "my-label-style",
                                  },
                                ],
                                listeners: {
                                  change: function (cb, rec, ind) {
                                    // this.fnValue(rec.inputValue);
                                  },
                                  afterrender: function (obj, eOpts) {
                                    // this.hide();
                                    // this.fnValue = function (id) {
                                    //   if (id == "2") {
                                    //     Ext.getCmp("fpPt3").hide();
                                    //     Ext.getCmp("fpBt3").show();
                                    //   } else {
                                    //     Ext.getCmp("fpPt3").show();
                                    //     Ext.getCmp("fpBt3").hide();
                                    //   }
                                    // };
                                  },
                                },
                              },
                              {
                                fieldLabel: "หมายเหตุ",
                                id: "c_commentID",
                                hidden: true,
                                name: "c_remark",
                                xtype: "textarea",
                                height: 60,
                                width: 430,
                                listeners: {
                                  render: function (p) {
                                    // this.hide();
                                  },
                                },

                                /*product*/
                              },
                              {
                                xtype: "checkbox",
                                id: "i_is_cashiercheque_warrantyID",
                                name: "i_is_cashiercheque_warranty",
                                height: 20,
                                boxLabel: "แคชเชียร์เช็ค ",
                                inputValue: "1",
                                listeners: {
                                  check: function (checkbox, checked) {
                                    if (checked) {
                                      Ext.getCmp("i_cashiercheque_typeID").show();
                                      Ext.getCmp("c_books_cashierchequeID").show();
                                      Ext.getCmp("c_receipt_cashierchequeID").show();
                                      Ext.getCmp("d_cashiercheque_dateID").show();
                                      Ext.getCmp("c_commentID2").show();
                                      Ext.getCmp("i_is_bank_warranty0ID").setValue(null);
                                    } else {
                                      Ext.getCmp("i_cashiercheque_typeID").hide();
                                      Ext.getCmp("c_books_cashierchequeID").hide();
                                      Ext.getCmp("c_receipt_cashierchequeID").hide();
                                      Ext.getCmp("d_cashiercheque_dateID").hide();
                                      Ext.getCmp("c_commentID2").hide();
                                    }
                                  },
                                },
                              },
                              {
                                fieldLabel: "ใบเสร็จลำดับที่",
                                id: "c_books_cashierchequeID",
                                name: "c_books_cashiercheque",
                                xtype: "textfield",
                                hidden: true,
                                width: 200,
                                listeners: {
                                  render: function (p) {
                                    // this.hide();
                                  },
                                },
                              },
                              {
                                fieldLabel: "ใบเสร็จเลขที่",
                                id: "c_receipt_cashierchequeID",
                                name: "c_receipt_cashiercheque",
                                xtype: "textfield",
                                hidden: true,
                                width: 200,
                                listeners: {
                                  render: function (p) {
                                    // this.hide();
                                  },
                                }, //d_doc_date_M
                              },
                              {
                                fieldLabel: "วันที่รับเงิน ",
                                id: "d_cashiercheque_dateID",
                                name: "d_cashiercheque_date",
                                hidden: true,
                                xtype: "datefield",
                                width: 180,
                                listeners: {
                                  render: function (p) {
                                    // this.hide();
                                  },
                                }, //d_doc_date_M
                              },
                              {
                                fieldLabel: "วงเงินค้ำประกัน ",
                                layout: "column",
                                hidden: true,
                                id: "i_cashiercheque_typeID",
                                items: [
                                  {
                                    fieldLabel: "วงเงินในสัญญา ",
                                    id: "f_warranty_amtID2",
                                    name: "f_cashiercheque_warranty_amt2",
                                    xtype: "textfield",
                                    style: "color:blue; text-align: right;",
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
                                  {
                                    xtype: "displayfield",
                                    id: "fpBt3",
                                    value: "บาท ",
                                    cls: "my-label-style",
                                  },
                                ],
                                listeners: {
                                  change: function (cb, rec, ind) {
                                    // this.fnValue(rec.inputValue);
                                  },
                                  afterrender: function (obj, eOpts) {
                                    // this.hide();
                                    // this.fnValue = function (id) {
                                    //   if (id == "2") {
                                    //     Ext.getCmp("fpPt3").hide();
                                    //     Ext.getCmp("fpBt3").show();
                                    //   } else {
                                    //     Ext.getCmp("fpPt3").show();
                                    //     Ext.getCmp("fpBt3").hide();
                                    //   }
                                    // };
                                  },
                                },
                              },
                              {
                                fieldLabel: "หมายเหตุ",
                                id: "c_commentID2",
                                hidden: true,
                                name: "c_comment2",
                                xtype: "textarea",
                                height: 60,
                                width: 430,
                                listeners: {
                                  render: function (p) {
                                    // this.hide();
                                  },
                                },
                              },
                              {
                                xtype: "checkbox",
                                id: "i_is_bank_warranty1ID",
                                name: "i_is_bank_warranty1",
                                height: 20,
                                boxLabel: "หนังสือค้ำประกัน",
                                inputValue: "1",
                                listeners: {
                                  check: function (checkbox, checked) {
                                    if (checked) {
                                      Ext.getCmp("i_warranty_type1ID").show();
                                      Ext.getCmp("c_doc_noID").show();
                                      Ext.getCmp("d_doc_date1ID").show();
                                      Ext.getCmp("c_comment1ID").show();
                                      Ext.getCmp("d_expire_warrantyID").show();
                                      Ext.getCmp("frmPopBankID").show();
                                      Ext.getCmp("i_is_bank_warranty0ID").setValue(null);
                                    } else {
                                      Ext.getCmp("i_warranty_type1ID").hide();
                                      Ext.getCmp("c_doc_noID").hide();
                                      Ext.getCmp("d_doc_date1ID").hide();
                                      Ext.getCmp("c_comment1ID").hide();
                                      Ext.getCmp("d_expire_warrantyID").hide();
                                      Ext.getCmp("frmPopBankID").hide();
                                    }
                                  },
                                },
                              },
                              {
                                fieldLabel: "เลขที่หนังสือค้ำประกัน ",
                                id: "c_doc_noID",
                                name: "c_doc_no",
                                xtype: "textfield",
                                hidden: true,
                                width: 200,
                                listeners: {
                                  render: function (p) {
                                    // this.hide();
                                  },
                                },
                              },
                              {
                                fieldLabel: "วันที่หนังสือค้ำประกัน  ",
                                id: "d_doc_date1ID",
                                name: "d_doc_date1",
                                xtype: "datefield",
                                hidden: true,
                                width: 180,
                                listeners: {
                                  render: function (p) {
                                    // this.hide();
                                  },
                                }, //d_doc_date_M
                              },
                              {
                                layout: "column",
                                id: "frmPopBankID",
                                hidden: true,
                                border: false,
                                items: [
                                  {
                                    columnWidth: 1,
                                    layout: "form",
                                    border: false,
                                    items: [Ext.PopBank.mini],
                                  },
                                ],
                                listeners: {
                                  render: function (p) {
                                    // this.hide();
                                  },
                                },
                              },
                              {
                                fieldLabel: "วงเงินค้ำประกัน",
                                layout: "column",
                                hidden: true,
                                id: "i_warranty_type1ID",
                                items: [
                                  {
                                    fieldLabel: "วงเงินในสัญญา ",
                                    id: "f_warranty_amt1ID",
                                    name: "f_warranty_amt1",
                                    xtype: "textfield",
                                    style: "color:blue; text-align: right;",
                                    listeners: {
                                      blur: function () {
                                        var f_total = parseFloat(this.getValue().replace(/,/g, "") / 1);
                                        this.setValue(Ext.floatRenderer(f_total));
                                      },
                                    },
                                  },
                                  {
                                    xtype: "displayfield",
                                    id: "fpBt32",
                                    value: "บาท ",
                                    cls: "my-label-style",
                                  },
                                ],
                                listeners: {
                                  change: function (cb, rec, ind) {
                                    // this.fnValue(rec.inputValue);
                                  },
                                  afterrender: function (obj, eOpts) {
                                    // this.hide();
                                    // this.fnValue = function (id) {
                                    //   if (id == "2") {
                                    //     Ext.getCmp("fpPt3").hide();
                                    //     Ext.getCmp("fpBt3").show();
                                    //   } else {
                                    //     Ext.getCmp("fpPt3").show();
                                    //     Ext.getCmp("fpBt3").hide();
                                    //   }
                                    // };
                                  },
                                },
                              },
                              {
                                fieldLabel: "วันหมดอายุหนังสือค้ำประกัน  ",
                                id: "d_expire_warrantyID",
                                name: "d_expire_warranty",
                                xtype: "datefield",
                                hidden: true,
                                width: 180,
                                listeners: {
                                  render: function (p) {
                                    // this.hide();
                                  },
                                }, //d_doc_date_M
                              },
                              {
                                fieldLabel: "หมายเหตุ",
                                id: "c_comment1ID",
                                name: "c_comment1",
                                xtype: "textarea",
                                hidden: true,
                                height: 60,
                                width: 430,
                                listeners: {
                                  render: function (p) {
                                    // this.hide();
                                  },
                                },
                              },
                            ],
                          },
                        },
                        //>>>>>>>>>>>>>>>>>>>>>>>>

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
                              inputValue: "UP_SP_TOR_CONTRACT_NEXT",
                              boxLabel: "อัพเดทรายการ",
                            },
                          ],
                        },
                      ],
                      buttonAlign: "left",
                      buttons: [
                        {
                          text: "บันทึกรายการ",
                          id: "buSaveSubID",
                          iconCls: "icon-save",
                          //disabled: true,
                          listeners: {
                            afterrender: function () {},
                          },
                          handler: function () {
                            var formSubmit = function () {
                              form.submit({
                                waitMsg: "Saving Data...",
                                success: function (form, action) {
                                  Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                    Ext.getCmp("tabpanel1").getStore().reload();
                                    Ext.selectRow = null;
                                    Ext.getCmp(Ext.poFormID).destroy();
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

                            var form = Ext.getCmp("tap_main").getForm();
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
                            Ext.getCmp(Ext.poFormID).hide();
                            Ext.getCmp(Ext.poFormID).destroy();
                          },
                        },
                      ],
                    },
                    {
                      columnWidth: 0.5,
                      layout: "form",
                      autoScroll: true, // เพิ่ม Scrollbar ทั้งแนวนอนและแนวตั้ง
                      viewConfig: {
                        enableTextSelection: true, // (ถ้าต้องการให้คัดลอกข้อความได้)
                      },
                      items: [
                        {
                          labelStyle: "padding: 0px 0px; 0px 0px;",
                          fieldLabel: "วงเงินในสัญญา",
                          xtype: "displayfield",
                          id: "DISPLAY_creditor_f_total_amt_dtl_period",
                          name: "f_total_amt",
                        },
                        {
                          xtype: "grid",
                          id: "gridSub3ID",
                          border: false,
                          stripeRows: true,
                          loadMask: true,
                          height: 400,
                          store: Ext.store3,
                          tbar: [
                            {
                              //                                                            xtype: "button",
                              //                                                            iconCls: "icon-add",
                              //                                                            text: "เพิ่มงวดงานในสัญญา",
                              //                                                            handler: function () {
                              //                                                                Ext.SP_TOR_HDR_PERIOD_ID = null;
                              //                                                                Ext.selectRow_PeridHdr = null;
                              //                                                                Ext.storeSUMcontract.setBaseParam("sp_tor_contract_id", Ext.selectRow.get('sp_tor_contract_id'));
                              //                                                                Ext.storeSUMcontract.load({
                              //                                                                    callback: function (record, operation, success) {
                              //                                                                        if (success) {
                              //                                                                            var rec = record[0];
                              //                                                                            // console.log(rec.get('f_total_amt'));
                              //                                                                            win_hdr_period("ADD", rec);
                              //                                                                            Ext.buttonDtl = "ADD";
                              //                                                                        }
                              //                                                                    }
                              //                                                                });
                              //                                                            },
                              //                                                        }, {
                              xtype: "button",
                              iconCls: "icon-add",
                              id: "period-addAllID",
                              text: "เพิ่มงวดและของ",
                              handler: function () {
                                Ext.getCmp("period-addAllID").setDisabled(true);
                                Ext.SP_TOR_HDR_PERIOD_ID = null;
                                Ext.selectRow_PeridHdr = null;
                                Ext.storeSUMcontract.setBaseParam("sp_tor_contract_id", Ext.selectRow.get("sp_tor_contract_id"));
                                Ext.storeSUMcontract.load({
                                  callback: function (record, operation, success) {
                                    if (success) {
                                      var rec = record[0];
                                      // console.log(rec.get('f_total_amt'));
                                      win_hdr_periodAll("ADD", rec, "ADD");
                                      Ext.buttonDtl = "ADD";
                                    }
                                  },
                                });
                              },
                            },
                          ],
                          columns: colPeriod,
                          listeners: {
                            beforerender: function () {
                              function controller(rec, event) {
                                if (event == "view") {
                                  Ext.SP_TOR_HDR_PERIOD_ID = rec.get("id");
                                  Ext.i_period = rec.get("i_period");
                                  Ext.store4.setBaseParam("tor_id", Ext.SP_TOR_HDR_PERIOD_ID);
                                  Ext.store4.setBaseParam("sp_tor_hdr_period_id", rec.get("id"));
                                  Ext.store4.setBaseParam("i_period", rec.get("i_period"));
                                  Ext.store4.load({
                                    callback: function (record, operation, success) {
                                      if (success) {
                                        Ext.i_period = rec.get("i_period");
                                        Ext.getCmp("winChequeID").setActiveTab(2);
                                        Ext.getCmp("tabpanelMain3ID").setTitle("ราการสินค้า/ของ วันส่งมอบ " + rec.get("d_period_date") + "  งวดที่ " + rec.get("i_period"));
                                        //SET BBTOTAL
                                        var i = this.data.length - 1;
                                        if (i >= 0) {
                                          Ext.getCmp("bbf_total_price4ID").setValue(record[i].get("f_total_amt")); // bbf_total_price4ID bbf_qty4ID
                                          Ext.getCmp("bbf_qty4ID").setValue(record[i].get("i_qty_amt"));
                                        } else {
                                          Ext.getCmp("bbf_total_price4ID").setValue("0"); // bbf_total_price4ID bbf_qty4ID
                                          Ext.getCmp("bbf_qty4ID").setValue("0.00");
                                        }
                                      }
                                    },
                                  });
                                }
                              }
                              this.thisCick = function (grid, rowIndex, columnIndex, e) {
                                var record = grid.getStore().getAt(rowIndex);
                                if (record.get("no") > 9996) return "";
                                if (columnIndex === grid.getColumnModel().getIndexById("hdrPeriod")) {
                                  controller(record, "view"); //on
                                  //                                                                    Ext.getCmp("DISPLAY_c_name_dtl_period").setValue(record.data.c_doc_ref_contract);
                                  Ext.getCmp("DISPLAY_creditor_name_dtl_period").setValue(record.data.dc_creditor_name);
                                  Ext.getCmp("DISPLAY_creditor_d_doc_date_dtl_period").setValue(record.data.d_period_date);
                                  Ext.getCmp("DISPLAY_creditor_f_total_amt_dtl_period").setValue(record.data.f_total_amt);
                                  Ext.getCmp("winChequeID").unhideTabStripItem(2);
                                }
                                var record = grid.getStore().getAt(rowIndex);
                                Ext.SelectStore = Ext.store3.getAt(rowIndex);
                                if (columnIndex === grid.getColumnModel().getIndexById("i_peridEdit")) {
                                  if (record.data.sp_check_period != null) {
                                    Ext.Msg.alert("แจ้งเตือน", "คุณตรวจรับไปแล้วไม่สามารถแก้ไขได้");
                                  } else {
                                    Ext.selectRow_PeridHdr = record;
                                    Ext.SP_TOR_HDR_PERIOD_ID = record.data.id;
                                    win_hdr_period("EDIT", record);
                                  }
                                } else if (columnIndex === grid.getColumnModel().getIndexById("i_peridEditAll")) {
                                  if (record.data.sp_check_period != null) {
                                    Ext.Msg.alert("แจ้งเตือน", "คุณตรวจรับไปแล้วไม่สามารถแก้ไขได้");
                                  } else {
                                    Ext.selectRow_PeridHdr = record; 
                                    Ext.SP_TOR_HDR_PERIOD_ID = record.get("id");
                                    Ext.i_period = record.get("i_period");
                                    Ext.store4.setBaseParam("tor_id", Ext.SP_TOR_HDR_PERIOD_ID);
                                    Ext.store4.setBaseParam("sp_tor_hdr_period_id", record.get("id"));
                                    Ext.store4.setBaseParam("i_period", record.get("i_period"));
                                    Ext.store4.reload({
                                      callback: function (rec, operation, success) {
                                        if (success) {
//                                            console.log(rec[0]);
//                                            return false;
                                          record.set("period_c_name", rec[0].get("c_name"));
                                          record.set("i_qty", rec[0].get("i_qty"));
                                          record.set("i_qty_amt", rec[0].get("i_qty_amt"));
                                          record.set("i_product_type", rec[0].get("i_product_type"));
                                          record.set("i_is_inv", rec[0].get("i_is_inv"));
                                          record.set("i_hire_type", rec[0].get("i_hire_type"));
                                          record.set("dc_bg_budget_type_id", rec[0].get("dc_bg_budget_type_id"));
                                          record.set("dc_unit_type_id", rec[0].get("dc_unit_type_id"));
                                          record.set("f_net_total_price", record.get("f_net_total_price"));
                                          record.set("f_net_unit_price", rec[0].get("f_net_unit_price"));
                                          record.set("f_total_amt", rec[0].get("f_total_amt"));
                                          //                                                                                    console.log(rec[0].data.c_name);
                                          //                                                                                    console.log(record);
                                          //                                                                                    return false;
                                          win_hdr_periodAll("UPDATE", record, "UPDATE");
                                          Ext.buttonDtl = "UPDATE";
                                        }
                                      },
                                    });
                                  }
                                } else if (columnIndex === grid.getColumnModel().getIndexById("i_peridDel")) {
                                  if (record.data.sp_check_period != null) {
                                    Ext.Msg.alert("แจ้งเตือน", "คุณตรวจรับไปแล้วไม่สามารถแก้ไขได้");
                                  } else {
                                    Ext.SP_TOR_HDR_PERIOD_ID = record.data.id;
                                    delete_htl_period();
                                  }
                                } else if (columnIndex === grid.getColumnModel().getIndexById("i_peridEditShow")) {
                                  Ext.selectRow_PeridHdr = record;
                                  Ext.SP_TOR_HDR_PERIOD_ID = record.data.id;
                                  //                                                                    win_hdr_periodAll("SHOW", record, 'SHOW');
                                }
                              };
                            },
                            afterrender: function () {
                              Ext.getCmp("gridSub3ID").on("cellclick", this.thisCick, this);
                            },
                          },
                          viewConfig: {
                            forceFit: true,
                            emptyText: "ไม่มีข้อมูล..",
                            deferEmptyText: false,
                            getRowClass: function (record) {
                              if (record.data.dtl_period_count > 0) {
                                // return "td-last ";
                                return "td-succeed ";

                                // return 'x-grid3-row-collapsed';
                              }
                            },
                          },
                        },
                      ],
                      //End Items
                    },
                  ],
                },
              ],
            }),
          ],
        },
      ],
    });
  };
  var MenuButton = function () {
    // show Menu Edit Grid
    var editm = Ext.menuEditGrid;
    var menu = new Ext.menu.Menu({
      id: "mainMenu",
      border: false,
      style: {
        overflow: "visible",
      },
      /*
             items: [{
             text: "ประเภทข้อมูล",
             icon: "../images/icons/application_form_magnify.png",
             menu: {
             items: [
             '<b class="menu-title">  เลือกประเภทข้อมูล </b>',
             {
             text: " เลือกประเภทข้อมูลบันทึกจากระบบเท่านั้น",
             checked: false,
             id: "keyDatat1",
             uri: 1,
             group: "theme",
             checkHandler: onLocationCheck
             },
             {
             text: " เลือกประเภทนำเข้าจากการ import Excel เท่านั้น",
             checked: false,
             uri: 0,
             id: "keyDatat2",
             group: "theme",
             checkHandler: onLocationCheck
             },
             {
             text: " เลือกประเภทข้อมูลที่ทั้งหมด",
             checked: true,
             id: "keyDatat3",
             uri: null,
             group: "theme",
             checkHandler: onLocationCheck
             }
             ]
             }
             }]*/
    });
    var tb = new Ext.Toolbar({
      text: " รายการเมนู ",
      border: false,
      icon: "../images/icons/text_list_bullets.png",
      iconCls: "menu",
      // <-- icon
      menu: menu,
      // assign menu by instance
    });
    //    รายการเมนู
    tb.add({
      text: " รายการเมนู ",
      icon: "../images/icons/text_list_bullets.png",
      iconCls: "bmenu",
      // <-- icon
      border: false,
      bodyStyle: "padding:0px 0px 0px 0px !important;",
      menu: menu,
      // assign menu by instance
    });
    menu.addSeparator();
    //  เพิ่มข้อมูล
    menu.add({ text: "ค้นหาข้อมูล", icon: "../images/icons/book_magnify.png" }).on(
      "click",
      (click = function () {
        //             Ext.loadStore("add", false); // app,data.load
      })
    );
    // แก้ไขข้อมูล
    menu.add({ text: "จัดการข้อมูล View/Copy/Edit/Delete", icon: "../images/icons/application_edit.png" }).on(
      "click",
      (click = function () {
        Ext.loadStore("edit", true);
      })
    );

    tb.doLayout();
    return tb;
  }; //MenuButton
  Ext.gridMainfn = function (editAbled) {
    if (!Ext.isEmpty(Ext.getCmp("tabpanel1"))) Ext.getCmp("contenterCenter").remove(Ext.getCmp("tabpanel1"), true) || {};

    var gridMains = new gridMain();
    Ext.getCmp("contenterCenter").add(gridMains);
    Ext.getCmp("contenterCenter").setActiveTab(gridMains);
    Ext.getCmp("tabpanel1").on("beforeedit", function () {
      return editAbled;
    });
    if (editAbled) Ext.getCmp("buSaveGridID").show();
    else Ext.getCmp("buSaveGridID").hide();
    return gridMains;
  };
  /////////////////// searchGrid Extend
  Ext.extend(
    (searchGrid = function () {
      var mnController = "reg/controller/mnPoWorkingHdrBegin.php";
      //classOverride
      searchGrid.superclass.constructor.call(this, {
        initComponent: function () {
          searchGrid.superclass.initComponent.call(this);
          this.fn(this);
        },
        listeners: {
          afterrender: function (obj, eOpts) {},
        },
        fn: function () {},
        id: "frm-grid-searchID",
        //                    frame: true,
        bodyStyle: "padding:1px",
        autoHeight: true,
        border: false,
        width: 600,
        url: mnController,
        labelWidth: 180,
        defaults: {
          anchor: "0",
        },
        items: [
          {
            xtype: "hidden",
            name: "mode",
            value: "saveDataGrid",
          },
          {
            xtype: "hidden",
            name: "gridMain",
            id: "gridMainID",
          },
          menu ? MenuButton() : [],
        ],
        buttonAlign: "left",
        buttons: [
          {
            text: "บันทึกรายการ",
            id: "buSaveGridID",
            iconCls: "icon-save",
            listeners: {
              afterrender: function () {
                this.hide();
              },
            },
            handler: function () {
              var formSubmit = function () {
                form.submit({
                  waitMsg: "Saving Data...",
                  success: function (form, action) {
                    Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                      Ext.getCmp("tabpanel1").getStore().reload();
                      Ext.getCmp("winChequeID").hide();
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
              }; //func submit
              var saveDtl = function (mode) {
                let msg = "";
                let jsonArr = [];
                let sto = Ext.getCmp("tabpanel1").store.data.items;
                sto.forEach(function (v) {
                  //d_audit_date d_approve_date d_doc_date d_inv_date
                  jsonArr.push({
                    po_working_dtl_id: v.data.id,
                    d_audit_date: Ext.isEmpty(v.data.d_audit_date) ? null : v.data.d_audit_date.add("Y", -543).dateFormat("Y-m-d"),
                    d_approve_date: v.data.d_approve_date.add("Y", -543).dateFormat("Y-m-d"),
                    d_doc_date: v.data.d_doc_date.add("Y", -543).dateFormat("Y-m-d"),
                    d_inv_date: v.data.d_inv_date.add("Y", -543).dateFormat("Y-m-d"),
                  });
                });
                Ext.getCmp("gridMainID").setValue(JSON.stringify(jsonArr));
                formSubmit(form); //submit grid form
              }; // saveDtl
              var form = Ext.getCmp("frm-grid-searchID").getForm();
              if (form.isValid()) {
                Ext.MessageBox.show({
                  title: "Icon Support",
                  msg: "คุณต้องการที่จะบันทึกข้อมูลใน Data Grid ใช่ใหม ?",
                  buttons: Ext.MessageBox.OKCANCEL,
                  icon: Ext.MessageBox.WARNING,
                  fn: function (btn) {
                    if (btn === "ok") {
                      //TODO @ setGridDirty to idCmp
                      saveDtl();
                    } else {
                      return;
                    }
                  },
                });
              }
            },
            //haddler
          },
          {
            xtype: "tbfill",
          },
          {
            text: "ค้นหา",
            id: "buSearchID",
            iconCls: "icon-magnifier",
            handler: function () {
              search();
            },
          },
          {
            text: "เริ่มใหม",
            iconCls: "icon-reset",
            handler: function () {
              Ext.getCmp("frm-grid-searchID").getForm().reset();
            },
          },
        ],
      });
    }),
    Ext.FormPanel,
    {}
  );
  function SearchFrm() {
    return new Ext.Window({
      //                     collapsible: true,
      //                     maximizable: true,
      title: "ค้นหารายการ",
      width: 700,
      id: "winSearchFrm",
      height: 190,
      layout: "fit",
      plain: true,
      border: false,
      resizable: false,
      draggable: false,
      closable: false,
      buttonAlign: "center",
      items: [
        {
          layout: "column",
          border: false,
          defauls: { background: "#eee" },
          items: [
            {
              columnWidth: 0.4,
              layout: "form",
              border: false,
              items: [
                {
                  xtype: "textfield",
                  //       height: 18,
                  fieldLabel: "เลขที่สัญญา",
                  id: "sc_codeID", // sd_tor_dateID sc_codeID sc_nameID searchEnabledID
                  name: "c_code",
                  //                                    value: 'พวช.ซ.02005/2566',
                },
                {
                  xtype: "textfield",
                  fieldLabel: "เลข PR",
                  id: "tor_codeID",
                  name: "tor_code",
                },
              ],
            },
            {
              columnWidth: 0.6,
              layout: "form",
              border: false,
              items: [
                {
                  xtype: "textfield",
                  fieldLabel: "ชื่อคู่สัญญา2",
                  id: "sc_nameID",
                  name: "c_name",
                },
                {
                  xtype: "radiogroup",
                  columns: [350],
                  fieldLabel: "ประเภทการดำเนินงาน",
                  id: "i_pro_typeID",
                  name: "i_pro_type",
                  items: [
                    {
                      checked: true,
                      inputValue: 0,
                      name: "i_pro_type",
                      boxLabel: "ทั้งหมด",
                    },
                    {
                      inputValue: 1,
                      name: "i_pro_type",
                      boxLabel: "ซื้อ",
                    },
                    {
                      inputValue: 2,
                      name: "i_pro_type",
                      boxLabel: "จ้าง",
                    },
                    {
                      inputValue: 3,
                      name: "i_pro_type",
                      boxLabel: "เช่า",
                    },
                  ], //radiogroup
                  listeners: {
                    change: function () {},
                  },
                },
              ],
            },
          ],
          buttonAlign: "left",
          buttons: [
            {
              text: "ค้นหา",
              handler: function () {
                Ext.storeDtl.setBaseParam("mode", "LIST");
                Ext.storeDtl.setBaseParam("act", "SEARCH");
                Ext.storeDtl.setBaseParam("i_pro_type", Ext.getCmp("i_pro_typeID").getValue().inputValue);
                Ext.storeDtl.setBaseParam("tor_code", Ext.getCmp("tor_codeID").getValue());
                Ext.storeDtl.setBaseParam("c_code", Ext.getCmp("sc_codeID").getValue());
                Ext.storeDtl.setBaseParam("c_name", Ext.getCmp("sc_nameID").getValue());
                Ext.getCmp("winSearchFrm").destroy();
                Ext.storeDtl.load();
              },
            },
            {
              text: "ปิด",
              handler: function () {
                Ext.getCmp("winSearchFrm").hide();
              },
            },
          ],
        },
      ],
    });
  }
  /////////////////// gridMain
  Ext.extend(
    (gridMain = function () {
      var colmnn = [
        new Ext.grid.RowNumberer({
          header: "ที่",
          dataIndex: "no",
          id: "idID",
          width: 30,
          renderer: function (value, metaData, record, row, col, store, gridView) {
            metaData.attr = "style='cursor:pointer; text-align:center;';";
            return record.get("no");
          },
        }),
        {
          header: "ลำดับ",
          sortable: false,
          align: "left",
          dataIndex: "id",
          hidden: true, // icon: "../images/icons/application_view_tile.png"
        },

        {
          header: "เลขที่สัญญา",
          sortable: false,
          align: "left",
          dataIndex: "c_doc_ref",
          width: 120,
          renderer: function (val, metaData, record, rowIndex, colIndex, store) {
            // metaData.attr = record.get('i_is_notor') == 1 ? "style='color:blue;font-wieght:bold';" : "";
            return record.get("c_code"); //+ '/' + record.get('d_doc_ref');
          },
        },
        {
          header: "แก้ไขสัญญา",
          sortable: false,
          align: "center",
          dataIndex: "edit_contract",
          id: "edit_contractID",
          width: 80,
          renderer: function (value, metaData, record, row, col, store, gridView) {
            metaData.attr = "style='cursor:pointer; text-align:center;';";
            return '<img src="../images/icons/table_edit.png"); style="cursor:pointer"/>';

            if (record.data.i_contract_status == 1) {
              return '<img src="../images/icons/application_view_tile.png"); style="cursor:pointer"/>';
            } else if (record.data.i_contract_status > 1) {
              return '<img src="../images/icons/application_go.png" style="cursor:pointer"/>';
            }
          },
        },
        {
          header: "ประเภทการใช้เงิน",
          sortable: false,
          align: "left",
          dataIndex: "i_status_overlap",
          width: 120,
          // renderer: function (value, metaData, record, row, col, store, gridView) {
          // },
          renderer: function (val, metaData, record, rowIndex, colIndex, store) {
            // console.log(record.data.i_status_overlap);
            if (record.data.i_status_overlap == 2) {
              return "กันเหลื่อมก่อหนี้แล้ว";
            } else if (record.data.i_status_overlap == 1) {
              return "กันเหลื่อมยังไม่ก่อหนี้";
            } else if (record.data.i_type_bg == 13) {
              return "เงินสะสมส่วนงาน";
            } else {
              return "จองเงิน";
            }
            // metaData.attr = "style='cursor:pointer; text-align:center;';";
            // Ext.i_type_contractTxt = Ext.apply({1: "สัญญาปกติ", 2: "ใบสั่ง", 3: "จะซื้อจะขาย"});
            // return Ext.i_type_contractTxt[val];
          },
        },
        {
          header: "สัญญาแบบ",
          sortable: false,
          align: "left",
          dataIndex: "i_type_contract",
          width: 90,
          renderer: function (val, metaData, record, rowIndex, colIndex, store) {
            Ext.i_type_contractTxt = Ext.apply({ 1: "สัญญาปกติ", 2: "ใบสั่ง", 3: "จะซื้อจะขาย" });
            return Ext.i_type_contractTxt[val];
          },
        },
        {
          header: "สถานะการจอง",
          sortable: false,
          align: "left",
          dataIndex: "c_bg_reserve_money1_id",
          width: 110,
          renderer: function (value, metaData, record, row, col, store, gridView) {
            metaData.attr = "style='cursor:pointer; text-align:center;';";
            if (record.data.i_status_overlap == 1) {
              if (record.data.bg_reserve_overlap_id > 0) {
                return '<img src="../images/icons/accept.png");/>';
                // } else if (record.get("i_type_bg") == 8 ) {
                // return '<img src="../images/icons/book_next.png");/>';
              } else {
                return '<img src="../images/icons/cancel.png"); style="cursor:pointer"/>';
              }
            } else if (record.data.i_status_overlap == 2) {
              return '<img src="../images/icons/book_next.png");/>';
            } else if (record.data.i_type_bg == 13) {
              return '<img src="../images/icons/application_add.png");/>';
            } else {
              if (record.get("c_bg_reserve_money1_id") > 0) {
                return '<img src="../images/icons/accept.png");/>';
              } else if (record.get("i_type_bg") == 8) {
                return '<img src="../images/icons/book_next.png");/>';
              } else {
                return '<img src="../images/icons/cancel.png"); style="cursor:pointer"/>';
              }
            }
          },
        },
        {
          header: "อัพเดทสถานะ",
          sortable: false,
          align: "center",
          dataIndex: "id",
          id: "processDueID",
          width: 130,
          renderer: function (value, metaData, record, row, col, store, gridView) {
            var BtnText, IconImg;
            if (record.data.i_contract_status == 1) {
              BtnText = "&nbspยังไม่ผ่านรายการ";
              IconImg = "../images/icons/application_view_tile.png";
            } else if (record.data.i_contract_status > 1) {
              BtnText = "&nbspผ่านรายการแล้ว";
              IconImg = "../images/icons/application_go.png";
            }
            var style = "font-size:12px;border:1px solid #ccc; width:120px; padding:3px 3px 3px 10px; background: #8FA8F7 url(" + IconImg + ") no-repeat 3px center; cursor: pointer;";
            return '<button style="' + style + '" type="button">' + BtnText + "</button>";
          },
        },
        {
          header: "ชื่อคู่สัญญา",
          sortable: false,
          align: "left",
          dataIndex: "dc_creditor_idTxt",
          width: 250,
        },
        {
          header: "เลขประจำตัวผู้เสียภาษี",
          sortable: false,
          align: "left",
          dataIndex: "c_tax_number_imp",
          width: 120,
        },
        {
          header: "วันที่เริ่มสัญญา",
          sortable: false,
          align: "center",
          dataIndex: "d_doc_date",
          width: 100,
        },
        {
          header: "วันที่สิ้นสุดสัญญา",
          sortable: false,
          align: "center",
          dataIndex: "d_due_date",
          width: 100,
        },
        {
          header: "เรื่อง",
          sortable: false,
          //                        align: "center",
          dataIndex: "c_name",
          width: 150,
        },
        {
          header: "วิธีดำเนินงาน",
          sortable: false,
          align: "center",
          dataIndex: "c_tor_type",
          width: 80,
        },
        {
          header: "ขอดำเนินการ",
          sortable: false,
          align: "center",
          dataIndex: "c_purchase",
          width: 80,
        },
        {
          header: "รหัสเอกสารอ้างอิง",
          sortable: false,
          align: "center",
          dataIndex: "d_doc_ref",
        },
        {
          header: "หน่วยงานเจ้าของเรื่อง",
          align: "left",
          dataIndex: "dc_cost_idTxt",
          width: 120,
        },
        {
          header: "ชื่อผู้สร้างรายการ",
          sortable: false,
          align: "center",
          dataIndex: "dc_user_create_id",
          hidden: true,
        },
        {
          header: "หน่วยงานผู้สร้าง",
          sortable: false,
          align: "center",
          dataIndex: "dc_user_create_cost_id",
          hidden: true,
        },
        {
          header: "วันที่สร้างรายการ",
          sortable: false,
          align: "center",
          dataIndex: "d_create",
          hidden: true,
          renderer: function (val, metaData, record, rowIndex, colIndex, store) {
            return shortThaiDate(val);
          },
        },
        {
          header: "ชื่อผู้แก้ไขรายการ",
          sortable: false,
          align: "center",
          dataIndex: "dc_user_update_id",
          width: 120,
        },
        {
          header: "หน่วยงานแก้ไขรายการ",
          sortable: false,
          align: "center",
          dataIndex: "dc_user_update_cost_id",
          width: 120,
        },
        {
          header: "วันที่แก้ไขรายการ",
          sortable: false,
          align: "center",
          dataIndex: "d_update",
          renderer: function (val, metaData, record, rowIndex, colIndex, store) {
            return shortThaiDate(val);
          },
          //                    },
          //                    {
          //                        header: "แก้ไขสถานะสัญญา",
          //                        sortable: false,
          //                        align: "center",
          //                        dataIndex: "id",
          //                        id: "editContractID",
          //                        width: 120,
          //                        renderer: function (value, metaData, record, row, col, store, gridView) {
          //                            metaData.attr = "style='cursor:pointer; text-align:center;';";
          //                            //...
          //
          //                            return '<img src="../images/icons/page_edit.png"); style="cursor:pointer"/>';
          //
          //                        }
        },
      ];

      gridMain.superclass.constructor.call(this, {
        region: "center",
        title: Ext.title + "",
        xtype: "grid",
        id: "tabpanel1",
        border: true,
        stripeRows: true,
        loadMask: true,
        //------------------
        tbar: [
          {
            xtype: "buttongroup",
            //   title: "ระบุเงื่อนไขในการค้นหาข้อมูล",
            columns: 1,
            defaults: { scale: "small", style: "float: right" },
            items: [
              {
                xtype: "buttongroup",
                frame: false,
                items: [
                  { xtype: "label", text: "ค้นหาโดย : " },
                  { xtype: "tbspacer", width: 4 },
                  {
                    id: "filter",
                    xtype: "combo",
                    width: 150,
                    mode: "local",
                    store: new Ext.data.SimpleStore({
                      fields: ["value", "text"],
                      data: [
                        //   ["sql", "SQL"],
                        //   ["tor_id", "hdr_id"],
                        //   ["sp_tor_contract_id", "sp_tor_contract_id"],
                        ["c_code_po", "เลขสัญญา"],
                        ["c_code", "เลขที่ PR"],
                        ["dc_creditor_name", "ผู้ขายผุ้รับจ้าง"],
                        ["dc_creditor_tax_numbe", "เลชประจำตัวผู้เสียภาษีผู้ขายผุ้รับจ้าง"],
                      ],
                    }),
                    value: "c_code_po",
                    valueField: "value",
                    displayField: "text",
                    allowBlank: false,
                    editable: false,
                    triggerAction: "all",
                    typeAhead: false,
                  },
                  { xtype: "tbspacer", width: 4 },
                  {
                    xtype: "textfield",
                    id: "value-box",
                    width: 200,
                    fieldLabel: "fieldLabel",
                    emptyText: "คำที่ต้องการค้นหา",
                  },
                ],
              },
              {
                xtype: "buttongroup",
                frame: false,
                items: [
                  // { xtype: "label", text: "แหล่งเงิน : " },
                  { xtype: "tbspacer", width: 4 },
                ],
              },
              {
                xtype: "buttongroup",
                frame: false,
                items: [
                  // { xtype: "label", text: "หน่วยงาน : " },
                  // { xtype: "tbspacer", width: 4 },
                  // { xtype: "tbspacer", width: 4 },
                  // { xtype: "label", text: "สถานะ : " },
                  // { xtype: "tbspacer", width: 4 },
                  // {
                  //   id: "s_i_status",
                  //   xtype: "combo",
                  //   width: 100,
                  //   mode: "local",
                  //   store: new Ext.data.SimpleStore({
                  //     fields: ["value", "text"],
                  //     data: [
                  //       ["0", "ทั้งหมด"],
                  //       ["1", "1 - จัดทำใบขอเบิก"],
                  //       ["2", "2 - ส่งใบเบิก"],
                  //       ["3", "3 - ทักท้วง"],
                  //       ["4", "4 - อนุมัติฏีกา"],
                  //       ["5", "5 - หัวหน้าฝ่ายการคลังลงนาม"],
                  //       ["6", "6 - ผู้บริหารลงนาม"],
                  //       ["7", "7 - ผู้บริหารลงนาม"],
                  //       ["8", "8 - จัดทำเช็ค"],
                  //       ["9", "9 - หัวหน้าฝ่ายการคลังลงนามเช็ค"],
                  //       ["10", "10 - ผู้บริหารลงนามเช็ค"],
                  //       ["11", "11 - ทำทะเบียนจ่าย"],
                  //     ],
                  //   }),
                  //   value: "0",
                  //   valueField: "value",
                  //   displayField: "text",
                  //   allowBlank: false,
                  //   editable: false,
                  //   triggerAction: "all",
                  //   typeAhead: false,
                  // },
                ],
              },
            ],
            buttonAlign: "left",
            buttons: [
              { xtype: "tbfill" },
              {
                text: "ค้นหา",
                iconCls: "icon-magnifier",
                handler: function () {
                  search();
                },
              },
            ],
          },
          {
            xtype: "buttongroup",
            // title: "ระบุเงื่อนไขในการค้นหาข้อมูล",
            columns: 1,
            defaults: { scale: "small", style: "float: right" },
            items: [
              {
                xtype: "buttongroup",
                frame: false,
                items: [
                  { xtype: "label", text: "ปี PR : " },
                  { xtype: "tbspacer", width: 4 },
                  new Ext.form.ComboBox({
                    id: "s_i_budget_year",
                    mode: "local",
                    store: Ext.store_year,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    width: 284,
                    value: 0,
                    //   value: Ext.bgYear,
                    listeners: {
                      afterrender: function () {
                        this.fn = function () {};
                      },
                      change: function (combo, newValue) {
                        if (newValue == "") {
                          combo.reset();
                        }
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
                ],
              },
              {
                xtype: "buttongroup",
                frame: false,
                //   hidden:true,

                items: [
                  { xtype: "label", text: "ปีของสัญญา : " },
                  { xtype: "tbspacer", width: 4 },
                  new Ext.form.ComboBox({
                    id: "s_i_year_contract",
                    mode: "local",
                    store: Ext.store_year,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    width: 284,
                    value: "0",
                    listeners: {
                      afterrender: function () {
                        this.fn = function () {};
                      },
                      change: function (combo, newValue) {
                        if (newValue == "") {
                          combo.reset();
                        }
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
                ],
              },
              {
                xtype: "buttongroup",
                frame: false,
                //   hidden:true,
                items: [
                  { xtype: "label", text: "ประเภทสัญญา : " },
                  { xtype: "tbspacer", width: 4 },
                  {
                    id: "i_type_contract",
                    xtype: "combo",
                    width: 159,
                    mode: "local",
                    store: new Ext.data.SimpleStore({
                      fields: ["value", "text"],
                      data: [
                        ["0", "ทั้งหมด"],
                        ["1", "สัญญา"],
                        ["2", "ใบสั่ง"],
                        ["3", "จะซื้อจะขาย"],
                        //   ["4", "รับคืนทักท้วง (หน่วยงาน)"],
                        //   ["5", "บันทึกโดยระบบบริหารพัสดุ"],
                      ],
                    }),
                    value: "0",
                    valueField: "value",
                    displayField: "text",
                    allowBlank: false,
                    editable: false,
                    triggerAction: "all",
                    typeAhead: false,
                  },
                  { xtype: "tbspacer", width: 4 },
                  { xtype: "label", text: "สถานะการจอง : " },
                  { xtype: "tbspacer", width: 4 },
                  {
                    id: "s_i_enable",
                    xtype: "combo",
                    readOnly: true,
                    width: 80,
                    mode: "local",
                    store: new Ext.data.SimpleStore({
                      fields: ["value", "text"],
                      data: [
                        ["0", "ทั้งหมด"],
                        ["1", "ใช้เงินแล้ว"],
                        ["2", "ยังไม่ได้ระบุ"],
                        ["3", "ไม่ต้องระบุ"],
                      ],
                    }),
                    value: "0",
                    valueField: "value",
                    displayField: "text",
                    allowBlank: false,
                    editable: false,
                    triggerAction: "all",
                    typeAhead: false,
                  },
                ],
              },
              {
                xtype: "buttongroup",
                fieldLabel: "",
                hidden: true,
                height: 22,
                frame: false,
                items: [
                  { xtype: "label", text: "วันที่สร้างรายการ : " },
                  { xtype: "tbspacer", width: 4 },
                  new Ext.form.Checkbox({
                    id: "checkbox_date",
                    boxLabel: "",
                    inputValue: 1,
                    checked: false,
                    listeners: {
                      afterrender: function () {},
                      check: function (combo, newValue) {
                        if (newValue == true) {
                          Ext.getCmp("date_start").show();
                          Ext.getCmp("date_end").show();
                          Ext.getCmp("displayfield_date").show();
                        } else {
                          Ext.getCmp("date_start").hide();
                          Ext.getCmp("date_end").hide();
                          Ext.getCmp("displayfield_date").hide();
                        }
                      },
                    },
                  }),
                  { xtype: "tbspacer", width: 4 },
                  {
                    xtype: "datefield",
                    id: "date_start",
                    width: 110,
                    value: addY(543),
                  },
                  {
                    xtype: "displayfield",
                    value: "&nbsp;&nbsp;ถึงวันที่&nbsp;&nbsp;",
                    id: "displayfield_date",
                    align: "center",
                  },
                  {
                    xtype: "datefield",
                    id: "date_end",
                    width: 110,
                    value: addY(543),
                  },
                  { xtype: "tbspacer", width: 269 },
                ],
                listeners: {
                  afterrender: function () {
                    Ext.getCmp("date_start").hide();
                    Ext.getCmp("date_end").hide();
                    Ext.getCmp("displayfield_date").hide();
                  },
                },
              },
              {
                xtype: "buttongroup",
                hidden: true,
                frame: false,
                items: [
                  { xtype: "label", text: " : " },
                  { xtype: "tbspacer", width: 4 },
                  { xtype: "tbspacer", width: 7 },
                  new Ext.form.Checkbox({
                    id: "s_checkbox_c_code_po",
                    boxLabel: "มีเลขที่สัญญา",
                    inputValue: 1,
                    checked: false,
                    listeners: {
                      check: function (combo, newValue) {
                        search();
                      },
                    },
                  }),
                  { xtype: "tbspacer", width: 7 },
                  new Ext.form.Checkbox({
                    id: "s_i_booking",
                    boxLabel: "มีเลขที่ PR",
                    inputValue: 1,
                    checked: false,
                    listeners: {
                      check: function (combo, newValue) {
                        search();
                      },
                    },
                  }),
                  { xtype: "tbspacer", width: 7 },
                  new Ext.form.Checkbox({
                    id: "i_pdf",
                    boxLabel: "ที่มีเอกสาร PDF",
                    inputValue: 1,
                    checked: false,
                    listeners: {
                      check: function (combo, newValue) {
                        search();
                      },
                    },
                  }),
                  { xtype: "tbspacer", width: 0 },
                ],
              },
            ],
          },
          { xtype: "tbfill" },
          {
            xtype: "container",
            items: [
              { xtype: "container", height: 92 },
              {
                xtype: "label",
                html: '<img src="../images/icons/information.png">',
                layout: {
                  pack: "center",
                  type: "hbox",
                },
                listeners: {
                  render: function (c) {
                    var style_dot_color = "font-size:20px; -webkit-text-stroke: 0.5px black;";
                    var text_ToolTip = "<span style='white-space:nowrap;'><span style='" + style_dot_color + "color: #E4FFE4;'>∎</span>ผ่านรายการ</span>";
                    //   var text_ToolTip = "<span style='white-space:nowrap;'><span style='" + style_dot_color + "color: #DEDEDE;'>∎</span></span><br>";
                    //   text_ToolTip += "<span style='white-space:nowrap;'><span style='" + style_dot_color + "color: #FFEBEB;'>∎</span> รายการยกเลิก</span><br>";
                    new Ext.ToolTip({
                      target: c.id,
                      anchor: "top",
                      html: text_ToolTip,
                      bodyStyle: {
                        backgroundColor: "#FFFFFF",
                      },
                    });
                  },
                },
              },
            ],
          },
        ],
        layout: "fit",
        clicksToEdit: 2,
        viewConfig: {
          emptyText: "ไม่มีข้อมูล..",
          deferEmptyText: true,
          // row สี
          getRowClass: function (record, index, rowParams) {
            //   if (record.data.i_enable != 1) {
            //     return "delete-color-red";
            //   }
            if (record.data.i_contract_status > 1) {
              return "color-green";
            }
            // if (record.data.i_sub_status == "0.21") {
            //   return "color-yellow";
            // }
            // if (record.data.i_sub_status > "0.21") {
            //   return "color-green";
            // return "color-grey";
            // }
          },
        },
        listeners: {
          dblclick: function (dataview, index, item, e) {
            Ext.buAct = "update";
            Ext.loadStore("edit", true); // app,data.load
          },
          viewready: function (g) {
            //
          },
          // Allow rows to be rendered.
          beforeedit: function (g) {
            if (g.rowIdx == 1) return false;
          },
          // Allow rows to be rendered. console.log(value.format('d-m-Y'));
          afteredit: function (g) {
            // console.log(g.record.get('d_inv_date').format('d-m-Y'));
          },
          beforerender: function (g) {
            this.contextMenu = new Ext.menu.Menu({
              items: [
                {
                  text: "ค้นหาข้อมูล",
                  icon: "../images/icons/book_magnify.png",
                  handler: function (e) {
                    //                                                     Ext.loadStore("add", true); // app,data.load
                  },
                  scope: this,
                },
                //   {
                //       text: "เพิ่มข้อมูล",
                //       icon: "../images/icons/add.png",
                //       handler: function (e) {
                //           Ext.loadStore("add", true); // app,data.load
                //       },
                //       scope: this,
                //   },
                {
                  text: "จัดการข้อมูล View/Copy/Edit/Delete",
                  icon: "../images/icons/application_edit.png",
                  handler: function (e) {
                    Ext.loadStore("edit", true); // app,data.load
                  },
                  scope: this,
                },
                {
                  text: "คัดลอกข้อมูลใน copy data in cell grid",
                  icon: "../images/icons/page_copy.png",
                  handler: function (e) {
                    var arrDataCopy = ["dc_creditor_idTxt", "c_code", "f_total_amt"];
                    var rowx = Ext.selectRow;

                    if (!Ext.isEmpty(rowx) && !Ext.isEmpty(arrDataCopy))
                      //if Ctlr+c
                      CopyToClipboard(rowx, arrDataCopy);
                  },
                  scope: this,
                },
              ],
            });
          },
          afterrender: function (grid) {
            //g.getStore().getAt(rowIndex);
            //  console.log();
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
            this.on("cellclick", cellClick, this); //cellClick
            this.on(
              "contextmenu",
              function (e, grid, rowIndex, columnIndex) {
                e.stopEvent();
                this.contextMenu.showAt(e.getXY());
              },
              this
            );

            /*
                       //  Ctlr+c
                       new Ext.KeyMap(Ext.get('tabpanel1'), [{
                       key: "c",
                       ctrl: true,
                       scope: this,
                       fn: function (e, ele) {
                       ele.preventDefault();
                       var arrDataCopy = ["c_detail", "c_code_ref", "po_creditor_name"];
                       var rowx = Ext.selectRow;
                       if (!Ext.isEmpty(rowx) && !Ext.isEmpty(arrDataCopy)) //if Ctlr+c
                       CopyToClipboard(rowx, arrDataCopy

                       ;                        }
                       //end key
                       */
          },
        },
        store: Ext.storeDtl,
        columns: colmnn,
        bbar: new Ext.PagingToolbar({
          pageSize: 20,
          store: Ext.storeDtl,
          displayInfo: true,
          displayMsg: "Displaying topics {0} - {1} of {2}",
        }),
      });
    }),
    Ext.grid.EditorGridPanel,
    {}
  );
  ///////////////// EditorGridPanel
  const search = function () {
    var msg = "";
    if (msg == "") {
      Ext.storeDtl.setBaseParam("mode", "SEARCH");
      Ext.storeDtl.setBaseParam("filter", Ext.getCmp("filter").getValue());
      Ext.storeDtl.setBaseParam("value", Ext.getCmp("value-box").getValue());
      Ext.storeDtl.setBaseParam("i_type_contract", Ext.getCmp("i_type_contract").getValue());
      Ext.storeDtl.setBaseParam("i_budget_year", Ext.getCmp("s_i_budget_year").getValue());
      Ext.storeDtl.setBaseParam("i_year_contract", Ext.getCmp("s_i_year_contract").getValue());
      Ext.storeDtl.setBaseParam("i_enable", Ext.getCmp("s_i_enable").getValue());

      // Ext.storeDtl.setBaseParam("userid", Ext.getCmp("userid-ID").getValue());
      Ext.getCmp("tabpanel1").getStore().load();
    } else {
      Ext.Msg.alert("แจ้งเตือน", msg);
    }
    Ext.storeDtl.load();
  };

  Ext.loadStore = function (status, show) {
    var statusx = status;
    var winx = show;
    if (statusx == "edit" && Ext.isEmpty(Ext.selectRow)) {
      Ext.Msg.alert("แจ้งเตือน", "กรุณา click เลือกข้อมูลที่จะแก้ไขใน data grid", function (form, action) {
        return false;
      });
    } else if (statusx === "load") {
    } else if (statusx === "edit_contract") {
      // Ext.getCmp("winMain1").getEl().mask("Please wait...", "x-mask-loading");
      Ext.guarantee.reload({
        callback: function (recordx, operation, success) {
          if (success) {
            Ext.storeedit.setBaseParam("sp_tor_id", Ext.selectRow.data.sp_tor_id);
            Ext.storeedit.reload({
              callback: function (rec, operation, success) {
                if (success) {
                  Ext.each(Ext.storeedit, function (value, item) {
                    Uiedit_contract(Ext.selectRow);
                    Ext.getCmp("winChequeEditID").items.items[0].getForm().loadRecord(Ext.selectRow);
                    // Ext.getCmp("winMain1").getEl().unmask();
                  });
                }
              },
            });
          }
        },
      });
    } else AppPoStore(statusx).show();

    if (statusx === "add") {
      Ext.HDR_ID = null;
    } else if (statusx === "edit") {
      //before Load
      var rec = Ext.selectRow;
      Ext.selectRow = rec;
      Ext.getCmp("winChequeID").items.items[0].getForm().loadRecord(rec);

      //After Load Trigger
      Ext.getCmp("d_due_dateMianID").fn();

      Ext.HDR_ID = Ext.selectRow.data.po_working_hdr_id;
      Ext.DC_CREDITOR_ID = Ext.selectRow.data.dc_creditor_id; ////i_yyyy dc_expense_budget_type_id po_expense_id

      Ext.store3.load();

      //            Ext.getCmp("winChequeID").hideTabStripItem(2);
      //            Ext.getCmp("DISPLAY_c_name_hdr_period").setValue(Ext.selectRow.data.c_code);
      //            Ext.getCmp("DISPLAY_creditor_name_hdr_period").setValue(Ext.selectRow.data.dc_creditor_idTxt);
      //            Ext.getCmp("DISPLAY_creditor_d_doc_date_hdr_period").setValue(Ext.selectRow.data.d_due_date);
      //            Ext.getCmp("DISPLAY_creditor_f_total_amt_hdr_period").setValue(Ext.selectRow.data.f_total_amt);

      if (Ext.selectRow.data.i_is_po == 1) {
        Ext.Msg.alert("แจ้งเตือน", "สัญญาจะซื้อจะขาย " + Ext.selectRow.get("c_code"), function (bu, action) {
          //                    Ext.getCmp("winChequeID").hideTabStripItem(1);
          return true;
        });
      }

      if (Ext.selectRow.data.i_contract_status > 1) {
        Ext.getCmp("buSaveSubID").hide();
      }

      //****************
      // alert(rec.get('d_cashiercheque_date'));
      if (Ext.selectRow.get("i_is_warranty") == 1) {
        Ext.getCmp("i_is_bank_warranty0ID").setValue(null);
        Ext.getCmp("i_is_bank_warrantyID").setValue(true);
        Ext.getCmp("i_warranty_typeID").show();
        Ext.getCmp("c_books_receiptID").show();
        Ext.getCmp("c_receipt_noID").show();
        Ext.getCmp("d_book_dateID").show();
        Ext.getCmp("c_commentID").show();
      } else {
        Ext.getCmp("i_is_bank_warranty0ID").setValue(true);
        Ext.getCmp("i_is_bank_warrantyID").setValue(null);
        Ext.getCmp("i_warranty_typeID").hide();
        Ext.getCmp("c_books_receiptID").hide();
        Ext.getCmp("c_receipt_noID").hide();
        Ext.getCmp("d_book_dateID").hide();
        Ext.getCmp("c_commentID").hide();
      }

      if (Ext.selectRow.get("c_books_cashiercheque") != null) {
        Ext.getCmp("i_is_cashiercheque_warrantyID").setValue(true);
        Ext.getCmp("i_cashiercheque_typeID").show();
        Ext.getCmp("c_books_cashierchequeID").show();
        Ext.getCmp("c_receipt_cashierchequeID").show();
        Ext.getCmp("d_cashiercheque_dateID").show();
        Ext.getCmp("c_commentID2").show();
        Ext.getCmp("i_is_bank_warranty0ID").setValue(null);
      } else {
        Ext.getCmp("i_is_cashiercheque_warrantyID").setValue(false);
        Ext.getCmp("i_cashiercheque_typeID").hide();
        Ext.getCmp("c_books_cashierchequeID").hide();
        Ext.getCmp("c_receipt_cashierchequeID").hide();
        Ext.getCmp("d_cashiercheque_dateID").hide();
        Ext.getCmp("c_commentID2").hide();
      }

      if (Ext.selectRow.get("i_is_warranty_book") == 1) {
        Ext.getCmp("i_is_bank_warranty1ID").setValue(true);
        Ext.getCmp("i_warranty_type1ID").show();
        Ext.getCmp("c_doc_noID").show();
        Ext.getCmp("d_doc_date1ID").show();
        Ext.getCmp("c_comment1ID").show();
        Ext.getCmp("d_expire_warrantyID").show();
        Ext.getCmp("frmPopBankID").show();
        Ext.getCmp("dc_bank_idID_Name").setValue(Ext.selectRow.get("dc_bank_idID_Name"));
        Ext.getCmp("dc_bank_idID").setValue(Ext.selectRow.get("dc_bank_id"));
      } else {
        Ext.getCmp("i_is_bank_warranty1ID").setValue(null);
        Ext.getCmp("i_warranty_type1ID").hide();
        Ext.getCmp("c_doc_noID").hide();
        Ext.getCmp("d_doc_date1ID").hide();
        Ext.getCmp("c_comment1ID").hide();
        Ext.getCmp("d_expire_warrantyID").hide();
        Ext.getCmp("frmPopBankID").hide();
      }
      //*****************/
    } //End Edit
  };
};
