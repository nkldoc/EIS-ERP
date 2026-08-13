	
	//
	Ext.Cont = Ext.apply({
					dc_cnt_id:0, 
					bh_contract_id:0,
					i_cont:0,
				});
 
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
				}); 

	Ext.CngHeader = Ext.apply({ order_type:0, i_group_type:0 }); 
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
			fields: [ 'no','id', 'c_code','c_name'],
		});
		Ext.storePj = new Ext.data.JsonStore({ 
			autoLoad: true,
			storeId: 'myStorePj',
			url: 'api/All_ArCombo.php',
			baseParams: {type : 'storePj'},
			root: 'data',
			idProperty: 'id',
			totalProperty: 'totalCount',
			fields: [ 'no','id', 'c_code','c_name'],
		});
		Ext.storePackage = new Ext.data.JsonStore({ 
			autoLoad: true,
			storeId: 'myStorePackage',
			url: 'api/All_ArCombo.php',
			baseParams: {type : 'storePackage'},
			root: 'data',
			idProperty: 'id',
			totalProperty: 'totalCount',
			fields: [ 'no','id', 'c_code','c_name'],
		});
		
		Ext.storeEmpCommit = new Ext.data.JsonStore({ 
			autoLoad: true,
			storeId: 'myEmpCommit',
			url: 'api/All_ArCombo.php',
			baseParams: {type : 'storeEmpCommit'},
			root: 'data',
			idProperty: 'id',
			totalProperty: 'totalCount',
			fields: [ 'no','id', 'c_code','c_name'],
		});

		Ext.storeCost = new Ext.data.JsonStore({ 
			autoLoad: true,
			storeId: 'myStoreCostFormTv',
			url: 'api/All_ArCombo.php',
			baseParams: {type : 'storeCostFormTv'},
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
		
		Ext.store = new Ext.data.JsonStore({
			storeId: 'myStore',
			autoDestroy: true,
			autoLoad: true,
			url : 'api/ListTvAddOrder.php',
			root: 'data',
			baseParams: { i_read:user_right_read }, //Permission i_read
			idProperty: 'id',
			totalProperty: 'totalCount',
			//sortInfo:{ field: 'd_doc_date', direction: 'DESC'}  , 	 
			fields: [
				{ name: 'no' },
				{ name: 'id' },		
				{ name: 'delID' },				
				{ name: 'editID' },				
				{ name: 'ap_po_hdr_id' },
				{ name: 'f_pj_amt', type: 'float'  },
				{ name: 'f_dtl_amt', type: 'float'  },
				{ name: 'dc_comm_id', type: 'int'  }, 
				{ name: 'txtdc_emp_idID', type: 'string' }, 
				{ name: 'dc_emp_id', type: 'int'  }, 
				{ name: 'txtcnt_emp_idID', type: 'string' }, 
				{ name: 'cnt_emp_id', type: 'int'  }, 	 
				{ name: 'c_code', type: 'string' },
				{ name: 'c_name', type: 'string' }, 
				{ name: 'txtpj_hdr_idID', type: 'string' },  
				{ name: 'pj_hdr_id', type: 'int'  },
				{ name: 'txtar_package_idID', type: 'string' },
				{ name: 'ar_package_id', type: 'int'  },				
				{ name: 'is_status', type: 'string' }, 
				{ name: 'i_enable', type: 'int'  },	
				{ name: 'c_so_no', type: 'string' }, 
				{ name: 'c_po_no', type: 'string' }, 
				{ name: 'd_doc_date', type: 'string' }, 
				{ name: 'd_so_date', type: 'string' }, 
				{ name: 'onair_yyyy_mm', type: 'string' }, 
				{ name: 'onair_yyyy', type: 'string' }, 
				{ name: 'onair_mm', type: 'string' }, 
				{ name: 'dc_cost_id', type: 'int'  },	
				{ name: 'c_cost_name', type: 'string' }, 
				{ name: 'dc_cnt_id', type: 'int'  },	
				{ name: 'txtdc_cnt_idID', type: 'string' },  
				{ name: 'i_group_type', type: 'int'  },	
				{ name: 'i_is_sale_external', type: 'int'  },	
				{ name: 'i_cont', type: 'int'  },	  
				{ name: 'bh_contract_id', type: 'int'  }, 
				{ name: 'c_cnt_name', type: 'string' },  
				{ name: 'c_comment', type: 'string' }, 
				{ name: 'c_billing_inv_des', type: 'string' }, 	
				{ name: 'order_type', type: 'string' },
				{ name: 'i_is_imc', type: 'int'  },
				{ name: 'i_is_barter', type: 'int'  },
				{ name: 'i_is_commit', type: 'int'  },					
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
			url : 'api/ListTvAddOrderDtl.php',
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

		Ext.storeEmpCommit = new Ext.data.JsonStore({ 
			autoLoad: true,
			storeId: 'myStoreEmpCommit',
			url: 'api/All_ArCombo.php',
			baseParams: {type : 'storeEmpCommit'},
			root: 'data',
			idProperty: 'id',
			totalProperty: 'totalCount',
			fields: [ 'no','id', 'c_code','c_name'],
		});
		Ext.storeExtCommit = new Ext.data.JsonStore({ 
			autoLoad: true,
			storeId: 'myStoreEmpCommit',
			url: 'api/All_ArCombo.php',
			baseParams: {type : 'storeExtCommit'},
			root: 'data',
			idProperty: 'id',
			totalProperty: 'totalCount',
			fields: [ 'no','id', 'c_code','c_name', 'i_is_tv','i_is_sale_ext'],
		});


		Ext.storeCont = new Ext.data.JsonStore({ 
			//autoLoad: true,
			storeId: 'myStoreCont',
			url: 'api/All_ArCombo.php',
			baseParams: {type : 'storeCont',id:0},
			root: 'data',
			idProperty: 'id',
			totalProperty: 'totalCount',
			fields: [ 'no','id', 'c_code','c_name'],
			
		});		
 
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
					{ header: "หมายเหตุ",  dataIndex: 'c_comment', hidden:true}, 
 			
					], 
	};
 
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
			text		: 'ชื่อลูกค้าs',  
			id			: 'dc_cnt_idID',	//go to relation	
			iconCls		: 'page_magnify', 
			valueHidden : 'dc_cnt_id', 		//go to hidden
			store		: Ext.storeCnt,
			headerGrid	: columnMini,
			widthText	: 330,  
			fieldLabel	: 'ชื่อลูกค้า',  
			isCellClickGrid:true, 
			//afterrender: function(){ alert(this.getId()); }, 
			cellClickGrid:function(grid, rowIndex, columnIndex, e) { 
			
				var id = 'dc_cnt_idID';
				var nameID = id+'_Name';
				var record 		= grid.getStore().getAt(rowIndex);  
				var TextShow 	= record.data.c_code+' '+record.data.c_name;
				
				Ext.getCmp(id).setValue(record.data.id);
				Ext.getCmp(nameID).setValue(TextShow);  
				Ext.getCmp("win-pop-lov"+id).hide();  					
				Ext.getCmp("win-pop-lov"+id).destroy(); 
				Ext.storeCont.setBaseParam('id',record.data.id);
				
				//con
				if(Ext.Cont.dc_cnt_id!=record.data.id){
					Ext.Cont = Ext.apply({
						dc_cnt_id:record.data.id, 
						bh_contract_id:0,
						i_cont:0,  
					});
					Ext.getCmp('i_contID').setValue(false);
					Ext.getCmp('bh_contract_idID').setValue(0); 
					Ext.getCmp('bh_contract_idID_Name').setValue(null); 
				}else{ 
					Ext.Cont.dc_cnt_id=record.data.id;
				}
 
				
			},
	});
	
	Ext.PopPjtForm = new Ext.ux.Poplov({ 
			text		: 'โครงการพิเศษ',  
			id			: 'pj_hdr_idID',	//go to relation	 
			iconCls		: 'page_magnify', 
			valueHidden : 'pj_hdr_id', 	//go to hidden
			store		: Ext.storePj,
			headerGrid	: columnMini,
			widthText	: 320,  
			fieldLabel	: 'โครงการพิเศษ ',  
	});
	Ext.PopPackageForm = new Ext.ux.Poplov({ 
			text		: 'แพ็คเกจ',  
			id			: 'ar_package_idID',	//go to relation	 
			iconCls		: 'page_magnify', 
			valueHidden : 'ar_package_id', 	//go to hidden
			store		: Ext.storePackage,
			headerGrid	: columnMini,
			widthText	: 330,  
			fieldLabel	: 'แพ็คเกจ ',  
	});

	Ext.PopEmpCommit = new Ext.ux.Poplov({ 
			text		: 'ภายใน',  
			id			: 'dc_emp_idID',	//go to relation	
			iconCls		: 'page_magnify', 
			valueHidden : 'dc_emp_id', 		//go to hidden
			store		: Ext.storeEmpCommit,
			headerGrid	: columnMini,
			widthText	: 330,  
			fieldLabel	: 'ภายใน',  
	});
	Ext.PopExtCommit = new Ext.ux.Poplov({ 
			text		: 'ภายนอก',  
			id			: 'cnt_emp_idID',	//go to relation	
			iconCls		: 'page_magnify', 
			valueHidden : 'cnt_emp_id', 		//go to hidden
			store		: Ext.storeExtCommit,
			headerGrid	: columnMini,
			widthText	: 330,  
			fieldLabel	: 'ภายนอก',  
	});

	Ext.PopContForm	 = new Ext.ux.Poplov({ 
			text		: 'เลขที่สัญญา/e-GP',  
			id			: 'bh_contract_idID',	//go to relation fq[bh_contract_id]	
			iconCls		: 'page_magnify', 
			valueHidden : 'bh_contract_id', 		//go to hidden
			store		:  Ext.storeCont,
			headerGrid	:  columnMini,
			widthText	:  330,  
			fieldLabel	:  'เลขที่สัญญา/e-GP', 
			isCellClickGrid:true,			
			cellClickGrid:function(grid, rowIndex, columnIndex, e) { 
			
				var id = 'bh_contract_idID';
				var nameID = id+'_Name';
				var record 		= grid.getStore().getAt(rowIndex);  
				var TextShow 	= record.data.c_code+' '+record.data.c_name; 
				Ext.getCmp(id).setValue(record.data.id);
				Ext.getCmp(nameID).setValue(TextShow);  
				Ext.getCmp("win-pop-lov"+id).hide();  					
				Ext.getCmp("win-pop-lov"+id).destroy();   
				
				Ext.Cont.bh_contract_id=Ext.getCmp('bh_contract_idID').getValue();
 
				 
			},

	});

	var uiOrderType = { 
								fieldLabel: 'ประเภทใบสั่ง',
								id:'order_type_idID',
								xtype: 'radiogroup',
								columns: [80,100,100,100],
								items: [
									{ boxLabel: 'ทั่วไป', checked: true, name: 'order_type', inputValue:'-1'},
									{ boxLabel: 'แลกเปลี่ยน', 	name: 'order_type', inputValue: 'i_is_barter'},
									{ boxLabel: 'โครงการ IMC', 	name: 'order_type', inputValue:'i_is_imc' },  
								],
								listeners: {
									change : function(cb, rec, ind) { this.fn(rec.inputValue); },
									afterrender: function( obj, eOpts ){  
										this.fn = function(i){  
											if(i=='-1'){
												//commit
												Ext.getCmp('i_is_commitID').show();  
												/* Ext.getCmp('comm_ext_type_idID').show();
												Ext.getCmp('comm_dis_idID').show();	 */
												//commit
												Ext.getCmp('pj_dis_idID').hide();
											}else if(i=='i_is_barter'){ 
												
												Ext.getCmp('pj_dis_idID').hide();
												//commit
												Ext.getCmp('i_is_commitID').hide();
												Ext.getCmp('comm_ext_type_idID').hide();
												Ext.getCmp('comm_dis_idID').hide(); 
												//commit
											}else if(i=='i_is_imc'){ 
												//commit
												Ext.getCmp('i_is_commitID').show();  
												/* Ext.getCmp('comm_ext_type_idID').show();
												Ext.getCmp('comm_dis_idID').show();	 */
												//commit
												Ext.getCmp('pj_dis_idID').show();
												
											}  	
										}; //fn
										 this.fn(this.getValue().inputValue);  //load 
										 
									},  //afterrender
								},
							};		
		
	// Field hdr
	var itemsSoHdr = [{
			xtype:'hidden', name:'id', id:'hdrID'
		},{
			xtype:'hidden', name:'mode', id:'modeID', value:'ADD'
		},{
			xtype:'hidden', name:'removeDtl', id:'removeDtlID', value:'',
		},{ 
			xtype:'textfield', fieldLabel:'รหัส' ,name:'c_code',value:'0',readOnly:true,
		},
			Ext.PopPackageForm.mini
		,
			Ext.PopCntForm.mini
		,
			uiOrderType
		,
		{ 	xtype: 'compositefield', id:'pj_dis_idID', //PopPackageForm
										fieldLabel: 'โครงการพิเศษ',
										msgTarget : 'side',
										anchor    : '-20',
										defaults: { flex: 1 },
										items:[Ext.PopPjtForm.mini],
									 
		},
		{
				fieldLabel: 'ใบสั่งโฆษณา/เช่าเวลา', 
				xtype: 'radiogroup',
				id:'i_group_type_frmID',
				columns: [120,120],
				items: [
					{ boxLabel: 'โฆษณาโทรทัศน์', checked: true, name: 'i_group_type', inputValue:'1'},
					{ boxLabel: 'เช่าเวลาโทรทัศน์', 	name: 'i_group_type', inputValue: '2'},  
				],	
					listeners: {
									change : function(cb, rec, ind) { this.fn(rec.inputValue); },
									afterrender: function( obj, eOpts ){  
										this.fn = function(i){  
											Ext.storeDcProduct.setBaseParam("i_group_type",i);	  
											//Ext.isChgMaster =(Ext.getCmp('hdrID').value()>0 && this.getValue().originalValue!=this.getValue().checked)?true:false;
 											
										}; //fn
										 this.fn(this.getValue().inputValue);  //load 
										
									},  //afterrender
								},
//Ext.storeDcProduct.setBaseParam("i_group_type",Ext.getCmp('order_type').getValue().inputValue);				
		},{ 
			fieldLabel: 'เลขที่ใบสั่งโฆษณา (Order)', xtype:'textfield',name:'c_so_no'
		},{ 
			fieldLabel: 'เลขที่ใบสั่งซื้อจากลูกค้า',xtype:'textfield',name:'c_po_no'
		},{
			
			xtype: 'datefield',
			fieldLabel: 'วันที่ใบสั่งโฆษณา',
			name : 'd_so_date',
            value :Ext.getDate.getNowCarlen(),
			validator: function(val) { return Ext.isEmpty(val)?"กรุณาเลือก วันที่ใบสั่งโฆษณา":true; }, 
		}, 
		{
			xtype: 'datefield',
			fieldLabel: 'วันที่บันทึกรายการ',
			name : 'd_doc_date', 
			value :Ext.getDate.getNowCarlen(),
                        readOnly:true,
                       
		},
		{
						xtype: 'checkbox',
						fieldLabel: "คิดค่าคอมมิชชั่น",
						id: 'i_is_commitID',
						name: 'i_is_commit',
						boxLabel: '(กรณีเป็น Order แลกเปลี่ยนจะไม่คิดค่าคอมมิชชั่น)',
						inputValue: 1,
						listeners:{
							check:function(){
								this.fn(this.getValue()); 
							},
							afterrender:function(){
								this.fn = function(i){  
											if(i){ 
												Ext.getCmp('comm_ext_type_idID').show();  
												Ext.getCmp('comm_dis_idID').show();			
											}else{
												Ext.getCmp('comm_ext_type_idID').hide();
												Ext.getCmp('comm_dis_idID').hide();	
											}  
								};
								this.fn(this.getValue());  //load   
							},
						}
		},{
						fieldLabel: 'ประเภทผู้นำเข้า',
						id:'comm_ext_type_idID',
						xtype: 'radiogroup',
						columns: [120,130],
						items: [
							{ boxLabel: 'ผู้นำเข้าภายใน', checked: true, name: 'i_is_sale_external', inputValue:'0'},
							{ boxLabel: 'ผู้นำเข้าภายนอก', 	name: 'i_is_sale_external', inputValue: '1'},  
						],
						listeners: {
						change : function(cb, rec, ind) { this.fn(rec.inputValue); },
						afterrender: function( obj, eOpts ){  
								this.fn = function(i){  
									if(i=='0'){
										 Ext.getCmp('pop_dc_emp_idID').show();
										 Ext.getCmp('pop_cnt_emp_idID').hide();
 
									}else if(i=='1'){ 
										 Ext.getCmp('pop_dc_emp_idID').hide();
										 Ext.getCmp('pop_cnt_emp_idID').show();
									} 
							 
								}; //fn
								 this.fn(this.getValue().inputValue);  //load  
							},  //afterrender
						},
		} ,
		{ 	xtype: 'compositefield', 
			id:'comm_dis_idID',
			fieldLabel: 'ชื่อผู้นำเข้า',
			msgTarget : 'side',
			anchor    : '-20',
			defaults: { flex: 1 },
			items:[Ext.PopEmpCommit.mini,Ext.PopExtCommit.mini], 						 
		},{
			xtype: 'displayfield',
			fieldLabel: "หน่วยงานที่รับ Order",
			id:'dc_user_cost_idID', 
			name:'c_cost_name',
			value:Ext.globalUserCostName,
		},{
			xtype: 'checkbox', 
			id: 'i_is_chg_costID',
			name: 'i_is_chg_cost',
			boxLabel: 'แก้ไขหน่วยงานที่รับ Order (กรณีไม่ใช่หน่วยงานที่แสดง)',
			inputValue: 1,
			listeners:{
				check:function(){
					this.fn(this.getValue()); 
				},
				afterrender:function(){
					this.fn = function(i){  
								if(i){ 
									Ext.getCmp('dc_user_cost_idID').hide();  
									Ext.getCmp('chg_cost_dis_idID').show();  
								}else{ 
									Ext.getCmp('dc_user_cost_idID').show();
									Ext.getCmp('chg_cost_dis_idID').hide();  
								} 
					};
					this.fn(this.getValue());  //load   
				},
			}
		},{ 	xtype: 'compositefield', id:'chg_cost_dis_idID',
										fieldLabel: 'แก้ไขหน่วยงานที่รับ Order',
										msgTarget : 'side',
										anchor    : '-20',
										defaults: { flex: 1 },
										items:[Ext.PopCostForm.mini],
									 
		} 
		,{ 
			xtype:'textarea', width:500,fieldLabel:'รายละเอียดใบกำกับภาษี', name:'c_billing_inv_des',
			value:'ให้ระบุประเภทการออกใบกำกับภาษี เช่น ออกยอดรวมทุกรายการ หรือ ออกรายละเอียดแต่ละรายการ',
		} ,{ 
			xtype:'textarea', width:500,fieldLabel:'หมายเหตุ', name:'c_comment',
		},{
			xtype: 'checkbox',  
			name: 'i_cont',
			id: 'i_contID',
			boxLabel: 'ระบุเลขที่สัญญา/e-GP',
			inputValue: 1,
			listeners:{
				check:function(){
					this.fn(this.getValue()); 
				},
				afterrender:function(){
					this.fn = function(i){  
								if(i){  
									Ext.getCmp('i_cont_dis_idID').show();  
								}else{  
									Ext.getCmp('i_cont_dis_idID').hide();  
								} 
								Ext.Cont.i_cont=i;
								console.log(Ext.Cont);
					};
					this.fn(this.getValue());  //load   
				},
			}
		},{ 	xtype: 'compositefield', 
				id:'i_cont_dis_idID',
				fieldLabel: 'เลขที่สัญญา/e-GP',
				msgTarget : 'side',
				anchor    : '-20',
				defaults: { flex: 1 },
				items:[Ext.PopContForm.mini],
		},{
							xtype : 'compositefield',
							id:'dis_onairID',
							anchor: '-20',
							msgTarget: 'side',
							fieldLabel: 'เดือน/ปี ที่ออกอากาศ',   
							items : [{ 
									width:          120, 
									xtype:          'combo',
									mode:           'local',
									value: Ext.getDate.month,
									emptyText:'กรุณาเลือก',
									triggerAction:  'all',
									forceSelection: true,
									editable:       false,
									fieldLabel:     'เดือน',
									//id:           'onair_mmID',
									name:           'onair_mm',
									hiddenName:     'onair_mm',
									displayField:   'c_name',
									valueField:     'id',
									store:Ext.monthStore,
								},
								{
									xtype: 'displayfield',
									value: 'ปี',
								},{ 
									width:          120, 
									xtype:          'combo',
									mode:           'local',
									value : Ext.getDate.year,
									emptyText:'กรุณาเลือก',
									triggerAction:  'all',
									forceSelection: true,
									editable:       false, 
									fieldLabel:     'ปี',
									//id:           'onair_yyyyID', 
									name:           'onair_yyyy',
									hiddenName:     'onair_yyyy',
									displayField:   'c_name',
									valueField:     'id',
									store:new Ext.data.JsonStore({
												fields: [{name:'id'},{name:'c_name'}],
												data : Ext.genYearList(1,10,false),
												sortInfo:{ field: 'id', direction: 'DESC'}  , 	
											}),
								},
							] 
		}]; //itemsSoHdr

	/* class Extens */
	formSoHdr	 = function() {
		formSoHdr.superclass.constructor.call(this, {  
				listeners:{
					afterrender: function( obj, eOpts ){ console.log('Load Finish'); },
				},
				id:'frm-so-hdrID',
				url:'api/mnTvAddOrder.php',
				frame : true,
				bodyStyle : "padding:5px", 
				autoScroll: true,
				width   : 700,  
				labelWidth: 150,
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
					var i_group_type 	= Ext.getCmp('i_group_type_frmID').getValue().inputValue;

					if(Ext.CngHeader.i_group_type!=i_group_type || Ext.CngHeader.order_type!=order_type){ 
						Ext.getCmp('removeDtlID').setValue('CHGHEADER');
					}else{
						Ext.getCmp('removeDtlID').setValue('');
					}

					if((Ext.getCmp('i_is_chg_costID').getValue()==true) && Ext.isEmpty(Ext.getCmp('dc_cost_idID_Name').getValue())){
                             
                                                Ext.Msg.alert('Failure', 'กรุณาเลือกหน่วยงาน',function(){
                                                        Ext.get('i_is_chg_costID').dom.focus();
                                                        
                                                });
					 	
					}else if(Ext.getCmp('order_type_idID').getValue().inputValue=='i_is_imc' && Ext.getCmp('pj_hdr_idID_Name').getValue()==''){
						var isChk = false;   
						Ext.Msg.alert('Failure', 'กรุณาเลือกชื่อโครงการ',function(){
							Ext.get('order_type_idID').dom.focus();
							 
						});
						
					}else if(Ext.getCmp('i_contID').getValue() && Ext.getCmp('bh_contract_idID_Name').getValue()==''){
					    var isChk = false;   
						Ext.Msg.alert('Failure', 'กรุณาเลือกสัญญา',function(){
							 
							 
						});		
					}else if(Ext.getCmp('i_is_commitID').getValue() 
					&& Ext.getCmp('comm_ext_type_idID').getValue().inputValue==1 
					&& Ext.getCmp('cnt_emp_idID_Name').getValue()==''){
						
		     
							Ext.Msg.alert('Failure', 'กรุณาเลือกผู้นำเข้าภายนอก',function(){
								 
								return false;
							});	
					}else if(Ext.getCmp('i_is_commitID').getValue() 
					&& Ext.getCmp('comm_ext_type_idID').getValue().inputValue==0 
					&& Ext.getCmp('dc_emp_idID_Name').getValue()==''){ 
						Ext.Msg.alert('Failure', 'กรุณาเลือกผู้นำเข้า',function(){ 
							return false;
						});	 
					}else if (form.isValid()){ 
						form.submit({
							waitMsg:'Saving Data...',
							success : function(form, action) {    
								Ext.Msg.alert('Success', action.result.msg,function(){ 
			  /* console.log(action.result); */
								Ext.CngHeader = Ext.apply({
									order_type:action.result.data.order_type, 
									i_group_type:action.result.data.i_group_type,
									f_pj_amt:action.result.data.f_pj_amt,
									f_dtl_amt:action.result.data.f_dtl_amt,
								}); 
			
								//Ext.storeDcProduct.setBaseParam("i_group_type",Ext.CngHeader.i_group_type);
								
								Ext.getCmp('tabpanel1').getStore().load();
								Ext.getCmp('modeID').setValue('EDIT'); 
								var frmSoDtl = new formSoDtl();
								Ext.getCmp('contenterCenter').add(frmSoDtl);
								Ext.getCmp('contenterCenter').setActiveTab(frmSoDtl);
								if(!Ext.isEmpty(action.result.data)){
									Ext.getCmp('hdrID').setValue(action.result.data.id);	
									Ext.getCmp('frm-onair_displayID').setValue(action.result.data.onair_yyyy_mm);
								};
									Ext.storeDtl.reload({ 
									params: { mode:'GETDATA',id:Ext.getCmp('hdrID').getValue(),accessData:'edit'},
									callback: function(records, operation, success) {  
										   if (success){ } 
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
			},{
					text : ' ออกเลข Order ',
					id:'buGenCodeID',
					iconCls:'icon-genCode', 
					//disabled:true,
					handler : function() {
						
						var form = Ext.getCmp('frm-so-hdrID').getForm();
						Ext.getCmp('modeID').setValue('GENCODE');
						form.submit({
							waitMsg:'Saving Data...',
							success : function(form, action) {   
							 
								if(action.result.data.msg==''){
									console.log(action.result.data);
									Ext.Msg.alert('Success',  action.result.data.c_code,function(){  
										Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-hdrID'), true) || {}; //null obj not errer
										Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-dtlID'), true) || {}; //null obj not errer 
										Ext.getCmp('tabpanel1').getStore().load();   
									});
								}else{
									Ext.Msg.alert('Failure',  action.result.data.msg,function(){
										/* Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-hdrID'), true) || {}; //null obj not errer
										Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-dtlID'), true) || {}; //null obj not errer  */
										Ext.getCmp('tabpanel1').getStore().load();  
									});
								}
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
			}, {
				text : Ext.GLOBAL_BU_BACK_TH,
				handler: function() {
					Ext.getCmp('contenterCenter').setActiveTab('tabpanel1'); 
 
				}
			}]

		});
	};
	Ext.extend(formSoHdr, Ext.FormPanel, {}); 
	// 
 
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
			url:'api/mnSoDtl.php', 
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
									Ext.getCmp("buGenCodeID").show();
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
				frame : true,
				bodyStyle : "padding:0px", 
				autoScroll: true,
				loadMask: true,
				width   : 700,  
				labelWidth: 120,
				defaults:{ flex:1, },   
				title:'รายการออกอากาศ/กิจกรรม Event', 
				items:[{
									xtype: 'displayfield', 
									fieldLabel:'เดือน/ปี ที่ออกอากาศ', 
									id:'frm-onair_displayID',
									name:'onair_yyyy_mm',
									 
						},{ xtype:'button',
						text:'ระบุรายการออกอากาศ/กิจกรรม Event', 
						id:'buAddSubDtlID',
						handler: function() {
								selectProduct();
								Ext.getCmp('onair_displayID').setValue(Ext.getCmp('frm-onair_displayID').getValue());
								Ext.getCmp('dtllHdrID').setValue(Ext.getCmp('hdrID').getValue());
								autoCal();
							}
						} , gridDtl],
 
				buttonAlign: 'left',
				buttons:[{
							text : Ext.GLOBAL_BU_BACK_TH,
							handler: function() {
								Ext.getCmp('contenterCenter').setActiveTab('tabpanel1');  
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
							  data:[['c_code', "เลขที่ Order"],['c_so_no', "เลขที่ใบสั่งโฆษณา"],['cnt_name', "ชื่อลูกค้า"]],
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
        width   : 700,  
		labelWidth: 180,
        defaults: {
            anchor: '0'
        }, 
 
 		items : [{
						xtype: 'compositefield',
						fieldLabel: 'คำที่ค้นหา',
						msgTarget : 'side',
						anchor    : '-20',
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
						fieldLabel: 'ระหว่างวันที่',
						msgTarget : 'side',
						anchor    : '-20',
						defaults: { flex: 1 },
						items: [
							{
								xtype: 'datefield',
								name : 'startDate',
								id : 'startDateID',
								value:defaultDate(1)
							}, 
							{
								xtype: 'datefield',
								name : 'endDate',
								id : 'endDateID',
								value:defaultDate(2)
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
							fieldLabel: 'สถานะของ Order', 
							items : [
								{ 
									width:          90, 
									xtype:          'combo',
									mode:           'local',
									value:          '-1',
									triggerAction:  'all',
									forceSelection: true,
									editable:       false,
									fieldLabel:     'สถานะ',
									id:'i_is_statusID',
									name:           'i_is_status',
									hiddenName:     'i_is_status',
									displayField:   'name',
									valueField:     'value',
									store:          new Ext.data.JsonStore({
										fields : ['name', 'value'],
										data   : [
											{name : 'เลือกทั้งหมด',   	value: '-1'},
											{name : 'แก้ไข',  		value: '0'},
											{name : 'ปกติ',  			value: '2'},
											{name : 'ไม่สมบูรณ์', 		value: '3'}
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
									width:          120, 
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
						} ,{
							fieldLabel:'ประเภท Order',
							xtype:'radiogroup',
							id:'i_typeOrderID',
							columns: [110,110,120], 
							items: [
								{ boxLabel:'ทั้งหมด', checked: true, name:'i_typeOrder', id:'order_allID', inputValue:'-1' },
								{ boxLabel:'แลกเปลี่ยน', name:'i_typeOrder', id:'i_is_barterID',  inputValue:'i_is_barter' },
								{ boxLabel:'โครงการ IMC', name:'i_typeOrder', id:'i_is_imcID', inputValue:'i_is_imc' },
								
							],
							listeners:{
										change: function(cb, rec, ind) {   	
											  this.fnValue(rec);  
										},
										afterrender: function( obj, eOpts ){ 
											this.fnValue =  function(rec){ 
												console.log(rec); 
											};
										},
									}
						},{
							fieldLabel:'ประเภท ใบสั่งโฆษณา/เช่าเวลา',
							xtype:'radiogroup', 
							id:'i_group_typeID',
							columns: [120,120,120],
							items: [//โฆษณา   เช่าเวลา   ทั้งหมด
								{ boxLabel:'ทั้งหมด', checked: true, name:'i_group_type', inputValue:'-1' },
								{ boxLabel:'โฆษณา', name:'i_group_type', inputValue:'1' },
								{ boxLabel:'เช่าเวลา ', name:'i_group_type', inputValue:'2' },
								
							],
							 
						}]
					}		
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
					Ext.getCmp("buGenCodeID").hide();
					
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
								Ext.store.setBaseParam("orderType", Ext.getCmp("i_typeOrderID").getValue().inputValue);  	
								Ext.store.setBaseParam("i_group_type", Ext.getCmp("i_group_typeID").getValue().inputValue); 
								Ext.store.setBaseParam("i_is_status",Ext.getCmp("i_is_statusID").getValue());  
					}else{
								Ext.store.setBaseParam("i_is_status", '-1');   
								Ext.store.setBaseParam("month", '-1');   
								Ext.store.setBaseParam("year", '-1');   		 
								Ext.store.setBaseParam("orderType", '-1');  	
								Ext.store.setBaseParam("i_group_type", '-1');  	
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
 
		Ext.CngHeader = Ext.apply({
			order_type:record.data.order_type, 
			i_group_type:record.data.i_group_type,
			f_pj_amt:record.data.f_pj_amt,
			f_dtl_amt:record.data.f_dtl_amt,
		});
				
		frmSoDtl.getForm().loadRecord(record);
		//setStyleElementByForm
		Ext.get(frmSo.items.items[2].id).setStyle('background', '#eee'); 	//document id item
		Ext.get(frmSo.items.items[2].id).setStyle('color', '#000'); 		//document id item 
		Ext.getCmp("modeID").setValue('EDIT'); 
		if(butt=='view'){
			Ext.getCmp("buSaveID").hide();  
			Ext.getCmp("buGenCodeID").hide();  
			Ext.getCmp("buAddSubDtlID").hide();  
			
		}else{
			Ext.getCmp("buSaveID").show();
			Ext.getCmp("buGenCodeID").show();
			Ext.getCmp("buAddSubDtlID").show();  
		}
	 
		//Load Dtl
		Ext.storeDtl.reload({ 
			params: { mode:'GETDATA',id:Ext.getCmp('hdrID').getValue(), accessData:butt},
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
	function cellClick(grid, rowIndex, columnIndex, e) { 
	
		var record = grid.getStore().getAt(rowIndex);  
 
		if(columnIndex==grid.getColumnModel().getIndexById('edit')){ 
			if(record.data.delID!='')controllTab(record,'edit');
		}else if(columnIndex==grid.getColumnModel().getIndexById('view')){ 
			controllTab(record,'view'); 		
		}else if(columnIndex==grid.getColumnModel().getIndexById('remove')){ 
			if(record.data.delID!='')delSoHdr(record,'remove');
		}	
 
	};
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
								url : 'api/mnSoDtl.php' , 
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
				Ext.getCmp('dtllHdrID').setValue(Ext.getCmp('hdrID').getValue()); 
				Ext.getCmp('dtlDtlID').setValue(record.data.id);
			autoCal();
		}
	}	
 	function defaultDate(typeStartDate) {
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
 }

	Ext.getStoreItems = function(store, value,itemName){  
		 for(i=0;i<store.data.items.length;i++){
		  var rec = store.data.items[i];
			 if(value==rec.data.id){ 
				 return rec.get(itemName); }
		 }// loop 
	}; //	 

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
			{ header: "เลขที่ Order", sortable: true, dataIndex: 'c_code' ,width:80, },
			{ header: "วันที่บันทึกรายการ", sortable: true, dataIndex: 'd_doc_date' ,width:80,	align: 'center' ,
				renderer:function(value, metaData, record, row, col, store, gridView){  
					 return value?DategetShortDateMonthName(value):null;
				} 
			}, 
			{ header: "เลขที่ใบสั่งโฆษณา", sortable: true, dataIndex: 'c_so_no' ,width:80, },
			{ header: "เดือน ปี ออกอากาศ", sortable: true, align:'center',dataIndex: 'onair_yyyy_mm' ,width:75,  },		
			{ header: "หน่วยงานที่รับ Order", sortable: true, dataIndex: 'c_cost_name' ,width:150,   },
			{ header: "ชื่อลูกค้า", sortable: true, dataIndex: 'c_cnt_name' ,width:200,  },
			{ header: "สถานะของ Order", sortable: true, dataIndex: 'is_status' },
			{ header: "วันที่ใบสั่งโฆษณา", sortable: true, dataIndex: 'd_so_date' ,width:80,	align: 'center' ,
				renderer:function(value, metaData, record, row, col, store, gridView){  
					 return value?DategetShortDateMonthName(value):null;
				} 
			}
		], 
		viewConfig:{ forceFit: true },
		bbar: new Ext.PagingToolbar({
			pageSize: 20,
			store: Ext.store,
			displayInfo: true,
			displayMsg: 'Displaying topics {0} - {1} of {2}'
		})
	};

	  			 
 
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
					/* if(newTab.id=='tabpanelAssurance'){ getAssurance(); } */
					if(newTab.id=='tabpanelAssurance'){ getAssurance(); }
				},
 				remove: function(win, component ) {   
						
				}, 
				 
				
			}//End
		}) ]
	});

	Ext.getCmp('tabpanel1').on('cellclick', cellClick, this);
	Ext.getCmp('contenterCenter').setActiveTab('tabpanel1'); 

	InfoMainGrid('tabpanel1',true,true,true,true,true,true);
	if(i_edit){
 
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
			dataIndex: 'delID' , 
			renderer: function(value, metaData, record, row, col, store, gridView) { 
				
				return value;
			}
		})); 
	}
	
	//### f_quanID f_total_costID f_disc_comID f_disc_cashID f_net_costID
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

	Ext.getCmp('buAdd').setDisabled(false); 
});
