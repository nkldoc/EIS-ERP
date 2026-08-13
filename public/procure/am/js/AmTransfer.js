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
	var title_panel = "บันทึกการโอนย้ายครุภัณฑ์";
	/*===============================================*/
	
	var storeMain = new Ext.data.JsonStore({
            storeId: 'myStore',
	    autoDestroy: true,
            autoLoad: true,
	    url : 'api/ListAmTransfer.php',
	    root: 'data',
	    baseParams: { type: "HDR", i_read:user_right_read }, //Permission i_read
	    idProperty: 'id',
            totalProperty: 'totalCount',
            fields: [
                    { name: 'no' },
                    { name: 'id' },
                    { name: 'inv_tran_type_id'},
                    { name: 'c_code' },
                    { name: 'c_name' },
                    { name: 'c_code_gen' },
                    { name: 'dc_cost_id' },
                    { name: 'dc_cost_old_id' },
                    { name: 'dc_cost_id_new' },
                    { name: 'd_date_chg' },
                    { name: 'str_chg_date' },
                    { name: 'd_doc_date' },
                    { name: 'str_date' },
                    { name: 'c_comment' },
                    { name: 'i_enable' },
                    { name: 'dc_user_create_id' },
                    { name: 'dc_user_create_cost_id' },
                    { name: 'd_create' },
                    { name: 'dc_user_update_id' },
                    { name: 'dc_user_update_cost_id' },
                    { name: 'd_update' },
                    { name: 'i_show_gen'},
                    { name: 'i_is_update'},
                    { name: 'cost_fname'},
                    { name: 'cost_code' },
                    { name: 'cost_names' },
                    { name: 'cost_new_fname'},
                    { name: 'cost_new_code' },
                    { name: 'cost_new_names' }
		]
	});
	
	var store_dtl = new Ext.data.JsonStore({
	    url : 'api/ListAmTransfer.php',
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
	
	//----------
	var storeAssetGroup = new Ext.data.JsonStore({ 
            autoLoad: true,
            storeId: 'myStoreAssetGroup',
            url: 'api/All_AmCombo.php',
            baseParams: {type : 'storeAssetByLv', lv:'0', add_all:'ALL'},
	    root: 'data',
	    idProperty: 'id',
            totalProperty: 'totalCount',
	    fields: [ 'no','id', 'asset_type', 'c_code', 'c_code_name']
	});
	
	var storeAssetType = new Ext.data.JsonStore({
            autoLoad: true,
            storeId: 'myStoreAssetType',
            url: 'api/All_AmCombo.php',
            baseParams: {type : 'storeAssetByLv', lv:'1', add_all:'ALL'},
	    root: 'data',
	    idProperty: 'id',
            totalProperty: 'totalCount',
	    fields: [ 'no','id', 'c_code', 'c_code_name']
	});
	
	var storeAssetLast = new Ext.data.JsonStore({
            autoLoad: true,
            storeId: 'myStoreAssetLast',
            url: 'api/All_AmCombo.php',
            baseParams: {type : 'storeAssetByLv', is_last:'1', add_all:'ALL'},
	    root: 'data',
	    idProperty: 'id',
            totalProperty: 'totalCount',
	    fields: [ 'no','id', 'c_code', 'c_code_name']
	});
	//----------
	// pagingBar
	var pagingBar = new Ext.PagingToolbar({
		pageSize: 20,
		store: storeMain,
		displayInfo: true,
		displayMsg: 'Displaying topics {0} - {1} of {2}'
	});
	
	// Search Group
	// UI Search
	var storeCostSearch	= new Ext.data.JsonStore({
		autoLoad: true,
		url: 'api/All_AmCombo.php',
		baseParams: {type : 'storeCost', i_all: 'ALL'},
		root: 'data',
		idProperty: 'id',
		totalProperty: 'totalCount',
	    fields: [ 'id','c_code', 'c_name']
	});
	
	Ext.PopCostSearch = new Ext.ux.Poplov({ 
		text		: 'เลือกทั้งหมด',  
		id			: 's-dc_cost_id',	//go to relation	
		iconCls		: 'page_magnify', 
		valueHidden : 'dc_cost_id', 	//go to hidden
		store		: storeCostSearch,
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
		fieldLabel	: 'หน่วยงานที่โอน',  
	});
	
	var sGroup1 = [{ //lable
		xtype: 'displayfield',  
		value:'วันที่โอนย้าย  : ',
		cls: 'ui-label',  
	},{
		xtype: 'datefield', 
		id: 's_d_beginID', 
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
		id: 's_d_endID', 
		name: 's_d_end', 
		width:140,
		value:defaultDate(2),
		emptyText : "วันที่สิ้นสุด",
    }];
	
	var sGroup2= [{ //lable
		xtype: 'displayfield',  
		value:'หน่วยงานที่โอน   : ',
		cls: 'ui-label',  
	},Ext.PopCostSearch.mini];
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
							
                                                        Ext.getCmp('Bufrm-dc_cost_id').show();
							Ext.getCmp('icon-save').show();
							Ext.getCmp('GRID_DTL').hide();
							//buGencode
							Ext.getCmp('buGencodeID').hide();

							Ext.getCmp("frm-d_doc_date").setValue(addY(543));
							Ext.getCmp("frm-d_date_chg").setValue(addY(543));
							Ext.getCmp('frm-c_code_gen').setValue('TA');
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
									storeMain.setBaseParam("d_begin", Ext.getCmp("s_d_beginID").getValue());
									storeMain.setBaseParam("d_end", Ext.getCmp("s_d_endID").getValue());
									storeMain.setBaseParam('dc_cost_id',Ext.getCmp("s-dc_cost_id").getValue());
									storeMain.load();
								}
					     },{
				                text: "เริ่มใหม่",
				                align: 'center',
				                iconCls: 'icon-reset',
				                handler: function() {
									Ext.getCmp("s_d_beginID").setValue(defaultDate(1));
									Ext.getCmp("s_d_endID").setValue(defaultDate(2));
									Ext.PopCostSearch.setReset(true);
				                }
				            }]
				}],
		columns: [
		    new Ext.grid.RowNumberer({header:"ที่", width: 30,
				renderer: function(value, metaData, record, row, col, store, gridView) {
					return record.get("no");
				}
			}),
			{ header: "เลขที่โอนย้าย", sortable: true, width:100, dataIndex: "c_code_gen", align:'center' },
			{ header: "เลขที่เอกสาร", sortable: true, width:100, dataIndex: "c_code", align:'center' },
			{ header: "เรื่อง", sortable: true, width: 250, dataIndex: "c_name" , id:'G-c_name'},
			{ header: "หน่วยงานที่โอน ", sortable: true, width: 250, dataIndex: "cost_names"},
			{ header: "วันที่โอนย้าย", sortable: true, dataIndex: "str_chg_date", align:'center' },
		],
		autoExpandColumn: "G-c_name",
		bbar: pagingBar
	}); //gridMain

	function cellClick(grid, rowIndex, columnIndex, e) {
		var record = grid.getStore().getAt(rowIndex); 
		
		if (columnIndex == grid.getColumnModel().getIndexById('edit')) {
			
			if(record.get('i_is_update')== 1){
				Ext.getCmp('icon-save').show();
				Ext.getCmp('tabpanel2').setDisabled(false);
				Ext.getCmp('contenterCenter').setActiveTab('tabpanel2');
				Ext.getCmp('form-widgets').getForm().reset();
				Ext.getCmp("form-widgets").getForm().loadRecord(record);
				
				Ext.getCmp('frm-dc_cost_id').setValue(record.get('dc_cost_id'));
				Ext.getCmp('frm-dc_cost_id_Name').setValue(record.get('cost_fname'));
				Ext.getCmp('Bufrm-dc_cost_id').hide();
				
				Ext.getCmp('frm-dc_cost_id_new').setValue(record.get('dc_cost_id_new'));
				Ext.getCmp('frm-dc_cost_id_new_Name').setValue(record.get('cost_new_fname'));
				
				if (record.get('i_is_update')== 1)
				{
					Ext.getCmp("role-form-mode").setValue("EDIT");
					//buGencode
					if (record.get('i_show_gen') == '1')
						Ext.getCmp('buGencodeID').show();
					else
						Ext.getCmp('buGencodeID').hide();
					
					Ext.getCmp('buAddDtl').show();
					Ext.getCmp('buDelDtl').show();
				}
				else
				{
					Ext.getCmp("role-form-mode").setValue("VIEW");
					//button
					Ext.getCmp('icon-save').hide();
					Ext.getCmp('buGencodeID').hide();
					Ext.getCmp('buAddDtl').hide();
					Ext.getCmp('buDelDtl').hide();
				}

				Ext.getCmp('GRID_DTL').show();

				// Load Method
				store_dtl.setBaseParam("am_tf_hdr_id", record.data.id);
				store_dtl.setBaseParam("type", "DTL");
				store_dtl.load();
			}
		} else if (columnIndex==grid.getColumnModel().getIndexById('view')) {
			Ext.getCmp('icon-save').hide();
			Ext.getCmp('tabpanel2').setDisabled(false);
			Ext.getCmp('contenterCenter').setActiveTab('tabpanel2');
			Ext.getCmp('form-widgets').getForm().reset();
			Ext.getCmp("form-widgets").getForm().loadRecord(record);
			Ext.getCmp("role-form-mode").setValue("VIEW");
			
			Ext.getCmp('frm-dc_cost_id').setValue(record.get('dc_cost_id'));
			Ext.getCmp('frm-dc_cost_id_Name').setValue(record.get('cost_fname'));
			
			Ext.getCmp('frm-dc_cost_id_new').setValue(record.get('dc_cost_id_new'));
			Ext.getCmp('frm-dc_cost_id_new_Name').setValue(record.get('cost_new_fname'));
			
			//buGencode
			Ext.getCmp('buGencodeID').hide();
			Ext.getCmp('GRID_DTL').show();
			
			Ext.getCmp('buAddDtl').hide();
			Ext.getCmp('buDelDtl').hide();
			
			// Load Method
			store_dtl.setBaseParam("am_tf_hdr_id", record.data.id);
			store_dtl.setBaseParam("type", "DTL");
			store_dtl.load();
			
		} else if (columnIndex == grid.getColumnModel().getIndexById('remove')) {
			if(record.get('i_is_update')== 1){
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
								url : 'api/mnAmTransfer.php' ,
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
		}
	};
	
	//=========================================================================================//
	
	function popFrmAsset(hdr_id){
		
		var storeListAsset = new Ext.data.JsonStore({
			autoLoad: true,
		    url : 'api/ListAmTransfer.php',
		    root: 'data',
		    baseParams: { type: "LIST_ASSET"
		    			, am_tf_hdr_id : hdr_id
		    			, i_read:user_right_read },
		    idProperty: 'id',
			totalProperty: 'totalCount',
			fields: [
					{ name : "no" },
					{ name : "id" },
					{ name : "c_code" },
					{ name : "c_name" },
					{ name : "f_unit_cost" },
					{ name : "acc_amt" }
			]
		});
		
		Ext.objChk = [];
		
		var searchGroup= [{
			id 		  : "ls-fill",
			xtype     : 'combo',
			mode	  : 'local',
			width	  : 100,
			store     : new Ext.data.SimpleStore({
							fields: [ "value", "text" ],
							data: [
							    [ 'c_code', "รหัสสินทรัพย์" ],
							    [ 'c_name', "ชื่อสินทรัพย์ " ]
							]
				}),
			valueField: "value",
			displayField: "text",
			value : "c_code",
			editable : false,
			triggerAction: "all",
			typeAhead : false,
		},{			
			id : "ls-value",
			xtype : "textfield", 
			fieldLabel : "fieldLabel",
			width:250
			//listeners: Ext.enterSubmit,
			
		},{
			xtype: 'displayfield', 
			value: 'หมวดสินทรัพย์   : ' , 
			cls: 'ui-label',  	        	
		},new Ext.form.ComboBox({
			id: "ls-asset_group",
			fieldLabel: "หมวดสินทรัพย์",
			width: 300,
			mode: "local",
                        store: storeAssetGroup,
			valueField: "c_code",
			displayField: "c_code_name",
			triggerAction: "all",
			forceSelection: true,
			selectOnFocus: true,
			typeAhead : false,
			value: ""
		}),{
			xtype: 'displayfield', 
			value: 'ประเภทสินทรัพย์   : ' , 
			cls: 'ui-label',  	        	
		},new Ext.form.ComboBox({
			id: "ls-asset_type",
			fieldLabel: "ประเภทสินทรัพย์",
			width: 300,
			mode: "local",
                        store: storeAssetType,
			valueField: "c_code",
			displayField: "c_code_name",
			triggerAction: "all",
			forceSelection: true,
			selectOnFocus: true,
			typeAhead : false,
			value: ""
		}),{
			xtype: 'displayfield', 
			value: 'รายการสินทรัพย์   : ' , 
			cls: 'ui-label',  	        	
		},new Ext.form.ComboBox({
			id: "ls-asset_code",
			fieldLabel: "รายการสินทรัพย์",
			width: 300,
			mode: "local",
                        store: storeAssetLast,
			valueField: "c_code",
			displayField: "c_code_name",
			triggerAction: "all",
			forceSelection: true,
			selectOnFocus: true,
			typeAhead : false,
			value: ""
		})];
		
		var frmRegister = new Ext.Window({
			id : "frmRegis",
			xtype: 'form',
			title : "รายการสินทรัพย์",
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
					url:'api/mnAmTransfer.php',
					defaults: { allowBlank: true},
					labelWidth : 200,
					//bodyStyle: 'padding: 10px;',
					items: [{
						xtype: "hidden",
						id: "mode",
						value : 'Transfer',
						readOnly: true
					},{
						xtype: "hidden",
						id: "frmReg-hdr_id",
						name : "am_tf_hdr_id",
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
 							 xtype: 'buttongroup',
 							 columns: 2, 
 							 title: '&nbsp;', 
 							 items: [searchGroup], 
 							 buttonAlign:'left',
 		 					 buttons:[{ 
                                                                    text : "ค้นหา",
                                                                    align:'center',
                                                                    iconCls: 'icon-magnifier', 
                                                                    handler : function() {
                                                                        Ext.objChk = [];

                                                                        storeListAsset.setBaseParam("mode", "SEARCH");
                                                                        storeListAsset.setBaseParam("fillter", Ext.getCmp("ls-fill").getValue());
                                                                        storeListAsset.setBaseParam("value", Ext.getCmp("ls-value").getValue());
                                                                        storeListAsset.setBaseParam("asset_group", Ext.getCmp("ls-asset_group").getValue());
                                                                        storeListAsset.setBaseParam("asset_type", Ext.getCmp("ls-asset_type").getValue());
                                                                        storeListAsset.setBaseParam("asset_code", Ext.getCmp("ls-asset_code").getValue());
                                                                        storeListAsset.load();
                                                                    }
 							     },{
 						                text: "เริ่มใหม่",
 						                align: 'center',
 						                iconCls: 'icon-reset',
 						                handler: function() {
                                                                    Ext.getCmp("ls-fill").setValue('c_code');
                                                                    Ext.getCmp("ls-value").setValue('');
                                                                    Ext.getCmp("ls-asset_group").setValue('');
                                                                    Ext.getCmp("ls-asset_type").setValue('');
                                                                    Ext.getCmp("ls-asset_code").setValue('');
 						                }
 						            }]
 						}],
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
 								{header: 'รหัสสินทรัพย์', sortable: true, dataIndex: 'c_code', align: "center", width:180 },
 								{header: 'ชื่อสินทรัพย์', sortable: true, dataIndex: 'c_name', id : 'fregis-c_name' },
 								{header: 'ราคาทุน', sortable: true, dataIndex: 'f_unit_cost', width:100 , 
 									renderer: function(value, metaData, record, row, col, store, gridView) {
 										metaData.attr = 'align=right';
 										return floatRenderer(value);
 									}  
 								},
 								{header: 'ราคาตามบัญชี', sortable: true, dataIndex: 'acc_amt', width:100 , 
 									renderer: function(value, metaData, record, row, col, store, gridView) {
 										metaData.attr = 'align=right';
 										return floatRenderer(value);
 									}  
 								},{header: '', 
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
				text : "บันทึกรายการสินทรัพย์",
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
									Ext.getCmp("buGencodeID").show();
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
        	url:'api/mnAmTransfer.php',
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
					title: 'รายการสินทรัพย์ที่โอนย้าย',
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
								var am_tf_hdr_id = Ext.getCmp("frm-id").getValue();
								var frmDtl = popFrmAsset(am_tf_hdr_id);
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
							{header: 'รหัสรายการสินทรัพย์', sortable: true, dataIndex: 'c_code', align: "center" },
							{header: 'ชื่อสินทรัพย์', sortable: true, dataIndex: 'c_name'  },
							{header: 'ราคาทุน', sortable: true, align: "right", dataIndex: 'f_unit_cost', renderer: floatRenderer},
							{header: 'ราคาตามบัญชี', sortable: true, align: "right", dataIndex: 'acc_amt', renderer: floatRenderer},
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
	
	var storefrmCost	= new Ext.data.JsonStore({ 
		autoLoad: true,
		storeId: 'myStoreCost',
		url: 'api/All_AmCombo.php',
		baseParams: {type : 'storeCost'},
	    root: 'data',
	    idProperty: 'id',
		totalProperty: 'totalCount',
	    fields: [ 'no','id', 'c_code','c_name']
	});
	
	var frmCost = new Ext.ux.Poplov({
	    id			: 'frm-dc_cost_id',	//go to relation	
	    iconCls		: 'page_magnify', 
	    valueHidden : 'dc_cost_id', 	//go to hidden
	    store		: storefrmCost,
	    headerGrid	: ColumGridPop,
	    widthText	: 340, 
	    fieldLabel	: 'หน่วยงานเจ้าของสินทรัพย์', 
	});
	
	var frmCostNew = new Ext.ux.Poplov({
	    id			: 'frm-dc_cost_id_new',	//go to relation	
	    iconCls		: 'page_magnify', 
	    valueHidden : 'dc_cost_id_new', 	//go to hidden
	    store		: storefrmCost,
	    headerGrid	: ColumGridPop,
	    widthText	: 340, 
	    fieldLabel	: 'หน่วยงานผู้รับโอน', 
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
        	url:'api/mnAmTransfer.php',
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
						fieldLabel: 'เลขที่โอนย้าย',
						name : 'c_code_gen',
						id:'frm-c_code_gen',
						cls: 'bgblue',
						value : 'TA'
					}, {
						xtype: 'displayfield',
						fieldLabel: 'ทำรายการ',
						name : 'inv_type_name',
						id:'frm-inv_type_name',
						cls: 'bgblue',
						value : 'โอนย้าย'
					}
					, frmCost.mini
					, {
						xtype: 'textfield',
						fieldLabel: 'เรื่อง',
						name : 'c_name',
						id:'frm-c_name',
						anchor: '60%'
					}, {
						xtype: 'textfield',
						fieldLabel: 'เลขที่เอกสาร',
						name : 'c_code',
						id:'frm-c_code',
						anchor: '60%'
					}, {
						xtype: "datefield",
						id: "frm-d_doc_date",
						name: "d_doc_date",
						fieldLabel: "วันที่ตามเอกสาร",
						width: 150,
					}, {
						xtype: "datefield",
						id: "frm-d_date_chg",
						name: "d_date_chg",
						fieldLabel: "วันที่บันทึกโอนย้ายในระบบ",
						width: 150,
					}
					, frmCostNew.mini
					, {
						fieldLabel: 'หมายเหตุ',
						xtype: 'textarea',
						id:'frm-c_comment',
						name:'c_comment',
						anchor: '60%'
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
						url : 'api/mnAmTransfer.php' , 
						params : {
							mode:'GENCODE',
							d_doc_date : Ext.getCmp('frm-d_doc_date').value,
							id :Ext.getCmp('frm-id').getValue(), 
						},
						method: 'GET', //POST
						success: function ( result, request ) { 
							var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
							if (jsonData.success) { 
								if(jsonData.c_code_gen){
									
									Ext.Msg.alert('Success' , ""
									+"<br/> เลขที่เอกสาร  : "+jsonData.c_code_gen
									+"<br/> วันที่บันทึก  : "+ Ext.getCmp('frm-d_doc_date').value,
									+"<br/> กรุณาเลือกช่วงวันที่บันทึกให้ถูกต้อง เพื่อค้นหาใบเบิกที่ต้องการ ");
									
									Ext.getCmp('contenterCenter').setActiveTab('tabpanel1');
									Ext.getCmp('tabpanel2').setDisabled(true);
									Ext.getCmp('tabpanel1').getStore().reload();  
								}

							} else {
								Ext.MessageBox.alert('Failed', jsonData.debug);			// alert massage error
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
					var chkCost = (parseInt(Ext.getCmp('frm-dc_cost_id').getValue()) > 0)? true : false;
					var chkName = (Ext.getCmp('frm-c_name').getValue() != '')? true : false;
					var chkCode = (Ext.getCmp('frm-c_code').getValue() != '')? true : false;
					var chkCostNew = (parseInt(Ext.getCmp('frm-dc_cost_id_new').getValue()) > 0)? true : false;
					
					if (!chkCost)
						Ext.Msg.alert('ผิดพลาด', 'กรุณาเลือก หน่วยงานเจ้าของสินทรัพย์');
					else if (!chkName)
						Ext.Msg.alert('ผิดพลาด', 'กรุณาระบุ เรื่อง');
					else if (!chkCode)
						Ext.Msg.alert('ผิดพลาด', 'กรุณาระบุ เลขที่เอกสาร');
					else if (!chkCostNew)
						Ext.Msg.alert('ผิดพลาด', 'กรุณาระบุ หน่วยงานผู้รับโอน');
					else if (form.isValid()){ 
						form.submit({
							waitMsg:'Saving Data...',
							success : function(form, action) { 
								var data = Ext.decode(action.response.responseText);
								var hdr_id = data.hdr_id;
								Ext.getCmp('role-form-mode').setValue('EDIT');
								Ext.getCmp('frm-id').setValue(hdr_id);
								Ext.getCmp('frm-c_code_gen').setValue(data.c_code_gen);

			                    Ext.getCmp('GRID_DTL').show();
			                    Ext.getCmp('buAddDtl').show();
			                    Ext.getCmp('buDelDtl').show();

			        			// Load Method
			        			store_dtl.setBaseParam("am_tf_hdr_id", hdr_id);
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
	//InfoMainGrid('tabpanel1',true,true,true,false,false,false);
	
	if(i_add){
		 Ext.getCmp('buAdd').setDisabled(false);
	 }else{
		 Ext.getCmp('buAdd').setDisabled(true);
	 }
	
	 Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({header: "ผู้ที่สร้าง",		hidden:true,	sortable: true,	dataIndex:'dc_user_create_id'}));
	 Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({header: "วันที่สร้าง",	hidden:true,  	sortable: true,	dataIndex:'d_create', align:'center' , renderer:shortThaiDate }));
	 Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({header: "หน่วยงานผู้สร้าง",	hidden:true,	sortable: true,	dataIndex:'dc_user_create_cost_id' }));
	 Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({header: "ผู้แก้ไข", 	hidden:false,  	sortable: true, dataIndex:'dc_user_create_id' }));
	 Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({header: "วันที่แก้ไข", 	hidden:false,  	sortable: true, dataIndex:'d_update', align:'center' ,renderer:shortThaiDate, }));
	 Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({header: "หน่วยงานผู้แก้ไข",hidden:false,	sortable: true, dataIndex:'dc_user_update_cost_id' }));
	
	 Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({
		header: 'แสดง', 
		align: 'center',
		id: 'view',
		sortable: false,
		width: 50,
		dataIndex: 'id' ,
		renderer: function(value, metaData, record, row, col, store, gridView) {
			var i_enable = record.get('i_enable');
			if (record.get('i_enable')==Ext.CONF_STATUS_ENABLE)
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
			width: 50,
			dataIndex:'id' ,
			renderer: function(value, metaData, record, row, col, store, gridView) {
				if(record.get('i_is_update')== 1){
					return'<img src="../images/icons/document_edit.gif"); style="cursor:pointer"/>';
				}else{ 
					return '';
				} 	
				
			}
		})); 
	};
	
	if (i_delete)
	{
		//all
		Ext.getCmp("role-form-mode").setValue('EDIT'); 
		Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({	
			header: "ยกเลิกรายการ",
			sortable: false,
			align:'center',
			id:'remove',
			width: 50,
			dataIndex:'id' ,
			renderer: function(value, metaData, record, row, col, store, gridView) {
				if(record.get('i_is_update')== 1){
					return'<img src="../images/icons/document_delete.gif"); style="cursor:pointer"/>';
				}else{ 
					return '';
				} 	
				
			}
		})); 
	}
	/*====================== RENDER ======================*/
	
});