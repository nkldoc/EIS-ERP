Ext.part_file_pdf = "http://" + location.host + "/pdf_po/";

const dcAccIds = Array.from({ length: 10 }, (_, i) => ({ name: `dc_acc_id${i + 1}` }));
const accMonths = Array.from({ length: 10 }, (_, i) => ({ name: `c_acc_month${i + 1}` }));
const fAccInvs = Array.from({ length: 10 }, (_, i) => ({ name: `f_acc_inv${i + 1}` }));
const fAccVats = Array.from({ length: 10 }, (_, i) => ({ name: `f_acc_vat${i + 1}` }));
const fAccInvVats = Array.from({ length: 10 }, (_, i) => ({ name: `f_acc_inv_vat${i + 1}` }));

let Date_now = new Date();
Date_now = [Date_now.getFullYear().toString(), (Date_now.getMonth() + 1).toString().padStart(2, "0"), Date_now.getDate().toString().padStart(2, "0")];
Ext.bgYear = Date_now[0] - 0 + ((Date_now[1] < 10 ? 0 : 1) - 0);
Ext.store = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/List_poReg.php",
  baseParams: {
    type: "po_working_hdr",
    i_status_before: Ext.I_STATUS_BEFORE,
    i_status: Ext.I_STATUS,
    i_sub_status_before: Ext.I_SUB_STATUS_BEFORE,
    i_sub_status: Ext.I_SUB_STATUS,
    i_cost: 1,
    i_budget_year: Ext.bgYear,
    i_budget_year_overlap: 0,
    i_read: user_right_read,
    c_code_sys: Ext.C_CODE_SYS,
    i_view_my_status: 1,
  }, // Permission i_read
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [
    { name: "no" },
    { name: "id" },
    { name: "po_working_begin_hdr_id" },
    { name: "bg_request_money_income_id" },
    { name: "c_code" },
    { name: "c_code_per" },
    { name: "c_title" },
    { name: "c_heading" },
    { name: "c_booking" },
    { name: "i_working_type" },
    { name: "i_purchase" },
    { name: "f_inv" },
    { name: "f_vat_rate" },
    { name: "f_vat" },
    { name: "f_inv_vat" },
    { name: "f_tax_personal" },
    { name: "f_tax_personal_rate" },
    { name: "f_social_security" },
    { name: "f_prov_fund" },
    { name: "f_fine" },
    { name: "f_warranty" },
    { name: "f_other" },
    { name: "f_pay" },
    { name: "c_code_ref" },
    { name: "i_pdf_dtl_outside" },
    { name: "i_sub_status" },
    { name: "i_status_last" },
    { name: "c_status_last" },
    { name: "i_status_edit" },
    { name: "i_protest_only_doc_hdr" },
    { name: "i_protect_only_doc" },
    { name: "c_approve" },
    { name: "d_approve_date" },
    { name: "bg_expense_id" },
    { name: "bg_budget_dtl_overlap_id" },
    { name: "dc_cost_id" },
    { name: "dc_creditor_id" },
    { name: "dc_creditor_transfer_id" },
    { name: "po_creditor_id" },
    { name: "po_creditor_transfer_id" },
    { name: "c_code_invoice" },
    { name: "dc_cost_acc_id" },
    { name: "c_qty" },
    { name: "i_doc_duo" },
    { name: "i_reserve_pay" },
    { name: "po_emp_id" },
    { name: "i_inside_cost" },
    { name: "po_working_program_hdr_id" },
    { name: "sp_sbill_hdr_id" },
    { name: "bg_budget_hdr_change_id" },
    { name: "cm_receive_tran_hdr_id" },
    { name: "dc_approve_name" },
    { name: "dc_approve_id" },
    { name: "d_doc_date" },
    { name: "d_inv_date" },
    { name: "d_audit_date" },
    { name: "cost_name" },
    { name: "dc_expense_budget_type_id" },
    { name: "dc_tax_customer_id" },
    { name: "budget_name" },
    { name: "bg_expense_name" },
    { name: "creditor_name" },
    { name: "i_budget_year" },
    { name: "i_budget_year_overlap" },
    { name: "c_i_budget_year_overlap" },
    { name: "c_i_budget_year" },
    { name: "f_total" },
    { name: "d_status_date" },
    { name: "c_comment" },
    { name: "i_enable" },
    { name: "dc_user_update_id" },
    { name: "dc_user_update_cost_id" },
    { name: "d_create" },
    { name: "d_update" },
    { name: "back_d_doc_date" },
    { name: "back_c_comment" },
    { name: "d_receive_date" },
    { name: "c_receive_comment" },
    { name: "i_close_receive" },
    { name: "c_comment_status" },
    { name: "d_status_date_last" },
    { name: "dc_bank_acc_creditor_id" },
    { name: "i_protest" },
    { name: "i_is_url_pdf_hdr" },
    { name: "i_is_url_pdf_dtl" },
    { name: "pdf_hdr" },
    { name: "pdf_dtl" },
    { name: "c_code_debt" },
    { name: "c_code_advance" },
    { name: "d_debt_date" },
    { name: "c_debt_month" },
    { name: "c_debt_year" },
    { name: "gl_tran_hdr_id" },
    { name: "i_sys_ss" },
    { name: "chk_id_ss" },
    { name: "i_send_jv" },
    { name: "c_send_jv" },
    { name: "c_file_pdf_protest_hdr" },
    { name: "c_file_pdf_protest_dtl" },
  ],
});

Ext.select_data_ss_77 = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_poReg.php",
  baseParams: {
    type: "select_data_ss_77",
  },
  root: "data",
  totalProperty: "totalCount",
  // idProperty: "id",
  fields: [
    { name: "no" },
    { name: "id" },
    { name: "fi_br_hdr_id" }, //null
    { name: "i_sys" },
    { name: "pr_id" },
    { name: "po_id" },
    { name: "per_id" },
    { name: "chk_id" },
    { name: "c_title" },
    { name: "dc_cost_id" },
    { name: "dc_creditor_id" },
    { name: "dc_creditor_transfer_id" },
    { name: "dc_creditor_name" },
    { name: "c_code_per" },
    { name: "c_booking" },
    { name: "c_heading" },
    { name: "c_comment" },
    { name: "c_code_ref" }, //null
    { name: "d_chk_last_date" },
    { name: "d_doc_date" },
    { name: "d_audit_date" },
    { name: "f_per_inv" },
    { name: "f_per_vat_rate" },
    { name: "f_per_vat" },
    { name: "f_per_inv_vat" },
    { name: "f_total" },
    { name: "f_per_tax_personal_rate" },
    { name: "f_per_tax_personal" },
    { name: "f_tax_personal_rate" },
    { name: "f_tax_personal" },
    { name: "f_per_fine" },
    { name: "f_per_warranty" },
    { name: "f_per_other" },
    { name: "f_per_total" },
    { name: "i_enable" },
    { name: "i_delete" },
    { name: "dc_user_send_id" },
    { name: "po_emp_id" },
    { name: "dc_user_create_id" },
    { name: "dc_user_create_cost_id" },
    { name: "d_create" },
    { name: "dc_user_update_id" },
    { name: "dc_user_update_cost_id" },
    { name: "d_update" },
    { name: "c_code_invoice" },
    { name: "bg_reserve_money_id" },
    { name: "i_budget_year" },
    { name: "i_budget_year_overlap" },
    { name: "d_chk_date" },
    { name: "dc_expense_budget_type_id" },
    { name: "bg_expense_id" },
    { name: "bg_expense_name" },
    { name: "c_qty" },
    { name: "f_inv_vat" },
    { name: "f_vat_rate" },
    { name: "f_vat" },
    { name: "f_inv" },
    { name: "f_pay" },
    { name: "f_fine" },
    { name: "f_warranty" },
    { name: "f_other" },
    { name: "dc_cost_acc_id" },
    { name: "i_working_type" },
    { name: "i_doc_duo" },
    { name: "i_reserve_pay" },

    { name: "gl_tran_hdr_id" },
    { name: "c_code_debt" },
    { name: "d_debt_date" },
    { name: "c_debt_month" },
    { name: "c_debt_year" },
    { name: "dc_bank_acc_creditor_id" },


    ...dcAccIds,
    ...accMonths,
    ...fAccInvs,
    ...fAccVats,
    ...fAccInvVats,
  ],
});
Ext.select_data_ss_99 = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_poReg.php",
  baseParams: {
    type: "select_data_ss_99",
  },
  root: "data",
  totalProperty: "totalCount",
  // idProperty: "id",
  fields: [
    { name: "no" },
    { name: "id" },
    { name: "fi_br_hdr_id" }, //null
    { name: "i_sys" },
    { name: "pr_id" },
    { name: "po_id" },
    { name: "per_id" },
    { name: "chk_id" },
    { name: "c_title" },
    { name: "dc_cost_id" },
    { name: "c_comment" },
    { name: "dc_creditor_id" },
    { name: "dc_creditor_transfer_id" },
    { name: "dc_creditor_name" },
    { name: "c_code_per" },
    { name: "c_booking" },
    { name: "c_heading" },
    { name: "c_code_ref" }, //null
    { name: "d_chk_last_date" },
    { name: "d_doc_date" },
    { name: "d_audit_date" },
    { name: "f_per_inv" },
    { name: "f_per_vat_rate" },
    { name: "f_per_vat" },
    { name: "f_per_inv_vat" },
    { name: "f_total" },
    { name: "f_per_tax_personal_rate" },
    { name: "f_per_tax_personal" },
    { name: "f_tax_personal_rate" },
    { name: "f_tax_personal" },
    { name: "f_per_fine" },
    { name: "f_per_warranty" },
    { name: "f_per_other" },
    { name: "f_per_total" },
    { name: "i_enable" },
    { name: "i_delete" },
    { name: "dc_user_send_id" },
    { name: "po_emp_id" },
    { name: "dc_user_create_id" },
    { name: "dc_user_create_cost_id" },
    { name: "d_create" },
    { name: "dc_user_update_id" },
    { name: "dc_user_update_cost_id" },
    { name: "d_update" },
    { name: "c_code_invoice" },
    { name: "bg_reserve_money_id" },
    { name: "i_budget_year" },
    { name: "i_budget_year_overlap" },
    { name: "d_chk_date" },
    { name: "dc_expense_budget_type_id" },
    { name: "bg_expense_id" },
    { name: "bg_expense_name" },
    { name: "c_qty" },
    { name: "f_inv_vat" },
    { name: "f_vat_rate" },
    { name: "f_vat" },
    { name: "f_inv" },
    { name: "f_pay" },
    { name: "f_fine" },
    { name: "f_warranty" },
    { name: "f_other" },
    { name: "dc_cost_acc_id" },
    { name: "i_working_type" },
    { name: "i_doc_duo" },
    { name: "i_reserve_pay" },

    { name: "gl_tran_hdr_id" },
    { name: "c_code_debt" },
    { name: "d_debt_date" },
    { name: "c_debt_month" },
    { name: "c_debt_year" },
    { name: "dc_bank_acc_creditor_id" },

    ...dcAccIds,
    ...accMonths,
    ...fAccInvs,
    ...fAccVats,
    ...fAccInvVats,
  ],
});
Ext.select_data_bb_99 = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_poReg.php",
  baseParams: {
    type: "select_data_bb_99",
  },
  root: "data",
  totalProperty: "totalCount",
  // idProperty: "id",
  fields: [
    { name: "no" },
    { name: "i_sys" },
    { name: "fi_br_hdr_id" },
    { name: "c_title" },
    { name: "c_heading" },
    { name: "c_comment" },
    { name: "dc_cost_acc_id" },
    { name: "dc_cost_id" },
    { name: "dc_creditor_id" },
    { name: "dc_creditor_transfer_id" },
    { name: "c_code_per" },
    { name: "c_booking" },
    { name: "d_audit_date" },
    { name: "d_doc_date" },
    { name: "i_enable" },
    { name: "i_delete" },
    { name: "dc_user_send_id" },
    { name: "po_emp_id" },
    { name: "i_budget_year" },
    { name: "i_budget_year_overlap" },
    { name: "i_working_type" },
    { name: "f_money_br" },
    { name: "f_money_clear_by_cash" },
    { name: "f_money_clear_by_doc" },
    { name: "f_money_remain" },
    { name: "f_working_sum" },
    { name: "doc_request_normal1_id" },
    { name: "doc_request_normal2_id" },
    { name: "doc_request_normal3_id" },
    { name: "doc_request_normal4_id" },
    { name: "doc_request_normal5_id" },
    { name: "doc_request_add1_id" },

    { name: "gl_tran_hdr_id" },
    { name: "c_code_debt" },
    { name: "d_debt_date" },
    { name: "c_debt_month" },
    { name: "c_debt_year" },
    ...dcAccIds,
    ...accMonths,
    ...fAccInvs,
    ...fAccVats,
    ...fAccInvVats,
  ],
});
Ext.select_data_ee_99 = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_poReg.php",
  baseParams: {
    type: "select_data_ee_99",
  },
  totalProperty: "totalCount",
  root: "data",
  // idProperty: "id",
  fields: [
    { name: "no" },
    { name: "fi_br_hdr_id" },
    { name: "i_sys" },
    { name: "pr_id" }, //null
    { name: "po_id" }, //null
    { name: "per_id" }, //null
    { name: "c_title" },
    { name: "c_comment" },
    { name: "dc_cost_id" },
    { name: "dc_cost_acc_id" },
    { name: "dc_creditor_id" },
    { name: "dc_creditor_transfer_id" },
    { name: "c_code_per" },
    { name: "c_booking" },
    { name: "c_code_ref" }, //null
    { name: "d_chk_last_date" }, //null
    { name: "d_doc_date" },
    { name: "d_audit_date" }, //null
    { name: "i_enable" },
    { name: "i_delete" },
    { name: "dc_user_send_id" },
    { name: "po_emp_id" },
    { name: "i_budget_year" },
    { name: "i_budget_year_overlap" },
    { name: "i_working_type" },
    { name: "f_money_br" },
    { name: "f_money_clear_by_cash" },
    { name: "f_money_clear_by_doc" },
    { name: "f_money_remain" },
    { name: "doc_request_normal1_id" },
    { name: "doc_request_normal2_id" },
    { name: "doc_request_normal3_id" },
    { name: "doc_request_normal4_id" },
    { name: "doc_request_normal5_id" },
    { name: "doc_request_add1_id" },

    { name: "f_total" },
    { name: "f_inv" },
    { name: "f_inv_vat" },
    { name: "f_pay" },

    { name: "gl_tran_hdr_id" },
    { name: "c_code_debt" },
    { name: "d_debt_date" },
    { name: "c_debt_month" },
    { name: "c_debt_year" },
    ...dcAccIds,
    ...accMonths,
    ...fAccInvs,
    ...fAccVats,
    ...fAccInvVats,
  ],
});
Ext.select_data_wm = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_poReg.php",
  baseParams: {
    type: "select_data_wm",
  },
  totalProperty: "totalCount",
  root: "data",
  // idProperty: "id",
  fields: [
    { name: "no" },
    { name: "cm_receive_tran_hdr_id" },
    { name: "cm_group_receive_for_wm_hdr_id" },
    // { name: "i_sys" },
    // { name: "pr_id" }, //null
    // { name: "po_id" }, //null
    // { name: "per_id" }, //null
    { name: "c_title" },
    { name: "i_type_menu_sub" },
    { name: "dc_expense_budget_type_id" },
    { name: "pr_tor" },
    { name: "pr_tor_id" },
    { name: "c_heading" },
    { name: "c_title" },
    { name: "c_comment" },

    { name: "dc_cost_id" },
    { name: "dc_cost_acc_id" },
    { name: "name_receive" },
    { name: "c_other_name" },
    { name: "dc_emp_id" },
    { name: "dc_creditor_id" },
    { name: "dc_creditor_transfer_id" },
    { name: "c_code_per" },
    { name: "c_doc_ref1" },
    // { name: "c_code_ref" }, //null
    // { name: "d_chk_last_date" }, //null
    { name: "d_doc_date" },
    { name: "d_audit_date" }, //null
    { name: "i_enable" },
    { name: "i_delete" },
    { name: "dc_user_send_id" },
    { name: "po_emp_id" },
    { name: "i_budget_year" },
    { name: "i_budget_year_overlap" },
    { name: "i_working_type" },
    { name: "f_money_br" },
    { name: "f_money_clear_by_cash" },
    { name: "f_money_clear_by_doc" },
    { name: "f_money_remain" },

    { name: "c_contract_number" },
    { name: "f_guarantee_contract" },
    // { name: "doc_request_normal1_id" },
    // { name: "doc_request_normal2_id" },
    // { name: "doc_request_normal3_id" },
    // { name: "doc_request_normal4_id" },
    // { name: "doc_request_normal5_id" },
    // { name: "doc_request_add1_id" },

    { name: "c_code_invoice" },
    { name: "c_qty" },
    { name: "f_total" },
    { name: "f_inv" },
    { name: "f_inv_vat" },
    { name: "f_pay" },

    { name: "gl_tran_hdr_id" },
    { name: "c_code_debt" },
    { name: "d_debt_date" },
    { name: "c_debt_month" },
    { name: "c_debt_year" },

    ...dcAccIds,
    ...accMonths,
    ...fAccInvs,
    ...fAccVats,
    ...fAccInvVats,
  ],
});
Ext.select_data_wt = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_poReg.php",
  baseParams: {
    type: "select_data_wt",
  },
  root: "data",
  totalProperty: "totalCount",
  // idProperty: "id",
  fields: [
    { name: "no" },
    { name: "bg_budget_hdr_change_id" },
    { name: "c_heading" },
    { name: "c_comment" },
    { name: "dc_cost_acc_id" },
    { name: "dc_cost_acc_name" },
    { name: "dc_cost_id" },
    { name: "dc_creditor_id" },
    { name: "dc_creditor_transfer_id" },
    { name: "c_code_per" },
    { name: "po_emp_id" },
    { name: "dc_expense_budget_type_id" },
    { name: "dc_expense_budget_type_name" },
    { name: "bg_expense_id" },
    { name: "c_qty" },
    { name: "i_working_type" },
    { name: "c_booking" },
    { name: "c_code_invoice" },
    { name: "d_chk_last_date" },
    { name: "d_doc_date" },
    { name: "d_audit_date" },
    { name: "i_enable" },
    { name: "i_delete" },
    { name: "i_budget_year" },
    { name: "i_budget_year_overlap" },
    { name: "f_total" },
    { name: "f_inv" },
    { name: "f_inv_vat" },
    { name: "f_pay" },

    { name: "dc_cost_acc_type1" },
    { name: "dc_cost_acc_type2" },

    { name: "gl_tran_hdr_id" },
    { name: "c_code_debt" },
    { name: "d_debt_date" },
    { name: "c_debt_month" },
    { name: "c_debt_year" },

    ...dcAccIds,
    ...accMonths,
    ...fAccInvs,
    ...fAccVats,
    ...fAccInvVats,
  ],
});

let po_working_begin_item_Record = Ext.data.Record.create([{ name: "no" }, { name: "id" }, { name: "c_month" }, { name: "dc_acc_id" }, { name: "dc_acc_name" }, { name: "f_inv" }, { name: "f_vat" }, { name: "f_inv_vat" }]);

Ext.po_working_begin_item = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_poReg.php",
  baseParams: {
    type: "po_working_begin_item",
  },
  root: "data",
  idProperty: "id",
  fields: po_working_begin_item_Record,
});

Ext.dc_cost = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: {
    type: "dc_cost",
    i_read: user_right_read,
    c_code_sys: Ext.C_CODE_SYS,
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_code", "c_name"],
});

Ext.dc_expense_budget_type_all = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorking.php",
  baseParams: { type: "dc_expense_budget_type", all: "all", i_read: user_right_read, c_code_sys: Ext.C_CODE_SYS },
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
  url: "api/All_poWorking.php",
  baseParams: { type: "dc_expense_budget_type", i_read: user_right_read, i_read: user_right_read, c_code_sys: Ext.C_CODE_SYS },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});

Ext.dc_cost_sys_main_all = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: { type: "dc_cost_sys_main", all: "all", i_read: user_right_read, c_code_sys: Ext.C_CODE_SYS },
  root: "data",
  idProperty: "id",
  fields: ["id", "dc_cost_main_id", "c_name", "i_main"],
  listeners: {
    load: function (t, records, options) {
      Ext.getCmp("s_dc_cost_acc_id").setValue("0");
    },
  },
});

Ext.dc_cost_sys_main = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: { type: "dc_cost_sys_main", i_read: user_right_read, c_code_sys: Ext.C_CODE_SYS },
  root: "data",
  idProperty: "id",
  fields: ["id", "dc_cost_main_id", "c_name", "i_main"],
  listeners: {
    load: function (t, records, options) {
      var record = records.filter((record) => record.get("i_main") == 1);
      if (record.length === 0) record = records;
      Ext.dc_cost_acc_default = record[0].data.id;
      Ext.dc_cost_main_default = record[0].data.dc_cost_main_id;

      Ext.dc_cost.load({ params: { dc_cost_acc_id: Ext.dc_cost_acc_default } });
      Ext.dc_expense_budget_type.load({ params: { dc_cost_acc_id: Ext.dc_cost_acc_default } });
      Ext.dc_user_approve.load({ params: { dc_cost_acc_id: Ext.dc_cost_acc_default } });
    },
  },
});

Ext.booking_store = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: { type: "booking_store" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_booking", "dc_expense_budget_type_id", "bg_expense_id", "f_total", "i_extend_time", "d_start_date", "d_end_date", "i_dont_start"],
});

Ext.booking_store_one = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: { type: "booking_store" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_booking", "dc_expense_budget_type_id", "bg_expense_id", "f_total", "i_extend_time", "d_start_date", "d_end_date", "i_dont_start"],
});

Ext.booking_store_pop = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: { type: "booking_store_pop" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_booking", "dc_expense_budget_type_id", "bg_expense_id", "f_total", "i_extend_time", "d_start_date", "d_end_date", "i_dont_start"],
});

Ext.f_income_total = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_poReg.php",
  baseParams: { type: "f_income_total" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [{ name: "f_income_total" }],
});

Ext.storeInsurance = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_poWorking.php",
  baseParams: { type: "po_insurance" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [{ name: "no" }, { name: "id" }, { name: "c_code_ref" }, { name: "f_total" }, { name: "c_comment" }],
});

Ext.dc_creditor = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: {
    type: "dc_creditor",
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_code", "c_name"],
});

Ext.dc_acc = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: {
    type: "dc_acc",
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_code", "c_name"],
});

Ext.po_creditor = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: {
    type: "po_creditor",
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_code", "c_name"],
});

Ext.po_emp = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: {
    type: "po_emp",
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_code", "c_name"],
});

Ext.po_creditor_transfer = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: {
    type: "po_creditor_transfer",
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_code", "c_name"],
});

Ext.dc_user_approve = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: {
    type: "dc_user_approve",
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});

Ext.po_user_permission = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorking.php",
  baseParams: { type: "po_user_permission" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});

Ext.po_reason_protest = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorking.php",
  baseParams: { type: "po_reason_protest" },
  root: "data",
  idProperty: "id",
  fields: ["id", "i_row", "c_name"],
});

Ext.po_parcel_officer = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorking.php",
  baseParams: { type: "po_parcel_officer" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});

Ext.bg_expense = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorking.php",
  baseParams: { type: "bg_expense" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});

Ext.bg_expense_have = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorking.php",
  baseParams: { type: "bg_expense" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});

Ext.bg_expense_have_one = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorking.php",
  baseParams: { type: "bg_expense" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});

Ext.bg_expense_pop = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorking.php",
  baseParams: { type: "bg_expense_pop" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: ["no", "id", "c_code", "c_name", "f_plan", "f_income", "f_income_all", "f_income_total"],
});

Ext.bg_expense_pop_one = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorking.php",
  baseParams: { type: "bg_expense_pop" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: ["no", "id", "c_code", "c_name", "f_plan", "f_income", "f_income_all", "f_income_total"],
});

Ext.bg_expense_one_4 = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorking.php",
  baseParams: { type: "bg_expense_one_4" },
  root: "data",
  fields: ["f_sum"],
});

Ext.money_working_type_a = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorking.php",
  baseParams: { type: "money_working_type_a" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: ["f_money_working_type_a"],
});

Ext.sp_sbill = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorking.php",
  baseParams: { type: "sp_sbill_pop" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: ["no", "id", "c_contract_code", "count", "f_sum"],
});

Ext.sp_sbill_pop = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorking.php",
  baseParams: { type: "sp_sbill_pop" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: ["no", "id", "c_contract_code", "count", "f_sum"],
});

Ext.sp_sbill_pop_item = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorking.php",
  baseParams: { type: "sp_sbill_pop_item" },
  root: "data",
  // idProperty: "id",
  totalProperty: "totalCount",
  fields: ["no", "sp_sbill_hdr_id", "c_doc_result_ref", "c_doc_ref", "d_doc_date", "f_period_amt"],
});

Ext.po_working_program = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorking.php",
  baseParams: { type: "po_working_program_pop" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: ["no", "id", "c_code", "c_name", "bg_expense_name", "f_sum"],
});

Ext.po_working_program_pop = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorking.php",
  baseParams: { type: "po_working_program_pop" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: ["no", "id", "c_code", "c_name", "bg_expense_name", "f_sum"],
});

Ext.bg_budget_overlap = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorking.php",
  baseParams: { type: "bg_budget_dtl_overlap" },
  root: "data",
  idProperty: "id",
  fields: ["id", "i_year", "dc_expense_budget_type_name", "c_code_ref", "dc_cost_name", "bg_expense_name", "f_total", "f_cancel"],
});

Ext.storeCheque = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_poWorking.php",
  baseParams: { type: "po_working_cheque" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [{ name: "no" }, { name: "id" }, { name: "i_type" }, { name: "c_creditor" }, { name: "c_cheque" }, { name: "f_total" }, { name: "c_comment" }, { name: "i_status" }, { name: "i_cheque" }, { name: "i_chk" }],
});

Ext.dc_tax_customer = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/All_poWorking.php",
  baseParams: {
    type: "dc_tax_customer",
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name", "i_is_type", "i_dec_person", "i_type_tax", "dc_tax_income_id", "c_name_tax_income"],
});

Ext.creditor_taxdata = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorking.php",
  baseParams: { type: "CREDITOR_TAXDATA" },
  root: "data",
  idProperty: "id",
  fields: [
    "id",
    "c_tax_number_imp",
    "dc_tax_customer_id",
    "c_name_tax_customer",
    "c_name_tax_income",
    "tax_c_title",
    "tax_c_name",
    "tax_c_middle_name",
    "tax_c_last_name",
    "tax_c_branch",
    "tax_c_bldg",
    "tax_c_room_no",
    "tax_c_floor",
    "tax_c_village",
    "tax_c_house_no",
    "tax_c_village_no",
    "tax_c_lane",
    "tax_c_road",
    "tax_c_province",
    "tax_c_district",
    "tax_c_tambon",
    "tax_c_post_code",
    "dc_tambon_id",
    "c_email",
    "c_tele_imp",
    "dc_tambon_id",
    "dc_district_id",
    "dc_province_id",
    "c_post_code_all",
  ],
});
Ext.c_post_code = new Ext.data.JsonStore({
  fields: ["c_code"],
});
Ext.dc_province = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/All_poWorking.php",
  baseParams: {
    type: "dc_province",
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});
Ext.dc_district = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorking.php",
  baseParams: {
    type: "dc_district",
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});
Ext.dc_tambon = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorking.php",
  baseParams: {
    type: "dc_tambon",
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name", "c_post_code_all"],
});
Ext.dc_title = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/All_poWorking.php",
  baseParams: {
    type: "dc_title",
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});

Ext.dc_bank_acc_creditor = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/All_poWorking.php",
  baseParams: {
    type: "dc_bank_acc_creditor",
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name_full", "c_code", "c_name_bank_acc", "c_name_bank", "i_main"],
});

let po_working_cheque_Record = Ext.data.Record.create([{ name: "id" }, { name: "cm_pay_type_id" }, { name: "c_cheque" }, { name: "c_creditor" }, { name: "f_total" }]);

Ext.po_working_cheque_1 = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_poSetPayType.php",
  baseParams: {
    type: "po_working_cheque",
    i_money_type: "1",
  },
  root: "data",
  idProperty: "id",
  fields: po_working_cheque_Record,
});

Ext.po_working_cheque_2 = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_poSetPayType.php",
  baseParams: {
    type: "po_working_cheque",
    i_money_type: "2",
  },
  root: "data",
  idProperty: "id",
  fields: po_working_cheque_Record,
});

let po_working_pay_item_Record = Ext.data.Record.create([{ name: "id" }, { name: "c_code_bank_acc" }, { name: "c_name_bank_acc" }, { name: "dc_bank_id" }, { name: "f_total" }]);
Ext.po_working_pay_item = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  root: "data",
  idProperty: "id",
  fields: po_working_pay_item_Record,
});

Ext.po_working_pay_item_all = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorking.php",
  baseParams: {
    type: "po_working_pay_item",
  },
  root: "data",
  idProperty: "id",
  fields: ["po_working_pay_item_id", "po_working_hdr_id", "po_working_cheque_id", "c_code_bank_acc", "c_name_bank_acc", "dc_bank_id", "f_total"],
});

Ext.dc_bank = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/All_PoWorkingImpHdr.php",
  root: "data",
  idProperty: "id",
  baseParams: { type: "dc_bank" },
  fields: [{ name: "id" }, { name: "c_name" }],
});

Ext.storePay = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_poWorking.php",
  baseParams: {
    type: "po_working_hdr",
    PAGE: "poPay",
    i_budget_year: new Date().getFullYear(),
    i_status: Ext.I_STATUS,
    i_status_before: Ext.I_STATUS_BEFORE,
    i_read: user_right_read,
  }, // Permission i_read
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [
    { name: "no" },
    { name: "id" },
    { name: "c_code" },
    { name: "i_status_last" },
    { name: "c_status_last" },
    { name: "i_status_edit" },
    { name: "c_approve" },
    { name: "d_approve_date" },
    { name: "bg_expense_id" },
    { name: "c_booking" },
    { name: "cost_name" },
    { name: "budget_name" },
    { name: "bg_expense_name" },
    { name: "creditor_name" },
    { name: "i_budget_year" },
    { name: "i_budget_year_overlap" },
    { name: "f_total" },
    { name: "d_status_date" },
    { name: "c_comment" },
    { name: "i_enable" },
    { name: "dc_user_update_id" },
    { name: "dc_user_update_cost_id" },
    { name: "d_update" },
    { name: "back_d_doc_date" },
    { name: "back_c_comment" },
    { name: "d_receive_date" },
    { name: "c_receive_comment" },
    { name: "i_close_receive" },
    { name: "c_comment_status" },
    { name: "c_comment_status" },
    { name: "d_status_date_last" },
    { name: "i_protest" },
  ],
});

// storeYear
var years = [];
var years2 = [];
var currentTime = new Date();
var now = currentTime.getFullYear() + 1;
var yy_en = Ext.START_YEAR_ACC - 4;
years2.push({ id: "0", c_name: "- เลือกทั้งหมด -" });
while (yy_en <= now) {
  years2.push({ id: yy_en, c_name: yy_en + 543 });
  years.push({ id: yy_en, c_name: yy_en + 543 });
  yy_en++;
}

store_year = new Ext.data.JsonStore({
  fields: ["id", "c_name"],
  data: years,
});

Ext.store_year = new Ext.data.JsonStore({
  fields: ["id", "c_name"],
  data: years,
});

Ext.store_year_all = new Ext.data.JsonStore({
  fields: ["id", "c_name"],
  data: years2,
});
