Ext.store = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "tor/api/List_spSetUserCostSysSP.php",
  baseParams: { type: "dc_user_cost_sys_hdr", c_code_sys: Ext.C_CODE_SYS },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [{ name: "no" }, { name: "id" }, { name: "c_user_name" }, { name: "c_full_name" }, { name: "i_type_view" }, { name: "c_type_view_name" }],
});

let storeDtlRecord = Ext.data.Record.create([{ name: "no" }, { name: "id" }, { name: "i_last" }, { name: "c_code" }, { name: "c_code_mis" }, { name: "c_name" }, { name: "i_status_use" }]);

Ext.storeDtl = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "tor/api/List_spSetUserCostSysSP.php",
  baseParams: { type: "dc_user_cost_sys_dtl", c_code_sys: Ext.C_CODE_SYS },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: storeDtlRecord,
});

Ext.dc_user = new Ext.data.JsonStore({
  autoLoad: true,
  url: "../sp/All_spSetUserCostSysSP.php",
  baseParams: {
    type: "dc_user",
    show: "all",
  },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name", "c_name2", "c_user"],
});

// storeYear
let years = [];
let currentTime = new Date();
let now = currentTime.getFullYear();
let id = currentTime.getFullYear() - 10;
// years.push({ id: "0", c_name: "- เลือกทั้งหมด -" });
while (id <= now) {
  let c_name = id + 543;
  years.push({ id, c_name });
  id++;
}

Ext.store_year = new Ext.data.JsonStore({
  fields: ["id", "c_name"],
  data: years,
});

years.unshift({ id: "0", c_name: "- เลือกทั้งหมด -" });
Ext.store_year_all = new Ext.data.JsonStore({
  fields: ["id", "c_name"],
  data: years,
});
