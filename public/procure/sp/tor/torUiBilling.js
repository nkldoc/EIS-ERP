/* global Ext, user_right_add, user_right_edit, user_right_delete */

//
//Ext.reg('triggerEdit', Ext.form.TriggerField); from configStoreUi.js
Ext.leftSearch = function (tb) {


    return [tb, '->',
        new Ext.form.TwinTriggerField({
            xtype: 'triggerEdit',
            trigger1Class: 'x-form-clear-trigger',
            trigger2Class: 'x-form-search-trigger',
            width: 400,
            id: "leftSearchID",
            emptyText: 'ค้นหา',
            onClick: function () {
                var position = Ext.get('leftSearchID').getXY();


                if (Ext.isEmpty(Ext.getCmp("leftSearchAutoCompleteID")))
                {
                    var msgSearch = "<img src='../images/contextMenu.jpg'>";
                    var wind = new Ext.Window({
                        id: "leftSearchAutoCompleteID",
//                        iconCls: "icon-application-view-list",
                        modal: false,
                        collapsible: false,
                        closable: false,
                        border: false,
                        resizable: false,
                        layout: 'fit',
                        width: 386,
                        x: position[0],
                        y: position[1] + 20,
                        items: [{
                                xtype: 'panel',
                                id: 'resSearchID',
//                                items: [
//                                    {
//                                        xtype: "textfield",
//                                        fieldLabel: "เลขที่สัญญา",
//                                        id: "c_codeID",
//                                        name: "c_code",
//                                        enableKeyEvents: true,
//                                        listeners: {
//                                            keypress: function (field, e) {
//                                                if (e.getKey() === e.ENTER) {
//                                                    submitSearch();
//                                                }
//                                            }
//                                        }
//                                    }
//                                ],
                                html: "<div onClick='Ext.focus();' style='white-space: nowrap;backgroud:gray !important; ;width:100%; height:300px; border:2px !important; '>" + msgSearch + "</div>",
                                listeners: {
                                    beforerender: function () {
                                        wind.on("click", function (e) {
                                            Ext.nofocus();
                                        }, this);
                                        wind.on("blure", function (e) {
                                            Ext.nofocus();
                                        }, this);
                                        Ext.focus = function () {
                                            console.log('focus');
                                        };
                                        Ext.nofocus = function () {
                                            console.log('nofocus');
                                        };

                                    },
                                    afterrender: function () {
                                    }
                                }
                            }],

                    });

                    if (!Ext.isEmpty(Ext.getCmp("winSearchFrm")))
                        Ext.getCmp("winSearchFrm").destroy();
                    var s1 = Ext.SearchFrm();

                    s1.show();

                    //  wind.show();
                }

            },
            onTrigger1Click: function () {
                this.setValue(null);
                Ext.getCmp('leftSearchAutoCompleteID').destroy();

            },
            onTrigger2Click: function () {
                var store = Ext.getCmp('tabpanel1').getStore(); //id: "tabpanel1",
                store.setBaseParam("value", this.getValue());
                store.setBaseParam("act", "SEARCH");
                store.reload({
                    callback: function (record, operation, success)
                    {
                        if (success)
                        {

                        }
                    }
                });
            },
        })];
};
Ext.contextMenu = function () {
    var headerGroup = [{
            text: "Alt+n จัดการข้อมูลในฟอร์ม",
            icon: "../images/icons/application_edit.png",
            handler: function (e) {
                Ext.buAct = "update";
                Ext.loadStore("edit", true); // app,data.load
            },
            scope: this,
        }, {
            text: "Cltr+f ค้นหา ",
            icon: "../images/icons/application_form_magnify.png",
            handler: function (e) {
                if (!Ext.isEmpty(Ext.getCmp("winSearchFrm")))
                    Ext.getCmp("winSearchFrm").destroy();
                var s1 = Ext.SearchFrm();
                s1.show();
            }
        }, {
            text: "Cltr+C คัดลอก grid cell ",
            icon: "../images/icons/page_copy.png",
            handler: function (e) {
                Ext.copyRowSel();
            }
        }, {
            text: "Cltr+v Text Document ",
            icon: "../images/icons/page_copy.png",
            handler: function (e) {
                if (Ext.isEmpty(window.parent.Ext.getCmp('winMsgID')))
                    window.parent.Ext.textEditor();
                else {
                    Ext.MessageBox.alert("Failed", "<span style='white-space: nowrap;'>การเปิดอยู่ในรูปแบบไม่สมบูรณ์</span>");
                }


            }
        }, {
            text: "ตรวจสอบเอกสาร",
            icon: "../images/icons/icon_pdf.png",
            handler: function (e) {
                Ext.buAct = "FlowcartLv1";
                Ext.linkDownload = window.location.protocol + '//' + window.location.hostname + '/sp_mn/api/upload_ap/';
                if (Ext.isEmpty(Ext.selectRow))
                    Ext.MessageBox.alert("แจ้งเตือน", "กรุณากดเลือกข้อมูลที่จะแสดง/ออกเลข PR ก่อน");
                window.open(Ext.linkDownload + Ext.selectRow.get('upload_name') + '?T=Tap_' + Math.floor(Math.random() * 100000), 'Monitoring', 'fullscreen="yes"');
            }, scope: this}];


    this.contextMenu = new Ext.menu.Menu({
        items: headerGroup,
    });
};
Ext.hotKeyGrid = function () {
    //global Ext.colmnn,Ext.selectRow
    new Ext.KeyMap(Ext.getBody(), [{
            key: "f",
            ctrl: true,
            fn: function (e, ele) {
                ele.preventDefault();
                if (!Ext.isEmpty(Ext.getCmp("winSearchFrm")))
                    Ext.getCmp("winSearchFrm").destroy();
                var s1 = Ext.SearchFrm();
                s1.show();
            }
        }]);
    var clrC = new Ext.KeyMap(Ext.getBody(), [{
            key: "c",
            ctrl: true,
            fn: function (e, ele) {
                ele.preventDefault();
                Ext.copyRowSel();
            }
        }]);
    new Ext.KeyMap(Ext.getBody(), [{
            key: "v",
            ctrl: true,
            fn: function (e, ele) {
                ele.preventDefault();
                window.parent.Ext.textEditor();

            }
        }]);
    new Ext.KeyMap(Ext.getBody(), [{
            key: "n",
            alt: true,
            fn: function (e, ele) {
                ele.preventDefault();
                Ext.formPanelMain(Ext.selectObj());
            }
        }]);
};
Ext.copyRowSel = function () {
    //global Ext.colmnn,Ext.selectRow
    var arrDataCopy = Ext.colmnn;
    var rowx = Ext.selectRow;
    if (!Ext.isEmpty(rowx) && !Ext.isEmpty(arrDataCopy))
        CopyToClipboard(rowx, arrDataCopy);
};

const cancel_tor = function (status) {
    var statusx = status;
    if (Ext.isEmpty(Ext.selectRow))
        Ext.Msg.alert("แจ้งเตือน", "กรุณา click เลือกข้อมูลที่จะยกเลิกรายการ", function (form, action) {
            return false;
        });
    else {
        new Ext.Window({
            id: "win-msg-cancel",
            title: "ยืนยันการทำรายการ",
            resizable: false,
            modal: true,
            width: 600,
            // height: 250,
            layout: "form",
            // html: "ท่านต้องการที่จะ ?",
            items: [
                {
                    xtype: "displayfield",
                    fieldLabel: "ยกเลิอกรายการ",
                    value: "<b style='font-size:16px;'> " + Ext.selectRow.data.c_code + " ?</b>",
                },
                {
                    xtype: "displayfield",
                    fieldLabel: "ชื่อรายการ",
                    value: "<p style='font-size:13px;'> " + Ext.selectRow.data.c_name + " </p>",
                },
                {
                    xtype: "radiogroup",
                    columns: [180, 180],
                    fieldLabel: "วิธีการย้อน",
                    hidden: statusx == "reverse" ? false : true,
                    id: "modecancelID",
                    style: {"font-weight": "bold", },
                    items: [
                        {
                            name: "mode",
                            // checked: (Ext.selectRow.data.tor_status_id == 28)? true : false ,
                            checked: true,
                            inputValue: 1,
                            hidden: Ext.selectRow.data.tor_status_id >= 28 && Ext.selectRow.data.tor_status_id <= 31,
                            boxLabel: Ext.selectRow.data.tor_status_id == 13 ? "ส่งคืนหัวหน้าสายงาน <img src='../images/icons/time_red.png'>"
                              : "ย้อนรายการไปเมนูก่อนหน้านี้ <img src='../images/icons/delete.png'>",
                        }, {
                            name: "mode",
                            inputValue: 2,
                            hidden: Ext.selectRow.data.tor_status_id == 24 || Ext.selectRow.data.tor_status_id == 26 || Ext.selectRow.data.tor_status_id == 13,
                            checked: Ext.selectRow.data.tor_status_id >= 28 && Ext.selectRow.data.tor_status_id <= 31,
                            boxLabel: "ส่งคืนฝ่ายจัดสรร <img src='../images/icons/time_red.png'>",
                        },
                    ],
                    listeners: {
                        change: function (cb, nv, ov) {
                            if (Ext.getCmp('modecancelID').getValue().inputValue == 1) {
                            } else {
                            }
                        },
                        afterrender: function () {
                        },
                    },
                },
                {
                    xtype: "radiogroup",
                    columns: [300],
                    fieldLabel: "วิธีการย้อน",
                    id: "mode_reverselID",
                    hidden: Ext.isAudit ? false : true,
                    style: {
                        "font-weight": "bold",
                    },
                    items: [
                        {
                            name: "mode1",
                            // checked: Ext.isAudit ? false : true,
                            checked: true,
                            inputValue: 1,
                            // hidden: Ext.isAudit ? false : true,
                            boxLabel: "ส่งรายการคืนสานงาน <img src='../images/icons/time_red.png'>",
                        },
                        {
                            name: "mode1",
                            inputValue: 2,
                            // checked:  Ext.selectRow.data.tor_status_id >= 28 && Ext.selectRow.data.tor_status_id <= 31,
                            boxLabel: "ส่งรายการคืนสายงานและยกเลิกการจองเงิน <img src='../images/icons/delete.png'>",
                        },
                    ],
                    listeners: {
                        change: function (cb, nv, ov) {
                            // if (Ext.getCmp('modecancelID').getValue().inputValue == 1) {
                            //     // Ext.getCmp("reasonID").show();
                            // } else {
                            //     // if (rec.data.c_comment_ status == "") {
                            //         // Ext.getCmp("reasonID").hide();
                            //     // }
                            // }
                        },
                        afterrender: function () {
                        },
                    },
                },
                {
                    fieldLabel: statusx == "cancel" ? "เหตุผลในการยกเลิกรายการ" : "เหตุผลในการย้อนรายการ" || statusx == "reverse_spending" ? "เหตุผลในการส่งคืน" : false,
                    xtype: "textarea",
                    name: "reason",
                    width: 400,
                    id: "reason_deleteID",
                    listeners: {
                        afterrender: function () {
                        },
                    },
                },
                {
                    xtype: "displayfield",
                    hidden: statusx == "cancel" ? false : true,
                    fieldLabel: "หมายเหตุ",
                    value: "<b style='font-size:16px;color:red;'> เมื่อคุณกดยืนยัน รายการจะถูกยกเลิก และหายไปจากระบบ  </b>",
                },
                {
                    xtype: "displayfield",
                    fieldLabel: "หมายเหตุ",
                    hidden: statusx == "reverse" ? false : true,
                    value: "<b style='font-size:12px;'>วันที่ผ่านรายการจะถูกนับใหม่เมื่อคุณกดปุ่มยืนยัน </b>",
                },
            ],
            buttons: [
                {
                    text: "ยืนยันการทำรายการ",
                    iconCls: "icon-table_delete",
                    hidden: statusx == "reverse" ? true : false || statusx == "reverse_spending" ? true : false,
                    handler: function () {
                        Ext.Ajax.request({
                            url: "tor/api/mnTorController.php",
                            params: {
                                mode: "Cancel_Tor",
                                id: Ext.selectRow.data.id,
                                sp_status_hdr_id: Ext.selectRow.data.tor_status_id,
                                c_comment_delete: Ext.getCmp("reason_deleteID").getValue(),
                                sp_emp_id: Ext.selectRow.data.sp_emp_id,
                                i_type_delete: 2

                            },
                            method: "GET", //POST
                            success: function (result, request) {
                                var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                                if (jsonData.success) {
                                    Ext.MessageBox.alert("Success", jsonData.msg, function () {
                                        Ext.getCmp("win-msg-cancel").destroy();
                                        Ext.getCmp("tabpanel1").getStore().reload();
                                    });
                                } else {
                                    Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                                }
                            },
                            failure: function (result, request) {
                                Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                            },
                        });
                    },
                },
                {
                    text: "ยืนยัน",
                    hidden: statusx == "cancel" ? true : false || statusx == "reverse_spending" ? true : false,
                    iconCls: "icon-arrow_undo",
                    handler: function () {
                        Ext.Ajax.request({
                            url: "tor/api/mnTorController.php",
                            params: {
                                mode: "Reverse_Tor",
                                id: Ext.selectRow.data.id,
                                sp_status_hdr_id: Ext.selectRow.data.tor_status_id,
                                i_type_delete: Ext.getCmp("modecancelID").getValue().inputValue,
                                c_comment_delete: Ext.getCmp("reason_deleteID").getValue(),
                                sp_emp_id: Ext.selectRow.data.sp_emp_id
                            },
                            method: "GET", //POST
                            success: function (result, request) {
                                var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                                if (jsonData.success) {
                                    Ext.MessageBox.alert("Success", jsonData.msg, function () {
                                        Ext.getCmp("win-msg-cancel").destroy();
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
                },
                {
                    text: "ยืนยันการส่งคืนสายงาน",
                    hidden: Ext.isAudit ? false : true,
                    iconCls: "icon-arrow_undo",
                    handler: function () {
                        Ext.Ajax.request({
                            url: "tor/api/mnTorController.php",
                            params: {
                                mode: "Return_The_Story_Owner",
                                id: Ext.selectRow.data.id,
                                sp_status_hdr_id: Ext.selectRow.data.tor_status_id,
                                // i_type_delete : Ext.getCmp("modecancelID").getValue().inputValue,
                                c_comment_delete: Ext.getCmp("reason_deleteID").getValue(),
                                sp_emp_id: Ext.selectRow.data.sp_emp_id,
                                i_is_register: 0,
                                mode_reverse: Ext.getCmp("mode_reverselID").getValue().inputValue,
                            },
                            method: "GET", //POST
                            success: function (result, request) {
                                var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                                if (jsonData.success) {
                                    Ext.MessageBox.alert("Success", jsonData.msg, function () {
                                        Ext.getCmp("win-msg-cancel").destroy();
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
                },
                {
                    text: Ext.GLOBAL_BU_BACK_TH,
                    iconCls: "icon-clear",
                    handler: function () {
                        Ext.getCmp("win-msg-cancel").hide();
                        Ext.getCmp("win-msg-cancel").destroy();
                    }
                }
            ],
        }).show();
    }
};


Ext.runStatus = function (menu) {
    return Ext.apply({
        name: menu,
        process: function (menuCode, record) {
            Ext.Ajax.request({
                url: "tor/api/mnTorController.php",
                params: {
                    mode: "UPDATENEXTSTEP",
                    menuCode: menuCode,
                    tor_status_id: record.get("tor_status_id"),
                    tor_type_id: record.get("tor_type_id"),
                    i_is_more: record.get("i_is_more"),
                    typeItems: Ext.typeItems,
                    i_entrance: Ext.menu_i_entrance,
                    id: record.get("id")
                },
                method: "POST", //GET
                success: function (result, request) {
                    try {
                        var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                    } catch (err) {
                        Ext.MessageBox.alert("ติดต่อแอดมิน", result.responseText); // connect error
                    }
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
            console.log(Ext.selectRow.data.i_is_register);
            console.log(Ext.selectRow.data.index_receive);
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
            }
            // console.log(Ext.selectRow.data);
            if (Ext.selectRow.data.tor_status_id != 20) {
                controller(Ext.selectRow, "processUpdate"); //on
            }
        } else if (columnIndex === grid.getColumnModel().getIndexById("processreverseID")) {
            // cancel_tor("reverse");
            // return ;
            // }
        } else if (columnIndex === grid.getColumnModel().getIndexById("processcancelID")) {
            // if (Ext.selectRow.data.tor_status_id == 20 ){
            cancel_tor("cancel");
            // }
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
        Ext.storeCreditor = new Ext.data.JsonStore({
            //autoLoad: true,
            storeId: "myStoreCont",
            url: "tor/api/mnTorController.php",
            baseParams: {mode: "LIST_POP_CREDITOR", id: 0},
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
                var id = "dc_creditor_idID";
                var nameID = id + "_Name";
                var record = grid.getStore().getAt(rowIndex);
                var c_tax_number_imp = record.data.c_tax_number_imp == null ? "(ไม่มีเลขที่ประจำตัวผู้เสียภาษี)" : record.data.c_tax_number_imp;
                var TextShow = c_tax_number_imp + " : " + record.data.c_name;
                Ext.getCmp("dc_creditor_idID").setValue(record.data.dc_creditor_id);
                // Ext.getCmp("d_start_dateID").setValue(record.data.d_doc_date);
                // Ext.getCmp("d_end_dateID").setValue(record.data.d_due_date);
                // var f_total = parseFloat(record.data.f_total_amt.replace(/,/g, "") / 1);
                // Ext.getCmp("f_total_amtID").setValue(Ext.floatRenderer(f_total));
                Ext.getCmp(nameID).setValue(TextShow);
                Ext.getCmp("win-pop-lov" + id).hide();
                Ext.getCmp("win-pop-lov" + id).destroy();
            },
        });

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
                  }
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
              {
                  header: "ย้อนสถานะ",
                  sortable: false,
                  align: "center",
                  hidden: true,
                  dataIndex: "id",
                  id: "processreverseID", // reverse
                  width: 200,
                  renderer: function (value, metaData, record, row, col, store, gridView) {
                      var BtnText, IconImg;
                      BtnText = '&nbspย้อนรายการ';
                      IconImg = '../images/icons/date_previous.png';
                      var style = 'font-size:12px;border:1px solid #ccc; width:100px; padding:3px 3px 3px 10px; background: #f0f0f0 url(' + IconImg + ') no-repeat 3px center; cursor: pointer;';

                      return '<button style="' + style + '" type="button">' + BtnText + '</button>';
                  }
              },
              {
                  header: "ยกเลิกรายการ",
                  sortable: false,
                  align: "center",
                  dataIndex: "id",
                  id: "processcancelID", // cancel
                  width: 200,
                  renderer: function (value, metaData, record, row, col, store, gridView) {
                      var BtnText, IconImg;
                      BtnText = '&nbspยกเลิกรายการ';
                      IconImg = '../images/icons/page_cancel.png';
                      var style = 'font-size:12px;border:1px solid #ccc; width:100px; padding:3px 3px 3px 10px; background: #f0f0f0 url(' + IconImg + ') no-repeat 3px center; cursor: pointer;';

                      return '<button style="' + style + '" type="button">' + BtnText + '</button>';
                  }
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
                              // {
                              //     text: "รายละเอียดทั้งหมด",
                              //     icon: "../images/icons/book_magnify.png",
                              //     handler: function (e) {
                              //         Ext.buAct = "getDetail";
                              //         Ext.getCmp("contenterCenter").add(tab2);
                              //         Ext.getCmp("contenterCenter").setActiveTab(tab2);
                              //     },
                              //     scope: this,
                              // },
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
                                      var linkDownload = window.location.protocol + '//' + window.location.hostname + '/sp_mn/api/upload_billing/';
                                      if (Ext.isEmpty(Ext.selectRow))
                                          Ext.MessageBox.alert("แจ้งเตือน", "กรุณากดเลือกข้อมูลที่จะแสดง/ออกเลข PR ก่อน");
                                      window.open(linkDownload + Ext.selectRow.get('c_code') + '.pdf?T=Tap_' + Math.floor(Math.random() * 100000),
                                        'Monitoring', 'fullscreen="yes"');
                                  },
                                  scope: this,
                              },
                              {
                                  text: "ย้อนรายการ",
                                  hidden: true,
                                  icon: "../images/icons/date_previous.png",
                                  handler: function (e) {
                                      // Ext.buAct = "update";
                                      // cancel_tor("reverse");
                                  },
                                  scope: this,
                              },
                              {
                                  text: "ยกเลิกรายการ",
                                  // hidden: Ext.isAudit ? true : false,
                                  icon: "../images/icons/page_cancel.png",
                                  handler: function (e) {
                                      cancel_tor("cancel");
                                  },
                                  scope: this,
                              },
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
                name: "i_step",
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
