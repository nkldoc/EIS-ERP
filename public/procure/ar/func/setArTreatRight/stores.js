let storeRecord = Ext.data.Record.create([{ name: "no" }, { name: "id" }, { name: "ar_treat_right_group_id" }, { name: "c_name" }, { name: "i_enable" }, { name: "d_update" }]);

Ext.store = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_setArTreatRight.php",
  baseParams: { type: "ar_treat_right" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: storeRecord,
});

Ext.ar_treat_right_group = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_setArTreatRight.php",
  baseParams: { type: "ar_treat_right_group" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
});
