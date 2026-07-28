/* global Ext, user_right_add, user_right_edit, user_right_delete */

Ext.url_pdf = 'http://localhost/sp_mn/api/mnUploadDoc.php';
Ext.url_process = './api/mnCheckingController.php';
Ext.i_step = 4;
Ext.menu_back = 'ST0013'; //ส่งคืนตรวจสอบเอกสาร
Ext.menu_goto = null; //ส่งคืนตรวจสอบเอกสาร
//hidden
Ext.reversstep = false;
Ext.backstep = true;
Ext.reversstep = false;
Ext.StatusMsgTxt = [{4: 'รอส่งเบิก', 5: 'กำลังส่งเบิก', 6: 'ส่งเบิกแล้ว'}];
// Handle this change event in order to restore the UI to the appropriate history state 
var crditForm = null;
Ext.storeDebtorCheckingBilling = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "tor/api/List_SpPreBilling.php",
    baseParams: {
        type: "chooseBilling",
        keyData: Ext.keyData,
        i_alarm: Ext.menu_i_alarm,
        i_pa: Ext.menu_i_day,
        i_edit2: true,
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
            name: "i_status_checking",
        },
        {
            name: "sp_bg_billing_dtl_id",
        },
        {
            name: "url_link_doc",
        },
        {
            name: "c_comment",
        },
        {
            name: "c_name",
        },
        {
            name: "d_reg_billing_date",
        },
        {
            name: "d_post_billing_date",
        },
        {
            name: "i_is_waiting",
        },
        {
            name: "i_menu",
        },
        {
            name: "dc_creditor_name",
        },
        {
            name: "sp_emp_name",
        },
        {
            name: "c_status",
        },
        {
            name: "c_code",
        },
        {
            name: "sp_emp_id",
        },
        {
            name: "txtsp_emp_idID",
        },
        {
            name: "c_arrive_code",
        },
        {
            name: "d_doc_ref",

        },
        {
            name: "d_arrive_date",
        },
        {
            name: "d_checking_date", // 
        },
        {
            name: "c_comment",
        }]
});
Ext.storeDebtorChecking = new Ext.data.JsonStore({
    autoDestroy: true,
    autoLoad: false,
    url: "tor/api/List_SpPreBilling.php",
    baseParams: {
        type: "postBilling",
        keyData: Ext.keyData,
        i_alarm: Ext.menu_i_alarm,
        i_pa: Ext.menu_i_day,
        i_edit2: true,
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
            name: "i_status_checking",
        },
        {
            name: "sp_bg_billing_dtl_id",
        },
        {
            name: "url_link_doc",
        },
        {
            name: "c_comment",
        },
        {
            name: "c_name",
        },
        {
            name: "d_reg_billing_date",
        },
        {
            name: "d_post_billing_date",
        },
        {
            name: "i_is_waiting",
        },
        {
            name: "i_menu",
        },
        {
            name: "dc_creditor_name",
        },
        {
            name: "sp_emp_name",
        },
        {
            name: "c_status",
        },
        {
            name: "c_code",
        },
        {
            name: "sp_emp_id",
        },
        {
            name: "txtsp_emp_idID",
        },
        {
            name: "c_arrive_code",
        },
        {
            name: "d_doc_ref",

        },
        {
            name: "d_arrive_date",
        },
        {
            name: "d_checking_date", // 
        },
        {
            name: "c_comment",
        }]
});
Ext.colBar = [
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
        header: "รหัส",
        sortable: false,
        align: "left",
        dataIndex: "id",
        hidden: true
    },
    {
        header: "รหัสตรวจรับ",
        sortable: false,
        width: 100,
        align: "center",
        dataIndex: "c_code"

    },
    {
        header: "วันที่ส่งวางบิล",
        sortable: false,
        align: "center",
        dataIndex: "d_reg_billing_date",

    },
    {
        header: "วันที่วางบิล",
        sortable: false,
        align: "center",
        dataIndex: "d_post_billing_date",

    },
    {
        header: "วันที่ตรวจรับ",
        sortable: false,
        align: "center",
        dataIndex: "d_checking_date",
    },
    {
        header: "ผู้ขาย/รับจ้าง",
        sortable: false,
        align: "left",
        dataIndex: "dc_creditor_name", //c_tor_type
        width: 120

    },
    {
        header: "หมายเหตุ",
        sortable: false,
        align: "left",
        dataIndex: "c_comment",

    }
];
function windCreditor() {
    storeCreditor = new Ext.data.JsonStore({
        autoLoad: true,
        storeId: "myStoreCredit",
        url: "tor/api/List_pop_creditor_billing.php",
        baseParams: {mode: "LIST_POP_CREDITOR_BILLiNG_FULL", id: 0},
        root: "data",
        idProperty: "id",
        totalProperty: "totalCount",
        fields: [{name: "no"}, {name: "dc_creditor_id"}, {name: "c_tax_number_imp"}, {name: "c_name"}, {name: "c_address"}],
    });

    var column = [
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
    var searchFrm = function (id) {
        var store = this.store;
        var headerGrid = this.headerGrid;
        var id = id;
        var setDefaultFilter = [['c_tax_number_imp', "เลขผู้เสียภาษี"], ['c_name', "ชื่อ"]];
        var filterGrid = new Ext.data.SimpleStore({
            fields: ["value", "text"],
            data: setDefaultFilter,
        });
        var store = this.store;

        return [{
                id: "filter" + id,
                xtype: 'combo',
                width: 130,
                mode: 'local',
                store: filterGrid,
                valueField: "value",
                displayField: "text",
                allowBlank: false,
                editable: false,
                triggerAction: "all",
                typeAhead: false,
                value: 'c_name',
            }, '-', {
                id: "value-box" + id,
                xtype: "textfield",
                width: 130,
                fieldLabel: "fieldLabel",
                emptyText: 'คำที่ต้องการค้นหา',
                listeners: {
                    specialkey: function (f, e) {
                        if (e.getKey() == e.ENTER) {
                            Ext.getCmp('findID').fnSubmit();
                        }
                    }
                }
            }, {
                xtype: 'button',
                text: 'ค้นหา',
                id: 'findID',
                icon: '../images/icons/page_magnify.png',
                handler: function () {
                    Ext.getCmp('findID').fnSubmit();
                }
                , listeners: {
                    afterrender: function () {
                        this.fnSubmit = function () {
                            storeCreditor.setBaseParam("filter", Ext.getCmp("filter" + id).getValue());
                            storeCreditor.setBaseParam("value", Ext.getCmp("value-box" + id).getValue());
                            storeCreditor.setBaseParam("mode", "SEARCH");
                            storeCreditor.load();
                        };
                    }
                }
            }];
    };
    if (!Ext.isEmpty(Ext.getCmp('winCreditorFrmID')))
        Ext.getCmp('winCreditorFrmID').show();
    else
        new Ext.Window({
            title: "ผู้ขาย/รับจ้าง",
            iconCls: "icon-application-view-list",
            id: "winCreditorFrmID",
            modal: true,
            plain: true,
            collapsible: true,
            maximizable: true,
            border: false,
            layout: 'fit',
            width: Ext.getCmp("contenterCenter").getWidth() - 140,
            height: Ext.getCmp("contenterCenter").getHeight() - 140,
            items: [{
                    xtype: "grid",
                    id: "gridSub2ID",
                    border: false,
                    stripeRows: true,
                    loadMask: true,
                    height: 80,
                    autorScroll: true,
                    store: storeCreditor,
                    columns: column,
                    columnLines: true,
                    viewConfig: {forceFit: true},
                    tbar: searchFrm("dc_creditor_id"),
                    bbar: new Ext.PagingToolbar({
                        pageSize: 20,
                        store: storeCreditor,
                        displayInfo: true,
                        displayMsg: "Displaying topics {0} - {1} of {2}",
                    }),
                    listeners: {

                        afterrender: function (g) {
                            this.on("cellclick", function (grid, rowIndex, columnIndex, e) {
                                var record = grid.getStore().getAt(rowIndex);
                                //set
                                record.set("inv_nameTxt", record.get('c_name'));
                                Ext.getCmp('BillingFrm').getForm().loadRecord(record);

                                Ext.storeDebtorChecking.setBaseParam("dc_creditor_id", record.get('dc_creditor_id'));
                                Ext.chooseRow;
                                Ext.storeDebtorChecking.load({
                                    callback: function (record, operation, success) {
                                        if (success) {
                                            Ext.getCmp('tabpanelID').setActiveTab(1);
                                            Ext.getCmp('tabpanelID').doLayout();
                                            if (!Ext.isEmpty(Ext.chooseRow)) {
                                                Ext.storeDebtorCheckingBilling.remove(Ext.chooseRow);
                                            }
                                            Ext.getCmp('winCreditorFrmID').hide();
                                        }
                                    }
                                });
                                //end
                            }, this);
                        }
                    }
                }]
        }).show();
}
function winTabBilling(sta) {
    var tokenDelimiter = ':';
    storeWaitBilling = new Ext.data.JsonStore({
        autoLoad: true,
        storeId: "myStoreCredit",
        url: "tor/api/List_pop_creditor.php",
        baseParams: {mode: "LIST_POP_CREDITOR_BILLiNG_FULL", id: 0},
        root: "data",
        idProperty: "id",
        totalProperty: "totalCount",
        fields: [{name: "no"}, {name: "dc_creditor_id"}, {name: "c_tax_number_imp"}, {name: "c_name"}, {name: "c_address"}],
    });



    new Ext.Window({
        title: "รายการวางวางบิล",
        iconCls: "icon-application-view-list",
        id: "winBillingFrmID",
        modal: true,
        plain: true,
        collapsible: true,
        maximizable: true,
        border: false,
        layout: 'fit',
        width: Ext.getCmp("contenterCenter").getWidth() - 2,
        height: Ext.getCmp("contenterCenter").getHeight() - 2,
        items: [new Ext.FormPanel({
                labelAlign: 'top',
                id: 'BillingFrm',
                bodyStyle: 'padding:5px',
                width: 600,
                frame: true,
                items: [{
                        layout: 'column',
                        border: false,
//                        title: 'รายละเอียด บริษัท/ผู้ขาย/ผู้รับจ้าง',
                        items: [{
                                columnWidth: .5,
                                layout: 'form',
                                border: false,
                                items: [{
                                        xtype: 'textfield',
                                        fieldLabel: "รายการ", width: 500,
                                        hidden: true,
                                        id: 'c_nameID',
                                        name: 'c_name'
                                    }, {
                                        xtype: "buttongroup",
                                        fieldLabel: "บริษัท/ผู้ขาย/ผู้รับจ้าง",
                                        frame: false,
                                        border: false,
                                        items: [
                                            {
                                                xtype: "textfield",
                                                name: "inv_nameTxt",
                                                readOnly: true,
                                                id: "inv_nameTxtID",
                                                width: 350,
                                                validator: function (val) {
                                                    if (!Ext.isEmpty(val)) {
                                                        return true;
                                                    } else {
                                                        return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                                    }
                                                }, listeners: {
                                                    afterrender: function () {
                                                        this.fnSetParam = function () { };
                                                    },
                                                    change: function () {

                                                    }
                                                }
                                            },
                                            {
                                                xtype: "tbspacer",
                                                width: 12,
                                            }, {
                                                xtype: 'hidden',
                                                name: 'dc_creditor_id',
                                                id: 'dc_creditor_idID'
                                            },
                                            {
                                                xtype: 'button',
                                                iconCls: "page-copy-icon",
                                                text: 'เลือกผู้ขาย/รับจ้าง',
                                                anchor: '35%',
                                                handler: function () {
                                                    windCreditor();
                                                }
                                            }
                                        ]
                                    }, {
                                        xtype: 'textfield',
                                        fieldLabel: 'เลขที่ผู้เสียภาษี',
                                        readOnly: true,
                                        name: 'c_tax_number_imp',
                                        id: 'c_tax_number_impID',
                                        anchor: '55%'
                                    }, {
                                        xtype: 'textfield',
                                        fieldLabel: 'ประเภทกิจการ',
                                        readOnly: true,
                                        name: 'c_type_debitor',
                                        id: 'c_type_debitorID',
                                        anchor: '55%'
                                    }, {
                                        xtype: 'textfield',
                                        fieldLabel: 'เลขตั้งหนี้',
                                        readOnly: true,
                                        name: 'ar_no',
                                        id: 'ar_noID',
                                        anchor: '55%',
                                        style: "text-align: center;font-weight:bold;background:#eee;",
                                    }, {
                                        xtype: 'datefield',
                                        fieldLabel: 'วันที่ทำรายการ',
                                        name: 'd_doc_date',
                                        readOnly: true,
                                        style: "text-align: center;font-weight:bold;background:#eee;",
                                        id: 'd_doc_dateID',
                                        anchor: '30%'
                                    }]
                            }, {
                                columnWidth: .5,
                                layout: 'form',
                                border: false,
                                items: [{
                                        xtype: 'textfield',
                                        fieldLabel: 'Email',
                                        readOnly: true,
                                        name: 'email',
                                        id: 'emailID',
                                        vtype: 'email',
                                        anchor: '95%'

                                    }, {
                                        xtype: 'textarea',
                                        fieldLabel: 'ที่อยู่',
                                        readOnly: true,
                                        name: 'c_address',
                                        id: 'c_addressID',
                                        anchor: '95%'
                                    }]
                            }]
                    }, {
                        xtype: 'tabpanel',
                        plain: true,
                        id: 'tabpanelID',
                        activeTab: 0,
                        height: 335,
                        deferredRender: false,
                        title: 'รายการเอียด',
//                        defaults: {bodyStyle: 'padding:10px'},
                        listeners: {
                            'tabchange': function (tabPanel, tab) {
//                                console.log(tabPanel.id + tokenDelimiter + tab.id);
                            }

                        },

                        items: [{
                                title: 'รายการที่เลือกเพื่อวางบิล',
                                iconCls: "icon-contract",
                                layout: 'fit',
                                border: false,
                                xtype: 'panel',
                                id: 'gotoBillingID',
                                items: [{
                                        xtype: "grid",
                                        id: "gridSub4ID",
                                        stripeRows: true,
                                        loadMask: true,
                                        autorScroll: true,
                                        store: Ext.storeDebtorCheckingBilling,
                                        columns: [
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
                                                header: "รหัส",
                                                sortable: false,
                                                align: "left",
                                                dataIndex: "id",
                                                hidden: true
                                            },
                                            {
                                                header: "รหัสตรวจรับ",
                                                sortable: false,
                                                width: 100,
                                                align: "center",
                                                dataIndex: "c_code"

                                            },
                                            {
                                                header: "วันที่ส่งวางบิล",
                                                sortable: false,
                                                align: "center",
                                                dataIndex: "d_reg_billing_date",

                                            },
                                            {
                                                header: "วันที่วางบิล",
                                                sortable: false,
                                                align: "center",
                                                dataIndex: "d_post_billing_date",

                                            },
                                            {
                                                header: "วันที่ตรวจรับ",
                                                sortable: false,
                                                align: "center",
                                                dataIndex: "d_checking_date",
                                            },
                                            {
                                                header: "ผู้ขาย/รับจ้าง",
                                                sortable: false,
                                                align: "left",
                                                dataIndex: "dc_creditor_name", //c_tor_type
                                                width: 120

                                            },
                                            {
                                                header: "หมายเหตุ",
                                                sortable: false,
                                                align: "left",
                                                dataIndex: "c_comment",

                                            }
                                        ],
                                        columnLines: true,
                                        viewConfig: {forceFit: true},
                                        listeners: {
                                            afterrender: function (g) {
                                                this.on("cellclick", function (grid, rowIndex, columnIndex, e) {
                                                    var record = grid.getStore().getAt(rowIndex);
                                                    Ext.chooseRow2 = record;
                                                    //end
                                                }, this);
                                            }
                                        }
                                    }],
                            }, {
                                title: 'รายการที่รอวางบิล',
                                iconCls: "icon-contract",
                                layout: 'fit',
                                border: false,
                                xtype: 'panel',
                                items: [{
                                        xtype: "grid",
                                        id: "gridSub3ID",
                                        stripeRows: true,
                                        loadMask: true,
                                        autorScroll: true,
                                        store: Ext.storeDebtorChecking,
                                        columns: Ext.colBar,
                                        columnLines: true,
                                        viewConfig: {forceFit: true},
                                        tbar: ['&nbsp;', {
                                                xtype: 'button',
                                                text: 'บันทึกเลือกรายการวางบิล',
                                                iconCls: "icon-save",
                                                handler: function () {

//                                                    alert(Ext.chooseRow.get('c_code'));

                                                    if (Ext.isEmpty(Ext.chooseRow)) {
                                                        alert('กรุณาเลือกข้อมูลที่จะวางบิล');
                                                        return false;
                                                    }


                                                    Ext.storeDebtorCheckingBilling.add(Ext.chooseRow);
                                                    Ext.storeDebtorChecking.remove(Ext.chooseRow);
                                                    Ext.getCmp("gotoBillingID").doLayout();
                                                    Ext.getCmp("gridSub4ID").doLayout();
                                                    Ext.getCmp("tabpanelID").setActiveTab(0);

                                                    return false;
                                                    //====================

                                                }
                                            }],
                                        listeners: {
                                            afterrender: function (g) {
                                                this.on("cellclick", function (grid, rowIndex, columnIndex, e) {
                                                    var record = grid.getStore().getAt(rowIndex);
                                                    Ext.chooseRow = record;
                                                    //end
                                                }, this);
                                            }
                                        }
                                    }],
                            }]
                    }],
                buttonAlign: 'left',
                buttons: [{
                        text: 'บันทึกรายการวางบิล',
                        disabled: true,
                        iconCls: "icon-save",
                        handler: function () {

                            var rows = Ext.getCmp('gridSub4ID').getStore().data.items;

//                            console.log(rows.length);
//                            return false;
//                            rows.forEach(function (v) { 
//                                console.log(JSON.stringify(v));
//                            });
//                            return false;
                            formSubmit = function () {
                                Ext.Ajax.request({
                                    url: "tor/api/mnCheckBilling.php",
                                    modal: true,
                                    params: {
                                        mode: "GOTO_BILLING",
                                        dc_creditor_id: Ext.getCmp('dc_creditor_idID').getValue(),
                                        inv_name: Ext.getCmp('inv_nameTxtID').getValue(),
                                        c_address: Ext.getCmp('c_addressID').getValue(),
                                        d_doc_date: Ext.getCmp('d_doc_dateID').getValue(),
                                        ar_no: Ext.getCmp('ar_noID').getValue(),
                                        datas: JSON.stringify(rows)
                                    },
                                    method: "POST", //GET
                                    success: function (result, request) {
                                        var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                                        if (jsonData.success) {
                                            Ext.MessageBox.alert("Success", jsonData.msg, function () {
                                                Ext.getCmp("tabpanel1").getStore().reload();
                                                Ext.getCmp("winBillingFrmID").destroy();
                                            });
                                        } else {
                                            Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                                        }
                                    },
                                    failure: function (result, request) {
                                        Ext.MessageBox.alert("Failed", result.responseText); // connect error
                                    },
                                });
                            };

                            if (rows.length === 1) {
                                Ext.MessageBox.show({
                                    title: 'ยืนยันการบันทึก',
                                    msg: 'คุณต้องการที่จะผ่านรายการไปวางบิล ?',
                                    buttons: Ext.MessageBox.OKCANCEL,
                                    icon: Ext.MessageBox.WARNING,
                                    fn: function (btn) {
                                        if (btn == 'ok') {
                                            formSubmit();
                                        } else {
                                            return;
                                        }
                                    }
                                });
                            } else {
                                alert('กรุณาเพิ่มรายการรอวางบิลไปที่รายการวางบิล กดเลือกรายการ เพียงรายการเดียว');

                                return false;
                            }


                        }
                    }, {
                        text: 'ปิด',
                        iconCls: "icon-cancel",
                        handler: function () {
                            Ext.getCmp('winBillingFrmID').destroy();
                        }
                    }]
            })],
        listeners: {
            beforerender: function () {},
            afterrender: function () {
//                var frm = Ext.getCmp('BillingFrm').getForm();
//                if (sta === 'edit') {
//                    Ext.getCmp('c_nameID').hide();
//                    frm.loadRecord(Ext.selectRow);
//                }

            }

        }
    }).show();

}

function winProcess(rec) {

//    console.log(msgTxt[0][4]);

    new Ext.Window({
        id: "win-processID",
        title: "ผ่านรายการ สรุปขอวางบิล",
        modal: true,
        resizable: false,
        width: 550,
        layout: "form",
        labelWidth: 180,
        bodyStyle: "padding:3px;",
        items: [
            {
                xtype: "displayfield",
                fieldLabel: "ผ่านการสถานะของ",
                value: "<b style='font-size:16px;'> " + rec.get("c_code") + " ?</b>",
            }, {
                xtype: 'displayfield',
                fieldLabel: "ผ่านการสถานะของ",
                value: "<b style='font-size:16px;'> " + Ext.StatusMsgTxt[0][rec.get("i_status_billing")] + " ?</b>",
            }, {
                xtype: 'hidden',
                name: 'sp_tor_hdr_period_id',
                id: 'sp_tor_hdr_period_idID',
                value: rec.get("id"),

            },
            {
                xtype: "datefield",
                id: "d_doc_dateSubID",
                fieldLabel: "วันที่รายการ",
                value: new Date().format('d-m-Y'),
                readOnly: true
            }

        ],
        listeners: {
            afterrender: function () {

                if (Ext.selectRow.get('i_status_billing') == 3 && Ext.selectRow.get('c_code') == null) {
                    this.buttons[0].show();
                    this.buttons[1].hide();
                } else if (Ext.selectRow.get('i_status_billing') == 4) {
                    this.buttons[0].hide();
                    this.buttons[1].hide();
                } else {
                    this.buttons[0].hide();
                    this.buttons[1].show();
                }
            }
        },
        buttons: [{
                text: "ออกเลข BL วางบิล",
                iconCls: "icon-save",
                handler: function () {
//                    console.log(Ext.selectRow);
//                    return false;
                    Ext.Ajax.request({
                        url: "tor/api/mnCheckBilling.php",
                        modal: true,
                        params: {
                            mode: "GENCODEBILLING",
                            d_doc_date: Ext.getCmp("d_doc_dateSubID").getValue().format("Y-m-d"),
                            id: Ext.selectRow.get('id'),
                            sp_bg_billing_dtl_id: Ext.selectRow.get('sp_bg_billing_dtl_id')
                        },
                        method: "POST", //GET
                        success: function (result, request) {
                            var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                            if (jsonData.success) {
                                Ext.MessageBox.alert("Success", jsonData.msg, function () {
                                    Ext.getCmp("tabpanel1").getStore().reload();
                                    Ext.getCmp("win-processID").destroy();
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
            }, {
                text: "อัพเดทผ่านสถานะรายการ",
                iconCls: "icon-save",
                handler: function () {
//                        console.log(Ext.selectRow);
//                        return false;
                    formSubmit = function () {
                        Ext.Ajax.request({
                            url: "tor/api/mnCheckBilling.php",
                            modal: true,
                            params: {
                                mode: "GOTOWITHDRAW",
                                d_doc_date: Ext.getCmp("d_doc_dateSubID").getValue().format("Y-m-d"),
                                id: Ext.selectRow.get('sp_check_period_hdr_id')

                            },
                            method: "POST", //GET
                            success: function (result, request) {
                                var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                                if (jsonData.success) {
                                    Ext.MessageBox.alert("Success", jsonData.msg, function () {
                                        Ext.getCmp("tabpanel1").getStore().reload();
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
                    };
                    Ext.MessageBox.show({
                        title: 'ยืนยันการบันทึก',
                        msg: 'คุณต้องการที่จะผ่านรายการไปวางบิล ?',
                        buttons: Ext.MessageBox.OKCANCEL,
                        icon: Ext.MessageBox.WARNING,
                        fn: function (btn) {
                            if (btn == 'ok') {
                                formSubmit();
                            } else {
                                return;
                            }
                        }
                    });

                }
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

Ext.storeUnitType = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: {
        type: "dc_unit_type",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_code", "c_name"],
});


Ext.AppUx = function (app, menu) {
    Ext.user_right_add = user_right_add;
    Ext.user_right_edit = user_right_edit;
    Ext.user_right_delete = user_right_delete;
    Ext.title = Ext.menu_name + " " + Ext.menu_code;
    //Ext.menu_i_entrance;
    Ext.HDR_ID = null;
    Ext.selectRow = [];
    Ext.menuEditGrid = true;
    Ext.menuRightEditgrid = true;
    Ext.tor_type_id = 1; // default start เจาะจงน้อวกว่า 5 แสน
    Ext.i_is_more = 0;
    Ext.tor_type_idTxt = Ext.apply({
        tor_type_id1: {0: "แบบมีหัวงาน/ฝ่าย พิจารณาผล(ไม่เกิน 5 แสนบาท)", 1: "แบบมีคณะกรรมการ พิจารณาผล(เกิน 5 แสนแสนบาท)"},
    });
    Ext.status = Ext.apply({
        name: menu,
        process: function (menuCode, record) {
            Ext.Ajax.request({
                url: "tor/api/mnCheckWithdraw.php",
                modal: true,
                params: {
                    mode: "UPDATENEXTSTEP",
                    menuCode: Ext.menu_code,
                    step: Ext.getCmp("modesubID").getValue().inputValue, //GOTOSTEP
                    id: record.get("id"),
                    c_comment: Ext.getCmp("reasonID").getValue()
                },
                method: "POST", //GET
                success: function (result, request) {
                    var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                    if (jsonData.success) {
                        Ext.MessageBox.alert("Success", jsonData.msg, function () {
                            Ext.getCmp("tabpanel1").getStore().reload();
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
    function cellClick(grid, rowIndex, columnIndex, e) {
        var record = grid.getStore().getAt(rowIndex);
        Ext.selectRow = record;
        if (columnIndex === grid.getColumnModel().getIndexById("processDueID")) {
            //ttf
            controller(Ext.selectRow, "processUpdate"); //on
        } else if (columnIndex === grid.getColumnModel().getIndexById("editEmpTorID")) {
            controller(Ext.selectRow, "editEmpTorID");
        }
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
            if (rec.get("i_status_billing") == 2) {
                Ext.Msg.alert("แจ้งเตือน", "ต้องบันทึกลงทะเบียนก่อนผ่านรายการ", function (bu, action) {
                    return false;
                });
            } else {
                winProcess(rec);
            }


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
            Ext.checkBilling = new Ext.data.JsonStore({
                autoDestroy: false,
                autoLoad: false,
                url: "api/All_spAlert.php",
                baseParams: {type: "checkBilling", i_is_type_tor: true},
                root: "data",
                idProperty: "id",
                fields: ["id", "c_name", "d_post_date", "d_start_date", "d_end_date", "d_billing_date"], //d_post_date d_start_date d_end_date d_billing_date
            });
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
                title: "ยืนยันสรุปเอกสารรอบขอวางบิล",
                iconCls: "icon-application-view-list",
                id: "winEmpTorID",
                modal: true,
                plain: true,
                collapsible: true,
                maximizable: true,
                border: false,
                layout: 'fit',
                width: Ext.getCmp("contenterCenter").getWidth() - 40,
                height: Ext.getCmp("contenterCenter").getHeight() - 40,
                items: [new Ext.FormPanel({
                        id: "frmEditSpEmpID",
                        url: "tor/api/mnCheckBilling.php",
                        defaults: {width: 400, },
                        frame: true,
                        border: false,
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
                                value: "UPDATE_PRE_BILLING",
                                name: "mode",
                            },
                            {
                                fieldLabel: 'รหัสตรวจรับ',
                                name: 'c_checking_code',
                                readOnly: true,
                                value: rec.get('c_code')
                            },
                            {
                                xtype: "buttongroup",
                                fieldLabel: "วันที่รับเอกสาร",
                                frame: false,
                                border: false,
                                items: [
                                    {
                                        xtype: "datefield",
                                        name: "d_preBilling_date",
                                        id: "d_preBilling_dateID",
                                        width: 200,
                                        validator: function (val) {
                                            if (!Ext.isEmpty(val)) {
                                                return true;
                                            } else {
                                                return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                            }
                                        }, listeners: {
                                            afterrender: function () {
                                                this.fnSetParam = function () {
                                                    Ext.checkBilling.setBaseParam("d_preBilling_date", this.getValue().format('Y-m-d'));
                                                    Ext.checkBilling.reload();
                                                    Ext.getCmp('sp_bg_billing_dtl_idID').setValue(null);
                                                    Ext.getCmp('d_billing_dateID').setValue(null);
                                                    Ext.getCmp('sp_bg_billing_dtl_idID').focus();
                                                };
                                            },
                                            change: function () {
                                                this.fnSetParam();

                                            }
                                        }
                                    },
                                    {
                                        xtype: "tbspacer",
                                        width: 18,
                                    },
                                    {
                                        xtype: "label",
                                        style: {
                                            color: "red",
                                            width: "170px",
                                        },
                                        text: "*",
                                    },
                                ],
                            },
                            {
                                xtype: 'datefield',
                                name: 'd_checking_date',
                                width: 200,
                                fieldLabel: 'วันที่ตรวจรับ',
                                readOnly: true,
                            },
                            {

                                xtype: 'datefield',
                                name: 'd_create_date',
                                value: new Date().format("d-m-Y"),
                                width: 200,
                                fieldLabel: 'วันที่ทำรายการ',
                                readOnly: true,

                            },
                            // Ext.PopDepartmentForm.mini,
                            new Ext.form.ComboBox({
                                mode: "local",
                                store: Ext.checkBilling,
                                anchor: "60%",
                                fieldLabel: "รอบการวางบิล",
                                submitValue: true,
                                hiddenName: "sp_bg_billing_dtl_id",
                                name: "sp_bg_billing_dtl_idTxt",
                                id: "sp_bg_billing_dtl_idID",
                                valueField: "id",
                                displayField: "c_name",
                                triggerAction: "all",
                                forceSelection: true,
                                selectOnFocus: true,
                                typeAhead: false,
                                emptyText: "กรุณาเลือก",
                                validator: function (val) {
                                    if (!Ext.isEmpty(val)) {
                                        return true;
                                    } else {
                                        return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                    }
                                },
                                listeners: {
                                    afterrender: function () {
                                        this.fn = function () {
                                            var datax = this.store.data.map[this.value];
                                            if (!Ext.isEmpty(datax)) {
                                                var dBillingDate = new Date(datax.get('d_billing_date')).add(Date.YEAR, 543);
                                                Ext.getCmp('d_billing_dateID').setValue(dBillingDate.format('d-m-Y'));
                                            }
                                        };
                                    },
                                    Change: function () {
                                        this.fn();
                                    },
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
                                readOnly: true,
                                name: "d_billing_date",
                                fieldLabel: "วันที่วางบิล",
                                width: 200,
                                id: "d_billing_dateID",

                            }, {
                                xtype: "textarea",
                                fieldLabel: "หมายเหตุ",
                                width: 400,
                                name: "c_comment",
                            },
                        ],
                    })],
                buttonAlign: "left",
                listeners: {
                    afterrender: function () {

                        if (Ext.selectRow.get('i_status_checking') == 3) {
                            this.buttons[0].hide();
                            this.buttons[1].hide();
                        } else {
                            this.buttons[0].show();
                            this.buttons[1].show();
                        }
                    }
                },
                buttons: [
                    {
                        text: "บันทึกรายการ",
                        id: "buSavePopSubID",
                        iconCls: "icon-save",
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
                                Ext.MessageBox.show({
                                    title: 'ยืนยันการบันทึก',
                                    msg: 'คุณต้องการที่จะบันทึกการวางบิล?',
                                    buttons: Ext.MessageBox.OKCANCEL,
                                    icon: Ext.MessageBox.WARNING,
                                    fn: function (btn) {
                                        if (btn == 'ok') {
                                            formSubmit(form);
                                        } else {
                                            return;
                                        }
                                    }
                                });
                                //formSubmit(form);
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
            wind.getEl().mask("Please wait...", "x-mask-loading");

// Usage!

            Ext.checkBilling.load({
                callback: function (record, operation, success) {
                    if (success) {
                        Ext.sleep(2000).then(() => {
                            Ext.selectRow.set('d_preBilling_date', Ext.selectRow.get('d_reg_billing_date'));
                            Ext.selectRow.set('d_billing_date', Ext.selectRow.get('d_post_billing_date'));
                            Ext.getCmp("frmEditSpEmpID").getForm().loadRecord(Ext.selectRow);
                            wind.getEl().unmask();
                        });
                    }
                },
            });


        }
    } // Controller 

    //AutoLoad
    Ext.storeDtl = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "tor/api/List_SpPreBilling.php",
        baseParams: {
            type: "po_working_dtl1",
            keyData: Ext.keyData,
            i_alarm: Ext.menu_i_alarm,
            i_pa: Ext.menu_i_day,
            i_edit2: true,
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
                name: "i_status_checking",
            },
            {
                name: "sp_bg_billing_dtl_id",
            },
            {
                name: "i_status_billing",
            },
            {
                name: "url_link_doc",
            },
            {
                name: "c_comment",
            },
            {
                name: "d_arrive_date",
            },
            {
                name: "d_doc_arrive_dt",
            },
            {
                name: "d_reg_billing_date",
            },
            {
                name: "d_post_billing_date",
            },
            {
                name: "i_is_waiting",
            },
            {
                name: "i_menu",
            },
            {
                name: "dc_creditor_name",
            },
            {
                name: "sp_emp_name",
            },
            {
                name: "c_status",
            },
            {
                name: "c_code",

            },
            {
                name: "bl_code",
            },
            {
                name: "sp_emp_id",
            },
            {
                name: "txtsp_emp_idID",
            },
            {
                name: "c_arrive_code",
            },
            {
                name: "c_doc_ref",
            },
            {
                name: "d_arrive_date",
            },
            {
                name: "d_checking_date", //  
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
    //interlizing
    Ext.loadStore = function (status, show) {
        if (status === 'edit') {
//            alert('SHOW DETAIL ' + Ext.selectRow.get('c_name'));
            new Ext.Window({
                id: 'win-showID',
                width: 800,
                height: 400,
                layout: "fit",
                x: 120,
                y: 100,
                modal: true,
                plain: true,
                bodyStyle: "padding:5px;",
                buttonAlign: "center",
                items: [{
                        xtype: 'form',
                        id: 'frm-showID',
                        title: "รายการวางบิล",
                        defauls: {background: "#eee", },
                        items: [{
                                xtype: "textfield",
                                fieldLabel: "รหัสวางบิล",
                                readOnly: true,
                                name: "bl_code"
                            }, {
                                xtype: "textfield",
                                fieldLabel: "รหัสตรวจรับ",
                                readOnly: true,
                                name: "c_code"
                            }, {
                                xtype: "textfield",
                                fieldLabel: "เลขใบวางบิลจากลูกค้า",
                                readOnly: true,
                                name: "c_doc_ref"
                            }, {
                                xtype: "textfield",
                                fieldLabel: "รายการ", readOnly: true,
                                width: 500,
                                name: "c_name"
                            }, {
                                xtype: "textfield",
                                fieldLabel: "ผู้ขาย/รับจ้าง", readOnly: true,
                                width: 500,
                                name: "dc_creditor_name"
                            }, {
                                xtype: "textarea", readOnly: true,
                                fieldLabel: "ที่อยู่",
                                width: 500,
                            }]
                    }],
                listeners: {
                    beforerender: function () {
                        Ext.getCmp('frm-showID').getForm().loadRecord(Ext.selectRow);
                    }
                }
            }).show();

        }
    };

    function SearchFrm() {
        Ext.storeCreditor = new Ext.data.JsonStore({
            autoLoad: true,
            autoDestroy: false,
            storeId: "myStoreCont",
            url: "tor/api/List_pop_creditor.php",
            baseParams: {mode: "LIST_POP_CREDITORBilling", id: 0},
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
        var PopCreditorForm = new Ext.ux.Poplov({
            text: "เลือกผู้เสนอราคา",
            id: "dc_creditor_idID",
            iconCls: "page_magnify",
            valueHidden: "dc_creditor_id",
            store: Ext.storeCreditor,
            headerGrid: columnMini,
            widthText: 200,
            fieldLabel: "เลือกผู้เสนอราคา",
            isCellClickGrid: true,
            isSetFilter: true,
            cellClickGrid: function (grid, rowIndex, columnIndex, e) {
                var id = "dc_creditor_idID";
                var nameID = id + "_Name";
                var record = grid.getStore().getAt(rowIndex);
                var c_tax_number_imp = record.data.c_tax_number_imp == null ? "(ไม่มีเลขที่ประจำตัวผู้เสียภาษี)" : record.data.c_tax_number_imp;
                var TextShow = c_tax_number_imp + " : " + record.data.c_name;
                Ext.getCmp("dc_creditor_idID").setValue(record.data.dc_creditor_id);

                Ext.getCmp(nameID).setValue(TextShow);
                Ext.getCmp("win-pop-lov" + id).hide();
                Ext.getCmp("win-pop-lov" + id).destroy();
            },
        });

        return new Ext.Window({
            id: 'frm-searchID',
            title: "ค้นหารายการ PR",
            width: 800,
            height: 200,
            layout: "fit",
            x: 120,
            y: 100,
            modal: true,
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
                                new Ext.form.ComboBox({
                                    mode: "local",
                                    store: new Ext.data.JsonStore({
                                        autoDestroy: false,
                                        autoLoad: false,
                                        url: "api/All_spAlert.php",
                                        baseParams: {type: "sp_type_status", i_is_type_tor: true, all: "all"},
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
                                    xtype: "textfield",
                                    fieldLabel: "รหัส",
                                    id: "c_codeID",
                                    width: 200,
                                    name: "c_code"
                                }, //PopCreditorForm.mini,
//                                ,{
//                                    xtype: "datefield",
//                                    fieldLabel: "เริ่มวันที่ตรวจรับ",
//                                    id: "s_checking_dateID",
//                                    name: "s_checking_date",
//                                },
//                                {
//                                    xtype: "datefield",
//                                    fieldLabel: "ถึงวันที่ตรวจรับ",
//                                    id: "e_checking_dateID",
//                                    name: "e_checking_date",
//                                },
                                PopCreditorForm.mini
                            ], listeners: {
                                beforerender: function () {

                                },
                                afterrender: function () {
//                                    var today = new Date();
//                                    var lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
//                                    Ext.getCmp('s_checking_dateID').setValue(new Date().format("d-m-Y"));
//                                    Ext.getCmp('e_checking_dateID').setValue(lastDayOfMonth.format("d-m-Y"));
                                }
                            }
                        },
                        {
                            columnWidth: 0.5,
                            layout: "form",
                            border: false,
                            items: [
                                {
                                    xtype: "radiogroup",
                                    columns: [220],
                                    fieldLabel: "ประกันของ",
                                    id: "i_status_checkingID",
                                    style: {"font-weight": "bold"},
                                    items: [
                                        {
                                            name: "i_status_checking",
                                            inputValue: 1,
                                            checked: true,
                                            boxLabel: "รายการรอสรุปวางบิล"
                                        }, {
                                            name: "i_status_checking",
                                            inputValue: 2,
                                            boxLabel: "รายการส่งวางบิล"
                                        }
                                    ]
                                }
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
                                Ext.storeDtl.setBaseParam("s_checking_date", Ext.getCmp("s_checking_dateID").getValue());
                                Ext.storeDtl.setBaseParam("e_checking_date", Ext.getCmp("e_checking_dateID").getValue());
                                Ext.storeDtl.setBaseParam("dc_creditor_id", Ext.getCmp("dc_creditor_idID").getValue());
                                Ext.storeDtl.setBaseParam("i_status_checking", Ext.getCmp("i_status_checkingID").getValue().inputValue);
                                Ext.storeDtl.setBaseParam("c_name", Ext.getCmp("sc_nameID").getValue());
                                Ext.storeDtl.load();
                            },
                        }, {
                            text: "เริ่มใหม่",
                            handler: function () {
                                Ext.getCmp("dc_creditor_idID").setValue(0);
                                Ext.getCmp("dc_creditor_idID_Name").setValue(null);
                                Ext.getCmp("s_checking_dateID").setValue(Ext.getCmp("s_checking_dateID").originalValue);
                                Ext.getCmp("e_checking_dateID").setValue(Ext.getCmp("e_checking_dateID").originalValue);
                            }
                        },
                        {
                            text: "ปิด",
                            handler: function () {
                                Ext.getCmp("frm-searchID").destroy();
                            }
                        },
                    ],
                },
            ],
        });
    }
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
            menu: menu,
        });
        tb.add({
            text: " รายการเมนู ",
            icon: "../images/icons/text_list_bullets.png",
            iconCls: "bmenu",
            border: false,
            bodyStyle: "padding:0px 0px 0px 0px !important;",
            menu: menu,
        });

        menu.addSeparator();
        menu.add({
            text: "ค้นหาข้อมูล",
            icon: "../images/icons/application_form_magnify.png"
        }).on("click", (click = function () {
            if (!Ext.isEmpty(Ext.getCmp("winSearchFrm")))
                Ext.getCmp("winSearchFrm").destroy();
            var s1 = SearchFrm();
            s1.show();
        }));
        menu.add({
            text: "เพิ่มรายการวางบิล ",
            icon: "../images/icons/application_form_add.png"
        }).on("click", (click = function () {
            if (!Ext.isEmpty(Ext.getCmp("winBillingFrmID")))
                Ext.getCmp("winBillingFrmID").destroy();
            winTabBilling();

        }));
        menu.add({
            text: 'รายการวางบิล',
            icon: "../images/icons/application_form_edit.png",
            menu: {// <-- submenu by nested config object
                items: [
                    // stick any markup in a menu
                    '<b class="menu-title">เลือกเมนูรายการ</b>',
                    {
                        text: 'รายการตรวจรับที่วางบิลแล้ว',
                        value: 0,
                        checked: true,
                        group: 'theme',
                        handler: function () {
                            alert(this.value);
                        }
                    }, {
                        text: 'รายการตรวจรับที่รอวางบิล',
                        checked: false,
                        value: 1,
                        group: 'theme',
                        handler: function () {
                            alert(this.value);
                        }
                    }
                ]
            }
        });
        tb.doLayout();
        return tb;
    }; // MenuButton
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
                        header: "รหัส",
                        sortable: false,
                        align: "left",
                        dataIndex: "id",
                        hidden: true, // icon: "../images/icons/application_view_tile.png"

                    },
                    {
                        header: "สถานะรายการ",
                        sortable: false,
                        align: "center",
                        dataIndex: "id",
                        id: "processDueID",
                        width: 140,
                        renderer: function (value, metaData, record, row, col, store, gridView) {

                            var BtnText, IconImg;
                            if (record.get("i_status_billing") == 5) {
                                BtnText = '&nbsp;' + record.get('bl_code');
                                IconImg = '../images/icons/cog_edit.png';
                            } else if (record.get("bl_code") != '' && record.get("i_status_billing") == 6) {
                                BtnText = '&nbsp;' + record.get('bl_code');
                                IconImg = '../images/icons/accept.png';
                            } else {
                                BtnText = '&nbsp;' + record.get('bl_code');
                                IconImg = '../images/icons/cog_add.png';
                            }
                            var style = 'font-size:12px;border:1px solid #ccc; width:119px; padding:3px 3px 3px 15px; background: #f0f0f0 url(' + IconImg + ') no-repeat 3px center; cursor: pointer;';

                            return '<button style="' + style + '" type="button">' + BtnText + '</button>';
                        }
                    },
                    {
                        header: "สถานะรายการ",
                        sortable: false,
                        width: 100,
                        align: "center",
                        dataIndex: "c_code",
                        renderer: function (value, metaData, record, row, col, store, gridView) {
                            metaData.attr = "style='font-weight:bold; text-align:center;';";
                            return Ext.StatusMsgTxt[0][record.get("i_status_billing")];
                        }

                    },
                    {
                        header: "วันที่เอกสารสมบูรณ์",
                        sortable: false,
                        align: "center",
                        dataIndex: "d_doc_arrive_dt",
                    },
                    {
                        header: "วันที่ตรวจรับ",
                        sortable: false,
                        align: "center",
                        dataIndex: "d_checking_date",
                    },
                    {
                        header: "วันที่วางบิล",
                        sortable: false,
                        align: "center",
                        dataIndex: "d_reg_billing_date",
//
//                    },
//                    {
//                        header: "วันที่วางบิล",
//                        sortable: false,
//                        align: "center",
//                        dataIndex: "d_post_billing_date",
                    },
                    {
                        header: "ผู้ขาย/รับจ้าง",
                        sortable: false,
                        align: "left",
                        dataIndex: "dc_creditor_name", //c_tor_type
                        width: 120

                    },
                    {
                        header: "ผู้รับผิดชอบงาน",
                        sortable: false,
                        align: "left",
                        dataIndex: "sp_emp_name",
                        //             }, {
                        //                 header: "ขอดำเนินการ",
                        //                 sortable: false,
                        //                 align: "left",
                        //                 dataIndex: "c_purchase"
                    },
                    {
                        header: "หมายเหตุ",
                        sortable: false,
                        align: "left",
                        dataIndex: "c_comment",
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
                ];
                gridMain.superclass.constructor.call(this, {
                    region: "center",
                    title: ' ' + Ext.title,
                    xtype: "grid",
                    id: "tabpanel1",
                    border: true,
                    stripeRows: true,
                    loadMask: true,
                    //------------------
                    layout: "fit",
                    clicksToEdit: 2,
                    // clicksToEdit: 2,
                    viewConfig: {
                        emptyText: "ไม่มีข้อมูล..",
                        deferEmptyText: true,
                    },
                    listeners: {

                        rowclick: function (grid, idx) {
                            console.log(idx);
                        },
                        dblclick: function (dataview, index, item, e) {
                            Ext.buAct = "update";
                            Ext.loadStore("edit", true); // app,data.load
                        },
                        viewready: function (g) {
                            //
                        },
                        beforeedit: function (g) {
                            if (g.rowIdx == 1)
                                return false;
                        },
                        afteredit: function (g) {
                            // console.log(g.record.get('d_inv_date').format('d-m-Y'));
                        },
                        beforerender: function (g) {

                            new Ext.KeyMap(Ext.getBody(), [{
                                    key: "f",
                                    ctrl: true,
                                    fn: function (e, ele) {
                                        ele.preventDefault();
                                        if (!Ext.isEmpty(Ext.getCmp("winSearchFrm")))
                                            Ext.getCmp("winSearchFrm").destroy();
                                        var s1 = SearchFrm();
                                        s1.show();
                                    }
                                }]);

                            var headerGroup = [{
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
                                        // window.open(linkDownload + Ext.selectRow.get('c_code') + '.pdf', 'Monitoring', 'fullscreen="yes"');
                                        window.open(linkDownload + Ext.selectRow.get('c_code') + '.pdf?T=Tap_' + Math.floor(Math.random() * 100000),
                                        'Monitoring', 'fullscreen="yes"');
                                    }, scope: this}];

                            var permissionMenu = true
                                    ? headerGroup
                                    : [
                                        {
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
                                            scope: this
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
                                            scope: this
                                        }
                                    ];
                            this.contextMenu = new Ext.menu.Menu({
                                items: permissionMenu,
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
                            //Permission Right Change SP_EMP TOR
                            if (Ext.LOGIN_LEVEL_SHOW)
                                this.getColumnModel().removeColumn(2);
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
};
