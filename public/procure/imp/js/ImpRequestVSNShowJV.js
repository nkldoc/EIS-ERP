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
 

	Ext.store = new Ext.data.JsonStore({
		storeId: 'myStore',
		autoDestroy: true,
		autoLoad: true,
		url : 'api/ListImpRequestVSNShowJV.php',
		root: 'data',
		baseParams: { i_read:user_right_read,type:'HDR' }, //Permission i_read
		idProperty: 'id',
		totalProperty: 'totalCount',
		fields: [
					{ name:'no' },
					{ name:'id' },  
					{ name:'delID'}, 
					{ name:'editID'},  
					{ name:'c_code'}, 
					{ name:'c_doc'}, 
					{ name:'gl_tran_hdr_id'}, 
					{ name:'c_jv_code'},  
					{ name:'i_is_post_jv'},  					
					{ name:'d_doc_date'}, 
					{ name:'dc_cost_acc_id'}, 
					{ name:'c_comment'},
					{ name:'i_enable'},   
					{ name:'gl_process_creditor_log_id'},  
					{ name:'dc_user_create_id'},
					{ name:'dc_user_create_cost_id'},
					{ name:'d_create'},
					{ name:'dc_user_update_id'},
					{ name:'dc_user_update_cost_id'},
					{ name:'d_update'}, 
					{ name:'f_money'}, 
					{ name:'c_enabled'}, 
					
		]
	});


	Ext.storeDtl = new Ext.data.JsonStore({
		storeId: 'myStoreDtl', 
		url : 'api/ListImpRequestVSNShowJV.php',
		root: 'data', 
		idProperty: 'id',
		totalProperty: 'totalCount',
		baseParams: { type:'DTL' }, //Permission i_read 
		fields: [
			{ name: 'no' },
			{ name: 'id' },	
			{ name: 'strDate' },	 
			{ name: 'c_request' },	
			{ name: 'c_request_desc' },	
			{ name: 'product_name' },	
			{ name: 'c_creditor' },	 
			{ name: 'rcptamt' },
			{ name: 'c_code_imp' },	 
			{ name: 'c_doc' },		
						
		]
	});	
   
	
	Ext.InfoMainGridChkCode = function(tabpanel1,hid1,hid2,hid3,hid4,hid5,hid6,idCode)
	{
	//info
	 Ext.getCmp(tabpanel1).addColumn(new Ext.grid.Column({header: "ผู้ที่สร้าง",		hidden:hid1,	sortable: true,	dataIndex:'dc_user_create_id'}));
	 Ext.getCmp(tabpanel1).addColumn(new Ext.grid.Column({header: "วันที่สร้าง",		hidden:hid2,  	sortable: true,	dataIndex:'d_create' , renderer:shortThaiDate }));
	 Ext.getCmp(tabpanel1).addColumn(new Ext.grid.Column({header: "หน่วยงานผู้สร้าง",	hidden:hid3,	sortable: true,	dataIndex:'dc_user_create_cost_id' }));
	 Ext.getCmp(tabpanel1).addColumn(new Ext.grid.Column({header: "ผู้แก้ไข", 		hidden:hid4,  	sortable: true, dataIndex:'dc_user_create_id' }));
	 Ext.getCmp(tabpanel1).addColumn(new Ext.grid.Column({header: "วันที่แก้ไข", 	hidden:hid5,  	sortable: true, dataIndex:'d_update' ,renderer:shortThaiDate, }));
	 Ext.getCmp(tabpanel1).addColumn(new Ext.grid.Column({header: "หน่วยงานผู้แก้ไข",	hidden:hid6,	sortable: true, dataIndex:'dc_user_update_cost_id' }));
	//view
	//  Ext.getCmp(tabpanel1).addColumn(new Ext.grid.Column({
	// 	header: 'สถานะ', 
	// 	align: 'center',
	// 	id: 'view',
	// 	sortable: false,
	// 	width: 50,
	// 	dataIndex: 'id' ,
	// 	renderer: function(value, metaData, record, row, col, store, gridView) {
	// 		var i_enable = record.get('i_enable');
	// 		return i_enable==1?'<img src="../images/icons/yes.gif"/>':'<img src="../images/icons/no.gif"/>';
	// 	}
	// }));


	 Ext.getCmp(tabpanel1).addColumn(new Ext.grid.Column({
		header: 'แสดง', 
		align: 'center',
		id: 'view',
		sortable: false,
		width: 50,
		dataIndex: 'id' ,
		renderer: function(value, metaData, record, row, col, store, gridView) {
			return'<img src="../images/icons/magnifier2.png"); style="cursor:pointer"/>';
		}
	}));
 

	if(user_right_edit){

		Ext.getCmp(tabpanel1).addColumn(new Ext.grid.Column({	
			header: "แก้ไข",
			sortable: false,
			align:'center',
			id:'edit',
			width:50,
			dataIndex:'id' ,
			renderer: function(value, metaData, record, row, col, store, gridView) {
			 
				 return record.get("editID"); ; 
				} 
			})); 
	};

	//if(user_right_delete){
			//edit
			Ext.getCmp(tabpanel1).addColumn(new Ext.grid.Column({
				header: 'ยกเลิก (เอกสาร&GX)', 
				align: 'center',
				id: 'remove',
				sortable: false,
				width: 150,
				dataIndex: 'id' ,
				renderer: function(value, metaData, record, row, col, store, gridView) {  
						return record.get("delID"); 
				}
			}));
	//	};	

	}; //End Function

	getEleFloat = function(){

		// var f_unit_cost 		= parseFloat(Ext.getCmp('f_unit_costID').getValue().replace(/,/g,'')/1); 
		// var f_quan 				= parseFloat(Ext.getCmp('f_quanID').getValue().replace(/,/g,'')/1); 
		// var f_total_costTotal 	= f_unit_cost*f_quan; 
		
		// Ext.getCmp('f_total_costID').setValue(f_total_costTotal.toFixed(2));
 
	};
	autoCal = function(){ 
	//	Ext.select('#f_quanID').on('blur', function() { 		getEleFloat(); });
	//	Ext.select('#f_unit_costID').on('blur', function() { 	getEleFloat(); }); //ยอดรวมก่อนหัก 
	};	

	function windowProduct(record,butt){
			Ext.eventGrid.click2=butt;
			
				new Ext.Window({
								title: "นำเข้าไฟล์",
								id: "win-pop-excel",
								layout: "fit",
								modal: true,
								width: (Ext.getBody().getViewSize().width * 0.6),
								listeners: {
									afterrender: function( component ) {
										
										new Ext.ux.form.FileUploadField({
											id: "dtl_import",
											name: "dtl_import",
											emptyText: "เลือกไฟล์ excel...	",
											buttonText: "",
							            	width: 300,
							            	buttonCfg: { iconCls: "import_excel" },
							            	renderTo: "Ext_dtl_import"
										});
									}
								},
								items: [{
									xtype: "form",
									id: "form-excel",
									url: "api/mn_ImpRequestVSNJV4.php",
									border: false,
									fileUpload: true,
									bodyStyle: { padding: "10px 20px" },
									html:"	<table border=\"0\" cellspacing=\"2\" cellpadding=\"0\" width=\"100%\" style=\"padding: 4px; 0px;\">" +
												"<input type=\"hidden\" name=\"mode\" value=\"IMPORT_EXCEL\">" +
												"<input type=\"hidden\" name=\"id\" value=\""+Ext.getCmp("hdrID").getValue()+"\">" +
												"<colgroup width=\"50%\"></colgroup>" +
												"<colgroup width=\"20%\"></colgroup>" +
												"<colgroup width=\"30%\"></colgroup>" +
												"<tr>" +
													"<td align=\"right\">เลือก file(*.csv (Comma delimited)) : </td>" +
													"<td><div id=\"Ext_dtl_import\"></div></td>" +
													"" +
												"</tr>" +
											 
											"</table>"
								}],
								buttonAlign: "left",
								buttons : [{
									text: Ext.GLOBAL_BU_SAVE_TH,
									iconCls: "icon-save",
									handler: function() {
										
										var form		= Ext.getCmp("form-excel").getForm();
										var filename	= Ext.getCmp("dtl_import").getValue();
										var parts		= filename.split(".");
										var msg			= "";

										if (filename == "") { msg = "กรุณาเลือกไฟล์ที่ต้องการ"; }
										else if(parts[parts.length - 1] != "csv") { msg = "กรุณาเลือก excel เป็นไฟล์ .csv"; }
										
										if(msg == "") {
											
											Ext.getCmp("win-pop-excel").getEl().mask("Please wait...", "x-mask-loading");
											form.submit({
												success : function(result, request) {
													Ext.getCmp("win-pop-excel").getEl().unmask();		
													var obj = request.result;
													if(!obj.reval) {
														
														Ext.Msg.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย",function(){
																
															return true;
														});
														Ext.getCmp("win-pop-excel").destroy();
														Ext.storeDtl.reload(); 
													} else {
														Ext.Msg.alert("แจ้งเตือน", obj.msg);
													}
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
										} else { Ext.Msg.alert( "แจ้งเตือน", msg ); }
									}
								}, {
									text: Ext.GLOBAL_BU_BACK_TH,
									handler: function() { Ext.getCmp("win-pop-excel").destroy(); }
								}]
							}).show();		
 
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
					   if (success){ 
					   
					   } 
					},
				}); 
									
			
		}else if(butt=='add'){  
			
			Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-dtlID'), true) || {}; //null obj not errer
			Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-hdrID'), true) || {}; //null obj not errer
 
			var frmSoHdr = new formSoHdr();  
								Ext.getCmp('contenterCenter').add(frmSoHdr); 
								Ext.getCmp('contenterCenter').setActiveTab(frmSoHdr);   
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
			Ext.getCmp("ImpStepID").setValue("EDIT");
			//-----------------
			Ext.getCmp('modeID').setValue('EDIT'); 
			if(butt=='view'){ 
				DisbledButton(true,{}); 
				Ext.storeDtl.setBaseParam("accessData", "view");
			}else{  
				DisbledButton(false,{});
				if(record.get('c_jv_code')!='0'){
					DisbledButton(true,{}); 
				}
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
			html: "ท่านต้องการที่ยกเลิกเอกสารและGXใช่หรือไม่ ?",
			buttons : [
				{
					text : "Confirm",
					handler : function() {
						Ext.Ajax.request({
							url : 'api/mn_ImpRequestVSNJV4.php' , 
							params : { 
								mode : 'DELETE', 
								id : record.get('id'),
								gl_tran_hdr_id: record.get('gl_tran_hdr_id'),
								i_is_post_jv: record.get('i_is_post_jv'),
								i_enable: record.get('i_enable')																
							}, 
							method: 'GET', //POST
							success: function ( result, request ) { 
								var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
								if (jsonData.success){
									
									if(jsonData.data.enabledDelete){
										Ext.MessageBox.alert('Success', jsonData.msg);
										Ext.getCmp("win-msg-delete").destroy();	
										Ext.getCmp('tabpanel1').getStore().reload();
									}else{
										Ext.MessageBox.alert((jsonData.data.status=='delete'?'Success':'Failed'), jsonData.msg);
										Ext.getCmp("win-msg-delete").destroy();	
										Ext.getCmp('tabpanel1').getStore().reload();
									}
										
								} else {
									Ext.MessageBox.alert('Failed', jsonData.msg);			// alert massage error
								
								Ext.getCmp("win-msg-delete").hide();						// hidden window-panel
								Ext.getCmp("win-msg-delete").destroy();						// clear memory :: garbage collection
								Ext.getCmp('tabpanel1').getStore().reload();				// reload grid & store
								}
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

	function cellClick(grid, rowIndex, columnIndex, e) { 
		var record = grid.getStore().getAt(rowIndex); 
		if (columnIndex == grid.getColumnModel().getIndexById("print")) { 

			if(record.get('gl_tran_hdr_id')>0) Preview(record.get('gl_tran_hdr_id')); 
			else '';

		}else if (columnIndex==grid.getColumnModel().getIndexById('edit')) { 
				if(record.get('editID')!='')controllTab(record,'edit'); 
		} else if (columnIndex==grid.getColumnModel().getIndexById('view')) {
			controllTab(record,'view'); 	
		} else if (columnIndex==grid.getColumnModel().getIndexById('remove')) {
			if(record.get('delID')!='')controllTab(record,'remove');  
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
				//windowProduct(record,'edit'); 
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
			xtype:'hidden', name:'removeDtl', id:'removeDtlID', value:'',
		 } ,
		 {
		   xtype: "textfield",
		   fieldLabel: "รหัสเอกสาร",
		   id: "c_code",
		   name: "c_code",
		   width: 150,
		   disabled: true
		 }
		,{
			xtype: 'datefield',
			fieldLabel: 'วันที่ตั้งหนี้',
			name : 'd_doc_date', 
			id : 'frm-d_doc_date',
			value :Ext.getDate.getNowCarlen(),
                       
		},{ 
			xtype:'textarea', width:500,fieldLabel:'หมายเหตุ', name:'c_comment',
		}]; //itemsSoHdr

	/* class Extens */
	formSoHdr	 = function() { 
		formSoHdr.superclass.constructor.call(this, {  
				listeners:{
					afterrender: function( obj, eOpts ){ /* console.log('Load Finish'); */ },
				},
				id:'frm-so-hdrID',
				url:'api/mn_ImpRequestVSNJV4.php',
				frame : true,
				bodyStyle : "padding:5px", 
				autoScroll: true,
				width   : 700,  
				labelWidth: 150,
				defaults:{ flex:1, },  
				//closable:true,
				loadMask: true,
				title:'บันทึกบัญชีตั้งหนี้',
				items:itemsSoHdr, 
				buttonAlign: 'left',
				buttons:[{
					text : 'บันทึกรายการ',
					id:'buSaveID',
					iconCls:'icon-save', 
					handler : function() { 
					var form = Ext.getCmp('frm-so-hdrID').getForm();   
					
					
				  if (form.isValid()){
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
					{ header: "ID System", sortable: true, hidden:true, dataIndex: 'id' }, 
					{ header: "วันที่ตั้งหนี้",  align:'center',width:70,  dataIndex: 'strDate'},
					{ header: "เลขที่นำเข้าใบเบิก",  align:'center',width:70,  dataIndex: 'c_code_imp'},
					{ header: "เอกสารอ้างอิง",  align:'center',width:70,  dataIndex: 'c_doc'},
					{ header: "เลขที่ใบเบิก",  align:'center',width:70,  dataIndex: 'c_request_desc'},
					{ header: "เลขที่ตั้งหนี้",  align:'center',width:70,  dataIndex: 'c_request'},
					{ header: "รายการ", align:'center', width:150, dataIndex: 'product_name',
						renderer: function(value, metaData, record, rowIndex, colIndex, store) {
							metaData.attr = "style='text-align: left;'";
							return value;
						} 		
					},
					{ header: "ชื่อผู้รับเงิน", align:'center', width:150, dataIndex: 'c_creditor',
						renderer: function(value, metaData, record, rowIndex, colIndex, store) {
							metaData.attr = "style='text-align: left;'";
							return value;
						} 		
					},
					{ header: "จำนวนเงิน", align:'right', width:70, dataIndex: 'rcptamt'}
				 
 			
					], 
	};
	
		formSoDtl.superclass.constructor.call(this, {  
				listeners:{
					afterrender: function( obj, eOpts ){ /* console.log('Load Finish');  */},
				},
				id:'frm-so-dtlID', 
				url:'api/mn_ImpRequestVSNJV4.php', 
				frame : true,
				bodyStyle : "padding:0px", 
				autoScroll: true,
				loadMask: true,
				width   : 600,  
				labelWidth: 180,
				bodyStyle : "padding:5px",
				defaults:{ flex:1, },   
				title:'รายละเอียดบันทึกบัญชีตั้งหนี้',  
				items:[ 
				{ xtype:'hidden', name:'mode',value:'GENCODE'},
				{ xtype:'hidden', id:'ImpStepID', name:'ImpStep',value:'ADD'},
				{ xtype:'hidden', name:'id',value:Ext.getCmp('hdrID').getValue()},
				{ xtype:'hidden', name:'d_doc_date',value:Ext.util.Format.date(Ext.getCmp('frm-d_doc_date').getValue(), "Y-m-d")},
				{
					xtype:'button',
					text:'นำเข้าไฟล์ CSV',
					id:'buAddProID',
					handler:function(){ 
										//windowProduct({},'add'); 
										},
				},
				gridDtl						
					],  
					buttonAlign: 'left',
					buttons:[{
								text : 'บันทึกบัญชี',
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
							  data:[['c_code', "รหัสเอกสาร"],['c_jv_code', "รหัสอ้างอิง (GX/GL)"]],
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
						fieldLabel: 'วันที่ตั้งหนี้',
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
					},{
					id: "i_enableID",
            		xtype: "combo",
		            anchor    : '-320',
					fieldLabel: 'สถานะ',
					mode: "local",
		            store: new Ext.data.SimpleStore({
		            	fields: [ "value", "text" ],
						data: [
						       [ "0", "- เลือกทั้งหมด -" ],
						       [ "1", "ใช้งาน" ],
						       [ "2", "ไม่ใช้งาน" ]
						]
					}),
					value: "1",
					valueField: "value",
					displayField: "text",
					allowBlank: false,
					editable: false,
					triggerAction: "all",
					typeAhead : false
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
					Ext.store.setBaseParam("i_enable", Ext.getCmp("i_enableID").getValue());
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
			title: 'แสดงข้อมูลบันทึกบัญชีตั้งหนี้',
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
					{ header: "รหัสเอกสาร", sortable: true, dataIndex: 'c_code' ,
						renderer: function(value, metaData, record, rowIndex, colIndex, store) {
							metaData.attr = "align='center'";
						return value;
					}} ,{

						header: "วันที่ตั้งหนี้",  
						sortable:false,
						align: 'center', 
						dataIndex: 'd_doc_date',
						renderer:function(value, metaData, record, row, col, store, gridView){  
							 return value?DategetShortDateMonthName(value):null;
						}
					},
					{ header: "รหัสอ้างอิง (GX/GL)",id:'print',width:150, sortable: true, dataIndex: 'c_jv_code' ,
						renderer: function(value, metaData, record, rowIndex, colIndex, store) {
							metaData.attr = "align='center'"; 

							if (record.get('gl_tran_hdr_id')>0) 
								val = "<div style=\"cursor:pointer\"><img src=\"../images/icons/printer_mono.png\" style=\"margin-right:1px;\"); />"+value+'<div>';
							else
								val = '';
						return val;
					}},
					{ header: "จำนวนเงิน", sortable: true, dataIndex: 'f_money' ,
						renderer: function(value, metaData, record, row, col, store, gridView) {
							metaData.attr = "style='text-align: right;'";
							return floatRenderer(floatMinus(value, 2));
						}
					}
					,{ header: "สถานะ", sortable: true,align:'center', dataIndex: 'c_enabled' } 			
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
		Ext.InfoMainGridChkCode('tabpanel1',true,true,true,true,true,true,'c_jv_code'); 
		Ext.getCmp('buAdd').setDisabled(true);  
 
 

	});
