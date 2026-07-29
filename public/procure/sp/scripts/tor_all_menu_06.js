var saveDtl = function (mode) {
    let msg = "";
    let jsonArr = [];
    var num = Ext.getCmp("gridEditor2").store.data.items.length - 1;
    var row = 0;
    while (num >= row) {
        if (document.getElementById("chk_" + row).checked == true) {
            jsonArr.push({
                c_name: Ext.getCmp("gridEditor2").store.data.items[row].data.dc_creditor_name,
                sp_tor_bidder_dtl_id: Ext.getCmp("gridEditor2").store.data.items[row].data.sp_tor_bidder_dtl_id,
                dc_creditor_id: Ext.getCmp("gridEditor2").store.data.items[row].data.dc_creditor_id,
                sp_tor_dtl_id: Ext.SP_TOR_DTL_ID,
                sp_tor_id: Ext.SP_TOR_ID,
            });
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
                mode: "UP_SP_TOR_VICTORY",
                data: JSON.stringify(jsonArr),
            },
            success: function (result, request) {
                // Ext.getCmp("win-frm-perid-bal-dtlID").getEl().unmask();
                let json = Ext.util.JSON.decode(result.responseText);
                Ext.Msg.alert("แจ้งเตือน", json.msg);
                Ext.store3.setBaseParam("sp_tor_id", Ext.SP_TOR_ID);
                Ext.store3.setBaseParam("sp_tor_dtl_id", Ext.SP_TOR_DTL_ID);
                Ext.store3.setBaseParam("dc_creditor_id", Ext.DC_CREDITOR_ID);
                /*Ext.store3.load({
                                                        callback: function (recordx, operation, success) {
                                                            if (success) {
                                                               var sto = recordx;
                                                                sto.forEach(function (v) { 
                                                                    if(v.get('CheckColumn')===true){  
                                                                      Ext.saveDtlID = true; 
                                                                    } 
                                                               
                                                                     
                                                                });
                                                                 
                                                                 TabNext(record, "view"); //on
                                                              
                                                            }
                                                        }
                                                    });*/
                Ext.store3.load({
                    callback: function (recordx, operation, success) {
                        if (success) {
                            
                            Ext.store2.setBaseParam("sp_tor_id", Ext.SP_TOR_ID);
                            Ext.store2.load({
                                callback: function (record, operation, success) {
                                    if (success) {
                                        Ext.getCmp("winChequeID").setActiveTab(0);
                                        var sto = recordx;
                                        sto.forEach(function (v) { 
                                            if(v.get('CheckColumn')===true){  
                                              Ext.saveDtlID = true; 
                                              Ext.getCmp('saveDtlID').setDisabled(true);
                                            }  
                                        });
                                    }
                                },
                            });
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
var cancel_victory = function (id) {
    var win = new Ext.Window({
        id: "win-msg-delete",
        title: "Remove",
        modal: true,
        width: 250,
        height: 130,
        html: "ท่านต้องการที่จะยกเลิกรายการนี้ ?",
        buttons: [
            {
                text: "Confirm",
                handler: function () {
                    Ext.Ajax.request({
                        url: "tor/api/mnTorController.php",
                        params: {
                            mode: "DELETE_SP_TOR_VICTORY",
                            id: id,
                        },
                        method: "GET", //POST
                        success: function (result, request) {
                            Ext.getCmp("win-msg-delete").destroy();
                            Ext.store3.setBaseParam("sp_tor_id", Ext.SP_TOR_ID);
                            Ext.store3.setBaseParam("sp_tor_dtl_id", Ext.SP_TOR_DTL_ID);
                            Ext.store3.setBaseParam("dc_creditor_id", Ext.DC_CREDITOR_ID);
                            Ext.store3.load({
                                callback: function (record, operation, success) {
                                    if (success) {
                                        Ext.store2.setBaseParam("sp_tor_id", Ext.SP_TOR_ID);
                                        Ext.store2.load();
                                    }
                                },
                            });
                        },
                        failure: function (result, request) {
                            Ext.MessageBox.alert("Failed", result.responseText); // connect error
                        },
                    });
                },
            },
            {
                text: "Cancel",
                handler: function () {
                    Ext.getCmp("win-msg-delete").hide();
                    Ext.getCmp("win-msg-delete").destroy();
                    Ext.getCmp("tabpanel1").getStore().reload();
                },
            },
        ],
    }).show();
};

function checkID(RowCheck) {
    var num = Ext.getCmp("gridEditor2").store.data.items.length - 1;
    var row = 0;
    while (num >= row) {
        if (RowCheck != row) {
            document.getElementById("chk_" + row).checked = false;
        }
        row++;
    }
    // var models = Ext.getCmp("gridEditor2").getStore().getRange();
    // if (document.getElementById("chk_" + row).checked == true) {
    //   models[row].set("CheckColumn", true);
    // } else {
    //   models[row].set("CheckColumn", false);
    //   document.getElementById("f_bid" + row).value = null;
    //   document.getElementById("f_bid_total" + row).value = null;
    // }
}

    Ext.store2 = new Ext.data.JsonStore({
        storeId: "myStore2",
        autoLoad: false,
        url: "tor/api/mnTorController.php",
        root: "data",
        baseParams: {mode: "LIST_TOR_DTL_ST0006", i_read: user_right_read}, //Permission i_read
        idProperty: "id",
        totalProperty: "totalCount",
        fields: [
            {name: "sp_tor_dtl_id"},
            {name: "sp_tor_id"},
            {name: "c_name"},
            {name: "i_qty"},
            {name: "i_used"},
            {name: "i_balance"},
            {name: "dc_unit_type_id"},
            {name: "dc_unit_type_name"},
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
            {name: "i_is_victory"},
        ],
    });
    Ext.store3 = new Ext.data.JsonStore({
        storeId: "myStore2",
        autoLoad: false,
        url: "tor/api/mnTorController.php",
        root: "data",
        baseParams: {mode: "LIST_BIDDER_DTL_ST0006"},
        idProperty: "id",
        totalProperty: "totalCount",
        fields: [
            {name: "no"},
            {name: "CheckColumn"},
            {name: "i_is_victory"},
            {name: "sp_tor_bidder_dtl_id"},
            {name: "dc_creditor_id"},
            {name: "dc_creditor_name"},
            {name: "f_bid_unit_price"},
            {name: "i_bid_qty"},
            {name: "f_bid_total_price"},
            {name: "f_unit_price"},
            {name: "i_qty"},
            {name: "f_total_price"},
            {name: "dc_unit_type_name"},
        ],
    });
    Ext.all_bidder = new Ext.data.JsonStore({
        storeId: "myStore2",
        autoLoad: false,
        url: "tor/api/mnTorController.php",
        root: "data",
        baseParams: {mode: "ALL_BIDDER"},
        idProperty: "id",
        totalProperty: "totalCount",
        fields: [{name: "id"}, {name: "c_name"}],
        listeners: {
            load: function (t, records, options) {
                Ext.getCmp("all_bidderID").setValue("0");
            },
        },
    });
    Ext.bidder_select = new Ext.data.JsonStore({
        storeId: "myStore2",
        autoLoad: false,
        url: "tor/api/mnTorController.php",
        root: "data",
        baseParams: {mode: "BIDDER_SELECT"},
        idProperty: "id",
        totalProperty: "totalCount",
        fields: [
            {name: "no"},
            {name: "victory_id"},
            {name: "CheckColumn"},
            {name: "sp_tor_bidder_dtl_id"},
            {name: "sp_tor_dtl_id"},
            {name: "dc_creditor_id"},
            {name: "c_name"},
            {name: "dc_creditor_name"},
            {name: "f_bid_unit_price"},
            {name: "f_bid_total_price"},
            {name: "i_bid_qty"},
            {name: "f_unit_price"},
            {name: "f_total_price"},
            {name: "i_qty"},
            {name: "dc_unit_type_name"},
        ],
        listeners: {
            // load: function (t, records, options) {
            //   Ext.getCmp("all_bidderID").setValue("0");
            // },
        },
    });
    var colPOP = [
        new Ext.grid.RowNumberer({width: 35, header: " No ", dataIndex: "no"}),
        {header: "ID System", hidden: true, dataIndex: "dc_creditor_id"},
        {
            header: "-",
            align: "center",
            dataIndex: "creditor_name",
            width: 85,
            id: "detailBidder",
            renderer: function (value, metaData, record, row, col, store, gridView) {
                return "<button>รายชื่อผู้เสนอ</button>";
            },
        },
        {
            header: "ชื่อรายการ",
            align: "left",
            dataIndex: "c_name",
            width: 200,
        },
        {
            header: "จำนวน",
            align: "center",
            dataIndex: "i_qty",
            width: 50,
        },
        {
            header: "หน่วยนับ",
            align: "center",
            dataIndex: "dc_unit_type_name",
            width: 80,
        },
        {
            header: "จำนวนเงิน ต่อหน่วย",
            align: "right",
            dataIndex: "f_unit_price",
            width: 100,
        },
        {
            header: "จำนวนเงินรวม",
            align: "right",
            dataIndex: "f_total_price",
            width: 100,
        },

        // {
        //   id: "delete_bidder_hdr",
        //   header: "ลบ",
        //   sortable: false,
        //   align: "center",
        //   width: 8,
        //   dataIndex: "id",
        //   renderer: function (value, metaData, record, row, col, store, gridView) {
        //     return '<img src="../images/icons/table_delete.png"); style="cursor:pointer"/>';
        //   },
        // },
        {width: 5, dataIndex: ""},
    ];
 
Ext.AppConfig();
//interlizing
Ext.menuCode = "ST0007"; //go to
Ext.title = "" + Ext.menuCode;
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
    var comboCost2 = new Ext.form.ComboBox({
        mode: "local",
        store: Ext.dc_cost,
        anchor: "100%",
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
    Ext.menu_i_alarm = Ext.selectRow.get('i_alarm');
    Ext.menu_i_day = Ext.selectRow.get('i_day');
    return new Ext.Window({
        collapsible: true,
        maximizable: true,
        title: "บันทึก PR",
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
                                                readOnly: true,
                                                name: "c_code",
                                            },
                                            {
                                                xtype: "textarea",
                                                width: 500,
                                                height: 35,
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
                                                //
                                            },
                                            Ext.getBodyMultiBudget(Ext.selectRow, 'st0006'),
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
                                        ],
                                    },
                                    {
                                        columnWidth: 0.5,
                                        layout: "form",
                                        autoScroll: true, // เพิ่ม Scrollbar ทั้งแนวนอนและแนวตั้ง  
                                        items:[ {
                                xtype: "grid",
                                id: "gridSub1ID",
                                title:"พิจารณาผล",
                                stripeRows: true,
                                frame: true,
                                loadMask: true, 
                                autoScroll: true, 
                                border: false,  
                                disableSelection: true, 
                                height: 500,
                                store: Ext.store2,
                                viewConfig: {
                                    forceFit: true,
                                    emptyText: "ไม่มีข้อมูล..",
                                    deferEmptyText: false,
                                    getRowClass: function (record) {
                                        if (record.data.i_is_victory == true) {
                                            return "td-succeed ";
                                        }
                                    },
                                },
                                tbar: [
                                    {
                                        xtype: "buttongroup",
                                        // title: "ระบุเงื่อนไขในการค้นหาข้อมูล",
                                        columns: 1,
                                        defaults: {scale: "small", style: "float: right"},
                                        items: [
                                            {
                                                xtype: "buttongroup",
                                                frame: false,
                                                items: [
                                                    {xtype: "label", text: "ผู้เสนอราคา : "},
                                                    {xtype: "tbspacer", width: 4},
                                                    new Ext.form.ComboBox({
                                                        id: "all_bidderID",
                                                        store: Ext.all_bidder,
                                                        valueField: "id",
                                                        displayField: "c_name",
                                                        mode: "local",
                                                        triggerAction: "all",
                                                        forceSelection: true,
                                                        selectOnFocus: true,
                                                        typeAhead: false,
                                                        emptyText: "กรุณาเลือก...",
                                                        width: 354,
                                                        value: "0",
                                                        listeners: {
                                                            change: function (combo, newValue) {
                                                                if (newValue == "") {
                                                                    combo.reset();
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
                                                    }),
                                                    {xtype: "tbspacer", width: 4},
                                                    // { xtype: "tbfill" },
                                                    {
                                                        text: " &nbsp;&nbsp;พิจารณาผลจากผู้เสนอราคา",
                                                        iconCls: "icon-save",
                                                        handler: function () {
                                                            var msg = "";
                                                            if (Ext.getCmp("all_bidderID").getValue() == 0) {
                                                                msg += "<span style='white-space: nowrap;'>- กรุณาเลือกผู้เสนอราคา</span><br>";
                                                            }
                                                            if (msg == "") {
                                                                Ext.bidder_select.setBaseParam("sp_tor_id", Ext.SP_TOR_ID);
                                                                Ext.bidder_select.setBaseParam("dc_creditor_id", Ext.getCmp("all_bidderID").getValue());
                                                                Ext.bidder_select.load({
                                                                    callback: function (recordx, operation, success) {
                                                                        if (success) {
                                                                            const cancel_victory_all_bidderID = function (id) {
                                                                                var win = new Ext.Window({
                                                                                    id: "win-msg-delete",
                                                                                    title: "Remove",
                                                                                    modal: true,
                                                                                    width: 250,
                                                                                    height: 130,
                                                                                    html: "ท่านต้องการที่จะยกเลิกรายการนี้ ?",
                                                                                    buttons: [
                                                                                        {
                                                                                            text: "Confirm",
                                                                                            handler: function () {
                                                                                                Ext.Ajax.request({
                                                                                                    url: "tor/api/mnTorController.php",
                                                                                                    params: {
                                                                                                        mode: "DELETE_SP_TOR_VICTORY",
                                                                                                        id: id,
                                                                                                    },
                                                                                                    method: "GET", //POST
                                                                                                    success: function (result, request) {
                                                                                                        Ext.getCmp("win-msg-delete").destroy();
                                                                                                        Ext.bidder_select.setBaseParam("sp_tor_id", Ext.SP_TOR_ID);
                                                                                                        Ext.bidder_select.setBaseParam("dc_creditor_id", Ext.getCmp("all_bidderID").getValue());
                                                                                                        Ext.bidder_select.load({
                                                                                                            callback: function (record, operation, success) {
                                                                                                                if (success) {
                                                                                                                    Ext.store2.setBaseParam("sp_tor_id", Ext.SP_TOR_ID);
                                                                                                                    Ext.store2.load();
                                                                                                                }
                                                                                                            },
                                                                                                        });
                                                                                                    },
                                                                                                    failure: function (result, request) {
                                                                                                        Ext.MessageBox.alert("Failed", result.responseText); // connect error
                                                                                                    },
                                                                                                });
                                                                                            },
                                                                                        },
                                                                                        {
                                                                                            text: "Cancel",
                                                                                            handler: function () {
                                                                                                Ext.getCmp("win-msg-delete").hide();
                                                                                                Ext.getCmp("win-msg-delete").destroy();
                                                                                                Ext.getCmp("tabpanel1").getStore().reload();
                                                                                            },
                                                                                        },
                                                                                    ],
                                                                                }).show();
                                                                            };

                                                                            check_allID = function (v) {
                                                                                if (v) {
                                                                                    var num = Ext.getCmp("grid_all_bidder").store.data.items.length - 1;
                                                                                    var row = 0;
                                                                                    while (num >= row) {
                                                                                        if (Ext.getCmp("grid_all_bidder").store.data.items[row].data.victory_id == null) {
                                                                                            document.getElementById("chk_B_" + row).checked = true;
                                                                                        }
                                                                                        row++;
                                                                                    }
                                                                                } else {
                                                                                    var num = Ext.getCmp("grid_all_bidder").store.data.items.length - 1;
                                                                                    var row = 0;
                                                                                    while (num >= row) {
                                                                                        if (Ext.getCmp("grid_all_bidder").store.data.items[row].data.victory_id == null) {
                                                                                            document.getElementById("chk_B_" + row).checked = false;
                                                                                        }
                                                                                        row++;
                                                                                    }
                                                                                }
                                                                            };

                                                                            var win = new Ext.Window({
                                                                                labelWidth: 175,
                                                                                collapsible: true,
                                                                                maximizable: true,
                                                                                modal: true,
                                                                                title: "ผู้เสนอราคา : " + Ext.getCmp("all_bidderID").lastSelectionText,
                                                                                id: "win-frm-contractID",
                                                                                layout: "fit",
                                                                                border: false,
                                                                                width: 900,
                                                                                height: 500,
                                                                                items: [
                                                                                    new Ext.grid.GridPanel({
                                                                                        id: "grid_all_bidder",
                                                                                        region: "center",
                                                                                        layout: "fit",
                                                                                        border: false,
                                                                                        stripeRows: true,
                                                                                        loadMask: true,
                                                                                        height: 1000,
                                                                                        clicksToEdit: 1,
                                                                                        // disableSelection: true,
                                                                                        store: Ext.bidder_select,
                                                                                        viewConfig: {
                                                                                            forceFit: true,
                                                                                            emptyText: "ไม่มีข้อมูล..",
                                                                                            deferEmptyText: false,
                                                                                            getRowClass: function (record) {
                                                                                                if (record.data.CheckColumn == true && record.data.sp_tor_bidder_dtl_id != null) {
                                                                                                    return "td-succeed ";
                                                                                                }
                                                                                                if (record.data.CheckColumn == true && record.data.sp_tor_bidder_dtl_id == null) {
                                                                                                    return "td-wait ";
                                                                                                }
                                                                                            },
                                                                                        },
                                                                                        listeners: {
                                                                                            beforerender: function () {
                                                                                                this.thisCick = function (grid, rowIndex, columnIndex, e) {
                                                                                                    var record = grid.getStore().getAt(rowIndex);
                                                                                                    if (columnIndex === grid.getColumnModel().getIndexById("cancel_bidder_dtl")) {
                                                                                                        if (record.data.sp_tor_bidder_dtl_id != null) {
                                                                                                            cancel_victory_all_bidderID(record.data.sp_tor_bidder_dtl_id);
                                                                                                        }
                                                                                                    }
                                                                                                };
                                                                                            },
                                                                                            afterrender: function () {
                                                                                                Ext.getCmp("grid_all_bidder").on("cellclick", this.thisCick, this);
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
                                                                                            {header: "ID System", hidden: true, dataIndex: "sp_tor_bidder_dtl_id"},

                                                                                            {
                                                                                                header: "<div class='topAlign'><input id='check_allID' type='checkbox' onchange='check_allID(this.checked)'></div>",
                                                                                                sortable: false,
                                                                                                align: "center",
                                                                                                dataIndex: "CheckColumn",
                                                                                                width: 50,
                                                                                                renderer: function (value, metaData, record, row, col, store, gridView) {
                                                                                                    // metaData.style="background-color:#ffaaaa !important;";
                                                                                                    // metaData.attr = 'style="background-color:#FFE0D2 !important;"';
                                                                                                    // metaData.style = "background:#FFE0D2;";
                                                                                                    if (record.data.victory_id > 0) {
                                                                                                        var readonly = "disabled";
                                                                                                        var checked = record.data.victory_id == Ext.getCmp("all_bidderID").getValue() ? "checked" : "";
                                                                                                    } else {
                                                                                                        var readonly = "";
                                                                                                        var checked = "";
                                                                                                    }
                                                                                                    console.log(record.data.sp_tor_bidder_dtl_id);
                                                                                                    return "<input style='margin-top:3px; margin-bottom:2px;' type='checkbox' onchange='checkID(" + row + ")' id='chk_B_" + row + "' value='" + value + "' " + checked + "  " + readonly + "> ";
                                                                                                },
                                                                                            },
                                                                                            {
                                                                                                header: "ราคาเสนอ/ต่อหน่วย (รวม VAT)",
                                                                                                sortable: false,
                                                                                                dataIndex: "f_bid_unit_price",
                                                                                                align: "right",
                                                                                                width: 114,
                                                                                            },
                                                                                            {
                                                                                                hidden: true,
                                                                                                sortable: false,
                                                                                                dataIndex: "victory_id",
                                                                                                align: "right",
                                                                                                width: 114,
                                                                                            },
                                                                                            {
                                                                                                header: "ราคาเสนอ (รวม)",
                                                                                                sortable: false,
                                                                                                dataIndex: "f_bid_total_price",
                                                                                                align: "right",
                                                                                                width: 114,
                                                                                            },
                                                                                            {
                                                                                                header: "รายการ",
                                                                                                sortable: false,
                                                                                                dataIndex: "c_name",
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
                                                                                                header: "ราคาต่อหน่วย",
                                                                                                sortable: false,
                                                                                                align: "right",
                                                                                                dataIndex: "f_unit_price",
                                                                                                width: 120,
                                                                                            },
                                                                                            {
                                                                                                header: "ราคาทั้งหมด",
                                                                                                sortable: false,
                                                                                                align: "right",
                                                                                                dataIndex: "f_total_price",
                                                                                                width: 120,
                                                                                            },
                                                                                            {
                                                                                                id: "cancel_bidder_dtl",
                                                                                                header: "ยกเลิก",
                                                                                                sortable: false,
                                                                                                align: "center",
                                                                                                width: 40,
                                                                                                dataIndex: "id",
                                                                                                renderer: function (value, metaData, record, row, col, store, gridView) {
                                                                                                    if (record.data.victory_id == Ext.getCmp("all_bidderID").getValue()) {
                                                                                                        return '<img src="../images/icons/table_delete.png"); style="cursor:pointer"/>';
                                                                                                    }
                                                                                                },
                                                                                            },
                                                                                            {width: 20, dataIndex: ""},
                                                                                        ],
                                                                                    }),
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
                                                                                        text: "บันทึก",
                                                                                        handler: function () {
                                                                                            let msg = "";
                                                                                            let jsonArr = [];
                                                                                            // console.log(Ext.getCmp("grid_all_bidder"));
                                                                                            var num = Ext.getCmp("grid_all_bidder").store.data.items.length - 1;
                                                                                            var row = 0;
                                                                                            
                                                                                             
                                                                                            while (num >= row) {
                                                                                                
                                                                                               
                                                                                                if (document.getElementById("chk_B_" + row).checked == true && Ext.getCmp("grid_all_bidder").store.data.items[row].data.victory_id == null) {
                                                                                                    jsonArr.push({
                                                                                                        c_name: Ext.getCmp("grid_all_bidder").store.data.items[row].data.dc_creditor_name,
                                                                                                        sp_tor_bidder_dtl_id: Ext.getCmp("grid_all_bidder").store.data.items[row].data.sp_tor_bidder_dtl_id,
                                                                                                        dc_creditor_id: Ext.getCmp("all_bidderID").getValue(),
                                                                                                        sp_tor_dtl_id: Ext.getCmp("grid_all_bidder").store.data.items[row].data.sp_tor_dtl_id,
                                                                                                        sp_tor_id: Ext.SP_TOR_ID,
                                                                                                    });
                                                                                                }
                                                                                                row++;
                                                                                            }
                                                                                            if (jsonArr.length <= 0) {
                                                                                                msg += "<span style='white-space: nowrap;'>- กรุณาเลือกรายการ</span><br>";
                                                                                                console.log("testt");
                                                                                            }
                                                                                            if (msg == "") {
                                                                                                // Ext.getCmp("win-frm-perid-bal-dtlID").getEl().mask("Please wait...", "x-mask-loading");
                                                                                                Ext.Ajax.request({
                                                                                                    url: "tor/api/mnTorController.php",
                                                                                                    method: "POST",
                                                                                                    params: {
                                                                                                        mode: "UP_SP_TOR_VICTORY",
                                                                                                        data: JSON.stringify(jsonArr),
                                                                                                    },
                                                                                                    success: function (result, request) {
                                                                                                        // Ext.getCmp("win-frm-perid-bal-dtlID").getEl().unmask();
                                                                                                        let json = Ext.util.JSON.decode(result.responseText);
                                                                                                        Ext.Msg.alert("แจ้งเตือน", json.msg);
                                                                                                        Ext.bidder_select.setBaseParam("sp_tor_id", Ext.SP_TOR_ID);
                                                                                                        Ext.bidder_select.setBaseParam("dc_creditor_id", Ext.getCmp("all_bidderID").getValue());
                                                                                                        Ext.bidder_select.load({
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

                                                                                            // msg = "";
                                                                                            // if (Ext.getCmp("dc_creditor_idID").getValue() == "") {
                                                                                            //   msg += "<span style='white-space: nowrap;'>- กรุณาเลือกผู้เสนอราคา</span><br>";
                                                                                            // } else {
                                                                                            //   var Row = 0;
                                                                                            //   var RowMax = Ext.store2.data.length - 1;
                                                                                            //   var RowCreditor = Ext.store2.data.items;
                                                                                            //   var NewCreditor = Ext.getCmp("dc_creditor_idID").getValue();
                                                                                            //   while (RowMax > Row) {
                                                                                            //     if (RowCreditor[Row].data.dc_creditor_id == NewCreditor) {
                                                                                            //       msg += "<span style='white-space: nowrap;'>- มีผู้เสนอราคารายนี้แล้ว</span><br>";
                                                                                            //     }
                                                                                            //     Row++;
                                                                                            //   }
                                                                                            // }
                                                                                            // if (msg == "") {
                                                                                            //   var formSubmit = function () {
                                                                                            //     form.submit({
                                                                                            //       waitMsg: "Saving Data...",
                                                                                            //       success: function (form, action) {
                                                                                            //         Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                                                                            //           Ext.getCmp("gridSub1ID").getStore().reload();
                                                                                            //           // Ext.selectRow = null;
                                                                                            //           Ext.getCmp("win-frm-contractID").destroy();
                                                                                            //         });
                                                                                            //       },
                                                                                            //       failure: function (form, action) {
                                                                                            //         switch (action.failureType) {
                                                                                            //           case Ext.form.Action.CLIENT_INVALID:
                                                                                            //             Ext.Msg.alert("Failure", "Form fields may not be submitted with invalid values");
                                                                                            //             break;
                                                                                            //           case Ext.form.Action.CONNECT_FAILURE:
                                                                                            //             Ext.Msg.alert("Failure", "พลข้อผิดพลาดในการเชื่อต่อเครือข่าย");
                                                                                            //             break;
                                                                                            //           case Ext.form.Action.SERVER_INVALID:
                                                                                            //             Ext.Msg.alert("Failure", action.result.msg);
                                                                                            //         }
                                                                                            //       },
                                                                                            //     });
                                                                                            //   }; //END
                                                                                            // } else {
                                                                                            //   Ext.Msg.alert("แจ้งเตือน", msg);
                                                                                            // }

                                                                                            // var form = Ext.getCmp("form-widgets").getForm();
                                                                                            // if (form.isValid()) {
                                                                                            //   if (Ext.getCmp("modesubID").getValue().inputValue === "VIEW") {
                                                                                            //   } else if (Ext.getCmp("modesubID").getValue().inputValue === "DELETE") {
                                                                                            //     Ext.MessageBox.show({
                                                                                            //       title: "Icon Support",
                                                                                            //       msg: "คุณต้องการที่จะลบ รายการที่เลือกนี้ใช่ใหม ?",
                                                                                            //       buttons: Ext.MessageBox.OKCANCEL,
                                                                                            //       icon: Ext.MessageBox.WARNING,
                                                                                            //       fn: function (btn) {
                                                                                            //         if (btn === "ok") {
                                                                                            //           formSubmit(form);
                                                                                            //         } else {
                                                                                            //           return;
                                                                                            //         }
                                                                                            //       },
                                                                                            //     });
                                                                                            //   } else {
                                                                                            //     if (msg == "") {
                                                                                            //       formSubmit(form);
                                                                                            //     }
                                                                                            //   }
                                                                                            // }
                                                                                        },
                                                                                    },
                                                                                    {
                                                                                        text: "ย้อนกลับ",
                                                                                        handler: function () {
                                                                                            Ext.getCmp("win-frm-contractID").destroy();
                                                                                            Ext.getCmp("winMain").destroy();
                                                                                        },
                                                                                    },
                                                                                ],
                                                                            });
                                                                            win.show();
                                                                        }
                                                                    },
                                                                });
                                                            } else {
                                                                Ext.Msg.alert("แจ้งเตือน", msg);
                                                            }
                                                            // search();
                                                        },
                                                    },
                                                ],
                                            },
                                        ],
                                        // buttonAlign: "left",
                                    },
                                ],
                                listeners: {
                                    beforerender: function () { 
                                        function TabNext(rec, event) {
                                            if (event == "view") {
                                                Ext.getCmp("winChequeID").setActiveTab(1);
                                                Ext.getCmp("tabpanelMain2ID").setTitle(rec.data.c_name);
                                                Ext.getCmp("winChequeID").unhideTabStripItem(1);
                                            }

                                        }
                                        this.thisCick = function (grid, rowIndex, columnIndex, e) {
                                            var record = grid.getStore().getAt(rowIndex);
                                            Ext.saveDtlID = false;
                                            Ext.SelectStore = Ext.store2.getAt(rowIndex);
                                            if (columnIndex === grid.getColumnModel().getIndexById("detailBidder")) {
                                                Ext.SP_TOR_ID = Ext.SelectStore.data.sp_tor_id;
                                                Ext.SP_TOR_DTL_ID = Ext.SelectStore.data.sp_tor_dtl_id;
                                                Ext.DC_CREDITOR_ID = Ext.SelectStore.data.dc_creditor_id;

                                                Ext.store3.setBaseParam("sp_tor_id", Ext.SP_TOR_ID);
                                                Ext.store3.setBaseParam("sp_tor_dtl_id", Ext.SP_TOR_DTL_ID);
                                                Ext.store3.setBaseParam("dc_creditor_id", Ext.DC_CREDITOR_ID);
                                                Ext.store3.load({
                                                    callback: function (recordx, operation, success) {
                                                        if (success) {
                                                            var sto = recordx;
                                                            sto.forEach(function (v) {
                                                                if (v.get('CheckColumn') === true) {
                                                                    Ext.saveDtlID = true;
                                                                }


                                                            });

                                                            TabNext(record, "view"); //on

                                                        }
                                                    }
                                                });


//                                                    Ext.getCmp('saveDtlID').setDisabed(true);
                                            }
                                        };
                                    },
                                    afterrender: function () {
                                        Ext.getCmp("gridSub1ID").on("cellclick", this.thisCick, this); 
                                    },
                                },
                                columns: colPOP,
                            }]
                                    },
                                ],
                            },
                           
                        ]
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
                                disableSelection: true,
                                store: Ext.store3,
                                viewConfig: {
                                    forceFit: true,
                                    emptyText: "ไม่มีข้อมูล..",
                                    deferEmptyText: false,
                                    getRowClass: function (record) {
                                        if (record.data.CheckColumn == true && record.data.sp_tor_bidder_dtl_id != null) {
                                            return "td-succeed ";
                                        }
                                        if (record.data.CheckColumn == true && record.data.sp_tor_bidder_dtl_id == null) {
                                            return "td-wait ";
                                        }
                                    },
                                },
                                listeners: {
                                    beforerender: function () {
                                        this.thisCick = function (grid, rowIndex, columnIndex, e) {
                                            var record = grid.getStore().getAt(rowIndex);
                                            if (columnIndex === grid.getColumnModel().getIndexById("cancel_victory")) {
                                                if (record.data.CheckColumn == true) {
                                                    cancel_victory(record.data.sp_tor_bidder_dtl_id);
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
                                    {header: "ID System", hidden: true, dataIndex: "dc_creditor_id"},
                                    {
                                        header: "-",
                                        sortable: false,
                                        align: "center",
                                        dataIndex: "CheckColumn",
                                        width: 40,
                                        renderer: function (value, metaData, record, row, col, store, gridView) {
                                            // metaData.style="background-color:#ffaaaa !important;";
                                            // metaData.attr = 'style="background-color:#FFE0D2 !important;"';
                                            // metaData.style = "background:#FFE0D2;";
                                            var checked = value ? "checked" : "";
                                            var readonly = record.data.i_is_victory == 1 ? "disabled" : "";
                                            return "<input style='margin-top:3px; margin-bottom:2px;' type='checkbox' onchange='checkID(" + row + ")' id='chk_" + row + "' value='" + value + "' " + checked + " " + readonly + "> ";
                                        },
                                    },
                                    {
                                        header: "ชื่อผู้เสนอ",
                                        sortable: false,
                                        dataIndex: "dc_creditor_name",
                                        width: 200,
                                    },
                                    {
                                        header: "ราคาเสนอ (ต่อหน่วย)",
                                        sortable: false,
                                        dataIndex: "f_bid_unit_price",
                                        align: "right",
                                        width: 114,
                                    },
                                    {
                                        header: "จำนวนเสนอ",
                                        sortable: false,
                                        dataIndex: "i_bid_qty",
                                        align: "center",
                                        width: 114,
                                    },
                                    {
                                        header: "ราคาเสนอ (รวม)",
                                        dataIndex: "f_bid_total_price",
                                        sortable: false,
                                        align: "right",
                                        width: 114,
                                    },
                                    {
                                        header: "จำนวน",
                                        sortable: false,
                                        align: "center",
                                        dataIndex: "i_qty",
                                        width: 70,
                                    },
                                    {
                                        header: "ราคาต่อหน่วย",
                                        sortable: false,
                                        align: "right",
                                        dataIndex: "f_unit_price",
                                        width: 120,
                                    },
                                    {
                                        header: "ราคาทั้งหมด",
                                        sortable: false,
                                        align: "right",
                                        dataIndex: "f_total_price",
                                        width: 120,
                                    },
                                    {
                                        header: "หน่วยนับ",
                                        sortable: false,
                                        align: "center",
                                        dataIndex: "dc_unit_type_name",
                                        width: 120,
                                    },
                                    {
                                        id: "cancel_victory",
                                        header: "ยกเลิก",
                                        sortable: false,
                                        align: "center",
                                        width: 40,
                                        dataIndex: "id",
                                        renderer: function (value, metaData, record, row, col, store, gridView) {
                                            if (record.data.CheckColumn == true) {
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
                                id: "saveDtlID",
                                //disabled: Ext.saveDtlID===false ? true : false,
                                iconCls: "icon-save",
                                listeners: {
                                    afterrender: function () {
//                                            alert(Ext.saveDtlID+' >>>> '+1);
                                        this.setDisabled(Ext.saveDtlID === true ? true : false);
                                    }
                                },
                                handler: function () { 
                                    saveDtl("SAVE_DTL");
                                },
                            },
                            "->",
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
                                text: "บันทึกรายการ...",
                                id: "buSaveSubID",
                                iconCls: "icon-save",
                                handler: function () {
                                    console.log(Ext.store2.sum("i_is_victory"));
                                    var msg = "";
                                    if (Ext.store2.sum("i_is_victory") != Ext.store2.data.length) {
                                        msg += "<span style='white-space: nowrap;'>- กรุณาเลือกผู้ชนะให้ครบ</span><br>";
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
                                    Ext.getCmp("winMain").destroy();
                                },
                            },
                        ] 
            },
        ], listeners: {
            afterrender: function () {
                Ext.getCmp('tabpanel1').getEl().unmask();Ext.application.setHideName('buDarf',Ext.selectRow.get('i_is_register')?1:0); Ext.application.afterRender(this);
            }
        }
    });
};
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
                                                                                    Ext.selectRow = null;
                                                                                    Ext.i_is_more = 0;
                                                                                    var winApp = AppPoStore(statusx);
                                                                                    winApp.show();
                                                                                } else if (statusx === "edit") {
                                                                                    Ext.SP_TOR_ID = Ext.selectRow.data.id;
                                                                                    Ext.store2.setBaseParam("sp_tor_id", Ext.SP_TOR_ID);
                                                                                    Ext.store2.load();
                                                                                    Ext.all_bidder.setBaseParam("sp_tor_id", Ext.SP_TOR_ID);
                                                                                    Ext.all_bidder.load();

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