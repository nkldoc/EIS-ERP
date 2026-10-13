
Ext.onReady(function () {
    Ext.QuickTips.init();
    var App = new Ext.Viewport({
        layout: "border",
        items: [
            new Ext.Panel({
                title: 'ค้นหาข้อมูล',
                region: "north",
                id: 'panelSearch',
                height: 140,
                bodyStyle: 'padding: 5px',
                items: [{
                        xtype: 'compositefield',
                        fieldLabel: 'Phone',
                        msgTarget: 'under',
                        items: [
                            {xtype: 'displayfield', value: '('},
                            {xtype: 'button', text: 'รายละเอียดในสัญญา', handler: function () {
                                    Ext.getCmp("contenterCenter").setActiveTab(4);
                                }},
                            {xtype: 'displayfield', value: ')'},
                            {xtype: 'button', text: 'รายละเอียดในสัญญาโครงการต่อเนื่อง', margins: '0 5 5 0',handler: function () {
                                    Ext.getCmp("contenterCenter").setActiveTab(5);
                                }},
                            {xtype: 'button', text: 'เสนอราคา', handler: function () {
                                    Ext.getCmp("contenterCenter").setActiveTab(0);
                                }
                            }
                        ]
                    }, {
                        xtype: 'fieldset',
                        title: 'Details',
                        collapsible: true,
                        listeners: {
                            collapse: function (p) {
//                                Ext.getCmp('contenterCenter').hide();
//                                Ext.getCmp('panelSearch').setHeight(70);
                                Ext.getCmp('contenterCenter').doLayout();
                                Ext.getCmp('panelSearch').doLayout();
                            }, expand: function (p) {
//                                Ext.getCmp('contenterCenter').show(); 
//                                Ext.getCmp('panelSearch').setHeight(140);
                                Ext.getCmp('contenterCenter').doLayout();
                                Ext.getCmp('panelSearch').doLayout();

                            }
                        },
                        items: [
                            /*  {
                                xtype: 'compositefield',
                                fieldLabel: 'Phone',
                                msgTarget: 'under',
                                items: [
                                    {xtype: 'displayfield', value: '('},
                                    {xtype: 'textfield', name: 'phone-1', width: 29, allowBlank: false},
                                    {xtype: 'displayfield', value: ')'},
                                    {xtype: 'textfield', name: 'phone-2', width: 29, allowBlank: false, margins: '0 5 0 0'},
                                    {xtype: 'textfield', name: 'phone-3', width: 48, allowBlank: false}
                                ]
                            },
                          {
                                xtype: 'compositefield',
                                fieldLabel: 'Time worked',
                                combineErrors: false,
                                items: [
                                    {
                                        name: 'hours',
                                        xtype: 'numberfield',
                                        width: 48,
                                        allowBlank: false
                                    },
                                    {
                                        xtype: 'displayfield',
                                        value: 'hours'
                                    },
                                    {
                                        name: 'minutes',
                                        xtype: 'numberfield',
                                        width: 48,
                                        allowBlank: false
                                    },
                                    {
                                        xtype: 'displayfield',
                                        value: 'mins'
                                    }
                                ]
                            },*/
                            {
                                xtype: 'compositefield',
                                anchor: '-20',
//                                msgTarget: 'side',
                                msgTarget: 'under',
                                fieldLabel: 'เลือกหมวด',
                                items: [/*{
                                 xtype: 'displayfield',
                                 value: 'ประเภทหัวข้อการค้นหา'
                                 },*/ new Ext.ux.form.LovCombo({
                                        //the width of this field in the HBox layout is set directly
                                        //the other 2 items are given flex: 1, so will share the rest of the space
                                        width: 130,
                                        xtype: 'combo',
                                        mode: 'local',
                                        id: "modeSeach",
//                                        value: 'cno',
                                        triggerAction: 'all',
                                        forceSelection: true,
                                        editable: true,
//                                        typeAhead: false,
                                        emptyText: "กรุณาเลือก...",
//                                        fieldLabel: 'ประเภทหัวข้อการค้นหา',
                                        name: 'title',
                                        hiddenName: 'title',
                                        displayField: 'c_name',
                                        valueField: 'id',
                                        store: new Ext.data.JsonStore({
                                            fields: ['c_name', 'id'],
                                            data: [
                                                {c_name: 'PR เลขขอซื้อ/จัาง', id: 'pr'},
                                                {c_name: 'เลขสัญญา', id: 'cno'},
                                                {c_name: 'IR เลขรับของ', id: 'ir'},
                                                {c_name: 'AP เลขตรวจรับ', id: 'ap'},
                                                {c_name: 'BL เลขวางบิล', id: 'bl'}
                                            ]
                                        }),
                                        listeners: {
                                            beforerender: function () {
                                                Ext.arr1 = [];
                                            },
                                            beforeselect: function (t, records, options) {
                                                if (Ext.arr1.length === 3 && records.get('checked') === false) {
                                                    Ext.example.msg("แจ้งเตือน", "ไม่สามารถเลือกรายการมากกว่า 3 รายการ", 1);
//                                                    $(this).next("text copied");
                                                    setTimeout(function () {
                                                        $(this).next().remove();
                                                    }, 6000);
                                                    return false;
                                                }
                                            },
                                            select: function (t, records, options) {
                                                if (records.get('checked') === true) {
                                                    Ext.arr1.push(records.get('id'));
                                                } else {
                                                    Ext.arr1.shift(records.get('id'));

                                                }
                                            }
                                        }
                                    }) 
                                ]
                            }
                        ]
                    }
                ]
            }), 
            new Ext.TabPanel({
                region: "center",
                border: false,
                id: "contenterCenter",
                defaults: {
                    autoScroll: true,
                    layout: 'fit',
                    markerStart: 'unset'
                },
                activeTab: 4,
                plain: true,
                items: [{
                        title: '1.0 เสนอราคา (หลังต่อรอง)',
                        iconCls: 'database_start',
                        id: 'content-panel0',
                        html: '<iframe src="./pageStatus.php?st=ST0005" frameborder="0" width="100%" height="100%"></iframe>'
//                    }, {
//                        title: '1.1 ประกาศผู้ชนะ',
//                        iconCls: 'database_start',
//                        id: 'content-panel1',
//                        html: '<iframe src="./pageStatus.php?st=ST0006" frameborder="0" width="100%" height="100%"></iframe>'
                    }, {
                        title: '2.0 สัญญา(ทั่วไป)',
                        iconCls: 'icon-start',
                        id: 'content-panel20',
                        html: '<iframe src="./signContract.php?st=ST0008&' + Ext.dc_rand + '" frameborder="0" width="100%" height="100%"></iframe>'
                    }, {
                        title: '3.0 รายละเอียดในสัญญา',
                        iconCls: 'icon-script-save',
                        id: 'content-panel30',
                        html: '<iframe src="./contract.php?st=ST0009&' + Ext.dc_rand + '" frameborder="0" width="100%" height="100%"></iframe>'
                    },
                    {
                        title: '3.1 รายละเอียดในสัญญา(โครงการต่อเนื่อง)',
                        iconCls: 'icon-script-save',
                        id: 'content-panel31',
                        html: '<iframe src="./project.php?st=ST0099&' + Ext.dc_rand + '" frameborder="0" width="100%" height="100%"></iframe>'
                        
                    }, {
                        title: '4.0 ตรวจรับ',
                        iconCls: 'icon-start',
                        id: 'content-panel21',
                        html: '<iframe src="./checking.php?st=ST0013'  + '" frameborder="0" width="100%" height="100%"></iframe>'
                    }
                    , new gridSummary()
                ]
            })]
    });
});