Ext.store = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/List_glMapAccHdr.php",
  baseParams: { type: "gl_map_acc_hdr", i_read: user_right_read }, // Permission i_read
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [
    { name: "no" },
    { name: "id" },
    { name: "c_name" },
    { name: "dc_acc_id" },
    { name: "c_acc_full" }, 
    { name: "i_enable" },
    { name: "i_delete" },
    { name: "show_enable" },
    { name: "c_comment" },
    { name: "dc_user_create_id" },
    { name: "dc_user_create_cost_id" },
    { name: "d_create" },
    { name: "dc_user_update_id" },
    { name: "dc_user_update_cost_id" },
    { name: "d_update" }
  ]
});
 

let storeDtlRecord = Ext.data.Record.create([{ name: "no" }, { name: "id" }, { name: "gl_map_acc_hdr_id" }, { name: "c_code_map" }, { name: "c_name_map" }, { name: "c_comment" }]);

Ext.storeDtl = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_glMapAccHdr.php",
  baseParams: { type: "gl_map_acc_dtl" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: storeDtlRecord
});
 

Ext.store_dc_acc = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_glMapAccHdr.php",
  baseParams: { type: "dc_acc" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"]
});


// storeYear
let years = [];
let currentTime = new Date();
let now = currentTime.getFullYear() + 2;
let id = currentTime.getFullYear() - 2;
while (id <= now) {
  let c_name = id + 543;
  years.push({ id, c_name });
  id++;
}

Ext.store_year = new Ext.data.JsonStore({
  fields: ["id", "c_name"],
  data: years
});
