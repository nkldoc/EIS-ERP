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
    var title_panel = "บันทึกการนำเข้าสินทรัพย์";
    /*===============================================*/

    var storeMain = new Ext.data.JsonStore({
        storeId: 'myStore',
        autoDestroy: true,
        autoLoad: true,
        url : 'api/ListAmRegister.php',
        root: 'data',
        baseParams: { type: "HDR", i_read:user_right_read }, //Permission i_read
        idProperty: 'id',
        totalProperty: 'totalCount',
        fields: [
                    { name: 'no' },
                    { name: 'id' },
                    { name: 'c_code' },
                    { name: 'c_name' },
                    { name: 'i_is_success' },
                    { name: 'str_success' },
                    { name: 'i_is_status' },
                    { name: 'i_is_ruins' },
                    { name: 'd_doc_date' },
                    { name: 'str_date' },
                    { name: 'i_is_show' },
                    { name: 'c_comment' },
                    { name: 'i_enable' },
                    { name: 'dc_user_create_id' },
                    { name: 'dc_user_create_cost_id' },
                    { name: 'd_create' },
                    { name: 'dc_user_update_id' },
                    { name: 'dc_user_update_cost_id' },
                    { name: 'd_update' },
                    { name: 'i_show_gen'}
            ]
    });
	
    var store_dtl = new Ext.data.JsonStore({
        url : 'api/ListAmRegister.php',
        root: 'data',
        baseParams: { type: "DTL", i_read:user_right_read },
        idProperty: 'id',
        totalProperty: 'totalCount',
        fields: [     
                { name : "no" },
                { name : "id" },
                { name : "am_tran_rg_hdr_id" },
                { name : "ins_is_method" },
                { name : "i_is_ins" },
                { name : "c_code" },
                { name : "c_name" },
                { name : "c_brand" },
                { name : "c_model" },
                { name : "c_serial" },
                { name : "c_type" },
                { name : "c_method_type" },
                { name : "c_number_body" },
                { name : "c_number_mech" },
                { name : "c_car_license" },
                { name : "c_asset_code_old" },
                { name : "c_cost_asset" },
                { name : "c_cost_ruins" },
                { name : "c_ext_cnt" },
                { name : "f_depreciate" },
                { name : "p_area" },
                { name : "p_deed" },
                { name : "p_num_area" },
                { name : "p_division" },
                { name : "p_province" },
                { name : "dc_cost_id" },
                { name : "cost_name" },
                { name : "dc_asset_method_id" },
                { name : "d_register_date" },
                { name : "str_register_date" },
                { name : "d_receive_date" },
                { name : "str_receive_date" },
                { name : "d_start_warranty" },
                { name : "str_s_warranty_date" },
                { name : "d_end_warranty" },
                { name : "str_e_warranty_date" },
                { name : "i_period_year" },
                { name : "i_is_expense" },
                { name : "i_is_success" },
                { name : "i_is_register" },
                { name : "i_is_download" },
                { name : "i_is_out_side" },
                { name : "i_is_audit" },
                { name : "i_is_split" },
                { name : "d_depreciate" },
                { name : "str_depre_date" },
                { name : "dc_cost_id_tranfer" },
                { name : "f_depreciate_bal" },
                { name : "dc_cost_old_id" },
                { name : "c_doc_imp" },
                { name : "d_doc_imp" },
                { name : "str_imp_date" },
                { name : "c_comment" }
	]
    });
	
    var storeAssetMethod = new Ext.data.JsonStore({ 
        autoLoad: true,
        storeId: 'mystoreAssetMethod',
        url: 'api/All_AmCombo.php',
        baseParams: {type : 'storeAssetMethod'},
        root: 'data',
        idProperty: 'id',
        totalProperty: 'totalCount',
        fields: [ 'no','id', 'c_code', 'c_name']
    });
	
    // store form detail
    var storeAssetGroup = new Ext.data.JsonStore({ 
        autoLoad: true,
        storeId: 'myStoreAssetGroup',
        url: 'api/All_AmCombo.php',
        baseParams: {type : 'storeAssetGroup'},
        root: 'data',
        idProperty: 'id',
        totalProperty: 'totalCount',
        fields: [ 'no','id', 'asset_type', 'c_code', 'c_code_name']
    });
	
    var storeAssetType = new Ext.data.JsonStore({
        storeId: 'myStoreAssetType',
        url: 'api/All_AmCombo.php',
        baseParams: {type : 'storeAssetByParent', conType : 'isType'},
        root: 'data',
        idProperty: 'id',
        totalProperty: 'totalCount',
        fields: [ 'no','id', 'c_code', 'c_code_name']
    });

    var storeAssetLast = new Ext.data.JsonStore({
        storeId: 'myStoreAssetLast',
        url: 'api/All_AmCombo.php',
        baseParams: {type : 'storeAssetByParent', conType : 'isLast'},
        root: 'data',
        idProperty: 'id',
        totalProperty: 'totalCount',
        fields: [ 'no','id', 'c_code', 'c_code_name']
    });
	
    var storeAssetInsurance = new Ext.data.JsonStore({ 
        autoLoad: true,
        storeId: 'mystoreAssetInsurance',
        url: 'api/All_AmCombo.php',
        baseParams: {type : 'storeAssetInsurance'},
        root: 'data',
        idProperty: 'id',
        totalProperty: 'totalCount',
        fields: [ 'no','id', 'c_code', 'c_name']
    });
    // end store detail

    // pagingBar
    var pagingBar = new Ext.PagingToolbar({
        pageSize: 20,
        store: storeMain,
        displayInfo: true,
        displayMsg: 'Displaying topics {0} - {1} of {2}'
    });
	
	// Search Group
	var sGroup1 = [{
		xtype: 'displayfield', 
		value: 'เลขที่นำเข้าสินทรัพย์   : ' , 
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
		value:'วันที่บันทึกรายการ  : ',
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
	
	var sGroup2= [{
		xtype: 'displayfield', 
		value: 'เรื่อง   : ' , 
		cls: 'ui-label',  	        	
	},{			
		id : "s-c_name",
		xtype : "textfield", 
		fieldLabel : "fieldLabel",
		width:350
		//listeners: Ext.enterSubmit,
	},{ //lable
		xtype: 'displayfield',  
		value:'สถานะรายการ   : ',
		cls: 'ui-label',  
	},{
		id 		  : "s-i_is_status",
		xtype     : 'combo',
		mode	  : 'local',
		store     : new Ext.data.SimpleStore({
						fields: [ "value", "text" ],
						data: [
						    [ "ALL", "ทั้งหมด" ],
						    [ Ext.ASSET_STATUS_WAIT, "รอดำเนินการ" ],
						    [ Ext.ASSET_STATUS_SUCCESS, "เสร็จสมบูรณ์" ]
						]
			}),
		valueField: "value",
		displayField: "text",
		value : "ALL",
		editable : false,
		triggerAction: "all",
		typeAhead : false,
	} ];
	//End Search Group
	
	var gridMain = new Ext.grid.GridPanel({
		region: "center",
		layout: "fit",
		title: "แสดงรายการขึ้นทะเบียนสินทรัพย์",
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
							//buGencode
							Ext.getCmp('buGencodeID').hide();

							Ext.getCmp("frm-d_doc_date").setValue(addY(543));
							Ext.getCmp('frm-i_is_status').setValue(Ext.getCmp('frm-i_is_status').store.data.items[0].id);
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
									storeMain.setBaseParam("c_name", Ext.getCmp("s-c_name").getValue());
									storeMain.setBaseParam("d_begin", Ext.getCmp("s_d_beginID").getValue());
									storeMain.setBaseParam("d_end", Ext.getCmp("s_d_endID").getValue());
									storeMain.setBaseParam('i_is_status',Ext.getCmp("s-i_is_status").getValue());
									storeMain.load();
								}
					     },{
				                text: "เริ่มใหม่",
				                align: 'center',
				                iconCls: 'icon-reset',
				                handler: function() {
									Ext.getCmp("s_d_beginID").setValue(defaultDate(1));
									Ext.getCmp("s_d_endID").setValue(defaultDate(2));
									Ext.getCmp("s-c_code_gen").setValue('');
									Ext.getCmp("s-c_code").setValue(''); 
									Ext.getCmp("s-i_is_status").setValue('ALL');
				                }
				            }]
				}],
		columns: [
		    new Ext.grid.RowNumberer({header:"ที่", width: 30,
				renderer: function(value, metaData, record, row, col, store, gridView) {
					return record.get("no");
				}
			}),
			{ header: "เลขที่นำเข้าสินทรัพย์", sortable: true, width:100, dataIndex: "c_code", align:'center' },
			{ header: "วันที่บันทึกรายการ", sortable: true, dataIndex: "str_date", align:'center' },
			{ header: "เรื่อง", sortable: true, width: 250, dataIndex: "c_name" , id:'G-c_name',
				renderer: function(value, metaData, record, row, col, store, gridView) {
					var i_is_status = record.get('i_is_status');
					if(i_is_status == 1){ 
						return'<font color=blue nowrap>(ข้อมูลเริ่มต้นระบบ)</font> '+ value;
					}else{ 
						return value;
					} 	
					
				}
			},
			{ header: "สถานะรายการ", sortable: true, width: 100, dataIndex: "str_success" , align:'center'},
		],
		autoExpandColumn: "G-c_name",
		bbar: pagingBar
	}); //gridMain

	function cellClick(grid, rowIndex, columnIndex, e) {
		var record = grid.getStore().getAt(rowIndex); 
		
		if (columnIndex == grid.getColumnModel().getIndexById('edit')) {
			
			if(record.get('c_code')== 'SD'){ 
				Ext.getCmp('icon-save').show();
				Ext.getCmp('tabpanel2').setDisabled(false);
				Ext.getCmp('contenterCenter').setActiveTab('tabpanel2');
				Ext.getCmp('form-widgets').getForm().reset();
				Ext.getCmp("form-widgets").getForm().loadRecord(record);
				
				if (record.get('c_code') == "SD")
				{
					Ext.getCmp("role-form-mode").setValue("EDIT");
					//buGencode
					if (record.get('i_show_gen') == '1')
						Ext.getCmp('buGencodeID').show();
					else
						Ext.getCmp('buGencodeID').hide();
					
					Ext.getCmp('buAddDtl').show();
				}
				else
				{
					Ext.getCmp("role-form-mode").setValue("VIEW");
					//button
					Ext.getCmp('icon-save').hide();
					Ext.getCmp('buGencodeID').hide();
					Ext.getCmp('buAddDtl').hide();
				}

				Ext.getCmp('GRID_DTL').show();
				Ext.getCmp("frm-i_is_status").setValue(record.data.i_is_status);

				// Load Method
				store_dtl.setBaseParam("am_tran_rg_hdr_id", record.data.id);
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
			Ext.getCmp("frm-i_is_status").setValue(record.data.i_is_status);
			
			//buGencode
			Ext.getCmp('buGencodeID').hide();
			Ext.getCmp('GRID_DTL').show();
			
			Ext.getCmp('buAddDtl').hide();
			
			// Load Method
			store_dtl.setBaseParam("am_tran_rg_hdr_id", record.data.id);
			store_dtl.setBaseParam("type", "DTL");
			store_dtl.load();
			
		} else if (columnIndex == grid.getColumnModel().getIndexById('remove')) {
			if(record.get('c_code')== 'SD'){ 
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
								url : 'api/mnAmRegister.php' ,
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
		} else if (columnIndex == grid.getColumnModel().getIndexById('regis')){
			var c_code = record.get('c_code');
			var i_is_success = record.get('i_is_success');
			if (c_code!='SD' && i_is_success == Ext.ASSET_STATUS_WAIT)
			{
				var frm = popFrmRegister(record.get('id'));
				frm.show();
			}
		}
	};
	
	function cellClick_dtl(grid, rowIndex, columnIndex, e) {
		
		var record = grid.getStore().getAt(rowIndex);
		if (columnIndex == grid.getColumnModel().getIndexById('edit')) {
			
			if (Ext.getCmp('role-form-mode').getValue() != "VIEW")
			{
				var frmDtl = popFrmDtl();
				frmDtl.show();
				Ext.Ajax.request({
					url : 'api/ListAmRegister.php' ,
					method: 'POST',
					params : { 
                                            type : 'GET_ASSET',
                                            c_code : record.get('c_code')
					},
					success: function ( result, request ) {
                                            var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
                                            var asset_type = jsonData.data.asset_type;

                                            Ext.getCmp("frmd-mode").setValue('EDIT_DTL');
                                            Ext.getCmp("frmd-id").setValue(record.get('id'));
                                            Ext.getCmp("frmd-am_tran_rg_hdr_id").setValue(record.get('am_tran_rg_hdr_id'));
                                            Ext.getCmp("frmd-asset_type").setValue(asset_type);
                                            Ext.getCmp("frmd-dc_cost_id").setValue(record.get('dc_cost_id'));
                                            Ext.getCmp("frmd-dc_cost_id_Name").setValue(record.get('cost_name'));
                                            Ext.getCmp("frmd-c_name").setValue(record.get('c_name'));
                                            Ext.getCmp("frmd-c_cost_asset").setValue(record.get('c_cost_asset'));
                                            Ext.getCmp("frmd-d_register_date").setValue(record.get('d_register_date'));
                                            Ext.getCmp("frmd-d_receive_date").setValue(record.get('d_receive_date'));
                                            Ext.getCmp("frmd-d_start_warranty").setValue(record.get('d_start_warranty'));
                                            Ext.getCmp("frmd-d_end_warranty").setValue(record.get('d_end_warranty'));
                                            Ext.getCmp("frmd-dc_asset_method_id").setValue(record.get('dc_asset_method_id'));
                                            Ext.getCmp("frmd-c_comment").setValue(record.get('c_comment'));

                                            // Load Inventory Type
                                            var c_code = record.data.c_code;
                                            var asset_group = c_code.substring(0, 2);
                                            var dc_asset_type = c_code.substring(0, 4);
                                            Ext.getCmp('frmd-asset_group').setValue(asset_group);
                                            storeAssetType.setBaseParam("codeParent", asset_group);
                                            storeAssetType.load({
                                                callback : function (records, operation, success)
                                                {
                                                    if (success)
                                                    {
                                                        Ext.getCmp('frmd-dc_asset_type').setValue(dc_asset_type);

                                                        // Load Inventory
                                                        storeAssetLast.setBaseParam("codeParent", dc_asset_type);
                                                        storeAssetLast.load({
                                                            callback : function (records, operation, success)
                                                            {
                                                                if (success)
                                                                {
                                                                    Ext.getCmp('frmd-asset_code').setValue(c_code);
                                                                }
                                                            }
                                                        });
                                                    }
                                                }
                                            });
						
                                            Ext.getCmp('frmd-asset_type').setValue(asset_type);
                                            if (parseInt(asset_type) == parseInt(Ext.ASSET_TYPE_LAND)){ // ที่ดิน
						
							Ext.getCmp('frmd-p_province').show();
							Ext.getCmp('frmd-p_area').show();
							Ext.getCmp('frmd-p_deed').show();
							
							Ext.getCmp('frmd-p_province').setValue(record.get('p_province'));
							Ext.getCmp('frmd-p_area').setValue(record.get('p_area'));
							Ext.getCmp('frmd-p_deed').setValue(record.get('p_deed'));
							
							Ext.getCmp('frmd-c_brand').hide();
							Ext.getCmp('frmd-c_serial').hide();
							Ext.getCmp('frmd-c_model').hide();
							Ext.getCmp('frmd-c_type').hide();
                                                        Ext.getCmp('frmd-c_number_body').hide();
                                                        Ext.getCmp('frmd-c_number_mech').hide();
                                                        Ext.getCmp('frmd-c_car_license').hide();
							Ext.getCmp('frmd-c_asset_code_old').hide();
							Ext.getCmp('frmd-c_cost_ruins').hide();
							Ext.getCmp('frmd-i_period_year').hide();
							Ext.getCmp('frmd-f_depreciate').hide();
							Ext.getCmp('frmd-d_depreciate').hide();
							Ext.getCmp('frmd-ins_is_method').hide();
							Ext.getCmp('frmd-i_is_ins').hide();
						} else if(parseInt(asset_type) == parseInt(Ext.ASSET_TYPE_EQUIP)){
							Ext.getCmp('frmd-p_province').hide();
							Ext.getCmp('frmd-p_area').hide();
							Ext.getCmp('frmd-p_deed').hide();
                                                        
                                                        Ext.getCmp('frmd-c_number_body').hide();
                                                        Ext.getCmp('frmd-c_number_mech').hide();
                                                        Ext.getCmp('frmd-c_car_license').hide();
							
							Ext.getCmp('frmd-c_brand').show();
							Ext.getCmp('frmd-c_serial').show();
							Ext.getCmp('frmd-c_model').show();
							Ext.getCmp('frmd-c_type').show();
							Ext.getCmp('frmd-c_asset_code_old').show();
							Ext.getCmp('frmd-c_cost_ruins').show();
							Ext.getCmp('frmd-i_period_year').show();
							Ext.getCmp('frmd-f_depreciate').show();
							Ext.getCmp('frmd-d_depreciate').show();
							Ext.getCmp('frmd-ins_is_method').show();
							Ext.getCmp('frmd-i_is_ins').show();
							
							Ext.getCmp('frmd-c_brand').setValue(record.get('c_brand'));
							Ext.getCmp('frmd-c_serial').setValue(record.get('c_serial'));
							Ext.getCmp('frmd-c_model').setValue(record.get('c_model'));
							Ext.getCmp('frmd-c_type').setValue(record.get('c_type'));
							Ext.getCmp('frmd-c_asset_code_old').setValue(record.get('c_asset_code_old'));
							Ext.getCmp('frmd-c_cost_ruins').setValue(record.get('c_cost_ruins'));
							
							Ext.getCmp('frmd-i_period_year').setValue(record.get('i_period_year'));
							Ext.getCmp('frmd-f_depreciate').setValue(record.get('f_depreciate'));
							Ext.getCmp('frmd-d_depreciate').setValue(record.get('d_depreciate'));
							Ext.getCmp('frmd-ins_is_method').setValue(record.get('ins_is_method'));
							Ext.getCmp('frmd-i_is_ins').setValue(record.get('i_is_ins'));
						}else if(parseInt(asset_type) == parseInt(Ext.ASSET_TYPE_VEHICLE)){
							Ext.getCmp('frmd-p_province').hide();
							Ext.getCmp('frmd-p_area').hide();
							Ext.getCmp('frmd-p_deed').hide();
                                                        Ext.getCmp('frmd-c_type').hide();
							
							Ext.getCmp('frmd-c_brand').show();
							Ext.getCmp('frmd-c_serial').show();
							Ext.getCmp('frmd-c_model').show();
                                                        Ext.getCmp('frmd-c_number_body').show();
                                                        Ext.getCmp('frmd-c_number_mech').show();
                                                        Ext.getCmp('frmd-c_car_license').show();
							Ext.getCmp('frmd-c_asset_code_old').show();
							Ext.getCmp('frmd-c_cost_ruins').show();
							Ext.getCmp('frmd-i_period_year').show();
							Ext.getCmp('frmd-f_depreciate').show();
							Ext.getCmp('frmd-d_depreciate').show();
							Ext.getCmp('frmd-ins_is_method').show();
							Ext.getCmp('frmd-i_is_ins').show();
							
							Ext.getCmp('frmd-c_brand').setValue(record.get('c_brand'));
							Ext.getCmp('frmd-c_serial').setValue(record.get('c_serial'));
							Ext.getCmp('frmd-c_model').setValue(record.get('c_model'));
							
                                                        Ext.getCmp('frmd-c_number_body').setValue(record.get('c_number_body'));
                                                        Ext.getCmp('frmd-c_number_mech').setValue(record.get('c_number_mech'));
                                                        Ext.getCmp('frmd-c_car_license').setValue(record.get('c_car_license'));
							Ext.getCmp('frmd-c_asset_code_old').setValue(record.get('c_asset_code_old'));
							Ext.getCmp('frmd-c_cost_ruins').setValue(record.get('c_cost_ruins'));
							
							Ext.getCmp('frmd-i_period_year').setValue(record.get('i_period_year'));
							Ext.getCmp('frmd-f_depreciate').setValue(record.get('f_depreciate'));
							Ext.getCmp('frmd-d_depreciate').setValue(record.get('d_depreciate'));
							Ext.getCmp('frmd-ins_is_method').setValue(record.get('ins_is_method'));
							Ext.getCmp('frmd-i_is_ins').setValue(record.get('i_is_ins'));
						}
						
					},
					failure: function ( result, request) { 
                                            Ext.MessageBox.alert('Failed', result.responseText);		// connect error
					}
				});
			}
		}else if (columnIndex == grid.getColumnModel().getIndexById('remove')) {
			if (Ext.getCmp('role-form-mode').getValue() != "VIEW")
			{
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
								url : 'api/mnAmRegister.php' ,
								method: 'POST',
								params : { 
									mode : 'DELETE_DTL',
									id : record.get('id')
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
									
									// Load Method
				        			store_dtl.load();
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
	}
	
	//=========================================================================================//
	
	function popFrmDtl(){
		
		var storeCost	= new Ext.data.JsonStore({ 
                    autoLoad: true,
                    storeId: 'myStoreCost',
                    url: 'api/All_AmCombo.php',
                    baseParams: {type : 'storeCost'},
		    root: 'data',
		    idProperty: 'id',
                    totalProperty: 'totalCount',
		    fields: [ 'no','id', 'c_code','c_name']
		});
		
		var popfrmCost = new Ext.ux.Poplov({
		    id			: 'frmd-dc_cost_id',	//go to relation	
		    iconCls		: 'page_magnify', 
		    valueHidden : 'dc_cost_id', 	//go to hidden
		    store		: storeCost,
		    headerGrid	: ColumGridPop,
		    widthText	: 340, 
		    fieldLabel	: 'หน่วยงานที่ขอเบิก', 
		});
		
		var frmDtl = new Ext.Window({
			id : "frmd",
			xtype: 'form',
			title : "ข้อมูลรายละเอียดรสินทรัพย์",
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
					defaults: { allowBlank: true},
					labelWidth : 200,
					bodyStyle: 'padding: 10px;',
					items: [{
						id: "frmd-mode",
						xtype: "hidden",
						name : "mode" ,
						value : "ADD_DTL",
						readOnly: true
					},{
						xtype : 'hidden',
						id : 'frmd-store_dtl',
						readOnly : true,
						value : 1
					}, {
						xtype: "hidden",
						id : "frmd-am_tran_rg_hdr_id",
						readOnly: true
					}, {
						xtype: "hidden",
						id: "frmd-id",
						readOnly: true
					}, {
						xtype: "hidden",
						id: "frmd-asset_type",
						readOnly: true
					},new Ext.form.ComboBox({
						id: "frmd-asset_group",
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
											Ext.getCmp('frmd-dc_asset_type').setValue(storeAssetType.data.items[0].get('c_code'));
											
											// Load Inventory
											var codeType = storeAssetType.data.items[0].get('c_code');
											storeAssetLast.setBaseParam("codeParent", codeType);
											storeAssetLast.load({
												callback : function (records, operation, success)
												{
													if (success)
													{
														Ext.getCmp('frmd-asset_code').setValue(storeAssetLast.data.items[0].get('c_code'));
													}
												}
											});
										}
									}
								});
								
								Ext.getCmp('frmd-asset_type').setValue(record.data.asset_type);
								if (parseInt(record.data.asset_type) == parseInt(Ext.ASSET_TYPE_LAND)){ // ที่ดิน

                                                                    Ext.getCmp('frmd-p_province').show();
                                                                    Ext.getCmp('frmd-p_area').show();
                                                                    Ext.getCmp('frmd-p_deed').show();

                                                                    Ext.getCmp('frmd-c_brand').hide();
                                                                    Ext.getCmp('frmd-c_serial').hide();
                                                                    Ext.getCmp('frmd-c_model').hide();
                                                                    Ext.getCmp('frmd-c_type').hide();

                                                                    Ext.getCmp('frmd-c_number_body').hide();
                                                                    Ext.getCmp('frmd-c_number_mech').hide();
                                                                    Ext.getCmp('frmd-c_car_license').hide();

                                                                    Ext.getCmp('frmd-c_asset_code_old').hide();
                                                                    Ext.getCmp('frmd-c_cost_ruins').hide();
                                                                    Ext.getCmp('frmd-i_period_year').hide();
                                                                    Ext.getCmp('frmd-f_depreciate').hide();
                                                                    Ext.getCmp('frmd-d_depreciate').hide();
                                                                    Ext.getCmp('frmd-ins_is_method').hide();
                                                                    Ext.getCmp('frmd-i_is_ins').hide();
                                                                } else if(parseInt(record.data.asset_type) == parseInt(Ext.ASSET_TYPE_EQUIP)){
                                                                    Ext.getCmp('frmd-p_province').hide();
                                                                    Ext.getCmp('frmd-p_area').hide();
                                                                    Ext.getCmp('frmd-p_deed').hide();

                                                                    Ext.getCmp('frmd-c_number_body').hide();
                                                                    Ext.getCmp('frmd-c_number_mech').hide();
                                                                    Ext.getCmp('frmd-c_car_license').hide();

                                                                    Ext.getCmp('frmd-c_brand').show();
                                                                    Ext.getCmp('frmd-c_serial').show();
                                                                    Ext.getCmp('frmd-c_model').show();
                                                                    Ext.getCmp('frmd-c_type').show();
                                                                    Ext.getCmp('frmd-c_asset_code_old').show();
                                                                    Ext.getCmp('frmd-c_cost_ruins').show();
                                                                    Ext.getCmp('frmd-i_period_year').show();
                                                                    Ext.getCmp('frmd-f_depreciate').show();
                                                                    Ext.getCmp('frmd-d_depreciate').show();
                                                                    Ext.getCmp('frmd-ins_is_method').show();
                                                                    Ext.getCmp('frmd-i_is_ins').show();
                                                                    Ext.getCmp('frmd-i_is_ins').setValue(storeAssetInsurance.data.items[0].id);
                                                                } else if (parseInt(record.data.asset_type) == parseInt(Ext.ASSET_TYPE_VEHICLE)){
                                                                    Ext.getCmp('frmd-p_province').hide();
                                                                    Ext.getCmp('frmd-p_area').hide();
                                                                    Ext.getCmp('frmd-p_deed').hide();
                                                                    Ext.getCmp('frmd-c_type').hide();

                                                                    Ext.getCmp('frmd-c_brand').show();
                                                                    Ext.getCmp('frmd-c_serial').show();
                                                                    Ext.getCmp('frmd-c_model').show();
                                                                    Ext.getCmp('frmd-c_number_body').show();
                                                                    Ext.getCmp('frmd-c_number_mech').show();
                                                                    Ext.getCmp('frmd-c_car_license').show();

                                                                    Ext.getCmp('frmd-c_asset_code_old').show();
                                                                    Ext.getCmp('frmd-c_cost_ruins').show();
                                                                    Ext.getCmp('frmd-i_period_year').show();
                                                                    Ext.getCmp('frmd-f_depreciate').show();
                                                                    Ext.getCmp('frmd-d_depreciate').show();
                                                                    Ext.getCmp('frmd-ins_is_method').show();
                                                                    Ext.getCmp('frmd-i_is_ins').show();
                                                                    Ext.getCmp('frmd-i_is_ins').setValue(storeAssetInsurance.data.items[0].id);
                                                                }
							}
						}
					}),new Ext.form.ComboBox({
						id: "frmd-dc_asset_type",
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
						emptyText: "กรุณาเลือก...",
						listeners: {
							select: function(combo, record, index) {
								// Load Inventory
								var codeParent = record.data.c_code;
								storeAssetLast.setBaseParam("codeParent", codeParent);
								storeAssetLast.load({
									callback : function (records, operation, success)
									{
										if (success)
										{
                                                                                    Ext.getCmp('frmd-asset_code').setValue(storeAssetLast.data.items[0].get('c_code'));
										}
									}
								});
							}
						}
					}),new Ext.form.ComboBox({
						id: "frmd-asset_code",
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
						emptyText: "กรุณาเลือก...",
						listeners: {
							select: function(combo, record, index) {
								
							}
						}
					}),
					popfrmCost.mini
					,{
						xtype: 'textfield',
						fieldLabel: 'ชื่อสินทรัพย์',
						id : "frmd-c_name",
						width: 300,
						validator: function(val) {
							if (Ext.isEmpty(val) && isNumber(val)){
								Ext.MessageBox.alert('Failed', 'กรุณาระบุ ชื่อสินทรัพย์');
		        				return false;
			        		}else
			        			return true;
			        	}
					},{
						xtype: 'textfield',
						fieldLabel: 'จังหวัด',
						id : "frmd-p_province",
						width: 300,
						hidden : true
					},{
						xtype: 'textfield',
						fieldLabel: 'จำนวนเนื้อที่',
						id : "frmd-p_area",
						width: 300,
						hidden : true
					},{
						xtype: 'textfield',
						fieldLabel: 'เลขที่โฉนด / นส.3ก',
						id : "frmd-p_deed",
						width: 300,
						hidden : true
					},{
						xtype: 'textfield',
						fieldLabel: 'ยี่ห้อ',
						id : "frmd-c_brand",
						width: 300,
						hidden : true
					},{
						xtype: 'textfield',
						fieldLabel: 'Serial No',
						id : "frmd-c_serial",
						width: 300,
						hidden : true
					},{
						xtype: 'textfield',
						fieldLabel: 'รุ่น - แบบ',
						id : "frmd-c_model",
						width: 300,
						hidden : true
					},{
						xtype: 'textfield',
						fieldLabel: 'ขนาด',
						id : "frmd-c_type",
						width: 300,
						hidden : true
					},{
                                            xtype: 'textfield',
                                            fieldLabel: 'หมายเลขตัวถัง',
                                            id : "frmd-c_number_body",
                                            width: 300,
                                            hidden : true
					},{
                                            xtype: 'textfield',
                                            fieldLabel: 'หมายเลขแซทซี',
                                            id : "frmd-c_number_mech",
                                            width: 300,
                                            hidden : true
					},{
                                            xtype: 'textfield',
                                            fieldLabel: 'ทะเบียนรถ',
                                            id : "frmd-c_car_license",
                                            width: 300,
                                            hidden : true
					},{
						xtype: 'textfield',
						fieldLabel: 'หมายเลขสินทรัพย์',
						id : "frmd-c_asset_code_old",
						width: 300,
						hidden : true
					},{
						xtype: 'textfield',
						fieldLabel: 'ราคาทุน',
						id : "frmd-c_cost_asset",
						width: 300,
						hidden : false
					},{
						xtype: 'textfield',
						fieldLabel: 'มูลค่าซาก',
						id : "frmd-c_cost_ruins",
						width: 300,
						hidden : true
					},{
						xtype: 'textfield',
						fieldLabel: 'อายุการใช้งาน(ปี)',
						id : "frmd-i_period_year",
						width: 300,
						hidden : true
					},{
						xtype: 'textfield',
						fieldLabel: 'ค่าเสื่อมราคาสะสมยกมา',
						id : "frmd-f_depreciate",
						width: 300,
						hidden : true
					}, {
						xtype: "datefield",
						id: "frmd-d_register_date",
						name: "d_register_date",
						fieldLabel: "วันที่ขึ้นทะเบียน",
						width: 150,
					}, {
						xtype: "datefield",
						id: "frmd-d_receive_date",
						name: "d_receive_date",
						fieldLabel: "วันที่ได้มา/ตรวจรับ (ได้รับสินทรัพย์)",
						value : addY(543),
						width: 150,
					}, {
						xtype: "datefield",
						id: "frmd-d_start_warranty",
						name: "d_start_warranty",
						fieldLabel: "วันที่เริ่มต้นประกัน",
						width: 150,
					}, {
						xtype: "datefield",
						id: "frmd-d_end_warranty",
						name: "d_end_warranty",
						fieldLabel: "วันที่สิ้นสุดประกัน",
						width: 150,
					}, {
						xtype: "datefield",
						id: "frmd-d_depreciate",
						name: "d_depreciate",
						fieldLabel: "วันที่เริ่มต้นคิดค่าเสื่อมราคา",
						value : addY(543),
						width: 150,
						hidden : true
					}, new Ext.form.ComboBox({
						fieldLabel: "ประเภทการนำเข้าสินทรัพย์ ",
						id: "frmd-dc_asset_method_id",
						mode: "local",
						store: storeAssetMethod,
						valueField: "id",
						displayField: "c_name",
						triggerAction: "all",
						forceSelection: true,
						selectOnFocus: true,
						typeAhead : true,
						emptyText: "กรุณาเลือก...",
						width: 300,
						value : storeAssetMethod.data.items[0].id,
						listeners: {
							beforequery: function(q) {
								if (q.query) {
									var length = q.query.length;
									q.query = new RegExp(Ext.escapeRe(q.query));
									q.query.length = length;
								}
							},
							blur: function() { this.getStore().clearFilter(); }
						}
					}),{
						id : 'frmd-ins_is_method',
                        fieldLabel: 'การทำประกันภัย',
                        xtype: 'radiogroup',
                        hidden : true,
						columns: [120,120,120],
                        items: [{name: 'ins_is_method', boxLabel: 'ส่งทำประกันภัย', inputValue: 1, checked: true}
                        		,{name: 'ins_is_method', boxLabel: 'ไม่ทำประกันภัย', inputValue: 0}
                        		,{name: 'ins_is_method', boxLabel: 'อื่นๆ', inputValue: 2}
                        		]
                    }, new Ext.form.ComboBox({
						fieldLabel: "หมวดการประกันภัย ",
						id: "frmd-i_is_ins",
						mode: "local",
						store: storeAssetInsurance,
						valueField: "id",
						displayField: "c_name",
						triggerAction: "all",
						forceSelection: true,
						selectOnFocus: true,
						typeAhead : true,
						hidden : true,
						emptyText: "กรุณาเลือก...",
						width: 300,
						listeners: {
							afterrender : function()
							{
								
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
					}), {
						fieldLabel: 'คำอธิบายเพิ่มเติม',
						xtype: 'textfield',
						id : 'frmd-c_comment',
						width: 300,
					}]
			}],
			buttonAlign: 'left',
			buttons : [{
				text : Ext.GLOBAL_BU_SAVE_TH,
				iconCls	: 'icon-save',
				handler: function(){
					var mode = Ext.getCmp("frmd-mode").getValue();
					
					var am_tran_rg_hdr_id = Ext.getCmp("frmd-am_tran_rg_hdr_id").getValue();
					var id = Ext.getCmp("frmd-id").getValue();
					var asset_type = Ext.getCmp('frmd-asset_type').getValue();
					
					var code_asset_group = Ext.getCmp('frmd-asset_group').getValue();
					var dc_asset_type = Ext.getCmp('frmd-dc_asset_type').getValue();
					var asset_code = Ext.getCmp('frmd-asset_code').getValue();
					
					var dc_cost_id = Ext.getCmp('frmd-dc_cost_id').getValue();
					var c_name = Ext.getCmp('frmd-c_name').getValue();
					
					var c_cost_asset = Ext.getCmp('frmd-c_cost_asset').getValue();
					var d_register_date = Ext.getCmp('frmd-d_register_date').getValue();
					var d_receive_date = Ext.getCmp('frmd-d_receive_date').getValue();
					var d_start_warranty = Ext.getCmp('frmd-d_start_warranty').getValue();
					var d_end_warranty = Ext.getCmp('frmd-d_end_warranty').getValue();
					var dc_asset_method_id = Ext.getCmp('frmd-dc_asset_method_id').getValue();
					var c_comment = Ext.getCmp('frmd-c_comment').getValue();
					
					var p_province = Ext.getCmp('frmd-p_province').getValue();
					var p_area = Ext.getCmp('frmd-p_area').getValue();
					var p_deed = Ext.getCmp('frmd-p_deed').getValue();
					
					var c_brand = Ext.getCmp('frmd-c_brand').getValue();
					var c_serial = Ext.getCmp('frmd-c_serial').getValue();
					var c_model = Ext.getCmp('frmd-c_model').getValue();
                                        
					var c_type = Ext.getCmp('frmd-c_type').getValue();
                                        
                                        var c_number_body = Ext.getCmp('frmd-c_number_body').getValue();
                                        var c_number_mech = Ext.getCmp('frmd-c_number_mech').getValue();
                                        var c_car_license = Ext.getCmp('frmd-c_car_license').getValue();
                                        
					var c_asset_code_old = Ext.getCmp('frmd-c_asset_code_old').getValue();
					var c_cost_ruins = Ext.getCmp('frmd-c_cost_ruins').getValue();
					var i_period_year = Ext.getCmp('frmd-i_period_year').getValue();
					var f_depreciate = Ext.getCmp('frmd-f_depreciate').getValue();
					var d_depreciate = Ext.getCmp('frmd-d_depreciate').getValue();
					var ins_is_method = Ext.getCmp('frmd-ins_is_method').getValue().inputValue;
					var i_is_ins = Ext.getCmp('frmd-i_is_ins').getValue();
					
					if (code_asset_group == "")
                                            Ext.MessageBox.alert('ผิดพลาด', "กรุณาเลือกหมวดสินทรัพย์");
					else if (dc_asset_type == "")
                                            Ext.MessageBox.alert('ผิดพลาด', "กรุณาเลือกประเภทสินทรัพย์");
					else if (asset_code == "")
                                            Ext.MessageBox.alert('ผิดพลาด', "กรุณาเลือกรายการสินทรัพย์");
					else if (dc_cost_id == "")
                                            Ext.MessageBox.alert('ผิดพลาด', "กรุณาเลือกหน่วยงาน");
					else if (c_name == "")
                                            Ext.MessageBox.alert('ผิดพลาด', "กรุณาระบุชื่อสินทรัพย์");
					else if (Ext.isEmpty(c_cost_asset) || !isNumber(c_cost_asset))
                                            Ext.MessageBox.alert('ผิดพลาด', "กรุณากรอก ราคาทุน เป็นตัวเลขไม่ต้องใส่ ','");
					else 
					{
						Ext.Ajax.request({
							url : 'api/mnAmRegister.php' ,
							method: 'POST',
							params : { 
								mode : mode, 
								am_tran_rg_hdr_id : am_tran_rg_hdr_id,
								id : id,
								asset_type : asset_type,
								code_asset_group : code_asset_group,
								dc_asset_type : dc_asset_type,
								asset_code : asset_code,
								dc_cost_id : dc_cost_id,
								c_name : c_name,
								c_cost_asset : c_cost_asset,
								d_register_date : d_register_date,
								d_receive_date : d_receive_date,
								d_start_warranty : d_start_warranty,
								d_end_warranty : d_end_warranty,
								dc_asset_method_id : dc_asset_method_id,
								c_comment : c_comment,
								p_province : p_province,
								p_area : p_area,
								p_deed : p_deed,
								c_brand : c_brand,
								c_serial : c_serial,
								c_model : c_model,
								c_type : c_type,
                                                                c_number_body : c_number_body,
                                                                c_number_mech : c_number_mech,
                                                                c_car_license : c_car_license,
								c_asset_code_old : c_asset_code_old,
								c_cost_ruins : c_cost_ruins,
								i_period_year : i_period_year,
								f_depreciate : f_depreciate,
								d_depreciate : d_depreciate,
								ins_is_method : ins_is_method,
								i_is_ins : i_is_ins
							},
							success: function ( result, request ) {
								var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
								if (jsonData.success) {
									//Ext.MessageBox.alert('Success', jsonData.msg);		// alert massage success
									
									if (parseInt(Ext.getCmp('frmd-store_dtl').getValue()) == 2)
									{
										Ext.getCmp('panelExpGrid').getStore().load();
									}
									else
									{
										// Load Detail
					        			store_dtl.setBaseParam("am_tran_rg_hdr_id", am_tran_rg_hdr_id);
					        			store_dtl.setBaseParam("type", "DTL");
					        			store_dtl.load();
					        			
					        			//buGencode
					        			Ext.getCmp('buGencodeID').show();
									}
				        			
				        			
				        			Ext.getCmp("frmd").hide();
									Ext.getCmp("frmd").destroy();
								} else {
									Ext.MessageBox.alert('Failed', jsonData.msg);			// alert massage error
								}
							},
							failure: function ( result, request) { 
								Ext.MessageBox.alert('Failed', result.responseText);		// connect error
							}
						});
					}
					
				} //End Handle
			}, {
				text : Ext.GLOBAL_BU_BACK_TH,
				handler : function() {
					Ext.getCmp("frmd").hide();
					Ext.getCmp("frmd").destroy();
				}				
			}]
		});
		return frmDtl;
	}; //EndFunction
	
	function popFrmRegister(hdr_id){
		
		var store_register = new Ext.data.JsonStore({
                    autoLoad: true,
		    url : 'api/ListAmRegister.php',
		    root: 'data',
		    baseParams: { type: "ASSET_REGIS"
                                    , am_tran_rg_hdr_id : hdr_id
                                    , i_read:user_right_read },
		    idProperty: 'id',
			totalProperty: 'totalCount',
			fields: [     
					{ name : "no" },
					{ name : "id" },
					{ name : "am_tran_rg_hdr_id" },
					{ name : "ins_is_method" },
					{ name : "i_is_ins" },
					{ name : "i_seq" },
					{ name : "c_code" },
					{ name : "c_name" },
					{ name : "c_brand" },
					{ name : "c_model" },
					{ name : "c_serial" },
					{ name : "c_type" },
					{ name : "c_method_type" },
					{ name : "c_number_body" },
					{ name : "c_number_mech" },
					{ name : "c_car_license" },
					{ name : "c_asset_code_old" },
					{ name : "c_cost_asset" },
					{ name : "c_cost_ruins" },
					{ name : "c_ext_cnt" },
					{ name : "f_depreciate" },
					{ name : "c_cost_period" },
					{ name : "p_area" },
					{ name : "p_deed" },
					{ name : "p_num_area" },
					{ name : "p_division" },
					{ name : "p_province" },
					{ name : "dc_cost_id" },
					{ name : "cost_name" },
					{ name : "dc_asset_method_id" },
					{ name : "d_register_date" },
					{ name : "str_register_date" },
					{ name : "d_receive_date" },
					{ name : "str_receive_date" },
					{ name : "d_start_warranty" },
					{ name : "str_s_warranty_date" },
					{ name : "d_end_warranty" },
					{ name : "str_e_warranty_date" },
					{ name : "i_period_year" },
					{ name : "i_is_expense" },
					{ name : "i_is_success" },
					{ name : "i_is_register" },
					{ name : "i_is_download" },
					{ name : "i_is_out_side" },
					{ name : "i_is_audit" },
					{ name : "i_is_split" },
					{ name : "d_depreciate" },
					{ name : "str_depre_date" },
					{ name : "dc_cost_id_tranfer" },
					{ name : "f_depreciate_bal" },
					{ name : "dc_cost_old_id" },
					{ name : "c_doc_imp" },
					{ name : "d_doc_imp" },
					{ name : "str_imp_date" },
					{ name : "c_comment" },
					{ name : "asset_code" },
					{ name : "cost_acc" },
					{ name : "str_insurance" },
					{ name : "i_valid"}
			]
		});
		
		function cellClick_Regis(grid, rowIndex, columnIndex, e) {
			
			var record = grid.getStore().getAt(rowIndex);
			if (columnIndex == grid.getColumnModel().getIndexById('frmRegEdit')) {
				var i_valid = record.get("i_valid");
				if (parseInt(i_valid) != 1){
					var frmDtl = popFrmDtl();
					frmDtl.show();
					
					Ext.Ajax.request({
						url : 'api/ListAmRegister.php' ,
						method: 'POST',
						params : { 
							type : 'GET_ASSET',
							c_code : record.get('c_code')
						},
						success: function ( result, request ) {
							var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
							var asset_type = jsonData.data.asset_type;
							
							Ext.getCmp("frmd-mode").setValue('EDIT_DTL');
							Ext.getCmp("frmd-store_dtl").setValue(2);
							Ext.getCmp("frmd-id").setValue(record.get('id'));
							Ext.getCmp("frmd-am_tran_rg_hdr_id").setValue(record.get('am_tran_rg_hdr_id'));
							Ext.getCmp("frmd-asset_type").setValue(asset_type);
							Ext.getCmp("frmd-dc_cost_id").setValue(record.get('dc_cost_id'));
							Ext.getCmp("frmd-dc_cost_id_Name").setValue(record.get('cost_name'));
							Ext.getCmp("frmd-c_name").setValue(record.get('c_name'));
							Ext.getCmp("frmd-c_cost_asset").setValue(record.get('c_cost_asset'));
							Ext.getCmp("frmd-d_register_date").setValue(record.get('d_register_date'));
							Ext.getCmp("frmd-d_receive_date").setValue(record.get('d_receive_date'));
							Ext.getCmp("frmd-d_start_warranty").setValue(record.get('d_start_warranty'));
							Ext.getCmp("frmd-d_end_warranty").setValue(record.get('d_end_warranty'));
							Ext.getCmp("frmd-dc_asset_method_id").setValue(record.get('dc_asset_method_id'));
							Ext.getCmp("frmd-c_comment").setValue(record.get('c_comment'));
							
							// Load Inventory Type
							var c_code = record.data.c_code;
							var inv_group = c_code.substring(0, 2);
							var inv_type = c_code.substring(0, 4);
							Ext.getCmp('frmd-asset_group').setValue(inv_group);
							storeAssetType.setBaseParam("codeParent", inv_group);
							storeAssetType.load({
								callback : function (records, operation, success)
								{
									if (success)
									{
										Ext.getCmp('frmd-dc_asset_type').setValue(inv_type);
										
										// Load Inventory
										storeAssetLast.setBaseParam("codeParent", inv_type);
										storeAssetLast.load({
											callback : function (records, operation, success)
											{
												if (success)
												{
													Ext.getCmp('frmd-asset_code').setValue(c_code);
												}
											}
										});
									}
								}
							});
							
							Ext.getCmp('frmd-asset_type').setValue(asset_type);
							if (parseInt(asset_type) == parseInt(Ext.ASSET_TYPE_LAND)){ // ที่ดิน
							
								Ext.getCmp('frmd-p_province').show();
								Ext.getCmp('frmd-p_area').show();
								Ext.getCmp('frmd-p_deed').show();
								
								Ext.getCmp('frmd-p_province').setValue(record.get('p_province'));
								Ext.getCmp('frmd-p_area').setValue(record.get('p_area'));
								Ext.getCmp('frmd-p_deed').setValue(record.get('p_deed'));
								
								Ext.getCmp('frmd-c_brand').hide();
								Ext.getCmp('frmd-c_serial').hide();
								Ext.getCmp('frmd-c_model').hide();
								Ext.getCmp('frmd-c_type').hide();
								Ext.getCmp('frmd-c_asset_code_old').hide();
								Ext.getCmp('frmd-c_cost_ruins').hide();
								Ext.getCmp('frmd-i_period_year').hide();
								Ext.getCmp('frmd-f_depreciate').hide();
								Ext.getCmp('frmd-d_depreciate').hide();
								Ext.getCmp('frmd-ins_is_method').hide();
								Ext.getCmp('frmd-i_is_ins').hide();
							} else if(parseInt(asset_type) == parseInt(Ext.ASSET_TYPE_EQUIP)){
								Ext.getCmp('frmd-p_province').hide();
								Ext.getCmp('frmd-p_area').hide();
								Ext.getCmp('frmd-p_deed').hide();
								
								Ext.getCmp('frmd-c_brand').show();
								Ext.getCmp('frmd-c_serial').show();
								Ext.getCmp('frmd-c_model').show();
								Ext.getCmp('frmd-c_type').show();
								Ext.getCmp('frmd-c_asset_code_old').show();
								Ext.getCmp('frmd-c_cost_ruins').show();
								Ext.getCmp('frmd-i_period_year').show();
								Ext.getCmp('frmd-f_depreciate').show();
								Ext.getCmp('frmd-d_depreciate').show();
								Ext.getCmp('frmd-ins_is_method').show();
								Ext.getCmp('frmd-i_is_ins').show();
								
								Ext.getCmp('frmd-c_brand').setValue(record.get('c_brand'));
								Ext.getCmp('frmd-c_serial').setValue(record.get('c_serial'));
								Ext.getCmp('frmd-c_model').setValue(record.get('c_model'));
								Ext.getCmp('frmd-c_type').setValue(record.get('c_type'));
								Ext.getCmp('frmd-c_asset_code_old').setValue(record.get('c_asset_code_old'));
								Ext.getCmp('frmd-c_cost_ruins').setValue(record.get('c_cost_ruins'));
								
								Ext.getCmp('frmd-i_period_year').setValue(record.get('i_period_year'));
								Ext.getCmp('frmd-f_depreciate').setValue(record.get('f_depreciate'));
								Ext.getCmp('frmd-d_depreciate').setValue(record.get('d_depreciate'));
								Ext.getCmp('frmd-ins_is_method').setValue(record.get('ins_is_method'));
								Ext.getCmp('frmd-i_is_ins').setValue(record.get('i_is_ins'));
							}
							
						},
						failure: function ( result, request) { 
							Ext.MessageBox.alert('Failed', result.responseText);		// connect error
						}
					});
				}				
			}else if (columnIndex == grid.getColumnModel().getIndexById('remove')) {
				if (Ext.getCmp('role-form-mode').getValue() != "VIEW")
				{
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
									url : 'api/mnAmRegister.php' ,
									method: 'POST',
									params : { 
										mode : 'DELETE_DTL',
										id : record.get('id')
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
										
										// Load Method
					        			store_dtl.load();
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
		}
		
		Ext.objChk = [];
		
		var frmRegister = new Ext.Window({
			id : "frmRegis",
			xtype: 'form',
			title : "รายการสินทรัพย์รอขึ้นทะเบียน",
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
					url:'api/mnAmRegister.php',
					defaults: { allowBlank: true},
					labelWidth : 200,
					//bodyStyle: 'padding: 10px;',
					items: [{
						xtype: "hidden",
						id: "mode",
						value : 'REGISTER',
						readOnly: true
					},{
						xtype: "hidden",
						id: "frmReg-hdr_id",
						name : "am_tran_rg_hdr_id",
						value : hdr_id,
						readOnly: true
					},{
 			 			xtype: 'grid',
 			 			region:'center',
 			 			id:'panelExpGrid',
 			 			height:400,
 			 			width:'100%',
 			 			defaults:{autoScroll:true},
 			 			border: false,
 			 			stripeRows: true,
 			 			loadMask: true,
 			 			store: store_register,
 			 			columns:[
 								new Ext.grid.RowNumberer({
 									header: "<div class='topAlign'><input type='checkbox' id='chkAll' onclick='checkAll(this.checked)'></div>",
 									sortable: false,
 									align:'center',
 									id:'qty',
 									width:150,
 									dataIndex:'id' ,
 									renderer: function(value, metaData, record, row, col, store, gridView) {
 										
 										var i_valid = record.get("i_valid");
 										
 										if (parseInt(i_valid) > 0 )
 										{
 											var str = "";
 											Ext.objChk[record.get('no')] = '';
 											if (parseInt(i_valid) > 1)
 											{
 												switch (parseInt(i_valid))
 												{
 													case 2 : str = "<font color=red>(รายการสินทรัพย์ไม่ถูกต้อง)</font>"; break;
 													case 3 : str = "<font color=red>(กรุณาเลือกหน่วยงาน)</font>"; break;
 													case 4 : str = "<font color=red>(กรุณาระบุชื่อสินทรัพย์)</font>"; break;
 													case 5 : str = "<font color=red>(กรุณาระบุราคาทุน)</font>"; break;
 												}
 											}
 											return str;
 										}
 										else
 										{
 											Ext.objChk[record.get('no')] = 'chk_'+record.get('id');
 	 										
 	 										return '<input type="checkbox" id="chk_'+record.get('id')+'" '
 	 										+' value="'+record.get('id')+'" name="chk[]"/>';
 										}
 									}
 								}),
 								{header: 'รหัสสินทรัพย์', sortable: true, dataIndex: 'asset_code', align: "center", width:120 },
 								{header: 'ชื่อสินทรัพย์', sortable: true, dataIndex: 'c_name', id : 'fregis-c_name' },
 								{header: 'ใช้ที่หน่วยงาน', sortable: true, dataIndex: 'cost_name'  },
 								{header: 'ราคาทุน', sortable: true, dataIndex: 'c_cost_asset', width:150 , 
 									renderer: function(value, metaData, record, row, col, store, gridView) {
 										metaData.attr = 'align=right';
 										return floatRenderer(value);
 									}  
 								},
 								{header: 'ราคาตามบัญชี', sortable: true, dataIndex: 'cost_acc', width:150 , 
 									renderer: function(value, metaData, record, row, col, store, gridView) {
 										metaData.attr = 'align=right';
 										return floatRenderer(value);
 									}  
 								},
 								{header: 'การทำประกันภัย', sortable: true, dataIndex: 'str_insurance', width:200 },
 								{header: "แก้ไข", sortable: false, align:'center', id:'frmRegEdit', width: 50, dataIndex:'id' ,
 									renderer: function(value, metaData, record, row, col, store, gridView) {
 										var i_valid = record.get("i_valid");
 										
 										if (parseInt(i_valid) != 1){
 											return'<img src="../images/icons/document_edit.gif"); style="cursor:pointer"/>';
 										}else{ 
 											return '';
 										} 	
 										
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
				text : "บันทึกออกเลขสินทรัพย์",
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
									Ext.getCmp('tabpanel1').getStore().load({
										callback : function (records, operation, success)
										{
											if (success)
											{
												Ext.getCmp('panelExpGrid').getStore().reload();
											}
										}
									});
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
		Ext.getCmp('panelExpGrid').on('cellclick',cellClick_Regis, this);
		return frmRegister;
	}; //EndFunction
	//=========================================================================================//
	
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
				title: title_panel+' รายการสินทรัพย์ที่นำเข้า',
				defaults: { anchor: '100%' },
				items: [ new Ext.grid.GridPanel({
					region: 'center',
					id: 'grid_method',
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
							var frmDtl = popFrmDtl();
							frmDtl.show();
							var am_tran_rg_hdr_id = Ext.getCmp("frm-id").getValue();
							Ext.getCmp('frmd-am_tran_rg_hdr_id').setValue(am_tran_rg_hdr_id);
						}
					}],
					columns: [
						new Ext.grid.RowNumberer({
							header:' No ',
							width:50,
							renderer:function(value, metaData, record, row, col, store, gridView){
								return record.get('no');
							}
						}),
						{header: 'รหัสรายการสินทรัพย์', sortable: true, dataIndex: 'c_code', align: "center" },
						{header: 'ชื่อสินทรัพย์', sortable: true, dataIndex: 'c_name'  },
						{header: 'ราคาทุน', sortable: true, align: "right", dataIndex: 'c_cost_asset', renderer: floatRenderer},
						{header: 'มูลค่าซาก', sortable: true, align: "right", dataIndex: 'c_cost_ruins', renderer: floatRenderer},
						{header: 'อายุการใช้งาน(ปี)', sortable: true, align: "center", dataIndex: 'i_period_year', renderer: floatRenderer},
						{
							header: "Edit",
							sortable: false,
							align:'center',
							id:'edit',
							width:50,
							dataIndex:'id' ,
							renderer: function(value, metaData, record, row, col, store, gridView) {
								if (Ext.getCmp('role-form-mode').getValue() == "VIEW")
									return '';
								else
									return'<img src="../images/icons/document_edit.gif");/>';
							}
						},{
							header:'Remove', 
							align:'center',
							id:'remove',
							sortable: false,
							width:50,
							dataIndex:'id' ,
							renderer: function(value, metaData, record, row, col, store, gridView) {
								if (Ext.getCmp('role-form-mode').getValue() == "VIEW")
									return '';
								else
									return'<img src="../images/icons/document_delete.gif");/>';
							}
						}
					],
					columnLines: true,
					//autoExpandColumn: 'c_name'
				}) ]
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
        	url:'api/mnAmRegister.php',
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
						xtype: 'textfield',
						fieldLabel: 'เลขที่นำเข้าสินทรัพย์',
						name : 'c_code',
						id:'frm-c_code',
						cls: 'bgblue',
						width: 150,
						readOnly: true
					}, {
						xtype: 'textfield',
						fieldLabel: 'เรื่อง',
						name : 'c_name',
						id:'frm-c_name',
						anchor: '60%'
					}, {
						xtype: "datefield",
						id: "frm-d_doc_date",
						name: "d_doc_date",
						fieldLabel: "วันที่ทำรายการ",
						width: 150,
					}, new Ext.form.ComboBox({
						fieldLabel: "ประเภทการนำเข้าสินทรัพย์ ",
						id: "frm-i_is_status",
						name: "i_is_status",
						mode: "local",
						store: storeAssetMethod,
						valueField: "id",
						displayField: "c_name",
						hiddenName:'dc_asset_method_id',
						triggerAction: "all",
						forceSelection: true,
						selectOnFocus: true,
						typeAhead : true,
						emptyText: "กรุณาเลือก...",
						width: 150,
						listeners: {
							beforequery: function(q) {
								if (q.query) {
									var length = q.query.length;
									q.query = new RegExp(Ext.escapeRe(q.query));
									q.query.length = length;
								}
							},
							blur: function() { this.getStore().clearFilter(); }
						}
					}), {
						fieldLabel: 'หมายเหตุ',
						xtype: 'textfield',
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
						url : 'api/mnAmRegister.php' , 
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
					var chkName = (Ext.getCmp('frm-c_name').getValue() != '')? true : false;
					var chkStatus = (Ext.getCmp('frm-i_is_status').getValue() != '')? true : false;
					
					if (!chkName)
						Ext.Msg.alert('ผิดพลาด', 'กรุณาระบุ "เรื่อง"');
					else if (!chkStatus)
						Ext.Msg.alert('ผิดพลาด', 'กรุณาเลือก "ประเภทการนำเข้าสินทรัพย์"');
					else if (form.isValid()){ 
						form.submit({
							waitMsg:'Saving Data...',
							success : function(form, action) { 
								var data = Ext.decode(action.response.responseText);
								var hdr_id = data.hdr_id;
								Ext.getCmp('role-form-mode').setValue('EDIT');
								Ext.getCmp('frm-id').setValue(hdr_id);
								Ext.getCmp('frm-c_code').setValue(data.c_code_gen);

			                    Ext.getCmp('GRID_DTL').show();
			                    Ext.getCmp('buAddDtl').show();

			        			// Load Method
			        			store_dtl.setBaseParam("am_tran_rg_hdr_id", hdr_id);
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
	Ext.getCmp('grid_method').on('cellclick', cellClick_dtl, this);

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
	
	Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({
			header: 'ขึ้นทะเบียนสินทรัพย์', 
			align: 'center',
			id: 'regis',
			sortable: false,
			width: 100,
			dataIndex: 'id' ,
			renderer: function(value, metaData, record, row, col, store, gridView) {
				var c_code = record.get('c_code');
				var i_is_success = record.get('i_is_success');
				if (c_code!='SD' && i_is_success == Ext.ASSET_STATUS_WAIT)
					return'<img src="../images/icons/report_start.png"); style="cursor:pointer"/>';
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
				var i_is_status = record.get('i_is_status');
				if(record.get('c_code')== 'SD'){ 
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
				if(record.get('c_code')== 'SD'){ 
					return'<img src="../images/icons/document_delete.gif"); style="cursor:pointer"/>';
				}else{ 
					return '';
				} 	
				
			}
		})); 
	}
	/*====================== RENDER ======================*/
	
});