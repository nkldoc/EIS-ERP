// app/view/AppView.js
Ext.ns('MyApp.view');
MyApp.view.GridUser = Ext.extend(Ext.grid.GridPanel, {
    title: 'Userloyees',
    initComponent: function() {
        this.store = new Ext.data.JsonStore({
            url: './app/users.json',
            root: 'data',
            fields: ['id', 'fullName', 'position', 'department']
        });

        this.columns = [
            {header: 'ID', dataIndex: 'id', width: 50},
            {header: 'Full Name', dataIndex: 'fullName'},
            {header: 'Position', dataIndex: 'position'},
            {header: 'Department', dataIndex: 'department'}
        ];

        this.sm = new Ext.grid.RowSelectionModel({
            singleSelect: true,
            listeners: {
                rowselect: function(sm, rowIndex, record) {
                    Ext.getCmp('formUser').getForm().loadRecord(record);
                }
            }
        });

        this.loadMask = true;

        MyApp.view.GridUser.superclass.initComponent.call(this);
        this.store.load();
    }
});

 

 
