Ext.onReady(function() {
	Ext.QuickTips.init();

	/* =============================================== */
	title_panel		= "ตรวจสอบข้อมูล ปีงบประมาณ แหล่งเงิน สถานะรายการ";
	/* =============================================== */
	
	Ext.store = new Ext.data.JsonStore({
		id: "store",
		autoLoad: false, 
	    url: "api/List_checkBudget.php",
	    baseParams: { type: "gl_tran_dtl", i_read: user_right_read }, // Permission i_read
	    root: "data",
	    idProperty: "id",
		totalProperty: "totalCount",
		fields: [
				 { name : "no" },
				 { name : "id" },
				 { name : "c_code" },
				 { name : "c_doc" },
				 { name : "d_date" },
				 { name : "f_dr" },
				 { name : "f_cr" },
				 { name : "dc_expense_budget_type_id" },
				 { name : "dc_expense_budget_type_name" },
				 { name : "dc_acc_id" },
				 { name : "dc_acc_name" },
				 { name : "c_budget_year" },
				 { name : "c_return" }
				]
	});
	
	Ext.dc_expense_budget_type_all	= new Ext.data.JsonStore({
		autoDestroy: false,
		autoLoad: true,
		url: "api/All_GlRep00008.php",
		baseParams: { type: "vw_dc_expense_budget_type", all: "all" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ],
	    listeners: {
			load: function(t, records, options) {
	        	Ext.getCmp( "dc_expense_budget_type_id" ).setValue( "0" );
	        }
		}
	});
	
	Ext.dc_acc	= new Ext.data.JsonStore({
		autoDestroy: false,
		autoLoad: true,
		url: "api/All_GlRep00008.php",
		baseParams: { type: "dc_acc", all: "all" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ],
	    listeners: {
			load: function(t, records, options) {
	        	Ext.getCmp( "dc_acc_id" ).setValue( "0" );
	        }
		}
	});
	
	// pagingBar
	pagingBar = new Ext.PagingToolbar({
		pageSize: 20,
		store: Ext.store,
		displayInfo: true,
		displayMsg: "Displaying topics {0} - {1} of {2}"
	});

	searchGrid	= function () {
		var msg	= "";
		
		if(Ext.getCmp("d_date1").getValue() == "" || Ext.getCmp("d_date2").getValue() == "") {
			msg	= "- กรุณากรอกวันที่<br>";
		}
		
		if(msg == "") {
		
			Ext.store.setBaseParam("mode", "SEARCH");
			Ext.store.setBaseParam("f_money", Ext.getCmp("f_money").getValue().replace(/,/g,""));
			Ext.store.setBaseParam("c_code", Ext.getCmp("c_code").getValue());
			Ext.store.setBaseParam("dc_expense_budget_type_id", Ext.getCmp("dc_expense_budget_type_id").getValue());
			Ext.store.setBaseParam("dc_acc_id", Ext.getCmp("dc_acc_id").getValue());
			Ext.store.setBaseParam("dc_acc_id", Ext.getCmp("dc_acc_id").getValue());
			Ext.store.setBaseParam("d_date1", Ext.util.Format.date(Ext.getCmp("d_date1").getValue(), "Y-m-d"));
			Ext.store.setBaseParam("d_date2", Ext.util.Format.date(Ext.getCmp("d_date2").getValue(), "Y-m-d"));
			Ext.store.load();
			
		} else { Ext.Msg.alert("แจ้งเตือน", msg); }
	};
	
	// gridMain
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
		style: "font-size: 20px;",
		bbar: [{ xtype: "tbfill" }, {
			xtype: "buttongroup",
			title: "ระบุเงื่อนไขในการค้นหาข้อมูล",
			columns: 1,
            defaults: { scale: "small", style: "float: right" },
            items: [{
            	xtype: "buttongroup",
            	frame: false,
            	items: [{ xtype: "label", text: "GX : " }, { xtype: "tbspacer", width: 4 }, {
            		xtype: "textfield",
            		id: "c_code",
            		width: 267,
           			fieldLabel: "fieldLabel"
           		}]
            }, {
            	xtype: "buttongroup",
            	frame: false,
            	items: [{ xtype: "label", text: "แหล่งเงิน : " }, { xtype: "tbspacer", width: 4 },
				new Ext.form.ComboBox({
					id: "dc_expense_budget_type_id",
					store: Ext.dc_expense_budget_type_all,
					valueField: "id",
					displayField: "c_name",
					mode: "local",
					triggerAction: "all",
					emptyText: "กรุณาเลือก...",
					width: 267,
					forceSelection: true,
					selectOnFocus: true,
					typeAhead: false,
					value: 0,
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
				})]
            }, {
            	xtype: "buttongroup",
            	frame: false,
            	items: [{ xtype: "label", text: "ผังบัญชี : " }, { xtype: "tbspacer", width: 4 },
				new Ext.form.ComboBox({
					id: "dc_acc_id",
					store: Ext.dc_acc,
					valueField: "id",
					displayField: "c_name",
					mode: "local",
					triggerAction: "all",
					emptyText: "กรุณาเลือก...",
					width: 267,
					forceSelection: true,
					selectOnFocus: true,
					typeAhead: false,
					value: 0,
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
				})]
            }, {
            	xtype: "buttongroup",
            	frame: false,
            	items: [{ xtype: "label", text: "วันที่ : " }, { xtype: "tbspacer", width: 4 }, {
            		id: "d_date1", xtype: "datefield", width: 110, 
    				listeners : {
						afterrender : function() {
							var date = new Date();
								date = new Date(date.getFullYear()+541, date.getMonth(), 1);
							this.setValue(date);
						}
					}
            	}, { xtype: "tbspacer", width: 5 }, { xtype: "label", text: "ถึงวันที่ : " }, { xtype: "tbspacer", width: 4 }, {
            		id: "d_date2", xtype: "datefield", width: 110, 
    				listeners : {
						afterrender : function() {
							this.setValue(addY(543));
						}
					}
            	}]
            }, {
            	xtype: "buttongroup",
            	frame: false,
            	items: [{ xtype: "label", text: "จำนวนเงิน : " }, { xtype: "tbspacer", width: 4 }, {
            		xtype: "textarea",
            		fieldLabel: "หมายเหตุ",
    				id: "f_money",
    				style: "text-align: right; height: 34px; font-size: 20px; line-height: 34px;",
    				height: 40,
    				width: 267,
					listeners: {
						specialkey: function(f,e){
			                if(e.getKey() == e.ENTER){
			                	this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2)));
			                	searchGrid();
			                }// But i wanna click btnSearch button click event
			            },
						afterrender: function() {
							this.fn	= function() {
								this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2)));
							}
						},
						Change: function(value) { this.fn(); }
					}
    			}]
            }],
            buttonAlign: "left",
            buttons:[{ xtype: "tbfill" }, {
				text : "<font style='font-size: 14px; font-weight: bold;'>ค้นหา</font>",
				iconCls: "icon-magnifier",
				scale: "medium",
				width: 100,
    			handler : function() { searchGrid(); }
			}]
		}],
		columns: [
			new Ext.grid.RowNumberer({header:"ที่", width: 30,
				renderer: function(value, metaData, record, row, col, store, gridView) {
					return record.get("no");
				}
			}),
			{ header: "GX", sortable: true, width: 90, align: "center", dataIndex: "c_code",
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
		    		metaData.attr = "style='font-weight: bold; color: blue;'";
		    		return value;
		    	}
		    },
			{ header: "อ้างอิง", sortable: true, width: 150, dataIndex: "c_doc" },
			{ header: "วันที่", sortable: true, align: "center", dataIndex: "d_date",
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					return (value != "")? shortThaiDate(value) : "";
				}
			},
			{ header: "แหล่งเงิน", sortable: true, width: 200, dataIndex: "dc_expense_budget_type_name" },
			{ header: "รหัสบัญชี", sortable: true, width: 200, dataIndex: "dc_acc_name" },
			{ header: "ปีงบประมาณ", sortable: true, align: "center", dataIndex: "c_budget_year" },
			{ header: "สถานะรายการ", sortable: true, align: "center", dataIndex: "c_return" },
			{ header: "เดบิต", sortable: true, dataIndex: "f_dr",
		    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
		    		metaData.attr = "style= \"text-align:right;\";";
		    		return floatRenderer(value);
		    	}
		    },
		    { header: "เครดิต", sortable: true, dataIndex: "f_cr",
		    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
		    		metaData.attr = "style= \"text-align:right;\";";
		    		return floatRenderer(value);
		    	}
		    },
		],
// autoExpandColumn: "c_comment",
//		bbar: pagingBar
	}); // gridMain
	
	/* ====================== CENTER ====================== */
	center = new Ext.TabPanel({
		region: "center",
		border: false,
		// activeTab: 0, //default Tab
		id: "contenterCenter",
		defaults:{ autoScroll: true }, 
		items: [ gridMain ]
	});

	// SetTab Controller Loads
	Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
	/* ====================== RENDER ====================== */
	new Ext.Viewport({
		layout: "border",
		items: [ center ],
	});
});