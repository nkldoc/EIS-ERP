 
		Ext.Cont = Ext.apply({
					dc_cnt_id:0, 
					bh_contract_id:0,
					i_cont:0,
				});
 
 
	//ใช้เกี่ยวกับวันที่ในการเซตปฏิทน หรือ ลิสบ็อก
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

		Ext.CngHeader = Ext.apply({ order_type:0 }); 
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
	
		Ext.storeCnt = new Ext.data.JsonStore({ 
			autoLoad: true,
			storeId: 'myStoreCnt',
			url: 'api/All_ArCombo.php',
			baseParams: {type : 'storeCnt'},
			root: 'data',
			idProperty: 'id',
			totalProperty: 'totalCount', 
			fields: ['no','id', 'c_code','c_name'
			,'c_address','c_telephone','c_mobile','c_tax_value','c_ref_value'
			,'c_website','c_email','cnt_type_name'
			],
		});

 
		Ext.storeCost = new Ext.data.JsonStore({ 
			autoLoad: true,
			storeId: 'myStoreCostFormTv',
			url: 'api/All_ArCombo.php',
			baseParams: {type : 'storeCostFormNoOrder'},
			root: 'data',
			idProperty: 'id',
			totalProperty: 'totalCount',
			fields: [ 'no','id', 'c_code','c_name']
		});

		Ext.storeDcProduct = new Ext.data.JsonStore({ 
			autoLoad: true,
			storeId: 'myStorePro',
			url: 'api/All_ArCombo.php',
			baseParams: {type : 'storeProNoOrder'},
			root: 'data',
			idProperty: 'id',
			totalProperty: 'totalCount',
			fields: [ 'no','id', 'c_code','c_name']
		});

		Ext.storeCloseMonth = new Ext.data.JsonStore({
			storeId: 'mystoreCloseMonth',
			//autoDestroy: true,
			//autoLoad: true,
			url : 'api/ListBillingNoOrder.php',
			root: 'data', 
			idProperty: 'id',
			totalProperty: 'totalCount',	
			baseParams: { mode:'GETCLOSEMONTH' },			
			fields: [
				{ name: 'no' }, 
				{ name: 'id' },
				{ name: 'bill_yyyy_mm' },
				{ name: 'txt_yyyy_mm', type: 'string' },	
			],
		});	
		 
		Ext.store = new Ext.data.JsonStore({
			storeId: 'myStore',
			autoDestroy: true,
			autoLoad: true,
			url : 'api/ListBillingNoOrder.php',
			root: 'data',
			baseParams: { i_read:user_right_read,d_begin_dateID:Ext.getDate.defaultDate(1),d_end_dateID:Ext.getDate.defaultDate(2) }, //Permission i_read
			idProperty: 'id',
			totalProperty: 'totalCount',	 
			fields: [
				{ name: 'no' },
				{ name: 'id' },		
				{ name: 'delID' },				
				{ name: 'editID' },	 
				{ name: 'cancelID' },	
				{ name: 'delCancelID' },
				{ name: 'i_enable' },
				{ name: 'ar_bill_invoice_hdr_id' },				
				{ name: 'print_status' },		
				{ name: 'ar_pre_print_bill_hdr_id' },	 
				{ name: 'ar_so_hdr_id' },
				{ name: 'd_so_date' },
				{ name: 'bill_yyyy_mm' },
				{ name: 'c_yyyy_mm' },
				{ name: 'c_area_code1' },
				{ name: 'c_contract_no' },
				{ name: 'd_contract_date' }, 
				{ name: 'c_contract_date' }, 
				{ name: 'txt_yyyy_mm', type: 'string' },				
				{ name: 'f_total_cost_amt',  },
				{ name: 'f_net_cost_add_vat_amt',  },
				{ name: 'f_vat_amt',  },
				{ name: 'dc_comm_id', type: 'int'  }, 
				{ name: 'txtdc_emp_idID', type: 'string' }, 
				{ name: 'dc_emp_id', type: 'int'  }, 
				{ name: 'txtcnt_emp_idID', type: 'string' }, 
				{ name: 'cnt_emp_id', type: 'int'  }, 	 
				{ name: 'c_code', type: 'string' },
 				{ name: 'd_billing_date', type: 'string' },
				{ name: 'c_billing_date', type: 'string' },
	  			{ name: 'd_end_credit', }, //text covert from d_end_pay
				{ name: 'd_end_pay', },
				{ name: 'dc_product_type_id', type: 'int'  },	
				{ name: 'txtdc_product_type_idID', type: 'string' }, 
				{ name: 'i_is_show_disc_cash', type: 'int'  },	
				{ name: 'i_is_show_txt_dtl', type: 'int'  },
				{ name: 'dc_area_id', type: 'int'  },
				{ name: 'dc_cost_id', type: 'int'  },	
				{ name: 'c_cost_name', type: 'string' },
				{ name: 'txtdc_cost_idID',  },
				{ name: 'c_inv_old', type: 'string' },
				{ name: 'c_status', type: 'string' },
				
				//cnt
				{ name: 'c_address_inv' },
				{ name: 'c_billing_addr' },
				{ name: 'print_status' },
				{ name: 'c_billing_date' },
				{ name: 'c_billing_name' },
				
				{ name: 'c_address',  },
				{ name: 'c_telephone',  },
				{ name: 'c_mobile',  },
				{ name: 'c_tax_value',  },
				{ name: 'c_website',  },
				{ name: 'c_email',  },
				{ name: 'cnt_type_name',  },
 		
				{ name: 'dc_vat_id',  },
				{ name: 'c_name', type: 'string' },
				{ name: 'c_code', type: 'string' },
				{ name: 'c_area_code', type: 'string' },
				{ name: 'c_area_print', type: 'string' },
				
				{ name: 'dc_cnt_id', type: 'int'  },
				{ name: 'c_cnt_name', type: 'string' },				
				{ name: 'txtdc_cnt_idID',  },
				
				{ name: 'ar_package_id', type: 'int'  },
				{ name: 'txtar_package_idID', type: 'string' },
				
				{ name: 'txtpj_hdr_idID', type: 'string' },  
				{ name: 'pj_hdr_id', type: 'int'  },
				
				{ name: 'i_is_barter', type: 'int'  },
				{ name: 'i_is_imc', type: 'int'  },
				
				{ name: 'onair_yyyy_mm', type: 'string' }, 
				{ name: 'onair_yyyy', type: 'string' }, 
				{ name: 'onair_mm', type: 'string' },  
				{ name: 'd_doc_date', type: 'string' },
				{ name: 'i_group_type', type: 'int'  },	
				
/*				
								
				{ name: 'is_status', type: 'string' }, 
				{ name: 'i_enable', type: 'int'  },	
				{ name: 'c_so_no', type: 'string' }, 
				{ name: 'c_po_no', type: 'string' }, 
				 
				{ name: 'd_so_date', type: 'string' },  
				
				{ name: 'i_is_sale_external', type: 'int'  },	
				{ name: 'i_cont', type: 'int'  },	  
				{ name: 'bh_contract_id', type: 'int'  }, 
				 
				{ name: 'c_billing_inv_des', type: 'string' },  
				{ name: 'i_is_commit', type: 'int'  },	 */	
				
				{ name: 'order_type', type: 'string' },
				{ name: 'c_comment', type: 'string' }, 		
				{ name:'dc_user_create_id' },
				{ name:'dc_user_create_cost_id' },
				{ name:'d_create' },
				{ name:'dc_user_update_id' },
				{ name:'dc_user_update_cost_id' },
				{ name:'d_update' },
		]
		});	

		Ext.storeDtl = new Ext.data.JsonStore({
			storeId: 'myStoreDtl', 
			url : 'api/ListBillingNoOrderDtl.php',
			root: 'data', 
			idProperty: 'id',
			totalProperty: 'totalCount',
			sortInfo:{ field: 'i_seq', direction: 'ASC'}  , 	
			fields: [
				{ name: 'no' },
				{ name: 'id' },		
				{ name: 'soDtlID' },	
				{ name: 'soDtlEditID' },
				{ name: 'ap_po_hdr_id' },
				{ name: 'dc_product_id', type: 'int' },
				{ name: 'txtdc_product_idID', type: 'string' },
				{ name: 'c_code', type: 'string' },
				{ name: 'c_name', type: 'string' },  
				{ name: 'i_enable', type: 'int'  },		
				{ name:'dc_user_create_id' },
				{ name:'i_is_jingle' },
				{ name:'i_seq', type: 'int'  },	
				{ name:'c_type' },
				{ name:'f_wht_amt' },
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
					
		Ext.PopCntForm = new Ext.ux.Poplov({ 
				text		: 'ชื่อลูกค้า',  
				id			: 'dc_cnt_idID',	//go to relation	
				iconCls		: 'page_magnify', 
				valueHidden : 'dc_cnt_id', 		//go to hidden
				store		: Ext.storeCnt,
				headerGrid	: columnMini,
				widthText	: 330,  
				fieldLabel	: 'ชื่อลูกค้า',  
				isCellClickGrid:true, 
				afterrender: function(){ /*alert(this.getId());*/ }, 
				cellClickGrid:function(grid, rowIndex, columnIndex, e) { 
				
					var id = 'dc_cnt_idID';
					var nameID = id+'_Name';
					var record 		= grid.getStore().getAt(rowIndex);  
					var TextShow 	= record.data.c_code+' '+record.data.c_name;
					
					Ext.getCmp(id).setValue(record.data.id);
					Ext.getCmp(nameID).setValue(TextShow);  
					Ext.getCmp("win-pop-lov"+id).hide();  					
					Ext.getCmp("win-pop-lov"+id).destroy();  
					Ext.getCmp('frm-so-hdrID').getForm().loadRecord(record || {});
	 
				},
		});
		
 
		Ext.storeCloseMonth.reload({ 
			params: { mode:'GETCLOSEMONTH'},
			callback: function(records, operation, success) {  
				   if (success){  
					Ext.CloseBillingOnMonth = Ext.apply({
						close_yyyy_mm:parseInt(records[0].get('bill_yyyy_mm')), 
						txtNotice:'<b>ระบบได้ปิดการวางบิล/รับเงิน ประจำเดือน <span style="color:blue">'+records[0].get('txt_yyyy_mm')+'</span>  แล้ว</b> ', 
					}); 
					
				   } 
				},
		}); 

		//################
		formSoHdr	 = function() {
		  
		 

		var warningText = "<p>** กรณีที่เป็นการแจ้งหนี้ใหม่แทนใบแจ้งหนี้เดิม ให้ระบุวันที่แจ้งหนี้เดิมและ วันที่ครบกำหนดชำระเงินตามเดิม </p>"
							+ "<p>เพื่อให้ระบบทำการวิเคราะห์อายุหนี้ใด้ถูกต้อง </p>"
							+ "<font color:blue>"+(Ext.CloseBillingOnMonth.txtNotice || {})+"</font>";  
		
		
 
		// Field hdr
		var itemsSoHdr = [{
				xtype:'hidden', name:'ar_so_hdr_id', id:'hdrSoID'
			},{
				xtype:'hidden', name:'id', id:'hdrID'
			},{
				xtype:'hidden', name:'mode', id:'modeID', value:'ADD'
			},{
				xtype:'hidden', name:'removeDtl', id:'removeDtlID', value:'',
			} ,{ 
				xtype:'textfield', fieldLabel:'รหัส' ,width:250,name:'c_area_code1',value:'0', readOnly:true,
			} ,
			   Ext.PopCntForm.mini
		
			, { xtype:'displayfield', fieldLabel:'ประเภทลูกค้า' ,name:'cnt_type_name',  }	
			, { xtype:'displayfield', fieldLabel:'เลขประจำตัวผู้เสียภาษีอากร' ,name:'c_tax_value',  }	
			, { xtype:'displayfield', fieldLabel:'ที่อยู่' ,name:'c_address',  }	
			, { xtype:'displayfield', fieldLabel:'โทรศัพท์' ,name:'c_telephone', }	
			, { xtype:'displayfield', fieldLabel:'โทรศัพท์เคลื่อนที่' ,name:'c_mobile',  }	
			, { xtype:'displayfield', fieldLabel:'โทรสาร' ,name:'c_fax',   }	
			, { xtype:'displayfield', fieldLabel:'เว็บไซต์' ,name:'c_website', }	
			, { xtype:'displayfield', fieldLabel:'อีเมล์' ,name:'c_email',  }	 
			,
			 { 	xtype: 'compositefield', id:'chg_cost_dis_idID',
											fieldLabel: 'หน่วยงาน',
											msgTarget : 'side',
											/* anchor    : '-20', */
											defaults: { flex: 1 },
											width:700,
											items:[Ext.PopCostForm.mini], 
			} ,{ //ประเภทรายได้ที่ต้องการวางบิล
				width:          250, 
				xtype:          'combo',
				mode:           'local',
				value:          2,
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
				/* listeners: {
					select : function(cb, rec, ind) { this.getRate(rec.json.f_vat_rate); },
					afterrender:function(){
						this.getRate = function(v){  Ext.getCmp('f_vat_rateID').setValue(v); }; 
						this.getRate(this.getStore().data.items[0].json.f_vat_rate);
					},
					
				} */
			},{
				xtype:'textfield',
				fieldLabel: 'เลขที่เอกสาร',
				name:'c_inv_old',
			},{
				xtype: 'displayfield',
				//fieldLabel: 'วันที่แจ้งหนี้',
				value:'<div style="background:#eeeeee !important; color:red;width:550px; height:80px;border:1px solid #ccc;">'+warningText+'</div>'
			},{ 	xtype: 'compositefield' ,
						fieldLabel: 'วันที่ออกใบวางบิล',
						msgTarget : 'side',
						anchor    : '-20',
						defaults: { flex: 1 },
						items:[{
								xtype: 'datefield', 
								id : 'd_billing_dateID', 
								name : 'd_billing_date', 
								width:150,
								value :Ext.getDate.getNowCarlen(), 
								validator: function(val) { return Ext.isEmpty(val)?"กรุณาใส่ วันที่ออกใบวางบิล":true; }, 
							}/* ,{ xtype:'displayfield', value:Ext.CloseBillingOnMonth.txtNotice,} */], 			 
			},{  

					xtype: 'checkbox', 
					name: 'i_is_show_disc_cash',
					boxLabel: '<font color="red">ต้องการแยกส่วนลดล่วงหน้า/ส่วนลดเงินสด </font>',
					checked:true,
					inputValue: 1,
			},{  
					xtype: 'checkbox', 
					name: 'i_is_show_txt_dtl',
					boxLabel:'<font color="red">ต้องการแสดงภาษีหัก ณ ที่จ่ายในใบวางบิล</font>',
					inputValue: 1,
			},{
				
				xtype: 'datefield',
				fieldLabel: 'วันที่ครบกำหนดชำระเงิน',
				name : 'd_end_pay',
				value :Ext.getDate.getNowCarlen(),
				validator: function(val) { return Ext.isEmpty(val)?"กรุณาเลือก วันที่ใบสั่งโฆษณา":true; }, 
			}, 
			{
				
		xtype: 'compositefield' ,
						fieldLabel: 'เลขที่สัญญา',
						msgTarget : 'side',
						//anchor    : '-20',
						defaults: { flex: 1 },
						width:700,
						items:[{
								xtype:'textfield',
								name:'c_contract_no',
								id:'c_contract_noID',
								width:150,
							},{ xtype:'displayfield',value:' ลงวันที่  : ',width:50,},{
								xtype: 'datefield', 
								id : 'd_contract_dateID', 
								name : 'd_contract_date', 
								
								width:150,
								value :Ext.getDate.getNowCarlen(), 
								//validator: function(val) { return Ext.isEmpty(val)?"กรุณาใส่ วันที่ออกสัญญา":true; }, 
							}], 			 
			},{  
			
				xtype: 'datefield',
				fieldLabel: 'วันที่บันทึกรายการ',
				name : 'd_doc_date', 
				value :Ext.getDate.getNowCarlen(),
				readOnly:true, 
			},{ 
				xtype:'textarea', width:500,fieldLabel:'หมายเหตุ', name:'c_comment',
			} ]; //itemsSoHdr
		
			formSoHdr.superclass.constructor.call(this, {  
					listeners:{
						afterrender: function( obj, eOpts ){ console.log('Load Finish'); },
					},
					id:'frm-so-hdrID',
					url:'api/mnBillingNoOrder.php',
					frame : true,
					bodyStyle : "padding:5px", 
					autoScroll: true,
					width   : 700,  
					labelWidth: 160,
					defaults:{ flex:1, },  
					//closable:true,
					loadMask: true,
					title:'บันทึกใบสั่งโฆษณา',
					items:itemsSoHdr, 
					buttonAlign: 'left',
					buttons:[{
						text : 'บันทึกรายการ',
						id:'buSaveID',
						iconCls:'icon-save', 
						handler : function() { 
						
						var form 			= Ext.getCmp('frm-so-hdrID').getForm();   
						var order_type 		= Ext.getCmp('order_type_idID').getValue().inputValue; 
						var pro_type_id 	= Ext.getCmp('dc_product_type_idID').getValue(); 
						
						var billing_yyyy_mm = parseInt((parseInt(Ext.getCmp('d_billing_dateID').value.substring(6, 10))-543)+''+Ext.getCmp('d_billing_dateID').value.substring(3, 5));			 

	 
						if(Ext.CngHeader.order_type!=order_type || Ext.CngHeader.dc_product_type_id != pro_type_id)
						 Ext.getCmp('removeDtlID').setValue('CHGHEADER');
						else Ext.getCmp('removeDtlID').setValue('');
	 
						if(Ext.CloseBillingOnMonth.close_yyyy_mm>=billing_yyyy_mm){
								Ext.Msg.alert('Notice', Ext.CloseBillingOnMonth.txtNotice); 
								
						}else if(Ext.isEmpty(Ext.getCmp('dc_cnt_idID_Name').getValue())){
								 
							Ext.Msg.alert('Failure', 'กรุณาเลือกลูกค้า',function(){
									Ext.get('dc_cnt_idID_Name').dom.focus(); 
							}); 
						}else if(Ext.isEmpty(Ext.getCmp('dc_cost_idID_Name').getValue())){ //
								 
							Ext.Msg.alert('Failure', 'กรุณาเลือกหน่วยงาน',function(){
									Ext.get('dc_cost_idID_Name').dom.focus(); 
							}); 
						}else if(Ext.isEmpty(Ext.getCmp('dc_product_type_idID_Name').getValue())){ //
								 
							Ext.Msg.alert('Failure', 'กรุณาเลือกประเภทรายได้ที่ต้องการแจ้งหนี้',function(){
									Ext.get('dc_product_type_idID_Name').dom.focus(); 
							}); 
						}else if(Ext.getCmp('order_type_idID').getValue().inputValue=='i_is_imc' && Ext.getCmp('pj_hdr_idID_Name').getValue()==''){
							var isChk = false;   
							Ext.Msg.alert('Failure', 'กรุณาเลือกชื่อโครงการ',function(){
								Ext.get('order_type_idID').dom.focus();  
							});
							 
						}else if (form.isValid()){ 
							form.submit({
								waitMsg:'Saving Data...',
								success : function(form, action) {    
									Ext.Msg.alert('Success', action.result.msg,function(){ 
	 
									Ext.CngHeader = Ext.apply({
										order_type:action.result.data.order_type,
										dc_product_type_id:action.result.data.dc_product_type_id
									});  
									
									Ext.getCmp('hdrID').setValue(action.result.data.ar_bill_invoice_hdr_id);
									Ext.getCmp('hdrSoID').setValue(action.result.data.ar_so_hdr_id); 
									Ext.getCmp('tabpanel1').getStore().load(); 
									
									Ext.getCmp('modeID').setValue('EDIT'); 
									// Before Remove After Add New
									Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-dtlID'), true) || {}; //null obj not errer
									var frmSoDtl = new formSoDtl();
									Ext.getCmp('contenterCenter').add(frmSoDtl);
									Ext.getCmp('contenterCenter').setActiveTab(frmSoDtl);
									
									if(!Ext.isEmpty(action.result.data)){
										Ext.getCmp('hdrID').setValue(action.result.data.id);	
										Ext.getCmp('frm-onair_displayID').setValue(action.result.data.onair_yyyy_mm);
									};
									
									//Ext.storeDtl.reload();
									
									Ext.storeDtl.reload({ 
									params: { mode:'GETDATA',id:action.result.data.ar_so_hdr_id,accessData:'edit'},
									callback: function(records, operation, success) {  
										   if (success){ 
												Ext.getCmp('tabSoDtlGrid').on('cellclick', cellClick2,this); 
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
					}//hand
				} , {
					text : Ext.GLOBAL_BU_BACK_TH,
					handler: function() {
						Ext.getCmp('contenterCenter').setActiveTab('tabpanel1'); 
	 
					}
				}]

			});
		};
		Ext.extend(formSoHdr, Ext.FormPanel, {}); 

		var validVat = function(){
			//alert('Run Fn valVat');
			//Ext.select('#f_vat_amt2ID').on('click', function(){ alert('Run Fn valVat'); });
			
			Ext.select('#f_vat_amt2ID').on('blur', function(){  
			
			
				var old			= parseFloat(Ext.getCmp('f_vat_amt2ID').value.replace(/,/g,'')); 
				var f_vat_amt 	= Ext.isEmpty(Ext.getCmp('f_vat_amt2ID').getValue())?0.00:parseFloat(Ext.getCmp('f_vat_amt2ID').getValue().replace(/,/g,''));
				var v1 = old+0.02;
				var v2 = old-0.02;   
				//console.log(old+' >>>> get '+f_vat_amt);
				if(v1<f_vat_amt || v2 >f_vat_amt){  
					Ext.Msg.alert('Failure', old.toFixed(2)+' แก้ไขได้ไม่เกิน (+/-) 0.02 บาท',function(){   
						Ext.getCmp('contenterCenter').setActiveTab('frm-so-dtlID'); 
						Ext.get('f_vat_amt2ID').dom.focus();  
					});
				}  
			});
		};	
		
		function selectProduct(record){
			
		Ext.PopProForm  = new Ext.ux.Poplov({ 
				text		: 'รายการออกอากาศ',  
				id			: 'dc_product_idID',	//go to relation fq[bh_contract_id]	
				iconCls		: 'page_magnify', 
				valueHidden : 'dc_product_id', 		//go to hidden
				store		:  Ext.storeDcProduct,
				headerGrid	:  columnMini,
				widthText	:  330,  
				fieldLabel	:  'รายการออกอากาศ', 
				isCellClickGrid:true,
				afterrender:function(){ Ext.storeDcProduct.setBaseParam("dc_product_type_id", Ext.CngHeader.dc_product_type_id);},
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

		});		// f_quanID f_total_costID f_disc_comID f_disc_cashID f_net_costID 
		var itemsSoDtl = [{ xtype:'hidden',id:'modeProID',name:'mode',value:'ADD'},
							{ xtype:'hidden',id:'f_disc_com_amtID',name:'f_disc_com_amt'},
							{ xtype:'hidden',id:'f_disc_cash_amtID',name:'f_disc_cash_amt'},
							{ xtype:'hidden',id:'dtllHdrID',name:'hdrID', },
							{ xtype:'hidden',id:'dtlDtlID',name:'id', },
							{
							xtype: 'displayfield', 
							fieldLabel:'เดือน/ปี ที่ออกอากาศ',
							id:'onair_displayID',   
						}, Ext.PopProForm.mini
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
							id:'f_total_costID',
							name:'f_total_cost',
							fieldLabel:'จำนวนเงินรวม ',
							validator: function(val) { 
								var regex  = /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\.[0-9]{1,2})?$/; 
								if (!regex.test(val))
								{ return "กรุณากรอก จำนวนเงินเป็นจำนวนทศนิยม มูลค่ามากกว่า 0.00"; } else {
									return true;
								}
							},
						},{ 
							id:'f_disc_comID',
							name:'f_disc_com',
							fieldLabel:'ส่วนลดการค้า   (%)',
							validator: function(val) { 
								var regex  = /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\.[0-9]{1,2})?$/; 
								if (!regex.test(val))
								{ return "กรุณากรอก จำนวนเงินเป็นจำนวนทศนิยม มูลค่ามากกว่า 0.00"; } else {
									return true;
								}
							},
						},{ 
							id:'f_disc_cashID',
							name:'f_disc_cash',
							fieldLabel:'ส่วนลดล่วงหน้า/ส่วนลดเงินสด (%)',
							validator: function(val) { 
								var regex  = /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\.[0-9]{1,2})?$/; 
								if (!regex.test(val))
								{ return "กรุณากรอก จำนวนเงินเป็นจำนวนทศนิยม มูลค่ามากกว่า 0.00"; } else {
									return true;
								}
							},	 
						},{ 
							id:'f_net_costID',
							name:'f_net_cost',
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
			title : " บันทึกใบสั่งโฆษณาโทรทัศน์ ",
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
									
										Ext.storeDtl.reload(); 
										Ext.getCmp("win-pop-lov"+id).destroy();
										//Ext.getCmp("buGenCodeID").show();
										Ext.f_vat=null;
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
		
		
		Ext.getCmp('form-widgets'+id).getForm().loadRecord(record || {});
	 
	};
	 
		formSoDtl	 = function() {
			formSoDtl.superclass.constructor.call(this, {  
					listeners:{
						afterrender: function( obj, eOpts ){ console.log('Load Finish'); },
					},
					id:'frm-so-dtlID', 
					url:'api/mnBillingNoOrder.php', 
					frame : true,
					bodyStyle : "padding:0px", 
					autoScroll: true,
					loadMask: true,
					width   : 700,  
					labelWidth: 150,
					defaults:{ flex:1, },   
					title:'รายการออกอากาศ/กิจกรรม Event', 
					//listeners: { afterrender:function() {  }, },
					items:[{
							xtype:'hidden',
							name:'mode',
							value:'sumDtl'
						},{
							xtype:'hidden',
							name:'ar_bill_invoice_hdr_id',
							//value:'sumDtl'
							listeners:{
								afterrender:function(){
									this.setValue(Ext.getCmp('hdrID').getValue());
								}
							},
						},{
								xtype: 'displayfield', 
								fieldLabel:'เดือน/ปี ที่ออกอากาศ', 
								id:'frm-onair_displayID',
								name:'onair_yyyy_mm',
						/* },{
							xtype:'displayfield',
							fieldLabel:'ประเภทรายได้', 
							id:'disBlDtlTypeProID', */  
										 
						},{ 
							xtype:'button',
							text:'ระบุรายการออกอากาศ/กิจกรรม Event', 
							id:'buAddSubDtlID',
							handler: function() {
									selectProduct();
									Ext.getCmp('onair_displayID').setValue(Ext.getCmp('frm-onair_displayID').getValue());
									Ext.getCmp('dtllHdrID').setValue(Ext.getCmp('hdrSoID').getValue());
									autoCal();
								}
							} , 
							gridDtl,
									{ 
							html: "<p>&nbsp;</p>",
							style: 'display: block;margin-top: 0.5em; margin-bottom: 0.5em; margin-left: auto; margin-right: auto; border-style: hidden;'
						}, 					
						{
							xtype:'textfield',
							fieldLabel:'จำนวนเงินรวมทั้งหมด',
							name:'f_total_cost_amt',
							id:'f_total_cost_amt2ID',
							readOnly:true,
						},
						{
							xtype:'textfield',
							fieldLabel:'ส่วนลดการค้า',
							name:'f_disc_cash_amt',
							id:'f_disc_cash_amt2ID',
							readOnly:true,
						},
						{
							xtype:'textfield',
							fieldLabel:'จำนวนเงินหลังหักส่วนลด', 
							name:'f_net_cost_amt',
							id:'f_net_cost_amt2ID',
							readOnly:true,
						},
						{
							xtype: 'compositefield',
							fieldLabel: 'จำนวนเงินภาษีมูลค่าเพิ่ม', 
							msgTarget : 'under',
							items: [{
								xtype:'textfield', 
								name:'f_vat_amt',
								id:'f_vat_amt2ID', 
								readOnly:true, /*  ปิดไม่ให้แก้ไข ภาษี */		
								validator: function(val) { 
									var regex  = /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\.[0-9]{1,2})?$/; 
									if (!regex.test(val))
									{ return "กรุณากรอก จำนวนเงินเป็นจำนวนทศนิยม มูลค่ามากกว่า 0.00"; }else{ return true; }
								},
							}/* ,{
								xtype: 'displayfield',
								style: 'font-weight:bold;color:red;',
								value: ' !! หมายเหตุ จำนวนเงินภาษีมูลค่าเพิ่ม แก้ไขได้ไม่เกิน (+/-) 0.02 บาท ',
							} */]/*  ปิดไม่ให้แก้ไข ภาษี */	
					
						},
						{
							xtype:'textfield',
							fieldLabel:'จำนวนเงินรวมภาษีมูลค่าเพิ่ม',
							name:'f_net_cost_add_vat_amt',
							id:'f_net_cost_add_vat_amt2ID',
							readOnly:true,
						},
						{ 
								html: "<div>&nbsp;</div>",
								style: 'background:eee !important; display: block;margin-top: 0.5em; margin-bottom: 0.5em; margin-left: auto; margin-right: auto; border-style: hidden;'
						},
						{
							xtype:'textfield',
							fieldLabel:'จำนวนเงินภาษีหัก ณ ที่จ่าย ',
							name:'f_wht_amt',
							id:'f_wht_amt2ID',
							readOnly:true,
						},{ 
							html: "<p>*ทุกครั้งที่ลบหรือเพิ่มต้องกดปุ่มบันทุกทุกครั้งเพื่อสรุป ภาษี</p>",
							style: 'font-weight:bold; color:red;display: block;margin-top: 0.5em; margin-bottom: 0.5em; margin-left: auto; margin-right: auto; border-style: hidden;'
						}						
						],  
						buttonAlign: 'left',
						buttons:[{
									text : 'บันทึกรายการ',
									id:'buGenCode2ID',
									iconCls:'icon-save', 
									listeners:{
										afterrender:function(){ 
											/* if(Ext.getCmp('c_area_codeEditDisID').getValue()!='0'){ 
											 
												Ext.getCmp('modeEditID').setValue('GENCODE2');
											}else{
												Ext.getCmp('modeEditID').setValue('GENCODE'); 
											} */ 
										}
									},
									handler : function() { 
										var form 	= Ext.getCmp('frm-so-dtlID').getForm(); 
										if(form.isValid()){ //form.isValid()
											form.submit({
												waitMsg:'Saving Data...',
												success : function(form, action) {
													
													Ext.Msg.alert('Success',  action.result.msg,function(){   
														Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-hdrID'), true) || {}; //null obj not errer
														Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-dtlID'), true) || {}; //null obj not errer		  
														Ext.store.reload(); 
														
													}); 
												},
												failure: function(form, action) {
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
							}]  
			});
		};
		Ext.extend(formSoDtl, Ext.FormPanel, {}); 
	 
		searchGrid = function() {

		
		var filters = {
							xtype: 'combo', 
							id:'filter-ID',
							store: new Ext.data.SimpleStore({
								  fields: ["id", "c_name"],  
								  data:[['c_area_code', "เลขที่แจ้งหนี้"],['c_so_no', "เลขที่พิมพ์ใบแจ้งหนี้้"],['cnt_name', "ชื่อลูกค้า"],['c_po_no', "เลขที่สัญญา"]],
							}),
							value: 'c_area_code',
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
		Ext.fieldsetID = false;					
		//classOverride				
		searchGrid.superclass.constructor.call(this, { 
			initComponent: function(){ 
				searchGrid.superclass.initComponent.call(this);
				
				this.fn(this); 
				console.log('Loading...');
			},
			listeners:{
				afterrender: function( obj, eOpts ){ console.log('Load Finish'); },
			},
			fn:function(){ },
			id:'frm-grid-searchID',
			//url:'api/ListTvAddOrder.php',
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
							fieldLabel: 'วันที่แจ้งหนี้',
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
						{
							xtype: 'fieldset',
							title: 'ค้นหาขั่นสูง',
							autoHeight: true,
							id:'fieldsetID',
							layout: 'form',
							collapsed: true,   // initially collapse the group
							collapsible: true,
							listeners: {
								collapse: function(p) {  
										if(Ext.fieldsetID==true)this.fn(1,.959); 
										Ext.fieldsetID = false;  
								},
								expand: function(p) {  
										Ext.fieldsetID =true;
										this.fn(1,.9589); 
										 
								}, 
								afterrender: function( obj, eOpts ){ 
									this.fn = function(widht,height){ //percentage 
										var width 	= Ext.getBody().getViewSize().width * widht;
										var height 	= Ext.getBody().getViewSize().height * height; 
										Ext.getCmp('tabpanel1').setSize(width, height);
									};
								},  						
							},
							items: [{
								xtype : 'compositefield',
								anchor: '-20',
								msgTarget: 'side',
								fieldLabel: ' สถานะการพิมพ์ใบแจ้งหนี้ ', 
								items : [
									{ 
										width:          130, 
										xtype:          'combo',
										mode:           'local',
										value:          '-1',
										triggerAction:  'all',
										forceSelection: true,
										editable:       false,
										fieldLabel:     'สถานะ',
										id:'i_is_printID',
										name:           'i_is_print',
										hiddenName:     'i_is_print',
										displayField:   'name',
										valueField:     'value',
										store:          new Ext.data.JsonStore({
											fields : ['name', 'value'],
											data   : [
												{name : 'เลือกทั้งหมด',   	value: '-1'},
												{name : 'พิมพ์ใบแจ้งหนี้แล้ว',  		value: '0'},
												{name : 'ยังไม่พิมพ์ใบแจ้งหนี้',  			value: '2'},
												 
											]
	 
										})
									}, {
									   xtype: 'displayfield',
									   value: ' เดือน/ปี ที่ออกอากาศ '
									}, { 
										width:          120, 
										xtype:          'combo',
										mode:           'local',
										value:          '-1',
										triggerAction:  'all',
										forceSelection: true,
										editable:       false,
										fieldLabel:     'เดือน',
										id:           'month_searchID',
										name:           'month_search',
										hiddenName:     'month_search',
										displayField:   'c_name',
										valueField:     'id',
										store:Ext.monthStoreAll,
									},
									{
											xtype: 'displayfield',
											value: 'ปี'
									},{ 
										width:          80, 
										xtype:          'combo',
										mode:           'local',
										value:          '-1',
										triggerAction:  'all',
										forceSelection: true,
										editable:       false,
										fieldLabel:     'ปี',
										name:           'year_search',
										id:           'year_searchID',
										hiddenName:     'year_search',
										displayField:   'c_name',
										valueField:     'id',
										store:new Ext.data.JsonStore({
													fields: [{name:'id'},{name:'c_name'}],
													data : Ext.genYearListAll(1,5,false),
													sortInfo:{ field: 'id', direction: 'DESC'}  , 	
												}),
									},
								]
							},{ 
										width:          130, 
										xtype:          'combo',
										mode:           'local',
										value:          '-1',
										triggerAction:  'all',
										forceSelection: true,
										editable:       false,
										fieldLabel:     'สถานะ',
										id:'i_enableID',
										name:           'i_enable',
										hiddenName:     'i_enable',
										displayField:   'name',
										valueField:     'value',
										store:          new Ext.data.JsonStore({
											fields : ['name', 'value'],
											data   : [
												{name : 'เลือกทั้งหมด',   	value: '-1'},
												{name : 'ใช้งาน',  		value: '1'},
												{name : 'ไม่ใช้งาน',  		value: '2'},
												 
											]
	 
										})
									} 
								]
						} //row		
			],  
			buttonAlign: 'left', 
			buttons: [ 
				{	
					text : 'เพิ่มข้อมูล',
					id:'buAdd',  
					iconCls: 'icon-add',  
					handler: function(grid, rowIndex, colIndex) { 
						//remove
						Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-hdrID'), true) || {}; //null obj not errer
						Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-dtlID'), true) || {}; //null obj not errer
						//add
						var frmSo = new formSoHdr();
						
						Ext.getCmp('contenterCenter').add(frmSo);  
						
						//Ext.getCmp('contenterCenter').add(new formSoDtl()); 
						Ext.getCmp('contenterCenter').setActiveTab(frmSo);
						//setStyleElementByForm
						Ext.get(frmSo.items.items[2].id).setStyle('background', '#eee'); 	//document id item
						Ext.get(frmSo.items.items[2].id).setStyle('color', '#ccc'); 		//document id item
						Ext.getCmp("modeID").setValue('ADD');
						//Ext.getCmp("buGenCodeID").hide();
						
						// Ext.select('.el').setStyle('color', 'green'); //class 
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
						
						if(Ext.fieldsetID===true){
									Ext.store.setBaseParam("month", Ext.getCmp("month_searchID").getValue());  
									Ext.store.setBaseParam("year", Ext.getCmp("year_searchID").getValue());   	  
									Ext.store.setBaseParam("dc_product_type_id", Ext.getCmp("dc_product_type_id1ID").getValue());  	 
									Ext.store.setBaseParam("i_enable", Ext.getCmp("i_enableID").getValue()); 
									Ext.store.setBaseParam("i_is_print", Ext.getCmp("i_is_printID").getValue());  
						}else{
									 
									Ext.store.setBaseParam("month", '-1');   
									Ext.store.setBaseParam("year", '-1');   
									Ext.store.setBaseParam("dc_product_type_id", '-1');  
									Ext.store.setBaseParam("i_enable", '-1'); 
									Ext.store.setBaseParam("i_is_print",'-1');  
						}	
					
						Ext.getCmp('tabpanel1').getStore().load(); 
					},

				},{
					text : 'เริ่มใหม', 
					iconCls: 'icon-reset',	
					handler : function() { 
						Ext.getCmp('frm-grid-searchID').getForm().reset(); 
						Ext.getCmp('startDateID').setValue(defaultDate(1));
						Ext.getCmp('endDateID').setValue(defaultDate(2)); 
					},
				}],
		 });
	};
		Ext.extend(searchGrid, Ext.FormPanel, {});  
 
		function controllTab(record,butt){
			
			Ext.storeCloseMonth.reload({ 
					params: { mode:'GETCLOSEMONTH'},
					callback: function(records, operation, success) {  
						   if (success){  
							Ext.CloseBillingOnMonth = Ext.apply({
								close_yyyy_mm:parseInt(records[0].get('bill_yyyy_mm')), 
								txtNotice:'ระบบได้ปิดการวางบิล/รับเงิน ประจำเดือน <span style="color:red">'+records[0].get('txt_yyyy_mm')+'</span>  แล้ว ', 
							}); 
							
						   } 
						},
					});
			//before add tab remove
			Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-hdrID'), true) || {}; //null obj not errer
			Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-dtlID'), true) || {}; //null obj not errer
			////create form and add tab
			var frmSo = new formSoHdr();
			var frmSoDtl = new formSoDtl();
			
			Ext.getCmp('contenterCenter').add(frmSo);  
			Ext.getCmp('contenterCenter').add(frmSoDtl); 
			Ext.getCmp('contenterCenter').setActiveTab(frmSo);  
			frmSo.getForm().loadRecord(record); 
			//Ext.getCmp('contenterCenter').setActiveTab(frmSoDtl);
			
			Ext.CngHeader = Ext.apply({
				order_type:record.data.order_type, 
				dc_product_type_id:record.data.dc_product_type_id,
				f_pj_amt:record.data.f_pj_amt,
				f_dtl_amt:record.data.f_dtl_amt,
			});
	 
			frmSoDtl.getForm().loadRecord(record);
			//setStyleElementByForm
			Ext.get(frmSo.items.items[4].id).setStyle('background', '#eee'); 	//document id item
			Ext.get(frmSo.items.items[4].id).setStyle('color', '#000'); 		//document id item 
			Ext.get(frmSo.items.items[4].id).setStyle('width', '300px'); 		//document id item 
		 
			Ext.getCmp("modeID").setValue('EDIT');
			 
			if(butt=='view'){
				Ext.getCmp("buSaveID").hide();  
				//Ext.getCmp("buGenCodeID").hide();  
				Ext.getCmp("buAddSubDtlID").hide();  
				Ext.getCmp("buGenCode2ID").hide(); 
				
			}else{
				Ext.getCmp("buSaveID").show();
				//Ext.getCmp("buGenCodeID").show();
				Ext.getCmp("buAddSubDtlID").show();  
				
				Ext.getCmp("buGenCode2ID").show(); 
			}
	 
			 
			Ext.f_vat = record.get('f_vat_amt');
			Ext.storeDtl.reload({ 
				params: { mode:'GETDATA',id:Ext.getCmp('hdrSoID').getValue(), accessData:butt},
				callback: function(records, operation, success) {  
				   if (success){ 
						//console.log(records); 
						
				   } 
				},
			}); 
			
			Ext.getCmp('tabSoDtlGrid').on('cellclick', cellClick2,this); 
		}

		var delSoHdr = function (record,butt){

			 var win = new Ext.Window({
					id : "win-msg-delete-master",
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
									url : 'api/mnTvAddOrder.php' , 
									params : { 
										mode : 'DELETE', 
										id : record.get('id'),
									}, 
									method: 'GET', //POST
									success: function ( result, request ) { 
										var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
										//console.log(jsonData);
										if (jsonData.success) {
											//Ext.MessageBox.alert('Success', jsonData.msg);			// alert massage success
										} else {
											Ext.MessageBox.alert('Failed', jsonData.msg);			// alert massage error
										}
															// hidden window-panel
										Ext.getCmp("win-msg-delete-master").destroy();						// clear memory :: garbage collection
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
							 
								Ext.getCmp("win-msg-delete-master").destroy();
								Ext.getCmp('tabpanel1').getStore().reload();
							}
						}
					]
				}).show();
		}
		function deRemove(id,statusBu){
			//1 noAction 2 cancel, 3 remove
			 
			var txt=(statusBu=='del')?'ลบข้อมูล':'ยกเลิกรายการใช้งาน'; 
			var win = new Ext.Window({
						id : "win-msg-delete-master-sub",
						title : ""+txt,
						modal: true,
						width : 250,
						height : 130,
						html: "ท่านต้องการที่จะ ["+txt+"] ข้อมูล ?",
						buttons : [
							{
								text : "Confirm",
								handler : function() {
									Ext.Ajax.request({
										url : 'api/mnTvAddBilling.php' , 
										params : { 
											mode : 'DELETE', 
											statusBu:statusBu,
											id : id,
										}, 
										method: 'GET',	//POST
										success: function ( result, request ) { 
											var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
											if (jsonData.success) {
												
												if(jsonData.data.invalid)Ext.MessageBox.alert('Warnning', jsonData.msg);
												else Ext.MessageBox.alert('Success', jsonData.msg);	// alert massage success
											
											} else {
												Ext.MessageBox.alert('Failed', jsonData.msg);	// alert massage error
											} 
											Ext.getCmp("win-msg-delete-master-sub").destroy();	// clear memory :: garbage collection
											Ext.store.reload();		// reload grid & store 
										 
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
									Ext.getCmp("win-msg-delete-master-sub").destroy(); 
								}
							}
						]
					}); 
					
				 
					if(statusBu==1)Ext.MessageBox.alert('Warnning', "ปิดการวางบิลรับเงินแล้ว ");
					else if(statusBu==2)Ext.MessageBox.alert('Warnning', "ใบวางบิลถูกผูกกับรายการปรับปรุงหนี้แล้ว "); 
					else if(statusBu=='cancel' || statusBu=='del' || statusBu=='enabled')win.show();
		}
	 
		function cellClick(grid, rowIndex, columnIndex, e) { 
			var record = grid.getStore().getAt(rowIndex);  
			if(columnIndex==grid.getColumnModel().getIndexById('edit')){  
				 if(!Ext.isEmpty(record.get('editID')))controllTab(record,'edit');
			}else if(columnIndex==grid.getColumnModel().getIndexById('view')){ 
				//disbled Bu Save
				controllTab(record,'view'); 
			}else if(columnIndex==grid.getColumnModel().getIndexById('cancelID')){ 
	 
				if(!Ext.isEmpty(record.get('cancelID')) && record.get('i_enable')==2)deRemove(record.get('id'),'enabled'); 
				
				if(!Ext.isEmpty(record.get('cancelID')) && record.get('i_enable')==1)deRemove(record.get('id'),'cancel'); 
				
			}else if(columnIndex==grid.getColumnModel().getIndexById('delID')){ 
			 
				if(!Ext.isEmpty(record.get('delCancelID')))deRemove(record.get('id'),'del');
				
			}else if(columnIndex==grid.getColumnModel().getIndexById('print_statusID')){ 
			 
				if(record.get('print_status'))printPreview(record);
								
			}  
		};
		
		Ext.storeDtl3 =new Ext.data.JsonStore({
				storeId: 'myStoreBlDtl3', 
				url : 'api/ListPrintBillingNoOrderDtl.php', 
				root: 'data', 
				idProperty: 'id',
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
					{ name:'printHTML' }, 
				]
			});	
			
		//############## PRINT
		function printPreview(record){
			var id='priviewPrint';
			
			var noneGroup = function(i){
				
				Ext.storeDtl3.setBaseParam("mode",'GETDATA');
				Ext.storeDtl3.setBaseParam("id",record.get('id'));//GETDATA 
				//set
				if(i=="2")Ext.storeDtl3.setBaseParam("typePrint","noneGroup");//GETDATA
				if(i=="1")Ext.storeDtl3.setBaseParam("typePrint","orderByProduct");//GETDATA
				if(i=="-1")Ext.storeDtl3.setBaseParam("typePrint","");//GETDATA
				//load 
				Ext.storeDtl3.load(); 
			};
			
			var gridDtl = {  
					xtype: 'grid', 
					border: false,
					stripeRows: true,
					loadMask: true,
					id:'pro-grid',
					//frame : true, 
					autoHeight: true,
					store:Ext.storeDtl3,  
					listeners:{
						afterrender:function(){
							this.fn = function(){
								Ext.storeDtl3.setBaseParam("mode",'GETDATA');
								Ext.storeDtl3.setBaseParam("typePrint","");
								Ext.storeDtl3.setBaseParam("id",record.get('id'));//GETDATA 
								Ext.storeDtl3.load();
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
			
			var frmPrintItems = [
					{
						xtype: 'compositefield', 
						msgTarget : 'side',
						anchor    : '-10',  
						id:'frm-format-gridDtl',
						//defaults: { flex: 1 }, 
						items: [{
							xtype: 'displayfield', 
							value: ' &nbsp; ',
							width: '35%',
					 
						},{						
							xtype: 'displayfield',
							style: 'font-weight:bold;',
							id:'frm-format-txt1',
							value: 'รูปแบบการแสดงรายการ ', 
						},{ 
						
							width:          140, 
							xtype:          'combo',
							mode:           'local',
							value 			: '-1', 
							triggerAction:  'all',
							forceSelection: true,
							editable:       false,  
							id:           	'printFormatID', 
							hiddenName:     'printFormat',
							displayField:   'c_name',
							valueField:     'id',
							store:new Ext.data.JsonStore({
								fields: [{name:'id'},{name:'c_name'}],
								data :[{ id : '-1'	, c_name : 'ไม่จัดกลุ่ม' }, 
											{ id : '1'	, c_name : 'จัดกลุ่มตามรายได้' },
											{ id : '2'	, c_name : 'แสดงรวมยอด' }, 
										   ],
								sortInfo:{ field: 'id', direction: 'DESC'}  , 	
							}),
							listeners: { 
								select: function(combo, record, index) {
									 noneGroup(record.get('id')); 
								},
							 
							},
						}]
				
					},{ 
						html: "<p>&nbsp;</p>",
						style: 'display: block;margin-top: 0.5em; margin-bottom: 0.5em; margin-left: auto; margin-right: auto; border-style: hidden;'
					},
					{
						xtype: 'compositefield', 
						msgTarget : 'side',
						anchor    : '-10', 
						defaults: { flex: 1 }, 
						items: [{ 
							xtype: 'hidden',
							name: 'mode',  
							value: 'ADD',  
							listeners:{
								afterrender:function(){
									if(parseInt(record.get('ar_pre_print_bill_hdr_id'))/1>0)this.setValue("EDIT");	
								}
							}
						},{
							xtype: 'hidden',
							name: 'ar_bill_invoice_hdr_id', //ar_bill_invoice_hdr_id
							value: record.get('ar_bill_invoice_hdr_id'),  
						},{
							xtype: 'hidden',
							name: 'id', //ar_bill_invoice_hdr_id
							value: record.get('ar_pre_print_bill_hdr_id'),  
						},{
	//-------------------MASTER HIDDEN ZONE ------------------------------------------------------------
	//-------------------MASTER HIDDEN ZONE ------------------------------------------------------------
	//-------------------MASTER HIDDEN ZONE ------------------------------------------------------------
	//-------------------MASTER HIDDEN ZONE ------------------------------------------------------------
							xtype: 'hidden',
							name: 'dc_area_id', //ar_pre_print_bill_hdr_id
							value: record.get('dc_area_id'),  
						},{ 
							xtype: 'hidden',
							name: 'c_area_code',
							value: record.get('c_area_code'), 						
						},{
							xtype: 'hidden',
							name: 'c_ref_code', 
							value: record.get('c_area_code'),  
						},{
							xtype: 'hidden',
							name: 'c_code',  
							value: 'BL',  
						},{
							xtype: 'hidden',
							name: 'c_so_code',  
							value: record.get('so_code'),  
						},{
							xtype: 'hidden',
							name: 'c_name', 	 
							value: record.get('c_billing_name'),  
						},{
							xtype: 'hidden',
							name: 'c_address',
							value: record.get('c_address_inv'), 
						},{ 
							xtype: 'hidden',
							name: 'd_doc_date',
							value: record.get('d_doc_date'), 
						},{ 
							xtype: 'hidden',
							name: 'd_so_date',
							value: record.get('d_so_date'), 
						},{ 
							xtype: 'hidden',
							name: 'd_billing_date',
							value: record.get('d_billing_date'), 
						},{ 
							xtype: 'hidden',
							name: 'c_yyyy_mm',
							value: record.get('c_yyyy_mm'), 
						},{ 
							xtype: 'hidden',
							name: 'ref_yyyy_mm',
							value: record.get('onair_yyyy_mm'), 
						},{ 
							xtype: 'hidden',
							name: 'c_contract_no',
							value: record.get('c_contract_no'),  
						},{ 
	//-------------------DISPLAY ZONE -----------------------------------------------------------------				
							xtype: 'displayfield',
							style: 'font-weight:bold;',
							value: ' บริษัท อสมท จำกัด (มหาชน)',
							id:'print-h1',
						},{
							 
							xtype: 'displayfield',
							style: 'font-weight:bold;',
							value: ' &nbsp; ',
						},{
							 
							xtype: 'displayfield', 
							value: ' &nbsp; ',
						},{
							 
							xtype: 'displayfield',
							style: 'font-weight:bold;',
							id:'print-h2',
							value: ' เลขที่   '+record.get('c_area_code')+' <br> วันที่  '+record.get('c_billing_date'),
						}]
					},
					{
						xtype: 'compositefield', 
						msgTarget : 'side',
						anchor    : '-10', 
						defaults: { flex: 1 }, 
						items: [ { 
							xtype: 'displayfield',
							style: 'font-weight:bold;', 
							id:'print-h3',
							value: 'ลูกค้า  '+record.get('c_billing_name')+'<br/>'+record.get('c_address_inv'),
						}]
				
					},
					{
						xtype: 'compositefield', 
						msgTarget : 'side',
						anchor    : '-10', 
						defaults: { flex: 1 }, 
						items: [ {
							 
							xtype: 'displayfield',
							style: 'font-weight:bold;',
							value: 'เลขที่สัญญา/ใบสั่งซื้อ ',
							id:'print-h4',
						}, {
							 
							xtype: 'displayfield',
							style: 'font-weight:bold;',	
							id:'print-h5',							
							value: ''+record.get('c_contract_no'),
						},{
							 
							xtype: 'displayfield', 
							style: 'font-weight:bold;',
							id:'print-h6',
							value: '  ลงวันที่   '+record.get('c_contract_date'),
						},{ 
							//width:250,
							xtype: 'displayfield', 
							style: 'font-weight:bold;',
							id:'print-h7',
							value: ' รายการเดือน  :  '+record.get('onair_yyyy_mm')/* +'<br> เลขที่ Order : '+record.get('so_code') */,
						}]
					},
					gridDtl
					
				];	

			var winFrm = new Ext.Window({
							id : "win-pop-lov"+id,
							title : " พิมพ์ใบวางบิล ",
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
				url:'api/mnPrintBLN.php', 
				labelWidth: 2,
				items:frmPrintItems,
				autoScroll: true,
				frame: true,
				buttonAlign: 'left',
				buttons:[{
						text : 'จัดพิมพ์ใบวางบิล',
						id:'buSaveSubID',
						iconCls:'printer_mono', 
						handler : function() { 
						
						var form = Ext.getCmp('form-widgets'+id).getForm();  
						 
						if (form.isValid()){ 
							form.submit({
								waitMsg:'Saving Data...',
								success : function(form, action) {    
									//if(action.result.msg !='Error')
									Ext.Msg.alert('Success', action.result.msg,function(){   
										  
										var printId = action.result.data.id;
										Ext.store.reload();
										Ext.storeDtl3.reload({
										params: { mode:'GETPRINT',id:printId},
										callback: function(records, operation, success) { 
											if (success){ 
												PrintHtml(id,records[0]);  
												 
											}
										},	
										});
										
										return true;
									});  
									//else Ext.Msg.alert('Failure', 'ในการ Print Gen Code');
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
		
		};
		//############## PRINT
		var cssPrint = function(){

			/* return ''
				+'\n body,input,table,tr,td{ padding:1px; font-weight:normal; font-family:AngsanaUPC; font-size:16pt; color:black; border:0px; }' 
				+'\n #frm-format-gridDtl,#frm-format-txt1{ visibility:hidden;}'
				//Compay
				+'\n #print-h1{ font-weight:bold;}'
				//ลูกค้า
				+'\n #print-h3{ float:left; margin-top:10px;}'
				+'\n #print-h2{ float:right; margin-top:10px;}'
				//สัญญา
				//+'\n #ext-gen150{ margin-top:50px; }'
				+'\n #print-h4, #print-h5, #print-h6{ margin-top:10px; float:left;}' 
				+'\n #print-h7{ float:right; margin-top:10px;}' 
				//รายการออกอากาศ
				+'\n #pro-grid{ margin-top:100px; }'
				+'\n input[type="text"] { height:30px; font-size: 36px;  }'
				; */ 
				
				return 'body { height: 842px;  width: 595px;  margin-left: auto; margin-right: auto; color:black; font-family:Browallia New; font-size:16pt;  }'
				+'\n @page { size: A4; margin: 15mm 10mm 30mm 10mm; /* change the margins */ }'
				+'\n table{ font-family:Browallia New; font-size:16pt; } '
				+'\nthead tr td{ text-align:center; font-weight:bold; }'
				+'\n .tb td{ text-align:left; font-weight:narmal; }'
				+'\n .tf td{ text-align:right; font-weight:bold; }'
				+'\n #print-1{ float:left;}'
				+'\n #print-2{ float:right; }'
				+'\n #print-3{   clear:both; float:left;}'
				+'\n #print-41{  clear:both; float:left;}'
				+'\n #print-42{  float:left; margin-left:35px;}'
				+'\n #print-43{  float:right;}'
			
		};

		function PrintHtml(id,rec){
 
			var dataHead = '\n<div class="heading">' 
							+'\n<div id="print-1">'+'บริษัท อสมท จำกัด (มหาชน) '+'</div>'
							+'\n<div id="print-2">'+Ext.getCmp('print-h2').getValue()+'</div>' 
							+'\n<div id="print-3">'+Ext.getCmp('print-h3').getValue()+'</div>' 
							+'\n<div id="print-41">'+Ext.getCmp('print-h4').getValue()+Ext.getCmp('print-h5').getValue()+'</div>' 
							+'\n<div id="print-42">'+Ext.getCmp('print-h6').getValue()+'</div>'
							+'\n<div id="print-43">'+Ext.getCmp('print-h7').getValue()+'</div>'
							+'\n</div> <!-- Book -->';
							
			Ext.getCmp("win-pop-lov"+id).destroy();  
			var dataDetail = rec.get('printHTML');
			var dataDiv = dataHead+dataDetail;
			
			var genHtml = '<div class="book">'  
							+'\n<div class="page">'
								+'\n<div class="subpage">'+dataDiv+'</div>'    
							+'\n</div><!-- Page -->' 
						  +'\n</div> <!-- Book -->';
						  
 
			var myWindow = window.open('', '', 'width=595,height=842');
			myWindow.document.write('<html><head>');
			myWindow.document.write('<title>' + 'Print Invoice' + '</title>'); 
			myWindow.document.write('<style type="text/css"/>'+cssPrint()+'</style>');
			myWindow.document.write('</head><body>');
			myWindow.document.write(genHtml); 
			myWindow.document.write('</body></html>');
			
			myWindow.print();  
		};	

		function setDisabledFrom(show){
			console.log('Edit Some Content :: line : 438');
			if(!Ext.isEmpty(show)){
				Ext.getCmp('order_type_idID').setDisabled(true);
				Ext.getCmp('i_group_type_frmID').setDisabled(true);
				Ext.getCmp('i_is_commitID').setDisabled(true);
				Ext.getCmp('dis_onairID').setDisabled(true);
				Ext.getCmp('comm_ext_type_idID').setDisabled(true);
				Ext.getCmp('Budc_cnt_idID').hide();
				Ext.getCmp('Bupj_hdr_idID').hide();
				Ext.getCmp('Budc_emp_idID').hide();
				Ext.getCmp('Bucnt_emp_idID').hide();
				Ext.getCmp("buAddSubDtlID").hide(); 
			}else{
				Ext.storeDtl.setBaseParam("mn",'editso');
			}
	 
		};

		var delSoHdr = function (record,butt){

			 var win = new Ext.Window({
					id : "win-msg-delete-master",
					title : "Remove",
					modal: true,
					width : 250,
					height : 130,
					html: "ท่านต้องการที่จะลบข้อมูล ?",
					loadMask: true,
					buttons : [
						{
							text : "Confirm",
							loadMask: true,
							handler : function() {
								
								Ext.Ajax.request({
									url : 'api/mnTvEditOrder.php' , 
									params : { 
										mode : 'DELETE', 
										id : record.get('id'),
									}, 
									method: 'GET', //POST
									success: function ( result, request ) { 
										var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
										//console.log(jsonData);
										if (jsonData.success) {
		//remove 
		Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-hdrID'), true) || {}; //null obj not errer
		Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-dtlID'), true) || {}; //null obj not errer

											//Ext.MessageBox.alert('Success', jsonData.msg);			// alert massage success
										} else {
											Ext.MessageBox.alert('Failed', jsonData.msg);			// alert massage error
										}
															// hidden window-panel
										Ext.getCmp("win-msg-delete-master").destroy();						// clear memory :: garbage collection
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
							 
								Ext.getCmp("win-msg-delete-master").destroy();
								Ext.getCmp('tabpanel1').getStore().reload();
							}
						}
					]
				}).show();
		}

		function cellClick2(grid, rowIndex, columnIndex, e) { 
			var record = grid.getStore().getAt(rowIndex);   
			if(columnIndex==grid.getColumnModel().getIndexById('soDtlID') && record.data.soDtlID !=''
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
										Ext.storeDtl.reload();
										Ext.f_vat =null;
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

		Ext.getStoreItems = function(store, value,itemName){  
			 for(i=0;i<store.data.items.length;i++){
			  var rec = store.data.items[i];
				 if(value==rec.data.id){ 
					 return rec.get(itemName); }
			 }// loop 
		}; //	 

		
		var gridDtl = {  
					xtype: 'grid',
					id:'tabSoDtlGrid',
					border: false,
					stripeRows: true,
					loadMask: true,
					frame : true,
					bodyStyle : "padding:2px",
					autoHeight: true,
					store:Ext.storeDtl, 
					viewConfig:{ forceFit: true,getCellCls: function(value) { console.log(value);} },
						columns:[
						 new Ext.grid.RowNumberer({
								width:35,
								header:" No ",
						renderer:function(value, metaData, record, row, col, store, gridView){
							return record.get('no');
							}
						}),
						{ header: "ID System", sortable: true, hidden:true, dataIndex: 'c_name' },
						{ id: 'soDtlID', align:'center', header: "ลบ", width:50, dataIndex: 'soDtlID' },
						{ id: 'soDtlEditID', align:'center', header: "แก้ไข", width:50, dataIndex: 'soDtlEditID' },
						{ id: 'c_name', header: "รายการออกอากาศ", width:210, dataIndex: 'c_name' },
						{ header: "ประเภท",  dataIndex: 'c_type', hidden:true},
						{ header: "จำนวนครั้ง", align:'right', width:70, dataIndex: 'f_quan'},
						{ header: "ราคา", align:'right', dataIndex: 'f_total_cost'}, 
						{ header: "<p>ส่วนลดการค้า</p>%",align:'right', sortable:true, dataIndex: 'f_disc_com'},
						{ header: "<p>ส่วนลดการค้า</p>จำนวนเงิน", align:'right',  dataIndex: 'f_disc_com_amt'},
						{ header: "จำนวนเงินหลังหักส่วนลดการค้า", align:'right', dataIndex: 'f_disc_cash_amt_bal', }, 
						{ header: "<p>ส่วนลดล่วงหน้า/ส่วนลดเงินสด</p>%",align:'right', dataIndex: 'f_disc_cash'},
						{ header: "<p>ส่วนลดล่วงหน้า/ส่วนลดเงินสด</p>จำนวนเงิน", align:'right', dataIndex: 'f_disc_cash_amt'},
						{ header: "จำนวนเงินสุทธิ", align:'right', dataIndex: 'f_net_cost'},
						{ header: "หมายเหตุ",  dataIndex: 'c_comment', hidden:true, 
							renderer:function(value, metaData, record, row, col, store, gridView){ 
								if(record.get('id')=='grandTotal'){
								 
									Ext.getCmp('f_wht_amt2ID').setValue(record.get('f_wht_amt'));
									Ext.getCmp('f_total_cost_amt2ID').setValue(record.get('f_total_cost'));
									Ext.getCmp('f_disc_cash_amt2ID').setValue(record.get('f_disc_com_amt')); 
									Ext.getCmp('f_net_cost_amt2ID').setValue(record.get('f_disc_cash_amt_bal'));
									
									console.log(' head '+Ext.f_vat+'  dtl'+record.get('f_vat_amt'));
									
									if(Ext.f_vat==null || Ext.f_vat==0.00)
										Ext.getCmp('f_vat_amt2ID').setValue(record.get('f_vat_amt')); 
									else Ext.getCmp('f_vat_amt2ID').setValue(Ext.f_vat); 
									
									Ext.getCmp('f_net_cost_add_vat_amt2ID').setValue(record.get('f_net_vat_amt')); 
	 
								}
								return value;
							}}, 
				
						], 
		};
		
		Ext.onReady(function(){
		Ext.QuickTips.init();

	 var gridMain = {
			region: 'center',
			title: 'แสดงข้อมูล',
			xtype: 'grid',
			id:'tabpanel1',
			border: false,
			stripeRows: true,
			loadMask: true,
			store:Ext.store, 
			tbar: [new searchGrid()],  
			columns:[
				new Ext.grid.RowNumberer({
						width:35,
						header:" No ",
				renderer:function(value, metaData, record, row, col, store, gridView){
					return record.get('no');
					}
				}), 
				{ header: "ID System", sortable: true, hidden:true, dataIndex: 'id' }, 
				{ header: "สถานะใบแจ้งหนี้", sortable: true, dataIndex: 'c_status' ,width:80, },
				{ header: "เลขที่ใบแจ้งหนี้", sortable: true, dataIndex: 'c_code' ,width:110,  id:'print_statusID' },
				{ header: "เลขที่พิมพ์ใบแจ้งหนี้", sortable: true, dataIndex: 'c_area_print' ,width:100, },
				
				{ header: "วันที่แจ้งหนี้", sortable: true, dataIndex: 'd_billing_date' ,width:80,	align: 'center' ,
					renderer:function(value, metaData, record, row, col, store, gridView){  
						 return value?DategetShortDateMonthName(value):null;
					} 
				}, 
				{ header: "หน่วยงาน", sortable: true, dataIndex: 'c_cost_name' ,width:80, },
				{ header: "ชื่อลูกค้า", sortable: true, dataIndex: 'c_cnt_name' ,width:200,  },
				{ header: "รายการ", sortable: true,dataIndex: 'c_name' , }, 
				{ header: "จำนวนเงิน", align:'right', dataIndex: 'f_total_cost_amt' ,width:80,	 },
				{ header: "จำนวนเงินรวมภาษี", dataIndex: 'f_net_cost_add_vat_amt' ,width:80,	align: 'right' , }
			], 
			viewConfig:{ forceFit: true },
			bbar: new Ext.PagingToolbar({
				pageSize: 20,
				store: Ext.store,
				displayInfo: true,
				displayMsg: 'Displaying topics {0} - {1} of {2}'
			})
		};

		/*   
	สถานะใบแจ้งหนี้ 
	เลขที่ใบแจ้งหนี้ 
	เลขที่พิมพ์ใบแจ้งหนี้ 
	วันที่แจ้งหนี้ 
	หน่วยงาน 
	ชื่อลูกค้า 
	เลขที่สัญญา 
	รายการ 
	จำนวนเงิน 
	จำนวนเงินรวมภาษี
	*/  			 
	 
		new Ext.Viewport({
			id:'portViewID',
			layout: 'border',
			items: [  new Ext.TabPanel({
				region: 'center',
				border: false,
				activeTab: 1, //default Tab
				id:'contenterCenter',
				defaults:{autoScroll:true },   
				items: [gridMain],
				//viewConfig:{ forceFit: true }, 
				listeners: {  
					
					tabchange: function(tabPanel, newTab, oldTab, eOpts)  { 
	 
						if(newTab.id=='frm-so-dtlID'){ validVat(); }
					},
					remove: function(win, component ) {   
							
					}, 
					 
					
				}//End
			}) ]
		});

		Ext.getCmp('tabpanel1').on('cellclick', cellClick, this);
		Ext.getCmp('contenterCenter').setActiveTab('tabpanel1'); 

		//InfoMainGrid('tabpanel1',true,true,true,true,true,true);
		
								 
								Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({	
									header: "แสดง",
									sortable: false,
									align:'center',
									id:'view',
									width:30,
									dataIndex:'id' ,
									renderer: function(value, metaData, record, row, col, store, gridView) { 
											return '<img src="../images/icons/calendar_star.png" style="cursor:pointer"/>';
										}
								}));  
		 
								if(i_edit){ 
									Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({	
											header: "แก้ไข",
											sortable: false,
											align:'center',
											id:'edit',
											width:30,
											dataIndex:'editID' ,
											renderer: function(value, metaData, record, row, col, store, gridView) {
												 
													return value;
												}
											})); 
								}  
								if(i_edit){ 
									Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({	
											header: "ยกเลิก/ใช้งาน",
											sortable: false,
											align:'center',
											id:'cancelID',
											width:45,
											dataIndex:'cancelID' ,
											renderer: function(value, metaData, record, row, col, store, gridView) { 
													return value;
												}
											})); 
								} 
								 if(i_delete){ 
									Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({	
											header: "ลบ ",
											sortable: false,
											align:'center',
											id:'delID',
											width:50,
											dataIndex:'delCancelID' ,
											renderer: function(value, metaData, record, row, col, store, gridView) { 
													return value;
												}
											})); 
								}    
	 /* if(i_edit){
	 
			Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({	
					header: "แก้ไข",
					sortable: false,
					align:'center',
					id:'edit',
					width:50,
					dataIndex:'editID' ,
					renderer: function(value, metaData, record, row, col, store, gridView) {
							return value;
						}
					})); 
		}	
		if(i_delete){
			Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({
				header: 'ลบ', 
				align: 'center',
				id: 'remove',
				sortable: false,
				width: 80,
				dataIndex: 'delCancelID' , 
				renderer: function(value, metaData, record, row, col, store, gridView) { 
					
					return value;
				}
			})); 
		}  */
	 
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
			
			//console.log(' คำนวน --- '+f_total_costTotal+'- ('+disc_com+'+'+disc_cash+')');

		};
		autoCal = function(){ 
			//Ext.select('#f_quanID').on('blur', function() { 		getEleFloat(); });
			Ext.select('#f_total_costID').on('blur', function() { 	getEleFloat(); }); //ยอดรวมก่อนหัก
			Ext.select('#f_disc_comID').on('blur', function() { 	getEleFloat(); });
			Ext.select('#f_disc_cashID').on('blur', function() { 	getEleFloat(); });
			//Ext.select('#f_net_costID').on('blur', function() { 	getEleFloat(); }); //ยอดรวมหลังหัก

		};

	});
