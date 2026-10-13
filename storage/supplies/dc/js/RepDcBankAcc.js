Ext.onReady(function() {
	Ext.QuickTips.init();
	
	/*===============================================*/
	var title_panel		= "รายงานสมุดบัญชีธนาคาร";
	/*===============================================*/
	
	var store_bank_all = new Ext.data.JsonStore({
	    autoDestroy: true,
		autoLoad: true,
	    url : "api/ALL_RepDcBankAcc.php",
	    root: "data",
	    baseParams: { type: "bank_all" },
		fields: [
			{ name: "id" },
			{ name: "c_name" }
		],
		listeners: {
			load: function(t, records, options) {
	        	Ext.getCmp("dc_bank_id").setValue("0");
	        }
		}
	});

	var store_bank_deposit_type_all = new Ext.data.JsonStore({
	    autoDestroy: true,
		autoLoad: true,
	    url : "api/ALL_RepDcBankAcc.php",
	    root: "data",
	    baseParams: { type: "bank_deposit_type_all" },
		fields: [
			{ name: "id" },
			{ name: "c_name" }
		],
		listeners: {
			load: function(t, records, options) {
	        	Ext.getCmp("dc_bank_deposit_type_id").setValue("0");
	        }
		}
	});
	
	var store_area_all = new Ext.data.JsonStore({
	    autoDestroy: true,
		autoLoad: true,
	    url : "api/ALL_RepDcBankAcc.php",
	    root: "data",
	    baseParams: { type: "area_all" },
		fields: [
			{ name: "id" },
			{ name: "c_name" }
		],
		listeners: {
			load: function(t, records, options) {
	        	Ext.getCmp("dc_area_id").setValue("0");
	        }
		}
	});
	
	var status = new Ext.data.JsonStore({
	    autoDestroy: true,
		autoLoad: true,
	    url : "api/ALL_RepDcBankAcc.php",
	    root: "data",
	    baseParams: { type: "status" },
		fields: [
			{ name: "id" },
			{ name: "c_name" }
		],
		listeners: {
			load: function(t, records, options) {
	        	Ext.getCmp("i_enable").setValue("0");
	        }
		}
	});
	
	LookReport = function( type ) {
		
		var msg		= "";

		if( msg == "" ) {

			var href		= "report/Rep_DcBankAcc.php";
	    	var resultUrl	= "";
			
	    	resultUrl	+= "&type="+type;
	    	resultUrl	+= "&dc_bank_id="+Ext.getCmp("dc_bank_id").getValue();
	    	resultUrl	+= "&dc_bank_deposit_type_id="+Ext.getCmp("dc_bank_deposit_type_id").getValue();
	    	resultUrl	+= "&dc_area_id="+Ext.getCmp("dc_area_id").getValue();
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
						fieldLabel: "ธนาคาร",
						id: "dc_bank_id",
						store: store_bank_all,
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
								if (newValue == "") { combo.setValue(combo.startValue); }
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
						fieldLabel: "ประเภทเงินฝาก",
						id: "dc_bank_deposit_type_id",
						store: store_bank_deposit_type_all,
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
								if (newValue == "") { combo.setValue(combo.startValue); }
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
						fieldLabel: "หน่วยธุรกิจ",
						id: "dc_area_id",
						store: store_area_all,
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
								if (newValue == "") { combo.setValue(combo.startValue); }
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
						store: status,
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
								if (newValue == "") { combo.setValue(combo.startValue); }
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