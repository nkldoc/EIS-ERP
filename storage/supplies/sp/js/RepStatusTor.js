 ﻿Ext.onReady(function () {
     Ext.QuickTips.init();

     /* =============================================== */
     Ext.title_panel = "รายงานสถานะติดตาม (TOR)";
     /* =============================================== */

     Ext.dc_user = new Ext.data.JsonStore({
         autoDestroy: false,
         autoLoad: true,
         url: "api/All_RepStatisticPersonnel.php",
         baseParams: {type: "dc_user", all: "all"},
         root: "data",
         idProperty: "id",
         fields: ["id", "c_name"],
         listeners: {
             load: function (t, records, options) {
                 Ext.getCmp("dc_user_id").setValue(Ext.dc_user_id);
             },
         },
     });

     Ext.store_status = new Ext.data.JsonStore({
         autoDestroy: false,
         autoLoad: false,
         url: "api/All_RepStatisticPersonnel.php",
         baseParams: {type: "status", all: "all"},
         root: "data",
         idProperty: "id",
         fields: ["id", "c_name"],
         listeners: {
             load: function (t, records, options) {
                 Ext.getCmp("i_status").setValue("0");
             },
         },
     });

     LookReport = function (type) {
         var msg = "";

         if (msg == "") {
             href = "report/Rep_StatisticPersonnel.php";

             var resultUrl = "";

             resultUrl += "&type=" + type;
             resultUrl += "&dc_user_id=" + Ext.getCmp("dc_user_id").getValue();
             resultUrl += "&i_status=" + Ext.getCmp("i_status").getValue();
             resultUrl += "&d_date_start=" + Ext.util.Format.date(Ext.getCmp("d_date_start").getValue(), "Y-m-d");
             resultUrl += "&d_date_end=" + Ext.util.Format.date(Ext.getCmp("d_date_end").getValue(), "Y-m-d");

             resultUrl = resultUrl != "" ? "?" + resultUrl.substring(1) : "";

             window.open(href + resultUrl, href);
             window.focus();
         } else {
             Ext.MessageBox.alert("แจ้งเตือน", msg);
         }
     };

     var panelForm = new Ext.Panel({
         region: "center",
         title: Ext.title_panel,
         border: false,
         stripeRows: true,
         loadMask: true,
         items: [
             {
                 xtype: "form",
                 frame: true,
                 labelAlign: "right",
                 labelWidth: 200,
                 bodyStyle: {padding: "10px 20px"},
                 defaults: {
                     anchor: "100%",
                     msgTarget: "side",
                     allowBlank: false,
                 },
                 items: [
                     {
                         xtype: "container",
                         layout: "hbox",
                         align: "stretch",
                         RemoveHeight: true,
                         defaults: {
                             xtype: "fieldset",
                             flex: 1,
                             margins: "0px 3px",
                             autoHeight: true,
                         },
                         items: [
                             {
                                 title: "เมนู " + Ext.title_panel,
                                 RemoveCls: "x-box-item",
                                 defaults: {
                                     labelStyle: "width:200px;",
                                     allowBlank: true,
                                 },
                                 items: [
                                     new Ext.form.ComboBox({
                                         id: "dc_user_id",
                                         fieldLabel: "พนักงาน",
                                         store: Ext.dc_user,
                                         valueField: "id",
                                         displayField: "c_name",
                                         mode: "local",
                                         triggerAction: "all",
                                         emptyText: "กรุณาเลือก...",
                                         width: 300,
                                         forceSelection: true,
                                         selectOnFocus: true,
                                         typeAhead: false,
                                         value: Ext.dc_user_id,
                                         listeners: {
                                             afterrender: function () {
                                                 this.fn = function () {
                                                     Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
                                                     Ext.store_status.load({
                                                         params: {dc_user_id: this.getValue()},
                                                         callback: function (records, operation, success) {
                                                             Ext.getCmp("contenterCenter").getEl().unmask();
                                                         },
                                                     });
                                                 };
                                                 this.fn();
                                             },
                                             change: function (combo, newValue) {
                                                 if (newValue == "") {
                                                     combo.reset();
                                                 }
                                                 this.fn();
                                             },
                                             beforequery: function (q) {
                                                 if (q.query) {
                                                     var length = q.query.length;
                                                     q.query = new RegExp(Ext.escapeRe(q.query));
                                                     q.query.length = length;
                                                 }
                                             },
                                             blur: function () {
                                                 this.getStore().clearFilter();
                                             },
                                         },
                                     }),
                                     new Ext.form.ComboBox({
                                         id: "i_status",
                                         fieldLabel: "สถานะ",
                                         store: Ext.store_status,
                                         valueField: "id",
                                         displayField: "c_name",
                                         mode: "local",
                                         triggerAction: "all",
                                         emptyText: "กรุณาเลือก...",
                                         width: 300,
                                         forceSelection: true,
                                         selectOnFocus: true,
                                         typeAhead: false,
                                         value: "0",
                                         listeners: {
                                             change: function (combo, newValue) {
                                                 if (newValue == "") {
                                                     combo.reset();
                                                 }
                                             },
                                             beforequery: function (q) {
                                                 if (q.query) {
                                                     var length = q.query.length;
                                                     q.query = new RegExp(Ext.escapeRe(q.query));
                                                     q.query.length = length;
                                                 }
                                             },
                                             blur: function () {
                                                 this.getStore().clearFilter();
                                             },
                                         },
                                     }),
                                     {
                                         xtype: "compositefield",
                                         fieldLabel: "วันที่เริ่มโครงการ TOR",
                                         msgTarget: "under",
                                         items: [
                                             {
                                                 xtype: "datefield",
                                                 id: "d_date_start",
                                                 width: 127,
                                                 value: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                                             },
                                             {
                                                 xtype: "displayfield",
                                                 value: "ถึงวันที่",
                                                 width: 36,
                                                 align: "center",
                                             },
                                             {
                                                 xtype: "datefield",
                                                 id: "d_date_end",
                                                 width: 127,
                                                 value: addY(543),
                                             }
                                         ]
                                     }
                                 ]
                             }
                         ]
                     }
                 ],
                 buttonAlign: "left",
                 buttons: [
                     {
                         text: Ext.GLOBAL_BU_SHOW_TH + "สำหรับ HTML",
                         iconCls: "page_magnify",
                         handler: function () {
                             LookReport("html");
                         }, // End Handle
                     },
                     {
                         text: Ext.GLOBAL_BU_SHOW_TH + "สำหรับ Excel",
                         iconCls: "icon-excel",
                         handler: function () {
                             LookReport("excel");
                         }, // End Handle
                     },
                 ],
             },
         ],
     }); // panelForm

     /* ====================== CENTER ====================== */
     var center = new Ext.TabPanel({
         region: "center",
         border: false,
         activeTab: 0, // default Tab
         id: "contenterCenter",
         defaults: {autoScroll: true},
         items: [panelForm],
     });

     /* ====================== RENDER ====================== */
     new Ext.Viewport({
         layout: "border",
         items: [center],
     });
 });
