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
	title_panel		= "นำเข้าข้อมูลเช็ค";
	/*===============================================*/
	
	store = new Ext.data.JsonStore({
		id: "store",
	    autoDestroy: true,
		autoLoad: true, 
	    url: "api/List_CmImpCheque.php",
	    baseParams: { type: "cm_imp_cheque_hdr", i_read: user_right_read }, //Permission i_read
	    root: "data",
	    idProperty: "id",
		totalProperty: "totalCount",
		fields: [
				{ name : "no" },
				{ name : "id" },
				{ name : "dc_bank_id" },
				{ name : "dc_bank_acc_company_id" },
				{ name : "dc_bank_acc_company_name" },
				{ name : "c_code" },
				{ name : "d_doc_date" },
				{ name : "c_comment" },
				{ name : "i_enable" },
				{ name : "show_enable" },
				{ name : "dc_user_create_id" },
				{ name : "dc_user_create_cost_id" },
				{ name : "d_create" },
				{ name : "dc_user_update_id" },
				{ name : "dc_user_update_cost_id" },
				{ name : "d_update" }
		]
	});
	
	dc_bank	= new Ext.data.JsonStore({
		autoDestroy: false,
		autoLoad: true,
		url: "api/All_CmImpCheque.php",
		baseParams: { type: "dc_bank" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ]
	});
	
	dc_bank_acc_company	= new Ext.data.JsonStore({
		autoDestroy: false,
		autoLoad: false,
		url: "api/All_CmImpCheque.php",
		baseParams: { type: "dc_bank_acc_company" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ]
	});
	
	dc_bank_acc_company_all	= new Ext.data.JsonStore({
		autoDestroy: false,
		autoLoad: true,
		url: "api/All_CmImpCheque.php",
		baseParams: { type: "dc_bank_acc_company", all: "all" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ],
	    listeners: {
			load: function(t, records, options) {
	        	Ext.getCmp( "s_dc_bank_acc_company_id" ).setValue( "0" );
	        }
		}
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
		
		if( butt == "add" ) {

			var frmAdd	= new formAdd();

			Ext.getCmp("contenterCenter").add(frmAdd);
			Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
			Ext.getCmp("role-form-mode").setValue("ADD");
			
			Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
			dc_bank_acc_company.load({
			    params : { dc_bank_id: 0 },
			    callback : function() { Ext.getCmp("contenterCenter").getEl().unmask(); }
			});
			
		} else if( butt == "edit" || butt == "view" ) {
  
			var frmAdd	= new formAdd();

			Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
			dc_bank_acc_company.load({
			    params : { dc_bank_id: record.data.dc_bank_id },
			    callback : function() {
			    	
			    	Ext.getCmp("contenterCenter").getEl().unmask();
			    	
			    	Ext.getCmp("contenterCenter").add(frmAdd);
					Ext.getCmp("contenterCenter").setActiveTab(frmAdd);			
			        Ext.getCmp("role-form-mode").setValue("EDIT");
			        Ext.getCmp("form-widgets").getForm().loadRecord(record);
			        
			        Ext_Show( record.data.id );
			    }
			});
			
		} else if ( butt == "delete" ) {
			new Ext.Window({
				id: "win-msg-delete",
				title: "Remove",
				modal: true,
				width: 250,
				height: 130,
				html: "ท่านต้องการที่จะลบข้อมูล ?",
				buttons: [{
					text: "Confirm",
					handler: function() {
						Ext.getCmp("win-msg-delete").getEl().mask("Please wait...", "x-mask-loading");
						Ext.Ajax.request({
							url: "api/mn_CmImpCheque.php",
							method: "POST",
							params: {
								mode: "DELETE", 
								id: record.get("id")
							},
							success: function ( result, request ) {
								var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
								if (jsonData.success == true) {
									//Ext.MessageBox.alert("Success", jsonData.msg);		// alert massage success
								} else {
									Ext.MessageBox.alert("Failed", jsonData.msg);			// alert massage error
								}
								Ext.getCmp("win-msg-delete").hide();						// hidden window-panel
								Ext.getCmp("win-msg-delete").destroy();						// clear memory :: garbage collection
								store.reload();
							},
							failure: function ( result, request) { 
								Ext.MessageBox.alert("Failed", result.responseText);		// connect error
							}
						});
					}
				}, {
					text : Ext.GLOBAL_BU_BACK_TH,
					handler : function() {
						Ext.getCmp("win-msg-delete").hide();
						Ext.getCmp("win-msg-delete").destroy();
					}
				}]
			}).show();
		}
	}; // controllTab
	
	//Class Extend
	formAdd	 = function() {

		saveHdr	= function() {

			var msg		= "";
			
			if( Ext.getCmp("dc_bank_acc_company_id").getValue() == "" ) { msg += "- กรุณาเลือก เลขที่บัญชี<br>"; }
			if( Ext.getCmp("d_doc_date").getValue() == "" ) { msg += "- กรุณากรอก วันที่นำเข้าข้อมูล<br>"; }
			
			if (msg == "") {
				Ext.getCmp("frm-Add").getEl().mask("Please wait...", "x-mask-loading");
				Ext.Ajax.request({
					url: "api/mn_CmImpCheque.php",
					method: "POST",
					params: {
						mode: Ext.getCmp("role-form-mode").getValue(),
						id: Ext.getCmp("id").getValue(),
						dc_bank_acc_company_id: Ext.getCmp("dc_bank_acc_company_id").getValue(),
						d_doc_date: Ext.util.Format.date(Ext.getCmp("d_doc_date").getValue(), "Y-m-d"),
						c_comment: Ext.getCmp("c_comment").getValue()
					},
					success: function ( result, request ) {
						Ext.getCmp("frm-Add").getEl().unmask();
						var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
						if ( jsonData.success == true ) {
							store.load({ params : { mode: "" } });
							Ext.getCmp("role-form-mode").setValue("EDIT");
							Ext.Msg.alert("แจ้งเตือน", "บันทึกเรียบร้อย");
							Ext_Show( jsonData.cm_imp_cheque_hdr_id );
						} else { Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg); }
					},
					failure: function ( result, request) { 
						Ext.MessageBox.alert("Failed", result.responseText);		// connect error
					}
				});
			} else { Ext.Msg.alert("แจ้งเตือน", msg); }
			
		};
		
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
						title: "บันทึกข้อมูล "+title_panel,
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
						}, new Ext.form.ComboBox({
							fieldLabel: "ธนาคาร",
							id: "dc_bank_id",
							name: "dc_bank_id",
							store: dc_bank,
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
								change: function (combo, newValue) {
									Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
									dc_bank_acc_company.load({
									    params : { dc_bank_id: newValue },
									    callback : function() {
									    	Ext.getCmp("contenterCenter").getEl().unmask();
									    	Ext.getCmp("dc_bank_acc_company_id").setValue("");
									    	
									    }
									});
								},
								beforequery: function(q) {
									if (q.query) {
										var length = q.query.length;
										q.query = new RegExp(Ext.escapeRe(q.query));
										q.query.length = length;
									}
								},
								blur: function() { this.getStore().clearFilter(); },
							}
						}), new Ext.form.ComboBox({
							fieldLabel: "เลขที่บัญชี",
							id: "dc_bank_acc_company_id",
							name: "dc_bank_acc_company_id",
							store: dc_bank_acc_company,
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
							}
						}), {
							xtype: "datefield",
							fieldLabel: "วันที่เช็ค",
							id: "d_doc_date",
							name: "d_doc_date",
							value: addY(543)
						}, {
							xtype: "textarea",
							fieldLabel: "หมายเหตุ",
							id: "c_comment",
							name: "c_comment",
							width: 300
						}]
					}]
				}],
				buttonAlign: "left",
				buttons: [{
					text : "&nbsp;"+Ext.GLOBAL_BU_SAVE_TH+"&nbsp;",
					iconCls	: "icon-save",
					handler : function() { saveHdr(); }
				}, {
					text: Ext.GLOBAL_BU_BACK_TH,
					handler: function() {
						Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
					}
				}]
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
		} else if (columnIndex == grid.getColumnModel().getIndexById("delete")) {
			controllTab(record, "delete");
		}
	}; //cellClick
	
	// gridMain
	gridMain = new Ext.grid.GridPanel({
		region: "center",
		layout: "fit",
		title: "แสดงรายการ"+title_panel,
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
            		width: 100,
					mode: "local",
		            store: new Ext.data.SimpleStore({
		            	fields: [ "value", "text" ],
						data: [
						       [ "c_code", "รหัสข้อมูลเช็ค" ]
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
            		width: 187,
           			fieldLabel: "fieldLabel",
           			emptyText: "คำที่ต้องการค้นหา"
           		}]
            }, {
            	xtype: "buttongroup",
            	frame: false,
            	items: [{ xtype: "label", text: "เลขที่บัญชี : " }, { xtype: "tbspacer", width: 4 },
				new Ext.form.ComboBox({
					id: "s_dc_bank_acc_company_id",
					store: dc_bank_acc_company_all,
					valueField: "id",
					displayField: "c_name",
					mode: "local",
					triggerAction: "all",
					emptyText: "กรุณาเลือก...",
					width: 291,
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
            	items: [{ xtype: "label", text: "วันที่เช็ค : " }, { xtype: "tbspacer", width: 4 }, {
            		id: "s_d_doc_date1", xtype: "datefield", width: 122, 
    				listeners : {
						afterrender : function() {
							var date = new Date();
								date = new Date(date.getFullYear()+543, date.getMonth()-2, 1);
							this.setValue(date);
						}
					}
            	}, { xtype: "tbspacer", width: 5 }, { xtype: "label", text: "ถึงวันที่ : " }, { xtype: "tbspacer", width: 4 }, {
            		id: "s_d_doc_date2", xtype: "datefield", width: 122, 
    				listeners : {
						afterrender : function() {
							this.setValue(addY(543));
						}
					}
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
							store.setBaseParam("value", Ext.getCmp("value-box").getValue());
							store.setBaseParam("filter", Ext.getCmp("filter").getValue());
						} else {
							store.setBaseParam("value", "");
							store.setBaseParam("filter", "");
						}

						store.setBaseParam("mode", "SEARCH");
						store.setBaseParam("dc_bank_acc_company_id", Ext.getCmp("s_dc_bank_acc_company_id").getValue());
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
			{ id: "edit", header: "-", sortable: false, align: "center", width:50, dataIndex: "id",
				renderer: function(value, metaData, record, row, col, store, gridView) {
					return "<button style='font-size:11px; cursor:pointer; color: green;'>แก้ไข</button>";
				}
			},
			{ id: "delete", header: "-", sortable: false, align: "center", width:50, dataIndex: "id",
				renderer: function(value, metaData, record, row, col, store, gridView) {
					return "<button style='font-size:11px; cursor:pointer; color: red;'>ลบ</button>";
				}
			},
			{ header: "รหัสข้อมูลเช็ค", sortable: false, align: "center", width:100, dataIndex: "c_code" },
			{ header: "เลขที่บัญชี", sortable: true, width: 300, dataIndex: "dc_bank_acc_company_name" },
			{ header: "วันที่เช็ค", sortable: true, align: "center", dataIndex: "d_doc_date",
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
		 
		function GRID_DTL() {
			
			$("#EXT_GRID_DTL").empty();
			
			// saveDtl
			saveDtl	= function( mode ) { // mode = "GENCODE" -- GENCODE, mode = "SAVE_DTL" -- NOT GENCODE

				var msg		= "";
   				var check	= false;
   				var jsonArr = [];
   				
   				$( "input[id^=chk]" ).each(function( i, val ) {
   					if(val.checked == true) {
   						check	= true;
   						jsonArr.push({
   							c_doc: $( "#c_doc\\["+val.value+"\\]" ).val(),
   							c_name: $( "#c_name\\["+val.value+"\\]" ).val(),
   							f_dr: $( "#f_dr\\["+val.value+"\\]" ).val(),
   							f_cr: $( "#f_cr\\["+val.value+"\\]" ).val(),
   							f_balance: $( "#f_balance\\["+val.value+"\\]" ).val()
   						});
   					}
				});
   				
				if( check == false ) { msg += "- กรุณาเลือก รายการ อย่างน้อย 1 รายการ<br>"; }
				
				if( msg == "" ) {

					Ext.getCmp("frm-Add").getEl().mask("Please wait...", "x-mask-loading");					        					
					$.ajax({
						url: "api/mn_CmImpCheque.php",
						type: "POST",
						data: {
							mode: mode,
							id: id,
							data: JSON.stringify(jsonArr)
						},
						success: function(result) {
							Ext.getCmp("frm-Add").getEl().unmask();
							var data = $.parseJSON( result );
							if( data.success == true ) {
								Ext.Msg.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย");
								store.load();
								
								if(mode == "GENCODE") {
									Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
									Ext.Msg.alert("แจ้งเตือน", data.msg);
								} else {
									Ext_Show( id );									
								}
							}
						}
					});

				} else { Ext.Msg.alert("แจ้งเตือน", msg); }
			}; // saveDtl
			
			function imp_data(obj) {
				
				$("#Ext_table > tbody").empty();
				
				var addBody					= "";
				Ext.objChk					= [];
				
				if( obj.totalCount > 0 ) {
					$.each(obj.data , function( index, v ) {
						
						addBody		= "";
						// GEN TBODY
						Ext.objChk[v.id]	= "chk["+v.id+"]";

						var f_dr			= (parseFloat(v.f_dr) > 0)? parseFloat(v.f_dr) : 0;
						var f_cr			= (parseFloat(v.f_cr) > 0)? parseFloat(v.f_cr) : 0;
						var f_balance		= (parseFloat(v.f_balance) > 0)? parseFloat(v.f_balance) : 0;
						
						str_dr				= (f_dr > 0)? floatRenderer(floatMinus(f_dr,2)) : "";
						str_cr				= (f_cr > 0)? floatRenderer(floatMinus(f_cr,2)) : "";
						str_balance			= (f_balance > 0)? floatRenderer(floatMinus(f_balance,2)) : "";

						addBody	+= "<tr>";
						addBody	+= "<td align='center'><input type='checkbox' id='chk["+v.id+"]' value="+v.id+" checked></td>";
						addBody	+= "<td align='center'>"+v.no+"</td>";
						addBody	+= "<td nowrap align='center'>"+v.c_doc+"</td>";
						addBody	+= "<td nowrap align='center'>"+v.c_name+"</td>";
						
						addBody	+= "<td nowrap align='right'>"+str_dr+"</td>";
						addBody	+= "<td nowrap align='right'>"+str_cr+"</td>";
						addBody	+= "<td nowrap align='right'>"+str_balance+"</td>";

						addBody	+= "<input type='hidden' id='c_doc["+v.id+"]' value='"+v.c_doc+"'>";
						addBody	+= "<input type='hidden' id='c_name["+v.id+"]' value='"+v.c_name+"'>";
						addBody	+= "<input type='hidden' id='f_dr["+v.id+"]' value='"+f_dr+"'>";
						addBody	+= "<input type='hidden' id='f_cr["+v.id+"]' value='"+f_cr+"'>";
						addBody	+= "<input type='hidden' id='f_balance["+v.id+"]' value='"+f_balance+"'>";
						
						addBody	+= "</tr>";
						
						$("#Ext_table > tbody:last").append( addBody );
					});
					
					addBody		= "";

					addBody	+= "<tr>";
					addBody	+= "<td align='right' colspan='4'><b>จำนวนเงินนำเข้าทั้งหมด</b></td>";
					addBody	+= "<td align='right'><b style='border-bottom: 3px double #000;'>"+floatRenderer(floatMinus(obj.sum_dr, 2))+"</b></td>";
					addBody	+= "<td align='right'><b style='border-bottom: 3px double #000;'>"+floatRenderer(floatMinus(obj.sum_cr, 2))+"</b></td>";
					addBody	+= "<td align='right'><b style='border-bottom: 3px double #000;'>"+floatRenderer(floatMinus(obj.sum_balance, 2))+"</b></td>";
					addBody	+= "<td></td>";
					addBody	+= "</tr>";
					
					$("#Ext_table > tbody:last").append( addBody );
					
				} else { $("#Ext_table > tbody:last").append( "<td colspan='7'>ไม่พบข้อมูล</td>" ); }
			};
			
			function popDtl() {

				new Ext.Window({
					title: "นำเข้าไฟล์",
					id: "win-pop-excel",
					layout: "fit",
					modal: true,
					width: (Ext.getBody().getViewSize().width * 0.6),
					listeners: {
						afterrender: function( component ) {
							
							new Ext.ux.form.FileUploadField({
								id: "dtl_import",
								name: "dtl_import",
								emptyText: "เลือกไฟล์ excel...	",
								buttonText: "",
				            	width: 300,
				            	buttonCfg: { iconCls: "import_excel" },
				            	renderTo: "Ext_dtl_import"
							});
						}
					},
					items: [{
						xtype: "form",
						id: "form-excel",
						url: "api/mn_CmImpCheque.php",
						border: false,
						fileUpload: true,
						bodyStyle: { padding: "10px 20px" },
						html:"	<table border='0' cellspacing='2' cellpadding='0' width='100%' style='padding: 4px; 0px;'>" +
									"<input type='hidden' name='mode' value='IMPORT_EXCEL'>" +
									"<input type='hidden' name='id' value='"+id+"'>" +
									"<colgroup width='50%'></colgroup>" +
									"<colgroup width='50%'></colgroup>" +
									"<tr>" +
										"<td align='right'>เลือก file(*.csv (Comma delimited)) : </td>" +
										"<td><div id='Ext_dtl_import'></div></td>" +
									"</tr>" +
								"</table>"
					}],
					buttonAlign: "left",
					buttons : [{
						text: Ext.GLOBAL_BU_SAVE_TH,
						iconCls: "icon-save",
						handler: function() {
							
							var form		= Ext.getCmp("form-excel").getForm();
							var filename	= Ext.getCmp("dtl_import").getValue();
							var parts		= filename.split(".");
							var msg			= "";
							
							if (filename == "") { msg = "กรุณาเลือกไฟล์ที่ต้องการ"; }
							else if(parts[parts.length - 1] != "csv") { msg = "กรุณาเลือก excel เป็นไฟล์ .csv"; }
							
							if(msg == "") {
								Ext.getCmp("win-pop-excel").getEl().mask("Please wait...", "x-mask-loading");
								form.submit({
									success : function(result, request) {
										Ext.getCmp("win-pop-excel").getEl().unmask();		
										var obj = request.result;

										if( obj.success == true ) {
											store.load();
											imp_data(obj);
											Ext.getCmp("win-pop-excel").destroy();
										}
									},
									failure:  function(form, action) {
										switch (action.failureType) {
											case Ext.form.Action.CLIENT_INVALID:
												Ext.Msg.alert('Failure', 'Form fields may not be submitted with invalid values');
												break;
											case Ext.form.Action.CONNECT_FAILURE:
												Ext.Msg.alert('Failure', 'พลข้อผิดพลาดในการเชื่อต่อเครือข่าย');
												break;
											case Ext.form.Action.SERVER_INVALID:
											   Ext.Msg.alert('Failure', action.result.msg);
										}
									}
								});
							} else { Ext.Msg.alert( "แจ้งเตือน", msg ); }
						}
					}, {
						text: Ext.GLOBAL_BU_BACK_TH,
						handler: function() { Ext.getCmp("win-pop-excel").destroy(); }
					}]
				}).show();

			}; // popDtl
			
			new Ext.Panel ({
				title: "รายละเอียดการ"+title_panel,
				id: "GRID_DTL",
				autoScroll: true,
				style: { padding: "5px 5px" },
				listeners: {
					afterrender: function( component ) {
						
						// ======================== Create Row ======================== //
						Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
						$.ajax({
							url: "api/List_CmImpCheque.php",
							type: "POST",
							data: {
								type: "cm_imp_cheque_dtl",
								cm_imp_cheque_hdr_id: id
							},
							success: function(result) {
								
								Ext.getCmp("contenterCenter").getEl().unmask();
								var obj = $.parseJSON( result );
								if( obj.debug == true ) {
									imp_data(obj);									
								} else {  $("#Ext_table > tbody:last").append( "<td colspan='7'>ไม่พบข้อมูล</td>" ); }
							}
						});
			        }
				},
				tbar: [{
					text : "นำเข้าไฟล์ CSV",
					id: "add_dtl",
					iconCls: "icon-add",
					handler: function(grid, rowIndex, colIndex) { popDtl(); }
				}],
				html:	"<div class='form_table' style='height:500px;'>" +
							"<form method='POST'>" +
								"<table class='Ext_table' id='Ext_table' border='0' cellspacing='1' cellpadding='0' width='100%'>" +
									// headder
									"<thead class='x-grid3-header'>" +
										"<tr class='x-grid3-hd-row' height='20'>" +
											"<td width=40 nowrap><input type='checkbox' onclick='checkAll(this.checked);'></td>" +
											"<td nowrap>ลำดับที่</td>" +
											"<td nowrap>ที่เอกสาร</td>" +
											"<td nowrap>รายการ</td>" +
											"<td nowrap>เดบิต(ฝาก)</td>" +
											"<td nowrap>เครดิต(ถอน)</td>" +
											"<td nowrap>คงเหลือ</td>" +
										"</tr>" +
									"</thead>" +
									// body
									"<tbody></tbody>" +
								"</table>" +
							"</form>" +
						"</div>",
				buttonAlign: "center",
				buttons: [{
					text : "&nbsp;"+Ext.GLOBAL_BU_SAVE_TH+"&nbsp;",
					iconCls	: "icon-save",
					handler : function() { saveDtl("SAVE_DTL"); }
				}, {
					text : "&nbsp;บันทึกออกเลข&nbsp;",
					iconCls	: "icon-save",
					handler : function() { saveDtl("GENCODE"); }
				}, {
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
