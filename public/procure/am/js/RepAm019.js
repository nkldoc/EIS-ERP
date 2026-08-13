Ext.onReady(function() {
    Ext.QuickTips.init();

    Ext.idRep 	= 'frm-report'; 
    Ext.urlReport	= './api/report/RepAm019.php';  // 
    Ext.titleReport = 'รายงานสรุปแจ้งประกันภัยสินทรัพย์ (ตามรายการประกันภัย)';
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
                                                if (Ext.getCmp('s-am_ins_hdr_id').getValue() == '')
                                                    Ext.Msg.alert('ผิดพลาด', 'กรุณาเลือก รหัสรายการประกันภัย');
                                                else
                                                    frmWithOutAjax('html');

                                            },
                                    };
            var excelReport 	= { 
                                            text: Ext.GLOBAL_BU_EXCEL_TH,  
                                            scale:'small', 
                                            id:'rep-excel',
                                            iconCls: 'icon-excel' ,  
                                            handler:function(){ 
                                                if (Ext.getCmp('s-am_ins_hdr_id').getValue() == '')
                                                    Ext.Msg.alert('ผิดพลาด', 'กรุณาเลือก รหัสรายการประกันภัย');
                                                else
                                                    frmWithOutAjax('excel');
                                            },
                                    };
            var downloadReport 	= { 
                                            text: Ext.GLOBAL_BU_DOWNLOAD_TH,  
                                            scale:'small', 
                                            iconCls: 'icon-downloadHTML' , 
                                            handler:function(){  
                                                if (Ext.getCmp('s-am_ins_hdr_id').getValue() == '')
                                                    Ext.Msg.alert('ผิดพลาด', 'กรุณาเลือก รหัสรายการประกันภัย');
                                                else
                                                    frmWithOutAjax('downloadHTML');	
                                            },
                                    }; 
            return [htmlReport,excelReport,downloadReport];
    };
	
    var storeTypeSearch = new Ext.data.JsonStore({
        autoLoad: true,
        url: 'api/All_AmCombo.php',
        baseParams: {type : 'storeAmInsHdr'},
        root: 'data',
        idProperty: 'id',
        totalProperty: 'totalCount',
        fields: [ 'id', 'c_name', 'dc_ins_town_hdr_id', 'i_is_method', 'dc_building_id', 'i_month', 'i_year']
    });

    Ext.PopTypeSearch = new Ext.ux.Poplov({ 
        text            : 'กรุณาเลือก',  
        id		: 's-am_ins_hdr_id',	//go to relation	
        iconCls         : 'page_magnify', 
        valueHidden     : 'am_ins_hdr_id', 	//go to hidden
        isSetFilter     : true,
        store           : storeTypeSearch,
        headerGrid	: [{ header: "ID System", sortable: true, hidden:true, dataIndex: 'id' },
                        { header: "ชื่อ"
                            , sortable: true
                            , id: 'c_name' 
                            , dataIndex: 'c_name',
                            renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                                            metaData.attr = "style='cursor:pointer';";
                                    return value; 
                            } 
                        }],
        isCellClickGrid : true,
        cellClickGrid : function(grid, rowIndex, columnIndex, e) { 

                var record      = grid.getStore().getAt(rowIndex);  
                var TextShow 	= record.data.c_name;

                Ext.getCmp('s-am_ins_hdr_id').setValue(record.data.id);
                Ext.getCmp('s-am_ins_hdr_id_Name').setValue(TextShow); 

                Ext.getCmp('dc_ins_town_hdr_idID').setValue(record.data.dc_ins_town_hdr_id);
                Ext.getCmp('i_is_methodID').setValue(record.data.i_is_method);
                Ext.getCmp('dc_building_idID').setValue(record.data.dc_building_id);
                Ext.getCmp('i_monthID').setValue(record.data.i_month);
                Ext.getCmp('i_yearID').setValue(record.data.i_year);
                
                Ext.getCmp("win-pop-lovs-am_ins_hdr_id").hide();  					
                Ext.getCmp("win-pop-lovs-am_ins_hdr_id").destroy();  

        },
        widthText	: 280,  
        fieldLabel	: 'รหัสรายการประกันภัย',  
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
                                                Ext.PopTypeSearch.mini,
                                                { xtype:'hidden',id:'dc_ins_town_hdr_idID',name:'dc_ins_town_hdr_id' },
                                                { xtype:'hidden',id:'i_is_methodID',name:'i_is_method' },
                                                { xtype:'hidden',id:'dc_building_idID',name:'dc_building_id' },
                                                { xtype:'hidden',id:'i_monthID',name:'i_month' },
                                                { xtype:'hidden',id:'i_yearID',name:'i_year' }
						]
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