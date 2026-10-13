Ext.store = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/List_poChequeCancel.php",
  baseParams: { type: "po_working_hdr", i_read: user_right_read }, // Permission i_read
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [{ name: "no" }, { name: "id" }, { name: "c_code" }, { name: "c_approve" }, { name: "d_approve_date" }, { name: "cost_name" }, { name: "budget_name" }, { name: "po_expense_name" }, { name: "creditor_name" }, { name: "f_total" }]
});

Ext.storeCheque = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_poChequeCancel.php",
  baseParams: { type: "po_working_cheque" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [{ name: "no" }, { name: "id" }, { name: "i_type" }, { name: "c_creditor" }, { name: "c_cheque" }, { name: "f_total" }, { name: "c_comment" }, { name: "i_status" }, { name: "i_cheque" }]
});

Ext.dc_expense_budget_type = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorking.php",
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
