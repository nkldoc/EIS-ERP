Ext.store = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/List_DcDebtorClaim.php",
  baseParams: { type: "dc_debtor_claim" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [{ name: "no" }, { name: "id" }, { name: "c_code" }, { name: "c_name" }, { name: "i_fund" }, { name: "c_fund" }, { name: "c_comment" }, { name: "i_enable" }, { name: "c_update_name" }, { name: "c_cost_update_name" }, { name: "d_update" }]
});

Ext.store_fund = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  chkMask: false,
  url: "api/All_DcDebtorClaim.php",
  baseParams: { type: "arr_fund" },
  root: "data",
  idProperty: "id",
  fields: [{ name: "id" }, { name: "c_name" }]
});
