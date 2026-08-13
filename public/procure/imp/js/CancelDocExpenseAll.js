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

	/* =============================================== */
	title_panel		= "ยกเลิกฎีกา&เช็ค  (e-PHIS & Vision Net)";
	/* =============================================== */
	
	Ext.store = new Ext.data.JsonStore({
		id: "store",
	    autoDestroy: true,
		autoLoad: false, 
	    url: "api/List_CancelDocExpenseAll.php",
	    baseParams: { type: "imp_expense_approve", i_read: user_right_read }, // Permission i_read
	    root: "data",
	    idProperty: "id",
		totalProperty: "totalCount",
		fields: [
		         { name : "no" },
		         { name : "id" },
		         { name : "hdr_id" },
		         { name : "gl_tran_hdr_id" },
		         { name : "table_name" },
		         { name : "c_code_g" },
		         { name : "c_approve" },
		         { name : "d_doc_date" },
		         { name : "c_acc_item" },
		         { name : "f_inv" },
		         { name : "i_status" },
		         { name : "gl_tran_hdr_id_cancel" },
		         { name : "gl_tran_hdr_bank_id_cancel" },
		         { name : "c_code_cancel" },
		         { name : "c_code_bank_cancel" },
				]
	});
	
	Ext.imp_expense_cheque = new Ext.data.JsonStore({
	    autoDestroy: false,
		autoLoad: false, 
	    url: "api/List_CancelDocExpenseAll.php",
	    baseParams: { type: "imp_expense_cheque", i_read: user_right_read }, // Permission i_read
	    root: "data",
	    idProperty: "id",
		totalProperty: "totalCount",
		fields: [
		         { name : "no" },
		         { name : "id" },
		         { name : "c_name" },
		         { name : "d_cheque" },
		         { name : "f_cheque" },
				]
	});
	
	// pagingBar
	pagingBar = new Ext.PagingToolbar({
		pageSize: 20,
		store: Ext.store,
		displayInfo: true,
		displayMsg: "Displaying topics {0} - {1} of {2}"
	});
	
	function pop_cancel( arr ) {

		new Ext.Window({
			title: "เลือกข้อมูล",
			id: "win-pop-cancel",
			layout: "column",
			modal: true,
			border: false,
			items:[{ // column 1
	            columnWidth: 0.4,
	            layout: "fit",
	            height: (Ext.getBody().getViewSize().height * 0.6),
				width: (Ext.getBody().getViewSize().width * 0.25),
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
	                            { fieldLabel: "เลขที่ฏีกา", style: "color:red; font-weight: bold;", value: arr.data.c_approve }
		                        ,{ fieldLabel: "รหัส", value : arr.data.c_code_g }
		                        ,{ fieldLabel: "ข้อมูลนำเข้า", value : ((arr.data.table_name == "imp_expense_hdr")? "e-PHIS" : "Vision Net") }
		                    	,{ fieldLabel: "วันที่จ่ายเงิน", value : shortThaiDate(arr.data.d_doc_date) }
		                    	,{ fieldLabel: "ชื่อรายการ", value : arr.data.c_acc_item }
		                    	,{ fieldLabel: "จำนวนขอเบิก", value : floatRenderer(arr.data.f_inv) }
		                    	,{
									xtype: "compositefield"
									,fieldLabel: "วันที่บันทึกบัญชียกเลิกฎีกา"
									,anchor: "100%"
									,msgTarget: "under"
									,readOnly: false
									,items: [
									        { id: "d_save_jv_cancel", fieldLabel: "วันที่บันทึกบัญชียกเลิกฎีกา", xtype: "datefield", width: 128, readOnly: false }
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
	                		var check	= false;
			   				var jsonArr = [];
	                    	
			   				$( "input[id^=chk]" ).each(function( i, val ) {
			   					if(val.checked == true) {
			   						check	= true;
			   						jsonArr.push({cheque_id : val.value});
			   					}
							});
			   				
			   				if(Ext.getCmp("d_save_jv_cancel").getValue() == "") { msg	+= "กรุณากรอก วันที่บันทึกบัญชียกเลิกฎีกา<br>"; }
							if( check == false ) { msg += "- กรุณาเลือกเช็ค อย่างน้อย 1 รายการ<br>"; }

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
	    										url: "api/mn_CancelDocExpenseAll.php",
	    										method: "POST",
	    										params: {
	    											mode: "CANCEL", 
	    											gl_tran_hdr_id: arr.data.gl_tran_hdr_id,
	    											hdr_id: arr.data.hdr_id,
	    											dtl_id: arr.data.id,
	    											table_name: arr.data.table_name,
	    											d_save_jv_cancel: Ext.util.Format.date(Ext.getCmp("d_save_jv_cancel").getValue(), "Y-m-d"),
	    											data: JSON.stringify(jsonArr)
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
	                },{
	                    text: Ext.GLOBAL_BU_BACK_TH,
	                    handler : function() { Ext.getCmp("win-pop-cancel").destroy(); }
	                }]
	            })]
			}, { // column 2
	            columnWidth: 0.6,
	            layout: "fit",
	            height: (Ext.getBody().getViewSize().height * 0.6),
				width: (Ext.getBody().getViewSize().width * 0.65),
	            items: [{
					xtype: "grid",
					border: false,
					stripeRows: true,
					loadMask: true,
					store: Ext.imp_expense_cheque,
					viewConfig : {
						emptyText: "ไม่มีข้อมูล..",
						deferEmptyText: false
					},
					listeners : {
						afterrender : function() {
							this.getStore().setBaseParam("table_name",arr.data.table_name);
							this.getStore().setBaseParam("dtl_id",arr.data.id);
							this.getStore().load({
					            callback : function (records, operation, success) {
					            	if (success) {
					            		$('#checkAll').prop('checked', true);
					            		checkAll(true);
					            	}
					            }
							});
						}
					},
					columns: [
				    new Ext.grid.RowNumberer({header:"ที่", width: 30,
						renderer: function(value, metaData, record, row, col, store, gridView) {
							return record.get("no");
						}
					}), {
						header: "<div class='topAlign'><input id='checkAll' type='checkbox' onclick='checkAll(this.checked)'></div>",
						sortable: false, align: "center", width:50, dataIndex: "id",
						renderer: function(value, metaData, record, row, col, store, gridView) {
							Ext.objChk[value] = "chk["+value+"]";
							return "<input type='checkbox' id='chk["+value+"]' value="+value+" checked>";
						}
					},
					{ header: "เลขที่เช็ค", sortable: false, align: "center", width:300, dataIndex: "c_name" },
					{ header: "วันที่เช็ค", sortable: true, align: "center", dataIndex: "d_cheque",
						renderer: function(value, metaData, record, rowIndex, colIndex, store) {
							return (value != "")? shortThaiDate(value) : "";
						}
					},
					{ header: "จำนวนเงิน", sortable: false, align: "right", dataIndex: "f_cheque",
						renderer: function(value, metaData, record, row, col, store, gridView) {
							return floatRenderer(floatMinus(value, 2));
						}
					}],
				}]
			}]
		}).show();
	};

	function controllTab(record,butt) {
		if( butt == "cancel" ) { pop_cancel( record ); }
	}; // controllTab

	function Preview( id ) {
		new Ext.Window({
			title: "แสดงรายละเอียดสมุดรายวัน",
			id: "Preview",
			modal: true,
			preventBodyReset: true,
			closable: true,
			autoScroll: true,
			maximized: true, // เต็มจอ auto
			html: "<iframe name=\"printf\" src=\"../gl/preview/Pre_GlTranHdr.php?id="+id+"\" style=\"width:100%; height:100%; border-style:hidden;\"></iframe>",		
			buttonAlign: "left",
			buttons: [{
				text : "&nbsp;"+Ext.GLOBAL_BU_PRINT_TH+"&nbsp;",
				iconCls	: "printer_mono",
				handler: function() { document.printf.window.print(); }
			}, {
				text: Ext.GLOBAL_BU_BACK_TH,
				handler: function() {
					Ext.getCmp("Preview").destroy();
				}
			}]
		}).show();
	}
	
	// ================================ gridMain ================================ //
	cellClick	= function( grid, rowIndex, columnIndex, e ) {
		
		var record = grid.getStore().getAt(rowIndex);
		
		if (columnIndex == grid.getColumnModel().getIndexById("cancel")) {
			if(record.data.i_status == 2) {}
			else { controllTab(record, "cancel"); } 
		} else if (columnIndex == grid.getColumnModel().getIndexById("printBank")) {
			if(record.data.gl_tran_hdr_bank_id_cancel > 0) { Preview(record.data.gl_tran_hdr_bank_id_cancel); }
		} else if (columnIndex == grid.getColumnModel().getIndexById("print")) {
			if(record.data.gl_tran_hdr_id_cancel > 0) { Preview(record.data.gl_tran_hdr_id_cancel); }
		}
	}; // cellClick
	
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
            		width: 100,
					mode: "local",
		            store: new Ext.data.SimpleStore({
		            	fields: [ "value", "text" ],
						data: [
						       [ "c_approve", "เลขที่ฎีกา" ],
						      ]
					}),
					value: "c_approve",
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
            }, {
            	xtype: "buttongroup",
            	frame: false,
            	items: [{ xtype: "label", text: "วันที่จ่ายเงิน : " }, { xtype: "tbspacer", width: 4 }, {
            		id: "s_d_doc_date1", xtype: "datefield", width: 128, 
    				listeners : {
						afterrender : function() {
							var date = new Date();
								date = new Date(date.getFullYear()+542, date.getMonth(), 1);
							this.setValue(date);
						}
					}
            	}, { xtype: "tbspacer", width: 6 }, { xtype: "label", text: "ถึงวันที่ : " }, { xtype: "tbspacer", width: 4 }, {
            		id: "s_d_doc_date2", xtype: "datefield", width: 128, 
    				listeners : {
						afterrender : function() {
							this.setValue(addY(543));
						}
					}
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
    					Ext.store.setBaseParam("d_doc_date1", Ext.util.Format.date(Ext.getCmp("s_d_doc_date1").getValue(), "Y-m-d"));
    					Ext.store.setBaseParam("d_doc_date2", Ext.util.Format.date(Ext.getCmp("s_d_doc_date2").getValue(), "Y-m-d"));
    					Ext.store.load();
						
    				} else { Ext.Msg.alert("แจ้งเตือน", msg); }
    			}
			}]
		}],
		columns: [new Ext.grid.RowNumberer({header:"ที่", width: 30,
			renderer: function(value, metaData, record, row, col, store, gridView) {
				return record.get("no");
			}
		}),
		{ id: "cancel", header: "-", sortable: false, align: "center", width:120, dataIndex: "id",
			renderer: function(value, metaData, record, row, col, store, gridView) {
				if(record.data.i_status == 2) {
					return "<font color=red>ยกเลิกฎีกาแล้ว</font>";
				} else {
					return "<button style='font-size:11px; cursor:pointer; color: red;'>ยกเลิกฎีกา</button>";
				}
			}
		},
		{ header: "ยกเลิก รหัสอ้างอิงใบปะหน้า (GX)", id:"printBank", sortable: true, dataIndex: "c_code_bank_cancel",
			renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				metaData.attr = "align='center'";
				if(record.data.gl_tran_hdr_bank_id_cancel > 0) {
					return val = "<div style='cursor:pointer;'><img src='../images/icons/printer_mono.png' style='margin-right:1px;' />"+value+"</div>";
				}
			}
		},
		{ header: "ยกเลิก รหัสอ้างอิงค่าใช้จ่าย (GX)", id:"print", sortable: true, dataIndex: "c_code_cancel",
			renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				metaData.attr = "align='center'";
				if(record.data.gl_tran_hdr_id_cancel > 0) {
					return val = "<div style='cursor:pointer;'><img src='../images/icons/printer_mono.png' style='margin-right:1px;' />"+value+"</div>";
				}
			}
		},
        { header: "ข้อมูลนำเข้า", sortable: true, align: "center", dataIndex: "table_name",
	    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
	    		if(value == "imp_expense_hdr") {
	    			return "e-PHIS";
	    		} else if (value == "imp_expense_vsn_hdr") {
	    			return "Vision Net";
	    		}
	    	}
	    },
	    { header: "GL", sortable: true, width: 110, align: "center", dataIndex: "c_code_g" },
		{ header: "เลขที่ฎีกา", sortable: true, width: 110, align: "center", dataIndex: "c_approve" },
		{ header: "วันที่จ่ายเงิน", sortable: true, align: "center", dataIndex: "d_doc_date",
			renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				return (value != "")? shortThaiDate(value) : "";
			}
		},
		{ id: "c_acc_item", header: "ชื่อรายการ", sortable: true, width: 300, dataIndex: "c_acc_item" },
		{ header: "จำนวนขอเบิก", sortable: true, dataIndex: "f_inv",
			renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				metaData.attr = "style= 'cursor:pointer; text-align:right; color: blue;';";
				return floatRenderer(value);
			}
		},{ header: "", dataIndex: "", width: 20 },],
		autoExpandColumn: "c_acc_item",
		bbar: pagingBar
	}); // gridMain
	
	/* ====================== CENTER ====================== */
	center = new Ext.TabPanel({
		region: "center",
		border: false,
		// activeTab: 0, //default Tab
		id: "contenterCenter",
		defaults:{ autoScroll: true }, 
		items: [ gridMain ]
	});
	// SET ref Grid&Tab
	Ext.getCmp("tabpanel1").on("cellclick", cellClick, this);

	// SetTab Controller Loads
	Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
	/* ====================== RENDER ====================== */
	new Ext.Viewport({
		layout: "border",
		items: [ center ]
	});
});