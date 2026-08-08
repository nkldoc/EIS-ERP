
function winProcess(rec) {
    //   console.log(rec);
    new Ext.Window({
        id: "win-processID",
        title: "ผ่านรายการ PR",
        modal: true,
        resizable: false,
        width: 550,
        layout: "form",
        labelWidth: 180,
        bodyStyle: "padding:3px;",
        items: [
            {
                xtype: "displayfield",
                fieldLabel: "ผ่านการสถานะของ",
                value: "<b style='font-size:16px;'> " + rec.get("c_code") + " ?</b>",
            },
            {
                xtype: "displayfield",
                fieldLabel: "พนักงานผู้รับผิดชอบ PR",
                id: "dc_emp_nameID",
                name: "dc_emp_name",
                value: "<b style='font-size:12px;'> " + rec.get("c_emp_name") + " ?</b>",
            },
            {
                xtype: "radiogroup",
                columns: [180, 180],
                fieldLabel: "โหมดการบันทึก",
                id: "modesubID",
                style: {
                    "font-weight": "bold",
                },
                items: [
                    {
                        name: "mode",
                        inputValue: "GOTOSTEP",
                        checked: true,
                        boxLabel: "ผ่านรายการ <img src='../images/icons/accept.png'>",
                    },
                    {
                        name: "mode",
                        inputValue: "BACKSTEP",
                        boxLabel: "ส่งกลับหัวหน้าสายงาน <img src='../images/icons/time_red.png'>",
                    },
                ],
                listeners: {
                    change: function (cb, nv, ov) {
                        if (Ext.getCmp("modesubID").getValue().inputValue == "BACKSTEP") {
                            Ext.getCmp("reasonID").show();
                            Ext.menu_i_entrance = 1; //กลุ่มเมนู
                            Ext.i_backword = 1; //กลับ
                            Ext.menuback = null; //เมนูที่กลับ
                        } else {
                            if (rec.data.c_comment_status == "") {
                                Ext.getCmp("reasonID").hide();
                            }
                            Ext.menu_i_entrance = 1; //กลุ่มเมนู
                            Ext.i_backword = null; //กลับ
                            Ext.menuback = null; //เมนูที่กลับ
                        }
                    },
                    afterrender: function () {
                    },
                },
            },
            {
                fieldLabel: "เหตุผลที่ส่งกลับ",
                xtype: "textarea",
                name: "reason",
                width: 250,
                id: "reasonID",
                listeners: {
                    afterrender: function () {
                        if (rec.data.c_comment_status == "") {
                            this.hide();
                        }
                    },
                },
            },
        ],
        buttons: [
            {
                text: "อัพเดทผ่านสถานะรายการ.",
                iconCls: "icon-save",
                handler: function () {
                    if (Ext.getCmp("modesubID").getValue().inputValue == "GOTOSTEP") {
                        //  alert(Ext.selectRow.get('i_bg_type'));
                        // return false;
                        if (Ext.selectRow.get('i_bg_type') !== 1 && Ext.selectRow.get("bg_check_id") < 1 && Ext.selectRow.get("i_type_bg") != 2 && Ext.selectRow.get("i_type_bg") != 4 && Ext.selectRow.get("i_type_bg") != 8) {

                            Ext.Msg.alert("แจ้งเตือน", "ยังไม่ได้ทำการจองเงิน", function (bu, action) {
                                return false;
                            });
                        } else if (Ext.selectRow.get("f_total_amt") < 1) {
                            Ext.Msg.alert("แจ้งเตือน", "กรุณากรอกเงินใน PR", function (bu, action) {
                                return false;
                            });
                        } else {
                            if (Ext.isEmpty(Ext.getCmp("modesubID").getValue())) {
                                Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกหมวดการผ่านการสถานะ", function (bu, action) {
                                    return false;
                                });
                            } else if (Ext.getCmp("modesubID").getValue().inputValue == "GOTOSTEP") {
                                if (rec.get("sp_emp_id") == 0)
                                    Ext.Msg.alert("แจ้งเตือน", "กรุณาบันทึกพนักงานผู้รับผิดชอบงาน PR", function (bu, action) {
                                        return false;
                                    });
                                Ext.status.process(Ext.menuCode, rec);
                            } else if (Ext.getCmp("modesubID").getValue().inputValue == "BACKSTEP") {
                                Ext.status.process("ST0003", rec);
                            }
                        }
                    } else if (Ext.getCmp("modesubID").getValue().inputValue == "BACKSTEP") {
                        Ext.status.process("ST0003", rec);
                    }

                },
            },
            {
                text: Ext.GLOBAL_BU_BACK_TH, iconCls: "icon-back",
                iconCls: "icon-clear",
                handler: function () {
                    Ext.getCmp("win-processID").destroy(); // clear memory :: garbage collection
                },
            },
        ],
    }).show();
}
function controller(rec, status) {
    /* if(status === "processUpdate"){
     
     }else */if (status === "processUpdate") {
        Ext.Msg.minWidth = 200;
        Ext.Msg.buttonText = {
            ok: "ตกลง",
            cancel: "ยกเลิก",
            yes: "ผ่านรายการ",
            no: "ไม่",
        };
        if (rec.get("i_step") == 0)
            Ext.Msg.alert("แจ้งเตือน", "ต้องบันทึกลงทะเบียนก่อนผ่านรายการ", function (bu, action) {
                return false;
            });
        if (rec.get("i_is_register") != 1) {
            Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>กรุณาบันทึกรายการก่อนผ่านรายการ</span><br>", function (bu, action) {
                return false;
            });
            return;
        }
        if (rec.get("sp_bg_edit") == 1) {
            Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>PR อยู่ระหว่างแก้ไขงบประมาณ</span><br>", function (bu, action) {
                return false;
            });
            return;
        }
        Ext.Msg.buttonText = {
            ok: "ตกลง",
            cancel: "ยกเลิก",
            yes: "ผ่านรายการ",
            no: "ไม่",
        };
        winProcess(rec);
        Ext.getCmp("reasonID").setValue(rec.get("c_comment"));
    } else if (status === "editEmpTorID" && Ext.LOGIN_LEVEL_SHOW === 0) {
        Ext.storeDepartment = new Ext.data.JsonStore({
            storeId: "storeDepartment",
            autoLoad: true,
            url: "api/All.php",
            root: "data",
            baseParams: {type: "storeSpEmp", start: 0, limit: 20, mode: null, dc_department_id: Ext.dc_department_id}, //Permission i_read
            idProperty: "id",
            totalProperty: "totalCount",
            fields: ["id", "c_code", "c_name"],
        });
        var wind = new Ext.Window({
            title: "แก้ไขผู้รับผิดชอบงาน",
            width: Ext.getCmp("contenterCenter").getWidth() - 450,
            height: Ext.getCmp("contenterCenter").getHeight() - 350,
            id: "winEmpTorID",
            modal: true,
            plain: true,
            items: new Ext.FormPanel({
                columnWidth: 0.45,
                height: 500,
                id: "frmEditSpEmpID",
                url: "tor/api/mnTorController.php",
                defaults: {width: 430},
                defaultType: "textfield",
                labelWidth: 150,
                items: [
                    {
                        xtype: "hidden",
                        name: "id",
                    },
                    {
                        xtype: "hidden",
                        name: "sp_emp_id",
                        id: "sp_emp_id2ID",
                    },
                    {
                        xtype: "hidden",
                        value: "UPDATEFORMSPEMP",
                        name: "mode",
                    },
                    Ext.PopDepartmentForm.mini,
                    {
                        xtype: "textarea",
                        fieldLabel: "หมายเหตุการเปลี่ยน",
                        width: 400,
                        name: "c_comment",
                    },
                ],
            }),
            buttonAlign: "left",
            buttons: [
                {
                    text: "บันทึกรายการ",
                    id: "buSavePopSubID",
                    iconCls: "icon-save",
                    listeners: {
                        afterrender: function () {
                            Ext.getCmp("buSavePopSubID").hide();
                        },
                    },
                    handler: function () {
                        var formSubmit = function () {
                            form.submit({
                                waitMsg: "Saving Data...",
                                success: function (form, action) {
                                    Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                        Ext.getCmp("tabpanel1").getStore().reload();
                                        Ext.getCmp("winEmpTorID").destroy();
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
                        var form = Ext.getCmp("frmEditSpEmpID").getForm();
                        if (form.isValid()) {
                            formSubmit(form);
                        }
                    },
                    //haddler
                },
                {
                    text: Ext.GLOBAL_BU_BACK_TH, iconCls: "icon-back",
                    handler: function () {
                        Ext.getCmp("winEmpTorID").hide();
                        Ext.getCmp("winEmpTorID").destroy();
                    },
                },
            ],
        });
        wind.show();
        Ext.getCmp("frmEditSpEmpID").getForm().loadRecord(Ext.selectRow);
        console.log(Ext.selectRow);
    }
} // Controller
/*bg_check_id i_type_bg */
function cancel_bidder_dtl(id) {
    Ext.f_toal_amt = 0;
    var win = new Ext.Window({
        id: "win-msg-delete",
        title: "Remove",
        modal: true,
        width: 250,
        height: 130,
        html: "ท่านต้องการที่จะยกเลิกการเสนอราคารายการนี้ ?",
        buttons: [
            {
                text: "Confirm",
                handler: function () {
                    Ext.Ajax.request({
                        url: "tor/api/mnTorController.php",
                        params: {
                            mode: "DELETE_SP_TOR_BIDDER_DTL",
                            id: id,
                        },
                        method: "GET", //POST
                        success: function (result, request) {
                            Ext.getCmp("win-msg-delete").destroy();
                            Ext.store3.setBaseParam("sp_tor_id", Ext.SP_TOR_ID);
                            Ext.store3.setBaseParam("dc_creditor_id", Ext.DC_CREDITOR_ID);
                            Ext.store3.setBaseParam("sp_tor_bidder_hdr_id", Ext.SP_TOR_BIDDER_HDR_ID);
                            Ext.store3.load({
                                callback: function (record, operation, success) {
                                    if (success) {
                                        Ext.store2.setBaseParam("sp_tor_id", Ext.SP_TOR_ID);
                                        Ext.store2.load();
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
}
function saveDtl(mode) {
    let msg = "";
    let jsonArr = [];
    var num = Ext.getCmp("gridEditor2").store.data.items.length - 1;
    var row = 0;
    while (num >= row) {
        if (document.getElementById("chk_" + row).checked == true && Ext.getCmp("gridEditor2").store.data.items[row].data.sp_tor_bidder_dtl_id == null) {
            jsonArr.push({
                sp_tor_bidder_hdr_id: Ext.SP_TOR_BIDDER_HDR_ID,
                sp_tor_id: Ext.getCmp("gridEditor2").store.data.items[row].data.sp_tor_id,
                c_name: Ext.getCmp("gridEditor2").store.data.items[row].data.c_name,
                dc_unit_type_id: Ext.getCmp("gridEditor2").store.data.items[row].data.dc_unit_type_id,
                sp_tor_dtl_id: Ext.getCmp("gridEditor2").store.data.items[row].data.sp_tor_dtl_id,
                dc_creditor_id: Ext.DC_CREDITOR_ID,
                i_qty: Ext.getCmp("gridEditor2").store.data.items[row].data.i_qty,
                f_unit_price: document.getElementById("f_bid" + row).value.replace(/\,/g, ''),
                f_total_price: document.getElementById("f_bid_total" + row).value.replace(/\,/g, ''),
                f_rate_vat: document.getElementById("f_rate_vat" + row).value.replace(/\,/g, ''),
                f_vat_amt: document.getElementById("f_vat_amt" + row).value.replace(/\,/g, ''),
                f_vat_edit_amt: document.getElementById("f_vat_edit_amt" + row).value.replace(/\,/g, ''),
                f_total_add_vat_amt: document.getElementById("f_total_add_vat_amt" + row).value.replace(/\,/g, ''),
            });
            if (document.getElementById("f_bid" + row).value < 1) {
                msg += "<span style='white-space: nowrap;'>- กรุณากรอกราคาเสนอ</span><br>";
                break;
            }
        }
        row++;
    }
    if (jsonArr.length <= 0) {
        msg += "<span style='white-space: nowrap;'>- กรุณาเลือกรายการ</span><br>";
    }
    if (msg == "") {
        // Ext.getCmp("win-frm-perid-bal-dtlID").getEl().mask("Please wait...", "x-mask-loading");
        Ext.Ajax.request({
            url: "tor/api/mnTorController.php",
            method: "POST",
            params: {
                mode: "UP_SP_TOR_BIDDER_DTL",
                data: JSON.stringify(jsonArr),
            },
            success: function (result, request) {
                // Ext.getCmp("win-frm-perid-bal-dtlID").getEl().unmask();
                let json = Ext.util.JSON.decode(result.responseText);
                Ext.Msg.alert("แจ้งเตือน", json.msg);
                Ext.store3.setBaseParam("sp_tor_id", Ext.SP_TOR_ID);
                Ext.store3.setBaseParam("dc_creditor_id", Ext.DC_CREDITOR_ID);
                Ext.store3.setBaseParam("sp_tor_bidder_hdr_id", Ext.SP_TOR_BIDDER_HDR_ID);
                Ext.store3.load({
                    callback: function (record, operation, success) {
                        if (success) {
                            Ext.store2.setBaseParam("sp_tor_id", Ext.SP_TOR_ID);
                            Ext.store2.load();
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
}
function checkID(row) {
    var models = Ext.getCmp("gridEditor2").getStore().getRange();
    if (document.getElementById("chk_" + row).checked == true) {
        models[row].set("CheckColumn", true);
    } else {
        models[row].set("CheckColumn", false);
        document.getElementById("f_bid" + row).value = null;
        document.getElementById("f_bid_total" + row).value = null;
    }
}
function change_f_bid(type, row) {
    var models = Ext.getCmp("gridEditor2").getStore().getRange();
    var num2 = Ext.getCmp("gridEditor2").store.data.items[row].data.f_unit_price;
    var num = Ext.getCmp("gridEditor2").store.data.items[row].data.i_qty;
    // num2 = num2 ? num2.replace(/,/g, "") : "";
    if (type == 1) {
        if (document.getElementById("f_bid" + row).value.replace(/\,/g, '') > 0) {
            var f_bid = document.getElementById("f_bid" + row).value.replace(/\,/g, '');
            models[row].set("CheckColumn", true);
            // document.getElementById("chk_" + row).checked = true;
            var f_did_total = f_bid * num;


//      document.getElementById("f_bid" + row).value = floatMinus(f_bid, 2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
//      document.getElementById("f_bid_total" + row).value = floatMinus(f_did_total, 2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

            var originalNum = Ext.selectRow.get('f_total_amt').replace(/\,/g, '');
            var cleanNum = originalNum.replace(/\,/g, '');
            var f_total_amt = parseFloat(cleanNum);


            if (f_total_amt < f_did_total) {
                Ext.MessageBox.alert('แจ้งเตือนยอดเงินเกิน !',
                        'เงินที่จอง : ' + Ext.selectRow.get('f_total_amt') +
                        '\nเงินหลังต่อรอง : ' + Ext.floatRenderer(f_did_total));
                document.getElementById("f_bid_total" + row).value = 0.00;
                document.getElementById("f_bid" + row).value = 0.00;
            } else {
                document.getElementById("f_bid" + row).value = floatMinus(f_bid, 2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                document.getElementById("f_bid_total" + row).value = floatMinus(f_did_total, 2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            }
        } else {
            document.getElementById("f_bid" + row).value = null;
            document.getElementById("f_bid_total" + row).value = null;
            document.getElementById("chk_" + row).checked = false;
            models[row].set("CheckColumn", false);

        }
    } else if (type == 2) {
        if (document.getElementById("f_bid_total" + row).value > 0) {
            var f_did_total = document.getElementById("f_bid_total" + row).value.replace(/\,/g, '');
            models[row].set("CheckColumn", true);
            // document.getElementById("chk_" + row).checked = true;
            var f_bid = f_did_total / num;
            var originalNum = Ext.selectRow.get('f_total_amt').replace(/\,/g, '');
            var cleanNum = originalNum.replace(/\,/g, '');
            var f_total_amt = parseFloat(cleanNum);
            if (f_total_amt < f_did_total) {

                Ext.MessageBox.alert('แจ้งเตือนยอดเงินเกิน !',
                        'เงินที่จอง : ' + Ext.selectRow.get('f_total_amt') +
                        '\nเงินหลังต่อรอง : ' + Ext.floatRenderer(f_did_total));
                document.getElementById("f_bid_total" + row).value = 0.00;
                document.getElementById("f_bid" + row).value = 0.00;
            } else {
                document.getElementById("f_bid" + row).value = floatMinus(f_bid, 2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                document.getElementById("f_bid_total" + row).value = floatMinus(f_did_total, 2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            }


//      alert(document.getElementById("f_bid_total" + row).value);
        } else {
            document.getElementById("f_bid" + row).value = null;
            document.getElementById("f_bid_total" + row).value = null;
            document.getElementById("chk_" + row).checked = false;
            models[row].set("CheckColumn", false);
        }
    }
}

Ext.storeDtl = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "tor/api/mnTorController.php",
    baseParams: {
        type: "sp_working_dtl_all",
        mode: "LIST",
        //keyData: Ext.keyData
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
            name: "bg_check_id",
        },
        {
            name: "i_version",
        },
        {
            name: "approve_step",
        },
        {
            name: "i_type_bg",
        },
        {
            name: "i_entrance",
        },
        {
            name: "i_type_contract",
        },
        {
            name: "c_contract_code",
        },
        {
            name: "menuCode",
        },
        {
            name: "i_type_bgTxt",
        },
        {
            name: "i_step",
        },
        {
            name: "upload",
        },
        {
            name: "sp_contract_id",
        },
        {
            name: "i_edit",
        },
        {
            name: "i_is_upload",
        },
        {
            name: "txtsub_cost",
        },
        {
            name: "i_forword",
        },
        {
            name: "i_backword",
        },
        {
            name: "c_codeStatus",
        },
        {
            name: "c_code",
        },
        {
            name: "bg_budget_dtl_project_id",
        },
        {
            name: "c_budget_dtl_project",
        },
        {
            name: "c_name",
        },
        {
            name: "c_code_status",
        },
        {
            name: "c_name_status", //
        },
        {
            name: "c_tor_type",
        },
        {
            name: "tor_status_id",
        },
        {
            name: "tor_type_id",
        },
        {
            name: "c_purchase",
        },
        {
            name: "i_purchase", //i_product_type	i_hire_type	i_is_inv
        },
        {
            name: "i_product_type",
        },
        {
            name: "sp_type_id",
        },
        {
            name: "i_hire_type",
        },
        {
            name: "i_is_inv",
        },
        {
            name: "i_type_fix_rate",
        },
        {
            name: "i_delivery_date",
        },
        {
            name: "d_tor_date", //
        },
        {
            name: "i_parent", //d_tor_date
        },
        {
            name: "i_is_more",
        },
        {
            name: "i_is_rename",
        },
        {
            name: "i_is_parent",
        },
        {
            name: "f_total_amt",
        },
        {
            name: "dc_cost_id",
        },
        {
            name: "dc_cost2_id",
        },
        {
            name: "tag",
        },
        {
            name: "dc_cost_idTxt",
        },
        {
            name: "dc_cost2_idTxt",
        },
        {
            name: "i_yyyy",
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
            name: "d_doc_ref",
        },
        {
            name: "dc_expense_budget_type_id",
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
            name: "i_enabled",
        },
        {
            name: "c_comment",
        },
        {
            name: "c_remake",
        },
        {
            name: "po_creditor_id",
        },
        {
            name: "po_creditor_idTxt",
        },
        {
            name: "d_doc_date",
        },
        {
            name: "start_date",
        },
        {
            name: "index_receive",
        },
        {
            name: "end_date",
        }, {
            name: "DateAdd1",
        }, {
            name: "DateAdd2",
        }, {
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
            name: "tor_hdr_dtl",
        },
        {
            name: "bg_reserve_money2_id",
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
            name: "po_expense_id",
        },
        {
            name: "po_expense_main_id",
        }, {
            name: "i_is_register",
        }, {
            name: "c_emp_name",
        }, {
            name: "i_alarm",
        }, {
            name: "i_day",
        }
    ]
});
Ext.url_pdf = 'http://localhost/sp_mn/api/mnUploadDoc.php';
Ext.url_process = './api/mnCheckingController.php';
Ext.i_step = 4;
Ext.menu_back = 'ST0013'; //ส่งคืนตรวจสอบเอกสาร
Ext.menu_goto = null; //ส่งคืนตรวจสอบเอกสาร
//hidden
Ext.reversstep = false;
Ext.backstep = true;
Ext.reversstep = false;
Ext.selectRow = [];
Ext.StatusMsgTxt = [{4: 'รอส่งเบิก', 5: 'กำลังส่งเบิก', 6: 'ส่งเบิกแล้ว'}];
// Handle this change event in order to restore the UI to the appropriate history state
var crditForm = null;
Ext.storeDebtorCheckingBilling = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "tor/api/List_SpPreBilling.php",
    baseParams: {
        type: "chooseBilling",
        keyData: Ext.keyData,
        i_alarm: Ext.menu_i_alarm,
        i_pa: Ext.menu_i_day,
        i_edit2: true,
        tor_status_id: Ext.menu_id,
    },
    root: "data",
    idProperty: "id",
    totalProperty: "totalCount",
    fields: [{
            name: "no",
        },
        {
            name: "id",
        },
        {
            name: "i_type_bg",
        },
        {
            name: "i_bg_type", type: "int"
        },
        {
            name: "i_type_bgTxt",
        },
        {
            name: "i_is_entrance",
        },
        {
            name: "txtdc_department_idID", //
        },
        {
            name: "txtsp_emp_idID",
        },
        {
            name: "sp_emp_id",
        },
        {
            name: "sp_emp_name",
        },
        {
            name: "dc_emp_id",
        },
        {
            name: "dc_emp_name",
        },
        {
            name: "i_step",
        },
        {
            name: "DateAdd1",
        },
        {
            name: "DateAdd2",
        },
        {
            name: "d_tor_date_alert",
        },
        {
            name: "d_tor_date_alert",
        },
        {
            name: "d_tor_date_pa",
        },
        {
            name: "c_codeStatus",
        },
        {
            name: "c_code",
        },
        {
            name: "bg_check_id",
        },
        {
            name: "bg_budget_dtl_project_id",
        },
        {
            name: "c_budget_dtl_project",
        },
        {
            name: "c_name",
        },
        {
            name: "tor_status_id",
        },
        {
            name: "tor_type_id", //
        },
        {
            name: "c_tor_type", //c_tor_type
        },
        {
            name: "c_purchase",
        },
        {
            name: "i_purchase",
        },
        {
            name: "d_tor_status_date", //
        },
        {
            name: "d_tor_date", //
        },
        {
            name: "i_parent", //d_tor_date
        },
        {
            name: "i_is_more",
        },
        {
            name: "i_is_register",
        },
        {
            name: "i_is_rename",
        },
        {
            name: "i_is_parent",
        },
        {
            name: "f_total_amt",
        },
        {
            name: "dc_cost_id",
        },
        {
            name: "dc_cost_idTxt",
        },
        {
            name: "dc_cost2_id",
        },
        {
            name: "dc_cost2_idTxt",
        },
        {
            name: "i_yyyy",
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
            name: "d_doc_ref",
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
            name: "tor_hdr_dtl",
        },
        {
            name: "bg_reserve_money2_id",
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
            name: "po_expense_id",
        },
        {
            name: "po_expense_main_id",
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
            name: "d_tor_status_date",
        },
        {
            name: "d_doc_date",
        },
        {
            name: "c_comment",
        },
        {
            name: "c_remake",
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
            name: "i_type_contract",
        },
        {
            name: "i_hire_type",
        },
        {
            name: "i_is_inv",
        },
        {
            name: "i_type_fix_rate",
        },
        {
            name: "i_product_type",
        },
        {
            name: "i_delivery_date",
        },
        {
            name: "i_amount_bg",
        },
        {
            name: "sp_bg_edit",
        }]
});
Ext.storeDebtorChecking = new Ext.data.JsonStore({
    autoDestroy: true,
    autoLoad: false,
    url: "tor/api/List_SpPreBilling.php",
    baseParams: {
        type: "postBilling",
        keyData: Ext.keyData,
        i_alarm: Ext.menu_i_alarm,
        i_pa: Ext.menu_i_day,
        i_edit2: true,
        tor_status_id: Ext.menu_id,
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
            name: "i_step",
        },
        {
            name: "i_status_checking",
        },
        {
            name: "sp_bg_billing_dtl_id",
        },
        {
            name: "url_link_doc",
        },
        {
            name: "c_comment",
        },
        {
            name: "c_name",
        },
        {
            name: "d_reg_billing_date",
        },
        {
            name: "d_post_billing_date",
        },
        {
            name: "i_is_waiting",
        },
        {
            name: "i_menu",
        },
        {
            name: "dc_creditor_name",
        },
        {
            name: "sp_emp_name",
        },
        {
            name: "c_status",
        },
        {
            name: "c_code",
        },
        {
            name: "sp_emp_id",
        },
        {
            name: "txtsp_emp_idID",
        },
        {
            name: "c_arrive_code",
        },
        {
            name: "d_doc_ref",
        },
        {
            name: "d_arrive_date",
        },
        {
            name: "d_checking_date", //
        },
        {
            name: "c_comment",
        }]
});
Ext.colBar = [
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
        header: "รหัส",
        sortable: false,
        align: "left",
        dataIndex: "id",
        hidden: true
    },
    {
        header: "รหัสตรวจรับ",
        sortable: false,
        width: 100,
        align: "center",
        dataIndex: "c_code"

    },
    {
        header: "วันที่ส่งวางบิล",
        sortable: false,
        align: "center",
        dataIndex: "d_reg_billing_date",
    },
    {
        header: "วันที่วางบิล",
        sortable: false,
        align: "center",
        dataIndex: "d_post_billing_date",
    },
    {
        header: "วันที่ตรวจรับ",
        sortable: false,
        align: "center",
        dataIndex: "d_checking_date",
    },
    {
        header: "ผู้ขาย/รับจ้าง",
        sortable: false,
        align: "left",
        dataIndex: "dc_creditor_name", //c_tor_type
        width: 120

    },
    {
        header: "หมายเหตุ",
        sortable: false,
        align: "left",
        dataIndex: "c_comment",
    }
];
//##
Ext.application = Ext.apply({
    underConstructionEnabled: false,
    storeItem: [],
    setRow: (v) => {
        this.storeItem = v;
    },
    getRow: () => {
        return this.storeItem;
    },
    id: 'torAllID',
    toId: "contenterCenter",
    msg: "ระบบยังไม่เปิดให้ใช้งาน</span> กรุณาเข้าไปทางเมนูด้านซ้ายมือ......",
    setHideName: (n, status) => {
        Ext.iterate(Ext.ComponentMgr.all.items, function (cmp) {
            if (status === 1 && cmp.name === n) {
                cmp.hide(); // หรือ cmp.setVisible(false);
                return false;
            }
        });
    },
    underContruction: (i) => {
        if (Ext.application.underConstructionEnabled)
            Ext.getCmp(Ext.application.toId).getEl().mask(
                    "<span style='color:red;font-weight:bold'>"
                    + Ext.application.msg
                    + "ข้อความจะปิด "
                    + i
                    + " วินาที"
                    , "x-mask-loading");
        setTimeout(() => {
            Ext.getCmp(Ext.application.toId).getEl().unmask();
        }, 2500 * i);
        return false;
    },
    toolTip: (grid) => {
        var view = grid.getView();
        grid.tip = new Ext.ToolTip({
            target: view.mainBody, // กำหนดให้ Tooltip ติดอยู่กับ Grid
            delegate: '.x-grid3-row', // ใช้กับทั้งแถว
            trackMouse: true,
            renderTo: document.body,
            listeners: {
                beforeshow: (tip) => {
                    var rowIndex = view.findRowIndex(tip.triggerElement);
                    if (rowIndex !== false) {
                        var record = grid.getStore().getAt(rowIndex);
                        tip.update(
                                '<b>สถานะรายการ:</b> ' + record.get('c_code_status') + ' ' + record.get('c_name_status') + '<br>' +
                                '<b>รายการ PR :</b> ' + record.get('c_code') + '<br>' +
                                '<b>เลขที่สัญญา :</b> ' + record.get('c_contract_code') + '<br>' +
                                '<b>ผู้ขาย/รับจ้าง :</b> ' + record.get('po_creditor_idTxt') + '<br>' +
                                '<b>รายละเอียด :</b> ' + record.get('c_name') + '<br>' +
                                '<b>ผู้รับผิดชอบ :</b> ' + record.get('c_emp_name')
                                );
                    } else {
                        return false; // ไม่แสดง Tooltip ถ้าไม่มีข้อมูล
                    }
                }
            }
        });
    }, //Endfunction
    afterRender: (obj) => {
//            console.log(Ext.application.getRow());
        //'icon-form'
        obj.setTitle("สถานะรายการ " + Ext.application.getRow().get('c_name_status') + " " + Ext.application.getRow().get('c_code_status') + " PR เพื่อจะดำเนินการทำสัญญา");
        obj.setIconClass(true ? 'icon-form' : 'icon-grid');
    }
});
//##    
Ext.AppUx = function (app, menu) {
    Ext.user_right_add = user_right_add;
    Ext.user_right_edit = user_right_edit;
    Ext.user_right_delete = user_right_delete;
    Ext.title = "PR สถานะการดำเนินงาน";
    //Ext.menu_i_entrance;
    Ext.HDR_ID = null;
    Ext.menuEditGrid = true;
    Ext.menuRightEditgrid = true;
    Ext.tor_type_id = 1; // default start เจาะจงน้อวกว่า 5 แสน
    Ext.i_is_more = 0;
    Ext.tor_type_idTxt = Ext.apply({
        tor_type_id1: {0: "แบบมีหัวงาน/ฝ่าย พิจารณาผล(ไม่เกิน 5 แสนบาท)", 1: "แบบมีคณะกรรมการ พิจารณาผล(เกิน 5 แสนแสนบาท)"},
    });
    Ext.status = Ext.apply({
        name: menu,
        process: function (menuCode, record) {
            Ext.Ajax.request({
                url: "tor/api/mnTorController.php",
                params: {
                    mode: "UPDATENEXTSTEP",
                    menuCode: record.get("menuCode"),
                    i_seq: Ext.menu_i_seq,
                    tor_status_id: record.get("tor_status_id"),
                    tor_type_id: record.get("tor_type_id"),
                    i_entrance: record.get("i_entrance"), //เมนูแยก
                    menuback: Ext.menuback,
                    i_backword: Ext.i_backword,
                    c_comment: Ext.getCmp("reasonID").getValue(),
                    i_is_more: record.get("i_is_more"),
                    i_is_entrance: record.get("i_is_entrance"), //สถานะในเมนูแยก
                    i_type_bg: record.get("i_type_bg"),
                    id: record.get("id"),
                    dc_expense_budget_type_id: record.get("dc_expense_budget_type_id"),
                },
                method: "POST", //GET
                success: function (result, request) {
                    var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                    if (jsonData.success) {
                        Ext.MessageBox.alert("Success", jsonData.msg, function () {
                            Ext.getCmp("tabpanel1").getStore().reload();
                            Ext.getCmp("win-processID").destroy();
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

    Ext.buAct = null;
    Ext.yearTh = function () {
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
        return years;
    };

    Ext.store_year = new Ext.data.JsonStore({
        fields: ["id", "c_name"],
        autoDestroy: false,
        autoLoad: false,
        data: Ext.yearTh(),
    });
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

    function submitSearch(act) {

        Ext.storeDtl.setBaseParam("act", "SEARCH");
        if (act == "reset") {
            Ext.getCmp("value-box").setValue("");
            Ext.getCmp("filter").setValue("c_code");
//            Ext.getCmp("c_arrive_codeID").setValue("");
//            Ext.getCmp("c_doc_refID").setValue("");
//            Ext.getCmp("f_contract_amtID").setValue("");
            //dc_creditor_id
            Ext.getCmp("dc_creditor_idID").setValue(null);
            Ext.getCmp("dc_creditor_idID_Name").setValue("");
        } else {
          
            Ext.storeDtl.setBaseParam("mode", "LIST");
            Ext.storeDtl.setBaseParam("filter", Ext.getCmp("value-box").getValue()==""?"":Ext.getCmp("filter").getValue());
            Ext.storeDtl.setBaseParam("value", Ext.getCmp("value-box").getValue());

//            Ext.storeDtl.setBaseParam("c_code", Ext.getCmp("c_codeID").getValue());
//            Ext.storeDtl.setBaseParam("c_arrive_code", Ext.getCmp("c_arrive_codeID").getValue());
//            Ext.storeDtl.setBaseParam("c_doc_ref", Ext.getCmp("c_doc_refID").getgValue());
//            Ext.storeDtl.setBaseParam("f_contract_amt", Ext.getCmp("f_contract_amtID").getValue());
            Ext.storeDtl.setBaseParam("dc_creditor_id", Ext.getCmp("dc_creditor_idID_Name").getValue());
            Ext.storeDtl.load();
        }

    }
    Ext.SearchFrm = function (x, y) {

        Ext.storeCreditor = new Ext.data.JsonStore({
            autoLoad: true,
            autoDestroy: false,
            storeId: "myStoreCont",
            url: "tor/api/List_pop_creditor.php",
            baseParams: {mode: "LIST_POP_CREDITORBilling", id: 0},
            root: "data",
            idProperty: "id",
            totalProperty: "totalCount",
            fields: [{name: "no"}, {name: "dc_creditor_id"}, {name: "c_tax_number_imp"}, {name: "c_name"}],
        });
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
        Ext.popCreditor = new Ext.ux.Poplov({
            text: "เลือกผู้เสนอราคา",
            id: "dc_creditor_idID",
            iconCls: "page_magnify",
            valueHidden: "dc_creditor_id",
            store: Ext.storeCreditor,
            headerGrid: columnMini,
            widthText: 200,
            fieldLabel: "เลือกผู้เสนอราคา",
            isCellClickGrid: true,
            isSetFilter: true,
            cellClickGrid: function (grid, rowIndex, columnIndex, e) {
//                alert();
                var id = "dc_creditor_idID";
                var nameID = id + "_Name";
                var record = grid.getStore().getAt(rowIndex);
                var c_tax_number_imp = record.data.c_tax_number_imp == null ? "(ไม่มีเลขที่ประจำตัวผู้เสียภาษี)" : record.data.c_tax_number_imp;
                var TextShow = c_tax_number_imp + " : " + record.data.c_name;
                Ext.getCmp("dc_creditor_idID").setValue(record.data.dc_creditor_id);
                Ext.getCmp(nameID).setValue(TextShow);
                Ext.getCmp("win-pop-lov" + id).hide();
                Ext.getCmp("win-pop-lov" + id).destroy();
            },
        });


        if (typeof x === 'undefined' || x === null || x === '') {
            var xp = (100 + 10);
            var yp = (100 + 10);
        } else {
            var xp = x;
            var yp = y;
        }
        return new Ext.Window({
            title: "ค้นหารายการ",
            width: 700,
            id: "winSearchFrm",
            height: 250,
            layout: "fit",
            x: xp,
            y: yp,
            buttonAlign: "left",
            items: [
                {
                    layout: "column",
                    border: false,
                    defauls: {background: "#eee", },
                    items: [
                        {
                            columnWidth: 1,
                            layout: "form",
                            border: false,
                            bodyStyle: "padding:5px",
                            id: "frm-serachID",
                            items: [{
                                    xtype: "buttongroup",
                                    frame: false,
                                    fieldLabel: "ค้นหาโดย",
                                    items: [{
                                            id: "filter",
                                            xtype: "combo",
                                            width: 300,
                                            mode: "local",
                                            store: new Ext.data.SimpleStore({
                                                fields: ["value", "text"],
                                                data: [
//                                                    ["", "ไม่เลือก"],
                                                    ["c_code", "เลขPR"],
                                                    ["d_doc_ref", "เลขที่อ้างอิงPR"],
                                                    ["c_name", "ชื่อรายการ"],
                                                    ["c_contract_code", "เลขสัญญา สจ,สซ"],
                                                    ["c_ap_code", "เลขตรวจรับ AP"],
                                                    ["c_billing", "เลขวางบิล BL"], 
                                                ],
                                            }),
                                            value: "c_code",
                                            valueField: "value",
                                            displayField: "text",
                                            allowBlank: false,
                                            editable: false,
                                            triggerAction: "all",
                                            typeAhead: false,

                                        }, {xtype: "tbspacer", width: 4}
                                        , {
                                            xtype: "textfield",
                                            id: "value-box",
                                            width: 196,
                                            fieldLabel: "คำที่ต้องการค้นหา",
                                            emptyText: "คำที่ต้องการค้นหา",
                                            listeners: {
                                                keypress: function (field, e) {
                                                    if (e.getKey() === e.ENTER) {
                                                        submitSearch();
                                                    }
                                                }

                                            }
                                        }
                                    ]},
                                Ext.popCreditor.mini
                            ]
                        }
                    ],
                    buttonAlign: "left",

                    buttons: [
                        {
                            text: "ค้นหา",
                            icon: "../images/icons/application_form_magnify.png",
                            handler: submitSearch
                        },
                        {
                            text: "เริ่มใหม่",
                            icon: "../images/icons/reload.png",
                            handler: function () {
                                submitSearch("reset");
                            }
                        },
                        {
                            text: "ปิด",
                            icon: "../images/icons/bullet_cross.png",
                            handler: function () {
                                Ext.getCmp("winSearchFrm").hide();
                            }
                        }
                    ]
                }
            ]
        });
    };
    var MenuButton = function () {
        var menu = new Ext.menu.Menu({
            id: "mainMenu",
            border: false,
            style: {
                overflow: "visible",
            },
        });
        var tb = new Ext.Toolbar({
            text: " รายการเมนู ",
            border: false,
            icon: "../images/icons/text_list_bullets.png",
            iconCls: "menu",
            menu: menu,
        });
        tb.add({
            text: " รายการเมนู ",
            icon: "../images/icons/text_list_bullets.png",
            iconCls: "bmenu",
            border: false,
            bodyStyle: "padding:0px 0px 0px 0px !important;",
            menu: menu,
        });
        menu.addSeparator();
        menu.add({
            text: "ค้นหาข้อมูล",
            icon: "../images/icons/application_form_magnify.png"
        }).on("click", (click = function () {
            if (!Ext.isEmpty(Ext.getCmp("winSearchFrm")))
                Ext.getCmp("winSearchFrm").destroy();
            var s1 = Ext.SearchFrm();
            s1.show();
        }));
        menu.addSeparator();
        menu.add({
            text: 'เปิดหน้าต่างใหม่',
            icon: "../images/icons/application_form_magnify.png"
        }).on("click", (click = function () {

            window.open('#', 'Monitoring', 'fullscreen="yes"');
        }));
        menu.addSeparator();
        menu.add({
            text: 'เปิดดูเต็มจอ F11',
            icon: "../images/icons/application_form_magnify.png"
        }).on("click", (click = function () {
            requestFullScreen();
        }));
        menu.addSeparator();
        menu.add({
            text: 'Reload หน้าจอ',
            icon: "../images/icons/application_form_magnify.png"
        }).on("click", (click = function () {

            window.location.reload();
        }));
        menu.addSeparator();
        menu.add({
            text: "ค้นหาข้อมูล",
            icon: "../images/icons/application_form_magnify.png"
        }).on("click", (click = function () {

        }));
        tb.doLayout();
        return Ext.leftSearch(tb, '', {
            xtype: 'button',
            text: "คู่มือการใช้งาน",
            icon: "../images/icons/page_white_powerpoint.png",
            handler: function () {
                var winTutorial = new Ext.Window({
                    title: "คู่มือการใช้งาน PR ก่อนออกเลขสํญญา",
                    iconCls: "icon-application-view-list",
                    id: "winTutorial_torID",
                    modal: true,
                    plain: true,
                    collapsible: true,
                    maximizable: true,
                    border: false,
                    layout: 'fit',
                    width: Ext.getCmp("contenterCenter").getWidth(),
                    height: Ext.getCmp("contenterCenter").getHeight(),
                    html: '<iframe src="./tutorial/tutorial_1.php" frameborder="0" width="100%" height="100%"></iframe>',
                });
                winTutorial.show();
//                Ext.getCmp("winTutorial_torID").update('<iframe src="./sp/tutorial/tutorial_1.php" frameborder="0" width="100%" height="100%"></iframe>');
            }
        });
    }; // MenuButton
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
/// searchGrid Extend
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
                                let saveDtl = function (mode) {
                                    let msg = "";
                                    let jsonArr = [];
                                    let sto = Ext.getCmp("tabpanel1").store.data.items;
                                    sto.forEach(function (v) {
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
            Ext.FormPanel, {}
    );
/////////////////// gridMain
    Ext.extend(
            (gridMain = function () {
                Ext.openPDF = function (rs) {
//              alert();
//              return false;
                    Ext.buAct = "FlowcartL2";
                    var linkDownload = window.location.protocol + '//' + window.location.hostname + '/sp_mn/api/upload_ap/';
                    if (Ext.isEmpty(Ext.selectRow))
                        Ext.selectRow = rs;
                    // Ext.MessageBox.alert("แจ้งเตือน", "กรุณากดเลือกข้อมูลที่จะแสดง");
                    window.open(linkDownload + Ext.selectRow.get('upload_name') + '?T=Tap_' + Math.floor(Math.random() * 100000), 'Monitoring', 'fullscreen="yes"');
                };
                Ext.colmnn = [
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
                        header: "id",
                        sortable: false,
                        align: "left",
                        dataIndex: "id",
                        hidden: true, // icon: "../images/icons/application_view_tile.png" 
                    },
                    {
                        header: "รหัส PR",
                        sortable: false,
                        align: "left",
                        dataIndex: "c_code",
                        width: 120,
                    }, {
                        header: "สถานะการดำเนินงาน",
                        sortable: false,
                        align: "left",
                        dataIndex: "c_code_status",
                        hidden: false, width: 200,
                        renderer: function (value, metaData, record, row, col, store, gridView) {
                            metaData.attr = "style='color:blue;font-weight:bold;cursor:pointer; ';";
                            return value == null ? "" : value + " " + record.get("c_name_status");
                        },
                    },
                    {
                        header: "อัพเดทสถานะ",
                        sortable: false,
                        align: "center",
                        dataIndex: "id",
                        id: "processDueID",
                        width: 155,
                        renderer: function (value, metaData, record, row, col, store, gridView) {
                            var BtnText, IconImg, Sty = 'font-size:12px; color:#000;';
                            if (record.get("i_is_register") == 0) {
                                BtnText = '&nbspยังไม่บันทึกรายการ';
                                IconImg = '../images/icons/lock_start.png'; //xhtml_delete.png
                            } else if (record.get("i_is_register") == 1) {
                                BtnText = 'บันทึกข้อมูลเรียบร้อย';
                                Sty = 'font-size:12px; color:blue;';
                                IconImg = '../images/icons/cog_start.png';
                            } else if (record.get("i_is_register") == 2) {
                                BtnText = 'บันทึกข้อมูลเรียบร้อย';
                                IconImg = '../images/icons/xhtml_delete.png';
                            } else {
                                BtnText = '&nbspยังไม่บันทึกรายการ';
                                IconImg = '../images/icons/xhtml_delete.png';
                            }
                            var style = Sty + 'border:1px solid #ccc; width:150px; padding:3px 3px 3px 10px; background: #f0f0f0 url(' + IconImg + ') no-repeat 3px center; cursor: pointer;';
                            return '<button style="' + style + '" type="button">' + BtnText + '</button>';
                        }
                    }, {
                        header: "เลขสัญญา",
                        align: "left",
                        id: "c_contract_codeID",
                        dataIndex: "c_contract_code",
                        width: 100,
                        renderer: function (value, metadata, record) {
                            metadata.attr = 'style="padding-left:5px;"';
                            return value;
                        }
                    },
                    {
                        header: "เรื่อง/โครงการ",
                        sortable: true,
                        align: "left",
                        dataIndex: "c_name",
                        width: 250,
//                        renderer: function (value, metadata, record) {
//                            metadata.attr = 'ext:qtip="' + value + ' เลขอ้างอิง ' + record.get('d_doc_ref') + ' ผู้รับผิดชอบ '+record.get('c_emp_name')+'"'; 
//                            return value;
//                        }
                    },
                    {
                        header: "เลขสารบัญ",
                        sortable: true,
                        align: "right",
                        dataIndex: "index_receive",
                        width: 80,
                    },
                    {
                        header: "วันที่ PR",
                        sortable: false,
                        align: "center",
                        dataIndex: "d_tor_date",
                    },
                    {
                        header: "วิธีดำเนินงาน",
                        width: 70,
                        sortable: false,
                        align: "left",
                        dataIndex: "c_tor_type",
                    },
                    {
                        header: "ขอดำเนินการ",
                        sortable: false,
                        align: "left",
                        width: 70,
                        dataIndex: "c_purchase",
                    },
                    {
                        header: "ประเภทการใช้เงิน",
                        sortable: false,
                        align: "left",
                        width: 120,
                        dataIndex: "i_type_bgTxt",
                    },
                    {
                        header: "รหัสเอกสารอ้างอิง",
                        sortable: false,
                        align: "left",
                        dataIndex: "d_doc_ref",
                    },
                    {
                        header: "หน่วยงานที่รับผิดชอบ",
                        align: "left",
                        dataIndex: "dc_cost_idTxt",
                    },
                    {
                        header: "หน่วยงานเจ้าของเรื่อง",
                        align: "left",
                        dataIndex: "dc_cost2_idTxt",
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
                    iconCls: 'icon-grid',
                    title: ' ' + Ext.title,
                    xtype: "grid",
                    id: "tabpanel1",
                    border: true,
                    stripeRows: true,
                    loadMask: true,
                    //------------------
                    layout: "fit",
                    clicksToEdit: 2,
                    // clicksToEdit: 2,
                    viewConfig: {
                        emptyText: "ไม่มีข้อมูล..",
                        deferEmptyText: true,
                    },
                    listeners: {
                        render: (g) => {
                            Ext.application.toolTip(g);
                            Ext.Msg.minWidth = 200;
                        },
                        dblclick: function () {
                            Ext.getCmp('tabpanel1').getEl().mask("Please wait...", "x-mask-loading");
                            Ext.formPanelMain(Ext.selectObj());
                        },
                        cellclick: function (grid, rowIndex, columnIndex, e) {
                            let record = grid.getStore().getAt(rowIndex), jsStatusMenu = getScript(record.get('c_code_status'));
                            let columnModel = grid.getColumnModel(); // Get column model 
                            Ext.dataIndex = columnModel.getDataIndex(columnIndex);
                            Ext.cellData = record.get(Ext.dataIndex);
                            Ext.getCmp("tabpanel1").setTitle("<span style='white-space: nowrap;'>สถานะดำเนินรายการ PR -> " + record.get('c_code') + "<b style='color:red'>&nbsp;&nbsp;สถานะ" + record.get('c_code_status') + "</b></span>");
                            if (!Ext.isEmpty(record)) {
                                console.log(record.get('c_code_status') + ' scripts/' + jsStatusMenu);
                                loadScript('scripts/' + jsStatusMenu, record);
                            }

                            if (Ext.isEmpty(Ext.selectRow))
                                Ext.selectRow = record;
                            if (columnIndex === grid.getColumnModel().getIndexById("c_contract_codeID")) {
                                if (record.get('c_contract_code') == '-') {
                                    Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>ยังไม่มีเลขสัญญา</span><br>", function (bu, action) {
                                        return false;
                                    });
                                    return false;
                                } else {

                                }
                            } else if (columnIndex === grid.getColumnModel().getIndexById("processDueID")) {
//@TODO
                                Ext.application.underContruction(3); // 

                                var rec = record;
                                Ext.Msg.buttonText = {
                                    ok: "ตกลง",
                                    cancel: "ยกเลิก",
                                    yes: "ผ่านรายการ",
                                    no: "ไม่",
                                };
                                if (rec.get("i_step") == 0)
                                    Ext.Msg.alert("แจ้งเตือน", "ต้องบันทึกลงทะเบียนก่อนผ่านรายการ", function (bu, action) {
                                        return false;
                                    }); 
                                if (rec.get('c_code_status') == "ST0009"){ 
                                    Ext.Msg.show({
                                        title: 'แจ้งเตือน',
                                        msg: 'คุณต้องการ ไปที่เมนูลงรายละเอียดในสัญญา/จองเงิน/ทำงวดงาน ?',
                                        width: 440,
                                        icon: Ext.MessageBox.QUESTION,
                                        buttons: Ext.MessageBox.YESNO,
                                        fn: function (btn) {
                                            if (btn === 'yes') {
                                                window.parent.Ext.getCmp("content-panel").update('<iframe id="mainContenID" onload="Ext.accessObj()" src="./sp/contract.php?st=ST0009" frameborder="0" width="100%" height="100%"></iframe>');
                                                window.parent.localStorage.setItem('menu_procure', 'sp/contract.php?st=ST0009');
                                                window.parent.Ext.History.add('sp/tor_ap_po.php?st=pro0002');
                                                window.parent.localStorage.setItem('menu_procureTxt', this.text);
                                            } else {
                                                null;
                                            }
                                        }
                                    });
 
                                    return;
                                } else {
                                    if (rec.get("i_is_register") != 1) {
                                        Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>กรุณาบันทึกรายการก่อนผ่านรายการ</span><br>", function (bu, action) {
                                            return false;
                                        });
                                        return;
                                    }
                                }


                                if (rec.get("sp_bg_edit") == 1) {
                                    Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>PR อยู่ระหว่างแก้ไขงบประมาณ</span><br>", function (bu, action) {
                                        return false;
                                    });
                                    return;
                                }
                                Ext.Msg.buttonText = {
                                    ok: "ตกลง",
                                    cancel: "ยกเลิก",
                                    yes: "ผ่านรายการ",
                                    no: "ไม่",
                                };
                                winProcess(record);
                                Ext.getCmp("reasonID").setValue(record.get("c_comment"));
                            } else if (columnIndex === grid.getColumnModel().getIndexById("openPDFID")) {
                                Ext.openPDF(record);
                            }

                        },
                        beforeedit: function (g) {
                            if (g.rowIdx === 1)
                                return false;
                        },
                        afteredit: function (g) {
                        },
                        viewready: function (g) {
                            Ext.getFstRecordMappingSrcFIle(g);
                        },
                        beforerender: function (g) {
                            this.on("contextmenu", function (e, grid, rowIndex, columnIndex) {
                                e.stopEvent();
                                Ext.contextMenu.showAt(e.getXY());
                            }, this);
                            Ext.contextMenu(Ext.selectRow); //torUiBilling
                            Ext.hotKeyGrid(); //torUiBilling
                            Ext.formPanelMain = function () {
                                Ext.buAct = "update";
                                Ext.loadStore("edit", true, Ext.selectRow); // app,data.load
                            };
                            Ext.selectObj = function (rs) {
                                return Ext.selectRow = Ext.selectRow ? Ext.selectRow : rs;
                            };
                            Ext.getFstRecordMappingSrcFIle = (grid) => { //function
                                var store = grid.getStore();
                                store.load({
                                    callback: function (records) {
                                        if (records.length > 0) {
                                            let record1 = records[0], jsStatusMenu = getScript(records[0].get('c_code_status'));
                                            let ttTxt = "<span style='white-space: nowrap;'>"
                                                    + "สถานะดำเนินรายการ PR ->  "
                                                    + record1.get('c_code')
                                                    + "<b style='color:red'>&nbsp;&nbsp;สถานะ"
                                                    + record1.get('c_code_status')
                                                    + "</b></span>";

                                            Ext.dataIndex = 'c_code_status';
                                            Ext.cellData = record1.get(Ext.dataIndex);
                                            Ext.getCmp("tabpanel1").setTitle(ttTxt);

                                            if (!Ext.isEmpty(record1)) {
                                                if (Object.keys(record1).length > 0) {
//                                                    console.log(record1.get('c_code_status') + ' scripts/' + jsStatusMenu);
                                                    loadScript('scripts/' + jsStatusMenu, store.getAt(0));
                                                }
                                            }
                                            Ext.selectRow = records[0];

                                        }
                                    }
                                });
                            }; //function

                        },
                        afterrender: function (g) {
//                            Ext.getFstRecordMappingSrcFIle(g);
                        }
                    },
                    store: Ext.storeDtl,
                    tbar: MenuButton(),
                    columns: Ext.colmnn,
                    bbar: new Ext.PagingToolbar({
                        pageSize: 20,
                        store: Ext.storeDtl,
                        displayInfo: true,
                        displayMsg: "Displaying topics {0} - {1} of {2}",
                    }),
                });
            }), Ext.grid.EditorGridPanel, {});


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
