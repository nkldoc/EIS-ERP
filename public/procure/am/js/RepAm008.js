Ext.onReady(function() {
    Ext.QuickTips.init();

    Ext.idRep 		= 'frm-report'; 
    Ext.urlReport	= './api/report/RepAm008.php';  // 
    Ext.titleReport = 'รายงานสินทรัพย์ในครอบครอง';
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
                                    if (Ext.getCmp('s-dc_cost_id').getValue() == "")
                                        Ext.Msg.alert('ผิดพลาด', 'กรุณาเลือก หน่วยงานที่ใช้สินทรัพย์');
                                    else
                                        frmWithOutAjax('html');
                                },
                            };
            var excelReport = { 
                                text: Ext.GLOBAL_BU_EXCEL_TH,  
                                scale:'small', 
                                id:'rep-excel',
                                iconCls: 'icon-excel' ,  
                                handler:function(){ 
                                    if (Ext.getCmp('s-dc_cost_id').getValue() == "")
                                        Ext.Msg.alert('ผิดพลาด', 'กรุณาเลือก หน่วยงานที่ใช้สินทรัพย์');
                                    else
                                        frmWithOutAjax('excel');
                                },
                            };
            var downloadReport = { 
                                    text: Ext.GLOBAL_BU_DOWNLOAD_TH,  
                                    scale:'small', 
                                    iconCls: 'icon-downloadHTML' , 
                                    handler:function(){
                                         if (Ext.getCmp('s-dc_cost_id').getValue() == "")
                                            Ext.Msg.alert('ผิดพลาด', 'กรุณาเลือก หน่วยงานที่ใช้สินทรัพย์');
                                        else
                                            frmWithOutAjax('downloadHTML');	
                                    },
                                }; 
            return [htmlReport,excelReport,downloadReport];
    };

    var storeAssetGroup = new Ext.data.JsonStore({
            url: 'api/All_AmCombo.php',
            baseParams: {type : 'storeAssetGroup', add_all : 1},
            root: 'data',
            idProperty: 'id',
            totalProperty: 'totalCount',
        fields: [ 'id','c_code', 'c_name', 'c_code_name']
    });
    storeAssetGroup.load({
            callback : function (records, operation, success)
            {
                    if (success)
                    {
                            Ext.getCmp('s-asset_group').setValue('');
                    }
            }
    });

    var storeCost	= new Ext.data.JsonStore({
            autoLoad: true,
            url: 'api/All_AmCombo.php',
            baseParams: {type : 'storeCost', start: 0, limit: 8000},
            root: 'data',
            idProperty: 'id',
            totalProperty: 'totalCount',
        fields: [ 'id','c_code', 'c_name', 'c_code_name']
    });
    
    Ext.PopCostSearch = new Ext.ux.Poplov({ 
		text		: 'กรุณาเลือก',  
		id              : 's-dc_cost_id',	//go to relation	
		iconCls		: 'page_magnify', 
		valueHidden     : 'dc_cost_id', 	//go to hidden
		store		: storeCost,
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
		fieldLabel	: 'หน่วยงานที่ใช้สินทรัพย์',  
	});
 //=====================================================================
 
    var panelForm = {
		region: 'center',
		title: Ext.titleReport,
		xtype: 'panel',
		border: false,
		stripeRows: true,
		loadMask: true,
		items: [{
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
                                                Ext.PopCostSearch.mini   
                                                ,new Ext.form.ComboBox({
                                                    id: "s-asset_group",
                                                    hiddenName : "asset_group",
                                                    fieldLabel: "หมวดสินทรัพย์",
                                                    width: 300,
                                                    mode: "local",
                                                    store: storeAssetGroup,
                                                    valueField: "c_code",
                                                    displayField: "c_code_name",
                                                    triggerAction: "all",
                                                    forceSelection: true,
                                                    selectOnFocus: true,
                                                    typeAhead : false,
                                                    emptyText: "กรุณาเลือก..."
                                                })]
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
