Ext.onReady(function() {
    Ext.QuickTips.init();

    Ext.idRep       = 'frm-report'; 
    Ext.urlReport   = './api/report/RepImp005.php';
    Ext.titleReport = 'รายงานลูกหนี้บัตรเครดิตประจำวัน';
	
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
        var s_dc_period_id = "";

		if (Ext.getCmp("s_dc_period_id").getValue() == "") {
            Ext.MessageBox.alert("แจ้งเตือน", "- กรุณาเลือก รอบอย่างน้อย 1 รายการ<br>");
            return false;
		} else {
            s_dc_period_id = Ext.getCmp("s_dc_period_id").getValue();
            Ext.getCmp("dc_period_idID").setValue(s_dc_period_id);
        }
        
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

    store_period = new Ext.data.JsonStore({
		autoLoad : true,
		url : "api/All_RepImp001.php",
		baseParams : {
			type : "dc_period",
			show : "all"
		},
		root : "data",
		idProperty : "id",
		fields : [ "id", "c_name", "cut_name" ]
	});
	
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
                            { xtype:'hidden',id:'dc_period_idID',name:'dc_period_id' },
							{
								xtype: "compositefield",
								fieldLabel: "วันที่",
								anchor: "100%",
								msgTarget: "under",
								items: [{
									xtype: "datefield",
									id: "date_start",
									width: 127,
									listeners : {
										afterrender : function() {
											var date = new Date();
												date = new Date(date.getFullYear()+543, date.getMonth(), 1);
											this.setValue(date);
										}
									}
								},{
									xtype: "displayfield", value: "ถึงวันที่", width: 36, align:"center"
								},{
									xtype: "datefield",
									id: "date_end",
									width: 127,
									value: addY(543)
								}]
							}, new Ext.ux.form.LovCombo({
								id : "s_dc_period_id",
								fieldLabel : "รอบ",
								width : 300,
								mode : "local",
								store : store_period,
								valueField : "id",
								displayField : "c_name",
								triggerAction : "all",
								forceSelection : true,
								selectOnFocus : true,
								typeAhead : false,
								emptyText : "กรุณาเลือก..."
							})]
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