Ext.onReady(function() {
    Ext.QuickTips.init();

    Ext.idRep 	= 'frm-report'; 
    Ext.urlReport	= './api/report/RepAmDc003.php';  // 
    Ext.titleReport = 'รายงานการจับคู่บัญชีสินทรัพย์ถาวร';

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
        var excelReport     = { 
                                text: Ext.GLOBAL_BU_EXCEL_TH,  
                                scale:'small', 
                                id:'rep-excel',
                                iconCls: 'icon-excel' ,  
                                handler:function(){ 
                                        frmWithOutAjax('excel');
                                }
                            };
        var downloadReport  = { 
                                text: Ext.GLOBAL_BU_DOWNLOAD_TH,  
                                scale:'small', 
                                iconCls: 'icon-downloadHTML' , 
                                handler:function(){  
                                        frmWithOutAjax('downloadHTML');	
                                }
                            }; 
        return [htmlReport,excelReport,downloadReport];
    };
    
    var store_asset = new Ext.data.JsonStore({ 
        storeId: 'myStoreAssetGroup',
        url: 'api/All_AmCombo.php',
        baseParams: {type : 'storeAssetGroup', add_all : 'ADD'},
        root: 'data',
        idProperty: 'id',
        totalProperty: 'totalCount',
        fields: [ 'no','id', 'c_code', 'c_code_name']
    });
    
    store_asset.load({
    	callback: function (records, operation, success){
            Ext.getCmp('s-asset_code').setValue('');
            Ext.getCmp(Ext.idRep).getEl().unmask();
    	}
    });
    
    var store_status	= new Ext.data.JsonStore({
		fields: [ "id", "c_name" ],
		data : [
		        { id : 0, c_name : "ทั้งหมด" },
		        { id : Ext.STATUS_ENABLE, c_name : "ใช้งาน" },
		        { id : Ext.STATUS_DISABLE, c_name : "ไม่ใช้งาน" }
		       ]
	});
	
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
					items: [{ xtype:'hidden',id:'titleReportID',name:'titleReport',value:Ext.titleReport},
					        { xtype:'hidden',id:'modeID',name:'mode' },
					    new Ext.form.ComboBox({
						id: "s-asset_code",
						hiddenName : 'asset_code',
						fieldLabel: "หมวดสินทรัพย์",
						width: 300,
						mode: "local",
                                                store: store_asset,
						valueField: "c_code",
						displayField: "c_code_name",
						triggerAction: "all",
						forceSelection: true,
						selectOnFocus: true,
						typeAhead : false,
						emptyText: "กรุณาเลือก..."
					}),new Ext.form.ComboBox({
						id: "s-status",
						hiddenName : 'i_status',
						fieldLabel: "สถานะ",
						width: 100,
						mode: "local",
					    store: store_status,
						value: 0,
						valueField: "id",
						displayField: "c_name",
						triggerAction: "all",
						forceSelection: true,
						selectOnFocus: true,
						typeAhead : false,
						emptyText: "กรุณาเลือก...",
						listeners: {
							"change": function (combo, newValue) {
								if (newValue == "") { combo.reset(); }
							},
							beforequery: function(q) {
								if (q.query) {
									var length = q.query.length;
									q.query = new RegExp(Ext.escapeRe(q.query));
									q.query.length = length;
								}
							},
							blur: function() { this.getStore().clearFilter(); }
						}
					})]
				}]
			}],
			buttons: setButtonReport()
		}]
	};
	
	/*====================== CENTER ======================*/
    new Ext.Viewport({
		layout: 'border', 
		items:panelForm,
	});
	
	Ext.getCmp(Ext.idRep).getEl().mask('Please wait...','x-mask-loading');
});