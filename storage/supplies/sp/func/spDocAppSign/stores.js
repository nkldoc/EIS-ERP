Ext.part_file_pdf = "http://" + location.host + "/pdf_po/";
let Date_now = new Date();
Date_now = [Date_now.getFullYear().toString(), (Date_now.getMonth() + 1).toString().padStart(2, "0"), Date_now.getDate().toString().padStart(2, "0")];
Ext.bgYear = Date_now[0] - 0 + ((Date_now[1] < 10 ? 0 : 1) - 0);

Ext.store =new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: false,
        url: "tor/api/List_ProcureApp.php",
        baseParams: {
            type: Ext.status_sigature_document,
            keyData: Ext.keyData,
            i_alarm: Ext.menu_i_alarm,
            i_pa: Ext.menu_i_day,
            i_edit: Ext.store_i_edit,
            tor_status_id: Ext.menu_id,
            i_enabled:Ext.store_enable 
        },
        root: "data",
        idProperty: "id",
        totalProperty: "totalCount",
        fields: [
            {
                name: "no",
            },
            {
                name: "id",
            },
            {
                name: "i_step",
            },
            {
                name: "f_type_amt",
            },
            {
                name: "sp_cate_id", type: "int"
            },
            {
                name: "contract_no",
            },
            {
                name: "index_receive",
            },
            {
                name: "bg_check_id",
                type: "int",
            },
            {
                name: "i_type_bg",
                type: "int",
            },
            {
                name: "i_bg_type",
                type: "int",
            },
            {
                name: "i_is_request",
                type: "int",
            },
            {
                name: "dc_emp_id",
            },
            {
                name: "i_receive",
            },
            {
                name: "txtsub_cost",
            },
            {
                name: "dc_emp_name",
            },
            {
                name: "DateAdd1",
            },
            {
                name: "DateAdd2",
            },
            {
                name: "d_tor_date_alert",
            },
            {
                name: "d_tor_date_alert",
            },
            {
                name: "d_tor_date_pa",
            },
            {
                name: "d_tor_date_pa",
            },
            {
                name: "i_forword",
            },
            {
                name: "i_backword",
            },
            {
                name: "c_codeStatus",
            },
            {
                name: "c_code",
            },
            {
                name: "sp_tor_delete",
            },
            {
                name: "tor_delete_comment",
            },
            {
                name: "c_nameStatus",
            },
            {
                name: "bg_budget_dtl_project_id",
            },
            {
                name: "c_budget_dtl_project",
            },
            {
                name: "c_name",
            },
            {
                name: "c_code_status",
            },
            {
                name: "txtdc_department_idID",
            },
            {
                name: "d_tor_status_date", //
            },
            {
                name: "c_name_status", // d_tor_status_date
            },
            {
                name: "c_tor_type",
            },
            {
                name: "tor_status_id",
            },
            {
                name: "tor_type_id",
            },
            {
                name: "c_purchase",
            },
            {
                name: "i_purchase",
            },
            {
                name: "d_tor_date", //
            },
            {
                name: "i_parent", //d_tor_date
            },
            {
                name: "i_is_more",
            },
            {
                name: "i_is_rename",
            },
            {
                name: "i_is_register",
            },
            {
                name: "i_is_parent",
            },
            {
                name: "i_type_fix_rate",
            },
            {
                name: "f_total_amt",
            },
            {
                name: "dc_cost_id",
            },
            {
                name: "dc_cost_idTxt",
            },
            {
                name: "dc_cost2_id",
            },
            {
                name: "dc_cost2_idTxt",
            },
            {
                name: "i_year",
            },
            {
                name: "i_yyyy",
            },
            {
                name: "dc_expense_budget_type_id",
            },
            {
                name: "c_file_pdf_hdr",
            },
            {
                name: "c_file_pdf_dtl",
            },
            {
                name: "i_is_url_pdf_dtl",
            },
            {
                name: "i_is_url_pdf_dtl",
            },
            {
                name: "c_year",
            },
            {
                name: "dc_department_id",
            },
            {
                name: "sp_emp_id",
            },
            {
                name: "c_department",
            },
            {
                name: "d_doc_ref",
            },
            {
                name: "po_expense_id",
            },
            {
                name: "dc_user_create_id",
            },
            {
                name: "dc_user_create_cost_id",
            },
            {
                name: "d_create",
            },
            {
                name: "dc_user_update_id",
            },
            {
                name: "dc_user_update_cost_id",
            },
            {
                name: "d_update",
            },
            {
                name: "d_egp_date",
            },
            {
                name: "i_enabled",
            },
            {
                name: "c_comment",
            },
            {
                name: "c_comment_status",
            },
            {
                name: "c_remake",
            },
            {
                name: "po_creditor_id",
            },
            {
                name: "po_creditor_idTxt",
            },
            {
                name: "start_date",
            },
            {
                name: "end_date",
            },
            {
                name: "i_hire_type",
            },
            {
                name: "i_is_inv",
            },
            {
                name: "i_type_fix_rate",
            },
            {
                name: "i_product_type",
            },
            {
                name: "i_type_contract",
            },
            {
                name: "i_delivery_date",
            },
            {
                name: "sp_type_bg",
            },
            {name: "sp_contract_year"},
        ],
    }); 
// storeYear
var years = [];
var currentTime = new Date();
var now = currentTime.getFullYear() + 4;
var id = 2020;
while (id <= now) {
  var c_name = id + 543;
  years.push({
    id,
    c_name,
  });
  id++;
}

Ext.store_year = new Ext.data.JsonStore({
  fields: ["id", "c_name"],
  data: years,
});

Ext.po_working_begin = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_poReg.php",
  baseParams: {
    type: "po_working_begin",
  },
  root: "data",
  idProperty: "id",
  fields: [
    { name: "no" },
    { name: "id" },
    { name: "i_sys" },
    { name: "pr_id" },
    { name: "po_id" },
    { name: "per_id" },
    { name: "c_title" },
    { name: "c_detail" },
    { name: "dc_cost_id" },
    { name: "dc_creditor_id" },
    { name: "dc_creditor_transfer_id" },
    { name: "dc_creditor_name" },
    { name: "c_code_per" },
    { name: "c_booking" },
    { name: "c_code_ref" },
    { name: "d_chk_last_date" },
    { name: "d_doc_date" },
    { name: "d_audit_date" },
    { name: "f_per_inv" },
    { name: "f_per_vat_rate" },
    { name: "f_per_vat" },
    { name: "f_per_inv_vat" },
    { name: "f_total" },
    { name: "f_per_tax_personal_rate" },
    { name: "f_per_tax_personal" },
    { name: "f_per_fine" },
    { name: "f_per_warranty" },
    { name: "f_per_other" },
    { name: "f_per_total" },
    { name: "i_enable" },
    { name: "i_delete" },
    { name: "dc_user_send_id" },
    { name: "po_emp_id" },
    { name: "dc_user_create_id" },
    { name: "dc_user_create_cost_id" },
    { name: "d_create" },
    { name: "dc_user_update_id" },
    { name: "dc_user_update_cost_id" },
    { name: "d_update" },
    { name: "c_code_invoice" },
    { name: "bg_reserve_money_id" },
    { name: "i_budget_year" },
    { name: "i_budget_year_overlap" },
    { name: "d_chk_date" },
    { name: "dc_expense_budget_type_id" },
    { name: "bg_expense_id" },
    { name: "c_qty" },
    { name: "f_inv_vat" },
    { name: "f_fine" },
    { name: "f_warranty" },
    { name: "f_other" },
  ],
});

let po_working_begin_item_Record = Ext.data.Record.create([{ name: "no" }, { name: "id" }, { name: "dc_acc_id" }, { name: "c_month" }, { name: "dc_acc_name" }, { name: "f_inv" }, { name: "f_vat" }, { name: "f_inv_vat" }]);

Ext.po_working_begin_item = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_poReg.php",
  baseParams: {
    type: "po_working_begin_item",
  },
  root: "data",
  idProperty: "id",
  fields: po_working_begin_item_Record,
});

Ext.bg_budget_overlap_data = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorking.php",
  baseParams: { type: "bg_budget_overlap_data" },
  root: "data",
  idProperty: "id",
  fields: [
    { name: "bg_budget_dtl_overlap_id" },
    { name: "i_year" },
    { name: "c_code_ref" },
    { name: "dc_expense_budget_type_id" },
    { name: "dc_expense_budget_type_name" },
    { name: "bg_expense_id" },
    { name: "bg_expense_name" },
    { name: "dc_cost_id" },
    { name: "dc_cost_name" },
    { name: "c_creditor" },
    { name: "i_extend_time" },
    { name: "dc_user_create_id" },
    { name: "dc_user_create_cost_id" },
    { name: "d_create" },
    { name: "d_end_date" },
    { name: "f_overlap" },
    { name: "f_cancel" },
    { name: "f_reserve" },
    { name: "f_working" },
    { name: "f_total" },
    { name: "f_total_no_reserve" },
  ],
});

Ext.f_income_total = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_poReg.php",
  baseParams: { type: "f_income_total" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [{ name: "f_income_total" }],
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

Ext.dc_creditor = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: {
    type: "dc_creditor",
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_code", "c_name"],
});

Ext.dc_user_executive = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: {
    type: "dc_user_executive",
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name", "i_main"],
});

Ext.dc_user_approve = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: {
    type: "dc_user_approve",
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});

Ext.dc_title = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorking.php",
  baseParams: {
    type: "dc_title",
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});

Ext.dc_acc = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: {
    type: "dc_acc",
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_code", "c_name"],
});

Ext.dc_position = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: { type: "dc_position" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});

Ext.po_creditor = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: {
    type: "po_creditor",
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_code", "c_name"],
});
 
Ext.po_emp = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: {
    type: "po_emp",
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_code", "c_name"],
});
 
Ext.sp_sbill = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorking.php",
  baseParams: { type: "sp_sbill_pop" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: ["no", "id", "c_contract_code", "count", "f_sum"],
});

Ext.sp_sbill_pop_item = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorking.php",
  baseParams: { type: "sp_sbill_pop_item" },
  root: "data",
  // idProperty: "id",
  totalProperty: "totalCount",
  fields: ["no", "sp_sbill_hdr_id", "c_doc_result_ref", "c_doc_ref", "d_doc_date", "f_period_amt"],
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
 
Ext.bg_expense_pop = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorking.php",
  baseParams: { type: "bg_expense_pop" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: ["no", "id", "c_code", "c_name", "f_plan", "f_income", "f_income_all", "f_income_total"],
});

Ext.store_frmDtl = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_poReg.php",
  baseParams: {
    type: "po_working_hdr",
    i_sub_status: Ext.I_SUB_STATUS,
    i_read: user_right_read,
    c_code_sys: Ext.C_CODE_SYS,
  },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [
    { name: "no" },
    { name: "id" },
    { name: "po_working_begin_hdr_id" },
    { name: "bg_request_money_income_id" },
    { name: "c_code" },
    { name: "c_code_per" },
    { name: "c_title" },
    { name: "c_booking" },
    { name: "i_working_type" },
    { name: "i_purchase" },
    { name: "f_inv" },
    { name: "f_vat_rate" },
    { name: "f_vat" },
    { name: "f_inv_vat" },
    { name: "f_tax_personal" },
    { name: "f_tax_personal_rate" },
    { name: "f_social_security" },
    { name: "f_prov_fund" },
    { name: "f_fine" },
    { name: "sp_sbill_hdr_id" },
    { name: "f_warranty" },
    { name: "f_other" },
    { name: "f_pay" },
    { name: "c_code_ref" },
    { name: "i_sub_status" },
    { name: "i_status_last" },
    { name: "c_status_last" },
    { name: "i_status_edit" },
    { name: "c_approve" },
    { name: "d_approve_date" },
    { name: "bg_expense_id" },
    { name: "bg_budget_dtl_overlap_id" },
    { name: "dc_cost_id" },
    { name: "dc_creditor_id" },
    { name: "dc_creditor_transfer_id" },
    { name: "c_creditor_name" },
    { name: "po_creditor_id" },
    { name: "po_creditor_transfer_id" },
    { name: "c_code_invoice" },
    { name: "dc_cost_acc_id" },
    { name: "c_qty" },
    { name: "po_emp_id" },
    { name: "d_doc_date" },
    { name: "d_inv_date" },
    { name: "d_audit_date" },
    { name: "cost_name" },
    { name: "dc_expense_budget_type_id" },
    { name: "budget_name" },
    { name: "bg_expense_name" },
    { name: "creditor_name" },
    { name: "i_budget_year" },
    { name: "i_budget_year_overlap" },
    { name: "c_i_budget_year_overlap" },
    { name: "c_i_budget_year" },
    { name: "f_total" },
    { name: "d_status_date" },
    { name: "c_comment" },
    { name: "i_enable" },
    { name: "dc_user_update_id" },
    { name: "dc_user_update_cost_id" },
    { name: "d_create" },
    { name: "d_update" },
    { name: "back_d_doc_date" },
    { name: "back_c_comment" },
    { name: "d_receive_date" },
    { name: "c_receive_comment" },
    { name: "i_close_receive" },
    { name: "c_comment_status" },
    { name: "d_status_date_last" },
    { name: "dc_bank_acc_creditor_id" },
    { name: "i_protest" },
    { name: "i_is_url_pdf_hdr" },
    { name: "i_is_url_pdf_dtl" },
    { name: "pdf_hdr" },
    { name: "pdf_dtl" },
    { name: "c_code_debt" },
    { name: "d_debt_date" },
    { name: "c_debt_month" },
    { name: "c_debt_year" },
    { name: "gl_tran_hdr_id" },
  ],
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

Ext.dc_cost = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: {
    type: "dc_cost",
    i_read: user_right_read,
    c_code_sys: Ext.C_CODE_SYS,
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_code", "c_name"],
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

Ext.dc_tax_customer = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorking.php",
  baseParams: {
    type: "dc_tax_customer",
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name", "i_is_type", "i_dec_person", "i_type_tax", "dc_tax_income_id", "c_name_tax_income"],
});

Ext.creditor_taxdata = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorking.php",
  baseParams: { type: "CREDITOR_TAXDATA" },
  root: "data",
  idProperty: "id",
  fields: [
    "id",
    "c_tax_number_imp",
    "dc_tax_customer_id",
    "c_name_tax_customer",
    "c_name_tax_income",
    "tax_c_title",
    "tax_c_name",
    "tax_c_middle_name",
    "tax_c_last_name",
    "tax_c_branch",
    "tax_c_bldg",
    "tax_c_room_no",
    "tax_c_floor",
    "tax_c_village",
    "tax_c_house_no",
    "tax_c_village_no",
    "tax_c_lane",
    "tax_c_road",
    "tax_c_province",
    "tax_c_district",
    "tax_c_tambon",
    "tax_c_post_code",
    "dc_tambon_id",
    "c_email",
    "c_tele_imp",
    "dc_tambon_id",
    "dc_district_id",
    "dc_province_id",
    "c_post_code_all",
  ],
});

Ext.c_post_code = new Ext.data.JsonStore({
  fields: ["c_code"],
});

Ext.dc_province = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorking.php",
  baseParams: {
    type: "dc_province",
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});
Ext.dc_district = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorking.php",
  baseParams: {
    type: "dc_district",
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});
Ext.dc_tambon = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorking.php",
  baseParams: {
    type: "dc_tambon",
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name", "c_post_code_all"],
});
Ext.dc_title = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorking.php",
  baseParams: {
    type: "dc_title",
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});
Ext.dc_bank_acc_creditor = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorking.php",
  baseParams: {
    type: "dc_bank_acc_creditor",
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name_full", "c_code", "c_name_bank_acc", "c_name_bank"],
});

Ext.dc_expense_budget_type_all = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorking.php",
  baseParams: { type: "dc_expense_budget_type", all: "all", i_read: user_right_read, c_code_sys: Ext.C_CODE_SYS },
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
  baseParams: { type: "dc_expense_budget_type", i_read: user_right_read, i_read: user_right_read, c_code_sys: Ext.C_CODE_SYS },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});

Ext.dc_cost_sys_main_all = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: { type: "dc_cost_sys_main", all: "all", i_read: user_right_read, c_code_sys: Ext.C_CODE_SYS },
  root: "data",
  idProperty: "id",
  fields: ["id", "dc_cost_main_id", "c_name", "i_main"],
  listeners: {
    load: function (t, records, options) {
      Ext.getCmp("s_dc_cost_acc_id").setValue("0");
    },
  },
});

Ext.dc_cost_sys_main = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: { type: "dc_cost_sys_main", i_read: user_right_read, c_code_sys: Ext.C_CODE_SYS },
  root: "data",
  idProperty: "id",
  fields: ["id", "dc_cost_main_id", "c_name", "i_main"],
  listeners: {
    load: function (t, records, options) {
      var record = records.filter((record) => record.get("i_main") == 1);
      if (record.length === 0) record = records;
      Ext.dc_cost_acc_default = record[0].data.id;
      Ext.dc_cost_main_default = record[0].data.dc_cost_main_id;

      Ext.dc_cost.load({ params: { dc_cost_acc_id: Ext.dc_cost_acc_default } });
      Ext.dc_expense_budget_type.load({ params: { dc_cost_acc_id: Ext.dc_cost_acc_default } });
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

Ext.po_working_cheque_set = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poGroupBulk.php",
  baseParams: { type: "po_working_cheque_set" },
  root: "data",
  fields: ["c_payment_item"],
});

   Ext.po_working_parent_view = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "api/All_poWorking.php",
    baseParams: { type: "po_working_parent_view" },
    root: "data",
    idProperty: "id",
    fields: ["no", "id", "c_code_ref", "dc_approve_id", "dc_approve_name", "d_doc_date", "i_enable","c_file_pdf_hdr","c_file_pdf_dtl"],
  });

// storeYear
// storeYear
var years = [];
var years2 = [];
var currentTime = new Date();
var now = currentTime.getFullYear() + 1;
var yy_en = Ext.START_YEAR_ACC - 4;
years2.push({ id: "0", c_name: "- เลือกทั้งหมด -" });
while (yy_en <= now) {
  years2.push({ id: yy_en, c_name: yy_en + 543 });
  years.push({ id: yy_en, c_name: yy_en + 543 });
  yy_en++;
}
 
  Ext.store_year_all = new Ext.data.JsonStore({
  fields: ["id", "c_name"],
  data: years2,
});

  Ext.po_expense = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: {
      type: "po_expense",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
  });
  Ext.dc_cost = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: {
      type: "dc_cost",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_code", "c_name"],
  });
  Ext.booking_store = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: { type: "booking_store" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_booking", "dc_expense_budget_type_id", "i_year", "dc_cost_id", "bg_expense_id"],
  });
  Ext.storeCreditor = new Ext.data.JsonStore({
    //autoLoad: false,
    storeId: "myStoreCont",
    url: "tor/api/mnTorController.php",
    baseParams: { mode: "LIST_POP_CREDITOR", id: 0 },
    root: "data",
    idProperty: "id",
    totalProperty: "totalCount",
    fields: [{ name: "no" }, { name: "dc_creditor_id" }, { name: "c_tax_number_imp" }, { name: "c_name" }],
  });
  Ext.dc_creditor = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: {
      type: "dc_creditor",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_code", "c_name"],
  });
  Ext.dc_acc = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: {
      type: "dc_acc",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_code", "c_name"],
  });
  Ext.dc_bank = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "api/All_PoWorkingImpHdr.php",
    root: "data",
    idProperty: "id",
    baseParams: { type: "dc_bank" },
    fields: [{ name: "id" }, { name: "c_name" }],
  });
  Ext.dc_bank_acc_creditor = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "api/All_poWorking.php",
    baseParams: {
      type: "dc_bank_acc_creditor",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name_full", "c_code", "c_name_bank_acc", "c_name_bank", "i_main"],
  }); 
  Ext.dc_expense_budget_type = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: {
      type: "dc_expense_budget_type",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
  });
  Ext.dc_expense_budget_type_all = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "api/All_poWorking.php",
    baseParams: { type: "dc_expense_budget_type", all: "all", i_read: user_right_read, c_code_sys: Ext.C_CODE_SYS },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
    listeners: {
      load: function (t, records, options) {
        Ext.getCmp("s_dc_expense_budget_type_id").setValue("0");
      },
    },
  }); 
  Ext.bg_budget_year = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: {
      type: "bg_budget_year",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "i_year_ad", "i_year_be", "i_status", "i_enable"],
  }); 
  Ext.storePeriodHdr = new Ext.data.JsonStore({
    storeId: "myStore2",
    autoDestroy: false,
    autoLoad: false,
    url: "tor/api/mnCheckingController.php",
    root: "data",
    baseParams: {
      mode: "LIST_PERIOD_SUB_HDR",
    }, //Permission i_read
    idProperty: "id",
    totalProperty: "totalCount",
    fields: [
      { name: "no" },
      { name: "id" },
      { name: "i_yyyy" },
      { name: "now_yyyy" },
      { name: "i_type_bg" },
      { name: "bg_budget_dtl_overlap_id" },
      { name: "dc_expense_budget_type_id" },
      { name: "po_expense_id" },
      { name: "c_name_dtl" },
      { name: "i_is_last" },
      { name: "i_overlap" },
      { name: "c_booking" },
      { name: "bg_reserve_overlap_id" },
      { name: "pr_bg_reserve_money1_id" },
      { name: "pr_bg_reserve_money2_id" },
      { name: "pr_bg_reserve_money3_id" },

      { name: "po_bg_reserve_money1_id" },
      { name: "po_bg_reserve_money2_id" },
      { name: "po_bg_reserve_money3_id" },

      { name: "pr_dc_expense_budget_type_id" },
      { name: "pr_dc_expense_budget_type2_id" },
      { name: "pr_dc_expense_budget_type3_id" },

      { name: "c_overlap" },
      { name: "dc_cost_id" },
      { name: "bg_reserve_money_id" },
      { name: "bg_checking_money_id" },
      { name: "sp_tor_id" },
      { name: "i_overlapcheck" },
      { name: "po_expense_id" },
      { name: "dc_expense_budget_type_id" },
      { name: "contract_overlap" },
      { name: "c_contract_overlap" },
      { name: "c_contract_overlap" },
      { name: "bg_reserve_overlap_id" },
      { name: "i_is_waiting" },
      { name: "i_is_warranty" },
      { name: "i_warranty_age" },
      { name: "i_before" },
      { name: "d_warranty_date" },
      { name: "d_checking_date" },
      { name: "c_code" },
      { name: "i_yyyy_overlap" },
      { name: "dc_creditor_id" },
      { name: "dc_creditor_name" },
      { name: "dc_creditor_transfer_name" },

      { name: "dc_bg_budget_type_idTxt" },
      { name: "po_expense_idTxt" },
      { name: "sp_contract_id" },
      { name: "dc_creditor_name" },
      { name: "sp_tor_hdr_period_id" },
      { name: "sp_tor_contract_id" },
      { name: "sp_po_id", type: "int" },
      { name: "i_period", type: "int" },
      { name: "i_is_last", type: "int" },
      { name: "i_pr_type1", type: "int" },
      { name: "f_total_amt", type: "string" },
      { name: "d_period_date" },
      { name: "d_arrive_date" },
      { name: "c_arrive_code" },
      { name: "c_doc_ref" }, 
      { name: "c_status" },
      { name: "c_checking_code" },
      { name: "readOnly" },
      { name: "c_reason" },
      { name: "i_day" },
      { name: "i_alert" },
      { name: "i_status_checking" },
      { name: "i_is_fine" },
      { name: "f_fine_amt" },
      { name: "i_type_transfer" },
      { name: "i_doc_duo" },
      { name: "i_transfer_of_rights" },
      { name: "i_reserve_pay" },
      { name: "dc_creditor_transfer_id" },
      { name: "dc_bank_acc_creditor_id" },
      { name: "f_tax_personal" },
      { name: "f_vat_amt" },
      { name: "i_vat_amt" },
      { name: "f_warranty" },
      { name: "f_net_total_price" },
      { name: "sp_tranf_hdr_id" },
      { name: "dc_cost_idTxt" },
      { name: "check_pdf" },
      { name: "dc_cost2_id" },
      { name: "i_rate" },
      { name: "i_tax_personal" },
      { name: "i_product_type" },
      { name: "c_i_perod" },
    ],
  });
  Ext.storeTransf = new Ext.data.JsonStore({
    storeId: "storeTransf",
    autoDestroy: false,
    autoLoad: false,
    url: "tor/api/mnCheckingController.php",
    root: "data",
    baseParams: {
      mode: "LIST_TRANF_ITEM",
      tranf_items: true,
      id: null,
    }, //Permission i_read
    idProperty: "id",
    totalProperty: "totalCount",
    fields: [
      { name: "no" },
      { name: "id" },
      { name: "inv_mode_id" },
      { name: "c_inv_mode" },
      { name: "i_is_work_cost" },
      { name: "am_mode_id" },
      { name: "c_am_mode" },
      { name: "i_workin_process " },
      { name: "i_is_under" },
      { name: "dc_acc_id" },
      { name: "dc_acc_name" },
      { name: "c_name" },
      { name: "i_is_under" },
      { name: "f_wip_total_price" },
      { name: "f_under_total_price" },
      { name: "f_net_total_price" }, 
      { name: "f_net_total" }, 
      { name: "i_edit" }, 
    ],
  });    
  Ext.storePeriodDtl = new Ext.data.JsonStore({
    storeId: "myStore3",
    autoDestroy: false,
    autoLoad: false,
    url: "tor/api/mnCheckingController.php",
    root: "data",
    baseParams: {
      mode: "LIST_PERIOD_DTL",
      sp_mn_contract_dtl_id: Ext.SP_MN_CONTRACT_DTL_ID,
    }, //Permission i_read
    idProperty: "id",
    totalProperty: "totalCount",
    fields: [
      { name: "no" }, //sp_tranf_hdr_id
      { name: "id" },
      { name: "sp_tor_hdr_period_id" },
      { name: "sp_check_period_hdr_id" },
      { name: "sp_tor_dtl_period_id" },
      { name: "sp_tranf_hdr_id" },
      { name: "c_name" },
      { name: "i_qty" },
      { name: "i_qty_tranf" },
      { name: "dc_unit_type_id" },
      { name: "c_unit" },
      { name: "dc_bg_budget_type_id" },
      { name: "po_expense_id" },
      { name: "i_hire_type" },
      { name: "i_product_type" },
      { name: "i_is_inv" },
      { name: "i_yyyy_overlap" },
      { name: "sp_tor_contract_id" },
      { name: "f_net_unit_price" },
      { name: "f_net_tranf_price" },
      { name: "f_net_total_price" },
      { name: "f_wip_total_price" },
      { name: "f_total_add_vat_amt" },
      { name: "f_vat_amt" },
      { name: "f_rate_vat" },
    ],
  });
  Ext.storeSUMcontract = new Ext.data.JsonStore({
    storeId: "myStore3",
    autoLoad: false,
    url: "tor/api/mnTorController.php",
    root: "data",
    baseParams: {
      mode: "SUMcontract",
      sp_tor_contract_id: Ext.SP_TOR_CONTRACT_ID,
    }, //Permission i_read
    idProperty: "id",
    totalProperty: "totalCount",
    fields: [{ name: "f_total_amt" }, { name: "f_total_amt2", type: "string" }, { name: "sum_period" }, { name: "sp_tor_chk" }, { name: "sum_check" }, { name: "sum_check2" }, { name: "user_name" }],
  });
  //LIST_PERIOD_DTL
  Ext.store_year = new Ext.data.JsonStore({
    fields: ["id", "c_name"],
    autoDestroy: false,
    autoLoad: false,
    data: years,
  });
  Ext.am_mode_acc = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "api/All_AmModeAcc.php",
    baseParams: {
      type: "am_mode_acc",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_code", "c_name"],
  });
  Ext.inv_mode_acc = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "api/All_AmModeAcc.php",
    baseParams: {
      type: "inv_mode_acc",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_code", "c_name"],
  });

