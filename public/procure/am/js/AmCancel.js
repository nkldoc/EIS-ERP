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
//OnLoad	
Ext.onReady(function() {
Ext.QuickTips.init();
 
	var store = new Ext.data.JsonStore({
	storeId: 'myStore',
    autoDestroy: true,
	autoLoad: true,
    url : 'api/ListAmCancel.php',
    root: 'data',
    baseParams: { i_read:user_right_read }, //Permission i_read
    idProperty: 'id',
	totalProperty: 'totalCount',
	fields: [
		{ name: 'no' },
		{ name: 'c_code' },
		{ name: 'cancel_name' },
		{ name: 'c_cancel_name' },
		{ name: 'c_cancel_cost_name' },
		{ name: 'cancel_date' }
	]
	});
 

	/*====================== TabShow Intelization ======================*/
	/* Grid */
	var gridMain = {
		region: 'center',
		title: 'แสดงข้อมูลการยกเลิกสินทรัพย์',
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
				}
			},{
				xtype : 'tbfill'  
			},'  ', ' ', '-', "เรื่อง ", {
				id: "s_cancel_name",
				xtype: "textfield",
				width: 150,
				fieldLabel: "fieldLabel",
				emptyText: "",
			}, "-"
			, "วันที่ยกเลิก ", "-"
			,{
				xtype: 'datefield', 
				id: 's_d_beginID', 
				name: 's_d_begin', 
				width:140,
				value:defaultDate(1),
				emptyText : "วันที่เริ่ม",
	        }, " ", " ถึง "
	        ,{
				xtype: 'datefield', 
				id: 's_d_endID', 
				name: 's_d_end', 
				width:140,
				value:defaultDate(2),
				emptyText : "วันที่สิ้นสุด",
	        }
			,' ', '-', {
				text : "ค้นหา",
				iconCls: 'icon-magnifier',
				handler : function() {  
					if (Ext.getCmp("value-box").getValue()!="")
					{
							store.setBaseParam("mode", "SEARCH");
 							store.setBaseParam("cancel_name",Ext.getCmp("s_cancel_name").getValue()); 
 							storeMain.setBaseParam("d_begin", Ext.getCmp("s_d_beginID").getValue());
 							storeMain.setBaseParam("d_end", Ext.getCmp("s_d_endID").getValue());
							Ext.getCmp('tabpanel1').getStore().load();
					}else{
						 
							store.setBaseParam("mode", "");
							Ext.getCmp('tabpanel1').getStore().load();
					}
				}
			} ,' ', '-'],
					columns:[new Ext.grid.RowNumberer({
							width:35,
							header:" No ",
							renderer:function(value, metaData, record, row, col, store, gridView){
								return record.get('no');
							}
					}),
					{ header: "เลขที่นำเข้าสินทรัพย์ ", sortable: true, dataIndex: 'c_code' , align:'center'},
					{ id: 'c_name', header: "เรื่อง ", sortable: true, dataIndex: 'cancel_name' },
					{ header: "วันที่ยกเลิก", align:'center', sortable: true, dataIndex: 'cancel_date' },
					{ header: "ผู้สร้างรายการ", sortable: true, dataIndex: 'c_cancel_name' },
					{ header: "หน่วยงาน", align:'center', sortable: true, dataIndex: 'c_cancel_cost_name' },
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
	var storeSD	= new Ext.data.JsonStore({ 
            //autoLoad: true,
            storeId: 'myStoreSD',
            url: 'api/All_AmCombo.php',
            baseParams: {type : 'storeSD'},
	    root: 'data',
	    idProperty: 'id',
            totalProperty: 'totalCount',
	    fields: [ 'no','id', 'c_code','c_name']
	});
	
	var frmSD = new Ext.ux.Poplov({
	    id			: 'frm-am_tran_rg_hdr_id',	//go to relation	
	    iconCls		: 'page_magnify', 
	    valueHidden : 'am_tran_rg_hdr_id', 	//go to hidden
	    store		: storeSD,
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
	    widthText	: 340, 
	    fieldLabel	: 'เลขที่นำเข้าสินทรัพย์', 
	});
	
	var panelForm = {
		region: 'center',
		title: 'ข้อมูลการยกเลิกสินทรัพย์',
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
			url:'api/mnAmCancel.php',
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
			},{				
				xtype : "hidden",
				name: "id",
				readOnly: true
			},{
				fieldLabel: 'เรื่อง',
				xtype: 'textfield',
				id : 'frm-cancel_name',
				name: 'cancel_name'
			},frmSD.mini,{
				fieldLabel: 'หมายเหตุ',
				xtype: 'textarea',
				name:'c_comment',
			},{
				fieldLabel: 'วันที่ทำรายการ',
				xtype: 'textfield',
				name: 'cancel_date',
				value:defaultDate(2),
				anchor: '30%',
				readOnly: true
			}],
			buttons: [{
				text : Ext.GLOBAL_BU_SAVE_TH,
				id:'buSave',
				iconCls	: "icon-save",
				handler : function() {
					var form = Ext.getCmp("form-widgets").getForm();
					var cancel_name = Ext.getCmp('frm-cancel_name').getValue();
					var am_tran_rg_hdr_id = Ext.getCmp('frm-am_tran_rg_hdr_id').getValue();
					
					if (cancel_name == "")
						Ext.Msg.alert('ผิดพลาด', 'กรุณาระบุ เรื่อง');
					else if (am_tran_rg_hdr_id == "")
						Ext.Msg.alert('ผิดพลาด', 'กรุณาเลือก เลขที่นำเข้าสินทรัพย์');
					else if (form.isValid()){ 
						form.submit({
							waitMsg:'Saving Data...',
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
				text: Ext.GLOBAL_BU_BACK_TH,
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
    Ext.getCmp('contenterCenter').setActiveTab('tabpanel1'); 
    //InfoMainGrid('tabpanel1',true,true,true,true,true,true);
});