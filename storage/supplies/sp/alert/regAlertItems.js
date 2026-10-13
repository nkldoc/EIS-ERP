  /* global Ext */

  //OnLoad Renderer
  Ext.onReady(function () {
      Ext.QuickTips.init();
      Ext.user_right_add = user_right_add;
      Ext.user_right_edit = user_right_edit;
      Ext.user_right_delete = user_right_delete;

    Ext.AppUx("SP", true); //app & show menu 

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
                 beforerender: function () {
                     Ext.util.Cookies.set('templateConfig', (Ext.isEmpty(Ext.util.Cookies.get('templateConfig')) ? null : Ext.util.Cookies.get('templateConfig')));
                 },
                 afterrender: function () {
//
                     Ext.loadStore(Ext.util.Cookies.get('statusx'), false); //status,show

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