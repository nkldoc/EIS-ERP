/* global Ext, user_right_add, user_right_edit, user_right_delete */
function win_hdr_period() {
    var tabs = new Ext.FormPanel({
        labelWidth: 175,
        bodyStyle: "padding:1px",
        id: "form-widgets",
        url: "tor/api/mnTorController.php",
        border: false,
        width: 1000,
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
                    defaults: {width: 430},
                    border: false,
                    defaultType: "textfield",
                    items: [
                        {
                            xtype: "hidden",
                            name: "mode",
                            value: "UP_SP_TOR_HDR_PERIOD_PO",
                        },
                        {
                            xtype: "hidden",
                            name: "sp_tor_hdr_period_id",
                            value: Ext.SP_TOR_HDR_PERIOD_ID,
                        },
                        {
                            xtype: "hidden",
                            name: "tor_id",
                            value: Ext.SP_TOR_ID,
                        },
                        {
                            xtype: "hidden",
                            name: "sp_tor_contract_id",
                            value: Ext.SP_TOR_CONTRACT_ID,
                        },
                        {
                            xtype: "hidden",
                            name: "i_is_po",
                            value: Ext.I_IS_PO,
                        },
                        {
                            xtype: "hidden",
                            name: "sp_po_id",
                            value: Ext.SP_PO_ID,
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
                            fieldLabel: "งวดที่",
                            xtype: "numberfield",
                            style: "text-align: center",
                            name: "i_period",
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
                            boxLabel: " กรณีเป็นงวดสุดท้ายจะมีการแจ้งเตือนก่อนหมดสัญญา",
                            inputValue: "1",
                        },
                        {
                            xtype: "datefield",
                            fieldLabel: "วันที่ออกเอกสาร  ",
                            id: "d_doc_dateID",
                            name: "d_doc_date",
                            width: 100,
                            validator: function (val) {
                                if (Ext.isEmpty(val)) {
                                    return "กรุณากรอก วันที่ออกเอกสาร ";
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
                                // afterrender: function () {
                                //   if (this.getValue().inputValue == 0) {
                                //     Ext.getCmp("group_period_date").hide();
                                //     Ext.getCmp("group_i_day").show();
                                //   } else {
                                //     Ext.getCmp("group_period_date").show();
                                //     Ext.getCmp("group_i_day").hide();
                                //   }
                                // },
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
                        // {
                        //   fieldLabel: "หมายเหตุ",
                        //   id: "c_comment_advance3ID",
                        //   name: "c_comment_advance",
                        //   xtype: "textarea",
                        //   height: 60,
                        //   width: 430,
                        //   listeners: {
                        //     render: function (p) {
                        //       // this.hide();
                        //     },
                        //   },
                        //   /*product*/
                        // },
                        // {
                        //   fieldLabel: "จำนวน  ",
                        //   id: "i_is_unit_type_productID",
                        //   xtype: "radiogroup",
                        //   columns: [80, 80, 150, 110, 110],
                        //   items: [
                        //     {
                        //       boxLabel: "เป็น (%) ",
                        //       checked: true,
                        //       name: "i_is_unit_type_product",
                        //       inputValue: "2",
                        //     },
                        //     {
                        //       boxLabel: "เป็น(บาท) ",
                        //       name: "i_is_unit_type_product",
                        //       inputValue: "1",
                        //     },
                        //     {
                        //       xtype: "textfield",
                        //       id: "f_amt_productID",
                        //       name: "f_amt_product",
                        //       width: 130,
                        //       value: "0.00",
                        //       validator: function (val) {
                        //         var regex =
                        //           /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\.[0-9]{1,2})?$/;
                        //         var strMoney = val.replace(",", "");
                        //         if (!regex.test(val)) {
                        //           return "กรุณากรอก จำนวนเงินเป็นจำนวนทศนิยม มูลค่ามากกว่า 0.00";
                        //           return true;
                        //         } else {
                        //           return true;
                        //         }
                        //       },
                        //     },

                        //     {
                        //       xtype: "displayfield",
                        //       id: "fpPt32",
                        //       value: "%",
                        //       cls: "my-label-style",
                        //     },
                        //     {
                        //       xtype: "displayfield",
                        //       id: "fpBt32",
                        //       value: "บาท ",
                        //       cls: "my-label-style",
                        //       listeners: {
                        //         render: function (p) {
                        //           // this.hide();
                        //         },
                        //       },
                        //     },
                        //   ],
                        //   listeners: {
                        //     change: function (cb, rec, ind) {
                        //       this.fnValue(rec.inputValue);
                        //     },
                        //     afterrender: function (obj, eOpts) {
                        //       this.hide();
                        //       this.fnValue = function (id) {
                        //         if (id == "2") {
                        //           Ext.getCmp("fpPt32").show();
                        //           Ext.getCmp("fpBt32").hide();
                        //         } else {
                        //           Ext.getCmp("fpPt32").hide();
                        //           Ext.getCmp("fpBt32").show();
                        //         }
                        //       };
                        //     },
                        //   },
                        // },
                        // {
                        //   xtype: "checkbox",
                        //   id: "i_status_productID",
                        //   name: "i_status_product",
                        //   height: 20,
                        //   boxLabel: "หักจากวงเงินในงวดงาน",
                        //   inputValue: "1",
                        //   listeners: {
                        //     render: function (p) {
                        //       // this.hide();
                        //     },
                        //   },
                        // },
                        {
                            fieldLabel: "หมายเหตุ",
                            id: "c_comment_product3ID",
                            name: "c_discription",
                            xtype: "textarea",
                            height: 60,
                            width: 430,
                            listeners: {
                                render: function (p) {
                                    // this.hide();
                                },
                                afterrender: function () {
                                    if (Ext.SP_TOR_HDR_PERIOD_ID > 0) {
                                        d_doc_dateID_Change();
                                    }
                                },
                            },
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
                                    // Ext.selectRow = null;
                                    Ext.getCmp("win-frm-dtlID").destroy();
                                    Ext.store4.setBaseParam("tor_id", Ext.SP_TOR_HDR_PERIOD_ID);
                                    Ext.store4.setBaseParam("sp_tor_hdr_period_id", Ext.SP_TOR_HDR_PERIOD_ID);
                                    Ext.store4.load({
                                        callback: function (record, operation, success) {
                                            if (success) {
                                                Ext.i_period = i_period;
                                                Ext.getCmp("winChequeID").setActiveTab(2);
                                                Ext.getCmp("tabpanelMain3ID").setTitle("วันส่งมอบ " + d_period_date + "  งวดที่ " + i_period);
                                                //SET BBTOTAL
                                                var i = this.data.length - 1;
                                                console.log(i);
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
                                    Ext.getCmp("DISPLAY_c_name_dtl_period").setValue(c_doc_ref_contract);
                                    Ext.getCmp("DISPLAY_creditor_name_dtl_period").setValue(dc_creditor_name);
                                    Ext.getCmp("DISPLAY_creditor_d_doc_date_dtl_period").setValue(d_period_date);
                                    Ext.getCmp("DISPLAY_creditor_f_total_amt_dtl_period").setValue(f_total_amt);
                                    Ext.getCmp("winChequeID").unhideTabStripItem(2);
                                    Ext.getCmp("winChequeID").setActiveTab(2);
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
                    var form = Ext.getCmp("form-widgets").getForm();
                    formSubmit(form);
                },
            },
            {
                text: "Cancel",
                handler: function () {
                    Ext.getCmp("win-frm-dtlID").destroy();
                },
            },
        ],
    });
    Ext.storeUnitType.load({
        callback: function (recordx, operation, success) {
            if (success) {
                var win = new Ext.Window({
                    id: "win-frm-dtlID",
                    layout: "fit",
                    width: 1000,
                    height: 400,
                    //closeAction: 'hide',
                    plain: true,
                    modal: true,
                    items: tabs,
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

const saveDtl = function (mode) {
    let msg = "";
    let jsonArr = [];
    var num = Ext.getCmp("gridEditor").store.data.items.length - 1;
    var row = 0;
    while (num >= row) {
        if (document.getElementById("chk_" + row).checked == true) {
            jsonArr.push({
                sp_tor_id: Ext.SP_TOR_ID,
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
    if (msg == "") {
        Ext.getCmp("win-frm-perid-bal-dtlID").getEl().mask("Please wait...", "x-mask-loading");
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
    var i_product_type = Ext.getCmp("period_i_product_type2").getValue().inputValue;
    var inv_mode_idID = parseInt(Ext.getCmp("inv_mode_idID").value) / 1;
    var am_mode_idID = parseInt(Ext.getCmp("am_mode_idID").value) / 1;

    let msg = "";
    let jsonArr = [];
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
    if (i_product_type === 1 && Ext.num(inv_mode_idID, 0) < 1) {
        msg += "<span style='white-space: nowrap;'>- กรุณาเลือกหมวดวัสดุ</span><br>";
    }
    if (i_product_type === 2 && Ext.num(am_mode_idID, 0) < 1) {
        msg += "<span style='white-space: nowrap;'>- กรุณาเลือกหมวดครุภัณฑ์</span><br>";
    }
    if (msg == "") {
        Ext.getCmp("win-frm-perid-bal-dtl2ID").getEl().mask("Please wait...", "x-mask-loading");
        Ext.Ajax.request({
            url: "tor/api/mnTorController.php",
            method: "POST",
            params: {
                mode: "UP_SP_TOR_DTL_PERIOD_NEW",
                sp_tor_id: Ext.SP_TOR_ID,
                sp_tor_contract_id: Ext.SP_TOR_CONTRACT_ID,
                sp_tor_hdr_period_id: Ext.SP_TOR_HDR_PERIOD_ID,
                sp_tor_dtl_period_id: Ext.SP_TOR_DTL_PERIOD_ID,
                dc_bg_budget_type_id: Ext.getCmp("period_dc_expense_budget_type_id").getValue(),
                po_expense_id: Ext.getCmp("period_po_expense_id").getValue(),
                i_hire_type: Ext.getCmp("period_i_hire_type").getValue().inputValue,
                i_product_type: Ext.getCmp("period_i_hire_type").getValue().inputValue == 1 ? Ext.getCmp("period_i_product_type2").getValue().inputValue : null,
                inv_mode_id: Ext.getCmp("period_i_product_type2").getValue().inputValue == 1 ? Ext.getCmp("inv_mode_idID").value : 0,
                am_mode_id: Ext.getCmp("period_i_product_type2").getValue().inputValue == 2 ? Ext.getCmp("am_mode_idID").value : 0,
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
                text: "Confirm",
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

const delete_htl_period = function () {
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

function win_dtl_period() {

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
    var tabs = new Ext.FormPanel({
        labelWidth: 175,
        border: false,
        width: 1000,
        items: {
            xtype: "tabpanel",
            activeTab: 0,
            defaults: {
                autoHeight: true,
                bodyStyle: "padding:10px",
            },
            items: [
                {
                    title: "รายละเอียดของที่จัดซื้อไม่อยู่ใน TOR",
                    id: "form-dtl-period",
                    layout: "form",
                    defaults: {width: 430},
                    defaultType: "textfield",
                    items: [
                        new Ext.form.ComboBox({
                            mode: "local",
                            store: Ext.dc_expense_budget_type,
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
                                    //this.setValue(Ext.selectRow.data.dc_bg_budget_type_id);
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
                            anchor: "70%",
                            submitValue: true,
                            id: "period_po_expense_id",
                            name: "po_expense_id",
                            triggerAction: "all",
                            allBlank: true,
                            forceSelection: true,
                            selectOnFocus: true,
                            fieldLabel: "รายการย่อย",
                            width: 200,
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
                                    console.log(this);
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
                                        Ext.getCmp('inv_mode_idID').hide();
                                        Ext.getCmp('am_mode_idID').hide();
                                    } else {
                                        Ext.getCmp("period_i_product_type2").show();
                                        Ext.getCmp("period_i_is_invG2").show();
                                        Ext.getCmp('inv_mode_idID').show();
                                        Ext.getCmp('am_mode_idID').show();
                                    }
                                },
                                afterrender: function () {
                                    if (Ext.selectRow.get('i_purchase') == 1)
                                        this.hide();
                                    else
                                        this.show();
                                }
                            },
                        },
                        {
                            xtype: "radiogroup",
                            columns: [98, 98],
                            fieldLabel: "ของที่ได้มา",
                            id: "period_i_product_type2",
                            name: "i_product_type",
                            items: [
                                {
                                    checked: true,
                                    name: "i_product_type_l",
                                    inputValue: 1,
                                    boxLabel: "วัสดุ",
                                },
                                {
                                    inputValue: 2,
                                    name: "i_product_type_l",
                                    boxLabel: "ครุภันฑ์",
                                },
                            ], //radiogroup
                            listeners: {
                                change: function () {
                                    if (Ext.getCmp('period_i_product_type2').getValue().inputValue == 1) { //วัสดุ
                                        Ext.getCmp('inv_mode_idID').show();
                                        Ext.getCmp('am_mode_idID').hide();

                                    } else {
                                        Ext.getCmp('am_mode_idID').show();
                                        Ext.getCmp('inv_mode_idID').hide();
                                    }
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
                        }, new Ext.form.ComboBox({
                            mode: "local",
                            store: Ext.am_mode_acc,
                            fieldLabel: "หมวดค่าสินทรัพย์",
                            anchor: "98%",
                            id: "am_mode_idID",
                            submitValue: true,
                            name: "c_am_mode_id",
                            hiddenName: "am_mode_id",
                            valueField: "id",
                            displayField: "c_name",
                            triggerAction: "all",
                            forceSelection: true,
                            selectOnFocus: true,
                            typeAhead: false,
                            emptyText: "กรุณาเลือกหมวดสินทรัพย์...",
                            listeners: {
                                Change: function () {},
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
                            store: Ext.inv_mode_acc,
                            fieldLabel: "หมวดค่าวัสดุ",
                            anchor: "98%",
                            id: "inv_mode_idID",
                            submitValue: true,
                            name: "c_inv_mode_id",
                            hiddenName: "inv_mode_id",
                            valueField: "id",
                            displayField: "c_name",
                            triggerAction: "all",
                            forceSelection: true,
                            selectOnFocus: true,
                            typeAhead: false,
                            emptyText: "กรุณาเลือกหมวดวัสดุ",
                            listeners: {
                                Change: function () {},
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
                                blur: function () {
                                    var f_total = parseFloat(this.getValue().replace(/,/g, "") / 1);
                                    this.setValue(Ext.floatRenderer(f_total));
                                    if (this.getValue() == "" || this.getValue() == 0) {
                                        this.setValue("0.00")
                                    }
                                },
                                afterrender: function () {
                                    if (this.getValue() == "" || this.getValue() == 0) {
                                        this.setValue("0.00")
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
                            id: "period_dc_unit_type_id",
                            name: "dc_unit_type_id",
                            store: Ext.storeUnitType,
                            valueField: "id",
                            displayField: "c_name",
                            //value: Ext.bgYear,
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
                            },
                        }),
                    ],
                },
            ],
        },
        buttons: [
            {
                text: "บันทึกรายการ",
                id: "buSaveSub2ID",
                iconCls: "icon-save",
//                            text: "Save",
                handler: function () {
                    savePerid();
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
        bbar: [{xtype: "button"}],
    });
    var rec = Ext.selectRow_PeridDtl;
    // rec.set("c_name", null);
    if (Ext.selectRow_PeridDtl != null) {

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
        Ext.selectRow.set('c_name', null);
        Ext.getCmp("win-frm-perid-bal-dtl2ID").items.items[0].getForm().loadRecord(Ext.selectRow);
    }
    win.show();


    if (Ext.getCmp('period_i_product_type2').getValue().inputValue == 1) { //วัสดุ
        Ext.getCmp('inv_mode_idID').show();
        Ext.getCmp('am_mode_idID').hide();

    } else {
        Ext.getCmp('am_mode_idID').show();
        Ext.getCmp('inv_mode_idID').hide();
    }

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
    Ext.user_right_add = user_right_add;
    Ext.user_right_edit = user_right_edit;
    Ext.user_right_delete = user_right_delete;
    Ext.title = Ext.menu_name + " " + Ext.menu_code;
    Ext.HDR_ID = null;
    Ext.status = Ext.apply({
        name: menu,
        process: function (menuCode, record) {
            Ext.Ajax.request({
                url: "tor/api/mnTorController.php",
                params: {
                    mode: "UPSTATUS_PO",
                    menuCode: menuCode,
                    // tor_status_id: record.get("tor_status_id"),
                    id: record.get("sp_po_id"),
                },
                method: "POST", //GET
                success: function (result, request) {
                    var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                    if (jsonData.success) {
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
    });
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
    function gridDetail() {
        new Ext.Window({
            id: "win-frm-perid-bal-dtlID",
            title: "รายการของ",
            modal: true,
            resizable: false,
            // collapsible: true,
            // maximizable: true,
            width: 1255,
            height: 500,

            layout: "form",
            bodyStyle: "padding:3px;",
            items: [
                new Ext.grid.GridPanel({
                    id: "gridEditor",
                    region: "center",
                    layout: "fit",
                    border: true,
                    stripeRows: true,
                    loadMask: true,
                    clicksToEdit: 1,
                    height: 450,
                    store: Ext.store5,
                    // viewConfig: {
                    //   emptyText: "ไม่มีข้อมูล..",
                    //   deferEmptyText: false,
                    //   getRowClass: function (record, index, rowParams) {
                    //     if (record.data.i_type == 1) {
                    //       return "td-cost";
                    //     } else if (record.data.i_type == 2) {
                    //       return "td-total";
                    //     }
                    //     return index % 2 == 0 ? "grid-odd padd-6" : "grid-even padd-6";
                    //   },
                    // },
                    // listeners: {
                    //   beforeedit: function (editor) {
                    //     let row = editor.record.data;
                    //     if (row.i_type != 0) {
                    //       return false;
                    //     }
                    //   },
                    // },
                    tbar: [],
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
                            header: "<div class='topAlign'><input id='checkAll' type='checkbox' onchange='checkAll(this.checked)'></div>",
                            sortable: false,
                            align: "center",
                            dataIndex: "sp_tor_dtl_id",
                            width: 60,
                            renderer: function (value, metaData, record, row, col, store, gridView) {
                                // metaData.style="background-color:#ffaaaa !important;";
                                metaData.attr = 'style="background-color:#FFE0D2 !important;"';
                                // metaData.style = "background:#FFE0D2;";
                                return "<input style='margin-top:3px; margin-bottom:2px;' type='checkbox' onchange='checkID(" + id + "," + row + ")' id='chk_" + row + "' value=" + value + ">";
                            },
                        },
                        {
                            header: "จำนวน ที่เลือก",
                            sortable: false,
                            align: "center",
                            dataIndex: "i_num_select",
                            width: 80,
                            renderer: function (value, metaData, record, row, col, store, gridView) {
                                metaData.attr = 'style="background-color:#FFE0D2 !important;"';
                                return "<input type='number' autocomplete='off' style=' width:50px; text-align:center; ' onchange='change_checkbox(" + id + "," + row + ")' id='num_" + row + "'>";
                            },
                        },
                        {
                            header: "จำนวนเงินรวม ที่เลือก",
                            sortable: false,
                            align: "right",
                            dataIndex: "iiiii_sum_select",
                            width: 120,
                            renderer: function (value, metaData, record, row, col, store, gridView) {
                                metaData.attr = 'style="background-color:#FFE0D2 !important;"';
                                return "<p style='margin-bottom:6px;' text-align:right; id ='txt_sum_" + row + "'>&nbsp;</p>";
                            },
                        },
                        {
                            header: "รายละเอียด จัดซื้อ",
                            sortable: false,
                            align: "left",
                            dataIndex: "c_name",
                            width: 400,
                        },
                        {
                            header: "จำนวน ที่เหลือ",
                            sortable: false,
                            align: "center",
                            dataIndex: "i_qty",
                            width: 100,
                        },
                        {
                            header: "จำนวน ทั้งหมด",
                            sortable: false,
                            align: "center",
                            dataIndex: "i_qty_all",
                            width: 100,
                        },
                        {
                            header: "หน่วยนับ",
                            sortable: false,
                            align: "center",
                            dataIndex: "c_unit",
                            width: 100,
                        },
                        {
                            header: "จำนวนเงิน ต่อหน่อย",
                            sortable: false,
                            align: "right",
                            dataIndex: "f_unit_price",
                            width: 100,
                        },
                        {
                            header: "จำนวนเงินรวม",
                            sortable: false,
                            align: "right",
                            dataIndex: "f_total_price",
                            width: 100,
                        },
                        {width: 20, dataIndex: ""},
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
                        "->",
                        {
                            xtype: "label",
                            id: "statusbar",
                            html: "<div style='padding: 3px 6px 2px;'><img src='../images/icons/accept.png'><span style='position: relative; top: -4px; left: 5px;'>Ready</span></div>",
                        },
                    ],
                }),
            ],
        }).show();
    }
    function controller(rec, evt) {
        if (Ext.isEmpty(rec))
            Ext.Msg.alert("แจ้งเตือน", "กรุณา click เลือกข้อมูลที่จะแก้ไขใน data grid", function (bu, action) {
                return false;
            });
        else
            Ext.Msg.show({
                title: "แจ้งเตือน!",
                msg: "คุณต้องการ เปลี่ยนสถานะรายการไปรอส่งมอบงาน ?",
                width: 400,
                // buttons: Ext.MessageBox.YESNOCANCEL,
                buttons: Ext.MessageBox.YESNO,
                fn: function (btn, text) {
                    if (btn === "yes")
                        Ext.status.process("ST0009", rec);
                },
                icon: Ext.MessageBox.ERROR,
            });
    }
    function cellClick(grid, rowIndex, columnIndex, e) {
        Ext.selectRow = this.selModel.selection.record;
        // var record = grid.getStore().getAt(rowIndex);
        if (columnIndex === grid.getColumnModel().getIndexById("processDueID")) {
            //ttf

            controller(Ext.selectRow, "processDue"); //on
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
    Ext.po_creditor = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/All_PoWorkingImpHdr.php",
        baseParams: {
            type: "po_creditor",
        },
        root: "data",
        idProperty: "id",
        fields: ["id", "c_code", "c_name"],
    });
    Ext.po_creditor_transfer = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/All_PoWorkingImpHdr.php",
        baseParams: {
            type: "po_creditor_transfer",
        },
        root: "data",
        idProperty: "id",
        fields: ["id", "c_code", "c_name"],
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
    Ext.storeDtl = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "tor/api/List_poStep.php",
        baseParams: {
            type: "LIST_SP_PO_HDR",
            keyData: Ext.keyData,
            // i_is_po: true,
            tor_status_id: Ext.menu_id,
        },
        root: "data",
        idProperty: "id",
        totalProperty: "totalCount",
        /*             , s.i_purchase
         , s.i_hire_type
         , s.i_product_type */
        fields: [
            {name: "no"},
            {name: "sp_po_id"},
            {name: "sp_tor_contract_id"},
            {name: "sp_tor_id"},
            {name: "dc_creditor_id"},
            {name: "c_name"},
            {name: "c_code"},

            {name: "i_purchase"},
            {name: "i_hire_type"},
            {name: "i_product_type"},

            {name: "dc_bg_budget_type_id"},
            {name: "po_expense_id"},
//po_expense_id dc_bg_budget_type_id
            {name: "c_doc_ref"},
            {name: "c_discription"},
            {name: "i_is_status"},
            {name: "i_is_po"},
            {name: "d_due_date"},
            {name: "f_total_amt"},
            {name: "dc_user_create_id"},
            {name: "dc_user_create_cost_id"},
            {name: "d_create"},
            {name: "dc_user_update_id"},
            {name: "dc_user_update_cost_id"},
            {name: "d_update"},
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
            sp_tor_id: Ext.SP_TOR_ID,
        }, //Permission i_read
        idProperty: "id",
        totalProperty: "totalCount",
        fields: [
            {name: "no"},
            {name: "sp_tor_dtl_id"},
            {name: "sp_tor_id", type: "int"},
            {name: "c_name", type: "string"},
            {name: "i_qty"},
            {name: "i_qty_all"},
            {name: "c_unit"},
            {name: "f_unit_price"}, // f_net_unit_price f_net_total_price
            {name: "f_total_price"}, // f_net_unit_price f_net_total_price
        ],
    });

    Ext.store_year = new Ext.data.JsonStore({
        fields: ["id", "c_name"],
        autoDestroy: false,
        autoLoad: false,
        data: years,
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
    Ext.loadStore = function (status, show) {
        var statusx = status;
        var winx = show;
        if (statusx == "edit" && Ext.isEmpty(Ext.selectRow)) {
            Ext.Msg.alert("แจ้งเตือน", "กรุณา click เลือกข้อมูลที่จะแก้ไขใน data grid", function (form, action) {
                return false;
            });
        } else {
            if (statusx === "load") {
            } else
                AppPoStore(statusx).show();

            if (statusx === "add") {
                Ext.HDR_ID = null;
            } else if (statusx === "edit") {
                Ext.getCmp("winChequeID").hideTabStripItem(2);
                Ext.SP_TOR_ID = Ext.selectRow.data.sp_tor_id;
                Ext.SP_TOR_CONTRACT_ID = Ext.selectRow.data.sp_tor_contract_id;
                Ext.DC_CREDITOR_ID = Ext.selectRow.data.dc_creditor_id;

                Ext.SP_PO_ID = Ext.selectRow.data.sp_po_id;
                Ext.store3.setBaseParam("sp_tor_contract_id", Ext.SP_TOR_CONTRACT_ID);
                Ext.store3.setBaseParam("sp_po_id", Ext.SP_PO_ID);
                Ext.store3.load();
                Ext.getCmp("winChequeID").items.items[0].getForm().loadRecord(Ext.selectRow);

            }
        }

    };

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
        var comboTypeBg = new Ext.form.ComboBox({
            mode: "local",
            readOnly: true,
            store: Ext.dc_expense_budget_type,
            fieldLabel: "แหล่งเงิน",
            anchor: "100%",
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
            readOnly: true,
            fieldLabel: "ใช้เงินปีงบประมาณ",
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
        var comboExpense = new Ext.form.ComboBox({
            mode: "local",
            readOnly: true,
            store: Ext.po_expense,
            valueField: "id",
            displayField: "c_name",
            anchor: "100%",
            submitValue: true,
            name: "c_detail",
            hiddenName: "po_expense_id",
            triggerAction: "all",
            allBlank: true,
            forceSelection: true,
            selectOnFocus: true,
            fieldLabel: "รายการย่อย",
            width: 200,
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

        var statusx = statuss;

        if (statusx == "add") {
            Ext.getCmp("tabpanel1").getSelectionModel().clearSelections();
        }
        var col1 = [
            new Ext.grid.RowNumberer({width: 35, header: " No ", dataIndex: "no"}),
            {header: "ID System", hidden: true, dataIndex: "id"},
            {header: "งวดที่", align: "center", dataIndex: "i_seq", width: 10},
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
            {header: "จำนวน", dataIndex: "f_quan", width: 20, align: "right"},
            {header: "ก่อน VAT", dataIndex: "f_unit_cost", align: "right", width: 25},
            {header: "รวม VAT", dataIndex: "f_unit_cost_vat", align: "right", width: 25},
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
            baseParams: {mode: "LISTCREDITOR", i_read: user_right_read}, //Permission i_read
            idProperty: "id",
            totalProperty: "totalCount",
            fields: [
                {name: "no"},
                {name: "id", type: "int"},
                {name: "sp_tor_id", type: "int"},
                {name: "dc_creditor_id", type: "int"},
                {name: "f_total_amt", type: "string"},
                {name: "c_name", type: "string"},
                {name: "i_enable", type: "int"},
                {name: "dc_user_create_id"},
                {name: "dc_user_create_cost_id"},
                {name: "d_create"},
                {name: "dc_user_update_id"},
                {name: "dc_user_update_cost_id"},
                {name: "d_update"},
            ],
        }); //dc_creditor
        //เลขสัญญา
        Ext.store2 = new Ext.data.JsonStore({
            storeId: "myStore2",
            autoLoad: false,
            url: "tor/api/mnTorController.php",
            root: "data",
            baseParams: {mode: "LISTCREDITOR", i_read: user_right_read}, //Permission i_read
            idProperty: "id",
            totalProperty: "totalCount",
            fields: [
                {name: "no"},
                {name: "id"},
                {name: "creditor_name", type: "string"},
                {name: "c_name", type: "string"},
                {name: "d_doc_date", type: "string"},
                {name: "c_doc_ref", type: "string"},
                {name: "f_total_amt", type: "string"},
                {name: "i_enabled", type: "int"},
                {name: "dc_user_create_id"},
                {name: "dc_user_create_cost_id"},
                {name: "d_create"},
                {name: "dc_user_update_id"},
                {name: "dc_user_update_cost_id"},
                {name: "d_update"},
            ],
        });
        //งวด
        Ext.store3 = new Ext.data.JsonStore({
            storeId: "myStore3",
            autoLoad: false,
            url: "tor/api/mnTorController.php",
            root: "data",
            baseParams: {
                mode: "LISTHDRPERIOD",
                sp_tor_contract_id: Ext.SP_TOR_CONTRACT_ID,
                sp_po_id: Ext.SP_PO_ID,
            }, //Permission i_read
            idProperty: "id",
            totalProperty: "totalCount",
            fields: [
                {name: "no"},
                {name: "id"},
                {name: "dc_creditor_id"},
                {name: "dc_creditor_name"},
                {name: "sp_tor_contract_id", type: "string"},
                {name: "c_doc_ref_contract"},
                {name: "sp_po_id", type: "int"},
                {name: "i_period", type: "int"},
                {name: "f_total_amt", type: "string"},
                {name: "d_doc_date"},
                {name: "d_period_date"},
                {name: "i_day"},
                {name: "i_alert"},
                {name: "i_is_last"},
                {name: "i_is_null"},
                {name: "c_discription"},
            ],
        });
        //ของ

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
                {name: "no"},
                {name: "id"},
                {name: "sp_tor_dtl_period_id"},
                {name: "sp_tor_dtl_id"},
                {name: "dc_bg_budget_type_id"},
                {name: "po_expense_id"},
                {name: "i_period", type: "int"},
                {name: "c_code", type: "string"},
                {name: "c_name", type: "string"},
                {name: "dc_unit_type_id"},
                {name: "dc_unit_name", type: "string"},
                {name: "i_qty"},
                {name: "f_net_unit_price"}, // f_net_unit_price f_net_total_price
                {name: "f_net_total_price"}, // f_net_unit_price f_net_total_price
                {name: "i_qty_amt"}, //sum
                {name: "i_hire_type"},
                {name: "i_product_type"},
                {name: "i_is_inv"},
                {name: "f_total_amt"},
                {name: "c_comment_product", type: "string"},
                {name: "c_comment_asset", type: "string"},
                {name: "am_mode_id", type: "int"},
                {name: "inv_mode_id", type: "int"},
                {name: "i_enable", type: "int"},
                {name: "dc_user_create_id"},
                {name: "dc_user_create_cost_id"},
                {name: "d_create"},
                {name: "dc_user_update_id"},
                {name: "dc_user_update_cost_id"},
                {name: "d_update"},
            ],
        });

        var col4 = [
            new Ext.grid.RowNumberer({width: 35, header: " No ", dataIndex: "no"}),
            {header: "ID System", hidden: true, dataIndex: "id"},
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
            {header: "จำนวน", dataIndex: "i_qty", width: 20, align: "right"},
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
                id: "edit_dtl_period",
                header: "แก้ไข",
                sortable: false,
                align: "center",
                width: 10,
                dataIndex: "id",
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    if (record.data.sp_tor_dtl_id < 1) {
                        return '<img src="../images/icons/table_edit.png"); style="cursor:pointer"/>';
                    } else {
                        return "-";
                        // return '<img src="../images/icons/cross.png"); style="cursor:pointer"/>';
                    }
                },
            },
            {
                id: "delete_dtl_period",
                header: "ลบ",
                sortable: false,
                align: "center",
                width: 8,
                dataIndex: "id",
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    // if (record.data.sp_tor_dtl_id < 1 ?? 0 == 0)
                    return '<img src="../images/icons/table_delete.png"); style="cursor:pointer"/>';
                },
            },
            {width: 1, dataIndex: ""},
        ];
        var colPeriod = [
            new Ext.grid.RowNumberer({width: 35, header: " No ", dataIndex: "no"}),
            {header: "ID System", hidden: true, dataIndex: "id"},
            {
                header: "รายละเอียด",
                align: "left",
                dataIndex: "id",
                width: 100,
                id: "hdrPeriod",
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    return "<button>รายละเอียดของในงวด </button>";
                },
            },
            {header: "งวดที่", align: "center", width: 35, dataIndex: "i_period"},
            {
                header: "สถานะแจ้งเตือน",
                align: "center",
                width: 35,
                dataIndex: "i_is_last",
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    if (value == 1)
                        return "งวดสุดท้าย";
                    else
                        return "";
                },
            },
            {header: "วันที่ส่งมอบ", dataIndex: "d_period_date", align: "center"},
            {header: "จำนวนเงิน", dataIndex: "f_total_amt", align: "right"},
            {
                header: "สถานะ",
                dataIndex: "id",
                align: "center",
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
                header: "แก้ไข",
                align: "center",
                width: 35,
                dataIndex: "i_period",
                id: "i_peridEdit",
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    if (record.get("i_status") == 2) {
                        return "";
                    } else {
                        return '<img src="../images/icons/table_edit.png"); style="cursor:pointer"/>';
                    }
                },
            },
            {
                header: "ลบ",
                align: "center",
                width: 35,
                dataIndex: "i_period",
                id: "i_peridDel",
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    if (record.get("i_status") == 2) {
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
        var ColumGridPop = [
            {header: "ID System", sortable: true, hidden: true, dataIndex: "id"},
            {header: "รหัส", sortable: true, dataIndex: "c_code"},
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
        var storeBank = new Ext.data.JsonStore({
            autoLoad: true,
            storeId: "myStoreCost",
            url: "api/All_ArCombo.php",
            baseParams: {type: "storeBank"},
            root: "data",
            idProperty: "id",
            totalProperty: "totalCount",
            fields: ["no", "id", "c_code", "c_name"],
        });
        var PopBank = new Ext.ux.Poplov({
            text: "ชื่อธนาคาร",
            id: "dc_bank_idID", //go to relation
            iconCls: "page_magnify",
            valueHidden: "dc_bank_id", //go to hidden
            store: storeBank,
            headerGrid: ColumGridPop,
            widthText: 280,
            fieldLabel: "ชื่อธนาคาร ",
            //listeners   : {'render' : function(p){ this.hide(); } }
        });
        Ext.poFormID = "win-frm-xxx001";
        return new Ext.Window({
            collapsible: true,
            maximizable: true,
            title: Ext.title,
            id: Ext.poFormID,
            width: 1200,
            height: 500,
            layout: "fit",
            modal: true,
            plain: true,
            items: [
                {
                    xtype: "tabpanel",
                    activeTab: 0,
                    id: "winChequeID",
                    // defaults: {autoHeight: true, bodyStyle: 'padding:10px'},
                    items: [
                        //--รายละเอียด TOR
                        new Ext.FormPanel({
                            title: "รายละเอียดการลงนามในสัญญา",
                            id: "tap_main",
                            iconCls: "icon-start",
                            columnWidth: 1,
                            url: "tor/api/mnTorController.php",
                            frame: true,
                            autoScroll: true,
                            labelAlign: "left",
                            bodyStyle: "padding:1px",
                            labelWidth: 200,
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
                                                    name: "sp_tor_contract_id",
                                                    id: "sp_tor_contract_id",
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
                                                    fieldLabel: "เรื่อง/โครงการ",
                                                    name: "c_name", width: 300,
                                                },
                                                {
                                                    xtype: "datefield",
                                                    fieldLabel: "วันที่ใบสั่ง ",
                                                    id: "d_po_dateID",
                                                    name: "d_po_date",
                                                    width: 150,
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
                                                    xtype: "displayfield",
                                                    fieldLabel: "จำนวนเงิน",
                                                    name: "f_total_amt",
                                                    id: "f_totalID",

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
                                                    xtype: "textfield",
                                                    fieldLabel: " เลขที่เอกสารใบสั่งซื้อ/สั่งจ้าง/สั่งเช่า",
                                                    id: "c_po_noID",
                                                    name: "c_po_no",
                                                    width: 150,
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
                                                            value: 1,
                                                            validator: function (val) {
                                                                var regex = /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\.[0-9]{1,2})?$/;
                                                                var strMoney = val.replace(",", "");
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
                                            columnWidth: 0.4,
                                            layout: "table",
                                        },
                                    ],
                                },
                            ],
                        }),
                        //รายละเอียดงวดงาน
                        {
                            title: "ข้อมูลงวดงาน ",
                            frame: true,
                            autoScroll: true,
                            id: "tabpanelMain2ID",
                            iconCls: "icon-contract",
                            layout: "form", //form
                            border: false,
                            viewConfig: {forceFit: true},
                            items: [
                                {
                                    labelStyle: "padding: 10px 10px;",
                                    fieldLabel: "เลขที่สัญญา",
                                    xtype: "displayfield",
                                    id: "DISPLAY_c_name_hdr_period",
                                    name: "c_name",
                                },
                                {
                                    labelStyle: "padding: 10px 10px;",
                                    fieldLabel: "คู่สัญญา",
                                    xtype: "displayfield",
                                    id: "DISPLAY_creditor_name_hdr_period",
                                    name: "creditor_name",
                                },
                                {
                                    labelStyle: "padding: 10px 10px;",
                                    fieldLabel: "วันที่ในสัญญา",
                                    xtype: "displayfield",
                                    id: "DISPLAY_creditor_d_doc_date_hdr_period",
                                    name: "d_doc_date",
                                },
                                {
                                    labelStyle: "padding: 10px 10px;",
                                    fieldLabel: "วงเงินในสัญญา",
                                    xtype: "displayfield",
                                    id: "DISPLAY_creditor_f_total_amt_hdr_period",
                                    name: "f_total_amt",
                                },
                                {
                                    xtype: "hidden",
                                    name: "id",
                                },
                                {
                                    xtype: "hidden",
                                    name: "sp_tor_id",
                                },
                                {
                                    xtype: "grid",
                                    id: "gridSub3ID",
                                    border: false,
                                    stripeRows: true,
                                    loadMask: true,
                                    // autoHeight: true,
                                    height: 500,
                                    store: Ext.store3,
                                    tbar: [
                                        {
                                            xtype: "button",
                                            iconCls: "icon-add",
                                            text: "เพิ่มงวดงานในสัญญา",
                                            handler: function () {
                                                Ext.SP_TOR_HDR_PERIOD_ID = null;
                                                Ext.selectRow_PeridHdr = null;
                                                win_hdr_period("ADD");
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
                                                                Ext.getCmp("tabpanelMain3ID").setTitle("วันส่งมอบ " + rec.get("d_period_date") + "  งวดที่ " + rec.get("i_period"));
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
                                                if (columnIndex === grid.getColumnModel().getIndexById("hdrPeriod")) {
                                                    controller(record, "view"); //on
                                                    Ext.getCmp("DISPLAY_c_name_dtl_period").setValue(record.data.c_doc_ref_contract);
                                                    Ext.getCmp("DISPLAY_creditor_name_dtl_period").setValue(record.data.dc_creditor_name);
                                                    Ext.getCmp("DISPLAY_creditor_d_doc_date_dtl_period").setValue(record.data.d_period_date);
                                                    Ext.getCmp("DISPLAY_creditor_f_total_amt_dtl_period").setValue(record.data.f_total_amt);
                                                    Ext.getCmp("winChequeID").unhideTabStripItem(2);

                                                }
                                                var record = grid.getStore().getAt(rowIndex);
                                                if (columnIndex === grid.getColumnModel().getIndexById("i_peridEdit")) {
                                                    Ext.selectRow_PeridHdr = record;
                                                    Ext.SP_TOR_HDR_PERIOD_ID = record.data.id;
                                                    win_hdr_period("EDIT");
                                                }
                                                if (columnIndex === grid.getColumnModel().getIndexById("i_peridDel")) {
                                                    Ext.SP_TOR_HDR_PERIOD_ID = record.data.id;
                                                    delete_htl_period();
                                                }
                                            };
                                        },
                                        afterrender: function () {
                                            Ext.getCmp("gridSub3ID").on("cellclick", this.thisCick, this);
                                        },
                                    },
                                    viewConfig: {forceFit: true},
                                },
                            ],
                            bbar: [
                                "->",
                                {
                                    id: "buBackSub2ID",
                                    xtype: "button",
                                    iconCls: "icon-back",
                                    text: "ย้อนกลับ",
                                    handler: function () {
                                        Ext.getCmp("winChequeID").setActiveTab(0);
                                    },
                                },
                            ],
                        },
                        {
                            title: "ข้อมูลรายละเอียดของในงวด",
                            iconCls: "icon-detail",
                            id: "tabpanelMain3ID",
                            layout: "form", //form
                            frame: true,
                            autoScroll: true,
                            border: false,
                            viewConfig: {forceFit: true},
                            labelWidth: 175,
                            items: [
                                {
                                    labelStyle: "padding: 10px 10px;",
                                    fieldLabel: "เลขที่สัญญา",
                                    xtype: "displayfield",
                                    id: "DISPLAY_c_name_dtl_period",
                                    name: "c_name",
                                },
                                {
                                    labelStyle: "padding: 10px 10px;",
                                    fieldLabel: "คู่สัญญา",
                                    xtype: "displayfield",
                                    id: "DISPLAY_creditor_name_dtl_period",
                                    name: "creditor_name",
                                },
                                {
                                    labelStyle: "padding: 10px 10px;",
                                    fieldLabel: "วันที่กำหนดส่งในงวดงาน",
                                    xtype: "displayfield",
                                    id: "DISPLAY_creditor_d_doc_date_dtl_period",
                                    name: "d_doc_date",
                                },
                                {
                                    labelStyle: "padding: 10px 10px;",
                                    fieldLabel: "วงเงินในงวด",
                                    xtype: "displayfield",
                                    id: "DISPLAY_creditor_f_total_amt_dtl_period",
                                    name: "f_total_amt",
                                },
                                {
                                    xtype: "hidden",
                                    name: "id",
                                },
                                {
                                    xtype: "hidden",
                                    name: "sp_tor_id",
                                },
                                {
                                    xtype: "grid",
                                    id: "gridSub4ID",
                                    border: false,
                                    stripeRows: true,
                                    loadMask: true,
                                    height: 500,
                                    tbar: [
                                        {
                                            xtype: "button",
                                            iconCls: "icon-add",
                                            text: "เพิ่ม/แก้ไข ของในงวดงานตาม PR",
                                            handler: function () {
                                                Ext.store5.setBaseParam("dc_creditor_id", Ext.DC_CREDITOR_ID);
                                                Ext.store5.setBaseParam("sp_tor_hdr_period_id", Ext.SP_TOR_HDR_PERIOD_ID);
                                                Ext.store5.setBaseParam("sp_tor_id", Ext.SP_TOR_ID);
                                                Ext.store5.load({
                                                    callback: function (rec, operation, success) {
                                                        if (success) {
                                                        }
                                                    },
                                                });

                                                gridDetail();
                                            },
                                        },
                                        "",
                                        {
                                            xtype: "button",
                                            iconCls: "icon-add",
                                            text: "เพิ่มของในงวดงานไม่มีใน PR",
                                            handler: function () {
                                                Ext.selectRow_PeridDtl = null;
                                                Ext.SP_TOR_DTL_PERIOD_ID = null;
                                                win_dtl_period("ADD");
                                            },
                                        },
                                    ],
                                    store: Ext.store4,
                                    columns: col4,
                                    listeners: {
                                        beforerender: function () {
                                            this.thisCick = function (grid, rowIndex, columnIndex, e) {
                                                var record = grid.getStore().getAt(rowIndex);
                                                if (columnIndex === grid.getColumnModel().getIndexById("edit_dtl_period")) {
                                                    Ext.selectRow_PeridDtl = record;
                                                    if (record.data.sp_tor_dtl_id < 1) {
                                                        Ext.SP_TOR_DTL_PERIOD_ID = record.data.sp_tor_dtl_period_id;
                                                        win_dtl_period("EDIT");
                                                    } else {
                                                        // Ext.Msg.alert("แจ้งเตือน", "ไม่สามารถแก้ไขได้<br>เนื่องจากเป็นรายการจาก Tor");
                                                    }
                                                }
                                                if (columnIndex === grid.getColumnModel().getIndexById("delete_dtl_period")) {
                                                    Ext.SP_TOR_DTL_PERIOD_ID = record.data.sp_tor_dtl_period_id;
                                                    delete_dtl_period();
                                                }
                                            };
                                        },
                                        afterrender: function () {
                                            Ext.getCmp("gridSub4ID").on("cellclick", this.thisCick, this);
                                        },
                                    },
                                    viewConfig: {forceFit: true},
                                },
                            ],
                            bbar: [
                                "->",
                                new Ext.Panel({
                                    layout: "form",
                                    width: 300,
                                    bodyStyle: "padding-right:10px",
                                    items: [
                                        {
                                            xtype: "displayfield",
                                            id: "bbf_qty4ID",
                                            fieldLabel: "จำนวน",
                                            style: "color:blue;float:right; text-align: right;",
                                        },
                                        {
                                            xtype: "displayfield",
                                            id: "bbf_total_price4ID",
                                            fieldLabel: "ราคารวม",
                                            style: "color:blue;text-align: right; font-weight:bold; ",
                                        },
                                    ],
                                    buttons: [
                                        {
                                            id: "buSaveSub3ID",
                                            iconCls: "icon-save",
                                            text: "บันทึกงวด",
                                            handler: function () {
                                                Ext.Msg.alert("บันทึกงวด", "รายการทำการส่งงวดเพื่อรอตรวจรับ", function (form, action) {
                                                    return Ext.getCmp("winChequeID").setActiveTab(1);
                                                });
                                            },
                                        },
                                        {
                                            id: "buBackSub3ID",
                                            iconCls: "icon-back",
                                            text: "ย้อนกลับ",
                                            handler: function () {
                                                Ext.getCmp("winChequeID").setActiveTab(1);
                                            },
                                        },
                                    ],
                                }),
                            ],
                        },
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
        menu
                .add({
                    text: "ค้นหาข้อมูล",
                    icon: "../images/icons/book_magnify.png",
                })
                .on(
                        "click",
                        (click = function () {
                            //             Ext.loadStore("add", false); // app,data.load
                        })
                        );
        //  เพิ่มข้อมูล
        menu
                .add({
                    text: "เพิ่มข้อมูล",
                    icon: "../images/icons/add.png",
                })
                .on(
                        "click",
                        (click = function () {
                            Ext.loadStore("add", false); // app,data.load
                        })
                        );

        // แก้ไขข้อมูล
        menu
                .add({
                    text: "จัดการข้อมูล View/Copy/Edit/Delete",
                    icon: "../images/icons/application_edit.png",
                })
                .on(
                        "click",
                        (click = function () {
                            Ext.loadStore("edit", true); // app,data.load
                        })
                        );
        //   แก้ไขข้อมูลผ่าน
        if (editm === true) {
            menu
                    .add({
                        text: "แก้ไขข้อมูลผ่าน Data Grid",
                        icon: "../images/icons/application_form_add.png",
                    })
                    .on(
                            "click",
                            (click = function () {
                                Ext.gridMainfn(true);
                            })
                            );
            // ยกเลิก
            menu
                    .add({
                        text: "ยกเลิกการแก้ไขฝ่าน Data Grid",
                        icon: "../images/icons/application_form_delete.png",
                    })
                    .on(
                            "click",
                            (click = function () {
                                Ext.gridMainfn(false);
                            })
                            );
        }
        tb.doLayout();
        return tb;
    }; //MenuButton
    Ext.gridMainfn = function (editAbled) {
        if (!Ext.isEmpty(Ext.getCmp("tabpanel1")))
            Ext.getCmp("contenterCenter").remove(Ext.getCmp("tabpanel1"), true) || {};

        var gridMains = new gridMain();
        Ext.getCmp("contenterCenter").add(gridMains);
        Ext.getCmp("contenterCenter").setActiveTab(gridMains);
        Ext.getCmp("tabpanel1").on("beforeedit", function () {
            return editAbled;
        });
        if (editAbled)
            Ext.getCmp("buSaveGridID").show();
        else
            Ext.getCmp("buSaveGridID").hide();
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
                        /*console.log('Loading...');*/
                    },
                    listeners: {
                        afterrender: function (obj, eOpts) {
                            /*console.log('Load Finish');*/
                        },
                    },
                    fn: function () {},
                    id: "frm-grid-searchID",
                    frame: true,
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

                                    //console.log(JSON.stringify(jsonArr));
                                    //console.log(jsonArr);
                                    //TODO @ setGridDirty to idCmp
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
            height: 125,
            layout: "fit",
            //                     modal: true,
            plain: true,
            bodyStyle: "padding:5px;",
            buttonAlign: "center",

            items: [
                {
                    layout: "column",
                    border: false,
                    defauls: {background: "#eee"},
                    items: [
                        {
                            columnWidth: 0.5,
                            layout: "form",
                            border: false,
                            items: [
                                {
                                    xtype: "textfield",
                                    fieldLabel: "เลขที่สัญญาย่อย",
                                    id: "sc_codeID", // sd_tor_dateID sc_codeID sc_nameID searchEnabledID
                                    name: "c_code",
                                },
                                        // {
                                        //     xtype: "datefield",
                                        //     fieldLabel: "วันที่ TOR",
                                        //     id: "sd_tor_dateID",
                                        //     name: "d_tor_date",
                                        // },
                                        // {
                                        //     xtype: "radiogroup",
                                        //     columns: [120],
                                        //     fieldLabel: "ผ่านรายการ",
                                        //     id: "searchPostID",
                                        //     items: [
                                        //         {
                                        //             name: "i_post",
                                        //             checked: true,
                                        //             inputValue: 0,
                                        //             boxLabel: "ทั้งหมด",
                                        //         },
                                        //         {
                                        //             name: "i_post",
                                        //             inputValue: 1,
                                        //             boxLabel: "ผ่านรายการแล้ว",
                                        //         },
                                        //         {
                                        //             name: "i_post",
                                        //             inputValue: 2,
                                        //             boxLabel: "ยังไม่ผ่านรายการ",
                                        //         },
                                        //     ], //radiogroup
                                        // },
                            ],
                        },
                        {
                            columnWidth: 0.5,
                            layout: "form",
                            border: false,
                            items: [
                                {
                                    xtype: "textfield",
                                    fieldLabel: "เรื่อง",
                                    id: "sc_nameID",
                                    name: "c_name",
                                },
                                        // new Ext.form.ComboBox({
                                        //     mode: "local",
                                        //     store: new Ext.data.JsonStore({
                                        //         autoDestroy: false,
                                        //         autoLoad: false,
                                        //         url: "api/All_spAlert.php",
                                        //         baseParams: {
                                        //             type: "sp_type_status",
                                        //             i_is_type_tor: true,
                                        //             all: "all",
                                        //         },
                                        //         root: "data",
                                        //         idProperty: "id",
                                        //         fields: ["id", "c_name"],
                                        //     }),
                                        //     anchor: "100%",
                                        //     fieldLabel: "วิธีดำเนินงาน",
                                        //     submitValue: true,
                                        //     hiddenName: "stor_type_id",
                                        //     name: "sc_type_id",
                                        //     id: "stor_type_idID",
                                        //     valueField: "id",
                                        //     displayField: "c_name",
                                        //     triggerAction: "all",
                                        //     forceSelection: false,
                                        //     selectOnFocus: true,
                                        //     typeAhead: false,
                                        //     emptyText: "กรุณาเลือก",
                                        //     listeners: {
                                        //         afterrender: function () {
                                        //             //setLoad&&callback
                                        //             this.store.load({
                                        //                 callback: function (record, operation, success) {
                                        //                     if (success) {
                                        //                         Ext.getCmp("stor_type_idID").setValue(this.data.items[0].get("c_name"));
                                        //                     }
                                        //                 },
                                        //             });
                                        //         },
                                        //     },
                                        // }),
                                        // {
                                        //     xtype: "radiogroup",
                                        //     columns: [80, 90],
                                        //     fieldLabel: "สถานะการใช้งาน",
                                        //     id: "searchEnabledID",
                                        //     items: [
                                        //         {
                                        //             name: "i_enabled",
                                        //             checked: true,
                                        //             inputValue: 1,
                                        //             boxLabel: "ใช้งาน",
                                        //         },
                                        //         {
                                        //             name: "i_enabled",
                                        //             inputValue: 2,
                                        //             boxLabel: "ไม่ใช้งาน",
                                        //         },
                                        //     ], //radiogroup
                                        // },
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
                                // Ext.storeDtl.setBaseParam("d_tor_date", Ext.getCmp("sd_tor_dateID").getValue());
                                // Ext.storeDtl.setBaseParam("tor_type_id", Ext.getCmp("stor_type_idID").getValue());

                                Ext.storeDtl.setBaseParam("c_code", Ext.getCmp("sc_codeID").getValue());
                                Ext.storeDtl.setBaseParam("c_name", Ext.getCmp("sc_nameID").getValue());
                                // Ext.storeDtl.setBaseParam("i_enabled", Ext.getCmp("searchEnabledID").getValue().inputValue);
                                // Ext.storeDtl.setBaseParam("i_post", Ext.getCmp("searchPostID").getValue().inputValue);

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
                    {header: "เลขที่สัญญาย่อย", align: "left", dataIndex: "c_code", width: 150},
                    {
                        header: "",
                        sortable: false,
                        align: "center",
                        dataIndex: "d_period_date",
                        id: "processDueID",
                        width: 90,
                        renderer: function (value, metaData, record, row, col, store, gridView) {
                            metaData.attr = "style='cursor:pointer; text-align:center;';";
                            //...
                            if (record.data.i_is_status == 1) {
                                return '<img src="../images/icons/application_view_tile.png"); style="cursor:pointer"/>';
                            } else if (record.data.i_is_status > 1) {
                                return '<img src="../images/icons/application_go.png" style="cursor:pointer"/>';
                            }
                        },
                    },
                    {header: "เรื่อง ", align: "left", dataIndex: "c_name", width: 200},
                    {
                        header: "เลขอ้างอิง",
                        align: "left",
                        dataIndex: "c_doc_ref",
                        width: 150,
                    },
                    {
                        header: "วันที่บันทึก",
                        dataIndex: "d_due_date",
                        width: 100,
                        align: "center",
                        renderer: function (value, metaData, record, row, col, store, gridView) {
                            if (value != "") {
                                return shortThaiDate(value);
                            } else {
                                return "";
                            }
                        },
                    },
                    {header: "วงเงินใน PO", dataIndex: "f_total_amt", align: "right", width: 120},
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
                    },
                    {
                        header: "หน่วยงานแก้ไขรายการ",
                        sortable: false,
                        align: "center",
                        dataIndex: "dc_user_update_cost_id",
                    },
                    {
                        header: "วันที่แก้ไขรายการ",
                        sortable: false,
                        align: "center",
                        dataIndex: "d_update",
                        renderer: function (val, metaData, record, rowIndex, colIndex, store) {
                            return shortThaiDate(val);
                        },
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
                            xtype: "button",
                            text: " ค้นหา ",
                            width: 80,
                            iconCls: "icon-application-view-list",
                            handler: function () {
                                if (!Ext.isEmpty(Ext.getCmp("winSearchFrm")))
                                    Ext.getCmp("winSearchFrm").destroy();
                                var s1 = SearchFrm();
                                s1.show();
                            },
                        },
                    ],
                    layout: "fit",
                    clicksToEdit: 2,
                    viewConfig: {
                        emptyText: "ไม่มีข้อมูล..",
                        deferEmptyText: true,
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
                            if (g.rowIdx == 1)
                                return false;
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
                                    {
                                        text: "เพิ่มข้อมูล",
                                        icon: "../images/icons/add.png",
                                        handler: function (e) {
                                            Ext.loadStore("add", true); // app,data.load
                                        },
                                        scope: this,
                                    },
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
                                            //field
                                            var arrDataCopy = ["c_detail", "c_code_ref", "po_creditor_name"];
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
                        afterrender: function (g) {
                            //g.getStore().getAt(rowIndex);
                            //  console.log();

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
                             CopyToClipboard(rowx, arrDataCopy);
                             
                             }
                             }]);
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

    //Class Extend
    formAdd = function () {
        saveHdr = function () {
            var msg = "";

            var i_is_start_from_contract = Ext.getCmp("i_is_start_from_contract").getValue().inputValue;

            if (Ext.getCmp("i_year").getValue() == "") {
                msg += "- กรุณาเลือก ปีขอจัดซื้อ<br>";
            }
            if (Ext.BG_TYPE == 1) {
                // งบทำการ
            } else if (Ext.BG_TYPE == 2) {
                // งบลงทุน
                if (Ext.getCmp("bg_hdr_id").getValue() == "") {
                    msg += "- กรุณาเลือก จัดซื้อ/จัดจ้างใน<br>";
                }
            } else if (Ext.BG_TYPE == 3) {
                // งบสำรองเร่งด่วน
                if (Ext.getCmp("dc_bg_obj_id").getValue() == "") {
                    msg += "- กรุณาเลือก วัตถุประสงค์<br>";
                }
                if (Ext.getCmp("dc_bg_cap_id").getValue() == "") {
                    msg += "- กรุณาเลือก ส่วนงาน<br>";
                }
            }
            if (Ext.getCmp("d_doc_date").getValue() == "" || Ext.getCmp("d_doc_date").getValue() == null) {
                msg += "- กรุณากรอก วันที่อนุมัติ<br>";
            }
            if (Ext.getCmp("ap_process_type_id").getValue() == "" || Ext.getCmp("ap_process_type_id").getValue() == null) {
                msg += "- กรุณากรอก วิธี<br>";
            }
            if (Ext.getCmp("i_is_doc").getValue().inputValue == 1) {
                if (Ext.getCmp("c_doc_no").getValue() == "") {
                    msg += "- กรุณากรอก เลขที่เอกสารใบสั่งซื้อ/สั่งจ้าง/สั่งเช่า<br>";
                }
                if (Ext.getCmp("d_doc_no_date").getValue() == "") {
                    msg += "- กรุณากรอก วันที่ใบสั่ง<br>";
                }
                if (i_is_start_from_contract == 0 || i_is_start_from_contract == 1) {
                    msg += "- กรุณาเลือก นับถัดจาก/นับตั้งแต่<br>";
                }
            } else {
                if (Ext.getCmp("c_doc_resp_no").getValue() == "") {
                    msg += "- กรุณากรอก เลขที่เอกสารรับสนองราคา<br>";
                }
                if (Ext.getCmp("d_doc_resp_date").getValue() == "") {
                    msg += "- กรุณากรอก วันที่รับสนองราคา<br>";
                }
                if (i_is_start_from_contract == 2) {
                    msg += "- กรุณาเลือก นับถัดจาก/นับตั้งแต่<br>";
                }
            }
            if (Ext.getCmp("c_name").getValue() == "") {
                msg += "- กรุณากรอก เรื่อง<br>";
            }
            if (Ext.getCmp("i_delivery").getValue() == "") {
                msg += "- กรุณากรอก กำหนดส่งภายใน<br>";
            }
            if (Ext.getCmp("dc_cost_id").getValue() == "" || Ext.getCmp("dc_cost_id").getValue() == null) {
                msg += "- กรุณากรอก หน่วยงานเจ้าของเรื่อง<br>";
            }

            if (msg == "") {
                Ext.getCmp("frm-Add").getEl().mask("Please wait...", "x-mask-loading");
                Ext.Ajax.request({
                    url: "api/mn_ApPoHdr.php",
                    method: "POST",
                    params: {
                        mode: Ext.getCmp("role-form-mode").getValue(),
                        BG_TYPE: Ext.BG_TYPE,
                        id: Ext.getCmp("id").getValue(),
                        dc_bg_type_id: Ext.BG_TYPE, // 1 = งบทำการ, 2 = งบลงทุน, 3 = งบสำรองเร่งด่วน
                        bg_hdr_id: Ext.BG_TYPE == 2 ? Ext.getCmp("bg_hdr_id").getValue() : null,
                        dc_bg_obj_id: Ext.BG_TYPE == 3 ? Ext.getCmp("dc_bg_obj_id").getValue() : null,
                        dc_bg_cap_id: Ext.BG_TYPE == 3 ? Ext.getCmp("dc_bg_cap_id").getValue() : null,
                        i_is_import: Ext.BG_TYPE == 3 ? Ext.getCmp("i_is_import").getValue().inputValue : null,
                        i_year: Ext.BG_TYPE == 3 ? (Ext.getCmp("i_type_year").getValue().inputValue == 1 ? Ext.getCmp("i_year").getValue() - 1 : Ext.getCmp("i_year").getValue()) : Ext.getCmp("i_year").getValue(),
                        i_is_purchase: Ext.getCmp("i_is_purchase").getValue().inputValue,
                        d_doc_date: Ext.util.Format.date(Ext.getCmp("d_doc_date").getValue(), "Y-m-d"),
                        ap_process_type_id: Ext.getCmp("ap_process_type_id").getValue(),
                        i_is_doc: Ext.getCmp("i_is_doc").getValue().inputValue,
                        i_is_start_from_contract: i_is_start_from_contract,
                        another_detail: i_is_start_from_contract == 3 ? Ext.getCmp("another_detail").getValue() : null,
                        i_is_fine: Ext.getCmp("i_is_fine").getValue().inputValue,
                        i_fine_per: Ext.getCmp("i_is_fine").getValue().inputValue == 1 ? Ext.getCmp("i_fine_per").getValue().replace(/,/g, "") : null,
                        i_fine_amt: Ext.getCmp("i_is_fine").getValue().inputValue == 2 ? Ext.getCmp("i_fine_amt").getValue().replace(/,/g, "") : null,
                        c_name: Ext.getCmp("c_name").getValue(),
                        c_doc_no: Ext.getCmp("i_is_doc").getValue().inputValue == 1 ? Ext.getCmp("c_doc_no").getValue() : null,
                        d_doc_no_date: Ext.getCmp("i_is_doc").getValue().inputValue == 1 ? Ext.util.Format.date(Ext.getCmp("d_doc_no_date").getValue(), "Y-m-d") : null,
                        c_doc_resp_no: Ext.getCmp("i_is_doc").getValue().inputValue == 2 ? Ext.getCmp("c_doc_resp_no").getValue() : null,
                        d_doc_resp_date: Ext.getCmp("i_is_doc").getValue().inputValue == 2 ? Ext.util.Format.date(Ext.getCmp("d_doc_resp_date").getValue(), "Y-m-d") : null,
                        i_delivery: Ext.getCmp("i_delivery").getValue().replace(/,/g, ""),
                        dc_cost_id: Ext.getCmp("dc_cost_id").getValue(),
                        c_reason_for_po: Ext.getCmp("c_reason_for_po").getValue(),
                        c_comment: Ext.getCmp("c_comment").getValue(),
                        i_is_inv: Ext.BG_TYPE == 2 ? 0 : Ext.getCmp("i_is_inv").getValue() ? 1 : 0,
                    },
                    success: function (result, request) {
                        Ext.getCmp("frm-Add").getEl().unmask();
                        var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                        if (jsonData.success == true) {
                            Ext.store.load({params: {mode: ""}});
                            Ext.Msg.alert("แจ้งเตือน", "บันทึกเรียบร้อย");
                            Ext.getCmp("id").setValue(jsonData.ap_po_hdr_id);
                            Ext.getCmp("role-form-mode").setValue("EDIT");
                            //							Ext.getCmp("GENCODE").show();
                            boxDetail1(jsonData.ap_po_hdr_id, jsonData.i_is_purchase);
                            boxDetail2(jsonData.ap_po_hdr_id);
                            boxDetail3({ap_po_hdr_id: jsonData.ap_po_hdr_id, i_is_purchase: jsonData.i_is_purchase});
                            boxDetail4({ap_po_hdr_id: jsonData.ap_po_hdr_id});
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
        /*
         formAdd.superclass.constructor.call(this, {
         region: "center",
         title: "ข้อมูล" + title_panel,
         id: "frm-Add",
         border: false,
         stripeRows: true,
         loadMask: true,
         listeners: {
         afterrender: function(obj, eOpts) {}
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
         title: "บันทึกข้อมูล " + title_panel,
         RemoveCls: "x-box-item",
         collapsible: true,
         collapsed: false,
         defaults: { labelStyle: "width:200px;", allowBlank: true },
         items: [
         {
         xtype: "hidden",
         id: "role-form-mode",
         name: "mode",
         readOnly: true
         },
         {
         xtype: "hidden",
         id: "id",
         name: "id",
         readOnly: true
         },
         {
         xtype: "displayfield",
         fieldLabel: "ประเภทงบประมาณ",
         value: "<b>" + title_panel + "</b>"
         },
         new Ext.form.ComboBox({
         fieldLabel: "ปีขอจัดซื้อ",
         id: "i_year",
         name: "i_year",
         width: 200,
         mode: "local",
         store: Ext.store_year,
         valueField: "id",
         displayField: "c_name",
         triggerAction: "all",
         forceSelection: true,
         selectOnFocus: true,
         typeAhead: false,
         emptyText: "กรุณาเลือก...",
         value: new Date().getFullYear(),
         listeners: {
         afterrender: function() {
         this.fn = function(chk = true) {
         var val = this.getValue();
         if (val == "") {
         this.reset();
         }
         if (Ext.BG_TYPE == 2) {
         // งบลงทุน
         Ext.getCmp("frm-Add")
         .getEl()
         .mask("Please wait...", "x-mask-loading");
         Ext.bg_hdr.setBaseParam("i_year", val);
         Ext.bg_hdr.load({
         callback: function(records, operation, success) {
         if (success == true) {
         Ext.getCmp("frm-Add")
         .getEl()
         .unmask();
         if (chk == true) {
         Ext.getCmp("bg_hdr_id").setValue("");
         } else {
         Ext.getCmp("bg_hdr_id").setValue(Ext.getCmp("bg_hdr_id").getValue());
         }
         Ext.getCmp("bg_hdr_id").fn(chk);
         }
         }
         });
         } else if (Ext.BG_TYPE == 3) {
         // งบสำรองเร่งด่วน
         if (val == "") {
         val = new Date().getFullYear();
         }
         var index_id = Ext.storeBgYear.findExact("yearPre", "" + val + "");
         var rec = Ext.storeBgYear.data.items[index_id];
         
         var f_amtOld = floatRenderer(floatMinus(rec.get("f_amtOld").replace(/,/g, ""), 2));
         var f_amtPre = floatRenderer(floatMinus(rec.get("f_amtPre").replace(/,/g, ""), 2));
         
         Ext.select("#yearOld").update("งบประมาณปี " + (parseInt(rec.get("yearOld")) + 543) + " <font color=red>(วงเงินงบประมาณสำรองเร่งด่วนคงเหลือ = " + f_amtOld + " บาท)</font>");
         Ext.select("#yearPre").update("งบประมาณปี " + (parseInt(rec.get("yearPre")) + 543) + " <font color=red>(วงเงินงบประมาณสำรองเร่งด่วนคงเหลือ = " + f_amtPre + " บาท)</font>");
         }
         };
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
         new Ext.form.ComboBox({
         fieldLabel: "จัดซื้อ/จัดจ้างใน",
         id: "bg_hdr_id",
         name: "bg_hdr_id",
         width: 500,
         mode: "local",
         store: Ext.bg_hdr,
         valueField: "id",
         displayField: "c_name",
         triggerAction: "all",
         forceSelection: true,
         selectOnFocus: true,
         typeAhead: false,
         emptyText: "กรุณาเลือก...",
         hidden: Ext.BG_TYPE == 2 ? false : true,
         listeners: {
         afterrender: function() {
         this.fn = function(chk = true) {
         var val = this.getValue();
         if (val == "") {
         this.reset();
         
         Ext.getCmp("cost_name").setValue("");
         Ext.getCmp("f_amount").setValue("");
         Ext.getCmp("f_res").setValue("");
         Ext.getCmp("sum_bg").setValue("");
         Ext.getCmp("obj_name").setValue("");
         Ext.getCmp("cap_name").setValue("");
         Ext.getCmp("i_year_start").setValue("");
         Ext.getCmp("i_year_end").setValue("");
         Ext.getCmp("dc_cost_id").setValue("");
         } else {
         var index_id = this.getStore().findExact("id", val);
         var rec = this.getStore().data.items[index_id];
         
         Ext.getCmp("cost_name").setValue(rec.get("cost_name"));
         Ext.getCmp("f_amount").setValue(rec.get("f_amount"));
         Ext.getCmp("f_res").setValue(rec.get("f_res"));
         Ext.getCmp("sum_bg").setValue(rec.get("sum_bg"));
         Ext.getCmp("obj_name").setValue(rec.get("obj_name"));
         Ext.getCmp("cap_name").setValue(rec.get("cap_name"));
         Ext.getCmp("i_year_start").setValue(parseInt(rec.get("i_year_start")) + 543);
         Ext.getCmp("i_year_end").setValue(parseInt(rec.get("i_year_end")) + 543);
         if (chk == true) {
         Ext.getCmp("dc_cost_id").setValue(rec.get("dc_cost_id"));
         }
         
         if (rec.get("i_is_import") == 1) {
         Ext.getCmp("i_is_import1").setValue(true);
         } else if (rec.get("i_is_import") == 2) {
         Ext.getCmp("i_is_import2").setValue(true);
         } else if (rec.get("i_is_import") == 3) {
         Ext.getCmp("i_is_import3").setValue(true);
         }
         
         Ext.getCmp("f_amount").fn();
         Ext.getCmp("f_res").fn();
         Ext.getCmp("sum_bg").fn();
         }
         };
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
         {
         xtype: "displayfield",
         id: "cost_name",
         fieldLabel: "หน่วยงานเจ้าของงบประมาณ",
         hidden: Ext.BG_TYPE == 2 ? false : true
         },
         new Ext.form.CompositeField({
         fieldLabel: "วงเงินงบประมาณตามแผน",
         anchor: "100%",
         msgTarget: "under",
         hidden: Ext.BG_TYPE == 2 ? false : true,
         items: [
         new Ext.form.TextField({
         id: "f_amount",
         name: "f_amount",
         style: "text-align: right; color: blue; font-weight: bolder;",
         width: 200,
         readOnly: true,
         listeners: {
         afterrender: function() {
         this.fn = function() {
         this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
         };
         },
         Change: function(value) {
         this.fn();
         }
         }
         }),
         { xtype: "displayfield", value: "บาท" }
         ]
         }),
         new Ext.form.CompositeField({
         fieldLabel: "สำรองราคา",
         anchor: "100%",
         msgTarget: "under",
         hidden: Ext.BG_TYPE == 2 ? false : true,
         items: [
         new Ext.form.TextField({
         id: "f_res",
         name: "f_res",
         style: "text-align: right; color: blue; font-weight: bolder;",
         width: 200,
         readOnly: true,
         listeners: {
         afterrender: function() {
         this.fn = function() {
         this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
         };
         },
         Change: function(value) {
         this.fn();
         }
         }
         }),
         { xtype: "displayfield", value: "บาท" }
         ]
         }),
         new Ext.form.CompositeField({
         fieldLabel: "รวมเงินทั้งสิ้น",
         anchor: "100%",
         msgTarget: "under",
         hidden: Ext.BG_TYPE == 2 ? false : true,
         items: [
         new Ext.form.TextField({
         id: "sum_bg",
         name: "sum_bg",
         style: "text-align: right; color: blue; font-weight: bolder;",
         width: 200,
         readOnly: true,
         listeners: {
         afterrender: function() {
         this.fn = function() {
         this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
         };
         },
         Change: function(value) {
         this.fn();
         }
         }
         }),
         { xtype: "displayfield", value: "บาท" }
         ]
         }),
         new Ext.form.TextField({
         fieldLabel: "วัตถุประสงค์",
         id: "obj_name",
         name: "obj_name",
         width: 200,
         hidden: Ext.BG_TYPE == 2 ? false : true,
         readOnly: true
         }),
         new Ext.form.TextField({
         fieldLabel: "การลงทุน",
         id: "cap_name",
         name: "cap_name",
         width: 200,
         hidden: Ext.BG_TYPE == 2 ? false : true,
         readOnly: true
         }),
         new Ext.form.CompositeField({
         fieldLabel: "ปีที่อนุมัติงบประมาณ",
         anchor: "100%",
         msgTarget: "under",
         hidden: Ext.BG_TYPE == 2 ? false : true,
         items: [
         new Ext.form.TextField({
         id: "i_year_start",
         name: "i_year_start",
         width: 88,
         readOnly: true
         }),
         { xtype: "displayfield", value: "ถึง" },
         new Ext.form.TextField({
         id: "i_year_end",
         name: "i_year_end",
         width: 89,
         readOnly: true
         })
         ]
         }),
         {
         xtype: "radiogroup",
         id: "i_type_year",
         fieldLabel: "ปีที่ขออนุมัติงบประมาณ",
         columns: [500],
         hidden: Ext.BG_TYPE == 3 ? false : true,
         items: [
         { xtype: "displayfield", value: "<b><font color=red>*** กรุณาเลือกใช้เงินของปีงบประมาณเก่าให้หมดก่อนค่อยเลือกปีงบประมาณใหม่ </font></b>" },
         {
         boxLabel: "<span id='yearOld'></span>",
         name: "i_type_year",
         inputValue: 1
         },
         {
         boxLabel: "<span id='yearPre'></span>",
         name: "i_type_year",
         inputValue: 2,
         checked: true
         }
         ]
         },
         {
         xtype: "radiogroup",
         fieldLabel: "ประเภทการจัดหา",
         id: "i_is_import",
         columns: [80, 85, 160],
         disabled: Ext.BG_TYPE == 2 ? true : false,
         hidden: Ext.BG_TYPE == 2 || Ext.BG_TYPE == 3 ? false : true,
         items: [
         {
         boxLabel: "ในประเทศ",
         id: "i_is_import1",
         name: "i_is_import",
         checked: Ext.BG_TYPE == 2 ? false : true,
         inputValue: 1
         },
         {
         boxLabel: "ต่างประเทศ",
         id: "i_is_import2",
         name: "i_is_import",
         inputValue: 2
         },
         {
         boxLabel: "ในประเทศและต่างประเทศ",
         id: "i_is_import3",
         name: "i_is_import",
         inputValue: 3
         }
         ]
         },
         {
         xtype: "compositefield",
         fieldLabel: "วัตถุประสงค์",
         anchor: "100%",
         msgTarget: "under",
         hidden: Ext.BG_TYPE == 3 ? false : true,
         items: [
         new Ext.form.ComboBox({
         id: "dc_bg_obj_id",
         name: "dc_bg_obj_id",
         store: Ext.dc_bg_object,
         valueField: "id",
         displayField: "c_name",
         mode: "local",
         triggerAction: "all",
         emptyText: "กรุณาเลือก...",
         width: 310,
         forceSelection: true,
         selectOnFocus: true,
         typeAhead: false,
         listeners: {
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
         { xtype: "displayfield", value: " <font color='red'>*</font>" }
         ]
         },
         {
         xtype: "compositefield",
         fieldLabel: "ส่วนงาน",
         anchor: "100%",
         msgTarget: "under",
         hidden: Ext.BG_TYPE == 3 ? false : true,
         items: [
         new Ext.form.ComboBox({
         id: "dc_bg_cap_id",
         name: "dc_bg_cap_id",
         store: Ext.dc_bg_capital,
         valueField: "id",
         displayField: "c_name",
         mode: "local",
         triggerAction: "all",
         emptyText: "กรุณาเลือก...",
         width: 310,
         forceSelection: true,
         selectOnFocus: true,
         typeAhead: false,
         listeners: {
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
         { xtype: "displayfield", value: " <font color='red'>*</font>" }
         ]
         },
         {
         xtype: "compositefield",
         fieldLabel: "หน่วยงานเจ้าของเรื่อง",
         anchor: "100%",
         msgTarget: "under",
         items: [
         new Ext.form.ComboBox({
         id: "dc_cost_id",
         name: "dc_cost_id",
         store: Ext.dc_cost,
         valueField: "id",
         displayField: "c_name",
         mode: "local",
         triggerAction: "all",
         emptyText: "กรุณาเลือก...",
         width: 310,
         forceSelection: true,
         selectOnFocus: true,
         typeAhead: false,
         listeners: {
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
         { xtype: "displayfield", value: " <font color='red'>*</font>" }
         ]
         },
         {
         xtype: "datefield",
         fieldLabel: "วันที่อนุมัติ",
         id: "d_doc_date",
         name: "d_doc_date",
         width: 100,
         value: addY(543)
         },
         {
         xtype: "radiogroup",
         id: "i_is_doc",
         fieldLabel: "เลือกประเภทเอกสาร",
         columns: [205, 200],
         items: [
         {
         boxLabel: "เลขที่เอกสารใบสั่งซื้อ/สั่งจ้าง/สั่งเช่า",
         name: "i_is_doc",
         inputValue: 1,
         checked: true
         },
         {
         boxLabel: "เอกสารรับสนองราคา",
         name: "i_is_doc",
         inputValue: 2
         }
         ],
         listeners: {
         afterrender: function() {
         this.fn = function() {
         if (this.getValue().inputValue == 1) {
         Ext.getCmp("span_doc").show();
         Ext.getCmp("span_doc_resp").hide();
         Ext.getCmp("i_is_start_from_contract0").hide();
         Ext.getCmp("i_is_start_from_contract1").hide();
         Ext.getCmp("i_is_start_from_contract2").show();
         } else {
         Ext.getCmp("span_doc").hide();
         Ext.getCmp("span_doc_resp").show();
         Ext.getCmp("i_is_start_from_contract0").show();
         Ext.getCmp("i_is_start_from_contract1").show();
         Ext.getCmp("i_is_start_from_contract2").hide();
         }
         };
         },
         Change: function(value) {
         this.fn();
         }
         }
         },
         {
         xtype: "compositefield",
         fieldLabel: "&nbsp;",
         id: "span_doc",
         anchor: "100%",
         msgTarget: "under",
         hidden: true,
         items: [
         { xtype: "displayfield", value: "เลขที่เอกสารใบสั่งซื้อ/สั่งจ้าง/สั่งเช่า" },
         {
         xtype: "textfield",
         id: "c_doc_no",
         name: "c_doc_no"
         },
         { xtype: "displayfield", value: "<font color=red>*</font> วันที่ใบสั่ง" },
         {
         xtype: "datefield",
         id: "d_doc_no_date",
         name: "d_doc_no_date",
         width: 100,
         value: addY(543)
         },
         { xtype: "displayfield", value: "<font color=red>*</font>" }
         ]
         },
         {
         xtype: "compositefield",
         fieldLabel: "&nbsp;",
         id: "span_doc_resp",
         anchor: "100%",
         msgTarget: "under",
         hidden: true,
         items: [
         { xtype: "displayfield", value: "เลขที่เอกสารรับสนองราคา" },
         {
         xtype: "textfield",
         id: "c_doc_resp_no",
         name: "c_doc_resp_no"
         },
         { xtype: "displayfield", value: "<font color=red>*</font> วันที่รับสนองราคา" },
         {
         xtype: "datefield",
         id: "d_doc_resp_date",
         name: "d_doc_resp_date",
         width: 100,
         value: addY(543)
         },
         { xtype: "displayfield", value: "<font color=red>*</font>" }
         ]
         },
         {
         xtype: "compositefield",
         fieldLabel: "เรื่อง",
         anchor: "100%",
         msgTarget: "under",
         items: [
         {
         xtype: "textfield",
         id: "c_name",
         name: "c_name",
         width: 400
         },
         { xtype: "displayfield", value: "<font color=red>*</font>" }
         ]
         },
         {
         xtype: "checkbox",
         id: "i_is_inv",
         name: "i_is_inv",
         boxLabel: "ซื้อวัสดุเข้าคลัง",
         hidden: Ext.BG_TYPE == 2 ? true : false, // งบลงทุนไม่มี
         inputValue: 1
         },
         {
         xtype: "radiogroup",
         fieldLabel: "ขอดำเนินการ",
         id: "i_is_purchase",
         columns: [55, 60, 50],
         items: [
         {
         boxLabel: "จัดซื้อ",
         name: "i_is_purchase",
         checked: true,
         inputValue: 1
         },
         {
         boxLabel: "จัดจ้าง",
         name: "i_is_purchase",
         inputValue: 0
         },
         {
         boxLabel: "จัดเช่า",
         name: "i_is_purchase",
         inputValue: 2
         }
         ]
         },
         {
         xtype: "compositefield",
         fieldLabel: "วิธี",
         anchor: "100%",
         msgTarget: "under",
         items: [
         new Ext.form.ComboBox({
         id: "ap_process_type_id",
         name: "ap_process_type_id",
         store: Ext.ap_process_type,
         valueField: "id",
         displayField: "c_name",
         mode: "local",
         triggerAction: "all",
         emptyText: "กรุณาเลือก...",
         width: 200,
         forceSelection: true,
         selectOnFocus: true,
         typeAhead: false,
         listeners: {
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
         { xtype: "displayfield", value: " <font color='red'>*</font>" }
         ]
         },
         {
         xtype: "textarea",
         fieldLabel: "เหตุผลและความจำเป็น",
         id: "c_reason_for_po",
         name: "c_reason_for_po",
         width: 400
         },
         {
         xtype: "textarea",
         fieldLabel: "ข้อมูลการจัดซื้อโดยสรุป",
         id: "c_comment",
         name: "c_comment",
         width: 400
         },
         {
         xtype: "compositefield",
         fieldLabel: "กำหนดส่งภายใน",
         anchor: "100%",
         msgTarget: "under",
         items: [
         {
         xtype: "textfield",
         id: "i_delivery",
         name: "i_delivery",
         style: "text-align: right",
         width: 70,
         value: 1,
         listeners: {
         afterrender: function() {
         this.fn = function() {
         this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 0)));
         };
         },
         Change: function(value) {
         this.fn();
         }
         }
         },
         { xtype: "displayfield", value: "วัน <font color='red'>*</font>" }
         ]
         },
         {
         xtype: "radiogroup",
         id: "i_is_start_from_contract",
         fieldLabel: "นับถัดจาก/นับตั้งแต่",
         columns: [115, 120, 200, 100],
         items: [
         {
         boxLabel: "วันที่รับสนองราคา",
         id: "i_is_start_from_contract0",
         name: "i_is_start_from_contract",
         hidden: true,
         inputValue: 0
         },
         {
         boxLabel: "วันลงนามในสัญญา",
         id: "i_is_start_from_contract1",
         name: "i_is_start_from_contract",
         hidden: true,
         inputValue: 1
         },
         {
         boxLabel: "วันลงนามในใบสั่งซื้อ/สั่งจ้าง/สั่งเช่า",
         id: "i_is_start_from_contract2",
         name: "i_is_start_from_contract",
         checked: true,
         hidden: true,
         inputValue: 2
         },
         {
         boxLabel: "อื่นๆ",
         id: "i_is_start_from_contract3",
         name: "i_is_start_from_contract",
         inputValue: 3
         }
         ],
         listeners: {
         afterrender: function() {
         this.fn = function() {
         if (this.getValue().inputValue == 3) {
         Ext.getCmp("span_another_detail").show();
         } else {
         Ext.getCmp("span_another_detail").hide();
         }
         };
         },
         Change: function() {
         this.fn();
         }
         }
         },
         {
         xtype: "compositefield",
         id: "span_another_detail",
         fieldLabel: "&nbsp;",
         anchor: "100%",
         msgTarget: "under",
         hidden: true,
         items: [
         {
         xtype: "textfield",
         id: "another_detail",
         name: "another_detail"
         },
         { xtype: "displayfield", value: "<font color=red>(เฉพาะกรณีการเลือกอื่นๆ)</font>" }
         ]
         },
         {
         xtype: "radiogroup",
         id: "i_is_fine",
         fieldLabel: "รายการค่าปรับ",
         columns: [120, 100],
         items: [
         {
         boxLabel: "ค่าปรับคิดเป็น (%)",
         name: "i_is_fine",
         inputValue: 1,
         checked: true
         },
         {
         boxLabel: "ค่าปรับ(บาท)/วัน",
         name: "i_is_fine",
         inputValue: 2
         }
         ],
         listeners: {
         Change: function(value) {
         if (this.getValue().inputValue == 1) {
         Ext.getCmp("span_fine_per").show();
         Ext.getCmp("span_fine_amt").hide();
         } else {
         Ext.getCmp("span_fine_per").hide();
         Ext.getCmp("span_fine_amt").show();
         }
         }
         }
         },
         {
         xtype: "compositefield",
         id: "span_fine_per",
         fieldLabel: "&nbsp;",
         anchor: "100%",
         msgTarget: "under",
         items: [
         {
         xtype: "textfield",
         id: "i_fine_per",
         name: "i_fine_per",
         style: "text-align: right",
         width: 200,
         listeners: {
         afterrender: function() {
         this.fn = function() {
         this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
         };
         },
         Change: function(value) {
         this.fn();
         }
         }
         },
         { xtype: "displayfield", value: "%" }
         ]
         },
         {
         xtype: "compositefield",
         id: "span_fine_amt",
         fieldLabel: "&nbsp;",
         anchor: "100%",
         msgTarget: "under",
         hidden: true,
         items: [
         {
         xtype: "textfield",
         id: "i_fine_amt",
         name: "i_fine_amt",
         style: "text-align: right",
         width: 200,
         listeners: {
         afterrender: function() {
         this.fn = function() {
         this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
         };
         },
         Change: function(value) {
         this.fn();
         }
         }
         },
         { xtype: "displayfield", value: "บาท" }
         ]
         }
         ]
         }
         ]
         }
         ],
         buttonAlign: "left",
         buttons: [
         {
         text: "&nbsp;" + Ext.GLOBAL_BU_SAVE_TH + "&nbsp;",
         id: "saveHdr",
         iconCls: "icon-save",
         handler: function() {
         saveHdr();
         }
         },
         {
         text: Ext.GLOBAL_BU_BACK_TH,
         handler: function() {
         Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
         }
         }
         ]
         },
         { border: false, html: "<div id='EXT_boxDetail1' style='padding-top: 10px;'></div>" },
         { border: false, html: "<div id='EXT_boxDetail2' style='padding-top: 10px;'></div>" },
         { border: false, html: "<div id='EXT_boxDetail3' style='padding-top: 10px;'></div>" },
         { border: false, html: "<div id='EXT_boxDetail4' style='padding-top: 10px;'></div>" }
         ]
         });*/
    }; // formAdd
    Ext.extend(formAdd, Ext.Panel, {});

    const search = function () {
        var msg = "";
        if (msg == "") {
            Ext.storeDtl.setBaseParam("mode", "SEARCH");
            Ext.storeDtl.setBaseParam("filter", Ext.getCmp("filter-ID").getValue());
            Ext.storeDtl.setBaseParam("value", Ext.getCmp("val-ID").getValue());
            Ext.storeDtl.setBaseParam("userid", Ext.getCmp("userid-ID").getValue());
            Ext.getCmp("tabpanel1").getStore().load();
        } else {
            Ext.Msg.alert("แจ้งเตือน", msg);
        }
    };
};
