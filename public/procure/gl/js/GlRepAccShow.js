function StoreJson(url, params){	
	return new Ext.data.JsonStore({
		autoLoad: true,
		url : url,
		baseParams: { type: params },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ]
	});	
}

Ext.onReady(function() {
	Ext.QuickTips.init();
	
	/*===============================================*/
	var title_panel		= "รายงานข้อมูล การแสดงรายงานตามบัญชี";
	/*===============================================*/

	Ext.gl_rep_acc_hdr	= StoreJson("api/All_GlRepAccShow.php", "gl_rep_acc_hdr");
	
	// ประเภทการแสดงผล 
	Ext.i_money	= new Ext.data.JsonStore({
		fields: [ "id", "c_name" ],
		data : [
		        { id : "1", c_name : "รายเดือน" },
		        { id : "2", c_name : "รายไตรมาส" },
		        { id : "3", c_name : "รายไตรมาส (ณ สิ้นไตรมาส)" },
		        { id : "4", c_name : "รายปี" }
		       ]
	});
	
	// สถานะข้อมูล
	Ext.i_process_all = new Ext.data.JsonStore({
		fields: [ "id", "c_name" ],
		data : [
		        { id : "1", c_name: "แสดงข้อมูลโดยไม่ต้องประมวลผล" },
		        { id : "2", c_name: "แสดงข้อมูลที่ประมวลผลแล้ว" } 
		       ]
	});

	Ext.i_process_only = new Ext.data.JsonStore({
		fields: [ "id", "c_name" ],
		data : [{ id : "2", c_name : "แสดงข้อมูลที่ประมวลผลแล้ว" }]
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
    
	Ext.store_year = new Ext.data.JsonStore({
		fields: ["id", "c_name"],
		data : years
	});
	
	LookReport = function( type ) {
		
		var msg		= "";
		
		if( Ext.getCmp("gl_rep_acc_hdr_id").getValue() == "" ) { msg += "- กรุณาเลือก ชื่อรายงานตามบัญชี<br>"; }
		if( Ext.getCmp("year").getValue() == "" ) { msg += "- กรุณาเลือก ปี<br>"; }
		if( Ext.getCmp("i_money").getValue() == "" ) { msg += "- กรุณาเลือก ประเภทการแสดงผล<br>"; }
		if( Ext.getCmp("i_process").getValue() == "" ) { msg += "- กรุณาเลือก สถานะข้อมูล<br>"; }
		if( Ext.getCmp("i_is_post").getValue() == "" ) { msg += "- กรุณาเลือก การแสดงข้อมูล<br>"; }
		
		if( msg == "" ) {

			var href		= "report/Rep_GlRepAccShow.php";
	    	var resultUrl	= "";
	    	
	    	resultUrl	+= "&type="+type;
	    	
	    	resultUrl	+= "&gl_rep_acc_hdr_id="+Ext.getCmp("gl_rep_acc_hdr_id").getValue();
	    	resultUrl	+= "&year="+Ext.getCmp("year").getValue();
	    	resultUrl	+= "&i_money="+Ext.getCmp("i_money").getValue();
	    	resultUrl	+= "&i_process="+Ext.getCmp("i_process").getValue();
	    	resultUrl	+= "&i_is_post="+Ext.getCmp("i_is_post").getValue();
	    	
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
						fieldLabel: "ชื่อรายงานตามบัญชี",
						id: "gl_rep_acc_hdr_id",
						store: Ext.gl_rep_acc_hdr,
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
						fieldLabel: "ปี",
						id: "year",
						store: Ext.store_year,
						valueField: "id",
						displayField: "c_name",
						mode: "local",
						triggerAction: "all",
						emptyText: "กรุณาเลือก...",
						width: 300,
						forceSelection: true,
						selectOnFocus: true,
						typeAhead: false,
						value:new Date().getFullYear(),
						listeners: {
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
						fieldLabel: "ประเภทการแสดงผล",
						id: "i_money",
						store: Ext.i_money,
						valueField: "id",
						displayField: "c_name",
						mode: "local",
						triggerAction: "all",
						emptyText: "กรุณาเลือก...",
						width: 300,
						forceSelection: true,
						selectOnFocus: true,
						typeAhead: false,
						value: "1",
						listeners: {
							beforequery: function(q) {
								if (q.query) {
									var length = q.query.length;
									q.query = new RegExp(Ext.escapeRe(q.query));
									q.query.length = length;
								}
							},
							blur: function() { this.getStore().clearFilter(); },
							select: function (combo) { 
								if( Ext.getCmp("i_money").value == 3 ) {
									Ext.getCmp("i_process").bindStore(Ext.i_process_only);
									Ext.getCmp("i_process").setValue(2);
								} else {
									Ext.getCmp("i_process").bindStore(Ext.i_process_all);
								}
										
							}
						}
					}), new Ext.form.ComboBox({
						fieldLabel: "สถานะข้อมูล",
						id: "i_process",
						store: Ext.i_process_all,
						valueField: "id",
						displayField: "c_name",
						mode: "local",
						triggerAction: "all",
						emptyText: "กรุณาเลือก...",
						width: 300,
						forceSelection: true,
						selectOnFocus: true,
						typeAhead: false,
						value: "1",
						listeners: {
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
						fieldLabel: "การแสดงข้อมูล",
						id: "i_is_post",
						store: new Ext.data.JsonStore({
							fields: [ "id", "c_name" ],
							data : [
							        { id : "1", c_name : "ทั้งหมด(GX/GL)" },
							        { id : "2", c_name : "ยังไม่ผ่านรายการ (GX)" },
							        { id : "3", c_name : "ผ่านรายการแล้ว (GL)" }
							       ]
						}),
						valueField: "id",
						displayField: "c_name",
						mode: "local",
						triggerAction: "all",
						emptyText: "กรุณาเลือก...",
						width: 300,
						forceSelection: true,
						selectOnFocus: true,
						typeAhead: false,
						value: "1",
						listeners: {
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