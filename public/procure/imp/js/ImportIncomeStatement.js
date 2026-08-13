Ext.onReady(function() {
	Ext.QuickTips.init();
	
	var fieldsHdr	= "";

	/*===============================================*/
	title_panelCheque	= "ระบุใบ PayIn";
	type_List			= "imp_receive";
	
	fieldsHdr	= [
					{ name : "no" },
					{ name : "id" },
					{ name : "c_code" },
					{ name : "c_gx_code" },
					{ name : "i_post" },
					{ name : "dc_receive_point_id" },
					{ name : "dc_receive_point_name" },
					{ name : "dc_period_id" },
					{ name : "dc_period_name" },
					{ name : "c_receive_name" },
					{ name : "d_doc_date" },
					{ name : "i_enable" },
					{ name : "c_comment" },
					{ name : "show_enable" },
					{ name : "dc_user_create_id" },
					{ name : "dc_user_create_cost_id" },
					{ name : "d_create" },
					{ name : "dc_user_update_id" },
					{ name : "dc_user_update_cost_id" },
					{ name : "d_update" }
				];
	/*===============================================*/
	
	store = new Ext.data.JsonStore({
		id: "store",
	    autoDestroy: true,
		autoLoad: true, 
	    url: "api/List_ImportIncomeStatement.php",
	    baseParams: { type: type_List+"_hdr", i_read: user_right_read }, //Permission i_read
	    root: "data",
	    idProperty: "id",
		totalProperty: "totalCount",
		fields: fieldsHdr
	});

	dc_cheque	= new Ext.data.JsonStore({
		autoDestroy: false,
		autoLoad: false,
		url: "api/All_ImportIncomeStatement.php",
		baseParams: { type: "dc_cheque" },											
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ]
	});

	vw_dc_bank_acc_company_full	= new Ext.data.JsonStore({
		autoDestroy: false,
		autoLoad: true,
		url: "api/All_ImportExpenseVSN.php",
		baseParams: { type: "vw_dc_bank_acc_company_full" },
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

	function controllTab(record,butt) {
		
		Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; //null obj not errer
		
		if( butt == "edit" || butt == "view" ) {
  
			var frmAdd	= new formAdd();

			Ext.getCmp("contenterCenter").add(frmAdd);
			Ext.getCmp("contenterCenter").setActiveTab(frmAdd);			
	        Ext.getCmp("role-form-mode").setValue("EDIT");
	        Ext.getCmp("form-widgets").getForm().loadRecord(record);

			Ext_Show( record.data.id );
		}
	}; // controllTab
	
	//Class Extend
	formAdd	 = function() {

		formAdd.superclass.constructor.call(this, {
			region: "center",
			title: "ข้อมูล"+title_panelCheque,
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
				labelWidth: 200,
				bodyStyle: { padding: "10px 20px" },
				defaults: { anchor: "100%", msgTarget: "side", allowBlank: false },
				items: [{
					xtype: "container",
					layout: "hbox",
					align: "stretch",
					RemoveHeight: true,
					defaults: { xtype: "fieldset", flex:1, margins : "0px 3px", autoHeight: true },
					items: [{
						title: "บันทึกข้อมูล "+title_panelCheque,
						RemoveCls: "x-box-item",
						collapsible: true,
						collapsed: false,
						defaults: { labelStyle : "width:200px;", allowBlank: true },
						items: [{
							xtype: "hidden",
							id: "role-form-mode",
							name: "mode",
							readOnly: true
						}, {
							xtype: "hidden",
							id: "id",
							name: "id",
							readOnly: true
						}, {
							xtype: "textfield",
							fieldLabel: "รหัสเอกสาร",
							readOnly: true,
							id: "c_code",
							name: "c_code",
							width: 200
						}, {
							xtype: "textfield",
							fieldLabel: "รหัสอ้างอิง(GX)",
							readOnly: true,
							id: "c_gx_code",
							name: "c_gx_code",
							width: 200
						}, {
							xtype: "textfield",
							fieldLabel: "จุดรับเงิน",
							id: "dc_receive_point_name",
							name: "dc_receive_point_name",
							readOnly: true,
							width: 200
						}, {
							xtype: "textfield",
							fieldLabel: "รอบ",
							id: "dc_period_name",
							name: "dc_period_name",
							readOnly: true,
							width: 200
						}, {
							xtype: "datefield",
							fieldLabel: "วันที่นำเข้าข้อมูล",
							id: "d_doc_date",
							name: "d_doc_date",
							readOnly: true,
							value: addY(543)
						}, {
							xtype: "textarea",
							fieldLabel: "หมายเหตุ",
							id: "c_comment",
							name: "c_comment",
							readOnly: true,
							width: 300
						}]
					}]
				}],
			}, { html: "<div id='Ext_Show'></div>", border: false }]
		});
	}; // formAdd
	Ext.extend(formAdd, Ext.Panel, {}); 
	
	// ================================ gridMain ================================ //
	
	// cellClick
	cellClick	= function( grid, rowIndex, columnIndex, e ) {
		
		var record = grid.getStore().getAt(rowIndex);
		
		if (columnIndex == grid.getColumnModel().getIndexById("edit")) {
			controllTab(record, "edit");
		}
	}; //cellClick
	
	// gridMain
	gridMain = new Ext.grid.GridPanel({
		region: "center",
		layout: "fit",
		title: "แสดงรายการ"+title_panelCheque,
		id: "tabpanel1",
		border: false,
		stripeRows: true,
		loadMask: true,
		store: store,
		viewConfig : {
			emptyText: "ไม่มีข้อมูล..",
			deferEmptyText: false
		},
		tbar: [{
			xtype: "buttongroup",
			title: "ระบุเงื่อนไขในการค้นหาข้อมูล",
			columns: 1,
            defaults: { scale: "small", style: "float: right" },
            items: [{
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
						       [ "c_code", "รหัสเอกสาร" ],
						       [ "c_gx_code", "รหัสเอกสาร(GX)" ]
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
            }, {
            	xtype: "buttongroup",
            	frame: false,
            	items: [{ xtype: "label", text: "วันที่นำเข้าข้อมูล : " }, { xtype: "tbspacer", width: 4 }, {
            		id: "s_d_doc_date1", xtype: "datefield", width: 153, 
    				listeners : {
						afterrender : function() {
							var date = new Date();
								date = new Date(date.getFullYear()+543, date.getMonth()-2, 1);
							this.setValue(date);
						}
					}
            	}, { xtype: "tbspacer", width: 6 }, { xtype: "label", text: "ถึงวันที่ : " }, { xtype: "tbspacer", width: 4 }, {
            		id: "s_d_doc_date2", xtype: "datefield", width: 153, 
    				listeners : {
						afterrender : function() {
							this.setValue(addY(543));
						}
					}
            	}]
            }],
            buttonAlign: "left",
            buttons:[{ xtype: "tbfill" }, {
				text : "ค้นหา",
				iconCls: "icon-magnifier",
    			handler : function() {
    				
    				var msg	= "";
    				    				
    				if(msg == "") {
						if(Ext.getCmp("value-box").getValue() != "") {
							store.setBaseParam("value", Ext.getCmp("value-box").getValue());
							store.setBaseParam("filter", Ext.getCmp("filter").getValue());
						} else {
							store.setBaseParam("value", "");
							store.setBaseParam("filter", "");
						}
						
						store.setBaseParam("mode", "SEARCH");
						store.setBaseParam("d_doc_date1", Ext.util.Format.date(Ext.getCmp("s_d_doc_date1").getValue(), "Y-m-d"));
						store.setBaseParam("d_doc_date2", Ext.util.Format.date(Ext.getCmp("s_d_doc_date2").getValue(), "Y-m-d"));
						store.load();
						
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
			{ id: "edit", header: "-", sortable: false, align: "center", width:100, dataIndex: "id",
				renderer: function(value, metaData, record, row, col, store, gridView) {
					return "<button style='font-size:11px; cursor:pointer; color: green;'>ระบุใบPayIn</button>";
				}
			},
			{ header: "รหัสเอกสาร", sortable: true, align: "center", width: 100, dataIndex: "c_code" },
			{ header: "รหัสอ้างอิง(GX)", sortable: false, align: "center", width:100,
				renderer: function(value, metaData, record, row, col, store, gridView) {
					
					var c_code		= "";
					
					if(record.data.i_post == 2) { c_code = record.data.c_code; }
					else if(record.data.i_post == 3) { c_code = record.data.c_gx_code; }
					return c_code;
				}
			},
			{ header: "สถานะผ่านรายการบัญชี", sortable: false, align: "center", width:120,
				renderer: function(value, metaData, record, row, col, store, gridView) {
					
					var str		= "";
					
					if(record.data.i_post == 2) { str = "ยังไม่ผ่านรายการ"; }
					else if(record.data.i_post == 3) { str = "ผ่านรายการแล้ว"; }
					else { str = "รายการรอลงบัญชี"; }
					
					return str;
				}
			},
			{ header: "จุดรับเงิน", sortable: true, width: 130, dataIndex: "dc_receive_point_name" },
			{ header: "รอบ", sortable: true, width: 130, dataIndex: "dc_period_name" },
			{ header: "วันที่นำเข้าข้อมูล", sortable: true, align: "center", dataIndex: "d_doc_date",
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					return (value != "")? shortThaiDate(value) : "";
				}
			},
			{ header: "สถานะใช้งาน", sortable: true, align: "center", dataIndex: "i_enable",
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					if( value == 1 ) {
						return "<span style='color:green;'>"+record.data.show_enable+"</span>";
					} else {
						return "<span style='color:red;'>"+record.data.show_enable+"</span>";
					}
				}
			},
			{ header: "ผู้ทำรายการล่าสุด", sortable: true, dataIndex: "dc_user_update_id" },
			{ header: "วันที่ทำรายการล่าสุด", sortable: true, align: "center", dataIndex: "d_update",
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					return (value != "")? shortThaiDate(value) : "";
				}
			},
			{ header: "หน่วยงานที่ทำรายการล่าสุด", sortable: true, dataIndex: "dc_user_update_cost_id" }
		],
//		autoExpandColumn: "c_comment",
		bbar: pagingBar
	}); //gridMain
	
	//=================================== รายละเอียดเพิ่มเติม ===================================//
	Ext_Show = function( id ) { 
		 
		$("#Ext_Show").empty();
		
		formStatement	 = function( vv ) {
			
			var ChangePrice	= function () {
				
				var total		= parseInt(0);
				var sum_total	= parseInt(0);

				$( "input[id^=no]" ).each(function( i, val ) { // ROW RUN
					var index	= val.value;
					if(Ext.getCmp("f_amount["+index+"]").getValue() != "") {
						total	+= parseFloat(Ext.getCmp("f_amount["+index+"]").getValue().replace(/,/g,""), 2);
					}
				});

				sum_total	= parseFloat(vv.f_amount.replace(/,/g,""),2) - parseFloat(total,2);
				
				Ext.getCmp("total_statement").setValue(floatRenderer(total.toFixed(2)));
				Ext.getCmp("sum_total").setValue(floatRenderer(sum_total.toFixed(2)));
				
			}
			
			// ============================ myFunc ============================ //		
			var myFunc	= function( index, v = null ) {
				
				// ลำดับที่
				new Ext.form.TextField({
					id: "i_no["+index+"]",
					style: "text-align: center",
					value: (index+1),
					width: 50,
					readOnly: true,
					renderTo: "Ext_i_no["+index+"]"
				});

				// เลขที่PayIn
				new Ext.form.TextField({
					id: "c_payin_no["+index+"]",
					//style: "text-align: center",
					width: 200,
					renderTo: "Ext_c_payin_no["+index+"]"
				});
				
				//วันที่PayIn
				new Ext.form.DateField({
					id: "d_payin["+index+"]",
					width: 100,
					listeners : { afterrender: function() { this.setValue(addY(543)); } },
					renderTo: "Ext_d_payin["+index+"]"
				});
				
				//จำนวนเงิน
				new Ext.form.TextField({
					id: "f_amount["+index+"]",
					style: "text-align: right",
					width: 200,
					listeners: {
						afterrender: function() {
							this.fn	= function() {
								this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2)));
								ChangePrice();
							}
						},
						Change: function(value) { this.fn(); }
					},
					renderTo: "Ext_f_amount["+index+"]"
				});
				
				// หมายเหตุ
				new Ext.form.TextField({
					id: "c_comment["+index+"]",
					//style: "text-align: center",
					width: 200,
					renderTo: "Ext_c_comment["+index+"]"
				});

				// ลบ
				new Ext.Button({
					id: "delete["+index+"]",
					icon: "../images/icons/bin.gif",
					tooltip: "ลบรายการ",
					handler: function() {
						$("#myTable > tbody > #dtl_row\\["+index+"\\]").remove();
	                },
					renderTo: "Ext_delete["+index+"]"
				});
				
				if(v != null) {
					if(v.c_payin_no != "") { Ext.getCmp("c_payin_no["+index+"]").setValue(v.c_payin_no); }
					if(v.d_payin != "") { Ext.getCmp( "d_payin["+index+"]" ).setValue( v.d_payin ); }
					if(v.f_amount != "") {
						Ext.getCmp( "f_amount["+index+"]" ).setValue( v.f_amount );
						Ext.getCmp( "f_amount["+index+"]" ).fn();
					}
					if(v.c_comment != "") { Ext.getCmp("c_comment["+index+"]").setValue(v.c_comment); }
				}
			}; // myFunc
			
			// ====================== SaveStatement ====================== //
			SaveStatement	= function( hdr_id, paidby, i_chk ) {
				
				var jsonArr = [];
				var msg		= "";
				
				$( "input[id^=no]" ).each(function( i, val ) { // ROW RUN
					
					var index	= val.value;
					
					jsonArr.push({
						i_no: Ext.getCmp("i_no["+index+"]").getValue(),
						c_payin_no: Ext.getCmp("c_payin_no["+index+"]").getValue(),
						d_payin: Ext.util.Format.date(Ext.getCmp("d_payin["+index+"]").getValue(), "Y-m-d"),
						f_amount: Ext.getCmp("f_amount["+index+"]").getValue().replace(/,/g,""),
						c_comment: Ext.getCmp("c_comment["+index+"]").getValue()
				    });
				});
								
				if(msg	== "") {
					Ext.getCmp("win-pop-dtl").getEl().mask("Please wait...", "x-mask-loading");
					Ext.Ajax.request({
						url: "api/mn_ImportIncomeStatement.php",
						method: "POST",
						params: {
							mode: "SAVE_STATEMENT",
							table: type_List,
							hdr_id: hdr_id,
							paidby: paidby,
							data: JSON.stringify(jsonArr)
						},
						success: function ( result, request ) {
							Ext.getCmp("win-pop-dtl").getEl().unmask();
							var obj = $.parseJSON( result.responseText );
			
							if(obj.success == true) {
								Ext.MessageBox.alert("แจ้งเตือน", "บันทึกเรียบร้อย");
								Ext.getCmp("win-pop-dtl").destroy();
								Ext_Show( id );
							}
						},
						failure: function ( result, request) { 
							Ext.MessageBox.alert("Failed", result.responseText);		// connect
						}
					});
				} else { Ext.MessageBox.alert("แจ้งเตือน", msg); }
			}; // SaveStatement
			
			new Ext.Window({
				title: "แสดงรายละเอียด"+title_panelCheque,
				id: "win-pop-dtl",
				modal: true,
				preventBodyReset: true,
				closable: true,
				autoScroll: true,
				maximizable: true,
				// maximized: true, // เต็มจอ auto
				height: (Ext.getBody().getViewSize().height * 0.99),
				width: (Ext.getBody().getViewSize().width * 0.99),
				listeners: {
					afterrender: function( component ) {
						// Create Row
						var tbody	= "";
						
						Ext.getCmp("win-pop-dtl").getEl().mask("Please wait...", "x-mask-loading");
						$.ajax({
							url: "api/List_ImportIncomeStatement.php",
							type: "POST",
							data: {
								type: "POPDTL",
								table: type_List,
								hdr_id: vv.imp_receive_hdr_id,
								paidby: vv.paidby
							},
							success: function(result) {
								var obj = $.parseJSON( result );
								
								if(obj.debug == true) {
									$.each(obj.data , function( index, v ) {
										
										var addBody		= "";
										
										// GEN TBODY
										addBody	+= "<input id='no["+index+"]' type='hidden' value='"+index+"'>";
										addBody	+= "<td id='Ext_i_no["+index+"]' align='center'></td>";
										addBody	+= "<td id='Ext_c_payin_no["+index+"]' align='center'></td>";
										addBody	+= "<td id='Ext_d_payin["+index+"]' align='center'></td>";
										addBody	+= "<td id='Ext_f_amount["+index+"]' align='center'></td>";
										addBody	+= "<td id='Ext_c_comment["+index+"]' align='center'></td>";
										addBody	+= "<td id='Ext_delete["+index+"]' align='center'></td>";
										
										$("#myTable > tbody:last").append("<tr id='dtl_row["+index+"]'>"+addBody+"</tr>");
										
										myFunc( index, v );
									});
									
									Ext.getCmp("win-pop-dtl").getEl().unmask();
								}
							}
						});
					}
				},
				tbar: [{
					id: "row-dtl",
					xtype: "idcardfield",
					width: 70,
					value: 1,
					autoCreate: { tag: "input", type: "text", autocomplete: "off", maxLength: 2 },
					emptyText : "จำนวนแถว",
					listeners: { change : function(obj, value) { if(value == "") { obj.setValue(1); } } }
				}, "-", {
					text : "เพิ่มแถว",
					iconCls: "icon-add",
					handler: function(grid, rowIndex, colIndex) {
						
						var msg	= "";
						
						if(msg	== "") {
							for(var i = 1; 	i <= Ext.getCmp("row-dtl").getValue(); i++) {
								
								var addBody		= "";
								var beforeIndex= parseInt($("#myTable > tbody > tr:last > input[id^=no]").val());
								var index	= (isNaN(beforeIndex))? 0 : parseInt(beforeIndex) + 1;
								
								addBody	+= "<input id='no["+index+"]' type='hidden' value='"+index+"'>";
								addBody	+= "<td id='Ext_i_no["+index+"]' align='center'></td>";
								addBody	+= "<td id='Ext_c_payin_no["+index+"]' align='center'></td>";
								addBody	+= "<td id='Ext_d_payin["+index+"]' align='center'></td>";
								addBody	+= "<td id='Ext_f_amount["+index+"]' align='center'></td>";
								addBody	+= "<td id='Ext_c_comment["+index+"]' align='center'></td>";
								addBody	+= "<td id='Ext_delete["+index+"]' align='center'></td>";
		
								$("#myTable > tbody:last").append("<tr id='dtl_row["+index+"]'>"+addBody+"</tr>");
								
								myFunc( index );
							}
						} else {
							Ext.MessageBox.alert("แจ้งเตือน", msg);
						}
					}
				}, 	{ xtype : "tbfill" }, {
					xtype: "panel",
					html: 	"<div style=\"font-weight:bold; background:#f5f5f5; padding:5px;\">" +
								"<div id=\"domYear\" style='font-size: 15px; text-align: right;'>ประเภทเงิน : "+vv.pay_type_name+"</div>" +
							"</div>"
				}],
				html:	"<div style='background:#fff; overflow:auto;'>" +
							"<form id='form_save_dtl' name='form_save_dtl' method='POST'>" +
								"<table id='myTable' border='0' cellspacing='1' cellpadding='0' width='100%'>" +
									// headder
									"<thead class='x-grid3-header'>" +
										"<tr class='x-grid3-hd-row' height='20'>" +
											"<td nowrap>ลำดับที่</td>" +
											"<td nowrap>เลขที่PayIn</td>" +
											"<td nowrap>วันที่PayIn</td>" +
											"<td nowrap>จำนวนเงิน</td>" +
											"<td nowrap>หมายเหตุ</td>" +
											"<td nowrap width='40'>-</td>" +
										"</tr>" +
									"</thead>" +
									// body
									"<tbody></tbody>" +
								"</table>" +
							"</form>" +
						"</div>",
				bbar: [{ xtype: "tbfill" }, {
					xtype: "buttongroup",
					columns: 1,
		            defaults: { scale: "small", style: "float: right" },
		            items: [{ // แถวที่ 1
		            	xtype: "buttongroup",
		            	frame: false,
		            	items: [{ xtype: "label", style: "color: blue", text: "ยอดเงินจากนำเข้า : " }, 
		            	        { xtype: "tbspacer", width: 4 },
		            	        { id: "total_import", xtype: "textfield", value: vv.f_amount, style: "text-align: right; font-weight: bold;", width: 100, readOnly: true },
		            	        { xtype: "tbspacer", width: 4 },
		            	        { xtype: "label", text: "บาท" }]
		            }, { // แถวที่ 2
		            	xtype: "buttongroup",
		            	frame: false,
		            	items: [{ xtype: "label", style: "color: red", text: "จำนวนเงินรวม : " }, 
		            	        { xtype: "tbspacer", width: 4 },
		            	        { id: "total_statement", xtype: "textfield", value: "0.00", style: "text-align: right; font-weight: bold;", width: 100, readOnly: true },
		            	        { xtype: "tbspacer", width: 4 },
		            	        { xtype: "label", text: "บาท" }]
		            }, { // แถวที่ 3
		            	xtype: "buttongroup",
		            	frame: false,
		            	items: [{ xtype: "label", text: "หักลบยอด : " }, 
		            	        { xtype: "tbspacer", width: 4 },
		            	        { id: "sum_total", xtype: "textfield", value: vv.f_amount, style: "text-align: right; font-weight: bold;", width: 100, readOnly: true },
		            	        { xtype: "tbspacer", width: 4 },
		            	        { xtype: "label", text: "บาท" }]
		            }]
				}],
				buttonAlign: "left",
				buttons : [{
					text: Ext.GLOBAL_BU_SAVE_TH,
					iconCls: "icon-save",
					handler: function() {
						
						var chkData	= false;
						
						$( "input[id^=no]" ).each(function( i, val ) { chkData	= true; });
						
						if(chkData == true) {
							SaveStatement( vv.imp_receive_hdr_id, vv.paidby, false ); // false
						} else { Ext.MessageBox.alert("แจ้งเตือน", "กรุณาเพิ่มข้อมูลรายการ"); }
					}
				}, {
					text: Ext.GLOBAL_BU_BACK_TH,
					handler: function() { Ext.getCmp("win-pop-dtl").destroy(); }
				}]
			}).show();
		}; // formStatement
		
		function GRID_DTL() {
			
			$("#EXT_GRID_DTL").empty();
			
			LoadData	= function( Search ) {
				// Create Row
				var tbody	= "";
				
				$("#Ext_table > tbody").empty();
				
				var dtl_value		= "";
				var dtl_filter		= "";
				var dtl_i_cheque	= "";
				
				if(Search) {
					dtl_value		= (Search.value)? Search.value : "";
					dtl_filter		= (Search.filter)? Search.filter : "";
					dtl_i_cheque	= (Search.i_cheque)? Search.i_cheque : "";	
				}
				
				Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
			
				$.ajax({
					url : 'api/List_ImportIncomeStatement.php',
					type: "POST",
					data: {
						type: type_List+"_dtl",
						table: type_List,
						id: id,
						value: dtl_value,
						filter: dtl_filter
					},
					success: function(result) {
						
						var obj		= $.parseJSON( result );
						
						if(obj.success == true) {
							
							dc_cheque.load({
								params : {
									mode:"SEARCH"
								},
								callback: function(records, operation, success) {
									
									$.each(obj.data , function( index, v ) {
										
										var addBody		= "";
										
										// GEN TBODY
										// ======== รายละเอียดค่าใช้จ่าย ========//
										if(v.i_type == 1) { //ประเภทเงิน
											
											var cc = (v.i_item > 0)? "#CFD5C2" : "#ff3737";
											addBody	+= "<tr style='background:"+cc+";'>";
											addBody	+= "<td nowrap id='Ext_add["+v.id+"]'></td>";
											addBody	+= "<td nowrap colspan='4'><b>"+v.pay_type_name+"</b></td>";
											addBody	+= "<td nowrap align='right'><b>"+v.f_amount+"</b></td>";
											addBody	+= "<td nowrap align='right'><b>&nbsp;</b></td>";
											addBody	+= "</tr>";
											
											$("#Ext_table > tbody").append( addBody );
											
											new Ext.Button({
												id: "add["+v.id+"]",
												icon: "../images/icons/drop-add.gif",
												tooltip: "เพิ่มรายการ",
												handler: function() { formStatement(v); },
												renderTo: "Ext_add["+v.id+"]"
											});
											
										} else if(v.i_type == 2) {//รายละเอียดเช็ค
											
											addBody	+= "<tr>";
											addBody	+= "<td colspan='2'></td>";
											addBody	+= "<td align='center'>"+v.no+"</td>";
											addBody	+= "<td align='center'>"+v.c_payin_no+"</td>";
											addBody	+= "<td align='center'>"+v.d_payin+"</td>";
											addBody	+= "<td align='right'>"+v.f_amount+"</td>";
											addBody	+= "<td align='left'>"+v.c_comment+"</td>";
											addBody	+= "</tr>";
											
											$("#Ext_table > tbody").append( addBody );
											
										} else if(v.i_type == 3) {//รวม
											
											addBody	+= "<tr style='background-color: "+((v.i_chk)? "#b2ff99" : "#ffaeae")+";'>";
											addBody	+= "<td align='right' colspan='5'><b>รวมทั้งหมด </b></td>";
											addBody	+= "<td align='right'><b>"+v.f_amount+"</b></td>";
											addBody	+= "<td nowrap align='right'><b>&nbsp;</b></td>";
											addBody	+= "</tr>";
											
											$("#Ext_table > tbody").append( addBody );
											
										}
										// =============================//
									});
									Ext.getCmp("contenterCenter").getEl().unmask();
									
								}
							});
						}
					}
				});
			
			}; // LoadData
			
			new Ext.Panel ({
				title: "รายละเอียด"+title_panelCheque,
				id: "GRID_DTL",
				autoScroll: true,
				style: { padding: "5px 5px" },
				listeners: {
					afterrender: function( component ) { LoadData({}); }
				},
				/*tbar: [{
					xtype: "buttongroup",
					title: "ระบุเงื่อนไขในการค้นหาข้อมูล",
					columns: 1,
		            defaults: { scale: "small", style: "float: right; width: 320px;", },
		            items: [{
		            	xtype: "buttongroup",
		            	frame: false,
		            	items: [{ xtype: "label", text: "ค้นหาโดย : " }, { xtype: "tbspacer", width: 4 }, {
			            	id: "dtl-filter",
		            		xtype: "combo",
		            		width: 100,
							mode: "local",
				            store: new Ext.data.SimpleStore({
				            	fields: [ "id", "c_name" ],
								data: [
								       [ "c_approve", "เลขที่ฎีกา" ],
								       [ "c_acc_item", "รายการ" ]
								      ]
							}),
							value: "c_approve",
							valueField: "id",
							displayField: "c_name",
							allowBlank: false,
							editable: false,
							triggerAction: "all",
							typeAhead : false
						}, { xtype: "tbspacer", width: 4 }, {
		            		xtype: "textfield",
		            		id: "dtl-value-box",
		            		width: 150,
		           			fieldLabel: "fieldLabel",
		           			emptyText: "คำที่ต้องการค้นหา"
		           		}]
		            }, {
		            	xtype: "buttongroup",
		            	frame: false,
		            	items: [{ xtype: "label", text: "สถานะเช็ค : " }, { xtype: "tbspacer", width: 4 }, {
			            	id: "i_cheque",
		            		xtype: "combo",
		            		width: 254,
							mode: "local",
				            store: new Ext.data.SimpleStore({
				            	fields: [ "id", "c_name" ],
								data: [
								       [ "0", "- เลือกทั้งหมด -" ],
								       [ "1", "ยังไม่ระบุเลขที่เช็ค" ],
								       [ "2", "ระบุเลขที่เช็คแล้ว" ]
								      ]
							}),
							value: "0",
							valueField: "id",
							displayField: "c_name",
							allowBlank: false,
							editable: false,
							triggerAction: "all",
							typeAhead : false
						}]
		            }],
		            buttonAlign: "left",
		            buttons:[{
						text : "ค้นหา",
						iconCls: "icon-magnifier",
		    			handler : function() {
		    				
		    				var msg			= "";
		    				var fldSearch	= {}; // ประกาศตัวแปรเป็น obj
		    				    				
		    				if(msg == "") {
								if(Ext.getCmp("dtl-value-box").getValue() != "") {
									fldSearch["value"]		= Ext.getCmp("dtl-value-box").getValue();
									fldSearch["filter"]		= Ext.getCmp("dtl-filter").getValue();
								} else {
									fldSearch["value"]		= "";
									fldSearch["filter"]		= "";
								}
								fldSearch["i_cheque"]		= Ext.getCmp("i_cheque").getValue();
		    					LoadData(fldSearch);
		    				
		    				} else { Ext.Msg.alert("แจ้งเตือน", msg); }
		    			}
					}, { xtype: "tbfill" }, {
						text : "โหลดเช็คค่าใช้จ่าย",
						iconCls: "x-tbar-loading",
		    			handler : function() {

		    				new Ext.Window({
		    					id: "win-msg-load",
		    					title: "แจ้งเตือน",
		    					modal: true,
		    					width: 250,
		    					height: 130,
		    					html: "ท่านต้องการที่จะโหลดข้อมูล ?",
		    					buttons: [{
		    						text: "Confirm",
		    						handler: function() {
		    							Ext.getCmp("win-msg-load").getEl().mask("Please wait...", "x-mask-loading");
		    							Ext.Ajax.request({
		    								url: "api/mn_ImportExpenseCheque.php",
		    								method: "POST",
		    								params: {
		    									mode: "ImportCheque",
		    									table: type_List,
		    									id: id
		    								},
		    								success: function ( result, request ) {
		    									var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
		    									if (jsonData.success == true && jsonData.msg != "") {
		    										Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg);		// alert massage success
		    									} else if(jsonData.success == false) {
		    										Ext.MessageBox.alert("แจ้งเตือน", "บันทึกไม่สมบูรณ์");			// alert massage error
		    									}
		    									Ext.getCmp("win-msg-load").hide();						// hidden window-panel
		    									Ext.getCmp("win-msg-load").destroy();						// clear memory :: garbage collection
		    									LoadData();
		    								},
		    								failure: function ( result, request) { 
		    									Ext.MessageBox.alert("Failed", result.responseText);		// connect error
		    								}
		    							});
		    						}
		    					}, {
		    						text : Ext.GLOBAL_BU_BACK_TH,
		    						handler : function() {
		    							Ext.getCmp("win-msg-load").hide();
		    							Ext.getCmp("win-msg-load").destroy();
		    						}
		    					}]
		    				}).show();

		    			}
					}]
				}],*/
				html:	"<div class='form_table' style='height:1000px;'>" +
							"<form method='POST'>" +
								"<table id='Ext_table' class='table_report' border='0' cellspacing='1' cellpadding='0' width='100%'>" +
									// headder
									"<thead class='x-grid3-header'>" +
										"<tr class='x-grid3-hd-row' height='20'>" +
											"<th nowrap style='text-align: center;' width='20'><b></b></th>" +
											"<th nowrap colspan='2' style='text-align: center;' width='800'><b>ประเภทเงิน</b></th>" +
											"<th nowrap rowspan='2' style='text-align: center;'><b>เลขที่PayIn</b></th>" +
											"<th nowrap rowspan='2' style='text-align: center;'><b>วันที่PayIn</b></th>" +
											"<th nowrap rowspan='2' style='text-align: center;'><b>จำนวนเงิน</b></th>" +
											"<th nowrap rowspan='2' style='text-align: center;'><b>หมายเหตุ</b></th>" +
											/*"<th nowrap rowspan='2' style='text-align: center;'><b>#</b></th>" +*/
										"</tr>" +
										"<tr>" +
											"<th nowrap style='text-align: center;' colspan='2'><b></b></th>" +
											"<th nowrap style='text-align: center;' width='50'><b>ลำดับที่</b></th>" +
										"</tr>" +
									"</thead>" +
									// body
									"<tbody></tbody>" +
								"</table>" +
							"</form>" +
						"</div>",
				buttonAlign: "center",
				buttons: [{
					text: Ext.GLOBAL_BU_BACK_TH,
					handler: function() {
						Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
					}
				}],
				renderTo: "EXT_GRID_DTL"
			});
		}; // GRID_DTL

		// แสดง FROM PANEL ทั้งหมด
		new Ext.Panel ({
			style: { padding: "1px 0px" },
			listeners: { afterrender: function() { GRID_DTL(); } },
			items: [{ border: false, style: { padding: "5px 5px" }, html: "<div id='EXT_GRID_DTL'></div>" }],
			renderTo: "Ext_Show"
		});
		
	}; // Ext_Show

	/*====================== CENTER ======================*/
	center = new Ext.TabPanel({
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