//AutoLoad
Ext.torType = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/All_spAlert.php",
  baseParams: { type: "sp_type_status", i_is_type_tor: true   , all :"all" },
  root: "data",
  idProperty: "id",
  listeners: {
    load: function (t, records, options) {
      Ext.getCmp("s_tor_type_idID").setValue(0);
    },
  },
  fields: ["id", "c_name"],
});
Ext.sp_user = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/All_RepSpTorPAuser.php",
  baseParams: {type: "sp_emp", all: "all"},
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
  listeners: {
      load: function (t, records, options) {
          if (Ext.session.i_level == 1 || Ext.session.sp_emp_id == 32 || Ext.session.sp_emp_id == 9) {
              Ext.getCmp("sp_emp_idID").setValue("0");
          } else if (Ext.session.i_level == 3) {
              Ext.getCmp("sp_emp_idID").setValue(Ext.session.sp_emp_id);
          } else if (Ext.session.i_level == 2) {
              Ext.getCmp("sp_emp_idID").setValue("0");
          }
      },
  },
});
Ext.sp_tor_status = new Ext.data.JsonStore({
  autoLoad: true,
  url: "api/All_RepSpTorStatus.php",
  baseParams: { type: "sp_tor_status", 
                // i_level: 4, 
                // show: "all" 
                all: "all",
              },
  root: "data",
  idProperty: "id",
  listeners: {
    load: function (t, records, options) {
      Ext.getCmp("sp_tor_status_id").setValue(0);
    },
  },
  fields: ["id", "c_name","i_menu"],
});
Ext.sub_cost = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/All_spAlert.php",
  baseParams: { type: "sub_cost_id" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});
Ext.po_user = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: {
    type: "po_user",
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});
// copy text in cell on select row no
Ext.po_emp = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: {
    type: "po_emp",
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_code", "c_name"],
});
Ext.po_user_permission = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: {
    type: "po_user_permission",
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});
Ext.dc_cost = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: {
    type: "dc_cost",
    c_code_sys: Ext.C_CODE_SYS,
    all: "all",
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_code", "c_name"],
  listeners: {
    load: function (t, records, options) {
      Ext.getCmp("s_dc_cost_idID").setValue("0");
    },
  },
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
      // Ext.getCmp("s_dc_cost_acc_id").setValue("0");
    },
  },
});
Ext.storeUnitType = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: {
    type: "dc_unit_type",
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_code", "c_name"],
});
Ext.dc_expense_budget_type = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
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
  autoLoad: true,
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
Ext.po_expense = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: {
    type: "po_expense",
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
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
    // load: function (t, records, options) {
    // },
  },
});
Ext.dc_cost_main = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: { type: "dc_cost_main", i_read: user_right_read, c_code_sys: Ext.C_CODE_SYS },
  root: "data",
  idProperty: "id",
  fields: ["id", "dc_cost_main_id", "c_name", "i_main"],
  listeners: {
    load: function (t, records, options) {
      // console.log(records.length);
      if (records.length > 1 && Ext.session.dc_center_user != 1) {
        Ext.cost_main = Ext.dc_cost_main;
        var record = records.filter((record) => record.get("i_main") == 1);
        if (record.length === 0) record = records;
        Ext.dc_cost_acc_default = record[0].data.id;
        Ext.dc_cost_main_default = record[0].data.dc_cost_main_id;
        Ext.dc_cost_main_default_c_name = record[0].data.c_name;
        Ext.dc_cost.load({ params: { dc_cost_acc_id: Ext.dc_cost_acc_default } });
        Ext.dc_expense_budget_type.load({ params: { dc_cost_acc_id: Ext.dc_cost_acc_default } });
      } else {
        Ext.cost_main = Ext.dc_cost;
        Ext.dc_cost_main_default = Ext.session.dc_cost_id;
      }
      // console.log(Ext.cost_main.baseParams.type);
      // Ext.dc_user_approve.load({ params: { dc_cost_acc_id: Ext.dc_cost_acc_default } });
    },
  },
});
Ext.i_type_bg = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/All_spAlert.php",
  baseParams: { type: "sp_type_bg", i_type_bg: false },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});
Ext.po_expense_expire = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/All_PoWorkingImpHdr.php",
  baseParams: {
    type: "po_expense_expire",
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});
/*
   "i_step" => intval($row["i_step"]),
   "i_forword" => intval($row["i_forword"]),
   "i_backword" => intval($row["i_backword"]),
   */
Ext.storePerDtl = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "tor/api/mnTorCheckList.php",
  baseParams: {
    mode: "sp_Per_dtl",
    i_type: 0,
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
    { name: "row" },
    { name: "i_period" },
    { name: "pr_code" },
    { name: "c_name" },
    { name: "d_doc_date" },
    { name: "d_due_date" },
    { name: "d_arrive_date" },
    { name: "d_checking_date" },
    { name: "dc_department" },
    { name: "stats_period" },
    { name: "c_code" },
    { name: "stats_con" },
    { name: "dc_expense_budget_type" },
    { name: "dc_expense_budget_type_id" },
    { name: "bg_expense" },
    { name: "po_expense_id" },
    { name: "dc_creditor_name" },
    { name: "c_tax_number_imp" },
    { name: "f_total_amt" },
    { name: "f_type_amt" },
    { name: "f_period" },
    { name: "sp_emp" },
    { name: "f_chk" },
    { name: "c_arrive_code" },
    { name: "c_code_chk" },
    { name: "c_code_bl" },
    { name: "c_code_d" },
    { name: "d_doc_billing" },
    { name: "d_po_working_hdr" },
    { name: "c_file_pdf_hdr" },
    { name: "c_file_pdf_dtl" },
    { name: "i_is_url_pdf_hdr" },
    { name: "i_is_url_pdf_dtl" },
  ],
});
console.log(Ext.session.sp_emp_id  );
Ext.storeDtl = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "tor/api/mnTorCheckList.php",
  baseParams: {
    type: "sp_working_dtl",
    mode: "LIST",
    i_type: 0,
    i_enabled : 1,
    i_show : (Ext.session.sp_emp_id == 32  || Ext.session.sp_emp_id == 9) ? 2 : 0, 
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
      name: "i_owner_bg",
    },
    {
      name: "i_type_bg",
    },
    {
      name: "i_type_bgProject",
    },
    {
      name: "i_type_bgTxt",
    },
    {
      name: "i_step",
    },
    {
      name: "upload",
    },
    {
      name: "sp_contract_id",
    },
    {
      name: "i_edit",
    },
    {
      name: "i_is_upload",
    },
    {
      name: "txtsub_cost",
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
      name: "c_name_status", //
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
      name: "i_purchase", //i_product_type	i_hire_type	i_is_inv
    },
    {
      name: "i_product_type",
    },
    {
      name: "i_type_bg",
    },
    {
      name: "sp_type_id",
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
      name: "i_delivery_date",
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
      name: "i_is_parent",
    },
    {
      name: "f_total_amt",
    },
    {
      name: "f_type_amt",
    },
    {
      name: "f_type_amt0",
    },
    {
      name: "f_type_amt1",
    },
    {
      name: "f_type_amt2",
    },
    {
      name: "dc_cost_id",
    },
    {
      name: "dc_cost2_id",
    },
    {
      name: "tag",
    },
    {
      name: "dc_cost_idTxt",
    },
    {
      name: "dc_cost2_idTxt",
    },
    {
      name: "i_yyyy",
    },
    {
      name: "c_year",
    },
    {
      name: "dc_department_id",
    },
    {
      name: "c_department",
    },
    {
      name: "d_doc_ref",
    },
    {
      name: "dc_expense_budget_type_id",
    },
    {
      name: "dc_expense_budget_type_id0",
    },
    {
      name: "dc_expense_budget_type_id1",
    },
    {
      name: "dc_expense_budget_type_id2",
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
      name: "i_enabled",
    },
    {
      name: "c_comment",
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
      name: "d_doc_date",
    },
    {
      name: "start_date",
    },
    {
      name: "index_receive",
    },
    {
      name: "end_date",
    },
    {
      name: "i_pr_type1",
    },
    {
      name: "i_pr_type2",
    },
    {
      name: "i_pr_type3",
    },
    {
      name: "bg_reserve_money1_id",
    },
    {
      name: "bg_reserve_money2_id",
    },
    {
      name: "bg_reserve_money3_id",
    },
    {
      naame: "dc_create_cost_id",
    },
    {
      name: "code",
    },
    {
      name: "c_tax_number_imp",
    },
    {
      name: "dc_creditor_name",
    },
    {
      name: "f_total_contract",
    },
    {
      name: "d_doc_content",
    },
    {
      name: "d_start_content",
    },
    {
      name: "d_due_content",
    },
    {
      name: "stats_con",
    },
    {
      name :"i_amount_bg"
    },
    {
      name:"c_emp_name"
    },
    {
      name:"txtdc_department_idID"
    },
    {
      name:"c_name_egp"
    },
    {
      name:"f_total_average"
    },
    {
      name:"d_egp_date"
    }
  ],
});
Ext.yearTh = function () {
  let years = [];
  let currentTime = new Date();
  let now = currentTime.getFullYear() + 1;
  let id = currentTime.getFullYear() - 3;
  while (id <= now) {
    let c_name = id + 543;
    years.push({
      id,
      c_name,
    });
    id++;
  }

  let Date_now = new Date();
  Date_now = Date_now.toISOString().split("T")[0].split("-");
  Ext.bgYear = Date_now[0] - 0 + ((Date_now[1] < 10 ? 0 : 1) - 0);
  return years;
};
Ext.store_year = new Ext.data.JsonStore({
  fields: ["id", "c_name"],
  autoDestroy: false,
  autoLoad: false,
  data: Ext.yearTh(),
});
