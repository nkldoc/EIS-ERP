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
        if (Ext.GroupHead[i])
        {
            if (ind != '')
            {
                    document.getElementById(ind).checked = ele;
            }
        }
    }
}

Ext.onReady(function() {
	Ext.QuickTips.init();
	Ext.objChk = [];
	Ext.GroupHead = [];
	/*===============================================*/
	var title_panel = "บันทึกมูลค่าซากและอายุใช้งาน";
	/*===============================================*/
	
	var storeMain = new Ext.data.JsonStore({
            storeId: 'myStore',
	    autoDestroy: true,
            autoLoad: true,
	    url : 'api/ListAmRuins.php',
	    root: 'data',
	    baseParams: { type: "HDR", i_read:user_right_read }, //Permission i_read
	    idProperty: 'id',
		totalProperty: 'totalCount',
		fields: [
			{ name: 'no' },
			{ name: 'id' },
			{ name: 'c_code' },
			{ name: 'd_doc_date' },
			{ name: 'str_date' },
			{ name: 'c_name' },
			{ name: 'c_comment' },
			{ name: 'i_is_ruins' },
                        { name: 'i_enable'},
			{ name: 'str_ruins' },
			{ name: 'dc_user_create_id' },
                        { name: 'dc_user_create_cost_id' },
                        { name: 'd_create' },
                        { name: 'dc_user_update_id' },
                        { name: 'dc_user_update_cost_id' },
                        { name: 'd_update' }
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
	var sGroup1 = [{
		xtype: 'displayfield', 
		value: 'รหัสรายการ   : ' , 
		cls: 'ui-label',  	        	
	},{			
		id : "s-c_code",
		xtype : "textfield", 
		fieldLabel : "fieldLabel",
		colspan:3,
		width:250
		//listeners: Ext.enterSubmit,
		
	},{
		xtype: 'displayfield', 
		value: 'ค่าใช้จ่ายทางบัญชี    : ' , 
		cls: 'ui-label',  	        	
	},{
		id 		  : "s-i_is_expense",
		xtype     : 'combo',
		mode	  : 'local',
		store     : new Ext.data.SimpleStore({
						fields: [ "value", "text" ],
						data: [
						    [ "ALL", "ทั้งหมด" ],
						    [ Ext.ASSET_CAL_YES, "คำนวณค่าเสื่อม" ],
						    [ Ext.ASSET_CAL_NO, "ไม่คำนวณค่าเสื่อม" ]
						]
			}),
		valueField: "value",
		displayField: "text",
		value : "ALL",
		editable : false,
		triggerAction: "all",
		typeAhead : false,
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
	}];
	
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
			 columns: 6, 
			 title: 'ระบุเงื่อนไขในการค้นหาข้อมูล', 
			 items: [sGroup1],
			 buttonAlign: 'left',
			 buttons:[{
					text : "ค้นหา",
					align:'center',
					iconCls: 'icon-magnifier', 
					handler : function() { 
					
						storeMain.setBaseParam("mode", "SEARCH");
						storeMain.setBaseParam("c_code", Ext.getCmp("s-c_code").getValue());
						storeMain.setBaseParam("d_begin", Ext.getCmp("s_d_beginID").getValue());
						storeMain.setBaseParam("d_end", Ext.getCmp("s_d_endID").getValue());
						storeMain.setBaseParam("i_is_expense", Ext.getCmp("s-i_is_expense").getValue());
						storeMain.setBaseParam('i_is_status',Ext.getCmp("s-i_is_status").getValue());
						storeMain.load();
					}
		     },{
	                text: "เริ่มใหม่",
	                align: 'center',
	                iconCls: 'icon-reset',
	                handler: function() {
	                	Ext.getCmp("s-c_code").setValue(''); 
	                	Ext.getCmp("s_d_beginID").setValue(defaultDate(1));
						Ext.getCmp("s_d_endID").setValue(defaultDate(2));
						Ext.getCmp("s-i_is_expense").setValue('ALL');
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
			{
				header: 'บันทึกมูลค่าซาก', 
				align: 'center',
				id: 'ruins',
				sortable: false,
				width: 100,
				dataIndex: 'id' ,
				renderer: function(value, metaData, record, row, col, store, gridView) {
					var c_code = record.get('c_code');
					var i_is_ruins = record.get('i_is_ruins');
					if (c_code!='SD' && parseInt(i_is_ruins) == parseInt(Ext.ASSET_STATUS_WAIT))
						return'<img src="../images/icons/bookmark_edit.png"); style="cursor:pointer"/>';
					else
						return '';
				}
			},
			{ header: "รหัสรายการ", sortable: true, width:100, dataIndex: "c_code", align:'center' },
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
			{ header: "หมายเหตุ", sortable: true, width: 100, dataIndex: "c_comment"},
			{ header: "สถานะรายการ", sortable: true, width: 100, dataIndex: "str_ruins"},
		],
		autoExpandColumn: "G-c_name",
		bbar: pagingBar
	}); //gridMain

	function cellClick(grid, rowIndex, columnIndex, e) {
		var record = grid.getStore().getAt(rowIndex); 
		
		if (columnIndex==grid.getColumnModel().getIndexById('view')) {
			
		} else if (columnIndex == grid.getColumnModel().getIndexById('ruins')){
			
			var c_code = record.get('c_code');
			var i_is_ruins = record.get('i_is_ruins');
			if (c_code!='SD' && parseInt(i_is_ruins) == parseInt(Ext.ASSET_STATUS_WAIT))
			{
				var frm = popFrmRuins(record.get('id'));
				//frm.show();
			}
		}
	};
	
	//=========================================================================================//
function popFrmRuins(hdr_id){
		
		var store_ruins = new Ext.data.JsonStore({
			//autoLoad: true,
		    url : 'api/ListAmRuins.php',
		    root: 'data',
		    baseParams: { type: "ASSET_RUNIS"
		    			, am_tran_rg_hdr_id : hdr_id
		    			, i_read:user_right_read },
		    idProperty: 'id',
			totalProperty: 'totalCount',
			fields: [     
					{name : "no"},
					{name : "id"},
					{name : "c_code"},
					{name : "group_asset"},
					{name : "asset_name"},
					{name : "c_name"},
					{name : "c_asset_code_old"},
					{name : "cost_name"},
					{name : "cost_acc_name"},
					{name : "str_status"},
					{name : "i_is_expense"},
					{name : "strReceive"},
					{name : "d_receive_date"},
					{name : "strRegister"},
					{name : "f_unit_cost"},
					{name : "c_cost_ruins"},
					{name : "i_period_year"},
					{name : "strDepreciate"},
					{name : "d_depreciate"},
					{name : "f_depreciate"},
					{name : "i_is_audit"},
					{name : "p_province"},
					{name : "p_area"},
					{name : "p_deed"},
					{name : "c_brand"},
					{name : "c_serial"},
					{name : "c_model"},
					{name : "c_type"},
					{name : "i_is_expense"},
					{name : "i_type"}
			]
		});
		
		function cellClick_Ruins(grid, rowIndex, columnIndex, e) {
			
			var record = grid.getStore().getAt(rowIndex);
			if (columnIndex == grid.getColumnModel().getIndexById('frmRuinsEdit')) {
				
				if (parseInt(record.get('i_type')) == 2 && parseInt(record.get('i_is_audit')) != 1)
				{
					var frmDtl = popFrmDtl();
					frmDtl.show();
					
					Ext.Ajax.request({
						url : 'api/ListAmRuins.php' ,
						method: 'POST',
						params : { 
							type : 'GET_ASSET',
							c_code : record.get('c_code')
						},
						success: function ( result, request ) {
							var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
							var asset_type = jsonData.data.asset_type;
							
							Ext.getCmp("frmd-id").setValue(record.get('id'));
							Ext.getCmp("frmd-c_code").setValue(record.get('c_code'));
							Ext.getCmp("frmd-c_name").setValue(record.get('c_name'));
							Ext.getCmp('frmd-cost_name').setValue(record.get('cost_name'));
							Ext.getCmp('frmd-d_receive_date').setValue(record.get('strReceive'));
							Ext.getCmp('frmd-d_register_date').setValue(record.get('strRegister'));
							Ext.getCmp('frmd-c_cost_asset').setValue(record.get('f_unit_cost'));
							if (parseInt(record.get('i_is_expense')) == 1)
								Ext.getCmp('frmd-expense').setValue('ไม่คำนวณ');
							else
								Ext.getCmp('frmd-expense').setValue('คำนวณ');
							
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
								Ext.getCmp('frmd-i_is_expense').hide();
								Ext.getCmp('frmd-d_depreciate').hide();
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
								Ext.getCmp('frmd-i_is_expense').show();
								Ext.getCmp('frmd-d_depreciate').show();
								
								Ext.getCmp('frmd-c_brand').setValue(record.get('c_brand'));
								Ext.getCmp('frmd-c_serial').setValue(record.get('c_serial'));
								Ext.getCmp('frmd-c_model').setValue(record.get('c_model'));
								Ext.getCmp('frmd-c_type').setValue(record.get('c_type'));
								Ext.getCmp('frmd-c_asset_code_old').setValue(record.get('c_asset_code_old'));
								Ext.getCmp('frmd-c_cost_ruins').setValue(record.get('c_cost_ruins'));
								
								Ext.getCmp('frmd-i_period_year').setValue(record.get('i_period_year'));
								Ext.getCmp('frmd-f_depreciate').setValue(record.get('f_depreciate'));
								Ext.getCmp('frmd-i_is_expense').setValue(0);
								
								if (record.get('d_depreciate') != '')
									Ext.getCmp('frmd-d_depreciate').setValue(record.get('d_depreciate'));
								else
									Ext.getCmp('frmd-d_depreciate').setValue(defaultDate(2));
							}
							
						},
						failure: function ( result, request) { 
							Ext.MessageBox.alert('Failed', result.responseText);		// connect error
						}
					});
				}			
			}
		}
		
		Ext.objChk = [];
		Ext.GroupHead = [];
		
		var frmRuins = new Ext.Window({
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
					url:'api/mnAmRuins.php',
					defaults: { allowBlank: true},
					labelWidth : 120,
					frame:true,
					//bodyStyle: 'padding: 10px;',
					items: [{
						xtype: 'container',
						layout: 'hbox',
						align: 'stretch',
						defaults: { xtype: 'fieldset', flex:1, margins : '0px 3px', autoHeight: true },
						items: [{
							title: 'ข้อมูลการนำเข้าสินทรัพย์',
							defaults: { allowBlank: true, anchor: '100%' },
							items: [{
								xtype: "hidden",
								id: "mode",
								value : 'RUINS',
								readOnly: true
							},{
								xtype: "hidden",
								id: "frmRuins-hdr_id",
								name : "am_tran_rg_hdr_id",
								value : hdr_id,
								readOnly: true
							},{
					    		xtype: 'displayfield', 
					    		fieldLabel: 'รหัสรายการ',
					    		id: "frmRuins-hdr-c_code",
					    		value: '' , 
					    		cls: 'my-label-style'
							},{
					    		xtype: 'displayfield', 
					    		fieldLabel: 'เรื่อง',
					    		id: "frmRuins-hdr-c_name",
					    		value: ''
							},{
					    		xtype: 'displayfield', 
					    		fieldLabel: 'วิธีการได้มา',
					    		id: "frmRuins-hdr-method_name",
					    		value: ''
							},{
					    		xtype: 'displayfield', 
					    		fieldLabel: 'วันที่บันทึกรายการ ',
					    		id: "frmRuins-hdr-d_doc_date",
					    		value: ''
							},{
					    		xtype: 'displayfield', 
					    		fieldLabel: 'หมายเหตุ',
					    		id: "frmRuins-hdr-c_comment",
					    		value: ''
							}]
						}]
					},{
 			 			xtype: 'grid',
 			 			region:'center',
 			 			id:'RuinsGrid',
 			 			height:298,
 			 			width:'100%',
 			 			defaults:{autoScroll:true},
 			 			border: false,
 			 			stripeRows: true,
 			 			loadMask: true,
 			 			store: store_ruins,
 			 			columns:[
 								new Ext.grid.RowNumberer({
 									header: "<div class='topAlign'><input type='checkbox' id='chkAll' onclick='checkAll(this.checked)'></div>",
 									sortable: false,
 									align:'center',
 									id:'qty',
 									width:30,
 									dataIndex:'id' ,
 									renderer: function(value, metaData, record, row, col, store, gridView) {
 										if (parseInt(record.get('i_type')) == 2 && parseInt(record.get('i_is_audit')) != 1)
 										{
 											Ext.objChk[record.get('no')] = 'chk_'+record.get('id');
 											Ext.GroupHead[record.get('no')] = true;
 	 										return '<input type="checkbox" id="chk_'+record.get('id')+'" '
 	 										+' value="'+record.get('id')+'" name="chk[]"/>';
 										}
 										else 
 										{
 											Ext.GroupHead[record.get('no')] = false;
 											return ""; 
 										}
 									}
 								}),
 								{header: 'รหัสสินทรัพย์', sortable: true, dataIndex: 'c_code', align: "center", width:120},
 								{header: 'หมวดสินทรัพย์', sortable: true, dataIndex: 'group_asset', align: "center" },
 								{header: 'รายการสินทรัพย์', sortable: true, dataIndex: 'asset_name', align: "center" },
 								{header: 'ชื่อสินทรัพย์', sortable: true, dataIndex: 'c_name', id : 'frmRuins-c_name' },
 								{header: 'หมายเลขสินทรัพย์', sortable: true, dataIndex: 'c_asset_code_old'},
 								{header: 'ใช้ที่หน่วยงาน', sortable: true, dataIndex: 'cost_name'},
 								{header: 'ศูนย์ต้นทุน', sortable: true, dataIndex: 'cost_acc_name'},
 								{header: 'สถานะ', sortable: true, dataIndex: 'str_status', align: "center"},
 								{header: 'วันที่ได้มา', sortable: true, dataIndex: 'strReceive', align: "center"},
 								{header: 'ค่าใช้จ่ายทางบัญชี', sortable: true, dataIndex: 'c_code', align: "center", width:140,
 									renderer: function(value, metaData, record, row, col, store, gridView) {
 										if (parseInt(record.get('i_type')) == 2 && parseInt(record.get('i_is_audit')) != 1)
 											return '<div id=rend-expense['+record.get('no')+']></div>';
 										else
 											return '';
 									} 
 								},{header: 'ราคาทุน', sortable: true, dataIndex: 'f_unit_cost', align: "center", width:110,
 									renderer: function(value, metaData, record, row, col, store, gridView) {
 										if (parseInt(record.get('i_type')) == 2 && parseInt(record.get('i_is_audit')) != 1)
 											return '<div id=rend-unit_cost['+record.get('no')+']></div>';
 										else
 											return '';
 									} 
 								},{header: 'มูลค่าซาก', sortable: true, dataIndex: 'c_cost_ruins', align: "center", width:110,
 									renderer: function(value, metaData, record, row, col, store, gridView) {
 										if (parseInt(record.get('i_type')) == 2 && parseInt(record.get('i_is_audit')) != 1)
 											return '<div id=rend-ruins['+record.get('no')+']></div>';
 										else
 											return '';
 									} 
 								},{header: 'อายุการใช้งาน(ปี)', sortable: true, dataIndex: 'i_period_year', align: "center", width:110,
 									renderer: function(value, metaData, record, row, col, store, gridView) {
 										if (parseInt(record.get('i_type')) == 2 && parseInt(record.get('i_is_audit')) != 1)
 											return '<div id=rend-period['+record.get('no')+']></div>';
 										else
 											return '';
 									}
 								},{header: 'วันที่เริ่มคิดค่าเสื่อมราคา', sortable: true, dataIndex: 'd_depreciate', align: "center", width:110,
 									renderer: function(value, metaData, record, row, col, store, gridView) {
 										if (parseInt(record.get('i_type')) == 2 && parseInt(record.get('i_is_audit')) != 1)
 											return '<div id=rend-d_depreciate['+record.get('no')+']></div>';
 										else
 											return '';
 									} 
 								},{header: 'ค่าเสื่อมราคาสะสมยกมา', sortable: true, dataIndex: 'f_depreciate', align: "center", width:110,
 									renderer: function(value, metaData, record, row, col, store, gridView) {
 										if (parseInt(record.get('i_type')) == 2 && parseInt(record.get('i_is_audit')) != 1)
 											return '<div id=rend-f_depreciate['+record.get('no')+']></div>';
 										else
 											return '';
 									} 
 								},{header: "บันทึกรายละเอียด", sortable: false, align:'center', id:'frmRuinsEdit', width: 100, dataIndex:'id' ,
 									renderer: function(value, metaData, record, row, col, store, gridView) {

 										if (parseInt(record.get('i_type')) == 2 && parseInt(record.get('i_is_audit')) != 1)
 										{
 											return'<img src="../images/icons/document_edit.gif"); style="cursor:pointer"/>';
 										}
 										else 
 											return "";
 									}
 								}],
 						autoExpandColumn: "frmRuins-c_name",
 			 			viewConfig: {
 			 				getRowClass: function(record, index, rowParams, ds) {
 			 					rowParams.tstyle = 'width:' + this.getTotalWidth() + ';';
 			 					var bgColor = '#eee; !important';
 			 					var fgColor = 'blue';
 			 					
 			 					if(parseInt(record.get('i_type')) == 1) {
 			 						rowParams.tstyle = 'width:500;';
 			 						rowParams.tstyle += "background-color:#e4e4e4;";
 			 						rowParams.tstyle += "color:#000;";
 			 					}
 			 					else if(!record.get('no')){
 			 						rowParams.tstyle += "background-color:" + bgColor + ';';
 			 						rowParams.tstyle += "color:" + fgColor + ';';
 			 					}
 			 				}
 			 			}
 			 		}]
			}],
			buttonAlign: 'left',
			buttons : [{
				text : "บันทึกการตรวจสอบ",
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
												Ext.getCmp('RuinsGrid').getStore().load({
													callback : function(records, operation, success){
														for(i =1; i <= records.length; i++){
															var rec = records[(i-1)];
															
															if (parseInt(rec.get('i_type')) == 2 && parseInt(rec.get('i_is_audit')) != 1)
															{
																// new Object
																var dtlID = rec.get('id');
																genComponance(rec, dtlID, i)
															}
															
														}
														
													}
												});// end load
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
		}).show();
		
		Ext.getCmp('RuinsGrid').getStore().load({
			callback : function(records, operation, success){
				Ext.Ajax.request({
	 				url : 'api/ListAmRuins.php' ,
	 				params:{ type:'GETHEAD', am_tran_rg_hdr_id : hdr_id},
	 				method: 'POST', //POST
	 				success: function ( result, request ) {
	 					var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
	 						if (jsonData.debug){
	 							Ext.getCmp('frmRuins-hdr-c_code').setValue(jsonData.data[0].c_code);
 								Ext.getCmp('frmRuins-hdr-c_name').setValue(jsonData.data[0].c_name);
 								Ext.getCmp('frmRuins-hdr-method_name').setValue(jsonData.data[0].method_name);
 								Ext.getCmp('frmRuins-hdr-d_doc_date').setValue(jsonData.data[0].d_doc_date);
 								Ext.getCmp('frmRuins-hdr-c_comment').setValue(jsonData.data[0].c_comment);
	 						}
	 				  	}
	 			});
				
				for(i =1; i <= records.length; i++){
					var rec = records[(i-1)];
					
					if (parseInt(rec.get('i_type')) == 2 && parseInt(rec.get('i_is_audit')) != 1)
					{
						// new Object
						var dtlID = rec.get('id');
						genComponance(rec, dtlID, i)
					}
					
				}
				
			}
		});
		
		Ext.getCmp('RuinsGrid').on('cellclick',cellClick_Ruins, this);
		
		return frmRuins;
	}; //EndFunction
	
	function genComponance(rec, dtlID, i)
	{
		// ค่าใช้จ่าย
		new Ext.form.RadioGroup({
			id: "i_is_expense["+dtlID+"]",
			columns: [ 70, 60],
			items: [
				{ boxLabel: "ไม่คำนวณ", name: "i_is_expense["+dtlID+"]", inputValue: 1 },
				{ boxLabel: "คำนวณ", name: "i_is_expense["+dtlID+"]", inputValue: 0, checked: true }
			],
			listeners: {
				afterrender: function() {
					/*this.fn	= function() {
						ChangeBranch( index );
					}*/
				},
				Change: function(value) {
					//this.fn();
				}
			},
			renderTo: "rend-expense["+i+"]"
		});
		
		// ราคาทุน
		new Ext.form.TextField({
			id: "f_unit_cost["+dtlID+"]",
			style: "text-align: right",
			width: 100,
			value: rec.get('f_unit_cost'),
			renderTo: "rend-unit_cost["+i+"]"
		});
		
		// มูลค่าซาก
		new Ext.form.TextField({
			id: "c_cost_ruins["+dtlID+"]",
			style: "text-align: right",
			width: 100,
			value: rec.get('c_cost_ruins'),
			renderTo: "rend-ruins["+i+"]"
		});
		
		//อายุการใช้งาน
		new Ext.form.TextField({
			id: "i_period_year["+dtlID+"]",
			style: "text-align: right",
			width: 100,
			value: rec.get('i_period_year'),
			renderTo: "rend-period["+i+"]"
		});
		
		//วันที่คิดค่าเสื่อม
		new Ext.form.DateField({
			id: "d_depreciate["+dtlID+"]",
			width: 100,
			value : rec.get('d_depreciate'),
			renderTo: "rend-d_depreciate["+i+"]"
		});
		
		//ค่าเสื่อมราคาสะสมยกมา
		new Ext.form.TextField({
			id: "f_depreciate["+dtlID+"]",
			style: "text-align: right",
			width: 100,
			value: rec.get('f_depreciate'),
			renderTo: "rend-f_depreciate["+i+"]"
		});
	}
	
	function popFrmDtl(){
		
		
		var frmDtl = new Ext.Window({
			id : "frmd",
			xtype: 'form',
			title : "ข้อมูลรายละเอียดสินทรัพย์",
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
						value : "EDIT_DTL",
						readOnly: true
					}, {
						xtype: "hidden",
						id: "frmd-id",
						readOnly: true
					}, {
						xtype: "hidden",
						id: "frmd-asset_type",
						readOnly: true
					},{
			    		xtype: 'displayfield', 
			    		fieldLabel: 'รหัสสินทรัพย์',
			    		id: "frmd-c_code",
			    		value: '' , 
			    		cls: 'my-label-style'
					},{
			    		xtype: 'displayfield', 
			    		fieldLabel: 'รายการสินทรัพย์',
			    		id: "frmd-c_name",
					},{
			    		xtype: 'displayfield', 
			    		fieldLabel: 'จังหวัด',
			    		id: "frmd-p_province",
			    		hidden : true
					},{
						xtype: 'displayfield',
						fieldLabel: 'จำนวนเนื้อที่',
						id : "frmd-p_area",
						hidden : true
					},{
						xtype: 'displayfield',
						fieldLabel: 'เลขที่โฉนด / นส.3ก',
						id : "frmd-p_deed",
						hidden : true
					},{
						xtype: 'displayfield',
						fieldLabel: 'ยี่ห้อ',
						id : "frmd-c_brand",
						hidden : true
					},{
						xtype: 'displayfield',
						fieldLabel: 'Serial No',
						id : "frmd-c_serial",
						hidden : true
					},{
						xtype: 'displayfield',
						fieldLabel: 'รุ่น - แบบ',
						id : "frmd-c_model",
						hidden : true
					},{
						xtype: 'displayfield',
						fieldLabel: 'ขนาด',
						id : "frmd-c_type",
						hidden : true
					},{
						xtype: 'displayfield',
						fieldLabel: 'หมายเลขสินทรัพย์',
						id : "frmd-c_asset_code_old",
						hidden : true
					},{
						xtype: 'displayfield',
						fieldLabel: 'ใช้ที่หน่วยงาน ',
						id : "frmd-cost_name"
					},{
						xtype: 'displayfield',
						fieldLabel: 'ค่าใช้จ่ายทางบัญชี ',
						id : "frmd-expense"
					}, {
						xtype: "displayfield",
						id: "frmd-d_receive_date",
						fieldLabel: "วันที่ได้มา/ตรวจรับ (ได้รับสินทรัพย์)"
					}, {
						xtype: "displayfield",
						id: "frmd-d_register_date",
						fieldLabel: "วันที่ขึ้นทะเบียน/วันที่เริ่มใช้สินทรัพย์"
					},{
						xtype: 'textfield',
						fieldLabel: 'ราคาทุน',
						id : "frmd-c_cost_asset",
						width: 300,
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
					},{
						xtype: 'radiogroup',
						id: "frmd-i_is_expense",
		    			columns: [ 70, 60],
		    			items: [
		    				{ boxLabel: "ไม่คำนวณ", name: "i_is_expense", inputValue: 1 },
		    				{ boxLabel: "คำนวณ", name: "i_is_expense", inputValue: 0, checked: true }
		    			],
		    			listeners: {
							Change: function(value) {
								if (this.getValue().inputValue == 1)
									Ext.getCmp('frmd-d_depreciate').hide();
								else
									Ext.getCmp('frmd-d_depreciate').show();
							}
						},
						hidden :true
					}, {
						xtype: "datefield",
						id: "frmd-d_depreciate",
						name: "d_depreciate",
						fieldLabel: "วันที่เริ่มต้นคิดค่าเสื่อมราคา",
						value : addY(543),
						width: 150,
						hidden : true
					}]
			}],
			buttonAlign: 'left',
			buttons : [{
				text : Ext.GLOBAL_BU_SAVE_TH,
				iconCls	: 'icon-save',
				handler: function(){
					
					var mode = Ext.getCmp("frmd-mode").getValue();
					var id = Ext.getCmp("frmd-id").getValue();
					var f_unit_cost = Ext.getCmp('frmd-c_cost_asset').getValue();
					var c_cost_ruins = Ext.getCmp('frmd-c_cost_ruins').getValue();
					var i_period_year = Ext.getCmp('frmd-i_period_year').getValue();
					var f_depreciate = Ext.getCmp('frmd-f_depreciate').getValue();
					var i_is_expense = Ext.getCmp('frmd-i_is_expense').getValue().inputValue;
					var d_depreciate = Ext.getCmp('frmd-d_depreciate').getValue();
					
					Ext.Ajax.request({
						url : 'api/mnAmRuins.php' ,
						method: 'POST',
						params : { 
							mode : mode,
							id : id,
							f_unit_cost : f_unit_cost,
							c_cost_ruins : c_cost_ruins,
							i_period_year : i_period_year,
							f_depreciate : f_depreciate,
							i_is_expense : i_is_expense,
							d_depreciate : d_depreciate
						},
						success: function ( result, request ) {
							var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
							if (jsonData.success) {
								//Ext.MessageBox.alert('Success', jsonData.msg);		// alert massage success
								
								Ext.getCmp('RuinsGrid').getStore().load({
									callback : function(records, operation, success){
										for(i =1; i <= records.length; i++){
											var rec = records[(i-1)];
											
											if (parseInt(rec.get('i_type')) == 2 && parseInt(rec.get('i_is_audit')) != 1)
											{
												// new Object
												var dtlID = rec.get('id');
												genComponance(rec, dtlID, i)
											}
											
										}
									}
								});
								
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
	
	//=========================================================================================//
	/*====================== CENTER ======================*/
	var center = new Ext.TabPanel({
		region: 'center',
		border: false,
		id: 'contenterCenter',
		defaults:{ autoScroll: true }, 
		items: [ gridMain ]
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
	
	Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({header: "ผู้ที่สร้าง",		hidden:true,	sortable: true,	dataIndex:'dc_user_create_id'}));
	Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({header: "วันที่สร้าง",	hidden:true,  	sortable: true,	dataIndex:'d_create', align:'center' , renderer:shortThaiDate }));
	Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({header: "หน่วยงานผู้สร้าง",	hidden:true,	sortable: true,	dataIndex:'dc_user_create_cost_id' }));
	Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({header: "ผู้แก้ไข", 	hidden:false,  	sortable: true, dataIndex:'dc_user_create_id' }));
	Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({header: "วันที่แก้ไข", 	hidden:false,  	sortable: true, dataIndex:'d_update', align:'center' ,renderer:shortThaiDate, }));
	Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({header: "หน่วยงานผู้แก้ไข",hidden:false,	sortable: true, dataIndex:'dc_user_update_cost_id' }));
	/*
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
        */
	/*====================== RENDER ======================*/
	
});