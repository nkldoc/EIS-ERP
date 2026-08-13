Ext.onReady(function() {
	Ext.QuickTips.init();
	
	/*===============================================*/
	var title_panel		= "รันผังบัญชี ( c_code_tree )";
	/*===============================================*/

    var panelForm	= new Ext.Panel ({
		region: "center",
		title: title_panel,
		border: false,
		stripeRows: true,
		loadMask: true,
        items: [{
			xtype: "form",
			frame: true,
			labelAlign: "right",
			labelWidth: 200,
			bodyStyle: { padding: "10px 20px" },
			defaults: { anchor: "100%", msgTarget: "side", allowBlank: false },
			buttonAlign: "left",
			buttons: [{
				text: "&nbsp;&nbsp;รันผังบัญชี&nbsp;&nbsp;",
				style: "margin-left:15px;",
				iconCls: "database_start",
				handler: function() {
					new Ext.Window({
						id: "win-msg-save",
						title: "แจ้งเตือน",
						modal: true,
						width: 250,
						height: 130,
						html: "<div style='background-color: #fff; font-size: 15px; padding: 2px 1px; height: 200px;'>ท่านต้องการรันผังบัญชีหรือไม่</div>",
						buttons: [{
							text: "ยืนยัน",
							handler: function() {
								
								var msg		= "";
				   				var jsonArr = [];
				   				
				   				for(var i = 0; i<= 100; i++) {
				   					jsonArr.push(i); // 100 รอบ	
				   				}
								
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

									//============= send loop =============//
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
									        	Ext.Msg.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย");
									        }
									    }); 
									}

									function sendCallback(value,callback) {
										
										Ext.Ajax.request({
											url : "api/mn_GenDcAcc.php",
											timeout: 18000,
											method: "POST",
											params : {
												mode: "GEN",
												round: value
											},
											success: function (response) {
												var obj = Ext.decode(response.responseText);
												
												if(obj.success == true) {
													// do callback when ready
												    callback();
												} else {
													Ext.Msg.alert("แจ้งเตือน", "รายการบันทึกผิดพลาด");
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
				} //End Handle
			}]
		}]
	}); // panelForm

	/*====================== CENTER ======================*/
	var center = new Ext.TabPanel({
		region: "center",
		border: false,
		activeTab: 0, //default Tab
		id: "contenterCenter",
		defaults: { autoScroll: true },
		items: [ panelForm ]
	});
	
	/*====================== RENDER ======================*/
	new Ext.Viewport({
		layout: "border",
		items: [ center ]
	});
});
