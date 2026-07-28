

text_dc_expense_budget = function () {
    var dc_budget_NUM = Ext.dc_expense_budget_in_tor.data.length;
    var sum_f_total_dc_expense_budget_in_tor = 0;
    var text_dc_expense_budget = "<table width='100%' border='0' cellspacing='0' cellpadding='0'><thead valign='top'></thead>";
    var style = "";
    Ext.sum_minus = 0;

    for (table_loop = 1; dc_budget_NUM >= table_loop; table_loop++) {
        var f_sum_monthly_hdr = 0;
        var dc_expense_budget_in_tor_id = Ext.dc_expense_budget_in_tor.data.items[table_loop - 1].data.id;
        var sum_expense_budget = 0;
        for (i_sum_loop = 1; Ext.sp_gl_monthly_dtl.data.length >= i_sum_loop; i_sum_loop++) {
            if (Ext.sp_gl_monthly_dtl.data.items[i_sum_loop - 1].data.dc_expense_budget_type_id == dc_expense_budget_in_tor_id) {
                var f_month_total = Ext.sp_gl_monthly_dtl.data.items[i_sum_loop - 1].data.f_month_total.replace(/,/g, "");
                sum_expense_budget = sum_expense_budget + parseFloat(f_month_total);
            }
            f_sum_monthly_hdr = f_sum_monthly_hdr + parseFloat(Ext.sp_gl_monthly_dtl.data.items[i_sum_loop - 1].data.f_month_total.replace(/,/g, ""));
        }
        var c_name_dc_expense_budget_in_tor = Ext.dc_expense_budget_in_tor.data.items[table_loop - 1].data.c_name;
        var f_total_dc_expense_budget_in_tor = Ext.dc_expense_budget_in_tor.data.items[table_loop - 1].data.f_total - sum_expense_budget;
        // var style = f_total_dc_expense_budget_in_tor < 0 ? "color:red;" : "color:green;";
        if (f_total_dc_expense_budget_in_tor < 0) {
            style = "color:red;";
            Ext.sum_minus = 1;
        } else {
            style = "color:green;";
        }
        // Ext.sum_minus = f_total_dc_expense_budget_in_tor < 0 ? "color:red;" : "color:green;";
        text_dc_expense_budget += "<tr><td style='' align='right'>" + table_loop + ".&nbsp;</td>";
        text_dc_expense_budget += "<td style='' align='left'>" + c_name_dc_expense_budget_in_tor + "</td>";
        text_dc_expense_budget += "<td style='" + style + "' align='right'>" + Ext.util.Format.number(parseFloat(f_total_dc_expense_budget_in_tor), "0,000.00") + "</td></tr>";
        sum_f_total_dc_expense_budget_in_tor = sum_f_total_dc_expense_budget_in_tor + f_total_dc_expense_budget_in_tor;
    }
    var style = sum_f_total_dc_expense_budget_in_tor < 0 ? "color:red;" : "color:green;";
    text_dc_expense_budget += "<td style='' align='left'></td>";
    text_dc_expense_budget += "<td style='' align='left'><b><u>เงินรวม :</u></b></td>";
    text_dc_expense_budget += "<td style='" + style + "' align='right'><b><u>" + Ext.util.Format.number(parseFloat(sum_f_total_dc_expense_budget_in_tor), "0,000.00") + "</u></b></td></tr>";
    text_dc_expense_budget += "</thead></table>";
    Ext.getCmp("f_sum_monthly_hdr").setValue(Ext.util.Format.number(parseFloat(f_sum_monthly_hdr), "0,000.00"));
    if (parseFloat(f_sum_monthly_hdr) == Ext.getCmp("f_totalID").getValue().replace(/,/g, "")) {
        Ext.get("f_sum_monthly_hdr").setStyle("color", "green");
        Ext.not_equal = 0;
    } else {
        Ext.get("f_sum_monthly_hdr").setStyle("color", "red");
        Ext.not_equal = 1;
    }
    return text_dc_expense_budget;
    // Ext.getCmp("text_dc_expense_budget").update(text_dc_expense_budget);
};
GenCode_CTS = function () {
    var date_Ymd = Ext.util.Format.date(Ext.getCmp("d_contract_dateID").getValue(), "Ymd").substr(2);
    var date_Ym = date_Ymd.substr(0, 4);
    var date_dd = date_Ymd.substr(4);

    console.log(Ext.selectRow.data.i_purchase); //สัญญาซื้อ 1f_totalID
    console.log(date_Ym); //สัญญาลงวันที่ 2
    console.log(date_dd); //สัญญาลงวันที่ 3
    console.log(Ext.selectRow.data.tor_type_id); //ประเภท 4
    console.log(Ext.selectRow.data.dc_expense_budget_type_id); //แหล่งเงิน 5
    console.log(Ext.selectRow.data.i_type_fix_rate == 0 ? 1 : 2); //สัญญาปกติ,สัญญาย่อย 6
    var msg = "";
    if (msg == "") {
        Ext.Ajax.request({
            url: "tor/api/mnContractCode.php",
            method: "POST",
            params: {
                mode: "GENCODECST",
                id: Ext.HDR_ID,
                sp_tor_contract_id: Ext.SelectStore.data.sp_tor_contract_id,
                i_type_0: Ext.selectRow.data.i_purchase,
                ym_0: date_Ym,
                dd_0: date_dd,
                sp_typ_id_0: Ext.selectRow.data.tor_type_id,
                bg_type_id_0: Ext.selectRow.data.dc_expense_budget_type_id,
                contract_type_0: Ext.selectRow.data.i_type_fix_rate == 0 ? 1 : 2,
            },
            success: function (result, request) {
                // Ext.getCmp("win-frm-dtlID").destroy();
                Ext.store2.setBaseParam("tor_id", Ext.HDR_ID);
                Ext.store2.load({
                    callback: function (recordx, operation, success) {
                        if (success) {
                            Ext.Msg.alert("แจ้งเตือน", "บันทึกเรียบร้อย");
                            Ext.getCmp("win-frm-contractID").destroy();
                            // if (type == "SAVE_DTL") {
                            //   var inputEl = Ext.getCmp("gridSub5ID").getView().scroller.dom;
                            //   inputEl.scrollTop = inputEl.scrollHeight;
                            // }
                        }
                    },
                });
            },
        });
    } else {
        Ext.Msg.alert("แจ้งเตือน", msg);
    }
};
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
Ext.AppUx = function (app, menu) {
    Ext.storeCreditor = new Ext.data.JsonStore({
        //autoLoad: true,
        storeId: "myStoreCont",
        url: "tor/api/mnTorController.php",
        baseParams: {mode: "LIST_POP_CREDITOR_VICTORY"},
        root: "data",
        idProperty: "id",
        totalProperty: "totalCount",
        fields: [{name: "no"}, {name: "dc_creditor_id"}, {name: "c_tax_number_imp"}, {name: "c_name"}, {name: "f_total_price"}],
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
        {
            header: "วงเงิน",
            align: "right",
            width: 150,
            sortable: true,
            dataIndex: "f_total_price",
        },
    ];
    var columnMini2 = [
        {header: "ID System", sortable: true, hidden: true, dataIndex: "id"},
        {header: "รหัสหมวดสินทรัพย์", sortable: true, dataIndex: "c_code"},
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
            Ext.getCmp("f_totalID").setValue(record.data.f_total_price);
            Ext.getCmp("dc_creditor_idID").setValue(record.data.dc_creditor_id);
            Ext.getCmp(nameID).setValue(TextShow);
            Ext.getCmp("win-pop-lov" + id).hide();
            Ext.getCmp("win-pop-lov" + id).destroy();
        },
    });
    Ext.storeBank = new Ext.data.JsonStore({
        autoLoad: true,
        storeId: "myStoreCost",
        url: "api/All_ArCombo.php",
        baseParams: {type: "storeBank"},
        root: "data",
        idProperty: "id",
        totalProperty: "totalCount",
        fields: ["no", "id", "c_code", "c_name"],
    });
    Ext.AppConfig();
    //interlizing
    Ext.menuCode = "ST00099"; //go to
    Ext.storeDtl.setBaseParam("type_menu", 2); //set สายงาน
    //
    Ext.status = Ext.runStatus(menu);
    //Load
    var AppPoStore = function (statuss) {
        var comboCost = new Ext.form.ComboBox({
            mode: "local",
            readOnly: true,
            store: Ext.dc_cost,
            anchor: "100%",
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
        var comboTypeBg = new Ext.form.ComboBox({
            mode: "local",
            readOnly: true,
            store: Ext.dc_expense_budget_type,
            fieldLabel: "แหล่งเงิน",
            anchor: "100%",
            submitValue: true,
            name: "dc_expense_budget_type_idTxt",
            hiddenName: "dc_expense_budget_type_id",
            //po_expense_group_id
            valueField: "id",
            displayField: "c_name",
            triggerAction: "all",
            forceSelection: true,
            selectOnFocus: true,
            typeAhead: false,
            emptyText: "กรุณาเลือกแหล่งเงิน...",
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
        var comboUsedBgYear = new Ext.form.ComboBox({
            mode: "local",
            readOnly: true,
            fieldLabel: "ใช้เงินปีงบประมาณ",
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
        var comboExpense = new Ext.form.ComboBox({
            mode: "local",
            readOnly: true,
            store: Ext.po_expense,
            valueField: "id",
            displayField: "c_name",
            anchor: "100%",
            submitValue: true,
            name: "c_detail",
            hiddenName: "po_expense_id",
            triggerAction: "all",
            allBlank: true,
            forceSelection: true,
            selectOnFocus: true,
            fieldLabel: "รายการย่อย",
            width: 200,
            typeAhead: false,
            emptyText: "กรุณาเลือกใช้จ่าย...",
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

        var statusx = statuss;

        if (statusx == "add") {
            Ext.getCmp("tabpanel1").getSelectionModel().clearSelections();
        }

        Ext.storeUnitType = new Ext.data.JsonStore({
            autoDestroy: false,
            autoLoad: true,
            url: "api/All_PoWorkingImpHdr.php",
            baseParams: {
                type: "dc_unit_type",
            },
            root: "data",
            idProperty: "id",
            fields: ["id", "c_code", "c_name"],
        });
        //คูสัญญา
        Ext.store1 = new Ext.data.JsonStore({
            storeId: "myStore2",
            autoLoad: false,
            url: "tor/api/mnTorController.php",
            root: "data",
            baseParams: {mode: "LISTCREDITOR2", i_read: user_right_read}, //Permission i_read
            idProperty: "id",
            totalProperty: "totalCount",
            fields: [
                {name: "no"},
                {name: "id", type: "int"},
                {name: "sp_tor_id", type: "int"},
                {name: "dc_creditor_id", type: "int"},
                {name: "f_total_amt", type: "string"},
                {name: "c_name", type: "string"},
                {name: "i_enable", type: "int"},
                {name: "dc_user_create_id"},
                {name: "dc_user_create_cost_id"},
                {name: "d_create"},
                {name: "dc_user_update_id"},
                {name: "dc_user_update_cost_id"},
                {name: "d_update"},
            ],
        }); //dc_creditor
        //เลขสัญญา
        Ext.store2 = new Ext.data.JsonStore({
            storeId: "myStore2",
            autoLoad: false,
            url: "tor/api/mnTorController.php",
            root: "data",
            baseParams: {mode: "LISTCREDITOR2", i_read: user_right_read}, //Permission i_read
            idProperty: "id",
            totalProperty: "totalCount",
            fields: [
                {name: "no"},
                {name: "id"},
                {name: "c_code"},
                {name: "sp_tor_id"},
                {name: "sp_tor_contract_id"},
                {name: "creditor_name", type: "string"},
                {name: "c_tax_number_imp", type: "string"},
                {name: "c_name", type: "string"},
                {name: "d_doc_date0", type: "string"},
                {name: "d_due_date", type: "string"},
                {name: "c_doc_ref", type: "string"},
                {name: "dc_creditor_id"},
                {name: "f_total_amt", type: "string"},
                {name: "i_is_po"},
                {name: "i_is_warranty"},
                {name: "i_is_warranty_book"},

                {name: "book_no"},
                {name: "book_seq"},
                {name: "d_book_date"},
                {name: "f_warranty_amt"},
                {name: "c_remark"},
                {name: "d_return_warranty"},
                {name: "c_return_warranty"},
                {name: "c_return_comment"}, //c_return_comment c_return_warranty d_return_warranty
                {name: "book_warranty_no"},
                {name: "d_book_warranty_date"},
                {name: "dc_bank_id"},
                {name: "dc_bank_idID_Name"},
                {name: "f_book_warranty_amt"},
                {name: "d_book_warranty_end"},
                {name: "c_remark1"},
                {name: "i_is_expense_monthly"},

                {name: "i_enabled", type: "int"},
                {name: "dc_user_create_id"},
                {name: "dc_user_create_cost_id"},
                {name: "d_create"},
                {name: "dc_user_update_id"},
                {name: "dc_user_update_cost_id"},
                {name: "d_update"},
            ],
        });
        //งวด
        Ext.store3 = new Ext.data.JsonStore({
            storeId: "myStore3",
            autoLoad: false,
            url: "tor/api/mnTorController.php",
            root: "data",
            baseParams: {mode: "LISTHDRPERIOD", i_read: user_right_read}, //Permission i_read
            idProperty: "id",
            totalProperty: "totalCount",
            fields: [
                {name: "no"},
                {name: "id"},
                {name: "d_period_date", type: "string"},
                {name: "i_period", type: "int"},
                {name: "i_is_status", type: "int"},
                {name: "i_enable", type: "int"},
                {name: "f_total_amt", type: "string"},
                {name: "dc_user_create_id"},
                {name: "dc_user_create_cost_id"},
                {name: "d_create"},
                {name: "dc_user_update_id"},
                {name: "dc_user_update_cost_id"},
                {name: "d_update"},
            ],
        });
        //ของ 
        Ext.store4 = new Ext.data.JsonStore({
            storeId: "myStore4",
            autoLoad: false,
            url: "tor/api/mnTorController.php",
            root: "data",
            baseParams: {mode: "LISTDTLPERIODUSED", i_read: user_right_read}, //Permission i_read
            idProperty: "id",
            totalProperty: "totalCount",
            fields: [
                {name: "no"},
                {name: "id"},
                {name: "i_period", type: "int"},
                {name: "c_code", type: "string"},
                {name: "c_name", type: "string"},
                {name: "dc_unit_name", type: "string"},
                {name: "i_qty"},
                {name: "f_net_unit_price"}, // f_net_unit_price f_net_total_price
                {name: "f_net_total_price"}, // f_net_unit_price f_net_total_price
                {name: "i_qty_amt"}, //sum
                {name: "f_total_amt"}, //summ
                {name: "c_comment_product", type: "string"},
                {name: "c_comment_asset", type: "string"},
                {name: "i_enable", type: "int"},
                {name: "dc_user_create_id"},
                {name: "dc_user_create_cost_id"},
                {name: "d_create"},
                {name: "dc_user_update_id"},
                {name: "dc_user_update_cost_id"},
                {name: "d_update"},
            ],
        });

        var colCnt = [
            new Ext.grid.RowNumberer({width: 35, header: " No ", dataIndex: "no"}),
            {header: "ID System", hidden: true, dataIndex: "dc_creditor_id"},
            {
                header: "คืนหลักประกันสัญญา",
                sortable: false,
                hideable: false,
                draggable: false,
                align: "center",
                id: "edit21",
                width: 45,
                dataIndex: "id",
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    if (record.get("c_code") == "") {
                        return '<img src="../images/icons/document_edit.gif"); style="cursor:pointer"/>';
                    } else {
                        return '<img src="../images/icons/document_edit.gif"); style="cursor:pointer"/>';
                    }
                },
            },
            {
                header: "เลข CTS",
                align: "left",
                dataIndex: "c_code",
                width: 35,
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    return "<b>" + value + "</b>";
                },
            },
            {
                header: "ชื่อคู่สัญญา",
                align: "left",
                dataIndex: "creditor_name",
                width: 90,
            },
            {header: "เลขที่สัญญา", align: "left", dataIndex: "c_name", width: 50},
            {
                header: "เลขอ้างอิง",
                align: "left",
                dataIndex: "c_doc_ref",
                width: 50,
            },
            {
                header: "วันที่สัญญา",
                dataIndex: "d_doc_date0",
                width: 20,
                align: "right",
            },
            {header: "รวม", dataIndex: "f_total_amt", align: "right", width: 25},
            {width: 2, dataIndex: ""},
                    //  {header: "รวม VAT", dataIndex: 'f_unit_cost_vat', align: 'right', width: 25, },
        ];

        var disp = false ? "displayfield" : "textfield";
        if (!Ext.isEmpty(Ext.getCmp("winChequeID"))) {
            Ext.getCmp("winChequeID").destroy();
        }
        Ext.poFormID = "win-frm-xxx001";
        return new Ext.Window({
            collapsible: true,
            maximizable: true,
            title: "รายละเอียดของสัญญา",
            id: Ext.poFormID,
            width: 1200,
            height: 500,
            layout: "fit",
            modal: true,
            plain: true,
            items: [
                {
                    xtype: "tabpanel",
                    activeTab: 0,
                    id: "winChequeID",
                    // defaults: {autoHeight: true, bodyStyle: 'padding:10px'},
                    items: [
                        //--รายละเอียด TOR
                        new Ext.FormPanel({
                            title: "รายละเอียด PR",
                            iconCls: "icon-start",
                            columnWidth: 1,
                            url: "tor/api/mnTorController.php",
                            id: "form-main",
                            frame: true,
                            autoScroll: true,
                            labelAlign: "left",
                            bodyStyle: "padding:1px",
                            labelWidth: 150,
                            items: [
                                {
                                    layout: "column",
                                    border: false,
                                    items: [
                                        {
                                            columnWidth: 0.6,
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
                                                    xtype: disp,
                                                    readOnly: true,
                                                    fieldLabel: "เรื่อง PR",
                                                    name: "c_name",
                                                },
                                                comboUsedBgYear,
                                                {
                                                    xtype: "displayfield",
                                                    fieldLabel: "ชื่อโครงการ",
                                                    name: "c_budget_dtl_project",
                                                },
                                                comboTypeBg,
                                                comboExpense,
                                                comboCost,
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
                                                            text: "* วันที่ตามเอกสาร TOR",
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
                                                            xtype: "displayfield",
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
                                                        {
                                                            xtype: "button",
                                                            fieldLabel: "-",
                                                            text: "ตรวจสอบเงินตามงวด",
                                                            handler: function () {
                                                                alert("เหลือเงินงวด 10,000,000.00 บาท");
                                                            },
                                                        },
                                                    ],
                                                },
                                                {
                                                    xtype: "displayfield",
                                                    fieldLabel: "รหัสเอกสารอ้างอิง",
                                                    name: "d_doc_ref",
                                                },
                                                {
                                                    xtype: "radiogroup",
                                                    columns: [98, 98, 98],
                                                    fieldLabel: "ขอดำเนินการ",
                                                    id: "i_purchaseID",
                                                    name: "i_purchase",
                                                    items: [
                                                        {
                                                            checked: true,
                                                            name: "i_purchase",
                                                            inputValue: 1,
                                                            boxLabel: "จัดซื้อ",
                                                        },
                                                        {
                                                            inputValue: 2,
                                                            name: "i_purchase",
                                                            boxLabel: "จัดจ้าง",
                                                        },
                                                        {
                                                            name: "i_purchase",
                                                            inputValue: 3,
                                                            boxLabel: "จัดเช่า",
                                                        },
                                                    ], //radiogroup
                                                    listeners: {
                                                        change: function () {
                                                            console.log(this.getValue().inputValue);
                                                            if (this.getValue().inputValue == 3) {
                                                                Ext.getCmp("i_product_typeID").hide();
                                                                Ext.getCmp("i_hire_typeID").hide();
                                                            } else {
                                                                Ext.getCmp("i_product_typeID").show();
                                                                Ext.getCmp("i_hire_typeID").show();

                                                                if (this.getValue().inputValue == 1) {
                                                                    Ext.getCmp("i_type_fix_rateGID").show();
                                                                    Ext.getCmp("i_hire_typeID").hide();
                                                                } else {
                                                                    Ext.getCmp("i_type_fix_rateGID").hide();
                                                                }
                                                            }
                                                        },
                                                    },
                                                },
                                                {
                                                    xtype: "checkboxgroup",
                                                    fieldLabel: "ประเภทสัญญา",
                                                    name: "i_type_fix_rate",
                                                    id: "i_type_fix_rateGID",
                                                    columns: 1,
                                                    items: [
                                                        {
                                                            id: "i_type_fix_rateID",
                                                            boxLabel: "จะซื้อ/ขาย",
                                                            name: "i_type_fix_rate",
                                                            inputValue: 1,
                                                        },
                                                                // {id: 'cbxDescription', boxLabel: 'Description', name: 'mycbxgrp', inputValue: 2}
                                                    ],
                                                    listeners: {
                                                        afterrender: function () {
                                                            this.fn = function (i) {
                                                                if (i != 1)
                                                                    this.hide();
                                                                else
                                                                    this.show();
                                                            };
                                                            this.fn(Ext.getCmp("i_purchaseID").getValue().inputValue);
                                                        },
                                                    },
                                                },
                                                {
                                                    xtype: "radiogroup",
                                                    columns: [98, 110],
                                                    fieldLabel: "ลักษณะการจ้าง",
                                                    id: "i_hire_typeID",
                                                    name: "i_hire_type",
                                                    items: [
                                                        {
                                                            checked: true,
                                                            name: "i_hire_type",
                                                            inputValue: 1,
                                                            boxLabel: "จ้างแบบได้ของ",
                                                        },
                                                        {
                                                            inputValue: 0,
                                                            name: "i_hire_type",
                                                            boxLabel: "จ้างแบบไม่มีของ",
                                                        },
                                                    ], //radiogroup  
                                                },

                                            ]
                                        },
                                        {
                                            columnWidth: 0.4,
                                            layout: "table",
                                        },
                                    ],
                                },
                                {
                                    xtype: "grid",
                                    id: "gridSub1ID",
                                    border: true,
                                    stripeRows: true,
                                    loadMask: true,
                                    height: 500,
                                    store: Ext.store2,
                                    /*tbar: [
                                        {
                                            xtype: "button",
                                            iconCls: "icon-add",
                                            text: "เพิ่มรายการสัญญา",
                                            handler: function () {
                                                Ext.SelectStore = null;
                                                Ext.cntContract();
                                                var i_edit_type = document.getElementsByName("i_edit_type");
                                                i_edit_type[0].checked = true;
                                            },
                                        },
                                    ],*/
                                    listeners: {
                                        beforerender: function () {
                                            Ext.cntContract = function (evt, rec) {
                                                var win = new Ext.Window({
                                                    labelWidth: 175,
                                                    collapsible: true,
                                                    maximizable: true,
                                                    modal: true,
                                                    title: "เพิ่มรายการสัญญา",
                                                    id: "win-frm-contractID",
                                                    layout: "fit",
                                                    border: false,
                                                    width: 1000,
                                                    height: 500,
                                                    listeners: {
                                                        afterrender: function () {
                                                            if (Ext.SelectStore != null) {
                                                                if (Ext.SelectStore.data.c_code != "") {
                                                                    // console.log(Ext.getCmp('win-frm-contractID'));
                                                                    console.log(Ext.getCmp("i_is_poID"));
                                                                    Ext.getCmp("btn_save_Contract").hide();
                                                                    Ext.getCmp("i_edit_typeID").hide();
                                                                    Ext.getCmp("c_contract_noID").setReadOnly(true);
                                                                    Ext.getCmp("d_contract_dateID").setReadOnly(true);
                                                                    Ext.getCmp("d_due_dateID").setReadOnly(true);
                                                                    Ext.getCmp("c_name_ContractID").setReadOnly(true);
                                                                    Ext.getCmp("Budc_creditor_idID").disable(true);
                                                                    Ext.getCmp("dc_creditor_idID_pop").setReadOnly(true);
                                                                    Ext.getCmp("f_totalID").setReadOnly(true);
                                                                    Ext.getCmp("i_is_poID").disable(true);
                                                                    Ext.getCmp("fieldsetID").disable(true);
                                                                }
                                                            }
                                                        },
                                                    },
                                                    items: [
                                                        {
                                                            xtype: "form",
                                                            id: "form-widgets",
                                                            url: "tor/api/mnTorController.php",
                                                            frame: true,
                                                            labelAlign: "left",
                                                            autoScroll: true,
                                                            labelWidth: 200,
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
                                                                    value: Ext.HDR_ID,
                                                                },
                                                                {
                                                                    xtype: "hidden",
                                                                    name: "sp_tor_contract_id",
                                                                    id: "sp_tor_contract_idID",

                                                                },
                                                                {
                                                                    xtype: "hidden",
                                                                    name: "ap_cnt_warranty_id",
                                                                    id: "ap_cnt_warranty_idID",
                                                                },
                                                                {
                                                                    xtype: "hidden",
                                                                    name: "mode",
                                                                    value: "UP_SP_TOR_CONTRACT",
                                                                    readOnly: true,
                                                                },
                                                                {
                                                                    fieldLabel: "โหมดการบันทึก",
                                                                    id: "i_edit_typeID",
                                                                    xtype: "radiogroup",
                                                                    columns: [1, 140, 120, 120, 100],
                                                                    items: [
                                                                        {
                                                                            boxLabel: "",
                                                                            hidden: true,
                                                                            name: "i_edit_type",
                                                                            inputValue: null,
                                                                        },
                                                                        {
                                                                            boxLabel: "รายละเอียดสัญาญา",
                                                                            checked: true,
                                                                            name: "i_edit_type",
                                                                            inputValue: "0",
                                                                        },
                                                                        {
                                                                            boxLabel: "ออกเลขสัญญา",
                                                                            name: "i_edit_type",
                                                                            inputValue: "3",
                                                                        },
                                                                        {
                                                                            boxLabel: "เพิ่มงวดสัญญา",
                                                                            name: "i_edit_type",
                                                                            inputValue: "1",
                                                                        },
                                                                        {
                                                                            boxLabel: "ลดงวดสัญญา",
                                                                            name: "i_edit_type",
                                                                            inputValue: "2",
                                                                        },
                                                                    ],
                                                                },
                                                                {
                                                                    xtype: "textfield",
                                                                    width: 170,
                                                                    fieldLabel: "รหัส CTS",
                                                                    id: "codeCTS",
                                                                    style: "text-align: center;font-weight:bold;background:#eee;",
                                                                    readOnly: true,
                                                                    name: "c_code",
                                                                },
                                                                // {
                                                                //   fieldLabel: "เลขที่",
                                                                //   id: "c_codeID",
                                                                //   name: "c_code",
                                                                //   xtype: "displayfield",
                                                                //   width: 170,
                                                                //   validator: " ",
                                                                //   // validator: function (val) {
                                                                //   //   if (Ext.isEmpty(val)) {
                                                                //   //     return "กรุณากรอก เลขที่";
                                                                //   //   } else {
                                                                //   //     return true;
                                                                //   //   }
                                                                //   // },
                                                                // },
                                                                {
                                                                    fieldLabel: "เลขที่",
                                                                    readOnly: false,
                                                                    id: "c_contract_noID",
                                                                    name: "c_contract_no",
                                                                    xtype: "textfield",
                                                                    width: 170,
                                                                    validator: function (val) {
                                                                        if (Ext.isEmpty(val)) {
                                                                            return "กรุณากรอก เลขที่";
                                                                        } else {
                                                                            return true;
                                                                        }
                                                                    },
                                                                },
                                                                {
                                                                    fieldLabel: "วันที่ลงนาม ",
                                                                    id: "d_contract_dateID",
                                                                    name: "d_contract_date",
                                                                    xtype: "datefield",
                                                                    width: 160,
                                                                    validator: function (val) {
                                                                        if (Ext.isEmpty(val)) {
                                                                            return "วันที่ลงนาม";
                                                                        } else {
                                                                            return true;
                                                                        }
                                                                    },
                                                                },
                                                                {
                                                                    fieldLabel: "วันที่อายุสัญญา ",
                                                                    id: "d_due_dateID",
                                                                    name: "d_due_date",
                                                                    xtype: "datefield",
                                                                    width: 160,
                                                                    validator: function (val) {
                                                                        if (Ext.isEmpty(val)) {
                                                                            return "วันที่อายุสัญญา";
                                                                        } else {
                                                                            return true;
                                                                        }
                                                                    },
                                                                },
                                                                {
                                                                    fieldLabel: "เรื่อง ",
                                                                    xtype: "textfield",
                                                                    width: 300,
                                                                    id: "c_name_ContractID",
                                                                    name: "c_name",
                                                                    cls: "my-label-style",
                                                                },
                                                                {
                                                                    xtype: "compositefield",
                                                                    id: "dc_creditor_idID_pop",
                                                                    fieldLabel: "เลือกผู้ชนะ ผู้ขาย/ผู้รับจ้าง",
                                                                    msgTarget: "side",
                                                                    anchor: "-20",
                                                                    defaults: {
                                                                        flex: 1,
                                                                    },
                                                                    items: [PopCreditorForm.mini],
                                                                },
                                                                {
                                                                    fieldLabel: "วงเงินในสัญญา ",
                                                                    xtype: "textfield",
                                                                    id: "f_totalID",
                                                                    name: "f_total",
                                                                    style: "color:blue; text-align: right;",
                                                                    listeners: {
                                                                        afterrender: function () {
                                                                            this.fn = function () {
                                                                                this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                                                                            };
                                                                        },
                                                                        Change: function (value) {
                                                                            this.fn();
                                                                        },
                                                                    },
                                                                },
                                                                {
                                                                    xtype: "checkbox",
                                                                    id: "i_is_poID",
                                                                    disabled: true,
                                                                    name: "i_is_po",
                                                                    height: 20,
                                                                    fieldLabel: "ประเภทสัญญา ",
                                                                    boxLabel: "จะซื้อ จะขาย",
                                                                    inputValue: "1",
                                                                    // checked: true,
                                                                    listeners: {
                                                                        check: function (checkbox, checked) {
                                                                            if (checked) {
                                                                                // alert();
                                                                            }

                                                                        },
                                                                        afterrender: function () {
                                                                            document.getElementById('i_is_poID').checked = Ext.selectRow.data.i_type_fix_rate == 1 ? true : false;
                                                                        }
                                                                    },
                                                                },
                                                                {
                                                                    bodyStyle: "padding-left:0px;",
                                                                    items: {
                                                                        xtype: "fieldset",
                                                                        id: "fieldsetID",
                                                                        title: "ข้อมูลหลักประกันสัญญา ",
                                                                        autoHeight: true,
                                                                        // defaultType: 'radio', // each item will be a radio button
                                                                        items: [
                                                                            {
                                                                                xtype: "checkbox",
                                                                                id: "i_is_bank_warranty0ID",
                                                                                name: "i_is_bank_warranty0",
                                                                                height: 20,
                                                                                boxLabel: "ไม่มีการค้ำประกัน ",
                                                                                inputValue: "1",
                                                                                checked: true,
                                                                                listeners: {
                                                                                    check: function (checkbox, checked) {
                                                                                        if (checked) {
                                                                                            Ext.getCmp("i_warranty_typeID").hide();
                                                                                            Ext.getCmp("c_books_receiptID").hide();
                                                                                            Ext.getCmp("c_receipt_noID").hide();
                                                                                            Ext.getCmp("d_doc_dateID").hide();
                                                                                            Ext.getCmp("c_commentID").hide();
                                                                                            Ext.getCmp("i_warranty_type1ID").hide();
                                                                                            Ext.getCmp("c_doc_noID").hide();
                                                                                            Ext.getCmp("d_doc_date1ID").hide();
                                                                                            Ext.getCmp("c_comment1ID").hide();
                                                                                            Ext.getCmp("d_expire_warrantyID").hide();
                                                                                            Ext.getCmp("frmPopBankID").hide();

                                                                                            Ext.getCmp("i_is_bank_warranty1ID").setValue(null);
                                                                                            Ext.getCmp("i_is_bank_warrantyID").setValue(null);
                                                                                        }
                                                                                    },
                                                                                },
                                                                            },
                                                                            {
                                                                                xtype: "checkbox",
                                                                                id: "i_is_bank_warrantyID",
                                                                                name: "i_is_bank_warranty",
                                                                                height: 20,
                                                                                boxLabel: "เงินค้ำประกัน ",
                                                                                inputValue: "1",
                                                                                listeners: {
                                                                                    check: function (checkbox, checked) {
                                                                                        if (checked) {
                                                                                            Ext.getCmp("i_warranty_typeID").show();
                                                                                            Ext.getCmp("c_books_receiptID").show();
                                                                                            Ext.getCmp("c_receipt_noID").show();
                                                                                            Ext.getCmp("d_doc_dateID").show();
                                                                                            Ext.getCmp("c_commentID").show();
                                                                                            // Ext.getCmp("i_is_bank_warranty1ID").setValue(null);
                                                                                            Ext.getCmp("i_is_bank_warranty0ID").setValue(null);
                                                                                            /* console.log(Ext.getCmp('i_is_bank_warrantyID'));
                                                                                             console.log(Ext.getCmp('i_is_bank_warranty1ID')); */
                                                                                        } else {
                                                                                            Ext.getCmp("i_warranty_typeID").hide();
                                                                                            Ext.getCmp("c_books_receiptID").hide();
                                                                                            Ext.getCmp("c_receipt_noID").hide();
                                                                                            Ext.getCmp("d_doc_dateID").hide();
                                                                                            Ext.getCmp("c_commentID").hide();
                                                                                        }
                                                                                    },
                                                                                },
                                                                            },
                                                                            {
                                                                                fieldLabel: "ใบเสร็จเล่มที่",
                                                                                id: "c_books_receiptID",
                                                                                name: "c_books_receipt",
                                                                                xtype: "textfield",
                                                                                hidden: true,
                                                                                width: 200,
                                                                                listeners: {
                                                                                    render: function (p) {
                                                                                        // this.hide();
                                                                                    },
                                                                                },
                                                                            },
                                                                            {
                                                                                fieldLabel: "ใบเสร็จเลขที่",
                                                                                id: "c_receipt_noID",
                                                                                name: "c_receipt_no",
                                                                                xtype: "textfield",
                                                                                hidden: true,
                                                                                width: 200,
                                                                                listeners: {
                                                                                    render: function (p) {
                                                                                        // this.hide();
                                                                                    },
                                                                                }, //d_doc_date_M
                                                                            },
                                                                            {
                                                                                fieldLabel: "วันที่รับเงิน ",
                                                                                id: "d_doc_dateID",
                                                                                name: "d_doc_date",
                                                                                hidden: true,
                                                                                xtype: "datefield",
                                                                                width: 180,
                                                                                listeners: {
                                                                                    render: function (p) {
                                                                                        // this.hide();
                                                                                    },
                                                                                }, //d_doc_date_M
                                                                            },
                                                                            {
                                                                                fieldLabel: "วงเงินค้ำประกัน ",
                                                                                layout: "column",
                                                                                hidden: true,
                                                                                id: "i_warranty_typeID",
                                                                                items: [
                                                                                    {
                                                                                        fieldLabel: "วงเงินในสัญญา ",
                                                                                        id: "f_warranty_amtID",
                                                                                        name: "f_warranty_amt",
                                                                                        xtype: "textfield",
                                                                                        style: "color:blue; text-align: right;",
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
                                                                                    // {
                                                                                    //   xtype: "numberfield",
                                                                                    //   id: "f_warranty_amtID",
                                                                                    //   width: 150,
                                                                                    //   name: "f_warranty_amt",
                                                                                    //   value: "0.00",
                                                                                    //   validator: function (val) {
                                                                                    //     var regex =
                                                                                    //       /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\.[0-9]{1,2})?$/;
                                                                                    //     var strMoney = val.replace(
                                                                                    //       ",",
                                                                                    //       ""
                                                                                    //     );
                                                                                    //     if (!regex.test(val)) {
                                                                                    //       return "กรุณากรอก จำนวนเงินเป็นจำนวนทศนิยม มูลค่ามากกว่า 0.00";
                                                                                    //       return true;
                                                                                    //     } else {
                                                                                    //       return true;
                                                                                    //     }
                                                                                    //   },
                                                                                    // },
                                                                                    {
                                                                                        xtype: "displayfield",
                                                                                        id: "fpBt3",
                                                                                        value: "บาท ",
                                                                                        cls: "my-label-style",
                                                                                    },
                                                                                ],
                                                                                listeners: {
                                                                                    change: function (cb, rec, ind) {
                                                                                        // this.fnValue(rec.inputValue);
                                                                                    },
                                                                                    afterrender: function (obj, eOpts) {
                                                                                        // this.hide();
                                                                                        // this.fnValue = function (id) {
                                                                                        //   if (id == "2") {
                                                                                        //     Ext.getCmp("fpPt3").hide();
                                                                                        //     Ext.getCmp("fpBt3").show();
                                                                                        //   } else {
                                                                                        //     Ext.getCmp("fpPt3").show();
                                                                                        //     Ext.getCmp("fpBt3").hide();
                                                                                        //   }
                                                                                        // };
                                                                                    },
                                                                                },
                                                                            },
                                                                            {
                                                                                fieldLabel: "หมายเหตุ",
                                                                                id: "c_commentID",
                                                                                hidden: true,
                                                                                name: "c_comment",
                                                                                xtype: "textarea",
                                                                                height: 60,
                                                                                width: 430,
                                                                                listeners: {
                                                                                    render: function (p) {
                                                                                        // this.hide();
                                                                                    },
                                                                                },

                                                                                /*product*/
                                                                            },
                                                                            {
                                                                                xtype: "checkbox",
                                                                                id: "i_is_bank_warranty1ID",
                                                                                name: "i_is_bank_warranty1",
                                                                                height: 20,
                                                                                boxLabel: "ค้ำประกันผลงาน",
                                                                                inputValue: "1",
                                                                                listeners: {
                                                                                    check: function (checkbox, checked) {
                                                                                        if (checked) {
                                                                                            Ext.getCmp("i_warranty_type1ID").show();
                                                                                            Ext.getCmp("c_doc_noID").show();
                                                                                            Ext.getCmp("d_doc_date1ID").show();
                                                                                            Ext.getCmp("c_comment1ID").show();
                                                                                            Ext.getCmp("d_expire_warrantyID").show();
                                                                                            Ext.getCmp("frmPopBankID").show();
                                                                                            // Ext.getCmp("i_is_bank_warrantyID").setValue(null);
                                                                                            Ext.getCmp("i_is_bank_warranty0ID").setValue(null);
                                                                                        } else {
                                                                                            Ext.getCmp("i_warranty_type1ID").hide();
                                                                                            Ext.getCmp("c_doc_noID").hide();
                                                                                            Ext.getCmp("d_doc_date1ID").hide();
                                                                                            Ext.getCmp("c_comment1ID").hide();
                                                                                            Ext.getCmp("d_expire_warrantyID").hide();
                                                                                            Ext.getCmp("frmPopBankID").hide();
                                                                                        }
                                                                                    },
                                                                                },
                                                                            },
                                                                            {
                                                                                fieldLabel: "เลขที่หนังสือค้ำประกัน ",
                                                                                id: "c_doc_noID",
                                                                                name: "c_doc_no",
                                                                                xtype: "textfield",
                                                                                hidden: true,
                                                                                width: 200,
                                                                                listeners: {
                                                                                    render: function (p) {
                                                                                        // this.hide();
                                                                                    },
                                                                                },
                                                                            },
                                                                            {
                                                                                fieldLabel: "วันที่หนังสือค้ำประกัน  ",
                                                                                id: "d_doc_date1ID",
                                                                                name: "d_doc_date1",
                                                                                xtype: "datefield",
                                                                                hidden: true,
                                                                                width: 180,
                                                                                listeners: {
                                                                                    render: function (p) {
                                                                                        // this.hide();
                                                                                    },
                                                                                }, //d_doc_date_M
                                                                            },
                                                                            {
                                                                                layout: "column",
                                                                                id: "frmPopBankID",
                                                                                hidden: true,
                                                                                border: false,
                                                                                items: [
                                                                                    {
                                                                                        columnWidth: 1,
                                                                                        layout: "form",
                                                                                        border: false,
                                                                                        items: [Ext.PopBank.mini],
                                                                                    },
                                                                                ],
                                                                                listeners: {
                                                                                    render: function (p) {
                                                                                        // this.hide();
                                                                                    },
                                                                                },
                                                                            },
                                                                            {
                                                                                fieldLabel: "วงเงินค้ำประกัน",
                                                                                layout: "column",
                                                                                hidden: true,
                                                                                id: "i_warranty_type1ID",
                                                                                items: [
                                                                                    {
                                                                                        fieldLabel: "วงเงินในสัญญา ",
                                                                                        id: "f_warranty_amt1ID",
                                                                                        name: "f_warranty_amt1",
                                                                                        xtype: "textfield",
                                                                                        style: "color:blue; text-align: right;",
                                                                                        listeners: {
                                                                                            blur: function () {
                                                                                                var f_total = parseFloat(this.getValue().replace(/,/g, "") / 1);
                                                                                                this.setValue(Ext.floatRenderer(f_total));
                                                                                            },
                                                                                        },
                                                                                    },
                                                                                    {
                                                                                        xtype: "displayfield",
                                                                                        id: "fpBt32",
                                                                                        value: "บาท ",
                                                                                        cls: "my-label-style",
                                                                                    },
                                                                                ],
                                                                                listeners: {
                                                                                    change: function (cb, rec, ind) {
                                                                                        // this.fnValue(rec.inputValue);
                                                                                    },
                                                                                    afterrender: function (obj, eOpts) {
                                                                                        // this.hide();
                                                                                        // this.fnValue = function (id) {
                                                                                        //   if (id == "2") {
                                                                                        //     Ext.getCmp("fpPt3").hide();
                                                                                        //     Ext.getCmp("fpBt3").show();
                                                                                        //   } else {
                                                                                        //     Ext.getCmp("fpPt3").show();
                                                                                        //     Ext.getCmp("fpBt3").hide();
                                                                                        //   }
                                                                                        // };
                                                                                    },
                                                                                },
                                                                            },
                                                                            {
                                                                                fieldLabel: "วันหมดอายุหนังสือค้ำประกัน  ",
                                                                                id: "d_expire_warrantyID",
                                                                                name: "d_expire_warranty",
                                                                                xtype: "datefield",
                                                                                hidden: true,
                                                                                width: 180,
                                                                                listeners: {
                                                                                    render: function (p) {
                                                                                        // this.hide();
                                                                                    },
                                                                                }, //d_doc_date_M
                                                                            },
                                                                            {
                                                                                fieldLabel: "หมายเหตุ",
                                                                                id: "c_comment1ID",
                                                                                name: "c_comment1",
                                                                                xtype: "textarea",
                                                                                hidden: true,
                                                                                height: 60,
                                                                                width: 430,
                                                                                listeners: {
                                                                                    render: function (p) {
                                                                                        // this.hide();
                                                                                    },
                                                                                },
                                                                            },
                                                                        ],
                                                                    },
                                                                },
                                                                {
                                                                    bodyStyle: "padding-left:0px;",
                                                                    xtype: "fieldset",
                                                                    id: "fieldset2ID",
                                                                    title: "รับคืนหลักประกันสัญญา ",
                                                                    items: [{

                                                                            xtype: 'datefield',
                                                                            name: 'd_return_warranty',
                                                                            id: 'd_return_warrantyID',
                                                                            width: 300,
                                                                            fieldLabel: 'วันที่เอกสารรับคืน'
                                                                        }, {
                                                                            xtype: 'textfield',
                                                                            width: 300,
                                                                            id: 'c_return_warrantyID',
                                                                            name: 'c_return_warranty',
                                                                            fieldLabel: 'เลขที่เอกสารรับคืน'
                                                                        }, {
                                                                            xtype: 'textarea',
                                                                            name: 'c_return_comment',
                                                                            width: 300,
                                                                            id: 'c_return_commentID',
                                                                            fieldLabel: 'รายละเอียดเอกสารรับคืน'
                                                                        }],
                                                                    buttonAlign: 'left',
                                                                    buttons: [{
                                                                            text: 'บันทึกคืนหลักประกัน',
                                                                            iconCls: "icon-save",
                                                                            handler: function () {
                                                                                Ext.Ajax.request({
                                                                                    url: "tor/api/mnContractCode.php",
                                                                                    method: "POST",
                                                                                    params: {
                                                                                        mode: "RETURNWARANTY",
                                                                                        id: Ext.getCmp('sp_tor_contract_idID').getValue(),
                                                                                        d_return_warranty: Ext.getCmp("d_return_warrantyID").getValue().dateFormat("Y-m-d"),
                                                                                        c_return_warranty: Ext.getCmp('c_return_warrantyID').getValue(),
                                                                                        c_return_comment: Ext.getCmp('c_return_commentID').getValue(),
//                                                                               
                                                                                    },
                                                                                    success: function (result, request) {

                                                                                        Ext.store2.setBaseParam("tor_id", Ext.HDR_ID);
                                                                                        Ext.store2.load({
                                                                                            callback: function (recordx, operation, success) {
                                                                                                if (success) {
                                                                                                    console.log(recordx);
                                                                                                    Ext.Msg.alert("แจ้งเตือน", "บันทึกเรียบร้อย");
                                                                                                    Ext.getCmp("win-frm-contractID").destroy();

                                                                                                }
                                                                                            },
                                                                                        });
                                                                                    },
                                                                                });
                                                                            }
                                                                        }]

                                                                },
                                                            ], //items จำนวนเงินรวมภาษีมูลค่าเพิ่ม
                                                            viewConfig: {forceFit: true},
                                                        },
                                                    ],
                                                    liesteners: {
                                                        afterrender: function () {
                                                            this.fn = function () {
                                                                alert(this.getValue());
                                                            };
                                                            this.fn();
                                                        },
                                                    },
                                                    buttons: [
                                                        {
                                                            text: "&nbsp;บันทึกสัญญา&nbsp;",
                                                            id: "btn_save_Contract",
                                                            iconCls: "icon-save",
                                                            handler: function () {
                                                                if (Ext.getCmp("i_edit_typeID").getValue().inputValue == 3) {
                                                                    GenCode_CTS();
                                                                    return;
                                                                }
                                                                msg = "";
                                                                // if (
                                                                //   Ext.getCmp("dc_creditor_idID").getValue() ==
                                                                //   ""
                                                                // ) {
                                                                //   msg +=
                                                                //     "<span style='white-space: nowrap;'>- กรุณาเลือก ผู้ชนะ</span><br>";
                                                                // }
                                                                // if (msg == "") {
                                                                var formSubmit = function () {
                                                                    form.submit({
                                                                        waitMsg: "Saving Data...",
                                                                        success: function (form, action) {
                                                                            Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                                                                Ext.getCmp("gridSub1ID").getStore().reload();
                                                                                // Ext.selectRow = null;
                                                                                Ext.getCmp("win-frm-contractID").destroy();
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
                                                                // } else {
                                                                //   Ext.Msg.alert("แจ้งเตือน", msg);
                                                                // }

                                                                var form = Ext.getCmp("form-widgets").getForm();
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
                                                            text: "ย้อนกลับ",
                                                            handler: function () {
                                                                Ext.getCmp("win-frm-contractID").destroy();
                                                            },
                                                        },
                                                    ],
                                                });

                                                if (!Ext.isEmpty(rec)) {
                                                    rec.set("sp_tor_id", Ext.SelectStore.data.sp_tor_id);
                                                    rec.set("sp_tor_contract_id", Ext.SelectStore.data.sp_tor_contract_id);
                                                    rec.set("c_contract_no", Ext.SelectStore.data.c_doc_ref);
                                                    rec.set("d_contract_date", Ext.SelectStore.data.d_doc_date0);
                                                    rec.set("d_due_date", Ext.SelectStore.data.d_due_date);
                                                    rec.set("dc_creditor_id", Ext.SelectStore.data.dc_creditor_id);
                                                    rec.set("c_name", Ext.SelectStore.data.c_name);
                                                    rec.set("f_total", Ext.SelectStore.data.f_total_amt);
                                                    if (Ext.SelectStore.data.i_is_po == 1) {
                                                        Ext.getCmp("i_type_fix_rateID").setValue(true);
                                                    } else {
                                                        Ext.getCmp("i_type_fix_rateID").setValue(null);
                                                    }
//                                                    if (Ext.SelectStore.data.i_is_expense_monthly == 1) {
//                                                        Ext.getCmp("i_is_expense_monthlyID").setValue(true);
//                                                    } else {
//                                                        Ext.getCmp("i_is_expense_monthlyID").setValue(null);
//                                                    }
                                                    if (Ext.SelectStore.data.i_is_warranty == 1) {
                                                        Ext.getCmp("i_is_bank_warranty0ID").setValue(null);
                                                        Ext.getCmp("i_is_bank_warrantyID").setValue(true);

                                                        Ext.getCmp("i_warranty_typeID").show();
                                                        Ext.getCmp("c_books_receiptID").show();
                                                        Ext.getCmp("c_receipt_noID").show();
                                                        Ext.getCmp("d_doc_dateID").show();
                                                        Ext.getCmp("c_commentID").show();
                                                    } else {
                                                        Ext.getCmp("i_is_bank_warranty0ID").setValue(true);
                                                        Ext.getCmp("i_is_bank_warrantyID").setValue(null);

                                                        Ext.getCmp("i_warranty_typeID").hide();
                                                        Ext.getCmp("c_books_receiptID").hide();
                                                        Ext.getCmp("c_receipt_noID").hide();
                                                        Ext.getCmp("d_doc_dateID").hide();
                                                        Ext.getCmp("c_commentID").hide();
                                                    }

                                                    if (Ext.SelectStore.data.i_is_warranty_book == 1) {
                                                        Ext.getCmp("i_is_bank_warranty1ID").setValue(true);

                                                        Ext.getCmp("i_warranty_type1ID").show();
                                                        Ext.getCmp("c_doc_noID").show();
                                                        Ext.getCmp("d_doc_date1ID").show();
                                                        Ext.getCmp("c_comment1ID").show();
                                                        Ext.getCmp("d_expire_warrantyID").show();
                                                        Ext.getCmp("frmPopBankID").show();
                                                    } else {
                                                        Ext.getCmp("i_is_bank_warranty1ID").setValue(null);

                                                        Ext.getCmp("i_warranty_type1ID").hide();
                                                        Ext.getCmp("c_doc_noID").hide();
                                                        Ext.getCmp("d_doc_date1ID").hide();
                                                        Ext.getCmp("c_comment1ID").hide();
                                                        Ext.getCmp("d_expire_warrantyID").hide();
                                                        Ext.getCmp("frmPopBankID").hide();
                                                    }
                                                    rec.set("c_books_receipt", Ext.SelectStore.data.book_no);
                                                    rec.set("c_receipt_no", Ext.SelectStore.data.book_seq);
                                                    rec.set("d_doc_date", Ext.SelectStore.data.d_book_date);
                                                    rec.set("f_warranty_amt", Ext.SelectStore.data.f_warranty_amt);
                                                    rec.set("c_comment", Ext.SelectStore.data.c_remark);

                                                    rec.set("c_doc_no", Ext.SelectStore.data.book_warranty_no);
                                                    rec.set("d_doc_date1", Ext.SelectStore.data.d_book_warranty_date);

                                                    rec.set("dc_bank_id", Ext.SelectStore.data.dc_bank_id);
                                                    rec.set("txtdc_bank_idID", Ext.SelectStore.data.dc_bank_idID_Name);

                                                    rec.set("f_warranty_amt1", Ext.SelectStore.data.f_book_warranty_amt);
                                                    rec.set("d_expire_warranty", Ext.SelectStore.data.d_book_warranty_end);
                                                    rec.set("c_comment1", Ext.SelectStore.data.c_remark1);

                                                    win.items.items[0].getForm().loadRecord(rec);
                                                    win.setTitle("แก้ไขรายการสัญญา " + rec.get("c_contract_no"));
                                                    Ext.getCmp("i_edit_typeID").show();
                                                } else {
                                                    win.setTitle("เพิ่มรายการสัญญา");
                                                    Ext.getCmp("i_edit_typeID").hide();
                                                }
                                                win.show();
                                            };
                                            function controller(rec, event) {
                                                if (event == "view") {
                                                    Ext.store3.setBaseParam("tor_id", Ext.HDR_ID);
                                                    Ext.store3.setBaseParam("dc_creditor_id", rec.get("id"));
                                                    Ext.store3.load({
                                                        callback: function (record, operation, success) {
                                                            if (success) {
                                                                Ext.getCmp("winChequeID").setActiveTab(1);
                                                                Ext.getCmp("tabpanelMain2ID").setTitle(rec.get("creditor_name") + "  สัญญา " + rec.get("c_name"));
                                                            }
                                                        },
                                                    });
                                                }
                                            }
                                            this.thisCick = function (grid, rowIndex, columnIndex, e) {
                                                var record = grid.getStore().getAt(rowIndex);
                                                Ext.SelectStore = Ext.store2.getAt(rowIndex);
                                                Ext.store2.setBaseParam("tor_id", Ext.HDR_ID);
                                                if (columnIndex === grid.getColumnModel().getIndexById("detailPeriod")) {
                                                    //ttf
                                                    controller(record, "view"); //on
                                                } else if (columnIndex === grid.getColumnModel().getIndexById("edit21")) {
                                                    Ext.cntContract("edit21", record);
                                                    // Ext.f_total_contract = record.data.f_total.replace(",", "");;
                                                    Ext.getCmp("dc_creditor_idID_Name").setValue(Ext.SelectStore.data.c_tax_number_imp + " : " + Ext.SelectStore.data.creditor_name);
                                                    Ext.getCmp("dc_creditor_idID").setValue(Ext.SelectStore.data.dc_creditor_id);
                                                    Ext.getCmp("dc_bank_idID_Name").setValue(Ext.SelectStore.data.dc_bank_idID_Name);
                                                    Ext.getCmp("dc_bank_idID").setValue(Ext.SelectStore.data.dc_bank_id);
                                                    var i_edit_type = document.getElementsByName("i_edit_type");
                                                    i_edit_type[1].checked = true;
                                                }
                                            };
                                        },
                                        afterrender: function () {
                                            Ext.getCmp("gridSub1ID").on("cellclick", this.thisCick, this);
                                        },
                                    },
                                    columns: colCnt, //colCnt
                                    viewConfig: {forceFit: true},
                                },
                            ],
                        }),
                    ],
                },
            ],
        });
    };
    Ext.store5 = new Ext.data.JsonStore({
        storeId: "myStore5",
        autoLoad: false,
        url: "tor/api/mnTorController.php",
        root: "data",
        baseParams: {mode: "LISTDTLPERIOD", i_read: user_right_read}, //Permission i_read
        idProperty: "id",
        totalProperty: "totalCount",
        fields: [
            {name: "no"},
            {name: "id"},
            {name: "c_code", type: "string"},
            {name: "c_name", type: "string"},
            {name: "dc_unit_name", type: "string"},
            {name: "i_qty", type: "int"},
            {name: "i_qty2", type: "int"},
            {name: "i_used", type: "int"},
            {name: "i_balance", type: "int"},
            {name: "f_net_unit_price"},
            {name: "f_net_total_price"},
            {name: "f_total_amt"},
            {name: "c_comment_product", type: "string"},
            {name: "c_comment_asset", type: "string"},
            {name: "i_enable", type: "int"},
            {name: "dc_user_create_id"},
            {name: "dc_user_create_cost_id"},
            {name: "d_create"},
            {name: "dc_user_update_id"},
            {name: "dc_user_update_cost_id"},
            {name: "d_update"},
        ],
    });
    Ext.storeVictories = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: false,
        url: "api/All_PoWorkingImpHdr.php",
        baseParams: {
            type: "sp_tor_victory",
        },
        root: "data",
        idProperty: "id",
        fields: ["id", "c_name"],
    });
    Ext.ColumGridPop = [
        {header: "ID System", sortable: true, hidden: true, dataIndex: "id"},
        {header: "รหัส", sortable: true, dataIndex: "c_code"},
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
    Ext.PopBank = new Ext.ux.Poplov({
        text: "ชื่อธนาคาร",
        id: "dc_bank_idID", //go to relation
        iconCls: "page_magnify",
        valueHidden: "dc_bank_id", //go to hidden
        store: Ext.storeBank,
        headerGrid: Ext.ColumGridPop,
        widthText: 280,
        fieldLabel: "ชื่อธนาคาร ",
        // listeners   : {'render' : function(p){ this.hide(); } }
    });

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
                                                                                        Ext.HDR_ID = null;
                                                                                        Ext.SelectStore = null;
                                                                                        Ext.selectRow = null;
                                                                                        Ext.i_is_more = 0;
                                                                                        var winApp = AppPoStore(statusx);
                                                                                        winApp.show();
                                                                                    } else if (statusx === "edit") {
                                                                                        Ext.HDR_ID = Ext.selectRow.data.id;
                                                                                        Ext.SelectStore = null;
                                                                                        Ext.tor_type_id = Ext.selectRow.data.tor_type_id; // default start เจาะจงน้อวกว่า 5 แสน
                                                                                        Ext.i_is_more = Ext.selectRow.data.i_is_more;

                                                                                        Ext.f_total_amt = Ext.selectRow.data.f_total_amt.replace(",", "");

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
                                                                                        Ext.store2.setBaseParam("tor_id", Ext.HDR_ID);

                                                                                        Ext.store2.load();
                                                                                        Ext.storeVictories.setBaseParam("id", Ext.HDR_ID);
                                                                                        Ext.storeVictories.load();
                                                                                        Ext.storeCreditor.setBaseParam("id", Ext.HDR_ID);

                                                                                        //                                                                                                                                 Ext.store3.setBaseParam("tor_id", Ext.HDR_ID);
                                                                                        //                                                                                                                                 Ext.store3.load();
                                                                                        //                                                                                                                                 Ext.store4.setBaseParam("tor_id", Ext.HDR_ID);
                                                                                        //                                                                                                                                 Ext.store4.load();
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
};
