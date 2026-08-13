Ext.onReady(function() {
	Ext.QuickTips.init();

	/*===============================================*/
	var condition = new Ext.data.JsonStore({
		fields: ["value", "text"],
		data : [
		        { value: "AddChild", text: "เพิ่มเมนูย่อย" },
		        { value: "AddBefore", text: "เพิ่มก่อนหน้ารายการที่เลือก" },
		        { value: "AddAfter", text: "เพิ่มต่อท้ายรายการที่เลือก" },
		        { value: "Edit", text: "แก้ไขรายการที่เลือก" },
		        { value: "Del", text: "ลบรายการที่เลือก" },
		        { value: "Move", text: "ย้ายรายการที่เลือก" },
		       ]
	});

	/*============== Tree Menu ====================*/
	var storeMenu	= new Ext.tree.TreeLoader({
		dataUrl: "api/List_DcAcc.php"
	});
	
	var rootNode	= new Ext.tree.AsyncTreeNode();
	var treeMenu	= new Ext.tree.TreePanel({
		border: false,
		autoScroll: true,
		rootVisible: false,// show Root Node
		lines: false,
		singleExpand: true,
		useArrows: true,
		loader: storeMenu,
		root: rootNode
    });
	
	treeMenu.on("click", function(n){
		var sn = this.selModel.selNode || {}; // selNode is null on initial selection
		if(n.id != sn.id) {  // ignore clicks on folders and currently selected node
			var parent		= n;
			var parent_name	= "";
			for( var i = 0; i <= n.attributes.lv; i++ ) {
				if(parent.text != null) {
					if(parent_name != ""){
						parent_name	= parent.attributes.text_show+" => "+parent_name;
					} else {
						parent_name	= parent.attributes.text_show;
					}
					parent = parent.parentNode;
				}
			}
			Ext.getCmp("referance_id").setValue(n.id); // เมนูอ้างอิง
			Ext.getCmp("menu_referance").setValue(parent_name);
			Ext.getCmp("condition_mode").reset();
			Ext.getCmp("move_id").reset();
			Ext.getCmp("menu_move").reset();
			
			Ext.getCmp("c_code").reset();
			Ext.getCmp("c_name").reset();
			Ext.getCmp("dc_cost_acc_id_fixed").reset();
			Ext.getCmp("i_debit").reset();
			Ext.getCmp("i_enable").reset();
		}
	});
	
	// MOVE
	storeMove	= new Ext.tree.TreeLoader({
		dataUrl:"api/List_DcAcc.php"
	});
	rootNode_move = new Ext.tree.AsyncTreeNode();
	treeMove = new Ext.tree.TreePanel({
		border: false,
		autoScroll: true,
		rootVisible: false,// show Root Node
		lines: false,
		singleExpand: true,
		useArrows: true,
		loader: storeMove,
		root: rootNode_move
    });
	
	treeMove.on("click", function(n){
		var sn = this.selModel.selNode || {}; // selNode is null on initial selection
		if(n.id != sn.id) {  // ignore clicks on folders and currently selected node
			var parent		= n;
			var parent_name	= "";
			for( var i = 0; i <= n.attributes.lv; i++ ) {
				if(parent.text != null) {
					if(parent_name != ""){
						parent_name	= parent.attributes.text_show+" => "+parent_name;
					} else {
						parent_name	= parent.attributes.text_show;
					}
					parent = parent.parentNode;
				}
			}
			Ext.getCmp("move_id").setValue(n.id); // เมนูปลายทางฃ
			Ext.getCmp("menu_move").setValue(parent_name);
		}
	});
	
	dc_cost	= new Ext.data.JsonStore({
		autoDestroy: true,
		autoLoad: true,
		url: "api/List_DcAcc.php",
		baseParams: { mode: "dc_cost" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ]
	});
	
	function save_val(){
		var errMsg			= "";
		var refId			= Ext.getCmp("referance_id").getValue();
		var formId			= Ext.getCmp("form_id").getValue();
		var mode			= Ext.getCmp("condition_mode").getValue();
		var moveId			= Ext.getCmp("move_id").getValue();
		var i_move			= Ext.getCmp("i_move").getValue().inputValue;
		var c_code			= Ext.getCmp("c_code").getValue();
		var c_name			= Ext.getCmp("c_name").getValue();
		var i_debit			= Ext.getCmp("i_debit").getValue().inputValue;
		var i_enable		= (Ext.getCmp("i_enable").getValue() == true)? 1 : 2;
		var dc_cost_acc_id_fixed	= Ext.getCmp("dc_cost_acc_id_fixed").getValue();
		
		var myMask = new Ext.LoadMask(Ext.getBody(), {msg:"Please wait..."});
		myMask.show();
		Ext.Ajax.request({
			url: "api/mn_DcAcc.php",
			params:{
				mode: mode,
				ref_id: refId,
				move_id: moveId,
				i_move: i_move,
				c_code: c_code,
				dc_cost_acc_id_fixed: dc_cost_acc_id_fixed,
				c_name: c_name,
				i_debit: i_debit,
				i_enable: i_enable
			},
			method:"POST",
			success: function(result, request){
				myMask.hide();
				var res = new Object();
				res = Ext.util.JSON.decode(result.responseText);
				if(res.success == true){
					//Ext.MessageBox.alert("Message","บันทึกข้อมูลเรียบร้อย");
					treeMenu.getLoader().load(rootNode);
					treeMove.getLoader().load(rootNode_move);
					Ext.getCmp("form-widgets").getForm().reset();
				} else {
					Ext.MessageBox.alert("Message",res.msg);
				}
			}
		});
	} // save_val
	
	var panelForm = new Ext.form.FormPanel({
		id: "form-widgets",
		frame: true,
		//labelWidth: 150,
		bodyStyle: { padding: "10px 20px" },
		defaults: { anchor: "100%", msgTarget: "side", allowBlank: false },
        autoHeight: true,
        items: [{
        	id: "referance_id",
        	xtype: "hidden",
        	readOnly: true
        }, {
        	id: "form_id",
        	xtype: "hidden",
        	readOnly: true
        }, {
        	id: "menu_referance",
        	xtype: "textfield",
        	fieldLabel: "ชื่อเมนูอ้างอิง",
        	readOnly: true
        }, {
			id: "condition_mode",
			xtype: "combo",
			fieldLabel: "เงื่อนไข",
			mode: "local",
			store: condition,
			valueField: "value",
			displayField: "text",
			allowBlank : false,
			editable : false,
			triggerAction: "all",
			typeAhead : false,
			emptyText : "เลือกเงื่อนไข",
			listeners: {
				"select": function(t) {
					Ext.getCmp("form_id").setValue(1);
					Ext.getCmp("move_id").reset();
					Ext.getCmp("menu_move").reset();
					Ext.getCmp("c_code").reset();
					Ext.getCmp("c_name").reset();
					Ext.getCmp("dc_cost_acc_id_fixed").reset();
					Ext.getCmp("i_debit").reset();
					Ext.getCmp("i_enable").reset();
					Ext.getCmp("form-detail1").show();
					Ext.getCmp("form-detail2").hide();
					
					if (t.value == "Edit" || t.value == "Del") {
						var refId = Ext.getCmp("referance_id").getValue();
						if (refId != "")
						{
							Ext.Ajax.request({
								url: "api/List_DcAcc.php",
								params:{
									mode: t.value,
									ref_id: refId
								},
								method:"POST",
								success: function(result, request){
									var res = new Object();
									res = Ext.util.JSON.decode(result.responseText);
									if(res.dc_acc_id > 0) {
										Ext.getCmp("c_code").setValue(res.c_code);
										Ext.getCmp("c_name").setValue(res.c_name);
										Ext.getCmp("dc_cost_acc_id_fixed").setValue(res.dc_cost_acc_id_fixed);
										Ext.getCmp("i_debit").setValue(res.i_debit);
										Ext.getCmp("i_enable").setValue(res.i_enable);
									}
								}
							});
						} else {
							Ext.MessageBox.alert("Warning","กรุณาเลือกเมนูอ้างอิงก่อน");
						}
					} else if(t.value == "Move") {
						var refId = Ext.getCmp("referance_id").getValue();
						storeMove.baseParams = { "mode" : "Move", "ref_id" : refId };
						treeMove.getLoader().load(rootNode_move);
						Ext.getCmp("form_id").setValue(2);
						Ext.getCmp("form-detail1").hide();
						Ext.getCmp("form-detail2").show();
					}
				}
			}
		}, {
			xtype: "fieldset",
			id: "form-detail1",
			title: "&nbsp;รายละเอียดข้อมูล&nbsp;",
			collapsible: false,
			hidden: false,
			labelWidth: 150,
			items: [{
				xtype: "compositefield",
				fieldLabel: "รหัสบัญชี",
				//msgTarget: "under",
				items: [{
					xtype: "numberfield",
					id: "c_code",
					width: 200,
					allowBlank: false
				}]
			}, {
				xtype: "textfield",
				id: "c_name",
				width: 300,
				fieldLabel: "ชื่อบัญชี",
				allowBlank: false
			}, {
				xtype: "combo",
				fieldLabel: "ศูนย์ต้นทุนทางบัญชี",
				id: "dc_cost_acc_id_fixed",
    			store: dc_cost,
    			width: 300,
    			valueField: "id",
    			displayField: "c_name",
    			mode: "local",
    			triggerAction: "all",
    			emptyText: "--- เลือกศูนย์ต้นทุนทางบัญชี ---",
				forceSelection: true,
				selectOnFocus: true
			}, {
				xtype: "radiogroup",
				id: "i_debit",
				fieldLabel: "ประเภทดุล",
				columns: [ 60, 60, 60 ],
				vertical: true,
				items: [
				    { boxLabel: "เดบิต", name: "i_debit", inputValue: 1, checked: true },
	                { boxLabel: "เครดิต", name: "i_debit", inputValue: 2 },
	                { boxLabel: "ไม่ระบุ", name: "i_debit", inputValue: 0 }
	            ]
	        }, {
				xtype: "checkbox",
				id: "i_enable",
				fieldLabel: "สถานะ",
				boxLabel: "ใช้งาน",
				checked: true,
				inputValue: 1
			}]
		}, {
			xtype: "fieldset",
			id: "form-detail2",
			title: "&nbsp;รายละเอียดข้อมูล&nbsp;",
			collapsible: false,
			hidden: true,
			labelWidth: 150,
			items: [{
	        	id:"move_id",
	        	xtype: "hidden",
	        	readOnly: true
	        }, {
	        	id:"menu_move",
	        	xtype:"textfield",
	        	fieldLabel: "รายการปลายทาง",
	        	anchor: "100%",
	        	readOnly: true
	        }, {
				xtype: "radiogroup",
				id: "i_move",
				fieldLabel: "ย้ายรายการ",
				columns: [ 150, 150 ],
				vertical: true,
				items: [
				    { boxLabel: "ย้ายก่อนหน้า", name: "i_move", inputValue: "Before", checked: true },
	                { boxLabel: "ย้ายต่อท้าย", name: "i_move", inputValue: "After" }
	            ]
	        }, {
			    xtype: "box",
			    autoEl: {tag: "hr"}
			}, treeMove ]
		}],
        buttons: [{
			text : Ext.GLOBAL_BU_SAVE_TH,
			handler : function() {
				var errMsg			= "";
				var refId			= Ext.getCmp("referance_id").getValue();
				var formId			= Ext.getCmp("form_id").getValue();
				var mode			= Ext.getCmp("condition_mode").getValue();
				var moveId			= Ext.getCmp("move_id").getValue();
				var i_move			= Ext.getCmp("i_move").getValue().inputValue;
				var c_code			= Ext.getCmp("c_code").getValue();
				var c_name			= Ext.getCmp("c_name").getValue();
				var i_debit			= Ext.getCmp("i_debit").getValue().inputValue;
				var i_enable		= (Ext.getCmp("i_enable").getValue() == true)? 1 : 2;
				var dc_cost_acc_id_fixed	= Ext.getCmp("dc_cost_acc_id_fixed").getValue();

				if (formId == 1) {
					if (c_code == "") {
						errMsg = "กรุณาระบุรหัสบัญชี";
					} else if (c_name == "") {
						errMsg = "กรุณาระบุชื่อบัญชี";
					} 
				} else {
					if (moveId == "") {
						errMsg = "กรุณาเลือกรายการปลายทาง";
					}
				}
				
				if (refId == "") {
					errMsg = "กรุณาเลือกเมนูอ้างอิงก่อน";
				} else if (mode == "") {
					errMsg = "กรุณาเลือกเงื่อนไข";
				}
				
				if (errMsg != "")
				{
					Ext.MessageBox.alert("Warning",errMsg);
				}
				else
				{
					if(mode == "AddChild" || mode == "AddBefore" || mode == "AddAfter" || mode == "Edit") {
						var vv	= (mode == "Edit")? "update": "add";
						Ext.Ajax.request({
							url: "api/List_DcAcc.php",
							params:{
								mode: vv,
								ref_id: refId,
								c_code: c_code
							},
							method:"POST",
							success: function(result, request){
								var res = new Object();
								res = Ext.util.JSON.decode(result.responseText);
								if(res.success == true ) {
									save_val();
								} else {
									new Ext.Window({
										title: "ยืนยันการบันทึกข้อมูล",
										id: "win-msg-conf",
										modal: true,
										width: 250,
										height: 150,
										html: "รหัสบัญชีเป็นเลขซ้ำท่านต้องการบันทึกหรือไม่ ?",
										buttons: [{
											text : "Confirm",
											handler : function() {
												save_val();
												Ext.getCmp("win-msg-conf").hide();
												Ext.getCmp("win-msg-conf").destroy();
											}
										}, {
											text : "Cancel",
											handler : function() {
												Ext.getCmp("win-msg-conf").hide();
												Ext.getCmp("win-msg-conf").destroy();
											}
										}]
									}).show();
								}
							}
						});
					} else {
						save_val();
					}
				}
			}
		}, {
			text: "Cancel",
			handler: function() {
				Ext.getCmp("form-widgets").getForm().reset();
			}
		}]
    });
	
	/*====================== WEST ======================*/
	var west = new Ext.Panel({
		region: "west",
		title: "เมนูผังบัญชี",
		autoScroll: true,
		split: true,
		width: 450,
		items: [ treeMenu ]
	});
	
	/*====================== CENTER ======================*/
	var center = new Ext.Panel({
		layout: "fit",
		region: "center",
		title: "บันทึกข้อมูล",
		collapsible: false,
		items: [ panelForm ]
	});
	
	/*====================== RENDER ======================*/
	new Ext.Viewport({
		layout: "border",
		items: [ west , center ]
	});
});
