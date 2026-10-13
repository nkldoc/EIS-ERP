Ext.store = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/List_poWorkingAdvanced.php",
  baseParams: { type: "po_working_hdr", i_read: user_right_read }, // Permission i_read
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [
    { name: "no" },
    { name: "id" },
    { name: "c_code_ref" },
    { name: "c_approve" },
    { name: "d_approve_date" },
    { name: "i_budget_year" },
    { name: "i_budget_year_overlap" },
    { name: "dc_cost_id" },
    { name: "cost_name" },
    { name: "dc_expense_budget_type_id" },
    { name: "budget_name" },
    { name: "bg_expense_id" },
    { name: "bg_expense_name" },
    { name: "po_creditor_id" },
    { name: "creditor_name" },
    { name: "po_creditor_transfer_id" },
    { name: "c_qty" },
    { name: "f_total" },
    { name: "d_audit_date" },
    { name: "po_emp_id" },
    { name: "d_doc_date" },
    { name: "dc_approve_id" },
    { name: "d_inv_date" },
    { name: "c_booking" },
    { name: "c_comment" },
    { name: "i_enable" },
    { name: "dc_user_update_id" },
    { name: "dc_user_update_cost_id" },
    { name: "d_update" },
  ],
});

let storeDtlRecord = Ext.data.Record.create([{ name: "no" }, { name: "id" }, { name: "i_status" }, { name: "c_status" }, { name: "d_doc_date" }, { name: "d_receive_date" }, { name: "c_comment" }, { name: "dc_user_update_id" }, { name: "d_update" }, { name: "dc_user_update_cost_id" }]);

Ext.storeDtl = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_poWorkingAdvanced.php",
  baseParams: { type: "po_working_item" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: storeDtlRecord,
});

Ext.dc_expense_budget_type_all = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorkingAdvanced.php",
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
  autoLoad: false,
  url: "api/All_poWorkingAdvanced.php",
  baseParams: { type: "dc_expense_budget_type" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});

Ext.bg_expense = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorkingAdvanced.php",
  baseParams: { type: "bg_expense" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});

Ext.dc_cost = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorkingAdvanced.php",
  baseParams: { type: "dc_cost" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});

Ext.po_creditor = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorkingAdvanced.php",
  baseParams: { type: "po_creditor" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});

Ext.po_emp = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorkingAdvanced.php",
  baseParams: { type: "po_emp" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});

Ext.dc_approve = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorkingAdvanced.php",
  baseParams: { type: "dc_approve" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
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
  data: years,
});
