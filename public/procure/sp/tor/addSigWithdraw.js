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
Ext.menu_arr = [
    ['ส่งมอบงาน', 'ST0012', 1],
    ['ตรวจรับพัสดุ/ครุภัณฑ์', 'ST0013', 2],
    ['การมอบหมายผู้ปฏิบัติงาน', 'ST0114', 3],
    ['บันทึกใบขอเบิก', 'ST0115', 4],
    ['บันทึกเลขครุภัณฑ์', 'ST0116', 5],
];
/* 'ST0116' ,'ST0115' ,'ST0114' ,'ST0013' ,'ST0012'
 Ext.menu_name = 'บันทึกใบขอเบิก';
 Ext.menu_code = 'ST0115';
 Ext.menu_id = 10037;
 Ext.menu_type_id = 6;
 Ext.menu_i_alarm = 3;
 Ext.menu_i_day = 4;
 */
/*
 1 => ส่งมอบงาน
 2 => ตรวจรับพัสดุ/ครุภัณฑ์
 3 => การมอบหมายผู้ปฏิบัติงาน
 4 => บันทึกใบขอเบิก
 5 => บันทึกเลขครุภัณฑ์
 */
/*
 function winProcess(rec) {
 console.log(rec);
 new Ext.Window({
 id: "win-processID",
 title: "ผ่านรายการ PR",
 modal: true,
 resizable: false,
 width: 590,
 layout: "form",
 bodyStyle: "padding:3px;",
 items: new Ext.FormPanel({
 id: "win-frm-processID",
 url: Ext.url_process,
 labelWidth: 180,
 items: [{
 xtype: 'hidden',
 name: 'i_step',
 value: Ext.i_step,
 }, {
 xtype: 'hidden',
 name: 'menu_code',
 value: Ext.menu_code,
 }, {
 xtype: 'hidden',
 name: 'menu_id',
 value: Ext.menu_id,
 }, {
 xtype: 'hidden',
 name: 'menu_i_alarm',
 value: Ext.menu_i_alarm,
 }, {
 xtype: 'hidden',
 name: 'menu_i_alarm',
 value: Ext.menu_i_alarm,
 }, {
 xtype: 'hidden',
 name: 'sp_check_period_hdr_id',
 value: rec.get("sp_check_period_hdr_id"),
 }, {
 xtype: 'hidden',
 name: 'menu_back',
 id: 'menu_backID',
 }, {
 xtype: 'hidden',
 name: 'sp_emp_id',
 value: rec.get("po_emp_id"),
 }, {
 xtype: 'hidden',
 name: 'd_receive_date',
 value: rec.get("d_receive_date"),
 }, {
 xtype: "displayfield",
 fieldLabel: "ผ่านการสถานะของ",
 value: "<b style='font-size:16px;'> " + rec.get("c_code") + " ?</b>",
 },
 {
 xtype: "displayfield",
 fieldLabel: "พนักงานผู้รับผิดชอบทำเรื่องเบิก",
 id: "dc_emp_nameID",
 name: "dc_emp_name",
 value: "<b style='font-size:12px;'> " + (rec.get("txtsp_emp_idID") ? rec.get("txtsp_emp_idID") : '') + " ?</b>",
 //                    xtype: "displayfield",
 //                    fieldLabel: "ผ่านการสถานะของ",
 //                    value: "<b style='font-size:16px;'> " + rec.get("c_code_ref") + " ?</b>",
 //                },
 //                {
 //                    xtype: "displayfield",
 //                    fieldLabel: "พนักงานผู้รับผิดชอบทำเรื่องเบิก",
 //                    id: "po_emp_nameID",
 //                    name: "po_emp_name",
 //                    value: "<b style='font-size:12px;'> " + (rec.get("po_emp_name")) + " ?</b>",
 },
 {
 xtype: "radiogroup",
 columns: [230],
 fieldLabel: "โหมดการบันทึก",
 id: "modesubID", //GOTOSTEP
 style: {"font-weight": "bold"},
 items: [
 {
 name: "mode",
 id: "GOTOSTEPID", //Ext.reversstep Ext.backstep Ext.reversstep
 hidden: Ext.gottostep,
 inputValue: "GOTOSTEP",
 boxLabel: "ผ่านราย การส่งเบิกคลัง <img src='../images/icons/accept.png'>",
 },
 {
 name: "mode",
 id: "BACKSTEPID",
 hidden: Ext.backstep,
 inputValue: "BACKSTEP",
 boxLabel: "ส่งกลับสายงาน แก้ไขเอกสาร <img src='../images/icons/arrow_redo.png'> " + Ext.menu_arr[1][0],
 },
 {
 name: "mode",
 id: "REVERSESTEPID",
 hidden: Ext.reversstep,
 inputValue: "REVERSESTEP",
 boxLabel: "ส่งกลับสายงานเบิก แก้ไขเอกสารแล้ว <img src='../images/icons/arrow_undo.png'>" + Ext.menu_arr[3][0],
 },
 ],
 listeners: {
 change: function (cb, nv, ov) {
 if (this.getValue().inputValue == 'GOTOSTEP') {
 Ext.getCmp('menu_backID').setValue(Ext.menu_arr[1][1]);
 } else if (this.getValue().inputValue == 'BACKSTEP') {
 Ext.getCmp('menu_backID').setValue(Ext.menu_arr[2][1]);
 } else if (this.getValue().inputValue == 'REVERSESTEPID') {
 Ext.getCmp('menu_backID').setValue(Ext.menu_arr[3][1]);
 }
 console.table(Ext.getCmp('menu_backID').setValue());
 },
 afterrender: function () {
 
 },
 },
 },
 {
 fieldLabel: "เหตุผลที่ส่งกลับ",
 xtype: "textarea",
 name: "c_comment",
 value: rec.get("c_comment"),
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
 text: "อัพเดทผ่านสถานะรายการ",
 iconCls: "icon-save",
 handler: function () {
 var form = Ext.getCmp('win-frm-processID').getForm();
 if (Ext.getCmp('modesubID').getValue().inputValue == '') {
 Ext.Msg.alert('Failure', 'เลือกหมวดการบันทึก');
 } else {
 form.submit({
 
 waitMsg: 'Saving Data...',
 success: function (form, action) {
 Ext.Msg.alert("Success", action.result.msg, function (form, action) {
 Ext.getCmp("tabpanel1").getStore().reload();
 Ext.selectRow = null;
 Ext.getCmp('win-processID').destroy();
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
 Ext.getCmp("win-processID").destroy(); // clear memory :: garbage collection
 },
 },
 ],
 })
 }).show();
 }
 */

function winProcess(rec) {
    console.log(rec);
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
            }, {
                xtype: 'hidden',
                name: 'sp_tor_hdr_period_id',
                id: 'sp_tor_hdr_period_idID',
                value: rec.get("id"),
//            },
//            {
//                xtype: "textfield",
//                readOnly: true,
//                fieldLabel: "เลขตรวจสอบ",
//                value: rec.get("c_checking_code"),
            },
            {
                xtype: "datefield",
                id: "d_doc_dateSubID",
                fieldLabel: "วันที่ส่งเอกสาร",
                value: rec.get("d_doc_date"),
            },
            {
                xtype: "radiogroup",
                columns: [180],
                fieldLabel: "โหมดการบันทึก",
                id: "modesubID", //GOTOSTEP
                style: {
                    "font-weight": "bold",
                },
                items: [
                    {
                        name: "mode",
                        inputValue: "GOTOSTEP",
                        boxLabel: "ผ่านรายการ <img src='../images/icons/accept.png'>",
                    },
                    {
                        name: "mode",
                        inputValue: "RETURN",
                        boxLabel: "แก้ไข ส่งสายงานซื้อจ้าง <img src='../images/icons/accept.png'>",
                    },
                ],
                listeners: {
                    change: function (cb, nv, ov) {
                        if (Ext.getCmp("modesubID").getValue().inputValue == "BACKSTEP") {
                            Ext.getCmp("reasonID").show();
                            Ext.menu_i_entrance = 5; //กลุ่มเมนู
                            Ext.i_backword = 1; //กลับ
                            Ext.menuback = 3; //เมนูที่กลับ
                        } else {
                            if (rec.data.c_comment_status == "") {
                                Ext.getCmp("reasonID").hide();
                            }

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
                value: rec.get("c_comment"),
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
                text: "อัพเดทผ่านสถานะรายการ",
                iconCls: "icon-save",
                handler: function () {
//                        console.log(Ext.getCmp("modesubID").getValue());
                    //alert(Ext.menuback);
                    if (Ext.isEmpty(Ext.getCmp("modesubID").getValue())) {
                        Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกหมวดการผ่านการสถานะ", function (bu, action) {
                            return false;
                        });
                    } else if (Ext.getCmp("modesubID").getValue().inputValue == "GOTOSTEP") {
                        if (rec.get("sp_emp_id") == 0)
                            Ext.Msg.alert("แจ้งเตือน", "กรุณาบันทึกพนักงานผู้รับผิดชอบงาน PR", function (bu, action) {
                                return false;
                            });
                        else
//                            console.log(Ext.menuCode);
//                            console.log(rec);

                            Ext.Ajax.request({
                                url: "tor/api/mnArrivalCode2.php",
                                modal: true,
                                params: {
                                    mode: "GOTOSTEP1",
                                    menuCode: Ext.menu_code,
                                    d_receive_date: Ext.getCmp("d_doc_dateSubID").getValue().format("Y-m-d"),
                                    step: Ext.getCmp("modesubID").getValue().inputValue, //GOTOSTEP
                                    sp_check_period_hdr_id: Ext.getCmp("sp_tor_hdr_period_idID").getValue(),
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
                    } else {

                        Ext.Ajax.request({
                            url: "tor/api/mnArrivalCode2.php",
                            modal: true,
                            params: {
                                mode: "BACKSTEP1",
                                menuCode: Ext.menu_code,
                                d_receive_date: Ext.getCmp("d_doc_dateSubID").getValue().format("Y-m-d"),
                                step: Ext.getCmp("modesubID").getValue().inputValue, //GOTOSTEP
                                sp_check_period_hdr_id: Ext.getCmp("sp_tor_hdr_period_idID").getValue(),
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
    }/*
     function winProcess(rec) {
     
     console.log(rec);
     
     new Ext.Window({
     id: "win-processID",
     title: "ผ่านรายการของสายงาน",
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
     fieldLabel: "พนักงานผู้รับผิดชอบทำเรื่องเบิก",
     id: "dc_emp_nameID",
     name: "dc_emp_name",
     value: "<b style='font-size:12px;'> " + (rec.get("txtsp_emp_idID") ? rec.get("txtsp_emp_idID") : '') + " ?</b>",
     },
     {
     xtype: "radiogroup",
     columns: [180],
     fieldLabel: "โหมดการบันทึก",
     id: "modesubID", //GOTOSTEP
     style: {
     "font-weight": "bold",
     },
     items: [
     {
     name: "mode",
     inputValue: "GOTOSTEP",
     boxLabel: "ผ่านรายการ <img src='../images/icons/accept.png'>",
     },
     {
     name: "mode",
     inputValue: "BACKSTEP",
     boxLabel: "ส่งกลับสายงาน <img src='../images/icons/time_red.png'>",
     },
     {
     name: "mode",
     inputValue: "RETURN",
     boxLabel: "ส่งสายงานเบิก <img src='../images/icons/cross.png'>",
     },
     ],
     listeners: {
     change: function (cb, nv, ov) {
     if (Ext.getCmp("modesubID").getValue().inputValue == "BACKSTEP") {
     Ext.getCmp("reasonID").show();
     
     Ext.menu_i_entrance = 5; //กลุ่มเมนู
     Ext.i_backword = 1; //กลับ
     Ext.menuback = 3;  //เมนูที่กลับ
     } else {
     if (rec.data.c_comment_status == "") {
     Ext.getCmp("reasonID").hide();
     }
     }
     },
     afterrender: function () {
     //                            if (rec.data.c_comment_status == "") {
     //                                Ext.getCmp("modesubID").items.items[0].setValue(true);
     //                            } else {
     //                                Ext.getCmp("modesubID").items.items[1].setValue(true);
     //                            }
     },
     },
     },
     {
     fieldLabel: "เหตุผลที่ส่งกลับ",
     xtype: "textarea",
     name: "reason",
     value: rec.get("c_comment"),
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
     text: "อัพเดทผ่านสถานะรายการ",
     iconCls: "icon-save",
     handler: function () {
     //                        console.log(Ext.getCmp("modesubID").getValue());
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
     Ext.status.process("ST0013", rec);
     } else if (Ext.getCmp("modesubID").getValue().inputValue == "RETURN") {
     Ext.status.process("ST0114", rec);
     
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
     */
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
                title: "รับเอกสารและเลือกผู้ปฎิบัติงาน",
                width: Ext.getCmp("contenterCenter").getWidth() - 450,
                height: Ext.getCmp("contenterCenter").getHeight() - 350,
                id: "winEmpTorID",
                modal: true,
                plain: true,
                collapsible: true,
                maximizable: true,
                items: new Ext.FormPanel({

                    height: 500,

                    id: "frmEditSpEmpID",
                    url: "tor/api/mnCheckCode.php",
                    defaults: {width: 400, },
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
                            value: "UPDATE_EMP",
                            name: "mode",
                        },
                        {
                            fieldLabel: 'รหัสตรวจรับ',
                            name: 'c_checking_code',
                            readOnly: true,
                            value: rec.get('c_code')
                        },
                        {
                            xtype: 'datefield',
                            name: 'd_receive_date',
                            width: 200,
                            fieldLabel: 'วันที่ส่งจากสายงาน',
                            readOnly: true,
                            // value: rec.get('d_receive_date')

                        },
                        Ext.PopDepartmentForm.mini,

                        {
                            xtype: "buttongroup",
                            fieldLabel: "วันที่รับเอกสาร",
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
                                        width: "170px",
                                    },
                                    text: "* นับ PA จากวันถัดไป " + Ext.menu_i_day + " วัน",
                                },
                            ],
                        }, {
                            xtype: "textarea",
                            fieldLabel: "หมายเหตุ",
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
//                                Ext.getCmp("buSavePopSubID").hide();
//                                console.log(Ext.selectRow);
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
    Ext.storeDtl = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "tor/api/List_TorStep4.php",
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
                name: "i_step",
            },
            {
                name: "i_is_waiting",
            },
            {
                name: "i_menu",
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
                name: "c_comment", // 
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
                                    columns: [80, 90],
                                    fieldLabel: "สถานะการใช้งาน",
                                    id: "searchEnabledID",
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
                                Ext.storeDtl.setBaseParam("d_tor_date", Ext.getCmp("sd_tor_dateID").getValue());
                                Ext.storeDtl.setBaseParam("tor_type_id", Ext.getCmp("stor_type_idID").getValue());

                                Ext.storeDtl.setBaseParam("c_code", Ext.getCmp("sc_codeID").getValue());
                                Ext.storeDtl.setBaseParam("c_name", Ext.getCmp("sc_nameID").getValue());
                                Ext.storeDtl.setBaseParam("i_enabled", Ext.getCmp("searchEnabledID").getValue().inputValue);
                                Ext.storeDtl.setBaseParam("i_post", Ext.getCmp("searchPostID").getValue().inputValue);

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
                        header: "รหัสตรวจรับ",
                        sortable: false,
                        align: "center",
                        dataIndex: "c_code",
                        width: 150,
                        renderer: function (value, metaData, record, row, col, store, gridView) {

                            var values;
                            var step = record.get('i_step');
                            var waiting = record.get('i_is_waiting');
                            if (step == 3 && waiting==1) {
                                metaData.attr = "style='color:red;cursor:pointer; text-align:center;';";
                                values = 'ส่งแก้ไข' + value;
                            } else if (step == 4 && waiting==0) {
                                metaData.attr = "style='color:blue;cursor:pointer; text-align:center;';";
                                values = 'ส่งแก้ไขแล้ว' + value;
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
                            metaData.attr = "style='cursor:pointer; text-align:center;';";
                            if (record.get("i_is_register") == 0)
                                return '<img src="../images/icons/application_form.png");/>';
                            else
                                return '<img src="../images/icons/cog_start.png"); style="cursor:pointer"/>';
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
                        header: "วันที่เอกสาร",
                        sortable: false,
                        align: "center",
                        dataIndex: "d_checking_date",
                        /*c_code , c_arrive_code	c_checking_code	d_checking_date	c_doc_ref	d_arrive_date	c_comment */
                    },
                    {
                        header: "รับเอกสารและเลือกผู้ปฎิบัติงาน",
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
