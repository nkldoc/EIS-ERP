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

	/* =============================================== */
	title_panel		= "บันทึก Group ใบเบิกรายวัน";	
	/* =============================================== */
	
	Ext.store = new Ext.data.JsonStore({
		autoLoad: false,
		url: "api/List_ImpRequestVSNJV2.php",
		baseParams: { type: "imp_request_vsn_hdr_dtl_for_jv", i_read: user_right_read }, // Permission i_read
	    root: "data",
	    idProperty: "id",
		totalProperty: "totalCount",
		fields: [
			{ name: "no" },
			{ name: "id" },
			{ name: "d_doc_date" },
			{ name: "c_period_no" },
			{ name: "c_code" },
			{ name: "c_request" }, 
			{ name: "c_request_desc" },
			{ name: "c_creditor" }, 
			{ name: "c_comment" },
			{ name: "f_inv" },
			{ name: "d_doc_dtl" },
			{ name: "imp_group_request_vsn_dtl_id" }, 
			{ name: "n_temp" },
			{ name: "i_status" },
			{ name: "c_status_dtl" }, 
			{ name: "i_group_show" }, 
			{ name: "c_group_show" }, 
			{ name: "c_gx_gl_code" }, 
			{ name: "i_is_post" }, 
			{ name: "c_budget_type_name"}
		]
	});
 

	const deleteTempGroup = function (id, mode, html = "ท่านต้องการที่จะยกเลิกการจัดกลุ่ม ?") {
		new Ext.Window({
		  id: "win-msg-delete",
		  title: "แจ้งเตือน",
		  modal: true,
		  width: 250,
		  height: 130,
		  html: html,
		  buttons: [
			{
			  text: "Confirm",
			  handler: function () {
				Ext.getCmp("win-msg-delete").getEl().mask("Please wait...", "x-mask-loading");
				Ext.Ajax.request({
				  url: "api/mn_ImpRequestVSNJV2.php",
				  method: "POST",
				  params: {
					mode: mode,
					id: id,
				  },
				  success: function (result, request) {
					var jsonData = Ext.util.JSON.decode(result.responseText); // decode json
					if (jsonData.success == true) { 
					} else {
					  Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
					}
					Ext.getCmp("win-msg-delete").hide(); // hidden window-panel
					Ext.getCmp("win-msg-delete").destroy(); // clear memory :: garbage collection
					Ext.store.reload();
					Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not errer
					Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
				  },
				  failure: function (result, request) {
					Ext.MessageBox.alert("Failed", result.responseText); // connect error
				  },
				});
			  },
			},
			{
			  text: Ext.GLOBAL_BU_BACK_TH,
			  handler: function () {
				Ext.getCmp("win-msg-delete").hide();
				Ext.getCmp("win-msg-delete").destroy();
			  },
			},
		  ],
		}).show();
	  };

	  
  // ================================ gridMain ================================ //
  cellClick = function (grid, rowIndex, columnIndex, e) {
  
    let record = grid.getStore().getAt(rowIndex);
	
	if (columnIndex == grid.getColumnModel().getIndexById("delete")) {
	
      if (record.get("i_group_show")==1) { 
            deleteTempGroup(record.get("id"), "DELETE_GROUP"); 
      }  
    }  
  }; //cellClick	  

	// gridMain
	gridMain = new Ext.grid.GridPanel({
		region: "center",
		layout: "fit",
		title: title_panel,
		id: "tabpanel1",
		border: false,
		stripeRows: true,
		loadMask: true,
		store: Ext.store,
		viewConfig : {
			emptyText: "ไม่มีข้อมูล..",
			deferEmptyText: false
		},
		tbar: [{ // กล่องค้นหาข้อมูล 1
			xtype: "buttongroup",
			title: "ระบุเงื่อนไขในการค้นหาข้อมูล<br><font color=red>*เป็นใบเบิกสถานะ ส่งเบิกสมบูรณ์/บันทึกบัญชีสมบูรณ์และลงบัญชี เท่านั้น</font>",
			columns: 1,
	        defaults: { scale: "small", style: "float: right" },
	        items: [{ // แถวที่ 1
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
							[ "c_code", "เลขที่นำเข้า" ],   						
							[ "c_period_no", "เอกสารอ้างอิง" ],
							[ "c_comment", "รายการ" ],
							[ "c_request_desc", "เลขที่ใบเบิก" ],
							[ "c_request", "เลขที่ตั้งหนี้" ],  
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
	        		width: 300,
	       			fieldLabel: "fieldLabel",
	       			emptyText: "คำที่ต้องการค้นหา"
	       		}]
	        }, {
	        	xtype: "buttongroup",
	        	frame: false,
	        	items: [
					 
						{ xtype: "label", text: "วันที่ตั้งหนี้ : " }, { xtype: "tbspacer", width: 4 }, 
						{
						id: "s_d_save_date1", xtype: "datefield", width: 122, 
						listeners : {
							afterrender : function() {
								var date = new Date();
									date = new Date(date.getFullYear()+543, date.getMonth(), 1);
								this.setValue(date);
							}
						}
					}
					, { xtype: "tbspacer", width: 5 }, { xtype: "label", text: "ถึงวันที่ : " }, { xtype: "tbspacer", width: 4 }, {
						id: "s_d_save_date2", xtype: "datefield", width: 122, 
						listeners : {
							afterrender : function() {
								this.setValue(addY(543));
							}
						}
					}
 
					 
				]
			   } 
			],
	        buttonAlign: "left",
			buttons:[{
				text : "&nbsp;&nbsp;บันทึก Group ใบเบิกตามวันที่ตั้งหนี้&nbsp;&nbsp;",
				iconCls: "icon-save",
				handler : function() {
					new Ext.Window({
						id: "win-msg-save",
						title: "แจ้งเตือน",
						modal: true,
						width: 250,
						height: 130,
						html: "<div style='background-color: #fff; font-size: 13px; padding: 2px 1px; height: 200px;'>ท่านต้องการบันทึกผ่านรายการบัญชีหรือไม่</div>",
						buttons: [{
							text: "ยืนยัน",
							handler: function() {
								
								var msg		= "";
				   				var check	= false;
								   var jsonArr = [];
								   var d1	= Ext.util.Format.date(Ext.getCmp('s_d_save_date1').getValue(), 'Y-m-d');
								   var d2	= Ext.util.Format.date(Ext.getCmp('s_d_save_date2').getValue(), 'Y-m-d');
 
				   				$( "input[id^=chk]" ).each(function( i, val ) {
				   					if(val.checked == true) {
				   						check	= true;
				   						jsonArr.push(val.value);
				   					}
								});
								 
								   
								if( check == false ) { msg += "- กรุณาเลือก รายการ อย่างน้อย 1 รายการ<br>"; }
								if (d1!=d2)  { msg += "- กรุณาเลือก วันที่ตั้งหนี้ เป็นวันเดียวกัน<br>"; }

								if( msg == "" ) {

									Ext.getCmp("win-msg-save").getEl().mask("Please wait...", "x-mask-loading");

									var progressbar = Ext.MessageBox.show({
								        title: "Please wait",
								        msg: "<div style='font-weight: bold; color: red; font-size: 20px; text-align: center;'>ห้ามปิดหน้าจอขณะประมวลผลรายการ!!</div>",
								        progressText: "Initializing...",
								        width: 500,
								        progress: true,
								        closable: false
								    });

									//============= send loop v1 ok -ส่งไปทีละ imp_request_vsn_dtl_id =============//
									var x = 0;
									var loopArray = function(arr) {
										sendCallback(arr[x],function(){
									        x++;

									        var cs			= parseInt((x/jsonArr.length)*100);
									        progressbar.updateProgress(x/jsonArr.length,'status: '+(cs)+ '%...');
									        
									        // any more items in array? continue loop
									        if(x < arr.length) {
									        	loopArray(arr);
									        } else {
									        	progressbar.hide();
									        	Ext.getCmp("win-msg-save").getEl().unmask();
												Ext.getCmp("win-msg-save").destroy();
												Ext.Msg.minWidth = 200;
									        	Ext.Msg.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย");
												Ext.store.load({
										            callback : function (records, operation, success) {
										            	if (success) {
										            		$('#checkAll').prop('checked', true);
										            		checkAll(true);
										            	}
										            }
												});
									        }
									    }); 
									}
									

									function sendCallback(value,callback) {
										
										Ext.Ajax.request({
											url : "api/mn_ImpRequestVSNJV2.php",
											timeout: 18000,
											method: "POST",
											params : {
												mode: "SAVE",
												id: value
											},
											success: function (response) {
												var obj = Ext.decode(response.responseText);
												
												if(obj.success == true) {
													// do callback when ready
												    callback();
												} else { 
													Ext.MessageBox.show({title:"แจ้งเตือน", msg:obj.msg,width:300,buttons:Ext.MessageBox.OK});
													console.log("gl_tran_hdr_id = "+value);
													Ext.getCmp("win-msg-save").getEl().unmask();
													Ext.getCmp("win-msg-save").destroy();
												}
											}
										});
									}
									
									loopArray(jsonArr);
									//=====================================//
									
								} else {
									Ext.Msg.alert("แจ้งเตือน", msg);
									Ext.getCmp("win-msg-save").hide();
									Ext.getCmp("win-msg-save").destroy();
								}
							}
						}, {
							text : Ext.GLOBAL_BU_BACK_TH,
							handler : function() {
								Ext.getCmp("win-msg-save").hide();
								Ext.getCmp("win-msg-save").destroy();
							}
						}]
					}).show();
				}
			}, { xtype: "tbfill" }, {
				text : "ค้นหา",
				iconCls: "icon-magnifier",
				handler : function() {
					
					var msg	= "";
					
					if(msg == "") {
						if(Ext.getCmp("value-box").getValue() != "") {
							Ext.store.setBaseParam("value", Ext.getCmp("value-box").getValue());
							Ext.store.setBaseParam("filter", Ext.getCmp("filter").getValue());
						} else {
							Ext.store.setBaseParam("value", "");
							Ext.store.setBaseParam("filter", "");
						}
						
						Ext.store.setBaseParam("mode", "SEARCH");
						Ext.store.setBaseParam("d_save_date1", Ext.util.Format.date(Ext.getCmp("s_d_save_date1").getValue(), "Y-m-d"));
						Ext.store.setBaseParam("d_save_date2", Ext.util.Format.date(Ext.getCmp("s_d_save_date2").getValue(), "Y-m-d"));
 						Ext.store.load({
				            callback : function (records, operation, success) {
				            	if (success) {
				            		$('#checkAll').prop('checked', true);
				            		checkAll(true);
				            	}
				            }
						});						
					} else { Ext.Msg.alert("แจ้งเตือน", msg); }
				}
			}]
		}],
		columns: [
		    new Ext.grid.RowNumberer({header:"ที่", width: 30,
				renderer: function(value, metaData, record, row, col, store, gridView) {
					return record.get("no");
				}
			})
			, {
				header: "<div class='topAlign'><input id='checkAll' type='checkbox' onclick='checkAll(this.checked)'></div>",
				sortable: false, align: "center", width:50, dataIndex: "id",
				renderer: function(value, metaData, record, row, col, store, gridView) {
				 
					if ((record.get("i_is_post")=="3") || (record.get("i_group_show")>0))
					{
						return "";
					}
					else
					{
						Ext.objChk[value] = "chk["+value+"]";
						return "<input type='checkbox' id='chk["+value+"]' value="+value+" "+((record.get("i_chk"))?'checked':'')+">";
					}
				}
			},
			{ header: "เลขที่นำเข้าใบเบิก", sortable: false, align: "center", width:100, dataIndex: "c_code" },  
			{ header: "แหล่งเงิน", sortable: false, align: "center", width:300, dataIndex: "c_budget_type_name",
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					metaData.attr = "style='text-align: left;'";
					return value;
				} 		
			},
			{ header: "ชื่อผู้รับเงิน", sortable: false, align: "center", width:200, dataIndex: "c_creditor",
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					metaData.attr = "style='text-align: left;'";
					return value;
				} 		
			},
			{ header: "วันที่นำเข้าใบเบิก ", sortable: true, align: "center", dataIndex: "d_doc_date",
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					return (value != "")? shortThaiDate(value) : "";
				}
			}, 
			{ header: "เอกสารอ้างอิง", sortable: false, align: "center", width:100, dataIndex: "c_period_no" }, 
			{ header: "เลขที่ใบเบิก ", sortable: false, align: "center", width:100, dataIndex: "c_request_desc" }, 
			{ header: "เลขที่ตั้งหนี้ ", sortable: false, align: "center", width:100, dataIndex: "c_request" },
			{ header: "วันที่ตั้งหนี้", sortable: true, align: "center", dataIndex: "d_doc_dtl",
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					return (value != "")? shortThaiDate(value) : "";
				}
			},
			{ id: "c_comment", header: "รายการ", sortable: false, dataIndex: "c_comment" },
			{ header: "สถานะใบเบิก", sortable: false, align: "center", width:100, dataIndex: "c_status_dtl" }, 
			{ header: "จำนวนเงิน", sortable: false, align: "right", width:100, dataIndex: "f_inv",
				renderer: function(value, metaData, record, row, col, store, gridView) {
					return floatRenderer(floatMinus(value, 2));
				}
			},			
			{ header: "จัดกลุ่มรายวัน", sortable: false, align: "center", width:250, dataIndex: "c_group_show" }, 
			{ header: "เลขที่บันทึกบัญชี", sortable: false, align: "center", width:100, dataIndex: "c_gx_gl_code" }
			,{
				id: "delete",
				header: "-",
				sortable: false,
				align: "center",
				width: 100,
				dataIndex: "id",
				renderer: function (value, metaData, record, row, col, store, gridView) {
					if (record.get("i_group_show")=='1')
					{	return "<button style='font-size:11px; cursor:pointer; color: red;'>ยกเลิก</button>"; }
					
				}
			} 
		],
		autoExpandColumn: "c_comment"
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
