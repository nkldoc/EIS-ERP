function cellClick(grid, rowIndex, columnIndex, e) { 
	var record = grid.getStore().getAt(rowIndex); 
	if (columnIndex==grid.getColumnModel().getIndexById('edit')) {
		Ext.getCmp("role-form-mode").setValue("EDIT");
		Ext.getCmp('tabpanel2').setDisabled(false);
		Ext.getCmp('contenterCenter').setActiveTab('tabpanel2');
		Ext.getCmp("form-widgets").getForm().loadRecord(record); 
		
	} else if (columnIndex==grid.getColumnModel().getIndexById('view')) {
		Ext.getCmp("role-form-mode").setValue("EDIT");
		Ext.getCmp('buSave').setDisabled(true);
		Ext.getCmp('tabpanel2').setDisabled(false);
		Ext.getCmp('contenterCenter').setActiveTab('tabpanel2');
		Ext.getCmp("form-widgets").getForm().loadRecord(record);
	} else if (columnIndex==grid.getColumnModel().getIndexById('remove')) {
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
							url : 'api/mnDcProductType.php' , 
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
								Ext.getCmp('tabpanel2').setDisabled(true);
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
};

 

//OnLoad	
Ext.onReady(function() {
Ext.QuickTips.init();
 
	var store = new Ext.data.JsonStore({
		storeId: 'myStore',
	    autoDestroy: true,
		autoLoad: true,
	    url : 'api/ListDcProductType.php',
	    root: 'data',
	    baseParams: { i_read:user_right_read }, //Permission i_read
	    idProperty: 'id',
		totalProperty: 'totalCount',
		fields: [
			{ name: 'no' },
			{ name: 'id' },
			{ name: 'c_code'},
			{ name: 'c_name'}, 
			
			{ name: 'dc_product_group_id' },
			{ name: 'dc_product_group_name' }, 
			
			{ name: 'dc_product_class_id' },  
			{ name: 'dc_product_class_name' },  
			{ name: 'dc_cost_id' },  
			
			{ name: 'region_type' },
			{ name: 'region_type_name' },  
			{ name: 'i_class_type' },
			{ name: 'class_type_name' },  
			{ name: 'i_group_type'},
			{ name: 'i_is_comm'}, 
			{ name: 'c_comment' }, 
			{ name: 'i_enable', type: 'int'  },
			{ name: 'i_delete', type: 'int'  },
	     	{ name: 'dc_user_create_id' },
	     	{ name: 'dc_user_create_cost_id' },
	     	{ name: 'd_create' },
	     	{ name: 'dc_user_update_id' },
	     	{ name: 'dc_user_update_cost_id' },
	     	{ name: 'd_update' },
		]
	});
 
	var storeGroup	= new Ext.data.JsonStore({
		autoDestroy: true,
		autoLoad: true,
		url: 'api/All_ArCombo.php',
		baseParams: {type : 'dc_product_group'},
		root: 'data',
		idProperty: 'id',
	    fields: [ 'id', 'c_name','dc_product_class_id', 'i_class_type', 'i_group_type']
	});
	
	var storeCost	= new Ext.data.JsonStore({
		autoDestroy: true,
		autoLoad: true,
		url: 'api/All_ArCombo.php',
		baseParams: {type : 'dc_cost'},
		root: 'data',
		idProperty: 'id',
	    fields: [ 'id', 'c_name']
	});
 
	/*====================== TabShow Intelization ======================*/
	/* Grid */
	var gridMain = {
		region: 'center',
		title: 'แสดงข้อมูลประเภทรายได้',
		xtype: 'grid',
		id:'tabpanel1',
		border: false,
		stripeRows: true,
		loadMask: true,
		store: store,
		tbar: [{	
				text : 'เพิ่มข้อมูล',
				id:'buAdd',
				iconCls: 'icon-add', 
				disabled:user_right_add?false:true,
				handler: function(grid, rowIndex, colIndex) {
					Ext.getCmp('buSave').setDisabled(false); //if add then save
					Ext.getCmp("role-form-mode").setValue("ADD");
					Ext.getCmp('tabpanel2').setDisabled(false);
					Ext.getCmp('contenterCenter').setActiveTab('tabpanel2');
					Ext.getCmp('form-widgets').getForm().reset();
					
//					GroupUI(Ext.AR_REPOER_GROUP_TV);
					
				}
			},{
				xtype : 'tbfill'  
			},'  ', ' ', '-', {
				id 		  : "filter",
                xtype     : 'combo',
                width     : 130,
				mode	  : 'local',
                store     : new Ext.data.SimpleStore({
							  fields: [ "value", "text" ],
							  data: [
							    [ 'product_class_name', "หมวดรายได้" ],
								[ 'c_code', "รหัส" ],
								[ 'c_name', "ชื่อหมวดรายได้" ]
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
				width: 130, 
				fieldLabel : "fieldLabel",
				emptyText : 'คำที่ต้องการค้าหา',
			}
			,' ', '-', {
				text : "ค้นหา",
				iconCls: 'icon-magnifier',
				handler : function() {  
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
			} ,' ', '-'],
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
					{ id: 'c_name', header: "ประเภทรายได้", width:210, sortable: true, dataIndex: 'c_name' },
					{ header: "กลุ่มรายได้", sortable:true, width:210, dataIndex: 'dc_product_group_name'},
					{ header: "หมวดรายได้", sortable:true, width:210, dataIndex: 'dc_product_class_name'},
					{ header: "กลุ่มข้อมูลสำหรับรายงานลูกหนี้", sortable:true, width:200, hidden:true, dataIndex: 'class_type_name'},
					{
						header: "คิดคอมมิชชัน",  
						sortable:false,
						align: 'center',
						renderer: function(value, metaData, record, row, col, store, gridView){
								var i_enable = record.get('i_is_comm'); 
								if(i_enable==1){
									return '<img src="../images/icons/yes.gif");/>';
								}else{
									return '<img src="../images/icons/no.gif");/>'; 
								}
							} 
					},
					{
						header: "Status",  
						sortable:false,
						align: 'center',
						renderer: function(value, metaData, record, row, col, store, gridView){
								var i_enable = record.get('i_enable'); 
								if(i_enable==1){
									return '<img src="../images/icons/yes.gif");/>';
								}else{
									return '<img src="../images/icons/no.gif");/>'; 
								}
							} 
					},
					],
	
//		autoExpandColumn: 'c_name',
		bbar: new Ext.PagingToolbar({
			pageSize: 20,
			store: store,
			displayInfo: true,
			displayMsg: 'Displaying topics {0} - {1} of {2}'
		})
	};

	/*====================== End Tabs ====================*/
 
	var panelForm = {
		region: 'center',
		title: 'ข้อมูลประเภทรายได้',
		xtype: 'panel',
		id:'tabpanel2',
		border: false,
		disabled: true,
		stripeRows: true,
		loadMask: true,
		store: store, 
        items: [
		{
			xtype: 'form',
			id: 'form-widgets',
			url:'api/mnDcProductType.php',
			frame: true,
			labelWidth: 200,
			bodyStyle: { padding: '10px 20px' },
			defaults: {
				anchor: '80%',
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
				id: "dc_product_class_id",
				name: "dc_product_class_id",
				readOnly: true 
			}, {				
				xtype : "hidden",
				id: "i_group_type",
				name: "i_group_type",
				
				readOnly: true
			}, {				
				xtype : "hidden",
				id: "i_class_type",
				name: "i_class_type", 
				readOnly: true
			}, {
				xtype: 'textfield',
				fieldLabel: 'รหัส',
				name : 'c_code',
				anchor: '45%',
				readOnly: true
			}, {
				xtype: 'textfield',
				fieldLabel: 'ประเภทรายได้',
				name : 'c_name',
				anchor: '60%',
				validator: function(val) {
	        		if (!Ext.isEmpty(val)){ return true; } else {
	        			return "กรุณา กรอกประเภทรายได้ ";
	        		}
	        	},
			}, {xtype: 'radiogroup',
				id:'region_type',
				columns: [80,100,100],
				items: [
					{ boxLabel:Ext.AR_PROCUT_TEXT_OTHER,  name: 'region_type', inputValue: Ext.AR_PROCUT_TYPE_OTHER },
					{ boxLabel:Ext.AR_PROCUT_TEXT_CENTER, name: 'region_type', checked: true, inputValue: Ext.AR_PROCUT_TYPE_CENTER },
					{ boxLabel:Ext.AR_PROCUT_TEXT_REGION, name: 'region_type', inputValue: Ext.AR_PROCUT_TYPE_REGION },
				],			
			}, { 
				xtype: 'combo',
				fieldLabel: 'กลุ่มรายได้',
				id: 'dc_product_groupID',
    			store: storeGroup,
    			width: 300,
    			valueField: 'id',
    			displayField: 'c_name',
    			submitValue : true,
				hiddenName : 'dc_product_group_id',
    			mode: "local",
    			triggerAction: "all",
    			emptyText: "--- เลือกกลุ่มรายได้ ---",
				forceSelection: true,
				selectOnFocus: true,
				validator: function(val) {
	        		if (!Ext.isEmpty(val)){ return true; } else {
	        			return "กรุณาเลือกกลุ่มรายได้";
	        		}
	        	},
	        	listeners: { 
					select: function(combo, record, index) {
			 
						
						Ext.getCmp('dc_product_class_id').setValue(record.data.dc_product_class_id);
						Ext.getCmp('i_group_type').setValue(record.data.i_group_type); 
						Ext.getCmp('i_class_type').setValue(record.data.i_class_type); 
						
					}
	        	},
			}, {
				
				xtype: 'combo',
				fieldLabel: 'ศูนย์ต้นทุนทางบัญชี  ',
				id: 'dc_costID',
    			store: storeCost,
    			width: 300,
    			valueField: 'id',
    			displayField: 'c_name',
    			submitValue : true,
				hiddenName : 'dc_cost_id',
    			mode: "local",
    			triggerAction: "all",
    			emptyText: "--- ศูนย์ต้นทุนทางบัญชี  ---",
				forceSelection: true,
				selectOnFocus: true,
				validator: function(val) {
	        		if (!Ext.isEmpty(val)){ return true; } else {
	        			return "กรุณาเลือกศูนย์ต้นทุนทางบัญชี ";
	        		}
	        	},
	        	listeners: { 
					select: function(combo, record, index) {
						var newValue = record.data.id; 
					}
	        	}, 
			}, {
				xtype: 'radiogroup',
				fieldLabel: 'คิดค่าคอมมิชชั่น',
				id:'i_is_comm',
				columns: [120,100],
				items: [
				    { boxLabel: 'ไม่คิดค่าคอมมิชชั่น', checked: true, name: 'i_is_comm', inputValue: '2'},
					{ boxLabel: 'คิดค่าคอมมิชชั่น', name: 'i_is_comm', inputValue: '1' },
					
				]
			}, {
				xtype: 'textfield',
				fieldLabel: 'หมายเหตุ',
				name : 'c_comment',
				anchor: '80%',
			}, {
				fieldLabel: 'สถานะการใช้งาน',
				xtype: 'radiogroup',
				columns: [80,100],
				items: [
					{ boxLabel: 'ใช้งาน', checked: true, name: 'i_enable', inputValue: '1' },
					{ boxLabel: 'ไม่ใช้งาน', name: 'i_enable', inputValue: '2' }
				]
			}],
			buttons: [{
				text : Ext.GLOBAL_BU_SAVE_TH,
				id:'buSave',
				handler : function() {
					var form = Ext.getCmp("form-widgets").getForm();
					
//					Ext.getCmp('dc_product_class_id').setValue(Ext.dc_product_class_id);
//					Ext.getCmp('i_group_type').setValue(Ext.i_group_type); 
//					Ext.getCmp('i_class_type').setValue(Ext.i_class_type); 
			 	
					if (form.isValid()){ 
						form.submit({
							waitMsg:'Saving Data...',
							baseParams:{},
							success : function(form, action) { 
								
								Ext.getCmp('tabpanel1').getStore().reload();
								Ext.getCmp('contenterCenter').setActiveTab('tabpanel1');
								Ext.getCmp('tabpanel2').setDisabled(true);
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
			}, {
				text: 'Cancel',
				handler: function() {
					Ext.getCmp('contenterCenter').setActiveTab('tabpanel1');
					Ext.getCmp('tabpanel2').setDisabled(true);
					Ext.getCmp('buSave').setDisabled(false);
				}
			}]
		}]
	};
	
	/* View */
	new Ext.Viewport({
		layout: 'border',
		items: [  new Ext.TabPanel({
			region: 'center',
			border: false,
			activeTab: 1, //default Tab
			id:'contenterCenter',
			defaults:{autoScroll:true}, 
			items: [gridMain, panelForm], 
			listeners: { 'tabchange' : function (panel, tab) { /* Action */ }
			}
		}) ]
	});
	/* Event ,Handler */
	Ext.getCmp('tabpanel1').on('cellclick', cellClick, this);
	Ext.getCmp('contenterCenter').setActiveTab('tabpanel1'); 
	InfoMainGrid('tabpanel1',true,true,true,true,true,true);
});