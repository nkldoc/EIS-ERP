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
// ค่าเดิมก่อนแก้ไข (ตามที่จัดสรรไว้) ของแหล่งเงินที่ i
function getOriginalBg(i) {
    var row = Ext.select_row;
    return {
        dc_expense_budget_type: row["dc_expense_budget_type_id" + i],
        po_expense_id: row["po_expense_id" + i] || row.po_expense_id1,
        i_pr_type: row["i_pr_type" + i],
        f_amt: String(row["f_type_amt" + i] || 0).replace(/,/g, "") / 1,
    };
}
// เติมค่าที่ผู้ใช้ขอแก้ (ฝั่งขวา) ลงช่องจัดสรร (ฝั่งซ้าย) ให้พัสดุตรวจแล้วกดบันทึก ถ้ายังไม่เคยบันทึกแก้ไข
function prefillRequestedBg() {
    var row = Ext.select_row;
    for (var i = 1; i <= (row.i_amount_bg || 1); i++) {
        if (row["sp_bg_edit" + i] != 1) {
            continue;
        }
        var dc = row["dc_expense_budget_type_edit_id" + i];
        var po = row["po_expense_edit_id" + i];
        var amt = row["f_total_amt_edit" + i];
        if (!Ext.isEmpty(dc)) {
            Ext.getCmp("dc_expense_budget_type_id" + i).setValue(dc);
        }
        if (!Ext.isEmpty(po)) {
            Ext.getCmp("po_expense_id" + i).setValue(po);
        }
        if (!Ext.isEmpty(amt)) {
            Ext.getCmp("f_type_amt" + i).setValue(amt);
        }
    }
}
// เปิด/ปิด การแก้ไขช่องด้านซ้าย (ค่าที่จัดสรร) ของแหล่งเงินที่ i
function setEditableBg(i, editable) {
    Ext.each(["dc_expense_budget_type_id" + i, "po_expense_id" + i, "f_type_amt" + i], function (cmpId) {
        var cmp = Ext.getCmp(cmpId);
        if (cmp) {
            cmp.setReadOnly(!editable);
        }
    });
    var radio = Ext.getCmp("i_pr_typeID" + i);
    if (radio) {
        radio.setDisabled(!editable);
    }
}
function genBooklink(v, i) {
    var ii = i;
    var bg_reserve_id = "bg_reserve_money" + i;
    var bg_reserve_money_id = Ext.getCmp(bg_reserve_id).getValue();
    // ค่าใหม่ ใช้ค่าด้านซ้ายที่พัสดุแก้ไขตามที่หน่วยงานขอมา
    var dc_expense_budget_type = Ext.getCmp("dc_expense_budget_type_id" + i).getValue();
    var po_expense_id = Ext.getCmp("po_expense_id" + i).getValue();
    var i_type_pr = Ext.getCmp("i_pr_typeID" + i).getValue().inputValue;
    var original = getOriginalBg(i);
    var i_amount_bg = Ext.select_row.i_amount_bg;
    var f_total_amt = original.f_amt;
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
    // บันทึกรายการแก้ไขเท่านั้น ไม่จอง/ยกเลิกจองเงินใหม่ (ผู้ขอจองเงินไว้แล้ว)
    var cheVal = String(v).replace(/,/g, "") / 1;
    var c_name_dc_expense_budget_type = getStoreItems(Ext.dc_expense_budget_type, dc_expense_budget_type, "c_name");
    var c_name_po_expense_id = getStoreItems(Ext.bg_expense, po_expense_id, "c_name");
    Ext.getCmp("form-widgets").getEl().unmask();
    Ext.Msg.show({
        title: "แจ้งเตือน!",
        msg: "ยืนยันการบันทึกรายการแก้ไข<br>แหล่งเงิน : " + c_name_dc_expense_budget_type + "<br>รายการย่อย : " + c_name_po_expense_id,
        width: 450,
        buttons: Ext.MessageBox.YESNO,
        fn: function (btn) {
            if (btn !== "yes") {
                setDisabled_button(i, 1);
                return;
            }
            Ext.getCmp("form-widgets").getEl().mask("Please wait...", "x-mask-loading");
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
                    f_total: cheVal,
                    bg_reserve_money_id: bg_reserve_money_id,
                    i_edit: 2,
                    i_edit_tor: 5,
                    i_status: 2,
                    i_amount_bg: i_amount_bg,
                    // ค่าเดิมก่อนแก้ไข เก็บลง sp_tor_bg_log
                    dc_expense_budget_type_id_edit: original.dc_expense_budget_type,
                    po_expense_id_edit: original.po_expense_id,
                    bg_reserve_money_edit: bg_reserve_money_id,
                    f_type_amt: original.f_amt,
                    i_pr_type_edit: original.i_pr_type,
                    buy: 2,
                },
                success: function (result) {
                    var resSave = Ext.util.JSON.decode(result.responseText);
                    Ext.getCmp("form-widgets").getEl().unmask();
                    if (resSave.reval != 0) {
                        setDisabled_button(i, 1);
                        Ext.MessageBox.alert("Failed", resSave.msg);
                        return;
                    }
                    // บันทึกแล้ว ล็อกช่องไว้ รอพัสดุกด "ส่งคืน" ให้ผู้ขอ
                    Ext.select_row["sp_bg_edit" + i] = 2;
                    setEditableBg(i, false);
                    Ext.MessageBox.alert("Success", "บันทึกรายการแก้ไขเรียบร้อยแล้ว<br>กรุณากดปุ่ม \"ส่งคืน\" เพื่อส่งรายการคืนผู้ขอแก้ไข", function () {
                        var alert_text = "มีการยืนยันการแก้ไขแหล่งเงิน " + "\n";
                        alert_text += "วันเวลา : " + new Date().toLocaleString("en-ZA") + "\n";
                        alert_text += "PR : " + Ext.select_row.c_code + "\n";
                        alert_text += "แหล่งเงินจัดสรร : " + getStoreItems(Ext.dc_expense_budget_type, original.dc_expense_budget_type, "c_name") + "\n";
                        alert_text += "แหล่งเงินแก้ไข : " + c_name_dc_expense_budget_type + "\n";
                        alert_text += "หมวดค่าใช้จ่ายจัดสรร : " + getStoreItems(Ext.bg_expense, original.po_expense_id, "c_name") + "\n";
                        alert_text += "หมวดค่าใช้จ่ายแก้ไข : " + c_name_po_expense_id + "\n";
                        alert_text += "จำนวนเงินจัดสรร : " + floatRenderer(floatMinus(String(f_total_amt).replace(/,/g, ""), 2)) + "\n";
                        alert_text += "จำนวนเงินแก้ไข : " + floatRenderer(floatMinus(String(v).replace(/,/g, ""), 2)) + "\n";
                        alert_text += "ชื่อผู้ดำเนินรายการ : " + Ext.session.user_name + "\n";
                        alert_text += "ชื่อรายการ : " + Ext.select_row.c_name + "\n";
                        Ext.Ajax.request({
                            url: Ext.session.Notif_line,
                            method: "POST",
                            params: {msg: alert_text, mode: 3},
                        });
                        Ext.store.load({
                            callback: function () {
                                Ext.storeDtl.reload();
                            },
                        });
                    });
                },
                failure: function (result) {
                    Ext.getCmp("form-widgets").getEl().unmask();
                    setDisabled_button(i, 1);
                    Ext.MessageBox.alert("Failed", result.responseText);
                },
            });
        },
    });

    return link;
}
const notifyEditBg = function (title, comment) {
    var alert_text = title + "\n";
    alert_text += "วันเวลา : " + new Date().toLocaleString("en-ZA") + "\n";
    alert_text += "PR : " + Ext.select_row.c_code + "\n";
    alert_text += "ชื่อรายการ : " + Ext.select_row.c_name + "\n";
    alert_text += "หมายเหตุ : " + comment + "\n";
    alert_text += "ส่งถึง : " + (Ext.select_row.sp_emp_pr || "") + "\n";
    alert_text += "ชื่อผู้ดำเนินรายการ : " + Ext.session.user_name + "\n";
    Ext.Ajax.request({
        url: Ext.session.Notif_line,
        method: "POST",
        params: {msg: alert_text, mode: 3},
    });
};
// ปิดรายการขอแก้ไข แล้วส่งคืนผู้ขอ (ออกจากรายการ PR แก้ไขเงิน)
const closeEditBgRequest = function (comment, callback) {
    Ext.Ajax.request({
        url: "./tor/api/mnCancelEditBg.php",
        method: "POST",
        params: {
            id: Ext.select_row.id,
            mode: "return",
            comment: comment,
        },
        success: function (response) {
            var res = Ext.decode(response.responseText);
            Ext.getCmp("form-widgets").getEl().unmask();
            if (res.reval == 0) {
                callback();
            } else {
                Ext.Msg.alert("Error", res.msg);
            }
        },
        failure: function (response) {
            Ext.getCmp("form-widgets").getEl().unmask();
            Ext.getCmp("tabpanel1").getStore().reload();
            Ext.Msg.alert("Error", "Server error (HTTP " + response.status + ")<br>กรุณาตรวจสอบรายการอีกครั้ง");
        },
    });
};
const finishEditBg = function (msg) {
    Ext.Msg.alert("สำเร็จ", msg, function () {
        Ext.getCmp("tabpanel1").getStore().reload();
        Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true);
    });
};
const promptComment = function (title, defaultText, fn) {
    Ext.Msg.show({
        title: title,
        msg: "กรุณาระบุหมายเหตุ:",
        width: 400,
        buttons: Ext.Msg.OKCANCEL,
        multiline: true,
        value: defaultText,
        fn: function (btn, text) {
            if (btn != "ok") {
                return;
            }
            if (!text || text.trim() === "") {
                Ext.Msg.alert("แจ้งเตือน", "กรุณากรอกหมายเหตุ", function () {
                    promptComment(title, defaultText, fn);
                });
                return;
            }
            fn(text.trim());
        },
    });
};
// ส่งคืน : พัสดุแก้ไขตามที่ขอแล้ว ส่งรายการคืนให้ผู้ขอแก้ไขอัตโนมัติ
const returnEditBg = function () {
    var unsaved = [];
    for (var i = 1; i <= (Ext.select_row.i_amount_bg || 1); i++) {
        if (Ext.select_row["sp_bg_edit" + i] != 2) {
            unsaved.push(i);
        }
    }
    var doReturn = function () {
        promptComment("ส่งคืนผู้ขอแก้ไข", "แก้ไขแหล่งเงินตามที่ขอเรียบร้อยแล้ว", function (text) {
            Ext.getCmp("form-widgets").getEl().mask("Please wait...", "x-mask-loading");
            closeEditBgRequest(text, function () {
                notifyEditBg("ส่งคืนรายการขอแก้ไขแหล่งเงิน", text);
                finishEditBg("ส่งคืนรายการให้ " + (Ext.select_row.sp_emp_pr || "ผู้ขอแก้ไข") + " เรียบร้อยแล้ว");
            });
        });
    };
    if (unsaved.length > 0) {
        Ext.Msg.confirm("ยืนยัน", "ยังไม่ได้กด \"บันทึกรายการแก้ไข\" (แหล่งเงินที่ " + unsaved.join(", ") + ")<br>ต้องการส่งคืนโดยไม่แก้ไขใช่หรือไม่?", function (btn) {
            if (btn == "yes") {
                doReturn();
            }
        });
    } else {
        doReturn();
    }
};
// ยกเลิก PR : ผู้ขอแจ้งให้ยกเลิกรายการ PR นี้
const cancelPrEditBg = function () {
    Ext.Msg.confirm("ยืนยัน", "ต้องการยกเลิก PR " + Ext.select_row.c_code + " ใช่หรือไม่?<br><span style='color:red'>การจองเงินทั้งหมดของ PR นี้จะถูกยกเลิก และไม่สามารถย้อนกลับได้</span>", function (btn) {
        if (btn != "yes") {
            return;
        }
        promptComment("หมายเหตุยกเลิก PR", "ยกเลิก PR ตามที่หน่วยงานขอ", function (text) {
            Ext.getCmp("form-widgets").getEl().mask("Please wait...", "x-mask-loading");
            Ext.Ajax.request({
                url: "tor/api/mnTorController.php",
                method: "POST",
                params: {
                    mode: "Cancel_Tor",
                    id: Ext.select_row.id,
                    sp_status_hdr_id: Ext.select_row.tor_status_id,
                    c_comment_delete: text,
                    sp_emp_id: Ext.select_row.sp_emp_id,
                    i_type_delete: 2,
                },
                success: function (result) {
                    var res = Ext.util.JSON.decode(result.responseText);
                    if (res.reval != 0) {
                        Ext.getCmp("form-widgets").getEl().unmask();
                        Ext.MessageBox.alert("Failed", res.msg);
                        return;
                    }
                    closeEditBgRequest("ยกเลิก PR : " + text, function () {
                        notifyEditBg("ยกเลิก PR ตามคำขอแก้ไขแหล่งเงิน", text);
                        finishEditBg("ยกเลิก PR " + Ext.select_row.c_code + " เรียบร้อยแล้ว");
                    });
                },
                failure: function (result) {
                    Ext.getCmp("form-widgets").getEl().unmask();
                    Ext.MessageBox.alert("Failed", result.responseText);
                },
            });
        });
    });
};
const editbgtor = function (i) {
    let msg = "";
    if (Ext.isEmpty(Ext.getCmp("i_pr_typeID" + i).getValue())) {
        msg += "- กรุณาเลือกขอดำเนินการ (จองแบบแผน/จองแบบงวด)<br>";
    }
    if (Ext.isEmpty(Ext.getCmp("dc_expense_budget_type_id" + i).getValue())) {
        msg += "- กรุณาเลือกแหล่งเงินที่จัดสรร<br>";
    }
    if (Ext.isEmpty(Ext.getCmp("po_expense_id" + i).getValue())) {
        msg += "- กรุณาเลือกรายการย่อยที่จัดสรร<br>";
    }
    if (!(String(Ext.getCmp("f_type_amt" + i).getValue()).replace(/,/g, "") / 1 > 0)) {
        msg += "- กรุณาระบุจำนวนเงินที่จอง<br>";
    }
    if (msg != "") {
        setDisabled_button(i, 1);
    }

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
                            var f_totals = Ext.getCmp("f_type_amt" + i).getValue();
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
                // ด้านซ้าย (ค่าที่จัดสรร) ให้พัสดุแก้ไขได้ จนกว่าจะบันทึกรายการแก้ไข
                for (var i = 1; i <= 3; i++) {
                    setEditableBg(i, Ext.select_row["sp_bg_edit" + i] != 2);
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
                                            {
                                                iconCls: "icon-button-save", //icon-save-true
                                                xtype: "button",
                                                id: "button1",
                                                text: "บันทึกรายการแก้ไข",
                                                tooltip: "จองเงินใหม่ตามค่าด้านซ้าย (แหล่งเงิน/รายการย่อย/จำนวนเงินที่จัดสรร)",
                                                handler: function () {
                                                    this.setDisabled(true);
                                                    editbgtor(1);
                                                },
                                            },
                                            {xtype: "tbspacer", width: 10},
                                            {
                                                iconCls: "icon-arrow_undo",
                                                xtype: "button",
                                                text: "ส่งคืน",
                                                tooltip: "ส่งรายการคืนผู้ขอแก้ไข หลังแก้ไขเรียบร้อยแล้ว",
                                                handler: function () {
                                                    returnEditBg();
                                                },
                                            },
                                            {xtype: "tbspacer", width: 10},
                                            {
                                                iconCls: "icon-cancel",
                                                xtype: "button",
                                                text: "ยกเลิก PR",
                                                tooltip: "ยกเลิก PR นี้ตามที่ผู้ขอแจ้ง (ยกเลิกการจองเงินทั้งหมด)",
                                                handler: function () {
                                                    cancelPrEditBg();
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
                                                text: "&nbsp;บันทึกรายการแก้ไข&nbsp;",
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

                                                text: "&nbsp;บันทึกรายการแก้ไข&nbsp;",
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
