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
			url : 'api/ListSoMaster.php',
			root: 'data',
			baseParams: { i_read:user_right_read }, //Permission i_read
			idProperty: 'id',
			totalProperty: 'totalCount',
			fields: [
						{ name: 'no' },
						{ name: 'id' },  
						{ name:'c_code'},
						{ name:'c_name'}, 
						{ name:'dc_cost_id'},
						{ name:'txtdc_cost_idID'},
						{ name:'c_cost_name'},
						{ name:'dc_debtor_id'},
						{ name:'txtdc_debtor_idID'},
						{ name:'c_debtor_name'},
						{ name:'c_yyyy_mm'},
						{ name:'c_po_no'},
						{ name:'d_doc_date'},	
						{ name:'f_total_cost'},
						 
//ADDED
 
					
						{ name:'c_tax_value'},
						{ name:'c_address'},
						{ name:'c_telephone'},
						{ name:'c_mobile'}, 
						{ name:'c_email'},
						{ name:'c_remark'},
						{ name:'c_comment'},
						{ name:'c_status'}, 
						{ name:'i_enable'}, 
						{ name:'dc_user_create_id'},
						{ name:'dc_user_create_cost_id'},
						{ name:'d_create'},
						{ name:'dc_user_update_id'},
						{ name:'dc_user_update_cost_id'},
						{ name:'d_update'}, 
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
 
				{ name:'i_seq', type: 'int'  },	 
				{ name:'f_quan' },
				{ name:'f_unit_cost' },
				{ name:'f_total_cost' },
				{ name: 'c_comment', type: 'string' },
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
					
					record.set("c_code",Ext.getCmp('so_codeID').getValue()); // 
					
					Ext.getCmp('frm-so-hdrID').getForm().loadRecord(record || {});
	 
				},
		});
 
	/* Function  
	*
	*
	*/

	getEleFloat = function(){

		var f_unit_cost 	= parseFloat(Ext.getCmp('f_unit_costID').getValue().replace(/,/g,'')/1); 
		var f_quan 	= parseFloat(Ext.getCmp('f_quanID').getValue().replace(/,/g,'')/1); 
		var f_total_costTotal = f_unit_cost*f_quan; 
		
		Ext.getCmp('f_total_costID').setValue(f_total_costTotal.toFixed(2));
 
	};
	autoCal = function(){ 
		Ext.select('#f_quanID').on('blur', function() { 		getEleFloat(); });
		Ext.select('#f_unit_costID').on('blur', function() { 	getEleFloat(); }); //ยอดรวมก่อนหัก 
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
 
						{ xtype:'hidden',id:'dtllHdrID',name:'hdrID', },
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
										Ext.getCmp('tabpanel1').getStore().reload();
										//Ext.getCmp("buGenCodeID").show();
										
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
		autoCal(); 
		//console.log(Ext.eventGrid);
	}
	function controllTab(record,butt){ 
		
		Ext.eventGrid.click=butt;
		
		if(butt=='addEdit'){
			
			Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-dtlID'), true) || {}; //null obj not errer 
			Ext.getCmp('tabpanel1').getStore().load();
			Ext.getCmp('modeID').setValue('EDIT'); 
			var frmSoDtl = new formSoDtl();
			Ext.getCmp('contenterCenter').add(frmSoDtl);
			Ext.getCmp('contenterCenter').setActiveTab(frmSoDtl);
			 
			Ext.storeDtl.reload({ 
				params: { mode:'GETDATA',id:Ext.getCmp('hdrID').getValue(),accessData:'edit'},
				callback: function(records, operation, success) {  
					   if (success){ } 
					},
				}); 
									
			
		}else if(butt=='add'){  
			
			Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-dtlID'), true) || {}; //null obj not errer
			Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-hdrID'), true) || {}; //null obj not errer
 
			var frmSoHdr = new formSoHdr();  
								Ext.getCmp('contenterCenter').add(frmSoHdr); 
								Ext.getCmp('contenterCenter').setActiveTab(frmSoHdr);  
			
			//Default Cost Ext.session
			var id = 'dc_cost_idID';
			var nameID = id+'_Name';
			var TextShow 	= 	Ext.session.cost_code+' '+Ext.session.cost_name; 
								Ext.getCmp(id).setValue(Ext.session.dc_cost_id);
								Ext.getCmp(nameID).setValue(TextShow); 	 
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
			var frmSoDtl = new formSoDtl();  
								Ext.getCmp('contenterCenter').add(frmSoDtl); 
								Ext.getCmp('contenterCenter').setActiveTab(frmSoDtl);  
								Ext.getCmp('contenterCenter').setActiveTab(frmSoHdr);  
			frmSoDtl.getForm().loadRecord(record); 
			//-----------------
			Ext.getCmp('modeID').setValue('EDIT'); 
			if(butt=='view'){ 
				DisbledButton(true,{}); 
				Ext.storeDtl.setBaseParam("accessData", "view");
			}else{  
				DisbledButton(false,{}); 
				Ext.storeDtl.setBaseParam("accessData", "edit");
			}
			
			//-----------------
			Ext.storeDtl.reload({ 
				params: { mode:'GETDATA',id:Ext.getCmp('hdrID').getValue()},
				callback: function(records, operation, success) {  
					   if (success){ } 
					},
				}); 

			Ext.getCmp('tabSoDtlGrid').on('cellclick', cellClick2,this);		
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
							url : 'api/mnAddOrders.php' , 
							params : { 
								mode : 'DELETE', 
								id : record.get('id'),
							}, 
							method: 'GET', //POST
							success: function ( result, request ) { 
								var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
								if (jsonData.success) { 
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
				
		}		
			
		//console.log(Ext.eventGrid);
	}; //End
	function cellClick(grid, rowIndex, columnIndex, e) { 
		var record = grid.getStore().getAt(rowIndex); 
		if (columnIndex==grid.getColumnModel().getIndexById('edit')) {
			if(record.get('c_code')=='0')controllTab(record,'edit'); 
		} else if (columnIndex==grid.getColumnModel().getIndexById('view')) {
			controllTab(record,'view'); 	
		} else if (columnIndex==grid.getColumnModel().getIndexById('remove')) {
			if(record.get('c_code')=='0')controllTab(record,'remove'); 
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
			if(Ext.eventGrid.click!='view'){
				windowProduct(record,'edit'); 
					Ext.getCmp('modeProID').setValue('EDIT'); 
					Ext.getCmp('dtllHdrID').setValue(Ext.getCmp('hdrID').getValue()); 
					Ext.getCmp('dtlDtlID').setValue(record.data.id);
				autoCal();
			}
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
				Ext.getCmp('buSave1ID').hide();
				Ext.getCmp('buAddProID').hide();
			}else{
				Ext.getCmp('buSaveID').show();
				Ext.getCmp('buSave1ID').show();
				Ext.getCmp('buAddProID').show();
				
			}
		}

	}

	// Field hdr
	
	var itemsSoHdr = [{
			xtype:'hidden', name:'id', id:'hdrID'
		},{
			xtype:'hidden', name:'mode', id:'modeID', value:'ADD' //
		},{
			xtype:'hidden', name:'mode', id:'modeID', value:'ADD' //
		},{
			xtype:'hidden', name:'removeDtl', id:'removeDtlID', value:'',
		},{ 
			xtype:'textfield', fieldLabel:'รหัส' ,id:'so_codeID' ,name:'c_code', value:'0',readOnly:true,
		} 
		,
			Ext.PopCntForm.mini 
				
			, { xtype:'displayfield', fieldLabel:'เลขประจำตัวผู้เสียภาษีอากร' ,name:'c_tax_value',  }	
			, { xtype:'displayfield', fieldLabel:'ที่อยู่' ,name:'c_address',  }	
			, { xtype:'displayfield', fieldLabel:'โทรศัพท์' ,name:'c_telephone', }	
			, { xtype:'displayfield', fieldLabel:'โทรศัพท์เคลื่อนที่' ,name:'c_mobile',  } 
			, { xtype:'displayfield', fieldLabel:'อีเมล์' ,name:'c_email',  }	
		 ,{ 
			fieldLabel: 'เลขที่ใบสั่งขาย',xtype:'textfield',name:'c_po_no'
		}/* ,{
			
			xtype: 'datefield',
			fieldLabel: 'วันที่ใบสั่งขาย',
			name : 'd_so_date',
            value :Ext.getDate.getNowCarlen(),
			validator: function(val) { return Ext.isEmpty(val)?"กรุณาเลือก วันที่ใบสั่งขาย":true; }, 
		}  */,
		{
			xtype: 'datefield',
			fieldLabel: 'วันที่ใบสั่งขาย',
			name : 'd_doc_date', 
			value :Ext.getDate.getNowCarlen(),
                       // readOnly:true,
                       
		},

		  Ext.PopCostForm.mini 
		 ,{ 
			xtype:'textarea', width:500,fieldLabel:'หมายเหตุ', name:'c_comment',
		}]; //itemsSoHdr

	/* class Extens */
	formSoHdr	 = function() { 
		formSoHdr.superclass.constructor.call(this, {  
				listeners:{
					afterrender: function( obj, eOpts ){ /* console.log('Load Finish'); */ },
				},
				id:'frm-so-hdrID',
				url:'api/mnAddOrders.php',
				frame : true,
				bodyStyle : "padding:5px", 
				autoScroll: true,
				width   : 700,  
				labelWidth: 150,
				defaults:{ flex:1, },  
				//closable:true,
				loadMask: true,
				title:'บันทึกใบใบสั่งขาย',
				items:itemsSoHdr, 
				buttonAlign: 'left',
				buttons:[{
					text : 'บันทึกรายการ',
					id:'buSaveID',
					iconCls:'icon-save', 
					handler : function() { 
					var form = Ext.getCmp('frm-so-hdrID').getForm();   
					
					if(Ext.getCmp('dc_debtor_idID_Name').getValue()==''){ 
						Ext.Msg.alert('Failure', 'กรุณาเลือกชื่อลูกหนี้',function(){
							Ext.get('dc_debtor_idID_Name').dom.focus(); 
						}); 
					}else if(Ext.getCmp('dc_cost_idID_Name').getValue()==''){
						Ext.Msg.alert('Failure', 'กรุณาเลือกหน่วยงาน',function(){
							Ext.get('dc_cost_idID_Name').dom.focus(); 
						}); 
					}else if (form.isValid()){ 
						form.submit({
							waitMsg:'Saving Data...',
							success : function(form, action) {    
								Ext.Msg.alert('Success', action.result.msg,function(){ 
								 
								Ext.getCmp('hdrID').setValue(action.result.data.id);
								controllTab(action.result.data,'addEdit');
								
 
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
 				text : Ext.GLOBAL_BU_BACK_TH,
				handler: function() {
					Ext.getCmp('contenterCenter').setActiveTab('tabpanel1'); 
 
				}
			}]

		});
	};
	Ext.extend(formSoHdr, Ext.FormPanel, {});
 
	formSoDtl	 = function() {
 
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
				viewConfig:{ forceFit: true,getCellCls: function(value) { /* console.log(value); */} },
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
					{ id: 'c_name', header: "รายการสินค้า/บริการ", width:210, dataIndex: 'c_name' },
					{ header: "ประเภท",  dataIndex: 'c_type', hidden:true},
					{ header: "จำนวน/ครั้ง", align:'right', width:70, dataIndex: 'f_quan'},
					{ header: "ราคา/หน่วย", align:'right', width:70, dataIndex: 'f_unit_cost'},					
					{ header: "จำนวนเงินสุทธิ", align:'right', dataIndex: 'f_total_cost'},
					{ header: "หมายเหตุ",  dataIndex: 'c_comment'}, 
 			
					], 
	};
	
		formSoDtl.superclass.constructor.call(this, {  
				listeners:{
					afterrender: function( obj, eOpts ){ /* console.log('Load Finish');  */},
				},
				id:'frm-so-dtlID', 
				url:'api/mnAddOrders.php', 
				frame : true,
				bodyStyle : "padding:0px", 
				autoScroll: true,
				loadMask: true,
				width   : 700,  
				labelWidth: 180,
				bodyStyle : "padding:5px",
				defaults:{ flex:1, },   
				title:'รายละเอียดใบสั่งขาย',  
				items:[ 
				{ xtype:'hidden', name:'mode',value:'GENCODE'},
				{ xtype:'hidden', name:'id',value:Ext.getCmp('hdrID').getValue()},
				{
					xtype:'button',
					text:'เพิ่มรายการ สินค้า/บริการ',
					id:'buAddProID',
					handler:function(){ windowProduct({},'add'); },
				},
				gridDtl						
					],  
					buttonAlign: 'left',
					buttons:[{
								text : ' ออกเลข Order',
								id:'buSave1ID',
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
									if(form.isValid()){  
										form.submit({
											waitMsg:'Saving Data...',
											success : function(form, action) { 
												Ext.Msg.alert('Success',  action.result.msg,function(){  
													Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-hdrID'), true) || {};
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
						},{
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
							  data:[['debtor_name', "ชื่อลูกค้า"],['c_code', "รหัสใบสั่งขาย"]],
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
			/* console.log('Loading...'); */
		},
		listeners:{
			afterrender: function( obj, eOpts ){ /* console.log('Load Finish');  */},
		},
		fn:function(){ },
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
						fieldLabel: 'วันที่แจ้ง Order',
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

	/* OnLoad
	*
	*
	*/
	Ext.onReady(function(){
	Ext.QuickTips.init();
	
	var gridMain = {
			region: 'center',
			title: 'แสดงข้อมูลรายการใบสั่งขาย',
			xtype: 'grid',
			id:'tabpanel1',
			border: false,
			stripeRows: true,
			loadMask: true,
			store: Ext.store,
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
			{ header: "รหัส", sortable: true, dataIndex: 'c_code' ,
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					metaData.attr = "align='center'";
				return value;
			}},
			{ id: 'c_debtor_name', header: "ลูกค้า", width:210, sortable: true, dataIndex: 'c_debtor_name' }, 
			{ header: "หน่วยงาน", sortable: true, dataIndex: 'c_cost_name' ,width:120, },
			{
				header: "วันที่ใบใบสั่งขาย",  
				sortable:false,
				align: 'center', 
				dataIndex: 'd_doc_date',
				renderer:function(value, metaData, record, row, col, store, gridView){  
					 return value?DategetShortDateMonthName(value):null;
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
				dataIndex: 'f_total_cost'
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
		//InfoMainGrid('tabpanel1',true,true,true,true,true,true);
		InfoMainGridChkCode('tabpanel1',true,true,true,true,true,true,'c_code');
		//TODO then coding terminate Obj buAdd
		Ext.getCmp('buAdd').setDisabled(false); 
		//End TODO 
 
		});
