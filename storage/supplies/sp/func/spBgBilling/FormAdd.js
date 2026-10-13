Ext.HDR_ID = null;

const saveHdr = function (type) {
    let msg = "";

    // if (Ext.getCmp("c_nameID").getValue() == "") {
    //     msg += "<span style='white-space: nowrap;'>- กรุณากรอก หัวข้อการทำรายการ</span><br>";
    // }
    //
    if (msg == "") {
        var year_TH = Ext.getCmp("i_yyyyID").lastSelectionText;
        var name_label = Ext.getCmp("i_yyyyID").fieldLabel;
        Ext.getCmp("frm-Add")
                .getEl()
                .mask("Please wait...", "x-mask-loading");
        Ext.Ajax.request({
            url: "api/mn_spBgBilling.php",
            method: "POST",
            params: {
                mode: Ext.getCmp("role-form-mode").getValue(),
                id: Ext.getCmp("id").getValue(),
                i_yyyy: Ext.getCmp("i_yyyyID").getValue(),
                i_year: year_TH,
                c_name: name_label + " " + year_TH, 
                
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
                    Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
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
            }
        });
    } else {
        Ext.Msg.alert("แจ้งเตือน", msg);
    }
}; // saveHdr

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
            afterrender: function (obj, eOpts) {}
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
                                items: [
                                    {
                                        xtype: "hidden",
                                        id: "role-form-mode",
                                        name: "mode",
                                        readOnly: true
                                    },
                                    {
                                        xtype: "hidden",
                                        id: "id",
                                        name: "id",
                                        readOnly: true
                                    },
                                    new Ext.form.ComboBox({
                                        fieldLabel: "ปีงบประมาณ",
                                        id: "i_yyyyID",
                                        name: "i_yyyy",
                                        hiddenName: "i_yyyytxt",
                                        mode: "local",
                                        store: Ext.store_year,
                                        valueField: "id",
                                        displayField: "c_name",
                                        triggerAction: "all",
                                        forceSelection: true,
                                        selectOnFocus: true,
                                        typeAhead: false,
                                        editable: false,
                                        emptyText: "กรุณาเลือก...",
                                        value: new Date().getFullYear(),
                                        width: 150,
                                        listeners: {
                                            afterrender: function () {
                                                this.fn = function () {};
                                            },
                                            Change: function () {
                                                this.fn();
                                            },
                                            beforequery: function (q) {
                                                if (q.query) {
                                                    var length = q.query.length;
                                                    q.query = new RegExp(Ext.escapeRe(q.query));
                                                    q.query.length = length;
                                                }
                                            },
                                            blur: function () {
                                                this.getStore().clearFilter();
                                            }
                                        }
                                    }),
                                ]
                            }
                        ]
                    }
                ],
                buttonAlign: "left",
                buttons: [
                    {
                        text: "&nbsp;" + Ext.GLOBAL_BU_SAVE_TH + "&nbsp;",
                        id: "saveHdr",
                        iconCls: "icon-save",
                        disabled: Ext.butt == "add" || Ext.butt == "edit" ? false : true,
                        handler: function () {
                            saveHdr(false);
                        }
                    },
                    {
                        text: Ext.GLOBAL_BU_BACK_TH,
                        handler: function () {
                            Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
                            Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
                        }
                    }
                ]
            }
        ]
    });
}; // formAdd
Ext.extend(formAdd, Ext.Panel, {});
