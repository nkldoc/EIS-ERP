Ext.onReady(function() {
	Ext.QuickTips.init();

	/*===============================================*/
	var title_panel		= "จัดทำใบสำคัญจ่าย";
	/*===============================================*/
	
	store = new Ext.data.JsonStore({
		id: "store",
	    autoDestroy: true,
		autoLoad: false,
//		chkMask: false, // status: loading
	    url: "api/List_Cm00006.php",
	    baseParams: { type: "cm_voucher_one", i_read: user_right_read }, //Permission i_read
	    root: "data",
	    idProperty: "id",
		totalProperty: "totalCount",
		fields: [
			{ name : "no" },
			{ name : "id" },
			{ name : "ap_expen_hdr_id" },
			{ name : "i_is_cancel_pre" },
			{ name : "c_code" },
			{ name : "c_code_ap" },
			{ name : "c_code_pv" },
			{ name : "i_is_status" },
			{ name : "s_is_status" },
			{ name : "fi_pymt_voucher_name" },
			{ name : "c_receiver_name" },
			{ name : "d_doc_date" },
			{ name : "f_net_cost" },
			{ name : "c_comment" },
			{ name : "i_enable" },
			{ name : "show_enable" },
			{ name : "dc_user_create_id" },
			{ name : "dc_user_create_cost_id" },
			{ name : "d_create" },
			{ name : "dc_user_update_id" },
			{ name : "dc_user_update_cost_id" },
			{ name : "d_update" }
		],
//		listeners: {
//			beforeload: function(t, records, options) { this.chkMask = false; initData(); },
//			datachanged: function(t, records, options) { this.chkMask = true; initData(); },
//		}
	});
	
	store_ap = new Ext.data.JsonStore({
	    autoDestroy: false,
		autoLoad: false,
		chkMask: false, // status: loading
		url : "api/List_Cm00006.php",
		baseParams: { type: "store_ap" },
	    root: "data",
	    idProperty: "id",
	    totalProperty: "totalCount",
		fields: [
			{ name : "no" },
			{ name : "id" },
			{ name : "c_code" },
			{ name : "creditor_type_name" },
			{ name : "c_receiver_name" },
			{ name : "c_name" },
			{ name : "dc_cost_name" },
			{ name : "f_total_amount" },
			{ name : "f_dec_amount" },
			{ name : "f_vat_amount" },
			{ name : "f_vat_doc" },
			{ name : "f_wht_amount" },
			{ name : "f_penalty" },
			{ name : "f_net_penalty" },
			{ name : "f_barter_amt" },
			{ name : "f_barter_dec" },
			{ name : "f_net_amount" }
		],
//		listeners: {
//			beforeload: function(t, records, options) { this.chkMask = false; initData(); },
//			datachanged: function(t, records, options) { this.chkMask = true; initData(); },
//		}
	});
	
	store_show_ap = new Ext.data.JsonStore({
	    autoDestroy: true,
		autoLoad: false,
//		chkMask: false, // status: loading
		url : "api/List_Cm00006.php",
		baseParams: { type: "ap_expen_hdr" },
	    root: "data",
	    idProperty: "id",
		totalProperty: "totalCount",
		fields: [
			{ name : "no" },
			{ name : "id" },
			{ name : "c_code" },
			{ name : "creditor_type_name" },
			{ name : "c_receiver_name" },
			{ name : "c_name" },
			{ name : "dc_cost_name" },
			{ name : "f_total_amount" },
			{ name : "f_dec_amount" },
			{ name : "f_vat_amount" },
			{ name : "f_vat_doc" },
			{ name : "f_wht_amount" },
			{ name : "f_penalty" },
			{ name : "f_net_penalty" },
			{ name : "f_barter_amt" },
			{ name : "f_barter_dec" },
			{ name : "f_net_amount" }
		],
//		listeners: {
//			beforeload: function(t, records, options) { this.chkMask = false; initData(); },
//			datachanged: function(t, records, options) { this.chkMask = true; initData(); },
//		}
	});
	
	// pagingBar
	pagingBar = new Ext.PagingToolbar({
		pageSize: 20,
		store: store,
		displayInfo: true,
		displayMsg: "Displaying topics {0} - {1} of {2}"
	});

	function controllTab(record,butt) {
		
		Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; //null obj not errer
		
		var frmAdd	= new formAdd();
		
		if( butt == "add" ) {
			
			Ext.getCmp("contenterCenter").add(frmAdd);
			Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
			Ext.getCmp("role-form-mode").setValue("ADD");
			
		} else if( butt == "edit" || butt == "view" ) {
			
	        Ext.getCmp("contenterCenter").add(frmAdd); 
	        Ext.getCmp("contenterCenter").setActiveTab(frmAdd);  
	        Ext.getCmp("role-form-mode").setValue("EDIT");
	        Ext.getCmp("form-widgets").getForm().loadRecord(record);
	        
	        Ext_Show( record.data.id, record.data.ap_expen_hdr_id );

//	        if( butt == "view" ) { DisbledButton(true); }
//	        else { DisbledButton(false); }
	        
	    } else if( butt == "delete" ) {
	    	
	    	if( record.data.c_code_pv == "" && record.data.i_enable == 1 ) {
				new Ext.Window({
					id: "win-msg-delete",
					title: "Remove",
					modal: true,
					width: 250,
					height: 130,
					html: "ท่านต้องการที่จะลบข้อมูล ?",
					buttons: [{
						text: "Confirm",
						handler: function() {
							Ext.getCmp("win-msg-delete").getEl().mask("Please wait...", "x-mask-loading");
							Ext.Ajax.request({
								url: "api/mn_Cm00006.php",
								method: "POST",
								params: {
									mode: "DELETE",
									cm_voucher_one_id: record.get("id")
								},
								success: function ( result, request ) {
									Ext.getCmp("win-msg-delete").getEl().unmask();
									var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
									if (jsonData.success == true) {
										//Ext.MessageBox.alert("Success", jsonData.msg);		// alert massage success
										Ext.getCmp("win-msg-delete").destroy();						// clear memory :: garbage collection
										store.reload();
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
						text : Ext.GLOBAL_BU_BACK_TH,
						handler : function() { Ext.getCmp("win-msg-delete").destroy(); }
					}]
				}).show();
			}
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
							fieldLabel: "เลขที่จัดทำใบสำคัญจ่าย",
							xtype: "displayfield",
							name: "c_code"
						}, {
							xtype: "datefield",
							fieldLabel: "วันที่ทำใบสำคัญจ่าย",
							id: "d_doc_date",
							name: "d_doc_date",
							value: addY(543),
							width: 200
						}, {
							xtype: "textarea",
							fieldLabel: "หมายเหตุ",
							id: "c_comment",
							name: "c_comment",
							width: 300
						}]
					}]
				}],
				buttonAlign: "left",
				buttons: [{
					text : "&nbsp;"+Ext.GLOBAL_BU_SAVE_TH+"&nbsp;",
					id: "icon-save",
					iconCls	: "icon-save",
					handler : function() {
						
						var msg		= "";
						
						if(Ext.getCmp("d_doc_date").getValue() == "") { msg	+= "- กรุณากรอก วันที่ทำใบสำคัญจ่าย<br>"; }
						
						if (msg == "") {
							Ext.getCmp("frm-Add").getEl().mask("Please wait...", "x-mask-loading");
							Ext.Ajax.request({
								url: "api/mn_Cm00006.php",
								method: "POST",
								params: {
									mode: Ext.getCmp("role-form-mode").getValue(),
									id: Ext.getCmp("id").getValue(),
									d_doc_date: Ext.util.Format.date(Ext.getCmp("d_doc_date").getValue(), "Y-m-d"),
									c_comment: Ext.getCmp("c_comment").getValue()
								},
								success: function ( result, request ) {
									Ext.getCmp("frm-Add").getEl().unmask();
									var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
									if ( jsonData.success == true ) {
						
										Ext.Msg.alert("Success", "บันทึกเรียบร้อย");
										Ext.getCmp("role-form-mode").setValue("EDIT");
										store.load();
										Ext_Show( jsonData.cm_voucher_one_id, jsonData.ap_expen_hdr_id );
						
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
						Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
					}
				}]
			}, { html: "<div id='Ext_Show'></div>", border: false }]
		});
	}; // formAdd
	Ext.extend(formAdd, Ext.Panel, {}); 
	
	//================================ gridMain ================================//
	
	// cellClick
	cellClick	= function( grid, rowIndex, columnIndex, e ) {
		
		var record = grid.getStore().getAt(rowIndex);
		
		if (columnIndex == grid.getColumnModel().getIndexById("edit")) {
			
			if( record.data.c_code_pv == "" && record.data.i_enable == 1 ) {
				controllTab(record, "edit");
			}
		} else if (columnIndex == grid.getColumnModel().getIndexById("delete")) {
			controllTab(record, "delete");
		}
//		else if (columnIndex == grid.getColumnModel().getIndexById("Print")) {
//			if ( (record.data.c_code!='') && (record.data.i_enable==1) )
//			{
//				var href		= "report/Rep_Cm00006.php";
//		    	var resultUrl	= "";
//		    	
//		    	resultUrl	+= "&ap_expen_hdr_id="+record.data.id;
//		    	resultUrl	= (resultUrl != "")? "?"+resultUrl.substring(1) : "";
//		    	
//				window.open(href+resultUrl, "_Self");
//		      	window.focus();
//  		}
//		}
		
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
		            width: 130,
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
            		width: 150,
           			fieldLabel: "fieldLabel",
           			emptyText: "คำที่ต้องการค้นหา"
           		}]
            }, { // แถวที่ 2
            	xtype: "buttongroup",
            	frame: false,
            	items: [{ xtype: "label", text: "ระหว่างวันที่ : " }, { xtype: "tbspacer", width: 4 }, {
            		id: "s_doc_date1", xtype: "datefield", width: 119, 
    				listeners : {
						afterrender : function() {
							var date = new Date();
								date = new Date(date.getFullYear()+543, date.getMonth()-2, 1);
							this.setValue(date);
						}
					}
            	}, { xtype: "tbspacer", width: 5 }, { xtype: "label", text: "ถึงวันที่ : " }, { xtype: "tbspacer", width: 4 }, {
            		id: "s_doc_date2", xtype: "datefield", width: 119, 
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
				handler: function(grid, rowIndex, colIndex) { controllTab({}, "add"); }
			}, { xtype: "tbfill" }, {
				text : "ค้นหา",
				iconCls: "icon-magnifier",
    			handler : function() {
    				
    				var msg	= "";
    				
    				if(Ext.getCmp("s_doc_date1").getValue() == "" || Ext.getCmp("s_doc_date2").getValue() == "") {
    					msg	+= "กรุณากรอก วันที่<br>";
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
			{ id: "edit", header: "-", sortable: true, align: "center", width: 100, dataIndex: "id",
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					if( record.data.c_code_pv == "" && record.data.i_enable == 1 ) {
						return "<button style=\"font-size:11px; cursor:pointer;\">ระบุการจ่ายเงิน</button>&nbsp;";
					} else {
						return "<font color=\"red\">ออกเลข PV แล้ว</font>";
					}
				}
			},
			{ id:"Print",header: "-", sortable: true, align: "center", width: 110, dataIndex: "id",
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					
					if( record.data.i_is_cancel_pre == 1 ) { //สถานะยกเลิกใบสำคัญจ่ายเงิน (1=ยกเลิก PRE)
						return "<button style=\"font-size:11px; cursor:pointer;\">ยกเลิกโดย....</button>&nbsp;";
					} else {
						return "<button style=\"font-size:11px; cursor:pointer;\">พิมพ์ใบสำคัญจ่าย</button>&nbsp;";
					} 
				}
			},
			{ id: "delete", header: "ลบ", sortable: false, align: "center", width:50, dataIndex: "id",
				renderer: function(value, metaData, record, row, col, store, gridView) {
					if( record.data.c_code_pv == "" && record.data.i_enable == 1 ) {
						return "<img src=\"../images/icons/document_delete.gif\"); style=\"cursor:pointer\"/>";
					} else {
						return "";
					}
				}
			},
			{ header: "เลขที่จัดทำใบสำคัญจ่าย", sortable: true, align: "center", dataIndex: "c_code" },
			{ header: "เลขที่เอกสารใบเบิก", sortable: true, align: "center", dataIndex: "c_code_ap" },
			{ header: "สถานะใบเบิก", sortable: true, align: "center", dataIndex: "s_is_status" },
			{ header: "ประเภทการจ่ายเงิน", sortable: true, align: "center", dataIndex: "fi_pymt_voucher_name" },
			{ id: "c_receiver_name", header: "ชื่อผู้รับเงิน", sortable: true, dataIndex: "c_receiver_name" },
			{ header: "วันที่ทำใบสำคัญจ่าย", sortable: true, align: "center", dataIndex: "d_doc_date",
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					return (value != "")? shortThaiDate(value) : "";
				}
			},
			{ header: "จำนวนเงินรวม", sortable: true, align: "center", dataIndex: "f_net_cost",
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					metaData.attr = "style= \"text-align:right\";";
					return (value > 0)? floatRenderer(floatMinus(value, 2)) : "0.00";
				}
			},
			{ header: "ผู้ทำรายการล่าสุด", sortable: true, dataIndex: "dc_user_update_id" },
			{ header: "วันที่ทำรายการล่าสุด", sortable: true, align: "center", dataIndex: "d_update",
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					return (value != "")? shortThaiDate(value) : "";
				}
			}
		],
		autoExpandColumn: "c_receiver_name",
		bbar: pagingBar
	}); //gridMain
	
	//=================================== รายละเอียดเพิ่มเติม ===================================//
	Ext_Show = function( cm_voucher_one_id, ap_expen_hdr_id ) { 

		$("#Ext_Show").empty();

		// จัดซื้อ/จัดจ้าง/จัดเช่า
		function GRID_AP( voucher_one_id, expen_hdr_id ) {
		
			$("#EXT_GRID_AP").empty();
		
			if( expen_hdr_id > 0 ) {
				
				// จัดซื้อ/จัดจ้าง/จัดเช่า
				new Ext.grid.GridPanel({
					title: "จัดซื้อ/จัดจ้าง/จัดเช่า",
					id: "GRID_AP",
					region: "center",
					layout: "fit",
					height: 130,
					stripeRows: true,
					loadMask: true,
					store: store_show_ap,
					style: { padding: "5px 5px" },
					viewConfig : {
						emptyText: "ไม่มีข้อมูล..",
						deferEmptyText: false
					},
					listeners: {
						afterrender: function() {
							store_show_ap.setBaseParam("cm_voucher_one_id", voucher_one_id);
							store_show_ap.load();
						}
					},
					tbar: [{
						text: "ยกเลิกใบเบิก",
						iconCls: "icon-clear",
						handler: function() {
							
							Ext.getCmp("frm-Add").getEl().mask("Please wait...", "x-mask-loading");
							$.ajax({
								url: "api/mn_Cm00006.php",
								type: "POST",
								data: {
									mode: "DELETE_AP",
									cm_voucher_one_id: voucher_one_id,
									ap_expen_hdr_id: expen_hdr_id
								},
								success: function(result) {
									
    								Ext.getCmp("frm-Add").getEl().unmask();

    								var jsonData = Ext.util.JSON.decode(result);	//decode json
    								if ( jsonData.success == true ) {
    										    	
    									Ext.Msg.alert("แจ้งเตือน", "บันทึกเรียบร้อย");
    									Ext_Show(jsonData.cm_voucher_one_id, jsonData.ap_expen_hdr_id);
    									store.load();
    									store_ap.load();

    								} else { Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg); }
								}
							});
							
						}
					}],
					columns:[
						{ header: "ID System", sortable: true, hidden: true, dataIndex: "id" },
					    new Ext.grid.RowNumberer({header:"ที่", width: 30,
							renderer: function(value, metaData, record, row, col, store, gridView) {
								return record.get("no");
							}
						}),
					    { header: "เลขที่ใบเบิก", sortable: true, align:"center", width: 100, dataIndex: "c_code",
					    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					    		metaData.attr = "style='color:blue;'";
								return "<b>"+value+"</b>";
							}
						},
					    { header: "ชื่อเจ้าหนี้", sortable: true, width: 200, dataIndex: "creditor_type_name" },
					    { header: "ชื่อผู้รับเงิน", sortable: true, width: 200, dataIndex: "c_receiver_name" },
					    { header: "รายละเอียด", sortable: true, dataIndex: "c_name" },
					    { header: "หน่วยงาน", sortable: true, dataIndex: "dc_cost_name" },
					    { header: "จำนวนเงิน", sortable: true, align:"center", dataIndex: "f_total_amount",
					    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					    		metaData.attr = "style= \"text-align:right;\"";
					    		return floatRenderer(floatMinus(value, 2));
					    	}
					    },
					    { header: "ส่วนลดเงินสด", sortable: true, align:"center", dataIndex: "f_dec_amount",
					    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					    		metaData.attr = "style= \"text-align:right;\"";
					    		return floatRenderer(floatMinus(value, 2));
					    	}
					    },
					    { header: "ภาษีมูลค่าเพิ่ม(คำนวณ)", sortable: true, align:"center", dataIndex: "f_vat_amount",
					    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					    		metaData.attr = "style= \"text-align:right;\"";
					    		return floatRenderer(floatMinus(value, 2));
					    	}
					    },
					    { header: "ภาษีมูลค่าเพิ่ม(เอกสาร)", sortable: true, align:"center", dataIndex: "f_vat_doc",
					    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					    		metaData.attr = "style= \"text-align:right;\"";
					    		return floatRenderer(floatMinus(value, 2));
					    	}
					    },
					    { header: "ภาษีหัก ณ ที่จ่าย", sortable: true, align:"center", dataIndex: "f_wht_amount",
					    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					    		metaData.attr = "style= \"text-align:right;\"";
					    		return floatRenderer(floatMinus(value, 2));
					    	}
					    },
					    { header: "ค่าปรับเบิกล่าช้า", sortable: true, align:"center", dataIndex: "f_penalty",
					    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					    		metaData.attr = "style= \"text-align:right;\"";
					    		return floatRenderer(floatMinus(value, 2));
					    	}
					    },
					    { header: "จำนวนเงินรวม", sortable: true, align:"center", dataIndex: "f_net_penalty",
					    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					    		metaData.attr = "style= \"text-align:right;\"";
					    		return floatRenderer(floatMinus(value, 2));
					    	}
					    },
					    { header: "เงินที่ใช้แลกเปลี่ยน", sortable: true, align:"center", dataIndex: "f_barter_amt",
					    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					    		metaData.attr = "style= \"text-align:right;\"";
					    		return floatRenderer(floatMinus(value, 2));
					    	}
					    },
					    { header: "ส่วนลดเงินสดของแลกเปลี่ยน", sortable: true, align:"center", dataIndex: "f_barter_dec",
					    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					    		metaData.attr = "style= \"text-align:right;\"";
					    		return floatRenderer(floatMinus(value, 2));
					    	}
					    },
					    { header: "คงเหลือเบิกจ่าย", sortable: true, align:"center", dataIndex: "f_net_amount",
					    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					    		metaData.attr = "style= \"text-align:right;\"";
					    		return floatRenderer(floatMinus(value, 2));
					    	}
					    }
				    ],
					renderTo: "EXT_GRID_AP"
				}); // GRID_AP
					
			} else {
	
				Ext.getCmp("frm-Add").getEl().mask("Please wait...", "x-mask-loading");
				// Check Load Store
				function chkData() {
					// loadmask
					var myComboStores	= [ store_ap ];
					var loaded			= true;
					Ext.each( myComboStores , function( stores ) { if(stores.chkMask == false) { loaded = false; } });
				
					if( loaded == true ) { Ext.getCmp("frm-Add").getEl().unmask(); }
				}
				store_ap.load({	callback: function(records, operation, success) { if ( success == true ){ this.chkMask = true; chkData(); } } });
				
				new Ext.Panel ({
					style: { padding: "1px 0px" },
					border: false,
					buttonAlign: "center",
					buttons: [{
						text: "<span style=\"color: green; font-size: 16px;\">เพิ่มรายการใหม่</span>",
						scale: "medium",
						iconCls	: "icon-add",
						handler : function() {
							
							// cellClick_ap
							cellClick_ap	= function( grid, rowIndex, columnIndex, e ) {
								
								var record = grid.getStore().getAt(rowIndex);
								
								if ( columnIndex == grid.getColumnModel().getIndexById("Print") ) {
//								
//									//var href		= "../ap/report/Rep_CreditorPrint.php";
//									var href		= "../report/Rep_Cm00006.php";
//							    	var resultUrl	= "";
//							    	
//							    	resultUrl	+= "&ap_expen_hdr_id="+record.data.id;
//							    	resultUrl	= (resultUrl != "")? "?"+resultUrl.substring(1) : "";
//							    	
//									window.open(href+resultUrl, "_Self");
//							      	window.focus();
//									
								} else if ( columnIndex == grid.getColumnModel().getIndexById("Save") ) {
									
									Ext.getCmp("win-pop-ap").getEl().mask("Please wait...", "x-mask-loading");
									$.ajax({
										url: "api/mn_Cm00006.php",
										type: "POST",
										data: {
											mode: "SAVE_AP",
											cm_voucher_one_id: cm_voucher_one_id,
											ap_expen_hdr_id: record.get("id")
										},
										success: function(result) {
											
		    								Ext.getCmp("win-pop-ap").getEl().unmask();
	
		    								var jsonData = Ext.util.JSON.decode(result);	//decode json
		    								if ( jsonData.success == true ) {
		    										    	
		    									Ext.Msg.alert("แจ้งเตือน", "บันทึกเรียบร้อย");
		    									Ext.getCmp("win-pop-ap").destroy();
		    									Ext_Show(jsonData.cm_voucher_one_id, jsonData.ap_expen_hdr_id);
		    									store.load();
		    									store_ap.load();
	
		    								} else { Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg); }
										}
									});
									
								}
							}; //cellClick_ap
							
							new Ext.Window({
								id: "win-pop-ap",
								title: "เลือกข้อมูล",
								modal: true,
								border: false,
								layout: "fit",
								items:[{
									xtype: "grid",
									id: "win-pop-lov-ap",
									height: (Ext.getBody().getViewSize().height * 0.9),
									width: (Ext.getBody().getViewSize().width * 0.9),
									border: false,
									stripeRows: true,
									loadMask: true,
									store: store_ap,
									viewConfig : {
										emptyText: "ไม่มีข้อมูล..",
										deferEmptyText: false
									},
									tbar: [{
										id: "pop-filter",
										xtype: "combo",
										width: 110,
										mode: "local",
										store: new Ext.data.SimpleStore({
											fields: [ "id", "c_name" ],
											data: [
											       [ "c_code", "เลขที่ใบเบิก" ]
											      ]
										}),
										value: "c_code",
										valueField: "id",
										displayField: "c_name",
										triggerAction: "all",
										forceSelection: true,
										selectOnFocus: true,
										typeAhead : false,
										emptyText: "กรุณาเลือก...",
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
											blur: function() { this.getStore().clearFilter(); }
										}
									}, {
										id: "pop-value",
										xtype: "textfield",
										width: 130,
										emptyText : "คำที่ต้องการค้นหา",
									}, "-", {
										text: "ค้นหา",
										iconCls: "icon-magnifier",
										handler: function() {
											if (Ext.getCmp("pop-value").getValue() != "") {
												store_ap.setBaseParam("filter", Ext.getCmp("pop-filter").getValue());
												store_ap.setBaseParam("value", Ext.getCmp("pop-value").getValue());
											} else {
												store_ap.setBaseParam("filter", "");
												store_ap.setBaseParam("value", "");
											}
											
											store_ap.setBaseParam("mode", "SEARCH");
											store_ap.load();
										}
									}],
									columns:[
									    { header: "ID System", sortable: true, hidden: true, dataIndex: "id" },
									    new Ext.grid.RowNumberer({header:"ที่", width: 30,
											renderer: function(value, metaData, record, row, col, store, gridView) {
												return record.get("no");
											}
										}),
										{ id: "Save", header: "-", sortable: true, align: "center", width: 100, dataIndex: "id",
											renderer: function(value, metaData, record, rowIndex, colIndex, store) {
												return "<button style='font-size:11px; cursor:pointer;'>บันทึกใบเบิก</button>&nbsp;";
											}
										},
										{ id: "Print", header: "-", sortable: true, align:"center", width: 40, dataIndex: "id",
									    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
									    		return "<img title='พิมพ์' style='cursor:pointer;' src='../images/icons/printer_mono.png');/>";
											}
										},
									    { header: "เลขที่ใบเบิก", sortable: true, align:"center", width: 100, dataIndex: "c_code",
									    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
									    		metaData.attr = "style='color:blue;'";
												return "<b>"+value+"</b>";
											}
										},
									    { header: "ชื่อเจ้าหนี้", sortable: true, width: 200, dataIndex: "creditor_type_name" },
									    { header: "ชื่อผู้รับเงิน", sortable: true, width: 200, dataIndex: "c_receiver_name" },
									    { header: "รายละเอียด", sortable: true, dataIndex: "c_name" },
									    { header: "หน่วยงาน", sortable: true, dataIndex: "dc_cost_name" },
									    { header: "จำนวนเงิน", sortable: true, align:"center", dataIndex: "f_total_amount",
									    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
									    		metaData.attr = "style= \"text-align:right;\"";
									    		return floatRenderer(floatMinus(value, 2));
									    	}
									    },
									    { header: "ส่วนลดเงินสด", sortable: true, align:"center", dataIndex: "f_dec_amount",
									    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
									    		metaData.attr = "style= \"text-align:right;\"";
									    		return floatRenderer(floatMinus(value, 2));
									    	}
									    },
									    { header: "ภาษีมูลค่าเพิ่ม(คำนวณ)", sortable: true, align:"center", dataIndex: "f_vat_amount",
									    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
									    		metaData.attr = "style= \"text-align:right;\"";
									    		return floatRenderer(floatMinus(value, 2));
									    	}
									    },
									    { header: "ภาษีมูลค่าเพิ่ม(เอกสาร)", sortable: true, align:"center", dataIndex: "f_vat_doc",
									    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
									    		metaData.attr = "style= \"text-align:right;\"";
									    		return floatRenderer(floatMinus(value, 2));
									    	}
									    },
									    { header: "ภาษีหัก ณ ที่จ่าย", sortable: true, align:"center", dataIndex: "f_wht_amount",
									    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
									    		metaData.attr = "style= \"text-align:right;\"";
									    		return floatRenderer(floatMinus(value, 2));
									    	}
									    },
									    { header: "ค่าปรับเบิกล่าช้า", sortable: true, align:"center", dataIndex: "f_penalty",
									    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
									    		metaData.attr = "style= \"text-align:right;\"";
									    		return floatRenderer(floatMinus(value, 2));
									    	}
									    },
									    { header: "จำนวนเงินรวม", sortable: true, align:"center", dataIndex: "f_net_penalty",
									    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
									    		metaData.attr = "style= \"text-align:right;\"";
									    		return floatRenderer(floatMinus(value, 2));
									    	}
									    },
									    { header: "เงินที่ใช้แลกเปลี่ยน", sortable: true, align:"center", dataIndex: "f_barter_amt",
									    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
									    		metaData.attr = "style= \"text-align:right;\"";
									    		return floatRenderer(floatMinus(value, 2));
									    	}
									    },
									    { header: "ส่วนลดเงินสดของแลกเปลี่ยน", sortable: true, align:"center", dataIndex: "f_barter_dec",
									    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
									    		metaData.attr = "style= \"text-align:right;\"";
									    		return floatRenderer(floatMinus(value, 2));
									    	}
									    },
									    { header: "คงเหลือเบิกจ่าย", sortable: true, align:"center", dataIndex: "f_net_amount",
									    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
									    		metaData.attr = "style= \"text-align:right;\"";
									    		return floatRenderer(floatMinus(value, 2));
									    	}
									    }										
								    ],
								    bbar: new Ext.PagingToolbar({
								    	pageSize: 20,
								    	store: store_ap,
								    	displayInfo: true,
								    	displayMsg: "Displaying topics {0} - {1} of {2}"
								    })
								}]
							}).show();
							
							Ext.getCmp("win-pop-lov-ap").on("cellclick", cellClick_ap, this);
							
						}
					}]
					,renderTo: "EXT_GRID_AP"
				});
					
			}
		};
		
		// คำนวณยอดเงินทั้งหมด
		function GRID_TOTAL() {
			
			$("#EXT_GRID_TOTAL").empty();
			
			new Ext.Panel ({
				title: "คำนวณยอดเงินทั้งหมด",
				id: "GRID_TOTAL",
				autoScroll: true,
				style: { padding: "5px 5px" },
				height: 570,
				listeners: {
					afterrender: function( component ) {
						
						Ext.getCmp("frm-Add").getEl().mask("Please wait...", "x-mask-loading");
														
						/*============================= LOAD DATA =============================*/
						$.ajax({
							url: "api/List_Cm00006.php",
							type: "POST",
							data: {
								type: "List_Calculate",
								cm_voucher_one_id: cm_voucher_one_id
							},
							success: function(result) {
								
								Ext.getCmp("frm-Add").getEl().unmask();
								var result	= $.parseJSON( result );
								
								Ext.getCmp("f_total_cost").setValue(result.data.f_total_cost);
								Ext.getCmp("f_total_cost").fn();
								Ext.getCmp("f_dec_amount").setValue(result.data.f_dec_amount);
								Ext.getCmp("f_dec_amount").fn();
								Ext.getCmp("f_vat").setValue(result.data.f_vat);
								Ext.getCmp("f_vat").fn();
								Ext.getCmp("f_vat_doc").setValue(result.data.f_vat_doc);
								Ext.getCmp("f_vat_doc").fn();								
								Ext.getCmp("amount").setValue(result.data.amount);
								Ext.getCmp("amount").fn();
								Ext.getCmp("f_wht").setValue(result.data.f_wht);
								Ext.getCmp("f_wht").fn();
								Ext.getCmp("f_tax_save").setValue(result.data.f_tax_save);
								Ext.getCmp("f_tax_save").fn();								
								Ext.getCmp("f_comp_amt").setValue(result.data.f_comp_amt);
								Ext.getCmp("f_comp_amt").fn();
								Ext.getCmp("f_penalty_amt").setValue(result.data.f_penalty_amt);
								Ext.getCmp("f_penalty_amt").fn();
								Ext.getCmp("f_reduce").setValue(result.data.f_reduce);
								Ext.getCmp("f_reduce").fn();
								Ext.getCmp("f_barter_amt").setValue(result.data.f_barter_amt);
								Ext.getCmp("f_barter_amt").fn();
								Ext.getCmp("f_barter_dec").setValue(result.data.f_barter_amt);
								Ext.getCmp("f_barter_dec").fn();								
								Ext.getCmp("f_net_cost").setValue(result.data.f_net_cost);
								Ext.getCmp("f_net_cost").fn();
							}
						});
						/*=====================================================================*/
						
						// บันทึกการคำนวณ
						function Calculate() {
						
							var msg		= "";
	                	
	    					if (msg == "") {
	    						Ext.getCmp("frm-Add").getEl().mask("Please wait...", "x-mask-loading");
	    						Ext.Ajax.request({
	    							url: "api/mn_Cm00006.php",
	    							method: "POST",
	    							params: {
	    								mode: "CALCULATE",
	    								cm_voucher_one_id: cm_voucher_one_id
	    							},
	    							success: function ( result, request ) {
	    								Ext.getCmp("frm-Add").getEl().unmask();

	    								var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
	    								if ( jsonData.success == true ) {
	    	
	    									Ext.Msg.alert("แจ้งเตือน", "บันทึกเรียบร้อย");
	    									GRID_TOTAL();
	    									store.load();
	    									
	    								} else { Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg); }
	    							},
	    							failure: function ( result, request) { 
	    								Ext.MessageBox.alert("Failed", result.responseText);		// connect error
	    							}
	    						});
	    					} else { Ext.Msg.alert("แจ้งเตือน", msg); }
							
						};
						
						/*=========================== RENDER UI ===========================*/
						
						new Ext.Button ({
							text: "&nbsp;คำนวณราคาสุทธิ&nbsp;",
							width : 30,
		                	handler: function() { Calculate(); },
							renderTo: "Ext_bu_cal"
						});
						
						// จำนวนเงิน
						new Ext.form.CompositeField({
							anchor: "100%",
							msgTarget: "under",
							items: [new Ext.form.TextField({
								id: "f_total_cost",
								style: "text-align: right; color: blue; font-weight: bolder;",
								width: 150,
								boxLabel: "บาท",
								readOnly: true,
								listeners: {
				    				afterrender: function() {
										this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue(), 2))); }
									},
									Change: function(value) { this.fn(); }
								},
							}), { xtype: "displayfield", value: "บาท" }],
							renderTo: "Ext_f_total_cost"
						});
						
						// ส่วนลดเงินสด
						new Ext.form.CompositeField({
							anchor: "100%",
							msgTarget: "under",
							items: [new Ext.form.TextField({
								id: "f_dec_amount",
								style: "text-align: right; color: blue; font-weight: bolder;",
								width: 150,
								boxLabel: "บาท",
								readOnly: true,
								listeners: {
				    				afterrender: function() {
										this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue(), 2))); }
									},
									Change: function(value) { this.fn(); }
								},
							}), { xtype: "displayfield", value: "บาท" }],
							renderTo: "Ext_f_dec_amount"
						});
						
						// จำนวนเงินภาษีมูลค่าเพิ่ม(คำนวณ)
						new Ext.form.CompositeField({
							anchor: "100%",
							msgTarget: "under",
							items: [new Ext.form.TextField({
								id: "f_vat",
								style: "text-align: right; color: blue; font-weight: bolder;",
								width: 150,
								boxLabel: "บาท",
								readOnly: true,
								listeners: {
				    				afterrender: function() {
										this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue(), 2))); }
									},
									Change: function(value) { this.fn(); }
								},
							}), { xtype: "displayfield", value: "บาท" }],
							renderTo: "Ext_f_vat"
						});
						
						// จำนวนเงินภาษีมูลค่าเพิ่ม(เอกสาร)
						new Ext.form.CompositeField({
							anchor: "100%",
							msgTarget: "under",
							items: [new Ext.form.TextField({
								id: "f_vat_doc",
								style: "text-align: right; color: blue; font-weight: bolder;",
								width: 150,
								boxLabel: "บาท",
								readOnly: true,
								listeners: {
				    				afterrender: function() {
										this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue(), 2))); }
									},
									Change: function(value) { this.fn(); }
								},
							}), { xtype: "displayfield", value: "บาท" }],
							renderTo: "Ext_f_vat_doc"
						});
						
						// จำนวนเงินรวมภาษีมูลค่าเพิ่ม(คำนวณ)
						new Ext.form.CompositeField({
							anchor: "100%",
							msgTarget: "under",
							items: [new Ext.form.TextField({
								id: "amount",
								style: "text-align: right; color: blue; font-weight: bolder;",
								width: 150,
								boxLabel: "บาท",
								readOnly: true,
								listeners: {
				    				afterrender: function() {
										this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue(), 2))); }
									},
									Change: function(value) { this.fn(); }
								},
							}), { xtype: "displayfield", value: "บาท" }],
							renderTo: "Ext_amount"
						});
						
						// จำนวนเงินภาษีหัก ณ ที่จ่าย
						new Ext.form.CompositeField({
							anchor: "100%",
							msgTarget: "under",
							items: [new Ext.form.TextField({
								id: "f_wht",
								style: "text-align: right; color: blue; font-weight: bolder;",
								width: 150,
								boxLabel: "บาท",
								readOnly: true,
								listeners: {
				    				afterrender: function() {
										this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue(), 2))); }
									},
									Change: function(value) { this.fn(); }
								},
							}), { xtype: "displayfield", value: "บาท" }],
							renderTo: "Ext_f_wht"
						});
						
						// จำนวนเงินภาษีหัก ณ ที่จ่าย (เรียกเก็บ)
						new Ext.form.CompositeField({
							anchor: "100%",
							msgTarget: "under",
							items: [new Ext.form.TextField({
								id: "f_tax_save",
								style: "text-align: right; color: blue; font-weight: bolder;",
								width: 150,
								boxLabel: "บาท",
								readOnly: true,
								listeners: {
				    				afterrender: function() {
										this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue(), 2))); }
									},
									Change: function(value) { this.fn(); }
								},
							}), { xtype: "displayfield", value: "บาท" }],
							renderTo: "Ext_f_tax_save"
						});
						
						// จำนวนเงินภาษีที่บริษัทออกให้
						new Ext.form.CompositeField({
							anchor: "100%",
							msgTarget: "under",
							items: [new Ext.form.TextField({
								id: "f_comp_amt",
								style: "text-align: right; color: blue; font-weight: bolder;",
								width: 150,
								boxLabel: "บาท",
								readOnly: true,
								listeners: {
				    				afterrender: function() {
										this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue(), 2))); }
									},
									Change: function(value) { this.fn(); }
								},
							}), { xtype: "displayfield", value: "บาท" }],
							renderTo: "Ext_f_comp_amt"
						});
						
						// จำนวนเงินค่าปรับเบิกล่าช้า
						new Ext.form.CompositeField({
							anchor: "100%",
							msgTarget: "under",
							items: [new Ext.form.TextField({
								id: "f_penalty_amt",
								style: "text-align: right; color: blue; font-weight: bolder;",
								width: 150,
								boxLabel: "บาท",
								readOnly: true,
								listeners: {
				    				afterrender: function() {
										this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue(), 2))); }
									},
									Change: function(value) { this.fn(); }
								},
							}), { xtype: "displayfield", value: "บาท" }],
							renderTo: "Ext_f_penalty_amt"
						});
						
						// จำนวนเงินหักอื่นๆ
						new Ext.form.CompositeField({
							anchor: "100%",
							msgTarget: "under",
							items: [new Ext.form.TextField({
								id: "f_reduce",
								style: "text-align: right; color: blue; font-weight: bolder;",
								width: 150,
								boxLabel: "บาท",
								readOnly: true,
								listeners: {
				    				afterrender: function() {
										this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue(), 2))); }
									},
									Change: function(value) { this.fn(); }
								},
							}), { xtype: "displayfield", value: "บาท" }],
							renderTo: "Ext_f_reduce"
						});
						
						// จำนวนเงินที่ใช้แลกเปลี่ยน (รวม Vat)
						new Ext.form.CompositeField({
							anchor: "100%",
							msgTarget: "under",
							items: [new Ext.form.TextField({
								id: "f_barter_amt",
								style: "text-align: right; color: blue; font-weight: bolder;",
								width: 150,
								boxLabel: "บาท",
								readOnly: true,
								listeners: {
				    				afterrender: function() {
										this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue(), 2))); }
									},
									Change: function(value) { this.fn(); }
								},
							}), { xtype: "displayfield", value: "บาท" }],
							renderTo: "Ext_f_barter_amt"
						});
						
						// ส่วนลดเงินสดของแลกเปลี่ยน
						new Ext.form.CompositeField({
							anchor: "100%",
							msgTarget: "under",
							items: [new Ext.form.TextField({
								id: "f_barter_dec",
								style: "text-align: right; color: blue; font-weight: bolder;",
								width: 150,
								boxLabel: "บาท",
								readOnly: true,
								listeners: {
				    				afterrender: function() {
										this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue(), 2))); }
									},
									Change: function(value) { this.fn(); }
								},
							}), { xtype: "displayfield", value: "บาท" }],
							renderTo: "Ext_f_barter_dec"
						});
						
						// คงเหลือเบิกจ่าย
						new Ext.form.CompositeField({
							anchor: "100%",
							msgTarget: "under",
							items: [new Ext.form.TextField({
								id: "f_net_cost",
								style: "text-align: right; color: blue; font-weight: bolder;",
								width: 150,
								boxLabel: "บาท",
								readOnly: true,
								listeners: {
				    				afterrender: function() {
										this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue(), 2))); }
									},
									Change: function(value) { this.fn(); }
								},
							}), { xtype: "displayfield", value: "บาท" }],
							renderTo: "Ext_f_net_cost"
						});
						/*=================================================================*/
						
					}
				},
				html:	"<div style='background:#fff; overflow:auto;'>" +
							"<div style='text-align:center; padding:10px;'>" +
								"<h2 style='color: #000099;'>" +
									"กรณีมีการเปลี่ยนแปลง/แก้ไข  รายการที่นำมาจัดทำใบสำคัญจ่าย<br>" +
									"กรุณากดปุ่ม<font color='#FF0033' size='6px'>คำนวณราคาสุทธิ</font>ใหม่ทุกครั้งก่อนกดปุ่ม<font color='#FF0033' size='6px'>บันทึกรายการ</font><br>" +
									"เพื่อให้ระบบจัดเก็บข้อมูลที่เปลี่ยนแปลง/แก้ไขใหม่ได้ถูกต้อง<br>" +
								"</h2>" +
							"</div>" +
							"<div style='font-size: 12px;'>" +
								"<table border='0' cellspacing='2' cellpadding='0' width='100%'>" +
									"<colgroup width='25%'></colgroup>" +
									"<colgroup width='75%' style='background: #DFE8F6;'></colgroup>" +
									"<tr><td colspan='2' style='border-top: 1px solid #99BBE8;'></td></tr>" +
									"<tr><td align='right'><b>:</b></td><td style='padding:1px 4px;'><div id='Ext_bu_cal'></div></td></tr>" +
									"<tr><td align='right'><b>จำนวนเงิน :</b></td><td id='Ext_f_total_cost' style='padding:1px 4px;'></td></tr>" +
									"<tr><td align='right'><b>ส่วนลดเงินสด :</b></td><td id='Ext_f_dec_amount' style='padding:1px 4px;'></td></tr>" +
									"<tr><td align='right'><b>จำนวนเงินภาษีมูลค่าเพิ่ม(คำนวณ) :</b></td><td id='Ext_f_vat' style='padding:1px 4px;'></td></tr>" +
									"<tr><td align='right'><b>จำนวนเงินภาษีมูลค่าเพิ่ม(เอกสาร) :</b></td><td id='Ext_f_vat_doc' style='padding:1px 4px;'></td></tr>" +
									"<tr><td align='right'><b>จำนวนเงินรวมภาษีมูลค่าเพิ่ม(คำนวณ) :</b></td><td id='Ext_amount' style='padding:1px 4px;'></td></tr>" +
									"<tr><td align='right'><b>จำนวนเงินภาษีหัก ณ ที่จ่าย :</b></td><td id='Ext_f_wht' style='padding:1px 4px;'></td></tr>" +
									"<tr><td align='right'><b>จำนวนเงินภาษีหัก ณ ที่จ่าย (เรียกเก็บ) :</b></td><td id='Ext_f_tax_save' style='padding:1px 4px;'></td></tr>" +
									"<tr><td align='right'><b>จำนวนเงินภาษีที่บริษัทออกให้ :</b></td><td id='Ext_f_comp_amt' style='padding:1px 4px;'></td></tr>" +
									"<tr><td align='right'><b>จำนวนเงินค่าปรับเบิกล่าช้า :</b></td><td id='Ext_f_penalty_amt' style='padding:1px 4px;'></td></tr>" +
									"<tr><td align='right'><b>จำนวนเงินหักอื่นๆ :</b></td><td id='Ext_f_reduce' style='padding:1px 4px;'></td></tr>" +
									"<tr><td align='right'><b>จำนวนเงินที่ใช้แลกเปลี่ยน (รวม Vat) :</b></td><td id='Ext_f_barter_amt' style='padding:1px 4px;'></td></tr>" +
									"<tr><td align='right'><b>ส่วนลดเงินสดของแลกเปลี่ยน :</b></td><td id='Ext_f_barter_dec' style='padding:1px 4px;'></td></tr>" +
									"<tr><td align='right'><b>คงเหลือเบิกจ่าย :</b></td><td id='Ext_f_net_cost' style='padding:1px 4px;'></td></tr>" +
								"</table>" +
							"</div>" +
						"</div>",
				buttonAlign: "center",
				buttons: [{
					text : "&nbsp;"+Ext.GLOBAL_BU_SAVE_TH+"ออกเลข PRE&nbsp;",
					iconCls	: "icon-save",
					handler : function() {
						
						var msg		= "";
						
						if(Ext.getCmp("d_doc_date").getValue() == "") { msg	+= "- กรุณากรอก วันที่ทำใบสำคัญจ่าย<br>"; }

						if (msg == "") {
							Ext.getCmp("frm-Add").getEl().mask("Please wait...", "x-mask-loading");
							Ext.Ajax.request({
								url: "api/mn_Cm00006.php",
								method: "POST",
								params: {
									mode: "GEN_PRE",
									cm_voucher_one_id: cm_voucher_one_id
								},
								success: function ( result, request ) {
									Ext.getCmp("frm-Add").getEl().unmask();
									var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
									if ( jsonData.success == true ) {

										Ext.Msg.alert("แจ้งเตือน", jsonData.msg);
    									Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
    									Ext.getCmp("frm-Add").setDisabled(true);
    									store.load();

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
						Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
					}
				}],
				renderTo: "EXT_GRID_TOTAL"
			});
		}; // GRID_TOTAL

		// แสดง FROM PANEL ทั้งหมด
		new Ext.Panel ({
			style: { padding: "1px 0px" },
			listeners: {
				afterrender: function() {
					GRID_AP( cm_voucher_one_id, ap_expen_hdr_id );
					GRID_TOTAL();
				}
			},
			items: [
			        { border: false, style: { padding: "5px 5px" }, html: "<div id='EXT_GRID_AP'></div>" },
			        { border: false, style: { padding: "5px 5px" }, html: "<div id='EXT_GRID_TOTAL'></div>" }
			       ],
			renderTo: "Ext_Show"
		});
	}; // Ext_Show

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
