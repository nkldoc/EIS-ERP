var storeUrl    = "api/List_spBgBilling.php";
var storeDtlUrl = "api/List_spBgBilling.php";
//
Ext.store = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: storeUrl,
  baseParams: { type: "sp_holiday_hdr", i_read: user_right_read }, // Permission i_read
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [
    { name: "no" },
    { name: "id" },
    { name: "i_yyyy" },
    { name: "c_name" },
    { name: "c_code" },
    { name: "i_enabled" },
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
  url: storeDtlUrl,
  baseParams: { type: "sp_holiday_dtl" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [
      { name: "no" }
      , { name: "id" }
      , { name: "sp_bg_billing_id" }
      , { name: "c_name" }
      , { name: "c_code" }
      , { name: "i_yyyy" }
      , { name: "d_start_date" }
      , { name: "d_end_date" }
      , { name: "d_post_date" }
      , { name: "d_billing_date" }
      , { name: "c_day_name" }
      , { name: "i_day" }
      , { name: "i_time" } 
      , { name: "i_mmyyyy" } 
      , { name: "i_confirm" } 
  ]
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
 
 
 
Ext.store_year = new Ext.data.JsonStore({ fields: ["id", "c_name"], data: years });
Ext.daysInWeek =[];
Ext.daysInWeek.push({ 1: "อาทิตย์",
            2: "จันทร์",
            3: "อังคาร",
            4: "พุธ",
            5: "พฤหัสบดี",
            6: "ศุกร์",
            7: "เสาร์"});
 
//console.log(Ext.daysInWeek[0][0]);
 

 
