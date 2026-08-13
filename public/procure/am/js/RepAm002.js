Ext.onReady(function() {
	Ext.QuickTips.init();
	
	Ext.idRep 	= 'frm-report'; 
	Ext.urlReport	= './api/report/RepAm002.php';  // 
	Ext.titleReport = 'รายงานสินทรัพย์ถาวรที่รอขึ้นทะเบียนสินทรัพย์ ';
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
                                                if (Ext.getCmp('s-asset_group').getValue() == '')
                                                        Ext.Msg.alert('ผิดพลาด', 'กรุณาเลือก หมวดสินทรัพย์');
                                                else if (Ext.getCmp('s-asset_type').getValue() == '')
                                                        Ext.Msg.alert('ผิดพลาด', 'กรุณาเลือก ประเภทสินทรัพย์');
                                                else
                                                frmWithOutAjax('html');
                                            }
					};
		var excelReport 	= { 
                                            text: Ext.GLOBAL_BU_EXCEL_TH,  
                                            scale:'small', 
                                            id:'rep-excel',
                                            iconCls: 'icon-excel' ,  
                                            handler:function(){ 
                                                if (Ext.getCmp('s-asset_group').getValue() == '')
                                                    Ext.Msg.alert('ผิดพลาด', 'กรุณาเลือก หมวดสินทรัพย์');
                                                else if (Ext.getCmp('s-asset_type').getValue() == '')
                                                    Ext.Msg.alert('ผิดพลาด', 'กรุณาเลือก ประเภทสินทรัพย์');
                                                else
                                                    frmWithOutAjax('excel');
                                            }
					};
		var downloadReport 	= { 
                                            text: Ext.GLOBAL_BU_DOWNLOAD_TH,  
                                            scale:'small', 
                                            iconCls: 'icon-downloadHTML' , 
                                            handler:function(){  
                                                if (Ext.getCmp('s-asset_group').getValue() == '')
                                                    Ext.Msg.alert('ผิดพลาด', 'กรุณาเลือก หมวดสินทรัพย์');
                                                else if (Ext.getCmp('s-asset_type').getValue() == '')
                                                    Ext.Msg.alert('ผิดพลาด', 'กรุณาเลือก ประเภทสินทรัพย์');
                                                else
                                                    frmWithOutAjax('downloadHTML');	
                                            }
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
                    Ext.getCmp('s-cost_code1').setValue('');
                    Ext.getCmp('s-cost_code2').setValue('');
                }
            }
	});
	
	var storeMethod	= new Ext.data.JsonStore({
            url: 'api/All_AmCombo.php',
            baseParams: {type : 'storeAssetMethod', add_all : 1, start: 0, limit: 8000},
            root: 'data',
            idProperty: 'id',
            totalProperty: 'totalCount',
	    fields: [ 'id','c_code', 'c_name', 'c_code_name']
	});
	
	storeMethod.load({
            callback : function (records, operation, success)
            {
                if (success)
                {
                    Ext.getCmp('s-dc_asset_method').setValue('');
                }
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
							}),new Ext.form.ComboBox({
								id: "s-cost_code1",
								hiddenName : "cost_code1",
								fieldLabel: "ระหว่างศูนย์ต้นทุนทางบัญชี",
								width: 450,
								mode: "local",
                                                                store: storeCost,
								valueField: "c_code",
								displayField: "c_code_name",
								triggerAction: "all",
								forceSelection: true,
								selectOnFocus: true,
								typeAhead : false,
							}),new Ext.form.ComboBox({
								id: "s-cost_code2",
								hiddenName : "cost_code2",
								fieldLabel: "ถึงศูนย์ต้นทุนทางบัญชี",
								width: 450,
								mode: "local",
                                                                store: storeCost,
								valueField: "c_code",
								displayField: "c_code_name",
								triggerAction: "all",
								forceSelection: true,
								selectOnFocus: true,
								typeAhead : false,
							}),new Ext.form.ComboBox({
								id: "s-dc_asset_method",
								hiddenName : "dc_asset_method_id",
								fieldLabel: "วิธีการได้มา ",
								width: 300,
								mode: "local",
                                                                store: storeMethod,
								valueField: "c_code",
								displayField: "c_code_name",
								triggerAction: "all",
								forceSelection: true,
								selectOnFocus: true,
								typeAhead : false,
							}) ]
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