Ext.onReady(function() {
	Ext.QuickTips.init();
	
	/*===============================================*/
	if(PAGE == "GlRep00017") {
		var title_panel		= "งบแสดงผลการดำเนินงาน  (ปี)";	
	} else if(PAGE == "GlRep00018") {
		var title_panel		= "งบแสดงฐานะการเงิน (ปี)";
	}
	/*===============================================*/
 

    var last = new Ext.data.JsonStore({
		fields: ["id", "c_name"],
		data : [
 		        { id : "0", c_name : "บัญชีคุม" },
		        { id : "1", c_name : "บัญชีย่อย" }
		       ]
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

	Ext.store_acc_all_parent_lv2 = new Ext.data.JsonStore({
		autoLoad : true,
		url : "api/All_GlRep00017.php",
		baseParams : { type : "dc_acc_main_lv2", show : "all", PAGE: PAGE  },
		root : "data",
		idProperty : "id",
		fields : [ "id", "c_name", "cut_name" ]
	});
	
	Ext.store_acc_all_parent_lv3 = new Ext.data.JsonStore({
		autoLoad : true,
		url : "api/All_GlRep00017.php",
		baseParams : { type : "dc_acc_main_lv3", show : "all", PAGE: PAGE  },
		root : "data",
		idProperty : "id",
		fields : [ "id", "c_name", "cut_name" ]
	});

 	Ext.store_acc_s_parent = new Ext.data.JsonStore({
		autoLoad : true,
		url: "api/All_GlRep00017.php",
		baseParams : { type : "dc_acc_main", show : "all", PAGE: PAGE },
		root : "data",
		idProperty : "id",
		fields : [ "id", "c_name", "cut_name" ]
	});
	
	Ext.store_acc_s_parent_lv5 = new Ext.data.JsonStore({
		autoLoad : true,
		url: "api/All_GlRep00017.php",
		baseParams : { type : "dc_acc_main_lv5", show : "all", PAGE: PAGE },
		root : "data",
		idProperty : "id",
		fields : [ "id", "c_name", "cut_name" ]
	});

	Ext.store_acc_s = new Ext.data.JsonStore({
		autoLoad : true,
		url: "api/All_GlRep00017.php",
		baseParams : { type : "dc_acc", show : "all", PAGE: PAGE },
		root : "data",
		idProperty : "id",
		fields : [ "id", "c_name", "cut_name" ]
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
		
		var msg						= ""; 
		var dc_acc_id				= 0;
		var dc_acc_id_parent_lv2 	=0;
		var dc_acc_id_parent_lv3 	=0;
		var dc_acc_id_parent_lv4 	=0;
		var dc_acc_id_parent_lv5 	=0;		
		
		if( Ext.getCmp("s_dc_cost_id").getValue() == "" ) { msg	+= "- กรุณาเลือกศูนย์ต้นทุนทางบัญชี<br>"; }

		 
		// if (Ext.getCmp("i_show_acc").getValue().inputValue == 2) {
		// 	if (Ext.getCmp("dc_acc_id_parent_lv2").getValue() == "") {
		// 		msg += "- กรุณาเลือก บัญชีคุม Lv2 อย่างน้อย 1 รายการ<br>";
		// 	} else {
		// 		dc_acc_id_parent_lv2 = Ext.getCmp("dc_acc_id_parent_lv2").getValue();
		// 	}
		// }
		// else if (Ext.getCmp("i_show_acc").getValue().inputValue == 3) {
		// 	if (Ext.getCmp("dc_acc_id_parent_lv3").getValue() == "") {
		// 		msg += "- กรุณาเลือก บัญชีคุม Lv3 อย่างน้อย 1 รายการ<br>";
		// 	} else {
		// 		dc_acc_id_parent_lv3 = Ext.getCmp("dc_acc_id_parent_lv3").getValue();
		// 	}
		// }	else  
		
		if (Ext.getCmp("i_show_acc").getValue().inputValue == 4) {
			if (Ext.getCmp("dc_acc_id_parent_lv4").getValue() == "") {
				msg += "- กรุณาเลือก บัญชีคุม Lv4 อย่างน้อย 1 รายการ<br>";
			} else {
				dc_acc_id_parent_lv4 = Ext.getCmp("dc_acc_id_parent_lv4").getValue();
			}
		} else if (Ext.getCmp("i_show_acc").getValue().inputValue == 5) {
			if (Ext.getCmp("dc_acc_id_parent_lv5").getValue() == "") {
				msg += "- กรุณาเลือก บัญชีคุม Lv5 อย่างน้อย 1 รายการ<br>";
			} else {
				dc_acc_id_parent_lv5 = Ext.getCmp("dc_acc_id_parent_lv5").getValue();
			}
		} else {
			if (Ext.getCmp("dc_acc_id").getValue() == "") {
				msg += "- กรุณาเลือก บัญชีย่อยอย่างน้อย 1 รายการ<br>";
			} else {
				dc_acc_id = Ext.getCmp("dc_acc_id").getValue();
			}
		}				

  		if( msg == "" ) {

			var href			= "report/Rep_GlRep00017.php";
			var href_details	= "report/Rep_GlRep00017_dtl.php";
			var resultUrl		= "";
			var bb 				= Ext.getCmp("i_show_acc_level").getValue().inputValue; 
	    	
	    	resultUrl	+= "&type="+type;
	    	resultUrl	+= "&PAGE="+PAGE;
 	    	resultUrl	+= "&year_start="+Ext.getCmp("year").getValue();
 	    	resultUrl	+= "&dc_cost_id="+Ext.getCmp("s_dc_cost_id").getValue();
 	    	resultUrl	+= "&i_show_acc="+ Ext.getCmp("i_show_acc").getValue().inputValue; 
			// resultUrl	+= "&dc_acc_id_parent_lv2=" + dc_acc_id_parent_lv2;
			// resultUrl	+= "&dc_acc_id_parent_lv3=" + dc_acc_id_parent_lv3;
 			resultUrl	+= "&dc_acc_id_parent_lv4=" + dc_acc_id_parent_lv4;
			resultUrl	+= "&dc_acc_id_parent_lv5=" + dc_acc_id_parent_lv5;			
			resultUrl	+= "&dc_acc_id=" + dc_acc_id;
			resultUrl	+= "&i_show_acc_level="+ Ext.getCmp("i_show_acc_level").getValue().inputValue;
 	    	 

			  resultUrl	= (resultUrl != "")? "?"+resultUrl.substring(1) : "";
			  if (bb=="1")
			  {
				  window.open(href+resultUrl,href);
				  window.focus();
			  }	
			  else
			  {
				  window.open(href_details+resultUrl,href_details);
				  window.focus();
			  }				  

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
						xtype : "radiogroup",
						id : "i_show_acc",
						fieldLabel : "รายการบัญชี",
						columns : [ 90, 90, 90, 90, 100 ],
						items : [
						// {
						// 	boxLabel : "บัญชีคุม Lv2",
						// 	name : "i_show_acc",
						// 	inputValue : 2
						// }, {
						// 	boxLabel : "บัญชีคุม Lv3",
						// 	name : "i_show_acc",
						// 	inputValue : 3
						// },
						{
							boxLabel : "บัญชีคุม Lv4",
							name : "i_show_acc",
							inputValue : 4, //1
							checked : true
						}, {
							boxLabel : "บัญชีคุม Lv5",
							name : "i_show_acc",
							inputValue : 5 //3
						}, {
							boxLabel : "บัญชีย่อย",
							name : "i_show_acc",
							inputValue : 6 //2
						}],
						listeners : {
							change : function(obj, value) {
								if (value.inputValue == 2) {
									// Ext.getCmp("dc_acc_id_parent_lv2").show();
									// Ext.getCmp("dc_acc_id_parent_lv3").hide();
									Ext.getCmp("dc_acc_id_parent_lv4").hide();
									Ext.getCmp("dc_acc_id_parent_lv5").hide(); 
									Ext.getCmp("dc_acc_id").hide();
								} 
								else if (value.inputValue == 3) {
									// Ext.getCmp("dc_acc_id_parent_lv2").hide();
									// Ext.getCmp("dc_acc_id_parent_lv3").show();
									Ext.getCmp("dc_acc_id_parent_lv4").hide();
									Ext.getCmp("dc_acc_id_parent_lv5").hide(); 
									Ext.getCmp("dc_acc_id").hide();
								}
								else if (value.inputValue == 4) { 
									// Ext.getCmp("dc_acc_id_parent_lv2").hide();
									// Ext.getCmp("dc_acc_id_parent_lv3").hide();
									Ext.getCmp("dc_acc_id_parent_lv4").show();
									Ext.getCmp("dc_acc_id_parent_lv5").hide();
									Ext.getCmp("dc_acc_id").hide();
								} else if (value.inputValue == 5) {
									// Ext.getCmp("dc_acc_id_parent_lv2").hide();
									// Ext.getCmp("dc_acc_id_parent_lv3").hide();
									Ext.getCmp("dc_acc_id_parent_lv4").hide();
									Ext.getCmp("dc_acc_id_parent_lv5").show();
									Ext.getCmp("dc_acc_id").hide();
								} else { 
									// Ext.getCmp("dc_acc_id_parent_lv2").hide();
									// Ext.getCmp("dc_acc_id_parent_lv3").hide();
									Ext.getCmp("dc_acc_id_parent_lv4").hide();
									Ext.getCmp("dc_acc_id_parent_lv5").hide();
									Ext.getCmp("dc_acc_id").show();
								}
							}
						}
					}
					// , new Ext.ux.form.LovCombo({
					// 	id : "dc_acc_id_parent_lv2",
					// 	fieldLabel : "รายการบัญชีคุม Lv2",
					// 	width : 500,
					// 	mode : "local",
					// 	store : Ext.store_acc_all_parent_lv2,
					// 	valueField : "id",
					// 	displayField : "c_name",
					// 	triggerAction : "all",
					// 	forceSelection : true,
					// 	selectOnFocus : true,
					// 	typeAhead : false,
					// 	hidden : true,
					// 	emptyText : "กรุณาเลือก..."
					// }), new Ext.ux.form.LovCombo({
					// 	id : "dc_acc_id_parent_lv3",
					// 	fieldLabel : "รายการบัญชีคุม Lv3",
					// 	width : 500,
					// 	mode : "local",
					// 	store : Ext.store_acc_all_parent_lv3,
					// 	valueField : "id",
					// 	displayField : "c_name",
					// 	triggerAction : "all",
					// 	forceSelection : true,
					// 	selectOnFocus : true,
					// 	typeAhead : false,
					// 	hidden : true,
					// 	emptyText : "กรุณาเลือก..."
					// })
					, new Ext.ux.form.LovCombo({
						id : "dc_acc_id_parent_lv4",
						fieldLabel : "รายการบัญชีคุม Lv4",
						width : 500,
						mode : "local",
						store : Ext.store_acc_s_parent,
						valueField : "id",
						displayField : "c_name",
						triggerAction : "all",
						forceSelection : true,
						selectOnFocus : true,
						typeAhead : false,
						emptyText : "กรุณาเลือก..."
					}), new Ext.ux.form.LovCombo({
						id : "dc_acc_id_parent_lv5",
						fieldLabel : "รายการบัญชีคุม Lv5",
						width : 500,
						mode : "local",
						store : Ext.store_acc_s_parent_lv5,
						valueField : "id",
						displayField : "c_name",
						triggerAction : "all",
						forceSelection : true,
						selectOnFocus : true,
						typeAhead : false,
						hidden : true,
						emptyText : "กรุณาเลือก..."
					}), new Ext.ux.form.LovCombo({
						id : "dc_acc_id",
						fieldLabel : "รายการบัญชีย่อย",
						width : 500,
						mode : "local",
						store : Ext.store_acc_s,
						valueField : "id",
						displayField : "c_name",
						triggerAction : "all",
						forceSelection : true,
						selectOnFocus : true,
						typeAhead : false,
						hidden : true,
						emptyText : "กรุณาเลือก..."
					}),{
						xtype: "radiogroup",
						id: "i_show_acc_level",
						fieldLabel: "ประเภทแสดงรายการบัญชี",
						columns: [ 200, 200],
						items: 
						[ 
							{
								boxLabel : "แสดงเฉพาะ LV ที่เลือก",
								name : "i_show_acc_level",
								inputValue : 1,
								checked : true
							}, {
								boxLabel : "แสดง LV ที่เลือกถึงบัญชีย่อย",
								name : "i_show_acc_level",
								inputValue : 2
							}
						]
					}]
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
