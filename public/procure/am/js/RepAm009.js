Ext.onReady(function() {
    Ext.QuickTips.init();

    Ext.idRep 	= 'frm-report'; 
    Ext.urlReport	= './api/report/RepAm009.php';  // 
    Ext.titleReport = 'รายงานค่าเสื่อมราคา (ตามรายการสินทรัพย์)';
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
                                            if (Ext.getCmp('s-asset_group').getValue() == '')
                                                    Ext.Msg.alert('ผิดพลาด', 'กรุณาเลือก หมวดสินทรัพย์');
                                            else if (Ext.getCmp('s-asset_type').getValue() == '')
                                                    Ext.Msg.alert('ผิดพลาด', 'กรุณาเลือก ประเภทสินทรัพย์');
                                            else if (Ext.getCmp('s-dc_asset_id').getValue() == '')
                                                    Ext.Msg.alert('ผิดพลาด', 'กรุณาเลือก รายการสินทรัพย์');
                                            else
                                                    frmWithOutAjax('html');
                                    },
                                };
        var excelReport     = { 
                                    text: Ext.GLOBAL_BU_EXCEL_TH,  
                                    scale:'small', 
                                    id:'rep-excel',
                                    iconCls: 'icon-excel' ,  
                                    handler:function(){ 
                                            if (Ext.getCmp('s-asset_group').getValue() == '')
                                                    Ext.Msg.alert('ผิดพลาด', 'กรุณาเลือก หมวดสินทรัพย์');
                                            else if (Ext.getCmp('s-asset_type').getValue() == '')
                                                    Ext.Msg.alert('ผิดพลาด', 'กรุณาเลือก ประเภทสินทรัพย์');
                                            else if (Ext.getCmp('s-dc_asset_id').getValue() == '')
                                                    Ext.Msg.alert('ผิดพลาด', 'กรุณาเลือก รายการสินทรัพย์');
                                            else
                                                    frmWithOutAjax('excel');
                                    },
                                };
        var downloadReport  = { 
                                    text: Ext.GLOBAL_BU_DOWNLOAD_TH,  
                                    scale:'small', 
                                    iconCls: 'icon-downloadHTML' , 
                                    handler:function(){  
                                            if (Ext.getCmp('s-asset_group').getValue() == '')
                                                    Ext.Msg.alert('ผิดพลาด', 'กรุณาเลือก หมวดสินทรัพย์');
                                            else if (Ext.getCmp('s-asset_type').getValue() == '')
                                                    Ext.Msg.alert('ผิดพลาด', 'กรุณาเลือก ประเภทสินทรัพย์');
                                            else if (Ext.getCmp('s-dc_asset_id').getValue() == '')
                                                    Ext.Msg.alert('ผิดพลาด', 'กรุณาเลือก รายการสินทรัพย์');
                                            else
                                                    frmWithOutAjax('downloadHTML');	
                                    },
                                }; 
        return [htmlReport,excelReport,downloadReport];
    };
	
	var storeAssetGroup = new Ext.data.JsonStore({
            autoLoad: true,
            url: 'api/All_AmCombo.php',
            baseParams: {type : 'storeAssetGroup'},
            root: 'data',
            idProperty: 'id',
            totalProperty: 'totalCount',
	    fields: [ 'id','c_code', 'c_name', 'c_code_name']
	});
	
	var storeAssetType = new Ext.data.JsonStore({
            url: 'api/All_AmCombo.php',
	    root: 'data',
	    baseParams: { type: "storeAssetByParent", conType : "isType"},
	    idProperty: 'id',
	    totalProperty: 'totalCount',
	    fields: [ 'id','c_code', 'c_name', 'c_code_name']
	});
	
        var storeAsset	= new Ext.data.JsonStore({
            //autoLoad: true,
            url: 'api/All_AmCombo.php',
            baseParams: {type : 'storeDcAsset'
                        , asset_group : ''
                        , asset_type: ''
                        },
            root: 'data',
            idProperty: 'id',
            totalProperty: 'totalCount',
	    fields: [ 'id','c_code', 'c_name']
	});
	
	Ext.PopDcAsset = new Ext.ux.Poplov({ 
		text		: 'กรุณาเลือก...',  
		id		: 's-dc_asset_id',	//go to relation	
		iconCls		: 'page_magnify', 
		valueHidden     : 'dc_asset_id', 	//go to hidden
		store		: storeAsset,
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
		fieldLabel	: 'รายการสินทรัพย์ '
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
                                                                        
                                                                        storeAsset.setBaseParam("asset_group", codeParent);
                                                                        
                                                                        storeAssetType.setBaseParam("codeParent", codeParent);
                                                                        storeAssetType.load({
                                                                                callback : function (records, operation, success)
                                                                                {
                                                                                        if (success)
                                                                                        {
                                                                                            storeAsset.setBaseParam("asset_type", storeAssetType.data.items[0].get('c_code'));
                                                                                            Ext.getCmp('s-asset_type').setValue(storeAssetType.data.items[0].get('c_code'));
                                                                                        }
                                                                                }
                                                                        });
                                                                    }
                                                            }
							}),new Ext.form.ComboBox({
                                                            id: "s-asset_type",
                                                            hiddenName : "asset_type",
                                                            fieldLabel: "ประเภทสินทรัพย์",
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
							}),
                                                        Ext.PopDcAsset.mini]
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