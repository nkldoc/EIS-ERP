Ext.ns('MyApp.view');

MyApp.view.AppView = Ext.extend(Ext.Viewport, {
    layout: 'fit',
    initComponent: function() {
        var tabPanel = new Ext.TabPanel({
            region: 'center',
            activeTab: 0,
            items: []
        });

        Ext.apply(this, {
            items: [tabPanel]
        });

        this.tabPanel = tabPanel;

        MyApp.controller.MainController.loadMainTab(tabPanel);

        MyApp.view.AppView.superclass.initComponent.call(this);
    }
});
