function checkAll(ele) {
	for(var i=1; i<Ext.objChk.length; i++){
		var ind = Ext.objChk[i];
		if (ind != "") {
			if(document.getElementById(ind)){
				document.getElementById(ind).checked = ele;
			};
		}
	}
};

Ext.onReady(function() {
	Ext.QuickTips.init();
	Ext.objChk	= [];

	/*===============================================*/
	var title_panel	= "ข้อมูล Segment บัญชีบริหาร";
	/*===============================================*/

	Ext.store = new Ext.data.JsonStore({
		storeId: "myStore",
	    autoDestroy: true,
		autoLoad: true,
	    url: "api/List_AE00002.php",
	    baseParams: { type: "vw_gl_dc_group_admin_hdr", i_read: user_right_read }, //Permission i_read
	    root: "data",
	    idProperty: "id",
		totalProperty: "totalCount",
		fields: [
			{ name : "no" },
			{ name : "id" }, 
			{ name : "c_code" },
			{ name : "c_name" },
			{ name : "c_comment" },
			{ name : "i_enable" },
			{ name : "dc_user_create_id" },
			{ name : "dc_user_create_cost_id" },
			{ name : "d_create" },
			{ name : "dc_user_update_id" },
			{ name : "dc_user_update_cost_id" },
			{ name : "d_update" }
		]
	});
	
	Ext.storeCost = new Ext.data.JsonStore({
		autoLoad: true,
		url: "api/List_AE00002.php",
		baseParams: { type: "vw_dc_cost" },
	    root: 'data',
	    idProperty: 'id',
		totalProperty: 'totalCount',
		fields: [
			{ name: 'no' },
			{ name: 'id' },
			{ name: 'c_code',  },
			{ name: 'c_name',   },
			{ name: 'c_acc_name',  }, 
			{ name: 'i_chk',  }
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
	    if(t){
	        Ext.getCmp('icon-save').hide();
	    }else{
	        Ext.getCmp('icon-save').show();
	    }
	}
	
	function controllTab(record,butt) {
		
		Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-Add'), true) || {}; //null obj not errer
		
		var frmAdd	= new formAdd();
		
		if( butt == 'add' ) {
			
			Ext.storeCost.setBaseParam("id","");
			Ext.storeCost.load();
			
			Ext.getCmp('contenterCenter').add(frmAdd);
			Ext.getCmp('contenterCenter').setActiveTab(frmAdd);
			Ext.getCmp('role-form-mode').setValue('ADD');
			
		} else if( butt=='edit' || butt=='view' ) {
			
			Ext.storeCost.setBaseParam("id",record.id);
			Ext.storeCost.load();
			
	        Ext.getCmp('contenterCenter').add(frmAdd); 
	        Ext.getCmp('contenterCenter').setActiveTab(frmAdd);  
	        Ext.getCmp('role-form-mode').setValue('EDIT');
	        Ext.getCmp('form-widgets').getForm().loadRecord(record);
	        
	        if(butt=='view') { DisbledButton(true); }
	        else { DisbledButton(false); }
	        
	    } else if( butt=='remove' ) {
	    	
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
	    					url : 'api/mn_AE00002.php',
	    					params : {
	    						mode : 'DELETE',
	    						id : record.get('id')
	    					},
	    					method: 'GET', //POST
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
			layout: 'column',
			items: [{
				xtype: "form",
				id: "form-widgets",
				frame: true,
				labelAlign: "right",
				labelWidth: 150,
				columnWidth: 0.5,
				bodyStyle: { padding: "10px 20px" },
				defaults: { anchor: "100%", msgTarget: "side", allowBlank: true },
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
					fieldLabel: 'เลขที่ Segment บัญชีบริหาร',
					xtype: 'textfield',
					name: 'c_code', 
					disabled:true
				}, {
					fieldLabel: 'ชื่อ Segment บัญชีบริหาร',
					xtype: 'textfield',
					id: 'c_name',
					name: 'c_name'
				}, {
					fieldLabel: 'คำอธิบายเพิ่มเติม',
					xtype: 'textfield',
					id:'c_comment',
					name:'c_comment'
				}, {
					fieldLabel: 'สถานะการใช้งาน',
					xtype: 'radiogroup',
					id: "i_enable",
					columns: [ 80, 100 ],
					items: [
                        { boxLabel: 'ใช้งาน', checked: true, name: 'i_enable', inputValue: Ext.CONF_STATUS_ENABLE },
                        { boxLabel: 'ไม่ใช้งาน', name: 'i_enable', inputValue: Ext.CONF_STATUS_DISABLE }
					]
				}],
				buttonAlign: 'left',
				buttons: [{
					text : "&nbsp;"+Ext.GLOBAL_BU_SAVE_TH+"&nbsp;",
					id: "icon-save",
					iconCls	: "icon-save",
					handler : function() {
						
						var msg		= "";
	       				var check	= false;
	       				var jsonArr = [];

	    				if(Ext.getCmp("c_name").getValue() == "") { msg += "- กรุณากรอก ชื่อ Segment บัญชีบริหาร<br>"; }
	       				
	       				$( "input[id^=chk]" ).each(function( i, val ) {
	       					if(val.checked == true) {
	       						check	= true;
	       						jsonArr.push({ dc_cost_id: val.value });
	       					}
	    				});
	       				
	    				if( check == false ) { msg += "- กรุณาเลือกหน่วยงาน อย่างน้อย 1 รายการ<br>"; }
	    				
	    				if( msg == "" ) {

	    					Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");					        					
	    					$.ajax({
								url: "api/mn_AE00002.php",
								type: "POST",
								data: {
									mode: Ext.getCmp("role-form-mode").getValue(),
									id: Ext.getCmp("id").getValue(),
									c_name: Ext.getCmp("c_name").getValue(),
									c_comment: Ext.getCmp("c_comment").getValue(),
									i_enable: Ext.getCmp("i_enable").getValue().inputValue,
									data: JSON.stringify(jsonArr)
								},
								success: function(result) {
									Ext.getCmp("contenterCenter").getEl().unmask();
									var data = $.parseJSON( result );
									if( data.success == true ) {
										Ext.Msg.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย");
										Ext.store.load();
										Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-Add'), true) || {};
									}
								}
							});

	    				} else { Ext.Msg.alert("แจ้งเตือน", msg); }
	    				
					}
				}, {
					text: Ext.GLOBAL_BU_BACK_TH,
					handler: function() {
						Ext.getCmp('contenterCenter').remove(Ext.getCmp('frm-Add'), true) || {};
					}
				}]
			}, { 
				columnWidth: 0.5,
				height:450,
	            layout: 'fit',
	            store: Ext.storeCost,
	            xtype: 'grid',
	    		id:'tabpanel12',
	    		border: false,
	    		stripeRows: true,
	    		loadMask: true, 
	    		autoScroll:true,
				columns:[new Ext.grid.RowNumberer({header:"ที่", width: 30,
					renderer: function(value, metaData, record, row, col, store, gridView) {
						return record.get("no");
					}
				}),
				{ header: "<div class='topAlign'><input type='checkbox' onclick='checkAll(this.checked)'></div>",
					align: 'center', width: 50, dataIndex: 'i_chk',
					renderer: function(value, metaData, record, row, col, store, gridView) {
						
						Ext.objChk[record.get('no')] = 'chk['+record.get('id')+']';
						
						return '<input type="checkbox" id="chk['+record.get('id')+']" value="'+record.get('id')+'"'+((value)?'checked':'')+' >';
					}
				},
				{ header: "รหัส", width:100, sortable: true, dataIndex: 'c_code' },
				{ id: 'c_name',header: "ชื่อหน่วยงาน", width:155, sortable: true, dataIndex: 'c_name' },
				{ header: "ศูนย์ต้นทุนทางบัญชี",width:155, sortable: true, dataIndex: 'c_acc_name' }],
				autoExpandColumn: "c_name"
			}]
		});
	}; // formAdd
	Ext.extend(formAdd, Ext.Panel, {}); 
	
	//============================== cellClick ==============================//
	cellClick	= function( grid, rowIndex, columnIndex, e ) {
		
		var record = grid.getStore().getAt(rowIndex);
		
		if (columnIndex == grid.getColumnModel().getIndexById("view")) {
			controllTab(record, 'view');
		} else if (columnIndex == grid.getColumnModel().getIndexById("edit")) {
			controllTab(record, 'edit');
		} else if (columnIndex == grid.getColumnModel().getIndexById("remove")) {
			controllTab(record, 'remove');
		}
	}; //cellClick
	
	//================================ gridMain ================================//
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
						       [ 'c_code', "เลขที่ Segment บัญชีบริหาร" ],
								[ 'c_name', "ชื่อ Segment บัญชีบริหาร" ]
						]
					}),
					value: "c_code",
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
				handler: function(grid, rowIndex, colIndex) { controllTab({}, 'add'); }
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
			{ header: "เลขที่ Segment บัญชีบริหาร", width:155, sortable: true, align: "center", dataIndex: 'c_code' },
			{ id: 'c_name', header: "ชื่อ Segment บัญชีบริหาร", sortable: true, dataIndex: 'c_name' },
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
					return "<img src=\"../images/icons/application_osx_go.png\"); style=\"cursor:pointer\"/>";
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