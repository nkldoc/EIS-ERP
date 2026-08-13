Ext.onReady(function() {
    Ext.QuickTips.init();

    Ext.idRep       = 'frm-report'; 
    Ext.urlReport   = './api/report/RepImp003.php';
    Ext.titleReport = 'รายงานการรับเงินประจำวัน ตามผังบัญชี';
	
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
		defaultDate:function(typeStartDate) {
			 var day = new Date();
			 var dd = day.getDate();
			 var mm = day.getMonth() + 1;
			 var yy = day.getFullYear() + 543; 
			 if (typeStartDate == 1) // วันที่เริ่ม -1 เดือน
			 {
				 dd = "01";
				 mm = "0" + mm.toString(); 
			 } else {
				 dd = "0" + dd.toString();
				 mm = "0" + mm.toString();
			 }
			 return dd.substr(-2) + "-" + mm.substr(-2) + "-" + yy.toString();
		 },			
	});
	
    /*function frmWithOutAjax(value){

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
                                }
                            };
        var excelReport = { 
                                text: Ext.GLOBAL_BU_EXCEL_TH,  
                                scale:'small', 
                                id:'rep-excel',
                                iconCls: 'icon-excel' ,  
                                handler:function(){ 
                                        frmWithOutAjax('excel');
                                }
                            };
        var downloadReport = { 
                                text: Ext.GLOBAL_BU_DOWNLOAD_TH,  
                                scale:'small', 
                                iconCls: 'icon-downloadHTML' , 
                                handler:function(){  
                                        frmWithOutAjax('downloadHTML');	
                                }
                            }; 
        return [htmlReport,excelReport,downloadReport];
    };*/
	
	LookReport = function(mode) {

		var msg = "";

		var s_dc_acc_id_parent = "";
		var s_dc_acc_id = "";
		var s_dc_period_id = "";

		if (Ext.getCmp("i_show_acc").getValue().inputValue == 1) {
			if (Ext.getCmp("s_dc_acc_id_parent").getValue() == "") {
				msg += "- กรุณาเลือก บัญชีคุมอย่างน้อย 1 รายการ<br>";
			} else {
				s_dc_acc_id_parent = Ext.getCmp("s_dc_acc_id_parent")
						.getValue();
			}
		} else {
			if (Ext.getCmp("s_dc_acc_id").getValue() == "") {
				msg += "- กรุณาเลือก บัญชีย่อยอย่างน้อย 1 รายการ<br>";
			} else {
				s_dc_acc_id = Ext.getCmp("s_dc_acc_id").getValue();
			}
		}
		
		if (Ext.getCmp("s_dc_period_id").getValue() == "") {
			msg += "- กรุณาเลือก รอบอย่างน้อย 1 รายการ<br>";
		} else {
			s_dc_period_id = Ext.getCmp("s_dc_period_id").getValue();
		}

		if (msg == "") {

			var href = "api/report/RepImp003.php";
			var resultUrl = "";

			resultUrl += "&mode=" + mode;
			resultUrl += "&date_start="+Ext.util.Format.date(Ext.getCmp("date_start").getValue(), "Y-m-d");
	    	resultUrl += "&date_end="+Ext.util.Format.date(Ext.getCmp("date_end").getValue(), "Y-m-d");
			resultUrl += "&i_show_acc="+ Ext.getCmp("i_show_acc").getValue().inputValue;
			resultUrl += "&dc_acc_id_parent=" + s_dc_acc_id_parent;
			resultUrl += "&dc_acc_id=" + s_dc_acc_id;
			resultUrl += "&dc_period_id=" + s_dc_period_id;

			resultUrl = (resultUrl != "") ? "?" + resultUrl.substring(1) : "";

			window.open(href + resultUrl, href);
			window.focus();

		} else {
			Ext.MessageBox.alert("แจ้งเตือน", msg);
		}
	};
	
	store_acc_s_parent = new Ext.data.JsonStore({
		autoLoad : true,
		url : "api/All_RepImp003.php",
		baseParams : {
			type : "dc_acc_main",
			show : "all"
		},
		root : "data",
		idProperty : "id",
		fields : [ "id", "c_name", "cut_name" ]
	});

	store_acc_s = new Ext.data.JsonStore({
		autoLoad : true,
		url : "api/All_RepImp003.php",
		baseParams : {
			type : "dc_acc",
			show : "all"
		},
		root : "data",
		idProperty : "id",
		fields : [ "id", "c_name", "cut_name" ]
	});
	
	store_period = new Ext.data.JsonStore({
		autoLoad : true,
		url : "api/All_RepImp001.php",
		baseParams : {
			type : "dc_period",
			show : "all"
		},
		root : "data",
		idProperty : "id",
		fields : [ "id", "c_name", "cut_name" ]
	});
	
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
                            {
								xtype: "compositefield",
								fieldLabel: "วันที่",
								anchor: "100%",
								msgTarget: "under",
								items: [{
									xtype: "datefield",
									id: "date_start",
									width: 127,
									listeners : {
										afterrender : function() {
											var date = new Date();
												date = new Date(date.getFullYear()+543, date.getMonth(), 1);
											this.setValue(date);
										}
									}
								},{
									xtype: "displayfield", value: "ถึงวันที่", width: 36, align:"center"
								},{
									xtype: "datefield",
									id: "date_end",
									width: 127,
									value: addY(543)
								}]
							},{
								xtype : "radiogroup",
								id : "i_show_acc",
								fieldLabel : "รายการบัญชี",
								columns : [ 70, 110 ],
								items : [ {
									boxLabel : "บัญชีคุม",
									name : "i_show_acc",
									inputValue : 1,
									checked : true
								}, {
									boxLabel : "บัญชีย่อย",
									name : "i_show_acc",
									inputValue : 2
								} ],
								listeners : {
									change : function(obj, value) {
										if (value.inputValue == 1) {
											Ext.getCmp("s_dc_acc_id").hide();
											Ext.getCmp("s_dc_acc_id_parent")
													.show();
										} else {
											Ext.getCmp("s_dc_acc_id").show();
											Ext.getCmp("s_dc_acc_id_parent")
													.hide();
										}
									}
								}
							}, new Ext.ux.form.LovCombo({
								id : "s_dc_acc_id_parent",
								fieldLabel : "รายการบัญชีคุม",
								width : 300,
								mode : "local",
								store : store_acc_s_parent,
								valueField : "id",
								displayField : "c_name",
								triggerAction : "all",
								forceSelection : true,
								selectOnFocus : true,
								typeAhead : false,
								emptyText : "กรุณาเลือก..."
							}), new Ext.ux.form.LovCombo({
								id : "s_dc_acc_id",
								fieldLabel : "รายการบัญชีย่อย",
								width : 300,
								mode : "local",
								store : store_acc_s,
								valueField : "id",
								displayField : "c_name",
								triggerAction : "all",
								forceSelection : true,
								selectOnFocus : true,
								typeAhead : false,
								hidden : true,
								emptyText : "กรุณาเลือก..."
							}), new Ext.ux.form.LovCombo({
								id : "s_dc_period_id",
								fieldLabel : "รอบ",
								width : 300,
								mode : "local",
								store : store_period,
								valueField : "id",
								displayField : "c_name",
								triggerAction : "all",
								forceSelection : true,
								selectOnFocus : true,
								typeAhead : false,
								emptyText : "กรุณาเลือก..."
							})]
                    }]
                }],
            buttonAlign: "left",
            buttons : [ {
				text : Ext.GLOBAL_BU_SHOW_TH + "สำหรับ HTML",
				iconCls : "page_magnify",
				handler : function() {
					LookReport("html");
				} // End Handle
			}, {
				text : Ext.GLOBAL_BU_SHOW_TH + "สำหรับ Excel",
				iconCls : "icon-excel",
				handler : function() {
					LookReport("excel");
				} // End Handle
			} ]
        }]
    });

    new Ext.Viewport({
        layout: 'border', 
        items:panelForm
    });
});