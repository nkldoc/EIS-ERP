Ext.onReady(function() {
	Ext.QuickTips.init();

	/* =============================================== */
	if(PAGE == "GlRep00014") {
		title_panel = "งบแสดงผลดำเนินงาน (เปรียบเทียบ)";
		i_group		= "4,5";
	} else {
		title_panel = "งบแสดงฐานะการเงิน (เปรียบเทียบ)";
		i_group		= "1,2,3";
	}
	/* =============================================== */

	store_acc_s_parent = new Ext.data.JsonStore({
		autoLoad : true,
		url : "api/All_GlRep00014.php",
		baseParams : { type : "dc_acc_main", show : "all", i_group : i_group },
		root : "data",
		idProperty : "id",
		fields : [ "id", "c_name", "cut_name" ]
	});
	
	store_acc_s_parent_lv5 = new Ext.data.JsonStore({
		autoLoad : true,
		url : "api/All_GlRep00014.php",
		baseParams : { type : "dc_acc_main_lv5", show : "all", i_group : i_group },
		root : "data",
		idProperty : "id",
		fields : [ "id", "c_name", "cut_name" ]
	});

	store_acc_s = new Ext.data.JsonStore({
		autoLoad : true,
		url : "api/All_GlRep00014.php",
		baseParams : { type : "dc_acc", show : "all", i_group : i_group },
		root : "data",
		idProperty : "id",
		fields : [ "id", "c_name", "cut_name" ]
	});
	
	store_status = new Ext.data.JsonStore({
		fields: ['id', 'c_name'],
		data : [
		        { id : "1", c_name : "ยอดแต่ละเดือน" },
		        { id : "2", c_name : "ยอดสะสม" }
		       ]
	});
	
	// storeYear
	var years = [];
    var currentTime = new Date();
    var now = currentTime.getFullYear()+1;
    var yy_en = currentTime.getFullYear()-4;
    while(yy_en <= now) {
    	years.push({ id : yy_en, c_name : yy_en + 543 });
    	yy_en++;
    };
    
	store_year = new Ext.data.JsonStore({
		fields: ["id", "c_name"],
		data : years
	});

	LookReport = function(type) {

		var msg = "";
		
		var dc_acc_lv4_id	= "";
		var dc_acc_lv5_id	= "";
		var dc_acc_lv6_id	= "";
		
		if (Ext.getCmp("i_show_acc").getValue().inputValue == 1) {
			if (Ext.getCmp("dc_acc_lv4_id").getValue() == "") {
				msg += "- กรุณาเลือก บัญชีคุม Lv4 อย่างน้อย 1 รายการ<br>";
			} else {
				dc_acc_lv4_id = Ext.getCmp("dc_acc_lv4_id").getValue();
			}
		} else if (Ext.getCmp("i_show_acc").getValue().inputValue == 3) {
			if (Ext.getCmp("dc_acc_lv5_id").getValue() == "") {
				msg += "- กรุณาเลือก บัญชีคุม Lv5 อย่างน้อย 1 รายการ<br>";
			} else {
				dc_acc_lv5_id = Ext.getCmp("dc_acc_lv5_id").getValue();
			}
		} else {
			if (Ext.getCmp("dc_acc_lv6_id").getValue() == "") {
				msg += "- กรุณาเลือก บัญชีย่อยอย่างน้อย 1 รายการ<br>";
			} else {
				dc_acc_lv6_id = Ext.getCmp("dc_acc_lv6_id").getValue();
			}
		}

		if (msg == "") {

			var href		= "report/Rep_GlRep00014.php";
			var pp			= PAGE;
			var resultUrl	= "";
			
			resultUrl += "&type="+type;
			resultUrl += "&page="+pp;
			resultUrl += "&year="+Ext.getCmp("year").getValue();
			resultUrl += "&i_show_acc=" + Ext.getCmp("i_show_acc").getValue().inputValue;
			resultUrl += "&dc_acc_lv4_id=" + dc_acc_lv4_id;
			resultUrl += "&dc_acc_lv5_id=" + dc_acc_lv5_id;
			resultUrl += "&dc_acc_lv6_id=" + dc_acc_lv6_id;
			if(PAGE == "GlRep00014") { resultUrl += "&i_status="+Ext.getCmp("i_status").getValue(); }

			resultUrl = (resultUrl != "") ? "?" + resultUrl.substring(1) : "";

			window.open(href + resultUrl, href);
			window.focus();

		} else { Ext.MessageBox.alert("แจ้งเตือน", msg); }
	};

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
					items : [new Ext.form.ComboBox({
						id: "year",
						fieldLabel: "ปี",
						width: 300,
						mode: "local",
			            store: store_year,
						valueField: "id",
						displayField: "c_name",
						triggerAction: "all",
						forceSelection: true,
						selectOnFocus: true,
						typeAhead : false,
						emptyText: "กรุณาเลือก...",
						value: new Date().getFullYear(),
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
					}), new Ext.form.ComboBox({
						id: "i_status",
						fieldLabel: "แสดงผลแบบ",
						width: 300,
						mode: "local",
			            store: store_status,
						valueField: "id",
						displayField: "c_name",
						triggerAction: "all",
						forceSelection: true,
						selectOnFocus: true,
						typeAhead : false,
						emptyText: "กรุณาเลือก...",
						value: 1,
						hidden: (PAGE == "GlRep00014")? false : true,
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
					}), {
						xtype: "radiogroup",
						id: "i_show_acc",
						fieldLabel: "รายการบัญชี",
						columns: [ 90, 90, 100 ],
						items: [{
							boxLabel: "บัญชีคุม Lv4",
							name: "i_show_acc",
							inputValue: 1,
							checked: true
						}, {
							boxLabel: "บัญชีคุม Lv5",
							name: "i_show_acc",
							inputValue: 3
						}, {
							boxLabel: "บัญชีย่อย",
							name: "i_show_acc",
							inputValue: 2
						}],
						listeners: {
							change: function(obj, value) {
								if (value.inputValue == 1) {
									Ext.getCmp("dc_acc_lv6_id").hide();
									Ext.getCmp("dc_acc_lv4_id").show();
									Ext.getCmp("dc_acc_lv5_id").hide();
								} else if (value.inputValue == 3) {
									Ext.getCmp("dc_acc_lv6_id").hide();
									Ext.getCmp("dc_acc_lv4_id").hide();
									Ext.getCmp("dc_acc_lv5_id").show();
								} else {
									Ext.getCmp("dc_acc_lv6_id").show();
									Ext.getCmp("dc_acc_lv4_id").hide();
									Ext.getCmp("dc_acc_lv5_id").hide();
								}
							}
						}
					}, new Ext.ux.form.LovCombo({
						id: "dc_acc_lv4_id",
						fieldLabel: "รายการบัญชีคุม Lv4",
						width: 300,
						mode: "local",
						store: store_acc_s_parent,
						valueField: "id",
						displayField: "c_name",
						triggerAction: "all",
						forceSelection: true,
						selectOnFocus: true,
						typeAhead: false,
						emptyText: "กรุณาเลือก..."
					}), new Ext.ux.form.LovCombo({
						id: "dc_acc_lv5_id",
						fieldLabel: "รายการบัญชีคุม Lv5",
						width: 300,
						mode: "local",
						store: store_acc_s_parent_lv5,
						valueField: "id",
						displayField: "c_name",
						triggerAction: "all",
						forceSelection: true,
						selectOnFocus: true,
						typeAhead: false,
						hidden: true,
						emptyText: "กรุณาเลือก..."
					}), new Ext.ux.form.LovCombo({
						id: "dc_acc_lv6_id",
						fieldLabel: "รายการบัญชีย่อย",
						width: 300,
						mode: "local",
						store: store_acc_s,
						valueField: "id",
						displayField: "c_name",
						triggerAction: "all",
						forceSelection: true,
						selectOnFocus: true,
						typeAhead: false,
						hidden: true,
						emptyText: "กรุณาเลือก..."
					})]
				}]
			}],
			buttonAlign : "left",
			buttons : [ {
				text : Ext.GLOBAL_BU_SHOW_TH + "สำหรับ HTML",
				iconCls : "page_magnify",
				handler : function() { LookReport("html"); } // End Handle
			}, {
				text : Ext.GLOBAL_BU_SHOW_TH + "สำหรับ Excel",
				iconCls : "icon-excel",
				handler : function() { LookReport("excel"); } // End Handle
			}]
		}]
	}); // panelForm

	/* ====================== CENTER ====================== */
	var center = new Ext.TabPanel({
		region : "center",
		border : false,
		activeTab : 0, // default Tab
		id : "contenterCenter",
		defaults : { autoScroll : true },
		items : [ panelForm ]
	});

	/* ====================== RENDER ====================== */
	new Ext.Viewport({
		layout : "border",
		items : [ center ]
	});
});
