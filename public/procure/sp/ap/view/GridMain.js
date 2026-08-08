Ext.ns('MyApp.view');

MyApp.view.GridMain = Ext.extend(Ext.grid.GridPanel, {
    title: 'Main Grid',
    store: new Ext.data.ArrayStore({
        fields: ['id', 'name'],
        data: [[1, 'John'], [2, 'Jane']]
    }),
    columns: [
        {header: 'ID', dataIndex: 'id'},
        {header: 'Name', dataIndex: 'name'}
    ],
    initComponent: function() {
        MyApp.view.GridMain.superclass.initComponent.call(this);
    }
});
