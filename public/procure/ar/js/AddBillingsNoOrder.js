	/* OBJ GET Store Row */
	Ext.getStoreItems = function(store, value,itemName){  
		 for(i=0;i<store.data.items.length;i++){
		  var rec = store.data.items[i];
			 if(value==rec.data.id){ 
				 return rec.get(itemName); 
			}
		 }// loop 
	}; //	 

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
	//Ext.eventGrid.click='view';
	Ext.eventGrid = Ext.apply({
		click:'',
		click2:'',
	});
	/* store
		*
		*
		*/
 
	Ext.store = new Ext.data.JsonStore({
			storeId: 'myStore',
			autoDestroy: true,
			autoLoad: true,
			url : 'api/ListBillingsNoOrder.php',
			root: 'data',
			baseParams: { i_read:user_right_read }, //Permission i_read
			idProperty: 'id',
			totalProperty: 'totalCount', 	 
			fields: [
				{ name: 'no' },
				{ name: 'id' },	
				{ name: 'ar_so_hdr_id', type: 'int' },				
				{ name: 'so_code', type: 'string' },
				{ name: 'bl_code', type: 'string' }, 
				{ name: 'c_code', type: 'string' }, 
				{ name: 'delID' },				
				{ name: 'editID' },	
				{ name: 'iDel' },		
				{ name: 'iDel' },		
				{ name: 'close_yyyy_mm' },	
				
				{ name: 'c_contract_no', type: 'string' },
				{ name: 'd_contract_date', type: 'string' },
				
				{ name: 'txtdc_cost_idID' },
				{ name: 'c_cost_name' },
				{ name: 'dc_cost_id' },		
				
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
			  
				{ name: 'dc_area_id', type: 'int' },			
				{ name: 'c_area_name', type: 'string' }, 
				{ name: 'dc_debtor_id', type: 'int' },
				{ name: 'c_debtor_name', type: 'string' }, 
				
 
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
			,'c_website','c_email','cnt_type_name','c_name_inv','c_address_inv','due_bill','condition_pay'
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
			fields: [ 'no','id', 'c_code','c_name','c_area_name','dc_area_id']
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
 
		Ext.vatStore = new Ext.data.JsonStore({ 
			autoLoad: true,
			storeId: 'myStoreVat',
			url: 'api/All_ArCombo.php',
			baseParams: {type : 'vatStore'},
			root: 'data',
			idProperty: 'id',
			totalProperty: 'totalCount',
			fields: ['id', 'f_vat_rate','c_name']
		}); 

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
				isCellClickGrid:true, 
				afterrender: function(){ /*alert(this.getId());*/ }, 
				cellClickGrid:function(grid, rowIndex, columnIndex, e) { 
				
					var id = 'dc_cost_idID';
					var nameID = id+'_Name';
					var record 		= grid.getStore().getAt(rowIndex);  
					var TextShow 	= record.data.c_code+' '+record.data.c_name;
					
					Ext.getCmp(id).setValue(record.data.id);
					Ext.getCmp(nameID).setValue(TextShow);  
					Ext.getCmp("win-pop-lov"+id).hide();  					
					Ext.getCmp("win-pop-lov"+id).destroy();   
					record.set('c_code',null);
					record.set('id',null);
					Ext.getCmp('frm-so-hdrID').getForm().loadRecord(record || {});
	 
				},

		});
					
		Ext.PopCntForm = new Ext.ux.Poplov({ 
				text		: 'ชื่อลูกค้า',  
				id			: 'dc_debtor_idID',	//go to relation	
				iconCls		: 'page_magnify', 
				valueHidden : 'dc_debtor_id', 		//go to hidden
				store		: Ext.storeDebtor,
				headerGrid	: columnMini,
				widthText	: 330,  
				fieldLabel	: 'ชื่อลูกค้า',  
				isCellClickGrid:true, 
				afterrender: function(){ /*alert(this.getId());*/ }, 
				cellClickGrid:function(grid, rowIndex, columnIndex, e) { 
				
					var id = 'dc_debtor_idID';
					var nameID = id+'_Name';
					var record 		= grid.getStore().getAt(rowIndex);  
					var TextShow 	= record.data.c_code+' '+record.data.c_name;
					
					Ext.getCmp(id).setValue(record.data.id);
					Ext.getCmp(nameID).setValue(TextShow);  
					Ext.getCmp("win-pop-lov"+id).hide();  					
					Ext.getCmp("win-pop-lov"+id).destroy();  
					record.set('c_code',null);	
					record.set('id',null);	
					Ext.getCmp('frm-so-hdrID').getForm().loadRecord(record || {});
	 
				},
		});
 
	/* Function  
	*
	*
	*/

	getEleFloat = function(){

		var f_total_cost 	= parseFloat(Ext.getCmp('f_total_costID').getValue().replace(/,/g,'')/1); 
		var f_disc_com 		= parseFloat(Ext.getCmp('f_disc_comID').getValue().replace(/,/g,'')/1); 
		var f_disc_cash 	= parseFloat(Ext.getCmp('f_disc_cashID').getValue().replace(/,/g,'')/1); 
	 
		var disc_com = ((f_total_cost*f_disc_com)/100).toFixed(2);  
		var disc_cash = ((f_total_cost*f_disc_cash)/100).toFixed(2); 
		
		Ext.getCmp('f_disc_com_amtID').setValue(parseFloat(disc_com));
		Ext.getCmp('f_disc_cash_amtID').setValue(parseFloat(disc_cash));
		
		var dis_amt = parseFloat(disc_com)+parseFloat(disc_cash);
		
		var f_total_costTotal = f_total_cost-dis_amt;
		
		Ext.getCmp('f_net_costID').setValue(f_total_costTotal.toFixed(2));
 
	};
	autoCal = function(){ 
		//Ext.select('#f_quanID').on('blur', function() { 		getEleFloat(); });
		Ext.select('#f_total_costID').on('blur', function() { 	getEleFloat(); }); //ยอดรวมก่อนหัก
		Ext.select('#f_disc_comID').on('blur', function() { 	getEleFloat(); });
		Ext.select('#f_disc_cashID').on('blur', function() { 	getEleFloat(); });

	};	

	/*
	* สำหรับบิลไม่มี Order
	*
	*/
	getEleFloatNoOrder = function(){

		var f_unit_cost 	= parseFloat(Ext.getCmp('f_unit_costID').getValue().replace(/,/g,'')/1); 
		var f_quan 	= parseFloat(Ext.getCmp('f_quanID').getValue().replace(/,/g,'')/1); 
		var f_total_costTotal = f_unit_cost*f_quan; 
		
		Ext.getCmp('f_total_costID').setValue(f_total_costTotal.toFixed(2));
 
	};
	autoCalNoOrder = function(){ 
		Ext.select('#f_quanID').on('blur', function() { 		getEleFloatNoOrder(); });
		Ext.select('#f_unit_costID').on('blur', function() { 	getEleFloatNoOrder(); }); //ยอดรวมก่อนหัก 
	};	
 
 	function windowProduct(record,butt){
			Ext.eventGrid.click2=butt;
			Ext.PopProForm  = new Ext.ux.Poplov({ 
			text		: 'รายการสินค้า',  
			id			: 'dc_product_idID',	//go to relation fq[bh_contract_id]	
			iconCls		: 'page_magnify', 
			valueHidden : 'dc_product_id', 		//go to hidden
			store		:  Ext.storeDcProduct,
			headerGrid	:  columnMini,
			widthText	:  330,  
			fieldLabel	:  'รายการสินค้า', 
			isCellClickGrid:true,			
			cellClickGrid:function(grid, rowIndex, columnIndex, e) { 
			
				var id = 'dc_product_idID';
				var nameID = id+'_Name';
				var record 		= grid.getStore().getAt(rowIndex);  
				var TextShow 	= record.data.c_code+' '+record.data.c_name; 
				Ext.getCmp(id).setValue(record.data.id);
				Ext.getCmp(nameID).setValue(TextShow);  
				Ext.getCmp("win-pop-lov"+id).hide();  					
				Ext.getCmp("win-pop-lov"+id).destroy();    
			},

			});		 
 	var itemsSoDtl = [{ xtype:'hidden',id:'modeProID',name:'mode',value:'ADD'},
 
						{ xtype:'hidden',id:'dtllHdrID',name:'hdrID',value:Ext.getCmp('hdrID').getValue(), },
						{ xtype:'hidden',id:'dtlDtlID',name:'id', },
						 Ext.PopProForm.mini
					,{ 
						id:'f_quanID',
						name:'f_quan',
						fieldLabel:'จำนวน ',
						value:1,
						validator: function(val) { 
							var regex  = /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\.[0-9]{1,2})?$/; 
							if (!regex.test(val))
							{ return "กรุณากรอก จำนวนเงินเป็นจำนวนทศนิยม มูลค่ามากกว่า 0.00"; } else {
								return true;
							}
						},
					},{ 
						id:'f_unit_costID',
						name:'f_unit_cost',
						fieldLabel:'ราคาต่อหน่วย ',
						validator: function(val) { 
							var regex  = /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\.[0-9]{1,2})?$/; 
							if (!regex.test(val))
							{ return "กรุณากรอก จำนวนเงินเป็นจำนวนทศนิยม มูลค่ามากกว่า 0.00"; } else {
								return true;
							}
						},
 				},{ 
						id:'f_total_costID',
						name:'f_total_cost',
						fieldLabel:'จำนวนเงินสุทธิ ',
						readOnly:true,
					},{  
						xtype:'textarea',
						width:300,
						name:'c_comment',
						fieldLabel:'หมายเหตุ ',
					}];
 
		var id='so_dtlID'; 
		var winFrm = new Ext.Window({
			id : "win-pop-lov"+id,
			title : " บันทึกใบสั่งขาย ",
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
						},
						 "maximize": function(window, opts) { //when property minimizable 
								window.setWidth(Ext.getBody().getViewSize().width*.99);
								window.expand('', false);
								window.center(); 
						 }
			},
			items:[{
				xtype: 'form',
				id: 'form-widgets'+id,
				url:'api/mnBillingNoOrderDtl.php', 
				labelWidth:175,
				bodyStyle: { padding: '10px 20px' }, 
				defaultType: 'textfield',
				items:itemsSoDtl,
				buttonAlign: 'left',
				buttons:[{
						text : 'บันทึกรายการ',
						id:'buSaveSubID',
						iconCls:'icon-save', 
						handler : function() { 
						
						var form = Ext.getCmp("form-widgets"+id).getForm();  
						var proID = Ext.getCmp('dc_product_idID_Name').getValue(); 
						if(proID==''){ 
							Ext.Msg.alert('Failure', 'กรุณาเลือกรายการ',function(){ 
								return false;
							}); 
						}else if (form.isValid()){ 
							form.submit({
								waitMsg:'Saving Data...',
								success : function(form, action) {    
									Ext.Msg.alert('Success', action.result.msg,function(){  
										Ext.storeBlDtl.reload(); 
										Ext.getCmp("win-pop-lov"+id).destroy();
										Ext.getCmp('tabpanel1').getStore().reload(); 
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
					},{
						text : Ext.GLOBAL_BU_BACK_TH,
						handler: function() {
							Ext.getCmp("win-pop-lov"+id).destroy(); 
							 
						}
					}],//buttons  
			}], //items
		}).show();  
	 
		Ext.getCmp("dtllHdrID").setValue(Ext.getCmp('hdrID').getValue());
	 	
		Ext.getCmp('form-widgets'+id).getForm().loadRecord(record || {});
		autoCalNoOrder(); 
		//console.log(Ext.eventGrid);
	}

	function controllTab(record,butt){ 
		
		Ext.eventGrid.click=butt;
		
		if(butt=='add'){  
			
			Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-dtlID'), true) || {}; //null obj not errer
			Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-hdrID'), true) || {}; //null obj not errer
 
			var frmSoHdr = new formSoHdr();  
								Ext.getCmp('contenterCenter').add(frmSoHdr); 
								Ext.getCmp('contenterCenter').setActiveTab(frmSoHdr); 
								//set Add Order to Billing
								/* record.set('ar_so_hdr_id',null);
								record.set('so_code',null);
								
								record.set('id',null); 
								record.set('c_code',null); 
								record.set('c_comment',null);
								record.set('d_doc_date',Ext.getDate.getNowCarlen());  */
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
								Ext.getCmp('contenterCenter').setActiveTab(frmSoHdr);  
			frmSoHdr.getForm().loadRecord(record); 	
 
			//-----------------
			if(butt=='edit'){ // ไม่ให้ดูเพราะยอดหัวจะไม่ตรงกับ รายละเอียด
				var frmSoDtl = new formBlDtlEdit();  //new formSoDtl();  
									Ext.getCmp('contenterCenter').add(frmSoDtl); 
									Ext.getCmp('contenterCenter').setActiveTab(frmSoDtl);  
				frmSoDtl.getForm().loadRecord(record); 
			}
								Ext.getCmp('contenterCenter').setActiveTab(frmSoHdr);  
			//-----------------
			Ext.getCmp('modeID').setValue('EDIT'); 
			if(butt=='view'){ 
				DisbledButton(true,{}); 
				Ext.storeDtl.setBaseParam("accessData", "view");
			}else{  
				DisbledButton(false,{}); 
				Ext.storeDtl.setBaseParam("accessData", "edit");
				
				//TODO ถ้าลบได้ค่อยมาเปิด
				//Ext.getCmp('tabSoDtlGrid').on('cellclick', clickRemoveProductBl,this); 
				//-----------------
				Ext.storeBlDtl.reload({ 
					params: { mode:'GETDATA',id:Ext.getCmp('hdrID').getValue()},
					callback: function(records, operation, success) {  
						   if (success){ } 
						},
					});  
				
				Ext.getCmp('tabSoDtlGrid').on('cellclick', cellClick2,this);
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
							url : 'api/mnBillings.php' , 
							params : { 
								mode : 'DELETE', 
								statusBu:'del',
								id : record.get('id'),
							}, 
							method: 'GET', //POST
							success: function ( result, request ) { 
								var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
								if (jsonData.success) { 
									Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-dtlID'), true) || {}; //null obj not errer
									Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-hdrID'), true) || {}; //null obj not errer
								} else {
									Ext.MessageBox.alert('Failed', jsonData.msg);			// alert massage error
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
							url : 'api/mnBillings.php' , 
							params : { 
								mode : 'DELETE', 
								statusBu:'cancel',
								id : record.get('id'),
							}, 
							method: 'GET', //POST
							success: function ( result, request ) { 
								var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
								if (jsonData.data.invalid==1) { 
									Ext.MessageBox.alert('Failed', jsonData.msg);			// alert massage error
									
								} else {
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
			
		//console.log(Ext.eventGrid);
	}; //End
	function getStorePrintingHtml(id,bl_code){
		//storePrinting  
		Ext.Ajax.request({
							url : 'api/InvoicePrint.php' , 
							params : { 
								mode : 'CHECKCLOSEBILLINGNOORDER', 
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
/* 	function cellClick(grid, rowIndex, columnIndex, e) { 
		var record = grid.getStore().getAt(rowIndex); 
		if (columnIndex==grid.getColumnModel().getIndexById('edit')) {
			if(record.get('editID')!='')controllTab(record,'edit'); 
		} else if (columnIndex==grid.getColumnModel().getIndexById('view')) {
			controllTab(record,'view'); 	
		} else if (columnIndex==grid.getColumnModel().getIndexById('remove')) {
			if(record.get('iDel')!=0){
			if(record.get('iDel')==1)
				controllTab(record,'remove'); 
			else controllTab(record,'cancel'); 	
			}
		} else if (columnIndex==grid.getColumnModel().getIndexById('c_code')) {
			if(record.get('c_code')!='0')getStorePrintingHtml(record.get('id'),record.get('c_code'));
		}
	};	 */
	function cellClick(grid, rowIndex, columnIndex, e) { 
		var record = grid.getStore().getAt(rowIndex); 
		if (columnIndex==grid.getColumnModel().getIndexById('edit')) {
			
			Ext.Ajax.request({
				url : 'api/mnBillingsOrder.php' , 
				params : { 
					mode : 'CHECKCLOSEBILLING', 
					d_billing_date:record.get('d_billing_date'),  
					id:record.get('id'), 
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
			}); 		
			
		} else if (columnIndex==grid.getColumnModel().getIndexById('view')) {
			controllTab(record,'view'); 	
		} else if (columnIndex==grid.getColumnModel().getIndexById('remove')) {
			
			if(record.get('iDel')!=0){
				if(record.get('iDel')==1)
					controllTab(record,'remove'); 
				else 
					Ext.Ajax.request({
						url : 'api/mnBillingsOrder.php' , 
						params : { 
							mode : 'CHECKCLOSEBILLING', 
							d_billing_date:record.get('d_billing_date'),  
							id:record.get('id'), 
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
			if(record.get('c_code')!='0')getStorePrintingHtml(record.get('id'),record.get('c_code'));
		}
	};	
	function cellClick2(grid, rowIndex, columnIndex, e) { 
 
			var record = grid.getStore().getAt(rowIndex);   
			if(columnIndex==grid.getColumnModel().getIndexById('removePro') && record.data.soDtlID !=''
			){  
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
									url : 'api/mnBillingNoOrderDtl.php' , 
									params : { 
										mode : 'DELETE', 
										id : record.get('id'),
									}, 
									method: 'GET', //POST
									success: function ( result, request ) { 
										var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
										if (jsonData.success) {
											//Ext.MessageBox.alert('Success', jsonData.msg);			// alert massage success
										} else {
											Ext.MessageBox.alert('Failed', jsonData.msg);			// alert massage error
										}
										Ext.getCmp("win-msg-delete").hide();						// hidden window-panel
										Ext.getCmp("win-msg-delete").destroy();						// clear memory :: garbage collection
										Ext.getCmp('tabpanel1').getStore().reload();				// reload grid & store
										Ext.storeBlDtl.reload();  
								 
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

			}else if(columnIndex==grid.getColumnModel().getIndexById('soDtlEditID') && record.data.soDtlEditID  !=''){
			 
				selectProduct(record);
					Ext.getCmp('modeProID').setValue('EDIT'); 
					Ext.getCmp('dtllHdrID').setValue(Ext.getCmp('hdrSoID').getValue()); 
					Ext.getCmp('dtlDtlID').setValue(record.data.id);
				autoCal();
			}
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
				//Ext.getCmp('buSave1ID').hide();
				//Ext.getCmp('buAddProID').hide();
			}else{
				Ext.getCmp('buSaveID').show();
				//Ext.getCmp('buSave1ID').show();
				//Ext.getCmp('buAddProID').show();
				
			}
		}

		//Ext.getCmp('Budc_debtor_idID').hide();
	}

	// Field hdr
 
 	var itemsSoHdr = [{
			xtype:'hidden', name:'id', id:'hdrID'
		},{
			xtype:'hidden', name:'i_no_order', value:1
		},{
			xtype:'hidden', name:'ar_so_hdr_id', value:0
		},{
			xtype:'hidden', name:'mode', id:'modeID', value:'ADD' //
		},{ 
			xtype:'hidden', name:'removeDtl', id:'removeDtlID', value:'',
		},{ 
			xtype:'textfield', fieldLabel:'รหัสใบวางบิล'  ,name:'c_code', value:'0',readOnly:true,
		} 
		,		Ext.PopCostForm.mini
		, { //
			xtype:'hidden', name:'dc_area_id',
		},{ //
			xtype:'displayfield', fieldLabel:'หน่วยธุรกิจ ' ,name:'c_area_name',
		}
			,	Ext.PopCntForm.mini 
				
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
				html: "<hr/><p>&nbsp;</p>",
				style: 'display: block;margin-top: 0.5em; margin-bottom: 0.5em; margin-left: auto; margin-right: auto; border-style: hidden;'
			} ,
			{ 
						xtype: 'compositefield' ,
						fieldLabel: 'เลขที่สัญญา', // เลขที่เอกสารสั่งขาย
						msgTarget : 'side',
						//anchor    : '-20',
						defaults: { flex: 1 },
						width:700,
						items:[{
								xtype:'textfield',
								name:'c_contract_no', // to base tbl so => c_po_no
								id:'c_contract_noID',
								width:150,
							},{ xtype:'displayfield',value:' ลงวันที่  : ',width:50,}
							,{
								xtype: 'datefield',  // to base tbl so => d_doc_date
								id : 'd_contract_dateID', 
								name : 'd_contract_date',  
								width:150,
								//value :Ext.getDate.getNowCarlen(), 
								//validator: function(val) { return Ext.isEmpty(val)?"กรุณาใส่ วันที่ออกสัญญา":true; }, 
							}], 			 
			},
	{
		xtype: 'datefield', 
		fieldLabel: 'วันที่ออกใบวางบิล',
		id : 'd_billing_dateID', 
		name : 'd_billing_date', 
		width:150,
		value :Ext.getDate.getNowCarlen(), 
		validator: function(val) { return Ext.isEmpty(val)?"กรุณาใส่ วันที่ออกใบวางบิล":true;},   	 
	},{ 
		xtype: 'datefield',
		fieldLabel: 'วันที่บันทึกรายการ',
		name : 'd_doc_date', 
		value :Ext.getDate.getNowCarlen(),
		readOnly:true, 
	},{ //
		xtype:'hidden', id:'f_vat_rateID', name:'f_vat_rate', 
	},{ //ประเภทรายได้ที่ต้องการวางบิล
						width:          250, 
						xtype:          'combo',
						mode:           'local',
						value:          1,
						triggerAction:  'all',
						forceSelection: true,
						editable:       false,
						fieldLabel:     'อัตราภาษีมูลค่าเพิ่ม',
						id:           	'dc_vat_idID',
						name:           'dc_vat_id',
						hiddenName:     'dc_vat_id',
						displayField:   'c_name',
						valueField:     'id',
						store			:Ext.vatStore, 
						listeners: {
							select : function(cb, rec, ind) { this.getRate(rec.get('f_vat_rate')); },
							afterrender:function(){
								this.getRate = function(v){  
									Ext.getCmp('f_vat_rateID').setValue(v);  
								}; 
								this.getRate(this.getStore().data.items[0].get('f_vat_rate')); // default
							},
							
						} 
	},{
			xtype: 'fieldset',
			title: 'ข้อมูลในการ วางบิล/แจ้งหนี้',
			autoHeight: true, 
			layout: 'form', 
			defaults:{ width:'78%',},  
			items: [
			{xtype:'textfield', fieldLabel:'ชื่อลูกค้าที่วางบิล/แจ้งหนี้ ' ,name:'c_name_inv', validator: function(val) { return Ext.isEmpty(val)?"กรุณาใส่ ชื่อลูกค้าที่วางบิล ถ้าไม่มีให้ใส่ (-)":true; }, },
			{xtype:'textfield', fieldLabel:'ที่อยู่ในการวางบิล/แจ้งหนี้ ' ,name:'c_address_inv',validator: function(val) { return Ext.isEmpty(val)?"กรุณาใส่ ที่อยู่ในการวางบิล/แจ้งหนี้ ถ้าไม่มีให้ใส่ (-)":true; },},
			{xtype:'textfield', fieldLabel:'กำหนดการวางบิล  ' ,name:'due_bill',validator: function(val) { return Ext.isEmpty(val)?"กรุณาใส่ กำหนดการวางบิล ถ้าไม่มีให้ใส่ (-)":true; },},
			{xtype:'textfield', fieldLabel:'เงื่อนไขการชำระเงิน ' ,name:'condition_pay',validator: function(val) { return Ext.isEmpty(val)?"กรุณาใส่ เงื่อนไขการชำระเงิน ถ้าไม่มีให้ใส่ (-)":true; },},
			]
	},{ 
		xtype: 'datefield', 
		fieldLabel: 'วันที่ครบกำหนดชำระ',
		id : 'd_endpay_dateID',
		name : 'd_endpay_date',
		width:150, 
		validator: function(val) { return Ext.isEmpty(val)?"กรุณาใส่ วันที่ครบกำหนดชำระ":true;},   	 
	},{ 	
	xtype:'textarea',fieldLabel:'คำอธิบายเพิ่มเติม',name:'c_comment', anchor : '-350', }
	
	]; //itemsSoHdr

	//================================================================
	formSoHdr	 = function() { 
		formSoHdr.superclass.constructor.call(this, {  
				listeners:{
					afterrender: function( obj, eOpts ){ /* console.log('Load Finish'); */ },
				},
				id:'frm-so-hdrID',
				url:'api/mnBillingsOrder.php',
				frame : true,
				bodyStyle : "padding:5px", 
				autoScroll: true,
				width   : 700,  
				labelWidth: 150,
				defaults:{ flex:1, },  
				//closable:true,
				loadMask: true,
				title:'บันทึกใบใบวางบิล',
				items:itemsSoHdr, 
				buttonAlign: 'left',
				buttons:[{
					text : 'บันทึกรายการ',
					id:'buSaveID',
					iconCls:'icon-save', 
					handler : function() { 
					Ext.Ajax.request({
							url : 'api/mnBillingsOrder.php' , 
							params : { 
								mode : 'CHECKCLOSEBILLING', 
								d_billing_date:Ext.getCmp('d_billing_dateID').getValue(),  
								id:Ext.getCmp('hdrID').getValue(), 
							}, 
							method: 'GET', //POST
							success: function ( result, request ) { 
								var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
									if (jsonData.data.invalid==1) { 
										Ext.Msg.alert('Failure',jsonData.msg,function(){
											Ext.get('d_billing_dateID').dom.focus(); 
										}); 
									}else{
										var form = Ext.getCmp('frm-so-hdrID').getForm();  
										if(Ext.getCmp('dc_debtor_idID_Name').getValue()==''){ 
											Ext.Msg.alert('Failure', 'กรุณาเลือกชื่อลูกหนี้',function(){
													Ext.get('dc_debtor_idID_Name').dom.focus(); 
											}); 
										}else if (Ext.getCmp('dc_cost_idID_Name').getValue()==''){ 
											Ext.Msg.alert('Failure', 'กรุณาเลือกชื่อหน่วยงาน',function(){
													Ext.get('dc_cost_idID_Name').dom.focus(); 
											}); 
										}else if (form.isValid()){ 
												form.submit({
													waitMsg:'Saving Data...',
													success : function(form, action) {    
														Ext.Msg.alert('Success', action.result.msg,function(){  
														
														Ext.getCmp('hdrID').setValue(action.result.data.id);
															//GET ROW INSERT NEW RECORD
															Ext.store.reload({  
															callback: function(records, operation, success) {  
																   if (success){  
																	 for(i=0;i<records.length;i++){
																		 if(records[i].data.id==action.result.data.id){ 
																			console.log(records[i].data);
																			console.log(records[i]);
																			console.log(action.result.data.id);  
																			controllTab(records[i],'edit');  
																		 } 
																	 }// loop   
																   } 
																},
															});
														controllTab(action.result.data,'edit'); 
														
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
								}  
								  
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
							  data:[['debtor_name', "ชื่อลูกค้า"],['c_code', "รหัสใบวางบิล"]],
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
					{
						xtype: 'compositefield',
						fieldLabel: 'วันที่แจ้ง Order',
						msgTarget : 'side',
						anchor    : '-20',
						defaults: { flex: 1 },
						items: [
							{
								xtype: 'datefield',
								name : 'startDate',
								id : 'startDateOrdersID',
								value:Ext.getDate.defaultDate(1)
							}, 
							{
								xtype: 'datefield',
								name : 'endDate',
								id : 'endDateOrdersID',
								value:Ext.getDate.defaultDate(2)
							}
						]
					},
		],  
		buttonAlign: 'left', 
		buttons: [ {
				xtype : 'tbfill'  
			},{	
				text : 'ค้นหา', 
				iconCls: 'icon-magnifier',  
				handler: function() { 
			 
					Ext.store.setBaseParam("mode", "SEARCH");
					Ext.store.setBaseParam("filter",Ext.getCmp("filterOrders-ID").getValue()); 
					Ext.store.setBaseParam("value", Ext.getCmp("valOrders-ID").getValue());  
					Ext.store.setBaseParam("d_begin_dateID", Ext.getCmp("startDateOrdersID").getValue());  
					Ext.store.setBaseParam("d_end_dateID", Ext.getCmp("endDateOrdersID").getValue());  
					Ext.getCmp('gridOrdersID').getStore().load(); 
				},

			},{
				text : 'เริ่มใหม', 
				iconCls: 'icon-reset',	
				handler : function() { 
					Ext.getCmp('frm-grid-searchOrdersID').getForm().reset();  
					Ext.getCmp('startDateOrdersID').setValue(Ext.getDate.defaultDate(1));
					Ext.getCmp('endDateOrdersID').setValue(Ext.getDate.defaultDate(2)); 
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
							  data:[['debtor_name', "ชื่อลูกค้า"],['so_code', "รหัสใบสั่งขาย"],['c_code', "รหัสใบวางบิล"],['c_invoice_item', "รายการวางบิล"]],
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
						fieldLabel: 'วันที่ใบใบวางบิล',
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
					controllTab({},'add');
					//windowOrders({},'add');
					
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
			url : 'api/ListAddBillingNoOrderDtl.php',
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
				{ name:'f_total_cost' }, 
				{ name:'f_tax_amt' }, 
				{ name:'f_vat_amt' }, 		//ยอดรวม vat 				
				{ name:'f_net_cost' }, 	
				{ name:'dc_user_create_id' }, 
				{ name:'dc_user_create_cost_id' },
				{ name:'d_create' },
				{ name:'dc_user_update_id' },
				{ name:'dc_user_update_cost_id' },
				{ name:'d_update' },
			] //   
		});	
		
		var gridDtl2 = {  
						xtype: 'grid',
						id:'tabSoDtlGrid',
						border: false,
						stripeRows: true,
						loadMask: true,
						frame : true,
						bodyStyle : "padding:2px",
						autoHeight: true,
						store: Ext.storeBlDtl, 
						viewConfig:{ forceFit: true, getCellCls: function(value) { console.log(value); } },
						columns:[
							 new Ext.grid.RowNumberer({
									width:35,
									header:" No ",
							renderer:function(value, metaData, record, row, col, store, gridView){
								return record.get('no');
								}
							}),
							{ header: "ID System", sortable: true, hidden:true, dataIndex: 'c_name' },
							{ id: 'removePro', align:'center', header: "ลบ", width:50, dataIndex: 'soDtlID' }, 
							{ align:'center', header: "สถานะ", width:50, dataIndex: 'c_receive'},
							{ header: "รายการวางบิล", width:210, dataIndex: 'c_name' , 
								renderer:function(value, metaData, record, row, col, store, gridView){
									
									if(record.get('id')=='grandTotal'){ 
										Ext.getCmp('f_total_cost_sumID').setValue(record.get('f_total_cost'));
										Ext.getCmp('f_vat_amt_sumID').setValue(record.get('f_vat_amt')); 
										Ext.getCmp('f_net_cost_sumID').setValue(record.get('f_net_cost'));
										Ext.getCmp('f_tax_amt_sumID').setValue(record.get('f_tax_amt'));
										Ext.getCmp('f_net_cost_add_vat_sumID').setValue(record.get('f_net_cost_add_vat'));
								
								 Ext.sumDtl = Ext.apply({ 
									 f_total_cost:record.get('f_total_cost'),
									 f_vat_amt:record.get('f_vat_amt'),
									 f_net_cost:record.get('f_net_cost'),
									 f_tax_amt:record.get('f_tax_amt'),
									 f_before_edit_vat:record.get('f_vat_amt'),
									 f_net_cost_add_vat:record.get('f_net_cost_add_vat'),
								 });
								 
										/* if(Ext.f_vat==null)Ext.getCmp('f_vat_amt2ID').setValue(record.get('f_vat_amt')); 
										else Ext.getCmp('f_vat_amt2ID').setValue(Ext.f_vat); 
											Ext.getCmp('f_net_cost_add_vat_amt2ID').setValue(record.get('f_net_vat_amt')); */
									}
									
									return value;
								} 
							}, 
							{ header: "จำนวน/ครั้ง", align:'right', width:70, dataIndex: 'f_quan'},
							{ header: "ราคา/หน่วย", align:'right', width:70, dataIndex: 'f_unit_cost'},
							{ header: "ราคารวม", align:'right', dataIndex: 'f_total_cost'},  
							{ header: "หัก ณ ที่จ่าย", align:'right', width:70, dataIndex: 'f_tax_amt'},  
							{ header: "หมายเหตุ",  dataIndex: 'c_comment', width:70},  
							], 
				};
		
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
			title:'แก้ไข/เลือกรายการวางบิล', 
			items:[{
						xtype:'hidden',
						name:'id',
						value:Ext.getCmp('hdrID').getValue(), 
					},{
						xtype:'hidden',
						name:'mode',
						value:'GENCODE',
					},
					{ 
						xtype:'button',
						text:'เลือกรายการวางบิล', 
						id:'buAddProID',
						handler: function() { windowProduct({},'add');  /* selectProductBilling("BL"); */ }
					} ,
					gridDtl2,//grid
					{ 
						html: "<p>&nbsp;</p>",
						style: 'display: block;margin-top: 0.5em; margin-bottom: 0.5em; margin-left: auto; margin-right: auto; border-style: hidden;'
					}, 					
					{
						xtype:'textfield',
						fieldLabel:'จำนวนเงินรวม',
						name:'f_total_cost_sum',
						id:'f_total_cost_sumID',
						readOnly:true, 
					},
					/* {
							xtype: 'compositefield',
							fieldLabel: 'จำนวนเงินภาษีมูลค่าเพิ่ม', 
							msgTarget : 'under',
							items: [{
								xtype:'textfield', 
								name:'f_vat_amt_sum',
								id:'f_vat_amt_sumID', 
								 	
								validator: function(val) { 
									var regex  = /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\.[0-9]{1,2})?$/; 
									if (!regex.test(val))
									{ return "กรุณากรอก จำนวนเงินเป็นจำนวนทศนิยม มูลค่ามากกว่า 0.00"; }else{ return true; }
								},
							},{
								xtype: 'displayfield',
								style: 'font-weight:bold;color:red;',
								value: ' !! หมายเหตุ จำนวนเงินภาษีมูลค่าเพิ่ม แก้ไขได้ไม่เกิน (+/-) 0.02 บาท ',
							} ] 	
					
						} 
					*/ 

					{
						xtype:'textfield', 
						fieldLabel:'ภาษีมูลค่าเพิ่ม',
						name:'f_vat_amt_sum',
						id:'f_vat_amt_sumID', 
						validator: function(val) { 
							var regex  = /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\.[0-9]{1,2})?$/; 
							if (!regex.test(val))
							{ return "กรุณากรอก จำนวนเงินเป็นจำนวนทศนิยม มูลค่ามากกว่า 0.00"; }else{ return true; }
						},
						listeners:{
							afterrender:function(){
								    this.getEl().on('click',function(){ 
										Ext.vatOld = parseFloat(Ext.sumDtl.f_before_edit_vat.replace(/,/g,'')); 
										Ext.get(this.id).dom.value = Ext.vatOld;
									});
								    this.getEl().on('blur',function(){  
										console.log(' Old Value :: '+Ext.vatOld+' New value : '+this.getValue());
										var v1 = Ext.vatOld+0.02;
										var v2 = Ext.vatOld-0.02;   
										if(v1<this.getValue() || v2 >this.getValue()){  
											Ext.Msg.alert('Failure', Ext.vatOld.toFixed(2)+' แก้ไขได้ไม่เกิน (+/-) 0.02 บาท',function(){   
												Ext.getCmp('contenterCenter').setActiveTab('frm-so-dtlID'); 
												Ext.get('f_vat_amt_sumID').dom.focus();  
											});
										}else{ 
											var f_tax_amt = parseFloat(Ext.sumDtl.f_tax_amt.replace(/,/g,''))
											var f_total_cost = parseFloat(Ext.sumDtl.f_total_cost.replace(/,/g,''))
											var f_add_vat = parseFloat((f_total_cost/1)+(this.getValue()/1));
											var f_net_cost = parseFloat((f_add_vat/1)-(f_tax_amt/1));
											Ext.get(this.id).dom.value = Ext.floatRenderer(this.getValue()); 
											Ext.get('f_net_cost_add_vat_sumID').dom.value = Ext.floatRenderer(f_add_vat);
											Ext.get('f_net_cost_sumID').dom.value = Ext.floatRenderer(f_net_cost);
											
											
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
						readOnly:true,
					},
					{
						xtype:'textfield',
						fieldLabel:'ยอดสุทธิ',
						name:'f_net_cost_sum',
						id:'f_net_cost_sumID',
						readOnly:true,
					}
	/*TODO 
	*
	* ในกรณีที่มีการแก้ไข (ภาษีมูลค่าเพิ่ม )f_vat_amt_sumID +/- 0.02 จาก  ฟังก์ชัน validVat&call
	* ค่า  จำนวนเงินรวมภาษีมูลค่าเพิ่ม ,ยอดสุทธิ 
	* ต้องมีการคำนวณใหม่อีกรอบ
	*
	*/
					], 
			buttonAlign: 'left',
			buttons:[{
						text : 'พิมพ์ใบวางบิลแจ้งหนี้',
						id:'buSave1ID',
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
												 /*
												 *
												 *
												 */ 
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
		var id = 'printBLID';
		var storeDtl =new Ext.data.JsonStore({
			storeId: 'myStoreBlDtl3', 
			url : 'api/ListBillingNoOrderPrintDtl.php', 
			root: 'data', 
			idProperty: 'id',
			baseParams: { sumDtl:Ext.util.JSON.encode(Ext.sumDtl) },
			totalProperty: 'totalCount',  
			fields: [
				{ name: 'no' },
				{ name: 'id' },		
				{ name: 'soBill', type: 'int' },
				{ name: 'billing' },					
				{ name: 'soDtlID' },	
				{ name: 'soDtlEditID' },
				{ name: 'ap_po_hdr_id' },
				{ name: 'd_end_credit' },
				{ name: 'f_wht_amt' },
				{ name: 'f_net_disc_comm_amt' },
				{ name: 'f_vat_amt' }, 		//ยอดรวม vat
				{ name: 'f_net_vat_amt' },	//ยอดรวมทั้งหมดบวก vat f_net_disc_comm_amt+f_vat_amt
				{ name: 'dc_product_id', type: 'int' },
				{ name: 'txtdc_product_idID', type: 'string' },
				{ name: 'c_code', type: 'string' },
				{ name: 'c_name', type: 'string' },  
				{ name: 'c_comment', type: 'string' }, 
				{ name: 'i_enable', type: 'int'  },		
				{ name:'dc_user_create_id' },
				{ name:'i_is_jingle' },
				{ name:'i_seq', type: 'int'  },	 
				{ name:'c_type' },
				{ name:'f_quan' },
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
						{ header: "รายการ", dataIndex: 'c_name',id:'CproductID',
							renderer:function(value, metaData, record, row, col, store, gridView){
								return value;
							}
						}, 
						{ header: "จำนวน", align:'right', dataIndex: 'f_quan', width:120},   
						{ header: "จำนวนเงิน", align:'right', dataIndex: 'f_total_cost' , width:300 }, 
						], 
						autoExpandColumn: "CproductID",
		};	

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
								url:'api/mnBillingsNoOrderPrint.php', 
								labelWidth: 1,
								listeners: { 
									afterrender: function( obj, eOpts ){ 
										console.log(Ext.sumDtl); 
									}, 
								},
								items:[
								 { xtype:'hidden', name:'mode', value:'GENCODEPRINT', }, 
								 { xtype:'hidden', name:'id', value:Ext.getCmp('hdrID').getValue(), },
								 { xtype:'hidden', name:'sumDtl', value:Ext.util.JSON.encode(Ext.sumDtl), }, 
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
												 { xtype:'displayfield', value:'เลขที่สั่งขาย '+record.get('so_code'), },
												]
								 },	 	 
								 {
										xtype: 'compositefield', 
										msgTarget : 'side',
										anchor    : '-10',
										defaults: { flex: 1 },
										items: [ { xtype:'displayfield', value:'ที่อยู่ '+record.get('c_address_inv'), },
												 { xtype: 'displayfield',  value:' &nbsp; ', },
												 { xtype:'displayfield', value:'วันที่ '+record.get('c_billing_date'), },
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
										text : 'จัดพิมพ์ใบวางบิล',
										id:'buSaveSubID',
										iconCls:'printer_mono', 
										handler : function() { 
Ext.Ajax.request({
	url : 'api/mnBillings.php' , 
	params : { 
		mode : 'CHECKCLOSEBILLING', 
		d_billing_date:Ext.getCmp('d_billing_dateID').getValue(),  
		id:Ext.getCmp('hdrID').getValue(), 
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
			title: 'แสดงข้อมูลรายการใบวางบิลไม่มี Order',
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
				return value+' <img src="../images/icons/printer_mono.png" style="cursor:pointer"/>';
			}},
			{ header: "รายการวางบิล", sortable: true, dataIndex: 'c_invoice_item' ,width:150, }, 			
			{ id: 'c_debtor_name', header: "ลูกค้า", width:210, sortable: true, dataIndex: 'c_debtor_name' }, 
			{ header: "หน่วยงาน", sortable: true, dataIndex: 'c_cost_name' ,width:120, },
			{
				header: "วันที่ใบใบวางบิล",  
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
	


     