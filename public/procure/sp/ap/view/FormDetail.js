Ext.ns('MyApp.view');

MyApp.view.FormDetail = Ext.extend(Ext.form.FormPanel, {
    columnWidth: 0.5,
    border: false,
    bodyStyle: 'padding:10px',
    title: 'Detail Info',
    items: [
        {xtype: 'textfield', fieldLabel: 'Email', name: 'email'},
        {xtype: 'textarea', fieldLabel: 'Address', name: 'address'}
    ],
    initComponent: function() {
        MyApp.view.FormDetail.superclass.initComponent.call(this);
    }
});
