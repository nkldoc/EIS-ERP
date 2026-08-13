Ext.onReady(function() {
	Ext.QuickTips.init(); 
	// constructor
	var mainfileUrl		= 'api/RepPrSectionTax.php'; 				//name main file manage extjs	 
	// หน่วยธุระกิจ 
	var dc_section_tax = new Ext.data.JsonStore({
		autoDestroy: true,
		autoLoad: true,
		url : 'api/All_TaxCombo.php',
		baseParams: { type: 'storeDcSectionTax', i_all : 1, all_text:'เลือกทั้งหมด'},
		root: 'data',
		idProperty: 'id',
	    fields: [ 'id', 'c_name' ]
	});
 //======================== GlTransPurchase.js 
	var LookReport = function(act){
					var form 		= Ext.getCmp("frm-ui").getForm();  
					var topicReport = Ext.getCmp('dc_section_tax_id').value;  
				
					if(topicReport==''){		
						 Ext.Msg.alert('Failure', 'กรุณาเลือก มาตรา');  
					}else if (form.isValid()){
				
					window.open(mainfileUrl+'?act='+act+'&dc_section_tax_id='+topicReport,'_blank'); 
				    window.focus();   
				}
	};
	
    var panelForm = {
		region: 'center',
		title: 'รายงานหมวดภาษีอากร',
		xtype: 'panel',
		border: false,
		stripeRows: true,
		loadMask: true,
		items: [
		        
		{
			xtype: 'form',
			id:'frm-ui',
			frame: true,
			url: mainfileUrl,
			labelWidth: 150,
			bodyStyle: { padding: '10px 20px' },
			defaults: { anchor: '100%', msgTarget: 'side', allowBlank: false },
			buttonAlign: 'left',
			items: [{
				xtype: 'container',
				layout: 'hbox',
				align: 'stretch',
				defaults: { xtype: 'fieldset', flex:1, margins : '0px 3px', autoHeight: true },
				items: [{
					title: 'เลือกเงื่อนไขในการแสดงข้อมูล',
					defaults: { allowBlank: false },
					items: [ 
			           		new Ext.ux.form.LovCombo({
								id: 'dc_section_tax_id',
								fieldLabel: 'มาตรา',
								width:300,
								store: dc_section_tax,
								valueField: 'id',
								displayField: 'c_name',
								typeAhead: true,
								mode: 'local',
								triggerAction: 'all',
								emptyText: 'กรุณาเลือก...',
								forceSelection: true,
						    	selectOnFocus: true,
						    	validator: function(val) {
					        		if (!Ext.isEmpty(val)) {  
					        			return true; 
					        		} else {
					        			return "กรุณาเลือก มาตรา";
					        		}
					        	},
			           		}),  
						]
				}]
			}],
			buttons: [{ 
			    text: 'แสดงรายงานสำหรับ HTML',  
			    scale:'small',  
			    iconCls: 'page_magnify' , 
			    handler:function(){ LookReport('html'); },
			},{ 
			    text: 'แสดงรายงานสำหรับ Excel',  
			    scale:'small',  
			    iconCls: 'icon-excel' , 
			    handler:function(){ LookReport('excel');},
			},{ 
			    text: 'แสดงรายงานสำหรับ Print',  
			    scale:'small',  
			    iconCls: 'icon-print-color' , 
			    handler:function(){ LookReport('print'); },
			}]
		}]
	};
		 	
	/*====================== CENTER ======================*/
	var center = new Ext.TabPanel({
		region: 'center',
		border: false,
		activeTab: 0, //default Tab
		id:'contenterCenter',
		defaults:{ autoScroll:true },
		items: [panelForm ]
	});
	/*====================== RENDER ======================*/

	new Ext.Viewport({
		layout: 'border',
		items: [ center ]
	});
  //add button Excel
});
