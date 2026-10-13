//Function
function controllTab(record,butt){ 

    Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-dtlID'), true) || {}; //null obj not errer

    if(butt=='add'){  
        var frmSoDtl = new formSoDtl();  
        Ext.getCmp('contenterCenter').add(frmSoDtl); 
        Ext.getCmp('contenterCenter').setActiveTab(frmSoDtl);  
        DisbledButton(false);

    }else if(butt=='edit' || butt=='view'){ 

        var frmSoDtl = new formSoDtl();  
        Ext.getCmp('contenterCenter').add(frmSoDtl); 
        Ext.getCmp('contenterCenter').setActiveTab(frmSoDtl);  
        frmSoDtl.getForm().loadRecord(record); 

        Ext.getCmp('role-form-mode').setValue('EDIT');

        if(butt=='view')DisbledButton(true); else  DisbledButton(false);

    }else if(butt=='remove'){
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
                            url : 'api/mnDcProduct.php' , 
                            params : { 
                                    mode : 'DELETE', 
                                    id : record.get('id'),
                            }, 
                            method: 'GET', //POST
                            success: function ( result, request ) { 
                                var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
                                if (jsonData.success) { 
                                } else {
                                        Ext.MessageBox.alert('Failed', jsonData.msg);			// alert massage error
                                }
                                Ext.getCmp("win-msg-delete").hide();						// hidden window-panel
                                Ext.getCmp("win-msg-delete").destroy();						// clear memory :: garbage collection
                                Ext.getCmp('tabpanel1').getStore().reload();
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
                        Ext.getCmp('tabpanel1').getStore().reload();
                    }
                }]
            }).show();
        }		
				
}; //End

function cellClick(grid, rowIndex, columnIndex, e) { 
    var record = grid.getStore().getAt(rowIndex); 
    if (columnIndex==grid.getColumnModel().getIndexById('edit')) {
        controllTab(record,'edit'); 
    } else if (columnIndex==grid.getColumnModel().getIndexById('view')) {
        controllTab(record,'view'); 	
    } else if (columnIndex==grid.getColumnModel().getIndexById('remove')) {
        controllTab(record,'remove'); 
    }
};
	 
function DisbledButton(t){
    //Disabled etc...
    if(t){
        Ext.getCmp('buSaveID').hide();
    }else{
        Ext.getCmp('buSaveID').show();
    }
}
	
//Class Extend
formSoDtl = function() {
    formSoDtl.superclass.constructor.call(this, {  
        listeners:{
                afterrender: function( obj, eOpts ){ /*console.log('Load Finish'); */},
        },
        id:'frm-so-dtlID', 
        url:'api/mnDcProduct.php', 
        frame : true,
        bodyStyle : "padding:0px", 
        autoScroll: true,
        loadMask: true,
        width   : 700,  
        labelWidth: 180,
        bodyStyle : "padding:5px",
        defaults:{ flex:1, },   
        title:'รายการรายได้',  
        items:[{
                id : "role-form-mode",
                xtype : "hidden",
                name : "mode",
                value:'ADD',
                readOnly: true				
            },{ 
                xtype : "hidden",
                name : "id", 		
            }, {
                xtype: 'textfield',
                fieldLabel: 'รหัส',
                name : 'c_code',
                /* anchor: '45%', */
                readOnly: true
            } ,{
                xtype: 'textfield',
                fieldLabel: 'รายการรายได้',
                name : 'c_name',
                /* anchor: '60%', */
                validator: function(val) {
                    if (!Ext.isEmpty(val)){ return true; } else {
                        return "กรุณา กรอกรายการรายได้";
                    }
                }
            },{ 
                xtype: 'combo',
                fieldLabel: 'หน่วยนับ  ',
                id: 'dc_unit_typeID',
                store: Ext.storeDcUnitType,
                /* anchor: '40%', */
                valueField: 'id',
                displayField: 'c_name',
                submitValue : true,
                hiddenName : 'dc_unit_type_id',
                mode: "local",
                triggerAction: "all",
                emptyText: "--- หน่วยนับ ---",
                forceSelection: true,
                selectOnFocus: true,
                validator: function(val) {
                    if (!Ext.isEmpty(val)){ return true; } else {
                        return "กรุณาเลือกหน่วยนับ";
                    }
                }, listeners: { 
                    select: function(combo, record, index) {
                            var newValue = record.data.id; 
                    }
                }	
            } , 
            Ext.PopProductGroupForm.mini,
            Ext.PopAccForm.mini , 
			Ext.PopBankAccCompany.mini ,
			{
                xtype: 'textfield',
                fieldLabel: 'รหัสอ้างอิงจากระบบอื่น',
                name : 'c_map_code'
            }, {
                xtype: 'textarea',
                fieldLabel: 'หมายเหตุ',
                name : 'c_comment',
                width:300
            }, { 
                fieldLabel: 'รายยการรายได้ที่เมนูสมุดรายวัน',
                xtype: 'radiogroup',
                columns: [80,100],
                items: [
                        { boxLabel: ' ไม่แสดง', checked: true, name: 'i_show_gl', inputValue: '2' },
                        { boxLabel: 'แสดง', name: 'i_show_gl', inputValue: '1' }
                ] 
            } , { 
                fieldLabel: 'สถานะการใช้งาน',
                xtype: 'radiogroup',
                columns: [80,100],
                items: [
                        { boxLabel: 'ใช้งาน', checked: true, name: 'i_enable', inputValue: Ext.CONF_STATUS_ENABLE },
                        { boxLabel: 'ไม่ใช้งาน', name: 'i_enable', inputValue: Ext.CONF_STATUS_DISABLE }
                ] 		        	
            }],  
        buttonAlign: 'left',
        buttons:[{
            text : 'บันทึกรายการ',
            id:'buSaveID',
            iconCls:'icon-save', 
            listeners:{
                afterrender:function(){ 
                        /* if(Ext.getCmp('c_area_codeEditDisID').getValue()!='0'){ 

                                Ext.getCmp('modeEditID').setValue('GENCODE2');
                        }else{
                                Ext.getCmp('modeEditID').setValue('GENCODE'); 
                        } */ 
                }
            },
            handler : function() { 
                var form 	= Ext.getCmp('frm-so-dtlID').getForm(); 
                if(form.isValid()){  
                    form.submit({
                        waitMsg:'Saving Data...',
                        success : function(form, action) {

                            Ext.Msg.alert('Success',  action.result.msg,function(){    
                                Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-so-dtlID'), true) || {}; //null obj not errer		  
                                Ext.store.reload(); 
                            }); 
                        },
                        failure: function(form, action) {
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
        },{
            text : Ext.GLOBAL_BU_BACK_TH,
            handler: function() {
                Ext.getCmp('contenterCenter').setActiveTab('tabpanel1');  
            }
        }] 
    });
};
Ext.extend(formSoDtl, Ext.FormPanel, {}); 

searchGrid = function() {
    var filters = {
        xtype: 'combo', 
        id:'filter-ID',
        store: new Ext.data.SimpleStore({
            fields: ["id", "c_name"],  
            data:[['c_name', "ชื่อรายได้"],['c_code', "รหัส"],['c_map_code', 'รหัสอ้างอิงจากระบบอื่น']],
        }),
        value: 'c_name',
        valueField: 'id',
        displayField: 'c_name',
        submitValue: true,
        hiddenName: 'filter',
        mode: "local",
        triggerAction: "all", 
        forceSelection: true,
        selectOnFocus: true,
        editable:false,
        listeners: {
            select: function(combo, record, index) {
                var newValue = record.data.id;
            }
        }
    };	
    Ext.fieldsetID = false;					
    //classOverride				
    searchGrid.superclass.constructor.call(this, { 
        initComponent: function(){ 
            searchGrid.superclass.initComponent.call(this);
            this.fn(this); 
        },
        listeners:{
            afterrender: function( obj, eOpts ){ /*console.log('Load Finish');*/ },
        },
        fn:function(){ },
        id:'frm-grid-searchID', 
        frame : true,
        bodyStyle : "padding:2px",
        autoHeight: true,
        width   : 730,  
        labelWidth: 180,
        defaults: {
            anchor: '0'
        }, 
        items : [{
            xtype: 'compositefield',
            fieldLabel: 'คำที่ค้นหา',
            msgTarget : 'side',
            anchor    : '-10',
            defaults: { flex: 1 },
            items: [
                {
                    xtype: 'textfield',
                    id:'val-ID',
                    name : 'value'
                },filters
            ]
        }],  
        buttonAlign: 'left', 
        buttons: [{	
            text : 'เพิ่มข้อมูล',
            id:'buAdd',  
            iconCls: 'icon-add',  
            handler: function(grid, rowIndex, colIndex) {  
                controllTab({},'add');
            }
        },{
            xtype : 'tbfill'  
        },{	
            text : 'ค้นหา',
            id:'buSearchID',
            iconCls: 'icon-magnifier',  
            handler: function() { 
                Ext.store.setBaseParam("mode", "SEARCH");
                Ext.store.setBaseParam("filter",Ext.getCmp("filter-ID").getValue()); 
                Ext.store.setBaseParam("value", Ext.getCmp("val-ID").getValue());  	 
                Ext.getCmp('tabpanel1').getStore().load(); 
            }
        },{
            text : 'เริ่มใหม', 
            iconCls: 'icon-reset',	
            handler : function() { 
                    Ext.getCmp('frm-grid-searchID').getForm().reset();  
            }
        }]
    });
};

Ext.extend(searchGrid, Ext.FormPanel, {});  

//store
Ext.store = new Ext.data.JsonStore({
    storeId: 'myStore',
    autoDestroy: true,
    autoLoad: true,
    url : 'api/ListDcProduct.php',
    root: 'data',
    baseParams: { i_read:user_right_read }, //Permission i_read
    idProperty: 'id',
    totalProperty: 'totalCount',
    fields: [
        {name:'no' },
        {name:'id' },  
        {name:'dc_product_group_id'},
        {name:'txtdc_product_group_idID'},
        {name:'c_code'},
        {name:'c_name'}, 
        {name:'dc_unit_type_id'}, 
        {name:'dc_acc_id'}, 
        {name:'txtdc_acc_idID'},
		{name:'dc_bank_acc_company_id'},
		{name:'txtdc_bank_acc_company_idID'},
        {name:'i_show_gl'},
		{name:'c_map_code'},
        {name:'c_comment'},
        {name:'i_enable'},
        {name:'dc_user_create_id'},
        {name:'dc_user_create_cost_id'},
        {name:'d_create'},
        {name:'dc_user_update_id'},
        {name:'dc_user_update_cost_id'},
        {name:'d_update'}
    ]
});

Ext.storeAcc = new Ext.data.JsonStore({ 
    storeId: 'myStore1', 
    autoLoad: true,
    url : 'api/All_DcCombo.php',
    root: 'data',
    baseParams: { type : 'storeAcc' }, //Permission i_read
    idProperty: 'id',
    totalProperty: 'totalCount', 
    fields: [ 'id', 'c_code', 'c_name']
});

Ext.storeProductGroup = new Ext.data.JsonStore({ 
    storeId: 'myStore1', 
    autoLoad: true,
    url : 'api/All_DcCombo.php',
    root: 'data',
    baseParams: { type : 'storeProductGroup' }, //Permission i_read
    idProperty: 'id',
    totalProperty: 'totalCount', 
    fields: [ 'id', 'c_code', 'c_name']
});

	
Ext.storeDcUnitType = new Ext.data.JsonStore({
    //autoDestroy: true,
    autoLoad: true,
    url: 'api/All_DcCombo.php',
    baseParams: {type : 'storeUnitType'},
    root: 'data',
    idProperty: 'id',
    fields: [ 'id', 'c_name']
});

Ext.storeBankAccCompany = new Ext.data.JsonStore({ 
    storeId: 'myStore1', 
    autoLoad: true,
    url : 'api/All_DcCombo.php',
    root: 'data',
    baseParams: { type : 'storeBankAccCompany' }, //Permission i_read
    idProperty: 'id',
    totalProperty: 'totalCount', 
    fields: [ 'id', 'c_bank_name', 'c_code', 'c_name', 'c_type_name']
});

//PopLove
var columnMini = [
    { header: "ID System", sortable: true, hidden:true, dataIndex: 'id' },
    { header: "รหัส", sortable: true, dataIndex:'c_code' , },
    { header: "ชื่อ"
        , sortable: true
        , id: 'c_name' 
        , dataIndex: 'c_name',
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                        metaData.attr = "style='cursor:pointer';";
                return value; 
        }
    }
];
	
Ext.PopAccForm = new Ext.ux.Poplov({ 
    text	: 'บัญชีรายได้',  
    id		: 'dc_acc_idID',	//go to relation	
    iconCls	: 'page_magnify', 
    valueHidden : 'dc_acc_id', 	//go to hidden
    store	: Ext.storeAcc,
    headerGrid	: columnMini,
    widthText	: 280,  
    fieldLabel	: 'บัญชีรายได้ '
}); 	

Ext.PopProductGroupForm = new Ext.ux.Poplov({ 
    text	: 'กลุ่มรายได้',  
    id		: 'dc_product_group_idID',	//go to relation	
    iconCls	: 'page_magnify', 
    valueHidden : 'dc_product_group_id', 	//go to hidden
    store	: Ext.storeProductGroup,
    headerGrid	: columnMini,
    widthText	: 280,  
    fieldLabel	: 'กลุ่มรายได้ '
}); 

var filterBAC = new Ext.data.SimpleStore({
					  fields: ["value", "text"],
					  data:[['c_code', "เลขที่บัญชี"],['c_name', "ชื่อบัญชี"]],
				});
				
Ext.PopBankAccCompany = new Ext.ux.Poplov({ 
    text	: 'บัญชีธนาคารเงินโอน',  
    id		: 'dc_bank_acc_company_idID',	//go to relation	
    iconCls	: 'page_magnify', 
    valueHidden : 'dc_bank_acc_company_id', 	//go to hidden
    store	: Ext.storeBankAccCompany,
    headerGrid	: [
					{ header: "ID System", sortable: true, hidden:true, dataIndex: 'id' },
					{ header: "ธนาคาร", sortable: true, dataIndex:'c_bank_name' , 
						renderer: function(value, metaData, record, rowIndex, colIndex, store) {
										metaData.attr = "style='cursor:pointer';";
								return value; 
						}
					},{ header: "เลขที่บัญชี", sortable: true, dataIndex:'c_code' , 
						renderer: function(value, metaData, record, rowIndex, colIndex, store) {
										metaData.attr = "style='cursor:pointer';";
								return value; 
						}
					},{ header: "ชื่อบัญชี"
						, sortable: true
						, id: 'c_name' 
						, dataIndex: 'c_name',
						renderer: function(value, metaData, record, rowIndex, colIndex, store) {
										metaData.attr = "style='cursor:pointer';";
								return value; 
						}
					},{ header: "ประเภทบัญชี"
						, sortable: true
						, dataIndex: 'c_type_name',
						renderer: function(value, metaData, record, rowIndex, colIndex, store) {
										metaData.attr = "style='cursor:pointer';";
								return value; 
						}
					}
				],
    widthText	: 280,  
    fieldLabel	: 'บัญชีธนาคารเงินโอน ',
	filterGrid 	: filterBAC
}); 

//ใช้เกี่ยวกับวันที่ในการเซตปฏิทน หรือ ลิสบ็อก
Ext.getDate = Ext.apply({
        year:new Date().getFullYear(), 
        month:new Date().getMonth()+1,
        day:new Date().getDay(),
        getNowCarlen:function(){
                 var day = new Date();
                 var dd = day.getDate();
                 var mm = day.getMonth() + 1;
                 var yy = day.getFullYear()+543; 
                 mm = (mm < 10) ? ("0" + mm) : mm;
                 dd = (dd < 10) ? ("0" + dd) : dd; 
                return dd+'-'+mm+'-'+yy;
        },	
        defaultDate:function(typeStartDate) {
            var day = new Date();
            var dd = day.getDate();
            var mm = day.getMonth() + 1;
            var yy = day.getFullYear() + 543; 
            if (typeStartDate == 1) // วันที่เริ่ม -1 เดือน
            {
                dd = "01";
                mm = "0" + mm.toString(); 
            } else {
                dd = "0" + dd.toString();
                mm = "0" + mm.toString();
            }
            return dd.substr(-2) + "-" + mm.substr(-2) + "-" + yy.toString();
         }			
});

//OnLoad
Ext.onReady(function(){
    Ext.QuickTips.init();
    var gridMain = {
        region: 'center',
        title: 'แสดงข้อมูลรายการรายได้',
        xtype: 'grid',
        id:'tabpanel1',
        border: false,
        stripeRows: true,
        loadMask: true,
        store: Ext.store,
        tbar: [new searchGrid()],
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
			{ header: "รหัสอ้างอิงจากระบบอื่น", width:210, sortable: true, dataIndex: 'c_map_code' }, 
            { id: 'c_name', header: "รายการรายได้", width:210, sortable: true, dataIndex: 'c_name' }, 
            { header: "กลุ่มรายได้", width:210, sortable: true, dataIndex: 'txtdc_product_group_idID' }, 
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
            }
        ],
	// autoExpandColumn: 'c_name',
        bbar: new Ext.PagingToolbar({
            pageSize: 20,
            store: Ext.store,
            displayInfo: true,
            displayMsg: 'Displaying topics {0} - {1} of {2}'
        })
    };
	 
    new Ext.Viewport({
        layout: 'border',
        items: [new Ext.TabPanel({
            region: 'center',
            border: false, 
            id:'contenterCenter',
            defaults:{autoScroll:true}, 
            items: [gridMain],   
        })]
    });
    Ext.getCmp('contenterCenter').setActiveTab('tabpanel1');  
    Ext.getCmp('tabpanel1').on('cellclick', cellClick, this); 
    InfoMainGrid('tabpanel1',true,true,true,true,true,true);
});