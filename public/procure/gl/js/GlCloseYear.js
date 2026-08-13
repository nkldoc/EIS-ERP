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

Ext.onReady(function() {
	Ext.QuickTips.init();

	/*===============================================*/
	var title_panel	= "ข้อมูลสมุดรายวัน (ปิดบัญชีประจำปี)";
	
	if( process == "edit" ) {
		text_edit	= "แก้ไข";
	} else if( process == "post" ) {
		text_edit	= "ผ่านรายการ";
	}
	/*===============================================*/
	
	Ext.store = new Ext.data.JsonStore({
		storeId: "myStore",
	    autoDestroy: true,
		autoLoad: true,
	    url: "api/List_GlCloseYear.php",
	    baseParams: { type: "gl_tran_hdr", i_read: user_right_read }, //Permission i_read
	    root: "data",
	    idProperty: "id",
		totalProperty: "totalCount",
		fields: [
			{ name : "no" },
			{ name : "id" }, 
			{ name : "gl_dc_book_type_id" },
			{ name : "c_yyyy_mm" },
			{ name : "c_code" },
			{ name : "c_ref_doc" },
			{ name : "d_doc_date" },
			{ name : "d_save_date" },
			{ name : "i_enable" },
			{ name : "i_is_post" },
			{ name : "i_parent" },
			{ name : "dc_user_create_id" },
			{ name : "dc_user_create_cost_id" },
			{ name : "d_create" },
			{ name : "dc_user_update_id" },
			{ name : "dc_user_update_cost_id" },
			{ name : "d_update" },
			{ name : "i_is_reversing" },
			{ name : "i_is_close_year" },
			{ name : "i_close_year_type" },
			{ name : "f_total_amt" },
			{ name : "table_pk_id" },
			{ name : "table_name" },
			{ name : "table_detail" },
			{ name : "c_code_post" },
			{ name : "c_mm" },
			{ name : "c_yyyy" },
			{ name : "i_type" },
			{ name : "i_preview" },
			{ name : "c_comment1" },
			{ name : "c_comment2" },
			{ name : "c_comment3" },
			{ name : "row_1_gx" },
			{ name : "row_2_gx" },
			{ name : "row_3_gx" },
			{ name : "row_4_gx" },
			{ name : "row_1_gl" },
			{ name : "row_2_gl" },
			{ name : "row_3_gl" },
			{ name : "row_4_gl" },
			{ name : "row_11_gl" },
			{ name : "row_22_gl" },
			{ name : "row_33_gl" },
			{ name : "row_44_gl" }
		]
	});
	
	reader = new Ext.data.JsonReader({
	root: "data",
	idProperty: "id",
	totalProperty: "totalCount",
	fields: [
	         { name : "no" },
	         { name : "id" },
	         { name : "i_rank" },
	         { name : "dc_acc_id" },
	         { name : "dc_acc_name" },
	         { name : "dc_cost_acc_id" },
	         { name : "dc_cost_acc_name" },
	         { name : "i_type_person" },
	         { name : "i_type_person_name" },
	         { name : "f_dr" },
	         { name : "f_cr" },
	         { name : "i_return" },
	         { name : "i_is_nontax_exp" },
	         { name : "dc_product_id" },
	         { name : "dc_product_name" },
	         { name : "dc_debtor_id" },
	         { name : "dc_debtor_name" },
	         { name : "dc_creditor_id" },
	         { name : "dc_creditor_name" },
	         { name : "dc_emp_id" },
	         { name : "dc_emp_name" },
	         { name : "c_other_name" },
	         { name : "total_type" },
	         { name : "c_year" },
	         { name : "dc_expense_budget_type_name" }
	        ]
});
	
	store_tran_dtl = new Ext.ux.grid.livegrid.Store({
		url : "api/List_GlTranhdr.php",
		baseParams: { type: "gl_tran_dtl", total_show: true },
        bufferSize: 5000,
        reader: reader
    });
	
	myView = new Ext.ux.grid.livegrid.GridView({
        nearLimit : 100,
        emptyText: "ไม่มีข้อมูล..",
		deferEmptyText: false,
		//autoFill: true, // ย่อ columns
		//scrollOffset: 0, // ปิดช่อง  scrollbars ของ columns
        loadMask: {
            msg:  'Buffering. Please wait...'
        }
    });
	
	Ext.vw_gl_dc_book_type	= StoreJson("api/All_GlTranhdr.php", "vw_gl_dc_book_type");  
	
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
	        Ext.getCmp("icon-save").hide();
	    }else{
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
			
			Ext.getCmp("i_close_year_type").enable();
			Ext.getCmp("d_save_date").enable();
			
			Ext.getCmp("d_doc_date").setValue(addY(543));
			Ext.getCmp("d_save_date").setValue(addY(543));
			
			store_tran_dtl.setBaseParam("id", "");
			store_tran_dtl.load();
			
		} else if( butt == "edit" || butt == "view" ) {

			if( record.get("i_enable") == 1 || butt == "view" ) {
				Ext.getCmp("contenterCenter").add(frmAdd); 
		        Ext.getCmp("contenterCenter").setActiveTab(frmAdd);  
		        Ext.getCmp("role-form-mode").setValue("EDIT");
		        Ext.getCmp("form-widgets").getForm().loadRecord(record);
		        
		        Ext.getCmp("i_close_year_type").disable();
		        Ext.getCmp("d_save_date").disable();
		        
		        store_tran_dtl.setBaseParam("id", Ext.getCmp("id").getValue());
				store_tran_dtl.load();
		        
		        if(butt == "view") { DisbledButton(true); }
		        else { DisbledButton(false); }	
			}
	        
	    } else if( butt == "print" ) {
	    	Preview(record.get("id"));
	    } else if( butt == "post" ) {

	    	var type1_gx = record.get("row_1_gx");
			var type2_gx = record.get("row_2_gx");
			var type3_gx = record.get("row_3_gx");
			var type4_gx = record.get("row_4_gx");
			
			var type1_gl = record.get("row_1_gl");
			var type2_gl = record.get("row_2_gl");
			var type3_gl = record.get("row_3_gl");
			var type4_gl = record.get("row_4_gl");
			
	    	if( record.get("i_enable") == 1 && record.get("i_is_post") != 3) {

	    		if( ((type1_gx==1) && (type1_gl==0))
						|| ((type2_gx==1) && (type2_gl==0) && (type1_gl==1))
						|| ((type3_gx==1) && (type3_gl==0) && (type1_gl==1) && (type2_gl==1))
						|| ((type4_gx==1) && (type4_gl==0) && (type3_gl==1) && (type2_gl==1) && (type1_gl==1)) 
					) {
	    			
		    		new Ext.Window({
			    		id : "win-msg-delete",
			    		title : "แจ้งเตือน",
			    		modal: true,
			    		width : 250,
			    		height : 130,
			    		html: "ต้องการผ่านรายการบัญชี ที่เลือกใช่หรือไม่ ?",
			    		buttons : [{
			    			text : "Confirm",
			    			handler : function() {
			    				
			    				Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
			    				Ext.Ajax.request({
			    					url : "api/mn_GlCloseYear.php",
			    					params : {
			    						mode : "POST",
			    						id : record.get("id")
			    					},
			    					method: "GET", //POST
			    					success: function ( result, request ) {
			    						Ext.getCmp("contenterCenter").getEl().unmask();
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
			}
	        
	    } else if( butt=="remove" ) {
	    	
	    	if( record.get("i_enable") == 1) {
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
		    					url : "api/mn_GlCloseYear.php",
		    					params : {
		    						mode : "DELETE",
		    						id : record.get("id")
		    					},
		    					method: "GET", //POST
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
		    			handler : function() {
		    				Ext.getCmp("win-msg-delete").destroy();
		    				Ext.store.reload();
		    			}
		    		}]
		    	}).show();
	    	}
	    }
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
			html: "<iframe name=\"printf\" src=\"preview/Pre_GlTranHdr.php?id="+id+"\" style=\"width:100%; height:100%; border-style:hidden;\"></iframe>",
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
	
	//Class Extend
	formAdd	 = function() {

		// เอกสารต้นทาง
		var box1 = {
			title: "เอกสารต้นทาง",
			defaults: { allowBlank: false, anchor: "100%" },
			items: [{
				xtype: "textfield",
				id: "c_ref_doc",
				name: "c_ref_doc",
				fieldLabel: "เลขที่เอกสาร"
			}, {
				xtype: "datefield",
				id: "d_doc_date",
				name: "d_doc_date",
				fieldLabel: "วันที่เอกสาร",
				listeners : {
					render : function(datefield) {
						datefield.setValue(new Date());
					}
				}
			}, {
				xtype: "radiogroup",
				id: "i_close_year_type",
				fieldLabel: "ประเภทการโอน",
				itemCls: "x-check-group-alt",
				columns: 1,
				items: [
				    { boxLabel: "โอนจากบัญชีหมวด 4 เข้าบัญชีกำไร(ขาดทุน)สะสม-สุทธิ ประจำปี", name: "i_close_year_type", inputValue: 1,checked: true },
				    { boxLabel: "โอนจากบัญชีหมวด 5 เข้าบัญชีกำไร(ขาดทุน)สะสม-สุทธิ ประจำปี", name: "i_close_year_type", inputValue: 2 },
				    { boxLabel: "โอนจากบัญชีกำไร(ขาดทุน)สะสม-ประจำปี แยกตามศูนย์ต้นทุนทางบัญชี เข้าบัญชีกำไร(ขาดทุน)สะสม-ยังไม่ได้จัดสรร", name: "i_close_year_type", inputValue: 3 },
				    { boxLabel: "โอนเงินปันผลจ่าย เข้าบัญชีกำไร(ขาดทุน)สะสม-สุทธิ ยังไม่ได้จัดสรร", name: "i_close_year_type", inputValue: 4 },
				]
			}]
		};

		// สมุดรายวัน
		var box2 = {
			title: "สมุดรายวัน",
			defaults: { allowBlank: false, anchor: "100%" },
			items: [{
				xtype: "displayfield",
				name: "c_code",
				fieldLabel: "เลขที่สมุดรายวัน"
			}, {
				xtype: "displayfield",
				name: "c_code_post",
				fieldLabel: "เลขที่สมุดรายวัน<br>(หลังผ่านรายการ)"
			}, {
				xtype: "datefield",
				id: "d_save_date",
				name: "d_save_date",
				fieldLabel: "วันที่บันทึกบัญชี",
				listeners : {
					render : function(datefield) {
						datefield.setValue(new Date());
					}
				}
			},
			new Ext.form.ComboBox({
				fieldLabel: "ประเภทสมุดบัญชี",
				id: "gl_dc_book_type_id",
				name: "gl_dc_book_type_id",
				store: Ext.vw_gl_dc_book_type,
				valueField: "id",
				displayField: "c_name",
				typeAhead: true,
				mode: "local",
				triggerAction: "all",
				emptyText: "กรุณาเลือก...",
				forceSelection: true,
				selectOnFocus: true
			}),
			{
				xtype: "textfield",
				id: "c_comment1",
				name: "c_comment1",
				fieldLabel: "คำอธิบายเพิ่มเติม" 
			}, {
				xtype: "textfield",
				id: "c_comment2",
				name: "c_comment2",
				fieldLabel: "",
				allowBlank: true
			}, {
				xtype: "textfield",
				id: "c_comment3",
				name: "c_comment3",
				fieldLabel: "",
				allowBlank: true
			}]
		};
		
		var boxDetail = new Ext.TabPanel({
	        autoHeight: true,
	        activeTab: 0,
	        defaults: { autoScroll:true },
	        items: [new Ext.ux.grid.livegrid.GridPanel({
	    		title: "รายละเอียดสมุดรายวัน",
	        	height: 310,
	        	stripeRows: true,
	        	loadMask: true,
	        	store: store_tran_dtl,
	    		viewConfig : {
	    			emptyText: "ไม่มีข้อมูล..",
	    			deferEmptyText: false
	    		},
	    		view: myView,
	    		selModel: new Ext.ux.grid.livegrid.RowSelectionModel(),
	            columns: [
	            	{ header: "ที่", dataIndex: "i_rank", width: 40, sortable: true, align: "center" },
					{ id: "dc_acc_name", header: "ผังบัญชี", dataIndex: "dc_acc_name", width: 250, sortable: true },
					{ header: "ศูนย์ต้นทุนทางบัญชี", dataIndex: "dc_cost_acc_name", width: 250, sortable: true,
	    				  renderer: function(value, metaData, record, rowIndex, colIndex, store) {
	    					  if(record.data.total_type) {
	    						  metaData.attr = "style= \"text-align:right\";";
	    						  return "<b>รวม</b>";
	    					  } else { return value; }
	    				  }
					},
					{ header: "เดบิต", dataIndex: "f_dr", sortable: true,
						renderer: function(value, metaData, record, rowIndex, colIndex, store) {
							metaData.attr = "style= \"text-align:right\";";
							if(record.data.total_type) {
								return "<b>"+floatRenderer(value)+"</b>";
							} else {
								return floatRenderer(value);
							}
						}
					},
					{ header: "เครดิต", dataIndex: "f_cr", sortable: true,
						renderer: function(value, metaData, record, rowIndex, colIndex, store) {
							metaData.attr = "style= \"text-align:right\";";
							if(record.data.total_type) {
								return "<b>"+floatRenderer(value)+"</b>";
							} else {
								return floatRenderer(value);
							}
						}
					},
					{ header: "รายการรายได้", dataIndex: "dc_product_name", width: 150, sortable: true }
	    		],
	            autoExpandColumn: "dc_acc_name"
	        })]
	    });
		
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
				labelWidth: 100,
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
						defaults: { labelStyle : "width:100px;", allowBlank: true },
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
							xtype: "container",
							layout: "hbox",
							align: "stretch",
							defaults: { xtype: "fieldset", flex:1, margins : "0px 3px", autoHeight: true },
							items: [ box1 , box2 ]
						}]
					}]
				}, boxDetail ],
				buttonAlign: "center",
				buttons: [{
					text: Ext.GLOBAL_BU_PRINT_TH,
					iconCls: "icon-magnifier",
					handler: function(grid, rowIndex, colIndex) {
						Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
						$.ajax({
							url: "api/List_GlTranhdr.php",
							type: "POST",
							data: {
								type: "print_hdr",
								id: Ext.getCmp("id").getValue()
							},
							success: function(result) {
								Ext.getCmp("contenterCenter").getEl().unmask();
								var obj = $.parseJSON( result );
								
								if(obj.debug == true) {
									if(obj.i_preview == 1) {
										Preview(Ext.getCmp("id").getValue());
									} else {
										Ext.MessageBox.alert("แจ้งเตือน", "กรุณาบันทึกรายการก่อน");
									}
								}
							}
						});
					}
				}, {
					text: "&nbsp;บันทึกข้อมูลชั่วคราว&nbsp;",
					id: "icon-save",
					iconCls: "icon-save",
					handler: function(grid, rowIndex, colIndex) {
						
						var msg		= "";
						
						if( Ext.getCmp("role-form-mode").getValue() == "ADD" ) {
							i_close_year_type	= Ext.getCmp("i_close_year_type").getValue().inputValue;
						} else {
							i_close_year_type	= "";
						}
						
						if(Ext.getCmp("c_ref_doc").getValue() == "") { msg	+= "- กรุณากรอก เลขที่เอกสาร<br>"; }
						if(Ext.getCmp("d_doc_date").getValue() == "") { msg	+= "- กรุณากรอก วันที่เอกสาร<br>"; }
						if(Ext.getCmp("d_save_date").getValue() == "") { msg	+= "- กรุณากรอก วันที่บันทึกบัญชี<br>"; }
						if(Ext.getCmp("gl_dc_book_type_id").getValue() == "") { msg	+= "- กรุณาเลือก ประเภทสมุดบัญชี<br>"; }
						if(Ext.getCmp("c_comment1").getValue() == "" && Ext.getCmp("c_comment2").getValue() == "" && Ext.getCmp("c_comment3").getValue() == "") {
							msg	+= "- กรุณาเลือก คำอธิบายเพิ่มเติม<br>";
						}
						
						if (msg == "") {
							
							Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
							Ext.Ajax.request({
								url: "api/mn_GlCloseYear.php",
								method: "POST",
								params: {
									mode: Ext.getCmp("role-form-mode").getValue(),
									id: Ext.getCmp("id").getValue(),
									c_ref_doc: Ext.getCmp("c_ref_doc").getValue(),
									d_doc_date: Ext.util.Format.date(Ext.getCmp("d_doc_date").getValue(), "Y-m-d"),
									i_close_year_type: i_close_year_type,
									d_save_date: Ext.util.Format.date(Ext.getCmp("d_save_date").getValue(), "Y-m-d"),
									c_yyyy: Ext.util.Format.date(Ext.getCmp("d_save_date").getValue(), "Y"),
									c_mm: Ext.util.Format.date(Ext.getCmp("d_save_date").getValue(), "m"),
									gl_dc_book_type_id: Ext.getCmp("gl_dc_book_type_id").getValue(),
									c_comment1: Ext.getCmp("c_comment1").getValue(),
									c_comment2: Ext.getCmp("c_comment2").getValue(),
									c_comment3: Ext.getCmp("c_comment3").getValue()
								},
								success: function ( result, request ) {
									Ext.getCmp("contenterCenter").getEl().unmask();
									var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
									if (jsonData.success == true) {
											Ext.store.load();
											Ext.Msg.alert("แจ้งเตือน", "บันทึกเรียบร้อย");
											Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-Add'), true) || {};
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
		
		if (columnIndex == grid.getColumnModel().getIndexById("print")) {
			controllTab(record, "print");
		} else if (columnIndex == grid.getColumnModel().getIndexById("view")) {
			controllTab(record, "view");
		} else if (columnIndex == grid.getColumnModel().getIndexById("edit")) {
			controllTab(record, "edit");
		} else if (columnIndex == grid.getColumnModel().getIndexById("post")) {
			controllTab(record, "post");
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
						       [ 'c_ref_doc', "เลขที่เอกสาร" ],
						       [ 'c_code', "GX" ]
						]
					}),
					value: "c_ref_doc",
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
            }, { // แถวที่ 2
            	xtype: "buttongroup",
            	frame: false,
            	items: [{ xtype: "label", text: "วันที่บันทึกบัญชี : " }, { xtype: "tbspacer", width: 4 }, {
            		id: "s_save_date1", xtype: "datefield", width: 159, 
    				listeners : {
						afterrender : function() {
							var date = new Date();
								date = new Date(date.getFullYear()+543, date.getMonth()-2, 1);
							this.setValue(date);
						}
					}
            	}, { xtype: "tbspacer", width: 5 }, { xtype: "label", text: "ถึงวันที่ : " }, { xtype: "tbspacer", width: 4 }, {
            		id: "s_save_date2", xtype: "datefield", width: 159, 
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
				id: "buAdd",
				hidden: (process == "edit")? false : true,
				iconCls: "icon-add",
				handler: function(grid, rowIndex, colIndex) { controllTab({}, 'add'); }
			}, { xtype: "tbfill" }, {
				text : "ค้นหา",
				iconCls: "icon-magnifier",
    			handler : function() {
    				
    				var msg	= "";
    				
    				if( Ext.getCmp("s_save_date1").getValue() == "" || Ext.getCmp("s_save_date2").getValue() == "" ) {
    					msg	+= "- กรุณากรอก วันที่บันทึกบัญชี<br>";
    				}
    				
    				if(msg == "") {
						if(Ext.getCmp("value-box").getValue() != "") {
							Ext.store.setBaseParam("value", Ext.getCmp("value-box").getValue());
							Ext.store.setBaseParam("filter", Ext.getCmp("filter").getValue());
						} else {
							Ext.store.setBaseParam("value", "");
							Ext.store.setBaseParam("filter", "");
						}
						
						Ext.store.setBaseParam("mode", "SEARCH");
						Ext.store.setBaseParam("s_save_date1", Ext.util.Format.date(Ext.getCmp("s_save_date1").getValue(), "Y-m-d"));
						Ext.store.setBaseParam("s_save_date2", Ext.util.Format.date(Ext.getCmp("s_save_date2").getValue(), "Y-m-d"));
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
			{ header: "เลขที่เอกสาร", sortable: true, align: "center", dataIndex: "c_ref_doc" },
			{
		    	header: "วันที่บันทึกบัญชี", sortable: true, dataIndex: "d_save_date",
		    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
		    		metaData.attr = "style= \"text-align:center;\";";
		    		return DategetShortDateMonthName(value);
		    	}
		    },
			{ header: "GX", sortable: false, align: "center",
				renderer: function(value, metaData, record, row, col, store, gridView){
					var i_is_post = record.get("i_is_post");
					if( i_is_post == 2 || i_is_post == 3 ) {
						return record.get("c_code");
					} else {
					   return ""; 
					}
				}
			},
			{ header: "GL", sortable: false, align: "center",
				renderer: function(value, metaData, record, row, col, store, gridView){
					var i_is_post = record.get("i_is_post");
					if( i_is_post == 3 ) {
						return record.get("c_code_post");
					} else {
					   return ""; 
					}
				}
			},
			{ id: "c_comment1", header: "คำอธิบาย",align: "left", sortable: true, dataIndex: "c_comment1" },
			{ header: "จำนวนเงิน", dataIndex: "f_total_amt", sortable: true,
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					metaData.attr = "style= \"text-align:right\";";
					return floatRenderer(value);
				}
			},
			{ header: "สถานะ", sortable: false, align: "center",
				renderer: function(value, metaData, record, row, col, store, gridView){
					var i_enable = record.get("i_enable");
					if( i_enable == 1 ) {
						return "<img src='../images/icons/yes.gif' />";
					} else {
					   return "<img src='../images/icons/no.gif' />"; 
					}
				}
			},
			{ header: "สถานะผ่านรายการ", sortable: false, align: "center",
				renderer: function(value, metaData, record, row, col, store, gridView) {
					var i_is_post = record.get("i_is_post");
					if( i_is_post == 3 ) { return "ผ่านรายการ"; }
					else if( i_is_post == 2 ) { return "ยังไม่ผ่านรายการ"; }
					else { return "รายการรอลงบัญชี"; }
				}
			},
			{ id: "print", header: "พิมพ์", sortable:false, align: "center", width: 100, dataIndex: "id",
				renderer: function(value, metaData, record, row, col, store, gridView) {
					return "<img src=\"../images/icons/printer_mono.png\"); style=\"cursor:pointer\"/>";
				}
			},
			{ id: "view", header: "แสดง", sortable:false, align: "center", width: 100, dataIndex: "id",
				renderer: function(value, metaData, record, row, col, store, gridView) {
					return "<img src=\"../images/icons/application_osx_go.png\"); style=\"cursor:pointer\"/>";
				}
			},
			{ id: process, header: text_edit, sortable: true, align: "center", dataIndex: "id",
				renderer: function(value, metaData, record, row, col, store, gridView) {
					
					var i_enable = record.get("i_enable");
					var type1_gx = record.get("row_1_gx");
					var type2_gx = record.get("row_2_gx");
					var type3_gx = record.get("row_3_gx");
					var type4_gx = record.get("row_4_gx");
					
					var type1_gl = record.get("row_1_gl");
					var type2_gl = record.get("row_2_gl");
					var type3_gl = record.get("row_3_gl");
					var type4_gl = record.get("row_4_gl");
					
					if ( i_enable == 1 ) {						
						if( process == "edit" ) {
							return "<img src='../images/icons/document_edit.gif'); style='cursor:pointer'/> "+text_edit;
						} else if ( process == "post" ) {
							if(record.get("i_is_post") != 3) {
								if( ((type1_gx==1) && (type1_gl==0))
									|| ((type2_gx==1) && (type2_gl==0) && (type1_gl==1))
									|| ((type3_gx==1) && (type3_gl==0) && (type1_gl==1) && (type2_gl==1))
									|| ((type4_gx==1) && (type4_gl==0) && (type3_gl==1) && (type2_gl==1) && (type1_gl==1)) 
								) {
									return "<img src='../images/icons/save.png'); style='cursor:pointer'/> "+text_edit;									
								}
							}
						}	
					}
				}
			},
			{ id: "remove", header: "ลบ", sortable: true, align: "center", dataIndex: "id",
				renderer: function(value, metaData, record, row, col, store, gridView) {
					if( record.get("i_enable") == 1 ) {
						return "<img src=\"../images/icons/document_delete.gif\"); style=\"cursor:pointer\"/> ลบ";
					}
				}
			}
		],
		autoExpandColumn: "c_comment1",
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
