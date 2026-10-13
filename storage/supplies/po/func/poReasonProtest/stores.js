Ext.store = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/List_poReasonProtest.php",
  baseParams: { type: "po_reason_protest", i_read: user_right_read }, // Permission i_read
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [{ name: "no" }, { name: "id" }, { name: "c_name" }, { name: "c_comment" },{ name: "i_enable" }]
});
