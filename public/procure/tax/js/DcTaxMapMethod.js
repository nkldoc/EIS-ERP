//OnLoad	
Ext.onReady(function() {
	
Ext.QuickTips.init(); 
Ext.GlobalAccName = '';
Ext.GlobalAccId   = 0;
Ext.titleTypeMapp = '<span style="font-weight:bold;">ประเภทค่าใช้จ่าย</span> <br/>';

	function saveGrid(stores){
		var jsonData = "";
		for(i=0;i<stores.getCount();i++) { 
			record = stores.getAt(i);
			if(record.data.i_chk){
			 jsonData += Ext.util.JSON.encode(record.data)+",";
			} 
		}
		if(jsonData.length > 1){
			jsonData = jsonData.substring(0,jsonData.length-1);
			return "["+jsonData+"]";
		} else{
			return '';
		}
		 
	};

	setChecked = function(v,row,col,ss){ 
		Ext.storePermissionRight.data.items[row].data[ss] = v; 
	} 
	
	i_showFunc = function(value, metaData, record, row, col, store, gridView){  
		Ext.storePermissionRight = store;
//		console.log(value);
		var value = (value==0)?'':value;
		metaData.attr = "style='text-align:center';";
	 	return '<label><div><input onclick="setChecked(this.checked,'+row+','+col+',\'i_chk\')" type="checkbox" '+((value)?'checked':'')+'>';
	}
	var storeAccMap = new Ext.data.JsonStore({
            storeId: 'myStoreAccMap',
            autoLoad: false,
	    url : 'api/ListTaxMethodUI.php',
	    root: 'data', 
	    idProperty: 'id',
	    baseParams : { mode: "listAccMapping" },
            totalProperty: 'totalCount',
            fields: [
                        { name: 'no' },
                        { name: 'id' },
                        { name: 'c_code',  },
                        { name: 'c_name',   },
                    ]
	});
	var store = new Ext.data.JsonStore({
            storeId: 'myStore',
            autoDestroy: true,
            autoLoad: true,
            url : 'api/ListTaxMapMethod.php',
            root: 'data',
            baseParams: { i_read:user_right_read }, //Permission i_read
            idProperty: 'id',
                totalProperty: 'totalCount',
                fields: [
                        { name: 'no' },
                        { name: 'id' },
                        { name: 'c_code',  },		
                        { name: 'c_name',  }, 
                        { name: 'i_detail'},
                        { name: 'c_detail'},
                        { name: 'dc_user_create_id' },
                        { name: 'dc_user_create_cost_id' },
                        { name: 'd_create' },
                        { name: 'dc_user_update_id' },
                        { name: 'dc_user_update_cost_id' },
                        { name: 'd_update' },
                        ]
	});
 	
	Ext.storeAcc = new Ext.data.JsonStore({
            storeId: 'myStoreMethod',
//	    autoDestroy: true,
            autoLoad: true,
	    url : 'api/ListTaxMethodUI.php',
	    root: 'data', 
	    idProperty: 'id',
	    baseParams : { mode: "listGrid" },
            totalProperty: 'totalCount',
            fields: [
                        { name: 'no' },
                        { name: 'id' },
                        { name: 'c_code',  },
                        { name: 'c_name',   },
                        { name: 'i_chk',  }, 
                    ]
	});

	var storeGropHdr = new Ext.data.JsonStore({
		storeId: 'myStoreGropHdr', 
//	    autoDestroy: true,
		autoLoad: true,
	    url : 'api/ListTaxMethodUI.php',
	    root: 'data', 
	    idProperty: 'id',
	    baseParams : { mode: "listCmbReport" },
		totalProperty: 'totalCount',
		fields: [
				{ name: 'id' },
				{ name: 'c_name',  }, 
			]
		});
	
	Ext.PrStoreMap = new Ext.data.JsonStore({
		storeId: 'MyPrStoreMap', 
//	    autoDestroy: true,
//		autoLoad: true,
	    url : 'api/ListTaxMethodUI.php',
	    root: 'data', 
	    idProperty: 'id',
	    baseParams : { mode: "listPrStoreMapReport" },
		totalProperty: 'totalCount',
		fields: [
				{ name: 'id' },
				{ name: 'c_name' }, 
				{ name: 'c_acc_name' }, 
				{ name: 'c_detail' }, 
			]
		});
	
	/*====================== TabShow Intelization ======================*/
	/* Grid */
	var gridMain = {
		region: 'center',
		title: 'แสดงรายการข้อมูล กำหนดรายการภาษีกับค่าใช้จ่าย ', //การกำหนดรายการภาษีกับประเภทค่าใช้จ่าย
		xtype: 'grid',
		id:'tabpanel1',
		border: false,
		stripeRows: true,
		loadMask: true,
		store: store,
		tbar: [{
				xtype : 'tbfill'  
			},'  ', ' ', '-', {
				id 		  : "filter",
                xtype     : 'combo',
                width     : 200,
				mode	  : 'local',
                store     : new Ext.data.SimpleStore({
							  fields: [ "value", "text" ],
							  data: [ 
										[ 'c_name', "ชื่อรายการค่าใช้จ่าย"],
										[ 'c_code', "รหัสรายการค่าใช้จ่าย"],
							  ]
							})
				,
				valueField: "value",
				displayField: "text",
				allowBlank : false,
				editable : false,
				triggerAction: "all",
				typeAhead : false,
				emptyText : "เลือกตัวกรอง",
			},'-',{			
				id : "value-box",
				xtype : "textfield",
				width: 180, 
				fieldLabel : "fieldLabel",
				emptyText : 'คำที่ต้องการค้าหา',
			}
			,' ', '-', {
				text : "ค้นหา",
				iconCls: 'icon-magnifier',
				handler : function(){  
					
					if (Ext.getCmp("value-box").getValue()!="")
					{
							store.setBaseParam("mode", "SEARCH");
 							store.setBaseParam("filter",Ext.getCmp("filter").getValue()); 
 							store.setBaseParam("value", Ext.getCmp("value-box").getValue()); 
							Ext.getCmp('tabpanel1').getStore().load();
					}else{
						 
							store.setBaseParam("mode", "");
							Ext.getCmp('tabpanel1').getStore().load();
					}
				}
			} ,' ', '-'], /*เลขที่ Segment บัญชีบริหาร	ชื่อ Segment บัญชีบริหาร*/
					columns:[
					new Ext.grid.RowNumberer({
							width:35,
							header:" No ",
//							dataIndex: 'no',
							renderer:function(value, metaData, record, row, col, store, gridView){
								return record.get('no');
							}
					}),
					{ header: "ID System", sortable: true, hidden:true, dataIndex: 'id' },
					{ header: "รหัสรายการค่าใช้จ่าย", width:120,sortable: true, dataIndex: 'c_code' }, 
					{ header: "ชื่อค่าใช้จ่าย", width:280, sortable: true, dataIndex: 'c_name', id: 'c_name',  },
					{ header: "ประเภทภาษี",width:300, sortable: true, dataIndex: 'c_detail', id:'copyTypeTax',
						renderer: function(value, metaData, record, rowIndex, colIndex, store)
						{
							if(record.get('i_detail')==2){
								 
								metaData.attr = "style='cursor:pointer;color:blue; font-weight:bold;'; align='center'";
								return '<img style="float:left;" src="../images/icons/application_osx_double.png"/>'
									+'<div style="float:left;padding:0px 0px 0px 5px;">'+value+'</div>';
							}else{
								 
								return value; 
							}
						}
					},  
					],
	
		autoExpandColumn: 'copyTypeTax',
		bbar: new Ext.PagingToolbar({
			pageSize:20,
			store: store,
			displayInfo: true,
			displayMsg: 'Displaying topics {0} - {1} of {2}'
		})
	};
 

	/*====================== End Tabs ====================*/
	/* Form */
	var gridPrSection = {
			region: 'center',
//			title: 'แสดงรายการข้อมูล กำหนดค่ารายการภาษีกับค่าใช้จ่าย',
			xtype: 'grid',
			id:'tabpanel3',
			height:900,
			border: false,
			stripeRows: true,
			loadMask: true,
			store: Ext.PrStoreMap,
			tbar:[{	
				text : 'เพิ่มข้อมูล',
				id:'buAdd',
				iconCls: 'icon-add', 
				handler: function(grid, rowIndex, colIndex) {
					
					new Ext.Window({
						region: 'center',
						title: 'เพิ่มรายการข้อมูล กำหนดค่ารายการภาษีกับค่าใช้จ่าย',
						xtype: 'panel',
						id:'win-methodPanelFormsAdd',   
						border: false, 
						modal:true,
//						disabled: true,
						stripeRows: true,
						loadMask: true,
						store: Ext.PrStoreMap,  
				        labelAlign: 'left',
				        layout: 'column',
				        items: [
						{
							xtype: 'form',
							id: 'form-widgets-add',
							url:'api/mnTaxMapMethod.php',
							frame: true,
							border: false,
							labelWidth: 150,
							columnWidth: 0.5,
							height:450,
							width:800,
							bodyStyle: { padding: '10px 20px' ,/*background: '#eee'*/},
							defaults: {
								anchor: '100%',
								msgTarget: 'side',
							},
							items: [{
								id : "role-form-mode",
								xtype : "hidden",
								name : "mode",
								value:'ADD',
								readOnly: true				
							}, {				
								xtype : "hidden",
								name: "id",
								readOnly: true
							}, {				
 
								xtype : "hidden",
								name : "dc_acc_id",
								value:Ext.GlobalAccId,
								readOnly: true	
								
							},{
								fieldLabel: 'รายการค่าใช้จ่าย',
								xtype: 'textfield',
								id: 'dc_acc_name',  					
								name: 'dc_acc_name', 
								readOnly: true
							},new Ext.form.ComboBox({ 
								id: 'dc_section_tax_name',
								fieldLabel: 'มาตรา',
								store: storeGropHdr,
								anchor:'95%',
								valueField: 'id',
								displayField: 'c_name',
								submitValue : true,
								hiddenName : 'dc_section_tax_id',
								typeAhead: true, 
								mode: 'local',
								triggerAction: 'all',
								emptyText: 'กรุณาเลือก...',
								autoSelect: true,
								forceSelection: true,
								selectOnFocus: true,
								listeners: { 
										select: function(combo, record, index) {
										var newValue = record.data.id;
											
										if (newValue == ''){
											Ext.storeAcc.setBaseParam("PrSectionTaxId",newValue); 
											Ext.storeAcc.setBaseParam("DcAccId",Ext.GlobalAccId);  
											Ext.storeAcc.load(); 
											combo.reset();
										} else { 
											
											Ext.storeAcc.setBaseParam("PrSectionTaxId",newValue); 
											Ext.storeAcc.setBaseParam("DcAccId",Ext.GlobalAccId);  
											Ext.storeAcc.load(); 
										}
									}
								}
						    })],
							buttons: [{
								text : Ext.GLOBAL_BU_SAVE_TH,
								id:'buSave',
								handler : function() {
									var form = Ext.getCmp("form-widgets-add").getForm();  
									var jsonDtlEnCode	= saveGrid(Ext.storeAcc)
									var jsonDtlchk 		= Ext.util.JSON.decode(jsonDtlEnCode);
									var chki = 0;
									for(i=0;i<jsonDtlchk.length;i++) {  
										chki += jsonDtlchk[i].i_chk;  
									}
									if(chki==0){
										Ext.Msg.alert('Failure', 'กรุณาเลือกประเภทภาษี อย่างน้อย 1 รายการ');
									}else if (form.isValid() && chki){  //
										form.submit({
											waitMsg:'Saving Data...',
											params: {   
												jsonDtl :  saveGrid(Ext.storeAcc), 
											},
											success : function(form, action) { 
												
												Ext.getCmp('tabpanel1').getStore().reload();
												Ext.getCmp('tabpanel3').getStore().reload();
												 
												Ext.getCmp("win-methodPanelFormsAdd").hide();
												Ext.getCmp("win-methodPanelFormsAdd").destroy(); 
												
											},
											failure:  function(form, action) {
												switch (action.failureType) {
													case Ext.form.Action.CLIENT_INVALID:
														Ext.Msg.alert('Failure', 'Form fields may not be submitted with invalid values');
														break;
													case Ext.form.Action.CONNECT_FAILURE:
														Ext.Msg.alert('Failure', 'Ajax communication failed');
														break;
													case Ext.form.Action.SERVER_INVALID:
													   Ext.Msg.alert('Failure', action.result.msg);
												}
											}
										});
									}
								}
							}, {
								text: 'Cancel',
								handler: function() {
									Ext.getCmp("win-methodPanelFormsAdd").hide();
									Ext.getCmp("win-methodPanelFormsAdd").destroy(); 
								}
							}]
						},{ 
							columnWidth: 0.5,
							height:450,
				            layout: 'fit',
				            store: Ext.storeAcc,
				            xtype: 'grid',
				    		id:'tabpanel12',
				    		border: false,
				    		stripeRows: true,
				    		loadMask: true, 
							columns:[
								        new Ext.grid.RowNumberer({
										width:35,
										header:" No ",
										renderer:function(value, metaData, record, row, col, store, gridView){
											return record.get('no');
										}
								}),
								{ header: "-",  width:55, dataIndex: 'i_chk', renderer:i_showFunc }, 
								{ header: "ประเภทภาษี", width:155, sortable: true, dataIndex: 'c_name',id:'c_name' }, 
								],
								autoExpandColumn: 'c_name',
//				            items:gridMain,
						}]
					}).show();
					
					Ext.getCmp('dc_acc_name').setValue(Ext.GlobalAccName); //
					//Combo
					storeGropHdr.setBaseParam("editId",0);  
					storeGropHdr.load();
					//Grid
					Ext.storeAcc.setBaseParam("PrSectionTaxId",0); 
					Ext.storeAcc.setBaseParam("DcAccId",Ext.GlobalAccId);  
					Ext.storeAcc.load(); 
 
		 
				}
			},{
				xtype : 'tbfill'  
			},'  ', ' ', '-'],
			columns:[
						new Ext.grid.RowNumberer({
								width:35,
								header:" No ",
								renderer:function(value, metaData, record, row, col, store, gridView){
									return record.get('no');
								}
						}),
						{ header: "ID System", sortable: true, hidden:true, dataIndex: 'id' },
						{ header: "รายการค่าใช้จ่าย", width:120,sortable: true, dataIndex: 'c_acc_name' }, 
						{ header: "มาตรา", sortable: true, dataIndex: 'c_name', id: 'c_name',  },
						{ header: "ประเภทภาษี",width:255,  sortable: true, dataIndex: 'c_detail' },  
						],
	}; //gridPrSection
	
	var tabpanel2 = { 
			region: 'center',
			title: 'แสดงรายการข้อมูล รายละเอียด',
			xtype: 'panel',
			id:'tabpanel2',  
			border: false,
			disabled: true,
			stripeRows: true,
			loadMask: true,
			store: store,  
	        labelAlign: 'left',
	        layout: 'column',
	        items: [gridPrSection]
	}; //tabpanel2
	
	

	/* View */
	new Ext.Viewport({
		layout: 'border',
		items: [  new Ext.TabPanel({
			region: 'center',
			border: false,
			activeTab: 1, //default Tab
			id:'contenterCenter',     
			defaults:{autoScroll:true}, 
			items: [gridMain, tabpanel2 /*gridPrSection panelForm*/], 
			listeners: { 'tabchange' : function (panel, tab) { /* Action */ }
			}
		}) ]
	});
	/* Event ,Handler */
	Ext.getCmp('tabpanel1').on('cellclick', cellClick, this); 
	Ext.getCmp('tabpanel3').on('cellclick', cellClick_sub, this); 
	Ext.getCmp('contenterCenter').setActiveTab('tabpanel1'); 
	
	Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({	
		header: "เพิ่มประเภทภาษี",
		sortable: false,
		align:'center',
		id:'addTypeTax',
		width:100,
		iconCls: 'icon-add', 
		dataIndex:'id' ,
		renderer: function(value, metaData, record, row, col, store, gridView) {
			return'<img src="../images/icons/document_edit.gif"); style="cursor:pointer"/>';
			}
		})); 
	
	Ext.getCmp('tabpanel3').addColumn(new Ext.grid.Column({	
		header: "แก้ไข",
		sortable: false,
		align:'center',
		id:'addTypeTaxEdit',
		width:100,
		iconCls: 'icon-add', 
		dataIndex:'id' ,
		renderer: function(value, metaData, record, row, col, store, gridView) {
			return'<img src="../images/icons/document_edit.gif"); style="cursor:pointer"/>';
			}
		})); 
	
	Ext.getCmp('tabpanel3').addColumn(new Ext.grid.Column({	
		header: "ลบ",
		sortable: false,
		align:'center',
		id:'addTypeTaxDel',
		width:100,
		iconCls: 'icon-add', 
		dataIndex:'id' ,
		renderer: function(value, metaData, record, row, col, store, gridView) {
			return'<img src="../images/icons/document_delete.gif"); style="cursor:pointer"/>';
			}
		})); 
	 

	
//InfoMainGrid('tabpanel1',true,true,true,false,false,false);
	

function cellClick_sub(grid, rowIndex, columnIndex, e) { 
		var record = grid.getStore().getAt(rowIndex); 
		
		if (columnIndex==grid.getColumnModel().getIndexById('addTypeTaxEdit')){

			

//
			new Ext.Window({
				region: 'center',
				title: 'แก้ไขข้อมูล กำหนดค่ารายการภาษีกับค่าใช้จ่าย',
				xtype: 'panel',
				id:'win-methodPanelFormsEdit',   
				border: false, 
				modal:true, 
				stripeRows: true,
				loadMask: true,
				store: Ext.PrStoreMap,  
		        labelAlign: 'left',
		        layout: 'column',
		        items: [
				{
					xtype: 'form',
					id: 'form-widgets-edit',
					url:'api/mnTaxMapMethod.php',
					frame: true,
					border: false,
					labelWidth: 150,
					columnWidth: 0.5,
					height:450,
					width:800,
					bodyStyle: { padding: '10px 20px' ,/*background: '#eee'*/},
					defaults: {
						anchor: '100%',
						msgTarget: 'side',
					},
					items: [{
						id : "role-form-mode",
						xtype : "hidden",
						name : "mode",
						value:'ADD',
						readOnly: true				
					}, {				
						xtype : "hidden",
						name: "id",
						readOnly: true
		 
					}, {				
						xtype : "hidden",
						name : "dc_acc_id",
						value:Ext.GlobalAccId,
						readOnly: true	
					},{
						fieldLabel: 'รายการค่าใช้จ่าย',
						xtype: 'textfield',
						id: 'dc_acc_name',  					
						name: 'dc_acc_name', 
						readOnly: true
					},new Ext.form.ComboBox({ 
						id: 'dc_section_tax_name',
						fieldLabel: 'มาตรา',
						store: storeGropHdr,
						anchor:'95%',
						valueField: 'id',
						displayField: 'c_name',
						submitValue : true,
						hiddenName : 'dc_section_tax_id',
						typeAhead: true, 
						mode: 'local',
						triggerAction: 'all',
						emptyText: 'กรุณาเลือก...',
						autoSelect: true,
						forceSelection: true,
						selectOnFocus: true,
						listeners: {
							select: function(combo, record, index) {
								var newValue = record.data.id;
								if (newValue == ''){
									Ext.storeAcc.setBaseParam("PrSectionTaxId",newValue); 
									Ext.storeAcc.setBaseParam("DcAccId",Ext.GlobalAccId); 
									Ext.storeAcc.load();
									combo.reset();
								} else { 
									
									Ext.storeAcc.setBaseParam("PrSectionTaxId",newValue); 
									Ext.storeAcc.setBaseParam("DcAccId",Ext.GlobalAccId); 
									Ext.storeAcc.load();
									
									
								}
							}
						}
				    })],
					buttons: [{
						text : Ext.GLOBAL_BU_SAVE_TH,
						id:'buSave',
						handler : function() {
							var form = Ext.getCmp("form-widgets-edit").getForm();  
							var jsonDtlEnCode	= saveGrid(Ext.storeAcc)
							var jsonDtlchk 		= Ext.util.JSON.decode(jsonDtlEnCode);
							var chki = 0;
							for(i=0;i<jsonDtlchk.length;i++) {  
								chki += jsonDtlchk[i].i_chk;  
							}
							if(chki==0){
								Ext.Msg.alert('Failure', 'กรุณาเลือกประเภทภาษี อย่างน้อย 1 รายการ');
							}else if (form.isValid() && chki){  //
								form.submit({
									waitMsg:'Saving Data...',
									params: {   
										jsonDtl :  saveGrid(Ext.storeAcc), 
									},
									success : function(form, action) { 
										
										Ext.getCmp('tabpanel1').getStore().reload();
										Ext.getCmp('tabpanel3').getStore().reload();
										/* Ext.getCmp('contenterCenter').setActiveTab('tabpanel1');
										Ext.getCmp('tabpanel2').setDisabled(true); */
										Ext.getCmp("win-methodPanelFormsEdit").hide();
										Ext.getCmp("win-methodPanelFormsEdit").destroy(); 
										
									},
									failure:  function(form, action) {
										switch (action.failureType) {
											case Ext.form.Action.CLIENT_INVALID:
												Ext.Msg.alert('Failure', 'Form fields may not be submitted with invalid values');
												break;
											case Ext.form.Action.CONNECT_FAILURE:
												Ext.Msg.alert('Failure', 'Ajax communication failed');
												break;
											case Ext.form.Action.SERVER_INVALID:
											   Ext.Msg.alert('Failure', action.result.msg);
										}
									}
								});
							}
						}
					}, {
						text: 'Cancel',
						handler: function() {
							Ext.getCmp("win-methodPanelFormsEdit").hide();
							Ext.getCmp("win-methodPanelFormsEdit").destroy(); 
						}
					}]				    

				},{ 
					columnWidth: 0.5,
					height:450,
		            layout: 'fit',
		            store: Ext.storeAcc,
		            xtype: 'grid',
		    		id:'tabpanel12',
		    		border: false,
		    		stripeRows: true,
		    		loadMask: true, 
					columns:[
						        new Ext.grid.RowNumberer({
								width:35,
								header:" No ",
								renderer:function(value, metaData, record, row, col, store, gridView){
									return record.get('no');
								}
						}),
						{ header: "-",  width:55, dataIndex: 'i_chk', renderer:i_showFunc },
//						{ header: "ลำดับ", width:100, sortable: true, dataIndex: 'c_code' },
						{ header: "ประเภทรายได้", width:155, sortable: true, dataIndex: 'c_name',id:'c_name' }, 
						],
						autoExpandColumn: 'c_name',
//		            items:gridMain,
				}]
			}).show(); 
			
			Ext.getCmp('dc_acc_name').setValue(Ext.GlobalAccName); //
			Ext.getCmp('dc_section_tax_name').setValue(record.data.id); //

		//onLoad ... Edit
			Ext.storeAcc.setBaseParam("PrSectionTaxId",record.data.id); 
			Ext.storeAcc.setBaseParam("DcAccId",Ext.GlobalAccId);  
			Ext.storeAcc.load();
		//onLoad ... Edit			
			
			Ext.PrStoreMap.setBaseParam("DcAccId",Ext.GlobalAccId);
			Ext.PrStoreMap.setBaseParam("PrSectionTaxId",record.data.id);
			Ext.PrStoreMap.load();  
 
		} else if (columnIndex==grid.getColumnModel().getIndexById('addTypeTaxDel')) {

			/*alert(record.get('id'));*/
			
			var win = new Ext.Window({
				id : "win-msg-delete2",
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
								url : 'api/mnTaxMapMethod.php' , 
								params : { 
									mode : 'DELETE', 
									dc_acc_id : Ext.GlobalAccId,
									id : record.get('id'),
								}, 
								method: 'POST', //POST
								success: function ( result, request ) { 
									var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json 
									if (jsonData.success) {
										//Ext.MessageBox.alert('Success', jsonData.msg);			// alert massage success
									} else {
										Ext.MessageBox.alert('Failed', jsonData.msg);			// alert massage error
									}
									Ext.getCmp('tabpanel1').getStore().reload();
									Ext.getCmp('contenterCenter').setActiveTab('tabpanel1');
									Ext.getCmp('tabpanel2').setDisabled(true);
									Ext.getCmp("win-msg-delete2").hide();
									Ext.getCmp("win-msg-delete2").destroy(); 
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
							Ext.getCmp("win-msg-delete2").hide();
							Ext.getCmp("win-msg-delete2").destroy();
							Ext.getCmp('tabpanel1').getStore().reload();
						}
					}
				]
			}).show();
		}
} //End function click sub
	
function cellClick(grid, rowIndex, columnIndex, e) { 
		var record = grid.getStore().getAt(rowIndex); 
		
		if (columnIndex==grid.getColumnModel().getIndexById('addTypeTax')) {
 
			Ext.getCmp('tabpanel2').setDisabled(false);
			Ext.getCmp('contenterCenter').setActiveTab('tabpanel2'); 
			Ext.PrStoreMap.setBaseParam("id",record.data.id);
			Ext.PrStoreMap.load();
			Ext.GlobalAccName = record.data.c_code+'-'+record.data.c_name;
			Ext.GlobalAccId   = record.data.id;
			
		}else if (columnIndex==grid.getColumnModel().getIndexById('copyTypeTax')) {
			

			 if(record.data.i_detail==2){
				 
					Ext.GlobalAccName = record.data.c_code+'-'+record.data.c_name;
					Ext.GlobalAccId   = record.data.id;
					storeAccMap.load();
					
					new Ext.Window({
						region: 'center',
						title: 'สำเนารายการภาษีกับค่าใช้จ่าย (Copy)',
						xtype: 'panel',
						id:'win-methodPanelFormsCopy',   
						border: false, 
						modal:true, 
						stripeRows: true,
						loadMask: true,
						store: Ext.PrStoreMap,  
				        labelAlign: 'left',
				        layout: 'column',
				        items: [
						{
							xtype: 'form',
							id: 'form-widgets-Copy',
							url:'api/mnTaxMapMethod.php',
							frame: true,
							border: false,
							labelWidth: 150,
							columnWidth: 0.6,
							height:450,
							width:800,
							bodyStyle: { padding: '10px 20px' ,/*background: '#eee'*/},
							defaults: {
								anchor: '100%',
								msgTarget: 'side',
							},
							items: [{
								id : "role-form-mode",
								xtype : "hidden",
								name : "mode",
								value:'COPPY',
								readOnly: true				
							}, {				
								xtype : "hidden",
								name: "id",
								readOnly: true
				 
							}, {				
								xtype : "hidden",
								name : "dc_acc_id",
								value:Ext.GlobalAccId,
								readOnly: true	
							},{
								fieldLabel: 'ชื่อรายการค่าใช้จ่ายปลายทาง(ไม่เคยจับคู่)',
								xtype: 'textfield',
								id: 'dc_acc_name',  					
								name: 'dc_acc_name', 
								value:Ext.GlobalAccName,
								readOnly: true
							},new Ext.form.ComboBox({ 
								id: 'dc_acc_mapping_name',
								fieldLabel: 'ชื่อรายการค่าใช้จ่ายต้นฉบับ',
								store: storeAccMap,
								anchor:'95%',
								valueField: 'id',
								displayField: 'c_name',
								submitValue : true,
								hiddenName : 'dc_acc_mapping_id',
								typeAhead: true, 
								mode: 'local',
								triggerAction: 'all',
								emptyText: 'กรุณาเลือก...',
								autoSelect: true,
								forceSelection: true,
								selectOnFocus: true,
								listeners: {
									select: function(combo, record, index) {
										var newValue = record.data.id;
//										console.log(record.json);
										if (newValue == ''){ 
											combo.reset();
										} else { 
											Ext.getCmp('txtDetail').update(Ext.titleTypeMapp+record.json.c_detail);

										}
									}
								}
						    }) /*ชื่อรายการค่าใช้จ่ายปลายทาง(ไม่เคยจับคู่)*/],
							buttons: [{
								text : Ext.GLOBAL_BU_SAVE_TH,
								iconCls: 'icon-save',
								id:' buSave',
								handler : function() {
									var form = Ext.getCmp("form-widgets-Copy").getForm();  
//									var jsonDtlEnCode	= saveGrid(Ext.storeAcc)
//									var jsonDtlchk 		= Ext.util.JSON.decode(jsonDtlEnCode);
									 
									if (form.isValid()){  //
										form.submit({
											waitMsg:'Saving Data...',
//											params: {   
//												jsonDtl :  saveGrid(Ext.storeAcc), 
//											},
											success : function(form, action) { 
												
												Ext.getCmp('tabpanel1').getStore().reload();
												/* Ext.getCmp('tabpanel3').getStore().reload(); */
												Ext.getCmp('contenterCenter').setActiveTab('tabpanel1');
												Ext.getCmp('tabpanel2').setDisabled(true);
												Ext.getCmp("win-methodPanelFormsCopy").hide();
												Ext.getCmp("win-methodPanelFormsCopy").destroy(); 
												
											},
											failure:  function(form, action) {
												switch (action.failureType) {
													case Ext.form.Action.CLIENT_INVALID:
														Ext.Msg.alert('Failure', 'Form fields may not be submitted with invalid values');
														break;
													case Ext.form.Action.CONNECT_FAILURE:
														Ext.Msg.alert('Failure', 'Ajax communication failed');
														break;
													case Ext.form.Action.SERVER_INVALID:
													   Ext.Msg.alert('Failure', action.result.msg);
												}
											}
										});
									}
								}
							}, {
								text: 'Cancel', 
								handler: function() {
									Ext.getCmp("win-methodPanelFormsCopy").hide();
									Ext.getCmp("win-methodPanelFormsCopy").destroy(); 
								}
							}]
							},{ 
								columnWidth: 0.4,
								height:450,
					            layout: 'fit', 
					            xtype: 'panel', 
					    		border: false,
					    		stripeRows: true,
					    		loadMask: true, 
					    		items:[{ id:'txtDetail',xtype:'panel', html:Ext.titleTypeMapp}] 
							}]
							}).show();	
					
			 }
		}
}//End Function

});