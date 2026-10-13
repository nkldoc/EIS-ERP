/* global Ext */

Ext.isBook = null;
Ext.isOverlap = null;
Ext.styleBu = "style='display: inline-block; background-color: #9ACD32; padding: 3px; color: #000000; text-align: center; border:1px double #cccccc; border-radius:4px; font-size:12px;'";
Ext.styleBu1 = "style='display: inline-block; background-color: #F0E68C; padding: 3px; color: #000000; text-align: center; border:1px double #cccccc; border-radius:4px; font-size:12px;'";
Ext.styleBu2 = "style='display: inline-block; background-color: #FA8072; padding: 3px; color: #000000; text-align: center; border:1px double #cccccc; border-radius:4px; font-size:12px;'";

Ext.workScore = function () {
    if (!Ext.isEmpty(Ext.getCmp("frmTab2")))
        Ext.getCmp("frmTab2").destroy();
    Ext.i_pr_about = 1;
    Ext.ar_pr_about = [];
    Ext.ar_pr_about2 = [];
    Ext.torItemsHdr = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/All_spAlert.php",
        baseParams: {type: "sp_tor_work_hdr"},
        root: "data",
        idProperty: "id",
        fields: ["id", "c_name"]
    });
    Ext.torItems = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/All_spAlert.php",
        baseParams: {type: "sp_tor_work", sp_type_status_id: 1},
        root: "data",
        idProperty: "id",
        fields: ["id", "c_name", "score", "i_group", "sp_cate_id"]
    });
    Ext.torScores = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/All_spAlert.php",
        baseParams: {type: "sp_tor_scores", id: Ext.selectRow.get('sp_tor_id')},
        root: "data",
        idProperty: "id",
//sp_tor_id	dc_department_id	sp_emp_id	sp_cate_id	sp_type_id	i_enabled  
        fields: ["id", "sp_tor_id", "c_name", "score"
                    , "dc_department_id"
                    , "sp_emp_id"
                    , "sp_cate_id"
                    , "sp_type_id"
                    , "c_type_id"
                    , "sp_tor_work_id"
                    , "c_sp_tor_work_id"
                    , "sp_tor_hdr_period_id"
                    , "i_enabled"
        ]
    });// 
    Ext.countItems = 11;
    Ext.scoreTotal = 1; //ให้เลยครั้งละ 1 
    Ext.rate2 = 1.00;
    Ext.selectRow.set("period_id", 0);
    var tab2 = new Ext.FormPanel({
//        labelAlign: 'top',
        title: "บันทึกรายละเอียดภาระงาน งวดที่ " + Ext.selectRow.get('i_period'),
        bodyStyle: "padding:5px",
        layout: "fit",
        id: "frmTab2",
        url: "api/mnTorWorkingController.php",
        frame: false,
        items: [{
//                xtype: 'displayfield',
//                width: 80,
//                id: 'scoreTotalID',
//                html: "<div style='background-color:#cEcEcE; font-weight:bold;padding: 10px 10px 10px 10px;white-space: nowrap;'>" + " -  รวมภาระงาน " + parseFloat(Ext.scoreTotal).toFixed(2) + " คะแนน</div>"
//            },
//            {
                layout: "column",
                border: false,
                autoScroll: true,
                style: "font:bold 12px \'Mitr\', sans-serif; padding:5px;margin-bottom:5px;",
                html: "<div"
                        + " class='x-toolbar x-small-editor x-toolbar-layout-ct'"
                        + " style='background-color:#cEcEcE; font-weight:bold; padding:5px; margin-bottom:5px; white-space: nowrap;'>"
                        + " -  รวมภาระงาน <span style='font-weight:bold;' id='scoreTotalID'>"
                        + parseFloat(Ext.scoreTotal).toFixed(2)
                        + "</span> คะแนน</div>"
                , items: [
                    {
                        columnWidth: 0.4,
                        layout: "form",
                        id: "rightfrmID",
                        border: false,
//                        labelWidth: 200,
                        bodyStyle: "padding:1px",
                        items: [{
                                xtype: "hidden",
                                name: "sp_tor_id",
                                id: "torHdrID"
                            },
                            {
                                xtype: "hidden",
                                name: "sp_emp_id"
                            },
                            {
                                xtype: "hidden",
                                name: "sp_tor_hdr_period_id",
                                id: "sp_tor_hdr_period_idID"
                            },
                            {
                                xtype: "hidden",
                                name: "parent_id",
                                id: "parent_idID"
                            },
                            {
                                xtype: "hidden",
                                name: "mode",
                                value: "EDIT2",
                            },
                            {
                                xtype: "hidden",
                                name: "sp_cate_id",
                                id: "sp_cate_idID",
                                value: 2
                            },
                            {
                                xtype: "hidden",
                                name: "dc_department_id",
                                id: "dc_department_idID",
                            },
                            {
                                xtype: "hidden",
                                name: "sp_type_id",
                                id: "sp_type_idID",
                            },
                            {
                                /**sp_type_id: 2
                                 c_type_id: เจาะจง 500,000.00 ขี้นไป
                                 sp_tor_work_idID: 5;6;7;8
                                 c_sp_tor_work_idID: รายการที่เลือก (4)*/
                                xtype: "hidden",
                                name: "sp_type_id",
                                id: "sp_type_idID",
                            },
                            {
                                xtype: "hidden",
                                name: "c_type_id",
                                id: "c_type_idID"
                            },
                            {
                                xtype: "hidden",
                                name: "sp_tor_work_id",
                                id: "sp_tor_work_id2ID"
                            },
                            {
                                xtype: "hidden",
                                name: "c_sp_tor_work_id",
                                id: "c_sp_tor_work_idID"
                            }, {
                                xtype: 'textfield',
                                fieldLabel: "รหัส PR",
                                id: "codeHdrID",
                                style: "text-align: center;font-weight:bold;background:#eee;",
                                readOnly: true,
                                name: "c_code"
                            },
                            {
                                xtype: "textarea",
                                fieldLabel: "เรื่อง/โครงการ",
                                name: "c_name",
                                id: "c_name",
                                readOnly: true,
                                anchor: "80%"
                            }, {
                                xtype: "textfield",
                                fieldLabel: "จำนวนเงิน",
                                name: "f_type_amt",
                                id: "f_type_amt", // f_total_amt f_type_amt
                                readOnly: true,
                                anchor: "50%",
                            }, new Ext.form.Label({
                                xtype: 'label',
                                id: "sp_tor_work_idID",
                                style: "font:bold 12px \'Mitr\', sans-serif; padding:1px;",
                                html: '<div style="padding-left:30px;"><span style="color:red">*</span>ค่าภาระงานส่วนที่ 1</div>',
                                listeners: {
                                    beforerender: function () {

                                        this.fnData2 = function (i, rec) {
                                            let pr_about = i;
                                            let pr_aboutRs = rec;
                                            Ext.ar_pr_about.push(pr_about);
                                            if (pr_aboutRs === null) {
                                                var cateNull = false;
                                                var cateText = true;

                                                let twoPlacedFloat = parseFloat(parseFloat(Ext.rate2).toFixed(2));
                                                Ext.scoreTotal += twoPlacedFloat;
                                                Ext.get('scoreTotalID').update(Ext.scoreTotal.toFixed(2));
                                            } else {
                                                var cateNull = (pr_aboutRs.get('sp_cate_id') == 1) ? true : false;
                                                var cateText = false;
                                            }


                                            buttonGroup = new Ext.ButtonGroup({
//                                                fieldLabel: cateNull ? "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" : "เกณฑ์ราคาประกอบ",
                                                frame: false,
                                                border: false,
                                                style: "font:bold 12px \'Mitr\', sans-serif; padding:1px; width:500px;",
                                                id: 'buttonGroup' + pr_about,
                                                items: [
                                                    {
                                                        xtype: "label",
                                                        id: 'labelID' + pr_about,
                                                        style: " margin-right:5px;",
                                                        text: cateText ? 'เพิ่มภาระตรวจงาน' : ''
                                                    },
                                                    {
                                                        xtype: (cateText ? "textarea" : 'displayfield'), //Ext.selectRow.set("peiod_id", pr_aboutRs.get("sp_tor_hdr_period_id"));
                                                        width: 200,
                                                        readOnly: cateNull,
                                                        name: "c_name[" + pr_about + "]",
                                                        id: "c_nameID" + pr_about,
                                                        validator: function (val) {
                                                            if (!Ext.isEmpty(val)) {
                                                                return true;
                                                            } else {
                                                                return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                                            }
                                                        }
                                                    }, {
                                                        xtype: "tbspacer",
                                                        width: 9
                                                    }, {
                                                        xtype: cateText ? 'textfield' : 'displayfield',
                                                        name: 'score[' + pr_about + "]",
                                                        readOnly: true,
                                                        width: 80,
                                                        id: 'score' + pr_about + 'ID'
                                                    }, {
                                                        xtype: "label",
                                                        style: {
                                                            color: "blue",
                                                            width: "200px"
                                                        },
                                                        text: " คะแนน"
                                                    }, {
                                                        xtype: "tbspacer",
                                                        width: 9
                                                    }, {
                                                        xtype: 'button',
                                                        id: 'buttonID' + pr_about,
                                                        hidden: true,
                                                        name: 'button' + pr_about,
                                                        text: 'ลบรายการ ' + pr_about,
                                                        handler: function () {
                                                            Ext.getCmp('leftfrmID').remove(Ext.getCmp('buttonGroup' + pr_about));

                                                        } //
                                                    }
                                                ],
                                                listeners: {
                                                    removed: function () {
                                                        let twoPlacedFloat = parseFloat(parseFloat(Ext.getCmp('score' + pr_about + 'ID').getValue()).toFixed(2));
                                                        Ext.scoreTotal -= twoPlacedFloat;
                                                        Ext.get('scoreTotalID').update(Ext.scoreTotal.toFixed(2));
                                                    },
                                                    afterrender: function () {

                                                        if (pr_aboutRs != null) {
                                                            Ext.getCmp("c_nameID" + pr_about).setValue(pr_aboutRs.get("c_name"));
                                                            Ext.getCmp('score' + pr_about + 'ID').setValue(!cateNull ? parseFloat(parseFloat(pr_aboutRs.get("score")).toFixed(2)) : pr_aboutRs.get("score"));
                                                            let twoPlacedFloat = parseFloat(parseFloat(pr_aboutRs.get("score")).toFixed(2));
                                                            Ext.scoreTotal += twoPlacedFloat;
                                                            Ext.get('scoreTotalID').update(Ext.scoreTotal);

                                                        }

                                                    }
                                                }
                                            });
                                            if (cateNull) {
                                                Ext.getCmp('rightfrmID').insert(Ext.torScores.data.length + Ext.countItems + 1, buttonGroup);
                                                Ext.getCmp('rightfrmID').doLayout();
                                                return Ext.torScores.data.length + Ext.countItems + 1;
                                            } else {
                                                Ext.getCmp('score' + pr_about + 'ID').setValue(Ext.rate2);
                                                Ext.getCmp('leftfrmID').insert(Ext.getCmp('leftfrmID').items.length, buttonGroup);
                                                Ext.getCmp('leftfrmID').doLayout();
                                                return 3;

                                            }

                                        };
                                    },
                                    afterrender: function () {
                                        Ext.getCmp('leftfrmID').insert(1, new Ext.form.Label({
                                            xtype: 'label',
                                            style: "font:bold 12px \'Mitr\', sans-serif; padding:1px;",
                                            html: '<div style="padding-left:30px;"><span style="color:red">*</span>ค่าภาระงานส่วนที่ 2</div>',
                                            listeners: {
                                                afterrender: function () {
                                                    Ext.torScores.reload({
                                                        callback: function (record, operation, success) {
                                                            //end left              
                                                            record.forEach(function (v) {
                                                                Ext.lenCate1 = Ext.getCmp('sp_tor_work_idID').fnData2(Ext.i_pr_about++, v);

                                                                if (record.length == Ext.i_pr_about) {
                                                                    Ext.getCmp('sp_cate_idID').setValue(3);
                                                                    Ext.getCmp('dc_department_idID').setValue(v.get("dc_department_id"));
                                                                    Ext.getCmp('sp_type_idID').setValue(v.get("sp_type_id"));
                                                                    Ext.getCmp('c_type_idID').setValue(v.get("c_type_id"));
                                                                    Ext.getCmp('sp_tor_work_id2ID').setValue(v.get("sp_tor_work_id"));
                                                                    Ext.getCmp('c_sp_tor_work_idID').setValue(v.get("c_sp_tor_work_id"));
                                                                }
                                                                Ext.getCmp('sp_tor_hdr_period_idID').setValue(v.get("sp_tor_hdr_period_id"));

                                                            });
                                                            Ext.getCmp('sp_tor_work_idID').fnData2(Ext.getCmp('leftfrmID').items.length, null);
                                                        }
                                                    });
                                                }
                                            }
                                        }));
                                        Ext.getCmp('leftfrmID').doLayout();


                                    }
                                }
                            }),
                        ],
                    },
                    {
                        columnWidth: 0.6,
                        layout: "form",
                        border: false,
                        bodyStyle: "padding:3px",
                        id: "leftfrmID",
                        items: [
                        ],
                    }
                ],

                buttonAlign: "left",
                buttons: [
                    {
                        text: "บันทึกรายการ",
                        iconCls: "icon-save",
                        handler: function () {

//                            alert(Ext.getCmp('sp_tor_hdr_period_idID').getValue());
//                            return false;

                            var form = Ext.getCmp("frmTab2").getForm();
                            if (Ext.getCmp('sp_tor_hdr_period_idID').getValue() != 0 && Ext.menu_code == 'ST0013') {
                                Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'> ! งวดภารงานท่านได้เคยบันทึกแล้วถ้าต้องการแก้ไข/ติดต่อแอดมิน</span><br>", function (bu, action) {
                                    console.log("sp_tor_hdr_period_idID  >> " + Ext.getCmp('sp_tor_hdr_period_idID').getValue());
                                    console.log("menu ST0006 >> " + Ext.menu_code);
                                    return false;
                                });
                            } else if (form.isValid()) {
                                Ext.Msg.show({
                                    title: "ยืนยันบันทึกภาระงานที่ทำ",
                                    msg: "คุณต้องภาระงาน ?",
                                    width: 440,
                                    icon: Ext.MessageBox.QUESTION,
                                    buttons: Ext.MessageBox.YESNO,
                                    fn: function (btn) {
                                        if (btn === "yes")
                                            form.submit({
                                                waitMsg: "Saving Data...",
                                                success: function (form, action) {
                                                    Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                                        Ext.getCmp("tabpanel1").getStore().reload();
                                                        Ext.getCmp("contenterCenter").remove(Ext.getCmp("frmTab2"));
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
                                                }
                                            });
                                        else
                                            null;
                                    }
                                });

                            }
                        }
                    },
                    {
                        text: "ยกเลิก",
                        iconCls: "icon-cancel",
                        handler: function () {
                            Ext.getCmp("contenterCenter").remove(Ext.getCmp("frmTab2"));
                        }
                    }
                ]
            }
        ]
    });

    Ext.buAct = "getDetail";
    Ext.getCmp("contenterCenter").add(tab2);
    Ext.getCmp("contenterCenter").setActiveTab(tab2);
    Ext.selectRow.set('f_type_amt', Ext.selectRow.get('f_net_total_price'));// f_total_amt 
    Ext.selectRow.set('parent_id', Ext.selectRow.get('sp_tor_hdr_period_id'));// f_total_amt 
    Ext.getCmp("frmTab2").getForm().loadRecord(Ext.selectRow);

}; //End work score
function bgBagedOver(rec, i) {
    Ext.rec = rec;

    console.log(rec);
    if (rec.get('i_overlapcheck') === 2)
        return false;
    else
        return new Ext.Window({
            id: "winDcExpTypeDdd2ID",
            modal: true,
            width: 850,
            title: "ใช้เงินใบกันเหลื่อม " + rec.get("f_net_total_price"),
            layout: "fit",
            height: 300,
            items: new Ext.FormPanel({
                frame: true,
                labelWidth: 160,
                padding: "10px 10px 10px 10px",
                url: "tor/api/mnBgExpenseController4.php",
                id: "formDcExpTypeDddID",
                items: [{
                        xtype: 'hidden',
                        name: 'sp_tor_contract_id',
                        value: Ext.selectRow.get('sp_tor_contract_id'),
                        id: 'sp_tor_contract_idID'
                    }, {
                        xtype: 'hidden',
                        name: 'sp_check_period_hdr_id',
                        value: Ext.selectRow.get('sp_check_period_hdr_id'),
                        id: 'sp_check_period_hdr_idID'
                    }, {
                        xtype: 'hidden', // displayfield hidden
                        name: 'i_overlap',
                        value: rec.get('i_overlapcheck'), //1 ก่อนจอง 2 จองแล้ว
                        id: 'i_overlapID'
                    }, {
                        xtype: 'hidden',
                        name: 'mode',
                        id: 'modesubID',
                        value: "UPDATEIOVER1", //1 ก่อนจอง 2 จองแล้ว

                    }, Ext.PopDepartmentForm.mini,
                    {
                        xtype: "textfield",
                        fieldLabel: "ปีเลขที่ของใบกัน",
                        readOnly: true,
                        name: "yearTxt",
                        value: rec.get("i_yyyy_overlap"),
                        id: "i_yearOverlapID",
                    },
                    {
                        xtype: "displayfield",
                        fieldLabel: "หน่วยงาน",
                        name: "dc_costTxt",
                        value: rec.get("dc_cost_idTxt"),
                        id: "dc_cost_idID",
                    },
                    {
                        xtype: "displayfield",
                        fieldLabel: "แหล่งเงิน",
                        name: "budget_typeTxt",
                        value: rec.get("budget_type"),
                        // Ext.selectRow.get('budget_type'),
                        id: "dc_expense_budget_type_idID",
                    },
                    {
                        xtype: "displayfield",
                        fieldLabel: "หมวดค่าใช้จ่ายย่อย",
                        name: "c_expense_nameTxt",
                        value: rec.get("expense_name"),
                        // Ext.selectRow.get('dc_bg_budget_type_idTxt'),
                        id: "c_expenseID",
                    },
                    {
                        xtype: "displayfield",
                        fieldLabel: "เลขที่ใบกัน",
                        name: "c_overlap",
                        value: rec.get('c_overlap'),
                        id: "c_overlapID",
                    }, {
                        fieldLabel: "บันทึกใบกันเหลื่อมผ่านระบบงบประมาณ",
                        xtype: "button",
                        text: "บันทึกจองกันเหลื่อม",
                        name: "bookOverlap",
                        id: "bookOverlapID",
                        handler: function () {

                            function getCode(event) {
//                                    console.log(" REC..>> ");
//                                    console.log(rec);

                                switch (event) {
                                    case "c_overlap":
                                        link =
                                                Ext.session.IPAPIBG + "/?/bg/BgBudgetAllSupplies" +
                                                "/i_year/" + rec.get("i_yyyy_overlap") +
                                                "/dc_expense_budget_type_id/" + rec.get("dc_expense_budget_type_id") +
                                                "/dc_cost_id/" + rec.get("dc_cost_id") +
                                                "/bg_expense_id/" + rec.get("po_expense_id") +
                                                "/c_code_overlap/" + encodeURIComponent(rec.get('c_overlap')) +
                                                "/";
                                        break;
                                    case "c_overlap_book":
                                        link =
                                                Ext.session.IPAPIBG + "/?/bg/mn_BgReserveMoney/mode/POST" +
                                                "/i_sys/1" +
                                                "/pr_id/" + rec.get("sp_tor_id") +
                                                "/po_id/" + rec.get("sp_tor_contract_id") +
                                                "/chk_id/" + rec.get("sp_check_period_hdr_id") +
                                                "/i_year/" + (rec.get("i_yyyy")) +
                                                "/i_pr_type/1" + //  plan or period
                                                "/i_reserve/3" + // step 1 PR step 2 po step3 checking
                                                "/dc_cost_id/" + rec.get("dc_cost_id") +
                                                "/dc_budget_type_id/" + rec.get("dc_expense_budget_type_id") +
                                                "/bg_expense_id/" + rec.get("po_expense_id") +
                                                "/i_last/" + (rec.get("i_type_contract") === 3 ? 0 : 1) + // pr มี สัญญาเดียว = 1
                                                "/c_code_overlap/" + encodeURIComponent(rec.get("c_overlap")) +
                                                "/f_amt/" + rec.get("f_net_total_price");

                                        break;
                                }
//                                        console.log(link);
                                return link;
                            }
                            function your_func(link) {
                                Ext.getCmp('winDcExpTypeDdd2ID').getEl().unmask();
                                //    alert(link); 
//                                   return false;
                                //CHECK
                                Ext.Ajax.request({
                                    url: link,
                                    method: "GET", //POST
                                    disableCaching: false,
                                    success: function (result, request) {
                                        let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
//                                                console.log(jsonData.data[0].f_overlap_total);  
//                                                console.log(parseFloat(rec.get("f_total_amt").replace(/\,/g,'')));  
//                                                Ext.getCmp('winDcExpTypeDdd2ID').getEl().unmask(); 
//                                                return false;

                                        if (jsonData.data[0].f_overlap_total < parseFloat(rec.get("f_net_total_price").replace(/\,/g, ''))) {
                                            Ext.Msg.alert("Success", "ไม่สารถใช้เงินกันเหลื่อมเนื่องจากเงินในใบกันไม่พอ", function (form, action) {
                                                Ext.getCmp('winDcExpTypeDdd2ID').getEl().unmask();
                                            });
                                        } else {
                                            //BOOK
//                                    Ext.getCmp('winDcExpTypeDdd2ID').getEl().unmask();
//                                    alert(getCode("c_overlap_book")); 
//                                    return false;

                                            Ext.Ajax.request({
                                                url: getCode("c_overlap_book"),
                                                method: "GET", //POST
                                                disableCaching: false,
                                                success: function (result, request) {
                                                    let jsonData = Ext.util.JSON.decode(result.responseText); //decode json

//                                                console.log(Ext.selectRow);     
//                                                console.log(jsonData);     
//                                                Ext.getCmp('winDcExpTypeDdd2ID').getEl().unmask(); 
//                                                return false;
//UPDATE
                                                    Ext.Ajax.request({
                                                        url: "tor/api/mnBgExpenseController4.php",
                                                        method: "POST", //POST 
                                                        params: {
                                                            mode: "UPDATEIOVER2",
                                                            sp_check_period_hdr_id: rec.get('sp_check_period_hdr_id'),
                                                            bg_budget_dtl_overlap_id: jsonData.bg_reserve_overlap_id
                                                        },
                                                        success: function (result, request) {
                                                            let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                                                            // console.log(jsonData);
                                                            // console.log(record);
                                                            // console.log(rec);
                                                            Ext.Msg.alert("Success", "บันทึกการใช้เงินใบกันเหลื่อมเรียบร้อยแล้ว", function (form, action) {
                                                                Ext.Ajax.request({
                                                                    url: "tor/api/mnCheckCode.php",
                                                                    method: "POST",
                                                                    params: {
                                                                        mode: "GENCODECHECKING",
                                                                        sp_check_period_hdr_id: rec.get('sp_check_period_hdr_id'),
                                                                        i_is_warranty: rec.get('i_is_warranty'),
                                                                        sp_tor_contract_id: rec.data.sp_tor_contract_id

                                                                    },
                                                                    success: function (result, request) {
                                                                        if (result.statusText) {
                                                                            Ext.storeDtl.reload({
                                                                                callback: function (record, operation, success) {
                                                                                    if (success) {
                                                                                        //บันทึกแล้ว
                                                                                        record.forEach(function (v) {
                                                                                            if (Ext.selectRow.get('sp_check_period_hdr_id') === v.get('sp_check_period_hdr_id')) {
                                                                                                // Override record
                                                                                                Ext.selectRow = v;
                                                                                                Ext.getCmp('winDcExpTypeDdd2ID').getEl().unmask();
                                                                                                Ext.getCmp('winDcExpTypeDdd2ID').destroy();
                                                                                                Ext.getCmp("winPeriodHdrID").destroy();
                                                                                                // Override window items

                                                                                                // END
                                                                                            }
                                                                                        });
                                                                                    }
                                                                                }
                                                                            });
                                                                        }
                                                                    },
                                                                    failure: function (result, request) {
                                                                        Ext.MessageBox.alert("Failed", result.responseText);
                                                                    }
                                                                });
                                                            });
                                                        },
                                                        failure: function (result, request) {
                                                            Ext.MessageBox.alert("Failed", result.responseText); // connect  
                                                        }
                                                    });

                                                },
                                                failure: function (result, request) {
                                                    Ext.MessageBox.alert("Failed", result.responseText); // connect  
                                                }
                                            });
                                        }

                                    },
                                    failure: function (result, request) {
                                        Ext.MessageBox.alert("Failed", result.responseText); // connect  
                                    }
                                });
                            }
                            Ext.getCmp('winDcExpTypeDdd2ID').getEl().mask("กำลังจองใบกัน...", "x-mask-loading");

                            setTimeout(function () {
//                                    your_func(getCode('c_overlap_book'));
                                your_func(getCode('c_overlap'));
                            }, 5000);
                        },
                        listeners: {
                            afterrender: function () {
                                if (Ext.getCmp('c_overlapID').getValue() == "") {
                                    Ext.getCmp('bookOverlapID').hide();
                                }
                            },
                        }

                    }
                ],
                buttonAlign: "center",
                buttons: [
                    {
                        text: "บันทึกรายการ",
                        id: "buSaveOverLapSubID",
                        iconCls: "icon-save",
                        //disabled: true,
                        listeners: {
                            afterrender: function () {

                            },
                        },
                        handler: function () {
                            var form = Ext.getCmp('formDcExpTypeDddID').getForm();
                            var msg = "";
                            // console.log(nameID);
                            // return ;
                            if (Ext.getCmp("bg_budget_dtl_overlap_idID_Name").getValue() == "") {
                                msg += "<span style='white-space: nowrap;'>- กรุณาเลือกใบกันเหลื่อม</span><br>";
                            }
                            if (msg == "") {
                                form.submit({
                                    waitMsg: "Saving Data...",
                                    success: function (form, action) {
                                        Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                            Ext.storeDtl.reload({
                                                callback: function (record, operation, success) {
                                                    if (success) {
                                                        //บันทึกแล้ว
                                                        record.forEach(function (v) {
                                                            if (Ext.selectRow.get('sp_check_period_hdr_id') === v.get('sp_check_period_hdr_id')) {
                                                                // Override record
                                                                Ext.selectRow = v;
                                                                Ext.getCmp('winDcExpTypeDdd2ID').destroy();
                                                                // Override window items
                                                                var win = bgBagedOver(v, 2);
                                                                win.items.items[0].getForm().loadRecord(record);
                                                                win.show();
                                                                // END
                                                            }
                                                        });
                                                    }
                                                }
                                            });
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
                            } else {
                                Ext.MessageBox.alert("แจ้งเตือน", msg)
                            }
                        },
                        //haddler
                    },
                    {
                        text: Ext.GLOBAL_BU_BACK_TH,
                        handler: function () {
                            Ext.getCmp("winDcExpTypeDdd2ID").destroy();
                        },
                    },
                ],

            }),
        });
} //End Function

function purchase2(id, bg_reserve_money_id, ii) {
    Ext.Ajax.request({
        url: "tor/api/mnTorController.php",
        params: {
            mode: "UPDATE_TOR_BG_CHECKING", //UPDATE_TOR_DTL_BG
            hdr_id: id, //sp_dtl_id
            bg_reserve_money_id: bg_reserve_money_id,
            ii: ii,
            dc_expense_budget_type: Ext.perioidHdr.data.dc_expense_budget_type_id
        },
        method: "POST", //POST
        success: function (result, request) {
            // Ext.getCmp("winDcExpTypeDddID").getEl().unmask(); 
        },
        failure: function (result, request) {
            Ext.MessageBox.alert("Failed", result.responseText); // connect error
        },
    });
}

function updateBookingContract(id, bg_reserve_money_id, ii) {
    Ext.Ajax.request({
        url: "tor/api/mnTorController.php",
        params: {
            mode: "UPDATE_CONTRACT_BG_CHECKING", //UPDATE_TOR_DTL_BG
            sp_tor_contract_id: id, //sp_dtl_id
            bg_reserve_money1_id: bg_reserve_money_id,
            i_pr_type1: Ext.perioidHdr.get('i_pr_type1'),
            f_type_amt: Ext.perioidHdr.get('f_net_total_price'),
            ii: ii,
            dc_expense_budget_type: Ext.perioidHdr.data.dc_expense_budget_type_id
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
    // } 
}
const ip = Ext.session.ip_booking; // 192
const bookingOverlap = function (i, link) {
    var ii = i;
    Ext.getCmp("winDcExpTypeDdd2ID").hide();
    Ext.getCmp('winChequeID').getEl().mask("Please wait...", "x-mask-loading");

    Ext.Ajax.request({
        url: link,
        method: "GET", //POST
        disableCaching: false,
        success: function (result, request) {
            let jsonData = Ext.util.JSON.decode(result.responseText); //decode json  
            if (ii === 2) {
                // jsonData.bg_reserve_overlap_id
                // console.log(jsonData);
                Ext.Ajax.request({
                    url: "tor/api/mnTorController.php",
                    params: {
                        mode: "UPDATE_CONTRACT_BG_OVERLAP2_CHECK", //UPDATE_TOR_DTL_BG
                        sp_check_period_hdr_id: Ext.rec.get('id'), //sp_dtl_id  
                        bg_reserve_overlap_id: jsonData.bg_reserve_overlap_id
                    },
                    method: "POST", //POST
                    success: function (result, request) {
                        Ext.getCmp("winDcExpTypeDdd2ID").destroy();
                        Ext.getCmp("winChequeID").getEl().unmask(); //end 
                        Ext.storePeriodHdr.reload();
                    },
                    failure: function (result, request) {
                        Ext.MessageBox.alert("Failed", result.responseText); // connect error
                    }
                });
            } else {
                Ext.Ajax.request({
                    url: "tor/api/mnTorController.php",
                    params: {
                        mode: "UPDATE_CONTRACT_BG_OVERLAP_CHECK", //UPDATE_TOR_DTL_BG
                        sp_check_period_hdr_id: Ext.rec.get('id'), //sp_dtl_id  
                        c_overlap: Ext.getCmp('c_overlapID').getValue()
                    },
                    method: "POST", //POST
                    success: function (result, request) {
                        Ext.getCmp("winDcExpTypeDdd2ID").destroy();
                        Ext.getCmp("winChequeID").getEl().unmask(); //end 
                        Ext.storePeriodHdr.reload();

                    },
                    failure: function (result, request) {
                        Ext.MessageBox.alert("Failed", result.responseText); // connect error
                    }
                });
            }
        },
        failure: function (result, request) {
            Ext.MessageBox.alert("Failed", result.responseText); // connect error
        }
    });


};
const genLinkBg = function (event, rec) { //c_overlap genLinkBg('c_overlap')
    let link = null;
//TEST    

    let setYear = 0; // product 0 test 1;
    //
//END TEST    
    switch (event) {
        //c_overlap_book

        case "c_overlap":
            link = Ext.session.IPAPIBG
                    + '/?/bg/BgBudgetAllSupplies'
                    + '/i_year/' + ((parseInt(rec.get('i_yyyy')) - setYear) - 543)  //((parseInt(rec.get('i_yyyy')) - setYear)-543)   test +1
                    + '/dc_expense_budget_type_id/' + rec.get('dc_expense_budget_type_id')
                    + '/dc_cost_id/' + rec.get('dc_cost_id')
                    + '/bg_expense_id/' + rec.get('po_expense_id')
                    + '/c_code_overlap/' + encodeURIComponent(Ext.getCmp('c_overlapID').getValue())
                    + '/';
            break;
        case "c_overlap_book":
            link = Ext.session.IPAPIBG
                    + '/?/bg/mn_BgReserveMoney/mode/POST'
                    + '/i_sys/1'
                    + '/pr_id/' + rec.get('sp_tor_id')
                    + '/po_id/' + rec.get('sp_tor_contract_id')
                    + '/chk_id/' + rec.get('id')
                    + '/i_year/' + ((parseInt(rec.get('i_yyyy')) - setYear)) //+((parseInt(rec.get('i_yyyy')) - setYear)-543)    test 1
                    + '/i_pr_type/' + rec.get('i_pr_type1')  //  plan or period
                    + '/i_reserve/3' // step 1 PR step 2 po step3 checking
                    + '/dc_cost_id/' + Ext.selectRow.get('dc_cost_id')
                    + '/dc_budget_type_id/' + rec.get('dc_expense_budget_type_id')
                    + '/bg_expense_id/' + rec.get('po_expense_id')
                    + '/i_last/' + ((rec.get('i_type_contract') === 3) ? 0 : 1) // pr มี สัญญาเดียว = 1
                    + '/c_code_overlap/' + encodeURIComponent(rec.get('c_overlap'))
                    + '/f_amt/' + rec.get('f_net_total_price');
            break;
        case "c_overlap_close":

            link = Ext.session.IPAPIBG
                    + '/?/bg/mn_BgReserveMoney/mode/POST'
                    + '/i_sys/1'
                    + '/pr_id/' + rec.get('sp_tor_id')
                    + '/po_id/' + rec.get('sp_tor_contract_id')
                    + '/chk_id/' + rec.get('id')
                    + '/i_year/' + ((parseInt(rec.get('i_yyyy')) - setYear)) //test 1
                    + '/i_pr_type/' + rec.get('i_pr_type1')  //  plan or period
                    + '/i_reserve/3' // step 1 PR step 2 po step3 checking
                    + '/dc_cost_id/' + Ext.selectRow.get('dc_cost_id')
                    + '/dc_budget_type_id/' + rec.get('dc_expense_budget_type_id')
                    + '/bg_expense_id/' + rec.get('po_expense_id')
                    + '/i_last/' + rec.get('i_is_last')// 
                    + '/c_code_overlap/' + encodeURIComponent(rec.get('c_contract_overlap'))
                    + '/f_amt/' + rec.get('f_net_total_price');
            break;
    }
    return link;
};
const transfer = function (data) {
    return new Ext.Window({
        id: "transfermoney",
        title: "ยืนยันการเปลี่ยนแปลงข้อมูล",
        modal: true,
        width: 800,
        // height: 250,
        items: new Ext.FormPanel({
            id: "Form-Parent",
            frame: true,
            labelAlign: "left",
            bodyStyle: "padding:1px",
            items: [
                {
                    xtype: "displayfield",
                    id: "displaytext",
                    // fieldLabel: "กรุณาตรวจสอบจำนวนเงินที่ถูกยกเลิกก่อนยืนยันการทำรายการ",
                    width: 200,
                    value: "ข้อมูลใบกันเหลื่อมไม่ตรงกับข้อมูลในสัญญา",
                    style: "text-align: center; color:red; white-space: nowrap;",
                },
                {
                    xtype: "textfield",
                    fieldLabel: "แหล่งเงิน (สัญญา)",
                    emptyText: "กรุณาระบุ...",
                    value: Ext.selectRow.get('budget_type'),
                    width: 400,
                    style: "text-align: left;background:#eee;",
                    readOnly: true,
                },
                {
                    xtype: "textfield",
                    fieldLabel: "แหล่งเงิน (ใบกันเหลื่อม)",
                    abelWidth: 150,
                    emptyText: "กรุณาระบุ...",
                    value: Ext.overlap_budget_type.data.c_name,
                    width: 400,
                    style: "text-align: left;background:#eee;",
                    readOnly: true,
                },
                {
                    xtype: "textfield",
                    fieldLabel: "หมวดค่าใช้จ่าย (สัญญา)",
                    emptyText: "กรุณาระบุ...",
                    value: Ext.selectRow.get('expense_name'),
                    width: 400,
                    style: "text-align: left;background:#eee;",
                    readOnly: true,
                },
                {
                    xtype: "textfield",
                    fieldLabel: "หมวดค่าใช้จ่าย (ใบกันเหลื่อม)",
                    labelWidth: 160,
                    emptyText: "กรุณาระบุ...",
                    value: Ext.overlap_expense.data.c_name,
                    width: 400,
                    style: "text-align: left;background:#eee;",
                    readOnly: true,
                },
            ],
        }),
        buttons: [
            {
                text: "ยืนยัน",
                handler: function () {
                    Ext.Ajax.request({
                        url: "tor/api/mnTorController.php",
                        method: "POST",
                        params: {
                            mode: "UP_EXPENSE_BUDGET_CHECKING",
                            sp_tor_id: Ext.selectRow.get('sp_tor_id'),
                            tor_id: Ext.selectRow.get('sp_tor_id'),
                            sp_check_period_dtl_id: Ext.selectRow.get('sp_check_period_dtl_id'),
                            sp_tor_dtl_period_id: Ext.selectRow.get('sp_tor_dtl_period_id'),
                            sp_tor_hdr_period_id: Ext.selectRow.get('sp_tor_hdr_period_id'),
                            po_expense_id: Ext.overlap_expense.data.id,
                            dc_expense_budget_type_id: Ext.overlap_budget_type.data.id,
                        },
                        success: function (result, request) {
                            Ext.getCmp("transfermoney").getEl().unmask();
                            Ext.getCmp("bg_budget_dtl_overlap_idID").getEl().unmask();
                            let json = Ext.util.JSON.decode(result.responseText);
                            Ext.getCmp("transfermoney").destroy();
                            if (json.success == "Success") {
                                Ext.Msg.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย");
                            } else {
                                Ext.Msg.alert("Error", "ผิดพลาด", json.msg);
                            }
                        },
                        failure: function (result, request) {
                            Ext.MessageBox.alert("Failed", result.responseText);
                        },
                    });
                }
            },
            {
                text: 'ย้อนกลับ',
                handler: function () {
                    var id = "bg_budget_dtl_overlap_idID";
                    var nameID = id + "_Name";
                    Ext.getCmp("bg_budget_dtl_overlap_idID").setValue(""); //Ext.getCmp(bg_budget_dtl_overlap_idID).setValue(record.data.id);
                    Ext.getCmp("dc_cost_idID").setValue("");
                    Ext.getCmp("c_overlapID").setValue("");
                    Ext.getCmp("i_yearOverlapID").setValue("");
                    Ext.getCmp(nameID).setValue("");
                    Ext.getCmp("transfermoney").hide();
                    Ext.getCmp("transfermoney").destroy();
                },
            },
        ],
    }).show();
};

function popOverlap(rec) {

    Ext.storeDepartment = new Ext.data.JsonStore({
        storeId: "storeDepartment",
        autoLoad: true,
        url: "api/All.php",
        root: "data",
        baseParams: {type: "storeOverlap", start: 0, limit: 20, mode: null}, //Permission i_read
        idProperty: "id",
        totalProperty: "totalCount",
//                                       fields: ["id", "c_department", "c_name"],
        fields: ["id", 'bg_budget_dtl_overlap_id', 'dc_costTxt', 'c_name', 'i_year', 'c_code_ref', 'dc_expense_budget_type_id', 'dc_cost_id', 'bg_expense_id', 'd_end_date']
    });
    var columnMini = [
        {header: "ID System", sortable: true, hidden: true, dataIndex: "id"},
        {header: "ปีเลขที่ใบกัน", align: "center", width: 150, sortable: true, dataIndex: "i_year"},
        {
            header: "เลขที่ใบกัน",
            sortable: true,
            id: "c_name",
            dataIndex: "c_name",
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                metaData.attr = "style='cursor:pointer';";
                return value;
            },
        },
        {header: "วันหมดอายุใบกัน", sortable: true, dataIndex: "d_end_date"},
        {header: "หน่วยงาน", sortable: true, dataIndex: "dc_costTxt"},
    ];
    Ext.PopDepartmentForm = new Ext.ux.Poplov({
        text: "เลขที่ใบกัน",
        id: "bg_budget_dtl_overlap_idID", //go to relation
        iconCls: "page_magnify",
        name: 'bg_budget_dtl_overlap_id',
        valueHidden: "bg_budget_dtl_overlap_id", //go to hidden
        store: Ext.storeDepartment,
        headerGrid: columnMini,
        widthText: 280,
        fieldLabel: "เลขที่ใบกัน",
        isCellClickGrid: true,
        cellClickGrid: function (grid, rowIndex, columnIndex, e) {
            var id = "bg_budget_dtl_overlap_idID";
            var nameID = id + "_Name";
            var record = grid.getStore().getAt(rowIndex);
            var TextShow = record.data.c_code_ref;
            Ext.recs = record;
            Ext.getCmp(id).setValue(record.data.id); //Ext.getCmp(bg_budget_dtl_overlap_idID).setValue(record.data.id); 
            Ext.getCmp('dc_cost_idID').setValue(record.data.dc_costTxt);
            Ext.getCmp('c_overlapID').setValue(TextShow);
            Ext.getCmp(nameID).setValue(TextShow);
            Ext.getCmp("win-pop-lov" + id).hide();
            Ext.getCmp("win-pop-lov" + id).destroy();
        }
    });

}
Ext.genLink = function (i, f) {
    //winPeriodHdrID
    Ext.getCmp("winPeriodHdrID").getEl().mask("Please wait...", "x-mask-loading");
    var link = '';
    Ext.perioidHdr
    // var ip = 'localhost';

    if (i === 1) { //get Money 
        link = Ext.session.IPAPIBG +
                "/?/bg/BgBudgetAllSupplies" +
                "/i_year/" + Ext.perioidHdr.get("i_yyyy") +
                "/dc_budget_type_id/" + Ext.perioidHdr.get('dc_expense_budget_type_id') +
                "/dc_cost_id/" + Ext.perioidHdr.get("dc_cost_id") +
                "/bg_expense_id/" + Ext.perioidHdr.get("po_expense_id");

    } else if (i === 2) { // Req Money
        link = Ext.session.IPAPIBG
                + '/?/bg/mn_BgRequestMoneyIncome/mode/POST'
                + '/i_sys/1'
                + '/chk_id/' + Ext.perioidHdr.get('id')
                + '/i_year/' + Ext.perioidHdr.get('i_yyyy')
                + '/i_request/2' // step 1 PR step 2 po step3 checking
                + '/dc_cost_id/' + Ext.perioidHdr.get('dc_cost_id')
                + '/dc_budget_type_id/' + Ext.perioidHdr.get('dc_expense_budget_type_id') //
                + '/bg_expense_id/' + Ext.perioidHdr.get('po_expense_id')
                + '/f_amt/' + Ext.perioidHdr.get('f_net_total_price');

    } else if (i === 3) {
        link = Ext.session.IPAPIBG
                + '/?/bg/mn_BgReserveMoney/mode/POST'
                + '/i_sys/1'
                + '/pr_id/' + Ext.perioidHdr.get('sp_tor_id')
                + '/po_id/' + Ext.perioidHdr.get('sp_tor_contract_id')
                + '/chk_id/' + Ext.perioidHdr.get('id')
                + '/i_year/' + Ext.perioidHdr.get('i_yyyy')
                + '/i_pr_type/' + Ext.perioidHdr.get('i_pr_type1')
                + '/i_reserve/3'
                + '/dc_cost_id/' + Ext.perioidHdr.get('dc_cost_id')
                + '/dc_budget_type_id/' + Ext.perioidHdr.get('dc_expense_budget_type_id')
                + '/bg_expense_id/' + Ext.perioidHdr.get('po_expense_id')
                + '/i_last' + '/' + Ext.perioidHdr.get('i_is_last')
                + '/f_amt/' + Ext.perioidHdr.get('f_net_total_price');
    } else if (i === 4) {
        link = Ext.session.IPAPIBG
                + '/?/bg/mn_BgReserveMoney/mode/POST'
                + '/i_sys/1'
                + '/pr_id/' + Ext.perioidHdr.get('sp_tor_id')
                + '/po_id/0'
                + '/chk_id/0'
                + '/i_year/' + Ext.perioidHdr.get('i_yyyy')
                + '/i_pr_type/' + Ext.perioidHdr.get('i_pr_type1')
                + '/i_reserve/1'
                + '/dc_cost_id/' + Ext.perioidHdr.get('dc_cost_id')
                + '/dc_budget_type_id/' + Ext.perioidHdr.get('dc_expense_budget_type_id')
                + '/bg_expense_id/' + Ext.perioidHdr.get('po_expense_id')
                + '/i_last' + '/' + Ext.perioidHdr.get('i_is_last')
                + '/f_amt/' + Ext.perioidHdr.get('f_net_total_price');
    }
    return link;
};
Ext.auditBoong = function (i) {
    var link = Ext.genLink(3, 0);
    Ext.Ajax.request({
        url: link, //record,linkGetMoney
        method: "GET", //POST
        disableCaching: false,
        success: function (result, request) {
            var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
            if (jsonData.success) {
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
Ext.genLink_type_bg = function (rec, getlink, type) {
    var ip = Ext.session.ip_booking;// 192
    i_pr_type1 = Ext.selectRow.get('i_pr_type1');
    dc_budget_type_id = Ext.selectRow.get('dc_expense_budget_type_id');
    var link2 = Ext.session.IPAPIBG
            + "/?/bg/BgBudgetAllSupplies"
            + "/i_year/" + Ext.perioidHdr.get('i_yyyy')
            + "/dc_budget_type_id/" + Ext.perioidHdr.get('dc_expense_budget_type_id')
            + "/dc_cost_id/" + Ext.perioidHdr.get('dc_cost_id')
            + "/bg_expense_id/" + Ext.perioidHdr.get('po_expense_id'); // ลิ้งเช็คเงิน PR

    var link3 = Ext.session.IPAPIBG
            + '/?/bg/mn_BgReserveMoney/mode/POST'
            + '/i_sys/1'
            + '/pr_id/' + Ext.perioidHdr.get('sp_tor_id')
            + '/po_id/' + Ext.perioidHdr.get('sp_tor_contract_id')
            + '/chk_id/0'
            + '/i_year/' + Ext.perioidHdr.get('i_yyyy')
            + '/i_pr_type/' + Ext.perioidHdr.get('i_pr_type1') //  plan or period
            + '/i_reserve/2' // step 1 PR step 2 po step3 checking
            + '/dc_cost_id/' + Ext.perioidHdr.get('dc_cost_id')
            + '/dc_budget_type_id/' + Ext.perioidHdr.get('dc_expense_budget_type_id')
            + '/bg_expense_id/' + Ext.perioidHdr.get('po_expense_id')
            + '/i_last/' + ((Ext.perioidHdr.get('i_type_contract') == 3) ? 0 : 1)
            + '/f_amt/' + Ext.perioidHdr.get('f_net_total_price');
    if (Ext.perioidHdr.data.pr_bg_reserve_money1_id == 0 && Ext.perioidHdr.data.pr_bg_reserve_money2_id == 0 && Ext.perioidHdr.data.pr_bg_reserve_money3_id == 0 && Ext.perioidHdr.data.bg_reserve_money_id == 0) {
        ii = 1
    } else if (Ext.perioidHdr.data.pr_bg_reserve_money1_id > 0 && Ext.perioidHdr.data.pr_bg_reserve_money2_id == 0 && Ext.perioidHdr.data.pr_bg_reserve_money3_id == 0 && Ext.perioidHdr.data.bg_reserve_money_id == 0) {
        // && Ext.perioidHdr.data.pr_dc_expense_budget_type_id > 0  && Ext.perioidHdr.data.pr_dc_expense_budget_type2_id == 0 && Ext.perioidHdr.data.pr_dc_expense_budget_type3_id == 0 ){
        ii = 2
    } else if (Ext.perioidHdr.data.pr_bg_reserve_money1_id > 0 && Ext.perioidHdr.data.pr_bg_reserve_money2_id > 0 && Ext.perioidHdr.data.pr_bg_reserve_money3_id == 0 && Ext.perioidHdr.data.bg_reserve_money_id == 0) {
        // && Ext.perioidHdr.data.pr_dc_expense_budget_type_id > 0  && Ext.perioidHdr.data.pr_dc_expense_budget_type2_id > 0 && Ext.perioidHdr.data.pr_dc_expense_budget_type3_id == 0  ){
        ii = 3
    } else if (Ext.perioidHdr.data.bg_reserve_money_id > 0 && Ext.perioidHdr.data.i_type_bg != 9) {
        ii = 0
    } else if (Ext.perioidHdr.data.i_type_bg == 9) {
        ii = 1
        Ext.Ajax.request({
            url: "tor/api/mnTorController.php",
            method: "POST",
            params: {
                mode: "BACKUP_BG_RESERVE_MONEY",
                sp_tor_id: Ext.perioidHdr.get('sp_tor_id'),
                sp_tor_contract_id: Ext.perioidHdr.get('sp_tor_contract_id'),
                i_yyyy: Ext.perioidHdr.get('i_yyyy'),
                i_pr_type1: Ext.perioidHdr.get('i_pr_type1'),
                dc_cost_id: Ext.perioidHdr.get('dc_cost_id'),
                dc_expense_budget_type_id: Ext.perioidHdr.get('dc_expense_budget_type_id'),
                po_expense_id: Ext.perioidHdr.get('po_expense_id'),
                i_is_last: Ext.perioidHdr.get('i_is_last'),
                f_net_total_price: Ext.perioidHdr.get('f_net_total_price'),
                pr_bg_reserve_money1_id: Ext.perioidHdr.data.pr_bg_reserve_money1_id,
                sp_check_period_hdr_id: Ext.perioidHdr.get('id')
            },
            success: function (result, request) {
                // Ext.MessageBox.alert("Success", "เงินจองเพียงพอ ", function () {
                //     Ext.getCmp("winPeriodHdrID").getEl().unmask();// ต้องลบหลังทำเสร็จ 
                // });
            },
            failure: function (result, request) {
                Ext.MessageBox.alert("Failed", result.responseText); // connect error
            },
        });
    } else {
        ii = 0
    }
    // return ;
    link = Ext.genLink(4, 0)
    Ext.Ajax.request({
        url: link2,
        method: "GET", //POST
        disableCaching: false,
        success: function (result, request) {
            var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
            if (jsonData.totalCount > 0) {
                var f_amt = 0;
                var cheVal = Ext.perioidHdr.get('f_net_total_price').replace(/,/g, "") / 1;
                f_amt = parseFloat(jsonData.data[0].f_total_plan);
                if (f_amt >= cheVal) {
                    if (getlink == 1 || ii > 0) {
                        Ext.Ajax.request({
                            url: link,
                            method: "GET", //POST
                            disableCaching: false,
                            success: function (result, request) {
                                var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                                if (jsonData.success) {
                                    // Ext.MessageBox.alert("Success", "ทำการเรียบร้อยแล้ว", function () {
                                    purchase2(Ext.perioidHdr.get("sp_tor_id"), jsonData.bg_reserve_money_id, ii);
                                    // });
                                    Ext.Ajax.request({
                                        url: link3,
                                        method: "GET", //POST
                                        disableCaching: false,
                                        success: function (result, request) {
                                            var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                                            if (jsonData.success) {
                                                // Ext.MessageBox.alert("Success", "ทำการเรียบร้อยแล้ว", function () {
                                                updateBookingContract(Ext.selectRow.get('sp_tor_contract_id'), jsonData.bg_reserve_money_id, ii);
                                                // Ext.getCmp('formDcExpTypeDddID').getEl().unmask();
                                                // });
                                            } else {
                                                Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                                                Ext.getCmp('formDcExpTypeDddID').getEl().unmask();
                                            }
                                        },
                                        failure: function (result, request) {
                                            Ext.MessageBox.alert("Failed", result.responseText); // connect error
                                            Ext.getCmp('formDcExpTypeDddID').getEl().unmask();
                                        },
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
                            url: "tor/api/mnCheckingController.php",
                            method: "POST",
                            params: {
                                mode: "UP_BG_RESERVE_MONEY",
                                sp_tor_id: Ext.perioidHdr.get('sp_tor_id'),
                                sp_tor_contract_id: Ext.perioidHdr.get('sp_tor_contract_id'),
                                i_yyyy: Ext.perioidHdr.get('i_yyyy'),
                                i_pr_type1: Ext.perioidHdr.get('i_pr_type1'),
                                dc_cost_id: Ext.perioidHdr.get('dc_cost_id'),
                                dc_expense_budget_type_id: Ext.perioidHdr.get('dc_expense_budget_type_id'),
                                po_expense_id: Ext.perioidHdr.get('po_expense_id'),
                                i_is_last: Ext.perioidHdr.get('i_is_last'),
                                f_net_total_price: Ext.perioidHdr.get('f_net_total_price')
                            },
                            success: function (result, request) {
                                Ext.MessageBox.alert("Success", "เงินจองเพียงพอ ", function () {
                                    Ext.getCmp("winPeriodHdrID").getEl().unmask();// ต้องลบหลังทำเสร็จ 
                                });
                            },
                            failure: function (result, request) {
                                Ext.MessageBox.alert("Failed", result.responseText); // connect error
                            },
                        });
                    }
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


//----------------------------------------------------------------
Ext.c_overlap_close = function (rec) {
    var link = genLinkBg('c_overlap_close', rec)
    // alert(genLinkBg('c_overlap_close',rec)) ;
    // return false ;
    Ext.Ajax.request({
        url: link, //record,linkGetMoney
        method: "GET", //POST
        disableCaching: false,
        success: function (result, request) {
            var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
            // console.log(jsonData);
            if (jsonData.success) {
                Ext.MessageBox.alert("Success", "เรียบร้อยแล้ว", function () {
                    Ext.Ajax.request({
                        url: "tor/api/mnPeriodController.php",
                        method: "POST",
                        params: {
                            mode: "UP_BG_CHECKING_OVERLAP",
                            id: Ext.perioidHdr.get('sp_tor_hdr_period_id'), //hdr_peirod_id
                            sp_check_period_hdr_id: Ext.perioidHdr.get('id'), //checking_hdr_id
                            i_overlap: 3,
                            bg_reserve_overlap_id: jsonData.bg_reserve_overlap_id
                        },
                        success: function (result, request) {

                            Ext.getCmp("winPeriodHdrID").getEl().unmask();
                            let json = Ext.util.JSON.decode(result.responseText);
                            Ext.genCode();
//            if (request.success) {
//                Ext.getCmp("winPeriodHdrID").hide();
//                Ext.getCmp("winPeriodHdrID").destroy();
//            }
                        },
                        failure: function (result, request) {
                            Ext.MessageBox.alert("Failed", result.responseText);
                        }
                    });
                    // id, req, f, bgid
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
Ext.getMoney = function (rs) {
    if (Ext.perioidHdr.data.i_type_bg == 8) {
        if (Ext.perioidHdr.data.i_period == 1 || Ext.perioidHdr.data.pr_bg_reserve_money1_id == 0 && Ext.perioidHdr.data.request_money_income != 2 && Ext.perioidHdr.data.bg_reserve_money_id == 0) {
            Ext.genLink_type_bg(rs, 1)
        } else if (Ext.perioidHdr.data.pr_bg_reserve_money2_id == 0 && Ext.perioidHdr.data.request_money_income != 2 && Ext.perioidHdr.data.bg_reserve_money_id == 0) {
            Ext.genLink_type_bg(rs, 1)
        } else if (Ext.perioidHdr.data.pr_bg_reserve_money3_id == 0 && Ext.perioidHdr.data.request_money_income != 2 && Ext.perioidHdr.data.bg_reserve_money_id == 0) {
            Ext.genLink_type_bg(rs, 1)
        } else {
            Ext.genLink_type_bg(rs, 2)
        }
    }
    if (Ext.perioidHdr.data.i_type_bg == 9) {
        Ext.genLink_type_bg(rs, 1)
    }
    // return ; 
    // if (Ext.perioidHdr.data.pr_bg_reserve_money1_id >= 0 && Ext.perioidHdr.data.po_bg_reserve_money1_id >= 0  ) { 
    Ext.perioidHdr = rs;
    var link = Ext.genLink(1, 0);
    Ext.Ajax.request({
        url: link, //record,linkGetMoney
        method: "GET", //POST
        disableCaching: false,
        success: function (result, request) {
            var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
            var cheVal = parseFloat(rs.get('f_net_total_price').replace(/\,/g, ''));
            var f_total_income = parseFloat(jsonData.data[0].f_total_income.replace(/\,/g, ''));
            if (jsonData.debug) {
                if (f_total_income >= cheVal) {
                    Ext.MessageBox.alert("Success", "เงินที่จะเบิกมีเพียงพอ", function () {
                        Ext.auditBoong();
                    });
                } else {
                    Ext.MessageBox.alert("Success", "เงินรายได้รับจริงไม่พอ ระบบได้ดำเนินการร้องของเงินแล้ว กรุณาติดต่อฝ่ายคลัง", function () {
                        if (Ext.perioidHdr.data.bg_reserve_money_id == 0) {
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
// }
};

Ext.reqMoney = function (id, req, f) {
    var link = Ext.genLink(2, f);
    Ext.Ajax.request({
        url: link, //record,linkGetMoney
        method: "GET", //POST
        disableCaching: false,
        success: function (result, request) {
            var jsonData = Ext.util.JSON.decode(result.responseText); //decode json 
            if (jsonData.success) {
                Ext.upMoneyId(Ext.perioidHdr.get('id'), 1, f, jsonData.bg_request_money_income_id);
            } else {
                Ext.MessageBox.alert("Failed", "ข้อมูลผิดพลาด ติดต่อ admin<br>" + jsonData.msg)
            }
        },
        failure: function (result, request) {
            Ext.MessageBox.alert("Failed", result.responseText); // connect error
        },
    });
};
Ext.upMoneyId = function (id, req, f, bgid) {
    Ext.Ajax.request({
        url: "tor/api/mnPeriodController.php",
        method: "POST",
        params: {
            mode: "UP_BG_CHECKING_HDR",
            id: Ext.perioidHdr.get('sp_tor_hdr_period_id'), //hdr_peirod_id
            sp_check_period_hdr_id: Ext.perioidHdr.get('id'), //checking_hdr_id
            f_amt: f,
            bg_reserve_money_id: bgid,
            request_money_income: 2
        },
        success: function (result, request) {
            Ext.getCmp("winPeriodHdrID").getEl().unmask();
            let json = Ext.util.JSON.decode(result.responseText);
            if (request.success) {
                Ext.getCmp("winPeriodHdrID").hide();
                Ext.getCmp("winPeriodHdrID").destroy();
            }
        },
        failure: function (result, request) {
            Ext.MessageBox.alert("Failed", result.responseText);
        }
    });
};

Ext.genCode = function () {
    Ext.Ajax.request({
        url: "tor/api/mnCheckCode.php",
        method: "POST",
        params: {
            mode: "GENCODECHECKING",
            sp_check_period_hdr_id: Ext.perioidHdr.get('id'),
            i_is_warranty: Ext.perioidHdr.get('i_is_warranty'),
            sp_tor_contract_id: Ext.perioidHdr.get('sp_tor_contract_id')
        },
        success: function (result, request) {
            if (result.statusText) {
                Ext.storeDtl.reload();
                Ext.Msg.alert("แจ้งเตือน", "หักเงินและออกเลขเรียบร้อยแล้ว");
                Ext.getCmp("winPeriodHdrID").destroy();
            }
        },
        failure: function (result, request) {
            Ext.MessageBox.alert("Failed", result.responseText);
        }
    });
};

Ext.upMoneyCheckingId = function (id, req, f, bgid) {
    // alert(' update id ' + id + ' req ' + req + ' f = ' + f + ' update bgid ' + bgid);

    Ext.Ajax.request({
        url: "tor/api/mnPeriodController.php",
        method: "POST",
        params: {
            mode: "UP_BG_CHECKING_BOOKING_HDR",
            id: Ext.perioidHdr.get('sp_tor_hdr_period_id'), //hdr_peirod_id
            sp_check_period_hdr_id: Ext.perioidHdr.get('id'), //checking_hdr_id
            f_amt: f,
            bg_checking_money_id: id
        },
        success: function (result, request) {

            Ext.getCmp("winPeriodHdrID").getEl().unmask();
            let json = Ext.util.JSON.decode(result.responseText);
            Ext.genCode();
//            if (request.success) {
//                Ext.getCmp("winPeriodHdrID").hide();
//                Ext.getCmp("winPeriodHdrID").destroy();
//            }
        },
        failure: function (result, request) {
            Ext.MessageBox.alert("Failed", result.responseText);
        }
    });
};

function winWarranty(rec) {

    var comboProduct = new Ext.form.ComboBox({
        mode: "local",
        store: Ext.storePeriodDtl,
        fieldLabel: "รายการที่รับประกัน",
        anchor: "50%",
        id: "mode_product_idID",
        submitValue: true,
        name: "c_mode_product",
        hiddenName: "mode_product_id",
        valueField: "id",
        displayField: "c_name",
        triggerAction: "all",
        forceSelection: true,
        selectOnFocus: true,
        typeAhead: false,
        emptyText: "กรุณาเลือกรายรับประกัน...",
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
    });
    return new Ext.Window({
        collapsible: true,
        maximizable: true,
        title: "บันทีกการรับประกันแยก",
        width: Ext.getCmp("contenterCenter").getWidth() - 5,
        height: Ext.getCmp("contenterCenter").getHeight() - 5,
        layout: "fit",
        id: "winWarrantyID",
        modal: true,
        plain: true,
        labelWidth: 300,
        items: [{
                xtype: 'form',
                id: 'frm-warrantyID',
                url: 'api/mnWarrantyController.php',
                lableWidth: 300,
                items: [{
                        xtype: 'hidden',
                        name: 'd_doc_date',
                        value: rec.get('d_doc_date'),
                    }, comboProduct, {
                        xtype: "radiogroup",
                        columns: [220],
                        fieldLabel: "ประกันของ",
                        id: "i_is_warranty2ID",
                        style: {
                            "font-weight": "bold",
                        },
                        items: [//i_status_checking
                            {
                                name: "i_is_warranty",
                                inputValue: 1,
                                checked: true,
                                boxLabel: "มีการรับประกัน",
                            }
                        ], listeners: {
                            change: function () {
                                this.fn();
                            },
                            afterrender: function () {
                                this.fn = function () {
                                    if (this.getValue().inputValue == 1) {
                                        Ext.getCmp('warraty_age2ID').show();
                                        Ext.getCmp('i_warraty_end2ID').show();
                                        Ext.getCmp('i_notif_day2ID').show();
                                        Ext.getCmp('notif_day2ID').show();
                                    } else {
                                        Ext.getCmp('warraty_age2ID').hide();
                                        Ext.getCmp('i_warraty_end2ID').hide();
                                        Ext.getCmp('i_notif_day2ID').hide();
                                        Ext.getCmp('notif_day2ID').hide();
                                    }
                                }
                            }
                        }
                    }, {
                        fieldLabel: "วันที่ตรวจรับ",
                        xtype: "datefield",
                        readOnly: true,
                        name: "d_checking_date",
                        value: rec.get('d_checking_date')
                    }, {
                        xtype: "radiogroup",
                        columns: [120, 120],
                        fieldLabel: "หน่วยการคิดประกัน",
                        id: "i_permonthID",
                        style: {
                            "font-weight": "bold",
                        },
                        items: [//i_status_checking
                            {
                                name: "i_permonth",
                                inputValue: 1,
                                checked: true,
                                boxLabel: "เดือน",
                            },
                            {
                                name: "i_permonth",
                                inputValue: 0,
                                checked: false,
                                boxLabel: "วัน",
                            }
                        ], listeners: {
                            change: function () {
                                this.fn();
                            },
                            afterrender: function () {
                                this.fn = function () {
                                    if (this.getValue().inputValue == 1) {

                                    } else {

                                    }
                                }
                            }
                        }
                    },
                    {

                        fieldLabel: "ระยะเวลารับประกัน/เดือน",
                        xtype: "numberfield",
                        value: 24,
                        name: "warraty_age",
                        id: "warraty_age2ID",
                        validator: function (val) {
                            if (Ext.isEmpty(val)) {
                                return "กรุณากรอก วันที่ออกเอกสาร ";
                            } else {
                                return true;
                            }
                        },
                        listeners: {
                            blur: function () {
                                getWarraty();
                            }
                        }
                    },
                    {
                        fieldLabel: "วันที่หมดรับประกัน",
                        xtype: "datefield",
                        readOnly: true,
                        name: "i_warraty_end",
                        id: "i_warraty_end2ID",
                        validator: function (val) {
                            if (Ext.isEmpty(val)) {
                                return "กรุณากรอก วันที่ออกเอกสาร ";
                            } else {
                                return true;
                            }
                        },
                    },
                    {
                        fieldLabel: "แจ้งเตือนก่อน/วัน",
                        xtype: "numberfield",
                        name: "i_notif_day",
                        value: 15,
                        id: "i_notif_day2ID",
                        validator: function (val) {
                            if (Ext.isEmpty(val)) {
                                return "กรุณากรอก วันที่ออกเอกสาร ";
                            } else {
                                return true;
                            }
                        },
                        listeners: {
                            chage: function () {
                                getWarraty();
                            }
                        }},
                    {
                        fieldLabel: "วันที่แจ้งเตือนก่อนหมดรับประกัน",
                        xtype: "datefield",
                        readOnly: true,
                        name: "notif_day",
                        id: "notif_day2ID",
                        validator: function (val) {
                            if (Ext.isEmpty(val)) {
                                return "กรุณากรอก วันที่ออกเอกสาร ";
                            } else {
                                return true;
                            }
                        },
                    },
                    {
                        fieldLabel: "เลขอ้างอิงเอกสารในการรับของ",
                        xtype: "displayfield",
                        name: "c_arrive_code", //c_arrive_code
                    },
                    {
                        fieldLabel: "วันที่รับของ",
                        xtype: "displayfield",
                        name: "d_arrive_date",
                    }],
            }],
        buttonAlign: "left",
        buttons: [
            {
                text: "บันทึกรายการ2",
                id: "buSavePopSub2ID",
                iconCls: "icon-save",

                handler: function () {

                },
                //haddler
            },
            {
                text: Ext.GLOBAL_BU_BACK_TH,
                handler: function () {
                    Ext.getCmp("winWarrantyID").hide();
                    Ext.getCmp("winWarrantyID").destroy();
                },
            },
        ]
    });
}
function winProcess(record) {
    var rec = Ext.perioidHdr.data;
    var record = record[0].data;
    var f_net_total_price = (rec.f_net_total_price == undefined ? 0 : rec.f_net_total_price.replace(/,/g, "") / 1);  // จำนวนเงินที่กำลังจะตรวจรับ
    var f_total_amt2 = (record.f_total_amt2 == undefined ? 0 : record.f_total_amt2.replace(/,/g, "") - 0);
    var sum_check = (record.sum_check2 == undefined ? 0 : record.sum_check2.replace(/,/g, "") / 1);
    var sum_check_all = ((sum_check.toFixed(2) - 0) + (f_net_total_price.toFixed(2) - 0)).toFixed(2); //เงินที่กำลังจะตรวจรับ
    var sum_check_out = (sum_check_all / 1) - ((((f_net_total_price.toFixed(2) / 1) + (sum_check.toFixed(2) / 1)) / 1).toFixed(2) / 1);
    //โชว์ข้อมูล
    var sum_check_out2 = floatRenderer(floatMinus(sum_check_out, 2))
    var sum_check2 = floatRenderer(floatMinus(sum_check, 2))
    var f_net_total_price2 = floatRenderer(floatMinus(f_net_total_price, 2))
    var f_total_amt3 = floatRenderer(floatMinus(f_total_amt2, 2))
    new Ext.Window({
        id: "win-processID",
        title: "ตรวจสอบข้อมูล(เนื่องจากคุณเลือกงวดนีัเป็นงวดสุดท้าย)",
        modal: true,
        resizable: false,
        width: 550,
        layout: "form",
        labelWidth: 180,
        bodyStyle: "padding:3px;",
        items: [
            {
                xtype: "textfield",
                readOnly: true,
                fieldLabel: "วงเงินสัญญา",
                value: f_total_amt3,
            },
            {
                xtype: "textfield",
                readOnly: true,
                fieldLabel: "จำนวนเงินที่เคยตรวจรับ",
                value: sum_check2,
            },
            {
                xtype: "textfield",
                readOnly: true,
                fieldLabel: "จำนวนเงินที่กำลังจะตรวจรับ",
                value: f_net_total_price2,
            },
            {
                xtype: "buttongroup",
                fieldLabel: "จำนวนเงินที่เหลือจากการตรวจรับ (จะถูกคืนให้งบประมาณ)",
                frame: false,
                border: false,
                items: [
                    {
                        xtype: "textfield",
                        readOnly: true,
                        fieldLabel: "จำนวนเงินที่เหลือจากการตรวจรับ",
                        name: "f_total_amt",
                        value: sum_check_out2,
                    },
                    {
                        xtype: "label",
                        style: {
                            color: "red",
                            width: "100px",
                        },
                        text: "* จำนวนเงินนี้จะถูกคืนให้ทางงบประมาณทันทีเมื่อกดยืนยัน",
                    },
                ],
            },
        ],
        buttons: [
            {
                text: "ยืนยันการทำรายการต่อ",
                iconCls: "icon-save",
                id: "checkID",
                value: 0,
                handler: function () {
                    Ext.getMoney(Ext.perioidHdr); // ออกเลขตรวจรับ
                    Ext.getCmp("win-processID").destroy();
                    if (location.host != 'localhost:8080') {
                        var alert_text = "แจ้งเตือนเงินงวดสุดท้ายเกิน10,000\n";
                        alert_text += "Time : " + new Date().toLocaleString('en-ZA') + "\n";
                        alert_text += "Host : " + location.host + "\n";
                        alert_text += "File : sp/tor/checking.js \n";
                        alert_text += "จำนวนเงินที่คืนทางงบประมาณ : " + floatRenderer(floatMinus(String(sum_check_out).replace(/,/g, ""), 2)) + "\n";
                        alert_text += "ชื่อผู้ทำรายการ : " + record.user_name + "\n";
                        if (sum_check_out > 10000) {
                            Ext.Ajax.request({
                                url: Ext.session.Notif_line,
                                method: "POST",
                                params: {
                                    msg: alert_text,
                                },
                            });
                        }
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
function BillingwinProcess(record) {
    console.log(record);
    new Ext.Window({
        id: "Billing-win-processID",
        title: "การกรอกช้อมูลใบวางบิล",
        modal: true,
        resizable: false,
        width: 550,
        layout: "form",
        labelWidth: 180,
        bodyStyle: "padding:3px;",
        items: [
            {
                xtype: "textfield",
                // readOnly: true,
                fieldLabel: "เลขที่ใบวางบิล",
                name: "c_Billing_code",
                id: "c_Billing_codeID",
                value: record.data.c_billing_code,
            },
        ],
        buttons: [
            {
                text: "ยืนยันการทำรายการต่อ",
                iconCls: "icon-save",
                id: "checkID",
                value: 0,
                handler: function () {
                    // console.log(Ext.getCmp('c_Billing_codeID').getValue());
                    // return;
                    if (["", null, undefined].includes(Ext.getCmp("c_Billing_codeID").getValue())) {
                        Ext.example.msg("แจ้งเตือน", "กรุณากรอกข้อมูล", 1);
                        $(this).next("text copied");
                        setTimeout(function () {
                            $(this).next().remove();
                        }, 6000);
                        return;
                    } else {
                        Ext.Ajax.request({
                            url: "tor/api/mnCheckingController.php",
                            method: "POST",
                            params: {
                                mode: "Billed_Last_Month",
                                sp_check_period_hdr_id: record.data.sp_check_period_hdr_id,
                                c_Billing_code: Ext.getCmp('c_Billing_codeID').getValue(),
                                // d_update_date: Ext.getCmp('c_Billing_codeID').getValue(),
                                // sp_tor_contract_id : rec.data.sp_tor_contract_id
                            },
                            success: function (result, request) {
                                if (result.statusText) {
                                    Ext.storeDtl.reload({
                                        callback: function (record, operation, success) {
                                            if (success) {
                                                Ext.receiveJson2 = function (obj, id) {
                                                    let Date_now = new Date();
                                                    let jsonApplay = Ext.apply(obj, {client_datetime: Date_now.format('Y-m-d H:i:s'),
                                                        user_sent_id: Ext.session.user_id,
                                                        user_id: '40048',
                                                        user_sent_name: Ext.session.user_name,
                                                        c_menu: 'checking',
                                                        i_status: 1
                                                    });
                                                    Ext.Ajax.request({
                                                        url: "../php-notic/insertLoger.php",
                                                        method: "POST",
                                                        params: jsonApplay,
                                                        success: function (response) {
                                                        }
                                                    });
                                                };
                                                textSent = Ext.getCmp('c_Billing_codeID').getValue();
                                                // Ext.realTimeSentMsg = function (id, textSent) {
                                                var wsUri = "ws://" + window.parent.Ext.ipServer + ":9000/demo/server.php";
                                                websocket = new WebSocket(wsUri);
                                                websocket.onopen = function (ev) { // connection is open   
                                                    var msg = {
                                                        message: "มีการวางบิล  เลขที่บิล: " + textSent,
                                                        name: '40048',
                                                        sent_name: Ext.session.user_name,
                                                        color: '#007AFF'
                                                    };
                                                    websocket.send(JSON.stringify(msg));
                                                };
                                                var obj = {
                                                    "type": "usermsg",
                                                    "name": "40048",
                                                    "sent_name": Ext.session.user_name,
                                                    "message": "บันทึกการวางบิลแล้ว เลขที่บิล " + textSent,
                                                    "color": "#007AFF"
                                                };
                                                Ext.receiveJson2(obj, id);
                                                if (location.host != 'localhost:8080') {
                                                    var alert_text = "มีการวางบิลจากเลขที่ : " + textSent + "\n";
                                                    alert_text += "เวลา : " + new Date().toLocaleString('en-ZA') + "\n";
                                                    // alert_text += "สถานะ :  มีการวางผ  \n";
                                                    alert_text += "ผู้ขายผู้รับจ้าง : " + Ext.selectRow.get("dc_creditor_name") + "\n";
                                                    alert_text += "ชื่อรายการ : " + Ext.selectRow.get("c_name") + "\n";
                                                    alert_text += "เลชที่ตรวจรับในระบบ : " + Ext.selectRow.get("c_checking_code") + "\n";
                                                    alert_text += "จำนวนเงิน : " + Ext.selectRow.get("f_net_total_price") + "\n";
                                                    alert_text += "ชื่อผู้ทำรายการ : " + Ext.session.user_name + "\n";
                                                    Ext.Ajax.request({
                                                        url: "http://" + location.hostname + ":8080/supplies/lib/lineNotif/send_line_dev.php",
                                                        method: "POST",
                                                        params: {
                                                            msg: alert_text,
                                                            mode: 1
                                                        },
                                                    });
                                                }
                                                Ext.getCmp('Billing-win-processID').getEl().unmask();
                                                Ext.getCmp('Billing-win-processID').destroy();
                                            }
                                        }
                                    });
                                }
                            },
                            failure: function (result, request) {
                                Ext.MessageBox.alert("Failed", result.responseText);
                            }
                        });
                    }
                },
            },
            {
                text: Ext.GLOBAL_BU_BACK_TH,
                iconCls: "icon-clear",
                handler: function () {
                    Ext.getCmp("Billing-win-processID").destroy(); // clear memory :: garbage collection
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
//        -------------------POST-------------------------------------------

        if (rec.get("c_contract_code") == "" || rec.get("c_contract_code") == null || rec.get("d_checking_date") == '') {
            Ext.Msg.alert("แจ้งเตือน", "ต้องออกเลขตรวจรับในระบบก่อน", function (bu, action) {
                console.log(rec);
                return false;
            });
//        } else if (rec.get("i_step") == 0) {
//            Ext.Msg.alert("แจ้งเตือน"
//                    , "<span style='white-space: nowrap;'>กรุณาบันทึกรายการก่อนผ่านรายการ</span><br>" + rec.get("i_step")
//                    , function (bu, action) {
//                        return false;
//                    });
//            return;
        } else {
            Ext.Msg.buttonText = {
                ok: "ตกลง",
                cancel: "ยกเลิก",
                yes: "ผ่านรายการ",
                no: "ไม่",
            };
            if (rec.data.i_type_bg == 4 || rec.data.i_type_bg == 3) {
                BillingwinProcess(rec);
            } else {
                Ext.Msg.alert("แจ้งเตือน", "รายการนี้ไม้ใช่รายการกันเหลื่อมไม่สามารถทำรายการวางบิลได้", function (bu, action) {
                    console.log(rec);
                    return false;
                });
            }
        }

        // if (Ext.isEmpty(Ext.getCmp("reasonID").getValue()))
        //     Ext.getCmp("reasonID").setValue('');
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
            title: "แก้ไขผู้รับผิดชอบงาน",
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
                        value: "UPDATE_EMP",
                        name: "mode",
                    },
                    Ext.PopDepartmentForm.mini,
                    {
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
                    text: "บันทึกรายการ3",
                    id: "buSavePopSubID",
                    iconCls: "icon-save",
                    listeners: {
                        afterrender: function () {
                            Ext.getCmp("buSavePopSubID").hide();
                            console.log(Ext.selectRow);
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
}
; // Controller 

var cellClick = function (grid, rowIndex, columnIndex, e) {

    Ext.selectRow = this.selModel.selection.record;
    if (columnIndex === grid.getColumnModel().getIndexById("i_is_workID")) {
        if (!Ext.isEmpty(Ext.selectRow)) {
            if (Ext.selectRow.get('i_period') > 1)
                Ext.workScore();
            else
                Ext.MessageBox.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>เพิ่มคะแนนภาระต้องมากกว่า 1 งวด</span>");
        }
    } else if (columnIndex === grid.getColumnModel().getIndexById("processDueID")) {
        // alert('processDueID');
        // winProcess();
        // return;
        controller(Ext.selectRow, "processUpdate"); //on
    } else if (columnIndex === grid.getColumnModel().getIndexById("editEmpTorID")) {
        controller(Ext.selectRow, "editEmpTorID");
    } else if (columnIndex === grid.getColumnModel().getIndexById("processDueID")) {
        controller(Ext.selectRow, "processDue"); //on
    } else if (columnIndex === grid.getColumnModel().getIndexById("check_pdfID")) {
        console.log(Ext.selectRow.data.check_pdf);
        if (Ext.selectRow.data.check_pdf > 0) {
            var linkDownload = window.location.protocol + "//" + window.location.hostname + "/sp_mn/api/upload_chk/";
            if (Ext.isEmpty(Ext.selectRow))
                Ext.MessageBox.alert("แจ้งเตือน", "กรุณากดเลือกข้อมูลที่จะแสดง/ออกเลข PR ก่อน");
            window.open(linkDownload + Ext.selectRow.get("c_arrive_code") + ".pdf?T=Tap_" + Math.floor(Math.random() * 100000), "_blank", 'fullscreen="yes"');
        }
    } else {
        Ext.period_status = false;
    }
};
var getWarraty = function () {
    var a = Ext.getCmp('d_checking_dateID').getValue() || {};
    var b = Ext.getCmp('warraty_ageID').getValue() || {};
    var c = Ext.getCmp('i_notif_dayID').getValue() || {};
    var warranty_day = new Date(a).add(Date.MONTH, b);
    var notif_warranty_day = new Date(warranty_day).add(Date.DAY, -parseInt(c));
    Ext.getCmp('i_warraty_endID').setValue(warranty_day.format("d-m-Y"));
    Ext.getCmp('notif_dayID').setValue(notif_warranty_day.format("d-m-Y"));
};
Ext.SearchFrm = function () {

    return new Ext.Window({
        //                     collapsible: true,
        //                     maximizable: true,
        title: "ค้นหารายการ",
        width: 500,
        id: "winSearchFrm",
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
                        ],
                    },
                ],
                buttonAlign: "left",
                buttons: [
                    {
                        text: "ค้นหา",
                        handler: function () {
                            Ext.storeDtl.setBaseParam("mode", "LIST_SUB_PERIOD_HDR");
                            Ext.storeDtl.setBaseParam("act", "SEARCH");
                            /*c_doc_refID c_codeID*/
//                            Ext.storeDtl.setBaseParam("d_tor_date", Ext.getCmp("sd_tor_dateID").getValue());
//                            Ext.storeDtl.setBaseParam("tor_type_id", Ext.getCmp("stor_type_idID").getValue()); 
                            Ext.storeDtl.setBaseParam("c_code", Ext.getCmp("c_codeID").getValue());
                            Ext.storeDtl.setBaseParam("c_arrive_code", Ext.getCmp("c_arrive_codeID").getValue());
                            Ext.storeDtl.setBaseParam("c_doc_ref", Ext.getCmp("c_doc_refID").getValue());
                            //Ext.storeDtl.setBaseParam("i_notor", Ext.getCmp("i_notorID").getValue().inputValue);
//                            Ext.storeDtl.setBaseParam("c_name", Ext.getCmp("sc_nameID").getValue());
//                            Ext.storeDtl.setBaseParam("i_enabled", Ext.getCmp("searchEnabledID").getValue().inputValue);
//                            Ext.storeDtl.setBaseParam("i_post", Ext.getCmp("searchPostID").getValue().inputValue);
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
};
Ext.AppUx = function (app, menu) {
    Ext.user_right_add = user_right_add;
    Ext.user_right_edit = user_right_edit;
    Ext.user_right_delete = user_right_delete;
    Ext.title = Ext.menu_name + " " + Ext.menu_code;
    Ext.HDR_ID = null;
    Ext.chkBg = false;
    Ext.chkBg.status = false;
    Ext.chkBgfn = function (st, f, f_bg, cancle) {
        Ext.chkBg = Ext.apply({status: st, f_amt: f, f_bg: f_bg});
        var cl = cancle || null;
        if (cl) {
            Ext.getCmp("disBgID").setValue(cl === true ? "เบิกได้ไม่ผ่าน" : "กรุณาตรวจสอบเงินคงเหลือที่มีอยู่จริง");
            Ext.getCmp("buSaveSub3ID").setText(cl === true ? "บันทึกรายการไม่ผ่าน" : "ตรวจสอบเงิน");
        } else {
            Ext.getCmp("disBgID").setValue(Ext.chkBg.status === true ? "เบิกได้" : "กรุณาตรวจสอบเงินคงเหลือที่มีอยู่จริง");
            Ext.getCmp("buSaveSub3ID").setText(Ext.chkBg.status === true ? "บันทึกรายการ" : "ตรวจสอบเงิน");
        }
    };
    // storeYear
    Ext.selectRow = [];
    // copy text in cell on select row no  Ext.storePeriodHdr.setParam("",record.get(""));
    let years = [];
    let currentTime = new Date();
    let now = currentTime.getFullYear() + 1;
    let id = currentTime.getFullYear() - 3;
    while (id <= now) {
        let c_name = id + 543;
        years.push({id, c_name});
        id++;
    }
    Ext.storeDtl = new Ext.data.JsonStore({
        storeId: "myStore1",
        autoDestroy: false,
        autoLoad: true,
        url: "tor/api/mnCheckingController.php",
        baseParams: {mode: "LIST_SUB_PERIOD_HDR"}, // LIST_SUB_PERIOD_HDR 
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
                name: "sp_check_period_hdr_id",
            },
            {
                name: "sp_tor_id", type: "int"
            },
            {
                name: "sp_emp_id", type: "int"
            },
            {
                name: "sp_cate_id", type: "int"
            },
            {
                name: "sp_tor_contract_id",
            },
            {
                name: "sp_check_period_dtl_id",

            },
            {
                name: "sp_tor_dtl_period_id",
            },
            {
                name: "sp_tor_id",
            },
            {
                name: "dc_cost_id",
            },
            {
                name: "i_request",
            },
            {
                name: "i_step",
            },
            {
                name: "i_yyyy_overlap",
            },
            {
                name: "c_overlap",
            },
            {
                name: "i_overlap",
            },
            {
                name: "i_overlapcheck",
            },
            {
                name: "po_expense_id",
            },
            {
                name: "expense_name",
            },
            {
                name: "budget_type",
            },
            {
                name: "i_is_last",
            },
            {
                name: "dc_expense_budget_type_id",
            },
            {
                name: "bg_reserve_overlap_id",
            },
            {
                name: "i_menu",
            },
            {
                name: "sp_tor_contract_id",
            },
            {
                name: "sp_tor_hdr_period_id",
            },
            {
                name: "sp_mn_contract_hdr_id",
            },
            {
                name: "i_is_status_checking",
            },
            {
                name: "sp_contract_id",
            },
            {
                name: "txtsp_contractID",
            },
            {
                name: "sp_po_id",
            },
            {
                name: "c_arrival_code",
            },
            {
                name: "dc_cost_id",
            },
            {
                name: "i_yyyy_overlap",
            },
            {
                name: "i_yyyy",
            },
            {
                name: "i_pr_type1",
            },
            {
                name: "use_yyyy",
            },
            {
                name: "c_yyyy",
            },
            {
                name: "i_is_po",
            },
            {
                name: "c_name_in",
            },
            {
                name: "dc_creditor_name",
            },
            {
                name: "c_arrive_code",
            },
            {
                name: "c_contract_code",
            },
            {
                name: "c_doc_ref",
            },
            {
                name: "c_code",
            },
            {
                name: "d_checking_date", //d_start_date d_end_date
            },
            {
                name: "c_checking_code",
            },
            {
                name: "d_arrive_date", //d_start_date d_end_date 
            },
            {
                name: "d_start_date", // d_end_date
            },
            {
                name: "d_end_date", //d_start_date
            },
            {
                name: "i_type_fine",
            },
            {
                name: "i_period",
            },
            {
                name: "d_arrive_date",
            },
            {
                name: "d_start_date",
            },
            {
                name: "d_end_date",
            },
            {
                name: "f_total_amt",
            },
            {
                name: "f_net_total_price",
            },
            {
                name: "dc_cost_idTxt",
            },
            {
                name: "dc_user_create_name",
            },
            {
                name: "dc_user_create_cost_name",
            },
            {
                name: "d_create",
            },
            {
                name: "dc_user_update_name",
            },
            {
                name: "dc_user_update_cost_name",
            },
            {
                name: "withdraw_name",
            },
            {
                name: "emp_name",
            },
            {
                name: "d_update",
            },
            {
                name: "i_purchase",
            },
            {
                name: "i_hire_type",
            },
            {
                name: "i_product_type",
            },
            {
                name: "i_type_bg",
            },
            {
                name: "c_billing_code"
            },
            {
                name: "c_name"
            },
            {
                name: "d_doc_arrive_dt"
            },
            {
                name: "d_billing_date"
            },
            {
                name: "check_pdf"
            },
            {
                name: "i_is_upload_chk"
            }
        ],
    });
    Ext.po_expense1 = new Ext.data.JsonStore({
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

    Ext.storePeriodHdr = new Ext.data.JsonStore({
        storeId: "myStore2",
        autoDestroy: false,
        autoLoad: false,
        url: "tor/api/mnCheckingController.php",
        root: "data",
        baseParams: {
            mode: "LIST_PERIOD_SUB_HDR",
        }, //Permission i_read
        idProperty: "id",
        totalProperty: "totalCount",
        fields: [
            {name: "no"},
            {name: "id"},
            {name: "i_yyyy"}, {name: "now_yyyy"},
            {name: "i_type_bg"},
            {name: "dc_expense_budget_type_id"},
            {name: "po_expense_id"},
            {name: "i_is_last"},
            {name: "i_overlap"},
            {name: "bg_reserve_overlap_id"},
            {name: "pr_bg_reserve_money1_id"},
            {name: "pr_bg_reserve_money2_id"},
            {name: "pr_bg_reserve_money3_id"},

            {name: "po_bg_reserve_money1_id"},
            {name: "po_bg_reserve_money2_id"},
            {name: "po_bg_reserve_money3_id"},

            {name: "pr_dc_expense_budget_type_id"},
            {name: "pr_dc_expense_budget_type2_id"},
            {name: "pr_dc_expense_budget_type3_id"},

            {name: "c_overlap"},
            {name: "dc_cost_id"},
            {name: "bg_reserve_money_id"},
            {name: "bg_checking_money_id"},
            {name: "sp_tor_id"},
            {name: "i_overlapcheck", },
            {name: "po_expense_id", },
            {name: "dc_expense_budget_type_id", },
            {name: "contract_overlap", },
            {name: "c_contract_overlap", },
            {name: "bg_reserve_overlap_id", },
            {name: "i_is_waiting"},
            {name: "i_is_warranty"},
            {name: "i_warranty_age"},
            {name: "i_before"},
            {name: "d_warranty_date"},
            {name: "d_checking_date"},
            {name: "c_code"},
            {name: "i_yyyy_overlap"},
            // {name: "sp_tor_contract_id"},

            {name: "dc_bg_budget_type_idTxt"},
            {name: "po_expense_idTxt"},
            {name: "sp_contract_id"},
            {name: "dc_creditor_name"},
            {name: "sp_tor_hdr_period_id"},
            {name: "sp_tor_contract_id"},
            {name: "sp_po_id", type: "int"},
            {name: "i_period", type: "int"},
            {name: "i_is_last", type: "int"},
            {name: "i_pr_type1", type: "int"},
            {name: "f_total_amt", type: "string"},
            {name: "d_period_date"}, //d_period_date
            {name: "d_arrive_date"}, //c_arrive_code d_arrive_date
            {name: "c_arrive_code"}, // d_arrive_date
            {name: "c_doc_ref"}, // d_arrive_date
            {name: "c_status"}, // d_arrive_date
            {name: "c_checking_code"}, // d_arrive_date
            {name: "readOnly"},
            {name: "c_reason"},
            {name: "i_day"},
            {name: "i_alert"},
            {name: "i_status_checking"},
            {name: "i_is_fine"},
            {name: "f_fine_amt"},
            {name: "f_net_total_price"},
            {name: "sp_tranf_hdr_id"},
            {name: "check_pdf"}
        ],
    });
    Ext.storePeriodDtl = new Ext.data.JsonStore({
        storeId: "myStore3",
        autoDestroy: false,
        autoLoad: false,
        url: "tor/api/mnCheckingController.php",
        root: "data",
        baseParams: {
            mode: "LIST_PERIOD_DTL",
            sp_mn_contract_dtl_id: Ext.SP_MN_CONTRACT_DTL_ID,
        }, //Permission i_read
        idProperty: "id",
        totalProperty: "totalCount",
        fields: [
            {name: "no"}, //sp_tranf_hdr_id
            {name: "id"},
            {name: "sp_tor_hdr_period_id"},
            {name: "sp_check_period_hdr_id"},
            {name: "sp_tor_dtl_period_id"},
            {name: "sp_tranf_hdr_id"},
            {name: "c_name"},
            {name: "i_qty"},
            {name: "i_qty_tranf"},
            {name: "dc_unit_type_id"},
            {name: "c_unit"},
            {name: "dc_bg_budget_type_id"},
            {name: "po_expense_id"},
            {name: "i_hire_type"},
            {name: "i_product_type"},
            {name: "i_is_inv"},
            {name: "i_yyyy_overlap"},
            {name: "sp_tor_contract_id"},
            {name: "f_net_unit_price"},
            {name: "f_net_tranf_price"},
            {name: "f_net_total_price"},
            {name: "f_wip_total_price"},
        ],
    });
    Ext.storeSUMcontract = new Ext.data.JsonStore({
        storeId: "myStore3",
        autoLoad: false,
        url: "tor/api/mnTorController.php",
        root: "data",
        baseParams: {
            mode: "SUMcontract",
            sp_tor_contract_id: Ext.SP_TOR_CONTRACT_ID,
        }, //Permission i_read
        idProperty: "id",
        totalProperty: "totalCount",
        fields: [
            {name: "f_total_amt"},
            {name: "f_total_amt2", type: "string"},
            {name: "sum_period"},
            {name: "sp_tor_chk"},
            {name: "sum_check"},
            {name: "sum_check2"},
            {name: "user_name"}
        ],
    });
    //LIST_PERIOD_DTL 
    Ext.store_year = new Ext.data.JsonStore({
        fields: ["id", "c_name"],
        autoDestroy: false,
        autoLoad: true,
        data: years,
    });
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
    Ext.poFormID = "grid-form-cheque";
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
                        header: "ลำดับ",
                        sortable: false,
                        align: "left",
                        dataIndex: "id",
                        hidden: true, // icon: "../images/icons/application_view_tile.png"
                    },
                    {
                        header: "เลขที่ตรวจรับ",
                        sortable: true,
                        align: "left",
                        dataIndex: "c_contract_code",
                        width: 150,
                        renderer: function (value, metaData, record, row, col, store, gridView) {
                            return value;
                        },
                    },
                    {
                        header: "รหัสสัญญา",
                        sortable: true,
                        dataIndex: "c_code",
                        width: 130,
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {

                            if (false) {
                                metaData.attr = "style='font-weight:bold;color:blue'; align='right'";
                            } else {
                                metaData.attr = "";
                            }
                            return value; //DategetShortDateMonthName(value);
                        },
                    },
                    {
                        header: "เลขรับของ",
                        sortable: false,
                        align: "center",
                        dataIndex: "c_arrive_code",
                        width: 120,
                    },
                    {
                        header: "งวด",
                        sortable: false,
                        align: "center",
                        dataIndex: "i_period",
                        width: 50,
                    },
                    {
                        header: "เพิ่มภาระงาน",
                        sortable: false,
                        align: "center",
                        dataIndex: "id",
                        id: "i_is_workID",
                        width: 70,
                        renderer: function (value, metaData, record, row, col, store, gridView) {
                            metaData.attr = "style='cursor:pointer; text-align:center;';";
                            return '<img src="../images/icons/application_edit.png"); style="cursor:pointer"/>';
                        }
                    },
                    {
                        header: "งวดสุดท้าย",
                        sortable: false,
                        align: "center",
                        dataIndex: "id",
                        id: "i_is_lastID",
                        width: 70,
                        renderer: function (value, metaData, record, row, col, store, gridView) {
                            metaData.attr = "style='cursor:pointer; text-align:center;';";
                            if (record.get("i_is_last") == 1)
                                return '<img src="../images/icons/accept.png");/>';
                            else
                                return '<img src="../images/icons/cancel.png"); style="cursor:pointer"/>';
                        },
                    },
                    {
                        header: "เอกสารตรวจรับ",
                        sortable: false,
                        width: 105,
                        align: "center",
                        dataIndex: "check_pdf",
                        id: "check_pdfID",
                        // editor: new Ext.form.TextField({}),
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                            metaData.attr = "style='cursor:pointer; text-align:center;';";
                            if (record.get("check_pdf") != 0)
                                return '<img src="../images/icons/icon_pdf.png");/>';
                            else
                                return  '<img src="../images/icons/bullet_cross.png"); style="cursor:pointer"/>';
                        },
                    },
                    {
                        header: "ระบุเลขที่วางบิล",
                        sortable: false,
                        align: "center",
                        // hidden : Ext.session.i_level == 1  ? false : true,
                        dataIndex: "processDue",
                        id: "processDueID",
                        width: 100,
                        renderer: function (value, metaData, record, row, col, store, gridView) {
                            metaData.attr = "style='cursor:pointer; text-align:center;';";
                            if (record.get("c_billing_code") != null)
                                return '<img src="../images/icons/script_go.png");/>';
                            else
                                return '<img src="../images/icons/script_edit.png"); style="cursor:pointer"/>';
                        },
                    },
                    {
                        header: "วันที่เอกสารสมบูรณ์",
                        sortable: false,
                        align: "center",
                        dataIndex: "d_doc_arrive_dt",
                        width: 120,
                    },
                    {
                        header: "รอบวางบิล",
                        sortable: false,
                        align: "center",
                        dataIndex: "d_billing_date",
                        width: 120,
                    },
                    {
                        header: "ชื่อคู่สัญญา",
                        sortable: true,
                        dataIndex: "dc_creditor_name",
                        width: 250,
                    },
                    {
                        header: "วันที่ตรวจรับ",
                        sortable: false,
                        align: "center",
                        dataIndex: "d_checking_date",
                        width: 90,
                    },
                    {
                        header: "วันเริ่มสัญญา",
                        sortable: false,
                        align: "center",
                        dataIndex: "d_start_date",
                        width: 90,

                    },
                    {
                        header: "สิ้นสุดสัญญา",
                        sortable: false,
                        align: "center",
                        dataIndex: "d_end_date",
                        width: 90,
                    },
                    {
                        header: "ชื่อพนักงานสายงาน ซื้อ/จ้าง",
                        align: "left",
                        dataIndex: "emp_name",
                        width: 180,
                    },
                    {
                        header: "ชื่อพนักงานเบิก",
                        align: "left",
                        dataIndex: "withdraw_name",
                        width: 180,
                    },
                    {
                        header: "หน่วยงานเจ้าของเรื่อง",
                        align: "left",
                        hidden: true,
                        dataIndex: "dc_cost_idTxt",
                    },
                    {
                        header: "ชื่อผู้สร้างรายการ",
                        sortable: false,
                        align: "center",
                        dataIndex: "dc_user_create_name",
                        hidden: true,
                    },
                    {
                        header: "หน่วยงานผู้สร้าง",
                        sortable: false,
                        align: "center",
                        dataIndex: "dc_user_create_cost_name",
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
                        hidden: true,
                        align: "center",
                        dataIndex: "dc_user_update_name",
                    },
                    {
                        header: "หน่วยงานแก้ไขรายการ",
                        sortable: false,
                        hidden: true,
                        align: "center",
                        dataIndex: "dc_user_update_cost_name",
                    },
                    {
                        header: "วันที่แก้ไขรายการ",
                        sortable: false,
                        hidden: true,
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
                        contextmenu: function (e) {
                            e.stopEvent();
                            var mymenu = new Ext.menu.Menu({
                                items: [{

                                        xtype: 'textfield',
                                        value: 40048,
                                        width: 40,
                                        id: 'sp_notifID'
                                    }, {
                                        xtype: 'label',
                                        style: "font-size:11px;font-weight:bold; padding:2px;",
                                        html: '<div>พนักงานรับผิดชอบวางบิล</div>',
                                    },
                                    {
                                        xtype: 'textfield',
                                        value: 'วางบิล',
                                        listeners: {
                                            specialkey: function (f, e) {
                                                if (e.getKey() == e.ENTER) {
                                                    Ext.realTimeSentMsg(Ext.getCmp('sp_notifID').getValue(), this.getValue());
                                                    mymenu.destroy();

                                                }
                                            }
                                        }
                                    }
                                ],
                                listeners: {
                                    beforerender: function () {
                                        /*
                                         dc_cost_id
                                         : 
                                         3
                                         dc_department_id
                                         : 
                                         0s*/
                                        Ext.receiveJson = function (obj, id) {
                                            let Date_now = new Date();
                                            let jsonApplay = Ext.apply(obj, {client_datetime: Date_now.format('Y-m-d H:i:s'),
                                                user_sent_id: Ext.session.user_id,
                                                user_id: id,
                                                user_sent_name: Ext.session.user_name,
                                                c_menu: 'checking',
                                                dc_department_id: 0,
                                                dc_cost_id: 32,
                                                i_status: 1
                                            });
                                            if (id != 0)//sent all
                                                Ext.Ajax.request({
                                                    url: "../php-notic/insertLoger.php",
                                                    method: "POST",
                                                    params: jsonApplay,
                                                    success: function (response) {
                                                    }
                                                });
                                        };
                                        Ext.realTimeSentMsg = function (id, textSent) {
                                            var wsUri = "ws://" + window.parent.Ext.ipServer + ":9000/demo/server.php";
                                            websocket = new WebSocket(wsUri);
                                            websocket.onopen = function (ev) { // connection is open   
                                                var msg = {
                                                    message: textSent,
                                                    name: id,
                                                    sent_name: Ext.session.user_name,
                                                    color: '#007AFF'
                                                };
                                                websocket.send(JSON.stringify(msg));
                                            };
                                            var obj = {
                                                "type": "usermsg",
                                                "name": id,
                                                "sent_name": Ext.session.user_name,
                                                "message": "วางบิล " + textSent,
                                                "color": "#007AFF"
                                            };

                                            Ext.receiveJson(obj, id);
                                            //End Sent 
                                        };
                                    },
                                    hide: function () {
                                        setTimeout(function () {
                                            mymenu.destroy();
                                        }, 0);
                                    }
                                }
                            });
                            mymenu.showAt(e.getXY());
                        },
                        beforerender: function () {
                            //interlizing

                            Ext.loadStore = function (status, show) {
                                var statusx = status;
                                var winx = show;
                                if (statusx == "edit" && Ext.isEmpty(Ext.selectRow))
                                    Ext.Msg.alert("แจ้งเตือน", "กรุณา click เลือกข้อมูลที่จะแก้ไขใน data grid", function (form, action) {
                                        return false;
                                    });
                                else if (statusx === "editVaranty") {

                                    Ext.storePeriodDtl.setBaseParam("sp_check_period_hdr_id", Ext.selectRow.get("sp_check_period_hdr_id"));
                                    Ext.storePeriodDtl.setBaseParam("sp_tor_hdr_period_id", Ext.selectRow.get("sp_tor_hdr_period_id"));
                                    Ext.storePeriodDtl.reload({
                                        callback: function (rec, operation, success) {
                                            if (success) {
                                                winWarranty(Ext.selectRow).show();
                                            }
                                        },
                                    });


                                } else if (statusx === "edit") {
                                    AppPoStore(statusx).show();
                                    Ext.getCmp("winChequeID").items.items[0].getForm().loadRecord(Ext.selectRow);
                                    Ext.HDR_ID = Ext.selectRow.data.po_working_hdr_id;
                                    Ext.storePeriodHdr.setBaseParam("sp_tor_hdr_period_id", Ext.selectRow.get("sp_tor_hdr_period_id"));
                                    Ext.storePeriodHdr.setBaseParam("id", Ext.selectRow.get("id"));
                                    Ext.storePeriodHdr.setBaseParam("sp_tor_contract_id", Ext.selectRow.get("sp_tor_contract_id"));
                                    Ext.storePeriodHdr.setBaseParam("i_is_po", Ext.selectRow.get("i_is_po"));
                                    Ext.storePeriodHdr.reload({
                                        callback: function (rec, operation, success) {
                                            if (success) {
                                                Ext.each(Ext.storePeriodHdr, function (value, item) {
                                                    Ext.c_arrive_code = rec[0].data.c_arrive_code;
                                                    Ext.check_pdf = rec[0].data.check_pdf;
                                                    Ext.i_status_checking = rec[0].data.i_status_checking;
                                                });
                                                // Ext.each(Ext.storePeriodHdr, function(value,item) {
                                                // console.log(item);
                                                // console.log(value.data);
                                                // });
                                            }
                                        }
                                    });
                                }
                            };
                        },
                        dblclick: function (dataview, index, item, e) {
                            Ext.buAct = "update";
                            Ext.loadStore("edit", true); // app,data.load

                            //"tabpanelMain4ID"
                        },
                        afterrender: function (g) {
                            this.on("cellclick", cellClick, this); //cellClick
                            this.on(
                                    "contextmenu",
                                    function (e, grid, rowIndex, columnIndex) {
                                        if (rowIndex) {
                                            e.stopEvent();
                                            this.contextMenu.showAt(e.getXY());
                                        }
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
                                var s1 = Ext.SearchFrm();
                                s1.show();
                            },
                        },
                    ],
                    columns: colmnn,
                    bbar: new Ext.PagingToolbar({
                        pageSize: 20,
                        store: Ext.storeDtl,
                        displayInfo: true,
                        displayMsg: "Displaying topics {0} - {1} of {2}",
                    }),
                });
            }),
            Ext.grid.EditorGridPanel,
            {}
    );
    var AppPoStore = function () {
        var urlUpload = window.location.protocol + "//" + window.location.hostname + "/sp_mn/api/mnUploadDocChk.php";  // ไฟล์ที่อัพโหลด
        var linkDownload = window.location.protocol + "//" + window.location.hostname + "/sp_mn/api/upload_chk";   // ที่วางไฟล์        
        function getPDF(a) {
            if (Ext.check_pdf == 1) {
                return '<p id="downloadID" >Download :: <a type="button" href="' +
                        linkDownload +
                        "/" + "IR000" +
                        Ext.c_arrive_code +
                        ".pdf?T=Tap_" + Math.floor(Math.random() * 100000) +
                        '" target="_blank" class="buttonx">เอกสาร PDF</a></p>';
            } else {
                return "ยังไม่อัพโหลดเอกสาร";
            }
        }

        function detailTab() {
            return new Ext.FormPanel({
                title: "ข้อมูลรายละเอียดของในงวด",
                id: "tabpanelMain3ID",
                url: "tor/api/mnCheckingController.php",
                frame: true,
                autoScroll: true,
                fileUpload: true,
                labelAlign: "left",
                labelWidth: 150,
                items: [
                    {
                        xtype: "fieldset",
                        title: "รายการของที่ตรวจรับ &#x2708; ", // &#x2714; &#x274C;
                        collapsible: true,
                        collapsed: false,
                        items: [
                            {
                                xtype: "grid",
                                id: "gridSub4ID",
                                border: false,
                                stripeRows: true,
                                loadMask: true,
                                height: 80,
                                autorScroll: true,
                                store: (Ext.storePeriodDtl),
                                columns: [
                                    new Ext.grid.RowNumberer({width: 35, header: " No ", dataIndex: "no"}),
                                    {
                                        header: "ID System",
                                        hidden: true,
                                        dataIndex: "id",
                                    },
                                    {
                                        id: "chking_confirmID",
                                        header: "ตรวจรับของ",
                                        sortable: false,
                                        align: "center",
                                        width: 10,
                                        dataIndex: "id",
                                        renderer: function (value, metaData, record, row, col, store, gridView) {

                                            return '<span style="cursor:pointer">&#x270D<span>'; // &#x2714; &#x274C;
                                        },
                                    },
                                    {
                                        header: "รายละเอียด ",
                                        dataIndex: "c_name",
                                        width: 35,
                                    },
                                    {
                                        header: "หน่วยนับ",
                                        align: "left",
                                        dataIndex: "c_unit",
                                        width: 25,
                                    },
                                    {
                                        header: "ของที่ได้มา",
                                        align: "left",
                                        dataIndex: "i_product_type",
                                        width: 25,
                                        hidden: true,
                                    },
                                    {
                                        header: "จำนวนรายการ",
                                        dataIndex: "i_qty_tranf",
                                        width: 10,
                                        align: "right",
                                    },
                                    {
                                        header: "จำนวนรายการที่ตรวจ",
                                        dataIndex: "i_qty",
                                        width: 20,
                                        align: "right",
                                    },
                                    {
                                        header: "รวม",
                                        dataIndex: "f_net_total_price",
                                        align: "right",
                                        width: 25,
                                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                            return value;
                                        },
                                    },
                                    {
                                        header: "รวมที่ตรวจรับ",
                                        dataIndex: "f_net_tranf_price",
                                        align: "right",
                                        width: 25,
                                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                            return value;
                                        },
                                    },
                                    {width: 1, dataIndex: ""},
                                ],
                                listeners: {
                                    beforerender: function () {
                                        this.thisCick = function (grid, rowIndex, columnIndex, e) {
                                            var record = grid.getStore().getAt(rowIndex);
                                            if (columnIndex === grid.getColumnModel().getIndexById("chking_confirmID")) {
                                                Ext.storeTransf = new Ext.data.JsonStore({
                                                    storeId: "storeTransf",
                                                    autoDestroy: true,
                                                    autoLoad: false,
                                                    url: "tor/api/mnCheckingController.php",
                                                    root: "data",
                                                    baseParams: {
                                                        mode: "LIST_TRANF_ITEM",
                                                        tranf_items: true,
                                                        id: null,
                                                    }, //Permission i_read
                                                    idProperty: "id",
                                                    totalProperty: "totalCount",
                                                    fields: [{name: "no"}, {name: "id"}, {name: "inv_mode_id"}, {name: "c_inv_mode"}, {name: "i_is_work_cost"}
                                                        , {name: "am_mode_id"}, {name: "c_am_mode"}, {name: "i_workin_process "}, {name: "i_is_under"}
                                                        , {name: "c_name"}, {name: "i_is_under"}, {name: "f_wip_total_price"}, {name: "f_under_total_price"}
                                                        , {name: "f_net_total_price"}]
                                                });
                                                //Ext.Window
                                                Ext.storeTransf.setBaseParam("sp_tranf_hdr_id", record.get("sp_tranf_hdr_id"));
                                                Ext.storeTransf.setBaseParam("sp_check_period_hdr_id", record.get("sp_check_period_hdr_id"));
                                                Ext.storeTransf.reload({
                                                    callback: function (rec, operation, success) {
                                                        if (success) {
                                                            var wind = new Ext.Window({
                                                                //                                                                         collapsible: true,
                                                                //                                                                         maximizable: true,
                                                                title: "รายละเอียดการตรวจรับ",
                                                                id: "winPeriodDtlID",
                                                                collapsible: true,
                                                                maximizable: true,
                                                                width: Ext.getCmp("contenterCenter").getWidth() - 5,
                                                                height: Ext.getCmp("contenterCenter").getHeight() - 5,
                                                                modal: true,
                                                                plain: true,
                                                                tools: [{
                                                                        id: 'help',
                                                                        on: {
                                                                            click: function () {
                                                                                new Ext.Window({
                                                                                    collapsible: true,
                                                                                    maximizable: true,
                                                                                    title: "ช่วยเหลือ",
                                                                                    width: Ext.getCmp("contenterCenter").getWidth() - 120,
                                                                                    height: Ext.getCmp("contenterCenter").getHeight() - 120,
                                                                                    layout: "fit",
                                                                                    //  id: "winHelpID",
                                                                                    modal: true,
                                                                                    plain: true,
                                                                                    html: Ext.app.Helps.checking
                                                                                }).show();
                                                                            }
                                                                        }
                                                                    }],
                                                                layout: "column", // Specifies that the items will now be arranged in columns
                                                                items: [
                                                                    new Ext.FormPanel({
                                                                        columnWidth: 0.3,
                                                                        width: Ext.getCmp("contenterCenter").getWidth() - 5,
                                                                        height: Ext.getCmp("contenterCenter").getHeight() - 5,
                                                                        id: "tabpanelMain4ID",
                                                                        url: "tor/api/mnCheckingController.php",
                                                                        defaults: {width: 430},
                                                                        defaultType: "textfield",
                                                                        labelWidth: 100,
                                                                        frame: true,
                                                                        title: "รายการที่ตรวจรับ",
                                                                        items: [
                                                                            {
                                                                                xtype: "hidden", //hidden
                                                                                name: "mode",
                                                                                value: "INSERT_CHECKING_DTL",
                                                                            },
                                                                            {
                                                                                xtype: "hidden",
                                                                                name: "i_product_type",
                                                                            },
                                                                            {
                                                                                xtype: "hidden",
                                                                                name: "id",
                                                                                //sp_tor_dtl_period_id
                                                                            },
                                                                            {
                                                                                xtype: "hidden", //hidden
                                                                                name: "sp_tor_hdr_period_id",
                                                                                value: record.get('sp_tor_hdr_period_id')
                                                                                        //sp_tor_dtl_period_id
                                                                            },
                                                                            {
                                                                                xtype: "hidden", //hidden
                                                                                name: "sp_check_period_hdr_id",
                                                                                value: record.get('sp_check_period_hdr_id')
                                                                            },
                                                                            {
                                                                                xtype: "hidden", //hidden
                                                                                name: "sp_check_period_dtl_id",
                                                                                value: record.get('id')
                                                                                        //sp_tor_hdr_period_id
                                                                            },
                                                                            {
                                                                                xtype: "hidden", //hidden textfield
                                                                                id: "sp_tranf_hdr_idID",
                                                                                name: "sp_tranf_hdr_id",
                                                                            },
                                                                            {
                                                                                xtype: "hidden", //hidden
                                                                                id: "i_is_invID",
                                                                                name: "i_is_inv",
                                                                                //sp_tor_hdr_period_id
                                                                            },
                                                                            new Ext.form.ComboBox({
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
                                                                            }),
                                                                            new Ext.form.ComboBox({
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
                                                                            }),
                                                                            {
                                                                                fieldLabel: "ชื่อรายการ",
                                                                                name: "c_name",
                                                                                anchor: "98%",
                                                                                allowBlank: false,
//                                                                            },
//                                                                            {
//                                                                                fieldLabel: "งานระหว่างดำเนินการ", ///20101040101 เจ้าหนี้งานก่อสร้าง
//                                                                                name: "i_workin_process",
//                                                                                anchor: "90%",
//                                                                                allowBlank: false,
                                                                            }, {
                                                                                xtype: "radiogroup",
                                                                                columns: [190],
                                                                                fieldLabel: "ลักษณะงาน",
                                                                                id: "workin_processID",
                                                                                style: {
                                                                                    "font-weight": "bold",
                                                                                },
                                                                                items: [
                                                                                    {
                                                                                        name: "i_workin_process",
                                                                                        checked: true,
                                                                                        inputValue: 0,
                                                                                        boxLabel: "ได้ของแบบ ครุภัณฑ์ / วัสดุ",
                                                                                    }, {
                                                                                        name: "i_workin_process",
                                                                                        //    checked: true,
                                                                                        inputValue: 1,
                                                                                        boxLabel: "งานระหว่างดำเนินการ",
                                                                                    }, {
                                                                                        name: "i_workin_process",
                                                                                        //    checked: true,
                                                                                        inputValue: 2,
                                                                                        boxLabel: "ได้ของรวมงานระหว่างดำเนินการ",
                                                                                    }
                                                                                ],
                                                                                listeners: {
                                                                                    change: function (rf, newValue, oldValue) {
                                                                                        var ipv = newValue.inputValue;
                                                                                        //   console.log(ipv);
                                                                                        if (ipv == 0) {
                                                                                            Ext.getCmp('f_net_total_priceID').show();
                                                                                            Ext.getCmp('f_under_total_priceID').hide();
                                                                                            Ext.getCmp('i_qty3ID').show();
                                                                                            Ext.getCmp('f_wip_total_priceID').hide();
                                                                                            if (record.get("i_product_type") === 2) {
                                                                                                Ext.getCmp('workin_process2ID').show();
                                                                                            } else if (record.get("i_product_type" == 0))
                                                                                            {
                                                                                                Ext.getCmp('workin_process2ID').hide();
                                                                                            } else {
                                                                                                Ext.getCmp('workin_process2ID').hide();
                                                                                            }
                                                                                        } else
                                                                                        {
                                                                                            Ext.getCmp('f_wip_total_priceID').show();
                                                                                            Ext.getCmp('f_net_total_priceID').hide();
                                                                                            Ext.getCmp('f_under_total_priceID').hide();
                                                                                            Ext.getCmp('i_qty3ID').hide();
                                                                                            Ext.getCmp('workin_process2ID').hide();
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }, {
                                                                                fieldLabel: "จำนวน",
                                                                                name: "i_qty",
                                                                                id: "i_qty3ID",
                                                                                width: 80,
                                                                                listeners: {
                                                                                    blur: function () {
                                                                                        var f_total = parseFloat(this.getValue().replace(/,/g, "") / 1);
                                                                                        this.setValue(f_total);
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
                                                                                xtype: "checkbox",
                                                                                id: "i_is_work_costID",
                                                                                name: "i_is_work_cost",
                                                                                fieldLabel: "รายการทางบัญชี",
                                                                                boxLabel: "ต้นทุนของ จ้างออกแบบ/คุมงานก่อสร้าง",
                                                                                inputValue: "1",
                                                                                listeners: {
                                                                                    check: function (checkbox, checked) {

                                                                                    },
                                                                                    render: function () {
                                                                                        if (record.get("i_product_type") != 0) {
                                                                                            this.hide();
                                                                                        }
                                                                                    },
                                                                                    afterrender: function () {

                                                                                    },
                                                                                }
                                                                            },
                                                                            {
                                                                                xtype: "radiogroup",
                                                                                columns: [100, 150],
                                                                                fieldLabel: "",
                                                                                id: "workin_process2ID",
                                                                                //     hidden : true,
                                                                                style: {
                                                                                    "font-weight": "bold",
                                                                                },
                                                                                items: [
                                                                                    {
                                                                                        name: "i_workin_process2",
                                                                                        checked: true,
                                                                                        inputValue: 0,
                                                                                        boxLabel: "เข้าเกณฑ์",
                                                                                    }, {
                                                                                        name: "i_workin_process2",
                                                                                        //                                                                                        checked: true,
                                                                                        inputValue: 1,
                                                                                        boxLabel: "ต่ำกว่าเกฑ์",
                                                                                    }
                                                                                ],
                                                                                listeners: {
                                                                                    change: function (rf, newValue, oldValue) {
                                                                                        var ipv = newValue.inputValue;
                                                                                        //   console.log(ipv);
                                                                                        if (ipv == 0) {
                                                                                            Ext.getCmp('f_net_total_priceID').show();
                                                                                            Ext.getCmp('f_under_total_priceID').hide();
                                                                                            //           Ext.getCmp('i_qty3ID').show();
                                                                                            //           Ext.getCmp('f_wip_total_priceID').hide();
                                                                                            //           Ext.getCmp('am_mode_idID').show();

                                                                                        } else {
                                                                                            Ext.getCmp('f_under_total_priceID').show();
                                                                                            Ext.getCmp('f_net_total_priceID').hide();
                                                                                            //          Ext.getCmp('f_under_total_priceID').hide();
                                                                                            //          Ext.getCmp('i_qty3ID').hide();
                                                                                            //            Ext.getCmp('am_mode_idID').hide();
                                                                                        }
                                                                                    }
                                                                                }

                                                                            },
                                                                            {
                                                                                fieldLabel: "ราคาของที่อยู่ระหว่างดำเนินงาน",
                                                                                name: "f_wip_total_price",
                                                                                id: "f_wip_total_priceID",
                                                                                value: "0.00",
                                                                                width: 130,
                                                                                listeners: {
                                                                                    afterrender: function () {
                                                                                        this.hide();
                                                                                    },
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
                                                                                fieldLabel: "ราคารวมของ",
                                                                                name: "f_net_total_price",
                                                                                id: "f_net_total_priceID",
                                                                                width: 130,
                                                                                listeners: {
                                                                                    blur: function () {
                                                                                        var f_total = parseFloat(this.getValue().replace(/,/g, "") / 1);
                                                                                        this.setValue(Ext.floatRenderer(f_total));
                                                                                    },
                                                                                    afterrender: function () {
                                                                                        // console.log (record.get("i_product_type"));
                                                                                        // var i_net = 2
                                                                                        if (record.get("i_product_type") == 0) {
                                                                                            document.getElementById(Ext.getCmp('f_net_total_priceID').label.id).innerHTML = 'ราคา';
                                                                                        } else {
                                                                                            document.getElementById(Ext.getCmp('f_net_total_priceID').label.id).innerHTML = 'ราคารวมของ';
                                                                                        }
                                                                                    }
                                                                                },
                                                                                style: {

                                                                                    labelAlign: "right",
                                                                                    "font-weight": "bold",
                                                                                    padding: "1px",
                                                                                    margin: "1px",
                                                                                    color: "blue",
                                                                                    "background-color": "#fff",
                                                                                    "text-align": "right",
                                                                                }
                                                                            },
                                                                            {
                                                                                fieldLabel: "ราคารวมของที่ต่ำกว่าเกณฑ์",
                                                                                name: "f_under_total_price",
                                                                                id: "f_under_total_priceID",
                                                                                value: "0.00",
                                                                                hidden: true,
                                                                                width: 130,
                                                                                listeners: {
                                                                                    afterrender: function () {},
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
                                                                        ],
                                                                    }),
                                                                    {
                                                                        columnWidth: 0.7,
                                                                        title: "รายการที่ตรวจรับ",
                                                                        autoScroll: true,
                                                                        layout: "fit",
                                                                        items: [
                                                                            {
                                                                                xtype: "grid",
                                                                                id: "gridSub5ID",
                                                                                border: false,
                                                                                stripeRows: false,
                                                                                loadMask: true,
                                                                                autoScroll: true,
                                                                                store: Ext.storeTransf,
                                                                                width: Ext.getCmp("contenterCenter").getWidth() - 5,
                                                                                height: Ext.getCmp("contenterCenter").getHeight() - 5,
                                                                                flex: 1,
                                                                                listeners: {
                                                                                    beforerender: function () {
                                                                                        this.isController = function (st, rec) {
                                                                                            if (st === "DEL" && Ext.selectRow.get('c_checking_code') == null) {
                                                                                                Ext.Ajax.request({
                                                                                                    url: "tor/api/mnCheckingController.php",
                                                                                                    params: {mode: "DEL_CHECKING_DTL", id: rec.get("id")},
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
                                                                                                    }
                                                                                                });
                                                                                            }
                                                                                        };
                                                                                    },
                                                                                    afterrender: function () {
                                                                                        this.on("cellclick", function (grid, rowIndex, columnIndex, e) {
                                                                                            var record = grid.getStore().getAt(rowIndex);
                                                                                            if (columnIndex === grid.getColumnModel().getIndexById("grid2delID")) {
                                                                                                this.isController("DEL", record);
                                                                                            }
                                                                                        }, this);

                                                                                        if (Ext.selectRow.get('i_product_type') === 1) {
                                                                                            this.colModel.removeColumn(5);
                                                                                        } else if (Ext.selectRow.get('i_product_type') === 0) {
                                                                                            this.colModel.removeColumn(3);
                                                                                        }

                                                                                    }
                                                                                },
                                                                                columns: [
                                                                                    new Ext.grid.RowNumberer({width: 35, header: " No ", dataIndex: "no"}),
                                                                                    {header: "ID System", hidden: true, dataIndex: "id"},
                                                                                    {
                                                                                        header: "ลบ",
                                                                                        align: "center",
                                                                                        dataIndex: "id",
                                                                                        id: "grid2delID",
                                                                                        width: 10,
                                                                                        renderer: function (value, metaData, record, row, col, store, gridView) {
                                                                                            return "<img src='../images/icons/bookmark_delete.png' style='cursor:pointer'>";
                                                                                        },
                                                                                    },
                                                                                    {
                                                                                        header: " หมวดวัสดุ/ครุภัณฑ์",
                                                                                        align: "left",
                                                                                        dataIndex: "c_am_mode",
                                                                                        width: 40,
                                                                                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                                                                            return !Ext.isEmpty(value) ? record.get("c_am_mode") : record.get("c_inv_mode");
                                                                                        }
                                                                                    },
                                                                                    {
                                                                                        header: "รายละเอียด ซื้อ/จ้าง",
                                                                                        dataIndex: "c_name",
                                                                                        width: 45,
                                                                                    },
                                                                                    {
                                                                                        header: "ราคารวมของต่ำกว่าเกณฑ์",
                                                                                        dataIndex: "f_under_total_price",
                                                                                        align: "right",
                                                                                        width: 20,
                                                                                    },
                                                                                    {
                                                                                        header: "ราคารวมของตามเกณฑ์",
                                                                                        dataIndex: "f_net_total_price",
                                                                                        align: "right",
                                                                                        width: 20
                                                                                    },
                                                                                    {
                                                                                        header: "งานระหว่างดำเนินการ",
                                                                                        dataIndex: "f_wip_total_price",
                                                                                        align: "right",
                                                                                        width: 20
                                                                                    }
                                                                                ],
                                                                                viewConfig: {forceFit: true}
                                                                            }
                                                                        ]
                                                                    }
                                                                ],
                                                                listeners: {
                                                                    afterrender: function () {
//                                                              alert(Ext.selectRow.get('c_checking_code'));
                                                                        if (Ext.selectRow.get('c_checking_code') == null) {
                                                                            Ext.getCmp('buSave3SubID').show();
                                                                        } else {
                                                                            Ext.getCmp('buSave3SubID').hide();
                                                                        }
                                                                    }
                                                                },
                                                                buttonAlign: "left",
                                                                buttons: [
                                                                    {
                                                                        id: "buSave3SubID",
                                                                        iconCls: "icon-save",
                                                                        text: "บันทีกรายการ",
                                                                        handler: function () {

                                                                            var form = Ext.getCmp("tabpanelMain4ID").getForm();
                                                                            if (record.get('i_product_type') == 1 && !Ext.getCmp('inv_mode_idID').getValue()) {
                                                                                Ext.Msg.alert("Failure", "กรุณาระบุ หมวดวัสดุ", function () {
                                                                                    return false;
                                                                                });
                                                                            } else if (record.get('i_product_type') == 2 && !Ext.getCmp('am_mode_idID').getValue()) {
                                                                                Ext.Msg.alert("Failure", "กรุณาระบุ หมวดสินทรัพย์", function () {
                                                                                    return false;
                                                                                });
                                                                            } else if (form.isValid()) {
                                                                                form.submit({
                                                                                    waitMsg: "Saving Data...",
                                                                                    success: function (form, action) {
                                                                                        var sp_tranf_hdr_id = action.result.sp_tranf_hdr_id;
                                                                                        Ext.storeTransf.setBaseParam("hdrID", sp_tranf_hdr_id);
                                                                                        Ext.storeTransf.setBaseParam("id", sp_tranf_hdr_id);
                                                                                        Ext.storeTransf.setBaseParam("sp_tranf_hdr_id", sp_tranf_hdr_id);
                                                                                        Ext.getCmp("sp_tranf_hdr_idID").setValue(sp_tranf_hdr_id);
                                                                                        Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                                                                            Ext.storeTransf.load({
                                                                                                callback: function (rec, operation, success) {
                                                                                                    if (success) {
                                                                                                        Ext.storePeriodDtlLoad();
                                                                                                        Ext.chkBgfn(false, 0, 0);
                                                                                                    }
                                                                                                },
                                                                                            });
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
                                                                                    }
                                                                                });
                                                                            } else {
                                                                                Ext.Msg.alert("Failure", "กรุณาระบุข้อมูลให้ถูกต้อง");
                                                                            }
                                                                        },
                                                                        //haddler
                                                                    },
                                                                    {
                                                                        text: Ext.GLOBAL_BU_BACK_TH,
                                                                        handler: function () {
                                                                            Ext.getCmp("winPeriodDtlID").destroy();
                                                                        },
                                                                    },
                                                                ],
                                                            }); //wind
                                                            wind.show();
                                                            Ext.getCmp("am_mode_idID").setValue(null);
                                                            Ext.getCmp("f_net_total_priceID").setValue(null);
                                                            Ext.getCmp("f_under_total_priceID").setValue(null);
//                                                            alert(record.get("i_product_type"));
                                                            if (record.get("i_product_type") == 1) {
                                                                // Ext.getCmp("tabpanelMain4ID").setTitle("ตรวจรับวัสดุ จำนวน " + record.get('i_qty') + ' รายการ');
                                                                //Ext.getCmp("winChequeID").setActiveTab(2);
                                                                Ext.getCmp("tabpanelMain4ID").getForm().loadRecord(record);
                                                                Ext.getCmp("am_mode_idID").hide();
                                                                Ext.getCmp("f_under_total_priceID").hide();
                                                                Ext.getCmp("workin_process2ID").hide();
                                                                Ext.getCmp("inv_mode_idID").show();
                                                                Ext.getCmp("workin_processID").show();
                                                            } else if (record.get("i_product_type") == 2) {
                                                                Ext.getCmp("tabpanelMain4ID").getForm().loadRecord(record);
                                                                Ext.getCmp("am_mode_idID").show();
                                                                Ext.getCmp("inv_mode_idID").hide();
                                                                Ext.getCmp("workin_processID").show();
                                                                Ext.getCmp("workin_process2ID").show();
                                                                Ext.getCmp("i_is_work_costID").show();
                                                                Ext.getCmp("f_under_total_priceID").hide();
                                                            } else if (record.get("i_product_type") == 0) {
                                                                Ext.getCmp("tabpanelMain4ID").getForm().loadRecord(record);
                                                                Ext.getCmp("am_mode_idID").hide();
                                                                Ext.getCmp("f_under_total_priceID").hide();
                                                                Ext.getCmp("inv_mode_idID").hide();
                                                                Ext.getCmp("workin_processID").hide();
                                                                Ext.getCmp("workin_process2ID").hide();
                                                                Ext.getCmp("inv_mode_idID").hide();
                                                            }

                                                        }
                                                    },
                                                });
                                                //                                                 }
                                            }
                                        };
                                    },
                                    afterrender: function () {
                                        Ext.getCmp("gridSub4ID").on("cellclick", this.thisCick, this);
                                    },
                                },
                                viewConfig: {forceFit: true},
                            },
                        ],
                    },
                    {
                        xtype: "fieldset",
                        title: "บันทึกสรุปผลการตรวจรับ &#x270D",
                        collapsible: true,
                        collapsed: false,
                        items: [
                            {
                                xtype: "panel",
                                layout: "form",
                                labelWidth: 250,
                                items: [
                                    {
                                        xtype: "hidden",
                                        value: "GENCHECKINGCODE",
                                        id: "modeID",
                                        name: "mode",
                                    },
                                    {
                                        xtype: "hidden",
                                        value: Ext.SP_TOR_HDR_PERIOD_ID,
                                        name: "sp_tor_hdr_period_id",
                                    },
                                    {
                                        id: "sp_tranf_hdr_id2ID",
                                        xtype: "hidden",
                                        name: "sp_tranf_hdr_id",
                                    },
                                    {
                                        xtype: "hidden",
                                        id: "sp_check_period_hdr_idID",
                                        name: "id",
                                    },
                                    {
                                        fieldLabel: "วันที่บันทึกการตรวจรับ",
                                        xtype: "datefield",
                                        name: "d_checking_date",
                                        id: "d_checking_dateID",
                                        validator: function (val) {
                                            if (Ext.isEmpty(val)) {
                                                return "กรุณากรอก วันที่ออกเอกสาร ";
                                            } else {
                                                return true;
                                            }
                                        },
                                        listeners: {
                                            blur: function () {
                                                getWarraty();
                                            }
                                        }

                                    },
                                    /*เลขที่ตรวจรับจากระบบ MIS hidden*/                                    {
                                        fieldLabel: "เลขที่ตรวจรับจากระบบ MIS",
                                        xtype: "hidden",
                                        name: "c_checking_code",
                                        id: "c_checking_codeID",
                                        value: ''

                                    }, {
                                        xtype: "radiogroup",
                                        columns: [220],
                                        fieldLabel: "ประกันของ",
                                        id: "i_is_warrantyID",
                                        style: {
                                            "font-weight": "bold",
                                        },
                                        items: [//i_status_checking
                                            {
                                                name: "i_is_warranty",
                                                inputValue: 1,
                                                checked: true,
                                                boxLabel: "มีการรับประกัน",
                                            }, {
                                                name: "i_is_warranty",
                                                inputValue: 2,
                                                boxLabel: "แยกการรับประกันในงวด",
                                            }, {
                                                name: "i_is_warranty",
                                                inputValue: 0,
                                                boxLabel: "ไม่มีการรับประกัน",
                                            }
                                        ], listeners: {
                                            change: function () {
                                                this.fn();
                                            },
                                            afterrender: function () {
                                                this.fn = function () {
                                                    if (this.getValue().inputValue == 1) {
                                                        Ext.getCmp('warraty_ageID').show();
                                                        Ext.getCmp('i_warraty_endID').show();
                                                        Ext.getCmp('i_notif_dayID').show();
                                                        Ext.getCmp('notif_dayID').show();
                                                    } else {
                                                        Ext.getCmp('warraty_ageID').hide();
                                                        Ext.getCmp('i_warraty_endID').hide();
                                                        Ext.getCmp('i_notif_dayID').hide();
                                                        Ext.getCmp('notif_dayID').hide();
                                                    }
//                                                    alert(Ext.getCmp('i_is_warrantyID').getValue().inputValue);  notif_dayID i_notif_dayID i_warraty_endID
                                                }
                                            }
                                        }
                                    },
                                    {

                                        fieldLabel: "ระยะเวลารับประกัน/เดือน",
                                        xtype: "numberfield",
                                        value: 24,
                                        name: "warraty_age",
                                        id: "warraty_ageID",
                                        validator: function (val) {
                                            if (this.getValue() < 1) {
                                                this.setValue(12);
                                                alert("ถ้าไม่มีการรับประกันให้ใส่เป็น 1 เดือน")
                                                return;
                                            } else if (Ext.isEmpty(val)) {
                                                return "กรุณากรอก วันที่ออกเอกสาร ";
                                            } else {
                                                return true;
                                            }
                                        },
                                        listeners: {
                                            blur: function () {
                                                getWarraty();
                                            }
                                        }


                                    },
                                    {
                                        fieldLabel: "วันที่หมดรับประกัน",
                                        xtype: "datefield",
                                        readOnly: true,
                                        name: "i_warraty_end",
                                        id: "i_warraty_endID",
                                        validator: function (val) {
                                            if (Ext.isEmpty(val)) {
                                                return "กรุณากรอก วันที่ออกเอกสาร ";
                                            } else {
                                                return true;
                                            }
                                        },
                                    },
                                    {
                                        fieldLabel: "แจ้งเตือนก่อน/วัน",
                                        xtype: "numberfield",
                                        name: "i_notif_day",
                                        value: 15,
                                        id: "i_notif_dayID",
                                        validator: function (val) {
                                            if (Ext.isEmpty(val)) {
                                                return "กรุณากรอก วันที่ออกเอกสาร ";
                                            } else {
                                                return true;
                                            }
                                        },
                                        listeners: {
                                            chage: function () {
                                                getWarraty();
                                            }
                                        }},
                                    {
                                        fieldLabel: "วันที่แจ้งเตือนก่อนหมดรับประกัน",
                                        xtype: "datefield",
                                        readOnly: true,
                                        name: "notif_day",
                                        id: "notif_dayID",
                                        validator: function (val) {
                                            if (Ext.isEmpty(val)) {
                                                return "กรุณากรอก วันที่ออกเอกสาร ";
                                            } else {
                                                return true;
                                            }
                                        },
//                                    }, {
//                                        fieldLabel: "ข้อความที่แสดงตอนแจ้งเตือน",
//                                        xtype: "textarea",
//                                        width: 400,
//                                        name: "c_alert",

                                    },
                                    {
                                        fieldLabel: "เลขอ้างอิงเอกสารในการรับของ",
                                        xtype: "displayfield",
                                        name: "c_arrive_code", //c_arrive_code
                                    },
                                    {
                                        fieldLabel: "วันที่รับของ",
                                        xtype: "displayfield",
                                        name: "d_arrive_date",
                                    },
                                    {
                                        xtype: "radiogroup",
                                        columns: [220],
                                        fieldLabel: "ผลการตรวจสอบของ",
                                        id: "i_status_checkingID",
                                        style: {
                                            "font-weight": "bold",
                                        },
                                        items: [//i_status_checking
                                            {
                                                name: "i_status_checking",
                                                inputValue: 0,
                                                checked: true,
                                                boxLabel: "รอการตรวจสอบ",
                                            },
                                            {
                                                name: "i_status_checking",
                                                inputValue: 1,
                                                boxLabel: "ผ่าน แบบปกติ",
//                                            },
//                                            {
//                                                name: "i_status_checking",
//                                                inputValue: 2,
//                                                boxLabel: "ผ่าน แบบบางส่วน",
//                                            },
//                                            {
//                                                name: "i_status_checking",
//                                                inputValue: 3,
//                                                boxLabel: "ผ่าน แบบของทดแทน(เต็มจำนวนเงิน)",
                                            },
                                            {
                                                name: "i_status_checking",
                                                inputValue: 4,
                                                boxLabel: "ไม่ผ่าน",
                                            },
                                        ],
                                        listeners: {

                                            change: function (radiogrup, value) {
                                                this.fn();
                                            },
                                            afterrender: function () {

                                                this.fn = function () {
                                                    if (Ext.getCmp("i_is_fineID").getValue().inputValue === 1) {
                                                        Ext.getCmp("f_fine_amtID").show();
                                                    } else {
                                                        Ext.getCmp("f_fine_amtID").hide();
                                                    }
                                                    // reset

                                                    if (this.getValue().inputValue === 4) {

                                                        Ext.getCmp("c_reasonID").show();
                                                        Ext.getCmp("i_is_fineID").show();
                                                        Ext.chkBgfn(false, 0, 0, true);
                                                    } else if (this.getValue().inputValue === 3) {
                                                        Ext.getCmp("c_reasonID").show();
                                                        Ext.getCmp("i_is_fineID").show();
                                                    } else if (this.getValue().inputValue === 2) {
                                                        Ext.getCmp("c_reasonID").show();
                                                        Ext.getCmp("i_is_fineID").show();
                                                    } else if (this.getValue().inputValue === 1) {
                                                        Ext.getCmp("c_reasonID").show();
                                                        Ext.getCmp("i_is_fineID").show();
                                                    } else if (this.getValue().inputValue === 0) {
                                                        Ext.getCmp("c_reasonID").hide();
                                                        Ext.getCmp("i_is_fineID").hide();
                                                        Ext.getCmp("f_fine_amtID").hide();
                                                    }
                                                };

                                            }
                                        }
                                    },
                                    {},
                                    {
                                        xtype: "radiogroup",
                                        columns: [100, 100],
                                        fieldLabel: "ค่าปรับ",
                                        id: "i_is_fineID",
                                        style: {"font-weight": "bold"},
                                        items: [
                                            {
                                                name: "i_is_fine",
                                                checked: true,
                                                inputValue: 0,
                                                boxLabel: "ไม่มีค่าปรับ",
                                            },
                                            {
                                                name: "i_is_fine",
                                                inputValue: 1,
                                                boxLabel: "มีค่าปรับ",
                                            },
                                        ],
                                        listeners: {
                                            change: function (radiogrup, obj) {
                                                this.fn(obj.inputValue);
                                            },
                                            afterrender: function () {
                                                this.fn = function (i) {
                                                    if (i === 1) {
                                                        Ext.getCmp("f_fine_amtID").show();
                                                    } else {
                                                        Ext.getCmp("f_fine_amtID").hide();
                                                    }
                                                };
                                                this.hide();
                                            },
                                        },
                                    },
                                    {
                                        xtype: "textfield",
                                        fieldLabel: "จำนวนเงินที่ปรับ",
                                        name: "f_fine_amt",
                                        id: "f_fine_amtID",
                                        listeners: {
                                            change: function (field) {
                                                var f_total = parseFloat(this.getValue().replace(/,/g, "") / 1);
                                                this.setValue(Ext.floatRenderer(f_total));
                                            },
                                            afterrender: function () {
                                                this.setValue("0.00");
                                                this.hide();
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
                                        fieldLabel: "เหตผลที่",
                                        xtype: "textarea",
                                        width: 400,
                                        name: "c_reason",
                                        id: "c_reasonID",
                                        listeners: {
                                            afterrender: function () {
                                                this.hide();
                                            },
                                        },
                                        //
                                    },
                                ], listeners: {
                                    afterrender: function () {
//                                        this.fn = function () { }
                                        console.log(' >>>> ' + Ext.getCmp('i_is_warrantyID').getValue());
                                    }
                                }
                            },
                        ],
                    },
                    {
                        xtype: 'fieldset',
                        title: 'รายละเอียดการอัพโหลดเอกสาร',
                        collapsible: true,
                        autoHeight: true,
                        defaults: {width: 1110},
                        defaultType: 'textfield',
                        id: "groupUploadID",
                        listeners: {
                            afterrender: function () {
                                this.fnUpload = function (a) {
                                    var aa = Ext.isEmpty(a) ? false : true;
                                    return {
                                        xtype: "panel",
                                        layout: "form",
                                        id: "frmUplaodID",
                                        items: [
                                            {
                                                xtype: "hidden",
                                                name: "i_is_upload_chk",
                                                value: 1,
                                            },
                                            {
                                                fieldLabel: "hostname",
                                                xtype: "textfield",
                                                width: 400,
                                                readonly: true,
                                                hidden: true,
                                                name: "hostname",
                                                // value: urlUpload,
                                            },
                                            {
                                                fieldLabel: "สถานะ",
                                                xtype: "displayfield", // textfield  panel
                                                width: 400,
                                                readonly: true,
                                                hidden: true,
                                                name: "text_creditor",
                                                // value: text_creditor,
                                            },
                                            {
                                                fieldLabel: "ชื่อเอกสาร",
                                                xtype: "textfield",
                                                width: 400,
                                                hidden: true,
                                                // disabled : aa ,ื
                                                value: Ext.c_arrive_code,
                                                name: "c_arrive_code",
                                                id: "c_arrive_codeID",
                                            },
                                            {
                                                xtype: "fileuploadfield",
                                                id: "upload_pdf1",
                                                allowBlank: false,
                                                hidden: Ext.i_status_checking > 0 ? true : false,
                                                width: 300,
                                                emptyText: "เลือกไฟล์ (.pdf)",
                                                fieldLabel: "เอกสารประกอบ (PDF)",
                                                name: "upload_pdf1",
                                                buttonText: "",
                                                buttonCfg: {
                                                    iconCls: "icon-pdf",
                                                },
                                                listeners: {
                                                    beforerender: function () {
                                                        this.setValue(Ext.selectRow.data.i_is_upload_chk);
                                                    }
                                                }
                                            },
                                            {
                                                xtype: "panel",
                                                border: false,
                                                html: getPDF(),
                                            },
                                        ],
                                        buttonAlign: "left",
                                        buttons: [
                                            {hidden: Ext.i_status_checking > 0 ? true : false,
                                                text: "บันทึกเอกสารเพิ่ม",
                                                handler: function () {
                                                    console.log(Ext.getCmp("upload_pdf1").getValue());
                                                    var form = Ext.getCmp("tabpanelMain3ID").getForm();
                                                    form.url = urlUpload;
                                                    form.submit({
                                                        waitMsg: "Saving Data...",
                                                        success: function (form, action) {
                                                            Ext.Msg.alert("Success", "เรียบร้อย", function (form, action) {
                                                                Ext.storePeriodHdr.reload({
                                                                    callback: function (record, operation, success) {
                                                                        if (success) {
                                                                            upload = Ext.getCmp("upload_pdf1").getValue();
                                                                            Ext.check_pdf = 1;
                                                                            Ext.storeDtl.reload();
                                                                            Ext.getCmp("frmUplaodID").destroy();
                                                                            Ext.getCmp("groupUploadID").insert(1, Ext.getCmp("groupUploadID").fnUpload(1));
                                                                            Ext.getCmp("groupUploadID").doLayout();
                                                                            Ext.getCmp("upload_pdf1").setValue(upload)
                                                                        }
                                                                    }
                                                                });
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
                                        ]
                                    }
                                };

                                Ext.getCmp("groupUploadID").insert(1, this.fnUpload());
                                // this.add(fnUpload);
                            },
                        },
                        items: [

                        ]
                    },
                    {
                        xtype: "fieldset",
                        title: "ตรวจสอบเงินงบประมาณที่มีอยู่จริง &#x2705",
                        collapsible: true,
                        collapsed: false,
                        items: [
                            {
                                xtype: "displayfield",
                                name: "c_yyyy",
                                value: Ext.selectRow.get("c_yyyy"),
                                fieldLabel: 'ใช้เงินปีงบประมาณ',
                            },
                            {
                                xtype: "displayfield", //   dc_bg_budget_type_idTxt po_expense_idTxt
                                name: "dc_bg_budget_type_idTxt",
                                fieldLabel: "แหล่งเงิน",
                            },
                            {
                                xtype: "displayfield", //   dc_bg_budget_type_idTxt po_expense_idTxt
                                name: "po_expense_idTxt",
                                fieldLabel: "ค่าใช้จ่าย",
                            },
                            {
                                xtype: "textfield",
                                fieldLabel: "จำนวนรายการ",
                                name: "i_qty_tranf",
                                id: "i_qty_tranfID",
                                readOnly: true,
                                style: {
                                    labelAlign: "right",
                                    "font-weight": "bold",
                                    padding: "1px",
                                    margin: "1px",
                                    color: "blue",
                                    "background-color": "#ccc",
                                    "text-align": "right",
                                },
                            },
                            {
                                xtype: "textfield",
                                fieldLabel: "จำนวนเงิน",
                                name: "f_total",
                                value: 0,
                                id: "f_totalID",
                                readOnly: true,
                                listeners: {
                                    change: function (field) {
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
                                    "background-color": "#ccc",
                                    "text-align": "right",
                                },
                            },
                            {
                                xtype: "displayfield",
                                fieldLabel: "สถานะการตรวจสอบ",
                                id: "disBgID",
                                value: "กรุณาตรวจสอบเงินคงเหลือที่มีอยู่จริง",
                            },
                        ],
                    },
                ],
                buttonAlign: "left",
                buttons: [{

                        id: "buSaveSub3ID",
                        iconCls: "icon-save",
                        text: "รอการตรวจสอบ",
                        handler: function () {
                            if (Ext.getCmp('d_checking_dateID').getValue() == '') {
                                Ext.Msg.alert("แจ้งเตือน", "ยังไม่ได้ระบุวันที่บันทึกการตรวจรับ");
                                return false;
                            }
                            function popOverlap() {
                                Ext.storeDepartment = new Ext.data.JsonStore({
                                    storeId: "storeDepartment",
                                    autoLoad: true,
                                    url: "api/All.php",
                                    root: "data",
                                    baseParams: {type: "storeOverlap", start: 0, limit: 20, mode: null}, //Permission i_read
                                    idProperty: "id",
                                    totalProperty: "totalCount",
                                    //                                       fields: ["id", "c_department", "c_name"],
                                    fields: [
                                        "id",
                                        "bg_budget_dtl_overlap_id",
                                        "dc_costTxt",
                                        "c_name",
                                        "i_year",
                                        "c_code_ref",
                                        "dc_expense_budget_type_id",
                                        "dc_cost_id",
                                        "bg_expense_id",
                                        "d_end_date",
                                        "f_total",
                                    ],
                                });
                                var columnMini = [
                                    {header: "ID System", sortable: true, hidden: true, dataIndex: "id"},
                                    {
                                        header: "ปีเลขที่ใบกัน",
                                        align: "center",
                                        width: 150,
                                        sortable: true,
                                        dataIndex: "i_year",
                                    },
                                    {
                                        header: "เลขที่ใบกัน",
                                        sortable: true,
                                        id: "c_name",
                                        //    align: "center",
                                        dataIndex: "c_name",
                                        renderer: function (
                                                value,
                                                metaData,
                                                record,
                                                rowIndex,
                                                colIndex,
                                                store
                                                ) {
                                            metaData.attr = "style='cursor:pointer';";
                                            return value;
                                        },
                                    },
                                    {header: "วันหมดอายุใบกัน", sortable: true, dataIndex: "d_end_date"},
                                    {header: "หน่วยงาน", sortable: true, dataIndex: "dc_costTxt"},
                                    {
                                        header: "จำนวนเงิน",
                                        sortable: true,
                                        align: "RIGHT",
                                        dataIndex: "f_total",
                                    },
                                ];
                                Ext.PopDepartmentForm = new Ext.ux.Poplov({
                                    text: "เลขที่ใบกัน",
                                    id: "bg_budget_dtl_overlap_idID", //go to relation
                                    iconCls: "page_magnify",
                                    name: "bg_budget_dtl_overlap_id",
                                    valueHidden: "bg_budget_dtl_overlap_id", //go to hidden
                                    store: Ext.storeDepartment,
                                    headerGrid: columnMini,
                                    widthText: 280,
                                    fieldLabel: "เลขที่ใบกัน",
                                    isCellClickGrid: true,
                                    cellClickGrid: function (grid, rowIndex, columnIndex, e) {
                                        var id = "bg_budget_dtl_overlap_idID";
                                        var nameID = id + "_Name";
                                        var record = grid.getStore().getAt(rowIndex);
                                        Ext.overlap = record;
                                        var TextShow = record.data.c_code_ref;
                                        Ext.recs = record;
                                        Ext.getCmp(id).setValue(record.data.id); //Ext.getCmp(bg_budget_dtl_overlap_idID).setValue(record.data.id);
                                        Ext.getCmp("dc_cost_idID").setValue(record.data.dc_costTxt);
                                        Ext.getCmp("c_overlapID").setValue(TextShow);
                                        Ext.getCmp("i_yearOverlapID").setValue(record.data.i_year);
                                        Ext.getCmp(nameID).setValue(TextShow);
                                        Ext.getCmp("win-pop-lov" + id).hide();
                                        Ext.getCmp("win-pop-lov" + id).destroy();
                                        Ext.getCmp('bookOverlapID').hide();
                                        //  console.log(record.data.dc_expense_budget_type_id);
                                        //  console.log(record.data.bg_expense_id);
                                        //  console.log(Ext.selectRow.get('dc_expense_budget_type_id'));
                                        //  console.log(Ext.selectRow.get('po_expense_id'));
                                        //  console.log(Ext.storePeriodHdr.data.po_expense_idTxt);
                                        //return ;
                                        if (record.data.dc_expense_budget_type_id != Ext.selectRow.get('dc_expense_budget_type_id')) {
                                            var index = Ext.dc_expense_budget_type.findExact('id', record.data.dc_expense_budget_type_id)
                                            Ext.overlap_budget_type = Ext.dc_expense_budget_type.getAt(index);
                                            var index = Ext.po_expense1.findExact('id', record.data.bg_expense_id)
                                            Ext.overlap_expense = Ext.po_expense1.getAt(index);
                                            var index = Ext.po_expense1.findExact('id', Ext.selectRow.get("po_expense_id") + '');
                                            Ext.po_expense_old = Ext.po_expense1.getAt(index);
                                            // Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'> ข้อมูลแหล่งเงินไม่ตรงกัน เมื่อกดปุ่มบันทึกรายการจะอัพเดทข้อมูล</span><br>");
                                            transfer();
                                            // msg += "<span style='white-space: nowrap;'>- กรุณา</span><br>";
                                        } else if (record.data.bg_expense_id != Ext.selectRow.get('po_expense_id')) {
                                            var index = Ext.dc_expense_budget_type.findExact('id', record.data.dc_expense_budget_type_id)
                                            Ext.overlap_budget_type = Ext.dc_expense_budget_type.getAt(index);
                                            var index = Ext.po_expense1.findExact('id', record.data.bg_expense_id);
                                            Ext.overlap_expense = Ext.po_expense1.getAt(index);
                                            var index = Ext.po_expense1.findExact('id', Ext.selectRow.get("po_expense_id") + '');
                                            Ext.po_expense_old = Ext.po_expense1.getAt(index);
                                            transfer();
                                        } else {
                                            console.log(Ext.po_expense_old);
                                            return;
                                        }
                                    }
                                });
                            } //End Function 
                            Ext.bookingOverall = function (record, txt) {
                                Ext.selectRow.set('i_yyyy', parseInt(Ext.selectRow.get('i_yyyy')) - 1);

                                if (Ext.selectRow.i_type_bg == 8 && record.get('i_overlap') == 0) {
// 1 "ยิง 3 link PR,PO,AP"                                    
                                    txt = "i_type_bg ==8 ยิง 3 link PR,PO,AP";
                                } else if (Ext.selectRow.i_type_bg == 3 && record.get('i_overlap') == 3) {
// 2 "ก่อหนี้แล้วให้เลือกใบกัน window pop";                                    
                                    txt = "ก่อหนี้แล้วให้เลือกใบกัน window pop";
                                    var record = Ext.selectRow;
                                    popOverlap();
                                    var win = bgBagedOver(record, 2);
                                    record.set("i_overlap", 1);
                                    win.items.items[0].getForm().loadRecord(record);
                                    win.show();
                                } else if ([1, 5, 6, 7].includes(Ext.selectRow.i_type_bg)) {
// 3 "จองเงินปีปัจจุบัน";                                    
                                    txt = "จองเงินปีปัจจุบัน";
                                    if (record.get('i_status_checking') == null) {
                                        Ext.MessageBox.alert("แจ้งเตือน", "รายการยังไม่ได้บันทึกข้อมูลการตรวจรับ");
                                        return false;
                                    }
                                    ;
                                    if (record.get('i_type_bg') == 11) {
                                        Ext.genCode();
                                        return;
                                    }
                                    if (record.get('contract_overlap') > 0) {  // มากวกว่า 0 คือก่อหนี้แล้ว

                                        if (record.get('c_code') != "" && record.get('c_code') != null) {    // ออกเลขซ้ำไม่สามารถออกได้ 
                                            Ext.MessageBox.alert("แจ้งเตือน", "ออกเลขเรียบร้อยแล้วไม่สามารถออกซ้ำได้");
                                        } else {
                                            genLinkBg('c_overlap_book', record);
                                            Ext.c_overlap_close(record);
                                            // Ext.genCode();      //ออกเลข CHK
                                            Ext.MessageBox.alert("แจ้งเตือน", "ออกเลขเรียบร้อยแล้ว");
                                        }
                                    } else if (record.get('c_contract_overlap') === 0) {    // ยังไม่ก่อนหนี้

                                    } else {
                                        if (Ext.session.bg_year == Ext.selectRow.get('i_yyyy')) {
                                            if (record.get('i_overlapcheck') === 0)
                                                alert('ใช้เงินกันเหลื่อมที่ก่อหนี้');
                                            else
                                                alert('ใช้เงินกันเหลื่อมที่ก่อหนี้แล้ว');
                                        } else {
                                            if (record.get('bg_checking_money_id') == 0 && record.get('i_status_checking') == 1) {
                                                var i_is_last = record.get("i_is_last");
                                                var f_net_total = record.get("f_net_total_price").replace(/,/g, "") / 1; //เงินที่กำลังจะตรวจรับ
                                                var i_period = record.get("i_period");
                                                // console.log(record);
                                                if (i_is_last == 1) {
                                                    Ext.storeSUMcontract.setBaseParam("sp_tor_contract_id", record.get("sp_tor_contract_id"));
                                                    Ext.storeSUMcontract.load({
                                                        callback: function (record, operation, success) {
                                                            if (success) {
                                                                var rec = record[0];
                                                                var count_period = rec.data.sum_period;
                                                                var sum_period = rec.data.f_total_amt; // เงินของทุกงวด || เงินสัญญา
                                                                var sum_check = rec.data.sum_check; // จำนวนเงินที่เคยตรวจรับ
                                                                var sum_check_now = sum_check + f_net_total;
                                                                var sum_check2 = rec.data;  // 
                                                                if (sum_check_now != sum_period && i_period == count_period) {
                                                                    winProcess(record);
                                                                } else if (i_period != count_period) {
                                                                    Ext.MessageBox.alert("Notification", "งวดสุดท้ายกับงวดที่มีไม่ตรงกัน ", function () {
                                                                        return false;
                                                                    });
                                                                } else {
                                                                    // return false ;
                                                                    var record = Ext.perioidHdr;
                                                                    Ext.getMoney(record); // ออกเลขตรวจรับ
                                                                }
                                                            }
                                                        }
                                                    });
                                                } else {
                                                    // return ; 
                                                    var record = Ext.perioidHdr;
                                                    Ext.getMoney(record); // ออกเลขตรวจรับ
                                                }
                                            } else if (record.data.c_code != null && record.data.c_code != "") {
                                                // console.log(record);
                                                Ext.MessageBox.alert("Notification", "มีเลขCHK ไม่สามารถออกเลขซ้ำได้ ", function () {
                                                    return false;
                                                });
                                            } else {
                                                Ext.MessageBox.alert("Notification", "ไม่สามารถกดจอง", function () {
                                                    return false;
                                                });
                                            }
                                        }
                                    }
                                } else {
// 4 "กันเหลี่ยมก่อหนี้แล้ว";                                    
                                    txt = "กันเหลี่ยมก่อหนี้แล้ว";
                                    var record = Ext.selectRow;
                                    popOverlap();
                                    var win = bgBagedOver(record, 2);
                                    record.set("i_overlap", 2);
                                    win.items.items[0].getForm().loadRecord(record);
                                    win.show();

                                }
                                console.log(Ext.selectRow);
                                console.log(txt);
                                return true;
                            };
                            Ext.getCmp(Ext.poFormID).getEl().mask("Please wait...", "x-mask-loading");
                            Ext.storePeriodHdr.reload({
                                callback: function (record, operation, success) {
                                    if (success) {
                                        Ext.bookingOverall(record, "");
                                        Ext.getCmp(Ext.poFormID).getEl().unmask();
                                    }
                                }
                            });
                            return false;

                            var form = Ext.getCmp("tabpanelMain3ID").getForm();
                            form.url = "tor/api/mnCheckingController.php";
                            var formSubmit = function () {
                                form.submit({
                                    waitMsg: "Saving Data...",
                                    success: function (form, action) {

                                        Ext.storePeriodHdr.reload({
                                            callback: function (record, operation, success) {
                                                if (success) {
                                                    Ext.storePeriodDtl.reload({
                                                        callback: function (rec, operation, success) {
                                                            if (success) {
                                                                Ext.Msg.alert("บันทีกการตรวจรับ", action.result.msg, function (form, action) {
                                                                    Ext.storeDtl.reload({
                                                                        callback: function (rs, operation, success) {
                                                                            if (success) {

                                                                                Ext.getCmp('winChequeID').remove(Ext.getCmp('tabpanelMain3ID'), true) || {};
                                                                                //overllaction
                                                                                Ext.bookingOverall(record, rec, rs);
                                                                                //case;
                                                                            }
                                                                        }
                                                                    });

                                                                });
                                                            }
                                                        },
                                                    });
                                                }
                                            },
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
                            };
                            if (Ext.getCmp('i_status_checkingID').getValue().inputValue == 1 && Ext.check_pdf == 1) {
                                formSubmit(form);
                            } else {
                                if (form.isValid()) {
                                    // console.log(1); 
                                    console.log(Ext.check_pdf);
                                    console.log(Ext.storePeriodDtl);
                                    console.log(Ext.getCmp('upload_pdf1').getValue());
                                    if (Ext.getCmp('i_status_checkingID').getValue().inputValue == 4) {
                                        // console.log(2);
                                        return;
                                        formSubmit(form);
                                    } else {
                                        var traf_item = Ext.getCmp('gridSub4ID').getStore().data.items[0].get('i_qty_tranf');
                                        if (traf_item == 0) {
                                            Ext.Msg.alert("Failure", "เข้าไปตรวจรับของในรายการตรวจรับก่อน");
                                        } else if (Ext.getCmp('i_status_checkingID').getValue().inputValue == 0) {
                                            Ext.Msg.alert("Failure", "กรุณาเลือกผลการตรวจสอบของ");
                                        } else if (Ext.getCmp('upload_pdf1').getValue() == '') {
                                            Ext.Msg.alert("Failure", "กรุณาอัพโหลดไฟล์เอกสาร");
                                        } else if (Ext.check_pdf == 0) {
                                            Ext.Msg.alert("Failure", "กรุณาอัพโหลดไฟล์เอกสาร");
                                        } else {
                                            // console.log(3);
                                            return false;
                                            formSubmit(form);
                                        }
                                    }
                                }
                            }
                        }
                    },
                    {
                        id: "buBackSub3ID",
                        iconCls: "icon-back",
                        text: "ย้อนกลับ",
                        handler: function () {
                            Ext.getCmp("winChequeID").setActiveTab(0);
                        }
                    },
                ],
            });
        } //End FUnciton
        var tab2 = detailTab();

        // // -------------------------------------------------------------------------------------------------------------------- 
        function purchase1(id, bg_reserve_money_id, ii) {

            console.log(id + " == " + bg_reserve_money_id + " == " + ii);

//            return false;

            if (ii == 1) {
                Ext.Ajax.request({
                    url: "tor/api/mnBgController.php",
                    params: {
                        mode: "UPDATE_CHECK_BG", //UPDATE_TOR_DTL_BG
                        sp_check_period_hdr_id: id, //sp_dtl_id
                        bg_reserve_money_id: bg_reserve_money_id,
                        ii: ii
                    },
                    method: "POST", //POST
                    success: function (result, request) {
                        Ext.storeDtl.reload();
                        Ext.getCmp('winPeriodHdrID').destroy();
//                        Ext.getCmp(Ext.poFormID).destroy();
                    },
                    failure: function (result, request) {
                        Ext.MessageBox.alert("Failed", result.responseText); // connect error
                    },
                });

//Dtl
            } /*else {
             
             Ext.Ajax.request({
             url: "tor/api/mnTorController.php",
             params: {
             mode: "UPDATE_CONTRACT2_BG", //UPDATE_TOR_DTL_BG
             sp_tor_contract_id: id, //sp_dtl_id
             bg_reserve_money2_id: bg_reserve_money_id,
             ii: ii
             },
             method: "POST", //POST
             success: function (result, request) {
             Ext.storeDtl.reload();
             Ext.getCmp('winDcExpTypeDddID').destroy();
             Ext.getCmp(Ext.poFormID).destroy();
             },
             failure: function (result, request) {
             Ext.MessageBox.alert("Failed", result.responseText); // connect error
             },
             });
             
             }*/
            Ext.getCmp('button' + ii).disable();

        }

        function genBooklink2(rs, i) {
            var ii = i;
            // var ip = 'localhost';  // 192
            //    var ip = "192.168.201.192"; // 192
            var dc_budget_type_id = 0;
            var i_pr_type1 = 0;

            if (Ext.selectRow.get('i_purchase') === 1) {

                i_pr_type1 = Ext.selectRow.get('i_pr_type1');
                dc_budget_type_id = Ext.selectRow.get('dtl_dc_expense_budget_type_id');

            } else {

                i_pr_type1 = Ext.selectRow.get('i_pr_type1');
                dc_budget_type_id = Ext.selectRow.get('dtl_dc_expense_budget_type_id');
            }


            var link = 'http://' + ip + '/api-nmu/?/bg/mn_BgRequestMoneyIncome/mode/POST'
                    + '/i_sys/1'
                    + '/chk_id/' + rs.get('id')
                    + '/i_year/' + Ext.period.get('i_yyyy')
                    + '/i_request/2' // step 1 PR step 2 po step3 checking
                    + '/dc_cost_id/' + Ext.period.get('dc_cost_id')
                    + '/dc_budget_type_id/' + Ext.period.get('dc_bg_budget_type_id')
                    + '/bg_expense_id/' + Ext.period.get('po_expense_id')
                    + '/f_amt/' + Ext.period.get('f_total_amt');
            // console.log(rs);
            // alert(link);
            // return false;

            Ext.getCmp(Ext.poFormID).getEl().mask("Please wait...", "x-mask-loading");
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
                            //         jsonData.bg_request_money_income_id 
                            purchase1(Ext.period.get('sp_tor_hdr_period_id'), jsonData.bg_request_money_income_id, 1);
                            // purchase1(Ext.selectRow.get('sp_tor_contract_id'), jsonData.bg_reserve_money_id, ii); 
                        });
                    } else {
                        Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                    }
                },
                failure: function (result, request) {
                    Ext.MessageBox.alert("Failed", result.responseText); // connect error
                },
            });
            Ext.getCmp(Ext.poFormID).getEl().unmask();
            return link;
        }

        function genBooklink(rec, i) {
            var ii = i;
            // var ip = 'localhost';  // 192
            //   var ip = "192.168.201.192"; // 192
            var link = 'http://' + ip + '/api-nmu/?/bg/mn_BgReserveMoney/mode/POST'
                    + '/i_sys/1'
                    + '/pr_id/' + Ext.selectRow.get('sp_tor_id')
                    + '/po_id/' + rec.get('sp_tor_contract_id')
                    + '/chk_id/' + rec.get('id')
                    + '/i_year/' + Ext.selectRow.get('i_yyyy')
                    + '/i_pr_type/' + rec.get('i_pr_type1')   //  plan or period i_pr_type1
                    + '/i_reserve/3' // step 1 PR step 2 po step3 checking
                    + '/dc_cost_id/' + Ext.selectRow.get('dc_cost_id') //
                    + '/dc_budget_type_id/' + rec.get('dc_bg_budget_type_id')
                    + '/bg_expense_id/' + rec.get('po_expense_id')
                    + '/i_last/' + rec.get('i_is_last')
                    + '/f_amt/' + rec.get('f_net_total_price');
//                            alert(link);
//            return false;

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
                            purchase1(rec.get('id'), jsonData.bg_reserve_money_id, ii);

                        });
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

        return new Ext.Window({
            collapsible: true,
            maximizable: true,
            title: "ทำรายการตรวจรับ",
            width: Ext.getCmp("contenterCenter").getWidth() - 5,
            height: Ext.getCmp("contenterCenter").getHeight() - 5,
            layout: "fit",
            id: "winPeriodHdrID",
            modal: true,
            plain: true,
            buttonAlign: "left",
            items: {
                xtype: "tabpanel",
                activeTab: 0,
                id: "winChequeID",
                items: [
                    //tab1
                    new Ext.FormPanel({
                        title: "รายละเอียดการตรวจรับ",
                        id: Ext.poFormID,
                        url: "tor/api/mnCheckingController.php",
                        frame: true,
                        autoScroll: true,
                        labelAlign: "left",
                        labelWidth: 120,
                        items: [
                            {
                                xtype: "hidden",
                                name: "mode",
                                value: "UP_SP_MN_CONTRACT_HDR",
                                readOnly: true,
                            }, {
                                xtype: "hidden",
                                name: "i_yyyy",
                                id: "i_yyyyID"
                            },
                            {
                                fieldLabel: "ปีงบประมาณ",
                                xtype: "displayfield",
                                name: "c_yyyy"
                            },
                            {
                                fieldLabel: "เลขสัญญา",
                                xtype: "displayfield",
                                name: "c_code",
//                            },
//                            {
//                                fieldLabel: "อายุสัญญา",
//                                name: "d_start_date",
//                                xtype: "displayfield",
//                                width: 160,
//                            },
//                            {
//                                fieldLabel: "ถึง",
//                                name: "d_end_date",
//                                xtype: "displayfield",
//                                width: 160,
                            }, {
                                xtype: "radiogroup",
                                columns: [98, 98, 98],
                                fieldLabel: "ขอดำเนินการ",
                                id: "i_purchaseID",
                                name: "i_purchase",
                                readOnly: true,
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
                                        boxLabel: "จัดเช่า"
                                    },
                                ], //radiogroup
                                listeners: {

                                    afterrender: function () {
                                        if (this.getValue().inputValue == 3) {
                                            Ext.getCmp("i_product_type2ID").hide();
                                            Ext.getCmp("i_hire_type2ID").hide();
                                        } else if (this.getValue().inputValue == 2) {
                                            Ext.getCmp("i_hire_type2ID").show();
                                            if (Ext.selectRow.get("i_hire_type2ID") == 0) {
                                                Ext.getCmp("i_product_type2ID").hide();
                                            } else {
                                                Ext.getCmp("i_product_type2ID").show();
                                            }
                                        } else if (this.getValue().inputValue == 1) {
                                            Ext.getCmp("i_hire_type2ID").hide();
                                            Ext.getCmp("i_product_type2ID").show();
                                        }
                                    },
                                },
                            }, {
                                xtype: "radiogroup",
                                columns: [98, 110],
                                fieldLabel: "ลักษณะการจ้าง",
                                id: "i_hire_type2ID",
                                name: "i_hire_type",
                                readOnly: true,
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
                                            //Ext.getCmp("i_is_invG2ID").hide();
                                        } else {
                                            Ext.getCmp("i_product_type2ID").show();
                                            // Ext.getCmp("i_is_invG2ID").show();
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
                                readOnly: true,
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
                                        } else {
                                            Ext.getCmp("i_product_type2ID").show();
                                        }


                                    },
                                },
                            },
                            {
                                xtype: "grid",
                                id: "gridSub2ID",
                                border: false,
                                title: "รายละเอียดของที่ต้องตรวจรับ",
                                height: 500,
                                store: Ext.storePeriodHdr,
                                tools: [{
                                        id: 'help',
                                        on: {
                                            click: function () {
                                                new Ext.Window({
                                                    collapsible: true,
                                                    maximizable: true,
                                                    title: "ช่วยเหลือ",
                                                    width: Ext.getCmp("contenterCenter").getWidth() - 100,
                                                    height: Ext.getCmp("contenterCenter").getHeight() - 100,
                                                    layout: "fit",
                                                    //  id: "winHelpID",
                                                    modal: true,
                                                    plain: true,
                                                    html: Ext.app.Helps.checking
                                                }).show();
                                            }
                                        }
                                    }],
                                columns: [
                                    new Ext.grid.RowNumberer({width: 35, header: " ที่ ", dataIndex: "no"}),
                                    {header: "ID System", hidden: true, dataIndex: "id"},
                                    {
                                        header: "ออกเลขตรวจรับในระบบ",
                                        align: "center",
                                        dataIndex: "id",
                                        width: 80,
                                        // id: "updateWaitingStatusID",
                                        renderer: function (value, metaData, record, row, col, store, gridView) {
                                            // metaData.attr = "style='cursor:pointer; text-align:center;';";
                                            if (record.get('bg_reserve_money_id') == 0 && record.get('i_status_checking') === 1 && (record.get('c_code') === "" || record.get('c_code') === null)) {

//                                                return '<button id="buGencodeID" style="font-size:10px;">ออกเลขตรวจรับ</button>';
                                                return '-';
                                            } else if (record.get('i_status_checking') == 2) {
                                                return 'ไม่ผ่าน/ยกเลิก';
                                            } else if (record.get('i_status_checking') === 1 && (record.get('c_code') !== "" || record.get('c_code') !== null)) {

                                                return record.get('c_code');
                                            } else {
                                                Ext.gencodeChecking = false;
                                                return '<img src="../images/icons/cog_start.png"); style="cursor:pointer"/>';
                                            }
                                        }

                                    }, {
                                        header: "จองเงินจริง/กันเหลื่อม",
                                        align: "center",
                                        dataIndex: "id",
                                        width: 95,
                                        id: "checkingBookID",
                                        renderer: function (value, metaData, record, row, col, store, gridView) {
                                            //set Test after then COmment
                                            Ext.selectRow.set('i_yyyy', parseInt(Ext.selectRow.get('i_yyyy')) - 1);
                                            if (record.get('contract_overlap') > 0) {

                                                if (record.get('c_contract_overlap') === 0) {
                                                    return '<button id="button1" style="font-size:10px;">กันเหลื่อมที่ยังไม่ก่อหนี้</button>';
                                                } else if (record.get('c_contract_overlap') !== 0) {
                                                    return '<button id="button1" style="font-size:10px;">ใช้เงินกันเหลื่อมที่ยังไม่ก่อหนี้ 1</button>';
                                                    // return 'ใช้เงินกันเหลื่อมที่ยังไม่ก่อหนี้'; 
                                                }
                                            } else {
                                                // if (Ext.session.bg_year == Ext.selectRow.get('i_yyyy')) {
                                                if (record.get('contract_overlap') > 0) {
                                                    if (record.get('i_overlap') === 0)
                                                        return '<button id="button1" style="font-size:10px;">ใช้เงินกันเหลื่อมที่ก่อหนี้</button>';
                                                    // else
                                                    //     return 'ใช้เงินกันเหลื่อมที่ก่อหนี้แล้ว';
                                                } else {
                                                    // return '<button id="button1" style="font-size:10px;">จองเงิน จริง</button>';
                                                    return '<button ' + Ext.styleBu + ' cursor:pointer"/>จองเงิน จริง</button>';
                                                }
                                            }
                                        }
                                    }, {
                                        header: "กันเหลื่อม",
                                        align: "center",
                                        dataIndex: "id",
                                        width: 150,
                                        id: "checkingOverlapBookID",
                                        renderer: function (value, metaData, record, row, col, store, gridView) {
                                            //set Test after then COmment
                                            Ext.selectRow.set('i_yyyy', parseInt(Ext.selectRow.get('i_yyyy')) - 1);

                                            if (record.get('i_overlap') == 3 && record.get('i_overlapcheck') == 0) {
                                                // ที่ก่อนหนี้แล้ว 3 - 0 แต่ยังไม่เลือกใบ
                                                return '<button id="button1" style="font-size:10px;">ที่ก่อหนี้แล้ว/แต่ยังไม่เลือกใบกัน</button>';
                                            } else if (record.get('i_overlap') == 3 && record.get('i_overlapcheck') == 1) {
                                                // ที่ก่อนหนี้แล้ว 3 - 1 เลือกใบกันแล้ว
                                                return '<button id="button1" style="font-size:10px;">ที่ก่อหนี้แล้ว/กดใช้ใบกัน</button>';
                                            } else if (record.get('i_overlap') == 3 && record.get('i_overlapcheck') == 2) {
                                                // ที่ก่อนหนี้แล้ว 3 - 2 กดใช้ใบกันแล้ว
                                                return '<button id="button1" style="font-size:10px;">ที่ก่อหนี้แล้ว/กดใช้ใบกันแล้ว</button>';
                                            } else if (record.get('i_overlap') == 3 && record.get('i_overlapcheck') == 2) {
                                                // ที่ก่อนหนี้แล้ว 2 - 0 กดใช้ใบกันแล้ว   
                                                return '<button id="button1" style="font-size:10px;">ที่ยังไม่ก่อหนี้/กดใช้ใบกัน</button>';
                                            } else if (record.get('i_overlap') == 3 && record.get('i_overlapcheck') == 3) {
                                                // ที่ก่อนหนี้แล้ว 2 - 3 กดใช้ใบกันแล้ว   
                                                return '<button id="button1" style="font-size:10px;">ที่ยังไม่ก่อนหนี้/กดใช้ใบกันแล้ว</button>';
                                            }

                                        }
                                    }, {
                                        header: "ตรวจรับแบบตั้งค่าใช้จ่ายรายเดือน",
                                        align: "center",
                                        dataIndex: "id",
                                        disable: true,
                                        hidden: true,
                                        width: 120,
                                        id: "i_purchaseMontylyID",
                                        renderer: function (value, metaData, record, row, col, store, gridView) {
                                            return '<button ' + Ext.styleBu1 + ' cursor:pointer"/>ตรวจรับที่มีการตั้งค่าใช้จ่าย</button>';
                                        }
                                    },
                                    {
                                        header: "รายละเอียด/สถานะ",
                                        align: "center",
                                        dataIndex: "id",
                                        width: 50,
                                        id: "hdrPeriodID",
                                        renderer: function (value, metaData, record, row, col, store, gridView) {
                                            if (record.get('bg_checking_money_id') > 0) {

                                                return '<img src="../images/icons/application_go.png");/>';
                                            } else {

                                                return '<img src="../images/icons/brick_edit.png"); style="cursor:pointer"/>';
                                            }
                                        }
                                    }, {
                                        header: "แยก warranty",
                                        align: "center",
                                        dataIndex: "i_is_warranty",
                                        width: 50,
                                        id: "hdrPeriodWarrantyID",
                                        renderer: function (value, metaData, record, row, col, store, gridView) {
                                            if (value === 2) {

                                                return '<img src="../images/icons/accept.png"); style="cursor:pointer"/>';
                                            } else {

                                                return '<img src="../images/icons/cross.png");/>';
                                            }
                                        }
                                    },
                                    {header: "เงินหักจริง", align: "right", width: 50, dataIndex: "f_net_total_price"}, //c_arrive_code
                                    {header: "เลขรับของ", align: "left", width: 70, dataIndex: "c_arrive_code"}, //c_arrive_code
                                    {header: "ปีงบประมาณ/ปีใช้งบ", align: "left", width: 70, dataIndex: "i_yyyy"
                                        , renderer: function (value, metaData, record, row, col, store, gridView) {
                                            return  (parseInt(value) + 543) + "/" + (parseInt(Ext.session.bg_year) + 543);
                                        }
                                    }, //c_arrive_code
                                    {header: "งวดที่", align: "center", width: 35, dataIndex: "i_period"},
                                    {header: "วันที่รับของ", align: "center", width: 55, dataIndex: "d_arrive_date"},
                                    {header: "วันที่ส่งมอบ", dataIndex: "d_period_date", width: 55, align: "center"},
                                    {header: "เลขที่ตรวจรับ", dataIndex: "c_checking_code", width: 55, align: "left"},
                                    {header: "วันที่ตรวจรับ", dataIndex: "d_checking_date", width: 55, align: "center"},
                                    {header: "สถานะ", dataIndex: "c_status", width: 55, align: "left"},
                                    {header: "เหตุผล", dataIndex: "c_reason", width: 55, align: "left"}
                                ],
                                listeners: {
                                    beforerender: function () {
                                        Ext.selectRow2 = null;
                                        var permissionMenu = [
                                            {
                                                text: "แยก warranty",
                                                icon: "../images/icons/application_edit.png",
                                                handler: function (e) {
                                                    Ext.buAct = "update";
                                                    Ext.loadStore("editVaranty", true); // app,data.load
                                                },
                                                scope: this

                                            }
                                        ];
                                        this.isController = function (st, rec) {

                                            Ext.getCmp('winChequeID').remove(Ext.getCmp('tabpanelMain3ID'), true) || {};
                                            var tab2 = detailTab();
                                            Ext.getCmp('winChequeID').add(tab2);
                                            Ext.getCmp('winChequeID').setActiveTab(tab2);
                                            tab2.getForm().loadRecord(rec);
                                            if (st === "gencodecheking") {

                                            } else if (st === "viewDtail") {
                                                Ext.storePeriodDtl.setBaseParam("sp_check_period_hdr_id", rec.get("id"));
                                                Ext.storePeriodDtl.setBaseParam("sp_tor_hdr_period_id", rec.get("sp_tor_hdr_period_id"));
                                                Ext.getCmp("sp_check_period_hdr_idID").setValue(rec.get("id"));
                                                Ext.getCmp("tabpanelMain3ID").setTitle("ข้อมูลรายละเอียดของส่งตรวจ " + rec.get("c_arrive_code"));
                                                Ext.getCmp("winChequeID").setActiveTab(1);
                                                Ext.po_expense_id = rec.get("po_expense_id");
                                                Ext.dc_bg_budget_type_id = rec.get("dc_bg_budget_type_id");
                                                Ext.i_yyyyID = rec.get("i_yyyy");

                                                rec.set("warraty_age", rec.get("i_warranty_age"));
                                                rec.set("i_warraty_end", rec.get("d_warranty_date"));
                                                rec.set("i_notif_day", rec.get("i_before"));
                                                Ext.getCmp("tabpanelMain3ID").getForm().loadRecord(rec);
                                                if (Ext.getCmp("d_checking_dateID").getValue() != '') {
                                                    getWarraty();
                                                }
                                                Ext.storePeriodDtlLoad = function () {
                                                    Ext.storePeriodDtl.load({
                                                        callback: function (record, operation, success) {
                                                            if (success) {
                                                                Ext.f_net_tranf_price = 0;
                                                                Ext.i_qty_tranf = 0;
                                                                var i = 0;
                                                                Ext.each(record || {}, function (rec) {
                                                                    Ext.f_net_tranf_price += parseFloat(rec.get("f_net_tranf_price").replace(/,/g, "") / 1);
                                                                    Ext.i_qty_tranf += parseFloat(rec.get("i_qty_tranf"));
                                                                    i++;
                                                                });
//Ext.getCmp('i_status_checkingID').fn();
                                                                Ext.getCmp("f_totalID").setValue(Ext.floatRenderer(Ext.f_net_tranf_price));
                                                                Ext.getCmp("i_qty_tranfID").setValue(Ext.floatRenderer(Ext.i_qty_tranf));
                                                            }
                                                        },
                                                    });
                                                }; //End function
                                                Ext.storePeriodDtlLoad();
                                            }
                                        };
                                        this.contextMenu = new Ext.menu.Menu({
                                            items: permissionMenu,
                                        });
                                    },
                                    afterrender: function () {
                                        if (Ext.selectRow.get('i_purchase') == 1) {
                                            this.getColumnModel().removeColumn(5, true);
                                        }
                                        this.getColumnModel().removeColumn(4, true);
                                        this.getColumnModel().removeColumn(3, true);

//                                        if (parseInt(Ext.selectRow.get('i_overlap') / 1) === 2 && parseInt(Ext.selectRow.get('i_overlapcheck') / 1) === 0) {
//                                            this.getColumnModel().removeColumn(4, true);
//                                        } else if (parseInt(Ext.selectRow.get('i_overlap') / 1) === 0 && parseInt(Ext.selectRow.get('i_overlapcheck') / 1) === 0) {
//                                            this.getColumnModel().removeColumn(4, true);
//
//                                        } else {
//                                            this.getColumnModel().removeColumn(3, true);
//                                        }

                                        this.on(
                                                "cellclick",
                                                function (grid, rowIndex, columnIndex, e) {
                                                    var record = grid.getStore().getAt(rowIndex);
                                                    Ext.selectRow2 = record;


                                                    if (Ext.selectRow2.get('i_is_warranty') === 2) {
                                                        this.on("contextmenu", function (e, grid, rowIndex, columnIndex) {
                                                            e.stopEvent();
                                                            this.contextMenu.showAt(e.getXY());
                                                        }, this);
                                                    }


                                                    if (columnIndex === grid.getColumnModel().getIndexById("i_purchaseMontylyID")) {

                                                        Ext.purchaseMonthly = function (btn, text) {
                                                            Ext.getCmp('gridSub2ID').getEl().mask("Please wait...", "x-mask-loading");
                                                            Ext.Ajax.request({
                                                                url: "tor/api/mnCheckCode.php",
                                                                method: "POST",
                                                                params: {
                                                                    mode: "GENCODECHECKING_MONTHLY",
                                                                    sp_check_period_hdr_id: Ext.selectRow.get('sp_check_period_hdr_id'),
                                                                    sp_tor_contract_id: Ext.selectRow.get('sp_tor_contract_id'),
                                                                    sp_tor_dtl_period_id: Ext.selectRow.get('sp_tor_dtl_period_id'),
                                                                    sp_tor_hdr_period_id: Ext.selectRow.get('sp_tor_hdr_period_id'),
                                                                },
                                                                success: function (result, request) {
                                                                    let json = Ext.util.JSON.decode(result.responseText);

                                                                    console.log(json);
                                                                    if (json) {

                                                                        Ext.MessageBox.alert("Success", "บันทึกและตรวจรับการตั้งค่าใช้จ่าย", function () {
                                                                            Ext.getCmp('gridSub2ID').getEl().unmask();
//                                                                Ext.getCmp('winDcExpTypeDddID').destroy();
//                                                                loadBgStore(json.result.retid[0]);   
                                                                        });

                                                                    } else {
                                                                        Ext.MessageBox.alert("Failed", "การส่งข้อมูลปลายทางมีปัญหา");
//                                                            Ext.getCmp('formDcExpTypeDddID').getEl().unmask();
//                                                            Ext.getCmp('winDcExpTypeDddID').destroy();
                                                                    }
                                                                },
                                                                failure: function (result, request) {
                                                                    Ext.MessageBox.alert("Failed", result.responseText);
                                                                }
                                                            });
                                                        };

                                                        Ext.Msg.show({
                                                            msg: "ตรวจรับรายการจ้าง/เช่า แบบที่ค่าใช้จ่ายรายเดือน",
                                                            buttons: Ext.Msg.YESNO,
                                                            icon: Ext.MessageBox.QUESTION,
                                                            fn: function (btn, text) {
                                                                if (btn == 'yes') {
                                                                    // console.log(Ext.selectRow);
                                                                    Ext.purchaseMonthly(btn, text);
                                                                }
                                                            }
                                                        });


                                                    } else if (columnIndex === grid.getColumnModel().getIndexById("hdrPeriodID")) {
//                                                        alert(record.get('bg_checking_money_id'));

                                                        if (record.get('bg_checking_money_id') == 0) {
                                                            Ext.SP_TOR_HDR_PERIOD_ID = record.get("sp_tor_hdr_period_id");
                                                            if (record.get('bg_checking_money_id') == 0 && record.get('i_status_checking') != 2) {
                                                                this.isController("viewDtail", record);
                                                                Ext.period_status = true;
                                                            } else if (record.get('i_status_checking') == 2) {
                                                                Ext.MessageBox.alert("Notification", "รายการได้ผ่านการตรวจแล้ว(ไม่ผ่าน))", function () { });
                                                                Ext.period_status = false;
                                                            } else {
                                                                Ext.MessageBox.alert("Notification", "รายการได้ผ่านส่งรอเบิกแล้ว(ผ่าน))", function () { });
                                                                Ext.chkBgfn(false, 0, 0);
                                                                Ext.period_status = false;
                                                            }
                                                        } else {
                                                            this.isController("viewDtail", record);
                                                        }
//                                                        this.isController("viewDtail", record);
//                                                        Ext.period_status = true;
                                                    } else if (columnIndex === grid.getColumnModel().getIndexById("checkingOverlapBookID")) {



                                                        if (record.get('i_status_checking') == null) {
                                                            Ext.example.msg("แจ้งเตือน", "ไม่สามารถกดจอง ทำรายการตรวจรับก่อน", 1);
                                                            $(this).next("text copied");
                                                            setTimeout(function () {
                                                                $(this).next().remove();
                                                            }, 6000);
                                                            return;
                                                        } else {
                                                            if (record.get('i_overlap') == 3 && record.get('i_overlapcheck') == 0) {
                                                                // ที่ก่อนหนี้แล้ว 3 - 0 แต่ยังไม่เลือกใบ
                                                                var record = Ext.selectRow;
                                                                popOverlap();
                                                                var win = bgBagedOver(record, 2);
                                                                record.set("i_overlap", 1);
                                                                win.items.items[0].getForm().loadRecord(record);
                                                                win.show();
                                                            } else if (record.get('i_overlap') == 3 && record.get('i_overlapcheck') == 1) {
                                                                // ที่ก่อนหนี้แล้ว 3 - 1 เลือกใบกันแล้ว
                                                                var record = Ext.selectRow;
                                                                popOverlap();
                                                                var win = bgBagedOver(record, 2);
                                                                record.set("i_overlap", 2);
                                                                win.items.items[0].getForm().loadRecord(record);
                                                                win.show();
                                                            } else if (record.get('i_overlap') == 3 && record.get('i_overlapcheck') == 2) {
                                                                // ที่ก่อนหนี้แล้ว 3 - 2 กดใช้ใบกันแล้ว
                                                                Ext.example.msg("แจ้งเตือน", "กดใช้ใบกันแล้ว ไม่สามารถทำซ้ำได้", 1);
                                                                $(this).next("text copied");
                                                                setTimeout(function () {
                                                                    $(this).next().remove();
                                                                }, 6000);
                                                            } else if (record.get('i_overlap') == 2 && record.get('i_overlapcheck') == 2) {
                                                                // ที่ก่อนหนี้แล้ว 2 - 0 กดใช้ใบกันแล้ว   
                                                                // alert(2)
                                                            } else if (record.get('i_overlap') == 2 && record.get('i_overlapcheck') == 3) {
                                                                // ที่ก่อนหนี้แล้ว 2 - 3 กดใช้ใบกันแล้ว   
                                                                // alert(3)
                                                            } else if (record.get('i_overlap') == 2 && record.get('i_overlapcheck') == 0) {
                                                                // ที่ยังไม่ก่อหนี้ 2 - 0 กดใช้ใบกันแล้ว   
                                                                // alert(4)
                                                                return false;
                                                            }
                                                        }


                                                    } else if (columnIndex === grid.getColumnModel().getIndexById("checkingBookID")) {
                                                        Ext.perioidHdr = record;
                                                        if (record.get('i_status_checking') == null) {
                                                            Ext.MessageBox.alert("แจ้งเตือน", "รายการยังไม่ได้บันทึกข้อมูลการตรวจรับ");
                                                            return false;
                                                        }
                                                        ;
                                                        if (record.get('i_type_bg') == 11) {
                                                            Ext.genCode();
                                                            return;
                                                        }
                                                        if (record.get('contract_overlap') > 0) {  // มากวกว่า 0 คือก่อหนี้แล้ว

                                                            if (record.get('c_code') != "" && record.get('c_code') != null) {    // ออกเลขซ้ำไม่สามารถออกได้ 
                                                                Ext.MessageBox.alert("แจ้งเตือน", "ออกเลขเรียบร้อยแล้วไม่สามารถออกซ้ำได้");
                                                            } else {
                                                                genLinkBg('c_overlap_book', record);
                                                                Ext.c_overlap_close(record);
                                                                // Ext.genCode();      //ออกเลข CHK
                                                                Ext.MessageBox.alert("แจ้งเตือน", "ออกเลขเรียบร้อยแล้ว");
                                                            }
                                                        } else if (record.get('c_contract_overlap') === 0) {    // ยังไม่ก่อนหนี้

                                                        } else {
                                                            if (Ext.session.bg_year == Ext.selectRow.get('i_yyyy')) {
                                                                if (record.get('i_overlapcheck') === 0)
                                                                    alert('ใช้เงินกันเหลื่อมที่ก่อหนี้');
                                                                else
                                                                    alert('ใช้เงินกันเหลื่อมที่ก่อหนี้แล้ว');
                                                            } else {
                                                                if (record.get('bg_checking_money_id') == 0 && record.get('i_status_checking') == 1) {
                                                                    var i_is_last = record.get("i_is_last");
                                                                    var f_net_total = record.get("f_net_total_price").replace(/,/g, "") / 1; //เงินที่กำลังจะตรวจรับ
                                                                    var i_period = record.get("i_period");
                                                                    // console.log(record);
                                                                    if (i_is_last == 1) {
                                                                        Ext.storeSUMcontract.setBaseParam("sp_tor_contract_id", record.get("sp_tor_contract_id"));
                                                                        Ext.storeSUMcontract.load({
                                                                            callback: function (record, operation, success) {
                                                                                if (success) {
                                                                                    var rec = record[0];
                                                                                    var count_period = rec.data.sum_period;
                                                                                    var sum_period = rec.data.f_total_amt; // เงินของทุกงวด || เงินสัญญา
                                                                                    var sum_check = rec.data.sum_check; // จำนวนเงินที่เคยตรวจรับ
                                                                                    var sum_check_now = sum_check + f_net_total;
                                                                                    var sum_check2 = rec.data;  // 
                                                                                    if (sum_check_now != sum_period && i_period == count_period) {
                                                                                        winProcess(record);
                                                                                    } else if (i_period != count_period) {
                                                                                        Ext.MessageBox.alert("Notification", "งวดสุดท้ายกับงวดที่มีไม่ตรงกัน ", function () {
                                                                                            return false;
                                                                                        });
                                                                                    } else {
                                                                                        // return false ;
                                                                                        var record = Ext.perioidHdr;
                                                                                        Ext.getMoney(record); // ออกเลขตรวจรับ
                                                                                    }
                                                                                }
                                                                            }
                                                                        });
                                                                    } else {
                                                                        // return ; 
                                                                        var record = Ext.perioidHdr;
                                                                        Ext.getMoney(record); // ออกเลขตรวจรับ
                                                                    }
                                                                } else if (record.data.c_code != null && record.data.c_code != "") {
                                                                    // console.log(record);
                                                                    Ext.MessageBox.alert("Notification", "มีเลขCHK ไม่สามารถออกเลขซ้ำได้ ", function () {
                                                                        return false;
                                                                    });
                                                                } else {
                                                                    Ext.MessageBox.alert("Notification", "ไม่สามารถกดจอง", function () {
                                                                        return false;
                                                                    });
                                                                }
                                                            }
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
                                                                    i_is_warranty: record.data.i_is_warranty,
                                                                    sp_tor_contract_id: record.data.sp_tor_contract_id
                                                                },
                                                                success: function (result, request) {
                                                                    // console.log(result);
                                                                    if (result.statusText) {
                                                                        Ext.storeDtl.reload();
                                                                        Ext.Msg.alert("แจ้งเตือน", "ออกเลขเรียบร้อยแล้ว");
                                                                        Ext.getCmp("winPeriodHdrID").destroy();
                                                                    }
                                                                    Ext.getCmp("winChequeID").getEl().unmask();
                                                                },
                                                                failure: function (result, request) {
                                                                    Ext.MessageBox.alert("Failed", result.responseText);
                                                                }
                                                            });
                                                            Ext.getCmp("gridSub2ID").getStore().reload();
                                                            Ext.getCmp("winChequeID").getEl().unmask();
                                                        } else if (record.get('c_code') !== "") {

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
                                }
                            }
                        ],
                        buttonAlign: "left",
                        buttons: [
                            {
//                                text: "ทำรายการ หห",
//                                id: "buSaveSubID",
//                                iconCls: "icon-save",
//                                handler: function () {},
//                                //haddler
//                            },
//                            {
                                text: Ext.GLOBAL_BU_BACK_TH,
                                handler: function () {
                                    Ext.getCmp("winPeriodHdrID").hide();
                                    Ext.getCmp("winPeriodHdrID").destroy();
                                },
                            },
                        ]
                    }),
                    //tab2  
                    tab2
                ], //windows items
                listeners: {
                    beforender: function () {
//                                Ext.getCmp('winChequeID').Disabled(true);
//                                Ext.getCmp('winChequeID').remove(Ext.getCmp('tabpanelMain3ID'), true) || {}; 
//                                //Ext.tabpanelMain3ID  

                    },
                    afterrender: function () {
                        Ext.getCmp('winChequeID').remove(Ext.getCmp('tabpanelMain3ID'), true) || {};

                    }
                }
            },
        }); //return
    };
}; //APUX()
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
                layout: "fit",
            },
            listeners: {
                afterrender: function () {
                    //  console.log(Ext.getCmp('contenterCenter').getWidth());
                },
            },
            items: [new gridMain()]
        })
    });
    Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
});
