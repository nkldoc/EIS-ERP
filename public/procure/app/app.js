Ext.ns('MyApp'); // กำหนด namespace หลักของแอป 
Ext.onReady(function() {
    Ext.QuickTips.init(); // tooltip support 
    new MyApp.view.AppView(); // สร้าง View หลัก (AppView)
});