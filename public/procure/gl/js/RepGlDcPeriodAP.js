Ext.onReady(function() {
	Ext.QuickTips.init();
 
	/*===============================================*/
	var title_panel		= "รายงานปิดงวดเดือน (ระบบบัญชีค่าใช้จ่าย/การเงินจ่าย)";
	/*===============================================*/
 
	LookReport = function( type ) {
		
		var msg		= "";

		if( msg == "" ) {

			var href		= "report/Rep_GlDcPeriodAP.php";
	    	var resultUrl	= "";
	    	
	    	
	    	resultUrl	+= "&type="+type; 
 	    	resultUrl	+= "&year="+Ext.getCmp("year").getValue(); 
	    	
	    	resultUrl	= (resultUrl != "")? "?"+resultUrl.substring(1) : "";
	    	
	    	window.open(href+resultUrl,href);
	      	window.focus();

		} else { Ext.MessageBox.alert("แจ้งเตือน", msg); }
	};

	
	// storeYear
	var years = [];
    var currentTime = new Date(); 
    var now 	= currentTime.getFullYear()+1;
    var yy_en 	= Ext.START_YEAR_ACC;
    
    
    while(yy_en <= now){
    	var yy_th = (yy_en + 543);
        years.push({id : yy_en,c_name : yy_th});
        yy_en++;
    }
    
	var year = new Ext.data.JsonStore({
		fields: ['id','c_name'],
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
					items: [new Ext.form.ComboBox({
							id: 'year',
							fieldLabel: 'ปี',
							store: year,
							valueField: 'id',
							displayField: 'c_name',
							value: (new Date().getFullYear()),
							typeAhead: true,
							mode: 'local',
							triggerAction: 'all',
							emptyText: 'กรุณาเลือก...',
							forceSelection: true,
							selectOnFocus: true,
							anchor: '25%',
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
