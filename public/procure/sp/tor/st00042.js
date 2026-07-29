/* global Ext, user_right_add, user_right_edit, user_right_delete */
Ext.fnDisMenuEmp = function (is) {
    //1445  Ext.fnDis(Ext.isAudit);
    if (is === false) {
        //                    Ext.getCmp('i_ren_bgTypeID').hide();

        Ext.getCmp("buttonDtlID").hide();
    } else {
        Ext.getCmp("tabpanel1").getColumnModel(); // .removeColumn(3,true)
    }
    if (Ext.selectRow.get("i_purchase") > 1)
        Ext.getCmp("purchase1ID").hide();
};

Ext.fnDisBook = function (is) {
    //1445  Ext.fnDis(Ext.isAudit);
    if (is === false) {
        Ext.getCmp("button1").hide();
        Ext.getCmp("button2").hide();
        Ext.getCmp("button3").hide();
        Ext.getCmp("button4").hide();
        Ext.getCmp("button5").hide();
    }
};

AddTor = function (record, butt) {
    Ext.DTL = null;
    if (butt == "ADD") {
        winADD(butt);
    } else if (butt == "EDIT") {
        Ext.DTL = Ext.selectRow.get("id");
        winADD(butt);
    }
};
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
sumtopbar = function () {
    var i = 0;
    var max = Ext.store2.data.length - 1;
    var sumtop = 0;
    var str = "";
    while (i <= max) {
        str = Ext.store2.data.items[i].data.f_total_amt;
        sumtop += parseInt(str.replace(/\,/g,''));
        i++;
    }
    if (sumtop != 0) {
        var textsum = "<span style=' font-size: 13px; white-space: nowrap;'>ราคารวม : ";
        textsum += sumtop.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " บาท</span>";
        Ext.getCmp("sumtop").setText(textsum);
    } else {
        Ext.getCmp("sumtop").setText("");
    }
};

DeleteTor_dtl = function (record) {
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
                            mode: "DELETE_TOR_DTL",
                            id: record.get("id"),
                        },
                        method: "GET", //POST
                        success: function (result, request) {
                            Ext.storeDtl.reload({
                                callback: function (recordx, operation, success) {
                                    if (success) {
                                        Ext.getCmp("win-msg-delete").destroy();
                                        Ext.store2.load({
                                            params: {id: Ext.HDR_ID},
                                            callback: function (records, operation, success) {
                                                // sumtopbar();
                                                // Ext.Msg.alert("แจ้งเตือน", "ลบข้อมูลเรียบร้อย");
                                                Ext.getCmp('winMain').destroy();
                                                // Ext.getCmp("tabpanelMain4ID").getForm().reset();
                                                // Ext.getCmp("editDtlID").hide();
                                                // Ext.getCmp("tabpanelMain4ID").setHeight(488);
                                                // Ext.getCmp("tabpanelMain4ID").setTitle("ข้อมูลรายละเอียดรายการจัดซื้อ<br>&nbsp;");
                                            },
                                        })
                                    }
                                }
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
                            fieldLabel: "รายการย่อย 1",
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
                                    console.log(this);
                                },
                            },
                        }),
                        {
                            xtype: "radiogroup",
                            columns: [98, 110],
                            fieldLabel: "ลักษณะการจ้าง 1",
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
                                change: function () {
                                    if (this.getValue().inputValue == 0) {
                                        Ext.getCmp("i_product_type2ID").hide();
                                        //                              Ext.getCmp("i_is_invG2ID").hide();
                                    } else {
                                        Ext.getCmp("i_product_type2ID").show();
                                        //                              Ext.getCmp("i_is_invG2ID").show();
                                    }
                                },
                            },
                        },
                        {
                            xtype: "radiogroup",
                            columns: [98, 98],
                            fieldLabel: "ของที่ได้มา",
                            id: "i_product_type2ID",
                            name: "i_product_type",
                            items: [
                                {
                                    checked: true,
                                    name: "i_product_type",
                                    inputValue: 1,
                                    boxLabel: "วัสดุ",
                                },
                                {
                                    checked: true,
                                    inputValue: 2,
                                    name: "i_product_type",
                                    boxLabel: "ครุภัณฑ์",
                                },
                            ], //radiogroup
                            listeners: {
                                change: function () {
                                    // Ext.getCmp("i_is_invG2ID").fn(this.getValue().inputValue);
                                },
                                afterrender: function () {
                                    console.log(Ext.getCmp("i_hire_type2ID").getValue().inputValue);
                                    if (Ext.getCmp("i_hire_type2ID").getValue().inputValue == 0) {
                                        Ext.getCmp("i_product_type2ID").hide();
                                        //                               Ext.getCmp("i_is_invG2ID").hide();
                                    } else {
                                        Ext.getCmp("i_product_type2ID").show();
                                        //                             Ext.getCmp("i_is_invG2ID").show();
                                    }
                                },
                            },
                        },
                        /*{
                         xtype: "checkboxgroup",
                         fieldLabel: "การจัดเก็บ",
                         name: "i_is_inv",
                         id: "i_is_invG2ID",
                         items: [
                         {
                         id: "i_is_invG2IDs1",
                         boxLabel: "เข้าคลัง",
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
                         },*/
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
                            fieldLabel: "หน่วยนับ",
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
                text: "Save",
                handler: function () {
                    Ext.saveDTL(false);
                },
            },
            {
                text: "Cancel",
                handler: function () {
                    // Ext.saveDTL(false);
                    Ext.getCmp("win-frm-dtlID").destroy();
                },
            },
        ],
    });

    Ext.store2.load({
        callback: function (recordx, operation, success) {
            if (success) {
                var win = new Ext.Window({
                    id: "win-frm-dtlID",
                    layout: "fit",
                    width: 1000,
                    height: 400,
                    //  closeAction: 'hide',
                    plain: true,
                    modal: true,
                    items: tabs,
                });
                //                                                                             console.log(Ext.getCmp("win-frm-dtlID"));
                var rec = Ext.selectRow;

                // rec.set("c_name", null);
                // console.log(rec);
                if (butt == "EDIT") {
                    Ext.getCmp("win-frm-dtlID").items.items[0].getForm().loadRecord(rec);
                } else if (butt == "ADD") {
                    Ext.getCmp("win-frm-dtlID").items.items[0].getForm().loadRecord(Ext.selectDefault);
                }

                win.show();
                sumtopbar();
            }
        },
    });
};
Ext.saveDTL = function (type) {
    let msg = "";
    if (Ext.getCmp("dc_expense_budget_type_idTxtID").getValue() == "") {
        //    msg += "<span style='white-space: nowrap;'>- กรุณาเลือก แหล่งเงิน</span><br>";
    }
    // if (Ext.getCmp("po_expense_idID").getValue() == "") {
    //    msg += "<span style='white-space: nowrap;'>- กรุณาเลือก รายการย่อย</span><br>";
    // }
    if (Ext.getCmp("i_hire_type2ID").getValue().inputValue == null) {
        msg += "<span style='white-space: nowrap;'>- กรุณาเลือก ลักษณะการจ้าง</span><br>";
    } else if (Ext.getCmp("i_hire_type2ID").getValue().inputValue == 1) {
        if (Ext.getCmp("i_product_type2ID").items.items[0].checked == false && Ext.getCmp("i_product_type2ID").items.items[1].checked == false) {
            msg += "<span style='white-space: nowrap;'>- กรุณาเลือก ของที่ได้มา</span><br>";
        }
    }
    if (Ext.getCmp("c_nameID").getValue() == "") {
        msg += "<span style='white-space: nowrap;'>- กรุณากรอก ชื่อรายการ</span><br>";
    }
    if (Ext.getCmp("i_qtyID").getValue() == "") {
        msg += "<span style='white-space: nowrap;'>- กรุณากรอก จำนวน</span><br>";
    }
    // if (Ext.getCmp("f_unit_costID").getValue() == "") {
    //   msg += "<span style='white-space: nowrap;'>- กรุณากรอก ราคา/ต่อหน่วย</span><br>";
    // }

    /*if (Ext.getCmp("f_bg_peroidID").getValue() == "0" || Ext.getCmp("f_bg_peroidID").getValue() == "0.00" || Ext.getCmp("f_bg_peroidID").getValue() == "") {
     msg += "<span style='white-space: nowrap;'>- กรุณาตรวจสอบเงินตางวดตามแหล่งเงิน</span><br>";
     }*/ //จองเงิน
    if (Ext.getCmp("dc_unit_type_idID").getValue() == "") {
        msg += "<span style='white-space: nowrap;'>- กรุณาเลือก หน่วยนับ</span><br>";
    }

    if (msg == "") {
        if (Ext.getCmp("i_hire_type2ID").getValue().inputValue == 1) {
            i_product_type = Ext.getCmp("i_product_type2ID").getValue().inputValue;
        } else {
            i_product_type = null;
        }
        // console.log(i_product_type);
        // return false
        //   Ext.getCmp("frm-Add").getEl().mask("Please wait...", "x-mask-loading");
        var dtl_id = "";
        if (type == "EDIT_DTL") {
            dtl_id = Ext.getCmp("sp_tor_dtl_idID").getValue();
        }


//    console.log(Ext.selectRow.get('i_purchase')>1?null:Ext.getCmp("i_pr_type1_dtl_ID").getValue().inputValue);
//    return false;
        Ext.Ajax.request({
            url: "tor/api/mnTorController.php",
            method: "POST",
            params: {
                mode: "UP_SP_TOR_DTL1",
                id: Ext.HDR_ID,
                dtl_id: dtl_id,
                dc_expense_budget_type_idTxtID: Ext.getCmp("dc_expense_budget_type_idTxtID").getValue(),
                po_expense_idID: Ext.getCmp("po_expense_id_dtlID").getValue(),
                i_hire_type2ID: Ext.getCmp("i_hire_type2ID").getValue().inputValue,
                i_product_type2ID: i_product_type,
                //             i_is_invG2ID: Ext.getCmp("i_is_invG2IDs1").getValue() == true ? 1 : "",
                c_nameID: Ext.getCmp("c_nameID").getValue(),
                f_unit_costID: Ext.getCmp("f_unit_costID").getValue() == "" ? 0 : Ext.getCmp("f_unit_costID").getValue().replace(/,/g, ""),
                i_qtyID: Ext.getCmp("i_qtyID").getValue(),
                i_pr_type1: Ext.selectRow.get('i_purchase') > 1 ? null : Ext.getCmp("i_pr_type1_dtl_ID").getValue().inputValue,
                dc_unit_type_idID: Ext.getCmp("dc_unit_type_idID").getValue(),
            },
            success: function (result, request)
            {
                Ext.storeDtl.reload({
                    callback: function (recordx, operation, success) {
                        if (success) {
                            Ext.getCmp('winMain').destroy();
                            Ext.store2.setBaseParam("tor_id", Ext.HDR_ID);
                            Ext.store2.load({
                                callback: function (recordx, operation, success) {
                                    if (success) {
                                        Ext.Msg.alert("แจ้งเตือน", "บันทึกเรียบร้อย");
                                        sumtopbar();
                                        if (type == "SAVE_DTL") {
                                            var inputEl = Ext.getCmp("gridSub5ID").getView().scroller.dom;
                                            inputEl.scrollTop = inputEl.scrollHeight;
                                        }
                                    }
                                },
                            });
                        }
                    }
                });
                // Ext.getCmp("win-frm-dtlID").destroy();
            },
        });
    } else {
        Ext.Msg.alert("แจ้งเตือน", msg);
    }
}; // saveDTL
Ext.AppUx = function (app, menu) {
    Ext.user_right_add = user_right_add;
    Ext.user_right_edit = user_right_edit;
    Ext.user_right_delete = user_right_delete;
    Ext.title = Ext.menu_name + " " + Ext.menu_code;
    //Ext.menu_i_entrance;
    Ext.HDR_ID = null;
    Ext.selectRow = [];
    Ext.menuEditGrid = true;
    Ext.menuRightEditgrid = true;
    Ext.tor_type_id = 1; // default start เจาะจงน้อวกว่า 5 แสน
    Ext.i_is_more = 0;
    /*tor_type_id,i_is_more*/
    Ext.tor_type_idTxt = Ext.apply({
        tor_type_id1: {0: "แบบมีหัวงาน/ฝ่าย พิจารณาผล(ไม่เกิน 5 แสนบาท)", 1: "แบบมีคณะกรรมการ พิจารณาผล(เกิน 5 แสนแสนบาท)"},
    });
    //Ext.menuCode = 'ST0005';
    Ext.status = Ext.apply({
        name: menu,
        process: function (menuCode, record) {
            Ext.Ajax.request({
                url: "tor/api/mnTorController.php",
                params: {
                    mode: "UPDATENEXTSTEP",
                    menuCode: menuCode,
                    i_seq: Ext.menu_i_seq,
                    tor_status_id: record.get("tor_status_id"),
                    tor_type_id: record.get("tor_type_id"),
                    i_entrance: Ext.menu_i_entrance, //เมนูแยก
                    menuback: Ext.menuback,
                    i_backword: Ext.i_backword,
                    c_comment: Ext.getCmp("reasonID").getValue(),
                    i_is_more: record.get("i_is_more"),
                    i_is_entrance: record.get("i_is_entrance"), //สถานะในเมนูแยก
                    i_type_bg : record.get("i_type_bg"),
                    id: record.get("id"),
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
    Ext.i_bg_type = null;
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
    function cellClick(grid, rowIndex, columnIndex, e) {
        var record = grid.getStore().getAt(rowIndex);
        Ext.selectRow = record;
        if (columnIndex === grid.getColumnModel().getIndexById("processDueID")) {
            //ttf
            controller(Ext.selectRow, "processUpdate"); //on
        } else if (columnIndex === grid.getColumnModel().getIndexById("editEmpTorID")) {
            controller(Ext.selectRow, "editEmpTorID");
        }
    }

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
                    value: "<b style='font-size:12px;'> " + rec.get("txtsp_emp_idID") + " ?</b>",
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
//                        console.log(Ext.getCmp("modesubID").getValue());
//                        console.log(Ext.selectRow.get("bg_check_id"));

                        if (Ext.getCmp("modesubID").getValue().inputValue == "GOTOSTEP") {
//                            console.log(Ext.selectRow);
//  alert(Ext.selectRow.get('i_bg_type'));
//  return false;
                            if (Ext.selectRow.get('i_bg_type') !==1 && Ext.selectRow.get("bg_check_id") < 1 && Ext.selectRow.get("i_type_bg") != 2 && Ext.selectRow.get("i_type_bg") != 4) {
                                
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
                    text: Ext.GLOBAL_BU_BACK_TH,
                    iconCls: "icon-clear",
                    handler: function () {
                        Ext.getCmp("win-processID").destroy(); // clear memory :: garbage collection
                    },
                },
            ],
        }).show();
    }
    function controller(rec, status) {
        if (status === "processUpdate") {
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
            var columnMini = [
                {header: "ID System", sortable: true, hidden: true, dataIndex: "id"},
                {header: "รหัส", sortable: true, dataIndex: "c_code"},
                {
                    header: "ผู้ปฎิบัตงาน",
                    sortable: true,
                    id: "c_name",
                    dataIndex: "c_name",
                    renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                        metaData.attr = "style='cursor:pointer';";
                        return value;
                    },
                },
            ];
            Ext.PopDepartmentForm = new Ext.ux.Poplov({
                text: "ผู้ปฎิบัตงาน",
                id: "sp_emp_idID", //go to relation
                iconCls: "page_magnify",
                valueHidden: "sp_emp_id", //go to hidden
                store: Ext.storeDepartment,
                headerGrid: columnMini,
                widthText: 280,
                fieldLabel: "ผู้ปฎิบัตงาน",
                isCellClickGrid: true,
                cellClickGrid: function (grid, rowIndex, columnIndex, e) {
                    var id = "sp_emp_idID";
                    var nameID = id + "_Name";
                    var record = grid.getStore().getAt(rowIndex);
                    var TextShow = record.data.c_code + " " + record.data.c_name;

                    if (record.data.id != Ext.getCmp("sp_emp_id2ID").getValue()) {
                        Ext.getCmp("buSavePopSubID").show();
                    } else {
                        Ext.getCmp("buSavePopSubID").hide();
                    }

                    Ext.getCmp(id).setValue(record.data.id);
                    Ext.getCmp(nameID).setValue(TextShow);
                    Ext.getCmp("win-pop-lov" + id).hide();
                    Ext.getCmp("win-pop-lov" + id).destroy();
                },
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
                        text: Ext.GLOBAL_BU_BACK_TH,
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

    Ext.dc_cost2 = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/All_PoWorkingImpHdr.php",
        baseParams: {
            type: "dc_cost2",
            // all : "all" 
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
            type: "dc_expense_budget_type2",
        },
        root: "data",
        idProperty: "id",
        fields: ["id", "c_name", "i_bg_type"],
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
            {name: "bg_reserve_money_id"},
            {name: "i_pr_type1"},
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
    Ext.storeDtl = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "tor/api/List_TorStep.php",
        baseParams: {
            type: "po_working_dtl3",
            keyData: Ext.keyData,
            is_audit: Ext.isAudit,
            is_edit: true,
            i_alarm: Ext.menu_i_alarm,
            i_pa: Ext.menu_i_day,
            tor_status_id: Ext.menu_id,
            type_menu: 2, //ชุดสอง ผู้รับผิดชอบ TOR sp_emp_id
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
                name: "i_type_bg",
            },
            {
                name: "i_bg_type", type:"int"
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
        ],
    });
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
    Ext.loadStore = function (status, show) {
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
                                    Ext.po_user_permission.reload({
                                        callback: function (recordx, operation, success) {
                                            if (success) {
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

                                                                                        Ext.selectRow.set("po_expense_id", Ext.selectRow.get("po_expense_main_id"));

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

                                                                                        var winApp = AppPoStore(statusx);
                                                                                        Ext.getCmp("winChequeID").items.items[0].getForm().loadRecord(Ext.selectRow);
                                                                                        winApp.show();
                                                                                  
                                                                                        Ext.fnDisMenuEmp(Ext.isAudit);
                                                                                        //button
                                                                                        console.log(Ext.selectRow);
                                                                                        Ext.getCmp("c_commentID").setValue(Ext.selectRow.get("c_comment"));

                                                                                        Ext.store2.setBaseParam("tor_id", Ext.HDR_ID);
                                                                                        Ext.store2.load({
                                                                                            callback: function (recordx, operation, success) {
                                                                                                if (success) {
                                                                                                    if (Ext.store2.data.length > 1) {
                                                                                                        if (Ext.store2.data.length == 0) {
                                                                                                            Ext.getCmp("winMain").items.items[0].items.items[1].items.items[0].getForm().loadRecord(Ext.selectDefault);
                                                                                                          
                                                                                                        }
                                                                                                        sumtopbar();
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
                                                }); //dc_expense_budget_type
                                            }
                                        },
                                    }); //po_user_permission
                                }
                            },
                        }); //po_emp
                    }
                },
            });
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
            store: Ext.dc_cost2,
            anchor: "50%",
            readOnly: (Ext.isAudit ? true : false),
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

        var comboTypeBg = new Ext.form.ComboBox({
            mode: "local",
            store: Ext.dc_expense_budget_type,
            fieldLabel: "แหล่งเงิน",
            anchor: "60%",
            submitValue: true,
            name: "dc_expense_budget_type_idTxt",
            hiddenName: "dc_expense_budget_type_id",
            id: "dc_expense_budget_type_hdr_id",
            //po_expense_group_id
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
                        Ext.getCmp('dc_expense_budget_type_idTxtID').setValue(Ext.getCmp('dc_expense_budget_type_hdr_id').getValue());
                        Ext.i_bg_type = Ext.getStoreItems(this.store, this.getValue(), "i_bg_type")
          //Test อุดหนุน
                        if(Ext.i_bg_type){
                            Ext.Msg.alert("แจ้งเตือน", "แหล่งเงินเป็นเงินอุดหนุน/เงินงวด จะต้องทำการจองก่อนเงินทำสัญญา" , function (form, action) {
                                Ext.isCostPrExist = 0;
                                return false;
                            });
                        }
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
                    this.fn();
                },
            },
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

        var comboExpense = new Ext.form.ComboBox({
            mode: "local",
            store: Ext.po_expense,
            valueField: "id",
            displayField: "c_name",
            anchor: "70%",
            submitValue: true,
            name: "c_detail",
            id: "po_expense_hdr_idID",
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
                    this.fn = function () {
                        Ext.getCmp('po_expense_id_dtlID').setValue(Ext.getCmp('po_expense_hdr_idID').getValue());
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
                    Ext.getCmp("winPeriodDtlID").getEl().unmask(); 
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
        
        function genBooklink2(v, i,id) {
            var ii = i;
            var ip = Ext.session.ip_booking; // 192
            // var ip = "localhost"; // 192
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
                    Ext.selectSelft.get("i_pr_type1") + //  plan or period
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
                        if (Ext.selectSelft.get("i_pr_type1") == 1) {
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
                                Ext.getCmp("winPeriodDtlID").getEl().unmask(); 
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

        function genBooklink(v, i) {
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
                    "/api-nmu/?/bg/mn_BgReserveMoney/mode/POST" +
                    "/i_sys/1" +
                    "/pr_id/" +
                    Ext.selectRow.get("id") +
                    "/po_id/0" +
                    "/chk_id/0" +
                    "/i_year/" +
                    Ext.selectRow.get("i_yyyy") +
                    "/i_pr_type/" +
                    Ext.selectRow.get(pr_type) + //  plan or period
                    "/i_reserve/1" + // step 1 PR step 2 po step3 checking
                    "/dc_cost_id/" +
                    Ext.selectRow.get("dc_cost_id") +
                    "/dc_budget_type_id/" +
                    Ext.selectRow.get(i_type) +
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
                    Ext.selectRow.get(i_type) +
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
                        if (Ext.selectRow.get(pr_type) == 1) {
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
                                    text: "* บันทึกรายการจอง",
                                    id: "button1",
                                    disabled: Ext.isAudit === false || Ext.selectRow.get("bg_reserve_money1_id") > 0 ? true : false,
                                    handler: function () {
                                        Ext.getCmp("winDcExpTypeDddID").getEl().mask("Please wait...", "x-mask-loading");
                                        this.setDisabled(true);
                                        genBooklink(Ext.getCmp("f_type_amtID").getValue(), 1);
                                        
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
                                    text: "* บันทึกรายการจอง",
                                    id: "button2",
                                    disabled: Ext.isAudit === false || Ext.selectRow.get("bg_reserve_money2_id") > 0 ? true : false,
                                    handler: function () {
                                        Ext.getCmp("winDcExpTypeDddID").getEl().mask("Please wait...", "x-mask-loading");
                                        alert(genBooklink(Ext.getCmp("f_type2_amtID").getValue(), 2));
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
                        } /*
                         new Ext.form.ComboBox({
                         mode: "local",
                         store: Ext.dc_expense_budget_type,
                         fieldLabel: "แหล่งเงิน 3",
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
                         text: "* บันทึกรายการจอง",
                         disabled: (Ext.selectRow.get('bg_reserve_money3_id') > 0 ? true : false),
                         id: 'button3',
                         handler: function () {
                         alert(genBooklink(Ext.getCmp('f_type3_amtID').getValue(), 3));
                         }
                         }, {
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
                         }
                         ], //radiogroup
                         }
                         ],
                         },
                         new Ext.form.ComboBox({
                         mode: "local",
                         store: Ext.dc_expense_budget_type,
                         fieldLabel: "แหล่งเงิน 4",
                         anchor: "60%",
                         submitValue: true,
                         id: "dc_expense_budget_type4_idTxtID",
                         name: "dc_bg_budget_type4_id",
                         hiddenName: "dc_expense_budget_type4_id",
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
                         fieldLabel: "จำนวนเงินจากแหล่งเงิน 4",
                         frame: false,
                         border: false,
                         items: [
                         {
                         xtype: "textfield",
                         fieldLabel: "จำนวนเงินจากแหล่งเงิน 4",
                         name: "f_type4_amt",
                         id: "f_type4_amtID",
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
                         disabled: (Ext.selectRow.get('bg_reserve_money4_id') > 0 ? true : false),
                         id: 'button4',
                         handler: function () {
                         alert(genBooklink(Ext.getCmp('f_type4_amtID').getValue(), 4));
                         }
                         }, {
                         xtype: "radiogroup",
                         columns: [98, 98],
                         fieldLabel: "ขอดำเนินการ",
                         id: "i_pr_type4ID",
                         name: "i_pr_type4",
                         items: [
                         {
                         //  checked: true,
                         name: "i_pr_type4",
                         inputValue: 1,
                         boxLabel: "จองแบบแผน",
                         },
                         {
                         inputValue: 2,
                         name: "i_pr_type4",
                         boxLabel: "จองแบบงวด",
                         }
                         ], //radiogroup
                         }
                         ],
                         },
                         new Ext.form.ComboBox({
                         mode: "local",
                         store: Ext.dc_expense_budget_type,
                         fieldLabel: "แหล่งเงิน 5",
                         anchor: "60%",
                         submitValue: true,
                         id: "dc_expense_budget_type5_idTxtID",
                         name: "dc_bg_budget_type5_id",
                         hiddenName: "dc_expense_budget_type5_id",
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
                         fieldLabel: "จำนวนเงินจากแหล่งเงิน 5",
                         frame: false,
                         border: false,
                         items: [
                         {
                         xtype: "textfield",
                         fieldLabel: "จำนวนเงินจากแหล่งเงิน 5",
                         name: "f_type5_amt",
                         id: "f_type5_amtID",
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
                         disabled: (Ext.selectRow.get('bg_reserve_money5_id') > 0 ? true : false),
                         id: 'button5',
                         handler: function () {
                         alert(genBooklink(Ext.getCmp('f_type5_amtID').getValue(), 5));
                         }
                         }, {
                         xtype: "radiogroup",
                         columns: [98, 98],
                         fieldLabel: "ขอดำเนินการ",
                         id: "i_pr_type5ID",
                         name: "i_pr_type5",
                         items: [
                         {
                         // checked: true,
                         name: "i_pr_type5",
                         inputValue: 1,
                         boxLabel: "จองแบบแผน",
                         },
                         {
                         inputValue: 2,
                         name: "i_pr_type5",
                         boxLabel: "จองแบบงวด",
                         }
                         ], //radiogroup
                         }
                         ],
                         }
                         */,
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
                                var f_total_amt = Ext.getCmp("f_totalID").getValue() == '' ? 0.00 : Number.parseFloat(Ext.getCmp("f_totalID").getValue().replace(/,/g, "")).toFixed(2);
                                var sum = parseFloat(f_sum1) + parseFloat(f_sum2)
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

        var disp = false ? "displayfield" : "textfield";

        if (!Ext.isEmpty(Ext.getCmp("winChequeID"))) {
            Ext.getCmp("winChequeID").destroy();
        }


        var modeSave =( ( Ext.selectRow.get("i_type_bg") == 2 ) || (Ext.selectRow.get("i_type_bg") == 4)  )? {
            xtype: "radiogroup",
            columns: [280],
            fieldLabel: "การตรวจสอบ",
            id: "i_is_registerID",
            style: {
                "font-weight": "bold",
            },
            items: [
                {
                    name: "i_is_register",
                    checked: true,
                    width: 100,  
                    inputValue:0,
                    boxLabel: "อัพเดทยังไม่ผ่ายนรายการ",
       
                },
                {
                    name: "i_is_register",
                    // checked: true,
                    width: 100,  
                    inputValue:1,
                    boxLabel: "อัพเดทพร้อมผ่ายนรายการ",
       
                },
            ],
        }:{
            xtype: "radiogroup",
            columns: [180],
            fieldLabel: "การตรวจสอบ",
            id: "i_is_registerID",
            style: {
                "font-weight": "bold",
            },
            items: [
                {
                    name: "i_is_register",
                    checked: Ext.isAudit ? false : true,
                    width: 100,
                    // inputValue: "2",
                    hidden: (Ext.selectRow.get("i_is_register") == 2 ? true : false || Ext.selectRow.get("i_is_register") == 1) || Ext.isAudit ? true : false,
                    inputValue: 3,
                    boxLabel: "ยังไม่ส่งให้ฝ่ายจัดสรร",
                },
                {
                    name: "i_is_register",
                    width: 100,
                    // checked: true,
                    // inputValue: "2",
                    hidden: (Ext.selectRow.get("i_is_register") == 2 ? true : false || Ext.selectRow.get("i_is_register") == 1) || Ext.isAudit ? true : false,
                    inputValue: 2,
                    boxLabel: "บันทึกเพื่อส่งให้ฝ่ายจัดสรร",
                },
                {
                    name: "i_is_register",
                    //   inputValue: "1"
                    checked: Ext.isAudit ? true : false,
                    hidden: Ext.isAudit ? false : true,
                    inputValue: 1,
                    boxLabel: "ฝ่ายจัดสรรตรวจสอบแล้ว",
                },
            ],
        };
        
        return new Ext.Window({
            collapsible: true,
            maximizable: true,
            title: "บันทึก PR",
            // maximized: true,
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
                    this.onWindowResize = function () {
                        console.log("ok");
                        Ext.getCmp("tabpanelMain2ID").setHeight(Ext.getCmp("winMain").getSize().height - 105);
                    };
                },
                afterrender: function () {
                    Ext.getCmp("tabpanelMain2ID").setHeight(Ext.getCmp("winMain").getSize().height - 105);
                    Ext.getCmp("winMain").on("resize", this.onWindowResize, this);

                },
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
                            listeners:{
                                afterrender:function(){
                                        // 
                                        Ext.getCmp('dc_expense_budget_type_hdr_id').getStore().reload({
                                            callback: function (records, operation, success) { 
                                                 Ext.getCmp('dc_expense_budget_type_hdr_id').fn();
                                            }
                                        });

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
                                                {
                                                    xtype: disp,
                                                    fieldLabel: "รหัส PR",
                                                    id: "codeHdrID",
                                                    style: "text-align: center;font-weight:bold;background:#eee;",
                                                    readOnly: true,
                                                    name: "c_code",
                                                },
                                                {
                                                    xtype: disp,
                                                    fieldLabel: "เรื่อง/โครงการ",
                                                    width: 500,
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
                                                // {
                                                //     xtype: "buttongroup",
                                                //     fieldLabel: "ชื่อโครงการ",
                                                //     frame: false,
                                                //     border: false,
                                                //     items: [
                                                //         new Ext.form.ComboBox({
                                                //             mode: "local",
                                                //             store: Ext.bgProject,
                                                //             id: "projectID",
                                                //             anchor: "70%",
                                                //             fieldLabel: "ชื่อโครงการ",
                                                //             submitValue: true,
                                                //             hiddenName: "bg_budget_dtl_project_id",
                                                //             name: "c_budget_dtl_project_id",
                                                //             valueField: "id",
                                                //             displayField: "c_name",
                                                //             triggerAction: "all",
                                                //             forceSelection: false,
                                                //             selectOnFocus: true,
                                                //             typeAhead: false,
                                                //             emptyText: "กรุณาเลือก",

                                                //             validator: function (val) {
                                                //                 if (Ext.getCmp("i_is_renameID").getValue() == false) {
                                                //                     if (!Ext.isEmpty(val)) {
                                                //                         return true;
                                                //                     } else {
                                                //                         return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                                //                     }
                                                //                 }
                                                //             },
                                                //             listeners: {
                                                //                 afterrender: function () {
                                                //                     this.fn = function () {};
                                                //                 },
                                                //                 Change: function () {
                                                //                     this.fn();
                                                //                 },
                                                //                 beforequery: function (q) {
                                                //                     if (q.query) {
                                                //                         var length = q.query.length;
                                                //                         q.query = new RegExp(Ext.escapeRe(q.query));
                                                //                         q.query.length = length;
                                                //                     }
                                                //                 },
                                                //                 blur: function () {
                                                //                     this.getStore().clearFilter();
                                                //                 },
                                                //             },
                                                //         }),
                                                //         {
                                                //             id: "projectRenameID",
                                                //             name: "c_budget_dtl_project",
                                                //             xtype: disp,
                                                //             width: 190,
                                                //             fieldLabel: "ชื่อโครงการ",
                                                //             validator: function (val) {
                                                //                 if (Ext.getCmp("i_is_renameID").getValue() == true) {
                                                //                     if (!Ext.isEmpty(val)) {
                                                //                         return true;
                                                //                     } else {
                                                //                         return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                                //                     }
                                                //                 }
                                                //             },
                                                //             listeners: {
                                                //                 afterreder: function () {
                                                //                     this.hidden();
                                                //                 },
                                                //             },
                                                //         },
                                                //         {
                                                //             xtype: "checkbox",
                                                //             id: "i_is_renameID",
                                                //             name: "i_is_rename",
                                                //             boxLabel: "เปลี่ยนชื่อโครงการ",

                                                //             listeners: {
                                                //                 check: function () {
                                                //                     if (statusx == "edit") {
                                                //                         if (Ext.selectRow.get("i_is_rename") != 1) {
                                                //                             Ext.getCmp("projectRenameID").setValue("");
                                                //                         }
                                                //                     }
                                                //                     if (Ext.getCmp("i_is_renameID").getValue() == true) {
                                                //                         Ext.getCmp("projectRenameID").show();
                                                //                         Ext.getCmp("projectID").hide();
                                                //                     } else {
                                                //                         Ext.getCmp("projectRenameID").hide();
                                                //                         Ext.getCmp("projectID").show();
                                                //                     }
                                                //                 },
                                                //                 beforerender: function () {
                                                //                     if (statusx == "edit") {
                                                //                         if (Ext.selectRow.get("i_is_rename") == 1) {
                                                //                             Ext.getCmp("projectRenameID").show();
                                                //                             Ext.getCmp("projectID").hide();
                                                //                         } else {
                                                //                             Ext.getCmp("projectID").show();
                                                //                             Ext.getCmp("projectRenameID").hide();
                                                //                         }
                                                //                     }
                                                //                 },
                                                //                 afterrender: function () {
                                                //                     if (Ext.getCmp("i_is_renameID").getValue() == true) {
                                                //                         Ext.getCmp("projectRenameID").show();
                                                //                         Ext.getCmp("projectID").hide();
                                                //                     } else {
                                                //                         Ext.getCmp("projectRenameID").hide();
                                                //                         Ext.getCmp("projectID").show();
                                                //                     }
                                                //                 },
                                                //             },

                                                //             width: 180,
                                                //             inputValue: 1,
                                                //             style: {
                                                //                 margin: "0px 0px 0px 3px",
                                                //             },
                                                //         },
                                                //     ],
                                                // },
                                                comboTypeBg,
                                                comboExpense,
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
                                                            // readOnly: true,
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
                                                            console.log(this.getValue());
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
                                                                if (Ext.getCmp("i_purchaseID").getValue().inputValue == 1) {
                                                                    this.hide();
                                                                } else {
//                                                                    alert(Ext.i_bg_type);
                                                                    if(Ext.i_bg_type){
                                                                         this.hide();
                                                                    }else{
                                                                         this.show();
                                                                    } 
                                                                }
                                                            };
                                                        },
                                                        afterrender: function () {
                                                     
                                                                Ext.getCmp("i_ren_bgTypeID").fn();
                                                            
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
                                                // {
                                                //   xtype: "checkboxgroup",
                                                //   fieldLabel: "การจัดเก็บ",
                                                //   name: "i_is_inv",
                                                //   id: "i_is_invGID",
                                                //   columns: 1,
                                                //   items: [
                                                //     {
                                                //       id: "i_is_invID",
                                                //       boxLabel: "เข้าคลัง",
                                                //       name: "i_is_inv",
                                                //       inputValue: 1,
                                                //     },
                                                //   ],
                                                //   listeners: {
                                                //     afterrender: function () {},
                                                //   },
                                                // },
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
                                                                Ext.getCmp("i_ren_bgTypeID").fn();
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

                                                    //                                                },
                                                    //                                                {
                                                    //                                                    xtype: "radiogroup",
                                                    //                                                    columns: [90, 110],
                                                    //                                                    fieldLabel: "สถานะการใช้งาน",
                                                    //                                                    name: "i_enabled",
                                                    //                                                    id: "i_enabledID",
                                                    //                                                    items: [
                                                    //                                                        {
                                                    //                                                            name: "i_enabled",
                                                    //                                                            checked: true,
                                                    //                                                            inputValue: 1,
                                                    //                                                            boxLabel: "ใช้งาน",
                                                    //                                                        },
                                                    //                                                        {
                                                    //                                                            name: "i_enabled",
                                                    //                                                            inputValue: 2,
                                                    //                                                            boxLabel: "ไม่ใช้งาน",
                                                    //                                                        },
                                                    //                                                    ], //radiogroup
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
                                                    xtype: "radiogroup",
                                                    columns: [180],
                                                    checked: false,
                                                    fieldLabel: "โหมดการบันทึก",
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
                                                modeSave


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
                            buttonAlign: "left",
                            buttons: [
                                {
                                    text: "บันทึกรายการ PR",
                                    id: "buSaveSubID",
                                    iconCls: "icon-save",
                                    disabled: (Ext.isAudit ? false : false || Ext.selectRow.get("i_is_register") == 2 || Ext.selectRow.get("i_is_register") == 1) ? true : false,
                                    //  hidden : Ext.selectRow.get("i_is_register") == 2 ? true : false  ,
                                    listeners: {
                                        afterrender: function () {},
                                    },
                                    handler: function () {
                                        var msg = "";
                                        // if (Ext.getCmp("modesubID").getValue().inputValue == "GENCODE") {
                                        //     if (Ext.store2.data.length == 0) {
                                        //         msg += "<span style='white-space: nowrap;'>- กรุณาเพิ่มรายการจัดซื้อ</span><br>";
                                        //     }
                                        // }
                                        if (Ext.getCmp("i_is_registerID").getValue().inputValue == "2" && Ext.selectRow.get("tor_hdr_dtl") == "0") {
                                            Ext.Msg.alert("แจ้งเตือน", "ยังไม่บันรายละเอียด", function (bu, action) {
                                                return false;
                                            });
                                        } else if (msg == "") {
                                            var formSubmit = function (form) {
                                                //                                                form.submit({
                                                //                                                    // url: 'tor/api/mnTorController.php',
                                                //                                                    params: {mode: "UPDATE"},
                                                //                                                });
                                                form.submit({
                                                    waitMsg: "Saving Data...",
                                                    params: {mode: "UPDATEFORMSTSATUS"},
                                                    success: function (form, action) {
                                                        Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                                            Ext.getCmp("tabpanel1").getStore().reload();
                                                            Ext.selectRow = null;
                                                            Ext.getCmp("winMain").destroy();
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
                                    }
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
                        {
                            //                                                                         collapsible: true,
                            //                                                                         maximizable: true,
                            title: "รายละเอียดการจัดซื้อ",
                            width: Ext.getCmp("contenterCenter").getWidth() - 150,
                            height: Ext.getCmp("contenterCenter").getHeight() - 150,
                            id: "winPeriodDtlID",
                            frame: true,
                            modal: true,
                            plain: true,
                            autoScroll: true,
                            layout: "column", // Specifies that the items will now be arranged in columns
                            items: [
                                new Ext.FormPanel({
                                    columnWidth: 0.4,
                                    height: 400,
                                    frame: true,
                                    padding: "10px 10px 10px 10px",
                                    id: "tabpanelMain4ID",
                                    url: "tor/api/mnCheckingController.php",
                                    defaults: {width: 430},
                                    defaultType: "textfield",
                                    labelWidth: 90,
                                    title: "ข้อมูลรายละเอียดรายการจัดซื้อ<br>&nbsp;",
                                    items: [
                                        {
                                            xtype: "hidden",
                                            id: "sp_tor_dtl_idID",
                                            name: "sp_tor_dtl_id",
                                        },
                                        new Ext.form.ComboBox({
                                            mode: "local",
                                            store: Ext.dc_expense_budget_type,
                                            fieldLabel: "แหล่งเงิน",
                                            anchor: "90%",
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
                                            //hidden: true,
                                            typeAhead: false,
                                            emptyText: "กรุณาเลือกแหล่งเงิน...",
                                            value: Ext.getCmp("dc_expense_budget_type_hdr_id").getValue(),
                                            listeners: {
                                                afterrender: function () {
                                                    Ext.getCmp('dc_expense_budget_type_idTxtID').setValue(Ext.getCmp('dc_expense_budget_type_hdr_id').getValue());
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
                                            anchor: "90%",
                                            submitValue: true,
                                            id: "po_expense_id_dtlID",
                                            name: "po_expense_id",
                                            hiddenName: "po_expense_id",
                                            triggerAction: "all",
                                            allBlank: true,
                                            //hidden: true,
                                            forceSelection: true,
                                            selectOnFocus: true,
                                            fieldLabel: "รายการย่อย 2",
                                            width: 200,
                                            typeAhead: false,
                                            emptyText: "กรุณาเลือกใช้จ่าย...",
                                            value: Ext.getCmp("po_expense_hdr_idID").getValue(),
                                            listeners: {
                                                afterrender: function () {
                                                    Ext.getCmp('po_expense_id_dtlID').setValue(Ext.getCmp('po_expense_hdr_idID').getValue());
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
                                                beforerender: function () {
                                                    this.fn = function () {
                                                        if (Ext.getCmp("i_product_typeID").getValue().inputValue == 0) {
                                                            Ext.getCmp("i_hire_type2ID").setValue(0);
                                                        }
                                                    };
                                                },
                                                change: function () {
                                                    if (Ext.getCmp("i_purchaseID").getValue().inputValue == 3) {
                                                        Ext.getCmp("i_product_type2ID").hide();
                                                        //                                             Ext.getCmp("i_is_invG2ID").hide();
                                                    } else {
                                                        if (this.getValue().inputValue == 0) {
                                                            Ext.getCmp("i_product_type2ID").hide();
                                                            //                                               Ext.getCmp("i_is_invG2ID").hide();
                                                        } else {
                                                            Ext.getCmp("i_product_type2ID").show();
                                                            //                                                Ext.getCmp("i_is_invG2ID").show();
                                                        }
                                                    }
                                                },
                                                afterrender: function () {
                                                    Ext.getCmp("i_hire_type2ID").fn();
                                                },
                                            },
                                        },
                                        {
                                            xtype: "radiogroup",
                                            columns: [98, 98],
                                            fieldLabel: "ของที่ได้มา",
                                            id: "i_product_type2ID",
                                            name: "i_product_type",
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
                                                change: function () {
                                                    // Ext.getCmp("i_is_invG2ID").fn(this.getValue().inputValue);
                                                },
                                                afterrender: function () {
                                                    if (Ext.getCmp("i_purchaseID").getValue().inputValue == 3) {
                                                        Ext.getCmp("i_product_type2ID").hide();
                                                        //                                             Ext.getCmp("i_is_invG2ID").hide();
                                                    } else {
                                                        Ext.getCmp("i_product_type2ID").setValue(Ext.selectRow.data.i_product_type);
                                                        if (Ext.getCmp("i_hire_type2ID").getValue().inputValue == 0) {
                                                            Ext.getCmp("i_product_type2ID").hide();
                                                            //                                               Ext.getCmp("i_is_invG2ID").hide();
                                                        } else {
                                                            Ext.getCmp("i_product_type2ID").show();
                                                            //                                                         Ext.getCmp("i_is_invG2ID").show();
                                                        }
                                                    }
                                                },
                                            },
                                        },
                                        /*  {
                                         xtype: "checkboxgroup",
                                         fieldLabel: "การจัดเก็บ",
                                         name: "i_is_inv",
                                         id: "i_is_invG2ID",
                                         items: [
                                         {
                                         id: "i_is_invG2IDs1",
                                         boxLabel: "เข้าคลัง",
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
                                         },*/
                                        {
                                            fieldLabel: "ชื่อรายการ",
                                            id: "c_nameID",
                                            width: "90%",
                                            name: "c_name",
                                            allowBlank: false,
                                            value: Ext.getCmp("c_name_hdr_id").getValue(),
                                            listeners: {
                                                afterrender: function () {
                                                    Ext.getCmp('c_nameID').setValue(Ext.getCmp('c_name_hdr_id').getValue());
                                                    //  this.fn = function () {};
                                                },
                                            },
                                        },
                                        {
                                            fieldLabel: "จำนวน",
                                            xtype: "numberfield",
                                            selectOnFocus: true,
                                            id: "i_qtyID",
                                            width: 60,
                                            name: "i_qty",
                                            value: 1,
                                            style: "text-align: center",
                                            listeners: {
                                                blur: function () {
                                                    //                                                    var f_total = parseFloat(this.getValue().replace(/,/g, "") / 1);
                                                    //                                                    this.setValue(Ext.floatRenderer(f_total));
                                                    Ext.getCmp("f_type_amt_dtl_ID").fn();
                                                },
                                            },
                                        },
                                        {
                                            fieldLabel: "ราคา/ต่อหน่วย",
                                            selectOnFocus: true,
                                            id: "f_unit_costID",
                                            width: 120,
                                            name: "f_unit_price",
                                            listeners: {
                                                blur: function () {
                                                    var f_total = parseFloat(this.getValue().replace(/,/g, "") / 1);
                                                    this.setValue(Ext.floatRenderer(f_total));
                                                    Ext.getCmp("f_type_amt_dtl_ID").fn();
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
                                            hiddenName: "dc_unit_type_id",
                                            id: "dc_unit_type_idID",
                                            name: "dc_unit_type_id",
                                            store: Ext.storeUnitType,
                                            valueField: "id",
                                            displayField: "c_name",
                                            triggerAction: "all",
                                            forceSelection: true,
                                            selectOnFocus: true,
                                            typeAhead: false,
                                            emptyText: "กรุณาเลือกหน่วยนับ...",
                                            anchor: "45%",
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
                                        {
                                            xtype: "textfield",
                                            fieldLabel: "จองเงิน",
                                            name: "f_type_amt",
                                            id: "f_type_amt_dtl_ID",
                                            readOnly: true,
                                            width: 180,
                                            value: 20,
                                            listeners: {
                                                blur: function () {
                                                    this.fn(true);
                                                },
                                                afterrender: function () {
                                                    this.fn = function (t) {
                                                        var val = 0;
                                                        val = parseFloat(Ext.getCmp("i_qtyID").getValue() / 1) * parseFloat(Ext.getCmp("f_unit_costID").getValue().replace(/,/g, "") / 1);
                                                        this.setValue(Ext.floatRenderer(val));
                                                        //                                                        this.setValue(Ext.floatRenderer(parseFloat(val.replace(/,/g, "") / 1)));
                                                    };
                                                    this.fn();
                                                },
                                            },
                                            style: {
                                                labelAlign: "right",
                                                "font-weight": "bold",
                                                margin: "1px",
                                                color: "blue",
                                                "background-color": "#fff",
                                                "text-align": "right",
                                            },
                                        },
                                        {
                                            xtype: "buttongroup",
                                            fieldLabel: "เงินที่จอง2",
                                            id: "purchase1ID",
                                            frame: false,
                                            border: false,
                                            items: [
                                                {
                                                    xtype: "button",
                                                    text: "* บันทึกรายการจอง",
                                                    id: "buttonDtlID",
                                                    //                                                    disabled:true,
                                                    handler: function () {
                                                        Ext.getCmp("winPeriodDtlID").getEl().mask("Please wait...", "x-mask-loading");
                                                        this.setDisabled(true);
                                                        genBooklink2(Ext.getCmp("f_type_amt_dtl_ID").getValue(), 1);
                                                        
                                                    },
                                                },
                                                {
                                                    xtype: "tbspacer",
                                                    width: 18,
                                                },
                                                {
                                                    xtype: "radiogroup",
                                                    columns: [98, 98],
                                                    fieldLabel: "ขอดำเนินการ",
                                                    id: "i_pr_type1_dtl_ID",
                                                    name: "i_pr_type1_dtl",
                                                    items: [
                                                        {
                                                            // checked: true,
                                                            name: "i_pr_type1_dtl",
                                                            inputValue: 1,
                                                            boxLabel: "จองแบบแผน",
                                                        },
                                                        {
                                                            inputValue: 2,
                                                            name: "i_pr_type1_dtl",
                                                            boxLabel: "จองแบบงวด",
                                                        },
                                                    ], //radiogroup
                                                },
                                            ],
                                        },
                                    ],
                                    listeners: {
                                        
                                        afterrender: function () {
                                            //                                            alert(Ext.selectRow.get('i_purchase'));
                                            if(Ext.i_bg_type){
                                                Ext.getCmp('purchase1ID').hide();
                                            }else{
                                                if (Ext.selectRow.get("i_purchase") == 1) {
                                                    Ext.getCmp("buttonDtlID").setDisabled(false);
                                                } else {
                                                    Ext.getCmp("buttonDtlID").setDisabled(true);
                                                }
                                            }
                                        },
                                    },
                                }),

                                {
                                    columnWidth: 0.6,
                                    layout: "fit",
                                    height: 460,
                                    id: "tabpanelMain2ID",
                                    // title: "รายการจัดซื้อ",
                                    autoScroll: true,
                                    items: [
                                        {
                                            xtype: "grid",
                                            id: "gridSub5ID",
                                            border: false,
                                            stripeRows: false,
                                            loadMask: true,
                                            autoScroll: true,
                                            store: Ext.store2,
                                            layout: "fit",
                                            listeners: {
                                                beforerender: function () {
                                                    this.isController = function (st, rec) {
                                                        if (st === "DEL") {
                                                            Ext.Ajax.request({
                                                                url: "tor/api/mnCheckingController.php",
                                                                params: {
                                                                    mode: "DEL_CHECKING_DTL",
                                                                    id: rec.get("id"),
                                                                },
                                                                method: "POST", //POST
                                                                success: function (result, request) {
                                                                    var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                                                                    console.log(jsonData);
                                                                    if (jsonData.success) {
                                                                        Ext.MessageBox.alert("Success", "ทำการลบรายการเรียบร้อยแล้ว", function () {
                                                                            Ext.storeTransf.reload();
                                                                            Ext.storePeriodDtlLoad();
                                                                            Ext.chkBgfn(false, 0, 0);
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
                                                    };
                                                },
                                                afterrender: function () {
                                                    this.on(
                                                            "cellclick",
                                                            function (grid, rowIndex, columnIndex, e) {
                                                                var record = grid.getStore().getAt(rowIndex);
                                                                if (columnIndex === grid.getColumnModel().getIndexById("grid2delID")) {
                                                                    this.isController("DEL", record);
                                                                }
                                                            },
                                                            this
                                                            );
                                                },
                                            },
                                            tbar: [
                                                {
                                                    id: "sumtop",
                                                    text: "",
                                                },
                                                "->",
                                                {
                                                    xtype: "buttongroup",
                                                    frame: false,
                                                    items: [
                                                        {
                                                            text: "โหลดข้อมูลใหม่",
                                                            iconCls: "icon-refresh",
                                                            handler: function (grid, rowIndex, colIndex) {
                                                                Ext.store2.load({
                                                                    params: {hdr_id: Ext.HDR_ID},
                                                                    callback: function (records, operation, success) {
                                                                        sumtopbar();
                                                                    },
                                                                });
                                                                Ext.dc_expense_budget_type.load({
                                                                    callback: function (records, operation, success) {},
                                                                });
                                                                Ext.po_expense.load({
                                                                    callback: function (records, operation, success) {},
                                                                });
                                                                Ext.storeUnitType.load({
                                                                    callback: function (records, operation, success) {},
                                                                });
                                                                Ext.getCmp("tabpanelMain4ID").getForm().reset();
                                                                Ext.getCmp("tabpanelMain4ID").setTitle("ข้อมูลรายละเอียดรายการจัดซื้อ<br>&nbsp;");
                                                                Ext.getCmp("editDtlID").hide();
                                                            },
                                                        },
                                                    ],
                                                },
                                            ],
                                            columns: [
                                                new Ext.grid.RowNumberer({width: 35, header: " ที่ ", dataIndex: "no"}),

                                                {header: "ID System", hidden: true, dataIndex: "id"},
                                                {
                                                    header: "รายละเอียด จัดซื้อ",
                                                    dataIndex: "c_name",
                                                    width: 35,
                                                    renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                                        value = String(value);
                                                        if (value.substring(0, 3) == "รวม") {
                                                            metaData.attr = "style='font-weight:bold;color:blue'; align='right'";
                                                        } else {
                                                            metaData.attr = "";
                                                        }
                                                        return value; //DategetShortDateMonthName(value);
                                                    },
                                                },
                                                {header: "จำนวน", dataIndex: "i_qty", width: 20, align: "center"},
                                                {
                                                    header: "หน่วยนับ",
                                                    align: "center",
                                                    dataIndex: "dc_unit_name",
                                                    width: 20,
                                                },
                                                {
                                                    header: "ราคา/หน่วย",
                                                    dataIndex: "f_unit_price",
                                                    align: "right",
                                                    width: 25,
                                                },
                                                {
                                                    header: "รวม",
                                                    dataIndex: "f_total_amt",
                                                    align: "right",
                                                    width: 25,
                                                },
                                                {
                                                    id: "delete",
                                                    header: "ลบ",
                                                    sortable: false,
                                                    align: "center",
                                                    width: 8,
                                                    dataIndex: "id",
                                                    renderer: function (value, metaData, record, row, col, store, gridView) {
                                                        return '<img src="../images/icons/table_delete.png"); style="cursor:pointer"/>';
                                                    },
                                                },
                                                {width: 1, dataIndex: ""},
                                            ],
                                            viewConfig: {forceFit: true},
                                            listeners: {
                                                beforerender: function () {
                                                    this.thisCick = function (grid, rowIndex, columnIndex, e) {
                                                        var record = grid.getStore().getAt(rowIndex);
                                                        Ext.selectSelft = record;

                                                        if (columnIndex != grid.getColumnModel().getIndexById("delete")) {
                                                            Ext.getCmp("sp_tor_dtl_idID").setValue(record.data.id);
                                                            if (Ext.selectSelft.get("bg_reserve_money_id") > 0)
                                                                Ext.getCmp("buttonDtlID").setDisabled(true);
                                                            else
                                                                Ext.getCmp("buttonDtlID").setDisabled(false);
                                                            Ext.getCmp("dc_expense_budget_type_idTxtID").setValue(record.data.dc_expense_budget_type_id);
                                                            Ext.getCmp("po_expense_id_dtlID").setValue(record.data.po_expense_id);

                                                            Ext.getCmp("i_hire_type2ID").setValue(record.data.i_hire_type);
                                                            Ext.getCmp("i_product_type2ID").setValue(record.data.i_product_type);
                                                            //        Ext.getCmp("i_is_invG2IDs1").setValue(record.data.i_is_inv);
                                                            Ext.getCmp("c_nameID").setValue(record.data.c_name);
                                                            Ext.getCmp("i_qtyID").setValue(record.data.i_qty);
                                                            Ext.getCmp("f_unit_costID").setValue(record.data.f_unit_price);
                                                            Ext.getCmp("dc_unit_type_idID").setValue(record.data.dc_unit_type_id);
                                                            Ext.getCmp("editDtlID").show();
                                                            Ext.getCmp("f_type_amt_dtl_ID").setValue(Ext.selectSelft.get("f_total_amt"));
                                                            Ext.getCmp("i_pr_type1_dtl_ID").setValue(Ext.selectSelft.get("i_pr_type1"));

                                                            //   Ext.getCmp("bookingID").show();
                                                            var nameTitle = "ข้อมูลรายละเอียดรายการจัดซื้อ<br>";
                                                            nameTitle += record.data.no + ". " + record.data.c_name + " ( " + record.data.i_qty + " x " + record.data.f_unit_price + " บาท / " + record.data.dc_unit_name + ")";
                                                            Ext.getCmp("tabpanelMain4ID").setTitle(nameTitle);

                                                            //i_purchase
                                                        } else if (columnIndex == grid.getColumnModel().getIndexById("delete")) {
                                                            DeleteTor_dtl(record);
                                                        }
                                                    };
                                                },
                                                afterrender: function () {
                                                    console.log(Ext.selectRow.data.i_purchase);
                                                    if (Ext.selectRow.data.i_purchase == 3) {
                                                        Ext.getCmp("i_product_type2ID").hide();
                                                        Ext.getCmp("i_hire_type2ID").hide();
                                                        //                                          Ext.getCmp("i_is_invG2ID").hide();
                                                    } else if (Ext.selectRow.data.i_purchase == 2) {
                                                        Ext.getCmp("i_product_type2ID").show();
                                                        Ext.getCmp("i_hire_type2ID").show();
                                                        //                                          Ext.getCmp("i_is_invG2ID").show();
                                                    } else if (Ext.selectRow.data.i_purchase == 1) {
                                                        Ext.getCmp("i_product_type2ID").show();
                                                        Ext.getCmp("i_hire_type2ID").hide();
                                                        //                                          Ext.getCmp("i_is_invG2ID").show();
                                                    }
                                                    Ext.getCmp("tabpanelMain2ID").setHeight(Ext.getCmp("winMain").getSize().height - 110);
                                                    Ext.getCmp("gridSub5ID").on("cellclick", this.thisCick, this);
                                                },
                                            },
                                        },
                                    ],
                                },
                            ],
                            bbar: [
                                {
                                    text: "&nbsp;เพิ่มรายการใหม่&nbsp;",
                                    id: "saveDtlID",
                                    iconCls: "icon-add",
                                    handler: function () {
                                        var checkTotal = true;
                                        var f_load = Ext.selectRow.get("f_total_amt").replace(/,/g, "") / 1;
                                        var i_qtyID = Ext.getCmp("i_qtyID").getValue() / 1;
                                        var f_unit_costID = Ext.getCmp("f_unit_costID").getValue().replace(/,/g, "") / 1;
                                        var sumDtl = Ext.store2.reader.jsonData.totalSum;
                                        var f_total = sumDtl + f_unit_costID * i_qtyID;

                                        checkTotal = f_load < f_total ? false : true;

                                        if (checkTotal) {
                                            Ext.saveDTL("SAVE_DTL");
                                            //  alert(checkTotal + ' == f_load ' + f_load + ', f_total = ' + f_total + ', f_unit_costID = ' + f_unit_costID + ', i_qtyID = ' + i_qtyID);
                                            return true;
                                        } else {
                                            alert("warning เงินรวมเกิน " + Ext.floatRenderer(f_load));
                                            //  alert(checkTotal + ' == f_load ' + f_load + ', f_total = ' + f_total + ', f_unit_costID = ' + f_unit_costID + ', i_qtyID = ' + i_qtyID);

                                            return false;
                                        }
                                    },
                                },
                                {xtype: "tbspacer", width: 10},
                                {
                                    text: "&nbsp;แก้ไขรายการ&nbsp;",
                                    id: "editDtlID",
                                    hidden: true,
                                    iconCls: "icon-save-edit",
                                    handler: function () {
                                        var checkTotal = true;
                                        var f_load = Ext.selectSelft.get("f_total_amt").replace(/,/g, "") / 1;
                                        var i_qtyID = Ext.getCmp("i_qtyID").getValue() / 1;
                                        var f_unit_costID = Ext.getCmp("f_unit_costID").getValue().replace(/,/g, "") / 1;
                                        var sumDtl = Ext.store2.reader.jsonData.totalSum;
                                        var f_total = sumDtl - f_load + f_unit_costID * i_qtyID;

                                        checkTotal = sumDtl < f_total ? false : true;

                                        console.log(" checkTotal -->> " + checkTotal);
                                        console.log(" วงเงินใหญ่ -->> " + sumDtl);
                                        console.log(" คีย์ใหม่ -->> " + f_unit_costID * i_qtyID);
                                        console.log(" เงินเก่า -->> " + Ext.selectSelft.get("f_total_amt"));
                                        console.log(" หลังหัก -->> " + f_total);
                                        //                                        return false;
                                        if (checkTotal) {
                                            Ext.saveDTL("EDIT_DTL");
                                            return true;
                                        } else {
                                            alert("warning เงินรวมทั้งหมดมากกว่าเงิน" + Ext.floatRenderer(f_total));

                                            return false;
                                        }
                                    },
                                },
                                        //                                {
                                        //                                    text: "&nbsp;จองเงินแบบจ้าง/เช่า&nbsp;",
                                        //                                    id: "bookingID",
                                        //                                    hidden: true,
                                        //                                    iconCls: "icon-save-edit",
                                        //                                    handler: function () {
                                        //                                        new Ext.Window({
                                        //                                            id: "bookID",
                                        //                                            title: "จองเงิน",
                                        //                                            modal: true,
                                        //                                            resizable: false,
                                        //                                            width: 650,
                                        //                                            height: 300,
                                        //                                            layout: "form",
                                        //                                            labelWidth: 180,
                                        //                                            bodyStyle: "padding:3px;",
                                        //                                            items: [genLinkBooking()]
                                        //                                        }).show();
                                        //                                    }
                                        //                                },
                            ],
                            listeners: {
                                afterrender: function () {
                                    if (Ext.selectRow.get("i_purchase") !== 1) {
                                        //  Ext.getCmp('ext-gen1151').hide();
                                    } else {
                                    }
                                },
                            },
                        },
                    ],
                },
            ],
        });
    }; //End App

    function SearchFrm() {
        return new Ext.Window({
            //                     collapsible: true,
            //                     maximizable: true,
            title: "ค้นหารายการ PR",
            width: 700,
            id: "winSearchFrm",
            height: 250,
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
                                },
                            ],
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
                                        baseParams: {type: "sp_type_status", i_is_type_tor: true, all: "all"},
                                        root: "data",
                                        idProperty: "id",
                                        fields: ["id", "c_name"],
                                    }),
                                    anchor: "100%",
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
                                    hidden: Ext.session.i_level >= 3 ? true : false,

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
                    buttonAlign: "left",
                    buttons: [
                        {
                            text: "ค้นหา",
                            handler: function () {
                                //Ext.getCmp('winSearchFrm').search();
                                //   console.log(Ext.session.i_level)
                                Ext.storeDtl.setBaseParam("mode", "LIST");
                                Ext.storeDtl.setBaseParam("act", "SEARCH");
                                Ext.storeDtl.setBaseParam("d_tor_date", Ext.getCmp("sd_tor_dateID").getValue());
                                Ext.storeDtl.setBaseParam("tor_type_id", Ext.getCmp("stor_type_idID").getValue());

                                Ext.storeDtl.setBaseParam("c_code", Ext.getCmp("sc_codeID").getValue());
                                Ext.storeDtl.setBaseParam("c_name", Ext.getCmp("sc_nameID").getValue());
                                Ext.storeDtl.setBaseParam("sp_emp_id", Ext.session.sp_emp_id);
                                Ext.storeDtl.setBaseParam("i_enabled", 1); // Ext.getCmp("searchEnabledID").getValue().inputValue);
                                Ext.storeDtl.setBaseParam("i_post", Ext.getCmp("searchPostID").getValue().inputValue);
                                Ext.storeDtl.setBaseParam("i_post1", Ext.getCmp("searchPostID1").getValue().inputValue);

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
                                Ext.getCmp("winSearchFrm").search();
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
                        header: "รหัส",
                        sortable: false,
                        align: "left",
                        dataIndex: "id",
                        hidden: true, // icon: "../images/icons/application_view_tile.png"
                    },
                    {
                        header: "แก้ไขผู้ปฏิบัติงาน",
                        sortable: false,
                        id: "editEmpTorID",
                        align: "left",
                        dataIndex: "id",
                        renderer: function (value, metaData, record, row, col, store, gridView) {
                            metaData.attr = "style='cursor:pointer; text-align:center;';";
                            return '<img src="../images/icons/user_edit.png"); style="cursor:pointer"/>';
                        },
                    },
                    {
                        header: "รหัส PR",
                        sortable: false,
                        align: "left",
                        dataIndex: "c_codeStatus",
                        width: 250,
                        renderer: function (value, metaData, record, row, col, store, gridView) {
                            var values;
                            var register = record.get("i_is_register");
                            var type_bg  = record.get("i_type_bg");
                            //  var c_name1 = record.get('c_name');
                            if ((register == 1) && (type_bg == 1) ) {
                                metaData.attr = "style='color:blue;cursor:pointer; text-align:left;';";
                                values = "ฝ่ายจัดสรรตรวจสอบแล้ว  " + value;
                            } else if (register == 2) {
                                metaData.attr = "style='color:DarkOrange;cursor:pointer; text-align:left;';";
                                values = "<b>" + "สายงานบันทึกแล้ว  " + "</b>" + value;
                            } else if ((register == 1) && (type_bg == 4) ) { 
                                metaData.attr = "style='color:blue;cursor:pointer; text-align:left;';";
                                values = "ตรวจสอบข้อมูลครบถ้วนแล้ว  " + value;
                            } else {
                                values = value;
                            }
                            return values;
                        },
                    },
                    {
                        header: "ผ่านรายการ",
                        sortable: false,
                        align: "center",
                        dataIndex: "id",
                        id: "processDueID",
                        width: 70, 
                        renderer: function (value, metaData, record, row, col, store, gridView) {
                            
                            if(record.get('i_type_bg')!==2 && record.get('i_type_bg')!== 4  && Ext.isAudit == false){
                                return '';
                            }else{
                                metaData.attr = "style='cursor:pointer; text-align:center;';";
                                if (record.get("i_is_register") == 0)
                                    return '<img src="../images/icons/application_form.png");/>';
                                else if (record.get("i_is_register") == 2)
                                    return '<img src="../images/icons/application_go.png"); style="cursor:pointer"/>';
                                else if (record.get("i_is_register") == 1)
                                    return '<img src="../images/icons/cog_start.png" style="cursor:pointer"/>';
                           }
                        },
                    },
                    {
                        header: "วิธีดำเนินงาน",
                        sortable: false,
                        align: "left",
                        dataIndex: "c_tor_type", //c_tor_type
                        renderer: function (val, metaData, record, row, col, store, gridView) {
                            var c_type = record.get("tor_type_id");
                            var c_more = c_type == 1 ? Ext.tor_type_idTxt.tor_type_id1[record.get("i_is_more")] : "";
                            return "<b>" + val + "</b> " + c_more;
                        },
                    },
                    {
                        header: "เรื่อง/โครงการ",
                        sortable: false,
                        align: "left",
                        dataIndex: "c_name", //c_tor_type
                        width: 300,
                    },
                    // {
                    //     header: "ชื่อโครงการ",
                    //     sortable: false,
                    //     align: "left",
                    //     width: 150,
                    //     dataIndex: "c_budget_dtl_project",
                    //     editor: new Ext.form.DateField({}),
                    // },
                    {
                        header: "วันที่ PR",
                        sortable: false,
                        align: "center",
                        dataIndex: "d_tor_date",
                    },
                    {
                        header: "วันที่เอกสาร",
                        sortable: false,
                        align: "center",
                        dataIndex: "d_tor_status_date",
                    },
                    {
                        header: "สายงาน",
                        sortable: true,
                        dataIndex: "txtdc_department_idID",
                    },

                    {
                        header: "ผู้รับผิดชอบงาน",
                        sortable: false,
                        align: "left",
                        dataIndex: "sp_emp_name",
                        //             }, {
                        //                 header: "ขอดำเนินการ",
                        //                 sortable: false,
                        //                 align: "left",
                        //                 dataIndex: "c_purchase"
                    },
                    {
                        header: "หมายเหตุ",
                        sortable: false,
                        align: "left",
                        dataIndex: "c_comment",
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
                        beforeedit: function (g) {
                            if (g.rowIdx == 1)
                                return false;
                        },
                        afteredit: function (g) {
                            // console.log(g.record.get('d_inv_date').format('d-m-Y'));
                        },
                        beforerender: function (g) {
                            var headerGroup = [
                                {
                                    text: "ตรวจสอบเอกสาร",
                                    icon: "../images/icons/icon_pdf.png",
                                    handler: function (e) {
                                        Ext.buAct = "FlowcartLv1";
                                        var linkDownload = window.location.protocol + "//" + window.location.hostname + "/sp_mn/api/upload/";
                                        if (Ext.isEmpty(Ext.selectRow))
                                            Ext.MessageBox.alert("แจ้งเตือน", "กรุณากดเลือกข้อมูลที่จะแสดง/ออกเลข PR ก่อน");
                                        window.open(linkDownload + Ext.selectRow.get("c_code") + ".pdf?T=Tap_" + Math.floor(Math.random() * 100000), "Monitoring", 'fullscreen="yes"');
                                    },
                                    scope: this,
                                    //                                },
                                    //              {
                                    //                text: "เปลี่ยนผู้รับผิดชอบงาน",
                                    //                icon: "../images/icons/application_edit.png",
                                    //                handler: function (e) {
                                    //                  Ext.buAct = "update";
                                    //                },
                                    //                scope: this,
                                },
                            ];
                            var permissionMenu = true
                                    ? headerGroup
                                    : [
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
                                            text: "ตรวจสอบเอกสาร",
                                            icon: "../images/icons/icon_pdf.png",
                                            handler: function (e) {
                                                Ext.buAct = "FlowcartLv1";
                                                var linkDownload = window.location.protocol + "//" + window.location.hostname + "/sp_mn/api/upload/";
                                                if (Ext.isEmpty(Ext.selectRow))
                                                    Ext.MessageBox.alert("แจ้งเตือน", "กรุณากดเลือกข้อมูลที่จะแสดง/ออกเลข PR ก่อน");
                                                window.open(linkDownload + Ext.selectRow.get("c_code") + ".pdf?T=Tap_" + Math.floor(Math.random() * 100000), "Monitoring", 'fullscreen="yes"');
                                            },
                                            scope: this,
                                        },
                                    ];
                            this.contextMenu = new Ext.menu.Menu({
                                items: permissionMenu,
                            });
                        },
                        afterrender: function (g) {
                            this.on("cellclick", cellClick, this); //cellClick
                            this.on(
                                    "contextmenu",
                                    function (e, grid, rowIndex, columnIndex) {
                                        e.stopEvent();
                                        this.contextMenu.showAt(e.getXY());
                                    },
                                    this
                                    );
                            //                            alert(Ext.isAudit);
                            //Permission Right Change SP_EMP TOR
                            if (Ext.LOGIN_LEVEL_SHOW) {
                            }
                            this.getColumnModel().removeColumn(2);
//                            if (Ext.isAudit === false)
//                                this.getColumnModel().removeColumn(3);

                            //Audit sp_emp
                        },
                    },
                    store: Ext.storeDtl,
                    tbar: MenuButton(),
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
};
