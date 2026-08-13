Ext.store = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/List_ImpExpenseEphis.php",
  baseParams: { type: "imp_expense_ephis_hdr", i_read: user_right_read }, // Permission i_read
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [
    { name: "no" },
    { name: "id" },
    { name: "c_code" },
    { name: "c_expense_period_no" },
    { name: "c_doc" },
    { name: "dc_expense_budget_type_id" },
    { name: "dc_expense_budget_type_name" },
    { name: "dc_bank_acc_company_id_source" },
    { name: "dc_bank_acc_company_id_target" },
    { name: "d_doc_date" },
    { name: "i_enable" },
    { name: "i_success" },
    { name: "c_comment" },
    { name: "show_enable" },
    { name: "dc_user_update_id" },
    { name: "dc_user_update_cost_id" },
    { name: "d_update" }
  ]
});

Ext.storeDtl = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_ImpExpenseEphis.php",
  baseParams: { type: "imp_expense_ephis_dtl" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [
    { name: "no" },
    { name: "id" },
    { name: "imp_expense_ephis_hdr_id" },
    { name: "dc_expense_group_vsn_id" },
    { name: "dc_expense_acc_vsn_id" },
    { name: "c_booking" },
    { name: "c_budget_year" },
    { name: "i_type_year" },
    { name: "d_doc" },
    { name: "c_request" },
    { name: "c_approve" },
    { name: "c_expense_group_main" },
    { name: "c_expense_group_sub" },
    { name: "c_acc_item" },
    { name: "c_budget_type_name" },
    { name: "c_pay_time" },
    { name: "c_bglst" },
    { name: "c_creditor" },
    { name: "c_bank_name" },
    { name: "c_bank_branch_name" },
    { name: "c_cheque_numbers" },
    { name: "c_note" },
    { name: "f_inv" },
    { name: "f_vat" },
    { name: "f_tax_personal" },
    { name: "f_tax_corporate" },
    { name: "f_social_security" },
    { name: "f_money1" },
    { name: "f_fine" },
    { name: "f_total" },
    { name: "f_check_total" },
    { name: "i_cal_gl" },
    { name: "imp_request_ephis_dtl_id" }
  ]
});

Ext.storeIS = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_ImpExpenseEphis.php",
  baseParams: { type: "imp_expense_ephis_hdr", mode: "SEARCH", i_success: 0, i_read: user_right_read }, // Permission i_read
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [
    { name: "no" },
    { name: "id" },
    { name: "c_expense_period_no" },
    { name: "c_doc" },
    { name: "dc_expense_budget_type_id" },
    { name: "dc_expense_budget_type_name" },
    { name: "dc_bank_acc_company_id_source" },
    { name: "dc_bank_acc_company_id_target" },
    { name: "d_doc_date" },
    { name: "i_enable" },
    { name: "i_success" },
    { name: "c_comment" },
    { name: "show_enable" },
    { name: "dc_user_update_id" },
    { name: "dc_user_update_cost_id" },
    { name: "d_update" }
  ]
});

Ext.dc_expense_budget_type_all = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_ImportExpenseVSN.php",
  baseParams: { type: "dc_expense_budget_type", all: "all" }, // 2 = VSN
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
  listeners: {
    load: function(t, records, options) {
      Ext.getCmp("s_dc_expense_budget_type_id").setValue("0");
    }
  }
});

Ext.dc_expense_budget_type = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_ImportExpenseVSN.php",
  baseParams: { type: "dc_expense_budget_type" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"]
});

Ext.vw_dc_bank_acc_company_full1 = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_ImportExpenseVSN.php",
  baseParams: { type: "vw_dc_bank_acc_company_full", dc_bank_deposit_type_id: 1 }, // ออมทรัพย์
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"]
});

Ext.vw_dc_bank_acc_company_full2 = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_ImportExpenseVSN.php",
  baseParams: { type: "vw_dc_bank_acc_company_full" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"]
});

Ext.dc_expense_group_vsn = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_ImportExpenseVSN.php",
  baseParams: { type: "dc_expense_group_vsn" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"]
});

Ext.dc_expense_acc_vsn = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_ImpExpenseEphis.php",
  baseParams: { type: "dc_expense_acc_vsn" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name", "c_group_name", "acc_code", "acc_name", "acc_code_overlap", "acc_name_overlap"]
});

Ext.dc_expense_acc_vsn_full = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_ImpExpenseEphis.php",
  baseParams: { type: "dc_expense_acc_vsn", full: "full" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name", "c_group_name", "acc_code", "acc_name", "acc_code_overlap", "acc_name_overlap"]
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
  data: years
});

Ext.store_type_year = new Ext.data.JsonStore({
  fields: ["id", "c_name"],
  idProperty: "id",
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

Ext.imp_request_ephis_dtl_gx = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_ImpExpenseEphis.php",
  baseParams: { type: "imp_request_ephis_dtl_gx"},
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"]
});