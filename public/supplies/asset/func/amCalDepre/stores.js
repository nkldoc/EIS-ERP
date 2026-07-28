Ext.store = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_amCalDepre.php",
  baseParams: {
    type: "ar_log",
    // i_read: user_right_read,
  },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [{ name: "no" }, { name: "id" }, { name: "c_mm" }, { name: "c_yyyy" }, { name: "s_mm" }, { name: "s_yyyy" }, { name: "c_yyyy_mm" }, { name: "am_cal_depre_id" }, { name: "i_am_cal_depre" }, { name: "i_am_send_donate" }],
});

// storeYear
let years = [];
let currentTime = new Date();
let startTime = new Date(2022, 1, 1);
let now = currentTime.getFullYear() + 4;
let id = startTime.getFullYear();
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
