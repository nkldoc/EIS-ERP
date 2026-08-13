//Function
function controllTab(record,butt){ 

    Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-Add'), true) || {}; //null obj not errer

    if(butt=='add'){  
        var frmAdd = new formAdd();  
        Ext.getCmp('contenterCenter').add(frmAdd); 
        Ext.getCmp('contenterCenter').setActiveTab(frmAdd);  
        DisbledButton(false);
    }else if(butt=='edit' || butt=='view'){ 
        var frmAdd = new formAdd();  
        Ext.getCmp('contenterCenter').add(frmAdd); 
        Ext.getCmp('contenterCenter').setActiveTab(frmAdd);  
        frmAdd.getForm().loadRecord(record);

        // Load Method
        Ext.storeMethod.setBaseParam("dc_section_tax_id", record.data.id);
        Ext.storeMethod.load();
        Ext.getCmp('grid_method').show();
        
        // Load Sub
        Ext.storeSub.setBaseParam("dc_section_tax_id", record.data.id);
        Ext.storeSub.load();
        Ext.getCmp('grid_sub').show();
        
        Ext.getCmp('frm-mode').setValue('EDIT');

        if(butt=='view')DisbledButton(true); else  DisbledButton(false);
    }else if(butt=='remove'){
        var win = new Ext.Window({
            id : "win-msg-delete",
            title : "Remove",
            modal: true,
            width : 250,
            height : 130,
            html: "ท่านต้องการที่จะลบข้อมูล ?",
            buttons : [{
                        text : "Confirm",
                        handler : function() {
                            Ext.Ajax.request({
                                url : 'api/mnDcSectionTax.php' , 
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
                    }
            ]
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

function getComboDisplay(combo) {
    var value = combo.getValue();
    var valueField = combo.valueField;
    var record;
    combo.getStore().each(function(r){
        if(r.data[valueField] == value){
            record = r;
            return false;
        }
    });
    return record ? record.get(combo.displayField) : null;
}

//Class Extend
formAdd	 = function() {
    //================ DcTaxMethod ================
    var gridMethod = new Ext.grid.GridPanel({
                        region: 'center',
                        id: 'grid_method',
                        layout:'fit',
                        title:'หมวดภาษีอากร รายละเอียดประเภทเงินได้',
                        height: 280,
                        autohieght: true,
                        border: true,
                        stripeRows: true,
                        hidden:true,
                        loadMask: true,
                        store: Ext.storeMethod,
                        viewConfig : {
                            emptyText: "ไม่มีข้อมูล..",
                            deferEmptyText: false,
                            forceFit: true,
                            scrollOffset: 0 // close scrollbar
                        },
                        tbar: [{
                            text : 'เพิ่มข้อมูล',
                            iconCls: 'icon-add', 
                            id:'buAdd2',
                            handler: function(grid, rowIndex, colIndex) {
                                frmMethod();
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
                            { id: "c_name", header: 'ชื่อประเภทเงินได้', sortable: true, dataIndex: 'c_name' },
                            {
                                header: "Edit",
                                sortable: false,
                                align:'center',
                                id:'edit2',
                                width:50,
                                dataIndex:'id' ,
                                renderer: function(value, metaData, record, row, col, store, gridView) {
                                        return'<img src="../images/icons/document_edit.gif");/>';
                                }
                            },{
                                header:'Remove', 
                                align:'center',
                                id:'remove2',
                                sortable: false,
                                width:70,
                                dataIndex:'id' ,
                                renderer: function(value, metaData, record, row, col, store, gridView) {
                                        return'<img src="../images/icons/document_delete.gif");/>';
                                }
                            }
                        ],
                        columnLines: true,
                        autoExpandColumn: 'c_name',
                        listeners:{
                            cellclick: function(grid, rowIndex, columnIndex, e){
                                var record = grid.getStore().getAt(rowIndex);
                                if (columnIndex == grid.getColumnModel().getIndexById('edit2')) {
                                    frmMethod();
                                    Ext.getCmp('frm-method').getForm().loadRecord(record);
                                    Ext.getCmp('method-form-mode').setValue('EDIT_METHOD');
                                }else if (columnIndex == grid.getColumnModel().getIndexById('remove2')) {
                                    var win = new Ext.Window({
                                            id : "win-msg-delete2",
                                            title : "Remove",
                                            modal: true,
                                            width : 250,
                                            height : 130,
                                            html: "ท่านต้องการที่จะลบข้อมูล ?",
                                            buttons : [{
                                                    text : "Confirm",
                                                    handler : function() {
                                                            Ext.Ajax.request({
                                                                    url : 'api/mnDcSectionTax.php' ,
                                                                    method: 'POST',
                                                                    params : { 
                                                                        mode : 'DELETE_METHOD', 
                                                                        dc_section_tax_id : record.data.dc_section_tax_id,
                                                                        id : record.get('id')
                                                                    },
                                                                    success: function ( result, request ) {
                                                                        var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
                                                                        if (jsonData.success) {
                                                                                //Ext.MessageBox.alert('Success', jsonData.msg);		// alert massage success
                                                                        } else {
                                                                                Ext.MessageBox.alert('Failed', jsonData.msg);			// alert massage error
                                                                        }
                                                                        Ext.getCmp("win-msg-delete2").hide();						// hidden window-panel
                                                                        Ext.getCmp("win-msg-delete2").destroy();						// clear memory :: garbage collection

                                                                        // Load Method
                                                                        Ext.storeMethod.load();
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
                    });
                
    function frmMethod(){
        var winM = new Ext.Window({
                    id : "win-method",
                    title : "รายละเอียดประเภทเงินได้",
                    modal: true,
                    border: false,
                    width : 500,
                    items: [{
                        xtype: 'form',
                        id:'frm-method',
                        layout: 'hbox',
                        align: 'stretch',
                        defaults: { xtype: 'fieldset', flex:1, autoHeight: true },
                        items: [{ 
                            defaults: { allowBlank: true, anchor: '100%' },
                            items: [{
                                id: "method-form-mode",
                                xtype: "hidden",
                                name: "mode",
                                value : "ADD_METHOD",
                                readOnly: true
                            }, {
                                xtype: "hidden",
                                id : "method-form-dc_section_tax_id",
                                name:'dc_section_tax_id',
                                value:Ext.getCmp('frm-id').getValue(),
                                readOnly: true
                            }, {
                                xtype: "hidden",
                                id: "method-form-id",
                                name:'id',
                                readOnly: true
                            }, {
                                xtype: 'textfield',
                                fieldLabel: 'ลำดับรายการ',
                                id : "method-form-c_code",
                                name:'c_code',
                                anchor: '80%'
                            },{
                                xtype: 'textfield',
                                fieldLabel: 'ชื่อประเภทเงินได้',
                                id : "method-form-c_name",
                                name:'c_name',
                                anchor: '80%'
                            }]
                        }]
                    }],
                    buttonAlign: 'left',
                    buttons : [{
                        text : "&nbsp;บันทึกรายการ&nbsp;",
                        iconCls	: 'icon-save',
                        handler: function(){
                            var mode = Ext.getCmp("method-form-mode").getValue();
                            var section_tax_id = Ext.getCmp("method-form-dc_section_tax_id").getValue();
                            var id = Ext.getCmp("method-form-id").getValue();
                            var c_code = Ext.getCmp("method-form-c_code").getValue();
                            var c_name = Ext.getCmp("method-form-c_name").getValue();

                            if (c_name == "")
                                Ext.Msg.alert('ผิดพลาด', 'กรุณาระบุ ชื่อประเภทเงินได้');
                            else 
                            {
                                Ext.Ajax.request({
                                    url : 'api/mnDcSectionTax.php' ,
                                    method: 'POST',
                                    params : { 
                                        mode : mode, 
                                        dc_section_tax_id : section_tax_id,
                                        id : id,
                                        c_code : c_code,
                                        c_name : c_name
                                    },
                                    success: function ( result, request ) {
                                        var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
                                        if (jsonData.success) {
                                            // Load Method
                                            Ext.storeMethod.load();

                                            Ext.getCmp("win-method").hide();
                                            Ext.getCmp("win-method").destroy();
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
                        text : "Cancel",
                        handler : function() {
                                Ext.getCmp("win-method").hide();
                                Ext.getCmp("win-method").destroy();
                        }				
                    }]
                }).show();
        return winM;
    }
    //================ DcTaxMethod ================
    
    //================ DcSectionTaxSub ================
    var gridSub = new Ext.grid.GridPanel({
                    region: 'center',
                    id: 'grid_sub',
                    layout:'fit',
                    title:'หมวดภาษีอากร รายละเอียดประเภทกิจการ',
                    height: 280,
                    autohieght: true,
                    border: true,
                    stripeRows: true,
                    hidden:true,
                    loadMask: true,
                    store: Ext.storeSub,
                    viewConfig : {
                        emptyText: "ไม่มีข้อมูล..",
                        deferEmptyText: false,
                        forceFit: true,
                        scrollOffset: 0 // close scrollbar
                    },
                    columns: [
                        new Ext.grid.RowNumberer({
                            header:' No ',
                            width:50,
                            renderer:function(value, metaData, record, row, col, store, gridView){
                                    return record.get('no');
                            }
                        }),
                        { id:"c_name", header: 'ประเภทกิจการ', sortable: true, dataIndex: 'c_name' },
                        { header: 'อัตราภาษีหัก ณ ที่จ่าย', sortable: true, dataIndex: 'c_tax_name' },
                        { header: 'ภ.ง.ด. ประจำเดือน', sortable: true, dataIndex: 'c_tax_income_name' },
                        { header: 'ภ.ง.ด. ประจำปี', sortable: true, dataIndex: 'c_tax_income_parent_name' },
                        {
                            header: "Edit",
                            sortable: false,
                            align:'center',
                            id:'edit_sub',
                            width:50,
                            dataIndex:'id' ,
                            renderer: function(value, metaData, record, row, col, store, gridView) {
                                return'<img src="../images/icons/document_edit.gif");/>';
                            }
                        }
                    ],
                    columnLines: true,
                    autoExpandColumn: 'c_name',
                    listeners:{
                        cellclick: function(grid, rowIndex, columnIndex, e){
                            var record = grid.getStore().getAt(rowIndex);
                            if (columnIndex == grid.getColumnModel().getIndexById('edit_sub')) {
                                frmSub(record);
                            }
                        }
                    }
                });
                
    function frmSub(record){
        var winS = new Ext.Window({
                    id : "win-sub",
                    title : "รายละเอียดประเภทกิจการ",
                    modal: true,
                    border: false,
                    width : 500,
                    items: [{
                        xtype: 'form',
                        id:'frm-sub',
                        layout: 'hbox',
                        align: 'stretch',
                        defaults: { xtype: 'fieldset', flex:1, autoHeight: true },
                        items: [{ 
                            defaults: { allowBlank: true, anchor: '100%' },
                            items: [{
                                    id: "sub-form-mode",
                                    xtype: "hidden",
                                    name: "mode",
                                    value : "EDIT_SUB",
                                    readOnly: true
                                }, {
                                    xtype: "hidden",
                                    id : "sub-form-dc_section_tax_id",
                                    value:Ext.getCmp('frm-id').getValue(),
                                    readOnly: true
                                }, {
                                    xtype: "hidden",
                                    id: "sub-form-id",
                                    value : record.data.id,
                                    readOnly: true
                                }, {
                                    xtype: 'textfield',
                                    id : 'sub-form-c_name',
                                    fieldLabel: 'ประเภทกิจการ',
                                    value : record.data.c_name,
                                    readOnly: true
                                },new Ext.form.ComboBox({
                                    id: 'dc_tax',
                                    fieldLabel: 'ภาษีหัก ณ ที่จ่าย',
                                    store:Ext.storeDcTax ,
                                    valueField: 'id',
                                    displayField: 'c_name',
                                    submitValue : true,
                                    hiddenName : 'dc_tax_id',
                                    value: record.data.dc_tax_id,
                                    typeAhead: true,
                                    mode: 'local',
                                    triggerAction: 'all',
                                    emptyText: 'กรุณาเลือก...',
                                    autoSelect: true,
                                    forceSelection: true,
                                    selectOnFocus: true,
                                }),new Ext.form.ComboBox({
                                    id: 'dc_tax_income',
                                    fieldLabel: 'ภ.ง.ด. ประจำเดือน',
                                    store: Ext.storeDcTaxIncome,
                                    valueField: 'id',
                                    displayField: 'c_name',
                                    submitValue : true,
                                    hiddenName : 'dc_tax_income_mth_id',
                                    value: record.data.dc_tax_income_mth_id,
                                    typeAhead: true,
                                    mode: 'local',
                                    triggerAction: 'all',
                                    emptyText: 'กรุณาเลือก...',
                                    autoSelect: true,
                                    forceSelection: true,
                                    selectOnFocus: true
                                })]
                        }]
                    }],
                    buttonAlign: 'left',
                    buttons : [{
                        text : "&nbsp;บันทึกรายการ&nbsp;",
                        iconCls	: 'icon-save',
                        handler: function(){
						
                            var mode = Ext.getCmp("sub-form-mode").getValue();
                            var section_tax_id = Ext.getCmp("sub-form-dc_section_tax_id").getValue();
                            var dc_tax_customer_id = record.data.dc_tax_customer_id;
                            var dc_tax_id = Ext.getCmp("dc_tax").getValue();
                            var dc_tax_income_mth_id = Ext.getCmp("dc_tax_income").getValue();

                            Ext.Ajax.request({
                                    url : 'api/mnDcSectionTax.php' ,
                                    method: 'POST',
                                    params : { 
                                            mode : mode, 
                                            dc_section_tax_id : section_tax_id,
                                            dc_tax_customer_id : dc_tax_customer_id,
                                            dc_tax_id : dc_tax_id,
                                            dc_tax_income_mth_id : dc_tax_income_mth_id
                                    },
                                    success: function ( result, request ) {
                                            var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
                                            if (jsonData.success) {
                                                // Load Sub
                                                Ext.storeSub.load();

                                                Ext.getCmp("win-sub").hide();
                                                Ext.getCmp("win-sub").destroy();
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
                        text : "Cancel",
                        handler : function() {
                                Ext.getCmp("win-sub").hide();
                                Ext.getCmp("win-sub").destroy();
                        }				
                    }]
                }).show();
        return winS;
    }          
    //================ DcSectionTaxSub ================
    formAdd.superclass.constructor.call(this, {
        listeners:{
            afterrender: function( obj, eOpts ){ /*console.log('Load Finish'); */}
        },
        id:'frm-Add', 
        url:'api/mnDcSectionTax.php', 
        frame : true,
        bodyStyle : "padding:0px", 
        autoScroll: true,
        loadMask: true,
        width   : 700,  
        labelWidth: 180,
        bodyStyle : "padding:5px",
        defaults:{ flex:1, anchor: '100%'},   
        title:'ข้อมูลหมวดภาษีอากร',  
        items:[{
                id : "frm-mode",
                xtype : "hidden",
                name : "mode",
                value:'ADD',
                readOnly: true				
            },{ 
                xtype : "hidden",
                id:'frm-id',
                name : "id"		
            }, {
                xtype: 'textfield',
                fieldLabel: 'ลำดับรายการ',
                name : 'c_code',
                anchor: '90%'
            }, {
                fieldLabel: 'ลำดับรายการส่งธนาคาร',
                xtype: 'textfield',
                name: 'i_rank_bank',
                anchor: '90%',
                validator: function(val) {
                    if (!Ext.isEmpty(val) && isNumber(val)){
                        return true;
                    } else {
                        return "กรุณากรอก ลำดับรายการส่งธนาคาร เป็นตัวเลข";
                    }
                }
            }, {
                xtype: 'textfield',
                fieldLabel: 'ชื่อมาตรา',
                name : 'c_name',
                anchor: '90%',
                allowBlank: false
            }, {
                fieldLabel: 'การคำนวณภาษี',
                xtype: 'radiogroup',
                id : 'i_type_tax',
                columns: [ 150 , 100 ],
                items: [
                        { boxLabel: '<span style=\"color:red;\">มาตรา 40(1)และ(2)</span>', name:'i_type_tax', checked: true, inputValue: Ext.TAX_SECTION_TYPE_40 },
                        { boxLabel: '<span style=\"color:blue;\">มาตราอื่น</span>', name:'i_type_tax', inputValue: Ext.TAX_SECTION_TYPE_OTHER }
                ]
            },{
                xtype: 'textarea',
                fieldLabel: 'หมายเหตุ',
                name : 'c_comment',
                anchor: '90%'
            }, { 
                fieldLabel: 'สถานะการใช้งาน',
                xtype: 'radiogroup',
                columns: [120,100],
                items: [
                        { boxLabel: 'ใช้งาน', checked: true, name: 'i_enable', inputValue: Ext.CONF_STATUS_ENABLE },
                        { boxLabel: 'ไม่ใช้งาน', name: 'i_enable', inputValue: Ext.CONF_STATUS_DISABLE }
                ] 		        	
            },
            gridMethod,
            gridSub],  
            buttonAlign: 'left',
            buttons:[{
                        text : 'บันทึกรายการ',
                        id:'buSaveID',
                        iconCls:'icon-save', 
                        listeners:{
                            afterrender:function(){}
                        },
                        handler : function() { 
                            var form = Ext.getCmp('frm-Add').getForm(); 
                            if(form.isValid()){  
                                form.submit({
                                    waitMsg:'Saving Data...',
                                    success : function(form, action) {
                                        var hdr_id = action.result.hdr_id;
                                        // Load Method
                                        Ext.storeMethod.setBaseParam("dc_section_tax_id", hdr_id);
                                        Ext.storeMethod.load();
                                        Ext.getCmp('grid_method').show();
                                        
                                        // Load Sub
                                        Ext.storeSub.setBaseParam("dc_section_tax_id", hdr_id);
                                        Ext.storeSub.load();
                                        Ext.getCmp('grid_sub').show();
                                        
                                        Ext.store.reload();
//                                            Ext.Msg.alert('Success',  action.result.msg,function(){    
//                                                Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-Add'), true) || {}; //null obj not errer		  
//                                                Ext.store.reload(); 
//                                            }); 
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
Ext.extend(formAdd, Ext.FormPanel, {}); 

searchGrid = function() {

    var cmbFilters = {
                    xtype: 'combo', 
                    id:'filter-ID',
                    store: new Ext.data.SimpleStore({
                        fields: ["id", "c_name"],  
                        data:[['c_name', "ชื่อ"],['c_code', "รหัส"]]
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
            /*console.log('Loading...');*/
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
                    items: [{
                                xtype: 'textfield',
                                id:'val-ID',
                                name : 'value'
                            },cmbFilters
                    ]
                }
        ],  
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
    url : 'api/ListDcSectionTax.php',
    root: 'data',
    baseParams: { i_read:user_right_read, type:'main' }, //Permission i_read
    idProperty: 'id',
        totalProperty: 'totalCount',
        fields: [
                {name:'no' },
                {name:'id' },
                {name:'c_code'},
                {name:'c_name'},
                {name:'c_comment'},
                {name:'i_rank_bank'},
                {name:'i_type_tax'},
                {name:'i_enable'},
                {name:'dc_user_create_id'},
                {name:'dc_user_create_cost_id'},
                {name:'d_create'},
                {name:'dc_user_update_id'},
                {name:'dc_user_update_cost_id'},
                {name:'d_update'}
        ]
});

Ext.storeMethod = new Ext.data.JsonStore({
    //autoDestroy: true,
    //autoLoad: true,
    url: 'api/ListDcSectionTax.php',
    baseParams: {type:'method'},
    root: 'data',
    idProperty: 'id',
    fields: [
            { name : "no" },
            { name : "id" },
            { name : "dc_section_tax_id" },
            { name : "c_code" },
            { name : "c_name" }
        ]
});

Ext.storeSub = new Ext.data.JsonStore({
    //autoDestroy: true,
    //autoLoad: true,
    url: 'api/ListDcSectionTax.php',
    baseParams: {type:'sub'},
    root: 'data',
    idProperty: 'id',
    fields: [
            { name : "no" },
            { name : "id" },
            { name : "c_name" },
            { name : "dc_tax_customer_id" },
            { name : "dc_tax_id" },
            { name : "c_tax_name" },
            { name : "dc_tax_income_mth_id" },
            { name : "c_tax_income_name" },
            { name : "dc_tax_income_parent_id" },
            { name : "c_tax_income_parent_name" }
        ]
});

Ext.storeDcTax = new Ext.data.JsonStore({
    autoLoad: true,
    url : 'api/ListDcSectionTax.php',
    root: 'data',
    fields: [
        { name: 'id' },
        { name: 'c_name'}
    ],
    baseParams: {type: "dcTax"}
});

Ext.storeDcTaxIncome = new Ext.data.JsonStore({
    autoLoad: true,
    url : 'api/ListDcSectionTax.php',
    root: 'data',
    fields: [
        { name: 'id' },
        { name: 'c_name'}
    ],
    baseParams: {type: "dcTaxIncome"}
});

//OnLoad
Ext.onReady(function(){
Ext.QuickTips.init();
    var gridMain = {
        region: 'center',
        title: 'แสดงข้อมูลหมวดภาษีอากร',
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
        { header: "ลำดับรายการ", sortable: true, dataIndex: 'c_code' ,
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                metaData.attr = "align='center'";
                return value;
            }
        },
        { header: "ลำดับรายการส่งธนาคาร", width:210, sortable: true, dataIndex: 'i_rank_bank' }, 
        { id: 'c_name', header: "ชื่อมาตรา", width:210, sortable: true, dataIndex: 'c_name' }, 
        { header: "การคำนวณภาษี", width:210, sortable: true, dataIndex: 'i_type_tax',
            renderer: function(value, metaData, record, row, col, store, gridView){
                if (parseInt(record.get('i_type_tax')) === parseInt(Ext.TAX_SECTION_TYPE_40))
                {
                    metaData.attr = "style='color:red'; ";
                    value = 'มาตรา40(1)และ(2)';
                } else {
                    metaData.attr = "style='color:blue'; ";
                    value = 'มาตราอื่น';
                }
                return value;
            } 
        },{
            header: "Status",  
            sortable:false,
            align: 'center',
            renderer: function(value, metaData, record, row, col, store, gridView){
                var i_enable = record.get('i_enable'); 
                if(parseInt(i_enable) === parseInt(Ext.CONF_STATUS_ENABLE)){
                    return '<img src="../images/icons/yes.gif");/>';
                }else{
                    return '<img src="../images/icons/no.gif");/>'; 
                }
            } 
        }],
//		autoExpandColumn: 'c_name',
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
