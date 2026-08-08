
Ext.Poplov_in = Ext.extend(Ext.Button, {
    config: {

    },
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
//        var headerGrid = this.headerGrid;
        var id = id;

        var setDefaultFilter = [
            ["c_code", "เลขที่ใบตรวจรับ"],
            ["c_arrive_code", "เลขที่ใบรับของ"],
            ["c_name", "รายการ"],
        ];
        var setFilter = [["c_code", "เลขที่ใบตรวจรับ"], ["c_name", "รายการ"]];

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
                allowBlank: true,
                editable: false,
                triggerAction: "all",
                typeAhead: false,
                value: Ext.isEmpty(defFilter) ? "c_code" : defFilter,
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
                            store.setBaseParam("mode", "SEARCH");
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
                store.setBaseParam("mode", "SEARCH");
                store.setBaseParam("filter", Ext.getCmp("filter" + id).getValue());
                store.setBaseParam("value", Ext.getCmp("value-box" + id).getValue());
                Ext.getCmp("win-pop-lov-modal-" + id)
                        .getStore()
                        .load();
            } else {
                store.setBaseParam("mode", "");
                Ext.getCmp("win-pop-lov-modal-" + id)
                        .getStore()
                        .load();
            }
        }

        var cellClick_lov = function (grid, rowIndex, columnIndex, e) {
            var record = grid.getStore().getAt(rowIndex);
            var TextShow = record.data.c_code + " " + record.data.c_name;

            Ext.getCmp(id).setValue(record.data.id);
            Ext.getCmp(nameID).setValue(TextShow);

            Ext.getCmp("win-pop-lov" + id).hide();
            Ext.getCmp("win-pop-lov" + id).destroy();
        };

        cellClick_lov = this.isCellClickGrid ? this.cellClickGrid : cellClick_lov;

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
                        store.setBaseParam("mode", "");
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
                                                SearchGrid(store, id); /*SearchEngin(store,id);*/
                                            },
                                        } /* ,' ',{
                                         text : "เคลียร์ค่า",
                                         id:'clearValue_'+id,
                                         iconCls: 'icon-clear',
                                         handler : function() {  
                                         Ext.getCmp(id).setValue('');
                                         Ext.getCmp(nameID).setValue('');  
                                         Ext.getCmp("win-pop-lov"+id).hide();  					
                                         Ext.getCmp("win-pop-lov"+id).destroy();  
                                         
                                         }
                                         } */,
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
                                        pageSize: 15,
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
Ext.onReady(function () {
    Ext.selectRow = null;
    Ext.poFormID = "grid-form-cheque";
    statusx = "add";
    let years = [];
    let currentTime = new Date();
    let now = currentTime.getFullYear() + 1;
    let id = currentTime.getFullYear() - 3;
    while (id <= now) {
        let c_name = id + 543;
        years.push({id, c_name});
        id++;
    }
//  TabWindowFOrom
//  allowBlank: false,
//  allowBlank: true,
    Ext.panelForm = function () {

        Ext.po_user = new Ext.data.JsonStore({
            autoDestroy: false,
            autoLoad: true,
            url: "../po/api/All_PoWorkingImpHdr.php",
            baseParams: {
                type: "po_user",
            },
            root: "data",
            idProperty: "id",
            fields: ["id", "c_name"],
        });
        Ext.po_emp = new Ext.data.JsonStore({
            autoDestroy: false,
            autoLoad: true,
            url: "../po/api/All_PoWorkingImpHdr.php",
            baseParams: {
                type: "po_emp",
            },
            root: "data",
            idProperty: "id",
            fields: ["id", "c_code", "c_name"],
        });
        Ext.po_user_permission = new Ext.data.JsonStore({
            autoDestroy: false,
            autoLoad: true,
            url: "../po/api/All_PoWorkingImpHdr.php",
            baseParams: {
                type: "po_user_permission",
            },
            root: "data",
            idProperty: "id",
            fields: ["id", "c_name"],
        });
        Ext.dc_cost = new Ext.data.JsonStore({
            autoDestroy: false,
            autoLoad: true,
            url: "../po/api/All_PoWorkingImpHdr.php",
            baseParams: {
                type: "dc_cost",
            },

            root: "data",
            idProperty: "id",
            fields: ["id", "c_code", "c_name"],
            listeners: {
                load: function (t, records, options) {
                    if (Ext.SS_I_TYPE_USER == 3) {
                        Ext.getCmp("dc_cost_idID").setValue(Ext.SS_DC_COST_ACC_ID);
                        Ext.getCmp("dc_cost_idID").readOnly = true;
                    }
                },
            },
        });
        Ext.po_creditor = new Ext.data.JsonStore({
            autoDestroy: false,
            autoLoad: false,
            url: "../po/api/All_PoWorkingImpHdr.php",
            baseParams: {
                type: "po_creditor",
            },
            root: "data",
            idProperty: "id",
            fields: ["id", "c_code", "c_name"],
        });
        Ext.po_creditor_transfer = new Ext.data.JsonStore({
            autoDestroy: false,
            autoLoad: false,
            url: "../po/api/All_PoWorkingImpHdr.php",
            baseParams: {
                type: "po_creditor_transfer",
            },
            root: "data",
            idProperty: "id",
            fields: ["id", "c_code", "c_name"],
        });
        Ext.dc_expense_budget_type = new Ext.data.JsonStore({
            autoDestroy: false,
            autoLoad: false,
            url: "../po/api/All_PoWorkingImpHdr.php",
            baseParams: {
                type: "dc_expense_budget_type",
            },
            root: "data",
            idProperty: "id",
            fields: ["id", "c_name"],
        });
        Ext.bg_expense_group = new Ext.data.JsonStore({
            autoDestroy: false,
            autoLoad: true,
            url: "../po/api/All_PoWorkingImpHdr.php",

            baseParams: {
                type: "bg_expense_group",
            },
            root: "data",
            idProperty: "id",
            fields: ["id", "c_name"],
        });
        Ext.bg_expense = new Ext.data.JsonStore({
            autoDestroy: false,
            autoLoad: true,
            url: "../po/../po/api/All_PoWorkingImpHdr.php",
            baseParams: {
                type: "bg_expense",
            },
            root: "data",
            idProperty: "id",
            fields: ["id", "c_name"],
        });
        Ext.storeDtl = new Ext.data.JsonStore({
            autoDestroy: false,
            autoLoad: true,
            url: "api/List_PoWorkingDtl.php",
            baseParams: {
                type: "po_working_dtl",
                keyData: Ext.keyData,
            },
            root: "data",
            idProperty: "id",
            totalProperty: "totalCount",
            fields: [
                {name: "no"},
                {name: "id"},
                {name: "c_status_last"},
                {name: "dc_cost_idTxt"},
                {name: "c_approve_name"},
                {name: "dc_expense_budget_type_idTxt"},
                {name: "bg_expense_group_idTxt"},
                {name: "po_working_hdr_id"},
                {name: "po_working_dtl_id"},
                {name: "i_budget_year"},
                {name: "i_budget_year_overlap"},
                {name: "i_type_year"},
                {name: "dc_cost_id"},
                {name: "po_creditor_transfer_id"},
                {name: "po_creditor_id"},
                {name: "dc_expense_budget_type_id"},
                {name: "bg_expense_group_id"},
                {name: "bg_expense_id"},
                {name: "bg_expense_idTxt"},
                {name: "d_audit_date"},
                {name: "d_approve_date"},
                {name: "po_emp_id"},
                {name: "dc_approve_id"},
                {name: "c_code_ref"},
                {name: "d_doc_date"},
                {name: "d_inv_date"},
                {name: "po_creditor_id"},
                {name: "po_creditor_name"},
                {name: "c_detail"},
                {name: "c_qty"},
                {name: "f_total"},
                {name: "c_comment"},
                {name: "i_is_url_pdf_hdr"},
                {name: "i_is_url_pdf_dtl"},
                {name: "pdf_hdr"},
                {name: "pdf_dtl"},
            ],
        });
        Ext.store_year = new Ext.data.JsonStore({
            fields: ["id", "c_name"],
            autoDestroy: false,
            autoLoad: true,
            data: years,
        });
        Ext.spChecking = new Ext.data.JsonStore({
            autoDestroy: false,
            autoLoad: true,
            url: "../po/reg/DAO/sp_listChecking.php",
            baseParams: {
                type: "checkingList", id: 0
            },
            root: "data",
            idProperty: "id",
            fields: [{name: "no"},
                {name: "id"},
                {name: "c_status_last"},
                {name: "dc_cost_idTxt"},
                {name: "dc_cost2_id"},
                {name: "dc_cost2_idTxt"},
                {name: "i_product_type"},
                {name: "i_product_typeTxt"},
                {name: "c_approve_name"},
                {name: "c_arrive_code"},
                {name: "c_name"},
                {name: "c_code"},
                {name: "dc_expense_budget_type_idTxt"},
                {name: "bg_expense_group_idTxt"},
                {name: "po_working_hdr_id"},
                {name: "po_working_dtl_id"},
                {name: "i_budget_year"},
                {name: "i_budget_year_overlap"},
                {name: "i_type_year"},
                {name: "dc_cost_id"},
                {name: "po_creditor_transfer_id"},
                {name: "po_creditor_id"},
                {name: "dc_expense_budget_type_id"},
                {name: "bg_expense_group_id"},
                {name: "bg_expense_id"},
                {name: "bg_expense_idTxt"},
                {name: "d_audit_date"},
                {name: "d_approve_date"},
                {name: "po_emp_id"},
                {name: "dc_approve_id"},
                {name: "c_code_ref"},
                {name: "d_doc_date"},
                {name: "d_inv_date"},
                {name: "po_creditor_id"},
                {name: "po_creditor_name"},
                {name: "c_detail"},
                {name: "c_qty"},
                {name: "f_total"},
                {name: "c_comment"},
                {name: "i_is_url_pdf_hdr"},
                {name: "i_is_url_pdf_dtl"},
                {name: "pdf_hdr"},
                {name: "pdf_dtl"}],

        });
        var columnMini = [
            {
                header: "ID System",
                sortable: true,
                hidden: true,
                dataIndex: "id",
            },
            {
                header: "เลขที่ใบตรวจรับ",
                sortable: true,
                dataIndex: "c_code",
            },
            {
                header: "เลขที่ใบรับของ",
                sortable: true,
                dataIndex: "c_arrive_code",
            },
            {
                header: "จ่ายให้",
                width: 250,
                sortable: true,
                dataIndex: "po_creditor_name",
            },
            {
                header: "รายการ",
                sortable: true,
                id: "c_name",
                dataIndex: "c_name",
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    metaData.attr = "style='cursor:pointer';";
                    return value;
                },
            },
        ];
        var comboEmp = new Ext.form.ComboBox({
            mode: "local",
            allowBlank: true,
            store: Ext.po_emp,
            anchor: "90%",
            fieldLabel: "ผู้ดำเนินการ",
            submitValue: true,
            hiddenName: "po_emp_id", //bg_expense_group_id
            name: "po_emp_name",
            valueField: "id",
            displayField: "c_name",
            triggerAction: "all",
            forceSelection: false,
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
        });
        var comboCost = new Ext.form.ComboBox({
            mode: "local",
            store: Ext.dc_cost,
            allowBlank: true,
            anchor: "90%",
            fieldLabel: "หน่วยงานที่รับผิดชอบ",
            valueField: "id",
            displayField: "c_name",
            id: "dc_cost_idID",
            hiddenName: "dc_cost_id",
            name: "c_cost_name",
            triggerAction: "all",
            forceSelection: true,
            selectOnFocus: true,
            typeAhead: false,
            emptyText: "กรุณาเลือก...",
            listeners: {
                change: function (combo, newValue) {
                    if (newValue == "" && Ext.SS_I_TYPE_USER == 3) {
                        Ext.getCmp("dc_cost_idID").setValue(Ext.SS_DC_COST_ACC_ID);
                        Ext.getCmp("dc_cost_idID").readOnly = true;
                    }
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
            store: Ext.dc_cost2,
            anchor: "50%",
            readOnly: Ext.dcCostFix,
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
            },
        });
        var comboTypeBg = new Ext.form.ComboBox({
            mode: "local",
            store: Ext.dc_expense_budget_type,
            fieldLabel: "แหล่งเงิน",
            allowBlank: true,
            anchor: "90%",
            submitValue: true,
            name: "dc_expense_budget_type_idTxt",
            hiddenName: "dc_expense_budget_type_id", //bg_expense_group_id
            valueField: "id",
            displayField: "c_name",
            triggerAction: "all",
            forceSelection: true,
            selectOnFocus: true,
            typeAhead: false,
            emptyText: "กรุณาเลือกแหล่งเงิน...",
            listeners: {
                afterrender: function () {
                    this.fn = function () {

                    };
                    this.fn();
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
        var comboBgYear = new Ext.form.ComboBox({
            mode: "local",
            allowBlank: true,
            fieldLabel: "ปีงบประมาณ",
            submitValue: true,
            hiddenName: "i_budget_year",
            name: "i_budget_yearTxt",
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
        var comboUsedBgYear = new Ext.form.ComboBox({
            mode: "local",
            fieldLabel: "ใช้เงินปีงบประมาณ",
            allowBlank: true,
            submitValue: true,
            hiddenName: "i_budget_year_overlap",
            name: "i_budget_year_overlapTxt",
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
            store: Ext.bg_expense,
            allowBlank: true,
            valueField: "id",
            displayField: "c_name",
            anchor: "90%",
            submitValue: true,
            name: "c_detail",
            hiddenName: "bg_expense_id",
            id: "bg_expense_id",
            triggerAction: "all",
            allBlank: true,
            forceSelection: true,
            selectOnFocus: true,
            fieldLabel: "รายการย่อย",
            width: 200,
            typeAhead: false,
            emptyText: "กรุณาเลือกใช้จ่าย...",
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
                    console.log(this);
                },
            },
        });
        var comboCreditor = new Ext.form.ComboBox({
            mode: "local",
            store: Ext.po_creditor,
            allowBlank: true,
            valueField: "id",
            displayField: "c_name",
            anchor: "90%",
            submitValue: true,
            name: "po_creditor_name",
            hiddenName: "po_creditor_id",
            id: "po_creditor_idID",
            triggerAction: "all",
            forceSelection: false,
            allBlank: true,
            selectOnFocus: true,
            fieldLabel: "จ่ายให้",
            width: 200,
            typeAhead: false,
            emptyText: "กรุณาเลือก...",
            listeners: {
                afterrender: function () {
                    this.fn = function () {};
                },
                Change: function () {
                    var f_id = Ext.isEmpty(Ext.getCmp("po_creditor_transfer_id").getValue());
                    if (f_id)
                        Ext.getCmp("po_creditor_transfer_id").setValue(this.getValue());
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
        var comboCreditortransfer = new Ext.form.ComboBox({
            mode: "local",
            store: Ext.po_creditor_transfer,
            valueField: "id",
            allowBlank: true,
            displayField: "c_name",
            anchor: "90%",
            submitValue: true,
            name: "po_creditor_transfer_name",
            hiddenName: "po_creditor_transfer_id",
            id: "po_creditor_transfer_id",
            triggerAction: "all",
            forceSelection: false,
            allBlank: true,
            selectOnFocus: true,
            fieldLabel: "โดยมอบให้",
            width: 200,
            typeAhead: false,
            emptyText: "กรุณาเลือก...",
            listeners: {
                beforequery: function (q) {
                    if (q.query) {
                        var length = q.query.length;
                        q.query = new RegExp(Ext.escapeRe(q.query));
                        q.query.length = length;
                        console.log(Ext.selectRow);
                    }
                },
                blur: function () {
                    this.getStore().clearFilter();
                },
            },
        });
        var PopContForm = new Ext.Poplov_in({
            text: "เลือกรายการที่ขอเบิก",
            id: "i_parentID",
            iconCls: "page_magnify",
            valueHidden: "i_parent_id",
            store: Ext.spChecking,
            headerGrid: columnMini,
            widthText: 330,
            fieldLabel: "เลือกรายการที่ขอเบิก",
            isCellClickGrid: true,
            cellClickGrid: function (grid, rowIndex, columnIndex, e) {
                var id = "i_parentID";
                var nameID = id + "_Name";
                var record = grid.getStore().getAt(rowIndex);

                var TextShow = record.data.c_code + " " + record.data.c_name;
                Ext.getCmp(id).setValue(record.data.po_working_hdr_id);

//            if (Ext.HDR_ID == null) {
                console.log(record);
                record.set("id", null);
                record.set("po_working_hdr_id", null);
                record.set("po_working_dtl_id", null);
                record.set("dc_cost_id", Ext.SS_DC_COST_ACC_ID);
                record.set("c_code_ref", null);
                record.set("c_status_last", null);
//                record.set("i_budget_year", 2022); //i_budget_year i_budget_year_overlap
//                record.set("i_budget_year_overlap", 2022); //i_budget_year_overlap
//                record.set("c_qty", null);
//                record.set("c_detail", null);
                record.set("po_creditor_id", null);
                record.set("po_creditor_transfer_id", null);

                Ext.getCmp(Ext.poFormID).getForm().loadRecord(record);
                Ext.getCmp(nameID).setValue(TextShow);
                Ext.getCmp("win-pop-lov" + id).hide();
                Ext.getCmp("win-pop-lov" + id).destroy();

            },
        });
        //Ext.panelForm
        return new Ext.Panel({
            region: "center",
            id: "panelForm",
            title: "ทำรายการขอเบิก (หน่วยงาน)",
            border: false,
            stripeRows: true,
            loadMask: true,
            listeners: {
                beforrender: function () {

                },
            },
            items: new Ext.FormPanel({
                id: Ext.poFormID,
//                url: "http://" + location.host.slice(0, -5) + "/NMU/po/reg/controller/mnPoWorkingHdrBeginCost.php",
                url: "../po/reg/controller/mnPoWorkingHdrBeginSupplies.php",
                fileUpload: true,
                frame: true,
                labelAlign: "left",
                bodyStyle: "padding:1px",
                layout: "column",
                items: [
                    {
                        columnWidth: 0.6,
                        xtype: "fieldset",
                        id: "win-cheque",
                        labelWidth: 200,
                        title: "ข้อมูลรายการ",
                        defaults: {
                            width: "65%",
                            border: false,
                        },
                        // Default config options for child items
//                        defaultType: "textfield",
                        autoHeight: true,
                        bodyStyle: Ext.isIE ? "padding:0 0 1px 5px;" : "padding:0px 1px;",
                        border: false,
                        style: {
                            "margin-left": "3px",
                            // when you add custom margin in IE 6...
                            "margin-right": Ext.isIE6 ? (Ext.isStrict ? "-4px" : "-5px") : "0", // you have to adjust for it somewhere else
                        },
                        frame: true,
                        autoScroll: true,
                        loadMask: true,
                        items: [
                            {
                                xtype: "hidden",
                                name: "id",
                                id: "idID",
                            },
                            {
                                xtype: "hidden",
                                name: "checking_id",
                            },
                            {
                                xtype: "hidden",
                                name: "po_working_hdr_id",
                            },
                            {
                                xtype: "hidden",
                                name: "po_working_dtl_id",
                            },
                            {
                                xtype: "hidden",
                                name: "COST_user_id",
                                value: 86,
                            },
                            {
                                xtype: "hidden",
                                name: "COST_cost_id",
                                value: 38,
                            },
                            {
                                xtype: "radiogroup",
                                columns: [100, 200],
                                id: "i_is_parentID",
                                hidden: true,
                                fieldLabel: "สถานะรายการ",
                                items: [
                                    {
                                        name: "i_is_parent",
                                        id: "i_is_parent1ID",
                                        inputValue: 1,
                                        checked: true,
                                        boxLabel: "ทำรายการใหม่",
                                    },
                                            // {
                                            //   name: "i_is_parent",
                                            //   id: "i_is_parent2ID",
                                            //   inputValue: 2,
                                            //   boxLabel: "เพิ่มรายการโดยการยกเลิกใบเบิกเดิม",
                                            // },
                                ],
                                listeners: {
                                    change: function (cb, rec, ind) {
                                        this.fn(rec.inputValue);
                                    },
                                    afterrender: function (obj, eOpts) {
                                        this.fn = function (i) {
                                            if (true) {
                                                Ext.getCmp("i_cont_dis_idID").show();
                                            } else {
                                                Ext.getCmp("i_cont_dis_idID").hide();
                                            }
                                        }; //fn
                                        this.fn(Ext.getCmp("i_is_parentID").getValue().inputValue);
                                    },
                                },
                            },
                            {
                                xtype: "compositefield",
                                id: "i_cont_dis_idID",
                                fieldLabel: "เลือกรายการที่ขอเบิก",
                                msgTarget: "side",
                                anchor: "-20",
                                defaults: {
                                    flex: 1,
                                },
                                items: [PopContForm.mini],
                            }, {
                                xtype: "radiogroup",
                                columns: [98, 98],
                                fieldLabel: "ของที่ได้มา",

                                name: "i_product_type",
                                items: [
                                    {
                                        checked: true,
                                        name: "i_product_type",
                                        inputValue: 1,
                                        boxLabel: "วัสดุ",
                                    },
                                    {
                                        inputValue: 2,
                                        name: "i_product_type",
                                        boxLabel: "ครุภัณฑ์",
                                    },
                                ], //radiogroup
                                listeners: {
                                    change: function () {
                                        // Ext.getCmp("i_is_invG2ID").fn(this.getValue().inputValue);
                                    },
                                    afterrender: function () {
                                        if (this.getValue().inputValue == 2) {
//                                        Ext.getCmp("i_product_type2ID").hide(); 
                                        } else {
//                                        Ext.getCmp("i_product_type2ID").show(); 
                                        }
                                    },
                                },

                            }, {
                                xtype: "displayfield",
                                fieldLabel: "รายละเอียด",
                                name: "c_detail",
                                value: "",
                                style: {
                                    "font-weight": "bold",
                                    padding: "1px",
                                    width: '300px',
                                    margin: "1px",
                                    color: "#000",
                                    "background-color": "#eee !important",
                                    "text-align": "center",
                                },
                            },
                            {
                                xtype: "textfield",
                                fieldLabel: "ใบแจ้งหนี้/เลขที่รับของ/เลขที่ตรวจรับ",
                                name: "c_arrive_code",
                                value: "",
                                style: {
                                    "font-weight": "bold",
                                    padding: "1px",
                                    width: '300px',
                                    margin: "1px",
                                    color: "#000",
                                    "background-color": "#eee !important",
                                    "text-align": "center",
                                },

                            },
                            {
                                xtype: "textfield",
                                fieldLabel: "เลขที่ใบขอเบิก MIS",
                                allowBlank: true,
                                name: "c_code_ref",
                                style: {
                                    "font-weight": "bold",
                                    padding: "1px",
                                    margin: "1px",
                                    color: "#000",
                                    width: '300px',
                                    "background-color": "#eee !important",
                                    "text-align": "center",
                                },
                            },
                            comboBgYear,
                            comboUsedBgYear,
                            comboTypeBg,
                            comboExpense,
                            comboCost,
                            comboCost2,
                            comboCreditor,
                            comboCreditortransfer,
                            {
                                xtype: "textfield",
                                allowBlank: true,
                                anchor: "90%",
                                fieldLabel: "เลขที่ใบแจ้งหนี้",
                                name: "c_code_invoice",
                            },
                            {
                                xtype: "fileuploadfield",
                                id: "upload_excel",
                                allowBlank: true,
                                width: "90%",
                                emptyText: "เลือกไฟล์ ",
                                fieldLabel: "เอกสารใบเบิก (excel)",
                                name: "upload_excel",
                                buttonText: "",
                                buttonCfg: {
                                    iconCls: "icon-excel",
                                },
                                listeners: {
                                    afterrender: function () {
                                    },
                                },
//                            },
//                            {
//                                xtype: "fileuploadfield",
//                                id: "upload_pdf2",
//                                allowBlank: true,
//                                width: "90%",
//                                emptyText: "เลือกไฟล์ (.pdf)",
//                                fieldLabel: "เอกสารประกอบใบเบิก (PDF)",
//                                name: "upload_pdf2",
//                                buttonText: "",
//                                buttonCfg: {
//                                    iconCls: "icon-pdf",
//                                },
//                                listeners: {
//                                    afterrender: function () {
//                                        // if (Ext.selectRow.length == 0) {
//                                        //   // Ext.getCmp("upload_pdf2").hide();
//                                        // } else {
//                                        //   if (Ext.selectRow.data.pdf_hdr != undefined) {
//                                        //     // Ext.getCmp("upload_pdf2").hide();
//                                        //   }
//                                        // }
//                                    },
//                                },
                            },
                        ],
                        buttonAlign: 'left',
                        buttons: [
                            {
                                text: "ทำรายการ ครุภัณฑ์",
                                id: "buSaveSubID",
                                iconCls: "icon-save",
                                handler: function () {
                                    var form = Ext.getCmp(Ext.poFormID).getForm();
                                    form.submit({
                                        waitMsg: 'Saving Data...',
                                        success: function (form, action) {
                                            Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                                Ext.getCmp("tabpanel1").getStore().reload();
                                                Ext.getCmp("panelForm").destroy();
                                            });
                                        },
                                        failure: function (form, action) {
                                            switch (action.failureType) {
                                                case Ext.form.Action.CLIENT_INVALID:
                                                    Ext.Msg.alert('Failure', 'ข้อมูลใน fileds ไม่ถูกต้อง');
                                                    break;
                                                case Ext.form.Action.CONNECT_FAILURE:
                                                    Ext.Msg.alert('Failure', 'พลข้อผิดพลาดในการเชื่อต่อเครือข่าย');
                                                    break;
                                                case Ext.form.Action.SERVER_INVALID:
                                                    Ext.Msg.alert('Failure', action.result.msg);
                                            }
                                        }
                                    });
                                }
                            },
                            {
                                text: Ext.GLOBAL_BU_BACK_TH,
                                handler: function () {

                                    Ext.getCmp("panelForm").destroy();

                                },
                            },
                        ],
                    },
                    {
                        columnWidth: 0.4,
                        xtype: "fieldset",
                        id: "win-chequeID",
                        labelWidth: 150,
                        title: "รายละเอียดการขอเบิก",
                        defaults: {
                            width: "90%",
                            border: false,
                            /* validator: function (val) {
                             if (!Ext.isEmpty(val)) {
                             return true;
                             } else {
                             
                             return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                             }
                             },*/
                        },
                        // Default config options for child items
//                        defaultType: "textfield",
                        autoHeight: true,
                        bodyStyle: Ext.isIE ? "padding:3px 0 3px 10px;" : "padding:3px 3px;",
                        border: false,
                        style: {
                            "margin-left": "5px",
                            "margin-right": Ext.isIE6 ? (Ext.isStrict ? "-4px" : "-5px") : "0", // you have to adjust for it somewhere else
                        },
                        items: [
                            {
                                xtype: "textfield",
                                fieldLabel: "จำนวนรายการ",
                                name: "c_qty",
                                id: "c_qtyID",
                                style: {

                                    padding: "1px",
                                    margin: "1px",
                                    "background-color": "#fff",
                                    "text-align": "left",
                                    width: "100px",
                                },
                            },
                            {
                                xtype: "textfield",
                                fieldLabel: "จำนวนเงิน",
                                name: "f_total",
                                allowBlank: true,
                                id: "f_totalID",
                                listeners: {
                                    blur: function () {
                                        var f_total = parseFloat(this.getValue().replace(/,/g, "") / 1);
                                        this.setValue(Ext.floatRenderer(f_total));
                                    },
                                },
                                style: {
                                    labelAlign: "right",
                                    "font-weight": "bold",
                                    padding: "1px",
                                    margin: "1px",
                                    color: "blue",
                                    "background-color": "#fff",
                                    "text-align": "right",
                                },
                            },
                            {
                                xtype: "datefield",
                                allowBlank: true,
                                fieldLabel: "วันที่ตรวจรับ",
                                name: "d_audit_date",
                                id: "d_audit_date",
                            },
                            comboEmp,
                            {
                                xtype: "datefield",
                                fieldLabel: "วันที่ใบขอเบิก",
                                allowBlank: true,
                                name: "d_doc_date",
                            },
                            {
                                xtype: "radiogroup",
                                columns: [80, 70],
                                id: "i_enableID",
                                hidden: true,
                                fieldLabel: "สถานะรายการ",
                                items: [
                                    {
                                        name: "i_enable",
                                        id: "i_enable1ID",
                                        inputValue: 1,
                                        checked: true,
                                        boxLabel: "ใช้งาน",
                                    },
                                    {
                                        name: "i_enable",
                                        id: "i_enable2ID",
                                        inputValue: 2,
                                        //                                                  checked : true ,
                                        boxLabel: "ยกเลิก",
                                    },
                                ],
                            },
                            {
                                xtype: "textarea",
                                fieldLabel: "คำอธิบายรายการ",
                                name: "c_comment",
                                width: 200,
                            },
                            {
                                xtype: "radiogroup",
                                columns: [180],
                                fieldLabel: "โหมดการบันทึก",
                                hidden: true,
                                id: "modesubID",
                                listeners: {
                                    afterrender: function () {
                                        //console.log(Ext.getCmp("modesubID").getValue().inputValue);
                                    },
                                },
                                style: {
                                    "font-weight": "bold",
                                },
                                items: (Ext.buAct == 'add' ? [{

                                        name: "mode",
                                        checked: true,
                                        inputValue: "ADD",
                                        boxLabel: "เพิ่มรายการเบิก",

                                    }] : [
                                    {

                                        name: "mode",
                                        checked: true,
                                        inputValue: "UPDATE",
                                        boxLabel: "อัพเดทรายการ",
                                        id: "modesubaupdateID",

                                    },
                                    {
                                        name: "mode",
                                        inputValue: "DISABLED",
                                        hidden: false,
                                        id: "modesubdisabledID",
                                        boxLabel: "ยกเลิกรายการเบิก",
                                    },
                                    {
                                        name: "mode",
                                        inputValue: "DELETE",
                                        hidden: false,
                                        id: "modesubdelID",
                                        boxLabel: "ลบรายการ",
                                    },
                                ]), //radiogroup
                            },
                        ],
                    },
                ],

            }),
        });
    }; //End Ext.panelForm 
    Ext.storePeriodHdr = new Ext.data.JsonStore({
        storeId: "myStore2",
        autoDestroy: false,
        autoLoad: true,
        url: "../po/api/List_poRequest.php",
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
    var loadStore = function (status) {

        if (Ext.isEmpty(Ext.selectRow) && status == 'update')
            Ext.Msg.alert("แจ้งเตือน", "กรุณา click เลือกข้อมูลที่จะแก้ไขใน data grid", function (form, action) {
                return false;
            });
        else
            Ext.dc_expense_budget_type.load({
                callback: function (recordx, operation, success) {
                    if (success) {
                        Ext.bg_expense.load({
                            callback: function (recordx, operation, success) {
                                if (success) {
                                    Ext.po_creditor_transfer.load({
                                        callback: function (recordx, operation, success) {
                                            if (success) {
                                                Ext.po_creditor.load({
                                                    callback: function (recordx, operation, success) {
                                                        if (success) {
                                                            if (status == 'update')
                                                                Ext.getCmp(Ext.poFormID).getForm().loadRecord(Ext.selectRow);
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
            });
    };
    Ext.user_right_add = user_right_add;
    Ext.user_right_edit = user_right_edit;
    Ext.user_right_delete = user_right_delete;
    Ext.title = Ext.menu_name + " " + Ext.menu_code;
    var gridChecking = {
        xtype: "grid",
        id: "tabpanel1",
        region: "center",
        border: false,
        title: Ext.title,
        store: Ext.storePeriodHdr,
        columns: [
            new Ext.grid.RowNumberer({width: 35, header: " ที่ ", dataIndex: "no"}),
            {header: "ID System", hidden: true, dataIndex: "id"
            },
            {
                header: "ส่งเบิกรายการ",
                align: "center",
                dataIndex: "id",
                width: 50,
                id: "updateWaitingStatusID",
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    metaData.attr = "style='cursor:pointer; text-align:center;';";

                    if (record.get('i_status_checking') === 1 && (record.get('c_code') === "" || record.get('c_code') === null)) {

                        return '<button id="buGencodeID" style="font-size:10px;">ออกเลขตรวจรับ</button>';
                    } else if (record.get('i_status_checking') == 2) {
                        return 'ไม่ผ่าน/ยกเลิก';

                    } else if (record.get('i_status_checking') === 1 && (record.get('c_code') !== "" || record.get('c_code') !== null)) {

                        return record.get('c_code');
                    } else {
                        Ext.gencodeChecking = false;
                        return '<img src="../images/icons/cog_start.png"); style="cursor:pointer"/>';
                    }

                }
//            }, {
//                header: "รายละเอียด/สถานะ",
//                align: "center",
//                dataIndex: "id",
//                width: 50,
//                id: "hdrPeriodID",
//                renderer: function (value, metaData, record, row, col, store, gridView) {
//                    if (record.get('readOnly')) {
//                        return '<img src="../images/icons/application_go.png");/>';
//                    } else {
//                        return '<img src="../images/icons/brick_edit.png"); style="cursor:pointer"/>';
//                    }
//                }
            }, {header: "ใบแจ้งหนี้/เลขที่รับของ/เลขที่ตรวจรับ", align: "left", width: 100, dataIndex: "c_arrive_code"}, //c_arrive_code 
            {header: "เอกสารอ้างอิง", align: "left", width: 55, dataIndex: "c_code_ref"}, //c_arrive_code

            {header: "วันที่รับของ", align: "center", width: 55, dataIndex: "d_arrive_date"},
            {header: "วันที่ส่งมอบ", dataIndex: "d_period_date", width: 55, align: "center"},
            {header: "เลขที่ตรวจรับ", dataIndex: "c_checking_code", width: 55, align: "left"},
            {header: "วันที่ตรวจรับ", dataIndex: "d_checking_date", width: 55, align: "center"},
            {header: "สถานะ", dataIndex: "c_status", width: 55, align: "left"},
            {header: "เหตุผล", dataIndex: "c_reason", width: 55, align: "left"}
        ],
        listeners: {

            beforerender: function (g) {
                this.contextMenu = new Ext.menu.Menu({
                    items: [
                        {
//                            text: "รายละเอียดทั้งหมด",
//                            icon: "../images/icons/book_magnify.png",
//                            handler: function (e) {
//                                Ext.buAct = "getDetail";
//                                Ext.getCmp("contenterCenter").add(tab2);
//                                Ext.getCmp("contenterCenter").setActiveTab(tab2);
//                            },
//                            scope: this,
//                        },
//                        {
                            text: "จัดการข้อมูล View/Copy/Edit/Delete",
                            icon: "../images/icons/application_edit.png",
                            handler: function (e) {
                                Ext.buAct = "update";

                                if (!Ext.isEmpty(Ext.getCmp('panelForm'))) {
                                    Ext.getCmp('panelForm').destroy();
                                }
                                var frm = Ext.panelForm();
                                Ext.getCmp("contenterCenter").add(frm);
                                Ext.getCmp("contenterCenter").setActiveTab(Ext.getCmp('panelForm'));
                                //loadStoreForm                               
                                loadStore(Ext.buAct);

                            },
                            scope: this,
                        }, {
                            text: "นำเข้าเลขครุภัณฑ์",
                            icon: "../images/icons/excel1.png",
                            handler: function (e) {
                                Ext.buAct = "FlowcartLv1";
                                var linkDownload = window.location.protocol + '//' + window.location.hostname + '/sp_mn/api/upload/';
                                if (Ext.isEmpty(Ext.selectRow))
                                    Ext.MessageBox.alert("แจ้งเตือน", "กรุณากดเลือกข้อมูลที่จะแสดง/ออกเลข PR ก่อน");
                                window.open(linkDownload + Ext.selectRow.get('c_code') + '.pdf', 'Monitoring', 'fullscreen="yes"');
                            },
                            scope: this,
                        }
                    ],
                });
            },
            afterrender: function () {
                this.on(
                        "contextmenu",
                        function (e, grid, rowIndex, columnIndex) {
                            e.stopEvent();
                            this.contextMenu.showAt(e.getXY());
                        },
                        this
                        );
                this.on("cellclick",
                        function (grid, rowIndex, columnIndex, e) {
                            var record = grid.getStore().getAt(rowIndex);
                            Ext.selectRow = record;
                            if (columnIndex === grid.getColumnModel().getIndexById("hdrPeriodID")) {
                                if (record.get('readOnly') != 1) {
//                                    Ext.SP_TOR_HDR_PERIOD_ID = record.get("sp_tor_hdr_period_id");
//                                    if (!record.get('readOnly') && record.get('i_status_checking') != 2) {
//
//                                        this.isController("viewDtail", record);
//                                        Ext.period_status = true;
//                                    } else if (record.get('i_status_checking') == 2) {
//                                        Ext.MessageBox.alert("Notification", "รายการได้ผ่านการตรวจแล้ว(ไม่ผ่าน))", function () { });
//                                        Ext.period_status = false;
//                                    } else {
//                                        Ext.MessageBox.alert("Notification", "รายการได้ผ่านส่งรอเบิกแล้ว(ผ่าน))", function () { });
//                                        Ext.chkBgfn(false, 0, 0);
//                                        Ext.period_status = false;
//                                        Ext.period_status = false;
//                                    }
                                }
//                                                        this.isController("viewDtail", record);
//                                                        Ext.period_status = true;
                            } else if (columnIndex === grid.getColumnModel().getIndexById("updateWaitingStatusID")) {


                                if (record.get('i_status_checking') === 1 && (record.get('c_code') === "" || record.get('c_code') === null)) { //record.get('c_code') === "" || record.get('c_code') === null
                                    Ext.getCmp("winChequeID").getEl().mask("Please wait...", "x-mask-loading");
                                    Ext.Ajax.request({
                                        url: "tor/api/mnCheckCode.php",
                                        method: "POST",
                                        params: {
                                            mode: "GENCODECHECKING",
                                            sp_check_period_hdr_id: record.data.id,
                                            i_is_warranty: record.data.i_is_warranty
                                        },
                                        success: function (result, request) {
                                            // console.log(result);
                                            if (result.statusText) {
                                                Ext.Msg.alert("แจ้งเตือน", "ออกเลขเรียบร้อยแล้ว");

                                            }
                                            Ext.getCmp("gridSub2ID").getStore().reload();
                                            Ext.getCmp("winChequeID").getEl().unmask();
                                        },
                                        failure: function (result, request) {
                                            Ext.MessageBox.alert("Failed", result.responseText);
                                        }
                                    });
                                    Ext.getCmp("gridSub2ID").getStore().reload();
                                    Ext.getCmp("winChequeID").getEl().unmask();
                                } else if (record.get('c_code') !== "") {

                                } else {
                                    Ext.Msg.alert("แจ้งเตือน", "ยังไม่สารถออกเลขได้");
                                }
                            }
                        }, this);
            },
        },
        viewConfig: {
            forceFit: true,
            getRowClass: function (record, rowIndex, rowPrms, ds) {
                //console.log(record.data.i_status_checking+ ' === ' +record.data.i_status_checking); 
                if (record.data.i_status_checking == 2) {
                    return 'disabled-row';
                }

            }
        }, bbar: new Ext.PagingToolbar({
            pageSize: 20,
            store: Ext.storePeriodHdr,
            displayInfo: true,
            displayMsg: "Displaying topics {0} - {1} of {2}",
        }),
        /*tbar: [
            {
                xtype: "button",
                iconCls: "icon-add",
                text: "เพิ่มส่งเบิกคลัง",
                handler: function () {
                    Ext.buAct = "add";

                    if (!Ext.isEmpty(Ext.getCmp('panelForm'))) {
                        Ext.getCmp('panelForm').destroy();
                    }
                    var frm = Ext.panelForm();
                    Ext.getCmp("contenterCenter").add(frm);
                    Ext.getCmp("contenterCenter").setActiveTab(Ext.getCmp('panelForm'));
                    //loadStoreForm     
                    Ext.selectRow = null;
                    loadStore(Ext.buAct);
                },
            },
            {
                xtype: "button",
                iconCls: "icon-excel",
                text: "นำเข้า xls",
                handler: function () {

                },
            },
        ]*/
    };
    var center = new Ext.TabPanel({
        region: "center",
        border: false,
        activeTab: 0, //default Tab
        id: "contenterCenter",
        defaults: {autoScroll: true},
        items: [gridChecking],
    });
    new Ext.Viewport({
        layout: "border",
        items: [center]
    });
});

