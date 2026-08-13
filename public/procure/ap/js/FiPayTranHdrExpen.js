Ext.onReady(function() {
	Ext.QuickTips.init();

	/*===============================================*/
	var title_panel		= (PAGE_TYPE == 1)? "ใบเบิกค่าใข้จ่าย" : "ตรวจอนุมัติเงินเบิกค่าใข้จ่าย";
	/*===============================================*/
	
	store = new Ext.data.JsonStore({
		id: "store",
	    autoDestroy: true,
		autoLoad: false,
//		chkMask: false, // status: loading
	    url: "../ap/api/List_FiPayTranHdrExpen.php",
	    baseParams: { type: "ap_expen_hdr", PAGE_TYPE: PAGE_TYPE, i_read: user_right_read }, //Permission i_read
	    root: "data",
	    idProperty: "id",
		totalProperty: "totalCount",
		fields: [
			{ name : "no" },
			{ name : "id" },
			{ name : "ap_expen_hdr_ref_id" },
			{ name : "i_exp_type" },
			{ name : "c_code" },
			{ name : "c_doc_ref" },
			{ name : "i_is_status" },
			{ name : "show_is_status" },
			{ name : "dc_cost_id" },
			{ name : "dc_cost_name" },
			{ name : "dc_cost_id_Name" },
			{ name : "d_doc_date" },
			{ name : "c_subject" },
			{ name : "i_type_person" },
			{ name : "creditor_name" },
			{ name : "dc_creditor_id" },
			{ name : "dc_creditor_id_Name" },
			{ name : "dc_emp_id" },
			{ name : "dc_emp_id_Name" },
			{ name : "c_other_name" },
			{ name : "dc_acc_other_id" },
			{ name : "i_is_receiver_diff" },
			{ name : "c_receiver_name" },
			{ name : "dc_emp_ref_id" },
			{ name : "dc_emp_ref_id_Name" },
			{ name : "dc_emp_boss_id" },
			{ name : "dc_emp_boss_id_Name" },
			{ name : "c_job" },
			{ name : "c_location" },
			{ name : "c_creditor_addr" },
			{ name : "c_creditor_tax" },
			{ name : "c_creditor_ref" },
			{ name : "c_name" },
			{ name : "c_str1" },
			{ name : "c_str2" },
			{ name : "c_str3" },
			{ name : "d_chk_date" },
			{ name : "c_comment" },
			{ name : "c_mm" },
			{ name : "c_yyyy" },
			{ name : "c_type_doc" },
			{ name : "c_type_doc_num" },
			{ name : "i_is_barter" },
			{ name : "f_barter_amt" },
			{ name : "f_barter_dec" },
			{ name : "i_center" },
			{ name : "dc_bg_type_id" },
			{ name : "f_total_amount" },
			{ name : "f_vat_amount" },
			{ name : "f_total_add_vat_amt" },
			{ name : "f_wht_amount" },
			{ name : "f_penalty" },
			{ name : "f_net_amount" },
			{ name : "i_enable" },
			{ name : "show_enable" }
		],
//		listeners: {
//			beforeload: function(t, records, options) { this.chkMask = false; initData(); },
//			datachanged: function(t, records, options) { this.chkMask = true; initData(); },
//		}
	});
	
	store_dtl = new Ext.data.JsonStore({
	    autoDestroy: true,
		autoLoad: false,
//		chkMask: false, // status: loading
		url: "../ap/api/List_FiPayTranHdrExpen.php",
		baseParams: { type: "store_dtl" },
	    root: "data",
	    idProperty: "id",
		totalProperty: "totalCount",
		fields: [
			{ name : "no" },
			{ name : "id" },
			{ name : "dtl_acc_code" },
			{ name : "dtl_acc_name" },
			{ name : "dtl_tax_map_method_name" },
			{ name : "dtl_ap_exp_doc_name" },
			{ name : "dtl_dc_cost_name" },
			{ name : "dtl_f_inv_amount" },
			{ name : "dtl_f_dec_amount" },
			{ name : "dtl_f_tax_save" },
			{ name : "dtl_f_reduce" },
			{ name : "dtl_f_tax_rate" },
			{ name : "dtl_f_vat_rate" },
			{ name : "dtl_f_vat_amount" },
			{ name : "dtl_f_vat_doc" },
			{ name : "dtl_i_is_drpenalty" },
			{ name : "dtl_f_drpenalty" },
			{ name : "dtl_f_net_amount" },
			{ name : "dtl_total_type" },
			{ name : "dtl_group_acc" },
			{ name : "dtl_dc_acc_id" },
			{ name : "dtl_dc_acc_id_Name" },
			{ name : "dtl_tax_map_method_id" },
			{ name : "dtl_tax_map_method_id_Name" },
			{ name : "dtl_dc_cost_id" },
			{ name : "dtl_dc_cost_id_Name" },
			{ name : "dtl_ap_exp_doc_id" },
			{ name : "dtl_c_sp_day" },
			{ name : "dtl_c_time" },
			{ name : "dtl_c_sp_comment" },
			{ name : "dtl_dc_vat_id" },
			{ name : "dtl_c_comment" },
			{ name : "dtl_i_is_tax_restricted" },
			{ name : "dtl_dc_tax_id" },
			{ name : "dtl_i_status_cnt" },
			{ name : "dtl_i_company_pay_tax" },
			{ name : "dtl_f_pay_tax_amount" },
			{ name : "dtl_ap_penalty_id" },
			{ name : "dtl_i_is_vat_amount" },
		],
//		listeners: {
//			beforeload: function(t, records, options) { this.chkMask = false; initData(); },
//			datachanged: function(t, records, options) { this.chkMask = true; initData(); },
//		}
	});
	
	storeCopy = new Ext.data.JsonStore({
		autoLoad: false,
//		chkMask: false, // status: loading
		url: "../ap/api/List_FiPayTranHdrExpen.php",
		baseParams: { type: "storeCopy" },
	    root: "data",
	    idProperty: "id",
		totalProperty: "totalCount",
		fields: [
			{ name : "no" },
			{ name : "id" },
			{ name : "c_code" },
			{ name : "c_name" },
			{ name : "creditor_name" },
			{ name : "c_receiver_name" },
			{ name : "dc_emp_boss_name" },
			{ name : "dc_cost_name" }
		],
//		listeners: {
//			beforeload: function(t, records, options) { this.chkMask = false; initData(); },
//			datachanged: function(t, records, options) { this.chkMask = true; initData(); },
//		}
	});
	
	pay_status_arr	= new Ext.data.JsonStore({
		autoLoad: true,
//		chkMask: false, // status: loading
		url: "../ap/api/All_FiPayTranHdrExpen.php",
		baseParams: { type: "pay_status", show: "all" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ],
	    listeners: {
	    	load: function(t, records, options) { Ext.getCmp( "s_is_status" ).setValue( "99" ); },
//			beforeload: function(t, records, options) { this.chkMask = false; initData(); },
//			datachanged: function(t, records, options) { this.chkMask = true; initData(); },
		}
	});
	
	store_cost_s	= new Ext.data.JsonStore({
		autoLoad: true,
//		chkMask: false, // status: loading
		url: "../ap/api/All_FiPayTranHdrExpen.php",
		baseParams: { type: "dc_cost", show: "all" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ],
	    listeners: {
	    	load: function(t, records, options) { Ext.getCmp( "s_dc_cost_id" ).setValue( "0" ); },
//			beforeload: function(t, records, options) { this.chkMask = false; initData(); },
//			datachanged: function(t, records, options) { this.chkMask = true; initData(); },
		}
	});
	
	vw_dc_creditor	= new Ext.data.JsonStore({
		autoLoad: true,
		url: "../gl/api/All_GlTranhdr.php",
		baseParams: { type: "vw_dc_creditor" },
		root: "data",
		idProperty: "id",
		totalProperty: "totalCount",
		fields: [ "no", "id", "c_code", "c_name", "c_address", "c_tax_value", "c_ref_value" ]
	});
	
	vw_show_emp_name_gl0201b	= new Ext.data.JsonStore({
		autoLoad: true,
		url: "../gl/api/All_GlTranhdr.php",
		baseParams: { type: "vw_show_emp_name_gl0201b" },
		root: "data",
		idProperty: "id",
		totalProperty: "totalCount",
		fields: [ "no", "id", "c_code", "c_name", "c_first_name", "c_address", "c_tax_value", "c_ref_value" ]
	});
		
	storeOtherAcc	= new Ext.data.JsonStore({
		autoLoad: true,
//		chkMask: false, // status: loading
		url: "../ap/api/All_FiPayTranHdrExpen.php",
		baseParams: { type: "storeOtherAcc" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ],
	    listeners: {
//			beforeload: function(t, records, options) { this.chkMask = false; initData(); },
//			datachanged: function(t, records, options) { this.chkMask = true; initData(); },
		}
	});

	store_cost	= new Ext.data.JsonStore({
		autoLoad: true,
//		chkMask: false, // status: loading
		url: "../ap/api/All_FiPayTranHdrExpen.php",
		baseParams: { type: "dc_cost" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ],
	    listeners: {
//			beforeload: function(t, records, options) { this.chkMask = false; initData(); },
//			datachanged: function(t, records, options) { this.chkMask = true; initData(); },
		}
	});
	
	dc_bg_type	= new Ext.data.JsonStore({
		autoLoad: true,
//		chkMask: false, // status: loading
		url: "../ap/api/All_FiPayTranHdrExpen.php",
		baseParams: { type: "dc_bg_type" },
		root: "data",
		idProperty: "id",
	    fields: [ "id", "c_name" ],
	    listeners: {
//			beforeload: function(t, records, options) { this.chkMask = false; initData(); },
//			datachanged: function(t, records, options) { this.chkMask = true; initData(); },
		}
	});
	
	store_emp	= new Ext.data.JsonStore({
		autoLoad: true,
		url: "../ap/api/List_FiPayTranHdrExpen.php",
		baseParams: { type : "vw_dc_emp" },
		root: "data",
		idProperty: "id",
		totalProperty: "totalCount",
	    fields: [
	        { name : "no" },     
	        { name : "id" },
	        { name : "c_code" },
	        { name : "c_name" }
	    ]
	});
	
	store_emp2	= new Ext.data.JsonStore({
		autoLoad: true,
		url: "../ap/api/List_FiPayTranHdrExpen.php",
		baseParams: { type : "vw_dc_emp" },
		root: "data",
		idProperty: "id",
		totalProperty: "totalCount",
	    fields: [
	        { name : "no" },     
	        { name : "id" },
	        { name : "c_code" },
	        { name : "c_name" }
	    ]
	});
	
	storeCost2	= new Ext.data.JsonStore({
		autoLoad: true,
		url: "../gl/api/All_GlTranhdr.php",
		baseParams: { type : "vw_dc_cost_gl_last" },
		root: "data",
		idProperty: "id",
		totalProperty: "totalCount",
		fields: [ "id", "c_name" ]
	});
	
	//ประเภทค่าใช้จ่าย
    store_acc	= new Ext.data.JsonStore({ 
		autoLoad: false,
		url: "../ap/api/List_FiPayTranHdrExpen.php",
		baseParams: { type : "store_acc" },
	    root: "data",
	    idProperty: "id",
		totalProperty: "totalCount",
	    fields: [ "no", "id", "c_code", "c_name" ]
	});
    
    store_method	= new Ext.data.JsonStore({ 
		autoLoad: false,
		url: "../ap/api/List_FiPayTranHdrExpen.php",
		baseParams: { type : "store_method" },
	    root: "data",
	    idProperty: "id",
		totalProperty: "totalCount",
	    fields: [ "no", "id", "c_name", "dc_section_tax_id" ]
	});
    
    storeDocType = new Ext.data.JsonStore({
    	autoLoad: true,
    	url: "../ap/api/All_ArCombo.php",
		baseParams: { type : "storeDcExpDoc" },
		root: "data",
		idProperty: "id",
		totalProperty: "totalCount",
	    fields: [ "id", "c_name", "i_exp_type" ]
	 });
    
    DcVatStore = new Ext.data.JsonStore({ 
    	url: "../ap/api/All_ApCombo.php",
    	autoLoad: true,
    	baseParams: { type : "storeTax" },
    	root: "data",
    	idProperty: "id",
        fields: [ "id", "c_name", "f_vat_rate" ]
    });
    
    DcTaxStore	= new Ext.data.JsonStore({ 
    	url: "../ap/api/All_ApCombo.php",
    	autoLoad: true,
    	baseParams: { type : "dataTax" },
    	root: "data",
    	idProperty: "id",
        fields: [ "id", "c_name", "f_tax_rate", "i_type_whtax" ]
    });
    
    penaltyStore = new Ext.data.JsonStore({ 
    	url: "../ap/api/All_ApCombo.php", 
    	autoLoad: true,
    	baseParams: { type : "penaltyStore" },
    	root: "data",
    	idProperty: "id",
        fields: [ "id", "c_code", "c_name" ]
    });

    storeDecAcc = new Ext.data.JsonStore({ 
    	url: "../ap/api/All_ApCombo.php", 
    	autoLoad: true,
    	baseParams: { type : "storeDecAcc" },
    	root: "data",
    	idProperty: "id",
        fields: [ "id", "c_code", "c_name" ]
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
    var now = currentTime.getFullYear()+10;
    var yy_en = currentTime.getFullYear()-10;
    while(yy_en <= now) {
    	years.push({ id : yy_en, c_name : yy_en+543 });
    	yy_en++;
    };
    
	store_year = new Ext.data.JsonStore({
		fields: ["id", "c_name"],
		data : years
	});
	
	// pagingBar
	pagingBar = new Ext.PagingToolbar({
		pageSize: 20,
		store: store,
		displayInfo: true,
		displayMsg: "Displaying topics {0} - {1} of {2}"
	});
	
	// ========================================================== //
//	function DisbledButton(t){
//	    //Disabled etc...
//	    if( t ) {
//	        Ext.getCmp("icon-save").hide();
//	    } else {
//	        Ext.getCmp("icon-save").show();
//	    }
//	}
	
	function controllTab(record,butt) {
		
		Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; //null obj not errer
		
		var frmAdd	= new formAdd();
		
		if( butt == "add" ) {
			
			Ext.getCmp("contenterCenter").add(frmAdd);
			Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
			Ext.getCmp("role-form-mode").setValue("ADD");
			
			new Ext.Window({
				title: "แจ้งเตือน",
				id: "win-pop-add",
				modal: true,
				preventBodyReset: true,
				closable: true,
				autoScroll: true,
				maximizable: true,
				bodyStyle: {
					"background-color":"white",
					padding: "10px 10px 0px 100px",
				},
				height: (Ext.getBody().getViewSize().height * 0.9),
				width: (Ext.getBody().getViewSize().width * 0.9),
				listeners: {
					afterrender: function( component ) {
						Ext.getCmp("win-pop-add").getEl().mask("Please wait...", "x-mask-loading");
						$.ajax({
							url: "../ap/api/List_FiPayTranHdrExpen.php",
							type: "POST",
							data: { type: "year_close" },
							success: function(result) {
								Ext.getCmp("win-pop-add").getEl().unmask();
								var data = $.parseJSON( result );
								if(data.debug == true) {
									var str	= "";
									$.each(data.data , function( index, v ) {
										$("#month_show > ul:last").append("<li type=\"square\"><font size=\"3\" color=\"#660000\">"+v.c_mm+" "+v.c_yyyy+"</font></li>");
									});
								}
							}
						});
					}
				},
				html:	"<p align=left>" +
							"<font size=5 color=red><IMG SRC=./images/annou1.png border=0>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<u>แจ้งการบันทึกใบเบิก</u></font>" +
						"</p>" +
						"<ol style=\"color:brown\">" +
							"<font size=3>" +
								"<li>กรุณาใส่วันที่บันทึกให้เป็นไปตามเอกสารประกอบการเบิกจ่าย<br>(กรณีมีหลายฉบับให้ใช้วันที่สิ้นเดือนของเอกสาร)</li>" +
								"<li>กรณีออกเลข APS แล้ว จะไม่สามารถแก้ไขวันที่บันทึกและเดือนปีปฏิบัติงานได้อีก</li>" +
								"<li>ไม่สามารถใส่วันที่บันทึก ในเดือนที่ปิดงวดตั้งค้างจ่ายแล้ว</li>" +
							"</font>" +
						"</ol>" +
						"<p align=center>" +
							"<font size=5 color=blue><u>เดือนที่เปิดงวดตั้งค้างจ่าย</u></font>" +
						"</p>" +
						"<div id=\"month_show\" style=\"padding:5px;\">" +
							"<ul></ul>" +
						"</div>",
				buttonAlign: "center",
				buttons: [{
					text: "&nbsp;&nbsp;ปิดกล่องข้อความ&nbsp;&nbsp;",
					handler: function() { Ext.getCmp("win-pop-add").destroy(); }
				}]
			}).show();

		} else if( butt == "edit" || butt == "view" ) {
			
	        Ext.getCmp("contenterCenter").add(frmAdd); 
	        Ext.getCmp("contenterCenter").setActiveTab(frmAdd);  
	        Ext.getCmp("role-form-mode").setValue("EDIT");
	        Ext.getCmp("form-widgets").getForm().loadRecord(record);
	        
	        if(record.data.c_code != "") {
	        	Ext.getCmp("d_doc_date").disable(true);
	        	Ext.getCmp("span_c_mm_yyyy").disable(true);
	        }
	        
	        Ext_Show( record.data.id );
	        
	        Ext.getCmp("f_barter_amt").fn();
	        Ext.getCmp("f_barter_dec").fn();

//	        if( butt == "view" ) { DisbledButton(true); }
//	        else { DisbledButton(false); }
	        
	    } else if( butt == "delete" ) {
	    	
	    	new Ext.Window({
				id: "win-msg-delete",
				title: "แจ้งเตือน",
				modal: true,
				width: 250,
				height: 130,
				html: "ท่านต้องการที่จะลบข้อมูล ?",
				buttons: [{
					text: "Confirm",
					handler: function() {
						Ext.getCmp("win-msg-delete").getEl().mask("Please wait...", "x-mask-loading");
						Ext.Ajax.request({
							url: "../ap/api/mn_FiPayTranHdrExpen.php",
							method: "POST",
							params: {
								mode: "DELETE",
								id: record.get("id")
							},
							success: function ( result, request ) {
								Ext.getCmp("win-msg-delete").getEl().unmask();
								var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
								if ( jsonData.success == true ) {
									Ext.getCmp("win-msg-delete").destroy();						// clear memory :: garbage collection
									store.reload();
								} else {
									Ext.MessageBox.alert("Failed", jsonData.msg);			// alert massage error
								}
							},
							failure: function ( result, request) { 
								Ext.MessageBox.alert("Failed", result.responseText);		// connect error
							}
						});
					}
				}, {
					text : Ext.GLOBAL_BU_BACK_TH,
					handler : function() { Ext.getCmp("win-msg-delete").destroy(); }
				}]
			}).show();
	    }
	}; // controllTab
	
	//Class Extend
	formAdd	 = function() {

		saveHdr	= function() {
			
			var msg				= "";
			
			var i_type_person		= Ext.getCmp("i_type_person").getValue().inputValue;
			var dc_creditor_id		= "";
			var dc_emp_id			= "";
			var c_other_name		= "";
			var dc_acc_other_id		= "";
			
			var i_is_receiver_diff	= Ext.getCmp("i_is_receiver_diff").getValue().inputValue;
			var c_receiver_name		= "";
			var dc_emp_ref_id		= "";
			
			var c_str1				= "";
			var c_str2				= "";
			var c_str3				= "";
			var d_chk_date			= "";
			
			var i_is_barter			= Ext.getCmp("i_is_barter").getValue().inputValue;
			var f_barter_amt		= "";
			var f_barter_dec		= "";

			if(i_type_person == Ext.PERSON_CREDITOR) { // เจ้าหนี้ผู้ขาย/ผู้รับจ้าง

				dc_creditor_id	= Ext.getCmp("dc_creditor_id").getValue();
				if(dc_creditor_id == "") { msg += "- กรุณาเลือก เจ้าหนี้ / ผู้ยืม<br>"; }
				
			} else if(i_type_person == Ext.PERSON_EMP) { // เจ้าหนี้พนักงาน
				
				dc_emp_id		= Ext.getCmp("dc_emp_id").getValue();
				if(dc_emp_id == "") { msg += "- กรุณาเลือก เจ้าหนี้ / ผู้ยืม<br>"; }

			} else if(i_type_person == Ext.PERSON_OTHER) { // เจ้าหนี้ทั่วไป

				c_other_name	= Ext.getCmp("c_other_name").getValue();
				dc_acc_other_id	= Ext.getCmp("dc_acc_other_id").getValue();
				if(c_other_name == "") { msg += "- กรุณากรอก เจ้าหนี้ / ผู้ยืม<br>"; }
				if(dc_acc_other_id == "") { msg += "- กรุณาเลือก บัญชีเจ้าหนี้<br>"; }
				
			} else { msg += "- กรุณาเลือก ประเภทเจ้าหนี้ /ผู้ยืม<br>"; }
			
			if(i_is_receiver_diff == Ext.AP_IS_RECEIVER_DIFF3) {
				
				c_receiver_name		= Ext.getCmp("c_receiver_name").getValue();
				if(c_receiver_name == "") { msg += "- กรุณากรอก ชื่อผู้รับเงิน<br>"; }
				
			} else {
				
				dc_emp_ref_id		= Ext.getCmp("dc_emp_ref_id").getValue();
				if(dc_emp_ref_id == "") { msg += "- กรุณาเลือก ชื่อผู้รับเงิน<br>"; }
				
			}
			
			if(Ext.getCmp("dc_cost_id").getValue() == "") { msg += "- กรุณาเลือก หน่วยงานที่ขอเบิก<br>"; }
			if(Ext.getCmp("c_creditor_tax").getValue() == "" && Ext.getCmp("c_creditor_ref").getValue() == "") {
				msg += "- กรุณากรอก เลขประจำตัวผู้เสียภาษี (เจ้าหนี้) หรือ เลขบัตรประชาชน (เจ้าหนี้)<br>";
			}
			
			if(Ext.getCmp("c_creditor_addr").getValue() == "") { msg += "- กรุณากรอก ที่อยู่เจ้าหนี้<br>"; }
			if(Ext.getCmp("c_doc_ref").getValue() == "") { msg += "- กรุณากรอก เลขที่อ้างอิง<br>"; }
			if(Ext.getCmp("c_name").getValue() == "") { msg += "- กรุณากรอก เรื่อง<br>"; }

			if(PAGE_TYPE != 1) {
				c_str1		= Ext.getCmp("c_str1").getValue();
				c_str2		= Ext.getCmp("c_str2").getValue();
				c_str3		= Ext.getCmp("c_str3").getValue();
				d_chk_date	= Ext.util.Format.date(Ext.getCmp("d_chk_date").getValue(), "Y-m-d");
				if(Ext.getCmp("d_chk_date").getValue() == "") { msg += "- กรุณากรอก วันที่ตรวจจ่าย<br>"; }
			}
			if(Ext.getCmp("d_doc_date").getValue() == "") { msg += "- กรุณากรอก วันที่บันทึก<br>"; }
			if(Ext.getCmp("c_comment").getValue() == "") { msg += "- กรุณากรอก หมายเหตุ<br>"; }
			if(Ext.getCmp("c_mm").getValue() == "") { msg += "- กรุณาเลือก เดือนปฏิบัติงาน<br>"; }
			if(Ext.getCmp("c_yyyy").getValue() == "") { msg += "- กรุณาเลือก ปีปฏิบัติงาน<br>"; }
			if(Ext.getCmp("c_type_doc").getValue() == "") { msg += "- กรุณากรอก ประเภทเอกสารประกอบการเบิกจ่าย<br>"; }
			if(Ext.getCmp("c_type_doc_num").getValue() == "") { msg += "- กรุณากรอก จำนวนฉบับ<br>"; }
			
			if(i_is_barter == Ext.AP_BARTER_SETOFF) { // หักลบกลบหนี้
				
				f_barter_amt	= Ext.getCmp("f_barter_amt").getValue().replace(/,/g,"");
				if(f_barter_amt == "" || f_barter_amt == 0) { msg += "- กรุณากรอก มูลค่าหักลบกลบหนี้/แลกเปลี่ยนรวม Vat มากกว่า 0<br>"; }
				
			} else if(i_is_barter == Ext.AP_BARTER_CHANGE) { // จ่ายเงินด้วยเอกสาร / แลกเปลี่ยนสินค้า
				
				f_barter_amt	= Ext.getCmp("f_barter_amt").getValue().replace(/,/g,"");
				if(f_barter_amt == "" || f_barter_amt == 0) { msg += "- กรุณากรอก มูลค่าหักลบกลบหนี้/แลกเปลี่ยนรวม Vat มากกว่า 0<br>"; }
				f_barter_dec	= Ext.getCmp("f_barter_dec").getValue().replace(/,/g,"");
				if(f_barter_dec == "" || f_barter_dec == 0) { msg += "- กรุณากรอก ส่วนลดเงินสดของแลกเปลี่ยนมากกว่า 0<br>"; }
				
			} else {
				
				f_barter_amt	= "";
				f_barter_dec	= "";
				
			}
			if(Ext.getCmp("dc_bg_type_id").getValue() == "") { msg += "- กรุณาเลือก แหล่งที่มาของเงิน<br>"; }

			if (msg == "") {
				Ext.getCmp("frm-Add").getEl().mask("Please wait...", "x-mask-loading");
				Ext.Ajax.request({
					url: "../ap/api/mn_FiPayTranHdrExpen.php",
					method: "POST",
					params: {
						mode: Ext.getCmp("role-form-mode").getValue(),
						id: Ext.getCmp("id").getValue(),
						PAGE_TYPE: PAGE_TYPE,
						i_type_person: i_type_person,
						dc_creditor_id: dc_creditor_id,
						dc_emp_id: dc_emp_id,
						c_other_name: c_other_name,
						dc_acc_other_id: dc_acc_other_id,
						i_is_receiver_diff: i_is_receiver_diff,
						c_receiver_name: c_receiver_name,
						dc_emp_ref_id: dc_emp_ref_id,
						dc_emp_boss_id: Ext.getCmp("dc_emp_boss_id").getValue(),
						dc_cost_id: Ext.getCmp("dc_cost_id").getValue(),
						c_creditor_tax: Ext.getCmp("c_creditor_tax").getValue(),
						c_creditor_ref: Ext.getCmp("c_creditor_ref").getValue(),									
						c_job: Ext.getCmp("c_job").getValue(),
						c_location: Ext.getCmp("c_location").getValue(),
						c_creditor_addr: Ext.getCmp("c_creditor_addr").getValue(),
						c_doc_ref: Ext.getCmp("c_doc_ref").getValue(),
						c_name: Ext.getCmp("c_name").getValue(),
						c_str1: c_str1,
						c_str2: c_str2,
						c_str3: c_str3,
						d_chk_date: d_chk_date,
						d_doc_date: Ext.util.Format.date(Ext.getCmp("d_doc_date").getValue(), "Y-m-d"),
						c_comment: Ext.getCmp("c_comment").getValue(),
						c_mm: Ext.getCmp("c_mm").getValue(),
						c_yyyy: Ext.getCmp("c_yyyy").getValue(),
						c_type_doc: Ext.getCmp("c_type_doc").getValue(),
						c_type_doc_num: Ext.getCmp("c_type_doc_num").getValue(),
						i_is_barter: i_is_barter,
						f_barter_amt: f_barter_amt,
						f_barter_dec: f_barter_dec,
						dc_bg_type_id: Ext.getCmp("dc_bg_type_id").getValue()
					},
					success: function ( result, request ) {
						Ext.getCmp("frm-Add").getEl().unmask();
						var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
						if (jsonData.success == true) {
							store.load({ params : { mode: "" } });
							Ext.Msg.alert("แจ้งเตือน", "บันทึกเรียบร้อย");
							Ext_Show( jsonData.ap_expen_hdr_id);
						} else { Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg); }
					},
					failure: function ( result, request) { 
						Ext.MessageBox.alert("Failed", result.responseText);		// connect error
					}
				});
			} else { Ext.Msg.alert("แจ้งเตือน", msg); }	
		};
		
		formAdd.superclass.constructor.call(this, {
			region: "center",
			title: "ข้อมูล"+title_panel,
			id: "frm-Add",
			border: false,
			stripeRows: true,
			loadMask: true,
			listeners:{
				afterrender: function( obj, eOpts ){ /*console.log('Load Finish'); */},
			},
			items: [{
				xtype: "form",
				id: "form-widgets",
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
						title: "บันทึกข้อมูล "+title_panel,
						RemoveCls: "x-box-item",
						collapsible: true,
						collapsed: false,
						defaults: { labelStyle : "width:200px;", allowBlank: true },
						items: [{
							id: "role-form-mode",
							xtype: "hidden",
							name: "mode",
							readOnly: true
						}, {
							xtype: "hidden",
							name: "id",
							id: "id",
							readOnly: true
						}, {
							fieldLabel: "รหัส",
							xtype: "displayfield",
							name: "c_code"
						}, {
							fieldLabel: "ประเภทเจ้าหนี้ /ผู้ยืม",
							id: "i_type_person",
							xtype: "radiogroup",
							columns: [110,110,110],
							items: [
								{ boxLabel: "ผู้ขาย/ผู้รับจ้าง", checked: true, name: "i_type_person", inputValue: Ext.PERSON_CREDITOR },
								{ boxLabel: "บุคคลภายใน", name: "i_type_person", inputValue: Ext.PERSON_EMP },
								{ boxLabel: "ทั่วไป", name: "i_type_person", inputValue: Ext.PERSON_OTHER },
							],
							listeners: {
								afterrender: function() {
									this.fn	= function() {
										
										var i_type_person	= this.getValue().inputValue;
										if(i_type_person == Ext.PERSON_CREDITOR) { // เจ้าหนี้ผู้ขาย/ผู้รับจ้าง

											Ext.getCmp("pop_dc_creditor_id").show();
											Ext.getCmp("pop_dc_emp_id").hide();
											Ext.getCmp("c_other_name").hide();
											Ext.getCmp("dc_acc_other_id").hide();
										
										} else if(i_type_person == Ext.PERSON_EMP) { // เจ้าหนี้พนักงาน
											
											Ext.getCmp("pop_dc_creditor_id").hide();
											Ext.getCmp("pop_dc_emp_id").show();
											Ext.getCmp("c_other_name").hide();
											Ext.getCmp("dc_acc_other_id").hide();

										} else if(i_type_person == Ext.PERSON_OTHER) { // เจ้าหนี้ทั่วไป
											
											Ext.getCmp("pop_dc_creditor_id").hide();
											Ext.getCmp("pop_dc_emp_id").hide();
											Ext.getCmp("c_other_name").show();
											Ext.getCmp("dc_acc_other_id").show();
											
											var acc_id	= Ext.getCmp("dc_acc_other_id").getStore().data.items[0].id;
											Ext.getCmp("dc_acc_other_id").setValue(acc_id);
				                			   
										}
									}
								},
								Change: function(value) { this.fn(); }
							}
						},
						// =============== เจ้าหนี้ผู้ขาย/ผู้รับจ้าง =============== //
						new Ext.ux.Poplov({
							fieldLabel: "เจ้าหนี้ / ผู้ยืม",
							id: "dc_creditor_id",
						    iconCls: "page_magnify",
						    store: vw_dc_creditor,
						    widthText: 300,
						    isCellClickGrid: true,
					    	cellClickGrid: function(grid, rowIndex, columnIndex, e) {
	
								var record 		= grid.getStore().getAt(rowIndex);
								
								Ext.getCmp("dc_creditor_id").setValue(record.data.id);
								Ext.getCmp("dc_creditor_id_Name").setValue(record.data.c_code+' : '+record.data.c_name);
								Ext.getCmp("c_receiver_name").setValue(record.data.c_name);
								Ext.getCmp("c_creditor_addr").setValue(record.data.c_address);
								Ext.getCmp("c_creditor_tax").setValue(record.data.c_tax_value);
								Ext.getCmp("c_creditor_ref").setValue(record.data.c_ref_value);

								Ext.getCmp("win-pop-lovdc_creditor_id").destroy();
						    },
						    headerGrid: [new Ext.grid.RowNumberer({header:"ที่", width: 30,
								renderer:function(value, metaData, record, row, col, store, gridView) {
									return record.get("no");
								}
							}), {
						    	header: "ชื่อ", sortable: true, dataIndex: "c_code",
						    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
						    		metaData.attr = "style= \"cursor:pointer\";";
						    		return value;
						    	}
						    }, {
						    	id: "c_name", header: "ชื่อ", sortable: true, dataIndex: "c_name",
						    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
						    		metaData.attr = "style= \"cursor:pointer\";";
						    		return value;
						    	}
						    }]
						}).mini,
						// =============== เจ้าหนี้พนักงาน =============== //
						new Ext.ux.Poplov({
							fieldLabel: "เจ้าหนี้ / ผู้ยืม",
							id: "dc_emp_id",
						    iconCls: "page_magnify",
						    store: vw_show_emp_name_gl0201b,
						    widthText: 300,
						    hidden: true,
						    isCellClickGrid: true,
					    	cellClickGrid: function(grid, rowIndex, columnIndex, e) {
	
								var record 		= grid.getStore().getAt(rowIndex);
								
								Ext.getCmp("dc_emp_id").setValue(record.data.id);
								Ext.getCmp("dc_emp_id_Name").setValue(record.data.c_code+' : '+record.data.c_name);
								Ext.getCmp("c_receiver_name").setValue(record.data.c_name);
								Ext.getCmp("c_creditor_addr").setValue(record.data.c_address);
								Ext.getCmp("c_creditor_tax").setValue(record.data.c_tax_value);
								Ext.getCmp("c_creditor_ref").setValue(record.data.c_ref_value);

								Ext.getCmp("win-pop-lovdc_emp_id").destroy();
						    },
						    headerGrid: [new Ext.grid.RowNumberer({header:"ที่", width: 30,
								renderer:function(value, metaData, record, row, col, store, gridView) {
									return record.get("no");
								}
							}), {
						    	header: "ชื่อ", sortable: true, dataIndex: "c_code",
						    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
						    		metaData.attr = "style= \"cursor:pointer\";";
						    		return value;
						    	}
						    }, {
						    	id: "c_name", header: "ชื่อ", sortable: true, dataIndex: "c_name",
						    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
						    		metaData.attr = "style= \"cursor:pointer\";";
						    		return value;
						    	}
						    }]
						}).mini, {
						// =============== เจ้าหนี้ทั่วไป =============== //
							xtype: "textfield",
							fieldLabel: "เจ้าหนี้ / ผู้ยืม", 
							id: "c_other_name",
							name: "c_other_name",
							emptyText: "เจ้าหนี้ / ผู้ยืม ทั่วไป",
							hidden: true,
							width: 300
						}, new Ext.form.ComboBox({
							fieldLabel: "บัญชีเจ้าหนี้", 
							id: "dc_acc_other_id",
							name: "dc_acc_other_id",
							mode: "local",
							store: storeOtherAcc,
							valueField: "id",
							displayField: "c_name",
							triggerAction: "all",
							forceSelection: true,
	    					selectOnFocus: true,
	    					typeAhead : false,
	    					emptyText: "กรุณาเลือก...",
							width: 300,
							hidden: true,
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
						}), {
							fieldLabel: "สำหรับจัดทำใบรายจ่ายพิเศษ",
							id: "i_is_receiver_diff",
							xtype: "radiogroup",
							columns: [500],
							items: [
								{ boxLabel: "จ่ายให้เจ้าหนี้โดยตรง (ผู้รับ คือ เจ้าหนี้)", checked: true, name: "i_is_receiver_diff", inputValue: Ext.AP_IS_RECEIVER_DIFF3 },
								{ boxLabel: "จ่ายคืนกรณีผู้ทำงานสำรองจ่ายเงินไปก่อน (ผู้รับ คือ ผู้สำรองจ่าย)", name: "i_is_receiver_diff", inputValue: Ext.AP_IS_RECEIVER_DIFF1 },
								{ boxLabel: "กรณีผู้รับมอบฉันทะเป็นผู้รับเงิน", name: "i_is_receiver_diff", inputValue: Ext.AP_IS_RECEIVER_DIFF2 }
							],
							listeners: {
								afterrender: function() {
									this.fn	= function() {
										if( this.getValue().inputValue == Ext.AP_IS_RECEIVER_DIFF3 ) {
											Ext.getCmp("c_receiver_name").show();
											Ext.getCmp("pop_dc_emp_ref_id").hide();
										} else {
											Ext.getCmp("c_receiver_name").hide();
											Ext.getCmp("pop_dc_emp_ref_id").show();
										}
									}
								},
								Change: function(value) { this.fn(); }
							}
						}, {
							xtype: "textfield",
							id: "c_receiver_name",
							name: "c_receiver_name",
							fieldLabel: "ชื่อผู้รับเงิน",
							width: 300
						}, new Ext.ux.Poplov({
							fieldLabel: "ชื่อผู้รับเงิน",
							id: "dc_emp_ref_id",
						    iconCls: "page_magnify",
						    store: store_emp,
						    widthText: 300,
						    hidden: true,
						    isCellClickGrid: true,
					    	cellClickGrid: function(grid, rowIndex, columnIndex, e) {
	
								var record 		= grid.getStore().getAt(rowIndex);
								
								Ext.getCmp("dc_emp_ref_id").setValue(record.data.id);
								Ext.getCmp("dc_emp_ref_id_Name").setValue(record.data.c_name);
								
								Ext.getCmp("win-pop-lovdc_emp_ref_id").destroy();
						    },
						    headerGrid: [{
						    	header: "ชื่อ", sortable: true, dataIndex: "c_code",
						    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
						    		metaData.attr = "style= \"cursor:pointer\";";
						    		return value;
						    	}
						    }, {
						    	id: "c_name", header: "ชื่อ", sortable: true, dataIndex: "c_name",
						    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
						    		metaData.attr = "style= \"cursor:pointer\";";
						    		return value;
						    	}
						    }]
						}).mini,
						new Ext.ux.Poplov({
							fieldLabel: "ขอเสนอเพื่อโปรดอนุมัติ โดย",
							id: "dc_emp_boss_id",
						    iconCls: "page_magnify",
						    store: store_emp2,
						    widthText: 300,
						    isCellClickGrid: true,
					    	cellClickGrid: function(grid, rowIndex, columnIndex, e) {
	
								var record 		= grid.getStore().getAt(rowIndex);
								
								Ext.getCmp("dc_emp_boss_id").setValue(record.data.id);
								Ext.getCmp("dc_emp_boss_id_Name").setValue(record.data.c_name);
								Ext.getCmp("win-pop-lovdc_emp_boss_id").destroy();
								
						    },
						    headerGrid: [new Ext.grid.RowNumberer({header:"ที่", width: 30,
								renderer:function(value, metaData, record, row, col, store, gridView) {
									return record.get("no");
								}
							}), {
						    	header: "ชื่อ", sortable: true, dataIndex: "c_code",
						    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
						    		metaData.attr = "style= \"cursor:pointer\";";
						    		return value;
						    	}
						    }, {
						    	id: "c_name", header: "ชื่อ", sortable: true, dataIndex: "c_name",
						    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
						    		metaData.attr = "style= \"cursor:pointer\";";
						    		return value;
						    	}
						    }]
						}).mini,
						new Ext.ux.Poplov({
							fieldLabel: "หน่วยงานที่ขอเบิก",
							id: "dc_cost_id",
						    iconCls: "page_magnify",
						    store: store_cost,
						    widthText: 300,
						    isCellClickGrid: true,
					    	cellClickGrid: function(grid, rowIndex, columnIndex, e) {
	
								var record 		= grid.getStore().getAt(rowIndex);
								
								Ext.getCmp("dc_cost_id").setValue(record.data.id);
								Ext.getCmp("dc_cost_id_Name").setValue(record.data.c_name);
								Ext.getCmp("win-pop-lovdc_cost_id").destroy();
								
						    },
						    headerGrid: [{
						    	id: "c_name", header: "ชื่อ", sortable: true, dataIndex: "c_name",
						    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
						    		metaData.attr = "style= \"cursor:pointer\";";
						    		return value;
						    	}
						    }]
						}).mini, {
							xtype: "textfield",
							fieldLabel: "ในงาน",
							id: "c_job",
							name: "c_job",
							width: 300
						}, {	
							xtype: "textarea",
							fieldLabel: "สถานที่ปฏิบัติงาน",
							id: "c_location",
							name: "c_location",
							width: 300
						}, {
							xtype: "textarea",
							fieldLabel: "ที่อยู่เจ้าหนี้",
							id: "c_creditor_addr",
							name: "c_creditor_addr",
							width: 300
						}, {
							xtype: "textfield",
							fieldLabel: "เลขประจำตัวผู้เสียภาษี (เจ้าหนี้)",
							id: "c_creditor_tax",
							name: "c_creditor_tax",
							width: 300,
							listeners: {
								afterrender: function() {
									this.fn	= function() { this.setValue(floatAccount(this.getValue(), 0)); }
								},
								Change: function(value) { this.fn(); }
							}
						}, {
							xtype: "textfield",
							fieldLabel: "เลขบัตรประชาชน (เจ้าหนี้)",
							id: "c_creditor_ref",
							name: "c_creditor_ref",
							width: 300,
							listeners: {
								afterrender: function() {
									this.fn	= function() { this.setValue(floatAccount(this.getValue(), 0)); }
								},
								Change: function(value) { this.fn(); }
							}
						}, {	
							xtype: "textfield",
							fieldLabel: "เลขที่อ้างอิง",
							id: "c_doc_ref",
							name: "c_doc_ref",
							width: 300
						}, {
							xtype: "textarea",
							fieldLabel: "เรื่อง",
							id: "c_name",
							name: "c_name",
							width: 300
						}, {
							xtype: "textfield",
							fieldLabel: "ใบสำคัญจ่าย : รายการจ่าย/บรรทัด 1",
							id: "c_str1",
							name: "c_str1",
							hidden: (PAGE_TYPE == 1)? true : false,
							width: 300
						}, {
							xtype: "textfield",
							fieldLabel: "ใบสำคัญจ่าย : รายการจ่าย/บรรทัด 2",
							id: "c_str2",
							name: "c_str2",
							hidden: (PAGE_TYPE == 1)? true : false,
							width: 300
						}, {
							xtype: "textfield",
							fieldLabel: "ใบสำคัญจ่าย : รายการจ่าย/บรรทัด 3",
							id: "c_str3",
							name: "c_str3",
							hidden: (PAGE_TYPE == 1)? true : false,
							width: 300
						}, {
							xtype: "datefield",
							fieldLabel: "วันที่ตรวจจ่าย",
					    	id: "d_chk_date",
					    	name: "d_chk_date",
					    	hidden: (PAGE_TYPE == 1)? true : false,
					    	width: 100
						}, {
							xtype: "datefield",
							fieldLabel: "วันที่บันทึก",
							id: "d_doc_date",
							name: "d_doc_date",
							value: addY(543),
							width: 100
						}, {
							xtype: "textarea",
							fieldLabel: "หมายเหตุ",
							id: "c_comment",
							name: "c_comment",
							width: 300
						}, {
							xtype: "compositefield",
							fieldLabel: "เดือน/ปีปฏิบัติงาน",
							id: "span_c_mm_yyyy",
							anchor: "100%",
							msgTarget: "under",
							items: [new Ext.form.ComboBox({
								id: "c_mm",
								name: "c_mm",
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
								width: 100,
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
							}), new Ext.form.ComboBox({
								id: "c_yyyy",
								name: "c_yyyy",
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
								width: 100,
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
							}), {
								xtype: "displayfield",
								hidden: (PAGE_TYPE == 1)? false : true,
								value: "<font color=red> *กรณีออกเลข AP แล้ว จะไม่สามารถกลับมาแก้ไขวันที่บันทึก/เดือนปีปฏิบัติงานได้อีก</font>"
							}]
		                }, {
							xtype: "textfield",
							id: "c_type_doc",
							name: "c_type_doc",
							fieldLabel: "ประเภทเอกสารประกอบการเบิกจ่าย",
							width: 300
						}, {
							xtype: "textfield",
							id: "c_type_doc_num",
							name: "c_type_doc_num",
							fieldLabel: "จำนวนฉบับ",
							width: 300,
							listeners: {
								afterrender: function() {
									this.fn	= function() {
										this.setValue(floatAccount(this.getValue(), 0));
									}
								},
								Change: function(value) { this.fn(); }
							}
						}, {
							fieldLabel: "&nbsp;",
							id: "i_is_barter",
							xtype: "radiogroup",
							columns: [320,300],
							items: [
							        { boxLabel: "หักลบกลบหนี้", name: "i_is_barter", inputValue: Ext.AP_BARTER_SETOFF },
							        { boxLabel: "จ่ายเงินด้วยเอกสาร / แลกเปลี่ยนสินค้า", name: "i_is_barter", inputValue: Ext.AP_BARTER_CHANGE },
							        { boxLabel: "ไม่เป็น หักลบกลบหนี้ ,จ่ายเงินด้วยเอกสาร/แลกเปลี่ยนสินค้า ",  checked: true, name: "i_is_barter", inputValue: Ext.AP_BARTER_NO },
							        { boxLabel: "เบิกเป็นเงินได้ของตนเอง", name: "i_is_barter", inputValue: Ext.AP_BARTER_MY_INCOME }
							],
							listeners: {
								afterrender: function() {
									this.fn	= function() {
										var i	= this.getValue().inputValue;
										if(i == Ext.AP_BARTER_SETOFF) { // หักลบกลบหนี้
											Ext.getCmp("f_barter_amt").show();
											Ext.getCmp("f_barter_dec").hide();
										} else if(i == Ext.AP_BARTER_CHANGE) { // จ่ายเงินด้วยเอกสาร / แลกเปลี่ยนสินค้า
											Ext.getCmp("f_barter_amt").show();
											Ext.getCmp("f_barter_dec").show();
										} else {
											Ext.getCmp("f_barter_amt").hide();
											Ext.getCmp("f_barter_dec").hide();
										}
									}
								},
								Change: function(value) { this.fn(); }
							}
						}, {
							xtype: "textfield",
							fieldLabel: "มูลค่าหักลบกลบหนี้/แลกเปลี่ยนรวม Vat",
							id: "f_barter_amt",
							name: "f_barter_amt",
							style: "text-align: right",
							cls: "float-textfield",
							hidden: true,
							width: 300,
							listeners: {
								afterrender: function() {
									this.fn	= function() {
										this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2)));
									}
								},
								Change: function(value) { this.fn(); }
							}
						}, {
							xtype: "textfield",
							fieldLabel: "ส่วนลดเงินสดของแลกเปลี่ยน",
							id: "f_barter_dec",
							name: "f_barter_dec",
							style: "text-align: right",
							cls: "float-textfield",
							hidden: true,
							width: 300,
							listeners: {
								afterrender: function() {
									this.fn	= function() {
										this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2)));
									}
								},
								Change: function(value) { this.fn(); }
							}
						}, {
							xtype: "checkbox",
							fieldLabel: "&nbsp;",
							id: "i_center",
							name: "i_center",
							inputValue: 1,
							boxLabel: "ขอเบิกเงินจากส่วนกลาง",
							checked: true,
							disabled: true  
						}, new Ext.form.ComboBox({
							fieldLabel: "แหล่งที่มาของเงิน",
							id: "dc_bg_type_id",
							name: "dc_bg_type_id",
							mode: "local",
							store: dc_bg_type,
							valueField: "id",
							displayField: "c_name",
							triggerAction: "all",
							forceSelection: true,
	    					selectOnFocus: true,
	    					typeAhead : false,
	    					emptyText: "กรุณาเลือก...",
							width: 300,
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
				buttonAlign: "left",
				buttons: [{
					text : "&nbsp;"+Ext.GLOBAL_BU_SAVE_TH+"&nbsp;",
					id: "icon-save",
					iconCls	: "icon-save",
					handler : function() { saveHdr(); }
				}, {
					text: Ext.GLOBAL_BU_BACK_TH,
					handler: function() {
						Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
					}
				}]
			}, { html: "<div id=\"Ext_Show\"></div>", border: false }]
		});
	}; // formAdd
	Ext.extend(formAdd, Ext.Panel, {}); 
	
	// cellClick
	cellClick	= function( grid, rowIndex, columnIndex, e ) {
		
		var record = grid.getStore().getAt(rowIndex);
		
		if (columnIndex == grid.getColumnModel().getIndexById("edit")) {
			
			if( record.data.i_enable == 1 && record.data.i_is_status == Ext.FI_BR_I_IS_STATUS4 ) {
				controllTab(record, "edit");
			}
		}
//		} else if (columnIndex == grid.getColumnModel().getIndexById("Print")) {
//			if ( (record.data.c_code!='') && (record.data.i_enable==1) )
//			{
//				var href		= "../ap/report/Rep_CreditorPrint.php";
//		    	var resultUrl	= "";
//		    	
//		    	resultUrl	+= "&fi_pay_tran_hdr_id="+record.data.id;
//		    	resultUrl	= (resultUrl != "")? "?"+resultUrl.substring(1) : "";
//		    	
//				window.open(href+resultUrl, "_Self");
//		      	window.focus();
//  			}
// 						
//			
//		}
		else if (columnIndex == grid.getColumnModel().getIndexById("delete")) {
			
			if( record.data.i_enable == 1 && record.data.i_is_status == Ext.FI_BR_I_IS_STATUS4 ) {
				controllTab(record, "delete");
			}
			
		}
		
	}; //cellClick
	
	//================================ gridMain ================================//
	gridMain = new Ext.grid.GridPanel({
		region: "center",
		layout: "fit",
		title: "แสดงรายการ"+title_panel,
		id: "tabpanel1",
		border: false,
		stripeRows: true,
		loadMask: true,
		store: store,
		viewConfig : {
			emptyText: "ไม่มีข้อมูล..",
			deferEmptyText: false
		},
		tbar: [{ // กล่องค้นหาข้อมูล 1
			xtype: "buttongroup",
			title: "ระบุเงื่อนไขในการค้นหาข้อมูล",
			columns: 1,
            defaults: { scale: "small", style: "float: right" },
            items: [{ // แถวที่ 1
            	xtype: "buttongroup",
            	frame: false,
            	items: [{ xtype: "label", text: "ค้นหาโดย : " }, { xtype: "tbspacer", width: 4 }, {
	            	id: "filter",
            		xtype: "combo",
		            width: 130,
					mode: "local",
		            store: new Ext.data.SimpleStore({
		            	fields: [ "value", "text" ],
						data: [
						       [ "c_code", "เลขที่เอกสาร" ],
						       [ "c_doc_ref", "เลขที่ใบแจ้งหนี้" ],
						       [ "c_name", "เรื่อง" ]
						      ]
					}),
					value: "c_code",
					valueField: "value",
					displayField: "text",
					allowBlank: false,
					editable: false,
					triggerAction: "all",
					typeAhead : false
				}, { xtype: "tbspacer", width: 4 }, {
            		xtype: "textfield",
            		id: "value-box",
            		width: 150,
           			fieldLabel: "fieldLabel",
           			emptyText: "คำที่ต้องการค้นหา"
           		}]
            }, { // แถวที่ 2
            	xtype: "buttongroup",
            	frame: false,
            	items: [{ xtype: "label", text: "สถานะใบเบิก : " }, { xtype: "tbspacer", width: 4 },
        	        new Ext.form.ComboBox({
						id: "s_is_status",
						width: 284,
						mode: "local",
					    store: pay_status_arr,
						value: "99",
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
					})
           		]
            }],
            buttonAlign: "left",
            buttons:[{
				text : "เพิ่มข้อมูล",
				id: "buAdd",
				iconCls: "icon-add",
				hidden: (PAGE_TYPE != 1)? true : false,
				handler: function(grid, rowIndex, colIndex) { controllTab({}, "add"); }
			}]
		}, { // กล่องค้นหาข้อมูล 2
			xtype: "buttongroup",
			title: "&nbsp;",
			columns: 1,
            defaults: { scale: "small", style: "float: right" },
            items: [{ // แถวที่ 1
            	xtype: "buttongroup",
            	frame: false,
            	items: [{ xtype: "label", text: "ระหว่างวันที่ : " }, { xtype: "tbspacer", width: 4 }, {
            		id: "s_doc_date1", xtype: "datefield", width: 122, 
    				listeners : {
						afterrender : function() {
							var date = new Date();
								date = new Date(date.getFullYear()+543, date.getMonth()-2, 1);
							this.setValue(date);
						}
					}
            	}, { xtype: "tbspacer", width: 5 }, { xtype: "label", text: "ถึงวันที่ : " }, { xtype: "tbspacer", width: 4 }, {
            		id: "s_doc_date2", xtype: "datefield", width: 122, 
    				listeners : {
						afterrender : function() {
							this.setValue(addY(543));
						}
					}
            	}]
            }, { // แถวที่ 2
            	xtype: "buttongroup",
            	frame: false,
            	items: [{ xtype: "label", text: "หน่วยงานขอเบิก : " }, { xtype: "tbspacer", width: 4 }, 
        	        new Ext.form.ComboBox({
						id: "s_dc_cost_id",
						width: 290,
						mode: "local",
					    store: store_cost_s,
						value: "0",
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
					})
            	]
            }],
            buttonAlign: "left",
			buttons:[{
				text : "ค้นหา",
				iconCls: "icon-magnifier",
    			handler : function() {
    				
    				var msg	= "";
    				
    				if(Ext.getCmp("s_doc_date1").getValue() == "" || Ext.getCmp("s_doc_date2").getValue() == "") {
    					msg	+= "กรุณากรอก วันที่<br>";
    				}
    				
    				if(msg == "") {
    					
    					var value	= "";
    					var filter	= "";
    					
						if(Ext.getCmp("value-box").getValue() != "") {
							value	= Ext.getCmp("value-box").getValue();
							filter	= Ext.getCmp("filter").getValue();
						}
						
						store.load({
							params: {
								mode: "SEARCH",
								s_is_status: Ext.getCmp("s_is_status").getValue(),
								s_doc_date1: Ext.util.Format.date(Ext.getCmp("s_doc_date1").getValue(), "Y-m-d"),
								s_doc_date2: Ext.util.Format.date(Ext.getCmp("s_doc_date2").getValue(), "Y-m-d"),
								s_dc_cost_id: Ext.getCmp("s_dc_cost_id").getValue(),
								value: value,
								filter: filter
							}
						});
						
    				} else { Ext.Msg.alert("แจ้งเตือน", msg); }
    			}
			}, { xtype: "tbfill" }, {				
				text : "รายการส่งกลับ",
				iconCls: "page-copy-icon",
				hidden: (PAGE_TYPE != 1)? true : false,
				handler: function(grid, rowIndex, colIndex) {
					
					var cellClick_lov_copy	= function(grid, rowIndex, columnIndex, e) {
						
						var record	= grid.getStore().getAt(rowIndex);

						Ext.getCmp("ss_ap_expen_hdr_id").setValue(record.id);
						Ext.getCmp("ss_c_code").setValue(record.data.c_code);
						Ext.getCmp("ss_c_name").setValue(record.data.c_name);
						Ext.getCmp("ss_creditor_name").setValue(record.data.creditor_name);
						Ext.getCmp("ss_c_receiver_name").setValue(record.data.c_receiver_name);
						Ext.getCmp("ss_dc_emp_boss_name").setValue(record.data.dc_emp_boss_name);
						Ext.getCmp("ss_dc_cost_name").setValue(record.data.dc_cost_name);						
					};
					
					new Ext.Window({
						title: "เลือกข้อมูล",
						id: "win-pop-copy",
						layout: "column",
						modal: true,
						border: false,
						items:[{ // column 1
				            columnWidth: 0.4,
				            layout: "fit",
				            height: (Ext.getBody().getViewSize().height * 0.8),
							width: (Ext.getBody().getViewSize().width * 0.25),
							border: false,
				            items: [new Ext.FormPanel({
				                labelWidth: 150, // label settings here cascade unless overridden
				                labelAlign: "right",
				                frame: true,
				                items: [{
				                    xtype: "fieldset",
				                    title: "รายการที่เลือก",
				                    items :[{
				                    	xtype: "hidden",
				                    	id: "ss_ap_expen_hdr_id"
				                    }, {
				                    	fieldLabel: "รหัส",
				                    	xtype: "textfield",
				                    	id: "ss_c_code",
				                    	width: "90%",
				                    	readOnly: true
				                    }, {
				                    	fieldLabel: "เจ้าหนี้ / ผู้ยืม",
			                    		xtype: "textfield",
				                    	id: "ss_creditor_name",
				                    	width: "90%",
				                    	readOnly: true
				                    }, {
				                    	fieldLabel: "วันที่บันทึกบัญชี",
			                    		xtype: "textfield",
				                    	id: "ss_c_receiver_name",
				                    	width: "90%",
				                    	readOnly: true
				                    }, {
				                    	fieldLabel: "ขอเสนอเพื่อโปรดอนุมัติ โดย",
			                    		xtype: "textfield",
				                    	id: "ss_dc_emp_boss_name",
				                    	width: "90%",
				                    	readOnly: true
				                    }, {
				                    	fieldLabel: "หน่วยงานขอเบิก",
			                    		xtype: "textfield",
				                    	id: "ss_dc_cost_name",
				                    	width: "90%",
				                    	readOnly: true
				                    }, {
										xtype: "textarea",
										fieldLabel: "เรื่อง",
										id: "ss_c_name",
										width: "90%",
										readOnly: true
									}, {
										xtype: "datefield",
										fieldLabel: "วันที่บันทึก",
										id: "ss_d_doc_date",
										value: addY(543),
										width: 205
									}, {
										xtype: "compositefield",
										fieldLabel: "เดือน/ปีปฏิบัติงาน",
										anchor: "100%",
										msgTarget: "under",
										items: [new Ext.form.ComboBox({
											id: "ss_c_mm",
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
											width: 100,
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
										}), new Ext.form.ComboBox({
											id: "ss_c_yyyy",
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
											width: 100,
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
				                buttons: [{
				                    text: "ส่งกลับ",
				                    iconCls: "page-copy-icon",
				                    handler : function() {
				                    	var msg	= "";
				                    	
				                    	var ap_expen_hdr_id	= Ext.getCmp("ss_ap_expen_hdr_id").getValue();
				                    	
				                    	if(ap_expen_hdr_id == "") { msg	+= "- กรุณาเลือกรายการทางด้านซ้าย<br>"; }
				                    	if(Ext.getCmp("ss_d_doc_date").getValue() == "") { msg += "- กรุณากรอก วันที่บันทึก<br>"; }
				                    	if(Ext.getCmp("ss_c_mm").getValue() == "") { msg += "- กรุณาเลือก เดือนปฏิบัติงาน<br>"; }
				            			if(Ext.getCmp("ss_c_yyyy").getValue() == "") { msg += "- กรุณาเลือก ปีปฏิบัติงาน<br>"; }
				            			
				                    	if(msg == "") {
				                    		
				                    		new Ext.Window({
				    							id: "win-pop-confirm",
				    							title: "ยืนยันรายการ",
				    							modal: true,
				    							autoHeight: true,
				    							width: 250,
				    							html: "<div style=\"background: #fff; height: 70px;\">ท่านต้องการส่งกลับหรือไม่?</div>",
				    							buttons: [{
				    								text: "Confirm",
				    								handler: function() {
				    									Ext.getCmp("win-pop-confirm").getEl().mask("Please wait...", "x-mask-loading");
				    									Ext.Ajax.request({
				    										url: "../ap/api/mn_FiPayTranHdrExpen.php",
				    										method: "POST",
				    										params: {
				    											mode: "REVERSE", 
				    											ap_expen_hdr_id: ap_expen_hdr_id,
				    											d_doc_date: Ext.util.Format.date(Ext.getCmp("ss_d_doc_date").getValue(), "Y-m-d"),
				    					                    	c_mm: Ext.getCmp("ss_c_mm").getValue(),
				    					                    	c_yyyy: Ext.getCmp("ss_c_yyyy").getValue()
				    										},
				    										success: function ( result, request ) {
				    											Ext.getCmp("win-pop-confirm").getEl().unmask();
				    											var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
				    											if (jsonData.success == true) {
				    												Ext.getCmp("win-pop-confirm").destroy();
					    											Ext.getCmp("win-pop-copy").destroy();
					    											
					    											Ext.Msg.alert("แจ้งเตือน", "บันทึกเรียบร้อยแล้ว");
					    											store.load({
					    												params : {
					    													mode:"SEARCH",
					    													ap_expen_hdr_id: jsonData.ap_expen_hdr_id,
					    													s_is_status: 99
					    												}
					    											});
				    											} else {
				    												Ext.getCmp("win-pop-confirm").destroy();
				    												Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg);			// alert massage error
				    											}
				    										},
				    										failure: function ( result, request) { 
				    											Ext.MessageBox.alert("Failed", result.responseText);		// connect error
				    										}
				    									});
				    								}
				    							}, {
				    								text : Ext.GLOBAL_BU_BACK_TH,
				    								handler : function() { Ext.getCmp("win-pop-confirm").destroy(); }
				    							}]
				    						}).show();
				                    		
				                    	} else { Ext.Msg.alert("แจ้งเตือน", msg); }
				                    }
				                },{
				                    text: Ext.GLOBAL_BU_BACK_TH,
				                    handler : function() { Ext.getCmp("win-pop-copy").destroy(); }
				                }]
				            })]
						}, { // column 2
				            columnWidth: 0.6,
				            layout: "fit",
				            height: (Ext.getBody().getViewSize().height * 0.8),
							width: (Ext.getBody().getViewSize().width * 0.65),
				            items: [{
								xtype: "grid",
								id: "grid-copy",
								border: false,
								stripeRows: true,
								loadMask: true,
								store: storeCopy,
								viewConfig : {
									emptyText: "ไม่มีข้อมูล..",
									deferEmptyText: false
								},
								listeners : {
									afterrender : function() {
										this.getStore().setBaseParam("mode","");
										this.getStore().load();
									}
								},
								tbar: [{
									id: "copy-filter",
									xtype: "combo",
									width: 110,
									mode: "local",
									store: new Ext.data.SimpleStore({
										fields: [ "value", "text" ],
										data: [
										       [ "c_code", "รหัสใบเบิก" ],
										       [ "c_name", "เรื่องใบเบิก" ]
										      ]
									}),
									valueField: "value",
									displayField: "text",
									value: "c_code",
									allowBlank: false,
									editable: false,
									triggerAction: "all",
									typeAhead : false,
									emptyText : "เลือกตัวกรอง",
								}, " ", {
									id: "copy-value",
									xtype: "textfield",
									width: 130,
									emptyText : "คำที่ต้องการค้นหา",
								}, "-", {
									text: "ค้นหา",
									iconCls: "icon-magnifier",
									handler : function() {
										if (Ext.getCmp("copy-value").getValue() != "") {
											storeCopy.setBaseParam("filter", Ext.getCmp("copy-filter").getValue());
											storeCopy.setBaseParam("value", Ext.getCmp("copy-value").getValue());
										} else {
											storeCopy.setBaseParam("value", "");
											storeCopy.setBaseParam("filter", "");
										}

										storeCopy.setBaseParam("mode", "SEARCH");
										storeCopy.load();
									}
								}],
								bbar: new Ext.PagingToolbar({
							    	pageSize: 20,
							    	store: storeCopy,
							    	displayInfo: true,
							    	displayMsg: "Displaying topics {0} - {1} of {2}"
							    }),
								columns:[
								new Ext.grid.RowNumberer({header:"ที่", width: 30,
									renderer:function(value, metaData, record, row, col, store, gridView) {
										return record.get("no");
									}
								}), {
									header: "รหัสใบเบิก", sortable: true, dataIndex: "c_code",
									renderer: function(value, metaData, record, rowIndex, colIndex, store) {
							    		metaData.attr = "style= 'cursor:pointer; text-align:center;';";
							    		return value;
							    	}
							    }, {
							    	id: "c_name", header: "เรื่องใบเบิก", sortable: true, dataIndex: "c_name",
							    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
							    		metaData.attr = "style= 'cursor:pointer;';";
							    		return value;
							    	}
							    }], 
							    autoExpandColumn: "c_name"
							}]
						}]
					}).show();

					Ext.getCmp("grid-copy").on("cellclick", cellClick_lov_copy, this);
					
				}
			}]
		}],
		columns: [
		    new Ext.grid.RowNumberer({header:"ที่", width: 30,
				renderer: function(value, metaData, record, row, col, store, gridView) {
					return record.get("no");
				}
			}),
			{ header: "ID System", sortable: true, hidden: true, dataIndex: "id" },
			{ id: "Print", header: "พิมพ์", sortable: true, align: "center", width: 50, dataIndex: "id",
				renderer: function(value, metaData, record, row, col, store, gridView) {
					var i_is_status	= record.get("i_is_status");
					if(record.get("i_enable") == 2
						|| i_is_status == Ext.FI_BR_I_IS_STATUS_1 
						|| i_is_status == Ext.FI_BR_I_IS_STATUS0 ) { 
						return "";
					} else { 
						return "<img src=\"../images/icons/printer_mono.png\"); style=\"cursor:pointer\"/>";
					}
				}
			},
			{ id: "specail_pay", header: "ใบรายจ่ายพิเศษ", sortable: true, align: "center", dataIndex: "id",
				renderer: function(value, metaData, record, row, col, store, gridView) {
					var i_is_status	= record.get("i_is_status");
					if(record.get("i_enable") == 2
						|| record.get("i_exp_type") == Ext.DC_EXP_DOC_EXP_TYPE_OTHER
						|| i_is_status == Ext.FI_BR_I_IS_STATUS_1 
						|| i_is_status == Ext.FI_BR_I_IS_STATUS0 ) { 
						return "";
					} else { 
						return "<img src=\"../images/icons/page_header_footer.png\"); style=\"cursor:pointer\"/>";
					}
				}
			},
			{ id: "edit", header: "แก้ไข", sortable: true, align: "center", dataIndex: "id",
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					var i_is_status = record.get("i_is_status");
					if( record.get("i_enable")==1 && i_is_status==Ext.FI_BR_I_IS_STATUS4 ) {
						return'<img src="../images/icons/document_edit.gif"); style="cursor:pointer"/>';
					} else { 
						return "";
					}
				}
			},
			{ id: "delete", header: "ลบ", sortable: false, align: "center", width: 50, dataIndex: "id",
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					var i_is_status = record.get("i_is_status");
					if( record.get("i_enable")==1 && i_is_status==Ext.FI_BR_I_IS_STATUS4 ) { 
						return "<img src=\"../images/icons/document_delete.gif\"); style=\"cursor:pointer\"/>";
					} else { 
						return "";
					}
				}
			},
			{ header: "สถานะใบเบิก", sortable: true, align: "center", dataIndex: "show_is_status" },
			{ header: "สถานะใช้งาน", sortable: true, align: "center", dataIndex: "i_enable",
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					if( value == 1 ) {
						return "<span style=\"color:green;\">"+record.data.show_enable+"</span>";
					} else {
						return "<span style=\"color:red;\">"+record.data.show_enable+"</span>";
					}
				}
			},
			{ header: "เลขที่เอกสาร", sortable: true, align: "center", dataIndex: "c_code" },
			{ header: "เลขที่เอกสารอ้างอิง", sortable: true, dataIndex: "c_doc_ref" },
			{ header: "หน่วยงานขอเบิก", sortable: true, dataIndex: "dc_cost_name" },
			{ header: "วันที่บันทึก", sortable: true, align: "center", dataIndex: "d_doc_date",
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					return (value != "")? shortThaiDate(value) : "";
				}
			},
			{ header: "เรื่อง", sortable: true, dataIndex: "c_subject" },
			{ header: "ชื่อเจ้าหนี้", sortable: true, dataIndex: "creditor_name" },
			{ header: "จำนวนเงินทั้งหมด", sortable: true, align: "center", dataIndex: "f_total_amount",
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					metaData.attr = "style='text-align:right; color:blue; font-weight:bold;'";
					return (value > 0)? floatRenderer(floatMinus(value, 2)) : "0.00";
				}
			},
			{ header: "จำนวนเงินภาษีมูลค่าเพิ่ม", sortable: true, align: "center", dataIndex: "f_vat_amount",
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					metaData.attr = "style='text-align:right; color:blue; font-weight:bold;'";
					return (value > 0)? floatRenderer(floatMinus(value, 2)) : "0.00";
				}
			},
			{ header: "จำนวนงินรวมภาษีมูลค่าเพิ่ม", sortable: true, align: "center", dataIndex: "f_total_add_vat_amt",
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					metaData.attr = "style='text-align:right; color:blue; font-weight:bold;'";
					return (value > 0)? floatRenderer(floatMinus(value, 2)) : "0.00";
				}
			},
			{ header: "จำนวนงินภาษีหัก ณ ที่จ่าย", sortable: true, align: "center", dataIndex: "f_wht_amount",
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					metaData.attr = "style='text-align:right; color:blue; font-weight:bold;'";
					return (value > 0)? floatRenderer(floatMinus(value, 2)) : "0.00";
				}
			},
			{ header: "จำนวนเงินค่าปรับเงินล่าช้า", sortable: true, align: "center", dataIndex: "f_penalty",
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					metaData.attr = "style='text-align:right; color:blue; font-weight:bold;'";
					return (value > 0)? floatRenderer(floatMinus(value, 2)) : "0.00";
				}
			},
			{ header: "จำนวนเงินขอเบิก", sortable: true, align: "center", dataIndex: "f_net_amount",
				renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					metaData.attr = "style='text-align:right; color:blue; font-weight:bold;'";
					return (value > 0)? floatRenderer(floatMinus(value, 2)) : "0.00";
				}
			}
		],
//		autoExpandColumn: "c_comment",
		bbar: pagingBar
	}); //gridMain
	
	//=================================== รายละเอียดเพิ่มเติม ===================================//
	Ext_Show = function( hdr_id ) {

		$("#Ext_Show").empty();
		
		cellClick_DTL	= function( grid, rowIndex, columnIndex, e ) {
			
			var record = grid.getStore().getAt(rowIndex);
			
			if (columnIndex == grid.getColumnModel().getIndexById("edit")) {
				
				if(!record.data.dtl_total_type) {
					
					store_acc.setBaseParam("group_acc", record.data.dtl_group_acc);
					store_acc.setBaseParam("filter","c_code");
					store_acc.setBaseParam("value","");
					store_acc.setBaseParam("mode", "SEARCH");
					store_acc.load();
					
					store_method.setBaseParam("ap_expen_hdr_id", hdr_id);
					store_method.setBaseParam("dc_acc_id", record.data.dtl_dc_acc_id);
					store_method.setBaseParam("filter","c_code");
					store_method.setBaseParam("value","");
					store_method.setBaseParam("mode", "SEARCH");
					store_method.load();

					EDIT_DTL("EDIT_DTL");
			        Ext.getCmp("form-widgets-dtl").getForm().loadRecord(record);
			        
			        Ext.getCmp("dtl_ap_exp_doc_id").fn();
			        Ext.getCmp("dtl_f_pay_tax_amount").fn();
			        Ext.getCmp("dtl_f_inv_amount").fn();
			        Ext.getCmp("dtl_f_dec_amount").fn();
			        Ext.getCmp("dtl_f_tax_save").fn();
			        Ext.getCmp("dtl_f_reduce").fn();
			        Ext.getCmp("dtl_f_drpenalty").fn();
			        
			        getCmbTaxRate( record.data.id, record.data.dtl_tax_map_method_id );
			        
				}
				
			} else if (columnIndex == grid.getColumnModel().getIndexById("delete")) {
				
				if(!record.data.dtl_total_type) {
					new Ext.Window({
			    		id: "win-msg-delete",
			    		title: "แจ้งเตือน",
			    		modal: true,
			    		width: 250,
			    		height: 130,
			    		html: "ท่านต้องการที่จะลบข้อมูล ?",
			    		buttons : [{
			    			text : "Confirm",
			    			handler : function() {
			    				Ext.Ajax.request({
			    					url: "../ap/api/mn_FiPayTranHdrExpen.php",
			    					params : {
			    						mode: "DELETE_DTL",
			    						id: record.get("id")
			    					},
			    					method: "POST", //POST
			    					success: function ( result, request ) {
			    						var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
			    						if (jsonData.success == true) {
			    							Ext.getCmp("win-msg-delete").destroy();						// clear memory :: garbage collection
			    							Ext_Show( jsonData.ap_expen_hdr_id );
			    							editMsg();
			    						} else {
			    							Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg);			// alert massage error
			    						}
			    					},
			    					failure: function ( result, request) {
			    						Ext.MessageBox.alert("แจ้งเตือน", result.responseText);		// connect error
			    					}
			    				});
			    			}
			    		}, {
			    			text: "Cancel",
			    			handler: function() { Ext.getCmp("win-msg-delete").destroy(); }
			    		}]
			    	}).show();
				}
			}
		}; //cellClick_DTL
		
		function editMsg() {
			var msg	= "เมื่อมีการ (เพิ่ม / แก้ไข) รายละเอียดค่าใช้จ่ายกรุณากด <font color='red'>\"คำนวณมูลค่าสุทธิ\"</font> ทุกครั้ง";
			Ext.MessageBox.alert("แจ้งเตือน", msg);
		};
		
		Ext.getStoreItems = function(store, value, itemName) {
			var index_id	= store.findExact("id", value);
			var rec 		= store.data.items[index_id];
			try { return rec.get(itemName); }
			catch(err) { console.log("error : "+itemName); }
		};
		
		// คำนวณยอดเงิน
		function getEleFloat(){
			
			var i_is_vat_amount	= Ext.getCmp("dtl_i_is_vat_amount").getValue().inputValue;
			var f_vat_rate		= parseFloat(Ext.getStoreItems(DcVatStore, Ext.getCmp("dtl_dc_vat_id").getValue(),"f_vat_rate"));
			var f_reduce		= parseFloat(Ext.getCmp("dtl_f_reduce").getValue().replace(/,/g,""));
			
			// จำนวนเงินที่ขอเบิก 
			var f_inv	= parseFloat(Ext.getCmp("dtl_f_inv_amount").getValue().replace(/,/g,""));
			var f_inv	= (f_inv > 0)? f_inv : 0;
			// จำนวนเงินส่วนลดเงินสด
			var f_dec	= parseFloat(Ext.getCmp("dtl_f_dec_amount").getValue().replace(/,/g,""));
			var f_dec	= (f_dec > 0)? f_dec : 0;
			// จำนวนเงินภาษีที่บริษัทออกให้
			var f_comp		= parseFloat(Ext.getCmp("dtl_f_pay_tax_amount").getValue().replace(/,/g,""));
			var f_comp		= (f_comp > 0)? f_comp : 0;
			
			var f_dec_amt	= parseFloat(f_inv-f_dec).toFixed(2); // get หลังหักส่วนลดเงินสด 5/4(2 ตำแหน่ง) set หลังหักส่วนลดเงินสด
			var f_comp		= ( Ext.getCmp("dtl_i_company_pay_tax").getValue().inputValue == 1 )? parseFloat(f_comp).toFixed(2) : 0;
			
			var f_net_dec_vat		= ( i_is_vat_amount == 1 )? Ext.getCmp("dtl_f_vat_amount").getValue().replace(/,/g,"") : parseFloat((f_dec_amt*f_vat_rate)/100).toFixed(2);
			var f_tax_company_show	= (parseFloat(f_dec_amt)+ parseFloat(f_comp)).toFixed(2); // จำนวนเงินขอเบิกรวมภาษีที่ออกให้
			 
			// ภาษีหัก ณ ที่จ่าย
			if( Ext.getCmp("dtl_dc_tax_id").getValue() != "" ) {
				
				var f_tax_rate = Ext.getStoreItems(DcTaxStore, Ext.getCmp("dtl_dc_tax_id").getValue(),"f_tax_rate");
				var i_type_whtax = Ext.getStoreItems(DcTaxStore, Ext.getCmp("dtl_dc_tax_id").getValue(),"i_type_whtax");
			
			} else { var f_tax_rate = 0; }
			
			// กรณีภาษีหัก ณ ที่จ่าย เป็นอัตราก้าวหน้า
			if ( i_type_whtax == Ext.TAX_BY_PROGRESS ) {
				f_tax_rate	= parseFloat(Ext.getCmp("dtl_dc_tax_rate").getValue().replace(/,/g,""));
			}

			var f_net_dec_tax		= parseFloat((f_dec_amt*f_tax_rate)/100).toFixed(2);  //คิดหัก ณ ที่จ่าย
			var f_pen				= parseFloat(Ext.getCmp("dtl_f_drpenalty").getValue().replace(/,/g,"")); //ค่าปรับ
			var f_pen				= (f_pen > 0)? f_pen : 0;
			var methodePen			= 0;
			var f_pen_amt			= f_pen;
			
			switch ( Ext.getCmp("dtl_i_is_drpenalty").getValue().inputValue ) {
				case Ext.PNT_CAL_TAX:
					f_pen_amt	= f_pen;
					methodePen	= parseFloat((f_pen*f_tax_rate)/100).toFixed(2);
					break;
				case Ext.PNT_NON_TAX:		f_pen_amt	= f_pen;	break;
				default: 					f_pen_amt	= 0;		break;
			}
			
			var summary = parseFloat(parseFloat(f_tax_company_show)
							+ parseFloat(f_net_dec_vat)
							- parseFloat(parseFloat(f_net_dec_tax-methodePen))
							- parseFloat(f_reduce)
							- parseFloat(f_pen_amt)
						);
			
			Ext.getCmp("dtl_f_net_dec").setValue(f_dec_amt); // จำนวนเงินขอเบิกหลังหักส่วนลดเงินสด
			Ext.getCmp("dtl_f_net_dec").fn();
			Ext.getCmp("dtl_f_tax_company").setValue(f_comp); // จำนวนเงินภาษีที่บริษัทออกให้
			Ext.getCmp("dtl_f_tax_company").fn();
			Ext.getCmp("dtl_f_tax_company_show").setValue(f_tax_company_show); // จำนวนเงินขอเบิกรวมภาษีที่ออกให้
			Ext.getCmp("dtl_f_tax_company_show").fn();
			if (!Ext.getCmp("dtl_i_is_vat_amount").items.items[1].checked) { // กรณีแก้ไขจำนวนเงินภาษีมูลค่าเพิ่ม (มีผลกับการคำนวณมูลค่าสุทธิ) => ไม่ต้องคำนวณให้
				Ext.getCmp("dtl_f_vat_amount").setValue(floatRenderer(f_net_dec_vat)); // จำนวนเงินภาษีมูลค่าเพิ่ม(คำนวณ)
			}
			Ext.getCmp("dtl_f_tax_amount").setValue(f_net_dec_tax-methodePen); // จำนวนเงินภาษีหัก ณ ที่จ่าย
			Ext.getCmp("dtl_f_tax_amount").fn();
			if( Ext.getCmp("dtl_i_is_drpenalty").getValue().inputValue == Ext.PNT_NO ) { // ค่าปรับพนักงาน
				Ext.getCmp("dtl_f_drpenalty_show").setValue(0);
				Ext.getCmp("dtl_f_drpenalty_show").fn();
			} else {
				Ext.getCmp("dtl_f_drpenalty_show").setValue(f_pen);
				Ext.getCmp("dtl_f_drpenalty_show").fn();
			}
			Ext.getCmp("dtl_f_net_amount").setValue(summary.toFixed(2)); // จำนวนเงินจ่ายสุทธิ
			Ext.getCmp("dtl_f_net_amount").fn();
		};
		
		// หารายการภาษีหัก ณ ที่จ่ายแยกตามประเภทเจ้าหนี้
		function getCmbTaxRate( dtl_id, tax_map_method_id ) {
			
			Ext.getCmp("win-pop-dtl").getEl().mask("Please wait...", "x-mask-loading");
			$.ajax({
				url: "../ap/api/List_FiPayTranHdrExpen.php",
				type: "POST",
				data: {
					type: "getConditionCmbTaxRate",
					ap_expen_hdr_id: hdr_id,
					ap_expen_dtl_id: dtl_id,
					tax_map_method_id : tax_map_method_id
				},
				success: function(result) {
					Ext.getCmp("win-pop-dtl").getEl().unmask();
					var DataObjson = $.parseJSON( result );
					
					Ext.getCmp("dtl_whtax").setValue(DataObjson.data.whtax_txt);
					Ext.getCmp("dtl_dc_section_tax_name").setValue(DataObjson.data.tx);
					
					DcTaxStore.load({
						params: {
							"i_is_salary" : DataObjson.data.i_is_salary,
							"i_type_person" : DataObjson.data.i_type_person,
							"i_is_oth_m48" : DataObjson.data.i_is_oth_m48,
							"i_is_cnt_m48" : DataObjson.data.i_is_cnt_m48,
							"i_is_emp_m40_1" : DataObjson.data.i_is_emp_m40_1
						},
						scope: this,
						callback: function(records, operation, success) {
							if ( success == true ) {
								var idSet	= 0;
								for( i=0; i < DcTaxStore.data.items.length; i++ ) {
									var rec = DcTaxStore.data.items[i];
									if (i == 0) { idSet = rec.data.id; }
									if( DataObjson.data.dc_wht_id == rec.data.id ) {
										idSet = rec.data.id;
									}
								} // loop
								Ext.getCmp("dtl_dc_tax_id").setValue(idSet);
								
								getEleFloat();
							} //success
						}
					});
				}
			});
		};
		
		EDIT_DTL	= function (mode) {
						
			new Ext.Window({
				title: "บันทึกรายละเอียดค่าใช้จ่าย",
				id: "win-pop-dtl",
				modal: true,
				border: false,
				maximizable: true,
				autoScroll: true,
				height: (Ext.getBody().getViewSize().height * 0.9),
				width: (Ext.getBody().getViewSize().width * 0.9),
				listeners: {
					afterrender: function( component ) {
						
						// ================== LOAD DATA ================== //
						Ext.getCmp("win-pop-dtl").getEl().mask("Please wait...", "x-mask-loading");
						$.ajax({
							url: "../ap/api/List_FiPayTranHdrExpen.php",
							type: "POST",
							data: {
								type: "contentTxt",
								ap_expen_hdr_id: hdr_id
							},
							success: function(result) {
								Ext.getCmp("win-pop-dtl").getEl().unmask();
								var data = $.parseJSON( result );
								if( data.success == true ) {
									
									$("#exp_contentTxt").html(data.data.contentTxt);
									Ext.getCmp("checkDefaultTaxRate").setValue(data.data.checkDefaultTaxRate);
									Ext.getCmp("dtl_dc_tax_rate").setValue(data.data.dc_tax_rate);
								}
							}
						});
						// =============================================== //
					}
				},
				items: [{
					xtype: "form",
					id: "form-widgets-dtl",
					frame: true,
					labelAlign: "right",
					labelWidth: 200,
					bodyStyle: { padding: "10px 20px" },
					defaults: { labelStyle : "width:200px;", allowBlank: true },
					items: [{
						xtype: "hidden",
						id: "dtl_id",
						name: "id"
					}, {
						xtype: "hidden",
						id: "checkDefaultTaxRate"
					}, {
						xtype: "hidden",
						id: "dtl_dc_tax_rate"
					}, {
						xtype: "panel",
						html : "<div id=\"exp_contentTxt\" style=\"padding-bottom: 2px;\"></div>",
					},
					new Ext.form.ComboBox({
						id: "dtl_group_acc",
						name: "dtl_group_acc",
						fieldLabel: "หมวดผังบัญชี",
						width: 284,
						mode: "local",
						store: new Ext.data.JsonStore({
							fields: [ "id", "c_name" ],
							data : [
								        { id: "3", c_name: "ค่าใช้จ่าย" },
								        { id: "1", c_name: "หนี้สิน" },
								        { id: "2", c_name: "อื่น ๆ" }
								       ]
						}),
						valueField: "id",
						displayField: "c_name",
						triggerAction: "all",
						forceSelection: true,
						selectOnFocus: true,
						typeAhead : false,
						emptyText: "กรุณาเลือก...",
						listeners: {
							afterrender: function() {
	
								this.fn	= function() {
									
									Ext.getCmp("dtl_dc_acc_id").setValue(null);
									Ext.getCmp("dtl_dc_acc_id_Name").setValue(null);
									Ext.getCmp("dtl_tax_map_method_id").setValue(null);
									Ext.getCmp("dtl_tax_map_method_id_Name").setValue(null);
									
									Ext.getCmp("win-pop-dtl").getEl().mask("Please wait...", "x-mask-loading");
									store_acc.setBaseParam("group_acc", this.getValue());
									store_acc.setBaseParam("filter","c_code");
									store_acc.setBaseParam("value","");
									store_acc.setBaseParam("mode", "SEARCH");
									store_acc.load({ callback: function(records, operation, success) { if ( success == true ) {
										this.chkMask = true;
										Ext.getCmp("win-pop-dtl").getEl().unmask();
									} } });
								}
							},
							Change: function(value) { this.fn(); },
							beforequery: function(q) {
								if (q.query) {
									var length = q.query.length;
									q.query = new RegExp(Ext.escapeRe(q.query));
									q.query.length = length;
								}
							},
							blur: function() { this.getStore().clearFilter(); }
						}
					}), new Ext.ux.Poplov({
						fieldLabel: "ประเภทค่าใช้จ่าย",
						id: "dtl_dc_acc_id",
						name: "dtl_dc_acc_id",
					    iconCls: "page_magnify",
					    store: store_acc,
					    widthText: 300,
					    isCellClickGrid: true,
				    	cellClickGrid: function(grid, rowIndex, columnIndex, e) {

				    		var record 		= grid.getStore().getAt(rowIndex);
							
							Ext.getCmp("dtl_dc_acc_id").setValue(record.data.id);
							Ext.getCmp("dtl_dc_acc_id_Name").setValue(record.data.c_code+" : "+record.data.c_name);
							Ext.getCmp("dtl_tax_map_method_id").setValue(null);
							Ext.getCmp("dtl_tax_map_method_id_Name").setValue(null);
							
							Ext.getCmp("win-pop-dtl").getEl().mask("Please wait...", "x-mask-loading");
							store_method.setBaseParam("ap_expen_hdr_id", hdr_id);
							store_method.setBaseParam("dc_acc_id", record.data.id);
							store_method.setBaseParam("filter","c_code");
							store_method.setBaseParam("value","");
							store_method.setBaseParam("mode", "SEARCH");
							store_method.load({ callback: function(records, operation, success) { if ( success == true ) {
								this.chkMask = true;
								Ext.getCmp("win-pop-dtl").getEl().unmask();
							} } });

							Ext.getCmp("win-pop-lovdtl_dc_acc_id").destroy();
							
					    },
					    headerGrid: [{
					    	header: "ID System", sortable: true, hidden: true, dataIndex: "id"
					    }, {
					    	header: "รหัส", sortable: true, align:"center", dataIndex: "c_code",
					    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					    		metaData.attr = "style= \"cursor:pointer\";";
					    		return value;
					    	}
					    }, {
					    	id: "c_name", header: "ชื่อ", sortable: true, dataIndex: "c_name",
					    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					    		metaData.attr = "style= \"cursor:pointer\";";
					    		return value;
				    		}
				    	}],
					}).mini,
					new Ext.ux.Poplov({
						fieldLabel: "ประเภทเงินได้",
						id: "dtl_tax_map_method_id",
						name: "dtl_tax_map_method_id",
					    iconCls: "page_magnify",
					    store: store_method,
					    widthText: 300,
				 	    headerGrid	: [{
				 	    	header: "ID System", sortable: true, hidden:true, dataIndex: "id"
				 	    }, {
				 	    	id: "c_name", header: "ชื่อ", sortable: true, dataIndex: "c_name",
				 	    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
				 	    		metaData.attr = "style= \"cursor:pointer\";";
					    		return value;
							}
				 	    }],
				 	    isCellClickGrid:true,
				 	    cellClickGrid : function(grid, rowIndex, columnIndex, e){

				 			var record 		= grid.getStore().getAt(rowIndex);
				 			
							Ext.getCmp("dtl_tax_map_method_id").setValue(record.data.id);
							Ext.getCmp("dtl_tax_map_method_id_Name").setValue(record.data.c_name);

							Ext.getCmp("win-pop-lovdtl_tax_map_method_id").destroy();

							getCmbTaxRate( 0,record.data.id ); // หารายการภาษีหัก ณ ที่จ่ายแยกตามประเภทเจ้าหนี้
				 	    }
					}).mini, {
						xtype: "radiogroup",
						columns: [300],
						fieldLabel: "ค่าใช้จ่ายของ",
						items:[{ boxLabel: "หน่วยงาน/ศูนย์ต้นทุน", checked: true, name: "i_exp_by", inputValue:1 }],
					}, new Ext.ux.Poplov({
						fieldLabel: "หน่วยงาน/ศูนย์ต้นทุน",
						id: "dtl_dc_cost_id",
						name: "dtl_dc_cost_id",
					    iconCls: "page_magnify",
					    store: storeCost2,
					    widthText: 300,
					    headerGrid: [{
					    	header: "ID System", sortable: true, hidden: true, dataIndex: "id"
					    }, {
					    	id: "c_name", header: "ชื่อ", sortable: true, dataIndex: "c_name",
					    	renderer: function(value, metaData, record, rowIndex, colIndex, store) {
					    		metaData.attr = "style= \"cursor:pointer\";";
					    		return value;
				    		}
				    	}],
				    	isCellClickGrid:true,
				 	    cellClickGrid : function(grid, rowIndex, columnIndex, e){

				 			var record 		= grid.getStore().getAt(rowIndex);
				 			
							Ext.getCmp("dtl_dc_cost_id").setValue(record.data.id);
							Ext.getCmp("dtl_dc_cost_id_Name").setValue(record.data.c_name);

							Ext.getCmp("win-pop-lovdtl_dc_cost_id").destroy();
				 	    }
					}).mini,
					new Ext.form.ComboBox({
						id: "dtl_ap_exp_doc_id",
						name: "dtl_ap_exp_doc_id",
						fieldLabel: "ประเภทเอกสาร",
						width: 300,
						mode: "local",
						store: storeDocType,
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
								this.fn();
							},
							beforequery: function(q) {
								if (q.query) {
									var length = q.query.length;
									q.query = new RegExp(Ext.escapeRe(q.query));
									q.query.length = length;
								}
							},
							blur: function() { this.getStore().clearFilter(); },
							afterrender: function( obj, eOpts ) {
								this.fn = function() {
										
										var i			= obj.getStore().findExact("id", obj.getValue());
										var i_exp_type	= obj.getStore().data.items[i].json.i_exp_type;
						
										if( i_exp_type == 1 ) {
											Ext.getCmp("dtl_c_sp_comment").show();
											Ext.getCmp("dtl_c_time").show();
											Ext.getCmp("dtl_c_sp_day").show();
										} else {
											Ext.getCmp("dtl_c_sp_comment").hide();
											Ext.getCmp("dtl_c_time").hide();
											Ext.getCmp("dtl_c_sp_day").hide();
										}
								}; //End func
							}
						}
					}), {
						xtype: "textfield",
						fieldLabel: "วันที่ปฏิบัติงาน",
						id: "dtl_c_sp_day",
						name: "dtl_c_sp_day",
						hidden: true,
						width: 300
					}, {
						xtype: "textfield",
						fieldLabel: "ปฏิบัติงานระหว่างเวลา",
						id: "dtl_c_time",
						name: "dtl_c_time",
						hidden: true,
						width: 300
					}, {
						xtype: "textarea",
						fieldLabel: "ค่าใช้จ่าย สำหรับใบรายจ่ายพิเศษ",
						id: "dtl_c_sp_comment",
						name: "dtl_c_sp_comment",
						hidden: true,
						width: 300
					}, {
						xtype: "textarea",
						fieldLabel: "หมายเหตุ",
						id: "dtl_c_comment",
						name: "dtl_c_comment",
						width: 300
					}, {
						xtype: "compositefield",
						id: "span_vat",
						fieldLabel: "ภาษีมูลค่าเพิ่ม",
						anchor: "100%",
						msgTarget: "under",
						items: [new Ext.form.ComboBox({
							id: "dtl_dc_vat_id",
							name: "dtl_dc_vat_id",
							width: 300,
							mode: "local",
							store: DcVatStore,
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
									this.fn();
								},
								beforequery: function(q) {
									if (q.query) {
										var length = q.query.length;
										q.query = new RegExp(Ext.escapeRe(q.query));
										q.query.length = length;
									}
								},
								blur: function() { this.getStore().clearFilter(); },
								afterrender: function() {
									this.fn = function() { getEleFloat(); }; //End func
								}
							}
						}), { xtype: "displayfield", width: 10 }, {
							xtype: "checkbox",
							id: "dtl_i_is_tax_restricted",
							name: "dtl_i_is_tax_restricted",
							boxLabel: "เป็นภาษีซื้อต้องห้าม",
							inputValue: 1
						}]
					}, {
						xtype: "displayfield",
						fieldLabel: "ประเภทการหักภาษี ณ ที่จ่าย",
						id: "dtl_whtax",
						name: "dtl_whtax",
						style: "font-weight: bold; color: blue; font-size: 14px;"
					}, {
						xtype: "displayfield",
						fieldLabel: "ภาษีหัก ณ ที่จ่าย",
						id: "dtl_dc_section_tax_name",
						name: "dtl_dc_section_tax_name",
						style: "font-weight: bold; color: #9948D7; font-size: 14px;"
					}, {
						xtype: "compositefield",
						id: "span_tax",
						fieldLabel: "ภาษีหัก ณ ที่จ่าย",
						anchor: "100%",
						msgTarget: "under",
						items: [new Ext.form.ComboBox({
							id: "dtl_dc_tax_id",
							name: "dtl_dc_tax_id",
							width: 300,
							mode: "local",
							store: DcTaxStore,
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
									this.fn();
								},
								beforequery: function(q) {
									if (q.query) {
										var length = q.query.length;
										q.query = new RegExp(Ext.escapeRe(q.query));
										q.query.length = length;
									}
								},
								blur: function() { this.getStore().clearFilter(); },
								afterrender: function() {
									this.fn = function() { getEleFloat(); }; //End func
								}
							}
						}), { xtype: "displayfield", width: 10 }, {
							xtype: "checkbox",
							id: "dtl_i_status_cnt",
							name: "dtl_i_status_cnt",
							boxLabel: "กรณีนิติบุคคล",
							inputValue: 1
						}]
					}, { 
						id: "dtl_i_company_pay_tax",
						name: "dtl_i_company_pay_tax",
						fieldLabel: "ประเภทของภาษีที่ออกให้",
						xtype: "radiogroup",
						columns: [ 100, 120 ],
						items: [
							{ boxLabel: "บริษัทไม่ออกให้", checked: true, name: "i_company_pay_tax", inputValue: 2 },
							{ boxLabel: "ออกให้ทอดเดียว", name: "i_company_pay_tax", inputValue: 1 }
						],
						listeners: {
							change : function(cb, rec, ind) {
								this.fn(rec.inputValue);
							},
							afterrender: function( obj, eOpts ) {
								this.fn = function(i) {
									if( i == 2 ) {
										Ext.getCmp("dtl_f_pay_tax_amount").setDisabled(true);
									} else {
										Ext.getCmp("dtl_f_pay_tax_amount").setDisabled(false);
									}
									getEleFloat();
								}
							}
						}
					}, {
						xtype: "textfield",
						fieldLabel: "จำนวนเงินภาษีที่บริษัทออกให้",
						id: "dtl_f_pay_tax_amount",
						name: "dtl_f_pay_tax_amount",
						style: "text-align: right",
						cls: "float-textfield",
						width: 300,
						disabled: true,
						listeners: {
							afterrender: function() {
								this.fn	= function() {
									this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2)));
									getEleFloat();
								}
							},
							Change: function(value) { this.fn(); }
						}
					}, {
						xtype: "buttongroup",
						columns: 6,
						items: [
						// จำนวนเงินที่ขอเบิก
						{
							xtype: "displayfield",
							value: "จำนวนเงินที่ขอเบิก:",
							cls: "ui-label",
							style: "text-align: right",
							width: 195
						}, { xtype: "displayfield", width: 6 }, {
							xtype: "textfield",
							id: "dtl_f_inv_amount",
							name: "dtl_f_inv_amount",
							style: "text-align: right; color: blue; font-weight: bolder;",
							width: 200,
							listeners: {
								afterrender: function() {
									this.fn	= function() {
										this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2)));
										getEleFloat(); // คำนวณยอดเงิน
									}
								},
								Change: function(value) { this.fn(); }
							},
						}, { xtype: "displayfield", width: 6 },
						{ xtype: "displayfield", cls: "ui-label", value: "บาท (ไม่รวมภาษีมูลค่าเพิ่ม)" },
						{ xtype: "displayfield", width: 6 },
						// จำนวนเงินส่วนลดเงินสด
						{
							xtype: "displayfield",
							value: "จำนวนเงินส่วนลดเงินสด :",
							cls: "ui-label",
							style: "text-align: right",
							width: 195
						}, { xtype: "displayfield", width: 6 }, {
							xtype: "textfield",
							id: "dtl_f_dec_amount",
							name: "dtl_f_dec_amount",
							style: "text-align: right; color: blue; font-weight: bolder;",
							width: 200,
							listeners: {
								afterrender: function() {
									this.fn	= function() {
										this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2)));
										getEleFloat(); // คำนวณยอดเงิน
									}
								},
								Change: function(value) { this.fn(); }
							},
						}, { xtype: "displayfield", width: 6 },
						{ xtype: "displayfield", cls: "ui-label", value: "บาท" },
						{ xtype: "displayfield", width: 6 },
						// จำนวนเงินภาษีหัก ณ ที่จ่าย (เรียกเก็บ)
						{
							xtype: "displayfield",
							value: "จำนวนเงินภาษีหัก ณ ที่จ่าย (เรียกเก็บ):",
							cls: "ui-label",
							style: "text-align: right",
							width: 195
						}, { xtype: "displayfield", width: 6 }, {
							xtype: "textfield",
							id: "dtl_f_tax_save",
							name: "dtl_f_tax_save",
							style: "text-align: right; color: blue; font-weight: bolder;",
							width: 200,
							listeners: {
								afterrender: function() {
									this.fn	= function() {
										this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2)));
									}
								},
								Change: function(value) { this.fn(); }
							},
						}, { xtype: "displayfield", width: 6 },
						{ xtype: "displayfield", cls: "ui-label", value: "บาท <span style=\"color: green;\">กรณีเรียกเก็บ ไม่ต้องใส่จำนวนเงินภาษีที่เรียกเก็บที่ ช่องจำนวนเงินภาษีหัก ณ ที่จ่าย</span>" },
						{ xtype: "displayfield", width: 6 },
						// จำนวนเงินหักอื่นๆ
						{
							xtype: "displayfield",
							value: "จำนวนเงินหักอื่นๆ:",
							cls: "ui-label",
							style: "text-align: right",
							width: 195
						}, { xtype: "displayfield", width: 6 }, {
							xtype: "textfield",
							id: "dtl_f_reduce",
							name: "dtl_f_reduce",
							style: "text-align: right; color: blue; font-weight: bolder;",
							width: 200,
							listeners: {
								afterrender: function() {
									this.fn	= function() {
										this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2)));
										getEleFloat(); // คำนวณยอดเงิน
									}
								},
								Change: function(value) { this.fn(); }
							},
						}, { xtype: "displayfield", width: 6 },
						{ xtype: "displayfield", cls: "ui-label", value: "บาท" },
						{ xtype: "displayfield", width: 6 }]
					}, {
						xtype: "radiogroup",
						fieldLabel: "ค่าปรับเบิกเงินล่าช้า",
						id: "dtl_i_is_drpenalty",
						columns: [ 200, 240, 230 ],
						items: [
							{ boxLabel: Ext.PNT_NO_TXT, checked: true,	name: "dtl_i_is_drpenalty", inputValue: Ext.PNT_NO },
							{ boxLabel: Ext.PNT_CAL_TAX_TXT, 			name: "dtl_i_is_drpenalty", inputValue: Ext.PNT_CAL_TAX },
							{ boxLabel: Ext.PNT_NON_TAX_TXT, 			name: "dtl_i_is_drpenalty", inputValue: Ext.PNT_NON_TAX},
							{ boxLabel: Ext.PNT_NOT_CAL_TAX_TXT, 		name: "dtl_i_is_drpenalty", inputValue: Ext.PNT_NOT_CAL_TAX },
							{ boxLabel: Ext.PNT_PAID_TXT, 				name: "dtl_i_is_drpenalty", inputValue: Ext.PNT_PAID }
						],
						listeners: {
							afterrender: function( obj, eOpts ) {
								this.fn = function() {
									if( this.getValue().inputValue == Ext.PNT_NO ) {
										Ext.getCmp("dtl_f_drpenalty").setDisabled(true);
										Ext.getCmp("dtl_ap_penalty_id").setDisabled(true);
									} else {
										Ext.getCmp("dtl_f_drpenalty").setDisabled(false);
										Ext.getCmp("dtl_ap_penalty_id").setDisabled(false);
									}
								}
							},
							change : function(cb, rec, ind) {
								this.fn();
								getEleFloat();
							},
						}
					}, {
						xtype: "compositefield",
						id: "span_f_drpenalty",
						fieldLabel: "&nbsp;",
						anchor: "100%",
						msgTarget: "under",
						items: [{
							xtype: "textfield",
							id: "dtl_f_drpenalty",
							name: "dtl_f_drpenalty",
							style: "text-align: right; color: blue; font-weight: bolder;",
							disabled: true,
							width: 150,
							listeners: {
								afterrender: function() {
									this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2))); }
								},
								Change: function(value) {
									this.fn();
									getEleFloat();
								}
							},
						}, { xtype: "displayfield", value: "บาท" }]
					}, new Ext.form.ComboBox({
						fieldLabel: "บัญชีค่าปรับ",
						id: "dtl_ap_penalty_id",
						name: "dtl_ap_penalty_id",
						width: 300,
						mode: "local",
						store: penaltyStore,
						valueField: "id",
						displayField: "c_name",
						triggerAction: "all",
						forceSelection: true,
						selectOnFocus: true,
						typeAhead : false,
						emptyText: "กรุณาเลือก...",
						disabled: true,
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
					}), {
						xtype: "radiogroup",
						id: "dtl_i_is_vat_amount",
						fieldLabel: "แก้ไขจำนวนภาษีมูลค่าเพิ่ม",
						columns: [ 160, 180, 400 ],
						items: [
							{ boxLabel: "กรณีคำนวณตรงกับเอกสาร", checked: true,								name: "dtl_i_is_vat_amount", inputValue: 3 },
							{ boxLabel: "แก้ไขจำนวนเงินภาษีมูลค่าเพิ่ม <br>(มีผลกับการคำนวณมูลค่าสุทธิ)",						name: "dtl_i_is_vat_amount", inputValue: 1 },
							{ boxLabel: "แก้ไขจำนวนเงินภาษีมูลค่าเพิ่ม ที่ทศนิยมมีส่วนต่างกับคำนวณ <br>(ไม่มีผลกับการคำนวณมูลค่าสุทธิ)",	name: "dtl_i_is_vat_amount", inputValue: 2 }, 
						],
						listeners: {
							afterrender: function( obj, eOpts ){
								this.fn = function(i) {
									
									if( i == 3 ) {
										
										Ext.getCmp("dtl_f_vat_doc").setReadOnly(true);
										Ext.getCmp("dtl_f_vat_amount").setReadOnly(true);
										Ext.getCmp("dtl_f_vat_doc").setValue("0.00");
										
									} else if( i == 1 ) {
										
										Ext.getCmp("dtl_f_vat_doc").setReadOnly(true);
										Ext.getCmp("dtl_f_vat_amount").setReadOnly(false);
										Ext.getCmp("dtl_f_vat_doc").setValue("0.00");
										
									} else if( i == 2 ) {
										
										Ext.getCmp("dtl_f_vat_doc").setReadOnly(false);
										Ext.getCmp("dtl_f_vat_amount").setReadOnly(true);
										
									}
									getEleFloat();
								}
							},
		                    change : function(cb, rec, ind) { this.fn(rec.inputValue); },
						} 
					}, {
						xtype: "buttongroup",
						columns: 6,
						bodyStyle: { background: "#eee" },
						items: [
						// จำนวนเงินขอเบิกหลังหักส่วนลดเงินสด
						{
							xtype: "displayfield",
							value: "จำนวนเงินขอเบิกหลังหักส่วนลดเงินสด:",
							cls: "ui-label",
							style: "text-align: right",
							width: 195
						}, { xtype: "displayfield", width: 6 }, {
							xtype: "textfield",
							id: "dtl_f_net_dec",
							name: "dtl_f_net_dec",
							style: "text-align: right; color: blue; font-weight: bolder;",
							width: 200,
							readOnly:true,
							listeners: {
								afterrender: function() {
									this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2))); }
								},
								Change: function(value) { this.fn(); }
							},
						}, { xtype: "displayfield", width: 6 },
						{ xtype: "displayfield", cls: "ui-label", value: "บาท" },
						{ xtype: "displayfield", width: 6 },
						// จำนวนเงินภาษีที่บริษัทออกให้
						{
							xtype: "displayfield",
							value: "จำนวนเงินภาษีที่บริษัทออกให้:",
							cls: "ui-label",
							style: "text-align: right",
							width: 195
						}, { xtype: "displayfield", width: 6 }, {
							xtype: "textfield",
							id: "dtl_f_tax_company",
							name: "dtl_f_tax_company",
							style: "text-align: right; color: blue; font-weight: bolder;",
							width: 200,
							readOnly:true,
							listeners: {
								afterrender: function() {
									this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2))); }
								},
								Change: function(value) { this.fn(); }
							},
						}, { xtype: "displayfield", width: 6 },
						{ xtype: "displayfield", cls: "ui-label", value: "บาท" },
						{ xtype: "displayfield", width: 6 },
						// จำนวนเงินขอเบิกรวมภาษีที่ออกให้
						{
							xtype: "displayfield",
							value: "จำนวนเงินขอเบิกรวมภาษีที่ออกให้:",
							cls: "ui-label",
							style: "text-align: right",
							width: 195
						}, { xtype: "displayfield", width: 6 }, {
							xtype: "textfield",
							id: "dtl_f_tax_company_show",
							name: "dtl_f_tax_company_show",
							style: "text-align: right; color: blue; font-weight: bolder;",
							width: 200,
							readOnly:true,
							listeners: {
								afterrender: function() {
									this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2))); }
								},
								Change: function(value) { this.fn(); }
							},
						}, { xtype: "displayfield", width: 6 },
						{ xtype: "displayfield", cls: "ui-label", value: "บาท" },
						{ xtype: "displayfield", width: 6 },
						// จำนวนเงินภาษีมูลค่าเพิ่ม(คำนวณ)
						{
							xtype: "displayfield",
							value: "จำนวนเงินภาษีมูลค่าเพิ่ม(คำนวณ):",
							cls: "ui-label",
							style: "text-align: right",
							width: 195
						}, { xtype: "displayfield", width: 6 }, {
							xtype: "textfield",
							id: "dtl_f_vat_amount",
							name: "dtl_f_vat_amount",
							style: "text-align: right; color: blue; font-weight: bolder;",
							width: 200,
							readOnly:true,
							listeners: {
								afterrender: function() {
									this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2))); }
								},
								Change: function(value) { this.fn(); }
							},
						}, { xtype: "displayfield", width: 6 },
						{ xtype: "displayfield", cls: "ui-label", value: "บาท" },
						{ xtype: "displayfield", width: 6 },
						// จำนวนเงินภาษีมูลค่าเพิ่ม(จากเอกสาร)
						{
							xtype: "displayfield",
							value: "จำนวนเงินภาษีมูลค่าเพิ่ม(จากเอกสาร):",
							cls: "ui-label",
							style: "text-align: right",
							width: 195
						}, { xtype: "displayfield", width: 6 }, {
							xtype: "textfield",
							id: "dtl_f_vat_doc",
							name: "dtl_f_vat_doc",
							style: "text-align: right; color: blue; font-weight: bolder;",
							width: 200,
							readOnly:true,
							listeners: {
								afterrender: function() {
									this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2))); }
								},
								Change: function(value) { this.fn(); }
							},
						}, { xtype: "displayfield", width: 6 },
						{ xtype: "displayfield", cls: "ui-label", value: "บาท" },
						{ xtype: "displayfield", width: 415 }]
					}, {
						xtype: "compositefield",
						fieldLabel: "จำนวนเงินภาษีหัก ณ ที่จ่าย",
						anchor: "100%",
						msgTarget: "under",
						items: [{
							xtype: "textfield",
							id: "dtl_f_tax_amount",
							name: "dtl_f_tax_amount",
							style: "text-align: right; color: blue; font-weight: bolder;",
							readOnly: true,
							width: 150,
							listeners: {
								afterrender: function() {
									this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2))); }
								},
								Change: function(value) { this.fn(); }
							},
						}, { xtype: "displayfield", value: "บาท" }]
					}, {
						xtype: "compositefield",
						fieldLabel: "ค่าปรับพนักงาน",
						anchor: "100%",
						msgTarget: "under",
						items: [{
							xtype: "textfield",
							id: "dtl_f_drpenalty_show",
							name: "dtl_f_drpenalty_show",
							style: "text-align: right; color: blue; font-weight: bolder;",
							readOnly:true,
							width: 150,
							listeners: {
								afterrender: function() {
									this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2))); }
								},
								Change: function(value) { this.fn(); }
							},
						}, { xtype: "displayfield", value: "บาท" }]
					}, {
						xtype: "compositefield",
						fieldLabel: "จำนวนเงินจ่ายสุทธิ",
						anchor: "100%",
						msgTarget: "under",
						items: [{
							xtype: "textfield",
							id: "dtl_f_net_amount",
							name: "dtl_f_net_amount",
							style: "text-align: right; color: blue; font-weight: bolder;",
							readOnly:true,
							width: 150,
							listeners: {
								afterrender: function() {
									this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2))); }
								},
								Change: function(value) { this.fn(); }
							},
						}, { xtype: "displayfield", value: "บาท" }]
					}]
				}],
				buttonAlign: "left",
				buttons: [{
					text: Ext.GLOBAL_BU_SAVE_TH,
					iconCls: "icon-save",
					handler: function(grid, rowIndex, colIndex) {

						var msg					= "";
						var c_sp_comment		= "";
						var c_time				= "";
						var c_sp_day			= "";
						var i_type_whtax		= "";
						var dc_section_tax_id	= "";
						var f_pay_tax_amount	= "";
						var f_drpenalty			= "";
						var ap_penalty_id		= "";
						
						if( Ext.getCmp("dtl_group_acc").getValue() == "" ) { msg += "- กรุณาเลือก หมวดผังบัญชี<br>"; }
						if( Ext.getCmp("dtl_dc_acc_id").getValue() == "" ) { msg += "- กรุณาเลือก ประเภทค่าใช้จ่าย<br>"; }
						if( Ext.getCmp("dtl_tax_map_method_id").getValue() == "" ) { msg += "- กรุณาเลือก ประเภทเงินได้<br>"; }
						if( Ext.getCmp("dtl_dc_cost_id").getValue() == "" ) { msg += "- กรุณาเลือก หน่วยงาน/ศูนย์ต้นทุน<br>"; }
						if( Ext.getCmp("dtl_ap_exp_doc_id").getValue() == "" ) {
							msg += "- กรุณาเลือก ประเภทเอกสาร<br>";
						} else {
							var i_exp_type	= Ext.getStoreItems(storeDocType, Ext.getCmp("dtl_ap_exp_doc_id").getValue(), "i_exp_type");
							if( i_exp_type == 1 ) {
								c_sp_comment	= Ext.getCmp("dtl_c_sp_comment").getValue();
 								c_time			= Ext.getCmp("dtl_c_time").getValue();
 								c_sp_day		= Ext.getCmp("dtl_c_sp_day").getValue();
		 					}
						}
						if( Ext.getCmp("dtl_dc_vat_id").getValue() == "" ) { msg += "- กรุณาเลือก ภาษีมูลค่าเพิ่ม<br>"; }
						if( Ext.getCmp("dtl_dc_tax_id").getValue() == "" ) { msg += "- กรุณาเลือก ภาษีหัก ณ ที่จ่าย<br>"; }
						else {
							i_type_whtax		= Ext.getStoreItems(DcTaxStore, Ext.getCmp("dtl_dc_tax_id").getValue(),"i_type_whtax");
							dc_section_tax_id	= ( i_type_whtax == Ext.TAX_BY_PROGRESS )? Ext.getStoreItems(store_method, Ext.getCmp("dtl_tax_map_method_id").getValue(), "dc_section_tax_id") : "";
						}
						if( Ext.getCmp("dtl_i_company_pay_tax").getValue().inputValue == 1 ) {
							f_pay_tax_amount	= Ext.getCmp("dtl_f_pay_tax_amount").getValue().replace(/,/g,"");
						}
						if( Ext.getCmp("dtl_f_inv_amount").getValue().replace(/,/g,"") <= 0 ) { msg += "- กรุณากรอก จำนวนเงินขอเบิก<br>"; }
						if( Ext.getCmp("dtl_i_is_drpenalty").getValue().inputValue != Ext.PNT_NO ) {
							f_drpenalty		= Ext.getCmp("dtl_f_drpenalty").getValue().replace(/,/g,"");
							ap_penalty_id	= Ext.getCmp("dtl_ap_penalty_id").getValue();
							
							if( f_drpenalty <= 0 ) { msg += "- กรุณากรอก เงินค่าปรับ<br>"; }
							if( ap_penalty_id == "" ) { msg += "- กรุณาเลือก บัญชีค่าปรับ<br>"; }
						}
						
						if(msg	== "") {
							Ext.getCmp("win-pop-dtl").getEl().mask("Please wait...", "x-mask-loading");
							Ext.Ajax.request({
								url: "../ap/api/mn_FiPayTranHdrExpen.php",
								method: "POST",
								params: {
									mode: mode,
									id: Ext.getCmp("dtl_id").getValue(),
									ap_expen_hdr_id: hdr_id,
									dc_acc_id: Ext.getCmp("dtl_dc_acc_id").getValue(),
									tax_map_method_id: Ext.getCmp("dtl_tax_map_method_id").getValue(),
									dc_tax_id: Ext.getCmp("dtl_dc_tax_id").getValue(),
									dc_vat_id: Ext.getCmp("dtl_dc_vat_id").getValue(),
									i_company_pay_tax: Ext.getCmp("dtl_i_company_pay_tax").getValue().inputValue,
									f_pay_tax_amount: f_pay_tax_amount,
									dc_section_tax_id: dc_section_tax_id,
									f_inv_amount: Ext.getCmp("dtl_f_inv_amount").getValue().replace(/,/g,""),
									f_dec_amount: Ext.getCmp("dtl_f_dec_amount").getValue().replace(/,/g,""),
									f_tax_save: Ext.getCmp("dtl_f_tax_save").getValue().replace(/,/g,""),
									f_reduce: Ext.getCmp("dtl_f_reduce").getValue().replace(/,/g,""),
									i_is_drpenalty: Ext.getCmp("dtl_i_is_drpenalty").getValue().inputValue,
									f_drpenalty: f_drpenalty,
									ap_penalty_id: ap_penalty_id,
									i_is_vat_amount: Ext.getCmp("dtl_i_is_vat_amount").getValue().inputValue,
									f_net_dec: Ext.getCmp("dtl_f_net_dec").getValue().replace(/,/g,""),
									f_tax_company: Ext.getCmp("dtl_f_tax_company").getValue().replace(/,/g,""),
									f_tax_company_show: Ext.getCmp("dtl_f_tax_company_show").getValue().replace(/,/g,""),
									f_vat_amount: Ext.getCmp("dtl_f_vat_amount").getValue().replace(/,/g,""),
									f_vat_doc: Ext.getCmp("dtl_f_vat_doc").getValue().replace(/,/g,""),
									f_net_amount: Ext.getCmp("dtl_f_net_amount").getValue().replace(/,/g,""),
									group_acc: Ext.getCmp("dtl_group_acc").getValue(),
									ap_exp_doc_id: Ext.getCmp("dtl_ap_exp_doc_id").getValue(),
									c_sp_comment: c_sp_comment,
									c_time: c_time,
									c_sp_day: c_sp_day,
									dc_cost_id: Ext.getCmp("dtl_dc_cost_id").getValue(),
									c_comment: Ext.getCmp("dtl_c_comment").getValue(),
									i_is_tax_restricted: (Ext.getCmp("dtl_i_is_tax_restricted").getValue())? 1: 2,
									i_status_cnt: (Ext.getCmp("dtl_i_status_cnt").getValue())? 1: 2
								},
								success: function ( result, request ) {
									Ext.getCmp("win-pop-dtl").getEl().unmask();
									var obj = $.parseJSON( result.responseText );
										
									if( obj.success == true ) {
										Ext.Msg.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย");
										Ext.getCmp("win-pop-dtl").destroy();
										Ext_Show(obj.ap_expen_hdr_id);
										editMsg();
									}
								},
								failure: function ( result, request) { 
									Ext.MessageBox.alert("แจ้งเตือน", result.responseText);		// connect
								}
							});
						} else { Ext.MessageBox.alert("แจ้งเตือน", msg); }
					}
				}, {
					text: Ext.GLOBAL_BU_BACK_TH,
					handler: function() { Ext.getCmp("win-pop-dtl").destroy(); }
				}]
			}).show();
			
		}; // EDIT_DTL

		var GRID_DTL = new Ext.grid.GridPanel({
			title: "รายละเอียดค่าใช้จ่าย",
			id: "GRID_DTL",
			region: "center",
			layout: "fit",
			height: 200,
			stripeRows: true,
			loadMask: true,
			store: store_dtl,
			style: { padding: "5px 5px" },
			viewConfig : {
				emptyText: "ไม่มีข้อมูล..",
				deferEmptyText: false
			},
			tbar: [{
				text : "เพิ่มข้อมูล",
				iconCls: "icon-add",
				hidden: (PAGE_TYPE != 1)? true : false,
				handler: function(grid, rowIndex, colIndex) { EDIT_DTL("ADD_DTL"); }
			}],
			columns: [
				new Ext.grid.RowNumberer({header:"ลำดับ", width: 40,
					renderer: function(value, metaData, record, row, col, store, gridView) {
						return record.get("no");
					}
				}),
				{ id: "edit", header: "แก้ไข", menuDisabled: true, sortable: false, align: "center", width: 50, dataIndex: "id",
					renderer: function(value, metaData, record, rowIndex, colIndex, store) {
						if(!record.data.dtl_total_type) {
							return "<img src='../images/icons/document_edit.gif'); style='cursor:pointer'/>";
						}
					}
				},
				{ id: "delete", header: "ลบ", menuDisabled: true, sortable: false, align: "center", width: 50, dataIndex: "id", hidden: (PAGE_TYPE != 1)? true : false, 
					renderer: function(value, metaData, record, rowIndex, colIndex, store) {
						if(!record.data.dtl_total_type) {
							return "<img src='../images/icons/document_delete.gif'); style='cursor:pointer'/>";
						}
					}
				},
				{ header: "รหัสรายจ่าย", dataIndex: "dtl_acc_code", align: "center", menuDisabled: true,
					renderer: function(value, metaData, record, rowIndex, colIndex, store) {
						metaData.attr = "style= \"text-align:left\";";
						if(record.data.dtl_total_type) {
							return "<b>"+value+"</b>";
						} else {
							return value;
						}
					}
				},
				{ header: "รหัสรายจ่าย", dataIndex: "dtl_acc_name", menuDisabled: true, width: 200,
					renderer: function(value, metaData, record, rowIndex, colIndex, store) {
						metaData.attr = "style= \"text-align:left\";";
						if(record.data.dtl_total_type) {
							return "<b>"+value+"</b>";
						} else {
							return value;
						}
					}
				},
				{ header: "ประเภทเงินได้", menuDisabled: true, dataIndex: "dtl_tax_map_method_name" },
				{ header: "ประเภทเอกสาร", menuDisabled: true, dataIndex: "dtl_ap_exp_doc_name" },
				{ header: "หน่วยงาน", menuDisabled: true, dataIndex: "dtl_dc_cost_name",
					renderer: function(value, metaData, record, rowIndex, colIndex, store) {
						if(record.data.dtl_total_type) {
							metaData.attr = "style= 'text-align:right';";
							return "<b>รวม</b>";
						} else {
							metaData.attr = "style= 'text-align:left';";
							return value;
						}
					}
				},
				{ header: "จำนวนเงิน", menuDisabled: true, dataIndex: "dtl_f_inv_amount",
					renderer: function(value, metaData, record, rowIndex, colIndex, store) {
						metaData.attr = "style= \"text-align:right\";";
						if(record.data.dtl_total_type) {
							return "<b>"+floatRenderer(floatMinus(value, 2))+"</b>";
						} else {
							return floatRenderer(floatMinus(value, 2));
						}
					}
				},
				{ header: "ส่วนลดเงินสด", menuDisabled: true, dataIndex: "dtl_f_dec_amount",
					renderer: function(value, metaData, record, rowIndex, colIndex, store) {
						metaData.attr = "style= \"text-align:right\";";
						if(record.data.dtl_total_type) {
							return "<b>"+floatRenderer(floatMinus(value, 2))+"</b>";
						} else {
							return floatRenderer(floatMinus(value, 2));
						}
					}
				},
				{ header: "จำนวนเงินภาษี หัก ณ ที่จ่าย (เรียกเก็บ)", menuDisabled: true, dataIndex: "dtl_f_tax_save",
					renderer: function(value, metaData, record, rowIndex, colIndex, store) {
						metaData.attr = "style= \"text-align:right\";";
						if(record.data.dtl_total_type) {
							return "<b>"+floatRenderer(floatMinus(value, 2))+"</b>";
						} else {
							return floatRenderer(floatMinus(value, 2));
						}
					}
				},
				{ header: "จำนวนเงินหักอื่น ๆ", menuDisabled: true, dataIndex: "dtl_f_reduce",
					renderer: function(value, metaData, record, rowIndex, colIndex, store) {
						metaData.attr = "style= \"text-align:right\";";
						if(record.data.dtl_total_type) {
							return "<b>"+floatRenderer(floatMinus(value, 2))+"</b>";
						} else {
							return floatRenderer(floatMinus(value, 2));
						}
					}
				},
				{ header: "อัตราภาษีหัก ณ ที่จ่าย (%)", menuDisabled: true, dataIndex: "dtl_f_tax_rate",
					renderer: function(value, metaData, record, rowIndex, colIndex, store) {
						metaData.attr = "style= \"text-align:right\";";
						if(record.data.dtl_total_type) {
							return "<b>"+floatRenderer(floatMinus(value, 2))+"</b>";
						} else {
							return floatRenderer(floatMinus(value, 2));
						}
					}
				},
				{ header: "อัตราภาษีมูลค่าเพิ่ม (%)", menuDisabled: true, dataIndex: "dtl_f_vat_rate",
					renderer: function(value, metaData, record, rowIndex, colIndex, store) {
						metaData.attr = "style= \"text-align:right\";";
						if(record.data.dtl_total_type) {
							return "<b>"+floatRenderer(floatMinus(value, 2))+"</b>";
						} else {
							return floatRenderer(floatMinus(value, 2));
						}
					}
				},
				{ header: "จำนวนเงินภาษีมูลค่าเพิ่ม", menuDisabled: true, dataIndex: "dtl_f_vat_amount",
					renderer: function(value, metaData, record, rowIndex, colIndex, store) {
						metaData.attr = "style= \"text-align:right\";";
						if(record.data.dtl_total_type) {
							return "<b>"+floatRenderer(floatMinus(value, 2))+"</b>";
						} else {
							return floatRenderer(floatMinus(value, 2));
						}
					}
				},
				{ header: "จำนวนเงินภาษี มูลค่าเพิ่ม(จากเอกสาร)", menuDisabled: true, dataIndex: "dtl_f_vat_doc",
					renderer: function(value, metaData, record, rowIndex, colIndex, store) {
						metaData.attr = "style= \"text-align:right\";";
						if(record.data.dtl_total_type) {
							return "<b>"+floatRenderer(floatMinus(value, 2))+"</b>";
						} else {
							return floatRenderer(floatMinus(value, 2));
						}
					}
				},
				{ header: "ประเภทค่าปรับ", menuDisabled: true, dataIndex: "dtl_c_is_drpenalty" },
				{ header: "จำนวนเงินค่าปรับ", menuDisabled: true, dataIndex: "dtl_f_drpenalty",
					renderer: function(value, metaData, record, rowIndex, colIndex, store) {
						metaData.attr = "style= \"text-align:right\";";
						if(record.data.dtl_total_type) {
							return "<b>"+floatRenderer(floatMinus(value, 2))+"</b>";
						} else {
							return floatRenderer(floatMinus(value, 2));
						}
					}
				},
				{ header: "จำนวนเงินจ่ายสุทธิ", menuDisabled: true, dataIndex: "dtl_f_net_amount",
					renderer: function(value, metaData, record, rowIndex, colIndex, store) {
						metaData.attr = "style= \"text-align:right\";";
						if(record.data.dtl_total_type) {
							return "<b>"+floatRenderer(floatMinus(value, 2))+"</b>";
						} else {
							return floatRenderer(floatMinus(value, 2));
						}
					}
				}
			]
		});

		// คำนวณยอดเงินทั้งหมด
		function GRID_TOTAL() {
			
			$("#EXT_GRID_TOTAL").empty();
			
			new Ext.Panel ({
				title: "คำนวณยอดเงินทั้งหมด",
				id: "GRID_TOTAL",
				autoScroll: true,
				style: { padding: "5px 5px" },
				height: (PAGE_TYPE == 1)? 500 : 700,
				listeners: {
					afterrender: function( component ) {
						
						/*============================= LOAD DATA =============================*/
						$.ajax({
							url: "../ap/api/List_FiPayTranHdrExpen.php",
							type: "POST",
							data: {
								type: "List_Calculate",
								ap_expen_hdr_id: hdr_id
							},
							success: function(result) {
								
								var result	= $.parseJSON( result );
								
								Ext.getCmp("dc_acc_id_dec").setValue(result.data.dc_acc_id_dec);
								
								if(PAGE_TYPE == 2) {
									Ext.getCmp("i_is_status").setValue(result.data.i_is_status);
									Ext.getCmp("i_is_status").fn();
									Ext.getCmp("c_remark").setValue(result.data.c_remark);
									Ext.getCmp("i_send_tax").setValue(result.data.i_send_tax);	
								}
								
								Ext.getCmp("f_total_amount").setValue(result.data.f_total_amount);
								Ext.getCmp("f_total_amount").fn(); // จำนวนเงินทั้งหมด
								Ext.getCmp("f_dec_amount").setValue(result.data.f_dec_amount);
								Ext.getCmp("f_dec_amount").fn(); // ส่วนลดเงินสด
								Ext.getCmp("f_vat_amount").setValue(result.data.f_vat_amount);
								Ext.getCmp("f_vat_amount").fn(); // จำนวนเงินภาษีมูลค่าเพิ่ม(คำนวณ)
								Ext.getCmp("f_vat_doc").setValue(result.data.f_vat_doc);
								Ext.getCmp("f_vat_doc").fn(); // จำนวนเงินภาษีมูลค่าเพิ่ม(ปรับแก้ตามเอกสาร)
								Ext.getCmp("f_vat_cal_show").setValue(result.data.f_vat_cal_show);
								Ext.getCmp("f_vat_cal_show").fn(); // จำนวนเงินรวมภาษีมูลค่าเพิ่ม(คำนวณ)
								Ext.getCmp("f_comp_amount").setValue(result.data.f_comp_amount);
								Ext.getCmp("f_comp_amount").fn(); // จำนวนเงินภาษีที่บริษัทออกให้
								Ext.getCmp("f_wht_amount").setValue(result.data.f_wht_amount);
								Ext.getCmp("f_wht_amount").fn(); // จำนวนเงินภาษีหัก ณ ที่จ่าย
								Ext.getCmp("f_tax_save").setValue(result.data.f_tax_save);
								Ext.getCmp("f_tax_save").fn(); // จำนวนเงินภาษีหัก ณ ที่จ่าย (เรียกเก็บ)
								Ext.getCmp("f_penalty").setValue(result.data.f_penalty);
								Ext.getCmp("f_penalty").fn(); // จำนวนเงินค่าปรับเบิกเงินล่าช้า
								Ext.getCmp("f_net_penalty").setValue(result.data.f_net_penalty);
								Ext.getCmp("f_net_penalty").fn(); // จำนวนเงินรวม
								Ext.getCmp("f_barter_amtsum").setValue(result.data.f_barter_amtsum);
								Ext.getCmp("f_barter_amtsum").fn(); // จำนวนเงินหักลบกลบหนี้/แลกเปลี่ยน (รวม Vat)
								Ext.getCmp("f_barter_decsum").setValue(result.data.f_barter_decsum);
								Ext.getCmp("f_barter_decsum").fn(); // ส่วนลดเงินสดของแลกเปลี่ยน
								Ext.getCmp("f_reduce").setValue(result.data.f_reduce);
								Ext.getCmp("f_reduce").fn(); // จำนวนเงินหักอื่นๆ
								Ext.getCmp("f_net_amount").setValue(result.data.f_net_amount);
								Ext.getCmp("f_net_amount").fn(); // จำนวนเงินจ่ายสุทธิ
							}
						});
						/*=====================================================================*/

						// บันทึกการคำนวณ
						function Calculate() {

							var msg		= "";

	    					if (msg == "") {
	    						Ext.getCmp("frm-Add").getEl().mask("Please wait...", "x-mask-loading");
	    						Ext.Ajax.request({
	    							url: "../ap/api/mn_FiPayTranHdrExpen.php",
	    							method: "POST",
	    							params: {
	    								mode: "CALCULATE",
	    								ap_expen_hdr_id: hdr_id,
	    								dc_acc_id_dec: Ext.getCmp("dc_acc_id_dec").getValue()
	    							},
	    							success: function ( result, request ) {
	    								Ext.getCmp("frm-Add").getEl().unmask();
	    								var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
	    								if ( jsonData.success == true ) {
	    									Ext.Msg.alert("แจ้งเตือน", "บันทึกเรียบร้อย");
	    									GRID_TOTAL();
	    									store.load({ params : { mode: "" } });
	    									
	    								} else { Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg); }
	    							},
	    							failure: function ( result, request) { 
	    								Ext.MessageBox.alert("Failed", result.responseText);		// connect error
	    							}
	    						});
	    					} else { Ext.Msg.alert("แจ้งเตือน", msg); }
							
						}; // Calculate

						new Ext.Button ({
							text: "คำนวณมูลค่าสุทธิ",
							width : 30,
		                	handler: function() { Calculate(); },
							renderTo: "Ext_bu_cal"
						});
						
						// บัญชีส่วนลดเงินสด
						new Ext.form.ComboBox({
							id: "dc_acc_id_dec",
							mode: "local",
							store: storeDecAcc,					
							valueField: "id",
							displayField: "c_name",
							triggerAction: "all",
							forceSelection: true,
	    					selectOnFocus: true,
	    					typeAhead : false,
	    					emptyText: "- กรุณาเลือกบัญชีส่วนลดเงินสด -",
							width: 300,
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
							},
							renderTo: "Ext_dc_acc_id_dec"
						});

						if(PAGE_TYPE == 2) {
							new Ext.form.RadioGroup({
								id: "i_is_status",
								xtype: "radiogroup",
								columns: [700],
								items: [
									{ boxLabel: "<font color=\"#CC00CC\">ส่งกลับ ( *** บันทึกเหตุผลในการส่งกลับกรณีเลือกส่งกลับ ***)</font><br><font color=\"blue\"><u>ผู้บันทึกใบเบิกสามารถบันทึกใบเบิกใหม่ โดยเลือกรายการส่งกลับ ที่ระบบเจ้าหนี้ (ทำสำเนาจากใบเบิกเดิม แต่ได้เลขที่ใบเบิกใหม่)</u></font>", name: "i_is_status", inputValue: "0" },
									{ boxLabel: "รอทำใบสำคัญจ่าย/รอส่งเบิกพร้อมเงินเดือน", name: "i_is_status", inputValue: "1" },
									{ boxLabel: "รอทำใบสำคัญจ่าย&nbsp;(หักลบกลบหนี้/จ่ายเงินด้วยเอกสาร/แลกเปลี่ยน)", name: "i_is_status", inputValue: "6" },
									{ boxLabel: "รอตรวจสอบ", checked: true, name: "i_is_status", inputValue: "4" },
									{ boxLabel: "<font color=\"red\">ยกเลิก ( *** บันทึกเหตุผลในการส่งกลับกรณีเลือกยกเลิก ***)</font><br><font color=\"blue\"><u>ผู้บันทึกใบเบิกต้องบันทึกใบเบิกใหม่ทั้งหมด (ไม่มีสำเนาและใบเบิกนี้จะถูกยกเลิกอัตโนมัติ)</u></font>", name: "i_is_status", inputValue: "-1" }
								],
								listeners: {
									afterrender: function() {
										this.fn	= function() {
											if( this.getValue().inputValue=="0" || this.getValue().inputValue=="-1" ) {
												if( this.getValue().inputValue=="0" ) {
													$("#s_remark").html("ส่งกลับ");
												} else {
													$("#s_remark").html("ยกเลิก");
												}
	
												$("#span_c_remark").show();
											} else {
												$("#span_c_remark").hide();
											}
										}
									},
									Change: function(value) { this.fn(); }
								},
								renderTo: "Ext_i_is_status"
							});
							
							new Ext.form.TextArea({
								id: "c_remark",
								name: "c_remark",
								width: 300,
								renderTo: "Ext_c_remark"
							});
							
							new Ext.form.Checkbox({
								id: "i_send_tax",
								boxLabel: "<b style=\"font-size:16px;\">นำส่งภาษีหัก ณ ที่จ่าย</b>",
								inputValue: 1,
								checked: false,
				            	renderTo: "Ext_i_send_tax"
							});
						} else { $(".cm_save").hide(); }
						
						// จำนวนเงินทั้งหมด
						new Ext.form.TextField({
							id: "f_total_amount",
							style: "text-align: right; color: blue; font-weight: bolder;",
							width: 200,
							readOnly:true,
							listeners: {
								afterrender: function() {
									this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2))); }
								},
								Change: function(value) { this.fn(); }
							},
							renderTo: "Ext_f_total_amount"
						});
				
						// ส่วนลดเงินสด
						new Ext.form.TextField({
							id: "f_dec_amount",
							style: "text-align: right; color: blue; font-weight: bolder;",
							width: 200,
							readOnly:true,
							listeners: {
								afterrender: function() {
									this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2))); }
								},
								Change: function(value) { this.fn(); }
							},
							renderTo: "Ext_f_dec_amount"
						});
						
						// จำนวนเงินภาษีมูลค่าเพิ่ม(คำนวณ)
						new Ext.form.TextField({
							id: "f_vat_amount",
							style: "text-align: right; color: blue; font-weight: bolder;",
							width: 200,
							readOnly:true,
							listeners: {
								afterrender: function() {
									this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2))); }
								},
								Change: function(value) { this.fn(); }
							},
							renderTo: "Ext_f_vat_amount"
						});
						
						// จำนวนเงินภาษีมูลค่าเพิ่ม(ปรับแก้ตามเอกสาร)
						new Ext.form.TextField({
							id: "f_vat_doc",
							style: "text-align: right; color: blue; font-weight: bolder;",
							width: 200,
							readOnly:true,
							listeners: {
								afterrender: function() {
									this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2))); }
								},
								Change: function(value) { this.fn(); }
							},
							renderTo: "Ext_f_vat_doc"
						});
						
						// จำนวนเงินรวมภาษีมูลค่าเพิ่ม(คำนวณ)
						new Ext.form.TextField({
							id: "f_vat_cal_show",
							style: "text-align: right; color: blue; font-weight: bolder;",
							width: 200,
							readOnly:true,
							listeners: {
								afterrender: function() {
									this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2))); }
								},
								Change: function(value) { this.fn(); }
							},
							renderTo: "Ext_f_vat_cal_show"
						});
						
						// จำนวนเงินภาษีที่บริษัทออกให้
						new Ext.form.TextField({
							id: "f_comp_amount",
							style: "text-align: right; color: blue; font-weight: bolder;",
							width: 200,
							readOnly:true,
							listeners: {
								afterrender: function() {
									this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2))); }
								},
								Change: function(value) { this.fn(); }
							},
							renderTo: "Ext_f_comp_amount"
						});
						
						// จำนวนเงินภาษีหัก ณ ที่จ่าย
						new Ext.form.TextField({
							id: "f_wht_amount",
							style: "text-align: right; color: blue; font-weight: bolder;",
							width: 200,
							readOnly:true,
							listeners: {
								afterrender: function() {
									this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2))); }
								},
								Change: function(value) { this.fn(); }
							},
							renderTo: "Ext_f_wht_amount"
						});

						// จำนวนเงินภาษีหัก ณ ที่จ่าย (เรียกเก็บ)
						new Ext.form.TextField({
							id: "f_tax_save",
							style: "text-align: right; color: blue; font-weight: bolder;",
							width: 200,
							readOnly:true,
							listeners: {
								afterrender: function() {
									this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2))); }
								},
								Change: function(value) { this.fn(); }
							},
							renderTo: "Ext_f_tax_save"
						});
						
						// จำนวนเงินค่าปรับเบิกเงินล่าช้า
						new Ext.form.TextField({
							id: "f_penalty",
							style: "text-align: right; color: blue; font-weight: bolder;",
							width: 200,
							readOnly:true,
							listeners: {
								afterrender: function() {
									this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2))); }
								},
								Change: function(value) { this.fn(); }
							},
							renderTo: "Ext_f_penalty"
						});
						
						// จำนวนเงินรวม
						new Ext.form.TextField({
							id: "f_net_penalty",
							style: "text-align: right; color: blue; font-weight: bolder;",
							width: 200,
							readOnly:true,
							listeners: {
								afterrender: function() {
									this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2))); }
								},
								Change: function(value) { this.fn(); }
							},
							renderTo: "Ext_f_net_penalty"
						});
						
						// จำนวนเงินหักลบกลบหนี้/แลกเปลี่ยน (รวม Vat)
						new Ext.form.TextField({
							id: "f_barter_amtsum",
							style: "text-align: right; color: blue; font-weight: bolder;",
							width: 200,
							readOnly:true,
							listeners: {
								afterrender: function() {
									this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2))); }
								},
								Change: function(value) { this.fn(); }
							},
							renderTo: "Ext_f_barter_amtsum"
						});
						
						// ส่วนลดเงินสดของแลกเปลี่ยน
						new Ext.form.TextField({
							id: "f_barter_decsum",
							style: "text-align: right; color: blue; font-weight: bolder;",
							width: 200,
							readOnly:true,
							listeners: {
								afterrender: function() {
									this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2))); }
								},
								Change: function(value) { this.fn(); }
							},
							renderTo: "Ext_f_barter_decsum"
						});
						
						// จำนวนเงินหักอื่นๆ
						new Ext.form.TextField({
							id: "f_reduce",
							style: "text-align: right; color: blue; font-weight: bolder;",
							width: 200,
							readOnly:true,
							listeners: {
								afterrender: function() {
									this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2))); }
								},
								Change: function(value) { this.fn(); }
							},
							renderTo: "Ext_f_reduce"
						});
						
						// จำนวนเงินจ่ายสุทธิ
						new Ext.form.TextField({
							id: "f_net_amount",
							style: "text-align: right; color: blue; font-weight: bolder;",
							width: 200,
							readOnly:true,
							listeners: {
								afterrender: function() {
									this.fn	= function() { this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g,""), 2))); }
								},
								Change: function(value) { this.fn(); }
							},
							renderTo: "Ext_f_net_amount"
						});
						
						/*=================================================================*/
						
					}
				},
				html:	"<div style='background:#fff; overflow:auto;'>" +
							"<div style='font-size: 12px;'>" +
								"<table border='0' cellspacing='2' cellpadding='0' width='100%'>" +
									"<colgroup width='35%'></colgroup>" +
									"<colgroup width='65%' style='background: #DFE8F6;'></colgroup>" +
									"<tr><td align='right'><b>:</b></td><td style='padding:1px 4px;'><div id='Ext_bu_cal'></div></td></tr>" +
									"<tr><td colspan='2' style='border-top: 1px solid #99BBE8;'></td></tr>" +
									"<tr><td align='right' nowrap><b>จำนวนเงินทั้งหมด :</b></td><td id='Ext_f_total_amount' style='padding:1px 4px;'></td></tr>" +
									"<tr><td align='right' nowrap><b>ส่วนลดเงินสด :</b></td><td id='Ext_f_dec_amount' style='padding:1px 4px;'></td></tr>" +
									"<tr><td align='right'><b>บัญชีส่วนลดเงินสด :</b></td><td id='Ext_dc_acc_id_dec' style='padding:1px 4px;'></td></tr>" +
									"<tr><td align='right' nowrap><b>จำนวนเงินภาษีมูลค่าเพิ่ม(คำนวณ) :</b></td><td id='Ext_f_vat_amount' style='padding:1px 4px;'></td></tr>" +
									"<tr><td align='right' nowrap><b>จำนวนเงินภาษีมูลค่าเพิ่ม(ปรับแก้ตามเอกสาร) :</b></td><td id='Ext_f_vat_doc' style='padding:1px 4px;'></td></tr>" +
									"<tr><td align='right' nowrap><b>จำนวนเงินรวมภาษีมูลค่าเพิ่ม(คำนวณ) :</b></td><td id='Ext_f_vat_cal_show' style='padding:1px 4px;'></td></tr>" +
									"<tr><td align='right' nowrap><b>จำนวนเงินภาษีที่บริษัทออกให้ :</b></td><td id='Ext_f_comp_amount' style='padding:1px 4px;'></td></tr>" +
									"<tr><td align='right' nowrap><b>จำนวนเงินภาษีหัก ณ ที่จ่าย :</b></td><td id='Ext_f_wht_amount' style='padding:1px 4px;'></td></tr>" +
									"<tr><td align='right' nowrap><b>จำนวนเงินภาษีหัก ณ ที่จ่าย (เรียกเก็บ) :</b></td><td id='Ext_f_tax_save' style='padding:1px 4px;'></td></tr>" +
									"<tr><td align='right' nowrap><b>จำนวนเงินค่าปรับเบิกเงินล่าช้า :</b></td><td id='Ext_f_penalty' style='padding:1px 4px;'></td></tr>" +
									"<tr><td align='right' nowrap><b>จำนวนเงินรวม :</b></td><td id='Ext_f_net_penalty' style='padding:1px 4px;'></td></tr>" +
									"<tr><td align='right' nowrap><b>จำนวนเงินหักลบกลบหนี้/แลกเปลี่ยน (รวม Vat) :</b></td><td id='Ext_f_barter_amtsum' style='padding:1px 4px;'></td></tr>" +
									"<tr><td align='right' nowrap><b>ส่วนลดเงินสดของแลกเปลี่ยน :</b></td><td id='Ext_f_barter_decsum' style='padding:1px 4px;'></td></tr>" +
									"<tr><td align='right' nowrap><b>จำนวนเงินหักอื่นๆ :</b></td><td id='Ext_f_reduce' style='padding:1px 4px;'></td></tr>" +
									"<tr><td align='right' nowrap><b>จำนวนเงินจ่ายสุทธิ :</b></td><td id='Ext_f_net_amount' style='padding:1px 4px;'></td></tr>" +
									"<tr class='cm_save'><td colspan='2' style='border-top: 1px solid #99BBE8;'></td></tr>" +
									"<tr class='cm_save'><td align='right'><b>สถานะ :</b></td><td id='Ext_i_is_status' style='padding:1px 4px;'></td></tr>" +
									"<tr class='cm_save' id='span_c_remark'><td align='right'><b>เหตุผลที่<span id='s_remark'></span> :</b></td><td id='Ext_c_remark' style='padding:1px 4px;'></td></tr>" +
									"<tr class='cm_save'><td align='right'><b>นำส่งภาษีหัก ณ ที่จ่าย :</b></td><td id='Ext_i_send_tax' style='padding:1px 4px;'></td></tr>" +
								"</table>" +
							"</div>" +
						"</div>",
				buttonAlign: "center",
				buttons: [{
					text : "&nbsp;"+Ext.GLOBAL_BU_SAVE_TH+"&nbsp;",
					iconCls	: "icon-save",
					handler : function() {
						
						var msg		= "";
						
						var c_remark	= "";
                		
						if( PAGE_TYPE != 1 ) {
	    					if(Ext.getCmp("i_is_status").getValue().inputValue == "0" || Ext.getCmp("i_is_status").getValue().inputValue == "-1" ) {
	    						if(Ext.getCmp("c_remark").getValue() == "" ) {
	    							remark	= ( Ext.getCmp("i_is_status").getValue().inputValue == "0" )? "ส่งกลับ" : "ยกเลิก";
	    							msg	+= "- กรุณากรอก เหตุผลที่"+remark+"<br>";
	    						}
	    						
	    						c_remark	= Ext.getCmp("c_remark").getValue();
	    					}
						}
    					
    					if (msg == "") {
    						
    						saveHdr();
    						
    						Ext.getCmp("frm-Add").getEl().mask("Please wait...", "x-mask-loading");
	    					Ext.Ajax.request({
    							url: "../ap/api/mn_FiPayTranHdrExpen.php",
    							method: "POST",
    							params: {
    								mode: "SAVE_STATUS",
    								ap_expen_hdr_id: hdr_id,
    								PAGE_TYPE: PAGE_TYPE,
    								i_is_status: ( PAGE_TYPE != 1 )? Ext.getCmp("i_is_status").getValue().inputValue : "",
    								c_remark: ( PAGE_TYPE != 1 )? c_remark : "",
    								i_send_tax: ( PAGE_TYPE != 1 )? ( (Ext.getCmp("i_send_tax").checked)? 1 : 2 ) : ""
    							},
    							success: function ( result, request ) {
    								Ext.getCmp("frm-Add").getEl().unmask();

    								var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
    								if ( jsonData.success == true ) {

    									Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
    									
    									if(jsonData.msg == "") {
    										Ext.Msg.alert("แจ้งเตือน", "บันทึกเรียบร้อย");
    									} else {
    										Ext.Msg.alert("แจ้งเตือน", jsonData.msg);
    									}
    									
    									store.load({ params : { mode: "" } });
    									
    								} else { Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg); }
    							},
    							failure: function ( result, request) { 
    								Ext.MessageBox.alert("Failed", result.responseText);		// connect error
    							}
    						});
    					} else { Ext.Msg.alert("แจ้งเตือน", msg); }
					}
				}, {
					text: Ext.GLOBAL_BU_BACK_TH,
					handler: function() { Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; }
				}],
				renderTo: "EXT_GRID_TOTAL"
			});
		}; // GRID_TOTAL

		// แสดง FROM PANEL ทั้งหมด
		new Ext.Panel ({
			style: { padding: "1px 0px" },
			listeners: {
				afterrender: function() {
					
					store_dtl.setBaseParam("ap_expen_hdr_id", hdr_id);
					store_dtl.load();
					
					GRID_TOTAL();
				}
			},
			items: [ GRID_DTL,
			         { border: false, html: "<div id='EXT_GRID_TOTAL'></div>" }
			        ],
			renderTo: "Ext_Show"
		});
		
		Ext.getCmp("GRID_DTL").on("cellclick", cellClick_DTL, this);
	}; // Ext_Show
	
	/*====================== CENTER ======================*/
	center = new Ext.TabPanel({
		region: "center",
		border: false,
		//activeTab: 0, //default Tab
		id: "contenterCenter",
		defaults:{ autoScroll: true }, 
		items: [ gridMain ]
	});
	// SET ref Grid&Tab
	Ext.getCmp("tabpanel1").on("cellclick", cellClick, this);

	// SetTab Controller Loads
	Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
	/*====================== RENDER ======================*/
	new Ext.Viewport({
		layout: "border",
		items: [ center ]
	});
});
