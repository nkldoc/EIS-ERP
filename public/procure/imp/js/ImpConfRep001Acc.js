 
 
Ext.store = new Ext.data.JsonStore({
    storeId: 'myStore',
    url: 'api/ListImpConfRep001Acc.php',
    root: 'data',
    idProperty: 'id',
	autoDestroy: true,
    autoLoad: true,
    totalProperty: 'totalCount',
    baseParams: {type: 'LIST'}, //Permission i_read 
    fields: [
        {name: 'checkbox1'},
		{name: 'checkbox2'}
    ]
});

 
frmConfAcc = function () {
    Ext.i_group = 0;
	
    var gridDtl = {
        xtype: 'grid',
        id: 'tabGrid',
        border: false,
        stripeRows: true,
        loadMask: true,
        frame: true,
        bodyStyle: "padding:2px",
        autoHeight: true,
        store: Ext.store,
        viewConfig: {forceFit: true, getCellCls: function (value) { }},
        columns: [
			{header: "รายการบัญชี", align: 'left', dataIndex: 'checkbox1'},
            {header: "รายการบัญชี", align: 'left', dataIndex: 'checkbox2'},
        ],
    };

    frmConfAcc.superclass.constructor.call(this, {
        listeners: {
            afterrender: function (obj, eOpts) { },
        },
        id: 'frm-ID',
        url: 'api/mnImpConfRep001Acc.php',
        frame: true,
        bodyStyle: "padding:0px",
        autoScroll: true,
        loadMask: true,
        width: 600,
        labelWidth: 180,
        bodyStyle: "padding:5px",
        defaults: {flex: 1, },
        title: 'กำหนดผังบัญชีที่แสดงในรายงานรับเงินประจำวัน',
        items: [gridDtl],
        buttonAlign: 'left',
        buttons: [{
                text: 'บันทึกรายการ',
                id: 'buSaveID',
                iconCls: 'icon-save',
                listeners: {
                    afterrender: function () {

                    }
                },
                handler: function () {
                    var form = Ext.getCmp('frm-ID').getForm();
                    if (form.isValid()) {
                        form.submit({
                            waitMsg: 'Saving Data...',
                            success: function (form, action) {
                                Ext.Msg.alert('Success', action.result.msg, function () {		  
                                    Ext.store.reload();
                                });
                            },
                            failure: function (form, action) {
                                switch (action.failureType) {
                                    case Ext.form.Action.CLIENT_INVALID:
                                        Ext.Msg.alert('Failure', 'Form fields may not be submitted with invalid values');
                                        break;
                                    case Ext.form.Action.CONNECT_FAILURE:
                                        Ext.Msg.alert('Failure', 'พลข้อผิดพลาดในการเชื่อต่อเครือข่าย');
                                        break;
                                    case Ext.form.Action.SERVER_INVALID:
                                        Ext.Msg.alert('Failure', action.result.msg);
                                }
                            }
                        });
                    }
                }
            }]
    });
};
Ext.extend(frmConfAcc, Ext.FormPanel, {});

//OnLoad
Ext.onReady(function () {

    Ext.QuickTips.init();

    new Ext.Viewport({
        layout: 'border',
        items: [new Ext.TabPanel({
                region: 'center',
                border: false,
                id: 'contenterCenter',
                defaults: {autoScroll: true},
            })]
    });

	var frmSoDtl = new frmConfAcc();	
	Ext.getCmp('contenterCenter').add(frmSoDtl); 
	Ext.getCmp('contenterCenter').setActiveTab(frmSoDtl);
});
