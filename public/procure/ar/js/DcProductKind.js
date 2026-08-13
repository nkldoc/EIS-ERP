
	function cellClick(grid, rowIndex, columnIndex, e) { 
		var record = grid.getStore().getAt(rowIndex); 
		if (columnIndex==grid.getColumnModel().getIndexById('edit')) {
			Ext.getCmp("role-form-mode").setValue("EDIT");
			Ext.getCmp('tabpanel2').setDisabled(false);
			Ext.getCmp('contenterCenter').setActiveTab('tabpanel2');
			Ext.getCmp("form-widgets").getForm().loadRecord(record);
			
			Ext.storeDtl.setBaseParam("id",record.data.id);
			Ext.storeDtl.load();
			
		} else if (columnIndex==grid.getColumnModel().getIndexById('view')) {
			Ext.getCmp("role-form-mode").setValue("EDIT");
			Ext.getCmp('buSave').setDisabled(true);
			Ext.getCmp('tabpanel2').setDisabled(false);
			Ext.getCmp('contenterCenter').setActiveTab('tabpanel2');
			Ext.getCmp("form-widgets").getForm().loadRecord(record);
			
			Ext.storeDtl.setBaseParam("id",record.data.id); 
			Ext.storeDtl.load();
			
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
								url : 'api/mnDcProductKind.php' , 
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
Ext.storeDtl = new Ext.data.JsonStore({
	storeId: 'myStoreAcc',
    autoDestroy: true,
	autoLoad: true,
    url : 'api/ListDcProductKindUI.php',
    root: 'data', 
    idProperty: 'id',
    baseParams : {mode: "listGrid", id:0},
	totalProperty: 'totalCount',
	fields: [
			{ name: 'no' },
			{ name: 'id' },
			{ name: 'c_code',  },
			{ name: 'c_name',   }, 
			{ name: 'i_chk',   }, 
		]
	});

	setChecked = function(v,row,col,ss){
		Ext.storePermissionRight.data.items[row].data[ss] = v; 
	} 
	
	i_showFunc = function(value, metaData, record, row, col, store, gridView){  
		Ext.storePermissionRight = store;
		metaData.attr = "style='text-align:center';";
	 	return '<label><div><input onclick="setChecked(this.checked,'+row+','+col+',\'i_chk\')" type="checkbox" '+((value)?'checked':'')+'>';
	}
	 
	var store = new Ext.data.JsonStore({
	storeId: 'myStore',
    autoDestroy: true,
	autoLoad: true,
    url : 'api/ListDcProductKind.php',
    root: 'data',
    baseParams: { i_read:user_right_read }, //Permission i_read
    idProperty: 'id',
	totalProperty: 'totalCount',
	fields: [
		{ name: 'no' },
		{ name: 'id' }, 		
		{ name: 'c_code',  },   
		{ name: 'c_name',  },   
		{ name: 'i_enable',  },   
		{ name:'dc_user_create_id' },
     	{ name:'dc_user_create_cost_id' },
     	{ name:'d_create' },
     	{ name:'dc_user_update_id' },
     	{ name:'dc_user_update_cost_id' },
     	{ name:'d_update' },
	]
	});
 
	/*====================== TabShow Intelization ======================*/
	/* Grid */
	var gridMain = {
		region: 'center',
		title: 'แสดงข้อมูลชนิดรายได้',
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
 
					Ext.storeDtl.setBaseParam("id",'0'); 
					Ext.storeDtl.setBaseParam("hdrid",'0'); 
					Ext.storeDtl.load();
				}
			},{
				xtype : 'tbfill'  
			},'  ', ' ', '-', {
				id 		  : "filter",
                xtype     : 'combo',
                width     : 200,
				mode	  : 'local',
                store     : new Ext.data.SimpleStore({
							  fields: [ "value", "text" ],
							  data: [ 
										[ 'c_code', "รหัส"],
										[ 'c_name', "ชื่อชนิดรายได้"],
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
					{ header: "รหัส", sortable: true, dataIndex: 'c_code' }, 
					{ header: "ชนิดรายได้", sortable: true, dataIndex: 'c_name', id: 'c_name',  }, 
 
					],
	
		autoExpandColumn: 'c_name',
		bbar: new Ext.PagingToolbar({
			pageSize: 20,
			store: store,
			displayInfo: true,
			displayMsg: 'Displaying topics {0} - {1} of {2}'
		})
	};
	
	
	
	/*====================== End Tabs ====================*/
	/* Form */
	var panelForm = {
		region: 'center',
		title: 'ข้อมูลชนิดรายได้',
		xtype: 'panel',
		id:'tabpanel2',   
		border: false,
		disabled: true,
		stripeRows: true,
		loadMask: true,
		store: store,  
        labelAlign: 'left',
        layout: 'column',
        items: [
		{
			xtype: 'form',
			id: 'form-widgets',
			url:'api/mnDcProductKind.php',
//			frame: true,
			border: false,
			labelWidth: 200,
			columnWidth: 0.5,
			height:450,
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
				fieldLabel: 'รหัสชนิดรายได้',
				xtype : "textfield",
				name: "c_code",
				readOnly: true
			}, {
				fieldLabel: 'ชื่อชนิดรายได้',
				xtype: 'textfield',
				name: 'c_name',
	        	validator: function(val) {
	        		if (!Ext.isEmpty(val)) {
	        			return true; 
	        		} else {
	        			return "กรุณากรอก ชื่อชนิดรายได้";
	        		}
	        	},
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
					if (form.isValid()){  //
						form.submit({
							waitMsg:'Saving Data...',
							params: {   
								jsonDtl : saveGrid(Ext.storeDtl), 
							},
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
					Ext.getCmp('contenterCenter').setActiveTab('tabpanel1');
					Ext.getCmp('tabpanel2').setDisabled(true);
					Ext.getCmp('buSave').setDisabled(false);
				}
			}]
		},{ 
			columnWidth: 0.5,
			height:450,
            layout: 'fit',
            store: Ext.storeDtl,
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
				{ header: "-",  width:55, dataIndex: 'i_chk',
				  renderer:i_showFunc 
				},
				{ header: "รหัสประเภทรายได้", width:100, sortable: true, dataIndex: 'c_code' },
				{ header: "ประเภทรายได้", width:155, sortable: true, dataIndex: 'c_name',id:'c_name' }, 
				],
				autoExpandColumn: 'c_name',
//            items:gridMain,
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
	InfoMainGrid('tabpanel1',true,true,true,false,false,false);
});