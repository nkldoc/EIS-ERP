Ext.store = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/List_ImportExpense.php",
  baseParams: { type: "imp_expense_hdr", i_read: user_right_read, ITYPE_JV: Ext.ITYPE_JV }, // Permission i_read
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [
    { name: "no" },
    { name: "id" },
    { name: "c_code" },
    { name: "c_code_bank" },
    { name: "i_post" },
    { name: "c_expense_period_no" },
    { name: "c_doc" },
    { name: "dc_expense_budget_type_id" },
    { name: "dc_expense_budget_type" },
    { name: "dc_bank_acc_company_id_source" },
    { name: "dc_bank_acc_company_id_target" },
    { name: "d_doc_date" },
    { name: "d_save_jv_date" },
    { name: "dc_cost_acc" },
    { name: "i_enable" },
    { name: "c_comment" },
    { name: "show_enable" },
    { name: "dc_user_create_id" },
    { name: "dc_user_create_cost_id" },
    { name: "d_create" },
    { name: "dc_user_update_id" },
    { name: "dc_user_update_cost_id" },
    { name: "d_update" },
    { name: "gl_tran_hdr_id" },
    { name: "gl_tran_hdr_id_bank_id" },
    { name: "c_gx_code" },
    { name: "i_is_post" },
    { name: "i_enable_gx" }
  ]
});

// Ext.storeDtl = new Ext.data.JsonStore({
//   autoDestroy: false,
//   autoLoad: false,
//   url: "api/List_ImportExpenseVSN.php",
//   baseParams: { type: "imp_expense_vsn_dtl" },
//   root: "data",
//   idProperty: "id",
//   totalProperty: "totalCount",
//   fields: [
//     { name: "no" },
//     { name: "id" },
//     { name: "i_type_year" },
//     { name: "c_budget_year" },
//     { name: "i_cal_gl" },
//     { name: "c_booking" },
//     { name: "dc_expense_group_vsn_id" },
//     { name: "dc_expense_acc_vsn_id" },
//     { name: "dc_expense_group_vsn_name" },
//     { name: "dc_expense_acc_vsn_name" },
//     { name: "c_acc_name" },
//     { name: "c_approve" },
//     { name: "d_doc" },
//     { name: "f_inv" },
//     { name: "f_tax_personal" },
//     { name: "f_social_security" },
//     { name: "f_prov_fund" },
//     { name: "f_fine" },
//     { name: "f_total" },
//     { name: "c_cheque" },
//     { name: "d_cheque" },
//     { name: "c_request" },
//     { name: "c_creditor" },
//     { name: "c_expense_group_main" },
//     { name: "c_acc_item" }
//   ]
// });

Ext.dc_expense_budget_type = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_ImportExpenseVSN.php",
  baseParams: { type: "dc_expense_budget_type", itype: Ext.DC_EXP_BG_ITYPE_EPHYS },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"]
});

Ext.dc_expense_budget_type_all = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_ImportExpenseVSN.php",
  baseParams: { type: "dc_expense_budget_type", itype: Ext.DC_EXP_BG_ITYPE_EPHYS, all: "all" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
  listeners: {
    load: function(t, records, options) {
      Ext.getCmp("s_dc_expense_budget_type_id").setValue("0");
    }
  }
});

// Ext.vw_dc_bank_acc_company_full1 = new Ext.data.JsonStore({
//   autoDestroy: false,
//   autoLoad: false,
//   url: "api/All_ImportExpenseVSN.php",
//   baseParams: { type: "vw_dc_bank_acc_company_full", dc_bank_deposit_type_id: 1 }, // ออมทรัพย์
//   root: "data",
//   idProperty: "id",
//   fields: ["id", "c_name"]
// });

// Ext.vw_dc_bank_acc_company_full2 = new Ext.data.JsonStore({
//   autoDestroy: false,
//   autoLoad: false,
//   url: "api/All_ImportExpenseVSN.php",
//   baseParams: { type: "vw_dc_bank_acc_company_full" },
//   root: "data",
//   idProperty: "id",
//   fields: ["id", "c_name"]
// });

// Ext.dc_expense_group_vsn = new Ext.data.JsonStore({
//   autoDestroy: false,
//   autoLoad: false,
//   url: "api/All_ImportExpenseVSN.php",
//   baseParams: { type: "dc_expense_group_vsn" },
//   root: "data",
//   idProperty: "id",
//   fields: ["id", "c_name"]
// });

// Ext.dc_expense_acc_vsn = new Ext.data.JsonStore({
//   autoDestroy: false,
//   autoLoad: false,
//   url: "api/All_ImportExpenseVSN.php",
//   baseParams: { type: "dc_expense_acc_vsn" },
//   root: "data",
//   idProperty: "id",
//   fields: ["id", "c_name", "acc_code", "acc_name", "acc_code_overlap", "acc_name_overlap"]
// });

// Ext.dc_expense_acc_vsn_full = new Ext.data.JsonStore({
//   autoDestroy: false,
//   autoLoad: false,
//   url: "api/All_ImportExpenseVSN.php",
//   baseParams: { type: "dc_expense_acc_vsn", full: "full" },
//   root: "data",
//   idProperty: "id",
//   fields: ["id", "c_name", "acc_code", "acc_name", "acc_code_overlap", "acc_name_overlap"]
// });

// // storeYear
// let years = [];
// let currentTime = new Date();
// let now = currentTime.getFullYear() + 1;
// let id = currentTime.getFullYear() - 3;
// while (id <= now) {
//   let c_name = id + 543;
//   years.push({ id, c_name });
//   id++;
// }

// Ext.store_year = new Ext.data.JsonStore({
//   fields: ["id", "c_name"],
//   data: years
// });

// Ext.store_type_year = new Ext.data.JsonStore({
//   fields: ["id", "c_name"],
//   data: [
//     { id: "1", c_name: "ปีงบประมาณ" },
//     { id: "2", c_name: "เหลื่อมปี" }
//   ]
// });

// Ext.store_cal_gl = new Ext.data.JsonStore({
//   fields: ["id", "c_name"],
//   data: [
//     { id: "1", c_name: "เงินเดือนจ่ายพนักงาน" },
//     { id: "2", c_name: "จ่ายให้บริษัท" }
//   ]
// });
