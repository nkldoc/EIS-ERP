Ext.store = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/List_poWorking.php",
  baseParams: {
    type: "po_working_hdr",
    i_status: Ext.I_STATUS,
    i_status_before: Ext.I_STATUS_BEFORE,
    i_read: user_right_read
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
    { name: "po_expense_id" },
    { name: "c_booking" },
    { name: "cost_name" },
    { name: "budget_name" },
    { name: "po_expense_name" },
    { name: "creditor_name" },
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
    { name: "i_protest" }
  ]
});

Ext.storeSign = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_poSign3.php",
  baseParams: {
    type: "po_working_cheque",
    i_status: Ext.I_STATUS,
    i_status_before: Ext.I_STATUS_BEFORE,
    i_read: user_right_read
  }, // Permission i_read
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [
    { name: "no" },
    { name: "id" },
    { name: "po_working_hdr_id" },
    { name: "i_type" },
    { name: "budget_name" },
    { name: "c_code" },
    { name: "c_approve" },
    { name: "d_doc_date" },
    { name: "expense_name" },
    { name: "c_creditor" },
    { name: "f_total" },
    { name: "c_cheque" },
    { name: "i_success" }
  ]
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
