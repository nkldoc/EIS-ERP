Ext.onReady(function() {
	Ext.QuickTips.init();
	
	Ext.idRep 	= 'frm-report'; 
	Ext.urlReport	= './api/report/RepAm021.php';  // 
	Ext.titleReport = 'รายงานการบันทึกมูลค่าซากและอายุใช้งาน';
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
		id			: 's-dc_cost_id',	//go to relation	
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
	
	var storeSD	= new Ext.data.JsonStore({
            //autoLoad: true,
            url: 'api/All_AmCombo.php',
            baseParams: {type : 'storeSDSearch', i_all : 1},
            root: 'data',
            idProperty: 'id',
            totalProperty: 'totalCount',
	    fields: [ 'id','c_code', 'c_name']
	});
	
	Ext.PopSDStart = new Ext.ux.Poplov({ 
		text		: 'ทั้งหมด',  
		id		: 's-sd_code_start',	//go to relation	
		iconCls		: 'page_magnify', 
		valueHidden     : 'sd_code_start', 	//go to hidden
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
		fieldLabel	: 'รหัสรายการ ',  
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
		id		: 's-sd_code_end',	//go to relation	
		iconCls		: 'page_magnify', 
		valueHidden     : 'sd_code_end', 	//go to hidden
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
		fieldLabel	: 'ถึงรหัสรายการ',  
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
						Ext.PopSDStart.mini,
						Ext.PopSDEnd.mini,
                                                Ext.PopCostSearch.mini,
                                                {
                                                    fieldLabel: 'การแสดงรายการ',
                                                    xtype: 'radiogroup',
                                                    columns: [160,170,120],
                                                    items: [
                                                        { boxLabel: 'คำนวณค่าเสื่อมราคา', name: 'i_is_expense', inputValue: '0' },
                                                        { boxLabel: 'ไม่คำนวณค่าเสื่อมราคา', name: 'i_is_expense', inputValue: '1' },
                                                        { boxLabel: 'เลือกทั้งหมด', name: 'i_is_expense', inputValue: '2' , checked: true},
                                                    ]
                                                }]
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