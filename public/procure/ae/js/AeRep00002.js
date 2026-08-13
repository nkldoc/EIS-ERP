Ext.onReady(function() {
	Ext.QuickTips.init();
	
	/*===============================================*/
	var title_panel		= "รายงาน Segment บัญชีบริหาร";
	/*===============================================*/

	gl_dc_group_admin_hdr	= new Ext.data.JsonStore({
		autoLoad: true,
		chkMask: false, // status: loading
		url: "api/All_AeRep00002.php",
		baseParams: { type: "gl_dc_group_admin_hdr", show: "all" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ],
	    listeners: {
			load: function(t, records, options) { Ext.getCmp( "gl_dc_group_admin_hdr_id" ).setValue( "0" ); },
//			beforeload: function(t, records, options) { this.chkMask = false; initData(); },
//			datachanged: function(t, records, options) { this.chkMask = true; initData(); },
		}
	});
	
	LookReport = function( type ) {
		
		var msg		= "";

		if( msg == "" ) {

			var href		= "report/Rep_AeRep00002.php";
	    	var resultUrl	= "";
	    	
	    	resultUrl	+= "&type="+type;
	    	resultUrl	+= "&gl_dc_group_admin_hdr_id="+Ext.getCmp("gl_dc_group_admin_hdr_id").getValue();
	    	resultUrl	+= "&i_enable="+Ext.getCmp("i_enable").getValue();
	    	
	    	resultUrl	= (resultUrl != "")? "?"+resultUrl.substring(1) : "";
	    	
	    	window.open(href+resultUrl,href);
	      	window.focus();

		} else { Ext.MessageBox.alert("แจ้งเตือน", msg); }
	};
	
    var panelForm	= new Ext.Panel ({
		region: "center",
		title: title_panel,
		border: false,
		stripeRows: true,
		loadMask: true,
        items: [{
			xtype: "form",
			frame: true,
			labelAlign: "right",
			labelWidth: 200,
			bodyStyle: { padding: "10px 20px" },
			defaults: { anchor: "100%", msgTarget: "side", allowBlank: false },
			items: [{
				xtype: "container",
				layout: "hbox",
				align: "stretch",
				RemoveHeight: true,
				defaults: { xtype: "fieldset", flex:1, margins : "0px 3px", autoHeight: true },
				items: [{
					title: "เมนู "+title_panel,
					RemoveCls: "x-box-item",
					defaults: { labelStyle : "width:200px;", allowBlank: true },
					items: [new Ext.form.ComboBox({
						id: "gl_dc_group_admin_hdr_id",
						fieldLabel: "ชื่อ Segment บัญชีบริหาร",
						width: 300,
						mode: "local",
						store: gl_dc_group_admin_hdr,
						value: "0",
						valueField: "id",
						displayField: "c_name",
						triggerAction: "all",
						forceSelection: true,
						selectOnFocus: true,
						typeAhead : false,
						emptyText: "กรุณาเลือก...",
						listeners: {
							"change": function (combo, newValue) {
								if (newValue == "") { combo.reset(); }
							},
							beforequery: function(q) {
								if (q.query) {
									var length = q.query.length;
									q.query = new RegExp(Ext.escapeRe(q.query));
									q.query.length = length;
								}
							},
							blur: function() { this.getStore().clearFilter(); }
						}
					}), new Ext.form.ComboBox({
						fieldLabel: "สถานะ",
						id: "i_enable",
						width: 300,
						mode: "local",
					    store: new Ext.data.SimpleStore({
			            	fields: [ "id", "c_name" ],
							data: [
							       [ "0", "- เลือกทั้งหมด -" ],
							       [ "1", "ใช้งาน" ],
							       [ "2", "ไม่ใช้งาน" ]
							]
						}),
						value: "0",
						valueField: "id",
						displayField: "c_name",
						triggerAction: "all",
						forceSelection: true,
						selectOnFocus: true,
						typeAhead : false,
						emptyText: "กรุณาเลือก...",
						listeners: {
							"change": function (combo, newValue) {
								if (newValue == "") { combo.reset(); }
							},
							beforequery: function(q) {
								if (q.query) {
									var length = q.query.length;
									q.query = new RegExp(Ext.escapeRe(q.query));
									q.query.length = length;
								}
							},
							blur: function() { this.getStore().clearFilter(); }
						}
					})]
				}]
			}],
			buttonAlign: "left",
			buttons: [{
				text: Ext.GLOBAL_BU_SHOW_TH+"สำหรับ HTML",
				iconCls: "page_magnify",
				handler: function() { LookReport("html"); } //End Handle
			}, {
				text: Ext.GLOBAL_BU_SHOW_TH+"สำหรับ Excel",
				iconCls: "icon-excel",
				handler: function() { LookReport("excel"); } //End Handle
			}]
		}]
	}); // panelForm

	/*====================== CENTER ======================*/
	var center = new Ext.TabPanel({
		region: "center",
		border: false,
		activeTab: 0, //default Tab
		id: "contenterCenter",
		defaults: { autoScroll: true },
		items: [ panelForm ]
	});
	
	/*====================== RENDER ======================*/
	new Ext.Viewport({
		layout: "border",
		items: [ center ]
	});
});