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
	var title_panel	= "คำนวณค่าเสื่อมราคา"; 
	/*===============================================*/
	
	var storeMain = new Ext.data.JsonStore({
		storeId: 'myStore',
	    autoDestroy: true,
		autoLoad: true,
	    url : 'api/ListAmCalDepre.php',
	    root: 'data',
	    baseParams: { type: "HDR", i_read:user_right_read }, //Permission i_read
	    idProperty: 'id',
		totalProperty: 'totalCount',
		fields: [{ name : "no" },
		    { name : "id" },
		    { name : "c_code" },
		    { name : "m1" },
		    { name : "y1" },
		    { name : "strMY" },
		    { name : "c_name" },
		    { name : "d_doc_date" },
		    { name : "str_doc_date" },
		    { name : "d_gen_date" },
		    { name : "str_gen_date" },
		    { name : "f_depre" },
                    { name : "i_enable" },
                    { name : "ref_c_code" },
                    { name : "dc_user_create_id" },
                    { name : "dc_user_create_cost_id" },
                    { name : "d_create" },
                    { name : "dc_user_update_id" },
                    { name : "dc_user_update_cost_id" },
                    { name : "d_update" }
		]
	});
	
	var storeAssetGroup = new Ext.data.JsonStore({
		autoLoad: true,
		url: 'api/All_AmCombo.php',
		baseParams: {type : 'storeAssetGroup'},
		root: 'data',
		idProperty: 'id',
		totalProperty: 'totalCount',
	    fields: [ 'id','c_code', 'c_name', 'c_code_name']
	});
	
	var storeAssetType = new Ext.data.JsonStore({
		url: 'api/All_AmCombo.php',
	    root: 'data',
	    baseParams: { type: "storeAssetByParent", conType : "isType"},
	    idProperty: 'id',
	    totalProperty: 'totalCount',
	    fields: [ 'id','c_code', 'c_name', 'c_code_name']
	});
	
	// pagingBar
	var pagingBar = new Ext.PagingToolbar({
		pageSize: 20,
		store: storeMain,
		displayInfo: true,
		displayMsg: 'Displaying topics {0} - {1} of {2}'
	});
	
	// UI Search
	var store_month	= new Ext.data.JsonStore({
		fields: [ "id", "c_name" ],
		data : [
		        { id : "01", c_name : "มกราคม" },
		        { id : "02", c_name : "กุมภาพันธ์" },
		        { id : "03", c_name : "มีนาคม" },
		        { id : "04", c_name : "เมษายน" },
		        { id : "05", c_name : "พฤษภาคม" },
		        { id : "06", c_name : "มิถุนายน" },
		        { id : "07", c_name : "กรกฎาคม" },
		        { id : "08", c_name : "สิงหาคม" },
		        { id : "09", c_name : "กันยายน" },
		        { id : "10", c_name : "ตุลาคม" },
		        { id : "11", c_name : "พฤศจิกายน" },
		        { id : "12", c_name : "ธันวาคม" }
		       ]
	});
	
	// storeYear
	var years = [];
    var currentTime = new Date();
    var now = currentTime.getFullYear()+1;
    var yy_en = currentTime.getFullYear()-1;
    while(yy_en <= now) {
    	years.push({ id : yy_en, c_name : yy_en + 543 });
    	yy_en++;
    };
    
	var store_year = new Ext.data.JsonStore({
		fields: ["id", "c_name"],
		data : years
	});
	
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
		value:'เดือน  : ',
		cls: 'ui-label',  
	},new Ext.form.ComboBox({
		id: "s-month",
		fieldLabel: "เดือนที่จ่ายวัสดุ",
		width: 100,
		mode: "local",
		store: store_month,
		value: (new Date().getMonth()+1),
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
	}),{ //lable
		xtype: 'displayfield',  
		value:'ปี  : ',
		cls: 'ui-label',  
	}, new Ext.form.ComboBox({
		id: "s-year",
		fieldLabel: "ปี",
		width: 100,
		mode: "local",
	    store: store_year,
		value: new Date().getFullYear(),
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
	})];
	
	var sGroup2= [{
		xtype: 'displayfield', 
		value: 'สถานะ   : ' , 
		cls: 'ui-label',  	        	
	}, {
    	id: "s-enable",
		xtype: "combo",
        width: 122,
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
			 buttonAlign: 'left',
			 buttons: [{	 
						text : 'เพิ่มข้อมูล', 
						id:'buAdd',
						iconCls: 'icon-add', 
						disabled:user_right_add?false:true,
						handler: function(grid, rowIndex, colIndex) {
							Ext.getCmp("tabpanel2").setDisabled(false);
							Ext.getCmp("contenterCenter").setActiveTab("tabpanel2");
							Ext.getCmp("form-widgets").getForm().reset();
							Ext.getCmp("role-form-mode").setValue("ADD");
							
							Ext.getCmp("icon-save").hide();
							var bDate = addY(543);
							Ext.getCmp("frm-d_gen_date").setValue(bDate);
						}
					}],
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
									storeMain.setBaseParam("month", Ext.getCmp("s-month").getValue());
									storeMain.setBaseParam("year", Ext.getCmp("s-year").getValue());
									storeMain.setBaseParam("enable", Ext.getCmp("s-enable").getValue());
									storeMain.setBaseParam('asset_group_code',Ext.getCmp("s-asset_group").getValue());
									storeMain.load();
								}
					     },{
				                text: "เริ่มใหม่",
				                align: 'center',
				                iconCls: 'icon-reset',
				                handler: function() {
				                	var mm = (new Date().getMonth()+1);
				                	var yy = new Date().getFullYear();
				                	Ext.getCmp("s-c_code").setValue(''); 
				                	Ext.getCmp("s-month").setValue(mm);
									Ext.getCmp("s-year").setValue(yy);
									Ext.getCmp("s-enable").setValue('0');
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
			{ header: "เลขที่เอกสาร", sortable: true, dataIndex: 'c_code', align: "center",
		    	renderer: function (value, metaData, record, row, col, store, gridView){
		    		return value;
		    	}
		    },
			{ header: "เดือน/ปี", sortable: true, align: "center", dataIndex: 'strMY' /*, renderer:shortThaiDate*/},
			{ header: "หมวดสินทรัพย์", sortable: true, dataIndex: 'c_name' ,id: "c_name"},
			{ header: "วันที่คำนวณค่าเสื่อมราคา", sortable: true, align: "center", dataIndex: 'str_doc_date' },
			{ header: "วันที่บันทึกรายการ", sortable: true, align: "center", dataIndex: 'str_gen_date' },
			{ header: "ค่าเสื่อมราคาประจำเดือน", sortable: true, dataIndex: 'f_depre' , 
				renderer: function(value, metaData, record, row, col, store, gridView){
					metaData.attr = "style='text-align:right;'";
					return floatRenderer(value);
				} 
			},
			{ header: "สถานะรายการ", sortable: true, dataIndex: 'i_enable', align: "center",
				renderer: function(value, metaData, record, row, col, store, gridView){
					var i_enable = record.get('i_enable'); 
					if(i_enable==Ext.CONF_STATUS_ENABLE){
						return '<img src="../images/icons/yes.gif");/>';
					}else{
						return '<img src="../images/icons/no.gif");/>'; 
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
			
			if(record.get('c_code')== 'AD'){
				Ext.getCmp('icon-save').show();
				Ext.getCmp('tabpanel2').setDisabled(false);
				Ext.getCmp('contenterCenter').setActiveTab('tabpanel2');
				Ext.getCmp('form-widgets').getForm().reset();
				//Ext.getCmp("form-widgets").getForm().loadRecord(record);
				Ext.getCmp("role-form-mode").setValue("EDIT");
				
				Ext.getCmp('id').setValue(record.get('id'));
				Ext.getCmp('frm-c_code').setValue('ADxxxxxxxxx');
				
				Ext.getCmp('frm-month').setValue(record.get('m1'));
				Ext.getCmp('frm-year').setValue(record.get('y1'));
				
				Ext.getCmp('frm-d_gen_date').setValue(record.get('str_gen_date'));

				// Load Inventory Type
				var asset_type = record.get('ref_c_code');
				var asset_group = asset_type.substring(0, 2);
				
				Ext.getCmp('frm-asset_group').setValue(asset_group);
				storeAssetType.setBaseParam("codeParent", asset_group);
				storeAssetType.load({
					callback : function (records, operation, success)
					{
						if (success)
						{
							Ext.getCmp('frm-asset_type').setValue(asset_type);
							chkCal();
						}
					}
				});
			}
		} else if (columnIndex==grid.getColumnModel().getIndexById('view')) {
			if (record.get('c_code')!= 'AD' && parseInt(record.get('i_enable')) == parseInt(Ext.CONF_STATUS_ENABLE))
			{
				var myMask = new Ext.LoadMask(Ext.getBody(), {msg:"Please wait..."});
				myMask.show();
				Ext.Ajax.request({
					url: 'api/ListAmCalDepre.php',
					loadMask: true,
					mask: 'Loading..',
					timeout : 90000, // ms
					params: {
						type : 'VIEW',
						gl_depre_hdr_id : record.data.id,
                                                limit : 80000
					},
					method: 'POST',
					success: function(response){
						
						var textJson, DataObjson; 
						myMask.hide();
						textJson = response.responseText; 		// Text same PHP clean_json_decode
						DataObjson = Ext.decode(textJson);  		// Obj  same PHP clean_json_decode
						
						var win = window.open();
						win.document.write(DataObjson.doc_name);
						//win.print();
						
					},
					failure: function ( result, request) { 
						Ext.MessageBox.alert('Failed', result.responseText); 
					} 
				});
			}
		} else if (columnIndex == grid.getColumnModel().getIndexById('remove')) {
			if(record.get('c_code')== 'AD'){
				/*var win = new Ext.Window({
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
								url : 'api/mnInvSendRequirement.php' ,
								method: 'POST',
								params : { 
									mode : 'DELETE', 
									id : inv_tran_sr_hdr_id
								},
								success: function ( result, request ) {
									var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
									if (jsonData.success) {
										//Ext.MessageBox.alert('Success', jsonData.msg);		// alert massage success
									} else {
										Ext.MessageBox.alert('Failed', jsonData.msg);			// alert massage error
									}
									Ext.getCmp("win-msg-delete").hide();						// hidden window-panel
									Ext.getCmp("win-msg-delete").destroy();						// clear memory :: garbage collection
									storeMain.reload();
									Ext.getCmp('tabpanel2').setDisabled(true);
								},
								failure: function ( result, request) { 
									Ext.MessageBox.alert('Failed', result.responseText);		// connect error
								}
							});
						}
					},{
						text : "Cancel",
						handler : function() {
							Ext.getCmp("win-msg-delete").hide();
							Ext.getCmp("win-msg-delete").destroy();
						}				
					}]
				}).show();*/
			}
		}
	};
	
	function chkCal()
	{
		var id = Ext.getCmp('id').getValue();
		var asset_type = Ext.getCmp('frm-asset_type').getValue();
		var cal_month = Ext.getCmp('frm-month').getValue();
		var cal_year = Ext.getCmp('frm-year').getValue();
		
		if (asset_type != '')
		{
			Ext.Ajax.request({
				url : 'api/ListAmCalDepre.php' , 
				params : {
					type:'CHECK_CALCULATE',
					id : id,
					asset_type : asset_type,
					cal_month : cal_month, 
					cal_year : cal_year
				},
				method: 'GET', //POST
				success: function ( result, request ) { 
					var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
					if (jsonData.success) {
						
						if (parseInt(jsonData.data[0].i_msg) > 0) {
							Ext.getCmp('frm-msg').show();
							Ext.getCmp('frm-msg').setText(jsonData.data[0].msg, false);
							if (jsonData.data[0].disBU)
								Ext.getCmp("icon-save").hide();
							else
								Ext.getCmp("icon-save").show();
						} else {
							Ext.getCmp('frm-msg').hide();
							Ext.getCmp('frm-msg').setText('', false);
							Ext.getCmp("icon-save").show();
						}
						
					} else {
						Ext.MessageBox.alert('Failed', jsonData.debug);			// alert massage error
					} 
				},
				failure: function ( result, request) { 
					Ext.MessageBox.alert('Failed', jsonData.debug);		// connect error
				}
			}); //End Function	
		}
		
	}
	
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
			url:'api/mnAmCalDepre.php',
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
						name: "mode",
						readOnly: true
					}, {
						xtype: "hidden",
						name: "id",
						id: "id",
						readOnly: true
					},{
			    		xtype: 'displayfield', 
			    		fieldLabel: "เลขที่คำนวณค่าเสื่อมราคา",
			    		name : 'c_code',
						id :'frm-c_code',
			    		value: 'ADxxxxxxxxx' , 
			    		cls: 'my-label-style'
					},new Ext.form.ComboBox({
						id: "frm-asset_group",
						fieldLabel: "หมวดสินทรัพย์",
						width: 300,
						mode: "local",
					    store: storeAssetGroup,
						valueField: "c_code",
						displayField: "c_code_name",
						hiddenName : "asset_group",
						triggerAction: "all",
						forceSelection: true,
						selectOnFocus: true,
						typeAhead : false,
						emptyText: "กรุณาเลือก...",
						listeners: {
							select: function(combo, record, index) {
								
								// Load Inventory Type
								var codeParent = record.data.c_code;
								storeAssetType.setBaseParam("codeParent", codeParent);
								storeAssetType.load({
									callback : function (records, operation, success)
									{
										if (success)
										{
											Ext.getCmp('frm-asset_type').setValue(storeAssetType.data.items[0].get('c_code'));
											chkCal();
										}
									}
								});
							}
						}
					}),new Ext.form.ComboBox({
						id: "frm-asset_type",
						fieldLabel: "ประเภทสินทรัพย์",
						width: 300,
						mode: "local",
					    store: storeAssetType,
						valueField: "c_code",
						displayField: "c_code_name",
						hiddenName : "asset_type",
						triggerAction: "all",
						forceSelection: true,
						selectOnFocus: true,
						typeAhead : false,
						emptyText: "กรุณาเลือก...",
						listeners: {
							select: function(combo, record, index) {
								chkCal();
							}
						}
					}),new Ext.form.ComboBox({
						id: "frm-month",
						fieldLabel: "เดือนที่คำนวณค่าเสื่อมราคา",
						width: 100,
						mode: "local",
						store: store_month,
						value: (new Date().getMonth()+1),
						valueField: "id",
						displayField: "c_name",
						hiddenName : "cal_month",
						triggerAction: "all",
						forceSelection: true,
						selectOnFocus: true,
						typeAhead : false,
						emptyText: "กรุณาเลือก...",
						listeners: {
							select: function(combo, record, index) {
								chkCal();
							}
						}
					}), new Ext.form.ComboBox({
						id: "frm-year",
						fieldLabel: "ปีที่คำนวณค่าเสื่อมราคา",
						width: 100,
						mode: "local",
					    store: store_year,
						value: new Date().getFullYear(),
						valueField: "id",
						displayField: "c_name",
						hiddenName : "cal_year",
						triggerAction: "all",
						forceSelection: true,
						selectOnFocus: true,
						typeAhead : false,
						emptyText: "กรุณาเลือก...",
						listeners: {
							select: function(combo, record, index) {
								chkCal();
							}
						}
					}),{
						fieldLabel: 'วันที่บันทึกรายการ',
						xtype: 'radiogroup',
						columns: [100,150],
						items: [{
							xtype: 'datefield',
							name : 'd_gen_date',
							id: 'frm-d_gen_date'
						},{
				    		xtype: 'displayfield', 
				    		value: ' (มีผลกับการ Gen CODE)' , 
				    		cls: 'my-label-style'
						}] 
					},{
			    		xtype: 'label', 
			    		id : 'frm-msg',
			    		value: '' , 
			    		cls: 'message-label-style'
					}]
				}]
			}],
			buttonAlign: 'left',
			buttons: [{
				text : "คำนวณค่าเสื่อมราคา",
				id: "icon-save",
				iconCls	: 'icon-save',
				handler: function(){
					var form = Ext.getCmp("form-widgets").getForm();
					
					if (form.isValid()){
						form.submit({
							waitMsg:'Saving Data...',
							timeout : 90,
							success : function(form, action) {
								
								var data = Ext.decode(action.response.responseText);
								if (data.success) {
									if(data.c_code_gen){
										
										Ext.Msg.alert('Success' , ""
										+"<br/> เลขที่เอกสาร  : "+data.c_code_gen
										+"<br/> วันที่บันทึก  : "+ Ext.getCmp('frm-d_gen_date').value);
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
				} //End Handle
			}, {
				text: Ext.GLOBAL_BU_BACK_TH,
				handler: function() {
					Ext.getCmp('contenterCenter').setActiveTab('tabpanel1');
					Ext.getCmp('tabpanel2').setDisabled(true);
				}
			}]
		}]
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
	
	if(i_add){
		 Ext.getCmp('buAdd').setDisabled(false);
	 }else{
		 Ext.getCmp('buAdd').setDisabled(true);
	 }
	
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
			if (record.get('c_code')!= 'AD' && parseInt(record.get('i_enable')) == parseInt(Ext.CONF_STATUS_ENABLE))
				return'<img src="../images/icons/application_osx_go.png"); style="cursor:pointer"/>';
			else
				return '';
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
				if(record.get('c_code')=='AD'){
					return'<img src="../images/icons/document_edit.gif"); style="cursor:pointer"/>';
				}else{ 
					return '';
				} 	
				
			}
		})); 
	};
	
	if(i_delete){
		//edit
		Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({
			header: 'ลบ', 
			align: 'center',
			id: 'remove',
			sortable: false,
			width: 50,
			dataIndex: 'id' ,
			renderer: function(value, metaData, record, row, col, store, gridView) {
				if(record.get('c_code')=='AD'){
					return '<img src="../images/icons/document_delete.gif"); style="cursor:pointer"/>';
				}else{ 
					return '';
				} 
			},
		}));
	};

	/*====================== RENDER ======================*/
	
});