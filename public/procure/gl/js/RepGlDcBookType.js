Ext.onReady(function() {
	Ext.QuickTips.init();
	
	/*===============================================*/
	var title_panel		= "รายงานประเภทสมุดบัญชี";
	/*===============================================*/
 
	LookReport = function( type ) {
		
		var msg		= "";

		if( msg == "" ) {

			var href		= "report/Rep_GlDcBookType.php";
	    	var resultUrl	= "";
	    	
	    	
	    	resultUrl	+= "&type="+type; 
	    	resultUrl	+= "&i_enable="+Ext.getCmp("i_enable").getValue(); 
	    	
	    	resultUrl	= (resultUrl != "")? "?"+resultUrl.substring(1) : "";
	    	
	    	window.open(href+resultUrl,href);
	      	window.focus();

		} else { Ext.MessageBox.alert("แจ้งเตือน", msg); }
	};
	
    // สถานะ 
    var storeStatus = new Ext.data.JsonStore({
            fields: ['id', 'c_name'],
            data : [
                    { id : '0', c_name : 'เลือกทั้งหมด' },
                    { id : ''+Ext.CONF_STATUS_ENABLE, c_name : 'ใช้งาน' },
                    { id : ''+Ext.CONF_STATUS_DISABLE, c_name : 'ไม่ใช้งาน' }
                   ]
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
					items: [ 
						new Ext.form.ComboBox({
                                id: "i_enable",
                                fieldLabel: 'สถานะ',
                                store: storeStatus,
                                valueField: 'id',
                                displayField: 'c_name',
                                hiddenName:'i_enable',
                                value: '1',
                                width: 150,
                                typeAhead: true,
                                mode: 'local',
                                triggerAction: 'all',
                                emptyText: 'กรุณาเลือก...',
                                forceSelection: true,
                                selectOnFocus: true
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
