Ext.onReady(function() {
    Ext.QuickTips.init();

    Ext.idRep       = 'frm-report'; 
    Ext.urlReport   = './api/report/RepAm006.php';  // 
    Ext.titleReport = 'สรุปทะเบียนสินทรัพย์ (ตามหน่วยงาน)';
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
                                },
                            };
            var excelReport = { 
                                text: Ext.GLOBAL_BU_EXCEL_TH,  
                                scale:'small', 
                                id:'rep-excel',
                                iconCls: 'icon-excel' ,  
                                handler:function(){ 
                                        frmWithOutAjax('excel');
                                },
                            };
            var downloadReport = { 
                                    text: Ext.GLOBAL_BU_DOWNLOAD_TH,  
                                    scale:'small', 
                                    iconCls: 'icon-downloadHTML' , 
                                    handler:function(){  
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
                            Ext.getCmp('s-cost_code').setValue('0');
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
	
    var store_expire	= new Ext.data.JsonStore({
            fields: [ "id", "c_name" ],
            data : [
                    { id : '', c_name : "เลือกทั้งหมด" },
                    { id : 1, c_name : "หมดอายุการใช้งานแล้ว" },
                    { id : 2, c_name : "ยังไม่หมดอายุการใช้งาน" }
                   ]
    });

    var store_enable	= new Ext.data.JsonStore({
            fields: [ "id", "c_name" ],
            data : [
                    { id : 1, c_name : "ใช้งาน" },
                    { id : 2, c_name : "ตัดจำหน่ายแล้ว" }
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
                                                        emptyText: "กรุณาเลือก..."
                                                    }),new Ext.form.ComboBox({
                                                        id: "s-cost_code",
                                                        hiddenName : "dc_cost_id",
                                                        fieldLabel: "หน่วยงาน/ศูนย์ต้นทุน",
                                                        width: 450,
                                                        mode: "local",
                                                        store: storeCost,
                                                        valueField: "id",
                                                        displayField: "c_code_name",
                                                        triggerAction: "all",
                                                        forceSelection: true,
                                                        selectOnFocus: true,
                                                        typeAhead : false,
                                                    }),{
                                                    xtype: "compositefield",
                                                    fieldLabel: "เดือน/ปีที่คำนวณค่าเสื่อม",
                                                    msgTarget: "under",
                                                    items: [
                                                    new Ext.form.ComboBox({
                                                        id: "s-i_month",
                                                        hiddenName: "i_month",
                                                        fieldLabel: "เดือน",
                                                        width: 100,
                                                        mode: "local",
                                                        store: store_month,
                                                        value: 1,
                                                        valueField: "id",
                                                        displayField: "c_name",
                                                        triggerAction: "all",
                                                        forceSelection: true,
                                                        selectOnFocus: true,
                                                        typeAhead : false,
                                                        emptyText: "กรุณาเลือก...",
                                                        listeners: {
                                                                "select": function (combo, newValue) {
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
                                                    }),
                                                    { xtype: "displayfield", value: "ปี" },
                                                    new Ext.form.ComboBox({
                                                        id: "s-i_year",
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
                                                        emptyText: "กรุณาเลือก...",
                                                        listeners: {
                                                                "select": function (combo, newValue) {
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
						},new Ext.form.ComboBox({
                                                    id: "s-expire",
                                                    hiddenName : 'i_expire',
                                                    fieldLabel: "สถานะของสินทรัพย์",
                                                    width: 200,
                                                    mode: "local",
						    store: store_expire,
                                                    value: '',
                                                    valueField: "id",
                                                    displayField: "c_name",
                                                    triggerAction: "all",
                                                    forceSelection: true,
                                                    selectOnFocus: true,
                                                    typeAhead : false,
                                                    emptyText: "กรุณาเลือก...",
						}),new Ext.form.ComboBox({
                                                    id: "s-enable",
                                                    hiddenName : 'i_enable',
                                                    fieldLabel: "สถานะรายการ",
                                                    width: 200,
                                                    mode: "local",
						    store: store_enable,
                                                    value: 1,
                                                    valueField: "id",
                                                    displayField: "c_name",
                                                    triggerAction: "all",
                                                    forceSelection: true,
                                                    selectOnFocus: true,
                                                    typeAhead : false,
                                                    emptyText: "กรุณาเลือก...",
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
