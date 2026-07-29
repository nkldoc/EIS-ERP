/* global Ext, user_right_add, user_right_edit, user_right_delete */
PDFform = function (record){
    var urlUpload = window.location.protocol + "//" + window.location.hostname + "/sp_mn/api/mnUploadDocIr.php";
    var linkDownload = window.location.protocol + "//" + window.location.hostname + "/sp_mn/api/upload_ir";
    // console.log(record.json.creditor_pdf);
    function getPDF(a) {
        if (record.json.creditor_pdf == true) {
            // Ext.getCmp("upload_pdf1").hide();
            return "เอกสาร PDF";
        }else{
            // Ext.getCmp("upload_pdf1").show();
            return "ยังไม่อัพโหลดเอกสาร";
        }
    }
    text_creditor = null ; 
    if (record.json.dc_tax_customer_id == 0) {
        text_creditor = "ยังไม่มีข้อมูลผู้เสียภาษี"
    } else {
        text_creditor = "มีข้อมูลผู้เสียภาษีแล้ว"
    }
    return new Ext.FormPanel({
        height: 180,
        layout: "form",
        // width: 800,
        id: "frmSubItemID",
        url: urlUpload,
        fileUpload: true,
        border: false,
        items: [
            {

                xtype: "hidden",
                name: "id",
                value: record.get("sp_tor_hdr_period_id"),
            },
            {
                xtype: "hidden",
                name: "i_is_upload",
                value: 1,
            },
            {
                fieldLabel: "hostname",
                xtype: "textfield",
                width: 400,
                readonly: true,
                hidden: true,
                name: "hostname",
                value: urlUpload,
            },
            {
                fieldLabel: "สถานะ",
                xtype: "displayfield", // textfield  panel
                width: 400,
                readonly: true,
                // hidden: true,
                name: "text_creditor",
                value: text_creditor,
            },
            {
                fieldLabel: "ชื่อเอกสาร",
                xtype: "textfield",
                width: 400,
                value : "IR000"+record.get('sp_tor_hdr_period_id') ,
                name: "c_code",
                id: "arr_c_codeID",
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
            },
            {
                xtype: "panel",
                border: false,
                html:
                        '<p id="downloadID" >Download :: <a type="button" href="' +
                        linkDownload +
                        "/" + "IR000"+record.get('sp_tor_hdr_period_id') +
                        ".pdf?T=Tap_" + Math.floor(Math.random() * 100000) +
                        '" target="_blank" class="buttonx">' +
                        getPDF(record) +
                        "</a></p>"
            },
        ],
        buttonAlign: "left",
        buttons: [
            {
                text: "บันทึกเอกสารเพิ่ม",
                handler: function () {
                    var form = Ext.getCmp("frmSubItemID").getForm();
                    form.submit({
                        waitMsg: "Saving Data...",
                        success: function (form, action) {
                            Ext.Msg.alert("Success", "เรียบร้อย", function (form, action) {
                                Ext.store5.reload({
                                    callback: function (record, operation, success) {
                                        if (success) {
                                            // Ext.get("downloadID").dom.innerHTML ;
                                            console.log(record);
                                            Ext.getCmp("frmSubItemID").destroy();
                                            Ext.getCmp('fileuploadID').insert(1, PDFform(record[0]));
                                            Ext.getCmp('fileuploadID').doLayout();
                                            Ext.receiveJson2 = function (obj, id) {
                                                    let Date_now = new Date();
                                                    let jsonApplay = Ext.apply(obj, {client_datetime: Date_now.format('Y-m-d H:i:s'),
                                                        user_sent_id: Ext.session.user_id,
                                                        user_id: '60105',
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
                                                textSent = record[0].get('inv_name');
                                                var wsUri = "ws://" + window.parent.Ext.ipServer + ":9000/demo/server.php";
                                                websocket = new WebSocket(wsUri);
                                                websocket.onopen = function (ev) { // connection is open   
                                                    var msg = {
                                                        message: "มีการอัพโหลดเอกสาร ผู้ขายผู้รับจ้าง: " + textSent,
                                                        name: '60105',
                                                        sent_name: Ext.session.user_name,
                                                        color: '#007AFF'
                                                    };
                                                    websocket.send(JSON.stringify(msg));
                                                };
                                                var obj = {
                                                    "type": "usermsg",
                                                    "name": "60105",
                                                    "sent_name": Ext.session.user_name,
                                                    "message": "มีการอัพโหลดเอกสาร ผู้ขายผู้รับจ้าง " + textSent,
                                                    "color": "#007AFF"
                                                };
                                                Ext.receiveJson2(obj, id);
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
        ],
    });
};
Ext.genLink = function (i, f) {
    //winPeriodHdrID
    Ext.getCmp("winPeriodHdrID").getEl().mask("Please wait...", "x-mask-loading");
    var link = '';
    var ip = Ext.session.ip_booking;// 192
    // var ip = 'localhost';

    if (i === 1) { //get Money 
        link = "http://" + ip +
                "/api-nmu/?/bg/BgBudgetAllSupplies" +
                "/i_year/" + Ext.perioidHdr.get("i_yyyy") +
                "/dc_budget_type_id/" + Ext.perioidHdr.get('dc_bg_budget_type_id') +
                "/dc_cost_id/" + Ext.perioidHdr.get("dc_cost_id") +
                "/bg_expense_id/" + Ext.perioidHdr.get("po_expense_id");

    } else if (i === 2) { // Req Money
        link = 'http://' + ip + '/api-nmu/?/bg/mn_BgRequestMoneyIncome/mode/POST'
                + '/i_sys/1'
                + '/chk_id/' + Ext.perioidHdr.get('id')
                + '/i_year/' + Ext.perioidHdr.get('i_yyyy')
                + '/i_request/1' // step 1 PR step 2 po step3 checking
                + '/dc_cost_id/' + Ext.perioidHdr.get('dc_cost_id')
                + '/dc_budget_type_id/' + Ext.perioidHdr.get('dc_bg_budget_type_id')
                + '/bg_expense_id/' + Ext.perioidHdr.get('po_expense_id')
                + '/f_amt/' + f;

    }
    return link;
};

Ext.getMoney = function (rs) {

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

            if (f_total_income >= cheVal) {
//                alert(f_total_income);
                Ext.getCmp("winPeriodHdrID").getEl().unmask();
                Ext.MessageBox.alert("Success", "เงินที่จะเบิกมีเพียงพอ", function () {
                    Ext.get('checkMoneyID').update('เงินที่จะเบิกมีเพียงพอ');
                });

            } else {
                // alert('เงินรายได้รับจริง ไม่พอดำเนินการตรวจรับ ' + f_total_income);
                Ext.MessageBox.alert("Success", "เงินรายได้รับจริงไม่พอ ระบบได้ดำเนินการร้องของเงินแล้ว ให้ดำเนินการตรวจรับต่อ", function () {
                    Ext.reqMoney(11, 1, cheVal); //id,req_time,f_req
                    Ext.get('checkMoneyID').update('เงินที่จะเบิกมีไม่เพียงพอ ส่งคำขอเงินไปผ่ายคลังแล้ว');
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

//    alert(link);
//    Ext.getCmp("winPeriodHdrID").getEl().unmask();
//    return false;

    Ext.Ajax.request({
        url: link, //record,linkGetMoney
        method: "GET", //POST
        disableCaching: false,
        success: function (result, request) {
            var jsonData = Ext.util.JSON.decode(result.responseText); //decode json 
            Ext.upMoneyId(Ext.perioidHdr.get('id'), 1, Ext.perioidHdr.get('f_total_amt'), jsonData.bg_request_money_income_id);
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

Ext.CheckColumn = Ext.extend(Ext.grid.Column, {
    processEvent: function (name, e, grid, rowIndex, colIndex) {
        var record = grid.store.getAt(rowIndex);

        // // Event only on enable row (depending on css)
        // if (name == "mousedown" && grid.getView().getRowClass(record, rowIndex).indexOf("privileges-grid-disable") == -1) {
        //   var checked = !record.data[this.dataIndex];

        // if click on 'all' checkbox, check all boxes on the same row
        if (this.dataIndex == "all") {
            var checked = !record.data[this.dataIndex];
            for (var i = 1; i < grid.getColumnModel().config.length; i++) {
                record.set(grid.getColumnModel().config[i].dataIndex, checked);
            }
        } else {
            // uncheck 'all' box if one is unchecked
            if (!checked && record.data["all"]) {
                record.set("all", checked);
            }
            record.set(this.dataIndex, checked);
        }

        return false; // Cancel row selection.
    },

    renderer: function (v, p, record) {
        p.css += " x-grid3-check-col-td";
        // Remove notify and edit to internet,intranet,all groups
        if ((this.dataIndex == "oper2" || this.dataIndex == "oper3") && (record.id == 0 || record.id == 1 || record.id == -1)) {
            return "";
        }
        return String.format('<div class="x-grid3-check-col{0}">&#160;</div>', v ? "-on" : "");
    },

    // Deprecate use as a plugin. Remove in 4.0
    init: Ext.emptyFn,
});

const saveDtl = function (mode) {

    let msg = "";
    let jsonArr = [];
    var num = Ext.getCmp("gridEditor").store.data.items.length - 1;
    var row = 0;
    while (num >= row) {
        var i_qty = document.getElementById("iqtyID[" + row + "]").value;
        var i_total = document.getElementById("blurItem[" + row + "]").value;

        if (i_qty > 0) {
            jsonArr.push({
                i_qty: i_qty,
                sp_tor_hdr_period_id: Ext.getCmp("gridEditor").store.data.items[row].data.sp_tor_hdr_period_id,
                sp_tor_dtl_period_id: Ext.getCmp("gridEditor").store.data.items[row].data.sp_tor_dtl_period_id,
                dc_creditor_id: Ext.getCmp("gridEditor").store.data.items[row].data.dc_creditor_id,
                c_name: Ext.getCmp("gridEditor").store.data.items[row].data.c_name,
                dc_unit_type_id: Ext.getCmp("gridEditor").store.data.items[row].data.dc_unit_type_id,
                c_unit: Ext.getCmp("gridEditor").store.data.items[row].data.c_unit,
                dc_bg_budget_type_id: Ext.getCmp("gridEditor").store.data.items[row].data.dc_bg_budget_type_id,
                po_expense_id: Ext.getCmp("gridEditor").store.data.items[row].data.po_expense_id,
                i_hire_type: Ext.getCmp("gridEditor").store.data.items[row].data.i_hire_type,
                i_product_type: Ext.getCmp("gridEditor").store.data.items[row].data.i_product_type,
                i_is_inv: Ext.getCmp("gridEditor").store.data.items[row].data.i_is_inv,
                f_net_unit_price: i_total.replace(/\,/g, ''),
                f_net_total_price: i_total.replace(/\,/g, '') * i_qty,
            });
        }
        row++;
    }
    dc_tax_customer_id = Ext.store5.data.items[0].json.dc_tax_customer_id; 
    creditor_pdf = Ext.store5.data.items[0].json.creditor_pdf; 
    console.log(Ext.store5.data.items[0].data.dc_tax_customer_id);
    if (Ext.getCmp("c_doc_refID").getValue() == "") {
        msg += "<span style='white-space: nowrap;'>- กรุณากรอกวันที่ส่งของ</span><br>";
    }
    if (Ext.getCmp("d_doc_dateSubID").getValue() == "") {
        msg += "<span style='white-space: nowrap;'>- กรุณากรอกเอกสารอ้างอิง</span><br>";
    }
    if (jsonArr.length == 0) {
        msg += "<span style='white-space: nowrap;'>- กรุณารระบุจำนวนรายการ</span><br>";
    }
    if(dc_tax_customer_id == 0 && creditor_pdf == false ){
        msg += "<span style='white-space: nowrap;'>- ไม่มีข้อมูลผู้เสียภาษี กรุณาอัพโหลดไฟล์ PDF</span><br>";
    }

    if (msg == "") {
        Ext.getCmp("winChequeID").getEl().mask("Please wait...", "x-mask-loading");
        Ext.Ajax.request({
            url: "tor/api/mnPeriodController.php",
            method: "POST",
            params: {
                mode: "UP_SP_CHECK_PERIOD_DTL",
                data: JSON.stringify(jsonArr),
                sp_tor_hdr_period_id: Ext.SP_TOR_HDR_PERIOD_ID,
                sp_mn_contract_hdr_id: Ext.SP_MN_CONTRACT_HDR_ID,
                sp_tor_contract_id: Ext.SP_CONTRACT_PO_ID,
                i_is_po: Ext.I_IS_PO,
                f_vat_amt: Ext.getCmp('f_vat_amt3ID').getValue(), //f_rate_vat3ID f_total_add_vat_amt3ID f_vat_amt3ID
                f_total_add_vat_amt: Ext.getCmp('f_total_add_vat_amt3ID').getValue(),
                f_rate_vat: Ext.getCmp('f_rate_vat3ID').getValue(),
                c_doc_ref: Ext.getCmp("c_doc_refID").getValue(),
                d_arrive_date: Ext.util.Format.date(Ext.getCmp("d_doc_dateSubID").getValue(), "Y-m-d"),
                d_doc_arrive_dt: Ext.util.Format.date(Ext.getCmp("d_doc_arrive_dtID").getValue(), "Y-m-d"),
                c_comment: Ext.getCmp("c_commentID").getValue(),
                dc_creditor_per_id: Ext.getCmp("dc_creditor_per_idID").getValue(),
            },
            success: function (result, request) {
                Ext.getCmp("winChequeID").getEl().unmask();
                Ext.store5.setBaseParam("sp_tor_hdr_period_id", Ext.SP_TOR_HDR_PERIOD_ID);
                Ext.store5.load();
                Ext.getCmp("c_doc_refID").setValue("");
                Ext.getCmp("d_doc_dateSubID").setValue("");
                Ext.getCmp("c_commentID").setValue("");
                let json = Ext.util.JSON.decode(result.responseText);
                Ext.Msg.alert("แจ้งเตือน", json.msg);
                if (request.success) {
                    Ext.Msg.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย");
                    Ext.getCmp("winSearchFrmReceive").hide();
                    Ext.getCmp("winSearchFrmReceive").destroy();
                }
            },
            failure: function (result, request) {
                Ext.MessageBox.alert("Failed", result.responseText);
            },
        });
    } else {
        Ext.Msg.alert("แจ้งเตือน", msg);
    }
};

Ext.fnWidEditIqty = function (rec) {
    console.log(rec);
    return new Ext.Window({
        title: "แก้ไขรายการรับของ",
        width: 350,
        modal: true,
        height: 200,
        id: "winEditID",
        layout: "fit",
        items: new Ext.FormPanel({
            title: "รายละเอียดการส่งมอบงาน",
            id: "winEditFrmID",
            url: "tor/api/mnPeriodController.php",
            frame: true,
            labelAlign: "left",
            bodyStyle: "padding:1px",
            labelWidth: 120,
            items: [{
                    xtype: "hidden",
                    name: "mode",
                    value: "UP_SP_QTY_PERIODd_HDR",
                }, {
                    xtype: "hidden",
                    name: "i_qty",
                    value: rec.get('i_qty_all'),
                }, {
                    xtype: "hidden",
                    name: "id",
                    value: rec.get('id'),
                }, {
                    xtype: "displayfield",
                    fieldLabel: "จำนวนรายวางบิล/รับของในงวด",
                    value: rec.get('i_qty_all'),
                    name: "i_qty_org"
                }, {
                    xtype: "textfield",
                    maskRe: /[1-9-]/,
                    fieldLabel: "เพิ่มรายวางบิล/รับของ",
                    value: 1,
                    name: "i_qty_add"
                }],
            buttonAlign: "left",
            buttons: [
                {text: 'บันทึกการย่อยงวด',
                    iconCls: "icon-save",
                    handler: function () {


                        var formSubmit = function (form) {
                            form.submit({
                                waitMsg: "Saving Data...",
                                success: function (form, action) {
                                    Ext.Msg.alert("Success", action.result.msg, function (form, action) {

                                        Ext.store5.reload({
                                            callback: function (record, operation, success) {
                                                if (success) {
                                                    //Override SelectRow Record  
                                                    Ext.getCmp("winEditID").destroy();
                                                    Ext.getCmp("winSearchFrmReceive").destroy();
                                                    record.forEach(function (v) {
                                                        if (rec.get('id') == v.get('sp_tor_contract_id')) {

                                                            var record = v;
                                                            console.log(record);

                                                            Ext.getCmp("winEditID").destroy();
                                                            Ext.getCmp("winMain").destroy();

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
                                            Ext.Msg.alert("Failure", "พบข้อผิดพลาดในการเชื่อต่อเครือข่าย");
                                            break;
                                        case Ext.form.Action.SERVER_INVALID:
                                            Ext.Msg.alert("Failure", action.result.msg);
                                    }
                                },
                            });
                        }; //END winEditFrmID
                        var form = Ext.getCmp("winEditFrmID").getForm();

                        formSubmit(form);

                    }
                }
            ],

        })
    });

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
                                fieldLabel: "รหัสสัญญา",
                                id: "c_codeID", // sd_tor_dateID sc_codeID sc_nameID searchEnabledID
                                name: "c_code",

                            },
                            {
                                xtype: "radiogroup",
                                columns: [120],
                                fieldLabel: "ประเภทการดูข้อมูล",
                                id: "viewID",
                                items: [
                                    {
                                        name: "view",
                                        checked: true,
                                        inputValue: 0,
                                        boxLabel: "ทั้งหมด",

                                    },
                                    {
                                        name: "view",
                                        inputValue: 1,
                                        boxLabel: "เฉพาะของตัวเอง",
                                    },
                                ], //radiogroup
                            },
                        ],
                    },
                    {
                        columnWidth: 0.2,
                        layout: "form",
                        border: false,
                        items: [],
                    },
                ],
                buttonAlign: "left",
                buttons: [
                    {
                        text: "ค้นหา",
                        handler: function () {
                            Ext.storeDtl.setBaseParam("mode", "LIST_SP_MN_CONTRACT_HDR");
                            Ext.storeDtl.setBaseParam("act", "SEARCH");
                            Ext.storeDtl.setBaseParam("c_code", Ext.getCmp("c_codeID").getValue());
                            Ext.storeDtl.setBaseParam("view", Ext.getCmp("viewID").getValue().inputValue);
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
function blurItems(row) {
    var val = Ext.get('blurItem[' + row + ']').dom.value.replace(/\,/g, '') / 1;
//    console.log(val);
    Ext.get('blurItem[' + row + ']').dom.value = (val) ? Ext.floatRenderer(val) : 0.00;

}

Ext.styleBu = "style='display: inline-block; background-color: #7b38d8; padding: 3px; color: #ffffff; text-align: center; border:1px double #cccccc; border-radius:4px; font-size:12px;'";
Ext.styleBu1 = "style='display: inline-block; background-color: #3033c2; padding: 3px; color: #ffffff; text-align: center; border:1px double #cccccc; border-radius:4px; font-size:12px;'";
Ext.styleBu2 = "style='display: inline-block; background-color: #18648c; padding: 3px; color: #ffffff; text-align: center; border:1px double #cccccc; border-radius:4px; font-size:12px;'";

Ext.AppUx = function (app, menu) {
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
                ["c_code", "เลขที่สัญญา"],
                ["c_name", "เรื่อง"],
                ["dc_creditor_name", "ชื่อคู่สัญญา"],
            ];
            var setFilter = [["c_name", "เรื่อง"]];

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
                var TextShow = record.data.c_code + " " + record.data.c_name;
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
    var columnMini = [
        {
            header: "ID System",
            sortable: true,
            hidden: true,
            dataIndex: "sp_contract_id",
        },
        {
            header: "",
            sortable: true,
            hidden: true,
            dataIndex: "c_code",
        },
        {
            header: "ลำดับ",
            align: "center",
            width: 60,
            sortable: true,
            dataIndex: "no",
        },
        {
            header: "เลขที่สัญญา",
            align: "left",
            width: 150,
            sortable: true,
            dataIndex: "c_code",
        },
        {
            header: "เรื่อง",
            sortable: true,
            id: "c_name",
            width: 150,
            dataIndex: "c_name",
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                metaData.attr = "style='cursor:pointer';";
                return value;
            },
        },
        {
            header: "ชื่อคู่สัญญา",
            width: 150,
            sortable: true,
            dataIndex: "dc_creditor_name",
        },
        {
            header: "หมวดค่าใช้จ่าย",
            width: 150,
            sortable: true,
            dataIndex: "po_expense_name",
        },
        {
            header: "เงินในสัญญา",
            width: 150,
            align: "right",
            sortable: true,
            dataIndex: "f_total_amt",

        },
        {
            header: "ผู้ดำเนินรายการ",
            width: 150,
            align: "center",
            sortable: true,
            dataIndex: "sp_emp_name",
        },
        {
            header: "สายงาน",
            width: 150,
            align: "center",
            sortable: true,
            // hidden: true,
            dataIndex: "dc_department",
        },
        {
            header: "สัญญาแบบ",
            width: 150,
            align: "center",
            hidden: true,
            sortable: true,
            dataIndex: "i_type_po",
        },
        {
            header: "วันสิ้นสุดสัญญา",
            width: 90,
            sortable: true,
            dataIndex: "d_due_date",
            renderer: function (val, metaData, record, rowIndex, colIndex, store) {
                return shortThaiDate(val);
            },
        },
        {
            header: "หน่วยงานเจ้าของเรื่อง",
            align: "left",
            hidden: true,
            dataIndex: "dc_cost_name",
        },
    ];
    Ext.storeCont = new Ext.data.JsonStore({
        //autoLoad: true,
        storeId: "myStoreCont",
        url: "tor/api/mnTorController.php",
        baseParams: {mode: "LIST_CONTRACTANDPO", id: 0},
        root: "data",
        idProperty: "id",
        totalProperty: "totalCount",
        fields: [
            {name: "no"},
            {name: "id"},
            {name: "sp_contract_po_id"},
            {name: "i_is_po"},
            {name: "i_type_po"},
            {name: "c_code"},
            {name: "c_doc_ref"},
            {name: "sp_tor_contract_id"},
            {name: "sp_po_id"},
            {name: "dc_creditor_id"},
            {name: "dc_creditor_name"},
            {name: "po_expense_name"},
            {name: "po_expense_id"},
            {name: "f_total_amt"},
            {name: "c_name"},
            {name: "d_doc_date"},
            {name: "d_due_date"},
            {name: "dc_cost_name"},
            {name: "sp_emp_name"},
            {name: "dc_department"},
            {name: "sp_emp_id"},
        ],
    });


    var PopContForm = new Ext.Poplov_in({
        text: "เลือกสัญญา",
        id: "sp_contractID",
        iconCls: "page_magnify",
        valueHidden: "sp_contract_po_id",
        store: Ext.storeCont,
        headerGrid: columnMini,
        widthText: 330,
        fieldLabel: "เลือกสัญญา",
        isCellClickGrid: true,
        cellClickGrid: function (grid, rowIndex, columnIndex, e) {
            var id = "sp_contractID";
            var nameID = id + "_Name";
            var record = grid.getStore().getAt(rowIndex);
            var TextShow = record.data.c_code;
            Ext.getCmp("i_is_poID").setValue(record.data.i_is_po);
            Ext.getCmp("sp_contractID").setValue(record.data.id);
            Ext.getCmp("c_name_inID").setValue(record.data.c_name);
            Ext.getCmp("sp_emp_idID").setValue(record.data.sp_emp_id);
            Ext.getCmp("po_expense_idID").setValue(record.data.po_expense_name);
            Ext.getCmp("d_start_dateID").setValue(record.data.d_doc_date);
            Ext.getCmp("d_doc_dateID").setValue(record.data.d_doc_date);
            Ext.getCmp("d_end_dateID").setValue(record.data.d_due_date);
            var f_total = parseFloat(record.data.f_total_amt.replace(/,/g, "") / 1);
            Ext.getCmp("f_total_amtID").setValue(Ext.floatRenderer(f_total));
            Ext.getCmp(nameID).setValue(TextShow);
            Ext.getCmp("win-pop-lov" + id).hide();
            Ext.getCmp("win-pop-lov" + id).destroy();
        },
    });
    Ext.user_right_add = user_right_add;
    Ext.user_right_edit = user_right_edit;
    Ext.user_right_delete = user_right_delete;
    Ext.title = Ext.menu_name + " " + Ext.menu_code;
    Ext.selectRow = [];
    Ext.menuEditGrid = true;
    Ext.menuRightEditgrid = true;
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
    function controller(rec, evt) {
        if (Ext.isEmpty(rec))
            Ext.Msg.alert("แจ้งเตือน", "กรุณา click เลือกข้อมูลที่จะแก้ไขใน data grid", function (bu, action) {
                return false;
            });
        else
            Ext.Msg.show({
                title: "แจ้งเตือน!",
                msg: "Are you sure you want to process due PA & ALERT TOR?",
                width: 400,
                // buttons: Ext.MessageBox.YESNOCANCEL,
                buttons: Ext.MessageBox.YESNO,
                fn: function (btn, text) {
                    if (btn === "yes")
                        alert("You pressed " + btn);
                    else
                        null;
                },
                icon: Ext.MessageBox.ERROR,
            });
    }
    function Extstore3() {
        Ext.store3 = new Ext.data.JsonStore({
            storeId: "myStore3",
            autoDestroy: false,
            autoLoad: false,
            url: "tor/api/mnPeriodController.php",
            root: "data",
            baseParams: {
                mode: "LIST_PERIOD_IN_SPMNCONTRACT",
                sp_contract_po_id: Ext.SP_CONTRACT_PO_ID,
                i_is_po: Ext.I_IS_PO,
                sp_tor_id: Ext.sp_tor_id
            },
            idProperty: "id",
            totalProperty: "totalCount",
            fields: [
                {name: "no"},
                {name: "id"},
                {name: "sp_tor_id"},
                {name: "i_status_checking"},
                {name: "i_booking_bg"},
                {name: "i_overlap"},
                {name: "i_status_checking_name"},
                {name: "CheckColumn"},
                {name: "sp_mn_contract_hdr_id"},
                {name: "sp_mn_contract_dtl_id"},
                {name: "c_arrive_code"},
                {name: "d_arrive_date"},
                {name: "sp_contract_id"},
                {name: "dc_creditor_name"},
                {name: "sp_tor_hdr_period_id", type: "int"},
                {name: "sp_tor_contract_id", type: "int"},
                {name: "c_doc_ref_contract"},
                {name: "sp_po_id", type: "int"},
                {name: "i_period", type: "int"},
                {name: "i_qty", type: "int"},
                {name: "i_qty2", type: "int"},
                {name: "f_total_amt", type: "string"},
                {name: "f_net_total_price", type: "string"},
                {name: "d_doc_date"},
                {name: "d_period_date"},
                {name: "i_day"},
                {name: "i_alert"},
                {name: "i_is_status"},
                {name: "i_is_null"},
                {name: "i_yyyy"},
                {name: "po_expense_id"},
                {name: "dc_creditor_per_id"},
                {name: "po_expense_name"},
                {name: "dc_cost_id"},
                {name: "dc_bg_budget_type_id"},
            ],
        });
    }
    function cellClick(grid, rowIndex, columnIndex, e) {
        Ext.selectRow = this.selModel.selection.record;
        var record = grid.getStore().getAt(rowIndex);
        Ext.selectMain = record;
        Ext.sp_tor_id = Ext.selectMain.get('sp_tor_id');
        Extstore3();

        if (columnIndex === grid.getColumnModel().getIndexById("processDueID")) {
            //ttf 
            controller(Ext.selectRow, "processDue"); //on
        }
    }


    Ext.storeDtl = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "tor/api/mnTorController.php",
        baseParams: {
            mode: "LIST_SP_MN_CONTRACT_HDR",
            // keyData: Ext.keyData,
            // tor_status_id: Ext.menu_id,
        },
        root: "data",
        idProperty: "id",
        totalProperty: "totalCount",
        fields: [
            {
                name: "no",
            },
            {
                name: "sp_tor_id",
            },
            {
                name: "id", //id sp_tor_id i_period c_doc_ref f_total_amt d_period_date
            },
            {
                name: "i_purchase",
            },
            {
                name: "i_type_contract",
            },
            {
                name: "sp_contract_po_id",
            },
            {
                name: "sp_mn_contract_hdr_id",
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
                name: "i_is_po",
            },
            {
                name: "c_name_in",
            },
            {
                name: "dc_creditor_name",
            },
            {
                name: "po_expense_name",
            },
            {
                name: "po_expense_id",
            },
            {
                name: "c_doc_ref",
            },
            {
                name: "i_type_fine",
            },
            {
                name: "c_arrive_code",
            },
            {
                name: "c_checking_code",
            },
            {
                name: "d_arrive_date",
            },
            {
                name: "d_doc_date",
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
    Ext.poFormID = "grid-form-cheque";
    Ext.I_IS_PO = null;
    //interlizing
    Ext.loadStore = function (status, show) {
        var statusx = status;
        var winx = show;
        if (statusx == "edit" && Ext.isEmpty(Ext.selectRow))
            Ext.Msg.alert("แจ้งเตือน", "กรุณา click เลือกข้อมูลที่จะแก้ไขใน data grid", function (form, action) {
                return false;
            });
        else if (statusx === "load") {
        } else
            AppPoStore(statusx).show();

        if (statusx === "add") {
            Ext.SP_MN_CONTRACT_HDR_ID = null;
            Ext.SP_CONTRACT_PO_ID = null;
            Ext.I_IS_PO = null;
            Ext.getCmp("sp_mn_contract_hdr_idID").setValue("");
            Ext.getCmp("winChequeID").hideTabStripItem(1);
        } else if (statusx === "edit") {
            Ext.getCmp("winChequeID").items.items[0].getForm().loadRecord(Ext.selectRow);
            Ext.getCmp("Busp_contractID").hide();

            Ext.SP_MN_CONTRACT_HDR_ID = Ext.selectRow.data.sp_mn_contract_hdr_id;
            Ext.SP_TOR_HDR_PERIOD_ID = Ext.selectRow.data.sp_tor_hdr_period_id;
            Ext.SP_CONTRACT_PO_ID = Ext.selectRow.data.sp_contract_po_id;
            Ext.I_IS_PO = Ext.selectRow.data.i_is_po;
            Ext.store3.setBaseParam("sp_contract_po_id", Ext.SP_CONTRACT_PO_ID);
            Ext.store3.setBaseParam("i_is_po", Ext.I_IS_PO);
            Ext.store3.load();
        }
        //
    };
    var AppPoStore = function (statuss) {
        // var disp = true?'displayfield':'textfield';
        return new Ext.Window({
            collapsible: true,
            maximizable: true,
            title: "ทำรายการส่งมอบงาน",
            id: "winMain",
            width: Ext.getCmp("contenterCenter").getWidth() - 5,
            height: Ext.getCmp("contenterCenter").getHeight() - 5,
            layout: "fit",
            modal: true,
            plain: true,
            bodyStyle: "padding:1px;",
            buttonAlign: "left",
            items: {
                xtype: "tabpanel",
                activeTab: 0,
                id: "winChequeID",
                // defaults: {autoHeight: true, bodyStyle: 'padding:10px'},
                items: [
                    new Ext.FormPanel({
                        title: "รายละเอียดการส่งมอบงาน",
                        id: Ext.poFormID,
                        columnWidth: 1,
                        url: "tor/api/mnTorController.php",
                        frame: true,
                        labelAlign: "left",
                        bodyStyle: "padding:1px",
                        labelWidth: 120,
                        items: [
                            {
                                xtype: "hidden",
                                name: "mode",
                                value: "UP_SP_MN_CONTRACT_HDR",
                                readOnly: true,
                            },
                            {
                                xtype: "hidden",
                                id: "sp_mn_contract_hdr_idID",
                                name: "sp_mn_contract_hdr_id",
                                value: Ext.SP_MN_CONTRACT_HDR_ID,
                                readOnly: true,
                            },
                            {
                                xtype: "hidden",
                                id: "i_is_poID",
                                name: "i_is_po",
                                value: Ext.I_IS_PO,
                                readOnly: true,
                            },
                            {
                                xtype: "hidden",
                                id: "sp_emp_idID",
                                name: "sp_emp_id",
                            },
                            {
                                fieldLabel: "เรื่อง ",
                                xtype: "textarea",
                                width: 300,
                                height: 50,
                                id: "c_name_inID",
                                name: "c_name_in",
                                cls: "my-label-style",
                            },
                            {
                                fieldLabel: "วันที่บันทึก ",
                                id: "d_doc_dateID",
                                name: "d_doc_date",
                                readOnly: true,
                                xtype: "datefield",
                                width: 160,
                                validator: function (val) {
                                    if (Ext.isEmpty(val)) {
                                        return "วันที่บันทึก";
                                    } else {
                                        return true;
                                    }
                                },
                            },
                            {
                                xtype: "compositefield",
                                id: "i_cont_dis_idID",
                                fieldLabel: "เลือกสัญญา",
                                msgTarget: "side",
                                width: 700,
                                anchor: "-20",
                                defaults: {
                                    flex: 1,
                                },
                                items: [PopContForm.mini],
                            },
                            {
                                xtype: "textfield",
                                fieldLabel: "หมวดค่าใช้จ่าย",
                                readOnly: true,
                                store: Ext.store3,
                                width: 500,
                                id: "po_expense_idID",
                                name: "po_expense_name",
                            },
                            {
                                fieldLabel: "วันที่เริ่ม ",
                                id: "d_start_dateID",
                                name: "d_start_date",
                                xtype: "datefield",
                                readOnly: true,
                                width: 160,
                                validator: function (val) {
                                    if (Ext.isEmpty(val)) {
                                        return "วันที่ส่งมอบ";
                                    } else {
                                        return true;
                                    }
                                },
                            },
                            {
                                fieldLabel: "วันที่วันที่สิ้นสุด ",
                                id: "d_end_dateID",
                                name: "d_end_date",
                                xtype: "datefield",
                                readOnly: true,
                                width: 160,
                                validator: function (val) {
                                    if (Ext.isEmpty(val)) {
                                        return "วันที่ส่งมอบ";
                                    } else {
                                        return true;
                                    }
                                },
                            },
                            {
                                fieldLabel: "วงเงินในสัญญา",
                                xtype: "textfield",
                                id: "f_total_amtID",
                                width: 150,
                                name: "f_total_amt",
                                readOnly: true,
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
                        ],
                        buttonAlign: 'left',
                        buttons: [
                            {
                                text: "ทำรายการ...",
                                id: "buSaveSubID",
                                iconCls: "icon-save",
                                handler: function () {
                                    let msg = "";
                                    if (Ext.getCmp("c_name_inID").getValue() == "") {
                                        msg += " -กรุณากรอกเรื่อง <br>";
                                    }
                                    if (Ext.getCmp("d_doc_dateID").getValue() == "") {
                                        msg += " -กรุณาเลือกวันที่บันทึก <br>";
                                    }
                                    if (Ext.getCmp("sp_contractID").getValue() == "") {
                                        msg += " -กรุณาเลือกสัญญา <br>";
                                    }

                                    if (msg == "") {
                                        Ext.getCmp("buSaveSubID").setDisabled(true);
                                        var formSubmit = function () {
                                            form.submit({
                                                waitMsg: "Saving Data...",
                                                success: function (form, action) {

                                                    Ext.storeDtl.reload({
                                                        callback: function (row, operation, success) {
                                                            if (success) {
                                                                Ext.each(row || {}, function (rec) {
                                                                    if (rec.get('sp_mn_contract_hdr_id') == action.result.id) {

                                                                        Ext.selectRow = rec;

                                                                        console.log(rec.get('sp_mn_contract_hdr_id') + ' ===== ' + action.result.id);


//                                                                        Ext.getCmp("Busp_contractID").hide();
//                                                                        Ext.SP_MN_CONTRACT_HDR_ID = Ext.selectRow.data.sp_mn_contract_hdr_id;
//                                                                        Ext.SP_TOR_HDR_PERIOD_ID = Ext.selectRow.data.sp_tor_hdr_period_id;
//                                                                        Ext.SP_CONTRACT_PO_ID = Ext.selectRow.data.sp_contract_po_id;
//                                                                        Ext.I_IS_PO = Ext.selectRow.data.i_is_po; 
//                                                                        Ext.sp_tor_id  = Ext.selectRow.data.sp_tor_id;
//                                                                        Extstore3();
//                                                                        Ext.store3.setBaseParam("sp_contract_po_id", Ext.SP_CONTRACT_PO_ID);
//                                                                        Ext.store3.setBaseParam("i_is_po", Ext.I_IS_PO); 
//                                                                        Ext.store3.reload();
//                                                                        Ext.getCmp("winChequeID").items.items[0].getForm().loadRecord(Ext.selectRow);
//                                                                        Ext.getCmp("winChequeID").unhideTabStripItem(1); 
//                                                                        Ext.getCmp("winChequeID").setActiveTab(1);

                                                                        Ext.getCmp("winMain").destroy();
                                                                        // Ext.getCmp("winChequeID").destroy();

                                                                    }

                                                                });
                                                            }
                                                        }
                                                    });

//                     


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
                                        var form = Ext.getCmp(Ext.poFormID).getForm();
                                        if (form.isValid()) {
                                            // if (Ext.getCmp("modesubID").getValue().inputValue === "VIEW") {
                                            // } else if (Ext.getCmp("modesubID").getValue().inputValue === "DELETE") {
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
                                            // } else {
                                            formSubmit(form);
                                            // }
                                        } //isValid
                                    } else {
                                        Ext.Msg.alert("แจ้งเตือน", msg);
                                    }
                                },

                                //haddler
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
                        title: "เลือกงวดงาน ",
                        frame: true,
                        autoScroll: true,
                        id: "tabpanelMain2ID",
                        iconCls: "icon-contract",
                        region: "center",
                        layout: "fit",
                        border: false,
                        items: [
                            {
                                xtype: "editorgrid",
                                id: "gridSub3ID",
                                region: "center",
                                layout: "fit",
                                border: false,
                                stripeRows: true,
                                loadMask: true,
                                clicksToEdit: 1,
                                store: Ext.store3,
                                height: 1000,
                                columns: [
                                    // {width: 35, header: " ที่ ", align: "center", dataIndex: "no"},
                                    {header: "งวดที่", align: "center", width: 35, dataIndex: "i_period"},
                                    {
                                        header: "รายการของที่รับมอบ",
                                        align: "center",
                                        dataIndex: "i_qty",
                                        id: "i_qtyID",
                                        width: 68,
                                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                            return "<p> งวดงานที่ " + record.get("i_period");// + '<img src="../images/icons/application_side_list.png"); style="cursor:pointer"/></p>';
                                        },
                                    },
                                    {header: "ID System", hidden: true, dataIndex: "id"},
                                    {header: "sp_mn_contract_dtl_id", hidden: true, dataIndex: "sp_mn_contract_dtl_id"},
                                    {
                                        header: "-",
                                        align: "center",
                                        dataIndex: "i_qty",
                                        id: "i_qtyAllID",
                                        width: 130, // style="font-size:10px;"
                                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                            return '<button ' + Ext.styleBu1 + ' cursor:pointer"/>ของนำมาส่ง/วางบิล</button>';
                                        }
                                    }, {
                                        header: "-",
                                        align: "center",
                                        dataIndex: "i_qty",
                                        id: "i_qty_usedAllID",
                                        width: 140,
                                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                            //function ( store , value , itemName )
                                            // Ext.rec5 = Ext.getStoreItems(Ext.store5, rowIndex, 'f_total_amt');

                                            return '<button ' + Ext.styleBu2 + ' cursor:pointer"/>ของนำมาส่งแล้ว/วางบิล</button>';
                                        }
                                    }, {header: "จับคู่กับค่าใช้จ่าย", hidden: true, align: "left", width: 60, dataIndex: "id", id: "mappingMonthID",
                                        renderer: function (value, metaData, record, row, col, store, gridView) {

                                            metaData.attr = "style='cursor:pointer; text-align:center;';";
                                            return '<button ' + Ext.styleBu3 + '>จับคู่กับค่าใช้จ่าย</button>';

                                        }
                                    },

                                    {
                                        header: "วงเงินส่งมอบงาน",
                                        width: 35,
                                        // sortable: false,
                                        align: "right",
                                        dataIndex: "f_net_total_price",
                                    },
                                    {header: "สถานะ", align: "center", width: 20, dataIndex: "i_status_checking_name"},
//                                    {header: "จำนวนเงิน", dataIndex: "f_total_amt", align: "right"},
                                    {width: 20, dataIndex: ""}
                                ],
                                viewConfig: {
                                    forceFit: true,
                                    emptyText: "ไม่มีข้อมูล..",
                                    deferEmptyText: false,
                                    getRowClass: function (record) {
                                        if (record.data.sp_mn_contract_dtl_id == null) {
                                        } else if (record.data.i_status_checking == 1) {
                                            return "td-succeed ";
                                        } else if (record.data.i_status_checking == null) {
                                            return "td-wait ";
                                        } else if (record.data.i_status_checking == 2) {
                                            return "td-unsucceed ";
                                        }
                                    },
                                },
                                listeners: {
                                    beforeedit: function (editor) {
                                        let row = editor.record.data;
                                        if (row.sp_mn_contract_dtl_id == null) {
                                        } else if (row.i_status_checking == 1) {
                                            return false;
                                        } else if (row.i_status_checking == null) {
                                            return false;
                                        } else if (row.i_status_checking == 2) {
                                        }
                                    },
                                    beforerender: function () {

                                        Ext.store5 = new Ext.data.JsonStore({
                                            storeId: "myStore5",
                                            autoLoad: false,
                                            autoDestroy: false,
                                            url: "tor/api/mnPeriodController.php",
                                            root: "data",
                                            baseParams: {
                                                mode: "LISTTORDTL",
                                            }, //Permission i_read
                                            idProperty: "no",
                                            totalProperty: "totalCount",
                                            fields: [
                                                {name: "no"},
                                                {name: "id"},
                                                {name: "sp_tor_dtl_period_id"},
                                                {name: "sp_tor_hdr_period_id"},
                                                {name: "sp_tor_dtl_id"},
                                                {name: "c_name"},
                                                {name: "i_yyyy"},
                                                {name: "i_overlap"},
                                                {name: "d_arrive_date"},
                                                {name: "c_receive"},
                                                {name: "i_qty_all"},
                                                {name: "i_qty_used"},
                                                {name: "dc_bg_budget_type_id"},
                                                {name: "dc_unit_type_id"},
                                                {name: "po_expense_id"},
                                                {name: "po_expense_idTxt"},
                                                {name: "i_hire_type"},
                                                {name: "i_is_inv"},
                                                {name: "i_product_type"},
                                                {name: "c_unit"},
                                                {name: "dc_creditor_id"},
                                                {name: "dc_tax_customer_id"},
                                                {name: "inv_name"},
                                                {name: "f_unit_price"}, // f_net_unit_price f_net_total_price
                                                {name: "f_total_price"}, // f_net_unit_price f_net_total_price
                                            ],
                                        });
                                    },
                                    afterrender: function () {
                                        Ext.getCmp('gridSub3ID').getEl().mask("Please wait...", "x-mask-loading");
                                        this.store.load({
                                            callback: function (record, operation, success) {
                                                if (success) {
                                                    Ext.getCmp('gridSub3ID').getEl().unmask();
                                                }
                                            }
                                        });
                                        this.on(
                                                "cellclick",
                                                function (grid, rowIndex, columnIndex, e) {
                                                    var record = grid.getStore().getAt(rowIndex);
                                                    var win = null;
                                                    Ext.period = record;
//console.log(Ext.period_dtl);
                                                    if (columnIndex === grid.getColumnModel().getIndexById("i_qty_usedAllID")) {
                                                        //WINX     

                                                        var storePeriodHdrx = new Ext.data.JsonStore({
                                                            storeId: "myStore2",
                                                            autoDestroy: false,
                                                            autoLoad: true,
                                                            url: "tor/api/mnCheckingController.php",
                                                            root: "data", //LIST_PERIOD_SUB_HDR
                                                            baseParams: {
                                                                mode: "LIST_PERIOD_SUB_ARRIVAL_HDR", i_is_po: record.get('i_is_po'), sp_tor_hdr_period_id: record.get('sp_tor_hdr_period_id')
                                                            }, //Permission i_read 
                                                            idProperty: "id",
                                                            totalProperty: "totalCount",
                                                            fields: [
                                                                {name: "no"},
                                                                {name: "id"},
                                                                {name: "sp_check_period_hdr_id"},
                                                                {name: "f_vat_amt"},
                                                                {name: "f_total_add_vat_amt"},
                                                                {name: "f_rate_vat"}, //a.f_vat_amt ,a.f_total_add_vat_amt ,a.f_rate_vat
                                                                {name: "i_yyyy"},
                                                                {name: "creditor_pdf"},
                                                                {name: "i_overlap"},
                                                                {name: "dc_bg_budget_type_id"},
                                                                {name: "i_period", },
                                                                {name: "po_expense_id"},
                                                                {name: "dc_cost_id"},
                                                                {name: "i_pr_type"},
                                                                {name: "i_booking_bg"},
                                                                {name: "i_overlap"},
                                                                {name: "i_last"},
                                                                {name: "i_is_waiting"},
                                                                {name: "i_warranty_age"},
                                                                {name: "i_before"},
                                                                {name: "d_warranty_date"},
                                                                {name: "d_checking_date"},
                                                                {name: "dc_bg_budget_type_idTxt"},
                                                                {name: "sp_type_bg"},
                                                                {name: "sp_contract_id"},
                                                                {name: "dc_creditor_name"},
                                                                {name: "sp_tor_hdr_period_id"},
                                                                {name: "sp_tor_contract_id"},
                                                                {name: "sp_po_id", type: "int"},
                                                                {name: "bg_reserve_money_id", },
                                                                {name: "f_total_amt", type: "string"},
                                                                {name: "f_net_unit_price", type: "string"},
                                                                {name: "f_net_total_price", type: "string"},
                                                                {name: "d_period_date"}, //d_period_date
                                                                {name: "d_arrive_date"}, //c_arrive_code d_arrive_date
                                                                {name: "d_doc_arrive_dt"}, // 
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
                                                                {name: "sp_tranf_hdr_id"}
                                                            ],
                                                        });


                                                        var winx = new Ext.Window({
                                                            collapsible: true,
                                                            maximizable: true,
                                                            hidden:true,
                                                            title: "ทำรายการส่งมอบงาน",
                                                            width: Ext.getCmp("contenterCenter").getWidth() - 5,
                                                            height: Ext.getCmp("contenterCenter").getHeight() - 5,
                                                            layout: "form",
                                                            id: "winPeriodHdrID",
                                                            modal: true,
                                                            plain: true,
                                                            buttonAlign: "left",
                                                            items: [{
                                                                    xtype: "checkboxgroup",
                                                                    fieldLabel: "อัพโหลด",
                                                                    name: "i_is_upload",
                                                                    hidden:true,
                                                                    id: "i_is_uploadID",
                                                                    items: [
                                                                        {
                                                                            id: "i_is_taxID",
                                                                            boxLabel: "เอกสารผู้ขายผู้รับจ้างใหม่/ภาษี",
                                                                            name: "i_is_tax",
                                                                            hidden: true,
                                                                            inputValue: 1,
                                                                            listeners: {
                                                                                check: function () {
                                                                                    this.fnGroup(this.getValue());
                                                                                },
                                                                                afterrender: function () {
                                                                                    this.fnGroup = function (a) {

                                                                                        // if (a === true) {
                                                                                        //     Ext.getCmp('frmSubItemID').show();
                                                                                        // } else {
                                                                                        //     Ext.getCmp('frmSubItemID').hide();
                                                                                        // }
                                                                                    };
                                                                                }
                                                                            }
                                                                        }
                                                                    ]
                                                                }, {
                                                                    xtype: 'label',
                                                                    hidden:true,
                                                                    html: '<b style="color:red"> * </b>Upload File PDF'
                                                                },{
                                                                    xtype: "grid",
                                                                    id: "gridSub22ID",
                                                                    border: false,
                                                                    title: "รายละเอียดของที่ส่งตรวจรับ",
                                                                    height: 500,
                                                                    store: storePeriodHdrx,
                                                                    columns: [
                                                                        new Ext.grid.RowNumberer({width: 35, header: " ที่ ", dataIndex: "no"}),
                                                                        {header: "ID System", hidden: true, dataIndex: "id"},
                                                                        {header: "จับคู่กับค่าใช้จ่าย", hidden: true, align: "left", width: 110, dataIndex: "i_period", id: "mappingMonthID",
                                                                            renderer: function (value, metaData, record, row, col, store, gridView) {

                                                                                metaData.attr = "style='cursor:pointer; text-align:center;';";
                                                                                return '<button ' + Ext.styleBu + '>จับคู่กับค่าใช้จ่าย</button>';

                                                                            }
                                                                        },
                                                                        {header: "ออกเลขรับของ", align: "left", width: 110, dataIndex: "c_arrive_code", id: "genCodeArrivalID",
                                                                            renderer: function (value, metaData, record, row, col, store, gridView) {
                                                                                if (record.data.i_status_checking != 2 && (record.get('c_arrive_code') === "" || record.get('c_arrive_code') === null))
                                                                                {
                                                                                    metaData.attr = "style='cursor:pointer; text-align:center;';";
                                                                                    return '<button ' + Ext.styleBu2 + '>เลขรับของ</button>';
                                                                                } else
                                                                                {
                                                                                    metaData.attr = "style='cursor:''; text-align:center;';";
                                                                                    record.set('c_arrive_code', value);
                                                                                    // Ext.getCmp('arr_c_codeID').setValue('CRT-' + value);
//                                                                                    Ext.getCmp('i_is_taxID').fnGroup();
                                                                                    return value;
                                                                                }
                                                                            }
                                                                        },
                                                                        /*{
                                                                            header: "เตรียมเงินเพื่อตรวจรับ", align: "left", width: 90, dataIndex: "c_arrive_code", id: "bookArrivalID",hidden: true,
                                                                            renderer: function (value, metaData, record, row, col, store, gridView) {
                                                                                if (record.get('i_period') == 1 && record.get('bg_reserve_money_id') == 0 && record.get('i_booking_bg') != 2) {
                                                                                    Ext.isBooking = 1;
                                                                                    metaData.attr = "style='cursor:pointer; text-align:center;';";
                                                                                    return '<button id="checkMoneyID" ' + Ext.styleBu + '>เตรียมเงิน</button>';
                                                                                    //                                                                                    return '<button id="checkMoneyID" style="font-size:10px;">เตรียมเงิน</button>';
                                                                                } else {
                                                                                    Ext.isBooking = 0;
                                                                                    return value;
                                                                                }
                                                                            }
                                                                        },*/
                                                                        {header: "ใบส่งของ / ใบส่งงาน", align: "left", width: 80, dataIndex: "c_doc_ref"},
                                                                        {header: "งวดที่", align: "center", width: 40, dataIndex: "i_period"},
                                                                        {header: "วันที่ส่งของ", align: "center", width: 80, dataIndex: "d_arrive_date"},
                                                                        {header: "วันที่เอกสารสมบูรณ์", align: "center", width: 80, dataIndex: "d_doc_arrive_dt"},
                                                                        {header: "อัตราภาษี", align: "right", width: 80, dataIndex: "f_rate_vat"}, //a.f_vat_amt ,a.f_total_add_vat_amt ,a.f_rate_vat
                                                                        {header: "เงินภาษี", align: "right", width: 100, dataIndex: "f_vat_amt"},
                                                                        {header: "เงินก่อนรวมภาษี", align: "right", width: 100, dataIndex: "f_total_add_vat_amt"},
                                                                        {header: "เงินรวมภาษี", align: "right", width: 100, dataIndex: "f_net_total_price"},
                                                                        {header: "เลขที่ตรวจรับ", dataIndex: "c_checking_code", align: "left"},
                                                                        {header: "วันที่ตรวจรับ", dataIndex: "d_checking_date", align: "center"},
                                                                        {header: "สถานะ", width: 30, dataIndex: "c_status", align: "center"},
                                                                        {header: "เหตุผล", dataIndex: "c_reason", align: "left"}
                                                                    ],
                                                                    listeners: {
                                                                        beforerender: function () {
                                                                            Ext.getCmp('i_is_taxID').fnGroup();
                                                                        },
                                                                        afterrender: function () {


                                                                            if (Ext.period.get('i_overlap') > 0) { //ซ่อนcolum ปุ่มเตรียมเงิน กรณีเงินกันเหลื่อม 
                                                                                this.getColumnModel().removeColumn(4, true);
                                                                            } else if (Ext.selectRow.get('i_purchase') == 1) {
                                                                                this.getColumnModel().setHidden(2, true);
                                                                            } else {
                                                                                this.getColumnModel().setHidden(2, false);
                                                                            }

                                                                            this.on("cellclick", function (grid, rowIndex, columnIndex, e) {
                                                                                var rs = grid.getStore().getAt(rowIndex);

                                                                                if (columnIndex === grid.getColumnModel().getIndexById("bookArrivalID") && rs.get('bg_reserve_money_id') == 0) { //&& record.get('i_period')== 1 && record.get('bg_reserve_money_id')==0
                                                                                    if(rs.get('sp_type_bg') == 1 ){
                                                                                        Ext.getMoney(rs);
                                                                                    }else {
                                                                                        Ext.Msg.alert("แจ้งเตือน", "รายการนี้ไม่สามารถเช็คเงินงบประมาณได้");
                                                                                    }
                                                                                } else if (columnIndex === grid.getColumnModel().getIndexById("genCodeArrivalID")) {


                                                                                    if (rs.get('c_arrive_code') == '' || rs.get('c_arrive_code') == null) {
                                                                                        Ext.getCmp("gridSub22ID").getEl().mask("Please wait...", "x-mask-loading");
                                                                                        Ext.Ajax.request({
                                                                                            url: "tor/api/mnArrivalCode.php",
                                                                                            method: "POST",
                                                                                            params: {
                                                                                                mode: "GENCODEARRIVAL",
                                                                                                sp_check_period_hdr_id: rs.data.id
                                                                                            },
                                                                                            success: function (result, request) {

                                                                                                if (request.success) {
                                                                                                    Ext.Msg.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย");

                                                                                                }
                                                                                                Ext.getCmp("gridSub22ID").getStore().reload();
                                                                                                Ext.getCmp("gridSub22ID").getEl().unmask();
                                                                                            },
                                                                                            failure: function (result, request) {
                                                                                                Ext.MessageBox.alert("Failed", result.responseText);
                                                                                            }
                                                                                        });
                                                                                        Ext.getCmp("gridSub22ID").getStore().reload();
                                                                                        Ext.getCmp("gridSub22ID").getEl().unmask();
                                                                                    }
                                                                                } else if (columnIndex === grid.getColumnModel().getIndexById("mappingMonthID")) {
                                                                                    Ext.AppMonthly(Ext.selectRow, rs);
                                                                                }
                                                                            }, this);
                                                                        }
                                                                    },
                                                                    viewConfig: {
                                                                        forceFit: true,
                                                                        getRowClass: function (record, rowIndex, rowPrms, ds) {
                                                                            if (record.data.i_status_checking == 2) {
                                                                                return 'disabled-row';
                                                                            }
                                                                        }
                                                                    }
                                                                }],
                                                            buttons: [{
                                                                    text: Ext.GLOBAL_BU_BACK_TH,
                                                                    handler: function () {
                                                                        Ext.getCmp("winPeriodHdrID").destroy();
                                                                    }
                                                                }]

                                                        }).show();

                                                    } else if (columnIndex === grid.getColumnModel().getIndexById("i_qtyAllID") || columnIndex === grid.getColumnModel().getIndexById("i_qtyID")) {
                                                        if (Ext.isEmpty(win)) {
                                                            Ext.SP_TOR_HDR_PERIOD_ID = record.get('sp_tor_hdr_period_id');
                                                            Ext.i_overlap = record.get('i_overlap');
                                                            
                                                            Ext.win = function (rec) {
                                                                return new Ext.Window({
                                                                collapsible: true,
                                                                maximizable: true,
                                                                title: "รายการที่จะส่งตรวจรับ",
                                                                id: "winSearchFrmReceive",
                                                                layout: "form",
                                                                modal: true,
                                                                plain: true,
                                                                frame: true,
                                                                autoScroll: true,
                                                                labelWidth: 160,
                                                                width: Ext.getCmp("contenterCenter").getWidth() - 5,
                                                                height: Ext.getCmp("contenterCenter").getHeight() - 5,
                                                                items: [
                                                                    {
                                                                        xtype: "hidden", //hidden
                                                                        name: "i_is_po",
                                                                        value: Ext.isEmpty(Ext.I_IS_PO) ? null : Ext.I_IS_PO
                                                                    },
                                                                    {
                                                                        xtype: "hidden",
                                                                        name: "sp_tor_contract_id",
                                                                        value: Ext.SP_CONTRACT_PO_ID || null
                                                                    },
                                                                    {
                                                                        xtype: "hidden",
                                                                        name: "sp_mn_contract_hdr_id",
                                                                        value: Ext.SP_MN_CONTRACT_HDR_ID || null
                                                                    },
                                                                    {
                                                                        xtype: "hidden",
                                                                        name: "sp_tor_hdr_period_id", // sp_tor_hdr_period_id: Ext.SP_TOR_HDR_PERIOD_ID,
                                                                        value: Ext.SP_TOR_HDR_PERIOD_ID
                                                                    },
                                                                    {
                                                                        xtype: "hidden",
                                                                        id: "dc_creditor_per_idID",
                                                                        name: "dc_creditor_per_id", // sp_tor_hdr_period_id: Ext.SP_TOR_HDR_PERIOD_ID,
                                                                        value: Ext.period.data.dc_creditor_per_id
                                                                    },
                                                                    {
                                                                        xtype: "textfield",
                                                                        id: "c_doc_refID",
                                                                        name: "c_doc_ref",
                                                                        width: 160,
                                                                        fieldLabel: "ใบส่งของ / ใบส่งงาน",
                                                                        change: function (value, metaData, record, row, col, store, gridView) {
                                                                                metaData.attr = "style='cursor:''; text-align:center;';";
                                                                                record.set('c_arrive_code', value);
                                                                                return value;
                                                                            // }
                                                                        }
                                                                    },
                                                                    {
                                                                        fieldLabel: "วันที่ส่งของ",
                                                                        id: "d_doc_dateSubID",
                                                                        name: "d_doc_dateSub",
                                                                        xtype: "datefield",
                                                                        width: 160,
                                                                        validator: function (val) {
                                                                            if (Ext.isEmpty(val)) {
                                                                                return "วันที่บันทึก";
                                                                            } else {
                                                                                return true;
                                                                            }
                                                                        }
                                                                    },
                                                                    {
                                                                        xtype: "textarea",
                                                                        id: "c_commentID",
                                                                        name: "c_comment",
                                                                        width: 160,
                                                                        fieldLabel: "รายละเอียด/รับของ"
                                                                    }, {
                                                                        fieldLabel: "วันที่ส่งมอบงานสมบูรณ์",
                                                                        id: "d_doc_arrive_dtID",
                                                                        name: "d_doc_arrive_dt",
                                                                        xtype: "datefield",
                                                                        width: 160,
                                                                        validator: function (val) {
                                                                            if (Ext.isEmpty(val)) {
                                                                                return "วันที่บันทึก";
                                                                            } else {
                                                                                return true;
                                                                            }
                                                                        }
                                                                    },
                                                                    {
                                                                        id: "gridEditor",
                                                                        xtype: 'grid',
                                                                        region: "center",
                                                                        layout: "fit",
//                                                                        stripeRows: true,
                                                                        loadMask: true,
//                                                                        clicksToEdit: 1,
                                                                        height: 150,
                                                                        border: false,
                                                                        store: Ext.store5,
                                                                        listeners: {
                                                                            beforerender: function () {

                                                                                Ext.fnGrid = function (id, qty_used, val, i_qty_all) {

                                                                                    var all = parseInt(qty_used) + parseInt(val.value);
                                                                                    console.log(qty_used + '  ' + val.value)
                                                                                    if (i_qty_all < all) {
                                                                                        Ext.Msg.alert("ไม่ควรเกินจำนวนในงวดงาน", "<span style='white-space: nowrap;'>จำนวน " + all + " มากกว่าจำนวนในงวดงาน " + i_qty_all + "</span>", function () {
                                                                                            val.select();
                                                                                        });
                                                                                    }
                                                                                };
                                                                            },
                                                                            afterrender: function () {
                                                                                this.on("cellclick", function (grid, rowIndex, columnIndex, e) {
                                                                                    var rec5 = grid.store.getAt(rowIndex);

                                                                                    if (columnIndex === grid.getColumnModel().getIndexById("editQtyID")) {
                                                                                        //console.log(rec5);
//                                                                                        alert(''+record.get('id'));
                                                                                        Ext.fnWidEditIqty(rec5).show();


                                                                                    } else if (columnIndex === grid.getColumnModel().getIndexById("editVatID")) {
//                                                                                
                                                                                        Ext.edit_bidder_dtl = function (rec, row) {
                                                                                            var rowID = row;
                                                                                            console.log(rec);
                                                                                            return new Ext.Window({
                                                                                                id: "win-pop-lov" + rec.get("id"),
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
                                                                                                            this.doLayout();
                                                                                                        };
                                                                                                        this.fn(0.4, 0.35);

                                                                                                        //rec.set("f_total_amt",document.getElementById("blurItem[0]").value);
                                                                                                        //Ext.getCmp('frm-calID').getForm().loadRecord(rec);
                                                                                                    },
                                                                                                    maximize: function (window, opts) {
                                                                                                        //when property minimizable
                                                                                                        window.setWidth(Ext.getBody().getViewSize().width * 0.99);
                                                                                                        window.expand("", false);
                                                                                                        window.center();
                                                                                                    },
                                                                                                },
                                                                                                items: new Ext.FormPanel({
                                                                                                    labelAlign: "left",
                                                                                                    bodyStyle: "padding:1px",
                                                                                                    id: "frm-calID",
                                                                                                    labelWidth: 150,
                                                                                                    items: [
                                                                                                        {
                                                                                                            xtype: "displayfield",
                                                                                                            fieldLabel: "ราคารวม VAT",
                                                                                                            name: "f_total_amt",
                                                                                                            id: "f_total_amt2ID",
                                                                                                            value: "<b style='font-size:16px;'>  0.00</b>",
                                                                                                        },
                                                                                                        {
                                                                                                            xtype: "textfield",
                                                                                                            fieldLabel: "อัตราภาษี",
                                                                                                            name: "f_rate_vat",
                                                                                                            id: "f_rate_vat2ID",
                                                                                                            value: "7.00",
                                                                                                            listeners: {
                                                                                                                blur: function () {
                                                                                                                    Ext.getCmp("frm-calID").calItems();
                                                                                                                },
                                                                                                                afterrender: function () {
                                                                                                                    Ext.getCmp("frm-calID").calItems();
                                                                                                                }
                                                                                                            },
                                                                                                        }, {
                                                                                                            xtype: "buttongroup",
                                                                                                            fieldLabel: "จำนวนมูลค่าเพิ่มภาษี",
                                                                                                            frame: false,
                                                                                                            border: false,
                                                                                                            items: [{
                                                                                                                    xtype: "textfield",
                                                                                                                    fieldLabel: "จำนวนมูลค่าเพิ่มภาษี",
                                                                                                                    name: "f_vat_amt",
                                                                                                                    readOnly: false,
                                                                                                                    id: "f_vat_amt2ID",
                                                                                                                    value: "0.00",
                                                                                                                    listeners: {
                                                                                                                        blur: function () {
//                                                                                                                            Ext.getCmp("frm-calID").calItems();
                                                                                                                        },
                                                                                                                        afterrender: function () {
                                                                                                                            Ext.getCmp("frm-calID").calItems();
                                                                                                                        },
                                                                                                                        change: function () {
                                                                                                                            Ext.getCmp("frm-calID").diffItems(this.getValue());
                                                                                                                        }
                                                                                                                    }
                                                                                                                },
                                                                                                                {
                                                                                                                    xtype: "tbspacer",
                                                                                                                    width: 18,
                                                                                                                },
                                                                                                                {
                                                                                                                    xtype: "displayfield",
                                                                                                                    style: {
                                                                                                                        color: "red",
                                                                                                                        width: "1520px",
                                                                                                                    },
                                                                                                                    value: "* แก้ไขได้"
                                                                                                                },
                                                                                                            ], listeners: {
                                                                                                                afterrender: function () {
                                                                                                                    this.doLayout();
                                                                                                                }
                                                                                                            }
                                                                                                        },
                                                                                                        {
                                                                                                            xtype: "textfield",
                                                                                                            fieldLabel: "จำนวนเงินเงินภาษี/ก่อนแก้",
                                                                                                            readOnly: true,
                                                                                                            name: "f_vat_edit_amt",
                                                                                                            id: "f_vat_edit_amt2ID",
                                                                                                            value: "0.00",
                                                                                                            listeners: {
                                                                                                                afterrender: function () {
                                                                                                                    Ext.getCmp("frm-calID").calItems();
                                                                                                                },
                                                                                                            },
                                                                                                        },
                                                                                                        {
                                                                                                            xtype: "displayfield",
                                                                                                            fieldLabel: "เงินก่อนรวมภาษี",
                                                                                                            name: "f_total_add_vat_amt",
                                                                                                            id: "f_total_add_vat_amt2ID",
                                                                                                            value: "<b style='font-size:16px;'> 0.00</b>",
                                                                                                        },
                                                                                                    ],
                                                                                                    listeners: {
                                                                                                        afterrender: function () {
                                                                                                            this.setCalItems = function () {
                                                                                                                Ext.getCmp('f_vat_amt3ID').setValue(Ext.getCmp('f_vat_amt2ID').getValue());
                                                                                                                Ext.getCmp('f_total_add_vat_amt3ID').setValue(Ext.getCmp('f_total_add_vat_amt2ID').getValue());
                                                                                                                Ext.getCmp('f_rate_vat3ID').setValue(Ext.getCmp('f_rate_vat2ID').getValue());
//                                                      f_vat_amt3ID f_total_add_vat_amt3ID f_rate_vat3ID
                                                                                                            };
                                                                                                            this.calItems = function () {

                                                                                                                var f_total_price = Ext.getCmp('f_total_amt2ID').getValue().replace(/\,/g, '');
                                                                                                                Ext.getCmp("f_total_amt2ID").setValue(Ext.floatRenderer(f_total_price));

                                                                                                                var f_amt = parseFloat(Ext.getCmp("f_total_amt2ID").getValue().replace(/,/g, "") / 1);
                                                                                                                var f_rate = parseFloat(Ext.getCmp("f_rate_vat2ID").getValue().replace(/,/g, "") / 1);
                                                                                                                var vat = f_amt - (f_amt * 100 / (f_rate + 100));
                                                                                                                vat = vat.toFixed(2);

                                                                                                                Ext.getCmp("f_vat_amt2ID").setValue(Ext.floatRenderer(vat));
                                                                                                                Ext.getCmp("f_vat_edit_amt2ID").setValue(Ext.floatRenderer(vat));
                                                                                                                var total = Number.parseFloat((f_amt - vat)).toFixed(2);
                                                                                                                Ext.getCmp("f_total_add_vat_amt2ID").setValue(Ext.floatRenderer(total));

                                                                                                            };

                                                                                                            this.diffItems = function (f) {

                                                                                                                var f_vat = (f.replace(/\,/g, '') / 1);  //vat
                                                                                                                var f_add_vat_amt = parseFloat(Ext.getCmp("f_total_amt2ID").getValue().replace(/,/g, "") / 1);// add vat 
                                                                                                                var total = Number.parseFloat((f_add_vat_amt - f_vat)).toFixed(2);
                                                                                                                Ext.getCmp("f_total_add_vat_amt2ID").setValue(Ext.floatRenderer(total));

                                                                                                            };



                                                                                                            Ext.getCmp('f_total_amt2ID').setValue(document.getElementById("blurItem[0]").value);

                                                                                                        }
                                                                                                    },
                                                                                                    buttonAlign: "left",
                                                                                                    buttons: [
                                                                                                        {
                                                                                                            text: "&nbsp;" + Ext.GLOBAL_BU_SAVE_TH + "ภาษี&nbsp;",
                                                                                                            id: "saveDtl3",
                                                                                                            iconCls: "icon-save",
                                                                                                            handler: function () {
                                                                                                                Ext.getCmp("frm-calID").setCalItems();
                                                                                                                Ext.getCmp("win-pop-lov" + rec.get("id")).destroy();
                                                                                                                // saveDtl("SAVE_DTL");
                                                                                                            },
                                                                                                        },
                                                                                                        {
                                                                                                            id: "buBackSub2ID",
                                                                                                            xtype: "button",
                                                                                                            iconCls: "icon-back",
                                                                                                            text: "ย้อนกลับ",
                                                                                                            handler: function () {
                                                                                                                Ext.getCmp("win-pop-lov" + rec.get("id")).destroy();
                                                                                                            },
                                                                                                        },
                                                                                                    ],
                                                                                                }),
                                                                                            });
                                                                                        }//End Function                                                                          
                                                                                        var winEdit = Ext.edit_bidder_dtl(rec5, rowIndex);
                                                                                        winEdit.show();

                                                                                    }
                                                                                }, this);
                                                                            }
                                                                        },
                                                                        columns: [
                                                                            new Ext.grid.RowNumberer({
                                                                                header: "ที่",
                                                                                width: 30,
                                                                                renderer: function (value, metaData, record, row, col, store, gridView) {
                                                                                    return record.get("no");
                                                                                },
                                                                            }),
                                                                            {
                                                                                header: "รายละเอียด ซื้อ/จ้าง",
                                                                                sortable: false,
                                                                                align: "left",
                                                                                dataIndex: "c_name",
                                                                                width: 300,
                                                                            },
                                                                            {
                                                                                header: "หมวดค่าใช้จ่าย",
                                                                                sortable: false,
                                                                                align: "left",
                                                                                dataIndex: "po_expense_idTxt",
                                                                                width: 200,
                                                                            },
                                                                            {

                                                                                header: "จำนวน(ส่งรับแล้ว)",
                                                                                sortable: false,
                                                                                align: "center",
                                                                                dataIndex: "i_qty_used",
                                                                                width: 100
                                                                            },
                                                                            {
                                                                                header: "จำนวน(ส่งตรวจ)",
                                                                                sortable: false,
                                                                                align: "right",
                                                                                dataIndex: "i_qty",
                                                                                id: "i_qtyID",
                                                                                width: 100,
                                                                                renderer: function (value, metaData, record, row, col, store, gridView) {
                                                                                    return (
                                                                                            '<input type="number" name="iqty[' +
                                                                                            record.get("id") +
                                                                                            ']" id="iqtyID[' +
                                                                                            row +
                                                                                            ']" autocomplete="off" style=" width:60px; text-align:right;font-weight:bold; " onBlur="Ext.fnGrid(' +
                                                                                            record.get("no") +
                                                                                            " , " +
                                                                                            record.get("i_qty_used") +
                                                                                            ",this," +
                                                                                            record.get("i_qty_all") +
                                                                                            ')">'
                                                                                            );
                                                                                },
                                                                            },
                                                                            {
                                                                                header: "ราคาต่อหน่วย",
                                                                                sortable: false,
                                                                                align: "right",
                                                                                dataIndex: "f_unit_price",
                                                                                // id: "f_unit_priceID",
                                                                                width: 150,
                                                                                renderer: function (value, metaData, record, row, col, store, gridView) {

                                                                                    return (
                                                                                            '<input type="text" name="f_unit_price['
                                                                                            + record.get("id")
                                                                                            + ']" id="blurItem['
                                                                                            + row
                                                                                            + ']" onClick="this.select()" onblur="blurItems(' + row + ');" autocomplete="off"'
                                                                                            + ' style="width:135px; text-align:right;font-weight:bold;" value="'
                                                                                            + value//record.get("f_unit_price")
                                                                                            + '">'
                                                                                            );
                                                                                },
                                                                            },
                                                                            {
                                                                                header: "จำนวน(ทั้งหมด)",
                                                                                sortable: false,
                                                                                align: "right",
                                                                                dataIndex: "i_qty_all",
                                                                                width: 100,
                                                                            },
                                                                            {
                                                                                header: "ถอด Vat",
                                                                                sortable: false,
                                                                                align: "center",
                                                                                hidden: false,
                                                                                dataIndex: "i_qty_all",
                                                                                id: 'editVatID',
                                                                                width: 70,
                                                                                renderer: function (value, metaData, record, row, col, store, gridView) {
                                                                                    return '<button ' + Ext.styleBu + '>ภาษี</button>';
                                                                                }
                                                                            },
                                                                            {
                                                                                header: "แก้ไขจำนวน/วางบิลรับ",
                                                                                sortable: false,
                                                                                align: "right",
                                                                                hidden: true,
                                                                                dataIndex: "i_qty_all",
                                                                                id: 'editQtyID',
                                                                                width: 150,
                                                                                renderer: function (value, metaData, record, row, col, store, gridView) {
                                                                                    return '<button ' + Ext.styleBu + '>แก้ไขจำนวนรับ</button>';
                                                                                }

                                                                            }

                                                                        ],
                                                                    }, {
                                                                        xtype: 'fieldset',
                                                                        title: 'รายละเอียดการถอด VAT',
                                                                        collapsible: true,
                                                                        autoHeight: true,
                                                                        defaults: {width: 210},
                                                                        defaultType: 'textfield',
                                                                        items: [{
                                                                                xtype: "textfield",
                                                                                id: "f_vat_amt3ID",
                                                                                name: "f_vat_amt",
                                                                                readOnly: true,
                                                                                width: 160,
                                                                                fieldLabel: "เงินภาษี",
                                                                                style: {
                                                                                    labelAlign: "right",
                                                                                    "font-weight": "bold",
                                                                                    padding: "1px",
                                                                                    margin: "1px",
                                                                                    color: "blue",
                                                                                    "background-color": "#fff",
                                                                                    "text-align": "right",
                                                                                } /*f_vat_amt ,f_total_add_vat_amt ,f_rate_vat from sp_check_period_hdr*/
                                                                            },
                                                                            {
                                                                                xtype: "textfield",
                                                                                id: "f_total_add_vat_amt3ID",
                                                                                name: "f_total_add_vat_amt",
                                                                                readOnly: true,
                                                                                width: 160, // f_vat_amt3ID f_total_add_vat_amt3ID f_rate_vat3ID
                                                                                fieldLabel: "เงินก่อนรวมภาษี",
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
                                                                                xtype: "textfield",
                                                                                id: "f_rate_vat3ID",
                                                                                name: "f_rate_vat",
                                                                                readOnly: true,
                                                                                width: 160,
                                                                                fieldLabel: "อัตราภาษี",
                                                                                style: {
                                                                                    labelAlign: "right",
                                                                                    "font-weight": "bold",
                                                                                    padding: "1px",
                                                                                    margin: "1px",
                                                                                    color: "blue",
                                                                                    "background-color": "#fff",
                                                                                    "text-align": "right",
                                                                                } 
                                                                            }
                                                                        ]
                                                                    },
                                                                    {
                                                                        xtype: 'fieldset',
                                                                        title: 'รายละเอียดผู้ขายผู้รับจ้าง',
                                                                        id : "fileuploadID",
                                                                        collapsible: true,
                                                                        autoHeight: true,
                                                                        // defaults: {width: 800},
                                                                        defaultType: 'textfield',
                                                                        items: [ PDFform(rec)  ]
                                                                    }
                                                                    
                                                                ],
                                                                buttonAlign: "left",
                                                                buttons: [
                                                                    {
                                                                        text: "&nbsp;" + Ext.GLOBAL_BU_SAVE_TH + "รายละเอียดฯ&nbsp;",
                                                                        id: "saveDtl",
                                                                        iconCls: "icon-save",
                                                                        handler: function () {
                                                                            var c_doc_ref = Ext.getCmp('c_doc_refID').getValue(); //
                                                                            var d_doc_date = Ext.getCmp('d_doc_dateSubID').getValue();
                                                                            var f_total_add_vat_amt = Ext.getCmp('f_total_add_vat_amt3ID').getValue();
                                                                            // console.log(Ext.util.Format.date(Ext.getCmp("d_doc_arrive_dtID").getValue(), "Y-m-d"));
                                                                            // return ; 
                                                                            if (c_doc_ref == '' || d_doc_date == '' || f_total_add_vat_amt == '') {
                                                                                if (f_total_add_vat_amt == '') {
                                                                                    Ext.Msg.alert("แจ้งเตือน", "กรุณาถอด VAT");
                                                                                } else {
                                                                                    Ext.Msg.alert("แจ้งเตือน", "กรุณากรอกข้อมูลการรับของให้ครับ");
                                                                                }
                                                                            }else if (Ext.util.Format.date(Ext.getCmp("d_doc_arrive_dtID").getValue(), "Y-m-d") == ''  ) { 
                                                                                Ext.Msg.alert("แจ้งเตือน", "กรุณาระบุวันที่เอกสารสมบูรณ์");
                                                                                return false;
                                                                            } else {
                                                                                saveDtl("SAVE_DTL");
                                                                                Ext.store3.load();
                                                                            }
                                                                        }
                                                                    }, {
                                                                        text: "&nbsp; ยกเลิก &nbsp;",
                                                                        iconCls: "icon-cancel",
                                                                        handler: function () {
                                                                            Ext.getCmp("winChequeID").getEl().unmask();
                                                                            Ext.getCmp("winSearchFrmReceive").hide();
                                                                            Ext.getCmp("winSearchFrmReceive").destroy();
                                                                            // Ext.win.destroy();
                                                                        }
                                                                    },
                                                                    {
                                                                        text: "&nbsp; ทำลาย&nbsp;",
                                                                        iconCls: "icon-cancel",
                                                                        hidden: true,
                                                                        handler: function () {
                                                                            Ext.getCmp("frmSubItemID").destroy();
                                                                        }
                                                                    },
                                                                    {
                                                                        text: "&nbsp; สร้าง &nbsp;",
                                                                        iconCls: "icon-cancel",
                                                                        hidden: true,
                                                                        handler: function () {
                                                                            Ext.getCmp('fileuploadID').insert(1, PDFform(record));
                                                                            Ext.getCmp('fileuploadID').doLayout();
                                                                        }
                                                                    }
                                                                ]
                                                            });
                                                            }
                                                        }

                                                       
                                                        Ext.store5.setBaseParam("sp_tor_hdr_period_id", record.get("sp_tor_hdr_period_id"));
                                                        Ext.store5.setBaseParam("dc_bg_budget_type_id", record.get("dc_bg_budget_type_id"));
                                                        Ext.SP_TOR_HDR_PERIOD_ID = record.get("sp_tor_hdr_period_id");
                                                        var i = 0;
                                                        var sum_qty = 0;
                                                        var sum_qty_all = 0;

                                                        Ext.store5.load({
                                                            callback: function (row, operation, success) {
                                                                if (success) {
                                                                    
                                                                    Ext.each(row || {}, function (rec) {
                                                                        sum_qty += rec.get("i_qty");
                                                                        sum_qty_all += rec.get("i_qty_all");
                                                                        i++;
                                                                    });
                                                                    var winPeriodID = Ext.win(row[0]);
                                                                    winPeriodID.show();
                                                                    // Ext.win.setTitle("รายการส่งมอบ ของงวดที่ " + record.get("i_period"));
                                                                   // Ext.getCmp('arr_c_codeID').setValue("IR000"+row[0].get('sp_tor_hdr_period_id'));
                                                                }
                                                            }
                                                        });
                                                    }
                                                },
                                                this
                                                );
                                    },
                                }, // 
                            }, //Column
                        ],
                    },
                ],
            },
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
        menu.add({text: "ค้นหาข้อมูล", icon: "../images/icons/book_magnify.png"}).on(
                "click",
                (click = function () {
                    if (!Ext.isEmpty(Ext.getCmp("winSearchFrm")))
                        Ext.getCmp("winSearchFrm").destroy();
                    var s1 = new Ext.SearchFrm();
                    s1.show();
                })
                );
        menu.add({
            text: "เพิ่มข้อมูล",
            icon: "../images/icons/add.png",
        })
                .on(
                        "click",
                        (click = function () {
                            Ext.buAct = "add";
                            Ext.loadStore("add", false); // app,data.load
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
                        header: "ลำดับ",
                        sortable: false,
                        align: "left",
                        dataIndex: "id",
                        hidden: true, // icon: "../images/icons/application_view_tile.png"
                    },
                    {
                        header: "ชื่อคู่สัญญา", width: 300,
                        sortable: false,
                        dataIndex: "dc_creditor_name",
                        width: 300,
                    },
                    {
                        header: "เลขที่สัญญา", width: 180,
                        sortable: false,
                        dataIndex: "c_doc_ref",
                        width: 180,
                    },
                    {
                        header: "หมวดค่าใช้จ่าย", width: 300,
                        sortable: false,
                        dataIndex: "po_expense_name",
                        width: 300,
                    },
                    {
                        header: "วงเงินในสัญญา", width: 150,
                        sortable: false,
                        align: "right",
                        dataIndex: "f_total_amt",
                        width: 90,
                    },
                    {
                        header: "วันที่เริ่มสัญญา", width: 150,
                        sortable: false,
                        align: "center",
                        dataIndex: "d_start_date",
                        renderer: function (val, metaData, record, rowIndex, colIndex, store) {
                            return shortThaiDate(val);
                        },
                    },
                    {
                        header: "วันที่สิ้นสุดสัญญา", width: 150,
                        sortable: false,
                        align: "center",
                        dataIndex: "d_end_date",
                        renderer: function (val, metaData, record, rowIndex, colIndex, store) {
                            return shortThaiDate(val);
                        },
                    },
                    {
                        header: "ชื่อผู้แก้ไขรายการ", width: 200,
                        sortable: false,
                        dataIndex: "dc_user_update_id",
                    },
                    {
                        header: "หน่วยงานแก้ไขรายการ", width: 200,
                        sortable: false,
                        dataIndex: "dc_user_update_cost_id",
                    },
                    {
                        header: "วันที่แก้ไขรายการ", width: 200,
                        sortable: false,
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
                                        text: "ค้นหาข้อมูล",
                                        icon: "../images/icons/book_magnify.png",
                                        handler: function (e) {
                                            if (!Ext.isEmpty(Ext.getCmp("winSearchFrm")))
                                                Ext.getCmp("winSearchFrm").destroy();
                                            var s1 = new Ext.SearchFrm();
                                            s1.show();
                                        },
                                        scope: this,
                                    },
                                    {
                                        text: "เพิ่มข้อมูล",
                                        icon: "../images/icons/add.png",
                                        handler: function (e) {
                                            Ext.loadStore("add", true); // app,data.load
                                        },
                                        scope: this,
                                    },
                                    {
                                        text: "จัดการข้อมูล View/Copy/Edit/Delete",
                                        icon: "../images/icons/application_edit.png",
                                        handler: function (e) {
                                            Ext.loadStore("edit", true); // app,data.load
                                        },
                                        scope: this,
                                    },
                                    {
                                        text: "คัดลอกข้อมูลใน copy data in cell grid",
                                        icon: "../images/icons/page_copy.png",
                                        handler: function (e) {
                                            //field
                                            var arrDataCopy = ["c_detail", "c_code_ref", "po_creditor_name"];
                                            var rowx = Ext.selectRow;

                                            if (!Ext.isEmpty(rowx) && !Ext.isEmpty(arrDataCopy))
                                                //if Ctlr+c
                                                CopyToClipboard(rowx, arrDataCopy);
                                        },
                                        scope: this,
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

                            // //  Ctlr+c
                            // new Ext.KeyMap(Ext.get("tabpanel1"), [
                            //   {
                            //     key: "c",
                            //     ctrl: true,
                            //     scope: this,
                            //     fn: function (e, ele) {
                            //       ele.preventDefault();
                            //       var arrDataCopy = ["c_detail", "c_code_ref", "po_creditor_name"];
                            //       var rowx = Ext.selectRow;
                            //       if (!Ext.isEmpty(rowx) && !Ext.isEmpty(arrDataCopy))
                            //         //if Ctlr+c
                            //         CopyToClipboard(rowx, arrDataCopy);
                            //     },
                            //   },
                            // ]);
                            // //end key
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
                    })
                });
            }),
            Ext.grid.EditorGridPanel,
            {}
    );
};
