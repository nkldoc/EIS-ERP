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
	var title_panel	= "ตัดจ่ายโดยรวม";
	/*===============================================*/
	
	store = new Ext.data.JsonStore({
		storeId: "myStore",
	    autoDestroy: true,
		autoLoad: false,
	    url: "api/List_Cm00011.php",
	    baseParams: { type: "cm_voucher_one", i_read: user_right_read }, //Permission i_read
	    root: "data",
	    idProperty: "id",
		totalProperty: "totalCount",
		fields: [
			{ name : "no" },
			{ name : "id" },
			{ name : "c_code_pv" },
			{ name : "c_code_ap" },
			{ name : "d_doc_date_pv" },
			{ name : "c_code" },
			{ name : "d_doc_date" },
			{ name : "name_vch_type" },
			{ name : "f_total_cost" },
			{ name : "c_cancel" },
			{ name : "c_code_gl" },
			{ name : "dc_user_create" },
			{ name : "dc_user_create_cost" },
			{ name : "d_create" },
			{ name : "dc_user_update" },
			{ name : "d_update" },
			{ name : "dc_user_update_cost" }
		]
	});
	
	store_cm_pay_type	= new Ext.data.JsonStore({
		autoLoad: true,
		url: "api/All_Cm00011.php",
		baseParams: { type: "cm_pay_type", show: "all" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ],
	    listeners: {
	    	load: function(t, records, options) { Ext.getCmp( "s_cm_pay_type_id" ).setValue( "99" ); },
//			beforeload: function(t, records, options) { this.chkMask = false; initData(); },
//			datachanged: function(t, records, options) { this.chkMask = true; initData(); },
		}
	});

	// pagingBar
	pagingBar = new Ext.PagingToolbar({
		pageSize: 20,
		store: store,
		displayInfo: true,
		displayMsg: "Displaying topics {0} - {1} of {2}",
		listeners: {
			change : function( val, pageData ) {

				var myStores	= this.store.data.items;
				
				Ext.each( myStores , function( record ) {
					
					if( record.get("c_code_pv") == "" ) {
						
						new Ext.form.DateField({
							id: "d_doc_date_pv["+record.get("id")+"]",
							width: 100,
							value: ( record.get("d_doc_date_pv") != "" )? record.get("d_doc_date_pv") : addY(543), 
							renderTo: "Ext_date_pv["+record.get("id")+"]"
			            });
						
		    		}
					
				});
			}
		}
	});
	
	//================================ gridMain ================================//
	gridMain = new Ext.grid.GridPanel({
		region: "center",
		layout: "fit",
		title: "แสดงรายการ"+title_panel,
		id: "tabpanel1",
		border: false,
		stripeRows: true,
		loadMask: true,
		store: store,
		viewConfig : { emptyText: "ไม่มีข้อมูล..", deferEmptyText: false },
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
		            width: 150,
					mode: "local",
		            store: new Ext.data.SimpleStore({
		            	fields: [ "value", "text" ],
						data: [
						       [ "c_code_pv", "เลขที่ใบสำคัญจ่าย (PV)" ],
						       [ "c_code", "เลขที่ใบสำคัญจ่าย (PRE)" ]
						]
					}),
					value: "c_code_pv",
					valueField: "value",
					displayField: "text",
					allowBlank: false,
					editable: false,
					triggerAction: "all",
					typeAhead : false
				}, { xtype: "tbspacer", width: 4 }, {
            		xtype: "textfield",
            		id: "value-box",
            		width: 136,
           			fieldLabel: "fieldLabel",
           			emptyText: "คำที่ต้องการค้นหา"
           		}]
            }, { // แถวที่ 2
            	xtype: "buttongroup",
            	frame: false,
            	items: [{ xtype: "label", text: "วันที่จัดทำใบสำคัญจ่าย ระหว่างวันที่ : " }, { xtype: "tbspacer", width: 4 }, {
            		id: "d_doc_date1", xtype: "datefield", width: 122, 
    				listeners : {
						afterrender : function() {
							var date = new Date();
								date = new Date(date.getFullYear()+543, date.getMonth()-2, 1);
							this.setValue(date);
						}
					}
            	}, { xtype: "tbspacer", width: 5 }, { xtype: "label", text: "ถึงวันที่ : " }, { xtype: "tbspacer", width: 4 }, {
            		id: "d_doc_date2", xtype: "datefield", width: 122, 
    				listeners: {
						afterrender : function() {
							this.setValue(addY(543));
						}
					}
            	}]
            }, { // แถวที่ 3
            	xtype: "buttongroup",
            	frame: false,
            	items: [{ xtype: "label", text: "ประเภทการจ่ายเงิน : " }, { xtype: "tbspacer", width: 4 },
	            	new Ext.form.ComboBox({
						id: "s_cm_pay_type_id",
						width: 290,
						mode: "local",
					    store: store_cm_pay_type,
						value: "99",
						valueField: "id",
						displayField: "c_name",
						triggerAction: "all",
						forceSelection: true,
						selectOnFocus: true,
						typeAhead : false,
						emptyText: "กรุณาเลือก...",
						listeners: {
							"change": function (combo, newValue) {
								if (newValue == "") { combo.reset(); }
							},
							beforequery: function(q) {
								if (q.query) {
									var length = q.query.length;
									q.query = new RegExp(Ext.escapeRe(q.query));
									q.query.length = length;
								}
							},
							blur: function() { this.getStore().clearFilter(); }
						}
					})
            	]
            }, { // แถวที่ 4
            	xtype: "buttongroup",
            	frame: false,
            	items: [{ xtype: "label", text: "เพิ่มเงื่อนไขค้นหาด้วย : " }, { xtype: "tbspacer", width: 4 }, {
					xtype: "checkbox",
					id: "chk_date_pv",
					checked: false,
					inputValue: 1
				}, { xtype: "tbspacer", width: 270 }]
            }, { // แถวที่ 5
            	xtype: "buttongroup",
            	frame: false,
            	items: [{ xtype: "label", text: "วันที่ใบสำคัญจ่าย (PV) ระหว่างวันที่ : " }, { xtype: "tbspacer", width: 4 }, {
            		id: "d_doc_date_pv1", xtype: "datefield", width: 122, 
    				listeners : {
						afterrender : function() {
							var date = new Date();
								date = new Date(date.getFullYear()+543, date.getMonth()-2, 1);
							this.setValue(date);
						}
					}
            	}, { xtype: "tbspacer", width: 5 }, { xtype: "label", text: "ถึงวันที่ : " }, { xtype: "tbspacer", width: 4 }, {
            		id: "d_doc_date_pv2", xtype: "datefield", width: 122, 
    				listeners: {
						afterrender : function() {
							this.setValue(addY(543));
						}
					}
            	}]
            }],
            buttonAlign: "left",
			buttons:[{
				text : "&nbsp;บันทึกเลขที่/วันที่ ใบสำคัญจ่าย (PV)&nbsp;",
				iconCls	: "icon-save",
    			handler : function() {
    				
    				var msg		= "";
    				
       				var check	= false;
       				var jsonArr = [];
       				
       				$( "input[id^=chk]" ).each(function( i, val ) {
       					if(val.checked == true) {
       						check	= true;
       						
       						if( Ext.getCmp("d_doc_date_pv["+val.value+"]").getValue() == "" ) {
       							msg += "- กรุณากรอก วันที่ใบสำคัญจ่าย (PV)<br>";
       						} else {
       							jsonArr.push({
       								cm_voucher_one_id: val.value,
       								d_doc_date_pv: Ext.util.Format.date(Ext.getCmp("d_doc_date_pv["+val.value+"]").getValue(), "Y-m-d")
       							});
       						}
       					}
    				});

    				if( check == false ) { msg += "- กรุณาเลือก เลขที่ใบสำคัญจ่าย (PV) อย่างน้อย 1 รายการ<br>"; }
    				
    				if(msg == "") {

    					Ext.getCmp("tabpanel1").getEl().mask("Please wait...", "x-mask-loading");					        					
    					$.ajax({
							url: "api/mn_Cm00011.php",
							type: "POST",
							data: {
								mode: "SAVE",
								data: JSON.stringify(jsonArr)
							},
							success: function(result) {
								Ext.getCmp("tabpanel1").getEl().unmask();
								var data = $.parseJSON( result );
								if(data.success == true) {
									Ext.Msg.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย");
									store.load();
								}
							}
						});

    				} else { Ext.Msg.alert("แจ้งเตือน", msg); }
    				
    			}
			}, { xtype: "tbfill" }, {
				text : "ค้นหา",
				iconCls: "icon-magnifier",
    			handler : function() {
    				
    				var msg	= "";
    				
    				if(Ext.getCmp("d_doc_date1").getValue() == "" || Ext.getCmp("d_doc_date2").getValue() == "") {
    					msg	+= "กรุณากรอก วันที่จัดทำใบสำคัญจ่าย<br>";
    				}
    				if( Ext.getCmp("chk_date_pv").checked == true ) {
    					if(Ext.getCmp("d_doc_date_pv1").getValue() == "" || Ext.getCmp("d_doc_date_pv2").getValue() == "") {
        					msg	+= "กรุณากรอก วันที่ใบสำคัญจ่าย (PV)<br>";
        				}
    				}
    	            		
    				if(msg == "") {
    					
						if(Ext.getCmp("value-box").getValue() != "") {
							store.setBaseParam("value", Ext.getCmp("value-box").getValue());
							store.setBaseParam("filter", Ext.getCmp("filter").getValue());
						} else {
							store.setBaseParam("value", "");
							store.setBaseParam("filter", "");
						}
						
						if( Ext.getCmp("chk_date_pv").checked == true ) {
							store.setBaseParam("chk_date_pv", true);
							store.setBaseParam("d_doc_date_pv1", Ext.util.Format.date(Ext.getCmp("d_doc_date_pv1").getValue(), "Y-m-d"));
							store.setBaseParam("d_doc_date_pv2", Ext.util.Format.date(Ext.getCmp("d_doc_date_pv2").getValue(), "Y-m-d"));
						} else {
							store.setBaseParam("chk_date_pv", false);
							store.setBaseParam("d_doc_date_pv1", "");
							store.setBaseParam("d_doc_date_pv2", "");
						}
						
						store.setBaseParam("mode", "SEARCH");
						store.setBaseParam("d_doc_date1", Ext.util.Format.date(Ext.getCmp("d_doc_date1").getValue(), "Y-m-d"));
						store.setBaseParam("d_doc_date2", Ext.util.Format.date(Ext.getCmp("d_doc_date2").getValue(), "Y-m-d"));
						store.setBaseParam("cm_pay_type_id", Ext.getCmp("s_cm_pay_type_id").getValue());
						store.load();
						
    				} else { Ext.Msg.alert("แจ้งเตือน", msg); }
    			}
			}]
		}],
		columns: [{ header: "-", hidden: true, dataIndex: "id" },
		    new Ext.grid.RowNumberer({header:"ที่", width: 30,
				renderer: function(value, metaData, record, row, col, store, gridView) {
					return record.get("no");
				}
			}), { id: "delete",
				header: "<input type='checkbox' onclick='checkAll(this.checked);'></div>",
				sortable: false, width: 80, align: "center", dataIndex: "id",
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {

					if ( record.get("c_code_gl") != "" ) {
						return "มี GL รอแสดง";
					}
					
					if( record.get("c_code_pv") != "" ) {
						return "<button style='font-size:11px; cursor:pointer;'>ยกเลิก PV</button>&nbsp;";
					} else {
						Ext.objChk[record.get("no")]	= "chk["+record.get("id")+"]";
						return "<input type='checkbox' id='chk["+record.get("id")+"]' value="+record.get("id")+">";
					}
		    	}
		    },
		    { header: "วันที่ใบสำคัญจ่าย (PV)", sortable: true, align: "center", width: 110, dataIndex: "id",
		    	renderer: function(value, metaData, record, row, col, store, gridView) {
		    		if( record.get("c_code_pv") != "" ) {
		    			return shortThaiDate(record.get("d_doc_date_pv"));
		    		} else {
		    			return "<div id='Ext_date_pv["+record.get("id")+"]'></div>";
		    		}
				}
		    },
			{ header: "เลขที่ใบสำคัญจ่าย (PV)", sortable: true, align: "center", width: 150, dataIndex: "c_code_pv" },
			{ header: "เลขที่ใบขอเบิก", sortable: true, align: "center", dataIndex: "c_code_ap" },
			{ header: "เลขที่จัดทำใบสำคัญจ่าย", sortable: true, align: "center", dataIndex: "c_code" },
			{ header: "วันที่จัดทำใบสำคัญจ่าย", sortable: true, align: "center", renderer:shortThaiDate, dataIndex: "d_doc_date" },
			{ header: "ประเภทการจ่ายเงิน", sortable: true, align: "center", dataIndex: "name_vch_type" },
			{ header: "จำนวนเงินรวม", sortable: true, align: "center", dataIndex: "f_total_cost",
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					metaData.attr = "style= \"text-align:right\";";
					return (value > 0)? floatRenderer(floatMinus(value, 2)) : "0.00";
				}
			},
			{ header: "ข้อมูลการยกเลิกรายการ", sortable: true, align: "center", dataIndex: "c_cancel" },
			{ header: "ผู้แก้ไขรายการ", sortable: true, align: "center", dataIndex: "dc_user_update" },
			{ header: "วันที่แก้ไข", sortable: true, align: "center", renderer:shortThaiDate, dataIndex: "d_update" },
			{ header: "หน่วยงานผู้แก้ไข", sortable: true, align: "center", dataIndex: "dc_user_update_cost" }
		],
//		autoExpandColumn: "c_receiver_name",
		bbar: pagingBar
	}); //gridMain
	
	//============================== cellClick ==============================//
	cellClick	= function( grid, rowIndex, columnIndex, e ) {
		
		var record = grid.getStore().getAt(rowIndex);
		
		if (columnIndex == grid.getColumnModel().getIndexById("delete")) {
			
			if( record.get("c_code_pv") != "" && record.get("c_code_gl") == "" ) {

				new Ext.Window({
					id: "win-msg-delete",
					title: "Remove",
					modal: true,
					width: 300,
					height: 150,
					html: "กรุณายืนยัน ยกเลิก\nเลขที่ใบสำคัญจ่าย(PV) : "+record.get("c_code_pv"),
					buttons: [{
						text: "Confirm",
						handler: function() {
							Ext.getCmp("win-msg-delete").getEl().mask("Please wait...", "x-mask-loading");
							Ext.Ajax.request({
								url: "api/mn_Cm00011.php",
								method: "POST",
								params: {
									mode: "DELETE",
									cm_voucher_one_id: record.get("id")
								},
								success: function ( result, request ) {
									Ext.getCmp("win-msg-delete").getEl().unmask();
									var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
									if ( jsonData.success == true ) {
										Ext.MessageBox.alert("แจ้งเตือน", "ลบรายการเรียบร้อย");			// alert massage success
										Ext.getCmp("win-msg-delete").destroy();					// clear memory :: garbage collection
										store.reload();
									} else {
										Ext.MessageBox.alert("Failed", jsonData.msg);			// alert massage error
									}
								},
								failure: function ( result, request) { 
									Ext.MessageBox.alert("Failed", result.responseText);		// connect error
								}
							});
						}
					}, {
						text : Ext.GLOBAL_BU_BACK_TH,
						handler : function() { Ext.getCmp("win-msg-delete").destroy(); }
					}]
				}).show();
				
			}
		}
	}; //cellClick
	
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