function clearValue()
{
	Ext.getCmp('form_id').setValue(1);
	Ext.getCmp('form-detail1').show();
	Ext.getCmp('form-detail2').hide();
	
	Ext.getCmp("condition_mode").reset();
	Ext.getCmp('referance_id').setValue('');
	Ext.getCmp('menu_referance').setValue('');
	Ext.getCmp('isLast').reset();
	Ext.getCmp('c_name').setValue('');
	Ext.getCmp('c_filelocation').setValue('');
	Ext.getCmp('enableGroup').items.items[0].setValue(true);
	Ext.getCmp('move_id').reset();
	Ext.getCmp('menu_move').reset();
}

Ext.onReady(function() {
	Ext.QuickTips.init();

/*===============================================*/
	var user_right_edit = true;
	var user_right_delete = true;
	var user_right_add = true;
	var user_view_only = false;
/*===============================================*/ 

/*============ Tree Menu ============*/
	var storeMenu	= new Ext.tree.TreeLoader({
		dataUrl:'api/ListDcMenu.php'
	});
	var rootNode = new Ext.tree.AsyncTreeNode();
	var treeMenu = new Ext.tree.TreePanel({
		border: false,
		autoScroll: true,
		rootVisible: false,// show Root Node
		lines: false,
		singleExpand: true,
		useArrows: true,
		loader: storeMenu,
		root: rootNode
    });

	treeMenu.on('click', function(n){
		var sn = this.selModel.selNode || {}; // selNode is null on initial selection
		if(n.id != sn.id) {  // ignore clicks on folders and currently selected node
			clearValue();
			Ext.getCmp('isLast').setValue(n.leaf);
			Ext.getCmp('menu_referance').setValue(n.text); // เมนูอ้างอิง
			var ref_id = Ext.getCmp('referance_id');//.setValue(n.id); // เมนูอ้างอิง
			ref_id.setValue(n.id);
			
			Ext.Ajax.request({
				url: 'api/ListDcMenu.php',
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
		loader: storeMenu,
		root: rootNodeMove
        });
        var tMove = new Ext.Panel({
		region:'west',
		autoScroll: true,
		split:true,
                height:Ext.getBody().getViewSize().height*0.48,
		items: [treeMove]
	})
	
	treeMove.on('click', function(n){
		var sn = this.selModel.selNode || {}; // selNode is null on initial selection
		if(n.id != sn.id) {  // ignore clicks on folders and currently selected node
			Ext.getCmp('menu_move').setValue(n.text); // เมนูปลายทาง
			var move_id = Ext.getCmp('move_id');//.setValue(n.id); // เมนูปลายทาง
			move_id.setValue(n.id);
			
			Ext.Ajax.request({
				url: 'api/ListDcMenu.php',
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

/*============ Form Manage ============*/
	var panelForm = {
		region: 'center',
		title: 'บันทึกข้อมูล',
		xtype: 'form',
		id: 'form-widgets',
		url:'api/mnDcMenu.php',
        frame:true,
        bodyStyle:'padding:5px 5px 0',

		id:'tabpanel2',
		border: false,
		stripeRows: true,
		loadMask: true,

		items: [{
				id:'menu_referance',
	            xtype:'textfield', 
	            fieldLabel: 'ชื่อเมนูอ้างอิง',
	            readOnly: true,
//	            height:100,
                    anchor:'98%'
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
								    [ 'AddChild', "เพิ่มเมนูย่อย" ],
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
							Ext.getCmp('menu_move').reset();
							
							Ext.getCmp('c_name').reset();
							Ext.getCmp('c_filelocation').reset();
							Ext.getCmp('enableGroup').items.items[0].setValue(true);
							
							Ext.getCmp('form-detail1').show();
							Ext.getCmp('form-detail2').hide();
						
							if (t.value == 'Edit' || t.value == 'Del')
							{
								var refId = Ext.getCmp('referance_id').getValue();
								if (refId != "")
								{
									Ext.Ajax.request({
									  url: 'api/ListDcMenu.php',
									  params:{
										  mode: t.value,
										  ref_id: Ext.getCmp('referance_id').getValue()
									  },
									  method:'POST',
									  success: function(result, request){
										var res = new Object();
										res = Ext.util.JSON.decode(result.responseText);
										if(res.dc_menu_id > 0){
											var radioEnable = Ext.getCmp('enableGroup');
											Ext.getCmp('c_name').setValue(res.c_name);
											Ext.getCmp('c_filelocation').setValue(res.c_filelocation);
											if (res.i_enable == '1')
												radioEnable.items.items[0].setValue(true);
											else
												radioEnable.items.items[1].setValue(true);
										}
									  }
									});
								}
								else
								{
									Ext.MessageBox.alert('Warning','กรุณาเลือกเมนูอ้างอิงก่อน');
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
				labelWidth: 110,
				items: [{
		            	id: 'c_name',
//		                xtype:'textfield',
                                xtype:'htmleditor',
		                fieldLabel: 'ชื่อเมนู',
		                name: 'c_name',
		                height:100,
                                anchor:'100%'
		            },{
		            	id:'c_filelocation',
		                xtype:'textfield',
		                fieldLabel: 'File Location',
		                name: 'c_filelocation',
		                anchor:'95%'
		            },{
						fieldLabel: 'สถานะการใช้งาน',
						id:'enableGroup',
						xtype: 'radiogroup',
						columns: [80,100],
						items: [
							{ boxLabel: 'ใช้งาน', checked: true, name: 'i_enabled', inputValue: '1' },
							{ boxLabel: 'ไม่ใช้งาน', name: 'i_enabled', inputValue: '2' }
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
		        	id:'menu_move',
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
				}, tMove ]
		}],
		buttons: [{
			text : Ext.GLOBAL_BU_SAVE_TH,
			handler : function() {
				var mode = Ext.getCmp("condition_mode").getValue();
				var refId = Ext.getCmp('referance_id').getValue();
				
				var c_name = Ext.getCmp('c_name').getValue();
				var c_filelocation = Ext.getCmp('c_filelocation').getValue();
				var i_enable_true = Ext.getCmp('enableGroup').items.items[0].checked;
				var i_enable_false = Ext.getCmp('enableGroup').items.items[1].checked;
				var i_enable = (i_enable_true==true)? 1 : 2;
				
				var move_id = Ext.getCmp('move_id').getValue();
				var i_move = Ext.getCmp('i_move').getValue().inputValue;

				var errMsg = '';
				
				if (refId =='')
					errMsg = 'กรุณาเลือกเมนูอ้างอิงก่อน';
				else if (mode == '')
					errMsg = 'กรุณาเลือกเงื่อนไข';
				else if (mode == 'AddChild' && Ext.getCmp('isLast').getValue() == 'false')
					errMsg = 'เมนูนี้ได้สร้างเมนูย่อยแล้ว กรุณาเลือกเงื่อนไขอื่น';
				else if (mode == 'Del' && Ext.getCmp('isLast').getValue() == 'false')
					errMsg = 'ไม่สามารถลบเมนูได้ เนื่องจากมีเมนูย่อยอยู่';
				else 
				{
					if (mode == 'Move')
					{
						var refCode = Ext.getCmp('referance_code').getValue();
						var moveCode = Ext.getCmp('move_code').getValue();
						
						
						var n = moveCode.search(refCode);
						if (move_id == '')
							errMsg = 'กรุณาเลือกเมนูปลายทางก่อน';
						else if (n == 0)
							errMsg = 'ไม่สามารถย้ายเมนูอ้างอิงไปเมนูย่อยของตัวเองได้';
					}
					else if (c_name == '')
						errMsg = 'กรุณาระบุชื่อเมนู';
				}

				if (errMsg != '')
				{
					Ext.MessageBox.alert('Warning',errMsg);
				}
				else
				{
					Ext.Ajax.request({
						url: 'api/mnDcMenu.php',
						params:{
							mode: mode,
							ref_id: refId,
							c_name : c_name,
							c_filelocation : c_filelocation,
							i_enable : i_enable,
							move_id : move_id,
							i_move : i_move
						},
						method:'POST',
						success: function(result, request){
							var res = new Object();
							res = Ext.util.JSON.decode(result.responseText);
							if(res.success == 'Success'){
								Ext.MessageBox.alert('Message','บันทึกข้อมูลเรียบร้อย');
								treeMenu.getLoader().load(rootNode); 
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
		title: 'เมนูอ้างอิง',
		autoScroll: true,
		split:true,
		width: 450,
		items: [treeMenu]
	});

	var center = {
		region: 'center',
		id: 'content-panel',
		collapsible: false,
		items: [panelForm]
	}

	// RENDER
	new Ext.Viewport({
		layout: 'border',
		padding: 10,
		items: [ west, center]
	});
});