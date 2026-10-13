Ext.onReady(function() {
	Ext.QuickTips.init();

	/*===============================================*/
	var title_panel	= "เลขที่บัญชีธนาคาร(จ่ายเป็นโอนเงิน)";
	/*===============================================*/
	
	store = new Ext.data.JsonStore({
		storeId: "myStore",
	    autoDestroy: true,
		autoLoad: false,
	    url: "api/List_Cm00009.php",
	    baseParams: { type: "cm_voucher_one", i_read: user_right_read }, //Permission i_read
	    root: "data",
	    idProperty: "id",
		totalProperty: "totalCount",
		fields: [
			{ name : "no" },
			{ name : "id" },
			{ name : "c_code" },
			{ name : "c_code_ap" },
			{ name : "cm_pay_type_id" },
			{ name : "c_receiver_name" },
			{ name : "d_doc_date" },
			{ name : "f_net_cost" },
			{ name : "f_total_cost_vat" },
			{ name : "dc_cheque_code" },
			{ name : "dc_bank_acc_company" },
			{ name : "dc_bank_acc_creditor" },
			{ name : "i_enable" },
			{ name : "show_enable" },
			{ name : "dc_user_create" },
			{ name : "dc_user_create_cost" },
			{ name : "d_create" },
			{ name : "dc_user_update" },
			{ name : "dc_user_update_cost" },
			{ name : "d_update" }
		]
	});
	
	dc_bank_acc_company	= new Ext.data.JsonStore({
		autoLoad: false,
		url: "api/List_Cm00009.php",
		baseParams: { type: "dc_bank_acc_company" },
		root: "data",
		idProperty: "id",
		totalProperty: "totalCount",
	    fields: [
	        { name : "no" },
	        { name : "id" },
	        { name : "c_code" },
	        { name : "c_name" },
	        { name : "bank_name" },
	        { name : "branch_name" },
	        { name : "deposit_type_name" }
	    ]
	});

	dc_bank_acc_creditor	= new Ext.data.JsonStore({
		autoLoad: true,
		url: "api/All_Cm00009.php",
		baseParams: { type: "dc_bank_acc_creditor" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ]
	});
		
	// pagingBar
	pagingBar = new Ext.PagingToolbar({
		pageSize: 20,
		store: store,
		displayInfo: true,
		displayMsg: "Displaying topics {0} - {1} of {2}"
	});

	// Poplov_Bank
	function Poplov_Bank() {
		
		cellClick_Bank	= function( grid, rowIndex, columnIndex, e ) {

			var str			= "";
			var record		= grid.getStore().getAt(rowIndex);

			Ext.getCmp("dc_bank_acc_company_id").setValue(record.get("id"));
			Ext.getCmp("s_dc_bank_acc_company_code").setValue(record.get("c_code")+" : "+record.get("c_name"));
			Ext.getCmp("win-pop-lov-dtl1").destroy();

		};
		
		new Ext.Window({
			id: "win-pop-lov-dtl1",
			title: "เลือกข้อมูล",
			modal: true,
			items:[{
				xtype: "grid",
				id: "win-pop-lov-dtl2",
				height: (Ext.getBody().getViewSize().height * 0.9),
				width: (Ext.getBody().getViewSize().width * 0.9),
				border: false,
				stripeRows: true,
				loadMask: true,
				store: dc_bank_acc_company,
				listeners:{
					afterrender:function (component) {

						Ext.getCmp("win-pop-lov-dtl1").getEl().mask("Please wait...", "x-mask-loading");
						dc_bank_acc_company.setBaseParam("filter", "c_code");
						dc_bank_acc_company.setBaseParam("value", "Hello World");	
						dc_bank_acc_company.setBaseParam("mode", "SEARCH");	
						dc_bank_acc_company.load({ callback: function(records, operation, success) { if ( success == true ){
							this.chkMask = true;
							Ext.getCmp("win-pop-lov-dtl1").getEl().unmask();
						} } });
					
					}
				},
				viewConfig : { emptyText: "ไม่มีข้อมูล..", deferEmptyText: false },
				tbar: [{
					id: "pop-filter2",
					xtype: "combo",
					width: 110,
					mode: "local",
					store: new Ext.data.SimpleStore({
						fields: [ "id", "c_name" ],
						data: [
						       [ "c_code", "เลขที่บัญชี" ],
						       [ "c_name", "ชื่อบัญชี" ],
						       [ "bank_name", "ธนาคาร" ],
						       [ "branch_name", "สาขา" ],
						       [ "deposit_type_name", "ประเภทเงินฝาก" ]										
						      ]
					}),
					value: "c_code",
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
				}, {
					id: "pop-value2",
					xtype: "textfield",
					width: 130,
					emptyText : "คำที่ต้องการค้นหา",
				}, "-", {
					text: "ค้นหา",
					iconCls: "icon-magnifier",
					handler: function() {
						if (Ext.getCmp("pop-value2").getValue() != "") {
							dc_bank_acc_company.setBaseParam("filter", Ext.getCmp("pop-filter2").getValue());
							dc_bank_acc_company.setBaseParam("value", Ext.getCmp("pop-value2").getValue());
						} else {
							dc_bank_acc_company.setBaseParam("filter", "");
							dc_bank_acc_company.setBaseParam("value", "");
						}
						
						dc_bank_acc_company.setBaseParam("mode", "SEARCH");
						dc_bank_acc_company.load();
					}
				}],
				columns:[
				    { header: "ID System", sortable: true, hidden: true, dataIndex: "id" },
				    { header: "เลขที่บัญชี", sortable: true, align:"center", dataIndex: "c_code",
				    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				    		metaData.attr = "style= \"cursor:pointer\";";
				    		return value;
				    	}
				    },
				    { id: "syn_name", header: "ชื่อบัญชี", sortable: true, dataIndex: "c_name",
				    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				    		metaData.attr = "style= \"cursor:pointer\";";
				    		return value;
			    		}
			    	},
			    	{ header: "ธนาคาร", sortable: true, width: 150, dataIndex: "bank_name",
				    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				    		metaData.attr = "style= \"cursor:pointer\";";
				    		return value;
			    		}
			    	},
			    	{ header: "สาขา", sortable: true, width: 150, dataIndex: "branch_name",
				    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				    		metaData.attr = "style= \"cursor:pointer\";";
				    		return value;
			    		}
			    	},
			    	{ header: "ประเภทเงินฝาก", sortable: true, align:"center", dataIndex: "deposit_type_name",
				    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				    		metaData.attr = "style= \"cursor:pointer\";";
				    		return value;
			    		}
			    	}
			    ], 
			    autoExpandColumn: "syn_name",
			    bbar: new Ext.PagingToolbar({
			    	pageSize: 20,
			    	store: dc_bank_acc_company,
			    	displayInfo: true,
			    	displayMsg: "Displaying topics {0} - {1} of {2}"
			    })
			}]
		}).show();
		
		Ext.getCmp("win-pop-lov-dtl2").on("cellclick", cellClick_Bank, this); 
	}; // Poplov_Bank
		
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
						       [ "c_code", "เลขที่จัดทำใบสำคัญจ่าย" ],
						       [ "c_code_ap", "เลขที่เอกสารใบเบิก" ]
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
            		width: 136,
           			fieldLabel: "fieldLabel",
           			emptyText: "คำที่ต้องการค้นหา"
           		}]
            }, { // แถวที่ 2
            	xtype: "buttongroup",
            	frame: false,
            	items: [{ xtype: "label", text: "ระหว่างวันที่ : " }, { xtype: "tbspacer", width: 4 }, {
            		id: "s_doc_date1", xtype: "datefield", width: 122, 
    				listeners : {
						afterrender : function() {
							var date = new Date();
								date = new Date(date.getFullYear()+543, date.getMonth()-2, 1);
							this.setValue(date);
						}
					}
            	}, { xtype: "tbspacer", width: 5 }, { xtype: "label", text: "ถึงวันที่ : " }, { xtype: "tbspacer", width: 4 }, {
            		id: "s_doc_date2", xtype: "datefield", width: 122, 
    				listeners : {
						afterrender : function() {
							this.setValue(addY(543));
						}
					}
            	}]
            }],
            buttonAlign: "left",
			buttons:[{
				text : "ค้นหา",
				iconCls: "icon-magnifier",
    			handler : function() {
    				
    				var msg	= "";
    				
    				if(Ext.getCmp("s_doc_date1").getValue() == "" || Ext.getCmp("s_doc_date2").getValue() == "") {
    					msg	+= "กรุณากรอก วันที่บันทึก<br>";
    				}
    				
    				if(msg == "") {
						if(Ext.getCmp("value-box").getValue() != "") {
							store.setBaseParam("value", Ext.getCmp("value-box").getValue());
							store.setBaseParam("filter", Ext.getCmp("filter").getValue());
						} else {
							store.setBaseParam("value", "");
							store.setBaseParam("filter", "");
						}
						
						store.setBaseParam("mode", "SEARCH");
						store.setBaseParam("s_doc_date1", Ext.util.Format.date(Ext.getCmp("s_doc_date1").getValue(), "Y-m-d"));
						store.setBaseParam("s_doc_date2", Ext.util.Format.date(Ext.getCmp("s_doc_date2").getValue(), "Y-m-d"));
						store.load();
    				} else { Ext.Msg.alert("แจ้งเตือน", msg); }
    			}
			}]
		}],
		columns: [{ header: "-", hidden: true, dataIndex: "id" },
			{ id: "edit", header: "ระบุเลขที่เช็ค", sortable: true, align: "center", dataIndex: "id",
				renderer: function(value, metaData, record, row, col, store, gridView) {
					return "<button style=\"font-size:11px; cursor:pointer;\">ระบุเลขที่บัญชี</button>&nbsp;";
				}
			},
		    { header: "เลขที่จัดทำใบสำคัญจ่าย", sortable: true, align: "center", dataIndex: "c_code" },
		    { id: "c_receiver_name", header: "ชื่อผู้รับเงิน", sortable: true, dataIndex: "c_receiver_name" },
			{ header: "เลขที่เอกสารใบเบิก", sortable: true, align: "center", dataIndex: "c_code_ap" },
			{ header: "วันที่ออกใบสำคัญ", sortable: true, align: "center", renderer:shortThaiDate, dataIndex: "d_doc_date" },
			{ header: "เลขที่บัญชีโอนออก", sortable: true, align: "center", dataIndex: "dc_bank_acc_company" },
			{ header: "เลขที่บัญชีรับโอน", sortable: true, align: "center", dataIndex: "dc_bank_acc_creditor" },
			{ header: "จำนวนเงินรวม", sortable: true, align: "center", dataIndex: "f_net_cost",
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					metaData.attr = "style= \"text-align:right\";";
					return (value > 0)? floatRenderer(floatMinus(value, 2)) : "0.00";
				}
			},
			{ header: "ผู้แก้ไขรายการ", sortable: true, align: "center", dataIndex: "dc_user_update" },
			{ header: "วันที่แก้ไข", sortable: true, align: "center", renderer:shortThaiDate, dataIndex: "d_update" }
		],
		autoExpandColumn: "c_receiver_name",
		bbar: pagingBar
	}); //gridMain
	
	//============================== cellClick ==============================//
	cellClick	= function( grid, rowIndex, columnIndex, e ) {
		
		var record = grid.getStore().getAt(rowIndex);
		 
		if (columnIndex == grid.getColumnModel().getIndexById("edit")) {
			
			new Ext.Window({
				title: "แสดงรายการ",
				id: "win-pop-dtl",
				layout: "fit",
				modal: true,
				border: false,
				autoScroll: true,
				height: (Ext.getBody().getViewSize().height * 0.90),
				width: (Ext.getBody().getViewSize().width * 0.90),
				listeners: {
					afterrender: function( component ) {

						Ext.getCmp("win-pop-dtl").getEl().mask("Please wait...", "x-mask-loading");					        					
    					$.ajax({
							url: "api/List_Cm00009.php",
							type: "POST",
							data: {
								type: "List_cm_voucher_one",
								cm_voucher_one_id: record.get("id")
							},
							success: function(result) {
								
								Ext.getCmp("win-pop-dtl").getEl().unmask();
								var data = $.parseJSON( result );
								if(data.success == true) {
									
									dc_bank_acc_creditor.load({ params: { cm_voucher_one_id: record.get("id") } });
									
									new Ext.form.DisplayField({ value: data.data.c_code, renderTo: "Ext_c_code" });
									new Ext.form.DisplayField({ value: data.data.c_code_ap, renderTo: "Ext_c_code_ap" });
									new Ext.form.DisplayField({ value: data.data.d_doc_date, renderTo: "Ext_d_doc_date" });
									new Ext.form.DisplayField({ value: data.data.c_receiver_name, renderTo: "Ext_c_receiver_name" });
									new Ext.form.DisplayField({ value: data.data.c_name, renderTo: "Ext_c_name" });
									
									new Ext.form.CompositeField({
										anchor: "100%",
										msgTarget: "under",
										items: [{
											xtype: "hidden",
											id: "dc_bank_acc_company_id",
											value: (data.data.dc_bank_acc_company_id != "")? data.data.dc_bank_acc_company_id : ""
										}, {
											xtype: "textfield",
											readOnly: true,
											id: "s_dc_bank_acc_company_code",
											value: (data.data.dc_bank_acc_company_code != "")? data.data.dc_bank_acc_company_code : "",
											width: 400
										}, { id: "s_btn_code", xtype: "button", iconCls: "page_magnify", width : 30,
				    	                	handler: function() { Poplov_Bank(); }
				    	                }],
										renderTo: "Ext_dc_bank_acc_company"
									});
									
									new Ext.form.ComboBox({
										id: "dc_bank_acc_creditor_id",
										store: dc_bank_acc_creditor,
										valueField: "id",
										displayField: "c_name",
										mode: "local",
										triggerAction: "all",
										emptyText: "กรุณาเลือก..",
										width: 400,
										value: (data.data.dc_bank_acc_creditor_id != "")? data.data.dc_bank_acc_creditor_id : "",
										forceSelection: true,
										selectOnFocus: true,
										typeAhead: false,
										listeners: {
											beforequery: function(q) {
												if (q.query) {
													var length = q.query.length;
													q.query = new RegExp(Ext.escapeRe(q.query));
													q.query.length = length;
												}
											},
											blur: function() { this.getStore().clearFilter(); }
										},
										renderTo: "Ext_dc_bank_acc_creditor"
									});
									
									new Ext.form.TextArea({
										id: "c_comment",
										value: (data.data.c_comment != "")? data.data.c_comment : "",
										width: 300,
										renderTo: "Ext_c_comment"
									});
										
									new Ext.form.CompositeField({
										anchor: "100%",
										msgTarget: "under",
										items: [new Ext.form.TextField({
											style: "text-align: right; color: blue; font-weight: bolder;",
											width: 150,
											boxLabel: "บาท",
											readOnly: true,
											value: data.data.f_total_amount,
											listeners: {
							    				afterrender: function() {
													this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue(), 2))); }
												},
												Change: function(value) { this.fn(); }
											},
										}), { xtype: "displayfield", value: "บาท" }],
										renderTo: "Ext_f_total_amount"
									});

									new Ext.form.CompositeField({
										anchor: "100%",
										msgTarget: "under",
										items: [new Ext.form.TextField({
											style: "text-align: right; color: blue; font-weight: bolder;",
											width: 150,
											boxLabel: "บาท",
											readOnly: true,
											value: data.data.f_vat_amount,
											listeners: {
							    				afterrender: function() {
													this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue(), 2))); }
												},
												Change: function(value) { this.fn(); }
											},
										}), { xtype: "displayfield", value: "บาท" }],
										renderTo: "Ext_f_vat_amount"
									});
									
									new Ext.form.CompositeField({
										anchor: "100%",
										msgTarget: "under",
										items: [new Ext.form.TextField({
											style: "text-align: right; color: blue; font-weight: bolder;",
											width: 150,
											boxLabel: "บาท",
											readOnly: true,
											value: data.data.f_wht_amount,
											listeners: {
							    				afterrender: function() {
													this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue(), 2))); }
												},
												Change: function(value) { this.fn(); }
											},
										}), { xtype: "displayfield", value: "บาท" }],
										renderTo: "Ext_f_wht_amount"
									});
									
									new Ext.form.CompositeField({
										anchor: "100%",
										msgTarget: "under",
										items: [new Ext.form.TextField({
											style: "text-align: right; color: blue; font-weight: bolder;",
											width: 150,
											boxLabel: "บาท",
											readOnly: true,
											value: data.data.f_net_penalty,
											listeners: {
							    				afterrender: function() {
													this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue(), 2))); }
												},
												Change: function(value) { this.fn(); }
											},
										}), { xtype: "displayfield", value: "บาท" }],
										renderTo: "Ext_f_net_penalty"
									});

									new Ext.form.CompositeField({
										anchor: "100%",
										msgTarget: "under",
										items: [new Ext.form.TextField({
											style: "text-align: right; color: blue; font-weight: bolder;",
											width: 150,
											boxLabel: "บาท",
											readOnly: true,
											value: data.data.f_barter_amt,
											listeners: {
							    				afterrender: function() {
													this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue(), 2))); }
												},
												Change: function(value) { this.fn(); }
											},
										}), { xtype: "displayfield", value: "บาท" }],
										renderTo: "Ext_f_barter_amt"
									});
									
									new Ext.form.CompositeField({
										anchor: "100%",
										msgTarget: "under",
										items: [new Ext.form.TextField({
											style: "text-align: right; color: blue; font-weight: bolder;",
											width: 150,
											boxLabel: "บาท",
											readOnly: true,
											value: data.data.f_net_amount,
											listeners: {
							    				afterrender: function() {
													this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue(), 2))); }
												},
												Change: function(value) { this.fn(); }
											},
										}), { xtype: "displayfield", value: "บาท" }],
										renderTo: "Ext_f_net_amount"
									});
								}
							}
						});
    					
			        }
				},
				html:	"<div style='background:#fff; overflow:auto;'>" +
							"<div style='font-size: 12px;'>" +
								"<table border='0' cellspacing='2' cellpadding='0' width='100%'>" +
									"<colgroup width='20%'></colgroup>" +
									"<colgroup width='80%' style='background: #DFE8F6;'></colgroup>" +
									"<tr><td align='right'><b>เลขที่จัดทำใบสำคัญจ่าย :</b></td><td id='Ext_c_code' style='padding:1px 4px;'></td></tr>" +
									"<tr><td align='right'><b>เลขที่ใบเบิก :</b></td><td id='Ext_c_code_ap' style='padding:1px 4px;'></td></tr>" +
									"<tr><td align='right'><b>วันที่ออกใบสำคัญ :</b></td><td id='Ext_d_doc_date' style='padding:1px 4px;'></td></tr>" +
									"<tr><td align='right'><b>ชื่อผู้รับเงิน :</b></td><td id='Ext_c_receiver_name' style='padding:1px 4px;'></td></tr>" +
									"<tr><td align='right'><b>รายละเอียดขอเบิก :</b></td><td id='Ext_c_name' style='padding:1px 4px;'></td></tr>" +
									"<tr><td align='right'><b>เลขที่บัญชีที่โอนออก :</b></td><td id='Ext_dc_bank_acc_company' style='padding:1px 4px;'></td></tr>" +
									"<tr><td align='right'><b>เลขที่บัญชีผู้รับ :</b></td><td id='Ext_dc_bank_acc_creditor' style='padding:1px 4px;'></td></tr>" +
									"<tr><td align='right'><b>หมายเหตุ :</b></td><td id='Ext_c_comment' style='padding:1px 4px;'></td></tr>" +
									"<tr><td colspan='2' style='border-top: 1px solid #99BBE8;'></td></tr>" +
									"<tr><td align='right'><b>จำนวนเงินที่ขอเบิก :</b></td><td id='Ext_f_total_amount' style='padding:1px 4px;'></td></tr>" +
									"<tr><td align='right'><b>ภาษีมูลค่าเพิ่ม :</b></td><td id='Ext_f_vat_amount' style='padding:1px 4px;'></td></tr>" +
									"<tr><td align='right'><b>ภาษีหัก ณ ที่จ่าย :</b></td><td id='Ext_f_wht_amount' style='padding:1px 4px;'></td></tr>" +
									"<tr><td align='right'><b>จำนวนเงินสุทธิ :</b></td><td id='Ext_f_net_penalty' style='padding:1px 4px;'></td></tr>" +
									"<tr><td align='right'><b>เงินใช้แลกเปลี่ยน :</b></td><td id='Ext_f_barter_amt' style='padding:1px 4px;'></td></tr>" +
									"<tr><td align='right'><b>จำนวนเงินสุทธิที่จ่าย :</b></td><td id='Ext_f_net_amount' style='padding:1px 4px;'></td></tr>" +
								"</table>" +
							"</div>" +
						"</div>",
				buttonAlign: "left",
    			buttons: [{
    				text : "&nbsp;บันทึกเลขที่บัญชี&nbsp;",
    				iconCls	: "icon-save",
    				handler : function() {
    					
    					var msg		= "";
    					
        				if( Ext.getCmp("dc_bank_acc_company_id").getValue() == "" ) { msg += "- กรุณาเลือก เลขที่บัญชีที่โอนออก<br>"; }
        				if( Ext.getCmp("dc_bank_acc_creditor_id").getValue() == "" ) { msg += "- กรุณาเลือก เลขที่บัญชีผู้รับ<br>"; }
						
        				if(msg == "") {

        					Ext.getCmp("win-pop-dtl").getEl().mask("Please wait...", "x-mask-loading");					        					
        					$.ajax({
								url: "api/mn_Cm00009.php",
								type: "POST",
								data: {
									type: "SAVE",
									cm_voucher_one_id: record.get("id"),
									dc_bank_acc_company_id: Ext.getCmp("dc_bank_acc_company_id").getValue(),
									dc_bank_acc_creditor_id: Ext.getCmp("dc_bank_acc_creditor_id").getValue(),
									c_comment: Ext.getCmp("c_comment").getValue()
								},
								success: function(result) {
									Ext.getCmp("win-pop-dtl").getEl().unmask();
									var data = $.parseJSON( result );
									if(data.success == true) {
										Ext.Msg.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย");
										Ext.getCmp("win-pop-dtl").destroy();
										store.load();
									}
								}
							});

        				} else { Ext.Msg.alert("แจ้งเตือน", msg); }
        				
    				}
    			}, {
    				text: Ext.GLOBAL_BU_BACK_TH,
    				handler: function() { Ext.getCmp("win-pop-dtl").destroy(); }
    			}],
			}).show();
			
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