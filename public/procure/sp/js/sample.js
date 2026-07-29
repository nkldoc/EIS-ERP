// Sample desktop configuration

 MyDesktop = new Ext.app.App({
     init: function () {
         Ext.QuickTips.init();
         Ext.refreshTask = null;
         Ext.interVal = 10; // 10 min 
         Ext.runnerGrid = new Ext.util.TaskRunner();

     },
     getModules: function () {
         return [
             new MyDesktop.TorWin(), // TOR
             new MyDesktop.ContractWin(), //Contract
              new MyDesktop.HelpWindow(),
             new MyDesktop.AccordionWindow(),
//             new MyDesktop.GridWindow(),
//             new MyDesktop.TabWindow()
         ];
     },
     // config for the start menu
     getStartConfig: function () {
         return {
             title: 'รายการเมนู',
             iconCls: 'user',
             toolItems: [{
                text: 'Exce Bat',
                iconCls: 'settings',
                handler: function () {
      
                    if (st === "DEL") {
                        Ext.Ajax.request({
                            url: "tor/api/mnCheckingController.php",
                            params: {
                                mode: "exce",
                                name: "chat",
                            },
                            method: "POST", //POST
                            success: function (result, request) {
                                var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                                console.log(jsonData);
                                if (jsonData.success) {
                                    Ext.MessageBox.alert("Success", "ทำการลบรายการเรียบร้อยแล้ว", function () {
                                    
                                    });
                                } else {
                                    Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                                }
                            },
                            failure: function (result, request) {
                                Ext.MessageBox.alert("Failed", result.responseText); // connect error
                            },
                        });
                    }
                },
                scope: this
            }, '-',{
                     text: 'ตั้งค่าหน้าจอ',
                     iconCls: 'settings',
                     handler: function () {
                         var href = "./dashBoard.php";
                         var resultUrl = "";

                         window.open(href + resultUrl, href);
                         window.focus();
                     },
                     scope: this
                 }, '-', {
                     text: 'ข้อมูลผู้ใช้',
                     iconCls: 'icon-user-edit',
                     handler: function () {

                     },
                     scope: this
                 }, {
                     text: 'Logout',
                     iconCls: 'logout',
                     handler: function () {
                         window.top.location.href = '../access/logout.php';
                     },
                     scope: this
                 
                    } , {
                        text: 'STOP NODE ALL',
                        iconCls: 'logout',
                        handler: function () {
                            window.top.location.href = '../access/logout.php';
                        },
                        scope: this      
                 }]
         };
     }
 });
 
 MyDesktop.TorWin = Ext.extend(Ext.app.Module, {
     id: 'work-tor-win',
     init: function () {
         this.launcher = {
             text: 'แสดงการสถานะ TOR',
             iconCls: 'icon-grid',
             handler: this.createWindow,
             scope: this
         };
     },
     createWindow: function () {
         var desktop = this.app.getDesktop();
         var win = desktop.getWindow('work-tor-win');
         var menu = new Ext.menu.Menu({
             items: [{
                     text: 'เปิดดูเต็มจอ',
                     handler: function ( ) {
                         window.open('#', 'Monitoring', 'fullscreen="yes"');
                     }
                 }, '-', {
                     text: '10 วินาที',
                     checked: true,
                     group: 'opts',
                     handler: function ( ) {
                         Ext.interVal = 10;
                         Ext.getCmp('updateCount').setValue('ข้อมูลจะเปลี่ยนแปลงทุก ' + Ext.interVal + ' วินาที');
                         Ext.refreshTask.interval = Ext.interVal * 1000;
                     }
                 }, {
                     text: '5 วินาที',
                     checked: false,
                     group: 'opts',
                     handler: function ( ) {
                         Ext.interVal = 5;
                         Ext.getCmp('updateCount').setValue('ข้อมูลจะเปลี่ยนแปลงทุก ' + Ext.interVal + ' วินาที');
                         Ext.refreshTask.interval = Ext.interVal * 1000;
                     }
                 }, {
                     text: '3 วินาที',
                     checked: false,
                     group: 'opts',
                     handler: function ( ) {
                         Ext.interVal = 3;
                         Ext.getCmp('updateCount').setValue('ข้อมูลจะเปลี่ยนแปลงทุก ' + Ext.interVal + ' วินาที');
                         Ext.refreshTask.interval = Ext.interVal * 1000;
                     }
                 }, '-', {
                     text: 'Sub-items',
                     menu: new Ext.menu.Menu({
                         items: [{text: 'Item 1'}, {text: 'Item 2'}]
                     })
                 }]
         });


         Ext.store = new Ext.data.JsonStore({
             autoDestroy: true,
             autoLoad: true,
             url: "../alert/api/mnTorController.php",
             baseParams: {
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

         if (!win) {
             win = desktop.createWindow({
                 id: 'work-tor-win',
                 title: 'แสดงการสถานะ TOR',
                 width: 1020,
                 height: 480,
                 iconCls: 'icon-grid',
                 shim: false,
                 animCollapse: false,
                 constrainHeader: true,
                 layout: 'fit',
                 items: [{
                         id: 'gridID',
                         xtype: 'grid',
                         store: Ext.store,
                         listeners: {
                             afterrender: function ( ) {

                                 ///------------grid
                                 var store = Ext.getCmp('gridID').getStore(); // your grid instance
                                 Ext.refreshTask = {
                                     run: function ( ) {
                                         store.reload({
                                             callback: function (record, operation, success)
                                             {
                                                 if (success)
                                                 {

                                                     if (record.length < Ext.interVal)
                                                         Ext.getCmp("gridID").getSelectionModel( ).selectRow(0);
                                                     else
                                                         Ext.getCmp("gridID").getSelectionModel( ).selectRow(parseInt(Ext.interVal) - 1);

                                                 }
                                             }
                                         });
                                     },
                                     id: 'runID',
                                     interval: Ext.interVal * 1000 // 1 Minute
                                 };


                                 this.fn = function (i) {
                                     !i ? Ext.runnerGrid.stop(Ext.refreshTask) : Ext.runnerGrid.start(Ext.refreshTask);
                                 };
                                 this.fn(Ext.getCmp('stID').pressed);
                             }

                         },
                         columns: [
                             new Ext.grid.RowNumberer({
                                 header: "ที่",
                                 width: 30,
                                 renderer: function (value, metaData, record, row, col, store, gridView) {
                                     metaData.attr = "style='text-align: center;font-weight:bold;'";
                                     return record.get("no");
                                 }
                             }),
                             {
                                 id: "c_codeID",
                                 header: "รหัส TOR",
                                 sortable: false,
                                 align: "center",
                                 dataIndex: "c_code",
                                 renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                     metaData.attr = "style='text-align: center;font-weight:bold;'";
                                     return value;
                                 }
                             }, {
                                 header: "สถานะรายการ TOR", //DateDiff d_tor_date_alert d_tor_date_pa d_tor_status_date DateDiff
                                 sortable: false,
                                 align: "left",
                                 id: "c_name_statusID",
                                 width: 220,
                                 dataIndex: "c_name_status",
                                 renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                     // metaData.attr = "style='text-align: center;'";
                                     return record.get('c_code_status') + ' ' + value;
                                 }
                             }, {
                                 id: "c_name",
                                 header: "รายการ",
                                 sortable: false,
                                 width: 200,
                                 align: "left",
                                 dataIndex: "c_name",
                                 renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                     // metaData.attr = "style='text-align: center;'";
                                     return value;
                                 }
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
                                 header: "วันที่บันทึกสถานะ",
                                 sortable: false,
                                 width: 170,
                                 align: "center",
                                 dataIndex: "d_tor_status_date"
                             }, {
                                 header: "วันที่ครบกำหนดแจ้งเตือน",
                                 sortable: false,
                                 width: 170,
                                 align: "center",
                                 dataIndex: "d_tor_date_alert"

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
                         //autoExpandColumn: "c_name",
                         //bbar: Ext.pagingBar,
                         stripeRows: true,
                         loadMask: false,
                         height: 520,
                         width: 800,
                         viewConfig: {
                             getRowClass: function (record, index, rowParams, ds) {
                                 return record.get('no') == 10 ? 'background-color: #000' : '';
                             }
                         },
                         tbar: ['-', {
                                 text: 'ตั้งค่า',
                                 id: 'menu-btn',
                                 menu: menu
                             }, {
                                 xtype: 'displayfield',
                                 value: 'ข้อมูลจะเปลี่ยนแปลงทุก ' + Ext.interVal + ' วินาที',
                                 id: 'updateCount',
                                 style: "font-size:18px; color:blue; font-weight:bold;padding:10px 10px 0 15px"
                             }, '-',
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
                             new Ext.form.TwinTriggerField({
                                 xtype: 'twintriggerfield',
                                 trigger1Class: 'x-form-clear-trigger',
                                 trigger2Class: 'x-form-search-trigger',
                                 emptyText: 'รหัสที่ค้นหา',
                                 onTrigger2Click: function ( ) {
                                     //loadMask: false,
                                     var txt = this.getValue();
                                     var store = Ext.getCmp('gridID').getStore();
                                     store.setBaseParam("value", txt);
                                     store.setBaseParam("act", "SEARCH");
                                     store.reload({
                                         callback: function (record, operation, success)
                                         {
                                             if (success)
                                             {
                                                 Ext.getCmp("gridID").getSelectionModel( ).selectRow(1);
                                             }
                                         }
                                     });

                                 },
                                 onTrigger1Click: function ( ) {
                                     this.setValue(null);
                                     Ext.getCmp("gridID").getSelectionModel( ).selectRow(0);
                                 }
                             })
                         ]
                     }],
                 listeners: {

                     close: function ( ) {
                         Ext.runnerGrid.stop(Ext.refreshTask);
                     }

                 },
                 viewConfig: {
                     forceFit: true
                 }
             });
         }
         win.show();
     }
 });
 MyDesktop.ContractWin = Ext.extend(Ext.app.Module, {
     id: 'work-win',
     init: function () {
         this.launcher = {
             text: 'แสดงข้อมูลสถานะสัญญา',
             iconCls: 'icon-grid',
             handler: this.createWindow,
             scope: this
         };
     },
     createWindow: function () {
         var desktop = this.app.getDesktop();
         var win = desktop.getWindow('work-win'); 
         if (!win) {
             win = desktop.createWindow({
                 id: 'work-win',
                 title: 'แสดงข้อมูลสถานะสัญญา',
                 width: 740,
                 height: 480,
                 iconCls: 'icon-grid',
                 shim: false,
                 animCollapse: false,
                 constrainHeader: true,
                 layout: 'fit',
                 items: [{
                         xtype: 'panel', id: 'gridTorID'
                     }], 
                 listeners: {
                     afterrender: function () {
                         Ext.getCmp("gridTorID").update('<iframe src="./getStatusTor.php" frameborder="0" width="100%" height="100%"></iframe>');
                     } 
                 },
                 viewConfig: {
                     forceFit: true
                 } 
             });
         }
         win.show();
     }
 }); //iframe
 MyDesktop.GridWindow = Ext.extend(Ext.app.Module, {
     id: 'grid-win',
     init: function () {
         this.launcher = {
             text: 'แสดงข้อมูล Grid Win',
             iconCls: 'icon-grid',
             handler: this.createWindow,
             scope: this
         };
     },

     createWindow: function () {
         var desktop = this.app.getDesktop();
         var win = desktop.getWindow('grid-win');
         if (!win) {
             win = desktop.createWindow({
                 id: 'grid-win',
                 title: 'Grid Window Title',
                 width: 740,
                 height: 480,
                 iconCls: 'icon-grid',
                 shim: false,
                 animCollapse: false,
                 constrainHeader: true,

                 layout: 'fit',
                 items: new Ext.grid.GridPanel({
                     border: false,
                     ds: new Ext.data.Store({
                         reader: new Ext.data.ArrayReader({}, [
                             {name: 'company'},
                             {name: 'price', type: 'float'},
                             {name: 'change', type: 'float'},
                             {name: 'pctChange', type: 'float'}
                         ]),
                         data: Ext.grid.dummyData
                     }),
                     cm: new Ext.grid.ColumnModel([
                         new Ext.grid.RowNumberer(),
                         {header: "Company", width: 120, sortable: true, dataIndex: 'company'},
                         {header: "Price", width: 70, sortable: true, renderer: Ext.util.Format.usMoney, dataIndex: 'price'},
                         {header: "Change", width: 70, sortable: true, dataIndex: 'change'},
                         {header: "% Change", width: 70, sortable: true, dataIndex: 'pctChange'}
                     ]),

                     viewConfig: {
                         forceFit: true
                     },
                     //autoExpandColumn:'company',

                     tbar: [{
                             text: 'Add Something',
                             tooltip: 'Add a new row',
                             iconCls: 'add'
                         }, '-', {
                             text: 'Options',
                             tooltip: 'Blah blah blah blaht',
                             iconCls: 'option'
                         }, '-', {
                             text: 'Remove Something',
                             tooltip: 'Remove the selected item',
                             iconCls: 'remove'
                         }]
                 })
             });
         }
         win.show();
     }
 });
 MyDesktop.TabWindow = Ext.extend(Ext.app.Module, {
     id: 'tab-win',
     init: function () {
         this.launcher = {
             text: 'แสดงข้อมูล Tab',
             iconCls: 'tabs',
             handler: this.createWindow,
             scope: this
         };
     },

     createWindow: function () {
         var desktop = this.app.getDesktop();
         var win = desktop.getWindow('tab-win');

         if (!win) {
             win = desktop.createWindow({
                 id: 'tab-win',
                 title: 'Tab Window',
                 width: 740,
                 height: 480,
                 iconCls: 'tabs',
                 shim: false,
                 animCollapse: false,
                 border: false,
                 constrainHeader: true,
                 layout: 'fit',
                 items:
                         new Ext.TabPanel({
                             activeTab: 0,

                             items: [{
                                     title: 'Tab Text 1',
                                     header: false,
//                                  html : '<p>Something useful would be in here.</p>' ,
                                     id: 'tabText1ID',
                                     border: false
                                 }, {
                                     title: 'Tab Text 2',
                                     header: false,
                                     html: '<p>Something useful would be in here.</p>',
                                     border: false
                                 }, {
                                     title: 'Tab Text 3',
                                     header: false,
                                     html: '<p>Something useful would be in here.</p>',
                                     border: false
                                 }, {
                                     title: 'Tab Text 4',
                                     header: false,
                                     html: '<p>Something useful would be in here.</p>',
                                     border: false
                                 }]
                         })
             });
         }
         win.show();
     }
 });
 MyDesktop.AccordionWindow = Ext.extend(Ext.app.Module, {
     id: 'acc-win',
     init: function () {
         this.launcher = {
             text: 'SETTING BAT FILES',
             iconCls: 'accordion',
             handler: this.createWindow,
             scope: this
         };
     },
     createWindow: function () {
         var desktop = this.app.getDesktop();
         var win = desktop.getWindow('acc-win');
         if (!win) {
             win = desktop.createWindow({
                 id: 'acc-win',
                 title: 'Accordion Window',
                 width: 250,
                 height: 400,
                 iconCls: 'accordion',
                 shim: false,
                 animCollapse: false,
                 constrainHeader: true,
                 tbar: [{
                         tooltip: {title: 'Rich Tooltips', text: 'Let your users know what they can do!'},
                         iconCls: 'connect'
                     }, '-', {
                         tooltip: 'Add a new user',
                         iconCls: 'user-add'
                     }, ' ', {
                         tooltip: 'Remove the selected user',
                         iconCls: 'user-delete'
                     }], 
                 layout: 'accordion',
                 border: false,
                 layoutConfig: {
                     animate: false
                 },

                 items: [
                     new Ext.tree.TreePanel({
                         id: 'im-tree',
                         title: 'Online Users',
                         loader: new Ext.tree.TreeLoader(),
                         rootVisible: false,
                         lines: false,
                         autoScroll: true,
                         tools: [{
                                 id: 'refresh',
                                 on: {
                                     click: function () {
                                         var tree = Ext.getCmp('im-tree');
                                         tree.body.mask('Loading', 'x-mask-loading');
                                         tree.root.reload();
                                         tree.root.collapse(true, false);
                                         setTimeout(function () { // mimic a server call
                                             tree.body.unmask();
                                             tree.root.expand(true, true);
                                         }, 1000);
                                     }
                                 }
                             }],
                         root: new Ext.tree.AsyncTreeNode({
                             text: 'Online',
                             children: [{
                                     text: 'Friends',
                                     expanded: true,
                                     children: [{
                                             text: 'Jack',
                                             iconCls: 'user',
                                             leaf: true
                                         }, {
                                             text: 'Brian',
                                             iconCls: 'user',
                                             leaf: true
                                         }, {
                                             text: 'Jon',
                                             iconCls: 'user',
                                             leaf: true
                                         }, {
                                             text: 'Tim',
                                             iconCls: 'user',
                                             leaf: true
                                         }, {
                                             text: 'Nige',
                                             iconCls: 'user',
                                             leaf: true
                                         }, {
                                             text: 'Fred',
                                             iconCls: 'user',
                                             leaf: true
                                         }, {
                                             text: 'Bob',
                                             iconCls: 'user',
                                             leaf: true
                                         }]
                                 }, {
                                     text: 'Family',
                                     expanded: true,
                                     children: [{
                                             text: 'Kelly',
                                             iconCls: 'user-girl',
                                             leaf: true
                                         }, {
                                             text: 'Sara',
                                             iconCls: 'user-girl',
                                             leaf: true
                                         }, {
                                             text: 'Zack',
                                             iconCls: 'user-kid',
                                             leaf: true
                                         }, {
                                             text: 'John',
                                             iconCls: 'user-kid',
                                             leaf: true
                                         }]
                                 }]
                         })
                     }), {
                         title: 'chat',
                         html: '<p>Something useful would be in here.</p>',
                         autoScroll: true
                     }, {
                         title: 'run worker nitification',
                         html: '<p>Something useful would be in here.</p>'
                     }, {
                         title: 'user on line',
                         html: '<p>Something useful would be in here.</p>'
                     }
                 ]
             });
         }
         win.show();
     }
 }); 
 MyDesktop.HelpWindow = Ext.extend(Ext.app.Module, {
     id: 'help-win',
     init: function () {
         
         this.launcher = {
             text: 'ช่วยเหลือ',
             iconCls: 'icon-grid',
             handler: this.createWindow,
             scope: this
         };
     },
     createTextHelp:function(){ 
         return "Text Help";
     },
     createWindow: function () {
         var desktop = this.app.getDesktop();
         var win = desktop.getWindow('help-win');

         if (!win) {
             win = desktop.createWindow({
                 id: 'help-win',
                 title: 'Help Window Title',
                 width: 740,
                 height: 480,
                 iconCls: 'icon-grid',
                 shim: false,
                 animCollapse: false,
                 constrainHeader: true,
                 layout: 'fit',
                  tools:[{ 
                        iconCls: 'toggle'
                    }],
                 items: [{
                   
                         xtype: 'panel',
                         html:'<iframe src="http://localhost:3000/" frameborder="0" width="100%" height="100%"></iframe>',
//                         , items:[{
//                              
//                             xtype:"displayfield", 
//                             id: 'panelID',
//                             value:this.createTextHelp()
                        
                 listeners: {
                        beforerender: function () {
                            console.log(this.   html);
                      
                     } 
                 }}],
                 viewConfig: {
                     forceFit: true
                 } 
             });
         }
         win.show();
     }
 });
 /*
  ******* Example Data Simple *****
  */
 var windowIndex = 0;
 Ext.grid.dummyData = [
     ['3m Co', 71.72, 0.02, 0.03, '9/1 12:00am'],
     ['Alcoa Inc', 29.01, 0.42, 1.47, '9/1 12:00am'],
     ['American Express Company', 52.55, 0.01, 0.02, '9/1 12:00am'],
     ['American International Group, Inc.', 64.13, 0.31, 0.49, '9/1 12:00am'],
     ['AT&T Inc.', 31.61, -0.48, -1.54, '9/1 12:00am'],
     ['Caterpillar Inc.', 67.27, 0.92, 1.39, '9/1 12:00am'],
     ['Citigroup, Inc.', 49.37, 0.02, 0.04, '9/1 12:00am'],
     ['Exxon Mobil Corp', 68.1, -0.43, -0.64, '9/1 12:00am'],
     ['General Electric Company', 34.14, -0.08, -0.23, '9/1 12:00am'],
     ['General Motors Corporation', 30.27, 1.09, 3.74, '9/1 12:00am'],
     ['Hewlett-Packard Co.', 36.53, -0.03, -0.08, '9/1 12:00am'],
     ['Honeywell Intl Inc', 38.77, 0.05, 0.13, '9/1 12:00am'],
     ['Intel Corporation', 19.88, 0.31, 1.58, '9/1 12:00am'],
     ['Johnson & Johnson', 64.72, 0.06, 0.09, '9/1 12:00am'],
     ['Merck & Co., Inc.', 40.96, 0.41, 1.01, '9/1 12:00am'],
     ['Microsoft Corporation', 25.84, 0.14, 0.54, '9/1 12:00am'],
     ['The Coca-Cola Company', 45.07, 0.26, 0.58, '9/1 12:00am'],
     ['The Procter & Gamble Company', 61.91, 0.01, 0.02, '9/1 12:00am'],
     ['Wal-Mart Stores, Inc.', 45.45, 0.73, 1.63, '9/1 12:00am'],
     ['Walt Disney Company (The) (Holding Company)', 29.89, 0.24, 0.81, '9/1 12:00am']
 ];
