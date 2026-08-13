Ext.onReady(function() {
	Ext.QuickTips.init();
	
	// constructor
	var mainfile 			= 'RepDcTax'; 				//name main file manage extjs	
	var urldownloadExcel 	= './api/excel/'+mainfile+'.php'; 	//php export file header excel
	var urlReport 			= './api/'+mainfile+'.php'; 		//store list show on grid

	// สถานะ 
	var storeStatus = new Ext.data.JsonStore({
		fields: ['id', 'c_name'],
		data : [
		        { id : '0', c_name : 'เลือกทั้งหมด' },
		        { id : ''+Ext.CONF_STATUS_ENABLE, c_name : 'ใช้งาน' },
		        { id : ''+Ext.CONF_STATUS_DISABLE, c_name : 'ไม่ใช้งาน' }
		       ]
	}); 	
	 
	var reader = new Ext.data.JsonReader({
            root: 'data',
            totalProperty: 'totalCount',
            idProperty: 'id',
            fields: [
                    { name: 'no' },
                    { name: 'c_code' },
                    { name: 'c_name'},
                    { name: 'f_amount'  },
                    { name: 'whtax_name' },
                    { name: 'i_enable' },
                    { name: 'acc_name'  }
            ]
    });
	
    var store = new Ext.ux.grid.livegrid.Store({
        url: urlReport,
        bufferSize:300,
        reader: reader
    });
	
    var myView = new Ext.ux.grid.livegrid.GridView({
        nearLimit : 100,
        emptyText: "ไม่มีข้อมูล..",
		deferEmptyText: false,
		autoFill: true, // ย่อ columns
		scrollOffset: 0, // ปิดช่อง  scrollbars ของ columns
        loadMask  : { msg :  'Buffering. Please wait...' }
    });
 
 //=============================================================================================================================
    var livegrid = new Ext.ux.grid.livegrid.GridPanel({
    	title: 'แสดงรายงาน',
    	id: 'report',
    	disabled: true,
    	stripeRows: true,
    	store:store, 
		tbar: ['-'], 
		view: myView,
		selModel: new Ext.ux.grid.livegrid.RowSelectionModel(),
        bbar: new Ext.ux.grid.livegrid.Toolbar({
        	view: myView,
        	displayInfo: true
        }),
        columnLines: true, // เส้นแบ่ง column 
        columns: [
              	new Ext.grid.RowNumberer({ width:35, header:" No ", dataIndex: 'no' }),
				
				{ header: "รหัส", sortable: true, dataIndex: 'c_code' },
				{ id: 'c_name', header: "ชื่อรายการ", sortable: true, dataIndex: 'c_name' },
				{ header: "อัตราภาษี(%)", 
					sortable: true, 
					dataIndex: 'f_amount',
					renderer: function(value, metaData, record, rowIndex, colIndex, store) {
						metaData.attr = "style='color:blue'; align='right'";
						return value;
					}
				},
				{ header: "ประเภทการหักภาษี ณ ที่จ่าย", dataIndex: 'whtax_name' },
				{ header: "ชนิดบัญชี", dataIndex: 'acc_name' },
              	{ header: 'สถานะ', sortable: true,   align:'center', dataIndex: 'i_enable',
              		renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              			if(value == Ext.CONF_STATUS_ENABLE){ //record.get('i_enable');
              				metaData.attr = "style='color:green';";
              				return "ใช้งาน";
              			} else {
              				metaData.attr = "style='color:red';";
              				return "ไม่ใช้งาน";
              			}
              		}
              	}
              ],
      		//autoExpandColumn: 'c_name',
        listeners: {
        	viewready: function() {
				var map = new Ext.KeyMap(livegrid.getEl(), [{
					key: "c",
					ctrl:true,
					fn: function(keyCode, e) {
						var recs = livegrid.getSelectionModel().getSelections();
						if (recs && recs.length != 0) {
							var clipText = Ext.getCmp('report').getCsvDataFromRecs(recs);
							var ta = document.createElement('textarea');
							ta.id = 'cliparea';
							ta.style.position = 'absolute';
							ta.style.left = '-1000px';
							ta.style.top = '-1000px';
							ta.value = clipText;
							document.body.appendChild(ta);
							document.designMode = 'off';
							ta.focus();
							ta.select();
							setTimeout(function(){
								document.body.removeChild(ta);
							}, 100);
						}
					}
				}]);
			}
		},
		getCsvDataFromRecs: function(cells) {
			var clipText ='', name;
			for (var i=0; i<cells.length; i++) {
				var record	= cells[i];
				var values	= '';
				var columns	= this.initialConfig.columns;
				var n		= 0;
				Ext.each(columns, function(col) {
					name		= col.dataIndex;
					values		= col.renderer(record.get(name), null,record);
					
					if(columns[n] == columns[0]) {
						clipText	= clipText.concat(values);
					} else {
						clipText	= clipText.concat('\t',values);
					}
					n++;
				}, this);
				clipText	= clipText.concat('\n');
			}
			return clipText;
		},
    });
 
 //=====================================================================
 
	var LinkButton = new Ext.ux.LinkButton({ 
	    text: 'Download',  
	    scale:'small',  
	    iconCls: 'icon-excel' ,
	    target:'_Self' ,
	    href: urldownloadExcel, 
	    params:store.baseParams,
	    handler:function(){},
	});    

    var panelForm = {
		region: 'center',
		title: 'รายงานภาษีหัก ณ ที่จ่าย',
		xtype: 'panel',
		border: false,
		stripeRows: true,
		loadMask: true,
		items: [
		        
		{
			xtype: 'form',
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
					items: [ new Ext.form.ComboBox({
						id: 'i_enable',
						fieldLabel: 'สถานะ',
						store: storeStatus,
						valueField: 'id',
						displayField: 'c_name',
						value: '0',
						width: 150,
						typeAhead: true,
						mode: 'local',
						triggerAction: 'all',
						emptyText: 'กรุณาเลือก...',
						forceSelection: true,
						selectOnFocus: true,
						listeners: {
							'change': function (combo, newValue) {
								if (newValue == '')
									combo.reset();
							}
						}
					})]
				}]
			}],
buttons: [{
	style:'margin-left:15px;',
	text: 'แสดงรายงาน',
	iconCls: 'page_magnify',
	handler: function(){

		//set action by id
		var idRep = 'report';
		var idAct = 'contenterCenter';
 
		Ext.getCmp(idRep).setDisabled(false);
		Ext.getCmp(idAct).setActiveTab(idRep);
		Ext.getCmp(idRep).getEl().mask("Please wait...","x-mask-loading"); 
		
		//set Title Report
		Ext.get('domStatus').dom.innerHTML=' สถานะ : '+ Ext.ux.util.getTextCombo(Ext.getCmp("i_enable"),'id', 'c_name');
		
		store.setBaseParam("mode", 'SEARCH');
		store.setBaseParam("i_enable", Ext.getCmp("i_enable").getValue()); 		
		store.load();
		
		store.load({ callback: function(records, operation, success) {
		   if (success) Ext.getCmp(idRep).getEl().unmask();  
		}}); 
 
	} //End Handle
}]
		}]
	};
	
	/*====================== CENTER ======================*/
	var center = new Ext.TabPanel({
		region: 'center',
		border: false,
		activeTab: 0, //default Tab
		id:'contenterCenter',
		defaults:{ autoScroll:true },
		items: [ panelForm , livegrid ]
	});
	/*====================== RENDER ======================*/

	new Ext.Viewport({
		layout: 'border',
		items: [ center ]
	});
  //add button Excel
	 
	livegrid.getTopToolbar().add({ 
		xtype:'panel',
		border: false,
		html:'<div style="font-size:14px;font-weight:bold; background:#eee;padding:3px;">' 
			+'<p id="domStatus"></p>' 
			+'</div>',
		});
	livegrid.getTopToolbar().add({ xtype : 'tbfill' });
	livegrid.getTopToolbar().add(LinkButton);
	
});