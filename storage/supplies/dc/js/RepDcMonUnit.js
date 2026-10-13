Ext.onReady(function() {
    Ext.QuickTips.init();

    Ext.idRep       = 'frm-report'; 
    Ext.urlReport   = './api/report/RepDcMonUnit.php';
    Ext.titleReport = 'รายงานข้อมูลหน่วยเงิน';
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
        return [htmlReport,excelReport,downloadReport];
    };
	
    // สถานะ 
    var storeStatus = new Ext.data.JsonStore({
            fields: ['id', 'c_name'],
            data : [
                    { id : '0', c_name : 'เลือกทั้งหมด' },
                    { id : ''+Ext.CONF_STATUS_ENABLE, c_name : 'ใช้งาน' },
                    { id : ''+Ext.CONF_STATUS_DISABLE, c_name : 'ไม่ใช้งาน' }
                   ]
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
                            new Ext.form.ComboBox({
                                fieldLabel: 'สถานะ',
                                store: storeStatus,
                                valueField: 'id',
                                displayField: 'c_name',
                                hiddenName:'i_enable',
                                value: '0',
                                width: 150,
                                typeAhead: true,
                                mode: 'local',
                                triggerAction: 'all',
                                emptyText: 'กรุณาเลือก...',
                                forceSelection: true,
                                selectOnFocus: true
                            })
                            ]
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