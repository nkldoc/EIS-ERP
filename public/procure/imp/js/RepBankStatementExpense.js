Ext.onReady(function() {
	Ext.QuickTips.init();
	
	/*===============================================*/
	var title_panel		= "รายงาน Bank Statement ค่าใช้จ่าย";
	/*===============================================*/
	
	dc_bank	= new Ext.data.JsonStore({
		autoDestroy: false,
		autoLoad: true,
		url: "../cm/api/All_CmImpCheque.php",
		baseParams: { type: "dc_bank" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ]
	});
	
	dc_bank_acc_company	= new Ext.data.JsonStore({
		autoDestroy: false,
		autoLoad: true,
		url: "../cm/api/All_CmImpCheque.php",
		baseParams: { type: "dc_bank_acc_company" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ]
	});
	
	var store_month = new Ext.data.JsonStore({
		fields: ["id", "c_name"],
		data : [
		        { id : "01", c_name : "มกราคม" },
		        { id : "02", c_name : "กุมภาพันธ์" },
		        { id : "03", c_name : "มีนาคม" },
		        { id : "04", c_name : "เมษายน" },
		        { id : "05", c_name : "พฤษภาคม" },
		        { id : "06", c_name : "มิถุนายน" },
		        { id : "07", c_name : "กรกฎาคม" },
		        { id : "08", c_name : "สิงหาคม" },
		        { id : "09", c_name : "กันยายน" },
		        { id : "10", c_name : "ตุลาคม" },
		        { id : "11", c_name : "พฤศจิกายน" },
		        { id : "12", c_name : "ธันวาคม" }
		       ]
	});

	// storeYear
	var years = [];
    var currentTime = new Date();
    var now = currentTime.getFullYear()+5;
    var yy_en = currentTime.getFullYear()-5;
    while(yy_en <= now) {
    	years.push({ id : yy_en, c_name : yy_en + 543 });
    	yy_en++;
    };
    
	store_year = new Ext.data.JsonStore({
		fields: ["id", "c_name"],
		data : years
	});
	
	LookReport = function( type ) {
		
		var msg		= "";

		if(Ext.getCmp("dc_bank_id").getValue() == "") { msg += "- กรุณาเลือก ธนาคาร<br>"; }
		if(Ext.getCmp("dc_bank_acc_company_id").getValue() == "") { msg += "- กรุณาเลือก เลขที่บัญชี<br>"; }

		if( msg == "" ) {

			var href		= "report/Rep_RepBankStatementExpense.php";
	    	var resultUrl	= "";
			
	    	resultUrl	+= "&type="+type; 
	    	resultUrl	+= "&dc_bank_id="+Ext.getCmp("dc_bank_id").getValue();
	    	resultUrl	+= "&dc_bank_acc_company_id="+Ext.getCmp("dc_bank_acc_company_id").getValue();
	    	resultUrl	+= "&c_mm="+Ext.getCmp("c_mm").getValue();
	    	resultUrl	+= "&c_yyyy="+Ext.getCmp("c_yyyy").getValue();
	    	resultUrl	+= "&status_cheque="+Ext.getCmp("status_cheque").getValue();
	    	resultUrl	+= "&i_system="+Ext.getCmp("i_system").getValue();
	    	
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
						id: "dc_bank_id",
						fieldLabel: "ธนาคาร",
						store: dc_bank,
						valueField: "id",
						displayField: "c_name",
						mode: "local",
						triggerAction: "all",
						emptyText: "กรุณาเลือก...",
						width: 300,
						forceSelection: true,
						selectOnFocus: true,
						typeAhead: false,
						listeners: {
							"change": function (combo, newValue) {
								if (newValue == "") { combo.reset(); }
								else {
									Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
									dc_bank_acc_company.load({
									    params : { dc_bank_id: newValue },
									    callback : function() {
									    	Ext.getCmp("contenterCenter").getEl().unmask();
									    	Ext.getCmp("dc_bank_acc_company_id").setValue("");
									    }
									});
								}
							},
							beforequery: function(q) {
								if (q.query) {
									var length = q.query.length;
									q.query = new RegExp(Ext.escapeRe(q.query));
									q.query.length = length;
								}
							},
							blur: function() { this.getStore().clearFilter(); },
						}
					}), new Ext.form.ComboBox({
						id: "dc_bank_acc_company_id",
						fieldLabel: "เลขที่บัญชี",
						store: dc_bank_acc_company,
						valueField: "id",
						displayField: "c_name",
						mode: "local",
						triggerAction: "all",
						emptyText: "กรุณาเลือก...",
						width: 300,
						forceSelection: true,
						selectOnFocus: true,
						typeAhead: false,
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
							blur: function() { this.getStore().clearFilter(); },
						}
					}), {
						xtype: "compositefield",
						fieldLabel: "ประจำเดือน",
						anchor: "100%",
						msgTarget: "under",
						items: [new Ext.form.ComboBox({
							id: "c_mm",
							store: store_month,
							valueField: "id",
							displayField: "c_name",
							mode: "local",
							triggerAction: "all",
							emptyText: "กรุณาเลือก...",
							width: 122,
							forceSelection: true,
							selectOnFocus: true,
							typeAhead: false,
							editable: false,
							value: (new Date().getMonth()+1),
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
								blur: function() { this.getStore().clearFilter(); },
							}
						}),{ xtype: "displayfield", value: "ปี" }, new Ext.form.ComboBox({
							id: "c_yyyy",
							store: store_year,
							valueField: "id",
							displayField: "c_name",
							mode: "local",
							triggerAction: "all",
							emptyText: "กรุณาเลือก...",
							width: 122,
							forceSelection: true,
							selectOnFocus: true,
							typeAhead: false,
							editable: false,
							value: new Date().getFullYear(),
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
								blur: function() { this.getStore().clearFilter(); },
							}
						})]
	                }, new Ext.form.ComboBox({
						fieldLabel: "สถานะเช็ค",
						id: "status_cheque",
						hiddenName: "status_cheque",
						store: new Ext.data.SimpleStore({
			            	fields: [ "id", "c_name" ],
							data: [
							       [ "0", "เลือกทั้งหมด" ],
							       [ "1", "เฉพาะเช็คที่มียอดค้างจ่าย" ],
							       [ "2", "เช็คที่จ่ายแล้ว" ]
							]
						}),
						valueField: "id",
						displayField: "c_name",
						mode: "local",
						triggerAction: "all",
						emptyText: "กรุณาเลือก...",
						width: 262,
						value: "0",
						forceSelection: true,
						selectOnFocus: true,
						typeAhead: false,
						editable: false, 
						listeners: {
							beforequery: function(q) {
								if (q.query) {
									var length = q.query.length;
									q.query = new RegExp(Ext.escapeRe(q.query));
									q.query.length = length;
								}
							},
							blur: function() { this.getStore().clearFilter(); },
						}
					}), new Ext.form.ComboBox({
						fieldLabel: "ระบบค่าใช้จ่าย",
						id: "i_system",
						store: new Ext.data.SimpleStore({
			            	fields: [ "id", "c_name" ],
							data: [
							       [ "0", "เลือกทั้งหมด" ],
							       [ "1", "e-phys" ],
							       [ "2", "vision net" ]
							]
						}),
						valueField: "id",
						displayField: "c_name",
						mode: "local",
						triggerAction: "all",
						emptyText: "กรุณาเลือก...",
						width: 262,
						value: "0",
						forceSelection: true,
						selectOnFocus: true,
						typeAhead: false,
						editable: false, 
						listeners: {
							beforequery: function(q) {
								if (q.query) {
									var length = q.query.length;
									q.query = new RegExp(Ext.escapeRe(q.query));
									q.query.length = length;
								}
							},
							blur: function() { this.getStore().clearFilter(); },
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
