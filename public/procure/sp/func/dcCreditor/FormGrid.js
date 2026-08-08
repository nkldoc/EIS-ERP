Ext.onReady(function () {
    Ext.QuickTips.init();
    /*===============================================*/
    Ext.title_panel = "เจ้าหนี้";
    /*===============================================*/
    // pagingBar
    Ext.pagingBar = new Ext.PagingToolbar({
        pageSize: 20,
        store: Ext.store,
        displayInfo: true,
        displayMsg: "Displaying topics {0} - {1} of {2}"
    });

    const deleteHdr = function (id, mode) {
        new Ext.Window({
            id: "win-msg-delete",
            title: "แจ้งเตือน",
            modal: true,
            width: 250,
            height: 130,
            html: "ท่านต้องการที่จะลบข้อมูล ?",
            buttons: [
                {
                    text: "Confirm",
                    handler: function () {
                        Ext.getCmp("win-msg-delete")
                                .getEl()
                                .mask("Please wait...", "x-mask-loading");
                        Ext.Ajax.request({
                            url: "api/mn_dcCreditor.php",
                            method: "POST",
                            params: {
                                mode: mode,
                                id: id
                            },
                            success: function (result, request) {
                                var jsonData = Ext.util.JSON.decode(result.responseText); // decode json
                                if (jsonData.success == true) {
                                    Ext.MessageBox.alert("Success", jsonData.msg); // alert massage success
                                } else {
                                    Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                                }
                                Ext.getCmp("win-msg-delete").hide(); // hidden window-panel
                                Ext.getCmp("win-msg-delete").destroy(); // clear memory :: garbage collection
                                Ext.store.reload();
                                Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not errer
                                Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
                            },
                            failure: function (result, request) {
                                Ext.MessageBox.alert("Failed", result.responseText); // connect error
                            }
                        });
                    }
                },
                {
                    text: Ext.GLOBAL_BU_BACK_TH,
                    handler: function () {
                        Ext.getCmp("win-msg-delete").hide();
                        Ext.getCmp("win-msg-delete").destroy();
                    }
                }
            ]
        }).show();
    };

    const DisbledButton = function (t, record) {
        if (t) {
            Ext.getCmp("saveHdr").hide();
        } else {
            Ext.getCmp("saveHdr").show();
        }
    };

    const controllTab = function (record, butt) {
        Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not errer
        Ext.butt = butt;
        if (butt == "add") {
            let frmAdd = new formAdd();
            Ext.getCmp("contenterCenter").add(frmAdd);
            Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
            Ext.getCmp("role-form-mode").setValue("ADD");
            Ext.getCmp("c_nameID").setDisabled(false);
            Ext.getCmp("c_map_vsnID").setDisabled(false);
            Ext.getCmp("c_map_ephisID").setDisabled(false);
        } else if (butt == "edit" || butt == "view") {
            // ============ formAdd ============ //
            Ext.creditor_taxdata.load({
            params: { dc_creditor_id: record.data.id },
            callback: function (recordx, operation, success) {
                var data_ = Ext.creditor_taxdata.getAt(0).data;
                Ext.dc_district.load({
                params: { dc_province_id: data_.dc_province_id },
                callback: function (recordx, operation, success) {
                    Ext.dc_tambon.load({
                    params: { dc_district_id: data_.dc_district_id },
                    callback: function (recordx, operation, success) {
                        var c_post_code_all = data_.c_post_code_all;
                        if (c_post_code_all) {
                        var parts = c_post_code_all.split("/");
                        var dataToAdd = parts.map(function (part) {
                            return { c_code: part };
                        });
                        Ext.c_post_code.loadData(dataToAdd);
                        }
                            }
                        });
                    }
                })}
            });
            Ext.HDR_ID = record.data.id;
            Ext.HDR_ID = record.data.id;
            let frmAdd = new formAdd(record.data);
            Ext.getCmp("contenterCenter").add(frmAdd);
            Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
            Ext.getCmp("role-form-mode").setValue("EDIT");
            Ext.getCmp("c_nameID").setDisabled(false);
            Ext.getCmp("c_map_vsnID").setDisabled(true);
            Ext.getCmp("c_map_ephisID").setDisabled(true);

            Ext.getCmp("form-widgets")
                    .getForm()
                    .loadRecord(record);
            if (butt == "view") {
                DisbledButton(true, record);
            } else {
                DisbledButton(false, record);
            }

            var labels = Ext.getCmp("Form-edit_creditor_datatax").find("name", "red_star");
            var red_star = Ext.getCmp("c_name_tax_income").getValue() == "" ? " " : "*";
            for (var i = 0; i < labels.length; i++) {
                var label = labels[i];
                label.setText(red_star);
            }
        }
    }; // controllTab

    // ================================ gridMain ================================ //
    cellClick = function (grid, rowIndex, columnIndex, e) {
        let record = grid.getStore().getAt(rowIndex);
        if (columnIndex == grid.getColumnModel().getIndexById("view")) {
            controllTab(record, "view");
        } else if (columnIndex == grid.getColumnModel().getIndexById("edit")) {
            controllTab(record, "edit");
        } else if (columnIndex == grid.getColumnModel().getIndexById("delete")) {
            if (record.get("i_use") == 1) {
            } else {
                deleteHdr(record.get("id"), "DELETE");
            }
        }
    }; //cellClick

    const search = function () {
//        alert(Ext.getCmp("i_enableID").getValue().inputValue);
//        return false;
        var msg = "";
        if (msg == "") {
            if (Ext.getCmp("value-box").getValue() != "") {
                Ext.store.setBaseParam("value", Ext.getCmp("value-box").getValue());
                Ext.store.setBaseParam("filter", Ext.getCmp("filter").getValue());
                Ext.store.setBaseParam("i_enable", Ext.getCmp("i_enablesID").getValue().inputValue);
            } else {
                Ext.store.setBaseParam("value", "");
                Ext.store.setBaseParam("filter", "");
                Ext.store.setBaseParam("i_enable", Ext.getCmp("i_enablesID").getValue().inputValue);
            }
            Ext.store.setBaseParam("mode", "SEARCH");
            Ext.store.load();
        } else {
            Ext.Msg.alert("แจ้งเตือน", msg);
        }
    };

    // gridMain
    const gridMain = new Ext.grid.GridPanel({
        region: "center",
        layout: "fit",
        title: "แสดงรายการ" + Ext.title_panel,
        id: "tabpanel1",
        border: false,
        stripeRows: true,
        loadMask: true,
        store: Ext.store,
        viewConfig: {
            emptyText: "ไม่มีข้อมูล..",
            deferEmptyText: false
        },
        tbar: [
            {
                xtype: "buttongroup",
                title: "ระบุเงื่อนไขในการค้นหาข้อมูล",
                columns: 1,
                defaults: {scale: "small", style: "float: right"},
                items: [
                    {
                        xtype: "buttongroup",
                        frame: false,
                        items: [
                            {xtype: "label", text: "ค้นหาโดย : "},
                            {xtype: "tbspacer", width: 4},
                            {
                                id: "filter",
                                xtype: "combo",
                                width: 150,
                                mode: "local",
                                store: new Ext.data.SimpleStore(
                                        {
                                            fields: ["value", "text"],
                                            data: [["c_name", "ชื่อเจ้าหนี้"], ["c_tax", "เลขประจำตัวผู้เสียภาษี"]]
                                        },
                                        ),
                                value: "c_name",
                                valueField: "value",
                                displayField: "text",
                                allowBlank: false,
                                editable: false,
                                triggerAction: "all",
                                typeAhead: false
                            },
                            {xtype: "tbspacer", width: 4},
                            {
                                xtype: "textfield",
                                id: "value-box",
                                width: 200,
                                fieldLabel: "fieldLabel",
                                emptyText: "คำที่ต้องการค้นหา"
                            }
                        ]
                    }, {
                        xtype: "radiogroup",
                        id: "i_enablesID",
                        name: "i_enables",
                        fieldLabel: "ประเภทกาารใช้งาน",
                        columns: [100, 100],
                        vertical: true,
                        items: [
                            {boxLabel: "ใช้งาน", name: "i_enables", inputValue: 1, checked: true},
                            {boxLabel: "ไม่ใช้งาน", name: "i_enables", inputValue: 2}
                        ]
                    }
                ],
                buttonAlign: "left",
                buttons: [
                    {
                        text: "เพิ่มข้อมูล",
                        id: "buAdd",
                        iconCls: "icon-add",
                        handler: function (grid, rowIndex, colIndex) {
                            controllTab({}, "add");
                        }
                    },
                    {xtype: "tbfill"},
                    {
                        text: "ค้นหา",
                        iconCls: "icon-magnifier",
                        handler: function () {
                            search();
                        }
                    }
                ]
            }
        ],
        columns: [
            new Ext.grid.RowNumberer({
                header: "ที่",
                width: 30,
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    return record.get("no");
                }
            }),
            {
                id: "view",
                header: "-",
                sortable: false,
                align: "center",
                width: 50,
                dataIndex: "id",
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    return "<button style='font-size:11px; cursor:pointer; color: blue;'>แสดง</button>";
                }
            },
            {
                id: "edit",
                header: "-",
                sortable: false,
                align: "center",
                width: 50,
                dataIndex: "id",
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    return "<button style='font-size:11px; cursor:pointer; color: green;'>แก้ไข</button>";
                }
            },
            /* {
             id: "delete",
             header: "-",
             sortable: false,
             align: "center",
             width: 100,
             dataIndex: "id",
             renderer: function(value, metaData, record, row, col, store, gridView) {
             if (record.get("i_use") == 1) {
             return "<font color=green>มีการใช้งานในระบบ</font>";
             } else {
             return "<button style='font-size:11px; cursor:pointer; color: red;'>ลบ</button>";
             }
             }
             },*/
            {
                id: "c_name",
                header: "ชื่อ",
                sortable: false,
                align: "center",
                dataIndex: "c_name",
                width: 250,
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    metaData.attr = "style='text-align: left;'";
                    return value;
                }
            },
            {
                id: "inv_name",
                header: "ชื่อ Supplies(ซื้อ/จ้าง)",
                sortable: false,
                align: "center",
                dataIndex: "inv_name",
                width: 250,
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    metaData.attr = "style='text-align: left;'";
                    return value;
                }
            },
            {
                id: "c_tax_number_imp",
                header: "เลขผู้เสียภาษี",
                sortable: false,
                align: "center",
                dataIndex: "c_tax_number_imp",
                width: 250,
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    metaData.attr = "style='text-align: left;'";
                    return value;
                }
            },
            {
                id: "c_map_vsn",
                header: "ชื่อ Map (MIS/Vision Net)",
                sortable: false,
                align: "center",
                hidden: true,
                width: 250,
                dataIndex: "c_map_vsn",
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    metaData.attr = "style='text-align: left;'";
                    return value;
                }
            },
            {
                id: "c_map_ephis",
                hidden: true,
                header: "ชื่อ Map (MIS/e-PHIS)",
                sortable: false,
                align: "center",
                width: 250,
                dataIndex: "c_map_ephis",
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    metaData.attr = "style='text-align: left;'";
                    return value;
                }
            }, {
                header: "ประเภทรายการ",
                sortable: false,
                align: 'center',
                dataIndex: "i_key",
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    if (value == 1) {
                        return '<img src="../images/icons/yes.gif");/>';
                    } else {
                        return '<img src="../images/icons/no.gif");/>';
                    }
                }
            },
            {
                header: "สถานะใช้งาน",
                sortable: true,
                align: "center",
                dataIndex: "i_enable",
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    if (value == 1) {
                        return "<span style='color:green;'>ใช้งาน</span>";
                    } else {
                        return "<span style='color:red;'>ไม่ใช้งาน</span>";
                    }
                }
            },
            {header: "ผู้ทำรายการล่าสุด", sortable: true, dataIndex: "dc_user_update_id"},
            {
                header: "วันที่ทำรายการล่าสุด",
                sortable: true,
                align: "center",
                dataIndex: "d_update",
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    return value != "" ? shortThaiDate(value) : "";
                }
            },
            {header: "หน่วยงานที่ทำรายการล่าสุด", sortable: true, dataIndex: "dc_user_update_cost_id"},
            {width: 40, dataIndex: ""}
        ],
        autoExpandColumn: "c_name",
        bbar: Ext.pagingBar
    }); // gridMain

    /*====================== CENTER ======================*/
    center = new Ext.TabPanel({
        region: "center",
        border: false,
        //activeTab: 0, //default Tab
        id: "contenterCenter",
        defaults: {autoScroll: true},
        items: [gridMain]
    });
    // SET ref Grid&Tab
    Ext.getCmp("tabpanel1").on("cellclick", cellClick, this);
    // SetTab Controller Loads
    Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
    /*====================== RENDER ======================*/
    new Ext.Viewport({
        layout: "border",
        items: [center]
    });

    new Ext.KeyNav("tabpanel1", {
        enter: function (e) {
            search();
        },
        scope: this
    });
});
