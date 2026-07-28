Ext.onReady(function () {
    Ext.QuickTips.init();
    /*===============================================*/
    Ext.title_panel = "นำเข้าครุภัณฑ์";
    /*===============================================*/
    // pagingBar
    Ext.pagingBar = new Ext.PagingToolbar({
        pageSize: 20,
        store: Ext.store,
        displayInfo: true,
        displayMsg: "Displaying topics {0} - {1} of {2}",
    });
    const DisbledButton = function (t, record) {
        if (t) {
            Ext.getCmp("saveDtl").hide();
            Ext.getCmp("saveHdr").hide();
            Ext.getCmp("add_dtl").hide();
        } else {
            Ext.getCmp("saveHdr").show();
        }
    }; 
    const controllTab = function (record, butt) {
        Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not errer
        Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {}; // null obj not errer
        Ext.butt = butt;
        if (butt == "add") {

            Ext.storePeriodHdr.setBaseParam("remList",0 );
            Ext.storePeriodHdr.reload({
                callback: function (recordx, operation, success) {
                    if (success) {
                        let frmAdd = new formAdd();
                        Ext.getCmp("contenterCenter").add(frmAdd);
                        Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
                        Ext.getCmp("role-form-mode").setValue("ADD");
                    }
                }
            });

            // Ext.getCmp("btn_f_cancel_over").hide();
        } else if (butt == "edit" || butt == "view") {
            Ext.storePeriodHdr.setBaseParam("remList",1);
            Ext.storePeriodHdr.reload({
                callback: function (recordx, operation, success) {
                    if (success) {
                        // ============ formAdd ============ //
                        Ext.HDR_ID = record.data.id;
                        let frmAdd = new formAdd(record.data);
                        Ext.getCmp("contenterCenter").add(frmAdd);
                        Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
                        Ext.getCmp("role-form-mode").setValue("EDIT");
                        Ext.getCmp("form-widgets").getForm().loadRecord(record);
                        // ============ PanelDtl ============ //
                        let PanelDtl = new formPanelDtl();
                        Ext.getCmp("contenterCenter").add(PanelDtl);
                        Ext.getCmp("contenterCenter").setActiveTab(PanelDtl);
                        // Ext.getCmp("btn_f_cancel_over").show();
                        // Ext.getCmp("saveDtl").hide();
                        if (butt == "view") {
                            DisbledButton(true, record);
                        } else {
                            DisbledButton(false, record);
                        }
                    }
                }
            });

        }
    }; // controllTab  
    const cellClick = function (grid, rowIndex, columnIndex, e) {
        let record = grid.getStore().getAt(rowIndex);
        if (columnIndex == grid.getColumnModel().getIndexById("view")) {
            controllTab(record, "view");
        } else if (columnIndex == grid.getColumnModel().getIndexById("edit")) {
            controllTab(record, "edit");
        }
    }; //cellClick 
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
            deferEmptyText: false,
        },
        tbar: [
            {
                text: "เพิ่มข้อมูล",
                id: "buAdd",
                iconCls: "icon-add",
                handler: function (grid, rowIndex, colIndex) {
                    controllTab({}, "add");
                },
            },
        ],
        columns: [
            new Ext.grid.RowNumberer({
                header: "ที่",
                width: 30,
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    return record.get("no");
                },
            }),
            {
                id: "edit",
                header: "-",
                sortable: false,
                align: "center",
                width: 50,
                dataIndex: "id",
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    return "<button style='font-size:11px; cursor:pointer; color: green;'>แก้ไข</button>";
                },
            },
            {
                header: "เลขที่เอกสาร",
                sortable: false,
                align: "center",
                width: 300,
                dataIndex: "c_name",
            },
            {
                header: "วันที่ทำรายการล่าสุด",
                sortable: true,
                align: "center",
                dataIndex: "d_update",
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    return value != "" ? shortThaiDate(value) : "";
                },
            },
            {
                header: "วันที่สร้างรายการ",
                sortable: true,
                align: "center",
                dataIndex: "d_create",
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    return value != "" ? shortThaiDate(value) : "";
                },
            },
            {width: 40, dataIndex: ""},
        ],
        //     autoExpandColumn: "c_name",
        bbar: Ext.pagingBar,
    }); //gridMain
    /*====================== CENTER ======================*/
    center = new Ext.TabPanel({
        region: "center",
        border: false,
        //activeTab: 0, //default Tab
        id: "contenterCenter",
        defaults: {autoScroll: false},
        items: [gridMain],
    }); 
    Ext.getCmp("tabpanel1").on("cellclick", cellClick, this); 
    Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
    /*====================== RENDER ======================*/
    new Ext.Viewport({
        layout: "border",
        items: [center],
    }); 
    new Ext.KeyNav("tabpanel1", {
        enter: function (e) {
            search();
        },
        scope: this,
    });
});
