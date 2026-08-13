Ext.store = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_trackStatus.php",
  baseParams: { type: "po_working_hdr", i_read: user_right_read }, // Permission i_read
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [
    { name: "no" },
    { name: "id" },
    { name: "c_code_ref" },
    { name: "c_approve" },
    { name: "c_booking" },
    { name: "i_budget_year" },
    { name: "i_budget_year_overlap" },

    { name: "creditor_name" },
    { name: "f_total" },
    { name: "c_user_name1" },
    { name: "c_user_name3" },
    { name: "c_user_name4" },
    { name: "c_user_name5" },
    { name: "c_user_name6" },
    { name: "c_user_name7" },
    { name: "c_user_name8" },
    { name: "c_user_name9" },
    { name: "c_user_name10" },
    { name: "c_user_name11" },

    { name: "d_date1" },
    { name: "d_date3" },
    { name: "d_date4" },
    { name: "d_date5" },
    { name: "d_date6" },
    { name: "d_date7" },
    { name: "d_date8" },
    { name: "d_date9" },
    { name: "d_date10" },
    { name: "d_date11" },
    { name: "i_enable" },
    { name: "i_success" }
  ]
});

Ext.dc_expense_budget_type = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorking.php",
  baseParams: { type: "dc_expense_budget_type", all: "all" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
  listeners: {
    load: function(t, records, options) {
      Ext.getCmp("s_dc_expense_budget_type_id").setValue("0");
    }
  }
});

Ext.po_creditor = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_poWorking.php",
  baseParams: { type: "po_creditor", all: "all" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name"],
  listeners: {
    load: function(t, records, options) {
      Ext.getCmp("s_po_creditor_id").setValue("0");
    }
  }
});

// storeYear
let years = [];
years.push({ id: "0", c_name: "- เลือกทั้งหมด -" });

let currentTime = new Date();
let now = currentTime.getFullYear() + 2;
let id = currentTime.getFullYear() - 3;

while (id <= now) {
  let c_name = id + 543;
  years.push({ id, c_name });
  id++;
}

Ext.store_year = new Ext.data.JsonStore({
  fields: ["id", "c_name"],
  data: years
});
