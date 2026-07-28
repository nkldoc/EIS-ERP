
let Date_now = new Date();
Date_now = [Date_now.getFullYear().toString(), (Date_now.getMonth() + 1).toString().padStart(2, "0"), Date_now.getDate().toString().padStart(2, "0")];
Ext.bgYear = Date_now[0] - 0 + ((Date_now[1] < 10 ? 0 : 1) - 0);
//Ext.storeSingner = new Ext.data.JsonStore({
//    autoDestroy: false,
//    autoLoad: false,
//    url: 'api/List_items.php', //api/List_items.php
//    root: 'data',
//    fields: ['id', 'name'] 
//}),
        Ext.store = new Ext.data.JsonStore({
            autoDestroy: false,
            autoLoad: false,
            url: "tor/api/List_audit_document.php",
            baseParams: {
                type: Ext.status_sign_document,
                keyData: Ext.keyData,
                i_alarm: Ext.menu_i_alarm,
                i_pa: Ext.menu_i_day,
                i_edit: Ext.store_i_edit,
                tor_status_id: Ext.menu_id,
                i_enabled: Ext.store_enable
            },
            root: "data",
            idProperty: "id",
            totalProperty: "totalCount",
            fields: [
                {
                    name: "no",
                },
                {
                    name: "id",
                }, {
                    name: "next_name",
                }, {
                    name: "ap_sp_emp_name",
                }, {
                    name: "position_name",
                }, {
                    name: "full_name",
                }, {
                    name: "step_sign",
                },
                {name: "sp_sign_document_id"},
                {name: "tor_type_idTxt"},
                {name: "f_total_amt"},
                {name: "i_audit"},
                {name: "i_status"},
                {name: "audit_id"},
                {name: "signer_id"},
                {name: "step_sign"},
                {name: "c_name"},
                {name: "c_code"},
                {name: "c_detail"},
                {name: "c_code_detail"},
                {name: "pr_code"},
                {name: "d_doc_ref"},
                {name: "c_status"},
                {name: "line"},
                {name: "url"},
                {name: "date_type"},
                {name: "urlfile"},
                {name: "type_id"},
                {name: "dc_user_id"},
                {name: "is_room"},
                {name: "room_id"},
                {name: "allUserId"},
                {name: "doc_prev_user_id"},
                {name: "doc_active_user_id"},
                {name: "doc_next_user_id"},
                {name: "ownner_name"},
                {name: "active_name"}, // ownner_line active_line ownner_name active_name
                {name: "ownner_line"},
                {name: "active_line"},
                {name: "i_fish"},
                {name: "nextDocUserId"},
                {name: "nextUserId"},
                {name: "position_id"},
                {name: "dc_emp_id"},
                {name: "countSign"},
                {name: "tor_type_id"},
                {name: "document_id"},
                {name: "document_type_id"},
                {name: "c_dir"},
                {name: "c_filename"},
                {name: "show_page"}, // show_page , c_x ,c_y
                {name: "c_x"},
                {name: "c_y"},
                {name: "c_position_name"},
                {name: "sp_tor_id"},
                {name: "id_ref"},
                {name: "i_version"},
                {name: "approve_step"},
                {name: "doc_date"},
                {name: "sign_step_val"},
                {name: "sign_step_doc"},
                {name: "sign_step_date"},
                {name: "approved_document_val"},
                {name: "approved_document_doc"},
                {name: "approved_document_date"},
                {name: "requester"},
                {name: "response_by"},
                {name: "approve_status"},
                {name: "approve_date"},
                {name: "approve_by"},
                {name: "review_status"},
                {name: "review_date"},
                {name: "c_comment"},
                {name: "i_enable"},
                {name: "i_delete"},
                {name: "dc_user_create_id"},
                {name: "dc_user_create_cost_id"},
                {name: "d_create"},
                {name: "dc_user_update_id"},
                {name: "dc_user_update_cost_id"},
                {name: "storeUser"},
                {name: "d_update"}
            ],
        });
// storeYear
let items_model = Ext.data.Record.create([{name: "no"}, {name: "id"}, {name: "name"}, {name: "value"}, {name: "i_enabled"}]);

Ext.sp_status_document_items = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/List_items.php",
    baseParams: {
        type: "sp_document_items"
    },
    root: "data",
    idProperty: "id",
    fields: [{
            name: "id",
        }, {
            name: "c_name",
        }, {
            name: "c_name",
        }]
});
Ext.storeUser = new Ext.data.JsonStore({
    storeId: "myStore",
    autoDestroy: true,
    autoLoad: false,
    url: "api/ListDcUser.php",
    baseParams: {
        i_read: user_right_read,
    }, //Permission i_read
    root: "data",
    idProperty: "id",
    totalProperty: "totalCount",
    fields: [
        {name: "no", type: "int"},
        {name: "id"},
        {name: "menu_hdr_id"},
        {name: "dc_emp_id"},
        {name: "c_full_name"},
        {name: "dc_cost_id"},
        {name: "c_user_name"},
        {name: "c_password"},
        {name: "c_comment"},
        {name: "i_type_user"},
        {name: "i_enable"},
        {name: "i_delete"},
        {name: "dc_user_create_id"},
        {name: "dc_user_create_cost_id"},
        {name: "d_create"},
        {name: "dc_user_update_id"},
        {name: "dc_user_update_cost_id"},
        {name: "d_update"},
    ],
});
Ext.sp_signin_document = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/List_items.php",
    baseParams: {
        type: "sp_signin_document"
    },
    root: "data",
    idProperty: "id",
    fields: [{
            name: "id",
        }, {
            name: "c_name",
        }, {
            name: "dc_user_id",
        }, {
            name: "dc_full_name",
        }, {
            name: "sign_eng",
        }]
});

Ext.sp_sign_items = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/List_items.php",
    baseParams: {
        type: "sp_sign_items"
    },
    root: "data",
    idProperty: "id",
    fields: [{
            name: "id",
        }, {
            name: "c_name",
        }]
});

// storeYear
// storeYear
var years = [];
var years2 = [];
var currentTime = new Date();
var now = currentTime.getFullYear() + 1;
var yy_en = Ext.START_YEAR_ACC - 4;
years2.push({id: "0", c_name: "- เลือกทั้งหมด -"});
while (yy_en <= now) {
    years2.push({id: yy_en, c_name: yy_en + 543});
    years.push({id: yy_en, c_name: yy_en + 543});
    yy_en++;
}

Ext.store_year_all = new Ext.data.JsonStore({
    fields: ["id", "c_name"],
    data: years2,
});


Ext.dc_cost = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "api/All_PoWorkingImpHdr.php",
    baseParams: {
        type: "dc_cost",
    },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_code", "c_name"],
});
 