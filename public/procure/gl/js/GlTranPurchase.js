function StoreJson(url, params, setValue){
	if(setValue != undefined) {
		var Str_listeners = {
			load: function(t, records, options) {
				for (var x in setValue) {
					Ext.getCmp(x).setValue(setValue[x]);
				}
			}
		}
	} else {
		var Str_listeners = null;
	}
	return new Ext.data.JsonStore({
		autoDestroy: true,
		autoLoad: true,
		url : url,
		baseParams: { type: params },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ],
	    listeners : Str_listeners
	});	
}

Ext.onReady(function() {
	Ext.QuickTips.init();
	
	/*===============================================*/
	var title_panel		= "รายงานภาษีซื้อ";
	/*===============================================*/

	var dc_area	= StoreJson("api/All_RepGlBalanceCost.php", "dc_area");	 
	
	store_month	= new Ext.data.JsonStore({
		fields: [ "id", "c_name" ],
		data : [
		        { id : "01", c_name : "มกราคม" },
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
    var yy_en = currentTime.getFullYear()-7;
    while(yy_en <= now) {
    	years.push({ id : yy_en, c_name : yy_en + 543 });
    	yy_en++;
    };
    
	store_year = new Ext.data.JsonStore({
		fields: ["id", "c_name"],
		data : years
	});

	LookReport = function( type ) {
		
		var msg		= "";

		if( Ext.getCmp("dc_area_id").getValue() == "" ) { msg += "- กรุณากรอก หน่วยธุรกิจ<br>"; }
		
		if( msg == "" ) {

			var href		= "report/Rep_GlTranPurchase.php";
	    	var resultUrl	= "";
	    	
	    	resultUrl	+= "&type="+type;

	    	resultUrl	+= "&dc_area_id="+Ext.getCmp("dc_area_id").getValue();
	    	resultUrl	+= "&i_more="+Ext.getCmp("i_more").getValue().inputValue;
	    	resultUrl	+= "&c_mm="+Ext.getCmp("c_mm").getValue();
	    	resultUrl	+= "&c_yyyy="+Ext.getCmp("c_yyyy").getValue();
	    	
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
						id: "dc_area_id",
						fieldLabel: "หน่วยธุรกิจ",
						width: 300,
				    	mode: "local",
			            store: dc_area,
						valueField: "id",
						displayField: "c_name",
						triggerAction: "all",
						forceSelection: true,
						selectOnFocus: true,
						typeAhead : false,
						emptyText: "กรุณาเลือก..."
	           		}), {
	                	xtype: "radiogroup",
	                	fieldLabel: "ประเภทนำส่งภาษี",
	                	id: "i_more",
	                	anchor: '30%',
	                	items: [
	                	    { boxLabel: "ปกติ", name: "i_more", inputValue: 2, checked: true },
	                	    { boxLabel: "ยื่นเพิ่มเติม", name: "i_more", inputValue: 1 }
	                	],
	                	listeners: {
	                		change: function(obj, value) {
	                	         if( value.inputValue==2 ) {
	                	        	 Ext.getCmp('monthGroup_id').label.update('เดือน/ปี ที่นำส่งภาษีซื้อ:');
	                	         } else {
	                	        	 Ext.getCmp('monthGroup_id').label.update('เดือน/ปี ที่ยื่นเพิ่มเติม:');
	                	         }
	                	   }
	                	}
					}, {
	                	fieldLabel: "เดือน/ปี ที่นำส่งภาษีซื้อ",
	                	id: "monthGroup_id",
	                	items:[
		                    new Ext.form.ComboBox({
					    	id: "c_mm",
					    	width: 150,
					    	store: store_month,
					    	valueField: "id",
					    	displayField: "c_name", 
					    	value: new Date().getMonth()+1, 
					    	typeAhead: true,
					    	mode: "local",
					    	triggerAction: "all",
					    	emptyText: 'กรุณาเลือก...',
					    	forceSelection: true,
					    	selectOnFocus: true, 
							listeners: {
								"change": function (combo, newValue) {
									if (newValue == "") { combo.setValue(0); }
								}
							}
					    }), new Ext.form.ComboBox({ 
							id: "c_yyyy",
							store: store_year,
							valueField: "id",
							displayField: "c_name",
							value:new Date().getFullYear(),
							width:150,
							typeAhead: true,
							mode: "local",
							triggerAction: "all",
							emptyText: ".....กรุณาเลือก.....",
							forceSelection: true,
							selectOnFocus: true, 
							listeners: {
								"change": function (combo, newValue) {
									if (newValue == "") { combo.setValue(0); }
								}
							}
						})]
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