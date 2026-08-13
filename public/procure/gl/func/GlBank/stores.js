Ext.store = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/List_GlBank.php",
  baseParams: { type: "gl_bank", ITYPE_CHEQUE: ITYPE_CHEQUE, CANCEL_GL: CANCEL_GL, i_read: user_right_read }, //Permission i_read
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [
    { name: "no" },
    { name: "id" },
    { name: "gl_tran_hdr_id" },
    { name: "gl_tran_hdr_id_bank_id" },
    { name: "c_code" },
    { name: "c_code_gx" },
    { name: "c_code_gx_bank" },
    { name: "c_code_gl" },
    { name: "c_code_gl_bank" },
    { name: "i_is_post" },
    { name: "i_is_post_bank" },
    { name: "i_enable_gx" },
    { name: "i_enable_gx_bank" },
    { name: "c_doc" },
    { name: "c_doc_bank" },
    { name: "gl_dc_book_type_id_bank_id" },
    { name: "gl_dc_book_type_id" },
    { name: "dc_bank_acc_company_id_target" },
    { name: "dc_bank_acc_company_id_target_name" },
    { name: "dc_bank_acc_company_id_source" },
    { name: "dc_bank_acc_company_id_source_name" },
    { name: "dc_bank_acc_company_id_source2" },
    { name: "dc_bank_acc_company_id_source2_name" },
    { name: "dc_acc_id" },
    { name: "dc_acc_code" },
    { name: "dc_acc_name" },
    { name: "d_doc_date" },
    { name: "d_save_jv_date" },
    { name: "f_money" },
    { name: "i_enable" },
    { name: "c_comment" },
    { name: "show_enable" },
    { name: "i_type_jv" },
    { name: "i_return" },
    { name: "i_status" },
    { name: "gl_tran_hdr_bank_id_cancel" },
    { name: "gl_tran_hdr_id_cancel" },
    { name: "c_code_bank_cancel" },
    { name: "c_code_cancel" },
    { name: "i_type_year" },
    { name: "c_budget_year" },
    { name: "dc_expense_budget_type_id" },
    { name: "dc_expense_budget_type_name" },
    { name: "dc_user_create" },
    { name: "dc_user_create_cost" },
    { name: "d_create" },
    { name: "dc_user_update" },
    { name: "dc_user_update_cost" },
    { name: "d_update" }
  ]
});

Ext.gl_bank_cheque_cancel = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_GlBank.php",
  baseParams: { type: "gl_bank_cheque_cancel", i_read: user_right_read }, // Permission i_read
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [{ name: "no" }, { name: "id" }, { name: "c_name" }, { name: "d_cheque" }, { name: "f_cheque" }]
});

let storeDtlRecord = Ext.data.Record.create([{ name: "no" }, { name: "id" }, { name: "dc_cheque_id" }, { name: "d_cheque" }, { name: "f_cheque" }]);
Ext.storeDtl = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_GlBank.php",
  baseParams: { type: "gl_bank_cheque" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: storeDtlRecord
});

Ext.dc_cheque = new Ext.data.JsonStore({
  autoLoad: false,
  chkMask: false,
  url: "api/All_GlBank.php",
  baseParams: { type: "dc_cheque" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [{ name: "id" }, { name: "c_name" }]
});

Ext.dc_acc = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_GlBank.php",
  baseParams: { type: "dc_acc" },
  root: "data",
  idProperty: "id",
  fields: ["id", "i_group", "c_name"]
});

Ext.gl_dc_book_type = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_GlBank.php",
  baseParams: { type: "gl_dc_book_type" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"]
});

Ext.dc_bank_acc_company = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_GlBank.php",
  baseParams: { type: "dc_bank_acc_company" },
  root: "data",
  idProperty: "id",
  fields: [{ name: "no" }, { name: "id" }, { name: "c_bank_name" }, { name: "c_branch_name" }, { name: "c_code" }, { name: "c_name" }, { name: "c_type_name" }, { name: "c_code_acc" }, { name: "c_name_acc" }]
});

Ext.vw_dc_user = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_GlBank.php",
  baseParams: { type: "vw_dc_user", all: "all" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
  listeners: {
    load: function(t, records, options) {
      Ext.getCmp("dc_user_id").setValue("0");
    }
  }
});

Ext.dc_expense_budget_type = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_GlBank.php",
  baseParams: { type: "dc_expense_budget_type" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"]
});

Ext.dc_expense_budget_type_all = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_GlBank.php",
  baseParams: { type: "dc_expense_budget_type", all: "all" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
  listeners: {
    load: function(t, records, options) {
      Ext.getCmp("s_dc_expense_budget_type_id").setValue("0");
    }
  }
});

// storeYear
let years = [];
let currentTime = new Date();
let now = currentTime.getFullYear() + 2;
let id = currentTime.getFullYear() - 2;
while (id <= now) {
  let c_name = id + 543;
  years.push({ id, c_name });
  id++;
}

Ext.store_year = new Ext.data.JsonStore({
  fields: ["id", "c_name"],
  data: years
});
