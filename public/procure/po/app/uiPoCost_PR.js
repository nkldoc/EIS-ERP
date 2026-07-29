    Ext.SP_TOR_ITEM = function (rs) {
        Ext.Ajax.request({
            url: "tor/api/mnArrivalCode.php",
            method: "POST",
            params: {
                mode: "WITHDRAWSPTORITEMS_PR",
                sp_withdraw_id:rs.get('sp_withdraw_id'), //checking_hdr_id 
    
                
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
    Ext.getMoney = function (rs) {
    
        Ext.perioidHdr = rs;
        var link = Ext.genLink(1, 0);
    //    alert(link);
    //    return false;
        Ext.Ajax.request({
            url: link, //record,linkGetMoney
            method: "GET", //POST
            disableCaching: false,
            success: function (result, request) {
                var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                var cheVal = parseFloat(rs.get('f_net_total_price').replace(/\,/g,''));
                var f_total_income = parseFloat(jsonData.data[0].f_total_income.replace(/\,/g,''));
    //var f_total_income = 10000000;
                if (jsonData.debug){
                    if (f_total_income >= cheVal) {
                        Ext.MessageBox.alert("Success", "เงินที่จะเบิกมีเพียงพอ", function () {
                            Ext.auditBoong();
                        });
                    } else {
                    // alert('เงินรายได้รับจริง ไม่พอดำเนินการตรวจรับ ' + f_total_income);
                            Ext.MessageBox.alert("Success", "เงินรายได้รับจริงไม่พอ ระบบได้ดำเนินการร้องของเงินแล้ว กรุณาติดต่อฝ่ายคลัง", function () {
                            if (Ext.perioidHdr.get('bg_reserve_money_id') == 0) {
                                Ext.reqMoney(11, 1, cheVal); //id,req_time, f_req 
                            } else {
                                Ext.getCmp("winPeriodHdrID").hide();
                                Ext.getCmp("winPeriodHdrID").destroy();
                            }
    
                        });
                    }
                } else {
                    Ext.MessageBox.alert("Failed", "ข้อมูลผิดพลาด ติดต่อ admin<br>" + jsonData.msg)
                }
            },
            failure: function (result, request) {
                Ext.MessageBox.alert("Failed", result.responseText); // connect error
            },
        });
    
    };
    Ext.closeBooking = function (rs) {
        var rs = Ext.selectRow;
        var link = '';
        var ip = Ext.session.ip_booking; // 192
        console.log(rs);
        // return false;
        // var ip = 'localhost';
        // if (rs.get("i_overlap") == null ){
            // link = 'http://' + ip + '/api-nmu/?/bg/mn_BgReserveMoney/mode/PUT/bg_reserve_money_id/' + rs.get('bg_reserve_money1_id') + '/i_finish/1';
            // link = 'http://' + ip + '/api-nmu/?/bg/mn_BgReserveMoney/mode/POST/i_sys/1/pr_id/292
            // /po_id/367/chk_id/203
            // /i_year/2023
            // /i_pr_type/1/i_reserve/3
            // /dc_cost_id/38/dc_budget_type_id/2
            // /bg_expense_id/127/i_last/1/f_amt/183,100.00
        // } else {
        link = 'http://' + ip + '/api-nmu/?/bg/mn_BgReserveMoney/mode/POST'
                        + '/i_sys/1'
                        + '/pr_id/' + rs.get('sp_tor_id')
                        + '/po_id/' +  rs.get('sp_tor_contract_id')
                        + '/chk_id/' + rs.get('sp_check_period_hdr_id')
                        + '/i_year/' + (parseInt(rs.get('i_budget_year')) ) //+((parseInt(rec.get('i_yyyy')) - setYear)-543)    test 1
                        + '/i_pr_type/' + rs.get('i_pr_type1')  //  plan or period  
                        + '/i_reserve/2' // step 1 PR step 2 po step3 checking
                        + '/dc_cost_id/' + rs.get('dc_cost_id')
                        + '/dc_budget_type_id/' + rs.get('dc_expense_budget_type_id')
                        + '/bg_expense_id/' + rs.get('bg_expense_id')
                        + '/i_last/' + '1' // pr มี สัญญาเดียว = 1
                        // + '/c_code_overlap/' + encodeURIComponent(rec.get('c_overlap'))
                        + '/f_amt/' + rs.get('f_total');
            // link = 'http://' + ip + '/api-nmu/?/bg/mn_BgReserveMoney/mode/PUT/bg_reserve_overlap_id/' + rs.get('bg_reserve_overlap_id') + '/i_finish/1';
        Ext.SP_TOR_ITEM(rs);
        Ext.Ajax.request({
            url: link, //record,linkGetMoney
            method: "GET", //POST
            disableCaching: false,
            success: function (result, request) {
                var jsonData = Ext.util.JSON.decode(result.responseText); //decode json 
    
                Ext.MessageBox.alert("Success", "เรียบร้อยแล้ว", function () {
                    Ext.upMoneyCheckingId(rs.get('sp_withdraw_id'));
                }); 
                return false;
            },
            failure: function (result, request) {
                Ext.MessageBox.alert("Failed", result.responseText); // connect error
            },
        });
    
    };

    Ext.closeBooking2 = function (rs) {
        var rs = Ext.selectRow;
        var link = '';
        var ip = Ext.session.ip_booking; // 192
        console.log(rs);
        // return false;
        // var ip = 'localhost';
        // if (rs.get("i_overlap") == null ){
            // link = 'http://' + ip + '/api-nmu/?/bg/mn_BgReserveMoney/mode/PUT/bg_reserve_money_id/' + rs.get('bg_reserve_money1_id') + '/i_finish/1';
            // link = 'http://' + ip + '/api-nmu/?/bg/mn_BgReserveMoney/mode/POST/i_sys/1/pr_id/292
            // /po_id/367/chk_id/203
            // /i_year/2023
            // /i_pr_type/1/i_reserve/3
            // /dc_cost_id/38/dc_budget_type_id/2
            // /bg_expense_id/127/i_last/1/f_amt/183,100.00
        // } else {
        link = 'http://' + ip + '/api-nmu/?/bg/mn_BgReserveMoney/mode/POST'
                        + '/i_sys/1'
                        + '/pr_id/'  + rs.get('sp_tor_id')
                        + '/po_id/'  +   rs.get('sp_tor_contract_id')
                        + '/chk_id/' + rs.get('sp_check_period_hdr_id')
                        + '/i_year/' + (parseInt(rs.get('i_budget_year')) ) //+((parseInt(rec.get('i_yyyy')) - setYear)-543)    test 1
                        + '/i_pr_type/' + rs.get('i_pr_type1')  //  plan or period  
                        + '/i_reserve/3' // step 1 PR step 2 po step3 checking
                        + '/dc_cost_id/' + rs.get('dc_cost_id')
                        + '/dc_budget_type_id/' + rs.get('dc_expense_budget_type_id')
                        + '/bg_expense_id/' + rs.get('bg_expense_id')
                        + '/i_last/' + '1' // pr มี สัญญาเดียว = 1
                        // + '/c_code_overlap/' + encodeURIComponent(rec.get('c_overlap'))
                        + '/f_amt/' + rs.get('f_total');
            // link = 'http://' + ip + '/api-nmu/?/bg/mn_BgReserveMoney/mode/PUT/bg_reserve_overlap_id/' + rs.get('bg_reserve_overlap_id') + '/i_finish/1';
        Ext.SP_TOR_ITEM(rs);
        Ext.Ajax.request({
            url: link, //record,linkGetMoney
            method: "GET", //POST
            disableCaching: false,
            success: function (result, request) {
                var jsonData = Ext.util.JSON.decode(result.responseText); //decode json 
    
                Ext.MessageBox.alert("Success", "เรียบร้อยแล้ว", function () {
                    Ext.upMoneyCheckingId(rs.get('sp_withdraw_id'));
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
                sp_withdraw_id: id, //checking_hdr_id 
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
                        name: 'sp_withdraw_id',
                        value: rec.get("sp_withdraw_id"),
                    }, {
                        xtype: 'hidden',
                        name: 'sp_tor_id',
                        value: rec.get("sp_tor_id"),
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
                        /*handler: function () { 
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
                        
                        },*/
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
                    name: 'pr_code',
                    value: rec.get('pr_code'),
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
                    /*handler: function () { 
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
                    
                    },*/
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
    //        var headerGrid = this.headerGrid;
            var id = id;
            var setDefaultFilter = [
                ["c_code", "เลขที่ใบตรวจรับ"],
                ["pr_code", "เลขที่ใบรับของ"],
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
    //  TabWindowFOrom
    //  allowBlank: false,
    //  allowBlank: true,
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
    //                    if (Ext.SS_I_TYPE_USER == 3) {
    //                        Ext.getCmp("dc_cost_idID").setValue(Ext.SS_DC_COST_ACC_ID);
    //                        Ext.getCmp("dc_cost_idID").readOnly = true;
    //                    }
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
                url: "../po/reg/DAO/sp_listPR.php",
                baseParams: {
                    type: "checkingList", id: 0
                },
                root: "data",
                idProperty: "id",
                fields: [{name: "no"},
                {name: "id"},
                {name: "sp_tor_id"},
                {name: "status_name"},
                {name: "pr_code"},
                {name: "c_name"},
                {name: "bg_expense_id"},
                {name: "expense_name"},
                {name: "dc_expense_budget_type_id"},
                {name: "dc_expense_budget_type_idTxt"},
                {name: "i_type_bg"},
                {name: "i_yyyy"},
                {name: "f_total_amt"},
                {name: "sp_status_hdr_id"},
                {name: "d_sent_date"},
                {name: "sp_emp_id"},
                {name: "sp_emp_name"},
                {name: "sp_withdraw_id"},
                {name: "c_invoice"},
                {name: "d_doc_date"},
                {name: "d_audit_date"},
                {name: "i_product_type"},
                ],
            });
            var columnMini = [
                {
                    header: "ID System",
                    sortable: true,
                    hidden: true,
                    dataIndex: "id",
                },
                {
                    header: "เลขที่ PR",
                    sortable: true,
                    dataIndex: "pr_code",
                },
                {
                    header: "ปีงบประมาณ",
                    width: 100,
                    sortable: true,
                    dataIndex: "i_yyyy",
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
                    width: 250,
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
                // value: 20341,
                displayField: "c_name",
                triggerAction: "all",
                forceSelection: false,
                selectOnFocus: true,
                typeAhead: false,
                emptyText: "กรุณาเลือก...",
                listeners: {
    //                render: function (c) {
    //                    new Ext.ToolTip({
    //                        target: c.getEl(),
    //                        listeners: {
    //                            'show': function (t) {
    //                                var value = 'ถ้าไม่มีในในรายการให้เลือก ให้กรอกชื่อเข้าไปได้เลย';
    //                                t.update(value);
    //                            }
    //                        }
    //                    });
    //                },
    //                afterrender: function () {
    //                    this.fn = function () {};
    //                },
    //                Change: function () {
    //                    this.fn();
    //                },
    //                beforequery: function (q) {
    //                    if (q.query) {
    //                        var length = q.query.length;
    //                        q.query = new RegExp(Ext.escapeRe(q.query));
    //                        q.query.length = length;
    //                    }
    //                },
    //                blur: function () {
    //                    this.getStore().clearFilter();
    //                },
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
    //                    if (newValue == "" && Ext.SS_I_TYPE_USER == 3) {
    //                        Ext.getCmp("dc_cost_idID").setValue(Ext.SS_DC_COST_ACC_ID);
    //                        Ext.getCmp("dc_cost_idID").readOnly = true;
    //                    }
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
                name: "dc_expense_budget_type_idTxt",  //budget_type
                hiddenName: "dc_expense_budget_type_id", //bg_expense_group_id budget_type_id
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
                hiddenName: "bg_expense_id",   //expense_id
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
                    var TextShow =  record.data.c_name;
                    Ext.getCmp(id).setValue(record.data.po_working_hdr_id);
    //            if (Ext.HDR_ID == null) {
                    console.log(record);
                    record.set("id", null);
                    // record.set("po_working_dtl_id", null);
                    record.set("dc_cost_id", Ext.SS_DC_COST_ACC_ID);
                    // Ext.getCmp("pr_codeID").setValue(record.json.pr_code);
                    var po_emp_index = Ext.po_emp.findExact("c_name" ,record.json.sp_emp_name);
                    if (po_emp_index == -1  ){
                        record.set("po_emp_name", record.get('sp_emp_name'));
                    } else {
                        var po_emp = Ext.po_emp.getAt(po_emp_index);
                        Ext.getCmp("po_emp_idID").setValue(po_emp.id);
                    }
                    // Ext.getCmp("po_emp_idID").setValue(record.json.emp_name);
                    // Ext.getCmp("i_product_typeID").setValue(record.json.i_product_type);
                    Ext.getCmp("c_qtyID").setValue(record.json.c_name);
                    Ext.getCmp("f_totalID").setValue(record.json.f_total_amt);
                    Ext.getCmp("sp_tor_contract_idID").setValue(record.json.sp_tor_contract_id);
                    Ext.getCmp("sp_check_period_hdr_idID").setValue(record.json.sp_check_period_hdr_id);
                    record.set("c_code_ref", null);
                    record.set("c_status_last", null);
                    console.log(record.json);
    //                return false;
    //                record.set("i_budget_year", 2022); //i_budget_year i_budget_year_overlap
    //                record.set("i_budget_year_overlap", 2022); //i_budget_year_overlap
                //    record.set("c_qtyID", null);
    //                record.set("c_detail", null);
    
                    record.set("po_creditor_id", null);
                    record.set("po_creditor_transfer_id", null);
                    Ext.getCmp(Ext.poFormID).getForm().loadRecord(record);
                    // Ext.getCmp("i_budget_year_overlapID").setValue(record.get("i_yyyy_overlap"))
                    // alert(record.get('po_emp_name'));
                    Ext.getCmp(nameID).setValue(TextShow);
                    Ext.getCmp("win-pop-lov" + id).hide();
                    Ext.getCmp("win-pop-lov" + id).destroy();
                },
            });
            //Ext.panelForm
            console.log(Ext.selectRow);
    
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
    //                url: "http://" + location.host.slice(0, -5) + "/NMU/po/reg/controller/mnPoWorkingHdrBeginCost.php",
    //                url: "../po/reg/controller/mnPoWorkingHdrBeginSupplies.php",
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
                            // Default config options for child items
    //                        defaultType: "textfield",
                            autoHeight: true,
                            bodyStyle: Ext.isIE ? "padding:0 0 1px 5px;" : "padding:0px 1px;",
                            border: false,
                            style: {
                                "margin-left": "3px",
                                // when you add custom margin in IE 6...
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
                                // {
                                //     xtype: "hidden",
                                //     name: "checking_id",
                                //     id: "idID",
                                // },
                                {
                                    xtype: "hidden",
                                    name: "sp_tor_id",
                                },
                                {
                                    xtype: "hidden",
                                    name: "i_type_bg",
                                },
                                {
                                    xtype: "hidden",
                                    name: "sp_emp_id",
                                },
                                {
                                    xtype: "hidden",
                                    name: "sp_tor_contract_id",
                                    id : "sp_tor_contract_idID"
                                },
                                {
                                    xtype: "hidden",
                                    name: "sp_check_period_hdr_id",
                                    id : "sp_check_period_hdr_idID"
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
                                                // {
                                                //   name: "i_is_parent",
                                                //   id: "i_is_parent2ID",
                                                //   inputValue: 2,
                                                //   boxLabel: "เพิ่มรายการโดยการยกเลิกใบเบิกเดิม",
                                                // },
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
                                    id : "i_product_typeID",
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
    //                                        Ext.getCmp("i_product_type2ID").hide(); 
                                            } else {
    //                                        Ext.getCmp("i_product_type2ID").show(); 
                                            }
                                        },
                                    },
    //                            }, {
    //                                xtype: "displayfield",
    //                                fieldLabel: "รายละเอียด",
    //                                name: "c_detail",
                                },
                                // {
                                //     fieldLabel: "เลขที่ PR ",
                                //     xtype: "textfield",
                                // //     width: 300,
                                // //     height: 20,
                                //     readOnly: true,
                                //     name: "pr_code",
                                //     // id : "pr_codeID"
                                // },        //ปัญหา
                                // {
                                //     xtype: "textfield",
                                //     fieldLabel: "ใบแจ้งหนี้/เลขที่รับของ/เลขที่ตรวจรับ",
                                //     name: "c_arrive_code",
                                // },
                                // {
                                //     xtype: "textfield",
                                //     fieldLabel: "เลขที่ใบกันเหลื่อม",
                                //     name: "c_overlap",
                                //     readOnly: true,
                                // },
                                {
                                    xtype: "datefield",
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
                                    id : 'c_code_ref_ID',
                                    allowBlank: false,
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
                                    iconCls: "icon-save",
                                    handler: function () {
    
    
    
                                        //                    return false;
                                        function submit(id, form) {
                                            form.fileUpload = true;
                                            Ext.getCmp('po_working_hdr_idID').setValue(id);
                                            Ext.getCmp('isUploadID').setValue(true);
                                            form.submit({
                                                waitMsg: 'Saving Data...',
                                                success: function (form, action) {
                                                    Ext.Msg.alert("Success", "upload success", function (form, action) {
    
                                                        console.log(Ext.selectRow);
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
                                        if(Ext.getCmp("po_emp_idID").getValue()== 0 ){
                                            Ext.Msg.alert('Failure', 'ยังไม่ได้ระบุผู้ดำเนินรายการ');
                                            return false;
                                            
                                        } else if (Ext.getCmp("i_budget_year_overlapID").getValue()== 0 ){
                                            Ext.Msg.alert('Failure', 'ยังไม่ได้ระบุใช้เงินปีงบประมาณ');
                                            return false;
                                        }
                                        if (Ext.getCmp('modesubID').getValue().inputValue == 'POSTPO') {
                                            if (Ext.getCmp('upload_pdf1').getValue() != "" && Ext.getCmp('upload_pdf2').getValue() != "") {
                                                checkfalse = true;
                                                // Ext.closeBooking();
                                                Ext.closeBooking2();
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
                                                        // var error_text = "ERROR\n";
                                                        // error_text += "Time : " + new Date().toLocaleString('en-ZA') + "\n";
                                                        // error_text += "Host : " + location.host + "\n";
                                                        // error_text += "File : /po/app/uiPoCost.js\n";
                                                        // error_text += "c_code_ref : " + Ext.getCmp('c_code_ref_ID').getValue() +"\n";
                                                        // error_text += "Statement : submit failure"; 
                                                        // Ext.Ajax.request({
                                                        // url: "http://" + location.hostname + "/nmu/lib/send_line_dev.php",
                                                        // method: "POST",
                                                        // params: {
                                                        //     msg: error_text,
                                                        // },
                                                        // });
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
                                                    // var error_text = "ERROR\n";
                                                    // error_text += "Time : " + new Date().toLocaleString('en-ZA') + "\n";
                                                    // error_text += "Host : " + location.host + "\n";
                                                    // error_text += "File : /po/app/uiPoCost.js\n";
                                                    // error_text += "c_code_ref : " + Ext.getCmp('c_code_ref_ID').getValue() +"\n";
                                                    // error_text += "Statement : submit failure"; 
                                                    // Ext.Ajax.request({
                                                    // url: "http://" + location.hostname + "/nmu/lib/send_line_dev.php",
                                                    // method: "POST",
                                                    // params: {
                                                    //     msg: error_text,
                                                    // },
                                                    // });
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
                                /* validator: function (val) {
                                if (!Ext.isEmpty(val)) {
                                return true;
                                } else {
                                
                                return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                }
                                },*/
                            },
                            // Default config options for child items
    //                        defaultType: "textfield",
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
    //                                        fieldLabel: "*",
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
    //                                hidden: true,
                                    id: "modesubID",
                                    listeners: {
                                        change: function (cb, nv, ov) {
                                            this.fnUrl();
                                        },
                                        beforrender: function () {
                                            Ext.url_post = "../po/reg/controller/mnPoWorkingHdrBeginSupplies_PR.php";
                                        },
                                        afterrender: function () {
    
                                            this.fnUrl = function () {
                                                if (this.getValue().inputValue == 'POSTPO') {
                                                    // alert('คุณกำลังจะส่งรายการส่งเบิก ?'); //upload_pdf1 upload_pdf2
                                                    Ext.Msg.alert('Warning', 'คุณกำลังจะส่งรายการส่งเบิก ? กรุณาอัพโหลดไฟล์เอกสารให้ครบถ้วน');
                                                    Ext.getCmp('upload_pdf1').show();
                                                    Ext.getCmp('upload_pdf2').show();
                                                    Ext.url_post = "http://" + location.host.slice(0, -5) + "/NMU/po/reg/controller/mnPoWorkingHdrBeginSupplies.php";
                                                    
                                                } else {
                                                    Ext.getCmp('upload_pdf1').hide();
                                                    Ext.getCmp('upload_pdf2').hide();
                                                    Ext.url_post = "../po/reg/controller/mnPoWorkingHdrBeginSupplies_PR.php";
                                                }
                                                Ext.getCmp(Ext.poFormID).getForm().url = Ext.url_post;
    //                                          console.log(Ext.url_post);
    //                                          console.log(Ext.getCmp(Ext.poFormID).getForm()); 
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
            url: "../po/api/List_poRequest_PR.php",
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
                {name: "sp_tor_id"},
                {name: "i_is_withdraw"},
                {name: "po_working_hdr_id"},
                {name: "pr_code"},
                {name: "sp_tor_id"},
                {name: "sp_gl_monthly_hdr_id"},
                {name: "d_receive_date"},
                {name: "bg_reserve_money1_id"},
                {name: "c_contract_code"},
                {name: "sp_withdraw_id"},
                {name: "i_yyyy"}, {name: "now_yyyy"},
                {name: "i_yyyy_overlap"},
                {name: "dc_expense_budget_type_id"},
                {name: "sp_emp_id"},
                {name: "sp_emp_name"},
                {name: "c_qty"},
                {name: "c_invoice"},
                {name: "dc_cost_id"},
                {name: "f_total"},
                {name: "i_pr_type1"},
                {name: "sp_tor_contract_id"},
                {name: "sp_check_period_hdr_id"},
    
                {name: "url"},
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
                {name: "c_arrive_code"}, //c_arrive_code
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
                {name: "sp_po_id", type: "int"},
                {name: "i_period", type: "int"},
                {name: "f_total_amt", type: "string"},
                {name: "d_period_date"}, //d_period_date
                {name: "d_arrive_date"}, //c_arrive_code d_arrive_date
                {name: "c_arrive_code"}, // d_arrive_date
                {name: "c_code_ref"}, // d_arrive_date
    
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
                                                                    if (Ext.selectRow.get("po_working_status") == 0)
                                                                        Ext.getCmp("buSaveSubID").show();
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
                new Ext.grid.RowNumberer({width: 35, header: " ที่ ", dataIndex: "no"}),
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
                        } else {
                            return  value;
                        }
                    }, 
                }, 
                {
                    header: "เลขที่ใบเบิกใหม่",sortable: false,align: "left",dataIndex: "working_code",hidden: true,},
                { header: "เลขที่ PR", align: "left", width: 100, dataIndex: "pr_code"}, //c_arrive_code 
                // {header: "สัญญา", align: "left", width: 55, dataIndex: "c_contract_code"}, //c_arrive_code
    
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
                    header: "เอกสานประกอบใบเบิก",
                    sortable: false,
                    width: 80,
                    align: "center",
                    dataIndex: "c_file_pdf_dtl",
                    editor: new Ext.form.TextField({}),
                    renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                        var BtnText = "<img src='../images/icons/page_white_acrobat.png' style='margin-right:1px;' /><div><spen style='font-size:11px'>&nbspเอกสานประกอบใบเบิก</spen>";
                
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
    //                         {
    //                             text: "เพิ่มไฟล์PDF",
    //                             icon: "../images/icons/icon_pdf.png",
    //                             handler: function (e) {
    //                                 Ext.buAct = "FlowcartLv1";
    //                                 winPdf(Ext.selectRow);
    // //                                var linkDownload = window.location.protocol + '//' + window.location.hostname + '/sp_mn/api/upload/';
    // //                                if (Ext.isEmpty(Ext.selectRow))
    // //                                    Ext.MessageBox.alert("แจ้งเตือน", "กรุณากดเลือกข้อมูลที่จะแสดง/ออกเลข PR ก่อน");
    // //                                    window.open(linkDownload + Ext.selectRow.get('c_code') + '.pdf', 'Monitoring', 'fullscreen="yes"');
    //                             },
    //                             scope: this,
    //                         },
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
                                    /*   Ext.Ajax.request({
                                            url: "tor/api/mnCheckCode.php",
                                            method: "POST",
                                            params: {
                                                mode: "GENCODECHECKING",
                                                sp_withdraw_id: record.data.id,
                                                sp_tor_id : record.json.id,
                                                // console.log()
                                                i_is_warranty: record.data.i_is_warranty
                                            },
                                            success: function (result, request) {
                                                console.log(result);
                                                if (result.statusText) {
                                                    Ext.Msg.alert("แจ้งเตือน", "ออกเลขเรียบร้อยแล้ว");
                                                }
                                                Ext.getCmp("gridSub2ID").getStore().reload();
                                                Ext.getCmp("winChequeID").getEl().unmask();
                                            },
                                            failure: function (result, request) {
                                                Ext.MessageBox.alert("Failed", result.responseText);
                                            }
                                        });*/
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
                    //console.log(record.data.i_status_checking+ ' === ' +record.data.i_status_checking); 
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
    //            },
    //            {
    //                xtype: "button",
    //                iconCls: "icon-excel",
    //                text: "นำเข้า xls",
    //                handler: function () {
    //
    //                },
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
    
    