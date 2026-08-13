Ext.onReady(function() {
	Ext.QuickTips.init();

	/*===============================================*/
	if( i_system == 1 ) {
		title_panel	= "ปิดงวดเดือน (บัญชี)";
	} else if( i_system == 2 ) {
		title_panel	= "ปิดงวดเดือน (ระบบบัญชีรายได้/การเงินรับ)";
	} else if( i_system == 3 ) {
		title_panel	= "ปิดงวดเดือน (ระบบบัญชีค่าใช้จ่าย/การเงินจ่าย)";
	}
	/*===============================================*/
	
	Ext.store = new Ext.data.JsonStore({
		storeId: "myStore",
	    autoDestroy: true,
		autoLoad: true,
	    url: "api/List_GlDcPeriodAll.php",
	    baseParams: { type: "vw_gl_dc_period", i_system: i_system, i_read: user_right_read }, //Permission i_read
	    root: "data",
	    idProperty: "id",
		totalProperty: "totalCount",
		fields: [
			{ name : "no" },
			{ name : "id" },
			{ name : "c_mm" },
			{ name : "c_yyyy" },
			{ name : "i_gen" },
			{ name : "i_status" },
			{ name : "c_status" },
			{ name : "i_system" },
			{ name : "i_last_period" },
			{ name : "dc_user_create_id" },
			{ name : "dc_user_create_cost_id" },
			{ name : "d_create" },
			{ name : "d_update" },
			{ name : "count_row" }
		]
	});
		
	var month = new Ext.data.JsonStore({
		fields: ['id', 'c_name'],
		data : [
		        { id : '01', c_name : 'มกราคม' },
		        { id : '02', c_name : 'กุมภาพันธ์' },
		        { id : '03', c_name : 'มีนาคม' },
		        { id : '04', c_name : 'เมษายน' },
		        { id : '05', c_name : 'พฤษภาคม' },
		        { id : '06', c_name : 'มิถุนายน' },
		        { id : '07', c_name : 'กรกฎาคม' },
		        { id : '08', c_name : 'สิงหาคม' },
		        { id : '09', c_name : 'กันยายน' },
		        { id : '10', c_name : 'ตุลาคม' },
		        { id : '11', c_name : 'พฤศจิกายน' },
		        { id : '12', c_name : 'ธันวาคม' }
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

	// pagingBar
	pagingBar = new Ext.PagingToolbar({
		pageSize: 12,
		store: Ext.store,
		displayInfo: true,
		displayMsg: "Displaying topics {0} - {1} of {2}"
	});
	
	//function Button
	function renderInstall(value, id, r) {
		var id = Ext.id();
		if(value == 1){
			var textbtn = "<span style='color:red;'>ปิดงวดเดือน</span>";	
		} else {
			var textbtn = "<span style='color:green;'>เปิดงวดเดือน</span>";
		}
		createGridButton.defer(1, this, [textbtn, id, r]);
		return('<div id="' + id + '"></div>');
	}
	
	// Manage data
	function createGridButton(textbtn, id, record) {
		new Ext.Button({
			text: textbtn,
			width: 130,
			handler: function(btn, e) {
				// สลับเปิด-ปิดงวด
				if(record.data.i_status == 1) {
					var status	= 2;
				} else {
					var status	= 1;
				}
				
				// AJAX
				Ext.Ajax.request({
					url : "api/mn_GlDcPeriodAll.php",
					params : { 
						mode: "EDIT", 
						id: record.get("id"),
						i_system: i_system,
						i_status: status
					},
					method: "POST", //POST
					success: function ( result, request ) { 
						var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
						if (jsonData.success) {
							//Ext.MessageBox.alert('Success', jsonData.msg);			// alert massage success
						} else {
							Ext.MessageBox.alert("Failed", jsonData.msg);			// alert massage error
						}
						Ext.store.reload();
					},
					failure: function ( result, request) {
						console.log(result);
						Ext.MessageBox.alert('Failed', result.responseText);		// connect error
					}
				});
			}
		}).render(document.body, id);
	}
	
	// ================================ gridMain ================================ //
	gridMain = new Ext.grid.GridPanel({
		region: "center",
		layout: "fit",
		title: "แสดงรายการ"+title_panel,
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
			title: "ระบุเงื่อนไขในการค้นหาข้อมูล",
			columns: 1,
            defaults: { scale: "small", style: "float: right" },
            items: [{ // แถวที่ 1
            	xtype: "buttongroup",
            	frame: false,
            	items: [{ xtype: "label", text: "ปี พ.ศ. : " }, { xtype: "tbspacer", width: 4 },
            	new Ext.form.ComboBox({
					id: "year",
					width: 200,
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
				})],
				buttonAlign: "left",
				buttons:[{ xtype: "tbfill" }, {
					text : "ค้นหา",
					iconCls: "icon-magnifier",
	    			handler : function() {
	    				
	    				var msg	= "";
	    				
	    				if(msg == "") {
							Ext.store.setBaseParam("mode", "SEARCH");
							Ext.store.setBaseParam("c_yyyy",Ext.getCmp("year").getValue());
							Ext.store.load();
							
	    				} else { Ext.Msg.alert("แจ้งเตือน", msg); }
	    			}
				}]
            }]
		}],
		columns: [new Ext.grid.RowNumberer({
			width:35,
			header:" No ",
			renderer:function(value, metaData, record, row, col, store, gridView){
				return record.get('no');
			}
		}),
		{ id: "c_mm", header: "รอบบัญชี", sortable: true, dataIndex: "c_mm",
			renderer: function(value, metaData, record, row, col, store, gridView){
				var mm		= month.getById(value).get("c_name");
				var yyyy	= store_year.getById(record.get("c_yyyy")).get("c_name");
				var i_status= record.get("i_status");
				if(i_status == 1){
					return "<span style='color:green;'>"+mm+" "+yyyy+"</span>";
				}else{
					return "<span style='color:red;'>"+mm+" "+yyyy+"</span>";
				}
			}
		},
		{ header: "วันที่ปิดครั้งแรก", sortable: true, align: "center", renderer:shortThaiDate, dataIndex: "d_create" },
		{ header: "วันที่ปิดครั้งแรก", sortable: true, align: "center", renderer:shortThaiDate, dataIndex: "d_update" },
		{ header: "จำนวนครั้งที่ปิด", sortable: true, align: "center", width: 100, dataIndex: "count_row" },
		{ header: "สถานะ", sortable: true, align: "center", width: 150, dataIndex: "i_status",
			renderer: function(value, metaData, record, row, col, store, gridView){
				if(value == 1)
					return "<span style='color:green;'>"+record.get("c_status")+"</span>";
				else
					return "<span style='color:red;'>"+record.get("c_status")+"</span>";
			}
		},
		{ header: "เปิด-ปิด", sortable: true, align: "center", width:150, dataIndex: "i_status",
			renderer: renderInstall
		}],
		autoExpandColumn: "c_mm",
		bbar: pagingBar
	}); //gridMain

	/*====================== CENTER ======================*/
	var center = new Ext.TabPanel({
		region: "center",
		border: false,
		//activeTab: 0, //default Tab
		id: "contenterCenter",
		defaults:{ autoScroll: true }, 
		items: [ gridMain ]
	});
	
	// SetTab Controller Loads
	Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
	/*====================== RENDER ======================*/
	new Ext.Viewport({
		layout: "border",
		items: [ center ]
	});
});