/* global Ext, user_right_add, user_right_edit, user_right_delete */

Ext.url_pdf = 'http://localhost/sp_mn/api/mnUploadDoc.php';
Ext.url_process = './api/mnCheckingController.php';
Ext.i_step = 4;
Ext.menu_back = 'ST0013'; //ส่งคืนตรวจสอบเอกสาร
Ext.menu_goto = null; //ส่งคืนตรวจสอบเอกสาร
//hidden
Ext.reversstep = false;
Ext.backstep = true;
Ext.reversstep = false;
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

Ext.AppUx = function (app, menu) {
    Ext.user_right_add = user_right_add;
    Ext.user_right_edit = user_right_edit;
    Ext.user_right_delete = user_right_delete;
    Ext.title = "รายการวางบิลรอส่งเบิก(จัดทำเอกสารส่งเบิก PDF)";
    //Ext.menu_i_entrance;
    Ext.HDR_ID = null;
    Ext.selectRow = [];
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
                url: "tor/api/mnCheckWithdraw.php",
                modal: true,
                params: {
                    mode: "UPDATENEXTSTEP",
                    menuCode: Ext.menu_code,
                    step: Ext.getCmp("modesubID").getValue().inputValue, //GOTOSTEP
                    id: record.get("id"),
                    c_comment: Ext.getCmp("reasonID").getValue()
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
    // copy text in cell on select row no  
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
    function controller(rec, status) {
        if (status === "processUpdate") {
            Ext.Msg.minWidth = 200;
            Ext.Msg.buttonText = {
                ok: "ตกลง",
                cancel: "ยกเลิก",
                yes: "ผ่านรายการ",
                no: "ไม่",
            };
            if (rec.get("i_status_billing") == 2) {
                Ext.Msg.alert("แจ้งเตือน", "ต้องบันทึกลงทะเบียนก่อนผ่านรายการ", function (bu, action) {
                    return false;
                });
            } else {
                winProcess(rec);
            }


        } else if (status === "editEmpTorID") {
            Ext.storeDepartment = new Ext.data.JsonStore({
                storeId: "storeDepartment",
                autoLoad: true,
                url: "api/All.php",
                root: "data",
                baseParams: {type: "storeSpEmp", start: 0, limit: 20, mode: null, dc_department_id: 4}, //Permission i_read
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
            Ext.checkBilling = new Ext.data.JsonStore({
                autoDestroy: false,
                autoLoad: false,
                url: "api/All_spAlert.php",
                baseParams: {type: "checkBilling", i_is_type_tor: true},
                root: "data",
                idProperty: "id",
                fields: ["id", "c_name", "d_post_date", "d_start_date", "d_end_date", "d_billing_date"], //d_post_date d_start_date d_end_date d_billing_date
            });
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
                title: "ยืนยันสรุปเอกสารรอบขอวางบิล",
                iconCls: "icon-application-view-list",
                id: "winEmpTorID",
                modal: true,
                plain: true,
                collapsible: true,
                maximizable: true,
                border: false,
                layout: 'fit',
                width: Ext.getCmp("contenterCenter").getWidth() - 40,
                height: Ext.getCmp("contenterCenter").getHeight() - 40,
                items: [new Ext.FormPanel({
                        id: "frmEditSpEmpID",
                        url: "tor/api/mnCheckBilling.php",
                        defaults: {width: 400, },
                        frame: true,
                        border: false,
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
                                value: "UPDATE_PRE_BILLING",
                                name: "mode",
                            },
                            {
                                fieldLabel: 'รหัสตรวจรับ',
                                name: 'c_checking_code',
                                readOnly: true,
                                value: rec.get('c_code')
                            },
                            {
                                xtype: "buttongroup",
                                fieldLabel: "วันที่รับเอกสาร",
                                frame: false,
                                border: false,
                                items: [
                                    {
                                        xtype: "datefield",
                                        name: "d_preBilling_date",
                                        id: "d_preBilling_dateID",
                                        width: 200,
                                        validator: function (val) {
                                            if (!Ext.isEmpty(val)) {
                                                return true;
                                            } else {
                                                return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                            }
                                        }, listeners: {
                                            afterrender: function () {
                                                this.fnSetParam = function () {
                                                    Ext.checkBilling.setBaseParam("d_preBilling_date", this.getValue().format('Y-m-d'));
                                                    Ext.checkBilling.reload();
                                                    Ext.getCmp('sp_bg_billing_dtl_idID').setValue(null);
                                                    Ext.getCmp('d_billing_dateID').setValue(null);
                                                    Ext.getCmp('sp_bg_billing_dtl_idID').focus();
                                                };
                                            },
                                            change: function () {
                                                this.fnSetParam();

                                            }
                                        }
                                    },
                                    {
                                        xtype: "tbspacer",
                                        width: 18,
                                    },
                                    {
                                        xtype: "label",
                                        style: {
                                            color: "red",
                                            width: "170px",
                                        },
                                        text: "*",
                                    },
                                ],
                            },
                            {
                                xtype: 'datefield',
                                name: 'd_checking_date',
                                width: 200,
                                fieldLabel: 'วันที่ตรวจรับ',
                                readOnly: true,
                            },
                            {

                                xtype: 'datefield',
                                name: 'd_create_date',
                                value: new Date().format("d-m-Y"),
                                width: 200,
                                fieldLabel: 'วันที่ทำรายการ',
                                readOnly: true,

                            },
                            // Ext.PopDepartmentForm.mini,
                            new Ext.form.ComboBox({
                                mode: "local",
                                store: Ext.checkBilling,
                                anchor: "60%",
                                fieldLabel: "รอบการวางบิล",
                                submitValue: true,
                                hiddenName: "sp_bg_billing_dtl_id",
                                name: "sp_bg_billing_dtl_idTxt",
                                id: "sp_bg_billing_dtl_idID",
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
                                            var datax = this.store.data.map[this.value];
                                            if (!Ext.isEmpty(datax)) {
                                                var dBillingDate = new Date(datax.get('d_billing_date')).add(Date.YEAR, 543);
                                                Ext.getCmp('d_billing_dateID').setValue(dBillingDate.format('d-m-Y'));
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
                                readOnly: true,
                                name: "d_billing_date",
                                fieldLabel: "วันที่วางบิล",
                                width: 200,
                                id: "d_billing_dateID",

                            }, {
                                xtype: "textarea",
                                fieldLabel: "หมายเหตุ",
                                width: 400,
                                name: "c_comment",
                            },
                        ],
                    })],
                buttonAlign: "left",
                listeners: {
                    afterrender: function () {

                        if (Ext.selectRow.get('i_status_checking') == 3) {
                            this.buttons[0].hide();
                            this.buttons[1].hide();
                        } else {
                            this.buttons[0].show();
                            this.buttons[1].show();
                        }
                    }
                },
                buttons: [
                    {
                        text: "บันทึกรายการ",
                        id: "buSavePopSubID",
                        iconCls: "icon-save",
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
                                Ext.MessageBox.show({
                                    title: 'ยืนยันการบันทึก',
                                    msg: 'คุณต้องการที่จะบันทึกการวางบิล?',
                                    buttons: Ext.MessageBox.OKCANCEL,
                                    icon: Ext.MessageBox.WARNING,
                                    fn: function (btn) {
                                        if (btn == 'ok') {
                                            formSubmit(form);
                                        } else {
                                            return;
                                        }
                                    }
                                });
                                //formSubmit(form);
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
            wind.getEl().mask("Please wait...", "x-mask-loading");

// Usage!




        }
    } // Controller 

    //AutoLoad
    Ext.storeDtl = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "tor/api/List_SpPreBilling.php",
        baseParams: {
            type: "po_cost_billing",
            appFromAp: Ext.appFromAp,
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
                name: "i_is_upload",
            },
            {
                name: "upload_name",
            },
            {
                name: "i_status_checking",
            },
            {
                name: "sp_bg_billing_dtl_id",
            },
            {
                name: "i_status_billing",
            },
            {
                name: "url_link_doc",
            },
            {
                name: "c_comment",
            },
            {
                name: "d_arrive_date",
            },
            {
                name: "d_doc_arrive_dt",
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
                name: "contract_code",

            },
            {
                name: "bl_code",
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
                name: "c_doc_ref",
            },
            {
                name: "d_arrive_date",
            },
            {
                name: "d_checking_date", //  
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
    Ext.loadStore = function (status, show) {
        if (status === 'edit') {

            new Ext.Window({
                layout: 'form',
                id: "win-frmID",
                width: 800,
                title: "รายการวางบิล",
                bodyStyle: "padding:5px;",
                defauls: {background: "#eee", },
//                collapsible: true,
                maximizable: true,
                items: [{
                        xtype: 'form',
                        bodyStyle: "padding:5px;",
                        url: "../FileUploadServletJson",
                        fileUpload: true,
                        id: 'frm-showID',
                        labelWidth: 180,
                        items: [{
                                xtype: "displayfield",
                                fieldLabel: "เลขสัญญา",
                                readOnly: true,
                                name: "contract_code"
                            }, {
                                xtype: "displayfield",
                                fieldLabel: "รหัสวางบิล",
                                readOnly: true,
                                name: "bl_code"
                            }, {
                                xtype: "displayfield",
                                fieldLabel: "รหัสตรวจรับ",
                                readOnly: true,
                                id: "c_codefID",
                                name: "c_code"
                            }, {
                                xtype: "displayfield",
                                fieldLabel: "เลขใบวางบิลจากลูกค้า",
                                readOnly: true,
                                name: "c_doc_ref"
//                            }, {
//                                xtype: "displayfield",
//                                fieldLabel: "รายการ", readOnly: true,
//                                width: 500,
//                                name: "c_name"
                            }, {
                                xtype: "displayfield",
                                fieldLabel: "ผู้ขาย/รับจ้าง", readOnly: true,
                                width: 500,
                                name: "dc_creditor_name"
//                            }, {
//                                xtype: "displayfield", readOnly: true,
//                                fieldLabel: "ที่อยู่",
//                                width: 500,
                            }, {
                                xtype: "hidden",
                                name: "dir",
                                id: "dirID",
                                value: "D:\\ExportFile\\"
                            }, {
                                xtype: "fileuploadfield",
                                id: "upload_pdf1",
                                allowBlank: false,
                                width: 300,
                                emptyText: "เลือกไฟล์ (.pdf)",
                                fieldLabel: "เอกสารประกอบ (PDF)",
                                name: "file",
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
                                xtype: 'fieldset',
                                title: 'รายละเอียดเอกสาร',
                                id: "fileuploadID",
                                hidden: true,
//                                hidden: (rec.data.dc_tax_customer_id == 0) ? false : true,
//                                collapsible: true,
//                                autoHeight: true,
                                height: Ext.getCmp("contenterCenter").getHeight() - 260,
                                html: '<iframe id="ifpdfID" src="' + window.location.protocol + '//' + window.location.hostname + '/sp_mn/api/upload_ap/' + Ext.selectRow.get('upload_name') + '?T=Tap_' + Math.floor(Math.random() * 100) + '" frameborder="0" width="100%" height="100%"></iframe>',

                            }],
                        listeners: {
                            beforerender: function () {
                                Ext.updateStatu = function (name, id) {

                                    Ext.Ajax.request({
                                        url: "tor/api/mnUpdateController.php",
                                        method: "POST",
                                        params: {mode: "EDIT", fldUpName: name, fldName: "i_is_upload", fldVal: 1, tblName: "sp_check_period_hdr", keyName: "sp_check_period_hdr_id", idVal: id},
                                        success: function (result, request) {
                                            if (request.success) {
                                                Ext.MessageBox.alert("Success", "<span style='white-space: nowrap;'>บันทีกเรียบร้อย</span>", function () {
                                                    Ext.storeDtl.reload({
                                                        callback: function (record, operation, success) {
                                                            if (success) {
                                                                //close or showv
                                                                Ext.each(record || {}, function (rec) {
                                                                    if (id == rec.get('id')) {
                                                                        Ext.selectRow = rec;
                                                                    }
                                                                });
                                                                Ext.MessageBox.hide();
                                                                Ext.getCmp("win-frmID").destroy();
                                                                Ext.formPanelMain();
                                                            }
                                                        }
                                                    });
                                                });
                                            }
                                        },
                                        failure: function (result, request) {
                                            Ext.MessageBox.alert("Failed", result.responseText);
                                        },
                                    });

                                };
                            },
                            afterrender: function () {
                                if (["", null, undefined].includes(Ext.selectRow.get('upload_name'))) {
                                    Ext.getCmp('fileuploadID').hide();
                                } else {
                                    Ext.getCmp('fileuploadID').show();
                                }
                                Ext.getCmp('frm-showID').getForm().loadRecord(Ext.selectRow);
                            }
                        }
                    }],
                buttonAlign: 'left',
                buttons: [{

                        text: "upload เอกสาร",
                        id: "uploadID",
                        hidden: (Ext.appFromAp ? true : false),
                        icon: "../images/icons/folder_up.png",

                        handler: function () {


//                            Error id ไม่ตรงกัน
                            if (Ext.isEmpty(Ext.getCmp("upload_pdf1").getValue())) {
                                Ext.MessageBox.alert("Failed", "<span style='white-space: nowrap;'>กรุณกรอกข้อมูลให้ถูกต้อง</span>");
                                return false;
                            }
                            const myForm = document.getElementById('ext-gen69');  // Our HTML form's ID
                            const myFile = document.getElementById('upload_pdf1-file');  // Our HTML files' ID 
//                            console.log(myFile);
//                            return false;
                            myForm.onsubmit = function () {
                                const dir = "D:\\php_supplies\\api\\upload_ap\\";
                                const files = myFile.files;
                                const formData = new FormData();
                                const file = files[0];
                                const str = Ext.getCmp("c_codefID").getValue();  
                                let mainPart = str;
                                let suffix = ""; 
                                if (str.includes("/")) {
                                  const parts = str.split("/");
                                  mainPart = parts[0].substring(0, 12); // ดึงแค่ 12 ตัว
                                  suffix = parts[1]; // ดึงค่าหลัง /
                                } else {
                                  mainPart = str.substring(0, 12); // ดึงแค่ 12 ตัว
                                } 
                                const result = mainPart + suffix; 
                                const fileNameDoc = result + ".pdf";     
                                
                                if (file.type !== "application/pdf") {
                                    console.log(file);
                                    Ext.MessageBox.alert("Failed", "<span style='white-space: nowrap;'>กรุณกรอกข้อมูลให้ถูกต้อง .PDF เท่านั้น </span>");
                                    return false;
                                }
//                                console.log(file.name);
//                                console.log(fileNameDoc);
//                                return false;
//
                                // Add the file to the AJAX request
                                formData.append('file', file, fileNameDoc);
//                                formData.append('file', file, file.name);
                                formData.append('dir', dir);
//                                formData.append('c_code_inv', fileNameDoc);
                                const xhr = new XMLHttpRequest();
                                xhr.open('POST', '../FileUploadServletJson', true);
                                Ext.MessageBox.show({
                                    title: 'โปรแกรมทำงานอยู่',
                                    msg: 'กำลังประมวลผล กรุณารอสักครู่...',
                                    id: 'progressBarID',
                                    progress: true,
                                    width: 400,
                                    closable: false,
                                    wait: true, // ทำให้ MessageBox แสดงเป็นโหมดรอ (มี ProgressBar เคลื่อนไหว)
                                    waitConfig: {interval: 500}, // ตั้งค่าความเร็วในการอัปเดต ProgressBar
                                    icon: Ext.MessageBox.INFO, // แสดงไอคอนข้อมูล
                                    animateTarget: 'progresElID'
                                });
                                xhr.onload = function () {
                                    var jsonData = Ext.util.JSON.decode(xhr.response); //decode json
                                    if (xhr.status == 200) { 
                                        Ext.updateStatu(fileNameDoc, Ext.selectRow.get('id'));
                                    } else {
                                        alert('Upload error. Try again.');
                                    }
                                };
                                xhr.send(formData);
                            }; //End onsubmit
                            if (Ext.selectRow.get('i_is_upload')) {
                                Ext.Msg.show({
                                    title: "แจ้งเตือน!",
                                    msg: "<span style='white-space: nowrap;'>เอกสารได้เคยอัพโหลดแล้ว คุณต้องการที่จะอัพโหลดทับไฟล์เดิม ?</span>",
                                    width: 400,
                                    buttons: Ext.MessageBox.YESNO,
                                    fn: function (btn, text) {
                                        if (btn === "yes")
                                            myForm.onsubmit();
                                        else
                                            null;
                                    },
                                    icon: Ext.MessageBox.WARNING,
                                });
                            } else {
                                Ext.Msg.show({
                                    title: "ยืนยัน!",
                                    msg: "<span style='white-space: nowrap;'>เอกสารได้เคยอัพโหลดเอกสารส่งเบิก  ?</span>",
                                    width: 400,
                                    buttons: Ext.MessageBox.YESNO,
                                    fn: function (btn, text) {
                                        if (btn === "yes")
                                            myForm.onsubmit();
                                        else
                                            null;
                                    },
                                    icon: Ext.MessageBox.INFO,
                                });
                            }


                        }

                    },
                      {
                          text: "ปิด",
                          icon: "../images/icons/bullet_cross.png",
                          handler: function () {
                              Ext.getCmp("win-frmID").destroy();
                          }
                      }],

            }).show();
        }
    };
    function submitSearch(act) {

        Ext.storeDtl.setBaseParam("act", "SEARCH");
        if (act == "reset") {
            Ext.getCmp("c_codeID").setValue("");
            Ext.getCmp("c_arrive_codeID").setValue("");
            Ext.getCmp("c_doc_refID").setValue("");
            Ext.getCmp("f_contract_amtID").setValue("");
            //dc_creditor_id
            Ext.getCmp("dc_creditor_idID").setValue(null);
            Ext.getCmp("dc_creditor_idID_Name").setValue("");

        } else {
            Ext.storeDtl.setBaseParam("c_code", Ext.getCmp("c_codeID").getValue());
            Ext.storeDtl.setBaseParam("c_arrive_code", Ext.getCmp("c_arrive_codeID").getValue());
            Ext.storeDtl.setBaseParam("c_doc_ref", Ext.getCmp("c_doc_refID").getValue());
            Ext.storeDtl.setBaseParam("f_contract_amt", Ext.getCmp("f_contract_amtID").getValue());
            Ext.storeDtl.setBaseParam("dc_creditor_id", Ext.getCmp("dc_creditor_idID").getValue());
            Ext.storeDtl.load();
        }

    }
    Ext.SearchFrm = function () {

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


        return new Ext.Window({
            title: "ค้นหารายการ",
            width: 500,
            id: "winSearchFrm",
            height: 300,
            layout: "fit",
            x: (100 + 10),
            y: (100 + 10),
            buttonAlign: "left",
            items: [
                {
                    layout: "column",
                    border: false,
                    defauls: {background: "#eee", },
                    items: [
                        {
                            columnWidth: 0.8,
                            layout: "form",
                            border: false,
                            bodyStyle: "padding:5px",
                            id: "frm-serachID",
                            items: [
                                {
                                    xtype: "textfield",
                                    fieldLabel: "เลขที่สัญญา",
                                    id: "c_codeID",
                                    name: "c_code",
                                    enableKeyEvents: true,
                                    listeners: {
                                        keypress: function (field, e) {
                                            if (e.getKey() === e.ENTER) {
                                                submitSearch();
                                            }
                                        }
                                    }
                                },
                                {
                                    xtype: "textfield",
                                    fieldLabel: "เลขที่รับของ",
                                    id: "c_arrive_codeID",
                                    name: "c_arrive_code",
                                    enableKeyEvents: true,
                                    listeners: {
                                        keypress: function (field, e) {
                                            if (e.getKey() === e.ENTER) {
                                                submitSearch();
                                            }
                                        }
                                    }
                                },
                                {
                                    xtype: "textfield",
                                    fieldLabel: "เลขที่ตรวจรับ",
                                    id: "c_doc_refID",
                                    name: "c_doc_ref",
                                    enableKeyEvents: true,
                                    listeners: {
                                        keypress: function (field, e) {
                                            if (e.getKey() === e.ENTER) {
                                                submitSearch();
                                            }
                                        }
                                    }
                                },
                                {
                                    xtype: "textfield",
                                    fieldLabel: "เงินของสัญญา",
                                    id: "f_contract_amtID",
                                    name: "f_contract_amt",
                                    enableKeyEvents: true,
                                    listeners: {
                                        keypress: function (field, e) {
                                            if (e.getKey() === e.ENTER) {
                                                submitSearch();
                                            }
                                        }
                                    }
                                },
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

        tb.doLayout();
        return Ext.leftSearch(tb,'',{
            xtype:'button',
            text: "คู่มือการใช้งาน",
            icon: "../images/icons/page_white_powerpoint.png",
            handler:function(){
                alert(3);
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
                  header: "รหัส",
                  sortable: false,
                  align: "left",
                  dataIndex: "id",
                  hidden: true, // icon: "../images/icons/application_view_tile.png"

//              },
//              {
//                  header: "สถานะรายการ",
//                  sortable: false,
//                  align: "center",
//                  dataIndex: "id",
////                  id: "processDueID",
//                  width: 140,
//                  renderer: function (value, metaData, record, row, col, store, gridView) {
//
//                      var BtnText, IconImg;
//                      if (record.get("i_status_billing") == 5) {
//                          BtnText = '&nbsp;' + record.get('bl_code');
//                          IconImg = '../images/icons/cog_edit.png';
//                      } else if (record.get("bl_code") != '' && record.get("i_status_billing") == 6) {
//                          BtnText = '&nbsp;' + record.get('bl_code');
//                          IconImg = '../images/icons/accept.png';
//                      } else {
//                          BtnText = '&nbsp;' + record.get('bl_code');
//                          IconImg = '../images/icons/cog_add.png';
//                      }
//                      var style = 'font-size:12px;border:1px solid #ccc; width:119px; padding:3px 3px 3px 15px; background: #f0f0f0 url(' + IconImg + ') no-repeat 3px center; cursor: pointer;';
//
//                      return '<button style="' + style + '" type="button">' + BtnText + '</button>';
//                  }
              },
              {
                  header: "เอกสารส่งเบิก",
                  sortable: false,
                  width: 218,
                  align: "center",
                  id: "openPDFID",
                  dataIndex: "contract_code",
                  renderer: function (value, metaData, record, row, col, store, gridView) {
                      var txt = ' ' + value;
                      var style = ' text-align: left; color:gray;font-size:12px;border:1px solid #ccc; width:210px; padding:3px 3px 3px 25px; background: #f0f0f0 url(../images/icons/icon_pdf.png) no-repeat 3px center;';

                      if (record.get("i_is_upload") == 1) {
                          txt = 'เปิดดูเอกสาร ' + value;
//                          cl = "onclick='Ext.openPDF(" + record + ");'";
                          style = ' text-align: left; font-size:12px;border:1px solid #ccc; width:210px; padding:3px 3px 3px 25px; background: #f0f0f0 url(../images/icons/icon_pdf.png) no-repeat 3px center; cursor: pointer;';

                      }

                      return '<button style="' + style + '" type="button">' + txt + '</button>';
                  }
              },
              {
                  header: "สถานะรายการ",
                  sortable: false,
                  width: 100,
                  align: "center",
                  dataIndex: "c_code",
                  renderer: function (value, metaData, record, row, col, store, gridView) {
                      metaData.attr = "style='font-weight:bold; text-align:center;';";
                      return Ext.StatusMsgTxt[0][record.get("i_status_billing")];
                  }

              },
              {
                  header: "วันที่เอกสารสมบูรณ์",
                  sortable: false,
                  align: "center",
                  dataIndex: "d_doc_arrive_dt",
              },
              {
                  header: "วันที่ตรวจรับ",
                  sortable: false,
                  align: "center",
                  dataIndex: "d_checking_date",
              },
              {
                  header: "วันที่วางบิล",
                  sortable: false,
                  align: "center",
                  dataIndex: "d_reg_billing_date",
//
//                    },
//                    {
//                        header: "วันที่วางบิล",
//                        sortable: false,
//                        align: "center",
//                        dataIndex: "d_post_billing_date",
              },
              {
                  header: "ผู้ขาย/รับจ้าง",
                  sortable: false,
                  align: "left",
                  dataIndex: "dc_creditor_name", //c_tor_type
                  width: 120

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

                  rowclick: function (grid, rowIndex, e) {
                      var record = grid.getStore().getAt(rowIndex);
                      Ext.selectObj(record);
                  },
                  dblclick: function () {
                      Ext.formPanelMain(Ext.selectObj());
                  },
                  cellclick: function (grid, rowIndex, columnIndex, e) {
                      var record = grid.getStore().getAt(rowIndex);
                      if (columnIndex === grid.getColumnModel().getIndexById("openPDFID")) {
                          Ext.openPDF(record);
                      }
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

                      Ext.contextMenu(); //torUiBilling
                      Ext.hotKeyGrid(); //torUiBilling
                      Ext.formPanelMain = function () {
                          if (Ext.isEmpty(Ext.getCmp("win-frmID"))) {
                              Ext.buAct = "update";
                              Ext.loadStore("edit", true); // app,data.load
                          }
                      };
                      Ext.selectObj = function (rs) {

                          return Ext.selectRow = Ext.selectRow ? Ext.selectRow : rs;

                      };

                      this.on("cellclick", cellClick, this); //cellClick
                      this.on("contextmenu", function (e, grid, rowIndex, columnIndex) {
                          e.stopEvent();
                          Ext.contextMenu.showAt(e.getXY());
                      }, this);
                  },
                  afterrender: function (g) {
                      //Permission Right Change SP_EMP TOR
                      if (Ext.LOGIN_LEVEL_SHOW)
                          this.getColumnModel().removeColumn(2);
                  },
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
      }),
//      Ext.grid.GridPanel,
      Ext.grid.EditorGridPanel,
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
