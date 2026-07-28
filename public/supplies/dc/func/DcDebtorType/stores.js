Ext.store = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/List_DcDebtorType.php",
  baseParams: { type: "dc_debtor_type" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [{ name: "no" }, { name: "id" }, { name: "c_code" }, { name: "c_name" }, { name: "c_comment" }, { name: "i_enable" }, { name: "c_update_name" }, { name: "c_cost_update_name" }, { name: "d_update" }]
});
