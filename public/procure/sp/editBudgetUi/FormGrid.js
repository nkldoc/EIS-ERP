Ext.onReady(function () {
    // หลังจากที่ stores.js โหลดเสร็จแล้ว
    if (!Ext.store) {
        console.error('Store not initialized');
        return;
    }

    Ext.QuickTips.init();
    /*===============================================*/
    Ext.title_panel = "แก้ไขงบประมาณสัญญา";
    /*===============================================*/
    
    // pagingBar
    Ext.pagingBar = new Ext.PagingToolbar({
        pageSize: 20,
        store: Ext.store,
        displayInfo: true,
        displayMsg: "Displaying topics {0} - {1} of {2}",
    });

    const controllTab = function (record, butt) {
        Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
        Ext.butt = butt;
        
        if (butt == "edit" || butt == "view") {
            // ============ formAdd ============ //
            Ext.HDR_ID = record.data.id;
            Ext.contract_id = record.data.sp_tor_contract_id;
            Ext.select_row = record.data;
            
            let frmAdd = new formAdd(record.data);
            Ext.getCmp("contenterCenter").add(frmAdd);
            Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
            Ext.getCmp("role-form-mode").setValue("EDIT");
            if (Ext.getCmp("form-widgets")) {
                Ext.getCmp("form-widgets").getForm().loadRecord(record);
            }
        }
    };

    // ================================ gridMain ================================ //
    cellClick = function (grid, rowIndex, columnIndex, e) {
        let record = grid.getStore().getAt(rowIndex);
        if (columnIndex == grid.getColumnModel().getIndexById("edit")) {
            Ext.selectRow = record;
            controllTab(record, "edit");
        }
    };

    // ================================ Grid Settings ================================ //
    var grid = new Ext.grid.GridPanel({
        id: "gridMain",
        store: Ext.store,
        frame: true,
        title: "รายการสัญญา",
        height: 250,
        stripeRows: true,
        loadMask: true,
        sm: new Ext.grid.RowSelectionModel({singleSelect: false}),
        bbar: Ext.pagingBar,
        viewConfig: {
            forceFit: true,
        },
        columnLines: true,
        columns: [
            {
                id: "edit",
                header: "แก้ไข",
                width: 50,
                fixed: true,
                sortable: false,
                renderer: function () {
                    return '<img style="cursor:pointer" src="../images/icons/pencil.gif" />';
                },
            },
            {
                id: "sp_tor_contract_id",
                header: "ID",
                width: 60,
                dataIndex: "sp_tor_contract_id",
                hidden: true,
            },
            {
                id: "c_contract_no",
                header: "เลขที่สัญญา",
                width: 100,
                dataIndex: "c_contract_no",
            },
            {
                id: "c_creditor_name",
                header: "ผู้ขาย/ผู้รับจ้าง",
                width: 200,
                dataIndex: "c_creditor_name",
            },
            {
                id: "c_expense_budget_type_name",
                header: "แหล่งเงิน",
                width: 150,
                dataIndex: "c_expense_budget_type_name",
            },
            {
                id: "c_expense_name",
                header: "หมวดค่าใช้จ่าย",
                width: 150,
                dataIndex: "c_expense_name",
            },
            {
                id: "f_contract_total",
                header: "จำนวนเงิน",
                width: 100,
                dataIndex: "f_contract_total",
                align: "right",
                renderer: function (val) {
                    return val ? floatRenderer(val) : "0.00";
                },
            },
            {
                id: "d_contract_date",
                header: "วันที่สัญญา",
                width: 80,
                dataIndex: "d_contract_date",
            },
        ],
        listeners: {
            cellclick: cellClick,
        },
    });

    // ================================ Main Container ================================ //
    var contenterCenter = new Ext.TabPanel({
        id: "contenterCenter",
        region: "center",
        deferredRender: false,
        activeTab: 0,
        enableTabScroll: true,
        items: [
            {
                id: "gridPanel",
                title: "รายการสัญญา",
                layout: "fit",
                items: [grid],
            },
        ],
    });

    new Ext.Panel({
        renderTo: Ext.getBody(),
        layout: "border",
        width: "100%",
        height: window.innerHeight - 10,
        items: [
            {
                region: "north",
                border: false,
                height: 50,
                html: '<div style="padding: 10px; font-weight: bold; font-size: 14px;">แก้ไขงบประมาณสัญญา</div>',
            },
            contenterCenter,
        ],
    });

    // ================================ Hidden Fields ================================ //
    var role_form_mode = new Ext.form.Field({
        id: "role-form-mode",
        value: "ADD",
    });

    // โหลดข้อมูลหลังจากสร้าง UI เสร็จแล้ว
    if (Ext.contract_id_from_url) {
        Ext.store.load({
            params: {id: Ext.contract_id_from_url},
            callback: function (records, operation, success) {
                if (success && records.length > 0) {
                    // เปิดแบบฟอร์มแก้ไขโดยอัตโนมัติ
                    var record = records[0];
                    Ext.defer(function () {
                        controllTab(record, "edit");
                    }, 500);
                }
            }
        });
    } else {
        // โหลดรายการทั้งหมด
        Ext.store.load({
            params: {mode: ""},
        });
    }
});

