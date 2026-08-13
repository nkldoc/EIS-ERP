Ext.onReady(function() {
	Ext.QuickTips.init();
	
	/*===============================================*/
	var title_panel		= "รายงานบัญชีบริหาร";
	/*===============================================*/

	store_acc	= new Ext.data.JsonStore({
		autoLoad: true,
//		chkMask: false, // status: loading
		url: "api/All_AeRep00003.php",
		baseParams: { type: "dc_acc" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name", "cut_name" ],
	    listeners: {
//			beforeload: function(t, records, options) { this.chkMask = false; initData(); },
//			datachanged: function(t, records, options) { this.chkMask = true; initData(); },
		}
	});
	
	store_acc_s	= new Ext.data.JsonStore({
		autoLoad: true,
//		chkMask: false, // status: loading
		url: "api/All_AeRep00003.php",
		baseParams: { type: "dc_acc", show: "all" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name", "cut_name" ],
	    listeners: {
//			beforeload: function(t, records, options) { this.chkMask = false; initData(); },
//			datachanged: function(t, records, options) { this.chkMask = true; initData(); },
		}
	});
	
	store_cost	= new Ext.data.JsonStore({
		autoLoad: true,
//		chkMask: false, // status: loading
		url: "api/All_AeRep00003.php",
		baseParams: { type: "dc_cost" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name", "cut_name" ],
	    listeners: {
//			beforeload: function(t, records, options) { this.chkMask = false; initData(); },
//			datachanged: function(t, records, options) { this.chkMask = true; initData(); },
		}
	});
	
	store_cost_s	= new Ext.data.JsonStore({
		autoLoad: true,
//		chkMask: false, // status: loading
		url: "api/All_AeRep00003.php",
		baseParams: { type: "dc_cost", show: "all" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name", "cut_name" ],
	    listeners: {
//			beforeload: function(t, records, options) { this.chkMask = false; initData(); },
//			datachanged: function(t, records, options) { this.chkMask = true; initData(); },
		}
	});
	
	store_segment	= new Ext.data.JsonStore({
		autoLoad: true,
//		chkMask: false, // status: loading
		url: "api/All_AeRep00003.php",
		baseParams: { type: "segment" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name", "cut_name" ],
	    listeners: {
//			beforeload: function(t, records, options) { this.chkMask = false; initData(); },
//			datachanged: function(t, records, options) { this.chkMask = true; initData(); },
		}
	});

	LookReport = function( type ) {
		
		var msg		= "";
		
		var i_acc			= Ext.getCmp("s_acc").getValue().inputValue;
		var dc_acc_id_s		= Ext.getCmp("s_dc_acc_id_s").getValue();
		var dc_acc_id_e		= Ext.getCmp("s_dc_acc_id_e").getValue();
		var dc_acc_id_r		= Ext.getCmp("s_dc_acc_id_r").getValue();
		
		var i_cost			= Ext.getCmp("s_cost").getValue().inputValue;
		var dc_cost_id_s	= Ext.getCmp("s_dc_cost_id_s").getValue();
		var dc_cost_id_e	= Ext.getCmp("s_dc_cost_id_e").getValue();
		var dc_cost_id_r	= Ext.getCmp("s_dc_cost_id_r").getValue();
		var dc_cost_seg		= Ext.getCmp("s_dc_cost_seg").getValue();
		
		
		if( Ext.getCmp("d_save_date1").getValue() == "" || Ext.getCmp("d_save_date2").getValue() == "" ) {
			msg	+= "- กรุณากรอก วันที่บันทึกบัญชีระหว่างวันที่<br>";
		}
		
		if( i_acc == 1 ) {
			dc_acc_id_r	= "";
			if( Ext.getCmp("s_dc_acc_id_s").getValue() == "" || Ext.getCmp("s_dc_acc_id_e").getValue() == "" ) {
				msg	+= "- รายการบัญชีไม่ถูกต้อง<br>";
			}
		} else {
			dc_acc_id_s	= "";
			dc_acc_id_e = "";
			if( Ext.getCmp("s_dc_acc_id_r").getValue() == "" ) { msg	+= "- กรุณาเลือกรายการบัญชี<br>"; }
		}
		
		if( i_cost == 1 ) {
			dc_cost_id_r	= "";
			dc_cost_seg		= "";
			if( Ext.getCmp("s_dc_cost_id_s").getValue() == "" || Ext.getCmp("s_dc_cost_id_e").getValue() == "" ) {
				msg	+= "- หน่วยงานไม่ถูกต้อง<br>";
			}
		} else if ( i_cost == 2 ) {
			dc_cost_id_s	= "";
			dc_cost_id_e	= "";
			dc_cost_seg		= "";
			if( Ext.getCmp("s_dc_cost_id_r").getValue() == "" ) { msg	+= "- กรุณาเลือก หน่วยงาน<br>"; }
		} else if ( i_cost == 3 ) {
			dc_cost_id_s	= "";
			dc_cost_id_e	= "";
			dc_cost_id_r	= "";
			if( Ext.getCmp("s_dc_cost_seg").getValue() == "" ) { msg	+= "- กรุณาเลือก หน่วยงาน<br>"; }
		}
		
		if( msg == "" ) {

			var href		= "report/Rep_AeRep00003.php";
	    	var resultUrl	= "";
	    	
	    	resultUrl	+= "&type="+type;
	    	resultUrl	+= "&d_save_date1="+Ext.util.Format.date(Ext.getCmp("d_save_date1").getValue(), "Y-m-d");
	    	resultUrl	+= "&d_save_date2="+Ext.util.Format.date(Ext.getCmp("d_save_date2").getValue(), "Y-m-d");
	    	
	    	resultUrl	+= "&i_acc="+Ext.getCmp("s_acc").getValue().inputValue;
	    	resultUrl	+= "&dc_acc_id_s="+dc_acc_id_s;
	    	resultUrl	+= "&dc_acc_id_e="+dc_acc_id_e;
	    	resultUrl	+= "&dc_acc_id_r="+dc_acc_id_r;
	    	
	    	resultUrl	+= "&i_cost="+Ext.getCmp("s_cost").getValue().inputValue;
	    	resultUrl	+= "&dc_cost_id_s="+dc_cost_id_s;
	    	resultUrl	+= "&dc_cost_id_e="+dc_cost_id_e;
	    	resultUrl	+= "&dc_cost_id_r="+dc_cost_id_r;
	    	resultUrl	+= "&dc_cost_seg="+dc_cost_seg;
	    	
	    	resultUrl	+= "&i_is_post="+Ext.getCmp("s_is_post").getValue();
	    	
	    	resultUrl	= (resultUrl != "")? "?"+resultUrl.substring(1) : "";
	    	
	    	window.open(href+resultUrl,href);
	      	window.focus();

		} else { Ext.MessageBox.alert("แจ้งเตือน", msg); }
	};
	
	store_month	= new Ext.data.JsonStore({
		fields: [ "id", "c_name" ],
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
    var now = currentTime.getFullYear()+1;
    var yy_en = currentTime.getFullYear()-7;
    while(yy_en <= now) {
    	years.push({ id : yy_en, c_name : yy_en + 543 });
    	yy_en++;
    };
    
	store_year = new Ext.data.JsonStore({
		fields: ["id", "c_name"],
		data : years
	});
	
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
					items: [{
						xtype: "compositefield",
						fieldLabel: "วันที่บันทึกบัญชีระหว่างวันที่",
						anchor: "100%",
						msgTarget: "under",
						items: [{
							xtype: "datefield",
							id: "d_save_date1",
							width: 122,
							listeners : {
								afterrender : function() {
									var date = new Date();
										date = new Date(date.getFullYear()+543, date.getMonth()-2, 1);
									this.setValue(date);
								}
							}
						}, { xtype: "displayfield" ,value: "ถึงเดือน : " }, {
							xtype: "datefield",
							id: "d_save_date2",
							width: 122,
								listeners : { afterrender : function() { this.setValue(addY(543)); } }
						}]
					}, new Ext.form.RadioGroup({
		    			id: "s_acc",
		    			fieldLabel: "เงื่อนไขรายการบัญชี",
		    			columns: [ 110, 150 ],
		    			items: [
								{ boxLabel: "ระหว่างบัญชี", checked: true, name: "s_acc", inputValue: 1 },
								{ boxLabel: "แยกรายละเอียดบัญชี", name: "s_acc", inputValue: 2 }
						],
		    			listeners: {
		    				afterrender: function() {
								this.fn	= function() {
									if( this.getValue().inputValue == 1 ) {
										Ext.getCmp("s_dc_acc_id_s").show();
										Ext.getCmp("s_dc_acc_id_e").show();
										Ext.getCmp("s_dc_acc_id_r").hide();
									} else {
										Ext.getCmp("s_dc_acc_id_s").hide();
										Ext.getCmp("s_dc_acc_id_e").hide();
										Ext.getCmp("s_dc_acc_id_r").show();
									}
								}
								this.fn();
							},
							Change: function(value) { this.fn(); }
						}
					}), new Ext.form.ComboBox({
						id: "s_dc_acc_id_s",
						fieldLabel: "ระหว่างบัญชี",
						width: 300,
						mode: "local",
			            store: store_acc,
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
						id: "s_dc_acc_id_e",
						fieldLabel: "ถึงบัญชี",
						width: 300,
						mode: "local",
			            store: store_acc,
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
					}), new Ext.ux.form.LovCombo({
						id: "s_dc_acc_id_r",
						fieldLabel: "รายการบัญชี",
						width: 300,
				    	mode: "local",
			            store: store_acc_s,
						valueField: "id",
						displayField: "c_name",
						triggerAction: "all",
						forceSelection: true,
						selectOnFocus: true,
						typeAhead : false,
						emptyText: "กรุณาเลือก..."
	           		}), new Ext.form.RadioGroup({
		    			id: "s_cost",
		    			fieldLabel: "เงื่อนไขหน่วยงาน",
		    			columns: [ 110, 150, 100 ],
		    			items: [
								{ boxLabel: "ระหว่างหน่วยงาน", checked: true, name: "s_cost", inputValue: 1 },
								{ boxLabel: "แยกรายละเอียดหน่วยงาน", name: "s_cost", inputValue: 2 },
								{ boxLabel: "Segment", name: "s_cost", inputValue: 3 }
						],
		    			listeners: {
		    				afterrender: function() {
								this.fn	= function() {
									if( this.getValue().inputValue == 1 ) {
										Ext.getCmp("s_dc_cost_id_s").show();
										Ext.getCmp("s_dc_cost_id_e").show();
										Ext.getCmp("s_dc_cost_id_r").hide();
										Ext.getCmp("s_dc_cost_seg").hide();
									} else if( this.getValue().inputValue == 2 ) {
										Ext.getCmp("s_dc_cost_id_s").hide();
										Ext.getCmp("s_dc_cost_id_e").hide();
										Ext.getCmp("s_dc_cost_id_r").show();
										Ext.getCmp("s_dc_cost_seg").hide();
									} else {
										Ext.getCmp("s_dc_cost_id_s").hide();
										Ext.getCmp("s_dc_cost_id_e").hide();
										Ext.getCmp("s_dc_cost_id_r").hide();
										Ext.getCmp("s_dc_cost_seg").show();
									}
								}
								this.fn();
							},
							Change: function(value) { this.fn(); }
						}
					}), new Ext.form.ComboBox({
						id: "s_dc_cost_id_s",
						fieldLabel: "ระหว่างหน่วยงาน",
						width: 300,
						mode: "local",
			            store: store_cost,
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
						id: "s_dc_cost_id_e",
						fieldLabel: "ถึงหน่วยงาน",
						width: 300,
						mode: "local",
			            store: store_cost,
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
					}), new Ext.ux.form.LovCombo({
						id: "s_dc_cost_id_r",
						fieldLabel: "หน่วยงาน",
						width: 300,
				    	mode: "local",
			            store: store_cost_s,
						valueField: "id",
						displayField: "c_name",
						triggerAction: "all",
						forceSelection: true,
						selectOnFocus: true,
						typeAhead : false,
						emptyText: "กรุณาเลือก..."
	           		}), new Ext.form.ComboBox({
						id: "s_dc_cost_seg",
						fieldLabel: "หน่วยงาน",
						width: 300,
						mode: "local",
			            store: store_segment,
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
						id: "s_is_post",
						fieldLabel: "รูปแบบการแสดงข้อมูล",
						width: 150,
						mode: "local",
						store: new Ext.data.SimpleStore({
					    	fields: [ "id", "c_name" ],
					        data: [
					               [ "3", "ทั้งหมด (GX/GL)" ],
					               [ "1", "ยังไม่ผ่านรายการ (GX)" ],
					               [ "2", "ผ่านรายการแล้ว (GL)"]
					              ]
						}),
						value: "3",
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