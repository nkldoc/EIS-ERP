Ext.store = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/List_ImpRequestEphis.php",
  baseParams: { type: "imp_request_ephis_hdr", i_read: user_right_read ,i_type_menu : Ext.I_MENU_JVCR}, // Permission i_read
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [
    { name: "no" },
    { name: "id" },
    { name: "c_code" },
    { name: "c_period_no" },
    { name: "c_doc" },
    { name: "dc_expense_budget_type_id" },
    { name: "dc_expense_budget_type_name" },
    { name: "d_doc_date" },
    { name: "d_jv_date" },
    { name: "gl_tran_hdr_rq_id" }, 
    { name: "c_code_jv" },
    { name: "c_comment" },
    { name: "i_status" },
    { name: "i_enable" },
    { name: "c_status" },
    { name: "show_enable" },
    { name: "dc_user_update_id" },
    { name: "dc_user_update_cost_id" },
    { name: "d_update" },
    { name: "i_is_post" }, 
  ],
});


Ext.storeDtl = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_ImpRequestEphis.php",
  baseParams: { type: "imp_request_ephis_dtl" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [
    { name: "no" },
    { name: "id" }, 
    { name: "imp_expense_ephis_hdr_id" },
    { name: "dc_expense_group_vsn_id" },
    { name: "dc_expense_vsn_id" },
    { name: "dc_expense_acc_vsn_id" },
    { name: "i_type_year" },
    { name: "c_budget_year" },
    { name: "d_doc" },
    { name: "d_dkdate" },
    { name: "d_paydate" },
    { name: "d_canceldate" },
    { name: "c_request" },
    { name: "c_request_desc" },
    { name: "c_approve" },
    { name: "c_expense_group_main" },
    { name: "c_expense_group_sub" },
    { name: "c_acc_item" },
    { name: "c_budget_type_name" },
    { name: "c_rcvtime" },
    { name: "c_bglst" },
    { name: "c_creditor" },
    { name: "f_inv" },
    { name: "f_vat" },
    { name: "f_tax_personal" },
    { name: "f_tax_corporate" },
    { name: "f_social_security" },
    { name: "f_fine" },
    { name: "f_total" },
    { name: "f_check_total" },
    { name: "c_comment" },
    { name: "dc_user_update_id" },
    { name: "dc_user_update_cost_id" },
    { name: "d_update" },
    { name: "i_cal_gl" },
    { name: "c_bgdktypename" },
    { name: "dc_acc_id_cr" },
    { name: "gl_dc_config_id" },
    { name: "i_send_jv" },
    { name: "dc_creditor_id" }     
  ],
});




Ext.storeIS = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_ImpRequestEphis.php",
  baseParams: { type: "imp_request_ephis_hdr", mode: "SEARCH", i_success: 0, i_read: user_right_read }, // Permission i_read
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [
    { name: "no" },
    { name: "id" },
    { name: "c_code" },
    { name: "c_period_no" },
    { name: "c_doc" },
    { name: "dc_expense_budget_type_id" },
    { name: "dc_expense_budget_type_name" },
    { name: "d_doc_date" },
    { name: "d_jv_date" },
    { name: "gl_tran_hdr_rq_id" }, 
    { name: "c_code_jv" },
    { name: "c_comment" },
    { name: "i_status" },
    { name: "i_enable" },
    { name: "c_status" },
    { name: "show_enable" },
    { name: "dc_user_update_id" },
    { name: "dc_user_update_cost_id" },
    { name: "d_update" },
  ],
});

Ext.dc_expense_budget_type_all = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_ImpRequestEphis.php",
  baseParams: { type: "dc_expense_budget_type", all: "all" }, // 2 = VSN
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
  listeners: {
    load: function (t, records, options) {
      Ext.getCmp("s_dc_expense_budget_type_id").setValue("0");
    },
  },
});

Ext.dc_expense_budget_type = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_ImpRequestEphis.php",
  baseParams: { type: "dc_expense_budget_type" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});

Ext.dc_expense_group_vsn = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_ImpRequestEphis.php",
  baseParams: { type: "dc_expense_group_vsn" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});

Ext.dc_expense_acc_vsn = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_ImpRequestEphis.php",
  baseParams: { type: "dc_expense_acc_vsn" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name", "c_group_name", "acc_code", "acc_name", "acc_code_overlap", "acc_name_overlap"],
});

Ext.dc_expense_acc_vsn_full = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_ImpRequestEphis.php",
  baseParams: { type: "dc_expense_acc_vsn", full: "full" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name", "c_group_name", "acc_code", "acc_name", "acc_code_overlap", "acc_name_overlap"],
});

// storeYear
let years = [];
let currentTime = new Date();
let now = currentTime.getFullYear() + 1;
let id = currentTime.getFullYear() - 3;
while (id <= now) {
  let c_name = id + 543;
  years.push({ id, c_name });
  id++;
}

Ext.store_year = new Ext.data.JsonStore({
  fields: ["id", "c_name"],
  idProperty: "id",
  data: years,
});

Ext.store_type_year = new Ext.data.JsonStore({
  fields: ["id", "c_name"],
  idProperty: "id",
  data: [
    { id: "1", c_name: "ปีงบประมาณ" },
    { id: "2", c_name: "เหลื่อมปี" },
  ],
});

Ext.store_cal_gl = new Ext.data.JsonStore({
  fields: ["id", "c_name"],
  data: [
    { id: "1", c_name: "เงินเดือนจ่ายพนักงาน" },
    { id: "2", c_name: "จ่ายให้บริษัท" },
  ],
});

Ext.gl_dc_config_creditor = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_ImpRequestEphis.php",
  baseParams: { type: "gl_dc_config_creditor", fixed1_gl_dc_config_method : Ext.GL_CFG_SET_CREDITOR_PRODUCT, fixed2_gl_dc_config_method : Ext.GL_CFG_SET_CREDITOR_CONSTRUCTION},
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"]
});



Ext.storeItemEPHIS = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_ImpRequestEphis.php",
  baseParams: { type: "imp_request_ephis_dtl_n_item" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [
    { name: "no" },
    { name: "id" }, 
    { name: "imp_expense_ephis_hdr_id" }, 
    { name: "imp_expense_ephis_dtl_id" },
    { name: "imp_expense_ephis_item_id" },
    { name: "i_type_year" },
    { name: "c_budget_year" },
    { name: "d_doc" }, 
    { name: "d_canceldate" }, 
    { name: "c_request" },
    { name: "c_request_desc" },
    { name: "c_approve" }, 
    { name: "c_acc_item" }, 
    { name: "c_creditor" },
    { name: "c_bglst" },    
    { name: "f_inv" },
    { name: "f_vat" },
    { name: "f_tax_personal" },
    { name: "f_tax_corporate" },
    { name: "f_social_security" },
    { name: "f_fine" },
    { name: "f_dr" },
    { name: "f_cr" }, 
    { name: "i_cal_gl" }, 
    { name: "dc_acc_id" }, 
    { name: "i_type_show" }, 
    { name: "i_rank_dr" },
    { name: "i_send_jv" }, 
    { name: "dc_creditor_id" }
     
  ],
});



Ext.store_dc_acc_last = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_ImpRequestVSN.php",
  baseParams: { type: "dc_acc_last"}, 
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"]
});

//1=ไม่ระบุคือยังไม่ map กับใบเบิกพิเศษ ,2=ไม่ลงบัญชี,3=ลงบัญชี

Ext.store_send_jv = new Ext.data.JsonStore({
  fields: ["id", "c_name"],
  data: [
    { id: "1", c_name: "ไม่ระบุ" },
    { id: "2", c_name: "ไม่ลงบัญชี" },
    { id: "3", c_name: "รอลงบัญชี" },
  ],
});


Ext.store_dc_creditor = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_ImpRequestEphis.php",
  baseParams: { type: "dc_creditor"}, 
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"]
});