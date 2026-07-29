Ext.store = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/List_CmReceive.php",
  baseParams: { type: "cm_income_hdr", I_TYPE_MENU: Ext.I_REC_MENU_TYPE, str_cost_enable: Ext.SESSION_STR_COST_SHOW }, // Permission i_read
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [
    { name: "no" },
    { name: "id" },
    { name: "c_code" },
    { name: "c_doc" },
    { name: "dc_expense_budget_type_dtl_name" },
    { name: "dc_bank_acc_company_id" },
    { name: "c_bank_acc_full" },
    { name: "dc_acc_id" },
    { name: "c_acc_full" },
    { name: "cm_receive_type_id" },
    { name: "c_receive_type_name" },
    { name: "d_import_date" },
    { name: "c_mm" },
    { name: "c_yyyy" },
    { name: "c_yyyy_mm" },
    { name: "dc_cost_id" },
    { name: "c_cost_name" },
    { name: "i_type_income" },
    { name: "c_comment" },
    { name: "i_enable" },
    { name: "show_enable" },
    { name: "dc_user_create_id" },
    { name: "dc_user_create_cost_id" },
    { name: "d_create" },
    { name: "dc_user_update_id" },
    { name: "dc_user_update_cost_id" },
    { name: "d_update" },
    { name: "top_gx_id" },
    { name: "top1_gx_id" },
    { name: "c_is_gen_code" },
    { name: "gl_dc_config_id" },
    { name: "f_sum_dtl_dr" },
    { name: "f_sum_dtl_cr" },
  ],
});

Ext.storeDtl = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_CmReceive.php",
  baseParams: { type: "cm_income_dtl" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [
    { name: "no" },
    { name: "id" },
    { name: "cm_income_hdr_id" },
    { name: "d_receive" },
    { name: "dc_bank_acc_company_hdr_id" },
    { name: "d_receive_show" },
    { name: "c_receive_no" },
    { name: "c_receive_ref" },
    { name: "dc_creditor_id" },
    { name: "c_creditor" },
    { name: "dc_acc_id" },
    { name: "c_acc_full" },
    { name: "dc_acc_id_dr" },
    { name: "c_acc_dr_full" },
    { name: "c_acc_code_mis" },
    { name: "c_acc_name_mis" },
    { name: "f_dr" },
    { name: "f_cr" },
    { name: "c_receive_detail" },
    { name: "i_status" },
    { name: "c_status" },
    { name: "d_statement" },
    { name: "c_statement_detail" },
    { name: "gl_tran_hdr_id" },
    { name: "c_mm_receive" },
    { name: "c_yyyy_receive" },
    { name: "c_yyyy_mm_receive" },
    { name: "cm_income_dtl_id_duplicate" },
    { name: "i_type_year" },
    { name: "c_budget_year" },
    { name: "dc_expense_budget_type_id" },
    { name: "dc_expense_budget_type" },
  ],
});

Ext.dc_expense_budget_type = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_CmReceive.php",
  baseParams: { type: "dc_expense_budget_type_by_user", itype: Ext.DC_EXP_BG_ITYPE_VISIONNET, dc_cost_ids: "" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});

Ext.dc_expense_budget_type_all = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_CmReceive.php",
  baseParams: { type: "dc_expense_budget_type_by_user_search", itype: Ext.DC_EXP_BG_ITYPE_VISIONNET, all: "all", str_cost_enable: Ext.SESSION_STR_COST_SHOW },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
  listeners: {
    load: function (t, records, options) {
      Ext.getCmp("s_dc_expense_budget_type_id").setValue("0");
    },
  },
});

Ext.vw_dc_bank_acc_company_full1 = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_CmReceive.php",
  baseParams: { type: "vw_dc_bank_acc_company_full", dc_bank_deposit_type_id: 1, str_cost_enable: Ext.SESSION_STR_COST_SHOW, dc_cost_id_for_bookbank: "", choose: "choose" }, // ออมทรัพย์
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});

Ext.dc_map_bookbank_acc = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_CmReceive.php",
  baseParams: { type: "dc_map_bookbank_acc", str_cost_enable: Ext.SESSION_STR_COST_SHOW, dc_bank_acc_hdr_id: "", dc_map_bookbank_status: Ext.CM_RECEIVE_TYPE, dc_expense_budget_type_ids: "" }, // ออมทรัพย์
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name", "dc_expense_budget_type_id"],
});

// Ext.vw_dc_bank_acc_company_full2 = new Ext.data.JsonStore({
//   autoDestroy: false,
//   autoLoad: false,
//   url: "api/All_CmReceive.php",
//   baseParams: { type: "vw_dc_bank_acc_company_full" , str_cost_enable:Ext.SESSION_STR_COST_SHOW,dc_cost_id_for_bookbank:"",choose:"choose"},
//   root: "data",
//   idProperty: "id",
//   fields: ["id", "c_name"]
// });

// Ext.dc_expense_group_vsn = new Ext.data.JsonStore({
//   autoDestroy: false,
//   autoLoad: false,
//   url: "api/All_CmReceive.php",
//   baseParams: { type: "dc_expense_group_vsn" },
//   root: "data",
//   idProperty: "id",
//   fields: ["id", "c_name"]
// });

// Ext.dc_expense_acc_vsn = new Ext.data.JsonStore({
//   autoDestroy: false,
//   autoLoad: false,
//   url: "api/All_CmReceive.php",
//   baseParams: { type: "dc_expense_acc_vsn" },
//   root: "data",
//   idProperty: "id",
//   fields: ["id", "c_name", "acc_code", "acc_name", "acc_code_overlap", "acc_name_overlap"]
// });

// Ext.dc_expense_acc_vsn_full = new Ext.data.JsonStore({
//   autoDestroy: false,
//   autoLoad: false,
//   url: "api/All_CmReceive.php",
//   baseParams: { type: "dc_expense_acc_vsn", full: "full" },
//   root: "data",
//   idProperty: "id",
//   fields: ["id", "c_name", "acc_code", "acc_name", "acc_code_overlap", "acc_name_overlap"]
// });

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

Ext.store_type_year = new Ext.data.JsonStore({
  fields: ["id", "c_name"],
  data: [
    { id: "1", c_name: "ปีงบประมาณ" },
    { id: "2", c_name: "เหลื่อมปี" },
  ],
});

Ext.store_cal_gl = new Ext.data.JsonStore({
  fields: ["id", "c_name"],
  data: [
    { id: "1", c_name: "เงินเดือนจ่ายพนักงาน" },
    { id: "2", c_name: "จ่ายให้บริษัท" },
  ],
});

Ext.dc_cost = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_CmReceive.php",
  baseParams: { type: "dc_cost", str_cost_enable: Ext.SESSION_STR_COST_SHOW },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});

Ext.store_search_dc_cost = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_CmReceive.php",
  baseParams: { type: "dc_cost", str_cost_enable: Ext.SESSION_STR_COST_SHOW },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});

// Ext.imp_request_ephis_dtl_gx = new Ext.data.JsonStore({
//   autoDestroy: false,
//   autoLoad: false,
//   url: "api/All_CmReceive.php",
//   baseParams: { type: "imp_request_ephis_dtl_gx",sub_type:"2"},
//   root: "data",
//   idProperty: "id",
//   fields: ["id", "c_name"]
// });

// Ext.imp_request_vsn_dtl_gx = new Ext.data.JsonStore({
//   autoDestroy: false,
//   autoLoad: false,
//   url: "api/All_CmReceive.php",
//   baseParams: { type: "imp_request_vsn_dtl_gx",sub_type:"2"},
//   root: "data",
//   idProperty: "id",
//   fields: ["id", "c_name"]
// });

// Ext.store_cm_pay_type = new Ext.data.JsonStore({
//   autoDestroy: false,
//   autoLoad: false,
//   url: "api/All_CmReceive.php",
//   baseParams: { type: "cm_pay_type"},
//   root: "data",
//   idProperty: "id",
//   fields: ["id", "c_name"]
// });

Ext.gl_dc_config_cash_tranf = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_CmReceive.php",
  baseParams: { type: "gl_dc_config_2type", i_config: Ext.GL_DC_CONFIG_ICONFIG, dc_cost_ids: "", all: "all" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});

Ext.store_cm_receive_type = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/All_CmReceive.php",
  baseParams: { type: "cm_receive_type", choose: "choose", i_type: Ext.CM_RECEIVE_TYPE },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});

Ext.store_month = new Ext.data.JsonStore({
  fields: ["id", "c_name"],
  data: [
    { id: "01", c_name: "มกราคม" },
    { id: "02", c_name: "กุมภาพันธ์" },
    { id: "03", c_name: "มีนาคม" },
    { id: "04", c_name: "เมษายน" },
    { id: "05", c_name: "พฤษภาคม" },
    { id: "06", c_name: "มิถุนายน" },
    { id: "07", c_name: "กรกฎาคม" },
    { id: "08", c_name: "สิงหาคม" },
    { id: "09", c_name: "กันยายน" },
    { id: "10", c_name: "ตุลาคม" },
    { id: "11", c_name: "พฤศจิกายน" },
    { id: "12", c_name: "ธันวาคม" },
  ],
});

Ext.store_dc_acc_with_gl_map_acc_receive_hdr = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/All_CmReceive.php",
  baseParams: { type: "dc_acc_with_gl_map_acc_receive_hdr" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});
