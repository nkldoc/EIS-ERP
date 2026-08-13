Ext.store = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_arLoadApi.php",
  baseParams: { type: "ar_log", i_read: user_right_read },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [{ name: "no" }, { name: "id" }, { name: "d_start" }, { name: "d_end" }, { name: "i_success_bill" }, { name: "i_success_bill_cancel" }, { name: "i_success_cut" }, { name: "i_success_cut_cancel" }],
});

// storeYear
let years = [];
let currentTime = new Date();
let now = currentTime.getFullYear() + 4;
let id = currentTime.getFullYear() - 1;
while (id <= now) {
  let c_name = id + 543;
  years.push({
    id,
    c_name,
  });
  id++;
}

Ext.store_year = new Ext.data.JsonStore({
  fields: ["id", "c_name"],
  data: years,
});
