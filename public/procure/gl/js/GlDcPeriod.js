Ext.onReady(function() {
	Ext.QuickTips.init();
	
	/*===============================================*/
	var title_panel		= "บันทึกงวดเดือน";
	/*===============================================*/
	
	var store = new Ext.data.JsonStore({
	    autoDestroy: true,
		autoLoad: true,
	    url : "api/List_GlDcPeriod.php",
	    baseParams: { type: "gl_dc_period", i_read: user_right_read }, //Permission i_read
	    root: "data",
	    idProperty: "id",
		fields: [
		    { name : "no" },
			{ name : "c_mm" },
			{ name : "c_yyyy" },
			{ name : "sys1" },
			{ name : "sys2" },
			{ name : "sys3" }
		]
	});
	
	var month = new Ext.data.JsonStore({
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
	
	var status = new Ext.data.JsonStore({
		fields: ["id", "c_name"],
		data : [
		        { id : "1", c_name : "<font color=\"blue\">เปิดงวด</font>" },
		        { id : "2", c_name : "<font color=\"red\">ปิดงวด</font>" }
		       ]
	});
	
	var show = new Ext.grid.GridPanel({
		region: "center",
		layout:"fit",
		height: 280,
		autohieght: true,
		border: true,
		stripeRows: true,
		loadMask: true,
		store: store,
		viewConfig : {
			emptyText: "ไม่มีข้อมูล..",
			deferEmptyText: false,
			forceFit: true,
			scrollOffset: 0 // close scrollbar
		},
		columns: [
			new Ext.grid.RowNumberer({
				header:" No ",
				width:50,
				renderer:function(value, metaData, record, row, col, store, gridView){
					return record.get("no");
				}
			}),
			{ id: "month", header: "เดือน", sortable: true, width:200, align: "center", dataIndex: "c_mm",
				renderer:function(value, metaData, record, row, col, store, gridView){
					var rec	= month.getById(value);
					return rec.get("c_name");
				}
			},
			{ header: "ปี", sortable: true, width:150, align: "center", dataIndex: "c_yyyy" },
			{ header: "ระบบบัญชี", sortable: true, width:200, dataIndex: "sys1", align: "center",
				renderer:function(value, metaData, record, row, col, store, gridView){
					var rec	= status.getById(value);
					return rec.get("c_name");
				}
			},
			{ header: "ระบบลูกหนี้", sortable: true, width:200, dataIndex: "sys2", align: "center",
				renderer:function(value, metaData, record, row, col, store, gridView){
					var rec	= status.getById(value);
					return rec.get("c_name");
				}
			},
			{ header: "ระบบเจ้าหนี้", sortable: true, width:200, dataIndex: "sys3", align: "center",
				renderer:function(value, metaData, record, row, col, store, gridView){
					var rec	= status.getById(value);
					return rec.get("c_name");
				}
			}
		],
		columnLines: true,
		autoExpandColumn: "month"
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
						id: "year",
						fieldLabel: "ปี",
						width: 100,
						mode: "local",
			            store: store_year,
						valueField: "id",
						displayField: "c_name",
						triggerAction: "all",
						forceSelection: true,
						selectOnFocus: true,
						typeAhead : false,
						emptyText: "กรุณาเลือก...",
						value: (new Date().getFullYear()),
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
				style: "margin-left:15px;",
				text: "&nbsp;สร้างงวดเดือนประจำปี&nbsp;",
				iconCls: "database_start",
				handler: function() {
					
					var getProgressBoo	= true;
					var runner			= new Ext.util.TaskRunner();
					var step			= 0;
					var year			= Ext.getCmp("year").getValue();

					var progressbar = Ext.MessageBox.show({
				        title: 'Please wait',
				        msg: "กำลังสร้างงวด",
				        progressText: 'Initializing...',
				        width: 500,
				        progress: true,
				        closable: false
				    });

					var task = {
						run: function(){
							if(getProgressBoo){
								Ext.Ajax.request({
									url: "api/mn_GlDcPeriod.php",
									timeout: 18000,
									method: "POST",
									params: {
										mode: "SAVE",
										step: step,
										year: year 
									},
									success: function (response) {
										
										var obj = Ext.decode(response.responseText);
										var Processed	= obj.Processed;
										var total		= obj.total;
										var cs			= parseInt((Processed/total)*100);
										var msg			= obj.msg;
										step			= obj.Processed;

										if(obj.success == true){
											progressbar.updateProgress(Processed/total,'Status: '+(cs)+ '%...');
											
											if((Processed - 1) == total){
												runner.stop(task);
												progressbar.hide();
												store.load();
											} else if(Processed == total){
												progressbar.updateText('All finished!');
											}
										} else if(msg == 'failure'){
											runner.stop(task);
											progressbar.hide();
											Ext.MessageBox.alert('Failed', 'ข้อมูลไม่ถูกต้อง !!');
										} else {
											runner.stop(task);
											progressbar.hide();
											Ext.MessageBox.alert('Failed', 'ไม่สามารถสร้างงวดเดือนประจำปี '+(obj.YY)+' ได้ !!');
										}
									},
									failure: function ( result, request) {
										runner.stop(task);
										progressbar.hide();
										Ext.MessageBox.alert("แจ้งเตือน", 'Failure');
									}
								});
							} else { runner.stop(task); }
						},interval: 200 // monitor the progress every 1000 milliseconds
					};
					//start the TaskRunner
					runner.start(task);				
				}
			}]
		}, {
			border: false,
			bodyStyle: { padding: "10px 20px" },
			defaults: { anchor: "100%", msgTarget: "side", allowBlank: false },
			buttonAlign: "left",
			items: [{
				xtype: "container",
				layout: "hbox",
				align: "stretch",
				defaults: { xtype: "fieldset", flex:1, margins : "0px 3px", autoHeight: true },
				items: [{
					title: "เดือนปี ที่บันทึกงวดบัญชีแล้ว(เมนูปิดงวดเดือน)",
					defaults: { anchor: "100%" },
					items: [ show ]
				}]
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