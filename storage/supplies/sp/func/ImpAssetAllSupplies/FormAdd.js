Ext.HDR_ID = null;


const saveHdr = function (type) {
    let msg = "";

    if (msg == "") {
        Ext.getCmp("frm-Add").getEl().mask("Please wait...", "x-mask-loading");
        Ext.Ajax.request({
            url: "api/mn_ImpAssetAllSupplies.php",
            method: "POST",
            params: {
                mode: Ext.getCmp("role-form-mode").getValue(),
                id: Ext.HDR_ID,
                sp_check_period_hdr_id: Ext.getCmp("sp_check_period_hdr_idID").getValue(),
                c_name: Ext.getCmp("c_name").getValue(),
                c_comment: Ext.getCmp("c_comment").getValue(),
            },
            success: function (result, request) {
                Ext.getCmp("frm-Add").getEl().unmask();
                let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                if (jsonData.success == true) {
                    Ext.store.load({params: {mode: ""}});
                    Ext.getCmp("id").setValue(jsonData.id);
                    Ext.getCmp("role-form-mode").setValue("EDIT");
                    Ext.Msg.alert("แจ้งเตือน", "บันทึกเรียบร้อย");
                    Ext.HDR_ID = jsonData.id;
                    // ============ PanelDtl ============ //
                    let PanelDtl = new formPanelDtl();
                    Ext.getCmp("contenterCenter").add(PanelDtl);
                    Ext.getCmp("contenterCenter").setActiveTab(PanelDtl);
                } else {
                    Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg);
                }
            },
            failure: function (result, request) {
                Ext.MessageBox.alert("Failed", result.responseText); // connect error
            },
        });
    } else {
        Ext.Msg.alert("แจ้งเตือน", msg);
    }
}; // saveHdr
Ext.storePeriodHdr = new Ext.data.JsonStore({
    storeId: "storePeriodHdr",
    autoDestroy: false,
    autoLoad: true,
    url: "../po/api/List_poRequest2.php",
    root: "data",
    baseParams: {
        mode: "LIST_PERIOD_SUB_HDR", type: "ASSET_LIST"
    }, //Permission i_read
    idProperty: "id",
    totalProperty: "totalCount",
    fields: [
        {name: "no"},
        {name: "id"},
        {name: "i_yyyy"}, {name: "now_yyyy"},
        {name: "dc_expense_budget_type_id"},
        {name: "bg_expense_id"},
        {name: "i_budget_year"},
        {name: "i_budget_year_overlap"},
        {name: "i_is_warranty"},
        {name: "i_warranty_age"},
        {name: "i_before"},
        {name: "c_arrive_code"}, //c_arrive_code
        {name: "d_warranty_date"},
        {name: "d_checking_date"},
        {name: "c_code"},
        {name: "dc_bg_budget_type_idTxt"},
        {name: "po_expense_idTxt"},
        {name: "sp_contract_id"},
        {name: "dc_creditor_name"},
        {name: "sp_tor_hdr_period_id"},
        {name: "sp_tor_contract_id"},
        {name: "sp_po_id", type: "int"},
        {name: "i_period", type: "int"},
        {name: "f_total_amt", type: "string"},
        {name: "d_period_date"}, //d_period_date
        {name: "d_arrive_date"}, //c_arrive_code d_arrive_date
        {name: "c_arrive_code"}, // d_arrive_date
        {name: "c_code_ref"}, // d_arrive_date 
    ],
});

// Class Extend
formAdd = function (args) {
    formAdd.superclass.constructor.call(this, {
        region: "center",
        title: "ข้อมูล" + Ext.title_panel,
        iconCls: "icon-application-form-add",
        id: "frm-Add",
        border: false,
        stripeRows: true,
        loadMask: true,
        listeners: {
            afterrender: function (obj, eOpts) {},
        },
        items: [
            {
                xtype: "form",
                id: "form-widgets",
                frame: true,
                labelAlign: "right",
                labelWidth: 200,
                bodyStyle: {padding: "10px 20px"},
                defaults: {anchor: "100%", msgTarget: "side", allowBlank: false},
                items: [
                    {
                        xtype: "container",
                        layout: "hbox",
                        align: "stretch",
                        RemoveHeight: true,
                        defaults: {xtype: "fieldset", flex: 1, margins: "0px 3px", autoHeight: true},
                        items: [
                            {
                                title: "บันทึกข้อมูล " + Ext.title_panel,
                                RemoveCls: "x-box-item",
                                collapsible: true,
                                collapsed: false,
                                defaults: {labelStyle: "width:200px;", allowBlank: true},
                                items: [new Ext.form.ComboBox({
                                        mode: "local",
                                        store: Ext.storePeriodHdr,
                                        fieldLabel: "รายการเลขขอเบิก",
                                        anchor: "50%",
                                        id: "sp_check_period_hdr_idID",
                                        submitValue: true,
                                        name: "sp_check_period_hdr_id",
                                        hiddenName: "sp_check_period_hdr_id",
                                        valueField: "id",
                                        displayField: "c_arrive_code",
                                        triggerAction: "all",
                                        forceSelection: true,
                                        selectOnFocus: true,
                                        typeAhead: false,
                                        emptyText: "รายการเลขขอเบิก...",
                                        listeners: {
                                            Change: function () {},
                                            beforequery: function (q) {
                                                if (q.query) {
                                                    var length = q.query.length;
                                                    q.query = new RegExp(Ext.escapeRe(q.query));
                                                    q.query.length = length;
                                                }
                                            },
                                            blur: function () {
                                                this.getStore().clearFilter();
                                            },
                                        },
                                    }),
                                    {
                                        xtype: "hidden",
                                        id: "role-form-mode",
                                        name: "mode",
                                        readOnly: true,
                                    },
                                    {
                                        xtype: "hidden",
                                        id: "id",
                                        name: "id",
                                        readOnly: true,
                                    },
                                    {
                                        xtype: "textfield",
                                        fieldLabel: "เลขที่เอกสาร",
                                        id: "c_name",
                                        name: "c_name",
                                        width: 300,
                                    },
                                    {
                                        xtype: "textarea",
                                        fieldLabel: "หมายเหตุ",
                                        id: "c_comment",
                                        name: "c_comment",
                                        width: 300,
                                    },
                                ],
                            },
                        ],
                    },
                ],
                buttonAlign: "left",
                buttons: [
                    {
                        text: "&nbsp;" + Ext.GLOBAL_BU_SAVE_TH + "&nbsp;",
                        id: "saveHdr",
                        iconCls: "icon-save",
                        disabled: Ext.butt == "add" || Ext.butt == "edit" ? false : true,
                        handler: function () {
//                            console.log(Ext.getCmp("sp_check_period_hdr_idID").getValue());
//                            return false;
                            saveHdr(false);
                        },
                    },
                    {
                        text: Ext.GLOBAL_BU_BACK_TH,
                        handler: function () {
                            Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
                            Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
                        },
                    },
                ],
            },
        ],
    });
}; // formAdd
Ext.extend(formAdd, Ext.Panel, {});
