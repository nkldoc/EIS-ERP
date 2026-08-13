Ext.onReady(function() {
	Ext.QuickTips.init();
	
	/*===============================================*/
  	var title_panel		= "งบแสดงผลการดำเนินงาน ";
	/*===============================================*/
	var store_acc_all_parent_lv2 = new Ext.data.JsonStore({
		autoLoad : true,
		url : "api/All_GlRep00001.php",
		baseParams : { type : "dc_acc_main_lv2", show : "all" },
		root : "data",
		idProperty : "id",
		fields : [ "id", "c_name", "cut_name" ]
	});
	
	var store_acc_all_parent_lv3 = new Ext.data.JsonStore({
		autoLoad : true,
		url : "api/All_GlRep00001.php",
		baseParams : { type : "dc_acc_main_lv3", show : "all" },
		root : "data",
		idProperty : "id",
		fields : [ "id", "c_name", "cut_name" ]
	});
	
	var store_acc_all_parent_lv4 = new Ext.data.JsonStore({
		autoLoad : true,
		url : "api/All_GlRep00001.php",
		baseParams : { type : "dc_acc_main_lv4", show : "all" },
		root : "data",
		idProperty : "id",
		fields : [ "id", "c_name", "cut_name" ]
	});
	
	var store_acc_all_parent_lv5 = new Ext.data.JsonStore({
		autoLoad : true,
		url : "api/All_GlRep00001.php",
		baseParams : { type : "dc_acc_main_lv5", show : "all" },
		root : "data",
		idProperty : "id",
		fields : [ "id", "c_name", "cut_name" ]
	});

	var store_acc_all = new Ext.data.JsonStore({
		autoLoad : true,
		url : "api/All_GlRep00001.php",
		baseParams : { type : "dc_acc", show : "all" },
		root : "data",
		idProperty : "id",
		fields : [ "id", "c_name", "cut_name" ]
	});
	
 	var store_dc_cost	= new Ext.data.JsonStore({
		autoLoad: true,
 		url: "api/All_GlRep00001.php",
		baseParams: { type: "dc_cost", show: "all",i_type_user : Ext.SS_I_TYPE_USER,fix_dc_cost_acc_id : Ext.SS_DC_COST_ACC_ID },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name"],
	    listeners: {
 		}
	});	
	
     var store_status = new Ext.data.JsonStore({
		fields: ['id', 'c_name'],
		data : [
 						{ id : "1", c_name : "ยอดแต่ละเดือน" },
						{ id : "2", c_name : "ยอดสะสม" }
		       ]
	});


    var last = new Ext.data.JsonStore({
		fields: ['id', 'c_name'],
		data : [
 		        { id : '0', c_name : 'บัญชีคุม' },
		        { id : '1', c_name : 'บัญชีย่อย' }
		       ]
	});
 
 
	
	var store_month = new Ext.data.JsonStore({
		fields: ["id", "c_name"],
		data : [{ id : "01", c_name : "มกราคม" },
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
		
		var msg		= "";
		var dc_acc_id_parent_lv2 =0;
		var dc_acc_id_parent_lv3 =0;
		var dc_acc_id_parent_lv4 =0;
		var dc_acc_id_parent_lv5 =0;
		var dc_acc_id =0;
		
		
		if (Ext.getCmp("i_show_acc").getValue().inputValue == 2) {
			if (Ext.getCmp("dc_acc_id_parent_lv2").getValue() == "") {
				msg += "- กรุณาเลือก บัญชีคุม Lv2 อย่างน้อย 1 รายการ<br>";
			} else {
				dc_acc_id_parent_lv2 = Ext.getCmp("dc_acc_id_parent_lv2").getValue();
			}
		}
		else if (Ext.getCmp("i_show_acc").getValue().inputValue == 3) {
			if (Ext.getCmp("dc_acc_id_parent_lv3").getValue() == "") {
				msg += "- กรุณาเลือก บัญชีคุม Lv3 อย่างน้อย 1 รายการ<br>";
			} else {
				dc_acc_id_parent_lv3 = Ext.getCmp("dc_acc_id_parent_lv3").getValue();
			}
		}	 
		else if (Ext.getCmp("i_show_acc").getValue().inputValue == 4) {
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

		/*	ใส่ทีหลัง
		if (Ext.getCmp("dc_cost_id").getValue() == "") {
			msg += "- กรุณาเลือก ศูนย์ต้นทุนทางบัญชีอย่างน้อย 1 รายการ<br>";
		} else {
			dc_cost_id = Ext.getCmp("dc_cost_id").getValue();
		}*/
			
 		if( msg == "" ) {

			var href				= "report/Rep_GlRep00001.php";
			var href_details		= "report/Rep_GlRep00001_dtl.php";
	    	var resultUrl			= "";
	    	var bb 					= Ext.getCmp("i_show_acc_level").getValue().inputValue; 
			
	    	resultUrl	+= "&type="+type;
	    	resultUrl	+= "&month_start="+Ext.getCmp("month").getValue();
	    	resultUrl	+= "&year_start="+Ext.getCmp("year").getValue(); 
  	    	resultUrl	+= "&i_status="+Ext.getCmp("i_status").getValue();
			resultUrl	+= "&i_show_acc="+ Ext.getCmp("i_show_acc").getValue().inputValue;
 			resultUrl	+= "&dc_acc_id_parent_lv2=" + dc_acc_id_parent_lv2;
			resultUrl	+= "&dc_acc_id_parent_lv3=" + dc_acc_id_parent_lv3;
 			resultUrl	+= "&dc_acc_id_parent_lv4=" + dc_acc_id_parent_lv4;
			resultUrl	+= "&dc_acc_id_parent_lv5=" + dc_acc_id_parent_lv5;
			resultUrl	+= "&dc_acc_id=" + dc_acc_id;
			resultUrl	+= "&i_show_acc_level="+ Ext.getCmp("i_show_acc_level").getValue().inputValue;
			//resultUrl	+= "&dc_cost_id=" + dc_cost_id;

	    	
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
						id: "month",
						fieldLabel: "เดือน",
						width: 200,
						mode: "local",
			            store: store_month,
						valueField: "id",
						displayField: "c_name",
						triggerAction: "all",
						forceSelection: true,
						selectOnFocus: true,
						typeAhead : false,
						emptyText: "กรุณาเลือก...",
						value: ("00" + (new Date().getMonth() + 1)).substr(-2),
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
						id: "year",
						fieldLabel: "ปี",
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
					}),new Ext.form.ComboBox({
					    	id: 'i_status',
					    	fieldLabel: 'แสดงผลแบบ',
					    	width: 200,
					    	store: store_status,
					    	valueField: 'id',
					    	displayField: 'c_name',
					    	value: 1,
					    	typeAhead: true,
					    	mode: 'local',
					    	triggerAction: 'all',
					    	emptyText: 'กรุณาเลือก...',
					    	forceSelection: true,
					    	selectOnFocus: true,
					    	listeners: {
								'change': function (combo, newValue) {
 								}
							}
						}) 
					, {
						xtype: "radiogroup",
						id: "i_show_acc",
						fieldLabel: "รายการบัญชี",
						columns: [ 90, 90,90, 90, 100 ],
						items: [
						{
							boxLabel : "บัญชีคุม Lv2",
							name : "i_show_acc",
							inputValue : 2
						}, {
							boxLabel : "บัญชีคุม Lv3",
							name : "i_show_acc",
							inputValue : 3
						},{
							boxLabel : "บัญชีคุม Lv4",
							name : "i_show_acc",
							inputValue : 4
						}, {
							boxLabel : "บัญชีคุม Lv5",
							name : "i_show_acc",
							inputValue : 5
						}, {
							boxLabel : "บัญชีย่อย",
							name : "i_show_acc",
							inputValue : 6,
							checked : true
						}],
						listeners : {
							change : function(obj, value) {
  
								if (value.inputValue == 2) {
									Ext.getCmp("dc_acc_id_parent_lv2").show();
									Ext.getCmp("dc_acc_id_parent_lv3").hide();
									Ext.getCmp("dc_acc_id_parent_lv4").hide();
									Ext.getCmp("dc_acc_id_parent_lv5").hide(); 
									Ext.getCmp("dc_acc_id").hide();
								} 
								else if (value.inputValue == 3) {
									Ext.getCmp("dc_acc_id_parent_lv2").hide();
									Ext.getCmp("dc_acc_id_parent_lv3").show();
									Ext.getCmp("dc_acc_id_parent_lv4").hide();
									Ext.getCmp("dc_acc_id_parent_lv5").hide(); 
									Ext.getCmp("dc_acc_id").hide();
								}
								else if (value.inputValue == 4) { 
									Ext.getCmp("dc_acc_id_parent_lv2").hide();
									Ext.getCmp("dc_acc_id_parent_lv3").hide();
									Ext.getCmp("dc_acc_id_parent_lv4").show();
									Ext.getCmp("dc_acc_id_parent_lv5").hide();
									Ext.getCmp("dc_acc_id").hide();
								} else if (value.inputValue == 5) {
									Ext.getCmp("dc_acc_id_parent_lv2").hide();
									Ext.getCmp("dc_acc_id_parent_lv3").hide();
									Ext.getCmp("dc_acc_id_parent_lv4").hide();
									Ext.getCmp("dc_acc_id_parent_lv5").show();
									Ext.getCmp("dc_acc_id").hide();
								} else { 
									Ext.getCmp("dc_acc_id_parent_lv2").hide();
									Ext.getCmp("dc_acc_id_parent_lv3").hide();
									Ext.getCmp("dc_acc_id_parent_lv4").hide();
									Ext.getCmp("dc_acc_id_parent_lv5").hide();
									Ext.getCmp("dc_acc_id").show();
								}
							}
						}
					}, new Ext.ux.form.LovCombo({
						id : "dc_acc_id_parent_lv2",
						fieldLabel : "รายการบัญชีคุม Lv2",
						width : 500,
						mode : "local",
						store : store_acc_all_parent_lv2,
						valueField : "id",
						displayField : "c_name",
						triggerAction : "all",
						forceSelection : true,
						selectOnFocus : true,
						typeAhead : false,
						hidden : true,
						emptyText : "กรุณาเลือก..."
					}), new Ext.ux.form.LovCombo({
						id : "dc_acc_id_parent_lv3",
						fieldLabel : "รายการบัญชีคุม Lv3",
						width : 500,
						mode : "local",
						store : store_acc_all_parent_lv3,
						valueField : "id",
						displayField : "c_name",
						triggerAction : "all",
						forceSelection : true,
						selectOnFocus : true,
						typeAhead : false,
						hidden : true,
						emptyText : "กรุณาเลือก..."
					}), new Ext.ux.form.LovCombo({
						id : "dc_acc_id_parent_lv4",
						fieldLabel : "รายการบัญชีคุม Lv4",
						width : 500,
						mode : "local",
						store : store_acc_all_parent_lv4,
						valueField : "id",
						displayField : "c_name",
						triggerAction : "all",
						forceSelection : true,
						selectOnFocus : true,
						typeAhead : false,
						hidden : true,
						emptyText : "กรุณาเลือก..."
					}), new Ext.ux.form.LovCombo({
						id : "dc_acc_id_parent_lv5",
						fieldLabel : "รายการบัญชีคุม Lv5",
						width : 500,
						mode : "local",
						store : store_acc_all_parent_lv5,
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
						width : 700,
						mode : "local",
						store : store_acc_all,
						valueField : "id",
						displayField : "c_name",
						triggerAction : "all",
						forceSelection : true,
						selectOnFocus : true,
						typeAhead : false, 
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
					}	
					/*, new Ext.ux.form.LovCombo({
						id : "dc_cost_id",
						fieldLabel : "ศูนย์ต้นทุนทางบัญชี",
						width : 700,
						mode : "local",
						store : store_dc_cost,
						valueField : "id",
						displayField : "c_name",
						triggerAction : "all",
						forceSelection : true,
						selectOnFocus : true,
						typeAhead : false, 
						emptyText : "กรุณาเลือก..."
						,checkField:'checked'
					})*/	
						
						
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
});
