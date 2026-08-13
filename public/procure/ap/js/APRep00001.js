Ext.onReady(function() {
	Ext.QuickTips.init();
	
	/*===============================================*/
	var title_panel		= "รายงานงบประมาณที่ส่งเข้ามาที่ฝ่ายการเงิน";
	/*===============================================*/
 
	 // สถานะการผ่านบัญชี
	var i_is_post = new Ext.data.JsonStore({
		fields: ['id', 'c_name'],
		data : [
		        { id : '1', c_name : 'ทั้งหมด (GX/GL)' },
		        { id : '2', c_name : 'ยังไม่ผ่านรายการ (GX)' },
		        { id : '3', c_name : 'ผ่านรายการแล้ว(GL)' }
		       ]
	});

	 // สถานะปฏิทิน
	var i_show_calendar = new Ext.data.JsonStore({
		fields: ['id', 'c_name'],
		data : [
		        { id : '1', c_name : 'วันที่บันทึกเอกสาร' },
		        { id : '2', c_name : 'วันที่ตัดจ่ายโดยรวม (PV)' } 
		       ]
	});
 
	// ประเภท งบประมาณ
	var store_dc_bg_type = new Ext.data.JsonStore({
	    autoDestroy: true,
		autoLoad: true,
	    url : 'api/ALL_APRep00001.php',
	    baseParams: { type: 'dc_bg_type' },
	    root: 'data',
	    idProperty: 'id',
		fields: [
			{ name: 'id' },
			{ name: 'c_name', type: 'string' }
		],
		listeners: {
	        load: function(t, records, options) {
	        	Ext.getCmp("dc_bg_type_id").setValue(records[0].id);
	        }
		}
	});
	 
	
	LookReport = function( type ) {
		
		var msg		= "";

		if( msg == "" ) {

			var href		= "report/Rep_APRep00001.php";
	    	var resultUrl	= "";
			
	    	resultUrl	+= "&type="+type; 
	    	resultUrl	+= "&date_start="+Ext.util.Format.date(Ext.getCmp('date_start').getValue(),'Y-m-d');
	    	resultUrl	+= "&date_end="+Ext.util.Format.date(Ext.getCmp('date_end').getValue(),'Y-m-d');
	     	resultUrl	+= "&dc_bg_type_id="+Ext.getCmp("dc_bg_type_id").getValue();
	    	resultUrl	+= "&i_show_calendar="+Ext.getCmp("i_show_calendar").getValue();
	    	
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
						id: 'i_show_calendar',
						fieldLabel: 'เลือกค้นหาจาก',
						store: i_show_calendar,
						valueField: 'id',
						displayField: 'c_name',
						value: '1',
						width: 262,
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
					}),{
						xtype: 'compositefield',
						fieldLabel: ' ',
						anchor: '100%',
						msgTarget: 'under',
						items: [{
							xtype: 'datefield',
							id: 'date_start',
							value: addY(543)
						},{
							xtype: 'displayfield', value: 'ถึงวันที่', width: 36, align:'center'
						},{
							xtype: 'datefield',
							id: 'date_end',
							value: addY(543)
						}]
	                } 
					,new Ext.form.ComboBox({
						id: 'i_is_post',
						fieldLabel: 'สถานะการผ่านรายการบัญชี',
						store: i_is_post,
						valueField: 'id',
						displayField: 'c_name',
						value: '1',
						width: 262,
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
						id: 'dc_bg_type_id',
						fieldLabel: 'ประเภทงบ',
						store: store_dc_bg_type,
						valueField: 'id',
						displayField: 'c_name',
						width: 262,
						typeAhead: true,
						mode: 'local',
						triggerAction: 'all',
						emptyText: 'กรุณาเลือก...',
						forceSelection: true,
						selectOnFocus: true,
						listeners: {
							'change': function (combo, newValue) {
								if (newValue == '')
									combo.setValue(combo.startValue);
							}
						}
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
});
