Ext.onReady(function() {
    Ext.QuickTips.init();

    Ext.idRep       = 'frm-report'; 
    Ext.urlReport   = './api/report/RepImp002.php';
    Ext.titleReport = 'สรุปใบเสร็จรับเงินที่ยกเลิก';
	
	Ext.getDate = Ext.apply({
		year:new Date().getFullYear(), 
		month:new Date().getMonth()+1,
		day:new Date().getDay(),
		getNowCarlen:function(){
			 var day = new Date();
			 var dd = day.getDate();
			 var mm = day.getMonth() + 1;
			 var yy = day.getFullYear()+543; 
			 mm = (mm < 10) ? ("0" + mm) : mm;
			 dd = (dd < 10) ? ("0" + dd) : dd; 
			return dd+'-'+mm+'-'+yy;
		},	
		defaultDate:function(typeStartDate) {
			 var day = new Date();
			 var dd = day.getDate();
			 var mm = day.getMonth() + 1;
			 var yy = day.getFullYear() + 543; 
			 if (typeStartDate == 1) // วันที่เริ่ม -1 เดือน
			 {
				 dd = "01";
				 mm = "0" + mm.toString(); 
			 } else {
				 dd = "0" + dd.toString();
				 mm = "0" + mm.toString();
			 }
			 return dd.substr(-2) + "-" + mm.substr(-2) + "-" + yy.toString();
		 },			
	});
	
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

        var htmlReport 	= { 
                                text: Ext.GLOBAL_BU_REPORT_TH,  
                                scale:'small', 
                                iconCls: 'icon-html' , 
                                handler:function(){ 
                                        frmWithOutAjax('html');
                                }
                            };
        var excelReport = { 
                                text: Ext.GLOBAL_BU_EXCEL_TH,  
                                scale:'small', 
                                id:'rep-excel',
                                iconCls: 'icon-excel' ,  
                                handler:function(){ 
                                        frmWithOutAjax('excel');
                                }
                            };
        var downloadReport = { 
                                text: Ext.GLOBAL_BU_DOWNLOAD_TH,  
                                scale:'small', 
                                iconCls: 'icon-downloadHTML' , 
                                handler:function(){  
                                        frmWithOutAjax('downloadHTML');	
                                }
                            }; 
        return [htmlReport,excelReport];
    };
	
    var panelForm = new Ext.Panel ({
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
                    items: [{ xtype:'hidden',id:'titleReportID',name:'titleReport',value:Ext.titleReport},
                            { xtype:'hidden',id:'modeID',name:'mode' },
                            {
								xtype: 'datefield',
								fieldLabel: 'ระหว่างวันที่',
								name : 'd_doc_date1', 
								id : 'frm-d_doc_date1',
								value :Ext.getDate.getNowCarlen(),
										   
							},{
								xtype: 'datefield',
								fieldLabel: 'ถึงวันที่',
								name : 'd_doc_date2', 
								id : 'frm-d_doc_date2',
								value :Ext.getDate.getNowCarlen(),
										   
							}]
                    }]
                }],
            buttonAlign: "left",
            buttons: setButtonReport()
        }]
    });

    new Ext.Viewport({
        layout: 'border', 
        items:panelForm
    });
});