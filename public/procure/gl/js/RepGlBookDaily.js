Ext.onReady(function() {
	Ext.QuickTips.init();
	
	/*===============================================*/
	var title_panel		= "รายงานสมุดรายวัน";
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
	
	// ประเภทสมุด
	var gl_dc_book_type = new Ext.data.JsonStore({
	    autoDestroy: true,
		autoLoad: true,
	    url : 'api/ALL_RepGlBookDaily.php',
	    baseParams: { type: 'gl_dc_book_type' },
	    root: 'data',
	    idProperty: 'id',
		fields: [
			{ name: 'id' },
			{ name: 'c_name', type: 'string' }
		],
		listeners: {
	        load: function(t, records, options) {
	        	Ext.getCmp("gl_dc_book_type_id").setValue(records[0].id);
	        }
		}
	});
	
	store_dc_user_s = new Ext.data.JsonStore({
		autoLoad : true,
		url : "api/ALL_GlReportDocs.php",
		baseParams : {
			type : "dc_user",
			show : "all"
		},
		root : "data",
		idProperty : "id",
		fields : [ "id", "c_name" ]
	});

	LookReport = function( type ) {
		
		var msg		= "";
		if (Ext.getCmp("s_dc_user_id").getValue() == "") { msg += "- กรุณาเลือกผู้สร้างรายการ<br>"; }
		

		if( msg == "" ) {

			var href		= "report/Rep_RepGlBookDaily.php";
	    	var resultUrl	= "";
			
	    	resultUrl	+= "&type="+type; 
	    	resultUrl	+= "&date_start="+Ext.util.Format.date(Ext.getCmp('date_start').getValue(),'Y-m-d');
	    	resultUrl	+= "&date_end="+Ext.util.Format.date(Ext.getCmp('date_end').getValue(),'Y-m-d');
	    	resultUrl	+= "&gl_dc_book_type_id="+Ext.getCmp("gl_dc_book_type_id").getValue();
			resultUrl	+= "&i_is_post="+Ext.getCmp("i_is_post").getValue();
			resultUrl   += "&dc_user_id=" + Ext.getCmp("s_dc_user_id").getValue();
			resultUrl	+= "&c_ref_doc="+Ext.getCmp("s_c_ref_doc").getValue();
	    	
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
					items: [{
						xtype: 'compositefield',
						fieldLabel: 'วันที่บันทึกบัญชีระหว่างวันที่',
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
	                },
	                new Ext.form.ComboBox({
						id: 'gl_dc_book_type_id',
						fieldLabel: 'ประเภทสมุด',
						store: gl_dc_book_type,
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
					}),
					new Ext.form.ComboBox({
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
					}),
					new Ext.ux.form.LovCombo({
						id : "s_dc_user_id",
						fieldLabel : "ผู้สร้างรายการ",
						width : 300,
						mode : "local",
						store : store_dc_user_s,
						valueField : "id",
						displayField : "c_name",
						triggerAction : "all",
						forceSelection : true,
						selectOnFocus : true,
						typeAhead : false,
						emptyText : "กรุณาเลือก..."
					}),
					{
						id : "s_c_ref_doc",
						xtype: "textfield",
					  	fieldLabel: "เลขที่เอกสาร", 
					  	name: "c_name",
					  	width: 300
					}
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
