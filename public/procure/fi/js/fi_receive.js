	/* OBJ GET Store Row */
	Ext.getStoreItems = function(store, value,itemName){  
		 for(i=0;i<store.data.items.length;i++){
		  var rec = store.data.items[i];
			 if(value==rec.data.id){ 
				 return rec.get(itemName); 
			}
		 }// loop 
	}; //	 

	/*
*/
 
	
	/* OBJ Calendar
	*
	*
	*/
	Ext.getDate = Ext.apply({
		year:new Date().getFullYear(), 
		month:new Date().getMonth()+1,
		day:new Date().getDay(),
		getNowCarlen:function(){
			 var day = new Date();
			 var dd = day.getDate();
			 var mm = day.getMonth() + 1;
			 var yy = day.getFullYear()+543; 
			 mm = (mm < 10) ? ("0" + mm) : mm;
			 dd = (dd < 10) ? ("0" + dd) : dd; 
			return dd+'-'+mm+'-'+yy;
		},	
		defaultDate:function(typeStartDate) {
			 var day = new Date();
			 var dd = day.getDate();
			 var mm = day.getMonth() + 1;
			 var yy = day.getFullYear() + 543; 
			 if (typeStartDate == 1) // วันที่เริ่ม -1 เดือน
			 {
				 dd = "01";
				 mm = "0" + mm.toString(); 
			 } else {
				 dd = "0" + dd.toString();
				 mm = "0" + mm.toString();
			 }
			 return dd.substr(-2) + "-" + mm.substr(-2) + "-" + yy.toString();
		 },			
	}); 
 
	Ext.eventGrid = Ext.apply({
		click:'',
		click2:'',
	});
	/* store
		*
		*
		*/
	Ext.storeInvoice = new Ext.data.JsonStore({
			storeId: 'myStoreOrders',
			//autoDestroy: true,
			autoLoad: true,
			url : 'api/ListBillingOrders.php',
			root: 'data',
			baseParams: { i_read:user_right_read }, //Permission i_read
			idProperty: 'id',
			totalProperty: 'totalCount',
			listeners: {
				load: {
						fn: function(){
							//alert("");
						}
				},
				exception: function(misc) {
					alert("Holy cow, we're getting an exception!");
				}
			},
			fields: [
				{ name: 'no' },
				{ name: 'id' },	
				{ name: 'ar_bill_invoice_hdr_id', type: 'int' },				
				{ name: 'ar_so_hdr_id', type: 'int' },				
				{ name: 'so_code', type: 'string' },
				{ name: 'bl_code', type: 'string' }, 
				{ name: 'c_code', type: 'string' }, 
				{ name: 'delID' },				
				{ name: 'editID' },	
				{ name: 'iDel' },		
				{ name: 'iDel' },		
				{ name: 'close_yyyy_mm' },				
				{ name: 'c_invoice_item', type: 'string' },
				{ name: 'd_endpay_date', type: 'string' }, 
				{ name: 'c_address', type: 'string' }, 
				{ name: 'c_tax_value', type: 'string' }, 
				{ name: 'c_email', type: 'string' }, 
				{ name: 'c_website', type: 'string' }, 
				{ name: 'c_fax', type: 'string' }, 
				{ name: 'c_mobile', type: 'string' }, 
				{ name: 'c_telephone', type: 'string' }, 
 
				{ name: 'txtdc_debtor_idID', type: 'string' }, 
				{ name: 'c_name_inv', type: 'string' },
				{ name: 'c_address_inv', type: 'string' },			
				{ name: 'condition_pay', type: 'string' },
				{ name: 'due_bill', type: 'string' }, 
				{ name: 'dc_cost_id', type: 'int' },
				{ name: 'dc_area_id', type: 'int' },			
				{ name: 'c_area_name', type: 'string' }, 
				{ name: 'dc_debtor_id', type: 'int' },
				{ name: 'c_debtor_name', type: 'string' }, 
				
				{ name: 'c_cost_name'},	 
				{ name: 'd_billing_date'},
				{ name: 'd_doc_date'},
				{ name: 'c_po_no', type: 'string' }, 
				{ name: 'd_so_date'},	
				{ name: 'c_billing_date'},			
				{ name: 'c_status'}, 
		 
				{ name: 'dc_vat_id' },
				{ name: 'f_vat_rate' },
				{ name: 'f_vat_amt' }, 
				{ name: 'f_tax_amt' },  
				{ name: 'f_before_edit_vat' }, 
				{ name: 'f_net_cost' }, //this - (f_vat_amt+f_tax_amt) 
				{ name:'c_comment', type: 'string' },  
				{ name:'dc_user_create_id' },
				{ name:'dc_user_create_cost_id' },
				{ name:'d_create' },
				{ name:'dc_user_update_id' },
				{ name:'dc_user_update_cost_id' },
				{ name:'d_update' },
		]
			
			});
	Ext.store = new Ext.data.JsonStore({
			storeId: 'myStore',
			autoDestroy: true,
			autoLoad: true,
			url : 'api/ListReceive.php',
			root: 'data',
			baseParams: { i_read:user_right_read }, //Permission i_read
			idProperty: 'id',
			totalProperty: 'totalCount', 
			listeners: {
				load: {
						fn: function(){
							//alert("");
						}
				},
				exception: function(misc) {
					alert("Holy cow, we're getting an exception!");
				}
			},			
			fields: [
				{ name: 'no' },
				{ name: 'id' },	
				{ name: 'ar_so_hdr_id', type: 'int' },	
				{ name: 'ar_bill_invoice_hdr_id', type: 'int' },				
				{ name: 'so_code', type: 'string' },
				{ name: 'inv_code', type: 'string' }, 
				{ name: 'c_code', type: 'string' }, 
				{ name: 'c_name', type: 'string' }, 
				{ name: 'delID' },				
				{ name: 'editID' },	
				{ name: 'iDel' },		
				{ name: 'iDel' },		
				{ name: 'close_yyyy_mm' },				
				{ name: 'c_invoice_item', type: 'string' },
				{ name: 'd_endpay_date', type: 'string' }, 
				{ name: 'c_address', type: 'string' }, 
				{ name: 'c_tax_value', type: 'string' }, 
				{ name: 'c_email', type: 'string' }, 
				{ name: 'c_website', type: 'string' }, 
				{ name: 'c_fax', type: 'string' }, 
				{ name: 'c_mobile', type: 'string' }, 
				{ name: 'c_telephone', type: 'string' }, 
 
				{ name: 'txtdc_debtor_idID', type: 'string' }, 
				{ name: 'c_name_inv', type: 'string' },
				{ name: 'c_address_inv', type: 'string' },			
				{ name: 'condition_pay', type: 'string' },
				{ name: 'due_bill', type: 'string' }, 
			    { name: 'dc_cost_id', type: 'int' },
				{ name: 'dc_area_id', type: 'int' },			
				{ name: 'c_area_name', type: 'string' }, 
				{ name: 'dc_debtor_id', type: 'int' },
				{ name: 'c_debtor_name', type: 'string' }, 
				
				{ name: 'c_cost_name'},	 
				{ name: 'c_doc_date'},
				{ name: 'd_doc_date'},
				{ name: 'c_po_no', type: 'string' }, 
				{ name: 'd_so_date'},	
				{ name: 'c_billing_date'},			
				{ name: 'c_status'}, 
		 
			{ name: 'fi_pymt_voucher_type_id', type: 'int' },
			{ name: 'dc_bank_acc_company_id', type: 'int' },
			{ name: 'dc_bank_id', type: 'int' },
			{ name: 'dc_bank_branch_id', type: 'int' },
			{ name: 'c_cheq_code' },
			{ name: 'd_cheq_date' },
			
				{ name: 'receipt_book' }, 
				{ name: 'receipt_book_no' }, 
				{ name: 'f_total_cost' },
				{ name: 'f_disc_amt' },
				{ name: 'f_vat_amt' }, 
				{ name: 'f_before_edit_vat' }, 
				{ name: 'f_tax_amt' },  
				{ name: 'f_net_cost' },
				{ name: 'f_vat_rate' },		
				{ name:'c_remark', type: 'string' },  
				{ name:'dc_user_create_id' },
				{ name:'dc_user_create_cost_id' },
				{ name:'d_create' },
				{ name:'dc_user_update_id' },
				{ name:'dc_user_update_cost_id' },
				{ name:'d_update' },
		]
	});	

		Ext.storeAcc	= new Ext.data.JsonStore({ 
			storeId: 'myStore1', 
			autoLoad: true,
			url : 'api/All_ArCombo.php',
			root: 'data',
			baseParams: { type : 'storeAcc' }, //Permission i_read
			idProperty: 'id',
			totalProperty: 'totalCount', 
			fields: [ 'id', 'c_code', 'c_name']
		}); 

		Ext.storeDcUnitType	= new Ext.data.JsonStore({
			//autoDestroy: true,
			autoLoad: true,
			url: 'api/All_ArCombo.php',
			baseParams: {type : 'dc_unit_type'},
			root: 'data',
			idProperty: 'id',
			fields: [ 'id', 'c_name']
		});

		Ext.storeDebtor = new Ext.data.JsonStore({ 
			autoLoad: true,
			storeId: 'myStoreCnt',
			url: 'api/All_ArCombo.php',
			baseParams: {type : 'storeDebtor'},
			root: 'data',
			idProperty: 'id',
			totalProperty: 'totalCount', 
			fields: ['no','id','c_title','c_name','c_code'
			,'c_address','c_telephone','c_mobile','c_tax_value','c_ref_value'
			,'c_website','c_email','cnt_type_name'
			],
		});

		Ext.storeCost = new Ext.data.JsonStore({ 
			autoLoad: true,
			storeId: 'myStoreCost',
			url: 'api/All_ArCombo.php',
			baseParams: {type : 'storeCost'},
			root: 'data',
			idProperty: 'id',
			totalProperty: 'totalCount',
			fields: [ 'no','id', 'c_code','c_name']
		});

		Ext.storeDcProduct = new Ext.data.JsonStore({ 
			autoLoad: true,
			storeId: 'myStorePro',
			url: 'api/All_ArCombo.php',
			baseParams: {type : 'storePro'},
			root: 'data',
			idProperty: 'id',
			totalProperty: 'totalCount',
			fields: [ 'no','id', 'c_code','c_name']
		});

		Ext.storeDtl = new Ext.data.JsonStore({
			storeId: 'myStoreDtl', 
			url : 'api/ListOrderDtl.php',
			root: 'data', 
			idProperty: 'id',
			totalProperty: 'totalCount',
			sortInfo:{ field: 'i_seq', direction: 'ASC'}  , 	
			fields: [
				{ name: 'no' },
				{ name: 'id' },		
				{ name: 'soDtlID' },	
				{ name: 'soDtlEditID' }, 
				{ name: 'dc_product_id', type: 'int' },
				{ name: 'txtdc_product_idID', type: 'string' },
				{ name: 'c_code', type: 'string' },
				{ name: 'c_name', type: 'string' },  
				{ name: 'i_enable', type: 'int'  },		
				
				{ name:'i_is_jingle' },
				{ name:'i_seq', type: 'int'  },	
				{ name:'c_type' },
				{ name:'f_tax_amt' },
				{ name:'f_quan' },
				{ name:'f_total_cost' },
				{ name:'f_disc_com_amt' },
				{ name:'f_disc_com' }, 
				{ name:'f_disc_cash_amt_bal' },
				{ name:'f_disc_cash' },
				{ name:'f_disc_cash_amt' }, 
				{ name:'f_net_cost' }, 		
				{ name:'f_vat_amt' }, 
				{ name:'f_net_vat_amt' },
				{ name:'dc_user_create_id' }, 				
				{ name:'dc_user_create_cost_id' },
				{ name:'d_create' },
				{ name:'dc_user_update_id' },
				{ name:'dc_user_update_cost_id' },
				{ name:'d_update' },
		]
		});	
 
		Ext.voucherTypeStore = new Ext.data.JsonStore({ 
			autoLoad: true,
			storeId: 'myStoreVoucherType',
			url: 'api/All_ArCombo.php',
			baseParams: {type : 'voucherTypeStore'},
			root: 'data',
			idProperty: 'id',
			totalProperty: 'totalCount',
			fields: ['id', 'c_name','c_code']
		}); 

		Ext.dcBankAccStore = new Ext.data.JsonStore({ 
			autoLoad: true,
			storeId: 'myStoreDcBankAcc',
			url: 'api/All_ArCombo.php',
			baseParams: {type : 'dcBankAccStore'},
			root: 'data',
			idProperty: 'id',
			totalProperty: 'totalCount',
			fields: ['id', 'dc_acc_id', 'c_name','c_code']
		}); 
		Ext.dcBankStore = new Ext.data.JsonStore({ 
			autoLoad: true,
			storeId: 'myStoreDcBank',
			url: 'api/All_ArCombo.php',
			baseParams: {type : 'dcBankStore'},
			root: 'data',
			idProperty: 'id',
			totalProperty: 'totalCount',
			fields: ['id', 'c_name','c_code']
		}); 
		Ext.dcBankBranchStore = new Ext.data.JsonStore({ 
			autoLoad: true,
			storeId: 'myStoreDcBankBranch',
			url: 'api/All_ArCombo.php',
			baseParams: {type : 'dcBankBranchStore'},
			root: 'data',
			idProperty: 'id',
			totalProperty: 'totalCount',
			fields: ['id', 'c_name','c_code']
		}); 
 
		//
	var columnMini 	= [{ header: "ID System", sortable: true, hidden:true, dataIndex: 'id' },
			{ header: "รหัส", sortable: true, dataIndex:'c_code' , },
			{ header: "ชื่อ"
				, sortable: true
				, id: 'c_name' 
				, dataIndex: 'c_name',
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
						metaData.attr = "style='cursor:pointer';";
					return value; 
				} 
			}];	
		
		Ext.PopCostForm 	= new Ext.ux.Poplov({ 
				text		: 'หน่วยงานเจ้าของเรื่อง',  
				id			: 'dc_cost_idID',	//go to relation	
				iconCls		: 'page_magnify', 
				valueHidden : 'dc_cost_id', 	//go to hidden
				store		: Ext.storeCost,
				headerGrid	: columnMini,
				widthText	: 280,  
				fieldLabel	: 'หน่วยงานเจ้าของเรื่อง ',  
		});
					
		/* Ext.PopCntForm = new Ext.ux.Poplov({ 
				text		: 'ชื่อลูกค้า',  
				id			: 'dc_debtor_idID',	//go to relation	
				iconCls		: 'page_magnify', 
				valueHidden : 'dc_debtor_id', 		//go to hidden
				store		: Ext.storeDebtor,
				headerGrid	: columnMini,
				widthText	: 330,  
				fieldLabel	: 'ชื่อลูกค้า',  
				isCellClickGrid:true, 
				afterrender: function(){   }, 
				cellClickGrid:function(grid, rowIndex, columnIndex, e) { 
				
					var id = 'dc_debtor_idID';
					var nameID = id+'_Name';
					var record 		= grid.getStore().getAt(rowIndex);  
					var TextShow 	= record.data.c_code+' '+record.data.c_name;
					
					Ext.getCmp(id).setValue(record.data.id);
					Ext.getCmp(nameID).setValue(TextShow);  
					Ext.getCmp("win-pop-lov"+id).hide();  					
					Ext.getCmp("win-pop-lov"+id).destroy();  
					
					record.set("c_code",Ext.getCmp('so_codeID').getValue()); // 
					
					Ext.getCmp('frm-so-hdrID').getForm().loadRecord(record || {});
	 
				},
		}); */
		
		Ext.PopDebtorSearch = new Ext.ux.Poplov({ 
				text		: 'ชื่อลูกค้า',  
				id			: 'dc_debtor_id1ID',	//go to relation	
				iconCls		: 'page_magnify', 
				valueHidden : 'dc_debtor_id', 		//go to hidden
				store		: Ext.storeDebtor,
				headerGrid	: columnMini,
				widthText	: 300,  
				fieldLabel	: 'ชื่อลูกค้า',   
		});
 
	/* Function  
	*
	*
	*/

	
	function controllTab(record,butt){ 
		
		Ext.eventGrid.click=butt;
		Ext.rate = Ext.apply({
			f_vat_rate:record.get('f_vat_rate'), 
		}); // Ext.rate.f_vat_rate
		
		if(butt=='add'){  
			
			Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-dtlID'), true) || {}; //null obj not errer
			Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-hdrID'), true) || {}; //null obj not errer
 
			var frmSoHdr = new formSoHdr();  
								Ext.getCmp('contenterCenter').add(frmSoHdr); 
								Ext.getCmp('contenterCenter').setActiveTab(frmSoHdr); 
								//set Add Order to Billing
								record.set('inv_code',record.get('c_code')); 
 
								record.set('id',null); 
								record.set('c_code',null); 
								record.set('c_comment',null);
								record.set('d_doc_date',Ext.getDate.getNowCarlen()); 
 
								//
								frmSoHdr.getForm().loadRecord(record);  
								
								DisbledButton(false,'add');
			
		}else if(butt=='edit' || butt=='view'){ 
			
			//-----------------
			Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-dtlID'), true) || {}; //null obj not errer
			Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-hdrID'), true) || {}; //null obj not errer
			//-----------------
			var frmSoHdr = new formSoHdr();  
			Ext.getCmp('contenterCenter').add(frmSoHdr);  
			frmSoHdr.getForm().loadRecord(record);  
			Ext.getCmp('contenterCenter').setActiveTab(frmSoHdr); 
 
			//-----------------
 
				var frmSoDtl = new formBlDtlEdit();  //new formSoDtl();  
									Ext.getCmp('contenterCenter').add(frmSoDtl); 
									Ext.getCmp('contenterCenter').setActiveTab(frmSoDtl); 
				
//setStyle text-decoration: underline;

				Ext.get('f_net_cost_sumID').setStyle('text-decoration','underline');
//				
				frmSoDtl.getForm().loadRecord(record); 
				Ext.storeBlDtl.reload({ 
					params: { mode:'GETDATA',id:Ext.getCmp('blHdrID').getValue()},
					callback: function(records, operation, success) {  
						   if (success){ 
								new Ext.ToolTip({
									target: 'f_vat_amt_sumID',
									html:'ภาษีมูลค่าเพิ่ม แก้ไขได้ไม่เกิน (+/-) 0.02 บาท',
								});	
								new Ext.ToolTip({
									target: 'f_tax_amt_sumID',
									html:'ภาษีหัก ณ แก้ไขได้ไม่เกิน (+/-) 0.02 บาท',
								});	 
  
								for(i=0;i<records.length;i++){ 
										if(records[i].get('id')!='grandTotal'){  
											Ext.select('#f_disc_comID'+records[i].get('id')).on('blur', function() {   
												calDiscCom(this,records);  
												
											});	  
											 
										}  
								 }// loop 
								 //console.log(Ext.Dtl);
							 
						   } 
						},
					});  
				
			// 
			//-----------------
			Ext.getCmp('modeID').setValue('EDIT'); 
			
			if(butt=='view'){ 
				DisbledButton(true,{}); 
				Ext.storeDtl.setBaseParam("accessData", "view");
			}else{  
				DisbledButton(false,{}); 
				Ext.storeDtl.setBaseParam("accessData", "edit"); 
				 
			}
 
		}else if(butt=='remove'){
				var win = new Ext.Window({
			id : "win-msg-delete",
			title : "Remove",
			modal: true,
			width : 250,
			height : 130,
			html: "ท่านต้องการที่จะลบข้อมูล ?",
			buttons : [
				{
					text : "Confirm",
					handler : function() {
						Ext.Ajax.request({
							url : 'api/mnFiReceive.php' , 
							params : { 
								mode : 'DELETE', 
								statusBu:'del',
								id : record.get('id'),
								ar_bill_invoice_hdr_id:record.get('ar_bill_invoice_hdr_id'),
							}, 
							method: 'GET', //POST
							success: function ( result, request ) { 
								var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
								if (jsonData.success) { 
									Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-dtlID'), true) || {}; //null obj not errer
									Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-hdrID'), true) || {}; //null obj not errer
								} 
								Ext.getCmp("win-msg-delete").hide();						// hidden window-panel
								Ext.getCmp("win-msg-delete").destroy();						// clear memory :: garbage collection
								Ext.getCmp('tabpanel1').getStore().reload();				// reload grid & store
								
							},
							failure: function ( result, request) { 
								Ext.MessageBox.alert('Failed', result.responseText);		// connect error
							}
						});
					}
				},
				{
					text : "Cancel",
					handler : function() {
						Ext.getCmp("win-msg-delete").hide();
						Ext.getCmp("win-msg-delete").destroy();
						Ext.getCmp('tabpanel1').getStore().reload();
					}
				}
			]
		}).show();
		}else if(butt=='cancel'){
				var win = new Ext.Window({
			id : "win-msg-delete",
			title : "Remove",
			modal: true,
			width : 250,
			height : 130,
			html: "ท่านต้องการที่จะยกเลิกรายการ ?",
			buttons : [
				{
					text : "Confirm",
					handler : function() {
						Ext.Ajax.request({
							url : 'api/mnFiReceive.php' , 
							params : { 
								mode : 'DELETE', 
								statusBu:'cancel',
								id : record.get('id'),
								ar_bill_invoice_hdr_id:record.get('ar_bill_invoice_hdr_id'),
								
							}, 
							method: 'GET', //POST
							success: function ( result, request ) { 
								var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
								 if (jsonData.success) { 
									Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-dtlID'), true) || {}; //null obj not errer
									Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-hdrID'), true) || {}; //null obj not errer
								 }
								Ext.getCmp("win-msg-delete").hide();						// hidden window-panel
								Ext.getCmp("win-msg-delete").destroy();						// clear memory :: garbage collection
								Ext.getCmp('tabpanel1').getStore().reload();				// reload grid & store
								
							},
							failure: function ( result, request) { 
								Ext.MessageBox.alert('Failed', result.responseText);		// connect error
							}
						});
					}
				},
				{
					text : "Cancel",
					handler : function() {
						Ext.getCmp("win-msg-delete").hide();
						Ext.getCmp("win-msg-delete").destroy();
						Ext.getCmp('tabpanel1').getStore().reload();
					}
				}
			]
		}).show();
				
		}		
			
		return true;
	}; //End

	function calDiscCom(obj,records){

	
			var f_disc_comSumID = null;
			var f_tax_amtSumID = null;
			var f_net_costSumID = null;
			var f_after_disc_amtSumID = null;
			
			for(i=0;i<records.length;i++){ 
					if(records[i].get('id')!='grandTotal')
					{ 
						
						var id 			= records[i].get('id');
					 
						var f_tax_rate 		= parseFloat(Ext.get('f_tax_rateID'+id).dom.value.replace(/,/g,'')/1);
						var f_total_cost 	= parseFloat(Ext.get('f_total_costID'+id).dom.value.replace(/,/g,'')/1); 
						var f_disc_com 		= parseFloat(Ext.get('f_disc_comID'+id).dom.value.replace(/,/g,'')/1); 

						if(f_disc_com>f_total_cost){
							Ext.MessageBox.alert('Failed', 'ไม่สารถกรอกเงินส่วนลด '+Ext.get('f_disc_comID'+id).dom.value+' มากกว่า'+Ext.get('f_total_costID'+id).dom.value,function(){ 
								Ext.get('f_disc_comID'+id).dom.focus();  
							return false;
							});
						}						
						var f_after_disc 	= parseFloat(f_total_cost)-parseFloat(f_disc_com.toFixed(2));
						
						var f_tax_amt 		= ((f_after_disc*f_tax_rate)/100).toFixed(2);
						
						Ext.get('f_tax_amtID'+id).dom.value=Ext.floatRenderer(f_tax_amt);  
						
						var f_net_cost		= parseFloat(f_after_disc)-parseFloat(f_tax_amt);
						
						Ext.get('f_net_costID'+id).dom.value=Ext.floatRenderer(f_net_cost.toFixed(2));  
						
						
						f_disc_comSumID 		+=f_disc_com;
						f_tax_amtSumID 			+=parseFloat(f_tax_amt);
						f_net_costSumID 		+=f_net_cost;
						f_after_disc_amtSumID 	+=f_after_disc; //cal vat rate
						
						
						Ext.get('f_disc_comID'+id).dom.value=Ext.floatRenderer(f_disc_com.toFixed(2)); 
						
						
						//records[i].set('f_disc_comVal')
						
					 
					} 
			 }// loop 	 
			 
			Ext.get('f_disc_comSumID').dom.value=Ext.floatRenderer(f_disc_comSumID.toFixed(2)); 
			Ext.get('f_tax_amtSumID').dom.value=Ext.floatRenderer(f_tax_amtSumID.toFixed(2)); 
			Ext.get('f_net_costSumID').dom.value=Ext.floatRenderer(f_net_costSumID.toFixed(2)); 
		 
		 Ext.getCmp('f_disc_amtID').setValue(Ext.get('f_disc_comSumID').dom.value);
		 Ext.getCmp('f_after_disc_amtID').setValue(Ext.floatRenderer(f_after_disc_amtSumID));
		 
		 		// vat
		var f_vat_amt = ((f_after_disc_amtSumID*Ext.rate.f_vat_rate)/100).toFixed(2);
		Ext.getCmp('f_vat_amt_sumID').setValue(Ext.floatRenderer(f_vat_amt));
		Ext.vatOld = f_vat_amt;
		Ext.taxOld = f_tax_amtSumID.toFixed(2);
		Ext.getCmp('f_tax_amt_sumID').setValue(Ext.floatRenderer(Ext.floatRenderer(f_tax_amtSumID.toFixed(2))));
		
		var f_net_cost_add_vat_sumID = parseFloat(f_after_disc_amtSumID)+parseFloat(f_vat_amt);
		Ext.getCmp('f_net_cost_add_vat_sumID').setValue(Ext.floatRenderer(f_net_cost_add_vat_sumID.toFixed(2)));

		var f_net_costSumTaxID = parseFloat(f_net_cost_add_vat_sumID.toFixed(2))-parseFloat(f_tax_amtSumID.toFixed(2));
		Ext.getCmp('f_net_cost_sumID').setValue(Ext.floatRenderer(f_net_costSumTaxID));
		 
		 Ext.sumDtl = Ext.apply({ //f_total_cost_sumID
			 f_total_cost:Ext.getCmp('f_total_cost_sumID').getValue(),
			 f_dis_amt:Ext.get('f_disc_comSumID').dom.value,
			 f_after_disc_amt:Ext.floatRenderer(f_after_disc_amtSumID),
			 f_vat_amt:Ext.floatRenderer(f_vat_amt),
			 f_net_cost_add_vat:Ext.floatRenderer(f_net_cost_add_vat_sumID.toFixed(2)), //f_net_cost_add_vat_sumID 
			 f_tax_amt:Ext.floatRenderer(Ext.floatRenderer(f_tax_amtSumID.toFixed(2))), 
			 f_before_edit_vat :Ext.floatRenderer(Ext.vatOld),
			 f_before_edit_tax:Ext.floatRenderer(f_tax_amtSumID.toFixed(2)),
			 f_net_cost:Ext.floatRenderer(f_net_costSumTaxID), //f_net_cost_sumID
		 });
		console.log('calDiscCom Ext.sumDtl => '); 	
		console.log(Ext.sumDtl); 		
	} 
	function getStorePrintingHtml(id,bl_code){
		//storePrinting  
		Ext.Ajax.request({
							url : 'api/InvoicePrint.php' , 
							params : { 
								mode : 'CHECKCLOSEBILLING', 
								id:id,  
							}, 
							method: 'GET', //POST
							success: function ( result, request ) { 
								var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
								if (jsonData.success) { 
									var myWindow = window.open('', '', 'width=600,height=400'); 
									myWindow.document.write(jsonData.data.html); 
									myWindow.print();  
								}  
								  
							},
							failure: function ( result, request) { 
								Ext.MessageBox.alert('Failed', result.responseText);		// connect error
							}
						}); 	
		
	}
 
	
  	function cellClick(grid, rowIndex, columnIndex, e) { 
		var record = grid.getStore().getAt(rowIndex); 
		if (columnIndex==grid.getColumnModel().getIndexById('edit')) {
			 
			 if(record.get('editID')!='')controllTab(record,'edit'); 
			 
				/* Ext.Ajax.request({
					url : 'api/mnFiReceive.php' , 
					params : { 
						mode : 'CHECKCLOSEBILLING', 
						d_doc_date:record.get('d_doc_date'),  
						check:'edit'
					}, 
					method: 'GET', //POST
					success: function ( result, request ) { 
						var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
						if (jsonData.data.invalid==1) { 
							Ext.Msg.alert('Failure',jsonData.msg); 
						}else{ 
							if(record.get('editID')!='')controllTab(record,'edit'); 	
						}	   
					},
					failure: function ( result, request) { 
						Ext.MessageBox.alert('Failed', result.responseText);		// connect error
					}
				});  */
			 			
			
		} else if (columnIndex==grid.getColumnModel().getIndexById('view')) {
			controllTab(record,'view'); 	
		} else if (columnIndex==grid.getColumnModel().getIndexById('remove')) {
	
			if(record.get('iDel')!=0){
				if(record.get('iDel')==1)
					controllTab(record,'remove'); 
				else 
					Ext.Ajax.request({
						url : 'api/mnFiReceive.php' , 
						params : { 
							mode : 'CHECKCLOSEBILLING', 
							d_doc_date:record.get('d_doc_date'),  
							check:'edit'
						}, 
						method: 'GET', //POST
						success: function ( result, request ) { 
							var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
							if (jsonData.data.invalid==1) { 
								Ext.Msg.alert('Failure',jsonData.msg); 
							}else{ 
								controllTab(record,'cancel'); 	
							}	   
						},
						failure: function ( result, request) { 
							Ext.MessageBox.alert('Failed', result.responseText);		// connect error
						}
					}); 
			}
	
		} else if (columnIndex==grid.getColumnModel().getIndexById('c_code')) {
			if(record.get('c_code')!='0'){
				console.log(record);
				 getStorePrintingHtml(record.get('id'),record.get('c_code'));
			}
		}
	};  	
 
	function cellClickOrders(grid, rowIndex, columnIndex, e) { 
		var record = grid.getStore().getAt(rowIndex);   
		controllTab(record,'add'); 
		Ext.getCmp('win-pop-lovsoID').destroy();
	}	
 
	function DisbledButton(t,act){
		//Disabled etc...
		if(act=='add'){
			if(t){
				Ext.getCmp('buSaveID').hide(); 
			}else{
				Ext.getCmp('buSaveID').show(); 
			}
			
		}else{
			if(t){
				Ext.getCmp('buSaveID').hide();
				Ext.getCmp('buPrintCode').hide();
				//Ext.getCmp('buAddProID').hide();
			}else{
				Ext.getCmp('buSaveID').show();
				Ext.getCmp('buPrintCode').show();
				//Ext.getCmp('buAddProID').show();
				
			}
		}

		//Ext.getCmp('Budc_debtor_idID').hide();
	}

 	
	function windowOrders(record,butt){

		Ext.eventGrid.click2=butt;
		
		var gridOrders = { 
				xtype: 'grid', 
				border: false,
				id:'gridOrdersID',
				stripeRows: true,
				loadMask: true,
				store: Ext.storeInvoice,
				tbar: [new searchGridOrders()],
			columns:[
					new Ext.grid.RowNumberer({
					width:35,
					header:" No ",
			renderer:function(value, metaData, record, row, col, store, gridView){
				return record.get('no');
				}
			}),
			{ header: "ID System", sortable: true, hidden:true, dataIndex: 'id' },
			{ header: "รหัส", sortable: true, dataIndex: 'c_code',id:'c_code' ,
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					metaData.attr = "align='center'";   
					metaData.attr='ext:qtip="' + value + " = " + ' คลิ๊กเพื่อรับเงิน' + '"'; 
						
				return value;
			}},
			{ header: "รหัสสั่งขาย", sortable: true, dataIndex: 'so_code' ,width:70, }, 
			{ header: "รายการวางบิล", sortable: true, dataIndex: 'c_invoice_item' ,width:150, }, 			
			{ id: 'c_debtor_name', header: "ลูกค้า", width:210, sortable: true, dataIndex: 'c_debtor_name' }, 
			{ header: "หน่วยงาน", sortable: true, dataIndex: 'c_cost_name' ,width:120, },
			{
				header: "วันที่ใบวางบิล",  
				sortable:false,
				align: 'center', 
				dataIndex: 'c_billing_date',
				renderer:function(value, metaData, record, row, col, store, gridView){  
					 return value;
				}
			},
			{
				header: "สถานะ",  
				sortable:false,
				align: 'center', 
				dataIndex: 'c_status'
			},
			{
				header: "จำนวนเงินสุทธิ",  
				sortable:false,
				align: 'right', 
				id:'my-elemdd',
				dataIndex: 'f_net_cost',
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					 var deviceDetail = value + " = " + ' มาจากยอดรวม หักภาษี ณ ที่จ่าย และรวม ภาษีมูลค่าเพิ่ม';
						metaData.attr='ext:qtip="' + deviceDetail + '"'; 
				  return value;
				} 
			}, 			
			],
				
				bbar: new Ext.PagingToolbar({
					pageSize: 20,
					store: Ext.storeInvoice,
					displayInfo: true,
					displayMsg: 'Displaying topics {0} - {1} of {2}'
				})
			};

		var id='soID';  
		var winFrm = new Ext.Window({
			id : "win-pop-lov"+id,
			title : "เลือกรายการวางบิลแจ้งหนี้ เพื่อชำระเงิน",
			modal: true, 
			plain: true,  
			frame: true,
			layout: "fit", 
			maximizable: true, 
			constrainHeader: true, 
			closable: true, 
			listeners: {
						afterrender: function( obj, eOpts )
						{
							this.fn = function(widht,height){ //percentage 
								var width = Ext.getBody().getViewSize().width * widht;
								var height = Ext.getBody().getViewSize().height * height;
								this.setSize(width, height);
							}
								this.fn(.70,.75); 
								Ext.storeInvoice.reload();
						},
						 "maximize": function(window, opts) { //when property minimizable 
								window.setWidth(Ext.getBody().getViewSize().width*.99);
								window.expand('', false);
								window.center(); 
						 }
			},
			items:[gridOrders], //items
		}).show();  
	 
		Ext.getCmp('gridOrdersID').on('cellclick', cellClickOrders, this); 
		//gridOrdersID 
	};
	
	var itemsSoHdr = [{
			xtype:'hidden', name:'id', id:'hdrID'
		},{
			xtype:'hidden', name:'ar_so_hdr_id', id:'soHdrID'
		},{
			xtype:'hidden', name:'ar_bill_invoice_hdr_id', id:'blHdrID'
		},{
			xtype:'hidden', name:'mode', id:'modeID', value:'ADD' //
		},{
			xtype:'hidden', name:'dc_cost_id' 
		},{
			xtype:'hidden', name:'dc_area_id' 
		},{
			xtype:'hidden', name:'removeDtl', id:'removeDtlID', value:'',
		},{ 
			xtype:'textfield', fieldLabel:'เลขที่ใบเสร็จรับเงิน/ใบกำกับภาษี'  ,name:'c_code', value:'0',readOnly:true,

		} 
		,{ xtype:'hidden', name:'dc_debtor_id',} //dc_debtor_id
			//Ext.PopCntForm.mini 
		,{ xtype:'textfield', fieldLabel:'ลูกค้า'  ,name:'txtdc_debtor_idID', readOnly:true,}		
			, {
				xtype: 'fieldset',
				title: 'ข้อมูลลูกค้า',
				autoHeight: true,
				id:'fieldsetID',
				layout: 'form',
				collapsed: false,   // initially collapse the group
				collapsible: true, 
				items: [{ xtype:'displayfield', fieldLabel:'เลขประจำตัวผู้เสียภาษีอากร' ,name:'c_tax_value',  }	
						, { xtype:'displayfield', fieldLabel:'ที่อยู่' ,name:'c_address',  }	
						, { xtype:'displayfield', fieldLabel:'โทรศัพท์' ,name:'c_telephone', }	
						, { xtype:'displayfield', fieldLabel:'โทรศัพท์เคลื่อนที่' ,name:'c_mobile',  } 
						, { xtype:'displayfield', fieldLabel:'อีเมล์' ,name:'c_email',  }],
			} , { 
				html: "<hr/><p>&nbsp;</p>", style: 'display: block;margin-top: 0.5em; margin-bottom: 0.5em; margin-left: auto; margin-right: auto; border-style: hidden;'
 	},{ 
			xtype:'textfield', fieldLabel:'เลขที่ Order'  ,name:'so_code', readOnly:true,  
	},{ 
			xtype:'textfield', fieldLabel:'เลขที่ใบวางบิล/แจ้งหนี้'  ,name:'inv_code', readOnly:true,
	},{ 
			xtype:'textfield', fieldLabel:'วันที่ใบวางบิล/แจ้งหนี้'  ,name:'d_billing_date', readOnly:true,  
	},{ 
			xtype:'textfield', fieldLabel:'วันที่ครบกำหนดชำระ'  ,name:'d_endpay_date', readOnly:true,  

	},{
		html: "<hr/><p>&nbsp;</p>", style: 'display: block;margin-top: 0.5em; margin-bottom: 0.5em; margin-left: auto; margin-right: auto; border-style: hidden;'
	},{
		
		xtype: 'compositefield',
		fieldLabel: 'ระบุใบเสร็จรับเงินเล่มที่/เลขที่',
		msgTarget : 'side', 
		width   : 500,
		defaults: { flex: 1 }, 
		items: [
		{ xtype:'displayfield' ,value:'เล่มที่ :',width   : 50 },
		{ xtype:'textfield', name:'receipt_book',validator: function(val) { 
							var regex  = /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\.[0-9]{1,2})?$/; 
							if (!regex.test(val))
							{ return "กรุณากรอก เล่มที่/เลขที่"; } else {
								return true;
							}
						},},
		{ xtype:'displayfield' ,value:'เลขที่ :',width   : 50 },
		{ xtype:'textfield' ,name:'receipt_book_no',validator: function(val) { 
							var regex  = /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\.[0-9]{1,2})?$/; 
							if (!regex.test(val))
							{ return "กรุณากรอก เลขที่"; } else {
								return true;
							}
						},},]
	},{
		
		
		xtype: 'datefield', 
		fieldLabel: 'วันที่รับเงิน',
		id : 'd_doc_dateID', 
		name : 'd_doc_date', 
		width:150,
		value :Ext.getDate.getNowCarlen(), 
		validator: function(val) { return Ext.isEmpty(val)?"กรุณาใส่ วันที่รับเงิน":true;},
		
	},{ // 
		xtype:'textfield', fieldLabel:'วันที่ทำรายการ '  ,name:'d_create', readOnly:true,  
/* 	},{ //  
		xtype:'displayfield', fieldLabel:'หน่วยธุรกิจ ' ,name:'c_area_name', */
	},{ //ประเภทการรับเงิน
						width:          250, 
						xtype:          'combo',
						mode:           'local',
						value:          Ext.global.TypeDefault,
						triggerAction:  'all',
						forceSelection: true,
						editable:       false,
						fieldLabel:     'ประเภทการรับเงิน',
						id:           	'fi_pymt_voucher_type_idID',
						name:           'fi_pymt_voucher_type_id',
						hiddenName:     'fi_pymt_voucher_type_id',
						displayField:   'c_name',
						valueField:     'id',
						store			:Ext.voucherTypeStore, 
						listeners: {
							select : function(cb, rec, ind) { this.getRate(rec.get('id')); },
							afterrender:function(){
								this.getRate = function(v){  
									//Ext.getCmp('f_vat_rateID').setValue(v);  
									//console.log('ประเภทการรับเงิน'+v);
									//Default
									Ext.getCmp('dc_cheq_gruop_id1ID').hide();
									Ext.getCmp('dc_cheq_gruop_id2ID').hide();
									Ext.getCmp('dc_cheq_gruop_id3ID').hide();
									Ext.getCmp('dc_cheq_gruop_id4ID').hide();
									Ext.getCmp('dc_bank_gruop_idID').hide();
									
									if(v==2){
										Ext.getCmp('dc_cheq_gruop_id1ID').show();
										Ext.getCmp('dc_cheq_gruop_id2ID').show();
										Ext.getCmp('dc_cheq_gruop_id3ID').show();
										Ext.getCmp('dc_cheq_gruop_id4ID').show(); 
									}else if(v==3){
										Ext.getCmp('dc_bank_gruop_idID').show();
									} 
								}; 
								this.getRate(this.getStore().data.items[0].get('id')); // default
							}, 
						}  
	},{ 
		xtype: 'compositefield',
		fieldLabel: 'ระบุรายละเอียด',
		msgTarget : 'side',
		id:'dc_cheq_gruop_id1ID',
		width   : 500,
		defaults: { flex: 1 }, 
		items: [
		{ xtype:'displayfield' ,value:'เลขที่เช็ค :',width   : 100, },
		{ xtype:'textfield', name:'c_cheq_code', validator: function(val) { return (Ext.isEmpty(val) && Ext.getCmp('fi_pymt_voucher_type_idID').getValue()==2)?"กรุณาใส่ เลขที่เช็ค":true;},}, 
		],
		listeners:{ afterrender:function(){ this.hide();}}
	},{ 
		xtype: 'compositefield', 
		msgTarget : 'side',
		id:'dc_cheq_gruop_id2ID',
		width   : 500,
		defaults: { flex: 1 }, 
		items: [
		{ xtype:'displayfield' ,value:'ธนาคาร  :',width   : 100 },
		{ 
			width:          250, 
			xtype:          'combo',
			mode:           'local',
			value:          Ext.global.BankDefault,
			triggerAction:  'all',
			forceSelection: true,
			triggerAction: 'all',
			//editable:       false,
			//fieldLabel:     'ประเภทการรับเงิน',
			id:           	'dc_bank_idID',
			name:           'dc_bank_id',
			hiddenName:     'dc_bank_id',
			displayField:   'c_name',
			valueField:     'id',
			store			:Ext.dcBankStore, 
			listeners:{ 
			select : function(cb, rec, ind) { this.getRate(rec.get('id')); },
			afterrender:function(){
				this.getRate = function(v){    
					//console.log(' ธนาคาร id:'+v);  
					Ext.dcBankBranchStore.setBaseParam("dc_bank_id", v); 
					Ext.dcBankBranchStore.load({  
						callback: function(records, operation, success) {  
							   if (success){  
								Ext.getCmp('dc_bank_branch_idID').setValue(records[0].get('id'));
							   } 
							},
						});
					
				}; 
				this.getRate(this.getStore().data.items[0].get('id')); // default
			}
			}
		},  
		 ],
		listeners:{ afterrender:function(){ this.hide();}}
	},{  
		xtype: 'compositefield', 
		msgTarget : 'side',
		id:'dc_cheq_gruop_id3ID',
		width   : 500,
		defaults: { flex: 1 }, 
		items: [
		{ xtype:'displayfield' ,value:'สาขา   :',width   : 100 },
		{ 
			width:          250, 
			xtype:          'combo',
			mode:           'local', 
			triggerAction:  'all',
			forceSelection: true,
			editable:       false, 
			id:           	'dc_bank_branch_idID',
			name:           'dc_bank_branch_id',
			hiddenName:     'dc_bank_branch_id',
			displayField:   'c_name',
			valueField:     'id',
			store			:Ext.dcBankBranchStore,  
			
		}, //dc_bank_branch_id 
		 ],
		listeners:{ afterrender:function(){ this.hide();}}
	},{ 
		xtype: 'compositefield', 
		msgTarget : 'side',
		id:'dc_cheq_gruop_id4ID',
		width   : 500,
		defaults: { flex: 1 }, 
		items: [
		{ xtype:'displayfield' ,value:'วันที่ออกเช็ค   :',width   : 100 }, 
		{  
			xtype: 'datefield',  
			id : 'd_cheq_dateID', 
			name : 'd_cheq_date', 
			width:150, 
			validator: function(val) { return (Ext.isEmpty(val) && Ext.getCmp('fi_pymt_voucher_type_idID').getValue()==2)?"กรุณาใส่ วันที่ออกเช็ค":true;}, 
		},
		 ],
		listeners:{ afterrender:function(){ this.hide();}}
	},{
		/*
		* โอนเงิน
		*
		*/ 
		xtype: 'compositefield',
		fieldLabel: 'ระบุรายละเอียด',
		msgTarget : 'side',
		id:'dc_bank_gruop_idID',
		width   : 510,
		defaults: { flex: 1 }, 
		items: [
		{ xtype:'displayfield' ,value:'เลขที่บัญชี  :',width   : 100 },
		{ //ประเภทการรับเงิน
			width:          400, 
			xtype:          'combo',
			mode:           'local',
			value:          1,
			triggerAction:  'all',
			forceSelection: true,
			editable:       false,
			fieldLabel:     'ประเภทการรับเงิน',
			id:           	'dc_bank_acc_company_idID',
			name:           'dc_bank_acc_company_id',
			hiddenName:     'dc_bank_acc_company_id',
			displayField:   'c_name',
			valueField:     'id',
			store			:Ext.dcBankAccStore,   
		}],
		listeners:{ afterrender:function(){ this.hide();}}

	},{ 
 	
	xtype:'textarea',fieldLabel:'คำอธิบายเพิ่มเติม',name:'c_remark', anchor : '-350', }
	
	]; //itemsSoHdr

	//================================================================
	formSoHdr	 = function() { 
		formSoHdr.superclass.constructor.call(this, {  
				listeners:{
					afterrender: function( obj, eOpts ){ /* console.log('Load Finish'); */ },
				},
				id:'frm-so-hdrID',
				url:'api/mnFiReceive.php',
				frame : true,
				bodyStyle : "padding:5px", 
				autoScroll: true,
				width   : 700,  
				labelWidth: 170,
				defaults:{ flex:1, },  
				//closable:true,
				loadMask: true,
				title:'บันทึกการชำระหนี้',
				items:itemsSoHdr, 
				buttonAlign: 'left',
				buttons:[{
					text : 'บันทึกรายการ',
					id:'buSaveID',
					iconCls:'icon-save', 
					handler : function() { 
					Ext.Ajax.request({
							url : 'api/mnFiReceive.php' , 
							params : { 
								mode : 'CHECKCLOSEBILLING', 
								d_doc_date:Ext.getCmp('d_doc_dateID').getValue(),  
							}, 
							method: 'GET', //POST
							success: function ( result, request ) { 
								var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
								var form = Ext.getCmp('frm-so-hdrID').getForm(); 
								
								if (jsonData.data.invalid==1) { 
									Ext.Msg.alert('Failure',jsonData.msg,function(){
										Ext.get('d_doc_dateID').dom.focus(); 
									}); 
								}else if (form.isValid()){ 
								
									 form.submit({
												waitMsg:'Saving Data...',
												success : function(form, action) {    
													Ext.Msg.alert('Success', action.result.msg,function(){  
													
													Ext.getCmp('hdrID').setValue(action.result.data.id);
														Ext.store.reload({  
														callback: function(records, operation, success) {  
															   if (success){  
																 for(i=0;i<records.length;i++){
																	 if(records[i].data.id==action.result.data.id){  
																		controllTab(records[i],'edit'); 
																	 } 
																 }// loop   
															   } 
															},
														}); 
														return true;
													});  
												},
												failure:  function(form, action) {
													switch (action.failureType) {
														case Ext.form.Action.CLIENT_INVALID:
															Ext.Msg.alert('Failure', 'Form fields may not be submitted with invalid values');
															break;
														case Ext.form.Action.CONNECT_FAILURE:
															Ext.Msg.alert('Failure', 'พลข้อผิดพลาดในการเชื่อต่อเครือข่าย');
															break;
														case Ext.form.Action.SERVER_INVALID:
														   Ext.Msg.alert('Failure', action.result.msg);
													}
												}
											}); 
									} //else 
								 
								  
							},
							failure: function ( result, request) { 
								Ext.MessageBox.alert('Failed', result.responseText);		// connect error
							}
						}); 
					

				}//hand
			},{
 				text : Ext.GLOBAL_BU_BACK_TH,
				handler: function() {
					Ext.getCmp('contenterCenter').setActiveTab('tabpanel1'); 
 
				}
			}]

		});
	};
	Ext.extend(formSoHdr, Ext.FormPanel, {});
	//================================================================
	searchGridOrders = function() {

	var filters = {
						xtype: 'combo', 
						id:'filterOrders-ID',
						store: new Ext.data.SimpleStore({
							  fields: ["id", "c_name"],  
							  data:[['c_code', "รหัสวางบิลแจ้งหนี้ (INV)"],['so_code', "รหัส Order (SO)"]],
						}),
						value: 'c_code',
						valueField: 'id',
						displayField: 'c_name',
						submitValue: true,
						hiddenName: 'filter',
						mode: "local",
						triggerAction: "all", 
						forceSelection: true,
						selectOnFocus: true,
						editable:false,
						listeners: {
							select: function(combo, record, index) {
								var newValue = record.data.id;
							}
						}
					};	
 				
	//classOverride				
	searchGridOrders.superclass.constructor.call(this, { 
		initComponent: function(){ 
			searchGridOrders.superclass.initComponent.call(this);
			
			this.fn(this); 
			/* console.log('Loading...'); */
		},
		listeners:{
			afterrender: function( obj, eOpts ){ /* console.log('Load Finish');  */},
		},
		fn:function(){ },
		id:'frm-grid-searchOrdersID', 
		frame : true,
		bodyStyle : "padding:2px",
		autoHeight: true,
		width   : 730,  
		labelWidth: 180,
		defaults: {
			anchor: '0'
		}, 

		items : [{
						xtype: 'compositefield',
						fieldLabel: 'คำที่ค้นหา',
						msgTarget : 'side',
						anchor    : '-10',
						defaults: { flex: 1 },
						items: [
							{
								xtype: 'textfield',
								id:'valOrders-ID',
								name : 'value'
							},filters
						]
					},
					Ext.PopDebtorSearch.mini 
					
		],  
		buttonAlign: 'left', 
		buttons: [ {
				xtype : 'tbfill'  
			},{	
				text : 'ค้นหา', 
				iconCls: 'icon-magnifier',  
				handler: function() { 
			 
					Ext.storeInvoice.setBaseParam("mode", "SEARCH");
					Ext.storeInvoice.setBaseParam("filter",Ext.getCmp("filterOrders-ID").getValue()); 
					Ext.storeInvoice.setBaseParam("value", Ext.getCmp("valOrders-ID").getValue());
					Ext.storeInvoice.setBaseParam("dc_debtor_id", Ext.getCmp("dc_debtor_id1ID").getValue());
							
					Ext.getCmp('gridOrdersID').getStore().load(); 
				},

			},{
				text : 'เริ่มใหม', 
				iconCls: 'icon-reset',	
				handler : function() { 
					Ext.getCmp('frm-grid-searchOrdersID').getForm().reset();  
				},
			}],
	 });
	};
	Ext.extend(searchGridOrders, Ext.FormPanel, {});  
	//================================================================
	searchGrid = function() {

	var filters = {
						xtype: 'combo', //lovcombo
						id:'filter-ID',
						store: new Ext.data.SimpleStore({
							  fields: ["id", "c_name"],  
							  data:[['debtor_name', "ชื่อลูกค้า"],['so_code', "รหัสใบสั่งขาย"],['inv_code', "รหัสใบวางบิล"],['c_code', "รหัสใบเสร็จรับเงิน"]],
						}),
						value: 'debtor_name',
						valueField: 'id',
						displayField: 'c_name',
						submitValue: true,
						hiddenName: 'filter',
						mode: "local",
						triggerAction: "all", 
						forceSelection: true,
						selectOnFocus: true,
						editable:false,
						listeners: {
							select: function(combo, record, index) {
								var newValue = record.data.id;
							}
						}
					};	
 				
	//classOverride				
	searchGrid.superclass.constructor.call(this, { 
		initComponent: function(){ 
			searchGrid.superclass.initComponent.call(this); 
			this.fn(this);   
		},
		listeners:{
			afterrender: function( obj, eOpts ){  },
		},
		fn:function(){},
		//id:this.getId(),//'frm-grid-searchID', 
		id:'frm-grid-searchID', 
		frame : true,
		bodyStyle : "padding:2px",
		autoHeight: true,
		width   : 730,  
		labelWidth: 180,
		defaults: {
			anchor: '0'
		}, 
		items : [{
						xtype: 'compositefield',
						fieldLabel: 'คำที่ค้นหา',
						msgTarget : 'side',
						anchor    : '-10',
						defaults: { flex: 1 },
						items: [
							{
								xtype: 'textfield',
								id:'val-ID',
								name : 'value'
							},filters
						]
					},
					{
						xtype: 'compositefield',
						fieldLabel: 'วันที่รับเงิน',
						msgTarget : 'side',
						anchor    : '-20',
						defaults: { flex: 1 },
						items: [
							{
								xtype: 'datefield',
								name : 'startDate',
								id : 'startDateID',
								value:Ext.getDate.defaultDate(1)
							}, 
							{
								xtype: 'datefield',
								name : 'endDate',
								id : 'endDateID',
								value:Ext.getDate.defaultDate(2)
							}
						]
					},
		],  
		buttonAlign: 'left', 
		buttons: [ 
			{	
				text : 'เพิ่มข้อมูล',
				id:'buAdd',  
				iconCls: 'icon-add',   
				handler: function(grid, rowIndex, colIndex) {  
					//controllTab({},'add');
					windowOrders({},'add');
					
				}
			},{
				xtype : 'tbfill'  
			},{	
				text : 'ค้นหา',
				id:'buSearchID',
				iconCls: 'icon-magnifier',  
				handler: function() { 
			 
					Ext.store.setBaseParam("mode", "SEARCH");
					Ext.store.setBaseParam("filter",Ext.getCmp("filter-ID").getValue()); 
					Ext.store.setBaseParam("value", Ext.getCmp("val-ID").getValue());  
					Ext.store.setBaseParam("d_begin_dateID", Ext.getCmp("startDateID").getValue());  
					Ext.store.setBaseParam("d_end_dateID", Ext.getCmp("endDateID").getValue());  
					Ext.getCmp('tabpanel1').getStore().load(); 
				},

			},{
				text : 'เริ่มใหม', 
				id:'buResetID',
				iconCls: 'icon-reset',	
				handler : function() { 
					Ext.getCmp('frm-grid-searchID').getForm().reset();  
					Ext.getCmp('startDateID').setValue(Ext.getDate.defaultDate(1));
					Ext.getCmp('endDateID').setValue(Ext.getDate.defaultDate(2)); 
				},
			}],
	 }); 
	};
	
	Ext.extend(searchGrid, Ext.FormPanel, {});  
	Ext.reg('searchGrid', searchGrid); 
	//================================================================ 
	searchGridx = Ext.extend(searchGrid, { 
		
		constructor:function(config) {
 			//1
			config = config || {};
			//2
			/* config.listeners = config.listeners || {}; 
			Ext.applyIf(config.listeners, {
				 scope:this
				, beforequery:this.onBeforeQuery
				, blur:this.onRealBlur 
			});  */ 
			//3	
			searchGridx.superclass.constructor.call(this, config); 
			this.itemx(); 
		}, 
		 
		itemx:function(){ 
		//this.add({ xtype:'displayfield',value:'vvvvv' }); 
		//console.log(this.items); 
		 
		},
	}); // eo extends	
	Ext.reg('searchGridx', searchGridx);
	//================================================================


	
	function formBlDtlEdit(){  
		Ext.storeBlDtl = new Ext.data.JsonStore({
			storeId: 'myStoreBlDtl', 
			url : 'api/ListAddBillingDtl.php',
			//baseParams: { mn:'editso', },
			root: 'data', 
			idProperty: 'id',
			totalProperty: 'totalCount',
			//sortInfo:{ field: 'i_seq', direction: 'ASC'}, 	
			fields: [
				{ name: 'no' },
				{ name: 'id' },		
				{ name: 'soBill', type: 'int' },
				{ name: 'billing' },					
				{ name: 'soDtlID' },	
				{ name: 'soDtlEditID' },
				{ name: 'ap_po_hdr_id' },
				{ name: 'f_after_disc_amtID' },
				{ name: 'f_net_cost_add_vat' },
				{ name: 'dc_product_id', type: 'int' },
				{ name: 'txtdc_product_idID', type: 'string' },
				{ name: 'c_code', type: 'string' },
				{ name: 'c_name', type: 'string' },  
				{ name: 'c_comment', type: 'string' }, 
				{ name: 'i_enable', type: 'int'  },	 
				{ name:'i_seq', type: 'int'  },	
				{ name:'i_receive', type: 'int'  },	
				{ name:'c_receive', type: 'string' }, 				
				{ name:'f_quan' },
				{ name:'f_unit_cost' },
				{ name:'f_disc_com' },
				{ name:'f_total_cost' },
				{ name:'f_tax_rate' },				
				{ name:'f_tax_amt' }, 
				{ name:'f_vat_amt' }, 		//ยอดรวม vat 				
				{ name:'f_net_cost' }, 	
				
				{ name:'f_net_costVal' }, 
				{ name:'f_tax_amtVal' },
				{ name:'f_disc_comVal' },
				
				{ name:'f_tax_amtFirst' }, 
				{ name:'f_vat_amtFirst' }, 		//ยอดรวม vat 				
				{ name:'f_net_costFirst' }, 	
				
				{ name:'dc_user_create_id' }, 
				{ name:'dc_user_create_cost_id' },
				{ name:'d_create' },
				{ name:'dc_user_update_id' },
				{ name:'dc_user_update_cost_id' },
				{ name:'d_update' },
			] //   
		});	
		var fm = Ext.form;
/*
  // shorthand alias
   

    // the column model has information about grid columns
    // dataIndex maps the column to the specific data field in
    // the data store (created below)
    var cm = new Ext.grid.ColumnModel({
        // specify any defaults for each column
        defaults: {
            sortable: true // columns are not sortable by default           
        },
        columns: [{
            id: 'common',
            header: 'Common Name',
            dataIndex: 'common',
            width: 220,
            // use shorthand alias defined above
            editor: new fm.TextField({
                allowBlank: false
            })
        }, {
            header: 'Light',
            dataIndex: 'light',
            width: 130,
            editor: new fm.ComboBox({
                typeAhead: true,
                triggerAction: 'all',
                // transform the data already specified in html
                transform: 'light',
                lazyRender: true,
                listClass: 'x-combo-list-small'
            })
        }, {
            header: 'Price',
            dataIndex: 'price',
            width: 70,
            align: 'right',
            renderer: 'usMoney',
            editor: new fm.NumberField({
                allowBlank: false,
                allowNegative: false,
                maxValue: 100000
            })
        }, {
            header: 'Available',
            dataIndex: 'availDate',
            width: 95,
            renderer: formatDate,
            editor: new fm.DateField({
                format: 'm/d/y',
                minValue: '01/01/06',
                disabledDays: [0, 6],
                disabledDaysText: 'Plants are not available on the weekends'
            })
        }, {
            xtype: 'checkcolumn',
            header: 'Indoor?',
            dataIndex: 'indoor',
            width: 55
        }]
    }); 
*/		 
    var cm = new Ext.grid.ColumnModel({ 
        defaults: { sortable: false  },
		columns:[
		 new Ext.grid.RowNumberer({
				width:35,
				header:" No ",
		renderer:function(value, metaData, record, row, col, store, gridView){
			return record.get('no');
			}
		}),
		{ header: "ID System", sortable: true, hidden:true, dataIndex: 'c_name' },
		//{ id: 'removePro', align:'center', header: "ลบ", width:50, dataIndex: 'soDtlID' },
		{ header: "อัตราภาษีหัก ณ ที่จ่าย", align:'right', sortable: true, hidden:true, dataIndex: 'f_tax_rate' },
		//{ align:'center', header: "สถานะ", width:50, dataIndex: 'c_receive'},
		{ header: "รายการวางบิล", width:130, dataIndex: 'c_name' , 
			renderer:function(value, metaData, record, row, col, store, gridView){
				
				if(record.get('id')=='grandTotal')
				{ 
						Ext.getCmp('f_total_cost_sumID').setValue(record.get('f_total_cost'));
						Ext.getCmp('f_vat_amt_sumID').setValue(record.get('f_vat_amt')); 
						Ext.getCmp('f_net_cost_sumID').setValue(record.get('f_net_costFirst'));
						Ext.getCmp('f_tax_amt_sumID').setValue(record.get('f_tax_amtFirst'));
						Ext.getCmp('f_net_cost_add_vat_sumID').setValue(record.get('f_net_cost_add_vat'));
						Ext.getCmp('f_after_disc_amtID').setValue(record.get('f_after_disc_amtID'));
						
						Ext.vatOld = record.get('f_vat_amt');
						Ext.taxOld = record.get('f_tax_amtFirst');
						   
						
					 Ext.sumDtl = Ext.apply({ 
						 f_total_cost:record.get('f_total_cost'),
						 f_dis_amt:0,
						 f_after_disc_amt:record.get('f_total_cost'),
						 f_vat_amt:record.get('f_vat_amt'),
						 f_net_cost:record.get('f_net_costVal'),
						 f_tax_amt:record.get('f_tax_amtFirst'),
						 f_before_edit_vat:record.get('f_vat_amt'),
						 f_before_edit_tax:record.get('f_tax_amtFirst'),
						 f_net_cost_add_vat:record.get('f_net_costFirst'),
					 });
					
 
/* console.log('renderer Ext.sumDtl => '); 		
console.log(Ext.sumDtl);  */			
					  if(record.get('f_tax_amt')=='0.00') 
						  Ext.getCmp('f_tax_amt_sumID').setReadOnly(true);
					  else 
						  Ext.getCmp('f_tax_amt_sumID').setReadOnly(false);
				 
					  if(record.get('f_vat_amt')=='0.00')
						  Ext.getCmp('f_vat_amt_sumID').setReadOnly(true);
					  else 
						  Ext.getCmp('f_vat_amt_sumID').setReadOnly(false);
				} 
				
				return value;
			} 
		}, 
		{ header: "จำนวน/ครั้ง", align:'right', width:50, dataIndex: 'f_quan'},
		{ header: "ราคา/หน่วย", align:'right', width:50, dataIndex: 'f_unit_cost'},
		{ header: "ราคารวม", align:'right',width:50,  dataIndex: 'f_total_cost',},  
		{ header: "ส่วนลด", align:'right', width:50, dataIndex: 'f_disc_com',},							
		{ header: "หัก ณ ที่จ่าย", align:'right', width:50, dataIndex: 'f_tax_amt',},
		{ header: "ยอดสุทธิ", align:'right', width:50, dataIndex: 'f_net_cost',},
		//{ header: "หมายเหตุ", width:100, dataIndex: 'c_comment',},
	 
	]});
		
		var gridDtl2 =  new Ext.grid.EditorGridPanel({  
						//xtype: 'grid',
						id:'tabSoDtlGrid',
						title:'แสดงรายการรายได้รอรับเงิน (จำนวนเงินอาจคลาดเคลื่อนเนื่องจากการปัดเศษ)', 
						border: false,
						stripeRows: true,
						loadMask: true,
						frame : true,
						bodyStyle : "padding:2px",
						autoHeight: true,
						store: Ext.storeBlDtl, 
						viewConfig:{ forceFit: true, getCellCls: function(value) { console.log(value); } },
						cm:cm,
						clicksToEdit: 1,
				});

		formBlDtlEdit.superclass.constructor.call(this, {   
			id:'frm-so-dtlID', 
			frame : true,
			url:'api/mnBillingsPrint.php',
			bodyStyle : "padding:3px", 
			autoScroll: true,
			loadMask: true,
			width   : 1200,  
			labelWidth: 145,
			defaults:{ flex:1, },   
			title:'แสดงรายการรายได้', 
			items:[{
						xtype:'hidden',
						name:'id',
						value:Ext.getCmp('hdrID').getValue(), 
					},{
						xtype:'hidden',
						name:'mode',
						value:'GENCODE',
					}, 
					gridDtl2,//grid
					{ 
						html: "<p>ถ้ากรอกส่วนลด ระบบจะทำการคำนวณภาษีใหม่ทั้งหมด</p>",
						style: 'color:red; font-weight:bold;display: block;margin-top: 0.5em; margin-bottom: 0.5em; margin-left: auto; margin-right: auto; border-style: hidden;'
					}, 					
					{
						xtype:'textfield',
						fieldLabel:'จำนวนเงินรวม',
						name:'f_total_cost_sum',
						id:'f_total_cost_sumID', 
						style: 'text-align: right',
						readOnly:true, 
					},
					{
						xtype:'textfield', 
						name:'f_disc_amt',
						fieldLabel: 'ส่วนลด', 
						id:'f_disc_amtID',  
						readOnly:true,
						style: 'text-align: right',
						validator: function(val) { 
							var regex  = /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\.[0-9]{1,2})?$/; 
							if (!regex.test(val))
							{ return "กรุณากรอก จำนวนเงินเป็นจำนวนทศนิยม มูลค่ามากกว่า 0.00"; }else{ return true; }
						},
					},
					{
						xtype:'textfield',
						fieldLabel:'จำนวนเงินหลังหักส่วนลด',
						name:'f_after_disc_amt',
						id:'f_after_disc_amtID',
						style: 'text-align: right',
						readOnly:true, 
					},


					{ 
						xtype:'textfield', 
						fieldLabel:'ภาษีมูลค่าเพิ่ม',
						name:'f_vat_amt_sum',
						id:'f_vat_amt_sumID',
						style: 'text-align: right',						
						validator: function(val) { 
							var regex  = /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\.[0-9]{1,2})?$/; 
							if (!regex.test(val))
							{ return "กรุณากรอก จำนวนเงินเป็นจำนวนทศนิยม มูลค่ามากกว่า 0.00"; }else{ return true; }
						},
						listeners:{
							afterrender:function(){
								    this.getEl().on('click',function(){ 
										//Ext.vatOld = parseFloat(Ext.sumDtl.f_vat_amt.replace(/,/g,'')); 
										Ext.get(this.id).dom.value = Ext.vatOld;
									});
								    this.getEl().on('blur',function(){  
										//console.log(' Old Value :: '+Ext.vatOld+' New value : '+this.getValue());
										var vatOld =  parseFloat(Ext.vatOld.replace(/,/g,''));
										var v1 = vatOld+0.02;
										var v2 = vatOld-0.02;  

										
										if(v1<this.getValue() || v2 >this.getValue()){ 
											//console.log(v1+' <'+this.getValue()+'> '+v2);										
											Ext.Msg.alert('Failure', Ext.vatOld +' แก้ไขได้ไม่เกิน (+/-) 0.02 บาท',function(){   
												Ext.getCmp('contenterCenter').setActiveTab('frm-so-dtlID'); 
												Ext.get('f_vat_amt_sumID').dom.focus();  
											});
										}else{ 
										
										
											var f_vat_edit = parseFloat(this.getValue().replace(/,/g,''));
											var f_tax_amt = parseFloat(Ext.getCmp('f_tax_amt_sumID').getValue().replace(/,/g,''));
											var f_after_disc_amt = parseFloat(Ext.getCmp('f_after_disc_amtID').getValue().replace(/,/g,''));
											
											var f_add_vat = parseFloat(f_after_disc_amt)+parseFloat(f_vat_edit.toFixed(2));
											var f_after_tax = parseFloat(f_add_vat)-parseFloat(f_tax_amt);
											
											Ext.get('f_net_cost_add_vat_sumID').dom.value = Ext.floatRenderer(f_add_vat);
											Ext.get('f_net_cost_sumID').dom.value = Ext.floatRenderer(f_after_tax); 
											Ext.sumDtl.f_vat_amt = Ext.floatRenderer(f_vat_edit.toFixed(2));
										} 
									});
							}
						},
						//readOnly:true,
					},
					{
						xtype:'textfield',
						fieldLabel:'จำนวนเงินรวมภาษีมูลค่าเพิ่ม',
						name:'f_net_cost_add_vat_sum',
						id:'f_net_cost_add_vat_sumID',
						style: 'text-align: right',
						readOnly:true,
					},
					{ 
						html: "<div>&nbsp;</div>",
						style: 'background:eee !important; display: block;margin-top: 0.5em; margin-bottom: 0.5em; margin-left: auto; margin-right: auto; border-style: hidden;'
					},
					{
						xtype:'textfield',
						fieldLabel:'จำนวนเงินภาษีหัก ณ ที่จ่าย ',
						name:'f_tax_amt_sum',
						id:'f_tax_amt_sumID',
						style: 'text-align: right',
						validator: function(val) { 
							var regex  = /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\.[0-9]{1,2})?$/; 
							if (!regex.test(val))
							{ return "กรุณากรอก จำนวนเงินเป็นจำนวนทศนิยม มูลค่ามากกว่า 0.00"; }else{ return true; }
						},

						listeners:{
							afterrender:function(){
								    this.getEl().on('click',function(){ 
										 
										Ext.get(this.id).dom.value = parseFloat(Ext.taxOld.replace(/,/g,''));
										Ext.taxOld = parseFloat(Ext.taxOld.replace(/,/g,''));
										
									});
								    this.getEl().on('blur',function(){  								
										var v1 = Ext.taxOld+0.02;
										var v2 = Ext.taxOld-0.02;   
										if(v1<this.getValue() || v2 >this.getValue()){  
											Ext.Msg.alert('Failure', Ext.taxOld+' แก้ไขได้ไม่เกิน (+/-) 0.02 บาท',function(){   
												Ext.getCmp('contenterCenter').setActiveTab('frm-so-dtlID'); 
												Ext.get('f_tax_amt_sumID').dom.focus();  
											});
										}else{ 
										
										
											var f_tax_edit = parseFloat(this.getValue().replace(/,/g,'')); 
											var f_after_disc_amt = parseFloat(Ext.getCmp('f_net_cost_add_vat_sumID').getValue().replace(/,/g,''));
											
									 
											var f_add_tax = parseFloat(f_after_disc_amt)-parseFloat(f_tax_edit.toFixed(2));
								 
											Ext.get('f_net_cost_sumID').dom.value = Ext.floatRenderer(f_add_tax); 
											
											Ext.sumDtl.f_tax_amt = Ext.floatRenderer(f_tax_edit.toFixed(2)); 
										} 
									});
							}
						}, //Listen
						
					},
					{
						xtype:'textfield',
						fieldLabel:'ยอดสุทธิ',
						name:'f_net_cost_sum',
						id:'f_net_cost_sumID',
						readOnly:true,
						style: 'text-align: right;',
					}
	/*TODO 
	*
	* ในกรณีที่มีการแก้ไข (ภาษีมูลค่าเพิ่ม )f_vat_amt_sumID +/- 0.02 จาก  ฟังก์ชัน validVat&call
	* ค่า  จำนวนเงินรวมภาษีมูลค่าเพิ่ม ,ยอดสุทธิ 
	* ต้องมีการคำนวณใหม่อีกรอบ
	*
	*/
					], 
			listeners:{ 
				afterrender:function(){
					
				}
			},		
			buttonAlign: 'left',
			buttons:[{
						text : 'พิมพ์ใบเสร็จรับเงิน',
						id:'buPrintCode',
						iconCls:'printer_mono', 
						/* listeners:{
							afterrender:function(){ 
								if(Ext.getCmp('c_area_codeEditDisID').getValue()!='0'){ 
								 
									Ext.getCmp('modeEditID').setValue('GENCODE2');
								}else{
									Ext.getCmp('modeEditID').setValue('GENCODE'); 
								}
							}
						}, */
						handler : function() { 
							var form = Ext.getCmp('frm-so-dtlID').getForm();  
							if (form.isValid()){ 
								Ext.store.reload({ 									
								callback: function(records, operation, success) {  
									   if (success){  
										 for(i=0;i<records.length;i++){
											 if(records[i].data.id==Ext.getCmp('hdrID').getValue()){ 
								 
												 Ext.sumDtl.f_vat_amt = Ext.getCmp('f_vat_amt_sumID').getValue();
												 Ext.sumDtl.f_net_cost = Ext.getCmp('f_net_cost_sumID').getValue();	
												 	
												 printForm(records[i]).show();
											 } 
										 }// loop   
									   } 
									},
								}); 
								
							}
						 }//Handle
				}] 

			}); 
	}  Ext.extend(formBlDtlEdit, Ext.FormPanel, {}); 

	function printForm(record){
		
		var sumDtl=Ext.util.JSON.encode(Ext.sumDtl);
		
		
		
		var id = 'printBLID';
		
		var storeDtl =new Ext.data.JsonStore({
			storeId: 'myStoreBlDtl3', 
			//autoDestroy: true,
			//autoLoad: true,
			url : 'api/ListReceivePrintDtl.php', 
			root: 'data', 
			idProperty: 'id',
			baseParams: { sumDtl:sumDtl},
			totalProperty: 'totalCount',  
			fields: [
				{ name: 'no' },
				{ name: 'id' },		
				{ name: 'ar_bill_invoice_dtl_id' },
				{ name: 'soBill', type: 'int' },
				{ name: 'billing' },					
				{ name: 'soDtlID' },	
				{ name: 'soDtlEditID' },
				{ name: 'ap_po_hdr_id' },
				{ name: 'd_end_credit' },
				{ name: 'i_detail', type: 'int' },
				{ name: 'f_wht_amt' },
				{ name: 'f_net_disc_comm_amt' },
				{ name: 'f_vat_amt' }, 		// ยอดรวม vat
				{ name: 'f_net_vat_amt' },	// ยอดรวมทั้งหมดบวก vat f_net_disc_comm_amt+f_vat_amt
				{ name: 'dc_product_id', type: 'int' },
				{ name: 'txtdc_product_idID', type: 'string' },
				{ name: 'c_code', type: 'string' },
				{ name: 'c_name', type: 'string' },  
				{ name: 'c_comment', type: 'string' }, 
				{ name: 'i_enable', type: 'int'  },		
				{ name:'dc_user_create_id' }, 
				{ name:'i_seq', type: 'int'  },	 
				{ name:'c_type' },
				{ name:'f_quan' },
				{ name:'f_unit_cost' },
				{ name:'f_total_cost' },
				{ name:'f_disc_com_amt' },
				{ name:'f_disc_com' }, 
				{ name:'f_disc_cash_amt_bal' },
				{ name:'f_disc_cash' },
				{ name:'f_disc_cash_amt' }, 
				{ name:'f_net_cost' }, 	 
				{ name:'dc_user_create_cost_id' },
				{ name:'d_create' },
				{ name:'dc_user_update_id' },
				{ name:'dc_user_update_cost_id' },
				{ name:'d_update' },
			]
		});	

		var gridDtl = {  
				xtype: 'grid', 
				border: false,
				stripeRows: true,
				loadMask: true, 
				autoHeight: true,
				store:storeDtl,  
				listeners:{
					afterrender:function(){
						this.fn = function(){
							 storeDtl.setBaseParam("mode",'GETDATA');
							 storeDtl.setBaseParam("typePrint","");
							 storeDtl.setBaseParam("id",record.get('id'));//GETDATA 
							 storeDtl.load();
						};
						this.fn();
					}
				},  
			columns:[ 
				{ header: "ID System", sortable: true, hidden:true, dataIndex: 'id' }, 
				{ header: "รายการ", dataIndex: 'c_name',id:'CproductID', width:260 }, 
				{ header: "จำนวน", align:'right', dataIndex: 'f_quan', width:60},   
				{ header: "ราคา/หน่วย", align:'right', dataIndex: 'f_unit_cost', width:90},  
				{ header: "ราคารวม", align:'right', dataIndex: 'f_total_cost', width:90,
					renderer:function(value, metaData, record, row, col, store, gridView){ 
					
						if(record.get('i_detail')==1){
							var val = Ext.get('f_disc_comID'+record.get('ar_bill_invoice_dtl_id')).dom.value;  
							return value;
						}else{
							return null;
						} 
					}
				},						
				{ header: "ส่วนลด", align:'right', dataIndex: 'f_disc_com', width:90,
 
					renderer:function(value, metaData, record, row, col, store, gridView){ 
					 
						if(record.get('i_detail')==1){
							
							var val = Ext.get('f_disc_comID'+record.get('ar_bill_invoice_dtl_id')).dom.value; 
							var id = record.get('id');
							return '<input type="text" value="'+val+'" style="border:0px; font-size:12px; width:90%; text-align:right;" autocomplete="off" id="f_total_costID3" name="f_dis_com'+id+'" readonly="true">';; 

						}else{
							return value;
						} 
						
					} 
				},  
				{ header: "หัก ณ ที่จ่าย", align:'right', dataIndex: 'f_tax_amt', width:90,
					renderer:function(value, metaData, record, row, col, store, gridView){  
						if(record.get('i_detail')==1){ 
							var val = Ext.get('f_tax_amtID'+record.get('ar_bill_invoice_dtl_id')).dom.value; 
							var id = record.get('id');
							return '<input type="text" value="'+val+'" style="border:0px; font-size:12px; width:90%; text-align:right;" autocomplete="off" id="f_total_costID3" name="f_tax_amt'+id+'" readonly="true">';; 
							
							
						}else{
							return value;
						} 
					}
				},   
				{ header: "ยอดสุทธิ", align:'right', dataIndex: 'f_total_cost' , width:90,
					renderer:function(value, metaData, record, row, col, store, gridView){  
						if(record.get('id')=='grandTotal7'){
							metaData.attr = "style='float:right'";    
							return value; 
						}else if(record.get('id')=='grandTotal1'){  
							return Ext.get('f_total_cost_sumID').dom.value; 
						}else if(record.get('i_detail')==1){ 
							var val = Ext.get('f_net_costID'+record.get('ar_bill_invoice_dtl_id')).dom.value; 
							var id = record.get('id');
							return '<input type="text" value="'+val+'" style="border:0px; font-size:12px; width:90%; text-align:right;" autocomplete="off" id="f_total_costID3" name="f_net_cost'+id+'" readonly="true">';; 
							
						}else{
							return value;
						}
					}, 
				}
				], 						
						autoExpandColumn: "CproductID",
		};	

console.log('new window sumDtl => ');
console.log(sumDtl); 

		return new Ext.Window({
							id : "win-pop-lov"+id,
							title : " ใบวางบิล ",
							modal: true, 
							plain: true,  
							frame: true,
							layout: "fit",  
							maximizable: true, 
							constrainHeader: true, 
							closable: true, 
							listeners: {
										afterrender: function( obj, eOpts )
										{
											this.fn = function(widht,height){ //percentage 
												var width = Ext.getBody().getViewSize().width * widht;
												var height = Ext.getBody().getViewSize().height * height;
												this.setSize(width, height);
											}
											this.fn(.80,.85);  
										},
										 "maximize": function(window, opts) { //when property minimizable 
												window.setWidth(Ext.getBody().getViewSize().width*.999);
												window.expand('', false);
												window.center(); 
										 }
							}, 			
							items:[{
								xtype: 'form',
								id: 'form-widgets'+id,
								url:'api/mnReceivePrint.php', 
								labelWidth: 1,
								listeners: { 
									afterrender: function( obj, eOpts ){ 
										//console.log(Ext.sumDtl); 
									}, 
								},
								items:[
								 { xtype:'hidden', name:'mode', value:'GENCODEPRINT', }, 
								 { xtype:'hidden', name:'id', value:Ext.getCmp('hdrID').getValue(), },
								 { xtype:'hidden', name:'ar_bill_invoice_hdr_id', value:Ext.getCmp('blHdrID').getValue(), },
								 { xtype:'hidden', name:'sumDtl', value:sumDtl, }, 
								 {
										xtype: 'compositefield', 
										msgTarget : 'side',
										anchor    : '-10',
										defaults: { flex: 1 },
										items: [{ xtype:'displayfield', value:Ext.global.customer_th, },]
								 },	 	 
								 {
										xtype: 'compositefield', 
										msgTarget : 'side',
										anchor    : '-10',
										defaults: { flex: 1 },
										items: [ { xtype:'displayfield', value:'ลูกค้า '+record.get('c_name_inv'), },
												 { xtype:'displayfield', value:' &nbsp; ', },
												 { xtype:'displayfield', value:'เลขที่ใบวางบิล  '+record.get('inv_code'), },
												]
								 },	 	 
								 {
										xtype: 'compositefield', 
										msgTarget : 'side',
										anchor    : '-10',
										defaults: { flex: 1 },
										items: [ { xtype:'displayfield', value:'ที่อยู่ '+record.get('c_address_inv'), },
												 { xtype: 'displayfield',  value:' &nbsp; ', },
												 { xtype:'displayfield', value:'เลขที่สั่งขาย  '+record.get('so_code'), },
												]
								 },	  	 
								 {
										xtype: 'compositefield', 
										msgTarget : 'side',
										anchor    : '-10',
										defaults: { flex: 1 },
										items: [ { xtype:'displayfield', value:'เลขที่สัญญา/ใบสั่งซื้อ  '+record.get('c_po_no'), },
												 { xtype: 'displayfield',  value:' &nbsp; ', },
												 { xtype:'displayfield', value:'ลงวันที่ '+record.get('d_so_date'), },
												]
								 }, 
								gridDtl	
								
								] ,
								autoScroll: true,
								frame: true,
								buttonAlign: 'left',
								buttons:[{
										text : 'จัดพิมพ์ใบเสร็จรับเงิน',
										id:'buSaveSubID',
										iconCls:'printer_mono', 
										handler : function() { 
Ext.Ajax.request({
	url : 'api/mnFiReceive.php' , 
	params : { 
		mode : 'CHECKCLOSEBILLING', 
		d_doc_date:Ext.getCmp('d_doc_dateID').getValue(),  
	}, 
	method: 'GET', //POST
	success: function ( result, request ) { 
		var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
		if (jsonData.data.invalid==1) { 
				Ext.Msg.alert('Failure',jsonData.msg,function(){
					Ext.get('d_billing_dateID').dom.focus(); 
				});
			
		}else{
				var form = Ext.getCmp('form-widgets'+id).getForm();   
				if (form.isValid()){ 
					form.submit({
						waitMsg:'Saving Data...',
						success : function(form, action) {  
							Ext.Msg.alert('Success', action.result.msg,function(){   
								//
							
								PrintHtml(action.result.data.html);
								Ext.store.reload();				
//Close														
								Ext.getCmp("win-pop-lov"+id).destroy();  
								Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-dtlID'), true) || {}; //null obj not errer
								Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-hdrID'), true) || {}; //null obj not errer 
//Close
								return true;
							});  
						 
						},
						failure:  function(form, action) {
							switch (action.failureType) {
								case Ext.form.Action.CLIENT_INVALID:
									Ext.Msg.alert('Failure', 'Form fields may not be submitted with invalid values');
									break;
								case Ext.form.Action.CONNECT_FAILURE:
									Ext.Msg.alert('Failure', 'พลข้อผิดพลาดในการเชื่อต่อเครือข่าย');
									break;
								case Ext.form.Action.SERVER_INVALID:
								   Ext.Msg.alert('Failure', action.result.msg);
							}
						}
					});
				}
		}  
		  
	},
	failure: function ( result, request) { 
		Ext.MessageBox.alert('Failed', result.responseText);		// connect error
	}
});
										 
									}
									},{
										text : Ext.GLOBAL_BU_BACK_TH,
										handler: function() {
											Ext.getCmp("win-pop-lov"+id).destroy();  
										}
									} ],//buttons  
							}], //items 
						});  
	};//End Function
	function PrintHtml(targetElement){
		var myWindow = window.open('', '', 'width=600,height=400'); 
		myWindow.document.write(targetElement); 
		myWindow.print();  
	};	
	Ext.onReady(function(){
		Ext.QuickTips.init();
		var gridMain = {
			region: 'center',
			title: 'แสดงข้อมูลรายการชำระเงินแล้ว',
			xtype: 'grid',
			id:'tabpanel1',
			border: false,
			stripeRows: true,
			loadMask: true,
			store: Ext.store,
			tbar:[{
				xtype:'searchGridx', 
				id:'searchID',
				items:[{xtype:'displayfield',value:'ssss'}],
			}],
			columns:[new Ext.grid.RowNumberer({
					width:35,
					header:" No ",
			renderer:function(value, metaData, record, row, col, store, gridView){
				return record.get('no');
				}
			}),
			{ header: "ID System", sortable: true, hidden:true, dataIndex: 'id' },
			{ header: "เลขที่พิมพ์ใบเสร็จรับเงิน", sortable: true, dataIndex: 'c_code',id:'c_code' , width:120,
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					metaData.attr = "align='center'";   
				return value+' <img src="../images/icons/printer_mono.png" style="cursor:pointer"/>';
			}},
			{ header: "เลขที่บิล", sortable: true, dataIndex: 'inv_code' ,width:100, }, 			
			{ header: "เลขที่ใบสั่งขาย", sortable: true, dataIndex: 'so_code' ,width:100, }, 			
			{ id: 'c_debtor_name', header: "ลูกค้า", width:210, sortable: true, dataIndex: 'c_debtor_name' }, 
			{ header: "หน่วยงาน", sortable: true, dataIndex: 'c_cost_name' ,width:120, },
			{ header: "วันที่ใบรับเงิน", sortable:false, align: 'center',  dataIndex: 'c_doc_date' },
			{
				header: "สถานะ",  
				sortable:false,
				align: 'left', 
				dataIndex: 'c_status'
			},
			{
				header: "จำนวนเงินสุทธิ",  
				sortable:false,
				align: 'right', 
				id:'my-elemdd',
				dataIndex: 'f_net_cost',
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					 var deviceDetail = value + " = " + ' มาจากยอดรวม หักภาษี ณ ที่จ่าย และรวม ภาษีมูลค่าเพิ่ม';
						metaData.attr='ext:qtip="' + deviceDetail + '"'; 
				  return value;
				} 
			}, 			
			],
		
			//autoExpandColumn: 'c_debtor_name',
			bbar: new Ext.PagingToolbar({
				pageSize: 20,
				store: Ext.store,
				displayInfo: true,
				displayMsg: 'Displaying topics {0} - {1} of {2}'
			})
		};
		
		new Ext.Viewport({
			layout: 'border',
			items: [new Ext.TabPanel({
				region: 'center',
				border: false, 
				id:'contenterCenter',
				defaults:{autoScroll:true}, 
				items: [gridMain], 
				listeners: { 
					'tabchange' : function (panel, tab){
						if(tab.id=='frm-so-hdrID'){
							Ext.getCmp('fi_pymt_voucher_type_idID').getRate(Ext.getCmp('fi_pymt_voucher_type_idID').getValue()); 
						}
						//console.log(tab.id);
					}
				}				
			})],
		});
		Ext.getCmp('contenterCenter').setActiveTab('tabpanel1');  
		Ext.getCmp('tabpanel1').on('cellclick', cellClick, this);  
		Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({
			header: 'แสดง', 
			align: 'center',
			id: 'view',
			sortable: false,
			width: 50,
			dataIndex: 'id' ,
			renderer: function(value, metaData, record, row, col, store, gridView) {
				var i_enable = record.get('i_enable');
				return'<img src="../images/icons/magnifier2.png"); style="cursor:pointer"/>';
			}
		}));
		
		if(i_edit)Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({
			header: 'แก้ไข', 
			align: 'center',
			id: 'edit',
			sortable: false,
			width: 50,
			dataIndex: 'editID' , 
		}));
		if(i_delete)Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({
			header: 'ยกเลิก/ลบ', 
			align: 'center',
			id: 'remove',
			sortable: false,
			width: 80,
			dataIndex: 'delID' , 
			renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				if(record.get('iDel')==1){ 
						metaData.attr='ext:qtip="' + 'ทำการลบ' + '"'; 
				}else if(record.get('iDel')==2){
						metaData.attr='ext:qtip="' + 'ทำการยกเลิก' + '"'; 
				}
					 
				  return value;
				} 
		}));
		Ext.getCmp('tabpanel1').on('cellclick', cellClick, this); 
		//End TODO  
	 
		new Ext.ToolTip({
			target: 'buSearchID',
			html: 'กดค้นหารายการบิลที่สร้างแล้ว'
		});
	});
	


     