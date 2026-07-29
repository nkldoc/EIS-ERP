
Ext.onReady(function () {
    Ext.QuickTips.init();
    var pdf = Ext.get('work-pdf-win-shortcut');
    var table = Ext.get('work-table-win-shortcut');
    var users = Ext.get('work-users-win-shortcut');
    var report = Ext.get('report-win-shortcut');
    var buWarranty = Ext.get('warrantyID');
    var desktop = Ext.get('x-desktop');
    var headerId = window.parent.Ext.get('header'); //Ext.get('header')
//-----------------------------------------


    Ext.runner = new Ext.util.TaskRunner( );
    //alert(1024 * 1024 * 5 - unescape(encodeURIComponent(JSON.stringify(localStorage))).length);
    /*if (localStorage.getItem('runWarranty') == '0') {

        Ext.runner.stopAll();
        Ext.fly('warranty_notif').update('หยุดการโหลด หมดรับรับประกัน');
        headerId.hide();
    } else {

        Ext.runner.start(Ext.task);
        Ext.fly('warranty_notif').update('หมดรับรับประกัน');
        headerId.show();

    }
    */
    table.on('click', function () {
        alert('คลิกขวาเปิดเมนู');
    }, this);
    report.on('click', function () {
//        alert('คลิกขวาเปิดเมนู');
        window.parent.location.href = "../index.php#sp/find";
        window.parent.location.reload();
    }, this);
    table.on("mouseover", function () { }, this);
    table.on("contextmenu", function (e) {
        e.stopEvent();
        new Ext.menu.Menu({
            items: [
                {
                    text: "รายการสถานะของ PR",
                    icon: "../images/icons/book_magnify.png",
                    handler: function (e) {
                        window.open('../alert/index.php', 'Monitoring', 'fullscreen="yes"');
                    },
                    scope: this,
                }, {
                    text: "รายการสถานะ PO / งวด/รับของ/วางบิง/ตรวจรับ/เบิก",
                    icon: "../images/icons/book_magnify.png",
                    handler: function (e) {
                        window.open('../alert/period.php?_dc=' + Math.floor(Math.random() * 1000000000), 'Monitoring', 'fullscreen="yes"');
                    },
                    scope: this,

                }
            ],
        }).showAt(e.getXY());
    }, this);
    desktop.on('dblclick', function () {
        alert('console Ext.session');
        console.log(Ext.session);
    }, this);
    desktop.on("contextmenu", function (e) {
        e.stopEvent();
        new Ext.menu.Menu({
            items: [
                {

                    text: "Reload inframe",
                    icon: "../images/icons/page_white_refresh.png",
                    handler: function (e) {
                        window.location.reload();
                    },
                    scope: this,
                }, {
                    text: "แสดง/ปิด เมนูทั้งหมด",
                    icon: "../images/icons/arrow_nw_ne_sw_se.png",
                    handler: function (e) {
                        window.parent.Ext.getCmp('north').toggleCollapse(true);
                        window.parent.Ext.WestGlo.toggleCollapse(true);
                    },
                    scope: this,
                }],
        }).showAt(e.getXY());
    }, this);

    users.on("contextmenu", function (e) {
        e.stopEvent();

        Ext.storeForm = new Ext.data.JsonStore({
            autoDestroy: false,
            autoLoad: true,
            url: "api/dc/DAO/ListSp_emp.php",
            baseParams: {mode: "info", user_id: Ext.session.user_id},
            root: "data",
            idProperty: "sp_emp_id",
            fields: ["sp_emp_id", "c_name", "c_department", "c_position"],
        });
        Ext.storeUser = new Ext.data.JsonStore({
            autoDestroy: false,
            autoLoad: false,
            url: "api/dc/DAO/ListSp_emp.php",
            baseParams: {mode: "info", user_id: Ext.session.user_id},
            root: "data",
            idProperty: "sp_emp_id",
            fields: ["user_id", "user_name", "cost_name", "datetime"],
        });
        new Ext.menu.Menu({
            items: [
                {

                    text: "ข้อมูลรายละเอียดผู้ใช้งาน",
                    icon: "../images/icons/user_mature.png",
                    handler: function (e)
                    {

                        var win = new Ext.Window({
                            id: "win-pop-lov-infoID",
                            title: "แสดงข้อมูลของพนักงานพัสดุ",
                            modal: true,
                            plain: true,
                            layout: "fit",
                            maximizable: true,
                            constrainHeader: true,
                            closable: true,
                            frame: true,
                            listeners: {
                                afterrender: function (obj, eOpts) {
                                    this.fn = function (widht, height) {
                                        var width = Ext.getBody().getViewSize().width * widht;
                                        var height = Ext.getBody().getViewSize().height * height;
                                        this.setSize(width, height);
                                    };
                                    this.fn(0.5, 0.55);
                                    Ext.getCmp("formDisplayID").getForm().loadRecord(Ext.storeForm.data.items[0]);
                                    // Ext.getCmp('lastProcessID').hide();
                                },
                                maximize: function (window, opts) {
                                    window.expand("", false);
                                    window.center();
                                },
                            },
                            items: [{
                                    xtype: "form",
                                    id: "formDisplayID",
                                    labelWidth: 200,
                                    url: "api/dc/DAO/ListSp_emp.php",
                                    defaults: {bodyStyle: "padding-top:10px"},
                                    items: [{
                                            xtype: 'hidden', name: 'mode', value: 'post'
                                        }, {
                                            xtype: 'hidden', name: 'process', value: 'contract'
                                        }, {
                                            xtype: 'displayfield',
                                            fieldLabel: "ชื่อ-นามสกุล",
                                            name: 'c_name',
                                            value: 'เอก จ้า',
                                        }, {
                                            xtype: 'displayfield',
                                            fieldLabel: "ตำแหน่งงาน",
                                            name: 'c_position',
                                            value: 'หัวหน้า',
                                        }, {
                                            xtype: 'displayfield',
                                            fieldLabel: "สายงาน",
                                            name: 'c_department',
                                            value: 'สายงาน',
                                        }, {
                                            xtype: 'displayfield',
                                            fieldLabel: "process การทำงานเวลาล่าสุด",
                                            value: localStorage.getItem("lastProcess"),
                                            id: 'lastProcess2ID',
                                        }, {
                                            xtype: 'displayfield',
                                            fieldLabel: "process ที่เรียกดู ณ ขณะนี้",
                                            hidden: true,
                                            id: 'lastProcessID',

                                        }, {
                                            xtype: "radiogroup",
                                            columns: [100, 200],
                                            id: "i_is_warrantyID",
                                            name: "i_is_warranty",
                                            fieldLabel: "แจ้งเตือนฝ่านไลน์กลุ่ม",
                                            items: [
                                                {
                                                    name: "i_is_warranty",
                                                    inputValue: 1,
                                                    checked: true,
                                                    boxLabel: "แจ้งเตือน",
                                                },
                                                {
                                                    name: "i_is_warranty",
                                                    inputValue: 0,
                                                    boxLabel: "ไม่แจ้งเตือน",
                                                },
                                            ],
                                        }],
                                    buttonAlign: 'left',
                                    buttons: [{
                                            text: 'ปิด',
                                            handler: function () {
                                                Ext.getCmp("win-pop-lov-infoID").destroy();
                                            }
                                        }, {
                                            text: 'ดูสถานะ View Status',
                                            handler: function () {
                                                Ext.getBody().mask('ที่เรียกดู ณ ขณะนี้', 'loading');
                                                Ext.storeUser.setBaseParam("mode", "view");
                                                Ext.storeUser.setBaseParam("process", "contract");
                                                Ext.storeUser.load({
                                                    callback: function (rec, operation, success) {
                                                        if (success) {
                                                            Ext.Msg.alert("แจ้งเตือน", "View Status ");
                                                            Ext.getCmp('lastProcessID').show();
                                                            Ext.getCmp('lastProcessID').setValue(rec[0].get('datetime'));
                                                            Ext.getCmp('lastProcess2ID').setValue(localStorage.getItem("lastProcess"));
                                                            localStorage.setItem("lastProcess", rec[0].get('datetime'));
                                                            Ext.getBody().unmask();
                                                        }
                                                    },
                                                });
                                            }
                                        }, {
                                            text: 'สร้าง/แก้ไข สถานะ Create Status',
                                            handler: function () {

                                                var frm = Ext.getCmp('formDisplayID').getForm();
                                                if (frm.isValid()) {
                                                    frm.submit({
                                                        waitMsg: "Saving Data...",
                                                        success: function (form, action) {
                                                            Ext.Msg.alert("Success", "บันทึกเรียบร้อย", function (form, action) {
                                                                console.log(action);
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
                                                }
                                            }
                                        }]
                                }]
                        });
                        win.show();
                    },
                    scope: this

                }, {
                    text: "แก้ไขรหัสผ่าน",
                    icon: "../images/icons/user_mature.png",
                    handler: function (e)
                    {

                        window.parent.location.href = "../index.php#sp/info";
                        window.parent.location.reload();
                    },
                    scope: this
                }
            ],
        }).showAt(e.getXY());
    }, this);


    pdf.on("contextmenu", function (e) {
        e.stopEvent();
        var linkDownload = window.location.protocol + '//' + window.location.hostname + '/sp_mn/api/video';
        new Ext.menu.Menu({
            items: [
                {
                    text: "video การสอน",
                    icon: "../images/icons/page_white_visualstudio.png",
                    handler: function (e) {
                        Ext.buAct = "FlowcartLv1";
                        window.open(linkDownload + '/manualSupplies.mp4', 'Monitoring', 'fullscreen="yes"');
                    },
                    scope: this,
                },
                {
                    text: "คู่มือระบบพัสดุ",
                    icon: "../images/icons/icon_pdf.png",
                    handler: function (e) {
                        Ext.buAct = "FlowcartLv2";
                        window.open('../sp/pdf/manualSupplies.pdf', 'Monitoring', 'fullscreen="yes"');
                    },
                    scope: this,
                },
                {
                    text: "คู่มือการจองเงิน PR",
                    icon: "../images/icons/icon_pdf.png",
                    handler: function (e) {
                        Ext.buAct = "FlowcartLv2";
                        window.open('../sp/pdf/reserve money.pdf', 'Monitoring', 'fullscreen="yes"');
                    },
                    scope: this,
                },
                {
                    text: "คู่มือการสร้างรายการแบบไม่มี PR",
                    icon: "../images/icons/icon_pdf.png",
                    handler: function (e) {
                        Ext.buAct = "FlowcartLv2";
                        window.open('../sp/pdf/NoTor.pdf', 'Monitoring', 'fullscreen="yes"');
                    },
                    scope: this,
                },
            ],
        }).showAt(e.getXY());
    }, this);
    buWarranty.on("contextmenu", function (e) {
        e.stopEvent();
        new Ext.menu.Menu({
            items: [
                {
                    text: "รายละเอียดทั้งหมด การรับประกันสินค้า",
                    icon: "../images/icons/book_magnify.png",
                    handler: function (e) {
                        Ext.buAct = "viewAllWarranty";
                        console.log(Ext.buAct);
                    },
                    scope: this,
                },
                {
                    text: "จัดการข้อมูล การรับประกันสินค้า",
                    icon: "../images/icons/application_edit.png",
                    handler: function (e) {

                    },
                    scope: this,
                }, {
                    text: "หยุดการโหลดข้อมูลแจ้งเตือน",
                    icon: "../images/icons/pause_green.png",
                    handler: function (e) {
                        Ext.runner.stopAll();
                        localStorage.setItem("runWarranty", 0);
                        Ext.fly('warranty_notif').update('หยุดการโหลด หมดรับรับประกัน');
                        headerId.hide();
                    },
                    scope: this,
                }, {
                    text: "เริ่มการโหลดข้อมูลแจ้งเตือน",
                    icon: "../images/icons/cog_start.png",
                    handler: function (e) {
                        Ext.runner.start(Ext.task);
                        localStorage.setItem("runWarranty", 1);
                        Ext.fly('warranty_notif').update('หมดรับรับประกัน');
                        headerId.show();
                    },
                    scope: this,
                }
            ],
        }).showAt(e.getXY());
    }, this);
});