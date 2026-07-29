// Ext.part_file_pdf = "http://" + location.host + "/pdf_po/";

let Date_now = new Date();
Date_now = Date_now.toISOString().split("T")[0].split("-");
Ext.bgYear = Date_now[0] - 0 + ((Date_now[1] < 10 ? 0 : 1) - 0);

Ext.store = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "tor/api/List_SpAdminEdit.php",
  baseParams: { type: "po_working_dtl1", i_read: user_right_read, i_budget_year: Ext.bgYear }, // Permission i_read
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [
    { name: "no" },
    { name: "id" },
    { name: "c_name" },
    { name: "dc_department_name" },
    { name: "dc_department_id" },
    { name: "i_enable" },
    { name: "i_enabled" },

    { name: "po_expense_pr" },
    { name: "sp_emp_pr" },
    { name: "sp_emp_po" },
    { name: "dc_expense_budget_type_pr" },
    { name: "dc_expense_budget_type_po" },
    { name: "sp_tor_contract_id" },
    { name: "c_code" },
    { name: "c_code_po" },
    { name: "i_is_upload" },
    { name: "c_name_status" },
    { name: "c_type_name" },
    { name: "d_doc_th" },
    { name: "d_due_th" },
    { name: "i_type_bg" },
    { name: "dc_expense_budget_type_id" },
    { name: "po_expense_id" },
    { name: "c_yyyy" },
    { name: "i_yyyy" },
    { name: "c_pr_year" },
    { name: "i_pr_year" },
    { name: "dc_cost_id" },
    { name: "dc_cost2_id" },
    { name: "dc_creditor_id" },
    { name: "dc_creditor_bidder_hdr" },
    { name: "dc_creditor_bidder_dtl" },
    { name: "dc_creditor_victory" },
    { name: "sp_tor_dtl_id" },
    { name: "dc_bg_budget_type_id" },
    { name: "dc_expense_budget_type_id" },
    { name: "dc_expense_budget_type2_id" },
    { name: "dc_expense_budget_type3_id" },
    { name: "f_total_dtl" },
    { name: "po_expense_dtl_id" },
    { name: "dc_creditor_victory" },
    { name: "f_total" },
    { name: "sp_emp_id" },
    { name: "sp_emp_po_id" },
    { name: "i_purchase" },
    { name: "tor_type_id" },

    { name: "bg_reserve_money_pr1" },
    { name: "bg_reserve_money_pr2" },
    { name: "bg_reserve_money_pr3" },

    { name: "f_amt_pr1" },
    { name: "f_amt_pr2" },
    { name: "f_amt_pr3" },

    { name: "bg_expense_id_pr" },
    { name: "bg_expense_id2_pr" },
    { name: "bg_expense_id3_pr" },

    { name: "dc_expense_budget_type_id" },
    { name: "dc_expense_budget_type2_id" },
    { name: "dc_expense_budget_type3_id" },

    { name: "bg_reserve_money_po1" },
    { name: "bg_reserve_money_po2" },
    { name: "bg_reserve_money_po3" },

    { name: "bg_expense_id_po" },
    { name: "bg_expense_id2_po" },
    { name: "bg_expense_id3_po" },

    { name: "dc_expense_budget_type_id_po" },
    { name: "dc_expense_budget_type2_id_po" },
    { name: "dc_expense_budget_type3_id_po" },

    { name: "bg_reserve_money_i_reserve1" },
    { name: "bg_reserve_money_i_reserve2" },
    { name: "bg_reserve_money_i_reserve3" },
    { name: "dc_budget_type_bg_id" },
    { name: "bg_expense_bg_id" },
    { name: "f_amt_reserve1" },
    { name: "f_amt_reserve2" },

    { name: "i_pr_type_reserve1" },
    { name: "i_pr_type_reserve2" },
    { name: "dc_budget_type_bg_id2" },
    { name: "bg_expense_bg_id2" },
    { name: "d_create_reserve1" },
    { name: "d_create_reserve2" },
    { name: "i_year_reserve1" },
    { name: "i_year_reserve2" },
    { name: "d_doc_date" },
    { name: "d_due_date" },
    { name: "d_start_date" },
    { name: "i_delivery" },
    { name: "d_doc_ref_pr" },
    { name: "tor_status_id" },
    { name: "sp_mn_contract_hdr_id" },
    { name: "sp_emp_mn" },
    { name: "sp_emp_mn_id" },
  ],
});
Ext.torType = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/All_spAlert.php",
  baseParams: { type: "sp_type_status", i_is_type_tor: true },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});
let storeDtlRecord = Ext.data.Record.create([
  { name: "no" },
  { name: "id" },
  { name: "c_code" },
  { name: "c_arrive_code" },
  { name: "c_overlap" },
  { name: "c_billing_code" },
  { name: "d_doc_arrive_dt" },
  { name: "i_enabled" },
  { name: "sp_check_period_hdr_id" },
  { name: "sp_check_period_dtl_id" },
  { name: "sp_tor_dtl_period_id" },
  // { name: "d_update" },
  // { name: "dc_user_update_cost_id" },
]);

Ext.storeDtl = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "tor/api/List_SpAdminEdit.php",
  baseParams: { type: "po_period" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: storeDtlRecord,
});
Ext.table_update = new Ext.data.SimpleStore({
  // autoLoad: true,
  // url: "api/All_RepBudgetControl.php",
  baseParams: { show: "all" },
  // root: "data",
  data: [
    ["all", "all"],
    ["sp_tor_id", "sp_tor_id"],
    ["sp_tor_dtl_id", "sp_tor_dtl_id"],
    ["sp_tor_bidder_hdr_id", "sp_tor_bidder_hdr_id"],
    ["sp_tor_bidder_dtl_id", "sp_tor_bidder_dtl_id"],
    ["sp_tor_victory", "sp_tor_victory"],
    ["bg_reserve_money_pr_id", "bg_reserve_money_pr_id"],
    ["bg_reserve_money_po_id", "bg_reserve_money_po_id"],
  ],
  idProperty: "id",
  // fields: ["id", "c_name"],
  fields: ["id", "c_name"],
});
Ext.dc_expense_budget_type_all = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: { type: "dc_expense_budget_type", all: "all" },
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
  autoLoad: true,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: {
    type: "dc_expense_budget_type",
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});

Ext.bg_expense = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: {
    type: "po_expense",
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});

Ext.dc_cost = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: {
    type: "dc_cost",
  },

  root: "data",
  idProperty: "id",
  fields: ["id", "c_code", "c_name"],
});

Ext.dc_cost_all = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: { type: "dc_cost", all: "all" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
  // listeners: {
  //   load: function (t, records, options) {
  //     Ext.getCmp("s_dc_cost_id").setValue("0");
  //   },
  // },
});

Ext.dc_creditor = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: {
    type: "dc_creditor", // dc_creditor_id
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_code", "c_name"],
});

Ext.sp_emp = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: {
    type: "sp_emp",
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_code", "c_name"],
});
Ext.dc_department = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: {
    type: "dc_department",
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});
Ext.tor_status_id = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: {
    type: "tor_status_id",
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_code_name", "c_name"],
});

Ext.po_expense = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: {
    type: "po_expense",
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});

// Ext.dc_approve = new Ext.data.JsonStore({
//   autoDestroy: false,
//   autoLoad: false,
//   url: "api/All_poWorkingAdvancedEdit.php",
//   baseParams: { type: "dc_approve" },
//   root: "data",
//   idProperty: "id",
//   fields: ["id", "c_name"],
// });

Ext.bg_budget_overlap = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorkingAdvancedEdit.php",
  baseParams: { type: "bg_budget_overlap" },
  root: "data",
  idProperty: "id",
  fields: [
    { name: "bg_budget_dtl_overlap_id" },
    { name: "i_year" },
    { name: "c_code_ref" },
    { name: "dc_expense_budget_type_id" },
    { name: "dc_expense_budget_type_name" },
    { name: "bg_expense_id" },
    { name: "bg_expense_name" },
    { name: "dc_cost_id" },
    { name: "dc_cost_name" },
    { name: "c_creditor" },
    { name: "i_extend_time" },
    { name: "dc_user_create_id" },
    { name: "dc_user_create_cost_id" },
    { name: "d_create" },
    { name: "d_end_date" },
    { name: "f_overlap" },
    { name: "f_cancel" },
    { name: "f_reserve" },
    { name: "f_working" },
    { name: "f_total" },
  ],
});

Ext.bg_reserve_money = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorkingAdvancedEdit.php",
  baseParams: { type: "bg_reserve_money" },
  root: "data",
  idProperty: "id",
  fields: [
    { name: "pr_id" },
    { name: "po_id" },
    { name: "chk_id" },
    { name: "i_sys" },
    { name: "sys_name" },
    { name: "dc_cost_id" },
    { name: "dc_cost_name" },
    { name: "dc_expense_budget_type_id" },
    { name: "dc_expense_budget_type_name" },
    { name: "bg_expense_id" },
    { name: "bg_expense_name" },
    { name: "f_amt" },
  ],
});

Ext.creditor_taxdata = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "tor/api/List_SpAdminEdit.php",
  baseParams: { type: "po_working_dtl" },
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

// storeYear
let years = [];
years.push({ id: "0", c_name: "- เลือกทั้งหมด -" });

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
  data: years,
});
