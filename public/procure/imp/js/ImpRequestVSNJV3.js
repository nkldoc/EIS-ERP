Ext.onReady(function() {
	Ext.QuickTips.init();
	
	/*===============================================*/
	var title_panel		= "บันทึกบัญชีตั้งหนี้";
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
			items: [{
				xtype: "container",
				layout: "hbox",
				align: "stretch",
				RemoveHeight: true,
				defaults: { xtype: "fieldset", flex:1, margins : "0px 3px", autoHeight: true },
				items: [{
					title: "เมนู "+title_panel,
					RemoveCls: "x-box-item",
					defaults: { labelStyle : "width:200px;", allowBlank: true },
					items: [ 
						{
							xtype: 'compositefield',
							fieldLabel: 'วันที่ตั้งหนี้',
							anchor: '100%',
							msgTarget: 'under',
							items: [{
								xtype: 'datefield',
								id: 'd_doc_date',
								value: addY(543)
							} ]
						}
					]
				}]
			}],
			buttonAlign: "left",
			buttons: [{
				text: "ประมวลผลบัญชีตั้งหนี้ (Vision Net)",
				style: "margin-left:15px;",
				iconCls: "database_start",
				handler: function() {
					
					var msg		= "";
					
					if( msg == "" ) {
						
						var getProgressBoo	= true;
						var runner			= new Ext.util.TaskRunner();
						var step			= 0; 
						var ddate 			= Ext.getCmp("d_doc_date").getValue();
	 					
						var progressbar = Ext.MessageBox.show({
					        title: "Please wait",
					        msg: "กำลังประมวลผลบัญชีตั้งหนี้ (Vision Net)	",
					        progressText: "Initializing...",
					        width: 500,
					        progress: true,
					        closable: false
					    });
						
						var task = {
							run: function(){
								if(getProgressBoo){
									Ext.Ajax.request({
										url: "api/mn_ImpRequestVSNJV3.php",
										timeout: 18000,
										method: "POST",
										params: {
											mode: "SAVE",
											step: step, 
											ddate: ddate
										},
										success: function (response) {
											var obj = Ext.decode(response.responseText);
											var Processed	= obj.Processed;
											var total		= obj.total;
											var cs			= parseInt((Processed/total)*100); 
											step			= obj.Processed;
											var txts		= obj.msg;
											
											progressbar.updateProgress(Processed/total,'Status: '+(cs)+ '%...');
											
											if((Processed - 1) == total){
												runner.stop(task);
												progressbar.hide();
											} else if(Processed == total){
												progressbar.updateText('All finished!');
												Ext.MessageBox.alert("แจ้งข้อมูล", txts);
											}
										}
									});
								} else {
									runner.stop(task);
								}
							},interval: 1500 // monitor the progress every 1000 milliseconds
						};
						//start the TaskRunner
						runner.start(task);		


						

					} else { Ext.MessageBox.alert("แจ้งเตือน", msg); }
					
				} //End Handle
			}
			 
			]
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
