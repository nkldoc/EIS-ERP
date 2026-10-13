Ext.store = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_poUserPermission.php",
  baseParams: { type: "dc_user", i_read: user_right_read }, // Permission i_read
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [{ name: "no" }, { name: "id" }, { name: "c_name" }, { name: "i_approve" }, { name: "dc_cost_acc_id" }, { name: "dc_cost_acc_name" }, { name: "i_executive" }, { name: "i_executive_main" }, { name: "i_permission" }],
});

// Ext.dc_cost_sys_main_all = new Ext.data.JsonStore({
//   autoDestroy: false,
//   autoLoad: true,
//   url: "api/All_poUserPermission.php",
//   baseParams: { type: "dc_cost_sys_main", i_read: user_right_read, c_code_sys: Ext.C_CODE_SYS },
//   root: "data",
//   idProperty: "id",
//   fields: ["id", "dc_cost_main_id", "c_name", "i_main"],
//   listeners: {
//     load: function (t, records, options) {
//       var record = records.filter((record) => record.get("i_main") == 1);
//       if (record.length === 0) record = records;
//       Ext.getCmp("s_dc_cost_acc_id").setValue(record[0].data.id);
//     },
//   },
// });

Ext.dc_cost_sys_main = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  url: "api/All_poUserPermission.php",
  baseParams: { type: "dc_cost_sys_main", i_read: user_right_read, c_code_sys: Ext.C_CODE_SYS },
  root: "data",
  idProperty: "id",
  fields: ["id", "dc_cost_main_id", "c_name", "i_main"],
  listeners: {
    load: function (t, records, options) {
      var record = records.filter((record) => record.get("i_main") == 1);
      if (record.length === 0) record = records;

      Ext.dc_cost_acc_default = record[0].data.id;
      Ext.dc_cost_main_default = record[0].data.dc_cost_main_id;
      Ext.getCmp("s_dc_cost_acc_id").setValue(Ext.dc_cost_acc_default);
      Ext.store.setBaseParam("dc_cost_acc_id", Ext.dc_cost_acc_default);
      Ext.store.load();

      // Ext.dc_cost.load({ params: { dc_cost_acc_id: Ext.dc_cost_acc_default } });
      // Ext.dc_expense_budget_type.load({ params: { dc_cost_acc_id: Ext.dc_cost_acc_default } });
      // Ext.dc_bank_acc_company.load({ params: { dc_cost_acc_id: Ext.dc_cost_acc_default } });
    },
  },
});
