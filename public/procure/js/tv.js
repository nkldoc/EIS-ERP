
Ext.onReady(function () {
    Ext.QuickTips.init();
//    Ext.ipServer = "localhost";
//    Ext.ipServer = "192.168.110.143";
    Ext.websocket = new WebSocket("ws://" + Ext.ipServer + ":9002/demo/serverTv.php");
    var el = document.body;
    var xg = Ext.grid;
    Ext.desktop = Ext.get('x-desktop');
    Ext.msgAlert = function (msg, st, et, news) {
        var welcome = new Ext.Window({
            collapsible: true,
            maximizable: true,
            title: "แจ้งเตือนหน้าจอ",
            id: "winMain",
            width: 600,
            height: 200,
            layout: "fit",
            modal: true,
            plain: true,
            bodyStyle: "padding:1px;",
            html: '<div id="msgID">' + msg + '</div>',
            listeners: {
                afterrender: function () {
//                    Ext.get('msgID').dom.style['color'] = 'red';
                    Ext.get('msgID').dom.style['fontSize'] = '2em';
                    Ext.get('msgID').dom.style['fontWeight'] = "bold";

                }
            }
        });
        setTimeout(function () {
            welcome.show();
            welcome.getEl().fadeIn();

        }, st);
        setTimeout(function () {
            welcome.getEl().fadeOut();
            welcome.destroy();

        }, et);
    };
    Ext.msgAlert('เริ่มต้นหน้าจอใหม่', 0, 5000);



    function reload() {
        window.location.reload();
    }
    Ext.desktop.on('click', function () {

    }, this);


    ////////////////////////////////////////////////////////////////////////////////////////
    // Grid 1
    ////////////////////////////////////////////////////////////////////////////////////////    
    Ext.grid1 = function (f, a, ranTo,hf) {
        var wf = f ? f : 600;
        var hf = f ? hf : 298;
        var al = a ? a : false;
        var rdt = ranTo ? ranTo : 'grid11ID';
        Ext.store1 = new Ext.data.JsonStore({
            autoLoad: al,
            storeId: "myuserOnline1",
            url: "./alert/api/userOnline.php",
            baseParams: { mode: "Pr_Examine",},
            root: "data",
            idProperty: "socket",
            totalProperty: "totalCount",
            fields: [
                    "no", 
                    "id", 
                    "tor_id", 
                    "c_code", 
                    "c_name", 
                    "sp_emp", 
                    "sp_emp_id", 
                    "sp_status", 
                    "dc_departnent", 
                    "f_total_amt",
                    "d_status"
                ]
        });
        return new xg.GridPanel({
            id: 'grid1ID',
            store: Ext.store1,
            stripeRows: true,
            viewConfig: {
                getRowClass: function (record, rowIndex, rowParams, store) {
                    return (record.get('no') % 2) ? 'child-row' : 'adult-row';
                },
                stripeRows: false
            },
            cm: new xg.ColumnModel({
                defaults: {
                    width: 110,
                    sortable: true
                },
                columns: [
//                    sm2,
//                    {header: "No.", width: 50, dataIndex: 'no'},
                    // {header: "ลำดับ", dataIndex: 'no',align: "center",width: 50 },
                    {header: "PR", dataIndex: 'c_code', width: 120},
                    {header: "ชื่อรายการ", dataIndex: 'c_name'},
                    // {id: 'id', width: 50, header: "รหัสพนักงาน", dataIndex: 'id'},
                    {header: "ชื่อพนักงาน", dataIndex: 'sp_emp'},
                    {header: "เมนู", width: 150, dataIndex: 'sp_status'},
                    {header: "วันที่", dataIndex: 'd_status'},
                    // {header: "เวลา", width: 150, dataIndex: 'datetime'},
                    // {id: 'id', width: 50, header: "รหัสพนักงาน", dataIndex: 'id'},
                ]
            }),
//            sm: sm2,
            columnLines: true,
            width: wf,
            height: hf,
            frame: true,
            title: 'รายการ PR ก่อนจองเงิน',
            iconCls: 'icon-grid',
            renderTo: rdt,
//        bbar: new Ext.PagingToolbar({
//            pageSize: 10000,
//            store: userOnline1,
//            displayInfo: true,
//            displayMsg: "Displaying topics {0} - {1} of {2}",
//        }),
            listeners: {
                viewready: function (g) {
//                    g.getView().getRow(1).style.color = "#f30";
                    console.log(g.getView());
                },
                afterrender: function () {

                }
            }
        });
    };
//    ////////////////////////////////////////////////////////////////////////////////////////
//    // Grid 2
//    ////////////////////////////////////////////////////////////////////////////////////////     


    Ext.grid2 = function (f, a, ranTo,hf) {
        var wf = f ? f : 600;
        var hf = f ? hf : 298;
        var al = a ? a : false;
        var rdt = ranTo ? ranTo : 'grid12ID';
        Ext.userOnline2 = new Ext.data.JsonStore({
            autoLoad: al,
            storeId: "myuserOnline2",
            url: "./alert/api/userOnline.php",
            baseParams: {mode: "PR_Approve_Money"},
            root: "data",
            idProperty: "socket",
            totalProperty: "totalCount",
            fields: [
                "no", 
                "id", 
                "tor_id", 
                "c_code", 
                "c_name", 
                "sp_emp", 
                "sp_emp_id", 
                "sp_status", 
                "dc_departnent", 
                "f_total_amt",
                "d_status"
            ]
        });
        return new xg.GridPanel({
            id: 'grid2ID',
            store: Ext.userOnline2,
            viewConfig: {
                getRowClass: function (record, rowIndex, rowParams, store) {
                    return (record.get('no') % 2) ? 'child-row' : 'adult-row';
                },
                stripeRows: false
            },
            cm: new xg.ColumnModel({
                defaults: {
                    width: 110,
                    sortable: true
                },
                columns: [
//                     sm2,
//                    {header: "No.", width: 50, dataIndex: 'no'},
                    // {header: "ลำดับ", dataIndex: 'no',align: "center",width: 50 },
                    {header: "PR", dataIndex: 'c_code', width: 120},
                    {header: "ชื่อรายการ", dataIndex: 'c_name'},
                    // {id: 'id', width: 50, header: "รหัสพนักงาน", dataIndex: 'id'},
                    {header: "ชื่อพนักงาน", dataIndex: 'sp_emp'},
                    {header: "เมนู", width: 150, dataIndex: 'sp_status'},
                    {header: "วันที่", dataIndex: 'd_status'},
                    // {header: "เวลา", width: 150, dataIndex: 'datetime'},
                    // {id: 'id', width: 50, header: "รหัสพนักงาน", dataIndex: 'id'},

                ]
            }),
//            sm: sm2,
            columnLines: true,
            width: wf,
            height: hf,
            frame: true,
            title: 'รายการ PR จองเงินแล้วแต่ยังไม่ทำสัญญา',
            iconCls: 'icon-grid',
            renderTo: rdt
//        bbar: new Ext.PagingToolbar({
//            pageSize: 10000,
//            store: userOnline2,
//            displayInfo: true,
//            displayMsg: "Displaying topics {0} - {1} of {2}",
//        }),
        });
    };
//    ////////////////////////////////////////////////////////////////////////////////////////
//    // Grid 3
//    //////////////////////////////////////////////////////////////////////////////////////// 
    Ext.grid3 = function (f, a, ranTo,hf) {
        var wf = f ? f : 600;
        var hf = f ? hf : 298;
        var al = a ? a : false;
        var rdt = ranTo ? ranTo : 'grid13ID';
        Ext.userOnline3 = new Ext.data.JsonStore({
            autoLoad: al,
            storeId: "myuserOnline2",
            url: "./alert/api/userOnline.php",
            baseParams: {mode: "PR_Approve_Money"},
            root: "data",
            idProperty: "socket",
            totalProperty: "totalCount",
            fields: [
                "no", 
                "id", 
                "tor_id", 
                "c_code", 
                "c_name", 
                "sp_emp", 
                "sp_emp_id", 
                "sp_status", 
                "dc_departnent", 
                "f_total_amt",
                "d_status"
            ]
        });
        return new xg.GridPanel({
            id: 'grid3ID',
            store: Ext.userOnline3,
            viewConfig: {
                getRowClass: function (record, rowIndex, rowParams, store) {
                    return (record.get('no') % 2) ? 'child-row' : 'adult-row';
                },
                stripeRows: false
            },
            cm: new xg.ColumnModel({
                defaults: {
                    width: 110,
                    sortable: true
                },
                columns: [
//                    sm2,
//                    {header: "No.", width: 50, dataIndex: 'no'},
                    {id: 'CODE', width: 50, header: "รหัสพนักงาน", dataIndex: 'id'},
                    {header: "ชื่อพนักงาน", dataIndex: 'c_name'},
                    {header: "เมนู", width: 150, dataIndex: 'menuname'},
                    {header: "เวลา", width: 150, dataIndex: 'datetime'},
                    {header: "SOCKET", dataIndex: 'socket'}

                ]
            }),
//            sm: sm2,
            columnLines: true,
            width: wf,
            height: hf,
            frame: true,
            title: 'สัญญาที่รับของแล้วรอตรวจรับ',
            iconCls: 'icon-grid',
            renderTo: rdt
//        bbar: new Ext.PagingToolbar({
//            pageSize: 10000,
//            store: userOnline3,
//            displayInfo: true,
//            displayMsg: "Displaying topics {0} - {1} of {2}",
//        }),

        });
    };
//    ////////////////////////////////////////////////////////////////////////////////////////
//    // Grid 4
//    ////////////////////////////////////////////////////////////////////////////////////////     
    Ext.grid4 = function (f, a, ranTo,hf) {
        var wf = f ? f : 600;
        var hf = f ? hf : 298;
        var al = a ? a : false;
        var rdt = ranTo ? ranTo : 'grid14ID';
        Ext.userOnline4 = new Ext.data.JsonStore({
            autoLoad: al,
            storeId: "myuserOnline2",
            url: "./alert/api/userOnline.php",
            baseParams: {mode: "PR_Approve_Money"},
            root: "data",
            idProperty: "socket",
            totalProperty: "totalCount",
            fields: [
                "no", 
                "id", 
                "tor_id", 
                "c_code", 
                "c_name", 
                "sp_emp", 
                "sp_emp_id", 
                "sp_status", 
                "dc_departnent", 
                "f_total_amt",
                "d_status"
            ]
        });
        return new xg.GridPanel({
            id: 'grid4ID',
            store: Ext.userOnline4,
            viewConfig: {
                getRowClass: function (record, rowIndex, rowParams, store) {
                    return (record.get('no') % 2) ? 'child-row' : 'adult-row';
                },
                stripeRows: false
            },
            cm: new xg.ColumnModel({
                defaults: {
                    width: 110,
                    sortable: true
                },
                columns: [
//                    sm2,
//                    {header: "No.", width: 50, dataIndex: 'no'},
                    {id: 'CODE', width: 50, header: "รหัสพนักงาน", dataIndex: 'id'},
                    {header: "ชื่อพนักงาน", dataIndex: 'c_name'},
                    {header: "เมนู", width: 150, dataIndex: 'menuname'},
                    {header: "เวลา", width: 150, dataIndex: 'datetime'},
                    {header: "SOCKET", dataIndex: 'socket'}

                ]
            }),
//            sm: sm2,
            columnLines: true,
            width: wf,
            height: hf,
            frame: true,
            title: 'สัญญาที่ตรวจรับแล้วยังไม่ส่งเบิก',
            iconCls: 'icon-grid',
            renderTo: rdt
//        bbar: new Ext.PagingToolbar({
//            pageSize: 10000,
//            store: userOnline4,
//            displayInfo: true,
//            displayMsg: "Displaying topics {0} - {1} of {2}",
//        }),
        });
    };

    var newFn = function (n, a) {
        var grid1 = Ext.grid1(n, a);
        var grid2 = Ext.grid2(n, a);
        var grid3 = Ext.grid3(n, a);
        var grid4 = Ext.grid4(n, a);
        
        grid1.getEl().fadeIn();
        grid2.getEl().fadeIn();
        grid3.getEl().fadeIn();
        grid4.getEl().fadeIn();
    };
    var newFnDouble= function (n, a) {
        var grid1 = Ext.grid1(1260, true, 'grid11ID',300);
        var grid2 = Ext.grid2(1260, true, 'grid12ID',300);

        // var grid4 = Ext.grid4(n, a);
        
        grid1.getEl().fadeIn();
        // grid2.getEl().fadeIn();
        grid2.getEl().fadeIn();
        // grid4.getEl().fadeIn();
    };
    var destroyFn = function () {
        if (!Ext.isEmpty(Ext.getCmp('grid1ID')))
            Ext.getCmp('grid1ID').destroy();
        if (!Ext.isEmpty(Ext.getCmp('grid2ID')))
            Ext.getCmp('grid2ID').destroy();
        if (!Ext.isEmpty(Ext.getCmp('grid3ID')))
            Ext.getCmp('grid3ID').destroy();
        if (!Ext.isEmpty(Ext.getCmp('grid4ID')))
            Ext.getCmp('grid4ID').destroy();
    };
    var sm2 = new xg.CheckboxSelectionModel();
//    
    setTimeout(function () {
        newFn(false, false);
    }, 5000);
    Ext.websocket.onmessage = function (ev) {
        var response = JSON.parse(ev.data);
        var status = response.status; //message text
        var message = response.message; //message text
        var msgText = response.msgText; //message text

        if (status === "scriptTv") {
            Ext.get("player").dom.play();

            if (message === 'g1-full') {
                destroyFn();
                var grid1 = Ext.grid1(1250, true, 'grid11ID',600);
                grid1.getEl().fadeIn();
            } else if (message === 'g2-full') {
                destroyFn();
                var grid1 = Ext.grid2(1250, true, 'grid11ID',500);
                 grid1.getEl().fadeIn();
            } else if (message === 'g3-full') {
                destroyFn();
                var grid1 = Ext.grid3(1250, true, 'grid11ID',500);
                 grid1.getEl().fadeIn();
            } else if (message === 'g4-full') {
                destroyFn();
                var grid1 = Ext.grid4(1250, true, 'grid11ID',500);
                 grid1.getEl().fadeIn();
            }else if (message === 'g-full') {
                Ext.get("player").dom.src="./sound/notifications-sound.mp3"; 
                destroyFn();
                newFn(false, true); 
            }else if (message === 'g12-full') {
                Ext.get("player").dom.src="./sound/notifications-sound.mp3"; 
                destroyFn();
                newFnDouble(true, true);
            } else {
                Ext.get("player").dom.src="./sound/success-trumpets.mp3"; 
                if (message === "reload-g1" || message === "reload-all") {
                    var idCmp = 'grid1ID';
//                            new Audio('./sound/success-trumpets.mp3').play();
                    Ext.getCmp(idCmp).getEl().mask("ที่เรียกดู ณ ขณะนี้...", "x-mask-loading");
                    Ext.getCmp(idCmp).store.reload({
                        callback: function (record, operation, success) {
                            if (success) {
                                Ext.getCmp(idCmp).getEl().unmask();
                            }
                        }
                    });
                }
                if (message === "reload-g2" || message === "reload-all") {
                    var idCmp2 = 'grid2ID';
                    Ext.getCmp(idCmp2).getEl().mask("ที่เรียกดู ณ ขณะนี้...", "x-mask-loading");
                    Ext.getCmp(idCmp2).store.reload({
                        callback: function (record, operation, success) {
                            if (success) {
                                Ext.getCmp(idCmp2).getEl().unmask();
                            }
                        }
                    });
                }
                if (message === "reload-g3" || message === "reload-all") {
                    var idCmp3 = 'grid3ID';
                    Ext.getCmp(idCmp3).getEl().mask("ที่เรียกดู ณ ขณะนี้...", "x-mask-loading");
                    Ext.getCmp(idCmp3).store.reload({
                        callback: function (record, operation, success) {
                            if (success) {
                                Ext.getCmp(idCmp3).getEl().unmask();
                            }
                        }
                    });
                }
                if (message === "reload-g4" || message === "reload-all") {
                    var idCmp4 = 'grid4ID';
                    Ext.getCmp(idCmp4).getEl().mask("ที่เรียกดู ณ ขณะนี้...", "x-mask-loading");
                    Ext.getCmp(idCmp4).store.reload({
                        callback: function (record, operation, success) {
                            if (success) {
                                Ext.getCmp(idCmp4).getEl().unmask();
                            }
                        }
                    });
                }
                if (message === "msg") {
                    Ext.get('top').dom.innerHTML = msgText;
//                    Ext.get('top').dom.style['color'] = 'red';
                    Ext.msgAlert(msgText, 0, 6000);

                } else if (message === "close") {
                } else if (message === "reload") {
                    reload();
                }
            }

        }
    };
});