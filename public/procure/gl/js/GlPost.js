Ext.onReady(function() {
	Ext.QuickTips.init();
	
	/*===============================================*/
	var title_panel		= "ผ่านรายการบัญชี";
	/*===============================================*/
	
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
    var now = currentTime.getFullYear()+1;
    var yy_en = currentTime.getFullYear()-1;
    while(yy_en <= now) {
    	years.push({ id : yy_en, c_name : yy_en + 543 });
    	yy_en++;
    };
    
	store_year = new Ext.data.JsonStore({
		fields: ["id", "c_name"],
		data : years
	});
	
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
					items: [new Ext.form.ComboBox({
						fieldLabel: "เดือน",
						id: "month",
						width: 300,
						mode: "local",
			            store: store_month,
						valueField: "id",
						displayField: "c_name",
						triggerAction: "all",
						forceSelection: true,
						selectOnFocus: true,
						typeAhead : false,
						emptyText: "กรุณาเลือก...",
						value: (new Date().getMonth()+1),
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
						fieldLabel: "ปี",
						id: "year",
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
					})]
				}]
			}],
			buttonAlign: "left",
			buttons: [{
				text: "ผ่านรายการบัญชี",
				iconCls: "database_start",
				handler: function() {
					
					var getProgressBoo	= true;
					var runner			= new Ext.util.TaskRunner();
					var step			= 0;
					var month			= parseInt(Ext.getCmp("month").getValue());
					var year			= Ext.getCmp("year").getValue();
					
					var progressbar = Ext.MessageBox.show({
				        title: "Please wait",
				        msg: "กำลังผ่านรายการบัญชี",
				        progressText: "Initializing...",
				        width: 500,
				        progress: true,
				        closable: false
				    });
					
					var task = {
						run: function(){
							if(getProgressBoo){
								Ext.Ajax.request({
									url : "api/mn_GlPost.php",
									timeout: 18000,
									method: "POST",
									params : {
										mode: "SAVE",
										step: step, 
										month: month,
										year: year 
									},
									success: function (response) {
										var obj = Ext.decode(response.responseText);
										var Processed	= obj.Processed;
										var total		= obj.total;
										var cs			= parseInt((Processed/total)*100); 
										step			= obj.Processed;
										
										progressbar.updateProgress(Processed/total,'Status: '+(cs)+ '%...');
										
										if((Processed - 1) == total){
											runner.stop(task);
											progressbar.hide();
										} else if(Processed == total){
											progressbar.updateText('All finished!');
										}
									}
								});
							} else {
								runner.stop(task);
							}
						},interval: 200 // monitor the progress every 1000 milliseconds
					};
					//start the TaskRunner
					runner.start(task);		
					
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