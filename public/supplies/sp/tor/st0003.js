/* global Ext, user_right_add, user_right_edit, user_right_delete */
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

    var comboCost2 = new Ext.form.ComboBox({
        mode: "local",
        store: Ext.dc_cost2,
        anchor: "100%",
        readOnly: true,
        value: Ext.costID,
        fieldLabel: "หน่วยงานเจ้าของเรื่อง",
        valueField: "id",
        displayField: "c_name",
        hiddenName: "dc_cost2_id",
        id: "dc_cost2_idID",
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
        anchor: "80%",
        submitValue: true,
        name: "dc_expense_budget_type_idTxt",
        hiddenName: "dc_expense_budget_type_id",
        readOnly: Ext.selectRow.get("bg_reserve_money1_id") > 0 ? true : false,
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
    var comboTypeBg2 = new Ext.form.ComboBox({
        mode: "local",
        store: Ext.dc_expense_budget_type,
        fieldLabel: "แหล่งเงิน",
        anchor: "80%",
        submitValue: true,
        name: "dc_expense_budget_type_idTxt2",
        hiddenName: "dc_expense_budget_type2_id",
        id: "dc_expense_budget_type_hdr_id2",
        readOnly: Ext.selectRow.get("bg_reserve_money2_id") > 0 ? true : false,
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
                    Ext.i_bg_type = Ext.getStoreItems(this.store, this.getValue(), "i_bg_type");
                    if (Ext.i_bg_type) {
                        Ext.Msg.alert("แจ้งเตือน", "แหล่งเงินเป็นเงินอุดหนุน/เงินงวด จะต้องทำการจองก่อนเงินทำสัญญา", function (form, action) {
                            Ext.isCostPrExist = 0;
                            return false;
                        });
                    }
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
    var comboTypeBg3 = new Ext.form.ComboBox({
        mode: "local",
        store: Ext.dc_expense_budget_type,
        fieldLabel: "แหล่งเงิน",
        anchor: "80%",
        submitValue: true,
        name: "dc_expense_budget_type_idTxt3",
        hiddenName: "dc_expense_budget_type3_id",
        id: "dc_expense_budget_type_hdr_id3",
        readOnly: Ext.selectRow.get("bg_reserve_money3_id") > 0 ? true : false,
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
                    Ext.i_bg_type = Ext.getStoreItems(this.store, this.getValue(), "i_bg_type");
                    if (Ext.i_bg_type) {
                        Ext.Msg.alert("แจ้งเตือน", "แหล่งเงินเป็นเงินอุดหนุน/เงินงวด จะต้องทำการจองก่อนเงินทำสัญญา", function (form, action) {
                            Ext.isCostPrExist = 0;
                            return false;
                        });
                    }
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
    var comboUsedBgYear = new Ext.form.ComboBox({
        mode: "local",
        readOnly: true,
        fieldLabel: "ปีงบประมาณ",
        submitValue: true,
        hiddenName: "i_yyyy",
        name: "c_yyyy",
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
                console.log(this);
            },
        },
    });
    var columnMini = [
        {
            header: "ID System",
            sortable: true,
            hidden: true,
            dataIndex: "id",
        },
        {
            header: "เลขที่ใบเบิก",
            sortable: true,
            dataIndex: "c_code",
        },
        {
            header: "รายการ­",
            sortable: true,
            id: "c_name",
            dataIndex: "c_name",
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                metaData.attr = "style='cursor:pointer';";
                return value;
            },
        },
    ];

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
        {
            header: "ก่อน VAT",
            dataIndex: "f_unit_cost",
            align: "right",
            width: 25,
        },
        {
            header: "รวม VAT",
            dataIndex: "f_unit_cost_vat",
            align: "right",
            width: 25,
        },
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
        width: 1000,
        id: "winChequeID",
        height: 500,
        minWidth: 850,
        minHeight: 450,
        layout: "fit",
        modal: true,
        plain: true,
        bodyStyle: "padding:1px;",
        buttonAlign: "center",

        items: [
            new Ext.FormPanel({
                id: Ext.poFormID,
                columnWidth: 1,
                url: "tor/api/mnTorController.php",
                frame: true,
                autoScroll: true,
                labelAlign: "left",
                bodyStyle: "padding:1px",
                labelWidth: 120,
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
                                    },
                                    {
                                        xtype: "hidden", //textfield
                                        name: "sp_emp_id",
                                    },
                                    {
                                        xtype: "hidden", //hidden
                                        name: "dc_department_id",
                                    },
                                    {
                                        xtype: disp,
                                        readOnly: true,
                                        fieldLabel: "รหัส PR",
                                        id: "codeHdrID",
                                        style: "text-align: center;font-weight:bold;background:#eee;",
                                        readOnly: true,
                                        name: "c_code",
                                    },
                                    {
                                        xtype: "textarea",
                                        width: 500,
                                        height: 35,
                                        readOnly: true,
                                        fieldLabel: "เรื่อง/โครงการ",
                                        name: "c_name",
                                    },
                                    comboUsedBgYear,
                                    // {
                                    //   xtype: "displayfield",
                                    //   fieldLabel: "ชื่อโครงการ",
                                    //   name: "c_budget_dtl_project",
                                    // },
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
                                                text: "* วันที่บันทึกรายการ",
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
                                        fieldLabel: "วันที่บันทีกเอกสาร",
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
                                    Ext.PopDepartmentForm.mini /*{
                                     
                                     mode: "local",
                                     xtype: 'combo',
                                     store: Ext.po_emp,
                                     anchor: "100%",
                                     fieldLabel: "ผู้ดำเนินงาน TOR",
                                     submitValue: true,
                                     hiddenName: "dc_emp_id",
                                     name: "dc_emp_name",
                                     valueField: "id",
                                     displayField: "c_name",
                                     triggerAction: "all",
                                     forceSelection: false,
                                     selectOnFocus: true,
                                     typeAhead: false,
                                     emptyText: "กรุณาเลือกคีย์เพิ่มหรือว่างไว้",
                                     validator: function (val)
                                     {
                                     if (!Ext.isEmpty(val))
                                     {
                                     return true;
                                     } else
                                     {
                                     return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                     }
                                     },
                                     listeners: {
                                     afterrender: function ()
                                     {
                                     this.fn = function ()
                                     {};
                                     },
                                     Change: function ()
                                     {
                                     this.fn();
                                     },
                                     beforequery: function (q)
                                     {
                                     if (q.query)
                                     {
                                     var length = q.query.length;
                                     q.query = new RegExp(Ext.escapeRe(q.query));
                                     q.query.length = length;
                                     }
                                     },
                                     blur: function ()
                                     {
                                     this.getStore().clearFilter();
                                     },
                                     },
                                     }*/,
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
                                                    width: "100px",
                                                },
                                                text: "* นับ PA จากวันถัดไป " + Ext.menu_i_day + " วัน",
                                            },
                                        ],
                                    },
                                    {
                                        xtype: "textarea",
                                        width: 400,
                                        name: "c_comment",
                                        //
                                    },
                                    Ext.getBodyMultiBudget(Ext.selectRow, 'st0003'),
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
                                                inputValue: "UPDATEFORMSTSATUS003",
                                                boxLabel: "อัพเดทรายการ",
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                columnWidth: 0.4,
                                layout: "table",
                            },
                        ],
                    },
                ],
                buttonAlign: "center",
                buttons: [
                    {
                        text: "บันทึกรายการ",
                        id: "buSaveSubID",
                        iconCls: "icon-save",
                        handler: function () {
                            console.log(Ext.getCmp("sp_emp_idID_Name").getValue());
                            var msg = "";
                            if (Ext.getCmp("sp_emp_idID_Name").getValue() == "") {
                                msg += "<span style='white-space: nowrap;'>- กรุณาเลือกผู้ปฎิบัติงาน</span><br>";
                            }
                            if (msg == "") {
                                var formSubmit = function () {
                                    form.submit({
                                        waitMsg: "Saving Data...",
                                        success: function (form, action) {
                                            Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                                Ext.getCmp("tabpanel1").getStore().reload();
                                                Ext.selectRow = null;
                                                Ext.getCmp("winChequeID").destroy();
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
                        text: Ext.GLOBAL_BU_BACK_TH,
                        handler: function () {
                            Ext.getCmp("winChequeID").hide();
                            Ext.getCmp("winChequeID").destroy();
                        },
                    },
                ],
            }),
        ],
    });
};
const sp_tor_delete = function (status, menu) {
    var statusx = status;
    new Ext.Window({
        id: "win-msg-cancel",
        title: "เหตุผลในการถูกส่งคืน",
        resizable: false,
        modal: true,
        width: 600,
        // height: 250,
        layout: "form",
        // html: "ท่านต้องการที่จะ ?",
        items: [
            {
                fieldLabel: "เหตุผล",
                xtype: "textarea",
                name: "tor_delete_comment",
                width: 400,
                value: Ext.selectRow.data.tor_delete_comment,
                id: "tor_delete_commentID",
                listeners: {
                    afterrender: function () {
                    },
                },
            },
        ],
        buttons: [
            {
                text: "รับรู้เหตุผลในการส่งคืน",
                iconCls: "icon-table_delete",
                handler: function () {
                    console.log(Ext.selectRow);
                    Ext.Ajax.request({
                        url: "tor/api/mnTorController.php",
                        params: {
                            mode: "Recognize_Reason",
                            id: Ext.selectRow.data.id,
                            sp_status_hdr_id: Ext.selectRow.data.tor_status_id,
                            c_comment_delete: Ext.getCmp("tor_delete_commentID").getValue(),
                            sp_emp_id: Ext.selectRow.data.sp_emp_id,
                            i_enabled: 2

                        },
                        method: "GET", //POST
                        success: function (result, request) {
                            var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                            if (jsonData.success) {
                                Ext.MessageBox.alert("Success", jsonData.msg, function () {
                                    Ext.getCmp("win-msg-cancel").destroy();
                                    Ext.getCmp("tabpanel1").getStore().reload();
                                    Ext.storeDtl.reload({
                                        callback: function (record, operation, success) {
                                            if (success) {
                                                Ext.HDR_ID = Ext.selectRow.data.po_working_hdr_id;
                                                Ext.tor_type_id = Ext.selectRow.data.tor_type_id; // default start เจาะจงน้อวกว่า 5 แสน
                                                Ext.i_is_more = Ext.selectRow.data.i_is_more;
                                                Ext.storeDepartment.setBaseParam("dc_department_id", Ext.selectRow.get("dc_department_id"));

                                                var winApp = AppPoStore('edit');
                                                Ext.getCmp("winChequeID").items.items[0].getForm().loadRecord(Ext.selectRow);
                                                winApp.show();
                                                //แบ่งเพรมเลย load ไม่เข้า bug Codex แก้เรื่องเงินหาย
                                                Ext.getCmp("sp_emp_idID_Name").setValue(Ext.selectRow.get("txtsp_emp_idID"));
                                                Ext.getCmp("sp_emp_idID").setValue(Ext.selectRow.get("sp_emp_id"));
                                            }

                                        }
                                    });
                                });
                            } else {
                                Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                            }
                        },
                        failure: function (result, request) {
                            Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                        },
                    });
                },
            },
        ],
    }).show();
    // } 
};
Ext.AppUx = function (app, menu) {
    Ext.user_right_add = user_right_add;
    Ext.user_right_edit = user_right_edit;
    Ext.user_right_delete = user_right_delete;
    Ext.title = Ext.menu_name + " " + Ext.menu_code;
    //Ext.menu_i_entrance;
    Ext.HDR_ID = null;
    Ext.selectRow = [];

    Ext.menuEditGrid = true;
    Ext.menuRightEditgrid = true;
    Ext.tor_type_id = 1; // default start เจาะจงน้อวกว่า 5 แสน
    Ext.i_is_more = 0;
    Ext.tor_type_idTxt = Ext.apply({
        tor_type_id1: {
            0: "แบบมี หัวงาน/ฝ่ายพิจารณาผล(ไม่เกิน 5 แสนบาท)",
            1: "แบบมีคณะกรรมการพิจารณาผล(เกิน 5 แสนบาท)",
        },
    });
    Ext.menuCode = "ST0004"; //go to
    Ext.status = Ext.apply({
        name: menu,
        process: function (menuCode, record) {
            Ext.Ajax.request({
                url: "tor/api/mnTorController.php",
                params: {
                    mode: "UPDATENEXTSTEP",
                    menuCode: menuCode,
                    i_seq: Ext.menu_i_seq,
                    tor_status_id: record.get("tor_status_id"),
                    tor_type_id: record.get("tor_type_id"),
                    i_entrance: Ext.menu_i_entrance, //เมนูแยก
                    menuback: Ext.menuback,
                    i_backword: Ext.i_backword,
                    c_comment: Ext.getCmp('reasonID').getValue(),
                    i_is_more: record.get("i_is_more"),
                    i_is_entrance: record.get("i_is_entrance"), //สถานะในเมนูแยก
                    id: record.get("id"),
                    i_edit: record.get("i_edit"),
                },
                method: "POST", //GET
                success: function (result, request) {
                    var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                    if (jsonData.success) {
                        Ext.MessageBox.alert("Success", jsonData.msg, function () {
                            Ext.getCmp("tabpanel1").getStore().reload();
                            Ext.getCmp("win-processID").destroy();
                        });
                    } else {
                        Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                    }
                },
                failure: function (result, request) {
                    Ext.MessageBox.alert("Failed", result.responseText); // connect error
                },
            });
        },
    });
    Ext.buAct = null;
    Ext.yearTh = function () {
        let years = [];
        let currentTime = new Date();
        let now = currentTime.getFullYear() + 1;
        let id = currentTime.getFullYear() - 3;
        while (id <= now) {
            let c_name = id + 543;
            years.push({
                id,
                c_name,
            });
            id++;
        }

        Ext.bgYear = now - 1;
        return years;
    };
    // copy text in cell on select row no
    function winProcess(rec) {
        //   console.log(rec);
        new Ext.Window({
            id: "win-processID",
            title: "ผ่านรายการ PR",
            modal: true,
            resizable: false,
            width: 550,
            layout: "form",
            labelWidth: 180,
            bodyStyle: "padding:3px;",
            items: [
                {
                    xtype: "displayfield",
                    fieldLabel: "ผ่านการสถานะของ",
                    value: "<b style='font-size:16px;'> " + rec.get("c_code") + " ?</b>",
                },
                {
                    xtype: "displayfield",
                    fieldLabel: "พนักงานผู้รับผิดชอบ PR",
                    id: "dc_emp_nameID",
                    name: "dc_emp_name",
                    value: "<b style='font-size:12px;'> " + rec.get("txtsp_emp_idID") + " ?</b>",
                },
                {
                    xtype: "radiogroup",
                    columns: [180, 180],
                    fieldLabel: "โหมดการบันทึก",
                    id: "modesubID",
                    style: {
                        "font-weight": "bold",
                    },
                    items: [
                        {
                            name: "mode",
                            inputValue: "GOTOSTEP",
                            checked: true,
                            boxLabel: "ผ่านรายการ <img src='../images/icons/accept.png'>",
                        },
                        {
                            name: "mode",
                            inputValue: "BACKSTEP",
                            boxLabel: "ส่งกลับให้ธุรการแก้ไข <img src='../images/icons/time_red.png'>",
                        },
                    ],
                    listeners: {
                        change: function (cb, nv, ov) {
                            if (Ext.getCmp("modesubID").getValue().inputValue == "BACKSTEP") {
                                Ext.getCmp("reasonID").show();

                                Ext.menu_i_entrance = 5; //กลุ่มเมนู
                                Ext.i_backword = 1; //กลับ
                                Ext.menuback = 2;  //เมนูที่กลับ
                            } else {
                                if (rec.data.c_comment_status == "") {
                                    Ext.getCmp("reasonID").hide();
                                }
                                Ext.menu_i_entrance = 5; //กลุ่มเมนู
                                Ext.i_backword = 0; //กลับ
                                Ext.menuback = 4;  //เมนูที่กลับ

                            }
                        },
                        afterrender: function () {
//                            if (rec.data.c_comment_status == "") {
//                                Ext.getCmp("modesubID").items.items[0].setValue(true);
//                            } else {
//                                Ext.getCmp("modesubID").items.items[1].setValue(true);
//                            }
                        },
                    },
                },
                {
                    fieldLabel: "เหตุผลที่ส่งกลับ",
                    xtype: "textarea",
                    name: "reason",
                    width: 250,
                    id: "reasonID",
                    listeners: {
                        afterrender: function () {

                            if (rec.data.c_comment_status == "") {
                                this.hide();
                            }
                        },
                    },
                },
            ],
            buttons: [
                {
                    text: "อัพเดทผ่านสถานะรายการ",
                    iconCls: "icon-save",
                    handler: function () {
                        console.log(Ext.getCmp("modesubID").getValue());
                        if (Ext.isEmpty(Ext.getCmp("modesubID").getValue())) {
                            Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกหมวดการผ่านการสถานะ", function (bu, action) {
                                return false;
                            });
                        } else if (Ext.getCmp("modesubID").getValue().inputValue == "GOTOSTEP") {
                            if (rec.get("sp_emp_id") == 0)
                                Ext.Msg.alert("แจ้งเตือน", "กรุณาบันทึกพนักงานผู้รับผิดชอบงาน PR", function (bu, action) {
                                    return false;
                                });
                            Ext.status.process(Ext.menuCode, rec);
                        } else if (Ext.getCmp("modesubID").getValue().inputValue == "BACKSTEP") {
                            Ext.status.process("ST0001", rec);
                        }

                    },
                },
                {
                    text: Ext.GLOBAL_BU_BACK_TH,
                    iconCls: "icon-clear",
                    handler: function () {
                        Ext.getCmp("win-processID").destroy(); // clear memory :: garbage collection
                    },
                },
            ],
        }).show();
    }
    function controller(rec, status) {
        if (status == "processUpdate") {
            Ext.Msg.minWidth = 200;
            Ext.Msg.buttonText = {
                ok: "ตกลง",
                cancel: "ยกเลิก",
                yes: "ผ่านรายการ",
                no: "ไม่",
            };
            if (rec.get("sp_emp_id") == 0) {
                Ext.Msg.alert("แจ้งเตือน", "ต้องบันทึกลงพนักงานผู้รับผิดชอบ", function (bu, action) {
                    return false;
                });
            } else {
                winProcess(rec);
                Ext.getCmp("reasonID").setValue(rec.get('c_comment'));
            }

        }
    } // Controller
    function cellClick(grid, rowIndex, columnIndex, e) {
        var record = grid.getStore().getAt(rowIndex);
        // console.log(record);
        Ext.selectRow = record;
        if (columnIndex === grid.getColumnModel().getIndexById("processDueID")) {
            //ttf
            controller(Ext.selectRow, "processUpdate"); //on
        } else if (columnIndex === grid.getColumnModel().getIndexById("processreverseID")) {
            //ttf
            cancel_tor("reverse");
            // console.log("Test");
        } else if (columnIndex === grid.getColumnModel().getIndexById("processcancelID")) {
            //ttf
            cancel_tor("cancel");
            // console.log("Test");
        }
    }

    //AutoLoad
    Ext.torType = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/All_spAlert.php",
        baseParams: {type: "sp_type_status", i_is_type_tor: true},
        root: "data",
        idProperty: "id",
        fields: ["id", "c_name"],
    });

    /*start: 0
     limit: 15
     type: storeDepartment
     mode: */
    //PopLove
    Ext.storeDepartment = new Ext.data.JsonStore({
        storeId: "storeDepartment",
        autoLoad: true,
        url: "api/All.php",
        root: "data",
        baseParams: {type: "storeSpEmp", start: 0, limit: 20, mode: null}, //Permission i_read
        idProperty: "id",
        totalProperty: "totalCount",
        fields: ["id", "c_code", "c_name"],
        //  fields: ['id', 'c_code', 'c_name', 'TextShow', 'dc_department_type_id', 'i_level', 'i_parent', 'c_department']
    });
    var columnMini = [
        {header: "ID System", sortable: true, hidden: true, dataIndex: "id"},
        {header: "สายงาน", sortable: true, dataIndex: "c_code"},
        {
            header: "ผู้ปฎิบัติงาน",
            sortable: true,
            id: "c_name",
            dataIndex: "c_name",
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                metaData.attr = "style='cursor:pointer';";
                return value;
            },
        },
    ];
    Ext.PopDepartmentForm = new Ext.ux.Poplov({
        text: "ผู้ปฎิบัติงาน",
        id: "sp_emp_idID", //go to relation
        iconCls: "page_magnify",
        valueHidden: "sp_emp_id", //go to hidden
        store: Ext.storeDepartment,
        headerGrid: columnMini,
        widthText: 280,
        fieldLabel: "ผู้ปฎิบัติงาน",
        isCellClickGrid: true,
        cellClickGrid: function (grid, rowIndex, columnIndex, e) {
            var id = "sp_emp_idID";
            var nameID = id + "_Name";
            var record = grid.getStore().getAt(rowIndex);

            var TextShow = record.data.c_code + " " + record.data.c_name;

            Ext.getCmp(id).setValue(record.data.id);
            Ext.getCmp(nameID).setValue(TextShow);
            Ext.getCmp("win-pop-lov" + id).hide();
            Ext.getCmp("win-pop-lov" + id).destroy();

            Ext.util.Cookies.set("sp_emp_name", TextShow);
            Ext.util.Cookies.set("sp_emp_id", record.data.id);
        },
    });

    Ext.bgProject = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/All_PoWorkingImpHdr.php",
        baseParams: {
            type: "bg_project",
        },
        root: "data",
        idProperty: "id",
        fields: ["id", "c_name", "f_project"],
    });
    Ext.po_user_permission = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: false,
        url: "api/All_PoWorkingImpHdr.php",
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
        url: "api/All_PoWorkingImpHdr.php",
        baseParams: {
            type: "dc_cost",
        },

        root: "data",
        idProperty: "id",
        fields: ["id", "c_code", "c_name"],
    });

    Ext.dc_cost2 = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/All_PoWorkingImpHdr.php",
        baseParams: {
            type: "dc_cost2",
            // all : "all" 
        },
        root: "data",
        idProperty: "id",
        fields: ["id", "c_code", "c_name"],
    });


    Ext.po_creditor_transfer = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/All_PoWorkingImpHdr.php",
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
        url: "api/All_PoWorkingImpHdr.php",
        baseParams: {
            type: "dc_expense_budget_type",
        },
        root: "data",
        idProperty: "id",
        fields: ["id", "c_name"],
    });
    Ext.po_expense_group = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/All_PoWorkingImpHdr.php",

        baseParams: {
            type: "po_expense_group",
        },
        root: "data",
        idProperty: "id",
        fields: ["id", "c_name"],
    });
    Ext.po_expense = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/All_PoWorkingImpHdr.php",
        baseParams: {
            type: "po_expense",
        },
        root: "data",
        idProperty: "id",
        fields: ["id", "c_name"],
    });
    Ext.storeDtl = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "tor/api/List_TorStep.php",
        baseParams: {
            type: "sp_tor_dempartment",
            keyData: Ext.keyData,
            i_alarm: Ext.menu_i_alarm,
            i_edit: true,
            i_pa: Ext.menu_i_day,
            tor_status_id: Ext.menu_id,
        },
        root: "data",
        idProperty: "id",
        totalProperty: "totalCount",
        fields: [
            {
                name: "no",
            },
            {
                name: "id",
            },
            {
                name: "i_step",
            },
            {
                name: "i_edit",
            },
            {
                name: "DateAdd1",
            },
            {
                name: "DateAdd2",
            },
            {
                name: "d_tor_date_alert",
            },
            {
                name: "d_tor_date_alert",
            },
            {
                name: "d_tor_date_pa",
            },
            {
                name: "d_tor_date_pa",
            },
            {
                name: "i_forword",
            },
            {
                name: "i_backword",
            },
            {
                name: "c_codeStatus",
            },
            {
                name: "sp_tor_delete",
            },
            {
                name: "c_nameStatus",
            },
            {
                name: "tor_delete_comment"
            },
            {
                name: "c_code",
            },
            {
                name: "bg_budget_dtl_project_id",
            },
            {
                name: "c_budget_dtl_project",
            },
            {
                name: "c_name", //c_emp_name
            },
            {
                name: "dc_emp_id", //
            },
            {
                name: "dc_emp_name", //
            },
            {
                name: "sp_emp_id", //
            },
            {
                name: "txtsp_emp_idID", //
            },
            {
                name: "c_code_status",
            },
            {
                name: "d_tor_status_date", //
            },
            {
                name: "c_name_status", // d_tor_status_date
            },
            {
                name: "c_tor_type",
            },
            {
                name: "tor_status_id",
            },
            {
                name: "tor_type_id",
            },
            {
                name: "c_purchase",
            },
            {
                name: "i_purchase",
            },
            {
                name: "d_tor_date", //
            },
            {
                name: "i_parent", //d_tor_date
            },
            {
                name: "i_is_more",
            },
            {
                name: "i_is_rename",
            },
            {
                name: "i_is_parent",
            },
            {
                name: "f_total_amt",
            },
            {
                name: "dc_cost_id",
            },
            {
                name: "dc_cost_idTxt",
            },
            {
                name: "dc_cost2_id",
            },
            {
                name: "dc_cost2_idTxt",
            },
            {
                name: "i_year",
            },
            {
                name: "i_yyyy",
            },
            {
                name: "txtdc_department_idID", //
            },
            {
                name: "dc_department_id", //txtdc_department_idID
            },
            {
                name: "c_department",
            },
            {
                name: "d_doc_ref",
            },
            {
                name: "dc_expense_budget_type_id",
            },
            {
                name: "po_expense_id",
            },
            {
                name: "dc_user_create_id",
            },
            {
                name: "dc_user_create_cost_id",
            },
            {
                name: "d_create",
            },
            {
                name: "dc_user_update_id",
            },
            {
                name: "dc_user_update_cost_id",
            },
            {
                name: "d_update",
            },
            {
                name: "i_enabled",
            },
            {
                name: "c_comment",
            },
            {
                name: "c_comment_status",
            },
            {
                name: "c_remake",
            },
            {
                name: "po_creditor_id",
            },
            {
                name: "po_creditor_idTxt",
            },
            {
                name: "start_date",
            },
            {
                name: "end_date",
            },
            {
                name: "i_is_register",
            },

            {
                name: "i_amount_bg",
            },
            {
                name: "i_pr_type1",
            },
            {
                name: "i_pr_type2",
            },
            {
                name: "i_pr_type3",
            },
            {
                name: "bg_reserve_money1_id",
            },
            {
                name: "bg_reserve_money2_id",
            },
            {
                name: "bg_reserve_money3_id",
            },
            {
                name: "f_type_amt",
            },
            {
                name: "f_type2_amt",
            },
            {
                name: "f_type3_amt",
            },
            {
                nmae: "sp_type_bg",
            },
        ],
    });

    Ext.store_year = new Ext.data.JsonStore({
        fields: ["id", "c_name"],
        autoDestroy: false,
        autoLoad: false,
        data: Ext.yearTh(),
    });
    Ext.keyData = 1; //type data key in

    Ext.poFormID = "grid-form-cheque";
    Ext.getDate = Ext.apply({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        day: new Date().getDay(),
        getNowCarlen: function () {
            var day = new Date();
            var dd = day.getDate();
            var mm = day.getMonth() + 1;
            var yy = day.getFullYear() + 543;
            mm = mm < 10 ? "0" + mm : mm;
            dd = dd < 10 ? "0" + dd : dd;
            return dd + "-" + mm + "-" + yy;
        },
        defaultDate: function (typeStartDate) {
            var day = new Date();
            var dd = day.getDate();
            var mm = day.getMonth() + 1;
            var yy = day.getFullYear() + 543;
            if (typeStartDate === 1) {
                // วันที่เริ่ม -1 เดือน
                dd = "01";
                mm = "0" + mm.toString();
            } else {
                dd = "0" + dd.toString();
                mm = "0" + mm.toString();
            }
            return dd.substr(-2) + "-" + mm.substr(-2) + "-" + yy.toString();
        },
    });
    //interlizing
    Ext.loadStore = function (status, show) {
        var statusx = status;
        var winx = show;
        if (statusx === "edit" && Ext.isEmpty(Ext.selectRow))
            Ext.Msg.alert("แจ้งเตือน", "กรุณา click เลือกข้อมูลที่จะแก้ไขใน data grid", function (form, action) {
                return false;
            });
        //             Ext.po_creditor.reload(
        //                     {
        //                         callback: function (recordx, operation, success)
        //                         {
        //                             if (success)
        //                             {
        //                                 Ext.po_creditor_transfer.reload(
        //                                         {
        //                                             callback: function (recordx, operation, success)
        //                                             {
        //                                                 if (success)
        //                                                 {
        else
            Ext.dc_cost.reload({
                callback: function (recordx, operation, success) {
                    if (success) {
                        //storeDepartment
                        Ext.storeDepartment.reload({
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
                                                                                        Ext.selectRow = null;
                                                                                        Ext.i_is_more = 0;
                                                                                        var winApp = AppPoStore(statusx);
                                                                                        winApp.show();
                                                                                    } else if (statusx === "edit") {
                                                                                        if (Ext.selectRow.data.sp_tor_delete == 1) {
                                                                                            sp_tor_delete()
                                                                                            return;
                                                                                        }
                                                                                        // return;
                                                                                        // if statusx ==
                                                                                        Ext.HDR_ID = Ext.selectRow.data.po_working_hdr_id;
                                                                                        Ext.tor_type_id = Ext.selectRow.data.tor_type_id; // default start เจาะจงน้อวกว่า 5 แสน
                                                                                        Ext.i_is_more = Ext.selectRow.data.i_is_more;
                                                                                        Ext.storeDepartment.setBaseParam("dc_department_id", Ext.selectRow.get("dc_department_id"));

                                                                                        var winApp = AppPoStore(statusx);
                                                                                        Ext.getCmp("winChequeID").items.items[0].getForm().loadRecord(Ext.selectRow);
                                                                                        winApp.show();
                                                                                        //แบ่งเพรมเลย load ไม่เข้า bug Codex แก้เรื่องเงินหาย
                                                                                        Ext.getCmp("sp_emp_idID_Name").setValue(Ext.selectRow.get("txtsp_emp_idID"));
                                                                                        Ext.getCmp("sp_emp_idID").setValue(Ext.selectRow.get("sp_emp_id"));
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
                        }); //storeDepartment
                    }
                },
            });

        //                                                 }
        //                                             }
        //                                         }); //po_creditor
        //                             }
        //                         }
        //                     }); //po_creditor_transfer
    };


    function SearchFrm() {
        return new Ext.Window({
            //                     collapsible: true,
            //                     maximizable: true,
            title: "ค้นหารายการ TOR",
            width: 700,
            id: "winSearchFrm",
            height: 200,
            layout: "fit",
            //                     modal: true,
            plain: true,
            bodyStyle: "padding:5px;",
            buttonAlign: "center",

            items: [
                {
                    layout: "column",
                    border: false,
                    defauls: {background: "#eee"},
                    items: [
                        {
                            columnWidth: 0.5,
                            layout: "form",
                            border: false,
                            items: [
                                {
                                    xtype: "textfield",
                                    fieldLabel: "รหัส PR",
                                    id: "sc_codeID", // sd_tor_dateID sc_codeID sc_nameID searchEnabledID
                                    name: "c_code",
                                },
                                {
                                    xtype: "datefield",
                                    fieldLabel: "วันที่ PR",
                                    id: "sd_tor_dateID",
                                    name: "d_tor_date",
                                },
                                {
                                    xtype: "radiogroup",
                                    columns: [120],
                                    fieldLabel: "ผ่านรายการ",
                                    id: "searchPostID",
                                    items: [
                                        {
                                            name: "i_post",
                                            checked: true,
                                            inputValue: 0,
                                            boxLabel: "ทั้งหมด",
                                        },
                                        {
                                            name: "i_post",
                                            inputValue: 1,
                                            boxLabel: "ผ่านรายการแล้ว",
                                        },
                                        {
                                            name: "i_post",
                                            inputValue: 2,
                                            boxLabel: "ยังไม่ผ่านรายการ",
                                        },
                                    ], //radiogroup
                                },
                            ],
                        },
                        {
                            columnWidth: 0.5,
                            layout: "form",
                            border: false,
                            items: [
                                {
                                    xtype: "textfield",
                                    fieldLabel: "เรื่อง PR",
                                    id: "sc_nameID",
                                    name: "c_name",
                                },
                                new Ext.form.ComboBox({
                                    mode: "local",
                                    store: new Ext.data.JsonStore({
                                        autoDestroy: false,
                                        autoLoad: false,
                                        url: "api/All_spAlert.php",
                                        baseParams: {
                                            type: "sp_type_status",
                                            i_is_type_tor: true,
                                            all: "all",
                                        },
                                        root: "data",
                                        idProperty: "id",
                                        fields: ["id", "c_name"],
                                    }),
                                    anchor: "100%",
                                    fieldLabel: "วิธีดำเนินงาน",
                                    submitValue: true,
                                    hiddenName: "stor_type_id",
                                    name: "sc_type_id",
                                    id: "stor_type_idID",
                                    valueField: "id",
                                    displayField: "c_name",
                                    triggerAction: "all",
                                    forceSelection: false,
                                    selectOnFocus: true,
                                    typeAhead: false,
                                    emptyText: "กรุณาเลือก",
                                    listeners: {
                                        afterrender: function () {
                                            //setLoad&&callback
                                            this.store.load({
                                                callback: function (record, operation, success) {
                                                    if (success) {
                                                        Ext.getCmp("stor_type_idID").setValue(this.data.items[0].get("c_name"));
                                                    }
                                                },
                                            });
                                        },
                                    },
                                }),
                                {
                                    xtype: "radiogroup",
                                    columns: [80, 90],
                                    fieldLabel: "สถานะการใช้งาน",
                                    id: "searchEnabledID",
                                    items: [
                                        {
                                            name: "i_enabled",
                                            checked: true,
                                            inputValue: 1,
                                            boxLabel: "ใช้งาน",
                                        },
                                        {
                                            name: "i_enabled",
                                            inputValue: 2,
                                            boxLabel: "ไม่ใช้งาน",
                                        },
                                    ], //radiogroup
                                },
                            ],
                        },
                    ],
                    buttonAlign: "left",
                    buttons: [
                        {
                            text: "ค้นหา",
                            handler: function () {
                                Ext.storeDtl.setBaseParam("mode", "LIST");
                                Ext.storeDtl.setBaseParam("act", "SEARCH");
                                Ext.storeDtl.setBaseParam("d_tor_date", Ext.getCmp("sd_tor_dateID").getValue());
                                Ext.storeDtl.setBaseParam("tor_type_id", Ext.getCmp("stor_type_idID").getValue());

                                Ext.storeDtl.setBaseParam("c_code", Ext.getCmp("sc_codeID").getValue());
                                Ext.storeDtl.setBaseParam("c_name", Ext.getCmp("sc_nameID").getValue());
                                Ext.storeDtl.setBaseParam("i_enabled", Ext.getCmp("searchEnabledID").getValue().inputValue);
                                Ext.storeDtl.setBaseParam("i_post", Ext.getCmp("searchPostID").getValue().inputValue);

                                Ext.storeDtl.load();
                            },
                        },
                        {
                            text: "ปิด",
                            handler: function () {
                                Ext.getCmp("winSearchFrm").hide();
                            },
                        },
                    ],
                },
            ],
            listeners: {
                afterRender: function (thisForm, options) {
                    new Ext.KeyNav("winSearchFrm", {
                        enter: function (e) {
                            Ext.storeDtl.setBaseParam("mode", "LIST");
                            Ext.storeDtl.setBaseParam("act", "SEARCH");
                            Ext.storeDtl.setBaseParam("d_tor_date", Ext.getCmp("sd_tor_dateID").getValue());
                            Ext.storeDtl.setBaseParam("tor_type_id", Ext.getCmp("stor_type_idID").getValue());

                            Ext.storeDtl.setBaseParam("c_code", Ext.getCmp("sc_codeID").getValue());
                            Ext.storeDtl.setBaseParam("c_name", Ext.getCmp("sc_nameID").getValue());
                            Ext.storeDtl.setBaseParam("i_enabled", Ext.getCmp("searchEnabledID").getValue().inputValue);
                            Ext.storeDtl.setBaseParam("i_post", Ext.getCmp("searchPostID").getValue().inputValue);

                            Ext.storeDtl.load();
                        },
                        scope: this,
                    });
                },
            },
        });
    }
    var MenuButton = function () {
        var menu = new Ext.menu.Menu({
            id: "mainMenu",
            border: false,
            style: {
                overflow: "visible",
            },
            /*
             items: [{
             text: "ประเภทข้อมูล",
             icon: "../images/icons/application_form_magnify.png",
             menu: {
             items: [
             '<b class="menu-title">  เลือกประเภทข้อมูล </b>',
             {
             text: " เลือกประเภทข้อมูลบันทึกจากระบบเท่านั้น",
             checked: false,
             id: "keyDatat1",
             uri: 1,
             group: "theme",
             checkHandler: onLocationCheck
             },
             {
             text: " เลือกประเภทนำเข้าจากการ import Excel เท่านั้น",
             checked: false,
             uri: 0,
             id: "keyDatat2",
             group: "theme",
             checkHandler: onLocationCheck
             },
             {
             text: " เลือกประเภทข้อมูลที่ทั้งหมด",
             checked: true,
             id: "keyDatat3",
             uri: null,
             group: "theme",
             checkHandler: onLocationCheck
             }
             ]
             }
             }]*/
        });
        var tb = new Ext.Toolbar({
            text: " รายการเมนู ",
            border: false,
            icon: "../images/icons/text_list_bullets.png",
            iconCls: "menu",
            // <-- icon
            menu: menu,
            // assign menu by instance
        });
        tb.add({
            text: " รายการเมนู ",
            icon: "../images/icons/text_list_bullets.png",
            iconCls: "bmenu",
            // <-- icon
            border: false,
            bodyStyle: "padding:0px 0px 0px 0px !important;",
            menu: menu,
            // assign menu by instance
        });
        menu.addSeparator();
        menu
                .add({
                    text: "ค้นหาข้อมูล",
                    icon: "../images/icons/book_magnify.png",
                })
                .on(
                        "click",
                        (click = function () {
                            if (!Ext.isEmpty(Ext.getCmp("winSearchFrm")))
                                Ext.getCmp("winSearchFrm").destroy();
                            var s1 = SearchFrm();
                            s1.show();
                        })
                        );
        tb.doLayout();
        return tb;
    }; //MenuButton
    Ext.gridMainfn = function (editAbled) {
        if (!Ext.isEmpty(Ext.getCmp("tabpanel1")))
            Ext.getCmp("contenterCenter").remove(Ext.getCmp("tabpanel1"), true) || {};

        var gridMains = new gridMain();
        Ext.getCmp("contenterCenter").add(gridMains);
        Ext.getCmp("contenterCenter").setActiveTab(gridMains);
        Ext.getCmp("tabpanel1").on("beforeedit", function () {
            return editAbled;
        });
        if (editAbled)
            Ext.getCmp("buSaveGridID").show();
        else
            Ext.getCmp("buSaveGridID").hide();

        return gridMains;
    };
    /////////////////// searchGrid Extend
    Ext.extend(
            (searchGrid = function () {
                var mnController = "reg/controller/mnPoWorkingHdrBegin.php";
                //classOverride
                searchGrid.superclass.constructor.call(this, {
                    initComponent: function () {
                        searchGrid.superclass.initComponent.call(this);
                        this.fn(this);
                        /*console.log('Loading...');*/
                    },
                    listeners: {
                        afterrender: function (obj, eOpts) {
                            /*console.log('Load Finish');*/
                        },
                    },
                    fn: function () {},
                    id: "frm-grid-searchID",
                    frame: true,
                    bodyStyle: "padding:1px",
                    autoHeight: true,
                    border: false,
                    width: 600,
                    url: mnController,
                    labelWidth: 180,
                    defaults: {
                        anchor: "0",
                    },
                    items: [
                        {
                            xtype: "hidden",
                            name: "mode",
                            value: "saveDataGrid",
                        },
                        {
                            xtype: "hidden",
                            name: "gridMain",
                            id: "gridMainID",
                        },
                        menu ? MenuButton() : [],
                    ],
                    buttonAlign: "left",
                    buttons: [
                        {
                            text: "บันทึกรายการ",
                            id: "buSaveGridID",
                            iconCls: "icon-save",
                            listeners: {
                                afterrender: function () {
                                    this.hide();
                                },
                            },
                            handler: function () {
                                var formSubmit = function () {
                                    form.submit({
                                        waitMsg: "Saving Data...",
                                        success: function (form, action) {
                                            Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                                Ext.getCmp("tabpanel1").getStore().reload();
                                                Ext.getCmp("winChequeID").hide();
                                                Ext.getCmp("winChequeID").destroy();
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
                                }; //func submit
                                var saveDtl = function (mode) {
                                    let msg = "";
                                    let jsonArr = [];
                                    let sto = Ext.getCmp("tabpanel1").store.data.items;
                                    sto.forEach(function (v) {
                                        //d_audit_date d_approve_date d_doc_date d_inv_date
                                        jsonArr.push({
                                            po_working_dtl_id: v.data.id,
                                            d_audit_date: Ext.isEmpty(v.data.d_audit_date) ? null : v.data.d_audit_date.add("Y", -543).dateFormat("Y-m-d"),
                                            d_approve_date: v.data.d_approve_date.add("Y", -543).dateFormat("Y-m-d"),
                                            d_doc_date: v.data.d_doc_date.add("Y", -543).dateFormat("Y-m-d"),
                                            d_inv_date: v.data.d_inv_date.add("Y", -543).dateFormat("Y-m-d"),
                                        });
                                    });

                                    //console.log(JSON.stringify(jsonArr));
                                    //console.log(jsonArr);
                                    //TODO @ setGridDirty to idCmp
                                    Ext.getCmp("gridMainID").setValue(JSON.stringify(jsonArr));
                                    formSubmit(form); //submit grid form
                                }; // saveDtl
                                var form = Ext.getCmp("frm-grid-searchID").getForm();
                                if (form.isValid()) {
                                    Ext.MessageBox.show({
                                        title: "Icon Support",
                                        msg: "คุณต้องการที่จะบันทึกข้อมูลใน Data Grid ใช่ใหม ?",
                                        buttons: Ext.MessageBox.OKCANCEL,
                                        icon: Ext.MessageBox.WARNING,
                                        fn: function (btn) {
                                            if (btn === "ok") {
                                                //TODO @ setGridDirty to idCmp
                                                saveDtl();
                                            } else {
                                                return;
                                            }
                                        },
                                    });
                                }
                            },
                            //haddler
                        },
                        {
                            xtype: "tbfill",
                        },
                        {
                            text: "ค้นหา",
                            id: "buSearchID",
                            iconCls: "icon-magnifier",
                            handler: function () {
                                search();
                            },
                        },
                        {
                            text: "เริ่มใหม",
                            iconCls: "icon-reset",
                            handler: function () {
                                Ext.getCmp("frm-grid-searchID").getForm().reset();
                            },
                        },
                    ],
                });
            }),
            Ext.FormPanel,
            {}
    );
    /////////////////// gridMain
    Ext.extend(
            (gridMain = function () {
                var colmnn = [
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
                        header: "id",
                        sortable: false,
                        align: "left",
                        dataIndex: "id",
                        hidden: true, // icon: "../images/icons/application_view_tile.png"
                    },
                    {
                        header: "สถานะ",
                        sortable: false,
                        align: "left",
                        dataIndex: "c_code_status",
                        hidden: true,
                        renderer: function (value, metaData, record, row, col, store, gridView) {
                            var val = value == null ? "" : value + " " + record.get("c_name_status");
                            return val;
                        },
                    },
                    {
                        header: "รหัส PR",
                        sortable: false,
                        align: "left",
                        dataIndex: "c_codeStatus",
                        width: 120,
                    },
                    /*     {
                     header: "อัพเดทสถานะ",
                     sortable: false,
                     align: "center",
                     dataIndex: "id",
                     id: "processDueID",
                     width: 90,
                     renderer: function (value, metaData, record, row, col, store, gridView) {
                     metaData.attr = "style='cursor:pointer; text-align:center;';";
                     if (record.get("i_is_register") == 0) return '<img src="../images/icons/application_form.png");/>';
                     else if (record.get("i_is_register") == 1) return '<img src="../images/icons/cog_start.png" style="cursor:pointer"/>';
                     },
                     },
                     {
                     header: "อัพเดทสถานะ",
                     sortable: false,
                     align: "center",
                     dataIndex: "id",
                     id: "processDueID",
                     width: 120,
                     renderer: function (value, metaData, record, row, col, store, gridView) {
                     metaData.attr = "style='cursor:pointer; text-align:center;';"; 
                     if (record.get("i_is_register") == 0){ 
                     var BtnText = "<img src='../images/icons/application_form.png' style='margin-right:1px;' /><div><spen style='font-size:11px'>&nbspยังไม่บันทึก</spen>";
                     }else if (record.get("i_is_register") == 1){ 
                     var BtnText = "<img src='../images/icons/cog_start.png' style='margin-right:1px;' /><div><spen style='font-size:11px'>&nbspบันทึกแล้ว</spen>";
                     }
                     return '<button style="width:110px; display:flex"  type="button">'+BtnText +'</button>';
                     }
                     },*/  //อัพเดทตัวเก่า
                    {
                        header: "อัพเดทสถานะ",
                        sortable: false,
                        align: "center",
                        dataIndex: "id",
                        id: "processDueID",
                        width: 120,
                        renderer: function (value, metaData, record, row, col, store, gridView) {
                            var BtnText, IconImg;
                            if (record.get("i_is_register") == 0) {
                                BtnText = '&nbspยังไม่บันทึก';
                                IconImg = '../images/icons/application_form.png';
                            } else if (record.get("i_is_register") == 1) {
                                BtnText = '&nbspบันทึกแล้ว';
                                IconImg = '../images/icons/cog_start.png';
                            } else {
                                BtnText = '&nbspยังไม่บันทึก';
                                IconImg = '../images/icons/application_form.png';
                            }
                            var style = 'font-size:12px;border:1px solid #ccc; width:110px; padding:3px 3px 3px 10px; background: #f0f0f0 url(' + IconImg + ') no-repeat 3px center; cursor: pointer;';

                            return '<button style="' + style + '" type="button">' + BtnText + '</button>';
                        }
                    },
                    {
                        header: "เรื่อง/โครงการ",
                        sortable: true,
                        align: "left",
                        dataIndex: "c_nameStatus",
                        width: 300,
                    },
                    {
                        header: "วันที่ PR",
                        sortable: false,
                        align: "center",
                        dataIndex: "d_tor_date",
                    }, {
                        header: "สายงาน", sortable: true, dataIndex: "txtdc_department_idID"},
                    {
                        header: "ผู้รับผิดชอบงาน",
                        width: 150,
                        sortable: false,
                        align: "left",
                        dataIndex: "txtsp_emp_idID",
                    },
                    {
                        header: "วิธีดำเนินงาน",
                        width: 70,
                        sortable: false,
                        align: "left",
                        dataIndex: "c_tor_type",
                    },
                    {
                        header: "ขอดำเนินการ",
                        sortable: false,
                        align: "center",
                        width: 70,
                        dataIndex: "c_purchase",
                    },
                    {
                        header: "รหัสเอกสารอ้างอิง",
                        sortable: false,
                        align: "center",
                        dataIndex: "d_doc_ref",
                    },
                    {
                        header: "จำนวนเงิน",
                        sortable: false,
                        align: "center",
                        dataIndex: "f_total_amt",
                        width: 110,
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                            metaData.attr = "style='color:blue;text-align: right;'";
                            return floatRenderer(value);
                        },
                    },
                    {
                        header: "หน่วยงานเจ้าของเรื่อง",
                        align: "left",
                        dataIndex: "dc_cost_idTxt",
                    },
                    {
                        header: "ชื่อผู้สร้างรายการ",
                        sortable: false,
                        align: "center",
                        dataIndex: "dc_user_create_id",
                        hidden: true,
                    },
                    {
                        header: "หน่วยงานผู้สร้าง",
                        sortable: false,
                        align: "center",
                        dataIndex: "dc_user_create_cost_id",
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
                        align: "center",
                        dataIndex: "dc_user_update_id",
                    },
                    {
                        header: "หน่วยงานแก้ไขรายการ",
                        sortable: false,
                        align: "center",
                        dataIndex: "dc_user_update_cost_id",
                    },
                    {
                        header: "วันที่แก้ไขรายการ",
                        sortable: false,
                        align: "center",
                        dataIndex: "d_update",
                        renderer: function (val, metaData, record, rowIndex, colIndex, store) {
                            return shortThaiDate(val);
                        },
                    },
                    {
                        header: "ย้อนสถานะ",
                        sortable: false,
                        align: "center",
                        // hidden : true,
                        dataIndex: "id",
                        id: "processreverseID", // reverse
                        width: 200,
                        renderer: function (value, metaData, record, row, col, store, gridView) {
                            var BtnText, IconImg;
                            BtnText = '&nbspย้อนรายการ';
                            IconImg = '../images/icons/date_previous.png';
                            var style = 'font-size:12px;border:1px solid #ccc; width:100px; padding:3px 3px 3px 10px; background: #f0f0f0 url(' + IconImg + ') no-repeat 3px center; cursor: pointer;';

                            return '<button style="' + style + '" type="button">' + BtnText + '</button>';
                        }
                    },
                    {
                        header: "ยกเลิกรายการ",
                        sortable: false,
                        align: "center",
                        dataIndex: "id",
                        id: "processcancelID", // cancel
                        width: 200,
                        renderer: function (value, metaData, record, row, col, store, gridView) {
                            var BtnText, IconImg;
                            BtnText = '&nbspยกเลิกรายการ';
                            IconImg = '../images/icons/page_cancel.png';
                            var style = 'font-size:12px;border:1px solid #ccc; width:100px; padding:3px 3px 3px 10px; background: #f0f0f0 url(' + IconImg + ') no-repeat 3px center; cursor: pointer;';

                            return '<button style="' + style + '" type="button">' + BtnText + '</button>';
                        }
                    },
                ];
                gridMain.superclass.constructor.call(this, {
                    region: "center",
                    title: Ext.title,
                    xtype: "grid",
                    id: "tabpanel1",
                    border: true,
                    stripeRows: true,
                    loadMask: true,
                    //------------------
                    layout: "fit",
                    clicksToEdit: 2,
                    viewConfig: {
                        emptyText: "ไม่มีข้อมูล..",
                        deferEmptyText: true,
                    },
                    listeners: {
                        dblclick: function (dataview, index, item, e) {
                            Ext.buAct = "update";
                            Ext.loadStore("edit", true); // app,data.load
                        },
                        viewready: function (g) {
                            //
                        },
                        // Allow rows to be rendered.
                        beforeedit: function (g) {
                            if (g.rowIdx == 1)
                                return false;
                        },
                        // Allow rows to be rendered. console.log(value.format('d-m-Y'));
                        afteredit: function (g) {
                            // console.log(g.record.get('d_inv_date').format('d-m-Y'));
                        },
                        beforerender: function (g) {
                            this.contextMenu = new Ext.menu.Menu({
                                items: [{
                                        text: "ตรวจสอบเอกสาร",
                                        icon: "../images/icons/icon_pdf.png",
                                        handler: function (e) {
                                            Ext.buAct = "FlowcartLv1";
                                            var linkDownload = window.location.protocol + '//' + window.location.hostname + '/sp_mn/api/upload/';
                                            if (Ext.isEmpty(Ext.selectRow))
                                                Ext.MessageBox.alert("แจ้งเตือน", "กรุณากดเลือกข้อมูลที่จะแสดง/ออกเลข PR ก่อน");
                                            window.open(linkDownload + Ext.selectRow.get('c_code') + '.pdf?T=Tap_'
                                                    + Math.floor(Math.random() * 100000)
                                                    , '_blank', 'fullscreen="yes"');
                                        },
                                        scope: this,
                                    },
                                    {
                                        text: "บันทึกภาระการทำงาน",
                                        icon: "../images/icons/application_form_edit.png",
                                        handler: function (e) {
                                            Ext.i_pr_about = 1;
                                            Ext.ar_pr_about = [];
                                            Ext.torItems = new Ext.data.JsonStore({
                                                autoDestroy: false,
                                                autoLoad: true,
                                                url: "api/All_spAlert.php",
                                                baseParams: {type: "sp_type_id"},
                                                root: "data",
                                                idProperty: "id",
                                                fields: ["id", "c_name"],
                                            });
                                            Ext.torScores = new Ext.data.JsonStore({
                                                autoDestroy: false,
                                                autoLoad: true,
                                                url: "api/All_spAlert.php",
                                                baseParams: {type: "sp_tor_scores", id: Ext.selectRow.get('id')},
                                                root: "data",
                                                idProperty: "id",
                                                fields: ["id", "tor_id", "c_name"]
                                            });
                                            var tab2 = new Ext.FormPanel({
//                                                labelAlign: 'top',
                                                title: "บันทึกรายละเอียดภาระงาน",
                                                bodyStyle: "padding:5px",
                                                layout: "fit",
                                                width: 600,
                                                id: "frmTab2",
                                                labelWidth: 180,
                                                items: [
                                                    {
                                                        height: 200,
                                                        layout: "column",
                                                        border: false,
                                                        items: [
                                                            {
                                                                columnWidth: 0.5,
                                                                layout: "form",
                                                                border: true,
                                                                id: "leftfrmID",
                                                                bodyStyle: "padding:1px",
                                                                items: [
                                                                    {
                                                                        xtype: "textarea",
                                                                        fieldLabel: "เรื่อง/โครงการ",
                                                                        name: "c_name",
                                                                        readOnly: true,
                                                                        anchor: "80%",
                                                                    },
                                                                    new Ext.form.ComboBox({
                                                                        mode: "local",
                                                                        store: Ext.torItems,
                                                                        anchor: "60%",
                                                                        fieldLabel: "วิธีดำเนินงาน (คิด PA)",
                                                                        submitValue: true,
                                                                        hiddenName: "sp_type_id",
                                                                        name: "c_type_id",
                                                                        id: "sp_type_idID",
                                                                        valueField: "id",
                                                                        displayField: "c_name",
                                                                        triggerAction: "all",
                                                                        forceSelection: true,
                                                                        selectOnFocus: true,
                                                                        typeAhead: false,
                                                                        emptyText: "กรุณาเลือก",
                                                                        listeners: {
                                                                            beforerender: function () {
                                                                                this.fnPrAbout = function (i, rec) {
                                                                                    let pr_about = i;
                                                                                    let pr_aboutRs = rec;
                                                                                    Ext.ar_pr_about.push(pr_about);

                                                                                    buttonGroup = new Ext.ButtonGroup({
                                                                                        fieldLabel: "เกณฑ์ราคาประกอบ",
                                                                                        frame: false,
                                                                                        border: false,
                                                                                        id: 'buttonGroup' + pr_about,
                                                                                        items: [
                                                                                            new Ext.form.TextArea({
                                                                                                width: 200,
                                                                                                text: '&nbsp;&nbsp;&nbsp;เลือก PR&nbsp;&nbsp;&nbsp;',
                                                                                                fieldLabel: "เกณฑ์ราคาประกอบ " + pr_about, // 
                                                                                                name: "areaPr[" + pr_about + "]",
                                                                                                id: "areaPrnID" + pr_about
                                                                                            }),
                                                                                            {
                                                                                                xtype: "tbspacer",
                                                                                                width: 9,
                                                                                            }, {
                                                                                                xtype: 'button',
                                                                                                id: 'buttonFindID' + pr_about,
                                                                                                name: 'buttonFind' + pr_about,
                                                                                                text: 'เลือก PR ' + pr_about,
                                                                                                handler: function () {
                                                                                                    Ext.getCmp('i_type_bgID').fnWinFind(pr_about);
                                                                                                }
                                                                                            }, {
                                                                                                xtype: "tbspacer",
                                                                                                width: 9,
                                                                                            }, {
                                                                                                xtype: 'hidden',
                                                                                                name: 'pr_about[' + pr_about + "]",
                                                                                                id: 'pr_about' + pr_about + 'ID',
                                                                                            }, {
                                                                                                xtype: 'button',
                                                                                                id: 'buttonID' + pr_about,
                                                                                                name: 'button' + pr_about,
                                                                                                text: 'ลบรายการ ' + pr_about,
                                                                                                handler: function () {
//                                                                                                       alert(pr_about);
                                                                                                    Ext.getCmp('leftfrmID').remove(Ext.getCmp('buttonGroup' + pr_about));

                                                                                                }
                                                                                            }, {
                                                                                                xtype: "label",
                                                                                                style: {
                                                                                                    color: "red",
                                                                                                    width: "200px"
                                                                                                },
                                                                                                text: "* แก้ไข"
                                                                                            }
                                                                                        ],
                                                                                        listeners: {
                                                                                            afterrender: function () {
                                                                                               
                                                                                                if (pr_aboutRs != null) {
                                                                                                     console.log(pr_aboutRs.get("c_name"));
                                                                                                    Ext.getCmp("areaPrnID" + pr_about).setValue(pr_aboutRs.get("c_name"));
                                                                                                    Ext.getCmp('pr_about' + pr_about + 'ID').setValue(pr_aboutRs.get("tor_id"));
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    });

                                                                                    Ext.getCmp('leftfrmID').insert(3, buttonGroup);
                                                                                    Ext.getCmp('leftfrmID').doLayout();

                                                                                };
                                                                            },
                                                                            afterrender: function () {
//                                                                                Ext.getCmp('leftfrmID').insert(2, new Ext.Button({
//                                                                                    text: '&nbsp;เพิ่ม&nbsp;',
//                                                                                    fieldLabel: "เกณฑ์ราคาประกอบเกณฑ์อื่น", // 
//                                                                                    name: "buttonOpen",
//                                                                                    id: "buttonOpenID",
//                                                                                    handler: function () {
//                                                                                        //Ext.getCmp('i_type_bgID').fnPrAbout(Ext.i_pr_about++, v);
//                                                                                    }
//                                                                                }));

                                                                                Ext.getCmp('leftfrmID').insert(3, new Ext.Button({
                                                                                    text: '&nbsp;เพิ่ม&nbsp;',
                                                                                    fieldLabel: "เกณฑ์ราคาประกอบเกณฑ์อื่น", // 
                                                                                    name: "buttonOpen2",
                                                                                    id: "buttonOpenID2",
                                                                                    handler: function () {
                                                                                        Ext.getCmp('sp_type_idID').fnPrAbout(Ext.i_pr_about++, null);
                                                                                    },
                                                                                    listeners: {
                                                                                        afterrender: function () {
                                                                                            Ext.torScores.reload({
                                                                                                callback: function (record, operation, success) {
//                                                                                                    console.log(record);
                                                                                                    record.forEach(function (v) {
                                                                                                        console.log(v.get("c_name"));
                                                                                                        Ext.getCmp('sp_type_idID').fnPrAbout(Ext.i_pr_about++, v);

                                                                                                    });
                                                                                                }
                                                                                            });
                                                                                        }
                                                                                    }
                                                                                }));
                                                                            }
                                                                        }

                                                                    }),
//                                                                    {
//                                                                        xtype: "checkbox",
//                                                                        id: "i_is_add1ID",
//                                                                        name: "i_is_add1",
//                                                                        height: 20,
//                                                                        fieldLabel: "เพิ่ม",
//                                                                        boxLabel: "เกณฑ์ราคาประกอบเกณฑ์อื่น",
//                                                                        inputValue: "1",
//                                                                        listeners: {
//                                                                            check: function (checkbox, checked) {
//
//                                                                            },
//                                                                            afterrender: function () {
//
//                                                                            },
//                                                                        },
//                                                                    }, {
//                                                                        xtype: "checkbox",
//                                                                        id: "i_is_add2ID",
//                                                                        name: "i_is_add2",
//                                                                        height: 20,
//                                                                        fieldLabel: "เพิ่มตรวจรับ",
//                                                                        boxLabel: "เกณฑ์ราคาประกอบเกณฑ์อื่น",
//                                                                        inputValue: "1",
//                                                                        listeners: {
//                                                                            check: function (checkbox, checked) {
//                                                                            },
//                                                                            afterrender: function () {
//
//
//                                                                            },
//                                                                        },
//                                                                    }
                                                                ],
                                                            },
                                                            {
                                                                columnWidth: 0.5,
                                                                layout: "form",
                                                                border: true,
                                                                items: [
                                                                    {
                                                                        xtype: "textfield",
                                                                        fieldLabel: "จำนวนเงิน",
                                                                        name: "f_type_amt",
                                                                        readOnly: true,
                                                                        anchor: "50%",
                                                                    },
                                                                ],
                                                            },
                                                        ],
                                                        buttonAlign: "left",
                                                        buttons: [
                                                            {
                                                                text: "บันทึกรายการ",
                                                                iconCls: "icon-save",
                                                            },
                                                            {
                                                                text: "ยกเลิก",
                                                                iconCls: "icon-cancel",
                                                                handler: function () {
                                                                    Ext.getCmp("frmTab2").destroy();
                                                                },
                                                            },
                                                        ],
                                                    },
                                                    {
                                                        xtype: "tabpanel",
                                                        plain: true,
                                                        activeTab: 0,
                                                        height: 235,
                                                        deferredRender: false,
                                                        defaults: {bodyStyle: "padding:10px"},
                                                        items: [
                                                            {
                                                                title: "Personal Details",
                                                                layout: "form",
                                                                defaults: {width: 230},
                                                                defaultType: "textfield",

                                                                items: [
                                                                    {
                                                                        fieldLabel: "First Name",
                                                                        name: "first",
                                                                        allowBlank: false,
                                                                        value: "Jack",
                                                                    },
                                                                    {
                                                                        fieldLabel: "Last Name",
                                                                        name: "last",
                                                                        value: "Slocum",
                                                                    },
                                                                    {
                                                                        fieldLabel: "Company",
                                                                        name: "company",
                                                                        value: "Ext JS",
                                                                    },
                                                                    {
                                                                        fieldLabel: "Email",
                                                                        name: "email",
                                                                        vtype: "email",
                                                                    },
                                                                ],
                                                            },
                                                            {
                                                                title: "Phone Numbers",
                                                                layout: "form",
                                                                defaults: {width: 230},
                                                                defaultType: "textfield",

                                                                items: [
                                                                    {
                                                                        fieldLabel: "Home",
                                                                        name: "home",
                                                                        value: "(888) 555-1212",
                                                                    },
                                                                    {
                                                                        fieldLabel: "Business",
                                                                        name: "business",
                                                                    },
                                                                    {
                                                                        fieldLabel: "Mobile",
                                                                        name: "mobile",
                                                                    },
                                                                    {
                                                                        fieldLabel: "Fax",
                                                                        name: "fax",
                                                                    },
                                                                ],
                                                            },
                                                            {
                                                                cls: "x-plain",
                                                                title: "Biography",
                                                                layout: "fit",
                                                                items: {
                                                                    xtype: "htmleditor",
                                                                    id: "bio2",
                                                                    fieldLabel: "Biography",
                                                                },
                                                            },
                                                        ],
                                                    },
                                                ],
                                            });
                                            Ext.buAct = "getDetail";
                                            Ext.getCmp("contenterCenter").add(tab2);
                                            Ext.getCmp("contenterCenter").setActiveTab(tab2);
                                            Ext.getCmp("frmTab2").getForm().loadRecord(Ext.selectRow);

                                        },
                                        scope: this,
                                    },
                                    {
                                        text: "จัดการข้อมูล PR ",
                                        icon: "../images/icons/application_edit.png",
                                        handler: function (e) {
                                            Ext.buAct = "update";
                                            Ext.loadStore("edit", true); // app,data.load
                                        },
                                        scope: this,
                                    },
                                    {
                                        text: "ย้อนรายการ",
                                        // hidden: Ext.isAudit ? false : true,
                                        icon: "../images/icons/date_previous.png",
                                        handler: function (e) {
                                            // Ext.buAct = "update";
                                            cancel_tor("reverse");
                                        },
                                        scope: this,
                                    },
                                    {
                                        text: "ยกเลิกรายการ",
                                        // hidden: Ext.isAudit ? true : false,
                                        icon: "../images/icons/page_cancel.png",
                                        handler: function (e) {
                                            cancel_tor("cancel");
                                        },
                                        scope: this,
                                    },
                                ],
                            });
                        },
                        afterrender: function (g) {
                            //g.getStore().getAt(rowIndex);
                            //  console.log();

                            this.on("cellclick", cellClick, this); //cellClick
                            this.on(
                                    "contextmenu",
                                    function (e, grid, rowIndex, columnIndex) {
                                        e.stopEvent();
                                        this.contextMenu.showAt(e.getXY());
                                    },
                                    this
                                    );
                        },
                    },
                    store: Ext.storeDtl,
                    //             tbar: MenuButton(),
                    tbar: [
                        {
                            xtype: "button",
                            text: " ค้นหา ",
                            width: 80,
                            iconCls: "icon-application-view-list",
                            handler: function () {
                                if (!Ext.isEmpty(Ext.getCmp("winSearchFrm")))
                                    Ext.getCmp("winSearchFrm").destroy();
                                var s1 = SearchFrm();
                                s1.show();
                                Ext.getCmp("sc_codeID").focus(false, 20);
                            },
                        },
                    ],
                    columns: colmnn,
                    bbar: new Ext.PagingToolbar({
                        pageSize: 20,
                        store: Ext.storeDtl,
                        displayInfo: true,
                        displayMsg: "Displaying topics {0} - {1} of {2}",
                    }),
                });
            }),
            Ext.grid.GridPanel,
            {}
    );
    ///////////////// EditorGridPanel
    const search = function () {
        var msg = "";
        if (msg == "") {
            Ext.storeDtl.setBaseParam("mode", "SEARCH");
            Ext.storeDtl.setBaseParam("filter", Ext.getCmp("filter-ID").getValue());
            Ext.storeDtl.setBaseParam("value", Ext.getCmp("val-ID").getValue());
            Ext.storeDtl.setBaseParam("userid", Ext.getCmp("userid-ID").getValue());
            Ext.getCmp("tabpanel1").getStore().load();
        } else {
            Ext.Msg.alert("แจ้งเตือน", msg);
        }
    };
};
