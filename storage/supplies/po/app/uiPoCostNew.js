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
                allowBlank: false,
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

    /*var user_right_edit = " . intVal ( $i_update ) . ";
     var user_right_delete = " . intVal ( $i_delete ) . ";
     var user_right_add = " . intVal ( $i_add ) . ";
     var user_right_read = " . intVal ( $i_read ) . ";
     var emp_id = " . intVal ( $dc_emp_id ) . ";
     Ext.session = Ext.apply({ 	'cost_name'	:'" . $_SESSION[ 'cost_name' ] . "',
     'cost_code':'" . $_SESSION[ 'cost_code' ] . "',
     'dc_cost_id':" . $_SESSION[ 'dc_cost_id' ] . ",
     'user_id'	:" . $_SESSION[ 'user_id' ] . ",
     'emp_id': emp_id,
     'user_name'	:'" . $_SESSION[ 'user_name' ] . "',
     });*/

//    console.log(user_right_edit);
//    console.log(user_right_add);
//    console.log(user_right_read);
//    console.log(user_right_delete);
//    console.log(emp_id);


    let years = [];
    let currentTime = new Date();
    let now = currentTime.getFullYear() + 1;
    let id = currentTime.getFullYear() - 3;
    while (id <= now) {
        let c_name = id + 543;
        years.push({id, c_name});
        id++;
    }


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
    // copy text in cell on select row no
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
        autoLoad: true,
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
        autoLoad: true,
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
        autoLoad: true,
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
    var comboEmp = new Ext.form.ComboBox({
        mode: "local",
        allowBlank: false,
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
        allowBlank: false,
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
    var comboTypeBg = new Ext.form.ComboBox({
        mode: "local",
        store: Ext.dc_expense_budget_type,
        fieldLabel: "แหล่งเงิน",
        allowBlank: false,
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
        allowBlank: false,
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
        allowBlank: false,
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
        allowBlank: false,
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
        allowBlank: false,
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
        allowBlank: false,
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
    Ext.spChecking = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "../po/api/sp_listChecking.php",
        baseParams: {
            type: "checkingList", id: 0
        },
        /* fields: ["no"
         , "id" // checking ในระบบ
         , "c_code" // checking ในระบบ
         , "c_name"
         , "c_arrive_code" //เลขรับในระบบ
         , "c_doc_ref" // เลขรับ
         , "c_contract_code" //เลข Dxxx from MIS
         , "po_creditor_name" //เลข Dxxx from MIS
         , "dc_bg_budget_type_id" //แหล่งเงิน
         , "po_expense_id" // รายจ่ายย่อย
         , "dc_credit_id" // ผู้ขายผู้รับจ้าง
         , "c_detail" //รายการที่ขอเบิก
         , "f_total_amt" //เงินที่ขอเบิก
         
         ],
         dc_cost2_id  dc_cost2_idTxt i_product_type i_product_typeTxt
         */
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

            record.set("id", null);
            record.set("po_working_hdr_id", null);
            record.set("po_working_dtl_id", null);
            record.set("dc_cost_id", Ext.SS_DC_COST_ACC_ID);
            record.set("c_code_ref", null);
            record.set("c_status_last", null);
//            record.set("i_budget_yearTxt", 2022);
//            record.set("i_budget_year_overlapTxt", 2022);
            record.set("c_qty", null);
            record.set("c_detail", null);
            record.set("po_creditor_id", null);
            record.set("po_creditor_transfer_id", null);

            Ext.getCmp(Ext.poFormID).getForm().loadRecord(record);

            Ext.getCmp(nameID).setValue(TextShow);
            Ext.getCmp("win-pop-lov" + id).hide();
            Ext.getCmp("win-pop-lov" + id).destroy();
            alert();
        },
    });
    var panelForm = new Ext.Panel({
        region: "center",
        title: "ทำรายการขอเบิก (หน่วยงาน)",
        border: false,
        stripeRows: true,
        loadMask: true,
        items: new Ext.FormPanel({
            id: Ext.poFormID,
            url: "http://" + location.host.slice(0, -5) + "/NMU/po/reg/controller/mnPoWorkingHdrBeginCost.php",
//            url: "http://" + location.host.slice(0, -5) + "/NMU/po/reg/controller/mnPoWorkingHdrBeginCost.php",
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
                    defaultType: "textfield",
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
                            name: "c_code_ref",
                            style: {
                                "font-weight": "bold",
                                padding: "1px",
                                margin: "1px",
                                color: "#000",
                                width: '300px',
                                "background-color": "#eee !important",
                                "text-align": "center",
                            }, validator: function (val) {
                                if (!Ext.isEmpty(val)) {
                                    return true;
                                } else {

                                    return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                }
                            },
//                        },
//                        {
//                            xtype: "buttongroup",
//                            fieldLabel: "วันที่ส่งใบขอเบิก",
//                            frame: false,
//                            border: false,
//                            items: [
//                                {
//                                    xtype: "button",
//                                    name: "d_approve_date",
//                                    validator: function (val) {
//                                        if (!Ext.isEmpty(val)) {
//                                            return true;
//                                        } else {
//                                            return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
//                                        }
//                                    },
//                                },
//                                {
//                                    xtype: "tbspacer",
//                                    width: 4,
//                                },
//                                {
//                                    xtype: "label",
//                                    style: {color: "red"},
//                                    text: "* เริ่มต้นนับวัน",
//                                },
//                            ],
                        },
                        comboBgYear,
                        comboUsedBgYear,
                        comboTypeBg,
                        comboExpense,
                        comboCost,
                        comboCreditor,
                        comboCreditortransfer,
                        {
                            xtype: "textfield",
                            allowBlank: false,
                            anchor: "90%",
                            fieldLabel: "เลขที่ใบแจ้งหนี้",
                            name: "c_code_invoice",
                        },
                        {
                            xtype: "fileuploadfield",
                            id: "upload_pdf1",
                            allowBlank: false,
                            width: "90%",
                            emptyText: "เลือกไฟล์ (.pdf)",
                            fieldLabel: "เอกสารใบเบิก (PDF)",
                            name: "upload_pdf1",
                            buttonText: "",
                            buttonCfg: {
                                iconCls: "icon-pdf",
                            },
                            listeners: {
                                afterrender: function () {
                                },
                            },
                        },
                        {
                            xtype: "fileuploadfield",
                            id: "upload_pdf2",
                            allowBlank: false,
                            width: "90%",
                            emptyText: "เลือกไฟล์ (.pdf)",
                            fieldLabel: "เอกสารประกอบใบเบิก (PDF)",
                            name: "upload_pdf2",
                            buttonText: "",
                            buttonCfg: {
                                iconCls: "icon-pdf",
                            },
                            listeners: {
                                afterrender: function () {
                                    // if (Ext.selectRow.length == 0) {
                                    //   // Ext.getCmp("upload_pdf2").hide();
                                    // } else {
                                    //   if (Ext.selectRow.data.pdf_hdr != undefined) {
                                    //     // Ext.getCmp("upload_pdf2").hide();
                                    //   }
                                    // }
                                },
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
                        validator: function (val) {
                            if (!Ext.isEmpty(val)) {
                                return true;
                            } else {

                                return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                            }
                        },
                    },
                    // Default config options for child items
                    defaultType: "textfield",
                    autoHeight: true,
                    bodyStyle: Ext.isIE ? "padding:3px 0 3px 10px;" : "padding:3px 3px;",
                    border: false,
                    style: {
                        "margin-left": "5px",
                        // when you add custom margin in IE 6...
                        "margin-right": Ext.isIE6 ? (Ext.isStrict ? "-4px" : "-5px") : "0", // you have to adjust for it somewhere else
                    },
                    items: [
                        {
                            xtype: "textfield",
                            fieldLabel: "จำนวนรายการ",
                            name: "c_qty",
                            id: "c_qtyID",
                            style: {
                                //                                                 'labelAlign' : 'right' ,
                                //                                              'font-weight' : 'bold' ,
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
                        /*comboAudit,*/
                        {
                            xtype: "datefield",
                            fieldLabel: "วันที่ตรวจรับ",
                            name: "d_audit_date",
                            id: "d_audit_date",
                        },
                        comboEmp,
                        {
                            xtype: "datefield",
                            fieldLabel: "วันที่ใบขอเบิก",
                            name: "d_doc_date",
                        },
                        // document_inspector,
                        // {
                        //   xtype: "datefield",
                        //   fieldLabel: "วันที่ฝ่ายคลังรับใบขอเบิก",
                        //   name: "d_inv_date",
                        // },

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
                            validator: function (val) {
                                return true;
                            },
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
                            items:
                                    statusx === "add"
                                    ? [
                                        {
                                            name: "mode",
                                            inputValue: "ADD",
                                            checked: true,
                                            boxLabel: "เพิ่มรายการใหม่",
                                            id: "modesubaddID",
                                        },
                                    ]
                                    : [
                                        {
                                            name: "mode",
                                            checked: true,
                                            inputValue: "UPDATE",
                                            boxLabel: "อัพเดทรายการ",
                                        },
                                        {
                                            name: "mode",
                                            inputValue: "ADD",
                                            boxLabel: "เพิ่มรายการใหม่",
                                            id: "modesubaddID",
                                        },
                                        {
                                            name: "mode",
                                            inputValue: "DELETE",
                                            id: "modesubdelID",
                                            boxLabel: "ลบรายการ",
                                        },
                                    ], //radiogroup
                        },
                    ],
                },
            ],
            buttons: [
                {
                    text: "ทำรายการ",
                    id: "buSaveSubID",
                    iconCls: "icon-save",
                    listeners: {
                        afterrender: function () {
                            /*var user_right_edit = " . intVal ( $i_update ) . ";
                             var user_right_delete = " . intVal ( $i_delete ) . ";
                             var user_right_add = " . intVal ( $i_add ) . ";
                             var user_right_read = " . intVal ( $i_read ) . ";
                             var emp_id = " . intVal ( $dc_emp_id ) . ";
                             Ext.session = Ext.apply({ 	'cost_name'	:'" . $_SESSION[ 'cost_name' ] . "',
                             'cost_code':'" . $_SESSION[ 'cost_code' ] . "',
                             'dc_cost_id':" . $_SESSION[ 'dc_cost_id' ] . ",
                             'user_id'	:" . $_SESSION[ 'user_id' ] . ",
                             'emp_id': emp_id,
                             'user_name'	:'" . $_SESSION[ 'user_name' ] . "',
                             });*/
//                            console.log(user_right_edit);
//                            console.log(user_right_add);
//                            console.log(user_right_read);
//                            console.log(user_right_delete);

//                            console.log(Ext.session);
                            if (Ext.session.user_id == 1) {
//admin
                            } else {
                                if (user_right_add) {
                                    this.show();
                                } else {
                                    this.hide();
                                }
                            }

                        },
                    },
                    handler: function () {
                        var msg = "";
                        var formSubmit = function () {
                            let file1 = Ext.get("upload_pdf1-file").dom.files[0];
                            let parts1 = null;
                            try {
                                parts1 = file1.name.split(".");
                            } catch (err) {

                            }

                            let file2 = Ext.get("upload_pdf2-file").dom.files[0];
                            let parts2 = null;
                            try {
                                parts2 = file2.name.split(".");
                            } catch (err) {
                            }

                            if (file1 == "" || file1 == undefined || file2 == "" || file2 == undefined) {
                                msg += "<span style='white-space: nowrap;'>กรุณาเลือกไฟล์ให้ครบ</span><br>";
                            } else if (parts1[parts1.length - 1] != "pdf" || parts2[parts2.length - 1] != "pdf") {
                                if (parts1[parts1.length - 1] != "PDF" || parts2[parts2.length - 1] != "PDF") {
                                    msg += "<span style='white-space: nowrap;'>กรุณาเลือกไฟล์ (.pdf)</span><br>";
                                }
                            }
                            if (Ext.getCmp("bg_expense_id").getValue() == "") {
                                msg += "<span style='white-space: nowrap;'>กรุณาเลือก รายการย่อย</span>";
                            }
                            if (file1.size > 512000000 || file2.size > 512000000) {
                                msg += "<span style='white-space: nowrap;'>กรุณาเลือก ไฟล์ PDF ขนาดไม่เกิน 500000 (kB)</span>";
                            }
                            if (msg != "") {
                                Ext.MessageBox.alert("แจ้งเตือน", msg);
                                return;
                            }
                            form.submit({
                                waitMsg: "Saving Data...",
                                success: function (form, action) {
                                    console.log(action);
                                    // if (action.result.success == "Success" || action.result.success == true) {
                                    Ext.Msg.alert("Success", "บันทึกเรียบร้อย", function (form, action) {
                                        // Ext.getCmp("tabpanel1").getStore().reload();
                                        Ext.getCmp(Ext.poFormID).getForm().reset();
                                        Ext.selectRow = null;
                                        // Ext.getCmp("winChequeID").hide();
                                        // Ext.getCmp("winChequeID").destroy();
                                    });
                                    // } else {
                                    //   Ext.MessageBox.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + action.result.msg + "</span>");
                                    // }
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
                        };
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
//                                formSubmit(form);
                                Ext.getCmp(Ext.poFormID).getEl().mask("Please wait...", "x-mask-loading");
                                Ext.Ajax.request({
                                    url: "../sp/tor/api/mnCheckCode.php",
                                    method: "POST",
                                    params: {
                                        mode: 'UPDATE_MIS', sp_check_period_hdr_id: Ext.getCmp('idID').getValue()
                                    },
                                    success: function (result, request) {
                                        Ext.getCmp("frm-Add").getEl().unmask();
                                        var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                                        if (jsonData.success == true) {

                                        } else {
                                            Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg);
                                        }
                                        Ext.getCmp(Ext.poFormID).getEl().unmask();
                                    },
                                    failure: function (result, request) {
                                        Ext.MessageBox.alert("Failed", result.responseText); // connect error
                                    }
                                });
                            }
                        } //isValid
                    }, //haddler
                },
                {
                    text: Ext.GLOBAL_BU_BACK_TH,
                    handler: function () {
                        Ext.getCmp("winChequeID").hide();
                        Ext.getCmp("winChequeID").destroy();
                    },
                },
            ],
        }),
    }); // panelForm 
    var center = new Ext.TabPanel({
        region: "center",
        border: false,
        activeTab: 0, //default Tab
        id: "contenterCenter",
        defaults: {autoScroll: true},
        items: [panelForm],
    });
    new Ext.Viewport({
        layout: "border",
        items: [center],
    });
});
