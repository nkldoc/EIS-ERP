Ext.onReady(function() {
	Ext.QuickTips.init();
	
	var title_panel	= "ผังบัญชี";
	
	store_level	= new Ext.data.JsonStore({
		fields: ["id"],
		data : [
		        { id : 1 },
		        { id : 2 },
		        { id : 3 },
		        { id : 4 },
		        { id : 5 },
		        { id : 6 },
		        { id : 7 },
		        { id : 8 },
		        { id : 9 },
		        { id : 10 }
		       ]
	});
	
	store_rank	= new Ext.data.JsonStore({
		fields: ["id"],
		data : [
		        { id : 1 },
		        { id : 2 },
		        { id : 3 },
		        { id : 4 }
		       ]
	});
	
	//======================================= panelForm =======================================//
	var panelForm = new Ext.Panel ({
		region: "center",
		title: title_panel,
		border: false,
		stripeRows: true,
		loadMask: true,
        items: [{
        	xtype: "form",
			id: "form-widgets",
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
					title: "บันทึกข้อมูล "+title_panel,
					RemoveCls: "x-box-item",
					collapsible: true,
					collapsed: false,
					defaults: { labelStyle : "width:200px;", allowBlank: true },
					items: [new Ext.form.ComboBox({
						fieldLabel: "ระดับ",
						id: "i_level",
						name: "i_level",
						mode: "local",
						store: store_level,
						valueField: "id",
						displayField: "id",
						triggerAction: "all",
						forceSelection: true,
    					selectOnFocus: true,
    					typeAhead : false,
    					emptyText: "กรุณาเลือก...",
						width: 100,						
						listeners: {
							Change: function (level, newValue) {
								newValue	= (newValue == "")? 0 : newValue;
								for(var i=1;i<=10;i++) {
									if( i <= newValue ) {
										Ext.getCmp("show_lv"+i+"").show();											
									} else {
										Ext.getCmp("show_lv"+i+"").hide();
									}
								}
							}
						}
					}), {
						xtype: "compositefield",
						id: "show_lv1",
						fieldLabel: "ระดับที่ 1",
						anchor: "100%",
						msgTarget: "under",
						hidden: true,
						items: [new Ext.form.ComboBox({
							id: "lv1",
							mode: "local",
							store: store_rank,
							valueField: "id",
							displayField: "id",
							triggerAction: "all",
							forceSelection: true,
	    					selectOnFocus: true,
	    					typeAhead : false,
	    					emptyText: "กรุณาเลือก...",
							width: 50,
							value: 2,
							listeners: {
								Change: function (level, newValue) {
									if (newValue == "")
										level.reset();
								}
							}
						}), { xtype: "displayfield", value: "ตำแหน่ง", width: 120 }]
					}, {
						xtype: "compositefield",
						id: "show_lv2",
						fieldLabel: "ระดับที่ 2",
						anchor: "100%",
						msgTarget: "under",
						hidden: true,
						items: [new Ext.form.ComboBox({
							id: "lv2",
							mode: "local",
							store: store_rank,
							valueField: "id",
							displayField: "id",
							triggerAction: "all",
							forceSelection: true,
	    					selectOnFocus: true,
	    					typeAhead : false,
	    					emptyText: "กรุณาเลือก...",
							width: 50,
							value: 2,
							listeners: {
								Change: function (level, newValue) {
									if (newValue == "")
										level.reset();
								}
							}
						}), { xtype: "displayfield", value: "ตำแหน่ง", width: 120 }]
					}, {
						xtype: "compositefield",
						id: "show_lv3",
						fieldLabel: "ระดับที่ 3",
						anchor: "100%",
						msgTarget: "under",
						hidden: true,
						items: [new Ext.form.ComboBox({
							id: "lv3",
							mode: "local",
							store: store_rank,
							valueField: "id",
							displayField: "id",
							triggerAction: "all",
							forceSelection: true,
	    					selectOnFocus: true,
	    					typeAhead : false,
	    					emptyText: "กรุณาเลือก...",
							width: 50,
							value: 2,
							listeners: {
								Change: function (level, newValue) {
									if (newValue == "")
										level.reset();
								}
							}
						}), { xtype: "displayfield", value: "ตำแหน่ง", width: 120 }]
					}, {
						xtype: "compositefield",
						id: "show_lv4",
						fieldLabel: "ระดับที่ 4",
						anchor: "100%",
						msgTarget: "under",
						hidden: true,
						items: [new Ext.form.ComboBox({
							id: "lv4",
							mode: "local",
							store: store_rank,
							valueField: "id",
							displayField: "id",
							triggerAction: "all",
							forceSelection: true,
	    					selectOnFocus: true,
	    					typeAhead : false,
	    					emptyText: "กรุณาเลือก...",
							width: 50,
							value: 2,
							listeners: {
								Change: function (level, newValue) {
									if (newValue == "")
										level.reset();
								}
							}
						}), { xtype: "displayfield", value: "ตำแหน่ง", width: 120 }]
					}, {
						xtype: "compositefield",
						id: "show_lv5",
						fieldLabel: "ระดับที่ 5",
						anchor: "100%",
						msgTarget: "under",
						hidden: true,
						items: [new Ext.form.ComboBox({
							id: "lv5",
							mode: "local",
							store: store_rank,
							valueField: "id",
							displayField: "id",
							triggerAction: "all",
							forceSelection: true,
	    					selectOnFocus: true,
	    					typeAhead : false,
	    					emptyText: "กรุณาเลือก...",
							width: 50,
							value: 2,
							listeners: {
								Change: function (level, newValue) {
									if (newValue == "")
										level.reset();
								}
							}
						}), { xtype: "displayfield", value: "ตำแหน่ง", width: 120 }]
					}, {
						xtype: "compositefield",
						id: "show_lv6",
						fieldLabel: "ระดับที่ 6",
						anchor: "100%",
						msgTarget: "under",
						hidden: true,
						items: [new Ext.form.ComboBox({
							id: "lv6",
							mode: "local",
							store: store_rank,
							valueField: "id",
							displayField: "id",
							triggerAction: "all",
							forceSelection: true,
	    					selectOnFocus: true,
	    					typeAhead : false,
	    					emptyText: "กรุณาเลือก...",
							width: 50,
							value: 2,
							listeners: {
								Change: function (level, newValue) {
									if (newValue == "")
										level.reset();
								}
							}
						}), { xtype: "displayfield", value: "ตำแหน่ง", width: 120 }]
					}, {
						xtype: "compositefield",
						id: "show_lv7",
						fieldLabel: "ระดับที่ 7",
						anchor: "100%",
						msgTarget: "under",
						hidden: true,
						items: [new Ext.form.ComboBox({
							id: "lv7",
							mode: "local",
							store: store_rank,
							valueField: "id",
							displayField: "id",
							triggerAction: "all",
							forceSelection: true,
	    					selectOnFocus: true,
	    					typeAhead : false,
	    					emptyText: "กรุณาเลือก...",
							width: 50,
							value: 2,
							listeners: {
								Change: function (level, newValue) {
									if (newValue == "")
										level.reset();
								}
							}
						}), { xtype: "displayfield", value: "ตำแหน่ง", width: 120 }]
					}, {
						xtype: "compositefield",
						id: "show_lv8",
						fieldLabel: "ระดับที่ 8",
						anchor: "100%",
						msgTarget: "under",
						hidden: true,
						items: [new Ext.form.ComboBox({
							id: "lv8",
							mode: "local",
							store: store_rank,
							valueField: "id",
							displayField: "id",
							triggerAction: "all",
							forceSelection: true,
	    					selectOnFocus: true,
	    					typeAhead : false,
	    					emptyText: "กรุณาเลือก...",
							width: 50,
							value: 2,
							listeners: {
								Change: function (level, newValue) {
									if (newValue == "")
										level.reset();
								}
							}
						}), { xtype: "displayfield", value: "ตำแหน่ง", width: 120 }]
					}, {
						xtype: "compositefield",
						id: "show_lv9",
						fieldLabel: "ระดับที่ 9",
						anchor: "100%",
						msgTarget: "under",
						hidden: true,
						items: [new Ext.form.ComboBox({
							id: "lv9",
							mode: "local",
							store: store_rank,
							valueField: "id",
							displayField: "id",
							triggerAction: "all",
							forceSelection: true,
	    					selectOnFocus: true,
	    					typeAhead : false,
	    					emptyText: "กรุณาเลือก...",
							width: 50,
							value: 2,
							listeners: {
								Change: function (level, newValue) {
									if (newValue == "")
										level.reset();
								}
							}
						}), { xtype: "displayfield", value: "ตำแหน่ง", width: 120 }]
					}, {
						xtype: "compositefield",
						id: "show_lv10",
						fieldLabel: "ระดับที่ 10",
						anchor: "100%",
						msgTarget: "under",
						hidden: true,
						items: [new Ext.form.ComboBox({
							id: "lv10",
							mode: "local",
							store: store_rank,
							valueField: "id",
							displayField: "id",
							triggerAction: "all",
							forceSelection: true,
	    					selectOnFocus: true,
	    					typeAhead : false,
	    					emptyText: "กรุณาเลือก...",
							width: 50,
							value: 2,
							listeners: {
								Change: function (level, newValue) {
									if (newValue == "")
										level.reset();
								}
							}
						}), { xtype: "displayfield", value: "ตำแหน่ง", width: 120 }]
					}, { xtype: "displayfield", value: "ตัวอย่างรหัสบัญชีเลเวล6 คือ <font color='red'> 4</font>"
	                												+ "<font color='green'> 5</font>"
	                												+ "<font color='blue'> 04</font>"
	                												+ "<font color='black'> 03</font>"
	                												+ "<font color='purple'> 01</font>"
	                												+ "<font color='brown'> 23</font>"
	                												+ " แบ่งเป็น ระดับที่ 1-2 = 1 ตำแหน่ง ส่วนระดับที่ 3-6 = 2 ตำแหน่ง"
					}]
				}]
			}],
			buttonAlign: "left",
			buttons: [{
				text: "&nbsp;สร้างเลขผังบัญชี&nbsp;",
				iconCls: "database_start",
				handler : function() {
					
					var msg		= "";
					var jsonArr = [];
					var i_level	= Ext.getCmp("i_level").getValue();
					
					if( i_level == "" ) { msg += "- กรุณากรอก ระดับ<br>"; }

					if (msg == "") {
						
						for(var i=1; i<=i_level;i++) {
							jsonArr.push({
								length_lv: i,
								position: Ext.getCmp("lv"+i+"").getValue()
						    });	
						}
						
						Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
						Ext.Ajax.request({
							url: "api/mn_configDcAcc.php",
							method: "POST",
							params: {
								i_level: i_level,
								data: JSON.stringify(jsonArr)
							},
							success: function ( result, request ) {
								Ext.getCmp("contenterCenter").getEl().unmask();
								var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
								Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg);
							},
							failure: function ( result, request) { 
								Ext.MessageBox.alert("Failed", result.responseText);		// connect error
							}
						});
						
					} else { Ext.Msg.alert("แจ้งเตือน", msg); }
				}
			}]
		}]
	}); // panelForm
	
	/* ====================== CENTER ====================== */
	center = new Ext.TabPanel({
		region: "center",
		border: false,
		activeTab: 0, //default Tab
		id: "contenterCenter",
		defaults:{ autoScroll: true }, 
		items: [ panelForm ]
	});
	/* ====================== RENDER ====================== */
	new Ext.Viewport({
		layout: "border",
		items: [ center ]
	});
});
