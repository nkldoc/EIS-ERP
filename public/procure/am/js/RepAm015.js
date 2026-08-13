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
    Ext.urlReport	= './api/report/RepAm015.php';  // 
    Ext.titleReport = 'รายงานการตัดจำหน่ายสินทรัพย์ (บัญชี)';
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
            widthText	: 280,  
            fieldLabel	: 'หน่วยงานเจ้าของสินทรัพย์ (ศูนย์ต้นทุน)',  
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
						{
							xtype: 'datefield', 
							id: 's-d_beginID',  
							name : 'd_begin',
							fieldLabel: "ตั้งแต่วันที่",
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
                                                }]
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