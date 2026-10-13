Ext.onReady(function() {
	Ext.QuickTips.init();
	
	/*===============================================*/
	title_panel		= "ยกเลิก Bank Statement";
	/*===============================================*/
	
	Ext.store = new Ext.data.JsonStore({
		id: "store",
	    autoDestroy: true,
		autoLoad: true, 
	    url: "api/List_CancelCmImpMonth.php",
	    baseParams: { type: "CancelCmImpMonth", i_read: user_right_read }, //Permission i_read
	    root: "data",
	    idProperty: "id",
		totalProperty: "totalCount",
		fields: [
				{ name : "no" },
				{ name : "cheque_no" },
				{ name : "i_status" },
				{ name : "dtl_id_cheque" },
				{ name : "c_code_cheque" },
				{ name : "d_doc_date_cheque" },
				{ name : "f_amount_cheque" },
				{ name : "dtl_id_bank" },
				{ name : "c_code_bank" },
				{ name : "d_doc_date_bank" },
				{ name : "f_amount_bank" }
		]
	});
	
	// pagingBar
	pagingBar = new Ext.PagingToolbar({
		pageSize: 20,
		store: Ext.store,
		displayInfo: true,
		displayMsg: "Displaying topics {0} - {1} of {2}"
	});

	function controllTab(record,butt) {
		Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; //null obj not errer
		if( butt == "CANCEL" ) { pop_cancel( record ); }
	}; // controllTab
	
	// ================================ gridMain ================================ //
	// cellClick
	cellClick	= function( grid, rowIndex, columnIndex, e ) {
		
		var record = grid.getStore().getAt(rowIndex);
		if (columnIndex == grid.getColumnModel().getIndexById("CANCEL")) {
			if(record.data.i_status == 1) { controllTab(record, "CANCEL"); }
		}
	}; //cellClick
	
	function pop_cancel( arr ) {

		new Ext.Window({
			title: "เลือกข้อมูล",
			id: "win-pop-cancel",
			layout: "column",
			modal: true,
			border: false,
			items:[{ // column 1
	            columnWidth: 1,
	            layout: "fit",
	            height: 150,
				width: 350,
				border: false,
	            items: [new Ext.FormPanel({
	                labelWidth: 140, // label settings here cascade unless overridden
	                labelAlign: "right",
	                frame: true,
	                items: [{
	                    xtype: "fieldset",
	                    title: "ยกเลิกรายการ",
	                    defaults: { xtype: "displayfield", width: "90%", readOnly: true },
	                    items :[
	                            { fieldLabel: "เลขที่เช็ค", style: "color:red; font-weight: bold;", value: arr.data.cheque_no }
		                    	,{
									xtype: "compositefield"
									,fieldLabel: "วันที่ยกเลิกเช็ค"
									,anchor: "100%"
									,msgTarget: "under"
									,readOnly: false
									,items: [
									   {id: "d_cancel", xtype: "datefield", width: 128, readOnly: false }
									   ,{ xtype: "displayfield", value: "<font color=red>*</font>" }
									]
				                }
                    	]
	                }],
	                buttons: [{
	                	text : "&nbsp;"+Ext.GLOBAL_BU_SAVE_TH+"&nbsp;",
	                	iconCls	: "icon-save",
	                	handler : function() {
	                    	
	                		var msg		= "";
			   				
			   				if(Ext.getCmp("d_cancel").getValue() == "") { msg	+= "กรุณากรอก วันที่ยกเลิกเช็ค<br>"; }

	                    	if(msg == "") {
	                    		
	                    		new Ext.Window({
	    							id: "win-pop-confirm",
	    							title: "ยืนยันรายการ",
	    							modal: true,
	    							autoHeight: true,
	    							width: 270,
	    							html: "<div style='font-size: 14px; padding: 8px 2px; background: #fff; height: 45px;'>ท่านต้องการยกเลิกรายการเช็คหรือไม่ ?</div>",
	    							buttons: [{
	    								text: "Confirm",
	    								handler: function() {
	    									Ext.getCmp("win-pop-confirm").getEl().mask("Please wait...", "x-mask-loading");
	    									Ext.Ajax.request({
	    										url: "api/mn_CancelCmImpMonth.php",
	    										method: "POST",
	    										params: {
	    											mode: "CANCEL",
		                    						cheque_no: arr.data.cheque_no,
		            								cm_imp_cheque_month_dtl_id: arr.data.dtl_id_cheque,
		            								cm_imp_bank_month_dtl_id: arr.data.dtl_id_bank,
		                    						d_cancel: Ext.util.Format.date(Ext.getCmp("d_cancel").getValue(), "Y-m-d")
	    										},
	    										success: function ( result, request ) {
	    											Ext.getCmp("win-pop-confirm").getEl().unmask();
	    											var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
	    											if (jsonData.success == true) {
	    												//Ext.MessageBox.alert("Success", jsonData.msg);		// alert massage success
		    											Ext.store.reload();
	    											}
	    											Ext.getCmp("win-pop-confirm").destroy();
    												Ext.getCmp("win-pop-cancel").destroy();
    												Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg);			// alert massage error
	    										},
	    										failure: function ( result, request) { 
	    											Ext.MessageBox.alert("Failed", result.responseText);		// connect error
	    										}
	    									});
	    								}
	    							}, {
	    								text : Ext.GLOBAL_BU_BACK_TH,
	    								handler : function() { Ext.getCmp("win-pop-confirm").destroy(); }
	    							}]
	    						}).show();
	                    		
	                    	} else { Ext.Msg.alert("แจ้งเตือน", msg); }
	                    }
	                }, {
	                    text: Ext.GLOBAL_BU_BACK_TH,
	                    handler : function() { Ext.getCmp("win-pop-cancel").destroy(); }
	                }]
	            })]
			}]
		}).show();
	};
	
	// gridMain
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
		tbar: [{
			xtype: "buttongroup",
			title: "ระบุเงื่อนไขในการค้นหาข้อมูล",
			columns: 1,
            defaults: { scale: "small", style: "float: right" },
            items: [{
            	xtype: "buttongroup",
            	frame: false,
            	items: [{ xtype: "label", text: "ค้นหาโดย : " }, { xtype: "tbspacer", width: 4 }, {
	            	id: "filter",
            		xtype: "combo",
            		width: 120,
					mode: "local",
		            store: new Ext.data.SimpleStore({
		            	fields: [ "value", "text" ],
						data: [
						       [ "cheque_no", "เลขที่เช็ค" ]
						      ]
					}),
					value: "cheque_no",
					valueField: "value",
					displayField: "text",
					allowBlank: false,
					editable: false,
					triggerAction: "all",
					typeAhead : false
				}, { xtype: "tbspacer", width: 4 }, {
            		xtype: "textfield",
            		id: "value-box",
            		width: 150,
           			fieldLabel: "fieldLabel",
           			emptyText: "คำที่ต้องการค้นหา"
           		}]
            }],
            buttonAlign: "left",
            buttons:[{ xtype: "tbfill" }, {
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
			{ id: "CANCEL", header: "-", sortable: false, align: "center", width: 120,
				renderer: function(value, metaData, record, row, col, store, gridView) {
					if(record.data.i_status == 1) {
						return "<button style='font-size:11px; cursor:pointer; color: red;'>ยกเลิกเช็ค</button>";
					} else if(record.data.i_status == 2) {
						return "<font style='font-size:11px;'>ยังไม่นำเข้าเช็ค IMPCM</font>";
					} else if(record.data.i_status == 3) {
						return "<font style='font-size:11px;'>ยังไม่นำเข้าเช็ค IMPB</font>";
					} else if(record.data.i_status == 4) {
						return "<font style='font-size:11px;'>แหล่งเงินเช็คไม่ตรงกัน</font>";
					} else if(record.data.i_status == 5) {
						return "<font style='font-size:11px;'>ยอดเงินเช็คไม่เท่ากัน</font>";
					}
				}
			},
			{ header: "เลขที่เช็ค", sortable: false, align: "center", width: 100, dataIndex: "cheque_no",
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					return "<font color=blue>"+value+"</font>";
				}
			},
			{ header: "รหัสเช็ค", sortable: false, align: "center", width: 120, dataIndex: "c_code_cheque" },
			{ header: "วันที่เช็ค", sortable: true, align: "center", renderer:shortThaiDate, dataIndex: "d_doc_date_cheque" },
			{ header: "จำนวนเงินเช็ค", sortable: true, dataIndex: "f_amount_cheque",
				renderer: function(value, metaData, record, row, col, store, gridView) {
					metaData.attr = "align='right';";
					return floatRenderer(value);
				}
			},
			{ header: "รหัสธนาคาร", sortable: false, align: "center", width: 120, dataIndex: "c_code_bank" },
			{ header: "วันที่จ่ายธนาคาร", sortable: true, align: "center", renderer:shortThaiDate, dataIndex: "d_doc_date_bank" },
			{ header: "จำนวนเงิน<br>จ่ายธนาคาร", sortable: true, dataIndex: "f_amount_bank",
				renderer: function(value, metaData, record, row, col, store, gridView) {
					metaData.attr = "align='right';";
					return floatRenderer(value);
				}
			}
		],
//		autoExpandColumn: "c_comment",
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
