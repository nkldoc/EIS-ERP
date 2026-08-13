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

        Ext.getCmp('frm-mode').setValue('EDIT');
        var i_standard = record.data['i_standard'];			//get 
        Ext.getDom('i_standard'+i_standard).checked = true; //set display
        Ext.getCmp('i_standard'+i_standard).setValue(true); //set value

        switch (i_standard)
        {
                case  1 :  Ext.getCmp('inp_std11').setDisabled(false);  Ext.getCmp('inp_std11').setValue(record.data['f_amount']); break; 
                case  2 :  Ext.getCmp('inp_std21').setDisabled(false);  Ext.getCmp('inp_std21').setValue(record.data['f_amount']); break;  
                case  3 :  Ext.getCmp('inp_std31').setDisabled(false);  Ext.getCmp('inp_std32').setDisabled(false); 
                        Ext.getCmp('inp_std31').setValue(record.data['f_amount']); 
                        Ext.getCmp('inp_std32').setValue(record.data['f_amount2']); 
                break; 
                case  4 :  Ext.getCmp('inp_std41').setDisabled(false);  Ext.getCmp('inp_std42').setDisabled(false);  
                        Ext.getCmp('inp_std41').setValue(record.data['f_amount']); 
                        Ext.getCmp('inp_std42').setValue(record.data['f_amount2']); 
                break; 
                case  5 :  Ext.getCmp('inp_std51').setDisabled(false);  Ext.getCmp('inp_std52').setDisabled(false);  
                        Ext.getCmp('inp_std51').setValue(record.data['f_amount']); 
                        Ext.getCmp('inp_std52').setValue(record.data['f_amount2']); 
                break; 
                case  6 :  Ext.getCmp('inp_std61').setDisabled(false);  Ext.getCmp('inp_std62').setDisabled(false);  
                        Ext.getCmp('inp_std61').setValue(record.data['f_amount']); 
                        Ext.getCmp('inp_std62').setValue(record.data['f_amount2']); 
                break; 
                case  7 :  Ext.getCmp('inp_std71').setDisabled(false); Ext.getCmp('inp_std71').setValue(record.data['f_amount']); break; 

        } 

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
                                url : 'api/mnDcPrReduces.php' , 
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

function setRadioBigGroup(v){	
    for(i=1;i<8;i++){ 
        if(i!=v){ 
            Ext.getDom('i_standard'+i).checked = false; 
            Ext.getCmp('i_standard'+i).setValue(false); //set value
        }

    }
    
    Ext.getCmp('i_standard_id').setValue(v); //primary set

    Ext.getCmp('inp_std11').setDisabled(true); //inp field
    Ext.getCmp('inp_std21').setDisabled(true);  
    Ext.getCmp('inp_std31').setDisabled(true); 
    Ext.getCmp('inp_std32').setDisabled(true); 
    Ext.getCmp('inp_std41').setDisabled(true); 
    Ext.getCmp('inp_std42').setDisabled(true); 
    Ext.getCmp('inp_std51').setDisabled(true); 
    Ext.getCmp('inp_std52').setDisabled(true);  
    Ext.getCmp('inp_std61').setDisabled(true); 
    Ext.getCmp('inp_std62').setDisabled(true);   
    Ext.getCmp('inp_std71').setDisabled(true); 

    var i_standard = 	Ext.getCmp('i_standard_id').getValue(); //get

    switch (i_standard)
    {
        case '1':  Ext.getCmp('inp_std11').setDisabled(false);  break; 
        case '2':  Ext.getCmp('inp_std21').setDisabled(false);  break;  
        case '3':  Ext.getCmp('inp_std31').setDisabled(false);  Ext.getCmp('inp_std32').setDisabled(false); break; 
        case '4':  Ext.getCmp('inp_std41').setDisabled(false);  Ext.getCmp('inp_std42').setDisabled(false); break; 
        case '5':  Ext.getCmp('inp_std51').setDisabled(false);  Ext.getCmp('inp_std52').setDisabled(false); break; 
        case '6':  Ext.getCmp('inp_std61').setDisabled(false);  Ext.getCmp('inp_std62').setDisabled(false); break; 
        case '7':  Ext.getCmp('inp_std71').setDisabled(false);  break; 
    }
}; 
	
//Class Extend
formAdd	 = function() {
        formAdd.superclass.constructor.call(this, {
            listeners:{
                afterrender: function( obj, eOpts ){ }
            },
            id:'frm-Add', 
            url:'api/mnDcPrReduces.php', 
            frame : true,
            bodyStyle : "padding:0px", 
            autoScroll: true,
            loadMask: true,
            width   : 700,  
            labelWidth: 180,
            bodyStyle : "padding:5px",
            defaults:{ flex:1, anchor: '90%'},   
            title:'รายการและอัตราค่าลดหย่อนภาษีเงินได้',  
            items:[{
                    id : "frm-mode",
                    xtype : "hidden",
                    name : "mode",
                    value:'ADD',
                    readOnly: true				
                }, {				
                    xtype : "hidden",
                    name: "id",
                    readOnly: true
                }, {				
                    xtype : "hidden",
                    id: "i_standard_id",
                    name: "i_standard",
                    readOnly: true
                } , {
                    fieldLabel: 'ชื่อรายการค่าลดหย่อน',
                    xtype: 'textfield',
                    name: 'c_name',
                    validator: function(val) {
                        if (!Ext.isEmpty(val)) {
                            return true;
                        } else {
                            return "กรุณากรอก ชื่อรายการค่าลดหย่อน ";
                        }
                    }
                } , {
                    fieldLabel: 'หมายเหตุ',
                    xtype: 'textfield',
                    name: 'c_comment', 
                } ,{ 
                    title: 'เกณฑ์', 
                    labelAlign: 'left',
                    labelStyle: 'font-weight:bold;',
                    labelWidth: 125,
                    width: 900,
                    items: [{
                        layout: 'column',
                        items: [{ // column #1 
                            layout: 'form', 
                            items: [{  
                                        xtype: 'radiogroup',
                                        columns: [100,100,200], 
                                        items: [{ id: 'i_standard1',boxLabel: '1. หักได้ ', checked: false, name: 'i_standard', inputValue: '1' },
                                                { xtype:'textfield',width:50, disabled:true, name: 'inp_std11',id: 'inp_std11',
                                                        validator: function(val) {
                                                        if (!Ext.isEmpty(val) && isNumber(val)){
                                                                return true;
                                                        } else {
                                                                return "กรุณากรอก จำนวนเงิน เป็นตัวเลข";
                                                        }
                                                }, },
                                                { xtype: 'displayfield', value: '&nbsp;&nbsp;', width: 50 }
                                                ], listeners: {
                                                change: function (cb, nv) {
                                                    if (nv){
                                                        Ext.getDom('i_standard'+nv.inputValue).checked = true; 
                                                        Ext.getCmp('i_standard'+nv.inputValue).setValue(true); //set value
                                                        setRadioBigGroup(nv.inputValue);
                                                    }
                                                }
                                            }
                                    },{  
                                        xtype: 'radiogroup',
                                        columns: [150,100,100,100,100],
                                        items: [{ id: 'i_standard2',boxLabel: '2. ตามที่จ่ายจริง แต่ไม่เกิน ', width:150, name: 'i_standard', inputValue: '2' },
                                                { xtype:'textfield',width:50, disabled:true, name: 'inp_std21',  id: 'inp_std21',
                                                    validator: function(val) {
                                                        if (!Ext.isEmpty(val) && isNumber(val)){
                                                                return true;
                                                        } else {
                                                                return "กรุณากรอก จำนวนเงิน เป็นตัวเลข";
                                                        }
                                                    }
                                                },
                                                { xtype: 'displayfield', value: '&nbsp;บาท', width: 50 }, 
                                                ], listeners: {
                                                change: function (cb, nv) {
                                                    if (nv){
                                                        Ext.getDom('i_standard'+nv.inputValue).checked = true; 
                                                        Ext.getCmp('i_standard'+nv.inputValue).setValue(true); //set value
                                                        setRadioBigGroup(nv.inputValue);
                                                    }
                                                }
                                            }             
                                    },{  
                                        xtype: 'radiogroup',
                                        columns: [150,100,150,100,100],
                                        items: [{ id: 'i_standard3',boxLabel: '3. ตามที่จ่ายจริง แต่ไม่เกิน ', width:150, name: 'i_standard', inputValue: '3' },
                                                { xtype:'textfield',width:50, disabled:true, name: 'inp_std31', id: 'inp_std31',
                                                    validator: function(val) {
                                                        if (!Ext.isEmpty(val) && isNumber(val)){
                                                            return true;
                                                        } else {
                                                            return "กรุณากรอก จำนวนเงิน เป็นตัวเลข";
                                                        }
                                                    }
                                                },
                                                { xtype: 'displayfield', value: '&nbsp;% ของเงินได้ และไม่เกิน ', width: 150 },
                                                { xtype:'textfield',width:50, disabled:true, name: 'inp_std32',id: 'inp_std32',
                                                    validator: function(val) {
                                                        if (!Ext.isEmpty(val) && isNumber(val)){
                                                                return true;
                                                        } else {
                                                                return "กรุณากรอก จำนวนเงิน เป็นตัวเลข";
                                                        }
                                                },
                                            },
                                            { xtype: 'displayfield', value: '&nbsp;&nbsp; บาท', width: 50 },
                                            ], 
                                            listeners: {
                                                change: function (cb, nv) {
                                                    if (nv){ 
                                                        Ext.getDom('i_standard'+nv.inputValue).checked = true; 
                                                                        Ext.getCmp('i_standard'+nv.inputValue).setValue(true); //set value
                                                                        setRadioBigGroup(nv.inputValue);
                                                    }
                                                }
                                            }             
                                    },{  
                                        xtype: 'radiogroup',
                                        columns: [150,100,150,100,150],
                                        items: [{ id: 'i_standard4', boxLabel: '4. ตามที่จ่ายจริง แต่ไม่เกิน ', width:150, name: 'i_standard', inputValue: '4' },
                                                { xtype:'textfield',width:50, disabled:true, name: 'inp_std41',id: 'inp_std41',
                                                    validator: function(val) {
                                                        if (!Ext.isEmpty(val) && isNumber(val)){
                                                                return true;
                                                        } else {
                                                                return "กรุณากรอก จำนวนเงิน เป็นตัวเลข";
                                                        }
                                                    }
                                                },
                                                { xtype: 'displayfield', value: '&nbsp;บาท และ ส่วนที่เกินแต่ไม่เกิน', width: 150 },
                                                { xtype:'textfield',width:100, disabled:true, name: 'inp_std42', id: 'inp_std42',
                                                    validator: function(val) {
                                                        if (!Ext.isEmpty(val) && isNumber(val)){
                                                                return true;
                                                        } else {
                                                                return "กรุณากรอก จำนวนเงิน เป็นตัวเลข";
                                                        }
                                                    }
                                                },
                                                { xtype: 'displayfield', value: '&nbsp;&nbsp; บาท', width: 150 }
                                                ], listeners: {
                                                change: function (cb, nv) {
                                                    if (nv){
                                                        Ext.getDom('i_standard'+nv.inputValue).checked = true; 
                                                        Ext.getCmp('i_standard'+nv.inputValue).setValue(true); //set value
                                                        setRadioBigGroup(nv.inputValue); 
                                                    }
                                                }
                                            }             
                                    },{  
                                        xtype: 'radiogroup',
                                        columns: [150,100,150,100,150],
                                        items: [{ id: 'i_standard5',boxLabel: '5. ตามที่จ่ายจริง แต่ไม่เกิน ', width:150,  name: 'i_standard', inputValue: '5' },
                                                { xtype:'textfield',width:100, disabled:true, name: 'inp_std51', id: 'inp_std51',
                                                    validator: function(val) {
                                                        if (!Ext.isEmpty(val) && isNumber(val)){
                                                            return true;
                                                        } else {
                                                            return "กรุณากรอก จำนวนเงิน เป็นตัวเลข";
                                                        }
                                                    }
                                                },
                                                { xtype: 'displayfield', value: '&nbsp;% ของเงินได้ และไม่เกิน', width: 150 },
                                                { xtype:'textfield',width:100, disabled:true, name: 'inp_std52', id: 'inp_std52',
                                                    validator: function(val) {
                                                        if (!Ext.isEmpty(val) && isNumber(val)){
                                                            return true;
                                                        } else {
                                                            return "กรุณากรอก จำนวนเงิน เป็นตัวเลข";
                                                        }
                                                    }
                                                },
                                                { xtype: 'displayfield', value: '&nbsp; บาทเมื่อรวมกับข้อ(4) ', width: 150 }
                                                ], listeners: {
                                                change: function (cb, nv) {
                                                    if (nv){
                                                        Ext.getDom('i_standard'+nv.inputValue).checked = true; 
                                                        Ext.getCmp('i_standard'+nv.inputValue).setValue(true); //set value
                                                        setRadioBigGroup(nv.inputValue); 
                                                    }
                                                }
                                            }             
                                    },{  
                                        xtype: 'radiogroup',
                                        columns: [50,100,200,100,200],
                                        items: [{ id: 'i_standard6',boxLabel: '6. ', width:50, name: 'i_standard', inputValue: '6' },
                                                { xtype:'textfield',width:100, disabled:true, name: 'inp_std61', id: 'inp_std61',
                                                    validator: function(val) {
                                                        if (!Ext.isEmpty(val) && isNumber(val)){
                                                            return true;
                                                        } else {
                                                            return "กรุณากรอก จำนวนเงิน เป็นตัวเลข";
                                                        }
                                                    }
                                                },
                                                { xtype: 'displayfield', value: '&nbsp;&nbsp; เท่าของเงินที่จ่ายจริง แต่ไม่เกิน', width: 200 },
                                                { xtype:'textfield',width:100, disabled:true, name: 'inp_std62', id: 'inp_std62',
                                                    validator: function(val) {
                                                        if (!Ext.isEmpty(val) && isNumber(val)){
                                                            return true;
                                                        } else {
                                                            return "กรุณากรอก จำนวนเงิน เป็นตัวเลข";
                                                        }
                                                    }
                                                },
                                                { xtype: 'displayfield', value: '&nbsp;&nbsp; % ของเงินได้หลังหักค่าลดหย่อน ', width: 200 }
                                                ], listeners: {
                                                change: function (cb, nv) {
                                                    if (nv){
                                                        Ext.getDom('i_standard'+nv.inputValue).checked = true; 
                                                        Ext.getCmp('i_standard'+nv.inputValue).setValue(true); //set value
                                                        setRadioBigGroup(nv.inputValue); 
                                                    }
                                                }
                                            }             
                                    },{  
                                        xtype: 'radiogroup',
                                        columns: [150,100,220],
                                        items: [{ id: 'i_standard7',boxLabel: '7. ตามที่จ่ายจริง แต่ไม่เกิน ', width:200, name: 'i_standard', inputValue: '7' },
                                                { xtype:'textfield',width:50, disabled:true, name: 'inp_std71',id: 'inp_std71',
                                                    validator: function(val) {
                                                        if (!Ext.isEmpty(val) && isNumber(val)){
                                                                return true;
                                                        } else {
                                                                return "กรุณากรอก จำนวนเงิน เป็นตัวเลข";
                                                        }
                                                    }
                                                },
                                                { xtype: 'displayfield', value: '&nbsp;&nbsp; % ของเงินได้ก่อนหักเงินบริจาค ', width: 220 }
                                                ], listeners: {
                                                change: function (cb, nv) {
                                                    if (nv){ 
                                                        Ext.getDom('i_standard'+nv.inputValue).checked = true; 
                                                                        Ext.getCmp('i_standard'+nv.inputValue).setValue(true); //set value
                                                                        setRadioBigGroup(nv.inputValue); 
                                                    }
                                                }
                                            }             
                                    },{  
                                        xtype: 'radiogroup',
                                        fieldLabel: 'การคำนวณ ',
                                        columns: [80,80],
                                        items: [{ boxLabel: 'จำนวนหน่วย  ', width:200,checked: true, name: 'i_reduce_type', inputValue: '1' },
                                                { boxLabel: 'จำนวนเงิน ', width:200, name: 'i_reduce_type', inputValue: '2' },
                                                ]             
                                    },{  
                                        xtype: 'radiogroup',
                                        fieldLabel: 'เป็นค่าลดหย่อนส่วนตัว ',
                                        columns: [80,80],
                                        items: [{ boxLabel: 'ไม่ใช่  ', width:200,checked: true, name: 'i_is_private', inputValue: '2' },
                                                { boxLabel: 'ใช่   ', width:200,  name: 'i_is_private', inputValue: '1' },
                                                ]             
                                    } ,{  
                                        xtype: 'radiogroup',
                                        fieldLabel: 'สถานะการใช้งาน ',
                                        columns: [80,80],
                                        items: [{ boxLabel: 'ใช้งาน ', width:200,checked: true, name: 'i_enable', inputValue: '1' },
                                                { boxLabel: 'ไม่ใช้งาน  ', width:200, name: 'i_enable', inputValue: '2' }
                                                        ]             
                                    }]
                                }]
                            }] 
                } ],  
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
                                var form = Ext.getCmp('frm-Add').getForm(); 
                                if(form.isValid()){  
                                    form.submit({
                                        waitMsg:'Saving Data...',
                                        success : function(form, action) {
                                            Ext.Msg.alert('Success',  action.result.msg,function(){    
                                                Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-Add'), true) || {}; //null obj not errer		  
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
        },
        listeners:{
            afterrender: function( obj, eOpts ){ },
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
    url : 'api/ListDcPrReduces.php',
    root: 'data',
    baseParams: { i_read:user_right_read }, //Permission i_read
    idProperty: 'id',
        totalProperty: 'totalCount',
        fields: [
                {name:'no'},
                {name:'id'},
                {name:'c_code'},
                {name:'c_name'},
                {name:'c_comment'},
                {name:'f_amount'},
                {name:'f_amount2'},
                {name:'i_reduce_type'},
                {name:'i_is_private'},
                {name:'i_standard'},
                {name:'i_enable'},
                {name:'dc_user_create_id'},
                {name:'dc_user_create_cost_id'},
                {name:'d_create'},
                {name:'dc_user_update_id'},
                {name:'dc_user_update_cost_id'},
                {name:'d_update'}
        ]
});

//OnLoad
Ext.onReady(function(){
Ext.QuickTips.init();
    var gridMain = {
        region: 'center',
        title: 'แสดงข้อมูลรายการและอัตราค่าลดหย่อนภาษีเงินได้',
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
                metaData.attr = "align='center' style='color:blue'";
                return value;
            }
        },
        { id: 'c_name', header: "ชื่อรายการ", width:300, sortable: true, dataIndex: 'c_name' }, 
        { header: "หักลดหย่อนได้", sortable: true, dataIndex: 'f_amount' ,
            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                metaData.attr = "align='right' style='color:blue'";
                return Ext.floatRenderer(value);
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
                    items: [gridMain]
            })]
    });
    Ext.getCmp('contenterCenter').setActiveTab('tabpanel1');  
    Ext.getCmp('tabpanel1').on('cellclick', cellClick, this); 
    InfoMainGrid('tabpanel1',true,true,true,true,true,true);
});
