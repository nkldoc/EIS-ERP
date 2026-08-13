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
        Ext.storeDtl.setBaseParam("hdr_id", record.data.id);
        Ext.storeDtl.load();
        Ext.getCmp('grid_detail').show();
        
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
                                url : 'api/mnTaxPrRate.php' , 
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
    var gridDtl = new Ext.grid.GridPanel({
                        region: 'center',
                        id: 'grid_detail',
                        layout:'fit',
                        title:'อัตราภาษีเงินได้บุคคลธรรมดา รายละเอียดอัตราภาษี',
                        height: 280,
                        autohieght: true,
                        border: true,
                        stripeRows: true,
                        hidden:true,
                        loadMask: true,
                        store: Ext.storeDtl,
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
                                frmDetail();
                            }
                        }],
                        columns: [
                            new Ext.grid.RowNumberer({
                                header:' No ',
                                width:50,
                                renderer:function(value, metaData, record, row, col, store, gridView){
                                        return record.get('no');
                                }
                            }),{
                                header: "เงินได้สุทธิต่ำสุด",
                                sortable: false,
                                dataIndex:'f_income_min' ,
                                renderer: function(value, metaData, record, row, col, store, gridView) {
                                    metaData.attr = "align='right'";
                                    return Ext.floatRenderer(value);
                                }
                            },{
                                header: "เงินได้สุทธิสูงสุด",
                                sortable: false,
                                dataIndex:'f_income_max' ,
                                renderer: function(value, metaData, record, row, col, store, gridView) {
                                    metaData.attr = "align='right'";
                                    return Ext.floatRenderer(value);
                                }
                            },{
                                header: "จำนวนเงินได้สูงสุดในแต่ละขั้น",
                                sortable: false,
                                dataIndex:'f_amt_max' ,
                                renderer: function(value, metaData, record, row, col, store, gridView) {
                                    metaData.attr = "align='right'";
                                    return Ext.floatRenderer(value);
                                }
                            },{
                                header: "อัตรา(%)",
                                sortable: false,
                                dataIndex:'i_percent' ,
                                renderer: function(value, metaData, record, row, col, store, gridView) {
                                    metaData.attr = "align='center'";
                                    return value;
                                }
                            },{
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
                                    frmDetail();
                                    Ext.getCmp('frm-dtl').getForm().loadRecord(record);
                                    Ext.getCmp('frm-dtl-mode').setValue('EDIT_DTL');
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
                                                                    url : 'api/mnTaxPrRate.php' ,
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
                                                                        Ext.getCmp("win-msg-delete2").hide();						// hidden window-panel
                                                                        Ext.getCmp("win-msg-delete2").destroy();						// clear memory :: garbage collection

                                                                        // Load Method
                                                                        Ext.storeDtl.load();
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
                
    function frmDetail(){
        var winD = new Ext.Window({
                    id : "win-dtl",
                    title : "รายละเอียดประเภทเงินได้",
                    modal: true,
                    border: false,
                    width : 500,
                    items: [{
                        xtype: 'form',
                        id:'frm-dtl',
                        layout: 'hbox',
                        align: 'stretch',
                        defaults: { xtype: 'fieldset', flex:1, autoHeight: true },
                        items: [{ 
                            defaults: { allowBlank: true, anchor: '100%' },
                            items: [{
                                id: "frm-dtl-mode",
                                xtype: "hidden",
                                name: "mode",
                                value : "ADD_DTL",
                                readOnly: true
                            }, {
                                xtype: "hidden",
                                id : "frm-dtl-tax_pr_rate_hdr_id",
                                name:'tax_pr_rate_hdr_id',
                                value:Ext.getCmp('frm-id').getValue(),
                                readOnly: true
                            }, {
                                xtype: "hidden",
                                id: "frm-dtl-id",
                                name:'id',
                                readOnly: true
                            }, {
                                xtype: 'textfield',
                                fieldLabel: 'เงินได้สุทธิต่ำสุด',
                                id : "frm-dtl-f_income_min",
                                name:'f_income_min',
                                validator: function(val) {
                                    if (!Ext.isEmpty(val) && !isNumber(val)){
                                        return "กรุณากรอก จำนวนเงิน เป็นตัวเลขไม่ต้องใส่ ','";
                                    } else {
                                        return true;
                                    }
                                }
                            },{
                                xtype: 'textfield',
                                fieldLabel: 'เงินได้สุทธิสูงสุด',
                                id : "frm-dtl-f_income_max",
                                name:'f_income_max',
                                validator: function(val) {
                                    if (!Ext.isEmpty(val) && !isNumber(val)){
                                        return "กรุณากรอก จำนวนเงิน เป็นตัวเลขไม่ต้องใส่ ','";
                                    } else {
                                        return true;
                                    }
                                }
                            },{
                                xtype: 'textfield',
                                fieldLabel: 'จำนวนเงินแต่ละขั้น',
                                id : "frm-dtl-f_amt_max",
                                name:'f_amt_max',
                                validator: function(val) {
                                    if (!Ext.isEmpty(val) && !isNumber(val)){
                                        return "กรุณากรอก จำนวนเงิน เป็นตัวเลขไม่ต้องใส่ ','";
                                    } else {
                                        return true;
                                    }
                                }
                            },{
                                xtype: 'textfield',
                                fieldLabel: 'อัตรา %',
                                id : "frm-dtl-i_percent",
                                name:'i_percent',
                                validator: function(val) {
                                    if (!Ext.isEmpty(val) && !isNumber(val)){
                                        return "กรุณากรอก จำนวนเงิน เป็นตัวเลขไม่ต้องใส่ ','";
                                    } else {
                                        return true;
                                    }
                                }
                            },{
                                xtype: 'textfield',
                                fieldLabel: 'จำนวนภาษีแต่ละขั้น',
                                id : "frm-dtl-f_amt_pile",
                                name:'f_amt_pile',
                                validator: function(val) {
                                    if (!Ext.isEmpty(val) && !isNumber(val)){
                                        return "กรุณากรอก จำนวนเงิน เป็นตัวเลขไม่ต้องใส่ ','";
                                    } else {
                                        return true;
                                    }
                                }
                            },{
                                xtype: 'textfield',
                                fieldLabel: 'ภาษีสะสม',
                                id : "frm-dtl-f_pile",
                                name:'f_pile',
                                validator: function(val) {
                                    if (!Ext.isEmpty(val) && !isNumber(val)){
                                        return "กรุณากรอก จำนวนเงิน เป็นตัวเลขไม่ต้องใส่ ','";
                                    } else {
                                        return true;
                                    }
                                }
                            }, {
                                xtype: 'textarea',
                                fieldLabel: "หมายเหตุ",
                                id : "frm-dtl-c_comment",
                                name : 'c_comment'
                            }]
                        }]
                    }],
                    buttonAlign: 'left',
                    buttons : [{
                        text : "&nbsp;บันทึกรายการ&nbsp;",
                        iconCls	: 'icon-save',
                        handler: function(){
                            var mode = Ext.getCmp("frm-dtl-mode").getValue();
                            var rate_tax_hdr_id = Ext.getCmp("frm-dtl-tax_pr_rate_hdr_id").getValue();
                            var id = Ext.getCmp("frm-dtl-id").getValue();
                            var f_income_min = Ext.getCmp("frm-dtl-f_income_min").getValue();
                            var f_income_max = Ext.getCmp("frm-dtl-f_income_max").getValue();
                            var f_amt_max = Ext.getCmp("frm-dtl-f_amt_max").getValue();
                            var i_percent = Ext.getCmp("frm-dtl-i_percent").getValue();
                            var f_amt_pile = Ext.getCmp("frm-dtl-f_amt_pile").getValue();
                            var f_pile = Ext.getCmp("frm-dtl-f_pile").getValue();
                            var c_comment = Ext.getCmp("frm-dtl-c_comment").getValue();

                            Ext.Ajax.request({
                                    url : 'api/mnTaxPrRate.php' ,
                                    method: 'POST',
                                    params : { 
                                            mode : mode, 
                                            tax_pr_rate_hdr_id : rate_tax_hdr_id,
                                            id : id,
                                            f_income_min : f_income_min,
                                            f_income_max : f_income_max,
                                            f_amt_max : f_amt_max,
                                            i_percent : i_percent,
                                            f_amt_pile : f_amt_pile,
                                            f_pile : f_pile,
                                            c_comment:c_comment
                                    },
                                    success: function ( result, request ) {
                                        var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
                                        if (jsonData.success) {
                                            Ext.storeDtl.load();
                                            Ext.getCmp("win-dtl").hide();
                                            Ext.getCmp("win-dtl").destroy();
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
                                Ext.getCmp("win-dtl").hide();
                                Ext.getCmp("win-dtl").destroy();
                        }				
                    }]
                }).show();
        return winD;
    }
    //================ DcTaxMethod ================
    
    formAdd.superclass.constructor.call(this, {
        listeners:{
            afterrender: function( obj, eOpts ){ /*console.log('Load Finish'); */}
        },
        id:'frm-Add', 
        url:'api/mnTaxPrRate.php', 
        frame : true,
        bodyStyle : "padding:0px", 
        autoScroll: true,
        loadMask: true,
        width   : 700,  
        labelWidth: 180,
        bodyStyle : "padding:5px",
        defaults:{ flex:1, allowBlank: true, anchor: '100%' },   
        title:'ข้อมูลอัตราภาษีเงินได้บุคคลธรรมดา',  
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
                fieldLabel: 'รหัส',
                name : 'c_code',
                anchor: '45%',
                readOnly: true
            }, {
                xtype: 'textfield',
                fieldLabel: 'ชื่อชุดรายการ',
                name : 'c_name',
                anchor: '45%',
                allowBlank: false
            }, {
                xtype: 'datefield',
                id: 'd_start',
                name: 'd_start',
                anchor: '30%',
                fieldLabel: 'วันที่เริ่มใช้',
//                listeners : {
//                    render : function(datefield) {
//                        var nDate = addY(543);
//                        datefield.setValue(nDate);
//                    }
//                }
            }, {
                xtype: 'datefield',
                id: 'd_finish',
                name: 'd_finish',
                anchor: '30%',
                fieldLabel: 'วันที่สิ้นสุด',
//                listeners : {
//                    render : function(datefield) {
//                        var nDate = addY(543);
//                        datefield.setValue(nDate);
//                    }
//                }
            }, {
                xtype: 'textarea',
                fieldLabel: "หมายเหตุ",
                name : 'c_comment',
                anchor: '45%'
            }, { 
                fieldLabel: 'สถานะการใช้งาน',
                xtype: 'radiogroup',
                columns: [120,100],
                items: [
                        { boxLabel: 'ใช้งาน', checked: true, name: 'i_enable', inputValue: Ext.CONF_STATUS_ENABLE },
                        { boxLabel: 'ไม่ใช้งาน', name: 'i_enable', inputValue: Ext.CONF_STATUS_DISABLE }
                ] 		        	
            },
            gridDtl],  
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
                                        Ext.storeDtl.setBaseParam("hdr_id", hdr_id);
                                        Ext.storeDtl.load();
                                        Ext.getCmp('grid_detail').show();
                                        
                                        Ext.store.reload();
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
                        data:[['c_name', "ชื่อรายการ"]]
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
    url : 'api/ListTaxPrRate.php',
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
            {name:'d_start'},
            {name:'str_start'},
            {name:'d_finish'},
            {name:'i_enable'},
            {name:'dc_user_create_id'},
            {name:'dc_user_create_cost_id'},
            {name:'d_create'},
            {name:'dc_user_update_id'},
            {name:'dc_user_update_cost_id'},
            {name:'d_update'}
    ]
});

Ext.storeDtl = new Ext.data.JsonStore({
    //autoDestroy: true,
    //autoLoad: true,
    url: 'api/ListTaxPrRate.php',
    baseParams: {type:'dtl'},
    root: 'data',
    idProperty: 'id',
    fields: [
            { name : "no" },
            { name : "id" },
            { name : "tax_pr_rate_hdr_id" },
            { name : "c_comment" },
            { name : "f_income_min" },
            { name : "f_income_max" },
            { name : "f_amt_max" },
            { name : "f_pile" },
            { name : "f_amt_pile" },
            { name : "i_percent" },
            { name : 'dc_user_create_id'},
            { name : 'dc_user_create_cost_id'},
            { name : 'd_create'},
            { name : 'dc_user_update_id'},
            { name : 'dc_user_update_cost_id'},
            { name : 'd_update'}
        ]
});

//OnLoad
Ext.onReady(function(){
Ext.QuickTips.init();
    var gridMain = {
        region: 'center',
        title: 'แสดงข้อมูลอัตราภาษีเงินได้บุคคลธรรมดา',
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
            }
        },
        { id: 'c_name', header: "ชื่อรายการ", width:210, sortable: true, dataIndex: 'c_name' }, 
        { header: "วันที่เริ่มใช้", sortable: true, dataIndex: 'str_start' ,
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                metaData.attr = "align='center'";
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
