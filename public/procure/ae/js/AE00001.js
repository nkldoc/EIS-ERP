Ext.onReady(function() {
	Ext.QuickTips.init();

	/*===============================================*/
	var title_panel		= "กำหนดค่าแสดงบัญชี";
	/*===============================================*/
	
	store = new Ext.data.JsonStore({
		id: "store",
	    autoDestroy: true,
		autoLoad: true,
		chkMask: false, // status: loading
	    url: "api/List_AE00001.php",
	    baseParams: { type: "dc_acc", i_read: user_right_read }, //Permission i_read
	    root: "data",
	    idProperty: "id",
		totalProperty: "totalCount",
		fields: [
			{ name : "no" },
			{ name : "id" },
			{ name : "c_code" },
			{ name : "c_code_tree" },
			{ name : "c_name" },
			{ name : "i_group" }
		],
//		listeners: {
//			beforeload: function(t, records, options) { this.chkMask = false; initData(); },
//			datachanged: function(t, records, options) { this.chkMask = true; initData(); },
//		}
	});
	
	// pagingBar
	pagingBar = new Ext.PagingToolbar({
		pageSize: 20,
		store: store,
		displayInfo: true,
		displayMsg: "Displaying topics {0} - {1} of {2}"
	});
	
//	// the stores to be checked
//	// loadmask
//	var myComboStores = [ store, store_cost_s, store_cost, store_mon_unit ];
//	
//	function initData() {
//		var loaded = true;
//		Ext.each( myComboStores , function( store ) { if(store.chkMask == false) { loaded = false; } });
//		
//		if(loaded) { Ext.getCmp("contenterCenter").getEl().unmask(); }
//		else { Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading"); }
//	}
	
	//================================ gridMain ================================//
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
		tbar: [{ xtype : "tbfill" }, {
			id: "value-box",
			xtype: "textfield",
			width: 150,
			fieldLabel : "fieldLabel",
			emptyText : 'คำที่ต้องการค้นหา',
		}, "-", {
			id: "filter",
			xtype: "combo",
		    width: 100,
			mode: "local",
		    store: new Ext.data.SimpleStore({
		    	fields: [ "value", "text" ],
				data: [
				       [ "c_code", "รหัสหมวดบัญชี" ],
				       [ "c_name", "ชื่อหมวดบัญชี" ]
				]
			}),
			value: "c_code",
			valueField: "value",
			displayField: "text",
			allowBlank: false,
			editable: false,
			triggerAction: "all",
			typeAhead : false
		}, "-", {
			text : "ค้นหา",
			iconCls: "icon-magnifier",
			handler : function() {
				if(Ext.getCmp("value-box").getValue() != "") {
					store.setBaseParam("value", Ext.getCmp("value-box").getValue());
					store.setBaseParam("filter", Ext.getCmp("filter").getValue());
				} else {
					store.setBaseParam("value", "");
					store.setBaseParam("filter", "");
				}
					
				store.setBaseParam("mode", "SEARCH");
				store.load();
			}
		}],
		columns: [
		    new Ext.grid.RowNumberer({header:"ที่", width: 30,
				renderer: function(value, metaData, record, row, col, store, gridView) {
					return record.get("no");
				}
			}),
			{ header: "รหัสหมวดบัญชี", sortable: true, width: 150, align:"center", dataIndex: "c_code" },
			{ id: "c_name", header: "ชื่อหมวดบัญชี", sortable: true, width: 150, dataIndex: "c_name" },
			{ id: "edit", header: "แก้ไข", sortable: false, align: "center", width:100,
				renderer: function(value, metaData, record, row, col, store, gridView) {
					return "<button style=\"font-size:11px; cursor:pointer;\">แก้ไข</button>";
				}
			}
		],
		autoExpandColumn: "c_name",
		bbar: pagingBar
	}); //gridMain
	
	//============================== cellClick ==============================//
	cellClick	= function( grid, rowIndex, columnIndex, e ) {
		
		var record = grid.getStore().getAt(rowIndex);
		
		if ( columnIndex == grid.getColumnModel().getIndexById("edit") ) {
			PopDtl(record.get("id"), record.data);
		}
	}; //cellClick
	
	//=================================== ประมาณการรายปี ===================================//
	PopDtl	= function( hdr_id, data ) {
		
		// pop บันทึกรายการ
		new Ext.Window({
			title: "บันทึก"+title_panel,
			id: "win-pop-dtl",
			modal: true,
			preventBodyReset: true,
			closable: true,
			autoScroll: true,
//			maximizable: true,
//			maximized: true, // เต็มจอ auto
			height: (Ext.getBody().getViewSize().height * 0.99),
			width: (Ext.getBody().getViewSize().width * 0.99),
			listeners: {
				afterrender: function( component ) {

					$("#Ext_table > tbody").empty(); // ลบข้อมูล acc เก่าออกก่อน
					
					new Ext.form.Checkbox({
						id: "checkAll",
						boxLabel: "",
						inputValue: 1,
						checked: true,
						listeners: {
							check: function ( combo, newValue ) {
								$( "input[id^=dtl_id]" ).each(function( index, val ) { // ROW RUN
									if( Ext.getCmp("checkAll").checked == true ) {
										Ext.getCmp("checkbox["+index+"]").setValue(true);
									} else {
										Ext.getCmp("checkbox["+index+"]").setValue(false);
									}
								});
							}
						},
		            	renderTo: "checkboxAll"
					});

					// ======================== Create Row ======================== //
					Ext.getCmp("win-pop-dtl").getEl().mask("Please wait...", "x-mask-loading");
					$.ajax({
						url: "api/List_AE00001.php",
						type: "POST",
						data: {
							type: "acc_tree",
							i_group: data.i_group
						},
						success: function( result ) {
							Ext.getCmp("win-pop-dtl").getEl().unmask();

							var obj = $.parseJSON( result );

							if( obj.debug == true ) {
								
								$.each(obj.data , function( index, v ) {

									var addBody			= "";
									var nbsp			= "";
									var i_show_name		= "";
									var i_show_level	= "";
									var i_show_exp_type	= "";
									var i_is_fixed		= "";
									
									// GEN TBODY
									for(var i=3;i<=v.i_level;i++) { nbsp += "&nbsp;&nbsp;&nbsp;"; }
									
									i_show_name		= "<input type=\"radio\" id=\"i_show_name["+index+"]\" name=\"i_show_name["+index+"]\" value=\"1\">&nbsp;แสดง&nbsp;&nbsp;"+
														"<input type=\"radio\" id=\"i_show_name["+index+"]\" name=\"i_show_name["+index+"]\" value=\"0\">&nbsp;ไม่แสดง";
													
									i_show_level	= "<input type=\"radio\" id=\"i_show_level["+index+"]\" name=\"i_show_level["+index+"]\" value=\"1\">&nbsp;แสดง&nbsp;&nbsp;"+
														"<input type=\"radio\" id=\"i_show_level["+index+"]\" name=\"i_show_level["+index+"]\" value=\"0\">&nbsp;ไม่แสดง";
									
									if( v.i_level < 6 ) {
										i_show_exp_type	= "<input type=\"radio\" id=\"i_show_exp_type["+index+"]\" name=\"i_show_exp_type["+index+"]\" value=\"2\">&nbsp;แถวเดียวกับชื่อบัญชี&nbsp;&nbsp;"+
															"<input type=\"radio\" id=\"i_show_exp_type["+index+"]\" name=\"i_show_exp_type["+index+"]\" value=\"1\">&nbsp;แถวล่าง&nbsp;&nbsp;"+
															"<input type=\"radio\" id=\"i_show_exp_type["+index+"]\" name=\"i_show_exp_type["+index+"]\" value=\"0\">&nbsp;ไม่ระบุ";
									} else { i_show_exp_type = "-"; }
									
									if( v.i_group == 5 ) {
										i_is_fixed		= "<input type=\"radio\" id=\"i_is_fixed["+index+"]\" name=\"i_is_fixed["+index+"]\" value=\"1\">&nbsp;ไม่เป็นต้นทุน&nbsp;&nbsp;"+
															"<input type=\"radio\" id=\"i_is_fixed["+index+"]\" name=\"i_is_fixed["+index+"]\" value=\"2\">&nbsp;ต้นทุนคงที่&nbsp;&nbsp;"+
															"<input type=\"radio\" id=\"i_is_fixed["+index+"]\" name=\"i_is_fixed["+index+"]\" value=\"3\">&nbsp;ต้นทุนผันแปร";
									} else { i_is_fixed = "-"; }
									
									addBody	+= "<input id=\"dtl_id["+index+"]\" type=\"hidden\" value=\""+v.id+"\">";
									addBody	+= "<td id=\"Ext_checkbox["+index+"]\" align=\"center\"></td>";
									addBody	+= "<td nowrap>"+nbsp+v.c_code+"</td>";
									addBody	+= "<td>"+v.c_name+"</td>";
									addBody	+= "<td align=\"center\" width=\"130\">"+i_show_name+"</td>";
									addBody	+= "<td align=\"center\" width=\"130\">"+i_show_level+"</td>";
									addBody	+= "<td align=\"center\" width=\"260\">"+i_show_exp_type+"</td>";
									addBody	+= "<td align=\"center\" width=\"270\">"+i_is_fixed+"</td>";
									addBody	+= "<td align=\"center\">"+v.i_level+"</td>";

									$("#Ext_table > tbody:last").append("<tr>"+addBody+"</tr>");

									// RENDER
									new Ext.form.Checkbox({
										id: "checkbox["+index+"]",
										boxLabel: "",
										inputValue: 1,
										checked: true,
						            	renderTo: "Ext_checkbox["+index+"]"
									});

									$("input:radio[name=i_show_name\\["+index+"\\]][value="+v.i_show_name+"]").prop("checked", true);
									$("input:radio[name=i_show_level\\["+index+"\\]][value="+v.i_show_level+"]").prop("checked", true);
									if( v.i_level < 6 ) { $("input:radio[name=i_show_exp_type\\["+index+"\\]][value="+v.i_show_exp_type+"]").prop("checked", true); }
									if( v.i_group = 5 ) { $("input:radio[name=i_is_fixed\\["+index+"\\]][value="+v.i_is_fixed+"]").prop("checked", true); }
								});
							}
						}
					});
		        }
			},
			html: "	<div style=\"background:#fff;\">" +
					"<style>" +
						"#Ext_table tbody td, #Ext_table tbody th { border: 1px solid #eee; padding:2px; }" +
						"#Ext_table > tbody > tr:nth-child(even) {background: #FFF}" +
						"#Ext_table > tbody > tr:nth-child(odd) {background: #FCFCFC}" +
					"</style>" +
					"<table id=\"Ext_table\" border=\"0\" cellspacing=\"1\" cellpadding=\"0\" width=\"100%\">" +
						"<thead class=\"x-grid3-header\">" +
							"<tr class=\"x-grid3-hd-row\" height=\"20\">" +
								"<td id=\"checkboxAll\"></td>" +
								"<td nowrap>รหัสบัญชี</td>" +
								"<td nowrap>ชื่อบัญชี</td>" +
								"<td nowrap>กำหนดค่าแสดง<br>ชื่อบัญชี</td>" +
								"<td nowrap>กำหนดค่าแสดง<br>จำนวนเงิน</td>" +
								"<td nowrap>กำหนดค่าตำแหน่ง<br>ที่แสดงจำนวนเงิน<br>(เฉพาะบัญชีคุม)</td>" +
								"<td nowrap>ประเภทต้นทุน</td>" +
								"<td nowrap>ระดับ</td>" +
							"</tr>" +
						"</thead>" +
						// body
						"<tbody style=\"font-size: 13px;\"></tbody>" +
					"</table>" +
					"</div>",
			buttonAlign: "left",
			buttons : [{
				text: Ext.GLOBAL_BU_SAVE_TH,
				iconCls: "icon-save",
				handler: function() {
					
					var jsonArr = [];
					var msg		= "";

					$( "input[id^=dtl_id]" ).each(function( index, val ) { // ROW RUN
						// checked == true
						if( Ext.getCmp("checkbox["+index+"]").getValue() == true ) {
							jsonArr.push({
								dc_acc_id: val.value,
								i_show_name: $( "#i_show_name\\["+index+"\\]:checked" ).val(),
								i_show_level: $( "#i_show_level\\["+index+"\\]:checked" ).val(),
								i_show_exp_type: $( "#i_show_exp_type\\["+index+"\\]:checked" ).val(),
								i_is_fixed: $( "#i_is_fixed\\["+index+"\\]:checked" ).val()
						    });
						}
					});

					if(jsonArr.length <= 0) { msg	+= "ไม่มีรายการที่แก้ไข"; }
					
					if(msg	== "") {
						Ext.getCmp("win-pop-dtl").getEl().mask("Please wait...", "x-mask-loading");
						Ext.Ajax.request({
							url: "api/mn_AE00001.php",
							method: "POST",
							params: {
								mode: "DC_ACC",
								data: JSON.stringify(jsonArr)
							},
							success: function ( result, request ) {
								Ext.getCmp("win-pop-dtl").getEl().unmask();
								var obj = $.parseJSON( result.responseText );
								if(obj.debug == true) { Ext.Msg.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย"); }
							},
							failure: function ( result, request) { 
								Ext.MessageBox.alert("Failed", result.responseText);		// connect
							}
						});
					} else { Ext.MessageBox.alert("แจ้งเตือน", msg); }
				}
			}, {
				text: Ext.GLOBAL_BU_BACK_TH,
				handler: function() { Ext.getCmp("win-pop-dtl").destroy(); }
			}]
		}).show();
	}

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