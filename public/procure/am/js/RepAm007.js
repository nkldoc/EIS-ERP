Ext.onReady(function() {
    Ext.QuickTips.init();

    Ext.idRep       = 'frm-report'; 
    Ext.urlReport   = './api/report/RepAm007.php';  // 
    Ext.titleReport = 'รายงานใบรักษาของ';
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

            var htmlReport      = { 
                                        text: Ext.GLOBAL_BU_REPORT_TH,  
                                        scale:'small', 
                                        iconCls: 'icon-html' , 
                                        handler:function(){ 
                                              frmWithOutAjax('html');
                                        }
                                    };
            var excelReport 	= { 
                                        text: Ext.GLOBAL_BU_EXCEL_TH,  
                                        scale:'small', 
                                        id:'rep-excel',
                                        iconCls: 'icon-excel' ,  
                                        handler:function(){ 
                                               frmWithOutAjax('excel');
                                        }
                                    };
            var downloadReport 	= { 
                                        text: Ext.GLOBAL_BU_DOWNLOAD_TH,  
                                        scale:'small', 
                                        iconCls: 'icon-downloadHTML' , 
                                        handler:function(){  
                                               frmWithOutAjax('downloadHTML');	
                                        }
                                    }; 
            //return [htmlReport,excelReport,downloadReport];
            return [htmlReport];
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

    var storeAssetType = new Ext.data.JsonStore({
        url: 'api/All_AmCombo.php',
        root: 'data',
        baseParams: { type: "storeAssetByParent", add_all : 1, codeParent:''},
        idProperty: 'id',
        totalProperty: 'totalCount',
        fields: [ 'id','c_code', 'c_name', 'c_code_name']
    });
    storeAssetType.load({
        callback : function (records, operation, success)
        {
            if (success)
            {
                Ext.getCmp('s-asset_type').setValue('');
            }
        }
    });

    var storeCost	= new Ext.data.JsonStore({
        url: 'api/All_AmCombo.php',
        baseParams: {type : 'storeCost', i_all : 1, start: 0, limit: 8000},
        root: 'data',
        idProperty: 'id',
        totalProperty: 'totalCount',
        fields: [ 'id','c_code', 'c_name', 'c_code_name']
    });

    storeCost.load({
        callback : function (records, operation, success)
        {
            if (success)
            {
                Ext.getCmp('s-dc_cost_id').setValue(0);
            }
        }
    });
	
    var storeSD	= new Ext.data.JsonStore({
        //autoLoad: true,
        url: 'api/All_AmCombo.php',
        baseParams: {type : 'storeSDSearch'
                    , i_all : 1
                    , dc_cost_id: 0},
        root: 'data',
        idProperty: 'id',
        totalProperty: 'totalCount',
        fields: [ 'id','c_code', 'c_name']
    });
    
    Ext.PopSDCode = new Ext.ux.Poplov({ 
        text		: 'ทั้งหมด',  
        id		: 's-sd_code',	//go to relation	
        iconCls		: 'page_magnify', 
        valueHidden     : 'sd_code', 	//go to hidden
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
        fieldLabel	: 'เลขที่นำเข้าสินทรัพย์ ',  
        isCellClickGrid : true,
        cellClickGrid : function(grid, rowIndex, columnIndex, e) { 

                var record 		= grid.getStore().getAt(rowIndex);  
                var TextShow 	= record.data.c_code+' '+record.data.c_name;

                Ext.getCmp('s-sd_code').setValue(record.data.c_code);
                Ext.getCmp('s-sd_code_Name').setValue(TextShow); 

                Ext.getCmp("win-pop-lovs-sd_code").hide();  					
                Ext.getCmp("win-pop-lovs-sd_code").destroy();
        }
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
                                                new Ext.form.ComboBox({
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
                                                    emptyText: "กรุณาเลือก...",
                                                    listeners: {
                                                        select: function(combo, record, index) {

                                                            // Load Inventory Type
                                                            var codeParent = record.data.c_code;
                                                            storeAssetType.setBaseParam("codeParent", codeParent);
                                                            storeAssetType.load({
                                                                    callback : function (records, operation, success)
                                                                    {
                                                                        if (success)
                                                                        {
                                                                                Ext.getCmp('s-asset_type').setValue(storeAssetType.data.items[0].get('c_code'));
                                                                        }
                                                                    }
                                                            });
                                                        }
                                                    }
                                                }),new Ext.form.ComboBox({
                                                    id: "s-asset_type",
                                                    hiddenName : "asset_type",
                                                    fieldLabel: "รายการสินทรัพย์",
                                                    width: 300,
                                                    mode: "local",
                                                    store: storeAssetType,
                                                    valueField: "c_code",
                                                    displayField: "c_code_name",
                                                    triggerAction: "all",
                                                    forceSelection: true,
                                                    selectOnFocus: true,
                                                    typeAhead : false,
                                                    emptyText: "กรุณาเลือก...",
                                                }),new Ext.form.ComboBox({
                                                    id: "s-dc_cost_id",
                                                    hiddenName : "dc_cost_id",
                                                    fieldLabel: "หน่วยงาน",
                                                    width: 450,
                                                    mode: "local",
                                                    store: storeCost,
                                                    valueField: "id",
                                                    displayField: "c_code_name",
                                                    triggerAction: "all",
                                                    forceSelection: true,
                                                    selectOnFocus: true,
                                                    typeAhead : false,
                                                    listeners: {
                                                        select: function(combo, record, index) {
                                                            storeSD.setBaseParam("dc_cost_id", record.data.id);
                                                        }
                                                    }
                                                })
                                                ,Ext.PopSDCode.mini
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