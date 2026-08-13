Ext.onReady(function() {
	Ext.QuickTips.init();
	
	var fieldsHdr	= "";

	/*===============================================*/
	title_panelCheque	= "รายละเอียดบัญชีธนาคาร";
	type_List			= "imp_bank_account_detail";
	
	fieldsHdr	= [
					{ name : "no" },
					{ name : "id" },
					{ name : "dc_bank_idID" },
					{ name : "dc_bank_name" },
					{ name : "dc_bank_acc_company_idID" },
					{ name : "dc_bank_acc_company_name" },
					{ name : "c_doc" },
					{ name : "d_doc_date" },
					{ name : "i_book_type" },
					{ name : "book_type_name" },
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
	    url: "api/List_BankAccountDetail.php",
	    baseParams: { type: type_List+"_hdr", i_read: user_right_read }, //Permission i_read
	    root: "data",
	    idProperty: "id",
		totalProperty: "totalCount",
		fields: fieldsHdr
	});

	dc_cheque	= new Ext.data.JsonStore({
		autoDestroy: false,
		autoLoad: false,
		url: "api/All_BankAccountDetail.php",
		baseParams: { type: "dc_cheque" },											
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ]
	});
	
	dc_bank	= new Ext.data.JsonStore({
		autoDestroy: false,
		autoLoad: true,
		url: "../cm/api/All_CmImpCheque.php",
		baseParams: { type: "dc_bank" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ]
	});

	dc_bank_acc_company	= new Ext.data.JsonStore({
		autoDestroy: false,
		autoLoad: true,
		url: "../cm/api/All_CmImpCheque.php",
		baseParams: { type: "dc_bank_acc_company" },
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
		} else if (butt == "add"){
			var frmAdd	= new formAdd();

			Ext.getCmp("contenterCenter").add(frmAdd);
			Ext.getCmp("contenterCenter").setActiveTab(frmAdd);			
	        Ext.getCmp("role-form-mode").setValue("ADD");
		} else if (butt == "remove"){
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
	    					url : 'api/mn_BankAccountDetail.php',
	    					params : {
	    						mode : 'DELETE',
	    						id : record.get('id')
	    					},
	    					method: 'GET', //POST
	    					success: function ( result, request ) {
	    						var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
	    						if (jsonData.success == true) {
	    							Ext.getCmp("win-msg-delete").destroy();						// clear memory :: garbage collection
	    							store.load();
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
	    				store.load();
	    			}
	    		}]
	    	}).show();
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
				url:'api/mn_BankAccountDetail.php',
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
						},new Ext.form.ComboBox({
							id: "dc_bank_idID",
							fieldLabel: "ธนาคาร",
							store: dc_bank,
							valueField: "id",
							displayField: "c_name",
							hiddenName : "dc_bank_id",
							mode: "local",
							triggerAction: "all",
							emptyText: "กรุณาเลือก...",
							width: 350,
							forceSelection: true,
							selectOnFocus: true,
							typeAhead: false,
							listeners: {
								"change": function (combo, newValue) {
									if (newValue == "") { combo.reset(); }
									else {
										Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
										dc_bank_acc_company.load({
											params : { dc_bank_id: newValue },
											callback : function() {
												Ext.getCmp("contenterCenter").getEl().unmask();
												Ext.getCmp("dc_bank_acc_company_id").setValue("");
											}
										});
									}
								},
								beforequery: function(q) {
									if (q.query) {
										var length = q.query.length;
										q.query = new RegExp(Ext.escapeRe(q.query));
										q.query.length = length;
									}
								},
								blur: function() { this.getStore().clearFilter(); },
							},
							validator: function(val) {
								if (!Ext.isEmpty(val)){ return true; } else {
									return "กรุณาเลือก ธนาคาร ";
								}
							}
						}), new Ext.form.ComboBox({
							id: "dc_bank_acc_company_idID",
							fieldLabel: "เลขที่บัญชี",
							store: dc_bank_acc_company,
							valueField: "id",
							displayField: "c_name",
							hiddenName : "dc_bank_acc_company_id",
							mode: "local",
							triggerAction: "all",
							emptyText: "กรุณาเลือก...",
							width: 350,
							forceSelection: true,
							selectOnFocus: true,
							typeAhead: false,
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
								blur: function() { this.getStore().clearFilter(); },
							},
							validator: function(val) {
								if (!Ext.isEmpty(val)){ return true; } else {
									return "กรุณาเลือก เลขที่บัญชี ";
								}
							}
						}), {
							xtype: "textfield",
							fieldLabel: "เลขที่เอกสาร",
							/*readOnly: true,*/
							id: "c_doc",
							name: "c_doc",
							width: 350,
							validator: function(val) {
								if (!Ext.isEmpty(val)){ return true; } else {
									return "กรุณาระบุ เลขที่เอกสาร ";
								}
							}
						}, {
							xtype: "datefield",
							fieldLabel: "วันที่",
							id: "d_doc_date",
							name: "d_doc_date",
							/*readOnly: true,*/
							value: addY(543)
						}, {
							xtype: "radiogroup",
							id: "i_book_type",
							fieldLabel: "ประเภทรายการ",
							columns: [ 100, 100, 100],
							vertical: true,
							items: [
								{ boxLabel: "สมุดรายวันรับ", name: "i_book_type", inputValue: 1, checked: true },
								{ boxLabel: "สมุดรายวันจ่าย", name: "i_book_type", inputValue: 3 },
								{ boxLabel: "สมุดรายวันทั่วไป", name: "i_book_type", inputValue: 2 }
							]
						}, {
							xtype: "textarea",
							fieldLabel: "หมายเหตุ",
							id: "c_comment",
							name: "c_comment",
							/*readOnly: true,*/
							width: 300
						}]
					}]
				}],  
				buttonAlign: 'left',
				buttons:[{
					text : 'บันทึกรายการ',
					id:'buSaveID',
					iconCls:'icon-save', 
					listeners:{
						afterrender:function(){ 
								/* if(Ext.getCmp('c_area_codeEditDisID').getValue()!='0'){ 

										Ext.getCmp('modeEditID').setValue('GENCODE2');
								}else{
										Ext.getCmp('modeEditID').setValue('GENCODE'); 
								} */ 
						}
					},
					handler : function() { 
						var form 	= Ext.getCmp('form-widgets').getForm(); 
						if(form.isValid()){  
							form.submit({
								waitMsg:'Saving Data...',
								success : function(form, action) {

									Ext.Msg.alert('Success', action.result.msg,function(){ 
								 
										store.load();
										Ext.getCmp('id').setValue(action.result.data.id);
										Ext.getCmp("role-form-mode").setValue("EDIT");

										Ext_Show( action.result.data.id );
										return true;
									});   
								},
								failure: function(form, action) {
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
						}
					}
				},{
					text : Ext.GLOBAL_BU_BACK_TH,
					handler: function() {
						Ext.getCmp('contenterCenter').setActiveTab('tabpanel1');  
					}
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
			
			dc_bank_acc_company.load({
				params : { dc_bank_id: record.data.dc_bank_idID },
				callback : function() {
					Ext.getCmp("contenterCenter").getEl().unmask();
					Ext.getCmp("dc_bank_acc_company_idID").setValue(record.data.dc_bank_acc_company_idID);
				}
			});
		}else if (columnIndex == grid.getColumnModel().getIndexById("remove")) {
			controllTab(record, "remove");
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
						       [ "c_doc", "เลขที่เอกสาร" ]
						      ]
					}),
					value: "c_doc",
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
            buttons:[{	
				text : 'เพิ่มข้อมูล',
				id:'buAdd',  
				iconCls: 'icon-add',  
				handler: function(grid, rowIndex, colIndex) {  
					controllTab({},'add');
				}
			},{
				xtype : 'tbfill'  
			},{
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
					return "<button style='font-size:11px; cursor:pointer; color: green;'>ระบุรายละเอียด</button>";
				}
			},
			{ header: "เลขที่เอกสาร", sortable: true, align: "center", width: 100, dataIndex: "c_doc" },
			{ header: "ธนาคาร", sortable: true, width: 130, dataIndex: "dc_bank_name" },
			{ header: "เลขที่บัญชี", sortable: true, width: 130, dataIndex: "dc_bank_acc_company_name" },
			{ header: "วันที่", sortable: true, align: "center", dataIndex: "d_doc_date",
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					return (value != "")? shortThaiDate(value) : "";
				}
			},
			{ header: "ประเภทรายการ", sortable: true, align: "center", dataIndex: "i_book_type",
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					if( value == 1 ) {
						return "<span style='color:green;'>"+record.data.book_type_name+"</span>";
					}else if( value == 3 ) {
						return "<span style='color:red;'>"+record.data.book_type_name+"</span>";
					} else {
						return "<span style='color:blue;'>"+record.data.book_type_name+"</span>";
					}
				}
			},
			/*{ header: "สถานะใช้งาน", sortable: true, align: "center", dataIndex: "i_enable",
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					if( value == 1 ) {
						return "<span style='color:green;'>"+record.data.show_enable+"</span>";
					} else {
						return "<span style='color:red;'>"+record.data.show_enable+"</span>";
					}
				}
			},*/
			{ header: "ผู้ทำรายการล่าสุด", sortable: true, dataIndex: "dc_user_update_id" },
			{ header: "วันที่ทำรายการล่าสุด", sortable: true, align: "center", dataIndex: "d_update",
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					return (value != "")? shortThaiDate(value) : "";
				}
			},
			{ header: "หน่วยงานที่ทำรายการล่าสุด", sortable: true, dataIndex: "dc_user_update_cost_id" }
			,{ id: "remove", header: "ลบ", sortable: true, align: "center", dataIndex: "id",
				renderer: function(value, metaData, record, row, col, store, gridView) {
						return "<img src=\"../images/icons/document_delete.gif\"); style=\"cursor:pointer\"/> ลบ";
				}
			}
		],
//		autoExpandColumn: "c_comment",
		bbar: pagingBar
	}); //gridMain
	
	//=================================== รายละเอียดเพิ่มเติม ===================================//
	Ext_Show = function( id ) { 
		 
		$("#Ext_Show").empty();
		
		formStatement	 = function( vv ) {
			
			var ChangeDR	= function () {
				
				var total		= parseInt(0);
				var sum_total	= parseInt(0);

				$( "input[id^=no]" ).each(function( i, val ) { // ROW RUN
					var index	= val.value;
					if(Ext.getCmp("f_dr["+index+"]").getValue() != "") {
						total	+= parseFloat(Ext.getCmp("f_dr["+index+"]").getValue().replace(/,/g,""), 2);
					}
				});

				//sum_total	= parseFloat(vv.f_amount.replace(/,/g,""),2) - parseFloat(total,2);
				sum_total	= parseFloat(total,2);
				
				Ext.getCmp("total_dr").setValue(floatRenderer(total.toFixed(2)));
				//Ext.getCmp("sum_total").setValue(floatRenderer(sum_total.toFixed(2)));
				
			}
			
			var ChangeCR	= function () {
				
				var total		= parseInt(0);
				var sum_total	= parseInt(0);

				$( "input[id^=no]" ).each(function( i, val ) { // ROW RUN
					var index	= val.value;
					if(Ext.getCmp("f_cr["+index+"]").getValue() != "") {
						total	+= parseFloat(Ext.getCmp("f_cr["+index+"]").getValue().replace(/,/g,""), 2);
					}
				});

				//sum_total	= parseFloat(vv.f_amount.replace(/,/g,""),2) - parseFloat(total,2);
				sum_total	= parseFloat(total,2);
				
				Ext.getCmp("total_cr").setValue(floatRenderer(total.toFixed(2)));
				//Ext.getCmp("sum_total").setValue(floatRenderer(sum_total.toFixed(2)));
				
			}
			
			// ============================ myFunc ============================ //		
			var myFunc	= function( index, v = null ) {
				/*console.log(index);
				console.log(v);*/
				
				// ลำดับที่
				new Ext.form.TextField({
					id: "i_no["+index+"]",
					style: "text-align: center",
					value: (index+1),
					width: 50,
					readOnly: true,
					renderTo: "Ext_i_no["+index+"]"
				});

				//จำนวนเงิน dr
				new Ext.form.TextField({
					id: "f_dr["+index+"]",
					style: "text-align: right",
					width: 200,
					listeners: {
						afterrender: function() {
							this.fn	= function() {
								this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2)));
								ChangeDR();
							}
						},
						Change: function(value) { this.fn(); }
					},
					renderTo: "Ext_f_dr["+index+"]"
				});
				
				//จำนวนเงิน cr
				new Ext.form.TextField({
					id: "f_cr["+index+"]",
					style: "text-align: right",
					width: 200,
					listeners: {
						afterrender: function() {
							this.fn	= function() {
								this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2)));
								ChangeCR();
							}
						},
						Change: function(value) { this.fn(); }
					},
					renderTo: "Ext_f_cr["+index+"]"
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
					if(v.f_dr != "") {
						Ext.getCmp( "f_dr["+index+"]" ).setValue( v.f_dr );
						Ext.getCmp( "f_dr["+index+"]" ).fn();
					}
					
					if(v.f_cr != "") {
						Ext.getCmp( "f_cr["+index+"]" ).setValue( v.f_cr );
						Ext.getCmp( "f_cr["+index+"]" ).fn();
					}
					if(v.c_comment != "") { Ext.getCmp("c_comment["+index+"]").setValue(v.c_comment); }
				}
			}; // myFunc
			
			// ====================== SaveStatement ====================== //
			SaveStatement	= function( hdr_id, i_chk ) {
				
				var jsonArr = [];
				var msg		= "";
				
				$( "input[id^=no]" ).each(function( i, val ) { // ROW RUN
					
					var index	= val.value;
					
					jsonArr.push({
						i_no: Ext.getCmp("i_no["+index+"]").getValue(),
						f_dr: Ext.getCmp("f_dr["+index+"]").getValue().replace(/,/g,""),
						f_cr: Ext.getCmp("f_cr["+index+"]").getValue().replace(/,/g,""),
						c_comment: Ext.getCmp("c_comment["+index+"]").getValue()
				    });
				});
								
				if(msg	== "") {
					Ext.getCmp("win-pop-dtl").getEl().mask("Please wait...", "x-mask-loading");
					Ext.Ajax.request({
						url: "api/mn_BankAccountDetail.php",
						method: "POST",
						params: {
							mode: "SAVE_STATEMENT",
							table: type_List,
							hdr_id: hdr_id,
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
							url: "api/List_BankAccountDetail.php",
							type: "POST",
							data: {
								type: "POPDTL",
								table: type_List,
								hdr_id: vv
							},
							success: function(result) {
								var obj = $.parseJSON( result );
								
								if(obj.debug == true) {
									$.each(obj.data , function( index, v ) {
										
										var addBody		= "";
										
										// GEN TBODY
										addBody	+= "<input id='no["+index+"]' type='hidden' value='"+index+"'>";
										addBody	+= "<td id='Ext_i_no["+index+"]' align='center'></td>";
										addBody	+= "<td id='Ext_f_dr["+index+"]' align='center'></td>";
										addBody	+= "<td id='Ext_f_cr["+index+"]' align='center'></td>";
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
								addBody	+= "<td id='Ext_f_dr["+index+"]' align='center'></td>";
								addBody	+= "<td id='Ext_f_cr["+index+"]' align='center'></td>";
								addBody	+= "<td id='Ext_c_comment["+index+"]' align='center'></td>";
								addBody	+= "<td id='Ext_delete["+index+"]' align='center'></td>";
		
								$("#myTable > tbody:last").append("<tr id='dtl_row["+index+"]'>"+addBody+"</tr>");
								
								myFunc( index );
							}
						} else {
							Ext.MessageBox.alert("แจ้งเตือน", msg);
						}
					}
				}, 	{ xtype : "tbfill" }/*, {
					xtype: "panel",
					html: 	"<div style=\"font-weight:bold; background:#f5f5f5; padding:5px;\">" +
								"<div id=\"domYear\" style='font-size: 15px; text-align: right;'>ประเภทเงิน : "+vv.pay_type_name+"</div>" +
							"</div>"
				}*/],
				html:	"<div style='background:#fff; overflow:auto;'>" +
							"<form id='form_save_dtl' name='form_save_dtl' method='POST'>" +
								"<table id='myTable' border='0' cellspacing='1' cellpadding='0' width='100%'>" +
									// headder
									"<thead class='x-grid3-header'>" +
										"<tr class='x-grid3-hd-row' height='20'>" +
											"<td nowrap>ลำดับที่</td>" +
											"<td nowrap>เดบิต(ฝาก)</td>" +
											"<td nowrap>เครดิต(ถอน)</td>" +
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
		            items: [/*{ // แถวที่ 1
		            	xtype: "buttongroup",
		            	frame: false,
		            	items: [{ xtype: "label", style: "color: blue", text: "ยอดเงินจากนำเข้า : " }, 
		            	        { xtype: "tbspacer", width: 4 },
		            	        { id: "total_import", xtype: "textfield", value: vv.f_amount, style: "text-align: right; font-weight: bold;", width: 100, readOnly: true },
		            	        { xtype: "tbspacer", width: 4 },
		            	        { xtype: "label", text: "บาท" }]
		            },*/ { // แถวที่ 2
		            	xtype: "buttongroup",
		            	frame: false,
		            	items: [{ xtype: "label", style: "color: red", text: "จำนวนเงินรวมเดบิต (ฝาก) : " }, 
		            	        { xtype: "tbspacer", width: 4 },
		            	        { id: "total_dr", xtype: "textfield", value: "0.00", style: "text-align: right; font-weight: bold;", width: 100, readOnly: true },
		            	        { xtype: "tbspacer", width: 4 },
		            	        { xtype: "label", text: "บาท" }]
		            }/*, { // แถวที่ 3
		            	xtype: "buttongroup",
		            	frame: false,
		            	items: [{ xtype: "label", text: "หักลบยอด : " }, 
		            	        { xtype: "tbspacer", width: 4 },
		            	        { id: "sum_total", xtype: "textfield", value: vv.f_amount, style: "text-align: right; font-weight: bold;", width: 100, readOnly: true },
		            	        { xtype: "tbspacer", width: 4 },
		            	        { xtype: "label", text: "บาท" }]
		            }*/]
				}, {
					xtype: "buttongroup",
					columns: 1,
		            defaults: { scale: "small", style: "float: right" },
		            items: [/*{ // แถวที่ 1
		            	xtype: "buttongroup",
		            	frame: false,
		            	items: [{ xtype: "label", style: "color: blue", text: "ยอดเงินจากนำเข้า : " }, 
		            	        { xtype: "tbspacer", width: 4 },
		            	        { id: "total_import2", xtype: "textfield", value: vv.f_amount, style: "text-align: right; font-weight: bold;", width: 100, readOnly: true },
		            	        { xtype: "tbspacer", width: 4 },
		            	        { xtype: "label", text: "บาท" }]
		            }, */{ // แถวที่ 2
		            	xtype: "buttongroup",
		            	frame: false,
		            	items: [{ xtype: "label", style: "color: red", text: "จำนวนเงินรวมเครดิต (ถอน) : " }, 
		            	        { xtype: "tbspacer", width: 4 },
		            	        { id: "total_cr", xtype: "textfield", value: "0.00", style: "text-align: right; font-weight: bold;", width: 100, readOnly: true },
		            	        { xtype: "tbspacer", width: 4 },
		            	        { xtype: "label", text: "บาท" }]
		            }/*, { // แถวที่ 3
		            	xtype: "buttongroup",
		            	frame: false,
		            	items: [{ xtype: "label", text: "หักลบยอด : " }, 
		            	        { xtype: "tbspacer", width: 4 },
		            	        { id: "sum_total2", xtype: "textfield", value: vv.f_amount, style: "text-align: right; font-weight: bold;", width: 100, readOnly: true },
		            	        { xtype: "tbspacer", width: 4 },
		            	        { xtype: "label", text: "บาท" }]
		            }*/]
				}],
				buttonAlign: "left",
				buttons : [{
					text: Ext.GLOBAL_BU_SAVE_TH,
					iconCls: "icon-save",
					handler: function() {
						
						var chkData	= false;
						
						$( "input[id^=no]" ).each(function( i, val ) { chkData	= true; });
						
						if(chkData == true) {
							SaveStatement( vv, false ); // false
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
					url : 'api/List_BankAccountDetail.php',
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
										if(v.i_level == 1) {
											
											addBody	+= "<tr>";
											addBody	+= "<td align='center'>"+v.no+"</td>";
											addBody	+= "<td align='right'>"+v.f_dr+"</td>";
											addBody	+= "<td align='right'>"+v.f_cr+"</td>";
											addBody	+= "<td align='left'>"+v.c_comment+"</td>";
											addBody	+= "</tr>";
											
											$("#Ext_table > tbody").append( addBody );
											
										} else if(v.i_level == 2) {
											
											addBody	+= "<tr style='background-color:#b2ff99;'>";
											addBody	+= "<td align='right'><b>รวมทั้งหมด</b></td>";
											addBody	+= "<td align='right'><b>"+v.f_dr+"</b></td>";
											addBody	+= "<td align='right'><b>"+v.f_cr+"</b></td>";
											addBody	+= "<td align='right'><b>&nbsp;</b></td>";
											addBody	+= "</tr>";
											
											$("#Ext_table > tbody").append( addBody );
										}
										
										// GEN TBODY
										
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
				},tbar: [{
					text : "ระบุรายละเอียด",
					iconCls: "icon-add",
					handler: function(grid, rowIndex, colIndex) {
						formStatement(id);
					}
				}],
				html:	"<div class='form_table' style='height:1000px;'>" +
							"<form method='POST'>" +
								"<table id='Ext_table' class='table_report' border='0' cellspacing='1' cellpadding='0' width='100%'>" +
									// headder
									"<thead class='x-grid3-header'>" +
										"<tr>" +
											"<th nowrap style='text-align: center;' width='100'><b>ลำดับที่</b></th>" +
											"<th nowrap style='text-align: center;'><b>เดบิต(ฝาก)</b></th>" +
											"<th nowrap style='text-align: center;'><b>เครดิต(ถอน)</b></th>" +
											"<th nowrap style='text-align: center;'><b>หมายเหตุ</b></th>" +
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