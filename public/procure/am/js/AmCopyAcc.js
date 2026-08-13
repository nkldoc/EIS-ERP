Ext.onReady(function() {
	Ext.QuickTips.init();
	
	storeAD	= new Ext.data.JsonStore({
	    autoDestroy: true,
		autoLoad: true,
	    url: "api/ListAmCopyAcc.php",
	    baseParams: { type: "dataAD" },
	    root: "data",
	    idProperty: "id",
		totalProperty: "totalCount",
		fields: [
		         { name : "no"},
		         { name : "id"},
		         { name : "c_code"},
		         { name : "c_ref_doc"},
		         { name : "d_save_date"},
		         { name : "c_comment"}
				]
	});
	
	store = new Ext.data.JsonStore({
		storeId: "myStore",
	    autoDestroy: true,
		autoLoad: true,
	    url: "api/ListAmCopyAcc.php",
	    baseParams: { type: "dataGL" },
	    root: "data",
	    idProperty: "id",
		totalProperty: "totalCount",
		fields: [
			{ name : "no" },
			{ name : "id" },
			{ name : "gl_dc_book_type_id" },
			{ name : "c_code" },
			{ name : "c_code_post" },
			{ name : "c_ref_doc" },
			{ name : "c_mm" },
			{ name : "c_yyyy" },
			{ name : "i_status" },
			{ name : "d_save_date" },
			{ name : "d_doc_date" },
			{ name : "i_is_reversing" },
			{ name : "i_is_close_year" },
			{ name : "i_type" },
			{ name : "i_is_post" },
			{ name : "i_preview" },
			{ name : "i_enable" },
			{ name : "dc_user_create_id" },
			{ name : "dc_user_create_cost_id" },
			{ name : "d_create" },
			{ name : "dc_user_update_id" },
			{ name : "dc_user_update_cost_id" },
			{ name : "d_update" },
			{ name : "f_money_dtl" },
			{ name : "c_comment1" },
			{ name : "c_comment2" },
			{ name : "c_comment3" }
		]
	});

	reader = new Ext.data.JsonReader({
		root: "data",
	    idProperty: "id",
		totalProperty: "totalCount",
        fields: [
            { name : "no" },
			{ name : "id" },
			{ name : "i_rank" },
			{ name : "dc_acc_id" },
			{ name : "dc_acc_name" },
			{ name : "dc_cost_acc_id" },
			{ name : "dc_cost_acc_name" },
			{ name : "dc_channel_name" },
			{ name : "i_type_person" },
			{ name : "dc_creditor_type_name" },
			{ name : "f_dr" },
			{ name : "f_cr" },
			{ name : "i_is_nontax_exp" },
			{ name : "dc_product_id" },
			{ name : "dc_product_name" },
			{ name : "dc_cnt_id" },
			{ name : "dc_cnt_name" },
			{ name : "dc_emp_id" },
			{ name : "dc_emp_name" },
			{ name : "c_other_name" },
			{ name : "total_type" }
        ]
    });
	
	store_tran_dtl = new Ext.ux.grid.livegrid.Store({
		url : "../gl/api/List_GlTranhdr.php",
		baseParams: { type: "tran_dtl", total_show: true },
        bufferSize: 300,
        reader: reader
    });
	
	myView = new Ext.ux.grid.livegrid.GridView({
        nearLimit : 100,
        emptyText: "ไม่มีข้อมูล..",
		deferEmptyText: false,
		//autoFill: true, // ย่อ columns
		//scrollOffset: 0, // ปิดช่อง  scrollbars ของ columns
        loadMask: {
            msg:  'Buffering. Please wait...'
        }
    });
	
	reader2 = new Ext.data.JsonReader({
		root: "data",
	    idProperty: "id",
		totalProperty: "totalCount",
        fields: [
            { name : "no" },
            { name : "id" },
            { name : "gl_tran_hdr_id" },
            { name : "dc_cost_acc_id" },
            { name : "dc_cost_acc_name" },
            { name : "d_vat" },
            { name : "c_doc" },
            { name : "c_mm" },
            { name : "c_yyyy" },
            { name : "c_vendor" },
            { name : "c_tax" },
            { name : "i_branch" },
            { name : "c_branch" },
            { name : "f_price" },
            { name : "f_vat" },
            { name : "i_more" },
            { name : "c_mm_more" },
            { name : "c_yyyy_more" }
        ]
    });
	
	store_tran_purchase_tax = new Ext.ux.grid.livegrid.Store({
		url : "../gl/api/List_GlTranhdr.php",
		baseParams: { type: "tran_purchase_tax" },
        bufferSize: 300,
        reader: reader2
    });
	
	myView2 = new Ext.ux.grid.livegrid.GridView({
        nearLimit : 100,
        emptyText: "ไม่มีข้อมูล..",
		deferEmptyText: false,
		//autoFill: true, // ย่อ columns
		//scrollOffset: 0, // ปิดช่อง  scrollbars ของ columns
        loadMask  : {
            msg :  "Buffering. Please wait..."
        }
    });
	
	store_book_type	= new Ext.data.JsonStore({
		autoDestroy: true,
		autoLoad: true,
		url: "../gl/api/All_GlTranHdr.php",
		baseParams: { type: "vw_gl_dc_book_type" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ]
	});
	
	store_acc	= new Ext.data.JsonStore({
		autoDestroy: true,
		autoLoad: true,
		url: "../gl/api/All_GlTranhdr.php",
		baseParams: { type: "dc_acc" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "i_group", "c_name" ]
	});
	
	store_cost_acc	= new Ext.data.JsonStore({
		autoDestroy: true,
		autoLoad: true,
		url: "../gl/api/All_GlTranhdr.php",
		baseParams: { type: "vw_dc_cost_gl_last" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ]
	});
	
	store_product	= new Ext.data.JsonStore({
		autoLoad: true,
		url: "../gl/api/All_GlTranhdr.php",
		baseParams: { type: "vw_product_class_type_new2" },
		root: "data",
		idProperty: "id",
		totalProperty: "totalCount",
		fields: [ "no", "id", "type_name", "c_code", "c_name" ]
	});
	
        vw_dc_creditor	= new Ext.data.JsonStore({
		autoLoad: true,
		url: "../gl/api/All_GlTranhdr.php",
		baseParams: { type: "vw_dc_creditor" },
		root: "data",
		idProperty: "id",
		totalProperty: "totalCount",
		fields: [ "no", "id", "c_code", "c_name" ]
	});
	
	vw_dc_debtor	= new Ext.data.JsonStore({
		autoLoad: true,
		url: "../gl/api/All_GlTranhdr.php",
		baseParams: { type: "vw_dc_debtor" },
		root: "data",
		idProperty: "id",
		totalProperty: "totalCount",
		fields: [ "no", "id", "c_code", "c_name" ]
	});
	
	vw_show_emp_name_gl0201b	= new Ext.data.JsonStore({
		autoLoad: true,
		url: "../gl/api/All_GlTranhdr.php",
		baseParams: { type: "vw_show_emp_name_gl0201b" },
		root: "data",
		idProperty: "id",
		totalProperty: "totalCount",
		fields: [ "no", "id", "c_code", "c_name" ]
	});
	
	vw_c_other	= new Ext.data.JsonStore({
		autoLoad: true,
		url: "../gl/api/All_GlTranhdr.php",
		baseParams: { type: "vw_c_other" },
		root: "data",
		idProperty: "id",
		totalProperty: "totalCount",
	    fields: [ "no", "id", "c_code", "c_name" ]
	});
	
	store_contract	= new Ext.data.JsonStore({
		autoLoad: true,
		url: "../gl/api/All_GlTranhdr.php",
		baseParams: { type: "bh_contract" },
		root: "data",
		idProperty: "id",
		totalProperty: "totalCount",
	    fields: [ "id", "c_name" ]
	});
	
	store_month = new Ext.data.JsonStore({
		fields: ["id", "c_name"],
		data : [
		        { id : "01", c_name : "มกราคม" },
		        { id : "02", c_name : "กุมภาพันธ์" },
		        { id : "03", c_name : "มีนาคม" },
		        { id : "04", c_name : "เมษายน" },
		        { id : "05", c_name : "พฤษภาคม" },
		        { id : "06", c_name : "มิถุนายน" },
		        { id : "07", c_name : "กรกฎาคม" },
		        { id : "08", c_name : "สิงหาคม" },
		        { id : "09", c_name : "กันยายน" },
		        { id : "10", c_name : "ตุลาคม" },
		        { id : "11", c_name : "พฤศจิกายน" },
		        { id : "12", c_name : "ธันวาคม" }
		       ]
	});
	
    // storeYear
    var years = [];
    var currentTime = new Date();
    var now = currentTime.getFullYear()+1;
    var id = currentTime.getFullYear()-1;
    while(id <= now) {
    	var c_name = (id + 543);
        years.push({id : id}, {c_name : c_name });
        id++;
    }

    store_year = new Ext.data.JsonStore({
        fields: [{name : "id"}, {name : "c_name"}],
        data : years
    });

    // pagingBar
    pagingBar = new Ext.PagingToolbar({
            pageSize: 20,
            store: store,
            displayInfo: true,
            displayMsg: "Displaying topics {0} - {1} of {2}"
    });
	
	//================================ gridAD ================================//
	function ADCellClick(grid, rowIndex, columnIndex, e) {
		
		var record = grid.getStore().getAt(rowIndex);
		
		if ( columnIndex==grid.getColumnModel().getIndexById("apProcess") ) {
			new Ext.Window({
				id : "frmC",
				xtype: 'form',
				title : "คัดลอกข้อมูล",
				modal: true,
				border: false,
				width : 500,
				items: [{
					xtype: 'container',
					layout: 'hbox',
					align: 'stretch',
					defaults: { xtype: 'fieldset', flex:1, autoHeight: true },
					items: [{
						
						defaults: { allowBlank: true, anchor: '100%' },
						items: [{
							xtype: "hidden",
							id: "frmC-id",
							value : record.get('id'),
							readOnly: true
						},{			
							id : "frmC-c_code",
							xtype : "displayfield", 
							fieldLabel : "เลขที่อ้างอิง",
							value : record.get('c_code')
						},{			
							id : "frmC-c_ref_doc",
							xtype : "displayfield", 
							fieldLabel : "เลขที่เอกสาร",
							value : record.get('c_ref_doc')
						}, {
							xtype: 'textarea',
							fieldLabel: "หมายเหตุ",
							id: 'frmC-c_comment',
							value : record.get('c_comment'),
							readOnly: true
						},{
							xtype: 'datefield',
							id: 'frmC-d_save_date',
							name: 'd_save_date',
							anchor: '50%',
							fieldLabel: 'วันที่บันทึกบัญชี สำเนา ',
						}]
					}]
				}],
				buttonAlign: 'left',
				buttons : [{
					text : Ext.GLOBAL_BU_SAVE_TH,
					iconCls	: 'icon-save',
					handler: function(){
						var id = Ext.getCmp("frmC-id").getValue();
						var d_save_date = Ext.getCmp('frmC-d_save_date').getValue();

						if (d_save_date == '')
							Ext.MessageBox.alert('ผิดพลาด', 'กรุณาระบุ วันที่บันทึกบัญชี สำเนา ');
						else 
						{
							Ext.Ajax.request({
								url : 'api/mnAmCopyAcc.php' ,
								method: 'POST',
								params : { 
									type: "COPY",
									id : id,
									d_save_date : d_save_date
								},
								success: function ( result, request ) {
									var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
									if (jsonData.success) {
										
										storeAD.load();
										var ref_doc = jsonData.c_ref_doc;
										// LOAD รายการรอลงบัญชี
										store.setBaseParam("c_ref_doc", ref_doc);
										store.setBaseParam("d_doc_date1", d_save_date);
										store.setBaseParam("d_doc_date2", d_save_date); 
										store.load();

										var dat		= new Date(Ext.getCmp("d_doc_date1").getValue());
										var yyyy	= dat.getFullYear();
										var mm		= dat.getMonth();
										var dd		= dat.getDate();
										dat			= new Date(yyyy+543, mm, dd);
										
										var dat2	= new Date(Ext.getCmp("d_doc_date2").getValue());
										var yyyy	= dat2.getFullYear();
										var mm		= dat2.getMonth();
										var dd		= dat2.getDate();
										dat2		= new Date(yyyy+543, mm, dd);
										
										Ext.getCmp("value-box1").setValue(ref_doc);
										Ext.getCmp("d_doc_date_start_gl").setValue(dat);
										Ext.getCmp("d_doc_date_end_gl").setValue(dat2);
										
										Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
										
					        			Ext.getCmp("frmC").hide();
										Ext.getCmp("frmC").destroy();
									} else {
										Ext.MessageBox.alert('Failed', jsonData.msg);			// alert massage error
									}
								},
								failure: function ( result, request) { 
									Ext.MessageBox.alert('Failed', result.responseText);		// connect error
								}
							});
						}
						
					} //End Handle
				}, {
					text : Ext.GLOBAL_BU_BACK_TH,
					handler : function() {
						Ext.getCmp("frmC").hide();
						Ext.getCmp("frmC").destroy();
					}				
				}]
			}).show();
		}
	}

	gridAD = new Ext.grid.GridPanel({
		region: "center",
		layout: "fit",
		title: "แสดงรายการ AD (ที่เป็น GX/GL)",
		id: "tabpanelAP",
		border: false,
		stripeRows: true,
		loadMask: true,
		store: storeAD,
		viewConfig : {
			emptyText: "ไม่มีข้อมูล..",
			deferEmptyText: false
		},
		tbar: [
		{ // กล่องค้นหาข้อมูล 1
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
		            width: 122,
					mode: "local",
		            store: new Ext.data.SimpleStore({
		            	fields: [ "value", "text" ],
						data: [
						       [ "c_code", "เลขที่เอกสาร" ],
						       [ "c_doc_ref", "เลขที่อ้างอิง" ]
						]
					}),
					value: "c_code",
					valueField: "value",
					displayField: "text",
					allowBlank: false,
					editable: false,
					triggerAction: "all",
					typeAhead : false,
					emptyText : "เลือกตัวกรอง"
				}, { xtype: "tbspacer", width: 4 }, {
            		xtype: "textfield",
            		id: "value-box",
            		width: 164,
           			fieldLabel: "fieldLabel",
           			emptyText: "คำที่ต้องการค้นหา"
           		}]
            }, { // แถวที่ 2
            	xtype: "buttongroup",
            	frame: false,
            	items: [{ xtype: "label", text: "ระหว่างวันที่ : " }, { xtype: "tbspacer", width: 4 }, {
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
    				
    				if(Ext.getCmp("d_doc_date1").getValue() == "" || Ext.getCmp("d_doc_date2").getValue() == "") {
    					msg	+= "กรุณากรอก วันที่<br>";
    				}
    				
    				if( msg == "" ) {
    					
						if(Ext.getCmp("value-box").getValue() != "") {
							storeAD.setBaseParam("value", Ext.getCmp("value-box").getValue());
							storeAD.setBaseParam("filter", Ext.getCmp("filter").getValue());
						} else {
							storeAD.setBaseParam("value", "");
							storeAD.setBaseParam("filter", "");
						}
						
						storeAD.setBaseParam("mode", "SEARCH");
						storeAD.setBaseParam("filter",Ext.getCmp("filter").getValue()); 
						storeAD.setBaseParam("value", Ext.getCmp("value-box").getValue()); 
						storeAD.setBaseParam("d_doc_date1", Ext.util.Format.date(Ext.getCmp("d_doc_date1").getValue(), "Y-m-d"));
						storeAD.setBaseParam("d_doc_date2", Ext.util.Format.date(Ext.getCmp("d_doc_date2").getValue(), "Y-m-d"));
						storeAD.load();
						
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
			{ id: "apProcess", header: "-", sortable: false, align: "center", width: 80, dataIndex: "id",
		    	renderer: function(value, metaData, record, row, col, store, gridView) {
		    		return "<button style=\"font-size:11px; cursor:pointer;\">คัดลอก</button>";
				}
			},
			{ header: "เลขที่อ้างอิง", sortable: true, align: "center", dataIndex: "c_code" },
			{ header: "เลขที่เอกสาร", sortable: true, align: "center", dataIndex: "c_ref_doc" },
			{ header: "วันที่บันทึกบัญชี ต้นทาง", sortable: true, align: "center", renderer:shortThaiDate, dataIndex: "d_save_date" },
			{ header: "หมายเหตุ", sortable: true, dataIndex: "c_comment",id:'c_comment' },
		],
		autoExpandColumn: "c_comment",
		bbar: new Ext.PagingToolbar({
			pageSize: 20,
			store: storeAD,
			displayInfo: true,
			displayMsg: 'Displaying topics {0} - {1} of {2}'
		})
	}); //gridAD
	
	
	//================================ gridMain ================================//
	cellClick	= function( grid, rowIndex, columnIndex, e ) {	

		var record = grid.getStore().getAt(rowIndex);
		if ( columnIndex == grid.getColumnModel().getIndexById("edit") ) {
			
			Ext.getCmp("tabpanel2").setDisabled(false);
			Ext.getCmp("contenterCenter").setActiveTab("tabpanel2");
			Ext.getCmp("form-widgets").getForm().reset();
			Ext.getCmp("form-widgets").getForm().loadRecord(record);
			Ext.getCmp("role-form-mode").setValue("EDIT");
				
			Ext.getCmp("icon-save").show();
			Ext.getCmp("btn_dtl").show();
			Ext.getCmp("btn_tax").show();
				
			if(record.data.i_is_post == 2) {
				Ext.getCmp("mode_gx").setValue("EDIT_GX");
				Ext.getCmp("d_save_date").setDisabled(true);
				Ext.getCmp("btn_gen").hide();
			} else {
				Ext.getCmp("mode_gx").setValue("EDIT");
				Ext.getCmp("d_save_date").setDisabled(false);
				Ext.getCmp("btn_gen").show();
			}
				
			store_tran_dtl.setBaseParam("id", Ext.getCmp("id").getValue());
			store_tran_dtl.load();
			
			store_tran_purchase_tax.setBaseParam("id", Ext.getCmp("id").getValue());
			store_tran_purchase_tax.load();

			Ext.getCmp("boxDetail").hide();			
		}
	}; //cellClick
		
	gridMain = new Ext.grid.GridPanel({
		region: "center",
		layout: "fit",
		title: "รายการรอลงบัญชี AD",
		id: "tabpanel1",
		border: false,
		stripeRows: true,
		loadMask: true,
		store: store,
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
            	items: [{ xtype: "label", text: "เลขที่เอกสาร : " }, { xtype: "tbspacer", width: 4 },{			
    				id : "value-box1",
    				xtype : "textfield",
    				width: 246, 
    				fieldLabel : "fieldLabel",
    				emptyText : 'คำที่ต้องการค้นหา',
    			}]
            }, { // แถวที่ 2
            	xtype: "buttongroup",
            	frame: false,
            	items: [{ xtype: "label", text: "วันที่เอกสาร ระหว่างวันที่ : " }, { xtype: "tbspacer", width: 4 }, {
            		id: "d_doc_date_start_gl", xtype: "datefield", width: 100, 
    				listeners : {
						afterrender : function() {
							var date = new Date();
								date = new Date(date.getFullYear()+543, date.getMonth()-2, 1);
							this.setValue(date);
						}
					}
            	}, { xtype: "tbspacer", width: 5 }, { xtype: "label", text: "ถึงวันที่ : " }, { xtype: "tbspacer", width: 4 }, {
            		id: "d_doc_date_end_gl", xtype: "datefield", width: 100, 
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
    				
    				store.setBaseParam("c_ref_doc", Ext.getCmp("value-box1").getValue());
					store.setBaseParam("d_doc_date1", Ext.getCmp("d_doc_date_start_gl").getValue());
					store.setBaseParam("d_doc_date2", Ext.getCmp("d_doc_date_end_gl").getValue());
					store.load();
    			}
            }]
		}],
		columns: [
		    new Ext.grid.RowNumberer({header:"ที่", width: 30,
				renderer: function(value, metaData, record, row, col, store, gridView) {
					return record.get("no");
				}
			}),
			{ id: "edit", header: "แก้ไข", sortable: true, align: "center", dataIndex: "id",
				renderer: function(value, metaData, record, row, col, store, gridView) {
					return "<button style=\"font-size:11px; cursor:pointer;\">แก้ไข</button>";
				}
			},
			{ header: "เลขที่เอกสาร", sortable: true, align: "center", dataIndex: "c_ref_doc" },
			{ header: "วันที่เอกสาร", sortable: true, align: "center", renderer:shortThaiDate, dataIndex: "d_doc_date" },
			{ header: "จำนวนเงิน", sortable: true, dataIndex: "f_money_dtl",
				renderer: function(value, metaData, record, row, col, store, gridView) {
					metaData.attr = "style='color:blue; font-weight:bold;' align='right'";
					return floatRenderer(value);
				}
			},
			{ id: "c_comment1", header: "คำอธิบาย", sortable: true, dataIndex: "c_comment1" },
			{ header: "ผู้สร้างรายการ", sortable: true, align: "center", dataIndex: "dc_user_create_id" },
			{ header: "วันที่สร้าง", sortable: true, align: "center", dataIndex: "d_create",
				renderer: function(value, metaData, record, row, col, store, gridView) {
					if(value != "") { return shortThaiDate(value); }
					else { return ""; }
				}
			},
			{ header: "ผู้แก้ไขรายการ", sortable: true, align: "center", dataIndex: "dc_user_update_id" },
			{ header: "วันที่แก้ไขรายการ", sortable: true, align: "center", dataIndex: "d_update",
				renderer: function(value, metaData, record, row, col, store, gridView) {
					if(value != "") { return shortThaiDate(value); }
					else { return ""; }
				}
			},
			{ header: "หน่วยงานที่แก้ไข", sortable: true, align: "center", dataIndex: "dc_user_update_cost_id" }
		],
		autoExpandColumn: "c_comment1",
		bbar: pagingBar
	}); //gridMain
	
	//=================================== รายละเอียดสมุดรายวัน ===================================//
	PopTranDtl	= function( hdr_id ) {
		new Ext.Window({
			title: "แสดงรายละเอียดสมุดรายวัน",
			id: "win-pop-tran-dtl",
			modal: true,
			preventBodyReset: true,
			closable: true,
			autoScroll: true,
			maximizable: true,
//			maximized: true, // เต็มจอ auto
			height: (Ext.getBody().getViewSize().height * 0.99),
			width: (Ext.getBody().getViewSize().width * 0.99),
			listeners: {
				afterrender: function( component ) {
					// Create Row
					var tbody	= "";
					
					Ext.getCmp("win-pop-tran-dtl").getEl().mask("Please wait...", "x-mask-loading");
					$.ajax({
						url: "../gl/api/List_GlTranhdr.php",
						type: "POST",
						data: {
							type: "tran_dtl",
							id: hdr_id
						},
						success: function(result) {
							var obj = $.parseJSON( result );
							
							if(obj.debug == true) {
								$.each(obj.data , function( index, v ) {
									
									var addBody		= "";
									
									// GEN TBODY
									addBody	+= "<input id=\"dtl_no["+index+"]\" type=\"hidden\" value=\""+index+"\">";
									addBody	+= "<td id=\"Ext_dtl_i_rank["+index+"]\" align=\"center\"></td>";
									addBody	+= "<td id=\"Ext_dtl_dc_acc_id["+index+"]\" align=\"center\"></td>";
									addBody	+= "<td id=\"Ext_dtl_dc_cost_acc_id["+index+"]\" align=\"center\"></td>";
									addBody	+= "<td id=\"Ext_dtl_f_dr["+index+"]\" align=\"center\"></td>";
									addBody	+= "<td id=\"Ext_dtl_f_cr["+index+"]\" align=\"center\"></td>";
									addBody	+= "<td id=\"Ext_dtl_i_is_nontax_exp["+index+"]\" align=\"center\"></td>";
									addBody	+= "<td id=\"Ext_dtl_dc_product_id["+index+"]\" align=\"center\"></td>";
									addBody	+= "<td align=\"center\"><div id=\"Ext_dtl_i_type_person["+index+"]\" style=\"width:400px;\"></div></td>";
									addBody	+= "<td id=\"Ext_dtl_delete["+index+"]\" align=\"center\"></td>";

									$("#myTableDtl > tbody:last").append("<tr id=\"dtl_row["+index+"]\">"+addBody+"</tr>");
									
									myFunc( index, v );
								});
								
								Ext.getCmp("win-pop-tran-dtl").getEl().unmask();
							}
						}
					});
		        }
			},
			tbar: [{
				id: "row-tran-dtl",
				xtype: "idcardfield",
				width: 70,
				value: 1,
				autoCreate: { tag: "input", type: "text", autocomplete: "off", maxLength: 2 },
				emptyText : "จำนวนแถว",
				listeners: {
	           	     change : function(obj, value) {
	           	    	 if(value == "") { obj.setValue(1); }
	           	     }
				}
			}, "-", {
				text : "เพิ่มแถว",
				iconCls: "icon-add",
				handler: function(grid, rowIndex, colIndex) {
					
					var msg	= "";
					if(msg	== "") {
						for(var i = 1; 	i <= Ext.getCmp("row-tran-dtl").getValue(); i++) {
							
							var addBody		= "";
							var beforeIndex= parseInt($("#myTableDtl > tbody > tr:last > input[id^=dtl_no]").val());
							var index	= (isNaN(beforeIndex))? 0 : parseInt(beforeIndex) + 1;
	
							addBody	+= "<input id=\"dtl_no["+index+"]\" type=\"hidden\" value=\""+index+"\">";
							addBody	+= "<td id=\"Ext_dtl_i_rank["+index+"]\" align=\"center\"></td>";
							addBody	+= "<td id=\"Ext_dtl_dc_acc_id["+index+"]\" align=\"center\"></td>";
							addBody	+= "<td id=\"Ext_dtl_dc_cost_acc_id["+index+"]\" align=\"center\"></td>";
							addBody	+= "<td id=\"Ext_dtl_f_dr["+index+"]\" align=\"center\"></td>";
							addBody	+= "<td id=\"Ext_dtl_f_cr["+index+"]\" align=\"center\"></td>";
							addBody	+= "<td id=\"Ext_dtl_i_is_nontax_exp["+index+"]\" align=\"center\"></td>";
							addBody	+= "<td id=\"Ext_dtl_dc_product_id["+index+"]\" align=\"center\"></td>";
							addBody	+= "<td align=\"center\"><div id=\"Ext_dtl_i_type_person["+index+"]\" style=\"width:400px;\"></div></td>";
							addBody	+= "<td id=\"Ext_dtl_delete["+index+"]\" align=\"center\"></td>";
	
							$("#myTableDtl > tbody:last").append("<tr id=\"dtl_row["+index+"]\">"+addBody+"</tr>");
							
							myFunc( index, null );
						}
					} else {
						Ext.MessageBox.alert("แจ้งเตือน", msg);
					}
				}
			}],
			html:	"<div style=\"background:#fff; overflow:auto;\">" +
						"<form id=\"form_save_dtl\" name=\"form_save_dtl\" method=\"POST\">" +
							"<input type=\"hidden\" id=\"dtl_creditor_dtl_id\">" +
							"<input type=\"hidden\" id=\"dtl_creditor_dtl_val\">" +
							"<table id=\"myTableDtl\" border=\"0\" cellspacing=\"1\" cellpadding=\"0\" width=\"100%\">" +
								// headder
								"<thead class=\"x-grid3-header\">" +
									"<tr class=\"x-grid3-hd-row\" height=\"20\">" +
										"<td nowrap>ที่</td>" +
										"<td nowrap>รหัสบัญชี</td>" +
										"<td nowrap>ชื่อศูนย์ต้นทุน</td>" +
										"<td nowrap>เดบิต</td>" +
										"<td nowrap>เครดิต</td>" +
										"<td nowrap>รายการบวกกลับ</td>" +
										"<td nowrap>รายการรายได้/รายการออกอากาศ</td>" +
										"<td nowrap>ชื่อลูกหนี้/เจ้าหนี้</td>" +
										"<td nowrap width=\"40\">-</td>" +
									"</tr>" +
								"</thead>" +
								// body
								"<tbody></tbody>" +
								"<tfoot>" +
									"<tr>" +
										"<td colspan=\"3\" align=\"right\"><b>รวม</b></td>" +
										"<td id=\"sum_dr\" style=\"text-align: right; font-weight: bold;\">0.00</td>" +
										"<td id=\"sum_cr\" style=\"text-align: right; font-weight: bold;\">0.00</td>" +
									"</tr>" +
								"</tfoot>" +
							"</table>" +
						"</form>" +
					"</div>",
			buttonAlign: "left",
			buttons : [{
				text: Ext.GLOBAL_BU_SAVE_TH,
				iconCls: "icon-save",
				handler: function() {
					
					var chkData	= false;
					
					$( "input[id^=dtl_no]" ).each(function( i, val ) { chkData	= true; });
					
					if(chkData == true) {
						SaveTranDtl( hdr_id, false ); // false
					} else {
						Ext.MessageBox.alert("แจ้งเตือน", "กรุณาเพิ่มข้อมูลรายการ");
					}
				}
			}, {
				text: "บันทึกการแก้ไขและตรวจสอบ",
				iconCls: "icon-save",
				handler: function() {
					
					var chkData = false;
					
					$( "input[id^=dtl_no]" ).each(function( i, val ) { chkData = true; });
					
					if(chkData == true) {
						SaveTranDtl( hdr_id, true ); // true
					} else {
						Ext.MessageBox.alert("แจ้งเตือน", "กรุณาเพิ่มข้อมูลรายการ");
					}
				}
			}, {
				text: Ext.GLOBAL_BU_BACK_TH,
				handler: function() {
					Ext.getCmp("win-pop-tran-dtl").destroy();
				}
			}]
		}).show();
		
		// ============================ myFunc ============================ //
		
		var myFunc = function( index, v ) {
			
			// ลำดับที่
			new Ext.form.TextField({
				id: "dtl_i_rank["+index+"]",
				style: "text-align: center",
				width: 50,
				renderTo: "Ext_dtl_i_rank["+index+"]"
			});

			// รหัสบัญชี
			new Ext.form.ComboBox({
				id: "dtl_dc_acc_id["+index+"]",
				store: store_acc,
				valueField: "id",
				displayField: "c_name",
				mode: "local",
				triggerAction: "all",
				emptyText: "กรุณาเลือก...",
				width: 300,
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
					blur: function() { this.getStore().clearFilter(); },
					afterrender: function() {
						this.fn	= function() {
							ChangeAcc( index );
						}
					},
					Change: function(value) {
						this.fn();
					}
				},
				renderTo: "Ext_dtl_dc_acc_id["+index+"]"
			});
			
			// รหัสศูนย์ต้นทุนทางบัญชี
			new Ext.form.ComboBox({
				id: "dtl_dc_cost_acc_id["+index+"]",
				store: store_cost_acc,
				valueField: "id",
				displayField: "c_name",
				mode: "local",
				triggerAction: "all",
				emptyText: "กรุณาเลือก...",
				width: 300,
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
				renderTo: "Ext_dtl_dc_cost_acc_id["+index+"]"
			});
			

			// เดบิต
			new Ext.form.TextField({
				id: "dtl_f_dr["+index+"]",
				style: "text-align: right",
				listeners: {
    				afterrender: function() {
						this.fn	= function() {
							this.setValue(floatAccount(this.getValue(), 2));
							SumPrice();
						}
					},
					Change: function(value) {
						this.fn();
					}
				},
				width: 100,
				renderTo: "Ext_dtl_f_dr["+index+"]"
			});
			
			// เครดิต
			new Ext.form.TextField({
				id: "dtl_f_cr["+index+"]",
				style: "text-align: right",
				listeners: {
    				afterrender: function() {
						this.fn	= function() {
							this.setValue(floatAccount(this.getValue(), 2));
							SumPrice();
						}
					},
					Change: function(value) {
						this.fn();
					}
				},
				width: 100,
				renderTo: "Ext_dtl_f_cr["+index+"]"
			});

			// รายการบวกกลับ
			new Ext.form.Checkbox({
				id: "dtl_i_is_nontax_exp["+index+"]",
				inputValue: "1",
				hidden: true,
				renderTo: "Ext_dtl_i_is_nontax_exp["+index+"]"
			});
			
			// รายการรายได้
			new Ext.ButtonGroup({
            	columns: 1,
            	frame: false,
            	items: [{
	            	xtype: "buttongroup",
	            	frame: false,
	            	width: 300,
	            	items: [
	            		{ xtype: "button", iconCls: "book_open_mark",
	            			listeners: {
	            		    	afterrender: function() {
	            		    		this.fn	= function() {
	            		    			PopProduct( index );
	            					}
	            				},
								click: function() {
									this.fn();
								}
							}
            		    }, { xtype: "tbspacer", width: 4 },
            		    { id: "dtl_dc_product_id["+index+"]", xtype: "hidden" },
	            		{ id: "dtl_dc_product_name["+index+"]", xtype: "textfield", width: 200, readOnly: true },
	            		{ xtype: "tbspacer", width: 4 },
	            		{ xtype: "button", text: "Reset",
	            			listeners: {
	            				afterrender: function() {
	            	    			this.fn	= function() {
	            	    				var arr	= ["dtl_dc_product_id["+index+"]", "dtl_dc_product_name["+index+"]"];
										Reset( arr );
	            					}
	            				},
								click: function() {
									this.fn();
								}
							}
	            		}
	            	]
	            }],
            	renderTo: "Ext_dtl_dc_product_id["+index+"]"
            });
			
			// ชื่อเจ้าหนี้
            new Ext.ButtonGroup({
            	columns: 1,
            	frame: false,
            	items: [
            		new Ext.form.RadioGroup({
            			id: "dtl_i_type_person["+index+"]",
            			columns: [ 60, 95, 80, 60 ],
            			items: [
            				{ boxLabel: "ไม่มี", name: "i_type_person["+index+"]", inputValue: 0, checked: true },
            				{ boxLabel: "ผู้ขาย/ผู้รับจ้าง", name: "i_type_person["+index+"]", inputValue: 1 },
            				{ boxLabel: "บุคคลภายใน", name: "i_type_person["+index+"]", inputValue: 3 },
            				{ boxLabel: "ทั่วไป", name: "i_type_person["+index+"]", inputValue: 4 }
            			],
            			listeners: {
            				afterrender: function() {
        						this.fn	= function() {
        							ChangeCreditor( index );
        						}
        					},
        					Change: function(value) {
        						this.fn();
        					}
						}
				}), {
	            	xtype: "buttongroup",
	            	frame: false,
	            	items: [{
	            		xtype: "buttongroup",
	            		id: "span_creditor["+index+"]",
	            		frame: false,
	            		width: 400,
	            		items: [
	            		    { xtype: "button", iconCls: "book_open_mark",
	            		    	listeners: {
	            		    		afterrender: function() {
	            		    			this.fn	= function() {
	            							PopCreditor( "vw_dc_creditor", index );
	            						}
	            					},
	            					click: function() { this.fn(); }
								}
	            		    }, { xtype: "tbspacer", width: 4 },
	            		    { id: "dtl_dc_creditor_id["+index+"]", xtype: "hidden" },
	            			{ id: "dtl_dc_creditor_name["+index+"]", xtype: "textfield", width: 300, readOnly: true },
	            			{ xtype: "tbspacer", width: 4 },
	            			{ xtype: "button", text: "Reset",
	            				listeners: {
	            					afterrender: function() {
	            		    			this.fn	= function() {
	            		    				var arr	= ["dtl_dc_creditor_id["+index+"]", "dtl_dc_creditor_name["+index+"]"];
											Reset( arr );
											ChangeCreditor( index );
	            						}
	            					}, click: function() { this.fn(); }
								}
	            			}
	            		]
	            	}, {
	            		xtype: "buttongroup",
	            		id: "span_debtor["+index+"]",
	            		frame: false,
	            		width: 400,
	            		items: [
	            		    { xtype: "button", iconCls: "book_open_mark",
	            		    	listeners: {
	            		    		afterrender: function() {
	            		    			this.fn	= function() {
	            							PopCreditor( "vw_dc_debtor", index );
	            						}
	            					},
	            					click: function() { this.fn(); }
								}
	            		    }, { xtype: "tbspacer", width: 4 },
	            		    { id: "dtl_dc_debtor_id["+index+"]", xtype: "hidden" },
	            			{ id: "dtl_dc_debtor_name["+index+"]", xtype: "textfield", width: 300, readOnly: true },
	            			{ xtype: "tbspacer", width: 4 },
	            			{ xtype: "button", text: "Reset",
	            				listeners: {
	            					afterrender: function() {
	            		    			this.fn	= function() {
	            		    				var arr	= ["dtl_dc_debtor_id["+index+"]", "dtl_dc_debtor_name["+index+"]"];
											Reset( arr );
											ChangeCreditor( index );
	            						}
	            					}, click: function() { this.fn(); }
								}
	            			}
	            		]
	            	}, {
	            		xtype: "buttongroup",
	            		id: "span_emp["+index+"]",
	            		frame: false,
	            		width: 400,
	            		items: [
	            		    { xtype: "button", iconCls: "book_open_mark",
	            		    	listeners: {
	            		    		afterrender: function() {
	            		    			this.fn	= function() {
	            		    				PopCreditor( "dc_emp", index );
	            						}
	            					},
									click: function() { this.fn(); }
								}
	            		    },
	            		    { xtype: "tbspacer", width: 4 },
	            		    { id: "dtl_dc_emp_id["+index+"]", xtype: "hidden" },
	            			{ id: "dtl_dc_emp_name["+index+"]", xtype: "textfield", width: 300, readOnly: true },
	            			{ xtype: "tbspacer", width: 4 },
	            			{ xtype: "button", text: "Reset",
	            				listeners: {
	            					afterrender: function() {
	            		    			this.fn	= function() {
	            		    				var arr	= ["dtl_dc_emp_id["+index+"]", "dtl_dc_emp_name["+index+"]"];
											Reset( arr );
	            						}
	            					},
									click: function() { this.fn(); }
								}
	            			}
	            		]
	            	}, {
	            		xtype: "buttongroup",
	            		id: "span_other_name["+index+"]",
	            		frame: false,
	            		width: 400,
	            		items: [
	            		    { xtype: "button", iconCls: "book_open_mark",
	            		    	listeners: {
	            		    		afterrender: function() {
	            		    			this.fn	= function() {
	            		    				PopCreditor( "other_name", index );
	            						}
	            					},
									click: function() { this.fn(); }
								}
	            		    },
	            		    { xtype: "tbspacer", width: 4 },
	            			{ id: "dtl_c_other_name["+index+"]", xtype: "textfield", width: 300, readOnly: true },
	            			{ xtype: "tbspacer", width: 4 },
	            			{ xtype: "button", text: "Reset",
	            				listeners: {
	            					afterrender: function() {
	            		    			this.fn	= function() {
	            		    				var arr	= ["dtl_c_other_name["+index+"]"];
											Reset( arr );
	            						}
	            					},
									click: function() { this.fn(); }
								}
	            			}
	            		]
	            	}]
	            }],
            	renderTo: "Ext_dtl_i_type_person["+index+"]"
            });
            
			
                // ลบ
                new Ext.Button({
                        id: "dtl_delete["+index+"]",
                        icon: "../images/icons/bin.gif",
                        tooltip: "ลบรายการ",
                        handler: function() {
                                $("#myTableDtl > tbody > #dtl_row\\["+index+"\\]").remove();
                                SumPrice();
                },
				renderTo: "Ext_dtl_delete["+index+"]"
			});
			
			if(v != null) {

				if(v.dc_acc_id > 0) {
					Ext.getCmp("dtl_dc_acc_id["+index+"]").setValue(v.dc_acc_id);
					Ext.getCmp("dtl_dc_acc_id["+index+"]").fn();
				}
				if(v.dc_cost_acc_id > 0) { Ext.getCmp("dtl_dc_cost_acc_id["+index+"]").setValue(v.dc_cost_acc_id); }
				if(v.f_dr > 0) {
					Ext.getCmp("dtl_f_dr["+index+"]").setValue(v.f_dr);
					Ext.getCmp("dtl_f_dr["+index+"]").fn();
				}
				if(v.f_cr > 0) {
					Ext.getCmp("dtl_f_cr["+index+"]").setValue(v.f_cr);
					Ext.getCmp("dtl_f_cr["+index+"]").fn();
				}
				if(v.dc_product_id > 0) {
					Ext.getCmp("dtl_dc_product_id["+index+"]").setValue(v.dc_product_id);
					Ext.getCmp("dtl_dc_product_name["+index+"]").setValue(v.dc_product_name);
				}
				if(v.dc_debtor_id > 0) { Ext.getCmp("dtl_dc_debtor_id["+index+"]").setValue(v.dc_debtor_id); }
                                if(v.dc_creditor_id > 0) { Ext.getCmp("dtl_dc_creditor_id["+index+"]").setValue(v.dc_creditor_id); }
				if(v.dc_emp_id > 0) { Ext.getCmp("dtl_dc_emp_id["+index+"]").setValue(v.dc_emp_id); }
				
				Ext.getCmp("dtl_i_type_person["+index+"]").setValue(v.i_type_person);
				Ext.getCmp("dtl_i_type_person["+index+"]").fn();
				Ext.getCmp("dtl_i_rank["+index+"]").setValue(v.i_rank);
				Ext.getCmp("dtl_i_is_nontax_exp["+index+"]").setValue(v.i_is_nontax_exp);
				Ext.getCmp("dtl_dc_debtor_name["+index+"]").setValue(v.dc_debtor_name);
				Ext.getCmp("dtl_dc_creditor_name["+index+"]").setValue(v.dc_creditor_name);
				Ext.getCmp("dtl_dc_emp_name["+index+"]").setValue(v.dc_emp_name);
				Ext.getCmp("dtl_c_other_name["+index+"]").setValue(v.c_other_name);

			} else {
				Ext.getCmp("dtl_i_rank["+index+"]").setValue(index+1);
				Ext.getCmp("dtl_i_type_person["+index+"]").fn();
			}
			ChangeCreditor( index ); // check hide span
		}
		
		// ============================================ //
		var ChangeAcc	= function( index ) {
			
			var i_group	= 0;
			
			if(Ext.getCmp("dtl_dc_acc_id["+index+"]").getValue() > 0) {
				var ss		= store_acc.findExact("id" ,Ext.getCmp("dtl_dc_acc_id["+index+"]").getValue());
				if( ss > 0 ) {
					var i_group	= store_acc.data.items[ss].data.i_group;	
				}
			}
			
			if(i_group == 5) {
				Ext.getCmp("dtl_i_is_nontax_exp["+index+"]").show();
			} else {
				Ext.getCmp("dtl_i_is_nontax_exp["+index+"]").hide();
			}
		}
		
		// ============================================ //
		var SumPrice	= function () {
			var index;
			var f_dr	= 0;
			var c_dr	= 0;
			var sum_dr	= 0;
			var sum_cr	= 0;
			
			$( "input[id^=dtl_no]" ).each(function( i, val ) { // ROW RUN
				index	= val.value;
				f_dr	= parseFloat(Ext.getCmp("dtl_f_dr["+index+"]").getValue());
				f_cr	= parseFloat(Ext.getCmp("dtl_f_cr["+index+"]").getValue());
				sum_dr	+= (f_dr > 0)? f_dr : 0;
				sum_cr	+= (f_cr > 0)? f_cr : 0;
			});
			
			sum_dr	= (sum_dr > 0)? floatRenderer(floatAccount(sum_dr, 2)) : "0.00";
			sum_cr	= (sum_cr > 0)? floatRenderer(floatAccount(sum_cr, 2)) : "0.00";
			
			$("#sum_dr").text(sum_dr);
			$("#sum_cr").text(sum_cr);
		}

		// ============================================ //
		var ChangeCreditor	= function( index ) {
			
			var i_type_person	= Ext.getCmp("dtl_i_type_person["+index+"]").getValue().inputValue;
			
			if( i_type_person == PERSON_TYPE_DEBTOR ) { // ลูกหนี้
				
				Ext.getCmp("span_debtor["+index+"]").show();
				Ext.getCmp("span_creditor["+index+"]").hide();
				Ext.getCmp("span_emp["+index+"]").hide();
				Ext.getCmp("span_other_name["+index+"]").hide();
				
			} else if(i_type_person == PERSON_TYPE_CREDITOR) { // เจ้าหนี้ผู้ขาย/ผู้รับจ้าง
				
				Ext.getCmp("span_debtor["+index+"]").hide();
				Ext.getCmp("span_creditor["+index+"]").show();
				Ext.getCmp("span_emp["+index+"]").hide();
				Ext.getCmp("span_other_name["+index+"]").hide();

			} else if(i_type_person == PERSON_TYPE_EMPLOYEE) { // เจ้าหนี้พนักงาน
				
				Ext.getCmp("span_debtor["+index+"]").hide();
				Ext.getCmp("span_creditor["+index+"]").hide();
				Ext.getCmp("span_emp["+index+"]").show();
				Ext.getCmp("span_other_name["+index+"]").hide();

			} else if(i_type_person == PERSON_TYPE_OTHER) { // เจ้าหนี้ทั่วไป
				
				Ext.getCmp("span_debtor["+index+"]").hide();
				Ext.getCmp("span_creditor["+index+"]").hide();
				Ext.getCmp("span_emp["+index+"]").hide();
				Ext.getCmp("span_other_name["+index+"]").show();				

			} else {
				
				Ext.getCmp("span_debtor["+index+"]").hide();
				Ext.getCmp("span_creditor["+index+"]").hide();
				Ext.getCmp("span_emp["+index+"]").hide();
				Ext.getCmp("span_other_name["+index+"]").hide();

			}
		}
		
		// ============================================ //
		
		var cellClick_lov	= function(grid, rowIndex, columnIndex, e) {
			var ss_id;
			var ss_store;
			var record				= grid.getStore().getAt(rowIndex);
			var creditor_dtl_id		= $("#dtl_creditor_dtl_id").val();
			var index				= $("#dtl_creditor_dtl_val").val();
			
			if(creditor_dtl_id == "vw_dc_creditor") {
				
				ss_id		= vw_dc_creditor.findExact("id", record.data.id);
				ss_store	= vw_dc_creditor.data.items[ss_id];
				
				Ext.getCmp("dtl_dc_creditor_id["+index+"]").setValue(ss_store.data.id);
				Ext.getCmp("dtl_dc_creditor_name["+index+"]").setValue(ss_store.data.c_name);
				
				ChangeCreditor( index );
				
			} else if(creditor_dtl_id == "vw_dc_debtor") {
				
				ss_id		= vw_dc_debtor.findExact("id", record.data.id);
				ss_store	= vw_dc_debtor.data.items[ss_id];
					
				Ext.getCmp("dtl_dc_debtor_id["+index+"]").setValue(ss_store.data.id);
				Ext.getCmp("dtl_dc_debtor_name["+index+"]").setValue(ss_store.data.c_name);
					
				ChangeCreditor( index );
				
			} else if(creditor_dtl_id == "dc_emp") {
				
				ss_id		= vw_show_emp_name_gl0201b.findExact("id", record.data.id);
				ss_store	= vw_show_emp_name_gl0201b.data.items[ss_id];
				
				Ext.getCmp("dtl_dc_emp_id["+index+"]").setValue(ss_store.data.id);
				Ext.getCmp("dtl_dc_emp_name["+index+"]").setValue(ss_store.data.c_name);
				
			} else if(creditor_dtl_id == "other_name") {
				
				ss_id		= vw_c_other.findExact("id", record.data.id);
				ss_store	= vw_c_other.data.items[ss_id];
				
				Ext.getCmp("dtl_c_other_name["+index+"]").setValue(ss_store.data.c_name);
				
			}
			
			Ext.getCmp("win-pop-lov").destroy();
		};
		
		// ============================================ //
		
		var PopCreditor	= function( name_id, val ) {
			
			var sto;
			
			if(name_id == "vw_dc_creditor")		{ sto = vw_dc_creditor; }
			else if(name_id == "vw_dc_debtor")	{ sto = vw_dc_debtor; }
			else if(name_id == "dc_emp")		{ sto = vw_show_emp_name_gl0201b; }
			else if(name_id == "other_name")	{ sto = vw_c_other; }
			
			$("#dtl_creditor_dtl_id").val(name_id);
			$("#dtl_creditor_dtl_val").val(val);
			
			if ((name_id == "vw_dc_creditor") || (name_id == "vw_dc_debtor") || (name_id == "dc_emp")) {
				new Ext.Window({
					id: "win-pop-lov",
					title: "เลือกข้อมูล",
					modal: true,
					maximizable: true,
					height: (Ext.getBody().getViewSize().height * 0.8),
					width: (Ext.getBody().getViewSize().width * 0.8),
					layout: "fit",
					items:[{
						xtype: "grid",
						id: "win-pop-lov-tabpanel", 
						border: false,
						stripeRows: true,
						loadMask: true,
						store: sto,
						viewConfig : {
							emptyText: "ไม่มีข้อมูล..",
							deferEmptyText: false
						},
						listeners : {
							afterrender : function() {
								this.getStore().setBaseParam("mode", "");
								this.getStore().load();
							}
						},
						tbar: [{
							id: "pop-filter",
							xtype: "combo",
							width: 110,
							mode: "local",
							store: new Ext.data.SimpleStore({
								fields: [ "value", "text" ],
								data: [
								       [ "c_code", "รหัส" ],
								       [ "c_name", "ชื่อ" ]
								      ]
							}),
							valueField: "value",
							displayField: "text",
							value: "c_code",
							allowBlank: false,
							editable: false,
							triggerAction: "all",
							typeAhead : false,
							emptyText : "เลือกตัวกรอง",
						}, " ", {
							id: "pop-value",
							xtype: "textfield",
							width: 130,
							emptyText : "คำที่ต้องการค้นหา",
						}, "-", {
							text: "ค้นหา",
							iconCls: "icon-magnifier",
							handler : function() {
								if (Ext.getCmp("pop-value").getValue() != "") {
									sto.setBaseParam("filter", Ext.getCmp("pop-filter").getValue());
									sto.setBaseParam("value", Ext.getCmp("pop-value").getValue());
								} else {
									sto.setBaseParam("filter", "");
									sto.setBaseParam("value", "");
								}
								sto.setBaseParam("mode", "SEARCH");
								sto.load();
							}
						}],
						bbar: new Ext.PagingToolbar({
					    	pageSize: 15,
					    	store: sto,
					    	displayInfo: true,
					    	displayMsg: "Displaying topics {0} - {1} of {2}"
					    }),
						columns:[
							new Ext.grid.RowNumberer({header:"ที่", width: 30,
								renderer:function(value, metaData, record, row, col, store, gridView) {
									return record.get("no");
								}
							}), {
								header: "รหัส", sortable: true, dataIndex: "c_code",
								renderer: function(value, metaData, record, rowIndex, colIndex, store) {
						    		metaData.attr = "style= \"cursor:pointer; text-align:center;\";";
						    		return value;
						    	}
						    },{
						    	id: "synName", header: "ชื่อ", sortable: true, dataIndex: "c_name",
						    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
						    		metaData.attr = "style= \"cursor:pointer\";";
						    		return value;
						    	}
						    }], 
						    autoExpandColumn: "synName"
					}]
				}).show(); 
			} else {
				new Ext.Window({
					id: "win-pop-lov",
					title: "เลือกข้อมูล",
					modal: true,
					maximizable: true,
					height: (Ext.getBody().getViewSize().height * 0.8),
					width: (Ext.getBody().getViewSize().width * 0.8),
					layout: "fit",
					items:[{
						xtype: "grid",
						id: "win-pop-lov-tabpanel", 
						border: false,
						stripeRows: true,
						loadMask: true,
						store: sto,
						viewConfig : {
							emptyText: "ไม่มีข้อมูล..",
							deferEmptyText: false
						},
						listeners : {
							afterrender : function() {
								this.getStore().setBaseParam("mode", "");
								this.getStore().load();
							}
						},
						tbar: [{
							id: "pop-filter",
							xtype: "combo",
							width: 110,
							mode: "local",
							store: new Ext.data.SimpleStore({
								fields: [ "value", "text" ],
								data: [ 
								       [ "c_name", "ชื่อ" ]
								      ]
							}),
							valueField: "value",
							displayField: "text",
							value: "c_name",
							allowBlank: false,
							editable: false,
							triggerAction: "all",
							typeAhead : false,
							emptyText : "เลือกตัวกรอง",
						}, " ", {
							id: "pop-value",
							xtype: "textfield",
							width: 130,
							emptyText : "คำที่ต้องการค้นหา",
						}, "-", {
							text: "ค้นหา",
							iconCls: "icon-magnifier",
							handler : function() {
								if (Ext.getCmp("pop-value").getValue() != "") {
									sto.setBaseParam("filter", Ext.getCmp("pop-filter").getValue());
									sto.setBaseParam("value", Ext.getCmp("pop-value").getValue());
								} else {
									sto.setBaseParam("filter", "");
									sto.setBaseParam("value", "");
								}
								sto.setBaseParam("mode", "SEARCH");
								sto.load();
							}
						}],
						bbar: new Ext.PagingToolbar({
					    	pageSize: 15,
					    	store: sto,
					    	displayInfo: true,
					    	displayMsg: "Displaying topics {0} - {1} of {2}"
					    }),
						columns:[
							new Ext.grid.RowNumberer({header:"ที่", width: 30,
								renderer:function(value, metaData, record, row, col, store, gridView) {
									return record.get("no");
								}
							}),{
						    	id: "synName", header: "ชื่อ", sortable: true, dataIndex: "c_name",
						    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
						    		metaData.attr = "style= \"cursor:pointer\";";
						    		return value;
						    	}
						    }], 
						    autoExpandColumn: "synName"
					}]
				}).show();
			}
			Ext.getCmp("win-pop-lov-tabpanel").on("cellclick", cellClick_lov, this);
		}
		
		// ============================================ //
		
		var PopProduct	= function( index ) {
			
			var cellClick_Product	= function(grid, rowIndex, columnIndex, e) {
				
				var record		= grid.getStore().getAt(rowIndex);
				var ss_id		= store_product.findExact("id", record.data.id);
				var ss_store	= store_product.data.items[ss_id];
					
				Ext.getCmp("dtl_dc_product_id["+index+"]").setValue(ss_store.data.id);
				Ext.getCmp("dtl_dc_product_name["+index+"]").setValue(ss_store.data.c_name);

				Ext.getCmp("win-product").destroy();
			};
			
			new Ext.Window({
				id: "win-product",
				title: "เลือกข้อมูล",
				modal: true,
				maximizable: true,
				height: (Ext.getBody().getViewSize().height * 0.8),
				width: (Ext.getBody().getViewSize().width * 0.8),   //80% *0.8
				layout: "fit",
				items:[{
					xtype: "grid",
					id: "win-product-tabpanel",
					border: false,
					stripeRows: true,
					loadMask: true,
					store: store_product,
					viewConfig : {
						emptyText: "ไม่มีข้อมูล..",
						deferEmptyText: false
					},
					listeners : {
						afterrender : function() {
							this.getStore().setBaseParam("mode", "");
							this.getStore().load();
						}
					},
					tbar: [{
						id: "product-filter",
						xtype: "combo",
						width: 110,
						mode: "local",
						store: new Ext.data.SimpleStore({
							fields: [ "value", "text" ],
							data: [
							       [ "type_name", "ประเภทรายได้" ],
							       [ "c_code", "รหัสรายการรายได้" ],
							       [ "c_name", "ชื่อรายการรายได้" ]
							      ]
						}),
						valueField: "value",
						displayField: "text",
						value: "c_name",
						allowBlank: false,
						editable: false,
						triggerAction: "all",
						typeAhead : false,
						emptyText : "เลือกตัวกรอง",
					}, " ", {
						id: "product-value",
						xtype: "textfield",
						width: 130,
						emptyText : "คำที่ต้องการค้นหา",
					}, "-", {
						text: "ค้นหา",
						iconCls: "icon-magnifier",
						handler : function() {
							if (Ext.getCmp("product-value").getValue() != "") {
								store_product.setBaseParam("filter", Ext.getCmp("product-filter").getValue());
								store_product.setBaseParam("value", Ext.getCmp("product-value").getValue());
							} else {
								store_product.setBaseParam("filter", "");
								store_product.setBaseParam("value", "");
							}
							store_product.setBaseParam("mode", "SEARCH");
							store_product.load();
						}
					}],
					bbar: new Ext.PagingToolbar({
				    	pageSize: 15,
				    	store: store_product,
				    	displayInfo: true,
				    	displayMsg: "Displaying topics {0} - {1} of {2}"
				    }),
					columns:[
						new Ext.grid.RowNumberer({header:"ลำดับ", width: 30,
							renderer:function(value, metaData, record, row, col, store, gridView) {
								return record.get("no");
							}
						}),
						{ header: "ประเภทรายได้", sortable: true, dataIndex: "type_name",
							renderer: function(value, metaData, record, rowIndex, colIndex, store) {
								metaData.attr = "style= \"cursor:pointer;\";";
					    		return value;
							}
						},
						{ header: "รหัสรายการรายได้", sortable: true, dataIndex: "c_code",
							renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					    		metaData.attr = "style= \"cursor:pointer; text-align:center;\";";
					    		return value;
					    	}
					    }, {
					    	id: "synName", header: "ชื่อรายการรายได้", sortable: true, dataIndex: "c_name",
					    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					    		metaData.attr = "style= \"cursor:pointer\";";
					    		return value;
					    	}
					    }], 
					    autoExpandColumn: "synName"
				}]
			}).show();
			
			Ext.getCmp("win-product-tabpanel").on("cellclick", cellClick_Product, this);
		}

		// ============================================ //
		var Reset	= function( arr ) {
			$( arr ).each(function( i, val ) { // ROW RUN
				Ext.getCmp(val).setValue("");
			});
		}
	}
	
	// ====================== SaveTranDtl ====================== //
	SaveTranDtl	= function( hdr_id, i_chk ) {
		
		var jsonArr = [];
		var msg		= "";
		
		var dc_creditor_id	= null;
		var dc_debtor_id	= null;
		var dc_emp_id		= null;
		var c_other_name	= null;
		var i_is_nontax_exp	= null;
		var total_dr		= 0;
		var total_cr		= 0;
		
		$( "input[id^=dtl_no]" ).each(function( i, val ) { // ROW RUN
			
			var index	= val.value;
			var i_group	= 0;

			if(Ext.getCmp("dtl_dc_acc_id["+index+"]").getValue() != "") {
				var ss		= store_acc.findExact("id", Ext.getCmp("dtl_dc_acc_id["+index+"]").getValue());
				if( ss > 0 ) {
					var i_group	= store_acc.data.items[ss].data.i_group;
				}
			}

			if(i_group == 5) {
				if(Ext.getCmp("dtl_i_is_nontax_exp["+index+"]").getValue() == true) {
					i_is_nontax_exp	= 1;
				} else {
					i_is_nontax_exp	= 2;
				}
			} else {
				i_is_nontax_exp	= 2;
			}

			if(Ext.getCmp("dtl_i_type_person["+index+"]").getValue().inputValue == PERSON_TYPE_DEBTOR) {
				// ลูกหนี้
				dc_debtor_id	= Ext.getCmp("dtl_dc_debtor_id["+index+"]").getValue();
				dc_creditor_id	= null;
				dc_emp_id		= null;
				c_other_name	= null;
			} else if(Ext.getCmp("dtl_i_type_person["+index+"]").getValue().inputValue == PERSON_TYPE_CREDITOR) {
				// เจ้าหนี้ผู้ขาย/ผู้รับจ้าง
				dc_debtor_id	= null;
				dc_creditor_id	= Ext.getCmp("dtl_dc_creditor_id["+index+"]").getValue();
				dc_emp_id		= null;
				c_other_name	= null;
			} else if(Ext.getCmp("dtl_i_type_person["+index+"]").getValue().inputValue == PERSON_TYPE_EMPLOYEE) {
				// เจ้าหนี้พนักงาน
				dc_debtor_id	= null;
				dc_creditor_id	= null;
				dc_emp_id		= Ext.getCmp("dtl_dc_emp_id["+index+"]").getValue();
				c_other_name	= null;
			} else if(Ext.getCmp("dtl_i_type_person["+index+"]").getValue().inputValue == PERSON_TYPE_OTHER) {
				// เจ้าหนี้ทั่วไป
				dc_debtor_id	= null;
				dc_creditor_id	= null;
				dc_emp_id		= null;
				c_other_name	= Ext.getCmp("dtl_c_other_name["+index+"]").getValue();
			} else {
				dc_debtor_id	= null;
				dc_creditor_id	= null;
				dc_emp_id		= null;
				c_other_name	= null;
			}
			
			
			if( i_chk == true ) {
				
				var dd = "";

				if(Ext.getCmp("dtl_dc_acc_id["+index+"]").getValue() == 0) { dd += ", ผังบัญชี"; }
				if(Ext.getCmp("dtl_dc_cost_acc_id["+index+"]").getValue() == 0) { dd += ", ศูนย์ต้นทุนทางบัญชี"; }
				if(Ext.getCmp("dtl_f_dr["+index+"]").getValue() > 0 || Ext.getCmp("dtl_f_cr["+index+"]").getValue() > 0) {
					if(Ext.getCmp("dtl_f_dr["+index+"]").getValue() > 0 && Ext.getCmp("dtl_f_cr["+index+"]").getValue() > 0) {
						dd += ", จำนวนเงินเดบิตหรือเครดิตเท่านั้น";
					} else {
						total_dr += (Ext.getCmp("dtl_f_dr["+index+"]").getValue() > 0)? parseFloat(Ext.getCmp("dtl_f_dr["+index+"]").getValue()) : 0;
						total_cr += (Ext.getCmp("dtl_f_cr["+index+"]").getValue() > 0)? parseFloat(Ext.getCmp("dtl_f_cr["+index+"]").getValue()) : 0;
					}
				} else { dd += ", จำนวนเงินเดบิตหรือเครดิต"; }
				
				if(Ext.getCmp("dtl_i_type_person["+index+"]").getValue().inputValue == PERSON_TYPE_DEBTOR) {
					// ลูกหนี้
					if(dc_debtor_id == "") { dd += ", กรุณาเลือก ลูกหนี้"; }
				} else if(Ext.getCmp("dtl_i_type_person["+index+"]").getValue().inputValue == PERSON_TYPE_CREDITOR) {
					// เจ้าหนี้ผู้ขาย/ผู้รับจ้าง
					if(dc_creditor_id == "") { dd += ", กรุณาเลือก เจ้าหนี้ผู้ขาย/ผู้รับจ้าง"; }
				} else if(Ext.getCmp("dtl_i_type_person["+index+"]").getValue().inputValue == PERSON_TYPE_EMPLOYEE) {
					// เจ้าหนี้พนักงาน
					dc_emp_id		= Ext.getCmp("dtl_dc_emp_id["+index+"]").getValue();
					if(dc_emp_id == "") { dd += ", กรุณาเลือก ชื่อบุคคลภายใน"; }
				} else if(Ext.getCmp("dtl_i_type_person["+index+"]").getValue().inputValue == PERSON_TYPE_OTHER) {
					// เจ้าหนี้ทั่วไป
					if(c_other_name == "") { dd += ", กรุณาเลือก ชื่อเจ้าหนี้ทั่วไป"; }
				}
				
				if(dd != "") {
					msg += "แถวที่ "+(i+1)+" กรุณาตรวจสอบ ( "+dd.substring(2)+" )<br>";
				}
			}

			jsonArr.push({
				gl_tran_hdr_id: hdr_id,
				i_rank: Ext.getCmp("dtl_i_rank["+index+"]").getValue(),
				dc_acc_id: Ext.getCmp("dtl_dc_acc_id["+index+"]").getValue(),
				dc_cost_acc_id: Ext.getCmp("dtl_dc_cost_acc_id["+index+"]").getValue(),
				f_dr: parseFloat(Ext.getCmp("dtl_f_dr["+index+"]").getValue()),
				f_cr: parseFloat(Ext.getCmp("dtl_f_cr["+index+"]").getValue())	,
				i_is_nontax_exp: i_is_nontax_exp,
				dc_product_id: Ext.getCmp("dtl_dc_product_id["+index+"]").getValue(),
				i_type_person: Ext.getCmp("dtl_i_type_person["+index+"]").getValue().inputValue,
				dc_creditor_id: dc_creditor_id,
				dc_debtor_id: dc_debtor_id,
				dc_emp_id: dc_emp_id,
				c_other_name: c_other_name
		    });
		});
		
		if( i_chk == true ) {
			if(total_dr != total_cr) { msg	+= "รวมทุกแถวต้องมีเงิน เดบิต เท่ากับ เครดิต<br>"; }
		}
		
		if(msg	== "") {
			Ext.getCmp("win-pop-tran-dtl").getEl().mask("Please wait...", "x-mask-loading");
			Ext.Ajax.request({
				url: "../gl/api/mn_GlTranhdr.php",
				method: "POST",
				params: {
					mode: "TRAN_DTL",
					id: hdr_id,
					i_chk_gl_dtl: i_chk,
					data: JSON.stringify(jsonArr)
				},
				success: function ( result, request ) {
					Ext.getCmp("win-pop-tran-dtl").getEl().unmask();
					var obj = $.parseJSON( result.responseText );
	
					if(obj.debug == true) {
						
						Ext.getCmp("id").setValue(obj.id);
						
						store_tran_dtl.setBaseParam("id", Ext.getCmp("id").getValue());
						store_tran_dtl.load();
						
						Ext.getCmp("win-pop-tran-dtl").destroy();
						
					} else if(obj.debug == false) {
						var dd	= "";
						
						$.each(obj.data, function( index, v ) {
							if(v.chk_tax == false) { msg += "กรุณาลบข้อมูลรายการภาษีซื้อที่ได้บันทึกไว้แล้วก่อนจึงจะสามารถ<br>ลบรหัสบัญชีภาษีหรือเปลี่ยนเป็นชื่อบัญชีอื่นได้<br>"; }
							
							if(v.none) {
								var ss	= "";
								$.each(v.none, function( indexA, vA ) {
									ss += ", "+vA;
								});
								if(ss != "") { msg += "<br>- กรุณาบันทึกรายละเอียดภาษีซื้อที่แถบรายละเอียดภาษีซื้อ<br><span style=\"color: blue;\">( "+ss.substring(2)+" )</span><br>"; }	
							}
							
							if(v.unalike) {
								var ss	= "";
								$.each(v.unalike, function( indexB, vB ) {
									ss += ", "+vB;
								});
								if(ss != "") { msg += "<br>- กรุณาตรวจสอบ \"จำนวนเงินภาษี\" กับ \"จำนวนยอดบันทึกบัญชี\"<br><span style=\"color: blue;\">( "+ss.substring(2)+" )</span> ให้เท่ากัน<br>"; }	
							}
						});
						Ext.MessageBox.alert("แจ้งเตือน", msg);
					}
				},
				failure: function ( result, request) { 
					Ext.MessageBox.alert("Failed", result.responseText);		// connect
				}
			});
		} else {
			Ext.MessageBox.alert("แจ้งเตือน", msg);
		}
	};
	
	// ====================== gridtab1 ====================== //
	var gridtab1 = new Ext.ux.grid.livegrid.GridPanel({
		title: "รายละเอียดสมุดรายวัน",
		id: "gridtab1",
    	height: 280,
    	stripeRows: true,
    	loadMask: true,
    	store: store_tran_dtl,
    	tbar: [{
			text: "แก้ไขข้อมูล",
			id: "btn_dtl",
			iconCls: "icon-add", 
			handler: function(grid, rowIndex, colIndex) {
				PopTranDtl(Ext.getCmp("id").getValue());
			}
		}],
		view: myView,
		selModel: new Ext.ux.grid.livegrid.RowSelectionModel(),
//        bbar: new Ext.ux.grid.livegrid.Toolbar({
//        	view: myView,
//        	displayInfo: true
//        }),
        //columnLines: true, // เส้นแบ่ง column
        columns: [
			  { header: "ที่", dataIndex: "i_rank", width: 40, sortable: true },
			  { header: "ผังบัญชี", dataIndex: "dc_acc_name", width: 250, sortable: true },
			  { header: "ศูนย์ต้นทุนทางบัญชี", dataIndex: "dc_cost_acc_name", width: 250, sortable: true },
			  { header: "ใบอนุญาต", dataIndex: "dc_channel_name", width: 150, sortable: true,
				  renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					  if(record.data.total_type) {
						  metaData.attr = "style= \"text-align:right\";";
						  return "<b>รวม</b>";
					  } else {
						  metaData.attr = "style= \"text-align:center\";";
						  return value;
					  }
				  }
			  },
			  { header: "เดบิต", dataIndex: "f_dr", sortable: true,
				  renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					  metaData.attr = "style= \"text-align:right\";";
					  if(record.data.total_type) {
						  return "<b>"+floatRenderer(value)+"</b>";
					  } else {
						  return floatRenderer(value);
					  }
				  }
			  },
			  { header: "เครดิต", dataIndex: "f_cr", sortable: true,
				  renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					  metaData.attr = "style= \"text-align:right\";";
					  if(record.data.total_type) {
						  return "<b>"+floatRenderer(value)+"</b>";
					  } else {
						  return floatRenderer(value);
					  }
				  }
			  },
			  { header: "บวกกลับ", dataIndex: "i_is_nontax_exp", sortable: false,
				  renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					  metaData.attr = "style= \"text-align:center\";";
					  if(value == 1) {
						  return "เป็นรายการบวกกลับ";
					  } else if(value == 2) {
						  return "ไม่เป็นรายการบวกกลับ";
					  }
				  }
			  },
			  { header: "รายการรายได้", dataIndex: "dc_product_name", width: 150, sortable: true },
			  { header: "ประเภทเจ้าหนี้", dataIndex: "dc_creditor_type_name", width: 150, sortable: true },
			  { header: "ชื่อลูกหนี้/เจ้าหนี้", dataIndex: "i_type_person", width: 150, sortable: true,
				  renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					  if(value == 1) {
						  return record.data.dc_cnt_name;
					  } else if(value == 3) {
						  return record.data.dc_emp_name;
					  } else if(value == 4) {
						  return record.data.c_other_name;
					  } else {
						  return "";
					  }
				  }
			  }
			],
//			autoExpandColumn: "dc_acc_name"
	});
	
	//=================================== รายละเอียดภาษีซื้อ ===================================//
	
	PopTranPurchaseTax	= function( hdr_id ) {
		
		new Ext.Window({
			title: "แสดงรายละเอียดภาษีซื้อ",
			id: "win-pop-tran-tax",
			modal: true,
			preventBodyReset: true,
			closable: true,
			autoScroll: true,
			maximized: true, // เต็มจอ auto
			height: (Ext.getBody().getViewSize().height * 0.8),
			width: (Ext.getBody().getViewSize().width * 0.8),   //80% *0.8
			listeners: {
				"minimize": function (window, opts) { //when property minimizable
					window.collapse();
					window.setWidth(200);
					window.alignTo(Ext.getBody(), "bl-bl")
				},
				afterrender: function( component ) {
					// ======================== Create Row ======================== //
					var tbody	= "";
					
					Ext.getCmp("win-pop-tran-tax").getEl().mask("Please wait...", "x-mask-loading");
					$.ajax({
						url: "../gl/api/List_GlTranhdr.php",
						type: "POST",
						data: {
							type: "tran_purchase_tax",
							id: hdr_id
						},
						success: function(result) {
							var obj = $.parseJSON( result );
							
							if(obj.debug == true) {
								$.each(obj.data , function( index, v ) {
									
									var addBody		= "";
									
									// GEN TBODY
									addBody	+= "<input id=\"tax_no["+index+"]\" type=\"hidden\" value=\""+index+"\">";
									addBody	+= "<td id=\"Ext_tax_dc_cost_acc_id["+index+"]\" align=\"center\"></td>";
									addBody	+= "<td id=\"Ext_tax_d_vat["+index+"]\" align=\"center\"></td>";
									addBody	+= "<td id=\"Ext_tax_c_doc["+index+"]\" align=\"center\"></td>";
									addBody	+= "<td id=\"Ext_tax_c_mm["+index+"]\" align=\"center\"></td>";
									addBody	+= "<td id=\"Ext_tax_c_yyyy["+index+"]\" align=\"center\"></td>";
									addBody	+= "<td id=\"Ext_tax_c_vendor["+index+"]\" align=\"center\"></td>";
									addBody	+= "<td id=\"Ext_tax_c_tax["+index+"]\" align=\"center\"></td>";
									addBody	+= "<td align=\"center\"><div id=\"Ext_tax_i_branch["+index+"]\" style=\"width:300px;\"></div></td>";
									addBody	+= "<td id=\"Ext_tax_f_price["+index+"]\" align=\"center\"></td>";
									addBody	+= "<td id=\"Ext_tax_f_vat["+index+"]\" align=\"center\"></td>";
									addBody	+= "<td id=\"Ext_tax_i_more["+index+"]\" align=\"center\"></td>";
									addBody	+= "<td id=\"Ext_tax_c_more["+index+"]\" align=\"center\"></td>";
									addBody	+= "<td id=\"Ext_tax_delete["+index+"]\" align=\"center\"></td>";

									$("#myTableTax > tbody:last").append("<tr id=\"tax_row["+index+"]\">"+addBody+"</tr>");
									
									myFunc( index, v );
								});
								
								Ext.getCmp("total_dtl").setValue(floatRenderer(obj.total_dtl));
								Ext.getCmp("win-pop-tran-tax").getEl().unmask();
							}
						}
					});
		        }
			},
			tbar: [{
				id: "row-tran-tax",
				xtype: "idcardfield",
				width: 70,
				value: 1,
				autoCreate: { tag: "input", type: "text", autocomplete: "off", maxLength: 2 },
				emptyText : "จำนวนแถว",
				listeners: {
	           	     change : function(obj, value) {
	           	    	 if(value == "") { obj.setValue(1); }
	           	     }
				}
			}, "-", {
				text : "เพิ่มแถว",
				iconCls: "icon-add",
				handler: function(grid, rowIndex, colIndex) {
					
					for(var i = 1; 	i <= Ext.getCmp("row-tran-tax").getValue(); i++) {
						
						var addBody		= "";
						var beforeIndex	= parseInt($("#myTableTax > tbody > tr:last > input[id^=tax_no]").val());
						var index		= (isNaN(beforeIndex))? 0 : parseInt(beforeIndex) + 1;

						addBody	+= "<input id=\"tax_no["+index+"]\" type=\"hidden\" value=\""+index+"\">";
						addBody	+= "<td id=\"Ext_tax_dc_cost_acc_id["+index+"]\" align=\"center\"></td>";
						addBody	+= "<td id=\"Ext_tax_d_vat["+index+"]\" align=\"center\"></td>";
						addBody	+= "<td id=\"Ext_tax_c_doc["+index+"]\" align=\"center\"></td>";
						addBody	+= "<td id=\"Ext_tax_c_mm["+index+"]\" align=\"center\"></td>";
						addBody	+= "<td id=\"Ext_tax_c_yyyy["+index+"]\" align=\"center\"></td>";
						addBody	+= "<td id=\"Ext_tax_c_vendor["+index+"]\" align=\"center\"></td>";
						addBody	+= "<td id=\"Ext_tax_c_tax["+index+"]\" align=\"center\"></td>";
						addBody	+= "<td align=\"center\"><div id=\"Ext_tax_i_branch["+index+"]\" style=\"width:300px;\"></div></td>";
						addBody	+= "<td id=\"Ext_tax_f_price["+index+"]\" align=\"center\"></td>";
						addBody	+= "<td id=\"Ext_tax_f_vat["+index+"]\" align=\"center\"></td>";
						addBody	+= "<td id=\"Ext_tax_i_more["+index+"]\" align=\"center\"></td>";
						addBody	+= "<td id=\"Ext_tax_c_more["+index+"]\" align=\"center\"></td>";
						addBody	+= "<td id=\"Ext_tax_delete["+index+"]\" align=\"center\"></td>";

						$("#myTableTax > tbody:last").append("<tr id=\"tax_row["+index+"]\">"+addBody+"</tr>");
						
						myFunc( index , null);
					}
				}
			}],
			bbar: [{ xtype: "tbfill" }, {
				xtype: "buttongroup",
				columns: 1,
	            defaults: { scale: "small", style: "float: right" },
	            items: [{ // แถวที่ 1
	            	xtype: "buttongroup",
	            	frame: false,
	            	items: [{ xtype: "label", style: "color: blue", text: "รวมจำนวนเงินภาษีซื้อจากใบสำคัญ : " }, 
	            	        { xtype: "tbspacer", width: 4 },
	            	        { id: "total_tax", xtype: "textfield", value: "0.00", style: "text-align: right", width: 100, readOnly: true }]
	            }, { // แถวที่ 2
	            	xtype: "buttongroup",
	            	frame: false,
	            	items: [{ xtype: "label", style: "color: red", text: "จำนวนเงินภาษีที่ลงบัญชี : " }, 
	            	        { xtype: "tbspacer", width: 4 },
	            	        { id: "total_dtl", xtype: "textfield", value: "0.00", style: "text-align: right", width: 100, readOnly: true }]
	            }]
			}],
			html:	"<div style=\"background:#fff; overflow:auto;\">" +
						"<form id=\"form_save_tax\" name=\"form_save_tax\" method=\"POST\">" +
							"<table id=\"myTableTax\" border=\"0\" cellspacing=\"1\" cellpadding=\"0\" width=\"100%\">" +
								// headder
								"<thead class=\"x-grid3-header\">" +
									"<tr class=\"x-grid3-hd-row\" height=\"20\">" +
										"<td rowspan=\"2\" nowrap>ศูนย์ต้นทุนทางบัญชี</td>" +
										"<td colspan=\"2\" nowrap>ใบกำกับภาษี</td>" +
										"<td colspan=\"2\" nowrap>นำส่ง</td>" +
										"<td rowspan=\"2\" nowrap>ชื่อผู้ขาย</td>" +
										"<td rowspan=\"2\" nowrap>เลขประจำตัวผู้เสียภาษีฯ<br>ของผู้ขายสินค้า</td>" +
										"<td rowspan=\"2\" nowrap>สถานประกอบการ</td>" +
										"<td rowspan=\"2\" nowrap>มูลค่าสินค้า/บริการ</td>" +
										"<td rowspan=\"2\" nowrap>จำนวนเงินภาษี</td>" +
										"<td colspan=\"2\" nowrap>ยื่นเพิ่มเติม</td>" +
										"<td rowspan=\"2\" nowrap width=\"40\">-</td>" +
									"</tr>" +
									"<tr class=\"x-grid3-hd-row\" height=\"20\">" +
										"<td>วันที่</td>" +
										"<td>เล่มที่/เลขที่</td>" +
										"<td>เดือน</td>" +
										"<td>ปี</td>" +
										"<td>ยื่น</td>" +
										"<td>เดือนปี</td>" +
									"</tr>" +
								"</thead>" +
								// body
								"<tbody></tbody>" +
							"</table>" +
						"</form>" +
					"</div>",
			buttonAlign: "left",
			buttons : [{
				text: Ext.GLOBAL_BU_SAVE_TH,
				iconCls: "icon-save",
				handler: function() {
					SaveTranTax( hdr_id, false ); // false
				}
			}, {
				text: "บันทึกการแก้ไขและตรวจสอบ",
				iconCls: "icon-save",
				handler: function() {
					SaveTranTax( hdr_id, true ); // true
				}
			}, {
				text: Ext.GLOBAL_BU_BACK_TH,
				handler: function() {
					Ext.getCmp("win-pop-tran-tax").destroy();
				}
			}]
		}).show();
		
		// ============================ myFunc ============================ //
		var myFunc	= function( index, v) {
			
			// รหัสศูนย์ต้นทุนทางบัญชี
			new Ext.form.ComboBox({
				id: "tax_dc_cost_acc_id["+index+"]",
				store: store_cost_acc,
				valueField: "id",
				displayField: "c_name",
				mode: "local",
				triggerAction: "all",
				emptyText: "กรุณาเลือก...",
				width: 300,
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
				renderTo: "Ext_tax_dc_cost_acc_id["+index+"]"
			});
			
			// วันที่
			new Ext.form.DateField({
				id: "tax_d_vat["+index+"]",
				width: 100,
				listeners : {
					afterrender: function() {
						this.setValue(addY(543));
					}
				},
				renderTo: "Ext_tax_d_vat["+index+"]"
			});
			
			// เล่มที่/เลขที่
			new Ext.form.TextField({
				id: "tax_c_doc["+index+"]",
				width: 150,
				renderTo: "Ext_tax_c_doc["+index+"]"
			});
			
			// นำส่งเดือน
			new Ext.form.ComboBox({
				id: "tax_c_mm["+index+"]",
				store: store_month,
				valueField: "id",
				displayField: "c_name",
				value: (new Date().getMonth()+1),
				mode: "local",
				triggerAction: "all",
				emptyText: "กรุณาเลือก...",
				width: 90,
				forceSelection: true,
				selectOnFocus: true,
				typeAhead: false,
				editable: false,
				renderTo: "Ext_tax_c_mm["+index+"]"
			});
			
			// นำส่งปี
			new Ext.form.ComboBox({
				id: "tax_c_yyyy["+index+"]",
				store: store_year,
				valueField: "id",
				displayField: "c_name",
				value: (new Date().getFullYear()),
				mode: "local",
				triggerAction: "all",
				emptyText: "กรุณาเลือก...",
				width: 90,
				forceSelection: true,
				selectOnFocus: true,
				typeAhead: false,
				editable: false,
				renderTo: "Ext_tax_c_yyyy["+index+"]"
			});
			
			// ชื่อผู้ขาย
			new Ext.form.TextField({
				id: "tax_c_vendor["+index+"]",
				width: 300,
				renderTo: "Ext_tax_c_vendor["+index+"]"
			});
			
			// เลขประจำตัวผู้เสียภาษี
			new Ext.form.IdCardField({
				id: "tax_c_tax["+index+"]",
				autoCreate: { tag: "input", type: "text", autocomplete: "off", maxLength: 13 },
				width: 150,
				renderTo: "Ext_tax_c_tax["+index+"]"
			});
			
			// สถานประกอบการ
			new Ext.ButtonGroup({
				columns: 4,
				width: 300,
				frame: false,
				items: [
					new Ext.form.RadioGroup({
						id: "tax_i_branch["+index+"]",
            			columns: [ 44, 93, 60 ],
            			items: [
            				{ boxLabel: "อื่นๆ", name: "tax_i_branch["+index+"]", inputValue: 3 },
            				{ boxLabel: "สำนักงานใหญ่", name: "tax_i_branch["+index+"]", inputValue: 2, checked: true },
            				{ boxLabel: "สาขาที่", name: "tax_i_branch["+index+"]", inputValue: 1 }
            			],
            			listeners: {
            				afterrender: function() {
        						this.fn	= function() {
        							ChangeBranch( index );
        						}
        					},
        					Change: function(value) {
        						this.fn();
        					}
						}
					}),
					new Ext.form.IdCardField({
						id: "tax_c_branch["+index+"]",
						autoCreate: { tag: "input", type: "text", autocomplete: "off", maxLength: 5 },
						emptyText: "ตัวอย่าง 00001",
						width: 100
					})
				],
				renderTo: "Ext_tax_i_branch["+index+"]"
			});
			
			// มูลค่าสินค้า/บริการ
			new Ext.form.TextField({
				id: "tax_f_price["+index+"]",
				style: "text-align: right",
				width: 100,
				listeners: {
    				afterrender: function() {
						this.fn	= function() {
							ChangePrice( index );
							ChangeVat( index );
						}
					},
					Change: function(value) {
						this.fn();
					}
				},
				renderTo: "Ext_tax_f_price["+index+"]"
			});
			
			// จำนวนเงินภาษี
			new Ext.form.TextField({
				id: "tax_f_vat["+index+"]",
				style: "text-align: right",
				width: 100,
				listeners: {
    				afterrender: function() {
						this.fn	= function() {
							ChangeVat( index );
						}
					},
					Change: function(value) {
						this.fn();
					}
				},
				renderTo: "Ext_tax_f_vat["+index+"]"
			});
			
			// ยื่น
			new Ext.form.Checkbox({
				id: "tax_i_more["+index+"]",
				width: 30,
				inputValue: 1,
				listeners: {
    				afterrender: function() {
						this.fn	= function() {
							ChangeMore( index );
						}
					},
					check: function(value) {
						this.fn();
					}
				},
				renderTo: "Ext_tax_i_more["+index+"]"
			});
			
			// ยื่นเพิ่มเติมเดือน
			new Ext.form.ComboBox({
				id: "tax_c_mm_more["+index+"]",
				store: store_month,
				valueField: "id",
				displayField: "c_name",
				mode: "local",
				triggerAction: "all",
				emptyText: "กรุณาเลือก...",
				width: 90,
				forceSelection: true,
				selectOnFocus: true,
				typeAhead: false,
				editable: false,
				renderTo: "Ext_tax_c_more["+index+"]"
			});
			
			// ยื่นเพิ่มเติมปี
			new Ext.form.ComboBox({
				id: "tax_c_yyyy_more["+index+"]",
				store: store_year,
				valueField: "id",
				displayField: "c_name",
				mode: "local",
				triggerAction: "all",
				emptyText: "กรุณาเลือก...",
				width: 90,
				forceSelection: true,
				selectOnFocus: true,
				typeAhead: false,
				editable: false,
				renderTo: "Ext_tax_c_more["+index+"]"
			});
			
			// ลบ
			new Ext.Button({
				id: "tax_delete["+index+"]",
				icon: "../images/icons/bin.gif",
				tooltip: "ลบรายการ",
				handler: function() {
					$("#myTableTax > tbody > #tax_row\\["+index+"\\]").remove();
					ChangeVat( index );
                },
				renderTo: "Ext_tax_delete["+index+"]"
			});
			
			if(v != null) {
				if(v.f_price > 0) {
					Ext.getCmp("tax_f_price["+index+"]").setValue(v.f_price);
					Ext.getCmp("tax_f_price["+index+"]").fn();
				}
				if(v.f_vat > 0) {
					Ext.getCmp("tax_f_vat["+index+"]").setValue(v.f_vat);
					Ext.getCmp("tax_f_vat["+index+"]").fn();
				}
				if(v.dc_cost_acc_id > 0){ Ext.getCmp("tax_dc_cost_acc_id["+index+"]").setValue(v.dc_cost_acc_id); }
				Ext.getCmp("tax_d_vat["+index+"]").setValue(new Date(v.DATEADD_VAT));
				Ext.getCmp("tax_c_doc["+index+"]").setValue(v.c_doc);
				Ext.getCmp("tax_c_mm["+index+"]").setValue(v.c_mm);
				Ext.getCmp("tax_c_yyyy["+index+"]").setValue(v.c_yyyy);
				Ext.getCmp("tax_c_vendor["+index+"]").setValue(v.c_vendor);
				Ext.getCmp("tax_c_tax["+index+"]").setValue(v.c_tax);
				Ext.getCmp("tax_i_branch["+index+"]").setValue(v.i_branch);
				Ext.getCmp("tax_i_branch["+index+"]").fn();
				Ext.getCmp("tax_c_branch["+index+"]").setValue(v.c_branch);
				Ext.getCmp("tax_i_more["+index+"]").setValue(v.i_more);
				Ext.getCmp("tax_i_more["+index+"]").fn();
				Ext.getCmp("tax_c_mm_more["+index+"]").setValue(v.c_mm_more);
				Ext.getCmp("tax_c_yyyy_more["+index+"]").setValue(v.c_yyyy_more);
			} else {
				Ext.getCmp("tax_i_branch["+index+"]").fn();
				Ext.getCmp("tax_i_more["+index+"]").fn();
			}
		}

		// ============================================ //
		var ChangeBranch	= function ( index ) {
			var i_branch	= Ext.getCmp("tax_i_branch["+index+"]").getValue().inputValue;
			
			if(i_branch == 1) {
				Ext.getCmp("tax_c_branch["+index+"]").setDisabled(false);
			} else {
				Ext.getCmp("tax_c_branch["+index+"]").setDisabled(true);
			}
		}
		
		// ============================================ //
		var ChangePrice	= function ( index ) {
			var f_price	= floatAccount(Ext.getCmp("tax_f_price["+index+"]").getValue(), 2);
			var f_vat	= "";
			
			if(f_price > 0) {
				f_vat	= ((f_price * 7) / 100).toFixed(2);
				
				Ext.getCmp("tax_f_price["+index+"]").setValue(f_price);
				Ext.getCmp("tax_f_vat["+index+"]").setValue(f_vat);
			} else {
				Ext.getCmp("tax_f_price["+index+"]").setValue("");
				Ext.getCmp("tax_f_vat["+index+"]").setValue("");
			}
		}
		
		// ============================================ //
		var ChangeVat	= function ( index ) {
			var f_vat	= floatAccount(Ext.getCmp("tax_f_vat["+index+"]").getValue(), 2);
			var total	= parseInt(0);
			
			Ext.getCmp("tax_f_vat["+index+"]").setValue(f_vat);
			
			$( "input[id^=tax_no]" ).each(function( i, val ) { // ROW RUN
				var index	= val.value;
				
				if(Ext.getCmp("tax_f_vat["+index+"]").getValue() != "") {
					total	+= parseFloat(Ext.getCmp("tax_f_vat["+index+"]").getValue());
				}
			});
			
			Ext.getCmp("total_tax").setValue(floatRenderer(total.toFixed(2)));
		}
		
		// ============================================ //
		var ChangeMore	= function ( index ) {
			var i_more	= Ext.getCmp("tax_i_more["+index+"]").getValue();
			
			if(i_more == true) {
				Ext.getCmp("tax_c_mm_more["+index+"]").setDisabled(false);
				Ext.getCmp("tax_c_yyyy_more["+index+"]").setDisabled(false);
			} else {
				Ext.getCmp("tax_c_mm_more["+index+"]").setDisabled(true);
				Ext.getCmp("tax_c_yyyy_more["+index+"]").setDisabled(true);
			}
		}
	}
	
	// ====================== SaveTranTax ====================== //
	
	SaveTranTax	= function( hdr_id, i_chk ) {
		
		var jsonArr = [];
		var vatArr	= [];
		var msg		= "";
		
		$( "input[id^=tax_no]" ).each(function( i, val ) { // ROW RUN

			var index	= val.value;

			if(Ext.getCmp("tax_i_branch["+index+"]").getValue().inputValue == 1) {
				var c_branch		= Ext.getCmp("tax_c_branch["+index+"]").getValue();
			} else {
				var c_branch		= null;
			}
			
			if(Ext.getCmp("tax_i_more["+index+"]").getValue() == true) {
				var i_more		= 1;
				var	c_mm_more	= Ext.getCmp("tax_c_mm_more["+index+"]").getValue();
				var	c_yyyy_more	= Ext.getCmp("tax_c_yyyy_more["+index+"]").getValue();
			} else {
				var i_more		= 2;
				var c_mm_more	= null;
				var c_yyyy_more	= null;
			}
			
			var d_vat	= Ext.util.Format.date(Ext.getCmp("tax_d_vat["+index+"]").getValue(), "Y-m-d");
			
			if( i_chk == true ) {
				var dd = "";
				
				if(Ext.getCmp("tax_dc_cost_acc_id["+index+"]").getValue() == 0) { dd += ", ศูนย์ต้นทุนทางบัญชี"; }
				if(d_vat == "") {
					dd += ", วันที่ใบกำกับภาษี";
				}
				if(Ext.getCmp("tax_c_doc["+index+"]").getValue() == "") { dd += ", ใบกำกับภาษีเล่มที่/เลขที่"; }
				if(Ext.getCmp("tax_c_mm["+index+"]").getValue() == "") { dd += ", นำส่งเดือน"; }
				if(Ext.getCmp("tax_c_yyyy["+index+"]").getValue() == "") { dd += ", นำส่งปี"; }
				if(Ext.getCmp("tax_c_vendor["+index+"]").getValue() == "") { dd += ", ชื่อผู้ขาย"; }
				if(Ext.getCmp("tax_c_tax["+index+"]").getValue().length < 13) {
					dd += ", เลขประจำตัวผู้เสียภาษี";
				} else {
					$( "input[id^=tax_no]" ).each(function( qq, vals ) {
						var fd	= vals.value;
						if(index != fd) {
							if(Ext.getCmp("tax_c_tax["+index+"]").getValue() == Ext.getCmp("tax_c_tax["+fd+"]").getValue()) {
								if(Ext.getCmp("tax_c_doc["+index+"]").getValue() == Ext.getCmp("tax_c_doc["+fd+"]").getValue()) {
									dd += ", เลขที่ใบกำกับภาษีซ้ำ";
									return false;
								}
							}
						}
					});	
				}
				if(Ext.getCmp("tax_i_branch["+index+"]").getValue().inputValue == "1") {
					if(Ext.getCmp("tax_c_branch["+index+"]").getValue().length < 5) {
						dd += ", สาขาที่";
					}
				}
				if(Ext.getCmp("tax_f_price["+index+"]").getValue() <= 0) { dd += ", มูลค่าสินค้า/บริการ"; }
				if(Ext.getCmp("tax_f_vat["+index+"]").getValue() <= 0) { dd += ", จำนวนเงินภาษี"; }
				if(Ext.getCmp("tax_i_more["+index+"]").getValue() == "1") {
					if(Ext.getCmp("tax_c_mm_more["+index+"]").getValue() == "") { dd += ", ยื่นเพิ่มเติมเดือน"; }
					if(Ext.getCmp("tax_c_yyyy_more["+index+"]").getValue() == "") { dd += ", ยื่นเพิ่มเติมปี"; }
				}
				
				if(dd != "") { msg += "แถวที่ "+(i+1)+" กรุณาตรวจสอบ ( "+dd.substring(2)+" )<br>"; }
			}
			
			jsonArr.push({
				index: index,
				gl_tran_hdr_id: hdr_id,
				dc_cost_acc_id: Ext.getCmp("tax_dc_cost_acc_id["+index+"]").getValue(),
				d_vat: d_vat,
				c_doc: Ext.getCmp("tax_c_doc["+index+"]").getValue(),
				c_mm: Ext.getCmp("tax_c_mm["+index+"]").getValue(),
				c_yyyy: Ext.getCmp("tax_c_yyyy["+index+"]").getValue(),
				c_vendor: Ext.getCmp("tax_c_vendor["+index+"]").getValue(),
				c_tax: Ext.getCmp("tax_c_tax["+index+"]").getValue(),
				i_branch: Ext.getCmp("tax_i_branch["+index+"]").getValue().inputValue,
				c_branch: c_branch,
				f_price: Ext.getCmp("tax_f_price["+index+"]").getValue(),
				f_vat: Ext.getCmp("tax_f_vat["+index+"]").getValue(),
				i_more: i_more,
				c_mm_more: c_mm_more,
				c_yyyy_more: c_yyyy_more
		    });			
		});
		
		if(msg	== "") {
			Ext.getCmp("win-pop-tran-tax").getEl().mask("Please wait...", "x-mask-loading");
			Ext.Ajax.request({
				url: "../gl/api/mn_GlTranhdr.php",
				method: "POST",
				params: {
					mode: "TRAN_TAX",
					id: hdr_id,
					i_chk_gl_purchase: i_chk,
					data: JSON.stringify(jsonArr)
				},
				success: function ( result, request ) {
					Ext.getCmp("win-pop-tran-tax").getEl().unmask();
					var obj = $.parseJSON( result.responseText );
	
					if(obj.debug == true) {

						Ext.getCmp("id").setValue(obj.id);
						
						store_tran_purchase_tax.setBaseParam("id", Ext.getCmp("id").getValue());
						store_tran_purchase_tax.load();
						
						Ext.getCmp("win-pop-tran-tax").destroy();
					} else if (obj.debug == false) {
						
						var msg	= "";
						
						$.each(obj.data, function( index, v ) {
							var dd	= "";
							
							if(v.index) {
								if(v.d_vat == false) { dd += ", ใบกำกับภาษี ห้ามเกิน 6 เดือน นับจากวันที่1ของเดือนปีปัจจุบัน"; }
								if(v.c_mm_yyyy == false) { dd += ", เดือนปีที่นำส่งต้องไม่น้อยกว่า เดือนปีของใบกำกับภาษี"; }
								if(v.c_doc == false) { dd += ", เลขที่ใบกำกับภาษีซ้ำ"; }
							}
							if(dd != "") { msg += "แถวที่ "+(v.index)+" กรุณาตรวจสอบ ( "+dd.substring(2)+" )<br>"; }
							
							if(v.acc == false) { msg += "กรุณาเพิ่มรายการรายละเอียดภาษีซื้ออย่างน้อย 1 รายการ<br>"; }
							
							if(v.none) {
								var ss	= "";
								$.each(v.none, function( indexA, vA ) {
									ss += ", "+vA;
								});
								if(ss != "") { msg += "<br>- กรุณาบันทึกรหัสบัญชี \"ภาษีซื้อ\" ที่แถบ \"รายละเอียดสมุดรายวัน\"<br>สำหรับหน่วยงาน <span style=\"color: blue;\">( "+ss.substring(2)+" )</span><br>"; }	
							}
							
							if(v.unalike) {
								var ss	= "";
								$.each(v.unalike, function( indexB, vB ) {
									ss += ", "+vB;
								});
								if(ss != "") { msg += "<br>- กรุณาตรวจสอบ \"จำนวนเงินภาษี\" ที่แถบ \"รายละเอียดภาษีซื้อ\"<br>กับ \"จำนวนยอดบันทึกบัญชี\" ที่แถบ \"รายละเอียดสมุดรายวัน\"<br>สำหรับหน่วยงาน <span style=\"color: blue;\">( "+ss.substring(2)+" )</span> ให้เท่ากัน<br>"; }	
							}
						});
						Ext.MessageBox.alert("แจ้งเตือน", msg);
					}
				},
				failure: function ( result, request) { 
					Ext.MessageBox.alert("Failed", result.responseText);		// connect
				}
			});
		} else {
			Ext.MessageBox.alert("แจ้งเตือน", msg);
		}
	};

	// ============================= gridtab2 ============================= //
	
	var gridtab2 = new Ext.ux.grid.livegrid.GridPanel({
		title: "รายละเอียดภาษีซื้อ",
		id: "gridtab2",
    	height: 280,
    	stripeRows: true,
    	loadMask: true,
    	store: store_tran_purchase_tax,
    	tbar: [{
			text: "แก้ไขข้อมูล",
			id: "btn_tax",
			iconCls: "icon-add", 
			handler: function(grid, rowIndex, colIndex) {
				PopTranPurchaseTax(Ext.getCmp("id").getValue());
			}
		}],
		view: myView2,
		selModel: new Ext.ux.grid.livegrid.RowSelectionModel(),
        columns: [
			  { header: "ศูนย์ต้นทุนทางบัญชี", dataIndex: "dc_cost_acc_name", sortable: true },
			  { header: "วันที่", dataIndex: "d_vat", sortable: true, renderer:shortThaiDate },
			  { header: "เลขที่/เล่มที่", dataIndex: "c_doc", sortable: true },
			  { header: "นำส่งเดือน", dataIndex: "c_mm", sortable: true,
				  renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					  metaData.attr = "align=\"center\";";
					  if(value != "") {
						  var ss		= store_month.findExact("id" ,value);
						  var value		= store_month.data.items[ss].data.c_name;
						  return value;
					  } else {
						  return "";
					  }
				  }
			  },
			  { header: "นำส่งปี", dataIndex: "c_yyyy", sortable: true,
				  renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					  metaData.attr = "align=\"center\";";
					  if(value != "") {
						  var ss		= store_year.findExact("id", parseInt(value));
						  var value		= store_year.data.items[ss].data.c_name;
						  return value;
					  } else {
						  return "";
					  }
				  }
			  },
			  { header: "ชื่อผู้ขาย", dataIndex: "c_vendor", sortable: true },
			  { header: "เลขที่ประจำตัวผู้เสียภาษีฯ<br>ของผู้ขายสินค้า", dataIndex: "c_tax", sortable: true },
			  { header: "สถานประกอบการ", dataIndex: "i_branch", sortable: true,
				  renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					  //console.log(value);
					  if(value == 1)		{ return "สาขาที่"; }
					  else if(value == 2)	{ return "สำนักงานใหญ่"; }
					  else if(value == 3)	{ return "อื่นๆ"; }
					  else { return ""; }
				  }
			  },
			  { header: "เลขที่สาขา", dataIndex: "c_branch", sortable: true },
			  { header: "มูลค่าสินค้า/บริการ", dataIndex: "f_price", sortable: true,
				  renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					  metaData.attr = "style= \"text-align:right\";";
					  return floatRenderer(value);
				  }
			  },
			  { header: "จำนวนเงินภาษี", dataIndex: "f_vat", sortable: true,
				  renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					  metaData.attr = "style= \"text-align:right\";";
					  return floatRenderer(value);
				  }
			  },
			  { header: "ยื่น", dataIndex: "i_more", sortable: true,
				  renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					  metaData.attr = "align=\"center\";";
					  if(value == 1)	{ return "ยื่น"; }
					  else				{ return "ไม่ยื่น"; }
				  }
			  },
			  { header: "เดือน", dataIndex: "c_mm_more", sortable: true,
				  renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					  metaData.attr = "align=\"center\";";
					  if(value != "") {
						  var ss		= store_month.findExact("id" ,value);
						  var value		= store_month.data.items[ss].data.c_name;
						  return value;
					  } else {
						  return "";
					  }
				  }
			  },
			  { header: "ปี", dataIndex: "c_yyyy_more", sortable: true,
				  renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					  metaData.attr = "align=\"center\";";
					  if(value != "") {
						  var ss		= store_year.findExact("id", parseInt(value));
						  var value		= store_year.data.items[ss].data.c_name;
						  return value;
					  } else {
						  return "";
					  }
				  }
			  }
			],
//			autoExpandColumn: "dc_cost_acc_name"
	});
	
	//=================================== boxDetail ===================================//

	function Preview( id ) {
		new Ext.Window({
			title: "แสดงรายละเอียดสมุดรายวัน",
			id: "Preview",
			modal: true,
			preventBodyReset: true,
			closable: true,
			autoScroll: true,
			maximized: true, // เต็มจอ auto
			html: "<iframe name=\"printf\" src=\"preview/Pre_GlTranHdr.php?id="+id+"\" style=\"width:100%; height:100%; border-style:hidden;\"></iframe>",
			buttonAlign: "left",
			buttons: [{
				text : "&nbsp;"+Ext.GLOBAL_BU_PRINT_TH+"&nbsp;",
				iconCls	: "printer_mono",
				handler: function() { document.printf.window.print(); }
			}, {
				text: Ext.GLOBAL_BU_BACK_TH,
				handler: function() {
					Ext.getCmp("Preview").destroy();
				}
			}]
		}).show();
	}
	
	var boxDetail = new Ext.FormPanel({
		id: "boxDetail",
		frame: true,
		border: false,
		items: [
			new Ext.TabPanel({
				autoHeight: true,
				defaults: { autoScroll:true },
				activeTab: 0, //default Tab
				items: [ gridtab1 , gridtab2 ],
				listeners: {
					"tabchange" : function (panel, tab) {
						if(tab.id == "gridtab1") {
							store_tran_dtl.setBaseParam("id", Ext.getCmp("id").getValue());
							store_tran_dtl.load();	
						} else if(tab.id == "gridtab2") {
							store_tran_purchase_tax.setBaseParam("id", Ext.getCmp("id").getValue());
							store_tran_purchase_tax.load();
						}
					}
				}
			}),
		],
		buttonAlign: "center",
		buttons: [{
			text: Ext.GLOBAL_BU_PRINT_TH,
			iconCls: "icon-magnifier",
			handler: function(grid, rowIndex, colIndex) {
				Ext.getCmp("tabpanel2").getEl().mask("Please wait...", "x-mask-loading");
				$.ajax({
					url: "../gl/api/List_GlTranhdr.php",
					type: "POST",
					data: {
						type: "print_hdr",
						id: Ext.getCmp("id").getValue()
					},
					success: function(result) {
						var obj = $.parseJSON( result );
						
						if(obj.debug == true) {
							if(obj.i_preview == 1) {
								Preview(Ext.getCmp("id").getValue());
							} else {
								Ext.MessageBox.alert("แจ้งเตือน", "กรุณาบันทึกรายการก่อน");
							}
						}
						Ext.getCmp("tabpanel2").getEl().unmask();
					}
				});
			}
		}, {
			text: "&nbsp;"+Ext.GLOBAL_BU_SAVE_TH+"&nbsp;",
			id: "btn_gen",
			iconCls: "icon-save",
			handler: function(grid, rowIndex, colIndex) {
				Ext.getCmp("tabpanel2").getEl().mask("Please wait...", "x-mask-loading");
				$.ajax({
					url: "../gl/api/mn_GlTranhdr.php",
					type: "POST",
					data: {
						mode: "GEN_CODE",
						id: Ext.getCmp("id").getValue()
					},
					success: function(result) {
						var obj = $.parseJSON( result );
						
						if(obj.debug == true) {
							Ext.MessageBox.alert("แจ้งเตือน", obj.msg);
							
							storeAD.load();
							store.load();
							Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
							Ext.getCmp("tabpanel2").setDisabled(true);
						} else if(obj.debug == false) {
							var msg	= "";
							
							if(obj.i_chk_gl_dtl == 2) { msg	+= "กรุณากดตรวจสอบ รายละเอียดสมุดรายวัน ก่อน<br>"; }
							if(obj.i_chk_gl_purchase == 2) { msg	+= "กรุณากดตรวจสอบ รายละเอียดภาษีซื้อ ก่อน<br>"; }
							Ext.MessageBox.alert("แจ้งเตือน", msg);
						}
						Ext.getCmp("tabpanel2").getEl().unmask();
					}
				});
			}
		}, {
			text: Ext.GLOBAL_BU_BACK_TH,
			handler: function() {
				Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
				Ext.getCmp("tabpanel2").setDisabled(true);
			}
		}]
	});
	
	//======================================= panelForm =======================================//
	
	var panelForm = new Ext.Panel ({
		region: "center",
		//layout:"fit",
		title: "ข้อมูลสมุดรายวัน",
		id: "tabpanel2",
		border: false,
		disabled: true,
		stripeRows: true,
		loadMask: true,
		store: store,
        items: [{
        	xtype: "form",
			id: "form-widgets",
			url: "../gl/api/mn_GlTranhdr.php",
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
					title: "บันทึกข้อมูล สมุดรายวัน",
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
						id: "mode_gx",
						xtype: "hidden",
						readOnly: true
					}, {
						xtype: "hidden",
						name: "id",
						id: "id",
						readOnly: true
					}, {
						xtype: "container",
						layout: "hbox",
						align: "stretch",
						defaults: { xtype: "fieldset", flex:1, margins : "0px 3px", autoHeight: true },
						items: [{
							title: "เอกสารต้นทาง",
							defaults: { labelStyle : "width:120px;", allowBlank: false },
							items: [{
								xtype: "textfield",
								id: "c_ref_doc",
								name: "c_ref_doc",
								fieldLabel: "เลขที่เอกสาร",
								width: 200
							}, {
								xtype: "datefield",
								id: "d_doc_date",
								name: "d_doc_date",
								fieldLabel: "วันที่เอกสาร",
								width: 200
							}, {
								xtype: "displayfield",
								fieldLabel: "&nbsp;",
								labelSeparator: ""
							}, {
								xtype: "displayfield",
								fieldLabel: "&nbsp;",
								labelSeparator: ""
							}]
						}, {
							title: "สมุดรายวัน",
							defaults: { labelStyle : "width:190px;", allowBlank: false },
							items: [{
								xtype: "displayfield",
								name: "c_code",
								fieldLabel: "เลขที่สมุดรายวัน"
							}, {
								xtype: "displayfield",
								name: "c_code_post",
								fieldLabel: "เลขที่สมุดรายวัน(หลังผ่านรายการ)"
							}, {
								xtype: "datefield",
								id: "d_save_date",
								name: "d_save_date",
								fieldLabel: "วันที่บันทึกบัญชี",
								width: 300
							},
							new Ext.form.ComboBox({
								fieldLabel: "ประเภทสมุดบัญชี",
								id: "gl_dc_book_type_id",
								name: "gl_dc_book_type_id",
								store: store_book_type,
								valueField: "id",
								displayField: "c_name",
								typeAhead: true,
								mode: "local",
								triggerAction: "all",
								emptyText: "กรุณาเลือก...",
								width: 300,
								forceSelection: true,
								selectOnFocus: true
							})]
						}]
					}, {
						xtype: "container",
						layout: "hbox",
						align: "stretch",
						defaults: { xtype: "fieldset", flex:1, margins : "0px 3px", autoHeight: true },
						items: [{
							title: "คำอธิบายเพิ่มเติม",
							defaults: { labelStyle: "width:120px;", allowBlank: false, width: "90%" },
							items: [{
								xtype: "textfield",
								id: "c_comment1",
								name: "c_comment1",
								fieldLabel: "คำอธิบายเพิ่มเติม",
								autoCreate: { tag: "input", type: "text", maxlength: "100" },
								allowBlank: true
							}, {
								xtype: "textfield",
								id: "c_comment2",
								name: "c_comment2",
								fieldLabel: "",
								autoCreate: { tag: "input", type: "text", maxlength: "100" },
								allowBlank: true
							}, {
								xtype: "textfield",
								id: "c_comment3",
								name: "c_comment3",
								fieldLabel: "",
								autoCreate: { tag: "input", type: "text", maxlength: "100" },
								allowBlank: true
							}]
						}]
					}]
				}],
			}],
			buttonAlign: "left",
			buttons: [{
				text : "&nbsp;"+Ext.GLOBAL_BU_SAVE_TH+"&nbsp;",
				id: "icon-save",
				iconCls	: "icon-save",
				handler : function() {
					var msg		= "";
					
					if(Ext.getCmp("c_ref_doc").getValue() == "") { msg	+= "- กรุณากรอก เลขที่เอกสาร<br>"; }
					if(Ext.getCmp("d_doc_date").getValue() == "") { msg	+= "- กรุณากรอก วันที่เอกสาร<br>"; }
					if(Ext.getCmp("d_save_date").getValue() == "") { msg	+= "- กรุณากรอก วันที่บันทึกบัญชี<br>"; }
					if(Ext.getCmp("gl_dc_book_type_id").getValue() == "") { msg	+= "- กรุณาเลือก ประเภทสมุดบัญชี<br>"; }
					if(Ext.getCmp("c_comment1").getValue() == "" && Ext.getCmp("c_comment2").getValue() == "" && Ext.getCmp("c_comment3").getValue() == "") {
						msg	+= "- กรุณาเลือก คำอธิบายเพิ่มเติม<br>";
					}

					if (msg == "") {
						Ext.getCmp("tabpanel2").getEl().mask("Please wait...", "x-mask-loading");
						Ext.Ajax.request({
							url: "../gl/api/mn_GlTranhdr.php",
							method: "POST",
							params: {
								mode: Ext.getCmp("role-form-mode").getValue(),
								mode_gx: Ext.getCmp("mode_gx").getValue(),
								id: Ext.getCmp("id").getValue(),
								c_ref_doc: Ext.getCmp("c_ref_doc").getValue(),
								d_doc_date: Ext.util.Format.date(Ext.getCmp("d_doc_date").getValue(), "Y-m-d"),
								d_save_date: Ext.util.Format.date(Ext.getCmp("d_save_date").getValue(), "Y-m-d"),
								c_yyyy: Ext.util.Format.date(Ext.getCmp("d_save_date").getValue(), "Y"),
								c_mm: Ext.util.Format.date(Ext.getCmp("d_save_date").getValue(), "m"),
								gl_dc_book_type_id: Ext.getCmp("gl_dc_book_type_id").getValue(),
								c_comment1: Ext.getCmp("c_comment1").getValue(),
								c_comment2: Ext.getCmp("c_comment2").getValue(),
								c_comment3: Ext.getCmp("c_comment3").getValue()
							},
							success: function ( result, request ) {
								Ext.getCmp("tabpanel2").getEl().unmask();
								var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
								if (jsonData.success) {
//										Ext.MessageBox.alert("Success", jsonData.msg);		// alert massage success
										store.load();
										Ext.Msg.alert("Success", "บันทึกเรียบร้อย");
										Ext.getCmp("icon-save").hide();
										
										store_tran_dtl.setBaseParam("id", jsonData.id);
										store_tran_dtl.load();
										
										store_tran_purchase_tax.setBaseParam("id", jsonData.id);
										store_tran_purchase_tax.load();
										
										Ext.getCmp("id").setValue(jsonData.id);
										Ext.getCmp("boxDetail").show();
										
										// new Ext.Window
										if(Ext.getCmp("role-form-mode").getValue() == "ADD") {
											new Ext.Window({
												id: "win-ap-add-warning",
												title: "แจ้งเตือน",
												modal: true, 
												height: (Ext.getBody().getViewSize().height*0.7),
												width: (Ext.getBody().getViewSize().width*0.7),
												bodyStyle: { "background-color": "white", "padding": "20px" },
												closable: true,
												autoScroll: true,
												html: 	"<div style=\"font-size: 20px; text-align: center; padding: 10px 0px;\"><span style=\"background: red; text-decoration: underline;\"><b>แจ้งเตือนสำหรับแถบรายละเอียดสมุดรายวัน</b></span></div>" +
														"<div style=\"font-size: 16px;\">" +
															"<p style=\"padding: 10px 0px;\">" +
																"- <span style=\"text-decoration: underline;\"><b>กรุณากดปุ่ม \"บันทึกรายการ\" ทุกครั้ง</b></span>" +
																" ที่มีการ <span style=\"text-decoration: underline;\">เพิ่มแถว/ลบแถว/แก้ไขรายละเอียดสมุดรายวัน</span>" +
																" เพื่อบันทึกข้อมูลไว้ ถึงแม้จะยังบันทึกข้อมูลต่างๆไม่สมบูรณ์ก็ตาม ที่ปุ่มนี้ <img src=\"images/btn_save.jpg\">" +
															"</p>" +
															"<p style=\"padding: 10px 0px;\">" +
															"- เมื่อบันทึกข้อมูลทุกอย่างสมบูรณ์แล้ว ให้กดปุ่ม \"บันทึกการแก้ไขและตรวจสอบ\"" +
															" เพื่อบันทึกข้อมูลและตรวจสอบความถูกต้อง ที่ปุ่มนี้ <img src=\"images/btn_save_validate.jpg\">" +
															"</p>" +
														"</div>",
												buttons: [{
													text: "ปิด",
													handler : function() { Ext.getCmp("win-ap-add-warning").destroy(); }
												}]
											}).show();
										}
								} else {
									Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg);			// alert massage error
								}
							},
							failure: function ( result, request) { 
								Ext.MessageBox.alert("Failed", result.responseText);		// connect error
							}
						});
					} else {
						Ext.Msg.alert("Warning", msg);
					}
				}
			},{
				text: Ext.GLOBAL_BU_BACK_TH,
				handler: function() {
					Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
					Ext.getCmp("tabpanel2").setDisabled(true);
				}
			}]
		}, { html: "&nbsp;",border: false }, boxDetail ]
	});
	
	/*====================== CENTER ======================*/
	var center = new Ext.TabPanel({
		region: "center",
		border: false,
		//activeTab: 0, //default Tab
		id: "contenterCenter",
		defaults:{ autoScroll: true }, 
		items: [ gridAD, gridMain , panelForm ]
	});
	// SET ref Grid&Tab
	Ext.getCmp("tabpanelAP").on("cellclick", ADCellClick, this);
	Ext.getCmp("tabpanel1").on("cellclick", cellClick, this);

	// SetTab Controller Loads
	Ext.getCmp("contenterCenter").setActiveTab("tabpanelAP");
	/*====================== RENDER ======================*/
	new Ext.Viewport({
		layout: "border",
		items: [ center ]
	});
});

function StoreJson( url, params ) {	
	return new Ext.data.JsonStore({
		autoDestroy: true,
		autoLoad: true,
		url : url,
		baseParams: { type: params },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ]
	});	
}
