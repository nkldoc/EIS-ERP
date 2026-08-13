Ext.onReady(function() {
	Ext.QuickTips.init();
	
	/*===============================================*/ 
	if (i_type_report==1)
 	{
		var title_panel		= "รายงานยอดคงเหลือบัญชีแยกประเภท (ตามบัญชี)";
	}
	else
 	{
		var title_panel		= "งบทดลอง (ตามบัญชี)";
	}
	
	/*===============================================*/
	
    var last = new Ext.data.JsonStore({
		fields: ['id', 'c_name'],
		data : [
		        { id : '0', c_name : '- เลือกทั้งหมด -' },
		        { id : '3', c_name : 'บัญชีคุม' },
		        { id : '2', c_name : 'บัญชีย่อย' }
		       ]
	});
    
    var i_show = new Ext.data.JsonStore({
		fields: ['id', 'c_name'],
		data : [
		        { id : '0', c_name : 'ทุกรายการ' },
		        { id : '1', c_name : 'ยอดคงเหลือ' }
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
	
	store_acc_s	= new Ext.data.JsonStore({
		autoLoad: true, 
		url: "api/ALL_GlReportDocs.php",
		baseParams: { type: "dc_acc", show: "all" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name", "cut_name" ],
	    listeners: {
 		}
	});
	
	store_cost_s	= new Ext.data.JsonStore({
		autoLoad: true,
 		url: "api/ALL_GlReportDocs.php",
		baseParams: { type: "dc_cost", show: "all" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name", "cut_name" ],
	    listeners: {
 		}
	});	
	
	
	LookReport = function( type) {
		
		var msg		= "";

		if( Ext.getCmp("s_dc_acc_id").getValue() == "" ) { msg	+= "- กรุณาเลือกรหัสบัญชี<br>"; }
		if( Ext.getCmp("s_dc_cost_id").getValue() == "" ) { msg	+= "- กรุณาเลือกศูนย์ต้นทุน<br>"; }
		
 		if( msg == "" ) {

			var href		= "report/Rep_GlBalanceAccPost.php";
	    	var resultUrl	= "";
	    	
	    	resultUrl	+= "&type="+type;
	    	resultUrl	+= "&month="+Ext.getCmp("month").getValue();
	    	resultUrl	+= "&year="+Ext.getCmp("year").getValue();
	    	resultUrl	+= "&i_last="+Ext.getCmp("i_last").getValue();
	    	resultUrl	+= "&i_show="+Ext.getCmp("i_show").getValue();
	    	resultUrl	+= "&i_type_report="+i_type_report;
	    	resultUrl	+= "&dc_acc_id="+Ext.getCmp("s_dc_acc_id").getValue();
	    	resultUrl	+= "&dc_cost_id="+Ext.getCmp("s_dc_cost_id").getValue();

	    	
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
						value:("00" + (new Date().getMonth() + 1)).substr(-2),
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
					}), new Ext.ux.form.LovCombo({
						id: "s_dc_acc_id",
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
	           		}), new Ext.ux.form.LovCombo({
						id: "s_dc_cost_id",
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
	           		}), 
						new Ext.form.ComboBox({
					    	id: 'i_last',
					    	fieldLabel: 'ประเภทบัญชี',
					    	width: 200,
					    	store: last,
					    	valueField: 'id',
					    	displayField: 'c_name',
					    	value: 0,
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
						}),
						new Ext.form.ComboBox({
					    	id: 'i_show',
					    	fieldLabel: 'รูปแบบแสดงข้อมูล',
					    	width: 200,
					    	store: i_show,
					    	valueField: 'id',
					    	displayField: 'c_name',
					    	value: 0,
					    	typeAhead: true,
					    	mode: 'local',
					    	triggerAction: 'all',
					    	emptyText: 'กรุณาเลือก...',
					    	forceSelection: true,
					    	selectOnFocus: true,
					    	listeners: {
								'change': function (combo, newValue) {
									if (newValue == '')
										combo.reset();
								}
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
