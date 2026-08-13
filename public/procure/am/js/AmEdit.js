function defaultDate(typeStartDate)
{
    var day = new Date();
    var dd = day.getDate();
    var mm = day.getMonth()+1;
    var yy = day.getFullYear()+543;

    if (typeStartDate==1) // วันที่เริ่ม -1 เดือน
    {
        dd = "01";
        mm--;
        mm = "0"+mm.toString();
    }
    else
    {
        dd = "0"+dd.toString();
        mm = "0"+mm.toString();
    }
    return dd.substr(-2)+"-"+mm.substr(-2)+"-"+yy.toString();
}

function checkDtlAll(ele) {
    for(var i=1; i<Ext.dtlChk.length; i++){
        var ind = Ext.dtlChk[i];
        if (ind != '')
        {
            document.getElementById(ind).checked = ele;
        }
    }
}

Ext.onReady(function() {
    Ext.QuickTips.init();
    Ext.objChk = [];
    Ext.dtlChk = [];
    /*===============================================*/
    var title_panel = "แก้ไขสินทรัพย์";
    /*===============================================*/

    var storeMain = new Ext.data.JsonStore({
        storeId: 'myStore',
        autoDestroy: true,
        autoLoad: true,
        url : 'api/ListAmEdit.php',
        root: 'data',
        baseParams: { type: "HDR", i_read:user_right_read }, //Permission i_read
        idProperty: 'id',
        totalProperty: 'totalCount',
        fields: [
                { name: 'no' },
                { name: 'id' },
                { name: 'c_code' },
                { name: 'c_name' },
                { name: 'd_doc' },
                { name: 'd_doc_date' },
                { name: 'str_date' },
                { name: 'c_comment' },
                { name: 'i_enable' },
                { name: 'dc_user_create_id' },
	     	{ name: 'dc_user_create_cost_id' },
	     	{ name: 'd_create' },
	     	{ name: 'dc_user_update_id' },
	     	{ name: 'dc_user_update_cost_id' },
	     	{ name: 'd_update' },
	     	{ name: 'i_show_gen'}
		]
    });
	
    var store_dtl = new Ext.data.JsonStore({
        url : 'api/ListAmEdit.php',
        root: 'data',
        baseParams: { type: "DTL", i_read:user_right_read },
        idProperty: 'id',
        totalProperty: 'totalCount',
        fields: [
                    { name : "no" },
                    { name : "id" },
                    { name : "c_code" },
                    { name : "c_name" },
                    { name : "cost_name" },
                    { name : "str_status" }
        ]
    });
	
    //----------
    var storeCostSearch	= new Ext.data.JsonStore({
        autoLoad: true,
        url: 'api/All_AmCombo.php',
        baseParams: {type : 'storeCost', i_all: 'ALL'},
        root: 'data',
        idProperty: 'id',
        totalProperty: 'totalCount',
        fields: [ 'id','c_code', 'c_name']
    });
	
    var storeAssetMethod = new Ext.data.JsonStore({
        autoLoad: true,
        url: 'api/All_AmCombo.php',
        baseParams: {type : 'storeAssetMethod'},
        root: 'data',
        idProperty: 'id',
        totalProperty: 'totalCount',
        fields: [ 'id','c_code', 'c_name']
    });
	
    var storeAssetIns = new Ext.data.JsonStore({
        autoLoad: true,
        url: 'api/All_AmCombo.php',
        baseParams: {type : 'storeAssetInsurance'},
        root: 'data',
        idProperty: 'id',
        totalProperty: 'totalCount',
        fields: [ 'id','c_code', 'c_name']
    });
    //----------
    // pagingBar
    var pagingBar = new Ext.PagingToolbar({
            pageSize: 20,
            store: storeMain,
            displayInfo: true,
            displayMsg: 'Displaying topics {0} - {1} of {2}'
    });
	
    // Search Group
    var gridMain = new Ext.grid.GridPanel({
            region: "center",
            layout: "fit",
            title: "แสดงรายการ"+title_panel,
            id: "tabpanel1",
            border: false,
            stripeRows: true,
            loadMask: true,
            store: storeMain,
            viewConfig : {
                    emptyText: "ไม่มีข้อมูล..",
                    deferEmptyText: false
            },
            tbar: [{	
                text : 'เพิ่มข้อมูล',
                id:'buAdd',
                iconCls: 'icon-add', 
                disabled:user_right_add?false:true,
                handler: function(grid, rowIndex, colIndex) {
                    Ext.getCmp("tabpanel2").setDisabled(false);
                    Ext.getCmp("contenterCenter").setActiveTab("tabpanel2");
                    Ext.getCmp("form-widgets").getForm().reset();
                    Ext.getCmp("role-form-mode").setValue("ADD");

                    Ext.getCmp('icon-save').show();
                    Ext.getCmp('GRID_DTL').hide();
                    //buGencode
                    Ext.getCmp('buGencodeID').hide();

                    Ext.getCmp("frm-d_doc_date").setValue(addY(543));
                    Ext.getCmp('frm-c_code').setValue('EDI');
                }
        },{
            xtype : 'tbfill'  
        },'  ', ' ', '-', "วันที่ตามเอกสาร ", "-"
        ,{
            xtype: 'datefield', 
            id: 's_d_beginID', 
            name: 's_d_begin', 
            width:140,
            value:defaultDate(1),
            emptyText : "วันที่เริ่ม",
        }, " ", " ถึง "
        ,{
                xtype: 'datefield', 
                id: 's_d_endID', 
                name: 's_d_end', 
                width:140,
                value:defaultDate(2),
                emptyText : "วันที่สิ้นสุด",
        }
        ,' ', '-', {
            text : "ค้นหา",
            iconCls: 'icon-magnifier',
            handler : function() {  
                    storeMain.setBaseParam("mode", "SEARCH");
                    storeMain.setBaseParam("d_begin", Ext.getCmp("s_d_beginID").getValue());
                    storeMain.setBaseParam("d_end", Ext.getCmp("s_d_endID").getValue());
                    Ext.getCmp('tabpanel1').getStore().load();
            }
        } ,' ', '-'],
        columns: [
            new Ext.grid.RowNumberer({header:"ที่", width: 30,
                    renderer: function(value, metaData, record, row, col, store, gridView) {
                        return record.get("no");
                    }
                }),
            { header: "รหัส", sortable: true, width:100, dataIndex: "c_code", align:'center' },
            { header: "ชื่อรายการ", sortable: true, width: 250, dataIndex: "c_name" , id:'G-c_name'},
            { header: "เลขที่เอกสาร", sortable: true, width:100, dataIndex: "d_doc", align:'center' },
            { header: "วันที่ตามเอกสาร", sortable: true, dataIndex: "str_date", align:'center' }
        ],
        autoExpandColumn: "G-c_name",
        bbar: pagingBar
    }); //gridMain

    function cellClick(grid, rowIndex, columnIndex, e) {
        var record = grid.getStore().getAt(rowIndex); 

        if (columnIndex == grid.getColumnModel().getIndexById('edit')) {
			
            if(record.get('c_code')== 'EDI'){
                Ext.getCmp('icon-save').show();
                Ext.getCmp('tabpanel2').setDisabled(false);
                Ext.getCmp('contenterCenter').setActiveTab('tabpanel2');
                Ext.getCmp('form-widgets').getForm().reset();
                Ext.getCmp("form-widgets").getForm().loadRecord(record);

                if(record.get('c_code')== 'EDI')
                {
                    Ext.getCmp("role-form-mode").setValue("EDIT");
                    //buGencode
                    if (record.get('i_show_gen') == '1')
                            Ext.getCmp('buGencodeID').show();
                    else
                            Ext.getCmp('buGencodeID').hide();

                    Ext.getCmp('buAddDtl').show();
                    Ext.getCmp('buDelDtl').show();
                }
                else
                {
                    Ext.getCmp("role-form-mode").setValue("VIEW");
                    //button
                    Ext.getCmp('icon-save').hide();
                    Ext.getCmp('buGencodeID').hide();
                    Ext.getCmp('buAddDtl').hide();
                    Ext.getCmp('buDelDtl').hide();
                }

                Ext.getCmp('GRID_DTL').show();

                // Load Method
                store_dtl.setBaseParam("am_edit_hdr_id", record.data.id);
                store_dtl.setBaseParam("type", "DTL");
                store_dtl.load();
            }
        } else if (columnIndex==grid.getColumnModel().getIndexById('view')) {
            Ext.getCmp('icon-save').hide();
            Ext.getCmp('tabpanel2').setDisabled(false);
            Ext.getCmp('contenterCenter').setActiveTab('tabpanel2');
            Ext.getCmp('form-widgets').getForm().reset();
            Ext.getCmp("form-widgets").getForm().loadRecord(record);
            Ext.getCmp("role-form-mode").setValue("VIEW");

            //buGencode
            Ext.getCmp('buGencodeID').hide();
            Ext.getCmp('GRID_DTL').show();

            Ext.getCmp('buAddDtl').hide();
            Ext.getCmp('buDelDtl').hide();
			
            // Load Method
            store_dtl.setBaseParam("am_edit_hdr_id", record.data.id);
            store_dtl.setBaseParam("type", "DTL");
            store_dtl.load();
			
        } else if (columnIndex == grid.getColumnModel().getIndexById('remove')) {
            if(record.get('c_code')== 'EDI'){
                var win = new Ext.Window({
                    id : "win-msg-delete",
                    title : "Remove",
                    modal: true,
                    width : 250,
                    height : 130,
                    html: "ท่านต้องการที่จะลบข้อมูล ?",
                    buttons : [{
                        text : "Confirm",
                        handler : function() {
                            Ext.Ajax.request({
                                url : 'api/mnAmEdit.php' ,
                                method: 'POST',
                                params : { 
                                    mode : 'DELETE', 
                                    id : record.data.id
                                },
                                success: function ( result, request ) {
                                    var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
                                    if (jsonData.success) {
                                            //Ext.MessageBox.alert('Success', jsonData.msg);		// alert massage success
                                    } else {
                                            Ext.MessageBox.alert('Failed', jsonData.msg);			// alert massage error
                                    }
                                    Ext.getCmp("win-msg-delete").hide();						// hidden window-panel
                                    Ext.getCmp("win-msg-delete").destroy();						// clear memory :: garbage collection
                                    storeMain.reload();
                                    Ext.getCmp('tabpanel2').setDisabled(true);
                                },
                                failure: function ( result, request) { 
                                        Ext.MessageBox.alert('Failed', result.responseText);		// connect error
                                }
                            });
                        }
                    },{
                        text : "Cancel",
                        handler : function() {
                                Ext.getCmp("win-msg-delete").hide();
                                Ext.getCmp("win-msg-delete").destroy();
                        }				
                    }]
                }).show();
            }
        }
    };
	
    //=========================================================================================//
    function popFrmDtl(hdr_id){
        var frmDtl = new Ext.Window({
            id : "frmd",
            xtype: 'form',
            title : "ข้อมูลรายละเอียดสินทรัพย์",
            modal: true,
            border: false,
            autoScroll: true,
            maximizable: true,
            frame:true,
            height: (Ext.getBody().getViewSize().height*0.8),
            width: (Ext.getBody().getViewSize().width*0.8), 		//80% *0.8
            listeners: {
                    "minimize": function (window, opts) { //when property minimizable
                        window.collapse();
                        window.setWidth(200);
                        window.alignTo(Ext.getBody(), 'bl-bl')
                    }
            }, 
            items: [{
                xtype: 'form',
                defaults: { allowBlank: true},
                labelWidth : 200,
                bodyStyle: 'padding: 10px;',
                items: [{
                    id: "frmd-mode",
                    xtype: "hidden",
                    name : "mode" ,
                    value : "EDIT_DTL",
                    readOnly: true
                }, {
                    xtype: "hidden",
                    id: "frmd-hdr_id",
                    value : hdr_id,
                    readOnly: true
                }, {
                    xtype: "hidden",
                    id: "frmd-id",
                    readOnly: true
                }, {
                    xtype: "hidden",
                    id: "frmd-am_tran_rg_dtl_id",
                    name : "am_tran_rg_dtl_id",
                    readOnly: true
                },{
                    fieldLabel: 'รหัสสินทรัพย์',
                    xtype: 'radiogroup', 
                    id:'pop_dc_asset_id',
                    columns: [0,200,40], 
                    items: [{
                        xtype	: 'hidden', 
                        name 	: 'dc_asset_id', 
                        id		: 'ls-dc_asset_id' ,
                        value	: ''
                    },{	
                        xtype    : 'textfield', 
                        name     :  'txtls-dc_asset_id', 
                        emptyText: this.text,
                        id		 : 'ls-dc_asset_id_Name',
                        readOnly : true
                    },{
                        xtype	: 'button', 
                        id		: 'Buls-dc_asset_id', 
                        name	: 'Buls-dc_asset_id',  
                        iconCls	: this.iconCls,
                        handler	: function() {
                                var win = popFrmListAsset(hdr_id);
                                win.show(); 
                            Ext.getCmp('grid_asset').on('cellclick', cellClick_ListAsset, this);	
                        } 
                    }]
                },{
                    xtype: 'displayfield', 
                    fieldLabel: 'หมวดสินทรัพย์',
                    id: "frmd-dc_asset_group",
                },{
                    xtype: 'displayfield', 
                    fieldLabel: 'ประเภทสินทรัพย์',
                    id: "frmd-dc_asset_type",
                },{
                    xtype: 'displayfield', 
                    fieldLabel: 'รายการสินทรัพย์',
                    id: "frmd-asset_name",
                },{
                    xtype: 'displayfield', 
                    fieldLabel: 'ใช้ที่หน่วยงาน',
                    id: "frmd-cost_name",
                },{
                    xtype: 'textfield',
                    fieldLabel: 'ชื่อสินทรัพย์',
                    id : "frmd-c_name",
                    width: 500,
                },{
                    xtype: 'textfield',
                    width: 500,
                    fieldLabel: 'จังหวัด',
                    id: "frmd-p_province",
                    hidden : true
                },{
                    xtype: 'textfield',
                    width: 500,
                    fieldLabel: 'จำนวนเนื้อที่',
                    id : "frmd-p_area",
                    hidden : true
                },{
                    xtype: 'textfield',
                    width: 500,
                    fieldLabel: 'เลขที่โฉนด',
                    id : "frmd-p_deed",
                    hidden : true
                },{
                    xtype: 'textfield',
                    width: 500,
                    fieldLabel: 'เลขที่ นส.3ก',
                    id : "frmd-p_num_area",
                    hidden : true
                },{
                    xtype: 'textfield',
                    width: 500,
                    fieldLabel: 'ยี่ห้อ',
                    id : "frmd-c_brand"
                },{
                    xtype: 'textfield',
                    width: 500,
                    fieldLabel: 'Serial No',
                    id : "frmd-c_serial"
                },{
                    xtype: 'textfield',
                    width: 500,
                    fieldLabel: 'รุ่น - แบบ',
                    id : "frmd-c_model"
                },{
                    xtype: 'textfield',
                    width: 500,
                    fieldLabel: 'ขนาด',
                    id : "frmd-c_type"
                },{
                    xtype: 'textfield',
                    fieldLabel: 'หมายเลขตัวถัง',
                    id : "frmd-c_number_body",
                    width: 300,
                    hidden : true
                },{
                    xtype: 'textfield',
                    fieldLabel: 'หมายเลขแซทซี',
                    id : "frmd-c_number_mech",
                    width: 300,
                    hidden : true
                },{
                    xtype: 'textfield',
                    fieldLabel: 'ทะเบียนรถ',
                    id : "frmd-c_car_license",
                    width: 300,
                    hidden : true
                },{
                    xtype: 'textfield',
                    width: 500,
                    fieldLabel: 'หมายเลขสินทรัพย์',
                    id : "frmd-c_asset_code_old"
                },{
                    xtype: 'textfield',
                    fieldLabel: 'ราคาทุน',
                    id : "frmd-c_cost_asset",
                    width: 150,
                    disabled: true
                },{
                    xtype: 'textfield',
                    fieldLabel: 'มูลค่าซาก',
                    id : "frmd-c_cost_ruins",
                    width: 150,
                    disabled: true
                },{
                    xtype: 'textfield',
                    fieldLabel: 'อายุการใช้งาน(ปี)',
                    id : "frmd-i_period_year",
                    width: 150,
                    disabled: true
                },{
                    xtype: 'textfield',
                    fieldLabel: 'ค่าเสื่อมราคาสะสมยกมา',
                    id : "frmd-f_depreciate",
                    width: 150,
                    disabled: true
                }, {
                    xtype: "datefield",
                    id: "frmd-d_receive_date",
                    name: "d_receive_date",
                    fieldLabel: "วันที่ได้มา",
                    value : addY(543),
                    width: 150
                }, {
                    xtype: "datefield",
                    id: "frmd-d_register_date",
                    name: "d_register_date",
                    fieldLabel: "วันที่ขึ้นทะเบียน/วันที่เริ่มใช้สินทรัพย์",
                    value : addY(543),
                    width: 150
                }, {
                    xtype: "datefield",
                    id: "frmd-d_start_warranty",
                    name: "d_start_warranty",
                    fieldLabel: "วันที่เริ่มการรับประกันคุณภาพ",
                    value : addY(543),
                    width: 150
                }, {
                    xtype: "datefield",
                    id: "frmd-d_end_warranty",
                    name: "d_end_warranty",
                    fieldLabel: "วันที่สิ้นสุดการรับประกันคุณภาพ",
                    value : addY(543),
                    width: 150
                },new Ext.form.ComboBox({
                    id: "frmd-dc_asset_method_id",
                    fieldLabel: "วิธีการได้มา",
                    width: 300,
                    mode: "local",
                    store: storeAssetMethod,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead : false,
                    value: "",
                }),{
                    xtype: 'radiogroup',
                    fieldLabel: 'การทำประกันภัย',
                    id: "frmd-ins_is_method",
                    columns: [ 100, 100, 100],
                    items: [
                            { boxLabel: "ส่งทำประกันภัย", name: "ins_is_method", inputValue: 1 },
                            { boxLabel: "ไม่ทำประกันภัย", name: "ins_is_method", inputValue: 0, checked: true },
                            { boxLabel: "อื่นๆ", name: "ins_is_method", inputValue: 2}
                    ],
                    listeners: {
                        Change: function(value) {
                            if (this.getValue().inputValue == 1)
                                    Ext.getCmp('frmd-i_is_ins').show();
                            else
                                    Ext.getCmp('frmd-i_is_ins').hide();
                        }
                    }
                },new Ext.form.ComboBox({
                    id: "frmd-i_is_ins",
                    fieldLabel: "หมวดการประกันภัย",
                    width: 300,
                    mode: "local",
                    store: storeAssetIns,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead : false,
                    value: ""
                }),{
                    xtype: 'displayfield', 
                    fieldLabel: 'สถานะการลงบัญชีค่าเสื่อมราคา',
                    id: "frmd-acc_status",
                },{
                    xtype: 'textarea',
                    fieldLabel : 'หมายเหตุ',
                    id : "frmd-c_comment",
                    width:500
                }]
            }],
            buttonAlign: 'left',
            buttons : [{
                text : Ext.GLOBAL_BU_SAVE_TH,
                iconCls	: 'icon-save',
                handler: function(){	
                    var mode = Ext.getCmp("frmd-mode").getValue();

                    var am_tran_rg_dtl_id = Ext.getCmp("frmd-am_tran_rg_dtl_id").getValue();
                    var dc_asset_id = Ext.getCmp("ls-dc_asset_id").getValue();
                    var c_name = Ext.getCmp('frmd-c_name').getValue();

                    var p_province = Ext.getCmp('frmd-p_province').getValue();
                    var p_area = Ext.getCmp('frmd-p_area').getValue();
                    var p_deed = Ext.getCmp('frmd-p_deed').getValue();
                    var p_num_area = Ext.getCmp('frmd-p_num_area').getValue();
                    var c_brand = Ext.getCmp('frmd-c_brand').getValue();
                    var c_serial = Ext.getCmp('frmd-c_serial').getValue();
                    var c_model = Ext.getCmp('frmd-c_model').getValue();
                    var c_type = Ext.getCmp('frmd-c_type').getValue();
                    var c_number_body = Ext.getCmp('frmd-c_number_body').getValue();
                    var c_number_mech = Ext.getCmp('frmd-c_number_mech').getValue();
                    var c_car_license = Ext.getCmp('frmd-c_car_license').getValue();
                    var c_asset_code_old = Ext.getCmp('frmd-c_asset_code_old').getValue();
                    var c_cost_asset = Ext.getCmp('frmd-c_cost_asset').getValue();
                    var c_cost_ruins = Ext.getCmp('frmd-c_cost_ruins').getValue();
                    var i_period_year = Ext.getCmp('frmd-i_period_year').getValue();
                    var f_depreciate = Ext.getCmp('frmd-f_depreciate').getValue();
                    var d_receive_date = Ext.getCmp('frmd-d_receive_date').getValue();
                    var d_register_date = Ext.getCmp('frmd-d_register_date').getValue();
                    var d_start_warranty = Ext.getCmp('frmd-d_start_warranty').getValue();
                    var d_end_warranty = Ext.getCmp('frmd-d_end_warranty').getValue();
                    var dc_asset_method_id = Ext.getCmp('frmd-dc_asset_method_id').getValue();
                    var ins_is_method = Ext.getCmp('frmd-ins_is_method').getValue().inputValue;
                    var i_is_ins = Ext.getCmp('frmd-i_is_ins').getValue();
                    var c_comment = Ext.getCmp('frmd-c_comment').getValue();

                    Ext.Ajax.request({
                        url : 'api/mnAmEdit.php' ,
                        method: 'POST',
                        params : { 
                            mode : mode,
                            am_edit_hdr_id : hdr_id,
                            am_tran_rg_dtl_id : am_tran_rg_dtl_id,
                            dc_asset_id : dc_asset_id,
                            c_name : c_name,
                            p_province : p_province	,
                            p_area : p_area	,
                            p_deed : p_deed	,
                            p_num_area : p_num_area	,
                            c_brand : c_brand	,
                            c_serial : c_serial	,
                            c_model : c_model	,
                            c_type : c_type	,
                            c_number_body : c_number_body,
                            c_number_mech : c_number_mech,
                            c_car_license : c_car_license,
                            c_asset_code_old : c_asset_code_old	,
                            c_cost_asset : c_cost_asset	,
                            c_cost_ruins : c_cost_ruins	,
                            i_period_year : i_period_year	,
                            f_depreciate : f_depreciate	,
                            d_receive_date : d_receive_date	,
                            d_register_date : d_register_date	,
                            d_start_warranty : d_start_warranty	,
                            d_end_warranty : d_end_warranty	,
                            dc_asset_method_id : dc_asset_method_id	,
                            ins_is_method : ins_is_method	,
                            i_is_ins : i_is_ins	,
                            c_comment : c_comment
                        },
                        success: function ( result, request ) {
                            var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
                            if (jsonData.success) {
                                //Ext.MessageBox.alert('Success', jsonData.msg);		// alert massage success

                                Ext.getCmp('grid_dtl').getStore().load();

                            Ext.getCmp("frmd").hide();
                                Ext.getCmp("frmd").destroy();
                            } else {
                                Ext.MessageBox.alert('Failed', jsonData.msg);			// alert massage error
                            }
                        },
                        failure: function ( result, request) { 
                            Ext.MessageBox.alert('Failed', result.responseText);		// connect error
                        }
                    });

                } //End Handle
            }, {
                text : Ext.GLOBAL_BU_BACK_TH,
                handler : function() {
                    Ext.getCmp("frmd").hide();
                    Ext.getCmp("frmd").destroy();
                }				
            }]
        });
        return frmDtl;
    }; //EndFunction popDtl

    function popFrmListAsset(hdr_id){	
        var storeListAsset = new Ext.data.JsonStore({
            autoLoad: true,
            url : 'api/ListAmEdit.php',
            root: 'data',
            baseParams: { type: "LIST_ASSET"
                        , am_edit_hdr_id : hdr_id
                        , i_read:user_right_read },
            idProperty: 'id',
            totalProperty: 'totalCount',
            fields: [
                    { name : "no" },
                    { name : "id" },
                    { name : "am_tran_rg_dtl_id"},
                    { name : "dc_cost_id" },
                    { name : "c_code" },
                    { name : "cost_name" },
                    { name : "c_name" },
                    { name : "p_province" },
                    { name : "p_area" },
                    { name : "p_deed" },
                    { name : "p_num_area" },
                    { name : "c_brand" },
                    { name : "c_serial" },
                    { name : "c_model" },
                    { name : "c_type" },
                    { name : "c_number_body" },
                    { name : "c_number_mech" },
                    { name : "c_car_license" },
                    { name : "c_asset_code_old" },
                    { name : "c_cost_asset" },
                    { name : "c_cost_ruins" },
                    { name : "i_period_year" },
                    { name : "f_depreciate" },
                    { name : "d_receive_date" },
                    { name : "str_receive_date" },
                    { name : "d_register_date" },
                    { name : "str_register_date" },
                    { name : "d_start_warranty" },
                    { name : "str_s_warranty_date" },
                    { name : "d_end_warranty" },
                    { name : "str_e_warranty_date" },
                    { name : "dc_asset_method_id" },
                    { name : "ins_is_method" },
                    { name : "i_is_ins" },
                    { name : "c_comment" },
                    { name : "sd_code" },
                    { name : "i_enable" },
                    { name : "asset_type" },
                    { name : "dc_asset_group" },
                    { name : "dc_asset_type" },
                    { name : "asset_name" },
                    { name : "acc_status" }
                ]
        });
		
        // pagingBar
        var pagingBarListAsset = new Ext.PagingToolbar({
            pageSize: 20,
            store: storeListAsset,
            displayInfo: true,
            displayMsg: 'Displaying topics {0} - {1} of {2}'
        });
		
        // UI Search

        Ext.PopCostSearch = new Ext.ux.Poplov({ 
            text	: 'เลือกทั้งหมด',  
            id		: 'ls-dc_cost_id',	//go to relation	
            iconCls	: 'page_magnify', 
            valueHidden : 'dc_cost_id', 	//go to hidden
            store	: storeCostSearch,
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
            fieldLabel	: 'หน่วยงานเจ้าของสินทรัพย์',  
        });
		
        var searchGroup= [{
            xtype: 'displayfield', 
            value: 'เลขที่นำเข้า   : ' , 
            cls: 'ui-label',  	        	
        },{			
            id : "ls-sd_code",
            xtype : "textfield", 
            fieldLabel : "fieldLabel",
            width:250
            //listeners: Ext.enterSubmit,
        },{
            xtype: 'displayfield', 
            value: 'รหัสสินทรัพย์   : ' , 
            cls: 'ui-label',  	        	
        },{			
            id : "ls-c_code",
            xtype : "textfield", 
            fieldLabel : "fieldLabel",
            width:250
            //listeners: Ext.enterSubmit,
        },{
            xtype: 'displayfield', 
            value: 'ชื่อสินทรัพย์   : ' , 
            cls: 'ui-label',  	        	
        },{			
            id : "ls-c_name",
            xtype : "textfield", 
            fieldLabel : "fieldLabel",
            width:250
            //listeners: Ext.enterSubmit,
        },{
            xtype: 'displayfield', 
            value: 'หน่วยงาน   : ' , 
            cls: 'ui-label',  	        	
        },Ext.PopCostSearch.mini];
		
        var frmListAsset = new Ext.Window({
            id : "frmListAsset",
            xtype: 'form',
            title : "รายการสินทรัพย์",
            modal: true,
            border: false,
            autoScroll: true,
            maximizable: true,
            frame:true,
            height: (Ext.getBody().getViewSize().height*0.8),
            width: (Ext.getBody().getViewSize().width*0.8), 		//80% *0.8
            listeners: {
                "minimize": function (window, opts) { //when property minimizable
                    window.collapse();
                    window.setWidth(200);
                    window.alignTo(Ext.getBody(), 'bl-bl')
                }
            }, 
            items: [{
                xtype: 'grid',
                region:'center',
                id:'grid_asset',
                height:(Ext.getBody().getViewSize().height*0.65), //400,
                width:'100%',
                defaults:{autoScroll:true},
                border: false,
                stripeRows: true,
                loadMask: true,
                store: storeListAsset,
                tbar: [{
                    xtype: 'buttongroup',
                    columns: 2, 
                    title: '&nbsp;', 
                    items: [searchGroup], 
                    buttonAlign:'left',
                    buttons:[{ 
                        text : "ค้นหา",
                        align:'center',
                        iconCls: 'icon-magnifier', 
                        handler : function() {
									
                            storeListAsset.setBaseParam("mode", "SEARCH");
                            storeListAsset.setBaseParam("sd_code", Ext.getCmp("ls-sd_code").getValue());
                            storeListAsset.setBaseParam("c_code", Ext.getCmp("ls-c_code").getValue());
                            storeListAsset.setBaseParam("c_name", Ext.getCmp("ls-c_name").getValue());
                            storeListAsset.setBaseParam("dc_cost_id", Ext.getCmp("ls-dc_cost_id").getValue());
                            storeListAsset.load();
                        }
                    },{
                        text: "เริ่มใหม่",
                        align: 'center',
                        iconCls: 'icon-reset',
                        handler: function() {
                            Ext.getCmp("ls-sd_code").setValue('');
                            Ext.getCmp("ls-c_code").setValue('');
                            Ext.getCmp("ls-c_name").setValue('');
                            Ext.PopCostSearch.setReset(true);
                        }
                    }]
                }],
                columns:[
                    new Ext.grid.RowNumberer({header:"ที่", width: 30,
                        renderer: function(value, metaData, record, row, col, store, gridView) {
                            return record.get("no");
                        }
                    }),
                    {header: 'เลขที่นำเข้าสินทรัพย์ ', sortable: true, dataIndex: 'sd_code', align: "center", width:180 },
                    {header: 'รหัสสินทรัพย์', sortable: true, dataIndex: 'c_code', align: "center", width:180 },
                    {header: 'ชื่อสินทรัพย์', sortable: true, dataIndex: 'c_name', id : 'gl-c_name' },
                    {header: 'ชื่อสินทรัพย์', sortable: true, dataIndex: 'cost_name'},
                    {header: 'สถานะ', sortable: true, dataIndex: 'i_enable', width:100 , 
                        renderer: function(value, metaData, record, row, col, store, gridView) {
                            if (parseInt(value) == Ext.CONF_STATUS_ENABLE)
                                return 'ใช้งาน';
                            else
                                return 'ไม่ใช้งาน';
                        }  
                    },{header: '', width:50, 
                        renderer: function(value, metaData, record, row, col, store, gridView) {
                            return '';
                        }
                    }],
                autoExpandColumn: "gl-c_name",
                viewConfig: {
                    getRowClass: function(record, index, rowParams, ds) {
                        rowParams.tstyle = 'width:' + this.getTotalWidth() + ';';
                        var bgColor = '#eee; !important';
                        var fgColor = 'blue';

                        if(!record.get('no')){
                            rowParams.tstyle += "background-color:" + bgColor + ';';
                            rowParams.tstyle += "color:" + fgColor + ';';
                        }

                    }
                }
            }],
            buttonAlign: 'left',
            bbar: pagingBarListAsset,
            buttons : [{
                text : Ext.GLOBAL_BU_BACK_TH,
                handler : function() {
                    Ext.getCmp("frmListAsset").hide();
                    Ext.getCmp("frmListAsset").destroy();
                }				
            }]
        });
        return frmListAsset;
    }; //EndFunction popFrmListAsset
				
    function cellClick_ListAsset(grid, rowIndex, columnIndex, e) {
        var record = grid.getStore().getAt(rowIndex); 
        Ext.getCmp('ls-dc_asset_id').setValue(record.get('id'));
        Ext.getCmp('ls-dc_asset_id_Name').setValue(record.get('c_code'));
        Ext.getCmp('frmd-am_tran_rg_dtl_id').setValue(record.get('am_tran_rg_dtl_id'));
        Ext.getCmp('frmd-dc_asset_group').setValue(record.get('dc_asset_group'));
        Ext.getCmp('frmd-dc_asset_type').setValue(record.get('dc_asset_type'));
        Ext.getCmp('frmd-asset_name').setValue(record.get('asset_name'));
        Ext.getCmp('frmd-cost_name').setValue(record.get('cost_name'));
        Ext.getCmp('frmd-c_name').setValue(record.get('c_name'));
        Ext.getCmp('frmd-p_province').setValue(record.get('p_province'));
        Ext.getCmp('frmd-p_area').setValue(record.get('p_area'));
        Ext.getCmp('frmd-p_deed').setValue(record.get('p_deed'));
        Ext.getCmp('frmd-p_num_area').setValue(record.get('p_num_area'));
        Ext.getCmp('frmd-c_brand').setValue(record.get('c_brand'));
        Ext.getCmp('frmd-c_serial').setValue(record.get('c_serial'));
        Ext.getCmp('frmd-c_model').setValue(record.get('c_model'));
        Ext.getCmp('frmd-c_type').setValue(record.get('c_type'));
        
        Ext.getCmp('frmd-c_number_body').setValue(record.get('c_number_body'));
        Ext.getCmp('frmd-c_number_mech').setValue(record.get('c_number_mech'));
        Ext.getCmp('frmd-c_car_license').setValue(record.get('c_car_license'));
        
        Ext.getCmp('frmd-c_asset_code_old').setValue(record.get('c_asset_code_old'));
        Ext.getCmp('frmd-c_cost_asset').setValue(record.get('c_cost_asset'));
        Ext.getCmp('frmd-c_cost_ruins').setValue(record.get('c_cost_ruins'));
        Ext.getCmp('frmd-i_period_year').setValue(record.get('i_period_year'));
        Ext.getCmp('frmd-f_depreciate').setValue(record.get('f_depreciate'));		
        Ext.getCmp('frmd-d_receive_date').setValue(record.get('d_receive_date'));	
        Ext.getCmp('frmd-d_register_date').setValue(record.get('d_register_date'));	
        Ext.getCmp('frmd-d_start_warranty').setValue(record.get('d_start_warranty'));	
        Ext.getCmp('frmd-d_end_warranty').setValue(record.get('d_end_warranty'));
        Ext.getCmp('frmd-ins_is_method').setValue(record.get('ins_is_method'));
        Ext.getCmp('frmd-c_comment').setValue(record.get('c_comment'));
		
        Ext.getCmp('frmd-dc_asset_method_id').setValue(record.get('dc_asset_method_id'));
        Ext.getCmp('frmd-i_is_ins').setValue(record.get('i_is_ins'));
		
        var str_acc = (parseInt(record.get('acc_status')) == 1)? 'ลงบัญชีค่าเสื่อมราคาแล้ว' : 'ยังไม่ได้ลงบัญชีค่าเสื่อมราคา';
        Ext.getCmp('frmd-acc_status').setValue(str_acc);

        if (parseInt(record.get('acc_status')) == 1)
        {
            Ext.getCmp('frmd-c_cost_asset').disable();
            Ext.getCmp('frmd-c_cost_ruins').disable();
            Ext.getCmp('frmd-i_period_year').disable();
            Ext.getCmp('frmd-f_depreciate').disable();
        }
        else
        {
            Ext.getCmp('frmd-c_cost_asset').enable();
            Ext.getCmp('frmd-c_cost_ruins').enable();
            Ext.getCmp('frmd-i_period_year').enable();
            Ext.getCmp('frmd-f_depreciate').enable();
        }
		
        if (parseInt(record.get('asset_type')) == parseInt(Ext.ASSET_TYPE_LAND)){ // ที่ดิน
            Ext.getCmp('frmd-p_province').show();
            Ext.getCmp('frmd-p_area').show();
            Ext.getCmp('frmd-p_deed').show();
            Ext.getCmp('frmd-p_num_area').show();

            Ext.getCmp('frmd-c_brand').hide();
            Ext.getCmp('frmd-c_serial').hide();
            Ext.getCmp('frmd-c_model').hide();
            Ext.getCmp('frmd-c_type').hide();
            Ext.getCmp('frmd-c_number_body').hide();
            Ext.getCmp('frmd-c_number_mech').hide();
            Ext.getCmp('frmd-c_car_license').hide();
        }else if (parseInt(record.get('asset_type')) == parseInt(Ext.ASSET_TYPE_EQUIP)){ //อาคารและอุปกรณ์
            Ext.getCmp('frmd-p_province').hide();
            Ext.getCmp('frmd-p_area').hide();
            Ext.getCmp('frmd-p_deed').hide();
            Ext.getCmp('frmd-p_num_area').hide();
            Ext.getCmp('frmd-c_number_body').hide();
            Ext.getCmp('frmd-c_number_mech').hide();
            Ext.getCmp('frmd-c_car_license').hide();

            Ext.getCmp('frmd-c_brand').show();
            Ext.getCmp('frmd-c_serial').show();
            Ext.getCmp('frmd-c_model').show();
            Ext.getCmp('frmd-c_type').show();
        }else if (parseInt(record.get('asset_type')) == parseInt(Ext.ASSET_TYPE_VEHICLE)){ //พาหนะ
            Ext.getCmp('frmd-p_province').hide();
            Ext.getCmp('frmd-p_area').hide();
            Ext.getCmp('frmd-p_deed').hide();
            Ext.getCmp('frmd-p_num_area').hide();
            Ext.getCmp('frmd-c_type').hide();

            Ext.getCmp('frmd-c_brand').show();
            Ext.getCmp('frmd-c_serial').show();
            Ext.getCmp('frmd-c_model').show();
            Ext.getCmp('frmd-c_number_body').show();
            Ext.getCmp('frmd-c_number_mech').show();
            Ext.getCmp('frmd-c_car_license').show();
        }
		
        if (parseInt(record.get('ins_is_method')) == 1)
            Ext.getCmp('frmd-i_is_ins').show();
        else
            Ext.getCmp('frmd-i_is_ins').hide();

        Ext.getCmp("frmListAsset").hide();
        Ext.getCmp("frmListAsset").destroy();
    };
	//=========================================================================================//
	
	Ext.dtlChk = [];
	var GRID_DTL = {
		id: "GRID_DTL",
		border: false,
		bodyStyle: { padding: '10px 20px' },
		defaults: { anchor: '100%', msgTarget: 'side', allowBlank: false },
		items: [{
        	xtype: 'form',
        	id: 'form-dtl',
        	url:'api/mnAmEdit.php',
			//frame: true,
        	border: false,
			labelWidth: 200,
			bodyStyle: { padding: '10px 20px' },
			defaults: { anchor: '100%', msgTarget: 'side', allowBlank: false },
			items: [{				
				xtype : "hidden",
				id : 'frmd-id',
				name: "id",
				readOnly: true
			},{				
				xtype : "hidden",
				id : 'frmd-mode',
				name: "mode",
				value: "DELETE_DTL",
				readOnly: true
			},{
				xtype: 'container',
				layout: 'hbox',
				align: 'stretch',
				defaults: { xtype: 'fieldset', flex:1, margins : '0px 3px', autoHeight: true },
				items: [{
					title: 'รายการสินทรัพย์ที่แก้ไข',
					defaults: { anchor: '100%' },
					items: [ new Ext.grid.GridPanel({
						region: 'center',
						id: 'grid_dtl',
						layout:'fit',
						height: 280,
						autohieght: true,
						border: true,
						stripeRows: true,
						loadMask: true,
						store: store_dtl,
						viewConfig : {
							emptyText: "ไม่มีข้อมูล..",
							deferEmptyText: false,
							forceFit: true,
							scrollOffset: 0 // close scrollbar
						},
						tbar: [{
							text : 'เพิ่มข้อมูล',
							id:'buAddDtl',
							iconCls: 'icon-add', 
							handler: function(grid, rowIndex, colIndex) {
								//-------
								var am_edit_hdr_id = Ext.getCmp("frm-id").getValue();
								var frmDtl = popFrmDtl(am_edit_hdr_id);
								frmDtl.show();
							}
						},{
							text : 'ลบรายการ',
							id: "buDelDtl",
							iconCls	: 'icon-del',
							handler: function(){
								var form = Ext.getCmp("form-dtl").getForm();
								
								form.submit({
									waitMsg:'Saving Data...',
									success : function(form, action) { 
										var data = Ext.decode(action.response.responseText);
					        			store_dtl.load();
									},
									failure:  function(form, action) {
										switch (action.failureType) {
											case Ext.form.Action.CLIENT_INVALID:
												Ext.Msg.alert('Failure', 'Form fields may not be submitted with invalid values');
												break;
											case Ext.form.Action.CONNECT_FAILURE:
												Ext.Msg.alert('Failure', 'พลข้อผิดพลาดในการเชื่อต่อเครือข่าย');
												break;
											case Ext.form.Action.SERVER_INVALID:
											   Ext.Msg.alert('Failure', action.result.msg);
										}
									}
								});
							} //End Handle
						}],
						columns: [
						          new Ext.grid.RowNumberer({
	 									header: "<div class='topAlign'><input type='checkbox' id='chkDtlAll' onclick='checkDtlAll(this.checked)'></div>",
	 									sortable: false,
	 									align:'center',
	 									id:'qty',
	 									width:50,
	 									dataIndex:'id' ,
	 									renderer: function(value, metaData, record, row, col, store, gridView) {
	 										Ext.dtlChk[record.get('no')] = 'chk_dtl_'+record.get('id');
		 										
	 										return '<input type="checkbox" id="chk_dtl_'+record.get('id')+'" '
	 										+' value="'+record.get('id')+'" name="chk_dtl[]"/>';
	 									}
	 								}),
							{header: 'รหัสสินทรัพย์', sortable: true, dataIndex: 'c_code', align: "center" },
							{header: 'ชื่อสินทรัพย์', sortable: true, dataIndex: 'c_name'  },
							{header: 'สถานที่ใช้งาน', sortable: true, dataIndex: 'cost_name'  },
							{header: 'สถานะ', sortable: true, dataIndex: 'str_status', align: "center" },
							{header: '', sortable: false, align: "right", width:50, 
								renderer: function(value, metaData, record, row, col, store, gridView) {
										return '';
										}
							},
						],
						columnLines: true,
						//autoExpandColumn: 'c_name'
					}) ]
				}]
			}]
		}]
	};
	
	var panelForm = {
		region: 'center',
		title: 'ข้อมูล'+title_panel,
		xtype: 'panel',
		id: 'tabpanel2',
		border: false,
		disabled: true,
		stripeRows: true,
		loadMask: true,
		store: storeMain,
        items: [{
        	xtype: 'form',
        	id: 'form-widgets',
        	url:'api/mnAmEdit.php',
			frame: true,
			labelWidth: 200,
			bodyStyle: { padding: '10px 20px' },
			defaults: { anchor: '100%', msgTarget: 'side', allowBlank: false },
			items: [{
				xtype: 'container',
				layout: 'hbox',
				align: 'stretch',
				defaults: { xtype: 'fieldset', flex:1, margins : '0px 3px', autoHeight: true },
				items: [{
					title: 'บันทึกข้อมูล '+title_panel,
					defaults: { allowBlank: true },
					items: [{
						id : "role-form-mode",
						xtype : "hidden",
						name : "mode" ,
						value:'ADD',
						readOnly: true				
					}, {				
						xtype : "hidden",
						id : 'frm-id',
						name: "id",
						readOnly: true
					}, {
						xtype: 'displayfield',
						fieldLabel: 'รหัส',
						name : 'c_code',
						id:'frm-c_code',
						cls: 'bgblue',
						value : 'EDI'
					}, {
						xtype: 'textfield',
						fieldLabel: 'เรื่อง',
						name : 'c_name',
						id:'frm-c_name',
						anchor: '60%'
					}, {
						xtype: 'textfield',
						fieldLabel: 'เลขที่เอกสาร',
						name : 'd_doc',
						id:'frm-d_doc',
						anchor: '60%'
					}, {
						xtype: "datefield",
						id: "frm-d_doc_date",
						name: "d_doc_date",
						fieldLabel: "วันที่ตามเอกสาร",
						width: 150,
					}, {
						fieldLabel: 'หมายเหตุ',
						xtype: 'textarea',
						id:'frm-c_comment',
						name:'c_comment',
						anchor: '60%'
					}]
				}]
			}],
			buttonAlign: 'left',
			buttons: [{
				style:'margin-left:15px;',
				text : "ออกเลขเอกสาร",
				id:'buGencodeID',
				iconCls	: 'icon-save',
				handler: function(){

					Ext.Ajax.request({
						url : 'api/mnAmEdit.php' , 
						params : {
							mode:'GENCODE',
							d_doc_date : Ext.getCmp('frm-d_doc_date').value,
							id :Ext.getCmp('frm-id').getValue(), 
						},
						method: 'GET', //POST
						success: function ( result, request ) { 
							var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
							if (jsonData.success) { 
								if(jsonData.c_code_gen){
									
									Ext.Msg.alert('Success' , ""
									+"<br/> เลขที่เอกสาร  : "+jsonData.c_code_gen
									+"<br/> วันที่บันทึก  : "+ Ext.getCmp('frm-d_doc_date').value,
									+"<br/> กรุณาเลือกช่วงวันที่บันทึกให้ถูกต้อง เพื่อค้นหาใบเบิกที่ต้องการ ");
									
									Ext.getCmp('contenterCenter').setActiveTab('tabpanel1');
									Ext.getCmp('tabpanel2').setDisabled(true);
									Ext.getCmp('tabpanel1').getStore().reload();  
								}

							} else {
								Ext.MessageBox.alert('Failed', jsonData.debug);			// alert massage error
							} 
						},
						failure: function ( result, request) { 
							Ext.MessageBox.alert('Failed', jsonData.debug);		// connect error
						}
					}); //End Function		

				} //End Handle
			},{
				text : Ext.GLOBAL_BU_SAVE_TH,
				id: "icon-save",
				iconCls	: 'icon-save',
				handler: function(){
					var form = Ext.getCmp("form-widgets").getForm();
					
					var mode = Ext.getCmp('role-form-mode').getValue();
					var chkName = (Ext.getCmp('frm-c_name').getValue() != '')? true : false;
					var chkDoc = (Ext.getCmp('frm-d_doc').getValue() != '')? true : false;
					
					if (!chkName)
						Ext.Msg.alert('ผิดพลาด', 'กรุณาระบุ เรื่อง');
					else if (!chkDoc)
						Ext.Msg.alert('ผิดพลาด', 'กรุณาระบุ เลขที่เอกสาร');
					else if (form.isValid()){ 
						form.submit({
							waitMsg:'Saving Data...',
							success : function(form, action) { 
								var data = Ext.decode(action.response.responseText);
								var hdr_id = data.hdr_id;
								Ext.getCmp('role-form-mode').setValue('EDIT');
								Ext.getCmp('frm-id').setValue(hdr_id);
								Ext.getCmp('frm-c_code').setValue(data.c_code_gen);

                                                                Ext.getCmp('GRID_DTL').show();
                                                                Ext.getCmp('buAddDtl').show();
                                                                Ext.getCmp('buDelDtl').show();

                                                                // Load Method
                                                                store_dtl.setBaseParam("am_edit_hdr_id", hdr_id);
                                                                store_dtl.setBaseParam("type", "DTL");
                                                                store_dtl.load();
							},
							failure:  function(form, action) {
								switch (action.failureType) {
									case Ext.form.Action.CLIENT_INVALID:
										Ext.Msg.alert('Failure', 'Form fields may not be submitted with invalid values');
										break;
									case Ext.form.Action.CONNECT_FAILURE:
										Ext.Msg.alert('Failure', 'พลข้อผิดพลาดในการเชื่อต่อเครือข่าย');
										break;
									case Ext.form.Action.SERVER_INVALID:
									   Ext.Msg.alert('Failure', action.result.msg);
								}
							}
						});
					}
				} //End Handle
			}, {
				text: Ext.GLOBAL_BU_BACK_TH,
				handler: function() {
					Ext.getCmp('contenterCenter').setActiveTab('tabpanel1');
					Ext.getCmp('tabpanel2').setDisabled(true);
				}
			}]
		}, GRID_DTL]
	}
	//=========================================================================================//
	/*====================== CENTER ======================*/
	var center = new Ext.TabPanel({
		region: 'center',
		border: false,
		id: 'contenterCenter',
		defaults:{ autoScroll: true }, 
		items: [ gridMain , panelForm ]
	});
	
	new Ext.Viewport({
		layout: 'border',
		items: [ center ]
	});
	// SET ref Grid&Tab
	Ext.getCmp('tabpanel1').on('cellclick', cellClick, this);

	// SetTab Controller Loads
	Ext.getCmp('contenterCenter').setActiveTab('tabpanel1');
	//InfoMainGrid('tabpanel1',true,true,true,false,false,false);
	
	if(i_add){
		 Ext.getCmp('buAdd').setDisabled(false);
	 }else{
		 Ext.getCmp('buAdd').setDisabled(true);
	 }
	
	 Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({header: "ผู้ที่สร้าง",		hidden:true,	sortable: true,	dataIndex:'dc_user_create_id'}));
	 Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({header: "วันที่สร้าง",	hidden:true,  	sortable: true,	dataIndex:'d_create', align:'center' , renderer:shortThaiDate }));
	 Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({header: "หน่วยงานผู้สร้าง",	hidden:true,	sortable: true,	dataIndex:'dc_user_create_cost_id' }));
	 Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({header: "ผู้แก้ไข", 	hidden:false,  	sortable: true, dataIndex:'dc_user_create_id' }));
	 Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({header: "วันที่แก้ไข", 	hidden:false,  	sortable: true, dataIndex:'d_update', align:'center' ,renderer:shortThaiDate, }));
	 Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({header: "หน่วยงานผู้แก้ไข",hidden:false,	sortable: true, dataIndex:'dc_user_update_cost_id' }));
	
	 Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({
		header: 'แสดง', 
		align: 'center',
		id: 'view',
		sortable: false,
		width: 50,
		dataIndex: 'id' ,
		renderer: function(value, metaData, record, row, col, store, gridView) {
			var i_enable = record.get('i_enable');
			if (record.get('i_enable')==Ext.CONF_STATUS_ENABLE)
                            return'<img src="../images/icons/application_osx_go.png"); style="cursor:pointer"/>';
			else
                            return '';
		}
	}));
	
	if(i_edit){
		//all
		Ext.getCmp("role-form-mode").setValue('EDIT'); 
		Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({	
			header: "แก้ไข",
			sortable: false,
			align:'center',
			id:'edit',
			width: 50,
			dataIndex:'id' ,
			renderer: function(value, metaData, record, row, col, store, gridView) {
				if(record.get('c_code')== 'EDI'){
					return'<img src="../images/icons/document_edit.gif"); style="cursor:pointer"/>';
				}else{ 
					return '';
				} 	
				
			}
		})); 
	};
	
	if (i_delete)
	{
		//all
		Ext.getCmp("role-form-mode").setValue('EDIT'); 
		Ext.getCmp('tabpanel1').addColumn(new Ext.grid.Column({	
			header: "ยกเลิกรายการ",
			sortable: false,
			align:'center',
			id:'remove',
			width: 50,
			dataIndex:'id' ,
			renderer: function(value, metaData, record, row, col, store, gridView) {
				if(record.get('c_code')== 'EDI'){
					return'<img src="../images/icons/document_delete.gif"); style="cursor:pointer"/>';
				}else{ 
					return '';
				} 	
				
			}
		})); 
	}
	/*====================== RENDER ======================*/
	
});