function cellClick(grid, rowIndex, columnIndex, e) { 
    var record = grid.getStore().getAt(rowIndex); 
    if (columnIndex==grid.getColumnModel().getIndexById('edit')) {
        Ext.getCmp("role-form-mode").setValue("EDIT");
        Ext.getCmp('tabpanel2').setDisabled(false);
        Ext.getCmp('contenterCenter').setActiveTab('tabpanel2');
        Ext.getCmp("form-widgets").getForm().loadRecord(record);
        
        if(Ext.getCmp("frm-c_ref_value").getValue() != "") {
                Ext.getCmp("frm-chk_ref_value").setValue(true);
        }
        if(Ext.getCmp("frm-c_tax_value").getValue() != "") {
                Ext.getCmp("frm-chk_tax_value").setValue(true);
        }
    } else if (columnIndex==grid.getColumnModel().getIndexById('view')) {
        Ext.getCmp("role-form-mode").setValue("EDIT");
        Ext.getCmp('buSave').setDisabled(true);
        Ext.getCmp('tabpanel2').setDisabled(false);
        Ext.getCmp('contenterCenter').setActiveTab('tabpanel2');
        Ext.getCmp("form-widgets").getForm().loadRecord(record);
    } else if (columnIndex==grid.getColumnModel().getIndexById('remove')) {
        var win = new Ext.Window({
            id : "win-msg-delete",
            title : "Remove",
            modal: true,
            width : 250,
            height : 130,
            html: "ท่านต้องการที่จะลบข้อมูล ?",
            buttons : [{
                text : "Confirm",
                handler : function() {
                    Ext.Ajax.request({
                        url : 'api/mnDcDebtor.php' , 
                        params : { 
                            mode : 'DELETE', 
                            id : record.get('id'),
                        }, 
                        method: 'GET', //POST
                        success: function ( result, request ) { 
                            var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
                            if (jsonData.success) {
                                    //Ext.MessageBox.alert('Success', jsonData.msg);			// alert massage success
                            } else {
                                    Ext.MessageBox.alert('Failed', jsonData.msg);			// alert massage error
                            }
                            Ext.getCmp("win-msg-delete").hide();						// hidden window-panel
                            Ext.getCmp("win-msg-delete").destroy();						// clear memory :: garbage collection
                            Ext.getCmp('tabpanel1').getStore().reload();				// reload grid & store
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
                    Ext.getCmp('tabpanel1').getStore().reload();
                }
            }]
        }).show();
    }
};
	
//OnLoad	
Ext.onReady(function() {
Ext.QuickTips.init();
 
    var store = new Ext.data.JsonStore({
        storeId: 'myStore',
        autoDestroy: true,
        autoLoad: true,
        url : 'api/ListDcDebtor.php',
        root: 'data',
        baseParams: { i_read:user_right_read }, //Permission i_read
        idProperty: 'id',
	totalProperty: 'totalCount',
	fields: [{ name: 'no' },
                { name: 'id' },
                { name: 'dc_debtor_type_id' },
                { name: 'dc_debtor_type_name' },
                { name: 'dc_acc_id' },
                { name: 'dc_tax_customer_id' },
                { name: 'dc_tax_customer_name' },
                { name: 'dc_title_id' },
                { name: 'c_old_code' },
                { name: 'c_code' },
                { name: 'c_name' },
                { name: 'c_surname' },
                { name: 'c_address' },
                { name: 'c_telephone' },
                { name: 'c_mobile' },
                { name: 'c_fax' },
                { name: 'c_website' },
                { name: 'c_email' },
                { name: 'c_tax_value' },
                { name: 'c_ref_value' },
                { name: 'c_comment' },
                { name: 'i_enable' },
                { name: 'due_bill' },
                { name: 'c_name_inv' },
                { name: 'c_address_inv' },
                { name: 'c_address_inv2' },
                { name: 'c_title' },
                { name: 'i_branch' },
                { name: 'c_branch' },
                { name: 'dc_user_create_id' },
                { name: 'dc_user_create_cost_id' },
                { name: 'd_create' },
                { name: 'dc_user_update_id' },
                { name: 'dc_user_update_cost_id' },
                { name: 'd_update' }
            ]
	});
	
	var storeTitle	= new Ext.data.JsonStore({
            autoDestroy: true,
            autoLoad: true,
            url: 'api/All_DcCombo.php',
            baseParams: {type : 'storeTitle', limit:20000},
            root: 'data',
            idProperty: 'id',
	    fields: [ 'id', 'c_name']
	});
	
	var storeTaxCustomer = new Ext.data.JsonStore({
            autoDestroy: true,
            autoLoad: true,
            url: 'api/All_DcCombo.php',
            baseParams: {type : 'storeTaxCustomer', limit:20000},
            root: 'data',
            idProperty: 'id',
	    fields: [ 'id', 'c_name' ]
	});
	
	var storeDebtorType = new Ext.data.JsonStore({
            autoLoad: true,
            url: 'api/All_DcCombo.php',
            baseParams: {type : 'storeDebtorType'},
            root: 'data',
            idProperty: 'id',
            fields: [ 'id', 'c_code', 'c_name' ]
	});
	
	/*====================== TabShow Intelization ======================*/
	/* Grid */
	var gridMain = {
		region: 'center',
		title: 'แสดงรายชื่อลูกค้า',
		xtype: 'grid',
		id:'tabpanel1',
		border: false,
		stripeRows: true,
		loadMask: true,
		store: store,
		tbar: [{	
                            text : 'เพิ่มข้อมูล',
                            id:'buAdd',
                            iconCls: 'icon-add', 
                            disabled:user_right_add?false:true,
                            handler: function(grid, rowIndex, colIndex) {
                                    Ext.getCmp('buSave').setDisabled(false); //if add then save
                                    Ext.getCmp("role-form-mode").setValue("ADD");
                                    Ext.getCmp('tabpanel2').setDisabled(false);
                                    Ext.getCmp('contenterCenter').setActiveTab('tabpanel2');
                                    Ext.getCmp('form-widgets').getForm().reset();
                            }
			},{
				xtype : 'tbfill'  
			},'  ', ' ', '-', {
				id 		  : "filter",
                xtype     : 'combo',
                width     : 130,
				mode	  : 'local',
                store     : new Ext.data.SimpleStore({
							  fields: [ "value", "text" ],
							  data: [
								[ 'c_code', "รหัสลูกค้า" ],
								[ 'c_name', "ชื่อลูกค้า" ]
							  ]
							})
				,
				valueField: "value",
				displayField: "text",
				allowBlank : false,
				editable : false,
				triggerAction: "all",
				typeAhead : false,
				emptyText : "เลือกตัวกรอง"
			},'-',{			
				id : "value-box",
				xtype : "textfield",
				width: 130, 
				fieldLabel : "fieldLabel",
				emptyText : 'คำที่ต้องการค้าหา',
			}
			,' ', '-', {
				text : "ค้นหา",
				iconCls: 'icon-magnifier',
				handler : function() {  
					if (Ext.getCmp("value-box").getValue()!="")
					{
                                            store.setBaseParam("mode", "SEARCH");
                                            store.setBaseParam("filter",Ext.getCmp("filter").getValue()); 
                                            store.setBaseParam("value", Ext.getCmp("value-box").getValue()); 
                                            Ext.getCmp('tabpanel1').getStore().load();
					}else{
                                            store.setBaseParam("mode", "");
                                            Ext.getCmp('tabpanel1').getStore().load();
					}
				}
			} ,' ', '-'],
                                    columns:[
                                        new Ext.grid.RowNumberer({
                                            width:35,
                                            header:" No ",
                                            renderer:function(value, metaData, record, row, col, store, gridView){
                                                return record.get('no');
                                            }
					}),
					{ header: "ID System", sortable: true, hidden:true, dataIndex: 'id' },
					{ header: "รหัสลูกค้า", sortable: true, dataIndex: 'c_code',width:80, align:'center'},
					{ id: 'c_name', header: "ชื่อลูกค้า", sortable: true, dataIndex: 'c_name' },
                                        { header: "ประเภทกิจการ", sortable: true, dataIndex: 'dc_tax_customer_name', width:200 },
                                        { header: "กลุ่มลูกค้า", sortable: true, dataIndex: 'dc_debtor_type_name', width:150},
					{
                                            header: "Status",  
                                            sortable:false,
                                            align: 'center',
                                            renderer: function(value, metaData, record, row, col, store, gridView){
                                                var i_enable = record.get('i_enable'); 
                                                if(parseInt(i_enable) === parseInt(Ext.CONF_STATUS_ENABLE)){
                                                    return '<img src="../images/icons/yes.gif");/>';
                                                }else{
                                                    return '<img src="../images/icons/no.gif");/>'; 
                                                }
                                            } 
					}],
	
		autoExpandColumn: 'c_name',
		bbar: new Ext.PagingToolbar({
			pageSize: 20,
			store: store,
			displayInfo: true,
			displayMsg: 'Displaying topics {0} - {1} of {2}'
		})
	};
	
	/*====================== End Tabs ====================*/
	/* Form */
	var panelForm = {
		region: 'center',
		title: 'รายละเอียดลูกค้า',
		xtype: 'panel',
		id:'tabpanel2',
		border: false,
		disabled: true,
		stripeRows: true,
		loadMask: true,
		store: store, 
        items: [
		{
			xtype: 'form',
			id: 'form-widgets',
			url:'api/mnDcDebtor.php',
			frame: true,
			labelWidth: 200,
			bodyStyle: { padding: '10px 20px' },
			defaults: {
				//anchor: '100%',
				msgTarget: 'side'
			},
			items: [{
                                id : "role-form-mode",
                                xtype : "hidden",
                                name : "mode",
                                value:'ADD',
                                readOnly: true				
                            }, {				
                                xtype : "hidden",
                                id: "id",
                                name: "id",
                                readOnly: true
                            }, {
                                fieldLabel: 'รหัส',
                                xtype: 'displayfield',
                                name: 'c_code'
                            }, {
                                fieldLabel: 'รหัสเดิม',
                                xtype: 'textfield',
                                width: 300,
                                name: 'c_old_code'
                            }, {
				xtype: 'combo',
				fieldLabel: 'ประเภทกิจการ(ทางภาษี)',
				id: 'frm-dc_tax_customer_id',
                                store: storeTaxCustomer,
                                width: 300,
                                valueField: 'id',
                                displayField: 'c_name',
                                submitValue : true,
				hiddenName : 'dc_tax_customer_id',
                                mode: "local",
                                triggerAction: "all",
                                emptyText: "--- เลือกประเภทกิจการ(ทางภาษี) ---",
                                forceSelection: true,
                                selectOnFocus: true,
                                validator: function(val) {
                                    if (!Ext.isEmpty(val)){
                                        return true;
                                    } else {
                                        return "กรุณาเลือกประเภทกิจการ(ทางภาษี)";
                                    }
                                }
                            }, {
				xtype: 'combo',
				fieldLabel: 'ประเภทลูกค้า',
				id: 'frm-dc_debtor_type_id',
                                store: storeDebtorType,
                                width: 300,
                                valueField: 'id',
                                displayField: 'c_name',
                                submitValue : true,
				hiddenName : 'dc_debtor_type_id',
                                mode: "local",
                                triggerAction: "all",
                                emptyText: "--- เลือกประเภทลูกค้า ---",
                                forceSelection: true,
                                selectOnFocus: true,
                                validator: function(val) {
                                    if (!Ext.isEmpty(val)){
                                        return true;
                                    } else {
                                        return "กรุณาเลือกประเภทลูกค้า";
                                    }
                                }
                            }, {
				xtype: 'combo',
				fieldLabel: 'คำนำหน้าชื่อ',
				id: 'frm-dc_title_id',
                                store: storeTitle,
                                width: 300,
                                valueField: 'id',
                                displayField: 'c_name',
                                submitValue : true,
				hiddenName : 'dc_title_id',
                                mode: "local",
                                triggerAction: "all",
                                emptyText: "--- เลือกคำนำหน้าชื่อ ---",
                                forceSelection: true,
                                selectOnFocus: true,
                                validator: function(val) {
                                    if (!Ext.isEmpty(val)){
                                        return true;
                                    } else {
                                        return "กรุณาเลือกคำนำหน้าชื่อ";
                                    }
                                }
                            }, {
				fieldLabel: 'ชื่อ',
				xtype: 'textfield',
                                width: 600,
				id: 'frm-c_name',
                                name: 'c_name',
                                validator: function(val) {
                                    if (!Ext.isEmpty(val)){
                                        return true;
                                    } else {
                                        return "กรุณากรอกชื่อลูกค้า";
                                    }
                                }
                            }, {
				fieldLabel: 'นามสกุล/คำลงท้าย',
				xtype: 'textfield',
                                width: 600,
				name: 'c_surname'
                            }, {
                                xtype: "radiogroup",
                                fieldLabel: "สถานประกอบการ",
                                id: "frm-i_branch",
                                columns: [ 60, 110, 70, 80, 250 ],
                                vertical: true,
                                items: [
                                    { boxLabel: "อื่นๆ", name: "i_branch", inputValue: 3, checked: true },
                                    { boxLabel: "สำนักงานใหญ่", name: "i_branch", inputValue: 1 },
                                    { boxLabel: "สาขาที่", name: "i_branch", inputValue: 2 },
                                    { xtype: 'textfield', id:'frm-c_branch', name: "c_branch", width: 80},
                                    { xtype: 'displayfield', value: '&nbsp;&nbsp;&nbsp;&nbsp;(5 หลัก) เช่น สาขาที่ 5 กรอก 00005 เป็นต้น ' }
                                ],
                                listeners: {
                                    "change": function (combo, newValue) {
                                        if(newValue.inputValue == 2) {
                                            Ext.getCmp("frm-c_branch").setDisabled(false);
                                        } else {
                                            Ext.getCmp("frm-c_branch").setDisabled(true);
                                        }
                                    }
                                }
                            }, {
				fieldLabel: 'ที่อยู่',
				xtype: 'textfield',
                                //xtype: 'textarea',
                                width: 600,
				name: 'c_address'
                            }, {
				fieldLabel: 'โทรศัพท์',
				xtype: 'textfield',
                                width: 300,
				name: 'c_telephone'
                            }, {
				fieldLabel: 'โทรศัพท์เคลื่อนที่',
				xtype: 'textfield',
                                width: 300,
				name: 'c_mobile'
                            }, {
				fieldLabel: 'โทรสาร',
				xtype: 'textfield',
                                width: 300,
				name: 'c_fax'
                            }, {
				fieldLabel: 'เว็บไซต์',
				xtype: 'textfield',
                                width: 300,
				name: 'c_website'
                            }, {
				fieldLabel: 'E-mail',
				xtype: 'textfield',
                                width: 300,
				name: 'c_email'
                            }, 
                            { id: "frm-chk_ref_value", xtype: "hidden", value: "false" }, 
                            {
                                xtype: "radiogroup",
                                fieldLabel: "เลขประจำตัวบัตรประชาชน",
                                columns: [ 200, 150, 250 ],
                                vertical: true,
                                items: [
                                    {
                                        xtype: "idcardfield",
                                        id: "frm-c_ref_value",
                                        name: "c_ref_value",
                                        width: 220,
                                        autoCreate: { tag: "input", type: "text", autocomplete: "off", maxLength: 13 },
                                        listeners: {
                                            "change": function (combo, newValue) {
                                                    Ext.getCmp("frm-chk_ref_value").setValue(false);
                                            }
                                        }
                                    },
                                    { xtype : "button", text : "ตรวจสอบเลขบัตรประชาชน", width : 150,
                                            handler: function() {
                                                    if(Ext.getCmp("frm-c_ref_value").getValue() == "") {
                                                        Ext.Msg.alert("Warning", "กรุณากรอก เลขบัตรประชาชน ก่อน");
                                                    } else if(Ext.getCmp("frm-c_ref_value").getValue().length < 13) {
                                                        Ext.Msg.alert("Warning", "กรุณากรอก เลขบัตรประชาชน 13 หลัก");
                                                    } else {
                                                        var oldMode = Ext.getCmp("role-form-mode").getValue();
                                                        Ext.getCmp("role-form-mode").setValue('check_ref');
                                                        Ext.getCmp("tabpanel2").getEl().mask("Please wait...","x-mask-loading");
                                                        Ext.Ajax.request({
                                                            url: "api/mnDcDebtor.php",
                                                            method: "POST",
                                                            params: {
                                                                mode: Ext.getCmp("role-form-mode").getValue(),
                                                                id: Ext.getCmp("id").getValue(),
                                                                value: Ext.getCmp("frm-c_ref_value").getValue()
                                                            },
                                                            success: function ( result, request ) {
                                                                var obj = Ext.util.JSON.decode(result.responseText);	//decode json
                                                                var sss	= "";
                                                                if (obj.success) { // ใช้งานได้
                                                                    Ext.getCmp("frm-chk_ref_value").setValue(true);
                                                                } else { // ซ้ำ
                                                                    Ext.getCmp("frm-chk_ref_value").setValue(false);
                                                                    $.each(obj.data, function( index, value ) {
                                                                            sss	+= value+"<br>";
                                                                    });
                                                                    Ext.Msg.alert("Warning", "เลขบัตรประชาชนมีรายการซ้ำ คือ<br>"+sss);
                                                                }
                                                                Ext.getCmp("tabpanel2").getEl().unmask();
                                                            },
                                                            failure: function ( result, request) { 
                                                                Ext.MessageBox.alert("Failed", result.responseText);		// connect error
                                                            }
                                                        });
                                                    Ext.getCmp("role-form-mode").setValue(oldMode);
                                                }
                                        }
                                    },
                                    { xtype: "displayfield", value: "<span style=\"color:red;\">*(กรอกเฉพาะตัวเลขติดกัน)</span>" }
                                ]
                            }, 
                            { id: "frm-chk_tax_value", xtype: "hidden", value: "false" }, 
                            {
                                xtype: "radiogroup",
                                fieldLabel: "เลขประจำตัวผู้เสียภาษีอากร",
                                columns: [ 200, 150, 250 ],
                                vertical: true,
                                items: [
                                    {
                                        xtype: "idcardfield",
                                        id: "frm-c_tax_value",
                                        name: "c_tax_value",
                                        width: 220,
                                        autoCreate: { tag: "input", type: "text", autocomplete: "off", maxLength: 13 },
                                        listeners: {
                                            "change": function (combo, newValue) {
                                                    Ext.getCmp("frm-chk_tax_value").setValue(false);
                                            }
                                        }
                                    },
                                    { xtype : "button", text : "ตรวจสอบเลขผู้เสียภาษีอากร", width : 150,
                                            handler: function() {
                                                    if(Ext.getCmp("frm-c_tax_value").getValue() == "") {
                                                        Ext.Msg.alert("Warning", "กรุณากรอก เลขผู้เสียภาษีอากร ก่อน");
                                                    /*} else if(Ext.getCmp("frm-c_ref_value").getValue().length < 13) {
                                                        Ext.Msg.alert("Warning", "กรุณากรอก เลขประจำตัวผู้เสียภาษีอากร 13 หลัก");*/
                                                    } else {
                                                        var oldMode = Ext.getCmp("role-form-mode").getValue();
                                                        Ext.getCmp("role-form-mode").setValue('check_tax');
                                                        Ext.getCmp("tabpanel2").getEl().mask("Please wait...","x-mask-loading");
                                                        Ext.Ajax.request({
                                                            url: "api/mnDcDebtor.php",
                                                            method: "POST",
                                                            params: {
                                                                mode: Ext.getCmp("role-form-mode").getValue(),
                                                                id: Ext.getCmp("id").getValue(),
                                                                value: Ext.getCmp("frm-c_tax_value").getValue()
                                                            },
                                                            success: function ( result, request ) {
                                                                var obj = Ext.util.JSON.decode(result.responseText);	//decode json
                                                                var sss	= "";
                                                                if (obj.success) { // ใช้งานได้
                                                                    Ext.getCmp("frm-chk_tax_value").setValue(true);
                                                                } else { // ซ้ำ
                                                                    Ext.getCmp("frm-chk_tax_value").setValue(false);
                                                                    $.each(obj.data, function( index, value ) {
                                                                        sss += value+"<br>";
                                                                    });
                                                                    Ext.Msg.alert("Warning", "เลขบัตรประชาชนมีรายการซ้ำ คือ<br>"+sss);
                                                                }
                                                                Ext.getCmp("tabpanel2").getEl().unmask();
                                                            },
                                                            failure: function ( result, request) { 
                                                                Ext.MessageBox.alert("Failed", result.responseText);		// connect error
                                                            }
                                                        });
                                                    Ext.getCmp("role-form-mode").setValue(oldMode);
                                                }
                                        }
                                    },
                                    { xtype: "displayfield", value: "<span style=\"color:red;\">*(กรอกเฉพาะตัวเลขติดกัน)</span>" }
                                ]
                            }, {
				fieldLabel: 'ชื่อลูกค้าในใบกำกับภาษี',
				xtype: 'textfield',
                                width: 600,
                                id: 'frm-c_name_inv',
				name: 'c_name_inv',
                                validator: function(val) {
                                    if (!Ext.isEmpty(val)){
                                        return true;
                                    } else {
                                        return "กรุณากรอกชื่อลูกค้าในใบกำกับภาษี";
                                    }
                                }
                            }, {
				fieldLabel: 'ที่อยู่ลูกค้าในใบกำกับภาษี(บรรทัดที่ 1) ',
				xtype: 'textfield',
                                width: 600,
                                id: 'frm-c_address_inv',
				name: 'c_address_inv',
                                validator: function(val) {
                                    if (!Ext.isEmpty(val)){
                                        return true;
                                    } else {
                                        return "กรุณากรอกที่อยู่ลูกค้าในใบกำกับภาษี";
                                    }
                                }
                            }, {
				fieldLabel: 'ที่อยู่ลูกค้าในใบกำกับภาษี(บรรทัดที่ 2) ',
				xtype: 'textfield',
                                width: 600,
                                id: 'frm-c_address_inv2',
				name: 'c_address_inv2'
                            }, {
				fieldLabel: 'วันทีกำหนดการวางบิล',
				xtype: 'textfield',
                                width: 300,
				name: 'due_bill'
                            }, {
				fieldLabel: 'เงื่อนไขการชำระเงิน',
				xtype: 'textfield',
                                width: 300,
				name: 'condition_pay'
                            }, {
				fieldLabel: 'คำอธิบายเพิ่มเติม',
				xtype: 'textarea',
                                width:600,
				name:'c_comment'
                            }, {
				fieldLabel: 'สถานะการใช้งาน',
				xtype: 'radiogroup',
				columns: [80,100],
				items: [
                                    { boxLabel: 'ใช้งาน', checked: true, name: 'i_enable', inputValue: '1' },
                                    { boxLabel: 'ไม่ใช้งาน', name: 'i_enable', inputValue: '2' }
				]
                            }],
                            buttons: [{
				text : Ext.GLOBAL_BU_SAVE_TH,
				id:'buSave',
				handler : function() {
                                    var form = Ext.getCmp("form-widgets").getForm();
                                    
                                    if (Ext.getCmp("frm-dc_tax_customer_id").getValue() == "")
                                        Ext.Msg.alert('ผิดพลาด', 'กรุณาเลือก ประเภทกิจการ(ทางภาษี)');
                                    else if (Ext.getCmp("frm-dc_debtor_type_id").getValue() == "")
                                        Ext.Msg.alert('ผิดพลาด', 'กรุณาเลือก ประเภทลูกค้า');
                                    else if (Ext.getCmp("frm-dc_title_id").getValue() == "")
                                        Ext.Msg.alert('ผิดพลาด', 'กรุณาเลือก คำนำหน้า');
                                    else if(Ext.getCmp("frm-c_name").getValue() == "")
                                        Ext.Msg.alert('ผิดพลาด', 'กรุณากรอก ชื่อลูกค้า');
                                    else if(Ext.getCmp("frm-i_branch").getValue().inputValue == 2 && Ext.getCmp("frm-c_branch").getValue() == "") 
                                            Ext.Msg.alert('ผิดพลาด', 'กรุณากรอก สาขา');
                                    else if(Ext.getCmp("frm-c_ref_value").getValue() == "" && Ext.getCmp("frm-c_tax_value").getValue() == "")
                                        Ext.Msg.alert('ผิดพลาด', 'กรุณากรอก เลขประจำตัวประชาชน หรือ เลขประจำตัวผู้เสียภาษีอากร');
                                    else if (Ext.getCmp("frm-c_ref_value").getValue() != "" && Ext.getCmp("frm-chk_ref_value").getValue() == "false")
                                        Ext.Msg.alert('ผิดพลาด', 'กรุณากดปุ่ม ตรวจสอบเลขบัตรประชาชนก่อน');
                                    else if (Ext.getCmp("frm-c_tax_value").getValue() != "" && Ext.getCmp("frm-chk_tax_value").getValue() == "false")
                                        Ext.Msg.alert('ผิดพลาด', 'กรุณากดปุ่ม ตรวจสอบเลขผู้เสียภาษีอากรก่อน');
                                    else if(Ext.getCmp("frm-c_name_inv").getValue() == "")
                                        Ext.Msg.alert('ผิดพลาด', 'กรุณากรอก ชื่อลูกค้าในใบกำกับภาษี');
                                    else if(Ext.getCmp("frm-c_address_inv").getValue() == "" && Ext.getCmp("frm-c_address_inv2").getValue() == "")
                                        Ext.Msg.alert('ผิดพลาด', 'กรุณากรอก ที่อยู่ลูกค้าในใบกำกับภาษี');
                                    else {
                                        form.submit({
                                                waitMsg:'Saving Data...',
                                                success : function(form, action) { 
                                                    Ext.getCmp('tabpanel1').getStore().reload();
                                                    Ext.getCmp('contenterCenter').setActiveTab('tabpanel1');
                                                    Ext.getCmp('tabpanel2').setDisabled(true);
                                                },
                                                failure:  function(form, action) {
                                                    switch (action.failureType) {
                                                        case Ext.form.Action.CLIENT_INVALID:
                                                            Ext.Msg.alert('Failure', 'Form fields may not be submitted with invalid values');
                                                            break;
                                                        case Ext.form.Action.CONNECT_FAILURE:
                                                            Ext.Msg.alert('Failure', 'Ajax communication failed');
                                                            break;
                                                        case Ext.form.Action.SERVER_INVALID:
                                                           Ext.Msg.alert('Failure', action.result.msg);
                                                    }
                                                }
                                        });
                                    }
				}
			}, {
				text: 'Cancel',
				handler: function() {
					Ext.getCmp('contenterCenter').setActiveTab('tabpanel1');
					Ext.getCmp('tabpanel2').setDisabled(true);
					Ext.getCmp('buSave').setDisabled(false);
				}
			}]
		}]
	};
	
	/* View */
	new Ext.Viewport({
		layout: 'border',
		items: [  new Ext.TabPanel({
			region: 'center',
			border: false,
			activeTab: 1, //default Tab
			id:'contenterCenter',
			defaults:{autoScroll:true}, 
			items: [gridMain, panelForm], 
			listeners: { 'tabchange' : function (panel, tab) { /* Action */ }
			}
		}) ]
	});
	/* Event ,Handler */
	Ext.getCmp('tabpanel1').on('cellclick', cellClick, this);
	Ext.getCmp('contenterCenter').setActiveTab('tabpanel1'); 
	InfoMainGrid('tabpanel1',true,true,true,true,true,true);
});