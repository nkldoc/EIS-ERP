Ext.ns('MyApp.controller');

MyApp.controller.MainController = {
    loadMainTab: function(tabPanel) {
        var grid = new MyApp.view.GridMain();
        var formPanel = new MyApp.view.FormPanelMain();

        tabPanel.add({
            title: 'Main View',
            layout: 'border',
            closable: true,
            items: [
                {
                    region: 'west',
                    width: 400,
                    layout: 'fit',
                    items: [grid]
                },
                {
                    region: 'center',
                    layout: 'fit',
                    items: [formPanel]
                }
            ]
        }).show();
    }
};
