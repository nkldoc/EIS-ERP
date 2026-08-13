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
	var type	= "";

	/*===============================================*/
	if( page == "ReceiveOther" ) {
		title_panel		= "รับเงินเบ็ดเตล็ด";
		ena				= 1;
	} else {
		title_panel		= "ปรับสถานะรายการรับเงิน";
		ena				= 2;
	}
	
	/*===============================================*/
	
	store = new Ext.data.JsonStore({
		id: "store",
	    autoDestroy: true,
		autoLoad: false, 
	    url: "api/List_ReceiveOther.php",
	    baseParams: { type: "fi_receive_tran_hdr", ena: ena, i_read: user_right_read }, //Permission i_read
	    root: "data",
	    idProperty: "id",
		totalProperty: "totalCount",
		fields: [
			{ name : "no" },
			{ name : "id" },
			{ name : "fi_pymt_voucher_type_id" },
			{ name : "c_code" },
			{ name : "c_name" },
			{ name : "print_code" },
			{ name : "c_sub" },
			{ name : "c_code_gl" },
			{ name : "c_doc_ref" },
			{ name : "pymt_voucher_name" },
			{ name : "c_cheq_code" },
			{ name : "dc_bank_id" },
			{ name : "dc_bank_name" },
			{ name : "dc_bank_branch_id" },
			{ name : "d_cheq_date" },
			{ name : "dc_bank_acc_id" },
			{ name : "fi_receive_wait_dtl_id" },
			{ name : "fi_receive_wait_dtl_name" },
			{ name : "d_doc_date" },
			{ name : "dc_creditor_type_id" },
			{ name : "c_other_addr" },
			{ name : "c_tax_value" },
			{ name : "i_branch" },
			{ name : "c_branch" },
			{ name : "dc_cnt_id" },
			{ name : "cnt_address" },
			{ name : "dc_emp_id" },
			{ name : "emp_address" },
			{ name : "dc_area_id" },
			{ name : "i_type_doc" },
			{ name : "f_receive_net" },
			{ name : "i_print_eng" },
			{ name : "i_is_return" },
			{ name : "i_is_print" },
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
	
	vw_customer	= new Ext.data.JsonStore({
		autoLoad: false,
//		chkMask: false, // status: loading
	    url: "api/List_ReceiveOther.php",
	    baseParams: { type: "vw_customer" },
	    root: "data",
	    idProperty: "id",
		totalProperty: "totalCount",
		fields: [
			{ name : "no" },
			{ name : "id" },
			{ name : "c_code" },
			{ name : "c_name" },
			{ name : "c_address" }
		],
//		listeners: {
//			beforeload: function(t, records, options) { this.chkMask = false; initData(); },
//			datachanged: function(t, records, options) { this.chkMask = true; initData(); },
//		}
	});
	
	vw_detail_dc_emp	= new Ext.data.JsonStore({
		autoLoad: false,
//		chkMask: false, // status: loading
	    url: "api/List_ReceiveOther.php",
	    baseParams: { type: "vw_detail_dc_emp" },
	    root: "data",
	    idProperty: "id",
		totalProperty: "totalCount",
		fields: [
			{ name : "no" },
			{ name : "id" },
			{ name : "c_code" },
			{ name : "c_name" },
			{ name : "cost_name" },
			{ name : "c_address" }
		],
//		listeners: {
//			beforeload: function(t, records, options) { this.chkMask = false; initData(); },
//			datachanged: function(t, records, options) { this.chkMask = true; initData(); },
//		}
	});
	
	fi_receive_wait_dtl	= new Ext.data.JsonStore({
		autoLoad: false,
//		chkMask: false, // status: loading
	    url: "api/List_ReceiveOther.php",
	    baseParams: { type: "fi_receive_wait_dtl" },
	    root: "data",
	    idProperty: "id",
		totalProperty: "totalCount",
		fields: [
			{ name : "no" },
			{ name : "id" },
			{ name : "c_code" },
			{ name : "c_name" },
			{ name : "f_receive_amt" },
			{ name : "d_deposit_date" }
		],
//		listeners: {
//			beforeload: function(t, records, options) { this.chkMask = false; initData(); },
//			datachanged: function(t, records, options) { this.chkMask = true; initData(); },
//		}
	});
	
	fi_pymt_voucher_type_all	= new Ext.data.JsonStore({
		autoLoad: true,
//		chkMask: false, // status: loading
		url: "../cm/api/All_ReceiveOther.php",
		baseParams: { type: "fi_pymt_voucher_type", show: "all" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ],
	    listeners: {
			load: function(t, records, options) { Ext.getCmp( "s_fi_pymt_voucher_type_id" ).setValue( "0" ); }
//			beforeload: function(t, records, options) { this.chkMask = false; initData(); },
//			datachanged: function(t, records, options) { this.chkMask = true; initData(); },
		}
	});

	dc_bank_all	= new Ext.data.JsonStore({
		autoLoad: true,
//		chkMask: false, // status: loading
		url: "../cm/api/All_ReceiveOther.php",
		baseParams: { type: "dc_bank", show: "all" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ],
	    listeners: {
			load: function(t, records, options) { Ext.getCmp( "s_dc_bank_id" ).setValue( "0" ); }
//			beforeload: function(t, records, options) { this.chkMask = false; initData(); },
//			datachanged: function(t, records, options) { this.chkMask = true; initData(); },
		}
	});
	
	dc_creditor_type	= new Ext.data.JsonStore({
		autoLoad: true,
//		chkMask: false, // status: loading
		url: "../cm/api/All_ReceiveOther.php",
		baseParams: { type: "dc_creditor_type" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ],
	    listeners: {
//			beforeload: function(t, records, options) { this.chkMask = false; initData(); },
//			datachanged: function(t, records, options) { this.chkMask = true; initData(); },
		}
	});

	dc_business_area	= new Ext.data.JsonStore({
		autoLoad: true,
//		chkMask: false, // status: loading
		url: "../cm/api/All_ReceiveOther.php",
		baseParams: { type: "dc_business_area" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ],
	    listeners: {
//			beforeload: function(t, records, options) { this.chkMask = false; initData(); },
//			datachanged: function(t, records, options) { this.chkMask = true; initData(); },
		}
	});
	
	dc_bank	= new Ext.data.JsonStore({
		autoLoad: true,
//		chkMask: false, // status: loading
		url: "../cm/api/All_ReceiveOther.php",
		baseParams: { type: "dc_bank" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ],
	    listeners: {
//			beforeload: function(t, records, options) { this.chkMask = false; initData(); },
//			datachanged: function(t, records, options) { this.chkMask = true; initData(); },
		}
	});
	
	dc_bank_branch	= new Ext.data.JsonStore({
		autoLoad: true,
//		chkMask: false, // status: loading
		url: "../cm/api/All_ReceiveOther.php",
		baseParams: { type: "dc_bank_branch" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ],
	    listeners: {
//			beforeload: function(t, records, options) { this.chkMask = false; initData(); },
//			datachanged: function(t, records, options) { this.chkMask = true; initData(); },
		}
	});
	
	vw_bank_branch_deposit	= new Ext.data.JsonStore({
		autoLoad: true,
//		chkMask: false, // status: loading
		url: "../cm/api/All_ReceiveOther.php",
		baseParams: { type: "vw_bank_branch_deposit" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ],
	    listeners: {
//			beforeload: function(t, records, options) { this.chkMask = false; initData(); },
//			datachanged: function(t, records, options) { this.chkMask = true; initData(); },
		}
	});
	
	dc_vat	= new Ext.data.JsonStore({
		autoLoad: true,
//		chkMask: false, // status: loading
		url: "../cm/api/All_ReceiveOther.php",
		baseParams: { type: "dc_vat" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name", "f_vat_rate" ],
	    listeners: {
//			beforeload: function(t, records, options) { this.chkMask = false; initData(); },
//			datachanged: function(t, records, options) { this.chkMask = true; initData(); },
		}
	});
	
	dc_tax	= new Ext.data.JsonStore({
		autoLoad: true,
//		chkMask: false, // status: loading
		url: "../cm/api/All_ReceiveOther.php",
		baseParams: { type: "dc_tax" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name", "f_tax_rate" ],
	    listeners: {
//			beforeload: function(t, records, options) { this.chkMask = false; initData(); },
//			datachanged: function(t, records, options) { this.chkMask = true; initData(); },
		}
	});
	
	vw_bh_contract	= new Ext.data.JsonStore({
		autoLoad: true,
//		chkMask: false, // status: loading
		url: "../cm/api/All_ReceiveOther.php",
		baseParams: { type: "vw_bh_contract" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ],
	    listeners: {
//			beforeload: function(t, records, options) { this.chkMask = false; initData(); },
//			datachanged: function(t, records, options) { this.chkMask = true; initData(); },
		}
	});

	// pagingBar
	pagingBar = new Ext.PagingToolbar({
		pageSize: 20,
		store: store,
		displayInfo: true,
		displayMsg: "Displaying topics {0} - {1} of {2}"
	});

	// ================================ gridMain ================================ //
	
	// cellClick
	cellClick	= function( grid, rowIndex, columnIndex, e ) {
		
		var record	= grid.getStore().getAt(rowIndex);
		
		if ( columnIndex == grid.getColumnModel().getIndexById("Change") ) {
		
			var html	= "";
			var show	= false;
			
			if( record.data.c_code != '0' ) {
				if( record.data.i_enable == 1 ) {
					show	= true;
					alert("ยังทำไม่เสร็จ");
				}
			}
			
			if( ena == 2 && record.data.i_enable != 1 ) {
				show	= true;
				html	= "กรุณายืนยัน ใช้งานรายการรับเงิน";
			}
			
			if( show == true ) {
				
				new Ext.Window({
					id: "win-msg-delete",
					title: "แจ้งเตือน",
					modal: true,
					width: 250,
					height: 130,
					html: html,
					buttons: [{
						text: "Confirm",
						handler: function() {
							Ext.getCmp("win-msg-delete").getEl().mask("Please wait...", "x-mask-loading");
							Ext.Ajax.request({
								url: "api/mn_ReceiveOther.php",
								method: "POST",
								params: {
									mode: ( ena == 1 )? "DELETE" : "ENABLE",
									id: record.get("id")
								},
								success: function ( result, request ) {
									Ext.getCmp("win-msg-delete").getEl().unmask();
									var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
									if (jsonData.success) {
										Ext.MessageBox.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย");		// alert massage success
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
			
		} else if ( columnIndex == grid.getColumnModel().getIndexById("Edit") ) {

			Ext.getCmp("tabpanel2").setDisabled(false);
			Ext.getCmp("contenterCenter").setActiveTab("tabpanel2");
			Ext.getCmp("form-widgets").getForm().reset();
			Ext.getCmp("form-widgets").getForm().loadRecord(record);

			// เช็ค
			dc_bank_branch.setBaseParam("dc_bank_id", record.data.dc_bank_id);
			dc_bank_branch.load();

			if( record.data.dc_creditor_type_id == 4 ) { // บุคคลทั่วไป
				
				Ext.getCmp("c_other_name['general']").setValue(record.data.c_name);
				Ext.getCmp("c_other_addr['general']").setValue(record.data.c_other_addr);
				Ext.getCmp("c_tax_value['general']").setValue(record.data.c_tax_value);
				Ext.getCmp("i_branch['general']").setValue(record.data.i_branch);
				Ext.getCmp("c_branch['general']").setValue(record.data.c_branch);
				
			} else if( record.data.dc_creditor_type_id == 1 ) {
				
				// ผู้ขาย/ผู้รับจ้าง
				Ext.getCmp("dc_cnt_id['external']").setValue(record.data.dc_cnt_id);
				Ext.getCmp("dc_cnt_id['external']_Name").setValue(record.data.c_name);
				Ext.getCmp("c_other_addr['external']").setValue(record.data.cnt_address);
				
			} else if( record.data.dc_creditor_type_id == 3 ) {

				// บุคคลภายใน
				Ext.getCmp("dc_emp_id['internal']").setValue(record.data.dc_emp_id);
				Ext.getCmp("dc_emp_id['internal']_Name").setValue(record.data.c_name);
				Ext.getCmp("c_other_addr['internal']").setValue(record.data.emp_address);
				
			}
			
			if( record.data.fi_pymt_voucher_type_id == "2" ) { // เช็ค
				
				Ext.getCmp("tabpanel2").getEl().mask("Please wait...", "x-mask-loading");
				dc_bank_branch.setBaseParam("dc_bank_id", record.data.dc_bank_id);
				dc_bank_branch.load({ callback: function(records, operation, success) { if ( success == true ) {
					this.chkMask = true;
					Ext.getCmp("tabpanel2").getEl().unmask();
					
					Ext.getCmp("c_cheq_code['cheqe']").setValue(record.data.c_cheq_code);
					Ext.getCmp("dc_bank_id['cheqe']").setValue(record.data.dc_bank_id);
					Ext.getCmp("dc_bank_branch_id['cheqe']").setValue(record.data.dc_bank_branch_id);
					
				} } });
				
			} else if( record.data.fi_pymt_voucher_type_id == "3" ) { // โอนเงินผ่านธนาคาร
				
				Ext.getCmp("dc_bank_acc_id['bank']").setValue(record.data.dc_bank_acc_id);
				
			} else if( record.data.fi_pymt_voucher_type_id == "7" ) { // เงินรอแจ้งหักล้าง
				
				Ext.getCmp("fi_receive_wait_dtl_id['doc']").setValue(record.data.fi_receive_wait_dtl_id);
				Ext.getCmp("fi_receive_wait_dtl_id['doc']_Name").setValue(record.data.fi_receive_wait_dtl_name);
				
			}
			
			Ext.getCmp("dc_creditor_type_id").fn();
			Ext.getCmp("fi_pymt_voucher_type_id").fn();
			
			
			if( record.data.i_is_print == 1 || ena == 2 ) {
				
				type	= "view";
				
				if( ena == 2 ) {
					Ext.getCmp("c_comment").setDisabled(true);
				}
				
				Ext.getCmp("role-form-mode").setValue("EDIT_PRINT");
				Ext.getCmp("dc_creditor_type_id").setDisabled(true);
				Ext.getCmp("c_other_name['general']").setDisabled(true);
				Ext.getCmp("c_other_addr['general']").setDisabled(true);
				Ext.getCmp("c_tax_value['general']").setDisabled(true);
				Ext.getCmp("i_branch['general']").setDisabled(true);
				Ext.getCmp("c_branch['general']").setDisabled(true);
				Ext.getCmp("span_cnt['external']").setDisabled(true);
				Ext.getCmp("Budc_cnt_id['external']").setDisabled(true);
				Ext.getCmp("c_other_addr['external']").setDisabled(true);
				Ext.getCmp("span_emp['internal']").setDisabled(true);
				Ext.getCmp("Budc_emp_id['internal']").setDisabled(true);
				Ext.getCmp("c_other_addr['internal']").setDisabled(true);
				Ext.getCmp("dc_area_id").setDisabled(true);
				Ext.getCmp("i_type_doc").setDisabled(true);
				Ext.getCmp("c_doc_ref").setDisabled(true);
				Ext.getCmp("fi_pymt_voucher_type_id").setDisabled(true);
				Ext.getCmp("c_cheq_code['cheqe']").setDisabled(true);
				Ext.getCmp("dc_bank_id['cheqe']").setDisabled(true);
				Ext.getCmp("dc_bank_branch_id['cheqe']").setDisabled(true);
				Ext.getCmp("span_date['cheqe']").setDisabled(true);
				Ext.getCmp("dc_bank_acc_id['bank']").setDisabled(true);
				Ext.getCmp("span_wait['doc']").setDisabled(true);
				Ext.getCmp("d_doc_date").setDisabled(true);
				Ext.getCmp("i_is_return").setDisabled(true);
				Ext.getCmp("i_print_eng").setDisabled(true);
				
			} else {
				
				type = "edit";
				
				Ext.getCmp("role-form-mode").setValue("EDIT");
				Ext.getCmp("dc_creditor_type_id").setDisabled(false);
				Ext.getCmp("c_other_name['general']").setDisabled(false);
				Ext.getCmp("c_other_addr['general']").setDisabled(false);
				Ext.getCmp("c_tax_value['general']").setDisabled(false);
				Ext.getCmp("i_branch['general']").setDisabled(false);
				Ext.getCmp("c_branch['general']").setDisabled(false);
				Ext.getCmp("span_cnt['external']").setDisabled(false);
				Ext.getCmp("Budc_cnt_id['external']").setDisabled(false);
				Ext.getCmp("c_other_addr['external']").setDisabled(false);
				Ext.getCmp("span_emp['internal']").setDisabled(false);
				Ext.getCmp("Budc_emp_id['internal']").setDisabled(false);
				Ext.getCmp("c_other_addr['internal']").setDisabled(false);
				Ext.getCmp("dc_area_id").setDisabled(false);
				Ext.getCmp("i_type_doc").setDisabled(false);
				Ext.getCmp("c_doc_ref").setDisabled(false);
				Ext.getCmp("fi_pymt_voucher_type_id").setDisabled(false);
				Ext.getCmp("c_cheq_code['cheqe']").setDisabled(false);
				Ext.getCmp("dc_bank_id['cheqe']").setDisabled(false);
				Ext.getCmp("dc_bank_branch_id['cheqe']").setDisabled(false);
				Ext.getCmp("span_date['cheqe']").setDisabled(false);
				Ext.getCmp("dc_bank_acc_id['bank']").setDisabled(false);
				Ext.getCmp("span_wait['doc']").setDisabled(false);
				Ext.getCmp("d_doc_date").setDisabled(false);
				Ext.getCmp("i_is_return").setDisabled(false);
				Ext.getCmp("i_print_eng").setDisabled(false);
				
			}
			Ext_Show( record.data.id );
		} else if (columnIndex == grid.getColumnModel().getIndexById("Print")) {
			
			if ( record.data.c_code != '' && ena == 1 ) {
				var href		= "../cm/report/Print_ReceiveOther.php";
		    	var resultUrl	= "";
		    	
		    	resultUrl	+= "&fi_receive_tran_hdr_id="+record.data.id;
		    	resultUrl	= (resultUrl != "")? "?"+resultUrl.substring(1) : "";
		    	
				window.open(href+resultUrl, "_Self");
		      	window.focus();
			}
			
		}
//		else if (columnIndex == grid.getColumnModel().getIndexById("delete")) {
//			
//			if( record.data.i_is_status == 4 && record.data.i_enable == 1 ) { //สถานะเป็นรอนุมัติ
//				new Ext.Window({
//					id: "win-msg-delete",
//					title: "Remove",
//					modal: true,
//					width: 250,
//					height: 130,
//					html: "ท่านต้องการที่จะลบข้อมูล ?",
//					buttons: [{
//						text: "Confirm",
//						handler: function() {
//							Ext.getCmp("win-msg-delete").getEl().mask("Please wait...", "x-mask-loading");
//							Ext.Ajax.request({
//								url: "api/mn_Fi00097.php",
//								method: "POST",
//								params: {
//									type: "DELETE",
//									id: record.get("id")
//								},
//								success: function ( result, request ) {
//									Ext.getCmp("win-msg-delete").getEl().unmask();
//									var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
//									if (jsonData.success) {
//										//Ext.MessageBox.alert("Success", jsonData.msg);		// alert massage success
//										Ext.getCmp("win-msg-delete").destroy();						// clear memory :: garbage collection
//										store.reload();
//									} else {
//										Ext.MessageBox.alert("Failed", jsonData.msg);			// alert massage error
//									}
//								},
//								failure: function ( result, request) { 
//									Ext.MessageBox.alert("Failed", result.responseText);		// connect error
//								}
//							});
//						}
//					}, {
//						text : Ext.GLOBAL_BU_BACK_TH,
//						handler : function() { Ext.getCmp("win-msg-delete").destroy(); }
//					}]
//				}).show();
//			}
//			
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
		            width: 130,
					mode: "local",
		            store: new Ext.data.SimpleStore({
		            	fields: [ "value", "text" ],
						data: [
						       [ "c_area_code", "เลขที่รับเงิน" ],
						       [ "print_code", "เลขที่พิมพ์ใบเสร็จรับเงิน" ],
						       [ "c_doc_ref", "เลขที่รับเงินอ้างอิง" ]
						      ]
					}),
					value: "c_area_code",
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
            	items: [{ xtype: "label", text: "รับเงินจาก : " }, { xtype: "tbspacer", width: 4 }, {
            		xtype: "textfield",
            		id: "s_c_name",
            		width: 130,
           			fieldLabel: "fieldLabel",
           			emptyText: "คำที่ต้องการค้นหา"
           		}, { xtype: "tbspacer", width: 4 }, { xtype: "label", text: "รหัสพนักงาน : " }, { xtype: "tbspacer", width: 6 }, {
            		xtype: "textfield",
            		id: "s_emp_no",
            		width: 130,
           			fieldLabel: "fieldLabel",
           			emptyText: "คำที่ต้องการค้นหา"
           		}]
            }, {
            	xtype: "buttongroup",
            	frame: false,
            	items: [{ xtype: "label", text: "วันที่รับเงิน : " }, { xtype: "tbspacer", width: 4 }, {
            		id: "s_doc_date1", xtype: "datefield", width: 130,
            		listeners : {
            			afterrender : function() {
            				var date = new Date();
            				date = new Date(date.getFullYear()+543, date.getMonth()-2, 1);
            				this.setValue(date);
            			}
            		}
                }, { xtype: "tbspacer", width: 33 }, { xtype: "label", text: "ถึงวันที่ : " }, { xtype: "tbspacer", width: 4 }, {
                	id: "s_doc_date2", xtype: "datefield", width: 130,
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
				hidden: ( ena == 1 )? false : true,
				handler: function(grid, rowIndex, colIndex) {
					
					Ext.getCmp("tabpanel2").setDisabled(false);
					Ext.getCmp("contenterCenter").setActiveTab("tabpanel2");
					Ext.getCmp("form-widgets").getForm().reset();
					Ext.getCmp("role-form-mode").setValue("ADD");
					
					// เช็ค
					dc_bank_branch.setBaseParam("dc_bank_id", "");
					dc_bank_branch.load();
					
					Ext.getCmp('d_doc_date').setValue(addY(543));

					Ext.getCmp("dc_creditor_type_id").fn();
					Ext.getCmp("fi_pymt_voucher_type_id").fn();
					
					
					Ext.getCmp("dc_creditor_type_id").setDisabled(false);
					Ext.getCmp("c_other_name['general']").setDisabled(false);
					Ext.getCmp("c_other_addr['general']").setDisabled(false);
					Ext.getCmp("c_tax_value['general']").setDisabled(false);
					Ext.getCmp("i_branch['general']").setDisabled(false);
					Ext.getCmp("c_branch['general']").setDisabled(false);
					Ext.getCmp("span_cnt['external']").setDisabled(false);
					Ext.getCmp("Budc_cnt_id['external']").setDisabled(false);
					Ext.getCmp("c_other_addr['external']").setDisabled(false);
					Ext.getCmp("span_emp['internal']").setDisabled(false);
					Ext.getCmp("Budc_emp_id['internal']").setDisabled(false);
					Ext.getCmp("c_other_addr['internal']").setDisabled(false);
					Ext.getCmp("dc_area_id").setDisabled(false);
					Ext.getCmp("i_type_doc").setDisabled(false);
					Ext.getCmp("c_doc_ref").setDisabled(false);
					Ext.getCmp("fi_pymt_voucher_type_id").setDisabled(false);
					Ext.getCmp("c_cheq_code['cheqe']").setDisabled(false);
					Ext.getCmp("dc_bank_id['cheqe']").setDisabled(false);
					Ext.getCmp("dc_bank_branch_id['cheqe']").setDisabled(false);
					Ext.getCmp("span_date['cheqe']").setDisabled(false);
					Ext.getCmp("dc_bank_acc_id['bank']").setDisabled(false);
					Ext.getCmp("span_wait['doc']").setDisabled(false);
					Ext.getCmp("d_doc_date").setDisabled(false);
					Ext.getCmp("i_is_return").setDisabled(false);
					Ext.getCmp("i_print_eng").setDisabled(false);					

					$("#Ext_Show").empty(); // แสดง FROM PANEL ทั้งหมด
					
				}
			}, "&nbsp;"]
		}, {
			xtype: "buttongroup",
			title: "&nbsp;",
			columns: 1,
            defaults: { scale: "small", style: "float: right" },
            items: [{
            	xtype: "buttongroup",
            	frame: false,
            	items: [{ xtype: "label", text: "รหัสผู้ขาย/ผู้รับจ้าง : " }, { xtype: "tbspacer", width: 4 }, {
            		xtype: "textfield",
            		id: "s_cus_no",
            		width: 150,
           			fieldLabel: "fieldLabel",
           			emptyText: "คำที่ต้องการค้นหา"
            	}, { xtype: "tbspacer", width: 4 }, { xtype: "label", text: "ประเภทใบเสร็จรับเงิน : " }, { xtype: "tbspacer", width: 4 },
				new Ext.form.ComboBox({
					id: "s_doc_type_id",
					width: 200,
					mode: "local",
				    store: new Ext.data.SimpleStore({
		            	fields: [ "id", "c_name" ],
						data: [
						       [ "0", "- เลือกทั้งหมด -" ],
						       [ "1", "ใบเสร็จรับเงิน/ใบกำกับภาษี" ],
						       [ "2", "ใบเสร็จรับเงิน" ],
						       [ "3", "ใบเสร็จรับเงิน/ใบกำกับภาษี(อย่างย่อ)" ],
						       [ "5", "ไม่ออกใบเสร็จรับเงิน" ]
						]
					}),
					value: "0",
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
				})]
            }, {
            	xtype: "buttongroup",
            	frame: false,
            	items: [{ xtype: "label", text: "เลขที่เช็ค : " }, { xtype: "tbspacer", width: 4 }, {
            		xtype: "textfield",
            		id: "s_c_cheq_code",
            		width: 150,
           			fieldLabel: "fieldLabel",
           			emptyText: "คำที่ต้องการค้นหา"
            	}, { xtype: "tbspacer", width: 67 }, { xtype: "label", text: "ธนาคาร : " }, { xtype: "tbspacer", width: 4 },
            	new Ext.form.ComboBox({
					id: "s_dc_bank_id",
					width: 200,
					mode: "local",
				    store: dc_bank_all,
					value: "0",
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
        		})]
            }, {
            	xtype: "buttongroup",
            	frame: false,
            	items: [{ xtype: "label", text: "สถานะใช้งาน : " }, { xtype: "tbspacer", width: 4 },
        	        new Ext.form.ComboBox({
    					id: "s_enable",
    					width: 150,
    					mode: "local",
    				    store: new Ext.data.SimpleStore({
    		            	fields: [ "id", "c_name" ],
    						data: [
    						       [ "0", "- เลือกทั้งหมด -" ],
    						       [ "1", "ใช้งาน" ],
    						       [ "2", "ไม่ใช้งาน" ]
    						]
    					}),
    					value: "0",
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
    				}), { xtype: "tbspacer", width: 21 }, { xtype: "label", text: "ประเภทการรับเงิน : " }, { xtype: "tbspacer", width: 4 },
        		new Ext.form.ComboBox({
					id: "s_fi_pymt_voucher_type_id",
					width: 200,
					mode: "local",
				    store: fi_pymt_voucher_type_all,
					value: "0",
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
        		})]
            }],
            buttonAlign: "left",
			buttons:[{
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
						store.setBaseParam("c_name", Ext.getCmp("s_c_name").getValue());
						store.setBaseParam("emp_no", Ext.getCmp("s_emp_no").getValue());
						store.setBaseParam("cus_no", Ext.getCmp("s_cus_no").getValue());
						store.setBaseParam("d_doc_date1", Ext.util.Format.date(Ext.getCmp("s_doc_date1").getValue(), "Y-m-d"));
						store.setBaseParam("d_doc_date2", Ext.util.Format.date(Ext.getCmp("s_doc_date2").getValue(), "Y-m-d"));
						store.setBaseParam("doc_type_id", Ext.getCmp("s_doc_type_id").getValue());
						store.setBaseParam("c_cheq_code", Ext.getCmp("s_c_cheq_code").getValue());
						store.setBaseParam("dc_bank_id", Ext.getCmp("s_dc_bank_id").getValue());
						store.setBaseParam("i_enable", Ext.getCmp("s_enable").getValue());
						store.setBaseParam("fi_pymt_voucher_type_id", Ext.getCmp("s_fi_pymt_voucher_type_id").getValue());
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
			{ id: "Change", header: "-", sortable: false, align: "center", width: 60, dataIndex: "id",
				renderer: function(value, metaData, record, row, col, store, gridView) {
					
					var bu_cancel	= '';
					
					if( record.data.c_code != '0' ) {
						if( record.data.i_enable == 1 ) {
							bu_cancel	= "<button style='font-size:11px; cursor:pointer; color: red;'>ยกเลิก</button>";
						}
					}
					
					if ( record.data.print_code != '' && record.data.i_enable == '1' ) {
						if ( record.data.c_sub == 'G' ) {
							bu_cancel	= record.data.c_code_gl;
						}
					}
					
					if( ena == 2 && record.data.i_enable != 1 ) {
						bu_cancel	= "<button style='font-size:11px; cursor:pointer;'>ใช้งาน</button>";
					}

					return bu_cancel;
				}
			},
			{ id: "Edit", header: "-", sortable: false, align: "center", width:50, dataIndex: "id",
				renderer: function(value, metaData, record, row, col, store, gridView) {
					var text	= ( ena == 1 )? "แก้ไข" : "แสดง";
					return "<button style='font-size:11px; cursor:pointer; color: green;'>"+text+"</button>";
				}
			},
			{ header: "สถานะใช้งาน", sortable: true, align: "center", dataIndex: "i_enable",
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					if( value == 1 ) {
						return "<span style=\"color:green;\">"+record.data.show_enable+"</span>";
					} else {
						return "<span style=\"color:red;\">"+record.data.show_enable+"</span>";
					}
				}
			},
			{ id: "Print", header: "เลขที่รับเงิน", sortable: true, align: "center", width: 120, dataIndex: "id",
				renderer: function(value, metaData, record, row, col, store, gridView) {
					if ( record.data.c_code != '' && ena == 1 ) {
						return "<span style='cursor:pointer; color: blue;'><img title='พิมพ์' src=\'../images/icons/printer_mono.png');/> "+record.data.c_code+"</span>";
					} else if ( ena == 2 ) {
						return record.data.c_code;
					}
				}
			},
			{ header: "เลขที่พิมพ์ใบเสร็จรับเงิน", sortable: true, align: "center", width: 130, dataIndex: "print_code" },
			{ header: "เลขที่รับเงินอ้างอิง", sortable: true, align: "center", dataIndex: "c_doc_ref" },
			{ header: "วันที่รับเงิน", sortable: true, align: "center", dataIndex: "d_doc_date",
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					return (value != "")? shortThaiDate(value) : "";
				}
			},
			{ header: "รับเงินจาก", sortable: true, width: 200, dataIndex: "c_name" },
			{ header: "ประเภทการรับเงิน", sortable: true, align: "center", dataIndex: "pymt_voucher_name" },
			{ header: "เลขที่เช็ค", sortable: true, align: "center", dataIndex: "c_cheq_code" },
			{ header: "ธนาคาร", sortable: true, dataIndex: "dc_bank_name" },
			{ header: "รายละเอียดการรับเงิน", sortable: true, dataIndex: "c_comment" },
			{ header: "จำนวนเงินสุทธิ", sortable: true, align: "center", dataIndex: "f_receive_net",
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
			},
			{ header: "หน่วยงานที่ทำรายการล่าสุด", sortable: true, dataIndex: "dc_user_update_cost_id" }
		],
//		autoExpandColumn: "c_comment",
		bbar: pagingBar
	}); //gridMain
	
	//=================================== รายละเอียดเพิ่มเติม ===================================//
	Ext_Show = function( fi_receive_tran_hdr_id ) { 

		$("#Ext_Show").empty();
		
		// รายการรับเงิน 
		function GRID_DTL() {
			
			$("#EXT_GRID_DTL").empty();
			
			function popDtl() {

				function func_calculate() {
					
					var f_receive_amt	= parseFloat(Ext.getCmp("f_receive_amt['dtl']").getValue());	// จำนวนเงิน
					var dc_tax_id_vat	= Ext.getCmp("dc_tax_id_vat['dtl']").getValue();				// อัตราภาษีมูลค่าเพิ่ม
					var dc_tax_id_tax	= Ext.getCmp("dc_tax_id_tax['dtl']").getValue();				// อัตราภาษีหัก ณ ที่จ่าย
					var f_vat_amt		= parseFloat(Ext.getCmp("f_vat_amt['dtl']").getValue());		// จำนวนเงินภาษีมูลค่าเพิ่ม
					var i_is_edit_vat	= Ext.getCmp("i_is_edit_vat['dtl']").getValue();
					var f_tax_amt		= parseFloat(Ext.getCmp("f_tax_amt['dtl']").getValue());		// จำนวนเงินภาษีหัก ณ ที่จ่าย
					var i_is_edit_tax	= Ext.getCmp("i_is_edit_tax['dtl']").getValue();
					
					if( dc_tax_id_vat > 0 ) {
						var ss				= dc_vat.findExact("id" ,dc_tax_id_vat);
						var f_vat_rate		= parseFloat(dc_vat.data.items[ss].data.f_vat_rate);	
					} else {
						var f_vat_rate		= 0;
					}
					
					if( dc_tax_id_tax > 0 ) {
						var ss				= dc_tax.findExact("id" ,dc_tax_id_tax);
						var f_tax_rate		= parseFloat(dc_tax.data.items[ss].data.f_tax_rate);	
					} else {
						var f_tax_rate		= 0;
					}
					
					if( i_is_edit_vat == false ) { f_vat_amt = (f_receive_amt * f_vat_rate) / 100 }
					if( i_is_edit_tax == false ) { f_tax_amt = (f_receive_amt * f_tax_rate) / 100 }
					
					Ext.getCmp("f_vat_amt['dtl']").setValue(floatMinus(f_vat_amt, 2));
					Ext.getCmp("f_net_cost['dtl']").setValue(floatMinus(f_receive_amt + f_vat_amt, 2));
					Ext.getCmp("f_tax_amt['dtl']").setValue(floatMinus(f_tax_amt, 2));
					Ext.getCmp("f_tax_net_cost['dtl']").setValue(floatMinus((f_receive_amt + f_vat_amt) - f_tax_amt, 2));
					
				};
				
				new Ext.Window({
					title: "บันทึกรายละเอียดการรับเงิน",
					id: "win-pop-dtl",
					layout: "fit",
					modal: true,
					border: false,
					height: (Ext.getBody().getViewSize().height * 0.7),
					width: (Ext.getBody().getViewSize().width * 0.7),
					listeners: {
						afterrender: function( component ) {
							
							Ext.getCmp("win-pop-dtl").getEl().mask("Please wait...", "x-mask-loading");
							dc_vat.load({
								params : {
									fi_receive_tran_hdr_id : fi_receive_tran_hdr_id
								},
								callback: function(records, operation, success) {
									if ( success == true ) {
										this.chkMask = true;
										Ext.getCmp("win-pop-dtl").getEl().unmask();
									}
								}
							});
						}
					},
					items: [new Ext.FormPanel({
						frame: true,
						autoScroll: true,
						labelWidth: 250,
						labelAlign: "right",
						bodyStyle: "padding:5px 5px 0;",
						items: [{
							xtype: "compositefield",
							fieldLabel: "จำนวนเงิน",
							anchor: "100%",
							msgTarget: "under",
							items: [{
								xtype: "textfield",
								id: "f_receive_amt['dtl']",
								style: "text-align: right",
								width: 250,
								listeners: {
									afterrender: function() {
										this.fn	= function() {
											this.setValue(floatAccount(this.getValue(), 2));
											func_calculate();
										}
									},
									Change: function(value) { this.fn(); }
								}
							}, { xtype: "displayfield", value: "บาท" }]
						}, new Ext.form.ComboBox({
							fieldLabel: "อัตราภาษีมูลค่าเพิ่ม",
							id: "dc_tax_id_vat['dtl']",
							width: 200,
							mode: "local",
						    store: dc_vat,
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
									func_calculate();
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
		        		}), new Ext.form.ComboBox({
							fieldLabel: "อัตราภาษีหัก ณ ที่จ่าย",
							id: "dc_tax_id_tax['dtl']",
							width: 200,
							mode: "local",
						    store: dc_tax,
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
									func_calculate();
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
		        		}), {
							xtype: "compositefield",
							fieldLabel: "รายการ/บรรทัด1",
							anchor: "100%",
							msgTarget: "under",
							items: [{
			            		xtype: "textfield",
			            		id: "c_name1['dtl']",
			            		width: 150
			            	}, new Ext.form.Checkbox({
								id: "is_add_row['dtl']",
								boxLabel: "<b style=\"color:red;\">ต้องการคีย์รายการเพิ่ม</b>",
								inputValue: 1,
								checked: false,
								listeners: {
									afterrender: function() {
										this.fn	= function() {
											if( this.checked == true ) {
												Ext.getCmp("span_name['dtl']").show();
												Ext.getCmp("c_name2['dtl']").show();
												Ext.getCmp("c_name3['dtl']").show();
											} else {
												Ext.getCmp("span_name['dtl']").hide();
												Ext.getCmp("c_name2['dtl']").hide();
												Ext.getCmp("c_name3['dtl']").hide();
											}
										}
									},
									check: function ( combo, newValue ) { this.fn(); }
								}
							})]
						}, { id: "span_name['dtl']", xtype: "displayfield", hidden: true, value: "<b style='color:red;'>*** คำแนะนำ :</b> <b style='color:blue;'>หากพบว่ารายการเกิน 3 รายการให้ปล่อยว่างไว้ระบบจะทำการตรวจสอบโดยอัตโนมัติ</b>" }, {
							fieldLabel: "รายการ/บรรทัด2",
		            		xtype: "textfield",
		            		id: "c_name2['dtl']",
		            		hidden: true,
		            		width: 150
		            	}, {
							fieldLabel: "รายการ/บรรทัด3",
		            		xtype: "textfield",
		            		id: "c_name3['dtl']",
		            		hidden: true,
		            		width: 150
		            	}, {
							xtype: "compositefield",
							fieldLabel: "จำนวนเงินภาษีมูลค่าเพิ่ม",
							anchor: "100%",
							msgTarget: "under",
							items: [{
								xtype: "textfield",
								id: "f_vat_amt['dtl']",
								style: "text-align: right; color: blue;",
								width: 250,
								disabled: true,
								listeners: {
									afterrender: function() {
										this.fn	= function() {
											var val	= this.getValue();
											if( val <= 0 ) { val = 0; }
											this.setValue(floatMinus(val, 2));
											func_calculate();
										}
									},
									Change: function(value) { this.fn(); }
								}
							}, { xtype: "displayfield", value: "บาท" },
							new Ext.form.Checkbox({
								id: "i_is_edit_vat['dtl']",
								boxLabel: "<b style=\"color:red;\">ต้องการแก้ไขภาษีมูลค่าเพิ่ม</b>",
								inputValue: 1,
								checked: false,
								listeners: {
									afterrender: function() {
										this.fn	= function() {
											if( this.checked == true ) {
												Ext.getCmp("f_vat_amt['dtl']").setDisabled(false);
											} else {
												Ext.getCmp("f_vat_amt['dtl']").setDisabled(true);
											}
											func_calculate();
										}
									},
									check: function ( combo, newValue ) { this.fn(); }
								}
							})]
						}, {
							xtype: "compositefield",
							fieldLabel: "จำนวนเงินรวมภาษีมูลค่าเพิ่ม",
							anchor: "100%",
							msgTarget: "under",
							items: [{
								xtype: "textfield",
								id: "f_net_cost['dtl']",
								style: "text-align: right; color: red;",
								width: 250,
								readOnly: true,
								listeners: {
									afterrender: function() {
										this.fn	= function() { this.setValue(floatMinus(this.getValue(), 2)); }
									},
									Change: function(value) { this.fn(); }
								}
							}, { xtype: "displayfield", value: "บาท" }]
						}, {
							xtype: "compositefield",
							fieldLabel: "จำนวนเงินภาษีหัก ณ ที่จ่าย",
							anchor: "100%",
							msgTarget: "under",
							items: [{
								xtype: "textfield",
								id: "f_tax_amt['dtl']",
								style: "text-align: right;",
								width: 250,
								disabled: true,
								listeners: {
									afterrender: function() {
										this.fn	= function() {
											var val	= this.getValue();
											if( val <= 0 ) { val = 0; }
											this.setValue(floatMinus(val, 2));
											func_calculate();
										}
									},
									Change: function(value) { this.fn(); }
								}
							}, { xtype: "displayfield", value: "บาท" },
							new Ext.form.Checkbox({
								id: "i_is_edit_tax['dtl']",
								boxLabel: "<b style=\"color:red;\">ต้องการแก้ไขภาษีหัก ณ ที่จ่าย</b>",
								inputValue: 1,
								checked: false,
								listeners: {
									afterrender: function() {
										this.fn	= function() {
											if( this.checked == true ) {
												Ext.getCmp("f_tax_amt['dtl']").setDisabled(false);
											} else {
												Ext.getCmp("f_tax_amt['dtl']").setDisabled(true);
											}
											func_calculate();
										}
									},
									check: function ( combo, newValue ) { this.fn(); }
								}
							})]
						}, {
							xtype: "compositefield",
							fieldLabel: "จำนวนเงินสุทธิ",
							anchor: "100%",
							msgTarget: "under",
							items: [{
								xtype: "textfield",
								id: "f_tax_net_cost['dtl']",
								style: "text-align: right; color: green;",
								width: 250,
								readOnly: true,
								listeners: {
									afterrender: function() {
										this.fn	= function() { this.setValue(floatMinus(this.getValue(), 2)); }
									},
									Change: function(value) { this.fn(); }
								}
							}, { xtype: "displayfield", value: "บาท" }]
						}, { xtype: "displayfield", value: "<b style='color:red;'>คำเตือน : สามารถบันทึกรายการรับเงินได้ไม่เกิน 3 รายการ/บรรทัด</b>" }],
						buttonAlign: "left",
						buttons: [{
							text: Ext.GLOBAL_BU_SAVE_TH,
							iconCls: "icon-save",
							handler: function(grid, rowIndex, colIndex) {
	
								var msg	= "";
								
								var c_name1	= "";
								var c_name2	= "";
								var c_name3	= "";
								
								if( Ext.getCmp("f_receive_amt['dtl']").getValue() <= 0 ) { msg	+= "- กรุณากรอก จำนวนเงิน<br>"; }
								if( Ext.getCmp("dc_tax_id_vat['dtl']").getValue() == "" ) { msg	+= "- กรุณาเลือก อัตราภาษีมูลค่าเพิ่ม<br>"; }
								if( Ext.getCmp("dc_tax_id_tax['dtl']").getValue() == "" ) { msg	+= "- กรุณาเลือก อัตราภาษีหัก ณ ที่จ่าย<br>"; }
								if( Ext.getCmp("is_add_row['dtl']").getValue() == true ) {
									
									c_name1	= Ext.getCmp("c_name1['dtl']").getValue();
									c_name2	= Ext.getCmp("c_name2['dtl']").getValue();
									c_name3	= Ext.getCmp("c_name3['dtl']").getValue();
									
								} else {
									
									c_name1	= Ext.getCmp("c_name1['dtl']").getValue();
									c_name2	= "";
									c_name3	= "";
									
								}
								if( c_name1 == "" && c_name2 == "" && c_name3 == "" ) {
									msg	+= "- กรุณากรอก รายการ/บรรทัด<br>";
								}
								if( parseFloat(Ext.getCmp("f_net_cost['dtl']").getValue()) < parseFloat(Ext.getCmp("f_tax_amt['dtl']").getValue()) ) {
									msg	+= "- กรุณากรอก จำนวนเงินภาษีหัก ณ ที่จ่าย ไม่เกินจำนวนเงินรวมภาษีมูลค่าเพิ่ม<br>";
								}
								
								if(msg	== "") {
									
									Ext.getCmp("win-pop-dtl").getEl().mask("Please wait...", "x-mask-loading");
									Ext.Ajax.request({
										url: "api/mn_ReceiveOther.php",
										method: "POST",
										params: {
											mode: "ADD_DTL",
											fi_receive_tran_hdr_id: fi_receive_tran_hdr_id,
											dc_tax_id_vat: Ext.getCmp("dc_tax_id_vat['dtl']").getValue(),
											dc_tax_id_tax: Ext.getCmp("dc_tax_id_tax['dtl']").getValue(),
											c_name1: c_name1,
											c_name2: c_name2,
											c_name3: c_name3,
											f_receive_amt: Ext.getCmp("f_receive_amt['dtl']").getValue(),
											f_vat_amt: Ext.getCmp("f_vat_amt['dtl']").getValue(),
											f_tax_amt: Ext.getCmp("f_tax_amt['dtl']").getValue(),
											f_tax_net_cost: Ext.getCmp("f_tax_net_cost['dtl']").getValue(),
										},
										success: function ( result, request ) {
											Ext.getCmp("win-pop-dtl").getEl().unmask();
											var obj = $.parseJSON( result.responseText );
											
											if(obj.success == true) {
												Ext.Msg.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย");
												store.load();
												Ext_Show( obj.fi_receive_tran_hdr_id ); 
												Ext.getCmp("win-pop-dtl").destroy();
											}
										},
										failure: function ( result, request) { 
											Ext.MessageBox.alert("แจ้งเตือน", result.responseText);		// connect
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

			} // popDtl
			
			new Ext.Panel ({
				title: "รายการรับเงิน",
				id: "GRID_DTL",
				autoScroll: true,
				style: { padding: "5px 5px" },
				height: 200,
				listeners: {
					afterrender: function( component ) {
						if( type == "view" ) {
							Ext.getCmp("add_dtl").setDisabled(true);
							Ext.getCmp("delete_dtl").setDisabled(true);
						} else {
							Ext.getCmp("add_dtl").setDisabled(false);
							Ext.getCmp("delete_dtl").setDisabled(false);
						}
						
						// ======================== Create Row ======================== //
						Ext.getCmp("tabpanel2").getEl().mask("Please wait...", "x-mask-loading");
						$.ajax({
							url: "api/List_ReceiveOther.php",
							type: "POST",
							data: {
								type: "fi_receive_tran_dtl",
								fi_receive_tran_hdr_id: fi_receive_tran_hdr_id
							},
							success: function(result) {
								
								Ext.getCmp("tabpanel2").getEl().unmask();
								var obj = $.parseJSON( result );
								if( obj.debug == true ) {
									
									var addBody				= "";
									Ext.objChk				= [];
									var sum_receive_amt		= 0;
									var sum_vat				= 0;
									var sum_tax				= 0;
									var sum_receive_net		= 0;
									
									if( obj.totalCount > 0 ) {
										$.each(obj.data , function( index, v ) {
											
											addBody		= "";
											// GEN TBODY
											Ext.objChk[v.id]	= "chk["+v.id+"]";
											
											sum_receive_amt		+= parseFloat(v.f_receive_amt);
											sum_vat				+= parseFloat(v.f_vat);
											sum_tax				+= parseFloat(v.f_tax);
											sum_receive_net		+= parseFloat(v.f_receive_net);
											
											addBody	+= "<tr>";
											addBody	+= "<td align='center'>"+v.no+"</td>";
											addBody	+= "<td align=\"center\"><input type=\"checkbox\" id='chk["+v.id+"]' value="+v.id+"></td>";
											addBody	+= "<td>"+v.c_name+"</td>";
											addBody	+= "<td align='right'>"+floatRenderer(floatMinus(v.f_receive_amt, 2))+"</td>";
											addBody	+= "<td align='center'>"+floatRenderer(floatMinus(v.f_vat_rate, 0))+"</td>";
											addBody	+= "<td align='right'>"+floatRenderer(floatMinus(v.f_vat, 2))+"</td>";
											addBody	+= "<td align='center'>"+floatRenderer(floatMinus(v.f_tax_rate, 0))+"</td>";
											addBody	+= "<td align='right'>"+floatRenderer(floatMinus(v.f_tax, 2))+"</td>";
											addBody	+= "<td align='right'>"+floatRenderer(floatMinus(v.f_receive_net, 2))+"</td>";
											addBody	+= "</tr>";
											
											$("#Ext_table > tbody:last").append( addBody );
										});
										
										addBody		= "";
										
										addBody	+= "<tr>";
										addBody	+= "<td align='right' colspan='3'><b>รวม</b></td>";
										addBody	+= "<td align='right'><b>"+floatRenderer(floatMinus(sum_receive_amt, 2))+"</b></td>";
										addBody	+= "<td></td>";
										addBody	+= "<td align='right'><b>"+floatRenderer(floatMinus(sum_vat, 2))+"</b></td>";
										addBody	+= "<td></td>";
										addBody	+= "<td align='right'><b>"+floatRenderer(floatMinus(sum_tax, 2))+"</b></td>";
										addBody	+= "<td align='right'><b>"+floatRenderer(floatMinus(sum_receive_net, 2))+"</b></td>";
										addBody	+= "</tr>";
										
										$("#Ext_table > tbody:last").append( addBody );
										
									} else { $("#Ext_table > tbody:last").append( "<td colspan='9'>ไม่พบข้อมูล</td>" ); }
								}
							}
						});
			        }
				},
				tbar: [{
					text: "ลบรายการที่เลือก",
					id: "delete_dtl",
					iconCls: "icon-clear",
					hidden: ( ena == 1 )? false : true,
					handler: function() {

						var msg		= "";
	       				var check	= false;
	       				var jsonArr = [];
	       				
	       				$( "input[id^=chk]" ).each(function( i, val ) {
	       					if(val.checked == true) {
	       						check	= true;
	       						jsonArr.push({ fi_receive_tran_dtl_id: val.value });
	       					}
	    				});
	       				
	    				if( check == false ) { msg += "- กรุณาเลือก รายการรับเงิน อย่างน้อย 1 รายการ<br>"; }
	    				
	    				if( msg == "" ) {

	    					Ext.getCmp("tabpanel2").getEl().mask("Please wait...", "x-mask-loading");					        					
	    					$.ajax({
								url: "api/mn_ReceiveOther.php",
								type: "POST",
								data: {
									mode: "DELETE_DTL",
									fi_receive_tran_hdr_id: fi_receive_tran_hdr_id,
									data: JSON.stringify(jsonArr)
								},
								success: function(result) {
									Ext.getCmp("tabpanel2").getEl().unmask();
									var data = $.parseJSON( result );
									if( data.success == true ) {
										Ext.Msg.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย");
										store.load();
										Ext_Show( fi_receive_tran_hdr_id );
									}
								}
							});

	    				} else { Ext.Msg.alert("แจ้งเตือน", msg); }
						
					}
				
				}, "-", {
					text : "ระบุรายการรับเงิน",
					id: "add_dtl",
					iconCls: "icon-add",
					hidden: ( ena == 1 )? false : true,
					handler: function(grid, rowIndex, colIndex) { popDtl(); }
				}],
				html:	"<div style=\"background:#fff; font: normal 13px tahoma; overflow:auto;\">" +
							"<form method=\"POST\">" +
								"<style>" +
									"#Ext_table tbody td, #Ext_table tbody th { border: 1px solid #eee; }" +
									"#Ext_table > tbody > tr:nth-child(even) {background: #FFF}" +
									"#Ext_table > tbody > tr:nth-child(odd) {background: #FCFCFC}" +
								"</style>" +
								"<table id=\"Ext_table\" border=\"0\" cellspacing=\"1\" cellpadding=\"0\" width=\"100%\">" +
									// headder
									"<thead class=\"x-grid3-header\">" +
										"<tr class=\"x-grid3-hd-row\" height=\"20\">" +
											"<td nowrap>ลำดับ</td>" +
											"<td width=4% nowrap><input type=\"checkbox\" onclick='checkAll(this.checked);'></td>" +
											"<td nowrap>รายการ</td>" +
											"<td nowrap>จำนวนเงิน</td>" +
											"<td nowrap>อัตราภาษี<br>มูลค่าเพิ่ม(%)</td>" +
											"<td nowrap>จำนวนเงินภาษีมูลค่าเพิ่ม</td>" +
											"<td nowrap>อัตราภาษี<br>หัก ณ ที่จ่าย(%)</td>" +
											"<td nowrap>จำนวนเงินภาษีหัก<br> ณ ที่จ่าย</td>" +
											"<td nowrap>จำนวนเงินสุทธิ</td>" +
										"</tr>" +
									"</thead>" +
									// body
									"<tbody></tbody>" +
								"</table>" +
							"</form>" +
						"</div>",
				renderTo: "EXT_GRID_DTL"
			});
		}; // GRID_DTL

		// คำนวณยอดเงินทั้งหมด
		function GRID_TOTAL() {
			
			$("#EXT_GRID_TOTAL").empty();
			
			new Ext.Panel ({
				title: "คำนวณยอดเงินทั้งหมด",
				id: "GRID_TOTAL",
				autoScroll: true,
				style: { padding: "5px 5px" },
				height: 300,
				listeners: {
					afterrender: function( component ) {
						
						Ext.getCmp("tabpanel2").getEl().mask("Please wait...", "x-mask-loading");
						
						// Check Load Store
						function chkData() {
							
							// loadmask
							var myComboStores	= [ vw_bh_contract ];
							var loaded			= true;
							Ext.each( myComboStores , function( stores ) { if(stores.chkMask == false) { loaded = false; } });
								
							if( loaded == true ) {
								
								/*============================= LOAD DATA =============================*/
								$.ajax({
									url: "api/List_ReceiveOther.php",
									type: "POST",
									data: {
										type: "List_Calculate",
										fi_receive_tran_hdr_id: fi_receive_tran_hdr_id
									},
									success: function(result) {
										
										Ext.getCmp("tabpanel2").getEl().unmask();
										var result	= $.parseJSON( result );
										
										Ext.getCmp("i_cont").setValue(result.data.i_cont);
										Ext.getCmp("i_cont").fn();
										Ext.getCmp("bh_contract_id").setValue(result.data.bh_contract_id);
										Ext.getCmp("f_receive_amt").setValue(result.data.f_receive_amt);
										Ext.getCmp("f_receive_amt").fn();
										Ext.getCmp("f_vat_amt").setValue(result.data.f_vat_amt);
										Ext.getCmp("f_vat_amt").fn();
										Ext.getCmp("f_net_cost").setValue(result.data.f_net_cost);
										Ext.getCmp("f_net_cost").fn();
										Ext.getCmp("f_tax_amt").setValue(result.data.f_tax_amt);
										Ext.getCmp("f_tax_amt").fn();
										Ext.getCmp("f_tax_net_cost").setValue(result.data.f_tax_net_cost);
										Ext.getCmp("f_tax_net_cost").fn();
									}
								});
								/*=====================================================================*/
							}
						};
						
						// บันทึกการคำนวณ
						function Calculate() {
						
							var msg		= "";

	    					if( Ext.getCmp("i_cont").checked == true ) {
	    						if(Ext.getCmp("bh_contract_id").getValue() == "" || Ext.getCmp("bh_contract_id").getValue() == null) {
	    							msg	+= "- กรุณาเลือก ระบุเลขที่สัญญา/e-GP<br>";
	    						}
	    					}

	    					if (msg == "") {
	    						
	    						Ext.getCmp("tabpanel2").getEl().mask("Please wait...", "x-mask-loading");
	    						Ext.Ajax.request({
	    							url: "api/mn_ReceiveOther.php",
	    							method: "POST",
	    							params: {
	    								mode: "CALCULATE",
	    								fi_receive_tran_hdr_id: fi_receive_tran_hdr_id,
	    								i_cont: ( Ext.getCmp("i_cont").checked == true )? 1 : 0,
	    								bh_contract_id: ( Ext.getCmp("i_cont").checked == true )? Ext.getCmp("bh_contract_id").getValue() : ""
	    							},
	    							success: function ( result, request ) {
	    								Ext.getCmp("tabpanel2").getEl().unmask();

	    								var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
	    								if ( jsonData.success == true ) {
	    	
	    									Ext.Msg.alert("แจ้งเตือน", "บันทึกเรียบร้อย");
	    									store.load();
	    									GRID_TOTAL();
	    									
	    								} else { Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg); }
	    							},
	    							failure: function ( result, request) { 
	    								Ext.MessageBox.alert("Failed", result.responseText);		// connect error
	    							}
	    						});
	    						
	    					} else { Ext.Msg.alert("แจ้งเตือน", msg); }
							
						};

						vw_bh_contract.load({
							params : { fi_receive_tran_hdr_id : fi_receive_tran_hdr_id },
							callback: function(records, operation, success) { if ( success == true ){ this.chkMask = true; chkData(); } }
						});
						
						/* =========================== RENDER UI =========================== */
						new Ext.form.Checkbox({
							id: "i_cont",
							boxLabel: "ระบุเลขที่สัญญา/e-GP",
							inputValue: 1,
							checked: false,
							listeners: {
								afterrender: function() {
									this.fn	= function() {
										if( this.checked == true ) {
											$("#span_cont").show();
										} else {
											$("#span_cont").hide();
										}
									}
								},
								check: function ( combo, newValue ) { this.fn(); }
							},
			            	renderTo: "Ext_i_cont"
						});
						
						new Ext.form.ComboBox({
							id: "bh_contract_id",
							mode: "local",
							store: vw_bh_contract,
							valueField: "id",
							displayField: "c_name",
							triggerAction: "all",
							forceSelection: true,
	    					selectOnFocus: true,
	    					typeAhead : false,
	    					emptyText: "- กรุณาเลือก เลขที่สัญญา / [เลขที่e-GP] / :: ชื่อสัญญา -",
							width: 300,
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
							},
							renderTo: "Ext_bh_contract_id"
						});
						
						new Ext.Button ({
							text: "คำนวณมูลค่าสุทธิ",
							id: "btn_cal",
							hidden: ( ena == 1 )? false : true,
							width : 30,
		                	handler: function() { Calculate(); },
							renderTo: "Ext_bu_cal"
						});
						
						// จำนวนเงินรวม
						new Ext.form.CompositeField({
							anchor: "100%",
							msgTarget: "under",
							items: [new Ext.form.TextField({
								id: "f_receive_amt",
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
							renderTo: "Ext_f_receive_amt"
						});

						// ภาษีมูลค่าเพิ่ม
						new Ext.form.CompositeField({
							anchor: "100%",
							msgTarget: "under",
							items: [new Ext.form.TextField({
								id: "f_vat_amt",
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
							renderTo: "Ext_f_vat_amt"
						});
						
						// จำนวนเงินรวมภาษีมูลค่าเพิ่ม
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
						
						// ภาษี หัก ณ ที่จ่าย
						new Ext.form.CompositeField({
							anchor: "100%",
							msgTarget: "under",
							items: [new Ext.form.TextField({
								id: "f_tax_amt",
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
							renderTo: "Ext_f_tax_amt"
						});
						
						// จำนวนเงินสุทธิ
						new Ext.form.CompositeField({
							anchor: "100%",
							msgTarget: "under",
							items: [new Ext.form.TextField({
								id: "f_tax_net_cost",
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
							renderTo: "Ext_f_tax_net_cost"
						});
						
						if( type == "view" ) {
							Ext.getCmp("btn_cal").setDisabled(true);
						} else {
							Ext.getCmp("btn_cal").setDisabled(false);
						}
						/* ================================================================= */
						
					}
				},
				html:	"<div style=\"background:#fff; overflow:auto;\">" +
							"<div style=\"font-size: 12px;\">" +
								"<table border=\"0\" cellspacing=\"2\" cellpadding=\"0\" width=\"100%\">" +
									"<colgroup width=\"25%\"></colgroup>" +
									"<colgroup width=\"75%\" style=\"background: #DFE8F6;\"></colgroup>" +
									"<tr><td align=\"right\"><b>:</b></td><td style=\"padding:1px 4px;\"><div id=\"Ext_i_cont\"></div></td></tr>" +
									"<tr id=\"span_cont\"><td align=\"right\"><b>:</b></td><td style=\"padding:1px 4px;\"><div id=\"Ext_bh_contract_id\"></div></td></tr>" +
									"<tr><td align=\"right\"><b>:</b></td><td style=\"padding:1px 4px;\"><div id=\"Ext_bu_cal\"></div></td></tr>" +
									"<tr><td colspan=\"2\" style=\"border-top: 1px solid #99BBE8;\"></td></tr>" +
									"<tr><td align=\"right\"><b>จำนวนเงินรวม :</b></td><td id=\"Ext_f_receive_amt\" style=\"padding:1px 4px;\"></td></tr>" +
									"<tr><td align=\"right\"><b>ภาษีมูลค่าเพิ่ม :</b></td><td id=\"Ext_f_vat_amt\" style=\"padding:1px 4px;\"></td></tr>" +
									"<tr><td align=\"right\"><b>จำนวนเงินรวมภาษีมูลค่าเพิ่ม :</b></td><td id=\"Ext_f_net_cost\" style=\"padding:1px 4px;\"></td></tr>" +
									"<tr><td align=\"right\"><b>ภาษี หัก ณ ที่จ่าย :</b></td><td id=\"Ext_f_tax_amt\" style=\"padding:1px 4px;\"></td></tr>" +
									"<tr><td align=\"right\"><b>จำนวนเงินสุทธิ :</b></td><td id=\"Ext_f_tax_net_cost\" style=\"padding:1px 4px;\"></td></tr>" +
								"</table>" +
							"</div>" +
						"</div>",
				buttonAlign: "center",
				buttons: [{
					text : "&nbsp;"+Ext.GLOBAL_BU_SAVE_TH+"ออกเลข RP&nbsp;",
					iconCls	: "icon-save",
					hidden: ( ena == 1 )? false : true,
					handler : function() {

						var msg		= "";

    					if (msg == "") {
    						
    						Ext.getCmp("tabpanel2").getEl().mask("Please wait...", "x-mask-loading");
    						Ext.Ajax.request({
    							url: "api/mn_ReceiveOther.php",
    							method: "POST",
    							params: {
    								mode: "GEN_CODE",
    								fi_receive_tran_hdr_id: fi_receive_tran_hdr_id
    							},
    							success: function ( result, request ) {
    								Ext.getCmp("tabpanel2").getEl().unmask();

    								var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
    								if ( jsonData.success == true ) {

    									Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg);
    									Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
    									Ext.getCmp("tabpanel2").setDisabled(true);
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
						Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
						Ext.getCmp("tabpanel2").setDisabled(true);
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
					GRID_DTL();
					GRID_TOTAL();
				}
			},
			items: [
			         { border: false, style: { padding: "5px 5px" }, html: "<div id=\"EXT_GRID_DTL\"></div>" },
			         { border: false, style: { padding: "5px 5px" }, html: "<div id=\"EXT_GRID_TOTAL\"></div>" }
			       ],
			renderTo: "Ext_Show"
		});
		
	}; // Ext_Show
	
	// ========================= cntPop ======================== //
	var cntPop = new Ext.ux.Poplov({
		fieldLabel: "รับเงินจาก",
		id: "dc_cnt_id['external']",
	    iconCls: "page_magnify",
	    store: vw_customer,
	    widthText: 300,
	    afterrender: function(){
	    	Ext.getCmp("tabpanel2").getEl().mask("Please wait...", "x-mask-loading");
			vw_customer.setBaseParam("filter","c_code");
			vw_customer.setBaseParam("value","");
	    	vw_customer.setBaseParam("mode", "SEARCH");
	    	vw_customer.load({ callback: function(records, operation, success) { if ( success == true ) {
				this.chkMask = true;
				Ext.getCmp("tabpanel2").getEl().unmask();
			} } });
	    },
 	    headerGrid: [{
 	    	header: "ID System", sortable: true, hidden:true, dataIndex: "id"
 	    }, {
 	    	id: "c_code", header: "รหัส", sortable: true, dataIndex: "c_code",
 	    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
 	    		metaData.attr = "style= \"cursor:pointer\";";
	    		return value;
			}
 	    }, {
 	    	id: "c_name", header: "เจ้าหนี้/ผู้ยืม", sortable: true, dataIndex: "c_name",
 	    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
 	    		metaData.attr = "style= \"cursor:pointer\";";
	    		return value;
			}
 	    }],
 	    isCellClickGrid:true,
 	    cellClickGrid : function(grid, rowIndex, columnIndex, e){

 			var record 		= grid.getStore().getAt(rowIndex);
 			
			Ext.getCmp("dc_cnt_id['external']").setValue(record.data.id);
			Ext.getCmp("dc_cnt_id['external']_Name").setValue(record.data.c_name);
			Ext.getCmp("c_other_addr['external']").setValue(record.data.c_address);
			
			Ext.getCmp("win-pop-lovdc_cnt_id['external']").destroy();
 	    }
	});
	// ============================================================ //

	// ========================= empPop ======================== //
	var empPop = new Ext.ux.Poplov({
		fieldLabel: "รับเงินจาก",
		id: "dc_emp_id['internal']",
	    iconCls: "page_magnify",
	    store: vw_detail_dc_emp,
	    widthText: 300,
	    afterrender: function(){
	    	Ext.getCmp("tabpanel2").getEl().mask("Please wait...", "x-mask-loading");
	    	vw_detail_dc_emp.setBaseParam("filter","c_code");
	    	vw_detail_dc_emp.setBaseParam("value","");
	    	vw_detail_dc_emp.setBaseParam("mode", "SEARCH");
	    	vw_detail_dc_emp.load({ callback: function(records, operation, success) { if ( success == true ) {
				this.chkMask = true;
				Ext.getCmp("tabpanel2").getEl().unmask();
			} } });
	    },
 	    headerGrid: [{
 	    	header: "ID System", sortable: true, hidden:true, dataIndex: "id"
 	    }, {
 	    	id: "c_code", header: "รหัส", sortable: true, dataIndex: "c_code",
 	    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
 	    		metaData.attr = "style= \"cursor:pointer\";";
	    		return value;
			}
 	    }, {
 	    	id: "c_name", header: "ชื่อ-สกุล", sortable: true, dataIndex: "c_name",
 	    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
 	    		metaData.attr = "style= \"cursor:pointer\";";
	    		return value;
			}
 	    }, {
 	    	id: "cost_name", header: "หน่วยงานที่สังกัด", sortable: true, dataIndex: "cost_name",
 	    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
 	    		metaData.attr = "style= \"cursor:pointer\";";
	    		return value;
			}
 	    }],
 	    isCellClickGrid:true,
 	    cellClickGrid : function(grid, rowIndex, columnIndex, e){

 			var record 		= grid.getStore().getAt(rowIndex);
 			
			Ext.getCmp("dc_emp_id['internal']").setValue(record.data.id);
			Ext.getCmp("dc_emp_id['internal']_Name").setValue(record.data.c_name);
			Ext.getCmp("c_other_addr['internal']").setValue(record.data.c_address);
			
			Ext.getCmp("win-pop-lovdc_emp_id['internal']").destroy();
 	    }
	});
	// ============================================================ //
	
	// ========================= waitPop ======================== //
	var waitPop = new Ext.ux.Poplov({
		fieldLabel: "เลขที่รับเงินรอสะสาง",
		id: "fi_receive_wait_dtl_id['doc']",
	    iconCls: "page_magnify",
	    store: fi_receive_wait_dtl,
	    widthText: 300,
	    afterrender: function(){
	    	Ext.getCmp("tabpanel2").getEl().mask("Please wait...", "x-mask-loading");
	    	fi_receive_wait_dtl.setBaseParam("filter","c_code");
	    	fi_receive_wait_dtl.setBaseParam("value","");
	    	fi_receive_wait_dtl.setBaseParam("mode", "SEARCH");
	    	fi_receive_wait_dtl.load({ callback: function(records, operation, success) { if ( success == true ) {
				this.chkMask = true;
				Ext.getCmp("tabpanel2").getEl().unmask();
			} } });
	    },
 	    headerGrid: [{
 	    	header: "ID System", sortable: true, hidden:true, dataIndex: "id"
 	    }, {
 	    	id: "c_code", header: "รหัสรับเงินรอสะสาง", sortable: true, dataIndex: "c_code",
 	    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
 	    		metaData.attr = "style= \"cursor:pointer\";";
	    		return value;
			}
 	    }, {
 	    	id: "c_name", header: "ชื่อบัญชี", sortable: true, dataIndex: "c_name",
 	    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
 	    		metaData.attr = "style= \"cursor:pointer\";";
	    		return value;
			}
 	    }, {
			id: "f_receive_amt", header: "จำนวนเงิน", sortable: true, align: "center", dataIndex: "f_receive_amt",
			renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				metaData.attr = "style= \"text-align:right\";";
				return (value > 0)? floatRenderer(floatMinus(value, 2)) : "0.00";
			}
		}, {
    		id: "d_deposit_date", header: "วันที่ฝากเข้าบัญชี", sortable: true, align: "center", dataIndex: "d_deposit_date",
			renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				return (value != "")? shortThaiDate(value) : "";
			}
		}],
 	    isCellClickGrid:true,
 	    cellClickGrid : function(grid, rowIndex, columnIndex, e){

 			var record 		= grid.getStore().getAt(rowIndex);
 			
			Ext.getCmp("fi_receive_wait_dtl_id['doc']").setValue(record.data.id);
			Ext.getCmp("fi_receive_wait_dtl_id['doc']_Name").setValue(record.data.c_name);
			
			Ext.getCmp("win-pop-lovfi_receive_wait_dtl_id['doc']").destroy();
 	    }
	});
	// ============================================================ //
	
	//======================================= panelForm =======================================//
	var panelForm = new Ext.Panel ({
		region: "center",
		title: "ข้อมูล"+title_panel,
		id: "tabpanel2",
		border: false,
		disabled: true,
		stripeRows: true,
		loadMask: true,
		store: store,
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
						xtype: "displayfield",
						fieldLabel: "เลขที่รับ/ใบเสร็จรับเงิน",
						name: "c_code"
					}, {
						xtype: "displayfield",
						fieldLabel: "เลขที่พิมพ์ใบเสร็จรับเงิน",
						name: "print_code"
					}, new Ext.form.ComboBox({
						fieldLabel: "ประเภทลูกหนี้",
						id: "dc_creditor_type_id",
						name: "dc_creditor_type_id",
						mode: "local",
						store: dc_creditor_type,
						valueField: "id",
						displayField: "c_name",
						triggerAction: "all",
						forceSelection: true,
    					selectOnFocus: true,
    					typeAhead : false,
    					emptyText: "กรุณาเลือก...",
						width: 200,
						value: "3",
    					listeners: {
    						afterrender: function() {
								this.fn	= function() {
									if( this.getValue() == 4 ) {
										
										// บุคคลทั่วไป
		    							Ext.getCmp("c_other_name['general']").show();
		    							Ext.getCmp("c_other_addr['general']").show();
		    							Ext.getCmp("c_tax_value['general']").show();
		    							Ext.getCmp("i_branch['general']").show();
		    							Ext.getCmp("c_branch['general']").show();
		    							
		    							// ผู้ขาย/ผู้รับจ้าง
		    							Ext.getCmp("span_cnt['external']").hide();
		    							Ext.getCmp("c_other_addr['external']").hide();
		    							
		    							// บุคคลภายใน
		    							Ext.getCmp("span_emp['internal']").hide();
		    							Ext.getCmp("c_other_addr['internal']").hide();
		    							
									} else if( this.getValue() == 1 ) {
										
										// บุคคลทั่วไป
		    							Ext.getCmp("c_other_name['general']").hide();
		    							Ext.getCmp("c_other_addr['general']").hide();
		    							Ext.getCmp("c_tax_value['general']").hide();
		    							Ext.getCmp("i_branch['general']").hide();
		    							Ext.getCmp("c_branch['general']").hide();
		    							
		    							// ผู้ขาย/ผู้รับจ้าง
		    							Ext.getCmp("span_cnt['external']").show();
		    							Ext.getCmp("c_other_addr['external']").show();
		    							
		    							// บุคคลภายใน
		    							Ext.getCmp("span_emp['internal']").hide();
		    							Ext.getCmp("c_other_addr['internal']").hide();
		    							
									} else if( this.getValue() == 3 || this.getValue() == "" ) {
										
										this.reset();
										
										// บุคคลทั่วไป
										Ext.getCmp("c_other_name['general']").hide();
		    							Ext.getCmp("c_other_addr['general']").hide();
		    							Ext.getCmp("c_tax_value['general']").hide();
		    							Ext.getCmp("i_branch['general']").hide();
		    							Ext.getCmp("c_branch['general']").hide();
		    							
		    							// ผู้ขาย/ผู้รับจ้าง
		    							Ext.getCmp("span_cnt['external']").hide();
		    							Ext.getCmp("c_other_addr['external']").hide();
		    							
		    							// บุคคลภายใน
		    							Ext.getCmp("span_emp['internal']").show();
		    							Ext.getCmp("c_other_addr['internal']").show();
									}
								}
							},
							Change: function(value) { this.fn(); },
							beforequery: function(q) {
								if (q.query) {
									var length = q.query.length;
									q.query = new RegExp(Ext.escapeRe(q.query));
									q.query.length = length;
								}
							},
							blur: function() { this.getStore().clearFilter(); }
						}
					}),
					// ================================ บุคคลทั่วไป ================================ //
					{
						xtype: "textfield",
						fieldLabel: "รับเงินจาก",
						id: "c_other_name['general']",
						hidden: true,
						width: 300
					}, {
						xtype: "textarea",
						fieldLabel: "ที่อยู่",
						id: "c_other_addr['general']",
						hidden: true,
						width: 300
					}, {
						xtype: "textfield",
						fieldLabel: "เลขประจำตัวผู้เสียภาษีอากร",
						id: "c_tax_value['general']",
						hidden: true,
						width: 300
					}, {
						xtype: "radiogroup",
						fieldLabel: "สถานประกอบการ",
						id: "i_branch['general']",
						hidden: true,
						columns: [ 50, 100, 100 ],
						items: [
							{ boxLabel: "อื่นๆ", name: "i_branch['general']", checked: true, inputValue: "3" },
							{ boxLabel: "สำนักงานใหญ่", name: "i_branch['general']", inputValue: "1" },
							{ boxLabel: "สาขาที่", name: "i_branch['general']", inputValue: "2" }
						],
						listeners: {
							afterrender: function() {
								this.fn	= function() {
									if( this.getValue().inputValue == "2" ) {
										Ext.getCmp("c_branch['general']").enable();
									} else {
										Ext.getCmp("c_branch['general']").disable();
									}
								}
							},
							Change: function(value) { this.fn(); }
						}
					}, {
						xtype: "idcardfield",
						fieldLabel: "&nbsp;",
						id: "c_branch['general']",
						disabled: true,
						hidden: true,
						width: 200
					},
					// ======================================================================= //
					
					// ============================== ผู้ขาย/ผู้รับจ้าง =============================== //
					{
						xtype: "compositefield",
						id: "span_cnt['external']",
						anchor: "100%",
						msgTarget: "under",
						hidden: true,
						items: [cntPop.mini]
	                }, {
						xtype: "textarea",
						fieldLabel: "ที่อยู่",
						id: "c_other_addr['external']",
						readOnly: true,
						hidden: true,
						width: 300
					},
					// ======================================================================= //
					
	                // ================================ บุคคลภายใน =============================== //
	                {
						xtype: "compositefield",
						id: "span_emp['internal']",
						anchor: "100%",
						msgTarget: "under",
						hidden: true,
						items: [empPop.mini]
	                }, {
						xtype: "textarea",
						fieldLabel: "ที่อยู่",
						id: "c_other_addr['internal']",
						readOnly: true,
						hidden: true,
						width: 300
					},
	                // ======================================================================= //
	                new Ext.form.ComboBox({
						fieldLabel: "หน่วยธุรกิจ",
						id: "dc_area_id",
						name: "dc_area_id",
						mode: "local",
						store: dc_business_area,
						valueField: "id",
						displayField: "c_name",
						triggerAction: "all",
						forceSelection: true,
    					selectOnFocus: true,
    					typeAhead : false,
    					emptyText: "กรุณาเลือก...",
						width: 300,
    					listeners: {
    						afterrender: function() {
								this.fn	= function() { if( this.getValue() == "" ) { this.reset(); } }
							},
							Change: function(value) { this.fn(); },
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
						fieldLabel: "ประเภทใบเสร็จรับเงิน",
						id: "i_type_doc",
						name: "i_type_doc",
						mode: "local",
						store: new Ext.data.SimpleStore({
			            	fields: [ "id", "c_name" ],
							data: [
							       [ "1", "ใบเสร็จรับเงิน/ใบกำกับภาษี" ],
							       [ "2", "ใบเสร็จรับเงิน" ],
							       [ "3", "ใบเสร็จรับเงิน/ใบกำกับภาษี(อย่างย่อ)" ],
							       [ "5", "ไม่ออกใบเสร็จรับเงิน" ]
							      ]
						}),
						valueField: "id",
						displayField: "c_name",
						triggerAction: "all",
						forceSelection: true,
    					selectOnFocus: true,
    					typeAhead : false,
    					emptyText: "กรุณาเลือก...",
						width: 300,
    					listeners: {
    						afterrender: function() {
								this.fn	= function() { if( this.getValue() == "" ) { this.reset(); } }
							},
							Change: function(value) { this.fn(); },
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
						xtype: "textfield",
						fieldLabel: "เลขที่รับเงินอ้างอิง",
						id: "c_doc_ref",
						name: "c_doc_ref",
						width: 200
					}, new Ext.form.ComboBox({
						fieldLabel: "ประเภทการรับเงิน",
						id: "fi_pymt_voucher_type_id",
						name: "fi_pymt_voucher_type_id",
						mode: "local",
						store: new Ext.data.SimpleStore({
    		            	fields: [ "id", "c_name" ],
    						data: [
    						       [ "1", "เงินสด" ],
    						       [ "2", "เช็ค" ],
    						       [ "3", "โอนเงินผ่านธนาคาร" ],
    						       [ "7", "เงินรอแจ้งหักล้าง" ],
    						       [ "8", "ใบสำคัญ(C)" ]
    						]
    					}),
						valueField: "id",
						displayField: "c_name",
						triggerAction: "all",
						forceSelection: true,
    					selectOnFocus: true,
    					typeAhead : false,
    					emptyText: "กรุณาเลือก...",
    					value: "1",
						width: 200,
    					listeners: {
    						afterrender: function() {
								this.fn	= function() {
									if( this.getValue() == "2" ) { // เช็ค
									
										// เช็ค
										Ext.getCmp("c_cheq_code['cheqe']").show();
										Ext.getCmp("dc_bank_id['cheqe']").show();
										Ext.getCmp("dc_bank_branch_id['cheqe']").show();
										Ext.getCmp("span_date['cheqe']").show();
										
										// โอนเงินผ่านธนาคาร
										Ext.getCmp("dc_bank_acc_id['bank']").hide();
										
										// เงินรอแจ้งหักล้าง
										Ext.getCmp("span_wait['doc']").hide();
										
									} else if( this.getValue() == "3" ) { // โอนเงินผ่านธนาคาร
									
										// เช็ค
										Ext.getCmp("c_cheq_code['cheqe']").hide();
										Ext.getCmp("dc_bank_id['cheqe']").hide();
										Ext.getCmp("dc_bank_branch_id['cheqe']").hide();
										Ext.getCmp("span_date['cheqe']").hide();
										
										// โอนเงินผ่านธนาคาร
										Ext.getCmp("dc_bank_acc_id['bank']").show();
										
										// เงินรอแจ้งหักล้าง
										Ext.getCmp("span_wait['doc']").hide();
										
									} else if( this.getValue() == "7" ) { // เงินรอแจ้งหักล้าง
									
										// เช็ค
										Ext.getCmp("c_cheq_code['cheqe']").hide();
										Ext.getCmp("dc_bank_id['cheqe']").hide();
										Ext.getCmp("dc_bank_branch_id['cheqe']").hide();
										Ext.getCmp("span_date['cheqe']").hide();
										
										// โอนเงินผ่านธนาคาร
										Ext.getCmp("dc_bank_acc_id['bank']").hide();
										
										// เงินรอแจ้งหักล้าง
										Ext.getCmp("span_wait['doc']").show();
										
									} else if ( this.getValue() == "" || this.getValue() == "1" || this.getValue() == "8" ) {
										
										if( this.getValue() != "8") { this.reset(); }
										
										// เช็ค
										Ext.getCmp("c_cheq_code['cheqe']").hide();
										Ext.getCmp("dc_bank_id['cheqe']").hide();
										Ext.getCmp("dc_bank_branch_id['cheqe']").hide();
										Ext.getCmp("span_date['cheqe']").hide();
										
										// โอนเงินผ่านธนาคาร
										Ext.getCmp("dc_bank_acc_id['bank']").hide();
										
										// เงินรอแจ้งหักล้าง
										Ext.getCmp("span_wait['doc']").hide();
										
									}
								}
							},
							Change: function(value) { this.fn(); },
							beforequery: function(q) {
								if (q.query) {
									var length = q.query.length;
									q.query = new RegExp(Ext.escapeRe(q.query));
									q.query.length = length;
								}
							},
							blur: function() { this.getStore().clearFilter(); }
						}
					}),
					// ================================= เช็ค ================================== //
					{
						xtype: "textfield",
						fieldLabel: "เลขที่เช็ค",
						id: "c_cheq_code['cheqe']",
						hidden: true,
						width: 250
					}, new Ext.form.ComboBox({
						fieldLabel: "ธนาคาร",
						id: "dc_bank_id['cheqe']",
						mode: "local",
						store: dc_bank,
						valueField: "id",
						displayField: "c_name",
						triggerAction: "all",
						forceSelection: true,
    					selectOnFocus: true,
    					typeAhead : false,
    					emptyText: "กรุณาเลือก...",
						width: 250,
						hidden: true,
    					listeners: {
    						afterrender: function() {
								this.fn	= function() {
									if( this.getValue() == "" ) {
										this.reset();
										dc_bank_branch.setBaseParam("dc_bank_id", "");
									} else {
										dc_bank_branch.setBaseParam("dc_bank_id", this.getValue());
									}
									Ext.getCmp("dc_bank_branch_id['cheqe']").setValue("");
									dc_bank_branch.load();
								}
							},
							Change: function(value) { this.fn(); },
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
						fieldLabel: "สาขา",
						id: "dc_bank_branch_id['cheqe']",
						mode: "local",
						store: dc_bank_branch,
						valueField: "id",
						displayField: "c_name",
						triggerAction: "all",
						forceSelection: true,
    					selectOnFocus: true,
    					typeAhead : false,
    					emptyText: "กรุณาเลือก...",
						width: 250,
						hidden: true,
    					listeners: {
    						afterrender: function() {
								this.fn	= function() { if( this.getValue() == "" ) { this.reset(); } }
							},
							Change: function(value) { this.fn(); },
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
						xtype: "compositefield",
						fieldLabel: "วันที่ออกเช็ค",
						id: "span_date['cheqe']",
						hidden: true,
						anchor: "100%",
						msgTarget: "under",
						items: [{
							xtype: "datefield",
							id: "d_cheq_date['cheqe']",
							name: "d_cheq_date",
						}, {
							xtype: "displayfield",
							value: "<span style=\"color:red;\">** กรุณาระบุวันที่ออกเช็ค ในกรณีที่เลือกประเภทการรับเงินเป็นเช็ค</span>"
						}]
	                },
					// ======================================================================= //
					
					// ============================= โอนเงินผ่านธนาคาร ============================= //
					new Ext.form.ComboBox({
						fieldLabel: "เลขที่บัญชีรับโอน",
						id: "dc_bank_acc_id['bank']",
						mode: "local",
						store: vw_bank_branch_deposit,
						valueField: "id",
						displayField: "c_name",
						triggerAction: "all",
						forceSelection: true,
    					selectOnFocus: true,
    					typeAhead : false,
    					emptyText: "กรุณาเลือก...",
						width: 300,
						hidden: true,
    					listeners: {
    						afterrender: function() {
								this.fn	= function() { if( this.getValue() == "" ) { this.reset(); } }
							},
							Change: function(value) { this.fn(); },
							beforequery: function(q) {
								if (q.query) {
									var length = q.query.length;
									q.query = new RegExp(Ext.escapeRe(q.query));
									q.query.length = length;
								}
							},
							blur: function() { this.getStore().clearFilter(); }
						}
					}),
					// ======================================================================= //
					
					// ============================== เงินรอแจ้งหักล้าง ============================== //
					{
						xtype: "compositefield",
						id: "span_wait['doc']",
						anchor: "100%",
						msgTarget: "under",
						hidden: true,
						items: [waitPop.mini]
	                },
					// ======================================================================= //
					{
						xtype: "datefield",
						fieldLabel: "วันที่รับเงิน",
						id: "d_doc_date",
						name: "d_doc_date"
					}, {
						xtype: "textarea",
						fieldLabel: "รายละเอียดการรับเงิน",
						id: "c_comment",
						name: "c_comment",
						width: 300
					}, {
						fieldLabel: "สถานะ",
						id: "i_is_return",
						xtype: "radiogroup",
						columns: [ 65, 100 ],
						items: [
							{ boxLabel: "ไม่ส่งคืน", checked: true, name: "i_is_return", inputValue: 0 },
							{ boxLabel: "รอส่งคืน/นำส่ง", name: "i_is_return", inputValue: 1 }
						]
					}, {
						xtype: "checkbox",
						fieldLabel: "&nbsp;",
						id: "i_print_eng",
						name: "i_print_eng",
						boxLabel: "พิมพ์ใบเสร็จรับเงินเป็นภาษาอังกฤษ",
						checked: false,
						inputValue: 1
					}]
				}]
			}],
			buttonAlign: "left",
			buttons: [{
				text : "&nbsp;"+Ext.GLOBAL_BU_SAVE_TH+"&nbsp;",
				hidden: ( ena == 1 )? false : true,
				iconCls	: "icon-save",
				handler : function() {
					
					var msg		= "";
					
					var c_other_name	= "";
					var c_other_addr	= "";
					var c_tax_value		= "";
					var i_branch		= "";
					var c_branch		= "";
					var dc_cnt_id		= "";
					var dc_emp_id		= "";
					
					var c_cheq_code				= "";
					var dc_bank_id				= "";
					var dc_bank_branch_id		= "";
					var d_cheq_date				= "";
					var dc_bank_acc_id			= "";
					var fi_receive_wait_dtl_id	= "";

					if( Ext.getCmp("dc_creditor_type_id").getValue() == 4 ) { // บุคคลทั่วไป
						
						c_other_name	= Ext.getCmp("c_other_name['general']").getValue();
						c_other_addr	= Ext.getCmp("c_other_addr['general']").getValue();
						c_tax_value		= Ext.getCmp("c_tax_value['general']").getValue();
						i_branch		= Ext.getCmp("i_branch['general']").getValue().inputValue;
						c_branch		= Ext.getCmp("c_branch['general']").getValue();
						
						if( c_other_name == "" ) { msg	+= "- กรุณากรอก รับเงินจาก<br>"; }
						if( c_other_addr == "" ) { msg	+= "- กรุณากรอก ที่อยู่<br>"; }
						if( c_tax_value == "" ) { msg	+= "- กรุณากรอก เลขประจำตัวผู้เสียภาษีอากร<br>"; }
						if( i_branch == 2 ) {
							if( c_branch == "" ) { msg += "- กรุณากรอก สาขาที่<br>"; }
						} else {
							c_branch	= "";
						}
						
					} else if( Ext.getCmp("dc_creditor_type_id").getValue() == 1 ) { // ผู้ขาย/ผู้รับจ้าง
						
						dc_cnt_id	= Ext.getCmp("dc_cnt_id['external']").getValue();
						c_other_addr= Ext.getCmp("c_other_addr['external']").getValue();
						
						if( dc_cnt_id == "" ) { msg += "- กรุณาเลือก รับเงินจาก<br>"; }
						if( c_other_addr == "" ) { msg += "- กรุณากรอก ที่อยู่<br>"; }
						
					} else if( Ext.getCmp("dc_creditor_type_id").getValue() == 3 ) { // บุคคลภายใน
						
						dc_emp_id	= Ext.getCmp("dc_emp_id['internal']").getValue();
						c_other_addr= Ext.getCmp("c_other_addr['internal']").getValue();
						
						if( dc_emp_id == "" ) { msg += "- กรุณาเลือก รับเงินจาก<br>"; }
						if( c_other_addr == "" ) { msg += "- กรุณากรอก ที่อยู่<br>"; }
						
					}
					if( Ext.getCmp("dc_area_id").getValue() == "" ) { msg	+= "- กรุณาเลือก หน่วยธุรกิจ<br>"; }
					if( Ext.getCmp("i_type_doc").getValue() == "" ) { msg	+= "- กรุณาเลือก ประเภทใบเสร็จรับเงิน<br>"; }
					if( Ext.getCmp("c_doc_ref").getValue() == "" ) { msg	+= "- กรุณากรอก เลขที่รับเงินอ้างอิง<br>"; }
					if( Ext.getCmp("fi_pymt_voucher_type_id").getValue() == 2 ) { // เช็ค
						
						var c_cheq_code				= Ext.getCmp("c_cheq_code['cheqe']").getValue();
						var dc_bank_id				= Ext.getCmp("dc_bank_id['cheqe']").getValue();
						var dc_bank_branch_id		= Ext.getCmp("dc_bank_branch_id['cheqe']").getValue();
						var d_cheq_date				= Ext.util.Format.date(Ext.getCmp("d_cheq_date['cheqe']").getValue(), "Y-m-d");
						
						if( c_cheq_code == "" ) { msg += "- กรุณากรอก เลขที่เช็ค<br>"; }
						if( dc_bank_id == "" ) { msg += "- กรุณาเลือก ธนาคาร<br>"; }
						if( dc_bank_branch_id == "" ) { msg += "- กรุณาเลือก สาขา<br>"; }
						if( d_cheq_date == "" ) { msg += "- กรุณากรอก วันที่ออกเช็ค<br>"; }
						
					} else if( Ext.getCmp("fi_pymt_voucher_type_id").getValue() == 3 ) { // โอนเงินผ่านธนาคาร
						
						dc_bank_acc_id	= Ext.getCmp("dc_bank_acc_id['bank']").getValue();
						
						if( dc_bank_acc_id == "" ) { msg += "- กรุณาเลือก เลขที่บัญชีรับโอน<br>"; }
						
					} else if( Ext.getCmp("fi_pymt_voucher_type_id").getValue() == 7 ) { // เงินรอแจ้งหักล้าง

						fi_receive_wait_dtl_id	= Ext.getCmp("fi_receive_wait_dtl_id['doc']").getValue();
						
						if( fi_receive_wait_dtl_id == "" ) { msg += "- กรุณาเลือก เลขที่รับเงินรอสะสาง<br>"; }
						
					}
					if( Ext.getCmp("d_doc_date").getValue() == "" ) { msg	+= "- กรุณากรอก วันที่รับเงิน<br>"; }
					
					if (msg == "") {
						Ext.getCmp("tabpanel2").getEl().mask("Please wait...", "x-mask-loading");
						Ext.Ajax.request({
							url: "api/mn_ReceiveOther.php",
							method: "POST",
							params: {
								mode: Ext.getCmp("role-form-mode").getValue(),
								id: Ext.getCmp("id").getValue(),
								dc_creditor_type_id: Ext.getCmp("dc_creditor_type_id").getValue(),
								c_other_name: c_other_name,
								c_other_addr: c_other_addr,
								c_tax_value: c_tax_value,
								i_branch: i_branch,
								c_branch: c_branch,
								dc_cnt_id: dc_cnt_id,
								dc_emp_id: dc_emp_id,
								dc_area_id: Ext.getCmp("dc_area_id").getValue(),
								i_type_doc: Ext.getCmp("i_type_doc").getValue(),
								c_doc_ref: Ext.getCmp("c_doc_ref").getValue(),
								fi_pymt_voucher_type_id: Ext.getCmp("fi_pymt_voucher_type_id").getValue(),
								c_cheq_code: c_cheq_code,
								dc_bank_id: dc_bank_id,
								dc_bank_branch_id: dc_bank_branch_id,
								d_cheq_date: d_cheq_date,
								dc_bank_acc_id: dc_bank_acc_id,
								fi_receive_wait_dtl_id: fi_receive_wait_dtl_id,
								d_doc_date: Ext.util.Format.date(Ext.getCmp("d_doc_date").getValue(), "Y-m-d"),
								c_comment: Ext.getCmp("c_comment").getValue(),
								i_is_return: Ext.getCmp("i_is_return").getValue().inputValue,
								i_print_eng: ( Ext.getCmp("i_print_eng").checked == true )? 1 : 0
							},
							success: function ( result, request ) {
								Ext.getCmp("tabpanel2").getEl().unmask();
								var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
								if ( jsonData.success == true ) {

									Ext.Msg.alert("Success", "บันทึกเรียบร้อย");
									store.load();
									Ext_Show( jsonData.fi_receive_tran_hdr_id );
									
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
					Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
					Ext.getCmp("tabpanel2").setDisabled(true);
				}
			}]
		}, { html: "<div id=\"Ext_Show\"></div>", border: false }]
	}); // panelForm
	
	/*====================== CENTER ======================*/
	center = new Ext.TabPanel({
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
	/*====================== RENDER ======================*/
	new Ext.Viewport({
		layout: "border",
		items: [ center ]
	});
});
