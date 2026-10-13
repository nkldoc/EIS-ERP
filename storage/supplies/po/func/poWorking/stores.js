Ext.part_file_pdf = "http://"+location.host+"/pdf_po/";
Ext.store = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/List_poWorking.php",
  baseParams: {
    type: "po_working_hdr",
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
    { name: "bg_budget_dtl_overlap_id" },
    { name: "c_booking" },
    { name: "dc_cost_id" },
    { name: "cost_name" },
    { name: "dc_expense_budget_type_id" },
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
    { name: "d_status_date_last" },
    { name: "i_protest" },
    { name: "i_is_url_pdf_hdr" },
    { name: "i_is_url_pdf_dtl" },
    { name: "pdf_hdr" },
    { name: "pdf_dtl" },
  ],
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

Ext.dc_expense_budget_type = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorking.php",
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
  url: "api/All_poWorking.php",
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
  url: "api/All_poWorking.php",
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
var yy_en = Ext.START_YEAR_ACC;
years2.push({ id: "0", c_name: "- เลือกทั้งหมด -" });
while (yy_en <= now) {
  years2.push({ id: yy_en, c_name: yy_en + 543 });
  years.push({ id: yy_en, c_name: yy_en + 543 });
  yy_en++;
}

store_year = new Ext.data.JsonStore({
  fields: ["id", "c_name"],
  data: years
});


Ext.store_year_all = new Ext.data.JsonStore({
  fields: ["id", "c_name"],
  data: years2,
});