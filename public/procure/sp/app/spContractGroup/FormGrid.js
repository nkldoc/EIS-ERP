
Ext.url = "tor/api/mnCheckingController.php";
function submitSearch(act) {
    Ext.store.setBaseParam("mode", "LIST_SUB_PERIOD_HDR");
    Ext.store.setBaseParam("act", "SEARCH");
    if (act == "reset") {
        Ext.getCmp("c_codeID").setValue("");
        Ext.getCmp("c_arrive_codeID").setValue("");
        Ext.getCmp("c_doc_refID").setValue("");
        Ext.getCmp("f_contract_amtID").setValue("");

    } else {
        Ext.store.setBaseParam("c_code", Ext.getCmp("c_codeID").getValue());
        Ext.store.setBaseParam("c_arrive_code", Ext.getCmp("c_arrive_codeID").getValue());
        Ext.store.setBaseParam("c_doc_ref", Ext.getCmp("c_doc_refID").getValue());
        Ext.store.setBaseParam("f_contract_amt", Ext.getCmp("f_contract_amtID").getValue());
        Ext.store.load();
    }

}
Ext.SearchFrm = function () {
    return new Ext.Window({
        title: "ค้นหารายการ",
        width: 500,
        id: "winSearchFrm",
        height: 200,
        layout: "fit",
        buttonAlign: "left",
        items: [
            {
                layout: "column",
                border: false,
                defauls: {background: "#eee", },

                items: [
                    {
                        columnWidth: 0.8,
                        layout: "form",
                        border: false,
                        bodyStyle: "padding:5px",
                        id: "frm-serachID",
                        items: [
                            {
                                xtype: "textfield",
                                fieldLabel: "เลขที่สัญญา",
                                id: "c_codeID",
                                name: "c_code",
                                enableKeyEvents: true,
                                listeners: {
                                    keypress: function (field, e) {
                                        if (e.getKey() === e.ENTER) {
                                            submitSearch();
                                        }
                                    }
                                }
                            },
                            {
                                xtype: "textfield",
                                fieldLabel: "เลขที่รับของ",
                                id: "c_arrive_codeID",
                                name: "c_arrive_code",
                                enableKeyEvents: true,
                                listeners: {
                                    keypress: function (field, e) {
                                        if (e.getKey() === e.ENTER) {
                                            submitSearch();
                                        }
                                    }
                                }
                            },
                            {
                                xtype: "textfield",
                                fieldLabel: "เลขที่ตรวจรับ",
                                id: "c_doc_refID",
                                name: "c_doc_ref",
                                enableKeyEvents: true,
                                listeners: {
                                    keypress: function (field, e) {
                                        if (e.getKey() === e.ENTER) {
                                            submitSearch();
                                        }
                                    }
                                }
                            },
                            {
                                xtype: "textfield",
                                fieldLabel: "เงินของสัญญา",
                                id: "f_contract_amtID",
                                name: "f_contract_amt",
                                enableKeyEvents: true,
                                listeners: {
                                    keypress: function (field, e) {
                                        if (e.getKey() === e.ENTER) {
                                            submitSearch();
                                        }
                                    }
                                }
                            }
                        ]
                    }
                ],
                buttonAlign: "left",
                buttons: [
                    {
                        text: "ค้นหา",
                        icon: "../images/icons/application_form_magnify.png",
                        handler: submitSearch
                    },
                    {
                        text: "เริ่มใหม่",
                        icon: "../images/icons/reload.png",
                        handler: function () {
                            submitSearch("reset");
                        }
                    },
                    {
                        text: "ปิด",
                        icon: "../images/icons/bullet_cross.png",
                        handler: function () {
                            Ext.getCmp("winSearchFrm").hide();
                        }
                    },
                    {
                        text: "active 3",
//                        icon: "../images/icons/bullet_cross.png",
                        handler: function () {
                            Ext.getCmp("contenterCenter").setActiveTab(2);
                        }
                    }
                ]
            }
        ]
    });
};
Ext.extend(gridSummary = (function () {
    Ext.store = new Ext.data.GroupingStore({
        url: Ext.url,
        baseParams: {mode: "LIST_SUB_PERIOD_HDR"}, // LIST_SUB_PERIOD_HDR 
        root: "data",
        reader: new Ext.data.JsonReader({
            root: 'data', // Root property of JSON data, adjust based on JSON structure
            idProperty: 'id', // Unique identifier for each record, adjust accordingly
            fields: [
                {
                    name: "no",
                },
                {
                    name: "id",
                },
                {
                    name: "sp_check_period_hdr_id",
                },
                {
                    name: "sp_tor_id", type: "int"
                },
                {
                    name: "sp_emp_id", type: "int"
                },
                {
                    name: "sp_cate_id", type: "int"
                },
                {
                    name: "sp_tor_contract_id",
                },
                {
                    name: "sp_check_period_dtl_id",

                },
                {
                    name: "sp_tor_dtl_period_id",
                },
                {
                    name: "sp_tor_id",
                },
                {
                    name: "dc_cost_id",
                },
                {
                    name: "i_request",
                },
                {
                    name: "i_step",
                },
                {
                    name: "i_yyyy_overlap",
                },
                {
                    name: "c_overlap",
                },
                {
                    name: "i_overlap",
                },
                {
                    name: "i_overlapcheck",
                },
                {
                    name: "po_expense_id",
                },
                {
                    name: "expense_name",
                },
                {
                    name: "budget_type",
                },
                {
                    name: "i_is_last",
                },
                {
                    name: "dc_expense_budget_type_id",
                },
                {
                    name: "bg_reserve_overlap_id",
                },
                {
                    name: "i_menu",
                },
                {
                    name: "sp_tor_contract_id",
                },
                {
                    name: "sp_tor_hdr_period_id",
                },
                {
                    name: "sp_mn_contract_hdr_id",
                },
                {
                    name: "i_is_status_checking",
                },
                {
                    name: "sp_contract_id",
                },
                {
                    name: "txtsp_contractID",
                },
                {
                    name: "sp_po_id",
                },
                {
                    name: "c_arrival_code",
                },
                {
                    name: "dc_cost_id",
                },
                {
                    name: "i_yyyy_overlap",
                },
                {
                    name: "i_yyyy",
                },
                {
                    name: "i_pr_type1",
                },
                {
                    name: "use_yyyy",
                },
                {
                    name: "c_yyyy",
                },
                {
                    name: "i_is_po",
                },
                {
                    name: "c_name_in",
                },
                {
                    name: "dc_creditor_name",
                },
                {
                    name: "c_arrive_code",
                },
                {
                    name: "c_contract_code",
                },
                {
                    name: "c_doc_ref",
                },
                {
                    name: "c_code",
                },
                {
                    name: "d_checking_date", //d_start_date d_end_date
                },
                {
                    name: "c_checking_code",
                },
                {
                    name: "d_arrive_date", //d_start_date d_end_date
                },
                {
                    name: "d_start_date", // d_end_date
                },
                {
                    name: "d_end_date", //d_start_date
                },
                {
                    name: "i_type_fine",
                },
                {
                    name: "i_period",
                },
                {
                    name: "d_arrive_date",
                },
                {
                    name: "d_start_date",
                },
                {
                    name: "d_end_date",
                },
                {
                    name: "f_total_amt",
                },
                {
                    name: "f_net_total_price",
                },
                {
                    name: "dc_cost_idTxt",
                },
                {
                    name: "dc_user_create_name",
                },
                {
                    name: "dc_user_create_cost_name",
                },
                {
                    name: "d_create",
                },
                {
                    name: "dc_user_update_name",
                },
                {
                    name: "dc_user_update_cost_name",
                },
                {
                    name: "withdraw_name",
                },
                {
                    name: "emp_name",
                },
                {
                    name: "d_update",
                },
                {
                    name: "i_purchase",
                },
                {
                    name: "i_hire_type",
                },
                {
                    name: "i_product_type",
                },
                {
                    name: "i_type_bg",
                },
                {
                    name: "c_billing_code"
                },
                {
                    name: "c_name"
                },
                {
                    name: "d_doc_arrive_dt"
                },
                {
                    name: "d_billing_date"
                },
                {
                    name: "check_pdf"
                },
                {
                    name: "i_is_upload_chk"
                },
                {
                    name: "dc_cost_id2"
                }
            ],
        }),
        // Define grouping configurations
        groupField: 'c_code', // Field to group by
        sortInfo: {
            field: 'c_code', // Field to sort by
            direction: 'ASC'
        },
        totalProperty: "totalCount",
        autoLoad: true
    });
    var groupingView = new Ext.grid.GroupingView({
        startCollapsed: false, // Default state
        forceFit: true,
        groupTextTpl: '<div style="padding:3px;background: #aaccf6b8;">' +
          '<span style="font-size:14px; color:blue;">' +
          '{text}</span>' +
          ' <span style="color:black;">' +
          '{values}:: ' +
          '({[values.rs.length]} {[values.rs.length > 1 ? "รายการ" : "รายการ"]})' +
          '</span>' +
          '</div>'
    });
    var colmnn = function () {
        return [
            new Ext.grid.RowNumberer({
                header: "ที่",
                dataIndex: "no",
                id: "idID",
                width: 30,
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    metaData.attr = "style='cursor:pointer; text-align:center;';";
                    return record.get("no");
                },
            }),
            {
                header: "ลำดับ",
                sortable: false,
                align: "left",
                dataIndex: "id",
                hidden: true, // icon: "../images/icons/application_view_tile.png"
            },
            {
                header: "เลขที่ตรวจรับ",
                sortable: true,
                align: "left",
                dataIndex: "c_contract_code",
                width: 150,
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    return value;
                },
            },
            {
                header: "รหัสสัญญา",
                sortable: true,
                dataIndex: "c_code",
                width: 130,
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {

                    if (false) {
                        metaData.attr = "style='font-weight:bold;color:blue'; align='right'";
                    } else {
                        metaData.attr = "";
                    }
                    return value; //DategetShortDateMonthName(value);
                },
            },
            {
                header: "เลขรับของ",
                sortable: false,
                align: "center",
                dataIndex: "c_arrive_code",
                width: 120,
            },
            {
                header: "งวด",
                sortable: false,
                align: "center",
                dataIndex: "i_period",
                width: 100,
                renderer: function (value, metaData, record, row, col, store, gridView) {

                    if (record.get("i_is_last") == 1) {
                        metaData.attr = "style='color:blue;cursor:pointer; text-align:center;';";
                        return value;
                    } else {
                        return value;
                    }
                }
//        },
//        {
//            header: "งวดสุดท้าย",
//            sortable: false,
//            align: "center",
//            dataIndex: "id",
//            id: "i_is_lastID",
//            width: 70,
//            renderer: function (value, metaData, record, row, col, store, gridView) {
//                metaData.attr = "style='cursor:pointer; text-align:center;';";
//                if (record.get("i_is_last") == 1)
//                    return '<img src="../images/icons/accept.png");/>';
//                else
//                    return '<img src="../images/icons/cancel.png"); style="cursor:pointer"/>';
//            },
//        },
//        {
//            header: "เอกสารตรวจรับ",
//            sortable: false,
//            width: 105,
//            align: "center",
//            dataIndex: "check_pdf",
//            id: "check_pdfID",
//            // editor: new Ext.form.TextField({}),
//            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
//                metaData.attr = "style='cursor:pointer; text-align:center;';";
//                if (record.get("check_pdf") != 0)
//                    return '<img src="../images/icons/icon_pdf.png");/>';
//                else
//                    return  '<img src="../images/icons/bullet_cross.png"); style="cursor:pointer"/>';
//            },

            },
            {
                header: "ชื่อคู่สัญญา",
                sortable: true,
                dataIndex: "dc_creditor_name",
                width: 250,
//        },
//        {
//            header: "วันที่ตรวจรับ",
//            sortable: false,
//            align: "center",
//            dataIndex: "d_checking_date",
//            width: 90,
            },
            {
                header: "วันเริ่มสัญญา",
                sortable: false,
                align: "center",
                dataIndex: "d_start_date",
                width: 90,

            },
            {
                header: "สิ้นสุดสัญญา",
                sortable: false,
                align: "center",
                dataIndex: "d_end_date",
                width: 90,
            }, {
                header: "ชื่อพนักงานเบิก",
                align: "left",
                dataIndex: "withdraw_name",
                width: 180,
            },
            {
                header: "หน่วยงานเจ้าของเรื่อง",
                align: "left",
                hidden: true,
                dataIndex: "dc_cost_idTxt",
            },
            {
                header: "ชื่อผู้สร้างรายการ",
                sortable: false,
                align: "center",
                dataIndex: "dc_user_create_name",
                hidden: true,
            },
            {
                header: "หน่วยงานผู้สร้าง",
                sortable: false,
                align: "center",
                dataIndex: "dc_user_create_cost_name",
                hidden: true,
            },
            {
                header: "วันที่สร้างรายการ",
                sortable: false,
                align: "center",
                dataIndex: "d_create",
                hidden: true,
                renderer: function (val, metaData, record, rowIndex, colIndex, store) {
                    return shortThaiDate(val);
                },
            },
            {
                header: "ชื่อผู้แก้ไขรายการ",
                sortable: false,
                hidden: true,
                align: "center",
                dataIndex: "dc_user_update_name",
            },
            {
                header: "หน่วยงานแก้ไขรายการ",
                sortable: false,
                hidden: true,
                align: "center",
                dataIndex: "dc_user_update_cost_name",
            },
            {
                header: "วันที่แก้ไขรายการ",
                sortable: false,
                hidden: true,
                align: "center",
                dataIndex: "d_update",
                renderer: function (val, metaData, record, rowIndex, colIndex, store) {
                    return shortThaiDate(val);
                },
            },
        ];
    };
    gridSummary.superclass.constructor.call(this, {
        id: 'tabpanel0',
        title: '4.0 สรุปรวมรายการ ตรวจรับ/รับของ/สัญญา',
        region: "center",
        store: Ext.store,
        loadMask: true, trackMouseOver: false,
        stripeRows: true,
        cm: new Ext.grid.ColumnModel({
            columns: colmnn()
        }),
        viewConfig: {
            emptyText: "ไม่มีข้อมูล..",
            deferEmptyText: false
        },
//        columns: colmnn(),
        view: groupingView,
        frame: true,
        width: 700,
        height: 450,
        iconCls: 'icon-application-view-list',
        padding: "10px 10px 10px 10px",
        listeners: {
            beforender: function () {

            }, afterrender: function () {
                this.on("click", click = function (dataview, index) {

                    console.log(dataview);
                    console.log(this.selModel.selections.items[0].get('id'));
                    console.log(this.selModel.selections.items[0].get('c_name'));

                });
            }
        },
        bbar: [new Ext.PagingToolbar({
                pageSize: 40,
                store: Ext.store,
                displayInfo: true,
                displayMsg: "Displaying topics {0} - {1} of {2}",
            })],
        tbar: [{
                text: " ค้นหา ",
                width: 80,
                iconCls: "icon-application-view-list",
                handler: function () {
                    if (!Ext.isEmpty(Ext.getCmp("winSearchFrm")))
                        Ext.getCmp("winSearchFrm").destroy();
                    var s1 = Ext.SearchFrm();
                    s1.show();
                },
            }, '->', {
                text: '+/-แสดงข้อมูลตามสัญญา',
                iconCls: 'icon-add',
                enableToggle: true,
                handler: function () {
                    console.log(this.pressed);
                    if (this.pressed == true) {
                        var press = false;
                    } else {
                        var press = true;
                    }
                    groupingView.startCollapsed = press;
                    groupingView.toggleAllGroups(press); // Collapse all groups

                }
//            }, {
//                text: 'Clear Grouping',
//                iconCls: 'icon-clear-group',
//                handler: function () {
//                    store.clearGrouping();
//                }

            }],
//        renderTo: document.body
    });
}),
  Ext.grid.GridPanel,
  {}
);
