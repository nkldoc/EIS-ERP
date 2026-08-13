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
    var title_panel = "บันทึกการนำเข้าสินทรัพย์";
    /*===============================================*/
	
    var storeMain = new Ext.data.JsonStore({
        storeId: 'myStore',
        autoDestroy: true,
        autoLoad: true,
        url : 'api/ListAmImport.php',
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
                { name: 'i_is_status' },
                { name: 'import_name' },
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
        url : 'api/ListAmImport.php',
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
                { name : "cost_name"},
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
        storeId: 'myStoreInvGroup',
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
        tbar: [{ // กล่องค้นหาข้อมูล 1
            xtype: "buttongroup",
            title: "ระบุเงื่อนไขในการค้นหาข้อมูล",
            columns: 1,
            defaults: { scale: "small", style: "float: right" },
            items: [{ // แถวที่ 1
            	xtype: "buttongroup",
            	frame: false,
            	items: [{ xtype: "label", text: "วันที่ทำรายการ : " }, { xtype: "tbspacer", width: 4 }, {
            		id: "s_doc_date1", xtype: "datefield", width: 140,
    				listeners : {
                                            afterrender : function() {
                                                var date = new Date();
                                                date = new Date(date.getFullYear()+543, date.getMonth()-1, 1);
                                                this.setValue(date);
                                            }
					}
            	}, { xtype: "tbspacer", width: 3 }, { xtype: "label", text: "ถึง : " }, {
            		id: "s_doc_date2", xtype: "datefield", width: 140, 
                        listeners : {
                                    afterrender : function() {							
                                            this.setValue(addY(543));
                                    }
                                }
            	}]
            }],
            buttonAlign: "left",
            buttons:[{
                        text : "เพิ่มข้อมูล",
                        id: "buAdd",
                        iconCls: "icon-add",
                        handler: function(grid, rowIndex, colIndex) {
                                Ext.getCmp("tabpanel2").setDisabled(false);
                                Ext.getCmp("contenterCenter").setActiveTab("tabpanel2");
                                Ext.getCmp("form-widgets").getForm().reset();
                                Ext.getCmp("role-form-mode").setValue("ADD");

                                Ext.getCmp('GRID_DTL').hide();
                                //buGencode
                                Ext.getCmp('buGencodeID').hide();

                                Ext.getCmp("frm-d_doc_date").setValue(addY(543));
                                Ext.getCmp('frm-i_is_status').setValue(Ext.getCmp('frm-i_is_status').store.data.items[0].id);
                        }
                    }, { xtype: "tbfill" }, {
                        text : "ค้นหา",
                        iconCls: "icon-magnifier",
    			handler : function() {
                            var msg	= "";

                            if(Ext.getCmp("s_doc_date1").getValue() == "" || Ext.getCmp("s_doc_date2").getValue() == "") {
                                    msg	+= "กรุณากรอก วันที่ทำรายการ<br>";
                            }

                            if(msg == "") {

                                    storeMain.setBaseParam("mode", "SEARCH");
                                    storeMain.setBaseParam("s_doc_date1", Ext.util.Format.date(Ext.getCmp("s_doc_date1").getValue(), "Y-m-d"));
                                            storeMain.setBaseParam("s_doc_date2", Ext.util.Format.date(Ext.getCmp("s_doc_date2").getValue(), "Y-m-d"));
                                            storeMain.load();

                            } else {
                                    Ext.Msg.alert("แจ้งเตือน", msg);
                            }
    			}
                    }]
		}],
		columns: [
		    new Ext.grid.RowNumberer({header:"ที่", width: 30,
				renderer: function(value, metaData, record, row, col, store, gridView) {
					return record.get("no");
				}
			}),
			{ header: "รหัส", sortable: true, width:100, dataIndex: "c_code", align:'center' },
			{ header: "ประเภทการนำเข้าสินทรัพย์", sortable: true, width: 150, dataIndex: "import_name" },
			{ header: "เรื่อง", sortable: true, width: 250, dataIndex: "c_name" , id:'G-c_name'},
			{ header: "วันที่ทำรายการ", sortable: true, dataIndex: "str_date" },
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
			
			if (record.get('c_code') == "SD")
			{
				Ext.getCmp("role-form-mode").setValue("EDIT");
				//buGencode
				if (record.get('i_show_gen') == '1')
					Ext.getCmp('buGencodeID').show();
				else
					Ext.getCmp('buGencodeID').hide();
				
				Ext.getCmp('buAddDtl').show();
				Ext.getCmp('buImportExcel').show();
			}
			else
			{
				Ext.getCmp("role-form-mode").setValue("VIEW");
				//button
				Ext.getCmp('icon-save').hide();
				Ext.getCmp('buGencodeID').hide();
				Ext.getCmp('buAddDtl').hide();
				Ext.getCmp('buImportExcel').hide();
			}

			Ext.getCmp('GRID_DTL').show();
			Ext.getCmp("frm-i_is_status").setValue(record.data.i_is_status);

			// Load Method
			store_dtl.setBaseParam("am_tran_rg_hdr_id", record.data.id);
			store_dtl.setBaseParam("type", "DTL");
			store_dtl.load();
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
			Ext.getCmp('buImportExcel').hide();
			
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
								url : 'api/mnAmImport.php' ,
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
	
	function cellClick_dtl(grid, rowIndex, columnIndex, e) {
		
		var record = grid.getStore().getAt(rowIndex);
		if (columnIndex == grid.getColumnModel().getIndexById('edit')) {
			
			if (Ext.getCmp('role-form-mode').getValue() != "VIEW")
			{
				var frmDtl = popFrmDtl();
				frmDtl.show();
				
				Ext.Ajax.request({
					url : 'api/ListAmImport.php' ,
					method: 'POST',
					params : { 
                                            type : 'GET_INV',
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
						var dc_asset_group = c_code.substring(0, 2);
						var dc_asset_type = c_code.substring(0, 4);
						Ext.getCmp('frmd-dc_asset_group').setValue(dc_asset_group);
						storeAssetType.setBaseParam("codeParent", dc_asset_group);
						storeAssetType.load({
                                                    callback : function (records, operation, success)
                                                    {
                                                        if (success)
                                                        {
                                                            Ext.getCmp('frmd-dc_asset_type').setValue(dc_asset_type);

                                                            // Load Inventory
                                                            storeAssetLast.setBaseParam("codeParent", asset_type);
                                                            storeAssetLast.load({
                                                                callback : function (records, operation, success)
                                                                {
                                                                    if (success)
                                                                    {
                                                                        Ext.getCmp('frmd-dc_asset_code').setValue(c_code);
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
								url : 'api/mnAmImport.php' ,
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
						name: "mode",
						value : "ADD_DTL",
						readOnly: true
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
						id: "frmd-dc_asset_group",
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
                                                                                                    Ext.getCmp('frmd-dc_asset_code').setValue(storeAssetLast.data.items[0].get('c_code'));
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
											Ext.getCmp('frmd-dc_asset_code').setValue(storeAssetLast.data.items[0].get('c_code'));
										}
									}
								});
							}
						}
					}),new Ext.form.ComboBox({
						id: "frmd-dc_asset_code",
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
					
					var dc_asset_group = Ext.getCmp('frmd-dc_asset_group').getValue();
					var dc_asset_type = Ext.getCmp('frmd-dc_asset_type').getValue();
					var asset_code = Ext.getCmp('frmd-dc_asset_code').getValue();
					
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
					
					if (dc_asset_group == "")
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
							url : 'api/mnAmImport.php' ,
							method: 'POST',
							params : { 
								mode : mode, 
								am_tran_rg_hdr_id : am_tran_rg_hdr_id,
								id : id,
								asset_type : asset_type,
								dc_asset_group : dc_asset_group,
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
									
				        			// Load Detail
				        			store_dtl.setBaseParam("am_tran_rg_hdr_id", am_tran_rg_hdr_id);
				        			store_dtl.setBaseParam("type", "DTL");
				        			store_dtl.load();
				        			
				        			//buGencode
				        			Ext.getCmp('buGencodeID').show();
				        			
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
					}, { xtype: 'tbfill' },{
						text : "นำเข้าไฟล์ excel",
						id: "buImportExcel",
						iconCls: "import_excel",
						handler: function(grid, rowIndex, colIndex) {
							var am_tran_rg_hdr_id = Ext.getCmp('frm-id');
							new Ext.Window({
								title: "นำเข้าไฟล์",
								id: "win-pop-excel",
								layout: "fit",
								modal: true,
								width: (Ext.getBody().getViewSize().width * 0.6),
								listeners: {
									afterrender: function( component ) {
										
										new Ext.ux.form.FileUploadField({
											id: "dtl_import",
											name: "dtl_import",
											emptyText: "เลือกไฟล์ excel...	",
											buttonText: "",
							            	width: 300,
							            	buttonCfg: { iconCls: "import_excel" },
							            	renderTo: "Ext_dtl_import"
										});
									}
								},
								items: [{
									xtype: "form",
									id: "form-excel",
									url: "api/mnAmImport.php",
									border: false,
									fileUpload: true,
									bodyStyle: { padding: "10px 20px" },
									html:"	<table border=\"0\" cellspacing=\"2\" cellpadding=\"0\" width=\"100%\" style=\"padding: 4px; 0px;\">" +
												"<input type=\"hidden\" name=\"mode\" value=\"IMPORT_EXCEL\">" +
												"<input type=\"hidden\" name=\"id\" value=\""+Ext.getCmp("frm-id").getValue()+"\">" +
												"<colgroup width=\"50%\"></colgroup>" +
												"<colgroup width=\"20%\"></colgroup>" +
												"<colgroup width=\"30%\"></colgroup>" +
												"<tr>" +
													"<td align=\"right\">เลือก file(*.csv (Comma delimited)) : </td>" +
													"<td><div id=\"Ext_dtl_import\"></div></td>" +
													"<td><a href=\"import/ExImport.php\" target=\"_blank\">ตัวอย่างการนำเข้าข้อมูล</a></td>" +
												"</tr>" +
												"<tr>" +
													"<td colspan=\"3\"><div style=\"color:red; font-size:20px; text-align: center; padding:10px;\">* เช็คข้อมูลเริ่มต้นตั้งแต่บรรทัดที่ 3 ของไฟล์ Excel</div></td>" +
												"</tr>" +
											"</table>"
								}],
								buttonAlign: "left",
								buttons : [{
									text: Ext.GLOBAL_BU_SAVE_TH,
									iconCls: "icon-save",
									handler: function() {
										
										var form		= Ext.getCmp("form-excel").getForm();
										var filename	= Ext.getCmp("dtl_import").getValue();
										var parts		= filename.split(".");
										var msg			= "";

										if (filename == "") { msg = "กรุณาเลือกไฟล์ที่ต้องการ"; }
										else if(parts[parts.length - 1] != "csv") { msg = "กรุณาเลือก excel เป็นไฟล์ .csv"; }
										
										if(msg == "") {
											
											Ext.getCmp("win-pop-excel").getEl().mask("Please wait...", "x-mask-loading");
											form.submit({
												success : function(result, request) {
													Ext.getCmp("win-pop-excel").getEl().unmask();		
													var obj = request.result;
													if(obj.debug) {
														store_dtl.load();
													//	table_tree(Ext.getCmp("dtl_year").getValue().inputValue);
														Ext.Msg.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย");
														Ext.getCmp("win-pop-excel").destroy();
													} else {
														Ext.Msg.alert("แจ้งเตือน", obj.msg);
													}
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
										} else { Ext.Msg.alert( "แจ้งเตือน", msg ); }
									}
								}, {
									text: Ext.GLOBAL_BU_BACK_TH,
									handler: function() { Ext.getCmp("win-pop-excel").destroy(); }
								}]
							}).show();
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
        	url:'api/mnAmImport.php',
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
						name : "mode",
						value:'ADD',
						readOnly: true				
					}, {				
						xtype : "hidden",
						id : 'frm-id',
						name: "id",
						readOnly: true
					}, {
						xtype: 'textfield',
						fieldLabel: 'รหัส',
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
						fieldLabel: 'คำอธิบายเพิ่มเติม',
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
						url : 'api/mnAmImport.php' , 
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
			                    Ext.getCmp('buImportExcel').show();

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
	InfoMainGrid('tabpanel1',true,true,true,false,false,false);
	
	/*====================== RENDER ======================*/
	
});