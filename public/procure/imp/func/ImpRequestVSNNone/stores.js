Ext.store = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/List_ImpRequestVSNNone.php",
  baseParams: { type: "imp_request_vsn_hdr", i_read: user_right_read, ITYPE_JV: Ext.ITYPE_JV }, // Permission i_read
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [
    { name: "no" },
    { name: "id" },
    { name: "c_code" }, 
    { name: "c_period_no" }, //OLD NAME = c_expense_vsn_period_no
    { name: "c_doc" },
    { name: "dc_expense_budget_type_id" },
    { name: "dc_expense_budget_type" }, 
    { name: "d_doc_date" },
    { name: "dc_cost_acc_id" },
    { name: "dc_cost_acc" },
    { name: "c_comment" },
    { name: "i_status" },
    { name: "i_enable" },
    { name: "show_enable" },
    { name: "dc_user_create_id" },
    { name: "dc_user_create_cost_id" },
    { name: "d_create" },
    { name: "dc_user_update_id" },
    { name: "dc_user_update_cost_id" },
    { name: "d_update" },
    { name: "gl_tran_hdr_rq_id" }, 
    { name: "d_save_jv_date" }, 
    { name: "dc_user_update_id_req" },
    { name: "dc_user_update_cost_id_req" },
    { name: "d_update_req" },            
    { name: "dc_user_update_id_jv" },
    { name: "dc_user_update_cost_id_jv" },
    { name: "d_update_jv" },     
    { name: "c_gx_code" },
    { name: "i_is_post" },
    { name: "i_enable_gx" } 
  ]
});

Ext.storeDtl = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_ImpRequestVSNNone.php",
  baseParams: { type: "imp_request_vsn_dtl" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [
    { name: "no" },
    { name: "id" },
    { name: "i_type_year" },
    { name: "c_budget_year" },
    { name: "i_cal_gl" },
    { name: "c_booking" },
    { name: "dc_expense_group_vsn_id" },
    { name: "dc_expense_acc_vsn_id" },
    { name: "dc_expense_group_vsn_name" },
    { name: "dc_expense_acc_vsn_name" },
    { name: "c_acc_name" },
    { name: "c_approve" },
    { name: "d_doc" },
    { name: "f_inv" },
    { name: "f_tax_personal" },
    { name: "f_social_security" },
    { name: "f_prov_fund" },
    { name: "f_fine" },
    { name: "f_total" },
    { name: "c_cheque" },
    { name: "d_cheque" },
    { name: "c_request" },
    { name: "c_request_desc" },
    { name: "c_creditor" },
    { name: "c_expense_group_main" },
    { name: "c_acc_item" },
    { name: "c_acc_item2" },
    { name: "c_comment" },
    { name: "gl_dc_config_id" } 
    
  ]
});

Ext.storeItems = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_ImpRequestVSNNone.php",
  baseParams: { type: "imp_request_vsn_dtl_item" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [
    { name: "no" },
    { name: "id" },
    { name: "imp_request_vsn_dtl_id" },
    { name: "imp_request_vsn_hdr_id" },
    { name: "c_request" },
    { name: "c_request_desc" },
    { name: "d_doc" },
    { name: "f_inv" },
    { name: "c_creditor" },
    { name: "c_comment" },
    { name: "i_type_year" },
    { name: "c_budget_year" },
    { name: "i_cal_gl" },
    { name: "dc_acc_id" },            
    { name: "f_dr" },
    { name: "f_cr" },
    { name: "c_acc_code_imp" }, 
    { name: "c_acc_name_imp" },
    { name: "c_acc_code_imp_full" },
    { name: "i_type_show" }, 
    { name: "i_rank_dr" } 
    
  ]
});


Ext.dc_expense_budget_type = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_ImpRequestVSN.php",
  baseParams: { type: "dc_expense_budget_type", itype: Ext.DC_EXP_BG_ITYPE_VISIONNET },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"]
});

Ext.dc_expense_budget_type_all = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_ImpRequestVSN.php",
  baseParams: { type: "dc_expense_budget_type", itype: Ext.DC_EXP_BG_ITYPE_VISIONNET, all: "all" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
  listeners: {
    load: function(t, records, options) {
      Ext.getCmp("s_dc_expense_budget_type_id").setValue("0");
    }
  }
});

Ext.vw_dc_bank_acc_company_full1 = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_ImpRequestVSN.php",
  baseParams: { type: "vw_dc_bank_acc_company_full", dc_bank_deposit_type_id: 1 }, // ออมทรัพย์
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"]
});

Ext.vw_dc_bank_acc_company_full2 = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_ImpRequestVSN.php",
  baseParams: { type: "vw_dc_bank_acc_company_full" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"]
});

Ext.dc_expense_group_vsn = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_ImpRequestVSN.php",
  baseParams: { type: "dc_expense_group_vsn" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"]
});

Ext.dc_expense_acc_vsn = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_ImpRequestVSN.php",
  baseParams: { type: "dc_expense_acc_vsn" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name", "acc_code", "acc_name", "acc_code_overlap", "acc_name_overlap"]
});

Ext.dc_expense_acc_vsn_full = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_ImpRequestVSN.php",
  baseParams: { type: "dc_expense_acc_vsn", full: "full" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name", "acc_code", "acc_name", "acc_code_overlap", "acc_name_overlap"]
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
  data: years
});

Ext.store_type_year = new Ext.data.JsonStore({
  fields: ["id", "c_name"],
  data: [
    { id: "1", c_name: "ปีงบประมาณ" },
    { id: "2", c_name: "เหลื่อมปี" }
  ]
});

Ext.store_cal_gl = new Ext.data.JsonStore({
  fields: ["id", "c_name"],
  data: [
    { id: "1", c_name: "เงินเดือนจ่ายพนักงาน" },
    { id: "2", c_name: "จ่ายให้บริษัท" }
  ]
});


Ext.gl_dc_config_creditor = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_ImpRequestVSN.php",
  baseParams: { type: "gl_dc_config_creditor", fixed1_gl_dc_config_method : Ext.GL_CFG_SET_CREDITOR_PRODUCT, fixed2_gl_dc_config_method : Ext.GL_CFG_SET_CREDITOR_CONSTRUCTION},
 // baseParams: { type: "gl_dc_config_creditor"},
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"]
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