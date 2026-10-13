Ext.part_file_pdf = "https://" + location.host + "/pdf_po/";

Ext.store = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/List_dcUserCopyRight.php",
  baseParams: {
    type: "list_user",
  }, // Permission i_read
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [
    { name: "no" },
    { name: "id" },
    { name: "dc_user_id" },
    { name: "c_full_name" },
    { name: "c_user_name" },
  ],
});

Ext.dc_group_menu = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/All_dcUserCopyRight.php",
  baseParams: { type: "dc_group_menu"},
  root: "data",
  idProperty: "id",
  fields: ["id", "dc_menu_hdr_id", "c_name"],
  listeners: {
    
  },
});
