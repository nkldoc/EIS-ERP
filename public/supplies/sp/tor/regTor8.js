/* global Ext, user_right_add, user_right_edit, user_right_delete */ ///
AddTor = function (record, butt) {
    Ext.DTL = null;
    if (butt == "ADD") {
        winADD(butt);
    }
    if (butt == "EDIT") {
        Ext.DTL = Ext.selectRow.get("id");
        winADD(butt); 
    } 
};
sumtopbar = function () {
    var i = 0;
    var max = Ext.store2.data.length - 1;
    var sumtop = 0;
    var str = "";
    while (i <= max) {
        str = Ext.store2.data.items[i].data.f_total_amt;
        sumtop += parseInt(str.replace(",", ""));
        i++;
    }
    if (sumtop != 0) {
        var textsum = "<span style=' font-size: 13px; white-space: nowrap;'>ราคารวม : ";
        textsum += sumtop.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " บาท</span>";
        Ext.getCmp("sumtop").setText(textsum);
        Ext.getCmp("f_net_total_amtID").setValue(Ext.floatRenderer(sumtop));
    } else {
        Ext.getCmp("sumtop").setText("");
        Ext.getCmp("f_net_total_amtID").setValue('0.00');
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
                            Ext.getCmp("win-msg-delete").destroy();
                            Ext.store2.load({
                                params: {id: Ext.HDR_ID},
                                callback: function (records, operation, success) {
                                    //sumtopbar();
                                    Ext.getCmp("tabpanelMain4ID").getForm().reset();
                                    Ext.getCmp("editDtlID").hide();
                                    Ext.getCmp("modeSub2ID").setValue('ADD');
                                    Ext.getCmp("tabpanelMain4ID").setTitle("ข้อมูลรายละเอียดรายการจัดซื้อ<br>&nbsp;");
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
                                change: function () {
                                    if (this.getValue().inputValue == 0) {
                                        Ext.getCmp("i_product_type2ID").hide();
                                        Ext.getCmp("i_is_invG2ID").hide();
                                    } else {
                                        Ext.getCmp("i_product_type2ID").show();
                                        Ext.getCmp("i_is_invG2ID").show();
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
                                    if (Ext.getCmp("i_hire_type2ID").getValue().inputValue == 0) {
                                        Ext.getCmp("i_product_type2ID").hide();
                                        Ext.getCmp("i_is_invG2ID").hide();
                                    } else {
                                        Ext.getCmp("i_product_type2ID").show();
                                        Ext.getCmp("i_is_invG2ID").show();
                                    }


                                },
                            },
                        },
                        {
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
                text: "บันทึกรายการ",
                handler: function () {
                    Ext.saveDTL(false);
                },
            },
            {
                text: "ยกเลิก",
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
                //sumtopbar();
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
        Ext.Ajax.request({
            url: "tor/api/mnTorController.php",
            method: "POST",
            params: {
                mode: "UP_SP_TOR_DTL",
                id: Ext.HDR_ID,
                dtl_id: dtl_id,
                dc_expense_budget_type_idTxtID: Ext.getCmp("dc_expense_budget_type_idTxtID").getValue(),
                po_expense_idID: Ext.getCmp("po_expense_idID").getValue(),
                i_hire_type2ID: Ext.getCmp("i_hire_type2ID").getValue().inputValue,
                i_product_type2ID: i_product_type,
                i_is_invG2ID: Ext.getCmp("i_is_invG2IDs1").getValue() == true ? 1 : "",
                c_nameID: Ext.getCmp("c_nameID").getValue(),
                f_unit_costID: Ext.getCmp("f_unit_costID").getValue() == '' ? 0 : Ext.getCmp("f_unit_costID").getValue().replace(/,/g, ""),
                i_qtyID: Ext.getCmp("i_qtyID").getValue(),
                dc_unit_type_idID: Ext.getCmp("dc_unit_type_idID").getValue(),
                //-----------------------------------//
                //f_bg_peroid: Ext.getCmp("f_bg_peroidID").getValue(),      จองเงิน
                f_net_total_amt: Ext.getCmp("f_net_total_amtID").getValue(),
                inv_mode_idID: 0, //Ext.getCmp("inv_mode_idID").getValue(),
                am_mode_idID: 0, // Ext.getCmp("am_mode_idID").getValue(), 
                //  sp_bg_mode_id: Ext.getCmp("sp_bg_mode_idID").getValue(),จองเงิน
                /*                        Ext.getCmp("am_mode_idID").setValue(record.data.am_mode_id);
                 Ext.getCmp("inv_mode_idID").setValue(record.data.inv_mode_id);
                 Ext.getCmp("sp_bg_mode_idID").setValue(record.data.sp_bg_mode_id);
                 Ext.getCmp("f_bg_peroidID").setValue('0.00');*/
                //-----------------------------------               
            },
            success: function (result, request) {
                // Ext.getCmp("win-frm-dtlID").destroy();
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
            },
        });
    } else {
        Ext.Msg.alert("แจ้งเตือน", msg);
    }
}; // saveDTL
Ext.AppUx = function (app, menu) {
    Ext.HDR_ID = null;
    Ext.selectRow = [];
    Ext.menuEditGrid = true;
    Ext.menuRightEditgrid = true;
    Ext.costID = 38; //หน่วยงานผู้รับผิดชอบ พัสดุ
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
    Ext.status = Ext.apply({
        name: menu,
        process: function (menuCode, record) {
            Ext.Ajax.request({
                url: "tor/api/mnTorController.php",
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

        let Date_now = new Date();
        Date_now = Date_now.toISOString().split("T")[0].split("-");
        Ext.bgYear = Date_now[0] - 0 + ((Date_now[1] < 10 ? 0 : 1) - 0)
        return years;
    };
    function cellClick(grid, rowIndex, columnIndex, e) {
        var record = grid.getStore().getAt(rowIndex);
        Ext.selectRow = record;
        if (columnIndex === grid.getColumnModel().getIndexById("processDueID")) {
            controller(Ext.selectRow, "processUpdate"); //on
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
                        "" + (Ext.isEmpty(rec.get("c_code")) ? "รหัส PR ยังไม่ถูกสร้าง" : "") + (rec.get("tor_status_id") > 0 ? "ผ่านรายการเรียบร้อยแล้ว สถานะเมนู <b>" + rec.get("c_name_status") + " - " + rec.get("c_code_status") + "</b>" : ""),
                        function (bu, action) {
                            return false;
                        }
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
    Ext.torItems = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/All_spAlert.php",
        baseParams: {type: "sp_type_id"},
        root: "data",
        idProperty: "id",
        fields: ["id", "c_name"],
    });
    Ext.sub_cost = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/All_spAlert.php",
        baseParams: {type: "sub_cost_id"},
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
    Ext.dc_cost3 = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/All_PoWorkingImpHdr.php",
        baseParams: {
            type: "dc_cost3",
            all: "all"
        },
        root: "data",
        idProperty: "id",
        fields: ["id", "c_code", "c_name"],
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
        fields: ["id", "c_name", "c_bg_type", "i_bg_type"],
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
    Ext.po_expense_expire = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/All_PoWorkingImpHdr.php",
        baseParams: {
            type: "po_expense_expire",
        },
        root: "data",
        idProperty: "id",
        fields: ["id", "c_name"],
    });
    /*
     "i_step" => intval($row["i_step"]),
     "i_forword" => intval($row["i_forword"]),
     "i_backword" => intval($row["i_backword"]),
     */
    Ext.storeDtl = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "tor/api/mnTorController.php",
        baseParams: {
            type: "sp_working_dtl8",
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
                name: "i_type_bg",
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
                name: "i_type_bg",
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
                name: "index_receive"
            },
            {
                name: "end_date",
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

        var winx = show;
        if (statusx === "edit" && Ext.isEmpty(Ext.selectRow))
            Ext.Msg.alert("แจ้งเตือน", "กรุณา click เลือกข้อมูลที่จะแก้ไขใน data grid", function (form, action) {
                return false;
            });

        else

        if (statusx == "add") {
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
            Ext.getCmp("winChequeID").items.items[0].getForm().loadRecord(Ext.selectRow);
            winApp.show();
// ส่งรายการแล้วจะอัพเดทไม่ได้            
            if (Ext.selectRow.get('tor_status_id') > 0) {
         
                Ext.getCmp("saveDtlID").hide();

            } else {
               
                Ext.getCmp("saveDtlID").show();
            }
            // if (Ext.selectRow.get('i_type_bg') == 3) {
            // }

            if (Ext.selectRow.get("i_edit") > 0)
                Ext.Msg.alert("รายการที่ส่งแก้ไข", Ext.selectRow.get('c_comment'), function (form, action) {

                });
            if (Ext.selectRow.get("i_edit") == 2) {
                Ext.getCmp("modeaftereditID").show();
                Ext.getCmp("reasonID").show();
                Ext.getCmp("reasonID").setValue(Ext.selectRow.get("c_comment"));
                Ext.getCmp("menuCodeID").setValue("ST0003");
                Ext.getCmp("i_backwordID").setValue(1);
                Ext.getCmp("menubackID").setValue(4);

//                Ext.getCmp("tor_status_idID").setValue(0);

            }
 


            Ext.store2.setBaseParam("tor_id", Ext.HDR_ID);
            Ext.store2.load({
                callback: function (recordx, operation, success) {
                    if (success) {
                        if (Ext.store2.data.length == 0) {
                            Ext.getCmp("winMain").items.items[0].items.items[1].items.items[0].getForm().loadRecord(Ext.selectDefault);
                        }
                       // sumtopbar();
                    }
                },
            });
        }

    };

    var AppPoStore = function (statuss) {
        var comboCost2 = new Ext.form.ComboBox({
            mode: "local",
            store: Ext.dc_cost2,
            anchor: "50%",
            readOnly: Ext.dcCostFix,
            value: Ext.costID,
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
        var comboCost = new Ext.form.ComboBox({
            mode: "local",
            store: Ext.dc_cost,
            anchor: "50%",
            readOnly: Ext.dcCostFix,
            value: Ext.costID,
            fieldLabel: "หน่วยงานที่รับผิดชอบ",
            id : "dc_cost_idID",
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
            store: Ext.dc_expense_budget_type,
            fieldLabel: "แหล่งเงิน",
            anchor: "60%",
            submitValue: true,
            name: "dc_expense_budget_type_idTxt",
            hiddenName: "dc_expense_budget_type_id",
            id  : "dc_expense_budget_type_idID",
            //po_expense_group_id
            valueField: "id",
            displayField: "c_name",
            triggerAction: "all",
            forceSelection: true,
            selectOnFocus: true,
            typeAhead: false,
            emptyText: "กรุณาเลือกแหล่งเงิน...",
            // validator: function (val) {
            //   if (!Ext.isEmpty(val)) {
            //     return true;
            //   } else {
            //     return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
            //   }
            // },
            listeners: {
                afterrender: function () {
                    this.fn = function () {
                                                        
                        console.log(Ext.getStoreItems(this.store, this.getValue(), "i_bg_type"));
    
    //                Ext.getCmp('sp_bg_mode_idID').setValue(Ext.getStoreItems(this.store, this.getValue(), "i_bg_type"));
    //                  Ext.getCmp('sp_bg_mode_NameID').setValue(Ext.getStoreItems(this.store, this.getValue(), "c_bg_type"));
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
        var comboUsedBgYear = new Ext.form.ComboBox({
            mode: "local",
            fieldLabel: " ปีงบประมาณ",
            submitValue: true,
            hiddenName: "i_yyyy",
            name: "i_year",
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
        // console.log(Ext.selectRow)
        if(Ext.selectRow != null ) {
            let po_expense_id = Ext.selectRow.data.po_expense_id;
            let id_1 = getStoreItems(Ext.po_expense_expire, po_expense_id, "id");
            let id_2 = getStoreItems(Ext.po_expense, po_expense_id, "id");
            if (id_1 != id_2) {
                expense_expire =  Ext.po_expense
            } else {
                expense_expire = Ext.po_expense_expire
            }
        } else {
            expense_expire = Ext.po_expense_expire
        }
        var comboExpense = new Ext.form.ComboBox({
            mode: "local",
            store:  expense_expire ,
            valueField: "id",
            displayField: "c_name",
            anchor: "70%",
            submitValue: true,
            name: "c_detail",
            id: "po_expense_id_ID",
            hiddenName: "po_expense_id",
            triggerAction: "all",
            allBlank: true,
            forceSelection: true,
            selectOnFocus: true,
            fieldLabel: "รายการย่อย",
            width: 200,
            typeAhead: false,
            emptyText: "กรุณาเลือกใช้จ่าย...",
            // validator: function (val) {
            //   if (!Ext.isEmpty(val)) {
            //     return true;
            //   } else {
            //     return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
            //   }
            // },
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
            fields: ["no"
            , "id"
            , "c_code"
            , "c_name"
            ,"dc_expense_budget_type_id"
            ,"po_expense_id"
            ,"dc_cost_id"
            ,"dc_cost2_id"
            ,"i_purchase"
            ,"tor_type_id"
            ,"i_hire_type"
            ,"i_product_type"
            ,"d_doc_ref"
        ],
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

                Ext.getCmp('c_nameMainID').setValue(record.data.c_name);
                // alert (record.data.dc_expense_budget_type_id) ;
                Ext.getCmp('dc_expense_budget_type_idID').setValue(record.data.dc_expense_budget_type_id);
                Ext.getCmp('po_expense_id_ID').setValue(record.data.po_expense_id);
                Ext.getCmp('dc_cost_idID').setValue(record.data.dc_cost_id);
                Ext.getCmp('dc_cost2_idID').setValue(record.data.dc_cost2_id);
                Ext.getCmp('i_purchaseID').setValue(record.data.i_purchase);
                Ext.getCmp('tor_type_idID').setValue(record.data.tor_type_id);
                Ext.getCmp('i_hire_typeID').setValue(record.data.i_hire_type);
                Ext.getCmp('i_product_typeID').setValue(record.data.i_product_type);
                //  Ext.getCmp('d_doc_refID').setValue(record.data.d_doc_ref);
                // Ext.getCmp('').setValue(record.data.c_name); // Ext.getCmp('').setValue(record.data.i_hire_type);
                // Ext.getCmp('').setValue(record.data.c_name);

                Ext.getCmp("win-pop-lov" + id).hide();
                Ext.getCmp("win-pop-lov" + id).destroy();


            }
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
//                            fileUpload: true,
                            frame: true,
                            autoScroll: true,
                            labelAlign: "left",
                            bodyStyle: "padding:1px",
                            labelWidth: 120,
                            width: 1000,
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
                                                    value: 0,
                                                    id: "torHdrID",
                                                },
                                                {
                                                    xtype: "hidden",
                                                    name: "i_dtl_add",
                                                    id: "i_dtl_addID",
                                                    value: 0,
                                                },
                                                {
                                                    xtype: "hidden",
                                                    name: "i_type_bg", 
                                                    value: 8,
                                                },
                                                {
                                                    xtype: "hidden",
                                                    name: "c_comment",
                                                    value: "รายละเอียดต่างๆ",
                                                },  
                                                {
                                                    layout: "column",
                                                    id: "frmPopPrStructorID",
                                                    hidden: true,
                                                    border: false,
                                                    items: [
                                                        {
                                                            columnWidth: 1,
                                                            layout: "form",
                                                            border: false,
                                                            items: [Ext.PopMainPr.mini],
                                                        },
                                                    ],
                                                    listeners: {
                                                        render: function (p) {
                                                            // this.hide();
                                                        },
                                                    },
                                                }  
                                                ,comboUsedBgYear,
                                                {
                                                    xtype: disp,
                                                    fieldLabel: "รหัส PR",
                                                    id: "codeHdrID",
                                                    style: "text-align: center;font-weight:bold;background:#eee;",
                                                    readOnly: true,
                                                    name: "c_code",
                                                },
                                                {
                                                    fieldLabel: "เลขที่สารบัญรับ",
                                                    //  emptyText: "", //readOnly: true, 
                                                    xtype: 'numberfield',
                                                    width: 50,
                                                    name: 'index_receive',
                                                    id: 'index_receiveID',
                                                    /* validator: function (val)
                                                    {
                                                    if (!Ext.isEmpty(val))
                                                    {
                                                    return true;
                                                    } else
                                                    {
                                                    return "กรุณาระบุ เลขทะเบียนคุมรับเอกสาร TOR";
                                                    }
                                                    }*/
                                                },
                                                {
                                                    xtype: disp,
                                                    fieldLabel: "เรื่อง/โครงการ",
                                                    width: 450,
                                                    name: "c_name",
                                                    id: "c_nameMainID",
                                                },
 
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
                                                            name: "f_total_amt",
//                                                            readOnly: true,
                                                            id: "f_totalID",
                                                            listeners: {
                                                                blur: function () {
                                                                    this.fn();
                                                                    if (Ext.getCmp('d_doc_refID').getValue().trim() != '') {
                                                                        Ext.getCmp('d_doc_refID').DocValid();
                                                                    }
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
                                                },  new Ext.form.ComboBox({
                                                    mode: "local",
                                                    store: Ext.torItems,
                                                    anchor: "40%",
                                                    fieldLabel: "วิธีดำเนินงาน (คิด PA)",
                                                    submitValue: true,
                                                    hiddenName: "sp_type_id",
                                                    name: "c_type_id",
                                                    id: "sp_type_idID",
                                                    valueField: "id",
                                                    displayField: "c_name",
                                                    triggerAction: "all",
                                                    forceSelection: true,
                                                    selectOnFocus: true,
                                                    typeAhead: false,
                                                    emptyText: "กรุณาเลือก", 
//                                                    
                                                }),
                                                {
                                                    xtype: "hidden", //textfield hidden
                                                    name: "i_is_more",
                                                    id: "islessID", //i_is_more
                                                },
                                                {
                                                    xtype: "radiogroup",
                                                    columns: [98, 98, 98],
                                                    fieldLabel: "ขอดำเนินการ",
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
                                                            if (this.getValue().inputValue == 3) {
                                                                Ext.getCmp("i_product_typeID").hide();
                                                                Ext.getCmp("i_hire_typeID").hide();
                                                                Ext.getCmp("i_is_invGID").hide();
//                                                                Ext.getCmp("i_type_fix_rateGID").hide();
                                                            } else if (this.getValue().inputValue == 2) {
                                                                Ext.getCmp("i_hire_typeID").show();
//                                                                Ext.getCmp("i_type_fix_rateGID").hide();
                                                                if (Ext.getCmp("i_hire_typeID").getValue().inputValue == 0) {
                                                                    Ext.getCmp("i_product_typeID").hide();
                                                                    Ext.getCmp("i_is_invGID").hide();
                                                                } else {
                                                                    Ext.getCmp("i_product_typeID").show();
                                                                    Ext.getCmp("i_is_invGID").show();
                                                                }
                                                            } else if (this.getValue().inputValue == 1) {
                                                                Ext.getCmp("i_hire_typeID").hide();
                                                                Ext.getCmp("i_product_typeID").show();
                                                                Ext.getCmp("i_is_invGID").show();
//                                                                Ext.getCmp("i_type_fix_rateGID").show();
                                                            }
                                                        },
                                                        afterrender: function () {
                                                            if (this.getValue().inputValue == 3) {
                                                                Ext.getCmp("i_product_typeID").hide();
                                                                Ext.getCmp("i_hire_typeID").hide();
                                                                Ext.getCmp("i_is_invGID").hide();
//                                                                Ext.getCmp("i_type_fix_rateGID").hide();
                                                            } else if (this.getValue().inputValue == 2) {
                                                                Ext.getCmp("i_hire_typeID").show();
//                                                                Ext.getCmp("i_type_fix_rateGID").hide();
                                                                if (Ext.selectRow.get("i_hire_type") == 0) {
                                                                    Ext.getCmp("i_product_typeID").hide();
                                                                    Ext.getCmp("i_is_invGID").hide();
                                                                } else {
                                                                    Ext.getCmp("i_product_typeID").show();
                                                                    Ext.getCmp("i_is_invGID").show();
                                                                }
                                                            } else if (this.getValue().inputValue == 1) {
                                                                Ext.getCmp("i_hire_typeID").hide();
                                                                Ext.getCmp("i_product_typeID").show();
                                                                Ext.getCmp("i_is_invGID").show();
//                                                                Ext.getCmp("i_type_fix_rateGID").show();
                                                            }
                                                        },
                                                    },
                                                },
                                                {
                                                    xtype: "radiogroup",
                                                    columns: [98, 110],
                                                    fieldLabel: "ลักษณะการจ้าง",
                                                    id: "i_hire_typeID",
                                                    name: "i_hire_type",
                                                    items: [
                                                        {
                                                            checked: true,
                                                            name: "i_hire_type",
                                                            inputValue: 1,
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
                                                                Ext.getCmp("i_product_typeID").hide();
                                                                Ext.getCmp("i_is_invGID").hide();
                                                            } else {
                                                                Ext.getCmp("i_product_typeID").show();
                                                                Ext.getCmp("i_is_invGID").show();
                                                            }
                                                        },
                                                        afterrender: function () {
                                                            if (this.getValue().inputValue == 0) {
                                                                Ext.getCmp("i_product_typeID").hide();
                                                                Ext.getCmp("i_is_invGID").hide();
                                                            } else {
                                                                Ext.getCmp("i_product_typeID").show();
                                                                Ext.getCmp("i_is_invGID").show();
                                                            }
                                                        },
                                                    },
//                                                },
//                                                {
//                                                    xtype: "checkboxgroup",
//                                                    fieldLabel: "ประเภทสัญญา",
//                                                    name: "i_type_fix_rate",
//                                                    id: "i_type_fix_rateGID",
//                                                    columns: 1,
//                                                    items: [
//                                                        {
//                                                            id: "i_type_fix_rateIDs1",
//                                                            boxLabel: "จะซื้อ/ขาย",
//                                                            name: "i_type_fix_rate",
//                                                            inputValue: 1,
//                                                        },
//                                                    ],
//                                                    listeners: {
//                                                        afterrender: function () {
//                                                            if (Ext.buAct == "update") {
//                                                                if (Ext.selectRow.get("i_type_fix_rate") == true) {
//                                                                    Ext.getCmp("i_type_fix_rateIDs1").setValue(true);
//                                                                }
//                                                            }
//                                                        },
//                                                    },
                                                },
                                                {
                                                    xtype: "radiogroup",
                                                    columns: [98, 98],
                                                    fieldLabel: "ของที่ได้มา",
                                                    id: "i_product_typeID",
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
                                                            //  Ext.getCmp('i_is_invGID').fn(this.getValue().inputValue);
                                                        },
                                                        afterrender: function () {
                                                            // if (
                                                            //   Ext.getCmp("i_hire_typeID").getValue().inputValue ==
                                                            //   0
                                                            // ) {
                                                            //   Ext.getCmp("i_product_typeID").hide();
                                                            //   Ext.getCmp("i_is_invGID").hide();
                                                            // } else {
                                                            //   Ext.getCmp("i_product_typeID").show();
                                                            //   Ext.getCmp("i_is_invGID").show();
                                                            // }
                                                        },
                                                    },
                                                },
                                                {
                                                    xtype: "checkboxgroup",
                                                    fieldLabel: "การจัดเก็บ",
                                                    name: "i_is_inv",
                                                    id: "i_is_invGID",
                                                    columns: 1,
                                                    items: [
                                                        {
                                                            id: "i_is_invIDs1",
                                                            boxLabel: "เข้าคลัง",
                                                            name: "i_is_inv",
                                                            inputValue: 1,
                                                        },
                                                                // {id: 'cbxDescription', boxLabel: 'Description', name: 'mycbxgrp', inputValue: 2}
                                                    ],
                                                    listeners: {
                                                        afterrender: function () {
                                                            if (Ext.buAct == "update") {
                                                                if (Ext.selectRow.get("i_is_inv") == true) {
                                                                    Ext.getCmp("i_is_invIDs1").setValue(true);
                                                                }
                                                            }
                                                        },

                                                    },
                                                },
                                                {
                                                    xtype: disp,
                                                    fieldLabel: "รหัสเอกสารอ้างอิง",
                                                    name: "d_doc_ref",
                                                    validator: function (val) {
                                                        if (Ext.isEmpty(val) && this.getValue().trim() != '-') {
                                                            return "กรุณาระบุ รหัสเอกสารอ้างอิง";
                                                        } else {
                                                            return true;
                                                        }
                                                    },
                                                    id: "d_doc_refID", 
                                                }, {
                                                    xtype: 'datefield',
                                                    name: 'd_doc_date',
                                                    fieldLabel: "วันที่เอกสารอ้างอิง",
//                                                
                                                },
                                                {
                                                    xtype: "radiogroup",
                                                    columns: [90, 110],
                                                    fieldLabel: "สถานะการใช้งาน",
                                                    name: "i_enabled",
                                                    id: "i_enabledID",
                                                    items: [
                                                        {
                                                            name: "i_enabled",
                                                            checked: true,
                                                            inputValue: 1,
                                                            boxLabel: "ใช้งาน",
                                                        },
                                                        {
                                                            name: "i_enabled",
                                                            inputValue: 2,
                                                            boxLabel: "ไม่ใช้งาน",
                                                        },
                                                    ], //radiogroup

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
                                                                    id: 'updateBuID',
                                                                    inputValue: "UPDATE",
                                                                    boxLabel: "อัพเดทรายการ",
                                                                },{
                                                                    name: "mode",
                                                                  
                                                                    id: 'updateBu2ID',
                                                                    inputValue: "UPDATE2",
                                                                    boxLabel: "ผ่านรายการ จัดสรรเงิน",
                                                                }
                                                            ] 
                                                }, {
                                                    fieldLabel: "เหตุผลในการแก้ไขเอกสารแล้ว",
                                                    xtype: "textarea",
                                                    name: "c_comment",
                                                    hidden: true,
                                                    width: 250,
                                                    id: "reasonID",
                                                }, {
                                                    xtype: 'hidden',
                                                    id: 'i_backwordID',
                                                    name: 'i_backword',
                                                }, {
                                                    xtype: 'hidden',
                                                    id: 'menubackID',
                                                    name: 'menuback',
                                                }, {
                                                    xtype: 'hidden',
                                                    id: 'menuCodeID',
                                                    name: 'menuCode',
                                                }, {
                                                    xtype: 'hidden',
                                                    value: 0,
                                                    id: 'menu_noID',
                                                    name: 'menu_no',
                                                }
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
                                        // {
                                        //   title: "ข้อมูลงวดงาน ",
                                        //   id: "tabpanelMainID3",
                                        //   layout: "form",
                                        //   items: [
                                        //     {
                                        //       xtype: "grid",
                                        //       id: "gridSub2ID",
                                        //       border: true,
                                        //       stripeRows: true,
                                        //       loadMask: true,
                                        //       width: 1000,
                                        //       height: 300,
                                        //       store: Ext.store2,
                                        //       tbar: [
                                        //         {
                                        //           xtype: "button",
                                        //           iconCls: "icon-add",
                                        //           text: "เพิ่มรายการจัดซื้อ",
                                        //           handler: function () {
                                        //             AddTor({}, "ADD");
                                        //           },
                                        //         },
                                        //         {
                                        //           xtype: "button",
                                        //           iconCls: "icon-excel",
                                        //           text: "นำเข้า xls",
                                        //           handler: function () {},
                                        //         },
                                        //       ],
                                        //       columns: col1,
                                        //       viewConfig: { forceFit: true },
                                        //       listeners: {
                                        //         afterRender: function (thisForm, options) {
                                        //           if (Ext.HDR_ID == null) {
                                        //             Ext.getCmp("tabpanelMainID3").hide();
                                        //           }
                                        //           this.on("cellclick", cellClick, this); //cellClick
                                        //         },
                                        //       },
                                        //     },
                                        //   ],
                                        // },
                            ],
                            buttonAlign: "left",
                            buttons: [
                                {
                                    text: "บันทึกรายการ",
                                    id: "buSaveSubID",
                                    iconCls: "icon-save",
                                    listeners: {
                                        afterrender: function () {},
                                    },
                                    handler: function () {
                                        var msg = "";
                                        if (Ext.getCmp("modesubID").getValue().inputValue == "GENCODE") {
                                            if (Ext.store2.data.length == 0) {
                                                msg += "<span style='white-space: nowrap;'>- กรุณาเพิ่มรายการจัดซื้อ</span><br>";
                                            }
                                        }

                                        if (msg == "") {

                                            var formSubmit = function (form) {

                                                form.submit({
                                                    waitMsg: "Saving Data...",
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
                                            if (Ext.getCmp("modesubID").getValue().inputValue == "ADD") {

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
                                        } else {
                                            Ext.Msg.alert("แจ้งเตือน", msg);
                                        }
                                    },
                                    //haddler
                                }, //พี่อ้อ
                                {
                                    text: "ยกเลิกรายการ",
                                    id: "buCancelTorID",
                                    iconCls: "icon-table_delete",
                                    hidden: statusx == "add" ? true : false,
                                    handler: function () {
                                        new Ext.Window({
                                            id: "win-msg-cancel-pr",
                                            title: "ยืนยันการยกเลิกรายการ",
                                            resizable: false,
                                            modal: true,
                                            width: 500,
                                            layout: "form",
                                            items: [
                                                {
                                                    xtype: "displayfield",
                                                    fieldLabel: "รหัส PR",
                                                    value: "<b style='font-size:16px;'>" + Ext.selectRow.data.c_code + "</b>",
                                                },
                                                {
                                                    xtype: "displayfield",
                                                    fieldLabel: "ชื่อรายการ",
                                                    value: "<p style='font-size:13px;'>" + Ext.selectRow.data.c_name + "</p>",
                                                },
                                                {
                                                    xtype: "displayfield",
                                                    fieldLabel: "หมายเหตุ",
                                                    value: "<b style='font-size:14px;color:red;'>เมื่อคุณกดยืนยัน รายการจะถูกยกเลิก และหายไปจากระบบ</b>",
                                                },
                                                {
                                                    fieldLabel: "เหตุผล",
                                                    xtype: "textarea",
                                                    name: "reason",
                                                    width: 350,
                                                    id: "reason_cancel_prID",
                                                },
                                            ],
                                            buttons: [
                                                {
                                                    text: "ยืนยันการยกเลิก",
                                                    iconCls: "icon-table_delete",
                                                    handler: function () {
                                                        if (Ext.isEmpty(Ext.getCmp("reason_cancel_prID").getValue())) {
                                                            Ext.Msg.alert("แจ้งเตือน", "กรุณากรอกเหตุผล");
                                                            return;
                                                        }
                                                        Ext.Ajax.request({
                                                            url: "tor/api/mnTorController.php",
                                                            params: {
                                                                mode: "Cancel_Tor",
                                                                id: Ext.selectRow.data.id,
                                                                sp_status_hdr_id: Ext.selectRow.data.tor_status_id,
                                                                c_comment_delete: Ext.getCmp("reason_cancel_prID").getValue(),
                                                                sp_emp_id: Ext.selectRow.data.sp_emp_id,
                                                                i_type_delete: 2,
                                                            },
                                                            method: "GET",
                                                            success: function (result) {
                                                                var jsonData = Ext.util.JSON.decode(result.responseText);
                                                                if (jsonData.success) {
                                                                    Ext.MessageBox.alert("Success", jsonData.msg, function () {
                                                                        Ext.getCmp("win-msg-cancel-pr").destroy();
                                                                        Ext.getCmp("tabpanel1").getStore().reload();
                                                                        Ext.getCmp("winMain").destroy();
                                                                    });
                                                                } else {
                                                                    Ext.MessageBox.alert("Failed", jsonData.msg);
                                                                }
                                                            },
                                                            failure: function (result) {
                                                                Ext.MessageBox.alert("Failed", result.responseText);
                                                            },
                                                        });
                                                    },
                                                },
                                                {
                                                    text: Ext.GLOBAL_BU_BACK_TH,
                                                    handler: function () {
                                                        Ext.getCmp("win-msg-cancel-pr").hide();
                                                        Ext.getCmp("win-msg-cancel-pr").destroy();
                                                    },
                                                },
                                            ],
                                        }).show();
                                    },
                                },
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
                                    height: 500,
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
                                            fieldLabel: "แหล่งเงิน ",
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
                                            typeAhead: false,
                                            emptyText: "กรุณาเลือกแหล่งเงิน...",
                                            listeners: {
                                                afterrender: function () {
                                                    this.fn = function () {};
                                                    this.fn();
                                                },
                                                change: function () {
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
                                            id: "po_expense_idID",
                                            name: "po_expense_id",
                                            hiddenName: "po_expense_id",
                                            triggerAction: "all",
                                            allBlank: true,
                                            forceSelection: true,
                                            selectOnFocus: true,
                                            fieldLabel: "รายการย่อย ",
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
                                                change: function () {
                                                    if (this.getValue().inputValue == 0) {
                                                        Ext.getCmp("i_product_type2ID").hide();
                                                        Ext.getCmp("i_is_invG2ID").hide();
                                                    } else {
                                                        Ext.getCmp("i_product_type2ID").show();
                                                        Ext.getCmp("i_is_invG2ID").show();
                                                    }
                                                },
                                                afterrender: function () {
                                                    Ext.getCmp("i_hire_type2ID").setValue(Ext.selectRow.data.i_hire_type);
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
                                                    Ext.getCmp('i_product_type2ID').fn();
                                                },
                                                afterrender: function () {
                                                    Ext.getCmp("i_product_type2ID").setValue(Ext.selectRow.data.i_product_type);
                                                    if (Ext.getCmp("i_hire_type2ID").getValue().inputValue == 0) {
                                                        Ext.getCmp("i_product_type2ID").hide();
                                                        Ext.getCmp("i_is_invG2ID").hide();
                                                    } else {
                                                        Ext.getCmp("i_product_type2ID").show();
                                                        Ext.getCmp("i_is_invG2ID").show();
                                                    }
                                                    this.fn = function () { //Ext.getCmp('i_product_type2ID').fn();
                                                        /*if (this.getValue().inputValue == 1) {
                                                         //                                                            Ext.getCmp("inv_mode_idID").show();
                                                         //                                                            Ext.getCmp("am_mode_idID").hide();
                                                         } else {
                                                         //                                                            Ext.getCmp("inv_mode_idID").hide();
                                                         //                                                            Ext.getCmp("am_mode_idID").show();
                                                         }*/
                                                    }
                                                },
                                            },
                                        },
                                        {
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
                                        }, /*new Ext.form.ComboBox({
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
                                         }),*/
                                        /* new Ext.form.ComboBox({
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
                                         }),*/
                                        {
                                            fieldLabel: "ชื่อรายการ",
                                            id: "c_nameID",
                                            width: "90%",
                                            name: "c_name",
                                            allowBlank: false,
                                        },
                                        {
                                            fieldLabel: "จำนวน",
                                            selectOnFocus: true,
                                            id: "i_qtyID",
                                            width: 60,
                                            name: "i_qty",
                                            style: "text-align: center",
                                            listeners: {
                                                blur: function () {
                                                    Ext.getCmp('f_net_total_amtID').fn();
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
                                            fieldLabel: "ราคา/ต่อหน่วย",
                                            selectOnFocus: true,
                                            id: "f_unit_costID",
                                            width: 120,
                                            name: "f_unit_price",
                                            listeners: {
                                                blur: function () {

                                                    Ext.getCmp('f_net_total_amtID').fn();

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
                                        }), {
                                            xtype: "buttongroup",
                                            fieldLabel: "จำนวนเงิน",
                                            frame: false,
                                            border: false,
                                            items: [
                                                {
                                                    xtype: 'textfield',
                                                    value: 'hidden',
                                                    name: 'f_net_total_amt',
                                                    id: 'f_net_total_amtID',
                                                    style: {
                                                        labelAlign: "right",
                                                        "font-weight": "bold",
                                                        padding: "1px",
                                                        margin: "1px",
                                                        color: "blue",
                                                        "background-color": "#fff",
                                                        "text-align": "right",
                                                    },
                                                    listeners: {
                                                        blur: function () {
                                                            Ext.getCmp('f_net_total_amtID').fn();
                                                        },
                                                        afterrender: function () {
                                                            this.fn = function () { //i_qtyID f_unit_costID f_net_total_amtID //parseFloat(this.getValue().replace(/,/g, "") / 1);

                                                                var i_qtyID = parseFloat(Ext.getCmp('i_qtyID').getValue().replace(/,/g, "") / 1);
                                                                var f_unit_costID = parseFloat(Ext.getCmp('f_unit_costID').getValue().replace(/,/g, "") / 1);
                                                                if (f_unit_costID > 0 && i_qtyID > 0) {
                                                                    Ext.getCmp('i_qtyID').setValue(Ext.floatRenderer(i_qtyID));
                                                                    Ext.getCmp('f_unit_costID').setValue(Ext.floatRenderer(f_unit_costID));
                                                                    Ext.getCmp('f_net_total_amtID').setValue(Ext.floatRenderer(i_qtyID * f_unit_costID));
                                                                } else {

                                                                }

                                                            }
                                                            Ext.getCmp('f_net_total_amtID').fn();
                                                        }
                                                    },
                                                },
                                                    

                                            ],
                                        } , {
                                         
                                            xtype: 'hidden',
                                            name: 'sp_bg_mode_id',
                                            id: 'sp_bg_mode_idID', 
                                            } 
                                    ],
                                }),
                                {
                                    columnWidth: 0.6,
                                    layout: "fit",
                                    height: 460,
                                    id: "tabpanelMain2ID", 
                                    autoScroll: true,
                                    listeners: {
                                        afterrender: function () { }
                                    },
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
                                                                       // sumtopbar();
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
                                                                Ext.getCmp("modeSub2ID").setValue('ADD');
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
                                                {header: "รวม 1", dataIndex: "f_total_amt", align: "right", width: 25},
                                    
                                                {
                                                    id: "delete",
                                                    header: "ลบ",
                                                    sortable: false,
                                                    align: "center",
                                                    width: 8,
                                                    dataIndex: "id",
                                                    renderer: function (value, metaData, record, row, col, store, gridView) {
                                                        return '<img src="../images/icons/table_delete.png"); style="cursor:pointer"/>';
                                                    } 
                                                },
                                                {width: 1, dataIndex: ""},
                                            ],
                                            viewConfig: {forceFit: true},
                                            listeners: {
                                                beforerender: function () {
                                                    this.thisCick = function (grid, rowIndex, columnIndex, e) {
                                                        var record = grid.getStore().getAt(rowIndex);
                                                        if (columnIndex != grid.getColumnModel().getIndexById("delete")) {
                                                            Ext.getCmp("sp_tor_dtl_idID").setValue(record.data.id);
                                                            Ext.getCmp("dc_expense_budget_type_idTxtID").setValue(record.data.dc_expense_budget_type_id);
                                                            Ext.getCmp("dc_expense_budget_type_idTxtID").fn();
                                                            Ext.getCmp("po_expense_idID").setValue(record.data.po_expense_id);
                                                            Ext.getCmp("i_hire_type2ID").setValue(record.data.i_hire_type);
                                                            Ext.getCmp("i_product_type2ID").setValue(record.data.i_product_type);
                                                            Ext.getCmp("i_is_invG2IDs1").setValue(record.data.i_is_inv);
                                                            Ext.getCmp("c_nameID").setValue(record.data.c_name);
                                                            Ext.getCmp("i_qtyID").setValue(record.data.i_qty); 
                                                            Ext.getCmp("f_net_total_amtID").setValue(record.data.f_net_total_price);
                                                             
                                                            Ext.getCmp("f_unit_costID").setValue(record.data.f_unit_price);
                                                            //                                 Ext.getCmp("index_receiveID").setValue(record.data.index_receive); //เลขสารบัญรับ
                                                            Ext.getCmp("dc_unit_type_idID").setValue(record.data.dc_unit_type_id);

                                                            Ext.getCmp("editDtlID").show();
                                                            Ext.getCmp("modeSub2ID").setValue('EDIT');
                                                            var nameTitle = "ข้อมูลรายละเอียดรายการจัดซื้อ<br>";
                                                            nameTitle += record.data.no + ". " + record.data.c_name + " ( " + record.data.i_qty + " x " + record.data.f_unit_price + " บาท / " + record.data.dc_unit_name + ")";
                                                            Ext.getCmp("tabpanelMain4ID").setTitle(nameTitle);
                                                            Ext.getCmp("winPeriodDtlID").doLayout();
                                                        } else if (columnIndex == grid.getColumnModel().getIndexById("delete")) {
                                                            DeleteTor_dtl(record);
                                                        }
                                                    };
                                                },
                                                afterrender: function () {
                                                    if (Ext.selectRow.data.i_purchase == 3) {
                                                        Ext.getCmp("i_product_type2ID").hide();
                                                        Ext.getCmp("i_hire_type2ID").hide();
                                                        Ext.getCmp("i_is_invG2ID").hide();
                                                    } else if (Ext.selectRow.data.i_purchase == 2) {
                                                        Ext.getCmp("i_product_type2ID").show();
                                                        Ext.getCmp("i_hire_type2ID").show();
                                                        Ext.getCmp("i_is_invG2ID").show();
                                                    } else if (Ext.selectRow.data.i_purchase == 1) {
                                                        Ext.getCmp("i_product_type2ID").show();
                                                        Ext.getCmp("i_hire_type2ID").hide();
                                                        Ext.getCmp("i_is_invG2ID").show();
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
                                        if (Ext.getCmp('modeSub2ID').getValue() == "ADD") {
                                            Ext.saveDTL("SAVE_DTL");
                                        } else { 
                                            Ext.getCmp('modeSub2ID').setValue("ADD");
                                        }

                                    },
                                },
                                {xtype: "tbspacer", width: 10},
                                {xtype: 'hidden', id: 'modeSub2ID', name: 'STATUS', value: "ADD"},
                                {
                                    text: "&nbsp;แก้ไขรายการ&nbsp;",
                                    id: "editDtlID",
                                    hidden: true,
                                    iconCls: "icon-save-edit",
                                    handler: function () {
                                        if (Ext.getCmp('modeSub2ID').getValue() == "EDIT") {
                                            Ext.saveDTL("EDIT_DTL");
                                        } else { 
                                            Ext.getCmp('modeSub2ID').setValue("EDIT");
                                        }

                                    },
                                },
                            ],
                        },
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
                return"ยังไม่อัพโหลดเอกสาร";

        }
        var urlUpload = window.location.protocol + '//' + window.location.hostname + '/sp_mn/api/mnUploadDoc.php';
        var linkDownload = window.location.protocol + '//' + window.location.hostname + '/sp_mn/api/upload';

        return new Ext.Panel({
            labelAlign: 'top',
            title: "เอกสารเพิ่มเติมของการทำ PR",
            bodyStyle: "padding:5px",
            id: 'frmSubID',
            layout: "fit",
            items: [
                new Ext.FormPanel({
                    height: 180,
                    layout: "form",
                    id: 'frmSubItemID',
                    url: urlUpload,
                    fileUpload: true,
                    border: false,
                    listeners: {
                        beforerender: function () {
                            console.log(Ext.selectRow);
                        }
                    },
                    items: [{

                            xtype: 'hidden',
                            name: 'id',
                            value: Ext.selectRow.get('id'),
                        }, {
                            xtype: 'hidden',
                            name: 'i_is_upload',
                            value: Ext.selectRow.get('i_is_upload'),
                        }, {
                            fieldLabel: "hostname",
                            xtype: 'textfield',
                            width: 400,
                            readonly: true,
                            name: 'hostname',
                            value: urlUpload,
                        }, {
                            fieldLabel: "ชื่อเอกสาร",
                            xtype: 'textfield',
                            width: 400,
                            name: 'c_code',
                            value: Ext.selectRow.get('c_code'),
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
                        }, {
                            xtype: 'panel',
                            border: false,
                            html: '<p>Download :: <a type="button" href="' + linkDownload + '/' + Ext.selectRow.get('c_code')
                                    + '.pdf?T=Tap_' + Math.floor(Math.random() * 100000) + '" value="facebook" target="_blank" class="buttonx">'
                                    + getPDF(Ext.selectRow.get('i_is_upload')) + '</a></p>'
//                            html: '<p>Download :: <button onclick="funPDF();">' + Ext.selectRow.get('i_is_upload') + '.pdf</button></p>'
//                                    + '<p>Download :: ' + linkDownload + '/' + Ext.selectRow.get('c_code') + '.pdf</p>',

                        }
                    ],
                    buttonAlign: "left",
                    buttons: [{
                            text: "บันทึกเอกสารเพิ่ม",
                            handler: function () {


                                var form = Ext.getCmp("frmSubItemID").getForm();
                                form.submit({
                                    waitMsg: "Saving Data...",
                                    success: function (form, action) {

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
                            handler: function ()
                            {

                                Ext.getCmp("frmSubID").destroy();
                            }
                        },
                    ],
                }),
            ],
        });

    } // END FUNCTION

    function SearchFrm() {
        return new Ext.Window({
            title: "ค้นหารายการ",
            width: 700,
            id: "winSearchFrm",
            height: 200,
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
                                    xtype: "textfield",
                                    fieldLabel: "เลขที่อ้างอิง",
                                    id: "sd_doc_refID",
                                    name: "d_doc_ref",
                                },
                                {
                                    xtype: "radiogroup",
                                    columns: [120],
                                    fieldLabel: "ผ่านรายการ",
                                    id: "searchPostID",
                                    name: "i_post",
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
                                        {
                                            name: "i_post",
                                            inputValue: 3,
                                            boxLabel: "ทักท้วง",
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
                                        baseParams: {
                                            type: "sp_type_status",
                                            i_is_type_tor: true,
                                            all: "all",
                                        },
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
                                new Ext.form.ComboBox({
                                    mode: "local",
                                    store: Ext.dc_cost3,

                                    // all: "all",
                                    anchor: "100%",
                                    fieldLabel: "หน่วยงานเจ้าของเรื่อง",
                                    submitValue: true,
                                    hiddenName: "stor_type_id",
                                    name: "dc_cost3_id",
                                    id: "dc_cost3_idID",
                                    valueField: "id",
                                    displayField: "c_name",
                                    triggerAction: "all",
                                    forceSelection: false,
                                    selectOnFocus: true,
                                    typeAhead: false,
                                    emptyText: "กรุณาเลือก",
                                    listeners: {
//                                        change:function(){
//                                            Ext.getCmp('d_doc_refID').DocValid();
//                                        },
                                        afterrender: function () {
                                            //setLoad&&callback
                                            this.store.load({
                                                callback: function (record, operation, success) {
                                                    if (success) {
                                                        Ext.getCmp("dc_cost3_idID").setValue(this.data.items[0].get("c_code"));
                                                    }
                                                    // if (Ext.dc_cost2== )
                                                },
                                            });
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
                                    columns: [80, 90],
                                    fieldLabel: "สถานะการใช้งาน",
                                    id: "searchEnabledID",
                                    name: "si_enabled",
                                    items: [
                                        {
                                            name: "si_enabled",
                                            checked: true,
                                            inputValue: 1,
                                            boxLabel: "ใช้งาน",
                                        },
                                        {
                                            name: "si_enabled",
                                            inputValue: 2,
                                            boxLabel: "ไม่ใช้งาน",
                                        },
                                    ], //radiogroup
                                },
                            ],
                        },
                    ],
                    buttonAlign: "left",
                    buttons: [
                        {
                            text: "ค้นหา",
                            handler: function () {
                                Ext.getCmp('winSearchFrm').search();
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
            listeners: {
                afterRender: function (thisForm, options) {
                    this.search = function () {
                        Ext.storeDtl.setBaseParam("mode", "LIST");
                        Ext.storeDtl.setBaseParam("act", "SEARCH");
                        Ext.storeDtl.setBaseParam("d_tor_date", Ext.getCmp("sd_tor_dateID").getValue());
                        Ext.storeDtl.setBaseParam("tor_type_id", Ext.getCmp("stor_type_idID").getValue());
                        Ext.storeDtl.setBaseParam("dc_cost3_id", Ext.getCmp("dc_cost3_idID").getValue());

                        Ext.storeDtl.setBaseParam("c_code", Ext.getCmp("sc_codeID").getValue());
                        Ext.storeDtl.setBaseParam("c_name", Ext.getCmp("sc_nameID").getValue());
                        Ext.storeDtl.setBaseParam("i_enabled", Ext.getCmp("searchEnabledID").getValue().inputValue);
                        Ext.storeDtl.setBaseParam("i_post", Ext.getCmp("searchPostID").getValue().inputValue);
                        Ext.storeDtl.setBaseParam("d_doc_ref", Ext.getCmp("sd_doc_refID").getValue());
                        Ext.storeDtl.load();
                    }
                    new Ext.KeyNav("winSearchFrm", {
                        enter: function (e) {
                            this.search();
                        },
                        scope: this,
                    });
                },
            },
        });
    }
    var MenuButton = function () {
        var menu = new Ext.menu.Menu({
            id: "mainMenu",
            border: false,
            style: {
                overflow: "visible",
            }
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
                        })
                        );
 
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
                        header: "ผ่านรายการ",
                        sortable: false,
                        align: "center",
                        dataIndex: "id",
                        id: "processDueID",
                        width: 80,
                        renderer: function (value, metaData, record, row, col, store, gridView) {
                            //Ext.isEmpty(record.get('c_code')) || (record.get('tor_status_id') != null)
                            metaData.attr = "style='cursor:pointer; text-align:center;';";
                            var imgc = Ext.isEmpty(record.get("c_code")) && record.get("tor_status_id") == null ? "application_form" : "cog_start";
                            var imgs = !Ext.isEmpty(record.get("c_code")) && record.get("tor_status_id") != null ? "application_go" : imgc; 
                            return '<img src="../images/icons/' + imgs + '.png" style="cursor:pointer"/>';
                        }
                    },
                    {
                        header: "เรื่อง/โครงการ",
                        sortable: true,
                        align: "left",
                        dataIndex: "c_name",
                        width: 250,
                    },
                    {
                        header: "เลขสารบัญรับ",
                        sortable: true,
                        align: "left",
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
                        align: "center",
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
                        align: "center",
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
                            Ext.selectDefault = Ext.selectRow;

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
                                        text: "แนบไฟล์ PDF",
                                        icon: "../images/icons/icon_pdf.png",
                                        handler: function (e) {
                                            Ext.buAct = "getDetail";
                                            if (Ext.isEmpty(Ext.selectRow) || Ext.selectRow.get('c_code') == "") {
                                                Ext.MessageBox.alert("แจ้งเตือน", "กรุณากดเลือกข้อมูลที่จะแสดง/ออกเลข PR ก่อน");
                                            } else if (Ext.isEmpty(Ext.getCmp('frmSubID'))) {

                                                var ttb = tab2();
                                                Ext.getCmp("contenterCenter").add(ttb);
                                                Ext.getCmp("contenterCenter").setActiveTab(ttb);
                                            } else {
                                                Ext.getCmp("frmSubID").destroy();
                                                var ttb = tab2();
                                                Ext.getCmp("contenterCenter").add(ttb);
                                                Ext.getCmp("contenterCenter").setActiveTab(ttb);
                                            }
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
                                        //                                     }, {
                                        //                                         text: "คัดลอกข้อมูลใน copy data in cell grid",
                                        //                                         icon: "../images/icons/page_copy.png",
                                        //                                         handler: function (e)
                                        //                                         {
                                        //                                             //field
                                        //                                             Ext.buAct = "copy";
                                        //                                             var arrDataCopy = ["c_detail", "c_code_ref", "po_creditor_name"];
                                        //                                             var rowx = Ext.selectRow;
                                        //
                                        //                                             if (!Ext.isEmpty(rowx) && !Ext.isEmpty(arrDataCopy))
                                        //                                                 //if Ctlr+c
                                        //                                                 CopyToClipboard(rowx, arrDataCopy);
                                        //                                         },
                                        //                                         scope: this
                                    },
                                ],
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
    ); //EditorGridPanel or GridPanel
    ///////////////// EditorGridPanel
};
//OnLoad Renderer
Ext.onReady(function () {
    Ext.QuickTips.init();
    Ext.user_right_add = user_right_add;
    Ext.user_right_edit = user_right_edit;
    Ext.user_right_delete = user_right_delete;
    Ext.bg_period = [];//ประเภทเงินงวดอุดหนุ่น
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
