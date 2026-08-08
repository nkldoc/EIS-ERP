 /* global Ext, user_right_add, user_right_edit, user_right_delete */
  Ext.onReady(function () {
     Ext.QuickTips.init();

     Ext.AppUx("SP", Ext.codeMenu); //app & show menu

     var App = new Ext.Viewport({
          layout: "border",
          items: new Ext.TabPanel({
              region: "center",
              border: false,
              id: "contenterCenter",
              defaults: {
                  autoScroll: true,
                  layout: 'fit'
              },
              listeners: {
                  afterrender: function () {
                      Ext.loadStore('load', false); //status,show  
                  }
              },
            items: [new gridMain()]

          })
     });
      Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
      Ext.getCmp("tabpanel1").on('beforeedit', function () {
          return false;
      });
  });