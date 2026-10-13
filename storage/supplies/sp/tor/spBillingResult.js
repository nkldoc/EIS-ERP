/* global Ext, user_right_add, user_right_edit, user_right_delete */

Ext.url_process = './tor/api/mnSbillController.php';
Ext.i_step = 4;
Ext.menu_back = 'ST0013'; //ส่งคืนตรวจสอบเอกสาร
Ext.menu_goto = null; //ส่งคืนตรวจสอบเอกสาร
//hidden
Ext.reversstep = false;
Ext.backstep = true;
Ext.reversstep = false;
Ext.menu_arr = [
    ['ส่งมอบงาน', 'ST0012', 1],
    ['ตรวจรับพัสดุ/ครุภัณฑ์', 'ST0013', 2],
    ['การมอบหมายผู้ปฏิบัติงาน', 'ST0114', 3],
    ['บันทึกใบขอเบิก', 'ST0115', 4],
    ['บันทึกเลขครุภัณฑ์', 'ST0116', 5],
];

Ext.fnAddItems = function (li) {

    var total = Ext.getCmp('win-frm-summaryID').items.length;
    var totalCount = total + 2;
    var line = Ext.objLine;
//    alert(Ext.objLine);
    Ext.getCmp('win-frm-summaryID').insert(totalCount, new Ext.form.FieldSet({
//                            xtype: 'fieldset',
        title: 'รายละเอียดการส่งของครั้งที่ ' + (Ext.objLine),
        collapsible: true,
        autoHeight: true,
        id: "legendID[" + line + "]",
        anchor: "50%",
        defaults: {width: 310},
        defaultType: 'textfield',
        items: [
            {
                xtype: "textfield",
                id: "c_doc_refID[" + line + "]",
                name: "c_doc_ref[" + line + "]",
                width: 160,
                fieldLabel: "เลขที่ใบส่งของ/ใบแจ้งหนี้",
                change: function (value, metaData, record, row, col, store, gridView) {
                    metaData.attr = "style='cursor:''; text-align:center;';";
                    return value;
                    // }
                }, validator: function (val) {
                    if (Ext.isEmpty(val)) {
                        return "กรุณากรอกข้อมูลให้ถูกต้อง";
                    } else {
                        return true;
                    }
                }
            },
            {
                fieldLabel: "วันที่เอกสาร",
                id: "d_doc_dateSubID[" + line + "]",
                name: "d_doc_date[" + line + "]",
                xtype: "datefield",
                width: 160,
                validator: function (val) {
                    if (Ext.isEmpty(val)) {
                        return "วันที่บันทึก";
                    } else {
                        return true;
                    }
                }
            }, {
                xtype: "textfield",
                name: "f_period_amt[" + line + "]",
                id: "f_period_amtID[" + line + "]",
                width: 160,
                fieldLabel: "จำนวนเงิน (รวม VAT)",
                style: "text-align: right", validator: function (val) {
                    if (Ext.isEmpty(val)) {
                        return "จำนวนเงินในงวด";
                    } else {
                        return true;
                    }
                },
                listeners: {
                    beforerender: function () {
                        this.fn = function () {
                            var val = 0;
                            val = this.getValue();
                            var f_total = val;// Ext.getCmp("f_total2ID").getValue();
                            f_total = parseFloat(f_total.replace(/,/g, "") / 1);
                            this.setValue(Ext.floatRenderer(f_total));
                        };
                    },
                    Change: function (value) {
                        this.fn();
                    },
                    blur: function () {
                        this.fn();
                    },
                    afterrender: function () {
                        this.fn();
                    }
                },
            }, {
                xtype: "button",
                name: "button",
                iconCls: "icon-drop",
                text: " - ลบรายการที่ " + Ext.objLine + "",
                id: "buttonDelID[" + line + "]",
                width: "50px",
                handler: function () {
                    Ext.getCmp('win-frm-summaryID').remove(Ext.getCmp("legendID[" + line + "]"));
                }

            }]
    }));
    Ext.getCmp('win-frm-summaryID').doLayout();
};
function winResultBilling(rec) {
    Ext.ev = rec;

    Ext.objLine = 0;
    var winResult = new Ext.Window({
        id: "win-resultID",
        title: "ทำสรุปใบวางบิลก่อนส่งเบิก",
        modal: true,
        plain: true,
        collapsible: true,
        maximizable: true,
        layout: "fit",
        items: new Ext.FormPanel({
            id: "win-frm-summaryID",
            url: Ext.url_process,
            autoScroll: true,
            width: Ext.getCmp("contenterCenter").getWidth() - 50,
            height: Ext.getCmp("contenterCenter").getHeight() - 50,
            labelWidth: 180,
            bodyStyle: "padding:5px;",
            items: [
                {
                    xtype: "hidden",
                    name: "mode",
                    id: "modeID",
                    value: (Ext.ev == 'add' ? "ADD" : "UPDATE"),
                }, {
                    xtype: "hidden",
                    name: "sp_sbill_hdr_id",
//                },
//                {
//                    xtype: "hidden",
//                    name: "sp_tor_hdr_period_id",
                },
                {
                    xtype: "textfield",
                    id: "c_contract_codeID",
                    name: "c_contract_code",
                    width: 160,
                    fieldLabel: "เลขที่สัญญา", validator: function (val) {
                        if (Ext.isEmpty(val)) {
                            return "กรุณากรอกข้อมูลให้ถูกต้อง";
                        } else {
                            return true;
                        }
                    }
                }, {
                    xtype: "textfield",
                    id: "c_doc_result_refID",
                    name: "c_doc_result_ref",
                    width: 160,
                    fieldLabel: "งวดที่ของสัญญา/ครั้งที่เบิก", validator: function (val) {
                        if (Ext.isEmpty(val)) {
                            return "กรุณากรอกข้อมูลให้ถูกต้อง";
                        } else {
                            return true;
                        }
                    }

                }, {
                    xtype: "button",
                    iconCls: "icon-add",
                    fieldLabel: "รายละเอียดบิล",
                    name: "button",
                    text: "เพิ่ม [ + ] จำนวนการรับของ/วางบิล",
                    handler: function () {
                        if (Ext.ev == 'add')
                            Ext.fnAddItems(Ext.objLine++);
                        else {

                            Ext.fnAddItems(Ext.objLine++);
                        }

                    }
                },
            ],
            buttonAlign: "left",
            buttons: [
                {
                    text: "บักทึกสรุป รวมการรับของ",
                    iconCls: "icon-save",
                    handler: function () {
                        var form = Ext.getCmp('win-frm-summaryID').getForm();

                        Ext.beforeSubmit = function (form, fld) {
                            var it = form.items.items;
                            it.forEach(function (v) {
                                if (v.name.match(fld)) {
                                    v.setValue(parseFloat(v.value.replace(/,/g, "") / 1));
                                    console.log(v.name);
                                    console.log(v.getValue());
                                }
                            });
                        };


                        Ext.beforeSubmit(form, /f_period_amt/);
                        console.log(Ext.getCmp('f_period_amtID[1]').getValue());


//                        return false;
                        if (form.isValid()) {
                            form.submit({
                                waitMsg: 'Saving Data...',
                                success: function (form, action) {
                                    Ext.Msg.alert("Success", "<span style='white-space: nowrap;'>" + action.result.msg + "</span>", function (form, action) {
                                        Ext.getCmp("tabpanel1").getStore().reload();
                                        Ext.selectRow = null;
                                        Ext.getCmp('win-resultID').destroy(); //<span style='white-space: nowrap;'>
                                    });
                                },
                                failure: function (form, action) {
                                    switch (action.failureType) {
                                        case Ext.form.Action.CLIENT_INVALID:
                                            Ext.Msg.alert('Failure', 'ข้อมูลใน fileds ไม่ถูกต้อง');
                                            break;
                                        case Ext.form.Action.CONNECT_FAILURE:
                                            Ext.Msg.alert('Failure', 'พลข้อผิดพลาดในการเชื่อต่อเครือข่าย');
                                            break;
                                        case Ext.form.Action.SERVER_INVALID:
                                            Ext.Msg.alert('Failure', action.result.msg);
                                    }
                                }
                            });
                        }
                    }

                },
                {
                    text: Ext.GLOBAL_BU_BACK_TH,
                    iconCls: "icon-clear",
                    handler: function () {
                        Ext.getCmp("win-resultID").destroy(); // clear memory :: garbage collection
                    }
                }
            ], listeners: {
                beforrender: function () {
                },
                afterrender: function () {

                    if (Ext.ev == "add") {
                        Ext.fnAddItems(Ext.objLine++);
                    } else {
                        Ext.storeDtl2.setBaseParam("sp_sbill_hdr_id", Ext.selectRow.get("id"));
                        Ext.storeDtl2.load({
                            callback: function (record, operation, success) {
                                if (success) {
                                    for (var i = 0, l = record.length; i < l; i++) {
                                        Ext.objLine = 1 + i;
                                        Ext.fnAddItems(Ext.objLine);
                                        Ext.selectRow.set("c_doc_ref[" + Ext.objLine + "]", record[i].get('c_doc_ref'));
                                        Ext.selectRow.set("d_doc_date[" + Ext.objLine + "]", record[i].get('d_doc_date'));
                                        Ext.selectRow.set("f_period_amt[" + Ext.objLine + "]", record[i].get('f_period_amt'));

                                        Ext.getCmp('win-frm-summaryID').getForm().loadRecord(Ext.selectRow);
                                        if (Ext.objLine == record.length) {
//                                            alert(Ext.objLine + ' ==== ' + record.length); 
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
            }
        })
    }).show();
}


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

    function cellClick(grid, rowIndex, columnIndex, e) {
        var record = grid.getStore().getAt(rowIndex);
        Ext.selectRow = record;
        if (columnIndex === grid.getColumnModel().getIndexById("processDueID")) {
            //ttf
            controller(Ext.selectRow, "processUpdate"); //on
        } else if (columnIndex === grid.getColumnModel().getIndexById("editEmpTorID")) {
            controller(Ext.selectRow, "editEmpTorID");
        } else if (columnIndex === grid.getColumnModel().getIndexById("i_statusDel")) {
            if (record.get('i_status') == 0)
                Ext.MessageBox.show({
                    title: "Icon Support",
                    msg: "คุณต้องการที่จะลบ รายการที่เลือกนี้ใช่ใหม ?",
                    buttons: Ext.MessageBox.OKCANCEL,
                    icon: Ext.MessageBox.WARNING,
                    id: 'row-del',
                    fn: function (btn) {
                        if (btn === "ok") {
                            Ext.Ajax.request({
                                url: Ext.url_process,
                                method: "POST",
                                params: {mode: "DELETE", sp_sbill_hdr_id: record.get('sp_sbill_hdr_id')},
                                success: function (result, request) {
                                    Ext.getCmp("tabpanel1").getStore().reload();
                                    Ext.selectRow = null;
                                    Ext.getCmp('row-del').destroy(); //<span style='white-space: nowrap;'>
                                }
                            });
                        } else {
                            return;
                        }
                    }
                });
        } else if (columnIndex === grid.getColumnModel().getIndexById("resultID")) {

            if (record.get('i_status') > 0)
                Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>รายการนี้ได้ทำบันทึกเบิกไปแล้ว</span>", function (bu, action) {
                    return false;
                });
            else
                winResultBilling();
        }
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
            if (rec.get("i_step") == 0) {
                Ext.Msg.alert("แจ้งเตือน", "ต้องบันทึกลงทะเบียนก่อนผ่านรายการ", function (bu, action) {
                    return false;
                });
            } else if (rec.get("i_is_register") == 0) {
                Ext.Msg.alert("แจ้งเตือน"
                        , "<span style='white-space: nowrap;'>กรุณาบันทึกรายการก่อนผ่านรายการ</span><br>"
                        , function (bu, action) {
                            return false;
                        });
                return;
            } else {
                winProcess(rec);
            }


        }
    } // Controller
    //AutoLoad
    Ext.storeDtl = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "tor/api/List_sBill_items.php",
        baseParams: {
            type: "po_working_dtl",
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
                name: "sp_sbill_hdr_id",
            },
            {
                name: "c_contract_code",
            },
            {
                name: "c_doc_result_ref",
            },
            {
                name: "c_doc_ref",
            },
            {
                name: "f_period_amt",
            },
            {
                name: "d_doc_date",
            },
            {
                name: "i_status",
            },
            {
                name: "c_status",
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
        ],
    });
    Ext.storeDtl2 = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: false,
        url: "tor/api/List_sBill_items.php",
        baseParams: {
            type: "po_working_dtl1",
        },
        root: "data",
        idProperty: "row",
        totalProperty: "totalCount",
        fields: [
            {
                name: "row",
            },
            {
                name: "id",
            },
            {
                name: "sp_sbill_hdr_id",
            },
            {
                name: "c_contract_code",
            },
            {
                name: "c_doc_result_ref",
            },
            {
                name: "c_doc_ref",
            },
            {
                name: "f_period_amt",
            },
            {
                name: "i_status",
            },
            {
                name: "c_status",
            },
            {
                name: "d_doc_date",
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
    Ext.loadStore = function (status, show) { };

    function SearchFrm() {
        return new Ext.Window({
            //                     collapsible: true,
            //                     maximizable: true,
            title: "ค้นหารายการ PR",
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
                                    fieldLabel: "เลขสัญญา",
                                    id: "sc_contract_codeID", // sd_tor_dateID sc_codeID sc_nameID searchEnabledID
                                    name: "c_contract_code",
                                }
                            ],
                        },
                        {
                            columnWidth: 0.5,
                            layout: "form",
                            border: false,
                            items: [
                                {
                                    xtype: "textfield",
                                    fieldLabel: "งวดที่ของสัญญา/ครั้งที่เบิก",
                                    id: "sc_doc_result_refID",
                                    name: "c_doc_result_ref",
                                },
                                {
                                    xtype: "radiogroup",
                                    columns: [80, 90],
                                    fieldLabel: "สถานะการเบิก",
                                    id: "searchEnabledID",
                                    items: [
                                        {
                                            name: "i_status",
                                            checked: true,
                                            inputValue: 0,
                                            boxLabel: "ยังไม่เบิก",
                                        }
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
                                Ext.storeDtl.setBaseParam("mode", "LIST");
                                Ext.storeDtl.setBaseParam("act", "SEARCH");

                                Ext.storeDtl.setBaseParam("c_contract_code", Ext.getCmp("sc_contract_codeID").getValue());
                                Ext.storeDtl.setBaseParam("c_doc_result_ref", Ext.getCmp("sc_doc_result_refID").getValue());
                                Ext.storeDtl.setBaseParam("i_status", Ext.getCmp("searchEnabledID").getValue().inputValue);

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
        menu.add({
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
        menu.add({
            text: "เพิ่มรายการสรุปบิล/รับของ",
            icon: "../images/icons/book_magnify.png",
        })
                .on(
                        "click",
                        (click = function () {

                            var s1 = winResultBilling("add");

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
                        width: 40,
                        renderer: function (value, metaData, record, row, col, store, gridView) {
                            metaData.attr = "style='cursor:pointer; text-align:center;';";
                            return record.get("id");
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
                        header: "สัญญา",
                        sortable: false,
                        align: "left",
                        dataIndex: "c_contract_code",
                        width: 150,
                        renderer: function (value, metaData, record, row, col, store, gridView) {

                            var values;
                            var step = record.get('i_step');
                            var waiting = record.get('i_is_waiting');
                            if (step == 3 && waiting == 1) {
                                metaData.attr = "style='color:red;cursor:pointer; text-align:center;';";
                                values = 'ส่งแก้ไข' + value;
                            } else if (step == 4 && waiting == 0) {
                                metaData.attr = "style='color:blue;cursor:pointer; text-align:center;';";
                                values = 'ส่งแก้ไขแล้ว' + value;
                            } else {
                                values = value;
                            }
                            return values;
                        },
                    }, {
                        header: "งวดที่ของสัญญา/ครั้งที่เบิก",
                        sortable: false,
                        width: 200,
                        align: "left",
                        dataIndex: "c_doc_result_ref",
                        id: "resultID",
                        renderer: function (value, metaData, record, row, col, store, gridView) {
                            metaData.attr = "style='padding:0px 0px 0px 15px;cursor:pointer;';"; //billingTime.png ssssssssss
                            return "<div>" + value + " " + '<img src="../images/icons/billingTime.png"); style="cursor:pointer"/>' + '</div>';
                        },

                    },
                    {
                        header: "สถานะรายการ",
                        sortable: false,
                        align: "left",
                        dataIndex: "c_status", //c_tor_type
                        width: 120,

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
                    }, {
                        header: "ลบ",
                        align: "center",
                        width: 35,
                        dataIndex: "i_status",
                        id: "i_statusDel",
                        renderer: function (value, metaData, record, row, col, store, gridView) {
                            if (record.get("i_status") > 0) {
                                return "";
                            } else {
                                return '<img src="../images/icons/table_delete.png"); style="cursor:pointer"/>';
                            }
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
                            var headerGroup = [{
                                    text: "ตรวจสอบเอกสาร",
                                    icon: "../images/icons/icon_pdf.png",
                                    handler: function (e) {
                                        Ext.buAct = "FlowcartLv1";
                                        var linkDownload = window.location.protocol + '//' + window.location.hostname + '/sp_mn/api/upload/';
                                        if (Ext.isEmpty(Ext.selectRow))
                                            Ext.MessageBox.alert("แจ้งเตือน", "กรุณากดเลือกข้อมูลที่จะแสดง/ออกเลข PR ก่อน");
                                        window.open(linkDownload + Ext.selectRow.get('c_code') + '.pdf', 'Monitoring', 'fullscreen="yes"');
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
                                        }, {
                                            text: "ตรวจสอบเอกสาร",
                                            icon: "../images/icons/icon_pdf.png",
                                            handler: function (e) {
                                                Ext.buAct = "FlowcartLv1";
                                                var linkDownload = window.location.protocol + '//' + window.location.hostname + '/sp_mn/api/upload/';
                                                if (Ext.isEmpty(Ext.selectRow))
                                                    Ext.MessageBox.alert("แจ้งเตือน", "กรุณากดเลือกข้อมูลที่จะแสดง/ออกเลข PR ก่อน");
                                                window.open(linkDownload + Ext.selectRow.get('c_code') + '.pdf', 'Monitoring', 'fullscreen="yes"');
                                            },
                                            scope: this,
                                        }
                                    ];
                            this.contextMenu = new Ext.menu.Menu({
                                items: permissionMenu,
                            });
                        },
                        afterrender: function (g) {

                            this.on("cellclick", cellClick, this); //cellClick
                            this.on("contextmenu", function (e, grid, rowIndex, columnIndex) {
                                        e.stopEvent();
                                        this.contextMenu.showAt(e.getXY());
                            }, this);

                            //Permission Right Change SP_EMP TOR
                            if (Ext.LOGIN_LEVEL_SHOW)
                                this.getColumnModel().removeColumn(2);
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
