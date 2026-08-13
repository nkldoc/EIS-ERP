/*!
 * Ext JS Library 3.3.1
 * eakibanez
 */
 
 
  
    
Ext.status = Ext.apply({
    name: "แจ้งเตือนการทำงาน",
    process: function (menuCode, record) {
        Ext.Ajax.request({
            url: "../sp/tor/api/mnTorController.php",
            params: {
                mode: "UPDATENEXTSTEP",
                menuCode: menuCode,
                i_seq: Ext.menu_i_seq,
                tor_status_id: record.get("tor_status_id"),
                tor_type_id: record.get("tor_type_id"),
                i_entrance: 0, //เมนูแยก
                menuback: Ext.menuback,
                i_backword: 1,
                c_comment: Ext.getCmp('reasonID').getValue(),
                id: record.get("id"),
            },
            method: "POST", //GET
            success: function (result, request) {
                var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                if (jsonData.success) {
                    Ext.MessageBox.alert("Success", jsonData.msg, function () {
                        Ext.getCmp("gridID").getStore().reload();
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
Ext.winProcess = function (rec) {
    var texBox = null;
    if (Ext.session.dc_department_type_id == 2 && rec.get("i_edit") == 3) {

        texBox = "ส่งธุระการแก้ไข <img src='../images/icons/time_red.png'> ";
    } else if (Ext.session.dc_department_type_id == 3 && rec.get("i_edit") == 4) {
        texBox = "แก้ไขแล้วกลับหัวหน้าสายงาน <img src='../images/icons/time_red.png'> ";
    } else if (Ext.session.dc_department_type_id == 2 && rec.get("i_edit") == 5) {
        texBox = "ส่งต่อสายงาน <img src='../images/icons/time_red.png'> ";

    } else {
        texBox = "ส่งกลับหัวหน้าสายงาน <img src='../images/icons/time_red.png'> "; // + Ext.session.dc_department_type_id + ' levele ' + Ext.session.i_level
    }

    new Ext.Window({
        id: "win-processID",
        title: "ผ่านรายการ PR",
        modal: true,
        resizable: true,
        width: 650,
        height: 350,
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
                fieldLabel: "พนักงานผู้รับผิดชอบ PR",
                id: "dc_emp_nameID",
                name: "dc_emp_name",
                value: "<b style='font-size:12px;'> " + (rec.get("emp_name") ? rec.get("emp_name") : '') + " ?</b>",
            },
            {
                xtype: "displayfield",
                fieldLabel: "สายงานและระดับการปฎิบัติงาน",
                name: "dc_department_display",
                value: "<b style='font-size:12px;'>สถานะแก้ไข " + rec.get("i_edit") + " ประเภท " + Ext.session.dc_department_type_id + ' ระดับ ' + Ext.session.i_level + " </b>",
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
                        inputValue: "GOTOSTEP",
                        boxLabel: "ผ่านรายการ <img src='../images/icons/accept.png'>",
                    },
                    {
                        name: "mode",
                        inputValue: "BACKSTEP",
                        id: 'backstepID',
                        boxLabel: texBox,
                    },
                ],
                listeners: {
                    change: function (cb, nv, ov) {
                        this.fn(rec);
//                        if (Ext.getCmp("modesubID").getValue().inputValue == "BACKSTEP") {
//                            Ext.getCmp("reasonID").show();
//
//                            Ext.menu_i_entrance = 5; //กลุ่มเมนู
//                            Ext.i_backword = 1; //กลับ 
//                            this.fn(rec);
//                        } else {
//                            if (rec.data.c_comment_status == "") {
//                                Ext.getCmp("reasonID").hide();
//                            }
//                        }
                    },
                    afterrender: function () {
                        this.fn = function (rec) {
                            if (rec.get("i_edit") == 4) {
                                Ext.menuback = 3;  //เมนูที่กลับ  
                            } else if (rec.get("i_edit") == 3) {
                                Ext.menuback = 2;  //เมนูที่กลับ  
                            } else if (rec.get("i_edit") == 5) {
                                Ext.menuback = 6;  //เมนูที่กลับ  
                            }
//                            console.log(rec.get("i_edit"));
                        };
                        this.fn(rec);

                    },
                },
            },
            {
                fieldLabel: "เหตุผลที่ส่งกลับ",
                xtype: "textarea",
                name: "reason",
                width: '100%',
                height: '100%',
                hidden: false,
                id: "reasonID",
                listeners: {
                    afterrender: function () {
                        this.setValue(Ext.getCmp('c_commentID').getValue());
//                        Ext.session
                        if (Ext.session.dc_department_type_id == 3)
                            console.log('กลุ่มสายงาน ธุระการ' + Ext.session.dc_department_type_id);
                        else if (Ext.session.dc_department_type_id == 2)
                            console.log('กลุ่มสายงาน ซื้อจ้าง' + Ext.session.dc_department_type_id);
//                        else
//                        Ext.getCmp('backstepID').setBoxLabel('ส่งกลับธุรการแก้ไขเงิน');

                    },
                },
            },
        ],
        buttonAlign: 'left',
        buttons: [
            {
                text: "อัพเดทการแก้ไขข้อมูล",
                iconCls: "icon-save",
                handler: function () {
                    console.log(Ext.session);
                    if (Ext.isEmpty(Ext.getCmp("modesubID").getValue())) {
                        Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกหมวดการผ่านการสถานะ", function (bu, action) {
                            return false;
                        });

                    } else if (Ext.getCmp("modesubID").getValue().inputValue == "GOTOSTEP") {
                        if (rec.get("sp_emp_id") == 0)
                            Ext.Msg.alert("แจ้งเตือน", "กรุณาบันทึกพนักงานผู้รับผิดชอบงาน PR", function (bu, action) {
                                return false;
                            });
//                        Ext.status.process(Ext.menuCode, rec);

                    } else if (Ext.getCmp("modesubID").getValue().inputValue == "BACKSTEP") {
//i_edit i_menu_edit menu_edit


                        if (rec.get('i_edit') == 4) {
                            Ext.status.process("ST0003", rec);
                            Ext.menuback = 3;
                        } else if (rec.get('i_edit') == 3) {
                            Ext.status.process("ST0001", rec);
                            Ext.menuback = 1;
                        } else if (rec.get('i_edit') == 5) {
                            Ext.status.process("ST0004", rec);
                            Ext.menuback = 4;
                        } else if (rec.get('i_edit') == 1) {
                            Ext.status.process("ST0001", rec);
                            Ext.menuback = 3;
                        }


                    }

                    return false;
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
};
function requestFullScreen() {
    var el = document.body;
    // Supports most browsers and their versions.
    var requestMethod = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullScreen;
    if (requestMethod) {
// Native full screen.
        requestMethod.call(el);
    } else if (typeof window.ActiveXObject !== "undefined") {
// Older IE.
        var wscript = new ActiveXObject("WScript.Shell");
        if (wscript !== null) {
            wscript.SendKeys("{F11}");
        }
    }
}
Ext.showTorDeail = function () {

    return new Ext.Window({
        width: 800,
        id: 'showTorDeailID',
        height: 500,
        modal: true,
        plain: true,
        layout: "fit",
        maximizable: true,
        collapsible: true,
        closable: true,
        frame: true,
        layout: 'form',
        items: new Ext.FormPanel({
            layout: "column",
            id: 'frmDeailID',
            title: 'เมนูที่ทำงานอยู่',
            border: false,
            labelWidth: 180,
            items: [
                {
                    columnWidth: 0.6,
                    layout: "form",
                    border: false,
                    items: [{
                            xtype: 'displayfield',
                            fieldLabel: 'รหัส PR ',
                            name: 'c_code',
                        }, {
                            xtype: 'displayfield',
                            fieldLabel: 'สถานะเอกสาร ',
                            name: 'c_name_status',
                        }, {
                            xtype: 'displayfield',
                            fieldLabel: 'เอกสารอ้างอิง ',
                            name: 'd_doc_ref',
                        }, {
                            xtype: 'displayfield',
                            fieldLabel: 'สถานะส่งแก้ไข',
                            name: 'menu_edit',
                        }, {
                            xtype: 'textarea',
                            width: '100%',
                            fieldLabel: 'หมายเหตุ',
                            id: 'c_commentID',
                            name: 'c_comment',
                        }, {
                            text: 'อนุมัติการแก้ไขหัวหน้าสายงาน',
                            fieldLabel: 'บันทึกแก้ไข',
                            xtype: 'button',
                            handler: function () {
                                Ext.winProcess(Ext.selectRowCopy);
//                                Ext.getCmp('backstepID').setLabel('ส่งกลับธุรการแก้ไขเงิน'); 
                                /* dc_department_type_id
                                 d
                                 1	หัวหน้าฝ่าย
                                 2	จัดซื้อจัดจ้าง1
                                 2	จัดซื้อจัดจ้าง2
                                 4	เบิกจ่าย
                                 3	ธุรการ
                                 5	ทรัพย์สิน
                                 5	คลังพัสดุ
                                 2	จัดซื้อจัดจ้าง3*/
                            }
                        }]

                }, {
                    columnWidth: 0.4,
                    layout: "form",
                    border: false,
                    items: [{
                            xtype: 'displayfield',
                            fieldLabel: 'รหัสสถานะ',
                            name: 'c_code_status',
                        }, {
                            xtype: 'displayfield',
                            fieldLabel: 'ระยะเวลาดำเนินการ',
                            name: 'i_alert_balance',
                        }, {
                            xtype: 'displayfield',
                            fieldLabel: 'สายงาน',
                            name: 'c_department',
                        }, {
                            xtype: 'displayfield',
                            fieldLabel: 'ผู้รับผิดชอบงาน',
                            name: 'emp_name',
                        }]
                }
            ]
        }),
    });
  
}
Ext.onReady(function () {
    var items = [];
    Ext.selectRow = []; 
    Ext.i_load = 0;
    Ext.check = false;
    Ext.QuickTips.init();
    var menu = new Ext.menu.Menu({
        items: [{
                text: 'เปิดออก',
                handler: function () {
                    window.open('#', 'Monitoring', 'fullscreen="yes"');
                }
            }, {
                text: 'เปิดดูเต็มจอ F11',
                handler: function () {
                    requestFullScreen();
                }
            }, {
                text: 'Reload หน้าจอ',
                handler: function () {
                    window.location.reload();
                }
            }, {
                text: 'Status ViewData',
                handler: function () {
                    alert(Ext.viewData); 
                }
            }]
    });
    items.push({
        xtype: 'panel',
        id: 'panelID',
        height: 110,
        tbar: [{
                text: 'ตั้งค่า',
                id: 'menu-btn',
                menu: menu
            }],
        items: [{
                xtype: 'displayfield',
                id: 'clock',
                style: "float:right;font-size:48px;font-weight:bold;padding:5px 15px 5px 5px"
            }, {
                xtype: 'displayfield',
                value: 'PO/งวด/ส่งมอบงาน/ตรวจรับ/เบิก',
                id: 'updateCount',
                style: "font-size:28px; color:blue; font-weight:bold;padding:0px 0px 0px 15px"
            }, {
                xtype: 'displayfield',
                id: 'showContentID',
            }
        ],
    });
  
    Ext.storeCheck = new Ext.data.JsonStore({
        autoDestroy: false,
        false: true,
        url: "api/listPeriod.php",
        baseParams: {
            lastModify: localStorage.getItem("lastModify"),
            check: false,
            type: "po_working_dtl",
            viewData:true,
            mode: "LIST",
            store:"storeCheck"
        },
        root: "data",
        idProperty: "id",
        totalProperty: "totalCount",
        fields: [{
                name: "no"
            }, {
                name: "id"
            }]
    });
    Ext.store = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/listPeriod.php",
        baseParams: {
            
            lastModify: localStorage.getItem("lastModify"),
            check: false,
            type: "po_working_dtl",
            viewData:true,
            mode: "LIST",
            store:"storeload"
        }, 
        root: "data",
        idProperty: "id",
        totalProperty: "totalCount",
        fields: [{
                name: "no"
            }, {
                name: "id"
            }, {
                name: "c_menu" 
            }, {
                name: "period_code" 
            }, {
                name: "contract_code" 
            }, {
                name: "c_arrive_code" 
            }, {
                name: "c_checking_code" 
            }, {
                name: "withdraw_code" 
            }, {
                name: "i_period" 
            }, {
                name: "d_due_date" 
            }, {
                name: "d_period_date" 
            }, {
                name: "d_arrive_date" 
            }, {
                name: "DateDiffArrive" 
            }, {
                name: "d_checking_date"  
            }, {
                name: "d_withdraw_date"  
            }, {
                name: "dc_user_update_id"}, {name: "dc_user_update_cost_id"}, {name: "d_update"}]
    });
    Ext.pagingBar = new Ext.PagingToolbar({
        pageSize:30,
        store: Ext.store,
        displayInfo: true,
        displayMsg: "Displaying topics {0} - {1} of {2}"
    });
    
//    function PermissionEmp(p) {
// 
//    var i_level = [{ id: 1, c_name: "ค้นหารายการ เลขพวช" }, {id: 2, c_name: "ค้นหาจากชื่อรายการ"}, {id: 3, c_name: "ค้นหาจากเลข PR"}];
//        Ext.storeEmp = new Ext.data.JsonStore({
//            fields: ["id", "c_name"],
//            data: i_level
//        });
//
//        return new Ext.form.ComboBox({
//            id: "viewID",
//            fieldLabel: "ดูรายงานตามสิทธิ์",
//            hiddenName: "i_view",
//            store: Ext.storeEmp,
//            valueField: "id",
//            displayField: "c_name",
//            mode: "local",
//            triggerAction: "all",
//            width: 150,
//            forceSelection: true,
//            selectOnFocus: true,
//            value: 3,
//        });
//    }
// Grid Main View 
    items.push({
        id: 'gridID',
        xtype: 'grid',
        store: Ext.store,
        layout: "fit",
        columns: [
            new Ext.grid.RowNumberer({
                header: "ที่",
                width: 30,
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    return record.get("no");
                }
            }),
             {

                header: "สถานะรายการ", //DateDiff d_tor_date_alert d_tor_date_pa d_tor_status_date DateDiff
                sortable: false,
                align: "left", 
                width: 140, 
                dataIndex: "c_menu",
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    // metaData.attr = "style='text-align: center;'";
                    return value;
                }
            }, { 
                id: "contract_codeID",
                header: "เลขที่สัญญา ",
                sortable: false,
                align: "left",
                width: 140,
                dataIndex: "contract_code",
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    metaData.attr = "style='text-align: left;font-weight:bold;'";
                    return value;
                } 
            },{
                id: "i_periodID",
                header: "งวด",
                width:50,
                sortable: false,
                align: "center",
                dataIndex: "i_period",
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    // metaData.attr = "style='text-align: center;'";
                    return value;
                }   
            }, {

                header: "วันที่สิ้นสุดสัญญา", //DateDiff d_tor_date_alert d_tor_date_pa d_tor_status_date DateDiff
                sortable: false,
                align: "left", 
                width: 100, 
                dataIndex: "d_due_date",
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    // metaData.attr = "style='text-align: center;'";
                    return value;
                }
            },{ //d_due_date d_period_date d_arrive_date d_checking_date
                id: "d_period_dateID",
                header: "วันที่งวด",
                width: 100,
                sortable: false,
                align: "left",
                dataIndex: "d_period_date",
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    // metaData.attr = "style='text-align: center;'";
                    return value;
                }   
            },{ //d_due_date d_period_date d_arrive_date d_checking_date
              
                header: "วันจำนวนส่งมอบ",
                width: 100,
                sortable: false,
                align: "center",
                dataIndex: "DateDiffArrive",
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    // metaData.attr = "style='text-align: center;'";
                    return value;
                }   
            }, {
                id: "c_arrive_codeID",
                header: "เลขที่รับของ",
                width: 100,
                sortable: false,
                align: "left",
                dataIndex: "c_arrive_code",
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    // metaData.attr = "style='text-align: center;'";
                    return value;
                }
  
            }, {
                id: "d_arrive_dateID",
                header: "วันที่ออกเลขรับของ",
                width: 100,
                sortable: false,
                align: "left",
                dataIndex: "d_arrive_date",
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    // metaData.attr = "style='text-align: center;'";
                    return value;
                }
         }, {
                id: "c_checking_codeID",
                header: "เลขที่ตรวจรับ",
                width: 100,
                sortable: false,
                align: "left",
                dataIndex: "c_checking_code",
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    // metaData.attr = "style='text-align: center;'";
                    return value;
                }
         }, {
                id: "d_checking_dateID",
                header: "เลขที่รับของ",
                width: 100,
                sortable: false,
                align: "left",
                dataIndex: "d_checking_date",
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    // metaData.attr = "style='text-align: center;'";
                    return value;
                } 
 
         }, {
                id: "withdraw_codeID",   
                header: "เลขที่ตรวจรับ",
                width: 100,
                sortable: false,
                align: "left",
                dataIndex: "withdraw_code",
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    // metaData.attr = "style='text-align: center;'";
                    return value;
                }
         }, {
                id: "d_withdraw_dateID",
                header: "เลขที่รับของ",
                width: 100,
                sortable: false,
                align: "left",
                dataIndex: "d_withdraw_date",
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    // metaData.attr = "style='text-align: center;'";
                    return value;
                } 
 
            }, {
                header: "หน่วยงานเจ้าของเรื่อง",
                align: "left",
                hidden: true,
                dataIndex: "dc_cost_idTxt"

            }, {width: 40, dataIndex: ""}
        ],
        // autoExpandColumn: "c_name_statusID",
        bbar: Ext.pagingBar,
        listeners: {
            beforerender: function (g) {
                this.contextMenu = new Ext.menu.Menu({
                    items: [
                        {
                            text: "คัดลอกข้อมูลใน copy data in cell grid",
                            icon: "../images/icons/page_copy.png",
                            handler: function (e)
                            {
                                Ext.buAct = "copy";
                                Ext.selectRowCopy = Ext.selectRow || {};
                            },
                            scope: this
                        }, {
                            text: "แสดงข้อมูลของ PR",
                            icon: "../images/icons/application_form.png",
                            handler: function (e)
                            {
                                Ext.buAct = "showDetail";
                                if (Ext.isEmpty(Ext.getCmp('frmTorDeailID'))) {
                                    var frm = Ext.showTorDeail();
                                    frm.show();
                                    Ext.getCmp('frmDeailID').setTitle(Ext.selectRowCopy.get('c_name'));
                                    Ext.getCmp('frmDeailID').getForm().loadRecord(Ext.selectRowCopy);
                                } else {
                                    Ext.getCmp('frmDeailID').getForm().loadRecord(Ext.selectRowCopy);
                                }
                            },
                            scope: this
                        },
                        {
                            text: "ตรวจสอบเอกสาร",
                            icon: "../images/icons/icon_pdf.png",
                            handler: function (e) {
                              Ext.buAct = "FlowcartLv1";
                              var linkDownload = window.location.protocol + "//" + window.location.hostname + "/sp_mn/api/upload/";
                              if (Ext.isEmpty(Ext.selectRow)) Ext.MessageBox.alert("แจ้งเตือน", "กรุณากดเลือกข้อมูลที่จะแสดง/ออกเลข PR ก่อน");
                              window.open(linkDownload + Ext.selectRow.get("c_codeStatus") + ".pdf?T=Tap_" + Math.floor(Math.random() * 100000), "Monitoring", 'fullscreen="yes"');
                            },
                            scope: this,
                       
                          },

                    ],
                });


            },
            afterrender: function () {
                var store = Ext.getCmp('gridID').getStore(); // your grid instance  
                var refreshTask = {// task which reloads the store each minute
                    run: function () { 
                        Ext.storeCheck.setBaseParam("viewData", Ext.viewData); 
                        Ext.storeCheck.reload({
                            callback: function (record, operation, success)
                            {
//                                console.log("lastModify "+localStorage.getItem("lastModify")+" == "+this.reader.jsonData.batchCounter); 
                                if (success)
                                { 
//                                        if(Ext.i_load > 1)
//                                        
                                        
                                        if (localStorage.getItem("lastModify") != this.reader.jsonData.batchCounter)
                                        {
                                            
                                            store.reload({
                                                callback: function (record, operation, success)
                                                {
                                                    if (success)
                                                    {
                                                        Ext.check = record[0].store.reader.jsonData.check;
                                                       // console.log(record[0].store.reader.jsonData.check);
                                                        
                                                        if (localStorage.getItem("lastModify") != this.reader.jsonData.batchCounter)
                                                        {
                                                            Ext.storeCheck.setBaseParam("check", false);
                                                            Ext.storeCheck.setBaseParam("viewData", Ext.viewData); //ประเภทการดูข้อมูล
                                                            localStorage.setItem("lastModify", this.reader.jsonData.batchCounter);
                                                            Ext.getCmp("gridID").getSelectionModel().selectRow(0);
                                                        } 
                                                    }
                                                }
                                            });
                                        }else{
                                            Ext.storeCheck.setBaseParam("check", true);
                                            
                                        }
                                  
                                }
                            }
                        });
              
                        Ext.i_load++;
                                        
                        /*
                        Ext.storeCheck.reload({
                            callback: function (record, operation, success)
                            {
                                if (success)
                                { 
                                    if(Ext.i_load > 1)
                                    {
                                        if (localStorage.getItem("lastModify") != this.reader.jsonData.batchCounter)
                                        {
                                            Ext.storeCheck.setBaseParam("check", Ext.check);
                                            Ext.storeCheck.setBaseParam("viewData", Ext.viewData);
                                          //  console.log(this.reader.jsonData.batchCounter + "===" + localStorage.getItem("lastModify"));
                                            store.reload({
                                                callback: function (record, operation, success)
                                                {
                                                    if (success)
                                                    {
                                                        Ext.storeCheck.setBaseParam("check", Ext.check);
                                                        Ext.storeCheck.setBaseParam("viewData", Ext.viewData); //ประเภทการดูข้อมูล
                                                        localStorage.setItem("lastModify", this.reader.jsonData.batchCounter);
                                                        Ext.getCmp("gridID").getSelectionModel().selectRow(Ext.indexID); 
                                                    }
                                                }
                                            });
                                        } else {
                                            Ext.storeCheck.setBaseParam("check", Ext.check);
                                            Ext.storeCheck.setBaseParam("viewData", Ext.viewData);
                                            localStorage.setItem("lastModify", this.reader.jsonData.batchCounter); 
                                            Ext.getCmp("gridID").getSelectionModel().selectRow(Ext.indexID);
                                        }
                                        
                                        
                                    }else{
                                        Ext.check = false;
                                    }
                                    
                                    Ext.MessageBox.alert("Alert", Ext.check+" "+Ext.i_load);
                                    Ext.i_load++;
                                }
                            }
                        });
                        */
                       
                    },
                    interval: 5 * 1000 // 1 Minute
                };
                var runner = new Ext.util.TaskRunner();
                this.fn = function (i) {
                    !i ? runner.stop(refreshTask) : runner.start(refreshTask);
                };
                this.fn(Ext.getCmp('stID').pressed);
                this.on("cellclick", function (grid, rowIndex, columnIndex, e) {
                    var record = grid.getStore().getAt(rowIndex);
                    Ext.selectRow = record;
                    Ext.selectRowCopy = record;

                }, this);
                this.on("contextmenu", function (e) {
                    e.stopEvent();
                    this.contextMenu.showAt(e.getXY());
                }, this);
                this.fnView = function(i){ 
                        Ext.store.setParam("viewData",Ext.viewData);
                        Ext.storeCheck.setParam("viewData",Ext.viewData);
                };
            }
        },
        stripeRows: true,
        loadMask: true,
        viewConfig: {
            getRowClass: function (record, index, rowParams, ds) {
                return record.get('no') == 10 ? 'background-color: #000' : '';
            }
        },
        tbar: ['สถานะ', ' '
            , '-',
            {
                xtype: 'button',
                id: 'stID',
                enableToggle: true, //หยุดดึงข้อมูล
                pressed: true,
                text: 'กำลังดึงข้อมูล',
                iconCls: "icon-start", //icon-back  icon-start
                handler: function (obj) {
                    Ext.getCmp('gridID').fn(Ext.getCmp('stID').pressed);
                    if (obj.pressed === true) {
                        this.setText('กำลังดึงข้อมูล');
                        Ext.check = true;
                    } else {
                        this.setText('หยุดดึงข้อมูล');
                        Ext.check = false;
                    }
                }
            }
            , 'ดูข้อมูลรวม', ' ','-',
            {
                xtype: 'button',
                id: 'st2ID',
                enableToggle: true, //หยุดดึงข้อมูล
                pressed: true,
                text: 'ดูรายการที่ยังไม่เบิก',
                iconCls: "icon-start", //icon-back  icon-start
                handler: function (obj) { 
                    if (obj.pressed === true) {
                        this.setText('ดูรายการที่ยังไม่เบิก');
                         Ext.viewData = true;
                    } else {
                        Ext.viewData = false;
                        this.setText('ดูรายการทั้งหมด');
                    } 
                    Ext.storeCheck.setBaseParam("check", false);
                    Ext.store.setBaseParam("viewData",Ext.viewData);
                    Ext.store.reload();
                
                }
            
            }
//            , '->',
//            PermissionEmp(),
//            new Ext.form.TwinTriggerField({
//                xtype: 'twintriggerfield',
//                width:250,
//                trigger1Class: 'x-form-clear-trigger',
//                trigger2Class: 'x-form-search-trigger',
//                emptyText: 'ข้อความที่ค้นหา',
//                onTrigger2Click: function () {
//                    //loadMask: false,
//                    var TypeTxt = Ext.getCmp('viewID').getValue();
//                    var txt = this.getValue();
//                    var store = Ext.getCmp('gridID').getStore();
//                    store.setBaseParam("TypeTxt", TypeTxt);
//                    store.setBaseParam("value", txt);
//                    store.setBaseParam("act", "SEARCH");
//                    store.reload({
//                        callback: function (record, operation, success)
//                        {
//                            if (success)
//                            {
//                                Ext.getCmp("gridID").getSelectionModel().selectRow(1);
//                            }
//                        }
//                    });
//                },
//                onTrigger1Click: function () {
//                    this.setValue(null);
//                    Ext.getCmp("gridID").getSelectionModel().selectRow(0);
//                }
//            })
        ]
    });
    //=============================================================
    // ListView
    //=============================================================

    new Ext.Viewport({
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        defaults: {
            xtype: 'panel',
            flex: 1
        },
        items: items,
        listeners: {
            beforerender:function(){
                Ext.viewData = true;
            },
            afterrender: function () {
//----------------------------------------- 
                var updateClock = function () {
                    Ext.fly('clock').update(new Date().format('d-m-Y g:i:s A'));
                };
                var task = {
                    run: updateClock,
                    interval: 5000 //1 second
                };
//-----------------------------------------
                var runner = new Ext.util.TaskRunner();
                runner.start(task);
            }
        }
    });
});