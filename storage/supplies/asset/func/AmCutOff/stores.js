Ext.store = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/List_AmCutOff.php",
  baseParams: {
    type: "am_cutoff_hdr",
    // i_read: user_right_read,
  }, // Permission i_read
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [{ name: "no" }, { name: "id" }, { name: "c_code" }, { name: "c_doc" }, { name: "i_reason" }, { name: "i_success" }, { name: "d_cutoff_date" }, { name: "c_comment" }, { name: "gl_tran_hdr_id" }, { name: "d_create" }, { name: "d_update" }],
});

let storeDtlRecord = Ext.data.Record.create([
  { name: "no" },
  { name: "id" },
  { name: "i_type" },
  { name: "am_asset_hdr_id" },
  { name: "c_code" },
  { name: "asset_name" },
  { name: "receive_date" },
  { name: "quantity" },
  { name: "dc_unit_type" },
  { name: "f_unit_cost" },
  { name: "f_unit_cost2" },
  { name: "f_unit_cost3" },
  { name: "f_depre" },
  { name: "f_acc_cost" },
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
]);

Ext.storeDtl = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_AmCutOff.php",
  baseParams: { type: "am_cutoff_dtl" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: storeDtlRecord,
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

Ext.am_asset_hdr = new Ext.data.JsonStore({
  autoLoad: true,
  storeId: "myStoreCost",
  url: "api/All_AmCutOff.php",
  baseParams: { type: "am_asset_hdr", id: Ext.HDR_ID },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: ["id", "no", "c_name", "c_code", "f_unit_cost", "receive_date", "i_period_year", "f_depre", "f_acc_cost"],
});

Ext.d_cal_depre = new Ext.data.JsonStore({
  autoLoad: true,
  storeId: "myStoreCost",
  url: "api/All_AmCutOff.php",
  baseParams: { type: "d_cal_depre" },
  root: "data",
  idProperty: "id",
  // totalProperty: "totalCount",
  fields: ["d_cal_depre", "s_mm", "s_yyyy"],
});
