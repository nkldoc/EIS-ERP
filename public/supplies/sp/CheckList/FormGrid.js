function WinDash1(id, txt, items, w, h, x, y, icon) {
    var iconCsl = icon ? icon : "icon-graph";
    var rec = Ext.selectRow;
    return new Ext.Window({
        collapsible: true,
        maximizable: true,
        title: txt,
        iconCls: iconCsl,
        id: id,
        width: w,
        height: h,
        layout: "fit",
        modal: false,
        plain: true,
        initCenter: false,
        x: x,
        y: y,
        items: items,
        listeners: {
            beforrender: function () {},
            afterrender: function () {
                Ext.getCmp(id).getEl().mask("Please wait...", "x-mask-loading");
                var tt = 0;
                switch (id) {
                    case "reportsmonthFrmID":
                        tt = 0;
                        break;
                    case "win-1":
                        tt = 0;
                        break;
                    case "win-2":
                        tt = 1000;
                        break;
                    case "win-3":
                        tt = 1500;
                        break;
                }
                setTimeout(function () {
                    Ext.getCmp(id).getEl().unmask();
                }, tt);
            },
        },
    });
}

const Timeline = (group, text) => {
    var item = {
        xtype: "displayfield",
        html: '<iframe src="../bi/getPrTimeline.php?_dc=' + Math.floor(Math.random() * 1000000000) + '&c_code=' + Ext.selectRow.get('c_code') + '" frameborder="0" width="100%" height="100%"></iframe>',
    };
    switch (group) {
        case "PR":
            WinDash1("win-permission", text, [item], 1000, 600, 100, 50, "icon-cog").show();
            return "Purchase Request Created";
        case "PO":
            return "Purchase Order Issued";
        case "CHK":
            return "Checking / Verification";
        case "BILL":
            return "Billing / Invoicing";
        case "DX":
            return "Delivery / Completed";
        default:
            return "Unknown Stage";
    }

};
const search = function () {
    var msg = "";
    if (msg == "") {
        Ext.storeDtl.setBaseParam("mode", "LIST");
        Ext.storeDtl.setBaseParam("type", "SEARCH");
        Ext.storeDtl.setBaseParam("filter", Ext.getCmp("filter").getValue());
        Ext.storeDtl.setBaseParam("value", Ext.getCmp("value-box").getValue());
        Ext.storeDtl.setBaseParam("dc_expense_budget_type_id", Ext.getCmp("s_dc_expense_budget_type_id").getValue());
        Ext.storeDtl.setBaseParam("f_total_amtPr", Ext.getCmp("f_total_amtPrID").getValue());
        Ext.storeDtl.setBaseParam("f_total_amtPo", Ext.getCmp("f_total_amtPoID").getValue());
        Ext.storeDtl.setBaseParam("i_show", Ext.getCmp("i_showID").getValue() ? 1 : 0);
        Ext.storeDtl.setBaseParam("dc_cost_id", Ext.getCmp("s_dc_cost_idID").getValue());
        Ext.storeDtl.setBaseParam("dc_sub_cost_id", Ext.getCmp("s_dc_sub_cost_idID").getValue());

        Ext.storeDtl.setBaseParam("i_type_contract", Ext.getCmp("s_i_type_contract").getValue());
        Ext.storeDtl.setBaseParam("sp_emp_id", Ext.getCmp("sp_emp_idID").getValue());
        Ext.storeDtl.setBaseParam("i_enabled", Ext.getCmp("s_i_status").getValue());
        Ext.storeDtl.setBaseParam("tor_type_id", Ext.getCmp("s_tor_type_idID").getValue());
        Ext.storeDtl.setBaseParam("i_budget_year", Ext.getCmp("s_i_budget_year").getValue());
        Ext.storeDtl.setBaseParam("i_budget_year_overlap", Ext.getCmp("s_i_budget_year_overlap").getValue());
        Ext.storeDtl.setBaseParam("i_year_contract", Ext.getCmp("s_i_year_contract").getValue());
        Ext.storeDtl.setBaseParam("sp_tor_status_id", Ext.getCmp("sp_tor_status_id").getValue());
        // Ext.storeDtl.setBaseParam("i_enable", Ext.getCmp("s_i_enable").getValue());

        // Ext.storeDtl.setBaseParam("userid", Ext.getCmp("userid-ID").getValue());
        Ext.getCmp("tabpanel1").getStore().load();
    } else {
        Ext.Msg.alert("แจ้งเตือน", msg);
    }
    Ext.storeDtl.load();
};
Ext.getBodyMultiBudget = function (rec, status) {
    i_amount_bg = Ext.selectRow.get("i_amount_bg") || Ext.selectRow.json.i_amount_bg;
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
        var i_type_bg = Ext.selectRow.json.i_type_bg == 4 || Ext.selectRow.json.i_type_bg == 2 ? true : false;
        var i_pr_type = Ext.selectRow.get("i_pr_type1") || Ext.selectRow.json.i_pr_type1;
    } else {
        var bg_reserve_money1_id = true;
        var bg_reserve_money2_id = true;
        var bg_reserve_money3_id = true;
        var i_type_bg = Ext.selectRow.json.i_type_bg == 4 || Ext.selectRow.json.i_type_bg == 2 ? true : false;
        var i_pr_type = Ext.selectRow.get("i_pr_type1") || Ext.selectRow.json.i_pr_type1;
    }
    if (Ext.selectRow.data.sp_bg_edit == 1) {
        Ext.MessageBox.alert("แจ้งเตือน", "อยู่ระหว่างการแก้ไขแหล่งเงินไม่สามารถแก้ไขรายการได้");
        return;
    }
    if (Ext.selectRow.data.i_pr_type != undefined) {
        Ext.getCmp("i_pr_type1ID").setValue(i_pr_type);
    }
    if (status == "st0001.1") {
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
        readOnly: true,
        // readOnly: bg_reserve_money1_id,
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
        // readOnly: bg_reserve_money1_id,
        readOnly: true,
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
        // readOnly: bg_reserve_money2_id,
        readOnly: true,
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
        // readOnly: bg_reserve_money3_id,
        readOnly: true,
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
    Ext.getCmp("dc_expense_budget_type_hdr_id2").setValue(dc_expense_budget_type2_id);
    Ext.getCmp("dc_expense_budget_type_hdr_id3").setValue(dc_expense_budget_type3_id);
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
// ตัวแปรติดตามจำนวนช่องเงิน
let local_i = 0;

// ฟังก์ชันสำหรับคำนวณผลรวม
function sumPayments(local_i) {
    let total = 0;

    // วนลูปทุกช่องที่สร้างขึ้นมา
    for (let i = 0; i <= local_i; i++) {
        let field = Ext.getCmp("f_bg_amt[" + i + "]ID");
        if (field) {
            // อ่านค่าในช่อง และแปลงเป็นตัวเลข (จัดการกรณีช่องว่าง)
            let value = parseFloat(field.getValue()?.replace(/,/g, "") || 0);
            total += value;
        }
    }

    // เซ็ตผลรวมในช่องผลรวม
    Ext.getCmp("f_totalID").setValue(Ext.util.Format.number(total, "0,000.00"));
}

let yearsSearch = [];
yearsSearch.push({id: "0", c_name: "- เลือกทั้งหมด -"});

let currentTime = new Date();
let now = currentTime.getFullYear() + 1;
let id = currentTime.getFullYear() - 4;

while (id <= now) {
    let c_name = id + 543;
    yearsSearch.push({id, c_name});
    id++;
}

Ext.store_yearSearch = new Ext.data.JsonStore({
    fields: ["id", "c_name"],
    data: yearsSearch,
});
sp_manual = function (event) {
    const x = event.clientX;
    const y = event.clientY;

    var menu = new Ext.menu.Menu();
    if (Ext.I_SUB_STATUS == "3.00") {
        menu.add({
            text: "คู่มือการสร้าง PR",
            icon: "../images/icons/book.png",
            scope: this,
            handler: function (e) {
                window.open("manual/คู่มือการสร้างPR.pdf");
            },
        });
    }
    // if (Ext.I_SUB_STATUS != "3.00") {
    //   menu.add({
    //     text: "คู่มือการสร้างPR",
    //     icon: "../images/icons/book.png",
    //     scope: this,
    //     handler: function (e) {
    //       window.open("manual/คู่มือการสร้างPR.pdf");
    //     },
    //   });
    // }
    menu.showAt([x, y]);
};
function setDisabled_button(i, v, tf, arr) {
    // v1 == button
    // v2 ==
    tf == 1 ? true : false;
    if (v == 1) {
        var buttonName = "buttonBgID" + arr; // ปุ่มลบเงิน
        var button = Ext.getCmp(buttonName);
        button.setDisabled(tf);
        // var combotype_name = "dc_expense_budget_type_id[" + arr + "]";
        // console.log(combotype_name);
        // console.log(Ext.getCmp(combotype_name));
        // Ext.getCmp(combotype_name).setReadOnly(true);
    }
    if (v == 2) {
    }
}
sumtopbar = function () {
    var i = 0;
    var max = Ext.store2.data.length - 1;
    var sumtop = 0;
    var str = "";
    while (i <= max) {
        str = Ext.store2.data.items[i].data.f_total_amt;
        sumtop += parseInt(str.replace(/\,/g, ""));
        i++;
    }
    if (sumtop != 0) {
        var textsum = "<span style=' font-size: 13px; white-space: nowrap;'>ราคารวม : ";
        textsum += sumtop.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " บาท</span>";
        Ext.getCmp("sumtop").setText(textsum);
        Ext.getCmp("f_net_total_amtID").setValue(Ext.floatRenderer(sumtop));
    } else {
        Ext.getCmp("sumtop").setText("");
        Ext.getCmp("f_net_total_amtID").setValue("0.00");
    }
};
function getlink(v, i, arr) {
    return new Promise((resolve, reject) => {
        // var f_amt_sum = f_amt - cheVal;
        // var c_name_po_expense_id = getStoreItems(Ext.po_expense, po_expense_id, "c_name");
        if (i == 1) {
            i_pr_type = Ext.getCmp("i_pr_type[0]ID").getValue().inputValue;
            dc_expense_budget_type = Ext.getCmp("dc_expense_budget_type_id[0]ID").getValue();
        } else if (i == 2) {
            i_pr_type = Ext.getCmp("i_pr_type[1]ID").getValue().inputValue;
            dc_expense_budget_type = Ext.getCmp("dc_expense_budget_type_id[1]ID").getValue();
        } else {
            i_pr_type = Ext.getCmp("i_pr_type[2]ID").getValue().inputValue;
            dc_expense_budget_type = Ext.getCmp("dc_expense_budget_type_id[2]ID").getValue();
        }
        var c_name_dc_expense_budget_type = getStoreItems(Ext.dc_expense_budget_type, dc_expense_budget_type, "c_name");
        var link =
                Ext.session.IPAPIBG +
                "/?/bg/mn_BgReserveMoney/mode/POST" +
                "/i_sys/3" +
                "/pr_id/" +
                Ext.selectRow.get("id") +
                "/po_id/0" +
                "/chk_id/0" +
                "/i_year/" +
                Ext.getCmp("i_yearID").getValue() +
                "/i_pr_type/" +
                i_pr_type + //  plan or period
                "/i_reserve/1" + // step 1 PR step 2 po step3 checking
                "/dc_cost_id/" +
                Ext.getCmp("dc_cost2_idID").getValue() +
                "/dc_budget_type_id/" +
                dc_expense_budget_type +
                // Ext.selectRow.get(i_type) +
                "/bg_expense_id/" +
                Ext.getCmp("po_expense_id_ID").getValue() +
                "/i_last/1" +
                "/f_amt/" +
                v;
        // Ext.Msg.show({
        //   title: "แจ้งเตือน!",
        //   msg: "ยืนยันการจองเงิน แหล่งเงิน : " + c_name_dc_expense_budget_type + "\n",
        //   width: 400,
        //   icon: Ext.MessageBox.QUESTION,
        //   buttons: Ext.MessageBox.YESNO,
        //   fn: function (btn, text) {
        //     if (btn === "yes") {
        Ext.getCmp(Ext.poFormID).getEl().mask("Please wait...", "x-mask-loading");
        Ext.Ajax.request({
            url: link,
            method: "GET", //POST
            disableCaching: false,
            success: function (result, request) {
                var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                if (jsonData.success) {
                    setDisabled_button(i, 1, 1, arr);
                    console.log(i);
                    purchase2(Ext.selectRow.get("id"), jsonData.bg_reserve_money_id, i);
                    resolve();
                } else {
                    // setDisabled_button(i, 1);
                    Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                }
            },
            failure: function (result, request) {
                // setDisabled_button(i, 1);
                Ext.MessageBox.alert("Failed", result.responseText); // connect error
            },
        });
        //     } else {
        //       // setDisabled_button(i, 1);
        //       null;
        //     }
        //   },
        // });
    });
}
function genBooklink(v, i, loop) {
    return new Promise((resolve, reject) => {
        var ii = i;
        var i_type = "dc_expense_budget_type" + i + "_id";
        var dc_expense_budget_type = Ext.selectRow.get(i_type);
        var po_expense_id = Ext.selectRow.get("po_expense_id");
        var pr_type = "i_pr_type" + i;
        var i_pr_type = Ext.selectRow.get(pr_type);
        var ip = Ext.session.ip_booking; // 192
        // var i_amount_bg = Ext.getCmp("i_amount_bgID").getValue().inputValue;

        var i_yyyy = Ext.getCmp("i_yearID").getValue();
        if (i_yyyy != Ext.selectRow.get("i_yyyy")) {
            var i_yyyy = Ext.getCmp("i_yearID").getValue();
        }
        if (
                i_pr_type == null ||
                dc_expense_budget_type == null ||
                dc_expense_budget_type != Ext.getCmp("dc_expense_budget_type_id[0]ID").getValue() ||
                Ext.selectRow.get("dc_cost_id") != Ext.getCmp("dc_cost2_idID").getValue() ||
                Ext.selectRow.get("po_expense_id") != Ext.getCmp("po_expense_id_ID").getValue()
                ) {
            var po_expense_id = Ext.getCmp("po_expense_id_ID").getValue();
            var dc_cost2_id = Ext.getCmp("dc_cost2_idID").getValue();
            var i_pr_type = null;
            if (i == 1) {
                i_pr_type = Ext.getCmp("i_pr_type[0]ID").getValue().inputValue;
                dc_expense_budget_type = Ext.getCmp("dc_expense_budget_type_id[0]ID").getValue();
            } else if (i == 2) {
                i_pr_type = Ext.getCmp("i_pr_type[1]ID").getValue().inputValue;
                dc_expense_budget_type = Ext.getCmp("dc_expense_budget_type_id[1]ID").getValue();
            } else {
                i_pr_type = Ext.getCmp("i_pr_type[2]ID").getValue().inputValue;
                dc_expense_budget_type = Ext.getCmp("dc_expense_budget_type_id[2]ID").getValue();
            }
            console.log(v);
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
                    dc_cost2_id: dc_cost2_id,
                    f_total_pr: Ext.getCmp("f_totalID").getValue().replace(/,/g, "") / 1,
                    i_yyyy: i_yyyy,
                },
                success: function (result, request) {
                    Ext.storeDtl.reload({callback: function (record, operation, success) {}});
                    var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                    if (jsonData.success) {
                        // console.log(Ext.getCmp("f_bg_amt[0]ID").getValue());
                        // console.log(Ext.getCmp("f_bg_amt[0]ID").getValue());
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
                "/?/bg/BgBudgetAllSupplies" +
                "/i_year/" +
                i_yyyy +
                "/dc_budget_type_id/" +
                dc_expense_budget_type +
                // Ext.selectRow.get(i_type) +
                "/dc_cost_id/" +
                dc_cost2_id +
                "/bg_expense_id/" +
                po_expense_id;
        Ext.Ajax.request({
            url: link,
            method: "GET", //POST
            disableCaching: false,
            success: function (result, request) {
                // let jsonData = Ext.util.JSON.decode(success.responseText);
                var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                // if (success) {
                Ext.getCmp(Ext.poFormID).getEl().unmask();
                // if (jsonData.totalCount > 0) {
                var f_amt = 0;
                var cheVal = v.replace(/,/g, "") / 1;
                if (i_pr_type == 1) {
                    f_amt = jsonData.data[0].f_total_plan;
                } else {
                    f_amt = jsonData.data[0].f_total_dtl;
                }
                let CheckMoney = {}; // ตัวแปร global เพื่อเก็บผลลัพธ์แต่ละรอบ
                let totalEnough = 0; // ตัวแปรสำหรับเก็บผลรวมของค่า enough

                let enough = 0; // เริ่มต้นค่า enough ที่ 0
                if (f_amt >= cheVal) {
                    enough = 1; // หากเข้าเงื่อนไข กำหนด enough เป็น 1
                    totalEnough++; // นับจำนวนเมื่อ enough เป็น 1
                }
                CheckMoney["Money"] = {
                    // ใช้ i เพื่อสร้าง key ที่ไม่ซ้ำกันในแต่ละรอบ
                    id: i,
                    Check: enough,
                    total: totalEnough,
                    debug: jsonData.debug,
                    f_amt: f_amt,
                    f_total: cheVal,
                };
                //  return enough; // ส่งค่า enough ของรอบนั้นกลับไป
                resolve(CheckMoney);
                /*
                 if (f_amt >= cheVal) {
                 } else {
                 // setDisabled_button(i, 1);
                 Ext.MessageBox.alert("Success", "เงินไม่พอที่จะจอง กรุณาติดต่อฝ่ายคลังงบประมาณ", function () {
                 Ext.getCmp(Ext.poFormID).getEl().unmask();
                 });
                 }*/
                // } else {
                //   Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                // }
                // },
            },
            failure: function (result, request) {
                Ext.MessageBox.alert("Failed", result.responseText); // connect error
            },
        });

        return link;
    });
}

winADD = function (butt) {
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
                    title: "รายละเอียดของที่จัดซื้อ",
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
                            id: "dc_expense_budget_type_idTxtID",
                            name: "dc_bg_budget_type_id",
                            hiddenName: "dc_expense_budget_type_id",
                            // hiddenName: "dc_bg_budget_type_id",
                            valueField: "id",
                            displayField: "c_name",
                            triggerAction: "all",
                            forceSelection: true,
                            selectOnFocus: true,
                            typeAhead: false,
                            emptyText: "กรุณาเลือกแหล่งเงิน...",
                            listeners: {
                                render: function (combo) {
                                    tooltip_ComboBox(combo, "c_name");
                                },
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
                        new Ext.form.ComboBox({
                            mode: "local",
                            store: Ext.po_expense,
                            valueField: "id",
                            displayField: "c_name",
                            anchor: "70%",
                            submitValue: true,
                            id: "po_expense_idID",
                            name: "po_expense_id",
                            hiddenName: "po_expense_id",
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
                            id: "i_hire_type2ID",
                            name: "i_hire_type",
                            items: [
                                {
                                    checked: true,
                                    inputValue: 1,
                                    name: "i_hire_type",
                                    boxLabel: "จ้างแบบได้ของ",
                                },
                                {
                                    inputValue: 0,
                                    name: "i_hire_type",
                                    boxLabel: "จ้างแบบไม่มีของ",
                                },
                            ], //radiogroup
                            listeners: {
                                change: function () {},
                            },
                        },
                        {
                            xtype: "radiogroup",
                            columns: [98, 98],
                            fieldLabel: "ของที่ได้มา",
                            id: "i_product_type2ID",
                            name: "i_product_type",
                            hidden: true,
                            items: [
                                {
                                    checked: true,
                                    name: "i_product_type",
                                    inputValue: 1,
                                    boxLabel: "วัสดุ",
                                },
                                {
                                    inputValue: 2,
                                    name: "i_product_type",
                                    boxLabel: "ครุภัณฑ์",
                                },
                            ], //radiogroup
                            listeners: {
                                change: function () {},
                                afterrender: function () {},
                            },
                        },
                        {
                            xtype: "checkboxgroup",
                            fieldLabel: "การจัดเก็บ",
                            name: "i_is_inv",
                            id: "i_is_invG2ID",
                            hidden: true,
                            items: [
                                {
                                    id: "i_is_invG2IDs1",
                                    boxLabel: "เข้าคลัง",
                                    hidden: true,
                                    name: "i_is_inv",
                                    // inputValue: 1,
                                    listeners: {
                                        afterrender: function () {
                                            if (Ext.selectRow.get("i_is_inv") == true) {
                                                Ext.getCmp("i_is_invG2IDs1").setValue(true);
                                            }
                                        },
                                    },
                                },
                            ],
                        },
                        {
                            fieldLabel: "ชื่อรายการ",
                            id: "c_nameID",
                            name: "c_name",
                            allowBlank: false,
                        },
                        {
                            fieldLabel: "จำนวน",
                            xtype: "numberfield",
                            id: "i_qtyID",
                            name: "i_qty",
                            readOnly: true,
                            value: 1,
                        },
                        {
                            fieldLabel: "ราคา/ต่อหน่วย",
                            id: "f_unit_costID",
                            name: "f_unit_price",
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
                        new Ext.form.ComboBox({
                            mode: "local",
                            fieldLabel: "หน่วยนับ 2",
                            submitValue: true,
                            hiddenName: "dc_unit_type_id",
                            id: "dc_unit_type_idID",
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
                iconCls: "icon-save-edit",
                handler: function () {
                    Ext.saveDTL(true);
                },
            },
            {
                text: "ยกเลิก",
                iconCls: "icon-cancel",
                handler: function () {
                    // Ext.saveDTL(false);
                    Ext.getCmp("win-frm-dtlID").destroy();
                },
            },
        ],
    });
};

Ext.AppUx = function (app, menu) {
    //    console.log(Ext.session)
    Ext.HDR_ID = null;
    Ext.selectRow = [];
    Ext.menuEditGrid = true;
    Ext.menuRightEditgrid = true;
    Ext.costID = 97; //หน่วยงานผู้รับผิดชอบ พัสดุ
    Ext.cost2ID = Ext.session.dc_cost_id; //หน่วยงานผู้รับผิดชอบ พัสดุ
    Ext.menuCode = "ST0001";
    Ext.dcCostFix = false; //38
    Ext.tor_type_id = 1; // default start เจาะจงน้อวกว่า 5 แสน
    Ext.i_is_more = 0;
    Ext.tor_type_idTxt = Ext.apply({
        tor_type_id1: {
            0: "แบบมี หัวงาน/ฝ่ายพิจารณาผล(ไม่เกิน 5 แสนบาท)",
            1: "แบบมีคณะกรรมการพิจารณาผล(เกิน 5 แสนแสนบาท)",
        },
    });

    //senMsg
    Ext.senMsgToProcure = (msgType, msg, cost_id) => {
        Ext.Ajax.request({
            url: "https://eis.nmu.ac.th/procure/websocket/event",
            params: {
                msgType: msgType, //msgType msg dc_cost_id
                msg: msg,
                dc_cost_id: cost_id,
            },
            method: "GET", //GET
            success: function (result, request) {},
            failure: function (result, request) {
                Ext.MessageBox.alert("Failed", result.responseText); // connect error
            },
        });
    };

    Ext.status = Ext.apply({
        name: menu,
        process: function (menuCode, record) {
            Ext.msgSentProcure = "มีรายการซื้อ/จ้างจากหน่วยงาน เลขหนังสืออ้างอิง " + record.get("d_doc_ref") + " เลขที่ PR  " + record.get("c_code");

            Ext.Ajax.request({
                url: "tor/api/mnTorCheckList.php",
                params: {
                    mode: "UPSTATUS",
                    menuCode: menuCode,
                    tor_status_id: record.get("tor_status_id"),
                    id: record.get("id"),
                },
                method: "POST", //GET
                success: function (result, request) {
                    var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                    if (jsonData.success) {
                        Ext.MessageBox.alert("Success", jsonData.msg, function () {
                            Ext.getCmp("tabpanel1").getStore().reload();
                            Ext.senMsgToProcure(2, Ext.msgSentProcure, Ext.session.dc_cost_id);
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

    function cellClick(grid, rowIndex, columnIndex, e) {
        var record = grid.getStore().getAt(rowIndex);
        Ext.selectRow = record;
        if (columnIndex === grid.getColumnModel().getIndexById("processDueID")) {
            if (Ext.selectRow.data.i_is_upload == 0) {
                Ext.MessageBox.alert("แจ้งเตือน", "กรุณาอัพโหลดเอกสารก่อนผ่านรายการ");
                return;
            } else {
                controller(Ext.selectRow, "processUpdate"); //on
            }
        }
        if (columnIndex === grid.getColumnModel().getIndexById("c_name_statusID")) {
//        console.log();
//        return false;
            if (Ext.selectRow.data.tor_status_id == 21) {
                Ext.sp_tor_id = Ext.selectRow.data.id;
                Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"));
                let PanelDtl = new formPanelDtl(0, Ext.selectRow.data);
                Ext.getCmp("contenterCenter").add(PanelDtl);
                Ext.getCmp("contenterCenter").add(PanelDtl);
                Ext.getCmp("contenterCenter").setActiveTab(PanelDtl);
                Ext.storePerDtl.load({
                    params: {id: Ext.selectRow.data.id, sp_tor_contract: Ext.selectRow.data.sp_contract_id},
                    callback: function () {
                        var num = Ext.getCmp("gridEditor").store.data.items.length - 1;
                        var row = 0;
                        while (num >= row) {
                            var record = Ext.storePerDtl.getAt(row);
                            record.set("i_checked_primary", 0);
                            record.set("i_checked", 0);
                            record.commit();
                            row++;
                        }
                        Ext.getCmp("gridEditor").getColumnModel().setHidden(1, true);
                        Ext.getCmp("gridEditor").getColumnModel().setHidden(2, true);
                    },
                });
            } else {
                // AlertGoogleChat(1,2)
//        if ([38, 3].includes(Ext.session.dc_cost_id)) {
//          navigateToPage(Ext.selectRow.data.c_code_status); // เปลี่ยนไปหน้าสถานะ ST0004
//        }
//         navigateToPage(Ext.selectRow.data); // เปลี่ยนไปหน้าสถานะ ST0004
            }
        }
        if (columnIndex === grid.getColumnModel().getIndexById("pr_check_pdfID")) {
            if (Ext.selectRow.data.i_is_upload == 1) {
                var linkDownload = window.location.protocol + "//" + window.location.hostname + "/sp_mn/api/upload/";
                if (Ext.isEmpty(Ext.selectRow))
                    Ext.MessageBox.alert("แจ้งเตือน", "กรุณากดเลือกข้อมูลที่จะแสดง/ออกเลข PR ก่อน");
                window.open(linkDownload + Ext.selectRow.get("c_code") + ".pdf?T=Tap_" + Math.floor(Math.random() * 100000), "_blank", 'fullscreen="yes"');
            } else {
                if (Ext.selectRow.data.c_code == null) {
                    Ext.MessageBox.alert("แจ้งเตือน", "กรุณาออกเลข PR ก่อนอัพโหลดเอกสาร");
                } else {
                    var ttb = tab2();
                    Ext.getCmp("contenterCenter").add(ttb);
                    Ext.getCmp("contenterCenter").setActiveTab(ttb);
                }
            }
        }
        if (columnIndex === grid.getColumnModel().getIndexById("edit")) {
            AddTor(record, "EDIT");
        }
        if (columnIndex === grid.getColumnModel().getIndexById("delete")) {
            DeleteTor_dtl(record);
        }
    }
    function controller(rec, status) {
        /*
         25	5	ST0001	ลงทะเบียนรับ
         26	5	ST0002	การมอบหมายผู้ปฏิบัติ
         24	5	ST0003	ตรวจสอบเอกสาร
         13	5	ST0004	รับเรื่องจากธุรการ
         14	5	ST0005	เสนอราคา
         1	5	ST0006	ผลพิจารณา
         11	5	ST0007	ประกาศผลผู้ชนะ
         20	5	ST0008	ลงนามในสัญญาหรือข้อตกลงเป็นหนังสือ
         21	5	ST0009	บันทึกใบ PO
         2	5	ST0010	ส่งมอบงาน
         3	5	ST0011	ตรวจรับพัสดุ
         4	5	ST0012	ตรวจการรับประกัน
         5	5	ST0013	รับพัสดุ
         6	5	ST0014	อนุมัติใบตรวจรับ
         27	5	ST0015	บันทีกค่าปรับ
         7	5	ST0016	บันทึกใบขอเบิก
         8	5	ST0017	แจ้งเตือนคืนเงินประกันสัญญา
         9	5	ST0018	ทำเอกสารแจ้งคืนหลักประกันสัญญา
         10	5	ST0019	ปิดสัญญา
         */

        if (status == "processUpdate") {
            Ext.Msg.minWidth = 200;
            Ext.Msg.buttonText = {
                ok: "ตกลง",
                cancel: "ยกเลิก",
                yes: "ผ่านรายการ",
                no: "ไม่",
            }; //Ext.Msg.prompt('Name', 'Please enter your name:', function(btn, text){
            if (rec.get("tor_status_id") != null) {
                Ext.Msg.alert(
                        "แจ้งเตือน",
                        "" +
                        (Ext.isEmpty(rec.get("c_code")) ? "รหัส PR ยังไม่ถูกสร้าง" : "") +
                        (rec.get("tor_status_id") > 0 ? "ผ่านรายการเรียบร้อยแล้ว สถานะเมนู <b>" + rec.get("c_name_status") + " - " + rec.get("c_code_status") + "</b>" : ""),
                        function (bu, action) {
                            return false;
                        },
                        );
            } else {
                if (rec.get("c_code") != null)
                    Ext.Msg.show({
                        title: "ประมวลผลรายการ",
                        msg: "คุณต้องการผ่านรายการ " + rec.get("c_code") + " สถานะเมนู " + Ext.menuCode + " ?",
                        width: 440,
                        icon: Ext.MessageBox.QUESTION,
                        buttons: Ext.MessageBox.YESNO,
                        fn: function (btn) {
                            if (btn === "yes")
                                Ext.status.process(Ext.menuCode, rec);
                            else
                                null;
                        },
                    });
            }
        }
    } // Controller

    Ext.keyData = 1; //type data key in
    Ext.title = "รายการ PR ";
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
    //    console.log(' >>> ' + Ext.getDate.getNowCarlen());
    //    console.log(' >>> ' + Ext.getDate.defaultDate());
    //interlizing
    Ext.loadStore = function (status, show) {
        var statusx = status;
        console.log(statusx);
        if (statusx == "add") {
            Ext.store_month = new Ext.data.JsonStore({
                fields: ["id", "c_name"],
                data: [
                    {id: "10", c_name: "ต.ค. " + (new Date().getFullYear() + 543 - 1)},
                    {id: "11", c_name: "พ.ย. " + (new Date().getFullYear() + 543 - 1)},
                    {id: "12", c_name: "ธ.ค. " + (new Date().getFullYear() + 543 - 1)},
                    {id: "01", c_name: "ม.ค. " + (new Date().getFullYear() + 543)},
                    {id: "02", c_name: "ก.พ. " + (new Date().getFullYear() + 543)},
                    {id: "03", c_name: "มี.ค. " + (new Date().getFullYear() + 543)},
                    {id: "04", c_name: "เม.ย. " + (new Date().getFullYear() + 543)},
                    {id: "05", c_name: "พ.ค. " + (new Date().getFullYear() + 543)},
                    {id: "06", c_name: "มิ.ย. " + (new Date().getFullYear() + 543)},
                    {id: "07", c_name: "ก.ค. " + (new Date().getFullYear() + 543)},
                    {id: "08", c_name: "ส.ค. " + (new Date().getFullYear() + 543)},
                    {id: "09", c_name: "ก.ย. " + (new Date().getFullYear() + 543)},
                ],
            });
        } else if (statusx == "edit") {
            Ext.store_month = new Ext.data.JsonStore({
                fields: ["id", "c_name"],
                data: [
                    // { id: "00", c_name: "- ทั้งหมด -" },
                    {id: "10", c_name: "ต.ค. " + (Ext.selectRow.get("i_yyyy") - 1 + 543)},
                    {id: "11", c_name: "พ.ย. " + (Ext.selectRow.get("i_yyyy") - 1 + 543)},
                    {id: "12", c_name: "ธ.ค. " + (Ext.selectRow.get("i_yyyy") - 1 + 543)},
                    {id: "01", c_name: "ม.ค. " + (Ext.selectRow.get("i_yyyy") - 0 + 543)},
                    {id: "02", c_name: "ก.พ. " + (Ext.selectRow.get("i_yyyy") - 0 + 543)},
                    {id: "03", c_name: "มี.ค. " + (Ext.selectRow.get("i_yyyy") - 0 + 543)},
                    {id: "04", c_name: "เม.ย. " + (Ext.selectRow.get("i_yyyy") - 0 + 543)},
                    {id: "05", c_name: "พ.ค. " + (Ext.selectRow.get("i_yyyy") - 0 + 543)},
                    {id: "06", c_name: "มิ.ย. " + (Ext.selectRow.get("i_yyyy") - 0 + 543)},
                    {id: "07", c_name: "ก.ค. " + (Ext.selectRow.get("i_yyyy") - 0 + 543)},
                    {id: "08", c_name: "ส.ค. " + (Ext.selectRow.get("i_yyyy") - 0 + 543)},
                    {id: "09", c_name: "ก.ย. " + (Ext.selectRow.get("i_yyyy") - 0 + 543)},
                ],
            });
            Ext.storeEven.setBaseParam("id", Ext.selectRow.data.id);
            Ext.storeEven.reload({
                callback: function (rec, operation, success) {
                    if (success) {
                        Ext.each(Ext.storeEven, function (value, item) {
                            // Uiedit_contract(Ext.selectRow);
                            // Ext.getCmp("winChequeEditID").items.items[0].getForm().loadRecord(Ext.selectRow);
                            // Ext.getCmp("winMain1").getEl().unmask();
                        });
                    }
                },
            });
        }

        var winx = show;
        if (statusx === "edit" && Ext.isEmpty(Ext.selectRow))
            Ext.Msg.alert("แจ้งเตือน", "กรุณา click เลือกข้อมูลที่จะแก้ไขใน data grid", function (form, action) {
                return false;
            });
        else if (statusx == "add") {
            Ext.HDR_ID = null;
            Ext.selectRow = null;
            Ext.i_is_more = 0;
            var winApp = AppPoStore(statusx);
            winApp.show();
            Ext.getCmp("winChequeID").hideTabStripItem(1);
        } else if (statusx === "edit") {
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
            if (!Ext.selectRow.get("dc_cost2_id"))
                Ext.selectRow.set("dc_cost2_id", null);
            if (!Ext.selectRow.get("tor_type_id"))
                Ext.selectRow.set("tor_type_id", null);
            if (!Ext.selectRow.get("c_comment"))
                Ext.selectRow.set("c_comment", null);

            var winApp = AppPoStore(statusx);
            Ext.ar_pr_about = [];
            Ext.i_pr_about = 1;
            //            alert(Ext.selectRow.get("dc_expense_budget_type_id0"));
            Ext.selectRow.set("dc_expense_budget_type_idTxt[0]", Ext.selectRow.get("dc_expense_budget_type_id0"));
            Ext.selectRow.set("dc_expense_budget_type_idTxt[1]", Ext.selectRow.get("dc_expense_budget_type_id1"));
            Ext.selectRow.set("dc_expense_budget_type_idTxt[2]", Ext.selectRow.get("dc_expense_budget_type_id2"));

            Ext.selectRow.set("i_pr_type[0]", Ext.selectRow.get("i_pr_type1"));
            Ext.selectRow.set("i_pr_type[1]", Ext.selectRow.get("i_pr_type2"));
            Ext.selectRow.set("i_pr_type[2]", Ext.selectRow.get("i_pr_type3"));

            Ext.selectRow.set("f_bg_amt[0]", Ext.selectRow.get("f_type_amt0"));
            Ext.selectRow.set("f_bg_amt[1]", Ext.selectRow.get("f_type_amt1"));
            Ext.selectRow.set("f_bg_amt[2]", Ext.selectRow.get("f_type_amt2"));

            Ext.getCmp("winChequeID").items.items[0].getForm().loadRecord(Ext.selectRow);
            winApp.show();

            // if (Ext.selectRow.get("i_edit") > 0) Ext.Msg.alert("รายการที่ส่งแก้ไข", Ext.selectRow.get("c_comment"), function (form, action) {});
            if (Ext.selectRow.get("i_edit") == 2) {
                Ext.getCmp("modeaftereditID").show();
                Ext.getCmp("reasonID").show();
                Ext.getCmp("reasonID").setValue(Ext.selectRow.get("c_comment"));
                Ext.getCmp("menuCodeID").setValue("ST0003");
                Ext.getCmp("i_backwordID").setValue(1);
                Ext.getCmp("menubackID").setValue(4);

                //                Ext.getCmp("tor_status_idID").setValue(0);
            }
            //
        }
    };

    var AppPoStore = function (statuss) {
        if (statuss == "edit") {
            // if (Ext.selectRow.json.dc_cost2_id != Ext.session.dc_cost_id && Ext.session.user_id != 1) {
            //   Ext.Msg.alert("แจ้งเตือน", "หน่วยงานเจ้าของเรื่องไม่ตรงกันไม่สามารถเปิดรายการเพื่อแก้ไขได้");
            //   return false;
            // }
        }
        var comboCost = new Ext.form.ComboBox({
            mode: "local",
            store: Ext.dc_cost,
            anchor: "50%",
            value: Ext.costID,
            hidden: true,
            fieldLabel: "หน่วยงานที่รับผิดชอบ",
            id: "dc_cost_idID",
            readOnly: true,
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
        var colPOPNew = [
            new Ext.grid.RowNumberer({width: 35, header: " No ", dataIndex: "no"}),
            {header: "ID System", hidden: true, dataIndex: "sp_tor_contract_editid"},
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
                header: "ครั้งที่บันทึก",
                align: "center",
                dataIndex: "no",
                width: 50,
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    if (record.get("no") === 9999)
                        return " ";
                    else if (record.get("no") === 9998)
                        return " ";
                    else if (record.get("no") === 9997)
                        return " ";
                    else
                        return value;
                },
            },
            {
                header: "วันที่บันทึกความก้าวหน้า",
                align: "center",
                dataIndex: "d_create",
                width: 150,
                renderer: function (val, metaData, record, rowIndex, colIndex, store) {
                    return val; //shortThaiDateWithTime(val);
                },
            },
            {
                header: "ประเภทความก้าวหน้า",
                align: "center",
                dataIndex: "event_type",
            },
            {
                header: "ความก้าวหน้า",
                align: "center",
                dataIndex: "event_detail",
            },
            {
                header: "เมนู",
                align: "center",
                dataIndex: "sp_status_hdr",
                width: 250,
            },
            {
                header: "ผู้บันทึกรายการ",
                align: "center",
                dataIndex: "dc_user_create_id",
                width: 350,
            },
            {
                header: "วันที่ความก้าวหน้า",
                align: "center",
                dataIndex: "event_date",
                width: 150,
                renderer: function (val, metaData, record, rowIndex, colIndex, store) {
                    return shortThaiDate(val);
                },
            },
            {
                header: "เวลาเริ่ม",
                align: "center",
                dataIndex: "event_time_start",
                width: 80,
            },
            {
                header: "เวลาสิ้นสุด",
                align: "center",
                dataIndex: "event_time_end",
                width: 80,
            },
            // {
            //   header: "จำนวนเงิน",
            //   sortable: false,
            //   align: "center",
            //   dataIndex: "f_total_amt",
            //   width: 150,
            //   renderer: function (value, metaData, record, rowIndex, colIndex, store) {
            //     metaData.attr = "style='color:blue;text-align: right;'";
            //     return floatRenderer(value);
            //   },
            // },
            {
                header: "แก้ไข",
                sortable: false,
                hideable: false,
                hidden: true,
                draggable: false,
                align: "center",
                id: "edit_bidder_hdr",
                width: 300,
                dataIndex: "id",
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    if (record.get("no") === 9999)
                        return "";
                    else if (record.get("no") === 9998)
                        return " ";
                    else if (record.get("no") === 9997)
                        return "";
                    else
                        return `<button style=" padding: 0px 5px; font-size: 10px; height: 18px; line-height: 14px; border-radius: 2px; cursor: pointer; display: inline-block;">
              แก้ไข</button>`;
                },
            },
            {
                id: "delete_event",
                header: "ลบ",
                sortable: false,
                align: "center",
                width: 300,
                dataIndex: "id",
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    if (record.get("no") === 9999)
                        return "";
                    else if (record.get("no") === 9998)
                        return " ";
                    else if (record.get("no") === 9997)
                        return "";
                    else
                        return `<button style=" padding: 0px 5px; font-size: 10px; height: 18px; line-height: 14px; border-radius: 2px; cursor: pointer; display: inline-block;">
              ลบ </button>`;
                },
            },
            {width: 30, dataIndex: ""},
        ];
        var comboUsedBgYear = new Ext.form.ComboBox({
            mode: "local",
            fieldLabel: " ปีงบประมาณ",
            submitValue: true,
            hiddenName: "i_yyyy",
            name: "i_year",
            id: "i_yearID",
            width: 120,
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
                select: function () {
                    var i_year = Ext.getCmp("i_yearID").getValue() + 543;
                    Ext.store_month = new Ext.data.JsonStore({
                        fields: ["id", "c_name"],
                        data: [
                            // { id: "00", c_name: "- ทั้งหมด -" },
                            {id: "10", c_name: "ต.ค. " + (i_year - 1)},
                            {id: "11", c_name: "พ.ย. " + (i_year - 1)},
                            {id: "12", c_name: "ธ.ค. " + (i_year - 1)},
                            {id: "01", c_name: "ม.ค. " + i_year},
                            {id: "02", c_name: "ก.พ. " + i_year},
                            {id: "03", c_name: "มี.ค. " + i_year},
                            {id: "04", c_name: "เม.ย. " + i_year},
                            {id: "05", c_name: "พ.ค. " + i_year},
                            {id: "06", c_name: "มิ.ย. " + i_year},
                            {id: "07", c_name: "ก.ค. " + i_year},
                            {id: "08", c_name: "ส.ค. " + i_year},
                            {id: "09", c_name: "ก.ย. " + i_year},
                        ],
                    });
                    Ext.getCmp("mm_startID").bindStore(Ext.store_month);
                    // Ext.getCmp("mm_end").bindStore(Ext.store_month);
                    Ext.getCmp("mm_startID").setValue(Ext.getCmp("mm_startID").getValue());
                    // Ext.getCmp("mm_end").setValue(Ext.getCmp("mm_end").getValue());
                },
            },
        });
        if (Ext.selectRow != null) {
            let po_expense_id = Ext.selectRow.data.po_expense_id;
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

        var comboExpense = new Ext.form.ComboBox({
            mode: "local",
            store: expense_expire,
            valueField: "id",
            displayField: "c_name",
            anchor: "50%",
            submitValue: true,
            name: "c_detail",
            id: "po_expense_id_ID",
            hiddenName: "po_expense_id",
            triggerAction: "all",
            allBlank: true,
            forceSelection: true,
            selectOnFocus: true,
            fieldLabel: "ค่าใช้จ่าย",
            width: 200,
            typeAhead: false,
            emptyText: "กรุณาเลือกค่าใช้จ่าย...",
            // validator: function (val) {
            //   if (!Ext.isEmpty(val)) {
            //     return true;
            //   } else {
            //     return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
            //   }
            // },
            listeners: {
                render: function (combo) {
                    tooltip_ComboBox(combo, "c_name");
                },
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

        Ext.store2 = new Ext.data.JsonStore({
            storeId: "myStore2",
            autoLoad: false,
            url: "tor/api/mnTorCheckList.php",
            root: "data",
            baseParams: {mode: "LISTDTL", i_read: user_right_read}, //Permission i_read
            idProperty: "id",
            totalProperty: "totalCount",
            fields: [
                {name: "no"},
                {name: "id"},
                {name: "c_code", type: "string"},
                {name: "c_name", type: "string"},
                {name: "dc_expense_budget_type_id"},
                {name: "po_expense_id"},
                {name: "i_hire_type"},
                {name: "i_is_inv"},
                {name: "i_product_type"},
                {name: "dc_unit_type_id"},
                {name: "dc_unit_name", type: "string"},
                {name: "i_qty"},
                {name: "f_unit_price"},
                {name: "f_net_total_price"},
                {name: "f_total_amt"}, //inv_mode_id am_mode_id sp_bg_mode_id  f_peroid_amt
                {name: "inv_mode_id"},
                {name: "am_mode_id"},
                {name: "sp_bg_mode_id"},
                {name: "f_peroid_amt"},
                {name: "c_comment_product", type: "string"},
                {name: "c_comment_asset", type: "string"},
                {name: "i_enable", type: "int"},
                {name: "dc_user_create_id"},
                {name: "dc_user_create_cost_id"},
                {name: "d_create"},
                {name: "dc_user_update_id"},
                {name: "dc_user_update_cost_id"},
                {name: "d_update"},
                {name: "index_receive"},
            ],
        });
        Ext.storePopMainPr = new Ext.data.JsonStore({
            autoLoad: true,
            storeId: "myStoreCost",
            url: "./api/All.php",
            baseParams: {type: "storeSpMainPR"},
            root: "data",
            idProperty: "id",
            totalProperty: "totalCount",
            fields: ["no", "id", "c_code", "c_name", "dc_expense_budget_type_id", "po_expense_id", "dc_cost_id", "dc_cost2_id", "i_purchase", "tor_type_id", "i_hire_type", "i_product_type", "d_doc_ref"],
        });
        Ext.ColumGridPop = [
            {header: "ID System", sortable: true, hidden: true, dataIndex: "id"},
            {header: "รหัส", sortable: true, dataIndex: "c_code"},
            {
                header: "ชื่อโครงการต่อเนื่อง",
                sortable: true,
                id: "c_name",
                dataIndex: "c_name",
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    metaData.attr = "style='cursor:pointer';";
                    return value;
                },
            },
        ];
        Ext.PopMainPr = new Ext.ux.Poplov({
            text: "PR โครงการต่อเนื่อง",
            id: "sp_tor_idID", //go to relation
            iconCls: "page_magnify",
            valueHidden: "sp_tor_id", //go to hidden
            store: Ext.storePopMainPr,
            headerGrid: Ext.ColumGridPop,
            widthText: 280,
            fieldLabel: "PR โครงการต่อเนื่อง",
            isCellClickGrid: true,
            cellClickGrid: function (grid, rowIndex, columnIndex, e) {
                var id = "sp_tor_idID";
                var nameID = id + "_Name";
                var record = grid.getStore().getAt(rowIndex);
                var TextShow = record.data.c_code + " " + record.data.c_name;

                Ext.getCmp(id).setValue(record.data.id);
                Ext.getCmp(nameID).setValue(TextShow);
                //  alert(TextShow);

                Ext.getCmp("c_nameMainID").setValue(record.data.c_name);
                // alert (record.data.dc_expense_budget_type_id) ;
                Ext.getCmp("dc_expense_budget_type_idID").setValue(record.data.dc_expense_budget_type_id);
                Ext.getCmp("po_expense_id_ID").setValue(record.data.po_expense_id);
                Ext.getCmp("dc_cost_idID").setValue(record.data.dc_cost_id);
                Ext.getCmp("dc_cost2_idID").setValue(record.data.dc_cost2_id);
                Ext.getCmp("i_purchaseID").setValue(record.data.i_purchase);
                Ext.getCmp("tor_type_idID").setValue(record.data.tor_type_id);
                Ext.getCmp("i_hire_typeID").setValue(record.data.i_hire_type);
                Ext.getCmp("i_product_typeID").setValue(record.data.i_product_type);
                //  Ext.getCmp('d_doc_refID').setValue(record.data.d_doc_ref);
                // Ext.getCmp('').setValue(record.data.c_name); // Ext.getCmp('').setValue(record.data.i_hire_type);
                // Ext.getCmp('').setValue(record.data.c_name);

                Ext.getCmp("win-pop-lov" + id).hide();
                Ext.getCmp("win-pop-lov" + id).destroy();
            },
            // listeners   : {'render' : function(p){ this.hide(); } }
        });

        var disp = false ? "displayfield" : "textfield";

        if (!Ext.isEmpty(Ext.getCmp("winChequeID"))) {
            Ext.getCmp("winChequeID").destroy();
        }

        return new Ext.Window({
            collapsible: true,
            maximizable: true,
            title: "บันทึก PR",
            // maximized: true,
            id: "winMain",
            width: Ext.getCmp("contenterCenter").getWidth() - 5,
            height: Ext.getCmp("contenterCenter").getHeight() - 5,
            minWidth: 900,
            minHeight: 564,
            layout: "fit",
            modal: true,
            plain: true,
            bodyStyle: "padding:1px;",
            buttonAlign: "center",
            listeners: {
                //WindowResize
                beforerender: function () {
                    this.onWindowResize = function () {
                        // console.log("ok");
                        // Ext.getCmp("tabpanelMain2ID").setHeight(Ext.getCmp("winMain").getSize().height - 105);
                    };
                },
                afterrender: function () {
                    if (statuss == "edit" && Ext.cost_main.baseParams.type == "dc_cost") {
                        Ext.cost_main = Ext.dc_cost;
                    }
                    // console.log(Ext.selectRow.data.c_code);
                    if (statusx == "edit") {
                        if (Ext.cost_main.baseParams.type == "dc_cost" && Ext.session.dc_center_user != 1 && Ext.selectRow.data.c_code != null) {
                            Ext.getCmp("dc_cost2_idID").setReadOnly(true);
                        }
                        if (Ext.selectRow.data.tor_status_id > 0 && Ext.session.dc_cost_id == 38) {
                            Ext.getCmp("buSaveSubID").show();
                        }
                    }
                    if (statusx == "add") {
                        // console.log(Ext.getCmp("dc_cost2_idID"));
                        if (Ext.cost_main.baseParams.type == "dc_cost" && Ext.session.dc_center_user != 1) {
                            Ext.getCmp("dc_cost2_idID").setReadOnly(true);
                        }
                        // Ext.getCmp("GENCODEPRID").hide();
                    }
                    // Ext.getCmp("tabpanelMain2ID").setHeight(Ext.getCmp("winMain").getSize().height - 105);
                    Ext.getCmp("winMain").on("resize", this.onWindowResize, this);
                },
            },
            items: [
                {
                    xtype: "tabpanel",
                    activeTab: 0,
                    id: "winChequeID",
                    // defaults: {autoHeight: true, bodyStyle: 'padding:10px'},
                    listeners: {
                        activate: function (obj) {
                            console.log(obj);
                        },
                        beforeshow: function (obj) {
                            console.log(obj);
                        },
                    },
                    items: [
                        new Ext.FormPanel({
                            id: Ext.poFormID,
                            columnWidth: 1,
                            title: "ข้อมูลรายละเอียด PR",
                            url: "tor/api/mnTorController.php",
                            frame: true,
                            autoScroll: true,
                            labelAlign: "left",
                            bodyStyle: "padding:1px",
                            labelWidth: 120,
                            width: 1000,
                            listeners: {
                                afterrender: function () {
                                    Ext.getCmp("buSaveSubID").hide();
                                },
                            },
                            items: [
                                {
                                    xtype: "fieldset",
                                    title: "ข้อมูลปัจจุบัน& 📄",
                                    collapsible: true,
                                    collapsed: false,
                                    labelWidth: 800,
                                    hidden: statusx == "add" ? true : false,
                                    checkboxToggle: true,
                                    animCollapse: true, // Enables collapse animation
                                    id: "groupProductTypeID",
                                    layout: "column",
                                    items: [
                                        {
                                            xtype: "panel",
                                            layout: "form",
                                            id: "formProductType",
                                            columnWidth: 0.5,
                                            labelWidth: 160,
                                            items: [
                                                {
                                                    xtype: "hidden",
                                                    name: "id",
                                                    id: "torHdrID",
                                                },
                                                {
                                                    xtype: "hidden",
                                                    name: "modesubID2",
                                                    id: "modesubID2",
                                                    value: "UPDATEFORMCheckList",
                                                },
                                                {
                                                    xtype: "hidden",
                                                    name: "dc_emp_id",
                                                },
                                                {
                                                    xtype: "hidden", //textfield
                                                    name: "sp_emp_id",
                                                },
                                                {
                                                    xtype: "hidden", //textfield
                                                    name: "tor_status_id",
                                                },
                                                {
                                                    xtype: "hidden", //hidden
                                                    name: "dc_department_id",
                                                },
                                                {
                                                    xtype: "hidden",
                                                    name: "i_dtl_add",
                                                    id: "i_dtl_addID",
                                                    value: 0,
                                                },
                                                {
                                                    xtype: "hidden",
                                                    name: "c_comment",
                                                    value: "รายละเอียดต่างๆ",
                                                },
                                                new Ext.form.ComboBox({
                                                    mode: "local",
                                                    store: Ext.i_type_bg,
                                                    anchor: "80%",
                                                    fieldLabel: "ประเภท PR",
                                                    submitValue: true,
                                                    readOnly: true,
                                                    hiddenName: "i_type_bg",
                                                    name: "i_type_c_name_bg",
                                                    id: "i_type_bgID",
                                                    valueField: "id",
                                                    displayField: "c_name",
                                                    triggerAction: "all",
                                                    forceSelection: true,
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
                                                                // if (this.getValue() == 1) {
                                                                //     //tor_type_id === 1 (เจาะจง)
                                                                //     Ext.getCmp("lableLessID").show();
                                                                // } else {
                                                                //     Ext.getCmp("lableLessID").hide();
                                                                // }
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
                                                    xtype: disp,
                                                    fieldLabel: "เลขที่ PR",
                                                    id: "codeHdrID",
                                                    style: "text-align: center;font-weight:bold;background:#eee;",
                                                    readOnly: true,
                                                    name: "c_code",
                                                },
                                                {
                                                    xtype: "buttongroup",
                                                    frame: false,
                                                    items: [
                                                        {xtype: "tbspacer", width: 3},
                                                        // { xtype: "label", text: "เลขที่สัญญา: " },
                                                        {xtype: "tbspacer", width: 160},
                                                        {
                                                            xtype: "textfield",
                                                            readOnly: true,
                                                            // fieldLabel: "เลขที่สัญญา",
                                                            id: "code_contactID",
                                                            style: "text-align: center;font-weight:bold;background:#eee;",
                                                            readOnly: true,
                                                            name: "i_purchase",
                                                            width: 80,
                                                            value: "ซื้อ",
                                                            style: {
                                                                "font-weight": "bold",
                                                                padding: "1px",
                                                                margin: "1px",
                                                                color: "#000",
                                                                "text-align": "center",
                                                                background: "#EEEEEE",
                                                                color: "#333",
                                                                border: "1px solid #ADADAD",
                                                            },
                                                            listeners: {
                                                                afterrender: function (f) {
                                                                    var val = parseInt(f.getValue());
                                                                    f.setValue(
                                                                            val == 1
                                                                            ? "ซื้อ"
                                                                            : val == 2
                                                                            ? "จ้าง"
                                                                            : val == 3
                                                                            ? "เช่า"
                                                                            : // val == 4 ? "งานเช่า" :
                                                                            "ไม่ได้ระบุ",
                                                                            );
                                                                },
                                                            },
                                                        },
                                                        {xtype: "tbspacer", width: 3},
                                                        {
                                                            xtype: "textfield",
                                                            readOnly: true,
                                                            width: 80,
                                                            // id: "i_type_contractID",
                                                            style: "text-align: center;font-weight:bold;background:#eee;",
                                                            readOnly: true,
                                                            value: "สัญญา",
                                                            name: "i_type_contract",
                                                            style: {
                                                                "font-weight": "bold",
                                                                padding: "1px",
                                                                margin: "1px",
                                                                color: "#000",
                                                                "padding-left": "14px", // ✅ เพิ่มระยะห่างจากขอบซ้าย
                                                                background: "#EEEEEE",
                                                                color: "#333",
                                                                border: "1px solid #ADADAD",
                                                            },
                                                            listeners: {
                                                                afterrender: function (f) {
                                                                    var val = parseInt(f.getValue());
                                                                    f.setValue(
                                                                            val == 1
                                                                            ? "สัญญา"
                                                                            : val == 2
                                                                            ? "ใบสั่ง"
                                                                            : val == 3
                                                                            ? "จะซื้อจะขาย"
                                                                            : // val == 4 ? "งานเช่า" :
                                                                            "ไม่ได้ระบุ",
                                                                            );
                                                                },
                                                            },
                                                        },
                                                        {
                                                            xtype: "textfield",
                                                            readOnly: true,
                                                            width: 80,
                                                            // fieldLabel: "เลขที่สัญญา",
                                                            // id: "dc_creditor_idTxtID",
                                                            style: "text-align: center;font-weight:bold;background:#eee;",
                                                            readOnly: true,
                                                            // value: "ครุภัณฑ์",
                                                            name: "i_product_type",
                                                            style: {
                                                                "font-weight": "bold",
                                                                padding: "1px",
                                                                margin: "1px",
                                                                color: "#000",
                                                                "padding-left": "12px", // ✅ เพิ่มระยะห่างจากขอบซ้าย
                                                                background: "#EEEEEE",
                                                                color: "#333",
                                                                border: "1px solid #ADADAD",
                                                            },
                                                            listeners: {
                                                                afterrender: function (f) {
                                                                    var val = parseInt(f.getValue());
                                                                    f.setValue(val == 1 ? "วัสดุ" : val == 2 ? "ครุภัณฑ์" : val == 3 ? "งานจ้าง" : val == 4 ? "งานเช่า" : "ไม่ได้ของ");
                                                                },
                                                            },
                                                        },
                                                    ],
                                                },
                                                {
                                                    xtype: "textarea",
                                                    fieldLabel: "เรื่อง/โครงการ",
                                                    width: 350,
                                                    id: "c_name_hdr_id",
                                                    name: "c_name",
                                                    listeners: {
                                                        afterrender: function () {
                                                            this.fn = function () {
                                                                Ext.getCmp("c_nameID").setValue(Ext.getCmp("c_name_hdr_id").getValue());
                                                            };
                                                        },
                                                    },
                                                },
                                                new Ext.form.ComboBox({
                                                    mode: "local",
                                                    store: Ext.dc_expense_budget_type,
                                                    fieldLabel: "แหล่งเงิน",
                                                    anchor: "80%",
                                                    submitValue: true,
                                                    name: "dc_expense_budget_type_idTxt",
                                                    hiddenName: "dc_expense_budget_type_id",
                                                    id: "dc_expense_budget_type_hdr_id1",
                                                    readOnly: true,
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
                                                }),
                                                new Ext.form.ComboBox({
                                                    mode: "local",
                                                    store: Ext.po_expense,
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
                                                    readOnly: true,
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
                                                }),
                                                new Ext.form.ComboBox({
                                                    mode: "local",
                                                    readOnly: true,
                                                    store: Ext.torType,
                                                    anchor: "60%",
                                                    fieldLabel: "วิธีดำเนินงาน",
                                                    submitValue: true,
                                                    hiddenName: "tor_type_id",
                                                    name: "c_type_id",
                                                    id: "tor_type_idID",
                                                    valueField: "id",
                                                    displayField: "c_name",
                                                    triggerAction: "all",
                                                    forceSelection: true,
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
                                                                    // Ext.getCmp("lableLessID").show();
                                                                } else {
                                                                    // Ext.getCmp("lableLessID").hide();
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
                                                    xtype: disp,
                                                    fieldLabel: "รหัสเอกสารอ้างอิง",
                                                    name: "d_doc_ref",
                                                    id: "i_type_fix_rateGb",
                                                    readOnly: true,
                                                    listeners: {
                                                        beforerender: function () {
                                                            this.fn = function () {};
                                                        },
                                                        afterrender: function () {
                                                            Ext.getCmp("i_type_fix_rateGb").fn();
                                                        },
                                                        change: function () {
                                                            Ext.getCmp("i_type_fix_rateGb").fn();
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
                                                            fieldLabel: "จำนวนเงิน",
                                                            readOnly: true,
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
                                                                        if (f_total > 500000) {
                                                                            Ext.i_is_more = 1;
                                                                        } else {
                                                                            Ext.i_is_more = 0;
                                                                        }

                                                                        Ext.getCmp("islessID").setValue(Ext.i_is_more);
                                                                        if (Ext.getCmp("tor_type_idID").getValue() == 1) {
                                                                            // Ext.getCmp("lableLessID").setValue(Ext.tor_type_idTxt.tor_type_id1[Ext.i_is_more]);
                                                                        }
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
                                                {
                                                    xtype: "datefield",
                                                    fieldLabel: "วันที่เอกสารอ้างอิง",
                                                    name: "d_doc_date",
                                                    readOnly: true,
                                                },
                                                {
                                                    xtype: "buttongroup",
                                                    fieldLabel: "วันที่ประกาศแผน",
                                                    frame: false,
                                                    border: false,
                                                    items: [
                                                        {
                                                            xtype: "datefield",
                                                            name: "d_egp_date",
                                                            id: "d_egp_dateID",
                                                            // readOnly:true,
                                                            // validator: function (val) {
                                                            //   if (!Ext.isEmpty(val)) {
                                                            //     return true;
                                                            //   } else {
                                                            //     return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                                            //   }
                                                            // },
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
                                                            text: "* วันที่จับ KPI",
                                                        },
                                                    ],
                                                },
                                                comboUsedBgYear,
                                                comboCost,
                                                new Ext.form.ComboBox({
                                                    mode: "local",
                                                    store: Ext.cost_main, //Ext.dc_cost_sys_main  dc_cost
                                                    anchor: "70%",
                                                    value: Ext.dc_cost_main_default,
                                                    readOnly: true,
                                                    fieldLabel: "หน่วยงานเจ้าของเรื่อง",
                                                    valueField: "id",
                                                    displayField: "c_name",
                                                    hiddenName: "dc_cost2_id",
                                                    id: "dc_cost2_idID",
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
                                                        render: function (combo) {
                                                            tooltip_ComboBox(combo, "c_name");
                                                        },
                                                        afterrender: function () {
                                                            // this.fn = function () {};
                                                            // this.fn = function () {
                                                            console.log(this.getValue());
                                                            if (this.getValue() > 0) {
                                                                Ext.dc_sub_cost.baseParams = {};
                                                                Ext.dc_sub_cost.load({
                                                                    params: {type: "dc_sub_cost", dc_cost_id: this.getValue()},
                                                                    callback: function (recordx, operation, success) {
                                                                        // if (Ext.dc_sub_cost.totalLength > 1  ) {
                                                                        //   Ext.getCmp("dc_sub_costidID").setValue(0);
                                                                        // } else
                                                                        if (Ext.selectRow.data.dc_sub_cost_id > 0) {
                                                                        } else {
                                                                            Ext.getCmp("dc_sub_costidID").setValue(0);
                                                                        }
                                                                    },
                                                                });
                                                            }
                                                            // };
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
                                                    store: Ext.dc_sub_cost, //Ext.dc_cost_sys_main  dc_cost
                                                    anchor: "70%",
                                                    // value: Ext.dc_cost_main_default,
                                                    // readOnly: true,
                                                    fieldLabel: "หน่วยงานย่อยเจ้าของเรื่อง",
                                                    valueField: "id",
                                                    displayField: "c_name",
                                                    hiddenName: "dc_sub_cost_id",
                                                    id: "dc_sub_costidID",
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
                                                        render: function (combo) {
                                                            tooltip_ComboBox(combo, "c_name");
                                                        },
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
                                                    fieldLabel: "หน่วยงานย่อย",
                                                    emptyText: "*ถ้ามี",
                                                    xtype: "textfield",
                                                    name: "txtsub_cost",
                                                    hidden: true,
                                                    id: "txtsub_costID",
                                                },
                                                {
                                                    fieldLabel: "tag search",
                                                    xtype: "textfield",
                                                    name: "tag",
                                                    hidden: true,
                                                    id: "txttagID",
                                                },

                                                {
                                                    xtype: "buttongroup",
                                                    fieldLabel: "วันที่",
                                                    frame: false,
                                                    border: false,
                                                    hidden: true,
                                                    items: [
                                                        {
                                                            xtype: "datefield",
                                                            name: "d_tor_date",
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                        {
                                            xtype: "panel",
                                            layout: "form",
                                            // id: "formProductType",
                                            columnWidth: 0.5,
                                            labelWidth: 160,
                                            items: [
                                                {
                                                    xtype: "hidden", //textfield hidden
                                                    name: "i_is_more",
                                                    id: "islessID", //i_is_more
                                                },
                                                {
                                                    xtype: "radiogroup",
                                                    columns: [98, 98, 98],
                                                    fieldLabel: "การดำเนินงาน",
                                                    id: "i_purchaseID",
                                                    hidden: true,
                                                    name: "i_purchase",
                                                    items: [
                                                        {
                                                            checked: true,
                                                            name: "i_purchase",
                                                            inputValue: 1,
                                                            boxLabel: "จัดซื้อ",
                                                        },
                                                        {
                                                            inputValue: 2,
                                                            name: "i_purchase",
                                                            boxLabel: "จัดจ้าง",
                                                        },
                                                        {
                                                            name: "i_purchase",
                                                            inputValue: 3,
                                                            boxLabel: "จัดเช่า",
                                                        },
                                                    ], //radiogroup
                                                    listeners: {
                                                        change: function () {
                                                            Ext.getCmp("i_type_fix_rateGb").fn();
                                                        },
                                                        afterrender: function () {
                                                            // console.log(this.getValue());
                                                        },
                                                    },
                                                }, ///i_purchase
                                                {
                                                    xtype: "button",
                                                    text: "จองเงินงบประมาณ จ้าง/เช่า",
                                                    name: "i_ren_bgType",
                                                    hidden: true,
                                                    id: "i_ren_bgTypeID",
                                                    fieldLabel: "บันทึกแหล่งเงิน",
                                                    listeners: {
                                                        beforerender: function () {
                                                            this.fn = function () {};
                                                        },
                                                        afterrender: function () {
                                                            // Ext.getCmp("i_ren_bgTypeID").fn();
                                                        },
                                                    },
                                                    handler: function () {
                                                        if (Ext.selectRow.get("i_yyyy") != Ext.getCmp("i_yyyyID").getValue()) {
                                                            Ext.Msg.alert("แจ้งเตือน", "กรุณาบันทึกหลังแก้ไขปีงบประมาณแล้ว");
                                                            return false;
                                                        } // '2022'
                                                        else {
                                                            var win = bgBagedType();
                                                            win.items.items[0].getForm().loadRecord(Ext.selectRow);
                                                            win.show();
                                                            Ext.fnDisBook();
                                                        }
                                                    },
                                                },
                                                {
                                                    xtype: "hidden",
                                                    name: "c_menu",
                                                    value: "st0004",
                                                },
                                                {
                                                    xtype: "radiogroup",
                                                    columns: [98, 98, 98],
                                                    hidden: true,
                                                    fieldLabel: "ประเภทสัญญา",
                                                    id: "i_type_contractID",
                                                    name: "i_type_contract",
                                                    items: [
                                                        {
                                                            checked: true,
                                                            name: "i_type_contract",
                                                            id: "i_type_contract1",
                                                            inputValue: 1,
                                                            boxLabel: "สัญญา",
                                                        },
                                                        {
                                                            inputValue: 2,
                                                            name: "i_type_contract",
                                                            id: "i_type_contract2",
                                                            hidden: true,
                                                            boxLabel: "ใบสั่ง",
                                                        },
                                                        {
                                                            name: "i_type_contract",
                                                            id: "i_type_contract3",
                                                            inputValue: 3,
                                                            hidden: true,
                                                            boxLabel: "จะซื้อจะขาย",
                                                        },
                                                    ], //radiogroup
                                                },
                                                {
                                                    xtype: "radiogroup",
                                                    columns: [98, 98, 98, 98],
                                                    fieldLabel: "ของที่ได้มา",
                                                    id: "i_product_typeID",
                                                    name: "i_product_type",
                                                    hidden: true,
                                                    items: [
                                                        {
                                                            checked: true,
                                                            hidden: true,
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
                                                        {
                                                            checked: true,
                                                            name: "i_product_type",
                                                            inputValue: 1,
                                                            boxLabel: "วัสดุทั่วไป",
                                                            id: "i_product_type1",
                                                        },
                                                                // {
                                                                //   inputValue: 3,
                                                                //   name: "i_product_type",
                                                                //   id: "i_product_type3",
                                                                //   boxLabel: "วัสดุการแพทย์",
                                                                // },
                                                    ], //radiogroup
                                                    listeners: {
                                                        change: function () {
                                                            //  Ext.getCmp('i_is_invGID').fn(this.getValue().inputValue);
                                                        },
                                                        afterrender: function () {
                                                            this.fn = function (i) {
                                                                // if (i == 3) this.hide();
                                                                // else this.show();
                                                            };
                                                            this.fn(Ext.getCmp("i_purchaseID").getValue().inputValue);
                                                        },
                                                    },
                                                },

                                                {
                                                    fieldLabel: "ราคากลาง",
                                                    xtype: "textfield",
                                                    id: "f_total_averageID",
                                                    width: 150,
                                                    name: "f_total_average",
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
                                                    xtype: "textfield",
                                                    // readOnly: true,
                                                    fieldLabel: "เลขที่ egp",
                                                    id: "c_name_egpID",
                                                    name: "c_name_egp",
                                                    width: 250,
                                                    // height: 35,
                                                },
                                                {
                                                    xtype: "buttongroup",
                                                    fieldLabel: "วันที่ความก้าวหน้า",
                                                    frame: false,
                                                    border: false,
                                                    items: [
                                                        {
                                                            xtype: "datefield",
                                                            name: "d_event_date",
                                                            id: "d_event_dateID",
                                                            value: new Date(),
                                                            maxValue: new Date(),
                                                            minValue: new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000),
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
                                                            xtype: "tbspacer",
                                                            width: 5,
                                                        },
                                                        {
                                                            xtype: "timefield",
                                                            width: 80,
                                                            name: "event_time_start",
                                                            id: "event_time_startID",
                                                            value: new Date(),
                                                            format: "H:i",
                                                            minValue: "06:00",
                                                            maxValue: "22:00",
                                                            emptyText: "เวลาเริ่ม",
                                                        },
                                                        {
                                                            xtype: "tbspacer",
                                                            width: 5,
                                                        },
                                                        {
                                                            xtype: "timefield",
                                                            width: 80,
                                                            minValue: "06:00",
                                                            maxValue: "22:00",
                                                            value: new Date(new Date().getTime() + 4 * 60 * 60 * 1000),
                                                            name: "event_time_end",
                                                            id: "event_time_endID",
                                                            format: "H:i",
                                                            emptyText: "เวลาสิ้นสุด",
                                                        },
                                                                // {
                                                                //   xtype: "label",
                                                                //   style: {
                                                                //     color: "red",
                                                                //     width: "100px",
                                                                //   },
                                                                //   text: "* วันที่จับ KPI",
                                                                // },
                                                    ],
                                                },
                                                new Ext.form.ComboBox({
                                                    mode: "local",
                                                    fieldLabel: " ประเภทความก้าวหน้า",
                                                    submitValue: true,
                                                    hiddenName: "event_type_id",
                                                    name: "event_type_idID",
                                                    id: "event_typeID",
                                                    width: 120,
                                                    store: Ext.sp_event_type,
                                                    valueField: "id",
                                                    displayField: "c_name",
                                                    // value: 1,
                                                    triggerAction: "all",
                                                    forceSelection: true,
                                                    selectOnFocus: true,
                                                    typeAhead: false,
                                                    emptyText: "กรุณาเลือกความก้าวหน้า...",
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
                                                        select: function () {},
                                                    },
                                                }),
                                                {
                                                    fieldLabel: "ความก้าวหน้า",
                                                    xtype: "textarea",
                                                    name: "c_comment_event",
                                                    id: "c_comment_eventID",
                                                    width: 250,
                                                },
                                                {
                                                    xtype: "box",
                                                    hidden: true,
                                                    autoEl: {tag: "hr"},
                                                },
                                                {
                                                    xtype: "buttongroup",
                                                    fieldLabel: "วันที่บันทีกแจ้งเตือน",
                                                    frame: false,
                                                    border: false,
                                                    hidden: true,
                                                    items: [
                                                        {
                                                            xtype: "datefield",
                                                            name: "DateAdd1",
                                                            // validator: function (val) {
                                                            //     if (!Ext.isEmpty(val)) {
                                                            //         return true;
                                                            //     } else {
                                                            //         return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                                            //     }
                                                            // },
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
                                                            text: "* แจ้งเตือน จากวันถัดไป " + Ext.menu_i_alarm + " วัน",
                                                        },
                                                    ],
                                                },
                                                {
                                                    xtype: "buttongroup",
                                                    fieldLabel: "วันที่บันทีก PA",
                                                    frame: false,
                                                    hidden: true,
                                                    border: false,
                                                    items: [
                                                        {
                                                            xtype: "datefield",
                                                            name: "DateAdd2",
                                                            // validator: function (val) {
                                                            //     if (!Ext.isEmpty(val)) {
                                                            //         return true;
                                                            //     } else {
                                                            //         return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                                            //     }
                                                            // },
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
                                            ],
                                        },
                                    ],
                                },
                                {
                                    xtype: "fieldset",
                                    title: "ข้อมูล PR  &#x2708; ", // &#x2714; &#x274C;
                                    collapsible: true,
                                    labelWidth: 300,
                                    collapsed: false,
                                    autoScroll: true,
                                    hidden: statusx == "add" ? false : true,
                                    checkboxToggle: true,
                                    animCollapse: true, // Enables collapse animation
                                    height: 450,
                                    layout: "fit",
                                    // tbar: []
                                    items: [
                                        {
                                            xtype: "panel",
                                            layout: "form",
                                            id: "formPRTypeAdd",
                                            columnWidth: 0.5,
                                            labelWidth: 160,
                                            items: [
                                                {
                                                    xtype: disp,
                                                    fieldLabel: "เลขที่ PR",
                                                    id: "c_codeID",
                                                    style: "text-align: center;font-weight:bold;background:#eee;",
                                                    readOnly: true,
                                                    name: "c_code",
                                                },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    xtype: "fieldset",
                                    title: "ข้อมูลความก้าวหน้า &#x2708; ", // &#x2714; &#x274C;
                                    collapsible: true,
                                    labelWidth: 300,
                                    collapsed: false,
                                    autoScroll: true,
                                    hidden: statusx == "add" ? true : false,
                                    checkboxToggle: true,
                                    animCollapse: true, // Enables collapse animation
                                    height: 450,
                                    layout: "fit",
                                    tbar: [
                                        {
                                            text: "เพิ่มข้อมูลรายการ",
                                            id: "button_add_per",
                                            iconCls: "icon-add",
                                            hidden: true,
                                            handler: function () {
                                                Ext.storeSUMcontract.setBaseParam("sp_tor_contract_id", rec.data.sp_tor_contract_id);
                                                Ext.storeSUMcontract.load({
                                                    callback: function (record, operation, success) {
                                                        if (success) {
                                                            msg = "";
                                                            const store = Ext.storeNew3;
                                                            const summaryRecord = store.getAt(store.find("no", 9997));
                                                            const f_total_amt = summaryRecord.get("f_total_amt").replace(/<[^>]+>/g, ""); // remove span ถ้ามี HTML
                                                            const totalAmt = parseFloat(f_total_amt.replace(/,/g, "")) || 0;
                                                            console.log("ยอดรวมจาก no: 9997 =", totalAmt);

                                                            // var rec = record[0];
                                                            var f_total = Ext.getCmp("f_total_amtPerID").getValue().replace(/,/g, "") / 1; // จำนวนเงินงวด
                                                            // var f_period = Ext.getCmp("f_total_amtPerID").getValue().replace(/,/g, "") / 1; // จำนวนเงินงวด
                                                            var f_unit_costID = Ext.getCmp("f_totalID").getValue().replace(/,/g, "") / 1; // จำนวนเงินสัญญา
                                                            // var f_total_amt = rec.get("f_total_amt"); //.replace(/,/g, "") / 1; // จำนวนเงินของทุกงวดรวมกัน
                                                            // var f_total_sum = f_total + f_total_amt; // จำนวนเงินของทุกงวดที่บันทึกข้อมูลไปแล้ว + จำนวนเงินที่คีย์อยู่
                                                            // var f = f_total - f_period + f_total;
                                                            if (f_total > totalAmt && Ext.getCmp("i_type_editID").getValue().inputValue == 1) {
                                                                msg += " - ยอดเงินเกินวงเงินในสัญญา" + "\n";
                                                            }
                                                            // return;
                                                            // if (f > f_unit_costID) {
                                                            //   msg += "ยอดรวมของทุกงวดเกินวงเงินในสัญญาสัญญา";
                                                            // }
                                                            console.log(Ext.getCmp("sp_check_period").getValue());
                                                            if (![null, "", undefined].includes(Ext.getCmp("sp_check_period").getValue()) && Ext.getCmp("i_type_editID").getValue().inputValue == 2) {
                                                                msg += "- ตรวจรับแล้ว ไม่สามารถแก้ไขข้อมูลได้ " + "\n";
                                                            }

                                                            var formSubmit = function () {
                                                                form.submit({
                                                                    waitMsg: "Saving Data...",
                                                                    success: function (form, action) {
                                                                        Ext.storeDtl.reload();
                                                                        Ext.storeedit.reload();
                                                                        let itemStore = Ext.getCmp("gridSub1ID").getStore();
                                                                        itemStore.reload();
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
                                                            };

                                                            var form = Ext.getCmp("form_New_contract").getForm();
                                                            if (msg != "") {
                                                                Ext.example.msg("แจ้งเตือน", msg, 1);
                                                                $(this).next("text copied");
                                                                setTimeout(function () {
                                                                    $(this).next().remove();
                                                                }, 6000);
                                                                return;
                                                            } else if (form.isValid()) {
                                                                Ext.getCmp("mode_id").setValue("UP_SP_TOR_HDR_DTL_PERIOD");
                                                                formSubmit(form);
                                                            } else {
                                                                Ext.Msg.alert("แจ้งเตือน", "กรุณากรอกข้อมูลให้ครบถ้วน");
                                                            }
                                                            // }
                                                        }
                                                    },
                                                });
                                            },
                                        },
                                    ],
                                    items: [
                                        {
                                            xtype: "grid",
                                            id: "gridSub1ID",
                                            border: true,
                                            stripeRows: true,
                                            loadMask: true,
                                            height: 200,
                                            store: Ext.storeEven,
                                            style: {
                                                overflowX: "auto",
                                            },
                                            listeners: {
                                                // contextmenu: function (e) {
                                                //   e.stopEvent();
                                                //   var id = Ext.selectRow.json.imp_assetall_supplies_hdr_id;
                                                //   var mymenu = new Ext.menu.Menu({
                                                //     items: [],
                                                //   });
                                                // },
                                                beforerender: function () {
                                                    this.thisCick = function (grid, rowIndex, columnIndex, e) {
                                                        var record = grid.getStore().getAt(rowIndex);
                                                        Ext.SelectStore = Ext.storeEven.getAt(rowIndex);

                                                        if ([9999, 9998, 9997].includes(Ext.SelectStore.data.no)) {
                                                            Ext.getCmp("i_type_editID").setValue(1);
                                                            Ext.getCmp("i_type_edit2ID").hide();
                                                        } else {
                                                            if (columnIndex === grid.getColumnModel().getIndexById("delete_event")) {
                                                                // Ext.SelectStore.data.sp_tor_contract_editid;
                                                                console.log(123);
                                                                if (record.data.sp_check_period != null) {
                                                                    Ext.MessageBox.alert("แจ้งเตือน", "คุณตรวจรับไปแล้วไม่สามารถลบรายไขได้");
                                                                } else {
                                                                    delete_event(Ext.SelectStore);
                                                                }
                                                            } else {
                                                                RecSet = record.data;
                                                                // console.log(RecSet);
                                                                // Ext.getCmp("sp_tor_hdr_period_idID").setValue(RecSet.id);
                                                                // Ext.getCmp("dc_expense_budget_type_idPerTxtID").setValue(RecSet.dc_expense_budget_type_id);
                                                                // Ext.getCmp("period_po_expense_id").setValue(RecSet.po_expense_per_dtl_id);
                                                                // Ext.getCmp("dc_cost2_idID").setValue(RecSet.dc_cost2_id);
                                                                // Ext.getCmp("f_total_amtPerID").setValue(RecSet.f_total_amt);
                                                                // Ext.getCmp("i_period_contractID").setValue(RecSet.i_period);
                                                            }
                                                        }
                                                    };
                                                    // this.
                                                },
                                                rowcontextmenu: function (grid, rowIndex, e) {
                                                    e.stopEvent(); // ❗ หยุด default context menu
                                                    const record = grid.getStore().getAt(rowIndex); // ✅ ดึงข้อมูลแถว
                                                    Ext.selectRow5 = record; // ✅ สำคัญ เพื่อใช้ใน handler ภายหลัง
                                                    var mymenu = new Ext.menu.Menu({
                                                        items: [
                                                            {
                                                                text: "ลบรายการ",
                                                                // hidden: Ext.selectRow.data.c_code_po == null ? true : false,
                                                                icon: "../images/icons/application_view_detail.png",
                                                                scope: this,
                                                                handler: function (e) {
                                                                    delete_event(Ext.selectRow5);
                                                                },
                                                            },
                                                            {
                                                                text: "ขอแก้ไข",
                                                                hidden: Ext.session.dc_center_user != 1 ? true : false,
                                                                icon: "../images/icons/application_view_detail.png",
                                                                scope: this,
                                                                handler: function (e) {
                                                                    console.log(Ext.SelectStore);
                                                                    // delete_event(Ext.SelectStore);
                                                                },
                                                            },
                                                        ],
                                                        listeners: {
                                                            beforerender: function () {},
                                                            hide: function () {
                                                                setTimeout(function () {
                                                                    mymenu.destroy();
                                                                }, 0);
                                                            },
                                                        },
                                                    });
                                                    console.log(mymenu);
                                                    mymenu.showAt(e.getXY());
                                                },
                                                cellDblClick: function (grid, rowIndex, columnIndex, e) {
                                                    console.log(123);
                                                    const columnModel = grid.getColumnModel();
                                                    const column = columnModel.getColumnAt(columnIndex);
                                                    const columnId = column.id;
                                                    const dataIndex = column.dataIndex;
                                                },
                                                afterRender: function (grid) {
                                                    var element = Ext.get(grid.getView().mainHd.id);
                                                    element.on("contextmenu", function (e, t) {
                                                        e.stopEvent();
                                                        var menu = new Ext.menu.Menu();
                                                        menu.add({
                                                            text: "Refresh",
                                                            icon: "../images/icons/arrow_refresh_small.png",
                                                            scope: this,
                                                            handler: function (e) {
                                                                grid.store.load({params: {sp_tor_contract_id: rec.data.sp_tor_contract_id}});
                                                            },
                                                        });
                                                        if (Ext.session.user_id == 1) {
                                                            menu.addSeparator();
                                                            menu.add(
                                                                    new Ext.menu.Item({
                                                                        text: "show only admin",
                                                                        disabled: true,
                                                                        cls: "menu-separator-text",
                                                                    }),
                                                                    );
                                                            menu.add({
                                                                text: "Inspect SQL",
                                                                icon: "../images/icons/script_lightning.png",
                                                                scope: this,
                                                                handler: function (e) {
                                                                    // console.log(grid)
                                                                    // console.log(e)
                                                                    // console.log(rec.data.sp_tor_contract_id)
                                                                    grid.store.load({params: {show_sql: 1, sp_tor_contract_id: rec.data.sp_tor_contract_id}});
                                                                },
                                                            });
                                                        }
                                                        menu.showAt(e.getXY());
                                                    });
                                                    Ext.getCmp("gridSub1ID").on("cellclick", this.thisCick, this);
                                                },
                                            },
                                            columns: colPOPNew,
                                            viewConfig: {
                                                forceFit: false,
                                                scrollOffset: 20, // เพิ่มความกว้าง scrollbar
                                                emptyText: "ไม่มีข้อมูล..",
                                                deferEmptyText: false,
                                                getRowClass: function (record, rowIndex, rowParams, store) {
                                                    // if (rowIndex === store.getCount() - 1) {
                                                    if (rowIndex === 0) {
                                                        // if ([9999, 9998, 9997].includes(record.data.no)) {
                                                        return "color-green";
                                                    } else {
                                                        return "color-yellow";
                                                    }
                                                },
                                            },
                                            // tbar: [

                                            // ]
                                        },
                                    ],
                                },
                            ],
                            buttonAlign: "left",
                            buttons: [
                                {
                                    text: "บันทึกรายการ PR",
                                    // hidden :   Ext.session.dc_cost_id == 38 ? false :  true ,
                                    // hidden :   Ext.session.dc_cost_id == 38 ?    true : false ,
                                    id: "buSaveSubID",
                                    iconCls: "icon-save",
                                    listeners: {
                                        afterrender: function () {},
                                    },
                                    handler: function () {
                                        var msg = "";
                                        if (statusx != "add") {
                                            // if ([null, ""].includes(Ext.getCmp("c_name_egpID").getValue())) {
                                            //   msg += "- กรุณาระบุเลขที่ egp" + "\n";
                                            // }
                                            if ([null, "", 0, 0.0, "0.00"].includes(Ext.getCmp("f_total_averageID").getValue())) {
                                                msg += "- กรุณาระบุราคากลาง" + "\n";
                                            }
                                            // if ([null, , ""].includes(Ext.getCmp("d_egp_dateID").getValue())) {
                                            //   msg += "- กรุณาระบุวันที่ประกาศแผน" + "\n";
                                            // }
                                            if ([null, , ""].includes(Ext.getCmp("event_typeID").getValue())) {
                                                msg += "- กรุณาเลือกประเภทความก้าวหน้า " + "\n";
                                            }
                                            if ([null, , ""].includes(Ext.getCmp("d_event_dateID").getValue())) {
                                                msg += "- กรุณาระบุวันที่ความก้าวหน้า " + "\n";
                                            }
                                            if ([null, , ""].includes(Ext.getCmp("d_event_dateID").getValue())) {
                                                msg += "- กรุณาระบุหน่วยงานย่อยเจ้าของเรื่อง " + "\n";
                                            }
                                        }

                                        if (msg != "") {
                                            Ext.example.msg("แจ้งเตือน", msg, 1);
                                            $(this).next("text copied");
                                            setTimeout(function () {
                                                $(this).next().remove();
                                            }, 6000);
                                            return;
                                        }
                                        // }
                                        if (msg == "") {
                                            // console.log(form);
                                            var formSubmit = function (form) {
                                                form.submit({
                                                    waitMsg: "Saving Data...",
                                                    params: {mode: "UPDATEFORMCheckList"},
                                                    success: function (form, action) {
                                                        Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                                            Ext.storeDtl.reload({
                                                                callback: function (record, operation, success) {
                                                                    if (success) {
                                                                        Ext.storeEven.reload();
                                                                        let itemStore = Ext.getCmp("tabpanel1").getStore();
                                                                        itemStore.reload();
                                                                        // Ext.each(record, function (value) {
                                                                        // if (Ext.selectRow.id === value.get('id')) {
                                                                        //     Ext.selectRow = value;
                                                                        //     Ext.getCmp("winMain").destroy();
                                                                        //     Ext.buAct = "update";
                                                                        //     Ext.loadStore("edit", true);
                                                                        // } else if (Ext.selectRow.get("id") === value.get('id')) {
                                                                        // Ext.getCmp("tabpanel1").getStore().reload();
                                                                        // Ext.getCmp("winMain").destroy();
                                                                        // }
                                                                        // });
                                                                        // Ext.getCmp("winMain").destroy();
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
                                                                Ext.Msg.alert("Failure", "พบข้อผิดพลาดในการเชื่อต่อเครือข่าย");
                                                                break;
                                                            case Ext.form.Action.SERVER_INVALID:
                                                                Ext.Msg.alert("Failure", action.result.msg);
                                                        }
                                                    },
                                                });
                                            }; //END
                                            var form = Ext.getCmp(Ext.poFormID).getForm();
                                            if (form.isValid()) {
                                                if (Ext.getCmp("modesubID2").getValue() === "VIEW") {
                                                } else if (Ext.getCmp("modesubID2").getValue() === "DELETE") {
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
                                            Ext.Msg.alert("แจ้งเตือน", msg);
                                        }
                                    },
                                }, //haddler
                                {
                                    text: Ext.GLOBAL_BU_BACK_TH,
                                    handler: function () {
                                        Ext.getCmp("winMain").hide();
                                        Ext.getCmp("winMain").destroy();
                                    },
                                },
                            ],
                        }),
                    ],
                },
            ],
        });
    };

    var tab2 = function () {
        function getPDF(a) {
            if (a)
                return "เอกสาร PDF";
            else
                return "ยังไม่อัพโหลดเอกสาร";
        }
        var urlUpload = window.location.protocol + "//" + window.location.hostname + "/sp_mn/eis/mnUploadDoc_EIS_PR.php";
        var linkDownload = window.location.protocol + "//" + window.location.hostname + "/sp_mn/eis/mnUploadDoc_EIS_PR.php";

        return new Ext.Panel({
            labelAlign: "top",
            title: "เอกสารเพิ่มเติมของการทำ PR",
            bodyStyle: "padding:5px",
            id: "frmSubID",
            layout: "fit",
            items: [
                new Ext.FormPanel({
                    height: 180,
                    layout: "form",
                    id: "frmSubItemID",
                    url: urlUpload,
                    fileUpload: true,
                    border: false,
                    listeners: {
                        beforerender: function () {
                            console.log(Ext.selectRow);
                        },
                    },
                    items: [
                        {
                            xtype: "hidden",
                            name: "id",
                            value: Ext.selectRow.get("id"),
                        },
                        {
                            xtype: "hidden",
                            name: "i_is_upload",
                            value: Ext.selectRow.get("i_is_upload"),
                        },
                        {
                            fieldLabel: "hostname",
                            xtype: "textfield",
                            width: 400,
                            readonly: true,
                            name: "hostname",
                            value: urlUpload,
                        },
                        {
                            fieldLabel: "ชื่อเอกสาร",
                            xtype: "textfield",
                            width: 400,
                            name: "c_code",
                            value: Ext.selectRow.get("c_code"),
                        },
                        {
                            xtype: "fileuploadfield",
                            id: "upload_pdf1",
                            allowBlank: false,
                            width: 300,
                            emptyText: "เลือกไฟล์ (.pdf)",
                            fieldLabel: "เอกสารประกอบ (PDF)",
                            name: "upload_pdf1",
                            buttonText: "",
                            buttonCfg: {
                                iconCls: "icon-pdf",
                            },
                            validator: function (val) {
                                if (Ext.isEmpty(val)) {
                                    return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                } else {
                                    return true;
                                }
                            },
                        },
                        {
                            xtype: "panel",
                            border: false,
                            html:
                                    '<p>Download :: <a type="button" href="' +
                                    linkDownload +
                                    "/" +
                                    Ext.selectRow.get("c_code") +
                                    ".pdf?T=Tap_" +
                                    Math.floor(Math.random() * 100000) +
                                    '" value="facebook" target="_blank" class="buttonx">' +
                                    getPDF(Ext.selectRow.get("i_is_upload")) +
                                    "</a></p>",
                            //                            html: '<p>Download :: <button onclick="funPDF();">' + Ext.selectRow.get('i_is_upload') + '.pdf</button></p>'
                            //                                    + '<p>Download :: ' + linkDownload + '/' + Ext.selectRow.get('c_code') + '.pdf</p>',
                        },
                    ],
                    buttonAlign: "left",
                    buttons: [
                        {
                            text: "บันทึกเอกสาร",
                            handler: function () {
                                var form = Ext.getCmp("frmSubItemID").getForm();
                                form.submit({
                                    waitMsg: "Saving Data...",
                                    success: function (form, action) {
                                        console.log(action.options.params);
                                        console.log(action.response.responseText);
                                        // Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                        //   return ;
                                        // });
                                        Ext.Msg.alert("Success", "เรียบร้อย", function (form, action) {
                                            Ext.getCmp("tabpanel1").getStore().reload();
                                            Ext.selectRow = null;
                                            Ext.getCmp("frmSubID").destroy();
                                        });
                                    },
                                    failure: function (form, action) {
                                        switch (action.failureType) {
                                            case Ext.form.Action.CLIENT_INVALID:
                                                Ext.Msg.alert("Failure", "Form fields may not be submitted with invalid values");
                                                break;
                                            case Ext.form.Action.CONNECT_FAILURE:
                                                Ext.Msg.alert("Failure", "พบข้อผิดพลาดในการเชื่อต่อเครือข่าย");
                                                break;
                                            case Ext.form.Action.SERVER_INVALID:
                                                Ext.Msg.alert("Failure", action.result.msg);
                                        }
                                    },
                                });
                            },
                        },
                        {
                            text: Ext.GLOBAL_BU_BACK_TH,
                            handler: function () {
                                Ext.getCmp("frmSubID").destroy();
                            },
                        },
                    ],
                }),
            ],
        });
    }; // END FUNCTION

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
                            Ext.getCmp("sc_codeID").focus(false, 20);
                        }),
                        );
        // menu
        // .add({
        //   text: "เพิ่มข้อมูล",
        //   icon: "../images/icons/add.png",
        // })
        // .on(
        //   "click",
        //   (click = function () {
        //     Ext.buAct = "add";
        //     Ext.loadStore("add", false); // app,data.load
        //   })
        // );
        tb.doLayout();
        return tb;
    }; //MenuButton

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
                    },
                    {
                        header: "สถานะ",
                        sortable: false,
                        align: "left",
                        dataIndex: "c_code_status",
                        hidden: true,
                        renderer: function (value, metaData, record, row, col, store, gridView) {
                            return value == null ? "" : value + " " + record.get("c_name_status");
                        },
                    },
                    {
                        header: "รหัส PR",
                        sortable: false,
                        align: "left",
                        dataIndex: "c_codeStatus",
                        width: 140,
                    },
                    {
                        header: "อัพเดทสถานะ",
                        sortable: false,
                        hidden: true,
                        align: "center",
                        dataIndex: "id",
                        id: "processDueID",
                        width: 120,
                        renderer: function (value, metaData, record, row, col, store, gridView) {
                            //                            metaData.attr = "style='cursor:pointer; text-align:center;';";
                            var BtnText, IconImg;
                            if (!Ext.isEmpty(record.get("c_code")) && record.get("tor_status_id") != null) {
                                BtnText = "&nbspผ่านรายการแล้ว";
                                IconImg = "../images/icons/application_go.png";
                            } else if (Ext.isEmpty(record.get("c_code")) && record.get("tor_status_id") == null) {
                                BtnText = "&nbspบันทึกแล้ว";
                                IconImg = "../images/icons/application_form.png";
                            } else {
                                BtnText = "&nbspบันทึกแล้ว";
                                IconImg = "../images/icons/cog_start.png";
                            }
                            var style = "font-size:12px;border:1px solid #ccc; width:110px; padding:3px 3px 3px 10px; background: #f0f0f0 url(" + IconImg + ") no-repeat 3px center; cursor: pointer;";
                            return '<button style="' + style + '" type="button">' + BtnText + "</button>";
                        },
                    },
                    {
                        header: "เรื่อง/โครงการ",
                        sortable: true,
                        align: "left",
                        dataIndex: "c_name",
                        width: 250,
                    },
                    {
                        header: "ราคากลาง",
                        sortable: false,
                        align: "center",
                        dataIndex: "f_total_average",
                        width: 110,
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                            metaData.attr = "style='color:blue;text-align: right;'";
                            return floatRenderer(value);
                        },
                    },
                    {
                        header: "เลขที่ Egp",
                        sortable: false,
                        align: "center",
                        width: 110,
                        dataIndex: "c_name_egp",

                    },
                    {
                        header: "เอกสาร PR",
                        sortable: false,
                        width: 105,
                        align: "center",
                        dataIndex: "pr_check_pdf",
                        id: "pr_check_pdfID",
                        // editor: new Ext.form.TextField({}),
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                            metaData.attr = "style='cursor:pointer; text-align:center;';";
                            if (record.get("i_is_upload") == 0)
                                return '<img src="../images/icons/bullet_cross.png"); style="cursor:pointer"/>';
                            else
                                return '<img src="../images/icons/icon_pdf.png");/>';
                        },
                    },
                    {
                        header: "เลขสารบัญรับ",
                        sortable: true,
                        align: "left",
                        hidden: true,
                        dataIndex: "index_receive",
                        width: 80,
                    },
                    {
                        header: "สถานะรายการ",
                        sortable: true,
                        align: "left",
                        dataIndex: "c_name_status",
                        id: "c_name_statusID",
                        width: 150,
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                            let vv = record.data.i_status_last;
                            let color = "#0000FF";

                            if (record.data.tor_status_id == 21) {
                                color = "green";
                                // } else if (record.data.i_sub_status == "0.21") {
                            } else if (record.data.i_sub_status == "0.30") {
                                color = "black";
                                color = "#FFA80F"; //yellow
                                color = "green";
                            } else {
                            }
                            metaData.attr = 'style="font-weight: bold; color: ' + color + ';"';
                            return value;
                        },
                    },
                    {
                        header: "ประเภทความก้าวหน้า",
                        sortable: false,
                        width: 250,
                        // hidden: true,
                        align: "left",
                        dataIndex: "event_type",

                    },
                    {
                        header: "ความก้าวหน้าล่าสุด",
                        sortable: false,
                        width: 250,
                        // hidden: true,
                        align: "left",
                        dataIndex: "sp_event_detail",
                    },
                    {
                        header: "ผู้รับผิดชอบงาน",
                        sortable: false,
                        width: 150,

                        // hidden: true,
                        align: "left",
                        dataIndex: "c_emp_name",
                    },
                    {
                        header: "หน่วยงานเจ้าของเรื่อง",
                        sortable: false,
                        // hidden: true,
                        align: "center",
                        dataIndex: "dc_cost2_idTxt",
                    },
                    {
                        header: "หน่วยงานย่อย",
                        sortable: false,
                        // hidden: true,
                        align: "center",
                        dataIndex: "dc_sub_cost",
                    },
                    {
                        header: "สายงาน",
                        sortable: false,
                        // hidden: true,
                        align: "center",
                        dataIndex: "txtdc_department_idID",
                    },
                    {
                        header: "วันที่ KPI",
                        sortable: false,
                        align: "center",
                        dataIndex: "d_egp_date",
                        renderer: function (val, metaData, record, rowIndex, colIndex, store) {
                            return shortThaiDate(val);
                        },
                    },
                    {
                        header: "วันที่ PR",
                        sortable: false,
                        hidden: true,
                        align: "center",
                        dataIndex: "d_tor_date",

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
                        header: "วิธีดำเนินงาน",
                        width: 90,
                        sortable: false,
                        align: "center",
                        dataIndex: "c_tor_type",
                    },
                    {
                        header: "ขอดำเนินการ",
                        sortable: false,
                        align: "center",
                        width: 120,
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
                        align: "center",
                        dataIndex: "d_doc_ref",
                    },
                    {
                        header: "หน่วยงานที่รับผิดชอบ",
                        align: "left",
                        hidden: true,
                        dataIndex: "dc_cost_idTxt",
                    },
                    {
                        header: "หน่วยงานเจ้าของเรื่อง",
                        align: "left",
                        hidden: true,
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
                    title: Ext.title,
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
                        deferEmptyText: false,
                        getRowClass: function (record, index, rowParams) {
                            // console.log(record);
                            if (record.data.i_enabled != 1) {
                                return "delete-color-red";
                            } else if (record.data.i_is_upload == 1 && record.data.tor_status_id > 0 && record.data.tor_status_id != 21) {
                                return "color-green";
                            } else if (record.data.tor_status_id == 21) {
                                return "color-yellow";
                            }
                            // return "color-green";
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
                        contextmenu: function (e) {
                            e.stopEvent();
                            var id = Ext.selectRow.json.imp_assetall_supplies_hdr_id;
                            console.log(Ext.selectRow);
                            var isIframe = !!window.parent.Ext.getCmp("refresh-parentID");
                            var mymenu = new Ext.menu.Menu({
                                items: [{
                                        text: 'ดู Timeline รายการ "' + Ext.selectRow.data.c_code + '"',
//                  hidden: Ext.selectRow.data.d_doc_ref == null ? true : false,
                                        icon: "../images/icons/time_go.png",
                                        scope: this,
                                        handler: function (e) {

                                            Timeline("PR", 'ดู Timeline รายการ "' + Ext.selectRow.data.c_code + '"');

                                        },
                                    },
                                    {
                                        text: "จัดการข้อมูล View/Copy/Edit/Delete",
                                        icon: "../images/icons/application_edit.png",
                                        handler: function (e) {
                                            Ext.buAct = "update";
                                            Ext.loadStore("edit", true); // app,data.load
                                        },
                                        scope: this,
                                    },
                                    {
                                        text: 'คัดลอก ID PR "' + Ext.selectRow.data.id + '"',
                                        hidden: Ext.session.dc_center_user != 1 ? true : false,
                                        icon: "../images/icons/page_copy.png",
                                        scope: this,
                                        handler: function (e) {
                                            copyToClipboard(Ext.selectRow.data.id);
                                        },
                                    },
                                    {
                                        text: "(console_record)",
                                        hidden: Ext.session.dc_center_user != 1 ? true : false,
                                        icon: "../images/icons/page_copy.png",
                                        scope: this,
                                        handler: function (e) {
                                            console.log(Ext.selectRow);
                                        },
                                    },
                                    {
                                        text: 'คัดลอก ID PO "' + Ext.selectRow.data.sp_contract_id + '"',
                                        hidden: Ext.session.dc_center_user != 1 ? true : false,
                                        icon: "../images/icons/page_copy.png",
                                        scope: this,
                                        handler: function (e) {
                                            copyToClipboard(Ext.selectRow.data.sp_contract_id);
                                        },
                                    },
                                    {
                                        text: 'คัดลอก "' + Ext.selectRow.data.c_code + '"',
                                        hidden: Ext.selectRow.data.c_code == null ? true : false,
                                        icon: "../images/icons/page_copy.png",
                                        scope: this,
                                        handler: function (e) {
                                            copyToClipboard(Ext.selectRow.data.c_code);
                                        },
                                    },
                                    {
                                        text: 'คัดลอก "' + Ext.selectRow.data.code + '"',
                                        hidden: Ext.selectRow.data.code == null ? true : false,
                                        icon: "../images/icons/page_copy.png",
                                        scope: this,
                                        handler: function (e) {
                                            copyToClipboard(Ext.selectRow.data.code);
                                        },
                                    },
                                    {
                                        text: 'คัดลอก "' + Ext.selectRow.data.d_doc_ref + '"',
                                        hidden: Ext.selectRow.data.d_doc_ref == null ? true : false,
                                        icon: "../images/icons/page_copy.png",
                                        scope: this,
                                        handler: function (e) {
                                            copyToClipboard(Ext.selectRow.data.d_doc_ref);
                                        },
                                    },

                                    {
                                        text: "จัดการเอกสารและสถานะ การลงนาม",
                                        icon: "../images/icons/text_signature.png",
                                        hidden: !isIframe,
                                        handler: function (e) {
                                            //                        console.log(window.parent.Ext.getCmp('refresh-parentID'));

                                            window.parent.Ext.globValue = Ext.apply({
                                                pr_code: Ext.selectRow.get("c_code"),
                                                c_name: Ext.selectRow.get("c_name"),
                                                sp_tor_id: Ext.selectRow.get("id"),
                                                tor_type_id: Ext.selectRow.get("tor_type_id"),
                                            });
                                            window.parent.Ext.getCmp("tabs-panel-sign").setActiveTab("tab-template"); //tab-pr
                                        },
                                        scope: this,
                                    },
                                ],
                                listeners: {
                                    beforerender: function () {


                                        Ext.receiveJson = function (obj, id) {
                                            let Date_now = new Date();
                                            let jsonApplay = Ext.apply(obj, {
                                                client_datetime: Date_now.format("Y-m-d H:i:s"),
                                                user_sent_id: Ext.session.user_id,
                                                user_id: id,
                                                user_sent_name: Ext.session.user_name,
                                                c_menu: "checking",
                                                dc_department_id: 0,
                                                dc_cost_id: 32,
                                                i_status: 1,
                                            });
                                            if (id != 0)
                                                //sent all
                                                Ext.Ajax.request({
                                                    url: "../php-notic/insertLoger.php",
                                                    method: "POST",
                                                    params: jsonApplay,
                                                    success: function (response) {},
                                                });
                                        };
                                        // Ext.realTimeSentMsg = function (id, textSent) {
                                        //   var wsUri = "ws://" + window.parent.Ext.ipServer + ":9000/demo/server.php";
                                        //   websocket = new WebSocket(wsUri);
                                        //   websocket.onopen = function (ev) {
                                        //     // connection is open
                                        //     var msg = {
                                        //       message: textSent,
                                        //       name: id,
                                        //       sent_name: Ext.session.user_name,
                                        //       color: "#007AFF",
                                        //     };
                                        //     websocket.send(JSON.stringify(msg));
                                        //   };
                                        //   var obj = {
                                        //     type: "usermsg",
                                        //     name: id,
                                        //     sent_name: Ext.session.user_name,
                                        //     message: "วางบิล " + textSent,
                                        //     color: "#007AFF",
                                        //   };

                                        //   Ext.receiveJson(obj, id);
                                        //   //End Sent
                                        // };
                                    },
                                    hide: function () {
                                        setTimeout(function () {
                                            mymenu.destroy();
                                        }, 0);
                                    },
                                },
                            });
                            mymenu.showAt(e.getXY());
                        },
                        dblclick: function (dataview, index, item, e) {
                            Ext.getBody().on("click", function (e, target) {
                                // console.log("คลิกที่ รายการ PR!");
                                if (target.innerText.includes("รายการ PR")) {
                                }
                            });
                            Ext.buAct = "update";
                            Ext.selectDefault = Ext.selectRow;

                            Ext.loadStore("edit", true); // app,data.load
                        },
                        viewready: function (g) {
                            // Ext.ux.attachRowTooltip(g, {
                            //   titleTpl: new Ext.XTemplate("สถานะรายการ PR → <span style='color:red'>{c_code_status}</span>"),
                            //   bodyTpl: new Ext.XTemplate(
                            //     "<div style='font-size:12px;line-height:1.5'>",
                            //     "<b>รายการ PR :</b> {c_code}<br/>",
                            //     "<b>เรื่อง/โครงการ :</b> {c_name}<br/>",
                            //     "<b>ผู้รับผิดชอบ :</b> {c_emp_name}<br/>",
                            //     "</div>"
                            //   ),
                            //   // showDelay: 120,
                            //   // hideDelay: 150,
                            //   // trackMouse: true,
                            // });
                            // },
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
                            // กำหนดสิทธิ์ครั้งเดียว (กัน undefined ด้วย)

                            var isIframe = !!window.parent.Ext.getCmp("refresh-parentID");
                            // check โชว์
                            this.contextMenu = new Ext.menu.Menu({
                                items: [
                                    {
                                        text: "จัดการข้อมูล View/Copy/Edit/Delete",
                                        icon: "../images/icons/application_edit.png",
                                        handler: function (e) {
                                            Ext.buAct = "update";
                                            Ext.loadStore("edit", true); // app,data.load
                                        },
                                        scope: this,
                                    },
                                    {
                                        text: "จัดการเอกสารและสถานะ การลงนาม",
                                        icon: "../images/icons/text_signature.png",
                                        hidden: !isIframe,
                                        handler: function (e) {
                                            //                        console.log(window.parent.Ext.getCmp('refresh-parentID'));

                                            window.parent.Ext.globValue = Ext.apply({
                                                sp_tor_id: Ext.selectRow.get("id"),
                                                pr_code: Ext.selectRow.get("c_code"),
                                                c_name: Ext.selectRow.get("c_name"),
                                                tor_type_id: Ext.selectRow.get("tor_type_id"),
                                                update: Ext.util.Format.date(new Date(), "Y-m-d H:i:s"),
                                            });
                                            window.parent.Ext.getCmp("tabs-panel-sign").setActiveTab("tab-template"); //tab-pr
                                            window.parent.Ext.processTab();
                                        },
                                        scope: this,
                                    },
                                ],
                            });
                        },
                        afterrender: function (grid) {
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
                                            }),
                                            );
                                    menu.add({
                                        text: "Inspect SQL",
                                        icon: "../images/icons/script_lightning.png",
                                        scope: this,
                                        handler: function (e) {
                                            grid.store.load({params: {show_sql: 1}});
                                        },
                                    });
                                }
                                menu.showAt(e.getXY());
                            });
                            this.on("cellclick", cellClick, this); //cellClick
                            // this.on(
                            //   "contextmenu",
                            //   function (e, grid, rowIndex, columnIndex) {
                            //     e.stopEvent();
                            //     this.contextMenu.showAt(e.getXY());
                            //   },
                            //   this
                            // );
                            this.fnAutoReload = () => {
                                //-----------------------------------------
                                // console.log(this);
                                var grid = this;
                                var updateGrid = function () {
                                    console.log("Reload Grid time :" + new Date().format("d-m-Y g:i:s A"));
                                    grid.store.reload();
                                };
                                //-----------------------------------------
                                var runner = new Ext.util.TaskRunner();
                                //              runner.start({ run: updateGrid, interval: 60 * 1000 });
                            }; //End If
                            this.fnAutoReload();
                        },
                    },
                    store: Ext.storeDtl,
                    tbar: [
                        {
                            xtype: "buttongroup",
                            columns: 1,
                            title: "ระบุเงื่อนไขในการค้นหาข้อมูล",
                            defaults: {scale: "small", style: "float: left"},
                            listeners: {
                                afterrender: function (cmp) {
                                    if (cmp.header.id) {
                                        document.getElementById(cmp.header.id).style.cssText = " display: flex; justify-content: space-between; width: 99%;";
                                        document.getElementById(cmp.header.id).innerHTML += `
                    <button onclick="sp_manual(event)" type="button" style="display: flex; padding: 0px; height: 15px; font-size: 10px; color: red; font-weight: bold;">
                    <img src='../images/icons/book.png' style='width: 12px; height: 12px; margin-right:1px;'/>

                    </button>
                  `;
                                    } //ใบแนบคู่มือใช้งาน
                                },
                            },
                            items: [
                                {
                                    xtype: "buttongroup",
                                    frame: false,
                                    items: [
                                        {xtype: "label", text: "ค้นหาโดย : "},
                                        {xtype: "tbspacer", width: 4},
                                        {
                                            id: "filter",
                                            xtype: "combo",
                                            width: 300,
                                            mode: "local",
                                            store: new Ext.data.SimpleStore({
                                                fields: ["value", "text"],
                                                data: [
                                                    //   ["sql", "SQL"],
                                                    //   ["tor_id", "hdr_id"],
                                                    //   ["sp_tor_contract_id", "sp_tor_contract_id"],
                                                    ["c_code", "เลขPR"],
                                                    ["c_doc_ref", "เลขที่อ้างอิง/เลขที่ พวช"],
                                                    ["c_name", "ชื่อรายการ"],
                                                    ["c_code_contract", "เลขสัญญา"],
                                                    ["dc_creditor_name", "ผู้ขายผุ้รับจ้าง"],
                                                    ["dc_creditor_tax_numbe", "เลชประจำตัวผู้เสียภาษีผู้ขายผุ้รับจ้าง"],
                                                    ["f_total", "จำนวนเงิน"],
                                                    ["d_code_chk", "เลขที่ตรวจรับ"],
                                                    ["d_code", "เลขที่ใบเบิก"],
                                                ],
                                            }),
                                            value: "c_code",
                                            valueField: "value",
                                            displayField: "text",
                                            allowBlank: false,
                                            editable: false,
                                            triggerAction: "all",
                                            typeAhead: false,
                                        },
                                        {xtype: "tbspacer", width: 4},
                                        {
                                            xtype: "textfield",
                                            id: "value-box",
                                            width: 196,
                                            fieldLabel: "fieldLabel",
                                            emptyText: "คำที่ต้องการค้นหา",
                                        },
                                    ],
                                },
                                {
                                    xtype: "buttongroup",
                                    frame: false,
                                    items: [
                                        {xtype: "label", text: "แหล่งเงิน : "},
                                        {xtype: "tbspacer", width: 4},
                                        new Ext.form.ComboBox({
                                            id: "s_dc_expense_budget_type_id",
                                            mode: "local",
                                            store: Ext.dc_expense_budget_type_all,
                                            valueField: "id",
                                            displayField: "c_name",
                                            triggerAction: "all",
                                            forceSelection: true,
                                            selectOnFocus: true,
                                            typeAhead: false,
                                            emptyText: "กรุณาเลือก...",
                                            width: 400,
                                            value: "0",
                                            listeners: {
                                                render: function (combo) {
                                                    tooltip_ComboBox(combo, "c_name");
                                                },
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
                                                // { xtype: "tbspacer", width: 10 },
                                                // new Ext.form.Checkbox({
                                                //   id: "i_pdf",
                                                //   boxLabel: "ที่มีเอกสาร PDF",
                                                //   inputValue: 1,
                                                //   checked: false,
                                                //   listeners: {
                                                //     check: function (combo, newValue) {
                                                //     },
                                                //   },
                                                // }),
                                    ],
                                },
                                {
                                    xtype: "buttongroup",
                                    frame: false,
                                    items: [
                                        // { xtype: "tbspacer", width: 4 },
                                        {xtype: "label", text: "จำนวนเงิน PR : "},
                                        {
                                            xtype: "textfield",
                                            fieldLabel: "จำนวนเงินงวด",
                                            // readOnly: true,
                                            // readOnly: Ext.session.dc_center_user == 1 ? false : true,
                                            id: "f_total_amtPrID",
                                            name: "f_total_amtPr",
                                            listeners: {
                                                afterrender: function () {
                                                    this.fn = function () {
                                                        this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                                                    };
                                                    this.fn();
                                                },
                                                blur: function () {
                                                    var f_total = parseFloat(this.getValue().replace(/,/g, "") / 1);
                                                    this.setValue(Ext.floatRenderer(f_total));
                                                },
                                                keyup: function () {
                                                    // Ext.getCmp("f_totalID").setValue(floatRenderer(floatMinus(Ext.getCmp("f_type_amtID").getValue().replace(/,/g, ""))));
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
                                        {xtype: "tbspacer", width: 4},
                                        {xtype: "label", text: "จำนวนเงิน PO : "},
                                        {
                                            xtype: "textfield",
                                            fieldLabel: "จำนวนเงินงวด",
                                            // readOnly: true,
                                            // readOnly: Ext.session.dc_center_user == 1 ? false : true,
                                            id: "f_total_amtPoID",
                                            name: "f_total_amtPo",
                                            listeners: {
                                                afterrender: function () {
                                                    this.fn = function () {
                                                        this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                                                    };
                                                    this.fn();
                                                },
                                                blur: function () {
                                                    var f_total = parseFloat(this.getValue().replace(/,/g, "") / 1);
                                                    this.setValue(Ext.floatRenderer(f_total));
                                                },
                                                keyup: function () {
                                                    // Ext.getCmp("f_totalID").setValue(floatRenderer(floatMinus(Ext.getCmp("f_type_amtID").getValue().replace(/,/g, ""))));
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
                                        {xtype: "tbspacer", width: 4},
                                    ],
                                },
                            ],
                            buttonAlign: "left",
                            buttons: [
                                {
                                    text: "เปิดหน้าบันทึก",
                                    id: "buAdd",

                                    hidden: Ext.session.dc_cost_id == 38 ? false : true,
                                    iconCls: "icon-add",
                                    handler: function (grid, rowIndex, colIndex) {
                                        var win = new Ext.Window({
                                            id: "winQuickProgress",
                                            title: "บันทึกความก้าวหน้า (Quick Progress)",
                                            width: 900,
                                            height: 600,
                                            layout: "form",
                                            modal: true,
                                            bodyStyle: "padding:10px;",
                                            items: [
                                                {
                                                    xtype: "fieldset",
                                                    title: "ข้อมูลการบันทึก",
                                                    autoHeight: true,
                                                    defaults: {anchor: "98%"},
                                                    items: [
                                                        // {
                                                        //   xtype: "datefield",
                                                        //   fieldLabel: "วันที่",
                                                        //   name: "d_action_date",
                                                        //   id: "qp_date",
                                                        //   value: new Date(),
                                                        //   format: "d/m/Y",
                                                        // },
                                                        {
                                                            xtype: "hidden", //textfield
                                                            name: "sp_emp_id",
                                                            value: Ext.session.sp_emp_id,
                                                        },
                                                        {
                                                            xtype: "datefield",
                                                            fieldLabel: "วันที่",
                                                            name: "d_action_date",
                                                            id: "qp_date",
                                                            anchor: "95%",
                                                            value: new Date(),
                                                            maxValue: new Date(),
                                                            minValue: new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000),
                                                            // format: "d/m/Y",
                                                            validator: function (val) {
                                                                if (!Ext.isEmpty(val)) {
                                                                    return true;
                                                                } else {
                                                                    return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                                                }
                                                            },
                                                        },
                                                        {
                                                            layout: "column",
                                                            border: false,
                                                            bodyStyle: "background:transparent;",
                                                            items: [
                                                                {
                                                                    columnWidth: 0.5,
                                                                    layout: "form",
                                                                    border: false,
                                                                    bodyStyle: "background:transparent;",
                                                                    items: [
                                                                        {
                                                                            xtype: "timefield",
                                                                            fieldLabel: "เวลาเริ่ม",
                                                                            name: "event_time_start",
                                                                            id: "qp_time_start",
                                                                            format: "H:i",
                                                                            value: new Date(),
                                                                            minValue: "06:00",
                                                                            maxValue: "22:00",
                                                                            anchor: "95%",
                                                                            increment: 15,
                                                                        },
                                                                    ],
                                                                },
                                                                {
                                                                    columnWidth: 0.5,
                                                                    layout: "form",
                                                                    border: false,
                                                                    bodyStyle: "background:transparent;",
                                                                    items: [
                                                                        {
                                                                            xtype: "timefield",
                                                                            fieldLabel: "เวลาสิ้นสุด",
                                                                            name: "event_time_end",
                                                                            id: "qp_time_end",
                                                                            format: "H:i",
                                                                            value: new Date(new Date().getTime() + 4 * 60 * 60 * 1000),
                                                                            minValue: "06:00",
                                                                            maxValue: "22:00",
                                                                            anchor: "95%",
                                                                            increment: 15,
                                                                        },
                                                                    ],
                                                                },
                                                            ],
                                                        },
                                                        {
                                                            xtype: "combo",
                                                            fieldLabel: "ประเภทความก้าวหน้า",
                                                            anchor: "95%",
                                                            store: new Ext.data.SimpleStore({
                                                                fields: ["id", "name"],
                                                                data: [
                                                                    ["1", "อื่นๆ"],
                                                                    ["2", "ประชุม"],
                                                                ],
                                                            }),
                                                            displayField: "name",
                                                            valueField: "id",
                                                            value: "1",
                                                            mode: "local",
                                                            triggerAction: "all",
                                                            limit: 10,
                                                            selectOnFocus: true,
                                                            id: "qp_type",
                                                            emptyText: "เลือกประเภท...",
                                                        },
                                                        {
                                                            xtype: "textarea",
                                                            fieldLabel: "รายละเอียด",
                                                            anchor: "95%",
                                                            id: "qp_detail",
                                                            height: 60,
                                                        },
                                                    ],
                                                },
                                                {
                                                    xtype: "grid",
                                                    title: "ประวัติการบันทึก (ล่าสุด)",
                                                    height: 200,
                                                    loadMask: true,
                                                    store: Ext.SP_TOR_EVENT,
                                                    columns: [
                                                        {
                                                            header: "วันที่บันทึก",
                                                            dataIndex: "event_date",
                                                            width: 130,
                                                            renderer: function (v) {
                                                                return shortThaiDate(v);
                                                            },
                                                        },
                                                        {
                                                            header: "วันที่บันทึกความก้าวหน้า/ภาระงาน",
                                                            dataIndex: "d_create",
                                                            width: 130,
                                                            renderer: function (v) {
                                                                return v;// shortThaiDateWithTime(v);
                                                            },
                                                        },
                                                        {
                                                            header: "เวลาเริ่ม",
                                                            dataIndex: "event_time_start",
                                                            width: 60,
                                                            renderer: function (v) {
                                                                return v ? v : "-";
                                                            },
                                                        },
                                                        {
                                                            header: "เวลาสิ้นสุด",
                                                            dataIndex: "event_time_end",
                                                            width: 60,
                                                            renderer: function (v) {
                                                                return v ? v : "-";
                                                            },
                                                        },
                                                        {
                                                            header: "ประเภท",
                                                            dataIndex: "event_title",
                                                            width: 100,
                                                            renderer: function (v) {
                                                                if (v == "1")
                                                                    return "อื่นๆ";
                                                                if (v == "2")
                                                                    return "ประชุม";
                                                                return v;
                                                            },
                                                        },
                                                        {
                                                            header: "รายละเอียด",
                                                            dataIndex: "event_detail",
                                                            width: 250,
                                                            renderer: function (v, meta) {
                                                                meta.attr = 'style="white-space:normal;"'; // Wrap text
                                                                return v;
                                                            },
                                                        },
                                                        {header: "ผู้บันทึก", dataIndex: "user_name", width: 150},
                                                        {
                                                            header: "ยกเลิก",
                                                            dataIndex: "sp_tor_event_id",
                                                            width: 80,
                                                            align: "center",
                                                            id: "btn_cancel_id",
                                                            renderer: function (v, meta) {
                                                                return '<img src="../images/icons/delete.png" style="cursor:pointer;" title="ยกเลิกรายการ">';
                                                            },
                                                        },
                                                    ],
                                                    listeners: {
                                                        cellclick: function (grid, rowIndex, columnIndex, e) {
                                                            var record = grid.store.getAt(rowIndex);
                                                            var colId = grid.getColumnModel().getColumnId(columnIndex);

                                                            if (colId == "btn_cancel_id") {
                                                                Ext.Msg.confirm("ยืนยัน", "ต้องการยกเลิกรายการนี้หรือไม่?", function (btn) {
                                                                    if (btn == "yes") {
                                                                        Ext.Ajax.request({
                                                                            url: "../sp/tor/api/mnTorController.php",
                                                                            params: {
                                                                                mode: "CANCEL_SP_TOR_EVENT",
                                                                                sp_tor_event_id: record.get("sp_tor_event_id"),
                                                                            },
                                                                            success: function (action, res) {
                                                                                var response = Ext.decode(action.responseText);
                                                                                if (response.success) {
                                                                                    grid.store.reload();
                                                                                } else {
                                                                                    Ext.Msg.alert("Error", "เกิดข้อผิดพลาด");
                                                                                }
                                                                            },
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        },
                                                        render: function (grid) {
                                                            grid.store.load();
                                                        },
                                                        rowcontextmenu: function (grid, rowIndex, e) {
                                                            e.stopEvent();
                                                            var record = grid.store.getAt(rowIndex);
                                                            var menu = new Ext.menu.Menu({
                                                                items: [
                                                                    {
                                                                        text: "ยกเลิกรายการ",
                                                                        icon: "../images/icons/delete.png",
                                                                        handler: function () {
                                                                            Ext.Msg.confirm("ยืนยัน", "ต้องการยกเลิกรายการนี้หรือไม่?", function (btn) {
                                                                                if (btn == "yes") {
                                                                                    Ext.Ajax.request({
                                                                                        url: "../sp/tor/api/mnTorController.php",
                                                                                        params: {
                                                                                            mode: "CANCEL_SP_TOR_EVENT",
                                                                                            sp_tor_event_id: record.get("sp_tor_event_id"),
                                                                                        },
                                                                                        success: function (action, res) {
                                                                                            var response = Ext.decode(action.responseText);
                                                                                            if (response.success) {
                                                                                                grid.store.reload();
                                                                                            } else {
                                                                                                Ext.Msg.alert("Error", "เกิดข้อผิดพลาด");
                                                                                            }
                                                                                        },
                                                                                    });
                                                                                }
                                                                            });
                                                                        },
                                                                    },
                                                                ],
                                                            });
                                                            menu.showAt(e.getXY());
                                                        },
                                                    },
                                                },
                                            ],
                                            buttons: [
                                                {
                                                    text: "บันทึก",
                                                    handler: function () {
                                                        var d_date = Ext.getCmp("qp_date").getValue();
                                                        var type = Ext.getCmp("qp_type").getValue();
                                                        var detail = Ext.getCmp("qp_detail").getValue();
                                                        var time_start = Ext.getCmp("qp_time_start").getValue();
                                                        var time_end = Ext.getCmp("qp_time_end").getValue();

                                                        if (!type) {
                                                            Ext.Msg.alert("Warning", "กรุณาเลือกประเภท");
                                                            return;
                                                        }

                                                        Ext.Ajax.request({
                                                            url: "../sp/tor/api/mnTorController.php",
                                                            params: {
                                                                mode: "Save_Event_Notor",
                                                                event_type: type,
                                                                event_title: Ext.getCmp("qp_type").getRawValue(),
                                                                d_event_date: Ext.getCmp("qp_date").getRawValue(),
                                                                event_time_start: time_start,
                                                                event_time_end: time_end,
                                                                event_detail: detail,
                                                                sp_tor_id: 0, // General Log
                                                            },
                                                            success: function (action, res) {
                                                                console.log(action.statusText);
                                                                Ext.Msg.alert("บันทึกสำเร็จ", action.statusText, function (form, action) {
                                                                    Ext.storeDtl.reload({
                                                                        callback: function (record, operation, success) {
                                                                            if (success) {
                                                                                // Ext.storeEven.reload();
                                                                                // Fix: Access grid within window (item index 1) to get store
                                                                                Ext.SP_TOR_EVENT.reload();
                                                                                // Fix: Access grid within window (item index 1) to get store
                                                                                let gridComp = Ext.getCmp("winQuickProgress").items.get(1);
                                                                                if (gridComp && gridComp.store) {
                                                                                    gridComp.store.reload();
                                                                                }
                                                                            }
                                                                        },
                                                                    });
                                                                });
                                                            },
                                                        });
                                                    },
                                                },
                                                {
                                                    text: "ปิด",
                                                    handler: function () {
                                                        win.close();
                                                    },
                                                },
                                            ],
                                        });
                                        win.show();
                                    },
                                },
                                {xtype: "tbfill"},
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
                            columns: 1,
                            // hidden:true,
                            defaults: {scale: "small", style: "float: right"},
                            items: [
                                {
                                    xtype: "buttongroup",
                                    frame: false,
                                    //   hidden:true,
                                    items: [
                                        {xtype: "label", text: "เมนู : "},
                                        {xtype: "tbspacer", width: 5},

                                        new Ext.form.ComboBox({
                                            id: "sp_tor_status_id",
                                            fieldLabel: "เมนู",
                                            width: 250,
                                            mode: "local",
                                            // hidden: true ,
                                            store: Ext.sp_tor_status,
                                            valueField: "id",
                                            displayField: "c_name",
                                            triggerAction: "all",
                                            forceSelection: true,
                                            selectOnFocus: true,
                                            typeAhead: false,
                                            emptyText: "กรุณาเลือก...",
                                            // value: "0",
                                            listeners: {
                                                Change: function () {
                                                    var myStr = this.value;
                                                    Ext.replace_id = myStr.replaceAll(";", ",");
                                                    Ext.newStr = Ext.replace_id;
                                                    // console.log(Ext.newStr)
                                                    // }
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
                                        {xtype: "label", hidden: true, text: "ปีของสัญญา : "},
                                        {xtype: "tbspacer", width: 4},
                                        new Ext.form.ComboBox({
                                            id: "s_i_year_contract",
                                            mode: "local",
                                            store: Ext.store_yearSearch,
                                            valueField: "id",
                                            hidden: true,
                                            displayField: "c_name",
                                            triggerAction: "all",
                                            forceSelection: true,
                                            selectOnFocus: true,
                                            typeAhead: false,
                                            emptyText: "กรุณาเลือก...",
                                            width: 400,
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
                                    // hidden: Ext.session.user_id == 1 ? false : true,
                                    frame: false,
                                    items: [
                                        {xtype: "label", text: "พนักงาน    : "},
                                        {xtype: "tbspacer", width: 6},
                                        new Ext.form.ComboBox({
                                            id: "sp_emp_idID",
                                            // readOnly : Ext.session.user_id == 1 ? false : true,
                                            hiddenName: "sp_emp_id",
                                            fieldLabel: "ชื่อพนักงาน",
                                            store: Ext.sp_user,
                                            valueField: "id",
                                            displayField: "c_name",
                                            mode: "local",
                                            triggerAction: "all",
                                            emptyText: "กรุณาเลือก...",
                                            width: 200,
                                            forceSelection: true,
                                            selectOnFocus: true,
                                            typeAhead: false,
                                            // value: ((Ext.session.i_level == 3) ? "0" : Ext.session.sp_emp_id),
                                            value: 0,
                                            listeners: {
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
                                    hidden: true,
                                    items: [
                                        {xtype: "label", text: "ฝ่ายงาน : "},
                                        {xtype: "tbspacer", width: 5},
                                        new Ext.form.ComboBox({
                                            mode: "local",
                                            store: Ext.dc_cost,
                                            // anchor: "70%",
                                            readOnly: [0, 38, 3].includes(Ext.session.dc_cost_id) ? false : true,
                                            // value: Ext.session.dc_cost_id,
                                            fieldLabel: "หน่วยงานเจ้าของเรื่อง",
                                            valueField: "id",
                                            displayField: "c_name",
                                            hiddenName: "dc_cost_id",
                                            id: "s_dc_cost_idID",
                                            name: "c_cost_name",
                                            triggerAction: "all",
                                            forceSelection: true,
                                            selectOnFocus: true,
                                            typeAhead: false,
                                            emptyText: "กรุณาเลือก...",
                                            width: 400,
                                            validator: function (val) {
                                                if (!Ext.isEmpty(val)) {
                                                    return true;
                                                } else {
                                                    return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                                }
                                            },
                                            listeners: {
                                                render: function (combo) {
                                                    tooltip_ComboBox(combo, "c_name");
                                                    console.log(Ext.session.dc_cost_id);
                                                },
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
                                    ],
                                },
                                {
                                    xtype: "buttongroup",
                                    frame: false,
                                    items: [
                                        {xtype: "label", text: "ปีที่สร้าง PR : "},
                                        {xtype: "tbspacer", width: 4},
                                        new Ext.form.ComboBox({
                                            id: "s_i_budget_year",
                                            mode: "local",
                                            store: Ext.store_yearSearch,
                                            valueField: "id",
                                            displayField: "c_name",
                                            triggerAction: "all",
                                            forceSelection: true,
                                            selectOnFocus: true,
                                            typeAhead: false,
                                            emptyText: "กรุณาเลือก...",
                                            width: 150,
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
                                    // hidden:true,
                                    items: [
                                        {xtype: "label", text: "ปีที่ใช้ประมาณ : "},
                                        {xtype: "tbspacer", width: 4},
                                        new Ext.form.ComboBox({
                                            id: "s_i_budget_year_overlap",
                                            mode: "local",
                                            store: Ext.store_yearSearch,
                                            valueField: "id",
                                            displayField: "c_name",
                                            triggerAction: "all",
                                            forceSelection: true,
                                            selectOnFocus: true,
                                            typeAhead: false,
                                            emptyText: "กรุณาเลือก...",
                                            width: 150,
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
                                    // hidden: true,
                                    items: [
                                        {xtype: "label", text: "ประเภทสัญญา : "},
                                        {xtype: "tbspacer", width: 4},
                                        {
                                            id: "s_i_type_contract",
                                            xtype: "combo",
                                            // readOnly: true,
                                            width: 159,
                                            mode: "local",
                                            store: new Ext.data.SimpleStore({
                                                fields: ["value", "text"],
                                                data: [
                                                    ["0", "ทั้งหมด"],
                                                    ["1", "สัญญา"],
                                                    ["2", "ใบสั่ง"],
                                                    ["3", "จะซื้อจะขาย"],
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
                                        {xtype: "label", text: "วันที่สร้างรายการ : "},
                                        {xtype: "tbspacer", width: 4},
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
                                        {xtype: "tbspacer", width: 4},
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
                                        {xtype: "tbspacer", width: 269},
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
                                        {xtype: "label", text: " : "},
                                        {xtype: "tbspacer", width: 4},
                                        {xtype: "tbspacer", width: 7},
                                        new Ext.form.Checkbox({
                                            id: "s_checkbox_c_code_po",
                                            boxLabel: "มีเลขที่สัญญา",
                                            inputValue: 1,
                                            checked: false,
                                            listeners: {
                                                check: function (combo, newValue) {},
                                            },
                                        }),
                                        {xtype: "tbspacer", width: 7},
                                        new Ext.form.Checkbox({
                                            id: "s_i_booking",
                                            boxLabel: "มีเลขที่ PR",
                                            inputValue: 1,
                                            checked: false,
                                            listeners: {
                                                check: function (combo, newValue) {},
                                            },
                                        }),
                                        {xtype: "tbspacer", width: 7},
                                        new Ext.form.Checkbox({
                                            id: "i_pdf",
                                            boxLabel: "ที่มีเอกสาร PDF",
                                            inputValue: 1,
                                            checked: false,
                                            listeners: {
                                                check: function (combo, newValue) {},
                                            },
                                        }),
                                        {xtype: "tbspacer", width: 0},
                                    ],
                                },
                            ],
                        },
                        {
                            xtype: "buttongroup",
                            columns: 1,
                            // hidden:true,
                            defaults: {scale: "small", style: "float: left"},
                            items: [
                                {
                                    xtype: "buttongroup",
                                    frame: false,
                                    // hidden: true,
                                    items: [
                                        {xtype: "label", text: "สถานะ : "},
                                        {xtype: "tbspacer", width: 82},
                                        {
                                            id: "s_i_status",
                                            xtype: "combo",
                                            width: 100,
                                            mode: "local",
                                            store: new Ext.data.SimpleStore({
                                                fields: ["value", "text"],
                                                data: [
                                                    ["0", "ทั้งหมด"],
                                                    ["1", "1 - ใช้งาน"],
                                                    ["2", "2 - ยกเลิก"],
                                                ],
                                            }),
                                            value: "1",
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
                                    frame: false,
                                    // hidden: true,
                                    items: [
                                        {xtype: "label", text: "วิธีดำเนินงาน : "},
                                        {xtype: "tbspacer", width: 49},
                                        new Ext.form.ComboBox({
                                            mode: "local",
                                            // readOnly:true,
                                            store: Ext.torType,
                                            anchor: "40%",
                                            submitValue: true,
                                            hiddenName: "tor_type_id",
                                            name: "c_type_id",
                                            id: "s_tor_type_idID",
                                            valueField: "id",
                                            // value :0,
                                            displayField: "c_name",
                                            triggerAction: "all",
                                            forceSelection: true,
                                            selectOnFocus: true,
                                            typeAhead: false,
                                            // emptyText: "กรุณาเลือก",
                                            listeners: {
                                                afterrender: function () {
                                                    this.fn = function () {
                                                        // Ext.torType.load({ params: {type: "sp_type_status", i_is_type_tor: true , all :"all"   } });
                                                        // Ext.dc_expense_budget_type_all.load({ params: { dc_cost_acc_id: this.value } });
                                                        // Ext.getCmp("s_tor_type_idID").setValue("all");
                                                        // }ม
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
                                    ],
                                },
                                {
                                    xtype: "buttongroup",
                                    frame: false,
                                    hidden: true,
                                    items: [
                                        {xtype: "label", text: "ส่วนงาน    : "},
                                        {xtype: "tbspacer", width: 6},
                                        new Ext.form.ComboBox({
                                            id: "s_dc_cost_acc_id",
                                            mode: "local",
                                            store: Ext.dc_cost_sys_main_all,
                                            valueField: "id",
                                            readOnly: Ext.session.user_id == 1 ? false : true,
                                            displayField: "c_name",
                                            triggerAction: "all",
                                            forceSelection: true,
                                            // value: 0,
                                            hidden: true,
                                            readOnly: true,
                                            selectOnFocus: true,
                                            typeAhead: false,
                                            emptyText: "กรุณาเลือก...",
                                            width: 250,
                                            listeners: {
                                                render: function (combo) {
                                                    tooltip_ComboBox(combo, "c_name");
                                                },
                                                afterrender: function () {
                                                    this.fn = function () {};
                                                    this.change_set = function () {
                                                        Ext.dc_cost.load({params: {dc_cost_acc_id: this.value, i_read: 4}});
                                                        // Ext.dc_expense_budget_type_all.load({ params: { dc_cost_acc_id: this.value } });
                                                        Ext.getCmp("s_dc_expense_budget_type_id").setValue("0");
                                                    };
                                                },
                                                select: function () {
                                                    this.change_set();
                                                },
                                                Change: function () {
                                                    this.change_set();
                                                    Ext.dc_cost.load({params: {dc_cost_acc_id: this.value, i_read: 4}});
                                                    // Ext.dc_expense_budget_type.load({ params: { dc_cost_acc_id: this.value } });
                                                    Ext.getCmp("s_dc_cost_idID").setValue("");
                                                    // Ext.getCmp("dc_expense_budget_type_id").setValue("");
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
                                    ],
                                },
                                {
                                    xtype: "buttongroup",
                                    frame: false,
                                    // hidden: Ext.session.user_id == 1 ? false : true,
                                    items: [
                                        {xtype: "label", text: "หน่วยงานเจ้าของเรื่อง : "},
                                        {xtype: "tbspacer", width: 5},
                                        new Ext.form.ComboBox({
                                            mode: "local",
                                            store: Ext.dc_cost,
                                            // anchor: "70%",
                                            // readOnly : Ext.session.user_id == 1 ? false : true,
                                            // value: Ext.session.dc_cost_id,
                                            fieldLabel: "หน่วยงานเจ้าของเรื่อง",
                                            valueField: "id",
                                            displayField: "c_name",
                                            hiddenName: "dc_cost_id",
                                            id: "s_dc_cost_idID",
                                            name: "c_cost_name",
                                            triggerAction: "all",
                                            forceSelection: true,
                                            selectOnFocus: true,
                                            typeAhead: false,
                                            emptyText: "กรุณาเลือก...",
                                            width: 250,
                                            validator: function (val) {
                                                if (!Ext.isEmpty(val)) {
                                                    return true;
                                                } else {
                                                    return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                                }
                                            },
                                            listeners: {
                                                render: function (combo) {
                                                    tooltip_ComboBox(combo, "c_name");
                                                },
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
                                    ],
                                },
                                {
                                    xtype: "buttongroup",
                                    frame: false,
                                    // hidden: Ext.session.user_id == 1 ? false : true,
                                    items: [
                                        {xtype: "label", text: "หน่วยงานย่อยเจ้าของเรื่อง : "},
                                        {xtype: "tbspacer", width: 5},
                                        new Ext.form.ComboBox({
                                            mode: "local",
                                            store: Ext.dc_sub_cost,
                                            // anchor: "70%",
                                            // readOnly : Ext.session.user_id == 1 ? false : true,
                                            // value: Ext.session.dc_cost_id,
                                            fieldLabel: "หน่วยงานย่อยเจ้าของเรื่อง",
                                            valueField: "id",
                                            displayField: "c_name",
                                            hiddenName: "dc_sub_cost_id",
                                            id: "s_dc_sub_cost_idID",
                                            name: "c_sub_cost_name",
                                            triggerAction: "all",
                                            forceSelection: true,
                                            selectOnFocus: true,
                                            typeAhead: false,
                                            emptyText: "กรุณาเลือก...",
                                            width: 250,
                                            validator: function (val) {
                                                if (!Ext.isEmpty(val)) {
                                                    return true;
                                                } else {
                                                    return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                                }
                                            },
                                            listeners: {
                                                render: function (combo) {
                                                    tooltip_ComboBox(combo, "c_name");
                                                },
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
                                    ],
                                },
                                {
                                    xtype: "buttongroup",
                                    frame: false,
                                    // hidden: true,
                                    items: [
                                        // {
                                        //   xtype: "buttongroup",
                                        //   fieldLabel: "",
                                        //   height: 22,
                                        //   frame: false,
                                        //   items: [

                                        //   ],
                                        // },
                                        {
                                            xtype: "buttongroup",
                                            fieldLabel: "",
                                            hidden: Ext.I_SUB_STATUS != "-1.00" ? false : true,
                                            height: 22,
                                            frame: false,
                                            items: [
                                                new Ext.form.Checkbox({
                                                    id: "i_showID",
                                                    boxLabel: "",
                                                    inputValue: 1,
                                                    // checked: true,
                                                    listeners: {
                                                        afterrender: function () {},
                                                        check: function (combo, newValue) {
                                                            search();
                                                        },
                                                    },
                                                }),
                                                {xtype: "tbspacer", width: 4},
                                                {xtype: "label", text: " : รายการที่ยังไม่ได้ระบุ KPI"},
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                        // { xtype: "tbfill" },
                        {
                            xtype: "buttongroup",
                            fieldLabel: "",
                            hidden: true,
                            height: 30,
                            frame: false,
                            items: [
                                {
                                    xtype: "buttongroup",
                                    frame: false,
                                    // hidden: true,
                                    items: [
                                        {
                                            xtype: "box",
                                            id: "i_showID3",
                                            inputValue: 1,
                                            autoEl: {
                                                tag: "div",
                                                html: `
                        <label class="switch">
                          <input type="checkbox" id="toggle_my_status" />
                          <span class="slider"></span>
                        </label>
                      `,
                                            },
                                            style: "line-height: 26px; padding: 2px 0;", // เพิ่มความสูง
                                            listeners: {
                                                afterrender: function () {
                                                    Ext.get("toggle_my_status").on("change", function (e) {
                                                        var checked = e.target.checked;
                                                        if (checked) {
                                                            search();
                                                            // console.log('เปิดการแสดงรายการ');
                                                        } else {
                                                            search();
                                                            // console.log('ปิดการแสดงรายการ');
                                                        }
                                                    });
                                                },
                                            },
                                        },
                                        // { xtype: "tbspacer", width: 4 },
                                        {xtype: "label", text: " : แสดงรายการของตัวเอง"},
                                        {
                                            xtype: "box",
                                            id: "i_showID2",
                                            inputValue: 1,
                                            autoEl: {
                                                tag: "div",
                                                html: `
                        <label class="switch">
                          <input type="checkbox" id="toggle_my_status" />
                          <span class="slider"></span>
                        </label>
                      `,
                                            },
                                            style: "line-height: 26px; padding: 2px 0;", // เพิ่มความสูง
                                            listeners: {
                                                afterrender: function () {
                                                    Ext.get("toggle_my_status").on("change", function (e) {
                                                        var checked = e.target.checked;
                                                        if (checked) {
                                                            search();
                                                            // console.log('เปิดการแสดงรายการ');
                                                        } else {
                                                            search();
                                                            // console.log('ปิดการแสดงรายการ');
                                                        }
                                                    });
                                                },
                                            },
                                        },
                                        {xtype: "tbspacer", width: 4},
                                        {xtype: "label", text: " : แสดงรายการของตัวเอง"},
                                    ],
                                },
                            ],
                        },
                        {xtype: "tbfill"},
                        {
                            xtype: "container",
                            items: [
                                {xtype: "container", height: 92},
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
                                            text_ToolTip += "<span style='white-space:nowrap;'><span style='" + style_dot_color + "color: #FEF8C2;'>∎</span>บันทึกรายการสัญญา</span><br>";
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
            {},
            ); //EditorGridPanel or GridPanel
    ///////////////// EditorGridPanel
};
//OnLoad Renderer
Ext.onReady(function () {
    Ext.QuickTips.init();
    Ext.user_right_add = user_right_add;
    Ext.user_right_edit = user_right_edit;
    Ext.user_right_delete = user_right_delete;
    Ext.i_pr_about = 1;
    Ext.ar_pr_about = [];
    Ext.bg_period = []; //ประเภทเงินงวดอุดหนุ่น
    Ext.AppUx("SP", "TOR สมบูรณ์"); //app & show menu
    var App = new Ext.Viewport({
        layout: "border",
        items: new Ext.TabPanel({
            region: "center",
            border: false,
            id: "contenterCenter",
            defaults: {
                autoScroll: true,
                layout: "fit",
            },
            listeners: {
                afterrender: function () {
                    Ext.loadStore("load", false); //status,show
                },
            },
            items: [new gridMain()],
        }),
    });
    Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
    Ext.getCmp("tabpanel1").on("beforeedit", function () {
        return false;
    });
});
