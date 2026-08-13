Ext
		.onReady(function() {
			Ext.QuickTips.init();

			/* =============================================== */
			var title_panel = "รายงานการเคลื่อนไหวบัญชีแยกประเภท";
			/* =============================================== */
			 // สถานะการผ่านบัญชี
			var i_is_post = new Ext.data.JsonStore({
				fields: ['id', 'c_name'],
				data : [
						{ id : '1', c_name : 'ทั้งหมด (GX/GL)' },
						{ id : '2', c_name : 'ยังไม่ผ่านรายการ (GX)' },
						{ id : '3', c_name : 'ผ่านรายการแล้ว(GL)' }
					   ]
			});
			
			store_acc_s = new Ext.data.JsonStore({
				autoLoad : true,
				url : "api/ALL_GlReportDocs.php",
				baseParams : {
					type : "dc_acc",
					show : "all"
				},
				root : "data",
				idProperty : "id",
				fields : [ "id", "c_name", "cut_name" ]
			});

			store_acc_s_parent = new Ext.data.JsonStore({
				autoLoad : true,
				url : "api/ALL_GlReportDocs.php",
				baseParams : {
					type : "dc_acc_main",
					show : "all"
				},
				root : "data",
				idProperty : "id",
				fields : [ "id", "c_name", "cut_name" ]
			});

			store_cost_s = new Ext.data.JsonStore({
				autoLoad : true,
				url : "api/ALL_GlReportDocs.php",
				baseParams : {
					type : "dc_cost",
					show : "all"
				},
				root : "data",
				idProperty : "id",
				fields : [ "id", "c_name", "cut_name" ]
			});

			store_dc_user_s = new Ext.data.JsonStore({
				autoLoad : true,
				url : "api/ALL_GlReportDocs.php",
				baseParams : {
					type : "dc_user",
					show : "all"
				},
				root : "data",
				idProperty : "id",
				fields : [ "id", "c_name" ]
			});

			store_month = new Ext.data.JsonStore({
				fields : [ "id", "c_name" ],
				data : [ { id : "01", c_name : "มกราคม" },
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
			var now = currentTime.getFullYear() + 1;
			var yy_en = currentTime.getFullYear() - 7;
			while (yy_en <= now) {
				years.push({
					id : yy_en,
					c_name : yy_en + 543
				});
				yy_en++;
			}
			;

			store_year = new Ext.data.JsonStore({
				fields : [ "id", "c_name" ],
				data : years
			});

			LookReport = function(type) {

				var msg = "";

				var dc_acc_id_parent = "";
				var dc_acc_id = "";
				var i_group1 = 1; // หมวด 1-4
				var i_group2 = 1; // หมวด 5

				if (Ext.getCmp("i_show_acc").getValue().inputValue == 1) {
					if (Ext.getCmp("s_dc_acc_id_parent").getValue() == "") { msg += "- กรุณาเลือกรหัสบัญชีคุม<br>"; }
					else { dc_acc_id_parent = Ext.getCmp("s_dc_acc_id_parent").getValue(); }
				} else if (Ext.getCmp("i_show_acc").getValue().inputValue == 2) {
					if (Ext.getCmp("s_dc_acc_id").getValue() == "") { msg += "- กรุณาเลือกรหัสบัญชีย่อย<br>"; }
					else { dc_acc_id = Ext.getCmp("s_dc_acc_id").getValue(); }
				}

				if (Ext.getCmp("s_dc_cost_id").getValue() == "") { msg += "- กรุณาเลือกศูนย์ต้นทุน<br>"; }
				if (Ext.getCmp("s_dc_user_id").getValue() == "") { msg += "- กรุณาเลือกผู้สร้างรายการ<br>"; }
				
				if(Ext.getCmp("i_show_year").getValue().inputValue == 1) {
					i_group1	= Ext.getCmp("i_group1").getValue().inputValue;
					i_group2	= Ext.getCmp("i_group2").getValue().inputValue;
				}

				if (msg == "") {

					var href = "report/Rep_GlReportDocs.php";
					var resultUrl = "";

					var i_show 			= (Ext.getCmp("i_is_nontax_exp").getValue().inputValue == 1) ? 2 : 1;
					var year_start_gl 	= Ext.START_YEAR_ACC;

					resultUrl += "&type=" + type;
					resultUrl += "&i_show_year=" + Ext.getCmp("i_show_year").getValue().inputValue;
					resultUrl += "&i_group1=" + i_group1;
					resultUrl += "&i_group2=" + i_group2;
					resultUrl += "&date_start=" + Ext.util.Format.date(Ext.getCmp('date_start').getValue(), 'Y-m-d');
					resultUrl += "&date_end=" + Ext.util.Format.date(Ext.getCmp('date_end').getValue(), 'Y-m-d');
					resultUrl += "&dc_acc_id_parent=" + dc_acc_id_parent;
					resultUrl += "&dc_acc_id=" + dc_acc_id;
					resultUrl += "&i_is_post=" + Ext.getCmp("i_is_post").getValue();
					resultUrl += "&dc_cost_id=" + Ext.getCmp("s_dc_cost_id").getValue();
					resultUrl += "&dc_user_id=" + Ext.getCmp("s_dc_user_id").getValue();
					resultUrl += "&i_show=" + i_show;
					resultUrl += "&i_show_acc=" + Ext.getCmp("i_show_acc").getValue().inputValue;
					resultUrl += "&i_is_nontax_exp=" + Ext.getCmp("i_is_nontax_exp").getValue().inputValue;
					resultUrl += "&i_show_reports=" + Ext.getCmp("i_show_reports").getValue().inputValue;
					resultUrl += "&year_start_gl=" + year_start_gl;
					resultUrl += "&i_close_year=" + Ext.getCmp("i_close_year").getValue().inputValue;
					

					resultUrl = (resultUrl != "") ? "?" + resultUrl.substring(1) : "";
					
					window.open(href + resultUrl, href);
					window.focus();

				} else {
					Ext.MessageBox.alert("แจ้งเตือน", msg);
				}
			}

			var panelForm = new Ext.Panel({
				region : "center",
				title : title_panel,
				border : false,
				stripeRows : true,
				loadMask : true,
				items : [ {
					xtype : "form",
					frame : true,
					labelAlign : "right",
					labelWidth : 200,
					bodyStyle : {
						padding : "10px 20px"
					},
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
							items : [{
								xtype : 'compositefield',
								fieldLabel : 'วันที่บันทึกบัญชีระหว่างวันที่',
								anchor : '100%',
								msgTarget : 'under',
								items : [{
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
								id : "i_show_acc",
								fieldLabel : "รายการบัญชี",
								columns : [ 70, 75, 150 ],
								items : [{
									boxLabel : "บัญชีคุม",
									name : "i_show_acc",
									inputValue : 1,
									checked : true
								}, {
									boxLabel : "บัญชีย่อย",
									name : "i_show_acc",
									inputValue : 2
								}],
								listeners : {
									change : function(obj, value) {
										if (value.inputValue == 1) {
											Ext.getCmp("s_dc_acc_id").hide();
											Ext.getCmp("s_dc_acc_id_parent").show();
										} else if (value.inputValue == 2) {
											Ext.getCmp("s_dc_acc_id").show();
											Ext.getCmp("s_dc_acc_id_parent").hide();
										} else {
											Ext.getCmp("s_dc_acc_id").hide();
											Ext.getCmp("s_dc_acc_id_parent").hide();
										}
									}
								}
							},
							new Ext.ux.form.LovCombo({
								id : "s_dc_acc_id_parent",
								fieldLabel : "รายการบัญชีคุม",
								width : 500,
								mode : "local",
								store : store_acc_s_parent,
								valueField : "id",
								displayField : "c_name",
								triggerAction : "all",
								forceSelection : true,
								selectOnFocus : true,
								typeAhead : false,
								emptyText : "กรุณาเลือก..."
							}),
							new Ext.ux.form.LovCombo({
								id : "s_dc_acc_id",
								fieldLabel : "รายการบัญชีย่อย",
								width : 500,
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
							}),
							new Ext.ux.form.LovCombo({
								id : "s_dc_cost_id",
								fieldLabel : "หน่วยงาน",
								width : 500,
								mode : "local",
								store : store_cost_s,
								valueField : "id",
								displayField : "c_name",
								triggerAction : "all",
								forceSelection : true,
								selectOnFocus : true,
								typeAhead : false,
								emptyText : "กรุณาเลือก..."
							}),
							new Ext.ux.form.LovCombo({
								id : "s_dc_user_id",
								fieldLabel : "ผู้สร้างรายการ",
								width : 500,
								mode : "local",
								store : store_dc_user_s,
								valueField : "id",
								displayField : "c_name",
								triggerAction : "all",
								forceSelection : true,
								selectOnFocus : true,
								typeAhead : false,
								emptyText : "กรุณาเลือก..."
							}),
							new Ext.form.ComboBox({
								id: 'i_is_post',
								fieldLabel: 'สถานะการผ่านรายการบัญชี',
								store: i_is_post,
								valueField: 'id',
								displayField: 'c_name',
								value: '1',
								width: 300,
								typeAhead: true,
								mode: 'local',
								triggerAction: 'all',
								emptyText: 'กรุณาเลือก...',
								forceSelection: true,
								selectOnFocus: true,
								listeners: {
									'change': function (combo, newValue) {
										if (newValue == '')
											combo.reset();
									}
								}
							}), {
								xtype : "radiogroup",
								id : "i_close_year",
								fieldLabel : "ประเภทรายการ",
								columns : [ 100, 150, 170 ],
								items : [{
									boxLabel : "รายการระหว่างปี",
									name : "i_close_year",
									inputValue : 2,
									checked : true
								}, {
									boxLabel : "รายการปิดบัญชีประจำปี",
									name : "i_close_year",
									inputValue : 1
								}, {
									boxLabel : "ทั้งหมด",
									name : "i_close_year",
									inputValue : 3
								}]
							}, {
								xtype : "radiogroup",
								id : "i_is_nontax_exp",
								fieldLabel : "คอลัมน์รายการบวกกลับ",
								columns : [ 70, 110, 170 ],
								items : [{
									boxLabel : "ไม่แสดง",
									name : "i_is_nontax_exp",
									inputValue : 1,
									checked : true
								}, {
									boxLabel : "แสดงทุกรายการ",
									name : "i_is_nontax_exp",
									inputValue : 2
								}, {
									boxLabel : "แสดงเฉพาะรายการบวกกลับ",
									name : "i_is_nontax_exp",
									inputValue : 3
								}]
							}, {
								xtype : "radiogroup",
								fieldLabel : "ประเภทการแสดงข้อมูล",
								id : "i_show_reports",
								columns : [ 150, 240, 190, 170 ],
								items : [{
									boxLabel : "แสดงรายละเอียดทั้งหมด",
									name : "i_show_reports",
									inputValue : 1,
									checked : true
								}, {
									boxLabel : "แสดงเฉพาะรายละเอียดที่มียอดระหว่างงวด",
									name : "i_show_reports",
									inputValue : 4
								}, {
									boxLabel : "สรุปเฉพาะรายการที่มียอดคงเหลือ",
									name : "i_show_reports",
									inputValue : 2
								}, {
									boxLabel : "สรุปทุกรายการ",
									name : "i_show_reports",
									inputValue : 3
								}]
							}, {
								xtype : "radiogroup",
								id : "i_show_year",
								fieldLabel : "คอลัมน์ ปีงบประมาณ/แหล่งเงิน",
								columns : [ 65, 100 ],
								items : [{
									boxLabel : "ไม่แสดง",
									name : "i_show_year",
									inputValue : 2,
									checked : true
								}, {
									boxLabel : "แสดง",
									name : "i_show_year",
									inputValue : 1
								}],
								listeners : {
									change : function(obj, value) {
										if (value.inputValue == 1) {
											Ext.getCmp("i_group1").show();
											Ext.getCmp("i_group2").show();
										} else {
											Ext.getCmp("i_group1").hide();
											Ext.getCmp("i_group2").hide();
										}
									}
								}
							}, {
								xtype : "radiogroup",
								id : "i_group1",
								fieldLabel : "หมวด 1 - 4",
								hidden: true,
								columns : [ 65, 127, 75, 120 ],
								items : [{
									boxLabel : "ทั้งหมด",
									name : "i_group1",
									inputValue : 1,
									checked : true
								}, {
									boxLabel : "บันทึกข้อมูลครบถ้วน",
									name : "i_group1",
									inputValue : 2
								}, {
									boxLabel : "ไม่มีข้อมูล",
									name : "i_group1",
									inputValue : 3
								}, {
									boxLabel : "บันทึกข้อมูลบางส่วน",
									name : "i_group1",
									inputValue : 4
								}],
							}, {
								xtype : "radiogroup",
								id : "i_group2",
								fieldLabel : "หมวด 5",
								hidden: true,
								columns : [ 65, 127, 75, 120 ],
								items : [{
									boxLabel : "ทั้งหมด",
									name : "i_group2",
									inputValue : 1,
									checked : true
								}, {
									boxLabel : "บันทึกข้อมูลครบถ้วน",
									name : "i_group2",
									inputValue : 2
								}, {
									boxLabel : "ไม่มีข้อมูล",
									name : "i_group2",
									inputValue : 3
								}, {
									boxLabel : "บันทึกข้อมูลบางส่วน",
									name : "i_group2",
									inputValue : 4
								}],
							}]
						}]
					}],
					buttonAlign : "left",
					buttons : [ {
						style : "margin-left:15px;",
						text : Ext.GLOBAL_BU_SHOW_TH + "สำหรับ HTML",
						iconCls : "page_magnify",
						handler : function() {
							LookReport("html");
						} // End Handle
					}, {
						style : "margin-left:15px;",
						text : Ext.GLOBAL_BU_SHOW_TH + "สำหรับ Excel",
						iconCls : "icon-excel",
						handler : function() {
							LookReport("excel");
						} // End Handle
					}]
				}]
			});

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
