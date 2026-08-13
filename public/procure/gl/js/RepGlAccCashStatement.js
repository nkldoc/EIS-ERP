Ext.onReady(function() {
	Ext.QuickTips.init();
	
	/*===============================================*/
	var title_panel		= "รายงานงบกระแสเงินสด";
	/*===============================================*/
 
	LookReport = function( type ) {
		
		var msg		= "";

		if( msg == "" ) {

                var href		= "api/report/Rep_GlAccCashStatement.php";
	    	var resultUrl	= "";
	    	
	    	
	    	resultUrl	+= "&mode="+type; 
	    	resultUrl	+= "&i_yyyy="+Ext.getCmp("c_yyyy").value; 
	    	resultUrl	+= "&titleReport="+title_panel; 
	    	
	    	resultUrl	= (resultUrl != "")? "?"+resultUrl.substring(1) : "";
		 
	    	window.open(href+resultUrl,href);
	      	window.focus();

		} else { Ext.MessageBox.alert("แจ้งเตือน", msg); }
	};
/**/

	// storeYear
        var years = [];
        var currentTime = new Date();
        var now = currentTime.getFullYear();
        var yy_en = Ext.START_YEAR_BG;
        while(yy_en <= now) {
            years.push({ id : yy_en, c_name : yy_en + 543 });
            yy_en++;
        };
    
	store_year = new Ext.data.JsonStore({
		fields: ["id", "c_name"],
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
							id: "c_yyyy",
							store: store_year,
							valueField: "id",
							displayField: "c_name",
                                                        fieldLabel: "ปีงบประมาณ",
							mode: "local",
							triggerAction: "all",
							emptyText: "กรุณาเลือกปีงบประมาณ",
							width: 122,
							forceSelection: true,
							selectOnFocus: true,
							typeAhead: false,
							editable: false,
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
								blur: function() { this.getStore().clearFilter(); },
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
