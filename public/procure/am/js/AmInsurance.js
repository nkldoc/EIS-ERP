function defaultDate(typeStartDate)
{
	var day = new Date();
	var dd = day.getDate();
	var mm = day.getMonth()+1;
	var yy = day.getFullYear()+543;
	
	if (typeStartDate==1) // วันที่ของเดือน
	{
		dd = "01";
		mm = "0"+mm.toString();
	}
	else if (typeStartDate==2) // วันที่สุดท้ายของเดือนทีแล้ว
	{
		mm--;
		var nDate = new Date(day.getFullYear(), mm, 0);
		
		dd = nDate.getDate();
		dd = "0"+dd.toString();
		mm = nDate.getMonth()+1;
		mm = "0"+mm.toString();
		yy = nDate.getFullYear()+543;
	}
	else
	{
		dd = "0"+dd.toString();
		mm = "0"+mm.toString();
	}
	return dd.substr(-2)+"-"+mm.substr(-2)+"-"+yy.toString();
}

function checkAll(ele) {
	for(var i=1; i<Ext.objChk.length; i++){
		var ind = Ext.objChk[i];
		if (ind != '')
		{
			document.getElementById(ind).checked = ele;
		}
	}
}

Ext.onReady(function() {
	Ext.QuickTips.init();
	Ext.objChk = [];
	/*===============================================*/
	var title_panel = "ประกันภัย";
	/*===============================================*/
	
	var storeMain = new Ext.data.JsonStore({
		storeId: 'myStore',
	    autoDestroy: true,
		autoLoad: true,
	    url : 'api/ListAmInsurance.php',
	    root: 'data',
	    baseParams: { type: "HDR", i_read:user_right_read }, //Permission i_read
	    idProperty: 'id',
		totalProperty: 'totalCount',
		fields: [
			{ name: 'no' },
			{ name: 'id' },
			{ name: 'c_code' },
			{ name: 'dc_building_id' },
			{ name: 'building_code' },
			{ name: 'building_name' },
			{ name: 'dc_ins_town_hdr_id' },
			{ name: 'ins_town_name' },
			{ name: 'i_is_method' },
			{ name: 'method_name' },
			{ name: 'd_doc_date' },
			{ name: 'str_date' },
			{ name: 'd_start_ins' },
			{ name: 'str_start_date' },
			{ name: 'price_at_date' },
			{ name: 'str_at_date' },
			{ name: 'c_comment' },
			{ name: 'i_enable' },
			{ name: 'dc_user_create_id' },
	     	{ name: 'dc_user_create_cost_id' },
	     	{ name: 'd_create' },
	     	{ name: 'dc_user_update_id' },
	     	{ name: 'dc_user_update_cost_id' },
	     	{ name: 'd_update' }
		]
	});
	
	var store_dtl = new Ext.data.JsonStore({
	    url : 'api/ListAmInsurance.php',
	    root: 'data',
	    baseParams: { type: "DTL", i_read:user_right_read },
	    idProperty: 'id',
		totalProperty: 'totalCount',
		fields: [
				{ name : "no" },
				{ name : "rowNumber" },
				{ name : "id" },
				{ name : "c_code" },
				{ name : "c_name" },
				{ name : "c_brand" },
				{ name : "c_model" },
				{ name : "d_receive_date" },
				{ name : "ins_name" },
				{ name : "f_unit_cost" },
				{ name : "acc_cost" },
				{ name : "chk_dtl" },
				{ name : "i_type" }
		]
	});
	
	// pagingBar
	var pagingBar = new Ext.PagingToolbar({
		pageSize: 20,
		store: storeMain,
		displayInfo: true,
		displayMsg: 'Displaying topics {0} - {1} of {2}'
	});
	
	// Search Group
	// UI Search
	var storeBuildSearch	= new Ext.data.JsonStore({
		autoLoad: true,
		url: 'api/All_AmCombo.php',
		baseParams: {type : 'storeBuilding', add_all: 'ALL'},
		root: 'data',
		idProperty: 'id',
		totalProperty: 'totalCount',
	    fields: [ 'id','c_code', 'c_name']
	});
	
	Ext.PopBuildSearch = new Ext.ux.Poplov({ 
		text		: 'เลือกทั้งหมด',  
		id			: 's-dc_building_id',	//go to relation	
		iconCls		: 'page_magnify', 
		valueHidden : 'dc_building_id', 	//go to hidden
		store		: storeBuildSearch,
		headerGrid	: [{ header: "ID System", sortable: true, hidden:true, dataIndex: 'id' },
						{ header: "รหัส", sortable: true, dataIndex:'c_code' , },
						{ header: "ชื่อ"
							, sortable: true
							, id: 'c_name' 
							, dataIndex: 'c_name',
							renderer: function(value, metaData, record, rowIndex, colIndex, store) {
									metaData.attr = "style='cursor:pointer';";
								return value; 
							} 
						}],
		widthText	: 280,  
		fieldLabel	: 'กลุ่มอาคาร/สถานที่เอาประกัน',  
	});
	
	var storeInsTownSearch	= new Ext.data.JsonStore({
		autoLoad: true,
		url: 'api/All_AmCombo.php',
		baseParams: {type : 'storeInsTown', add_all: 'ALL'},
		root: 'data',
		idProperty: 'id',
		totalProperty: 'totalCount',
	    fields: [ 'id','c_code', 'c_name']
	});
	
	Ext.PopInsTownSearch = new Ext.ux.Poplov({ 
		text		: 'เลือกทั้งหมด',  
		id			: 's-dc_ins_town_hdr_id',	//go to relation	
		iconCls		: 'page_magnify', 
		valueHidden : 'dc_ins_town_hdr_id', 	//go to hidden
		isSetFilter : true,
		store		: storeInsTownSearch,
		headerGrid	: [{ header: "ID System", sortable: true, hidden:true, dataIndex: 'id' },
						{ header: "ชื่อ"
							, sortable: true
							, id: 'c_name' 
							, dataIndex: 'c_name',
							renderer: function(value, metaData, record, rowIndex, colIndex, store) {
									metaData.attr = "style='cursor:pointer';";
								return value; 
							} 
						}],
		isCellClickGrid : true,
		cellClickGrid : function(grid, rowIndex, columnIndex, e) { 
			 
			var record 		= grid.getStore().getAt(rowIndex);  
			var TextShow 	= record.data.c_name;
			
			Ext.getCmp('s-dc_ins_town_hdr_id').setValue(record.data.id);
			Ext.getCmp('s-dc_ins_town_hdr_id_Name').setValue(TextShow); 
			
			Ext.getCmp("win-pop-lovs-dc_ins_town_hdr_id").hide();  					
			Ext.getCmp("win-pop-lovs-dc_ins_town_hdr_id").destroy();  
			
		},
		widthText	: 280,  
		fieldLabel	: 'ชื่ออาคารและหน่วยงานในอาคาร',  
	});
	
	var storeMethodSearch	= new Ext.data.JsonStore({
		autoLoad: true,
		url: 'api/All_AmCombo.php',
		baseParams: {type : 'storeInsMethod', add_all: 'ALL'},
		root: 'data',
		idProperty: 'id',
		totalProperty: 'totalCount',
	    fields: [ 'id','c_code', 'c_name']
	});
	
	Ext.PopMethodSearch = new Ext.ux.Poplov({ 
		text		: 'เลือกทั้งหมด',  
		id			: 's-i_is_method',	//go to relation	
		iconCls		: 'page_magnify', 
		valueHidden : 'i_is_method', 	//go to hidden
		isSetFilter : true,
		store		: storeMethodSearch,
		headerGrid	: [{ header: "ID System", sortable: true, hidden:true, dataIndex: 'id' },
						{ header: "ชื่อ"
							, sortable: true
							, id: 'c_name' 
							, dataIndex: 'c_name',
							renderer: function(value, metaData, record, rowIndex, colIndex, store) {
									metaData.attr = "style='cursor:pointer';";
								return value; 
							} 
						}],
		isCellClickGrid : true,
		cellClickGrid : function(grid, rowIndex, columnIndex, e) { 
			 
			var record 		= grid.getStore().getAt(rowIndex);  
			var TextShow 	= record.data.c_name;
			
			Ext.getCmp('s-i_is_method').setValue(record.data.id);
			Ext.getCmp('s-i_is_method_Name').setValue(TextShow); 
			
			Ext.getCmp("win-pop-lovs-i_is_method").hide();  					
			Ext.getCmp("win-pop-lovs-i_is_method").destroy();  
			
		},
		widthText	: 280,  
		fieldLabel	: 'ประเภทการประกันภัย',  
	});
	
	var sGroup1 = [{ //lable
		xtype: 'displayfield',  
		value:'ค้นหาจากรหัสของรายการ  : ',
		cls: 'ui-label',  
	},{
		xtype: 'textfield', 
		id: 's-c_code',  
		width:140
    },{ //lable
		xtype: 'displayfield',  
		value:'สถานะ  : ',
		cls: 'ui-label',  
	},{
		id 		  : "s-enable",
        xtype     : 'combo',
        width     : 130,
		mode	  : 'local',
        store     : new Ext.data.SimpleStore({
					  fields: [ "value", "text" ],
					  data: [[ '0', "ทั้งหมด" ],
					         [ '1', "ใช้งาน" ],
					         [ '2', "ไม่ใช้งาน " ]
					  ]
					})
		,
		valueField: "value",
		displayField: "text",
		allowBlank : false,
		editable : false,
		triggerAction: "all",
		value : '0',
		typeAhead : false,
		emptyText : "เลือกตัวกรอง",
	},{ //lable
		xtype: 'displayfield',  
		value:'&nbsp;',
		cls: 'space-h',  
		calspan:2
	}];
	
	var sGroup2= [{ //lable
		xtype: 'displayfield',  
		value:'กลุ่มอาคาร/สถานที่เอาประกัน   : ',
		cls: 'ui-label',  
	},Ext.PopBuildSearch.mini
	,{ //lable
		xtype: 'displayfield',  
		value:'ชื่ออาคารและหน่วยงานในอาคาร   : ',
		cls: 'ui-label',  
	},Ext.PopInsTownSearch.mini
	,{ //lable
		xtype: 'displayfield',  
		value:'ประเภทการประกันภัย   : ',
		cls: 'ui-label',  
	},Ext.PopMethodSearch.mini];
	//End Search Group
	
	var gridMain = new Ext.grid.GridPanel({
		region: "center",
		layout: "fit",
		title: "แสดงรายการ"+title_panel,
		id: "tabpanel1",
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
			 columns: 2, 
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
							
							Ext.getCmp('icon-save').show();
							Ext.getCmp('GRID_DTL').hide();
							//buGencode
							Ext.getCmp('buGencodeID').hide();

							Ext.getCmp("frm-d_doc_date").setValue(defaultDate(3));
							Ext.getCmp("frm-d_start_ins").setValue(defaultDate(1));
							Ext.getCmp("frm-price_at_date").setValue(defaultDate(2));
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
									storeMain.setBaseParam("i_enable", Ext.getCmp("s-enable").getValue());
									storeMain.setBaseParam('dc_building_id',Ext.getCmp("s-dc_building_id").getValue());
									storeMain.setBaseParam('dc_ins_town_hdr_id',Ext.getCmp("s-dc_ins_town_hdr_id").getValue());
									storeMain.setBaseParam('i_is_method',Ext.getCmp("s-i_is_method").getValue());
									storeMain.load();
								}
					     },{
				                text: "เริ่มใหม่",
				                align: 'center',
				                iconCls: 'icon-reset',
				                handler: function() {
									Ext.getCmp("s-c_code").setValue('');
									Ext.getCmp("s-enable").setValue(0);
									Ext.PopBuildSearch.setReset(true);
									Ext.PopInsTownSearch.setReset(true);
									Ext.PopMethodSearch.setReset(true);
				                }
				            }]
				}],
		columns: [
		    new Ext.grid.RowNumberer({header:"ที่", width: 30,
				renderer: function(value, metaData, record, row, col, store, gridView) {
					return record.get("no");
				}
			}),
			{ header: "รหัสของรายการ", sortable: true, width:100, dataIndex: "c_code", align:'center' },
			{ header: "กลุ่มอาคาร/สถานที่เอาประกัน ", sortable: true, width:250, dataIndex: "building_name", id:'G-c_name'},
			{ header: "ชื่ออาคารและหน่วยงานในอาคาร", sortable: true, width:150, dataIndex: "ins_town_name"},
			{ header: "ประเภทการประกันภัย ", sortable: true, width: 120, dataIndex: "method_name" },
			{ header: "สถานะ ", sortable: true, width: 80, dataIndex: "i_enable", align:'center',
				renderer: function(value, metaData, record, row, col, store, gridView) {
					if(parseInt(value)== Ext.CONF_STATUS_ENABLE){
						return'<font color="blue">ใช้งาน</font>';
					}else{ 
						return'<font color="red">ไม่ใช้งาน</font>';
					} 	
				}
			},
		],
		autoExpandColumn: "G-c_name",
		bbar: pagingBar
	}); //gridMain

	function cellClick(grid, rowIndex, columnIndex, e) {
		var record = grid.getStore().getAt(rowIndex); 
		
		if (columnIndex == grid.getColumnModel().getIndexById('edit')) {
			
				Ext.getCmp('icon-save').show();
				Ext.getCmp('tabpanel2').setDisabled(false);
				Ext.getCmp('contenterCenter').setActiveTab('tabpanel2');
				Ext.getCmp('form-widgets').getForm().reset();
				Ext.getCmp("form-widgets").getForm().loadRecord(record);
				
				var strShow = record.get('building_code')+' '+record.get('building_name')
				Ext.getCmp('frm-dc_building_id').setValue(record.get('dc_building_id'));
				Ext.getCmp('frm-dc_building_id_Name').setValue(strShow);
				
				Ext.getCmp('frm-dc_ins_town_hdr_id').setValue(record.get('dc_ins_town_hdr_id'));
				Ext.getCmp('frm-dc_ins_town_hdr_id_Name').setValue(record.get('ins_town_name'));
				
				Ext.getCmp("role-form-mode").setValue("EDIT");
				
				//buGencode
				if (record.data.c_code == "none")
					Ext.getCmp('buGencodeID').show();
				else
					Ext.getCmp('buGencodeID').hide();
				
				Ext.getCmp('buAddDtl').show();
				Ext.getCmp('frmd-id').setValue(record.data.id);
				Ext.getCmp('frmd-dc_ins_town_hdr_id').setValue(record.data.dc_ins_town_hdr_id);
				Ext.getCmp('GRID_DTL').show();

				// Load Method
				store_dtl.setBaseParam("am_ins_hdr_id", record.data.id);
				store_dtl.setBaseParam("dc_ins_town_hdr_id", record.data.dc_ins_town_hdr_id);
				store_dtl.setBaseParam("type", "DTL");
				store_dtl.load();
			
		} else if (columnIndex==grid.getColumnModel().getIndexById('view')) {
			Ext.getCmp('icon-save').hide();
			Ext.getCmp('tabpanel2').setDisabled(false);
			Ext.getCmp('contenterCenter').setActiveTab('tabpanel2');
			Ext.getCmp('form-widgets').getForm().reset();
			Ext.getCmp("form-widgets").getForm().loadRecord(record);
			Ext.getCmp("role-form-mode").setValue("VIEW");
			
			var strShow = record.get('building_code')+' '+record.get('building_name')
			Ext.getCmp('frm-dc_building_id').setValue(record.get('dc_building_id'));
			Ext.getCmp('frm-dc_building_id_Name').setValue(strShow);
			
			Ext.getCmp('frm-dc_ins_town_hdr_id').setValue(record.get('dc_ins_town_hdr_id'));
			Ext.getCmp('frm-dc_ins_town_hdr_id_Name').setValue(record.get('ins_town_name'));
			
			//buGencode
			Ext.getCmp('buGencodeID').hide();
			Ext.getCmp('buAddDtl').hide();
			Ext.getCmp('frmd-id').setValue(record.data.id);
			Ext.getCmp('frmd-dc_ins_town_hdr_id').setValue(record.data.dc_ins_town_hdr_id);
			Ext.getCmp('GRID_DTL').show();
			
			// Load Method
			store_dtl.setBaseParam("am_ins_hdr_id", record.data.id);
			store_dtl.setBaseParam("dc_ins_town_hdr_id", record.data.dc_ins_town_hdr_id);
			store_dtl.setBaseParam("type", "DTL");
			store_dtl.load();
			
		} else if (columnIndex == grid.getColumnModel().getIndexById('remove')) {
			var win = new Ext.Window({
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
							url : 'api/mnAmInsurance.php' ,
							method: 'POST',
							params : { 
								mode : 'DELETE', 
								id : record.data.id
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
			}).show();
		}
	};
	
	Ext.objChk = [];
	var GRID_DTL = {
		id: "GRID_DTL",
		border: false,
		bodyStyle: { padding: '10px 20px' },
		defaults: { anchor: '100%', msgTarget: 'side', allowBlank: false },
		items: [{
        	xtype: 'form',
        	id: 'form-dtl',
        	url:'api/mnAmInsurance.php',
			//frame: true,
        	border: false,
			labelWidth: 200,
			bodyStyle: { padding: '10px 20px' },
			defaults: { anchor: '100%', msgTarget: 'side', allowBlank: false },
			items: [{				
				xtype : "hidden",
				id : 'frmd-id',
				name: "id",
				readOnly: true
			},{				
				xtype : "hidden",
				id : 'frmd-dc_ins_town_hdr_id',
				name: "dc_ins_town_hdr_id",
				readOnly: true
			},{				
				xtype : "hidden",
				id : 'frmd-mode',
				name: "mode",
				value: "INSERT_DTL",
				readOnly: true
			},{
				xtype: 'container',
				layout: 'hbox',
				align: 'stretch',
				defaults: { xtype: 'fieldset', flex:1, margins : '0px 3px', autoHeight: true },
				items: [{
					title: 'รายการสินทรัพย์',
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
									return 'second';
								} else if(record.get('i_type') == 5) {
									return 'first';
								} else if(record.get('i_type') == 6) {
									return 'fourth';
								} else if(record.get('i_type') == 7) {
									return 'third';
								}
							}
						},
						tbar: [{
							text : 'บันทึกรายการสินทรัพย์',
							id:'buAddDtl',
							iconCls: 'icon-add', 
							handler: function(grid, rowIndex, colIndex) {
								var form = Ext.getCmp("form-dtl").getForm();
								
								form.submit({
									waitMsg:'Saving Data...',
									success : function(form, action) { 
										var data = Ext.decode(action.response.responseText);
										if (data.success == "Error")
											Ext.MessageBox.alert('ผิดพลาด', data.msg);
										else
											store_dtl.load();
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
						}],
						columns: [
						          new Ext.grid.RowNumberer({
 									header: "<div class='topAlign'><input type='checkbox' id='chkAll' onclick='checkAll(this.checked)'></div>",
 									sortable: false,
 									align:'center',
 									id:'qty',
 									width:50,
 									dataIndex:'id' ,
 									renderer: function(value, metaData, record, row, col, store, gridView) {
 										
 										var i_type = record.get("i_type");
 										
 										if (parseInt(i_type) == 3 )
 										{
 											var chked = (parseInt(record.get('chk_dtl')) == 1)? "checked=true" : "";
 											Ext.objChk[record.get('rowNumber')] = 'chk_'+record.get('id');
 	 										
 	 										return '<input type="checkbox" id="chk_'+record.get('id')+'" '
 	 										+' value="'+record.get('id')+'" name="chk[]" '+chked+'/>';
 										}
 										else
 										{
 											var str = "";
 											Ext.objChk[record.get('rowNumber')] = '';
 											str = record.get('no');
 											
 											switch (parseInt(i_type))
											{
												case 1 : 
												case 2 : 
												case 7 : 
													metaData.attr = "style='width:500px; text-align:left; font-weight:bold;'";
												break;
											}
 											return str;
 										}
 									}
 								}),
 							{header: 'ลำดับที่', sortable: true, dataIndex: 'no',width:40, align: "center",
						        	  renderer: function(value, metaData, record, row, col, store, gridView) {
	 										
	 										var i_type = record.get("i_type");
	 										
	 										if (parseInt(i_type) != 3 )
	 											return '';
	 										else
	 											return value;
	 									}
 							},
							{header: 'รหัสสินทรัพย์', sortable: true, dataIndex: 'c_code', align: "center" },
							{header: 'รายการสินทรัพย์', sortable: true, dataIndex: 'c_name'},
							{header: 'ยี่ห้อ/Serial No', sortable: true, dataIndex: 'c_brand'},
							{header: 'รุ่น-แบบ ', sortable: true, dataIndex: 'c_model',
								renderer: function(value, metaData, record, row, col, store, gridView) {
										
									var i_type = record.get("i_type");
									switch (parseInt(i_type))
									{
										case 4 : 
										case 5 : 
										case 6 : 
											metaData.attr = "style='width:350px; font-weight:bold;'";
										break;
									}
									return value;
								}
							},
							{header: 'วันที่ได้มา', sortable: true, dataIndex: 'd_receive_date', align:"center"},
							{header: 'หมวดประกันภัย', sortable: true, dataIndex: 'ins_name'},
							{header: 'ราคาทุน', sortable: true, align: "right", dataIndex: 'f_unit_cost', renderer: floatRenderer},
							{header: 'ราคาตามบัญชี', sortable: true, align: "right", dataIndex: 'acc_cost', renderer: floatRenderer},
							{header: '', sortable: false, align: "right", width:50, 
								renderer: function(value, metaData, record, row, col, store, gridView) {
										return '';
										}
							},
						],
						columnLines: true,
						//autoExpandColumn: 'c_name'
					}) ]
				}]
			}]
		}]
	};
//--------------------------------	
	var storeBuild	= new Ext.data.JsonStore({
		autoLoad: true,
		url: 'api/All_AmCombo.php',
		baseParams: {type : 'storeBuilding'},
		root: 'data',
		idProperty: 'id',
		totalProperty: 'totalCount',
	    fields: [ 'id','c_code', 'c_name']
	});
	
	var popBuilding = new Ext.ux.Poplov({ 
		text		: '',  
		id			: 'frm-dc_building_id',	//go to relation	
		iconCls		: 'page_magnify', 
		valueHidden : 'dc_building_id', 	//go to hidden
		isSetFilter : true,
		store		: storeBuild,
		headerGrid	: [{ header: "ID System", sortable: true, hidden:true, dataIndex: 'id' },
		          	   { header: "รหัส", sortable: true, dataIndex:'c_code' },
		          	   { header: "ชื่อ"
							, sortable: true
							, id: 'c_name' 
							, dataIndex: 'c_name',
							renderer: function(value, metaData, record, rowIndex, colIndex, store) {
									metaData.attr = "style='cursor:pointer';";
								return value; 
							} 
						}],
		isCellClickGrid : true,
		cellClickGrid : function(grid, rowIndex, columnIndex, e) { 
			 
			var record 		= grid.getStore().getAt(rowIndex);  
			var TextShow 	= record.data.c_name;
			
			storeInsTown.setBaseParam("dc_building_id", record.data.id);
			storeInsTown.load();
			Ext.getCmp('frm-dc_ins_town_hdr_id').setValue('');
			Ext.getCmp('frm-dc_ins_town_hdr_id_Name').setValue(''); 
			
			Ext.getCmp('frm-dc_building_id').setValue(record.data.id);
			Ext.getCmp('frm-dc_building_id_Name').setValue(TextShow); 
			
			Ext.getCmp("win-pop-lovfrm-dc_building_id").hide();  					
			Ext.getCmp("win-pop-lovfrm-dc_building_id").destroy();  
			
		},
		widthText	: 280,  
		fieldLabel	: 'กลุ่มอาคาร/สถานที่เอาประกัน ',  
	});
	
	var storeInsTown	= new Ext.data.JsonStore({
		url: 'api/All_AmCombo.php',
		baseParams: {type : 'storeInsTown', dc_building_id : -1},
		root: 'data',
		idProperty: 'id',
		totalProperty: 'totalCount',
	    fields: ['id', 'c_code', 'c_name']
	});
	
	var popInsTown = new Ext.ux.Poplov({ 
		text		: '',  
		id			: 'frm-dc_ins_town_hdr_id',	//go to relation	
		iconCls		: 'page_magnify', 
		valueHidden : 'dc_ins_town_hdr_id', 	//go to hidden
		isSetFilter : true,
		store		: storeInsTown,
		headerGrid	: [{ header: "ID System", sortable: true, hidden:true, dataIndex: 'id' },
						{ header: "ชื่อ"
							, sortable: true
							, id: 'c_name' 
							, dataIndex: 'c_name',
							renderer: function(value, metaData, record, rowIndex, colIndex, store) {
									metaData.attr = "style='cursor:pointer';";
								return value; 
							} 
						}],
		isCellClickGrid : true,
		cellClickGrid : function(grid, rowIndex, columnIndex, e) { 
			 
			var record 		= grid.getStore().getAt(rowIndex);  
			var TextShow 	= record.data.c_name;
			
			Ext.getCmp('frm-dc_ins_town_hdr_id').setValue(record.data.id);
			Ext.getCmp('frm-dc_ins_town_hdr_id_Name').setValue(TextShow); 
			
			Ext.getCmp("win-pop-lovfrm-dc_ins_town_hdr_id").hide();  					
			Ext.getCmp("win-pop-lovfrm-dc_ins_town_hdr_id").destroy();  
			
		},
		widthText	: 280,  
		fieldLabel	: 'ชื่ออาคารและหน่วยงานในอาคาร',  
	});
	
	var storeInsMethod	= new Ext.data.JsonStore({
		autoLoad: true,
		url: 'api/All_AmCombo.php',
		baseParams: {type : 'storeInsMethod'},
		root: 'data',
		idProperty: 'id',
		totalProperty: 'totalCount',
	    fields: [ 'id','c_code', 'c_name']
	});
	
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
        	url:'api/mnAmInsurance.php',
			frame: true,
			labelWidth: 200,
			bodyStyle: { padding: '10px 20px' },
			defaults: { anchor: '100%', msgTarget: 'side', allowBlank: false },
			items: [{
				xtype: 'container',
				layout: 'hbox',
				align: 'stretch',
				defaults: { xtype: 'fieldset', flex:1, margins : '0px 3px', autoHeight: true },
				items: [{
					title: 'บันทึกข้อมูล '+title_panel,
					defaults: { allowBlank: true },
					items: [{
						id : "role-form-mode",
						xtype : "hidden",
						name : "mode" ,
						value:'ADD',
						readOnly: true				
					}, {				
						xtype : "hidden",
						id : 'frm-id',
						name: "id",
						readOnly: true
					}, {
						xtype: 'displayfield',
						fieldLabel: 'รหัสของรายการ',
						name : 'c_code',
						id:'frm-c_code'
					}
					, popBuilding.mini
					, popInsTown.mini
					, {
						xtype: "datefield",
						id: "frm-d_doc_date",
						name: "d_doc_date",
						fieldLabel: "วันที่ทำรายการ",
						width: 150,
					},  {
						fieldLabel: 'คำอธิบายเพิ่มเติม',
						xtype: 'textarea',
						id:'frm-c_comment',
						name:'c_comment',
						anchor: '60%'
					},new Ext.form.ComboBox({
						id: "frm-i_is_method",
						fieldLabel: "ประเภทการประกันภัย",
						width: 300,
						mode: "local",
					    store: storeInsMethod,
						valueField: "id",
						displayField: "c_name",
						hiddenName: 'i_is_method',
						triggerAction: "all",
						forceSelection: true,
						selectOnFocus: true,
						typeAhead : false,
						emptyText: "กรุณาเลือก...",
						
					}), {
						xtype: "datefield",
						id: "frm-d_start_ins",
						name: "d_start_ins",
						fieldLabel: "วันที่เริ่มต้นเอาประกันภัย",
						width: 150,
					}, {
						xtype: "datefield",
						id: "frm-price_at_date",
						name: "price_at_date",
						fieldLabel: "ราคาตามบัญชีของสินทรัพย์ ณ วันที่",
						width: 150,
					}, {
						fieldLabel: 'สถานะการใช้งาน',
						xtype: 'radiogroup',
						columns: [80,100],
						items: [
							{ boxLabel: 'ใช้งาน', checked: true, name: 'i_enable', inputValue: '1' },
							{ boxLabel: 'ไม่ใช้งาน', name: 'i_enable', inputValue: '2' }
						]
					}]
				}]
			}],
			buttonAlign: 'left',
			buttons: [{
				style:'margin-left:15px;',
				text : "ออกเลขเอกสาร",
				id:'buGencodeID',
				iconCls	: 'icon-save',
				handler: function(){

					Ext.Ajax.request({
						url : 'api/mnAmInsurance.php' , 
						params : {
							mode:'GENCODE',
							d_doc_date : Ext.getCmp('frm-d_doc_date').value,
							id :Ext.getCmp('frm-id').getValue(), 
						},
						method: 'GET', //POST
						success: function ( result, request ) { 
							var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
							if (jsonData.success == "Success") { 
								if(jsonData.c_code_gen){
									
									Ext.Msg.alert('Success' , ""
									+"<br/> เลขที่เอกสาร  : "+jsonData.c_code_gen);
									
									Ext.getCmp('contenterCenter').setActiveTab('tabpanel1');
									Ext.getCmp('tabpanel2').setDisabled(true);
									Ext.getCmp('tabpanel1').getStore().reload();  
								}

							} else {
								Ext.MessageBox.alert('Failed', jsonData.msg);			// alert massage error
							} 
						},
						failure: function ( result, request) { 
							Ext.MessageBox.alert('Failed', jsonData.debug);		// connect error
						}
					}); //End Function		

				} //End Handle
			},{
				text : Ext.GLOBAL_BU_SAVE_TH,
				id: "icon-save",
				iconCls	: 'icon-save',
				handler: function(){
					var form = Ext.getCmp("form-widgets").getForm();
					
					var mode = Ext.getCmp('role-form-mode').getValue();
					var chkBuild = (parseInt(Ext.getCmp('frm-dc_building_id').getValue()) > 0)? true : false;
					var chkTown = (parseInt(Ext.getCmp('frm-dc_ins_town_hdr_id').getValue()) > 0)? true : false;
					var chkMethod = (parseInt(Ext.getCmp('frm-i_is_method').getValue()) > 0)? true : false;
					
					if (!chkBuild)
						Ext.Msg.alert('ผิดพลาด', 'กรุณาเลือก กลุ่มอาคาร/สถานที่เอาประกัน');
					else if (!chkTown)
						Ext.Msg.alert('ผิดพลาด', 'กรุณาเลือก ชื่ออาคารและหน่วยงานในอาคาร');
					else if (!chkMethod)
						Ext.Msg.alert('ผิดพลาด', 'กรุณาเลือก  ประเภทการประกันภัย');
					else if (form.isValid()){ 
						form.submit({
							waitMsg:'Saving Data...',
							success : function(form, action) { 
								var data = Ext.decode(action.response.responseText);
								var hdr_id = data.hdr_id;
								
								if (mode == 'ADD')
									Ext.getCmp('frm-c_code').setValue(data.c_code_gen);
								
								Ext.getCmp('role-form-mode').setValue('EDIT');
								Ext.getCmp('frm-id').setValue(hdr_id);
								
								if (Ext.getCmp('frm-c_code').getValue() == "none")
									Ext.getCmp('buGencodeID').show();
								else
									Ext.getCmp('buGencodeID').hide();
								
								Ext.getCmp('frmd-id').setValue(hdr_id);
								Ext.getCmp('frmd-dc_ins_town_hdr_id').setValue(Ext.getCmp('frm-dc_ins_town_hdr_id').getValue());
			                    Ext.getCmp('GRID_DTL').show();
			                    Ext.getCmp('buAddDtl').show();

			                    Ext.getCmp('tabpanel1').getStore().load();
			                    
			        			// Load Method
			        			store_dtl.setBaseParam("am_ins_hdr_id", hdr_id);
			    				store_dtl.setBaseParam("dc_ins_town_hdr_id", Ext.getCmp('frm-dc_ins_town_hdr_id').getValue());
			        			store_dtl.setBaseParam("type", "DTL");
			        			store_dtl.load();
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
	InfoMainGrid('tabpanel1',true,true,true,false,false,false);
	/*====================== RENDER ======================*/
	
});