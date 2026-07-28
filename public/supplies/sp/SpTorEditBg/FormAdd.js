Ext.HDR_ID = null;
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
function purchase2(id, bg_reserve_money_id, ii) {
    // console.log(id + " == " + bg_reserve_money_id + " == " + ii);
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
            Ext.store.load({
                params: {id: id},
                callback: function (records, operation, success) {},
            });
            // Ext.getCmp("winDcExpTypeDddID").getEl().unmask();
        },
        failure: function (result, request) {
            Ext.MessageBox.alert("Failed", result.responseText); // connect error
        },
    });
}
function genBooklink(v, i) {
    var ii = i;
    var i_type = "dc_expense_budget_type_edit_id" + i;
    var po_expense_edit = "po_expense_edit_id" + i;
    var bg_reserve_id = "bg_reserve_money" + i;
    // var bg_reserve_money_id = Ext.select_row + bg_reserve_id ;
    var bg_reserve_money_id = Ext.getCmp(bg_reserve_id).getValue();
    // console.log(bg_reserve_money_id)
    // return ; 
    var dc_expense_budget_type = Ext.getCmp(i_type).getValue();
    // var dc_expense_budget_type = Ext.getCmp(i_type);
    var po_expense_id = Ext.getCmp(po_expense_edit).getValue();
    var pr_type = "i_pr_type_edit_ID" + i;
    var i_type_pr = Ext.getCmp(pr_type).getValue().inputValue;
    var ip = Ext.session.ip_booking; // 192
    var i_amount_bg = Ext.select_row.i_amount_bg;
    var f_type_amt = "f_total_amt_edit" + i;
    var f_total_amt = Ext.getCmp(f_type_amt).getValue();
    var i_yyyy = Ext.getCmp("i_yyyy").getValue();
    // if(i == 1 ){
    //   cons
    // }
    var link = Ext.session.IPAPIBG +
            "/?/bg/mn_BgReserveMoney/mode/POST" +
            "/i_sys/1" +
            "/pr_id/" +
            Ext.select_row.id +
            "/po_id/0" +
            "/chk_id/0" +
            "/i_year/" +
            i_yyyy +
            "/i_pr_type/" +
            i_type_pr + //  plan or period
            "/i_reserve/1" + // step 1 PR step 2 po step3 checking
            "/dc_cost_id/" +
            Ext.select_row.dc_cost_id +
            "/dc_budget_type_id/" +
            dc_expense_budget_type +
            // Ext.selectRow.get(i_type) +
            "/bg_expense_id/" +
            po_expense_id +
            "/i_last/1" +
            "/f_amt/" +
            v;

    var link2 = Ext.session.IPAPIBG +
            "/?/bg/BgBudgetAllSupplies" +
            "/i_year/" +
            i_yyyy +
            "/dc_budget_type_id/" +
            dc_expense_budget_type +
            // Ext.selectRow.get(i_type) +
            "/dc_cost_id/" +
            Ext.select_row.dc_cost_id +
            "/bg_expense_id/" +
            po_expense_id;

    var link3 = Ext.session.IPAPIBG +
            "/?/bg/mn_BgReserveMoney/mode" +
            "/PUT/" +
            "bg_reserve_money_id/" +
            bg_reserve_money_id +
            "/i_enable/2";
    Ext.Ajax.request({
        url: link2,
        method: "GET", //POST
        disableCaching: false,
        success: function (result, request) {
            // Ext.getCmp("form-widgets").getEl().unmask();
            var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
            var f_type_amt = Ext.getCmp('f_type_amt1').getValue().replace(/,/g, "") / 1;
            var f_type_amt1 = Ext.getCmp('f_total_amt_edit1').getValue().replace(/,/g, "") / 1;
            if (jsonData.totalCount > 0) {
                var f_amt = 0;
                // console.log(v);
                
         
                if (i_type_pr == 1) {
                    f_amt = parseFloat(jsonData.data[0].f_total_plan);
                } else {
                    f_amt = parseFloat(jsonData.data[0].f_total_dtl);
                }
                 var cheVal = f_type_amt1;
                console.log('f_amt ',f_amt);
                console.log('cheVal ',cheVal);
                console.log('f_type_amt1 ',f_type_amt1);
                console.log('f_type_amt ',f_type_amt);
               
                var f_type_amt_res = (f_amt + f_type_amt)/1;
                console.log('f_type_amt_res ',f_type_amt_res);
                
                  alert(f_type_amt_res+" == "+f_type_amt1);
                if (f_type_amt_res >= cheVal) {
                    var f_amt_sum = f_type_amt_res - cheVal;
                  
                    var c_name_dc_expense_budget_type = getStoreItems(Ext.dc_expense_budget_type, dc_expense_budget_type, "c_name");
                    var c_name_po_expense_id = getStoreItems(Ext.bg_expense, po_expense_id, "c_name");
                    Ext.getCmp("form-widgets").getEl().unmask();
                    Ext.Msg.show({
                        title: "แจ้งเตือน!",
                        msg: "ยืนยันการจองเงิน แหล่งเงิน : " + c_name_dc_expense_budget_type + "\n",
                        width: 400,
                        // icon: Ext.MessageBox.QUESTION,
                        buttons: Ext.MessageBox.YESNO,
                        fn: function (btn, text) {
                            if (btn === "yes") {
                                Ext.getCmp("form-widgets").getEl().mask("Please wait...", "x-mask-loading");
                                //ยกเลิก PR
                                Ext.Ajax.request({
                                    url: link3,
                                    method: "GET", //POST
                                    disableCaching: false,
                                    success: function (result, request) {
                                        var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                                        //จอง PR
                                        Ext.Ajax.request({
                                            url: link,
                                            method: "GET", //POST
                                            disableCaching: false,
                                            success: function (result, request) {
                                                var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                                                var dc_expense_budget_type_edit = "dc_expense_budget_type_id" + i
                                                var po_expense_id_edit = "po_expense_id" + i
                                                var bg_reserve_money = "bg_reserve_money" + i;
                                                var i_pr_type = "i_pr_typeID" + i;
                                                var f_type_amt = "f_type_amt" + i;
                                                // console.log(Ext.select_row.get("bg_reserve_money1"));
                                                // console.log(Ext.select_row.bg_reserve_money1)
                                                // console.log(Ext.select_row)
                                                if (jsonData.success) {
                                                    console.log(jsonData.success);
                                                    // บันทึกลง PR inset ตัวเก่า 
                                                    Ext.Ajax.request({
                                                        url: "tor/api/mnTorController.php",
                                                        method: "POST",
                                                        params: {
                                                            mode: "ConFirm_Edit_bg",
                                                            id: Ext.select_row.id,
                                                            i_pr_type: i_type_pr,
                                                            type: i,
                                                            i_yyyy: i_yyyy,
                                                            dc_expense_budget_type: dc_expense_budget_type,
                                                            po_expense_id: po_expense_id,
                                                            f_total: v.replace(/,/g, "") / 1,
                                                            bg_reserve_money_id: bg_reserve_money_id,
                                                            i_edit: 2,
                                                            i_edit_tor: 5,
                                                            i_status: 2,
                                                            i_amount_bg: i_amount_bg,

                                                            dc_expense_budget_type_id_edit: Ext.getCmp(dc_expense_budget_type_edit).getValue(),
                                                            po_expense_id_edit: Ext.getCmp(po_expense_id_edit).getValue(),
                                                            bg_reserve_money_edit: Ext.getCmp(bg_reserve_money).getValue(),
                                                            f_type_amt: Ext.getCmp(f_type_amt).getValue(),
                                                            i_pr_type_edit: Ext.getCmp(i_pr_type).getValue().inputValue,
                                                            i_amount_bg: i_amount_bg,
                                                            buy: 2,

                                                        },
                                                        success: function (result, request) {
                                                            Ext.getCmp("form-widgets").getEl().unmask();
                                                            Ext.MessageBox.alert("Success", "ทำการเรียบร้อยแล้ว", function () {
                                                                Ext.getCmp("form-widgets").getEl().mask("Please wait...", "x-mask-loading");
                                                                Ext.getCmp("form-widgets").getEl().unmask();
                                                                Ext.getCmp("frm-Add").hide();
                                                                Ext.getCmp("frm-Add").destroy();
                                                                var alert_text = "มีการยืนยันการแก้ไขแหล่งเงิน " + "\n";
                                                                alert_text += "วันเวลา : " + new Date().toLocaleString("en-ZA") + "\n";
                                                                alert_text += "PR : " + Ext.select_row.c_code + "\n";
                                                                alert_text += "แหล่งเงินจัดสรร : " + c_name_dc_expense_budget_type + "\n";
                                                                alert_text += "แหล่งเงินแก้ไข : " + c_name_dc_expense_budget_type + "\n";
                                                                alert_text += "หมวดค่าใช้จ่ายจัดสรร : " + c_name_po_expense_id + "\n";
                                                                alert_text += "หมวดค่าใช้จ่ายแก้ไข : " + c_name_po_expense_id + "\n";
                                                                alert_text += "จำนวนเงินจัดสรร : " + floatRenderer(floatMinus(String(f_total_amt).replace(/,/g, ""), 2)) + "\n";
                                                                alert_text += "จำนวนเงินแก้ไข : " + floatRenderer(floatMinus(String(v).replace(/,/g, ""), 2)) + "\n";
                                                                alert_text += "เงินคงเหลือหลังจอง : " + floatRenderer(floatMinus(String(f_amt_sum).replace(/,/g, ""), 2)) + "\n";
                                                                // alert_text += "เหตุผล : " + Ext.getCmp("reason_Edit_bgID").getValue() + "\n";
                                                                alert_text += "ชื่อผู้ดำเนินรายการ : " + Ext.session.user_name + "\n";
                                                                alert_text += "ชื่อรายการ : " + Ext.select_row.c_name + "\n";
                                                                // alert_text += "จำนวนเงิน : " + floatRenderer(floatMinus(String(Ext.selectRow.get("f_total_amt")).replace(/,/g, ""), 2)) + "\n";
                                                                Ext.Ajax.request({
                                                                    url: Ext.session.Notif_line,
                                                                    method: "POST",
                                                                    params: {
                                                                        msg: alert_text,
                                                                        mode: 3
                                                                    },
                                                                });
                                                                Ext.store.load({
                                                                    callback: function (_records, _operation, _success) {
                                                                        Ext.storeDtl.reload({
                                                                            callback: function (record, operation, success) {
                                                                                if (success) {
                                                                                    // Ext.bgMode.isbook = true; 
                                                                                    // Ext.getCmp("form-widgets").getEl().unmask();
                                                                                    purchase2(Ext.select_row.id, jsonData.bg_reserve_money_id, ii);
                                                                                    // Ext.getCmp("po_expense_hdr_idID").setReadOnly(true);
                                                                                    // setDisabled_button(i, 2);
                                                                                    // Ext.getCmp("tabpanel1").getStore().reload();
                                                                                }
                                                                            },
                                                                        });
                                                                    },
                                                                });
                                                                // setDisabled_button(i, 2);
                                                                null
                                                            });
                                                        },
                                                        failure: function (result, request) {
                                                            setDisabled_button(i, 1);
                                                            Ext.MessageBox.alert("Failed", result.responseText); // connect error
                                                        },
                                                    }) // บันทึกลง PR
              
                                                } else {
                                                    setDisabled_button(i, 1);
                                                    Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                                                }
                                            },
                                            failure: function (result, request) {
                                                setDisabled_button(i, 1);
                                                Ext.MessageBox.alert("Failed", result.responseText); // connect error
                                            },
                                        }); //จอง PR
                                        // }else{
                                        //   Ext.MessageBox.alert("Failed", result.responseText); // connect error
                                        // }
                                    },
                                    failure: function (result, request) {
                                        setDisabled_button(i, 1);
                                        Ext.MessageBox.alert("Failed", result.responseText); // connect error
                                    }
                                }) //ยกเลิก PR               
                                Ext.storeDtl.reload({callback: function (record, operation, success) {}});
 
                            } else {
                                setDisabled_button(i, 1);
                                null;
                            }
                        },
                    });
                } else {
                    setDisabled_button(i, 1);
                    Ext.getCmp("form-widgets").getEl().unmask();
                    Ext.MessageBox.alert("Success", "เงินไม่พอที่จะจอง กรุณาติดต่อฝ่ายคลังงบประมาณ", function () {
                        // Ext.getCmp("form-widgets").getEl().mask("Please wait...", "x-mask-loading");
                    });
                }
            }
        },
        failure: function (result, request) {
            Ext.MessageBox.alert("Failed", result.responseText); // connect error
        },
    });

    return link;
}
const editbgtor = function (i) {
    let msg = "";

    if (msg == "") {
        var win = new Ext.Window({
            id: "MessageBox_bg",
            title: "ยืนยันการเปลี่ยนแปลงงบประมาณ",
            modal: true,
            width: 400,
            // height: 150,
            items: [
                {
                    xtype: "form",
                    id: "form-widgets2",
                    frame: true,
                    labelAlign: "right",
                    labelWidth: 0.1,
                    bodyStyle: {padding: "10px 20px"},
                    defaults: {anchor: "100%", msgTarget: "side"},
                    items: [
                        {
                            xtype: "displayfield",
                            id: "displaytextbg",
                            width: 200,
                            value: "การเปลี่ยนแปลงงบประมาณจะไม่สามารถย้อนกลับได้",
                            style: "text-align: center; color:red; white-space: nowrap;",
                        },
                        {
                            xtype: "textfield",
                            enableKeyEvents: true,
                            id: "confirm_text",
                            width: 230,
                            value: "",
                            style: "text-align: center;",
                            emptyText: 'กรุณากรอก "ยืนยัน" หรือ "ใช้งบประมาณเดิม" เพื่อดำเนินรายการ',
                            listeners: {
                                keyup: function () {
                                    if (Ext.getCmp("confirm_text").getValue() == "ยืนยัน") {
                                        Ext.getCmp("Save_edit_bg").setDisabled(false);
                                    } else if (Ext.getCmp("confirm_text").getValue() == "ใช้งบประมาณเดิม") {
                                        Ext.getCmp("Save_edit_bg").setDisabled(false);
                                    } else {
                                        Ext.getCmp("Save_edit_bg").setDisabled(true);
                                    }
                                },
                            },
                        },
                    ],
                },
            ],
            buttonAlign: "left",
            buttons: [
                {
                    text: "บันทึกรายการ",
                    id: "Save_edit_bg",
                    iconCls: "icon-save",
                    disabled: true,
                    handler: function () {
                        if (Ext.getCmp("confirm_text").getValue() == "ยืนยัน") {
                            Ext.getCmp("form-widgets").getEl().mask("Please wait...", "x-mask-loading");
                            var f_total = "f_total_amt_edit" + i;
                            var f_totals = Ext.getCmp(f_total).getValue();
                            genBooklink(f_totals, i);
                            Ext.getCmp("MessageBox_bg").hide();
                            Ext.getCmp("MessageBox_bg").destroy();
                        } else if (Ext.getCmp("confirm_text").getValue() == "ใช้งบประมาณเดิม") {
                            NotApproved(i);
                            Ext.getCmp("MessageBox_bg").hide();
                            Ext.getCmp("MessageBox_bg").destroy();
                        } else {
                        }
                    },
                },
                {xtype: "tbfill"},
                {
                    text: "ย้อนกลับ",
                    handler: function () {
                        setDisabled_button(i, 1);
                        Ext.getCmp("MessageBox_bg").hide();
                        Ext.getCmp("MessageBox_bg").destroy();
                    },
                },
            ],
        }).show();
    } else {
        Ext.Msg.alert("แจ้งเตือน", msg);
    }
}; // editbgtor
// Class Extend
const NotApproved = function (i) {
    // console.log(Ext.select_row);
    // return ; 
    Ext.Ajax.request({
        url: "tor/api/mnTorController.php",
        method: "POST",
        params: {
            mode: "Not_Approved_bg",
            id: Ext.select_row.id,
            i_edit: 3,
            i_status: 2,
            sp_tor_bg_log_id1: Ext.select_row.sp_tor_bg_log_id1,
            sp_tor_bg_log_id2: Ext.select_row.sp_tor_bg_log_id2,
            sp_tor_bg_log_id3: Ext.select_row.sp_tor_bg_log_id3,
            i_amount_bg: Ext.select_row.i_amount_bg,
            type: i,
        },
        success: function (result, request) {

        },
        failure: function (result, request) {
            Ext.MessageBox.alert("Failed", result.responseText); // connect error
        },
    });
}
formAdd = function (args) {
    formAdd.superclass.constructor.call(this, {
        region: "center",
        title: "ข้อมูล" + Ext.title_panel,
        iconCls: "icon-application-form-add",
        id: "frm-Add",
        // layout: "fit",
        border: false,
        stripeRows: true,
        loadMask: true,
        listeners: {
            afterrender: function (obj, eOpts) {
                if (Ext.select_row.sp_bg_edit1 == 2) {
                    Ext.getCmp("button1").setDisabled(true);
                }
                if (Ext.select_row.sp_bg_edit2 == 2) {
                    Ext.getCmp("button2").setDisabled(true);
                }
                if (Ext.select_row.sp_bg_edit3 == 2) {
                    Ext.getCmp("button3").setDisabled(true);
                }
                if (Ext.select_row.i_amount_bg == 1) {
                    Ext.getCmp("fieldset_edit_bg2").hide();
                    Ext.getCmp("fieldset_edit_bg3").hide();
                } else if (Ext.select_row.i_amount_bg == 2) {
                    Ext.getCmp("fieldset_edit_bg3").hide();
                }
            }
        },
        layout: {
            type: "vbox",
            align: "stretch",
            pack: "start",
        },
        items: [
            new Ext.FormPanel({
                id: "form-widgets",
                autoScroll: true,
                frame: true,
                height: Ext.getBody().getViewSize().height * 1 - 30,
                width: Ext.getBody().getViewSize().width * 1,

                items: [
                    {
                        xtype: "fieldset",
                        title: "ข้อมูลรายการ",
                        collapsible: true,
                        layout: "column",
                        labelWidth: 140, // label settings here cascade unless overridden
                        labelAlign: "right",
                        items: [
                            {
                                // column 1
                                columnWidth: 0.55,
                                xtype: "fieldset",
                                border: false,
                                items: [
                                    {
                                        xtype: "hidden",
                                        id: "role-form-mode",
                                        name: "mode",
                                        readOnly: true,
                                    },
                                    {
                                        xtype: "hidden",
                                        id: "id",
                                        name: "id",
                                        readOnly: true,
                                    },
                                    {
                                        xtype: "hidden",
                                        id: "bg_reserve_money1",
                                        name: "bg_reserve_money1",
                                        readOnly: true,
                                    },
                                    {
                                        xtype: "hidden",
                                        id: "bg_reserve_money2",
                                        name: "bg_reserve_money2",
                                        readOnly: true,
                                    },
                                    {
                                        xtype: "hidden",
                                        id: "bg_reserve_money3",
                                        name: "bg_reserve_money3",
                                        readOnly: true,
                                    },
                                    {
                                        xtype: "buttongroup",
                                        fieldLabel: "hdr_id, contract_id",
                                        frame: false,
                                        border: false,
                                        hidden: true,
                                        items: [
                                            {
                                                xtype: "textfield",
                                                width: 80,
                                                value: Ext.select_row.id,
                                                style: "text-align: center;font-weight:bold;background:#eee;",
                                                readOnly: true,
                                            },
                                            {
                                                xtype: "textfield",
                                                width: 80,
                                                value: Ext.select_row.sp_tor_contract_id,
                                                style: "text-align: center;font-weight:bold;background:#eee;",
                                                readOnly: true,
                                            },
                                        ],
                                    },
                                    {
                                        fieldLabel: "เลขที่ PR",
                                        xtype: "textfield",
                                        id: "c_code",
                                        name: "c_code",
                                        style: "font-weight: bold;color: blue;",
                                        width: 300,
                                        // readOnly: true,
                                    },
                                    {
                                        fieldLabel: "เลขที่ PR",
                                        xtype: "textfield",
                                        id: "c_code_po",
                                        name: "c_code_po",
                                        hidden: true,
                                        style: "font-weight: bold;color: blue;",
                                        width: 300,
                                        // readOnly: true,
                                    },
                                    new Ext.form.ComboBox({
                                        fieldLabel: "ปีงบประมาณ",
                                        id: "i_yyyy",
                                        name: "i_yyyy",
                                        mode: "local",
                                        store: Ext.store_year,
                                        valueField: "id",
                                        displayField: "c_name",
                                        triggerAction: "all",
                                        readOnly: true,
                                        forceSelection: true,
                                        selectOnFocus: true,
                                        typeAhead: false,
                                        emptyText: "กรุณาเลือก...",
                                        width: 200,
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
                                    {
                                        xtype: "radiogroup",
                                        columns: [98, 98, 98],
                                        fieldLabel: "การดำเนินงาน",
                                        id: "i_purchaseID",
                                        name: "i_purchase",
                                        hidden: true,
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
                                                // Ext.getCmp("i_type_fix_rateGb").fn();
                                            },
                                            afterrender: function () {
                                                // console.log(this.getValue());
                                            },
                                        },
                                    }, ///i_purchase
                                    {
                                        xtype: "textfield",
                                        id: "f_total",
                                        name: "f_total",
                                        readOnly: true,
                                        fieldLabel: "จำนวนเงินPR",
                                        style: "text-align: right; bold;color: blue; font-weight: bold;",
                                        width: 200,
                                        listeners: {
                                            afterrender: function () {
                                                this.fn = function () {
                                                    let value = floatMinus(this.getValue().replace(/,/g, ""), 2);
                                                    this.setValue(floatRenderer(value));
                                                };
                                            },
                                            Change: function (value) {
                                                this.fn();
                                            },
                                        },
                                    },
                                    {
                                        xtype: "textfield",
                                        width: 150,
                                        fieldLabel: "สถานะ",
                                        value: Ext.select_row.c_name_status,
                                        style: "text-align: center;font-weight:bold;background:#eee;",
                                        readOnly: true,
                                    },
                                    new Ext.form.ComboBox({
                                        mode: "local",
                                        store: Ext.torType,
                                        hidden: true,
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
                                        xtype: "textfield",
                                        width: 150,
                                        fieldLabel: "ประเภท PR",
                                        value: Ext.select_row.i_type_bg,
                                        style: "text-align: center;font-weight:bold;background:#eee;",
                                        readOnly: true,
                                    },
                                    {
                                        xtype: "radiogroup",
                                        columns: [98, 98, 98, 98],
                                        fieldLabel: "จำนวนแหล่งเงิน",
                                        id: "i_amount_edit_bgID",
                                        name: "i_amount_edit_bg",
                                        hidden: true,
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
                                                Ext.getCmp("i_amount_edit_bgID").setValue(Ext.select_row.i_amount_bg);
                                            },
                                            change: function () {
                                                // if (Ext.selectRow.get("bg_reserve_money1_id") > 0) {
                                                //   // Ext.Msg.alert("แจ้งเตือน", "จองเงินไปแล้วไม่สามารถแก้ไขรายการได้");
                                                //   Ext.getCmp("i_amount_edit_bgID").setValue(Ext.selectRow.get("i_amount_bg"));
                                                // } else {
                                                //   if (Ext.getCmp("i_amount_bgID").getValue().inputValue == 1) {
                                                //     Ext.getCmp("fidldser_bg2").hide();
                                                //     Ext.getCmp("fidldser_bg3").hide();
                                                //     Ext.getCmp("f_type_amtID").setValue(floatRenderer(floatMinus(Ext.getCmp("f_totalID").getValue().replace(/,/g, ""))));
                                                //   } else if (Ext.getCmp("i_amount_bgID").getValue().inputValue == 2) {
                                                //     Ext.getCmp("fidldser_bg2").show();
                                                //     Ext.getCmp("f_type_amtID").setValue(0);
                                                //     Ext.getCmp("f_type_amtID2").setValue(0);
                                                //     Ext.getCmp("f_type_amtID3").setValue(0);
                                                //     Ext.getCmp("fidldser_bg3").hide();
                                                //   } else if (Ext.getCmp("i_amount_bgID").getValue().inputValue == 3) {
                                                //     Ext.getCmp("fidldser_bg2").show();
                                                //     Ext.getCmp("f_type_amtID").setValue(0);
                                                //     Ext.getCmp("f_type_amtID2").setValue(0);
                                                //     Ext.getCmp("f_type_amtID3").setValue(0);
                                                //     Ext.getCmp("fidldser_bg3").show();
                                                //   }
                                                // }
                                                //  Ext.getCmp('i_is_invGID').fn(this.getValue().inputValue);
                                            },
                                        },
                                    },
                                    {
                                        xtype: "box",
                                        autoEl: {tag: "hr"},
                                    },
                                    {
                                        xtype: "radiogroup",
                                        columns: [98, 98],
                                        fieldLabel: "ขอดำเนินการ",
                                        id: "i_pr_typeID1",
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
                                                // if( Ext.selectRow.get("bg_reserve_money1_id") > 0 ){
                                                //   Ext.Msg.alert("แจ้งเตือน", "จองเงินไปแล้วไม่สามารถแก้ไขรายการได้");
                                                //   Ext.getCmp("i_pr_type1ID").setValue(Ext.selectRow.get("i_pr_type1"));
                                                // }
                                            }
                                        }
                                    },
                                    new Ext.form.ComboBox({
                                        fieldLabel: "แหล่งเงินที่จัดสรร  ", //+ Ext.select_row.dc_expense_budget_type_id1 + " ",
                                        id: "dc_expense_budget_type_id1",
                                        name: "dc_expense_budget_type_id1",
                                        mode: "local",
                                        store: Ext.dc_expense_budget_type,
                                        valueField: "id",
                                        displayField: "c_name",
                                        triggerAction: "all",
                                        readOnly: true,
                                        forceSelection: true,
                                        selectOnFocus: true,
                                        typeAhead: false,
                                        emptyText: "กรุณาเลือก...",
                                        width: 400,
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
                                    new Ext.form.ComboBox({
                                        fieldLabel: "รายการย่อยที่จัดสรร  ", // + Ext.select_row.po_expense_id + " ",
                                        id: "po_expense_id1",
                                        name: "po_expense_id1",
                                        mode: "local",
                                        store: Ext.bg_expense,
                                        valueField: "id",
                                        displayField: "c_name",
                                        triggerAction: "all",
                                        readOnly: true,
                                        forceSelection: true,
                                        selectOnFocus: true,
                                        typeAhead: false,
                                        emptyText: "กรุณาเลือก...",
                                        width: 400,
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
                                    {
                                        xtype: "textfield",
                                        id: "f_type_amt1",
                                        name: "f_type_amt1",
                                        readOnly: true,
                                        fieldLabel: "จำนวนเงินที่จอง",
                                        style: "text-align: right; bold;color: blue; font-weight: bold;",
                                        width: 200,
                                        listeners: {
                                            afterrender: function () {
                                                this.fn = function () {
                                                    let value = floatMinus(this.getValue().replace(/,/g, ""), 2);
                                                    this.setValue(floatRenderer(value));
                                                };
                                            },
                                            Change: function (value) {
                                                this.fn();
                                            },
                                        },
                                    },
                                ],
                            },
                            {
                                // column 2
                                columnWidth: 0.45,
                                xtype: "fieldset",
                                border: false,
                                items: [
                                    {
                                        xtype: "textfield",
                                        width: 80,
                                        fieldLabel: "dlt_id",
                                        value: Ext.select_row.sp_tor_dtl_id,
                                        hidden: true,
                                        style: "text-align: center;font-weight:bold;background:#eee;",
                                        readOnly: true,
                                    },
                                    {
                                        xtype: "textarea",
                                        fieldLabel: "ชื่อรายการ",
                                        id: "c_name",
                                        name: "c_name",
                                        width: 300,
                                        height: 80.5,
                                    },
                                    // {
                                    //   fieldLabel: "จำนวนรายการ",
                                    //   xtype: "textfield",
                                    //   id: "c_qty",
                                    //   name: "c_qty",
                                    //   width: 200,
                                    // },
                                    {
                                        xtype: "datefield",
                                        fieldLabel: "วันที่เริ่มสัญญา",
                                        id: "d_doc_date",
                                        name: "d_doc_date",
                                        hidden: true,
                                        width: 100,
                                    },
                                    {
                                        xtype: "datefield",
                                        hidden: true,
                                        fieldLabel: "วันที่สิ้นสุด",
                                        id: "d_due_date",
                                        name: "d_due_date",
                                        width: 100,
                                    },
                                    new Ext.form.ComboBox({
                                        fieldLabel: "ผู้ดำเนินการ  ", // + Ext.select_row.sp_emp_id + " ",
                                        id: "sp_emp_id",
                                        name: "sp_emp_id", // po_emp_id
                                        mode: "local",
                                        readOnly: true,
                                        store: Ext.sp_emp,
                                        valueField: "id",
                                        displayField: "c_name",
                                        triggerAction: "all",
                                        forceSelection: true,
                                        selectOnFocus: true,
                                        typeAhead: false,
                                        emptyText: "กรุณาเลือก...",
                                        width: 200,
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
                                    {
                                        xtype: "textfield",
                                        width: 150,
                                        fieldLabel: "เลขที่ พวช",
                                        value: Ext.select_row.d_doc_ref_pr,
                                        style: "text-align: center;font-weight:bold;background:#eee;",
                                        readOnly: true,
                                    },
                                    {
                                        xtype: "box",
                                        autoEl: {tag: "hr"},
                                    },
                                    {
                                        xtype: "radiogroup",
                                        columns: [98, 98],
                                        fieldLabel: "ขอดำเนินการขอแก้ไข",
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
                                                //   Ext.Msg.alert("แจ้งเตือน", "จองเงินไปแล้วไม่สามารถแก้ไขรายการได้");
                                                //   Ext.getCmp("i_pr_type1ID").setValue(Ext.selectRow.get("i_pr_type1"));
                                                // }
                                            }
                                        }
                                    },
                                    new Ext.form.ComboBox({
                                        fieldLabel: "แหล่งเงินขอแก้ไข  ", // + Ext.select_row.dc_expense_budget_type_edit_id1 + " ",
                                        id: "dc_expense_budget_type_edit_id1",
                                        name: "dc_expense_budget_type_edit_id1",
                                        mode: "local",
                                        store: Ext.dc_expense_budget_type,
                                        valueField: "id",
                                        displayField: "c_name",
                                        triggerAction: "all",
                                        forceSelection: true,
                                        selectOnFocus: true,
                                        typeAhead: false,
                                        emptyText: "กรุณาเลือก...",
                                        width: 300,
                                        readOnly: true,
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
                                    new Ext.form.ComboBox({
                                        fieldLabel: "รายการย่อยขอแก้ไข  ", // + Ext.select_row.po_expense_dtl_id + " ",
                                        id: "po_expense_edit_id1",
                                        name: "po_expense_edit_id1",
                                        mode: "local",
                                        store: Ext.bg_expense,
                                        valueField: "id",
                                        displayField: "c_name",
                                        triggerAction: "all",
                                        forceSelection: true,
                                        selectOnFocus: true,
                                        typeAhead: false,
                                        emptyText: "กรุณาเลือก...",
                                        width: 300,
                                        readOnly: true,
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
                                    {
                                        xtype: "textfield",
                                        id: "f_total_amt_edit1",
                                        name: "f_total_amt_edit1",
                                        fieldLabel: "จำนวนเงินขอแก้ไข",
                                        readOnly: true,
                                        style: "text-align: right; bold;color: blue; font-weight: bold;",
                                        width: 200,
                                        listeners: {
                                            afterrender: function () {
                                                this.fn = function () {
                                                    let value = floatMinus(this.getValue().replace(/,/g, ""), 2);
                                                    this.setValue(floatRenderer(value));
                                                };
                                            },
                                            Change: function (value) {
                                                this.fn();
                                            },
                                        },
                                    },

                                    {
                                        xtype: "buttongroup",
                                        frame: false,
                                        // width: 100,
                                        items: [
                                            {xtype: "tbspacer", width: 145},
//                       { xtype: "label", text: "ลบรายการ : " },
                                            {
                                                iconCls: "icon-cancel",
                                                xtype: "button",
                                                text: "ยกเลิก/ส่งคืน",
                                                handler: function () {

//        var grid = Ext.getCmp('yourGridId');   // เปลี่ยนเป็น id grid ของคุณ
//        var record = grid.getSelectionModel().getSelected();
                                                    var record = Ext.selectRrow;
                                                    if (!record) {
                                                        Ext.Msg.alert('แจ้งเตือน', 'กรุณาเลือกรายการ');
                                                        return;
                                                    }

                                                    Ext.Msg.confirm('ยืนยัน', 'คุณต้องการยกเลิกรายการนี้ใช่หรือไม่?', function (btn) {

                                                        if (btn == 'yes') {

                                                            Ext.Msg.show({
                                                                title: 'หมายเหตุยกเลิก',
                                                                msg: 'กรุณาระบุหมายเหตุ:',
                                                                width: 400,
                                                                buttons: Ext.Msg.OKCANCEL,
                                                                multiline: true,
                                                                value: record.get('c_comment_edit1') || '', // ✅ ค่า default
                                                                fn: function (btn2, text) {

                                                                    if (btn2 == 'ok') {

                                                                        if (!text || text.trim() === '') {
                                                                            Ext.Msg.alert('แจ้งเตือน', 'กรุณากรอกหมายเหตุ');
                                                                            return;
                                                                        }
                                                                        // อัพเดตค่าใน record
                                                                        record.set('c_comment_edit1', text);

                                                                        Ext.Ajax.request({
                                                                            url: './tor/api/mnCancelEditBg.php',
                                                                            method: 'POST',
                                                                            params: {
                                                                                id: record.get('id'),
                                                                                mode: 'return',
                                                                                sp_bg_edit: 1,
                                                                                comment: text
                                                                            },
                                                                            success: function (response) {
                                                                                var res = Ext.decode(response.responseText);
                                                                                if (res.reval == 0) {
                                                                                    Ext.Msg.alert('สำเร็จ', res.msg);
                                                                                    Ext.getCmp('tabpanel1').getStore().reload();
                                                                                    Ext.getCmp('frm-Add').destroy();
                                                                                } else {
                                                                                    Ext.Msg.alert('Error', res.msg);
                                                                                }
                                                                            },
                                                                            failure: function () {
                                                                                Ext.Msg.alert('Error', 'Server error');
                                                                            }
                                                                        });
                                                                    }
                                                                }
                                                            });
                                                        }
                                                    });

                                                }
                                            },
                                            {xtype: "tbspacer", width: 45},
                                            {
                                                iconCls: "icon-button-save", //icon-save-true
                                                xtype: "button",
                                                // scale: "medium",
                                                id: "button1",
                                                text: "ยืนยันการแก้ไข",
                                                // disabled:true,
                                                handler: function () {
                                                    // if(Ext.select_row.sp_bg_edit1 == 2){
                                                    //   this.setDisabled(true);
                                                    // }else{
                                                    editbgtor(1);
                                                    this.setDisabled(true);
                                                    // }
                                                },
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        xtype: "fieldset",
                        title: "ข้อมูลการแก้ไขแหล่งเงินที่ 2",
                        collapsible: true,
                        layout: "column",
                        id: "fieldset_edit_bg2",
                        labelWidth: 140, // label settings here cascade unless overridden
                        labelAlign: "right",
                        items: [
                            {
                                // column 1
                                columnWidth: 0.55,
                                xtype: "fieldset",
                                border: false,
                                items: [
                                    {
                                        xtype: "textfield",
                                        width: 80,
                                        fieldLabel: "bg_reserve_money_pr",
                                        id: "bg_reserve_money_i_reserve1",
                                        hidden: true,
                                        name: "bg_reserve_money_i_reserve1",
                                        style: "text-align: center;font-weight:bold;background:#eee;",
                                        readOnly: true,
                                    },
                                    {
                                        xtype: "textfield",
                                        hidden: true,
                                        fieldLabel: "วันที่สร้าง",
                                        id: "d_create_reserve1",
                                        name: "d_create_reserve1",
                                        readOnly: true,
                                        width: 100,
                                    },
                                    {
                                        xtype: "radiogroup",
                                        columns: [98, 98],
                                        fieldLabel: "ขอดำเนินการ",
                                        id: "i_pr_typeID2",
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
                                                // if( Ext.selectRow.get("bg_reserve_money1_id") > 0 ){
                                                //   Ext.Msg.alert("แจ้งเตือน", "จองเงินไปแล้วไม่สามารถแก้ไขรายการได้");
                                                //   Ext.getCmp("i_pr_type1ID").setValue(Ext.selectRow.get("i_pr_type1"));
                                                // }
                                            }
                                        }
                                    },
                                    new Ext.form.ComboBox({
                                        fieldLabel: "แหล่งเงิน ",
                                        id: "dc_expense_budget_type_id2",
                                        name: "dc_expense_budget_type_id2",
                                        mode: "local",
                                        readOnly: true,
                                        store: Ext.dc_expense_budget_type,
                                        valueField: "id",
                                        displayField: "c_name",
                                        triggerAction: "all",
                                        forceSelection: true,
                                        selectOnFocus: true,
                                        typeAhead: false,
                                        emptyText: "กรุณาเลือก...",
                                        width: 300,
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
                                    new Ext.form.ComboBox({
                                        fieldLabel: "รายการย่อยทีจัดสรร   ", //  + Ext.select_row.bg_expense_bg_id + " ",
                                        id: "po_expense_id2",
                                        name: "po_expense_id2",
                                        mode: "local",
                                        store: Ext.bg_expense,
                                        readOnly: true,
                                        valueField: "id",
                                        displayField: "c_name",
                                        triggerAction: "all",
                                        forceSelection: true,
                                        selectOnFocus: true,
                                        typeAhead: false,
                                        emptyText: "กรุณาเลือก...",
                                        width: 300,
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
                                    {
                                        xtype: "textfield",
                                        id: "f_type_amt2",
                                        name: "f_type_amt2",
                                        fieldLabel: "จำนวนเงินจัดสรร",
                                        style: "text-align: right; bold;color: blue; font-weight: bold;",
                                        width: 200,
                                        listeners: {
                                            afterrender: function () {
                                                this.fn = function () {
                                                    let value = floatMinus(this.getValue().replace(/,/g, ""), 2);
                                                    this.setValue(floatRenderer(value));
                                                };
                                            },
                                            Change: function (value) {
                                                this.fn();
                                            },
                                        },
                                    },
                                            // {
                                            //   fieldLabel: "เลขที่ฏีกา",
                                            //   xtype: "textfield",
                                            //   id: "bg_reserve_money_idasd",
                                            //   name: "bg_reserve_money_idasd",
                                            //   width: 300,
                                            // },
                                            // {
                                            //   fieldLabel: "เลขที่ใบกันเงิน",
                                            //   xtype: "textfield",
                                            //   id: "c_booking",
                                            //   name: "c_booking",
                                            //   width: 300,
                                            // },
                                ],
                            },
                            {
                                // column 2
                                columnWidth: 0.45,
                                xtype: "fieldset",
                                border: false,
                                items: [
                                    {
                                        fieldLabel: "bg_reserve_money_po",
                                        xtype: "textfield",
                                        width: 80,
                                        id: "bg_reserve_money_i_reserve2",
                                        name: "bg_reserve_money_i_reserve2",
                                        hidden: true,
                                        style: "text-align: center;font-weight:bold;background:#eee;",
                                        readOnly: true,
                                    },
                                    {
                                        xtype: "textfield",
                                        fieldLabel: "วันที่สร้าง",
                                        id: "d_create_reserve2",
                                        hidden: true,
                                        name: "d_create_reserve2",
                                        readOnly: true,
                                        width: 100,
                                    },
                                    {
                                        xtype: "radiogroup",
                                        columns: [98, 98],
                                        fieldLabel: "ขอดำเนินการขอแก้ไข",
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
                                                //   Ext.Msg.alert("แจ้งเตือน", "จองเงินไปแล้วไม่สามารถแก้ไขรายการได้");
                                                //   Ext.getCmp("i_pr_type1ID").setValue(Ext.selectRow.get("i_pr_type1"));
                                                // }
                                            }
                                        }
                                    },
                                    new Ext.form.ComboBox({
                                        fieldLabel: "แหล่งเงินขอแก้ไข ", //+ Ext.select_row.dc_budget_type_bg_id2 + " ",
                                        id: "dc_expense_budget_type_edit_id2",
                                        name: "dc_expense_budget_type_edit_id2",
                                        mode: "local",
                                        readOnly: true,
                                        store: Ext.dc_expense_budget_type,
                                        valueField: "id",
                                        displayField: "c_name",
                                        triggerAction: "all",
                                        forceSelection: true,
                                        selectOnFocus: true,
                                        typeAhead: false,
                                        emptyText: "กรุณาเลือก...",
                                        width: 300,
                                        readOnly: true,
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
                                    new Ext.form.ComboBox({
                                        fieldLabel: "รายการย่อยขอแก้ไข ",
                                        id: "po_expense_edit_id2",
                                        name: "po_expense_edit_id2",
                                        mode: "local",
                                        store: Ext.bg_expense,
                                        valueField: "id",
                                        displayField: "c_name",
                                        triggerAction: "all",
                                        forceSelection: true,
                                        selectOnFocus: true,
                                        typeAhead: false,
                                        emptyText: "กรุณาเลือก...",
                                        width: 300,
                                        readOnly: true,
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
                                    {
                                        xtype: "textfield",
                                        id: "f_total_amt_edit2",
                                        name: "f_total_amt_edit2",
                                        fieldLabel: "จำนวนเงินขอแก้ไข",
                                        style: "text-align: right; bold;color: blue; font-weight: bold;",
                                        width: 200,
                                        listeners: {
                                            afterrender: function () {
                                                this.fn = function () {
                                                    let value = floatMinus(this.getValue().replace(/,/g, ""), 2);
                                                    this.setValue(floatRenderer(value));
                                                };
                                            },
                                            Change: function (value) {
                                                this.fn();
                                            },
                                        },
                                    },
                                    {
                                        xtype: "buttongroup",
                                        frame: false,
                                        // width: 100,
                                        items: [
                                            {xtype: "tbspacer", width: 145},
                                            // { xtype: "label", text: "ลบรายการ : " },
                                            {
                                                iconCls: "icon-save-edit ",
                                                xtype: "button",
                                                // scale: "medium",
                                                id: "button2",
                                                text: "&nbsp;ยืนยันการแก้ไข&nbsp;",
                                                handler: function () {
                                                    editbgtor(2);
                                                },
                                            },
                                        ],
                                    },
                                            /*{
                                             fieldLabel: "จำนวนการทักท้วง",
                                             xtype: "textfield",
                                             id: "i_protest",
                                             name: "i_protest",
                                             style: "text-align: center; font-weight: bold;",
                                             width: 50,
                                             listeners: {
                                             afterrender: function () {
                                             this.fn = function () {
                                             let value = floatMinus(this.getValue().replace(/,/g, ""), 0);
                                             value = value == "" ? "0" : value;
                                             this.setValue(floatRenderer(value));
                                             };
                                             },
                                             Change: function (value) {
                                             this.fn();
                                             },
                                             },
                                             },*/
                                ],
                            },
                        ],
                    },
                    {
                        xtype: "fieldset",
                        title: "ข้อมูลการตัดเงิน ณ ตรวจรับ",
                        collapsible: true,
                        hidden: true,
                        // Ext.select_row.c_booking == null && (Ext.select_row.i_sav_by_sys == 5 || Ext.select_row.i_sav_by_sys == 4) ? false : true,
                        layout: "column",
                        labelWidth: 140, // label settings here cascade unless overridden
                        labelAlign: "right",
                        items: [
                            {
                                // column 1
                                columnWidth: 0.55,
                                xtype: "fieldset",
                                border: false,
                                items: [
                                    {
                                        xtype: "buttongroup",
                                        fieldLabel: "pr_id, po_id, chk_id",
                                        frame: false,
                                        border: false,
                                        items: [
                                            {
                                                xtype: "textfield",
                                                id: "dis_re_pr_id",
                                                width: 80,
                                                style: "text-align: center;font-weight:bold;background:#eee;",
                                                readOnly: true,
                                            },
                                            {
                                                xtype: "textfield",
                                                id: "dis_re_po_id",
                                                width: 80,
                                                style: "text-align: center;font-weight:bold;background:#eee;",
                                                readOnly: true,
                                            },
                                            {
                                                xtype: "textfield",
                                                id: "dis_re_chk_id",
                                                width: 80,
                                                style: "text-align: center;font-weight:bold;background:#eee;",
                                                readOnly: true,
                                            },
                                        ],
                                    },
                                    {
                                        fieldLabel: "แหล่งเงิน",
                                        id: "dis_re_dc_expense_budget_type_name",
                                        xtype: "textfield",
                                        width: 400,
                                        readOnly: true,
                                        style: {
                                            // "text-align": "center",
                                            background: "#EEEEEE",
                                            color: "#333",
                                            border: "1px solid #ADADAD",
                                        },
                                    },
                                    {
                                        fieldLabel: "รายการย่อย",
                                        id: "dis_re_bg_expense_name",
                                        xtype: "textfield",
                                        width: 400,
                                        readOnly: true,
                                        style: {
                                            // "text-align": "center",
                                            background: "#EEEEEE",
                                            color: "#333",
                                            border: "1px solid #ADADAD",
                                        },
                                    },
                                    {
                                        fieldLabel: "หน่วยงาน",
                                        id: "dis_re_dc_cost_name",
                                        xtype: "textfield",
                                        width: 400,
                                        readOnly: true,
                                        style: {
                                            // "text-align": "center",
                                            background: "#EEEEEE",
                                            color: "#333",
                                            border: "1px solid #ADADAD",
                                        },
                                    },
                                    {
                                        fieldLabel: "จำนวนเงิน",
                                        id: "dis_re_f_amt",
                                        xtype: "textfield",
                                        width: 150,
                                        readOnly: true,
                                        style: {
                                            "text-align": "right",
                                            "font-weight": "bold",
                                            background: "#EEEEEE",
                                            color: "#333",
                                            border: "1px solid #ADADAD",
                                        },
                                    },
                                ],
                            },
                            {
                                // column 2
                                columnWidth: 0.45,
                                xtype: "fieldset",
                                border: false,
                                items: [
                                    {
                                        fieldLabel: "โดยระบบ",
                                        id: "dis_re_sys_name",
                                        xtype: "textfield",
                                        width: 200,
                                        hidden: true,
                                        readOnly: true,
                                        style: {
                                            // "text-align": "center",
                                            background: "#EEEEEE",
                                            color: "#333",
                                            border: "1px solid #ADADAD",
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        xtype: "fieldset",
                        title: "ข้อมูลใบกันเงิน",
                        collapsible: true,
                        hidden: Ext.select_row.c_booking == null ? true : false,
                        layout: "column",
                        labelWidth: 140, // label settings here cascade unless overridden
                        labelAlign: "right",
                        items: [
                            {
                                // column 1
                                columnWidth: 0.55,
                                xtype: "fieldset",
                                border: false,
                                items: [
                                    {
                                        fieldLabel: "bg_budget_dtl_overlap_id",
                                        id: "dis_bg_budget_dtl_overlap_id",
                                        xtype: "textfield",
                                        width: 100,
                                        readOnly: true,
                                        style: {
                                            "text-align": "center",
                                            "font-weight": "bold",
                                            background: "#EEEEEE",
                                            color: "#333",
                                            border: "1px solid #ADADAD",
                                        },
                                    },
                                    {
                                        fieldLabel: "เลขที่ใบกันเงิน",
                                        id: "dis_c_code_ref",
                                        xtype: "textfield",
                                        width: 150,
                                        readOnly: true,
                                        style: {
                                            "text-align": "center",
                                            background: "#EEEEEE",
                                            color: "#333",
                                            border: "1px solid #ADADAD",
                                        },
                                    },
                                    {
                                        fieldLabel: "ปีงบประมาณ",
                                        id: "dis_i_year",
                                        xtype: "textfield",
                                        width: 55,
                                        readOnly: true,
                                        style: {
                                            "text-align": "center",
                                            background: "#EEEEEE",
                                            color: "#333",
                                            border: "1px solid #ADADAD",
                                        },
                                    },
                                    {
                                        fieldLabel: "แหล่งเงิน",
                                        id: "dis_dc_expense_budget_type_name",
                                        xtype: "textfield",
                                        width: 400,
                                        readOnly: true,
                                        style: {
                                            background: "#EEEEEE",
                                            color: "#333",
                                            border: "1px solid #ADADAD",
                                        },
                                    },
                                    {
                                        fieldLabel: "รายการย่อย",
                                        id: "dis_bg_expense_name",
                                        xtype: "textfield",
                                        width: 400,
                                        readOnly: true,
                                        style: {
                                            background: "#EEEEEE",
                                            color: "#333",
                                            border: "1px solid #ADADAD",
                                        },
                                    },
                                    {
                                        fieldLabel: "หน่วยงาน",
                                        id: "dis_dc_cost_name",
                                        xtype: "textfield",
                                        width: 400,
                                        readOnly: true,
                                        style: {
                                            background: "#EEEEEE",
                                            color: "#333",
                                            border: "1px solid #ADADAD",
                                        },
                                    },
                                    {
                                        fieldLabel: "การก่อหนี้/เจ้าหนี้",
                                        id: "dis_c_creditor",
                                        xtype: "textfield",
                                        width: 400,
                                        readOnly: true,
                                        style: {
                                            background: "#EEEEEE",
                                            color: "#333",
                                            border: "1px solid #ADADAD",
                                        },
                                    },
                                ],
                            },
                            {
                                // column 2
                                columnWidth: 0.45,
                                xtype: "fieldset",
                                border: false,
                                items: [
                                    {
                                        fieldLabel: "จำนวนครั้งที่ขยาย",
                                        id: "dis_i_extend_time",
                                        xtype: "textfield",
                                        width: 50,
                                        readOnly: true,
                                        style: "text-align: center;",
                                        style: {
                                            "text-align": "center",
                                            background: "#EEEEEE",
                                            color: "#333",
                                            border: "1px solid #ADADAD",
                                        },
                                    },
                                    {
                                        fieldLabel: "วันที่สิ้นสุดใบกันเงิน",
                                        xtype: "datefield",
                                        id: "dis_d_end_date",
                                        readOnly: true,
                                        width: 100,
                                        style: {
                                            "text-align": "center",
                                            background: "#EEEEEE",
                                            color: "#333",
                                            border: "1px solid #ADADAD",
                                        },
                                    },
                                    {
                                        xtype: "textfield",
                                        id: "dis_f_overlap",
                                        fieldLabel: "จำนวนเงินกัน",
                                        readOnly: true,
                                        width: 150,
                                        style: {
                                            "text-align": "right",
                                            "font-weight": "bold",
                                            background: "#EEEEEE",
                                            border: "1px solid #ADADAD",
                                        },
                                    },
                                    {
                                        xtype: "textfield",
                                        id: "dis_f_cancel",
                                        fieldLabel: "จำนวนเงินกันที่ถูกยกเลิก",
                                        readOnly: true,
                                        style: {
                                            "text-align": "right",
                                            "font-weight": "bold",
                                            background: "#EEEEEE",
                                            color: "red",
                                            border: "1px solid #ADADAD",
                                        },
                                        width: 150,
                                    },
                                    {
                                        xtype: "textfield",
                                        id: "dis_f_reserve",
                                        fieldLabel: "จำนวนจองเงินกัน",
                                        readOnly: true,
                                        style: {
                                            "text-align": "right",
                                            "font-weight": "bold",
                                            background: "#EEEEEE",
                                            color: "red",
                                            border: "1px solid #ADADAD",
                                        },
                                        width: 150,
                                    },
                                    {
                                        xtype: "textfield",
                                        id: "dis_f_working",
                                        fieldLabel: "จำนวนเงินที่เบิก",
                                        readOnly: true,
                                        style: {
                                            "text-align": "right",
                                            "font-weight": "bold",
                                            background: "#EEEEEE",
                                            color: "red",
                                            border: "1px solid #ADADAD",
                                        },
                                        width: 150,
                                    },
                                    {
                                        xtype: "textfield",
                                        id: "dis_f_total",
                                        fieldLabel: "จำนวนเงินกันคงเหลือ",
                                        readOnly: true,
                                        style: {
                                            "text-align": "right",
                                            "font-weight": "bold",
                                            background: "#EEEEEE",
                                            color: "green",
                                            border: "1px solid #ADADAD",
                                        },
                                        width: 150,
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        xtype: "fieldset",
                        title: "ข้อมูลการแก้ไขแหล่งเงินที่ 3",
                        collapsible: true,
                        id: "fieldset_edit_bg3",
                        layout: "column",
                        labelWidth: 140, // label settings here cascade unless overridden
                        labelAlign: "right",
                        items: [
                            {
                                // column 1
                                columnWidth: 0.55,
                                xtype: "fieldset",
                                border: false,
                                items: [
                                    {
                                        xtype: "textfield",
                                        width: 80,
                                        fieldLabel: "bg_reserve_money_pr",
                                        id: "bg_reserve_money_i_reserve1",
                                        hidden: true,
                                        name: "bg_reserve_money_i_reserve1",
                                        style: "text-align: center;font-weight:bold;background:#eee;",
                                        readOnly: true,
                                    },
                                    {
                                        xtype: "textfield",
                                        hidden: true,
                                        fieldLabel: "วันที่สร้าง",
                                        id: "d_create_reserve1",
                                        name: "d_create_reserve1",
                                        readOnly: true,
                                        width: 100,
                                    },
                                    {
                                        xtype: "radiogroup",
                                        columns: [98, 98],
                                        fieldLabel: "ขอดำเนินการ",
                                        id: "i_pr_typeID3",
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
                                                // if( Ext.selectRow.get("bg_reserve_money1_id") > 0 ){
                                                //   Ext.Msg.alert("แจ้งเตือน", "จองเงินไปแล้วไม่สามารถแก้ไขรายการได้");
                                                //   Ext.getCmp("i_pr_type1ID").setValue(Ext.selectRow.get("i_pr_type1"));
                                                // }
                                            }
                                        }
                                    },
                                    new Ext.form.ComboBox({
                                        fieldLabel: "แหล่งเงิน ",
                                        id: "dc_expense_budget_type_id3",
                                        name: "dc_expense_budget_type_id3",
                                        mode: "local",
                                        readOnly: true,
                                        store: Ext.dc_expense_budget_type,
                                        valueField: "id",
                                        displayField: "c_name",
                                        triggerAction: "all",
                                        forceSelection: true,
                                        selectOnFocus: true,
                                        typeAhead: false,
                                        emptyText: "กรุณาเลือก...",
                                        width: 300,
                                        readOnly: true,
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
                                    new Ext.form.ComboBox({
                                        fieldLabel: "รายการย่อย ", //  + Ext.select_row.bg_expense_bg_id + " ",
                                        id: "po_expense_id3",
                                        name: "po_expense_id3",
                                        mode: "local",
                                        store: Ext.bg_expense,
                                        readOnly: true,
                                        valueField: "id",
                                        displayField: "c_name",
                                        triggerAction: "all",
                                        forceSelection: true,
                                        selectOnFocus: true,
                                        typeAhead: false,
                                        emptyText: "กรุณาเลือก...",
                                        width: 300,
                                        readOnly: true,
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
                                    {
                                        xtype: "textfield",
                                        id: "f_type_amt3",
                                        name: "f_type_amt3",
                                        fieldLabel: "จำนวนเงินจัดสรร",
                                        style: "text-align: right; bold;color: blue; font-weight: bold;",
                                        width: 200,
                                        listeners: {
                                            afterrender: function () {
                                                this.fn = function () {
                                                    let value = floatMinus(this.getValue().replace(/,/g, ""), 2);
                                                    this.setValue(floatRenderer(value));
                                                };
                                            },
                                            Change: function (value) {
                                                this.fn();
                                            },
                                        },
                                    },
                                            // {
                                            //   fieldLabel: "เลขที่ฏีกา",
                                            //   xtype: "textfield",
                                            //   id: "bg_reserve_money_idasd",
                                            //   name: "bg_reserve_money_idasd",
                                            //   width: 300,
                                            // },
                                            // {
                                            //   fieldLabel: "เลขที่ใบกันเงิน",
                                            //   xtype: "textfield",
                                            //   id: "c_booking",
                                            //   name: "c_booking",
                                            //   width: 300,
                                            // },
                                ],
                            },
                            {
                                // column 2
                                columnWidth: 0.45,
                                xtype: "fieldset",
                                border: false,
                                items: [
                                    {
                                        fieldLabel: "bg_reserve_money_po",
                                        xtype: "textfield",
                                        width: 80,
                                        id: "bg_reserve_money_i_reserve2",
                                        name: "bg_reserve_money_i_reserve2",
                                        hidden: true,
                                        style: "text-align: center;font-weight:bold;background:#eee;",
                                        readOnly: true,
                                    },
                                    {
                                        xtype: "textfield",
                                        fieldLabel: "วันที่สร้าง",
                                        id: "d_create_reserve2",
                                        hidden: true,
                                        name: "d_create_reserve2",
                                        readOnly: true,
                                        width: 100,
                                    },
                                    {
                                        xtype: "radiogroup",
                                        columns: [98, 98],
                                        fieldLabel: "ขอดำเนินการขอแก้ไข",
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
                                                //   Ext.Msg.alert("แจ้งเตือน", "จองเงินไปแล้วไม่สามารถแก้ไขรายการได้");
                                                //   Ext.getCmp("i_pr_type1ID").setValue(Ext.selectRow.get("i_pr_type1"));
                                                // }
                                            }
                                        }
                                    },
                                    new Ext.form.ComboBox({
                                        fieldLabel: "แหล่งเงินขอแก้ไข ", //+ Ext.select_row.dc_budget_type_bg_id2 + " ",
                                        id: "dc_expense_budget_type_edit_id3",
                                        name: "dc_expense_budget_type_edit_id3",
                                        mode: "local",
                                        readOnly: true,
                                        store: Ext.dc_expense_budget_type,
                                        valueField: "id",
                                        displayField: "c_name",
                                        triggerAction: "all",
                                        forceSelection: true,
                                        selectOnFocus: true,
                                        typeAhead: false,
                                        emptyText: "กรุณาเลือก...",
                                        width: 300,
                                        readOnly: true,
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
                                    new Ext.form.ComboBox({
                                        fieldLabel: "รายการย่อยขอแก้ไข ",
                                        id: "po_expense_edit_id3",
                                        name: "po_expense_edit_id3",
                                        mode: "local",
                                        store: Ext.bg_expense,
                                        valueField: "id",
                                        displayField: "c_name",
                                        triggerAction: "all",
                                        forceSelection: true,
                                        selectOnFocus: true,
                                        typeAhead: false,
                                        emptyText: "กรุณาเลือก...",
                                        width: 300,
                                        readOnly: true,
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
                                    {
                                        xtype: "textfield",
                                        id: "f_total_amt_edit3",
                                        name: "f_total_amt_edit3",
                                        fieldLabel: "จำนวนเงินขอแก้ไข",
                                        style: "text-align: right; bold;color: blue; font-weight: bold;",
                                        width: 200,
                                        listeners: {
                                            afterrender: function () {
                                                this.fn = function () {
                                                    let value = floatMinus(this.getValue().replace(/,/g, ""), 2);
                                                    this.setValue(floatRenderer(value));
                                                };
                                            },
                                            Change: function (value) {
                                                this.fn();
                                            },
                                        },
                                    },
                                    {
                                        xtype: "buttongroup",
                                        frame: false,
                                        // width: 100,
                                        items: [
                                            {xtype: "tbspacer", width: 145},
                                            // { xtype: "label", text: "ลบรายการ : " },
                                            {
                                                iconCls: "icon-save-edit ",
                                                xtype: "button",
                                                // scale: "medium",
                                                id: "button3",

                                                text: "&nbsp;ยืนยันการแก้ไข&nbsp;",
                                                handler: function () {
                                                    editbgtor(3);
                                                },
                                            },
                                        ],
                                    },
                                            /*{
                                             fieldLabel: "จำนวนการทักท้วง",
                                             xtype: "textfield",
                                             id: "i_protest",
                                             name: "i_protest",
                                             style: "text-align: center; font-weight: bold;",
                                             width: 50,
                                             listeners: {
                                             afterrender: function () {
                                             this.fn = function () {
                                             let value = floatMinus(this.getValue().replace(/,/g, ""), 0);
                                             value = value == "" ? "0" : value;
                                             this.setValue(floatRenderer(value));
                                             };
                                             },
                                             Change: function (value) {
                                             this.fn();
                                             },
                                             },
                                             },*/
                                ],
                            },
                        ],
                    },
                ],
                buttonAlign: "left",
                buttons: [
                    {
                        text: "&nbsp;" + Ext.GLOBAL_BU_SAVE_TH + "&nbsp;",
                        id: "saveHdr",
                        iconCls: "icon-save",
                        hidden: true,
                        disabled: Ext.butt == "add" || Ext.butt == "edit" ? false : true,
                        handler: function () {
                            saveHdr(false);
                        },
                    },
                    {
                        text: Ext.GLOBAL_BU_BACK_TH,
                        hidden: true,
                        handler: function () {
                            // Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not errer
                        },
                    },
                ],
            }),
        ],
    });
}; // formAdd
Ext.extend(formAdd, Ext.Panel, {});
