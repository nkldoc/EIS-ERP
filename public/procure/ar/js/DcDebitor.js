Ext.onReady(function() {
	Ext.QuickTips.init();

	/*===============================================*/
	var title_panel	= "ผู้ขาย/รับจ้าง";
	/*===============================================*/
	
	var store = new Ext.data.JsonStore({
		storeId: "myStore",
	    autoDestroy: true,
		autoLoad: true,
	    url : "api/List_DcCreditor.php",
	    root: "data",
	    baseParams: { type: "cnt", i_read:user_right_read }, //Permission i_read
	    idProperty: "id",
		totalProperty: "totalCount",
		fields: [
			{ name : "no" },
			{ name : "id" },
			{ name : "dc_cnt_type_id" },
			{ name : "dc_cnt_type_name" },
			{ name : "dc_acc_id" },
			{ name : "dc_acc_id_cred" },
			{ name : "dc_tax_customer_id" },
			{ name : "dc_tax_customer_name" },
			{ name : "dc_cost_id" },
			{ name : "dc_title_id" },
			{ name : "c_old_code" },
			{ name : "c_code" },
			{ name : "c_name" },
			{ name : "c_surname" },
			{ name : "c_address" },
			{ name : "c_telephone" },
			{ name : "c_mobile" },
			{ name : "c_fax" },
			{ name : "c_website" },
			{ name : "c_email" },
			{ name : "c_tax_value" },
			{ name : "dc_bank_id" },
			{ name : "dc_bank_branch_id" },
			{ name : "c_bank_no" },
			{ name : "dc_ref_type_id" },
			{ name : "c_ref_value" },
			{ name : "i_is_debtor" },
			{ name : "i_group_cnt" },
			{ name : "i_is_creditor" },
			{ name : "i_is_agency" },
			{ name : "f_debt_amount" },
			{ name : "f_credit_amount" },
			{ name : "parent_id" },
			{ name : "order_id" },
			{ name : "i_is_fixed" },
			{ name : "c_comment" },
			{ name : "i_company_pay_tax" },
			{ name : "i_enable" },
			{ name : "i_is_ins" },
			{ name : "due_bill" },
			{ name : "dc_cost_old_id" },
			{ name : "i_tax_fix" },
			{ name : "dc_tax_id" },
			{ name : "f_dec_rate" },
			{ name : "f_tax_reduce" },
			{ name : "dc_disc_type_id" },
			{ name : "dc_bank_acc_dfl_id" },
			{ name : "i_key_later" },
			{ name : "c_name_inv" },
			{ name : "c_address_inv" },
			{ name : "c_add_bank1" },
			{ name : "c_add_bank2" },
			{ name : "c_add_bank3" },
			{ name : "c_add_bank4" },
			{ name : "c_address_inv2" },
			{ name : "cnt_type" },
			{ name : "title_name" },
			{ name : "dc_bank_acc" },
			{ name : "f_cnt_tax" },
			{ name : "dc_tax_name" },
			{ name : "i_dec_person" },
			{ name : "i_credit_card" },
			{ name : "c_credit_name" },
			{ name : "i_daily_worker" },
			{ name : "i_branch" },
			{ name : "branch_name" },
			{ name : "c_branch" },
			{ name : "i_delete" },
			{ name : "dc_user_create_id" },
			{ name : "dc_user_create_cost_id" },
			{ name : "d_create" },
			{ name : "dc_user_update_id" },
			{ name : "dc_user_update_cost_id" },
			{ name : "d_update" }
		]
	});
	
	var store_tax_cus	= new Ext.data.JsonStore({
		autoDestroy: true,
		autoLoad: true,
		url: "api/All_DcCreditor.php",
		baseParams: { type: "tax_cus" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ]
	});
	
	var store_tax_cus_all	= new Ext.data.JsonStore({
		autoDestroy: true,
		autoLoad: true,
		url: "api/All_DcCreditor.php",
		baseParams: { type: "tax_cus_all" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ],
		listeners: {
	        load: function(t, records, options) {
	        	Ext.getCmp("tax_customer_id").setValue(0);
	        }
		}
	});
	
	var store_cnt_type	= new Ext.data.JsonStore({
		autoDestroy: true,
		autoLoad: true,
		url: "api/All_DcCreditor.php",
		baseParams: { type: "cnt_type" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ]
	});
	
	var store_title	= new Ext.data.JsonStore({
		autoDestroy: true,
		autoLoad: true,
		url: "api/All_DcCreditor.php",
		baseParams: { type: "title" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ]
	});
	
	var store_daily_worker	= new Ext.data.JsonStore({
		autoDestroy: true,
		autoLoad: true,
		url: "api/All_DcCreditor.php",
		baseParams: { type: "daily_worker" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ],
	    listeners: {
	        load: function(t, records, options) {
	        	Ext.getCmp("i_daily_worker").setValue(6);
	        }
		}
	});
	
	var store_disc_type	= new Ext.data.JsonStore({
		autoDestroy: true,
		autoLoad: true,
		url: "api/All_DcCreditor.php",
		baseParams: { type: "disc_type" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ],
	    listeners: {
	        load: function(t, records, options) {
	        	Ext.getCmp("parent_id").setValue(2);
	        	Ext.getCmp("order_id").setValue(2);
	        }
		}
	});
	
	var store_acc	= new Ext.data.JsonStore({
		autoDestroy: true,
		autoLoad: true,
		url: "api/All_DcCreditor.php",
		baseParams: { type: "dc_acc" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ]
	});
	
	var store_tax	= new Ext.data.JsonStore({
		autoDestroy: true,
		autoLoad: true,
		url: "api/All_DcCreditor.php",
		baseParams: { type: "tax" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ]
	});
	
	var store_bank	= new Ext.data.JsonStore({
		url: "../dc/api/All_DcBankAcc.php",
		baseParams: { type: "bank" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ]
	});
	
	var store_bank_branch	= new Ext.data.JsonStore({
		url: "../dc/api/All_DcBankAcc.php",
		baseParams: { type: "bank_branch" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ]
	});
	
	var store_bank_deposit_type	= new Ext.data.JsonStore({
		url: "../dc/api/All_DcBankAcc.php",
		baseParams: { type: "bank_deposit_type" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ]
	});
	
	var store_area	= new Ext.data.JsonStore({
		url: "../dc/api/All_DcBankAcc.php",
		baseParams: { type: "area" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ]
	});
	
	var store_bank_acc = new Ext.data.JsonStore({
		url: "../dc/api/All_DcBankAcc.php",
	    root: "data",
	    baseParams: { type: "acc" },
		fields: [
		    { name : "id" },
		    { name : "c_name" }
		]
	});
	
	var store_account = new Ext.data.JsonStore({
		storeId: "myStore",
	    url : "api/List_DcCreditor.php",
	    root: "data",
	    baseParams: { type: "bank", i_read:user_right_read }, //Permission i_read
	    idProperty: "id",
		fields: [
			{ name : "bank_no" },
			{ name : "bank_id" },
			{ name : "bank_dc_bank_deposit_type_id" },
			{ name : "bank_dc_bank_deposit_type_name" },
			{ name : "bank_dc_bank_id" },
			{ name : "bank_dc_bank_name" },
			{ name : "bank_dc_bank_branch_id" },
			{ name : "bank_dc_bank_branch_name" },
			{ name : "bank_dc_acc_id" },
			{ name : "bank_dc_acc_name" },
			{ name : "bank_dc_cnt_id" },
			{ name : "bank_dc_emp_id" },
			{ name : "bank_dc_area_id" },
			{ name : "bank_dc_area_name" },
			{ name : "bank_c_code" },
			{ name : "bank_c_name" },
			{ name : "bank_i_main" },
			{ name : "bank_c_comment" },
			{ name : "bank_i_enable" },
			{ name : "bank_i_delete" },
			{ name : "bank_i_type" },
			{ name : "bank_i_trans_acc_tb" },
			{ name : "bank_dc_user_create_id" },
			{ name : "bank_dc_user_create_cost_id" },
			{ name : "bank_d_create" },
			{ name : "bank_dc_user_update_id" },
			{ name : "bank_dc_user_update_cost_id" },
			{ name : "bank_d_update" }
		]
	});
	
	// pagingBar
	var pagingBar = new Ext.PagingToolbar({
		pageSize: 20,
		store: store,
		displayInfo: true,
		displayMsg: "Displaying topics {0} - {1} of {2}"
	});
	
	//================================ gridMain ================================//
	var gridMain = new Ext.grid.GridPanel({
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
			text : "เพิ่มข้อมูล",
			id: "buAdd",
			iconCls: "icon-add", 
			handler: function(grid, rowIndex, colIndex) {
				Ext.getCmp("icon-save").show();
				Ext.getCmp("tabpanel2").setDisabled(false);
				Ext.getCmp("contenterCenter").setActiveTab("tabpanel2");
				Ext.getCmp("form-widgets").getForm().reset();
				Ext.getCmp("role-form-mode").setValue("ADD");
				
				$("#i_is_debtor").trigger("blur");
				$("#i_branch").trigger("blur");
				$("input[name=\"i_tax_fix\"]").trigger("blur");
				
				Ext.getCmp("DC_BANK").hide();
			}
		}, { xtype : "tbfill" },"  ", " ", "-", {
			id : "filter",
            xtype : "combo",
            width : 150,
			mode : "local",
            store	: new Ext.data.SimpleStore({
            	fields: [ "value", "text" ],
				data: [
				       [ "c_code", "รหัสผู้ขาย/รับจ้าง" ],
				       [ "c_name", "ชื่อผู้ขาย/รับจ้าง" ],
				       [ "c_tax_value", "เลขประจำตัวผู้เสียภาษีอากร" ],
				       [ "c_ref_value", "เลขประจำตัวประชาชน" ]
				]
			}),
			value: "c_name",
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
			fieldLabel : "fieldLabel",
			emptyText : 'คำที่ต้องการค้นหา',
		}, "-", "ประเภทกิจการ", "-", {
			id: "tax_customer_id",
            xtype: "combo",
            width: 150,
			mode: "local",
            store: store_tax_cus_all,
			valueField: "id",
			displayField: "c_name",
			allowBlank: false,
			editable: false,
			triggerAction: "all",
			typeAhead : false
		}, "-", "สถานะ", "-", {
			id: "status",
            xtype: "combo",
            width: 120,
			mode: "local",
            store: new Ext.data.SimpleStore({
            	fields: [ "value", "text" ],
				data: [
				       [ "0", "- เลือกทั้งหมด -" ],
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
			typeAhead : false
		}, " ", "-", {
			text : "ค้นหา",
			iconCls: "icon-magnifier",
			handler : function() {
				if(Ext.getCmp("value-box").getValue() != "") {
					store.setBaseParam("value", Ext.getCmp("value-box").getValue());
					store.setBaseParam("filter", Ext.getCmp("filter").getValue());
				} else {
					store.setBaseParam("value", "");
					store.setBaseParam("filter", "");
				}
				store.setBaseParam("mode", "SEARCH");
				store.setBaseParam("status", Ext.getCmp("status").getValue());
				store.setBaseParam("tax_customer_id", Ext.getCmp("tax_customer_id").getValue());
				store.load();
			}
		}],
		columns: [
		    new Ext.grid.RowNumberer({header:"ที่", width: 30,
				renderer:function(value, metaData, record, row, col, store, gridView) {
					return record.get("no");
				}
			}),
			{ header: "รหัสลูกค้า/ผู้ขาย/รับจ้าง", sortable: true, align:"center", width: 70, dataIndex: "c_code" },
			{ id: "c_name", header: "ชื่อลูกค้า/ผู้ขาย/รับจ้าง", sortable: true, dataIndex: "c_name" },
			{ header: "เลขประจำตัวผู้เสียภาษีอากร", sortable: true, align:"center", dataIndex: "c_tax_value" },
			{ header: "เลขประจำตัวประชาชน", sortable: true, align:"center", dataIndex: "c_ref_value" },
			{ header: "ประเภทกิจการ", sortable: true, align:"center", dataIndex: "dc_tax_customer_name" },
			{ header: "สถานประกอบการ", sortable: true, align:"center", dataIndex: "branch_name" },
			{ header: "ประเภทลูกหนี้/ผู้ขาย/รับจ้าง", sortable: true, align:"center", dataIndex: "dc_cnt_type_name" },
			{ header: "สถานะ", sortable:false, align: "center", width: 40,
				renderer: function(value, metaData, record, row, col, store, gridView) {
					var i_enable = record.get('i_enable');
					if(i_enable == 1) {
						return "<img src=\"../images/icons/yes.gif\");/>";
					} else {
						return "<img src=\"../images/icons/no.gif\");/>";
					}
				}
			}
		],
		autoExpandColumn: "c_name",
		bbar: pagingBar
	}); //gridMain
	
	//============================== cellClick ==============================//
	function cellClick(grid, rowIndex, columnIndex, e) {
		var record = grid.getStore().getAt(rowIndex);
		
		if (columnIndex == grid.getColumnModel().getIndexById("edit")) {
			Ext.getCmp("icon-save").show();
			Ext.getCmp("tabpanel2").setDisabled(false);
			Ext.getCmp("contenterCenter").setActiveTab("tabpanel2");
			Ext.getCmp("form-widgets").getForm().reset();
			Ext.getCmp("form-widgets").getForm().loadRecord(record);
			Ext.getCmp("role-form-mode").setValue("EDIT");
			
			$("#i_is_debtor").trigger("blur");
			$("#i_branch").trigger("blur");
			$("input[name=\"i_tax_fix\"]").trigger("blur");
			if(Ext.getCmp("c_ref_value").getValue() != "") {
				Ext.getCmp("chk_ref_value").setValue(true);
			}
			if(Ext.getCmp("c_tax_value").getValue() != "") {
				Ext.getCmp("chk_tax_value").setValue(true);
			}

			store_bank.load();
			store_bank_branch.load();
			store_bank_deposit_type.load();
			store_area.load();
			store_bank_acc.load();
			
			store_account.setBaseParam("id", Ext.getCmp("id").getValue());
			store_account.load();
			Ext.getCmp("DC_BANK").show();
			
		} else if (columnIndex==grid.getColumnModel().getIndexById("view")) {
			
			Ext.getCmp("icon-save").hide();
			Ext.getCmp("tabpanel2").setDisabled(false);
			Ext.getCmp("contenterCenter").setActiveTab("tabpanel2");
			Ext.getCmp("form-widgets").getForm().reset();
			Ext.getCmp("form-widgets").getForm().loadRecord(record);
			Ext.getCmp("role-form-mode").setValue("EDIT");
			
			$("#i_is_debtor").trigger("blur");
			$("#i_branch").trigger("blur");
			$("input[name=\"i_tax_fix\"]").trigger("blur");
			if(Ext.getCmp("c_ref_value").getValue() != "") {
				Ext.getCmp("chk_ref_value").setValue(true);
			}
			if(Ext.getCmp("c_tax_value").getValue() != "") {
				Ext.getCmp("chk_tax_value").setValue(true);
			}
			
			store_bank.load();
			store_bank_branch.load();
			store_bank_deposit_type.load();
			store_area.load();
			store_bank_acc.load();
			
			store_account.setBaseParam("id", Ext.getCmp("id").getValue());
			store_account.load();
			Ext.getCmp("DC_BANK").show();
			
		} else if (columnIndex == grid.getColumnModel().getIndexById("remove")) {
			var win = new Ext.Window({
				id : "win-msg-delete",
				title : "Remove",
				modal: true,
				width : 250,
				height : 130,
				html: "ท่านต้องการที่จะลบข้อมูล ?",
				buttons : [{
					text : "Confirm",
					handler : function() {
						Ext.Ajax.request({
							url : "api/mn_DcCreditor.php",
							method: "POST",
							params : {
								mode : "DELETE", 
								id : record.get("id")
							},
							success: function ( result, request ) {
								var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
								if (jsonData.success) {
									//Ext.MessageBox.alert("Success", jsonData.msg);		// alert massage success
								} else {
									Ext.MessageBox.alert("Failed", jsonData.msg);			// alert massage error
								}
								store.reload();
								Ext.getCmp("tabpanel2").setDisabled(true);
								Ext.getCmp("win-msg-delete").hide();
								Ext.getCmp("win-msg-delete").destroy();
							},
							failure: function ( result, request) { 
								Ext.MessageBox.alert("Failed", result.responseText);		// connect error
							}
						});
					}
				}, {
					text : "Cancel",
					handler : function() {
						Ext.getCmp("win-msg-delete").hide();
						Ext.getCmp("win-msg-delete").destroy();
					}				
				}]
			}).show();
		}
	}; //cellClick
	
	//========================================= NEW WINDOW บีญชีเงินฝาก =========================================//
	function win_method (mode, dc_cnt_id) {
		console.log(dc_cnt_id);
		new Ext.Window({
			region: "center",
			title: "รายละเอียดเลขที่บัญชีเงินฝาก",
			xtype: "panel",
			id: "win-method",
			border: false,
			modal: true,
			stripeRows: true,
			loadMask: true,
			store: store_account,
	        labelAlign: "left",
	        layout: "column",
	        items: [{
				xtype: "form",
				id: "form-widgets2",
				url: "api/mn_DcCreditor.php",
				frame: true,
				border: false,
				labelWidth: 200,
				width: 800,
				bodyStyle: { padding: "10px 20px" },
				defaults: { anchor: "100%", msgTarget: "side" },
				items: [{
					id: "method-form-mode",
					xtype: "hidden",
					value: mode,
					readOnly: true
				}, {
					xtype: "hidden",
					id: "bank_id",
					name: "bank_id",
					readOnly: true
				}, {
					xtype: "combo",
					fieldLabel: "ธนาคาร",
					id: "bank_dc_bank_id",
					name: "bank_dc_bank_id",
	    			store: store_bank,
	    			width: 200,
	    			valueField: "id",
	    			displayField: "c_name",
	    			mode: "local",
	    			triggerAction: "all",
	    			emptyText: "- กรุณาเลือกธนาคาร -",
					forceSelection: true,
					selectOnFocus: true,
					listeners: {
		        		"change": function (combo, newValue) {
		        			if(newValue != "") {
		        				Ext.getCmp("bank_dc_bank_branch_id").setValue("");
		        				store_bank_branch.setBaseParam("dc_bank_id", newValue);
		        				store_bank_branch.load();
		        			}
		        		}
					}
				}, {
					xtype: "combo",
					fieldLabel: "สาขา",
					id: "bank_dc_bank_branch_id",
					name: "bank_dc_bank_branch_id",
	    			store: store_bank_branch,
	    			width: 200,
	    			valueField: "id",
	    			displayField: "c_name",
	    			mode: "local",
	    			triggerAction: "all",
	    			emptyText: "- กรุณาเลือกสาขา -",
					forceSelection: true,
					selectOnFocus: true
				}, {
					xtype: "combo",
					fieldLabel: "ประเภทเงินฝาก",
					id: "bank_dc_bank_deposit_type_id",
					name: "bank_dc_bank_deposit_type_id",
	    			store: store_bank_deposit_type,
	    			width: 200,
	    			valueField: "id",
	    			displayField: "c_name",
	    			mode: "local",
	    			triggerAction: "all",
	    			emptyText: "- กรุณาเลือกประเภทเงินฝาก -",
					forceSelection: true,
					selectOnFocus: true
				}, {
					xtype: "compositefield",
					fieldLabel: "เลขที่บัญชี",
					anchor: "100%",
					msgTarget: "under",
					items: [{
						xtype: "textfield",
						id: "bank_c_code",
						name: "bank_c_code",
						autoCreate: { tag: "input", type: "text", autocomplete: "off", maxLength: 20 },
						width: 350
					},{ xtype: "displayfield", value: "<span style=\"color: red;\">*เลขที่บัญชีเงินฝาก 13-20 หลัก</span>" }]
                }, {
					xtype: "textfield",
					fieldLabel: "ชื่อบัญชี",
					id: "bank_c_name",
		        	name: "bank_c_name",
					width: 350
				}, 
//				{
//					xtype: "combo",
//					fieldLabel: "หน่วยธุรกิจ",
//					id: "bank_dc_area_id",
//					name: "bank_dc_area_id",
//	    			store: store_area,
//	    			width: 350,
//	    			valueField: "id",
//	    			displayField: "c_name",
//	    			mode: "local",
//	    			triggerAction: "all",
//	    			emptyText: "- กรุณาเลือกหน่วยธุรกิจ -",
//					forceSelection: true,
//					selectOnFocus: true
//				}, {
//					xtype: "combo",
//					fieldLabel: "ผังบัญชี",
//					id: "bank_dc_acc_id",
//					name: "bank_dc_acc_id",
//	    			store: store_bank_acc,
//	    			width: 350,
//	    			valueField: "id",
//	    			displayField: "c_name",
//	    			mode: "local",
//	    			triggerAction: "all",
//	    			emptyText: "- กรุณาเลือกผังบัญชี -",
//					forceSelection: true,
//					selectOnFocus: true
//				},
				{
					xtype: "textarea",
					fieldLabel: "คำอธิบายเพิ่มเติม",
					id: "bank_c_comment",
		        	name: "bank_c_comment",
					width: 300,
				}, {
					xtype: "checkbox",
					fieldLabel: "สถานะ",
					id: "bank_i_enable",
					name: "bank_i_enable",
					boxLabel: "ใช้งาน",
					checked: true,
					inputValue: 1
				}, 
//				{
//					xtype: "checkbox",
//					fieldLabel: "สถานะบัญชีสำหรับส่งธนาคารทะเบียนคุมโอนเงิน(โอนเงินธนาคาร:TB)",
//					id: "bank_i_trans_acc_tb",
//					name: "bank_i_trans_acc_tb",
//					boxLabel: "ใช้งาน",
//					checked: false,
//					inputValue: 1,
//					listeners: {
//		        		"check": function (combo, newValue) {
//		        			if(newValue == true) {
//		        				Ext.getCmp("win-method").getEl().mask("Please wait...", "x-mask-loading");
//		        				$.ajax({
//			        				url: "api/mn_DcCreditor.php",
//			        				type: "POST",
//			        				data: {
//			        					type: "check_trans_acc_tb",
//			        					mode: Ext.getCmp("method-form-mode").getValue(),
//			        					id: Ext.getCmp("bank_id").getValue(),
//			        					dc_cnt_id: dc_cnt_id,
//			        					value: 1 // checked
//			        				},
//			        				success: function(result) {
//			        					var obj = $.parseJSON( result );
//			        					if(obj.success == false) {
//			        						Ext.Msg.alert("Warning", "มีรายการบัญชีสำหรับส่งธนาคารทะเบียนคุมโอนเงิน(โอนเงินธนาคาร : TB)อยู่แล้ว");
//			        						Ext.getCmp("bank_i_trans_acc_tb").setValue(false);
//			        					}
//			        					Ext.getCmp("win-method").getEl().unmask();
//			        				}
//			        			});
//		        			}
//						}
//					}
//				},
				{
					xtype: "checkbox",
					fieldLabel: "สถานะรายการ",
					id: "bank_i_main",
					name: "bank_i_main",
					boxLabel: "เป็นบัญชีหลัก สำหรับรายการจ่าย ด้วยวิธีโอนผ่านบัญชีธนาคาร",
					checked: false,
					inputValue: 3,
					listeners: {
		        		"check": function (combo, newValue) {
		        			if(newValue == true) {
		        				Ext.getCmp("win-method").getEl().mask("Please wait...","x-mask-loading");
		        				$.ajax({
		        					url: "api/mn_DcCreditor.php",
			        				type: "POST",
			        				data: {
			        					type: "check_main",
			        					mode: Ext.getCmp("method-form-mode").getValue(),
			        					id: Ext.getCmp("bank_id").getValue(),
			        					dc_cnt_id: dc_cnt_id,
			        					value: 3 // checked
			        				},
			        				success: function(result) {
			        					var obj = $.parseJSON( result );
			        					if(obj.success == false) {
			        						Ext.Msg.alert("Warning", "มีรายการบัญชีหลักอยู่แล้ว หากต้องการระบุรายการบัญชีหลักเป็นบัญชีอื่นๆ<br>กรุณาแก้ไขข้อมูลรายการบัญชีหลักของเลขที่บัญชี "+obj.data+" ก่อน");
			        						Ext.getCmp("bank_i_main").setValue(false);
			        					}
			        					Ext.getCmp("win-method").getEl().unmask();
			        				}
			        			});
		        			}
						}
					}
				}],
				buttonAlign: "left",
				buttons: [{
					text : "&nbsp;บันทึกรายการ&nbsp;",
					iconCls	: "icon-save",
					handler: function(){
						var msg	= "";
						
						if(Ext.getCmp("bank_dc_bank_id").getValue() == "") { msg += "กรุณาเลือก ธนาคาร<br>"; }
						if(Ext.getCmp("bank_dc_bank_branch_id").getValue() == "") { msg += "กรุณาเลือก สาขา<br>"; }
						if(Ext.getCmp("bank_dc_bank_deposit_type_id").getValue() == "") { msg += "กรุณาเลือก ประเภทเงินฝาก<br>"; }
						if(Ext.getCmp("bank_c_code").getValue() == "") { msg += "กรุณากรอก เลขที่บัญชีเงินฝาก<br>"; }
						if(Ext.getCmp("bank_c_name").getValue() == "") { msg += "กรุณากรอก ชื่อบัญชี<br>"; }
//						if(Ext.getCmp("bank_dc_area_id").getValue() == "") { msg += "กรุณาเลือก หน่วยธุรกิจ<br>"; }
//						if(Ext.getCmp("bank_dc_acc_id").getValue() == "") { msg += "กรุณาเลือก ผังบัญชี<br>"; }
						
						if(msg == "") {
							Ext.Ajax.request({
								url: "api/mn_DcCreditor.php" ,
								method: "POST",
								params: { 
									mode: Ext.getCmp("method-form-mode").getValue(),
									id: Ext.getCmp("bank_id").getValue(),
									dc_cnt_id: dc_cnt_id,
									dc_bank_id: Ext.getCmp("bank_dc_bank_id").getValue(),
									dc_bank_branch_id: Ext.getCmp("bank_dc_bank_branch_id").getValue(),
									dc_bank_deposit_type_id: Ext.getCmp("bank_dc_bank_deposit_type_id").getValue(),
									c_code: Ext.getCmp("bank_c_code").getValue(),
									c_name: Ext.getCmp("bank_c_name").getValue(),
//									dc_area_id: Ext.getCmp("bank_dc_area_id").getValue(),
//									dc_acc_id: Ext.getCmp("bank_dc_acc_id").getValue(),
									c_address: Ext.getCmp("bank_c_comment").getValue(),
									i_enable: Ext.getCmp("bank_i_enable").checked,
//									i_trans_acc_tb: Ext.getCmp("bank_i_trans_acc_tb").checked,
									i_main: Ext.getCmp("bank_i_main").checked
								},
								success: function ( result, request ) {
									var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
									if (jsonData.success) {
		//									//Ext.MessageBox.alert('Success', jsonData.msg);		// alert massage success
										store_account.load();
										Ext.getCmp("win-method").destroy();
									} else {
										Ext.MessageBox.alert("Failed", jsonData.msg);			// alert massage error
									}
								},
								failure: function ( result, request) { 
									Ext.MessageBox.alert("Failed", result.responseText);		// connect error
								}
							});
						} else {
							Ext.Msg.alert("Warning", msg);
						}
					} //End Handle
				}, {
					text : "Cancel",
					handler : function() {
						Ext.getCmp("win-method").hide();
						Ext.getCmp("win-method").destroy();
					}				
				}]
			}]
		}).show(); 
	};//NEW WINDOW บีญชีเงินฝาก
	
	//================================= cellClick_Bank =================================//
	function cellClick_Bank(grid, rowIndex, columnIndex, e) {
		var record = grid.getStore().getAt(rowIndex);
		
		if (columnIndex == grid.getColumnModel().getIndexById("bank_edit")) {
			
			win_method("EDIT_BANK", Ext.getCmp("id").getValue());
			Ext.getCmp("form-widgets2").getForm().loadRecord(record);
			
		} else if (columnIndex == grid.getColumnModel().getIndexById("bank_remove")) {
			new Ext.Window({
				id : "bank-msg-delete",
				title : "Remove",
				modal: true,
				width : 250,
				height : 130,
				html: "ท่านต้องการที่จะลบข้อมูล ?",
				buttons : [{
					text : "Confirm",
					handler : function() {
						Ext.Ajax.request({
							url : "api/mn_DcCreditor.php",
							method: "POST",
							params : {
								mode : "DELETE_BANK", 
								id : record.get("bank_id")
							},
							success: function ( result, request ) {
								var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
								if (jsonData.success) {
									//Ext.MessageBox.alert("Success", jsonData.msg);		// alert massage success
								} else {
									Ext.MessageBox.alert("Failed", jsonData.msg);			// alert massage error
								}
								store_account.reload();
								Ext.getCmp("bank-msg-delete").hide();
								Ext.getCmp("bank-msg-delete").destroy();
							},
							failure: function ( result, request) { 
								Ext.MessageBox.alert("Failed", result.responseText);		// connect error
							}
						});
					}
				}, {
					text : "Cancel",
					handler : function() {
						Ext.getCmp("bank-msg-delete").hide();
						Ext.getCmp("bank-msg-delete").destroy();
					}				
				}]
			}).show();
		}
	};//cellClick_Bank

	//=================================== DC_BANK ===================================//
	var DC_BANK	= {
		id: "DC_BANK",
		border: false,
		bodyStyle: { padding: "10px 20px" },
		defaults: { anchor: "100%", msgTarget: "side", allowBlank: false },
		items: [{
			xtype: "container",
			layout: "hbox",
			align: "stretch",
			defaults: { xtype: "fieldset", flex:1, margins : "0px 3px", autoHeight: true },
			items: [{
				title: "บันทึกข้อมูลเลขที่บัญชีเงินฝาก",
				defaults: { anchor: "100%" },
				items: [ new Ext.grid.GridPanel({
					region: "center",
					id: "grid_bank",
					layout:"fit",
					height: 280,
					autohieght: true,
					border: true,
					stripeRows: true,
					loadMask: true,
					store: store_account,
					viewConfig : {
						emptyText: "ไม่มีข้อมูล..",
						deferEmptyText: false
					},
					tbar: [{
						text : "เพิ่มข้อมูล",
						iconCls: "icon-add", 
						handler: function(grid, rowIndex, colIndex) {
							win_method("ADD_BANK", Ext.getCmp("id").getValue());
						}
					}],
					viewConfig:{ forceFit: true },
					columns: [
						new Ext.grid.RowNumberer({
							header:" No ",
							width:50,
							renderer:function(value, metaData, record, row, col, store, gridView){
								return record.get("bank_no");
							}
						}),
						{ header: "เลขที่บัญชี", sortable: true, dataIndex: "bank_c_code" },
						{ id: "bank_c_name", header: "ชื่อบัญชี", sortable: true, dataIndex: "bank_c_name" },
						{ header: "สถานะบัญชีหลักสำหรับการโอนเงิน", sortable: false, align: "center", width: 200,
							renderer: function(value, metaData, record, row, col, store, gridView) {
								var bank_i_main = record.get("bank_i_main");
								if(bank_i_main == 3) {
									return "<img src=\"../images/icons/bullet_tick.png\");/>";
								} else {
									return "<img src=\"../images/icons/bullet_cross.png\");/>"; 
								}
							}
						},
						{ header: "ธนาคาร", sortable: true, dataIndex: "bank_dc_bank_name" },
						{ header: "สาขา", sortable: true, dataIndex: "bank_dc_bank_branch_name" },
						{ header: "ประเภทเงินฝาก", sortable: true, dataIndex: "bank_dc_bank_deposit_type_name" },
						{ header: "สถานะ", sortable:false, align: "center", width: 40,
							renderer: function(value, metaData, record, row, col, store, gridView) {
								var bank_i_enable = record.get("bank_i_enable");
								if(bank_i_enable == 1) {
									return "<img src=\"../images/icons/yes.gif\");/>";
								} else {
									return "<img src=\"../images/icons/no.gif\");/>";
								}
							}
						}, { id:"bank_edit", header: "แก้ไข", sortable: false, align:"center", width:50, dataIndex:"bank_id",
							renderer: function(value, metaData, record, row, col, store, gridView) {
								return"<img style=\"cursor:pointer\" src=\"../images/icons/document_edit.gif\");/>";
							}
						}, { id:"bank_remove", header:"ลบ", align:"center", sortable: false, width:70, dataIndex:"bank_id",
							renderer: function(value, metaData, record, row, col, store, gridView) {
								return"<img style=\"cursor:pointer\" src=\"../images/icons/document_delete.gif\");/>";
							}
						},
						{ header: " ", sortable: true, width:18, dataIndex: '' }
					],
//					columnLines: true,
					autoExpandColumn: "bank_c_name"
				})]
			}]
		}]
	}; //DC_BANK
	
	//======================================= ข้อมูลผู้ขาย/รับจ้าง =======================================//
	
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
			url: "api/mn_DcCreditor.php",
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
						fieldLabel: "รหัส",
						id: "c_code",
			        	name: "c_code",
			        	text: "2",
						width: 300
					}, {
						xtype: "textfield",
						fieldLabel: "รหัสเดิม",
						id: "c_old_code",
			        	name: "c_old_code",
						width: 300
					}, {
	    				xtype: "radiogroup",
	    				fieldLabel: "ประเภท",
	    				id: "i_is_debtor",
	    				columns: [ 60, 60, 110 ],
	    				vertical: true,
	    				items: [
	    	                { boxLabel: "ลูกหนี้", name: "i_is_debtor", inputValue: Ext.CNT_TYPE1, checked: true },
	    	                { boxLabel: "เจ้าหนี้", name: "i_is_debtor", inputValue: Ext.CNT_TYPE3 },
	    	                { boxLabel: "ลูกหนี้/เจ้าหนี้", name: "i_is_debtor", inputValue: Ext.CNT_TYPE2 }
	    	               
	    	            ],
	    	            listeners: {
	                		"change": function (combo, newValue) {
	                			if(newValue.inputValue == 3) {
	                				Ext.getCmp("dc_cnt_type_id").setDisabled(true);
	                				Ext.getCmp("i_group_cnt").setDisabled(true);
	                				
	                				Ext.getCmp("c_name_inv").setDisabled(true);
	                				Ext.getCmp("c_address_inv").setDisabled(true);
	                				Ext.getCmp("c_address_inv2").setDisabled(true);
	                				Ext.getCmp("s_bill").setDisabled(true);
	                				Ext.getCmp("s_dec_rate").setDisabled(true);
	                			} else {
	                				Ext.getCmp("dc_cnt_type_id").setDisabled(false);
	                				Ext.getCmp("i_group_cnt").setDisabled(false);
	                				
	                				Ext.getCmp("c_name_inv").setDisabled(false);
	                				Ext.getCmp("c_address_inv").setDisabled(false);
	                				Ext.getCmp("c_address_inv2").setDisabled(false);
	                				Ext.getCmp("s_bill").setDisabled(false);
	                				Ext.getCmp("s_dec_rate").setDisabled(false);
	                			}
	                		}
	                	}
	    	        }, {
						xtype: "combo",
						fieldLabel: "ประเภทลูกค้า",
						id: "dc_cnt_type_id",
						name: "dc_cnt_type_id",
						store: store_cnt_type,
		    			width: 300,
		    			hidden: false,
		    			valueField: "id",
		    			displayField: "c_name",
		    			mode: "local",
		    			triggerAction: "all",
		    			emptyText: "- กรุณาเลือกประเภทลูกค้า/ผู้ขาย/รับจ้าง -",
						forceSelection: true,
						selectOnFocus: true
					}, {
						xtype: "combo",
						fieldLabel: "กลุ่มลูกค้า",
						id: "i_group_cnt",
						name: "i_group_cnt",
						store: new Ext.data.SimpleStore({
			            	fields: [ "id", "c_name" ],
							data: [
							       [ "1", "เอกชน" ],
							       [ "2", "ราชการ/รัฐวิสาหกิจ" ],
							       [ "3", "แลกเปลี่ยน" ]
							]
						}),
		    			width: 300,
		    			hidden: false,
		    			value: "1",
		    			valueField: "id",
		    			displayField: "c_name",
		    			mode: "local",
		    			triggerAction: "all",
		    			emptyText: "- กรุณาเลือกกลุ่มลูกค้า -",
						forceSelection: true,
						selectOnFocus: true,
						editable: false
					}, {
						xtype: "combo",
						fieldLabel: "ประเภทกิจการ(ทางภาษี)",
						id: "dc_tax_customer_id",
						name: "dc_tax_customer_id",
						store: store_tax_cus,
		    			width: 300,
		    			valueField: "id",
		    			displayField: "c_name",
		    			mode: "local",
		    			triggerAction: "all",
		    			emptyText: "- กรุณาเลือกประเภทกิจการ -",
						forceSelection: true,
						selectOnFocus: true
					}, {
						xtype: "combo",
						fieldLabel: "คำนำหน้าชื่อ",
						id: "dc_title_id",
						name: "dc_title_id",
		    			store: store_title,
		    			width: 200,
		    			valueField: "id",
		    			displayField: "c_name",
		    			mode: "local",
		    			triggerAction: "all",
		    			emptyText: "- กรุณาเลือกคำนำหน้า -",
						forceSelection: true,
						selectOnFocus: true
					}, {
						xtype: "compositefield",
						fieldLabel: "ชื่อ",
						anchor: "100%",
						msgTarget: "under",
						items: [{
							xtype: "textfield",
							id: "c_name",
							name: "c_name",
							width: 300
						},{ xtype: "displayfield", value: "" }]
	                }, {
						xtype: "compositefield",
						fieldLabel: "นามสกุล/คำลงท้าย",
						anchor: "100%",
						msgTarget: "under",
						items: [{
							xtype: "textfield",
							id: "c_surname",
							name: "c_surname",
							width: 300
						},{ xtype: "displayfield", value: "<span style=\"color:red;\">**กรณีที่เป็นบริษัท ให้ระบุเป็น จำกัด หรือ จำกัด (มหาชน)**</span>" }]
	                }, {
	    				xtype: "radiogroup",
	    				fieldLabel: "สถานประกอบการ",
	    				id: "i_branch",
	    				columns: [ 60, 110, 70, 100 ],
	    				vertical: true,
	    				items: [
	    				    { boxLabel: "อื่นๆ", name: "i_branch", inputValue: 3, checked: true },
	    	                { boxLabel: "สำนักงานใหญ่", name: "i_branch", inputValue: 1 },
	    	                { boxLabel: "สาขาที่", name: "i_branch", inputValue: 2 },
	    	                /*
	    	                { id: "btn_branch", xtype : "button", text : "เพิ่มสาขา", width : 120,
	    	                	handler: function() {
	    	                		Ext.getCmp("role-form-mode").setValue("ADD");
	    	                		
	    	                		Ext.getCmp('DC_BANK').hide();
	    	                		Ext.getCmp('btn_branch').show();
	    	                		Ext.getCmp("i_branch").setValue(1);
	    	                		Ext.getCmp("i_branch").setDisabled(true);
	    	                		
	    	                		check_ref(Ext.getCmp("c_ref_value").getValue());
	    	            			check_tax(Ext.getCmp("c_tax_value").getValue());
	    	            			check_branch(Ext.getCmp("c_branch").getValue());
	    	                	}
	    	                }
	    	                */
	    	            ],
	    	            listeners: {
	                		"change": function (combo, newValue) {
	                			if(newValue.inputValue == 2) {
	                				Ext.getCmp("c_branch").setDisabled(false);
	                			} else {
	                				Ext.getCmp("c_branch").setDisabled(true);
	                			}
//	                			
//	                			if(newValue.inputValue == 2) {
//	                				Ext.getCmp("btn_branch").setDisabled(false);
//	                			} else {
//	                				Ext.getCmp("btn_branch").setDisabled(true);
//	                			}
	                		}
	                	}
	    	        }, {
						xtype: "compositefield",
						hidden: false,
						anchor: "100%",
						msgTarget: "under",
						items: [{
							xtype: "idcardfield",
							id: "c_branch",
							name: "c_branch",
							width: 220,
							autoCreate: { tag: "input", type: "text", autocomplete: "off", maxLength: 5 },
						}, { xtype: "displayfield", value: "<span style=\"color:blue;\">(5 หลัก) เช่น สาขาที่ 5 กรอก 00005 เป็นต้น</span>" }
						]
	                }, {
						xtype: "compositefield",
						hidden: false,
						anchor: "100%",
						msgTarget: "under",
						items: [{
							xtype: "checkbox",
							fieldLabel: "สถานะผู้ขาย/รับจ้างบัตรเครดิต",
							id: "i_credit_card",
							name: "i_credit_card",
							boxLabel: "เป็นผู้ขาย/รับจ้างบัตรเครดิต",
							checked: false,
							inputValue: 1,
							listeners: {
		                		"check": function (combo, newValue) {
		                			if(newValue == true) {
		                				Ext.getCmp("c_credit_name").setDisabled(false);
		                			} else {
		                				Ext.getCmp("c_credit_name").setDisabled(true);
		                			}
		                		}
		                	}
						}, {
							xtype: "textfield",
							id: "c_credit_name",
							name: "c_credit_name",
							disabled: true,
							width: 300
						}, { xtype: "displayfield", value: "<span style=\"color:red;\">****แสดงชื่อบัตรเครดิต ที่พิมพ์คำขอเบิกค่าใช้จ่าย(AP)</span>" }
						]
	                }, {
						xtype: "combo",
						fieldLabel: "สถานะลูกจ้าง",
						id: "i_daily_worker",
						name: "i_daily_worker",
		    			store: store_daily_worker,
		    			width: 200,
		    			valueField: "id",
		    			displayField: "c_name",
		    			mode: "local",
		    			triggerAction: "all",
		    			emptyText: "- กรุณาเลือกสถานะลูกจ้าง -",
						forceSelection: true,
						selectOnFocus: true,
						editable: false
					}, {
						xtype: "compositefield",
						fieldLabel: "ที่อยู่",
						anchor: "100%",
						msgTarget: "under",
						items: [{
							xtype: "textarea",
							id: "c_address",
				        	name: "c_address",
							width: 300,
						},{ xtype: "displayfield", value: "" }]
	                }, {
						xtype: "compositefield",
						hidden: false,
						anchor: "100%",
						msgTarget: "under",
						items: [{
							xtype: "textfield",
							fieldLabel: "บ้านเลขที่ หมู่ อาคาร ชั้น",
							id: "c_add_bank1",
							name: "c_add_bank1",
							width: 300
						}, { xtype: "displayfield", value: "<span style=\"color:blue;\">(Convenience Cheque)</span>" }
						]
	                }, {
						xtype: "compositefield",
						hidden: false,
						anchor: "100%",
						msgTarget: "under",
						items: [{
							xtype: "textfield",
							fieldLabel: "ซอย ถนน ตำบล",
							id: "c_add_bank2",
							name: "c_add_bank2",
							width: 300
						}, { xtype: "displayfield", value: "<span style=\"color:blue;\">(Convenience Cheque)</span>" }
						]
	                }, {
						xtype: "compositefield",
						hidden: false,
						anchor: "100%",
						msgTarget: "under",
						items: [{
							xtype: "textfield",
							fieldLabel: "อำเภอ จังหวัด",
							id: "c_add_bank3",
							name: "c_add_bank3",
							width: 300
						}, { xtype: "displayfield", value: "<span style=\"color:blue;\">(Convenience Cheque)</span>" }
						]
	                }, {
						xtype: "compositefield",
						hidden: false,
						anchor: "100%",
						msgTarget: "under",
						items: [{
							xtype: "idcardfield",
							fieldLabel: "รหัสไปรษณีย์",
							id: "c_add_bank4",
							name: "c_add_bank4",
							width: 100,
							autoCreate: { tag: "input", type: "text", autocomplete: "off", maxLength: 5 },
						}, { xtype: "displayfield", value: "<span style=\"color:blue;\">(Convenience Cheque)</span>" },
						{ xtype : "button", text : "แก้ไขที่อยู่", width : 80,
    	                	handler: function() {
    	                		var c_address	= "";
    	                		if(Ext.getCmp("c_add_bank1").getValue() != "")
    	                			c_address += Ext.getCmp("c_add_bank1").getValue()+" ";
    	                		if(Ext.getCmp("c_add_bank2").getValue() != "")
    	                			c_address += Ext.getCmp("c_add_bank2").getValue()+" ";
    	                		if(Ext.getCmp("c_add_bank3").getValue() != "")
    	                			c_address += Ext.getCmp("c_add_bank3").getValue()+" ";
    	                		if(Ext.getCmp("c_add_bank4").getValue() != "")
    	                			c_address += Ext.getCmp("c_add_bank4").getValue()+" ";
    	                		
    	                		Ext.getCmp("c_address").setValue(c_address);
    	                	}
    	                }
						]
	                }, {
						xtype: "compositefield",
						fieldLabel: "โทรศัพท์",
						anchor: "100%",
						msgTarget: "under",
						items: [{
							xtype: "textfield",
							id: "c_telephone",
							name: "c_telephone",
							width: 300
						},{ xtype: "displayfield", value: "" }]
	                }, {
						xtype: "compositefield",
						fieldLabel: "โทรศัพท์เคลื่อนที่",
						anchor: "100%",
						msgTarget: "under",
						items: [{
							xtype: "textfield",
							id: "c_mobile",
							name: "c_mobile",
							width: 300
						},{ xtype: "displayfield", value: "" }]
	                }, {
						xtype: "compositefield",
						fieldLabel: "โทรสาร",
						anchor: "100%",
						msgTarget: "under",
						items: [{
							xtype: "textfield",
							id: "c_fax",
							name: "c_fax",
							width: 300
						},{ xtype: "displayfield", value: "" }]
	                }, {
						xtype: "compositefield",
						fieldLabel: "เว็บไซต์",
						anchor: "100%",
						msgTarget: "under",
						items: [{
							xtype: "textfield",
							id: "c_website",
							name: "c_website",
							width: 300
						},{ xtype: "displayfield", value: "" }]
	                }, {
						xtype: "compositefield",
						fieldLabel: "E-mail",
						anchor: "100%",
						msgTarget: "under",
						items: [{
							xtype: "textfield",
							id: "c_email",
							name: "c_email",
							width: 300
						},{ xtype: "displayfield", value: "" }]
	                }, {
						xtype: "compositefield",
						fieldLabel: "เลขประจำตัวบัตรประชาชน",
						anchor: "100%",
						msgTarget: "under",
						items: [{
							xtype: "idcardfield",
							id: "c_ref_value",
							name: "c_ref_value",
							width: 220,
							autoCreate: { tag: "input", type: "text", autocomplete: "off", maxLength: 13 },
							listeners: {
		                		"change": function (combo, newValue) {
		                			Ext.getCmp("chk_ref_value").setValue(false);
		                		}
		                	}
						}, { id: "chk_ref_value", xtype: "hidden", value: "false" }, 
						{ xtype : "button", text : "ตรวจสอบเลขบัตรประชาชน", width : 150,
    	                	handler: function() {
    	                		if(Ext.getCmp("c_ref_value").getValue() == "") {
    	                			Ext.Msg.alert("Warning", "กรุณากรอก เลขบัตรประชาชน ก่อน");
    	                		} else if(Ext.getCmp("c_ref_value").getValue().length < 13) {
    	                			Ext.Msg.alert("Warning", "กรุณากรอก เลขบัตรประชาชน 13 หลัก");
    	                		} else {
	    	                		Ext.getCmp("tabpanel2").getEl().mask("Please wait...","x-mask-loading");
	    	                		Ext.Ajax.request({
	    								url: "api/mn_DcCreditor.php",
	    								method: "POST",
	    								params: {
	    									mode: Ext.getCmp("role-form-mode").getValue(),
	    									type: "check_ref",
	    									id: Ext.getCmp("id").getValue(),
	    									value: Ext.getCmp("c_ref_value").getValue()
	    								},
	    								success: function ( result, request ) {
	    									var obj = Ext.util.JSON.decode(result.responseText);	//decode json
	    									var sss	= "";
	    									if (obj.success) { // ใช้งานได้
	    										Ext.getCmp("chk_ref_value").setValue(true);
	    									} else { // ซ้ำ
	    										Ext.getCmp("chk_ref_value").setValue(false);
	    										$.each(obj.data, function( index, value ) {
		    										sss	+= value+"<br>";
		    									});
	    										Ext.Msg.alert("Warning", "เลขบัตรประชาชนมีรายการซ้ำ คือ<br>"+sss);
	    									}
	    									Ext.getCmp("tabpanel2").getEl().unmask();
	    								},
	    								failure: function ( result, request) { 
	    									Ext.MessageBox.alert("Failed", result.responseText);		// connect error
	    								}
	    							});
    	                		}
    	                	}
    	                }, { xtype: "displayfield", value: "<span style=\"color:red;\">*(กรอกเฉพาะตัวเลขติดกัน)</span>" }]
	                }, {
						xtype: "compositefield",
						fieldLabel: "เลขประจำตัวผู้เสียภาษีอากร",
						anchor: "100%",
						msgTarget: "under",
						items: [{
							xtype: "idcardfield",
							id: "c_tax_value",
							name: "c_tax_value",
							width: 220,
							autoCreate: { tag: "input", type: "text", autocomplete: "off", maxLength: 13 },
							listeners: {
		                		"change": function (combo, newValue) {
		                			Ext.getCmp("chk_tax_value").setValue(false);
		                		}
		                	}
						}, { id: "chk_tax_value", xtype: "hidden", value: "false" },
						{ xtype : "button", text : "ตรวจสอบเลขผู้เสียภาษีอากร", width : 150,
    	                	handler: function() {
	    	                		if(Ext.getCmp("c_tax_value").getValue() == "") {
	    	                			Ext.Msg.alert("Warning", "กรุณากรอก เลขผู้เสียภาษีอากร ก่อน");
	    	                		} else if(Ext.getCmp("c_tax_value").getValue().length < 13) {
	    	                			Ext.Msg.alert("Warning", "กรุณากรอก เลขผู้เสียภาษีอากร 13 หลัก");
	    	                		} else {
		    	                		Ext.getCmp("tabpanel2").getEl().mask("Please wait...","x-mask-loading");
		    	                		Ext.Ajax.request({
		    								url: "api/mn_DcCreditor.php",
		    								method: "POST",
		    								params: {
		    									mode: Ext.getCmp("role-form-mode").getValue(),
		    									type: "check_tax",
		    									id: Ext.getCmp("id").getValue(),
		    									value: Ext.getCmp("c_tax_value").getValue()
		    								},
		    								success: function ( result, request ) {
		    									var obj = Ext.util.JSON.decode(result.responseText);	//decode json
		    									var sss	= "";
		    									if (obj.success) { // ใช้งานได้
		    										Ext.getCmp("chk_tax_value").setValue(true);
		    									} else { // ซ้ำ
		    										Ext.getCmp("chk_tax_value").setValue(false);
		    										$.each(obj.data, function( index, value ) {
			    										sss	+= value+"<br>";
			    									});

		    										Ext.Msg.alert("Warning", "เลขประจำตัวผู้เสียภาษีอากรมีรายการซ้ำ คือ<br>"+sss);
		    									}
		    									Ext.getCmp("tabpanel2").getEl().unmask();
		    								},
		    								failure: function ( result, request) { 
		    									Ext.MessageBox.alert("Failed", result.responseText);		// connect error
		    								}
		    							});
	    	                		}
	    	                	}
							}, { xtype: "displayfield", value: "<span style=\"color:red;\">*(กรอกเฉพาะตัวเลขติดกัน)</span>" }]
	                }, {
						xtype: "textarea",
						fieldLabel: "ชื่อลูกค้าในใบกำกับภาษี",
						id: "c_name_inv",
			        	name: "c_name_inv",
						width: 300
					}, {
						xtype: "textfield",
						fieldLabel: "ที่อยู่ลูกค้าในใบกำกับภาษี(บรรทัดที่ 1)",
						id: "c_address_inv",
						name: "c_address_inv",
						width: 300,
						hidden: false
					}, {
						xtype: "textfield",
						fieldLabel: "ที่อยู่ลูกค้าในใบกำกับภาษี(บรรทัดที่ 2)",
						id: "c_address_inv2",
						name: "c_address_inv2",
						width: 300,
						hidden: false
					}, {
						xtype: "compositefield",
						id: "s_bill",
						fieldLabel: "วันทีกำหนดการวางบิล",
						anchor: "100%",
						msgTarget: "under",
						hidden: false,
						items: [{
							xtype: "textfield",
							id: "due_bill",
							name: "due_bill",
							width: 300
						}, { xtype: "displayfield", value: "<span style=\"color:red;\">** ให้ระบุเป็นข้อความ เช่น สัปดาห์แรกของเดือน หรือ วันที่ 15-20 ของเดือน เป็นต้น</span>" }]
	                }, {
						xtype: "compositefield",
						id: "s_dec_rate",
						fieldLabel: "ส่วนลดล่วงหน้า",
						anchor: "100%",
						msgTarget: "under",
						hidden: false,
						items: [{
							xtype: "textfield",
							id: "f_dec_rate",
							name: "f_dec_rate",
							width: 300
						}, { xtype: "displayfield", value: "%" }]
	                }, {
						xtype: "combo",
						fieldLabel: "เงื่อนไขการชำระเงิน",
						id: "dc_disc_type_id",
						name: "dc_disc_type_id",
		    			store: store_disc_type,
		    			width: 200,
		    			valueField: "id",
		    			displayField: "c_name",
		    			mode: "local",
		    			triggerAction: "all",
		    			emptyText: "- กรุณาเลือกเงื่อนไขการชำระเงิน -",
						forceSelection: true,
						selectOnFocus: true,
						editable: false
					}, {
						xtype: "compositefield",
						fieldLabel: "เพิ่มเงื่อนไขการชำระเงิน",
						anchor: "100%",
						msgTarget: "under",
						items: [{
							xtype: "combo",
							id: "parent_id",
							name: "parent_id",
			    			store: store_disc_type,
			    			width: 150,
			    			valueField: "id",
			    			displayField: "c_name",
			    			mode: "local",
			    			triggerAction: "all",
			    			emptyText: "- กรุณาเลือกเงื่อนไขการชำระเงิน -",
							forceSelection: true,
							selectOnFocus: true,
							editable: false
						}, {
							xtype: "combo",
							id: "order_id",
							name: "order_id",
			    			store: store_disc_type,
			    			width: 150,
			    			valueField: "id",
			    			displayField: "c_name",
			    			mode: "local",
			    			triggerAction: "all",
			    			emptyText: "- กรุณาเลือกเงื่อนไขการชำระเงิน -",
							forceSelection: true,
							selectOnFocus: true,
							editable: false
						}, { xtype: "displayfield", value: "<span style=\"color:red;\">** ใช้แสดงในรายงานฐานข้อมูลเครดิตกลาง</span>" }]
	                }, {
						xtype: "textarea",
						fieldLabel: "หมายเหตุ",
						id: "c_comment",
			        	name: "c_comment",
						width: 300
					}, {
						xtype: "combo",
						fieldLabel: "บัญชีผู้ขาย/รับจ้าง",
						id: "dc_acc_id",
						name: "dc_acc_id",
		    			store: store_acc,
		    			width: 300,
		    			valueField: "id",
		    			displayField: "c_name",
		    			mode: "local",
		    			triggerAction: "all",
		    			emptyText: "- กรุณาเลือกบัญชีผู้ขาย/รับจ้าง -",
						forceSelection: true,
						selectOnFocus: true
					}, {
						xtype: "checkbox",
						fieldLabel: "บริษัทออกภาษีให้",
						id: "i_company_pay_tax",
						name: "i_company_pay_tax",
						boxLabel: "บริษัทออกภาษีให้",
						checked: false,
						inputValue: 1
					}, {
	    				xtype: "radiogroup",
	    				fieldLabel: "กำหนดอัตราภาษีหัก ณ ที่จ่าย",
	    				id: "i_tax_fix",
	    				columns: [ 255, 110 ],
	    				vertical: true,
	    				items: [
	    				    { boxLabel: "คิดตามอัตราภาษีก้าวหน้า (ประมวลผลทุกเดือน)", name: "i_tax_fix", inputValue: 2, checked: true },
	    	                { boxLabel: "กำหนด(อัตราคงที่)", name: "i_tax_fix", inputValue: 1 }
	    	            ],
	    	            listeners: {
	                		"change": function (combo, newValue) {
	                			if(newValue.inputValue == 2) {
	                				Ext.getCmp("s_tax").hide();
	                				Ext.getCmp("s_tax_reduce").show();
	                			} else {
	                				Ext.getCmp("s_tax").show();
	                				Ext.getCmp("s_tax_reduce").hide();
	                			}
	                		}
	                	}
	    	        }, {
						xtype: "compositefield",
						id: "s_tax_reduce",
						fieldLabel: "ส่วนลดหย่อนทางภาษี",
						anchor: "100%",
						msgTarget: "under",
						items: [{
							xtype: "idcardfield",
							id: "f_tax_reduce",
							name: "f_tax_reduce",
							width: 300
						}, { xtype: "displayfield", value: "บาท" }]
	                }, {
						xtype: "compositefield",
						id: "s_tax",
						fieldLabel: "อัตราภาษีหัก ณ ที่จ่าย",
						anchor: "100%",
						msgTarget: "under",
						items: [{
							xtype: "combo",
							id: "dc_tax_id",
							name: "dc_tax_id",
			    			store: store_tax,
			    			width: 300,
			    			valueField: "id",
			    			displayField: "c_name",
			    			mode: "local",
			    			triggerAction: "all",
			    			emptyText: "- กรุณาเลือกภาษีหัก ณ ที่จ่าย -",
							forceSelection: true,
							selectOnFocus: true
						}]
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
				text : "&nbsp;บันทึกรายการ&nbsp;",
				id: "icon-save",
				iconCls	: "icon-save",
				handler : function() {
					var form	= Ext.getCmp("form-widgets").getForm();
					var msg		= "";
					
					var dc_cnt_type_id	= ""; //ประเภทลูกค้า
					var i_group_cnt		= ""; //กลุ่มลูกค้า
					var c_branch		= ""; //สาขา
					var c_credit_name	= ""; //ชื่อบัตรเครดิต
					var c_name_inv		= ""; //ชื่อลูกค้าในใบกำกับภาษี
					var c_address_inv	= ""; //ที่อยู่ลูกค้าในใบกำกับภาษี(บรรทัดที่ 1)
					var c_address_inv2	= ""; //ที่อยู่ลูกค้าในใบกำกับภาษี(บรรทัดที่ 2)
					var due_bill		= ""; //วันทีกำหนดการวางบิล
					var f_dec_rate		= ""; //ส่วนลดล่วงหน้า
					var f_tax_reduce	= ""; //ส่วนลดหย่อนทางภาษี
					var dc_tax_id		= ""; //อัตราภาษีหัก ณ ที่จ่าย

					if(Ext.getCmp("i_is_debtor").getValue() != null) {
						if(Ext.getCmp("i_is_debtor").getValue().inputValue  == Ext.CNT_TYPE_DEBTOR_AND_CREDITOR) {
							if(Ext.getCmp("dc_cnt_type_id").getValue() == "")	{ msg	+= "- กรุณาเลือก ประเภทลูกค้า/ผู้ขาย/รับจ้าง<br>"; }
							if(Ext.getCmp("i_group_cnt").getValue() == "")	{ msg	+= "- กรุณาเลือก กลุ่มลูกค้า/ผู้ขาย/รับจ้าง<br>"; }
							if(Ext.getCmp("c_name_inv").getValue() == "")	{ msg	+= "- กรุณากรอก ชื่อลูกค้าในใบกำกับภาษี<br>"; }
							if(Ext.getCmp("c_address_inv").getValue() == "" && Ext.getCmp("c_address_inv2").getValue() == "") {
								msg	+= "- กรุณากรอก ที่อยู่ลูกค้าในใบกำกับภาษี<br>";
							}
		                	
							dc_cnt_type_id	= Ext.getCmp("dc_cnt_type_id").getValue();
							i_group_cnt		= Ext.getCmp("i_group_cnt").getValue();
							c_name_inv		= Ext.getCmp("c_name_inv").getValue();
							c_address_inv	= Ext.getCmp("c_address_inv").getValue();
							c_address_inv2	= Ext.getCmp("c_address_inv2").getValue();
							due_bill		= Ext.getCmp("due_bill").getValue();
							f_dec_rate		= Ext.getCmp("f_dec_rate").getValue();
						} else {
							dc_cnt_type_id	= "";
							i_group_cnt		= "";
							c_name_inv		= "";
							c_address_inv	= "";
							c_address_inv2	= "";
							due_bill		= "";
							f_dec_rate		= "";
						}
					} else {
						msg	+= "- กรุณาเลือก ประเภท<br>";
					}
					
					if(Ext.getCmp("i_branch").getValue() != null) {
						if(Ext.getCmp("i_branch").getValue().inputValue == 2) {
							if(Ext.getCmp("c_branch").getValue() == "") {
								msg	+= "- กรุณากรอก สาขา<br>";
							}
							
							c_branch	= Ext.getCmp("c_branch").getValue();
						} else {
							c_branch	= "";
						}
					} else {
						msg	+= "- กรุณาเลือก สถานประกอบการ<br>";
					}
					
					if(Ext.getCmp("dc_tax_customer_id").getValue() == "") { msg	+= "- กรุณาเลือก ประเภทกิจการ<br>"; }
					if(Ext.getCmp("dc_title_id").getValue() == "") { msg	+= "- กรุณาเลือก คำนำหน้า<br>"; }
					if(Ext.getCmp("c_name").getValue() == "") { msg	+= "- กรุณากรอก ชื่อ<br>"; }
					if(Ext.getCmp("i_credit_card").checked == true) {
						if(Ext.getCmp("c_credit_name").getValue() == "") { msg	+= "- กรุณากรอกชื่อ บัตรเครดิต<br>"; }
						
						c_credit_name	= Ext.getCmp("c_credit_name").getValue();
					} else {
						c_credit_name	= "";
					}
					if(Ext.getCmp("i_daily_worker").getValue() == "") { msg	+= "- กรุณาเลือก สถานะลูกจ้าง<br>"; }
					if(Ext.getCmp("c_add_bank1").getValue() == "") { msg	+= "- กรุณากรอก บ้านเลขที่ หมู่ อาคาร ชั้น<br>"; }
					if(Ext.getCmp("c_add_bank2").getValue() == "") { msg	+= "- กรุณากรอก ซอย ถนน ตำบล<br>"; }
					if(Ext.getCmp("c_add_bank3").getValue() == "") { msg	+= "- กรุณากรอก อำเภอ จังหวัด<br>"; }
					if(Ext.getCmp("c_add_bank4").getValue() == "") { msg	+= "- กรุณากรอก รหัสไปรษณีย์<br>"; }
					if(Ext.getCmp("c_ref_value").getValue() == "" && Ext.getCmp("c_tax_value").getValue() == "") {
						msg	+= "- กรุณากรอก เลขประจำตัวประชาชน หรือ เลขประจำตัวผู้เสียภาษีอากร<br>";
					} else {
						if(Ext.getCmp("c_ref_value").getValue() != "") {
							if(Ext.getCmp("chk_ref_value").getValue() == "false") {
								msg	+= "- กรุณากดปุ่ม ตรวจสอบเลขบัตรประชาชนก่อน<br>";
							}
						}
						
						if(Ext.getCmp("c_tax_value").getValue() != "") {
							if(Ext.getCmp("chk_tax_value").getValue() == "false") {
								msg	+= "- กรุณากดปุ่ม ตรวจสอบเลขประจำตัวผู้เสียภาษีอากรก่อน<br>";
							}
						}
					}
					if(Ext.getCmp("dc_disc_type_id").getValue() == "") { msg	+= "- กรุณาเลือก เงื่อนไขการชำระเงิน<br>"; }
					if(Ext.getCmp("dc_acc_id").getValue() == "") { msg	+= "- กรุณาเลือก บัญชีผู้ขาย/รับจ้าง<br>"; }
					if(Ext.getCmp("i_tax_fix").getValue() != null) {
						if(Ext.getCmp("i_tax_fix").getValue().inputValue == 2) {
							if(Ext.getCmp("f_tax_reduce").getValue() == "") {
								msg	+= "- กรุณากรอก ส่วนลดหย่อนทางภาษี<br>";
							}
	
							f_tax_reduce	= Ext.getCmp("f_tax_reduce").getValue();
							dc_tax_id		= "";
						} else {
							if(Ext.getCmp("dc_tax_id").getValue() == "" || Ext.getCmp("dc_tax_id").getValue() == null) {
								msg	+= "- กรุณาเลือก อัตราภาษีหัก ณ ที่จ่าย<br>";
							}
	
							f_tax_reduce	= "";
							dc_tax_id		= Ext.getCmp("dc_tax_id").getValue();
						}
					} else {
						msg	+= "- กรุณาเลือก กำหนดอัตราภาษีหัก ณ ที่จ่าย<br>";
					}
					
					if (msg == "") {
						Ext.Ajax.request({
							url: "api/mn_DcCreditor.php" ,
							method: "POST",
							params: { 
								mode: Ext.getCmp("role-form-mode").getValue(),
								id: Ext.getCmp("id").getValue(),
								c_old_code: Ext.getCmp("c_old_code").getValue(),
								i_is_debtor: Ext.getCmp("i_is_debtor").getValue().inputValue,
								dc_cnt_type_id: dc_cnt_type_id,
								i_group_cnt: i_group_cnt,
								dc_tax_customer_id: Ext.getCmp("dc_tax_customer_id").getValue(),
								dc_title_id: Ext.getCmp("dc_title_id").getValue(),
								title_name: Ext.getCmp("dc_title_id").lastSelectionText,
								c_name: Ext.getCmp("c_name").getValue(),
								c_surname: Ext.getCmp("c_surname").getValue(),
								i_branch: Ext.getCmp("i_branch").getValue().inputValue,
								c_branch: c_branch,
								i_credit_card: Ext.getCmp("i_credit_card").checked,
								c_credit_name: c_credit_name,
								i_daily_worker: Ext.getCmp("i_daily_worker").getValue(),
								c_address: Ext.getCmp("c_address").getValue(),
								c_add_bank1: Ext.getCmp("c_add_bank1").getValue(),
								c_add_bank2: Ext.getCmp("c_add_bank2").getValue(),
								c_add_bank3: Ext.getCmp("c_add_bank3").getValue(),
								c_add_bank4: Ext.getCmp("c_add_bank4").getValue(),
								c_telephone: Ext.getCmp("c_telephone").getValue(),
								c_mobile: Ext.getCmp("c_mobile").getValue(),
								c_fax: Ext.getCmp("c_fax").getValue(),
								c_website: Ext.getCmp("c_website").getValue(),
								c_email: Ext.getCmp("c_email").getValue(),
								c_ref_value: Ext.getCmp("c_ref_value").getValue(),
								c_tax_value: Ext.getCmp("c_tax_value").getValue(),
								c_name_inv: c_name_inv,
								c_address_inv: c_address_inv,
								c_address_inv2: c_address_inv2,
								due_bill: due_bill,
								f_dec_rate: f_dec_rate,
								dc_disc_type_id: Ext.getCmp("dc_disc_type_id").getValue(),
								parent_id: Ext.getCmp("parent_id").getValue(),
								order_id: Ext.getCmp("order_id").getValue(),
								c_comment: Ext.getCmp("c_comment").getValue(),
								dc_acc_id: Ext.getCmp("dc_acc_id").getValue(),
								i_company_pay_tax: Ext.getCmp("i_company_pay_tax").checked,
								i_tax_fix: Ext.getCmp("i_tax_fix").getValue().inputValue,
								f_tax_reduce: f_tax_reduce,
								dc_tax_id: dc_tax_id,
								i_enable: Ext.getCmp("i_enable").checked
							},
							success: function ( result, request ) {
								var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
								if (jsonData.success) {
									//Ext.MessageBox.alert('Success', jsonData.msg);		// alert massage success
									store.load();
									Ext.Msg.alert("Success", "บันทึกเรียบร้อย");
									Ext.getCmp("icon-save").hide();
									
									store_bank.load();
									store_bank_branch.load();
									store_bank_deposit_type.load();
									store_area.load();
									store_bank_acc.load();

									store_account.setBaseParam("id", jsonData.id);
									store_account.load();
									Ext.getCmp("id").setValue(jsonData.id);
									Ext.getCmp("DC_BANK").show();
								} else {
									Ext.MessageBox.alert("Failed", jsonData.msg);			// alert massage error
								}
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
		}, DC_BANK ]
	} //ข้อมูลผู้ขาย/รับจ้าง
	
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
	Ext.getCmp("grid_bank").on("cellclick", cellClick_Bank, this);

	// SetTab Controller Loads
	Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
	InfoMainGrid("tabpanel1", false, false, false, false, false, false);

	/*====================== RENDER ======================*/
	new Ext.Viewport({
		layout: "border",
		items: [ center ]
	});
});