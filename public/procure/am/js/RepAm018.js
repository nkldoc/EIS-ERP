Ext.onReady(function() {
    Ext.QuickTips.init();

    Ext.idRep 	= 'frm-report'; 
    Ext.urlReport	= './api/report/RepAm018.php';  // 
    Ext.titleReport = 'รายงานสรุปแจ้งประกันภัยสินทรัพย์(ตามรายการสินทรัพย์)';
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
	
    var storeTypeSearch = new Ext.data.JsonStore({
        autoLoad: true,
        url: 'api/All_AmCombo.php',
        baseParams: {type : 'storeInsMethod', add_all: 'ALL'},
        root: 'data',
        idProperty: 'id',
        totalProperty: 'totalCount',
        fields: [ 'id','c_code', 'c_name']
    });

    Ext.PopTypeSearch = new Ext.ux.Poplov({ 
        text            : 'เลือกทั้งหมด',  
        id		: 's-i_is_method',	//go to relation	
        iconCls         : 'page_magnify', 
        valueHidden     : 'i_is_method', 	//go to hidden
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

                var record 		= grid.getStore().getAt(rowIndex);  
                var TextShow 	= record.data.c_name;

                Ext.getCmp('s-i_is_method').setValue(record.data.id);
                Ext.getCmp('s-i_is_method_Name').setValue(TextShow); 

                Ext.getCmp("win-pop-lovs-i_is_method").hide();  					
                Ext.getCmp("win-pop-lovs-i_is_method").destroy();  

        },
        widthText	: 280,  
        fieldLabel	: 'ประเภทการประกันภัย',  
    });
    
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

    var storeInsTownSearch	= new Ext.data.JsonStore({
        autoLoad: true,
        url: 'api/All_AmCombo.php',
        baseParams: {type : 'storeInsTown', add_all: 'ALL'},
        root: 'data',
        idProperty: 'id',
        totalProperty: 'totalCount',
        fields: [ 'id','c_code', 'c_name']
    });

    Ext.PopInsTownSearch = new Ext.ux.Poplov({ 
        text		: 'เลือกทั้งหมด',  
        id		: 's-dc_ins_town_hdr_id',	//go to relation	
        iconCls		: 'page_magnify', 
        valueHidden     : 'dc_ins_town_hdr_id', 	//go to hidden
        isSetFilter     : true,
        store		: storeInsTownSearch,
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

                var record 	= grid.getStore().getAt(rowIndex);  
                var TextShow 	= record.data.c_name;

                Ext.getCmp('s-dc_ins_town_hdr_id').setValue(record.data.id);
                Ext.getCmp('s-dc_ins_town_hdr_id_Name').setValue(TextShow); 

                Ext.getCmp("win-pop-lovs-dc_ins_town_hdr_id").hide();  					
                Ext.getCmp("win-pop-lovs-dc_ins_town_hdr_id").destroy();  

        },
        widthText	: 280,  
        fieldLabel	: 'ชื่ออาคาร',  
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
						Ext.PopBuildingSearch.mini ,
                                                Ext.PopInsTownSearch.mini,
						{
                                                    xtype: "compositefield",
                                                    fieldLabel: "เดือน/ปีที่เริ่มต้นเอาประกันภัย",
                                                    msgTarget: "under",
                                                    items: [
                                                    new Ext.form.ComboBox({
                                                            id: "s-i_start_month",
                                                            hiddenName: "i_start_month",
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
                                                        id: "s-i_start_year",
                                                        hiddenName: "i_start_year",
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