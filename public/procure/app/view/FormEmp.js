// app/view/AppView.js
Ext.ns('MyApp.view');  
MyApp.view.FormEmp = Ext.extend(Ext.form.FormPanel, {
    id: 'formUser',
    border: false,
    bodyStyle: 'padding:10px',
    labelWidth: 100,
    items: [
        {xtype: 'textfield', fieldLabel: 'Name', name: 'name', anchor: '95%'},
        {xtype: 'textfield', fieldLabel: 'Email', name: 'email', anchor: '95%'}
    ],
    buttons: [
        {
            text: 'Save',
            handler: function() {
                var form = Ext.getCmp('formUser').getForm();
                if (form.isValid()) {
                    form.submit({
                        url: 'api/users/save',
                        method: 'POST',
                        success: function() {
                            Ext.Msg.alert('Success', 'User saved!');
                        },
                        failure: function() {
                            Ext.Msg.alert('Error', 'Failed to save user.');
                        }
                    });
                }
            }
        }
    ]
});

 


 
