Ext.ns('MyApp.view');

MyApp.view.FormPanelMain = Ext.extend(Ext.Panel, {
    layout: 'column',
    border: false,
    initComponent: function() {
        var formLeft = new Ext.form.FormPanel({
            columnWidth: 0.5,
            border: false,
            bodyStyle: 'padding:10px',
            items: [
                {xtype: 'textfield', fieldLabel: 'First Name', name: 'firstName'},
                {xtype: 'textfield', fieldLabel: 'Last Name', name: 'lastName'}
            ]
        });

        var formRight = new MyApp.view.FormDetail();

        Ext.apply(this, {
            items: [formLeft, formRight]
        });

        MyApp.view.FormPanelMain.superclass.initComponent.call(this);
    }
});
