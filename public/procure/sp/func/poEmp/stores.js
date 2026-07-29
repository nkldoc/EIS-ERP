Ext.store = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/List_poEmp.php",
  baseParams: { type: "po_emp", i_read: user_right_read }, // Permission i_read
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [{ name: "no" }, { name: "id" }, { name: "i_use" }, { name: "c_name" }, { name: "c_comment" }, { name: "i_enable" }, { name: "dc_user_update_id" }, { name: "dc_user_update_cost_id" }, { name: "d_update" }]
});
