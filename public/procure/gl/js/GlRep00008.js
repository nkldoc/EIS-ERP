Ext.onReady(function() {
	Ext.QuickTips.init();

	/* =============================================== */
	if(PAGE == "GlRep00008") {
		title_panel = "ค่าใช้จ่ายคณะแพทยศาสตร์วชิรพยาบาล (บัญชี)";
		textComment	= "หมายเหตุ : สามารถดูรายงานนี้ได้เมื่อบันทึกบัญชี GL ของเอกสาร IMPE/IMPV/BTN แล้ว";
	} else {
		title_panel = "ค่าใช้จ่ายคณะแพทยศาสตร์วชิรพยาบาล";
		textComment	= "หมายเหตุ : สามารถดูรายงานนี้ได้เมื่อบันทึกออกเลขที่เอกสาร IMPE/IMPV/BTN แล้ว";
	}
	/* =============================================== */

	var ArrD	= [];
	
	ArrD[0]	= "ผังบัญชี";
	ArrD[1]	= "หักส่งคืน";
	ArrD[2]	= "ปรับปรุง";
	ArrD[3]	= "ไม่ระบุ";
	
	Ext.store = new Ext.data.JsonStore({
		id: "store",
		autoLoad: false, 
	    url: "api/List_GlRep00008.php",
	    baseParams: { type: "imp_expense", i_read: user_right_read }, // Permission i_read
	    root: "data",
	    idProperty: "id",
		totalProperty: "totalCount",
		chkMask: false, // status: loading
		fields: [
				{ name : "no" },
				{ name : "pk_dtl_id" },
				{ name : "table_name" },
				{ name : "table_name_show" },
				{ name : "c_code" },
				{ name : "c_approve" },
				{ name : "c_expense_name" },
				{ name : "f_inv" },
				{ name : "dc_acc_id_old" },
				{ name : "acc_name_old" },
				{ name : "dc_acc_id" },
				{ name : "acc_name" },
				{ name : "dc_acc_id_overlap" },
				{ name : "acc_name_overlap" },
				{ name : "i_type_year" },
				{ name : "c_budget_year" },
				{ name : "year_show" },
				{ name : "c_many_doc" },
				{ name : "expense_group_id" },
				{ name : "expense_id" },
				{ name : "i_is_post" },
				/* ข้อมูลบัญชี */
				{ name : "gl_tran_dtl_id" },
				{ name : "gl_code" },
				{ name : "gl_acc_name" },
				{ name : "gl_i_type_year" },
				{ name : "gl_c_budget_year" },
				{ name : "gl_f_dr" },
		]
	});
	
	//หมวดรายจ่าย
	Ext.expense_group	= new Ext.data.JsonStore({
		autoLoad: false,
		url: "api/All_GlRep00008.php",
		baseParams: { type: "expense_group" },
		chkMask: false, // status: loading
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ]
	});
	
	//รายจ่ายย่อย
	Ext.expense		= new Ext.data.JsonStore({
		autoLoad: false,
		url: "api/All_GlRep00008.php",
		baseParams: { type: "expense" },
		chkMask: false, // status: loading
		root: "data",
		idProperty: "id",
		fields: [ "id", "c_name", "acc_name" ]
	});
	
	var store_month = new Ext.data.JsonStore({
		fields : [ "id", "c_name" ],
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

	vw_dc_expense_budget_type = new Ext.data.JsonStore({
		autoDestroy : false,
		autoLoad : true,
		url : "api/All_GlRep00008.php",
		baseParams : {
			type : "vw_dc_expense_budget_type",
			all : "all"
		},
		root : "data",
		idProperty : "id",
		fields : [ "id", "c_name" ],
	});
	
	store_acc_s_parent = new Ext.data.JsonStore({
		autoLoad : true,
		url : "api/All_GlRep00008.php",
		baseParams : { type : "dc_acc_main", show : "all" },
		root : "data",
		idProperty : "id",
		fields : [ "id", "c_name", "cut_name" ],
		listeners: {
	        load: function(t, records, options) {
//	        	Ext.getCmp("gl_dc_book_type_id").setValue(records[0].id);
	        }
		}
	});
	
	store_acc_s_parent_lv5 = new Ext.data.JsonStore({
		autoLoad : true,
		url : "api/All_GlRep00008.php",
		baseParams : { type : "dc_acc_main_lv5", show : "all" },
		root : "data",
		idProperty : "id",
		fields : [ "id", "c_name", "cut_name" ]
	});

	store_acc_s = new Ext.data.JsonStore({
		autoLoad : true,
		url : "api/All_GlRep00008.php",
		baseParams : { type : "dc_acc", show : "all" },
		root : "data",
		idProperty : "id",
		fields : [ "id", "c_name", "cut_name" ]
	});

	// storeYear
	var years = [];
	var currentTime = new Date();
	var now = currentTime.getFullYear() + 1;
	var yy_en = Ext.START_YEAR_ACC;
	while (yy_en <= now) {
		years.push({ id : yy_en, c_name : yy_en + 543 });
		yy_en++;
	};

	Ext.store_year = new Ext.data.JsonStore({
		fields : [ "id", "c_name" ],
		data : years
	});

	LookReport = function(type) {

		var msg = "";
		
		var s_dc_acc_id_parent = "";
		var s_dc_acc_id_parent_lv5 = "";
		var s_dc_acc_id = "";

		if (Ext.getCmp("dc_expense_budget_type_id").getValue() == "") {
			msg += "- กรุณาเลือก แหล่งเงิน<br>";
		}
		
		if (Ext.getCmp("i_show_acc").getValue().inputValue == 1) {
			if (Ext.getCmp("s_dc_acc_id_parent").getValue() == "") {
				msg += "- กรุณาเลือก บัญชีคุม Lv4 อย่างน้อย 1 รายการ<br>";
			} else {
				s_dc_acc_id_parent = Ext.getCmp("s_dc_acc_id_parent").getValue();
			}
		} else if (Ext.getCmp("i_show_acc").getValue().inputValue == 3) {
			if (Ext.getCmp("s_dc_acc_id_parent_lv5").getValue() == "") {
				msg += "- กรุณาเลือก บัญชีคุม Lv5 อย่างน้อย 1 รายการ<br>";
			} else {
				s_dc_acc_id_parent_lv5 = Ext.getCmp("s_dc_acc_id_parent_lv5").getValue();
			}
		} else {
			if (Ext.getCmp("s_dc_acc_id").getValue() == "") {
				msg += "- กรุณาเลือก บัญชีย่อยอย่างน้อย 1 รายการ<br>";
			} else {
				s_dc_acc_id = Ext.getCmp("s_dc_acc_id").getValue();
			}
		}

		if (msg == "") {

			var href = "report/Rep_GlRep00008.php";
			var resultUrl = "";

			resultUrl += "&type=" + type;
			resultUrl += "&PAGE=" + PAGE;
			
			$.each( ArrD, function( key, vv ) {
				resultUrl += "&i_btn"+key+"=" + ((Ext.getCmp("i_btn["+key+"]").checked)? 1 : 2);
				resultUrl += "&i_gx"+key+"=" + ((Ext.getCmp("i_gx["+key+"]").checked)? 1 : 2);
			});
			
			resultUrl += "&year=" + Ext.getCmp("year").getValue();
			resultUrl += "&date_start=" + Ext.util.Format.date(Ext.getCmp('date_start').getValue(), 'Y-m-d');
			resultUrl += "&date_end=" + Ext.util.Format.date(Ext.getCmp('date_end').getValue(), 'Y-m-d');
			resultUrl += "&i_show_month=" + Ext.getCmp('i_show_month').getValue().inputValue;
			resultUrl += "&c_mm1=" + Ext.getCmp("c_mm1").getValue();
			resultUrl += "&c_mm2=" + Ext.getCmp("c_mm2").getValue();
			resultUrl += "&dc_expense_budget_type_id=" + Ext.getCmp("dc_expense_budget_type_id").getValue();
			resultUrl += "&i_show_acc="+ Ext.getCmp("i_show_acc").getValue().inputValue;
			resultUrl += "&dc_acc_id_parent=" + s_dc_acc_id_parent;
			resultUrl += "&dc_acc_id_parent_lv5=" + s_dc_acc_id_parent_lv5;
			resultUrl += "&dc_acc_id=" + s_dc_acc_id;
			resultUrl += "&i_approve=" + ((Ext.getCmp("i_approve").checked)? 1 : 2);

			resultUrl = (resultUrl != "") ? "?" + resultUrl.substring(1) : "";

			window.open(href + resultUrl, href);
			window.focus();

		} else {
			Ext.MessageBox.alert("แจ้งเตือน", msg);
		}
	};
	
	// แก้ไขรายการฏีกา
	SaveDetail = function() {
		
		// Loading Complete
		chkData	= function() {

			var cellClick_lov	= function(grid, rowIndex, columnIndex, e) {
				
				var record	= grid.getStore().getAt(rowIndex);
					
				chkDataGrid	= function() {
					/* ข้อมูลนำเข้า */
		            Ext.getCmp("pk_dtl_id").setValue(record.data.pk_dtl_id);
		            Ext.getCmp("table_name").setValue(record.data.table_name);
		            Ext.getCmp("dc_acc_id_old").setValue(record.data.dc_acc_id_old);
		//				            Ext.getCmp("dc_acc_id").setValue(record.data.dc_acc_id);
		            Ext.getCmp("dc_acc_id_overlap").setValue(record.data.dc_acc_id_overlap);
		//				            Ext.getCmp("acc_name").setValue(record.data.acc_name);
		            Ext.getCmp("acc_name_overlap").setValue(record.data.acc_name_overlap);
					Ext.getCmp("c_approve").setValue(record.data.c_approve);
					Ext.getCmp("table_name_show").setValue(record.data.table_name_show);
					Ext.getCmp("c_code").setValue(record.data.c_code);
					Ext.getCmp("f_inv").setValue(floatRenderer(floatMinus(record.data.f_inv, 2)));
					Ext.getCmp("i_type_year").setValue(record.data.i_type_year);
		//							Ext.getCmp("i_type_year").fn();
					Ext.getCmp("c_budget_year").setValue(record.data.c_budget_year);
		//							Ext.getCmp("c_many_doc").setValue(record.data.c_many_doc);
					Ext.getCmp("dc_acc_name_old").setValue(record.data.acc_name_old);
					Ext.getCmp("expense_group_id").setValue(record.data.expense_group_id);
					Ext.getCmp("expense_id").setValue(record.data.expense_id);
					
					/* ข้อมูลบัญชี */
					Ext.getCmp("gl_tran_dtl_id").setValue(record.data.gl_tran_dtl_id);
		            Ext.getCmp("gl_acc_name").setValue(record.data.gl_acc_name);
					Ext.getCmp("gl_code").setValue(record.data.gl_code);
					Ext.getCmp("gl_f_dr").setValue(floatRenderer(floatMinus(record.data.gl_f_dr, 2)));
					Ext.getCmp("gl_i_type_year").setValue(record.data.gl_i_type_year);
					Ext.getCmp("gl_c_budget_year").setValue(record.data.gl_c_budget_year);
					
					if(record.data.i_is_post != 1) {
						Ext.getCmp("expense_group_id").disable();
						Ext.getCmp("expense_id").disable();
					} else {
						Ext.getCmp("expense_group_id").enable();
						Ext.getCmp("expense_id").enable();
					}
				};
				
				// check loading store
				Ext.expense_group.setBaseParam("table_name", record.data.table_name);
				Ext.expense.setBaseParam("table_name", record.data.table_name);
				Ext.expense.setBaseParam("expense_group_id", record.data.expense_group_id);

				var myComboStores	= [ Ext.expense_group, Ext.expense ];
				
				// function เช็คโหลด store ทั้งหมดก่อนทำ step ถัดไป
				chkLoadingStore(myComboStores, "win-pop-edit", chkDataGrid);
			};
				
			new Ext.Window({
				title: "เลือกข้อมูล",
				id: "win-pop-edit",
				layout: "column",
				modal: true,
				border: false,
				items:[{ // column 1
		            columnWidth: 0.45,
		            layout: "fit",
		            height: (Ext.getBody().getViewSize().height * 0.95),
					width: (Ext.getBody().getViewSize().width * 0.29),
					border: false,
		            items: [new Ext.FormPanel({
		                labelWidth: 80, // label settings here cascade unless overridden
		                labelAlign: "right",
		                frame: true,
		                items: [{
		                    xtype: "fieldset",
		                    title: "ข้อมูลนำเข้า",
		                    defaults: { xtype: "displayfield"},
		                    items :[
	                            { xtype: "hidden", id: "pk_dtl_id" }
	                            ,{ xtype: "hidden", id: "table_name" }
	                            ,{ xtype: "hidden", id: "dc_acc_id_old" }
//	                            ,{ xtype: "hidden", id: "dc_acc_id" }
	                            ,{ xtype: "hidden", id: "dc_acc_id_overlap" }
	                            ,{ xtype: "hidden", id: "acc_name" }
	                            ,{ xtype: "hidden", id: "acc_name_overlap" }
	                            ,{ id: "c_code", fieldLabel: "รหัส", style: "color:blue; font-weight: bold;", width: "100%" }
	                            ,{ id: "c_approve", fieldLabel: "เลขที่ฏีกา", width: "100%" }
	                            ,{ id: "table_name_show", fieldLabel: "ระบบ", width: "100%" }
	                            ,new Ext.form.ComboBox({
	                            	fieldLabel: "หมวดรายจ่าย",
	            					id: "expense_group_id",
	            					store: Ext.expense_group,
	            					valueField: "id",
	            					displayField: "c_name",
	            					mode: "local",
	            					triggerAction: "all",
	            					emptyText: "กรุณาเลือก...",
	            					width: 340,
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
	            							Ext.getCmp("win-pop-edit").getEl().mask("Please wait...", "x-mask-loading");
	            							Ext.expense.setBaseParam("expense_group_id", this.getValue());
	            							Ext.expense.load({
	            								callback: function(records, operation, success) {
	            									Ext.getCmp("win-pop-edit").getEl().unmask();
	            							    	Ext.getCmp( "expense_id" ).setValue("");
	            							    	Ext.getCmp( "dc_acc_name_old" ).setValue("<font color=red>- ยังไม่ระบุรายจ่ายย่อย -</font>");
	            								}
	            							});
	            						}
	            					}
	            				})
	                            ,new Ext.form.ComboBox({
	                            	fieldLabel: "รายจ่ายย่อย",
	            					id: "expense_id",
	            					store: Ext.expense,
	            					valueField: "id",
	            					displayField: "c_name",
	            					mode: "local",
	            					triggerAction: "all",
	            					emptyText: "กรุณาเลือก...",
	            					width: 340,
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
	            							if(qq.value != "") {
	            								Ext.getCmp( "dc_acc_name_old" ).setValue(this.store.getById(qq.value).data.acc_name);
	            							} else {
	            								Ext.getCmp( "dc_acc_name_old" ).setValue("<font color=red>- ยังไม่ระบุรายจ่ายย่อย -</font>");
	            							}
	            						}
	            					}
	            				})
	                            ,{ id: "dc_acc_name_old", fieldLabel: "ผังบัญชี", width: "100%" }
	                            ,{ id: "f_inv", fieldLabel: "จำนวนเงิน", width: "100%" }
//	                            ,{ id: "c_many_doc", fieldLabel: "สถานะฏีกาย่อย", width: "100%" }
//	                            ,{ id: "dc_acc_name", fieldLabel: "ผังบัญชีใหม่",style: "color:red;", width: "100%" }                            
	                            ,new Ext.form.RadioGroup({
	                            	fieldLabel: "แก้ไข",
	        						id: "i_type_year",
	        						columns: [ 100, 100 ],
	        						items: [
	        							{ boxLabel: "ปีงบประมาณ", name: "i_type_year", inputValue: 1, checked: true },
	        							{ boxLabel: "เหลื่อมปี", name: "i_type_year", inputValue: 2 },
	        						],
//	        						listeners: {
//	        							afterrender: function() {
//	        								this.fn = function() {
//	        									var i_type_year	= Ext.getCmp("i_type_year").getValue().inputValue;
//	        									if( i_type_year == 1 ) {
//	        										Ext.getCmp("dc_acc_name").setValue(Ext.getCmp("acc_name").getValue());
//	        									} else {
//	        										Ext.getCmp("dc_acc_name").setValue(Ext.getCmp("acc_name_overlap").getValue());
//	        									}
//	        								}
//	        							},
//	        							Change: function(value) { this.fn(); }
//	        						}
	                            }), new Ext.form.ComboBox({
									id: "c_budget_year",
									store: Ext.store_year,
									valueField: "id",
									displayField: "c_name",
									mode: "local",
									triggerAction: "all",
									emptyText: "กรุณาเลือก...",
									forceSelection: true,
									selectOnFocus: true,
									typeAhead: false,
									width: 158,
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
								})
	                    	]
		                }, {
		                    xtype: "fieldset",
		                    title: "ข้อมูลบัญชี",
		                    defaults: { xtype: "displayfield"},
		                    items :[
		                        { xtype: "hidden", id: "gl_tran_dtl_id" } 
	                            ,{ id: "gl_code", fieldLabel: "รหัส", style: "color:red; font-weight: bold;", width: "100%" }
	                            ,{ id: "gl_acc_name", fieldLabel: "ผังบัญชี", width: "100%" }
	                            ,{ id: "gl_f_dr", fieldLabel: "จำนวนเงิน", width: "100%" }
	                            ,new Ext.form.RadioGroup({
	                            	fieldLabel: "แก้ไข",
	        						id: "gl_i_type_year",
	        						columns: [ 100, 100 ],
	        						items: [
	        							{ boxLabel: "ปีงบประมาณ", name: "gl_i_type_year", inputValue: 1, checked: true },
	        							{ boxLabel: "เหลื่อมปี", name: "gl_i_type_year", inputValue: 2 },
	        						],
	                            }), new Ext.form.ComboBox({
									id: "gl_c_budget_year",
									store: Ext.store_year,
									valueField: "id",
									displayField: "c_name",
									mode: "local",
									triggerAction: "all",
									emptyText: "กรุณาเลือก...",
									forceSelection: true,
									selectOnFocus: true,
									typeAhead: false,
									width: 158,
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
								})
	                    	]
		                }],
		                buttons: [{
		                	text : "&nbsp;"+Ext.GLOBAL_BU_SAVE_TH+"&nbsp;",
		                	iconCls	: "icon-save",
		                	handler : function() {
		                    	
		                		var msg		= "";
		                		var i_type_year		= Ext.getCmp("i_type_year").getValue().inputValue;
		                		var gl_i_type_year	= null;
	
				   				if(Ext.getCmp("pk_dtl_id").getValue() == "" || Ext.getCmp("table_name").getValue() == "") { msg	+= "กรุณาเลือก เลขที่ฏีกาทางด้านขวาก่อน<br>"; }
				   				else {
				   					
				   					console.log(Ext.getCmp("expense_group_id").getValue());
				   					console.log(Ext.getCmp("expense_id").getValue());
				   					
				   					if(Ext.getCmp("expense_group_id").getValue() == "") { msg += "กรุณาเลือก หมวดรายจ่าย<br>"; }
				   					if(Ext.getCmp("expense_id").getValue() == "") { msg += "กรุณาเลือก รายจ่ายย่อย<br>"; }
				   					
				   					if(i_type_year == 1) {
//				   						if(Ext.getCmp("dc_acc_id_old").getValue() != Ext.getCmp("dc_acc_id").getValue()) {
//				   							msg	+= "ผังบัญชีเดิม กับ ผังบัญชีใหม่ไม่ตรงกัน<br>";
//				   						}
				   					} else if(i_type_year == 2) {
//				   						if(Ext.getCmp("dc_acc_id_old").getValue() != Ext.getCmp("dc_acc_id_overlap").getValue()) {
//				   							msg	+= "ผังบัญชีเดิม กับ ผังบัญชีใหม่ไม่ตรงกัน<br>";
//				   						}
				   					} else {
				   						msg	+= "กรุณาเลือก ปีงบประมาณก่อน<br>";
				   					}
				   					if(Ext.getCmp("c_budget_year").getValue() == "") { msg	+= "กรุณาเลือก ปี พ.ศ.<br>"; }
				   					
				   					/* ข้อมูลบัญชี */
				   					if(Ext.getCmp("gl_tran_dtl_id").getValue() != "") {
				   						
				   						gl_i_type_year	= Ext.getCmp("gl_i_type_year").getValue().inputValue;
				   						
				   						if(gl_i_type_year == 1) {}
				   						else if(gl_i_type_year == 2) {}
				   						else {
					   						msg	+= "กรุณาเลือก ปีงบประมาณบัญชีก่อน<br>";
					   					}
					   					if(Ext.getCmp("gl_c_budget_year").getValue() == "") { msg	+= "กรุณาเลือก ปี พ.ศ. บัญชีก่อน<br>"; }
				   					}
				   				}
				   				
		                    	if(msg == "") {
		                    		
		                    		new Ext.Window({
		    							id: "win-pop-confirm",
		    							title: "ยืนยันรายการ",
		    							modal: true,
		    							autoHeight: true,
		    							width: 270,
		    							html: "<div style='font-size: 14px; padding: 8px 2px; background: #fff; height: 45px;'>ต้องการแก้ไขปีงบประมาณหรือไม่ ?</div>",
		    							buttons: [{
		    								text: "Confirm",
		    								handler: function() {
		    									Ext.getCmp("win-pop-confirm").getEl().mask("Please wait...", "x-mask-loading");
		    									Ext.Ajax.request({
		    										url: "api/mn_GlRep00008.php",
		    										method: "POST",
		    										params: {
		    											mode: "SAVE_APPROVE", 
			                    						table_name: Ext.getCmp("table_name").getValue(),
			                    						pk_dtl_id: Ext.getCmp("pk_dtl_id").getValue(),
			                    						expense_group_id: Ext.getCmp("expense_group_id").getValue(),
			                    						expense_id: Ext.getCmp("expense_id").getValue(),
			                    						i_type_year: i_type_year,
			                    						c_budget_year: Ext.getCmp("c_budget_year").getValue(),
			                    						gl_tran_dtl_id: Ext.getCmp("gl_tran_dtl_id").getValue(),
			                    						gl_i_type_year: gl_i_type_year,
			                    						gl_c_budget_year: Ext.getCmp("gl_c_budget_year").getValue()
		    										},
		    										success: function ( result, request ) {
		    											Ext.getCmp("win-pop-confirm").getEl().unmask();
		    											var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
		    											if (jsonData.success == true) {
		    												Ext.MessageBox.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย");		// alert massage success
		    												Ext.getCmp("win-pop-confirm").destroy();
		    												Ext.store.load();
		    											} else {
		    												Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg);			// alert massage error	
		    											}
		    										},
		    										failure: function ( result, request) { 
		    											Ext.MessageBox.alert("Failed", result.responseText);		// connect error
		    										}
		    									});
		    								}
		    							}, {
		    								text : Ext.GLOBAL_BU_BACK_TH,
		    								handler : function() { Ext.getCmp("win-pop-confirm").destroy(); }
		    							}]
		    						}).show();
		                    		
		                    	} else { Ext.Msg.alert("แจ้งเตือน", msg); }
		                    }
		                }, {
		                    text: Ext.GLOBAL_BU_BACK_TH,
		                    handler : function() { Ext.getCmp("win-pop-edit").destroy(); }
		                }]
		            })]
				}, { // column 2
					columnWidth: 0.55,
		            layout: "fit",
		            height: (Ext.getBody().getViewSize().height * 0.95),
					width: (Ext.getBody().getViewSize().width * 0.69),
		            items: [{
						xtype: "grid",
						id: "grid-dtl",
						border: false,
						stripeRows: true,
						loadMask: true,
						store: Ext.store,
						viewConfig : {
							emptyText: "ไม่มีข้อมูล..",
							deferEmptyText: false
						},
						tbar: [{ xtype: "label", text: "เลขที่ฎีกา" }, "-",{
		            		xtype: "textfield",
		            		id: "value-box",
		            		width: 150,
		           			fieldLabel: "fieldLabel",
		           			emptyText: "คำที่ต้องการค้นหา"
		           		}, "-", {
							text : "ค้นหา",
							iconCls: "icon-magnifier",
							handler : function() {
			    				
			    				var msg	= "";
			    				
			    				if(Ext.getCmp("value-box").getValue() == "") { msg += "กรุณากรอกคำค้นหา"; }
			    				
			    				if(msg == "") {
			    					
									Ext.store.setBaseParam("mode", "SEARCH");
									Ext.store.setBaseParam("value", Ext.getCmp("value-box").getValue()); 
									Ext.store.load();
									
			    				} else { Ext.Msg.alert("แจ้งเตือน", msg); }
			    			}
						}],
						columns: [
					    new Ext.grid.RowNumberer({header:"ที่", width: 30,
							renderer: function(value, metaData, record, row, col, store, gridView) {
								metaData.attr = "style= 'cursor:pointer; text-align:center;';";
								return record.get("no");
							}
						}), { header: "เลขที่ฎีกา", sortable: true, align: "center", dataIndex: "c_approve",
							renderer: function(value, metaData, record, rowIndex, colIndex, store) {
								metaData.attr = "style= 'cursor:pointer; text-align:center; color:blue;';";
								return value;
							}
						}, { header: "ระบบ", sortable: true, align: "center", dataIndex: "table_name_show",
							renderer: function(value, metaData, record, rowIndex, colIndex, store) {
								metaData.attr = "style= 'cursor:pointer; text-align:center;';";
								return value;
							}
						},
						{ header: "รหัส", sortable: true, align: "center", dataIndex: "c_code",
							renderer: function(value, metaData, record, rowIndex, colIndex, store) {
								metaData.attr = "style='cursor:pointer; text-align:center;';";
								return value;
							}
						},
						{ header: "จำนวนเงิน", sortable: false, dataIndex: "f_inv",
							renderer: function(value, metaData, record, row, col, store, gridView) {
								metaData.attr = "style= 'cursor:pointer; text-align:right;';";
								return floatRenderer(floatMinus(value, 2));
							}
						},
						{ header: "ปีงบประมาณ", sortable: true, align: "center", dataIndex: "year_show",
							renderer: function(value, metaData, record, rowIndex, colIndex, store) {
								metaData.attr = "style= 'cursor:pointer; text-align:center;';";
								return value;
							}
						}],
					}]
				}]
			}).show();
			
			Ext.getCmp("grid-dtl").on("cellclick", cellClick_lov, this);
		};
		
		// check loading store
		Ext.store.setBaseParam("mode", "SEARCH");
		Ext.store.setBaseParam("value", 0); 
		Ext.expense_group.setBaseParam("table_name", "");
		Ext.expense.setBaseParam("table_name", "");

		var myComboStores	= [ Ext.store, Ext.expense_group, Ext.expense ];
		
		// function เช็คโหลด store ทั้งหมดก่อนทำ step ถัดไป
		chkLoadingStore(myComboStores, "panelForm", chkData);
	};

	var panelForm = new Ext.Panel({
		id: "panelForm",
		region : "center",
		title : title_panel,
		border : false,
		stripeRows : true,
		loadMask : true,
		items : [{
			xtype : "form",
			frame : true,
			labelAlign : "right",
			labelWidth : 200,
			bodyStyle : { padding : "10px 20px" },
			defaults : {
				anchor : "100%",
				msgTarget : "side",
				allowBlank : false
			},
			items : [ {
				xtype : "container",
				layout : "hbox",
				align : "stretch",
				RemoveHeight : true,
				defaults : {
					xtype : "fieldset",
					flex : 1,
					margins : "0px 3px",
					autoHeight : true
				},
				items : [ {
					title : "เมนู " + title_panel,
					RemoveCls : "x-box-item",
					defaults : {
						labelStyle : "width:200px;",
						allowBlank : true
					},
					items : [
						new Ext.form.ComboBox({
							id : "year",
							fieldLabel : "ปีงบประมาณ",
							width : 262,
							mode : "local",
							store : Ext.store_year,
							valueField : "id",
							displayField : "c_name",
							triggerAction : "all",
							forceSelection : true,
							selectOnFocus : true,
							typeAhead : false,
							emptyText : "กรุณาเลือก...",
							value : new Date().getFullYear(),
							listeners : {
								"change" : function(combo,newValue) {
									if (newValue == "") { combo.reset(); }
								},
								beforequery : function(q) {
									if (q.query) {
										var length = q.query.length;
										q.query = new RegExp( Ext.escapeRe(q.query));
										q.query.length = length;
									}
								},
								blur : function() { this.getStore().clearFilter();}
							}
						}),new Ext.ux.form.LovCombo({
							id : "dc_expense_budget_type_id",
							fieldLabel : "แหล่งเงิน",
							width : 262,
							mode : "local",
							store : vw_dc_expense_budget_type,
							valueField : "id",
							displayField : "c_name",
							triggerAction : "all",
							forceSelection : true,
							selectOnFocus : true,
							typeAhead : false,
							emptyText : "กรุณาเลือก..."
						}), {
							xtype : 'compositefield',
							fieldLabel : 'วันที่บันทึกบัญชี',
							anchor : '100%',
							msgTarget : 'under',
							items : [ {
								xtype : 'datefield',
								id : 'date_start',
								value : addY(543)
							}, {
								xtype : 'displayfield',
								value : 'ถึงวันที่',
								width : 36,
								align : 'center'
							}, {
								xtype : 'datefield',
								id : 'date_end',
								value : addY(543)
							}]
						}, {
							xtype : "radiogroup",
							id : "i_show_month",
							fieldLabel : "แสดงเดือน",
							columns : [ 70, 80, 100 ],
							items : [{
								boxLabel : "ทั้งหมด",
								name : "i_show_month",
								inputValue : 1,
								checked : true
							}, {
								boxLabel : "ช่วงเดือน",
								name : "i_show_month",
								inputValue : 2
							}, {
								boxLabel : "รายวัน",
								name : "i_show_month",
								inputValue : 3
							}],
							listeners : {
								change : function(obj, value) {
									if (value.inputValue == 2) {
										Ext.getCmp("span_month").show();
									} else {
										Ext.getCmp("span_month").hide();
									}
								}
							}
						}, {
							xtype : 'compositefield',
							id : "span_month",
							fieldLabel : 'ช่วงเดือน',
							anchor : '100%',
							msgTarget : 'under',
							hidden : true,
							items : [new Ext.form.ComboBox({
								id : "c_mm1",
								store : store_month,
								valueField : "id",
								displayField : "c_name",
								mode : "local",
								triggerAction : "all",
								emptyText : "กรุณาเลือก...",
								width : 117,
								forceSelection : true,
								selectOnFocus : true,
								typeAhead : false,
								editable : false,
								value : "01",
								listeners : {
									"change" : function( combo, newValue) { if (newValue == "") { combo.reset(); } },
									beforequery : function(q) {
										if (q.query) {
											var length = q.query.length;
											q.query = new RegExp(Ext.escapeRe(q.query));
											q.query.length = length;
										}
									},
									blur : function() {this.getStore().clearFilter();},
								}
							}), {
								xtype : 'displayfield',
								value : 'ถึง',
								width : 16,
								align : 'center'
							}, new Ext.form.ComboBox({
								id : "c_mm2",
								store : store_month,
								valueField : "id",
								displayField : "c_name",
								mode : "local",
								triggerAction : "all",
								emptyText : "กรุณาเลือก...",
								width : 117,
								forceSelection : true,
								selectOnFocus : true,
								typeAhead : false,
								editable : false,
								value : "12",
								listeners : {
									"change" : function( combo, newValue) { if (newValue == "") { combo.reset(); }
									},
									beforequery : function(q) {
										if (q.query) {
											var length = q.query.length;
											q.query = new RegExp(Ext.escapeRe(q.query));
											q.query.length = length;
										}
									},
									blur : function() { this.getStore().clearFilter(); },
								}
							})]
						}, {
							xtype : "radiogroup",
							id : "i_show_acc",
							fieldLabel : "รายการบัญชี",
							columns : [ 90, 90, 100 ],
							items : [ {
								boxLabel : "บัญชีคุม Lv4",
								name : "i_show_acc",
								inputValue : 1,
								checked : true
							}, {
								boxLabel : "บัญชีคุม Lv5",
								name : "i_show_acc",
								inputValue : 3
							}, {
								boxLabel : "บัญชีย่อย",
								name : "i_show_acc",
								inputValue : 2
							} ],
							listeners : {
								change : function(obj, value) {
									if (value.inputValue == 1) {
										Ext.getCmp("s_dc_acc_id").hide();
										Ext.getCmp("s_dc_acc_id_parent").show();
										Ext.getCmp("s_dc_acc_id_parent_lv5").hide();
									} else if (value.inputValue == 3) {
										Ext.getCmp("s_dc_acc_id").hide();
										Ext.getCmp("s_dc_acc_id_parent").hide();
										Ext.getCmp("s_dc_acc_id_parent_lv5").show();
									} else {
										Ext.getCmp("s_dc_acc_id").show();
										Ext.getCmp("s_dc_acc_id_parent").hide();
										Ext.getCmp("s_dc_acc_id_parent_lv5").hide();
									}
								}
							}
						}, new Ext.ux.form.LovCombo({
							id : "s_dc_acc_id_parent",
							fieldLabel : "รายการบัญชีคุม Lv4",
							width : 300,
							mode : "local",
							store : store_acc_s_parent,
							valueField : "id",
							displayField : "c_name",
							triggerAction : "all",
							forceSelection : true,
							selectOnFocus : true,
							typeAhead : false,
							emptyText : "กรุณาเลือก..."
						}), new Ext.ux.form.LovCombo({
							id : "s_dc_acc_id_parent_lv5",
							fieldLabel : "รายการบัญชีคุม Lv5",
							width : 300,
							mode : "local",
							store : store_acc_s_parent_lv5,
							valueField : "id",
							displayField : "c_name",
							triggerAction : "all",
							forceSelection : true,
							selectOnFocus : true,
							typeAhead : false,
							hidden : true,
							emptyText : "กรุณาเลือก..."
						}), new Ext.ux.form.LovCombo({
							id : "s_dc_acc_id",
							fieldLabel : "รายการบัญชีย่อย",
							width : 300,
							mode : "local",
							store : store_acc_s,
							valueField : "id",
							displayField : "c_name",
							triggerAction : "all",
							forceSelection : true,
							selectOnFocus : true,
							typeAhead : false,
							hidden : true,
							emptyText : "กรุณาเลือก..."
						}), {
							xtype : 'compositefield',
							fieldLabel : 'เงื่อนไข BTN',
							anchor : '100%',
							msgTarget : 'under',
							items : [{
								xtype: "checkbox",
								id: "i_btn[0]",
								boxLabel: "ยอดเงินรายการบัญชี",
								inputValue: 1,
								checked: true
							}, { xtype: 'displayfield', value: "|"}, {
								xtype: "checkbox",
								id: "i_btn[1]",
								boxLabel: "หักส่งคืน",
								inputValue: 1,
								checked: true
							}, { xtype: 'displayfield', value: "|"}, {
								xtype: "checkbox",
								id: "i_btn[2]",
								boxLabel: "ปรับปรุง",
								inputValue: 1,
								checked: true
							}, { xtype: 'displayfield', value: "|"}, {
								xtype: "checkbox",
								id: "i_btn[3]",
								boxLabel: "ไม่ระบุ",
								inputValue: 1,
								checked: true
							}]
						}, {
							xtype : 'compositefield',
							fieldLabel : 'เงื่อนไข สมุดรายวัน(manual)',
							anchor : '100%',
							msgTarget : 'under',
							items : [{
								xtype: "checkbox",
								id: "i_gx[0]",
								boxLabel: "ยอดเงินรายการบัญชี",
								inputValue: 1,
								checked: true
							}, { xtype: 'displayfield', value: "|"}, {
								xtype: "checkbox",
								id: "i_gx[1]",
								boxLabel: "หักส่งคืน",
								inputValue: 1,
								checked: true
							}, { xtype: 'displayfield', value: "|"}, {
								xtype: "checkbox",
								id: "i_gx[2]",
								boxLabel: "ปรับปรุง",
								inputValue: 1,
								checked: true
							}, { xtype: 'displayfield', value: "|"}, {
								xtype: "checkbox",
								id: "i_gx[3]",
								boxLabel: "ไม่ระบุ",
								inputValue: 1,
								checked: true
							}]
						}, {
							xtype: "checkbox",
							fieldLabel : '&nbsp',
							id: "i_approve",
							boxLabel: "แสดงคอลัมน์ฎีกา",
							hidden: (PAGE == "GlRep00008")? true : false,
							inputValue: 1,
						}, {
							xtype : "displayfield",
							value : "<font size=2 color=red><b>"+textComment+"</b></font>"
						}]
					}]
			}],
			buttonAlign : "left",
			buttons : [{
				text : Ext.GLOBAL_BU_SHOW_TH + "สำหรับ HTML",
				iconCls : "page_magnify",
				handler : function() {
					LookReport("html");
				} // End Handle
			}, {
				text : Ext.GLOBAL_BU_SHOW_TH + "สำหรับ Excel",
				iconCls : "icon-excel",
				handler : function() {
					LookReport("excel");
				} // End Handle
			}, {
				text : " ปรังปรุงรายการฏีกา",
				iconCls: "icon-save",
				hidden: (PAGE == "GlRep00008")? true : false,
				handler : function() { SaveDetail(); } // End Handle
			}]
		} ]
	}); // panelForm

	/* ====================== CENTER ====================== */
	var center = new Ext.TabPanel({
		region : "center",
		border : false,
		activeTab : 0, // default Tab
		id : "contenterCenter",
		defaults : {
			autoScroll : true
		},
		items : [ panelForm ]
	});

	/* ====================== RENDER ====================== */
	new Ext.Viewport({
		layout : "border",
		items : [ center ]
	});
});