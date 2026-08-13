Ext.onReady(function() {
	Ext.QuickTips.init();

	/* =============================================== */
	var title_panel = "รายงาน รายละเอียดเงินฝากธนาคาร (บัญชีย่อยฯ ทั้งหมด)"; 
	/* =============================================== */

	dc_bank = new Ext.data.JsonStore({
		autoDestroy : false,
		autoLoad : true,
		url : "api/All_GlRep00019.php",
		baseParams : { type : "dc_bank", all : "all" },
		root : "data",
		idProperty : "id",
		fields : [ "id", "c_name" ]
	});
	
	dc_bank_acc_company	= new Ext.data.JsonStore({
		autoDestroy : false,
		autoLoad : false,
		url : "api/All_GlRep00019.php",
		baseParams : { type : "dc_bank_acc_company", all : "all" },
		root : "data",
		idProperty : "id",
		fields : [ "id", "c_name" ]
	});

	var store_month = new Ext.data.JsonStore({
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
    var now = currentTime.getFullYear()+5;
    var yy_en = currentTime.getFullYear()-5;
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

		if (Ext.getCmp("dc_bank_id").getValue() == "") { msg += "- กรุณาเลือก ธนาคาร<br>"; }
		if (Ext.getCmp("dc_bank_acc_company_id").getValue() == "") { msg += "- กรุณาเลือก เลขที่บัญชี<br>"; } 
		if (Ext.getCmp("date_start").getValue() == "" && Ext.getCmp("date_end").getValue() == "") {
			msg += "- กรุณาเลือก ช่วงวันที่<br>";
		}		
		
		if (msg == "") {

			var href = "report/Rep_GlRep00019.php";
			var resultUrl = "";

			resultUrl 	+= "&type=" + type;
			resultUrl 	+= "&dc_bank_id="+ Ext.getCmp("dc_bank_id").getValue();
			resultUrl 	+= "&dc_bank_acc_company_id="+ Ext.getCmp("dc_bank_acc_company_id").getValue(); 
			resultUrl	+= "&gl_book_type_id="+Ext.getCmp("gl_book_type_id").getValue().inputValue;
	    	resultUrl	+= "&date_start="+Ext.util.Format.date(Ext.getCmp("date_start").getValue(), "Y-m-d");
	    	resultUrl	+= "&date_end="+Ext.util.Format.date(Ext.getCmp("date_end").getValue(), "Y-m-d");				
 
			resultUrl = (resultUrl != "") ? "?" + resultUrl.substring(1) : "";

			window.open(href + resultUrl, href);
			window.focus();

		} else { Ext.MessageBox.alert("แจ้งเตือน", msg); }
	}; // LookReport

	var panelForm = new Ext.Panel({
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
			items : [{
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
				items: [{
					title : "เมนู " + title_panel,
					RemoveCls : "x-box-item",
					defaults : {
						labelStyle : "width:200px;",
						allowBlank : true
					},
					items: [new Ext.ux.form.LovCombo({
						id : "dc_bank_id",
						fieldLabel : "ธนาคาร",
						width : 500,
						mode : "local",
						store : dc_bank,
						valueField : "id",
						displayField : "c_name",
						triggerAction : "all",
						forceSelection : true,
						selectOnFocus : true,
						typeAhead : false,
						emptyText : "กรุณาเลือก...",
						listeners : {
							"change": function (combo, newValue) {
								Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
								dc_bank_acc_company.load({
								    params : { dc_bank_id: newValue },
								    callback : function() {
								    	Ext.getCmp("contenterCenter").getEl().unmask();
								    	Ext.getCmp("dc_bank_acc_company_id").clearValue();
								    }
								});
							},
						}
					}), new Ext.ux.form.LovCombo({
						id : "dc_bank_acc_company_id",
						fieldLabel : "เลขที่บัญชี",
						width : 500,
						mode : "local",
						store : dc_bank_acc_company,
						valueField : "id",
						displayField : "c_name",
						triggerAction : "all",
						forceSelection : true,
						selectOnFocus : true,
						typeAhead : false,
						emptyText : "กรุณาเลือก..."
					}) 
					, {
						xtype: "compositefield",
						fieldLabel: "วันที่บันทึกบัญชี",
						anchor: "100%",
						msgTarget: "under",
						items: [{
							xtype: "datefield",
							id: "date_start",
							width: 127,
							listeners : {
								afterrender : function() {
									var date = new Date();
										date = new Date(date.getFullYear()+543, date.getMonth(), 1);
									this.setValue(date);
								}
							}
						},{
							xtype: "displayfield", value: "ถึงวันที่", width: 36, align:"center"
						},{
							xtype: "datefield",
							id: "date_end",
							width: 127,
							value: addY(543)
						}]
	                }, {
						xtype: "radiogroup",
						id: "gl_book_type_id",
						fieldLabel: "ประเภทรายการ",
						columns: [ 70, 100, 100, 100],
						vertical: true,
						items: [
							{ boxLabel: "ทั้งหมด", name: "gl_book_type_id", inputValue: 4, checked: true },
							{ boxLabel: "สมุดรายวันรับ", name: "gl_book_type_id", inputValue: 1},
							{ boxLabel: "สมุดรายวันจ่าย", name: "gl_book_type_id", inputValue: 2 },
							{ boxLabel: "สมุดรายวันทั่วไป", name: "gl_book_type_id", inputValue: 3 }
						]
					}
					
					
					
					
					]
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
