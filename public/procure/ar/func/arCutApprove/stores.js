Ext.f_approve = 0; // จำนวนที่ตรวจสอบ
Ext.f_total = 0; // จำนวนเงินทั้งหมด

Ext.store = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/List_arCutApprove.php",
  baseParams: { type: "ar_cut", i_read: user_right_read }, // Permission i_read
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [
    { name: "no" },
    { name: "id" },
    { name: "ar_cut_hdr_id" },
    { name: "preview_id" },
    { name: "i_type" },
    { name: "c_code_cut" },
    { name: "d_cut_date" },
    { name: "ar_debtor_type_name" },
    { name: "ar_treat_right_group_name" },
    { name: "ar_treat_right_name" },
    { name: "ar_cost_name" },
    { name: "f_cut" },
    { name: "i_status" },
  ],
  listeners: {
    load: function (t, records, options) {
      Ext.getCmp("tabpanel1").getEl().mask("Please wait...", "x-mask-loading");
      Ext.Ajax.request({
        url: "api/List_arCutApprove.php",
        method: "POST",
        params: {
          type: "sum_invoice",
          d_start: Ext.util.Format.gridDate(getStoreItems(Ext.groupdate, Ext.getCmp("i_groupdate").getValue(), "d_start"), "Y-m-d"),
          d_end: Ext.util.Format.gridDate(getStoreItems(Ext.groupdate, Ext.getCmp("i_groupdate").getValue(), "d_end"), "Y-m-d"),
        },
        success: function (result, request) {
          Ext.getCmp("tabpanel1").getEl().unmask();
          let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
          if (jsonData.success == true) {
            Ext.f_select = 0;
            Ext.f_approve = jsonData.f_approve;
            Ext.f_total = jsonData.f_total;
            changePrice();
          } else {
            Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg);
          }
        },
        failure: function (result, request) {
          Ext.MessageBox.alert("Failed", result.responseText); // connect error
        },
      });
    },
  },
});

Ext.groupdate = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: false,
  url: "api/All_arCutApprove.php",
  baseParams: { type: "GROUP_DATE" },
  root: "data",
  idProperty: "id",
  fields: ["id", "c_name", "d_start", "d_end"],
  listeners: {
    load: function (t, records, options) {
      Ext.getCmp("i_groupdate").setValue("1");
    },
  },
});
