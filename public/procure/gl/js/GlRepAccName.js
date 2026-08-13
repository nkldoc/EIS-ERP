Ext.onReady(function() {
	Ext.QuickTips.init();

	/*===============================================*/
	var title_panel	= "กำหนดรายงานตามบัญชี";
	/*===============================================*/
	
	Ext.store = new Ext.data.JsonStore({
		storeId: "myStore",
	    autoDestroy: true,
		autoLoad: true,
	    url: "api/List_GlRepAccName.php",
	    baseParams: { type: "gl_rep_acc_hdr", i_read: user_right_read }, //Permission i_read
	    root: "data",
	    idProperty: "id",
		totalProperty: "totalCount",
		fields: [
			{ name : "no" },
			{ name : "id" },
			{ name : "c_code" },
			{ name : "c_name" },
			{ name : "c_comment" },
			{ name : "chk_group1" },
			{ name : "chk_group2" },
			{ name : "chk_group3" },
			{ name : "chk_group4" },
			{ name : "chk_group5" },
			{ name : "cal_group1" },
			{ name : "cal_group2" },
			{ name : "cal_group3" },
			{ name : "cal_group4" },
			{ name : "cal_group5" },
			{ name : "i_money" },
			{ name : "i_process" },
			{ name : "i_level_dtl" },
			{ name : "i_enable" },
			{ name : "dc_user_create_id" },
			{ name : "dc_user_create_cost_id" },
			{ name : "d_create" },
			{ name : "dc_user_update_id" },
			{ name : "dc_user_update_cost_id" },
			{ name : "d_update" }
		]
	});
	
	// ระดับหัวเรื่อง Level ล่างสุด 
	Ext.i_level_dtl = new Ext.data.JsonStore({
		fields: ["id", "c_name"],
		data : [
		        { id : "1", c_name : "1 ระดับ" },
		        { id : "2", c_name : "2 ระดับ" } 
		       ]
	});
	
	Ext.i_process_only = new Ext.data.JsonStore({
		fields: ["id", "c_name"],
		data : [{ id : "2", c_name : "แสดงข้อมูลที่ประมวลผลแล้ว" }]
	});
	
	// ประเภทการแสดงผล 
	Ext.i_money = new Ext.data.JsonStore({
		fields: ["id", "c_name"],
		data : [
		        { id : "1", c_name : "รายเดือน" },
		        { id : "2", c_name : "รายไตรมาส" },
		        { id : "3", c_name : "รายไตรมาส (ณ สิ้นไตรมาส)" },
		        { id : "4", c_name : "รายปี" }
		       ]
	});
	
	// สถานะข้อมูล
	Ext.i_process_all = new Ext.data.JsonStore({
		fields: ["id", "c_name"],
		data : [
		        { id : "1", c_name : "แสดงข้อมูลโดยไม่ต้องประมวลผล" },
		        { id : "2", c_name : "แสดงข้อมูลที่ประมวลผลแล้ว" } 
		       ]
	});
	
	// หมวดผังบัญชี
	Ext.i_cal_method = new Ext.data.JsonStore({
		fields: ["id", "c_name"],
		data : [
 
		        { id : "3", c_name : "ยอดรวมของ ผลต่างยอดยกไป เดบิต-เครดิต (เฉพาะข้อมูลที่ประมวลผลแล้ว)" },
		        { id : "4", c_name : "ยอดรวมของ ผลต่างยอดยกไป เครดิต-เดบิต (เฉพาะข้อมูลที่ประมวลผลแล้ว)" } 
		       ]
	});
	
	Ext.i_cal_method_all = new Ext.data.JsonStore({
		fields: ["id", "c_name"],
		data : [
		        { id : "1", c_name : "ยอดรวมของ ผลต่าง เดบิต-เครดิต" },
		        { id : "2", c_name : "ยอดรวมของ ผลต่าง เครดิต-เดบิต" },
		        { id : "3", c_name : "ยอดรวมของ ผลต่างยอดยกไป เดบิต-เครดิต (เฉพาะข้อมูลที่ประมวลผลแล้ว)" },
		        { id : "4", c_name : "ยอดรวมของ ผลต่างยอดยกไป เครดิต-เดบิต (เฉพาะข้อมูลที่ประมวลผลแล้ว)" } 
		       ]
	});
	
	Ext.i_cal_method_only = new Ext.data.JsonStore({
		fields: ["id", "c_name"],
		data : [
		        { id : "1", c_name : "ยอดรวมของ ผลต่าง เดบิต-เครดิต" },
		        { id : "2", c_name : "ยอดรวมของ ผลต่าง เครดิต-เดบิต" },
		       ]
	});  
	
	// pagingBar
	pagingBar = new Ext.PagingToolbar({
		pageSize: 20,
		store: Ext.store,
		displayInfo: true,
		displayMsg: "Displaying topics {0} - {1} of {2}"
	});
	
	// ============================================================ //
	
	function DisbledButton(t){
	    //Disabled etc...
	    if( t ) {
	        Ext.getCmp("icon-save").hide();
	    } else {
	        Ext.getCmp("icon-save").show();
	    }
	}
	
	function controllTab(record,butt) {
		
		Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; //null obj not errer
		
		var frmAdd	= new formAdd();
		
		if( butt == "add" ) {
			
			Ext.getCmp("contenterCenter").add(frmAdd);
			Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
			Ext.getCmp("role-form-mode").setValue("ADD");
			
		} else if( butt == "edit" || butt == "view" ) {
			
	        Ext.getCmp("contenterCenter").add(frmAdd); 
	        Ext.getCmp("contenterCenter").setActiveTab(frmAdd);  
	        Ext.getCmp("role-form-mode").setValue("EDIT");
	        Ext.getCmp("form-widgets").getForm().loadRecord(record);
	        
	        if( butt == "view" ) { DisbledButton(true); }
	        else { DisbledButton(false); }
	        
	    } else if( butt == "remove" ) {
	    	
	    	new Ext.Window({
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
	    					url: "api/mn_GlRepAccName.php",
	    					params : {
	    						mode: "DELETE",
	    						id: record.get("id")
	    					},
	    					method: "POST", //POST
	    					success: function ( result, request ) {
	    						var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
	    						if (jsonData.success == true) {
	    							Ext.getCmp("win-msg-delete").destroy();						// clear memory :: garbage collection
	    							Ext.store.reload();
	    						} else {
	    							Ext.MessageBox.alert('Failed', jsonData.msg);			// alert massage error
	    						}
	    					},
	    					failure: function ( result, request) {
	    						Ext.MessageBox.alert('Failed', result.responseText);		// connect error
	    					}
	    				});
	    			}
	    		}, {
	    			text : "Cancel",
	    			handler : function() {
	    				Ext.getCmp("win-msg-delete").destroy();
	    				Ext.store.reload();
	    			}
	    		}]
	    	}).show();
	    	
	    }
	}; // controllTab
	
	//Class Extend
	formAdd	 = function() {

		formAdd.superclass.constructor.call(this, {
			region: "center",
			title: "ข้อมูล"+title_panel,
			id: "frm-Add",
			border: false,
			stripeRows: true,
			loadMask: true,
			listeners:{
				afterrender: function( obj, eOpts ){ /*console.log('Load Finish'); */},
			},
			items: [{
				xtype: "form",
				id: "form-widgets",
				frame: true,
				labelAlign: "right",
				labelWidth: 150,
				bodyStyle: { padding: "10px 20px" },
				defaults: { anchor: "100%", msgTarget: "side", allowBlank: false },
				items: [{
					xtype: "container",
					layout: "hbox",
					align: "stretch",
					RemoveHeight: true,
					defaults: { xtype: "fieldset", flex:1, margins : "0px 3px", autoHeight: true },
					items: [{
						title: "บันทึกข้อมูล "+title_panel,
						RemoveCls: "x-box-item",
						collapsible: true,
						collapsed: false,
						defaults: { labelStyle : "width:150px;", allowBlank: true },
						items: [{
							id: "role-form-mode",
							xtype: "hidden",
							name: "mode",
							readOnly: true
						}, {
							xtype: "hidden",
							name: "id",
							id: "id",
							readOnly: true
						}, {
							fieldLabel: "รหัส",
							xtype: "displayfield",
							name: "c_code"
						}, {
							fieldLabel: "ชื่อรายงานตามบัญชี",
							xtype: "textfield",
							id: "c_name",
							name: "c_name",
							width: 300
						}, {
							fieldLabel: "คำอธิบายเพิ่มเติม",
							xtype: "textarea",
							id: "c_comment",
							name: "c_comment",
							width: 300
						}, new Ext.form.ComboBox({
							fieldLabel: "ระดับหัวข้อ",
							id: "i_level_dtl",
							name: "i_level_dtl",
							store: Ext.i_level_dtl,
							valueField: "id",
							displayField: "c_name",
							mode: "local",
							triggerAction: "all",
							emptyText: "กรุณาเลือก...",
							width: 300,
							forceSelection: true,
							selectOnFocus: true,
							typeAhead: false,
							value: "1",
							listeners: {
								beforequery: function(q) {
									if (q.query) {
										var length = q.query.length;
										q.query = new RegExp(Ext.escapeRe(q.query));
										q.query.length = length;
									}
								},
								blur: function() { this.getStore().clearFilter(); }
							}
						}), new Ext.form.ComboBox({
							fieldLabel: "ประเภทการแสดงผล",
							id: "i_money",
							name: "i_money",
							store: Ext.i_money,
							valueField: "id",
							displayField: "c_name",
							mode: "local",
							triggerAction: "all",
							emptyText: "กรุณาเลือก...",
							width: 300,
							forceSelection: true,
							selectOnFocus: true,
							typeAhead: false,
							value: "1",
							listeners: {
								"select": function (combo) { 
									
									if( Ext.getCmp("i_money").value == 3 ){  
										Ext.getCmp("i_process").bindStore(Ext.i_process_only);
										Ext.getCmp("i_process").setValue(2); 
										
										Ext.getCmp("cal_group1").bindStore(Ext.i_cal_method); 
										Ext.getCmp("cal_group2").bindStore(Ext.i_cal_method); 
										Ext.getCmp("cal_group3").bindStore(Ext.i_cal_method); 
										Ext.getCmp("cal_group4").bindStore(Ext.i_cal_method); 
										Ext.getCmp("cal_group5").bindStore(Ext.i_cal_method); 
										Ext.getCmp("cal_group1").setValue(3);
										Ext.getCmp("cal_group2").setValue(3);
										Ext.getCmp("cal_group3").setValue(3);
										Ext.getCmp("cal_group4").setValue(3);
										Ext.getCmp("cal_group5").setValue(3);
										
									} else { 
										Ext.getCmp("i_process").bindStore(Ext.i_process_all); 
									}
									
									if( Ext.getCmp("i_process").value == 1 ) {  
										
										Ext.getCmp("cal_group1").bindStore(Ext.i_cal_method_only);
										Ext.getCmp("cal_group2").bindStore(Ext.i_cal_method_only);
										Ext.getCmp("cal_group3").bindStore(Ext.i_cal_method_only);
										Ext.getCmp("cal_group4").bindStore(Ext.i_cal_method_only);
										Ext.getCmp("cal_group5").bindStore(Ext.i_cal_method_only);
										
										Ext.getCmp("cal_group1").setValue(1);
										Ext.getCmp("cal_group2").setValue(1);
										Ext.getCmp("cal_group3").setValue(1);
										Ext.getCmp("cal_group4").setValue(1);
										Ext.getCmp("cal_group5").setValue(1);
	 
									} else if( Ext.getCmp("i_money").value == 3 ) {
									} else { 
										Ext.getCmp("cal_group1").bindStore(Ext.i_cal_method_all); 
										Ext.getCmp("cal_group2").bindStore(Ext.i_cal_method_all); 
										Ext.getCmp("cal_group3").bindStore(Ext.i_cal_method_all); 
										Ext.getCmp("cal_group4").bindStore(Ext.i_cal_method_all); 
										Ext.getCmp("cal_group5").bindStore(Ext.i_cal_method_all);
									}
								}
							}
						}), new Ext.form.ComboBox({
							fieldLabel: "สถานะข้อมูล",
							id: "i_process",
							name: "i_process",
							store: Ext.i_process_all,
							valueField: "id",
							displayField: "c_name",
							mode: "local",
							triggerAction: "all",
							emptyText: "กรุณาเลือก...",
							width: 300,
							forceSelection: true,
							selectOnFocus: true,
							typeAhead: false,
							value: "1",
							listeners: {
								"select": function (combo) { 
									if( combo.value == 1 ) {  
										
										Ext.getCmp("cal_group1").bindStore(Ext.i_cal_method_only);
										Ext.getCmp("cal_group2").bindStore(Ext.i_cal_method_only);
										Ext.getCmp("cal_group3").bindStore(Ext.i_cal_method_only);
										Ext.getCmp("cal_group4").bindStore(Ext.i_cal_method_only);
										Ext.getCmp("cal_group5").bindStore(Ext.i_cal_method_only);
										
										Ext.getCmp("cal_group1").setValue(1);
										Ext.getCmp("cal_group2").setValue(1);
										Ext.getCmp("cal_group3").setValue(1);
										Ext.getCmp("cal_group4").setValue(1);
										Ext.getCmp("cal_group5").setValue(1);
										
									} else {
										Ext.getCmp("cal_group1").bindStore(Ext.i_cal_method_all);
										Ext.getCmp("cal_group2").bindStore(Ext.i_cal_method_all);
										Ext.getCmp("cal_group3").bindStore(Ext.i_cal_method_all);
										Ext.getCmp("cal_group4").bindStore(Ext.i_cal_method_all);
										Ext.getCmp("cal_group5").bindStore(Ext.i_cal_method_all);
									}
								}
							}
						}), {
							xtype: "compositefield",
							fieldLabel: "คำนวณ แยกหมวดบัญชี",
							anchor: "100%",
							msgTarget: "under",
							items: [{
								xtype: "checkbox",
								id: "chk_group1",
								name: "chk_group1",
								boxLabel: "หมวด 1 - สินทรัพย์",
								width: 150,
								checked: false,
								inputValue: 1
							},
							new Ext.form.ComboBox({
								id: "cal_group1",
								name: "cal_group1",
								store: Ext.i_cal_method_only,
								valueField: "id",
								displayField: "c_name",
								mode: "local",
								triggerAction: "all",
								emptyText: "กรุณาเลือก...",
								width: 300,
								forceSelection: true,
								selectOnFocus: true,
								typeAhead: false,
								value: "1",
								listeners: {
									beforequery: function(q) {
										if (q.query) {
											var length = q.query.length;
											q.query = new RegExp(Ext.escapeRe(q.query));
											q.query.length = length;
										}
									},
									blur: function() { this.getStore().clearFilter(); }
								}
							})]
		                }, {
							xtype: "compositefield",
							anchor: "100%",
							msgTarget: "under",
							items: [{
								xtype: "checkbox",
								id: "chk_group2",
								name: "chk_group2",
								boxLabel: "หมวด 2 - หนี้สิน",
								checked: false,
								width: 150,
								inputValue: 1
							},
							new Ext.form.ComboBox({
								id: "cal_group2",
								name: "cal_group2",
								store: Ext.i_cal_method_only,
								valueField: "id",
								displayField: "c_name",
								mode: "local",
								triggerAction: "all",
								emptyText: "กรุณาเลือก...",
								width: 300,
								forceSelection: true,
								selectOnFocus: true,
								typeAhead: false,
								value: "1",
								listeners: {
									beforequery: function(q) {
										if (q.query) {
											var length = q.query.length;
											q.query = new RegExp(Ext.escapeRe(q.query));
											q.query.length = length;
										}
									},
									blur: function() { this.getStore().clearFilter(); }
								}
							})]
		                }, {
							xtype: "compositefield",
							anchor: "100%",
							msgTarget: "under",
							items: [{
								xtype: "checkbox",
								id: "chk_group3",
								name: "chk_group3",
								boxLabel: "หมวด 3 - ส่วนของผู้ถือหุ้น",
								checked: false,
								width: 150,
								inputValue: 1
							},
							new Ext.form.ComboBox({
								id: "cal_group3",
								name: "cal_group3",
								store: Ext.i_cal_method_only,
								valueField: "id",
								displayField: "c_name",
								mode: "local",
								triggerAction: "all",
								emptyText: "กรุณาเลือก...",
								width: 300,
								forceSelection: true,
								selectOnFocus: true,
								typeAhead: false,
								value: "1",
								listeners: {
									beforequery: function(q) {
										if (q.query) {
											var length = q.query.length;
											q.query = new RegExp(Ext.escapeRe(q.query));
											q.query.length = length;
										}
									},
									blur: function() { this.getStore().clearFilter(); }
								}
							})]
		                }, {
							xtype: "compositefield",
							anchor: "100%",
							msgTarget: "under",
							items: [{
								xtype: "checkbox",
								id: "chk_group4",
								name: "chk_group4",
								boxLabel: "หมวด 4 - รายได้",
								checked: false,
								width: 150,
								inputValue: 1
							},
							new Ext.form.ComboBox({
								id: "cal_group4",
								name: "cal_group4",
								store: Ext.i_cal_method_only,
								valueField: "id",
								displayField: "c_name",
								mode: "local",
								triggerAction: "all",
								emptyText: "กรุณาเลือก...",
								width: 300,
								forceSelection: true,
								selectOnFocus: true,
								typeAhead: false,
								value: "1",
								listeners: {
									beforequery: function(q) {
										if (q.query) {
											var length = q.query.length;
											q.query = new RegExp(Ext.escapeRe(q.query));
											q.query.length = length;
										}
									},
									blur: function() { this.getStore().clearFilter(); }
								}
							})]
		                }, {
							xtype: "compositefield",
							anchor: "100%",
							msgTarget: "under",
							items: [{
								xtype: "checkbox",
								id: "chk_group5",
								name: "chk_group5",
								boxLabel: "หมวด 5 - ค่าใช้จ่าย",
								checked: false,
								width: 150,
								inputValue: 1
							},
							new Ext.form.ComboBox({
								id: "cal_group5",
								name: "cal_group5",
								store: Ext.i_cal_method_only,
								valueField: "id",
								displayField: "c_name",
								mode: "local",
								triggerAction: "all",
								emptyText: "กรุณาเลือก...",
								width: 300,
								forceSelection: true,
								selectOnFocus: true,
								typeAhead: false,
								value: "1",
								listeners: {
									beforequery: function(q) {
										if (q.query) {
											var length = q.query.length;
											q.query = new RegExp(Ext.escapeRe(q.query));
											q.query.length = length;
										}
									},
									blur: function() { this.getStore().clearFilter(); }
								}
							})]
		                }, {
		                	xtype: "checkbox",
							fieldLabel: "สถานะ",
							id: "i_enable",
							name: "i_enable",
							boxLabel: "ใช้งาน",
							checked: true,
							inputValue: 1
						}]
					}]
				}],
				buttonAlign: "left",
				buttons: [{
					text : "&nbsp;"+Ext.GLOBAL_BU_SAVE_TH+"&nbsp;",
					id: "icon-save",
					iconCls	: "icon-save",
					handler : function() {
						
						var msg				= "";
						
						if(Ext.getCmp("c_name").getValue() == "") { msg	+= "- กรุณากรอก ชื่อรายงานตามบัญชี<br>"; }
						if(Ext.getCmp("i_level_dtl").getValue() == "") { msg	+= "- กรุณาเลือก ระดับหัวข้อ<br>"; }
						if(Ext.getCmp("i_money").getValue() == "") { msg	+= "- กรุณาเลือก ประเภทการแสดงผล<br>"; }
						if(Ext.getCmp("i_process").getValue() == "") { msg	+= "- กรุณาเลือก สถานะข้อมูล<br>"; }
						
						if(Ext.getCmp("chk_group1").checked) {
							if(Ext.getCmp("cal_group1").getValue() <= 0) { msg += "- กรุณาเลือก บัญชีหมวด 1<br>"; }
						}
						if(Ext.getCmp("chk_group2").checked) {
							if(Ext.getCmp("cal_group2").getValue() <= 0) { msg += "- กรุณาเลือก บัญชีหมวด 2<br>"; }
						}
						if(Ext.getCmp("chk_group3").checked) {
							if(Ext.getCmp("cal_group3").getValue() <= 0) { msg += "- กรุณาเลือก บัญชีหมวด 3<br>"; }
						}
						if(Ext.getCmp("chk_group4").checked) {
							if(Ext.getCmp("cal_group4").getValue() <= 0) { msg += "- กรุณาเลือก บัญชีหมวด 4<br>"; }
						}
						if(Ext.getCmp("chk_group5").checked) {
							if(Ext.getCmp("cal_group5").getValue() <= 0) { msg += "- กรุณาเลือก บัญชีหมวด 5<br>"; }
						}
						
						if (msg == "") {

							Ext.getCmp("frm-Add").getEl().mask("Please wait...", "x-mask-loading");
							Ext.Ajax.request({
								url: "api/mn_GlRepAccName.php",
								method: "POST",
								params: {
									mode: Ext.getCmp("role-form-mode").getValue(),
									id: Ext.getCmp("id").getValue(),
									c_name: Ext.getCmp("c_name").getValue(),
									c_comment: Ext.getCmp("c_comment").getValue(),
									i_level_dtl: Ext.getCmp("i_level_dtl").getValue(),
									i_money: Ext.getCmp("i_money").getValue(),
									i_process: Ext.getCmp("i_process").getValue(),
									chk_group1: (Ext.getCmp("chk_group1").checked)? 1 : 0,
									chk_group2: (Ext.getCmp("chk_group2").checked)? 1 : 0,
									chk_group3: (Ext.getCmp("chk_group3").checked)? 1 : 0,
									chk_group4: (Ext.getCmp("chk_group4").checked)? 1 : 0,
									chk_group5: (Ext.getCmp("chk_group5").checked)? 1 : 0,
									cal_group1: (Ext.getCmp("chk_group1").checked)? Ext.getCmp("cal_group1").getValue() : 0,
									cal_group2: (Ext.getCmp("chk_group2").checked)? Ext.getCmp("cal_group2").getValue() : 0,
									cal_group3: (Ext.getCmp("chk_group3").checked)? Ext.getCmp("cal_group3").getValue() : 0,
									cal_group4: (Ext.getCmp("chk_group4").checked)? Ext.getCmp("cal_group4").getValue() : 0,
									cal_group5: (Ext.getCmp("chk_group5").checked)? Ext.getCmp("cal_group5").getValue() : 0,
									i_enable: (Ext.getCmp("i_enable").checked)? 1 : 2,
								},
								success: function ( result, request ) {
									Ext.getCmp("frm-Add").getEl().unmask();
									var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
									if (jsonData.success == true) {
											Ext.store.load();
											Ext.Msg.alert("แจ้งเตือน", "บันทึกเรียบร้อย");
											Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-Add'), true) || {};
									} else { Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg); }
								},
								failure: function ( result, request) { 
									Ext.MessageBox.alert("Failed", result.responseText);		// connect error
								}
							});
						} else { Ext.Msg.alert("แจ้งเตือน", msg); }
					}
				}, {
					text: Ext.GLOBAL_BU_BACK_TH,
					handler: function() {
						Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
					}
				}]
			}]
		});
	}; // formAdd
	Ext.extend(formAdd, Ext.Panel, {}); 
	
	//============================== cellClick ==============================//
	cellClick	= function( grid, rowIndex, columnIndex, e ) {
		
		var record = grid.getStore().getAt(rowIndex);
		
		if (columnIndex == grid.getColumnModel().getIndexById("view")) {
			controllTab(record, "view");
		} else if (columnIndex == grid.getColumnModel().getIndexById("edit")) {
			controllTab(record, "edit");
		} else if (columnIndex == grid.getColumnModel().getIndexById("remove")) {
			controllTab(record, "remove");
		}
	}; //cellClick
	
	// ================================ gridMain ================================ //
	gridMain = new Ext.grid.GridPanel({
		region: "center",
		layout: "fit",
		title: "แสดงรายการ"+title_panel,
		id: "tabpanel1",
		border: false,
		stripeRows: true,
		loadMask: true,
		store: Ext.store,
		viewConfig : {
			emptyText: "ไม่มีข้อมูล..",
			deferEmptyText: false
		},
		tbar: [{ // กล่องค้นหาข้อมูล 1
			xtype: "buttongroup",
			title: "ระบุเงื่อนไขในการค้นหาข้อมูล",
			columns: 1,
            defaults: { scale: "small", style: "float: right" },
            items: [{ // แถวที่ 1
            	xtype: "buttongroup",
            	frame: false,
            	items: [{ xtype: "label", text: "ค้นหาโดย : " }, { xtype: "tbspacer", width: 4 }, {
	            	id: "filter",
            		xtype: "combo",
		            width: 160,
					mode: "local",
		            store: new Ext.data.SimpleStore({
		            	fields: [ "value", "text" ],
						data: [
						       [ "c_name", "ชื่อรายงานตามบัญชี" ]
						]
					}),
					value: "c_name",
					valueField: "value",
					displayField: "text",
					allowBlank: false,
					editable: false,
					triggerAction: "all",
					typeAhead : false
				}, { xtype: "tbspacer", width: 4 }, {
            		xtype: "textfield",
            		id: "value-box",
            		width: 200,
           			fieldLabel: "fieldLabel",
           			emptyText: "คำที่ต้องการค้นหา"
           		}]
            }],
            buttonAlign: "left",
			buttons:[{
				text : "เพิ่มข้อมูล",
				id: "buAdd",
				iconCls: "icon-add",
				handler: function(grid, rowIndex, colIndex) { controllTab({}, "add"); }
			}, { xtype: "tbfill" }, {
				text : "ค้นหา",
				iconCls: "icon-magnifier",
    			handler : function() {
    				
    				var msg	= "";
    				
    				if(msg == "") {
						if(Ext.getCmp("value-box").getValue() != "") {
							Ext.store.setBaseParam("value", Ext.getCmp("value-box").getValue());
							Ext.store.setBaseParam("filter", Ext.getCmp("filter").getValue());
						} else {
							Ext.store.setBaseParam("value", "");
							Ext.store.setBaseParam("filter", "");
						}
						
						Ext.store.setBaseParam("mode", "SEARCH");
						Ext.store.load();
						
    				} else { Ext.Msg.alert("แจ้งเตือน", msg); }
    			}
			}]
		}],
		columns: [
		    new Ext.grid.RowNumberer({header:"ที่", width: 30,
				renderer: function(value, metaData, record, row, col, store, gridView) {
					return record.get("no");
				}
			}),
			{ header: "ID System", sortable: true, hidden:true, dataIndex: "id" },
			{ header: "รหัส", sortable: true, align:"center", dataIndex: "c_code" },
			{ id: "c_name", header: "ชื่อรายงานตามบัญชี", sortable: true, dataIndex: "c_name" },
			{ header: "สถานะ", sortable:false, align: "center", width: 50,
				renderer: function(value, metaData, record, row, col, store, gridView) {
					if(record.get("i_enable") == 1) {
						return "<img src=\"../images/icons/yes.gif\");/>";
					} else {
						return "<img src=\"../images/icons/no.gif\");/>";
					}
				}
			},
			{ header: "ผู้แก้ไขรายการ", sortable: true, dataIndex: "dc_user_update_id" },
			{ header: "วันที่แก้ไข", sortable: true, align: "center", renderer:shortThaiDate, dataIndex: "d_update" },
			{ header: "หน่วยงานที่แก้ไข", sortable: true, dataIndex: "dc_user_update_cost_id" },
			{ id: "view", header: "แสดง", sortable:false, align: "center", width: 100, dataIndex: "id",
				renderer: function(value, metaData, record, row, col, store, gridView) {
					return "<img src=\"../images/icons/magnifier2.png\"); style=\"cursor:pointer\"/>";
				}
			},
			{ id: "edit", header: "แก้ไข", sortable: true, align: "center", dataIndex: "id",
				renderer: function(value, metaData, record, row, col, store, gridView) {
					return "<img src=\"../images/icons/document_edit.gif\"); style=\"cursor:pointer\"/> แก้ไข";
				}
			},
			{ id: "remove", header: "ลบ", sortable: true, align: "center", dataIndex: "id",
				renderer: function(value, metaData, record, row, col, store, gridView) {
						return "<img src=\"../images/icons/document_delete.gif\"); style=\"cursor:pointer\"/> ลบ";
				}
			}
		],
		autoExpandColumn: "c_name",
		bbar: pagingBar
	}); //gridMain

	/*====================== CENTER ======================*/
	var center = new Ext.TabPanel({
		region: "center",
		border: false,
		//activeTab: 0, //default Tab
		id: "contenterCenter",
		defaults:{ autoScroll: true }, 
		items: [ gridMain ]
	});
	
	// SET ref Grid&Tab
	Ext.getCmp("tabpanel1").on("cellclick", cellClick, this);

	// SetTab Controller Loads
	Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
	/*====================== RENDER ======================*/
	new Ext.Viewport({
		layout: "border",
		items: [ center ]
	});
});