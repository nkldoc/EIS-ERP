function defaultDate(typeStartDate)
{
	var day = new Date();
	var dd = day.getDate();
	var mm = day.getMonth()+1;
	var yy = day.getFullYear()+543;
	
	if (typeStartDate==1) // วันที่เริ่ม -1 เดือน
	{
		dd = "01";
		mm--;
		mm = "0"+mm.toString();
	}
	else
	{
		dd = "0"+dd.toString();
		mm = "0"+mm.toString();
	}
	return dd.substr(-2)+"-"+mm.substr(-2)+"-"+yy.toString();
}

Ext.onReady(function() {
	Ext.QuickTips.init();
	
	Ext.idRep 	= 'frm-report'; 
	Ext.urlReport	= './api/report/RepAm001.php';  // 
	Ext.titleReport = 'รายงาน การจัดซื้อ/จัดจ้างที่ตรวจรับแล้ว';
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
	
    var store_type	= new Ext.data.JsonStore({
		fields: [ "id", "c_name" ],
		data : [
		        { id : -1, c_name : "ไม่ระบุ" },
		        { id : 0, c_name : "จัดจ้าง" },
		        { id : 1, c_name : "จัดซื้อ" },
		        { id : 2, c_name : "จัดเช่า" }
		       ]
	});	
    
    var store_budget	= new Ext.data.JsonStore({
		fields: [ "id", "c_name" ],
		data : [
		        { id : 1, c_name : "งบทำการ" },
		        { id : 2, c_name : "งบลงทุน" },
		        { id : 3, c_name : "งบสำรองเร่งด่วน" }
		       ]
	});	
	
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
		widthText	: 280,  
		fieldLabel	: 'เลือกหน่วยงานเจ้าของเรื่อง',  
	});

	var storeContractSearch	= new Ext.data.JsonStore({
		autoLoad: true,
		url: 'api/All_AmCombo.php',
		baseParams: {type : 'storePurchaseContract', i_all : 1},
		root: 'data',
		idProperty: 'id',
		totalProperty: 'totalCount',
	    fields: [ 'id','c_code', 'c_name']
	});
	
	Ext.PopContractSearch = new Ext.ux.Poplov({
		text		: 'ทั้งหมด',
		id			: 's-ap_po_hdr_id',	//go to relation	
		iconCls		: 'page_magnify', 
		valueHidden : 'ap_po_hdr_id', 	//go to hidden
		store		: storeContractSearch,
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
		widthText	: 280,  
		fieldLabel	: 'เลขที่สัญญา',  
	});
 //=====================================================================
 
    var panelForm = {
		region: 'center',
		title: Ext.titleReport,
		xtype: 'panel',
		border: false,
		stripeRows: true,
		loadMask: true,
		items: [
		{
			xtype: 'form',
			id : Ext.idRep,
			frame: true,
			labelWidth: 150,
			bodyStyle: { padding: '10px 20px' },
			defaults: { anchor: '100%', msgTarget: 'side', allowBlank: false },
			buttonAlign: 'left',
			items: [{
				xtype: 'container',
				layout: 'hbox',
				align: 'stretch',
				defaults: { xtype: 'fieldset', flex:1, margins : '0px 3px', autoHeight: true },
				items: [{
					title: 'เงื่อนไขการแสดงรายงาน',
					defaults: { allowBlank: false },
					items: [{ xtype:'hidden',id:'titleReportID',name:'titleReport',value:Ext.titleReport}
							, { xtype:'hidden',id:'modeID',name:'mode' },
						Ext.PopCostSearch.mini ,
						new Ext.form.ComboBox({
							id: "s-type",
							hiddenName : 'i_type',
							fieldLabel: "เลือกประเภทวิธีการ",
							width: 100,
							mode: "local",
						    store: store_type,
							value: -1,
							valueField: "id",
							displayField: "c_name",
							triggerAction: "all",
							forceSelection: true,
							selectOnFocus: true,
							typeAhead : false,
							emptyText: "กรุณาเลือก...",
						}),
						new Ext.form.ComboBox({
							id: "s-budget",
							hiddenName : 'i_budget',
							fieldLabel: "เลือกประเภทงบประมาณ",
							width: 100,
							mode: "local",
						    store: store_budget,
							value: 1,
							valueField: "id",
							displayField: "c_name",
							triggerAction: "all",
							forceSelection: true,
							selectOnFocus: true,
							typeAhead : false,
							emptyText: "กรุณาเลือก...",
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
						}),
						{
							xtype: 'datefield', 
							id: 's-d_beginID',  
							name : 'd_begin',
							fieldLabel: "ระบุช่วงวันที่",
							width:140,
							value:defaultDate(1),
							emptyText : "ตั้งแต่วันที่",
					    },{
							xtype: 'datefield', 
							id: 's-d_endID',  
							name : 'd_end',
							fieldLabel: "ถึงวันที่",
							width:140,
							value:defaultDate(2),
							emptyText : "ถึงวันที่",
					    }, Ext.PopContractSearch.mini]
				}]
			}],
			buttons: setButtonReport()
		}]
	};
	
    new Ext.Viewport({
		layout: 'border', 
		items:panelForm,
	});
	
});