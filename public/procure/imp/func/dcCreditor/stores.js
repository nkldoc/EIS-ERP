Ext.store = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/List_dcCreditor.php",
  baseParams: { type: "dc_creditor", i_read: user_right_read }, // Permission i_read
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [{ name: "no" }, { name: "id" }, { name: "c_name" }, { name: "c_map_vsn" }, { name: "c_map_ephis" }, { name: "i_key" }, { name: "c_comment" }, { name: "i_enable" }, { name: "dc_user_update_id" }, { name: "dc_user_update_cost_id" }, { name: "d_update" }]
});
