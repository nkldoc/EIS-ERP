/* global Ext, user_right_add, user_right_edit, user_right_delete */

Ext.url_pdf = 'https://eis.nmu.ac.th/sp_mn/api/mnUploadDoc.php';
Ext.url_process = './api/mnCheckingController.php';
Ext.i_step = 4;
Ext.menu_back = 'ST0013'; //ส่งคืนตรวจสอบเอกสาร
Ext.menu_goto = null; //ส่งคืนตรวจสอบเอกสาร
//hidden
Ext.reversstep = false;
Ext.backstep = true;
Ext.reversstep = false;
// console.log()
Ext.menu_arr = [
    ['ส่งมอบงาน', 'ST0012', 1],
    ['ตรวจรับพัสดุ/ครุภัณฑ์', 'ST0013', 2],
    ['การมอบหมายผู้ปฏิบัติงาน', 'ST0114', 3],
    ['บันทึกใบขอเบิก', 'ST0115', 4],
    ['บันทึกเลขครุภัณฑ์', 'ST0116', 5]
];
function winProcess(rec) {
    console.log(Ext.selectRow.get('i_status_billing'));
    if (rec.get('sp_bg_billing_dtl_id') == 0) //ตรวจสอบการบันทึกวางบิล
        alert('ยังไม่มีการบันทึกรอบวางบิล');
    else
        new Ext.Window({
            id: "win-processID",
            title: "ผ่านรายการ สรุปขอวางบิล",
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
                    value: "<b style='font-size:16px;'> " + (Ext.selectRow.get('bl_code') === '' ? rec.get("c_code") : rec.get("bl_code")) + " ?</b>",
                }, {
                    xtype: 'hidden',
                    name: 'sp_tor_hdr_period_id',
                    id: 'sp_tor_hdr_period_idID',
                    value: rec.get("id"),
                },
                {
                    xtype: "datefield",
                    id: "d_doc_dateSubID",
                    fieldLabel: "วันที่รายการ",
                    value: new Date().format('d-m-Y'),
                    readOnly: true
                }

            ],
            listeners: {
                afterrender: function () {

                    if (Ext.selectRow.get('i_status_billing') == 4) {
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
                    text: "อัพเดทผ่านสถานะรายการ",
                    iconCls: "icon-save",
                    handler: function () {
                        formSubmit = function () {
                            console.log(Ext.session.Notif_line);
                            // return false;
                            Ext.Ajax.request({
                                url: "tor/api/mnCheckBilling.php",
                                modal: true,
                                params: {
                                    mode: (Ext.selectRow.get('bl_code') === '' ? "GENCODEBILLING" : "GOTO_WITHDRAW4"), //GOTO_WAIT_BILLING
                                    d_doc_date: Ext.getCmp("d_doc_dateSubID").getValue().format("Y-m-d"),
                                    sp_check_period_hdr_id: Ext.selectRow.get('id'),
                                    sp_bg_billing_dtl_id: Ext.selectRow.get('sp_bg_billing_dtl_id')
                                },
                                method: "POST", //GET
                                success: function (result, request) {
                                    var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                                    if (jsonData.success) {
                                        if (Ext.selectRow.get('bl_code') != ''){
                                            Ext.receiveJson2 = function (obj,id) {
                                                let Date_now = new Date();
                                                let jsonApplay = Ext.apply(obj, { client_datetime: Date_now.format('Y-m-d H:i:s'), 
                                                    user_sent_id: Ext.session.user_id ,
                                                    user_id:  Ext.selectRow.get("dc_user_creat_id"),
                                                    user_sent_name: Ext.session.user_name, 
                                                    c_menu:'checking', 
                                                    i_status:1 
                                                                    });
                                                Ext.Ajax.request({
                                                    url: "../php-notic/insertLoger.php",
                                                    method: "POST",
                                                    params: jsonApplay,
                                                    success: function (response) {
                                                    }
                                                });
                                            };
                                            textSent = Ext.selectRow.get("c_doc_ref");
                                                // var wsUri = "ws://" + window.parent.Ext.ipServer + ":9000/demo/server.php";
                                                // websocket = new WebSocket(wsUri);
                                                // websocket.onopen = function (ev) { // connection is open   
                                                //     var msg = {
                                                //         message: " เลขที่วางบิล: " + textSent  + " เลขที่วางบิล : "  + Ext.selectRow.get('bl_code') ,
                                                //         name: Ext.selectRow.get("dc_user_creat_id"),
                                                //         sent_name: Ext.session.user_name,
                                                //         color: '#007AFF'
                                                //     };
                                                //     websocket.send(JSON.stringify(msg));
                                                // };
                                                // var obj = {
                                                //     "type": "usermsg",
                                                //     "name": Ext.selectRow.get("dc_user_creat_id"),
                                                //     "sent_name": Ext.session.user_name,
                                                //     "message": "บันทึกการวางบิลเรียบร้อย" +  textSent,
                                                //     "color": "#007AFF"
                                                // };
                                                // Ext.receiveJson2(obj,id);
                                            if (location.host != 'localhost:8080') {
                                                var alert_text = "มีการผ่านรายการวางบิล : "+ textSent  +   "\n" ;
                                                alert_text += "เวลา : " + new Date().toLocaleString('en-ZA') + "\n";
                                                alert_text += "สถานะ :  บันทึกการวางบิลเรียบร้อย  \n";
                                                alert_text += "ผู้ขายผู้รับจ้าง : " +Ext.selectRow.get("dc_creditor_name") +"\n";
                                                alert_text += "ชื่อรายการ : " +Ext.selectRow.get("c_name") +"\n";
                                                alert_text += "เลชที่ตรวจรับในระบบ : " +Ext.selectRow.get("c_code") +"\n";
                                                alert_text += "จำนวนเงิน : " +Ext.selectRow.get("f_total_amt") +"\n";
                                                alert_text += "เลขที่วางบิลในระบบ : " +Ext.selectRow.get("bl_code") +"\n";
                                                alert_text += " ชื่อผู้ทำรายการ : " + Ext.session.user_name + "\n";
                                                    Ext.Ajax.request({
                                                        url: Ext.session.Notif_line, 
                                                        //"http://" + location.hostname + ":8080/supplies/lib/lineNotif/send_line_dev.php",
                                                        method: "POST",
                                                        params: {
                                                            msg: alert_text,
                                                            mode : 1
                                                        },
                                                    });
                                            }
                                        }
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
                        };
                        Ext.MessageBox.show({
                            title: 'ยืนยันการบันทึก',
                            msg: 'คุณต้องการที่จะผ่านรายการไปวางบิล ?',
                            buttons: Ext.MessageBox.OKCANCEL,
                            icon: Ext.MessageBox.WARNING,
                            fn: function (btn) {
                                if (btn == 'ok') {
                                    formSubmit();
                                } else {
                                    return;
                                }
                            }
                        });
                    }
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
    Ext.tor_type_idTxt = Ext.apply({tor_type_id1: {0: "แบบมีหัวงาน/ฝ่าย พิจารณาผล(ไม่เกิน 5 แสนบาท)", 1: "แบบมีคณะกรรมการ พิจารณาผล(เกิน 5 แสนแสนบาท)"}});
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


        if (rec.get('d_doc_arrive_dt') == '') {
            Ext.Msg.alert("แจ้งเตือน",'ยังไม่ได้ระบุวันที่ส่งของโดยสมบูรณ์ กรุณาติดต่อแอดมิน');
            return false;
        } else if (status === "processUpdate") {
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
                    }
                }
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
                                fieldLabel: "วันที่เอกสารส่งของสมบูรณ์",
                                frame: false,
                                border: false,
                                items: [
                                    {
                                        xtype: "datefield",
                                        name: "d_doc_arrive_dt",
                                        id: "d_doc_arrive_dtID",
                                        readOnly: true,
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
                                                    Ext.getCmp('winEmpTorID').setStoreItm();
                                                };
//                                                this.fnSetParam();

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
                                        text: "* กรณีส่งเอกสารส่งของล้าช้า",
//                                    }, {
//                                        xtype: 'checkbox', 
//                                        name: 'sport',
//                                        checked: false,
//                                        inputValue: 1,
//                                        listeners: {
//                                            afterrender: function () {
//                                                this.fnSetRead = function (checkbox, isChecked) {
//                                                    if (isChecked) {
//                                                        Ext.getCmp('d_doc_arrive_dtID').setReadOnly(false);
//                                                    } else {
//                                                        Ext.getCmp('d_doc_arrive_dtID').setReadOnly(true);
//                                                    }
//                                                    Ext.getCmp('d_doc_arrive_dtID').focus(); 
//                                                };
//                                                this.fnSetRead(Ext.getCmp('d_doc_arrive_dtID'), Ext.getCmp('d_doc_arrive_dtID').checked);
//                                            },
//                                            check: function (checkbox, isChecked) {
//                                                this.fnSetRead(checkbox, isChecked);
//                                            }
//                                        }
                                    }
                                ]
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
                                id: 'd_create_dateID',
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
                                validator: function (val) {
                                    if (!Ext.isEmpty(val)) {
                                        return true;
                                    } else {
                                        return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                    }
                                }
                            }, { 
    xtype: 'compositefield',
    fieldLabel: 'เลขเอกสาร/วางบิล',
    anchor: '50%', // ช่วยให้ CompositeField ขยายเต็มความกว้างฟอร์ม
    items: [
        {
            xtype: 'textfield',
            name: 'c_doc_ref',
            flex: 1,
//            value: rec && rec.data ? rec.data.c_checking_code || '' : '',
            readOnly: false,
            style: { background: '#EEEEEE', 'font-weight': 'bold', color: 'black' }
        },
        {
            xtype: 'button',
            text: 'บันทึก', // เปลี่ยนจาก 'ตรวจสอบ' เป็น 'บันทึก'
            width: 80,
//            hidden:true,
            iconCls: 'icon-save', // (ถ้ามี) ใส่เพื่อให้มีไอคอนสวยงามขึ้น
        handler: function() {
                // ตัวอย่าง Logic การดึงค่าจากช่อง Textfield ข้างๆ มาใช้งาน
                var codeValue = this.previousSibling().getValue();
                
                if(!codeValue) {
                    Ext.Msg.alert('แจ้งเตือน', 'กรุณากรอกเลขที่ตรวจรับก่อนบันทึก');
                    return;
                }
 
                Ext.Msg.confirm('ยืนยัน', 'คุณต้องการบันทึกข้อมูลนี้ใช่หรือไม่?', function(btn) {
                    if (btn == 'yes') {
//                            updateModifyDate();
                        Ext.Ajax.request({
                            url: "tor/api/mnCheckingController.php",
                            method: 'POST',
                            params: {
                                mode: 'updateBillingDocRef',
                                c_doc_ref:codeValue,
                                sp_tor_id: Ext.selectRow.get('sp_tor_id'),
                                sp_tor_contract_id: Ext.selectRow.get('sp_tor_contract_id'),
                                sp_check_period_hdr_id: Ext.selectRow.get('sp_check_period_hdr_id'),
                                sp_tor_hdr_period_id: Ext.selectRow.get('sp_tor_hdr_period_id'),
                                sp_tor_hdr_period_ids: JSON.stringify([Ext.selectRow.get('sp_tor_hdr_period_id')]),
                                c_doc_refs: JSON.stringify(codeValue)
                            },
                            success: function(response) {
                                try {
                                    var result = Ext.decode(response.responseText);
                                    if (result.success === 'Success' || result.reval === 0) {
                                        Ext.Msg.alert('สำเร็จ', result.msg || 'อัพเดทเลขเอกสาร/วางบิลเรียบร้อยแล้ว', function() {
                                            // update the local record so reopening the form keeps the value
//                                            if (rec && rec.set) {
//                                                rec.set('i_pr_type1', codeValue); 
//                                            }
                       
//                                            updateModifyDate('วันที่วางบิล');
                                           if(Ext.storeDtl) {
                                                Ext.storeDtl.reload();
                                            }
                                        });
                                    } else {
                                        Ext.Msg.alert('ข้อผิดพลาด', result.msg || 'เกิดข้อผิดพลาดในการอัพเดท');
                                    }
                                } catch (e) {
                                    console.error('Parse error:', e);
                                    console.error('Response:', response.responseText);
                                    Ext.Msg.alert('สำเร็จ', 'บันทึกข้อมูลเรียบร้อยแล้ว (ตอบกลับมี: ' + response.responseText + ')');
                                }
                            },
                            failure: function(response) {
                                Ext.Msg.alert('ข้อผิดพลาด', 'ไม่สามารถติดต่อ Server');
                                console.error('Update failed:', response);
                            }
                        });
                    }
                });
            }
        }
    ]
}    /*{
                                xtype: "textfield",
                                fieldLabel: "เลขเอกสาร",
                                width: 200,
                                name: "c_doc_ref",
                                id: 'c_doc_refID',
                                validator: function (val) {
                                    if (!Ext.isEmpty(val)) {
                                        return true;
                                    } else {
                                        return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                    }
                                }
                            }*/, {
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

                        if (Ext.selectRow.get('i_status_billing') == 4) {
                            this.buttons[0].hide();
                            this.buttons[1].hide();
                        } else {
                            this.buttons[0].show();
                            this.buttons[1].show();
                        }

                        Ext.selectRow.set('d_preBilling_date', Ext.selectRow.get('d_reg_billing_date'));
                        Ext.selectRow.set('d_billing_date', Ext.selectRow.get('d_post_billing_date'));
                        Ext.getCmp("frmEditSpEmpID").getForm().loadRecord(Ext.selectRow);
                        this.setStoreItm = function () {
                            Ext.checkBilling.setBaseParam("d_doc_arrive_dt", Ext.getCmp('d_doc_arrive_dtID').getValue().format('Y-m-d'));
                            Ext.getCmp('winEmpTorID').getEl().mask("Please wait...", "x-mask-loading");
                            Ext.checkBilling.load({
                                callback: function (record, operation, success) {
                                    if (success) {
                                        if (!Ext.isEmpty(record)) {
                                            Ext.getCmp('sp_bg_billing_dtl_idID').setValue(record[0].get('id'));
                                            var dBillingDate = new Date(record[0].get('d_billing_date')).add(Date.YEAR, 543);
                                            Ext.getCmp('d_billing_dateID').setValue(dBillingDate.format('d-m-Y'));
                                        } else {
                                            Ext.getCmp('sp_bg_billing_dtl_idID').setValue(0);
                                            Ext.getCmp('d_billing_dateID').setValue(null);
                                        }
                                        Ext.sleep(2000).then(() => {
                                            Ext.getCmp('sp_bg_billing_dtl_idID').focus();
                                            Ext.getCmp('winEmpTorID').getEl().unmask();
                                        });
                                    }
                                }
                            });
                        };
                        this.setStoreItm();
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
        }
    } // Controller 
    //AutoLoad
    Ext.storeDtl = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "tor/api/List_SpPreBilling.php",
        baseParams: {
            type: "po_working_dtl",
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
                name: "sp_tor_hdr_period_id",
            },
            {
                name: "sp_check_period_hdr_id",
            },
            {
                name: "sp_tor_contract_id",
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
                name: "i_status_billing",
            },
            {
                name: "i_period",
            },
            {
                name: "url_link_doc",
            },
            {
                name: "f_vat_amt",
            },
            {
                name: "f_total_add_vat_amt",
            },
            {
                name: "f_total_amt",
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
                name: "c_name",

            },
            {
                name: "bl_code",
            },
            {
                name: "contract_code",
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
                name: "c_doc_ref", //   
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
                name: "dc_user_creat_id",
            },
            {
                name: "dc_user_creat_name",
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
        data: Ext.yearTh()
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
        Ext.storeCreditor = new Ext.data.JsonStore({
            autoLoad: true,
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
        var PopCreditorForm = new Ext.ux.Poplov({
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
//                                                alert(record.data.dc_creditor_id);
                if (record.data.dc_creditor_id === 0) {
                    Ext.getCmp("dc_creditor_idID").setValue(null);
                    Ext.getCmp(nameID).setValue(null);
                } else {
                    Ext.getCmp("dc_creditor_idID").setValue(record.data.dc_creditor_id);
                    Ext.getCmp(nameID).setValue(TextShow);
                }

                Ext.getCmp("win-pop-lov" + id).hide();
                Ext.getCmp("win-pop-lov" + id).destroy();
            }
        });
        return new Ext.Window({
            id: 'frm-searchID',
            title: "ค้นหารายการ PR",
            width: 800,
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
                                PopCreditorForm.mini,
                                {
                                    xtype: "datefield",
                                    fieldLabel: "เริ่มวันที่ตรวจรับ",
                                    id: "s_checking_dateID",
                                    name: "s_checking_date",
                                },
                                {
                                    xtype: "datefield",
                                    fieldLabel: "ถึงวันที่ตรวจรับ",
                                    id: "e_checking_dateID",
                                    name: "e_checking_date",
                                },

                                {
                                    xtype: "textfield",
                                    fieldLabel: "เลขที่วางบิล",
                                    id: "c_billingID",
                                    name: "c_billing",
                                },
                                {
                                    xtype: "textfield",
                                    fieldLabel: "เลขที่ตรวจรับ",
                                    id: "c_checkingID",
                                    name: "checking",
                                },
   
                            ], listeners: {
                                beforerender: function () {

                                },
                                afterrender: function () {
                                    var today = new Date();
                                    var lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                                    Ext.getCmp('s_checking_dateID').setValue(new Date().format("d-m-Y"));
                                    Ext.getCmp('e_checking_dateID').setValue(lastDayOfMonth.format("d-m-Y"));
                                }
                            },
                        },
                        {
                            columnWidth: 0.5,
                            layout: "form",
                            border: false,
                            items: [
                                {
                                    xtype: "textfield",
                                    fieldLabel: "เรื่อง",
                                    id: "sc_nameID",
                                    name: "c_name",
                                },
                                {
                                    xtype: "textfield",
                                    fieldLabel: "เลขที่สัญญา",
                                    id: "c_codeID",
                                    name: "c_code",
                                },
                                // new Ext.form.ComboBox({
                                //     mode: "local",
                                //     store: new Ext.data.JsonStore({
                                //         autoDestroy: false,
                                //         autoLoad: false,
                                //         url: "api/All_spAlert.php",
                                //         baseParams: {type: "sp_type_status", i_is_type_tor: true, all: "all"},
                                //         root: "data",
                                //         idProperty: "id",
                                //         fields: ["id", "c_name"],
                                //     }),
                                //     anchor: "100%",
                                //     fieldLabel: "วิธีดำเนินงาน",
                                //     submitValue: true,
                                //     hiddenName: "stor_type_id",
                                //     name: "sc_type_id",
                                //     id: "stor_type_idID",
                                //     valueField: "id",
                                //     displayField: "c_name",
                                //     triggerAction: "all",
                                //     forceSelection: false,
                                //     selectOnFocus: true,
                                //     typeAhead: false,
                                //     emptyText: "กรุณาเลือก",
                                //     listeners: {
                                //         afterrender: function () {
                                //             //setLoad&&callback
                                //             this.store.load({
                                //                 callback: function (record, operation, success) {
                                //                     if (success) {
                                //                         Ext.getCmp("stor_type_idID").setValue(this.data.items[0].get("c_name"));
                                //                     }
                                //                 },
                                //             });
                                //         },
                                //     },
                                // }),
                                {
                                    xtype: "radiogroup",
                                    columns: [220],
                                    fieldLabel: "ประกันของ",
                                    id: "i_status_checkingID",
                                    style: {"font-weight": "bold"},
                                    items: [
                                        {
                                            name: "i_status_checking",
                                            inputValue: 1,
                                            checked: true,
                                            boxLabel: "รายการรอสรุปวางบิล"
                                        }, {
                                            name: "i_status_checking",
                                            inputValue: 2,
                                            boxLabel: "รายการส่งวางบิล"
                                        },{
                                            name: "i_status_checking",
                                            inputValue: 3,
                                            boxLabel: "รายการวางบิลเดือนที่แล้ว"
                                        }
                                    ]
                                }
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
                                Ext.storeDtl.setBaseParam("s_checking_date", Ext.getCmp("s_checking_dateID").getValue().format("Y-m-d"));
                                Ext.storeDtl.setBaseParam("e_checking_date", Ext.getCmp("e_checking_dateID").getValue().format("Y-m-d"));
                                Ext.storeDtl.setBaseParam("dc_creditor_id", Ext.getCmp("dc_creditor_idID").getValue());
                                Ext.storeDtl.setBaseParam("i_status_checking", Ext.getCmp("i_status_checkingID").getValue().inputValue);
                                Ext.storeDtl.setBaseParam("c_name", Ext.getCmp("sc_nameID").getValue());
                                Ext.storeDtl.setBaseParam("c_billing", Ext.getCmp("c_billingID").getValue());
                                Ext.storeDtl.setBaseParam("c_checking", Ext.getCmp("c_checkingID").getValue());
                                Ext.storeDtl.setBaseParam("c_code", Ext.getCmp("c_codeID").getValue());
                                Ext.storeDtl.load();
                            },
                        }, {
                            text: "เริ่มใหม่",
                            handler: function () {
                                Ext.getCmp("dc_creditor_idID").setValue(0);
                                Ext.getCmp("dc_creditor_idID_Name").setValue(null);
                                Ext.getCmp("s_checking_dateID").setValue(Ext.getCmp("s_checking_dateID").originalValue);
                                Ext.getCmp("e_checking_dateID").setValue(Ext.getCmp("e_checking_dateID").originalValue);
                            }
                        },
                        {
                            text: "ปิด",
                            handler: function () {
                                Ext.getCmp("frm-searchID").destroy();
                            }
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
                        header: "รอบวางบิล",
                        sortable: false,
                        width: 70,
                        id: "editEmpTorID",
                        align: "left",
                        dataIndex: "id",
                        renderer: function (value, metaData, record, row, col, store, gridView) {
                            metaData.attr = "style='cursor:pointer; text-align:center;';";
                            return '<img src="../images/icons/billingTime.png"); style="cursor:pointer"/>';
                        },
                    },
                    {
                        header: "ผ่านรายการ",
                        sortable: false,
                        align: "center",
                        dataIndex: "id",
                        id: "processDueID",
                        width: 130,
                        renderer: function (value, metaData, record, row, col, store, gridView) {

                            var BtnText, IconImg;
                            if (record.get("bl_code") == '' && record.get("i_status_billing") == 0) {
                                BtnText = '&nbsp;ยังไม่บันทึก';
                                IconImg = '../images/icons/application_form.png';
                            } else if (record.get("bl_code") != '' && record.get("i_status_billing") == 4) {
                                BtnText = '&nbsp;' + record.get('bl_code');
                                IconImg = '../images/icons/accept.png';
                            } else {
                                BtnText = '&nbsp;' + record.get('bl_code');
                                IconImg = '../images/icons/cog_start.png';
                            }
                            var style = 'font-size:12px;border:1px solid #ccc; width:119px; padding:3px 3px 3px 15px; background: #f0f0f0 url(' + IconImg + ') no-repeat 3px center; cursor: pointer;';

                            return '<button style="' + style + '" type="button">' + BtnText + '</button>';
                        }

                    },
                    {
                        header: "เลขที่สัญญา",
                        sortable: false,
                        width: 80,
                        align: "left",
                        dataIndex: "contract_code"
                    },
                    {
                        header: "งวด",
                        sortable: false,
                        width: 50,
                        align: "left",
                        dataIndex: "i_period"

                    },
                    {
                        header: "เรื่อง",
                        sortable: false,
                        width: 140,
                        align: "left",
                        dataIndex: "c_name"
                    },
                    {
                        header: "จำนวนเงิน",
                        sortable: false,
                        width: 80,
                        align: "right",
                        dataIndex: "f_total_amt"
                    },
                    {
                        header: "รหัสตรวจรับ",
                        sortable: false,
                        width: 100,
                        align: "center",
                        dataIndex: "c_code"
                    },
                    {
                        header: "วันที่เอกสารสมบูรณ์",
                        sortable: false,
                        align: "center",
                        dataIndex: "d_doc_arrive_dt",
                    },
                    {
                        header: "เลขที่เอกสารวางบิล",
                        sortable: false,
                        align: "center",
                        dataIndex: "c_doc_ref",
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
                var tab2 = function () {
                    function getPDF(a) {
                        if (a)
                            return "เอกสาร PDF";
                        else
                            return"ยังไม่อัพโหลดเอกสาร";
                    }
                    var urlUpload = window.location.protocol + '//' + window.location.hostname + '/sp_mn/api/mnUploadDocBilling.php';
                    var linkDownload = window.location.protocol + '//' + window.location.hostname + '/sp_mn/api/upload_billing';
                    return new Ext.Panel({
                        labelAlign: 'top',
                        title: "เอกสารเพิ่มเติม",
                        bodyStyle: "padding:0px",
                        id: 'frmSubID',
                        layout: "fit",
                        items: [
                            new Ext.FormPanel({
                                height: 180,
                                layout: "form",
                                frame: true,
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

                            new Ext.KeyMap(Ext.getBody(), [{
                                    key: "f",
                                    ctrl: true,
                                    fn: function (e, ele) {
                                        ele.preventDefault();
                                        if (!Ext.isEmpty(Ext.getCmp("winSearchFrm")))
                                            Ext.getCmp("winSearchFrm").destroy();
                                        var s1 = SearchFrm();
                                        s1.show();
                                    }
                                }]);

                            let rand = Math.random() * 2;
                            let catchFile = '?__dc=' + rand;
                            var headerGroup = [{
                                    text: "ตรวจสอบเอกสาร",
                                    icon: "../images/icons/icon_pdf.png",
                                    handler: function (e) {
                                        Ext.buAct = "FlowcartLv1";
                                        var linkDownload = window.location.protocol + '//' + window.location.hostname + '/sp_mn/api/upload_billing/';
                                        if (Ext.isEmpty(Ext.selectRow))
                                            Ext.MessageBox.alert("แจ้งเตือน", "กรุณากดเลือกข้อมูลที่จะแสดง/ออกเลข PR ก่อน");
                                        window.open(linkDownload + Ext.selectRow.get('c_code') + '.pdf' + catchFile, 'Monitoring', 'fullscreen="yes"');
                                    },
                                    scope: this
                                },
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
                            this.on(
                                    "contextmenu",
                                    function (e, grid, rowIndex, columnIndex) {
                                        e.stopEvent();
                                        this.contextMenu.showAt(e.getXY());
                                    },
                                    this
                                    );
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