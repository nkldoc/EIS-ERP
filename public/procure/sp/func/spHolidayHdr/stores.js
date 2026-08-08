Ext.store = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/List_spHolidayHdr.php",
  baseParams: { type: "sp_holiday_hdr", i_read: user_right_read }, // Permission i_read
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [
    { name: "no" },
    { name: "id" },
    { name: "i_year" },
    { name: "d_doc_date" },
    { name: "c_comment" },
    { name: "i_enable" },
    { name: "dc_user_create_id" },
    { name: "dc_user_create_cost_id" },
    { name: "d_create" },
    { name: "dc_user_update_id" },
    { name: "dc_user_update_cost_id" },
    { name: "d_update" }
  ]
});

Ext.storeDtl = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_spHolidayHdr.php",
  baseParams: { type: "sp_holiday_dtl" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [{ name: "no" }, { name: "id" }, { name: "sp_holiday_hdr_id" }, { name: "c_name" }, { name: "d_holiday" }, { name: "i_type" }, { name: "c_comment" }]
});

// storeYear
let years = [];
let currentTime = new Date();
let now = currentTime.getFullYear() + 4;
let id = currentTime.getFullYear() - 1;
while (id <= now) {
  let c_name = id + 543;
  years.push({ id, c_name });
  id++;
}

Ext.store_year = new Ext.data.JsonStore({
  fields: ["id", "c_name"],
  data: years
});
