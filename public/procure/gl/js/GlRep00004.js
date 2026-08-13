Ext.onReady(function() {
	Ext.QuickTips.init();
	
	/*===============================================*/
  	var title_panel		= "งบแสดงฐานะการเงิน (ช่วงเวลา)";
	/*===============================================*/
 

    var last = new Ext.data.JsonStore({
		fields: ['id', 'c_name'],
		data : [
 		        { id : '0', c_name : 'บัญชีคุม' },
		        { id : '1', c_name : 'บัญชีย่อย' }
		       ]
	});
    
 
 	var store_dc_acc	= new Ext.data.JsonStore({
		autoLoad: true,
 		url: "api/All_GlRep00004.php",
		baseParams: { type: "dc_acc", show: "all" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name", "c_name" ],
	    listeners: {
 		}
	});	
	
 	var store_cost_s	= new Ext.data.JsonStore({
		autoLoad: true,
 		url: "api/ALL_GlReportDocs.php",
		baseParams: { type: "dc_cost", show: "all" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name", "cut_name" ],
	    listeners: {
 		}
	});	
 	
	// storeYear
	var years = [];
    var currentTime = new Date();
    var now = currentTime.getFullYear()+1;
    var yy_en = Ext.START_YEAR_ACC;
    while(yy_en <= now) {
    	years.push({ id : yy_en, c_name : yy_en + 543 });
    	yy_en++;
    };
    
	store_year = new Ext.data.JsonStore({
		fields: ["id", "c_name"],
		data : years
	});
 
	
	LookReport = function( type) {
		
		var msg				= "";
		var the_i_show		= Ext.getCmp("i_show").getValue();
		
		if( Ext.getCmp("s_dc_cost_id").getValue() == "" ) { msg	+= "- กรุณาเลือกศูนย์ต้นทุนทางบัญชี<br>"; }
 		if ((the_i_show==true) && (Ext.getCmp("s_dc_acc_id").getValue()=="") ) { msg	+= "- กรุณาเลือกรหัสบัญชี<br>"; }

  		if( msg == "" ) {

			var href		= "report/Rep_GlRep00004.php";
	    	var resultUrl	= "";
 	    	var s_show		= (the_i_show==true) ? 1 : 3;
	    	
	    	resultUrl	+= "&type="+type;
 	    	resultUrl	+= "&year_start="+Ext.getCmp("year").getValue();
 	    	resultUrl	+= "&dc_cost_id="+Ext.getCmp("s_dc_cost_id").getValue();
 	    	resultUrl	+= "&i_show="+s_show;
  	    	resultUrl	+= "&dc_acc_id="+Ext.getCmp("s_dc_acc_id").getValue();
 	    	
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
						id: "year",
						fieldLabel: "ปีงบประมาณ",
						width: 200,
						mode: "local",
			            store: store_year,
						valueField: "id",
						displayField: "c_name",
						triggerAction: "all",
						forceSelection: true,
						selectOnFocus: true,
						typeAhead : false,
						emptyText: "กรุณาเลือก...",
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
							blur: function() { this.getStore().clearFilter(); }
						}
					}), new Ext.ux.form.LovCombo({
						id: "s_dc_cost_id",
						fieldLabel: "ศูนย์ต้นทุนทางบัญชี",
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
	           		}), {
					    	xtype: 'checkbox',
					    	id: "i_show",
		                    boxLabel: 'แสดงรายการระดับบัญชีย่อย',
		                    listeners: {
		           				'check': function (combo, newValue) {
		           					if(newValue == true) {
		           						Ext.getCmp("s_dc_acc_id").show();
		           					} else {
		           						Ext.getCmp("s_dc_acc_id").hide();
		           					}
								}
							}
		                }, new Ext.ux.form.LovCombo({
						id: "s_dc_acc_id",
						fieldLabel: "รหัสบัญชี",
						width: 300,
				    	mode: "local",
			            store: store_dc_acc,
						valueField: "id",
						displayField: "c_name",
						triggerAction: "all",
						forceSelection: true,
						selectOnFocus: true,
						typeAhead : false,
						emptyText: "กรุณาเลือก..."
	           		})
		                
					]
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
	
	Ext.getCmp("s_dc_acc_id").hide();

});
