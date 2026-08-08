//Load
//Load

Ext.DidderAdd_Confirm = function (creditor_name, tax_number) {
    Ext.Ajax.request({
        url: "tor/api/mnTorController.php",
        method: "POST",
        params: {
            mode: "ADD_CREDITOR",
            dc_creditor_name: creditor_name,
            c_tax_number_imp: tax_number,
        },
        success: function (result, request) {
            let json = Ext.util.JSON.decode(result.responseText);
            Ext.storeCreditor.load({
                callback: function (record, operation, success) {
                    if (success) {
                    }
                },
            });
            Ext.getCmp("win-frm-DidderAdd").destroy();
            if (json.success == "Success") {
                Ext.Msg.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย");
            }
        },
        failure: function (result, request) {
            Ext.MessageBox.alert("Failed", result.responseText);
        },
    });
};
Ext.DidderAdd_Confirm1 = function (creditor_name, tax_number, Num, NameAll) {
    var win = new Ext.Window({
        labelWidth: 200,
        collapsible: false,
        maximizable: false,
        modal: true,
        title: "ยันยืนบันทึกรายการ",
        id: "win-frm-DidderConfirm",
        layout: "fit",
        border: false,
        width: 630,
        autoHeight: true,
        // height: 300,
        items: [
            {
                xtype: "form",
                id: "form-widgets-DidderConfirm",
                url: "tor/api/mnTorController.php",
                frame: true,
                labelAlign: "left",
                autoScroll: true,
                autoHeight: true,
                labelWidth: 130,
                bodyStyle: {padding: "10px 20px"},
                defaults: {msgTarget: "side"},
                items: [
                    {
                        xtype: "displayfield",
                        labelSeparator: ":",
                        fieldLabel: "เลขประจำตัวผู้เสียภาษี ",
                        value: "<b>" + tax_number + "</b>",
                    },
                    {
                        xtype: "displayfield",
                        style: {color: "red"},
                        fieldLabel: "มีรายการซ้ำ <font color='red'>(<b>" + Num + "</b> รายการ)</font> ",
                        value: NameAll + "<br>",
                    },
                    {
                        xtype: "displayfield",
                        labelSeparator: "",
                        fieldLabel: "<b>ต้องการจะเพิ่มรายการ </b>",
                        value: "<b> <font color='green'>" + creditor_name + "</font>&nbsp;&nbsp; ใช่หรื่อไม่?</b>",
                    },
                ],
                viewConfig: {forceFit: true},
            },
        ],
        // liesteners: {
        //   afterrender: function () {
        //     this.fn = function () {
        //       alert(this.getValue());
        //     };
        //     this.fn();
        //   },
        // },
        buttons: [
            {
                text: "ยันยืน",
                handler: function () {
                    msg = "";
                    if (msg == "") {
                        Ext.DidderAdd_Confirm(creditor_name, tax_number);
                        Ext.getCmp("win-frm-DidderConfirm").destroy();
                    } else {
                        Ext.Msg.alert("แจ้งเตือน", msg);
                    }

                    var form = Ext.getCmp("form-widgets-DidderConfirm").getForm();
                    if (form.isValid()) {
                        if (Ext.getCmp("modesubID").getValue().inputValue === "VIEW") {
                        } else if (Ext.getCmp("modesubID").getValue().inputValue === "DELETE") {
                            Ext.MessageBox.show({
                                title: "Icon Support",
                                msg: "คุณต้องการที่จะลบ รายการที่เลือกนี้ใช่ใหม ?",
                                buttons: Ext.MessageBox.OKCANCEL,
                                icon: Ext.MessageBox.WARNING,
                                fn: function (btn) {
                                    if (btn === "ok") {
                                        formSubmit(form);
                                    } else {
                                        return;
                                    }
                                },
                            });
                        } else {
                            if (msg == "") {
                                formSubmit(form);
                            }
                        }
                    }
                },
            },
            {
                text: Ext.GLOBAL_BU_BACK_TH, iconCls: "icon-back",
                handler: function () {
                    Ext.getCmp("win-frm-DidderConfirm").destroy();
                },
            },
        ],
    });

    win.show();
};
Ext.DidderAdd = function (evt, rec) {
    var win = new Ext.Window({
        labelWidth: 200,
        collapsible: false,
        maximizable: false,
        modal: true,
        title: "เพิ่มรายชื่อ",
        id: "win-frm-DidderAdd",
        layout: "fit",
        border: false,
        width: 630,
        height: 180,
        items: [
            {
                xtype: "form",
                id: "form-widgets-DidderAdd",
                url: "tor/api/mnTorController.php",
                frame: true,
                labelAlign: "left",
                autoScroll: true,
                labelWidth: 150,
                bodyStyle: {padding: "10px 20px"},
                defaults: {msgTarget: "side"},
                items: [
                    {
                        xtype: "hidden",
                        name: "mode",
                        value: "CHECK_CREDITOR",
                        readOnly: true,
                    },
                    {
                        //*--
                        xtype: "textfield",
                        id: "dc_creditor_nameID",
                        name: "dc_creditor_name",
                        width: 400,
                        fieldLabel: "ชื้อ",
                        // emptyText: "ชื้อ",
                    },
                    {
                        xtype: "textfield",
                        id: "c_tax_number_impID",
                        name: "c_tax_number_imp",
                        width: 150,
                        fieldLabel: "เลขประจำตัวผู้เสียภาษี",
                        // emptyText: "รหัสประจำตัวผู้เสียภาษี",
                    },
                ], //items จำนวนเงินรวมภาษีมูลค่าเพิ่ม
                viewConfig: {forceFit: true},
            },
        ], 
        buttons: [
            {
                text: "บันทึกผู้เสนอราคา",
                iconCls: "icon-save-darf",
                handler: function () {
                    msg = "";
                    if (Ext.getCmp("dc_creditor_nameID").getValue() == "") {
                        msg += "<span style='white-space: nowrap;'>- กรุณากรอกชื่อ</span><br>";
                    }
                    if (Ext.getCmp("c_tax_number_impID").getValue() == "") {
                        msg += "<span style='white-space: nowrap;'>- กรุณากรอกเลขประจำตัวผู้เสียภาษี</span><br>";
                    }

                    if (msg == "") {
                        var formSubmit = function () {
                            form.submit({
                                waitMsg: "Saving Data...",
                                success: function (form, action) {
                                    var creditor_name = action.result.dc_creditor_name;
                                    var tax_number = action.result.c_tax_number_imp;
                                    if (action.result.totalCount > 0) {
                                        var list_dc_creditor_name = "";
                                        var count = action.result.totalCount - 1;
                                        var i = 0;
                                        while (count >= i) {
                                            list_dc_creditor_name += "- " + action.result.data[i].dc_creditor_name + "<br>";
                                            i++;
                                        }
                                        Ext.DidderAdd_Confirm1(creditor_name, tax_number, action.result.totalCount, list_dc_creditor_name);
                                    } else {
                                        Ext.DidderAdd_Confirm(creditor_name, tax_number);
                                    }
                                },
                                failure: function (form, action) {
                                    switch (action.failureType) {
                                        case Ext.form.Action.CLIENT_INVALID:
                                            Ext.Msg.alert("Failure", "Form fields may not be submitted with invalid values");
                                            break;
                                        case Ext.form.Action.CONNECT_FAILURE:
                                            Ext.Msg.alert("Failure", "พลข้อผิดพลาดในการเชื่อต่อเครือข่าย");
                                            break;
                                        case Ext.form.Action.SERVER_INVALID:
                                            Ext.Msg.alert("Failure", action.result.msg);
                                    }
                                },
                            });
                        }; //END
                        var form = Ext.getCmp("form-widgets-DidderAdd").getForm();
                        if (form.isValid()) {
                            if (Ext.getCmp("modesubID").getValue().inputValue === "VIEW") {
                            } else if (Ext.getCmp("modesubID").getValue().inputValue === "DELETE") {
                                Ext.MessageBox.show({
                                    title: "Icon Support",
                                    msg: "คุณต้องการที่จะลบ รายการที่เลือกนี้ใช่ใหม ?",
                                    buttons: Ext.MessageBox.OKCANCEL,
                                    icon: Ext.MessageBox.WARNING,
                                    fn: function (btn) {
                                        if (btn === "ok") {
                                            formSubmit(form);
                                        } else {
                                            return;
                                        }
                                    },
                                });
                            } else {
                                if (msg == "") {
                                    formSubmit(form);
                                }
                            }
                        }
                    } else {
                        Ext.Msg.alert("แจ้งเตือน", msg);
                    }
                },
            },
            {
                text: Ext.GLOBAL_BU_BACK_TH, iconCls: "icon-back",
                handler: function () {
                    Ext.getCmp("win-frm-DidderAdd").destroy();
                },
            },
        ],
    });
    win.show();
};

Ext.store2 = new Ext.data.JsonStore({
    storeId: "myStore2",
    autoLoad: false,
    url: "tor/api/mnTorController.php",
    root: "data",
    baseParams: {mode: "LIST_SP_TOR_BIDDER_HDR", i_read: user_right_read}, //Permission i_read
    idProperty: "id",
    totalProperty: "totalCount",
    fields: [
        {name: "no"},
        {name: "sp_tor_bidder_hdr_id"},
        {name: "sp_tor_id"},
        {name: "dc_creditor_id"},
        {name: "c_tax_number_imp"},
        {name: "dc_creditor_name"},
        {name: "d_doc_date"},
        {name: "c_discription"},
        {name: "i_enable"},
        {name: "dc_user_create_id"},
        {name: "dc_user_create_cost_id"},
        {name: "dc_user_create_department_id"},
        {name: "d_create"},
        {name: "dc_user_update_id"},
        {name: "dc_user_update_cost_id"},
        {name: "dc_user_update_department_id"},
        {name: "d_update"},
        {name: "bid_count"},
    ],
});
Ext.store3 = new Ext.data.JsonStore({
    storeId: "myStore2",
    autoLoad: false,
    url: "tor/api/mnTorController.php",
    root: "data",
    baseParams: {mode: "LIST_BIDDER_DTL_in_TOR_DTL", i_read: user_right_read}, //Permission i_read
    idProperty: "id",
    totalProperty: "totalCount",
    fields: [
        {name: "no"},
        {name: "CheckColumn"},
        {name: "sp_tor_bidder_dtl_id"},
        {name: "sp_tor_dtl_id"},
        {name: "sp_tor_id"},
        {name: "c_name"},
        {name: "dc_expense_budget_type_name"},
        {name: "i_qty"},
        {name: "f_bid_unit_price"},
        {name: "f_bid_total_price", type: "float"},
        {name: "f_rate_vat", type: "float"},
        {name: "f_vat_amt", type: "float"},
        {name: "f_vat_edit_amt", type: "float"},
        {name: "f_total_add_vat_amt", type: "float"},
        /*
         อัตราภาษี: 7.00
         จำนวนที่คิดเงินภาษี: 70.00
         จำนวนเงินแก้ไขเงินภาษี: 0.02
         ราคารวม หลัง VAT: 1,069.98
         "f_rate_vat" => number_format('7', 2),
         "f_vat_amt" => number_format('0', 2),
         "f_vat_edit_amt" => number_format('0.02', 2),
         "f_total_add_vat_amt" => number_format('0', 2),
         */
        {name: "i_used"},
        {name: "i_balance"},
        {name: "dc_unit_type_id"},
        {name: "c_unit"},
        {name: "dc_bg_budget_type_id"},
        {name: "i_product_type"},
        {name: "i_is_inv"},
        {name: "po_expense_id"},
        {name: "dc_creditor_id"},
        {name: "i_hire_type"},
        {name: "f_disc_price"},
        {name: "f_unit_price"},
        {name: "f_total_price"},
        {name: "f_net_disc_price"},
        {name: "f_net_unit_price"},
        {name: "f_net_total_price"},
    ],
});
Ext.Poplov_in = Ext.extend(Ext.Button, {
    config: {},
    initComponent: function () {
        this.mini = this.Minipop();
        this.isCellClickGrid = false;
        this.isSetFilter = false;
        this.setReset();
    },

    setReset: function (t) {
        if (t) {
            Ext.getCmp(this.id + "_Name").setValue();
            Ext.getCmp(this.id).setValue();
        }
    },
    afterrender: function () {},
    uiSearch: function (id) {
        var store = this.store;
        var headerGrid = this.headerGrid;
        var id = id;

        var setDefaultFilter = [
            ["c_tax_number_imp", "เลขที่ประจำตัวผู้เสียภาษี"],
            ["c_name", "ชื่อ"],
        ];
        var setFilter = [["c_name", "ชื่อ"]];

        var filterGrid = new Ext.data.SimpleStore({
            fields: ["value", "text"],
            data: this.isSetFilter ? setFilter : setDefaultFilter,
        });
        var store = this.store;

        var filterGrid = Ext.isEmpty(this.filterGrid) ? filterGrid : this.filterGrid; //comb&store filter
        var defFilter = this.defFilter; //default filter

        return [
            {
                id: "filter" + id,
                xtype: "combo",
                width: 130,
                mode: "local",
                store: filterGrid,
                valueField: "value",
                displayField: "text",
                allowBlank: false,
                editable: false,
                triggerAction: "all",
                typeAhead: false,
                value: Ext.isEmpty(defFilter) ? "c_tax_number_imp" : defFilter,
            },
            "-",
            {
                id: "value-box" + id,
                xtype: "textfield",
                width: 130,
                fieldLabel: "fieldLabel",
                emptyText: "คำที่ต้องการค้นหา",
                listeners: {
                    specialkey: function (f, e) {
                        if (e.getKey() == e.ENTER) {
                            store.setBaseParam("type", "SEARCH");
                            store.setBaseParam("filter", Ext.getCmp("filter" + id).getValue());
                            store.setBaseParam("value", Ext.getCmp("value-box" + id).getValue());
                            Ext.getCmp("win-pop-lov-modal-" + id)
                                    .getStore()
                                    .load();
                        }
                    },
                },
            },
        ];
    },

    Minipop: function () {
        /******/
        var store = this.store;
        var headerGrid = this.headerGrid;
        var id = this.id;
        var nameID = this.id + "_Name";
        var widthText = isNaN(this.widthText) ? 198 : this.widthText;
        var uiSearch = this.uiSearch(id);

        /*****/
        function SearchGrid(store, id) {
            if (Ext.getCmp("value-box" + id).getValue() != "") {
                store.setBaseParam("type", "SEARCH");
                store.setBaseParam("filter", Ext.getCmp("filter" + id).getValue());
                store.setBaseParam("value", Ext.getCmp("value-box" + id).getValue());
                Ext.getCmp("win-pop-lov-modal-" + id)
                        .getStore()
                        .load();
            } else {
                store.setBaseParam("type", "");
                Ext.getCmp("win-pop-lov-modal-" + id)
                        .getStore()
                        .load();
            }
        }

        var cellClick_lov = function (grid, rowIndex, columnIndex, e) {
            var record = grid.getStore().getAt(rowIndex);
            var TextShow = record.data.c_tax_number_imp + " " + record.data.c_name;
            Ext.getCmp(id).setValue(record.data.id);
            Ext.getCmp(nameID).setValue(TextShow);

            Ext.getCmp("win-pop-lov" + id).hide();
            Ext.getCmp("win-pop-lov" + id).destroy();
        };

        cellClick_lov = this.isCellClickGrid ? this.cellClickGrid : cellClick_lov;
        //*++
        return {
            fieldLabel: this.fieldLabel,
            xtype: "radiogroup",
            id: "pop_" + this.id,
            columns: [0, widthText, 40],
            hidden: this.hidden == true ? true : false,
            listeners: {
                afterrender: this.afterrender,
            },
            items: [
                {
                    xtype: "hidden",
                    name: this.valueHidden,
                    id: id,
                    value: this.value,
                },
                {
                    xtype: "textfield",
                    name: "txt" + this.id,
                    emptyText: this.text,
                    id: nameID,
                    readOnly: true,
                },
                {
                    xtype: "button",
                    id: "Bu" + this.id,
                    name: "Bu" + this.id,
                    iconCls: this.iconCls,
                    handler: function () {
                        /* //Load Store Begin SearchGrid */
                        store.setBaseParam("type", "");
                        store.load();

                        var win = new Ext.Window({
                            id: "win-pop-lov" + id,
                            title: "เลือกข้อมูล",
                            modal: true,
                            plain: true,
                            layout: "fit",
                            maximizable: true,
                            constrainHeader: true,
                            closable: true,
                            listeners: {
                                afterrender: function (obj, eOpts) {
                                    this.fn = function (widht, height) {
                                        //percentage
                                        var width = Ext.getBody().getViewSize().width * widht;
                                        var height = Ext.getBody().getViewSize().height * height;
                                        this.setSize(width, height);
                                    };
                                    this.fn(0.8, 0.85);
                                },
                                maximize: function (window, opts) {
                                    //when property minimizable
                                    window.setWidth(Ext.getBody().getViewSize().width * 0.99);
                                    window.expand("", false);
                                    window.center();
                                },
                            },
                            items: [
                                {
                                    xtype: "grid",
                                    id: "win-pop-lov-modal-" + id,
                                    border: false,
                                    stripeRows: true,
                                    loadMask: true,
                                    store: store,
                                    tbar: [
                                        uiSearch,
                                        " ",
                                        "-",
                                        {
                                            text: "ค้นหา",
                                            id: "magnifier_" + id,
                                            iconCls: "icon-magnifier",
                                            handler: function () {
                                                SearchGrid(store, id);
                                            },
                                        },
                                        "->",
                                        {
                                            id: "buBackSub2ID",
                                            xtype: "button",
                                            iconCls: "icon-add",
                                            text: "เพิ่มรายชื่อ",
                                            disabled: true,

                                            handler: function () {
                                                //*--
                                                Ext.DidderAdd();
                                                // Ext.getCmp("winChequeID").setActiveTab(0);
                                            },
                                        },
                                    ],
                                    columns: headerGrid,
                                    listeners: {
                                        afterrender: function (obj, eOpts) {
                                            this.fn = function (widht, height) {
                                                //percentage

                                                var width = Ext.getBody().getViewSize().width * widht;
                                                var height = Ext.getBody().getViewSize().height * height;
                                                this.setSize(width, height);
                                            };
                                            this.fn(0.5, 0.4);
                                        },
                                    },
                                    autoExpandColumn: "c_name",
                                    bbar: new Ext.PagingToolbar({
                                        pageSize: 20,
                                        store: store,
                                        displayInfo: true,
                                        displayMsg: "Displaying topics {0} - {1} of {2}",
                                    }),
                                },
                            ],
                        });

                        win.show();
                        Ext.getCmp("win-pop-lov-modal-" + id).on("cellclick", cellClick_lov, this);
                    },
                },
            ],
        };
    }, //Mini
});
Ext.storeCreditor = new Ext.data.JsonStore({
    //autoLoad: true,
    storeId: "myStoreCont",
    url: "tor/api/mnTorController.php",
    baseParams: {mode: "LIST_POP_CREDITOR", id: 0},
    root: "data",
    idProperty: "id",
    totalProperty: "totalCount",
    fields: [{name: "no"}, {name: "dc_creditor_id"}, {name: "c_tax_number_imp"}, {name: "c_name"}],
});
var columnMini = [
    {
        header: "ID System",
        sortable: true,
        hidden: true,
        dataIndex: "dc_creditor_id",
    },
    {
        header: "",
        sortable: true,
        hidden: true,
        dataIndex: "c_code",
    },
    {
        header: "เลขที่ประจำตัวผู้เสียภาษี",
        align: "center",
        width: 150,
        sortable: true,
        dataIndex: "c_tax_number_imp",
    },
    {
        header: "ชื่อ",
        sortable: true,
        id: "c_name",
        dataIndex: "c_name",
        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
            metaData.attr = "style='cursor:pointer';";
            return value;
        },
    },
];
var PopCreditorForm = new Ext.Poplov_in({
    text: "เลือกผู้เสนอราคา",
    id: "dc_creditor_idID",
    iconCls: "page_magnify",
    valueHidden: "dc_creditor_id",
    store: Ext.storeCreditor,
    headerGrid: columnMini,
    widthText: 400,
    fieldLabel: "เลือกผู้เสนอราคา",
    isCellClickGrid: true,
    cellClickGrid: function (grid, rowIndex, columnIndex, e) {
        var id = "dc_creditor_idID";
        var nameID = id + "_Name";
        var record = grid.getStore().getAt(rowIndex);
        var c_tax_number_imp = record.data.c_tax_number_imp == null ? "(ไม่มีเลขที่ประจำตัวผู้เสียภาษี)" : record.data.c_tax_number_imp;
        var TextShow = c_tax_number_imp + " : " + record.data.c_name;
        Ext.getCmp("dc_creditor_idID").setValue(record.data.dc_creditor_id);
        // Ext.getCmp("d_start_dateID").setValue(record.data.d_doc_date);
        // Ext.getCmp("d_end_dateID").setValue(record.data.d_due_date);
        // var f_total = parseFloat(record.data.f_total_amt.replace(/,/g, "") / 1);
        // Ext.getCmp("f_total_amtID").setValue(Ext.floatRenderer(f_total));
        Ext.getCmp(nameID).setValue(TextShow);
        Ext.getCmp("win-pop-lov" + id).hide();
        Ext.getCmp("win-pop-lov" + id).destroy();
    },
});
Ext.AppConfig();
//interlizing
Ext.menuCode = "ST0006"; //go to
Ext.title = "" + Ext.menuCode;
var AppPoStore = function (statuss) {


    var colPOP = [
        new Ext.grid.RowNumberer({width: 35, header: " No ", dataIndex: "no"}),
        {header: "ID System", hidden: true, dataIndex: "dc_creditor_id"},
        {
            header: "-",
            align: "center",
            dataIndex: "creditor_name",
            width: 58,
            id: "detailBidder",
            renderer: function (value, metaData, record, row, col, store, gridView) {
                return "<button>รายละเอียดเสนอราคา</button>";
            },
        },
        {
            header: "เลขประจำตัวผู้เสียภาษี",
            align: "center",
            dataIndex: "c_tax_number_imp",
            width: 50,
        },
        {
            header: "ชื่อ",
            align: "left",
            dataIndex: "dc_creditor_name",
            width: 150,
        },

        {
            header: "แก้ไข",
            sortable: false,
            hideable: false,
            draggable: false,
            align: "center",
            id: "edit_bidder_hdr",
            width: 15,
            dataIndex: "id",
            renderer: function (value, metaData, record, row, col, store, gridView) {
                return '<img src="../images/icons/document_edit.gif"); style="cursor:pointer"/>';
            },
        },
        {
            id: "delete_bidder_hdr",
            header: "ลบ",
            sortable: false,
            align: "center",
            width: 10,
            dataIndex: "id",
            renderer: function (value, metaData, record, row, col, store, gridView) {
                return '<img src="../images/icons/table_delete.png"); style="cursor:pointer"/>';
            },
        },
        {width: 10, dataIndex: ""},
    ];
    var comboCost = new Ext.form.ComboBox({
        mode: "local",
        readOnly: true,
        store: Ext.dc_cost,
        anchor: "98%",
        fieldLabel: "หน่วยงานที่รับผิดชอบ",
        valueField: "id",
        displayField: "c_name",
        hiddenName: "dc_cost_id",
        name: "c_cost_name",
        triggerAction: "all",
        forceSelection: true,
        selectOnFocus: true,
        typeAhead: false,
        emptyText: "กรุณาเลือก...",
        validator: function (val) {
            if (!Ext.isEmpty(val)) {
                return true;
            } else {
                return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
            }
        },
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
            },
        },
    });
    var comboCost2 = new Ext.form.ComboBox({
        mode: "local",
        store: Ext.dc_cost,
        anchor: "98%",
        readOnly: true,
        value: Ext.costID,
        fieldLabel: "หน่วยงานเจ้าของเรื่อง",
        valueField: "id",
        displayField: "c_name",
        hiddenName: "dc_cost2_id",
        name: "c_cost_name",
        triggerAction: "all",
        forceSelection: true,
        selectOnFocus: true,
        typeAhead: false,
        emptyText: "กรุณาเลือก...",
        validator: function (val) {
            if (!Ext.isEmpty(val)) {
                return true;
            } else {
                return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
            }
        },
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
            },

        }
    });

    var comboUsedBgYear = new Ext.form.ComboBox({
        mode: "local",
        readOnly: true,
        fieldLabel: "ปีงบประมาณ",
        submitValue: true,
        hiddenName: "i_yyyy",
        name: "i_year",
        store: Ext.store_year,
        valueField: "id",
        displayField: "c_name",
        value: Ext.bgYear,
        triggerAction: "all",
        forceSelection: true,
        selectOnFocus: true,
        typeAhead: false,
        emptyText: "กรุณาเลือกปีงบประมาณ...",
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
            },
        },
    });


    var statusx = statuss;

    if (statusx == "add") {
        Ext.getCmp("tabpanel1").getSelectionModel().clearSelections();
    }
    // var typeTor = ;
    var bgProject = new Ext.form.ComboBox({
        mode: "local",
        store: Ext.bgProject,
        id: "projectID",
        anchor: "100%",
        fieldLabel: "ชื่อโครงการ",
        submitValue: true,
        hiddenName: "bg_budget_dtl_project_id",
        name: "c_budget_dtl_project_id",
        valueField: "id",
        displayField: "c_name",
        triggerAction: "all",
        forceSelection: false,
        selectOnFocus: true,
        typeAhead: false,
        emptyText: "กรุณาเลือก",
        validator: function (val) {
            if (!Ext.isEmpty(val)) {
                return true;
            } else {
                return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
            }
        },
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
            },
        },
    });
    var col1 = [
        new Ext.grid.RowNumberer({width: 35, header: " No ", dataIndex: "no"}),
        {header: "ID System", hidden: true, dataIndex: "id"},
        {header: "งวดที่", align: "center", dataIndex: "i_seq", width: 10},
        {
            header: "วันที่ส่งมอบ",
            align: "center",
            dataIndex: "d_period_date",
            width: 25,
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                if (value == "รวม") {
                    metaData.attr = "style='font-weight:bold;color:blue'; align='right'";
                    return Ext.floatRenderer(value);
                } else {
                    metaData.attr = "";
                    if (record.get("i_is_dtl")) {
                        return "";
                    } else {
                        return DategetShortDateMonthName(value);
                    }
                }
            },
        },
        {
            header: "รายละเอียด จัดซื้อ",
            dataIndex: "c_name",
            width: 35,
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                if (value.substring(0, 3) == "รวม") {
                    metaData.attr = "style='font-weight:bold;color:blue'; align='right'";
                } else {
                    metaData.attr = "";
                }
                return value; //DategetShortDateMonthName(value);
            },
        },
        {header: "จำนวน", dataIndex: "f_quan", width: 20, align: "right"},
        {header: "ก่อน VAT", dataIndex: "f_unit_cost", align: "right", width: 25},
        {header: "รวม VAT", dataIndex: "f_unit_cost_vat", align: "right", width: 25},
        {
            header: "บันทึกรายละเอียดในงวดงาน",
            sortable: false,
            hideable: false,
            draggable: false,
            align: "center",
            id: "edit21",
            width: 25,
            dataIndex: "id",
            renderer: function (value, metaData, record, row, col, store, gridView) {
                if (record.get("id") == "grandtotal" || record.get("i_is_dtl")) {
                    return "";
                } else {
                    if (record.get("buStatus") == true) {
                        return '<img src="../images/icons/document_edit.gif"); style="cursor:pointer"/>';
                    } else {
                        return record.get("buStatus");
                    }
                }
            },
        },
    ];

    var disp = false ? "displayfield" : "textfield";
    if (!Ext.isEmpty(Ext.getCmp("winChequeID"))) {
        Ext.getCmp("winChequeID").destroy();
    }

    return new Ext.Window({
        collapsible: true,
        maximizable: true,
        title: Ext.title, 
        id: "winMain",
        width: Ext.getCmp("contenterCenter").getWidth() - 5,
        height: Ext.getCmp("contenterCenter").getHeight() - 5,
        layout: "fit",
        modal: true,
        plain: true,
        bodyStyle: "padding:1px;",
        buttonAlign: "center",
        items: [
            {
                xtype: "tabpanel",
                activeTab: 0,
                id: "winChequeID",
                // defaults: {autoHeight: true, bodyStyle: 'padding:10px'},
                items: [
                    new Ext.FormPanel({
                        title: "รายละเอียด PR",
                        id: Ext.poFormID,
                        columnWidth: 1,
                        url: "tor/api/mnTorController.php",
                        frame: true,
                        autoScroll: true,
                        labelAlign: "left",
                        bodyStyle: "padding:1px",
                        labelWidth: 120,
                        listeners: {
                            afterrender: function () {
                                Ext.getCmp("i_pr_type1ID").setValue(Ext.selectRow.json.i_pr_type1);
                                Ext.getCmp("i_pr_type2ID").setValue(Ext.selectRow.json.i_pr_type2);
                                Ext.getCmp("i_pr_type3ID").setValue(Ext.selectRow.json.i_pr_type3);
                                Ext.getCmp("f_type_amtID").setValue(Ext.selectRow.json.f_total_amt);
                                Ext.getCmp("f_type_amtID2").setValue(Ext.selectRow.json.f_type2_amt);
                                Ext.getCmp("f_type_amtID3").setValue(Ext.selectRow.json.f_type3_amt);
                            },
                        },
                        items: [
                            {
                                layout: "column",
                                border: false,
                                items: [
                                    {
                                        columnWidth: 0.5,
                                        layout: "form",
                                        border: true,
                                        items: [
                                            {
                                                xtype: "hidden",
                                                name: "id",
                                                id: "torHdrID", //i_is_more
                                            },
                                            {
                                                xtype: "hidden",
                                                name: "dc_emp_id",
                                                id: "dc_emp_idID", //i_is_more
                                            },
                                            {
                                                xtype: "hidden",
                                                name: "sp_emp_id",
                                                id: "sp_emp_idID", //i_is_more
                                            },
                                            {
                                                xtype: "hidden",
                                                name: "dc_department_id",
                                                id: "dc_department_idID", //i_is_more
                                            },
                                            {
                                                xtype: disp,
                                                readOnly: true,
                                                fieldLabel: "รหัส PR",
                                                id: "codeHdrID",
                                                style: "text-align: center;font-weight:bold;background:#eee;", 
                                                name: "c_code",
                                            },
                                            {
                                                xtype: "textarea",
                                                width: 500,
                                                height: 45,
                                                // readOnly: true,
                                                fieldLabel: "เรื่อง/โครงการ",
                                                name: "c_name",
                                            },
                                            comboUsedBgYear,
                                            // { xtype: "displayfield", fieldLabel: "ชื่อโครงการ", name: "c_budget_dtl_project" },
                                            comboCost,
                                            comboCost2,
                                            {
                                                xtype: "buttongroup",
                                                fieldLabel: "วันที่",
                                                frame: false,
                                                border: false,
                                                items: [
                                                    {
                                                        xtype: "datefield",
                                                        name: "d_tor_date",
                                                        readOnly: true,
                                                        validator: function (val) {
                                                            if (!Ext.isEmpty(val)) {
                                                                return true;
                                                            } else {
                                                                return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                                            }
                                                        },
                                                    },
                                                    {
                                                        xtype: "tbspacer",
                                                        width: 18,
                                                    },
                                                    {
                                                        xtype: "label",
                                                        style: {
                                                            color: "red",
                                                            width: "100px",
                                                        },
                                                        text: "* วันที่ตามเอกสาร PR",
                                                    },
                                                ],
                                            },
                                            {
                                                xtype: "combo",
                                                readOnly: true,
                                                mode: "local",
                                                store: Ext.torType,
                                                anchor: "40%",
                                                fieldLabel: "วิธีดำเนินงาน",
                                                submitValue: true,
                                                hiddenName: "tor_type_id",
                                                name: "c_type_id",
                                                id: "tor_type_idID",
                                                valueField: "id",
                                                displayField: "c_name",
                                                triggerAction: "all",
                                                forceSelection: false,
                                                selectOnFocus: true,
                                                typeAhead: false,
                                                emptyText: "กรุณาเลือก",
                                                validator: function (val) {
                                                    if (!Ext.isEmpty(val)) {
                                                        return true;
                                                    } else {
                                                        return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                                    }
                                                },
                                                listeners: {
                                                    afterrender: function () {
                                                        this.fn = function () {
                                                            if (this.getValue() == 1) {
                                                                //tor_type_id === 1 (เจาะจง)
                                                                Ext.getCmp("lableLessID").show();
                                                            } else {
                                                                Ext.getCmp("lableLessID").hide();
                                                            }
                                                        };
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
                                                    },
                                                },
                                            },
                                            {
                                                xtype: "displayfield",
                                                fieldLabel: "แบบ ",
                                                name: "lableLess",
                                                value: Ext.tor_type_idTxt.tor_type_id1[Ext.i_is_more], //i_is_more
                                                id: "lableLessID",
                                                listeners: {
                                                    beforerender: function () {},
                                                    afterrender: function () {
                                                        this.fn = function () {
                                                            var tor_type_idID = Ext.getCmp("tor_type_idID").getValue();
                                                            if (Ext.getCmp("tor_type_idID").getValue() != 1) {
                                                                this.hide();
                                                            } else {
                                                                this.show();
                                                            }
                                                        };
                                                        this.fn();
                                                    },
                                                },
                                            },
                                            {
                                                xtype: "buttongroup",
                                                fieldLabel: "จำนวนเงิน",
                                                frame: false,
                                                border: false,
                                                items: [
                                                    {
                                                        xtype: "textfield",
                                                        readOnly: true,
                                                        fieldLabel: "จำนวนเงิน",
                                                        name: "f_total_amt",
                                                        id: "f_totalID",
                                                        listeners: {
                                                            blur: function () {
                                                                this.fn();
                                                            },
                                                            afterrender: function () {
                                                                this.fn = function () {
                                                                    var val = 0;
                                                                    val = this.getValue();
                                                                    var f_total = parseFloat(val.replace(/,/g, "") / 1);
                                                                    this.setValue(Ext.floatRenderer(f_total));
                                                                };
                                                                this.fn();
                                                            },
                                                        },
                                                    },
                                                ],
                                            },
                                            {
                                                xtype: "textfield",
                                                readOnly: true,
                                                fieldLabel: "รหัสเอกสารอ้างอิง",
                                                name: "d_doc_ref",
                                            },
                                            {
                                                xtype: "buttongroup",
                                                fieldLabel: "วันที่บันทีกแจ้งเตือน",
                                                frame: false,
                                                border: false,
                                                items: [
                                                    {
                                                        xtype: "datefield",
                                                        name: "DateAdd1",
                                                        validator: function (val) {
                                                            if (!Ext.isEmpty(val)) {
                                                                return true;
                                                            } else {
                                                                return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                                            }
                                                        },
                                                    },
                                                    {
                                                        xtype: "tbspacer",
                                                        width: 18,
                                                    },
                                                    {
                                                        xtype: "label",
                                                        style: {
                                                            color: "red",
                                                            width: "100px",
                                                        },
                                                        text: "* แจ้งเตือน จากวันถัดไป " + Ext.menu_i_alarm + " วัน",
                                                    },
                                                ],
                                            },
                                            {
                                                xtype: "buttongroup",
                                                fieldLabel: "วันที่บันทีก PA",
                                                frame: false,
                                                border: false,
                                                items: [
                                                    {
                                                        xtype: "datefield",
                                                        name: "DateAdd2",
                                                        validator: function (val) {
                                                            if (!Ext.isEmpty(val)) {
                                                                return true;
                                                            } else {
                                                                return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                                            }
                                                        },
                                                    },
                                                    {
                                                        xtype: "tbspacer",
                                                        width: 18,
                                                    },
                                                    {
                                                        xtype: "label",
                                                        style: {
                                                            color: "red",
                                                            width: "150px",
                                                        },
                                                        text: "* นับ PA จากวันถัดไป " + Ext.menu_i_day + " วัน",
                                                    },
                                                ],
                                            },
                                            {
                                                fieldLabel: "วันที่บันทึก",
                                                xtype: "datefield",
                                                name: "d_tor_status_date",
                                                validator: function (val) {
                                                    if (!Ext.isEmpty(val)) {
                                                        return true;
                                                    } else {
                                                        return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                                    }
                                                },
                                            },
                                            {
                                                xtype: "textarea",
                                                width: 400,
                                                name: "c_comment",
                                            },
                                            Ext.getBodyMultiBudget(Ext.selectRow, 'st0005'),
                                            {
                                                xtype: "radiogroup",
                                                columns: [180],
                                                fieldLabel: "โหมดการบันทึก",
                                                id: "modesubID",
                                                hidden: true,
                                                style: {
                                                    "font-weight": "bold",
                                                },
                                                items: [
                                                    {
                                                        name: "mode",
                                                        checked: true,
                                                        inputValue: "UPDATEFORMSTSATUS",
                                                        boxLabel: "อัพเดทรายการ",
                                                    },
                                                ],
                                            },
                                        ]
                                    },
                                    {
                                        columnWidth: 0.5,
                                        layout: "form",
                                        autoScroll: true, // เพิ่ม Scrollbar ทั้งแนวนอนและแนวตั้ง  
                                        items:[    {
                                xtype: "grid",
                                id: "gridSub1ID",
                                title:"ผู้เสนอราคา",
                                stripeRows: true,
                                frame: true,
                                loadMask: true, 
                                autoScroll: true, 
                                border: false,  
                                height: 500,
                                store: Ext.store2,
                                tbar: [
                                    {
                                        xtype: "button",
                                        iconCls: "icon-add",
                                        text: "เพิ่มผู้เสนอราคา",
                                        handler: function () {
                                            Ext.SP_TOR_BIDDER_HDR_ID = null;
                                            Ext.DidderHdr();
                                            //*--
                                            // var i_edit_type = document.getElementsByName("i_edit_type");
                                            // i_edit_type[0].checked = true;
                                        },
                                    },
                                ],
                                listeners: {
                                    beforerender: function () {
                                        Ext.DidderHdr = function (evt, rec) {
                                            var win = new Ext.Window({
                                                labelWidth: 175,
                                                collapsible: true,
                                                maximizable: true,
                                                modal: true,
                                                title: "เพิ่มผู้เสนอราคา",
                                                id: "win-frm-contractID",
                                                layout: "fit",
                                                border: false,
                                                width: 630,
                                                height: 135,
                                                items: [
                                                    {
                                                        xtype: "form",
                                                        id: "form-widgets",
                                                        url: "tor/api/mnTorController.php",
                                                        frame: true,
                                                        labelAlign: "left",
                                                        autoScroll: true,
                                                        labelWidth: 100,
                                                        bodyStyle: {padding: "10px 20px"},
                                                        defaults: {msgTarget: "side"},
                                                        items: [
                                                            // {
                                                            //   id: "role-form-mode",
                                                            //   xtype: "hidden",
                                                            //   name: "mode",
                                                            //   value: "ADD",
                                                            //   readOnly: true,
                                                            // },
                                                            {
                                                                xtype: "hidden",
                                                                name: "id",
                                                                // value: Ext.selectRow.data.id,
                                                                id: "idID",
                                                            },
                                                            {
                                                                xtype: "hidden",
                                                                name: "sp_tor_id",
                                                                value: Ext.SP_TOR_ID,
                                                            },
                                                            {
                                                                xtype: "hidden",
                                                                name: "sp_tor_bidder_hdr_id",
                                                                value: Ext.SP_TOR_BIDDER_HDR_ID,
                                                            },
                                                            {
                                                                xtype: "hidden",
                                                                name: "mode",
                                                                value: "UP_SP_TOR_BIDDER_HDR",
                                                                readOnly: true,
                                                            },
                                                            {
                                                                xtype: "compositefield",
                                                                id: "dc_creditor_idID_pop",
                                                                fieldLabel: "เลือกผู้เสนอราคา",
                                                                msgTarget: "side",
                                                                anchor: "20",
                                                                defaults: {
                                                                    flex: 1,
                                                                },
                                                                items: [PopCreditorForm.mini],
                                                            },
                                                        ], //items จำนวนเงินรวมภาษีมูลค่าเพิ่ม
                                                        viewConfig: {forceFit: true},
                                                    },
                                                ],
                                                // liesteners: {
                                                //   afterrender: function () {
                                                //     this.fn = function () {
                                                //       alert(this.getValue());
                                                //     };
                                                //     this.fn();
                                                //   },
                                                // },
                                                buttons: [
                                                    {
                                                        text: "บันทึกผู้เสนอราคา",
                                                        iconCls: "icon-save-darf",
                                                        handler: function () {
                                                            msg = "";
                                                            if (Ext.getCmp("dc_creditor_idID").getValue() == "") {
                                                                msg += "<span style='white-space: nowrap;'>- กรุณาเลือกผู้เสนอราคา</span><br>";
                                                            } else {
                                                                var Row = 0;
                                                                var RowMax = Ext.store2.data.length - 1;
                                                                var RowCreditor = Ext.store2.data.items;
                                                                var NewCreditor = Ext.getCmp("dc_creditor_idID").getValue();
                                                                while (RowMax >= Row) {
                                                                    if (RowCreditor[Row].data.dc_creditor_id == NewCreditor) {
                                                                        msg += "<span style='white-space: nowrap;'>- มีผู้เสนอราคารายนี้แล้ว</span><br>";
                                                                        break;
                                                                    }
                                                                    Row++;
                                                                }
                                                            }
                                                            if (msg == "") {
                                                                var formSubmit = function () {
                                                                    form.submit({
                                                                        waitMsg: "Saving Data...",
                                                                        success: function (form, action) {
                                                                            Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                                                                Ext.getCmp("gridSub1ID").getStore().reload();
                                                                                // Ext.selectRow = null;
                                                                                Ext.getCmp("win-frm-contractID").destroy();
//                                                                                autoOpen
//                                                                                
//                                                                                
//                                                                                Ext.SP_TOR_BIDDER_HDR_ID = Ext.SelectStore.data.sp_tor_bidder_hdr_id;
//                                                                                Ext.DidderHdr("edit_bidder_hdr", record);
//                                                                                var c_tax_number_imp = Ext.SelectStore.data.c_tax_number_imp == null ? "(ไม่มีเลขประจำตัวผู้เสียภาษี)" : Ext.SelectStore.data.c_tax_number_imp;
//                                                                                Ext.getCmp("dc_creditor_idID_Name").setValue(c_tax_number_imp + " : " + Ext.SelectStore.data.dc_creditor_name);
//                                                                                Ext.getCmp("dc_creditor_idID").setValue(Ext.SelectStore.data.dc_creditor_id);
                                                                            });
                                                                        },
                                                                        failure: function (form, action) {
                                                                            switch (action.failureType) {
                                                                                case Ext.form.Action.CLIENT_INVALID:
                                                                                    Ext.Msg.alert("Failure", "Form fields may not be submitted with invalid values");
                                                                                    break;
                                                                                case Ext.form.Action.CONNECT_FAILURE:
                                                                                    Ext.Msg.alert("Failure", "พลข้อผิดพลาดในการเชื่อต่อเครือข่าย");
                                                                                    break;
                                                                                case Ext.form.Action.SERVER_INVALID:
                                                                                    Ext.Msg.alert("Failure", action.result.msg);
                                                                            }
                                                                        },
                                                                    });
                                                                }; //END
                                                            } else {
                                                                Ext.Msg.alert("แจ้งเตือน", msg);
                                                            }

                                                            var form = Ext.getCmp("form-widgets").getForm();
                                                            if (form.isValid()) {
                                                                if (msg == "") {
                                                                    formSubmit(form);
                                                                }
                                                            }
                                                        },
                                                    },
                                                    {
                                                        text: Ext.GLOBAL_BU_BACK_TH, iconCls: "icon-back",
                                                        handler: function () {
                                                            Ext.getCmp("win-frm-contractID").destroy();
                                                        },
                                                    },
                                                ],
                                            });

                                            win.show();
                                        };
                                        function TabNext(rec, event) {
                                            if (event == "view") {
                                                // Ext.store3.setBaseParam("tor_id", Ext.HDR_ID);
                                                // Ext.store3.setBaseParam("dc_creditor_id", rec.get("id"));
                                                // Ext.store3.load({
                                                //   callback: function (record, operation, success) {
                                                // if (success) {

                                                Ext.getCmp("winChequeID").setActiveTab(1);
                                                Ext.getCmp("tabpanelMain2ID").setTitle(rec.get("dc_creditor_name"));
                                                Ext.getCmp("winChequeID").unhideTabStripItem(1);
                                                // console.log(Ext.store3); ////
                                                //     }
                                                //   },
                                                // });
                                            }
                                        }

                                        this.thisCick = function (grid, rowIndex, columnIndex, e) {
                                            var record = grid.getStore().getAt(rowIndex);
                                            Ext.SelectStore = Ext.store2.getAt(rowIndex);
                                            // Ext.store2.setBaseParam("tor_id", Ext.HDR_ID);
                                            if (columnIndex === grid.getColumnModel().getIndexById("detailBidder")) {
                                                Ext.SP_TOR_BIDDER_HDR_ID = Ext.SelectStore.data.sp_tor_bidder_hdr_id;
                                                Ext.DC_CREDITOR_ID = Ext.SelectStore.data.dc_creditor_id;
                                                Ext.store3.setBaseParam("sp_tor_id", Ext.SP_TOR_ID);
                                                Ext.store3.setBaseParam("dc_creditor_id", Ext.DC_CREDITOR_ID);
                                                Ext.store3.setBaseParam("sp_tor_bidder_hdr_id", Ext.SP_TOR_BIDDER_HDR_ID);
                                                Ext.store3.load();
                                                TabNext(record, "view"); //on
                                            } else if (columnIndex === grid.getColumnModel().getIndexById("edit_bidder_hdr")) {
                                                Ext.SP_TOR_BIDDER_HDR_ID = Ext.SelectStore.data.sp_tor_bidder_hdr_id;
                                                Ext.DidderHdr("edit_bidder_hdr", record);
                                                var c_tax_number_imp = Ext.SelectStore.data.c_tax_number_imp == null ? "(ไม่มีเลขประจำตัวผู้เสียภาษี)" : Ext.SelectStore.data.c_tax_number_imp;
                                                Ext.getCmp("dc_creditor_idID_Name").setValue(c_tax_number_imp + " : " + Ext.SelectStore.data.dc_creditor_name);
                                                Ext.getCmp("dc_creditor_idID").setValue(Ext.SelectStore.data.dc_creditor_id);
                                            } else if (columnIndex === grid.getColumnModel().getIndexById("delete_bidder_hdr")) {
                                                Ext.SP_TOR_BIDDER_HDR_ID = Ext.SelectStore.data.sp_tor_bidder_hdr_id;
                                                delete_bidder_hdr();
                                            }
                                        };
                                    },
                                    afterrender: function () {
                                        Ext.getCmp("gridSub1ID").on("cellclick", this.thisCick, this);
                                    },
                                },
                                columns: colPOP,
                                viewConfig: {forceFit: true},
                            }]
                                    },
                                ],
                            },
                        
                        ],
                    }),
                    {
                        title: "",
                        frame: true,
                        autoScroll: true,
                        id: "tabpanelMain2ID",
                        iconCls: "icon-contract",
                        layout: "form", //form
                        border: false,
                        // viewConfig: { forceFit: true },
                        items: [
                            new Ext.grid.GridPanel({
                                id: "gridEditor2",
                                region: "center",
                                layout: "fit",
                                border: false,
                                stripeRows: true,
                                loadMask: true,
                                height: 1000,
                                clicksToEdit: 1,
                                // disableSelection: true,
                                store: Ext.store3,
                                viewConfig: {
                                    forceFit: true,
                                    emptyText: "ไม่มีข้อมูล..",
                                    deferEmptyText: false,
                                    /*getRowClass: function (record) {
                                     
                                     if (record.data.CheckColumn == true && record.data.sp_tor_bidder_dtl_id != null) {
                                     return "td-succeed ";
                                     } else if (record.data.CheckColumn == true && record.data.sp_tor_bidder_dtl_id == null) {
                                     return "td-wait ";
                                     }
                                     },*/
                                },
                                listeners: {
                                    beforerender: function () {
                                        this.thisCick = function (grid, rowIndex, columnIndex, e) {
                                            var record = grid.getStore().getAt(rowIndex);
                                            if (columnIndex === grid.getColumnModel().getIndexById("cancel_bidder_dtl")) {
                                                if (record.data.sp_tor_bidder_dtl_id != null) {
                                                    cancel_bidder_dtl(record.data.sp_tor_bidder_dtl_id);
                                                }
                                            } else if (columnIndex === grid.getColumnModel().getIndexById("edit_bidder_dtl")) {
                                                if (record.data.sp_tor_bidder_dtl_id == null) {
                                                    var winEdit = edit_bidder_dtl(record, rowIndex);
                                                    winEdit.show();
                                                } else {
                                                    var winEdit2 = edit_bidder_dtl(record, rowIndex);
                                                    winEdit2.show();
                                                    Ext.getCmp("f_rate_vatID").setValue(Ext.floatRenderer(record.get("f_rate_vat")));
                                                    Ext.getCmp("f_vat_amtID").setValue(Ext.floatRenderer(record.get("f_vat_amt")));

                                                    Ext.getCmp("f_vat_edit_amtID").setValue(Ext.floatRenderer(record.get("f_vat_edit_amt")) || "0.00");
                                                    Ext.getCmp("f_total_add_vat_amtID").setValue(Ext.floatRenderer(record.get("f_total_add_vat_amt")));
                                                }
                                            }
                                        };
                                    },
                                    afterrender: function () {
                                        Ext.getCmp("gridEditor2").on("cellclick", this.thisCick, this);
                                    },
                                },
                                columns: [
                                    new Ext.grid.RowNumberer({
                                        header: "ที่",
                                        dataIndex: "no",
                                        sortable: false,
                                        id: "idID",
                                        width: 30,
                                        renderer: function (value, metaData, record, row, col, store, gridView) {
                                            metaData.attr = "style='cursor:pointer; text-align:center;';";
                                            return record.get("no");
                                        },
                                    }),
                                    // { width: 35, header: " ที่ ", align: "center", dataIndex: "no" },
                                    {header: "ID System", hidden: true, dataIndex: "sp_tor_bidder_dtl_id"},
                                    {
                                        // header: "<div class='topAlign'><input id='checkAll' type='checkbox' onchange='checkAll(this.checked)'></div>",
                                        header: "-",
                                        sortable: false,
                                        align: "center",
                                        dataIndex: "CheckColumn",
                                        width: 30,
                                        renderer: function (value, metaData, record, row, col, store, gridView) {
                                            // metaData.style="background-color:#ffaaaa !important;";
                                            // metaData.attr = 'style="background-color:#FFE0D2 !important;"';
                                            // metaData.style = "background:#FFE0D2;";
                                            var checked = value ? "checked" : "";
                                            var readonly = record.data.sp_tor_bidder_dtl_id != null ? "disabled" : "";
                                            return "<input style='margin-top:3px; margin-bottom:2px;' type='checkbox' onchange='checkID(" + row + ")' id='chk_" + row + "' value='" + value + "' " + checked + " " + readonly + "> ";
                                        },
                                    },
                                    {
                                        header: "ราคาต่อหน่วย(รวมVAT)",
                                        sortable: false,
                                        dataIndex: "f_bid_unit_price",
                                        align: "center",
                                        width: 114,
                                        renderer: function (value, metaData, record, row, col, store, gridView) {
                                            // metaData.attr = 'style="background-color:#FFE0D2 !important;"';
                                            var V = value > 0 ? floatMinus(value, 2) : "";
                                            var readonly = value > 0 ? "readonly" : "";
                                            return (
                                                    "<input placeholder='' type='text' autocomplete='off' style='font-size: 12px; text-align:right; width:95%;' onchange='change_f_bid(1," +
                                                    row +
                                                    ")' id='f_bid" +
                                                    row +
                                                    "' value='" +
                                                    V.replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
                                                    "' " +
                                                    readonly +
                                                    ">"
                                                    );
                                        },
                                    },
                                    {
                                        header: "ราคาเสนอ (รวม VAT)",
                                        dataIndex: "f_bid_total_price",
                                        sortable: false,
                                        align: "center",
                                        width: 114,
                                        renderer: function (value, metaData, record, row, col, store, gridView) {
                                            // metaData.attr = 'style="background-color:#FFE0D2 !important;"';
                                            var V = value > 0 ? floatMinus(value, 2) : "";
                                            var readonly = value > 0 ? "readonly" : "";

                                            return (
                                                    "<input placeholder='' type='text' autocomplete='off' style='font-size: 12px; text-align:right; width:95%; ' onchange='change_f_bid(2," +
                                                    row +
                                                    ")' id='f_bid_total" +
                                                    row +
                                                    "' value='" +
                                                    V.replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
                                                    "' " +
                                                    readonly +
                                                    ">"
                                                    );
                                        },
                                    },
                                    {
                                        header: "รายการ",
                                        sortable: false,
                                        dataIndex: "c_name",
                                        width: 200,
                                    },
                                    {
                                        header: "แหล่งเงิน",
                                        sortable: false,
                                        dataIndex: "dc_expense_budget_type_name",
                                        width: 200,
                                    },
                                    {
                                        header: "จำนวน",
                                        sortable: false,
                                        align: "center",
                                        dataIndex: "i_qty",
                                        width: 70,
                                    },
                                    {
                                        header: "จำนวนเงินก่อน VAT",
                                        sortable: false,
                                        align: "right",
                                        dataIndex: "f_total_add_vat_amt",
                                        width: 120,
                                        renderer: function (value, metaData, record, row, col, store, gridView) {
                                            var V = value > 0 ? floatMinus(value, 2) : "";
                                            var readonly = value > 0 ? "readonly" : "readonly";
                                            var inp = "";

                                            inp += "<input type='hidden' id='f_rate_vat" + row + "' value='" + record.get("f_rate_vat") + "'>";
                                            inp += "<input type='hidden' id='f_vat_amt" + row + "' value='" + record.get("f_vat_amt") + "'>";
                                            inp += "<input type='hidden' id='f_vat_edit_amt" + row + "' value='" + record.get("f_vat_edit_amt") + "'>";
                                            // inp += record.get('f_total_add_vat_amt');
                                            inp +=
                                                    "<input placeholder='' type='text' autocomplete='off' style='font-weight:bold;color:blue;font-size: 12px; text-align:right; width:95%; ' id='f_total_add_vat_amt" +
                                                    row +
                                                    "' value='" +
                                                    V.replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
                                                    "' " +
                                                    readonly +
                                                    ">";

                                            return inp;
                                        },
                                    },
                                    {
                                        id: "edit_bidder_dtl",
                                        header: "คิดภาษีแยก",
                                        sortable: false,
                                        align: "center",
                                        width: 50,
                                        dataIndex: "id",
                                        renderer: function (value, metaData, record, row, col, store, gridView) {
                                            if (record.data.sp_tor_bidder_dtl_id == null) {
                                                return '<img src="../images/icons/table_edit.png"); style="cursor:pointer"/>';
                                            } else {
                                                return '<img src="../images/icons/table_add.png"); style="cursor:pointer"/>';
                                            }
                                        },
                                    },
                                    {
                                        id: "cancel_bidder_dtl",
                                        header: "ยกเลิก",
                                        sortable: false,
                                        align: "center",
                                        width: 40,
                                        dataIndex: "id",
                                        renderer: function (value, metaData, record, row, col, store, gridView) {
                                            if (record.data.sp_tor_bidder_dtl_id != null) {
                                                return '<img src="../images/icons/table_delete.png"); style="cursor:pointer"/>';
                                            }
                                        },
                                    },
                                    {width: 20, dataIndex: ""},
                                ],
                            }),
                        ],

                        bbar: [
                            {
                                text: "&nbsp;" + Ext.GLOBAL_BU_SAVE_TH + "รายละเอียดฯ&nbsp;",
                                id: "saveDtl",
                                iconCls: "icon-save",
                                handler: function () {
                                    saveDtl = function (mode) {
                                        let msg = "";
                                        let jsonArr = [];
                                        var num = Ext.getCmp("gridEditor2").store.data.items.length - 1;
                                        var row = 0;
                                        while (num >= row) {
                                            if (document.getElementById("chk_" + row).checked == true && Ext.getCmp("gridEditor2").store.data.items[row].data.sp_tor_bidder_dtl_id == null) {
                                                jsonArr.push({
                                                    sp_tor_bidder_hdr_id: Ext.SP_TOR_BIDDER_HDR_ID,
                                                    sp_tor_id: Ext.getCmp("gridEditor2").store.data.items[row].data.sp_tor_id,
                                                    c_name: Ext.getCmp("gridEditor2").store.data.items[row].data.c_name,
                                                    dc_unit_type_id: Ext.getCmp("gridEditor2").store.data.items[row].data.dc_unit_type_id,
                                                    sp_tor_dtl_id: Ext.getCmp("gridEditor2").store.data.items[row].data.sp_tor_dtl_id,
                                                    dc_creditor_id: Ext.DC_CREDITOR_ID,
                                                    i_qty: Ext.getCmp("gridEditor2").store.data.items[row].data.i_qty,
                                                    f_unit_price: document.getElementById("f_bid" + row).value.replace(/\,/g, ''),
                                                    f_total_price: document.getElementById("f_bid_total" + row).value.replace(/\,/g, ''),
                                                    f_rate_vat: document.getElementById("f_rate_vat" + row).value.replace(/\,/g, ''),
                                                    f_vat_amt: document.getElementById("f_vat_amt" + row).value.replace(/\,/g, ''),
                                                    f_vat_edit_amt: document.getElementById("f_vat_edit_amt" + row).value.replace(/\,/g, ''),
                                                    f_total_add_vat_amt: document.getElementById("f_total_add_vat_amt" + row).value.replace(/\,/g, ''),
                                                });
                                                if (document.getElementById("f_bid" + row).value < 1) {
                                                    msg += "<span style='white-space: nowrap;'>- กรุณากรอกราคาเสนอ</span><br>";
                                                    break;
                                                }
                                            }
                                            row++;
                                        }
                                        if (jsonArr.length <= 0) {
                                            msg += "<span style='white-space: nowrap;'>- กรุณาเลือกรายการ</span><br>";
                                        }
                                        if (msg == "") {
                                            // Ext.getCmp("win-frm-perid-bal-dtlID").getEl().mask("Please wait...", "x-mask-loading");
                                            Ext.Ajax.request({
                                                url: "tor/api/mnTorController.php",
                                                method: "POST",
                                                params: {
                                                    mode: "UP_SP_TOR_BIDDER_DTL",
                                                    data: JSON.stringify(jsonArr),
                                                },
                                                success: function (result, request) {
                                                    // Ext.getCmp("win-frm-perid-bal-dtlID").getEl().unmask();
                                                    let json = Ext.util.JSON.decode(result.responseText);
                                                    Ext.Msg.alert("แจ้งเตือน", json.msg);
                                                    Ext.store3.setBaseParam("sp_tor_id", Ext.SP_TOR_ID);
                                                    Ext.store3.setBaseParam("dc_creditor_id", Ext.DC_CREDITOR_ID);
                                                    Ext.store3.setBaseParam("sp_tor_bidder_hdr_id", Ext.SP_TOR_BIDDER_HDR_ID);
                                                    Ext.store3.load({
                                                        callback: function (record, operation, success) {
                                                            if (success) {
                                                                Ext.store2.setBaseParam("sp_tor_id", Ext.SP_TOR_ID);
                                                                Ext.store2.load();
                                                            }
                                                        },
                                                    });

                                                    if (json.success == true) {
                                                        Ext.Msg.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย");
                                                    }
                                                },
                                                failure: function (result, request) {
                                                    Ext.MessageBox.alert("Failed", result.responseText);
                                                },
                                            });
                                        } else {
                                            Ext.Msg.alert("แจ้งเตือน", msg);
                                        }
                                    };
                                    saveDtl("SAVE_DTL");
                                },
                            },
                            {
                                id: "buBackSub2ID",
                                xtype: "button",
                                iconCls: "icon-back",
                                text: "ย้อนกลับ",
                                handler: function () {
                                    Ext.getCmp("winChequeID").setActiveTab(0);
                                },
                            },
                        ],
                    },
                ],
                                        buttonAlign: "center",
                                        buttons: [
                                            {
                                                                                text: "บันทึกร่าง PR",
                                iconCls: "icon-save-darf",
                                name: 'buDarf', //i_is_regirster 0 show else 1 
                                handler: function () {
//                                    var form = Ext.getCmp(Ext.poFormID).getForm();
//                                    Ext.getCmp('buSaveSubID').formSubmit(form);
                                       Ext.example.msg("แจ้งเตือน", "ใบร่างกำลังอยู่ในการปรับปรุง", 5);
                                }
                            },
                            {
                                                text: "บันทึกรายการ",
                                                id: "buSaveSubID",
                                                iconCls: "icon-save",
                                                handler: function () {
                                                    var msg = "";
                                                    if (Ext.store2.data.length == 0) {
                                                        msg += "<span style='white-space: nowrap;'>- กรุณาเพิ่มผู้เสนอราคา</span><br>";
                                                    } else if (Ext.store2.sum("bid_count") == 0) {
                                                        msg += "<span style='white-space: nowrap;'>- กรุณากรอกรายละเอียดเสนอราคา</span><br>";
                                                    }
                                                    if (msg == "") {
                                                        var formSubmit = function () {
                                                            form.submit({
                                                                waitMsg: "Saving Data...",
                                                                success: function (form, action) {
                                                                    Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                                                        Ext.getCmp("tabpanel1").getStore().reload();
                                                                        Ext.selectRow = null;
                                                                        Ext.getCmp("winMain").destroy();
                                                                    });
                                                                },
                                                                failure: function (form, action) {
                                                                    switch (action.failureType) {
                                                                        case Ext.form.Action.CLIENT_INVALID:
                                                                            Ext.Msg.alert("Failure", "Form fields may not be submitted with invalid values");
                                                                            break;
                                                                        case Ext.form.Action.CONNECT_FAILURE:
                                                                            Ext.Msg.alert("Failure", "พลข้อผิดพลาดในการเชื่อต่อเครือข่าย");
                                                                            break;
                                                                        case Ext.form.Action.SERVER_INVALID:
                                                                            Ext.Msg.alert("Failure", action.result.msg);
                                                                    }
                                                                },
                                                            });
                                                        }; //END

                                                        var form = Ext.getCmp(Ext.poFormID).getForm();
                                                        if (form.isValid()) {
                                                            if (Ext.getCmp("modesubID").getValue().inputValue === "VIEW") {
                                                            } else if (Ext.getCmp("modesubID").getValue().inputValue === "DELETE") {
                                                                Ext.MessageBox.show({
                                                                    title: "Icon Support",
                                                                    msg: "คุณต้องการที่จะลบ รายการที่เลือกนี้ใช่ใหม ?",
                                                                    buttons: Ext.MessageBox.OKCANCEL,
                                                                    icon: Ext.MessageBox.WARNING,
                                                                    fn: function (btn) {
                                                                        if (btn === "ok") {
                                                                            formSubmit(form);
                                                                        } else {
                                                                            return;
                                                                        }
                                                                    },
                                                                });
                                                            } else {
                                                                formSubmit(form);
                                                            }
                                                        }
                                                    } else {
                                                        Ext.Msg.alert("แจ้งเตือน", msg);
                                                    }
                                                },
                                                //haddler
                                            },
                                            {
                                                text: Ext.GLOBAL_BU_BACK_TH, iconCls: "icon-back",
                                                handler: function () {
                                                    Ext.getCmp("winMain").hide();
                                                    Ext.getCmp("winMain").destroy();
                                                },
                                            },
                                        ],
            },
        ], listeners: {
            beforrender: function () {


            },
            afterrender: function () {
                Ext.getCmp('tabpanel1').getEl().unmask();Ext.application.setHideName('buDarf',Ext.selectRow.get('i_is_register')?1:0); Ext.application.afterRender(this);
            }
        }
    });
};
function edit_bidder_dtl(rec, row) {
    var rowID = row;
    console.log(rec);
    return new Ext.Window({
        id: "win-pop-lov" + rec.get("id"),
        title: "เลือกข้อมูล",
        modal: true,
        plain: true,
        layout: "fit",
        maximizable: true,
        constrainHeader: true,
        closable: true,
        listeners: {
            afterrender: function (obj, eOpts) {
                this.fn = function (widht, height) {
                    //percentage
                    var width = Ext.getBody().getViewSize().width * widht;
                    var height = Ext.getBody().getViewSize().height * height;
                    this.setSize(width, height);
                };
                this.fn(0.4, 0.35);
            },
            maximize: function (window, opts) {
                //when property minimizable
                window.setWidth(Ext.getBody().getViewSize().width * 0.99);
                window.expand("", false);
                window.center();
            },
        },
        items: new Ext.FormPanel({
            labelAlign: "left",
            bodyStyle: "padding:1px",
            id: "frm-calID",
            labelWidth: 150,
            items: [
                {
                    xtype: "displayfield",
                    fieldLabel: "ราคารวม VAT",
                    name: "f_total_amt",
                    id: "f_total_amtID",
                    value: "<b style='font-size:16px;'>  0.00</b>",
                },
                {
                    xtype: "textfield",
                    fieldLabel: "อัตราภาษี",
                    name: "f_rate_vat",
                    id: "f_rate_vatID",
                    value: "7.00",
                    listeners: {
                        blur: function () {
                            Ext.getCmp("frm-calID").calItems();
                        },
                        afterrender: function () {
                            Ext.getCmp("frm-calID").calItems();
                        },
                    },
                },
                {
                    xtype: "textfield",
                    fieldLabel: "จำนวนที่คิดเงินภาษี",
                    name: "f_vat_amt",
                    id: "f_vat_amtID",
                    value: "0.00",
                    listeners: {
                        blur: function () {
                            Ext.getCmp("frm-calID").calItems();
                        },
                        afterrender: function () {
                            Ext.getCmp("frm-calID").calItems();
                        },
                    },
                },
                {
                    xtype: "textfield",
                    fieldLabel: "จำนวนเงินแก้ไขเงินภาษี",
                    name: "f_vat_edit_amt",
                    id: "f_vat_edit_amtID",
                    value: "0.00",
                    listeners: {
                        blur: function () {
                            Ext.getCmp("frm-calID").calItems();
                        },
                        afterrender: function () {
                            Ext.getCmp("frm-calID").calItems();
                        },
                    },
                },
                {
                    xtype: "displayfield",
                    fieldLabel: "เงินก่อนรวมภาษี",
                    name: "f_total_add_vat_amt",
                    id: "f_total_add_vat_amtID",
                    value: "<b style='font-size:16px;'> 0.00</b>",
                },
            ],
            listeners: {
                afterrender: function () {
                    this.setCalItems = function () {
                        //                            alert(rowID);
                        document.getElementById("f_rate_vat" + rowID).value = Ext.getCmp("f_rate_vatID").getValue();
                        document.getElementById("f_vat_amt" + rowID).value = Ext.getCmp("f_vat_amtID").getValue();
                        document.getElementById("f_vat_edit_amt" + rowID).value = Ext.getCmp("f_vat_edit_amtID").getValue();
                        document.getElementById("f_total_add_vat_amt" + rowID).value = Ext.getCmp("f_total_add_vat_amtID").getValue();
                    };
                    this.calItems = function () {
                        //  Ext.getCmp('f_total_amtID').setValue(f_unit_price);
                        var f_total_price = document.getElementById("f_bid_total" + row).value.replace(/\,/g, '');
                        Ext.getCmp("f_total_amtID").setValue(Ext.floatRenderer(f_total_price));

                        var f_amt = parseFloat(Ext.getCmp("f_total_amtID").getValue().replace(/,/g, "") / 1);
                        var f_rate = parseFloat(Ext.getCmp("f_rate_vatID").getValue().replace(/,/g, "") / 1);
                        var vat = f_amt - (f_amt * 100 / (f_rate + 100));
                        vat = vat.toFixed(2);

                        Ext.getCmp("f_vat_amtID").setValue(Ext.floatRenderer(vat));
                        var f_vat_edit = parseFloat(Ext.getCmp("f_vat_edit_amtID").getValue().replace(/,/g, "") / 1);
                        var total = Number.parseFloat((f_amt - (vat + f_vat_edit))).toFixed(2);
                        Ext.getCmp("f_total_add_vat_amtID").setValue(Ext.floatRenderer(total));
                    };
                },
            },
            buttonAlign: "left",
            buttons: [
                {
                    text: "&nbsp;" + Ext.GLOBAL_BU_SAVE_TH + "รายละเอียดฯ&nbsp;",
                    id: "saveDtl",
                    iconCls: "icon-save",
                    handler: function () {
                        Ext.getCmp("frm-calID").setCalItems();
                        Ext.getCmp("win-pop-lov" + rec.get("id")).destroy();
                        // saveDtl("SAVE_DTL");
                    },
                },
                {
                    id: "buBackSub2ID",
                    xtype: "button",
                    iconCls: "icon-back",
                    text: "ย้อนกลับ",
                    handler: function () {
                        Ext.getCmp("win-pop-lov" + rec.get("id")).destroy();
                    },
                },
            ],
        }),
    });
}
Ext.loadStore = function (status, show) {
    var statusx = status;
    var winx = show;
    if (statusx === "edit" && Ext.isEmpty(Ext.selectRow))
        Ext.Msg.alert("แจ้งเตือน", "กรุณา click เลือกข้อมูลที่จะแก้ไขใน data grid", function (form, action) {
            return false;
        });
    else
        Ext.dc_cost.reload({
            callback: function (recordx, operation, success) {
                if (success) {
                    Ext.po_emp.reload({
                        callback: function (recordx, operation, success) {
                            if (success) {
                                Ext.po_user_permission.reload({
                                    callback: function (recordx, operation, success) {
                                        if (success) {
                                            Ext.dc_expense_budget_type.reload({
                                                callback: function (recordx, operation, success) {
                                                    if (success) {
                                                        Ext.po_expense_group.reload({
                                                            callback: function (recordx, operation, success) {
                                                                if (success) {
                                                                    Ext.po_expense.reload({
                                                                        callback: function (recordx, operation, success) {
                                                                            if (success) {
                                                                                //AppPoStore(statusx).show();

                                                                                if (statusx == "add") {
                                                                                    Ext.SP_TOR_ID = null;
                                                                                    var winApp = AppPoStore(statusx);
                                                                                    winApp.show();
                                                                                } else if (statusx === "edit") {
                                                                                    Ext.SP_TOR_ID = Ext.selectRow.data.id;
                                                                                    Ext.store2.setBaseParam("sp_tor_id", Ext.SP_TOR_ID);
                                                                                    Ext.store2.load();
                                                                                    if (!Ext.selectRow.get("po_expense_id"))
                                                                                        Ext.selectRow.set("po_expense_id", null);
                                                                                    if (!Ext.selectRow.get("po_creditor_id"))
                                                                                        Ext.selectRow.set("po_creditor_id", null);
                                                                                    if (!Ext.selectRow.get("dc_expense_budget_type_id"))
                                                                                        Ext.selectRow.set("dc_expense_budget_type_id", null);
                                                                                    if (!Ext.selectRow.get("bg_budget_dtl_project_id"))
                                                                                        Ext.selectRow.set("bg_budget_dtl_project_id", null);
                                                                                    if (!Ext.selectRow.get("dc_department_id"))
                                                                                        Ext.selectRow.set("dc_department_id", null);
                                                                                    if (!Ext.selectRow.get("dc_cost_id"))
                                                                                        Ext.selectRow.set("dc_cost_id", null);

                                                                                    var winApp = AppPoStore(statusx);
                                                                                    Ext.getCmp("winChequeID").items.items[0].getForm().loadRecord(Ext.selectRow);
                                                                                    winApp.show();
                                                                                    Ext.getCmp("winChequeID").hideTabStripItem(1);
                                                                                }

                                                                                //
                                                                            }
                                                                        },
                                                                    }); //po_expense
                                                                }
                                                            },
                                                        }); //po_expense_group
                                                    }
                                                },
                                            }); //dc_expense_budget_type
                                        }
                                    },
                                }); //po_user_permission
                            }
                        },
                    }); //po_emp
                }
            },
        });
};