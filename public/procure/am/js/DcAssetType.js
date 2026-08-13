function clearValue()
{
    Ext.getCmp('form_id').setValue(1);
    Ext.getCmp('form-detail1').show();
    Ext.getCmp('form-detail2').hide();

    Ext.getCmp("condition_mode").reset();
    Ext.getCmp('referance_id').setValue('');
    Ext.getCmp('Cost_referance').setValue('');
    Ext.getCmp('isLast').reset();
    Ext.getCmp('ref_level').reset();

    Ext.getCmp('move_id').reset();
    Ext.getCmp('Cost_move').reset();

    clearFormData();
}

function clearFormData()
{
    Ext.getCmp('frm_c_code').setValue('');
    Ext.getCmp('frm_c_name').setValue('');

    Ext.getCmp('frm_asset_type').setValue(Ext.ASSET_TYPE_EQUIP);
    Ext.getCmp('frm_asset_type').hide();

    Ext.getCmp('frm_dc_acc_dr_id').setValue('');
    Ext.getCmp('frm_dc_acc_dr_id_Name').setValue('');
    Ext.getCmp('pop_frm_dc_acc_dr_id').hide();

    Ext.getCmp('frm_dc_acc_cr_id').setValue('');
    Ext.getCmp('frm_dc_acc_cr_id_Name').setValue('');
    Ext.getCmp('pop_frm_dc_acc_cr_id').hide();

    Ext.getCmp('frm_dc_acc_recv_id').setValue('');
    Ext.getCmp('frm_dc_acc_recv_id_Name').setValue('');
    Ext.getCmp('pop_frm_dc_acc_recv_id').hide();

    Ext.getCmp('frm_dc_acc_conf_recv_id').setValue('');
    Ext.getCmp('frm_dc_acc_conf_recv_id_Name').setValue('');
    Ext.getCmp('pop_frm_dc_acc_conf_recv_id').hide();

    Ext.getCmp('frm_f_unit_cost').setValue('');
    Ext.getCmp('frm_dc_unit_type_id').setValue('');
    Ext.getCmp('frm_i_is_last').items.items[1].setValue(true);
    Ext.getCmp('frm_i_enable').items.items[0].setValue(true);

    Ext.getCmp('frm_f_unit_cost').hide();
    Ext.getCmp('frm_dc_unit_type_id').hide();
    Ext.getCmp('frm_i_is_last').hide();
    Ext.getCmp('frm_i_enable').hide();
}

Ext.onReady(function() {
    Ext.QuickTips.init();

/*===============================================*/
    var user_right_edit = true;
    var user_right_delete = true;
    var user_right_add = true;
    var user_view_only = false;
/*===============================================*/ 

/*============ Tree Cost ============*/
    var storeCost	= new Ext.tree.TreeLoader({
            dataUrl:'api/ListDcAssetType.php'
    });
    var rootNode = new Ext.tree.AsyncTreeNode();
    var treeCost = new Ext.tree.TreePanel({
        border: false,
        autoScroll: true,
        rootVisible: false,// show Root Node
        lines: false,
        singleExpand: true,
        useArrows: true,
        loader: storeCost,
        root: rootNode
    });

    treeCost.on('click', function(n){
        var sn = this.selModel.selNode || {}; // selNode is null on initial selection
        if(n.id != sn.id) {  // ignore clicks on folders and currently selected node
            clearValue();
            Ext.getCmp('isLast').setValue(n.leaf);
            Ext.getCmp('Cost_referance').setValue(n.text); // รายการอ้างอิง
            var ref_id = Ext.getCmp('referance_id');//.setValue(n.id); // รายการอ้างอิง
            ref_id.setValue(n.id);

            Ext.Ajax.request({
                url: 'api/ListDcAssetType.php',
                params:{
                    mode: 'getCode',
                    ref_id: n.id
                },
                method:'POST',
                success: function(result, request){
                    var res = new Object();
                    res = Ext.util.JSON.decode(result.responseText);
                    Ext.getCmp('referance_code').setValue(res.c_code);
                    Ext.getCmp('ref_level').setValue(res.i_level);
                }
            });
        }
    });

    var rootNodeMove = new Ext.tree.AsyncTreeNode();
    var treeMove = new Ext.tree.TreePanel({
        border: false,
        autoScroll: true,
        rootVisible: false,// show Root Node
        lines: false,
        singleExpand: true,
        useArrows: true,
        loader: storeCost,
        root: rootNodeMove
    });
	
    treeMove.on('click', function(n){
        var sn = this.selModel.selNode || {}; // selNode is null on initial selection
        if(n.id != sn.id) {  // ignore clicks on folders and currently selected node
            Ext.getCmp('Cost_move').setValue(n.text); // รายการปลายทาง
            var move_id = Ext.getCmp('move_id');//.setValue(n.id); // รายการปลายทาง
            move_id.setValue(n.id);

            Ext.Ajax.request({
                url: 'api/ListDcAssetType.php',
                params:{
                    mode: 'getCode',
                    ref_id: n.id
                },
                method:'POST',
                success: function(result, request){
                    var res = new Object();
                    res = Ext.util.JSON.decode(result.responseText);
                    Ext.getCmp('move_code').setValue(res.c_code);
                }
            });
        }
    });
	
//-----------------------------------
    var storeAccDr	= new Ext.data.JsonStore({ 
        autoLoad: true,
        storeId: 'myStoreAccDr',
        url: 'api/All_AmCombo.php',
        baseParams: {type : 'storeAcc', i_group:1},
        root: 'data',
        idProperty: 'id',
        totalProperty: 'totalCount',
        fields: [ 'no','id', 'c_code','c_name']
    });

    var popAccDr = new Ext.ux.Poplov({
        text        : 'ไม่ระบุ',  
        id          : 'frm_dc_acc_dr_id',	//go to relation	
        iconCls     : 'page_magnify', 
        valueHidden : 'dc_acc_dr_id', 	//go to hidden
        store       : storeAccDr,
        headerGrid  : [{ header: "ID System", sortable: true, hidden:true, dataIndex: 'id' }, 
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
        widthText   : 340, 
        fieldLabel  : 'รหัสบัญชี ค่าเสื่อมราคาสะสม', 
    });
	
    var storeAccCr	= new Ext.data.JsonStore({ 
        autoLoad: true,
        storeId: 'myStoreAccCr',
        url: 'api/All_AmCombo.php',
        baseParams: {type : 'storeAcc', i_group:5},
        root: 'data',
        idProperty: 'id',
        totalProperty: 'totalCount',
        fields: [ 'no','id', 'c_code','c_name']
    });
	
    var popAccCr = new Ext.ux.Poplov({
        text        : 'ไม่ระบุ',  
        id          : 'frm_dc_acc_cr_id',	//go to relation	
        iconCls     : 'page_magnify', 
        valueHidden : 'dc_acc_cr_id', 	//go to hidden
        store       : storeAccCr,
        headerGrid  : [{ header: "ID System", sortable: true, hidden:true, dataIndex: 'id' }, 
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
        widthText   : 340, 
        fieldLabel  : 'รหัสบัญชี ค่าเสื่อมราคา', 
    });
	
    var storeAccRev	= new Ext.data.JsonStore({ 
        autoLoad: true,
        storeId: 'myStoreAccConf',
        url: 'api/All_AmCombo.php',
        baseParams: {type : 'storeAcc', i_group:5},
        root: 'data',
        idProperty: 'id',
        totalProperty: 'totalCount',
        fields: [ 'no','id', 'c_code','c_name']
    });
	
    var popAccRev = new Ext.ux.Poplov({
        text        : 'ไม่ระบุ',  
        id          : 'frm_dc_acc_recv_id',	//go to relation	
        iconCls     : 'page_magnify', 
        valueHidden : 'dc_acc_recv_id', 	//go to hidden
        store       : storeAccRev,
        headerGrid  : [{ header: "ID System", sortable: true, hidden:true, dataIndex: 'id' }, 
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
        widthText   : 340, 
        fieldLabel  : 'รหัสบัญชี สินทรัพย์ระหว่างติดตั้ง'
    });
	
    var storeAccConf	= new Ext.data.JsonStore({ 
        autoLoad: true,
        storeId: 'myStoreAccConf',
        url: 'api/All_AmCombo.php',
        baseParams: {type : 'storeAcc', i_group:1},
        root: 'data',
        idProperty: 'id',
        totalProperty: 'totalCount',
        fields: [ 'no','id', 'c_code','c_name']
    });
	
    var popAccConf = new Ext.ux.Poplov({
        text		: 'ไม่ระบุ',  
        id		: 'frm_dc_acc_conf_recv_id',	//go to relation	
        iconCls		: 'page_magnify', 
        valueHidden     : 'dc_acc_conf_recv_id', 	//go to hidden
        store		: storeAccConf,
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
        fieldLabel	: 'รหัสบัญชี สินทรัพย์ตามรายการที่ซื้อ', 
    });

    var storeDcUnitType	= new Ext.data.JsonStore({
        autoDestroy: true,
        autoLoad: true,
        url: 'api/All_AmCombo.php',
        baseParams: {type : 'storeDcUnitType', start:0, limit:500},
        root: 'data',
        idProperty: 'id',
        fields: [ 'id',  'c_name']
    });
/*============ Form Manage ============*/
    var panelForm = {
        region: 'center',
        title: 'บันทึกข้อมูล',
        xtype: 'form',
        id: 'form-widgets',
        url:'api/mnDcAssetType.php',
        frame:true,
        bodyStyle:'padding:5px 5px 0',
        id:'tabpanel2',
        border: false,
        stripeRows: true,
        loadMask: true,
        items: [{
        id:'Cost_referance',
            xtype:'textfield',
            fieldLabel: 'ชื่อรายการอ้างอิง',
            readOnly: true,
            anchor:'95%'
        },{
            id: "referance_id",
            xtype : "hidden",
            name: "referance_id",
            readOnly: true
        },{
            id: "referance_code",
            xtype : "hidden",
            readOnly: true
        },{
            id: "ref_level",
            xtype : "hidden",
            name: "i_level",
            readOnly: true
        },{
            id: "isLast",
            xtype : "hidden",
            name: "isLast",
            readOnly: true
        }, {
            id:'form_id',
            xtype: "hidden",
            readOnly: true
        },{
            id          : "condition_mode",
            xtype       : 'combo',
            fieldLabel  : 'เงื่อนไข',
            mode        : 'local',
            store       : new Ext.data.SimpleStore({
                            fields: [ "value", "text" ],
                            data: [
                                [ 'AddChild', "เพิ่มรายการย่อย" ],
                                    [ 'AddBefore', "เพิ่มก่อนหน้ารายการที่เลือก" ],
                                    [ 'AddAfter', "เพิ่มต่อท้ายรายการที่เลือก" ],
                                    [ 'Edit', "แก้ไขรายการที่เลือก" ],
                                    [ 'Del', "ลบรายการที่เลือก" ],
                                    [ 'Move', "ย้ายรายการที่เลือก" ],
                                ]
                            }),
				valueField: "value",
				displayField: "text",
				allowBlank : false,
				editable : false,
				triggerAction: "all",
				typeAhead : false,
				emptyText : "เลือกเงื่อนไข",
				listeners: {
                                    'select': function(t){ 
                                        Ext.getCmp('form_id').setValue(1);
                                        Ext.getCmp('move_id').reset();
                                        Ext.getCmp('Cost_move').reset();

                                        Ext.getCmp('form-detail1').show();
                                        Ext.getCmp('form-detail2').hide();

                                        clearFormData();
						
                                        if (t.value == 'Edit' || t.value == 'Del')
                                        {
                                            var refId = Ext.getCmp('referance_id').getValue();
                                            var refLv = Ext.getCmp('ref_level').getValue();
                                            if (refId != "")
                                            {
                                                if (parseInt(refLv) == parseInt(Ext.TREE_LEVEL_START) && t.value == 'Del')
                                                {
                                                    Ext.MessageBox.alert('Warning','ไม่สามารถทำรายการลบ ที่รายการอ้างอิงนี้ได้');
                                                    Ext.getCmp("condition_mode").reset();
                                                }else{
                                                    Ext.Ajax.request({
                                                        url: 'api/ListDcAssetType.php',
                                                        params:{
                                                            mode: t.value,
                                                            ref_id: Ext.getCmp('referance_id').getValue()
                                                        },
                                                        method:'POST',
                                                        success: function(result, request){
                                                            var res = new Object();
                                                            res = Ext.util.JSON.decode(result.responseText);

                                                            Ext.getCmp('frm_c_code').setValue(res.c_code);
                                                            Ext.getCmp('frm_c_name').setValue(res.c_name);

                                                            if (parseInt(refLv) == parseInt(Ext.TREE_LEVEL_START)){
                                                                Ext.getCmp('frm_asset_type').setValue(res.asset_type);
                                                                Ext.getCmp('frm_asset_type').show();
                                                            }else if (parseInt(refLv) == parseInt(Ext.TREE_LEVEL_MAP_ACC)){
                                                                
                                                                Ext.getCmp('frm_dc_acc_dr_id').setValue(res.dc_acc_dr_id);
                                                                Ext.getCmp('frm_dc_acc_dr_id_Name').setValue(res.dc_acc_dr_name);
                                                                Ext.getCmp('pop_frm_dc_acc_dr_id').show();

                                                                Ext.getCmp('frm_dc_acc_cr_id').setValue(res.dc_acc_cr_id);
                                                                Ext.getCmp('frm_dc_acc_cr_id_Name').setValue(res.dc_acc_cr_name);
                                                                Ext.getCmp('pop_frm_dc_acc_cr_id').show();

                                                                Ext.getCmp('frm_dc_acc_recv_id').setValue(res.dc_acc_recv_id);
                                                                Ext.getCmp('frm_dc_acc_recv_id_Name').setValue(res.dc_acc_recv_name);
                                                                Ext.getCmp('pop_frm_dc_acc_recv_id').show();

                                                                Ext.getCmp('frm_dc_acc_conf_recv_id').setValue(res.dc_acc_conf_recv_id);
                                                                Ext.getCmp('frm_dc_acc_conf_recv_id_Name').setValue(res.dc_acc_conf_recv_name);
                                                                Ext.getCmp('pop_frm_dc_acc_conf_recv_id').show();
                                                            }else{
                                                                Ext.getCmp('frm_i_is_last').show();
                                                                Ext.getCmp('frm_i_is_last').setValue(res.i_is_last);
                                                                if (parseInt(res.i_is_last) == parseInt(Ext.CONF_STATUS_ENABLE))
                                                                {
                                                                    Ext.getCmp('frm_f_unit_cost').show();
                                                                    Ext.getCmp('frm_dc_unit_type_id').show();
                                                                    Ext.getCmp('frm_i_enable').show();

                                                                    Ext.getCmp('frm_f_unit_cost').setValue(Ext.floatRenderer(res.f_unit_cost));
                                                                    Ext.getCmp('frm_dc_unit_type_id').setValue(res.dc_unit_type_id);
                                                                    Ext.getCmp('frm_i_enable').setValue(res.i_enable);
                                                                }
                                                            }
                                                        }
                                                    });
                                                }
                                            }
                                            else
                                            {
                                                Ext.MessageBox.alert('Warning','กรุณาเลือกรายการอ้างอิงก่อน');
                                            }
                                        }
                                        else if (t.value == 'AddChild')
                                        {
                                            var refId = Ext.getCmp('referance_id').getValue();
                                            var refLv = Ext.getCmp('ref_level').getValue();
                                            if (refId != "")
                                            {
                                                if (parseInt(refLv) == parseInt(Ext.TREE_LEVEL_START))
                                                {
                                                    Ext.getCmp('pop_frm_dc_acc_dr_id').show();
                                                    Ext.getCmp('pop_frm_dc_acc_cr_id').show();
                                                    Ext.getCmp('pop_frm_dc_acc_recv_id').show();
                                                    Ext.getCmp('pop_frm_dc_acc_conf_recv_id').show();
                                                }else if (parseInt(refLv) == parseInt(Ext.TREE_LEVEL_END)){
                                                    Ext.MessageBox.alert('Warning','รายการที่เลือกเป็นระดับล่างสุดแล้ว');
                                                    Ext.getCmp("condition_mode").reset();
                                                }else{	
                                                    Ext.getCmp('frm_i_is_last').show();
                                                    if (parseInt(refLv)+1 == parseInt(Ext.TREE_LEVEL_END)){
                                                            Ext.getCmp('frm_i_is_last').setValue(Ext.CONF_STATUS_ENABLE);
                                                            Ext.getCmp('frm_f_unit_cost').show();
                                                            Ext.getCmp('frm_dc_unit_type_id').show();
                                                            Ext.getCmp('frm_i_enable').show();
                                                    }										
                                                }
                                            }
                                            else
                                            {
                                                Ext.MessageBox.alert('Warning','กรุณาเลือกรายการอ้างอิงก่อน');
                                            }
                                        }
                                        if (t.value == 'AddBefore' || t.value == 'AddAfter')
                                        {
                                            var refId = Ext.getCmp('referance_id').getValue();
                                            var refLv = Ext.getCmp('ref_level').getValue();
                                            if (refId != "")
                                            {
                                                if (parseInt(refLv) == parseInt(Ext.TREE_LEVEL_START))
                                                {
//                                                    Ext.MessageBox.alert('Warning','ไม่สามารเพิ่มรายการที่ระดับนี้ได้ กรุณาเลือกรายการอื่น');
//                                                    Ext.getCmp("condition_mode").reset();
                                                    Ext.getCmp('frm_asset_type').show();
                                                }
                                                else if (parseInt(refLv) == parseInt(Ext.TREE_LEVEL_MAP_ACC))
                                                {
                                                    Ext.getCmp('pop_frm_dc_acc_dr_id').show();
                                                    Ext.getCmp('pop_frm_dc_acc_cr_id').show();
                                                    Ext.getCmp('pop_frm_dc_acc_recv_id').show();
                                                    Ext.getCmp('pop_frm_dc_acc_conf_recv_id').show();
                                                }
                                                else
                                                {
                                                    Ext.getCmp('frm_i_is_last').show();
                                                    if (parseInt(refLv) == parseInt(Ext.TREE_LEVEL_END)){
                                                        Ext.getCmp('frm_i_is_last').setValue(Ext.CONF_STATUS_ENABLE);
                                                        Ext.getCmp('frm_f_unit_cost').show();
                                                        Ext.getCmp('frm_dc_unit_type_id').show();
                                                        Ext.getCmp('frm_i_enable').show();
                                                    }	
                                                }
                                            }
                                            else{
                                                    Ext.MessageBox.alert('Warning','กรุณาเลือกรายการอ้างอิงก่อน');
                                            }
                                        }
                                        else if(t.value == 'Move') 
                                        {
                                            var refId = Ext.getCmp('referance_id').getValue();
                                            treeMove.getLoader().load(rootNodeMove);
                                            Ext.getCmp('form_id').setValue(2);
                                            Ext.getCmp('form-detail1').hide();
                                            Ext.getCmp('form-detail2').show();
                                        }
                                    }
				}
                            },{
				xtype: 'fieldset',
				id: 'form-detail1',
				title: '&nbsp;รายละเอียดข้อมูล&nbsp;',
				collapsible: false,
				hidden: false,
				labelWidth: 250,
				items: [{
		            	id: 'frm_c_code',
		                xtype:'textfield',
		                fieldLabel: 'รหัสสินทรัพย์',
		                name: 'c_code',
		                anchor:'95%'
		            },{
		            	id: 'frm_c_name',
		                xtype:'textfield',
		                fieldLabel: 'ชื่อสินทรัพย์ ',
		                name: 'c_name',
		                anchor:'95%'
		            },{
                                fieldLabel: 'ประเภทสินทรัพย์',
                                id:'frm_asset_type',
                                xtype: 'radiogroup',
                                columns: [80,150,150],
                                items: [
                                        { boxLabel: 'ที่ดิน', name: 'asset_type', inputValue: Ext.ASSET_TYPE_LAND },
                                        { boxLabel: 'อาคารและอุปกรณ์', name: 'asset_type', inputValue: Ext.ASSET_TYPE_EQUIP, checked: true},
                                        { boxLabel: 'พาหนะ', name: 'asset_type', inputValue: Ext.ASSET_TYPE_VEHICLE}
                                ]
		            },
		            popAccDr.mini,
		            popAccCr.mini,
		            popAccRev.mini,
		            popAccConf.mini,
		            {
                                fieldLabel: 'เป็นรายการสินทรัพย์ระดับล่างสุด',
                                id:'frm_i_is_last',
                                xtype: 'radiogroup',
                                columns: [80,100],
                                items: [
                                        { boxLabel: 'เป็น', checked: true, name: 'i_is_last', inputValue: Ext.CONF_STATUS_ENABLE },
                                        { boxLabel: 'ไม่เป็น', name: 'i_is_last', inputValue: Ext.CONF_STATUS_DISABLE}
                                ],listeners: {
                                    change : function(obj, value){   
                                        if(parseInt(value.inputValue)==parseInt(Ext.CONF_STATUS_ENABLE)){ 
                                            Ext.getCmp('frm_f_unit_cost').show();
                                            Ext.getCmp('frm_dc_unit_type_id').show();
                                            Ext.getCmp('frm_i_enable').show();
                                        }else{  
                                            Ext.getCmp('frm_f_unit_cost').hide();
                                            Ext.getCmp('frm_dc_unit_type_id').hide();
                                            Ext.getCmp('frm_i_enable').hide();
                                        }   
                                    }
                                }
		            },{
		            	id:'frm_f_unit_cost',
		                xtype:'textfield',
		                fieldLabel: 'ราคามาตรฐาน',
		                name: 'f_unit_cost',
		                anchor:'95%'
		            },{ 
                                xtype: 'combo', 
                                id: 'frm_dc_unit_type_id',
                                fieldLabel: 'หน่วยนับ',
                                store:storeDcUnitType,  
                                valueField: 'id',
                                displayField: 'c_name',
                                submitValue : true,
                                hiddenName : 'dc_unit_type_id',
                                mode: "local",
                                triggerAction: "all",
                                emptyText: "ไม่ระบุ",
                                forceSelection: true,
                                selectOnFocus: true,
                                editable:false, 
                                listeners: { 
                                    select: function(combo, record, index) { 

                                    },
                                    afterrender: function( obj, eOpts ){ 

                                    }
                                }
                            },{
                                fieldLabel: 'สถานะการใช้งาน',
                                id:'frm_i_enable',
                                xtype: 'radiogroup',
                                columns: [80,100],
                                items: [
                                        { boxLabel: 'ใช้งาน', checked: true, name: 'i_enable', inputValue: Ext.CONF_STATUS_ENABLE },
                                        { boxLabel: 'ไม่ใช้งาน', name: 'i_enable', inputValue: Ext.CONF_STATUS_DISABLE}
                                ]
		            }
			]},{
                            xtype: 'fieldset',
                            id: 'form-detail2',
                            title: '&nbsp;รายละเอียดข้อมูล&nbsp;',
                            collapsible: false,
                            hidden: true,
                            labelWidth: 150,
                            items: [{
                            id:'move_id',
                            xtype: "hidden",
                            readOnly: true
		        },{
                            id: "move_code",
                            xtype : "hidden",
                            readOnly: true
                        }, {
                            id:'Cost_move',
                            xtype:'textfield',
                            fieldLabel: 'รายการปลายทาง',
                            anchor: '100%',
                            readOnly: true
		        }, {
                            xtype: 'radiogroup',
                            id: 'i_move',
                            fieldLabel: 'ย้ายรายการ',
                            columns: [ 150, 150 ],
                            vertical: true,
                            items: [
                                { boxLabel: 'ย้ายก่อนหน้า', name: 'i_move', inputValue: 'Before', checked: true },
		                { boxLabel: 'ย้ายต่อท้าย', name: 'i_move', inputValue: 'After' }
		            ]
		        }, {
                            xtype: 'box',
                            autoEl: {tag: 'hr'}
                        }, treeMove ]
                }],
		buttons: [{
			text : Ext.GLOBAL_BU_SAVE_TH,
			handler : function() {
				var mode = Ext.getCmp("condition_mode").getValue();
				var refId = Ext.getCmp('referance_id').getValue();
				var refLv = Ext.getCmp('ref_level').getValue();
				
				var c_code = Ext.getCmp('frm_c_code').getValue();
				var c_name = Ext.getCmp('frm_c_name').getValue();
                                
                                var asset_type = Ext.getCmp('frm_asset_type').getValue().inputValue;
				
				var dc_acc_dr_id = Ext.getCmp('frm_dc_acc_dr_id').getValue();
				var dc_acc_cr_id = Ext.getCmp('frm_dc_acc_cr_id').getValue();
				var dc_acc_recv_id = Ext.getCmp('frm_dc_acc_recv_id').getValue();
				var dc_acc_conf_recv_id = Ext.getCmp('frm_dc_acc_conf_recv_id').getValue();
				
				var f_unit_cost = Ext.getCmp('frm_f_unit_cost').getValue();
				var dc_unit_type_id = Ext.getCmp('frm_dc_unit_type_id').getValue();
				var i_enable_true = Ext.getCmp('frm_i_enable').items.items[0].checked;
				var i_enable = (i_enable_true==true)? Ext.CONF_STATUS_ENABLE : Ext.CONF_STATUS_DISABLE;
				
				var i_last_true = Ext.getCmp('frm_i_is_last').items.items[0].checked;
				var i_is_last = (i_last_true==true)? Ext.CONF_STATUS_ENABLE : Ext.CONF_STATUS_DISABLE;
				
				var move_id = Ext.getCmp('move_id').getValue();
				var i_move = Ext.getCmp('i_move').getValue().inputValue;

				var errMsg = '';
				var childMax = parseInt(Ext.TREE_LEVEL_END)-1;
                                
                                if (parseInt(refLv) > parseInt(Ext.TREE_LEVEL_START))
                                    asset_type = null;
				
				if (refId =='')
                                    errMsg = 'กรุณาเลือกรายการอ้างอิงก่อน';
				else if (mode == '')
                                    errMsg = 'กรุณาเลือกเงื่อนไข';
				else if (mode == 'AddChild' && Ext.getCmp('isLast').getValue() == 'false')
                                    errMsg = 'รายการนี้ได้สร้างรายการย่อยแล้ว กรุณาเลือกเงื่อนไขอื่น';
				else if (mode == 'AddChild' && parseInt(refLv) == childMax && !i_last_true)
                                    errMsg = 'รายการที่ทำอยู่เป็นระดับล่างสุดแล้ว กรุณาเลือก เป็นรายการสินทรัพย์ระดับล่างสุด';
				else if ((mode == 'AddBefore' || mode == 'AddAfter') && parseInt(refLv) == parseInt(Ext.TREE_LEVEL_END) && !i_last_true)
                                    errMsg = 'รายการที่ทำอยู่เป็นระดับล่างสุดแล้ว กรุณาเลือก เป็นรายการสินทรัพย์ระดับล่างสุด';
				else 
				{
                                    if (mode == 'Move')
                                    {
                                        var refCode = Ext.getCmp('referance_code').getValue();
                                        var moveCode = Ext.getCmp('move_code').getValue();

                                        var n = moveCode.search(refCode);
                                        if (move_id == '')
                                            errMsg = 'กรุณาเลือกรายการปลายทางก่อน';
                                        else if (n == 0)
                                            errMsg = 'ไม่สามารถย้ายรายการอ้างอิงไปรายการย่อยของตัวเองได้';
                                    }
                                    else if (c_code == '')
                                        errMsg = 'กรุณาระบุรหัสสินทรัพย์';
                                    else if (c_name == '')
                                        errMsg = 'กรุณาระบุชื่อสินทรัพย์';
				}
				
				if (errMsg != '')
				{
                                    Ext.MessageBox.alert('Warning',errMsg);
				}
				else
				{
                                    Ext.Ajax.request({
                                        url: 'api/mnDcAssetType.php',
                                        params:{
                                            mode: mode,
                                            ref_id: refId,
                                            refLv: refLv,
                                            move_id : move_id,
                                            i_move : i_move,

                                            c_code : c_code,
                                            c_name : c_name,
                                            asset_type : asset_type,
                                            dc_acc_dr_id:dc_acc_dr_id,
                                            dc_acc_cr_id:dc_acc_cr_id,
                                            dc_acc_recv_id:dc_acc_recv_id,
                                            dc_acc_conf_recv_id:dc_acc_conf_recv_id,
                                            f_unit_cost:f_unit_cost,
                                            dc_unit_type_id:dc_unit_type_id,
                                            i_enable:i_enable,
                                            i_is_last:i_is_last
                                        },
                                        method:'POST',
                                        success: function(result, request){
                                            var res = new Object();
                                            res = Ext.util.JSON.decode(result.responseText);
                                            if(res.success == 'Success'){
                                                Ext.MessageBox.alert('Message','บันทึกข้อมูลเรียบร้อย');
                                                treeCost.getLoader().load(rootNode); 
                                                clearValue();
                                            }
                                        }
                                    });
				}
				
			}
		}, {
                    text: 'Cancel',
                    handler: clearValue
		}]
	};
	
    // WEST
    var west = new Ext.Panel({
            region:'west',
            title: 'รายการอ้างอิง',
            autoScroll: true,
            split:true,
            width: 450,
            items: [treeCost]
    });

    var center = {
        region: 'center',
        id: 'content-panel',
        collapsible: false,
        autoScroll: true,
        items: [panelForm]
    };

    // RENDER
    new Ext.Viewport({
        layout: 'border',
        padding: 10,
        items: [ west, center]
    });

    clearFormData();
});