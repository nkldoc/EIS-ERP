/*===============================================*/
if(I_PAGE == 1) {
	var title_panel	= "สมุดรายวัน";
	Ext.storePost = new Ext.data.SimpleStore({
    	fields: [ "value", "text" ],
		data: [
		       [ "0", "- เลือกทั้งหมด -" ],
		       [ "1", "รายการรอลงบัญชี" ],
		       [ "2", "ยังไม่ผ่านรายการ(GX)" ],
		       [ "3", "ผ่านรายการแล้ว(GL)" ]
		]
	});
} else if(I_PAGE == 2) {
	var title_panel	= "แก้ไขสมุดรายวัน";
	Ext.storePost = new Ext.data.SimpleStore({
    	fields: [ "value", "text" ],
		data: [
		       [ "0", "- เลือกทั้งหมด -" ],
		       [ "2", "ยังไม่ผ่านรายการ(GX)" ],
		       [ "3", "ผ่านรายการแล้ว(GL)" ]
		]
	});
} else if(I_PAGE == 3) {
	var title_panel	= "รอลงบัญชี";
	Ext.storePost = new Ext.data.SimpleStore({
    	fields: [ "value", "text" ],
		data: [
		       [ "0", "- เลือกทั้งหมด -" ],
		       [ "1", "รายการรอลงบัญชี" ]
		]
	});
}
/*===============================================*/

Ext.store = new Ext.data.JsonStore({
	storeId: "myStore",
    autoDestroy: true,
	autoLoad: false,
    url: "api/List_GlTranhdr.php",
    baseParams: { type: "gl_tran_hdr", I_PAGE: I_PAGE, i_read: user_right_read }, //Permission i_read
    root: "data",
    idProperty: "id",
	totalProperty: "totalCount",
	fields: [
		{ name : "no" },
		{ name : "id" }, 
		{ name : "i_is_post" },
		{ name : "i_status_period" },
		{ name : "c_code" },
		{ name : "c_code_post" },
		{ name : "c_ref_doc" },
		{ name : "gl_dc_book_type_id" },
		{ name : "d_save_date" },
		{ name : "d_doc_date" },
		{ name : "f_total_amt" },
		{ name : "c_comment1" },
		{ name : "c_comment2" },
		{ name : "c_comment3" },
		{ name : "i_source" },
		{ name : "i_receive" },
		{ name : "table_name" },
		{ name : "i_enable" },
		{ name : "dc_user_create_id" },
		{ name : "dc_user_update_id" }
	]
});

//store_gx_reverse	= new Ext.data.JsonStore({
//	autoLoad: true,
//	url: "api/List_GlTranhdr.php",
//	baseParams: { type: "gx_reverse" },
//	root: "data",
//	idProperty: "id",
//	totalProperty: "totalCount",
//	fields: [
//		{ name : "no" },
//		{ name : "id" },
//		{ name : "c_code" },
//		{ name : "c_ref_doc" },
//		{ name : "d_save_date" },
//		{ name : "f_total_amt" },
//		{ name : "c_comment1" },
//		{ name : "c_comment2" },
//		{ name : "c_comment3" }
//	]
//});

Ext.storeUser_create = new Ext.data.JsonStore({
	autoDestroy: true,
	autoLoad: true,
	url: "api/All_GlTranHdr.php",
	baseParams: { type: "dc_user_create" },
	root: "data",
	idProperty: "id",
    fields: [ "id", "c_name" ],
    listeners: {
		load: function(t, records, options) {
        	Ext.getCmp( "s_user_create_id" ).setValue( "0" );
        }
	}
});

Ext.storeUser_update = new Ext.data.JsonStore({
	autoDestroy: true,
	autoLoad: true,
	url: "api/All_GlTranHdr.php",
	baseParams: { type: "dc_user_update" },
	root: "data",
	idProperty: "id",
    fields: [ "id", "c_name" ],
    listeners: {
		load: function(t, records, options) {
        	Ext.getCmp( "s_user_update_id" ).setValue( "0" );
        }
	}
});

Ext.vw_gl_dc_book_type = new Ext.data.JsonStore({
	autoDestroy: false,
	autoLoad: true,
	url: "api/All_GlTranHdr.php",
	baseParams: { type: "vw_gl_dc_book_type" },
	root: "data",
	idProperty: "id",
    fields: [ "id", "c_name" ]
});

Ext.dc_acc = new Ext.data.JsonStore({
	autoDestroy: false,
	autoLoad: true,
	url: "api/All_GlTranhdr.php",
	baseParams: { type: "dc_acc" },
	root: "data",
	idProperty: "id",
	fields: [ "id", "i_group", "c_name" ]
});

Ext.vw_dc_cost_gl_last = new Ext.data.JsonStore({
	autoDestroy: false,
	autoLoad: true,
	url: "api/All_GlTranhdr.php",
	baseParams: { type: "vw_dc_cost_gl_last" },
	root: "data",
	idProperty: "id",
	fields: [ "id", "c_name" ]
});

Ext.vw_dc_creditor	= new Ext.data.JsonStore({
	autoLoad: true,
	url: "api/All_GlTranhdr.php",
	baseParams: { type: "vw_dc_creditor" },
	root: "data",
	idProperty: "id",
	totalProperty: "totalCount",
	fields: [ "no", "id", "c_code", "c_name" ]
});

Ext.vw_dc_debtor = new Ext.data.JsonStore({
	autoLoad: true,
	url: "api/All_GlTranhdr.php",
	baseParams: { type: "vw_dc_debtor" },
	root: "data",
	idProperty: "id",
	totalProperty: "totalCount",
	fields: [ "no", "id", "c_code", "c_name" ]
});

Ext.vw_show_emp_name_gl0201b = new Ext.data.JsonStore({
	autoLoad: true,
	url: "api/All_GlTranhdr.php",
	baseParams: { type: "vw_show_emp_name_gl0201b" },
	root: "data",
	idProperty: "id",
	totalProperty: "totalCount",
	fields: [ "no", "id", "c_code", "c_name" ]
});

Ext.vw_c_other = new Ext.data.JsonStore({
	autoLoad: true,
	url: "api/All_GlTranhdr.php",
	baseParams: { type: "vw_c_other" },
	root: "data",
	idProperty: "id",
	totalProperty: "totalCount",
	fields: [ "no", "id", "c_code", "c_name" ]
});

Ext.vw_product_class_type_new2 = new Ext.data.JsonStore({
	autoLoad: true,
	url: "api/All_GlTranhdr.php",
	baseParams: { type: "vw_product_class_type_new2" },
	root: "data",
	idProperty: "id",
	totalProperty: "totalCount",
	fields: [ "no", "id", "c_code", "c_name" ]
});

Ext.dc_expense_budget_type = new Ext.data.JsonStore({
	autoDestroy: true,
	autoLoad: true,
	url: "api/All_GlTranHdr.php",
	baseParams: { type: "dc_expense_budget_type" },
	root: "data",
	idProperty: "id",
	fields: [ "id", "c_name" ]
});

reader = new Ext.data.JsonReader({
	root: "data",
	idProperty: "id",
	totalProperty: "totalCount",
	fields: [
	         { name : "no" },
	         { name : "id" },
	         { name : "i_rank" },
	         { name : "dc_acc_id" },
	         { name : "dc_acc_name" },
	         { name : "dc_cost_acc_id" },
	         { name : "dc_cost_acc_name" },
	         { name : "i_type_person" },
	         { name : "i_type_person_name" },
	         { name : "f_dr" },
	         { name : "f_cr" },
	         { name : "i_return" },
	         { name : "i_is_nontax_exp" },
	         { name : "dc_product_id" },
	         { name : "dc_product_name" },
	         { name : "dc_debtor_id" },
	         { name : "dc_debtor_name" },
	         { name : "dc_creditor_id" },
	         { name : "dc_creditor_name" },
	         { name : "dc_emp_id" },
	         { name : "dc_emp_name" },
	         { name : "c_other_name" },
	         { name : "total_type" },
	         { name : "c_year" },
	         { name : "dc_expense_budget_type_name" }
	        ]
});

reader2 = new Ext.data.JsonReader({
	root: "data",
	idProperty: "id",
	totalProperty: "totalCount",
	fields: [
	         { name : "no" },
	         { name : "id" },
	         { name : "gl_tran_hdr_id" },
	         { name : "dc_cost_acc_id" },
	         { name : "dc_cost_acc_name" },
	         { name : "d_vat" },
	         { name : "c_doc" },
	         { name : "c_mm" },
	         { name : "c_yyyy" },
	         { name : "c_vendor" },
	         { name : "c_tax" },
	         { name : "i_branch" },
	         { name : "c_branch" },
	         { name : "f_price" },
	         { name : "f_vat" },
	         { name : "i_more" },
	         { name : "c_mm_more" },
	         { name : "c_yyyy_more" }
	        ]
});

Ext.store_month = new Ext.data.JsonStore({
fields: ["id", "c_name"],
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

//storeYear
var years = [];
var currentTime = new Date();
var now = currentTime.getFullYear()+2;
var id = currentTime.getFullYear()-3;
while(id <= now) {
	var c_name = (id + 543);
	years.push({ id, c_name });
	id++;
}

Ext.store_year = new Ext.data.JsonStore({
	fields: ["id", "c_name"],
	data : years
});