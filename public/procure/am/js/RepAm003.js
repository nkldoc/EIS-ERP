Ext.onReady(function() {
	Ext.QuickTips.init();
	
	Ext.idRep 	= 'frm-report'; 
	Ext.urlReport	= './api/report/RepAm003.php';  // 
	Ext.titleReport = 'ทะเบียนสินทรัพย์ (นำเข้าเริ่มต้นระบบ)';
	function frmWithOutAjax(value){
		 
		var frm = Ext.getCmp(Ext.idRep).getForm().el.dom;  
		frm.setAttribute('target',"_blank");	
		frm.setAttribute('action',Ext.urlReport);
		Ext.getCmp('modeID').setValue(value);
		//Create

		//AppendChild 
		frm.submit(); 
	};
	function setButtonReport(){

		var htmlReport 		= { 
						text: Ext.GLOBAL_BU_REPORT_TH,  
						scale:'small', 
						iconCls: 'icon-html' , 
						handler:function(){ 
							frmWithOutAjax('html');
							
						},
					};
		var excelReport 	= { 
						text: Ext.GLOBAL_BU_EXCEL_TH,  
						scale:'small', 
						id:'rep-excel',
						iconCls: 'icon-excel' ,  
						handler:function(){ 
							frmWithOutAjax('excel');
						},
					};
		var downloadReport 	= { 
						text: Ext.GLOBAL_BU_DOWNLOAD_TH,  
						scale:'small', 
						iconCls: 'icon-downloadHTML' , 
						handler:function(){  
							frmWithOutAjax('downloadHTML');	
						},
					}; 
		return [htmlReport,excelReport,downloadReport];
	};

	var storeCostSearch	= new Ext.data.JsonStore({
		autoLoad: true,
		url: 'api/All_AmCombo.php',
		baseParams: {type : 'storeCost', i_all : 1},
		root: 'data',
		idProperty: 'id',
		totalProperty: 'totalCount',
	    fields: [ 'id','c_code', 'c_name']
	});
	
	Ext.PopCostSearch = new Ext.ux.Poplov({ 
		text		: 'ทุกหน่วยงาน',  
		id		: 's-dc_cost_id',	//go to relation	
		iconCls		: 'page_magnify', 
		valueHidden : 'dc_cost_id', 	//go to hidden
		store		: storeCostSearch,
		headerGrid	: [{ header: "ID System", sortable: true, hidden:true, dataIndex: 'id' },
						{ header: "รหัส", sortable: true, dataIndex:'c_code' , },
						{ header: "ชื่อ"
							, sortable: true
							, id: 'c_name' 
							, dataIndex: 'c_name',
							renderer: function(value, metaData, record, rowIndex, colIndex, store) {
									metaData.attr = "style='cursor:pointer';";
								return value; 
							} 
						}],
		widthText	: 400,  
		fieldLabel	: 'หน่วยงานที่ใช้สินทรัพย์',  
		isCellClickGrid : true,
		cellClickGrid : function(grid, rowIndex, columnIndex, e) { 
			 
			var record 		= grid.getStore().getAt(rowIndex);  
			var TextShow 	= record.data.c_code+' '+record.data.c_name;
			
			Ext.getCmp('s-dc_cost_id').setValue(record.data.id);
			Ext.getCmp('s-dc_cost_id_Name').setValue(TextShow); 
			
			Ext.getCmp("win-pop-lovs-dc_cost_id").hide();  					
			Ext.getCmp("win-pop-lovs-dc_cost_id").destroy();
			
			
			storeSD.setBaseParam("dc_cost_id", record.data.id);
		}
	});
	
	store_month	= new Ext.data.JsonStore({
		fields: [ "id", "c_name" ],
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
        var now = currentTime.getFullYear()+2;
        var yy_en = currentTime.getFullYear()-10;
        while(yy_en <= now) {
            years.push({ id : yy_en, c_name : yy_en + 543 });
            yy_en++;
        };
    
	store_year = new Ext.data.JsonStore({
		fields: ["id", "c_name"],
		data : years
	});
	
	var storeSD	= new Ext.data.JsonStore({
            //autoLoad: true,
            url: 'api/All_AmCombo.php',
            baseParams: {type : 'storeSDSearch'
                            , i_all : 1
                            , dc_cost_id: 0
                            , i_start_month: '01'
                            , i_start_year : new Date().getFullYear()
                            , i_end_month: new Date().getMonth()+1
                            , i_end_year : new Date().getFullYear()},
            root: 'data',
            idProperty: 'id',
            totalProperty: 'totalCount',
	    fields: [ 'id','c_code', 'c_name']
	});
	
	Ext.PopSDStart = new Ext.ux.Poplov({ 
		text		: 'ทั้งหมด',  
		id			: 's-sd_code_start',	//go to relation	
		iconCls		: 'page_magnify', 
		valueHidden : 'sd_code_start', 	//go to hidden
		store		: storeSD,
		headerGrid	: [{ header: "ID System", sortable: true, hidden:true, dataIndex: 'id' },
						{ header: "รหัส", sortable: true, dataIndex:'c_code' , },
						{ header: "ชื่อ"
							, sortable: true
							, id: 'c_name' 
							, dataIndex: 'c_name',
							renderer: function(value, metaData, record, rowIndex, colIndex, store) {
									metaData.attr = "style='cursor:pointer';";
								return value; 
							} 
						}],
		widthText	: 400,  
		fieldLabel	: 'เลขที่นำเข้าสินทรัพย์ ',  
		isCellClickGrid : true,
		cellClickGrid : function(grid, rowIndex, columnIndex, e) { 
			 
			var record 		= grid.getStore().getAt(rowIndex);  
			var TextShow 	= record.data.c_code+' '+record.data.c_name;
			
			Ext.getCmp('s-sd_code_start').setValue(record.data.c_code);
			Ext.getCmp('s-sd_code_start_Name').setValue(TextShow); 
			
			Ext.getCmp("win-pop-lovs-sd_code_start").hide();  					
			Ext.getCmp("win-pop-lovs-sd_code_start").destroy();
		}
	});
	
	Ext.PopSDEnd = new Ext.ux.Poplov({ 
		text		: 'ทั้งหมด',  
		id			: 's-sd_code_end',	//go to relation	
		iconCls		: 'page_magnify', 
		valueHidden : 'sd_code_end', 	//go to hidden
		store		: storeSD,
		headerGrid	: [{ header: "ID System", sortable: true, hidden:true, dataIndex: 'id' },
						{ header: "รหัส", sortable: true, dataIndex:'c_code' , },
						{ header: "ชื่อ"
							, sortable: true
							, id: 'c_name' 
							, dataIndex: 'c_name',
							renderer: function(value, metaData, record, rowIndex, colIndex, store) {
									metaData.attr = "style='cursor:pointer';";
								return value; 
							} 
						}],
		widthText	: 400,  
		fieldLabel	: 'ถึงเลขที่',  
		isCellClickGrid : true,
		cellClickGrid : function(grid, rowIndex, columnIndex, e) { 
			 
			var record 		= grid.getStore().getAt(rowIndex);  
			var TextShow 	= record.data.c_code+' '+record.data.c_name;
			
			Ext.getCmp('s-sd_code_end').setValue(record.data.c_code);
			Ext.getCmp('s-sd_code_end_Name').setValue(TextShow); 
			
			Ext.getCmp("win-pop-lovs-sd_code_end").hide();  					
			Ext.getCmp("win-pop-lovs-sd_code_end").destroy();
		}
	});
	
    var panelForm	= new Ext.Panel ({
		region: "center",
		title: Ext.titleReport,
		border: false,
		stripeRows: true,
		loadMask: true,
        items: [{
			xtype: "form",
			id : Ext.idRep,
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
					title: "เงื่อนไขการแสดงรายงาน",
					RemoveCls: "x-box-item",
					defaults: { labelStyle : "width:200px;", allowBlank: true },
					items: [{ xtype:'hidden',id:'titleReportID',name:'titleReport',value:Ext.titleReport}
						, { xtype:'hidden',id:'modeID',name:'mode' },
						Ext.PopCostSearch.mini,
						{
							xtype: "compositefield",
							fieldLabel: "เดือน/ปีที่ออกเลขที่นำเข้าสินทรัพย์ ",
							msgTarget: "under",
							items: [new Ext.form.ComboBox({
								id: "s-start_month",
								hiddenName: "i_start_month",
								fieldLabel: "เดือน",
								width: 100,
								mode: "local",
								store: store_month,
								value: (new Date().getMonth()+1),
								valueField: "id",
								displayField: "c_name",
								triggerAction: "all",
								value : '01',
								forceSelection: true,
								selectOnFocus: true,
								typeAhead : false,
								emptyText: "กรุณาเลือก...",
								listeners: {
									"select": function (combo, newValue) {
										storeSD.setBaseParam("i_start_month", newValue.id);
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
							}), { xtype: "displayfield", value: "ปี" },
							new Ext.form.ComboBox({
								id: "s-start_year",
								hiddenName: "i_start_year",
								fieldLabel: "ปี",
								width: 100,
								mode: "local",
							    store: store_year,
								value: new Date().getFullYear(),
								valueField: "id",
								displayField: "c_name",
								triggerAction: "all",
								forceSelection: true,
								selectOnFocus: true,
								typeAhead : false,
								emptyText: "กรุณาเลือก...",
								listeners: {
									"select": function (combo, newValue) {
										storeSD.setBaseParam("i_start_year", newValue.id);
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
						},{
							xtype: "compositefield",
							fieldLabel: "ถึงเดือน/ปี",
							msgTarget: "under",
							items: [new Ext.form.ComboBox({
								id: "s-end_month",
								hiddenName: "i_end_month",
								fieldLabel: "เดือน",
								width: 100,
								mode: "local",
								store: store_month,
								value: (new Date().getMonth()+1),
								valueField: "id",
								displayField: "c_name",
								triggerAction: "all",
								forceSelection: true,
								selectOnFocus: true,
								typeAhead : false,
								emptyText: "กรุณาเลือก...",
								listeners: {
									"select": function (combo, newValue) {
										storeSD.setBaseParam("i_end_month", newValue.id);
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
							}), { xtype: "displayfield", value: "ปี" },
							new Ext.form.ComboBox({
								id: "s-end_year",
								hiddenName: "i_end_year",
								fieldLabel: "ปี",
								width: 100,
								mode: "local",
							    store: store_year,
								value: new Date().getFullYear(),
								valueField: "id",
								displayField: "c_name",
								triggerAction: "all",
								forceSelection: true,
								selectOnFocus: true,
								typeAhead : false,
								emptyText: "กรุณาเลือก...",
								listeners: {
									"select": function (combo, newValue) {
										storeSD.setBaseParam("i_end_year", newValue.id);
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
						},
						Ext.PopSDStart.mini,
						Ext.PopSDEnd.mini]
				}]
			}],
			buttonAlign: "left",
			buttons: setButtonReport()
		}]
	});
    
	/*====================== RENDER ======================*/
	new Ext.Viewport({
		layout: 'border', 
		items:panelForm,
	});
});