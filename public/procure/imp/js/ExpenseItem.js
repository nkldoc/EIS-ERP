Ext.onReady(function() {
	Ext.QuickTips.init();

	/* =============================================== */
	title_panel		= "แยกรายละเอียดฎีกา (e-PHIS)";
	/* =============================================== */
	
	store = new Ext.data.JsonStore({
		id: "store",
	    autoDestroy: true,
		autoLoad: false, 
	    url: "api/List_ExpenseItem.php",
	    baseParams: { type: "imp_expense_dtl", i_read: user_right_read }, // Permission i_read
	    root: "data",
	    idProperty: "id",
		totalProperty: "totalCount",
		fields: [
					{ name : "no" },
					{ name : "id" },
					{ name : "imp_expense_hdr_id" },
					{ name : "c_gx_code" },
					{ name : "c_code" },
					{ name : "c_approve" },
					{ name : "d_doc_date" },
					{ name : "c_acc_item" },
					{ name : "f_inv" },
					{ name : "f_inv_sum" },
					{ name : "f_tax_personal" },
					{ name : "f_tax_corporate" },
					{ name : "f_social_security" },
					{ name : "f_money1" },
					{ name : "f_fine" },
					{ name : "f_total" },
					{ name : "f_check_total" },
					{ name : "i_many_doc" },
					{ name : "i_type_year" },
				]
	});
	
	dc_expense_group	= new Ext.data.JsonStore({
		autoDestroy: false,
		autoLoad: true,
		url: "api/All_ImportExpenseVSN.php",
		baseParams: { type: "dc_expense_group" },
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
		if( butt == "edit" ) { formCheque( record ); }
		else if( butt == "delete" ) {
			new Ext.Window({
				id: "win-msg-delete",
				title: "แจ้งเตือน",
				modal: true,
				width: 250,
				height: 130,
				html: "ท่านต้องการที่จะลบข้อมูล ?",
				buttons: [{
					text: "Confirm",
					handler: function() {
						Ext.getCmp("win-msg-delete").getEl().mask("Please wait...", "x-mask-loading");
						Ext.Ajax.request({
							url: "api/mn_ExpenseItem.php",
							method: "POST",
							params: {
								mode: "DELETE", 
								imp_expense_dtl_id: record.data.id
							},
							success: function ( result, request ) {
								var jsonData = Ext.util.JSON.decode(result.responseText);	// decode json
								Ext.getCmp("win-msg-delete").destroy();
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
						Ext.getCmp("win-msg-delete").destroy();
					}
				}]
			}).show();
		}
	}; // controllTab
	
	formCheque	 = function( vv ) {
		
		var dc_expense	= [];
		var ChangePrice	= function () {
			
			var dd = new Object();
			
			dd.f_inv					= parseInt(0);
			dd.f_tax_personal			= parseInt(0);
			dd.f_tax_corporate			= parseInt(0);
			dd.f_social_security		= parseInt(0);
			dd.f_money1					= parseInt(0);
			dd.f_fine					= parseInt(0);
			dd.f_total					= parseInt(0);
			dd.f_check_total			= parseInt(0);

			$( "input[id^=no]" ).each(function( i, val ) { // ROW RUN
				var index	= val.value;
				if(Ext.getCmp("f_inv["+index+"]").getValue() != "") {
					dd.f_inv	+= parseFloat(Ext.getCmp("f_inv["+index+"]").getValue().replace(/,/g,""), 2);
				}
				if(Ext.getCmp("f_tax_personal["+index+"]").getValue() != "") {
					dd.f_tax_personal	+= parseFloat(Ext.getCmp("f_tax_personal["+index+"]").getValue().replace(/,/g,""), 2);
				}
				if(Ext.getCmp("f_tax_corporate["+index+"]").getValue() != "") {
					dd.f_tax_corporate	+= parseFloat(Ext.getCmp("f_tax_corporate["+index+"]").getValue().replace(/,/g,""), 2);
				}
				if(Ext.getCmp("f_social_security["+index+"]").getValue() != "") {
					dd.f_social_security	+= parseFloat(Ext.getCmp("f_social_security["+index+"]").getValue().replace(/,/g,""), 2);
				}
				if(Ext.getCmp("f_money1["+index+"]").getValue() != "") {
					dd.f_money1	+= parseFloat(Ext.getCmp("f_money1["+index+"]").getValue().replace(/,/g,""), 2);
				}
				if(Ext.getCmp("f_fine["+index+"]").getValue() != "") {
					dd.f_fine	+= parseFloat(Ext.getCmp("f_fine["+index+"]").getValue().replace(/,/g,""), 2);
				}
				if(Ext.getCmp("f_total["+index+"]").getValue() != "") {
					dd.f_total	+= parseFloat(Ext.getCmp("f_total["+index+"]").getValue().replace(/,/g,""), 2);
				}
				if(Ext.getCmp("f_check_total["+index+"]").getValue() != "") {
					dd.f_check_total	+= parseFloat(Ext.getCmp("f_check_total["+index+"]").getValue().replace(/,/g,""), 2);
				}
			});
			
			$("#Ext_sum_f_inv").html(floatRenderer(dd.f_inv.toFixed(2)));
			$("#Ext_sum_f_tax_personal").html(floatRenderer(dd.f_tax_personal.toFixed(2)));
			$("#Ext_sum_f_tax_corporate").html(floatRenderer(dd.f_tax_corporate.toFixed(2)));
			$("#Ext_sum_f_social_security").html(floatRenderer(dd.f_social_security.toFixed(2)));
			$("#Ext_sum_f_money1").html(floatRenderer(dd.f_money1.toFixed(2)));
			$("#Ext_sum_f_fine").html(floatRenderer(dd.f_fine.toFixed(2)));
			$("#Ext_sum_f_total").html(floatRenderer(dd.f_total.toFixed(2)));
			$("#Ext_sum_f_check_total").html(floatRenderer(dd.f_check_total.toFixed(2)));

			ChangeTotal(dd);
			
		};
		
		var ChangeTotal	= function ( dd ) {
			
			var sum_f_inv_t				= parseFloat(dd.f_inv) - parseFloat(vv.data.f_inv_sum);
			var sum_f_tax_personal_t	= parseFloat(dd.f_tax_personal) - parseFloat(vv.data.f_tax_personal);
			var sum_f_tax_corporate_t	= parseFloat(dd.f_tax_corporate) - parseFloat(vv.data.f_tax_corporate);
			var sum_f_social_security_t	= parseFloat(dd.f_social_security) - parseFloat(vv.data.f_social_security);
			var sum_f_money1_t			= parseFloat(dd.f_money1) - parseFloat(vv.data.f_money1);
			var sum_f_fine_t			= parseFloat(dd.f_fine) - parseFloat(vv.data.f_fine);
			var sum_f_total_t			= parseFloat(dd.f_total) - parseFloat(vv.data.f_total);
			var sum_f_check_total_t		= parseFloat(dd.f_check_total) - parseFloat(vv.data.f_check_total);
			
			// จำนวนรวมทั้งหมด
			$("#Ext_sum_f_inv").html(floatRenderer(parseFloat(dd.f_inv).toFixed(2)));
			$("#Ext_sum_f_tax_personal").html(floatRenderer(parseFloat(dd.f_tax_personal).toFixed(2)));
			$("#Ext_sum_f_tax_corporate").html(floatRenderer(parseFloat(dd.f_tax_corporate).toFixed(2)));
			$("#Ext_sum_f_social_security").html(floatRenderer(parseFloat(dd.f_social_security).toFixed(2)));
			$("#Ext_sum_f_money1").html(floatRenderer(parseFloat(dd.f_money1).toFixed(2)));
			$("#Ext_sum_f_fine").html(floatRenderer(parseFloat(dd.f_fine).toFixed(2)));
			$("#Ext_sum_f_total").html(floatRenderer(parseFloat(dd.f_total).toFixed(2)));
			$("#Ext_sum_f_check_total").html(floatRenderer(parseFloat(dd.f_check_total).toFixed(2)));
			
			// จำนวนรวมฏีกา
			$("#Ext_sum_f_inv_Exp").html(floatRenderer(parseFloat(vv.data.f_inv_sum).toFixed(2)));
			$("#Ext_sum_f_tax_personal_Exp").html(floatRenderer(parseFloat(vv.data.f_tax_personal).toFixed(2)));
			$("#Ext_sum_f_tax_corporate_Exp").html(floatRenderer(parseFloat(vv.data.f_tax_corporate).toFixed(2)));
			$("#Ext_sum_f_social_security_Exp").html(floatRenderer(parseFloat(vv.data.f_social_security).toFixed(2)));
			$("#Ext_sum_f_money1_Exp").html(floatRenderer(parseFloat(vv.data.f_money1).toFixed(2)));
			$("#Ext_sum_f_fine_Exp").html(floatRenderer(parseFloat(vv.data.f_fine).toFixed(2)));
			$("#Ext_sum_f_total_Exp").html(floatRenderer(parseFloat(vv.data.f_total).toFixed(2)));
			$("#Ext_sum_f_check_total_Exp").html(floatRenderer(parseFloat(vv.data.f_check_total).toFixed(2)));
			
			// หักลบยอด
			$("#Ext_sum_f_inv_t").html(floatRenderer(parseFloat(sum_f_inv_t).toFixed(2)));
			$("#Ext_sum_f_tax_personal_t").html(floatRenderer(parseFloat(sum_f_tax_personal_t).toFixed(2)));
			$("#Ext_sum_f_tax_corporate_t").html(floatRenderer(parseFloat(sum_f_tax_corporate_t).toFixed(2)));
			$("#Ext_sum_f_social_security_t").html(floatRenderer(parseFloat(sum_f_social_security_t).toFixed(2)));
			$("#Ext_sum_f_money1_t").html(floatRenderer(parseFloat(sum_f_money1_t).toFixed(2)));
			$("#Ext_sum_f_fine_t").html(floatRenderer(parseFloat(sum_f_fine_t).toFixed(2)));
			$("#Ext_sum_f_total_t").html(floatRenderer(parseFloat(sum_f_total_t).toFixed(2)));
			$("#Ext_sum_f_check_total_t").html(floatRenderer(parseFloat(sum_f_check_total_t).toFixed(2)));
			
		};
		
		// ============================ myFunc ============================ //
		
		var myFunc	= function( index, v = null ) {
			
			dc_expense[index]	= new Ext.data.JsonStore({
				autoLoad: false,
				url: "api/All_ImportExpenseVSN.php",
				baseParams: { type: "dc_expense" },
				root: "data",
				idProperty: "id",
			    fields: [ "id", "c_name", "acc_code", "acc_name", "acc_code_overlap", "acc_name_overlap" ]
			});
			
			new Ext.form.ComboBox({
				id: "dc_expense_group_id["+index+"]",
				store: dc_expense_group,
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
					change: function() {
						Ext.getCmp("win-pop-dtl").getEl().mask("Please wait...", "x-mask-loading");
						dc_expense[index].setBaseParam("dc_expense_group_id", this.getValue());
						dc_expense[index].load({
							callback: function(records, operation, success) {
						    	Ext.getCmp( "dc_expense_id["+index+"]" ).setValue( "" );
						    	Ext.getCmp("win-pop-dtl").getEl().unmask();
						    	$("#Ext_acc_name\\["+index+"\\]").html("<font color=red>- ยังไม่ระบุรายจ่ายย่อย -</font>");
							}
						});
					}
				},
				renderTo: "Ext_dc_expense_group_id["+index+"]"
			});
			
			new Ext.form.ComboBox({
				id: "dc_expense_id["+index+"]",
				store: dc_expense[index],
				valueField: "id",
				displayField: "c_name",
				mode: "local",
				triggerAction: "all",
				emptyText: "กรุณาเลือก...",
				width: 400,
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
					change: function(qq) {
						if(qq.value > 0) {
							if(vv.data.i_type_year == 1) {
								ss = dc_expense[index].getById(qq.value).data.acc_code+"<br>"+dc_expense[index].getById(qq.value).data.acc_name;	
							} else {
								ss = dc_expense[index].getById(qq.value).data.acc_code_overlap+"<br>"+dc_expense[index].getById(qq.value).data.acc_name_overlap;
							}
							$("#Ext_acc_name\\["+index+"\\]").html("<font color=green>"+ss+"</font>");
						} else {
							$("#Ext_acc_name\\["+index+"\\]").html("<font color=red>- ยังไม่ระบุรายจ่ายย่อย -</font>");
						}
					}
				},
				renderTo: "Ext_dc_expense_id["+index+"]"
			});
			
			new Ext.form.TextField({ // จำนวนขอเบิกรวมภาษีมูลค่าเพิ่ม
				id: "f_inv["+index+"]",
				style: "text-align: right",
				width: 100,
				listeners: {
					afterrender: function() {
						this.fn	= function() {
							this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2)));
							ChangePrice();
						}
					},
					Change: function(value) { this.fn(); }
				},
				renderTo: "Ext_f_inv["+index+"]"
			});
			
			new Ext.form.TextField({ // ภาษีหัก ณ ที่จ่าย(บุคคลธรรมดา)
				id: "f_tax_personal["+index+"]",
				style: "text-align: right",
				width: 100,
				listeners: {
					afterrender: function() {
						this.fn	= function() {
							this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2)));
							ChangePrice();
						}
					},
					Change: function(value) { this.fn(); }
				},
				renderTo: "Ext_f_tax_personal["+index+"]"
			});
			
			new Ext.form.TextField({ // ภาษีหัก ณ ที่จ่าย(นิติบุคคล)
				id: "f_tax_corporate["+index+"]",
				style: "text-align: right",
				width: 100,
				listeners: {
					afterrender: function() {
						this.fn	= function() {
							this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2)));
							ChangePrice();
						}
					},
					Change: function(value) { this.fn(); }
				},
				renderTo: "Ext_f_tax_corporate["+index+"]"
			});
			
			new Ext.form.TextField({ // ประกันสังคม
				id: "f_social_security["+index+"]",
				style: "text-align: right",
				width: 100,
				listeners: {
					afterrender: function() {
						this.fn	= function() {
							this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2)));
							ChangePrice();
						}
					},
					Change: function(value) { this.fn(); }
				},
				renderTo: "Ext_f_social_security["+index+"]"
			});
			
			new Ext.form.TextField({ // pljobperamt
				id: "f_money1["+index+"]",
				style: "text-align: right",
				width: 100,
				listeners: {
					afterrender: function() {
						this.fn	= function() {
							this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2)));
							ChangePrice();
						}
					},
					Change: function(value) { this.fn(); }
				},
				renderTo: "Ext_f_money1["+index+"]"
			});
			
			new Ext.form.TextField({ // ค่าปรับ
				id: "f_fine["+index+"]",
				style: "text-align: right",
				width: 100,
				listeners: {
					afterrender: function() {
						this.fn	= function() {
							this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2)));
							ChangePrice();
						}
					},
					Change: function(value) { this.fn(); }
				},
				renderTo: "Ext_f_fine["+index+"]"
			});
			
			new Ext.form.TextField({ // จำนวนจ่ายสุทธิ
				id: "f_total["+index+"]",
				style: "text-align: right",
				width: 100,
				listeners: {
					afterrender: function() {
						this.fn	= function() {
							this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2)));
							ChangePrice();
						}
					},
					Change: function(value) { this.fn(); }
				},
				renderTo: "Ext_f_total["+index+"]"
			});
			
			new Ext.form.TextField({ // จำนวนสุทธิ
				id: "f_check_total["+index+"]",
				style: "text-align: right",
				width: 100,
				listeners: {
					afterrender: function() {
						this.fn	= function() {
							this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2)));
							ChangePrice();
						}
					},
					Change: function(value) { this.fn(); }
				},
				renderTo: "Ext_f_check_total["+index+"]"
			});

			// ลบ
			new Ext.Button({
				id: "delete["+index+"]",
				icon: "../images/icons/bin.gif",
				tooltip: "ลบรายการ",
				handler: function() {
					$("#myTable > tbody > #no\\["+index+"\\]").remove();
					ChangePrice();
                },
				renderTo: "Ext_delete["+index+"]"
			});
			
			if(v != null) {
				if(v.dc_expense_group_id > 0) {
					Ext.getCmp("win-pop-dtl").getEl().mask("Please wait...", "x-mask-loading");
					Ext.getCmp("dc_expense_group_id["+index+"]").setValue(v.dc_expense_group_id);
					dc_expense[index].setBaseParam("dc_expense_group_id", v.dc_expense_group_id);
					dc_expense[index].load({
						callback: function(records, operation, success) {
					    	Ext.getCmp( "dc_expense_id["+index+"]" ).setValue( v.dc_expense_id );
					    	if(v.dc_expense_id > 0) {								
								if(vv.data.i_type_year == 1) {
									ss = dc_expense[index].getById(v.dc_expense_id).data.acc_code+"<br>"+dc_expense[index].getById(v.dc_expense_id).data.acc_name;	
								} else {
									ss = dc_expense[index].getById(v.dc_expense_id).data.acc_code_overlap+"<br>"+dc_expense[index].getById(v.dc_expense_id).data.acc_name_overlap;
								}
								$("#Ext_acc_name\\["+index+"\\]").html("<font color=green>"+ss+"</font>");
							} else {
								$("#Ext_acc_name\\["+index+"\\]").html("<font color=red>- ยังไม่ระบุรายจ่ายย่อย -</font>");
							}
							Ext.getCmp("win-pop-dtl").getEl().unmask();
						}
					});
				} else {
					Ext.getCmp( "dc_expense_id["+index+"]" ).setValue( v.dc_expense_id );
				}

				if(v.f_inv != "") {
					Ext.getCmp( "f_inv["+index+"]" ).setValue( v.f_inv);
					Ext.getCmp( "f_inv["+index+"]" ).fn();
				}
				if(v.f_tax_personal != "") {
					Ext.getCmp( "f_tax_personal["+index+"]" ).setValue( v.f_tax_personal);
					Ext.getCmp( "f_tax_personal["+index+"]" ).fn();
				}
				if(v.f_tax_corporate != "") {
					Ext.getCmp( "f_tax_corporate["+index+"]" ).setValue( v.f_tax_corporate);
					Ext.getCmp( "f_tax_corporate["+index+"]" ).fn();
				}
				if(v.f_social_security != "") {
					Ext.getCmp( "f_social_security["+index+"]" ).setValue( v.f_social_security);
					Ext.getCmp( "f_social_security["+index+"]" ).fn();
				}
				if(v.f_money1 != "") {
					Ext.getCmp( "f_money1["+index+"]" ).setValue( v.f_money1);
					Ext.getCmp( "f_money1["+index+"]" ).fn();
				}
				if(v.f_fine != "") {
					Ext.getCmp( "f_fine["+index+"]" ).setValue( v.f_fine);
					Ext.getCmp( "f_fine["+index+"]" ).fn();
				}
				if(v.f_total != "") {
					Ext.getCmp( "f_total["+index+"]" ).setValue( v.f_total);
					Ext.getCmp( "f_total["+index+"]" ).fn();
				}
				if(v.f_check_total != "") {
					Ext.getCmp( "f_check_total["+index+"]" ).setValue( v.f_check_total);
					Ext.getCmp( "f_check_total["+index+"]" ).fn();
				}
				
			} else {
				$("#Ext_acc_name\\["+index+"\\]").html("<font color=red>- ยังไม่ระบุรายจ่ายย่อย -</font>");
			}
		}; // myFunc
		
		SaveDtl	= function() {

			var msg		= "";
			var jsonArr = [];
			
			$( "input[id^=no]" ).each(function( i, val ) {
				
				var dd		= "";
				var index	= val.value;

				if(Ext.getCmp("dc_expense_id["+index+"]").getValue() == "") { dd += ", รายจ่ายย่อย"; }
				if(Ext.getCmp("f_inv["+index+"]").getValue() == "") { dd += ", จำนวนขอเบิกรวมภาษีมูลค่าเพิ่ม"; }
				
				if(dd != "") {
					msg += "ลำดับที่ "+( parseInt(index)+1)+" กรุณาตรวจสอบ ( "+dd.substring(2)+" )<br>";
				}
			
				jsonArr.push({
					f_inv: Ext.getCmp("f_inv["+index+"]").getValue().replace(/,/g,""),
					f_tax_personal: Ext.getCmp("f_tax_personal["+index+"]").getValue().replace(/,/g,""),
					f_tax_corporate: Ext.getCmp("f_tax_corporate["+index+"]").getValue().replace(/,/g,""),
					f_social_security: Ext.getCmp("f_social_security["+index+"]").getValue().replace(/,/g,""),
					f_money1: Ext.getCmp("f_money1["+index+"]").getValue().replace(/,/g,""),
					f_fine: Ext.getCmp("f_fine["+index+"]").getValue().replace(/,/g,""),
					f_total: Ext.getCmp("f_total["+index+"]").getValue().replace(/,/g,""),
					f_check_total: Ext.getCmp("f_check_total["+index+"]").getValue().replace(/,/g,""),
					dc_expense_id: Ext.getCmp("dc_expense_id["+index+"]").getValue(),
					dc_expense_group_id: Ext.getCmp("dc_expense_group_id["+index+"]").getValue()
				});
			});
			
			if( msg == "" ) {
				Ext.getCmp("win-pop-dtl").getEl().mask("Please wait...", "x-mask-loading");			        					
				$.ajax({
					url: "api/mn_ExpenseItem.php",
					type: "POST",
					data: {
						mode: "ADD_ITEM",
						imp_expense_hdr_id: vv.data.imp_expense_hdr_id,
						imp_expense_dtl_id: vv.data.id,
						data: JSON.stringify(jsonArr)
					},
					success: function(result) {
						Ext.getCmp("win-pop-dtl").getEl().unmask();
						var data = $.parseJSON( result );
						if( data.success == true ) {
							Ext.Msg.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย");
							store.load();
							Ext.getCmp("win-pop-dtl").destroy();
						}
					}
				});
			} else { Ext.Msg.alert("แจ้งเตือน", msg); }
		}; // saveDtl
		
		new Ext.Window({
			title: "แสดง"+title_panel,
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
						url: "api/List_ExpenseItem.php",
						type: "POST",
						data: {
							type: "imp_expense_item",
							imp_expense_dtl_id: vv.data.id
						},
						success: function(result) {
							
							var obj = $.parseJSON( result );
							
							if(obj.debug == true) {
								
								$.each(obj.data , function( index, v ) {
									
									var addBody		= "";
									
									// GEN TBODY
									if(vv.data.c_gx_code != "") {
										
										addBody	+= "<input id='no["+index+"]' type='hidden' value='"+index+"'>";
										addBody	+= "<td nowrap align='center'>"+(index+1)+"</td>";
										addBody	+= "<td nowrap align='center' style='padding: 0px 4px;'>"+v.dc_expense_group_name+"</td>";
										addBody	+= "<td nowrap style='padding: 0px 4px;'>"+v.dc_expense_name+"</td>";
										addBody	+= "<td nowrap style='padding: 0px 4px;'><font color=green>"+v.dc_acc_name+"</font></td>";
										addBody	+= "<td align='right'>"+floatRenderer(v.f_inv)+"</td>";										
										addBody	+= "<td align='right'>"+floatRenderer(v.f_tax_personal)+"</td>";
										addBody	+= "<td align='right'>"+floatRenderer(v.f_tax_corporate)+"</td>";
										addBody	+= "<td align='right'>"+floatRenderer(v.f_social_security)+"</td>";
										addBody	+= "<td align='right'>"+floatRenderer(v.f_money1)+"</td>";
										addBody	+= "<td align='right'>"+floatRenderer(v.f_fine)+"</td>";
										addBody	+= "<td align='right'>"+floatRenderer(v.f_total)+"</td>";
										addBody	+= "<td align='right'>"+floatRenderer(v.f_check_total)+"</td>";
										
										$("#myTable > tbody:last").append("<tr id='no["+index+"]'>"+addBody+"</tr>");
										
									} else {
										
										addBody	+= "<input id='no["+index+"]' type='hidden' value='"+index+"'>";
										addBody	+= "<td nowrap align='center'>"+(index+1)+"</td>";
										addBody	+= "<td id='Ext_dc_expense_group_id["+index+"]' align='center'></td>";
										addBody	+= "<td id='Ext_dc_expense_id["+index+"]' align='center'></td>";
										addBody	+= "<td id='Ext_acc_name["+index+"]' align='center' nowrap style='padding: 0px 4px;'></td>";
										addBody	+= "<td id='Ext_f_inv["+index+"]' align='center'></td>";
										addBody	+= "<td id='Ext_f_tax_personal["+index+"]' align='center'></td>";
										addBody	+= "<td id='Ext_f_tax_corporate["+index+"]' align='center'></td>";
										addBody	+= "<td id='Ext_f_social_security["+index+"]' align='center'></td>";
										addBody	+= "<td id='Ext_f_money1["+index+"]' align='center'></td>";
										addBody	+= "<td id='Ext_f_fine["+index+"]' align='center'></td>";
										addBody	+= "<td id='Ext_f_total["+index+"]' align='center'></td>";
										addBody	+= "<td id='Ext_f_check_total["+index+"]' align='center'></td>";
										addBody	+= "<td id='Ext_delete["+index+"]' align='center'></td>";
									
										$("#myTable > tbody:last").append("<tr id='no["+index+"]'>"+addBody+"</tr>");
										
										myFunc( index, v );
										ChangePrice();
									}
								});
								
								// SUM
								if(vv.data.c_gx_code != "") { ChangeTotal(obj.arr); }
								
								Ext.getCmp("win-pop-dtl").getEl().unmask();
							}
						}
					});
				}
			},
			tbar: [{ xtype: "label", text: "จำนวนแถว : " } ,"-", {
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
				disabled: (vv.data.c_gx_code == "")? false : true,
				handler: function(grid, rowIndex, colIndex) {
					
					var msg	= "";
					
					if(msg	== "") {
						for(var i = 1; 	i <= Ext.getCmp("row-dtl").getValue(); i++) {
							
							var addBody		= "";
							var addFoot		= "";
							
							var beforeIndex= parseInt($("#myTable > tbody > tr:last > input[id^=no]").val());
							var index	= (isNaN(beforeIndex))? 0 : parseInt(beforeIndex) + 1;

							// TBODY
							addBody	+= "<input id='no["+index+"]' type='hidden' value='"+index+"'>";
							addBody	+= "<td nowrap align='center'>"+(index+1)+"</td>";
							addBody	+= "<td id='Ext_dc_expense_group_id["+index+"]' align='center'></td>";
							addBody	+= "<td id='Ext_dc_expense_id["+index+"]' align='center'></td>";
							addBody	+= "<td id='Ext_acc_name["+index+"]' align='center' nowrap style='padding: 0px 4px;'></td>";
							addBody	+= "<td id='Ext_f_inv["+index+"]' align='center'></td>";
							addBody	+= "<td id='Ext_f_tax_personal["+index+"]' align='center'></td>";
							addBody	+= "<td id='Ext_f_tax_corporate["+index+"]' align='center'></td>";
							addBody	+= "<td id='Ext_f_social_security["+index+"]' align='center'></td>";
							addBody	+= "<td id='Ext_f_money1["+index+"]' align='center'></td>";
							addBody	+= "<td id='Ext_f_fine["+index+"]' align='center'></td>";
							addBody	+= "<td id='Ext_f_total["+index+"]' align='center'></td>";
							addBody	+= "<td id='Ext_f_check_total["+index+"]' align='center'></td>";
							addBody	+= "<td id='Ext_delete["+index+"]' align='center'></td>";
							
							$("#myTable > tbody:last").append("<tr id='no["+index+"]'>"+addBody+"</tr>");
							
							myFunc( index );
						}
					} else {
						Ext.MessageBox.alert("แจ้งเตือน", msg);
					}
				}
			}, 	{ xtype : "tbfill" }, {
				xtype: "panel",
				html: 	"<div style=\"font-weight:bold; background:#f5f5f5; padding:5px;\">" +
							"<div style='font-size: 15px; text-align: right;'>"+vv.data.c_approve+" :: "+vv.data.c_acc_item+"</div>" +
						"</div>"
			}],
			html:	"<div style='background:#fff; overflow:auto;'>" +
						"<style> #myTable > tfoot > tr > td { font-weight: bold; } </style>" +
						"<form id='form_save_dtl' name='form_save_dtl' method='POST'>" +
							"<table id='myTable' border='0' cellspacing='1' cellpadding='0' width='100%'>" +
								// headder
								"<thead class='x-grid3-header'>" +
									"<tr class='x-grid3-hd-row' height='20'>" +
										"<td nowrap>ลำดับที่</td>" +
										"<td nowrap>หมวดรายจ่าย</td>" +
										"<td nowrap>รายจ่ายย่อย</td>" +
										"<td nowrap>ผังบัญชี</td>" +
										"<td width=100 nowrap>จำนวนขอเบิก<br>รวมภาษีมูลค่าเพิ่ม</td>" +
										"<td width=100 nowrap>ภาษีหัก ณ ที่จ่าย(บุคคลธรรมดา)</td>" +
										"<td width=100 nowrap>ภาษีหัก ณ ที่จ่าย(นิติบุคคล)</td>" +
										"<td width=100 nowrap>ประกันสังคม</td>" +
										"<td width=100 nowrap>pljobperamt</td>" +
										"<td width=100 nowrap>ค่าปรับ</td>" +
										"<td width=100 nowrap>จำนวนจ่ายสุทธิ</td>" +
										"<td width=100 nowrap>จำนวนสุทธิ</td>" +
										"<td nowrap width='40'>-</td>" +
									"</tr>" +
								"</thead>" +
								// body
								"<tbody></tbody>" +
								"<tfoot>" +
									"<tr>" +
										"<td></td>" +
										"<td></td>" +
										"<td></td>" +
										"<td nowrap align='right'><font color=blue>จำนวนรวมทั้งหมด</font></td>" +
										"<td nowrap id='Ext_sum_f_inv' align='right'></td>" +
										"<td nowrap id='Ext_sum_f_tax_personal' align='right'></td>" +
										"<td nowrap id='Ext_sum_f_tax_corporate' align='right'></td>" +
										"<td nowrap id='Ext_sum_f_social_security' align='right'></td>" +
										"<td nowrap id='Ext_sum_f_money1' align='right'></td>" +
										"<td nowrap id='Ext_sum_f_fine' align='right'></td>" +
										"<td nowrap id='Ext_sum_f_total' align='right'></td>" +
										"<td nowrap id='Ext_sum_f_check_total' align='right'></td>" +
										"<td></td>" +
									"</tr>" +
									"<tr>" +
										"<td></td>" +
										"<td></td>" +
										"<td></td>" +
										"<td nowrap align='right'><font color=red>จำนวนรวมฎีกา</font></td>" +
										"<td nowrap id='Ext_sum_f_inv_Exp' align='right'></td>" +
										"<td nowrap id='Ext_sum_f_tax_personal_Exp' align='right'></td>" +
										"<td nowrap id='Ext_sum_f_tax_corporate_Exp' align='right'></td>" +
										"<td nowrap id='Ext_sum_f_social_security_Exp' align='right'></td>" +
										"<td nowrap id='Ext_sum_f_money1_Exp' align='right'></td>" +
										"<td nowrap id='Ext_sum_f_fine_Exp' align='right'></td>" +
										"<td nowrap id='Ext_sum_f_total_Exp' align='right'></td>" +
										"<td nowrap id='Ext_sum_f_check_total_Exp' align='right'></td>" +
										"<td></td>" +
									"</tr>" +
									"<tr>" +
										"<td></td>" +
										"<td></td>" +
										"<td></td>" +
										"<td nowrap align='right'>หักลบยอด</td>" +
										"<td nowrap id='Ext_sum_f_inv_t' align='right'></td>" +
										"<td nowrap id='Ext_sum_f_tax_personal_t' align='right'></td>" +
										"<td nowrap id='Ext_sum_f_tax_corporate_t' align='right'></td>" +
										"<td nowrap id='Ext_sum_f_social_security_t' align='right'></td>" +
										"<td nowrap id='Ext_sum_f_money1_t' align='right'></td>" +
										"<td nowrap id='Ext_sum_f_fine_t' align='right'></td>" +
										"<td nowrap id='Ext_sum_f_total_t' align='right'></td>" +
										"<td nowrap id='Ext_sum_f_check_total_t' align='right'></td>" +
										"<td></td>" +
									"</tr>" +
								"</tfoot>" +
							"</table>" +
						"</form>" +
					"</div>",
			buttonAlign: "left",
			buttons : [{
				text: Ext.GLOBAL_BU_SAVE_TH,
				iconCls: "icon-save",
				disabled: (vv.data.c_gx_code == "")? false : true,
				handler: function() {
					
					var chkData	= false;
					
					$( "input[id^=no]" ).each(function( i, val ) { chkData	= true; });
					
					if(chkData == true) { SaveDtl(); }
					else { Ext.MessageBox.alert("แจ้งเตือน", "กรุณาเพิ่มข้อมูลรายการ"); }
				}
			}, {
				text: Ext.GLOBAL_BU_BACK_TH,
				handler: function() { Ext.getCmp("win-pop-dtl").destroy(); }
			}]
		}).show();
	}; // formCheque
	// ================================ gridMain ================================ //
	
	// cellClick
	cellClick	= function( grid, rowIndex, columnIndex, e ) {
		
		var record = grid.getStore().getAt(rowIndex);
		
		if (columnIndex == grid.getColumnModel().getIndexById("edit")) {
			controllTab(record, "edit");
		} else if (columnIndex == grid.getColumnModel().getIndexById("delete")) {
			if(record.data.i_many_doc == 2 && record.data.c_gx_code == "") {
				controllTab(record, "delete");	
			}
		}
	}; // cellClick
	
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
						       [ "c_approve", "เลขที่ฎีกา" ],
						      ]
					}),
					value: "c_approve",
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
            	items: [{ xtype: "label", text: "วันที่จ่ายเงิน : " }, { xtype: "tbspacer", width: 4 }, {
            		id: "s_d_doc_date1", xtype: "datefield", width: 128, 
    				listeners : {
						afterrender : function() {
							var date = new Date();
								date = new Date(date.getFullYear()+542, date.getMonth(), 1);
							this.setValue(date);
						}
					}
            	}, { xtype: "tbspacer", width: 6 }, { xtype: "label", text: "ถึงวันที่ : " }, { xtype: "tbspacer", width: 4 }, {
            		id: "s_d_doc_date2", xtype: "datefield", width: 128, 
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
					{ id: "edit", header: "-", sortable: false, align: "center", width:120, dataIndex: "id",
						renderer: function(value, metaData, record, row, col, store, gridView) {
							if(record.data.c_gx_code == "") {
								return "<button style='font-size:11px; cursor:pointer; color: green;'>ระบุรายละเอียดฎีกา</button>";	
							} else {
								return "<button style='font-size:11px; cursor:pointer; color: red;'>แสดง</button>";
							}
						}
					},
					{ id: "delete", header: "-", sortable: false, align: "center", width:120, dataIndex: "id",
						renderer: function(value, metaData, record, row, col, store, gridView) {
							if(record.data.i_many_doc == 2 && record.data.c_gx_code == "") {
								return "<button style='font-size:11px; cursor:pointer; color: blue;'>ลบฏีกาย่อย</button>";	
							}
						}
					},
					{ header: "สถานะฎีกาย่อย", sortable: true, width: 110, align: "center", dataIndex: "i_many_doc",
						renderer: function(value, metaData, record, rowIndex, colIndex, store) {
							value	= (value == 1)? "" : "<font color='red'>มีหลายรายการ</font>";
				    		return value;
				    	}
					},
					{ header: "GX", sortable: true, width: 110, align: "center", dataIndex: "c_gx_code" },
					{ header: "เลขที่ฎีกา", sortable: true, width: 110, align: "center", dataIndex: "c_approve" },
					{ header: "วันที่จ่ายเงิน", sortable: true, align: "center", dataIndex: "d_doc_date",
						renderer: function(value, metaData, record, rowIndex, colIndex, store) {
							return (value != "")? shortThaiDate(value) : "";
						}
					},
					{ header: "ชื่อรายการ", sortable: true, width: 300, dataIndex: "c_acc_item" },
				    { header: "จำนวนขอเบิก<br>รวมภาษีมูลค่าเพิ่ม", sortable: true, dataIndex: "f_inv_sum",
				    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				    		metaData.attr = "style= \"cursor:pointer; text-align:right; color: blue;\";";
				    		return floatRenderer(value);
				    	}
				    },
				    { header: "ภาษีหัก ณ ที่จ่าย<br>(บุคคลธรรมดา)", sortable: true, dataIndex: "f_tax_personal",
				    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				    		metaData.attr = "style= \"cursor:pointer; text-align:right; color: blue;\";";
				    		return floatRenderer(value);
				    	}
				    },
				    { header: "ภาษีหัก ณ ที่จ่าย<br>(นิติบุคคล)", sortable: true, dataIndex: "f_tax_corporate",
				    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				    		metaData.attr = "style= \"cursor:pointer; text-align:right; color: blue;\";";
				    		return floatRenderer(value);
				    	}
				    },
				    { header: "ประกันสังคม", sortable: true, dataIndex: "f_social_security",
				    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				    		metaData.attr = "style= \"cursor:pointer; text-align:right; color: blue;\";";
				    		return floatRenderer(value);
				    	}
				    },
				    { header: "ประกันสังคม", sortable: true, dataIndex: "f_social_security",
				    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				    		metaData.attr = "style= \"cursor:pointer; text-align:right; color: blue;\";";
				    		return floatRenderer(value);
				    	}
				    },
				    { header: "pljobperamt", sortable: true, dataIndex: "f_money1",
				    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				    		metaData.attr = "style= \"cursor:pointer; text-align:right; color: blue;\";";
				    		return floatRenderer(value);
				    	}
				    },
				    { header: "ค่าปรับ", sortable: true, dataIndex: "f_fine",
				    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				    		metaData.attr = "style= \"cursor:pointer; text-align:right; color: blue;\";";
				    		return floatRenderer(value);
				    	}
				    },
				    { header: "จำนวนจ่ายสุทธิ", sortable: true, dataIndex: "f_total",
				    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				    		metaData.attr = "style= \"cursor:pointer; text-align:right; color: blue;\";";
				    		return floatRenderer(value);
				    	}
				    },
				    { header: "จำนวนสุทธิ", sortable: true, dataIndex: "f_check_total",
				    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				    		metaData.attr = "style= \"cursor:pointer; text-align:right; color: blue;\";";
				    		return floatRenderer(value);
				    	}
				    }
				],
// autoExpandColumn: "c_comment",
		bbar: pagingBar
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
	// SET ref Grid&Tab
	Ext.getCmp("tabpanel1").on("cellclick", cellClick, this);

	// SetTab Controller Loads
	Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
	/* ====================== RENDER ====================== */
	new Ext.Viewport({
		layout: "border",
		items: [ center ]
	});
});