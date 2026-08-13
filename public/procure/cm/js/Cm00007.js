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
	var title_panel	= "ประเภทการจ่ายเงิน";
	/*===============================================*/
	
	store = new Ext.data.JsonStore({
		storeId: "myStore",
	    autoDestroy: true,
		autoLoad: false,
	    url: "api/List_Cm00007.php",
	    baseParams: { type: "cm_voucher_one", i_read: user_right_read }, //Permission i_read
	    root: "data",
	    idProperty: "id",
		totalProperty: "totalCount",
		fields: [
			{ name : "no" },
			{ name : "id" },
			{ name : "c_code" },
			{ name : "c_code_ap" },
			{ name : "cm_pay_type_id" },
			{ name : "name_vch_type" },
			{ name : "c_receiver_name" },
			{ name : "d_doc_date" },
			{ name : "f_net_cost" },
			{ name : "i_enable" },
			{ name : "show_enable" },
			{ name : "dc_user_create" },
			{ name : "dc_user_create_cost" },
			{ name : "d_create" },
			{ name : "dc_user_update" },
			{ name : "dc_user_update_cost" },
			{ name : "d_update" }
		]
	});
	
	store_voucher_hdr	= new Ext.data.JsonStore({
		autoLoad: false,
		url: "api/List_Cm00007.php",
		baseParams: { type: "store_voucher_hdr" },
		root: "data",
		idProperty: "id",
		totalProperty: "totalCount",
		fields: [
			{ name : "no" },
			{ name : "id" },
			{ name : "c_code" },
			{ name : "d_doc_date" },
			{ name : "c_code_ap" },
			{ name : "creditor_type_name" },
			{ name : "c_receiver_name" },
			{ name : "c_receiver_bbank" },
			{ name : "f_net_cost" }
		]
	});
		
	store_cm_pay_type	= new Ext.data.JsonStore({
		autoLoad: true,
		url: "api/All_Cm00007.php",
		baseParams: { type: "cm_pay_type" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ]
	});

	// pagingBar
	pagingBar = new Ext.PagingToolbar({
		pageSize: 20,
		store: store,
		displayInfo: true,
		displayMsg: "Displaying topics {0} - {1} of {2}"
	});
	
	// Add_Data
	function Add_Data() {
		
		Ext.getCmp("tabpanel1").getEl().mask("Please wait...", "x-mask-loading");
		
		// Check Load Store
		function chkData() {
			
			// loadmask
			var myComboStores	= [ store_voucher_hdr ];
			var loaded			= true;
			Ext.each( myComboStores , function( stores ) { if(stores.chkMask == false) { loaded = false; } });
				
			if( loaded == true ) {
				
				Ext.getCmp("tabpanel1").getEl().unmask();

				// NEW WINDOW
				new Ext.Window({
					title: "เลือกข้อมูล",
					id: "win-pop-save",
					layout: "column",
					modal: true,
					border: false,
					items:[{
			            layout: "fit",
			            height: (Ext.getBody().getViewSize().height * 0.9),
						width: (Ext.getBody().getViewSize().width * 0.9),
			            items: [{
							xtype: "grid",
							id: "grid-save",
							border: false,
							stripeRows: true,
							loadMask: true,
							store: store_voucher_hdr,
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
					            	items: [{ xtype: "label", text: "ค้นหาตามเลขที่จัดทำใบสำคัญจ่าย : " }, { xtype: "tbspacer", width: 4 }, {
					            		xtype: "textfield",
					            		id: "pop-value-box",
					            		width: 250,
					           			fieldLabel: "fieldLabel",
					           			emptyText: "คำที่ต้องการค้นหา"
					           		}, { xtype: "tbspacer", width: 4 }, {
					           			xtype: "button",
					           			text: "ค้นหา",
					           			iconCls: "icon-magnifier",
					           			width: 90,
					           			handler : function() {
											if (Ext.getCmp("pop-value-box").getValue() != "") {
												store_voucher_hdr.setBaseParam("filter", "c_code");
												store_voucher_hdr.setBaseParam("value", Ext.getCmp("pop-value-box").getValue());
											} else {
												store_voucher_hdr.setBaseParam("value", "");
												store_voucher_hdr.setBaseParam("filter", "");
											}
	
											store_voucher_hdr.setBaseParam("mode", "SEARCH");
											store_voucher_hdr.load();
										}
					           		}],
					            }, 	{ xtype: "buttongroup", frame: false, width: "100%", html: "<hr>" },
					            { // แถวที่ 3
					            	xtype: "buttongroup",
					            	frame: false,
					            	items: [{ xtype: "label", text: "ระบุประเภทการจ่ายเงิน : " }, { xtype: "tbspacer", width: 4 }, 
				            	        new Ext.form.ComboBox({
											fieldLabel: "ระบุประเภทการจ่ายเงิน ",
											id: "cm_pay_type_id",
											store: store_cm_pay_type,
											valueField: "id",
											displayField: "c_name",
											mode: "local",
											triggerAction: "all",
											emptyText: "กรุณาเลือก ระบุประเภทการจ่ายเงิน",
											width: 250,
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
										}), { xtype: "tbspacer", width: 4 }, {
					           			xtype: "button",
					           			text: Ext.GLOBAL_BU_SAVE_TH,
										iconCls: "icon-save",
										width: 90,
					           			handler : function() {
					           				
					           				var msg		= "";
					           				var check	= false;
					           				var jsonArr = [];
					           				
					           				$( "input[id^=chk]" ).each(function( i, val ) {
					           					if(val.checked == true) {
					           						check	= true;
					           						jsonArr.push({
						        						cm_voucher_one_id: val.value,
						        						cm_pay_type_id: Ext.getCmp("cm_pay_type_id").getValue()
						        				    });
					           					}
					        				});
					        				
					        				if( Ext.getCmp("cm_pay_type_id").getValue() == "" ) { msg += "กรุณาเลือก ประเภทการจ่ายเงิน<br>"; }
					        				if( check == false ) { msg += "กรุณาเลือก เลขที่ใบสำคัญจ่าย อย่างน้อย 1 รายการ<br>"; }
					        				
					        				if(msg == "") {

					        					Ext.getCmp("win-pop-save").getEl().mask("Please wait...", "x-mask-loading");					        					
					        					$.ajax({
													url: "api/mn_Cm00007.php",
													type: "POST",
													data: {
														type: "SAVE",
														data: JSON.stringify(jsonArr)
													},
													success: function(result) {
														Ext.getCmp("win-pop-save").getEl().unmask();
														var data = $.parseJSON( result );
														if(data.success == true) {
															Ext.Msg.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย");
															Ext.getCmp("win-pop-save").destroy();
															store.load();
														}
													}
												});

					        				} else { Ext.Msg.alert("แจ้งเตือน", msg); }
					        				
					           			}
					           		}],
					            }]
							}],
							columns:[{ header: "id", hidden: true, dataIndex: "id" },
							new Ext.grid.RowNumberer({header:"ที่", width: 30,
								renderer:function(value, metaData, record, row, col, store, gridView) {
									return record.get("no");
								}
							}), {
								header: "<input type='checkbox' onclick='checkAll(this.checked);'></div>",
								sortable: false, width: 60, align: "center", dataIndex: "id",
								renderer: function(value, metaData, record, rowIndex, colIndex, store) {
									Ext.objChk[record.get("no")]	= "chk["+record.get("id")+"]";
									return "<input type='checkbox' id='chk["+record.get("id")+"]' value="+record.get("id")+">";
						    	}
						    },
							{ header: "เลขที่ใบสำคัญจ่าย", sortable: true, align: "center", dataIndex: "c_code" },
							{ header: "วันที่ทำใบสำคัญจ่าย", sortable: true, align: "center", dataIndex: "d_doc_date" },
							{ header: "เลขที่เอกสารใบเบิก", sortable: true, align: "center", dataIndex: "c_code_ap" },
							{ id: "synName", header: "ชื่อเจ้าหนี้", sortable: true, dataIndex: "creditor_type_name" },
							{ header: "ชื่อผู้รับเงิน", sortable: true, dataIndex: "c_receiver_name" },
							{ header: "เลขที่บัญชีผู้รับเงิน", sortable: true, align: "center", dataIndex: "c_receiver_bbank" },
							{ header: "จำนวนเงินจ่ายสุทธิ", sortable: true, dataIndex: "f_net_cost",
								renderer: function(value, metaData, record, rowIndex, colIndex, store) {
									metaData.attr = "style= \"text-align:right\";";
									return (value > 0)? floatRenderer(floatMinus(value, 2)) : "0.00";
								}
							}], 
						    autoExpandColumn: "synName",
							bbar: new Ext.PagingToolbar({
						    	pageSize: 20,
						    	store: store_voucher_hdr,
						    	displayInfo: true,
						    	displayMsg: "Displaying topics {0} - {1} of {2}"
						    }),
						}]
					}]
				}).show();							
			}
		}

		store_voucher_hdr.load({ callback: function(records, operation, success) { if ( success == true ){ this.chkMask = true; chkData(); } } });
		
	}; // Add_Data
	
	//================================ gridMain ================================//
	
	// cellClick
	cellClick	= function( grid, rowIndex, columnIndex, e ) {
		
		var record = grid.getStore().getAt(rowIndex);
	 
		if (columnIndex == grid.getColumnModel().getIndexById("edit")) {
			if(record.get("i_enable") == 1 ) {
				
				new Ext.Window({
					title: "ระบุประเภทการจ่ายเงิน",
					id: "win-pop-dtl",
					layout: "fit",
					modal: true,
					border: false,
					height: (Ext.getBody().getViewSize().height * 0.7),
					width: (Ext.getBody().getViewSize().width * 0.7),
					listeners: {
						afterrender: function( component ) {
							
							Ext.getCmp("win-pop-dtl").getEl().mask("Please wait...", "x-mask-loading");
							$.ajax({
								url: "api/List_Cm00007.php",
								type: "POST",
								data: {
									type: "LIST_EDIT",
									cm_voucher_one_id: record.id
								},
								success: function(result) {
									Ext.getCmp("win-pop-dtl").getEl().unmask();
									var data = $.parseJSON( result );
									if(data.success == true) {
										Ext.getCmp("dtl_c_code").setValue(data.data.c_code);
										Ext.getCmp("dtl_name_vch_type").setValue(data.data.name_vch_type);
										Ext.getCmp("dtl_d_doc_date").setValue(data.data.d_doc_date);
										Ext.getCmp("dtl_c_code_ap").setValue(data.data.c_code_ap);
										Ext.getCmp("dtl_creditor_type_name").setValue(data.data.creditor_type_name);
										Ext.getCmp("dtl_c_receiver_name").setValue(data.data.c_receiver_name);
										Ext.getCmp("dtl_c_receiver_bbank").setValue(data.data.c_receiver_bbank);
										Ext.getCmp("dtl_f_net_cost").setValue(data.data.f_net_cost);
										Ext.getCmp("dtl_f_net_cost").fn();
										Ext.getCmp("dtl_cm_pay_type_id").setValue(data.data.cm_pay_type_id);
										
									}
								}
							});
						}
					},
					items: [new Ext.FormPanel({
						frame: false,
						autoScroll: true,
						labelWidth: 250,
						labelAlign: "right",
						bodyStyle: "padding:5px 5px 0;",
						items: [{
							xtype: "displayfield",
							fieldLabel: "เลขที่ใบสำคัญจ่าย",
							id: "dtl_c_code"
						}, {
							xtype: "displayfield",
							fieldLabel: "ประเภทการจ่ายเงิน",
							id: "dtl_name_vch_type"
						}, {
							xtype: "displayfield",
							fieldLabel: "วันที่ทำใบสำคัญจ่าย",
							id: "dtl_d_doc_date"
						}, {
							xtype: "displayfield",
							fieldLabel: "เลขที่เอกสารใบเบิก",
							id: "dtl_c_code_ap"
						}, {
							xtype: "displayfield",
							fieldLabel: "ชื่อเจ้าหนี้",
							id: "dtl_creditor_type_name"
						}, {
							xtype: "displayfield",
							fieldLabel: "ชื่อผู้รับเงิน",
							id: "dtl_c_receiver_name"
						}, {
							xtype: "displayfield",
							fieldLabel: "เลขที่บัญชีผู้รับเงิน",
							id: "dtl_c_receiver_bbank"
						}, {
							xtype: "displayfield",
							fieldLabel: "จำนวนเงินจ่ายสุทธิ",
							id: "dtl_f_net_cost",
							listeners: {
								afterrender: function() {
									this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue(), 2))); }
								},
								Change: function(value) { this.fn(); }
							}
						}, new Ext.form.ComboBox({
							fieldLabel: "ระบุประเภทการจ่ายเงิน ",
							id: "dtl_cm_pay_type_id",
							store: store_cm_pay_type,
							valueField: "id",
							displayField: "c_name",
							mode: "local",
							triggerAction: "all",
							emptyText: "กรุณาเลือก ระบุประเภทการจ่ายเงิน",
							width: 250,
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
						})],
						buttonAlign: "left",
						buttons: [{
							text: Ext.GLOBAL_BU_SAVE_TH,
							iconCls: "icon-save",
							handler: function(grid, rowIndex, colIndex) {
	
								var msg		= "";
								var check	= false;
					           	var jsonArr = [];
								
								if(Ext.getCmp("dtl_cm_pay_type_id").getValue() == "") { msg += "กรุณาเลือก ระบุประเภทการจ่ายเงิน"; }
					           	
					           	jsonArr.push({
					           		cm_voucher_one_id: record.get("id"),
					           		cm_pay_type_id: Ext.getCmp("dtl_cm_pay_type_id").getValue()
								});
								
								if(msg == "") {
								
									Ext.getCmp("win-pop-dtl").getEl().mask("Please wait...", "x-mask-loading");					        					
					        		$.ajax({
					        			url: "api/mn_Cm00007.php",
					        			type: "POST",
					        			data: {
					        				type: "SAVE",
					        				data: JSON.stringify(jsonArr)
										},
										success: function(result) {
											Ext.getCmp("win-pop-dtl").getEl().unmask();
											var data = $.parseJSON( result );
											if(data.success == true) {
												Ext.Msg.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย");
												Ext.getCmp("win-pop-dtl").destroy();
												store.load();
											}
										}
									});							
								
								} else { Ext.MessageBox.alert("แจ้งเตือน", msg); }
							}
						}, {
							text: Ext.GLOBAL_BU_BACK_TH,
							handler: function() { Ext.getCmp("win-pop-dtl").destroy(); }
						}]
					})]
				}).show();
				
			}			
		}
	}; //cellClick
	
	// gridMain
	gridMain = new Ext.grid.GridPanel({
		region: "center",
		layout: "fit",
		title: "แสดงรายการ"+title_panel,
		id: "tabpanel1",
		border: false,
		stripeRows: true,
		loadMask: true,
		store: store,
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
		            width: 150,
					mode: "local",
		            store: new Ext.data.SimpleStore({
		            	fields: [ "value", "text" ],
						data: [
						       [ "c_code_ap", "เลขที่เอกสารใบเบิก" ],
						       [ "c_code", "เลขที่จัดทำใบสำคัญจ่าย" ]
						]
					}),
					value: "c_code_ap",
					valueField: "value",
					displayField: "text",
					allowBlank: false,
					editable: false,
					triggerAction: "all",
					typeAhead : false
				}, { xtype: "tbspacer", width: 4 }, {
	        		xtype: "textfield",
	        		id: "value-box",
	        		width: 136,
	       			fieldLabel: "fieldLabel",
	       			emptyText: "คำที่ต้องการค้นหา"
	       		}]
	        }, { // แถวที่ 2
	        	xtype: "buttongroup",
	        	frame: false,
	        	items: [{ xtype: "label", text: "ระหว่างวันที่ : " }, { xtype: "tbspacer", width: 4 }, {
	        		id: "s_doc_date1", xtype: "datefield", width: 122, 
					listeners : {
						afterrender : function() {
							var date = new Date();
								date = new Date(date.getFullYear()+543, date.getMonth()-2, 1);
							this.setValue(date);
						}
					}
	        	}, { xtype: "tbspacer", width: 5 }, { xtype: "label", text: "ถึงวันที่ : " }, { xtype: "tbspacer", width: 4 }, {
	        		id: "s_doc_date2", xtype: "datefield", width: 122, 
					listeners : {
						afterrender : function() {
							this.setValue(addY(543));
						}
					}
	        	}]
	        }],
	        buttonAlign: "left",
			buttons:[{
				text : "เพิ่มข้อมูล",
				iconCls: "icon-add",
				handler: function(grid, rowIndex, colIndex) { Add_Data(); }
			}, { xtype: "tbfill" }, {
				text : "ค้นหา",
				iconCls: "icon-magnifier",
				handler : function() {
					var msg	= "";
					
					if(Ext.getCmp("s_doc_date1").getValue() == "" || Ext.getCmp("s_doc_date2").getValue() == "") {
						msg	+= "กรุณากรอก วันที่บันทึก<br>";
					}
					
					if(msg == "") {
						if(Ext.getCmp("value-box").getValue() != "") {
							store.setBaseParam("value", Ext.getCmp("value-box").getValue());
							store.setBaseParam("filter", Ext.getCmp("filter").getValue());
						} else {
							store.setBaseParam("value", "");
							store.setBaseParam("filter", "");
						}
						
						store.setBaseParam("mode", "SEARCH");
						store.setBaseParam("s_doc_date1", Ext.util.Format.date(Ext.getCmp("s_doc_date1").getValue(), "Y-m-d"));
						store.setBaseParam("s_doc_date2", Ext.util.Format.date(Ext.getCmp("s_doc_date2").getValue(), "Y-m-d"));
						store.load();
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
			{ id: "edit", header: "-", sortable: true, align: "center", dataIndex: "id",
				renderer: function(value, metaData, record, row, col, store, gridView) {
					if(record.get("i_enable") == 1) {
						return "<button style=\"font-size:11px; cursor:pointer;\">ระบุการจ่ายเงิน</button>&nbsp;";
					} else { return null; }
				}
			},
			{ header: "เลขที่จัดทำใบสำคัญจ่าย", sortable: true, align: "center", dataIndex: "c_code" },
			{ header: "เลขที่เอกสารใบเบิก/ใบยืม", sortable: true, align: "center", dataIndex: "c_code_ap" },
			{ header: "ประเภทการจ่ายเงิน", sortable: true, align: "center", dataIndex: "name_vch_type" },
			{ id: "c_receiver_name", header: "ชื่อผู้รับเงิน", sortable: true, dataIndex: "c_receiver_name" },
			{ header: "วันที่ทำใบสำคัญจ่าย", sortable: true, align: "center", renderer:shortThaiDate, dataIndex: "d_doc_date" },
			{ header: "จำนวนเงินรวม", sortable: true, align: "center", dataIndex: "f_net_cost",
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					metaData.attr = "style= \"text-align:right\";";
					return (value > 0)? floatRenderer(floatMinus(value, 2)) : "0.00";
				}
			},
			{ header: "ผู้แก้ไขรายการ", sortable: true, align: "center", dataIndex: "dc_user_update" },
			{ header: "วันที่แก้ไข", sortable: true, align: "center", renderer:shortThaiDate, dataIndex: "d_update" }
		],
		autoExpandColumn: "c_receiver_name",
		bbar: pagingBar
	}); //gridMain
	
	/*====================== CENTER ======================*/
	center = new Ext.TabPanel({
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
