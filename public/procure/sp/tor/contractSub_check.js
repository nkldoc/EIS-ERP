var text_dc_expense_budget = function () {
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
setParentExpense = function (i_level, val, rowIndex) {
    let sto = null;
    let value = null;
    let parent_id = null;
    let record = Ext.NMU_dc_acc.getAt(rowIndex);
  
    if (i_level == 4) {
      sto = Ext.NMU_dc_acc;
      // } else if (i_level == 3) {
      //   sto = Ext.bg_expense_lv3;
      // } else if (i_level == 2) {
      //   sto = Ext.bg_expense_lv2;
    }
  
    value = val;
    parent_id = getStoreItems(sto, value, "parent_id");
  
    record.set("editor_dc_acc_id" + i_level, parent_id);
    // if (i_level > 2) {
    //   setParentExpense(i_level, parent_id, rowIndex);
    // }
  };
var GenCode_CTS = function () {
    //    var date_Ymd = Ext.util.Format.date(Ext.getCmp("d_contract_dateID").getValue(), "Ymd").substr(2);
    //    var date_Ym = date_Ymd.substr(0, 4);
    //    var date_dd = date_Ymd.substr(4);
    var date_Ymd = parseInt(Ext.util.Format.date(Ext.getCmp("d_contract_dateID").getValue(), "Y")) + 543;
    //    var date_Ym = Ext.util.Format.date(Ext.getCmp("d_contract_dateID").getValue(), "m");
    var date_dd = Ext.util.Format.date(Ext.getCmp("d_contract_dateID").getValue(), "d");

    //
    //    console.log(Ext.selectRow.data.i_purchase); //สัญญาซื้อ 1f_totalID
    //    console.log(date_Ym); //สัญญาลงวันที่ 2
    //    console.log(date_dd); //สัญญาลงวันที่ 3
    //    console.log(Ext.selectRow.data.tor_type_id); //ประเภท 4
    //    console.log(Ext.selectRow.data.dc_expense_budget_type_id); //แหล่งเงิน 5
    //    console.log(Ext.selectRow.data.i_type_fix_rate == 0 ? 1 : 2); //สัญญาปกติ,สัญญาย่อย 6
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
                ym_0: date_Ymd,
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
            baseParams: {mode: "LISTCREDITOR", i_read: user_right_read}, //Permission i_read
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
            baseParams: {mode: "LISTCREDITOR", i_read: user_right_read}, //Permission i_read
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
                {name: "po_expense_id"},
                {name: "i_is_warranty_book"},
                {name: "book_no"},
                {name: "book_seq"},
                {name: "d_book_date"},
                {name: "f_warranty_amt"},
                {name: "c_remark"},
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
                header: "ตั้งค่าใช้จ่ายรายเดือน",
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
                header: "เลขสัญญา",
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
                width: 50,
            },
            {header: "เรื่อง", align: "left", dataIndex: "c_name", width: 90},
            // {
            //     header: "เลขอ้างอิง",
            //     align: "left",
            //     dataIndex: "c_doc_ref",
            //     width: 50,
            // },
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

        var disp = false ? "displayfield" : "textfield";
        if (!Ext.isEmpty(Ext.getCmp("winChequeID"))) {
            Ext.getCmp("winChequeID").destroy();
        }
        Ext.poFormID = "win-frm-xxx001";
        return new Ext.Window({
            //            collapsible: true,
            maximizable: true,
            title: "ตั้งค่าใช้จ่ายรายเดือน ",
            id: Ext.poFormID,
            width: Ext.getCmp("contenterCenter").getWidth() - 10,
            height: Ext.getCmp("contenterCenter").getHeight() - 10,
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
                                                    xtype: "textarea",
								                    width: 500,
                                                    height : 35 ,
                                                    readOnly: true,
                                                    fieldLabel: "เรื่อง PR",
                                                    name: "c_name",
                                                },
                                                comboUsedBgYear,
                                                // {
                                                //     xtype: "displayfield",
                                                //     fieldLabel: "ชื่อโครงการ",
                                                //     name: "c_budget_dtl_project",
                                                // },
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
                                                            //                                                        },
                                                            //                                                        {
                                                            //                                                            xtype: "button",
                                                            //                                                            fieldLabel: "-",
                                                            //                                                            text: "ตรวจสอบเงินตามงวด",
                                                            //                                                            handler: function () {
                                                            //                                                                alert("เหลือเงินงวด 10,000,000.00 บาท");
                                                            //                                                            },
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
                                            ],
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
                                                    width: 1200,
                                                    height: 500,
                                                    listeners: {
                                                        afterrender: function () {
                                                            if (Ext.SelectStore != null) {
                                                                if (Ext.SelectStore.data.c_code != "") {
                                                                    // console.log(Ext.getCmp('win-frm-contractID'));
                                                                    console.log(Ext.getCmp("i_is_poID"));
                                                                    Ext.getCmp("btn_save_Contract").hide();
                                                                    Ext.getCmp("i_edit_typeID").hide();
                                                                    Ext.getCmp("i_is_expense_monthlyID").setReadOnly(true);
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
                                                                    fieldLabel: "เลขที่สัญญา",
                                                                    id: "codeCTS",
                                                                    style: "text-align: center;font-weight:bold;background:#eee;",
                                                                    readOnly: true,
                                                                    name: "c_code",
                                                                },
                                                                {
                                                                    fieldLabel: "วันที่เริ่มต้น ",
                                                                    id: "d_contract_dateID",
                                                                    name: "d_contract_date",
                                                                    xtype: "datefield",
                                                                    width: 160,
                                                                    validator: function (val) {
                                                                        if (Ext.isEmpty(val)) {
                                                                            return "วันที่เริ่มต้น";
                                                                        } else {
                                                                            return true;
                                                                        }
                                                                    },
                                                                },
                                                                {
                                                                    fieldLabel: "วันที่สิ้นสุดสัญญา ",
                                                                    id: "d_due_dateID",
                                                                    name: "d_due_date",
                                                                    xtype: "datefield",
                                                                    width: 160,
                                                                    validator: function (val) {
                                                                        if (Ext.isEmpty(val)) {
                                                                            return "วันที่สิ้นสุดสัญญา";
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
                                                                            document.getElementById("i_is_poID").checked = Ext.selectRow.data.i_type_fix_rate == 1 ? true : false;
                                                                        },
                                                                    },
                                                                },
                                                                {
                                                                    xtype: "checkbox",
                                                                    id: "i_is_expense_monthlyID",
                                                                    name: "i_is_expense_monthly",
                                                                    height: 20,
                                                                    fieldLabel: "ตั้งหนี้ค่าใช้จ่าย ",
                                                                    boxLabel: "รายเดือน(บันทึกบัญชีตั้งหนี้รายเดือน)",
                                                                    inputValue: "1",
                                                                    listeners: {
                                                                        check: function (checkbox, checked) {
                                                                            if (checked) {
                                                                                Ext.getCmp("bnt_SetDebt").show();
                                                                                // Ext.getcmp("btn_save_Contract").show();
                                                                            } else {
                                                                                Ext.getCmp("bnt_SetDebt").hide();
                                                                                // Ext.getCmp("btn_save_Contract").hide();

                                                                            }
                                                                        },
                                                                        afterrender: function () {
                                                                            if (evt == "edit21") {
                                                                                Ext.getCmp("i_is_expense_monthlyID").show();
                                                                            } else {
                                                                                Ext.getCmp("i_is_expense_monthlyID").hide();
                                                                            }
                                                                        },
                                                                    },
                                                                },
                                                        
                                                                {
                                                                    xtype: "button",
                                                                    id: "bnt_SetDebt",
                                                                    fieldLabel: "กำหนดตั้งหนี้ค่าใช้จ่าย",
                                                                    text: "กำหนดตั้งหนี้ค่าใช้จ่าย",
                                                                    // hidden: true,
                                                                    readOnly: true,
                                                                    handler: function () {
                                                                        Ext.dc_expense_budget_in_tor = new Ext.data.JsonStore({
                                                                            storeId: "myStore1",
                                                                            // autoLoad: true,
                                                                            url: "tor/api/mnTorController.php",
                                                                            root: "data",
                                                                            baseParams: {mode: "DC_EXPENSE_BUDGET_IN_TOR",
                                                                            sp_tor_id: Ext.HDR_ID
                                                                            , sp_tor_contract_id: Ext.SelectStore.data.sp_tor_contract_id}, //Permission i_read
                                                                            idProperty: "id",
                                                                            totalProperty: "totalCount",
                                                                            fields: ["id", "c_name", "f_total"],
                                                                        });
                                                                        Ext.po_expense_in_tor = new Ext.data.JsonStore({
                                                                            storeId: "myStore1",
                                                                            autoLoad: true,
                                                                            url: "tor/api/mnTorController.php",
                                                                            root: "data",
                                                                            baseParams: {mode: "DC_EXPENSE_IN_TOR",
                                                                            sp_tor_id: Ext.HDR_ID
                                                                            , sp_tor_contract_id: Ext.SelectStore.data.sp_tor_contract_id}, //Permission i_read
                                                                            idProperty: "id",
                                                                            totalProperty: "totalCount",
                                                                            fields: ["id", "c_name", "f_total"],
                                                                        });

                                                                        Ext.sp_gl_monthly_hdr = new Ext.data.JsonStore({
                                                                            storeId: "myStore1",
                                                                            // autoLoad: true,
                                                                            url: "tor/api/mnTorController.php",
                                                                            root: "data",
                                                                            baseParams: {mode: "SP_GL_MONTHLY_HDR",
                                                                            sp_tor_id: Ext.HDR_ID, 
                                                                            sp_tor_contract_id: Ext.SelectStore.data.sp_tor_contract_id}, //Permission i_read
                                                                            idProperty: "id",
                                                                            totalProperty: "totalCount",
                                                                            fields: ["sp_gl_monthly_hdr_id", "i_month_total", "f_total", "d_doc_date", "dc_acc_id", "c_dc_acc"
                                                                            , "dc_cost_id", "c_comment","gl_sp_bg_hdr_id"],
                                                                        });

                                                                        Ext.sp_gl_monthly_dtl = new Ext.data.JsonStore({
                                                                            // autoLoad: true,
                                                                            url: "tor/api/mnTorControllerGl.php",
                                                                            root: "data",
                                                                            baseParams: {mode: "LIST_SP_GL_MONTHLY_DTL", 
                                                                            sp_gl_monthly_hdr_id: 0 
                                                                            }, //Permission i_read
                                                                            idProperty: "id",
                                                                            totalProperty: "totalCount",
                                                                            fields: ["sp_gl_monthly_dtl_id", "i_month",
                                                                                "dc_expense_budget_type_id", "dc_acc_id","i_send_gl",
                                                                                "gl_sp_dc_hdr_id", "f_month_total",
                                                                                "d_doc_date", "c_comment", "po_expense_id",
                                                                                "gl_sp_bg_hdr_id", "bg_expense_count","gl_sp_bg_hdr_count"],  
                                                                        });
                                                                        Ext.dc_expense_budget_in_tor.reload({
                                                                            callback: function (record1, operation, success) {
                                                                                if (success) {
                                                                                    Ext.sp_gl_monthly_hdr.reload({
                                                                                        callback: function (record2, operation, success) {
                                                                                            if (success) {
                                                                                                if (Ext.sp_gl_monthly_hdr.data.length > 0) {
                                                                                                    Ext.sp_gl_monthly_dtl.reload({
                                                                                                        params: {mode: "LIST_SP_GL_MONTHLY_DTL", 
                                                                                                        sp_gl_monthly_hdr_id: Ext.sp_gl_monthly_hdr.data.items[0].data.sp_gl_monthly_hdr_id,
                                                                                                        sp_tor_id: Ext.HDR_ID,
                                                                                                        sp_tor_contract_id: Ext.SelectStore.data.sp_tor_contract_id
                                                                                                    },
                                                                                                        callback: function (record3, operation, success) {
                                                                                                            if (success) {
                                                                                                                Ext.getCmp("sp_gl_monthly_hdr_id").setValue(Ext.sp_gl_monthly_hdr.data.items[0].data.sp_gl_monthly_hdr_id);
                                                                                                                Ext.getCmp("i_month_total").setValue(Ext.sp_gl_monthly_hdr.data.items[0].data.i_month_total);
                                                                                                                Ext.getCmp("d_date_monthly_hdr").setValue(Ext.sp_gl_monthly_hdr.data.items[0].data.d_doc_date);
                                                                                                               // Ext.getCmp("po_expense_id").setValue(Ext.sp_gl_monthly_hdr.data.items[0].data.po_expense_id);
                                                                                                                // Ext.getCmp("dc_acc_idID").setValue(Ext.sp_gl_monthly_hdr.data.items[0].data.dc_acc_id);
                                                                                                                // Ext.getCmp("gl_sp_dc_hdr_idID").setValue(Ext.sp_gl_monthly_hdr.data.items[0].data.dc_acc_id);
                                                                                                                // Ext.getCmp("dc_acc_idID_Name").setValue(Ext.sp_gl_monthly_hdr.data.items[0].data.c_dc_acc);
                                                                                                                Ext.getCmp("text_dc_expense_budget").update(text_dc_expense_budget());
                                                                                                            
                                                                                                                Ext.NMU_gl_sp_hdr_tor = new Ext.data.JsonStore({
                                                                                                                    storeId: "myStoreGlSpHdr",
                                                                                                                    autoLoad: true,
                                                                                                                    url: "../sp/api/All_DcExpense.php",
                                                                                                                    root: "data",
                                                                                                                    baseParams: {type: "NMU_gl_sp_hdr_tor"  , 
                                                                                                                    sp_tor_id: Ext.HDR_ID, 
                                                                                                                    sp_tor_contract_id: Ext.SelectStore.data.sp_tor_contract_id
                                                                                                                        }, //Permission i_read
                                                                                                                    idProperty: "id",
                                                                                                                    totalProperty: "totalCount",
                                                                                                                    fields: ["id", "c_name","bg_expense_id","gl_sp_dc_hdr_id"],
                                                                                                                });
                                                                                                                    let gl_sp_hdr = Ext.selectRow.data.gl_sp_bg_hdr_id;
                                                                                                                    let id_1 = getStoreItems(Ext.NMU_gl_sp_hdr, gl_sp_hdr, "id");
                                                                                                                    let id_2 = getStoreItems(Ext.NMU_gl_sp_hdr_tor, gl_sp_hdr, "id");
                                                                                                                    if (id_1 != id_2) {
                                                                                                                        gl_sp_hdr_id =  Ext.NMU_gl_sp_hdr
                                                                                                                    } else {
                                                                                                                        expense_expire = Ext.NMU_gl_sp_hdr_tor
                                                                                                                    }
                                                                                                            
                                                                                                            
                                                                                                            }
                                                                                                        },
                                                                                                    });
                                                                                                } else {
                                                                                                    Ext.getCmp("sp_gl_monthly_hdr_id").setValue(0);
                                                                                                }
                                                                                            }
                                                                                        },
                                                                                    });
                                                                                }
                                                                            },
                                                                        });
                                                                        Ext.storeAccExpense = new Ext.data.JsonStore({
                                                                            storeId: "myStore1",
                                                                            autoLoad: true,
                                                                            url: "../sp/api/All_DcExpense.php",
                                                                            root: "data",
                                                                            baseParams: {type: "storeAccExpense"}, //Permission i_read
                                                                            idProperty: "id",
                                                                            totalProperty: "totalCount",
                                                                            fields: ["id", "c_code", "c_name"],
                                                                        });
                                                                        Ext.NMU_gl_sp_hdr = new Ext.data.JsonStore({
                                                                            storeId: "myStoreGlSpHdr",
                                                                            autoLoad: true,
                                                                            url: "../sp/api/All_DcExpense.php",
                                                                            root: "data",
                                                                            baseParams: {type: "GlSpHdr"  
                                                                            ,po_expense_id: Ext.SelectStore.data.po_expense_id

                                                                                }, //Permission i_read
                                                                            idProperty: "id",
                                                                            totalProperty: "totalCount",
                                                                            fields: ["id", "c_name","bg_expense_id","gl_sp_dc_hdr_id"],
                                                                        });
                                                                        Ext.group = new Ext.data.JsonStore({
                                                                            storeId: "myStore1",
                                                                            autoLoad: true,
                                                                            url: "../sp/api/All_DcExpense.php",
                                                                            root: "data",
                                                                            baseParams: {type: "group" 
                                                                            ,po_expense_id: Ext.SelectStore.data.po_expense_id },
                                                                            totalProperty: "totalCount",
                                                                            fields: ["bg_expense_group"],
                                                                        });
                                                                        Ext.NMU_gl_sp_hdr_tor = new Ext.data.JsonStore({
                                                                            storeId: "myStoreGlSpHdr",
                                                                            autoLoad: true,
                                                                            url: "../sp/api/All_DcExpense.php",
                                                                            root: "data",
                                                                            baseParams: {type: "NMU_gl_sp_hdr_tor"  , 
                                                                            sp_tor_id: Ext.HDR_ID, 
                                                                            sp_tor_contract_id: Ext.SelectStore.data.sp_tor_contract_id
                                                                                }, //Permission i_read
                                                                            idProperty: "id",
                                                                            totalProperty: "totalCount",
                                                                            fields: ["id", "c_name","bg_expense_id","gl_sp_dc_hdr_id"],
                                                                        });

                                                                        Ext.dc_expense_id = new Ext.data.JsonStore({
                                                                            storeId: "myStore1",
                                                                            autoLoad: true,
                                                                            url: "../sp/api/All_DcExpense.php",
                                                                            root: "data",
                                                                            baseParams: {type: "dc_expense_id"}, //Permission i_read
                                                                            idProperty: "id",
                                                                            totalProperty: "totalCount",
                                                                            fields: ["id", "c_name", "gl_sp_dc_hdr_id"],
                                                                        });

                                                                        Ext.PopAccForm = new Ext.ux.Poplov({
                                                                            text: "กรุณาเลือกรายการบัญชี...",
                                                                            id: "dc_acc_idID", //go to relation
                                                                            iconCls: "page_magnify",
                                                                            valueHidden: "dc_acc_id", //go to hidden
                                                                            store: Ext.storeAccExpense,
                                                                            headerGrid: columnMini2,
                                                                            widthText: 400,
                                                                            fieldLabel: "กรุณาเลือกรายการบัญชี...",
                                                                        });
                                                                        let storeDtlRecord = Ext.data.Record.create([
                                                                            {name: "i_month"},
                                                                            {name: "dc_expense_budget_type_id"},
                                                                            {name: "dc_acc_id"},
                                                                            {name: "bg_budget_dtl_overlap_id"},
                                                                            {name: "f_total"},
                                                                            {name: "d_doc_date"},
                                                                            {name: "c_code_ref"},
                                                                            {name: "c_comment"},
                                                                            {name: "gl_sp_bg_hdr_id"}
                                                                        ]);
                                                                        new Ext.Window({
                                                                            title: "ตั้งหนี้ค่าใช่จ่าย",
                                                                            id: "win-sp_gl_monthly",
                                                                            width: Ext.getCmp("contenterCenter").getWidth() - 10,
                                                                            height: Ext.getCmp("contenterCenter").getHeight() - 10,
                                                                            modal: true,
                                                                            plain: true,
                                                                            layout: "fit",
                                                                            maximizable: true,
                                                                            collapsible: true,
                                                                            closable: true,
                                                                            frame: true,
                                                                            layout: {
                                                                                type: "vbox",
                                                                                align: "stretch",
                                                                            },
                                                                            defaults: {
                                                                                xtype: "panel",
                                                                                flex: 1,
                                                                            },
                                                                            constrainHeader: true,
                                                                            closable: true,
                                                                            border: false,
                                                                            viewConfig: {forceFit: true},
                                                                            items: [
                                                                                {
                                                                                    xtype: "form",
                                                                                    id: "form-widgets",
                                                                                    // url: "api/mnDcUser.php",
                                                                                    frame: true,
                                                                                    labelWidth: 100,
                                                                                    bodyStyle: {
                                                                                        padding: "10px 20px",
                                                                                    },
                                                                                    defaults: {
                                                                                        anchor: "100%",
                                                                                        msgTarget: "side",
                                                                                    },
                                                                                    items: [
                                                                                        {
                                                                                            xtype: "hidden",
                                                                                            id: "sp_gl_monthly_hdr_id",
                                                                                        },
                                                                                        {
                                                                                            fieldLabel: "จำนวนเดือน ",
                                                                                            id: "i_month_total",
                                                                                            emptyText: "กรุณากรอกจำนวนเตือน",
                                                                                            xtype: "textfield",
                                                                                            anchor: "35%",
                                                                                            style: "text-align: center",
                                                                                        },
                                                                                        {
                                                                                            fieldLabel: "วันที่บันทึก ",
                                                                                            id: "d_date_monthly_hdr",
                                                                                            xtype: "datefield",
                                                                                            anchor: "35%",
                                                                                            validator: function (val) {
                                                                                                if (!Ext.isEmpty(val)) {
                                                                                                    return true;
                                                                                                } else {
                                                                                                    return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                                                                                }
                                                                                            },
                                                                                        },
                                                                                        // {
                                                                                        //     xtype: "compositefield",
                                                                                        //     fieldLabel: "ผังบัญชี ",
                                                                                        //     anchor: "100%",
                                                                                        //     msgTarget: "under",
                                                                                        //     items: [Ext.PopAccForm.mini],
                                                                                        // },
                                                                                        {
                                                                                            fieldLabel: "วงเงิน ",
                                                                                            id: "f_total_all_month",
                                                                                            xtype: "textfield",
                                                                                            readOnly: true,
                                                                                            anchor: "30%",
                                                                                            style: "color:blue; text-align: right;",
                                                                                            listeners: {
                                                                                                Change: function (value) {
                                                                                                    this.fn();
                                                                                                },
                                                                                                blur: function () {
                                                                                                    this.fn();
                                                                                                },
                                                                                                afterrender: function () {
                                                                                                    this.fn = function () {
                                                                                                        var val = 0;
                                                                                                        val = this.getValue();
                                                                                                        var f_total = Ext.getCmp("f_totalID").getValue();
                                                                                                        f_total = parseFloat(f_total.replace(/,/g, "") / 1);
                                                                                                        this.setValue(Ext.floatRenderer(f_total));
                                                                                                    };
                                                                                                    this.fn();
                                                                                                },
                                                                                            },
                                                                                        },
                                                                                        {
                                                                                            id: "fieldsetID",
                                                                                            xtype: "fieldset",
                                                                                            anchor: "40%",
                                                                                            title: "ข้อมูลเงินวง PR เหลือแยกตามแหล่งเงิน ",
                                                                                            autoHeight: true,
                                                                                            // defaultType: 'radio', // each item will be a radio button
                                                                                            items: [
                                                                                                {
                                                                                                    xtype: "label",
                                                                                                    id: "text_dc_expense_budget",
                                                                                                    // html: "<span style='white-space: nowrap;'>1. เงินกองทุนพัฒนาคณะแพทยศาสตร์วชิรพยาบาล : 20,000.00 บาท<br></span>",
                                                                                                    html: Ext.text_expense_budget,
                                                                                                    listeners: {
                                                                                                        afterrender: function () {
                                                                                                            Ext.dc_expense_budget_in_tor.reload({
                                                                                                                callback: function (recordx, operation, success) {
                                                                                                                    if (success) {
                                                                                                                        Ext.getCmp("text_dc_expense_budget").update(text_dc_expense_budget());
                                                                                                                    }
                                                                                                                },
                                                                                                            });
                                                                                                        },
                                                                                                    },
                                                                                                },
                                                                                            ],
                                                                                            listeners: {
                                                                                                afterrender: function () {},
                                                                                                beforerender: function () {
                                                                                                    this.fn = function () {};
                                                                                                    this.fn();
                                                                                                },
                                                                                            },
                                                                                        },
                                                                                    ],
                                                                                },

                                                                                new Ext.grid.EditorGridPanel({
                                                                                    id: "gridEditor_sp_gl_monthly",
                                                                                    region: "center",
                                                                                    height: 450,                                                                          layout: "fit",
                                                                                    border: true,
                                                                                    stripeRows: true,
                                                                                    loadMask: true,
                                                                                    clicksToEdit: 1,
                                                                                    store: Ext.sp_gl_monthly_dtl,
                                                                                    listeners: {
                                                                                        afteredit: function () {
                                                                                            Ext.getCmp("text_dc_expense_budget").update(text_dc_expense_budget());
                                                                                            
                                                                                        },
                                                                                        beforerender: function () {
                                                                                            this.thisCick = function (grid, rowIndex, columnIndex, e) {
                                                                                                var record = grid.getStore().getAt(rowIndex);
                                                                                                if (columnIndex === grid.getColumnModel().getIndexById("delete_dtl_monthly")) {

                                                                                                    Ext.sp_gl_monthly_dtl.removeAt(rowIndex);

                                                                                                } else if (columnIndex === grid.getColumnModel().getIndexById("i_viewID")) {


                                                                                                    new Ext.Window({
                                                                                                        collapsible: true,
                                                                                                        maximizable: false,
                                                                                                        title: "คู่บัญชีทีจับคู่ ขณะบันทึกค่าใช้จ่ายรายเดือน",
                                                                                                        width: Ext.getCmp("contenterCenter").getWidth() - 250,
                                                                                                        height: Ext.getCmp("contenterCenter").getHeight() - 105,
                                                                                                        layout: "fit",
                                                                                                        id: "winPeriodHdrID",
                                                                                                        modal: false,
                                                                                                        plain: true,
                                                                                                        buttonAlign: "left",
                                                                                                        items: [{
                                                                                                                xtype: "grid",
                                                                                                                height: 500,
                                                                                                                store: new Ext.data.JsonStore({/*      
                                                                                                                    "gl_sp_bg_dtl_id":2,
                                                                                                                    "gl_sp_bg_hdr_id":1,
                                                                                                                    "gl_sp_dc_dtl_id":1,
                                                                                                                    "i_rank":1,
                                                                                                                    "i_type_dr_cr":1,
                                                                                                                    "dc_acc_id":1060,
                                                                                                                    "c_code":"50301020243",
                                                                                                                    "c_name":"ค่าเช่าที่ดิน"*/
                                                                                                                    storeId: "myStorewinPeriodHdrID",
                                                                                                                    autoDestroy: false,
                                                                                                                    autoLoad: true,
                                                                                                                    url: "tor/api/mnTorControllerGl.php",
                                                                                                                    root: "data", //LIST_PERIOD_SUB_HDR
                                                                                                                    baseParams: {
                                                                                                                        mode: "LIST_GL_CONF",
                                                                                                                        gl_sp_bg_hdr_id: record.get('gl_sp_bg_hdr_id'),
                                                                                                                        sp_gl_monthly_dtl_id: record.get('sp_gl_monthly_dtl_id'),
                                                                                                                        i_is_conf: (0 ? 1 : 0)
                                                                                                                    }, //Permission i_read 
                                                                                                                    idProperty: "id",
                                                                                                                    totalProperty: "totalCount",
                                                                                                                    fields: [
                                                                                                                        {name: "no"},
                                                                                                                        {name: "id"},
                                                                                                                        {name: "gl_sp_bg_dtl_id"},
                                                                                                                        {name: "gl_sp_bg_hdr_id"},
                                                                                                                        {name: "gl_sp_dc_dtl_id"},
                                                                                                                        {name: "i_rank"},
                                                                                                                        {name: "i_type_dr_cr"},
                                                                                                                        {name: "c_type_dr_cr"},
                                                                                                                        {name: "dc_acc_id"},
                                                                                                                        {name: "c_code"},
                                                                                                                        {name: "c_name"},
                                                                                                                    ]
                                                                                                                }),
                                                                                                                columns: [
                                                                                                                    // new Ext.grid.RowNumberer({width: 35, header: " ที่ ", dataIndex: "no"}),
                                                                                                                    {header: "ID System", hidden: true, dataIndex: "id"},
                                                                                                                    {header: "ที่", align: "center", width: 50, dataIndex: "i_rank"},
                                                                                                                    {header: "เงื่อนไขดุลบัญชี", align: "left", width: 100, dataIndex: "c_type_dr_cr"},
                                                                                                                    {header: "รหัส", align: "left", width: 200, dataIndex: "c_code"},
                                                                                                                    {header: "ชื่อ", align: "left", width: 500, dataIndex: "c_name"},
                                                                                                                ],
                                                                                                            }] //end ITEMS
                                                                                                    }).show();
                                                                                                }
                                                                                            };
                                                                                        },
                                                                                        blur:function(){ 
                                                                                              
                                                                                        },
                                                                                        afterrender: function () {
                                                                                            Ext.getCmp("gridEditor_sp_gl_monthly").on("cellclick", this.thisCick, this);
                                                                                        },
                                                                                    },
                                                                                    tbar: [
                                                                                        {
                                                                                            xtype: "button",
                                                                                            iconCls: "icon-add",
                                                                                            text: "เพิ่มรายการ",
                                                                                            handler: function () {
                                                                                                var dc_expense_budget_type_id = Ext.dc_expense_budget_in_tor.data.length == 1 ? Ext.dc_expense_budget_in_tor.data.items[0].data.id : "";
                                                                                                var po_expense = Ext.po_expense_in_tor.data.length == 1 ? Ext.po_expense_in_tor.data.items[0].data.id : "";

                                                                                                let myNewRecord = new storeDtlRecord({
                                                                                                    sp_gl_monthly_dtl_id: 0,
                                                                                                    i_month: "",
                                                                                                    dc_expense_budget_type_id: dc_expense_budget_type_id,
                                                                                                    po_expense : po_expense,
                                                                                                    // dc_acc_id: Ext.getCmp("dc_acc_idID").getValue(),
                                                                                                    gl_sp_dc_hdr_id: "",
                                                                                                    bg_budget_dtl_overlap_id: "",
                                                                                                    f_month_total: "0",
                                                                                                    d_date: "",
                                                                                                    c_comment: "",
                                                                                                });
                                                                                                Ext.sp_gl_monthly_dtl.insert(0, myNewRecord);
                                                                                            },
                                                                                        },
                                                                                    ],
                                                                                    viewConfig: {forceFit: true},
                                                                                    columns: [
                                                                                        {
                                                                                            header: "เดือน",
                                                                                            sortable: false,
                                                                                            align: "center",
                                                                                            dataIndex: "i_month",
                                                                                            width: 60,
                                                                                            editor: new Ext.form.TextField({
                                                                                                style: "text-align: center",
                                                                                                listeners: {
                                                                                                    afterrender: function () {
                                                                                                        this.fn = function () {
                                                                                                            // this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                                                                                                        };
                                                                                                    },
                                                                                                    Change: function (value) {
                                                                                                        this.fn();
                                                                                                    },
                                                                                                },
                                                                                            }),
                                                                                        },
                                                                                        {
                                                                                            header: "แหล่งเงิน",
                                                                                            sortable: false,
                                                                                            align: "center",
                                                                                            dataIndex: "dc_expense_budget_type_id",
                                                                                            width: 180,
                                                                                            editor: new Ext.form.ComboBox({
                                                                                                mode: "local",
                                                                                                id: "editor_dc_cost_id",
                                                                                                store: Ext.dc_expense_budget_in_tor,
                                                                                                valueField: "id",
                                                                                                displayField: "c_name",
                                                                                                triggerAction: "all",
                                                                                                forceSelection: true,
                                                                                                selectOnFocus: true,
                                                                                                typeAhead: false,
                                                                                                emptyText: "กรุณาเลือก...",
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
                                                                                            }),
                                                                                            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                                                                                if (record.data.i_type == 1 || record.data.i_type == 2) {
                                                                                                    metaData.attr = "style='text-align: right; font-weight: bold;'";
                                                                                                    let name = record.data.i_type == 1 ? getStoreItems(Ext.dc_expense_budget_type, value, "c_name") : "รวมทั้งสิ้น";
                                                                                                    name = name != "" ? name : "- ไม่ระบุหน่วยงาน -";
                                                                                                    return name;
                                                                                                } else if (value != "" && value != undefined) {
                                                                                                    metaData.attr = "style='text-align: left;'";
                                                                                                    let name = getStoreItems(Ext.dc_expense_budget_type, value, "c_name");
                                                                                                    return name;
                                                                                                } else {
                                                                                                    metaData.attr = "style='text-align: center; color:red;'";
                                                                                                    return "-";
                                                                                                }
                                                                                            },
                                                                                        },
                                                                                        {
                                                                                            header: "งบประมาณ LV.4",
                                                                                            sortable: false,
                                                                                            align: "center",
                                                                                            dataIndex: "po_expense_id",
                                                                                            width: 250,
                                                                                            editor: new Ext.form.ComboBox({
                                                                                                mode: "local",
                                                                                                id: "editor_dc_expense_id",
                                                                                                store: Ext.po_expense_in_tor,
                                                                                                valueField: "id",
                                                                                                displayField: "c_name",
                                                                                                triggerAction: "all",
                                                                                                forceSelection: true,
                                                                                                selectOnFocus: true,
                                                                                                typeAhead: false,
                                                                                                emptyText: "กรุณาเลือก...",
                                                                                                listeners: {
                                                                                                    afterrender: function () {
                                                                                                        var record = Ext.NMU_gl_sp_hdr.getAt(this.gridEditor.row);
                                                                                                        setParentExpense(4, this.getValue(), this.gridEditor.row);
                                                                                                        this.fn = function () {};
                                                                                                    },
                                                                                                    select: function (combo, record, index) {
                                                                                                        Ext.NMU_gl_sp_hdr.setBaseParam("bg_expense_id", record.get("id"));
                                                                                                        Ext.NMU_gl_sp_hdr.reload({
                                                                                                            callback: function (record_1, operation, success) {
                                                                                                            if (success) {
                                                                                                                let row_record = Ext.sp_gl_monthly_dtl.getAt(Ext.getCmp("editor_dc_expense_id").gridEditor.row);
                                                                                                                var ss = Ext.NMU_gl_sp_hdr.findExact("bg_expense_id", record.data.id);
                                                                                                                if (ss >= 0) {
                                                                                                                var value = Ext.NMU_gl_sp_hdr.data.items[ss].data.id;
                                                                                                                row_record.set("gl_sp_bg_hdr_id", value);
                                                                                                                }
                                                                                                                // Ext.sp_gl_monthly_dtl.getAt(Ext.getCmp("editor_dc_expense_id").gridEditor.row).set("gl_sp_bg_hdr_id",Ext.NMU_gl_sp_hdr.data.items[ss].data.id)                                 
                                                                                                                // this.fn();
                                                                                                            }
                                                                                                            },
                                                                                                        });
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
                                                                                            }),
                                                                                            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                                                                                if (record.data.i_type == 1 || record.data.i_type == 2) {
                                                                                                    metaData.attr = "style='text-align: right; font-weight: bold;'";
                                                                                                    let name = record.data.i_type == 1 ? getStoreItems(Ext.dc_expense_id, value, "c_name") : "รวมทั้งสิ้น";
                                                                                                    name = name != "" ? name : "- ค่าใช้จ่าย-";
                                                                                                    return name;
                                                                                                    
                                                                                                } else if (value != "" && value != undefined) {
                                                                                                    metaData.attr = "style='text-align: left;'";
                                                                                                    let name = getStoreItems(Ext.dc_expense_id, value, "c_name");
                                                                                                    return name;
                                                                                                } else {
                                                                                                    metaData.attr = "style='text-align: center; color:red;'";
                                                                                                    return "-";
                                                                                                }
                                                                                            },
                                                                                        },
                                                                                        {
                                                                                            header: "ประเภทรายจ่าย",
                                                                                            sortable: false,
                                                                                            hidden : true,
                                                                                            align: "center",
                                                                                            dataIndex: "gl_sp_bg_hdr_id",
                                                                                            width: 400,
                                                                                            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                                                                                if (value != "" && value != undefined) {
                                                                                                    metaData.attr = "style='text-align: left;'";
                                                                                                    let name = getStoreItems(Ext.NMU_gl_sp_hdr, value, "c_name");
                                                                                                    return name;
                                                                                                } else {
                                                                                                    metaData.attr = "style='text-align: center; color:red;'";
                                                                                                    return "-";
                                                                                                }
                                                                                                },
                                                                                            },
                                                                                        {
                                                                                            header: "จับคู่รายการจากระบบจัดซื้อ&พัสดุกับระบบปัญชีฯ",
                                                                                            sortable: false,
                                                                                            align: "center",
                                                                                            dataIndex: "gl_sp_bg_hdr_id",
                                                                                            width: 500,
                                                                                            editor: new Ext.form.ComboBox({
                                                                                                mode: "local",
                                                                                                id: "editor_gl_sp_dc_hdr_id",
                                                                                                store: Ext.NMU_gl_sp_hdr,
                                                                                                valueField: "id",
                                                                                                displayField: "c_name",
                                                                                                triggerAction: "all",
                                                                                                forceSelection: true,
                                                                                                selectOnFocus: true,
                                                                                                typeAhead: false,
                                                                                                emptyText: "กรุณาเลือก...",
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
                                                                                            }),
                                                                                            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                                                                                Ext.NMU_gl_sp_hdr.setBaseParam("bg_expense_id", record.get("id"));
                                                                                                    let row_record = Ext.sp_gl_monthly_dtl.getAt(Ext.getCmp("editor_gl_sp_dc_hdr_id").gridEditor);
                                                                                                    var ss = Ext.NMU_gl_sp_hdr.findExact("bg_expense_id", record.data.id);
                                                                                                    if (ss >= 0) {
                                                                                                    var value = Ext.NMU_gl_sp_hdr.data.items[ss].data.id;
                                                                                                    row_record.set("gl_sp_bg_hdr_id", value);
                                                                                                    }
                                                                                                
                                                                                                if (value != "" && value != undefined) {
                                                                                                    metaData.attr = "style='text-align: left;'";
//                                                                                                    let name = getStoreItems(Ext.dc_expense_id, value, "c_name");
                                                                                                    let name = getStoreItems(Ext.NMU_gl_sp_hdr, value, "c_name");
                                                                                                    return name;
                                                                                                } else {
                                                                                                    metaData.attr = "style='text-align: center; color:red;'";
                                                                                                    return "-";
                                                                                                }
                                                                                            }, 
                                                                                        },
                                                                                        {
                                                                                            header: "รายละเอียดการจับคู่บัญชี",
                                                                                            sortable: false,
                                                                                            hidden: false,
                                                                                            align: "center",
                                                                                            dataIndex: "i_month",
                                                                                            id: "i_viewID",
                                                                                            width: 160,
                                                                                            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                                                                                // var ss = Ext.group.get("bg_expense_group");
                                                                                                // Ext.selectRow.get("i_type_contract") == 3
                                                                                                // console.log(record.data.bg_expense_count)
                                                                                                // let name = getStoreItems(Ext.group, value, "bg_expense_group");
                                                                                                    // return name;
                                                                                                if (record.data.bg_expense_count > 1){
                                                                                                metaData.attr = "style='text-align: center; color:red;'";
                                                                                                Ext.Msg.alert("แจ้งเตือน","คู่บัญชีมีมากกว่า 1 รายการ กรุณาเลือก");
                                                                                                // alert("คู่บัญชีมีมากกว่า 1 รายการ กรุณาเลือก")
                                                                                                return 'คู่บัญชีมีมากกว่า 1 รายการ กรุณาเลือก ';
                                                                                                } else if (record.data.bg_expense_count ==1 && record.data.gl_sp_bg_hdr_count == 1 ){
                                                                                                    metaData.attr = "style='text-align: center; color:blue;'";
                                                                                                return 'ดูรายละเอียด';
                                                                                                } else  if (record.data.gl_sp_bg_hdr_count == 0 && record.data.bg_expense_count ==1){
                                                                                                    metaData.attr = "style='text-align: center; color:red;'";
                                                                                                    Ext.Msg.alert("แจ้งเตือน","รายการนี้ไม่มีคู่ผังบัญชี  กรุณาเพิ่มก่อนบันทึกรายการ");
                                                                                                    // alert("คู่บัญชีมีมากกว่า 1 รายการ กรุณาเลือก")
                                                                                                    return ' ไม่มีคู่ผังบัญชี ';
                                                                                                    } 
                                                                                            },
                                                                                        },
 
                                                                                        {
                                                                                            header: "ผังบัญชี",
                                                                                            hidden: true,
                                                                                            sortable: false,
                                                                                            align: "center",
                                                                                            dataIndex: "dc_acc_id",
                                                                                            width: 250,
                                                                                            editor: new Ext.form.ComboBox({
                                                                                                mode: "local",
                                                                                                id: "editor_dc_acc_id",
                                                                                                store: Ext.NMU_dc_acc,
                                                                                                valueField: "id",
                                                                                                displayField: "c_name",
                                                                                                triggerAction: "all",
                                                                                                forceSelection: true,
                                                                                                selectOnFocus: true,
                                                                                                typeAhead: false,
                                                                                                emptyText: "กรุณาเลือก...",
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
                                                                                            }),
                                                                                            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                                                                                if (record.data.i_type == 1 || record.data.i_type == 2) {
                                                                                                    metaData.attr = "style='text-align: right; font-weight: bold;'";
                                                                                                    let name = record.data.i_type == 1 ? getStoreItems(Ext.NMU_dc_acc, value, "c_name") : "รวมทั้งสิ้น";
                                                                                                    name = name != "" ? name : "- ไม่ระบุหน่วยงาน -";
                                                                                                    return name;
                                                                                                } else if (value != "" && value != undefined) {
                                                                                                    // metaData.attr = "style='text-align: left;'";
                                                                                                    // let name = getStoreItems(Ext.NMU_dc_acc, value, "c_name");
                                                                                                    // return name;
                                                                                                } else {
                                                                                                    metaData.attr = "style='text-align: center; color:red;'";
                                                                                                    return "-";
                                                                                                }
                                                                                            },
                                                                                        },
                                                                                        {
                                                                                            header: "จำนวนเงิน",
                                                                                            sortable: false,
                                                                                            align: "center",
                                                                                            dataIndex: "f_month_total",
                                                                                            width: 110,
                                                                                            editor: new Ext.form.TextField({
                                                                                                style: "text-align: right",
                                                                                                // enableKeyEvents: true,
                                                                                                listeners: {
                                                                                                    afterrender: function () {
                                                                                                        this.fn = function () {
                                                                                                            this.setValue(this.getValue() <= 0 ? 0 : this.getValue());
                                                                                                            this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                                                                                                        };
                                                                                                    },
                                                                                                    Change: function (value) {
                                                                                                        // text_dc_expense_budget();
                                                                                                        this.fn();
                                                                                                    },
                                                                                                },
                                                                                            }),
                                                                                            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                                                                                if (record.data.i_type == 1 || record.data.i_type == 2) {
                                                                                                    metaData.attr = "style='text-align: right; font-weight: bold;'";
                                                                                                    return floatRenderer(floatMinus(value.replace(/,/g, ""), 2));
                                                                                                } else if (value) {
                                                                                                    metaData.attr = "style='text-align: right;'";
                                                                                                    return floatRenderer(floatMinus(value.replace(/,/g, ""), 2));
                                                                                                } else {
                                                                                                    metaData.attr = "style='text-align: right; color:red;'";
                                                                                                    return "-";
                                                                                                }
                                                                                            },
                                                                                        },
                                                                                        {
                                                                                            header: "วันที่",
                                                                                            sortable: false,
                                                                                            align: "center",
                                                                                            dataIndex: "d_doc_date",
                                                                                            editor: new Ext.form.DateField({}),
                                                                                            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                                                                                return value != "" && value != null ? shortThaiDate(value) : "";
                                                                                            },
                                                                                        },
                                                                                        {
                                                                                            header: "หมายเหตุ",
                                                                                            sortable: false,
                                                                                            hidden:true,
                                                                                            align: "center",
                                                                                            dataIndex: "c_comment",
                                                                                            width: 150,
                                                                                            editor: new Ext.form.TextField({
                                                                                                listeners: {
                                                                                                    afterrender: function () {
                                                                                                        this.fn = function () {};
                                                                                                    },
                                                                                                    Change: function (value) {
                                                                                                        this.fn();
                                                                                                    },
                                                                                                },
                                                                                            }),
                                                                                            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                                                                                metaData.attr = "style='text-align: left;'";
                                                                                                return value;
                                                                                                },
                                                                                                },
                                                                                                // {
                                                                                                // id: "delete_dtl_monthly",
                                                                                                // header: "ลบ",
                                                                                                // sortable: false,
                                                                                                // align: "center",
                                                                                                // width: 30,
                                                                                                // dataIndex: "id",
                                                                                                //     renderer: function (value, metaData, record, row, col, store, gridView) {
                                                                                                //     if (record.data.sp_tor_dtl_id < 1 ?? 0 == 0)
                                                                                                // return '<img src="../images/icons/table_delete.png"); style="cursor:pointer"/>';
                                                                                                //     },
                                                                                                //     },
                                                                                        {width: 20, dataIndex: ""},
                                                                                    ],
                                                                                    bbar: [
                                                                                        {
                                                                                            text: "&nbsp;บันทึกการตั้งหนี้ค่าใช้จ่าย&nbsp;",
                                                                                            id: "saveExtendTime",
                                                                                            iconCls: "icon-save",
                                                                                            handler: function () {
                                                                                                // alert("รอการทำการบันทึก");
                                                                                                // if ()
                                                                                                let msg = "";
                                                                                                let jsonArr = [];
                                                                                                let Arr_month_group = [];
                                                                                                let sto = Ext.sp_gl_monthly_dtl.data.items;
                                                                                                let msg_show = 0;
                                                                                                // console.log()
                                                                                                sto.forEach(function (v) {
                                                                                                    console.log(v) ;
                                                                                                    jsonArr.push({
                                                                                                        sp_gl_monthly_dtl_id: v.data.sp_gl_monthly_dtl_id,
                                                                                                        i_month: v.data.i_month,
                                                                                                        dc_expense_budget_type_id: v.data.dc_expense_budget_type_id,
                                                                                                        dc_acc_id: v.data.dc_acc_id,
                                                                                                        gl_sp_bg_hdr_id: v.data.gl_sp_bg_hdr_id,
                                                                                                        gl_sp_dc_hdr_id: v.data.gl_sp_dc_hdr_id,
                                                                                                        dc_acc_id:v.data.dc_acc_id,
                                                                                                        po_expense_id: v.data.po_expense_id,
                                                                                                        dc_creditor_id: Ext.getCmp("dc_creditor_idID").getValue(),
                                                                                                        f_month_total: v.data.f_month_total ? v.data.f_month_total.replace(/,/g, "") : "",
                                                                                                        d_date: Ext.util.Format.gridDate(v.data.d_doc_date, "Y-m-d"),
                                                                                                        c_comment: v.data.c_comment,
                                                                                                    });
                                                                                                    if (Arr_month_group.find((e) => e == v.data.i_month) == undefined) {
                                                                                                        Arr_month_group.push(v.data.i_month);
                                                                                                    }

                                                                                                });
                                                                                                for (var i = 1; i <= Ext.getCmp("i_month_total").getValue(); i++) {
                                                                                                    if (Arr_month_group.find((e) => e == i) == undefined) {
                                                                                                        msg += "<span style='white-space: nowrap;'>- กรุณาระบุรายละเอียดของเดือนที่ " + i + "</span><br>";
                                                                                                    }
                                                                                                }
                                                                                                if (Arr_month_group.length != Ext.getCmp("i_month_total").getValue()) {
                                                                                                    msg += "<span style='white-space: nowrap;'>- รายระเอียดเดือนไม่ตรงกับจำนวนเดือนที่กำหนด</span><br>";
                                                                                                }
                                                                                                /*if (msg_show == 1) {
                                                                                                 msg += "<span style='white-space: nowrap;'>- กรุณากรอกรายระเอียด</span><br>";
                                                                                                 }*/
                                                                                                if (Ext.getCmp("i_month_total").getValue() == "") {
                                                                                                    msg += "<span style='white-space: nowrap;'>- กรุณากรอกจำนวนเดือน</span><br>";
                                                                                                }
                                                                                                if (isNaN(Ext.getCmp("i_month_total").getValue())) {
                                                                                                    msg += "<span style='white-space: nowrap;'>- กรุณาจำนวนเดือนเป็นตัวเลข</span><br>";
                                                                                                }
                                                                                                // if (Ext.getCmp("dc_acc_idID").getValue() <= 0) {
                                                                                                //     // msg += "<span style='white-space: nowrap;'>- กรุณากรอกผังบัญชี</span><br>";
                                                                                                // }
                                                                                                if (Ext.not_equal == 1) {
                                                                                                    //  msg += "<span style='white-space: nowrap;'>- กรุณาตั้งหนี้ค่าใช้ค่าให้กับพอดีวงเงิน</span><br>";
                                                                                                }
                                                                                                if (Ext.sum_minus == 1) {
                                                                                                    msg += "<span style='white-space: nowrap;'>- วงเงินแหล่งเงินไม่เพียงพอ</span><br>";
                                                                                                }
                                                                                                if (msg == "") {
                                                                                                    Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
                                                                                                    Ext.Ajax.request({
                                                                                                        url: "tor/api/mnTorControllerGl.php",
                                                                                                        method: "POST",
                                                                                                        params: {
                                                                                                            mode: "UP_SP_GL_MONTHLY",
                                                                                                            sp_tor_id: Ext.HDR_ID,
                                                                                                            sp_tor_contract_id: Ext.SelectStore.data.sp_tor_contract_id,
                                                                                                            sp_gl_monthly_hdr_id: Ext.getCmp("sp_gl_monthly_hdr_id").getValue(),
                                                                                                            i_month_total: Ext.getCmp("i_month_total").getValue(),
                                                                                                            d_date_monthly_hdr: Ext.util.Format.date(Ext.getCmp("d_date_monthly_hdr").getValue(), "Y-m-d"),
                                                                                                            c_doc_ref: Ext.SelectStore.data.c_doc_ref,
                                                                                                            // dc_acc_idID: Ext.getCmp("dc_acc_idID").getValue(),
                                                                                                            dc_cost_id: Ext.selectRow.data.dc_cost_id,
                                                                                                            editor_dc_acc_id: Ext.getCmp("editor_dc_acc_id").getValue(),
                                                                                                            f_total: Ext.getCmp("f_total_all_month").getValue() ? Ext.getCmp("f_total_all_month").getValue().replace(/,/g, "") : "",
                                                                                                            data: JSON.stringify(jsonArr),
                                                                                                        },
                                                                                                        success: function (result, request) {
                                                                                                            Ext.getCmp("contenterCenter").getEl().unmask();
                                                                                                            let json = Ext.util.JSON.decode(result.responseText); //decode json
                                                                                                            Ext.Msg.alert("แจ้งเตือน", json.msg);
                                                                                                            Ext.getCmp("win-sp_gl_monthly").destroy();
                                                                                                            Ext.storeDtl.reload({
                                                                                                                callback: function (records, operation, success) {
                                                                                                                    Ext.sp_gl_monthly_dtl.reload({
                                                                                                                        callback: function (records, operation, success) {
                                                                                                                            if (json.success == true) {
                                                                                                                                Ext.Msg.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย");

                                                                                                                            }
                                                                                                                        }

                                                                                                                    });
                                                                                                                }
                                                                                                            });


                                                                                                        },
                                                                                                        failure: function (result, request) {
                                                                                                            Ext.MessageBox.alert("Failed", result.responseText); // connect error
                                                                                                        },
                                                                                                    });
                                                                                                } else {
                                                                                                    Ext.Msg.alert("แจ้งเตือน", msg);
                                                                                                }
                                                                                            },
                                                                                        },
                                                                                        "->",
                                                                                        {
                                                                                            id: "f_sum_monthly_hdr",
                                                                                            xtype: "textfield",
                                                                                            style: "text-align: right; font-weight: bold; color: green;",
                                                                                            width: 150,
                                                                                            readOnly: true,
                                                                                            value: "0.00",
                                                                                            listeners: {
                                                                                                afterlayout: function () {
                                                                                                    var height = Ext.getBody().getViewSize().height;
                                                                                                    if (this.getHeight() > height) {
                                                                                                        this.setHeight(height);
                                                                                                    }
                                                                                                    this.center();
                                                                                                },
                                                                                                afterrender: function () {
                                                                                                    this.fn = function () {
                                                                                                        let value = floatMinus(this.getValue().replace(/,/g, ""), 2);
                                                                                                        this.setValue(floatRenderer(value));
                                                                                                    };
                                                                                                },
                                                                                                Change: function (value) {
                                                                                                    this.fn();
                                                                                                },
                                                                                            },
                                                                                        },
                                                                                    ],
                                                                                }),
                                                                            ],
                                                                        }).show();
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
                                                            hidden: true ,
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
                                                    if (Ext.SelectStore.data.i_is_expense_monthly == 1) {
                                                        Ext.getCmp("i_is_expense_monthlyID").setValue(true);
                                                    } else {
                                                        Ext.getCmp("i_is_expense_monthlyID").setValue(null);
                                                    }
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

                                                                                        Ext.f_total_amt = Ext.selectRow.data.f_total_amt.replace(/\,/g,'');

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
