Ext.part_file_pdf = "http://" + location.host + "/pdf_po/";
let Date_now = new Date();
Date_now = [Date_now.getFullYear().toString(), (Date_now.getMonth() + 1).toString().padStart(2, "0"), Date_now.getDate().toString().padStart(2, "0")];
Ext.bgYear = Date_now[0] - 0 + ((Date_now[1] < 10 ? 0 : 1) - 0);
//D:\ERP\nmu_supplies\src\main\webapp\sp\tor\api\List_approve_document.php
Ext.store = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "../tor/api/List_approve_document.php",
    baseParams: {
        type: Ext.status_sign_document,
        keyData: Ext.keyData,
        i_alarm: Ext.menu_i_alarm,
        i_pa: Ext.menu_i_day,
        i_edit: Ext.store_i_edit,
        tor_status_id: Ext.menu_id,
        i_enabled: Ext.store_enable
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
        }, {
            name: "ap_sp_emp_name",
        }, {
            name: "step_sign",
        }, {
            name: "userSignDoc",
        }, {
            name: "userSignDoc1",
        }, {
            name: "userSignDoc2",
        }, {
            name: "tor_type_idTxt",
        },
        {name: "sp_approval_hdr_id"},
        {name: "c_name"},
        {name: "c_code"},
        {name: "c_detail"},
        {name: "c_code_detail"},
        {name: "d_doc_ref"},
        {name: "c_status"},
        {name: "countSign"},
        {name: "position_id"},
        {name: "dc_user_id"},
        {name: "dc_emp_id"},
        {name: "sp_tor_id"},
        {name: "document_id"},
        
        {name: "sp_sign_type_id"},
        {name: "sp_sign_type1_id"},
        {name: "sp_sign_type2_id"},
        
        {name: "document_type_id"},
        {name: "c_dir"},
        {name: "c_filename"},
        {name: "show_page"}, // show_page , c_x ,c_y
        {name: "c_x"},
        {name: "c_y"},
        {name: "c_position_name"},

        {name: "id_ref"},
        {name: "i_version"},
        {name: "approve_step"},
        {name: "doc_date"},
        {name: "sign_step_val"},
        {name: "sign_step_doc"},
        {name: "sign_step_date"},
        {name: "approved_document_val"},
        {name: "approved_document_doc"},
        {name: "approved_document_date"},
        {name: "requester"},
        {name: "response_by"},
        {name: "approve_status"},
        {name: "approve_date"},
        {name: "approve_by"},
        {name: "review_status"},
        {name: "review_date"},
        {name: "c_comment"},
        {name: "i_enable"},
        {name: "i_delete"},
        {name: "dc_user_create_id"},
        {name: "dc_user_create_cost_id"},
        {name: "d_create"},
        {name: "dc_user_update_id"},
        {name: "dc_user_update_cost_id"},
        {name: "d_update"}
    ],
});
// storeYear
let items_model = Ext.data.Record.create([{name: "no"}, {name: "id"}, {name: "name"}, {name: "value"}, {name: "i_enabled"}]);

Ext.sp_status_document_items = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "../api/List_items.php",
    baseParams: {
        type: "sp_document_items"
    },
    root: "data",
    idProperty: "id",
    fields: [{
            name: "id",
        }, {
            name: "c_name",
        }, {
            name: "c_name",
        }]
});
Ext.storeUser = new Ext.data.JsonStore({
    storeId: "myStore",
    autoDestroy: true,
    autoLoad: false,
    url: "../api/ListDcUser.php",
    baseParams: {
        i_read: user_right_read,
    }, //Permission i_read
    root: "data",
    idProperty: "id",
    totalProperty: "totalCount",
    fields: [
        {name: "no", type: "int"},
        {name: "id"},
        {name: "menu_hdr_id"},
        {name: "dc_emp_id"},
        {name: "c_full_name"},
        {name: "dc_cost_id"},
        {name: "c_user_name"},
        {name: "c_password"},
        {name: "c_comment"},
        {name: "i_type_user"},
        {name: "i_enable"},
        {name: "i_delete"},
        {name: "dc_user_create_id"},
        {name: "dc_user_create_cost_id"},
        {name: "d_create"},
        {name: "dc_user_update_id"},
        {name: "dc_user_update_cost_id"},
        {name: "d_update"},
    ],
});
Ext.sp_signin_document = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "../api/List_items.php",
    baseParams: {
        type: "sp_signin_document"
    },
    root: "data",
    idProperty: "id",
    fields: [{
            name: "id",
        }, {
            name: "c_name",
        }, {
            name: "dc_user_id",
        }, {
            name: "dc_full_name",
        }, {
            name: "sign_eng",
        }]
});

Ext.sp_sign_items = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "../api/List_items.php",
    baseParams: {
        type: "sp_sign_items"
    },
    root: "data",
    idProperty: "id",
    fields: [{
            name: "id",
        }, {
            name: "c_name",
        }]
});

Ext.sp_status_approve_items = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "../api/List_items.php",
    baseParams: {
        type: "sp_approve_items"
    },
    root: "data",
    idProperty: "id",
    fields: [{
            name: "id",
        }, {
            name: "c_name",
        }]
});

//Ext.dc_emp_sign_items  = new Ext.data.JsonStore({
//  autoDestroy: false,
//  autoLoad:true ,
//  url: "../api/List_items.php",
//  baseParams: {
//    type: "dc_emp_sign_items" 
//  },
//  root: "data",
//  idProperty: "id",
//    fields:[  
//  { name: "id" }, 
//  { name: "c_name" },
//  { name: "sp_approval_signatures_id" },
//  { name: "sp_approval_hdr_id" },
//  { name: "signer_role" },
//  { name: "role_id" },
//  { name: "signature_image_path" },
//  { name: "i_is_acting_role" },
//  { name: "signer_name" },
//  { name: "sign_date" },
//  { name: "dc_user_sign_id" }] 
//});
// storeYear
// storeYear
var years = [];
var years2 = [];
var currentTime = new Date();
var now = currentTime.getFullYear() + 1;
var yy_en = Ext.START_YEAR_ACC - 4;
years2.push({id: "0", c_name: "- เลือกทั้งหมด -"});
while (yy_en <= now) {
    years2.push({id: yy_en, c_name: yy_en + 543});
    years.push({id: yy_en, c_name: yy_en + 543});
    yy_en++;
}

Ext.store_year_all = new Ext.data.JsonStore({
    fields: ["id", "c_name"],
    data: years2,
});

Ext.po_expense = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "../tor/api/All_PoWorkingImpHdr.php",
    baseParams: {
        type: "po_expense",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
});
Ext.dc_cost = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "../api/All_PoWorkingImpHdr.php",
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
    url: "../api/All_PoWorkingImpHdr.php",
    baseParams: {type: "booking_store"},
    root: "data",
    idProperty: "id",
    fields: ["id", "c_booking", "dc_expense_budget_type_id", "i_year", "dc_cost_id", "bg_expense_id"],
});
Ext.storeCreditor = new Ext.data.JsonStore({
    //autoLoad: true,
    storeId: "myStoreCont",
    url: "../tor/api/mnTorController.php",
    baseParams: {mode: "LIST_POP_CREDITOR", id: 0},
    root: "data",
    idProperty: "id",
    totalProperty: "totalCount",
    fields: [{name: "no"}, {name: "dc_creditor_id"}, {name: "c_tax_number_imp"}, {name: "c_name"}],
});
Ext.dc_creditor = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "../api/All_PoWorkingImpHdr.php",
    baseParams: {
        type: "dc_creditor",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_code", "c_name"],
});
Ext.dc_acc = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "../api/All_PoWorkingImpHdr.php",
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
    url: "../api/All_PoWorkingImpHdr.php",
    root: "data",
    idProperty: "id",
    baseParams: {type: "dc_bank"},
    fields: [{name: "id"}, {name: "c_name"}],
});
Ext.dc_bank_acc_creditor = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "../api/All_poWorking.php",
    baseParams: {
        type: "dc_bank_acc_creditor",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name_full", "c_code", "c_name_bank_acc", "c_name_bank", "i_main"],
});
Ext.dc_expense_budget_type = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "../api/All_PoWorkingImpHdr.php",
    baseParams: {
        type: "dc_expense_budget_type",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
});
Ext.dc_expense_budget_type_all = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "../api/All_poWorking.php",
    baseParams: {type: "dc_expense_budget_type", all: "all", i_read: user_right_read, c_code_sys: Ext.C_CODE_SYS},
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
    listeners: {
        load: function (t, records, options) {
            //Ext.getCmp("s_dc_expense_budget_type_id").setValue("0");
        },
    },
});
Ext.bg_budget_year = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "../api/All_PoWorkingImpHdr.php",
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
        {name: "no"},
        {name: "id"},
        {name: "i_yyyy"},
        {name: "now_yyyy"},
        {name: "i_type_bg"},
        {name: "bg_budget_dtl_overlap_id"},
        {name: "dc_expense_budget_type_id"},
        {name: "po_expense_id"},
        {name: "c_name_dtl"},
        {name: "i_is_last"},
        {name: "i_overlap"},
        {name: "c_booking"},
        {name: "bg_reserve_overlap_id"},
        {name: "pr_bg_reserve_money1_id"},
        {name: "pr_bg_reserve_money2_id"},
        {name: "pr_bg_reserve_money3_id"},

        {name: "po_bg_reserve_money1_id"},
        {name: "po_bg_reserve_money2_id"},
        {name: "po_bg_reserve_money3_id"},

        {name: "pr_dc_expense_budget_type_id"},
        {name: "pr_dc_expense_budget_type2_id"},
        {name: "pr_dc_expense_budget_type3_id"},

        {name: "c_overlap"},
        {name: "dc_cost_id"},
        {name: "bg_reserve_money_id"},
        {name: "bg_checking_money_id"},
        {name: "sp_tor_id"},
        {name: "i_overlapcheck"},
        {name: "po_expense_id"},
        {name: "dc_expense_budget_type_id"},
        {name: "contract_overlap"},
        {name: "c_contract_overlap"},
        {name: "c_contract_overlap"},
        {name: "bg_reserve_overlap_id"},
        {name: "i_is_waiting"},
        {name: "i_is_warranty"},
        {name: "i_warranty_age"},
        {name: "i_before"},
        {name: "d_warranty_date"},
        {name: "d_checking_date"},
        {name: "c_code"},
        {name: "i_yyyy_overlap"},
        {name: "dc_creditor_id"},
        {name: "dc_creditor_name"},
        {name: "dc_creditor_transfer_name"},

        {name: "dc_bg_budget_type_idTxt"},
        {name: "po_expense_idTxt"},
        {name: "sp_contract_id"},
        {name: "dc_creditor_name"},
        {name: "sp_tor_hdr_period_id"},
        {name: "sp_tor_contract_id"},
        {name: "sp_po_id", type: "int"},
        {name: "i_period", type: "int"},
        {name: "i_is_last", type: "int"},
        {name: "i_pr_type1", type: "int"},
        {name: "f_total_amt", type: "string"},
        {name: "d_period_date"},
        {name: "d_arrive_date"},
        {name: "c_arrive_code"},
        {name: "c_doc_ref"},
        {name: "c_status"},
        {name: "c_checking_code"},
        {name: "readOnly"},
        {name: "c_reason"},
        {name: "i_day"},
        {name: "i_alert"},
        {name: "i_status_checking"},
        {name: "i_is_fine"},
        {name: "f_fine_amt"},
        {name: "i_type_transfer"},
        {name: "i_doc_duo"},
        {name: "i_transfer_of_rights"},
        {name: "i_reserve_pay"},
        {name: "dc_creditor_transfer_id"},
        {name: "dc_bank_acc_creditor_id"},
        {name: "f_tax_personal"},
        {name: "f_vat_amt"},
        {name: "i_vat_amt"},
        {name: "f_warranty"},
        {name: "f_net_total_price"},
        {name: "sp_tranf_hdr_id"},
        {name: "dc_cost_idTxt"},
        {name: "check_pdf"},
        {name: "dc_cost2_id"},
        {name: "i_rate"},
        {name: "i_tax_personal"},
        {name: "i_product_type"},
        {name: "c_i_perod"},
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
        {name: "no"},
        {name: "id"},
        {name: "inv_mode_id"},
        {name: "c_inv_mode"},
        {name: "i_is_work_cost"},
        {name: "am_mode_id"},
        {name: "c_am_mode"},
        {name: "i_workin_process "},
        {name: "i_is_under"},
        {name: "dc_acc_id"},
        {name: "dc_acc_name"},
        {name: "c_name"},
        {name: "i_is_under"},
        {name: "f_wip_total_price"},
        {name: "f_under_total_price"},
        {name: "f_net_total_price"},
        {name: "f_net_total"},
        {name: "i_edit"},
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
        {name: "no"}, //sp_tranf_hdr_id
        {name: "id"},
        {name: "sp_tor_hdr_period_id"},
        {name: "sp_check_period_hdr_id"},
        {name: "sp_tor_dtl_period_id"},
        {name: "sp_tranf_hdr_id"},
        {name: "c_name"},
        {name: "i_qty"},
        {name: "i_qty_tranf"},
        {name: "dc_unit_type_id"},
        {name: "c_unit"},
        {name: "dc_bg_budget_type_id"},
        {name: "po_expense_id"},
        {name: "i_hire_type"},
        {name: "i_product_type"},
        {name: "i_is_inv"},
        {name: "i_yyyy_overlap"},
        {name: "sp_tor_contract_id"},
        {name: "f_net_unit_price"},
        {name: "f_net_tranf_price"},
        {name: "f_net_total_price"},
        {name: "f_wip_total_price"},
        {name: "f_total_add_vat_amt"},
        {name: "f_vat_amt"},
        {name: "f_rate_vat"},
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
    fields: [{name: "f_total_amt"}, {name: "f_total_amt2", type: "string"}, {name: "sum_period"}, {name: "sp_tor_chk"}, {name: "sum_check"}, {name: "sum_check2"}, {name: "user_name"}],
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
    url: "../api/All_AmModeAcc.php",
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
    url: "../api/All_AmModeAcc.php",
    baseParams: {
        type: "inv_mode_acc",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_code", "c_name"],
});

