Ext.store = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/List_poParcelOfficer.php",
  baseParams: { type: "po_parcel_officer", i_read: user_right_read }, // Permission i_read
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [{ name: "no" }, { name: "id" }, { name: "dc_cost_name" }, { name: "c_name" }, { name: "i_enable" }]
});

Ext.dc_cost_supplies = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_ParcelOfficer.php",
  baseParams: { type: "dc_cost_supplies", i_level: "all" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});
