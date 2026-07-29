Ext.store = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/List_PoWorkingImpHdr.php",
  baseParams: { type: "po_working_imp_hdr", i_read: user_right_read }, // Permission i_read
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [
    { name: "no" },
    { name: "id" },
    { name: "c_code_ref" },
    { name: "c_name" },
    { name: "i_enable" },
    { name: "c_comment" },
    { name: "show_enable" },
    { name: "dc_user_create_id" },
    { name: "dc_user_create_cost_id" },
    { name: "d_create" },
    { name: "dc_user_update_id" },
    { name: "dc_user_update_cost_id" },
    { name: "d_update" }
  ]
});

Ext.storeDtl = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_PoWorkingImpHdr.php",
  baseParams: { type: "po_working_dtl" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [
    { name: "no" },
    { name: "id" },
    { name: "i_budget_year" },
    { name: "i_budget_year_overlap" },
    { name: "dc_cost_id" },
    { name: "dc_expense_budget_type_id" },
    { name: "bg_expense_id" },
    { name: "d_audit_date" },
    { name: "c_code" },
    { name: "d_doc_date" },
    { name: "d_inv_date" },
    { name: "c_cnt_name" },
    { name: "c_detail" },
    { name: "c_qty" },
    { name: "f_total" },
    { name: "po_emp_id" },
    { name: "po_audit_id" }
  ]
});

Ext.storeIS = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_PoWorkingImpHdr.php",
  baseParams: { type: "po_working_dtl", i_status: 1 },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [
    { name: "no" },
    { name: "id" },
    { name: "i_budget_year" },
    { name: "i_budget_year_overlap" },
    { name: "dc_cost_id" },
    { name: "dc_expense_budget_type_id" },
    { name: "bg_expense_id" },
    { name: "d_audit_date" },
    { name: "c_code" },
    { name: "d_doc_date" },
    { name: "d_inv_date" },
    { name: "c_cnt_name" },
    { name: "c_detail" },
    { name: "c_qty" },
    { name: "f_total" },
    { name: "po_emp_id" },
    { name: "po_audit_id" }
  ]
});

Ext.dc_cost = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: { type: "dc_cost" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_code", "c_name"]
});

Ext.dc_expense_budget_type = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: { type: "dc_expense_budget_type" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"]
});

Ext.bg_expense_group = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: { type: "bg_expense_group" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name", "c_name_excel"]
});

Ext.bg_expense = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: { type: "bg_expense" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name", "c_name_excel"]
});

Ext.po_user_permission = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: { type: "po_user_permission" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"]
});

Ext.po_emp = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: { type: "po_emp" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"]
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
