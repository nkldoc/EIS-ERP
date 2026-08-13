Ext.onReady(function() {
    Ext.QuickTips.init();

    Ext.idRep       = 'frm-report'; 
    Ext.urlReport   = './api/report/RepInvoiceDaily.php';
    Ext.titleReport = 'รายงาน Order ที่วางบิล/แจ้งหนี้แล้ว (ตามเดือนที่วางบิล/แจ้งหนี้)';
	Ext.getDate = Ext.apply({
					year:new Date().getFullYear(), 
					month:new Date().getMonth()+1,
					day:new Date().getDay(),
					getNowCarlen:function(){
						 var day = new Date();
						 var dd = day.getDate();
						 var mm = day.getMonth() + 1;
						 var yy = day.getFullYear()+543; 
						 mm = (mm < 10) ? ("0" + mm) : mm;
						 dd = (dd < 10) ? ("0" + dd) : dd; 
						return dd+'-'+mm+'-'+yy;
					},					
				}); 
	
    function frmWithOutAjax(value){

            var frm = Ext.getCmp(Ext.idRep).getForm().el.dom;  
            frm.setAttribute('target',"Report");	
            frm.setAttribute('action',Ext.urlReport);
            Ext.getCmp('modeID').setValue(value); 
            frm.submit(); 
			frm.focus();
    };
	
	function checkUi(){ 
		if(Ext.getCmp('dc_cost_idID_Name').getValue()==''){
			Ext.MessageBox.alert('Failed', 'กรุณาเลือกหน่วยงาน ',function(){ 
				Ext.get('dc_cost_idID_Name').dom.focus();   
			 return false;
			}); 
		}else if(Ext.getCmp('dc_cost_id2ID_Name').getValue() ==''){
			 Ext.MessageBox.alert('Failed', 'กรุณาเลือกหน่วยงาน ',function(){ 
				Ext.get('dc_cost_id2ID_Name').dom.focus();  
			 return false;
			});  
		}else if(Ext.getCmp('dc_debtor_idID_Name').getValue()==''){
			 Ext.MessageBox.alert('Failed', 'กรุณาเลือกลูกค้า',function(){ 
				Ext.get('dc_debtor_idID_Name').dom.focus();  
			 return false;
			});  
		}else{
			return true;
		}
		/* return true; */
	}
	
    function setButtonReport(){
 
		var htmlReport 	= { 
                                text: Ext.GLOBAL_BU_REPORT_TH,  
                                scale:'small', 
                                iconCls: 'icon-html' , 
                                handler:function(){ 
                                        if(checkUi())frmWithOutAjax('html');
                                }
                            };
        var excelReport = { 
                                text: Ext.GLOBAL_BU_EXCEL_TH,  
                                scale:'small', 
                                id:'rep-excel',
                                iconCls: 'icon-excel' ,  
                                handler:function(){ 
                                        if(checkUi())frmWithOutAjax('excel');
                                }
                            };
        var downloadReport = { 
                                text: Ext.GLOBAL_BU_DOWNLOAD_TH,  
                                scale:'small', 
                                iconCls: 'icon-downloadHTML' , 
                                handler:function(){  
                                        if(checkUi())frmWithOutAjax('downloadHTML');	
                                }
                            }; 
        return [htmlReport,excelReport,downloadReport];
    };
	
    // สถานะ 
    var storeStatus = new Ext.data.JsonStore({
            fields: ['id', 'c_name'],
            data : [
                    { id : '0', c_name : 'เลือกทั้งหมด' },
                    { id : ''+Ext.CONF_STATUS_ENABLE, c_name : 'ใช้งาน' },
                    { id : ''+Ext.CONF_STATUS_DISABLE, c_name : 'ไม่ใช้งาน' }
                   ]
    });

		Ext.storeCost = new Ext.data.JsonStore({ 
			autoLoad: true,
			storeId: 'myStoreCost',
			url: 'api/All_ArCombo.php',
			baseParams: {type : 'storeCost' },
			root: 'data',
			idProperty: 'id',
			totalProperty: 'totalCount',
			fields: [ 'no','id', 'c_code','c_name']
		});
		
		Ext.storeCost2 = new Ext.data.JsonStore({ 
			autoLoad: true,
			storeId: 'myStoreCost2',
			url: 'api/All_ArCombo.php',
			baseParams: {type : 'storeCost'},
			root: 'data',
			idProperty: 'id',
			totalProperty: 'totalCount',
			fields: [ 'no','id', 'c_code','c_name']
		});
		Ext.storeDebtor = new Ext.data.JsonStore({ 
			autoLoad: true,
			storeId: 'myStoreCnt',
			url: 'api/All_ArCombo.php',
			baseParams: {type : 'storeDebtor',all:true},
			root: 'data',
			idProperty: 'id',
			totalProperty: 'totalCount', 
			fields: ['no','id','c_title','c_name','c_code'
			,'c_address','c_telephone','c_mobile','c_tax_value','c_ref_value'
			,'c_website','c_email','cnt_type_name'
			],
		});
		
	var columnMini 	= [{ header: "ID System", sortable: true, hidden:true, dataIndex: 'id' },
			{ header: "รหัส", sortable: true, dataIndex:'c_code' , },
			{ header: "ชื่อ"
				, sortable: true
				, id: 'c_name' 
				, dataIndex: 'c_name',
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
						metaData.attr = "style='cursor:pointer';";
					return value; 
				} 
			}];	
		
	 
		
    var panelForm = new Ext.Panel ({
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
                    items: [{ xtype:'hidden',id:'titleReportID',name:'titleReport',value:Ext.titleReport},
                            { xtype:'hidden',id:'modeID',name:'mode' },
                            new Ext.form.ComboBox({
                                fieldLabel: 'สถานะ',
                                store: storeStatus,
                                valueField: 'id',
                                displayField: 'c_name',
                                hiddenName:'i_enable',
                                value: '0',
                                width: 150,
                                typeAhead: true,
                                mode: 'local',
                                triggerAction: 'all',
                                emptyText: 'กรุณาเลือก...',
                                forceSelection: true,
                                selectOnFocus: true
                            }),
							new Ext.ux.Poplov({ 
									text		: 'หน่วยงาน',  
									id			: 'dc_cost_idID',	//go to relation	
									iconCls		: 'page_magnify', 
									valueHidden : 'dc_cost_id', 	//go to hidden
									store		: Ext.storeCost,
									headerGrid	: columnMini,
									widthText	: 400,  
									fieldLabel	: 'จากหน่วยงาน',  
									isCellClickGrid:true, 
									afterrender: function(){ /*alert(this.getId());*/ }, 
									cellClickGrid:function(grid, rowIndex, columnIndex, e) { 
									
									
										//===========================================================
										var id = 'dc_cost_idID';
										var nameID = id+'_Name';
										var record 		= grid.getStore().getAt(rowIndex); 
												
										var TextShow 	= record.data.c_code+' '+record.data.c_name;
										//===========================================================
										Ext.getCmp(id).setValue(record.data.id);
										Ext.getCmp(nameID).setValue(TextShow);
										//===========================================================
										if(record.data.id ==-1){
											
											Ext.getCmp('pop_dc_cost_id2ID').hide();		
										}else{
											Ext.getCmp('pop_dc_cost_id2ID').show();
										} 
										//===========================================================
										Ext.getCmp("win-pop-lov"+id).destroy();  
										
									},
							}).mini,  
							new Ext.ux.Poplov({ 
									text		: 'หน่วยงาน',  
									id			: 'dc_cost_id2ID',	//go to relation	
									iconCls		: 'page_magnify', 
									valueHidden : 'dc_cost_id2', 	//go to hidden
									store		: Ext.storeCost2,
									headerGrid	: columnMini,
									widthText	: 400,   
									fieldLabel	: 'ถึงหน่วยงาน ',  
							}).mini,  
							{
									xtype : 'compositefield',
									id:'dis_onairID',
									anchor: '-20',
									msgTarget: 'side',
									fieldLabel: 'เดือน/ปี ที่แจ้งหนี้/วางบิล',   
									items : [{ 
											width:          120, 
											xtype:          'combo',
											mode:           'local',
											value: Ext.getDate.month,
											emptyText:'กรุณาเลือก',
											triggerAction:  'all',
											forceSelection: true,
											editable:       false,
											fieldLabel:     'เดือน', 
											name:           'onair_mm',
											hiddenName:     'onair_mm',
											displayField:   'c_name',
											valueField:     'id',
											store:Ext.monthStore,
										},
										{
											xtype: 'displayfield',
											value: 'ปี',
										},{ 
											width:          120, 
											xtype:          'combo',
											mode:           'local',
											value : Ext.getDate.year,
											emptyText:'กรุณาเลือก',
											triggerAction:  'all',
											forceSelection: true,
											editable:       false, 
											fieldLabel:     'ปี',
											//id:           'onair_yyyyID', 
											name:           'onair_yyyy',
											hiddenName:     'onair_yyyy',
											displayField:   'c_name',
											valueField:     'id',
											store:new Ext.data.JsonStore({
														fields: [{name:'id'},{name:'c_name'}],
														data : Ext.genYearList(1,10,false),
														sortInfo:{ field: 'id', direction: 'DESC'}  , 	
													}),
										},
									] 
								},//End Compositefield
								new Ext.ux.Poplov({ 
									text		: 'ชื่อลูกค้า',  
									id			: 'dc_debtor_idID',	//go to relation	
									iconCls		: 'page_magnify', 
									valueHidden : 'dc_debtor_id', 		//go to hidden
									store		: Ext.storeDebtor,
									headerGrid	: columnMini,
									widthText	: 400,  
									fieldLabel	: 'ชื่อลูกค้า',  
									isCellClickGrid:true, 
									afterrender: function(){ /*alert(this.getId());*/ }, 
									cellClickGrid:function(grid, rowIndex, columnIndex, e) { 
									
										var id = 'dc_debtor_idID';
										var nameID = id+'_Name';
										var record 		= grid.getStore().getAt(rowIndex);  
										var TextShow 	= record.data.c_code+' '+record.data.c_name;
										
										Ext.getCmp(id).setValue(record.data.id);
										Ext.getCmp(nameID).setValue(TextShow);    					
										Ext.getCmp("win-pop-lov"+id).destroy();  
										 
									},
							}).mini
								
                            ]
                    }]
                }],
            buttonAlign: "left",
            buttons: setButtonReport()
        }]
    });

    new Ext.Viewport({
        layout: 'border', 
        items:panelForm
    });
});