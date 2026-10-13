Ext.store = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/List_creditorCut.php",
  baseParams: { type: "po_working_cheque", i_cheque: "1", i_read: user_right_read }, // Permission i_read
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [
    { name: "id" },
    { name: "d_doc_date" },
    { name: "c_approve" },
    { name: "budget_name" },
    { name: "c_expense_group" },
    { name: "c_expense" },
    { name: "c_creditor" },
    { name: "c_cheque" },
    { name: "f_total" },
    { name: "d_pay_date" },
    { name: "i_status" },
    { name: "i_expire" },
    { name: "c_comment" }
  ]
});

Ext.dc_expense_budget_type_all = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/All_poWorking.php",
  baseParams: { type: "dc_expense_budget_type", all: "all" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
  listeners: {
    load: function(t, records, options) {
      Ext.getCmp("dc_expense_budget_type_id").setValue("0");
    }
  }
});

Ext.expire = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/All_poWorking.php",
  baseParams: { type: "expire", all: "all" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
  listeners: {
    load: function(t, records, options) {
      Ext.getCmp("s_i_expire").setValue("0");
    }
  }
});
