Ext.store = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/List_GlReverseItem.php",
  baseParams: { type: "gl_tran_hdr", i_read: user_right_read }, // Permission i_read
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [
    {
      name: "no"
    },
    { name: "id" },
    { name: "c_ref_doc" },
    { name: "d_save_date" },
    { name: "d_doc_date" },
    { name: "c_code" },
    { name: "c_code_post" },
    { name: "c_comment1" },
    { name: "f_total_amt" },
    { name: "dc_user_update_id" },
    { name: "dc_user_update_cost_id" },
    { name: "d_update" },
    { name: "i_is_reversing" },
    { name: "i_parent" },
    { name: "i_type_reverse_show" }, 
    { name: "c_type_reverse" }    
  ]
});

// let storeDtlRecord = Ext.data.Record.create([{ name: "no" }, { name: "id" }, { name: "c_code_ref" }, { name: "po_expense_id" }, { name: "f_total" }, { name: "f_cancel" }, { name: "c_comment" }]);

// Ext.storeDtl = new Ext.data.JsonStore({
//   autoDestroy: false,
//   autoLoad: false,
//   url: "api/List_poBudgetHdrOverlap.php",
//   baseParams: { type: "po_budget_dtl_overlap" },
//   root: "data",
//   idProperty: "id",
//   totalProperty: "totalCount",
//   fields: storeDtlRecord
// });

// Ext.dc_expense_budget_type = new Ext.data.JsonStore({
//   autoDestroy: false,
//   autoLoad: false,
//   url: "api/All_poBudgetHdr.php",
//   baseParams: { type: "dc_expense_budget_type" },
//   root: "data",
//   idProperty: "id",
//   fields: ["id", "c_name"]
// });

// Ext.po_expense = new Ext.data.JsonStore({
//   autoDestroy: false,
//   autoLoad: false,
//   url: "api/All_poBudgetHdr.php",
//   baseParams: { type: "po_expense" },
//   root: "data",
//   idProperty: "id",
//   fields: ["id", "c_name", "c_group_name"]
// });

// // storeYear
// let years = [];
// let currentTime = new Date();
// let now = currentTime.getFullYear() + 2;
// let id = currentTime.getFullYear() - 2;
// while (id <= now) {
//   let c_name = id + 543;
//   years.push({ id, c_name });
//   id++;
// }

// Ext.store_year = new Ext.data.JsonStore({
//   fields: ["id", "c_name"],
//   data: years
// });
