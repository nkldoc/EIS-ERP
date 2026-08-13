// app/view/AppView.js
Ext.ns('MyApp.view');

MyApp.view.AppView = Ext.extend(Ext.Viewport, {
    layout: 'fit',
    initComponent: function() {
        var tabPanel = new Ext.TabPanel({
            activeTab: 0,
            items: []
        });

        this.items = [tabPanel];

        this.tabPanel = tabPanel;

        MyApp.controller.MainController.initTabs(tabPanel);

        MyApp.view.AppView.superclass.initComponent.call(this);
    }
});
