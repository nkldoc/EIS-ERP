
Ext.store = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "alert/api/alertStatusType.php",
    baseParams: {type: "list", i_read: user_right_read}, // Permission i_read
    root: "data",
    idProperty: "id",
    totalProperty: "totalCount",
    fields: [
        {name: "no"},
        {name: "id"},
        {name: "c_name"},
        {name: "c_comment"},
        {name: "dc_user_create_id"},
        {name: "dc_user_create_cost_id"},
        {name: "d_create"},
        {name: "dc_user_update_id"},
        {name: "dc_user_update_cost_id"},
        {name: "d_update"}
    ]
});
Ext.storeDtl = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "api/alertStatusTypeItems.php",
    baseParams: {type: "po_budget_income_dtl"},
    root: "data",
    idProperty: "id",
    totalProperty: "totalCount",
    fields: [
        {name: "no"},
        {name: "id"},
        {name: "c_name"},
        {name: "c_comment"},
        {name: "dc_user_create_id"},
        {name: "dc_user_create_cost_id"},
        {name: "d_create"},
        {name: "dc_user_update_id"},
        {name: "dc_user_update_cost_id"},
        {name: "d_update"}
    ]
});
