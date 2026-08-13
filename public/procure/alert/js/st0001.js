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
                            console.log(rec.get("i_edit"));
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
                value: 'รายการ PR',
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
        url: "api/mnTorController.php",
        baseParams: {
            lastModify: localStorage.getItem("lastModify"),
            check: false,
            type: "po_working_dtl",
            mode: "LIST"
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
        url: "api/mnTorController.php",
        baseParams: {
            lastModify: localStorage.getItem("lastModify"),
            check: false,
            type: "po_working_dtl",
            mode: "LIST"
        },
        root: "data",
        idProperty: "id",
        totalProperty: "totalCount",
        fields: [{
                name: "no"
            }, {
                name: "id"
            }, {
                name: "i_alert_balance"
            }, {
                name: "DateDiff"
            }, {
                name: "d_tor_date_alert"
            }, {
                name: "d_tor_date_pa"
            }, {
                name: "d_tor_status_date"
            }, {
                name: "c_name_status"
            }, {
                name: "c_code_status"
            }, {
                name: "i_step"
            }, {
                name: "i_forword"
            }, {
                name: "i_backword"
            }, {
                name: "c_codeStatus"
            }, {
                name: "c_code"
            }, {
                name: "bg_budget_dtl_project_id"
            }, {
                name: "c_budget_dtl_project"
            }, {
                name: "c_name" //emp_name
            }, {
                name: "emp_name" //
            }, {
                name: "c_code_status"
            }, {
                name: "c_name_status" //
            }, {
                name: "c_tor_type"
            }, {
                name: "tor_status_id"
            }, {
                name: "tor_type_id"
            }, {
                name: "c_purchase"
            }, {
                name: "i_purchase"
            }, {
                name: "d_tor_date" //
            }, {
                name: "i_parent" //d_tor_date
            }, {
                name: "i_is_more"
            }, {
                name: "i_is_rename"
            }, {
                name: "i_is_parent"
            }, {
                name: "f_total_amt"
            }, {
                name: "dc_cost_id"
            }, {
                name: "dc_cost_idTxt"
            }, {
                name: "i_yyyy"
            }, {
                name: "c_year"
            }, {
                name: "dc_department_id"
            }, {
                name: "c_department"
            }, {
                name: "d_doc_ref"
            }, {
                name: "menu_edit"
            }, {
                name: "i_edit"
            }, {
                name: "i_menu_edit"
            }, {
                name: "c_comment"
            }, {
                name: "dc_expense_budget_type_id"
            }, {
                name: "po_expense_id"
            }, {
                name: "i_enable"
            }, {name: "dc_user_update_id"}, {name: "dc_user_update_cost_id"}, {name: "d_update"}]
    });
    Ext.pagingBar = new Ext.PagingToolbar({
        pageSize: 20,
        store: Ext.store,
        displayInfo: true,
        displayMsg: "Displaying topics {0} - {1} of {2}"
    });
    
    function PermissionEmp(p) {
        //  console.log(Ext.session);

//        switch (Ext.session.i_level) {
//            case 1:
//                var i_level = [{id: 1, c_name: "ดูทั้งหมด"}, {id: 2, c_name: "ดูตามสายงาน"}, {id: 3, c_name: "ดูเฉพาะของตัวเอง"}];
//                break;
//            case 2:
//                var i_level = [{id: 2, c_name: "ดูตามสายงาน"}, {id: 3, c_name: "ดูเฉพาะของตัวเอง"}];
//                break;
//            case 3:
//                var i_level = [{id: 3, c_name: "ดูเฉพาะของตัวเอง"}];
//                break;
//        }
    var i_level = [{ id: 1, c_name: "ค้นหารายการ เลขพวช" }, {id: 2, c_name: "ค้นหาจากชื่อรายการ"}, {id: 3, c_name: "ค้นหาจากเลข PR"}];
        Ext.storeEmp = new Ext.data.JsonStore({
            fields: ["id", "c_name"],
            data: i_level
        });

        return new Ext.form.ComboBox({
            id: "viewID",
            fieldLabel: "ดูรายงานตามสิทธิ์",
            hiddenName: "i_view",
            store: Ext.storeEmp,
            valueField: "id",
            displayField: "c_name",
            mode: "local",
            triggerAction: "all",
            width: 150,
            forceSelection: true,
            selectOnFocus: true,
            value: Ext.session.i_level,
        });
    }
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

                id: "c_codeID",
                header: "รหัส ",
                sortable: false,
                align: "center",
                width: 140,
                dataIndex: "c_code",
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    metaData.attr = "style='text-align: right;font-weight:bold;'";
                    return value;
                }
            }, {
                header: "สถานะแก้ไข ",
                sortable: false,
                align: "center",
                hidden:true,
                width: 150,
                dataIndex: "menu_edit",
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    metaData.attr = "style='text-align: left;color:red;font-weight:bold;'";
                    return value;
                }

            }, {

                header: "สถานะรายการ", //DateDiff d_tor_date_alert d_tor_date_pa d_tor_status_date DateDiff
                sortable: false,
                align: "left",
                width: 200,
                //   id: "c_name_statusID",
                dataIndex: "c_name_status",
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    // metaData.attr = "style='text-align: center;'";
                    return record.get('c_code_status') + ' ' + value;
                }
            }, {
                id: "c_name",
                header: "รายการ",
                width: 230,
                sortable: false,
                align: "left",
                dataIndex: "c_name",
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    // metaData.attr = "style='text-align: center;'";
                    return value;
                }
            },
            {
                id: "d_doc_ref_id",
                header: "เลขที่เอกสารอ้างอิง",
                width: 100,
                sortable: false,
                align: "left",
                dataIndex: "d_doc_ref",
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    // metaData.attr = "style='text-align: center;'";
                    return value;
                }
            }, {

                header: "วันที่บันทึกสถานะ",
                sortable: false,
                width: 140,
                align: "center",
                dataIndex: "d_tor_status_date"
            }, {
                header: "วันที่ครบกำหนดแจ้งเตือน",
                sortable: false,
                width: 140,
                align: "center",
                dataIndex: "d_tor_date_alert"

            }, {
                header: "กำหนดวันดำเนินงาน",
                sortable: false,
                align: "center",
                dataIndex: "i_alert_balance",
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    metaData.attr = "style='text-align: center;font-weight:bold;'";
                    return value;
                }
            }, {
                header: "ผู้รับผิดชอบ",
                width: 170,
                sortable: false,
                align: "left",
                hidden: false,
                dataIndex: "emp_name"

            }, {
                header: "วิธีดำเนินงาน",
                width: 70,
                sortable: false,
                align: "left",
                hidden: true,
                dataIndex: "c_tor_type"

            }, {
                header: "ขอดำเนินการ",
                sortable: false,
                align: "center",
                width: 70,
                hidden: true,
                dataIndex: "c_purchase"
            }, {
                header: "รหัสเอกสารอ้างอิง",
                sortable: false,
                hidden: true,
                align: "center",
                dataIndex: "d_doc_ref",
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
                            //                                },
                            //              {
                            //                text: "เปลี่ยนผู้รับผิดชอบงาน",
                            //                icon: "../images/icons/application_edit.png",
                            //                handler: function (e) {
                            //                  Ext.buAct = "update";
                            //                },
                            //                scope: this,
                          },

                    ],
                });


            },
            afterrender: function () {
                var store = Ext.getCmp('gridID').getStore(); // your grid instance  
                var refreshTask = {// task which reloads the store each minute
                    run: function () {

                        Ext.storeCheck.reload({
                            callback: function (record, operation, success)
                            {
                                if (success)
                                {


                                    if (localStorage.getItem("lastModify") != this.reader.jsonData.batchCounter) {
                                        Ext.storeCheck.setBaseParam("check", false);
                                        console.log(this.reader.jsonData.batchCounter + "===" + localStorage.getItem("lastModify"));
                                        store.reload({
                                            callback: function (record, operation, success)
                                            {
                                                if (success)
                                                {
                                                    Ext.storeCheck.setBaseParam("check", false);
                                                    localStorage.setItem("lastModify", this.reader.jsonData.batchCounter);
                                                    Ext.getCmp("gridID").getSelectionModel().selectRow(Ext.indexID);

                                                }
                                            }
                                        });
                                    } else {
                                        Ext.storeCheck.setBaseParam("check", false);
                                        localStorage.setItem("lastModify", this.reader.jsonData.batchCounter);
//                                        console.log(this.reader.jsonData.batchCounter + "===" + localStorage.getItem("lastModify"));
                                        Ext.getCmp("gridID").getSelectionModel().selectRow(Ext.indexID);
                                    }
                                }
                            }
                        });

                    },
                    interval: 10 * 1000 // 1 Minute
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
            }
        },
        stripeRows: true,
        loadMask: true,
        viewConfig: {
            getRowClass: function (record, index, rowParams, ds) {
                return record.get('no') == 10 ? 'background-color: #000' : '';
            }
        },
        tbar: ['สถานะ', ' ', '-',
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
                    } else {
                        this.setText('หยุดดึงข้อมูล');
                    }
                }
            }
            , '->',
            PermissionEmp(),
            new Ext.form.TwinTriggerField({
                xtype: 'twintriggerfield',
                width:250,
                trigger1Class: 'x-form-clear-trigger',
                trigger2Class: 'x-form-search-trigger',
                emptyText: 'ข้อความที่ค้นหา',
                onTrigger2Click: function () {
                    //loadMask: false,
                    var TypeTxt = Ext.getCmp('viewID').getValue();
                    var txt = this.getValue();
                    var store = Ext.getCmp('gridID').getStore();
                    store.setBaseParam("TypeTxt", TypeTxt);
                    store.setBaseParam("value", txt);
                    store.setBaseParam("act", "SEARCH");
                    store.reload({
                        callback: function (record, operation, success)
                        {
                            if (success)
                            {
                                Ext.getCmp("gridID").getSelectionModel().selectRow(1);
                            }
                        }
                    });
                },
                onTrigger1Click: function () {
                    this.setValue(null);
                    Ext.getCmp("gridID").getSelectionModel().selectRow(0);
                }
            })
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