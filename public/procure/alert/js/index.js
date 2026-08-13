 /*!
  * Ext JS Library 3.3.1
  * eakibane
  */
 Ext.runnerGrid = new Ext.util.TaskRunner();
 Ext.onReady(function ( ) {
     var items = [];
     Ext.QuickTips.init( );
     Ext.interVal = 10; // 10 min
     //=============================================================
     // Toolbar / Menu
     //=============================================================
     var menu = new Ext.menu.Menu({
         items: [{
                 text: 'เปิดดูเต็มจอ',
                 handler: function ( ) {
//                    window.open('#', 'Monitoring', 'fullscreen="yes"');
                    window.location.reload();
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
     items.push({
         xtype: 'panel',
         width: 255,
         height: 130,
//          title : 'Basic Panel With Toolbars' ,
//SET X Y
         x: 30, y: 30,
//          cls : 'centered' ,
         tbar: ['หน้าจอระบบแจ้งเตือน', ' ', '-', {
                 text: 'ตั้งค่า',
                 id: 'menu-btn',
                 menu: menu
             }],
         items: [{
                 xtype: 'displayfield',
                 id: 'clock',
                 style: "font-size:35px;font-weight:bold;padding:10px 0px 0 15px"
             }, {
                 xtype: 'displayfield',
                 value: 'ข้อมูลจะเปลี่ยนแปลงทุก ' + Ext.interVal + ' วินาที',
                 id: 'updateCount',
                 style: "font-size:13px; color:blue; font-weight:bold;padding:10px 0px 0 15px"}] 
     });
     //=============================================================
     // Grid
     //=============================================================
     var myData = [
         [1, 'การแจ้งเตือนตามสถานะของ TOR', ' - '],
         [2, 'การแจ้งเตือนตามสถานะของ สัญญา', ' - '],
         [3, 'การแจ้งเตือนตามสถานะของ งวด', ' - '],
         [4, 'การแจ้งเตือนก่อนหมด Warranty ของ', ' - ']
     ];
     var store = new Ext.data.SimpleStore({
         fields: [
             {name: 'id', type: 'int'}, {name: 'company'},
             {name: 'c_comment'}
         ],
         sortInfo: {
             field: 'id', direction: 'ASC'
         }
     });
     var pagingBar = new Ext.PagingToolbar({
         pageSize: 5,
         store: store,
         displayInfo: true,
         displayMsg: 'Displaying topics {0} - {1} of {2}'
     });
     store.loadData(myData);
     //=============================================================
     // ListView
     //=============================================================

     Ext.store = new Ext.data.JsonStore({
         autoDestroy: false,
         autoLoad: true,
         url: "api/mnTorController.php",
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
                name: "d_doc_ref"
            }, {
                 name: "i_backword"
             }, {
                 name: "c_codeStatus"
             }, {
                 name: "c_code"
             }, {
                name: "po_code"
             },{
                 name: "bg_budget_dtl_project_id"
             }, {
                 name: "c_budget_dtl_project"
             }, {
                 name: "c_name" //emp_name
             }, {
                 name: "emp_name" //
             }, {
                name : "index_receive"
             },{
                name: "po_date"
             } ,
             {
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
    items.push({
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
                header: "รหัส PR",
                sortable: false,
                align: "center",
                dataIndex: "c_code",
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    metaData.attr = "style='text-align: center;font-weight:bold;'";
                    return value;
                }
            }, 
            {
                header: "เลขที่สัญญา",
                width: 170,
                sortable: false,
                align: "left",
                hidden: false,
                dataIndex: "po_code"
            },
            {
                header: "วันที่เริ่มสัญญา",
                sortable: false,
                width: 170,
                align: "center",
                dataIndex: "po_date"
            }, 
            {
                 header: "สถานะรายการ PR", //DateDiff d_tor_date_alert d_tor_date_pa d_tor_status_date DateDiff
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
            }, 
            {
                header: "เลขที่สารบัญรับ",
                width: 90,
                sortable: false,
                align: "center",
                hidden: false,
                dataIndex: "index_receive"
            }, {
                header: "ผู้รับผิดชอบ",
                width: 170,
                sortable: false,
                align: "left",
                hidden: false,
                dataIndex: "emp_name"
            },
            {
                header: "สายงาน",
                width: 170,
                sortable: false,
                align: "left",
                hidden: false,
                dataIndex: "c_department"
            },
            //  {
            //     header: "ผู้รับผิดชอบ",
            //     width: 170,
            //     sortable: false,
            //     align: "left",
            //     hidden: false,
            //     dataIndex: "emp_name"
            // }, 
            {
                header: "เลขที่เอกสารอ้างอิง",
                sortable: false,
                width: 170,
                align: "center",
                dataIndex: "d_doc_ref"
                }, 
                {
                    header: "วันที่บันทึกสถานะ",
                    sortable: false,
                    width: 170,
                    align: "center",
                    dataIndex: "d_tor_status_date"
                }, 
                {
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
         height: (Ext.getBody().getViewSize().height * 0.88),
         width: (Ext.getBody().getViewSize().width * 0.80),
         viewConfig: {
             getRowClass: function (record, index, rowParams, ds) {
                 return record.get('no') == 10 ? 'background-color: #000' : '';
             }
         },
//SET X Y
         x: 300, y: 30,
//          title : 'GridPanel' ,
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
     });
     //=============================================================
     // ListView
     //=============================================================
     var listView = new Ext.list.ListView({
         store: store,
         multiSelect: true,
         emptyText: 'No images to display',
         reserveScrollOffset: true,
         columns: [
             new Ext.grid.RowNumberer({header: "ที่", width: .1, dataIndex: 'id', align: 'center'}),
             {id: 'Company', header: "ประเภทการแจ้งเตือน", width: .5, sortable: false, dataIndex: 'company'},
             {id: 'Comment', header: "รายละเอียด", width: .4, sortable: false, dataIndex: 'c_comment'}
         ]
     });
//      items.push({
//          xtype: 'panel',
//          id: 'images-view',
//          width: 450,
//          height: 310,
// //SET X Y
//          x: 30, y: 240,
//          collapsible: false,
//          layout: 'fit',
//          tbar: ['->', {text: 'ประเภทของข้อมูลการแจ้งเตือน'}], // <i>(0 items selected)</i>
//          items: listView, 
//          listeners: {
//              afterrender: function ( ) {
//                  var store = Ext.getCmp('gridID').getStore(); // your grid instance
//                  Ext.refreshTask = {
//                      run: function ( ) {
//                          store.reload({
//                              callback: function (record, operation, success)
//                              {
//                                  if (success)
//                                  {

//                                      if (record.length < Ext.interVal)
//                                          Ext.getCmp("gridID").getSelectionModel( ).selectRow(0);
//                                      else
//                                          Ext.getCmp("gridID").getSelectionModel( ).selectRow(parseInt(Ext.interVal) - 1);

//                                  }
//                              }
//                          });
//                      },
//                      id: 'runID',
//                      interval: Ext.interVal * 1000 // 1 Minute
//                  };
//                  Ext.runnerGrid = new Ext.util.TaskRunner();
//                  this.fn = function (i) {
//                      !i ? Ext.runnerGrid.stop(Ext.refreshTask) : Ext.runnerGrid.start(Ext.refreshTask);
//                  };
//                  this.fn(Ext.getCmp('stID').pressed);
//              }
//          }
//      });
    
     //=============================================================
     // Render everything!
     //=============================================================
     new Ext.Viewport({
        //layout: 'absolute',
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        defaults: {
            xtype: 'panel',
            flex: 1
        },
         autoScroll: true,
         id: 'viewID',
         items: items,
         listeners: {
             afterrender: function ( ) {
//-----------------------------------------
                 var updateClock = function ( ) {
                     Ext.fly('clock').update(new Date( ).format('g:i:s A'));
                 };
                 var task = {
                     run: updateClock,
                     interval: 1000 //1 second
                 };
//-----------------------------------------
                 Ext.runner = new Ext.util.TaskRunner( );
                 Ext.runner.start(task);
             }
         }
     });
 }
 );