Ext.onReady(function() {
    Ext.QuickTips.init();

    Ext.idRep 	= 'frm-report'; 
    Ext.urlReport	= './api/report/RepAm016.php';  // 
    Ext.titleReport = 'รายงานข้อมูลอาคารและหน่วยงานในอาคาร';
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
	
    var storeBuildingSearch	= new Ext.data.JsonStore({
        autoLoad: true,
        url: 'api/All_AmCombo.php',
        baseParams: {type : 'storeBuilding', add_all: 'ALL'},
        root: 'data',
        idProperty: 'id',
        totalProperty: 'totalCount',
        fields: [ 'id','c_code', 'c_name']
    });

    Ext.PopBuildingSearch = new Ext.ux.Poplov({ 
            text	: 'เลือกทั้งหมด',  
            id		: 's-dc_building_id',	//go to relation	
            iconCls	: 'page_magnify', 
            valueHidden : 'dc_building_id', 	//go to hidden
            store	: storeBuildingSearch,
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
            fieldLabel	: 'กลุ่มอาคาร/สถานที่เอาประกัน',  
    });

    var store_enable	= new Ext.data.JsonStore({
            fields: [ "id", "c_name" ],
            data : [
                    { id : '', c_name : "เลือกทั้งหมด" },
                    { id : Ext.CONF_STATUS_ENABLE, c_name : "ใช้งาน" },
                    { id : Ext.CONF_STATUS_DISABLE, c_name : "ไม่ใช้งาน" }
                   ]
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
						Ext.PopBuildingSearch.mini ,
						new Ext.form.ComboBox({
                                                    id: "s-enable",
                                                    hiddenName : 'i_enable',
                                                    fieldLabel: "สถานะ",
                                                    width: 200,
                                                    mode: "local",
						    store: store_enable,
                                                    value: '',
                                                    valueField: "id",
                                                    displayField: "c_name",
                                                    triggerAction: "all",
                                                    forceSelection: true,
                                                    selectOnFocus: true,
                                                    typeAhead : false,
                                                    emptyText: "กรุณาเลือก...",
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