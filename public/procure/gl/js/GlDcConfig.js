Ext.onReady(function() {
	Ext.QuickTips.init();

	/*===============================================*/
	var title_panel	= "กำหนดค่าคงที่ระบบบัญชี";
	/*===============================================*/
	
	function StoreJson(url, params){	
		return new Ext.data.JsonStore({
			autoLoad: true,
			url : url,
			baseParams: { type: params },
			root: 'data',
			idProperty: 'id',
		    fields: [ 'id', 'c_name' ]
		});	
	}
	
	Ext.store = new Ext.data.JsonStore({
		storeId: "myStore",
	    autoDestroy: true,
		autoLoad: true,
	    url: "api/List_GlDcConfig.php",
	    baseParams: { type: "gl_dc_config", i_read: user_right_read }, //Permission i_read
	    root: "data",
	    idProperty: "id",
		totalProperty: "totalCount",
		fields: [
			{ name : "no" },
			{ name : "id" },
			{ name : "c_name" },
			{ name: "i_config" },
			{ name: "i_method" },
			{ name: "dc_acc_id" },
			{ name: "dc_cost_acc_id" },
			{ name: "c_comment" },
			{ name: "i_enable" },
			{ name : "dc_user_create_id" },
			{ name : "dc_user_create_cost_id" },
			{ name : "d_create" },
			{ name : "dc_user_update_id" },
			{ name : "dc_user_update_cost_id" },
			{ name : "d_update" }
		]
	});
	
	// Ext.dc_acc	= StoreJson('api/All_GlDcConfig.php', 'dc_acc'); // ผังบัญชี
	// Ext.dc_cost	= StoreJson('api/All_GlDcConfig.php', 'dc_cost'); // ศูนย์ต้นทุน   

	  Ext.dc_acc = new Ext.data.JsonStore({
		autoDestroy: false,
		autoLoad: true,
		url: "api/All_GlDcConfig.php",
		baseParams: { type: "dc_acc" },
		root: "data",
		idProperty: "id",
		fields: [ "id", "i_group", "c_name" ]
	});
	
	Ext.dc_cost = new Ext.data.JsonStore({
		autoDestroy: false,
		autoLoad: true,
		url: "api/All_GlDcConfig.php",
		baseParams: { type: "dc_cost" },
		root: "data",
		idProperty: "id",
		fields: [ "id", "c_name" ]
	});
	
	
	// pagingBar
	pagingBar = new Ext.PagingToolbar({
		pageSize: 20,
		store: Ext.store,
		displayInfo: true,
		displayMsg: "Displaying topics {0} - {1} of {2}"
	});
	
	// ============================================================ //
	
	function DisbledButton(t){
	    //Disabled etc...
	    if(t){
	        Ext.getCmp('icon-save').hide();
	    }else{
	        Ext.getCmp('icon-save').show();
	    }
	}
	
	function controllTab(record,butt) {
		
		Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-Add'), true) || {}; //null obj not errer
		
		var frmAdd	= new formAdd();
		
		if( butt == 'add' ) {
			
			Ext.getCmp('contenterCenter').add(frmAdd);
			Ext.getCmp('contenterCenter').setActiveTab(frmAdd);
			Ext.getCmp('role-form-mode').setValue('ADD');
			
			Ext.getCmp('i_method').fn();
			
		} else if( butt=='edit' || butt=='view' ) {
			
	        Ext.getCmp('contenterCenter').add(frmAdd); 
	        Ext.getCmp('contenterCenter').setActiveTab(frmAdd);  
	        Ext.getCmp('role-form-mode').setValue('EDIT');
	        Ext.getCmp('form-widgets').getForm().loadRecord(record);
	        
	        Ext.getCmp('i_method').fn();
	        
	        if(butt=='view') { DisbledButton(true); }
	        else { DisbledButton(false); }
	        
	    } else if( butt=='remove' ) {
	    	
	    	new Ext.Window({
	    		id : "win-msg-delete",
	    		title : "Remove",
	    		modal: true,
	    		width : 250,
	    		height : 130,
	    		html: "ท่านต้องการที่จะลบข้อมูล ?",
	    		buttons : [{
	    			text : "Confirm",
	    			handler : function() {
	    				Ext.Ajax.request({
	    					url : 'api/mn_GlDcConfig.php',
	    					params : {
	    						mode : 'DELETE',
	    						id : record.get('id')
	    					},
	    					method: 'GET', //POST
	    					success: function ( result, request ) {
	    						var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
	    						if (jsonData.success == true) {
	    							Ext.getCmp("win-msg-delete").destroy();						// clear memory :: garbage collection
	    							Ext.store.reload();
	    						} else {
	    							Ext.MessageBox.alert('Failed', jsonData.msg);			// alert massage error
	    						}
	    					},
	    					failure: function ( result, request) {
	    						Ext.MessageBox.alert('Failed', result.responseText);		// connect error
	    					}
	    				});
	    			}
	    		}, {
	    			text : "Cancel",
	    			handler : function() {
	    				Ext.getCmp("win-msg-delete").destroy();
	    				Ext.store.reload();
	    			}
	    		}]
	    	}).show();
	    	
	    }
	}; // controllTab
	
	//Class Extend
	formAdd	 = function() {

		formAdd.superclass.constructor.call(this, {
			region: "center",
			title: "ข้อมูล"+title_panel,
			id: "frm-Add",
			border: false,
			stripeRows: true,
			loadMask: true,
			listeners:{
				afterrender: function( obj, eOpts ){ /*console.log('Load Finish'); */},
			},
			items: [{
				xtype: "form",
				id: "form-widgets",
				frame: true,
				labelAlign: "right",
				labelWidth: 150,
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
						defaults: { labelStyle : "width:150px;", allowBlank: true },
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
							fieldLabel: 'ชื่อค่าคงที่ระบบบัญชี',
							xtype: 'textfield',
							id: 'c_name',
							name: 'c_name',
							width: 300
						}, {
							fieldLabel: 'ประเภทค่าคงที่',
							xtype: 'radiogroup',
							id: "i_config",
							columns: [600,400], 
						    vertical: true,
							items: [   
								{ boxLabel: Ext.GL_CFG_COST_ACC_TXT, checked: true, name: 'i_config', inputValue: Ext.GL_CFG_COST_ACC },
								{ boxLabel: Ext.GL_CFG_COST_HEADQUARTER_TXT, name: 'i_config', inputValue: Ext.GL_CFG_COST_HEADQUARTER },
								{ boxLabel: Ext.GL_CFG_VAT_BUY_TXT , name: 'i_config', inputValue: Ext.GL_CFG_VAT_BUY }, 
								{ boxLabel: Ext.GL_CFG_CLOSE_YEAR_COST_ACC_TXT, name: 'i_config', inputValue: Ext.GL_CFG_CLOSE_YEAR_COST_ACC },
								{ boxLabel: Ext.GL_CFG_CLOSE_YEAR_COST_HEADQUARTER_TXT, name: 'i_config', inputValue: Ext.GL_CFG_CLOSE_YEAR_COST_HEADQUARTER },
								{ boxLabel: Ext.GL_CFG_CLOSE_YEAR_ACC_DIVIDEND_TXT, name: 'i_config', inputValue: Ext.GL_CFG_CLOSE_YEAR_ACC_DIVIDEND },
								{ boxLabel: Ext.GL_CFG_CLOSE_YEAR_ACC_PROFIT_UNALLOCATE_TXT, name: 'i_config', inputValue: Ext.GL_CFG_CLOSE_YEAR_ACC_PROFIT_UNALLOCATE },
								{ boxLabel: Ext.GL_CFG_CLOSE_YEAR_ACC_PROFIT_YEAR_TXT, name: 'i_config', inputValue: Ext.GL_CFG_CLOSE_YEAR_ACC_PROFIT_YEAR },
								{ boxLabel: Ext.GL_CFG_CLOSE_YEAR_LICENSE_ANALOG_TXT, name: 'i_config', inputValue: Ext.GL_CFG_CLOSE_YEAR_LICENSE_ANALOG },
								{ boxLabel: Ext.GL_CFG_VOUCHER_TXT , name: 'i_config', inputValue: Ext.GL_CFG_VOUCHER },
								{ boxLabel: Ext.GL_CFG_SET_CREDITOR_PRODUCT_TXT , name: 'i_config', inputValue: Ext.GL_CFG_SET_CREDITOR_PRODUCT },
								{ boxLabel: Ext.GL_CFG_SET_CREDITOR_CONSTRUCTION_TXT , name: 'i_config', inputValue: Ext.GL_CFG_SET_CREDITOR_CONSTRUCTION }
			 				]
						}, {
							fieldLabel: 'สถานะการเรียกใช้ค่าคงที่',
							xtype: 'radiogroup', 
							id: "i_method",
							columns: 4,
							vertical: false,
							items: [
			 					{ boxLabel: 'เฉพาะผังบัญชี', checked: true, name: 'i_method', inputValue: '1' },
								{ boxLabel: 'เฉพาะศูนย์ต้นทุน', name: 'i_method', inputValue: '2' },
								{ boxLabel: 'ทั้งผังบัญชีและศูนย์ต้นทุน', name: 'i_method', inputValue: '3' }
							],
							listeners: {
								afterrender: function() {
									this.fn	= function() {
										if( this.getValue().inputValue == 1 ) {
											
											Ext.getCmp("dc_acc_id").show();
											Ext.getCmp("dc_cost_acc_id").hide();
											
										} else if( this.getValue().inputValue == 2 ) {
											
											Ext.getCmp("dc_acc_id").hide();
											Ext.getCmp("dc_cost_acc_id").show();
											
										} else if( this.getValue().inputValue == 3 ) {
											
											Ext.getCmp("dc_acc_id").show();
											Ext.getCmp("dc_cost_acc_id").show();
											
										}
									}
								},
								Change: function(value) { this.fn(); }
							}
						},	new Ext.form.ComboBox({
							fieldLabel: 'ผังบัญชี',
							id: "dc_acc_id",
							name: "dc_acc_id",
							store: Ext.dc_acc,
							valueField: "id",
							displayField: "c_name",
							mode: "local",
							triggerAction: "all",
							emptyText: "กรุณาเลือก...",
							width: 500,
							forceSelection: true,
							selectOnFocus: true,
							typeAhead: false,
							listeners: {
								beforequery: function(q) {
									if (q.query) {
										var length = q.query.length;
										q.query = new RegExp(Ext.escapeRe(q.query));
										q.query.length = length;
									}
								},
								blur: function() { this.getStore().clearFilter(); }
							}
						}), new Ext.form.ComboBox({
							fieldLabel: 'ศูนย์ต้นทุน',
							id: "dc_cost_acc_id",
							name: "dc_cost_acc_id",
							store: Ext.dc_cost,
							valueField: "id",
							displayField: "c_name",
							mode: "local",
							triggerAction: "all",
							emptyText: "กรุณาเลือก...",
							width: 500,
							forceSelection: true,
							selectOnFocus: true,
							typeAhead: false,
							listeners: {
								beforequery: function(q) {
									if (q.query) {
										var length = q.query.length;
										q.query = new RegExp(Ext.escapeRe(q.query));
										q.query.length = length;
									}
								},
								blur: function() { this.getStore().clearFilter(); }
							}
						}), {
							fieldLabel: 'คำอธิบายเพิ่มเติม',
							xtype: 'textfield',
							id:'c_comment',
							name:'c_comment',
							width: 300
						}, {
							fieldLabel: 'สถานะการใช้งาน',
							xtype: 'radiogroup',
							id: "i_enable",
							columns: [80,100],
							items: [
	                            { boxLabel: 'ใช้งาน', checked: true, name: 'i_enable', inputValue: Ext.CONF_STATUS_ENABLE },
	                            { boxLabel: 'ไม่ใช้งาน', name: 'i_enable', inputValue: Ext.CONF_STATUS_DISABLE }
							]
						}]
					}]
				}],
				buttonAlign: 'left',
				buttons: [{
					text : "&nbsp;"+Ext.GLOBAL_BU_SAVE_TH+"&nbsp;",
					id: "icon-save",
					iconCls	: "icon-save",
					handler : function() {
						
						var msg				= "";
						var dc_acc_id		= Ext.getCmp("dc_acc_id").getValue();
						var dc_cost_acc_id	= Ext.getCmp("dc_cost_acc_id").getValue();
						
						if(Ext.getCmp("c_name").getValue() == "") { msg	+= "- กรุณากรอก ชื่อค่าคงที่ระบบบัญชี<br>"; }
						
						if( Ext.getCmp("i_method").getValue().inputValue == 1 ) {
							if(dc_acc_id == "" || dc_acc_id == null)			{ msg	+= "- กรุณาเลือก ผังบัญชี<br>"; }
							dc_cost_acc_id	= "";
						} else if( Ext.getCmp("i_method").getValue().inputValue == 2 ) {
							if(dc_cost_acc_id == "" || dc_cost_acc_id == null)	{ msg	+= "- กรุณาเลือก ศูนย์ต้นทุน<br>"; }
							dc_acc_id		= "";
						} else if( Ext.getCmp("i_method").getValue().inputValue == 3 ) {
							if(dc_acc_id == "" || dc_acc_id == null)			{ msg	+= "- กรุณาเลือก ผังบัญชี<br>"; }
							if(dc_cost_acc_id == "" || dc_cost_acc_id == null)	{ msg	+= "- กรุณาเลือก ศูนย์ต้นทุน<br>"; }
						}
						
						if (msg == "") {

							Ext.getCmp("frm-Add").getEl().mask("Please wait...", "x-mask-loading");
							Ext.Ajax.request({
								url: "api/mn_GlDcConfig.php",
								method: "POST",
								params: {
									mode: Ext.getCmp("role-form-mode").getValue(),
									id: Ext.getCmp("id").getValue(),
									c_name: Ext.getCmp("c_name").getValue(),
									i_config: Ext.getCmp("i_config").getValue().inputValue,
									i_method: Ext.getCmp("i_method").getValue().inputValue,
									dc_acc_id: dc_acc_id,
									dc_cost_acc_id: dc_cost_acc_id,
									c_comment: Ext.getCmp("c_comment").getValue(),
									i_enable: Ext.getCmp("i_enable").getValue().inputValue
								},
								success: function ( result, request ) {
									Ext.getCmp("frm-Add").getEl().unmask();
									var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
									if (jsonData.success == true) {
											Ext.store.load();
											Ext.Msg.alert("แจ้งเตือน", "บันทึกเรียบร้อย");
											Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-Add'), true) || {};
									} else { Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg); }
								},
								failure: function ( result, request) { 
									Ext.MessageBox.alert("Failed", result.responseText);		// connect error
								}
							});
						} else { Ext.Msg.alert("แจ้งเตือน", msg); }
					}
				}, {
					text: Ext.GLOBAL_BU_BACK_TH,
					handler: function() {
						Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-Add'), true) || {};
					}
				}]
			}]
		});
	}; // formAdd
	Ext.extend(formAdd, Ext.Panel, {}); 
	
	//============================== cellClick ==============================//
	cellClick	= function( grid, rowIndex, columnIndex, e ) {
		
		var record = grid.getStore().getAt(rowIndex);
		
		if (columnIndex == grid.getColumnModel().getIndexById("view")) {
			controllTab(record, 'view');
		} else if (columnIndex == grid.getColumnModel().getIndexById("edit")) {
			controllTab(record, 'edit');
		} else if (columnIndex == grid.getColumnModel().getIndexById("remove")) {
			controllTab(record, 'remove');
		}
	}; //cellClick
	
	// ================================ gridMain ================================ //
	gridMain = new Ext.grid.GridPanel({
		region: "center",
		layout: "fit",
		title: "แสดงรายการ"+title_panel,
		id: "tabpanel1",
		border: false,
		stripeRows: true,
		loadMask: true,
		store: Ext.store,
		viewConfig : {
			emptyText: "ไม่มีข้อมูล..",
			deferEmptyText: false
		},
		tbar: [{ // กล่องค้นหาข้อมูล 1
			xtype: "buttongroup",
			title: "ระบุเงื่อนไขในการค้นหาข้อมูล",
			columns: 1,
            defaults: { scale: "small", style: "float: right" },
            items: [{ // แถวที่ 1
            	xtype: "buttongroup",
            	frame: false,
            	items: [{ xtype: "label", text: "ค้นหาโดย : " }, { xtype: "tbspacer", width: 4 }, {
	            	id: "filter",
            		xtype: "combo",
		            width: 160,
					mode: "local",
		            store: new Ext.data.SimpleStore({
		            	fields: [ "value", "text" ],
						data: [
						       [ 'c_name', "ชื่อ" ],
						       [ 'c_comment', "คำอธิบายเพิ่มเติม" ]
						]
					}),
					value: "c_name",
					valueField: "value",
					displayField: "text",
					allowBlank: false,
					editable: false,
					triggerAction: "all",
					typeAhead : false
				}, { xtype: "tbspacer", width: 4 }, {
            		xtype: "textfield",
            		id: "value-box",
            		width: 200,
           			fieldLabel: "fieldLabel",
           			emptyText: "คำที่ต้องการค้นหา"
           		}]
            }],
            buttonAlign: "left",
			buttons:[{
				text : "เพิ่มข้อมูล",
				id: "buAdd",
				iconCls: "icon-add",
				handler: function(grid, rowIndex, colIndex) { controllTab({}, 'add'); }
			}, { xtype: "tbfill" }, {
				text : "ค้นหา",
				iconCls: "icon-magnifier",
    			handler : function() {
    				
    				var msg	= "";
    				
    				if(msg == "") {
						if(Ext.getCmp("value-box").getValue() != "") {
							Ext.store.setBaseParam("value", Ext.getCmp("value-box").getValue());
							Ext.store.setBaseParam("filter", Ext.getCmp("filter").getValue());
						} else {
							Ext.store.setBaseParam("value", "");
							Ext.store.setBaseParam("filter", "");
						}
						
						Ext.store.setBaseParam("mode", "SEARCH");
						Ext.store.load();
						
    				} else { Ext.Msg.alert("แจ้งเตือน", msg); }
    			}
			}]
		}],
		columns: [
		    new Ext.grid.RowNumberer({header:"ที่", width: 30,
				renderer: function(value, metaData, record, row, col, store, gridView) {
					return record.get("no");
				}
			}),
			{ header: "ID System", sortable: true, hidden:true, dataIndex: "id" },
			{ id:'c_name', header: "ชื่อ", sortable: true, dataIndex: 'c_name' },
			{ header: "คำอธิบายเพิ่มเติม", sortable: true, dataIndex: 'c_comment' },
			{ header: "สถานะ", sortable:false, align: "center", width: 50,
				renderer: function(value, metaData, record, row, col, store, gridView) {
					if(record.get("i_enable") == 1) {
						return "<img src=\"../images/icons/yes.gif\");/>";
					} else {
						return "<img src=\"../images/icons/no.gif\");/>";
					}
				}
			},
			{ header: "สถานะค่าคงที่", sortable:false, align: 'left',
				renderer: function(value, metaData, record, row, col, store, gridView){
					var i_config = record.get('i_config');  
					 
					switch (i_config) { 
						case  Ext.GL_CFG_COST_ACC  							: txt = Ext.GL_CFG_COST_ACC_TXT; break;
						case  Ext.GL_CFG_COST_HEADQUARTER  					: txt = Ext.GL_CFG_COST_HEADQUARTER_TXT; break;
						case  Ext.GL_CFG_VAT_BUY  							: txt = Ext.GL_CFG_VAT_BUY_TXT ; break;						
						case  Ext.GL_CFG_VOUCHER  							: txt = Ext.GL_CFG_VOUCHER_TXT ; break;						
						case  Ext.GL_CFG_CLOSE_YEAR_COST_ACC  				: txt = Ext.GL_CFG_CLOSE_YEAR_COST_ACC_TXT; break;
						case  Ext.GL_CFG_CLOSE_YEAR_COST_HEADQUARTER  		: txt = Ext.GL_CFG_CLOSE_YEAR_COST_HEADQUARTER_TXT; break;
						case  Ext.GL_CFG_CLOSE_YEAR_ACC_DIVIDEND  			: txt = Ext.GL_CFG_CLOSE_YEAR_ACC_DIVIDEND_TXT; break;
						case  Ext.GL_CFG_CLOSE_YEAR_ACC_PROFIT_UNALLOCATE  	: txt = Ext.GL_CFG_CLOSE_YEAR_ACC_PROFIT_UNALLOCATE_TXT; break;
						case  Ext.GL_CFG_CLOSE_YEAR_ACC_PROFIT_YEAR  		: txt = Ext.GL_CFG_CLOSE_YEAR_ACC_PROFIT_YEAR_TXT; break;
						case  Ext.GL_CFG_CLOSE_YEAR_LICENSE_ANALOG  		: txt = Ext.GL_CFG_CLOSE_YEAR_LICENSE_ANALOG_TXT; break; 
						case  Ext.GL_CFG_VOUCHER  							: txt = Ext.GL_CFG_VOUCHER_TXT; break;
						case  Ext.GL_CFG_VAT_BUY_NOT_DUE  					: txt = Ext.GL_CFG_VAT_BUY_NOT_DUE_TXT; break;
						case  Ext.GL_CFG_SET_CREDITOR_PRODUCT  				: txt = Ext.GL_CFG_SET_CREDITOR_PRODUCT_TXT; break;
						case  Ext.GL_CFG_SET_CREDITOR_CONSTRUCTION  		: txt = Ext.GL_CFG_SET_CREDITOR_CONSTRUCTION_TXT; break;
						default : txt = ""; break;
					}
					return txt;
				}
			},
			{ header: "ผู้แก้ไขรายการ", sortable: true, dataIndex: "dc_user_update_id" },
			{ header: "วันที่แก้ไข", sortable: true, align: "center", renderer:shortThaiDate, dataIndex: "d_update" },
			{ header: "หน่วยงานที่แก้ไข", sortable: true, dataIndex: "dc_user_update_cost_id" },
			{ id: "view", header: "แสดง", sortable:false, align: "center", width: 100, dataIndex: "id",
				renderer: function(value, metaData, record, row, col, store, gridView) {
					return "<img src=\"../images/icons/application_osx_go.png\"); style=\"cursor:pointer\"/>";
				}
			},
			{ id: "edit", header: "แก้ไข", sortable: true, align: "center", dataIndex: "id",
				renderer: function(value, metaData, record, row, col, store, gridView) {
					return "<img src=\"../images/icons/document_edit.gif\"); style=\"cursor:pointer\"/> แก้ไข";
				}
			},
			{ id: "remove", header: "ลบ", sortable: true, align: "center", dataIndex: "id",
				renderer: function(value, metaData, record, row, col, store, gridView) {
						return "<img src=\"../images/icons/document_delete.gif\"); style=\"cursor:pointer\"/> ลบ";
				}
			}
		],
		autoExpandColumn: "c_name",
		bbar: pagingBar
	}); //gridMain

	/*====================== CENTER ======================*/
	var center = new Ext.TabPanel({
		region: "center",
		border: false,
		//activeTab: 0, //default Tab
		id: "contenterCenter",
		defaults:{ autoScroll: true }, 
		items: [ gridMain ]
	});
	
	// SET ref Grid&Tab
	Ext.getCmp("tabpanel1").on("cellclick", cellClick, this);

	// SetTab Controller Loads
	Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
	/*====================== RENDER ======================*/
	new Ext.Viewport({
		layout: "border",
		items: [ center ]
	});
});