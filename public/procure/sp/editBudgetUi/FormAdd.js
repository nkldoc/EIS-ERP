formAdd = function (data) {
    const save_budget = function () {
        let msg = "";

        if (Ext.getCmp("f_reserve_money_pr").getValue() == "") {
            msg += "<span style='white-space: nowrap;'>- กรุณากรอก จำนวนงบประมาณ (หนึ่ง)</span><br>";
        }
        if (Ext.getCmp("f_budget_pr").getValue() == "") {
            msg += "<span style='white-space: nowrap;'>- กรุณากรอก จำนวนงบประมาณ (สอง)</span><br>";
        }

        if (msg == "") {
            var win = new Ext.Window({
                id: "MessageBox_save_budget",
                title: "ยันยืนการบันทึกงบประมาณ",
                modal: true,
                width: 350,
                items: [
                    {
                        xtype: "form",
                        id: "form-confirm-budget",
                        frame: true,
                        labelAlign: "right",
                        labelWidth: 0.1,
                        bodyStyle: {padding: "10px 20px"},
                        defaults: {anchor: "100%", msgTarget: "side"},
                        items: [
                            {
                                xtype: "displayfield",
                                id: "displaytext",
                                width: 300,
                                value: "ยืนยันการบันทึกงบประมาณสัญญา",
                                style: "text-align: center; font-weight: bold; white-space: nowrap;",
                            },
                            {
                                xtype: "textfield",
                                enableKeyEvents: true,
                                id: "confirm_text_budget",
                                width: 300,
                                value: "",
                                style: "text-align: center;",
                                emptyText: 'กรุณากรอก "ยืนยัน" เพื่อบันทึกรายการ',
                                listeners: {
                                    keyup: function () {
                                        if (Ext.getCmp("confirm_text_budget").getValue() == "ยืนยัน") {
                                            Ext.getCmp("Save_budget_confirm").setDisabled(false);
                                        } else {
                                            Ext.getCmp("Save_budget_confirm").setDisabled(true);
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
                        id: "Save_budget_confirm",
                        iconCls: "icon-save",
                        disabled: true,
                        handler: function () {
                            Ext.getCmp("MessageBox_save_budget").hide();
                            Ext.getCmp("MessageBox_save_budget").destroy();
                            Ext.getCmp("frm-Add").getEl().mask("Please wait...", "x-mask-loading");

                            const form = Ext.getCmp("frm-Add").getForm();
                            const url = "./editBudgetUi/php/mn_editContractBudgetController.php";

                            form.submit({
                                url: url,
                                waitMsg: "Saving Budget...",
                                params: {
                                    mode: "SAVE_BUDGET_RESERVE",
                                    id: Ext.HDR_ID,
                                    sp_tor_contract_id: Ext.contract_id,
                                },
                                success: function (form, action) {
                                    Ext.getCmp("frm-Add").getEl().unmask();
                                    const res = Ext.decode(action.response.responseText);

                                    Ext.Msg.alert("สำเร็จ", res.msg || "บันทึกข้อมูลเรียบร้อย", function () {
                                        Ext.store.load({params: {mode: ""}});
                                        Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true);
                                    });
                                },
                                failure: function (form, action) {
                                    Ext.getCmp("frm-Add").getEl().unmask();
                                    Ext.Msg.alert("ล้มเหลว", action.response.responseText || "ไม่สามารถบันทึกข้อมูล");
                                },
                            });
                        },
                    },
                    {xtype: "tbfill"},
                    {
                        text: "ย้อนกลับ",
                        handler: function () {
                            Ext.getCmp("MessageBox_save_budget").hide();
                            Ext.getCmp("MessageBox_save_budget").destroy();
                        },
                    },
                ],
            }).show();
        } else {
            Ext.Msg.alert("แจ้งเตือน", msg);
        }
    };

    return new Ext.TabPanel({
        id: "frm-Add",
        title: "แก้ไขงบประมาณ - " + (data.c_contract_no || ""),
        closable: true,
        activeTab: 0,
        frame: true,
        items: [
            {
                title: "ข้อมูลสัญญา",
                layout: "form",
                labelWidth: 150,
                bodyStyle: "padding:10px",
                autoScroll: true,
                frame: true,
                defaults: {anchor: "100%", msgTarget: "side"},
                items: [
                    {
                        xtype: "textfield",
                        fieldLabel: "เลขที่สัญญา",
                        name: "c_contract_no",
                        value: data.c_contract_no || "",
                        readOnly: true,
                        style: {background: "#EEEEEE", "font-weight": "bold", color: "red"},
                    },
                    {
                        xtype: "textfield",
                        fieldLabel: "ผู้ขาย/ผู้รับจ้าง",
                        name: "c_creditor_name",
                        value: data.c_creditor_name || "",
                        readOnly: true,
                        style: {background: "#EEEEEE", "font-weight": "bold"},
                    },
                    {
                        xtype: "textfield",
                        fieldLabel: "แหล่งเงิน",
                        name: "c_expense_budget_type_name",
                        value: data.c_expense_budget_type_name || "",
                        readOnly: true,
                        style: {background: "#EEEEEE", "font-weight": "bold"},
                    },
                    {
                        xtype: "textfield",
                        fieldLabel: "หมวดค่าใช้จ่าย",
                        name: "c_expense_name",
                        value: data.c_expense_name || "",
                        readOnly: true,
                        style: {background: "#EEEEEE", "font-weight": "bold"},
                    },
                    {
                        xtype: "textfield",
                        fieldLabel: "จำนวนเงินทั้งสิ้น",
                        name: "f_contract_total",
                        value: data.f_contract_total ? floatRenderer(data.f_contract_total) : "0.00",
                        readOnly: true,
                        style: {background: "#EEEEEE", "font-weight": "bold", color: "green"},
                    },
                ],
            },
            {
                title: "แก้ไขงบประมาณ",
                layout: "form",
                labelWidth: 150,
                bodyStyle: "padding:10px",
                autoScroll: true,
                frame: true,
                defaults: {anchor: "100%", msgTarget: "side"},
                items: [
                    {
                        xtype: "hidden",
                        name: "id",
                        value: data.id || "",
                    },
                    {
                        xtype: "hidden",
                        name: "sp_tor_contract_id",
                        value: data.sp_tor_contract_id || "",
                    },
                    {
                        xtype: "numberfield",
                        fieldLabel: "จำนวนงบประมาณ (หนึ่ง)",
                        id: "f_reserve_money_pr",
                        name: "f_reserve_money_pr",
                        value: data.f_reserve_money_pr || 0,
                        allowBlank: false,
                        style: {background: "#FFFACD", "font-weight": "bold", color: "blue"},
                    },
                    {
                        xtype: "numberfield",
                        fieldLabel: "จำนวนงบประมาณ (สอง)",
                        id: "f_budget_pr",
                        name: "f_budget_pr",
                        value: data.f_budget_pr || 0,
                        allowBlank: false,
                        style: {background: "#FFFACD", "font-weight": "bold", color: "blue"},
                    },
                    {
                        xtype: "displayfield",
                        fieldLabel: "งบประมาณคงเหลือ",
                        id: "f_budget_remain_display",
                        name: "f_budget_remain",
                        value: data.f_budget_remain ? floatRenderer(data.f_budget_remain) : "0.00",
                        style: {background: "#E4FFE4", "font-weight": "bold", color: "green"},
                    },
                    {
                        xtype: "textfield",
                        fieldLabel: "แก้ไขเมื่อ",
                        name: "d_last_modify_dt",
                        value: data.d_last_modify_dt || "",
                        readOnly: true,
                        style: {background: "#EEEEEE", "font-weight": "bold"},
                    },
                ],
            },
        ],
        buttons: [
            {
                text: "&nbsp;บันทึกข้อมูล&nbsp;",
                icon: "../images/icons/accept.png",
                handler: function () {
                    save_budget();
                },
            },
            {
                text: "ย้อนกลับ",
                handler: function () {
                    Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true);
                },
            },
        ],
    });
};
