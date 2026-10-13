

//OnLoad	
Ext.onReady(function () {
    Ext.QuickTips.init();

    /*====================== End Tabs ====================*/
    /* Form */
    var panelForm = {
        region: 'center',
        title: 'จัดการรหัสผ่าน',
        xtype: 'panel',
        id: 'tabpanel2',
        border: false,
//		disabled: true,
        stripeRows: true,
//		loadMask: true,
//		store: store, 
        items: [
            {
                xtype: 'form',
                id: 'form-change-pass',
                url: './api/changePassword.php',
                frame: true,
                labelWidth: 200,
                border: 0,
                height: 200,
                bodyStyle: {padding: '10px 20px'},
                defaults: {
                    anchor: '80%',
                    msgTarget: 'side',
                },
                items: [

                    {
                        fieldLabel: 'รหัสผ่านเดิม',
                        xtype: 'textfield',
                        inputType: 'password',
                        name: 'old_password',
                        validator: function (val) {
                            if (!Ext.isEmpty(val)) {
                                return true;
                            } else {
                                return "กรุณากรอก รหัสผ่านเดิม";
                            }
                        },
                    }, {
                        fieldLabel: 'รหัสผ่านใหม่',
                        xtype: 'textfield',
                        inputType: 'password',
                        name: 'new_password',
                        id: 'new_password',
                        validator: function (val) {
                            if (!Ext.isEmpty(val)) {
                                return true;
                            } else {
                                return "กรุณากรอก รหัสผ่านใหม่";
                            }
                        },
                    }, {
                        fieldLabel: 'ยืนยันรหัสผ่านใหม่',
                        xtype: 'textfield',
                        inputType: 'password',
                        id: 'confirm_password',
                        name: 'confirm_password',
                        validator: function (val) {
                            if (!Ext.isEmpty(val) && val == Ext.getCmp('new_password').getValue()) {

                                return true;
                            } else {

                                return "กรุณากรอก  รหัสยืนยันให้เหมือนรหัสใหม่ ";
                            }
                        },
                    }
                ],
                buttons: [{
                        text: Ext.GLOBAL_BU_SAVE_TH,
                        id: 'buSave',
                        handler: function () {
                            var form = Ext.getCmp("form-change-pass").getForm();

                            if (form.isValid()) {

                                form.submit({
                                    waitMsg: 'Saving Data...',
                                    success: function (form, action) {
                                        console.log(action.result.reval);
                                        if (action.result.reval) {
                                            Ext.Msg.alert('Failure', action.result.msg);

                                        } else {
                                            Ext.Msg.alert('Success', action.result.msg, function () {
                                                Ext.getCmp("form-change-pass").getForm().reset();
                                            });

//					Ext.getCmp("win-msg-change-pass").hide();						// hidden window-panel
//					Ext.getCmp("win-msg-change-pass").destroy();
                                        }

                                    },
                                });
                            }
                        }
                    }, {
                        text: 'Cancel',
                        handler: function () {
                            Ext.getCmp("form-change-pass").getForm().reset();
                        }
                    }]
            }],

    };

    /* View */
    new Ext.Viewport({
        layout: 'border',
        items: [new Ext.TabPanel({
                region: 'center',
                border: false,
                activeTab: 1, //default Tab
                id: 'contenterCenter',
                defaults: {autoScroll: true},
                items: [panelForm],
                listeners: {'tabchange': function (panel, tab) { /* Action */
                    }
                }
            })]
    });
    /* Event ,Handler */
//	Ext.getCmp('tabpanel1').on('cellclick', cellClick, this);
    Ext.getCmp('contenterCenter').setActiveTab('tabpanel2');
//	InfoMainGrid('tabpanel1',true,true,true,true,true,true);
});