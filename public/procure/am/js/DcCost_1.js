function clearValue()
{
    Ext.getCmp('form_id').setValue(1);
    Ext.getCmp('form-detail1').show();
    Ext.getCmp('form-detail2').hide();

    Ext.getCmp("condition_mode").reset();
    Ext.getCmp('referance_id').setValue('');
    Ext.getCmp('Cost_referance').setValue('');
    Ext.getCmp('isLast').reset();

    Ext.getCmp('move_id').reset();
    Ext.getCmp('Cost_move').reset();

    clearFormData();
 }
function clearFormData()
{
    Ext.getCmp('c_code').setValue('');
    Ext.getCmp('c_name').setValue('');
    Ext.getCmp('c_address').setValue('');
    Ext.getCmp('c_comment').setValue('');
    Ext.getCmp('c_type_region').setValue('');
    Ext.getCmp('enableGroup').items.items[0].setValue(true);
	Ext.getCmp('glDeptGroup').items.items[0].setValue(true);
    Ext.getCmp('dc_area_code').reset();
	Ext.getCmp('dc_cost_code').reset();
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
        dataUrl:'api/ListDcCost.php'
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
                url: 'api/ListDcCost.php',
                params:{
                    mode: 'getCode',
                    ref_id: n.id
                },
                method:'POST',
                success: function(result, request){
                    var res = new Object();
                    res = Ext.util.JSON.decode(result.responseText);
                    Ext.getCmp('referance_code').setValue(res.c_code);
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
                url: 'api/ListDcCost.php',
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
	
    // store หน่วยธุรกิจ
    var dc_area = new Ext.data.JsonStore({
        autoDestroy: true,
        autoLoad: true,
        url : 'api/ListDcCombo.php',
        root: 'data',
        fields: [
                { name: 'id' },
                { name: 'c_name', type: 'string' }
        ],
        baseParams: {
                mode : 2,
                fldID : 'dc_area_id',
                fldCode : 'c_branch',
                table : 'vw_dc_area'
        }
    });
	
    // ศูนย์ต้นทุน
    var dc_cost = new Ext.data.JsonStore({
        autoDestroy: true,
        autoLoad: true,
        url : 'api/ListDcCombo.php',
        root: 'data',
        fields: [
            { name: 'id' },
            { name: 'c_name', type: 'string' }
        ],
        baseParams: {
            mode : 2,
            fldID : 'dc_cost_id',
            table : 'vw_dc_cost'
        }
    });

/*============ Form Manage ============*/
    var panelForm = {
        region: 'center',
        title: 'บันทึกข้อมูล',
        xtype: 'form',
        id: 'form-widgets',
        url:'api/mnDcCost.php',
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
                id: "isLast",
                xtype : "hidden",
                name: "isLast",
                readOnly: true
            }, {
                id:'form_id',
                xtype: "hidden",
                readOnly: true
            },{
                id 		  : "condition_mode",
                xtype     : 'combo',
                fieldLabel: 'เงื่อนไข',
                mode	  : 'local',
                store     : new Ext.data.SimpleStore({
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
                    select: function(t){
                        Ext.getCmp('form_id').setValue(1);
                        Ext.getCmp('move_id').reset();
                        Ext.getCmp('Cost_move').reset();

                        Ext.getCmp('form-detail1').show();
                        Ext.getCmp('form-detail2').hide();

                        clearFormData();

                        if (t.value == 'Edit' || t.value == 'Del')
                        {
                            var refId = Ext.getCmp('referance_id').getValue();
                            if (refId != "")
                            {
                                Ext.Ajax.request({
                                    url: 'api/ListDcCost.php',
                                    params:{
                                        mode: t.value,
                                        ref_id: Ext.getCmp('referance_id').getValue()
                                    },
                                    method:'POST',
                                    success: function(result, request){
                                        var res = new Object();
                                        res = Ext.util.JSON.decode(result.responseText);
                                        if(res.dc_cost_id > 0){
                                            var radioEnable = Ext.getCmp('enableGroup');
											var radioGL = Ext.getCmp('glDeptGroup');
                                            var dc_area_id = res.dc_area_id;
                                            var dc_cost_acc_id = res.dc_cost_acc_id;
                                            
                                            Ext.getCmp('dc_area_code').setValue(dc_area_id);
                                            Ext.getCmp('dc_cost_code').setValue(dc_cost_acc_id);
                                            Ext.getCmp('c_type_region').setValue(res.c_type_region);
                                            Ext.getCmp('c_code').setValue(res.c_code);
                                            Ext.getCmp('c_name').setValue(res.c_name);
                                            Ext.getCmp('c_address').setValue(res.c_address);
                                            Ext.getCmp('c_comment').setValue(res.c_comment);

                                            if (res.i_enable == '1')
                                                radioEnable.items.items[0].setValue(true);
                                            else
                                                radioEnable.items.items[1].setValue(true);
											
											if (res.i_gl_department == Ext.CONF_GL_DEPARTMENT_NONE)
                                                radioGL.items.items[0].setValue(true);
											else if (res.i_gl_department == Ext.CONF_GL_DEPARTMENT_MAIN)
                                                radioGL.items.items[1].setValue(true);
                                            else if (res.i_gl_department == Ext.CONF_GL_DEPARTMENT_BRANCH)
                                                radioGL.items.items[2].setValue(true);
											
                                        }
                                    }
                                });
                            }
                            else
                            {
                                Ext.MessageBox.alert('Warning','กรุณาเลือกรายการอ้างอิงก่อน');
                            }
                        }
                        else if(t.value == 'Move') {
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
                labelWidth: 150,
                items: [{
                id: 'c_code',
                xtype:'textfield',
                fieldLabel: 'รหัสหน่วยงาน',
                name: 'c_code',
                anchor:'95%'
            },{
                id: 'c_name',
                xtype:'textfield',
                fieldLabel: 'ชื่อหน่วยงาน',
                name: 'c_name',
                anchor:'95%'
            },{
                id:'c_address',
                xtype:'textfield',
                fieldLabel: 'ที่ตั้ง',
                name: 'c_address',
                anchor:'95%'
            },new Ext.form.ComboBox({
                id: 'dc_area_code',
                fieldLabel: 'หน่วยธุรกิจ',
                store: dc_area,
                anchor:'95%',
                valueField: 'id',
                displayField: 'c_name',
                submitValue : true,
                hiddenName : 'dc_area_id',
                typeAhead: true,
                mode: 'local',
                triggerAction: 'all',
                emptyText: 'กรุณาเลือก...',
                autoSelect: true,
                forceSelection: true,
                selectOnFocus: true,				
                listeners :{
                    select: function (combo, newValue) {
                        if (newValue.id > 0 )
                        {
                            Ext.Ajax.request({
                              url: 'api/ListDcCost.php',
                              params:{
                                      mode: 'dataArea',
                                      ref_id: newValue.id
                              },
                              method:'POST',
                              success: function(result, request){
                                    var res = new Object();
                                    res = Ext.util.JSON.decode(result.responseText);
                                    if(res.dc_area_id > 0){
                                        if (res.i_branch == '1')
                                            Ext.getCmp('c_type_region').setValue('สาขา');
                                        else
                                            Ext.getCmp('c_type_region').setValue('สำนักงานใหญ่');
                                    }
                              }
                            });
                        }
                    }
                }
            }),{
                id: 'c_type_region',
                xtype:'textfield',
                fieldLabel: 'ประเภทหน่วยธุรกิจ',
                anchor:'95%',
                readOnly: true
            },new Ext.form.ComboBox({
                id: 'dc_cost_code',
                fieldLabel: 'ศูนย์ต้นทุนทางบัญชี',
                store: dc_cost,
                anchor:'95%',
                valueField: 'id',
                displayField: 'c_name',
                submitValue : true,
                hiddenName : 'dc_cost_acc_id',
                typeAhead: true,
                mode: 'local',
                triggerAction: 'all',
                emptyText: 'กรุณาเลือก...',
                autoSelect: true,
                forceSelection: true,
                selectOnFocus: true,
                listeners :{
                    change: function (combo, newValue) {
                        if (newValue == '')
                            combo.setValue(0);
                    }
                }
            }),{
                fieldLabel: 'สถานะการใช้งาน',
                id:'enableGroup',
                xtype: 'radiogroup',
                columns: [80,100],
                items: [
                    { boxLabel: 'ใช้งาน', checked: true, name: 'i_enabled', inputValue: Ext.CONF_STATUS_ENABLE },
                    { boxLabel: 'ไม่ใช้งาน', name: 'i_enabled', inputValue: Ext.CONF_STATUS_DISABLE}
                ]
            },{
                fieldLabel: 'สถานะหน่วยงานทางบัญชี',
                id:'glDeptGroup',
                xtype: 'radiogroup',
                columns: [170,170,170],
                items: [
                    { boxLabel: 'ไม่เป็นหน่วยงานทางบัญชี', checked: true, name: 'i_gl_department', inputValue: Ext.CONF_GL_DEPARTMENT_NONE },
                    { boxLabel: 'เป็นหน่วยงานบัญชีส่วนกลาง', name: 'i_gl_department', inputValue: Ext.CONF_GL_DEPARTMENT_MAIN},
                    { boxLabel: 'เป็นหน่วยงานบัญชีส่วนงานอื่น', name: 'i_gl_department', inputValue: Ext.CONF_GL_DEPARTMENT_BRANCH}
                ]
            },{
                id:'c_comment',
                xtype:'textfield',
                fieldLabel: 'หมายเหตุ',
                name: 'c_comment',
                anchor:'95%'
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

                var c_code = Ext.getCmp('c_code').getValue();
                var c_name = Ext.getCmp('c_name').getValue();
                var c_address = Ext.getCmp('c_address').getValue();
                var c_comment = Ext.getCmp('c_comment').getValue();

                var dc_area_id = Ext.getCmp('dc_area_code').getValue();
                var dc_cost_acc_id = Ext.getCmp('dc_cost_code').getValue();

                var i_enable_true = Ext.getCmp('enableGroup').items.items[0].checked;
                var i_enable = (i_enable_true==true)? Ext.CONF_STATUS_ENABLE : Ext.CONF_STATUS_DISABLE;
				
				var i_gl_department = Ext.CONF_GL_DEPARTMENT_NONE;
				if (Ext.getCmp('glDeptGroup').items.items[1].checked)
					i_gl_department = Ext.CONF_GL_DEPARTMENT_MAIN;
				else if (Ext.getCmp('glDeptGroup').items.items[2].checked)
					i_gl_department = Ext.CONF_GL_DEPARTMENT_BRANCH;
	
                var move_id = Ext.getCmp('move_id').getValue();
                var i_move = Ext.getCmp('i_move').getValue().inputValue;

                var errMsg = '';

                if (refId =='')
                        errMsg = 'กรุณาเลือกรายการอ้างอิงก่อน';
                else if (mode == '')
                        errMsg = 'กรุณาเลือกเงื่อนไข';
                else if (mode == 'AddChild' && Ext.getCmp('isLast').getValue() == 'false')
                        errMsg = 'รายการนี้ได้สร้างรายการย่อยแล้ว กรุณาเลือกเงื่อนไขอื่น';
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
                            errMsg = 'กรุณาระบุรหัสหน่วยงาน';
                        else if (c_name == '')
                            errMsg = 'กรุณาระบุชื่อหน่วยงาน';
                        else if(dc_area_id == '')
                            errMsg = 'กรุณาเลือกหน่วยธุรกิจ';
                        else if(dc_cost_acc_id == '')
                            errMsg = 'กรุณาเลือกศูนย์ต้นทุนทางบัญชี';
                    }

                    if (errMsg != '')
                    {
                        Ext.MessageBox.alert('Warning',errMsg);
                    }
                    else
                    {
                        Ext.Ajax.request({
                            url: 'api/mnDcCost.php',
                            params:{
                                mode: mode,
                                ref_id: refId,
                                move_id : move_id,
                                i_move : i_move,

                                c_code : c_code,
                                c_name : c_name,
                                c_address : c_address,
                                dc_area_id : dc_area_id,
                                dc_cost_acc_id : dc_cost_acc_id,
                                i_enable : i_enable,
								i_gl_department : i_gl_department,
                                c_comment : c_comment
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
     }
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
     }
	// RENDER
	new Ext.Viewport({
            layout: 'border',
            padding: 10,
            items: [ west, center]
	});
});
