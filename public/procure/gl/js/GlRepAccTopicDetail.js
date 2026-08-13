function StoreJson(url, params){	
	return new Ext.data.JsonStore({
		autoLoad: true,
		url : url,
		baseParams: { type: params },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ]
	});	
}

function checkAll(ele) {
	for(var i=1; i<Ext.objChk.length; i++){
		var ind = Ext.objChk[i];
		if (ind != "") {
			if(document.getElementById(ind)){
				document.getElementById(ind).checked = ele;
			};
		}
	}
};

Ext.onReady(function() {
	Ext.QuickTips.init();
	Ext.objChk	= [];

	/*===============================================*/
	var title_panel	= "แสดงข้อมูลหัวข้อที่ 2";
	/*===============================================*/
	
	Ext.store = new Ext.data.JsonStore({
		storeId: "myStore",
	    autoDestroy: true,
		autoLoad: true,
	    url: "api/List_GlRepAccTopicDetail.php",
	    baseParams: { type: "gl_rep_acc_sub_dtl", i_read: user_right_read }, //Permission i_read
	    root: "data",
	    idProperty: "id",
		totalProperty: "totalCount",
		fields: [
			{ name : "no" },
			{ name : "id" },
			{ name : "gl_rep_acc_hdr_id" },
			{ name : "gl_rep_acc_dtl_id" },
			{ name : "report_name" },
			{ name : "report_name1" },
			{ name : "c_name" },
			{ name : "i_sequence" },
			{ name : "c_comment" },
			{ name : "dc_user_create_id" },
			{ name : "dc_user_create_cost_id" },
			{ name : "d_create" },
			{ name : "dc_user_update_id" },
			{ name : "dc_user_update_cost_id" },
			{ name : "d_update" }
		]
	});
	
	Ext.vw_dc_acc	= new Ext.data.JsonStore({
		autoLoad: false,
	    url: "api/List_GlRepAccTopicDetail.php",
	    baseParams: { type: "vw_dc_acc" },
	    root: "data",
	    idProperty: "id",
		totalProperty: "totalCount",
		fields: [
			{ name: "no" },
			{ name: "id" },
			{ name: "c_code" },
			{ name: "c_name" },
			{ name: "c_acc_name" },
			{ name: "i_chk" }
		]
	});
	
	Ext.gl_rep_acc_hdr	= StoreJson("api/All_GlRepAccTopicDetail.php", "gl_rep_acc_hdr");
	Ext.gl_rep_acc_dtl	= StoreJson("api/All_GlRepAccTopicDetail.php", "gl_rep_acc_dtl");
	
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
	    if( t ) {
	        Ext.getCmp("icon-save").hide();
	    } else {
	        Ext.getCmp("icon-save").show();
	    }
	}
	
	function controllTab(record,butt) {
		
		Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; //null obj not errer
		
		var frmAdd	= new formAdd();
		
		if( butt == "add" ) {
			
			Ext.getCmp("contenterCenter").add(frmAdd);
			Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
			Ext.getCmp("role-form-mode").setValue("ADD");
			
		} else if( butt == "edit" || butt == "view" ) {
			
			function chkData() {
				
				Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");

				// loadmask
				var myComboStores	= [ Ext.vw_dc_acc, Ext.gl_rep_acc_hdr, Ext.gl_rep_acc_dtl ];
				var loaded			= true;
				Ext.each( myComboStores , function( stores ) { if(stores.chkMask == false) { loaded = false; } });
					
				if( loaded == true ) {
					Ext.getCmp("contenterCenter").getEl().unmask();
			        Ext.getCmp("form-widgets").getForm().loadRecord(record);
				}
			}
			
			Ext.getCmp("contenterCenter").add(frmAdd); 
	        Ext.getCmp("contenterCenter").setActiveTab(frmAdd);  
	        Ext.getCmp("role-form-mode").setValue("EDIT");
	        
	        Ext.vw_dc_acc.setBaseParam("gl_rep_acc_hdr_id", record.get("gl_rep_acc_hdr_id"));
			Ext.vw_dc_acc.setBaseParam("gl_rep_acc_sub_dtl_id", record.get("id"));
			Ext.vw_dc_acc.load({ callback: function(records, operation, success) { if ( success == true ){ this.chkMask = true; chkData(); } } });
			
			Ext.gl_rep_acc_dtl.setBaseParam("gl_rep_acc_hdr_id", record.get("gl_rep_acc_hdr_id"));
			Ext.gl_rep_acc_dtl.load({ callback: function(records, operation, success) { if ( success == true ){ this.chkMask = true; chkData(); } } });
	        
	        if( butt == "view" ) { DisbledButton(true); }
	        else { DisbledButton(false); }
	        
	    } else if( butt == "remove" ) {
	    	
	    	new Ext.Window({
	    		id : "win-msg-delete",
	    		title : "แจ้งเตือน",
	    		modal: true,
	    		width : 250,
	    		height : 130,
	    		html: "ท่านต้องการที่จะลบข้อมูล ?",
	    		buttons : [{
	    			text : "Confirm",
	    			handler : function() {
	    				Ext.Ajax.request({
	    					url: "api/mn_GlRepAccTopicDetail.php",
	    					params : {
	    						mode: "DELETE",
	    						id: record.get("id")
	    					},
	    					method: "POST", //POST
	    					success: function ( result, request ) {
	    						var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
	    						if (jsonData.success == true) {
	    							Ext.getCmp("win-msg-delete").destroy();						// clear memory :: garbage collection
	    							Ext.store.reload();
	    						} else {
	    							Ext.MessageBox.alert("Failed", jsonData.msg);			// alert massage error
	    						}
	    					},
	    					failure: function ( result, request) {
	    						Ext.MessageBox.alert("Failed", result.responseText);		// connect error
	    					}
	    				});
	    			}
	    		}, {
	    			text : "Cancel",
	    			handler : function() { Ext.getCmp("win-msg-delete").destroy(); }
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
				layout: "column",
				modal: true,
				border: false,
				items:[{ // column 1
		            columnWidth: 0.5,
		            layout: "fit",
		            height: (Ext.getBody().getViewSize().height * 0.8),
					width: (Ext.getBody().getViewSize().width * 0.25),
					border: false,
		            items: [new Ext.FormPanel({
		            	id: "form-widgets",
		                labelWidth: 90, // label settings here cascade unless overridden
		                labelAlign: "right",
		                frame: true,
		                items: [{
		                	id: "role-form-mode",
	        				xtype: "hidden",
	        				readOnly: true				
	        			}, {
	        				xtype: "hidden",
	        				id: "id",
	        				name: "id",
	        				readOnly: true
	        			}, new Ext.form.ComboBox({
	        				fieldLabel: "สำหรับรายงาน",
	        				id: "gl_rep_acc_hdr_id",
	        				name: "gl_rep_acc_hdr_id",
							store: Ext.gl_rep_acc_hdr,
							valueField: "id",
							displayField: "c_name",
							mode: "local",
							triggerAction: "all",
							emptyText: "กรุณาเลือก...",
							width: 400,
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
								blur: function() { this.getStore().clearFilter(); },
								change: function(combo, newValue) {
									
									if ( newValue == "" ) {
										combo.reset();
										
										Ext.vw_dc_acc.setBaseParam("gl_rep_acc_hdr_id", "");
										Ext.vw_dc_acc.setBaseParam("gl_rep_acc_sub_dtl_id", "");
										Ext.vw_dc_acc.load();
										
										Ext.gl_rep_acc_dtl.setBaseParam("gl_rep_acc_hdr_id", "");
										Ext.gl_rep_acc_dtl.load();
										
									} else { 
										
										Ext.vw_dc_acc.setBaseParam("gl_rep_acc_hdr_id", newValue);
										Ext.vw_dc_acc.setBaseParam("gl_rep_acc_sub_dtl_id", "");
										Ext.vw_dc_acc.load();
										
										Ext.gl_rep_acc_dtl.setBaseParam("gl_rep_acc_hdr_id", newValue);
										Ext.gl_rep_acc_dtl.load();
										
									}
									
									Ext.getCmp("gl_rep_acc_dtl_id").setValue("");
									
								}
							}
						}), new Ext.form.ComboBox({
	        				fieldLabel: "หัวข้อที่ 1",
	        				id: "gl_rep_acc_dtl_id",
	        				name: "gl_rep_acc_dtl_id",
							store: Ext.gl_rep_acc_dtl,
							valueField: "id",
							displayField: "c_name",
							mode: "local",
							triggerAction: "all",
							emptyText: "กรุณาเลือก...",
							width: 400,
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
								blur: function() { this.getStore().clearFilter(); },
								change: function(combo, newValue) { if ( newValue == "" ) { combo.reset(); } }
							}
						}), {
							xtype: "textfield",
							fieldLabel: "ชื่อหัวข้อที่ 2",
							id: "c_name",
							name: "c_name",
							width: 400
						}, {
		                   	xtype: "textarea",
		                   	fieldLabel: "คำอธิบายรายการ",
		                   	id: "c_comment",
		                   	name: "c_comment",
		                   	width: 400
		                }, {
							xtype: "textfield",
							fieldLabel: "ลำดับ",
							id: "i_sequence",
							name: "i_sequence",
							width: 400,
							listeners: {
								afterrender: function() {
									this.fn	= function() {
										this.setValue(floatAccount(this.getValue(), 0));
									}
								},
								Change: function(value) { this.fn(); }
							}
		                }],
		                buttons: [{
		                	text: Ext.GLOBAL_BU_SAVE_TH,
		                    iconCls: "icon-save",
		                    id: "icon-save",
		                    handler: function(grid, rowIndex, colIndex) {
							
								var msg		= "";
								var jsonArr = [];

								if(Ext.getCmp("gl_rep_acc_hdr_id").getValue() == "") { msg += "- กรุณาเลือก สำหรับรายงาน<br>"; }
								if(Ext.getCmp("gl_rep_acc_dtl_id").getValue() == "") { msg += "- กรุณาเลือก หัวข้อที่ 1<br>"; }
								if(Ext.getCmp("c_name").getValue() == "") { msg	+= "- กรุณากรอก ชื่อหัวข้อที่ 2<br>"; }
								if(Ext.getCmp("i_sequence").getValue() == "") { msg	+= "- กรุณากรอก ลำดับ<br>"; }
			       				
			       				$( "input[id^=chk]" ).each(function( i, val ) {
			       					if(val.checked == true) {
			       						jsonArr.push({ dc_acc_id: val.value });
			       					}
			    				});
			       				
								if (msg == "") {
									
									Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
									Ext.Ajax.request({
										url: "api/mn_GlRepAccTopicDetail.php",
										method: "POST",
										params: {
											mode: Ext.getCmp("role-form-mode").getValue(),
											id: Ext.getCmp("id").getValue(),
											gl_rep_acc_dtl_id: Ext.getCmp("gl_rep_acc_dtl_id").getValue(),
											c_name: Ext.getCmp("c_name").getValue(),
											c_comment: Ext.getCmp("c_comment").getValue(),
											i_sequence: Ext.getCmp("i_sequence").getValue(),
											data: JSON.stringify(jsonArr)
										},
										success: function ( result, request ) {
											Ext.getCmp("contenterCenter").getEl().unmask();
											var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
											if (jsonData.success == true) {
												Ext.store.load();
												Ext.Msg.alert("แจ้งเตือน", "บันทึกเรียบร้อย");
												Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
											} else {
												Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg);			// alert massage error
											}
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
								Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
							}
						}]
		            })]
				}, { // column 2
		            columnWidth: 0.5,
		            layout: "fit",
		            height: (Ext.getBody().getViewSize().height * 0.8),
					width: (Ext.getBody().getViewSize().width * 0.65),
		            items: [{
						xtype: "grid",
						border: false,
						stripeRows: true,
						loadMask: true,
						store: Ext.vw_dc_acc,
						viewConfig : {
							emptyText: "ไม่มีข้อมูล..",
							deferEmptyText: false
						},
						listeners : {
							afterrender : function() {
								Ext.vw_dc_acc.setBaseParam("gl_rep_acc_hdr_id","");
								Ext.vw_dc_acc.setBaseParam("gl_rep_acc_sub_dtl_id","");
								Ext.vw_dc_acc.load();
							}
						},
						columns:[
							new Ext.grid.RowNumberer({header:"ที่", width: 30,
								renderer:function(value, metaData, record, row, col, store, gridView) {
									return record.get("no");
								}
							}), {
								header: "<div class='topAlign'><input type='checkbox' onclick='checkAll(this.checked)'></div>",
								sortable: false, align: "center", width:50, dataIndex: "id",
								renderer: function(value, metaData, record, row, col, store, gridView) {
									Ext.objChk[value] = "chk["+value+"]";
									return "<input type='checkbox' id='chk["+value+"]' value="+value+" "+((record.get("i_chk"))?'checked':'')+">";
								}
							},
							{ header: "รหัส", sortable: true, align:"center", dataIndex: "c_code" },
							{ id: "c_name", header: "ชื่อบัญชี", sortable: true, dataIndex: "c_name" }
					    ],
					    autoExpandColumn: "c_name"
					}]
				}]
			}]
		});
	}; // formAdd
	Ext.extend(formAdd, Ext.Panel, {}); 
	
	//============================== cellClick ==============================//
	cellClick	= function( grid, rowIndex, columnIndex, e ) {
		
		var record = grid.getStore().getAt(rowIndex);
		
		if (columnIndex == grid.getColumnModel().getIndexById("view")) {
			controllTab(record, "view");
		} else if (columnIndex == grid.getColumnModel().getIndexById("edit")) {
			controllTab(record, "edit");
		} else if (columnIndex == grid.getColumnModel().getIndexById("remove")) {
			controllTab(record, "remove");
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
							[ "c_name", "ชื่อหัวข้อที่ 2"],
							[ "c_report1", "ชื่อหัวข้อที่ 1"],
							[ "c_report", "ชื่อรายงาน"]
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
				handler: function(grid, rowIndex, colIndex) { controllTab({}, "add"); }
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
			{ id: "c_name", header: "ชื่อหัวข้อที่ 2", sortable: true, dataIndex: "c_name" },
			{ header: "ชื่อหัวข้อที่ 1",  sortable: true, dataIndex: "report_name1" },
			{ header: "ลำดับ", sortable: true, align: "center", dataIndex: "i_sequence" },
			{ header: "ชื่อรายงาน", sortable: true, dataIndex: "report_name" },
			{ header: "ผู้แก้ไขรายการ", sortable: true, dataIndex: "dc_user_update_id" },
			{ header: "วันที่แก้ไข", sortable: true, align: "center", renderer:shortThaiDate, dataIndex: "d_update" },
			{ header: "หน่วยงานที่แก้ไข", sortable: true, dataIndex: "dc_user_update_cost_id" },
			{ id: "view", header: "แสดง", sortable:false, align: "center", width: 100, dataIndex: "id",
				renderer: function(value, metaData, record, row, col, store, gridView) {
					return "<img src=\"../images/icons/magnifier2.png\"); style=\"cursor:pointer\"/>";
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