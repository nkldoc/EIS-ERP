Ext.onReady(function() {
    Ext.QuickTips.init();

    Ext.idRep 	= 'frm-report'; 
    Ext.urlReport	= './api/report/RepAm022.php';  // 
    Ext.titleReport = 'รายงานบัญชีสินทรัพย์ถาวร';
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

    store_month	= new Ext.data.JsonStore({
            fields: [ "id", "c_name" ],
            data : [
                    { id : "01", c_name : "มกราคม" },
                    { id : "02", c_name : "กุมภาพันธ์" },
                    { id : "03", c_name : "มีนาคม" },
                    { id : "04", c_name : "เมษายน" },
                    { id : "05", c_name : "พฤษภาคม" },
                    { id : "06", c_name : "มิถุนายน" },
                    { id : "07", c_name : "กรกฎาคม" },
                    { id : "08", c_name : "สิงหาคม" },
                    { id : "09", c_name : "กันยายน" },
                    { id : "10", c_name : "ตุลาคม" },
                    { id : "11", c_name : "พฤศจิกายน" },
                    { id : "12", c_name : "ธันวาคม" }
                   ]
    });
	
    // storeYear
    var years = [];
    var currentTime = new Date();
    var now = currentTime.getFullYear()+2;
    var yy_en = currentTime.getFullYear()-10;
    while(yy_en <= now) {
        years.push({ id : yy_en, c_name : yy_en + 543 });
        yy_en++;
    };

    store_year = new Ext.data.JsonStore({
            fields: ["id", "c_name"],
            data : years
    });
	
    var panelForm	= new Ext.Panel ({
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
					items: [{ xtype:'hidden',id:'titleReportID',name:'titleReport',value:Ext.titleReport}
						, { xtype:'hidden',id:'modeID',name:'mode' },
                                               new Ext.form.ComboBox({
                                                        id: "s-cost_code1",
                                                        hiddenName : "cost_code1",
                                                        fieldLabel: "หน่วยงาน",
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
                                                        fieldLabel: "ถึงหน่วยงาน",
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
						}),{
							xtype: "compositefield",
							fieldLabel: "เดือน/ปี",
							msgTarget: "under",
							items: [new Ext.form.ComboBox({
								id: "s-month",
								hiddenName: "i_month",
								fieldLabel: "เดือน",
								width: 100,
								mode: "local",
								store: store_month,
								value: (new Date().getMonth()+1),
								valueField: "id",
								displayField: "c_name",
								triggerAction: "all",
								forceSelection: true,
								selectOnFocus: true,
								typeAhead : false,
								emptyText: "กรุณาเลือก..."
							}),
							{ xtype: "displayfield", value: "ปี" },
							new Ext.form.ComboBox({
								id: "s-year",
								hiddenName: "i_year",
								fieldLabel: "ปี",
								width: 100,
								mode: "local",
                                                                store: store_year,
								value: new Date().getFullYear(),
								valueField: "id",
								displayField: "c_name",
								triggerAction: "all",
								forceSelection: true,
								selectOnFocus: true,
								typeAhead : false,
								emptyText: "กรุณาเลือก..."
							})]
						},
                                                {
                                                    fieldLabel: 'การแสดงรายการ',
                                                    xtype: 'radiogroup',
                                                    columns: [160,170,120],
                                                    items: [
                                                        { boxLabel: 'คิดค่าเสื่อมราคาในเดือน', name: 'i_process_depre', inputValue: '1' },
                                                        { boxLabel: 'ไม่คิดค่าเสื่อมราคาแล้ว', name: 'i_process_depre', inputValue: '2' },
                                                        { boxLabel: 'เลือกทั้งหมด', name: 'i_process_depre', inputValue: '0' , checked: true},
                                                    ]
                                                }]
				}]
			}],
			buttonAlign: "left",
			buttons: setButtonReport()
		}]
	});
    
	/*====================== RENDER ======================*/
	new Ext.Viewport({
		layout: 'border', 
		items:panelForm,
	});
});