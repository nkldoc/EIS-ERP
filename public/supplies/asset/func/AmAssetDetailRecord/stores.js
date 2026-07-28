Ext.store = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/List_AmAssetDetailRecord.php",
  baseParams: {
    type: "am_asset_detail_record_hdr",
    // i_read: user_right_read,
  }, // Permission i_read
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [{ name: "no" }, { name: "id" }, { name: "c_code" }, { name: "asset_name" }, { name: "f_unit_cost" }, { name: "d_receive_date" }, { name: "i_budget_year" }, { name: "budget_source" }, { name: "dc_expense_budget_type_id" }],
});

let storeDtlRecord = Ext.data.Record.create([
  { name: "no" },
  { name: "c_code_no" },
  { name: "id" },
  { name: "c_code" },
  { name: "c_name" },
  { name: "am_mode_id" },
  { name: "acc_code" },
  { name: "acc_name" },
  { name: "c_code_mode" },
  { name: "c_name_mode" },
  { name: "i_period_year" },
  { name: "f_unit_cost" },
  { name: "d_receive_date" },
  { name: "dc_expense_budget_type_id" },
  { name: "budget_source" },
  { name: "i_budget_year" },
]);

Ext.storeDtl = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_AmAssetDetailRecord.php",
  baseParams: { type: "am_asset_detail_record_dtl" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: storeDtlRecord,
  listeners: {
    load: function (t, records, options) {
      var num = Ext.storeDtl.totalLength;
      Ext.c_code_no_max = "00000";
      Ext.c_code_no_gen = 0;
      for (var i = 0; i < num; i++) {
        if (Ext.storeDtl.data.items[i].data.c_code_no > Ext.c_code_no_max) {
          Ext.c_code_no_max = Ext.storeDtl.data.items[i].data.c_code_no;
          Ext.c_code_no_gen = Ext.c_code_no_max - 0;
        }
      }
    },
  },
});

Ext.imp_assetall_dtl = new Ext.data.JsonStore({
  autoLoad: true,
  storeId: "myStoreCost",
  url: "api/All_AmAssetDetailRecord.php",
  baseParams: { type: "imp_assetall_dtl", id: Ext.HDR_ID },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: ["id", "no", "c_name", "c_code", "d_receive_date", "dc_expense_budget_type_id", "budget_source", "i_budget_year"],
});

Ext.am_mode_acc = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/All_AmAssetDetailRecord.php",
  baseParams: { type: "am_mode_acc" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name", "c_name_mode", "c_code", "i_period_year"],
});

Ext.Data_imp_assetall_dtl = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_AmAssetDetailRecord.php",
  baseParams: { type: "Data_imp_assetall_dtl" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [
    { name: "id" },
    { name: "c_code" },
    { name: "asset_name" },
    { name: "receive_date" },
    { name: "quantity" },
    { name: "dc_unit_type" },
    { name: "f_unit_cost" },
    // { name: "f_unit_cost2" },
    // { name: "f_unit_cost3" },
    { name: "stockpile" },
    { name: "Segment" },
    { name: "workandproject" },
    { name: "fund" },
    { name: "event_id" },
    { name: "i_yyyy" },
    { name: "budget_source" },
    { name: "c_detail" },
    { name: "c_brand" },
    { name: "c_model" },
    { name: "c_serial" },
    { name: "got" },
    { name: "salvage" },
    { name: "i_period_year" },
    { name: "c_commet" },
    { name: "c_codeold2" },
    { name: "c_codeold1" },
    { name: "receipt_number" },
    { name: "insurance_start" },
    { name: "insurance_year" },
    { name: "insurance_month" },
    { name: "insurance_end" },
    { name: "insurance_mote" },
    { name: "c_location" },
    { name: "c_code_building" },
    { name: "car_register" },
    { name: "car_type" },
    { name: "code_caretaker" },
    { name: "name_caretaker" },
    { name: "image_file" },
    { name: "barcode_status" },
    { name: "from_file" },
  ],
});
// Ext.dc_expense_budget_type = new Ext.data.JsonStore({
//   autoDestroy: false,
//   autoLoad: false,
//   url: "api/All_ImpAssetAll.php",
//   baseParams: { type: "dc_expense_budget_type" },
//   root: "data",
//   idProperty: "id",
//   fields: ["id", "c_name"],
// });

// storeYear
let years = [];
let currentTime = new Date();
let now = currentTime.getFullYear() + 2;
let id = currentTime.getFullYear() - 2;
years.push({ id: "0", c_name: "- เลือกทั้งหมด -" });
while (id <= now) {
  let c_name = id + 543;
  years.push({ id, c_name });
  id++;
}

Ext.store_year = new Ext.data.JsonStore({
  fields: ["id", "c_name"],
  data: years,
});
