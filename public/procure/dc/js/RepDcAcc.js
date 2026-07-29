Ext.onReady(function() {
	Ext.QuickTips.init();
	
	/*===============================================*/
	var title_panel		= "รายงานผังบัญชี";
	/*===============================================*/
	
 	// หมวดผังบัญชี
	var dc_acc = new Ext.data.JsonStore({
	    autoDestroy: true,
		autoLoad: true,
	    url : 'api/ALL_RepDcAcc.php',
	    baseParams: { type: 'dc_acc' },
	    root: 'data',
	    idProperty: 'id',
		fields: [
			{ name: 'id' },
			{ name: 'c_name', type: 'string' }
		],
		listeners: {
	        load: function(t, records, options) {
	        	Ext.getCmp("i_group").setValue(0);
	        }
		}
	});
 
 	// บัญชีคุม/ย่อย
	var last = new Ext.data.JsonStore({
		fields: ['id', 'c_name'],
		data : [
		        { id : '0', c_name : '-- เลือกทั้งหมด --' },
		        { id : '2', c_name : 'บัญชีคุม' },
		        { id : '1', c_name : 'บัญชีย่อย' }
		       ]
	});
 
     // สถานะ 
    var storeStatus = new Ext.data.JsonStore({
            fields: ['id', 'c_name'],
            data : [
                    { id : '0', c_name : 'เลือกทั้งหมด' },
                    { id : ''+Ext.CONF_STATUS_ENABLE, c_name : 'ใช้งาน' },
                    { id : ''+Ext.CONF_STATUS_DISABLE, c_name : 'ไม่ใช้งาน' }
                   ]
    });	
    
    
 
	LookReport = function( type ) {
		
		var msg		= "";

		if( msg == "" ) {

			var href		= "report/Rep_DcAcc.php";
	    	var resultUrl	= "";
	    	
	    	
	    	resultUrl	+= "&type="+type; 
	    	resultUrl	+= "&i_group="+Ext.getCmp("i_group").getValue(); 
	    	resultUrl	+= "&i_last="+Ext.getCmp("i_last").getValue(); 	    		    	
	    	resultUrl	+= "&i_enable="+Ext.getCmp("i_enable").getValue(); 
	    	
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
    						id: 'i_group',
                            width: 200,
                            xtype: 'combobox',
    						fieldLabel: 'หมวดบัญชี',
    						store: dc_acc,
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
    					}),new Ext.form.ComboBox({
    						id: 'i_last',
    						width: 200,
                            xtype: 'combobox',
    						fieldLabel: 'บัญชีคุม/ย่อย',
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
    								if (newValue == '')
    									combo.reset();
    							}
    						}
    					}), 
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
