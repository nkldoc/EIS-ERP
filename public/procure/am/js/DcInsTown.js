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

function checkDtlAll(ele) {
	for(var i=1; i<Ext.dtlChk.length; i++){
		var ind = Ext.dtlChk[i];
		if (ind != '')
		{
			document.getElementById(ind).checked = ele;
		}
	}
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
	Ext.dtlChk = [];
	/*===============================================*/
	var title_panel = "อาคารและหน่วยงานในอาคาร";
	/*===============================================*/
	
	var storeMain = new Ext.data.JsonStore({
		storeId: 'myStore',
	    autoDestroy: true,
		autoLoad: true,
	    url : 'api/ListDcInsTown.php',
	    root: 'data',
	    baseParams: { type: "HDR", i_read:user_right_read }, //Permission i_read
	    idProperty: 'id',
		totalProperty: 'totalCount',
		fields: [
			{ name: 'no' },
			{ name: 'id' },
			{ name: 'dc_inv_id'},
			{ name: 'dc_cost_id'},
			{ name: 'dc_building_id'},
			{ name: 'building_name'},
			{ name: 'c_code' },
			{ name: 'c_name' },
			{ name: 'd_doc_date' },
			{ name: 'dc_cost_old_id' },
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
	    url : 'api/ListDcInsTown.php',
	    root: 'data',
	    baseParams: { type: "DTL", i_read:user_right_read },
	    idProperty: 'id',
		totalProperty: 'totalCount',
		fields: [
				{ name : "no" },
				{ name : "id" },
				{ name : "c_code" },
				{ name : "c_name" },
				{ name : "f_unit_cost" },
				{ name : "f_depreciate_cost" },
				{ name : "acc_amt" }
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
	var storeBuildingSearch	= new Ext.data.JsonStore({
		autoLoad: true,
		url: 'api/All_AmCombo.php',
		baseParams: {type : 'storeBuilding', add_all: 'ALL'},
		root: 'data',
		idProperty: 'id',
		totalProperty: 'totalCount',
	    fields: [ 'id','c_code', 'c_name']
	});
	
	Ext.PopBuildingSearch = new Ext.ux.Poplov({ 
		text		: 'เลือกทั้งหมด',  
		id			: 's-dc_building_id',	//go to relation	
		iconCls		: 'page_magnify', 
		valueHidden : 'dc_building_id', 	//go to hidden
		store		: storeBuildingSearch,
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
	
	var sGroup1 = [{ //lable
		xtype: 'displayfield',  
		value:'ค้นหาจากชื่ออาคาร   : ',
		cls: 'ui-label',  
	},{
		xtype: 'textfield', 
		id: 's-name',
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
	}];
	
	var sGroup2= [{ //lable
		xtype: 'displayfield',  
		value:'กลุ่มอาคาร/สถานที่เอาประกัน   : ',
		cls: 'ui-label',  
	},Ext.PopBuildingSearch.mini];
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
							
							Ext.getCmp('icon-save').show();
							Ext.getCmp('GRID_DTL').hide();
							
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
                                                        storeMain.setBaseParam("c_name", Ext.getCmp("s-name").getValue());
                                                        storeMain.setBaseParam("i_enable", Ext.getCmp("s-enable").getValue());
                                                        storeMain.setBaseParam('dc_building_id',Ext.getCmp("s-dc_building_id").getValue());
                                                        storeMain.load();
                                                    }
					     },{
				                text: "เริ่มใหม่",
				                align: 'center',
				                iconCls: 'icon-reset',
				                handler: function() {
									Ext.getCmp("s-name").setValue('');
									Ext.getCmp("s-enable").setValue('0');
									Ext.PopBuildingSearch.setReset(true);
				                }
				            }]
				}],
		columns: [
		    new Ext.grid.RowNumberer({header:"ที่", width: 30,
				renderer: function(value, metaData, record, row, col, store, gridView) {
					return record.get("no");
				}
			}),
			{ header: "ชื่ออาคาร", sortable: true, width:100, dataIndex: "c_name", id:'G-c_name'},
			{ header: "กลุ่มอาคาร/สถานที่เอาประกัน", sortable: true, width:200, dataIndex: "building_name"}
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
			
			Ext.getCmp('frm-dc_building_id').setValue(record.get('dc_building_id'));
			Ext.getCmp('frm-dc_building_id_Name').setValue(record.get('building_name'));
			
			Ext.getCmp("role-form-mode").setValue("EDIT");
			
			Ext.getCmp('buAddDtl').show();
			Ext.getCmp('buDelDtl').show();
			Ext.getCmp('GRID_DTL').show();

			// Load Method
			store_dtl.setBaseParam("dc_ins_town_hdr_id", record.data.id);
			store_dtl.setBaseParam("type", "DTL");
			store_dtl.load();
		} else if (columnIndex==grid.getColumnModel().getIndexById('view')) {
			Ext.getCmp('icon-save').hide();
			Ext.getCmp('tabpanel2').setDisabled(false);
			Ext.getCmp('contenterCenter').setActiveTab('tabpanel2');
			Ext.getCmp('form-widgets').getForm().reset();
			Ext.getCmp("form-widgets").getForm().loadRecord(record);
			Ext.getCmp("role-form-mode").setValue("VIEW");
			
			Ext.getCmp('frm-dc_building_id').setValue(record.get('dc_building_id'));
			Ext.getCmp('frm-dc_building_id_Name').setValue(record.get('building_name'));
			
			Ext.getCmp('GRID_DTL').show();
			Ext.getCmp('buAddDtl').hide();
			Ext.getCmp('buDelDtl').hide();
			
			// Load Method
			store_dtl.setBaseParam("dc_ins_town_hdr_id", record.data.id);
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
							url : 'api/mnDcInsTown.php' ,
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
	
	//=========================================================================================//
	
	function popFrmCost(hdr_id){
		
		var storeListAsset = new Ext.data.JsonStore({
			autoLoad: true,
		    url : 'api/ListDcInsTown.php',
		    root: 'data',
		    baseParams: { type: "LIST_COST"
		    			, dc_ins_town_hdr_id : hdr_id
		    			, i_read:user_right_read },
		    idProperty: 'id',
			totalProperty: 'totalCount',
			fields: [
					{ name : "no" },
					{ name : "id" },
					{ name : "c_code" },
					{ name : "c_name" }
			]
		});
		
		Ext.objChk = [];
		
		
		var frmRegister = new Ext.Window({
			id : "frmRegis",
			xtype: 'form',
			title : "หน่วยงาน",
			modal: true,
			border: false,
			autoScroll: true,
			maximizable: true,
			frame:true,
			height: (Ext.getBody().getViewSize().height*0.8),
			width: (Ext.getBody().getViewSize().width*0.8), 		//80% *0.8
			listeners: {
				"minimize": function (window, opts) { //when property minimizable
					window.collapse();
					window.setWidth(200);
					window.alignTo(Ext.getBody(), 'bl-bl')
				}
			}, 
			items: [{
					xtype: 'form',
					id:'frmReg',
					url:'api/mnDcInsTown.php',
					defaults: { allowBlank: true},
					labelWidth : 200,
					//bodyStyle: 'padding: 10px;',
					items: [{
						xtype: "hidden",
						id: "mode",
						value : 'SELECT_COST',
						readOnly: true
					},{
						xtype: "hidden",
						id: "frmReg-hdr_id",
						name : "dc_ins_town_hdr_id",
						value : hdr_id,
						readOnly: true
					},{
 			 			xtype: 'grid',
 			 			region:'center',
 			 			id:'grid_asset',
 			 			height:(Ext.getBody().getViewSize().height*0.7), //400,
 			 			width:'100%',
 			 			defaults:{autoScroll:true},
 			 			border: false,
 			 			stripeRows: true,
 			 			loadMask: true,
 			 			store: storeListAsset,
 			 			tbar: [{
		 							xtype : 'tbfill'  
		 						}, '-', 
		 						'ค้นหาตามชื่อหน่วยงาน',{			
		 							id : "s-c_name",
		 							xtype : "textfield",
		 							width: 130, 
		 							fieldLabel : "fieldLabel",
		 						}, '-', 
		 						'รหัสหน่วยงาน',{			
		 							id : "s-c_code",
		 							xtype : "textfield",
		 							width: 130, 
		 							fieldLabel : "fieldLabel",
		 						}, '-', 'พื้นที่ใช้งาน' ,{
		 							id 		  : "s-region",
		 			                xtype     : 'combo',
		 			                width     : 130,
		 							mode	  : 'local',
		 			                store     : new Ext.data.SimpleStore({
		 										  fields: [ "value", "text" ],
		 										  data: [[ '0', "ทั้งหมด" ],
		 										         [ '1', "ส่วนกลาง" ],
		 										         [ '2', "ส่วนภูมิภาค " ]
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
		 							emptyText : "เลือกตัวกรอง"
		 						}
		 						,' ', '-', {
		 							text : "ค้นหา",
		 							iconCls: 'icon-magnifier',
		 							handler : function() {
		 								Ext.objChk = [];
		 								storeListAsset.setBaseParam("mode", "SEARCH");
	 									storeListAsset.setBaseParam("c_name",Ext.getCmp("s-c_name").getValue()); 
	 									storeListAsset.setBaseParam("c_code", Ext.getCmp("s-c_code").getValue());
	 									storeListAsset.setBaseParam("i_type_region", Ext.getCmp("s-region").getValue()); 
	 									storeListAsset.load();
		 							}
		 						} ,' ', '-'],
 			 			columns:[
 								new Ext.grid.RowNumberer({
 									header: "<div class='topAlign'><input type='checkbox' id='chkAll' onclick='checkAll(this.checked)'></div>",
 									sortable: false,
 									align:'center',
 									id:'qty',
 									width:50,
 									dataIndex:'id' ,
 									renderer: function(value, metaData, record, row, col, store, gridView) {
 										Ext.objChk[record.get('no')] = 'chk_'+record.get('id');
	 										
 										return '<input type="checkbox" id="chk_'+record.get('id')+'" '
 										+' value="'+record.get('id')+'" name="chk[]"/>';
 									}
 								}),
 								{header: 'รหัส', sortable: true, dataIndex: 'c_code', align: "center", width:180 },
 								{header: 'หน่วยงาน', sortable: true, dataIndex: 'c_name', id : 'fregis-c_name' },
 								{header: '', 
 									renderer: function(value, metaData, record, row, col, store, gridView) {
 										return '';
 									}
 								}],
 						autoExpandColumn: "fregis-c_name",
 			 			viewConfig: {
 			 				getRowClass: function(record, index, rowParams, ds) {
 			 					rowParams.tstyle = 'width:' + this.getTotalWidth() + ';';
 			 					var bgColor = '#eee; !important';
 			 					var fgColor = 'blue';

 			 					if(!record.get('no')){
 			 						rowParams.tstyle += "background-color:" + bgColor + ';';
 			 						rowParams.tstyle += "color:" + fgColor + ';';
 			 					}

 			 				}
 			 			}
 			 		}]
			}],
			buttonAlign: 'left',
			buttons : [{
				text : Ext.GLOBAL_BU_SAVE_TH,
				iconCls	: 'icon-save',
				handler: function(){
					var form = Ext.getCmp("frmReg").getForm();
					if (form.isValid()){
						form.submit({
							params: {
								/*d_start_input : d_start,
								d_finish_input : d_finish*/
							},
							waitMsg:'Saving Data...',
							success : function(form, action) { 
								var data = Ext.decode(action.response.responseText);
			                    
								if (data.success == "Error")
								{
									 Ext.Msg.alert("ผิดพลาด", data.msg);
								}
								else
								{
									store_dtl.load();
									Ext.getCmp("frmRegis").hide();
									Ext.getCmp("frmRegis").destroy();
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
				text : Ext.GLOBAL_BU_BACK_TH,
				handler : function() {
					Ext.getCmp("frmRegis").hide();
					Ext.getCmp("frmRegis").destroy();
				}				
			}]
		});
		return frmRegister;
	}; //EndFunction
	//=========================================================================================//
	
	Ext.dtlChk = [];
	var GRID_DTL = {
		id: "GRID_DTL",
		border: false,
		bodyStyle: { padding: '10px 20px' },
		defaults: { anchor: '100%', msgTarget: 'side', allowBlank: false },
		items: [{
        	xtype: 'form',
        	id: 'form-dtl',
        	url:'api/mnDcInsTown.php',
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
				id : 'frmd-mode',
				name: "mode",
				value: "DELETE_DTL",
				readOnly: true
			},{
				xtype: 'container',
				layout: 'hbox',
				align: 'stretch',
				defaults: { xtype: 'fieldset', flex:1, margins : '0px 3px', autoHeight: true },
				items: [{
					title: 'รายการหน่วยงาน',
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
							scrollOffset: 0 // close scrollbar
						},
						tbar: [{
							text : 'เพิ่มข้อมูล',
							id:'buAddDtl',
							iconCls: 'icon-add', 
							handler: function(grid, rowIndex, colIndex) {
								//-------
								var dc_ins_town_hdr_id = Ext.getCmp("frm-id").getValue();
								var frmDtl = popFrmCost(dc_ins_town_hdr_id);
								frmDtl.show();
							}
						},{
							text : 'ลบรายการ',
							id: "buDelDtl",
							iconCls	: 'icon-del',
							handler: function(){
								var form = Ext.getCmp("form-dtl").getForm();
								
								form.submit({
									waitMsg:'Saving Data...',
									success : function(form, action) { 
										var data = Ext.decode(action.response.responseText);
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
							} //End Handle
						}],
						columns: [
						          new Ext.grid.RowNumberer({
	 									header: "<div class='topAlign'><input type='checkbox' id='chkDtlAll' onclick='checkDtlAll(this.checked)'></div>",
	 									sortable: false,
	 									align:'center',
	 									id:'qty',
	 									width:50,
	 									dataIndex:'id' ,
	 									renderer: function(value, metaData, record, row, col, store, gridView) {
	 										Ext.dtlChk[record.get('no')] = 'chk_dtl_'+record.get('id');
		 										
	 										return '<input type="checkbox" id="chk_dtl_'+record.get('id')+'" '
	 										+' value="'+record.get('id')+'" name="chk_dtl[]"/>';
	 									}
	 								}),
							{header: 'รหัส', sortable: true, dataIndex: 'c_code', align: "center" },
							{header: 'หน่วยงาน', sortable: true, dataIndex: 'c_name', id:'c_name'  },
							{header: '', sortable: false, align: "right", width:50, 
								renderer: function(value, metaData, record, row, col, store, gridView) {
										return '';
										}
							},
						],
						columnLines: true,
						autoExpandColumn: 'c_name'
					}) ]
				}]
			}]
		}]
	};
	
	var ColumGridPop = [{ header: "ID System", sortable: true, hidden:true, dataIndex: 'id' },
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
	
	var storeBuilding	= new Ext.data.JsonStore({
		autoLoad: true,
		url: 'api/All_AmCombo.php',
		baseParams: {type : 'storeBuilding'},
		root: 'data',
		idProperty: 'id',
		totalProperty: 'totalCount',
	    fields: [ 'id','c_code', 'c_name']
	});
	////////////////////////
	var frmBuilding = new Ext.ux.Poplov({
	    id			: 'frm-dc_building_id',	//go to relation	
	    iconCls		: 'page_magnify', 
	    valueHidden : 'dc_building_id', 	//go to hidden
	    store		: storeBuilding,
	    headerGrid	: ColumGridPop,
	    widthText	: 340, 
	    fieldLabel	: 'กลุ่มอาคาร/สถานที่เอาประกัน', 
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
        	url:'api/mnDcInsTown.php',
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
					}
					, frmBuilding.mini
					, {
						xtype: 'textfield',
						fieldLabel: 'ชื่ออาคาร',
						name : 'c_name',
						id:'frm-c_name',
						anchor: '60%'
					}, {
						fieldLabel: 'คำอธิบายเพิ่มเติม',
						xtype: 'textarea',
						id:'frm-c_comment',
						name:'c_comment',
						anchor: '60%'
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
				text : Ext.GLOBAL_BU_SAVE_TH,
				id: "icon-save",
				iconCls	: 'icon-save',
				handler: function(){
					var form = Ext.getCmp("form-widgets").getForm();
					
					var mode = Ext.getCmp('role-form-mode').getValue();
					var chkBuilding = (parseInt(Ext.getCmp('frm-dc_building_id').getValue()) > 0)? true : false;
					var chkName = (Ext.getCmp('frm-c_name').getValue() != '')? true : false;
					
					if (!chkBuilding)
						Ext.Msg.alert('ผิดพลาด', 'กรุณาเลือก กลุ่มอาคาร/สถานที่เอาประกัน');
					else if (!chkName)
						Ext.Msg.alert('ผิดพลาด', 'กรุณาระบุ ชื่ออาคาร');
					else if (form.isValid()){ 
						form.submit({
							waitMsg:'Saving Data...',
							success : function(form, action) { 
								var data = Ext.decode(action.response.responseText);
								var hdr_id = data.hdr_id;
								Ext.getCmp('role-form-mode').setValue('EDIT');
								Ext.getCmp('frm-id').setValue(hdr_id);

			                    Ext.getCmp('GRID_DTL').show();
			                    Ext.getCmp('buAddDtl').show();
			                    Ext.getCmp('buDelDtl').show();

			                    storeMain.load();
			        			// Load Method
			        			store_dtl.setBaseParam("dc_ins_town_hdr_id", hdr_id);
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