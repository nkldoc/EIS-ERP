
Ext.fnDisMenuEmp = function (is) {
    //1445  Ext.fnDis(Ext.isAudit);
    if (is === false) {
        //                    Ext.getCmp('i_ren_bgTypeID').hide();

        // Ext.getCmp("buttonDtlID").hide();
    } else {
        Ext.getCmp("tabpanel1").getColumnModel(); // .removeColumn(3,true)
    }
    // if (Ext.selectRow.get("i_purchase") > 1)
    //     Ext.getCmp("purchase1ID").hide();
};
var AppPoStore = function (statuss) {
    var comboCost = new Ext.form.ComboBox({
        mode: "local",
        store: Ext.dc_cost,
        anchor: "50%",
        readOnly: true,
        value: Ext.costID,
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
        anchor: "50%",
        readOnly: (Ext.isAudit ? true : false),
        value: Ext.costID,
        fieldLabel: "หน่วยงานเจ้าของเรื่อง",
        valueField: "id",
        id: "dc_cost2_idID",
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
        fieldLabel: "ปีงบประมาณ",
        submitValue: true,
        hiddenName: "i_yyyy",
        name: "i_year",
        id: "i_yyyyID",
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
        },
    });

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
    var statusx = statuss;
    if (statusx == "add") {
        Ext.getCmp("tabpanel1").getSelectionModel().clearSelections();
    }
    Ext.store2 = new Ext.data.JsonStore({
        storeId: "myStore2",
        autoLoad: false,
        url: "tor/api/mnTorController.php",
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
            {name: "f_total_amt"},
            {name: "bg_reserve_money_id"},
            {name: "i_pr_type1"},
            {name: "c_comment_product", type: "string"},
            {name: "c_comment_asset", type: "string"},
            {name: "i_enable", type: "int"},
            {name: "dc_user_create_id"},
            {name: "dc_user_create_cost_id"},
            {name: "d_create"},
            {name: "dc_user_update_id"},
            {name: "dc_user_update_cost_id"},
            {name: "d_update"},
        ],
    });
    /*
     Ext.store22 = new Ext.data.JsonStore({
     storeId: "myStore22",
     autoLoad: false,
     url: "tor/api/mnBookingController.php",
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
     {name: "f_total_amt"},
     {name: "c_comment_product", type: "string"},
     {name: "c_comment_asset", type: "string"},
     {name: "i_enable", type: "int"},
     {name: "dc_user_create_id"},
     {name: "dc_user_create_cost_id"},
     {name: "d_create"},
     {name: "dc_user_update_id"},
     {name: "dc_user_update_cost_id"},
     {name: "d_update"},
     ],
     });
     */

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
                // Ext.getCmp("winPeriodDtlID").getEl().unmask(); 
            },
            failure: function (result, request) {
                Ext.MessageBox.alert("Failed", result.responseText); // connect error
            },
        });
        Ext.getCmp("buttonDtlID").disable();
    }
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
                Ext.getCmp("winDcExpTypeDddID").getEl().unmask();
            },
            failure: function (result, request) {
                Ext.MessageBox.alert("Failed", result.responseText); // connect error
            },
        });
        Ext.getCmp("button" + ii).disable();
    }

    function genBooklink2(v, i, id) {
        var ii = i;
        var ip = Ext.session.ip_booking; // 192
        // var ip = "localhost"; // 192
        var type_pr = Ext.selectSelft.get("i_pr_type1");
        if (type_pr == null) {
            type_pr = Ext.getCmp("i_pr_type1_dtl_ID").getValue().inputValue;
            Ext.Ajax.request({
                url: "tor/api/mnTorController.php",
                method: "POST",
                params: {
                    mode: "UP_TYPE_PR",
                    id: Ext.selectRow.get("id"),
                    type: i,
                    i_type_pr: type_pr,
                    dc_expense_budget_type: Ext.selectSelft.get("dc_expense_budget_type_id"),
                    f_total: v.replace(/,/g, "") / 1,
                    buy: 2
                },
                success: function (result, request) {
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
                "http://" +
                ip +
                "/api-nmu/?/bg/mn_BgReserveMoney/mode/POST" +
                "/i_sys/1" +
                "/pr_id/" +
                Ext.selectRow.get("id") +
                "/po_id/0" +
                "/chk_id/0" +
                "/i_year/" +
                Ext.selectRow.get("i_yyyy") +
                "/i_pr_type/" +
                type_pr + //  plan or period
                "/i_reserve/1" + // step 1 PR step 2 po step3 checking
                "/dc_cost_id/" +
                Ext.selectRow.get("dc_cost_id") +
                "/dc_budget_type_id/" +
                Ext.selectSelft.get("dc_expense_budget_type_id") +
                "/bg_expense_id/" +
                Ext.selectSelft.get("po_expense_id") +
                "/i_last/1" +
                "/f_amt/" +
                v;

        var link2 =
                "http://" +
                ip +
                "/api-nmu/?/bg/BgBudgetAllSupplies" +
                "/i_year/" +
                Ext.selectRow.get("i_yyyy") +
                "/dc_budget_type_id/" +
                Ext.selectSelft.get("dc_expense_budget_type_id") +
                "/dc_cost_id/" +
                Ext.selectRow.get("dc_cost_id") +
                "/bg_expense_id/" +
                Ext.selectSelft.get("po_expense_id");
        // console.log(link2);
        // return false;
        Ext.Ajax.request({
            url: link2,
            method: "GET", //POST
            disableCaching: false,
            success: function (result, request) {
                var jsonData = Ext.util.JSON.decode(result.responseText); //decode json

                if (jsonData.totalCount > 0) {
                    var f_amt = 0;
                    var cheVal = v.replace(/,/g, "") / 1;
                    if (type_pr == 1) {
                        f_amt = parseFloat(jsonData.data[0].f_total_plan);
                    } else {
                        f_amt = parseFloat(jsonData.data[0].f_total_dtl);
                    }
                    //                              console.log(jsonData);
                    //                             console.log(f_amt);
                    //                             console.log(cheVal);
                    //                     return false ;
                    if (f_amt >= cheVal) {
                        Ext.Ajax.request({
                            url: link,
                            method: "GET", //POST
                            disableCaching: false,
                            success: function (result, request) {
                                var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                                //                    console.log(jsonData);
                                if (jsonData.success) {
                                    Ext.MessageBox.alert("Success", "ทำการเรียบร้อยแล้ว", function () {
                                        //update where id
                                        purchase1(Ext.selectSelft.get("id"), jsonData.bg_reserve_money_id, ii);
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

                        Ext.MessageBox.alert("Success", "เงินไม่พอที่จะจอง กรุณาติดต่อฝ่ายคลังงบประมาณ", function () {
                            // Ext.getCmp("winPeriodDtlID").getEl().unmask(); 
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

    function SubsidyCheck(v, i) {
        Ext.storeSumSubsidy = new Ext.data.JsonStore({
            storeId: "myStore3",
            // autoLoad: true,
            url: "tor/api/mnTorController.php",
            root: "data",
            baseParams: {
                mode: "SumSubsidy",
                po_expense_id: Ext.selectRow.data.po_expense_id,
                dc_expense_budget_type_id: Ext.selectRow.data.dc_expense_budget_type_id
            }, //Permission i_read
            idProperty: "id",
            totalProperty: "totalCount",
            fields: [
                {name: "po_expense_id"},
                {name: "po_expense"},
                {name: "dc_expense_budget_type_id"},
                {name: "dc_expense_budget_type"},
                {name: "Sum_total"},
                {name: "Sum_total2"},
            ],
        });
        var ii = i;
        var i_type = "dc_expense_budget_type_id";
        if (i === 1) {
            i_type = "dc_expense_budget_type_id";
        } else {
            i_type = "dc_expense_budget_type" + i + "_id";
        }
        var pr_type = "i_pr_type" + i;
        var ip = Ext.session.ip_booking; // 192
        // var ip = "localhost"; // 192
        var link =
                "http://" +
                ip +
                "/api-nmu/?/bg/BgBudgetAllSupplies" +
                "/i_year/" +
                Ext.selectRow.get("i_yyyy") +
                "/dc_budget_type_id/" +
                Ext.selectRow.get(i_type) +
                "/dc_cost_id/" +
                Ext.selectRow.get("dc_cost_id") +
                "/bg_expense_id/" +
                Ext.selectRow.get("po_expense_id");
        Ext.Ajax.request({
            url: link,
            method: "GET", //POST
            disableCaching: false,
            success: function (result, request) {
                var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                if (jsonData.totalCount > 0) {
                    var f_amt = 0;
                    var cheVal = v.replace(/,/g, "") / 1;
                    if (Ext.selectRow.get(pr_type) == 1) {
                        f_amt = parseFloat(jsonData.data[0].f_total_plan);
                    } else {
                        f_amt = parseFloat(jsonData.data[0].f_total_dtl);
                    }
                    Ext.storeSumSubsidy.setBaseParam();
                    Ext.storeSumSubsidy.load({
                        callback: function (record, operation, success) {
                            if (success) {
                                var rec = record[0];
                                if (rec == null || rec == "undefined") {
                                    var Subsidy = null;
                                } else {
                                    var Subsidy = rec.data.Sum_total;
                                }
                                var sum_cheVal = Subsidy + cheVal
                                // alert(sum_cheVal)
                                // alert(f_amt)
                                if (f_amt >= sum_cheVal) {
                                    Ext.MessageBox.alert("แจ้งเตือน", "เงินรอจองมีเพียงพอ สามารถทำรายการต่อได้"); // alert massage error
                                    Ext.getCmp("winBg_Check_MoneyID").getEl().unmask();
                                } else {
                                    Ext.MessageBox.alert("แจ้งเตือน", "เงินงบประมาณไม่พอ", function () {
                                        Ext.getCmp("winBg_Check_MoneyID").getEl().unmask();
                                    });
                                }
                            }
                        }
                    });
                } else {
                    Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                }
            },
            failure: function (result, request) {
                Ext.MessageBox.alert("Failed", result.responseText); // connect error
            },
        });
        // return link;
    }

    function genBooklink(v, i) {
        var ii = i;
        var i_type = "dc_expense_budget_type_id";
        if (i === 1) {
            i_type = "dc_expense_budget_type_id";
        } else {
            i_type = "dc_expense_budget_type" + i + "_id";
        }
        var pr_type = "i_pr_type" + i;
        var dc_expense_budget_type = Ext.selectRow.get(i_type);
        var i_type_pr = Ext.selectRow.get(pr_type);
        var ip = Ext.session.ip_booking; // 192
        if (i_type_pr == null || dc_expense_budget_type == null) {
            var i_type_pr = null
            if (i == 1) {
                i_type_pr = Ext.getCmp("i_pr_type1ID").getValue().inputValue;
                dc_expense_budget_type = Ext.getCmp("dc_expense_budget_type_id1TxtID").getValue();
            } else if (i == 2) {
                i_type_pr = Ext.getCmp("i_pr_type2ID").getValue().inputValue;
                dc_expense_budget_type = Ext.getCmp("dc_expense_budget_type2_idTxtID").getValue();
            } else {
                i_type_pr = Ext.getCmp("i_pr_type3ID").getValue().inputValue;
                dc_expense_budget_type = Ext.getCmp("dc_expense_budget_type3_idTxtID").getValue();
            }
            Ext.Ajax.request({
                url: "tor/api/mnTorController.php",
                method: "POST",
                params: {
                    mode: "UP_TYPE_PR",
                    id: Ext.selectRow.get("id"),
                    type: i,
                    i_type_pr: i_type_pr,
                    dc_expense_budget_type: dc_expense_budget_type,
                    f_total: v.replace(/,/g, "") / 1,
                    buy: 1
                },
                success: function (result, request) {
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
                "http://" +
                ip +
                "/api-nmu/?/bg/mn_BgReserveMoney/mode/POST" +
                "/i_sys/1" +
                "/pr_id/" +
                Ext.selectRow.get("id") +
                "/po_id/0" +
                "/chk_id/0" +
                "/i_year/" +
                Ext.selectRow.get("i_yyyy") +
                "/i_pr_type/" +
                i_type_pr + //  plan or period
                "/i_reserve/1" + // step 1 PR step 2 po step3 checking
                "/dc_cost_id/" +
                Ext.selectRow.get("dc_cost_id") +
                "/dc_budget_type_id/" +
                dc_expense_budget_type +
                // Ext.selectRow.get(i_type) +
                "/bg_expense_id/" +
                Ext.selectRow.get("po_expense_id") +
                "/i_last/1" +
                "/f_amt/" +
                v;

        var link2 =
                "http://" +
                ip +
                "/api-nmu/?/bg/BgBudgetAllSupplies" +
                "/i_year/" +
                Ext.selectRow.get("i_yyyy") +
                "/dc_budget_type_id/" +
                dc_expense_budget_type +
                // Ext.selectRow.get(i_type) +
                "/dc_cost_id/" +
                Ext.selectRow.get("dc_cost_id") +
                "/bg_expense_id/" +
                Ext.selectRow.get("po_expense_id");
        // console.log(link2);
        // return false;
        Ext.Ajax.request({
            url: link2,
            method: "GET", //POST
            disableCaching: false,
            success: function (result, request) {
                var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                if (jsonData.totalCount > 0) {
                    var f_amt = 0;
                    var cheVal = v.replace(/,/g, "") / 1;
                    if (i_type_pr == 1) {
                        f_amt = parseFloat(jsonData.data[0].f_total_plan);
                    } else {
                        f_amt = parseFloat(jsonData.data[0].f_total_dtl);
                    }
                    if (f_amt >= cheVal) {
                        Ext.Ajax.request({
                            url: link,
                            method: "GET", //POST
                            disableCaching: false,
                            success: function (result, request) {
                                var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                                if (jsonData.success) {
                                    Ext.MessageBox.alert("Success", "ทำการเรียบร้อยแล้ว", function () {
                                        purchase2(Ext.selectRow.get("id"), jsonData.bg_reserve_money_id, ii);
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
                        Ext.MessageBox.alert("Success", "เงินไม่พอที่จะจอง กรุณาติดต่อฝ่ายคลังงบประมาณ", function () {
                            Ext.getCmp("winDcExpTypeDddID").getEl().unmask();
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

    function bgBagedType() {

        return new Ext.Window({
            id: "winDcExpTypeDddID",
            modal: true,
            width: 850,
            //                height: 430,
            title: "เพิ่มแหล่งเงินที่จัดจ้าง",
            layout: "form",
            items: new Ext.FormPanel({
                frame: true,
                labelWidth: 140,
                padding: "10px 10px 10px 10px",
                url: "tor/api/mnBgExpenseController.php",
                id: "formDcExpTypeDddID",
                items: [
                    {
                        xtype: "hidden",
                        name: "tor_id",
                        id: "tor_id",
                        value: Ext.getCmp("torHdrID").getValue(),
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
                        fieldLabel: "จำนวนเงินจากแหล่งเงิน",
                        frame: false,
                        border: false,
                        items: [
                            {
                                xtype: "textfield",
                                fieldLabel: "จำนวนเงินจากแหล่งเงิน",
                                name: "f_type_amt",
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
                                text: "* บันทึกรายการจอง1",
                                id: "button1",
                                disabled: Ext.isAudit === false || Ext.selectRow.get("bg_reserve_money1_id") > 0 ? true : false,
                                handler: function () {
                                    var msg = "";
                                    if (Ext.getCmp("i_pr_type1ID").getValue() == null) {
                                        msg += "- เลือกประเภทการจองก่อนกดปุ่ม" + "\n"
                                    }
                                    if ([null, 0, ""].includes(Ext.getCmp("f_type_amtID").getValue())) {
                                        msg += "- กรุณากรอกจำนวนเงิน" + "\n"
                                    }
                                    if ([null, 0, ""].includes(Ext.getCmp("dc_expense_budget_type_id1TxtID").getValue())) {
                                        msg += "- กรุณาเลือกแหล่งเงิน" + "\n"
                                    }
                                    if (msg != "") {
                                        Ext.example.msg("แจ้งเตือน", msg, 1);
                                        $(this).next("text copied");
                                        setTimeout(function () {
                                            $(this).next().remove();
                                        }, 6000);
                                        return;
                                    } else {
                                        Ext.getCmp("winDcExpTypeDddID").getEl().mask("Please wait...", "x-mask-loading");
                                        this.setDisabled(true);
                                        genBooklink(Ext.getCmp("f_type_amtID").getValue(), 1);
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
                    new Ext.form.ComboBox({
                        mode: "local",
                        store: Ext.dc_expense_budget_type,
                        fieldLabel: "แหล่งเงินที่ 2",
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
                        border: false,
                        items: [
                            {
                                xtype: "textfield",
                                fieldLabel: "จำนวนเงินจากแหล่งเงิน 2",
                                name: "f_type2_amt",
                                id: "f_type2_amtID",
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
                                text: "* บันทึกรายการจอง2",
                                id: "button2",
                                disabled: Ext.isAudit === false || Ext.selectRow.get("bg_reserve_money2_id") > 0 ? true : false,
                                handler: function () {
                                    var msg = "";
                                    if (Ext.getCmp("i_pr_type2ID").getValue() == null) {
                                        msg += "- เลือกประเภทการจองก่อนกดปุ่ม" + "\n"
                                    }
                                    if ([null, 0, ""].includes(Ext.getCmp("f_type2_amtID").getValue())) {
                                        msg += "- กรุณากรอกจำนวนเงิน" + "\n"
                                    }
                                    if ([null, 0, ""].includes(Ext.getCmp("dc_expense_budget_type2_idTxtID").getValue())) {
                                        msg += "- กรุณากรอกจำนวนเงิน" + "\n"
                                    }
                                    if (msg != "") {
                                        Ext.example.msg("แจ้งเตือน", msg, 1);
                                        $(this).next("text copied");
                                        setTimeout(function () {
                                            $(this).next().remove();
                                        }, 6000);
                                        return;
                                    } else {
                                        Ext.getCmp("winDcExpTypeDddID").getEl().mask("Please wait...", "x-mask-loading");
                                        this.setDisabled(true);
                                        genBooklink(Ext.getCmp("f_type2_amtID").getValue(), 2);
                                    }
                                },
                            },
                            {
                                xtype: "radiogroup",
                                columns: [98, 98],
                                fieldLabel: "ขอดำเนินการ",
                                id: "i_pr_type2ID",
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
                        border: false,
                        items: [
                            {
                                xtype: "textfield",
                                fieldLabel: "จำนวนเงินจากแหล่งเงิน 3",
                                name: "f_type3_amt",
                                id: "f_type3_amtID",
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
                                text: "* บันทึกรายการจอง3",
                                id: "button3",
                                disabled: Ext.isAudit === false || Ext.selectRow.get("bg_reserve_money3_id") > 0 ? true : false,
                                handler: function () {
                                    var msg = "";
                                    if (Ext.getCmp("i_pr_type3ID").getValue() == null) {
                                        msg += "- เลือกประเภทการจองก่อนกดปุ่ม" + "\n"
                                    }
                                    if ([null, 0, ""].includes(Ext.getCmp("f_type3_amtID").getValue())) {
                                        msg += "- กรุณากรอกจำนวนเงิน" + "\n"
                                    }
                                    if ([null, 0, ""].includes(Ext.getCmp("dc_expense_budget_type3_idTxtID").getValue())) {
                                        msg += "- กรุณากรอกจำนวนเงิน" + "\n"
                                    }
                                    if (msg != "") {
                                        Ext.example.msg("แจ้งเตือน", msg, 1);
                                        $(this).next("text copied");
                                        setTimeout(function () {
                                            $(this).next().remove();
                                        }, 6000);
                                        return;
                                    } else {
                                        Ext.getCmp("winDcExpTypeDddID").getEl().mask("Please wait...", "x-mask-loading");
                                        this.setDisabled(true);
                                        genBooklink(Ext.getCmp("f_type3_amtID").getValue(), 3);
                                    }
                                },
                            },
                            {
                                xtype: "radiogroup",
                                columns: [98, 98],
                                fieldLabel: "ขอดำเนินการ",
                                id: "i_pr_type3ID",
                                name: "i_pr_type3",
                                items: [
                                    {
                                        //  checked: true,
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
                ],
                buttons: [
                    {
                        text: "บันทึกแหล่งเงิน",
                        id: "buttons_bg_reserve",
                        disabled: (Ext.selectRow.get("bg_reserve_money1_id") != null),
                        handler: function () {
                            var form = Ext.getCmp("formDcExpTypeDddID").getForm();
                            var f_sum1 = Ext.getCmp("f_type_amtID").getValue() == '' ? 0.00 : Number.parseFloat(Ext.getCmp("f_type_amtID").getValue().replace(/,/g, "")).toFixed(2);
                            var f_sum2 = Ext.getCmp("f_type2_amtID").getValue() == '' ? 0.00 : Number.parseFloat(Ext.getCmp("f_type2_amtID").getValue().replace(/,/g, "")).toFixed(2);
                            var f_sum3 = Ext.getCmp("f_type3_amtID").getValue() == '' ? 0.00 : Number.parseFloat(Ext.getCmp("f_type3_amtID").getValue().replace(/,/g, "")).toFixed(2);
                            var f_total_amt = Ext.getCmp("f_totalID").getValue() == '' ? 0.00 : Number.parseFloat(Ext.getCmp("f_totalID").getValue().replace(/,/g, "")).toFixed(2);
                            var sum = parseFloat(f_sum1) + parseFloat(f_sum2) + parseFloat(f_sum3)
                            var msg = "";
                            if (parseFloat(sum) == parseFloat(f_total_amt)) {
                                form.submit({
                                    waitMsg: "Saving Data...",
                                    success: function (form, action) {
                                        Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                            Ext.getCmp("winDcExpTypeDddID").destroy();
                                            Ext.getCmp("winChequeID").destroy();
                                            Ext.getCmp("winMain").destroy();
                                            Ext.storeDtl.reload();
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
                            } else {
                                Ext.Msg.alert("แจ้งเตือน", "ยอดเงินไม่ตรงกับPR", function (bu, action) {
                                    return false;
                                });
                            }

                        },
                    },
                    {
                        text: "Cancel",
                        handler: function () {
                            Ext.getCmp("winDcExpTypeDddID").destroy();
                            Ext.storeDtl.reload();
                            //                                Ext.getCmp("winChequeID").destroy();
                            //                                Ext.getCmp("winMain").destroy();
                        },
                    },
                ],
            }),
        });
    }
    function Bg_Check_Money() {
        return new Ext.Window({
            id: "winBg_Check_MoneyID",
            modal: true,
            width: 850,
            //                height: 430,
            title: "เพิ่มแหล่งเงินที่จัดจ้าง",
            layout: "form",
            items: new Ext.FormPanel({
                frame: true,
                labelWidth: 140,
                padding: "10px 10px 10px 10px",
                url: "tor/api/mnBgExpenseController.php",
                id: "formBg_Check_MoneyID",
                items: [
                    {
                        xtype: "hidden",
                        name: "tor_id",
                        id: "tor_id",
                        value: Ext.getCmp("torHdrID").getValue(),
                    },
                    new Ext.form.ComboBox({
                        mode: "local",
                        store: Ext.dc_expense_budget_type,
                        fieldLabel: "แหล่งเงินที่ 1",
                        anchor: "60%",
                        submitValue: true,
                        id: "dc_expense_budget_type_idTxtID1",
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
                        fieldLabel: "จำนวนเงินจากแหล่งเงิน",
                        frame: false,
                        border: false,
                        items: [
                            {
                                xtype: "textfield",
                                fieldLabel: "จำนวนเงินจากแหล่งเงิน",
                                name: "f_type_amt",
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
                                xtype: 'button',
                                fieldLabel: "เช็คเงินอุดหนุน",
                                text: 'เช็คเงินอุดหนุน',
                                name: 'prToWithDraw',
                                id: 'prToWithDrawID',
                                listeners: {
                                    afterrender: function () {
                                    }
                                },
                                handler: function () {
                                    if (Ext.selectRow.get("dc_expense_budget_type_id") == null) {
                                        Ext.Msg.alert("แจ้งเตือน", "คุณยังไม่ได้เลือกแหล่งเงิน");
                                        return false;
                                    } else if (Ext.selectRow.get("po_expense_id") == null) {
                                        Ext.Msg.alert("แจ้งเตือน", "คุณยังไม่ได้เลือกหมวดค่าใช้จ่าย");
                                        return false;
                                    } else {
                                        Ext.getCmp("winBg_Check_MoneyID").getEl().mask("Please wait...", "x-mask-loading");
                                        SubsidyCheck(Ext.getCmp("f_type_amtID").getValue(), 1);
                                    }
                                }
                            },
                            {
                                xtype: "tbspacer",
                                width: 25,
                            },
                            {
                                xtype: "radiogroup",
                                columns: [98, 98],
                                fieldLabel: "ขอดำเนินการ",
                                id: "i_pr_typeID",
                                name: "i_pr_type1",
                                items: [
                                    /*{
                                     // checked: true,
                                     name: "i_pr_type1",
                                     inputValue: 1,
                                     boxLabel: "จองแบบแผน",
                                     },*/
                                    {
                                        inputValue: 2,
                                        name: "i_pr_type1",
                                        // checked :true,
                                        boxLabel: "จองแบบงวด",
                                    },
                                ], //radiogroup
                            },
                        ],
                    },
                    new Ext.form.ComboBox({
                        mode: "local",
                        store: Ext.dc_expense_budget_type,
                        fieldLabel: "แหล่งเงินที่ 2",
                        anchor: "60%",
                        submitValue: true,
                        id: "dc_expense_budget_type2_idTxtID2",
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
                        border: false,
                        items: [
                            {
                                xtype: "textfield",
                                fieldLabel: "จำนวนเงินจากแหล่งเงิน 2",
                                name: "f_type2_amt",
                                id: "f_type2_amtID",
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
                                xtype: 'button',
                                fieldLabel: "เช็คเงินอุดหนุน",
                                text: 'เช็คเงินอุดหนุน',
                                name: 'prToWithDraw2',
                                id: 'prToWithDrawID2',
                                listeners: {
                                    afterrender: function () {
                                    }
                                },
                                handler: function () {
                                    if (Ext.selectRow.get("dc_expense_budget_type_id") == null) {
                                        Ext.Msg.alert("แจ้งเตือน", "คุณยังไม่ได้เลือกแหล่งเงิน");
                                        return false;
                                    } else if (Ext.selectRow.get("po_expense_id") == null) {
                                        Ext.Msg.alert("แจ้งเตือน", "คุณยังไม่ได้เลือกหมวดค่าใช้จ่าย");
                                        return false;
                                    } else {
                                        Ext.getCmp("winBg_Check_MoneyID").getEl().mask("Please wait...", "x-mask-loading");
                                        SubsidyCheck(Ext.getCmp("f_type_amtID").getValue(), 1);
                                    }
                                }
                            },
                            {
                                xtype: "tbspacer",
                                width: 25,
                            },
                            {
                                xtype: "radiogroup",
                                columns: [98, 98],
                                fieldLabel: "ขอดำเนินการ",
                                id: "i_pr_type2ID",
                                name: "i_pr_type2",
                                items: [
                                    // {
                                    //     //  checked: true,
                                    //     name: "i_pr_type2",
                                    //     inputValue: 1,
                                    //     boxLabel: "จองแบบแผน",
                                    // },
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
                        anchor: "60%",
                        submitValue: true,
                        id: "dc_expense_budget_type3_idTxtID3",
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
                        border: false,
                        items: [
                            {
                                xtype: "textfield",
                                fieldLabel: "จำนวนเงินจากแหล่งเงิน 3",
                                name: "f_type3_amt",
                                id: "f_type3_amtID",
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
                                xtype: 'button',
                                fieldLabel: "เช็คเงินอุดหนุน",
                                text: 'เช็คเงินอุดหนุน',
                                name: 'prToWithDraw3',
                                id: 'prToWithDrawID3',
                                listeners: {
                                    afterrender: function () {
                                    }
                                },
                                handler: function () {
                                    if (Ext.selectRow.get("dc_expense_budget_type_id") == null) {
                                        Ext.Msg.alert("แจ้งเตือน", "คุณยังไม่ได้เลือกแหล่งเงิน");
                                        return false;
                                    } else if (Ext.selectRow.get("po_expense_id") == null) {
                                        Ext.Msg.alert("แจ้งเตือน", "คุณยังไม่ได้เลือกหมวดค่าใช้จ่าย");
                                        return false;
                                    } else {
                                        Ext.getCmp("winBg_Check_MoneyID").getEl().mask("Please wait...", "x-mask-loading");
                                        SubsidyCheck(Ext.getCmp("f_type_amtID").getValue(), 1);
                                    }
                                }
                            },
                            {
                                xtype: "tbspacer",
                                width: 25,
                            },
                            {
                                xtype: "radiogroup",
                                columns: [98, 98],
                                fieldLabel: "ขอดำเนินการ",
                                id: "i_pr_type3ID",
                                name: "i_pr_type3",
                                items: [
                                    {
                                        inputValue: 2,
                                        name: "i_pr_type3",
                                        boxLabel: "จองแบบงวด",
                                    },
                                ], //radiogroup
                            },
                        ],
                    },
                ],
                buttons: [
                    {
                        text: "บันทึกแหล่งเงิน",
                        id: "buttons_bg_reserve2",
                        disabled: (Ext.selectRow.get("bg_reserve_money1_id") != null),
                        handler: function () {
                            var form = Ext.getCmp("formBg_Check_MoneyID").getForm();

                            var f_sum1 = Ext.getCmp("f_type_amtID").getValue() == '' ? 0.00 : Number.parseFloat(Ext.getCmp("f_type_amtID").getValue().replace(/,/g, "")).toFixed(2);
                            var f_sum2 = Ext.getCmp("f_type2_amtID").getValue() == '' ? 0.00 : Number.parseFloat(Ext.getCmp("f_type2_amtID").getValue().replace(/,/g, "")).toFixed(2);
                            var f_sum3 = Ext.getCmp("f_type3_amtID").getValue() == '' ? 0.00 : Number.parseFloat(Ext.getCmp("f_type3_amtID").getValue().replace(/,/g, "")).toFixed(2);
                            var f_total_amt = Ext.getCmp("f_totalID").getValue() == '' ? 0.00 : Number.parseFloat(Ext.getCmp("f_totalID").getValue().replace(/,/g, "")).toFixed(2);
                            var sum = parseFloat(f_sum1) + parseFloat(f_sum2) + parseFloat(f_sum3)
                            var msg = "";
                            if (parseFloat(sum) == parseFloat(f_total_amt)) {
                                form.submit({
                                    waitMsg: "Saving Data...",
                                    success: function (form, action) {
                                        // Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                        // Ext.getCmp("winBg_Check_MoneyID").destroy();
                                        // Ext.getCmp("winChequeID").destroy();
                                        // // Ext.getCmp("winMain").destroy();
                                        // Ext.storeDtl.reload();
                                        // });
                                        Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                            Ext.storeDtl.reload({
                                                callback: function (record, operation, success) {
                                                    if (success) {
                                                        Ext.each(record, function (value) {
                                                            if (Ext.selectRow.id === value.get('id')) {
                                                                Ext.selectRow = value;
                                                                Ext.getCmp("winBg_Check_MoneyID").destroy();
                                                                Ext.getCmp("winChequeID").destroy();
                                                                Ext.getCmp("winMain").destroy();
                                                                Ext.storeDtl.reload();
                                                                Ext.buAct = "update";
                                                                Ext.loadStore("edit", true);
                                                            } else if (Ext.selectRow.get("id") === value.get('id')) {
                                                                Ext.getCmp("tabpanel1").getStore().reload();
                                                                Ext.getCmp("winMain").destroy();
                                                            }
                                                        });
                                                        // Ext.getCmp("winMain").destroy();
                                                    }

                                                }
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
                            } else {
                                Ext.Msg.alert("แจ้งเตือน", "ยอดเงินไม่ตรงกับPR", function (bu, action) {
                                    return false;
                                });
                            }

                        },
                    },
                    {
                        text: "Cancel",
                        handler: function () {
                            Ext.getCmp("winBg_Check_MoneyID").destroy();
                            Ext.storeDtl.reload();
                            //                                Ext.getCmp("winChequeID").destroy();
                            //                                Ext.getCmp("winMain").destroy();
                        },
                    },
                ],
            }),
        });
    }

    var disp = false ? "displayfield" : "textfield";

    if (!Ext.isEmpty(Ext.getCmp("winChequeID"))) {
        Ext.getCmp("winChequeID").destroy();
    }


    var modeSave = {
        xtype: "radiogroup",
        columns: [280],
        fieldLabel: "การตรวจสอบ",
        hidden: true,
        id: "i_is_registerID",
        style: {
            "font-weight": "bold",
        },
        items: [
            {
                name: "i_is_register",
                // checked: true,
                width: 100,
                inputValue: 0,
                boxLabel: "อัพเดทยังไม่ผ่ายรายการ",
            },
            {
                name: "i_is_register",
                checked: true,
                width: 100,
                inputValue: 1,
                boxLabel: "อัพเดทพร้อมผ่านรายการ",
            },
        ],
    };

    Ext.menu_i_alarm = Ext.selectRow.get('i_alarm');
    Ext.menu_i_day = Ext.selectRow.get('i_day');
    return new Ext.Window({
        collapsible: true,
        maximizable: true,
        title: "บันทึก PR",
        id: "winMain",
        width: Ext.getCmp("contenterCenter").getWidth() - 5,
        height: Ext.getCmp("contenterCenter").getHeight() - 5,
        layout: "fit",
        modal: true,
        plain: true,
        bodyStyle: "padding:1px;",
        buttonAlign: "center",
        listeners: {
            //WindowResize
            beforerender: function () {
//                this.onWindowResize = function () { 
//                    Ext.getCmp("tabpanelMain2ID").setHeight(Ext.getCmp("winMain").getSize().height - 105);
//                };
            },
            afterrender: function () {
                Ext.getCmp('tabpanel1').getEl().unmask(); Ext.application.setHideName('buDarf',Ext.selectRow.get('i_is_register')?1:0); Ext.application.afterRender(this);
            }
        },
        items: [
            {
                xtype: "tabpanel",
                activeTab: 0,
                id: "winChequeID",
                // defaults: {autoHeight: true, bodyStyle: 'padding:10px'},
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
                                // 
                                // Ext.getCmp('dc_expense_budget_type_hdr_id').getStore().reload({
                                //     callback: function (records, operation, success) { 
                                //         Ext.getCmp('dc_expense_budget_type_hdr_id').fn();
                                //     }
                                // });

                            }
                        },
                        items: [
                            {
                                layout: "column",
                                border: false,
                                items: [
                                    {
                                        columnWidth: 0.9,
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
                                            },
                                            {
                                                xtype: "hidden", //textfield
                                                name: "sp_emp_id",
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
                                                anchor: "50%",
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
                                                fieldLabel: "รหัส PR",
                                                id: "codeHdrID",
                                                style: "text-align: center;font-weight:bold;background:#eee;",
                                                readOnly: true,
                                                name: "c_code",
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
                                                            Ext.getCmp('c_nameID').setValue(Ext.getCmp('c_name_hdr_id').getValue());
                                                        };
                                                    },
                                                },
                                            },
                                            comboUsedBgYear,
                                            comboCost,
                                            comboCost2,
                                            {
                                                fieldLabel: "หน่วยงานย่อย",
                                                emptyText: "*ถ้ามี",
                                                xtype: "textfield",
                                                name: "txtsub_cost",
                                                id: "txtsub_costID",

                                            },
                                            {
                                                fieldLabel: "tag search",
                                                xtype: "textfield",
                                                name: "tag",
                                                // hidden: true,
                                                id: "txttagID",
                                            },
                                            {
                                                xtype: "buttongroup",
                                                fieldLabel: "วันที่",
                                                frame: false,
                                                border: false,
                                                items: [
                                                    {
                                                        xtype: "datefield",
                                                        name: "d_tor_date",
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
                                            new Ext.form.ComboBox({
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
                                            }),
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
                                                                        Ext.getCmp("lableLessID").setValue(Ext.tor_type_idTxt.tor_type_id1[Ext.i_is_more]);
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
                                                xtype: "hidden", //textfield hidden
                                                name: "i_is_more",
                                                id: "islessID", //i_is_more
                                            },
                                            {
                                                xtype: "radiogroup",
                                                columns: [98, 98, 98],
                                                fieldLabel: "การดำเนินงาน",
                                                id: "i_purchaseID",
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
                                                        this.fn = function () {
//                                                                 if (Ext.getCmp("i_purchaseID").getValue().inputValue == 1) {
//                                                                     this.hide();
//                                                                 } else {
// //                                                                    alert(Ext.i_bg_type);
//                                                                     if(Ext.i_bg_type){
//                                                                         this.hide();
//                                                                     }else{
//                                                                         this.show();
//                                                                     } 
//                                                                 }
                                                        };
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
                                                            if (i == 3)
                                                                this.hide();
                                                            else
                                                                this.show();
                                                        };
                                                        this.fn(Ext.getCmp("i_purchaseID").getValue().inputValue);
                                                    },
                                                },
                                            },
                                            {
                                                xtype: disp,
                                                fieldLabel: "รหัสเอกสารอ้างอิง",
                                                name: "d_doc_ref",
                                                id: "i_type_fix_rateGb",
                                                listeners: {
                                                    beforerender: function () {
                                                        this.fn = function () {
                                                            //i_type_contract
                                                            //
                                                            // Ext.getCmp("i_ren_bgTypeID").fn();
                                                            if (Ext.getCmp("i_purchaseID").getValue().inputValue == 1) {
                                                                Ext.getCmp("i_type_contract2").show(); //
                                                                Ext.getCmp("i_type_contract3").show(); //
                                                                Ext.getCmp("i_product_typeID").show(); // ของที่ได้มา
                                                                Ext.getCmp("i_product_type2").show();
                                                                // Ext.getCmp("i_is_invGID").show();
                                                                Ext.getCmp("i_product_type0").hide();
                                                            } else if (Ext.getCmp("i_purchaseID").getValue().inputValue == 2) {
                                                                Ext.getCmp("i_type_contract2").show();
                                                                Ext.getCmp("i_product_typeID").show(); // ของที่ได้มา
                                                                Ext.getCmp("i_product_type0").show();
                                                                // Ext.getCmp("i_is_invGID").show();
                                                                Ext.getCmp("i_type_contract3").hide();
                                                            } else if (Ext.getCmp("i_purchaseID").getValue().inputValue == 3) {
                                                                Ext.getCmp("i_type_contract2").hide();
                                                                Ext.getCmp("i_type_contract3").hide();
                                                                Ext.getCmp("i_product_typeID").hide();
                                                                // Ext.getCmp("i_is_invGID").hide();

                                                                //Ext.getCmp('i_product_type0').setValue(true);

                                                                Ext.getCmp("i_type_contract1").setValue(true);
                                                            }
                                                            // alert(Ext.getCmp('i_purchaseID').getValue().inputValue);
                                                        };
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
                                                xtype: "datefield",
                                                fieldLabel: "วันที่เอกสารอ้างอิง",
                                                name: "d_doc_date",
                                            },
                                            {
                                                fieldLabel: "หมายเหตุ",
                                                xtype: "textarea",
                                                name: "c_comment",
                                                id: "c_commentID",
                                                width: 250,
                                            },
                                            {
                                                xtype: "box",
                                                autoEl: {tag: "hr"},
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
                                                xtype: "box",
                                                autoEl: {tag: "hr"},
                                            },
                                            Ext.getBodyMultiBudget(Ext.selectRow, 'st0004'),
                                            {
                                                xtype: "radiogroup",
                                                columns: [180],
                                                checked: false,
                                                fieldLabel: "โหมดการบันทึก",
                                                hidden: true,
                                                id: "modesubID2",
                                                style: {
                                                    "font-weight": "bold",
                                                },
                                                items: [
                                                    {
                                                        name: "mode_2",
                                                        checked: true,
                                                        inputValue: "UPDATEFORMSTSATUS",
                                                        boxLabel: "อัพเดทรายการ",
                                                    },
                                                ],
                                            },
                                            {
                                                xtype: "box",
                                                autoEl: {tag: "hr"},
                                            },
                                            modeSave,
                                            {
                                                xtype: "box",
                                                autoEl: {tag: "hr"},
                                                hidden: Ext.isAudit ? false : true,

                                            },
                                            {
                                                xtype: "button",
                                                text: "เช็คเงินอุดหนุน",
                                                name: "i_cheke_bgType",
                                                hidden: Ext.isAudit ? false : true,
                                                // hidden: true,                                                    
                                                id: "i_cheke_bgTypeID",
                                                fieldLabel: "เช็คเงินอุดหนุน",
                                                listeners: {
                                                    beforerender: function () {
                                                        this.fn = function () {
                                                        };
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
                                                        var win = Bg_Check_Money();
                                                        win.items.items[0].getForm().loadRecord(Ext.selectRow);
                                                        win.show();
                                                        Ext.fnDisBook();
                                                    }
                                                },
                                            },
                                        ],
                                    },
                                    {
                                        columnWidth: 0.1,
                                        layout: "table",
                                        items: new Ext.Panel({
                                            border: true,
                                            html: '<div id="header" align="right">' + '<div id="qrcodeID" ' + 'style="text-align:center;margin:0px 0px 0px 0px;background:#ccc; width:90px;height:80px;">' + "<!-- QRCODE -->" + "</div>",
                                        }),
                                    },
                                ],
                            },
                        ],
                        buttonAlign: "center",
                        buttons: [{
                                text: "บันทึกร่าง PR",
                                iconCls: "icon-save-darf",
                                name: 'buDarf', //i_is_regirster 0 show else 1 
                                handler: function () {
//                                    var form = Ext.getCmp(Ext.poFormID).getForm();
//                                    Ext.getCmp('buSaveSubID').formSubmit(form);
                                       Ext.example.msg("แจ้งเตือน", "ใบร่างกำลังอยู่ในการปรับปรุง", 5);
                                }
                            },
                            {
                                text: "บันทึกรายการ PR",
                                id: "buSaveSubID",
                                iconCls: "icon-save", 
                                listeners: {
                                    afterrender: function () {
                                        this.formSubmit = function (form) {
                                            form.submit({
                                                waitMsg: "Saving Data...",
                                                params: {mode: "UPDATEFORMSTSATUS"},
                                                success: function (form, action) {
                                                    Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                                        Ext.storeDtl.reload({
                                                            callback: function (record, operation, success) {
                                                                if (success) {
                                                                    Ext.each(record, function (value) {
                                                                        if (Ext.selectRow.id === value.get('id')) {
                                                                            Ext.selectRow = value;
                                                                            Ext.getCmp("winMain").destroy();
                                                                            Ext.buAct = "update";
                                                                            Ext.loadStore("edit", true);
                                                                        } else if (Ext.selectRow.get("id") === value.get('id')) {
                                                                            Ext.getCmp("tabpanel1").getStore().reload();
                                                                            Ext.getCmp("winMain").destroy();
                                                                        }
                                                                    });
                                                                    // Ext.getCmp("winMain").destroy();
                                                                }

                                                            }
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
                                        }; //END formSubmit(form);
                                    },
                                },
                                handler: function () {
                                    var msg = "";
                                    if ([1, 2].includes(Ext.getCmp("i_is_registerID").getValue().inputValue)) { 
                                        if (Ext.getCmp("po_expense_hdr_idID").getValue() == null) {
                                            msg += "- กรุณาเลือกหมวดค่าใช้จ่ายก่อนบันทึก" + "\n"
                                        }
                                        if (Ext.getCmp("dc_cost2_idID").getValue() == null) {
                                            msg += "- กรุณาเลือกหน่วยงานเจ้าของเรื่อง" + "\n"
                                        }
                                        if ([null, 0, ""].includes(Ext.getCmp("f_totalID").getValue())) {
                                            msg += "- กรุณากรอกจำนวนเงิน" + "\n"
                                        }
                                        if (Ext.getCmp("i_type_contractID").getValue() === null) {
                                            msg += "- กรุณากรอกประเภทสัญญา" + "\n"
                                        }
                                        if (Ext.isEmpty(Ext.getCmp("i_type_contractID").getValue())) {
                                            msg += "- กรุณาเลือก ประเภทสัญญา" + "\n"
                                        }
                                        if (Ext.getCmp("i_type_bgID").getValue() != Ext.selectRow.data.i_type_bg) {
                                            Ext.Msg.alert("แจ้งเตือน", "มีการเปลี่ยนแปลงประเภท ", function (bu, action) {
                                                return false;
                                            });
                                        }

                                        if (msg != "") {
                                            Ext.example.msg("แจ้งเตือน", msg, 1);
                                            $(this).next("text copied");
                                            setTimeout(function () {
                                                $(this).next().remove();
                                            }, 6000);
                                            return;
                                        }
                                    }
                                    if (Ext.getCmp("i_is_registerID").getValue().inputValue == "2" && Ext.selectRow.get("tor_hdr_dtl") == "0") {
                                        Ext.Msg.alert("แจ้งเตือน", "ยังไม่บันรายละเอียด", function (bu, action) {
                                            return false;
                                        });
                                    } else if (msg == "") {
                                        
                                        if (Ext.getCmp("modesubID2").getValue().inputValue == "ADD") {
                                            if (Ext.store2.data.length > 0) {
                                                var win = new Ext.Window({
                                                    id: "MessageBox_re",
                                                    title: "แจ้งเแตือน",
                                                    modal: true,
                                                    width: 260,
                                                    height: 120,
                                                    html: "<br><center><p style='font-size:12px'>ต้องการจะคัดลอกรายละเอียดจัดซื้อด้วยหรือไม่ ?</p></center>",
                                                    buttons: [
                                                        {
                                                            text: "ใช่",
                                                            handler: function () {
                                                                Ext.getCmp("i_dtl_addID").setValue(1);
                                                                var form = Ext.getCmp(Ext.poFormID).getForm();
                                                                if (form.isValid()) {
                                                                    formSubmit(form);
                                                                }
                                                                Ext.getCmp("MessageBox_re").hide();
                                                                Ext.getCmp("MessageBox_re").destroy();
                                                            },
                                                        },
                                                        {
                                                            text: "ไม่",
                                                            handler: function () {
                                                                Ext.getCmp("i_dtl_addID").setValue(0);
                                                                var form = Ext.getCmp(Ext.poFormID).getForm();
                                                                if (form.isValid()) {
                                                                    formSubmit(form);
                                                                }
                                                                Ext.getCmp("MessageBox_re").hide();
                                                                Ext.getCmp("MessageBox_re").destroy();
                                                            },
                                                        },
                                                    ],
                                                }).show();
                                                return;
                                            }
                                        }

                                        var form = Ext.getCmp(Ext.poFormID).getForm();
                                        if (form.isValid()) {
                                            if (Ext.getCmp("modesubID2").getValue().inputValue === "VIEW") {
                                                
                                            } else if (Ext.getCmp("modesubID2").getValue().inputValue === "DELETE") {
                                                Ext.MessageBox.show({
                                                    title: "Icon Support",
                                                    msg: "คุณต้องการที่จะลบ รายการที่เลือกนี้ใช่ใหม ?",
                                                    buttons: Ext.MessageBox.OKCANCEL,
                                                    icon: Ext.MessageBox.WARNING,
                                                    fn: function (btn) {
                                                        if (btn === "ok") {
                                                            this.formSubmit(form);
                                                        } else {
                                                            return;
                                                        }
                                                    },
                                                });
                                            } else {
                                                this.formSubmit(form);
                                            }
                                        }
                                    } else {
                                        Ext.Msg.alert("แจ้งเตือน", msg);
                                    }
                                }
                            }, //haddler
                            {
                                text: Ext.GLOBAL_BU_BACK_TH, iconCls: "icon-back",
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
}; //End App 
Ext.loadStore = function (status, show) {
    console.log(Ext.selectRow.get('po_expense_id'));
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
                                // Ext.po_user_permission.reload({
                                //     callback: function (recordx, operation, success) {
                                //         if (success) {
                                Ext.dc_expense_budget_type.reload({
                                    callback: function (recordx, operation, success) {
                                        if (success) {
                                            Ext.po_expense_group.reload({
                                                callback: function (recordx, operation, success) {
                                                    if (success) {
                                                        Ext.po_expense.reload({
                                                            callback: function (recordx, operation, success) {
                                                                if (success) {
                                                                    if (!Ext.isEmpty(Ext.selectRow)) {
                                                                        Ext.HDR_ID = Ext.selectRow.data.id;
                                                                        Ext.tor_type_id = Ext.selectRow.data.tor_type_id; // default start เจาะจงน้อวกว่า 5 แสน
                                                                        Ext.i_is_more = Ext.selectRow.data.i_is_more;
                                                                        /*
                                                                         Ext.selectRow.set("po_expense_id", Ext.selectRow.get("po_expense_main_id"));
                                                                         console.log(Ext.selectRow);
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
                                                                         */
                                                                        if (Ext.selectRow.get("sp_bg_edit") == 1) {
                                                                            Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>รายการนี้อยู่ระหว่างการขอแก้ไข</span><br>", function (bu, action) {
                                                                            });
                                                                            return false;
                                                                        }
                                                                        var winApp = AppPoStore(statusx);

                                                                        // if(Ext.selectRow.set("sp_bg_edit") == 1  )
                                                                        Ext.getCmp("winChequeID").items.items[0].getForm().loadRecord(Ext.selectRow);
                                                                        winApp.show();

                                                                        Ext.fnDisMenuEmp(Ext.isAudit);
                                                                        //button
                                                                        // console.log(Ext.selectRow);
                                                                        Ext.getCmp("c_commentID").setValue(Ext.selectRow.get("c_comment"));

                                                                        Ext.store2.setBaseParam("tor_id", Ext.HDR_ID);
                                                                        Ext.store2.load({
                                                                            callback: function (recordx, operation, success) {
                                                                                if (success) {
                                                                                    if (Ext.store2.data.length > 1) {
                                                                                        if (Ext.store2.data.length == 0) {
                                                                                            Ext.getCmp("winMain").items.items[0].items.items[1].items.items[0].getForm().loadRecord(Ext.selectDefault);

                                                                                        }
//                                                                                        sumtopbar();
                                                                                    }
                                                                                }
                                                                            },
                                                                        });
                                                                    }
                                                                }
                                                            },
                                                        }); //po_expense
                                                    }
                                                },
                                            }); //po_expense_group
                                        }
                                    },
                                    //         }); //dc_expense_budget_type
                                    //     }
                                    // },
                                }); //po_user_permission
                            }
                        },
                    }); //po_emp
                }
            },
        });
};

