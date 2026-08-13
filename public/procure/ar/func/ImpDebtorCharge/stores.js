Ext.store = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/List_ImpDebtorCharge.php",
  baseParams: { type: "imp_debtor_charge_hdr" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [{ name: "no" }, { name: "id" }, { name: "c_code" }, { name: "d_doc_date" }, { name: "c_comment" }, { name: "i_enable" }, { name: "c_update_name" }, { name: "c_cost_update_name" }, { name: "d_update" }]
});

Ext.storeDtl = new Ext.data.JsonStore({
  autoLoad: false,
  url: "api/List_ImpDebtorCharge.php",
  baseParams: { type: "imp_debtor_charge_dtl" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [
    { name: "no" },
    { name: "id" },
    { name: "hdr_id" },
    { name: "dc_debtor_type_id" },
    { name: "dc_debtor_claim_id" },
    { name: "dc_cost_debtor_id" },
    { name: "c_hn" },
    { name: "c_an" },
    { name: "c_patient" },
    { name: "d_date_service" },
    { name: "i_date_admission" },
    { name: "f_charge" },
    { name: "c_no_charge" },
    { name: "d_save_charge" }
  ]
});

// ประเภทลูกหนี้
Ext.dc_debtor_type = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  chkMask: false,
  url: "api/All_ImpDebtorCharge.php",
  baseParams: { type: "dc_debtor_type" },
  root: "data",
  idProperty: "id",
  fields: [{ name: "id" }, { name: "c_name" }]
});

// สิทธิ์การรักษา
Ext.dc_debtor_claim = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  chkMask: false,
  url: "api/All_ImpDebtorCharge.php",
  baseParams: { type: "dc_debtor_claim" },
  root: "data",
  idProperty: "id",
  fields: [{ name: "id" }, { name: "c_name" }]
});

// หน่วยงานลูกหนี้
Ext.dc_cost_debtor = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  chkMask: false,
  url: "api/All_ImpDebtorCharge.php",
  baseParams: { type: "dc_cost_debtor" },
  root: "data",
  idProperty: "id",
  fields: [{ name: "id" }, { name: "c_name" }]
});
