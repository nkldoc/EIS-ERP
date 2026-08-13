Ext.onReady(function() {
	Ext.QuickTips.init();

	Ext.idRep 		= 'frm-report'; 
	Ext.urlReport	= './api/report/RepAmDc002.php';  // 
	Ext.titleReport = 'รายงานข้อมูลการได้มาของสินทรัพย์';
	
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
			items: [{ xtype:'hidden',id:'titleReportID',name:'titleReport',value:Ext.titleReport},
			        { xtype:'hidden',id:'modeID',name:'mode' }],
			buttonAlign: 'left',
			buttons: setButtonReport()
		}]
	};
	
    /*====================== RENDER ======================*/
	new Ext.Viewport({
		layout: 'border', 
		items:panelForm,
	});
});