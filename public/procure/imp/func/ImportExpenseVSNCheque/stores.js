if (typeMenu == "EP") {
  type_List = "imp_expense";
  itype_exp = Ext.DC_EXP_BG_ITYPE_EPHYS;
  fieldsHdr = [
    { name: "no" },
    { name: "id" },
    { name: "c_code" },
    { name: "c_gx_code" },
    { name: "i_post" },
    { name: "c_expense_period_no" },
    { name: "c_doc" },
    { name: "dc_expense_budget_type_id" },
    { name: "dc_expense_budget_type_name" },
    { name: "dc_bank_acc_company_id_source" },
    { name: "dc_bank_acc_company_id_target" },
    { name: "d_doc_date" },
    { name: "i_enable" },
    { name: "c_comment" },
    { name: "show_enable" },
    { name: "dc_user_create_id" },
    { name: "dc_user_create_cost_id" },
    { name: "d_create" },
    { name: "dc_user_update_id" },
    { name: "dc_user_update_cost_id" },
    { name: "d_update" }
  ];
} else {
  type_List = "imp_expense_vsn";
  itype_exp = Ext.DC_EXP_BG_ITYPE_VISIONNET;
  fieldsHdr = [
    { name: "no" },
    { name: "id" },
    { name: "c_code" },
    { name: "c_gx_code" },
    { name: "i_post" },
    { name: "c_expense_vsn_period_no" },
    { name: "c_doc" },
    { name: "dc_expense_budget_type_id" },
    { name: "dc_expense_budget_type_name" },
    { name: "dc_bank_acc_company_id_source" },
    { name: "dc_bank_acc_company_id_target" },
    { name: "d_doc_date" },
    { name: "i_enable" },
    { name: "c_comment" },
    { name: "show_enable" },
    { name: "dc_user_create_id" },
    { name: "dc_user_create_cost_id" },
    { name: "d_create" },
    { name: "dc_user_update_id" },
    { name: "dc_user_update_cost_id" },
    { name: "d_update" }
  ];
}

Ext.store = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/List_ImportExpenseCheque.php",
  baseParams: { type: type_List + "_hdr", i_read: user_right_read }, // Permission i_read
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: fieldsHdr
});

let storeDtlRecord = Ext.data.Record.create([{ name: "no" }, { name: "id" }, { name: "dc_cheque_id" }, { name: "d_cheque" }, { name: "f_cheque" }]);
Ext.storeCheque = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_ImportExpenseCheque.php",
  baseParams: { type: "cheque", table: type_List },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: storeDtlRecord
});

Ext.dc_expense_budget_type = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_ImportExpenseVSN.php",
  baseParams: { type: "dc_expense_budget_type", itype: itype_exp },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"]
});

Ext.dc_expense_budget_type_all = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_ImportExpenseVSN.php",
  baseParams: { type: "dc_expense_budget_type", itype: itype_exp, all: "all" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
  listeners: {
    load: function(t, records, options) {
      Ext.getCmp("s_dc_expense_budget_type_id").setValue("0");
    }
  }
});

Ext.vw_dc_bank_acc_company_full = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_ImportExpenseVSN.php",
  baseParams: { type: "vw_dc_bank_acc_company_full" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"]
});

Ext.dc_cheque = new Ext.data.JsonStore({
  autoLoad: false,
  chkMask: false, // status: loading
  url: "api/All_ImportExpenseCheque.php",
  baseParams: { type: "dc_cheque" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [{ name: "id" }, { name: "c_name" }]
});
