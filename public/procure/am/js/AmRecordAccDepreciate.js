function defaultDate(typeStartDate)
{
	var day = new Date();
	var dd = day.getDate();
	var mm = day.getMonth()+1;
	var yy = day.getFullYear()+543;
	
	if (typeStartDate==1) // วันที่เริ่ม -1 เดือน
	{
		dd = "01";
		mm--;
		mm = "0"+mm.toString();
	}
	else
	{
		dd = "0"+dd.toString();
		mm = "0"+mm.toString();
	}
	return dd.substr(-2)+"-"+mm.substr(-2)+"-"+yy.toString();
}

Ext.onReady(function() {
	Ext.QuickTips.init();

	/*===============================================*/
	var title_panel	= "บันทึกบัญชีค่าเสื่อมราคา"; 
	/*===============================================*/
	
	var storeMain = new Ext.data.JsonStore({
		storeId: 'myStore',
	    autoDestroy: true,
		autoLoad: true,
	    url : 'api/ListAmRecordAccDepreciate.php',
	    root: 'data',
	    baseParams: { type: "HDR", i_read:user_right_read }, //Permission i_read
	    idProperty: 'id',
		totalProperty: 'totalCount',
		fields: [{ name : "no" },
		    { name : "id" },
		    { name : "d_doc_date" },
		    { name : "str_doc_date" },
		    { name : "c_code" },
		    { name : "c_name" },
		    { name : "f_depre" },
                    { name : "i_is_posted" },
                    { name : "strM" },
                    { name : "strY" },
                    { name : "strMY" },
                    { name : "dc_user_create_id" },
                    { name : "dc_user_create_cost_id" },
                    { name : "d_create" },
                    { name : "dc_user_update_id" },
                    { name : "dc_user_update_cost_id" },
                    { name : "d_update" }
		]
	});
	
	var store_dtl = new Ext.data.JsonStore({
	    url : 'api/ListAmRecordAccDepreciate.php',
	    root: 'data',
	    baseParams: { type: "DTL", i_read:user_right_read },
	    idProperty: 'id',
		totalProperty: 'totalCount',
		fields: [
				{ name : "c_code" },
				{ name : "c_name" },
				{ name : "f_depre" },
				{ name : "i_type"}
		]
	});
	
	// pagingBar
	var pagingBar = new Ext.PagingToolbar({
		pageSize: 20,
		store: storeMain,
		displayInfo: true,
		displayMsg: 'Displaying topics {0} - {1} of {2}'
	});
	
	// UI Search
	
	var storeAssetGroupSearch	= new Ext.data.JsonStore({
		url: 'api/All_AmCombo.php',
		baseParams: {type : 'storeAssetGroup', add_all : 'ALL'},
		root: 'data',
		idProperty: 'id',
		totalProperty: 'totalCount',
	    fields: [ 'id','c_code', 'c_name', 'c_code_name']
	});
	
	storeAssetGroupSearch.load({
            callback : function (records, operation, success)
            {
                if (success)
                {
                    Ext.getCmp('s-asset_group').setValue('');
                }
            }
	});
	
	var sGroup1 = [{
		xtype: 'displayfield', 
		value: 'เลขที่เอกสาร   : ' , 
		cls: 'ui-label',  	        	
	},{			
		id : "s-c_code",
		xtype : "textfield", 
		fieldLabel : "fieldLabel",
		colspan:3,
		width:250
		//listeners: Ext.enterSubmit,
		
	},{ //lable
		xtype: 'displayfield',  
		value:'ระหว่างวันที่  : ',
		cls: 'ui-label',  
	},{
		xtype: 'datefield', 
		id: 's-begin', 
		name: 's_d_begin', 
		width:140,
		value:defaultDate(1),
		emptyText : "วันที่เริ่ม",
    },{ //lable
		xtype: 'displayfield',  
		value:'ถึง  : ',
		cls: 'ui-label',  
	},{
		xtype: 'datefield', 
		id: 's-end', 
		name: 's_d_end', 
		width:140,
		value:defaultDate(2),
		emptyText : "วันที่สิ้นสุด",
    },{ //lable
		xtype: 'displayfield',  
		value:'&nbsp;',
		cls: 'space-h',  
		calspan:4
	}];
	
	var sGroup2= [{
		xtype: 'displayfield', 
		value: 'สถานะ   : ' , 
		cls: 'ui-label',  	        	
	}, {
    	id: "s-post",
		xtype: "combo",
        width: 122,
		mode: "local",
        store: new Ext.data.SimpleStore({
        	fields: [ "value", "text" ],
			data: [
			       [ "0", "- เลือกทั้งหมด -" ],
			       [ "1", "ลงบัญชีแล้ว" ],
			       [ "2", "ยังไม่ลงบัญชี" ]
			]
		}),
		value: "0",
		valueField: "value",
		displayField: "text",
		allowBlank: false,
		editable: false,
		triggerAction: "all",
		typeAhead : false
	},{ //lable
		xtype: 'displayfield',  
		value:'หมวดสินทรัพย์   : ',
		cls: 'ui-label',  
	},new Ext.form.ComboBox({
		id: "s-asset_group",
		fieldLabel: "หมวดสินทรัพย์",
		width: 300,
		mode: "local",
	    store: storeAssetGroupSearch,
		valueField: "c_code",
		displayField: "c_code_name",
		triggerAction: "all",
		forceSelection: true,
		selectOnFocus: true,
		typeAhead : false,
		emptyText: "กรุณาเลือก...",
		
	})];

	var gridMain = new Ext.grid.GridPanel({
		region: 'center',
		layout: 'fit',
		title: 'แสดงรายการ'+title_panel,
		id:'tabpanel1',
		border: false,
		stripeRows: true,
		loadMask: true,
		store: storeMain,
		viewConfig : {
			emptyText: "ไม่มีข้อมูล..",
			deferEmptyText: false
		},
		tbar: [{	
				 xtype: 'buttongroup',
				 columns: 4, 
				 title: 'ระบุเงื่อนไขในการค้นหาข้อมูล', 
				 items: [sGroup1],
				},{
					 xtype: 'buttongroup',
					 columns: 2, 
					 title: '&nbsp;', 
					 items: [sGroup2], 
					 buttonAlign:'left',
 					 buttons:[{ 
                                                    text : "ค้นหา",
                                                    align:'center',
                                                    iconCls: 'icon-magnifier', 
                                                    handler : function() { 

                                                        storeMain.setBaseParam("mode", "SEARCH");
                                                        storeMain.setBaseParam("c_code", Ext.getCmp("s-c_code").getValue());
                                                        storeMain.setBaseParam("d_begin", Ext.getCmp("s-begin").getValue());
                                                        storeMain.setBaseParam("d_end", Ext.getCmp("s-end").getValue());
                                                        storeMain.setBaseParam("i_is_post", Ext.getCmp("s-post").getValue());
                                                        storeMain.setBaseParam('asset_group_code',Ext.getCmp("s-asset_group").getValue());
                                                        storeMain.load();
                                                    }
					     },{
				                text: "เริ่มใหม่",
				                align: 'center',
				                iconCls: 'icon-reset',
				                handler: function() {
				                	Ext.getCmp("s-c_code").setValue(''); 
				                	Ext.getCmp("s-begin").setValue(defaultDate(1));
				                	Ext.getCmp("s-end").setValue(defaultDate(2));
				                	Ext.getCmp("s-post").setValue('0');
                                                        Ext.getCmp("s-asset_group").setValue(0);
				                }
				            }]
				}],
		columns: [
		    new Ext.grid.RowNumberer({
				width: 30,
				header:"ที่ ",
				renderer:function(value, metaData, record, row, col, store, gridView) {
					return record.get('no');
				}
			}),
			{ header: "วันที่คำนวณค่าเสื่อมราคา", sortable: true, align: "center", dataIndex: 'str_doc_date' },
			{ header: "เลขที่เอกสาร", sortable: true, dataIndex: 'c_code', align: "center",
		    	renderer: function (value, metaData, record, row, col, store, gridView){
		    		return value;
		    	}
		    },
			{ header: "หมวดสินทรัพย์", sortable: true, dataIndex: 'c_name' ,id: "c_name"},
			{ header: "ค่าเสื่อมราคาประจำเดือน", sortable: true, dataIndex: 'f_depre' , 
				renderer: function(value, metaData, record, row, col, store, gridView){
					metaData.attr = "style='text-align:right;'";
					return floatRenderer(value);
				} 
			},
			{ header: "สถานะ", sortable: true, dataIndex: 'i_is_posted', align: "center",
				renderer: function(value, metaData, record, row, col, store, gridView){
					var i_post = record.get('i_is_posted'); 
					if(parseInt(i_post)==1){
						return 'ลงบัญชีแล้ว';
					}else{
						return '-'; 
					}
				} 
		    }
		],
		autoExpandColumn: 'c_name',
		bbar: pagingBar
	});

	function cellClick(grid, rowIndex, columnIndex, e) {
		var record = grid.getStore().getAt(rowIndex);
		
		if (columnIndex == grid.getColumnModel().getIndexById('edit')) {
			
			if(parseInt(record.get('i_is_posted'))!=parseInt(Ext.ASSET_CAL_POST_YES)){
				Ext.getCmp('icon-save').show();
				Ext.getCmp('tabpanel2').setDisabled(false);
				Ext.getCmp('contenterCenter').setActiveTab('tabpanel2');
				Ext.getCmp('form-widgets').getForm().reset();
				Ext.getCmp("form-widgets").getForm().loadRecord(record);
				Ext.getCmp("role-form-mode").setValue("EDIT");
				Ext.getCmp("frm-d_save_date").show();
				Ext.getCmp("frm-code_gx").hide();
				
				Ext.getCmp('id').setValue(record.get('id'));
				Ext.getCmp('GRID_DTL').show();

				// Load Method
				store_dtl.setBaseParam("id", record.data.id);
				store_dtl.setBaseParam("type", "DTL");
				store_dtl.load();
			}
		} else if (columnIndex==grid.getColumnModel().getIndexById('view')) {
			var myMask = new Ext.LoadMask(Ext.getBody(), {msg:"Please wait..."});
			myMask.show();
			Ext.Ajax.request({
				url: 'api/ListAmRecordAccDepreciate.php',
				loadMask: true,
				mask: 'Loading..',
				timeout : 90000, // ms
				params: {
					type : 'GET_GX',
					gl_depre_hdr_id : record.data.id
				},
				method: 'POST',
				success: function(response){
					
					var textJson, DataObjson; 
					myMask.hide();
					textJson = response.responseText; 		// Text same PHP clean_json_decode
					DataObjson = Ext.decode(textJson);  		// Obj  same PHP clean_json_decode
					
					Ext.getCmp('icon-save').hide();
					Ext.getCmp('tabpanel2').setDisabled(false);
					Ext.getCmp('contenterCenter').setActiveTab('tabpanel2');
					Ext.getCmp('form-widgets').getForm().reset();
					Ext.getCmp("form-widgets").getForm().loadRecord(record);
					Ext.getCmp("role-form-mode").setValue("EDIT");
					Ext.getCmp("frm-d_save_date").hide();
					
					Ext.getCmp('id').setValue(record.get('id'));
					Ext.getCmp('GRID_DTL').show();

					// Load Method
					store_dtl.setBaseParam("id", record.data.id);
					store_dtl.setBaseParam("type", "DTL");
					store_dtl.load();
					
					if (DataObjson.gxcode != "")
					{
						Ext.getCmp("frm-code_gx").show();
						Ext.getCmp("frm-code_gx").setValue(DataObjson.gxcode);
					}
					
				},
				failure: function ( result, request) { 
					Ext.MessageBox.alert('Failed', result.responseText); 
				} 
			});
		}
	};
	//==========================================================
	var GRID_DTL = {
			id: "GRID_DTL",
			border: false,
			bodyStyle: { padding: '10px 20px' },
			defaults: { anchor: '100%', msgTarget: 'side', allowBlank: false },
			items: [{
				xtype: 'container',
				layout: 'hbox',
				align: 'stretch',
				defaults: { xtype: 'fieldset', flex:1, margins : '0px 3px', autoHeight: true },
				items: [{
					title: 'แสดงรายการค่าเสื่อมราคาของสินทรัพย์แต่ละประเภทแยกตามหน่วยงาน ',
					defaults: { anchor: '100%' },
					items: [ new Ext.grid.GridPanel({
						region: 'center',
						id: 'grid_dtl',
						layout:'fit',
						height: 280,
						autohieght: true,
						border: true,
						stripeRows: true,
						loadMask: true,
						store: store_dtl,
						viewConfig : {
							emptyText: "ไม่มีข้อมูล..",
							deferEmptyText: false,
							forceFit: true,
							scrollOffset: 0, // close scrollbar
							getRowClass: function(record, index, rowParams)
							{
								if(record.get('i_type') == 1) {
									return 'first';
								} else if(record.get('i_type') == 2) {
									return 'second';
								} else if(record.get('i_type') == 3) {
									return 'third';
								} else if(record.get('i_type') == 4) {
									return 'fourth';
								}
							}
						},
						columns: [
							{header: 'รหัสหน่วยงาน', sortable: true, dataIndex: 'c_code', align: "center",
			              		renderer: function(value, metaData, record, rowIndex, colIndex, store) {
			              			var iType = parseInt(record.get('i_type'));
			              			if(iType == 1){
			              				metaData.attr = "style='width:500px; text-align:left; color:blue; font-weight:bold;'";
			              				return value;
			              			} else if (iType == 2){
			              				return '';
			              			} else if (iType == 3){
			              				return '';
			              			} else {
			              				metaData.attr = "style='text-align:center;'";
			              				return value;
			              			}
			              		}
							},
							{header: 'ชื่อหน่วยงาน', sortable: true, dataIndex: 'c_name', id : 'c_name',
			              		renderer: function(value, metaData, record, rowIndex, colIndex, store) {
			              			var iType = parseInt(record.get('i_type'));
			              			if(iType == 1){
			              				return '';
			              			} else if (iType == 2){
			              				metaData.attr = "style='text-align:right; font-weight:bold;'";
			              				return value;
			              			} else if (iType == 3){
			              				metaData.attr = "style='text-align:right; font-weight:bold; color:red'";
			              				return value;
			              			} else {
			              				metaData.attr = "style='text-align:left;'";
			              				return value;
			              			}
			              		}
							},
							{header: 'ค่าเสื่อมราคา(บาท)', sortable: true, dataIndex: 'f_depre',
			              		renderer: function(value, metaData, record, rowIndex, colIndex, store) {
			              			var iType = parseInt(record.get('i_type'));
			              			if(iType == 1){
			              				return '';
			              			} else if (iType == 2){
			              				metaData.attr = "style='text-align:right; font-weight:bold;'";
			              				return floatRenderer(value);
			              			} else if (iType == 3){
			              				metaData.attr = "style='text-align:right; font-weight:bold; color:red'";
			              				return floatRenderer(value);
			              			} else {
			              				metaData.attr = "style='text-align:right;'";
			              				return floatRenderer(value);
			              			}
			              		}
							},
							{header: '', sortable: true, width:50,
			              		renderer: function(value, metaData, record, rowIndex, colIndex, store) {
			              			return '';
			              		}
			              	}
						],
						columnLines: true,
						autoExpandColumn: 'c_name'
					}) ]
				}]
			}]
		};
	
	//==========================================================
	var panelForm = {
		region: 'center',
		title: 'ข้อมูล'+title_panel,
		xtype: 'panel',
		id: 'tabpanel2',
		border: false,
		disabled: true,
		stripeRows: true,
		loadMask: true,
		store: storeMain,
        items: [{
        	xtype: 'form',
        	id: 'form-widgets',
			url:'api/mnAmRecordAccDepreciate.php',
			frame: true,
			labelWidth: 200,
			bodyStyle: { padding: '10px 20px' },
			defaults: { anchor: '100%', msgTarget: 'side', allowBlank: false },
			items: [{
				xtype: 'container',
				layout: 'fit',
				align: 'stretch',
				defaults: { xtype: 'fieldset', flex:1, margins : '0px 3px', autoHeight: true },
				items: [{
					title: 'บันทึกข้อมูล '+title_panel,
					defaults: { allowBlank: true},
					items: [{
						id: "role-form-mode",
						xtype: "hidden",
						name: "mode"
					},{
						xtype: "hidden",
						name: "id",
						id: "id"
					},{
			    		xtype: 'hidden', 
			    		name : 'strM',
						id :'frm-strM'
					},{
			    		xtype: 'hidden', 
			    		name : 'strY',
			    		id :'frm-strY'
					},{
			    		xtype: 'displayfield', 
			    		fieldLabel: "ค่าเสื่อมราคาสินทรัพย์ถาวร เดือน ",
			    		name : 'strMY',
						id :'frm-strMY',
						cls: 'my-label-style'
					},{
			    		xtype: 'displayfield', 
			    		fieldLabel: "หมวด ",
			    		name : 'c_name',
						id :'frm-c_name',
						cls: 'my-label-style'
					},{
			    		xtype: 'displayfield', 
			    		fieldLabel: "เลขที่เอกสาร",
			    		name : 'c_code',
						id :'frm-c_code',
			    		value: 'ADxxxxxxxxx' , 
			    		cls: 'my-label-style'
					},{
			    		xtype: 'displayfield', 
			    		fieldLabel: "เลขที่อ้างอิง",
			    		name : 'code_gx',
						id :'frm-code_gx',
			    		value: '-' , 
			    		cls: 'my-label-style',
			    		hidden:true
					},{
						xtype: 'datefield',
						fieldLabel: 'วันที่บันทึกบัญชี',
						name : 'd_save_date',
						id: 'frm-d_save_date'
					}]
				}]
			}],
			buttonAlign: 'left',
			buttons: [{
				text : Ext.GLOBAL_BU_SAVE_TH,
				id: "icon-save",
				iconCls	: 'icon-save',
				handler: function(){
					var form = Ext.getCmp("form-widgets").getForm();
					var d_save_date = Ext.getCmp('frm-d_save_date').value;
					
					if (d_save_date == ""){
						Ext.Msg.alert('ผิดพลาด', 'กรุณาระบุ วันที่บันทึกบัญชี');
					}else if (form.isValid()){
						// ตรวจสอบการปิดงวด
						Ext.Ajax.request({
							url: 'api/ListAmRecordAccDepreciate.php',
							loadMask: true,
							mask: 'Loading..',
							timeout : 90000, // ms
							params: {
								type : 'CHECK_CLOSE',
								d_save_date : d_save_date
							},
							method: 'POST',
							success: function(response){
								
								var textJson, DataObjson; 
								textJson = response.responseText; 		// Text same PHP clean_json_decode
								DataObjson = Ext.decode(textJson);  		// Obj  same PHP clean_json_decode
								
								if (DataObjson.chk)
								{
									form.submit({
										waitMsg:'Saving Data...',
										timeout : 90,
										success : function(form, action) {
											
											var data = Ext.decode(action.response.responseText);
											if (data.success) {
												if(data.c_code_gen){
													
													Ext.Msg.alert('Success' , ""
													+"<br/> เลขที่เอกสาร  : "+data.c_code_gen
													+"<br/> วันที่บันทึก  : "+ Ext.getCmp('frm-d_save_date').value);
												}
												
												Ext.getCmp('contenterCenter').setActiveTab('tabpanel1');
												Ext.getCmp('tabpanel2').setDisabled(true);
												Ext.getCmp('tabpanel1').getStore().reload(); 
											} else {
												Ext.MessageBox.alert('Failed', data.msg);			// alert massage error
											}

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
								else
								{
									Ext.MessageBox.alert('Failed', DataObjson.msg); 
								}
							},
							failure: function ( result, request) { 
								Ext.MessageBox.alert('Failed', result.responseText); 
							} 
						});
						
					}
				} //End Handle
			}, {
				text: Ext.GLOBAL_BU_BACK_TH,
				handler: function() {
					Ext.getCmp('contenterCenter').setActiveTab('tabpanel1');
					Ext.getCmp('tabpanel2').setDisabled(true);
				}
			}]
		}, GRID_DTL]
	}
	//=========================================================================================//
	
	/*====================== CENTER ======================*/
	var center = new Ext.TabPanel({
		region: 'center',
		border: false,
		id: 'contenterCenter',
		defaults:{ autoScroll: true }, 
		items: [ gridMain , panelForm ]
	});
	
	new Ext.Viewport({
		layout: 'border',
		items: [ center ]
	});
	// SET ref Grid&Tab
	Ext.getCmp('tabpanel1').on('cellclick', cellClick, this);

	// SetTab Controller Loads
	Ext.getCmp('contenterCenter').setActiveTab('tabpanel1');
	//InfoMainGrid('tabpanel1',true,true,true,false,false,false);
	
	 Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({header: "ผู้ที่สร้าง",		hidden:false,	sortable: true,	dataIndex:'dc_user_create_id'}));
	 Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({header: "วันที่สร้าง",	hidden:false,  	sortable: true,	dataIndex:'d_create' , renderer:shortThaiDate }));
	 Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({header: "หน่วยงานผู้สร้าง",	hidden:true,	sortable: true,	dataIndex:'dc_user_create_cost_id' }));
	 Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({header: "ผู้แก้ไข", 	hidden:true,  	sortable: true, dataIndex:'dc_user_create_id' }));
	 Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({header: "วันที่แก้ไข", 	hidden:true,  	sortable: true, dataIndex:'d_update' ,renderer:shortThaiDate, }));
	 Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({header: "หน่วยงานผู้แก้ไข",hidden:true,	sortable: true, dataIndex:'dc_user_update_cost_id' }));
	
	 Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({
		header: 'แสดง', 
		align: 'center',
		id: 'view',
		sortable: false,
		width: 50,
		dataIndex: 'id' ,
		renderer: function(value, metaData, record, row, col, store, gridView) {
			return'<img src="../images/icons/application_osx_go.png"); style="cursor:pointer"/>';
		}
	}));
	 
	if(i_edit){
		//all
		Ext.getCmp("role-form-mode").setValue('EDIT'); 
		Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({	
			header: "แก้ไข",
			sortable: false,
			align:'center',
			id:'edit',
			width:50,
			dataIndex:'id' ,
			renderer: function(value, metaData, record, row, col, store, gridView) {
				if(parseInt(record.get('i_is_posted'))!=parseInt(Ext.ASSET_CAL_POST_YES)){
					return'<img src="../images/icons/document_edit.gif"); style="cursor:pointer"/>';
				}else{ 
					return '';
				} 	
				
			}
		})); 
	};
	
	/*====================== RENDER ======================*/
	
});