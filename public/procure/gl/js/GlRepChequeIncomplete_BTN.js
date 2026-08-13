Ext.onReady(function() {
	Ext.QuickTips.init();
	
	/*===============================================*/
	var title_panel		= "รายงานเช็คจ่ายที่ไม่สมบูรณ์ (BTN) - กระแสรายวัน";
	/*===============================================*/
	
	dc_bank = new Ext.data.JsonStore({
		autoDestroy : false,
		autoLoad : true,
		url: "api/All_GlRep00013.php",
		baseParams : { type : "dc_bank", all : "all" },
		root : "data",
		idProperty : "id",
		fields : [ "id", "c_name" ]
	});
  
		dc_bank_acc_company	= new Ext.data.JsonStore({
		autoDestroy : false,
		autoLoad : false,
		url: "api/All_GlRep00013.php",
		baseParams : { type : "vw_dc_bank_acc_company", all : "all"  },
		root : "data",
		idProperty : "id",
		fields : [ "id", "c_name" ]
	});

	
	LookReport = function( type ) {
		
		var msg		= "";

		if(Ext.getCmp("dc_bank_id").getValue() == "") { msg += "- กรุณาเลือก ธนาคาร<br>"; }
		if(Ext.getCmp("dc_bank_acc_company_id").getValue() == "") { msg += "- กรุณาเลือก เลขที่บัญชี<br>"; }
		if(Ext.getCmp("date_start").getValue() == "" && Ext.getCmp("date_end").getValue() == "") {
			msg += "- กรุณาเลือก ช่วงวันที่<br>";
		}
		
		if( msg == "" ) {

			var href		= "report/Rep_GlRepChequeIncompleteALL.php";
			var pp			= "GlRepChequeIncomplete_BTN";
	    	var resultUrl	= "";
			
	    	resultUrl	+= "&type="+type;
	    	resultUrl	+= "&page="+pp; 
	    	resultUrl	+= "&dc_bank_id="+Ext.getCmp("dc_bank_id").getValue();
	    	resultUrl	+= "&dc_bank_acc_company_id="+Ext.getCmp("dc_bank_acc_company_id").getValue();
	    	resultUrl	+= "&date_start="+Ext.util.Format.date(Ext.getCmp("date_start").getValue(), "Y-m-d");
	    	resultUrl	+= "&date_end="+Ext.util.Format.date(Ext.getCmp("date_end").getValue(), "Y-m-d");
	    	
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
					items: [new Ext.ux.form.LovCombo({
						id : "dc_bank_id",
						fieldLabel : "ธนาคาร",
						width : 600,
						mode : "local",
						store : dc_bank,
						valueField : "id",
						displayField : "c_name",
						triggerAction : "all",
						forceSelection : true,
						selectOnFocus : true,
						typeAhead : false,
						emptyText : "กรุณาเลือก...",
						listeners : {
							"change": function (combo, newValue) {
								Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
								dc_bank_acc_company.load({
								    params : { dc_bank_id: newValue },
								    callback : function() {
								    	Ext.getCmp("contenterCenter").getEl().unmask();
								    	Ext.getCmp("dc_bank_acc_company_id").clearValue();
								    }
								});
							},
						}
					}), new Ext.ux.form.LovCombo({
						id : "dc_bank_acc_company_id",
						fieldLabel : "เลขที่บัญชี",
						width : 800,
						mode : "local",
						store : dc_bank_acc_company,
						valueField : "id",
						displayField : "c_name",
						triggerAction : "all",
						forceSelection : true,
						selectOnFocus : true,
						typeAhead : false,
						emptyText : "กรุณาเลือก..."
					}), {
						xtype: "compositefield",
						fieldLabel: "วันที่",
						anchor: "100%",
						msgTarget: "under",
						items: [{
							xtype: "datefield",
							id: "date_start",
							width: 127,
							listeners : {
								afterrender : function() {
									var date = new Date();
										date = new Date(date.getFullYear()+543, date.getMonth(), 1);
									this.setValue(date);
								}
							}
						}, { xtype: "displayfield", value: "ถึงวันที่", width: 36, align:"center" }, {
							xtype: "datefield",
							id: "date_end",
							width: 127,
							value: addY(543)
						}]
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
