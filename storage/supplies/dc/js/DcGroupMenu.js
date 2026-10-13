//===================== Function
//jsondata Dtl
function saveGrid(stores) {
	var jsonData = "";
	for (i = 0; i < stores.getCount(); i++) {
		record = stores.getAt(i);
		jsonData += Ext.util.JSON.encode(record.data) + ",";
	}
	if (jsonData.length > 1) {
		jsonData = jsonData.substring(0, jsonData.length - 1);
	}
	return "[" + jsonData + "]";
}

setChecked = function (v, row, col, ss) {
	Ext.storePermissionRight.data.items[row].data[ss] = v;
}
i_showFunc = function (value, metaData, record, row, col, store, gridView) {
	Ext.storePermissionRight = store;
	return '<label><div><input onclick="setChecked(this.checked,' + row + ',' + col + ',\'i_show\')" type="checkbox" ' + ((value) ? 'checked' : '') + '>';
}

i_read_selfFunc = function (value, metaData, record, row, col, store, gridView) {
	var isLeaf = store.getAt(row).data['_is_leaf'];
	if (!isLeaf) return "";
	else
		return '<label><div><input onclick="setChecked(this.checked,' + row + ',' + col + ',\'i_read_self\')" type="checkbox" ' + ((value) ? 'checked' : '') + '>';
}

i_read_costFunc = function (value, metaData, record, row, col, store, gridView) {
	var isLeaf = store.getAt(row).data['_is_leaf'];
	if (!isLeaf) return "";
	else
		return '<label><div><input onclick="setChecked(this.checked,' + row + ',' + col + ',\'i_read_cost\')" type="checkbox" ' + ((value) ? 'checked' : '') + '>';
}
i_read_allFunc = function (value, metaData, record, row, col, store, gridView) {
	var isLeaf = store.getAt(row).data['_is_leaf'];
	if (!isLeaf) return "";
	else
		return '<label><div><input onclick="setChecked(this.checked,' + row + ',' + col + ',\'i_read_all\')" type="checkbox" ' + ((value) ? 'checked' : '') + '>';
}
i_per_addFunc = function (value, metaData, record, row, col, store, gridView) {
	var isLeaf = store.getAt(row).data['_is_leaf'];
	if (!isLeaf) return "";
	else
		return '<label><div><input onclick="setChecked(this.checked,' + row + ',' + col + ',\'i_per_add\')" type="checkbox" ' + ((value) ? 'checked' : '') + '>';
}
i_per_updateFunc = function (value, metaData, record, row, col, store, gridView) {
	var isLeaf = store.getAt(row).data['_is_leaf'];
	if (!isLeaf) return "";
	else
		return '<label><div><input onclick="setChecked(this.checked,' + row + ',' + col + ',\'i_per_update\')" type="checkbox" ' + ((value) ? 'checked' : '') + '>';
}
i_per_deleteFunc = function (value, metaData, record, row, col, store, gridView) {
	var isLeaf = store.getAt(row).data['_is_leaf'];
	if (!isLeaf) return "";
	else
		return '<label><div><input onclick="setChecked(this.checked,' + row + ',' + col + ',\'i_per_delete\')" type="checkbox" ' + ((value) ? 'checked' : '') + '>';
}

//=============== OnLoad
Ext.onReady(function () {
	Ext.QuickTips.init();

	// create the data store
	var record = Ext.data.Record.create([{
			name: 'dc_menu_id',
			type: 'int'
		},
		{
			name: 'menu'
		},
		{
			name: 'i_show',
			type: 'bool'
		},
		{
			name: 'i_read_self',
			type: 'bool'
		},
		{
			name: 'i_read_cost',
			type: 'bool'
		},
		{
			name: 'i_read_all',
			type: 'bool'
		},
		{
			name: 'i_per_add',
			type: 'bool'
		},
		{
			name: 'i_per_update',
			type: 'bool'
		},
		{
			name: 'i_per_delete',
			type: 'bool'
		},
		{
			name: '_id',
			type: 'int'
		},
		{
			name: '_level',
			type: 'int'
		},
		{
			name: '_lft',
			type: 'int'
		},
		{
			name: '_rgt',
			type: 'int'
		},
		{
			name: '_is_leaf',
			type: 'bool'
		},
	]);

	var storePermission = new Ext.ux.maximgb.tg.NestedSetStore({
		autoLoad: true,
		storeId: 'storePermission',
		url: 'api/mnDcGroupMenu.php?mode=right',

		reader: new Ext.data.JsonReader({
				id: '_id',
				root: 'data',
				totalProperty: 'total',
				successProperty: 'success'
			},
			record),
	});

	var store = new Ext.data.JsonStore({
		storeId: 'myStore',
		autoDestroy: true,
		autoLoad: true,
		url: 'api/ListDcGroupMenu.php',
		root: 'data',
		idProperty: 'id',
		totalProperty: 'totalCount',
		fields: [{
				name: 'no',
				type: 'int'
			},
			{
				name: 'id'
			},
			{
				name: 'c_code'
			},
			{
				name: 'c_name'
			},
			{
				name: 'c_comment'
			},
			{
				name: 'i_enable'
			},
			{
				name: 'i_per_delete'
			},
			{
				name: 'dc_user_create_id'
			},
			{
				name: 'dc_user_create_cost_id'
			},
			{
				name: 'd_create'
			},
			{
				name: 'dc_user_update_id'
			},
			{
				name: 'dc_user_update_cost_id'
			},
			{
				name: 'd_update'
			},

		]
	});

	/*====================== TabShow Intelization ======================*/
	var gridMain = {
		region: 'center',
		title: 'แสดงข้อมูลกลุ่มการใช้งานระบบ',
		xtype: 'grid',
		id: 'tabpanel1',
		border: false,
		stripeRows: true,
		loadMask: true,
		store: store,
		tbar: [{
			text: 'เพิ่มข้อมูล',
			id: 'buAdd',
			iconCls: 'icon-add',
			disabled: user_right_add ? false : true,
			handler: function (grid, rowIndex, colIndex) {
				Ext.getCmp("role-form-mode").setValue("ADD");
				Ext.getCmp('tabpanel2').setDisabled(false);
				Ext.getCmp('buSave').setDisabled(false); //if add then save
				Ext.getCmp('contenterCenter').setActiveTab('tabpanel2');
				Ext.getCmp('form-widgets').getForm().reset();

				storePermission.setBaseParam("id", 0);
				storePermission.load();
			}
		}, {
			xtype: 'tbfill'
		}, '', '', '-', {
			id: "filter",
			xtype: 'combo',
			width: 180,
			mode: 'local',
			store: new Ext.data.SimpleStore({
				fields: ["value", "text"],
				data: [
					['c_code', "รหัสกลุ่มการใช้งานระบบ"],
					['c_name', "ชื่อกลุ่มการใช้งานระบบ"],
				]
			}),
			valueField: "value",
			displayField: "text",
			allowBlank: false,
			editable: false,
			triggerAction: "all",
			typeAhead: false,
			emptyText: "เลือกตัวกรอง",
		}, '-', {
			id: "value-box",
			xtype: "textfield",
			width: 130,
			fieldLabel: "fieldLabel",
			emptyText: 'คำที่ต้องการค้าหา',
		}, '', '-', {
			text: "ค้นหา",
			iconCls: 'icon-magnifier',
			handler: function () {

				if (Ext.getCmp("value-box").getValue() ||
					Ext.getCmp("start-date").getValue() ||
					Ext.getCmp("end-date").getValue()) {
					store.setBaseParam("mode", "SEARCH");
					store.setBaseParam("filter", Ext.getCmp("filter").getValue());
					store.setBaseParam("value", Ext.getCmp("value-box").getValue());
					Ext.getCmp('tabpanel1').getStore().load();
				} else {
					store.setBaseParam("mode", "");
					Ext.getCmp('tabpanel1').getStore().load();
				}
			}
		}],
		columns: [new Ext.grid.RowNumberer({
				width: 35,
				header: " No ",
				renderer: function (value, metaData, record, row, col, store, gridView) {
					return record.get('no');
				}
			}),
			{
				header: "ID System",
				sortable: true,
				hidden: true,
				dataIndex: 'id'
			},
			{
				header: "รหัสกลุ่มการใช้งานระบบ",
				sortable: true,
				dataIndex: 'c_code'
			},
			{
				id: 'c_name',
				header: "ชื่อกลุ่มการใช้งานระบบ",
				sortable: true,
				dataIndex: 'c_name'
			},
			{
				header: "Status",
				sortable: false,
				width: 50,
				align: 'center',
				renderer: function (value, metaData, record, row, col, store, gridView) {
					var i_enable = record.get('i_enable');
					if (i_enable == 1) {
						return '<img src="../images/icons/yes.gif");/>';
					} else {
						return '<img src="../images/icons/no.gif");/>';
					}
				}
			},

		],

		autoExpandColumn: 'c_name',
		bbar: new Ext.PagingToolbar({
			pageSize: 20,
			store: store,
			displayInfo: true,
			displayMsg: 'Displaying topics {0} - {1} of {2}'
		})
	};

	function cellClick(grid, rowIndex, columnIndex, e) {

		var record = grid.getStore().getAt(rowIndex);
		if (columnIndex == grid.getColumnModel().getIndexById('view')) {
			Ext.getCmp("role-form-mode").setValue("EDIT");
			Ext.getCmp('buSave').setDisabled(true);
			Ext.getCmp('tabpanel2').setDisabled(false);
			Ext.getCmp('contenterCenter').setActiveTab('tabpanel2');
			Ext.getCmp("form-widgets").getForm().loadRecord(record);

			storePermission.setBaseParam("id", record.get('id'));
			storePermission.load();
		} else if (columnIndex == grid.getColumnModel().getIndexById('edit')) {
			Ext.getCmp("role-form-mode").setValue("EDIT");
			Ext.getCmp('buSave').setDisabled(false);
			Ext.getCmp('tabpanel2').setDisabled(false);
			Ext.getCmp('contenterCenter').setActiveTab('tabpanel2');
			Ext.getCmp("form-widgets").getForm().loadRecord(record);

			storePermission.setBaseParam("id", record.get('id'));
			storePermission.load();

		} else if (columnIndex == grid.getColumnModel().getIndexById('remove')) {
			var win = new Ext.Window({
				id: "win-msg-delete",
				title: "Remove",
				modal: true,
				width: 250,
				height: 130,
				html: "ท่านต้องการที่จะลบข้อมูล ?",
				buttons: [{
						text: "Confirm",
						handler: function () {
							Ext.Ajax.request({
								url: 'api/mnDcGroupMenu.php',
								params: {
									mode: 'DELETE',
									id: record.get('id'),
								},
								method: 'GET', //POST
								success: function (result, request) {
									var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
									if (jsonData.success) {
										//Ext.MessageBox.alert('Success', jsonData.msg);			// alert massage success
									} else {
										Ext.MessageBox.alert('Failed', jsonData.msg); // alert massage error
									}
									Ext.getCmp("win-msg-delete").hide(); // hidden window-panel
									Ext.getCmp("win-msg-delete").destroy(); // clear memory :: garbage collection
									Ext.getCmp('tabpanel1').getStore().reload(); // reload grid & store
									Ext.getCmp('tabpanel2').setDisabled(true);
								},
								failure: function (result, request) {
									Ext.MessageBox.alert('Failed', result.responseText); // connect error
								}
							});
						}
					},
					{
						text: "Cancel",
						handler: function () {
							Ext.getCmp("win-msg-delete").hide();
							Ext.getCmp("win-msg-delete").destroy();
							Ext.getCmp('tabpanel1').getStore().reload();
						}
					}
				]
			}).show();
		}
	}
	/*====================== End Tabs ====================*/
	var panelForm = {
		region: 'center',
		title: 'ข้อมูลกลุ่มการใช้งานระบบ',
		xtype: 'panel',
		id: 'tabpanel2',
		border: false,
		disabled: true,
		stripeRows: true,
		loadMask: true,
		store: store,
		items: [{
			xtype: 'form',
			id: 'form-widgets',
			url: 'api/mnDcGroupMenu.php',
			frame: true,
			labelWidth: 200,
			bodyStyle: {
				padding: '10px 20px'
			},
			defaults: {
				anchor: '100%',
				msgTarget: 'side',
			},
			items: [{
					id: "role-form-mode",
					xtype: "hidden",
					name: "mode",
					readOnly: true
				}, {
					xtype: "hidden",
					name: "id",
					readOnly: true
				}, {
					fieldLabel: 'รหัสกลุ่มการใช้งานระบบ',
					xtype: 'textfield',
					name: 'c_code',
					allowBlank: false
				}, {
					fieldLabel: 'ชื่อกลุ่มการใช้งานระบบ',
					xtype: 'textfield',
					name: 'c_name'
				}, {
					fieldLabel: 'คำอธิบายเพิ่มเติม',
					xtype: 'textfield',
					name: 'c_comment',
				}, {
					fieldLabel: 'สถานะการใช้งานกกก',
					xtype: 'radiogroup',
					columns: [80, 100],
					items: [{
							boxLabel: 'ใช้งาน',
							checked: true,
							name: 'i_enable',
							inputValue: '1'
						},
						{
							boxLabel: 'ไม่ใช้งาน',
							name: 'i_enable',
							inputValue: '2'
						}
					]
				}
				/*,
								 {
												fieldLabel: 'อัพเดทยูสเซอร์เมนูทั้งหมดในกลุ่ม',
												xtype: 'button',
												name: 'updateUserGroup',
												text: '<----------[ อัพเดทยูสเซอร์เมนู ]---------->',
												handler: function () {
													var form = Ext.getCmp("form-widgets").getForm();
													//url: 'api/mnDcUser.php',
													Ext.getCmp("role-form-mode").setValue("UpdateGroupMenu");
													if (form.isValid()) {
														form.submit({
															url: 'api/mnDcUser.php',
															params: {
																jsonDtl: saveGrid(storePermission),
															},
															success: function (form, action) {
																Ext.getCmp("role-form-mode").setValue();
																Ext.getCmp('tabpanel1').getStore().reload();
																Ext.getCmp('contenterCenter').setActiveTab('tabpanel1');
																Ext.getCmp('tabpanel2').setDisabled(true);
															},
															failure: function (form, action) {
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
													} else {
														Ext.Msg.alert('Failure', "Failure");
													}
												}

											}*/
				,
				new Ext.ux.maximgb.tg.GridPanel({
					store: storePermission,
					id: 'gridPermission',
					master_column_id: 'menu',
					height: 450,
					deferRowRender: false,

					cm: new Ext.grid.ColumnModel({
						defaults: {
							width: 120,
							sortable: true,
						},
						columns: [{
							id: 'menu',
							header: "MENU",
							width: 360,
							sortable: true,
							dataIndex: 'menu',
						}, {

							header: 'แสดง',
							align: 'center',
							width: 125,
							sortable: true,
							id: 'i_show',
							dataIndex: 'i_show',
							renderer: i_showFunc,
						}, {

							header: 'ดูข้อมูลตัวเอง',
							width: 125,
							align: 'center',
							sortable: true,
							id: 'i_read_self',
							dataIndex: 'i_read_self',
							renderer: i_read_selfFunc,
						}, {

							header: 'ดูข้อมูลตามหน่วยงาน',
							width: 125,
							align: 'center',
							sortable: true,
							id: 'i_read_cost',
							dataIndex: 'i_read_cost',
							renderer: i_read_costFunc,
						}, {

							header: 'ดูข้อมูลทั้งหมด',
							align: 'center',
							width: 125,
							sortable: true,
							id: 'i_read_all',
							dataIndex: 'i_read_all',
							renderer: i_read_allFunc,
						}, {
							header: 'เพิ่ม',
							align: 'center',
							width: 125,
							sortable: true,
							id: 'i_per_add',
							dataIndex: 'i_per_add',
							renderer: i_per_addFunc,
						}, {
							header: 'แก้ไข',
							align: 'center',
							width: 125,
							sortable: true,
							id: 'i_per_update',
							dataIndex: 'i_per_update',
							renderer: i_per_updateFunc,
						}, {

							header: 'ลบ',
							align: 'center',
							width: 125,
							sortable: true,
							id: 'i_per_delete',
							dataIndex: 'i_per_delete',
							renderer: i_per_deleteFunc,
						}],
					}),

					stripeRows: true,
					autoExpandColumn: 'menu',
					title: 'สิทธิ์ผู้ใช้งาน',
					viewConfig: {
						enableRowBody: true
					}
				})
			],
			buttons: [{
				text: Ext.GLOBAL_BU_SAVE_TH,
				id: 'buSave',
				handler: function () {
					var form = Ext.getCmp("form-widgets").getForm();
					Ext.getCmp("role-form-mode").setValue("Save");
					if (form.isValid()) {
						form.submit({
							params: {
								jsonDtl: saveGrid(storePermission),
							},
							success: function (form, action) {
								Ext.getCmp("role-form-mode").setValue();
								Ext.getCmp('tabpanel1').getStore().reload();
								Ext.getCmp('contenterCenter').setActiveTab('tabpanel1');
								Ext.getCmp('tabpanel2').setDisabled(true);
							},
							failure: function (form, action) {
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
					} else {
						Ext.Msg.alert('Failure', "Failure");
					}
				}
			}, {
				text: 'Cancel',
				handler: function () {
					Ext.getCmp('contenterCenter').setActiveTab('tabpanel1');
					Ext.getCmp('tabpanel2').setDisabled(true);
				}
			}]
		}]
	}
	Ext.showLoadingMask();
	/*====================== Render ======================*/
	new Ext.Viewport({
		layout: 'border',
		items: [new Ext.TabPanel({
			region: 'center',
			border: false,
			activeTab: 1, //default Tab
			id: 'contenterCenter',
			defaults: {
				autoScroll: true
			},
			items: [gridMain, panelForm],
			listeners: {
				'tabchange': function (panel, tab) {
					console.log(panel.getActiveTab().id); //GET Event ID Tab
				}
			}
		})]
	});

	/*====================== Event ,Handler ======================*/
	Ext.getCmp('tabpanel1').on('cellclick', cellClick, this);
	Ext.getCmp('contenterCenter').setActiveTab('tabpanel1');
	InfoMainGrid('tabpanel1', true, true, true, true, true, true);
	storePermission.on("load", function (e) {
		storePermission.expandAll();
	});
});