Ext.runStatus = function (menu) {
    return Ext.apply({
        name: menu,
        process: function (menuCode, record) {
            Ext.Ajax.request({
                url: "tor/api/mnTorController.php",
                params: {
                    mode: "UPDATENEXTSTEP_PR",
                    menuCode: menuCode,
                    tor_status_id: record.get("tor_status_id"),
                    tor_type_id: record.get("tor_type_id"),
                    i_is_more: record.get("i_is_more"),
                    sp_tor_contract_id: record.get("sp_tor_contract_id"),
                    sp_check_period_hdr_id: record.get("sp_check_period_hdr_id"),
                    typeItems: Ext.typeItems,
                    i_entrance: Ext.menu_i_entrance,
                    id: record.get("id")
                },
                method: "POST", //GET
                success: function (result, request) {
                    var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                    if (jsonData.success) {
                        Ext.MessageBox.alert("Success", jsonData.msg, function () {
                            Ext.getCmp("tabpanel1").getStore().reload();
                            Ext.getCmp("win-processID").hide(); // hidden window-panel
                            Ext.getCmp("win-processID").destroy(); // clear memory :: garbage collection
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
};
function updateBookingContract(id, bg_reserve_money_id, ii) {
    //                            alert(id+' > '+bg_reserve_money_id+' > '+ii);
    //                            return false;
                // if (ii == 1) {
                    Ext.Ajax.request({
                        url: "tor/api/mnTorController.php",
                        params: {
                            mode: "UPDATE_CONTRACT_BG", //UPDATE_TOR_DTL_BG
                            sp_tor_contract_id: id, //sp_dtl_id
                            bg_reserve_money1_id: bg_reserve_money_id,
                            i_pr_type1: Ext.selectRow.get('i_pr_type1'),
                            f_type_amt: Ext.selectRow.get('f_type_amt'),
                            ii: ii
                        },
                        method: "POST", //POST
                        success: function (result, request) {
                            Ext.storeDtl.reload();
                            // Ext.getCmp('winDcExpTypeDddID').destroy();
                            // Ext.getCmp(Ext.poFormID).destroy();
                        },
                        failure: function (result, request) {
                            Ext.MessageBox.alert("Failed", result.responseText); // connect error
                        },
                    });
            }
//*******************************************  จองเงินสัญญา  (เปิด) *****************************************************************************************

function genBookBg(v, i) {
    var ii = i;
    //  var ip = 'localhost';  // 192
    var ip = Ext.session.ip_booking;// 192
    var dc_budget_type_id = 0;
    var i_pr_type1 = 0;

    i_pr_type1 = Ext.selectRow.get('i_pr_type1');
    dc_budget_type_id = Ext.selectRow.get('dc_expense_budget_type_id');

    var link = Ext.session.IPAPIBG + '/?/bg/mn_BgReserveMoney/mode/POST'
            + '/i_sys/1'
            + '/pr_id/' + Ext.selectRow.get('id')
            + '/po_id/' + Ext.selectRow.get('sp_tor_contract_id')
            + '/chk_id/0'
            + '/i_year/' + Ext.selectRow.get('i_yyyy')
            + '/i_pr_type/' + i_pr_type1  //  plan or period
            + '/i_reserve/2' // step 1 PR step 2 po step3 checking
            + '/dc_cost_id/' + Ext.selectRow.get('dc_cost_id')
            + '/dc_budget_type_id/' + dc_budget_type_id
            + '/bg_expense_id/' + Ext.selectRow.get('po_expense_id')
            + '/i_last/' + ((Ext.selectRow.get('i_type_contract') == 3) ? 0 : 1)
            + '/f_amt/' + Ext.selectRow.get('f_type_amt') ;
            // Ext.getCmp('f_type_amtID').getValue(), 1
//     alert(Ext.selectRow.get('i_type_contract'));
//     alert(ii);
//     return false;
    Ext.Ajax.request({
        url: link,
        method: "GET", //POST
        disableCaching: false,
        success: function (result, request) {
            var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
//                    console.log(jsonData);
            if (jsonData.success) {

                Ext.MessageBox.alert("Success", "ทำการเรียบร้อยแล้ว", function () {
                    updateBookingContract(Ext.selectRow.get('sp_tor_contract_id'), jsonData.bg_reserve_money_id, ii);
                    // if (columnIndex === grid.getColumnModel().getIndexById("bookingID")) {
                        //Override   
                        //step 1 
                        Ext.getCmp('winChequeID').getEl().mask("ที่เรียกดู ณ ขณะนี้...","x-mask-loading");  
                        //step 2  
                        Ext.storeDtl.setBaseParam("submode", "sleep");
                        Ext.storeDtl.reload({
                            callback: function (record, operation, success) {
                                    if (success) { 
                        //step 3                 
                                        Ext.each(record, function(value) {  
                        //step 4       
                                            if (Ext.selectRow.get('id') === value.get('id')){ 
                                                Ext.selectRow = value;  
                                                    Ext.getCmp('winChequeID').destroy();
                                                    Ext.buAct = "update";
                                                    Ext.loadStore("edit", true);
                                                    //Ext.getCmp('winChequeID').getEl().unmask();
                                            }
                                        });
                        //step 5           
                                    }
                            }
                        }); 
                        //Override   
                    // }
                });
            } else {
                Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                // Ext.getCmp('formDcExpTypeDddID').getEl().unmask();
                // return false; 
            }
        },
        failure: function (result, request) {
            Ext.MessageBox.alert("Failed", result.responseText); // connect error
            Ext.getCmp('formDcExpTypeDddID').getEl().unmask();
            // return false; 
        },
    });
    return link;
}
//*******************************************  จองเงินสัญญา (ปิด) *****************************************************************************************


//******************************************* เช็คและขอเงินรับจริงที่ 1  *****************************************************************************************
Ext.genLink = function (i, f) {
    //winPeriodHdrID
    Ext.getCmp("winChequeID").getEl().mask("Please wait...", "x-mask-loading");
    // Ext.getCmp('winChequeID').getEl().mask("ที่เรียกดู ณ ขณะนี้...","x-mask-loading");  
    var link = '';
    var ip = Ext.session.ip_booking;// 192
    // var ip = 'localhost';

    if (i === 1) { //get Money 
        link = Ext.session.IPAPIBG +  "/?/bg/BgBudgetAllSupplies" +
                "/i_year/" +  Ext.selectRow.get('i_yyyy') +
                "/dc_budget_type_id/" + Ext.selectRow.get('dc_expense_budget_type_id') +
                "/dc_cost_id/" +  Ext.selectRow.get('dc_cost_id') +
                "/bg_expense_id/" + Ext.selectRow.get('po_expense_id') ;

    } else if (i === 2) { // Req Money
        link = Ext.session.IPAPIBG +  '/?/bg/mn_BgRequestMoneyIncome/mode/POST'
                + '/i_sys/1'
                + '/chk_id/' + Ext.record.get("sp_check_period_hdr_id") //checking
                + '/i_year/' + Ext.selectRow.get('i_yyyy')
                + '/i_request/1' // step 1 PR step 2 po step3 checking
                + '/dc_cost_id/' + Ext.selectRow.get('dc_cost_id')
                + '/dc_budget_type_id/' +Ext.selectRow.get('dc_expense_budget_type_id')
                + '/bg_expense_id/' + Ext.selectRow.get('po_expense_id')
                + '/f_amt/' + f;

    }
    return link;
};
Ext.getMoney = function (record) {

    Ext.perioidHdr = record;
    var link = Ext.genLink(1, 0);
    Ext.Ajax.request({
        url: link, //record,linkGetMoney
        method: "GET", //POST
        disableCaching: false,
        success: function (result, request) {
            var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
            var cheVal = parseFloat(Ext.selectRow.get('f_type_amt').replaceAll(",", ""));
            var f_total_income = parseFloat(jsonData.data[0].f_total_income.replace(/\,/g,'')); 

            if (f_total_income >= cheVal) {
                Ext.Ajax.request({
                    url: "tor/api/mnPeriodController.php",
                    method: "POST",
                    params: {
                        mode: "UP_CHECK_INCOME",
                        sp_check_period_hdr_id: record.get("sp_check_period_hdr_id"), //hdr_peirod_id
                        request_money_income : 1
                    },
                    success: function (result, request) {
                        let json = Ext.util.JSON.decode(result.responseText);
                    },
                    failure: function (result, request) {
                        Ext.MessageBox.alert("Failed", result.responseText);
                    }
                }); 
                Ext.MessageBox.alert("Success", "เงินที่จะเบิกมีเพียงพอ", function () {
                    // Ext.get('checkMoneyID').update('เงินที่จะเบิกมีเพียงพอ');
                    //step 2  
                            Ext.storeDtl.setBaseParam("submode", "sleep");
                            Ext.storeDtl.reload({
                                callback: function (record, operation, success) {
                                        if (success) { 
                            //step 3                 
                                            Ext.each(record, function(value) {  
                            //step 4       
                                                if (Ext.selectRow.get('id') === value.get('id')){ 
                                                    Ext.selectRow = value;  
                                                        Ext.getCmp('winChequeID').destroy();
                                                        Ext.buAct = "update";
                                                        Ext.loadStore("edit", true);
                                                        //Ext.getCmp('winChequeID').getEl().unmask();
                                                }
                                            });
                            //step 5           
                                        }
                                }
                            }); 
                            //Override  
                });

            } else {
                // alert('เงินรายได้รับจริง ไม่พอดำเนินการตรวจรับ ' + f_total_income);
                Ext.Ajax.request({
                    url: "tor/api/mnPeriodController.php",
                    method: "POST",
                    params: {
                        mode: "UP_CHECK_INCOME",
                        sp_check_period_hdr_id: record.get("sp_check_period_hdr_id"), //hdr_peirod_id
                        request_money_income : 2
                    },
                    success: function (result, request) {
                        let json = Ext.util.JSON.decode(result.responseText);
                    },
                    failure: function (result, request) {
                        Ext.MessageBox.alert("Failed", result.responseText);
                    }
                }); 
                Ext.MessageBox.alert("Success", "เงินรายได้รับจริงไม่พอ ระบบได้ดำเนินการร้องของเงินแล้ว ให้ดำเนินการตรวจรับต่อ", function () {
                    Ext.reqMoney(11, 1, cheVal); //id,req_time,f_req
                                    //step 2  
                                    Ext.storeDtl.setBaseParam("submode", "sleep");
                                    Ext.storeDtl.reload({
                                        callback: function (record, operation, success) {
                                                if (success) { 
                                    //step 3                 
                                                    Ext.each(record, function(value) {  
                                    //step 4       
                                                        if (Ext.selectRow.get('id') === value.get('id')){ 
                                                            Ext.selectRow = value;  
                                                                Ext.getCmp('winChequeID').destroy();
                                                                Ext.buAct = "update";
                                                                Ext.loadStore("edit", true);
                                                                //Ext.getCmp('winChequeID').getEl().unmask();
                                                        }
                                                    });
                                    //step 5           
                                                }
                                        }
                                    }); 
                                    //Override 
                });
            }

            return false;
        },
        failure: function (result, request) {
            Ext.MessageBox.alert("Failed", result.responseText); // connect error
        },
    });
};

Ext.reqMoney = function (id, req, f) {
    var link = Ext.genLink(2, f);
//    Ext.getCmp("winSearchFrm").getEl().unmask();
//    return false;
    Ext.Ajax.request({
        url: link, //record,linkGetMoney
        method: "GET", //POST
        disableCaching: false,
        success: function (result, request) {
            var jsonData = Ext.util.JSON.decode(result.responseText); //decode json 
            Ext.upMoneyId(Ext.perioidHdr.get('id'), 1, Ext.perioidHdr.get('f_total_amt'), jsonData.bg_request_money_income_id);
            console.log(Ext.upMoneyId(Ext.perioidHdr.get('id'), 1, Ext.perioidHdr.get('f_total_amt'), jsonData.bg_request_money_income_id));
        },
        failure: function (result, request) {
            Ext.MessageBox.alert("Failed", result.responseText); // connect error
        },
    });
};

Ext.upMoneyId = function (id, req, f, bgid) {
    // alert(' update id ' + id + ' req ' + req + ' f = ' + f + ' update bgid ' + bgid);
    Ext.Ajax.request({
        url: "tor/api/mnPeriodController.php",
        method: "POST",
        params: {
            mode: "UP_BG_PERIOD_HDR",
            id: Ext.perioidHdr.get('sp_tor_hdr_period_id'), //hdr_peirod_id
            sp_check_period_hdr_id: Ext.perioidHdr.get('id'), //checking_hdr_id
            f_amt: f,
            bg_reserve_money_id: bgid
        },
        success: function (result, request) {
            let json = Ext.util.JSON.decode(result.responseText);
        },
        failure: function (result, request) {
            Ext.MessageBox.alert("Failed", result.responseText);
        }
    });
};
//******************************************* เช็คเงินรับจริงที่ 1  *****************************************************************************************




//******************************************* ขอเงินรับจริงที่  2  + ตรวจรับ เปิด *****************************************************************************************

Ext.upMoneyId2 = function (id, req, f, bgid) {
    // alert(' update id ' + id + ' req ' + req + ' f = ' + f + ' update bgid ' + bgid);

    Ext.Ajax.request({
        url: "tor/api/mnPeriodController.php",
        method: "POST",
        params: {
            mode: "UP_BG_CHECKING_HDR",
            id: Ext.record.get("sp_check_period_hdr_id"), //checking_hdr_id
            sp_check_period_hdr_id: Ext.record.get("sp_check_period_hdr_id"), //checking_hdr_id
            // sp_check_period_hdr_id: Ext.perioidHdr.get('id'), //checking_hdr_id
            request_money_income : 3,
            f_amt: f,
            bg_reserve_money_id: bgid
        },
        success: function (result, request) {

            Ext.getCmp("winChequeID").getEl().unmask();
            let json = Ext.util.JSON.decode(result.responseText);

            if (request.success) {
                Ext.getCmp("winChequeID").hide();
                Ext.getCmp("winChequeID").destroy();
            }
        },
        failure: function (result, request) {
            Ext.MessageBox.alert("Failed", result.responseText);
        }
    });
};
Ext.reqMoney2 = function (id, req, f) {
    var link = Ext.genLinkCheck(2, f);
//    Ext.getCmp("winSearchFrm").getEl().unmask();
//    return false;
    Ext.Ajax.request({
        url: link, //record,linkGetMoney
        method: "GET", //POST
        disableCaching: false,
        success: function (result, request) {
            var jsonData = Ext.util.JSON.decode(result.responseText); //decode json 
            Ext.upMoneyId2(Ext.record.get("sp_check_period_hdr_id"), 1, Ext.selectRow.get('f_type_amt'), jsonData.bg_request_money_income_id);
        },
        failure: function (result, request) {
            Ext.MessageBox.alert("Failed", result.responseText); // connect error
        },
    });
};

Ext.getMoneyCheck = function (rs) {
    Ext.perioidHdr = rs;
    var link = Ext.genLinkCheck(1, 0);
    Ext.getCmp("winChequeID").getEl().mask("Please wait...", "x-mask-loading");
//    alert(link);
//    return false;
    Ext.Ajax.request({
        url: link, //record,linkGetMoney
        method: "GET", //POST
        disableCaching: false,
        success: function (result, request) {
            var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
            var cheVal = parseFloat(Ext.selectRow.get('f_type_amt').replace(/\,/g,''));
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
                        if (Ext.storeBg.data.items[0].get("bg_checking_money_income_id") == 0) {
                            Ext.reqMoney2(11, 1, cheVal); //id,req_time, f_req 
                        } else {
                            //step 2  
                            Ext.storeDtl.setBaseParam("submode", "sleep");
                            Ext.storeDtl.reload({
                                callback: function (record, operation, success) {
                                        if (success) { 
                            //step 3                 
                                            Ext.each(record, function(value) {  
                            //step 4       
                                                if (Ext.selectRow.get('id') === value.get('id')){ 
                                                    Ext.selectRow = value;  
                                                        Ext.getCmp('winChequeID').destroy();
                                                        Ext.buAct = "update";
                                                        Ext.loadStore("edit", true);
                                                        //Ext.getCmp('winChequeID').getEl().unmask();
                                                }
                                            });
                            //step 5           
                                        }
                                }
                            }); 
                            //Override 
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
Ext.genLinkCheck = function (i, f) {
    //winPeriodHdrID
    Ext.getCmp("winChequeID").getEl().mask("Please wait...", "x-mask-loading");
    var link = '';
    var ip = Ext.session.ip_booking;// 192

    // var ip = 'localhost';

    if (i === 1) { //get Money 
        link = Ext.session.IPAPIBG +  "/?/bg/BgBudgetAllSupplies" +
                "/i_year/" + Ext.selectRow.get('i_yyyy') +
                "/dc_budget_type_id/" + Ext.selectRow.get('dc_expense_budget_type_id') +
                "/dc_cost_id/" + Ext.selectRow.get('dc_cost_id') +
                "/bg_expense_id/" + Ext.selectRow.get('po_expense_id');

    } else if (i === 2) { // Req Money
        link = Ext.session.IPAPIBG +  '/?/bg/mn_BgRequestMoneyIncome/mode/POST'
                + '/i_sys/1'
                + '/chk_id/' + Ext.record.get("sp_check_period_hdr_id")  //checking
                + '/i_year/' + Ext.selectRow.get('i_yyyy')
                + '/i_request/2' // step 1 PR step 2 po step3 checking
                + '/dc_cost_id/' + Ext.selectRow.get('dc_cost_id')
                + '/dc_budget_type_id/' + Ext.selectRow.get('dc_expense_budget_type_id') //
                + '/bg_expense_id/' + Ext.selectRow.get('po_expense_id')
                + '/f_amt/' + Ext.selectRow.get('f_type_amt');

    } else if (i === 3) {

        //pr_id/undefined/po_id/201/chk_id/1/i_year/2023/i_pr_type/undefined
        link = Ext.session.IPAPIBG +  '/?/bg/mn_BgReserveMoney/mode/POST'
                + '/i_sys/1'
                + '/pr_id/' + Ext.selectRow.get('id')
                + '/po_id/' +  Ext.selectRow.get('sp_tor_contract_id')
                + '/chk_id/' + Ext.record.get("sp_check_period_hdr_id")
                + '/i_year/' + Ext.selectRow.get('i_yyyy')
                + '/i_pr_type/' + Ext.selectRow.get('i_pr_type1')
                + '/i_reserve/3'
                + '/dc_cost_id/' + Ext.selectRow.get('dc_cost_id')
                + '/dc_budget_type_id/' + Ext.selectRow.get('dc_expense_budget_type_id')
                + '/bg_expense_id/' + Ext.selectRow.get('po_expense_id')
                + '/i_last' + '/' +  1 
                + '/f_amt/' + Ext.selectRow.get('f_type_amt');
    }
    return link;
};
Ext.auditBoong = function (i) {
    var link = Ext.genLinkCheck(3, 0);
    Ext.Ajax.request({
        url: link, //record,linkGetMoney
        method: "GET", //POST
        disableCaching: false,
        success: function (result, request) {
            var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
            if (jsonData.success){
                Ext.MessageBox.alert("Success", "เรียบร้อยแล้ว", function () {
                    Ext.upMoneyCheckingId(jsonData.bg_reserve_money_id);
                });
            } else {
                Ext.MessageBox.alert("Failed", "ข้อมูลผิดพลาด ติดต่อ admin <br>" + jsonData.msg)
            }
            return false;
        },
        failure: function (result, request) {
            Ext.MessageBox.alert("Failed", result.responseText); // connect error
        },
    });
}
Ext.upMoneyCheckingId = function (id, req, f, bgid) {
    // alert(' update id ' + id + ' req ' + req + ' f = ' + f + ' update bgid ' + bgid);

    Ext.Ajax.request({
        url: "tor/api/mnPeriodController.php",
        method: "POST",
        params: {
            mode: "UP_BG_CHECKING_BOOKING_HDR",
            // id: Ext.perioidHdr.get('sp_tor_hdr_period_id'), //hdr_peirod_id
            sp_check_period_hdr_id: Ext.record.get("sp_check_period_hdr_id"), //checking_hdr_id
            id: Ext.record.get("sp_check_period_hdr_id"), //checking_hdr_id
            f_amt: f,
            bg_checking_money_id: id
        },
        success: function (result, request) {

            // Ext.getCmp("winPeriodHdrID").getEl().unmask();
            // let json = Ext.util.JSON.decode(result.responseText);
            // Ext.genCode();
//            if (request.success) {
//                Ext.getCmp("winPeriodHdrID").hide();
//                Ext.getCmp("winPeriodHdrID").destroy();
//            }
                        //step 2  
                        Ext.storeDtl.setBaseParam("submode", "sleep");
                        Ext.storeDtl.reload({
                            callback: function (record, operation, success) {
                                    if (success) { 
                        //step 3                 
                                        Ext.each(record, function(value) {  
                        //step 4       
                                            if (Ext.selectRow.get('id') === value.get('id')){ 
                                                Ext.selectRow = value;  
                                                    Ext.getCmp('winChequeID').destroy();
                                                    Ext.buAct = "update";
                                                    Ext.loadStore("edit", true);
                                                    //Ext.getCmp('winChequeID').getEl().unmask();
                                            }
                                        });
                        //step 5           
                                    }
                            }
                        }); 
                        //Override 
        },
        failure: function (result, request) {
            Ext.MessageBox.alert("Failed", result.responseText);
        }
    });
};
//******************************************* ขอเงินรับจริงที่  2  + ตรวจรับ ปิด *****************************************************************************************

Ext.AppConfig = function () {
    Ext.user_right_add = user_right_add;
    Ext.user_right_edit = user_right_edit;
    Ext.user_right_delete = user_right_delete;
    Ext.title = Ext.menu_name + " " + Ext.menu_code;
    Ext.typeItems = Ext.menu_i_config;
    //Ext.menu_i_entrance;
    Ext.HDR_ID = null;
    Ext.selectRow = [];
    Ext.menuEditGrid = true;
    Ext.menuRightEditgrid = true;
    Ext.tor_type_id = 1; // default start เจาะจงน้อวกว่า 5 แสน
    Ext.i_is_more = 0;
    Ext.tor_type_idTxt = Ext.apply({
        tor_type_id1: {
            0: "แบบมี หัวงาน/ฝ่ายพิจารณาผล(ไม่เกิน 5 แสนบาท)",
            1: "แบบมีคณะกรรมการพิจารณาผล(เกิน 5 แสนบาท)",
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
    function winProcess(rec) {
        new Ext.Window({
            id: "win-processID",
            title: "ผ่านรายการ PR",
            modal: true,
            resizable: false,
            width: 450,
            layout: "form",
            bodyStyle: "padding:3px;",
            items: [
                {
                    xtype: "displayfield",
                    fieldLabel: "ผ่านการสถานะของ",
                    value: "<b style='font-size:16px;'> " + rec.get("c_code") + " ?</b>",
                },
                {
                    xtype: "hidden",
                    name: "typeItems",
                    value: Ext.typeItems,
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
//                            checked: true,
                            inputValue: "GOTOSTEP",
                            checked: true,
                            boxLabel: "ผ่านรายการ <img src='../images/icons/accept.png'>",
                        },
                        {
                            name: "mode",
                            inputValue: "BACKSTEP",
                            boxLabel: "ส่งผ่านสถานะแก้ไข <img src='../images/icons/time_red.png'>",
                        },
                    ],
                    listeners: {
                        change: function (cb, nv, ov) {
                            if (Ext.getCmp('modesubID').getValue().inputValue == "BACKSTEP") {
                                Ext.getCmp("reasonID").show();
                            } else {
                                if (rec.data.c_comment_status == "") {
                                    Ext.getCmp("reasonID").hide();
                                }
                            }
                        },
                        afterrender: function () {
                            if (rec.data.c_comment_status == "") {
                                Ext.getCmp('modesubID').items.items[0].setValue(true);
                            }  /*else{
                             Ext.getCmp('modesubID').items.items[1].setValue(true);
                             }*/
                        },
                    },
                },
                {
                    fieldLabel: "เหตุผลการรอ",
                    xtype: "textarea",
                    name: "reason",
                    width: 250,
                    id: "reasonID",
                    listeners: {
                        afterrender: function () {
                            Ext.getCmp('reasonID').setValue(rec.data.c_comment_status);
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
                        if (Ext.getCmp('modesubID').getValue().inputValue == "GOTOSTEP") {
                            if (rec.get("i_is_more") == 0 && !Ext.isEmpty(Ext.menuCode1)) {
                                Ext.status.process(Ext.menuCode1, rec);
                            } else {
                                Ext.status.process(Ext.menuCode, rec);
                            }
                        } else if (Ext.getCmp('modesubID').getValue().inputValue == "BACKSTEP") {
                            var msg = "";
                            if (Ext.getCmp('reasonID').getValue() == "") {
                                msg += "<span style='white-space: nowrap;'>- กรุณากรอกเหตุผลการรอ</span><br>";
                            }
                            if (msg == "") {
                                Ext.Ajax.request({
                                    url: "tor/api/mnTorController.php",
                                    params: {
                                        mode: "BACKSTEP",
                                        tor_status_id: rec.data.tor_status_id,
                                        c_comment: Ext.getCmp('reasonID').getValue(),
                                        id: rec.data.id
                                    },
                                    method: "POST", //GET
                                    success: function (result, request) {
                                        var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                                        if (jsonData.success) {
                                            Ext.MessageBox.alert("Success", jsonData.msg, function () {
                                                Ext.getCmp("tabpanel1").getStore().reload();
                                                Ext.getCmp("win-processID").hide(); // hidden window-panel
                                                Ext.getCmp("win-processID").destroy(); // clear memory :: garbage collection
                                            });
                                        } else {
                                            Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                                        }
                                    },
                                    failure: function (result, request) {
                                        Ext.MessageBox.alert("Failed", result.responseText); // connect error
                                    }
                                });
                            } else {
                                Ext.Msg.alert("แจ้งเตือน", msg);
                            }
                        }
                    }
                },
                {
                    text: Ext.GLOBAL_BU_BACK_TH,
                    iconCls: "icon-clear",
                    handler: function () {
                        Ext.getCmp("win-processID").destroy(); // clear memory :: garbage collection
                    }
                }
            ]
        }).show();
    }
    Ext.realTimeSentMsg = function (id, textSent) {
        var wsUri = "ws://" + window.parent.Ext.ipServer + ":9000/demo/server.php";

        websocket = new WebSocket(wsUri);
        websocket.onopen = function (ev) { // connection is open   
            var msg = {
                message: textSent,
                name: id,
                color: '#007AFF'
            };
            websocket.send(JSON.stringify(msg));
        };
        //End Sent 
    };
    function controller(rec, status) {
        if (status == "processUpdate") {
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
            else
                winProcess(rec);
            //             Ext.Msg.show({
            //                 title: 'ประมวลผล TOR',
            //                 msg: 'คุณต้องการผ่านรายการ ' + rec.get('c_code') + ' สถานะเมนู ' + Ext.menuCode + ' ?',
            //                 width: 440,
            //                 icon: Ext.MessageBox.QUESTION,
            //                 buttons: Ext.MessageBox.YESNO,
            //                 fn: function (btn) {
            //                     if (btn === 'yes')
            //                         Ext.status.process(Ext.menuCode, rec);
            //                     else
            //                         null;
            //                 }
            //             });
        }
    } // Controller
    function cellClick(grid, rowIndex, columnIndex, e) {
        var record = grid.getStore().getAt(rowIndex);
        Ext.selectRow = record;

        if (columnIndex === grid.getColumnModel().getIndexById("processDueID")) {
            if (Ext.selectRow.data.index_receive == 0) {
                Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>กรุณาบันทึกรายการกรอกเลขสารบัญรับก่อนผ่านรายการ</span><br>", function (bu, action) {
                    return false;
                });
                return
            }
            if (Ext.selectRow.data.i_is_register == 0) {
                Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>กรุณาบันทึกรายการก่อนผ่านรายการ</span><br>", function (bu, action) {
                    return false;
                });
                return
            } else if (Ext.selectRow.data.tor_status_id == 11) {
                // ประกาศผลผู้ชนะ ST0007
                var count_data = new Ext.data.JsonStore({
                    root: "data",
                    autoLoad: true,
                    url: "tor/api/mnTorController.php",
                    baseParams: {mode: "TOR_VICTORY", sp_tor_id: Ext.selectRow.data.id},
                    fields: [{name: "sp_tor_contract_id"}],
                });
                if (count_data.fields.length < 1) {
                    Ext.Msg.alert("แจ้งเตือน", "รายการนี้ยังไม่ได้เพิ่มผู้ชนะ", function (bu, action) {
                        return false;
                    });
                    return;
                }
            } else if (Ext.selectRow.data.tor_status_id == 20) {
                // ร่างสัญญา ST0008
                var count_data = new Ext.data.JsonStore({
                    root: "data",
                    // autoLoad: true,
                    url: "tor/api/mnTorController.php",
                    baseParams: {mode: "LISTCREDITOR", tor_id: Ext.selectRow.data.id},
                    fields: [{name: "sp_tor_contract_id"}],
                });
                count_data.reload({
                    callback: function (recordx, operation, success) {
                        if (success) {
                            if (count_data.data.length < 1) {
                                Ext.Msg.alert("แจ้งเตือน", "รายการนี้ยังไม่ได้เพิ่มสัญญา", function (bu, action) {
                                    return false;
                                });
                                Ext.EnableProcess = 0;
                                return;
                            } else {
                                Ext.EnableProcess = 1;
                                for (var i = 1; count_data.data.length >= i; i++) {
                                    if (count_data.data.items[i - 1].json.c_code == "") {
                                        Ext.EnableProcess = 0;
                                    }
                                }
                                if (Ext.EnableProcess == 1) {
                                    controller(Ext.selectRow, "processUpdate"); //on
                                } else {
                                    Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>กรุณาออกเลข สัญญาหรือใบสั่งก่อนผ่านรายการ</span><br>", function (bu, action) {
                                        return false;
                                    });
                                }
                            }
                        }
                    }
                });
            } else if (Ext.selectRow.data.bg_checking_money_id == 0 ){
                Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>ยังไม่ได้ทำการจองเงิน</span><br>", function (bu, action) {
                    return false;
                });
                return
            }
            // console.log(Ext.selectRow.data);
            if (Ext.selectRow.data.tor_status_id != 20) {
                controller(Ext.selectRow, "processUpdate"); //on
            }
        }
    }
    var tab2 = new Ext.FormPanel({
        //labelAlign: 'top',
        title: "รายละเอียดของ PR",
        bodyStyle: "padding:5px",
        layout: "fit",
        width: 600,
        items: [
            {
                height: 200,
                layout: "column",
                border: false,
                items: [
                    {
                        columnWidth: 0.5,
                        layout: "form",
                        border: true,
                        items: [
                            {
                                xtype: "textfield",
                                fieldLabel: "First Name",
                                name: "first",
                                anchor: "50%",
                            },
                            {
                                xtype: "textfield",
                                fieldLabel: "Company",
                                name: "company",
                                anchor: "50%",
                            },
                        ],
                    },
                    {
                        columnWidth: 0.5,
                        layout: "form",
                        border: true,
                        items: [
                            {
                                xtype: "textfield",
                                fieldLabel: "Last Name",
                                name: "last",
                                anchor: "50%",
                            },
                            {
                                xtype: "textfield",
                                fieldLabel: "Email",
                                name: "email",
                                vtype: "email",
                                anchor: "50%",
                            },
                        ],
                    },
                ],
                buttonAlign: "left",
                buttons: [
                    {
                        text: "Save",
                    },
                    {
                        text: "Cancel",
                    },
                ],
            },
            {
                xtype: "tabpanel",
                plain: true,
                activeTab: 0,
                height: 235,
                deferredRender: false,
                defaults: {bodyStyle: "padding:10px"},
                items: [
                    {
                        title: "Personal Details",
                        layout: "form",
                        defaults: {width: 230},
                        defaultType: "textfield",

                        items: [
                            {
                                fieldLabel: "First Name",
                                name: "first",
                                allowBlank: false,
                                value: "Jack",
                            },
                            {
                                fieldLabel: "Last Name",
                                name: "last",
                                value: "Slocum",
                            },
                            {
                                fieldLabel: "Company",
                                name: "company",
                                value: "Ext JS",
                            },
                            {
                                fieldLabel: "Email",
                                name: "email",
                                vtype: "email",
                            },
                        ],
                    },
                    {
                        title: "Phone Numbers",
                        layout: "form",
                        defaults: {width: 230},
                        defaultType: "textfield",

                        items: [
                            {
                                fieldLabel: "Home",
                                name: "home",
                                value: "(888) 555-1212",
                            },
                            {
                                fieldLabel: "Business",
                                name: "business",
                            },
                            {
                                fieldLabel: "Mobile",
                                name: "mobile",
                            },
                            {
                                fieldLabel: "Fax",
                                name: "fax",
                            },
                        ],
                    },
                    {
                        cls: "x-plain",
                        title: "Biography",
                        layout: "fit",
                        items: {
                            xtype: "htmleditor",
                            id: "bio2",
                            fieldLabel: "Biography",
                        },
                    },
                ],
            },
        ],
    });
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
                                {
                                    xtype: "radiogroup",
                                    columns: [120],
                                    fieldLabel: "เลือกดูข้อมูล",
                                    id: "searchPostID1",
                                    // hidden: Ext.session.i_level >= 3 ? true : false,

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
                                Ext.storeDtl.setBaseParam("mode", "LIST");
                                Ext.storeDtl.setBaseParam("act", "SEARCH");
                                Ext.storeDtl.setBaseParam("d_tor_date", Ext.getCmp("sd_tor_dateID").getValue());
                                Ext.storeDtl.setBaseParam("tor_type_id", Ext.getCmp("stor_type_idID").getValue());
                                Ext.storeDtl.setBaseParam("sp_emp_id", Ext.session.sp_emp_id);
                                Ext.storeDtl.setBaseParam("c_code", Ext.getCmp("sc_codeID").getValue());
                                Ext.storeDtl.setBaseParam("c_name", Ext.getCmp("sc_nameID").getValue());
                                Ext.storeDtl.setBaseParam("i_enabled", 1);
                                // Ext.storeDtl.setBaseParam("i_enabled", Ext.getCmp("searchEnabledID").getValue().inputValue);
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
            listeners: {
                afterRender: function (thisForm, options) {
                    new Ext.KeyNav("winSearchFrm", {
                        enter: function (e) {
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
            },
            /*
             items: [{
             text: "ประเภทข้อมูล",
             icon: "../images/icons/application_form_magnify.png",
             menu: {
             items: [
             '<b class="menu-title">  เลือกประเภทข้อมูล </b>',
             {
             text: " เลือกประเภทข้อมูลบันทึกจากระบบเท่านั้น",
             checked: false,
             id: "keyDatat1",
             uri: 1,
             group: "theme",
             checkHandler: onLocationCheck
             },
             {
             text: " เลือกประเภทนำเข้าจากการ import Excel เท่านั้น",
             checked: false,
             uri: 0,
             id: "keyDatat2",
             group: "theme",
             checkHandler: onLocationCheck
             },
             {
             text: " เลือกประเภทข้อมูลที่ทั้งหมด",
             checked: true,
             id: "keyDatat3",
             uri: null,
             group: "theme",
             checkHandler: onLocationCheck
             }
             ]
             }
             }]*/
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
                        })
                        );
        tb.doLayout();
        return tb;
    }; //MenuButton
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
                        width: 120,
                    },
                    {
                        header: "อัพเดทสถานะ",
                        sortable: false,
                        align: "center",
                        dataIndex: "id",
                        id: "processDueID",
                        width: 120,
                        renderer: function (value, metaData, record, row, col, store, gridView) {
//                            metaData.attr = "style='cursor:pointer; text-align:center;';";
                            var BtnText, IconImg;
                            if (record.get("i_is_register") === 0) {
                                BtnText = '&nbspยังไม่บันทึก';
                                IconImg = '../images/icons/application_form.png';
                            } else if (record.get("i_is_register") === 1) {
                                BtnText = '&nbspบันทึกแล้ว';
                                IconImg = '../images/icons/cog_start.png';
                            } else {
                                BtnText = '&nbspยังไม่บันทึก';
                                IconImg = '../images/icons/application_form.png';
                            }
                            var style = 'font-size:12px;border:1px solid #ccc; width:110px; padding:3px 3px 3px 10px; background: #f0f0f0 url(' + IconImg + ') no-repeat 3px center; cursor: pointer;';

                            return '<button style="' + style + '" type="button">' + BtnText + '</button>';
                        },
                    },
                    {
                        header: "เรื่อง/โครงการ",
                        sortable: true,
                        align: "left",
                        dataIndex: "c_name",
                        width: 300,
                    },
                    {
                        header: "ประเภทสัญญ/เงินอุดหนุน",
                        sortable: true,
                        align: "left",
                        dataIndex: "i_type_contract",
                        width: 150,
                        renderer: function (value, metaData, record, row, col, store, gridView) {

                            let val = 0; //bg_check_id
                            if (record.get('i_bg_type') == 1 && record.get('i_is_request') == 0 && record.get('bg_check_id') == 0) {
                                val = 1;
                            } else if (record.get('i_bg_type') == 1 && record.get('i_is_request') == 1 && record.get('bg_check_id') == 0) {
                                val = 2;
                            } else if (record.get('i_bg_type') == 1 && record.get('i_is_request') == 1 && record.get('bg_check_id') > 0) {
                                val = 3;
                            } else if (record.get('i_bg_type') == 1 && record.get('i_is_request') == 2 && record.get('bg_check_id') > 0) {
                                val = 4;
                            }

                            let arrPeriod = [""
                                        , "<font color=red>/ส่งคำขอ<font>"
                                        , "<font color=red>/รออนุมัติฝ่ายจัดสรร<font>"
                                        , "<font color=red>/รอฝ่ายจัดสรร ผ่านรายการ<font>"
                                        , "<font color=red>/ฝ่ายจัดสรรอนุมัติเงินแล้ว<font>"
                            ];

                            let arrContract = [""
                                        , "สัญญา"
                                        , "ใบสั่ง"
                                        , "จะซื้อจะขาย"];

                            return arrContract[value] + arrPeriod[val];

                        }
                    }, {
                        header: "เลขสารบัญรับ",
                        sortable: false,
                        align: "center",
                        dataIndex: "index_receive",
                    },
                    {
                        header: "วันที่ PR",
                        sortable: false,
                        align: "center",
                        hidden: true,
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
                        header: "รหัสเอกสารอ้างอิง",
                        sortable: false,
                        align: "center",
                        dataIndex: "d_doc_ref",
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
                                        text: "รายละเอียดทั้งหมด",
                                        icon: "../images/icons/book_magnify.png",
                                        handler: function (e) {
                                            Ext.buAct = "getDetail";
                                            Ext.getCmp("contenterCenter").add(tab2);
                                            Ext.getCmp("contenterCenter").setActiveTab(tab2);
                                        },
                                        scope: this,
                                        //                                     }, {
                                        //                                         text: "เพิ่มข้อมูล",
                                        //                                         icon: "../images/icons/add.png",
                                        //                                         handler: function (e)
                                        //                                         {
                                        //                                             Ext.buAct = "add";
                                        //                                             Ext.loadStore("add", true); // app,data.load
                                        //                                         },
                                        //                                         scope: this
                                    },
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
                                            window.open(linkDownload + Ext.selectRow.get('c_code') + '.pdf?T=Tap_' + Math.floor(Math.random() * 100000),
                                                    'Monitoring', 'fullscreen="yes"');
                                        },
                                        scope: this, 
                                    }
                                ],
                            });
                        },
                        afterrender: function (g) {
                            //g.getStore().getAt(rowIndex);
                            //  console.log();

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
                    tbar: [
                        {
                            xtype: "button",
                            text: " ค้นหา ",
                            width: 80,
                            iconCls: "icon-application-view-list",
                            handler: function () {
                                if (!Ext.isEmpty(Ext.getCmp("winSearchFrm")))
                                    Ext.getCmp("winSearchFrm").destroy();
                                var s1 = SearchFrm();
                                s1.show();
                                Ext.getCmp("sc_codeID").focus(false, 20);
                            },
                        },
                    ],
                    //tbar: MenuButton(),
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
        fields: ["id", "c_name"],
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
    Ext.storeDtl = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "tor/api/List_TorStep.php",
        baseParams: {
            type: "po_working_dtl1",
            keyData: Ext.keyData,
            i_alarm: Ext.menu_i_alarm,
            i_pa: Ext.menu_i_day,
            i_edit: true,
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
                name: "bg_reserve_money_contract"
            },
            {
                name: "sp_tor_contract_id",
            },
            {
                name: "f_type_amt",
            },
            {
                name: "sp_tor_id",
            },
            {
                name: "i_pr_type1",
            },
            {
                name: "i_step",
            },
            {
                name:"d_doc_arrive_dt",
            },
            {
                name: "contract_no",
            },
            {
                name: "index_receive",
            },
            {
                name: "bg_check_id", type: "int"
            },
            {
                name: "i_type_bg", type: "int"
            },
            {
                name: "i_bg_type", type: "int"
            },
            {
                name: "i_is_request", type: "int"
            },
            {
                name: "dc_emp_id",
            },
            {
                name: "i_receive",
            },
            {
                name: "txtsub_cost",
            },
            {
                name: "dc_emp_name",
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
                name: "d_tor_date_pa",
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
                name: "txtdc_department_idID",
            },
            {
                name: "d_tor_status_date", //
            },
            {
                name: "c_name_status", // d_tor_status_date
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
                name: "i_purchase",
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
                name: "i_is_register",
            },
            {
                name: "i_is_parent",
            },
            {
                name: "i_type_fix_rate",
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
                name: "i_year",
            },
            {
                name: "i_yyyy",
            },
            {
                name: "dc_expense_budget_type_id",
            },
            {
                name: "c_year",
            },
            {
                name: "dc_department_id", },
            {
                name: "sp_emp_id",
            },
            {
                name: "c_department",
            },
            {
                name: "d_doc_ref",

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
                name: "c_comment_status",
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
                name: "i_type_contract",
            },
            {
                name: "i_delivery_date",
            },
            {
                name: "dc_creditor_id",
            },
            {
                name: "dc_creditor_name",
            },
            {
                name : "bg_checking_money_id"
            },
        ],
    });
    /*            
     // "i_hire_type" => $row["i_hire_type"],
     "i_is_inv" => $row["i_is_inv"],
     "i_type_fix_rate" => $row["i_type_fix_rate"],
     "i_product_type" => $row["i_product_type"] 
     */
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
};
Ext.AppUx = function (app, menu) {
    Ext.AppConfig();
    //interlizing
    Ext.menuCode = "ST0117"; //go to 
    Ext.storeDtl.setBaseParam("type", "pr_withdraw"); //set สายงาน
    //
    Ext.status = Ext.runStatus(menu);
    //Load
    var AppPoStore = function (statuss) {
        var comboCost = new Ext.form.ComboBox({
            mode: "local",
            readOnly: true,
            store: Ext.dc_cost,
            anchor: "100%",
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
            store: Ext.dc_cost,
            anchor: "100%",
            readOnly: true,
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
            readOnly: true,
            store: Ext.dc_expense_budget_type,
            fieldLabel: "แหล่งเงิน",
            anchor: "100%",
            submitValue: true,
            name: "dc_expense_budget_type_idTxt",
            hiddenName: "dc_expense_budget_type_id",
            //po_expense_group_id
            valueField: "id",
            displayField: "c_name",
            triggerAction: "all",
            forceSelection: true,
            selectOnFocus: true,
            typeAhead: false,
            emptyText: "กรุณาเลือกแหล่งเงิน...",
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
        var comboUsedBgYear = new Ext.form.ComboBox({
            mode: "local",
            readOnly: true,
            fieldLabel: "ปีงบประมาณ",
            submitValue: true,
            hiddenName: "i_yyyy",
            name: "i_year",
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
            readOnly: true,
            store: Ext.po_expense,
            valueField: "id",
            displayField: "c_name",
            anchor: "100%",
            submitValue: true,
            name: "c_detail",
            hiddenName: "po_expense_id",
            triggerAction: "all",
            allBlank: true,
            forceSelection: true,
            selectOnFocus: true,
            fieldLabel: "รายการย่อย",
            width: 200,
            typeAhead: false,
            emptyText: "กรุณาเลือกใช้จ่าย...",
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
                    console.log(this);
                },
            },
        });


        var xg = Ext.grid;
        var sm = new xg.CheckboxSelectionModel();
        // shared reader
        var reader = new Ext.data.ArrayReader({}, [
            {name: 'company'},
            {name: 'price', type: 'float'},
            {name: 'change', type: 'float'},
            {name: 'pctChange', type: 'float'},
            {name: 'lastChange', type: 'date', dateFormat: 'n/j h:ia'},
            {name: 'industry'},
            {name: 'desc'}
        ]);
// Array data for the grids
        Ext.grid.dummyData = [
            ['สัญญา', 29.01, 0.42, 1.47, '9/1 12:00am', 'Manufacturing'],
            ['งวด/po', 83.81, 0.28, 0.34, '9/1 12:00am', 'Manufacturing'],
            ['ตรวจรับ/เช็คเงิน', 52.55, 0.01, 0.02, '9/1 12:00am', 'Finance']
        ];
// add in some dummy descriptions
        for (var i = 0; i < Ext.grid.dummyData.length; i++) {
            Ext.grid.dummyData[i].push('Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Sed metus nibh, sodales a, porta at, vulputate eget, dui. Pellentesque ut nisl. Maecenas tortor turpis, interdum non, sodales non, iaculis ac, lacus. Vestibulum auctor, tortor quis iaculis malesuada, libero lectus bibendum purus, sit amet tincidunt quam turpis vel lacus. In pellentesque nisl non sem. Suspendisse nunc sem, pretium eget, cursus a, fringilla vel, urna.<br/><br/>Aliquam commodo ullamcorper erat. Nullam vel justo in neque porttitor laoreet. Aenean lacus dui, consequat eu, adipiscing eget, nonummy non, nisi. Morbi nunc est, dignissim non, ornare sed, luctus eu, massa. Vivamus eget quam. Vivamus tincidunt diam nec urna. Curabitur velit.');
        }
        var disp = false ? "displayfield" : "textfield";
        if (!Ext.isEmpty(Ext.getCmp("winChequeID"))) {
            Ext.getCmp("winChequeID").destroy();
        }
        Ext.Poplov_in = Ext.extend(Ext.Button, {
            config: {},
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
            var headerGrid = this.headerGrid;
            var id = id;
    
            var setDefaultFilter = [
                ["c_tax_number_imp", "เลขที่ประจำตัวผู้เสียภาษี"],
                ["c_name", "ชื่อ"],
            ];
            var setFilter = [["c_name", "ชื่อ"]];
    
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
                allowBlank: false,
                editable: false,
                triggerAction: "all",
                typeAhead: false,
                value: Ext.isEmpty(defFilter) ? "c_tax_number_imp" : defFilter,
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
                        store.setBaseParam("type", "SEARCH");
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
                store.setBaseParam("type", "SEARCH");
                store.setBaseParam("filter", Ext.getCmp("filter" + id).getValue());
                store.setBaseParam("value", Ext.getCmp("value-box" + id).getValue());
                Ext.getCmp("win-pop-lov-modal-" + id)
                    .getStore()
                    .load();
                } else {
                store.setBaseParam("type", "");
                Ext.getCmp("win-pop-lov-modal-" + id)
                    .getStore()
                    .load();
                }
            }
    
            var cellClick_lov = function (grid, rowIndex, columnIndex, e) {
                var record = grid.getStore().getAt(rowIndex);
                var TextShow = record.data.c_tax_number_imp + " " + record.data.c_name;
                Ext.getCmp(id).setValue(record.data.id);
                Ext.getCmp(nameID).setValue(TextShow);
    
                Ext.getCmp("win-pop-lov" + id).hide();
                Ext.getCmp("win-pop-lov" + id).destroy();
            };
    
            cellClick_lov = this.isCellClickGrid ? this.cellClickGrid : cellClick_lov;
            //*++
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
                    store.setBaseParam("type", "");
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
                                SearchGrid(store, id);
                                },
                            },
                            "->",
                            {
                                id: "buBackSub2ID",
                                xtype: "button",
                                iconCls: "icon-add",
                                text: "เพิ่มรายชื่อ",
                                disabled : true,
                            
                                handler: function () {
                                //*--
                                Ext.DidderAdd();
                                // Ext.getCmp("winChequeID").setActiveTab(0);
                                },
                            },
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
                            pageSize: 20,
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
        Ext.storeCreditor = new Ext.data.JsonStore({
            //autoLoad: true,
            storeId: "myStoreCont",
            url: "tor/api/mnTorController.php",
            baseParams: { mode: "LIST_POP_CREDITOR", id: 0 },
            root: "data",
            idProperty: "id",
            totalProperty: "totalCount",
            fields: [{ name: "no" }, { name: "dc_creditor_id" }, { name: "c_tax_number_imp" }, { name: "c_name" }],
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
        var PopCreditorForm = new Ext.Poplov_in({
            text: "เลือกผู้เสนอราคา",
            id: "dc_creditor_idID",
            iconCls: "page_magnify",
            valueHidden: "dc_creditor_id",
            store: Ext.storeCreditor,
            headerGrid: columnMini,
            widthText: 400,
            fieldLabel: "เลือกผู้เสนอราคา",
            isCellClickGrid: true,
            cellClickGrid: function (grid, rowIndex, columnIndex, e) {
                
                // console.log(Ext.store3);
            var id = "dc_creditor_idID";
            var nameID = id + "_Name";
            var record = grid.getStore().getAt(rowIndex);
            var c_tax_number_imp = record.data.c_tax_number_imp == null ? "(ไม่มีเลขที่ประจำตัวผู้เสียภาษี)" : record.data.c_tax_number_imp;
            var TextShow = c_tax_number_imp + " : " + record.data.c_name;
            console.log(nameID);
            Ext.getCmp("dc_creditor_idID").setValue(record.data.dc_creditor_id);
            Ext.getCmp(nameID).setValue(TextShow);
            Ext.getCmp("win-pop-lov" + id).hide();
            Ext.getCmp("win-pop-lov" + id).destroy();
            },
        });
       Ext.storeBg =   new Ext.data.JsonStore({
            storeId: "myStore1",
            autoLoad: true,
            url: "../po/reg/DAO/sp_listPR.php",
            root: "data",
            baseParams: {
                type: "pr_withdraw",
                sp_tor_id: Ext.selectRow.get("id"),
                // sp_tor_contract_id: Ext.SelectStore.data.sp_tor_contract_id,
                }, //Permission i_read
                idProperty: "id",
                totalProperty: "totalCount",
                fields: ["id", "sp_tor_contract_id"
                , "f_contract"
                , "d_contract"
                ,"bg_reserve_money_name"
                , "bg_reserve_money1_id"
                , "sp_check_period_hdr_id"
                , "sp_tor_hdr_period_id"
                , "request_money_income"
                , "bg_checking_money_income_id"
                , "bg_reserve_id"
                , "bg_checking_id"
                ],
            }) ,  
        Ext.storeStatus = new Ext.data.JsonStore({
            autoDestroy: false,
            autoLoad: false,
            url: "tor/api/mnTorController.php",
            baseParams: {
                type: "sp_working_dtl",
                mode: "LIST",
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
                }
            ]});

        return new Ext.Window({
            collapsible: true,
            maximizable: true,
            title: Ext.title,
            id: "winChequeID",
            width: Ext.getCmp("contenterCenter").getWidth() - 5,
            height: Ext.getCmp("contenterCenter").getHeight() - 5,
//            modal: true,
            plain: true,
            layout: "column",
            buttonAlign: "center",
            items: [
                new Ext.FormPanel({
                    id: Ext.poFormID,
                    columnWidth: 1,
                    url: "tor/api/mnTorController.php",
                    frame: true,
                    autoScroll: true,
                    labelAlign: "left",
                    labelWidth: 120,
                    layout: "column",
                    items: [{
                            columnWidth: 0.5,
                            layout: "form",
                            bodyStyle: "padding:10px",
                            border: true,
                            items: [
                                {
                                    xtype: "hidden",
                                    name: "id",
                                    id: "torHdrID"
                                },
                                {
                                    xtype: "hidden",
                                    name: "dc_emp_id",
                                    id: "dc_emp_idID", //i_is_more
                                },
                                {
                                    xtype: "hidden",
                                    name: "sp_emp_id",
                                    id: "sp_emp_idID", //i_is_more
                                },
                                {
                                    xtype: "hidden",
                                    name: "dc_department_id",
                                    id: "dc_department_idID", //i_is_more
                                },
                                {
                                    xtype: disp,
                                    readOnly: true,
                                    fieldLabel: "รหัส PR",
                                    id: "codeHdrID",
                                    style: "text-align: center;font-weight:bold;background:#eee;",
                                    readOnly: true,
                                    name: "c_code",
                                },
                                {
                                    xtype: disp,
                                    readOnly: true,
                                    fieldLabel: "เรื่อง/โครงการ",
                                    name: "c_name",
                                },
                                comboUsedBgYear,
                                comboTypeBg,
                                comboExpense,
                                comboCost,
                                comboCost2,
                                {
                                    xtype: "buttongroup",
                                    fieldLabel: "วันที่",
                                    frame: false,
                                    border: false,
                                    items: [
                                        {
                                            xtype: "datefield",
                                            name: "d_tor_date",
                                            readOnly: true,
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
                                {
                                    xtype: "combo",
                                    readOnly: true,
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
                                    forceSelection: false,
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
                                },
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
                                                var tor_type_idID = Ext.getCmp("tor_type_idID").getValue();
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
                                            readOnly: true,
                                            fieldLabel: "จำนวนเงิน",
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
                                                        this.setValue(Ext.floatRenderer(f_total));
                                                    };
                                                    this.fn();
                                                },
                                            },
                                        },
                                    ],
                                },
                                {
                                    xtype: "textfield",
                                    readOnly: true,
                                    fieldLabel: "รหัสเอกสารอ้างอิง",
                                    name: "d_doc_ref",
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
                                                width: "100px",
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
                                    fieldLabel: "วันที่บันทึก",
                                    xtype: "datefield",
                                    name: "d_tor_status_date",
                                    validator: function (val) {
                                        if (!Ext.isEmpty(val)) {
                                            return true;
                                        } else {
                                            return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                        }
                                    },
                                },
                                {
                                    fieldLabel: "วันที่เอกสารสมบูรณ์",
                                    xtype: "datefield",
                                    name: "d_doc_arrive_dt",
                                    id: "d_doc_arrive_dt",
                                    validator: function (val) {
                                        if (!Ext.isEmpty(val)) {
                                            return true;
                                        } else {
                                            return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                        }
                                    },
                                },
                                {
                                    xtype: "compositefield",
                                    id: "dc_creditor_idID_pop",
                                    // hidden: true,
                                    fieldLabel: "เลือกผู้เสนอราคา",
                                    msgTarget: "side",
                                    // anchor: "-20",
                                    defaults: {
                                            flex: 1,
                                        },
                                    items: [PopCreditorForm.mini],
                                },
                                {
                                    xtype: "hidden",
                                    name: "dc_creditor_id",
                                    id: "dc_creditor_idID", //i_is_more
                                },                 
                                {
                                        xtype:'button',
                                        fieldLabel: "กดทำรายการ",
                                        text:'ทำรายการข้ามไปเบิก',
                                        name:'prToWithDraw',
                                        id:'prToWithDrawID',
                                        listeners:{
                                            afterrender:function(){
                                                if(!Ext.isEmpty(Ext.selectRow)){
                                                    if(Ext.selectRow.get("sp_tor_contract_id") ==  "0")
                                                        this.show();
                                                        else this.hide();
                                                } else {
                                                    this.hide();
                                            }
                                        }
                                        },
                                        handler:function(){
                                            var f_total = Ext.getCmp("f_totalID").getValue()   
                                            var f_total1 = parseFloat(f_total.replace(/\,/g,''));
                                            // console.log(Ext.getCmp("dc_creditor_idID_pop").getValue()); 
                                            console.log(Ext.getCmp("dc_creditor_idID").getValue()); 
                                            // return ;
                                            if (Ext.getCmp("d_doc_arrive_dt").getValue() == ""){
                                                Ext.MessageBox.alert("แจ้งเตือน","กรุณาระบุ วันที่เอกสารสมบูรณ์" );
                                                return;
                                            } else if ([null,0,""].includes(Ext.getCmp("dc_creditor_idID").getValue())){
                                                Ext.MessageBox.alert("แจ้งเตือน","กรุณาระบุ ผู้ขายผู้รับจ้าง" );
                                                return;
                                            } else {
                                                // return;
                                                // console.log(Ext.selectRow.data.c_code);
                                                // return;
                                            Ext.Ajax.request({
                                                url: "tor/api/mnPeriodController.php",
                                                method: "POST",
                                                params: {
                                                    mode: "GEN_SP_CONTRACT_CHECK",
                                                    sp_tor_id : Ext.selectRow.data.id,
                                                    f_total : f_total1 ,  
                                                    d_doc_arrive_dt : Ext.util.Format.date(Ext.getCmp("d_doc_arrive_dt").getValue(), "Y-m-d"),
                                                    pr_code : Ext.selectRow.data.c_code ,
                                                    dc_creditor_id :Ext.getCmp("dc_creditor_idID").getValue(), 
                                                },
                                                waitMsg: "Saving Data...",
                                                success: function (Success, request) {
                                                    var jsonData = Ext.util.JSON.decode(Success.responseText); //decode json
                                                    if (jsonData.success) {
                                                        Ext.MessageBox.alert("Success", "ทำรายการเรียร้อยแล้ว", function () {
                                                            //Override   
                                                            //step 1 
                                                            Ext.getCmp('winChequeID').getEl().mask("ที่เรียกดู ณ ขณะนี้...","x-mask-loading");  
                                                            //step 2  
                                                            Ext.storeDtl.setBaseParam("submode", "sleep");
                                                            Ext.storeDtl.reload({
                                                                callback: function (record, operation, success) {
                                                                        if (success) { 
                                                            //step 3                 
                                                                            Ext.each(record, function(value) {  
                                                            //step 4       
                                                                                if (Ext.selectRow.get('id') === value.get('id')){ 
                                                                                    Ext.selectRow = value;  
                                                                                        Ext.getCmp('winChequeID').destroy();
                                                                                        Ext.buAct = "update";
                                                                                        Ext.loadStore("edit", true);
                                                                                        //Ext.getCmp('winChequeID').getEl().unmask();
                                                                                }
                                                                            });
                                                            //step 5           
                                                                        }
                                                                }
                                                            }); 
                                                            //Override   
                                                        });
                                                    }
                                                    
                                                },
                                                failure: function (result, request) {
                                                    Ext.MessageBox.alert("Failed", result.responseText);
                                                },
                                            });
                                        }
                                        }
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
                                            inputValue: "UPDATEFORMSTSATUS",
                                            boxLabel: "อัพเดทรายการ"
                                        }
                                    ]
                                }
                            ]
                        }, {
                            columnWidth: 0.5,
                            border: true,
                            layout: 'fit',
                            items: [new xg.GridPanel({

                                        store :  Ext.storeBg ,
                                        cm: new xg.ColumnModel({
                                        defaults: {
                                            width: 120,
                                            sortable: true
                                        },
                                        columns: [
//                                            sm,
                                            {   header: "บันทึกการจองสัญญา", 
                                                dataIndex: 'change', 
                                                sortable: false, 
                                                /*(record.get("bg_reserve_money1_id") ? false : false || 
                                                Ext.selectRow.get("i_is_register") == 2 || Ext.selectRow.get("i_is_register") == 1) ? true : false, */
                                                id: 'bookingID', 
                                                renderer: function (value, meta, record) {
                                                    var BtnText, IconImg;
                                                    if (record.get("bg_reserve_money1_id") == 0) {
                                                        BtnText = '&nbspยังไม่จองเงิน';
                                                        IconImg = '../images/icons/application_form.png';
                                                    } else if (record.get("bg_reserve_money1_id") > 0) {
                                                        BtnText = '&nbspบันทึกแล้ว';
                                                        IconImg = '../images/icons/accept.png';
                                                    } else {
                                                        BtnText = '&nbspยังไม่จองเงิน';
                                                        IconImg = '../images/icons/application_form.png';
                                                    }
                                                    var style = 'font-size:12px;border:1px solid #ccc; width:110px; padding:1px 3px 1px 10px; background: #f0f0f0 url(' + IconImg + ') no-repeat 3px center; cursor: pointer;';
                                                    return '<button style="' + style + '" type="button">' + BtnText + '</button>';
                                                } ,
                                            },
                                            {header: "เช็คเงินรับจริง" , dataIndex: 'change' , sortable: false, id: 'bookingID2'
                                            , renderer: function (value, meta, record) {
                                                var BtnText, IconImg;
                                                if (record.get("request_money_income") === 0) {
                                                    BtnText = '&nbspยังไม่จองเงิน';
                                                    IconImg = '../images/icons/application_form.png';
                                                } else if (record.get("request_money_income") === 1) {
                                                    BtnText = '&nbspบันทึกแล้ว';
                                                    IconImg = '../images/icons/accept.png';
                                                } else if (record.get("request_money_income") === 2  ||record.get("request_money_income") === 3   ) {
                                                    BtnText = '&nbspบันทึกแล้ว';
                                                    IconImg = '../images/icons/xhtml_error.png';
                                                } else {
                                                    BtnText = '&nbspยังไม่จองเงิน';
                                                    IconImg = '../images/icons/application_form.png';
                                                }
                                                var style = 'font-size:12px;border:1px solid #ccc; width:110px; padding:1px 3px 1px 10px; background: #f0f0f0 url(' + IconImg + ') no-repeat 3px center; cursor: pointer;';

                                                return '<button style="' + style + '" type="button">' + BtnText + '</button>';
                                            }
                                        },
                                        { header: "จองเงินตรวจรับ"
                                        , dataIndex: 'change'
                                        , align: "center"
                                        , sortable: false, id: 'bookingID3'
                                        , renderer: function (value, meta, record) {
                                            var BtnText, IconImg;
                                            if (record.get("request_money_income") === 0) {
                                                BtnText = '&nbspยังไม่จองเงิน';
                                                IconImg = '../images/icons/application_form.png';
                                            } else if ([1,0].includes(record.get("request_money_income"))    && record.get("bg_checking_id") > 0 ) {
                                                BtnText = '&nbspบันทึกแล้ว';
                                                IconImg = '../images/icons/accept.png';
                                            } else if (record.get("request_money_income") === 2 ||record.get("request_money_income") === 3 && record.get("bg_checking_money_income_id") > 0 ) {
                                                BtnText = '&nbspบันทึกแล้ว';
                                                IconImg = '../images/icons/xhtml_error.png';
                                            } else {
                                                BtnText = '&nbspยังไม่จองเงิน';
                                                IconImg = '../images/icons/application_form.png';
                                            }
                                            var style = 'font-size:12px;border:1px solid #ccc; width:110px; padding:1px 3px 1px 10px; background: #f0f0f0 url(' + IconImg + ') no-repeat 3px center; cursor: pointer;';

                                            return '<button style="' + style + '" type="button">' + BtnText + '</button>';
                                            }
                                        },
                                        {   id: 'company', 
                                            header: "สถานะของรายการจอง", 
                                            width: 400, 
                                            align: "center",
                                            sortable: false, 
                                            dataIndex: 'bg_reserve_money_name'
                                            , renderer: function (value, meta, record) { 
                                                if (record.get("bg_reserve_id") ==  1  || record.get("bg_reserve_id") == 3 || record.get("bg_reserve_id") ==  5   ){
                                                    return "<span style = 'color : red'>  " +  value   + "</span>"  ;
                                                } else if (record.get("bg_reserve_id")== 2 || record.get("bg_reserve_id") == 4 ) {
                                                    return "<span style = 'color : green'>  " +  value   + "</span>"  ;
                                                } else if ( record.get("bg_reserve_id") == 6 ) {
                                                    return "<span style = 'color : blue'>  " +  value   + "</span>"  ;
                                                }
                                            }
                                        },
                                        {
                                            header: "จำนวนเงิน", 
                                            sortable: false, 
                                            align: "RIGHT",
                                            dataIndex: 'f_contract',
                                            listeners: {
                                                blur: function () {
                                                    this.fn();
                                                },
                                                afterrender: function () {
                                                    this.fn = function () {
                                                        var val = 0;
                                                        val = this.getValue();
                                                        var f_total = parseFloat(val.replace(/,/g, "") / 1);
                                                        this.setValue(Ext.floatRenderer(f_total));
                                                    };
                                                    this.fn();
                                                },
                                            },
                                        },
                                        /* {
                                                header: "วันที่ทำรายการ", 
                                                sortable: false,
                                                width: 135, 
                                                renderer: Ext.util.Format.dateRenderer('m/d/Y'), 
                                                dataIndex: 'lastChange'
                                        },*/
                                            // {header: "สถานะการจอง", sortable: false, dataIndex: 'status_id'}
                                        ]
                                    }),
                                    sm: sm,
                                    columnLines: true,
                                    width: '100%',
                                    height: 180,
                                    frame: true,
                                    title: 'รายการจองขอเงินก่อนเบิก',
                                    iconCls: 'icon-grid',
                                    listeners: {
                                        afterrender: function () {
                                            this.on("cellclick", function (grid, rowIndex, columnIndex, e) {
                                                var record = grid.getStore().getAt(rowIndex);
                                                Ext.record =   record ; 
                                                if (columnIndex === grid.getColumnModel().getIndexById("bookingID")) {
                                                    // alert( Ext.selectRow.get("bg_reserve_money_contract")); 
                                                    if (Ext.selectRow.get("bg_reserve_money_contract") > 0 ){
                                                        Ext.Msg.alert("แจ้งเตือน", "คุณบันทึกรายการไปแล้วไม่สามารถทำซ่้ำได้");
                                                        return false;
                                                    } else {
                                                    genBookBg(1) 
                                                    }

                                                }else if (columnIndex === grid.getColumnModel().getIndexById("bookingID2")) {
                                                    if (record.get("request_money_income") > 0){
                                                    Ext.Msg.alert("แจ้งเตือน", "คุณบันทึกรายการไปแล้วไม่สามารถทำซ่้ำได้");
                                                    } else {
                                                    Ext.getMoney(record);
                                                    }
                                                }else if (columnIndex === grid.getColumnModel().getIndexById("bookingID3")) {
                                                    if (record.get("request_money_income") > 1 && record.get("bg_checking_money_income_id") > 0) { 
                                                        Ext.Msg.alert("แจ้งเตือน", "คุณบันทึกรายการไปแล้วไม่สามารถทำซ่้ำได้");
                                                        } else {
                                                            Ext.getMoneyCheck(record);
                                                        }
                                                    // alert(record.get(''));
                                                }
                                            }, this);

                                        }
                                    }
                                })]
                        }
                    ],
                    buttonAlign: "center",
                    buttons: [
                        {
                            text: "บันทึกรายการ",
                            id: "buSaveSubID",
                            iconCls: "icon-save",
                            handler: function () {
                                var formSubmit = function () {
                                    form.submit({
                                        waitMsg: "Saving Data...",
                                        success: function (form, action) {
                                            Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                                Ext.getCmp("tabpanel1").getStore().reload();
                                                Ext.selectRow = null;
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
                                }; //END

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
                            },
                            //haddler
                        },
                        {
                            text: Ext.GLOBAL_BU_BACK_TH,
                            handler: function () {
                                Ext.getCmp("winChequeID").hide();
                                Ext.getCmp("winChequeID").destroy();
                            },
                        },
                    ],
                }),
            ],
        });
    };

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
                                                                                    //AppPoStore(statusx).show();

                                                                                    if (statusx == "add") {
                                                                                        Ext.HDR_ID = null;
                                                                                        Ext.selectRow = null;
                                                                                        Ext.i_is_more = 0;
                                                                                        var winApp = AppPoStore(statusx);
                                                                                        winApp.show();
                                                                                    } else if (statusx === "edit") {
                                                                                        //
                                                                                        Ext.HDR_ID = Ext.selectRow.data.po_working_hdr_id;
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
                                                                                        var winApp = AppPoStore(statusx);
                                                                                        Ext.getCmp("winChequeID").items.items[0].getForm().loadRecord(Ext.selectRow);
                                                                                        winApp.show();
                                                                                        var id = "dc_creditor_idID";
                                                                                        var nameID = id + "_Name";
                                                                                        var record =  Ext.selectRow;
                                                                                        var c_tax_number_imp = record.data.c_tax_number_imp == null ? "(ไม่มีเลขที่ประจำตัวผู้เสียภาษี)" : record.data.c_tax_number_imp;
                                                                                        var TextShow = record.data.dc_creditor_name;
                                                                                        Ext.getCmp("dc_creditor_idID").setValue(record.data.dc_creditor_id);
                                                                                        Ext.getCmp(nameID).setValue(TextShow);
                                                                                    }

                                                                                    //
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
};
Ext.onReady(function () {
    Ext.QuickTips.init();  
    Ext.AppUx("SP", Ext.codeMenu); //app & show menu 
    var App = new Ext.Viewport({
        layout: "border",
        items: new Ext.TabPanel({
            region: "center",
            border: false,
            id: "contenterCenter",
            defaults: {
                autoScroll: true,
                layout: 'fit'
            },
            listeners: {
                afterrender: function () { 
                    // Ext.loadStore('load', false); //status,show   
                }
            },
            items: [new gridMain()]

        })
    });
    Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
    Ext.getCmp("tabpanel1").on('beforeedit', function () {
        return false;
    });
});