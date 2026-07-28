Ext.store = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/List_AmAssetAll.php",
  baseParams: {
    type: "ar_log",
    // i_read: user_right_read,
  },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [{ name: "no" }, { name: "id" }, { name: "c_code" }, { name: "acc_code" }, { name: "acc_name" }, { name: "c_name" }, { name: "f_unit_cost" }, { name: "i_period_year" }, { name: "i_budget_year" }, { name: "d_receive_date" }],
});

let storeDtlRecord = Ext.data.Record.create([{ name: "no" }, { name: "id" }, { name: "c_name" }, { name: "c_comment" }]);

Ext.storeDtl = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_AmAssetAll.php",
  baseParams: { type: "am_asset_item" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: storeDtlRecord,
});

Ext.acc_mode = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/List_AmAssetAll.php",
  baseParams: {
    type: "acc_mode",
    // i_read: user_right_read,
  },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [{ name: "dc_acc_id" }, { name: "c_acc_code" }, { name: "c_acc_name" }],
  listeners: {
    load: function (t, records, options) {
      Ext.getCmp("acc_name").setValue("10205010101");
    },
  },
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
