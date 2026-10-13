Ext.onReady(function() {
	Ext.QuickTips.init();

	/*===============================================*/
	var title_panel	= "ประเภทเงินฝาก";
	/*===============================================*/
	var store = new Ext.data.JsonStore({
		storeId: "myStore",
	    autoDestroy: true,
		autoLoad: true,
	    url : "api/List_DcBankDepositType.php",
	    root: "data",
	    baseParams: { i_read:user_right_read }, //Permission i_read
	    idProperty: "id",
		totalProperty: "totalCount",
		fields: [
		    { name : "no" },
		    { name : "id" },
		    { name : "c_code" },
		    { name : "c_name" },
		    { name : "i_main" },
		    { name : "c_main" },
			{ name : "c_comment" },
			{ name : "i_enable" },
			{ name : "i_delete" },
			{ name : "dc_user_create_id" },
			{ name : "dc_user_create_cost_id" },
			{ name : "d_create" },
			{ name : "dc_user_update_id" },
			{ name : "dc_user_update_cost_id" },
			{ name : "d_update" },
			{ name : "i_type" }
		]
	});
	
	var store_main = new Ext.data.JsonStore({
	    autoDestroy: true,
		autoLoad: true,
	    url: "api/All_DcBankDepositType.php",
	    root: "data",
	    baseParams: { type: "main" },
		fields: [
		    { name : "id" },
		    { name : "c_name" }
		]
	});
	
	var store_main_all = new Ext.data.JsonStore({
	    autoDestroy: true,
		autoLoad: true,
	    url : "api/All_DcBankDepositType.php",
	    root: "data",
	    baseParams: { type: "main_all" },
		fields: [
		    { name : "id" },
		    { name : "c_name" }
		],
		listeners: {
			load: function(t, records, options) {
	        	Ext.getCmp("s_main").setValue("0");
	        }
		}
	});

	var store_deposit_type_all = new Ext.data.JsonStore({
	    autoDestroy: true,
		autoLoad: true,
	    url : "api/All_DcBankDepositType.php",
	    root: "data",
	    baseParams: { type: "deposit_type" },
		fields: [
		    { name : "id" },
		    { name : "c_name" }
		],
		listeners: {
			load: function(t, records, options) {
	        	Ext.getCmp("s_dep_type").setValue("0");
	        }
		}
	});
	
	// pagingBar
	var pagingBar = new Ext.PagingToolbar({
		pageSize: 20,
		store: store,
		displayInfo: true,
		displayMsg: "Displaying topics {0} - {1} of {2}"
	});
	
	var gridMain = new Ext.grid.GridPanel({
		region: "center",
		layout: "fit",
		title: "แสดงรายการ"+title_panel,
		id: "tabpanel1",
		border: false,
		stripeRows: true,
		loadMask: true,
		store: store,
		viewConfig: {
			emptyText: "ไม่มีข้อมูล..",
			deferEmptyText: false
		},
		tbar: [{
			text: "เพิ่มข้อมูล",
			id: "buAdd",
			iconCls: "icon-add", 
			handler: function(grid, rowIndex, colIndex) {
				Ext.getCmp("icon-save").show();
				Ext.getCmp("tabpanel2").setDisabled(false);
				Ext.getCmp("contenterCenter").setActiveTab("tabpanel2");
				Ext.getCmp("form-widgets").getForm().reset();
				Ext.getCmp("role-form-mode").setValue("ADD");
			}
		}, { xtype : "tbfill" }, "-", {
			id: "filter",
            xtype: "combo",
            width: 100,
			mode: "local",
            store: new Ext.data.SimpleStore({
            	fields: [ "value", "text" ],
				data: [
				       [ "c_code", "รหัส" ],
				       [ "c_name", "ประเภทเงินฝาก" ]
				]
			}),
			value: "c_code",
			valueField: "value",
			displayField: "text",
			allowBlank: false,
			editable: false,
			triggerAction: "all",
			typeAhead : false
		}, "-", {
			id: "value-box",
			xtype: "textfield",
			width: 150,
			fieldLabel: "fieldLabel",
			emptyText: "คำที่ต้องการค้นหา",
		}, "-", "สถานะ", "-", {
			id: "status",
            xtype: "combo",
            width: 100,
			mode: "local",
            store: new Ext.data.SimpleStore({
            	fields: [ "value", "text" ],
				data: [
				       [ "0", "ทั้งหมด" ],
				       [ "1", "ใช้งาน" ],
				       [ "2", "ไม่ใช้งาน" ]
				]
			}),
			value: "0",
			valueField: "value",
			displayField: "text",
			allowBlank: false,
			editable: false,
			triggerAction: "all",
			typeAhead: false
		}, "-", "สถานะประเภทเงินฝากหลัก", "-", {
			id: "s_main",
            xtype: "combo",
            width: 350,
			mode: "local",
            store: store_main_all,
			valueField: "id",
			displayField: "c_name",
			allowBlank: false,
			editable: false,
			triggerAction: "all",
			typeAhead : false
		}, "-", {
			text: "ค้นหา",
			iconCls: "icon-magnifier",
			handler: function() {
				if(Ext.getCmp("value-box").getValue() != "") {
					store.setBaseParam("value", Ext.getCmp("value-box").getValue());
					store.setBaseParam("filter", Ext.getCmp("filter").getValue());
				} else {
					store.setBaseParam("value", "");
					store.setBaseParam("filter", "");
				}
				store.setBaseParam("mode", "SEARCH");
				store.setBaseParam("status", Ext.getCmp("status").getValue());
				store.setBaseParam("s_main", Ext.getCmp("s_main").getValue());
				store.load();
			}
		}],
		columns: [
		    new Ext.grid.RowNumberer({
				width: 30,
				header:"ที่ ",
				renderer:function(value, metaData, record, row, col, store, gridView) {
					return record.get("no");
				}
			}),
			{ header: "รหัส", sortable: true, dataIndex: "c_code" },
			{ id: "c_name", header: "ประเภทเงินฝาก", sortable: true, dataIndex: "c_name" },
			{ header: "สถานะประเภทเงินฝากหลัก", sortable: true, width: 200, align: "center", dataIndex: "c_main" },
			{ header: "สถานะ", sortable:false, width:50, align: "center",
				renderer: function(value, metaData, record, row, col, store, gridView){
					var i_enable = record.get("i_enable"); 
					if(i_enable == 1) {
						return "<img src='../images/icons/yes.gif');/>";
					} else {
						return "<img src='../images/icons/no.gif');/>"; 
					}
				}
			}
		],
		autoExpandColumn: "c_name",
		bbar: pagingBar
	});
	
	function cellClick(grid, rowIndex, columnIndex, e) {
		var record = grid.getStore().getAt(rowIndex);
		
		if (columnIndex == grid.getColumnModel().getIndexById("edit")) {
			Ext.getCmp("icon-save").show();
			Ext.getCmp("tabpanel2").setDisabled(false);
			Ext.getCmp("contenterCenter").setActiveTab("tabpanel2");
			Ext.getCmp("form-widgets").getForm().reset();
			Ext.getCmp("form-widgets").getForm().loadRecord(record);
			Ext.getCmp("role-form-mode").setValue("EDIT");
		} else if (columnIndex==grid.getColumnModel().getIndexById("view")) {
			Ext.getCmp("icon-save").hide();
			Ext.getCmp("tabpanel2").setDisabled(false);
			Ext.getCmp("contenterCenter").setActiveTab("tabpanel2");
			Ext.getCmp("form-widgets").getForm().reset();
			Ext.getCmp("form-widgets").getForm().loadRecord(record);
			Ext.getCmp("role-form-mode").setValue("EDIT");
		} else if (columnIndex == grid.getColumnModel().getIndexById("remove")) {
			var win = new Ext.Window({
				id: "win-msg-delete",
				title: "Remove",
				modal: true,
				width: 250,
				height: 130,
				html: "ท่านต้องการที่จะลบข้อมูล ?",
				buttons: [{
					text: "Confirm",
					handler: function() {
						Ext.Ajax.request({
							url: "api/mn_DcBankDepositType.php",
							method: "POST",
							params: { 
								mode: "DELETE", 
								id: record.get("id")
							},
							success: function ( result, request ) {
								var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
								if (jsonData.success) {
									//Ext.MessageBox.alert('Success', jsonData.msg);		// alert massage success
								} else {
									Ext.MessageBox.alert("Failed", jsonData.msg);			// alert massage error
								}
								Ext.getCmp("win-msg-delete").hide();						// hidden window-panel
								Ext.getCmp("win-msg-delete").destroy();						// clear memory :: garbage collection
								store.reload();
								Ext.getCmp("tabpanel2").setDisabled(true);
							},
							failure: function ( result, request) { 
								Ext.MessageBox.alert("Failed", result.responseText);		// connect error
							}
						});
					}
				},
				{
					text : "Cancel",
					handler : function() {
						Ext.getCmp("win-msg-delete").hide();
						Ext.getCmp("win-msg-delete").destroy();
					}				
				}]
			}).show();
		}
	};
	
	var panelForm = {
		region: "center",
		//layout:"fit",
		title: "ข้อมูล"+title_panel,
		xtype: "panel",
		id: "tabpanel2",
		border: false,
		disabled: true,
		stripeRows: true,
		loadMask: true,
		store: store,
        items: [{
        	xtype: "form",
			id: "form-widgets",
			url: "api/mn_DcBankDepositType.php",
			frame: true,
			labelWidth: 200,
			bodyStyle: { padding: "10px 20px" },
			defaults: { anchor: "100%", msgTarget: "side", allowBlank: false },
			items: [{
				xtype: "container",
				layout: "hbox",
				align: "stretch",
				defaults: { xtype: "fieldset", flex:1, margins : "0px 3px", autoHeight: true },
				items: [{
					title: "บันทึกข้อมูล "+title_panel,
					defaults: { labelStyle : "width:120px;", allowBlank: false },
					items: [{
						id: "role-form-mode",
						xtype: "hidden",
						name: "mode",
						readOnly: true
					}, {
						xtype: "hidden",
						name: "id",
						id: "id",
						readOnly: true
					}, {
						xtype: "displayfield",
						fieldLabel: "รหัส",
						id: "c_code",
			        	name: "c_code",
						width: 350
					}, {
						xtype: "textfield",
						fieldLabel: "ชื่อประเภทเงินฝาก",
						id: "c_name",
			        	name: "c_name",
						width: 350
					}, {
						xtype: "textarea",
						fieldLabel: "หมายเหตุ",
						id: "c_comment",
			        	name: "c_comment",
						allowBlank: true,
						width: 350
					}, {
						xtype: "combo",
						fieldLabel: "สถานะประเภทเงินฝากหลัก",
						id: "i_main",
						name: "i_main",
		    			store: store_main,
		    			width: 350,
		    			valueField: "id",
		    			displayField: "c_name",
		    			mode: "local",
		    			triggerAction: "all",
		    			emptyText: "- กรุณาเลือกสถานะประเภทเงินฝากหลัก -",
						forceSelection: true,
						selectOnFocus: true
					}, {
						xtype: "combo",
						fieldLabel: "สำหรับรายงานรายละเอียดเงินฝากธนาคาร",
						id: "i_type",
						name: "i_type",
		    			store: store_deposit_type_all,
		    			width: 350,
		    			valueField: "id",
		    			displayField: "c_name",
		    			mode: "local",
		    			triggerAction: "all",
		    			emptyText: "- กรุณาเลือกรายละเอียดเงินฝากธนาคาร -",
						forceSelection: true,
						selectOnFocus: true
					}, {
						xtype: "checkbox",
						fieldLabel: "สถานะ",
						id: "i_enable",
						name: "i_enable",
						boxLabel: "ใช้งาน",
						checked: true,
						inputValue: 1
					}]
				}]
			}],
			buttonAlign: "left",
			buttons: [{
				text: "&nbsp;บันทึกรายการ&nbsp;",
				id: "icon-save",
				iconCls: "icon-save",
				handler: function() {
					var form	= Ext.getCmp("form-widgets").getForm();
					var msg		= "";
					var i_main	= Ext.getCmp("i_main").getValue().toString();
				
					if(Ext.getCmp("c_name").getValue() == "")	{ msg	+= "- กรุณากรอกชื่อประเภทเงินฝาก<br>"; }
					if(i_main == "" || i_main == null) {
						msg	+= "- กรุณาเลือกสถานะประเภทเงินฝากหลัก<br>";
					}

					if (msg == "") {
						Ext.getCmp("tabpanel2").getEl().mask("Please wait...", "x-mask-loading");
						if(Ext.getCmp("i_enable").checked == true) {
							var i_enabled	= 1;
						} else {
							var i_enabled	= 2;
						}
						Ext.Ajax.request({
							url: "api/mn_DcBankDepositType.php",
							method: "POST",
							params: { 
								mode: Ext.getCmp("role-form-mode").getValue(),
								id: Ext.getCmp("id").getValue(),
								c_name: Ext.getCmp("c_name").getValue(),
								c_comment: Ext.getCmp("c_comment").getValue(),
								i_main: Ext.getCmp("i_main").getValue(),
								i_enable: i_enabled,
								i_type: Ext.getCmp("i_type").getValue()
							},
							success: function ( result, request ) {
								var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
								if (jsonData.success) {
									store.load();
									Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
									Ext.getCmp("tabpanel2").setDisabled(true);
									Ext.getCmp("role-form-mode").setValue("");
								} else {
									Ext.MessageBox.alert("Failed", jsonData.msg);			// alert massage error
								}
								Ext.getCmp("tabpanel2").getEl().unmask();
							},
							failure: function ( result, request) { 
								Ext.MessageBox.alert("Failed", result.responseText);		// connect error
							}
						});
					} else {
						Ext.Msg.alert("Warning", msg);
					}
				}
			}, {
				text: "Cancel",
				handler: function() {
					Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
					Ext.getCmp("tabpanel2").setDisabled(true);
				}
			}]
		}]
	}
	
	/*====================== CENTER ======================*/
	var center = new Ext.TabPanel({
		region: "center",
		border: false,
		//activeTab: 0, //default Tab
		id: "contenterCenter",
		defaults:{ autoScroll: true }, 
		items: [ gridMain , panelForm ]
	});
	// SET ref Grid&Tab
	Ext.getCmp("tabpanel1").on("cellclick", cellClick, this);

	// SetTab Controller Loads
	Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
	InfoMainGrid("tabpanel1",false,false,false,false,false,false);

	/*====================== RENDER ======================*/
	new Ext.Viewport({
		layout: "border",
		items: [ center ]
	});
});