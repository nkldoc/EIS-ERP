/* global Ext, user_right_add, user_right_edit, user_right_delete */
function purchase2(id, bg_reserve_money_id, ii) {
    console.log(id + " == " + bg_reserve_money_id + " == " + ii);
    Ext.Ajax.request({
        url: "tor/api/mnTorController.php",
        params: {
            mode: "UPDATE_TOR_BG", //UPDATE_TOR_DTL_BG
            hdr_id: id, //sp_dtl_id
            bg_reserve_money_id: bg_reserve_money_id,
            ii: ii,
        },
        method: "POST", //POST
        success: function (result, request) {
            Ext.store2.load({
                params: {id: Ext.HDR_ID},
                callback: function (records, operation, success) {},
            });
            // Ext.getCmp("winDcExpTypeDddID").getEl().unmask();
        },
        failure: function (result, request) {
            Ext.MessageBox.alert("Failed", result.responseText); // connect error
        },
    });
    Ext.getCmp("button" + ii).disable();
}
function setDisabled_button(i, v) {
    // v1 == button
    // v2 ==
    if (v == 1) {
        var buttonName = "button" + i;
        var button = Ext.getCmp(buttonName);
        button.setDisabled(false);
    }
    if (v == 2) {
        var combotype_name = "dc_expense_budget_type_hdr_id" + i;
        Ext.getCmp(combotype_name).setReadOnly(true);
    }
}
function purchase1(id, bg_reserve_money_id, ii) {
    console.log(id + " == " + bg_reserve_money_id + " == " + ii);
    Ext.Ajax.request({
        url: "tor/api/mnTorController.php",
        params: {
            mode: "UPDATE_TOR_DTL_BG", //UPDATE_TOR_DTL_BG
            sp_dtl_id: id, //sp_dtl_id
            bg_reserve_money_id: bg_reserve_money_id,
            ii: ii,
        },
        method: "POST", //POST
        success: function (result, request) {
            Ext.store2.load({
                params: {id: Ext.HDR_ID},
                callback: function (records, operation, success) {},
            });
            Ext.getCmp("winPeriodDtlID").getEl().unmask();
        },
        failure: function (result, request) {
            Ext.MessageBox.alert("Failed", result.responseText); // connect error
        },
    });
    // Ext.getCmp("buttonDtlID").disable();
} 
function genBooklink(v, i) {
    var ii = i;
    var i_type = "dc_expense_budget_type" + i + "_id";
    var dc_expense_budget_type = Ext.selectRow.get(i_type);
    var po_expense_id = Ext.selectRow.get("po_expense_id");
    var pr_type = "i_pr_type" + i;
    var i_pr_type = Ext.selectRow.get(pr_type);
    var ip = Ext.session.ip_booking; // 192
    var i_amount_bg = Ext.getCmp("i_amount_bgID").getValue().inputValue;

    var i_yyyy = Ext.getCmp("i_yyyyID").getValue();
    if (i_yyyy != Ext.selectRow.get("i_yyyy")) {
        var i_yyyy = Ext.getCmp("i_yyyyID").getValue();
    }
    if (
            i_pr_type == null ||
            dc_expense_budget_type == null ||
            dc_expense_budget_type != Ext.getCmp("dc_expense_budget_type_hdr_id1").getValue() ||
            Ext.selectRow.get("po_expense_id") != Ext.getCmp("po_expense_hdr_idID").getValue()
            ) {
        var po_expense_id = Ext.getCmp("po_expense_hdr_idID").getValue();
        var i_pr_type = null;
        if (i == 1) {
            i_pr_type = Ext.getCmp("i_pr_type1ID").getValue().inputValue;
            dc_expense_budget_type = Ext.getCmp("dc_expense_budget_type_hdr_id1").getValue();
        } else if (i == 2) {
            i_pr_type = Ext.getCmp("i_pr_type2ID").getValue().inputValue;
            dc_expense_budget_type = Ext.getCmp("dc_expense_budget_type_hdr_id2").getValue();
        } else {
            i_pr_type = Ext.getCmp("i_pr_type3ID").getValue().inputValue;
            dc_expense_budget_type = Ext.getCmp("dc_expense_budget_type_hdr_id3").getValue();
        }
        Ext.Ajax.request({
            url: "tor/api/mnTorController.php",
            method: "POST",
            params: {
                mode: "ConFirm_Edit_bg",
                id: Ext.selectRow.get("id"),
                type: i,
                i_pr_type: i_pr_type,
                dc_expense_budget_type: dc_expense_budget_type,
                f_total: v.replace(/,/g, "") / 1,
                buy: 1,
                i_edit_tor: 3,
                po_expense_id: po_expense_id,
                i_amount_bg: i_amount_bg,
                f_total_pr: Ext.getCmp("f_totalID").getValue().replace(/,/g, "") / 1,
                i_yyyy: i_yyyy,
            },
            success: function (result, request) {
                Ext.storeDtl.reload({callback: function (record, operation, success) {}});
                var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                if (jsonData.success) {
                } else {
                    Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                }
            },
            failure: function (result, request) {
                Ext.MessageBox.alert("Failed", result.responseText); // connect error
            },
        });
    }
    var link =
            Ext.session.IPAPIBG +
            "/?/bg/mn_BgReserveMoney/mode/POST" +
            "/i_sys/1" +
            "/pr_id/" +
            Ext.selectRow.get("id") +
            "/po_id/0" +
            "/chk_id/0" +
            "/i_year/" +
            i_yyyy +
            "/i_pr_type/" +
            i_pr_type + //  plan or period
            "/i_reserve/1" + // step 1 PR step 2 po step3 checking
            "/dc_cost_id/" +
            Ext.selectRow.get("dc_cost_id") +
            "/dc_budget_type_id/" +
            dc_expense_budget_type +
            // Ext.selectRow.get(i_type) +
            "/bg_expense_id/" +
            po_expense_id +
            "/i_last/1" +
            "/f_amt/" +
            v;

    var link2 =
            Ext.session.IPAPIBG +
            "/?/bg/BgBudgetAllSupplies" +
            "/i_year/" +
            i_yyyy +
            "/dc_budget_type_id/" +
            dc_expense_budget_type +
            // Ext.selectRow.get(i_type) +
            "/dc_cost_id/" +
            Ext.selectRow.get("dc_cost_id") +
            "/bg_expense_id/" +
            po_expense_id;
    // console.log(link2);
    // return false;
    Ext.Ajax.request({
        url: link2,
        method: "GET", //POST
        disableCaching: false,
        success: function (result, request) {
            Ext.getCmp(Ext.poFormID).getEl().unmask();
            var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
            if (jsonData.totalCount > 0) {
                var f_amt = 0;
                var cheVal = v.replace(/,/g, "") / 1;
                if (i_pr_type == 1) {
                    f_amt = parseFloat(jsonData.data[0].f_total_plan);
                } else {
                    f_amt = parseFloat(jsonData.data[0].f_total_dtl);
                }
                if (f_amt >= cheVal) {
                    var f_amt_sum = f_amt - cheVal;
                    var c_name_dc_expense_budget_type = getStoreItems(Ext.dc_expense_budget_type, dc_expense_budget_type, "c_name");
                    var c_name_po_expense_id = getStoreItems(Ext.po_expense, po_expense_id, "c_name");
                    Ext.Msg.show({
                        title: "แจ้งเตือน!",
                        msg: "ยืนยันการจองเงิน แหล่งเงิน : " + c_name_dc_expense_budget_type + "\n",
                        width: 400,
                        icon: Ext.MessageBox.QUESTION,
                        buttons: Ext.MessageBox.YESNO,
                        fn: function (btn, text) {
                            if (btn === "yes") {
                                Ext.getCmp(Ext.poFormID).getEl().mask("Please wait...", "x-mask-loading");
                                Ext.Ajax.request({
                                    url: link,
                                    method: "GET", //POST
                                    disableCaching: false,
                                    success: function (result, request) {
                                        var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                                        if (jsonData.success) {
                                            Ext.MessageBox.alert("Success", "ทำการเรียบร้อยแล้ว", function () {
                                                var alert_text = "มีการจองเงิน PR " + "\n";
                                                alert_text += "วันเวลา : " + new Date().toLocaleString("en-ZA") + "\n";
                                                alert_text += "PR : " + Ext.selectRow.data.c_code + "\n";
                                                // alert_text += "Host : " + location.host + "\n";
                                                alert_text += "แหล่งเงิน : " + c_name_dc_expense_budget_type + "\n";
                                                alert_text += "หมวดค่าใช้จ่าย : " + c_name_po_expense_id + "\n";
                                                // alert_text += "เหตุผล : " + Ext.getCmp("reason_Edit_bgID").getValue() + "\n";
                                                alert_text += "ชื่อผู้ดำเนินรายการ : " + Ext.session.user_name + "\n";
                                                alert_text += "ชื่อรายการ : " + Ext.selectRow.get("c_name") + "\n";
                                                alert_text += "จำนวนเงิน : " + floatRenderer(floatMinus(String(v).replace(/,/g, ""), 2)) + "\n";
                                                alert_text += "เงินคงเหลือหลังจอง : " + floatRenderer(floatMinus(String(f_amt_sum).replace(/,/g, ""), 2)) + "\n";
                                                // alert_text += "จำนวนเงิน : " + floatRenderer(floatMinus(String(Ext.selectRow.get("f_total_amt")).replace(/,/g, ""), 2)) + "\n";
                                                Ext.Ajax.request({
                                                    url: Ext.session.Notif_line,
                                                    method: "POST",
                                                    params: {
                                                        msg: alert_text,
                                                        mode: 3
                                                    },
                                                });
                                                Ext.storeDtl.reload({
                                                    callback: function (record, operation, success) {
                                                        if (success) {
                                                            Ext.bgMode.isbook = true;
                                                            Ext.getCmp(Ext.poFormID).getEl().unmask();
                                                            purchase2(Ext.selectRow.get("id"), jsonData.bg_reserve_money_id, ii);
                                                            Ext.getCmp("po_expense_hdr_idID").setReadOnly(true);
                                                            Ext.getCmp("i_type_bgID").setReadOnly(true);
                                                            setDisabled_button(i, 2);
                                                            Ext.getCmp("tabpanel1").getStore().reload();
                                                        }
                                                    },
                                                });
                                                setDisabled_button(i, 2);
                                                null
                                            });
                                        } else {
                                            setDisabled_button(i, 1);
                                            Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                                        }
                                    },
                                    failure: function (result, request) {
                                        setDisabled_button(i, 1);
                                        Ext.MessageBox.alert("Failed", result.responseText); // connect error
                                    },
                                });
                            } else {
                                setDisabled_button(i, 1);
                                null;
                            }
                        },
                    });
                } else {
                    setDisabled_button(i, 1);
                    Ext.MessageBox.alert("Success", "เงินไม่พอที่จะจอง กรุณาติดต่อฝ่ายคลังงบประมาณ", function () {
                        Ext.getCmp(Ext.poFormID).getEl().unmask();
                    });
                }
            } else {
                Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
            }
        },
        failure: function (result, request) {
            Ext.MessageBox.alert("Failed", result.responseText); // connect error
        },
    });

    return link;
}
Ext.bgMode = Ext.apply({i_amount_bgID: 1, isbook: false});
Ext.getBodyMultiBudget = function (rec, status) {
    i_amount_bg = Ext.selectRow.get("i_amount_bg") || Ext.selectRow.json.i_amount_bg
    if (Ext.selectRow.json.sp_type_bg == 1) {
        var bg_reserve_money1_id = Ext.selectRow.get("bg_reserve_money1_id") > 0 || Ext.selectRow.json.bg_reserve_money1_id > 0 ? true : false;
        var bg_reserve_money2_id = Ext.selectRow.get("bg_reserve_money2_id") > 0 || Ext.selectRow.json.bg_reserve_money2_id > 0 ? true : false;
        var bg_reserve_money3_id = Ext.selectRow.get("bg_reserve_money3_id") > 0 || Ext.selectRow.json.bg_reserve_money3_id > 0 ? true : false;
        var i_type_bg = Ext.selectRow.json.i_type_bg == 4 || Ext.selectRow.json.i_type_bg == 2 ? true : false;
        var i_pr_type = Ext.selectRow.get("i_pr_type1") || Ext.selectRow.json.i_pr_type1;
        var dc_expense_budget_type2_id = Ext.selectRow.get("dc_expense_budget_type2_id") || Ext.selectRow.json.dc_expense_budget_type2_id;
        var dc_expense_budget_type3_id = Ext.selectRow.get("dc_expense_budget_type3_id") || Ext.selectRow.json.dc_expense_budget_type3_id;
        var i_pr_type2 = Ext.selectRow.get("i_pr_type2") || Ext.selectRow.json.i_pr_type2;
        var i_pr_type3 = Ext.selectRow.get("i_pr_type3") || Ext.selectRow.json.i_pr_type3;
    } else if (Ext.selectRow.json.sp_type_bg != 1) {
        var bg_reserve_money1_id = false;
        var bg_reserve_money2_id = false;
        var bg_reserve_money3_id = false;
        var i_type_bg = Ext.selectRow.json.i_type_bg == 4 || Ext.selectRow.json.i_type_bg == 2 ? true : false
        var i_pr_type = Ext.selectRow.get("i_pr_type1") || Ext.selectRow.json.i_pr_type1
    } else {
        var bg_reserve_money1_id = true;
        var bg_reserve_money2_id = true;
        var bg_reserve_money3_id = true;
        var i_type_bg = Ext.selectRow.json.i_type_bg == 4 || Ext.selectRow.json.i_type_bg == 2 ? true : false
        var i_pr_type = Ext.selectRow.get("i_pr_type1") || Ext.selectRow.json.i_pr_type1
    }
    if (Ext.selectRow.data.sp_bg_edit == 1) {
        Ext.MessageBox.alert("แจ้งเตือน", "อยู่ระหว่างการแก้ไขแหล่งเงินไม่สามารถแก้ไขรายการได้");
        return;
    }
    if (Ext.selectRow.data.i_pr_type != undefined) {
        Ext.getCmp("i_pr_type1ID").setValue(i_pr_type);
    }
    if (status == 'st0001.1') {
        if (rec != null) {
            let po_expense_id = rec.data.po_expense_id;
            let id_1 = getStoreItems(Ext.po_expense_expire, po_expense_id, "id");
            let id_2 = getStoreItems(Ext.po_expense, po_expense_id, "id");
            if (id_1 != id_2) {
                expense_expire = Ext.po_expense;
            } else {
                expense_expire = Ext.po_expense_expire;
            }
        } else {
            expense_expire = Ext.po_expense_expire;
        }
    } else {
        expense_expire = Ext.po_expense;
    }
    var comboExpense = new Ext.form.ComboBox({
        mode: "local",
        store: expense_expire,
        valueField: "id",
        displayField: "c_name",
        anchor: "80%",
        submitValue: true,
        name: "c_detail",
        id: "po_expense_hdr_idID",
        hiddenName: "po_expense_id",
        triggerAction: "all",
        allBlank: true,
        forceSelection: true,
        selectOnFocus: true,
        readOnly: bg_reserve_money1_id,
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
            blur: function () {
                this.getStore().clearFilter();
                console.log(this);
            },
        },
    });
    var comboTypeBg = new Ext.form.ComboBox({
        mode: "local",
        store: Ext.dc_expense_budget_type,
        fieldLabel: "แหล่งเงิน",
        anchor: "80%",
        submitValue: true,
        name: "dc_expense_budget_type_idTxt",
        hiddenName: "dc_expense_budget_type_id",
        id: "dc_expense_budget_type_hdr_id1",
        readOnly: bg_reserve_money1_id,
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
                    //Test อุดหนุน
                    // if (Ext.i_bg_type) {
                    //   Ext.Msg.alert("แจ้งเตือน", "แหล่งเงินเป็นเงินอุดหนุน/เงินงวด จะต้องทำการจองก่อนเงินทำสัญญา", function (form, action) {
                    //     Ext.isCostPrExist = 0;
                    //     return false;
                    //   });
                    // }
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
    });
    var comboTypeBg2 = new Ext.form.ComboBox({
        mode: "local",
        store: Ext.dc_expense_budget_type,
        fieldLabel: "แหล่งเงิน",
        anchor: "80%",
        submitValue: true,
        name: "dc_expense_budget_type_idTxt2",
        hiddenName: "dc_expense_budget_type2_id",
        id: "dc_expense_budget_type_hdr_id2",
        readOnly: bg_reserve_money2_id,
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
                    // if (Ext.i_bg_type) {
                    //   Ext.Msg.alert("แจ้งเตือน", "แหล่งเงินเป็นเงินอุดหนุน/เงินงวด จะต้องทำการจองก่อนเงินทำสัญญา", function (form, action) {
                    //     Ext.isCostPrExist = 0;
                    //     return false;
                    //   });
                    // }
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
    });
    var comboTypeBg3 = new Ext.form.ComboBox({
        mode: "local",
        store: Ext.dc_expense_budget_type,
        fieldLabel: "แหล่งเงิน",
        anchor: "80%",
        submitValue: true,
        name: "dc_expense_budget_type_idTxt3",
        hiddenName: "dc_expense_budget_type3_id",
        id: "dc_expense_budget_type_hdr_id3",
        readOnly: bg_reserve_money3_id,
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
                    // if (Ext.i_bg_type) {
                    //   Ext.Msg.alert("แจ้งเตือน", "แหล่งเงินเป็นเงินอุดหนุน/เงินงวด จะต้องทำการจองก่อนเงินทำสัญญา", function (form, action) {
                    //     Ext.isCostPrExist = 0;
                    //     return false;
                    //   });
                    // }
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
    });
    Ext.getCmp('dc_expense_budget_type_hdr_id2').setValue(dc_expense_budget_type2_id);
    Ext.getCmp('dc_expense_budget_type_hdr_id3').setValue(dc_expense_budget_type3_id);
    return [
        comboExpense,
        {
            xtype: "radiogroup",
            columns: [98, 98, 98, 98],
            fieldLabel: "จำนวนแหล่งเงิน",
            id: "i_amount_bgID",
            name: "i_amount_bg",
            value: i_amount_bg,
            items: [
                {
                    // checked: true,
                    // hidden: true,
                    name: "i_amount_bg",
                    inputValue: 1,
                    boxLabel: "1 แหล่งเงิน",
                },
                {
                    inputValue: 2,
                    name: "i_amount_bg",
                    boxLabel: "2 แหล่งเงิน",
                    listeners: {
                        change: function () {
                            // this.fn = function () {
                        },
                    },
                },
                {
                    inputValue: 3,
                    name: "i_amount_bg",
                    boxLabel: "3 แหล่งเงิน",
                },
            ], //radiogroup
            listeners: {
                afterRender: function () {
                    // console.log(Ext.bgMode);
                },
                change: function () {
                    if (Ext.bgMode.isbook == true) {
                        Ext.getCmp("i_amount_bgID").setValue(Ext.bgMode.i_amount_bgID);
                    }
                    Ext.bgMode.i_amount_bgID = Ext.getCmp("i_amount_bgID").getValue().inputValue;
                    if (bg_reserve_money1_id || bg_reserve_money2_id || bg_reserve_money3_id) {
                        Ext.Msg.alert("แจ้งเตือน", "จองเงินไปแล้วไม่สามารถแก้ไขรายการได้");
                        Ext.getCmp("i_amount_bgID").setValue(Ext.selectRow.json.i_amount_bg);
                    } else {
                        if (Ext.getCmp("i_amount_bgID").getValue().inputValue == 1) {
                            Ext.getCmp("fidldser_bg2").hide();
                            Ext.getCmp("fidldser_bg3").hide();
                            Ext.getCmp("f_type_amtID").setValue(floatRenderer(floatMinus(Ext.getCmp("f_totalID").getValue().replace(/,/g, ""))));
                        } else if (Ext.getCmp("i_amount_bgID").getValue().inputValue == 2) {
                            Ext.getCmp("fidldser_bg2").show();
                            Ext.getCmp("f_type_amtID").setValue(0);
                            Ext.getCmp("f_type_amtID2").setValue(0);
                            Ext.getCmp("f_type_amtID3").setValue(0);
                            Ext.getCmp("fidldser_bg3").hide();
                        } else if (Ext.getCmp("i_amount_bgID").getValue().inputValue == 3) {
                            Ext.getCmp("fidldser_bg2").show();
                            Ext.getCmp("f_type_amtID").setValue(0);
                            Ext.getCmp("f_type_amtID2").setValue(0);
                            Ext.getCmp("f_type_amtID3").setValue(0);
                            Ext.getCmp("fidldser_bg3").show();
                        }
                    }
                    //  Ext.getCmp('i_is_invGID').fn(this.getValue().inputValue);
                },
            },
        },
        {
            xtype: "fieldset",
            title: "การใช้เงินที่ 1",
            collapsible: true,
            autoHeight: true,
            defaults: {width: 210},
            defaultType: "textfield",
            items: [
                comboTypeBg,
                {
                    xtype: "radiogroup",
                    columns: [98, 98],
                    fieldLabel: "ขอดำเนินการ",
                    hidden: i_type_bg, //status != "st0001.1",
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
                    ],
                    listeners: {
                        change: function () {
                            if (bg_reserve_money1_id) {
                                Ext.Msg.alert("แจ้งเตือน", "จองเงินไปแล้วไม่สามารถแก้ไขรายการได้");
                                Ext.getCmp("i_pr_type1ID").setValue(i_pr_type);
                            }
                        },
                    },
                },
                {
                    xtype: "textfield",
                    fieldLabel: "จำนวนเงินแหล่งเงินที่ 1",
                    readOnly: status != "st0001.1",
                    name: "f_type_amt",
                    id: "f_type_amtID",
                    listeners: {
                        afterrender: function () {
                            this.fn = function () {
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
                            f_total_pr = Ext.getCmp("f_totalID").getValue().replace(/,/g, "") / 1;
                            f_type_amt = Ext.getCmp("f_type_amtID").getValue().replace(/,/g, "") / 1;
                            f_type_amt2 = Ext.getCmp("f_type_amtID2").getValue().replace(/,/g, "") / 1;
                            f_type_amt3 = Ext.getCmp("f_type_amtID3").getValue().replace(/,/g, "") / 1;
                            f_sum_type_amt = f_type_amt + f_type_amt2 + f_type_amt3;

                            if (f_sum_type_amt > f_total_pr || [null, 0, ""].includes(f_total_pr)) {
                                Ext.Msg.alert("แจ้งเตือน", "ยอดเงินเกิน PR");
                                Ext.getCmp("f_type_amtID").setValue(0);
                                Ext.getCmp("f_type_amtID2").setValue(0);
                                Ext.getCmp("f_type_amtID3").setValue(0);
                            }
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
                {
                    xtype: "buttongroup",
                    fieldLabel: "การจองเงิน",
                    id: "buttongroup1",
                    frame: false,
                    hidden: status != "st0001.1",
                    border: false,
                    items: [
                        {
                            xtype: "button",
                            text: "* บันทึกรายการจอง1",
                            id: "button1",
                            disabled: Ext.selectRow.get("bg_reserve_money1_id") > 0 ? true : false,
                            handler: function () {
                                var msg = "";
                                if ([null, 0, ""].includes(Ext.getCmp("po_expense_hdr_idID").getValue())) {
                                    msg += "- กรุณาเลือกหมวดค่าใช้จ่าย" + "\n";
                                }
                                if (Ext.getCmp("i_amount_bgID") == 2) {
                                    if ([null, 0, ""].includes(Ext.getCmp("i_pr_type1ID").getValue())) {
                                        msg += "- เลือกประเภทการจองก่อนกดปุ่ม" + "\n";
                                    }
                                    if ([null, 0, ""].includes(Ext.getCmp("i_pr_type2ID").getValue())) {
                                        msg += "- เลือกประเภทการจองก่อนกดปุ่ม" + "\n";
                                    }
                                    if ([null, 0, ""].includes(Ext.getCmp("f_type_amtID").getValue())) {
                                        msg += "- กรุณากรอกจำนวนเงิน" + "\n";
                                    }
                                    if ([null, 0, ""].includes(Ext.getCmp("f_type_amtID2").getValue())) {
                                        msg += "- กรุณากรอกจำนวนเงิน" + "\n";
                                    }
                                    if ([null, 0, ""].includes(Ext.getCmp("dc_expense_budget_type_hdr_id1").getValue())) {
                                        msg += "- กรุณาเลือกแหล่งเงิน" + "\n";
                                    }
                                    if ([null, 0, ""].includes(Ext.getCmp("dc_expense_budget_type_hdr_id2").getValue())) {
                                        msg += "- กรุณาเลือกแหล่งเงิน" + "\n";
                                    }
                                } else if (Ext.getCmp("i_amount_bgID") == 3) {
                                    if ([null, 0, ""].includes(Ext.getCmp("i_pr_type1ID").getValue())) {
                                        msg += "- เลือกประเภทการจองก่อนกดปุ่ม" + "\n";
                                    }
                                    if ([null, 0, ""].includes(Ext.getCmp("i_pr_type2ID").getValue())) {
                                        msg += "- เลือกประเภทการจองก่อนกดปุ่ม" + "\n";
                                    }
                                    if ([null, 0, ""].includes(Ext.getCmp("i_pr_type3ID").getValue())) {
                                        msg += "- เลือกประเภทการจองก่อนกดปุ่ม" + "\n";
                                    }
                                    if ([null, 0, ""].includes(Ext.getCmp("f_type_amtID").getValue())) {
                                        msg += "- กรุณากรอกจำนวนเงิน" + "\n";
                                    }
                                    if ([null, 0, ""].includes(Ext.getCmp("f_type_amtID2").getValue())) {
                                        msg += "- กรุณากรอกจำนวนเงิน" + "\n";
                                    }
                                    if ([null, 0, ""].includes(Ext.getCmp("f_type_amtID3").getValue())) {
                                        msg += "- กรุณากรอกจำนวนเงิน" + "\n";
                                    }
                                    if ([null, 0, ""].includes(Ext.getCmp("dc_expense_budget_type_hdr_id1").getValue())) {
                                        msg += "- กรุณาเลือกแหล่งเงิน" + "\n";
                                    }
                                    if ([null, 0, ""].includes(Ext.getCmp("dc_expense_budget_type_hdr_id2").getValue())) {
                                        msg += "- กรุณาเลือกแหล่งเงิน" + "\n";
                                    }
                                    if ([null, 0, ""].includes(Ext.getCmp("dc_expense_budget_type_hdr_id3").getValue())) {
                                        msg += "- กรุณาเลือกแหล่งเงิน" + "\n";
                                    }
                                } else {
                                    if ([null, 0, ""].includes(Ext.getCmp("i_pr_type1ID").getValue())) {
                                        msg += "- เลือกประเภทการจองก่อนกดปุ่ม" + "\n";
                                    }
                                    if ([null, 0, ""].includes(Ext.getCmp("f_type_amtID").getValue())) {
                                        msg += "- กรุณากรอกจำนวนเงิน" + "\n";
                                    }
                                    if ([null, 0, "", 2, 3, 4, 8, 9].includes(Ext.getCmp("i_type_bgID").getValue())) {
                                        msg += "- ประเภท PR นี้ไม่สามารถจองเงินได้" + "\n";
                                    }
                                }
                                if (msg != "") {
                                    Ext.example.msg("แจ้งเตือน", msg, 1);
                                    $(this).next("text copied");
                                    setTimeout(function () {
                                        $(this).next().remove();
                                    }, 6000);
                                    return;
                                } else {
                                    this.setDisabled(true);
                                    // Ext.getCmp("po_expense_hdr_idID").readOnly(true) ;
                                    Ext.getCmp(Ext.poFormID).getEl().mask("Please wait...", "x-mask-loading");
                                    // return false;
                                    genBooklink(Ext.getCmp("f_type_amtID").getValue(), 1);
                                }
                            },
                        },
                                // },
                    ],
                },
            ],
        },
        {
            xtype: "fieldset",
            title: "การใช้เงินที่ 2",
            collapsible: true,
            id: "fidldser_bg2",
            autoHeight: true,
            defaults: {width: 210},
            defaultType: "textfield",
            listeners: {
                afterrender: function () {
                    setTimeout(function () {
                        if (Ext.getCmp("i_amount_bgID").getValue().inputValue == 1) {
                            Ext.getCmp("fidldser_bg2").hide();
                        } else {
                            Ext.getCmp("fidldser_bg2").show();
                        }
                    }, 100);
                },
            },
            // hidden: true,
            items: [
                comboTypeBg2,
                {
                    xtype: "radiogroup",
                    columns: [98, 98],
                    fieldLabel: "ขอดำเนินการ2",
                    id: "i_pr_type2ID",
                    hidden: i_type_bg,
                    name: "i_pr_type2",
                    items: [
                        {
                            // checked: true,
                            name: "i_pr_type2",
                            inputValue: 1,
                            boxLabel: "จองแบบแผน",
                        },
                        {
                            inputValue: 2,
                            name: "i_pr_type2",
                            boxLabel: "จองแบบงวด",
                        },
                    ],
                    listeners: {
                        change: function () {
                            if (bg_reserve_money2_id) {
                                Ext.Msg.alert("แจ้งเตือน", "จองเงินไปแล้วไม่สามารถแก้ไขรายการได้");
                                // Ext.getCmp("i_pr_type2ID").setValue(Ext.selectRow.get("i_pr_type2"));
                                Ext.getCmp("i_pr_type2ID").setValue(i_pr_type2);

                            }
                        },
                    },
                },
                {
                    xtype: "textfield",
                    fieldLabel: "จำนวนเงินแหล่งเงิน2",
                    name: "f_type2_amt",
                    id: "f_type_amtID2",
                    value: 20,
                    listeners: {
                        blur: function () {
                            this.fn(true);
                            f_total_pr = Ext.getCmp("f_totalID").getValue().replace(/,/g, "") / 1;
                            f_type_amt = Ext.getCmp("f_type_amtID").getValue().replace(/,/g, "") / 1;
                            f_type_amt2 = Ext.getCmp("f_type_amtID2").getValue().replace(/,/g, "") / 1;
                            f_type_amt3 = Ext.getCmp("f_type_amtID3").getValue().replace(/,/g, "") / 1;
                            f_sum_type_amt = f_type_amt + f_type_amt2 + f_type_amt3;

                            // console.log(f_sum_type_amt);
                            if (f_sum_type_amt > f_total_pr || [null, 0, ""].includes(f_total_pr)) {
                                Ext.Msg.alert("แจ้งเตือน", "ยอดเงินเกิน PR");
                                Ext.getCmp("f_type_amtID").setValue(0);
                                Ext.getCmp("f_type_amtID2").setValue(0);
                                Ext.getCmp("f_type_amtID3").setValue(0);
                            }
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
                    xtype: "buttongroup",
                    id: "buttongroup2",
                    fieldLabel: "การจองเงิน2",
                    frame: false,
                    hidden: status != "st0001.1",
                    border: false,
                    items: [
                        {
                            xtype: "button",
                            text: "* บันทึกรายการจอง2",
                            id: "button2",
                            disabled: bg_reserve_money2_id,
                            // disabled: Ext.isAudit === false || Ext.selectRow.get("bg_reserve_money1_id") > 0 ? true : false,
                            handler: function () {
                                var msg = "";
                                if (Ext.getCmp("i_pr_type2ID").getValue() == null) {
                                    msg += "- เลือกประเภทการจองก่อนกดปุ่ม" + "\n";
                                }
                                if ([null, 0, ""].includes(Ext.getCmp("i_pr_type2ID").getValue())) {
                                    msg += "- กรุณากรอกจำนวนเงิน" + "\n";
                                }
                                if ([null, 0, ""].includes(Ext.getCmp("dc_expense_budget_type_hdr_id2").getValue())) {
                                    msg += "- กรุณาเลือกแหล่งเงิน" + "\n";
                                }
                                if (msg != "") {
                                    Ext.example.msg("แจ้งเตือน", msg, 1);
                                    $(this).next("text copied");
                                    setTimeout(function () {
                                        $(this).next().remove();
                                    }, 6000);
                                    return;
                                } else {
                                    Ext.getCmp(Ext.poFormID).getEl().mask("Please wait...", "x-mask-loading");

                                    // Ext.getCmp("winDcExpTypeDddID").getEl().mask("Please wait...", "x-mask-loading");
                                    this.setDisabled(true);
                                    genBooklink(Ext.getCmp("f_type_amtID2").getValue(), 2);
                                }
                            },
                        },
                    ],
                },
            ],
        },
        {
            xtype: "fieldset",
            title: "การใช้เงินที่ 3",
            collapsible: true,
            id: "fidldser_bg3",
            autoHeight: true,
            defaults: {width: 210},
            defaultType: "textfield",
            listeners: {
                afterrender: function () {
                    setTimeout(function () {
                        if ([1, 2].includes(Ext.getCmp("i_amount_bgID").getValue().inputValue)) {
                            Ext.getCmp("fidldser_bg3").hide();
                        } else {
                            Ext.getCmp("fidldser_bg3").show();
                        }
                    }, 100);
                },
            },
            // hidden: true,
            items: [
                comboTypeBg3,
                {
                    xtype: "radiogroup",
                    columns: [98, 98],
                    fieldLabel: "ขอดำเนินการ3",
                    hidden: i_type_bg,
                    id: "i_pr_type3ID",
                    name: "i_pr_type3",
                    items: [
                        {
                            // checked: true,
                            name: "i_pr_type3",
                            inputValue: 1,
                            boxLabel: "จองแบบแผน",
                        },
                        {
                            inputValue: 2,
                            name: "i_pr_type3",
                            boxLabel: "จองแบบงวด",
                        },
                    ],
                    listeners: {
                        change: function () {
                            if (Ext.selectRow.get("bg_reserve_money3_id") > 0) {
                                Ext.Msg.alert("แจ้งเตือน", "จองเงินไปแล้วไม่สามารถแก้ไขรายการได้");
                                Ext.getCmp("i_pr_type3ID").setValue(i_pr_type3);
                            }
                        },
                    },
                },
                {
                    xtype: "textfield",
                    fieldLabel: "จำนวนเงินแหล่งเงิน3",
                    name: "f_type3_amt",
                    id: "f_type_amtID3",
                    value: 20,
                    listeners: {
                        blur: function () {
                            this.fn(true);
                            f_total_pr = Ext.getCmp("f_totalID").getValue().replace(/,/g, "") / 1;
                            f_type_amt = Ext.getCmp("f_type_amtID").getValue().replace(/,/g, "") / 1;
                            f_type_amt2 = Ext.getCmp("f_type_amtID2").getValue().replace(/,/g, "") / 1;
                            f_type_amt3 = Ext.getCmp("f_type_amtID3").getValue().replace(/,/g, "") / 1;
                            f_sum_type_amt = f_type_amt + f_type_amt2 + f_type_amt3;

                            console.log(f_sum_type_amt);
                            if (f_sum_type_amt > f_total_pr || [null, 0, ""].includes(f_total_pr)) {
                                Ext.Msg.alert("แจ้งเตือน", "ยอดเงินเกิน PR");
                                Ext.getCmp("f_type_amtID").setValue(0);
                                Ext.getCmp("f_type_amtID2").setValue(0);
                                Ext.getCmp("f_type_amtID3").setValue(0);
                            }
                        },
                        afterrender: function () {
                            this.fn = function (t) {
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
                    xtype: "buttongroup",
                    id: "buttongroup3",
                    fieldLabel: "การจองเงิน3",
                    hidden: status != "st0001.1",
                    frame: false,
                    border: false,
                    items: [
                        {
                            xtype: "button",
                            text: "* บันทึกรายการจอง3",
                            id: "button3",
                            disabled: Ext.selectRow.get("bg_reserve_money3_id") > 0 ? true : false,
                            // disabled: Ext.isAudit === false || Ext.selectRow.get("bg_reserve_money1_id") > 0 ? true : false,
                            handler: function () {
                                var msg = "";
                                if (Ext.getCmp("i_pr_type3ID").getValue() == null) {
                                    msg += "- เลือกประเภทการจองก่อนกดปุ่ม" + "\n";
                                }
                                if ([null, 0, ""].includes(Ext.getCmp("i_pr_type3ID").getValue())) {
                                    msg += "- กรุณากรอกจำนวนเงิน" + "\n";
                                }
                                if ([null, 0, ""].includes(Ext.getCmp("dc_expense_budget_type_hdr_id3").getValue())) {
                                    msg += "- กรุณาเลือกแหล่งเงิน" + "\n";
                                }
                                if (msg != "") {
                                    Ext.example.msg("แจ้งเตือน", msg, 1);
                                    $(this).next("text copied");
                                    setTimeout(function () {
                                        $(this).next().remove();
                                    }, 6000);
                                    return;
                                } else {
                                    Ext.getCmp(Ext.poFormID).getEl().mask("Please wait...", "x-mask-loading");
                                    this.setDisabled(true);
                                    genBooklink(Ext.getCmp("f_type_amtID3").getValue(), 3);
                                }
                            },
                        },
                    ],
                },
            ],
        },
    ];
};
// UiEditBudget
const UiEditBudget = function (status, menu) {
    var statusx = status;
    // Ext.getCmp('po_expense_id_dtlID').setValue(Ext.getCmp('po_expense_hdr_idID').getValue());
    if (Ext.selectRow != null) {
        let po_expense_id = Ext.selectRow.data.po_expense_id;
        let id_1 = getStoreItems(Ext.po_expense_expire, po_expense_id, "id");
        let id_2 = getStoreItems(Ext.po_expense, po_expense_id, "id");
        if (id_1 != id_2) {
            expense_expire = Ext.po_expense
        } else {
            expense_expire = Ext.po_expense_expire
        }
    } else {
        expense_expire = Ext.po_expense_expire
    }
    var comboExpenseEdit = new Ext.form.ComboBox({
        mode: "local",
        store: expense_expire,
        valueField: "id",
        displayField: "c_name",
        anchor: "70%",
        submitValue: true,
        name: "c_detail",
        id: "po_expense_edit_idID",
        hiddenName: "po_expense_id",
        triggerAction: "all",
        allBlank: true,
        forceSelection: true,
        selectOnFocus: true,
        fieldLabel: "รายการย่อย",
        // readOnly: Ext.selectRow.get("bg_reserve_money1_id") > 0 ? true : false,
        width: 150,
        typeAhead: false,
        emptyText: "กรุณาเลือกใช้จ่าย...",
        listeners: {
            afterrender: function () {
                Ext.getCmp("po_expense_edit_idID").setValue(Ext.selectRow.data.po_expense_id)
                this.fn = function () {
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
                console.log(this);
            },
        },
    });
    var comboTypeBgEdit = new Ext.form.ComboBox({
        mode: "local",
        store: Ext.dc_expense_budget_type,
        fieldLabel: "แหล่งเงิน",
        anchor: "60%",
        submitValue: true,
        name: "dc_expense_budget_type_idTxt",
        hiddenName: "dc_expense_budget_type_id",
        id: "dc_expense_budget_type_edit_id",
        // hidden : status != "edit",
        // readOnly: Ext.selectRow.get("bg_reserve_money1_id") > 0 ? true : false,
        valueField: "id",
        displayField: "c_name",
        triggerAction: "all",
        forceSelection: true,
        selectOnFocus: true,
        typeAhead: false,
        emptyText: "กรุณาเลือกแหล่งเงิน...",

        listeners: {

            afterrender: function () {
                Ext.getCmp("dc_expense_budget_type_edit_id").setValue(Ext.selectRow.data.dc_expense_budget_type_id)

                this.fn = function () {
                    // Ext.getCmp('dc_expense_budget_type_idTxtID').setValue(Ext.getCmp('dc_expense_budget_type_hdr_id').getValue());
                    Ext.i_bg_type = Ext.getStoreItems(this.store, this.getValue(), "i_bg_type")
                    //Test อุดหนุน
                    // if(Ext.i_bg_type){
                    //     Ext.Msg.alert("แจ้งเตือน", "แหล่งเงินเป็นเงินอุดหนุน/เงินงวด จะต้องทำการจองก่อนเงินทำสัญญา" , function (form, action) {
                    //         Ext.isCostPrExist = 0;
                    //         return false;
                    //     });
                    // }
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
    });
    var comboTypeBgEdit2 = new Ext.form.ComboBox({
        mode: "local",
        store: Ext.dc_expense_budget_type,
        fieldLabel: "แหล่งเงิน",
        anchor: "60%",
        submitValue: true,
        name: "dc_expense_budget_type_edit_idTxt2",
        hiddenName: "dc_expense_budget_type2_edit_id",
        id: "dc_expense_budget_type_edit_id2",
        // hidden : status != "edit",
        // readOnly: Ext.selectRow.get("bg_reserve_money1_id") > 0 ? true : false,
        valueField: "id",
        displayField: "c_name",
        triggerAction: "all",
        forceSelection: true,
        selectOnFocus: true,
        typeAhead: false,
        emptyText: "กรุณาเลือกแหล่งเงิน...",

        listeners: {

            afterrender: function () {
                // Ext.getCmp("dc_expense_budget_type_edit_id").setValue(Ext.selectRow.data.dc_expense_budget_type_id)
                Ext.getCmp("dc_expense_budget_type_edit_id2").setValue(Ext.selectRow.data.dc_expense_budget_type2_id)

                this.fn = function () {
                    // Ext.getCmp('dc_expense_budget_type_idTxtID').setValue(Ext.getCmp('dc_expense_budget_type_hdr_id').getValue());
                    Ext.i_bg_type = Ext.getStoreItems(this.store, this.getValue(), "i_bg_type")
                    // if(Ext.i_bg_type){
                    //     Ext.Msg.alert("แจ้งเตือน", "แหล่งเงินเป็นเงินอุดหนุน/เงินงวด จะต้องทำการจองก่อนเงินทำสัญญา" , function (form, action) {
                    //         Ext.isCostPrExist = 0;
                    //         return false;
                    //     });
                    // }
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
    });
    var comboTypeBgEdit3 = new Ext.form.ComboBox({
        mode: "local",
        store: Ext.dc_expense_budget_type,
        fieldLabel: "แหล่งเงิน",
        anchor: "60%",
        submitValue: true,
        name: "dc_expense_budget_type_edit_idTxt3",
        hiddenName: "dc_expense_budget_type3_id",
        id: "dc_expense_budget_type_edit_id3",
        // hidden : status != "edit",
        // readOnly: Ext.selectRow.get("bg_reserve_money1_id") > 0 ? true : false,
        valueField: "id",
        displayField: "c_name",
        triggerAction: "all",
        forceSelection: true,
        selectOnFocus: true,
        typeAhead: false,
        emptyText: "กรุณาเลือกแหล่งเงิน...",

        listeners: {

            afterrender: function () {
                Ext.getCmp("dc_expense_budget_type_edit_id3").setValue(Ext.selectRow.data.dc_expense_budget_type3_id)

                this.fn = function () {
                    // Ext.getCmp('dc_expense_budget_type_idTxtID').setValue(Ext.getCmp('dc_expense_budget_type_hdr_id').getValue());
                    Ext.i_bg_type = Ext.getStoreItems(this.store, this.getValue(), "i_bg_type")
                    //Test อุดหนุน
                    // if(Ext.i_bg_type){
                    //     Ext.Msg.alert("แจ้งเตือน", "แหล่งเงินเป็นเงินอุดหนุน/เงินงวด จะต้องทำการจองก่อนเงินทำสัญญา" , function (form, action) {
                    //         Ext.isCostPrExist = 0;
                    //         return false;
                    //     });
                    // }
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
    });

    if (Ext.isEmpty(Ext.selectRow))
        Ext.Msg.alert("แจ้งเตือน", "กรุณา click เลือกข้อมูลที่จะยกเลิกรายการ", function (form, action) {
            return false;
        });
    else {
        if (Ext.selectRow.get("i_amount_bg") == 1) {
            height = 400
        } else if (Ext.selectRow.get("i_amount_bg") == 2) {
            height = 500
        } else {
            height = 600
        }
        new Ext.Window({
            id: "win-msg-edit_tor",
            title: "ส่งแก้ไขแหล่งเงิน",
            resizable: false,
            modal: true,
            collapsible: true,
            maximizable: true,
            plain: true,
            autoScroll: true,

            width: 750,
            height: height,
            layout: "form",
            listeners: {
                afterrender: function () {
                    Ext.getCmp("f_type_edit_amtID").setValue(Ext.selectRow.get("f_type_amt"));
                    Ext.getCmp("f_type_edit_amtID2").setValue(Ext.selectRow.get("f_type2_amt"));
                    Ext.getCmp("f_type_edit_amtID3").setValue(Ext.selectRow.get("f_type3_amt"));
                    Ext.getCmp("i_pr_type_edit_ID1").setValue(Ext.selectRow.get("i_pr_type1"));
                    Ext.getCmp("i_pr_type_edit_ID2").setValue(Ext.selectRow.get("i_pr_type2"));
                    Ext.getCmp("i_pr_type_edit_ID3").setValue(Ext.selectRow.get("i_pr_type3"));
                    Ext.getCmp("f_total_edit_ID").setValue(Ext.selectRow.get("f_total_amt"));
                    // if()
                    // 
                    // Ext.getCmp('dc_expense_budget_type_hdr_id').getStore().reload({
                    //     callback: function (records, operation, success) { 
                    //         Ext.getCmp('dc_expense_budget_type_hdr_id').fn();
                    //     }
                    // });
                    if (Ext.selectRow.get("i_amount_bg") == 1) {
                        // Ext.getCmp('fidldser_edit_bg2')e;
                        Ext.getCmp("fidldser_edit_bg2").hide();
                        Ext.getCmp("fidldser_edit_bg3").hide();
                    } else if (Ext.selectRow.get("i_amount_bg") == 2) {
                        Ext.getCmp("fidldser_edit_bg3").hide();
                    }

                    // fidldser_edit_bg2
                    // fidldser_edit_bg3

                }
            },
            // html: "ท่านต้องการที่จะ ?",
            items: [
                {
                    xtype: "displayfield",
                    fieldLabel: "เลขที่ PR",
                    value: "<b style='font-size:16px;'> " + Ext.selectRow.data.c_code + " ?</b>",
                },
                {
                    xtype: "displayfield",
                    fieldLabel: "ชื่อรายการ",
                    value: "<p style='font-size:13px;'> " + Ext.selectRow.data.c_name + " </p>",
                },
                comboExpenseEdit,
                {
                    xtype: "textfield",
                    fieldLabel: "จำนวนเงิน PR",
                    // readOnly: true,
                    name: "f_total_amt",
                    id: "f_total_edit_ID",
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
                            // if()
                            Ext.getCmp("f_type_edit_amtID").setValue(floatRenderer(floatMinus(Ext.getCmp("f_total_edit_ID").getValue().replace(/,/g, ""))));
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
                    xtype: "radiogroup",
                    columns: [98, 98, 98, 98],
                    fieldLabel: "จำนวนแหล่งเงิน",
                    id: "i_amount_edit_bgID",
                    name: "i_amount_edit_bg",
                    items: [
                        {
                            checked: true,
                            // hidden: true,
                            name: "i_amount_edit_bg",
                            inputValue: 1,
                            boxLabel: "1 แหล่งเงิน",
                        },
                        {
                            inputValue: 2,
                            name: "i_amount_edit_bg",
                            boxLabel: "2 แหล่งเงิน",
                            listeners: {
                                change: function () {
                                    // this.fn = function () {
                                },
                            },
                        },
                        {
                            inputValue: 3,
                            name: "i_amount_edit_bg",
                            boxLabel: "3 แหล่งเงิน",
                        },
                    ], //radiogroup
                    listeners: {
                        afterrender: function () {
                            Ext.getCmp("i_amount_edit_bgID").setValue(Ext.selectRow.get("i_amount_bg"));
                        },
                        change: function () {
                            if (Ext.selectRow.get("bg_reserve_money1_id") > 0) {
                                // Ext.Msg.alert("แจ้งเตือน", "จองเงินไปแล้วไม่สามารถแก้ไขรายการได้");
                                Ext.getCmp("i_amount_edit_bgID").setValue(Ext.selectRow.get("i_amount_bg"));
                            } else {
                                if (Ext.getCmp("i_amount_bgID").getValue().inputValue == 1) {
                                    Ext.getCmp("fidldser_bg2").hide();
                                    Ext.getCmp("fidldser_bg3").hide();
                                    Ext.getCmp("f_type_amtID").setValue(floatRenderer(floatMinus(Ext.getCmp("f_totalID").getValue().replace(/,/g, ""))));
                                } else if (Ext.getCmp("i_amount_bgID").getValue().inputValue == 2) {
                                    Ext.getCmp("fidldser_bg2").show();
                                    Ext.getCmp("f_type_amtID").setValue(0);
                                    Ext.getCmp("f_type_amtID2").setValue(0);
                                    Ext.getCmp("f_type_amtID3").setValue(0);
                                    Ext.getCmp("fidldser_bg3").hide();
                                } else if (Ext.getCmp("i_amount_bgID").getValue().inputValue == 3) {
                                    Ext.getCmp("fidldser_bg2").show();
                                    Ext.getCmp("f_type_amtID").setValue(0);
                                    Ext.getCmp("f_type_amtID2").setValue(0);
                                    Ext.getCmp("f_type_amtID3").setValue(0);
                                    Ext.getCmp("fidldser_bg3").show();
                                }
                            }
                            //  Ext.getCmp('i_is_invGID').fn(this.getValue().inputValue);
                        },
                    },
                },
                {
                    xtype: "fieldset",
                    title: "การใช้เงินที่ 1",
                    collapsible: true,
                    autoHeight: true,
                    defaults: {width: 210},
                    defaultType: "textfield",
                    items: [
                        comboTypeBgEdit,
                        {
                            xtype: "radiogroup",
                            columns: [98, 98],
                            fieldLabel: "ขอดำเนินการ",
                            id: "i_pr_type_edit_ID1",
                            name: "i_pr_type_edit1",
                            items: [
                                {
                                    // checked: true,
                                    name: "i_pr_type_edit1",
                                    inputValue: 1,
                                    boxLabel: "จองแบบแผน",
                                },
                                {
                                    inputValue: 2,
                                    name: "i_pr_type_edit1",
                                    boxLabel: "จองแบบงวด",
                                },
                            ],
                            listeners: {
                                change: function () {
                                    // if( Ext.selectRow.get("bg_reserve_money1_id") > 0 ){
                                    // Ext.Msg.alert("แจ้งเตือน", "จองเงินไปแล้วไม่สามารถแก้ไขรายการได้");
                                    // Ext.getCmp("i_pr_type1ID").setValue(Ext.selectRow.get("i_pr_type1"));
                                    // }
                                }
                            }
                        },
                        {
                            xtype: "textfield",
                            fieldLabel: "จำนวนเงินแหล่งเงินที่ 1",
                            // readOnly: true,
                            name: "f_type_amt",
                            id: "f_type_edit_amtID",
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
                    ],
                },
                {
                    xtype: "fieldset",
                    id: "fidldser_edit_bg2",
                    title: "การใช้เงินที่ 2",
                    collapsible: true,
                    autoHeight: true,
                    defaults: {width: 210},
                    defaultType: "textfield",
                    items: [
                        comboTypeBgEdit2,
                        {
                            xtype: "radiogroup",
                            columns: [98, 98],
                            fieldLabel: "ขอดำเนินการ",
                            id: "i_pr_type_edit_ID2",
                            name: "i_pr_type_edit2",
                            items: [
                                {
                                    // checked: true,
                                    name: "i_pr_type_edit2",
                                    inputValue: 1,
                                    boxLabel: "จองแบบแผน",
                                },
                                {
                                    inputValue: 2,
                                    name: "i_pr_type_edit2",
                                    boxLabel: "จองแบบงวด",
                                },
                            ],
                            listeners: {
                                change: function () {
                                    // if( Ext.selectRow.get("bg_reserve_money1_id") > 0 ){
                                    // Ext.Msg.alert("แจ้งเตือน", "จองเงินไปแล้วไม่สามารถแก้ไขรายการได้");
                                    // Ext.getCmp("i_pr_type1ID").setValue(Ext.selectRow.get("i_pr_type1"));
                                    // }
                                }
                            }
                        },
                        {
                            xtype: "textfield",
                            fieldLabel: "จำนวนเงินแหล่งเงินที่ 2",
                            // readOnly: true,
                            name: "f_type_edit_amt2",
                            id: "f_type_edit_amtID2",
                            listeners: {
                                afterrender: function () {
                                    // Ext.getCmp("f_type_edit_amtID2").setValue(Ext.selectRow.get("f_type2_amt"));
                                    this.fn = function () {
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
                    ],
                },
                {
                    xtype: "fieldset",
                    id: "fidldser_edit_bg3",
                    title: "การใช้เงินที่ 3",
                    collapsible: true,
                    autoHeight: true,
                    defaults: {width: 210},
                    defaultType: "textfield",
                    items: [
                        comboTypeBgEdit3,
                        {
                            xtype: "radiogroup",
                            columns: [98, 98],
                            fieldLabel: "ขอดำเนินการ",
                            id: "i_pr_type_edit_ID3",
                            name: "i_pr_type_edit3",
                            items: [
                                {
                                    // checked: true,
                                    name: "i_pr_type_edit3",
                                    inputValue: 1,
                                    boxLabel: "จองแบบแผน",
                                },
                                {
                                    inputValue: 2,
                                    name: "i_pr_type_edit3",
                                    boxLabel: "จองแบบงวด",
                                },
                            ],
                            listeners: {
                                change: function () {
                                    // if( Ext.selectRow.get("bg_reserve_money1_id") > 0 ){
                                    // Ext.Msg.alert("แจ้งเตือน", "จองเงินไปแล้วไม่สามารถแก้ไขรายการได้");
                                    // Ext.getCmp("i_pr_type1ID").setValue(Ext.selectRow.get("i_pr_type1"));
                                    // }
                                }
                            }
                        },
                        {
                            xtype: "textfield",
                            fieldLabel: "จำนวนเงินแหล่งเงินที่ 3",
                            // readOnly: true,
                            name: "f_type_edit_amt3",
                            id: "f_type_edit_amtID3",
                            listeners: {
                                afterrender: function () {
                                    // Ext.getCmp("f_type_edit_amtID3").setValue(Ext.selectRow.get("f_type3_amt"));
                                    this.fn = function () {
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
                    ],
                },
                {
                    fieldLabel: "เหตุผล",
                    xtype: "textarea",
                    name: "reason",
                    width: 400,
                    id: "reason_Edit_bgID",
                    listeners: {
                        afterrender: function () {},
                    },
                },
            ],
            buttons: [
                {
                    text: "ยืนยันการส่งแก้ไข",
                    iconCls: "icon-arrow_undo",
                    // hidden : statusx=="reverse"?    true : false || statusx=="reverse_spending" ? true : false ||statusx=="line"? true:false,
                    handler: function () {
                        // console.log(Ext.selectRow.data.id);
                        var msg = "";
                        // return;
                        if ([null, "", undefined].includes(Ext.getCmp("reason_Edit_bgID").getValue())) {
                            msg += "- กรุณากรอกเหตุผล" + "\n";
                        }
                        if (msg != "") {
                            Ext.example.msg("แจ้งเตือน", msg, 1);
                            $(this).next("text copied");
                            setTimeout(function () {
                                $(this).next().remove();
                            }, 6000);
                            return;
                        }
                        if (msg == "") {
                            // console.log(Ext.selectRow.get("bg_reserve_money1_id"));
                            // return false
                            Ext.Ajax.request({
                                url: "tor/api/mnTorController.php",
                                params: {
                                    mode: "Edit_bg_Tor",
                                    id: Ext.selectRow.data.id,
                                    dc_expense_budget_type_edit_id1: Ext.getCmp("dc_expense_budget_type_edit_id").getValue(),
                                    dc_expense_budget_type_edit_id2: Ext.getCmp("dc_expense_budget_type_edit_id2").getValue(),
                                    dc_expense_budget_type_edit_id3: Ext.getCmp("dc_expense_budget_type_edit_id3").getValue(),
                                    po_expense_id: Ext.getCmp("po_expense_edit_idID").getValue(),
                                    f_total_amt1: Ext.getCmp("f_type_edit_amtID").getValue(),
                                    f_total_amt2: Ext.getCmp("f_type_edit_amtID2").getValue(),
                                    f_total_amt3: Ext.getCmp("f_type_edit_amtID3").getValue(),
                                    c_comment: Ext.getCmp("reason_Edit_bgID").getValue(),
                                    bg_reserve_money_id1: Ext.selectRow.get("bg_reserve_money1_id"),
                                    bg_reserve_money_id2: Ext.selectRow.get("bg_reserve_money2_id"),
                                    bg_reserve_money_id3: Ext.selectRow.get("bg_reserve_money3_id"),
                                    i_pr_type1: Ext.selectRow.get("i_pr_type1"),
                                    i_pr_type2: Ext.selectRow.get("i_pr_type2"),
                                    i_pr_type3: Ext.selectRow.get("i_pr_type3"),
                                    i_edit: 1,
                                    i_edit_tor: 4,
                                    i_step_bg: 1,
                                    i_status: 1,
                                    i_amount_bg: Ext.getCmp("i_amount_edit_bgID").getValue().inputValue,
                                },
                                method: "POST",
                                success: function (result, request) {
                                    var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                                    // console.log(Ext.session);
                                    if (jsonData.success) {
                                        var alert_text = "ขอแก้ไขเงิน " + "\n";
                                        alert_text += "วันเวลา : " + new Date().toLocaleString("en-ZA") + "\n";
                                        // alert_text += "Host : " + location.host + "\n";
                                        // alert_text += "เมนู : " + menu + " " + Ext.selectRow.get("c_name_status") + "\n";
                                        alert_text += "เหตุผล : " + Ext.getCmp("reason_Edit_bgID").getValue() + "\n";
                                        alert_text += "PR : " + Ext.selectRow.data.c_code + "\n";
                                        alert_text += "ชื่อผู้ดำเนินรายการ : " + Ext.session.user_name + "\n";
                                        alert_text += "ชื่อรายการ : " + Ext.selectRow.data.c_name + "\n";
                                        if (Ext.getCmp("i_amount_edit_bgID").getValue().inputValue == 1) {
                                            alert_text += "จำนวนเงินจอง : " + floatRenderer(floatMinus(String(Ext.selectRow.get("f_total_amt")).replace(/,/g, ""), 2)) + "\n";
                                            alert_text += "จำนวนเงินที่ต้องการแก้ไข : " + floatRenderer(floatMinus(String(Ext.getCmp("f_type_edit_amtID").getValue()).replace(/,/g, ""), 2)) + "\n";
                                        } else if (Ext.getCmp("i_amount_edit_bgID").getValue().inputValue == 2) {
                                            // if()
                                        } else {

                                        }

                                        // alert_text += "จำนวนเงิน : " + floatRenderer(floatMinus(String(Ext.selectRow.get("f_total_amt")).replace(/,/g, ""), 2)) + "\n";
                                        Ext.Ajax.request({
                                            url: Ext.session.Notif_line,
                                            method: "POST",
                                            params: {
                                                msg: alert_text,
                                                mode: 3
                                            },
                                        });
                                        // return ; 
                                        Ext.MessageBox.alert("Success", jsonData.msg, function () {
                                            Ext.getCmp("win-msg-edit_tor").destroy();
                                            Ext.getCmp("tabpanel1").getStore().reload();
                                        });
                                    } else {
                                        Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                                    }
                                },
                                failure: function (result, request) {
                                    Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                                },
                            });
                        }
                    },
                },
                {
                    text: Ext.GLOBAL_BU_BACK_TH,
                    iconCls: "icon-clear",
                    handler: function () {
                        Ext.getCmp("win-msg-edit_tor").hide();
                        Ext.getCmp("win-msg-edit_tor").destroy();
                    },
                },
            ],
        }).show();
    }
};
const edit_tor = function (status, menu) {
    var statusx = status;
    // if (statusx == "reverse") {
    //     Ext.getCmp("Cancel_reservationID").show();
    // }else {
    //     Ext.getCmp("Cancel_reservationID").hide();
    // }
    // console.log(Ext.selectRow);
    if (Ext.isEmpty(Ext.selectRow))
        Ext.Msg.alert("แจ้งเตือน", "กรุณา click เลือกข้อมูลที่จะยกเลิกรายการ", function (form, action) {
            return false;
        });
    else {
        new Ext.Window({
            id: "win-msg-edit_tor",
            title: "แก้ไขข้อมูล",
            resizable: false,
            modal: true,
            width: 700,
            // height: 250,
            layout: "form",
            // html: "ท่านต้องการที่จะ ?",
            items: [
                {
                    xtype: "displayfield",
                    fieldLabel: "เลขที่ PR",
                    value: "<b style='font-size:16px;'> " + Ext.selectRow.data.c_code + " ?</b>",
                },
                {
                    xtype: "displayfield",
                    fieldLabel: "ชื่อรายการ",
                    value: "<p style='font-size:13px;'> " + Ext.selectRow.data.c_name + " </p>",
                },
                {
                    xtype: "displayfield",
                    fieldLabel: "การดำเนินงานจาก",
                    value: Ext.selectRow.data.c_tor_type,
                },
                {
                    xtype: "combo",
                    // readOnly: true,
                    mode: "local",
                    store: Ext.torType,
                    anchor: "40%",
                    fieldLabel: "เป็นวิธีดำเนินงาน",
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
                },
                {
                    fieldLabel: "วันที่นับ PA",
                    xtype: "datefield",
                    name: "datePA",
                    id: "datePAID",
                    validator: function (val) {
                        if (!Ext.isEmpty(val)) {
                            return true;
                        } else {
                            return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                        }
                    },
                },
                {
                    fieldLabel: "เหตุผล",
                    xtype: "textarea",
                    name: "reason",
                    width: 400,
                    id: "reason_EditID",
                    listeners: {
                        afterrender: function () {},
                    },
                },
            ],
            buttons: [
                {
                    text: "ยืนยันการทำรายการ",
                    iconCls: "icon-table_delete",
                    // hidden : statusx=="reverse"?    true : false || statusx=="reverse_spending" ? true : false ||statusx=="line"? true:false,
                    handler: function () {
                        var msg = "";
                        // return;
                        if ([null, "", undefined, 0].includes(Ext.getCmp("tor_type_idID").getValue())) {
                            msg += "- กรุณาเลือกวิธีดำเนินงาน" + "\n";
                        }
                        if ([null, "", undefined].includes(Ext.getCmp("reason_EditID").getValue())) {
                            msg += "- กรุณากรอกเหตุผล" + "\n";
                        }
                        if ([null, "", undefined].includes(Ext.getCmp("datePAID").getValue())) {
                            msg += "- กรุณากรอกวันที่นับ PA" + "\n";
                        }
                        // if(Ext.getCmp("tor_type_idID").getValue() == Ext.selectRow.data.tor_type_id ) {
                        //     msg +=  "- ไม่สามารถเลือกวืธีการดำเนินงานแบบเดิมได้" + "\n"
                        // }
                        if (msg != "") {
                            Ext.example.msg("แจ้งเตือน", msg, 1);
                            $(this).next("text copied");
                            setTimeout(function () {
                                $(this).next().remove();
                            }, 6000);
                            return;
                        }
                        if (msg == "") {
                            Ext.Ajax.request({
                                url: "tor/api/mnTorController.php",
                                params: {
                                    mode: "Edit_Tor",
                                    id: Ext.selectRow.data.id,
                                    sp_status_hdr_id: Ext.selectRow.data.tor_status_id,
                                    tor_type_id: Ext.selectRow.data.tor_type_id,
                                    tor_type_edit_id: Ext.getCmp("tor_type_idID").getValue(),
                                    datepa: Ext.getCmp("datePAID").getValue().format("Y-m-d"),
                                    reason: Ext.getCmp("reason_EditID").getValue(),
                                    sp_emp_id: Ext.selectRow.data.sp_emp_id,
                                    i_type_delete: 3,
                                    tor_status_id: Ext.selectRow.data.tor_status_id,
                                    tor_status_edit: 10058,
                                    i_is_edit_tor: 1,
                                },
                                method: "POST",
                                success: function (result, request) {
                                    var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                                    console.log(jsonData);
                                    if (jsonData.success) {
                                        Ext.MessageBox.alert("Success", jsonData.msg, function () {
                                            Ext.getCmp("win-msg-edit_tor").destroy();
                                            Ext.getCmp("tabpanel1").getStore().reload();
                                        });
                                    } else {
                                        Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                                    }
                                },
                                failure: function (result, request) {
                                    Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                                },
                            });
                        }
                    },
                },
                {
                    text: Ext.GLOBAL_BU_BACK_TH,
                    iconCls: "icon-clear",
                    handler: function () {
                        Ext.getCmp("win-msg-edit_tor").hide();
                        Ext.getCmp("win-msg-edit_tor").destroy();
                    },
                },
            ],
        }).show();
    }
};
const cancel_tor = function (status, menu) {
    console.log(Ext.selectRow);

    if (menu == "st0002" && Ext.session.dc_department_id != 1) {
        Ext.MessageBox.alert("แจ้งเตือน", "ไม่ได้รับสิทธิ์ในการยกเลิกรายการ"); // connect error
        return;
    }
    var statusx = status;
    if (Ext.isEmpty(Ext.selectRow))
        Ext.Msg.alert("แจ้งเตือน", "กรุณา click เลือกข้อมูลที่จะยกเลิกรายการ", function (form, action) {
            return false;
        });
    else {
        new Ext.Window({
            id: "win-msg-cancel",
            title: "ยืนยันการทำรายการ",
            resizable: false,
            modal: true,
            width: 600,
            // height: 250,
            layout: "form",
            // html: "ท่านต้องการที่จะ ?",
            items: [
                {
                    xtype: "displayfield",
                    fieldLabel: "ยกเลิอกรายการ",
                    value: "<b style='font-size:16px;'> " + Ext.selectRow.data.c_code + " ?</b>",
                },
                {
                    xtype: "displayfield",
                    fieldLabel: "ชื่อรายการ",
                    value: "<p style='font-size:13px;'> " + Ext.selectRow.data.c_name + " </p>",
                },
                {
                    xtype: "radiogroup",
                    columns: [180, 180],
                    fieldLabel: "วิธีการย้อน",
                    hidden: statusx == "reverse" ? false : true,
                    id: "modecancelID",
                    style: {"font-weight": "bold"},
                    items: [
                        {
                            name: "modecance",
                            // checked: (Ext.selectRow.data.tor_status_id == 28)? true : false ,
                            checked: true,
                            inputValue: 1,
                            hidden: (Ext.selectRow.data.tor_status_id >= 28 && Ext.selectRow.data.tor_status_id <= 31) || (Ext.selectRow.data.tor_status_id != 13 && Ext.selectRow.data.tor_status_id != 24),
                            boxLabel: Ext.selectRow.data.tor_status_id == 13 ? "ส่งคืนหัวหน้าสายงาน <img src='../images/icons/time_red.png'>" : "ย้อนรายการไปเมนูก่อนหน้านี้ <img src='../images/icons/delete.png'>",
                        },
                        {
                            name: "modecance",
                            inputValue: 2,
                            hidden: Ext.selectRow.data.tor_status_id == 24 || Ext.selectRow.data.tor_status_id == 26 || Ext.selectRow.data.tor_status_id == 13 || Ext.selectRow.data.tor_status_id == 24,
                            checked: [1, 11, 12, 14, 15, 16, 17, 18, 19, 20, 22, 23, 28, 29, 30, 31].includes(Ext.selectRow.data.tor_status_id),
                            // || Ext.selectRow.data.tor_status_id != 13  || Ext.selectRow.data.tor_status_id != 24 ,
                            boxLabel: "ส่งคืนฝ่ายจัดสรร <img src='../images/icons/time_red.png'>",
                        },
                    ],
                    listeners: {
                        change: function (cb, nv, ov) {
                            if (Ext.getCmp("modecancelID").getValue().inputValue == 1) {
                            } else {
                            }
                        },
                        afterrender: function () {},
                    },
                },
                {
                    xtype: "radiogroup",
                    columns: [300],
                    fieldLabel: "ยกเลิกเงิน",
                    // hidden : statusx=="reverse"?   false: true,
                    id: "Cancel_reservationID",
                    hidden: [13, 26, 24].includes(Ext.selectRow.data.tor_status_id) ? true : false || statusx == "reverse" ? false : true,
                    // hidden: Ext.isAudit ? false : true,
                    style: {
                        "font-weight": "bold",
                    },
                    items: [
                        {
                            name: "Cancel_reservation",
                            // checked: Ext.isAudit ? false : true,
                            checked: true,
                            inputValue: 1,
                            // hidden: Ext.isAudit ? false : true,
                            boxLabel: "ยกเลิกการจองเงินปีงบประมาณปัจจุบัน",
                        },
                        {
                            name: "Cancel_reservation",
                            inputValue: 2,
                            // checked:  Ext.selectRow.data.tor_status_id >= 28 && Ext.selectRow.data.tor_status_id <= 31,
                            boxLabel: "ยกเลิกการจองเงินปีงบประมาณปีที่แล้ว",
                        },
                    ],
                    listeners: {
                        change: function (cb, nv, ov) {
                            // if (Ext.getCmp('modecancelID').getValue().inputValue == 1) {
                            //     // Ext.getCmp("reasonID").show();
                            // } else {
                            //     // if (rec.data.c_comment_ status == "") {
                            //         // Ext.getCmp("reasonID").hide();
                            //     // }
                            // }
                        },
                        afterrender: function () {},
                    },
                },
                {
                    xtype: "radiogroup",
                    columns: [300],
                    fieldLabel: "วิธีการย้อน",
                    id: "mode_reverselID",
                    hidden: Ext.isAudit ? false : true,
                    style: {
                        "font-weight": "bold",
                    },
                    items: [
                        {
                            name: "mode1",
                            // checked: Ext.isAudit ? false : true,
                            checked: true,
                            inputValue: 1,
                            // hidden: Ext.isAudit ? false : true,
                            boxLabel: "ส่งรายการคืนสานงาน <img src='../images/icons/time_red.png'>",
                        },
                        {
                            name: "mode1",
                            inputValue: 2,
                            // checked:  Ext.selectRow.data.tor_status_id >= 28 && Ext.selectRow.data.tor_status_id <= 31,
                            boxLabel: "ส่งรายการคืนสายงานและยกเลิกการจองเงิน <img src='../images/icons/delete.png'>",
                        },
                    ],
                    listeners: {
                        change: function (cb, nv, ov) {
                            // if (Ext.getCmp('modecancelID').getValue().inputValue == 1) {
                            //     // Ext.getCmp("reasonID").show();
                            // } else {
                            //     // if (rec.data.c_comment_ status == "") {
                            //         // Ext.getCmp("reasonID").hide();
                            //     // }
                            // }
                        },
                        afterrender: function () {},
                    },
                },
                {
                    fieldLabel: "เหตุผล",
                    xtype: "textarea",
                    name: "reason",
                    width: 400,
                    id: "reason_deleteID",
                    listeners: {
                        afterrender: function () {},
                    },
                },
                {
                    xtype: "displayfield",
                    hidden: statusx == "cancel" ? false : true,
                    fieldLabel: "หมายเหตุ",
                    value: "<b style='font-size:16px;color:red;'> เมื่อคุณกดยืนยัน รายการจะถูกยกเลิก และหายไปจากระบบ  </b>",
                },
                {
                    xtype: "displayfield",
                    fieldLabel: "หมายเหตุ",
                    hidden: statusx == "reverse" ? false : true,
                    value: "<b style='font-size:12px;'>วันที่ผ่านรายการจะถูกนับใหม่เมื่อคุณกดปุ่มยืนยัน </b>",
                },
            ],
            buttons: [
                {
                    text: "ยืนยันการทำรายการ",
                    iconCls: "icon-table_delete",
                    hidden: statusx == "reverse" ? true : false || statusx == "reverse_spending" ? true : false || statusx == "line" ? true : false,
                    handler: function () {
                        var msg = "";
                        // if ( [null,"",undefined].includes(Ext.getCmp("modecancelID").getValue().inputValue) ) {
                        //     msg +=  "- กรุณาเลือกแหล่งเงินจ่ายก่อนบันทึก" + "\n"
                        // }
                        if ([null, "", undefined].includes(Ext.getCmp("reason_deleteID").getValue())) {
                            msg += "- กรุณากรอกเหตุผล" + "\n";
                        }
                        if (msg != "") {
                            Ext.example.msg("แจ้งเตือน", msg, 1);
                            $(this).next("text copied");
                            setTimeout(function () {
                                $(this).next().remove();
                            }, 6000);
                            return;
                        }
                        if (msg == "") {
                            Ext.Ajax.request({
                                url: "tor/api/mnTorController.php",
                                params: {
                                    mode: "Cancel_Tor",
                                    id: Ext.selectRow.data.id,
                                    sp_status_hdr_id: Ext.selectRow.data.tor_status_id,
                                    c_comment_delete: Ext.getCmp("reason_deleteID").getValue(),
                                    sp_emp_id: Ext.selectRow.data.sp_emp_id,
                                    i_type_delete: 2,
                                },
                                method: "GET", //POST
                                success: function (result, request) {
                                    var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                                    if (jsonData.success) {
                                        Ext.MessageBox.alert("Success", jsonData.msg, function () {
                                            Ext.getCmp("win-msg-cancel").destroy();
                                            Ext.getCmp("tabpanel1").getStore().reload();
                                        });
                                    } else {
                                        Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                                    }
                                },
                                failure: function (result, request) {
                                    Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                                },
                            });
                        }
                    },
                },
                {
                    text: "ส่งเรื่องให้แอดมิน",
                    hidden: statusx == "line" ? false : true,
                    iconCls: "icon-arrow_undo",
                    handler: function () {
                        console.log(Ext.selectRow);
                        var alert_text = "แจ้งปัญหา admin";
                        alert_text += "Time : " + new Date().toLocaleString("en-ZA") + "\n";
                        alert_text += "Host : " + location.host + "\n";
                        alert_text += "เมนู : " + menu + " " + Ext.selectRow.get("c_name_status") + "\n";
                        alert_text += "เหตุผล : " + Ext.getCmp("reason_deleteID").getValue() + "\n";
                        alert_text += "PR : " + Ext.selectRow.data.c_code + "\n";
                        alert_text += "ชื่อผู้ดำเนินรายการ : " + Ext.selectRow.json.txtsp_emp_idID + "\n";
                        alert_text += "ชื่อรายการ : " + Ext.selectRow.data.c_name + "\n";
                        alert_text += "จำนวนเงิน : " + floatRenderer(floatMinus(String(Ext.selectRow.get("f_total_amt")).replace(/,/g, ""), 2)) + "\n";
                        Ext.Ajax.request({
                            url: Ext.session.Notif_line,
                            method: "POST",
                            params: {
                                msg: alert_text,
                            },
                        });
                        Ext.getCmp("win-msg-cancel").destroy();
                        Ext.getCmp("tabpanel1").getStore().reload();
                    },
                },
                {
                    text: "ยืนยัน",
                    hidden: statusx == "cancel" ? true : false || statusx == "reverse_spending" ? true : false || statusx == "line" ? true : false,
                    iconCls: "icon-arrow_undo",
                    handler: function () {
                        var msg1 = "";
                        if ([null, "", undefined].includes(Ext.getCmp("modecancelID").getValue().inputValue)) {
                            msg1 += "- กรุณาเลือกแหล่งเงินจ่ายก่อนบันทึก" + "\n";
                        }
                        if ([null, "", undefined].includes(Ext.getCmp("reason_deleteID").getValue())) {
                            msg1 += "- กรุณากรอกเหตุผล" + "\n";
                        }
                        if (msg1 != "") {
                            Ext.example.msg("แจ้งเตือน", msg1, 1);
                            $(this).next("text copied");
                            setTimeout(function () {
                                $(this).next().remove();
                            }, 6000);
                            return;
                        }
                        if (msg1 == "") {
                            Ext.Ajax.request({
                                url: "tor/api/mnTorController.php",
                                params: {
                                    mode: "Reverse_Tor",
                                    id: Ext.selectRow.data.id,
                                    sp_status_hdr_id: Ext.selectRow.data.tor_status_id,
                                    i_type_delete: Ext.getCmp("modecancelID").getValue().inputValue,
                                    c_comment_delete: Ext.getCmp("reason_deleteID").getValue(),
                                    cancel_reservation: Ext.getCmp("Cancel_reservationID").getValue().inputValue,
                                    sp_emp_id: Ext.selectRow.data.sp_emp_id,
                                    i_yyyy: Ext.selectRow.data.i_yyyy,
                                },
                                method: "GET", //POST
                                success: function (result, request) {
                                    var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                                    if (jsonData.success) {
                                        Ext.MessageBox.alert("Success", jsonData.msg, function () {
                                            Ext.getCmp("win-msg-cancel").destroy();
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
                        }
                    },
                },
                {
                    text: "ยืนยันการส่งคืนสายงาน",
                    hidden: Ext.isAudit ? false : true,
                    iconCls: "icon-arrow_undo",
                    handler: function () {
                        Ext.Ajax.request({
                            url: "tor/api/mnTorController.php",
                            params: {
                                mode: "Return_The_Story_Owner",
                                id: Ext.selectRow.data.id,
                                sp_status_hdr_id: Ext.selectRow.data.tor_status_id,
                                // i_type_delete : Ext.getCmp("modecancelID").getValue().inputValue,
                                c_comment_delete: Ext.getCmp("reason_deleteID").getValue(),
                                sp_emp_id: Ext.selectRow.data.sp_emp_id,
                                i_is_register: 0,
                                mode_reverse: Ext.getCmp("mode_reverselID").getValue().inputValue,
                            },
                            method: "GET", //POST
                            success: function (result, request) {
                                var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                                if (jsonData.success) {
                                    Ext.MessageBox.alert("Success", jsonData.msg, function () {
                                        Ext.getCmp("win-msg-cancel").destroy();
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
                },
                {
                    text: Ext.GLOBAL_BU_BACK_TH,
                    iconCls: "icon-clear",
                    handler: function () {
                        Ext.getCmp("win-msg-cancel").hide();
                        Ext.getCmp("win-msg-cancel").destroy();
                    },
                },
            ],
        }).show();
    }
};

Ext.addApproval = (rec) => {
    Ext.scoreTotal = (Ext.isEmpty(rec)) ? 1 : 1;


    var setVal = 2;  //set defalue
    var setVal2 = 1; //set defalue
    var checkboxStore = new Ext.data.JsonStore({
        fields: ['value', 'name', 'i_enabled'],
        data: Ext.config.status_step_document
    });
    addButton = (txt, val) => {
        let id = 'id="addSing_' + val + '"';

        console.log(id);

        return '<button class="button" ' + id + '>' + txt + '</button>';
    };



    var checkboxItems = [];
    checkboxStore.each(function (record) {
        record.set('c_name', record.get('name'));
        checkboxItems.push({
            boxLabel: record.get('name') + addButton('เลือกผู้ที่ลงนาม', record.get('value')),
            name: record.get('value'),
            id: "document_" + record.get('value'),
            checked: record.get('value') === setVal ? true : false,
            inputValue: record.get('value'),
            hidden: record.get('i_enabled') > 0 ? false : true  //set
        });
    });
    chkGroup = (store, name, val) => {

        return {
            xtype: 'compositefield',
            anchor: '-20',
//                                msgTarget: 'side',
            msgTarget: 'under',
            fieldLabel: 'เลือกเอกสารการลงนาม',
            items: [
                new Ext.ux.form.LovCombo({
                    width: 280,
                    xtype: 'combo',
                    mode: 'local',
                    id: name + "ID",
//                                        value: 'cno',
                    triggerAction: 'all',
                    forceSelection: true,
                    editable: true,
//                                        typeAhead: false,
                    emptyText: "กรุณาเลือก...",
//                                        fieldLabel: 'ประเภทหัวข้อการค้นหา',
                    name: name,
                    hiddenName: name,
                    displayField: 'c_name',
                    valueField: 'value',
                    store: store,
                    listeners: {
                        beforerender: function () {

                            this.sel = {};
                            this.key = name;
                            this.sel[this.key] = [];
                            Ext.objLine = 0;

                        },
                        beforeselect: function (t, records, options) {


                            if (this.sel[this.key].length === 3 && records.get('checked') === false) {
                                Ext.example.msg("แจ้งเตือน", "ไม่สามารถเลือกรายการมากกว่า 3 รายการ", 1);
                                setTimeout(function () {
                                    $(this).next().remove();
                                }, 6000);
                                return false;
                            }
                        },
                        select: function (t, records, options) {
                            console.log(this.sel[this.key]);
                            if (records.get('checked') === true) {
                                this.sel[this.key].push(records.get('value'));

                            } else {
                                this.sel[this.key].shift(records.get('value'));

                            }
                            Ext.fnAddItems(Ext.objLine++, records);

                        }
                    }
                })
            ]
        };
    };
    //set param init
    selChkGroup = chkGroup(checkboxStore, 'checkStep', null);

    var checkboxGroup = new Ext.form.CheckboxGroup({
        fieldLabel: 'ดำเนินการจัดทำเอกสาร',
        columns: 1,
        id: 'status_step_documentID',
        name: 'status_step_document',
        items: checkboxItems,
        listeners: {

            beforerender: function () {
                this.fnButton = () => {
                    var total = Ext.getCmp('rightfrmID').items.length + 2;
                    Ext.getCmp('rightfrmID').insert(total
                            , new Ext.ButtonGroup({
                                xtype: "button",
                                text: "จัดทำรายการเอกสาร",
                                width: 80,
                                iconCls: "icon-application-view-list",
                                handler: function () {

                                }
                            })
                            );
                    Ext.getCmp('rightfrmID').doLayout();
                }; //fnButton
                this.SelFrm = function (i) {

                    return new Ext.Window({
                        title: "เลือกผู้ลงนามในเอกสาร",
                        width: 700,
                        id: "winSearchFrmID",
                        height: 300,
                        layout: "fit",
                        buttonAlign: "left",
                        items: [
                            {
                                layout: "column",
                                border: false,
                                defauls: {background: "#eee"},
                                items: [
                                    {
                                        columnWidth: 0.9,
                                        layout: "form",
                                        border: false,
                                        items: [
                                            {
                                                xtype: "checkboxgroup",
                                                id: "i_more2[" + i + "]",
//    fieldLabel: "เกณฑ์ราคาประกอบ เกณฑ์อื่น (เกณฑ์ 7 ข้อ)",
                                                columns: [1], // แสดงในแนวตั้ง
                                                items: [
                                                    {
                                                        boxLabel: "ต้นทุนของพัสดุนั้นตลอดอายุการใช้งาน",
                                                        name: "i_expense",
                                                        inputValue: 1,
//            checked: true,
                                                    },
                                                    {
                                                        boxLabel: "มาตรฐานของสินค้าหรือบริการ",
                                                        name: "i_expense",
                                                        inputValue: 2,
                                                    },
                                                    {
                                                        boxLabel: "บริการหลังการขาย",
                                                        name: "i_expense",
                                                        inputValue: 3,
                                                    },
                                                    {
                                                        boxLabel: "พัสดุที่รัฐต้องการส่งเสริมหรือสนับสนุน",
                                                        name: "i_expense",
                                                        inputValue: 4,
                                                    },
                                                    {
                                                        boxLabel: "การประเมินผลการปฏิบัติงานของผู้ประกอบการ",
                                                        name: "i_expense",
                                                        inputValue: 5,
                                                    },
                                                    {
                                                        boxLabel: "ข้อเสนอด้านเทคนิคหรือข้อเสนออื่น ในกรณีที่กำหนดให้มีการยื่นข้อเสนอด้านเทคนิค",
                                                        name: "i_expense",
                                                        inputValue: 6,
                                                    },
                                                    {
                                                        boxLabel: "เกณฑ์อื่นตามที่กำหนดในกฎกระทรวง",
                                                        name: "i_expense",
                                                        inputValue: 7,
                                                    }
                                                ], listeners: {
                                                    beforerender: function (cmp) {

                                                        if (Ext.i_selID[i].datas.data === null)
                                                            console.log("Ext.i_selID = null");
                                                        else {
                                                            console.log(Ext.i_selID[i].datas.row);
                                                            console.log(Ext.i_selID[i].datas.data);

                                                        }

                                                    },
                                                    afterrender: function (cmp) {
                                                        if (Ext.i_selID[i].datas.data !== null) {
                                                            var checkboxes = cmp.items.items;


                                                            Ext.each(checkboxes, function (checkbox) {
                                                                for (var ii = 0; ii < Ext.i_selID[i].datas.data.length; ii++) {


                                                                    if (checkbox.inputValue === Ext.i_selID[i].datas.data[ii].inputValue) {
                                                                        checkbox.setValue(true);
                                                                    }

                                                                }
                                                            });
                                                        }
                                                    }
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        columnWidth: 0.1,
                                        layout: "form",
                                        border: false,
                                        items: [],
                                    },
                                ],
                                buttonAlign: "left",
                                buttons: [
                                    {
                                        text: "บันทึกผู้ลงนามในเอกสาร",
                                        iconCls: "icon-save",
                                        handler: function () {
//                            Ext.i_selID = [];

                                            Ext.i_selID[i] = Ext.apply({name: 'i_sel[' + i + ']', datas: {row: i, data: Ext.getCmp("i_more2[" + i + "]").getValue()}});
                                            /* console.log(Ext.i_selID[i]);
                                             alert(i);*/
//                            console.log(Ext.i_selID[i]);

                                            var sel = Ext.getCmp("i_more2[" + i + "]").getValue(), txt = '';
                                            for (ii = 0; ii < sel.length; ii++) {
                                                txt += sel[ii].inputValue + ') ' + sel[ii].boxLabel + '<br>';

                                            }
                                            Ext.example.msg("แจ้งเตือน", txt, 3);
                                            Ext.getCmp('leftfrmID').insert(3, {
                                                xtype: 'displayfield',
                                                value: txt,
                                                fieldLabel: 'รายการ ' + Ext.getCmp("i_qtyID[" + i + "]").getValue()
                                            });
                                            Ext.getCmp('leftfrmID').doLayout();
                                            Ext.getCmp("winSearchFrmID").destroy();
                                        }
                                    },
                                    {
                                        text: "ปิด",
                                        iconCls: "icon-cancel",
                                        handler: function () {
                                            Ext.getCmp("winSearchFrmID").destroy();
                                        },
                                    },
                                ],
                            },
                        ],
                    });
                };

            },
            afterrender: function () {

                this.fnButton();


            }
        }
    });

    /* items 1*/


    var tab1 = new Ext.FormPanel({
//        labelAlign: 'top',
        title: Ext.menu_name,
        bodyStyle: "padding:5px",
        layout: "fit",
        id: "frmTabApproval-1",
        url: "api/mnTorWorkingController.php",
        frame: false,
        items: [{
                layout: "column",
                border: false,
                autoScroll: true,
                style: "font:bold 12px \'Mitr\', sans-serif; padding:5px;margin-bottom:5px;",
                html: "<div"
                        + " class='x-toolbar x-small-editor x-toolbar-layout-ct'"
                        + " style='background-color:#cEcEcE; font-weight:bold; padding:5px; margin-bottom:5px; white-space: nowrap;'>"
                        + " -  รายการขอทำบันทีกอนุมัติลงนาม <span style='font-weight:bold;' id='scoreTotalID'>"
                        + parseFloat(Ext.scoreTotal)
                        + "</span> เรื่อง</div>"
                ,
                items: [
                    {
                        columnWidth: 0.6,
                        layout: "form",
                        id: "rightfrmID",
                        border: false,
                        labelWidth: 150,
                        bodyStyle: "padding:1px",
                        items: [{
                                xtype: "hidden",
                                name: "id",
                                id: "torHdrID"
                            },
                            {
                                xtype: "hidden",
                                name: "sp_emp_id"
                            },
                            {
                                xtype: "hidden",
                                name: "mode",
                                value: "EDIT1",
                            },
                            {
                                xtype: "hidden",
                                name: "sp_cate_id",
                                id: "sp_cate_idID",
                                value: 2
                            },
                            {
                                xtype: "hidden",
                                name: "dc_department_id",
                                id: "dc_department_idID",
                            },
                            {
                                xtype: "hidden",
                                name: "sp_type_id",
                                id: "sp_type_idID",
                            },
                            {
                                xtype: "hidden",
                                name: "sp_type_id",
                                id: "sp_type_idID",
                            },
                            {
                                xtype: "hidden",
                                name: "c_type_id",
                                id: "c_type_idID"
                            },
                            {
                                xtype: "hidden",
                                name: "sp_tor_work_id",
                                id: "sp_tor_work_id2ID"
                            },
                            {
                                xtype: "hidden",
                                name: "c_sp_tor_work_id",
                                id: "c_sp_tor_work_idID"
                            }, {
                                xtype: 'textfield',
                                fieldLabel: "รหัส PR",
                                id: "codeHdrID",
                                style: "text-align: center;font-weight:bold;background:#eee;",
                                readOnly: true,
                                name: "c_code"
                            },
                            {
                                xtype: "textarea",
                                fieldLabel: "เรื่อง/โครงการ",
                                name: "c_name",
                                id: "c_name",
                                readOnly: true,
                                anchor: "80%"
                            }, {
                                xtype: "textfield",
                                fieldLabel: "จำนวนเงิน",
                                name: "f_type_amt",
                                id: "f_type_amt", // f_total_amt f_type_amt
                                readOnly: true,
                                anchor: "50%",

                            }, {
                                xtype: "radiogroup",
                                columns: [220],
                                fieldLabel: "เอกสารที่ดำเนินการขออนุมัติ",
                                id: "i_bgID",
                                name: "i_bg",
                                items: [
                                    {

                                        name: "i_bg",
                                        inputValue: 1,
                                        checked: true,
                                        boxLabel: "รายการที่ขออนุมัติดำเนินการซื้อจ้าง",

                                    },
                                    {
                                        inputValue: 2,
                                        name: "i_bg",
                                        boxLabel: "รายการที่ขออนุมัติอื่นๆ..",
                                    },
                                ], //radiogroup 
                                listeners: {
                                    afterrender: function () {
                                        Ext.file = 'ProRepApNonePo';
                                    },
                                    change: function () {
                                        if (this.getValue().inputValue == 2) {
                                            Ext.file = 'ProRepApNonePo2';
                                            Ext.getCmp('itPro1ID').hide();
                                            Ext.getCmp('itProID').show();

                                        } else if (this.getValue().inputValue == 1) {
                                            Ext.file = 'ProRepApNonePo';
                                            Ext.getCmp('itProID').hide();
                                            Ext.getCmp('itPro1ID').show();
                                        }

                                        Ext.example.msg("รูปแบบการดูรีพอร์ท", this.getValue().boxLabel + ' file ' + Ext.file, 3);
                                    },
                                },
                            }, {
                                xtype: 'compositefield',
//                    fieldLabel: 'เพิ่มจำวนหน่วยงานที่แยก', 
                                id: 'itPro1ID',
//                                hidden: true,
                                msgTarget: 'under',
                                items: [{
                                        xtype: "hidden",
                                        id: "lineID",
                                        name: "line",
                                        value: 1,
                                        width: 60,
                                        fieldLabel: "เลือกรายการ",
                                        listeners: {
                                            change: function (component, newValue, oldValue) {

                                                if (newValue > 20) {
                                                    component.setValue(oldValue);
                                                    //---------------- 
                                                }
                                            }
                                        }
                                    }, {
                                        xtype: "button",
                                        iconCls: "icon-add",
//                            fieldLabel: "รายละเอียดบิล",
                                        name: "button",
                                        text: "เลือกรายการ",
                                        handler: function () {
                                            var cont = Ext.getCmp('lineID').getValue();
//                                            Ext.f_total_amt = parseFloat(rec.get('f_total_amt').replace(/\,/g, ''));
//                                            Ext.f_part_amt = parseFloat(rec.get('f_total_amt').replace(/\,/g, '')) / cont;
                                            var el = Ext.query('*[id^=legendID]');
                                            var legen = el.length;
                                            Ext.i_selID = [];
                                            for (var i = 1; i <= legen; i++) {
//                                    alert(i);
                                                Ext.objLine = 0;
                                                Ext.getCmp('rightfrmID').remove(Ext.getCmp("i_qtyID[" + i + "]"));
                                                Ext.getCmp('rightfrmID').doLayout();
                                            }
                                            for (var i = 0; i < cont; i++) {
                                                Ext.objLine++;
                                                Ext.fnAddItems(Ext.objLine);
                                                Ext.i_selID[Ext.objLine] = Ext.apply({name: 'i_sel[' + Ext.objLine + ']', datas: {row: Ext.objLine, data: null}});

                                            }
                                            console.log(Ext.objLine);
                                            for (var i = 1; i <= Ext.objLine; i++) {
//                                                 Ext.i_selID = [i]; 
                                                Ext.getCmp('i_selID[' + i + ']').hide();
                                                Ext.getCmp('leftfrmID').doLayout();
                                            }
//                                            console.log(Ext.i_selID);

                                        }, listeners: {
                                            beforerender: function () {
                                                Ext.objLine = 0;
                                                Ext.Commmittee = function (evt, rec) {
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
                                                        items: [
                                                            {
                                                                xtype: "form",
                                                                id: "form-widgets",
                                                                url: "tor/api/mnTorController.php",
                                                                frame: true,
                                                                labelAlign: "left",
                                                                autoScroll: true,
                                                                labelWidth: 100,
                                                                bodyStyle: {padding: "10px 20px"},
                                                                defaults: {msgTarget: "side"},
                                                                items: [

                                                                    {
                                                                        xtype: "hidden",
                                                                        name: "id",
                                                                        // value: Ext.selectRow.data.id,
                                                                        id: "idID",
                                                                    },
                                                                    {
                                                                        xtype: "hidden",
                                                                        name: "sp_tor_id",
                                                                        value: Ext.SP_TOR_ID,
                                                                    },
                                                                    {
                                                                        xtype: "hidden",
                                                                        name: "sp_tor_bidder_hdr_id",
                                                                        value: Ext.SP_TOR_BIDDER_HDR_ID,
                                                                    },
                                                                    {
                                                                        xtype: "hidden",
                                                                        name: "c_name",
                                                                        value: Ext.C_NAME,
                                                                    },
                                                                    {
                                                                        xtype: "hidden",
                                                                        name: "mode",
                                                                        value: "UP_SP_TOR_BIDDER_HDR",
                                                                        readOnly: true,
                                                                    },
                                                                    {
                                                                        xtype: "compositefield",
                                                                        id: "dc_creditor_idID_pop",
                                                                        fieldLabel: "เลือกผู้เสนอราคา",
                                                                        msgTarget: "side",
                                                                        anchor: "20",
                                                                        defaults: {
                                                                            flex: 1,
                                                                        },
                                                                        items: [PopCreditorForm.mini],
                                                                    },
                                                                    new Ext.form.ComboBox({
                                                                        mode: "local",
                                                                        store: Ext.guarantee,
                                                                        anchor: "40%",
                                                                        // hidden: true,
                                                                        value: 0,
                                                                        fieldLabel: "หลักค้ำ",
                                                                        submitValue: true,
                                                                        hiddenName: "i_is_guarantee",
                                                                        name: "i_is_guaranteehidden",
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

                                                                    /*{
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
                                                                     },*/
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
                                                                    {},
                                                                ], //items จำนวนเงินรวมภาษีมูลค่าเพิ่ม
                                                                viewConfig: {forceFit: true},
                                                            },
                                                        ],
                                                        buttons: [
                                                            {
                                                                text: "บันทึกรายการ",
                                                                handler: function () {
                                                                    msg = "";
                                                                    // console.log(Ext.getCmp("d_doc_guarantee_refID").getValue());
                                                                    // console.log(Ext.getCmp("f_total_guarantee_ID").getValue ());
                                                                    if (Ext.getCmp("i_is_guaranteeGID").getValue() == 8) {
                                                                        if (Ext.getCmp("d_doc_guarantee_refID").getValue() == '') {
                                                                            msg += "<span style='white-space: nowrap;'>- กรุณาระบุเลขที่ใบเสร็จ</span><br>";
                                                                        }
                                                                        if (Ext.getCmp("d_guarantee_dateID").getValue() == '') {
                                                                            msg += "<span style='white-space: nowrap;'>- กรุณาระบุวันที่ใบเสร็จ</span><br>";
                                                                        }
                                                                        if (Ext.getCmp("f_total_guarantee_ID").getValue() == '') {
                                                                            msg += "<span style='white-space: nowrap;'>- กรุณาระบุจำนวนเงิน</span><br>";
                                                                        }
                                                                        if (Ext.getCmp("dc_bank_idID").getValue() == '') {
                                                                            msg += "<span style='white-space: nowrap;'>- กรุณาระบุจำนวนเงิน</span><br>";
                                                                        }
                                                                    }
                                                                    if (Ext.getCmp("dc_creditor_idID").getValue() == "") {
                                                                        msg += "<span style='white-space: nowrap;'>- กรุณาเลือกผู้เสนอราคา</span><br>";
                                                                    } else {
                                                                        if (evt == 'edit_bidder_hdr') {

                                                                        } else {
                                                                            var Row = 0;
                                                                            var RowMax = Ext.store2.data.length - 1;
                                                                            var RowCreditor = Ext.store2.data.items;
                                                                            var NewCreditor = Ext.getCmp("dc_creditor_idID").getValue();
                                                                            while (RowMax >= Row) {
                                                                                if (RowCreditor[Row].data.dc_creditor_id == NewCreditor) {
                                                                                    msg += "<span style='white-space: nowrap;'>- มีผู้เสนอราคารายนี้แล้ว</span><br>";
                                                                                    break;
                                                                                }
                                                                                Row++;
                                                                            }

                                                                        }
                                                                    }


                                                                    if (msg == "") {
                                                                        var formSubmit = function () {
                                                                            form.submit({
                                                                                waitMsg: "Saving Data...",
                                                                                success: function (form, action) {
                                                                                    Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                                                                        Ext.getCmp("gridSub1ID").getStore().reload();
                                                                                        // Ext.selectRow = null;
                                                                                        Ext.getCmp("win-frm-contractID").destroy();
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

                                                                    var form = Ext.getCmp("form-widgets").getForm();
                                                                    if (form.isValid()) {
                                                                        if (msg == "") {
                                                                            formSubmit(form);
                                                                        }
                                                                    }
                                                                },
                                                            },
                                                            {
                                                                text: "Cancel",
                                                                handler: function () {
                                                                    Ext.getCmp("win-frm-contractID").destroy();
                                                                },
                                                            },
                                                        ],
                                                    });
                                                    win.show();
                                                };
                                                Ext.fnAddSing = (li) => {

                                                };
                                                Ext.fnAddItems = (li) => {

                                                    Ext.storeCreditor = new Ext.data.JsonStore({
                                                        //autoLoad: true,
                                                        storeId: "myStoreCont",
                                                        url: "tor/api/mnTorController.php",
                                                        baseParams: {mode: "LIST_POP_CREDITOR", id: 0},
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
                                                    var PopCreditorForm = new Ext.Poplov_in({
                                                        text: "เลือกผู้เสนอราคา",
                                                        id: "dc_creditor_idID",
                                                        iconCls: "page_magnify",
                                                        valueHidden: "dc_creditor_id",
                                                        store: Ext.storeCreditor,
                                                        headerGrid: columnMini,
                                                        widthText: 400,
                                                        fieldLabel: "เลือกผู้เสนอราคา",
                                                        isCellClickGrid: true,
                                                        cellClickGrid: function (grid, rowIndex, columnIndex, e) {
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
                                                    var total = Ext.getCmp('rightfrmID').items.length;
                                                    var totalCount = total + 2;
                                                    var line = Ext.objLine;
                                                    Ext.getCmp('rightfrmID').insert(totalCount, new Ext.ButtonGroup({
                                                        frame: false,
                                                        border: false,
                                                        style: "font:bold 12px \'Mitr\', sans-serif; padding:1px;",
                                                        id: 'buttonGroup2' + Ext.objLine,
                                                        fieldLabel: "รายการขออนุมัติลงนาม " + Ext.objLine,
                                                        items: [{
                                                                xtype: "textfield",
                                                                id: "i_qtyID[" + line + "]",
                                                                name: "i_qty[" + line + "]",
                                                                emptyText: "รายการขออนุมัติลงนาม ", style: "text-align: right",
                                                                width: '70%',
                                                                fieldLabel: "รายการขออนุมัติลงนาม " + Ext.objLine,
                                                                validator: function (val) {
                                                                    if (Ext.isEmpty(val)) {
                                                                        return "กรุณากรอกข้อมูลให้ถูกต้อง";
                                                                    } else {
                                                                        return true;
                                                                    }
                                                                }

                                                            }, {
                                                                xtype: 'button',
//                                                                hidden:true,
                                                                id: "i_selID[" + line + "]",
                                                                name: "i_sel[" + line + "]",
                                                                text: "เลือกเกณฑ์ อื่นประกอบ " + Ext.objLine,
                                                                fieldLabel: "เลือกเกณฑ์ อื่นประกอบ  " + Ext.objLine,
                                                                handler: function () {
                                                                    var selFrm = Ext.SelFrm(line);
                                                                    selFrm.show();
                                                                },
                                                                listeners: {
                                                                    beforerender: function () { //this.fn = function () { }; 
                                                                    },
                                                                    afterrender: function () {
//                                                                        Ext.i_selID = Ext.apply({row: Ext.objLine, data: []});

                                                                    },
                                                                },
                                                            }],
                                                    })
                                                            );
                                                    Ext.getCmp('rightfrmID').doLayout();
                                                };
                                            },
                                            afterrender: function () {
//                                                Ext.example.msg("แจ้งเตือน", "test", 3);
                                            },
                                            Change: function () {  //this.fn1();
                                            },
                                            blur: function () { //this.fn1();
                                            },
                                        },
                                    }]
                            }, {
                                xtype: 'compositefield',
//                    fieldLabel: 'เพิ่มจำวนหน่วยงานที่แยก', 
                                id: 'itProID',
                                hidden: true,
                                msgTarget: 'under',
                                items: [{
                                        xtype: "numberfield",
                                        id: "lineID",
                                        name: "line",
                                        value: 1,
                                        width: 60,
                                        fieldLabel: "เพิ่มรายการขออนุมัติอื่นๆ",
                                        listeners: {
                                            change: function (component, newValue, oldValue) {

                                                if (newValue > 20) {
                                                    component.setValue(oldValue);
                                                    //---------------- 
                                                }
                                            }
                                        }
                                    }, {
                                        xtype: "button",
                                        iconCls: "icon-add",
//                            fieldLabel: "รายละเอียดบิล",
                                        name: "button",
                                        text: "รายการ",
                                        handler: function () {
                                            var cont = Ext.getCmp('lineID').getValue();
//                                            Ext.f_total_amt = parseFloat(rec.get('f_total_amt').replace(/\,/g, ''));
//                                            Ext.f_part_amt = parseFloat(rec.get('f_total_amt').replace(/\,/g, '')) / cont;
                                            var el = Ext.query('*[id^=legendID]');
                                            var legen = el.length;
                                            Ext.i_selID = [];
                                            for (var i = 1; i <= legen; i++) {
//                                    alert(i);
                                                Ext.objLine = 0;
                                                Ext.getCmp('rightfrmID').remove(Ext.getCmp("i_qtyID[" + i + "]"));
                                                Ext.getCmp('rightfrmID').doLayout();
                                            }
                                            for (var i = 0; i < cont; i++) {
                                                Ext.objLine++;
                                                Ext.fnAddItems(Ext.objLine);
                                                Ext.i_selID[Ext.objLine] = Ext.apply({name: 'i_sel[' + Ext.objLine + ']', datas: {row: Ext.objLine, data: null}});

                                            }
                                            console.log(Ext.objLine);
                                            for (var i = 1; i <= Ext.objLine; i++) {
//                                                 Ext.i_selID = [i]; 
                                                Ext.getCmp('i_selID[' + i + ']').hide();
                                                Ext.getCmp('leftfrmID').doLayout();
                                            }
//                                            console.log(Ext.i_selID);

                                        }, listeners: {
                                            beforerender: function () {
                                                Ext.objLine = 0;
                                                console.log(Ext.config);
                                                var checkboxItems2 = [];
                                                Ext.SelFrmSigature = (li, record) => { 
                                                    var checkboxStore2 = new Ext.data.JsonStore({
                                                        fields: ['value', 'name'],
                                                        data: Ext.config.status_sigature_document
                                                    });
                                                    checkboxStore2.each(function (record) {
                                                        checkboxItems2.push({
                                                            boxLabel: record.get('name'),
                                                            name: record.get('value'),
                                                            checked: true ,
                                                            id: "sigature_" + record.get('value'),
                                                            inputValue: record.get('value')
                                                        });
                                                    });
                                                    var checkboxGroup2 = new Ext.form.CheckboxGroup({
                                                        fieldLabel: 'เลือกผู้ที่ลงนามอนุมัติในเอกสาร',
                                                        columns: 1,
                                                        name: 'status_sigature_document['+record.get('value')+']',
                                                        id: 'status_sigature_document['+record.get('value')+']',
                                                        items: checkboxItems2
                                                    });
                                                    
                                                    return new Ext.Window({
                                                        title: "เลือกการดำเนิน " + record.get('c_name'),
                                                        width: 700,
                                                        id: "winFrmSing",
                                                        height: 300,
                                                        layout: "fit",
                                                        buttonAlign: "left",
                                                        items: [
                                                            {
                                                                layout: "column",
                                                                border: false,
                                                                defauls: {background: "#eee"},
                                                                items: [
                                                                    {
                                                                        columnWidth: 0.9,
                                                                        layout: "form",
                                                                        border: false,
                                                                        items:checkboxGroup2
                                                                    },
                                                                    {
                                                                        columnWidth: 0.1,
                                                                        layout: "form",
                                                                        border: false,
                                                                        items: [],
                                                                    },
                                                                ],
                                                                buttonAlign: "left",
                                                                buttons: [
                                                                    {
                                                                        text: "บันทึกการลงนาม",
                                                                        iconCls: "icon-save",
                                                                        handler: function () { 
                                                                           
//                                                                            console.log(Ext.getCmp('status_sigature_document['+record.get('value')+']'));
//                                                                            
//                                                                            return false;
                                                                            var total = Ext.getCmp('rightfrmID').items.length;
                                                                            var totalCount = total + 2;
                                            console.log( Ext.getCmp('buttonGroup2' + record.get('value')));
                                                                                var sel = Ext.getCmp('status_sigature_document['+record.get('value')+']').getValue(), txt = '';
                                                                                      console.log(sel);
                                                                            for (ii = 0; ii < sel.length; ii++) {
                                                                               
                                                                                            
                                                                                            Ext.getCmp('rightfrmID').insert(totalCount,{ 
                                                                                                xtype:'displayfield',
                                                                                                value: sel[ii].boxLabel,
//                                                                                                fieldLabel:'ลงนาม'+ii+1
                                                                                            },{
                                                                                                xtype:'hidden',
                                                                                                name:'i_sigature_document['+record.get('value')+']',
                                                                                                value:sel[ii].getValue()
                                                                                    
                                                                                         });
                                                                                     }          
                                                                            Ext.getCmp('rightfrmID').doLayout();
                                                                            Ext.getCmp("winFrmSing").destroy();
                                                                        }
                                                                    },
                                                                    {
                                                                        text: "ปิด",
                                                                        iconCls: "icon-cancel",
                                                                        handler: function () {
                                                                            Ext.getCmp("winFrmSing").destroy();
                                                                        },
                                                                    },
                                                                ],
                                                            },
                                                        ],
                                                    });
                                                };
                                                Ext.fnAddItems = (li, record) => {
                                                    Ext.sp_sbill_pop = new Ext.data.JsonStore({
                                                        autoDestroy: false,
                                                        autoLoad: true,
                                                        url: "api/All_poWorking.php",
                                                        baseParams: {type: "sp_sbill_pop"},
                                                        root: "data",
                                                        idProperty: "id",
                                                        totalProperty: "totalCount",
                                                        fields: ["no", "id", "c_contract_code", "count", "f_sum"],
                                                    });
                                                    var total = Ext.getCmp('rightfrmID').items.length;
                                                    var totalCount = total + 2;
                                                    var line = Ext.objLine;
                                                    Ext.getCmp('rightfrmID').insert(totalCount, new Ext.ButtonGroup({
                                                        frame: false,
                                                        border: false,
                                                        style: "font:bold 12px \'Mitr\', sans-serif; padding:1px;",
                                                        id: 'buttonGroup2' + Ext.objLine,
                                                        fieldLabel: "จัดทำเอกสาร อนุมัติลงนาม" + Ext.objLine,
                                                        items: [{
                                                                xtype: "textfield",
                                                                id: "c_step_document[" + line + "]",
                                                                name: "c_step_document[" + line + "]",
//                                                                emptyText: "รายการพิจารณา ", style: "text-align: right",
                                                                width: 400,
                                                                readonly: true,
                                                                value: record.get('c_name')
//                                                                fieldLabel: "รายการพิจารณา " + Ext.objLine, 

                                                            }, {
                                                                xtype: 'button',
//                                                                hidden:true,
                                                                id: "sigature_documentID[" + line + "]",
                                                                name: "sigature_document[" + line + "]",
                                                                text: "เลือกผู้ลงนามเอกสาร " + Ext.objLine,
                                                                fieldLabel: "เลือกผู้ลงนามเอกสาร " + Ext.objLine,
                                                                handler: function () {
                                                                    alert(record.get('value') + ' ' + record.get('c_name'));
                                                                    var selFrm = Ext.SelFrmSigature(line, record);
                                                                    selFrm.show();
                                                                },
                                                                listeners: {
                                                                    beforerender: function () { //this.fn = function () { }; 
                                                                    },
                                                                    afterrender: function () {
//                                                                        Ext.i_selID = Ext.apply({row: Ext.objLine, data: []});

                                                                    },
                                                                },
                                                            }],
                                                    })
                                                            );
                                                    Ext.getCmp('rightfrmID').doLayout();
                                                };

                                            },
                                            afterrender: function () {
                                                Ext.example.msg("แจ้งเตือน", "test", 3);
                                            },
                                            Change: function () {  //this.fn1();
                                            },
                                            blur: function () { //this.fn1();
                                            },
                                        },
                                    }]
                            }
                            , new Ext.form.Label({
                                xtype: 'label',
                                id: "sp_tor_work_idID",
                                style: "font:bold 12px \'Mitr\', sans-serif; padding:1px;",
                                html: '<div style="padding-left:30px;"><span style="color:red">*</span>บันทึกจัดทำเอกสารขออนุมัติลงนาม</div>',

                            })
                                    , selChkGroup
//    , checkboxGroup

                        ]
                    },
                    {
                        columnWidth: 0.4,
                        layout: "form",
                        border: false,
                        bodyStyle: "padding:3px",
                        id: "leftfrmID",
                        labelWidth: 200,
                        items: [{
                                xtype: "radiogroup",
                                columns: [170],
                                fieldLabel: "รายละของเอกสารที่ขออนุมัต",
                                id: "i_bg2ID",
                                name: "i_bg2",
                                items: [
                                    {

                                        name: "i_bg2",
                                        inputValue: 1,
                                        checked: true,
                                        boxLabel: "เกณฑ์ราคา",
                                    },
                                    {
                                        inputValue: 2,
                                        name: "i_bg2",
                                        boxLabel: "เกณฑ์ราคาประกอบ เกณฑ์อื่น (เกณฑ์ 7ข้อ)",
                                    },
                                ], //radiogroup 
                                listeners: {
                                    afterrender: function () {
                                        Ext.file = 'ProRepApNonePo';
                                        for (var i = 1; i <= Ext.objLine; i++) {
                                            Ext.getCmp('i_selID[' + i + ']').hide();
                                            Ext.getCmp('leftfrmID').doLayout();
                                        }

                                    },
                                    change: function () {
                                        if (this.getValue().inputValue == 2) {
                                            Ext.file = 'ProRepApNonePo2';
                                            Ext.getCmp('itProID').hide();
                                            for (var i = 1; i <= Ext.objLine; i++) {

                                                Ext.getCmp('i_selID[' + i + ']').show();
                                                Ext.getCmp('leftfrmID').doLayout();
                                            }

                                        } else if (this.getValue().inputValue == 1) {
                                            Ext.file = 'ProRepApNonePo';
                                            Ext.getCmp('itProID').hide();
                                            for (var i = 1; i <= Ext.objLine; i++) {
                                                Ext.getCmp('i_selID[' + i + ']').hide();
                                                Ext.getCmp('leftfrmID').doLayout();
                                            }

                                        }

                                        Ext.example.msg("รูปแบบการดูรีพอร์ท", this.getValue().boxLabel + ' file ' + Ext.file, 3);
                                    },
                                },
                            }
                        ],
                    }
                ],

                buttonAlign: "left",
                buttons: [
                    {
                        text: "บันทึกรายการ",
                        iconCls: "icon-save",
                        handler: function () {

//console.log(JSON.parse(JSON.stringify(Ext.getCmp('leftfrmID').items.items))); 
                            console.log(Ext.getCmp('leftfrmID').items.items.length);
                            console.log(Ext.getCmp('leftfrmID').items.items);
                            console.log(Ext.getCmp('rightfrmID').items.items);

                            return false;
                            var form = Ext.getCmp("frmTab2").getForm();
                            if (Ext.selectRow.get("sp_cate_id") == 2 && Ext.menu_code == 'ST0006') {
                                Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'> ! PR ท่านได้เคยบันทึกแล้วถ้าต้องการแก้ไข/ติดต่อแอดมิน</span><br>", function (bu, action) {
                                    console.log("sp_cate_id 1 >> " + Ext.selectRow.get("sp_cate_id"));
                                    console.log("menu ST0006 >> " + Ext.menu_code);
                                    return false;
                                });
                            } else if (form.isValid()) {
                                Ext.Msg.show({
                                    title: "ยืนยันบันทึกภาระงานที่ทำ",
                                    msg: "คุณต้องภาระงาน ?",
                                    width: 440,
                                    icon: Ext.MessageBox.QUESTION,
                                    buttons: Ext.MessageBox.YESNO,
                                    fn: function (btn) {
                                        if (btn === "yes")
                                            form.submit({
                                                waitMsg: "Saving Data...",
                                                success: function (form, action) {
                                                    Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                                        Ext.getCmp("tabpanel1").getStore().reload();
                                                        Ext.getCmp("frmTab2").destroy();
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
                                                }
                                            });
                                        else
                                            null;
                                    }
                                });

                            }
                        }
                    },
                    {
                        text: "ยกเลิก",
                        iconCls: "icon-cancel",
                        handler: function () {
                            tab1.destroy();

                        }
                    }
                ]
            }
        ]
    });

    Ext.buAct = "getDetail";
    Ext.getCmp("contenterCenter").add(tab1);
    Ext.getCmp("contenterCenter").setActiveTab(tab1);
    tab1.getForm().loadRecord(Ext.selectRow);
}; 
Ext.runStatus = function (menu) {
    return Ext.apply({
        name: menu,
        process: function (menuCode, record) {
            Ext.Ajax.request({
                url: "tor/api/mnTorController.php",
                params: {
                    mode: "UPDATENEXTSTEP",
                    menuCode: menuCode,
                    tor_status_id: record.get("tor_status_id"),
                    tor_type_id: record.get("tor_type_id"),
                    i_is_more: record.get("i_is_more"),
                    typeItems: Ext.typeItems,
                    i_entrance: Ext.menu_i_entrance,
                    id: record.get("id"),
                },
                method: "POST", //GET
                success: function (result, request) {
                    try {
                        var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                    } catch (err) {
                        Ext.MessageBox.alert("ติดต่อแอดมิน", result.responseText); // connect error
                    }
                    if (jsonData.success) {
                        Ext.MessageBox.alert("Success", jsonData.msg, function () {
                            Ext.getCmp("tabpanel1").getStore().reload();
                            Ext.getCmp("win-processID").hide(); // hidden window-panel
                            Ext.getCmp("win-processID").destroy(); // clear memory :: garbage collection
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
};
Ext.AppConfig = function () {
    Ext.user_right_add = user_right_add;
    Ext.user_right_edit = user_right_edit;
    Ext.user_right_delete = user_right_delete;
    Ext.title = Ext.menu_name + " " + Ext.menu_code;
    Ext.typeItems = Ext.menu_i_config;
    //Ext.menu_i_entrance;
    Ext.HDR_ID = null;
    Ext.selectRow = [];
    Ext.menuEditGrid = true;
    Ext.menuRightEditgrid = true;
    Ext.tor_type_id = 1; // default start เจาะจงน้อวกว่า 5 แสน
    Ext.i_is_more = 0;
    Ext.tor_type_idTxt = Ext.apply({
        tor_type_id1: {
            0: "แบบมี หัวงาน/ฝ่ายพิจารณาผล(ไม่เกิน 5 แสนบาท)",
            1: "แบบมีคณะกรรมการพิจารณาผล(เกิน 5 แสนบาท)",
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
    // copy text in cell on select row no
    function winProcess(rec) {
        new Ext.Window({
            id: "win-processID",
            title: "ผ่านรายการ PR",
            modal: true,
            resizable: false,
            width: 450,
            layout: "form",
            bodyStyle: "padding:3px;",
            items: [
                {
                    xtype: "displayfield",
                    fieldLabel: "ผ่านการสถานะของ",
                    value: "<b style='font-size:16px;'> " + rec.get("c_code") + " ?</b>",
                },
                {
                    xtype: "hidden",
                    name: "typeItems",
                    value: Ext.typeItems,
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
                            //                            checked: true,
                            inputValue: "GOTOSTEP",
                            checked: true,
                            boxLabel: "ผ่านรายการ <img src='../images/icons/accept.png'>",
                        },
                        {
                            name: "mode",
                            inputValue: "BACKSTEP",
                            boxLabel: "ส่งผ่านสถานะแก้ไข <img src='../images/icons/time_red.png'>",
                        },
                    ],
                    listeners: {
                        change: function (cb, nv, ov) {
                            if (Ext.getCmp("modesubID").getValue().inputValue == "BACKSTEP") {
                                Ext.getCmp("reasonID").show();
                            } else {
                                if (rec.data.c_comment_status == "") {
                                    Ext.getCmp("reasonID").hide();
                                }
                            }
                        },
                        afterrender: function () {
                            if (rec.data.c_comment_status == "") {
                                Ext.getCmp("modesubID").items.items[0].setValue(true);
                            } /*else{
                             Ext.getCmp('modesubID').items.items[1].setValue(true);
                             }*/
                        },
                    },
                },
                {
                    fieldLabel: "เหตุผลการรอ",
                    xtype: "textarea",
                    name: "reason",
                    width: 250,
                    id: "reasonID",
                    listeners: {
                        afterrender: function () {
                            Ext.getCmp("reasonID").setValue(rec.data.c_comment_status);
                            if (rec.data.c_comment_status == "") {
                                this.hide();
                            }
                        },
                    },
                },
            ],
            buttons: [
                {
                    text: "อัพเดทผ่านสถานะรายการ",
                    iconCls: "icon-save",
                    handler: function () {
                        if (Ext.getCmp("modesubID").getValue().inputValue == "GOTOSTEP") {
                            if (rec.get("i_is_more") == 0 && !Ext.isEmpty(Ext.menuCode1)) {
                                Ext.status.process(Ext.menuCode1, rec);
                            } else {
                                Ext.status.process(Ext.menuCode, rec);
                            }
                        } else if (Ext.getCmp("modesubID").getValue().inputValue == "BACKSTEP") {
                            var msg = "";
                            if (Ext.getCmp("reasonID").getValue() == "") {
                                msg += "<span style='white-space: nowrap;'>- กรุณากรอกเหตุผลการรอ</span><br>";
                            }
                            if (msg == "") {
                                Ext.Ajax.request({
                                    url: "tor/api/mnTorController.php",
                                    params: {
                                        mode: "BACKSTEP",
                                        tor_status_id: rec.data.tor_status_id,
                                        c_comment: Ext.getCmp("reasonID").getValue(),
                                        id: rec.data.id,
                                    },
                                    method: "POST", //GET
                                    success: function (result, request) {
                                        var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                                        if (jsonData.success) {
                                            Ext.MessageBox.alert("Success", jsonData.msg, function () {
                                                Ext.getCmp("tabpanel1").getStore().reload();
                                                Ext.getCmp("win-processID").hide(); // hidden window-panel
                                                Ext.getCmp("win-processID").destroy(); // clear memory :: garbage collection
                                            });
                                        } else {
                                            Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                                        }
                                    },
                                    failure: function (result, request) {
                                        Ext.MessageBox.alert("Failed", result.responseText); // connect error
                                    },
                                });
                            } else {
                                Ext.Msg.alert("แจ้งเตือน", msg);
                            }
                        }
                    },
                },
                {
                    text: Ext.GLOBAL_BU_BACK_TH,
                    iconCls: "icon-clear",
                    handler: function () {
                        Ext.getCmp("win-processID").destroy(); // clear memory :: garbage collection
                    },
                },
            ],
        }).show();
    }
    Ext.realTimeSentMsg = function (id, textSent) {
        var wsUri = "ws://" + window.parent.Ext.ipServer + ":9000/demo/server.php";

        websocket = new WebSocket(wsUri);
        websocket.onopen = function (ev) {
            // connection is open
            var msg = {
                message: textSent,
                name: id,
                color: "#007AFF",
            };
            websocket.send(JSON.stringify(msg));
        };
        //End Sent
    };
    function controller(rec, status) {
        if (status == "processUpdate") {
            Ext.Msg.minWidth = 200;
            Ext.Msg.buttonText = {
                ok: "ตกลง",
                cancel: "ยกเลิก",
                yes: "ผ่านรายการ",
                no: "ไม่",
            };
            if (rec.get("i_step") == 0) {
                Ext.Msg.alert("แจ้งเตือน", "ต้องบันทึกลงทะเบียนก่อนผ่านรายการ", function (bu, action) {
                    return false;
                });
            } else if (rec.get("sp_cate_id") == 1 && Ext.menu_code == 'ST0006') {
                Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'> ! PR ยังไม่กรอกเกณฑ์ราคาประกอบเกณฑ์อื่น กรณีที่ผู้ยื่นเกินกว่า 3 ราย</span><br>", function (bu, action) {
                    Ext.workScore();//line 3
                    return false;
                });
                Ext.Msg.show({
                    title: 'แจ้งเตือน',
                    msg: "<span style='white-space: nowrap;'> ! PR เกณฑ์ราคาประกอบเกณฑ์อื่น กรณีที่ผู้ยื่นเกินกว่า 3 รายให้ท่านกรอกภาระงานด้วย</span><br>",
                    width: 440,
                    icon: Ext.MessageBox.QUESTION,
                    buttons: {
                        yes: "เพิ่มภาระงาน",
                        no: "ผ่านรายการ",
                    },
                    fn: function (btn) {
                        if (btn === 'yes')
                            Ext.workScore();//line 3
                        else
                            winProcess(rec);
                    }
                });
                return;
            } else {
                winProcess(rec);
            }

        }
    } // Controller
    function cellClick(grid, rowIndex, columnIndex, e) {
        var record = grid.getStore().getAt(rowIndex);
        Ext.selectRow = record;
        if (columnIndex === grid.getColumnModel().getIndexById("processDueID")) {
            e.stopEvent();
            this.contextMenu.showAt(e.getXY());

        } else
        if (columnIndex === grid.getColumnModel().getIndexById("processDueID")) {
            console.log(Ext.selectRow.data.i_is_register);
            console.log(Ext.selectRow.data.index_receive);
            if (Ext.selectRow.data.index_receive == 0) {
                Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>กรุณาบันทึกรายการกรอกเลขสารบัญรับก่อนผ่านรายการ</span><br>", function (bu, action) {
                    return false;
                });
                return;
            }
            if (Ext.selectRow.data.i_is_register == 0) {
                Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>กรุณาบันทึกรายการก่อนผ่านรายการ</span><br>", function (bu, action) {
                    return false;
                });
                return;
            } else if (Ext.selectRow.data.tor_status_id == 11) {
                // ประกาศผลผู้ชนะ ST0007
                var count_data = new Ext.data.JsonStore({
                    root: "data",
                    autoLoad: true,
                    url: "tor/api/mnTorController.php",
                    baseParams: {mode: "TOR_VICTORY", sp_tor_id: Ext.selectRow.data.id},
                    fields: [{name: "sp_tor_contract_id"}],
                });
                if (count_data.fields.length < 1) {
                    Ext.Msg.alert("แจ้งเตือน", "รายการนี้ยังไม่ได้เพิ่มผู้ชนะ", function (bu, action) {
                        return false;
                    });
                    return;
                }
            } else if (Ext.selectRow.data.tor_status_id == 20) {
                // ร่างสัญญา ST0008
                var count_data = new Ext.data.JsonStore({
                    root: "data",
                    // autoLoad: true,
                    url: "tor/api/mnTorController.php",
                    baseParams: {mode: "LISTCREDITOR", tor_id: Ext.selectRow.data.id},
                    fields: [{name: "sp_tor_contract_id"}],
                });
                count_data.reload({
                    callback: function (recordx, operation, success) {
                        if (success) {
                            if (count_data.data.length < 1) {
                                Ext.Msg.alert("แจ้งเตือน", "รายการนี้ยังไม่ได้เพิ่มสัญญา", function (bu, action) {
                                    return false;
                                });
                                Ext.EnableProcess = 0;
                                return;
                            } else {
                                Ext.EnableProcess = 1;
                                for (var i = 1; count_data.data.length >= i; i++) {
                                    if (count_data.data.items[i - 1].json.c_code == "") {
                                        Ext.EnableProcess = 0;
                                    }
                                }
                                if (Ext.EnableProcess == 1) {
                                    controller(Ext.selectRow, "processUpdate"); //on
                                } else {
                                    Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>กรุณาออกเลข สัญญาหรือใบสั่งก่อนผ่านรายการ</span><br>", function (bu, action) {
                                        return false;
                                    });
                                }
                            }
                        }
                    },
                });
            }
            // console.log(Ext.selectRow.data);
            if (Ext.selectRow.data.tor_status_id != 20) {
                controller(Ext.selectRow, "processUpdate"); //on
            }
        } else if (columnIndex === grid.getColumnModel().getIndexById("processreverseID")) {
            // cancel_tor("reverse");
            // return ;
            // }
        } else if (columnIndex === grid.getColumnModel().getIndexById("processcancelID")) {
            // if (Ext.selectRow.data.tor_status_id == 20 ){
            // cancel_tor("cancel");
            // }
        } else if (columnIndex === grid.getColumnModel().getIndexById("linelID")) {
            cancel_tor("line", Ext.menu_code);
        }
    }
    var tab2 = new Ext.FormPanel({
        //labelAlign: 'top',
        title: "รายละเอียดของ PR",
        bodyStyle: "padding:5px",
        layout: "fit",
        width: 600,
        items: [
            {
                height: 200,
                layout: "column",
                border: false,
                items: [
                    {
                        columnWidth: 0.5,
                        layout: "form",
                        border: true,
                        items: [
                            {
                                xtype: "textfield",
                                fieldLabel: "First Name",
                                name: "first",
                                anchor: "50%",
                            },
                            {
                                xtype: "textfield",
                                fieldLabel: "Company",
                                name: "company",
                                anchor: "50%",
                            },
                        ],
                    },
                    {
                        columnWidth: 0.5,
                        layout: "form",
                        border: true,
                        items: [
                            {
                                xtype: "textfield",
                                fieldLabel: "Last Name",
                                name: "last",
                                anchor: "50%",
                            },
                            {
                                xtype: "textfield",
                                fieldLabel: "Email",
                                name: "email",
                                vtype: "email",
                                anchor: "50%",
                            },
                        ],
                    },
                ],
                buttonAlign: "left",
                buttons: [
                    {
                        text: "Save",
                    },
                    {
                        text: "Cancel",
                    },
                ],
            },
            {
                xtype: "tabpanel",
                plain: true,
                activeTab: 0,
                height: 235,
                deferredRender: false,
                defaults: {bodyStyle: "padding:10px"},
                items: [
                    {
                        title: "Personal Details",
                        layout: "form",
                        defaults: {width: 230},
                        defaultType: "textfield",

                        items: [
                            {
                                fieldLabel: "First Name",
                                name: "first",
                                allowBlank: false,
                                value: "Jack",
                            },
                            {
                                fieldLabel: "Last Name",
                                name: "last",
                                value: "Slocum",
                            },
                            {
                                fieldLabel: "Company",
                                name: "company",
                                value: "Ext JS",
                            },
                            {
                                fieldLabel: "Email",
                                name: "email",
                                vtype: "email",
                            },
                        ],
                    },
                    {
                        title: "Phone Numbers",
                        layout: "form",
                        defaults: {width: 230},
                        defaultType: "textfield",

                        items: [
                            {
                                fieldLabel: "Home",
                                name: "home",
                                value: "(888) 555-1212",
                            },
                            {
                                fieldLabel: "Business",
                                name: "business",
                            },
                            {
                                fieldLabel: "Mobile",
                                name: "mobile",
                            },
                            {
                                fieldLabel: "Fax",
                                name: "fax",
                            },
                        ],
                    },
                    {
                        cls: "x-plain",
                        title: "Biography",
                        layout: "fit",
                        items: {
                            xtype: "htmleditor",
                            id: "bio2",
                            fieldLabel: "Biography",
                        },
                    },
                ],
            },
        ],
    });
    function SearchFrm() {

        return {
            collapsible: false,
            width: 700,
            id: "winSearchFrm",
            height: 180,
            layout: "fit",
            plain: true,
            bodyStyle: "padding:-1px;font-size:10px;",
            buttonAlign: "center",
            xtype: 'form',
            items: [
                {
                    layout: "column",
                    border: false,
                    items: [
                        {
                            columnWidth: 0.5,
                            layout: "form",
                            border: false,
                            items: [
                                {
                                    xtype: "textfield",
                                    fieldLabel: "รหัส PR",
                                    id: "sc_codeID", // sd_tor_dateID sc_codeID sc_nameID searchEnabledID
                                    name: "c_code",
                                },
                                {
                                    xtype: "datefield",
                                    fieldLabel: "วันที่ PR",
                                    id: "sd_tor_dateID",
                                    name: "d_tor_date",
                                },
                                {
                                    xtype: "radiogroup",
                                    columns: [120],
                                    fieldLabel: "ผ่านรายการ",
                                    id: "searchPostID",
                                    items: [
                                        {
                                            name: "i_post",
                                            checked: true,
                                            inputValue: 0,
                                            boxLabel: "ทั้งหมด",
                                        },
                                        {
                                            name: "i_post",
                                            inputValue: 1,
                                            boxLabel: "ผ่านรายการแล้ว",
                                        },
                                        {
                                            name: "i_post",
                                            inputValue: 2,
                                            boxLabel: "ยังไม่ผ่านรายการ",
                                        },
                                    ], //radiogroup
                                }
                            ]
                        },
                        {
                            columnWidth: 0.5,
                            layout: "form",
                            border: false,
                            items: [
                                {
                                    xtype: "textfield",
                                    fieldLabel: "เรื่อง PR",
                                    id: "sc_nameID",
                                    name: "c_name",
                                },
                                new Ext.form.ComboBox({
                                    mode: "local",
                                    store: new Ext.data.JsonStore({
                                        autoDestroy: false,
                                        autoLoad: false,
                                        url: "api/All_spAlert.php",
                                        baseParams: {
                                            type: "sp_type_status",
                                            i_is_type_tor: true,
                                            all: "all",
                                        },
                                        root: "data",
                                        idProperty: "id",
                                        fields: ["id", "c_name"],
                                    }),
                                    anchor: "98%",
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
                                {
                                    xtype: "radiogroup",
                                    columns: [120],
                                    fieldLabel: "เลือกดูข้อมูล",
                                    id: "searchPostID1",
                                    // hidden: Ext.session.i_level >= 3 ? true : false,

                                    items: [
                                        {
                                            name: "i_post1",
                                            checked: true,
                                            inputValue: 0,
                                            boxLabel: "ทั้งหมด",
                                        },
                                        {
                                            name: "i_post1",
                                            inputValue: 1,
                                            boxLabel: "ดูของตัวเอง",
                                        },
                                    ],
                                },
                            ],
                        },
                    ],

                    buttonAling: 'left',
                    buttons: [{
                            text: "ค้นหา",
                            xtype: 'button',
                            iconCls: 'icon-magnifier',
                            handler: function () {
                                Ext.storeDtl.setBaseParam("mode", "LIST");
                                Ext.storeDtl.setBaseParam("act", "SEARCH");
                                Ext.storeDtl.setBaseParam("d_tor_date", Ext.getCmp("sd_tor_dateID").getValue());
                                Ext.storeDtl.setBaseParam("tor_type_id", Ext.getCmp("stor_type_idID").getValue());
                                Ext.storeDtl.setBaseParam("sp_emp_id", Ext.session.sp_emp_id);
                                Ext.storeDtl.setBaseParam("c_code", Ext.getCmp("sc_codeID").getValue());
                                Ext.storeDtl.setBaseParam("c_name", Ext.getCmp("sc_nameID").getValue());
                                Ext.storeDtl.setBaseParam("i_enabled", 1);
                                // Ext.storeDtl.setBaseParam("i_enabled", Ext.getCmp("searchEnabledID").getValue().inputValue);
                                Ext.storeDtl.setBaseParam("i_post", Ext.getCmp("searchPostID").getValue().inputValue);
                                Ext.storeDtl.setBaseParam("i_post1", Ext.getCmp("searchPostID1").getValue().inputValue);
                                Ext.storeDtl.load();
                            },
                        }]
                },
            ],
            bbar: ['สถานะของรายการ', ' ', '-',

                '->',
            ],
            listeners: {
//                collapsible: function (animate) { alert('');},

                afterRender: function (thisForm, options) {
                    new Ext.KeyNav("winSearchFrm", {
                        enter: function (e) {
                            Ext.storeDtl.setBaseParam("mode", "LIST");
                            Ext.storeDtl.setBaseParam("act", "SEARCH");
                            Ext.storeDtl.setBaseParam("d_tor_date", Ext.getCmp("sd_tor_dateID").getValue());
                            Ext.storeDtl.setBaseParam("tor_type_id", Ext.getCmp("stor_type_idID").getValue());

                            Ext.storeDtl.setBaseParam("c_code", Ext.getCmp("sc_codeID").getValue());
                            Ext.storeDtl.setBaseParam("c_name", Ext.getCmp("sc_nameID").getValue());
                            Ext.storeDtl.setBaseParam("i_enabled", Ext.getCmp("searchEnabledID").getValue().inputValue);
                            Ext.storeDtl.setBaseParam("i_post", Ext.getCmp("searchPostID").getValue().inputValue);

                            Ext.storeDtl.load();
                        },
                        scope: this,
                    });
                },
            },
        };
    }
    var MenuButton = function () {
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
        menu
                .add({
                    text: "ค้นหาข้อมูล",
                    icon: "../images/icons/book_magnify.png",
                })
                .on(
                        "click",
                        (click = function () {
                            if (!Ext.isEmpty(Ext.getCmp("winSearchFrm")))
                                Ext.getCmp("winSearchFrm").destroy();
                            var s1 = SearchFrm();
                            s1.show();
                        })
                        );
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
                        header: "id",
                        sortable: false,
                        align: "left",
                        dataIndex: "id",
                        hidden: true, // icon: "../images/icons/application_view_tile.png"
                    }, {
                        header: "-",
                        id: "signID",
                        sortable: true,
                        dataIndex: "id",
                        width: 55,
                        renderer: function (value, metaData, record, row, col, store, gridView) {
                            var txt = ' ' + value;
                            var style = ' text-align: left; color:gray;font-size:12px;border:1px solid #ccc; width:210px; padding:3px 3px 3px 25px; background: #f0f0f0 url(../images/icons/icon_pdf.png) no-repeat 3px center;';

                            if (record.get("i_is_upload") == 1) {
                                txt = 'เปิดดูเอกสาร ' + value; 
                                style = ' text-align: left; font-size:12px;border:1px solid #ccc; width:210px; padding:3px 3px 3px 25px; background: #f0f0f0 url(../images/icons/icon_pdf.png) no-repeat 3px center; cursor: pointer;';

                            } 
                            return '<button style="' + style + '" type="button">' + txt + '</button>';
                        }
                    },
                    {
                        header: "-",
                        id: "print",
                        sortable: true,
                        dataIndex: "id",
                        width: 40,
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                            metaData.attr = "align='center'";
                            return "<div style='cursor:pointer'><img src='../images/icons/printer_mono.png' style='margin-right:1px;' /><div>";
                        },
                    },
                    {
                        header: "เอกสารขออนุมัติซื้อจ้าง",
                        sortable: false,
                        width: 115,
                        align: "center",
                        dataIndex: "pdf_hdr",
                        editor: new Ext.form.TextField({}),
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                            if (record.data.c_code) {
                                var BtnText = "<img src='../images/icons/page_white_acrobat.png' style='margin-right:1px;' /><div><spen style='font-size:11px; color: green;'>&nbsp<b>" + record.data.c_code + "</b>&nbsp</spen>";
                                if (record.data.i_is_url_pdf_hdr == null) {
                                    return "-";
                                } else if (record.data.i_is_url_pdf_hdr == 0) {
                                    return '<button style="display: flex; height: 18px; padding: 0px;" onclick="Po_OpenPdf(\'' + value + "', '" + record.data.c_code + '\')" type="button">' + BtnText + "</button>";
                                } else {
                                    return "-";
                                }
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
                    }, {
                        header: "รหัส PR",
                        sortable: false,
                        align: "left",
                        id: "c_codeStatusId",
                        dataIndex: "c_codeStatus",
                        width: 120,
                    },
                    {
                        header: "อัพเดทสถานะ",
                        sortable: false,
                        align: "center",
                        dataIndex: "id",
                        id: "processDueID",
                        width: 120,
                        renderer: function (value, metaData, record, row, col, store, gridView) {
                            //                            metaData.attr = "style='cursor:pointer; text-align:center;';";
                            var BtnText, IconImg;
                            if (record.get("i_is_register") === 0) {
                                BtnText = "&nbspยังไม่บันทึก";
                                IconImg = "../images/icons/application_form.png";
                            } else if (record.get("i_is_register") === 1) {
                                BtnText = "&nbspบันทึกแล้ว";
                                IconImg = "../images/icons/cog_start.png";
                            } else {
                                BtnText = "&nbspยังไม่บันทึก";
                                IconImg = "../images/icons/application_form.png";
                            }
                            var style = "font-size:12px;border:1px solid #ccc; width:110px; padding:3px 3px 3px 10px; background: #f0f0f0 url(" + IconImg + ") no-repeat 3px center; cursor: pointer;";

                            return '<button style="' + style + '" type="button">' + BtnText + "</button>";
                        },
                    },
                    {
                        header: "เรื่อง/โครงการ",
                        sortable: true,
                        align: "left",
                        dataIndex: "c_nameStatus",
                        width: 300,
                    },
                    {
                        header: "ประเภทสัญญ/เงินอุดหนุน",
                        sortable: true,
                        align: "left",
                        dataIndex: "i_type_contract",
                        width: 150,
                        renderer: function (value, metaData, record, row, col, store, gridView) {
                            let val = 0; //bg_check_id
                            if (record.get("i_type_bg") == 1) {
                                if (record.get("i_bg_type") == 1 && [0, 3].includes(record.get("i_is_request")) && record.get("bg_check_id") == 0) {
                                    val = 1;
                                } else if (record.get("i_bg_type") == 1 && record.get("i_is_request") == 1 && record.get("bg_check_id") == 0) {
                                    val = 2;
                                } else if (record.get("i_bg_type") == 1 && record.get("i_is_request") == 1 && record.get("bg_check_id") > 0) {
                                    val = 3;
                                } else if (record.get("i_bg_type") == 1 && record.get("i_is_request") == 2 && record.get("bg_check_id") > 0) {
                                    val = 4;
                                }
                            }

                            let arrPeriod = [
                                "",
                                "<font color=red>/ส่งคำขอ<font>",
                                "<font color=red>/รออนุมัติฝ่ายจัดสรร<font>",
                                "<font color=red>/รอฝ่ายจัดสรร ผ่านรายการ<font>",
                                "<font color=red>/ฝ่ายจัดสรรอนุมัติเงินแล้ว<font>",
                            ];

                            let arrContract = ["", "สัญญา", "ใบสั่ง", "จะซื้อจะขาย"];

                            return arrContract[value] + arrPeriod[val];
                        },
                    },
                    {
                        header: "เลขสารบัญรับ",
                        sortable: false,
                        align: "center",
                        dataIndex: "index_receive",
                    },
                    {
                        header: "จำนวนเงิน",
                        sortable: false,
                        align: "center",
                        dataIndex: "f_total_amt",
                        width: 110,
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                            metaData.attr = "style='color:blue;text-align: right;'";
                            return floatRenderer(value);
                        },
                    },
                    {
                        header: "วันที่ PR",
                        sortable: false,
                        align: "center",
                        hidden: true,
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
                        align: "center",
                        width: 70,
                        dataIndex: "c_purchase",
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
                    // {
                    //   header: "ย้อนสถานะ",
                    //   sortable: false,
                    //   align: "center",
                    //   hidden: true,
                    //   dataIndex: "id",
                    //   id: "processreverseID", // reverse
                    //   width: 200,
                    //   renderer: function (value, metaData, record, row, col, store, gridView) {
                    //     var BtnText, IconImg;
                    //     BtnText = "&nbspย้อนรายการ";
                    //     IconImg = "../images/icons/date_previous.png";
                    //     var style = "font-size:12px;border:1px solid #ccc; width:100px; padding:3px 3px 3px 10px; background: #f0f0f0 url(" + IconImg + ") no-repeat 3px center; cursor: pointer;";

                    //     return '<button style="' + style + '" type="button">' + BtnText + "</button>";
                    //   },
                    // },
                    {
                        header: "ยกเลิกรายการ",
                        sortable: false,
                        align: "center",
                        dataIndex: "id",
                        id: "processcancelID", // cancel
                        width: 200,
                        renderer: function (value, metaData, record, row, col, store, gridView) {
                            var BtnText, IconImg;
                            BtnText = "&nbspยกเลิกรายการ";
                            IconImg = "../images/icons/page_cancel.png";
                            var style = "font-size:12px;border:1px solid #ccc; width:100px; padding:3px 3px 3px 10px; background: #f0f0f0 url(" + IconImg + ") no-repeat 3px center; cursor: pointer;";

                            return '<button style="' + style + '" type="button">' + BtnText + "</button>";
                        },
                    },
                    {
                        header: "แจ้งแอดมิน",
                        sortable: false,
                        align: "center",
                        dataIndex: "id",
                        id: "linelID", // cancel
                        width: 200,
                        renderer: function (value, metaData, record, row, col, store, gridView) {
                            var BtnText, IconImg;
                            BtnText = "&nbspแจ้งแอดมิน";
                            IconImg = "../images/icons/television_out.png";
                            var style = "font-size:12px;border:1px solid #ccc; width:100px; padding:3px 3px 3px 10px; background: #f0f0f0 url(" + IconImg + ") no-repeat 3px center; cursor: pointer;";

                            return '<button style="' + style + '" type="button">' + BtnText + "</button>";
                        },
                    },
                ];
                gridMain.superclass.constructor.call(this, {
                    region: "center",
                    title: Ext.title,
                    xtype: "grid",
                    id: "tabpanel1",
                    iconCls: "icon-application-view-list",
                    border: true,
                    stripeRows: true,
                    loadMask: true,
                    //------------------
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
                            // Call the function

                            switch (Ext.menu_code) {

                                case "ST0006":
                                    Ext.displayMenuId = false;
                                    Ext.displayMenuApprove = true;
                                    break;
                                case "APSTEP21":
                                    Ext.displayMenuApprove = false;
                                    Ext.displayMenuId = true;
                                    break;
                                default:
                                    Ext.displayMenuId = true;
                                    Ext.displayMenuApprove = true;
                                    break;
                            }

                            this.contextMenu = new Ext.menu.Menu({
                                items: [

                                    {
                                        text: "จัดทำใบขออนุมัติซื้อจ้าง",
                                        hidden: Ext.displayMenuApprove ? true : false,
                                        icon: "../images/icons/application_edit.png",
                                        handler: function (e) {
                                            Ext.addApproval("line", Ext.menu_code);
                                        },
                                        scope: this,
                                    },
                                    {
                                        text: "จัดการข้อมูล View/Copy/Edit/Delete",
                                        icon: "../images/icons/application_edit.png",
                                        handler: function (e) {
                                            Ext.buAct = "update";
                                            Ext.loadStore("edit", true); // app,data.load
                                        },
                                        scope: this,
                                    }, {
                                        text: "บันทึกภาระการทำงาน (" + Ext.menu_name + ")",
                                        icon: "../images/icons/application_form_edit.png",
                                        id: "workMenuID",
                                        hidden: Ext.displayMenuId,
                                        handler: function (e) {

                                            Ext.workScore();//line 3

                                        },
                                        scope: this,
                                    },
                                    {
                                        text: "ตรวจสอบเอกสาร",
                                        icon: "../images/icons/icon_pdf.png",
                                        handler: function (e) {
                                            Ext.buAct = "FlowcartLv1";
                                            var linkDownload = window.location.protocol + "//" + window.location.hostname + "/sp_mn/api/upload/";
                                            if (Ext.isEmpty(Ext.selectRow))
                                                Ext.MessageBox.alert("แจ้งเตือน", "กรุณากดเลือกข้อมูลที่จะแสดง/ออกเลข PR ก่อน");
                                            window.open(linkDownload + Ext.selectRow.get("c_code") + ".pdf?T=Tap_" + Math.floor(Math.random() * 100000), "_blank", 'fullscreen="yes"');
                                        },
                                        scope: this,
                                    },
                                    {
                                        text: "แก้ไขข้อมูล",
                                        // hidden: true,
                                        icon: "../images/icons/table_error.png",
                                        handler: function (e) {
                                            edit_tor("edit_tor");
                                        },
                                        scope: this,
                                    },
                                    {
                                        text: "ย้อนรายการ",
                                        hidden: true,
                                        icon: "../images/icons/date_previous.png",
                                        handler: function (e) {
                                            // Ext.buAct = "update";
                                            // cancel_tor("reverse");
                                        },
                                        scope: this,
                                    },
                                    {
                                        text: "แจ้งแอดมิน",
                                        hidden: Ext.isAudit ? true : false,
                                        icon: "../images/icons/television_out.png",
                                        handler: function (e) {
                                            cancel_tor("line", Ext.menu_code);
                                        },
                                        scope: this,
                                    },

                                    {
                                        text: "ยกเลิกรายการ",
                                        // hidden: Ext.isAudit ? true : false,
                                        icon: "../images/icons/page_cancel.png",
                                        handler: function (e) {
                                            cancel_tor("cancel");
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
                        },
                    },
                    store: Ext.storeDtl,
                    tbar: [SearchFrm()],
                    //tbar: MenuButton(),
                    columns: colmnn,
                    bbar: new Ext.PagingToolbar({
                        pageSize: 20,
                        store: Ext.storeDtl,
                        displayInfo: true,
                        displayMsg: "Displaying topics {0} - {1} of {2}",
                    }),
                });
            }),
            Ext.grid.GridPanel,
            {}
    );
    ///////////////// EditorGridPanel
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
    //AutoLoad
    Ext.torType = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/All_spAlert.php",
        baseParams: {type: "sp_type_status", i_is_type_tor: true},
        root: "data",
        idProperty: "id",
        fields: ["id", "c_name"],
    });
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
        url: "tor/api/List_TorStep.php",
        baseParams: {
            type: "po_working_dtl1",
            keyData: Ext.keyData,
            i_alarm: Ext.menu_i_alarm,
            i_pa: Ext.menu_i_day,
            i_edit: true,
            tor_status_id: Ext.menu_id,
            i_enabled: 1,
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
                name: "f_type_amt",
            },
            {
                name: "sp_cate_id", type: "int"
            },
            {
                name: "contract_no",
            },
            {
                name: "index_receive",
            },
            {
                name: "bg_check_id",
                type: "int",
            },
            {
                name: "i_type_bg",
                type: "int",
            },
            {
                name: "i_bg_type",
                type: "int",
            },
            {
                name: "i_is_request",
                type: "int",
            },
            {
                name: "dc_emp_id",
            },
            {
                name: "i_receive",
            },
            {
                name: "txtsub_cost",
            },
            {
                name: "dc_emp_name",
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
                name: "d_tor_date_pa",
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
                name: "sp_tor_delete",
            },
            {
                name: "tor_delete_comment",
            },
            {
                name: "c_nameStatus",
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
                name: "txtdc_department_idID",
            },
            {
                name: "d_tor_status_date", //
            },
            {
                name: "c_name_status", // d_tor_status_date
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
                name: "i_purchase",
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
                name: "i_is_register",
            },
            {
                name: "i_is_parent",
            },
            {
                name: "i_type_fix_rate",
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
                name: "i_year",
            },
            {
                name: "i_yyyy",
            },
            {
                name: "dc_expense_budget_type_id",
            },
            {
                name: "c_year",
            },
            {
                name: "dc_department_id",
            },
            {
                name: "sp_emp_id",
            },
            {
                name: "c_department",
            },
            {
                name: "d_doc_ref",
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
                name: "d_egp_date",
            },
            {
                name: "i_enabled",
            },
            {
                name: "c_comment",
            },
            {
                name: "c_comment_status",
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
                name: "i_type_contract",
            },
            {
                name: "i_delivery_date",
            },
            {
                name: "sp_type_bg",
            },
            {name: "sp_contract_year"},
        ],
    });
    /*            
     // "i_hire_type" => $row["i_hire_type"],
     "i_is_inv" => $row["i_is_inv"],
     "i_type_fix_rate" => $row["i_type_fix_rate"],
     "i_product_type" => $row["i_product_type"] 
     */
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
};
