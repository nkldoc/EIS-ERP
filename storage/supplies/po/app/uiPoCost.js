Ext.SP_TOR_ITEM = function (rs) {
    Ext.Ajax.request({
        url: "tor/api/mnArrivalCode.php",
        method: "POST",
        params: {
            mode: "WITHDRAWSPTORITEMS",
            sp_check_period_hdr_id:rs.get('sp_check_period_hdr_id'), //checking_hdr_id 
        },
        success: function (result, request) {

            let json = Ext.util.JSON.decode(result.responseText); 
            if (request.success) {
                
            }
        },
        failure: function (result, request) {
            Ext.MessageBox.alert("Failed", result.responseText);
        }
    }); 
};
function SearchFrm () {
    return new Ext.Window({
        title: "ค้นหารายการ",
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
                defauls: {background: "#ADD8E6"},
                items: [
                    {
                        columnWidth: 0.5,
                        layout: "form",
                        border: false,
                        items: [
                            {
                                xtype: "datefield",
                                fieldLabel: "วันที่เบิก",
                                id: "sd_tor_dateID",
                                name: "d_tor_date",
                            },
                            {
                                xtype: "textfield",
                                fieldLabel: "เลขที่ใบเบิก",
                                id: "c_code_refID", 
                                name: "c_code_ref",
                            },
                            {
                                xtype: "textfield",
                                fieldLabel: "เลขที่สัญญา",
                                id: "c_contract_codeID", 
                                name: "c_contract_code",
                            },
                            {
                                xtype: "textfield",
                                fieldLabel: "เลขที่ตรวจรับ",
                                id: "check_codeID", 
                                name: "check_code",
                            },
                            {
                                xtype: "textfield",
                                fieldLabel: "เลขที่รับของ",
                                id: "arrive_codeID", 
                                name: "arrive_code",
                            },
                            {
                                xtype: "textfield",
                                fieldLabel: "เลขที่ใบกันเหลื่อม",
                                id: "c_overlapID",
                                name: "c_overlap",
                            },
                        ],
                    },
                    {
                        columnWidth: 0.5,
                        layout: "form",
                        border: false,
                        items: [

                            {
                                xtype: "radiogroup",
                                columns: [200],
                                fieldLabel: "สถานะรายการ",
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
                                        boxLabel: "คลังรับเรื่องแล้ว",
                                    },
                                    {
                                        name: "i_post",
                                        inputValue: 2,
                                        boxLabel: "อนุมัติแล้ว",
                                    },
                                    {
                                        name: "i_post",
                                        inputValue: 3,
                                        boxLabel: "ทักท้วง",
                                    },
                                    {
                                        name: "i_post",
                                        inputValue: 4,
                                        boxLabel: "ยกเลิกใบเก่าใช้ใบใหม่",
                                    },
                                    {
                                        name: "i_post",
                                        inputValue: 5,
                                        boxLabel: "เลขที่ใบเบิกมีการเปลี่ยนแปลง",
                                    },
                                ], //radiogroup
                            },
                            /*{
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
                                    afterrender: function () {
                                        /* this.store.load({
                                            callback: function (record, operation, success) {
                                                if (success) {
                                                    Ext.getCmp("dc_cost3_idID").setValue(this.data.items[0].get("c_code"));
                                                }
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
                            },*/
                        ],
                    },
                ],
                buttonAlign: "left",
                buttons: [
                    {
                        text: "ค้นหา",
                        handler: function () {
                            Ext.getCmp('winSearchFrm').search();
                            // Ext.getCmp("winSearchFrm").destroy();
                            // Ext.getCmp("winSearchFrm").hide();

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
                    Ext.storePeriodHdr.setBaseParam("mode", "LIST_PERIOD_SUB_HDR");
                    Ext.storePeriodHdr.setBaseParam("act", "SEARCH");
                    // Ext.storeDtl.setBaseParam("d_tor_date", Ext.getCmp("sd_tor_dateID").getValue());
                    // Ext.storeDtl.setBaseParam("tor_type_id", Ext.getCmp("stor_type_idID").getValue());
                    // Ext.storePeriodHdr.setBaseParam("i_product_type", Ext.getCmp("i_product_typeID").getValue());
                    Ext.storePeriodHdr.setBaseParam("c_code_ref", Ext.getCmp("c_code_refID").getValue());
                    Ext.storePeriodHdr.setBaseParam("c_contract_code", Ext.getCmp("c_contract_codeID").getValue());
                    Ext.storePeriodHdr.setBaseParam("check_code", Ext.getCmp("check_codeID").getValue());
                    Ext.storePeriodHdr.setBaseParam("arrive_code", Ext.getCmp("arrive_codeID").getValue());
                    Ext.storePeriodHdr.setBaseParam("c_overlap", Ext.getCmp("c_overlapID").getValue());

                    // Ext.storeDtl.setBaseParam("c_name", Ext.getCmp("sc_nameID").getValue());
                    // Ext.storeDtl.setBaseParam("i_enabled", Ext.getCmp("searchEnabledID").getValue().inputValue);
                    Ext.storePeriodHdr.setBaseParam("i_post", Ext.getCmp("searchPostID").getValue().inputValue);
                    // Ext.storeDtl.setBaseParam("d_doc_ref", Ext.getCmp("sd_doc_refID").getValue());
                    Ext.storePeriodHdr.load();
                    // Ext.getCmp("winSearchFrm").hide();
                    Ext.getCmp("winSearchFrm").destroy();
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
/*Ext.SearchFrm1 = function () {
    return new Ext.Window({
        //                     collapsible: true,
        //                     maximizable: true,
        title: "ค้นหารายการ",
        width: 800,
        id: "",
        height: 200,
        layout: "fit",
        //                     modal: true,
        //         plain: true,
        //         bodyStyle: "padding:5px;",
        buttonAlign: "left",
        items: [
            {
                layout: "column",
                border: false,
                defauls: {background: "#eee"},
                items: [
                    {
                        columnWidth: 0.8,
                        layout: "form",
                        border: false,
                        items: [
                            {
                                xtype: "textfield",
                                fieldLabel: "เลขที่สัญญา",
                                id: "c_codeID", 
                                name: "c_code",
                            },
                            {
                                xtype: "textfield",
                                fieldLabel: "เลขที่รับของ",
                                id: "c_arrive_codeID", 
                                name: "c_arrive_code",
                            },  
                            {
                                xtype: "textfield",
                                fieldLabel: "เลขที่ตรวจรับ",
                                id: "c_doc_refID",
                                name: "c_doc_ref",
                            }
                        ],
                    },
                    {
                        columnWidth: 0.2,
                        layout: "form",
                        border: false,
                        items: [
                            {
                                xtype: "textfield",
                                fieldLabel: "เลขที่ใบเบิก",
                                id: "sss",
                                name: "ss",
                            }
                        ],
                    },
                ],
                buttonAlign: "left",
                buttons: [
                    {
                        text: "ค้นหา",
                        handler: function () {
                            Ext.storePeriodHdr.setBaseParam("mode", "");
                            Ext.storePeriodHdr.setBaseParam("act", "SEARCH");
                            /*c_doc_refID c_codeID
//                            Ext.storeDtl.setBaseParam("d_tor_date", Ext.getCmp("sd_tor_dateID").getValue());
//                            Ext.storeDtl.setBaseParam("tor_type_id", Ext.getCmp("stor_type_idID").getValue()); 
                            // Ext.storeDtl.setBaseParam("c_code", Ext.getCmp("c_codeID").getValue()); 
                            // Ext.storeDtl.setBaseParam("c_arrive_code", Ext.getCmp("c_arrive_codeID").getValue());
                            // // Ext.storeDtl.setBaseParam("c_doc_ref", Ext.getCmp("c_doc_refID").getValue());
                            // Ext.storeDtl.setBaseParam("i_notor", Ext.getCmp("i_notorID").getValue().inputValue);
//                            Ext.storeDtl.setBaseParam("c_name", Ext.getCmp("sc_nameID").getValue());
//                            Ext.storeDtl.setBaseParam("i_enabled", Ext.getCmp("searchEnabledID").getValue().inputValue);
//                            Ext.storeDtl.setBaseParam("i_post", Ext.getCmp("searchPostID").getValue().inputValue);
                            Ext.storeDtl.load();
                        },
                    },
                    {
                        text: "ปิด",
                        handler: function () {
                            Ext.getCmp("").hide();
                        },
                    },
                ],
            },
        ],
    });
};*/
Ext.closeBooking = function (rs) {
    var rs = Ext.selectRow;
    var link = '';
    var ip = Ext.session.ip_booking; // 192
    // var ip = 'localhost';
    if (rs.get("i_overlap") == null ){
        link = 'http://' + ip + '/api-nmu/?/bg/mn_BgReserveMoney/mode/PUT/bg_reserve_money_id/' + rs.get('bg_checking_money_id') + '/i_finish/1';
    } else {
        link = 'http://' + ip + '/api-nmu/?/bg/mn_BgReserveMoney/mode/PUT/bg_reserve_overlap_id/' + rs.get('bg_reserve_overlap_id') + '/i_finish/1';
    }
    Ext.SP_TOR_ITEM(rs);
    Ext.Ajax.request({
        url: link, //record,linkGetMoney
        method: "GET", //POST
        disableCaching: false,
        success: function (result, request) {
            var jsonData = Ext.util.JSON.decode(result.responseText); //decode json 

            Ext.MessageBox.alert("Success", "เรียบร้อยแล้ว", function () {
                Ext.upMoneyCheckingId(rs.get('sp_check_period_hdr_id'));
            }); 
            return false;
        },
        failure: function (result, request) {
            Ext.MessageBox.alert("Failed", result.responseText); // connect error
        },
    });

};


Ext.upMoneyCheckingId = function (id) {

    Ext.Ajax.request({
        url: "tor/api/mnPeriodController.php",
        method: "POST",
        params: {
            mode: "UP_BG_CHECKING_CLOSE_BOOKING_HDR",
            sp_check_period_hdr_id: id, //checking_hdr_id 
        },
        success: function (result, request) {

            let json = Ext.util.JSON.decode(result.responseText);

            if (request.success) {
                Ext.selectRow = null;
                Ext.getCmp("panelForm").destroy();
                Ext.getCmp("tabpanel1").getStore().reload();
                Ext.getCmp(Ext.poFormID).show();
                Ext.getCmp(Ext.poFormID).getEl().unmask();
            }
        },
        failure: function (result, request) {
            Ext.MessageBox.alert("Failed", result.responseText);
        }
    });
};
//**********************************************************************************************************************************************
Ext.part_file_pdf = "http://" + 'localhost' + "/pdf_po/";
function Po_OpenPdf(file_id, file_name) {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    var yyyy = today.getFullYear();
    today = yyyy + "-" + mm + "-" + dd;
    var tap_random = "Tap_" + Math.floor(Math.random() * 100000);
    if (file_id.indexOf("hdr") > 0) {
        file_name = file_name + "_" + "เอกสารใบเบิก_" + today;
    } else if (file_id.indexOf("dtl") > 0) {
        file_name = file_name + "_" + "เอกสารประกอบใบเบิก_" + today;
    } else if (file_id.indexOf("pay") > 0) {
        file_name = file_name + "_" + "เอกสารการจ่ายเงิน_" + today;
    } else if (file_id.indexOf("all") > 0) {
        file_name = file_name + "_" + "เอกสาร_" + today;
    }
    function enc(str) {
        var encoded = "";
        for (i = 0; i < str.length; i++) {
            var a = str.charCodeAt(i);
            var b = a ^ 123; // bitwise XOR with any number, e.g. 123
            encoded = encoded + String.fromCharCode(b);
        }
        return encoded;
    }
    // var Url = "http://" + location.host + "/nmu/po/api/PDF_View.php/" + file_name + ".pdf?code_F=" + enc(file_id.slice(0, -4)) + "&file_name=" + file_name;
    // window.open(Url);
    // return;
    var mapForm = document.createElement("form");
    mapForm.target = tap_random;
    var local_host = (location.host).substring(0, (location.host).length - 5);
    mapForm.method = "GET"; //GET & POST
    mapForm.action = "http://" + local_host + "/nmu/po/api/PDF_View.php/" + file_name + ".pdf?T=" + tap_random;

    var mapInput = document.createElement("input");
    mapInput.type = "text";
    mapInput.name = "code_F";
    mapInput.value = enc(file_id.slice(0, -4));
    mapForm.appendChild(mapInput);

    var mapInput2 = document.createElement("input");
    mapInput2.type = "text";
    mapInput2.name = "file_name";
    mapInput2.value = file_name;
    mapForm.appendChild(mapInput2);

    var mapInput3 = document.createElement("input");
    mapInput3.type = "text";
    mapInput3.name = "T";
    mapInput3.value = tap_random;
    mapForm.appendChild(mapInput3);



    document.body.appendChild(mapForm);
    map = window.open("", tap_random);
    if (map) {
        mapForm.submit();
    } else {
        alert("ไฟล์ PDF มีปัญหา");
    }
}





//**********************************************************************************************************************************************
var urlUpload = window.location.protocol + '//' + window.location.hostname + '/sp_mn/api/mnPoWorkingHdrBeginSupplies.php';
//var linkDownload = window.location.protocol + '//' + window.location.hostname + '/sp_mn/api/upload';
Ext.i_step = 4;
Ext.menu_back = 'ST0013'; //ส่งคืนตรวจสอบเอกสาร
Ext.menu_goto = null; //ส่งคืนตรวจสอบเอกสาร
//hidden
Ext.reversstep = false;
Ext.backstep = false;
Ext.reversstep = false;
Ext.menu_arr = [
    ['ส่งมอบงาน', 'ST0012', 1],
    ['ตรวจรับพัสดุ/ครุภัณฑ์', 'ST0013', 2],
    ['การมอบหมายผู้ปฏิบัติงาน', 'ST0114', 3],
    ['บันทึกใบขอเบิก', 'ST0115', 4],
    ['บันทึกเลขครุภัณฑ์', 'ST0116', 5],
];

function poToxampp() {

    var fileName = Ext.getCmp("upload_pdf1").getValue();
    Ext.Ajax.request({
        url: urlUpload,
        method: 'POST',
        headers: {'Content-Type': 'multipart/form-data'},
        params: {
            'fileName': fileName.trim()
        },
        success: function (result, request) {
            resultData = result.responseText;
        },
        failure: function (result, request) {
            resultData = result.responseText;
        }
    });
}
function winProcess(rec) {
    console.log(rec);
    rec.set();
    new Ext.Window({
        id: "win-processID",
        title: "ผ่านรายการเบิก",
        modal: true,
        resizable: false,
        layout: "form",
        bodyStyle: "padding:1px;",
        items: new Ext.FormPanel({
            id: "win-frm-processID",
            url: Ext.url_process,
            labelWidth: 180,
            width: 570,
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
                    value: "<b style='font-size:16px;'> " + rec.get("c_code_ref") + " ?</b>",
                },
                {
                    xtype: "displayfield",
                    fieldLabel: "พนักงานผู้รับผิดชอบทำเรื่องเบิก",
                    id: "po_emp_nameID",
                    name: "po_emp_name",
                    value: "<b style='font-size:12px;'> " + (rec.get("po_emp_name")) + " ?</b>",
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
                            console.log(Ext.getCmp('menu_backID').getValue());
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
function winPdf(rec) {

    console.log(rec);
    new Ext.Window({
        id: "win-pdfID",
        title: "upload pdf",
        modal: true,
        resizable: false,
        width: 550,
        layout: "form",
        url: Ext.url_pdf,
        labelWidth: 180,
        bodyStyle: "padding:3px;",
        items: [{
                xtype: 'displayfield',
                name: 'c_contract_code',
                value: rec.get('c_contract_code'),
                fieldLabel: "สัญญา",
            }, {
                xtype: 'displayfield',
                name: 'c_code_ref',
                value: rec.get('c_code_ref'),
                fieldLabel: "เลขเบิก",
            }, {
                xtype: 'displayfield',
                name: 'd_doc_date',
                value: rec.get('d_doc_date'),
                fieldLabel: "วันที่เบิก",
            }, {
                xtype: "fileuploadfield",
                id: "upload_pdf_pop1",
                allowBlank: true,
                width: "90%",
                emptyText: "เลือกไฟล์ (.pdf)",
                fieldLabel: "เอกสารใบเบิก (PDF)",
                name: "upload_pdf1",
                buttonText: "",
                buttonCfg: {
                    iconCls: "icon-pdf",
                },
                listeners: {
                    afterrender: function () {
                    },
                },
            },
            {
                xtype: "fileuploadfield",
                id: "upload_pdf_pop2",
                allowBlank: true,
                width: "90%",
                emptyText: "เลือกไฟล์ (.pdf)",
                fieldLabel: "เอกสารประกอบใบเบิก (PDF)",
                name: "upload_pdf2",
                buttonText: "",
                buttonCfg: {
                    iconCls: "icon-pdf",
                },
                listeners: {
                    afterrender: function () {

                    },
                },
            }
        ],
        buttons: [
            {
                text: "บันทึกเอกสารส่งเบิก",
                iconCls: "icon-save",
                handler: function () {
                    var form = Ext.getCmp('win-pdfID').getForm();
                    form.submit({
                        waitMsg: 'Saving Data...',
                        success: function (form, action) {
                            Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                Ext.getCmp("tabpanel1").getStore().reload();
                                Ext.selectRow = null;
                                Ext.getCmp('win-pdfID').destroy();
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
            },
            {
                text: Ext.GLOBAL_BU_BACK_TH,
                iconCls: "icon-clear",
                handler: function () {
                    Ext.getCmp("win-pdfID").destroy(); // clear memory :: garbage collection
                },
            },
        ],
    }).show();
}
Ext.Poplov_in = Ext.extend(Ext.Button, {
    config: {

    },
    initComponent: function () {
        this.mini = this.Minipop();
        this.isCellClickGrid = false;
        this.isSetFilter = false;
        this.setReset();
    },
    setReset: function (t) {
        if (t) {
            Ext.getCmp(this.id + "_Name").setValue();
            Ext.getCmp(this.id).setValue();
        }
    },
    afterrender: function () {},
    uiSearch: function (id) {
        var store = this.store;
        var id = id;
        var setDefaultFilter = [
            ["c_code", "เลขที่ใบตรวจรับ"],
            ["c_arrive_code", "เลขที่ใบรับของ"],
            ["c_name", "รายการ"],
        ];
        var setFilter = [["c_code", "เลขที่ใบตรวจรับ"], ["c_name", "รายการ"]];
        var filterGrid = new Ext.data.SimpleStore({
            fields: ["value", "text"],
            data: this.isSetFilter ? setFilter : setDefaultFilter,
        });
        var store = this.store;
        var filterGrid = Ext.isEmpty(this.filterGrid) ? filterGrid : this.filterGrid; //comb&store filter
        var defFilter = this.defFilter; //default filter

        return [
            {
                id: "filter" + id,
                xtype: "combo",
                width: 130,
                mode: "local",
                store: filterGrid,
                valueField: "value",
                displayField: "text",
                allowBlank: true,
                editable: false,
                triggerAction: "all",
                typeAhead: false,
                value: Ext.isEmpty(defFilter) ? "c_code" : defFilter,
            },
            "-",
            {
                id: "value-box" + id,
                xtype: "textfield",
                width: 130,
                fieldLabel: "fieldLabel",
                emptyText: "คำที่ต้องการค้นหา",
                listeners: {
                    specialkey: function (f, e) {
                        if (e.getKey() == e.ENTER) {
                            store.setBaseParam("mode", "SEARCH");
                            store.setBaseParam("filter", Ext.getCmp("filter" + id).getValue());
                            store.setBaseParam("value", Ext.getCmp("value-box" + id).getValue());
                            Ext.getCmp("win-pop-lov-modal-" + id)
                                    .getStore()
                                    .load();
                        }
                    },
                },
            },
        ];
    },
    Minipop: function () {
        /******/
        var store = this.store;
        var headerGrid = this.headerGrid;
        var id = this.id;
        var nameID = this.id + "_Name";
        var widthText = isNaN(this.widthText) ? 198 : this.widthText;
        var uiSearch = this.uiSearch(id);
        /*****/
        function SearchGrid(store, id) {
            if (Ext.getCmp("value-box" + id).getValue() != "") {
                store.setBaseParam("mode", "SEARCH");
                store.setBaseParam("filter", Ext.getCmp("filter" + id).getValue());
                store.setBaseParam("value", Ext.getCmp("value-box" + id).getValue());
                Ext.getCmp("win-pop-lov-modal-" + id)
                        .getStore()
                        .load();
            } else {
                store.setBaseParam("mode", "");
                Ext.getCmp("win-pop-lov-modal-" + id)
                        .getStore()
                        .load();
            }
        }

        var cellClick_lov = function (grid, rowIndex, columnIndex, e) {
            var record = grid.getStore().getAt(rowIndex);
            var TextShow = record.data.c_code + " " + record.data.c_name;
            Ext.getCmp(id).setValue(record.data.id);
            Ext.getCmp(nameID).setValue(TextShow);
            Ext.getCmp("win-pop-lov" + id).hide();
            Ext.getCmp("win-pop-lov" + id).destroy();
        };
        cellClick_lov = this.isCellClickGrid ? this.cellClickGrid : cellClick_lov;
        return {
            fieldLabel: this.fieldLabel,
            xtype: "radiogroup",
            id: "pop_" + this.id,
            columns: [0, widthText, 40],
            hidden: this.hidden == true ? true : false,
            listeners: {
                afterrender: this.afterrender,
            },
            items: [
                {
                    xtype: "hidden",
                    name: this.valueHidden,
                    id: id,
                    value: this.value,
                },
                {
                    xtype: "textfield",
                    name: "txt" + this.id,
                    emptyText: this.text,
                    id: nameID,
                    readOnly: true,
                },
                {
                    xtype: "button",
                    id: "Bu" + this.id,
                    name: "Bu" + this.id,
                    iconCls: this.iconCls,
                    handler: function () {
                        /* //Load Store Begin SearchGrid */
                        store.setBaseParam("mode", "");
                        store.load();
                        var win = new Ext.Window({
                            id: "win-pop-lov" + id,
                            title: "เลือกข้อมูล",
                            modal: true,
                            plain: true,
                            layout: "fit",
                            maximizable: true,
                            constrainHeader: true,
                            closable: true,
                            listeners: {
                                afterrender: function (obj, eOpts) {
                                    this.fn = function (widht, height) {
                                        //percentage
                                        var width = Ext.getBody().getViewSize().width * widht;
                                        var height = Ext.getBody().getViewSize().height * height;
                                        this.setSize(width, height);
                                    };
                                    this.fn(0.8, 0.85);
                                },
                                maximize: function (window, opts) {
                                    //when property minimizable
                                    window.setWidth(Ext.getBody().getViewSize().width * 0.99);
                                    window.expand("", false);
                                    window.center();
                                },
                            },
                            items: [
                                {
                                    xtype: "grid",
                                    id: "win-pop-lov-modal-" + id,
                                    border: false,
                                    stripeRows: true,
                                    loadMask: true,
                                    store: store,
                                    tbar: [
                                        uiSearch,
                                        " ",
                                        "-",
                                        {
                                            text: "ค้นหา",
                                            id: "magnifier_" + id,
                                            iconCls: "icon-magnifier",
                                            handler: function () {
                                                SearchGrid(store, id); /*SearchEngin(store,id);*/
                                            },
                                        } /* ,' ',{
                                         text : "เคลียร์ค่า",
                                         id:'clearValue_'+id,
                                         iconCls: 'icon-clear',
                                         handler : function() {  
                                         Ext.getCmp(id).setValue('');
                                         Ext.getCmp(nameID).setValue('');  
                                         Ext.getCmp("win-pop-lov"+id).hide();  					
                                         Ext.getCmp("win-pop-lov"+id).destroy();  
                                         
                                         }
                                         } */,
                                    ],
                                    columns: headerGrid,
                                    listeners: {
                                        afterrender: function (obj, eOpts) {
                                            this.fn = function (widht, height) {
                                                //percentage

                                                var width = Ext.getBody().getViewSize().width * widht;
                                                var height = Ext.getBody().getViewSize().height * height;
                                                this.setSize(width, height);
                                            };
                                            this.fn(0.5, 0.4);
                                        },
                                    },
                                    autoExpandColumn: "c_name",
                                    bbar: new Ext.PagingToolbar({
                                        pageSize: 15,
                                        store: store,
                                        displayInfo: true,
                                        displayMsg: "Displaying topics {0} - {1} of {2}",
                                    }),
                                },
                            ],
                        });
                        win.show();
                        Ext.getCmp("win-pop-lov-modal-" + id).on("cellclick", cellClick_lov, this);
                    },
                },
            ],
        };
    }, //Mini
});
Ext.onReady(function () {
    Ext.selectRow = null;
    Ext.poFormID = "grid-form-cheque";
    statusx = "add";
    let years = [];
    let currentTime = new Date();
    let now = currentTime.getFullYear() + 1;
    let id = currentTime.getFullYear() - 3;
    while (id <= now) {
        let c_name = id + 543;
        years.push({id, c_name});
        id++;
    }
    Ext.panelForm = function () {

        Ext.po_user = new Ext.data.JsonStore({
            autoDestroy: false,
            autoLoad: true,
            url: "../po/api/All_PoWorkingImpHdr.php",
            baseParams: {
                type: "po_user",
            },
            root: "data",
            idProperty: "id",
            fields: ["id", "c_name"],
        });
        Ext.po_emp = new Ext.data.JsonStore({
            autoDestroy: false,
            autoLoad: true,
            url: "../po/api/All_PoWorkingImpHdr.php",
            baseParams: {
                type: "po_emp",
            },
            root: "data",
            idProperty: "id",
            fields: ["id", "c_code", "c_name"],
        });
        Ext.po_user_permission = new Ext.data.JsonStore({
            autoDestroy: false,
            autoLoad: true,
            url: "../po/api/All_PoWorkingImpHdr.php",
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
            url: "../po/api/All_PoWorkingImpHdr.php",
            baseParams: {
                type: "dc_cost",
            },
            root: "data",
            idProperty: "id",
            fields: ["id", "c_code", "c_name"],
            listeners: {
                load: function (t, records, options) {
                },
            },
        });
        Ext.po_creditor = new Ext.data.JsonStore({
            autoDestroy: false,
            autoLoad: false,
            url: "../po/api/All_PoWorkingImpHdr.php",
            baseParams: {
                type: "po_creditor",
            },
            root: "data",
            idProperty: "id",
            fields: ["id", "c_code", "c_name"],
        });
        Ext.po_creditor_transfer = new Ext.data.JsonStore({
            autoDestroy: false,
            autoLoad: false,
            url: "../po/api/All_PoWorkingImpHdr.php",
            baseParams: {
                type: "po_creditor_transfer",
            },
            root: "data",
            idProperty: "id",
            fields: ["id", "c_code", "c_name"],
        });
        Ext.dc_expense_budget_type = new Ext.data.JsonStore({
            autoDestroy: false,
            autoLoad: false,
            url: "../po/api/All_PoWorkingImpHdr.php",
            baseParams: {
                type: "dc_expense_budget_type",
            },
            root: "data",
            idProperty: "id",
            fields: ["id", "c_name"],
        });
        Ext.bg_expense_group = new Ext.data.JsonStore({
            autoDestroy: false,
            autoLoad: true,
            url: "../po/api/All_PoWorkingImpHdr.php",
            baseParams: {
                type: "bg_expense_group",
            },
            root: "data",
            idProperty: "id",
            fields: ["id", "c_name"],
        });
        Ext.bg_expense = new Ext.data.JsonStore({
            autoDestroy: false,
            autoLoad: true,
            url: "../po/../po/api/All_PoWorkingImpHdr.php",
            baseParams: {
                type: "bg_expense",
            },
            root: "data",
            idProperty: "id",
            fields: ["id", "c_name"],
        });
        Ext.store_year = new Ext.data.JsonStore({
            fields: ["id", "c_name"],
            autoDestroy: false,
            autoLoad: true,
            data: years,
        });
        Ext.spChecking = new Ext.data.JsonStore({
            autoDestroy: false,
            autoLoad: true,
            url: "../po/reg/DAO/sp_listChecking.php",
            baseParams: {
                type: "checkingList", id: 0
            },
            root: "data",
            idProperty: "id",
            fields: [{name: "no"},
                {name: "id"},
                {name: "checking_id"},
                {name: "sp_check_period_hdr_id"},
                {name: "sp_gl_monthly_hdr_id"},
                {name: "sp_tor_contract_id"},
                {name: "c_status_last"},
                {name: "dc_cost_idTxt"},
                {name: "dc_cost2_id"},
                {name: "dc_cost2_idTxt"},
                {name: "i_product_type"},
                {name: "i_product_typeTxt"},
                {name: "c_approve_name"},
                {name: "c_arrive_code"},
                {name: "c_name"},
                {name: "c_code"},
                {name: "c_contract_code"},
                {name: "dc_expense_budget_type_idTxt"},
                {name: "bg_expense_group_idTxt"},
                {name: "po_working_hdr_id"},
                {name: "po_working_dtl_id"},
                {name: "i_budget_year"},
                {name: "i_yyyy_overlap"},
                {name: "c_overlap"},
                {name: "i_budget_year_overlap"},
                {name: "i_type_year"},
                {name: "dc_cost_id"},
                {name: "po_creditor_transfer_id"},
                {name: "po_creditor_id"},
                {name: "dc_expense_budget_type_id"},
                {name: "bg_expense_group_id"},
                {name: "bg_expense_id"},
                {name: "bg_expense_idTxt"},
                {name: "d_audit_date"},
                {name: "d_approve_date"},
                {name: "po_emp_id"},
                {name: "dc_approve_id"},
                {name: "c_code_ref"},
                {name: "d_doc_date"},
                {name: "d_checking_date"},
                {name: "c_invoice"},
                {name: "d_inv_date"},
                {name: "po_creditor_id"},
                {name: "po_creditor_name"},
                {name: "sp_emp_name"},
                {name: "sp_emp_id"},
                {name: "c_detail"},
                {name: "c_qty"},
                {name: "f_total"},
                {name: "c_comment"},
                {name: "i_is_url_pdf_hdr"},
                {name: "i_is_url_pdf_dtl"},
                {name: "pdf_hdr"},
                {name: "pdf_dtl"}],
        });
        var columnMini = [
            {
                header: "ID System",
                sortable: true,
                hidden: true,
                dataIndex: "id",
            },
            {
                header: "เลขที่ใบตรวจรับ",
                sortable: true,
                dataIndex: "c_code",
            },
            {
                header: "เลขที่ใบรับของ",
                sortable: true,
                dataIndex: "c_arrive_code",
            },
            {
                header: "จ่ายให้",
                width: 250,
                sortable: true,
                dataIndex: "po_creditor_name",
            },
            {
                header: "พนักงานผู้ร้บผิดชอบ",
                width: 250,
                sortable: true,
                dataIndex: "sp_emp_name",
            },
            {
                header: "รายการ",
                sortable: true,
                id: "c_name",
                dataIndex: "c_name",
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    metaData.attr = "style='cursor:pointer';";
                    return value;
                },
            },
        ];
        let Date_now = new Date();
        Date_now = Date_now.toISOString().split("T")[0].split("-");
        Ext.bgYear = Date_now[0] - 0 + ((Date_now[1] < 10 ? 0 : 1) - 0);
        var comboEmp = new Ext.form.ComboBox({
            mode: "local",
            allowBlank: true,
            store: Ext.po_emp,
            anchor: "90%",
            fieldLabel: "ผู้ดำเนินการ",
            submitValue: true,
            id : "po_emp_idID",
            hiddenName: "po_emp_id", //bg_expense_group_id
            name: "po_emp_name",
            valueField: "id",
            value: Ext.session.user_name,
            displayField: "c_name",
            triggerAction: "all",
            forceSelection: false,
            selectOnFocus: true,
            typeAhead: false,
            emptyText: "กรุณาเลือก...",
            listeners: {
            },
        });
        var comboCost = new Ext.form.ComboBox({
            mode: "local",
            store: Ext.dc_cost,
            allowBlank: true,
            anchor: "90%",
            fieldLabel: "หน่วยงานที่ขอเบิก",
            valueField: "id",
            displayField: "c_name",
            id: "dc_cost_idID",
            hiddenName: "dc_cost_id",
            name: "c_cost_name",
            triggerAction: "all",
            forceSelection: true,
            selectOnFocus: true,
            typeAhead: false,
            emptyText: "กรุณาเลือก...",
            listeners: {
                change: function (combo, newValue) {
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
            allowBlank: true,
            anchor: "90%",
            submitValue: true,
            name: "dc_expense_budget_type_idTxt",
            hiddenName: "dc_expense_budget_type_id", //bg_expense_group_id
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
        var comboBgYear = new Ext.form.ComboBox({
            mode: "local",
            allowBlank: true,
            fieldLabel: "ปีงบประมาณ",
            submitValue: true,
            hiddenName: "i_budget_year",
            name: "i_budget_yearTxt",
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
        var comboUsedBgYear = new Ext.form.ComboBox({
            mode: "local",
            fieldLabel: "ใช้เงินปีงบประมาณ",
            allowBlank: true,
            submitValue: true,
            id: "i_budget_year_overlapID",
            hiddenName: "i_budget_year_overlap", // ถ้าเงินกันเหลื่อมเสร็จ = i_yyyy_overlap   // ปกติ i_budget_year_overlap
            name: "i_budget_year_overlapTxt",
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
            store: Ext.bg_expense,
            allowBlank: true,
            valueField: "id",
            displayField: "c_name",
            anchor: "90%",
            submitValue: true,
            name: "c_detail",
            hiddenName: "bg_expense_id",   
            id: "bg_expense_id",
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
                    console.log(this);
                },
            },
        });
        var comboCreditor = new Ext.form.ComboBox({
            mode: "local",
            store: Ext.po_creditor,
            allowBlank: true,
            valueField: "id",
            displayField: "c_name",
            anchor: "90%",
            submitValue: true,
            name: "po_creditor_name",
            hiddenName: "po_creditor_id",
            id: "po_creditor_idID",
            triggerAction: "all",
            forceSelection: false,
            allBlank: true,
            selectOnFocus: true,
            fieldLabel: "จ่ายให้",
            width: 200,
            typeAhead: false,
            emptyText: "กรุณาเลือก...",
            listeners: {
                afterrender: function () {
                    this.fn = function () {};
                },
                Change: function () {
                    var f_id = Ext.isEmpty(Ext.getCmp("po_creditor_transfer_id").getValue());
                    if (f_id)
                        Ext.getCmp("po_creditor_transfer_id").setValue(this.getValue());
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
        var comboCreditortransfer = new Ext.form.ComboBox({
            mode: "local",
            store: Ext.po_creditor_transfer,
            valueField: "id",
            allowBlank: true,
            displayField: "c_name",
            anchor: "90%",
            submitValue: true,
            name: "po_creditor_transfer_name",
            hiddenName: "po_creditor_transfer_id",
            id: "po_creditor_transfer_id",
            triggerAction: "all",
            forceSelection: false,
            allBlank: true,
            selectOnFocus: true,
            fieldLabel: "โดยมอบให้",
            width: 200,
            typeAhead: false,
            emptyText: "กรุณาเลือก...",
            listeners: {
                beforequery: function (q) {
                    if (q.query) {
                        var length = q.query.length;
                        q.query = new RegExp(Ext.escapeRe(q.query));
                        q.query.length = length;
                        console.log(Ext.selectRow);
                    }
                },
                blur: function () {
                    this.getStore().clearFilter();
                },
            },
        });
        var PopContForm = new Ext.Poplov_in({
            text: "เลือกรายการที่ขอเบิก",
            id: "i_parentID",
            iconCls: "page_magnify",
            valueHidden: "i_parent_id",
            store: Ext.spChecking,
            headerGrid: columnMini,
            widthText: 330,
            fieldLabel: "เลือกรายการที่ขอเบิก",
            isCellClickGrid: true,
            cellClickGrid: function (grid, rowIndex, columnIndex, e) {
                var id = "i_parentID";
                var nameID = id + "_Name";
                var record = grid.getStore().getAt(rowIndex);
                var TextShow = record.data.c_code + " " + record.data.c_name;
                Ext.getCmp(id).setValue(record.data.po_working_hdr_id);
                console.log(record);
                record.set("id", null);
                record.set("po_working_hdr_id", null);
                record.set("po_working_dtl_id", null);
                record.set("dc_cost_id", Ext.SS_DC_COST_ACC_ID);
                record.set("c_code_ref", null);
                record.set("c_status_last", null);
                record.set("po_emp_name", record.get('sp_emp_name'));
                record.set("po_creditor_id", null);
                record.set("po_creditor_transfer_id", null);
                Ext.getCmp(Ext.poFormID).getForm().loadRecord(record);
                Ext.getCmp(nameID).setValue(TextShow);
                Ext.getCmp("win-pop-lov" + id).hide();
                Ext.getCmp("win-pop-lov" + id).destroy();
            },
        });
        //Ext.panelForm

        console.log(Ext.session);
        return new Ext.Panel({
            region: "center",
            id: "panelForm",
            title: "ทำรายการขอเบิก (หน่วยงาน)",
            border: false,
            stripeRows: true,
            loadMask: true,
            listeners: {
                beforrender: function () {

                },
            },
            items: new Ext.FormPanel({
                id: Ext.poFormID,
                fileUpload: false,
                frame: true,
                labelAlign: "left",
                bodyStyle: "padding:1px",
                layout: "column",
                items: [
                    {
                        columnWidth: 0.6,
                        xtype: "fieldset",
                        id: "win-cheque",
                        labelWidth: 200,
                        title: "ข้อมูลรายการ",
                        defaults: {
                            width: "65%",
                            border: false,
                        },
                        autoHeight: true,
                        bodyStyle: Ext.isIE ? "padding:0 0 1px 5px;" : "padding:0px 1px;",
                        border: false,
                        style: {
                            "margin-left": "3px",
                            "margin-right": Ext.isIE6 ? (Ext.isStrict ? "-4px" : "-5px") : "0", // you have to adjust for it somewhere else
                        },
                        frame: true,
                        autoScroll: true,
                        loadMask: true,
                        items: [
                            {
                                xtype: "hidden",
                                name: "id",
                                id: "idID",
                            },
                            {
                                xtype: "hidden",
                                name: "checking_id",
                                id: "idID",
                            },
                            {
                                xtype: "hidden",
                                name: "sp_tor_contract_id",
                            },
                            {
                                xtype: "hidden",
                                name: "sp_check_period_hdr_id",
                            },
                            {
                                xtype: "hidden",
                                name: "sp_emp_id",
                            },
                            {
                                xtype: "hidden",
                                name: "sp_gl_monthly_hdr_id",
                            },
                            {
                                xtype: "hidden",
                                name: "c_checking_code",
                            },
                            {/*dc_cost_id: 38, user_id: 60061*/
                                xtype: "hidden",
                                name: "dc_cost_ref_id",
                                value: Ext.session.dc_cost_id
                            },
                            {
                                xtype: "hidden",
                                name: "user_id",
                                value: Ext.session.user_id
                            },
                            {
                                xtype: "hidden",
                                name: "po_working_dtl_id",
                            },
                            {
                                xtype: "hidden",
                                name: "COST_user_id",
                                value: 86,
                            },
                            {
                                xtype: "hidden",
                                name: "COST_cost_id",
                                value: 38,
                            },
                            {
                                xtype: "datefield",
                                fieldLabel: "วันที่บันทึกรับเอกสาร",
                                readOnly: true,
                                value: new Date().dateFormat("d-m-Y"), //.add("Y", +543).dateFormat("Y-m-d")
                                name: 'd_receive_date',
                            }, {
                                xtype: "radiogroup",
                                columns: [120, 158],
                                fieldLabel: "ประเภทเบิก",
                                name: "i_type_withdraw",
                                items: [
                                    {
                                        checked: true,
                                        name: "i_is_pr",
                                        inputValue: 1,
                                        boxLabel: "เบิกปกติ",
                                    },
                                    {
                                        inputValue: 2,
                                        name: "i_is_pr",
                                        boxLabel: "เบิกโดยไม่ผ่านจัดซื้อ",
                                    },
                                ], //radiogroup
                                listeners: {
                                    change: function () {
                                        this.fn();
                                    },
                                    afterrender: function () {
                                        this.fn = function () {
                                            if (this.getValue().inputValue == 2)
                                                Ext.getCmp('i_cont_dis_idID').hide();
                                            else
                                                Ext.getCmp('i_cont_dis_idID').show();
                                        }

                                    },
                                },
                            },
                            {
                                xtype: "radiogroup",
                                columns: [100, 200],
                                id: "i_is_parentID",
                                hidden: true,
                                fieldLabel: "สถานะรายการ",
                                items: [
                                    {
                                        name: "i_is_parent",
                                        id: "i_is_parent1ID",
                                        inputValue: 1,
                                        checked: true,
                                        boxLabel: "ทำรายการใหม่",
                                    },
                                ],
                                listeners: {
                                    change: function (cb, rec, ind) {
                                        this.fn(rec.inputValue);
                                    },
                                    afterrender: function (obj, eOpts) {
                                        this.fn = function (i) {
                                            if (true) {
                                                Ext.getCmp("i_cont_dis_idID").show();
                                            } else {
                                                Ext.getCmp("i_cont_dis_idID").hide();
                                            }
                                        }; //fn
                                        this.fn(Ext.getCmp("i_is_parentID").getValue().inputValue);
                                    },
                                },
                            },
                            {
                                xtype: "compositefield",
                                id: "i_cont_dis_idID",
                                fieldLabel: "เลือกรายการที่ขอเบิก",
                                msgTarget: "side",
                                anchor: "-20",
                                defaults: {flex: 1, },
                                listeners: {
                                    afterrender: function (obj, eOpts) {
                                        this.fn = function (i) {
                                            if (i == "update") {
                                                Ext.getCmp("i_cont_dis_idID").hide();
                                            } else {
                                                Ext.getCmp("i_cont_dis_idID").show();
                                            }
                                        }; //fn
                                        this.fn(Ext.buAct);
                                    },
                                },
                                items: [PopContForm.mini],
                            }, {
                                xtype: "radiogroup",
                                columns: [98, 98],
                                fieldLabel: "ของที่ได้มา",
                                name: "i_product_type",
                                // id: "i_product_typeID",
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
                                    {
                                        inputValue: 0,
                                        name: "i_product_type",
                                        boxLabel: "ไม่มีของ",
                                    },
                                ], //radiogroup
                                listeners: {
                                    change: function () {
                                        // Ext.getCmp("i_is_invG2ID").fn(this.getValue().inputValue);
                                    },
                                    afterrender: function () {
                                        if (this.getValue().inputValue == 2) {
                                        } else {
                                        }
                                    },
                                },
                            },
                            {
                                xtype: "textfield",
                                fieldLabel: "เลขสัญญา",
                                name: "c_contract_code",
                                readOnly: true,
                            },
                            {
                                xtype: "textfield",
                                fieldLabel: "ใบแจ้งหนี้/เลขที่รับของ/เลขที่ตรวจรับ",
                                name: "c_arrive_code",
                            },
                            {
                                xtype: "textfield",
                                fieldLabel: "เลขที่ใบกันเหลื่อม",
                                name: "c_overlap",
                                readOnly: true,
                            },
                            {
                                xtype: "datefield",
                                readOnly : true,
                                allowBlank: false,
                                fieldLabel: "วันที่ตรวจรับ",
                                name: "d_checking_date",
                                id: "d_checking_date",
                                listeners: {
                                    render: function (c) {
                                        new Ext.ToolTip({
                                            target: c.getEl(),
                                            listeners: {
                                                'show': function (t) {
                                                    var value = 'วันที่ตรวจรับจากระบบ จุฬาฯ';
                                                    t.update(value);
                                                }
                                            }
                                        });
                                    }
                                }
                            },
                            {
                                xtype: "textfield",
                                fieldLabel: "เลขที่ใบขอเบิก MIS",
                                emptyText: 'DXXXX, etc.',
                                allowBlank: false,
                                id : 'c_code_ref_ID',
                                name: "c_code_ref",
                            }, {
                                xtype: "datefield",
                                fieldLabel: "วันที่ใบขอเบิก MIS",
                                allowBlank: false,
                                name: "d_doc_date",
                                listeners: {
                                    render: function (c) {
                                        new Ext.ToolTip({
                                            target: c.getEl(),
                                            listeners: {
                                                'show': function (t) {
                                                    var value = 'วันที่ใบขอเบิก ระบบ MIS';
                                                    t.update(value);
                                                }
                                            }
                                        });
                                    }
                                }
                            },
                            comboBgYear,
                            comboUsedBgYear,
                            comboTypeBg,
                            comboExpense,
                            comboCost,
                            comboCreditor,
                            comboCreditortransfer,
                            {
                                xtype: "textfield",
                                allowBlank: true,
                                anchor: "90%",
                                fieldLabel: "เลขที่ใบแจ้งหนี้/ใบรับของ",
                                emptyText: 'ใบจากผู้ขาย/รับจ้าง',
                                name: "c_invoice",
                            },
                            {
                                xtype: "textfield",
                                allowBlank: true,
                                emptyText: 'https://docs.google.com/document/pdrf/view?usp=sharing',
                                anchor: "90%",
                                fieldLabel: "url drive link pdf",
                                name: "url",
                            },
                            {
                                xtype: "fileuploadfield",
                                id: "upload_pdf1",
                                allowBlank: true,
                                width: "90%",
                                emptyText: "เลือกไฟล์ (.pdf)",
                                fieldLabel: "เอกสารใบเบิก (PDF)",
                                name: "upload_pdf1",
                                buttonText: "",
                                buttonCfg: {
                                    iconCls: "icon-pdf",
                                },
                                listeners: {
                                    afterrender: function () {
                                    },
                                },
                            },
                            {
                                xtype: "fileuploadfield",
                                id: "upload_pdf2",
                                allowBlank: true,
                                width: "90%",
                                emptyText: "เลือกไฟล์ (.pdf)",
                                fieldLabel: "เอกสารประกอบใบเบิก (PDF)",
                                name: "upload_pdf2",
                                buttonText: "",
                                buttonCfg: {
                                    iconCls: "icon-pdf",
                                },
                                listeners: {
                                    afterrender: function () {

                                    },
                                },
                            }, {
                                xtype: "hidden",
                                name: "id",
                                id: "po_working_hdr_idID",
                            }, {
                                xtype: "hidden",
                                name: "isUpload",
                                id: "isUploadID",
                            },
                        ],
                        buttons: [
                            {
                                text: "ทำรายการ",
                                id: "buSaveSubID",
                                hidden: true,
                                iconCls: "icon-save",
                                handler: function () {
                                    function submit(id, form) {
                                        form.fileUpload = true;
                                        Ext.getCmp('po_working_hdr_idID').setValue(id);
                                        Ext.getCmp('isUploadID').setValue(true);
                                        form.submit({
                                            waitMsg: 'Saving Data...',
                                            success: function (form, action) {
                                                Ext.Msg.alert("Success", "upload success", function (form, action) {
                                                    Ext.getCmp("tabpanel1").getStore().reload();
                                                    Ext.selectRow = null;
                                                    Ext.getCmp("panelForm").destroy();
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
                                    var form = Ext.getCmp(Ext.poFormID).getForm();
                                    var checkfalse = false;
                                    form.fileUpload = false;
                                    if (Ext.getCmp('modesubID').getValue().inputValue == 'POSTPO') {
                                        if (Ext.getCmp('upload_pdf1').getValue() != "" && Ext.getCmp('upload_pdf2').getValue() != "") {
                                            checkfalse = true;
                                            Ext.closeBooking();
                                        } else {
                                            checkfalse = false;
                                        }
                                    } else {
                                        checkfalse = true;
                                    }
                                    if (checkfalse) {
                                        form.submit({
                                            waitMsg: 'Saving Data...',
                                            success: function (form, action) {
                                                if (action.result.reval == 0) {
                                                    var id = parseInt(action.result.id);
                                                    Ext.getCmp(Ext.poFormID).hide();
                                                    Ext.getCmp(Ext.poFormID).getEl().mask("Please wait...", "x-mask-loading");
                                                    if (id > 0) {
                                                        submit(id, form);
                                                    } else {
                                                        Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                                            Ext.getCmp("tabpanel1").getStore().reload();
                                                            Ext.selectRow = null;
                                                            Ext.getCmp("panelForm").destroy();
                                                        });
                                                    }
                                                } else {
                                                    Ext.Msg.alert('Failure', action.result.msg);
                                                    var error_text = "ERROR\n";
                                                    error_text += "Time : " + new Date().toLocaleString('en-ZA') + "\n";
                                                    error_text += "Host : " + location.host + "\n";
                                                    error_text += "File : /po/app/uiPoCost.js\n";
                                                    error_text += "c_code_ref : " + Ext.getCmp('c_code_ref_ID').getValue() +"\n";
                                                    error_text += "Statement : submit failure action.result.reval == 0"; 
                                                    error_text += "Error_text : " + JSON.stringify(action);
                                                    Ext.Ajax.request({
                                                    url: "http://" + location.hostname + "/nmu/lib/send_line_dev.php",
                                                    method: "POST",
                                                    params: {
                                                        msg: error_text,
                                                    },
                                                    });
                                                }
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
                                                var error_text = "ERROR\n";
                                                error_text += "Time : " + new Date().toLocaleString('en-ZA') + "\n";
                                                error_text += "Host : " + location.host + "\n";
                                                error_text += "File : /po/app/uiPoCost.js\n";
                                                error_text += "c_code_ref : " + Ext.getCmp('c_code_ref_ID').getValue() +"\n";
                                                error_text += "Statement : submit failure"; 
                                                error_text += "Error_text : " + JSON.stringify(action);
                                                Ext.Ajax.request({
                                                url: "http://" + location.hostname + "/nmu/lib/send_line_dev.php",
                                                method: "POST",
                                                params: {
                                                    msg: error_text,
                                                },
                                                });
                                            }
                                        });
                                    } else {
                                        Ext.Msg.alert('Failure', 'ตรวจไฟล์ PDF');
                                    }
                                }
                            },
                            {
                                text: Ext.GLOBAL_BU_BACK_TH,
                                handler: function () {
                                    Ext.selectRow = null;
                                    Ext.getCmp("panelForm").destroy();
                                    Ext.getCmp("tabpanel1").getStore().reload();
                                },
                            },
                        ],
                    },
                    {
                        columnWidth: 0.4,
                        xtype: "fieldset",
                        id: "win-chequeID",
                        labelWidth: 150,
                        title: "รายละเอียดการขอเบิก",
                        defaults: {
                            width: "90%",
                            border: false,
                        },
                        autoHeight: true,
                        bodyStyle: Ext.isIE ? "padding:3px 0 3px 10px;" : "padding:3px 3px;",
                        border: false,
                        style: {
                            "margin-left": "5px",
                            "margin-right": Ext.isIE6 ? (Ext.isStrict ? "-4px" : "-5px") : "0", // you have to adjust for it somewhere else
                        },
                        items: [
                            {
                                xtype: "textfield",
                                fieldLabel: "จำนวนรายการ",
                                name: "c_qty",
                                id: "c_qtyID",
                                style: {

                                    padding: "1px",
                                    margin: "1px",
                                    "background-color": "#fff",
                                    "text-align": "left",
                                    width: "100px",
                                },
                            },
                            {
                                xtype: "textfield",
                                fieldLabel: "จำนวนเงิน",
                                name: "f_total",
                                allowBlank: true,
                                id: "f_totalID",
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
                            {
                                xtype: "displayfield",
                                fieldLabel: "พนักงานเบิก",
                                name: "sp_emp_name",
                                width: 200,
                            },
                            comboEmp,
                            {
                                xtype: 'displayfield',
                                name: 'empty_name',
                                value: '<span style "color:red">*กรณีไม่มีชื่อผู้ดำเนินรายการ ติดต่อ Admin ระบบ</span>'
                            },
                            {
                                xtype: "radiogroup",
                                columns: [80, 70],
                                id: "i_enableID",
                                hidden: true,
                                fieldLabel: "สถานะรายการ",
                                items: [
                                    {
                                        name: "i_enable",
                                        id: "i_enable1ID",
                                        inputValue: 1,
                                        checked: true,
                                        boxLabel: "ใช้งาน",
                                    },
                                    {
                                        name: "i_enable",
                                        id: "i_enable2ID",
                                        inputValue: 2,
                                        //                                                  checked : true ,
                                        boxLabel: "ยกเลิก",
                                    },
                                ],
                            },
                            {
                                xtype: "textarea",
                                fieldLabel: "คำอธิบายรายการ",
                                name: "c_comment",
                                width: 200,
                            },
                            {
                                xtype: "radiogroup",
                                columns: [180],
                                fieldLabel: "โหมดการบันทึก",
                                id: "modesubID",
                                listeners: {
                                    change: function (cb, nv, ov) {
                                        this.fnUrl();
                                    },
                                    beforrender: function () {
                                        Ext.url_post = "../po/reg/controller/mnPoWorkingHdrBeginSupplies.php";
                                    },
                                    afterrender: function () {

                                        this.fnUrl = function () {
                                            if (this.getValue().inputValue == 'POSTPO') {
                                                Ext.Msg.alert('Warning', 'คุณกำลังจะส่งรายการส่งเบิก ? กรุณาอัพโหลดไฟล์เอกสารให้ครบถ้วน');
                                                Ext.getCmp('upload_pdf1').show();
                                                Ext.getCmp('upload_pdf2').show();
                                                Ext.url_post = "http://" + location.host.slice(0, -5) + "/NMU/po/reg/controller/mnPoWorkingHdrBeginSupplies.php";
                                            } else {
                                                Ext.getCmp('upload_pdf1').hide();
                                                Ext.getCmp('upload_pdf2').hide();
                                                Ext.url_post = "../po/reg/controller/mnPoWorkingHdrBeginSupplies.php";
                                            }
                                            Ext.getCmp(Ext.poFormID).getForm().url = Ext.url_post;
                                        }
                                        this.fnUrl();
                                    },
                                },
                                style: {
                                    "font-weight": "bold",
                                },
                                items: (Ext.buAct == 'add' ? [{

                                        name: "mode",
                                        checked: true,
                                        inputValue: "ADD",
                                        boxLabel: "เพิ่มรายการเบิก",
                                    }] : [

                                    {
                                        name: "mode",
                                        checked: false,
                                        inputValue: "POSTPO",
                                        boxLabel: "ส่งรายการเบิกฝ่ายคลัง",
                                        id: "modesubapostpoID",
                                    },
                                    {
                                        name: "mode",
                                        inputValue: "UPDATE",
                                        checked: true,
                                        boxLabel: "อัพเดทรายการ",
                                        id: "modesubaupdateID",
                                    },
                                    {
                                        name: "mode",
                                        inputValue: "DISABLED",
                                        hidden: false,
                                        id: "modesubdisabledID",
                                        boxLabel: "ยกเลิกรายการเบิก",
                                    },
                                    {
                                        name: "mode",
                                        inputValue: "DELETE",
                                        hidden: false,
                                        id: "modesubdelID",
                                        boxLabel: "ลบรายการ",
                                    },
                                ]), //radiogroup
                            },
                        ],
                    },
                ],
            }),
        });
    }; //End Ext.panelForm 

    Ext.storePeriodHdr = new Ext.data.JsonStore({
        storeId: "myStore2",
        autoDestroy: false,
        autoLoad: true,
        url: "../po/api/List_poRequest.php",
        root: "data",
        baseParams: {
            mode: "LIST_PERIOD_SUB_HDR",
        }, //Permission i_read
        idProperty: "id",
        totalProperty: "totalCount",
        fields: [
            {name: "no"},
            {name: "id"},
            {name: "checking_id"},
            {name: "bg_checking_money_id"},
            {name: "i_is_withdraw"},
            {name: "po_working_hdr_id"},
            // {name: "i_product_type"},
            {name: "sp_check_period_hdr_id"},
            {name: "sp_gl_monthly_hdr_id"},
            {name: "d_receive_date"},
            {name: "c_checking_code"},
            {name: "c_contract_code"},
            {name: "sp_tor_contract_id"},
            {name: "i_yyyy"}, {name: "now_yyyy"},
            {name: "i_yyyy_overlap"},
            {name: "dc_expense_budget_type_id"},
            {name: "sp_emp_id"},
            {name: "sp_emp_name"},
            {name: "c_qty"},
            {name: "c_invoice"},
            {name: "dc_cost_id"},
            {name: "f_total"},
            {name: "url"},
            {name: "c_overlap"},
            {name: "i_overlap"},
            {name: "bg_reserve_overlap_id"},
            {name: "i_statusTxt"},
            {name: "bg_expense_id"},
            {name: "po_emp_id"},
            {name: "po_creditor_transfer_id"},
            {name: "po_creditor_id"},
            {name: "po_emp_name"},
            {name: "po_creditor_transfer_name"},
            {name: "po_creditor_name"},
            {name: "c_comment"},

            {name: "c_file_pdf_hdr"},
            {name: "c_file_pdf_dtl"},
            {name: "po_working_status"},
            {name: "working_code"},
            {name: "enable_working"},
            {name: "parent"},

            /*po_emp_id	
             , po_emp_name 
             , po_creditor_transfer_name 
             , po_creditor_transfer_id 
             , po_creditor_name 
             , po_creditor_id*/
            {name: "i_budget_year"},
            {name: "i_budget_year_overlap"},
            {name: "i_is_warranty"},
            {name: "i_warranty_age"},
            {name: "i_before"},
            {name: "c_arrive_code"}, 
            {name: "d_warranty_date"},
            {name: "d_doc_date"}, //d_checking_date d_audit_date d_doc_date
            {name: "d_checking_date"},
            {name: "d_audit_date"},
            {name: "c_code"},
            {name: "dc_bg_budget_type_idTxt"},
            {name: "po_expense_idTxt"},
            {name: "sp_contract_id"},
            {name: "dc_creditor_name"},
            {name: "sp_tor_hdr_period_id"},
            {name: "sp_tor_contract_id"},
            {name: "sp_po_id", type: "int"},
            {name: "i_period", type: "int"},
            {name: "f_total_amt", type: "string"},
            {name: "d_period_date"}, 
            {name: "d_arrive_date"}, //c_arrive_code d_arrive_date
            {name: "c_arrive_code"}, 
            {name: "c_code_ref"}, 

        ],
    });
    var loadStore = function (status) {

        if (Ext.isEmpty(Ext.selectRow) && status == 'update') {
            Ext.Msg.alert("แจ้งเตือน", "กรุณา click เลือกข้อมูลที่จะแก้ไขใน data grid", function (form, action) {
                return false;
            });
        } else {
            if(status!='add'){ 
            Ext.getCmp(Ext.poFormID).getEl().mask("Please wait...", "x-mask-loading");
            Ext.getCmp(Ext.poFormID).hide(); 
            }
            Ext.dc_expense_budget_type.load({
                callback: function (recordx, operation, success) {
                    if (success) {
                        Ext.bg_expense.load({
                            callback: function (recordx, operation, success) {
                                if (success) {
                                    Ext.po_creditor_transfer.load({
                                        callback: function (recordx, operation, success) {
                                            if (success) {
                                                Ext.po_creditor.load({
                                                    callback: function (recordx, operation, success) {
                                                        if (success) {
                                                            if (status == 'update') {
                                                                Ext.getCmp(Ext.poFormID).getForm().loadRecord(Ext.selectRow);
                                                                if (Ext.selectRow.get("po_working_hdr_id") == 0 )
                                                                    Ext.getCmp("buSaveSubID").hide();
                                                                else
                                                                    Ext.getCmp("buSaveSubID").hide();
                                                                if(status!='add'){
                                                                    Ext.getCmp(Ext.poFormID).show();
                                                                    Ext.getCmp(Ext.poFormID).getEl().unmask();
                                                                } 
                                                            } 
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
            });
        }
    };
    
    Ext.user_right_add = user_right_add;
    Ext.user_right_edit = user_right_edit;
    Ext.user_right_delete = user_right_delete;
    Ext.title = Ext.menu_name + " " + Ext.menu_code;
    var gridChecking = {
        xtype: "grid",
        id: "tabpanel1",
        region: "center",
        border: false,
        modal: true,
        title: Ext.title,
        height: 500,
        store: Ext.storePeriodHdr,
        columns: [
            new Ext.grid.RowNumberer({
                header: "ที่",
                width: 30,
                renderer: function (value, metaData, record, row, col, store, gridView) {
                  return record.get("no");
                },
              }),
            {header: "ID System", hidden: true, dataIndex: "id"
            },
            {header: "เลขที่เบิก", dataIndex: "c_code_ref", width: 100, align: "left",
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    if ((record.get('po_working_status') == 2) && (record.get('enable_working') == 1 )) {
                        return value + "<span style='padding-left:3px;color:blue;'>คลังรับเรื่องแล้ว</span>";
                    } else if ((record.get('po_working_status') == 3)&& (record.get('enable_working') == 1 )) {
                        return value + "<span style='padding-left:3px;color:red;'>ทักท้วง</span>";
                    } else if ((record.get('po_working_status') == 4) &&  (record.get('enable_working') == 1 )) {
                        return value + "<span style='padding-left:3px;color:green;'>อนุมัติแล้ว</span>";
                    } else if ((record.get('po_working_status') == 1) && (record.get('enable_working') == 1 )) {
                        return value + "<span style='padding-left:3px;color:Orange;'>ส่งเบิกแล้ว</span>";
                    } else if ((record.get('po_working_status') == 3)  && (record.get('enable_working') == 2 ) && (record.get('working_code')  != null ) ) {
                        return value + "<span style='padding-left:3px;color:red;'>ยกเลิกใบเก่าใช้ใบใหม่</span>";
                    } else if ((record.get('po_working_status') == 3)  && (record.get('enable_working') == 2 ) && (record.get('working_code') == null ) ) {
                        return value + "<span style='padding-left:3px;color:red;'>ยกเลิกใบเบิก</span>";
                    } else if ((record.get('po_working_status') == 0 )  && (record.get('po_working_hdr_id') > 0 ) ) {
                        return value + "<span style='padding-left:3px;color:red;'>เลขใบเบิกมีการเปลี่ยนแปลง</span>";
                    } else if ((record.get('po_working_status') == 0 )  && (record.get('po_working_hdr_id') == 0 ) ) {
                        return value ;
                    } else {
                        // console.log(record.get('po_working_hdr_id') +'||'+ record.get('po_working_status')+'||' + record.get('enable_working') )
                        return "<span style='padding-left:3px;color:red;'>ติดต่อadmin</span>";
                    }
                }, 
            }, 
            {
                header: "เลขที่ใบเบิกใหม่",sortable: false,align: "left",dataIndex: "working_code",hidden: true,},
            {
                header: "ใบแจ้งหนี้/เลขที่รับของ/เลขที่ตรวจรับ", align: "left", width: 100, dataIndex: "c_arrive_code"}, //c_arrive_code 
            {header: "สัญญา", align: "left", width: 55, dataIndex: "c_contract_code"}, //c_arrive_code

            {
                header: "เอกสารใบเบิก",
                sortable: false,
                width: 70,
                align: "center",
                dataIndex: "c_file_pdf_hdr",
                editor: new Ext.form.TextField({}),
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    var BtnText = "<img src='../images/icons/page_white_acrobat.png' style='margin-right:1px;' /><div><spen style='font-size:11px'>&nbspเอกสารใบเบิก</spen>";
          
                    return '<button style="display: flex" onclick="Po_OpenPdf(\''
                            + value + "', '" + record.data.c_code_ref + '\')" type="button">' + BtnText + "</button>";

                },
            },

            {
                header: "เอกสารประกอบใบเบิก",
                sortable: false,
                width: 80,
                align: "center",
                dataIndex: "c_file_pdf_dtl",
                editor: new Ext.form.TextField({}),
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    var BtnText = "<img src='../images/icons/page_white_acrobat.png' style='margin-right:1px;' /><div><spen style='font-size:11px'>&nbspเอกสารประกอบใบเบิก</spen>";
                    return '<button style="display: flex" onclick="Po_OpenPdf(\''
                            + value + "', '" + record.data.c_code_ref + '\')" type="button">' + BtnText + "</button>";
    
                },
            },
 
            {header: "วันที่ตรวจรับ", dataIndex: "d_checking_date", width: 55, align: "left"}, //d_checking_date d_audit_date d_doc_date
            {header: "ชื่อผู้ทำเรื่องเบิก", dataIndex: "po_emp_name", width: 80, align: "left"},
            {header: "วันที่ส่งเบิก", dataIndex: "d_doc_date", width: 55, align: "left"},
            {header: "จำนวนที่ส่งเบิก", align: "right", width: 55, dataIndex: "f_total"},
            //   {header: "สถานะ", dataIndex: "c_status", width: 55, align: "left"},
            
            {header: "เหตุผล", dataIndex: "c_reason", width: 55, align: "left"}
        ],
        listeners: {

            beforerender: function (g) {
                this.contextMenu = new Ext.menu.Menu({
                    items: [
                        {

                            text: "จัดการข้อมูล View/Copy/Edit/Delete",
                            icon: "../images/icons/application_edit.png",
                            handler: function (e) {
                                Ext.buAct = "update";
                                if (!Ext.isEmpty(Ext.getCmp('panelForm'))) {
                                    Ext.getCmp('panelForm').destroy();
                                }
                                if (Ext.selectRow != null) {
                                    var frm = Ext.panelForm();
                                    Ext.getCmp("contenterCenter").add(frm);
                                    Ext.getCmp("contenterCenter").setActiveTab(Ext.getCmp('panelForm'));
                                    //loadStoreForm                               
                                    loadStore(Ext.buAct);
                                } else {
                                    Ext.MessageBox.alert("แจ้งเตือน", "กรุณากดเลือกข้อมูลที่จะแสดง/ออกเลข PR ก่อน");
                                }
                            },
                            scope: this,
                        },
                    ],
                });
            },
            afterrender: function () {

                this.on("cellclick",
                        function (grid, rowIndex, columnIndex, e) {
                            var record = grid.getStore().getAt(rowIndex);
                            Ext.selectRow = record;
                            this.on(
                                    "contextmenu",
                                    function (e, grid, rowIndex, columnIndex) {

                                        e.stopEvent();
                                        this.contextMenu.showAt(e.getXY());
                                    },
                                    this
                                    );
                            if (columnIndex === grid.getColumnModel().getIndexById("hdrPeriodID")) {
                                if (record.get('readOnly') != 1) {

                                }

                            } else if (columnIndex === grid.getColumnModel().getIndexById("updateWaitingStatusID")) {


                                if (record.get('i_status_checking') === 1 && (record.get('c_code') === "" || record.get('c_code') === null)) { //record.get('c_code') === "" || record.get('c_code') === null
                                    Ext.getCmp("winChequeID").getEl().mask("Please wait...", "x-mask-loading");
                                    Ext.Ajax.request({
                                        url: "tor/api/mnCheckCode.php",
                                        method: "POST",
                                        params: {
                                            mode: "GENCODECHECKING",
                                            sp_check_period_hdr_id: record.data.id,
                                            i_is_warranty: record.data.i_is_warranty
                                        },
                                        success: function (result, request) {
                                            // console.log(result);
                                            if (result.statusText) {
                                                Ext.Msg.alert("แจ้งเตือน", "ออกเลขเรียบร้อยแล้ว");
                                            }
                                            Ext.getCmp("gridSub2ID").getStore().reload();
                                            Ext.getCmp("winChequeID").getEl().unmask();
                                        },
                                        failure: function (result, request) {
                                            Ext.MessageBox.alert("Failed", result.responseText);
                                        }
                                    });
                                    Ext.getCmp("gridSub2ID").getStore().reload();
                                    Ext.getCmp("winChequeID").getEl().unmask();
                                } else if (record.get('c_code_ref') !== "") {
                                    winProcess(record);
                                } else {

                                    Ext.Msg.alert("แจ้งเตือน", "ยังไม่สารถออกเลขได้");
                                }

                            }
                        }, this);
            },
        },
        viewConfig: {
            forceFit: true,
            getRowClass: function (record, rowIndex, rowPrms, ds) {
                if (record.data.i_status_checking == 2) {
                    return 'disabled-row';
                }

            }
        }, bbar: new Ext.PagingToolbar({
            pageSize: 20,
            store: Ext.storePeriodHdr,
            displayInfo: true,
            displayMsg: "Displaying topics {0} - {1} of {2}",
        }),
        tbar: [
            {
                xtype: "button",
                icon: "../images/icons/book_magnify.png",
                text: "ค้นหาข้อมูล",
                handler: function () {
                    if (!Ext.isEmpty(Ext.getCmp("winSearchFrm")))
                        Ext.getCmp("winSearchFrm").destroy();
                    var s1 = SearchFrm();
                    s1.show();
                },
            },   {
                xtype: "button",
                iconCls: "icon-add",
                text: "เพิ่มส่งเบิกคลัง",
                handler: function () {
                    Ext.buAct = "add";
                    if (!Ext.isEmpty(Ext.getCmp('panelForm'))) {
                        Ext.getCmp('panelForm').destroy();
                    }
                    var frm = Ext.panelForm();
                    Ext.getCmp("contenterCenter").add(frm);
                    Ext.getCmp("contenterCenter").setActiveTab(Ext.getCmp('panelForm'));
                    //loadStoreForm     
                    Ext.selectRow = null;
                    loadStore(Ext.buAct);
                },
            },
        ]
    };
    var center = new Ext.TabPanel({
        region: "center",
        border: false,
        activeTab: 0, //default Tab
        id: "contenterCenter",
        defaults: {autoScroll: true},
        items: [gridChecking],
    });
    new Ext.Viewport({
        layout: "border",
        items: [center]
    });
});

