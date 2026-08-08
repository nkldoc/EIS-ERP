Ext.store = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/List_AmImpPurchase.php",
  baseParams: {
    type: "imp_assetall_hdr",
    i_read: user_right_read, user_right_read
  }, // Permission i_read
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [{ name: "no" }
    , { name: "id" }
    , { name: "tor_id" }
    , { name: "sp_tor_contract_id" }
    , { name: "sp_tor_hdr_period_id" }
    , { name: "sp_check_period_hdr_id" }
    , { name: "tor_type_id"}
    , { name: "c_code" }
    , { name: "c_name" }
    , { name: "tor_type_name" }
    , { name: "i_period" }
    , { name: "c_code_check" }
    , { name: "c_code_d"}
    , { name: "d_checking_date" }
    , { name: "d_arrive_date"}
    , { name: "dc_expense_budget_type_id" }
    , { name: "c_budget_type"}
    , { name: "dc_cost_id" }
    , { name: "dc_cost_acc_id"}
    , { name: "c_cost_name"}
    , { name: "f_workin0" }
    , { name: "f_workin1" }
    , { name: "f_workin2" }
    , { name: "f_total" }
    , { name: "i_register"}
    , { name: "i_is_register"}
    , { name: "d_doc_date"}
    , { name: "imp_assetall_supplies_hdr_id"}
    , { name: "c_system"}
    , { name: "po_expense_id"}
    , { name: "dc_creditor_id"}
    , { name: "i_yyyy"}
    , { name: "sp_emp"}
  ],
});

let storeDtlRecord = Ext.data.Record.create([
  { name: "no" },
  { name: "am_mode_name" },
  { name: "am_mode_small" },
  { name: "asset_name" },
  { name: "quantity" },
  { name: "dc_unit_type" },
  { name: "f_unit_cost" },
  { name: "workandproject" },
  { name: "c_brand" },
  { name: "c_model" },
  { name: "c_serial" },
  { name: "i_period_year" },
  { name: "f_runis" },
  { name: "c_comment" },
  { name: "insurance_start" },
  { name: "insurance_year" },
  { name: "insurance_month" },
  { name: "insurance_end" },
  { name: "insurance_mote" },
  { name: "c_location" },
  { name: "c_code_building" },
  { name: "car_register" },
  { name: "car_type" },
  { name: "c_code_parent" },

  /*{ name: "no" },
  { name: "id" },
  { name: "i_type" },
  { name: "imp_assetall_dtl_id" },
  { name: "c_code" },
  { name: "asset_name" },
  { name: "receive_date" },
  { name: "quantity" },
  { name: "dc_unit_type" },
  { name: "f_unit_cost" },
  { name: "f_unit_cost2" },
  { name: "f_unit_cost3" },
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
  { name: "c_comment" },
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
  { name: "from_file" },*/
]);

Ext.storeDtl = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_AmImpPurchase.php",
  baseParams: { type: "imp_assetall_dtl" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: storeDtlRecord,
});

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

