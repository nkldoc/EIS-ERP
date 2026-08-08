Ext.poFormID = "win-frm-xxx001";

Ext.fnMonthly = function () {
    if (Ext.getCmp("sp_tor_contract_id").getValue() > 0) {
        Ext.dc_expense_budget_in_tor = new Ext.data.JsonStore({
            storeId: "myStore1",
            // autoLoad: true,
            url: "tor/api/mnGlController.php",
            root: "data",
            baseParams: {
                mode: "DC_EXPENSE_BUDGET_IN_TOR",
                sp_tor_id: Ext.HDR_ID,
                sp_tor_contract_id: Ext.SelectStore.data.sp_tor_contract_id,
            }, //Permission i_read
            idProperty: "id",
            totalProperty: "totalCount",
            fields: ["id", "c_name", "f_total"],
        });

        //--------------------------------------------------------------------------
        Ext.dc_expense_id = new Ext.data.JsonStore({
            storeId: "myStore1",
            // autoLoad: true,
            url: "tor/api/mnGlController.php",
            root: "data",
            baseParams: {
                mode: "DC_EXPENSE_BUDGET_IN_TOR_GL",
                sp_tor_id: Ext.HDR_ID,
                sp_tor_contract_id: Ext.SelectStore.data.sp_tor_contract_id,
            }, //Permission i_read
            idProperty: "id",
            totalProperty: "totalCount",
            fields: ["id", "c_name", "f_total", "gl_sp_bg_hdr_id"],
        });
        Ext.sp_gl_monthly_hdr = new Ext.data.JsonStore({
            storeId: "myStore1",
            // autoLoad: true,
            url: "tor/api/mnGlController.php",
            root: "data",
            baseParams: {
                mode: "SP_GL_MONTHLY_HDR",
                sp_tor_id: Ext.HDR_ID,
                sp_tor_contract_id: Ext.SelectStore.data.sp_tor_contract_id,
            }, //Permission i_read
            idProperty: "id",
            totalProperty: "totalCount",
            fields: ["sp_gl_monthly_hdr_id", "i_month_total", "f_total", "d_doc_date", "dc_acc_id", "c_dc_acc", "dc_cost_id", "c_comment"],
        });
        Ext.NMU_gl_sp_hdr = new Ext.data.JsonStore({
            storeId: "myStoreGlSpHdr",
            autoLoad: true,
            url: "../sp/api/All_DcExpense.php",
            root: "data",
            baseParams: {type: "GlSpHdr", po_expense_id: Ext.SelectStore.data.po_expense_id}, //Permission i_read
            idProperty: "id",
            totalProperty: "totalCount",
            fields: ["id", "c_name", "bg_expense_id", "gl_sp_bg_hdr_id"],
        });
        Ext.sp_gl_monthly_dtl = new Ext.data.JsonStore({
            // autoLoad: true,
            url: "tor/api/mnGlController.php",
            root: "data",
            baseParams: {
                mode: "LIST_SP_GL_MONTHLY_DTL",
                sp_gl_monthly_hdr_id: 0,
            }, //Permission i_read
            idProperty: "id",
            totalProperty: "totalCount",
            fields: [
                "sp_gl_monthly_hdr_id",
                "sp_gl_monthly_dtl_id",
                "i_month",
                "dc_expense_budget_type_id",
                "dc_acc_id",
                "f_month_total",
                "d_doc_date",
                "c_comment",
                "po_expense_id",
                "gl_sp_bg_hdr_id",
                "gl_sp_bg_hdr_id"
            ],
        });
        Ext.dc_expense_budget_in_tor.reload({
            callback: function (recordx, operation, success) {
                if (success) {
                    Ext.sp_gl_monthly_hdr.reload({
                        callback: function (recordx, operation, success) {
                            if (success) {
                                if (Ext.sp_gl_monthly_hdr.data.length > 0) {
                                    Ext.sp_gl_monthly_dtl.reload({
                                        params: {
                                            mode: "LIST_SP_GL_MONTHLY_DTL",
                                            sp_gl_monthly_hdr_id: Ext.sp_gl_monthly_hdr.data.items[0].data.sp_gl_monthly_hdr_id,
                                        },
                                        callback: function (recordx, operation, success) {
                                            if (success) {
                                                Ext.getCmp("sp_gl_monthly_hdr_id").setValue(Ext.sp_gl_monthly_hdr.data.items[0].data.sp_gl_monthly_hdr_id);
                                                Ext.getCmp("i_month_total").setValue(Ext.sp_gl_monthly_hdr.data.items[0].data.i_month_total);
                                                Ext.getCmp("d_date_monthly_hdr").setValue(Ext.sp_gl_monthly_hdr.data.items[0].data.d_doc_date);
                                                Ext.getCmp("text_dc_expense_budget").update(text_dc_expense_budget());
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
            baseParams: {
                type: "storeAccExpense",
            }, //Permission i_read
            idProperty: "id",
            totalProperty: "totalCount",
            fields: ["id", "c_code", "c_name"],
        });
        Ext.NMU_dc_acc = new Ext.data.JsonStore({
            storeId: "myStore1",
            autoLoad: true,
            url: "../sp/api/All_DcExpense.php",
            root: "data",
            baseParams: {type: "GlSpHdr",
                po_expense_id: Ext.SelectStore.data.po_expense_id}, //Permission i_read
            idProperty: "id",
            totalProperty: "totalCount",
            fields: ["id", "c_name", "bg_expense_id", "gl_sp_bg_hdr_id"],
        });
        Ext.po_expense_in_tor = new Ext.data.JsonStore({
            storeId: "myStore1",
            autoLoad: true,
            url: "tor/api/mnTorController.php",
            root: "data",
            baseParams: {mode: "DC_EXPENSE_IN_TOR", sp_tor_id: Ext.HDR_ID, sp_tor_contract_id: Ext.SelectStore.data.sp_tor_contract_id}, //Permission i_read
            idProperty: "id",
            totalProperty: "totalCount",
            fields: ["id", "c_name", "f_total"],
        });
        Ext.dc_expense_id = new Ext.data.JsonStore({
            storeId: "myStore1",
            autoLoad: true,
            url: "../sp/api/All_DcExpense.php",
            root: "data",
            baseParams: {type: "dc_expense_id"}, //Permission i_read
            idProperty: "id",
            totalProperty: "totalCount",
            fields: ["id", "c_name"],
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
        ]);

        Ext.dc_expense_id.reload({
            callback: function (recordx, operation, success) {
                if (success) {
                    //
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
                        listeners: {
                            close: function () {
                                Ext.getCmp("win-frm-contractID").destroy();
                                Ext.getCmp(Ext.poFormID).destroy();
                                Ext.storeDtl.reload();
                            },
                        },
                        layout: {
                            type: "vbox",
                            align: "stretch",
                        },
                        defaults: {
                            xtype: "panel",
                            flex: 1,
                        },
                        items: [
                            {
                                xtype: "form",
                                id: "form-widgetsDtl",
                                url: "tor/api/mnMonthly.php",
                                frame: true,
                                labelWidth: 200,
                                bodyStyle: {
                                    padding: "10px 20px",
                                },
                                defaults: {
                                    // anchor: "100%",
                                    msgTarget: "side",
                                },
                                items: [
                                    {
                                        xtype: "hidden",
                                        id: "sp_gl_monthly_hdr_id",
                                    },
                                    {
                                        xtype: "hidden",
                                        name: "mode",
                                        value: "ADDROW",
                                    },
                                    {
                                        fieldLabel: "จำนวนเดือนที่เกิดค่าใช้จ่าย ",
                                        id: "i_month_total",
                                        emptyText: "กรุณากรอกจำนวนเตือน",
                                        xtype: "textfield",
                                        anchor: "35%",
                                        style: "text-align: center",
                                    },
                                    {
                                        xtype: "hidden",
                                        name: "c_date",
                                        id: "c_dateID",
                                    },
                                    {
                                        fieldLabel: "วันที่บันทึก ",
                                        id: "d_date_monthly_hdr",
                                        xtype: "datefield",
                                        anchor: "35%",
                                        liesteners: {
                                            blur: function () {
                                                alert(this.getValue());
                                                Ext.getCmp("c_dateID").setValue(this.getValue());
                                            },
                                        },
                                        validator: function (val) {
                                            if (!Ext.isEmpty(val)) {
                                                return true;
                                            } else {
                                                return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                            }
                                        },
                                    },

                                    new Ext.form.ComboBox({
                                        mode: "local",
                                        // id: "dc_expense_budget_in_tor",
                                        store: Ext.dc_expense_budget_in_tor,
                                        valueField: "id",
                                        name: "dc_expense_budget_in_tor",
                                        hiddenName: "dc_expense_budget_in_tor",
                                        displayField: "c_name",
                                        triggerAction: "all",
                                        width: 500,
                                        fieldLabel: "แหล่งเงิน",
                                        forceSelection: true,
                                        selectOnFocus: true,
                                        // anchor: "35%",
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
                                    new Ext.form.ComboBox({
                                        mode: "local",
                                        // id: "editor_dc_expense_id",
                                        name: "po_expense_id",
                                        hiddenName: "po_expense_id",
                                        store: Ext.po_expense_in_tor,
                                        valueField: "id",
                                        fieldLabel: "รายการย่อย",
                                        displayField: "c_name",
                                        triggerAction: "all",
                                        forceSelection: true,
                                        width: 500,
                                        selectOnFocus: true,
                                        typeAhead: false,
                                        emptyText: "กรุณาเลือก...",
                                        listeners: {
                                            afterrender: function () {
                                                this.fn = function () {};
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
                                    new Ext.form.ComboBox({
                                        mode: "local",
                                        // id: "editor_gl_sp_bg_hdr_id",
                                        store: Ext.NMU_gl_sp_hdr,
                                        valueField: "id",
                                        name: "gl_sp_bg_hdr_id",
                                        hiddenName: "gl_sp_bg_hdr_id",
                                        displayField: "c_name",
                                        triggerAction: "all",
                                        fieldLabel: "จับคู่รายการจากระบบจัดซื้อ&พัสดุกับระบบปัญชีฯ",
                                        forceSelection: true,
                                        selectOnFocus: true,
                                        width: 500,
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
                                    {
                                        xtype: "hidden",
                                        name: "gl_sp_dc_hdr_id",
                                        id: "gl_sp_dc_hdr_idID",
                                        // store:  'gl_sp_dc_hdr_id',
                                        store: Ext.NMU_gl_sp_hdr,
                                        valueField: "gl_sp_dc_hdr_id",
                                        hiddenName: "gl_sp_dc_hdr_id",
                                        listeners: {
                                            afterrender: function () {
                                                this.fn = function () {};
                                            },
                                            Change: function () {
                                                this.fn();
                                            },
                                        },
                                    },
                                    {
                                        xtype: "hidden",
                                        id: "sp_tor_idID",
                                        name: "sp_tor_id",
                                        value: Ext.HDR_ID,
                                    },
                                    {
                                        xtype: "hidden",
                                        id: "sp_tor_contract_idID",
                                        name: "sp_tor_contract_id",
                                        value: Ext.SelectStore.data.sp_tor_contract_id,
                                    },
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
                                width: "100%",
                                height: 450,
                                layout: "fit",
                                border: true,
                                stripeRows: true,
                                loadMask: true,
                                clicksToEdit: 1,
                                store: Ext.sp_gl_monthly_dtl,
                                // viewConfig: {
                                //   emptyText: "ไม่มีข้อมูล..",
                                //   deferEmptyText: false,
                                //   getRowClass: function (record, index, rowParams) {
                                //     if (record.data.i_extend_time == "ตั้งต้น") {
                                //       return "td-total padd-2";
                                //     }
                                //   },
                                // },
                                listeners: {
                                    afteredit: function () {
                                        Ext.getCmp("text_dc_expense_budget").update(text_dc_expense_budget());
                                    },
                                    beforerender: function () {
                                        this.thisCick = function (grid, rowIndex, columnIndex, e) {
                                            if (columnIndex === grid.getColumnModel().getIndexById("delete_dtl_monthly")) {
                                                Ext.sp_gl_monthly_dtl.removeAt(rowIndex);
                                            }
                                        };
                                    },
                                    afterrender: function () {
                                        Ext.getCmp("gridEditor_sp_gl_monthly").on("cellclick", this.thisCick, this);
                                    },
                                },
                                tbar: [
                                    {
                                        xtype: "button",
                                        iconCls: "icon-add",
                                        text: "เพิ่มรายการแบบชุดข้อมูล",
                                        handler: function () {
                                            var form = Ext.getCmp("form-widgetsDtl").getForm();
                                            form.submit({
                                                waitMsg: "Saving Data...",
                                                success: function (form, action) {
                                                    Ext.getCmp("contenterCenter").getEl().unmask();
                                                    Ext.getCmp("win-sp_gl_monthly").destroy();
                                                    Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                                        Ext.fnMonthly();
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
                                        },
                                    },
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
                                                po_expense: po_expense,
                                                po_expense_id: 0,
                                                //    dc_acc_id: Ext.getCmp("dc_acc_idID").getValue(),

                                                bg_budget_dtl_overlap_id: "",
                                                f_month_total: "0",
                                                d_date: "",
                                                c_comment: "",
                                            });
                                            Ext.sp_gl_monthly_dtl.insert(0, myNewRecord);
                                        },
                                    },
                                ],
                                columns: [
                                    {
                                        header: "งวด",
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
                                        header: "แหล่งเงิน1",
                                        sortable: false,
                                        align: "center",
                                        dataIndex: "dc_expense_budget_type_id",
                                        width: 250,
                                        editor: new Ext.form.ComboBox({
                                            mode: "local",
                                            id: "dc_expense_budget_type_idID",
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
                                            id: "editor_dc_acc_id",
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
                                                                let row_record = Ext.sp_gl_monthly_dtl.getAt(Ext.getCmp("editor_dc_acc_id").gridEditor.row);
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
                                        hidden: true,
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
                                            id: "editor_gl_sp_bg_hdr_id",
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
                                            Ext.NMU_gl_sp_hdr.setBaseParam("bg_expense_id", record.get("id"));
                                            let row_record = Ext.sp_gl_monthly_dtl.getAt(Ext.getCmp("editor_gl_sp_bg_hdr_id").gridEditor);
                                            var ss = Ext.NMU_gl_sp_hdr.findExact("bg_expense_id", record.data.id);
                                            if (ss >= 0) {
                                                var value = Ext.NMU_gl_sp_hdr.data.items[ss].data.id;
                                                row_record.set("gl_sp_bg_hdr_id", value);
                                            }

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
                                        id: "delete_dtl_monthly",
                                        header: "ลบ",
                                        sortable: false,
                                        align: "center",
                                        width: 30,
                                        dataIndex: "id",
                                        renderer: function (value, metaData, record, row, col, store, gridView) {
                                            // if (record.data.sp_tor_dtl_id < 1 ?? 0 == 0)
                                            return '<img src="../images/icons/table_delete.png"); style="cursor:pointer"/>';
                                        },
                                    },
                                    {
                                        width: 20,
                                        dataIndex: "",
                                    },
                                ],
                                bbar: [
                                    {
                                        text: "&nbsp;บันทึกการตั้งหนี้ค่าใช้จ่าย&nbsp;",
                                        id: "saveExtendTime",
                                        iconCls: "icon-save",
                                        handler: function () {
                                            // alert("รอการทำการบันทึก");
                                            let msg = "";
                                            let jsonArr = [];
                                            let Arr_month_group = [];
                                            let sto = Ext.sp_gl_monthly_dtl.data.items;
                                            let msg_show = 0;
                                            sto.forEach(function (v) {
                                                // console.log(v.data.gl_sp_bg_hdr_id)
                                                console.log(v);

                                                jsonArr.push({
                                                    sp_gl_monthly_dtl_id: v.data.sp_gl_monthly_dtl_id,
                                                    i_month: v.data.i_month,
                                                    dc_expense_budget_type_id: v.data.dc_expense_budget_type_id,
                                                    dc_expense_id: v.data.dc_expense_id,
                                                    po_expense_id: v.data.po_expense_id,
                                                    dc_acc_id: v.data.gl_sp_bg_hdr_id,
                                                    // dc_acc_id:Ext.getCmp("editor_dc_acc_id").getValue(),
                                                    dc_creditor_id: Ext.getCmp("dc_creditor_idID").getValue(),
                                                    f_month_total: v.data.f_month_total ? v.data.f_month_total.replace(/,/g, "") : "",
                                                    d_date: Ext.util.Format.gridDate(v.data.d_doc_date, "Y-m-d"),
                                                    c_comment: v.data.c_comment,
                                                });
                                                if (Arr_month_group.find((e) => e == v.data.i_month) == undefined) {
                                                    Arr_month_group.push(v.data.i_month);
                                                }
                                                if (v.data.i_month == "" || v.data.i_month == null || isNaN(v.data.i_month) == true) {
                                                    msg_show = 1;
                                                }
                                                if (v.data.dc_expense_budget_type_id == "" || v.data.dc_expense_budget_type_id == null) {
                                                    msg_show = 1;
                                                }
                                                /* if (v.data.po_expense_id == "" || v.data.dc_acc_id == null) {
                                                 msg_show = 1;*/
                                                if (v.data.dc_acc_id == "" || v.data.dc_acc_id == null) {
                                                    msg_show = 1;
                                                }
                                                if (v.data.d_doc_date == "" || v.data.d_doc_date == null) {
                                                    msg_show = 1;
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
                                            /* if (msg_show == 1) {
                                             msg += "<span style='white-space: nowrap;'>- กรุณากรอกรายระเอียด</span><br>";
                                             }*/
                                            if (Ext.getCmp("i_month_total").getValue() == "") {
                                                msg += "<span style='white-space: nowrap;'>- กรุณากรอกจำนวนเดือน</span><br>";
                                            }
                                            if (isNaN(Ext.getCmp("i_month_total").getValue())) {
                                                msg += "<span style='white-space: nowrap;'>- กรุณาจำนวนเดือนเป็นตัวเลข</span><br>";
                                            }
                                            //  -------------------------------------------------------------------------ผังบัญชี
                                            /*   if (Ext.getCmp("dc_acc_idID").getValue() <= 0) {    
                                             //  msg += "<span style='white-space: nowrap;'>- กรุณากรอกผังบัญชี</span><br>";
                                             }*/
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
                                                        mode: "UP_SP_GL_MONTHLY_SIG",
                                                        sp_tor_id: Ext.HDR_ID,
                                                        sp_tor_contract_id: Ext.SelectStore.data.sp_tor_contract_id,
                                                        c_doc_ref: Ext.SelectStore.data.c_doc_ref,
                                                        sp_gl_monthly_hdr_id: Ext.getCmp("sp_gl_monthly_hdr_id").getValue(),
                                                        i_month_total: Ext.getCmp("i_month_total").getValue(),
                                                        d_date_monthly_hdr: Ext.util.Format.date(Ext.getCmp("d_date_monthly_hdr").getValue(), "Y-m-d"),
                                                        editor_dc_acc_id: Ext.getCmp("editor_gl_sp_bg_hdr_id").getValue(),
                                                        i_is_period: Ext.SelectStore.data.i_is_period,
                                                        //        po_expense_idID: Ext.getCmp("po_expense_idID").getValue(),
                                                        // dc_acc_idID: Ext.getCmp("dc_acc_idID").getValue(),  ผังบัญชี --ฝั่งบัญชี
                                                        dc_cost_id: Ext.selectRow.data.dc_cost_id,
                                                        f_total: Ext.getCmp("f_total_all_month").getValue() ? Ext.getCmp("f_total_all_month").getValue().replace(/,/g, "") : "",
                                                        data: JSON.stringify(jsonArr),
                                                    },
                                                    success: function (result, request) {
                                                        Ext.getCmp("contenterCenter").getEl().unmask();
                                                        let json = Ext.util.JSON.decode(result.responseText); //decode json
                                                        Ext.Msg.alert("แจ้งเตือน", json.msg);
                                                        Ext.getCmp("win-sp_gl_monthly").destroy();
                                                        if (json.success == true) {
                                                            Ext.Msg.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย");
                                                        }
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
                    //
                }
            },
        });
    } else {
        Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>กรุณาบันทึกสัญญาก่อนทำการกำหนดตั้งหนี้ค่าใช้จ่าย</span><br>");
    }
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

text_dc_expense_budget = function () {
    var dc_budget_NUM = Ext.dc_expense_budget_in_tor.data.length;
    var sum_f_total_dc_expense_budget_in_tor = 0;
    var text_dc_expense_budget = "<table width='100%' border='0' cellspacing='0' cellpadding='0'><thead valign='top'></thead>";
    var style = "";
    Ext.sum_minus = 0;

    for (table_loop = 1; dc_budget_NUM >= table_loop; table_loop++) {
        f_sum_monthly_hdr = 0;
        var dc_expense_budget_in_tor_id = Ext.dc_expense_budget_in_tor.data.items[table_loop - 1].data.id;
        var sum_expense_budget = 0;
        for (i_sum_loop = 1; Ext.sp_gl_monthly_dtl.data.length >= i_sum_loop; i_sum_loop++) {
            if (Ext.sp_gl_monthly_dtl.data.items[i_sum_loop - 1].data.dc_expense_budget_type_id == dc_expense_budget_in_tor_id) {
                var f_month_total = Ext.sp_gl_monthly_dtl.data.items[i_sum_loop - 1].data.f_month_total.replace(/,/g, "");
                sum_expense_budget = sum_expense_budget + parseFloat(f_month_total);
            }
            f_sum_monthly_hdr = f_sum_monthly_hdr + parseFloat(Ext.sp_gl_monthly_dtl.data.items[i_sum_loop - 1].data.f_month_total.replace(/,/g, ""));
        }
        sum_expense_budget = Number.parseFloat(sum_expense_budget).toFixed(2);
        dc_expense_budget_in_tor = Number.parseFloat(Ext.dc_expense_budget_in_tor.data.items[table_loop - 1].data.f_total).toFixed(2);
        var c_name_dc_expense_budget_in_tor = Ext.dc_expense_budget_in_tor.data.items[table_loop - 1].data.c_name;
        var f_total_dc_expense_budget_in_tor = dc_expense_budget_in_tor - sum_expense_budget;
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
    if (Number.parseFloat(f_sum_monthly_hdr).toFixed(2) == Ext.getCmp("f_totalID").getValue().replace(/,/g, "")) {
        Ext.get("f_sum_monthly_hdr").setStyle("color", "green");
        Ext.not_equal = 0;
    } else {
        Ext.get("f_sum_monthly_hdr").setStyle("color", "red");
        Ext.not_equal = 1;
    }
    return text_dc_expense_budget;
    // Ext.getCmp("text_dc_expense_budget").update(text_dc_expense_budget);
};
DeleteNoTor_dtl = function (record) {
    //    if (record.get('c_code') === null) {

    new Ext.Window({
        id: "win-msg-delete",
        title: "Remove",
        modal: true,
        width: 250,
        height: 130,
        html: "ท่านต้องการที่จะลบข้อมูล แถวที่ " + record.get("no") + " ?",
        buttons: [
            {
                text: "Confirm",
                handler: function () {
                    Ext.Ajax.request({
                        url: "tor/api/mnContractNoTor.php",
                        params: {
                            mode: "DELETE_NOTOR_DTL",
                            sp_tor_contract_id: record.get("sp_tor_contract_id"),
                            sp_tor_id: record.get("sp_tor_id"),
                        },
                        method: "GET", //POST
                        success: function (result, request) {
                            Ext.storeDtl.load({
                                params: {id: Ext.HDR_ID},
                                callback: function (records, operation, success) {
                                    Ext.getCmp("win-msg-delete").destroy();
                                    Ext.storeDtl.reload();
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
    //    }
};

GenCode_CTS = function () {
    var date_Ymd = Ext.util.Format.date(Ext.getCmp("d_contract_dateID").getValue(), "Ymd");
    var date_Ym = Ext.selectRow.get("i_yyyy") / 1 + 543; //date_Ymd.substr(0, 4) / 1 + 543;
    var date_dd = date_Ymd.substr(4);
    //console.log(Ext.selectRow);

    // return false;
    //return false;
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
                i_type_contract: Ext.getCmp("i_type_contractID").getValue().inputValue,
                i_is_inv: Ext.getCmp("i_is_invID").getValue().inputValue,

                ym_0: date_Ym,
                dd_0: date_dd,
                sp_typ_id_0: Ext.selectRow.data.tor_type_id,
                bg_type_id_0: Ext.selectRow.data.dc_expense_budget_type_id,
                contract_type_0: Ext.selectRow.data.i_type_fix_rate == 0 ? 1 : 2,
                //                contract_type_0: Ext.selectRow.data.i_is_period == 0 ? 1 : 2,
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
Ext.chkBg = false;
Ext.chkBg.status = false;
Ext.chkBgfn = function (st, f, f_bg, cancle) {
    Ext.chkBg = Ext.apply({status: st, f_amt: f, f_bg: f_bg});
    var cl = cancle || null;
    if (cl) {
        Ext.getCmp("disBgID").setValue(cl === true ? "เบิกได้ไม่ผ่าน" : "กรุณาตรวจสอบเงินตามงวด");
        Ext.getCmp("buSaveSubID").setText(cl === true ? "บันทึกรายการไม่ผ่าน" : "ตรวจสอบเงิน");
    } else {
        Ext.getCmp("disBgID").setValue(Ext.chkBg.status === true ? "เบิกได้" : "กรุณาตรวจสอบเงินตามงวด");
        Ext.getCmp("buSaveSubID").setText(Ext.chkBg.status === true ? "บันทึกรายการ" : "ตรวจสอบเงิน");
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
                            height:Ext.getBody().getViewSize().height,
                            widht:Ext.getBody().getViewSize().width,
                            plain: true,
                            layout: "fit",
                            maximizable: true,
                            constrainHeader: true,
                            closable: true,
                            listeners: {
                                afterrender: function (obj, eOpts) {
                                    this.fn = function (widht, height) {
                                        //percentage
                                        var width = Ext.getBody().getViewSize().width;
                                        var height = Ext.getBody().getViewSize().height;
                                        this.setSize(width, height);
                                    };
                                    this.fn(0.8, 0.85);
                                },
                                maximize: function (window, opts) {
                                    //when property minimizable
                                    window.setWidth(Ext.getBody().getViewSize().width);
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
function bgBagedType() {
    return new Ext.Window({
        id: "winDcExpTypeDddID",
        modal: true,
        width: 850,
        //                height: 430,
        title: "เพิ่มแหล่งเงินที่จัดจ้าง",
        layout: "form",
        items: new Ext.FormPanel({
            frame: true,
            labelWidth: 140,
            padding: "10px 10px 10px 10px",
            url: "tor/api/mnBgExpenseController.php",
            id: "formDcExpTypeDddID",
            items: [
                {
                    xtype: "hidden",
                    name: "tor_id",
                    id: "tor_id",
                    value: Ext.getCmp("torHdrID").getValue(),
                },
                new Ext.form.ComboBox({
                    mode: "local",
                    store: Ext.dc_expense_budget_type,
                    fieldLabel: "แหล่งเงินที่ 1",
                    anchor: "60%",
                    submitValue: true,
                    id: "dc_expense_budget_type_id1TxtID",
                    name: "dc_bg_budget_type_id",
                    hiddenName: "dc_expense_budget_type_id",
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือกแหล่งเงิน...",
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
                {
                    xtype: "textfield",
                    fieldLabel: "จำนวนเงินจากแหล่งเงิน",
                    name: "f_type_amt",
                    value: 20,
                    listeners: {
                        blur: function () {
                            this.fn(true);
                        },
                        afterrender: function () {
                            this.fn = function (t) {
                                //                                        console.log('dddddddddd');
                                //                                        console.log(Ext.getCmp('f_totalID').getValue());
                                var val = 0;
                                val = this.getValue();
                                this.setValue(Ext.floatRenderer(parseFloat(val.replace(/,/g, "") / 1)));
                            };
                            this.fn();
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
                new Ext.form.ComboBox({
                    mode: "local",
                    store: Ext.dc_expense_budget_type,
                    fieldLabel: "แหล่งเงินที่ 2",
                    anchor: "60%",
                    submitValue: true,
                    id: "dc_expense_budget_type2_idTxtID",
                    name: "dc_bg_budget_type2_id",
                    hiddenName: "dc_expense_budget_type2_id",
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือกแหล่งเงิน...",
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
                {
                    xtype: "textfield",
                    fieldLabel: "จำนวนเงินจากแหล่งเงิน 2",
                    name: "f_type2_amt",
                    id: "f_type2_amtID",
                    listeners: {
                        blur: function () {
                            this.fn();
                        },
                        afterrender: function () {
                            this.fn = function () {
                                var val = 0;
                                val = this.getValue();
                                this.setValue(Ext.floatRenderer(parseFloat(val.replace(/,/g, "") / 1)));
                            };
                            this.fn();
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
                new Ext.form.ComboBox({
                    mode: "local",
                    store: Ext.dc_expense_budget_type,
                    fieldLabel: "แหล่งเงิน 3",
                    anchor: "60%",
                    submitValue: true,
                    id: "dc_expense_budget_type3_idTxtID",
                    name: "dc_bg_budget_type3_id",
                    hiddenName: "dc_expense_budget_type3_id",
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือกแหล่งเงิน...",
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
                {
                    xtype: "textfield",
                    fieldLabel: "จำนวนเงินจากแหล่งเงิน 3",
                    name: "f_type3_amt",
                    id: "f_type3_amtID",
                    listeners: {
                        blur: function () {
                            this.fn();
                        },
                        afterrender: function () {
                            this.fn = function () {
                                var val = 0;
                                val = this.getValue();
                                this.setValue(Ext.floatRenderer(parseFloat(val.replace(/,/g, "") / 1)));
                            };
                            this.fn();
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
                new Ext.form.ComboBox({
                    mode: "local",
                    store: Ext.dc_expense_budget_type,
                    fieldLabel: "แหล่งเงิน 4",
                    anchor: "60%",
                    submitValue: true,
                    id: "dc_expense_budget_type4_idTxtID",
                    name: "dc_bg_budget_type4_id",
                    hiddenName: "dc_expense_budget_type4_id",
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือกแหล่งเงิน...",
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
                {
                    xtype: "textfield",
                    fieldLabel: "จำนวนเงินจากแหล่งเงิน 4",
                    name: "f_type4_amt",
                    id: "f_type4_amtID",
                    listeners: {
                        blur: function () {
                            this.fn();
                        },
                        afterrender: function () {
                            this.fn = function () {
                                var val = 0;
                                val = this.getValue();
                                this.setValue(Ext.floatRenderer(parseFloat(val.replace(/,/g, "") / 1)));
                            };
                            this.fn();
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
                new Ext.form.ComboBox({
                    mode: "local",
                    store: Ext.dc_expense_budget_type,
                    fieldLabel: "แหล่งเงิน 5",
                    anchor: "60%",
                    submitValue: true,
                    id: "dc_expense_budget_type5_idTxtID",
                    name: "dc_bg_budget_type5_id",
                    hiddenName: "dc_expense_budget_type5_id",
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือกแหล่งเงิน...",
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
                {
                    xtype: "textfield",
                    fieldLabel: "จำนวนเงินจากแหล่งเงิน 5",
                    name: "f_type5_amt",
                    id: "f_type5_amtID",
                    listeners: {
                        blur: function () {
                            this.fn();
                        },
                        afterrender: function () {
                            this.fn = function () {
                                var val = 0;
                                val = this.getValue();
                                this.setValue(Ext.floatRenderer(parseFloat(val.replace(/,/g, "") / 1)));
                            };
                            this.fn();
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
            ],
            buttons: [
                {
                    text: "บันทึกแหล่งเงิน",
                    handler: function () {
                        var form = Ext.getCmp("formDcExpTypeDddID").getForm();
                        form.submit({
                            waitMsg: "Saving Data...",
                            success: function (form, action) {
                                Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                    Ext.getCmp("winDcExpTypeDddID").destroy();
                                    // Ext.getCmp("winChequeID").destroy();
                                    // Ext.getCmp("winMain").destroy();
                                    Ext.storeDtl.reload();
                                });
                            },
                            failure: function (form, action) {
                                switch (action.failureType) {
                                    case Ext.form.Action.CLIENT_INVALID:
                                        Ext.Msg.alert("Failure", "Form fields may not be submitted with invalid values");
                                        break;
                                    case Ext.form.Action.CONNECT_FAILURE:
                                        Ext.Msg.alert("Failure", "พบข้อผิดพลาดในการเชื่อต่อเครือข่าย");
                                        break;
                                    case Ext.form.Action.SERVER_INVALID:
                                        Ext.Msg.alert("Failure", action.result.msg);
                                }
                            },
                        });
                    },
                },
                {
                    text: "Cancel",
                    handler: function () {
                        Ext.getCmp("winDcExpTypeDddID").destroy();
                        //                                Ext.getCmp("winChequeID").destroy();
                        //                                Ext.getCmp("winMain").destroy();
                        Ext.storeDtl.reload();
                    },
                },
            ],
        }),
    });
}
Ext.store_po2 = new Ext.data.JsonStore({
    //autoLoad: true,
    storeId: "myStoreCont",
    url: "tor/api/mnTorController.php",
    baseParams: {mode: "List_Contract_Number"},
    root: "data",
    idProperty: "id",
    totalProperty: "totalCount",
    fields: [
        {name: "no"},
        {name: "sp_tor_contract_id"},
        {name: "tor_id"},
        {name: "txtsp_emp_idID"},
        {name: "c_name"},
        {name: "c_code"},
        {name: "dc_department_id"},
        {name: "f_total_amt"},
        {name: "name_creditor"},
        {name: "dc_creditor_id"},
        {name: "d_doc_date"},
    ],
});
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
    {header: "เลขที่สัญญา", sortable: true, dataIndex: "c_code"},
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
    {header: "ชื่อพนักงาน", sortable: true, dataIndex: "txtsp_emp_idID"},
    {header: "ชื่อพนักงาน", sortable: true, dataIndex: "f_total_amt"},
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
        // Ext.getCmp("d_start_dateID").setValue(record.data.d_doc_date);
        // Ext.getCmp("d_end_dateID").setValue(record.data.d_due_date);
        // var f_total = parseFloat(record.data.f_total_amt.replace(/,/g, "") / 1);
        // Ext.getCmp("f_total_amtID").setValue(Ext.floatRenderer(f_total));
        //      Ext.getCmp("i_type_contractID").setValue(Ext.selectRow.get("i_type_contract"));
        Ext.getCmp("win-pop-lov" + id).hide();
        Ext.getCmp("win-pop-lov" + id).destroy();
    },
});
var PopContForm2 = new Ext.Poplov_in({
    text: "เลือกสัญญา",
    id: "i_parentID",
    iconCls: "page_magnify",
    valueHidden: "i_parent_id",
    store: Ext.store_po2,
    headerGrid: columnMini2,
    widthText: 400,
    fieldLabel: "เลือกสัญญา",
    isCellClickGrid: true,
    cellClickGrid: function (grid, rowIndex, columnIndex, e) {
        var id = "i_parentID";
        var nameID = id + "_Name";
        var record = grid.getStore().getAt(rowIndex);
        var c_tax_number_imp = record.data.c_tax_number_imp == null ? "" : record.data.c_tax_number_imp;
        var TextShow = " : " + record.data.c_name;

        var id2 = "dc_creditor_idID";
        var nameID2 = id2 + "_Name";
        var TextShow2 = c_tax_number_imp + record.data.name_creditor;

        console.log(record.data);
        Ext.getCmp("codeCTS").setValue(record.data.c_code);
        Ext.getCmp("f_totalID").setValue(record.data.f_total_amt);
        Ext.getCmp("d_contract_dateID").setValue(record.data.d_doc_date);
        Ext.getCmp("dc_creditor_idID").setValue(record.data.dc_creditor_id);
        Ext.getCmp(nameID).setValue(TextShow);
        Ext.getCmp(nameID2).setValue(TextShow2);
        Ext.getCmp("i_contract_checkboxID").setValue(3);
        Ext.getCmp("sp_tor_id2ID").setValue(record.data.tor_id);
        Ext.getCmp("sp_tor_contract_id2ID").setValue(record.data.sp_tor_contract_id);
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
Ext.menuCode = "ST0010"; //go to
Ext.title = "" + Ext.menuCode;
//  Ext.AppConfig();
//  //interlizing
//  Ext.menuCode = "ST0009"; //go to
//  Ext.storeDtl.setBaseParam("type_menu", 2); //set สายงาน
//  //
//  Ext.status = Ext.runStatus(menu);
//  //Load
var AppPoStore = function (statuss) {
    var comboCost = new Ext.form.ComboBox({
        mode: "local",
        readOnly: true,
        store: Ext.dc_cost,
        anchor: "80%",
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
        anchor:"80%",
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
    var statusx = statuss; 
//    if (statusx == "add") {
//        Ext.getCmp("tabpanel1").getSelectionModel().clearSelections();
//    }

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
            {name: "d_doc_date", type: "string"},
            {name: "d_contract_date", type: "string"},
            {name: "d_due_date", type: "string"},
            {name: "d_start_date", type: "string"},
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
            {name: "d_doc_date", type: "string"},
            {name: "d_contract_date", type: "string"},
            {name: "d_due_date", type: "string"},
            {name: "c_doc_ref", type: "string"},
            {name: "dc_creditor_id"},
            {name: "f_total_amt", type: "string"},
            {name: "i_is_po"},
            {name: "i_is_warranty"},
            {name: "i_is_warranty_book"},
            {name: "i_is_inv"},
            {name: "book_no"},
            {name: "book_seq"},
            {name: "d_book_date"},
            {name: "f_warranty_amt"},
            {name: "c_remark"},
            {name: "i_is_period"},
            {name: "cashiercheque_on"},
            {name: "cashiercheque_seq"},
            {name: "d_cashiercheque_data"},
            {name: "f_warranty_cashiercheque"},
            {name: "c_remark_cashiercheque"},
            {name: "po_expense_id"},
            {name: "book_warranty_no"},
            {name: "d_book_warranty_date"},
            {name: "dc_bank_id"},
            {name: "dc_bank_idID_Name"},
            {name: "f_book_warranty_amt"},
            {name: "d_book_warranty_end"},
            {name: "c_remark1"},
            {name: "i_is_expense_monthly"},
            {name: "i_day"},
            {name: "i_enabled", type: "int"},
            {name: "dc_user_create_id"},
            {name: "dc_user_create_cost_id"},
            {name: "d_create"},
            {name: "dc_user_update_id"},
            {name: "dc_user_update_cost_id"},
            {name: "d_update"},
            {name: "i_is_join_venture"},
            {name: "d_start_date"}
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
 
    function d_doc_dateID_Change() {
        if (Ext.getCmp("d_contract_dateID").getValue() == "") {
            Ext.getCmp("d_due_dateID").setValue("");
            Ext.getCmp("txt_d_period_dateID").setValue("");
            Ext.getCmp("i_alertID").setValue("");
            Ext.getCmp("txt_i_alertID").setValue("");
            Ext.getCmp("i_dayID").setValue("");
            Ext.getCmp("txt_i_dayID").setValue("");
        } else {
            if (Ext.getCmp("d_due_dateID").getValue() != "") {
                if (Ext.getCmp("i_day_useID").getValue().inputValue == 1) {
                    d_period_dateID_change();
                } else {
                    i_dayID_Change();
                }
            }
        }
    }
    function i_dayID_Change() {
        if (Ext.getCmp("i_dayID").getValue() != "") {
            var Text_alert = "";
            if (Ext.getCmp("d_contract_dateID").getValue() == "") {
                Text_alert = "<font color='red'>* กรุณากรอก : วันที่ออกเอกสาร</font>";
            }
            if (Ext.getCmp("i_dayID").getValue() < 0) {
                Text_alert = "<font color='red'> * กรุณากรอก : จำนวนวัน ตั้งแต่ 0 ขึ้นไป</font>";
            }

            if (Text_alert == "") {
                var day = Ext.getCmp("i_dayID").getValue();
                var oneDay = 24 * 60 * 60 * 1000;
                var firstDate = new Date(Ext.util.Format.date(Ext.getCmp("d_contract_dateID").getValue(), "Y/m/d"));
                var date = new Date(firstDate.getTime() + oneDay * day);
                Ext.getCmp("d_due_dateID").setValue(new Date(firstDate.getTime() + oneDay * day));
                Ext.getCmp("txt_d_period_dateID").setValue("<font color='green'>จำนวน " + day + " วัน</font>");

                var FullDay = date.toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    weekday: "long",
                });
                Ext.getCmp("txt_i_dayID").setValue("<font color='green'>" + FullDay + "</font>");

            } else {
                Ext.getCmp("txt_i_dayID").setValue(Text_alert);
                Ext.getCmp("d_due_dateID").setValue("");
                Ext.getCmp("i_dayID").setValue(null);
                Ext.getCmp("i_alertID").setValue(null);
                Ext.getCmp("txt_i_alertID").setValue(null);
                Ext.getCmp("txt_d_period_dateID").setValue(null);
            }
        } else {
            Ext.getCmp("txt_i_dayID").setValue(null);
            Ext.getCmp("d_due_dateID").setValue("");
            Ext.getCmp("i_dayID").setValue(null);
            Ext.getCmp("i_alertID").setValue(null);
            Ext.getCmp("txt_i_alertID").setValue(null);
            Ext.getCmp("txt_d_period_dateID").setValue(null);
        }
    } 
    function d_period_dateID_change() {
        if (Ext.getCmp("d_due_dateID").getValue() != "") {
            var Text_alert = "";
            if (Ext.getCmp("d_contract_dateID").getValue() == "") {
                Text_alert = "<font color='red'>* กรุณากรอก : วันที่ออกเอกสาร</font>";
            } else {
                var oneDay = 24 * 60 * 60 * 1000;
                var firstDate = new Date(Ext.util.Format.date(Ext.getCmp("d_contract_dateID").getValue(), "Y/m/d"));
                var secondDate = new Date(Ext.util.Format.date(Ext.getCmp("d_due_dateID").getValue(), "Y/m/d"));
                var days = Math.round(Math.abs((firstDate - secondDate) / oneDay));
                if (firstDate.getTime() > secondDate.getTime()) {
                    console.log('pure4')
                    Text_alert = "<font color='red'>* กรุณากรอกวันที่ให้มากกว่าวันที่ออกเอกสาร</font>";
                }
            }

            if (Text_alert == "") {
                Ext.getCmp("i_dayID").setValue(days);
                Ext.getCmp("txt_d_period_dateID").setValue("<font color='green'>จำนวน " + days + " วัน</font>");

                var date = new Date(Ext.util.Format.date(Ext.getCmp("d_due_dateID").getValue(), "Y/m/d"));
                var FullDay = date.toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    weekday: "long",
                });
                Ext.getCmp("txt_i_dayID").setValue("<font color='green'>" + FullDay + "</font>");
                // if (Ext.getCmp("i_alertID").getValue() != "") {
                //     i_alertID_Change();
                // }
            } else {
                Ext.getCmp("txt_d_period_dateID").setValue(Text_alert);
                Ext.getCmp("d_due_dateID").setValue("");
                Ext.getCmp("txt_i_dayID").setValue(null);
                Ext.getCmp("i_dayID").setValue(null);
            }
        } else {
            Ext.getCmp("txt_d_period_dateID").setValue(null);
            Ext.getCmp("d_due_dateID").setValue("");
            Ext.getCmp("txt_i_dayID").setValue(null);
            Ext.getCmp("i_dayID").setValue(null);

        }
    } 
    var disp = false ? "displayfield" : "textfield";
    if (!Ext.isEmpty(Ext.getCmp("winChequeID"))) {
        Ext.getCmp("winChequeID").destroy();
    }


    Ext.menu_i_alarm = Ext.selectRow.get('i_alarm');
    Ext.menu_i_day = Ext.selectRow.get('i_day');
    return new Ext.Window({
        collapsible: true,
        maximizable: true,
        title: Ext.title,
        id: Ext.poFormID,
        width: Ext.getBody().getViewSize().width * 0.99,
        height: Ext.getBody().getViewSize().height * 0.99,
        layout: "fit",
        modal: true,
        plain: true, 
        items: [
            {
                xtype: "tabpanel",
                activeTab: 0,
                id: "winChequeID",
                border:false,
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
                        layout: "fit",
                        autoScroll: true,
                        labelAlign: "left",
                        bodyStyle: "padding:1px",
                        labelWidth: 150,
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
                                items: [//
                                    {
                                        columnWidth: 0.45,
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
                                                name: "i_yyyy",
                                                id: "i_yyyyID",
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
                                                readOnly: true,
                                                id: "c_nameID",
                                                fieldLabel: "เรื่อง PR",
                                                style: {
                                                    //                                                        color: "red",
                                                    width: "200px",
                                                },
                                                name: "c_name",
                                            },
                                            comboUsedBgYear, 
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

                                                    {
                                                        xtype: "displayfield",
                                                        fieldLabel: "สถานะการตรวจสอบ",
                                                        id: "disBgID",
                                                        value: "กรุณาตรวจสอบเงินตามงวด",
                                                    },
                                                ],
                                            },
                                            {
                                                xtype: "textfield",
                                                readOnly: true,
                                                fieldLabel: "รหัสเอกสารอ้างอิง",
                                                name: "d_doc_ref",
                                            },
                                            //-----------------------------------------------------------------------

                                            //-----------------------------------------------------------------------,
                                            {
                                                xtype: "radiogroup",
                                                columns: [98, 98, 98],
                                                fieldLabel: "การดำเนินงาน",
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
                                                        Ext.getCmp("i_type_fix_rateGb").fn();
                                                    },
                                                },
                                            },
                                            {
                                                xtype: "radiogroup",
                                                columns: [98, 98, 98],
                                                fieldLabel: "ประเภทสัญญา",
                                                id: "i_type_contractID",
                                                name: "i_type_contract",
                                                items: [
                                                    {
                                                        name: "i_type_contract",
                                                        id: "i_type_contract1",
                                                        inputValue: 1,
                                                        checked: true,
                                                        boxLabel: "สัญญา",
                                                    },
                                                    {
                                                        inputValue: 2,
                                                        name: "i_type_contract",
                                                        id: "i_type_contract2",
                                                        //       hidden: true,
                                                        boxLabel: "ใบสั่ง",
                                                    },
                                                    {
                                                        name: "i_type_contract",
                                                        id: "i_type_contract3",
                                                        inputValue: 3,
                                                        //           hidden: true,
                                                        boxLabel: "จะซื้อจะขาย",
                                                    },
                                                ], //radiogroup
                                            },
                                            {
                                                xtype: "radiogroup",
                                                columns: [98, 98, 98, 98],
                                                fieldLabel: "ของที่ได้มา",
                                                id: "i_product_typeID",
                                                name: "i_product_type",
                                                hidden: true,
                                                items: [
                                                    {
                                                        checked: true,
                                                        hidden: true,
                                                        name: "i_product_type",
                                                        id: "i_product_type0",
                                                        inputValue: 0,
                                                        boxLabel: "ไม่มีของ",
                                                    },
                                                    {
                                                        inputValue: 2,
                                                        name: "i_product_type",
                                                        id: "i_product_type2",
                                                        boxLabel: "ครุภัณฑ์",
                                                    },
                                                    {
                                                        checked: true,
                                                        name: "i_product_type",
                                                        inputValue: 1,
                                                        boxLabel: "วัสดุทั่วไป",
                                                        id: "i_product_type1",
                                                    },
                                                    {
                                                        inputValue: 3,
                                                        name: "i_product_type",
                                                        id: "i_product_type3",
                                                        boxLabel: "วัสดุการแพทย์",
                                                    },
                                                ], //radiogroup
                                                listeners: {
                                                    change: function () {
                                                        //  Ext.getCmp('i_is_invGID').fn(this.getValue().inputValue);
                                                    },
                                                    afterrender: function () {
                                                        this.fn = function (i) {
                                                            if (i == 3)
                                                                this.hide();
                                                            else
                                                                this.show();
                                                        };
                                                        this.fn(Ext.getCmp("i_purchaseID").getValue().inputValue);
                                                    },
                                                },
                                            },
                                            {
                                                xtype: "checkboxgroup",
                                                fieldLabel: "การจัดเก็บ",
                                                name: "i_is_inv",
                                                id: "i_is_invGID",
                                                columns: 1,
                                                items: [
                                                    {
                                                        id: "i_is_invID",
                                                        boxLabel: "เข้าคลัง",
                                                        name: "i_is_inv",
                                                        inputValue: 1,
                                                    },
                                                ],
                                                listeners: {
                                                    afterrender: function () {},
                                                },
                                            },
                                            {
                                                xtype: disp,
                                                fieldLabel: "รหัสเอกสารอ้างอิง",
                                                name: "d_doc_ref",
                                                id: "i_type_fix_rateGb",
                                                listeners: {
                                                    beforerender: function () {
                                                        this.fn = function () {
                                                            //i_type_contract
                                                            //
                                                            Ext.getCmp("i_ren_bgTypeID").fn();
                                                            if (Ext.getCmp("i_purchaseID").getValue().inputValue == 1) {
                                                                Ext.getCmp("i_type_contract2").show(); //
                                                                Ext.getCmp("i_type_contract3").show(); //
                                                                Ext.getCmp("i_product_typeID").show(); // ของที่ได้มา
                                                                Ext.getCmp("i_product_type2").setValue(true);
                                                                //                                                                    Ext.getCmp("i_is_periodID").setValue(true);

                                                                Ext.getCmp("i_is_invGID").show();
                                                                Ext.getCmp("i_product_type0").hide();
                                                            } else if (Ext.getCmp("i_purchaseID").getValue().inputValue == 2) {
                                                                Ext.getCmp("i_type_contract2").show();
                                                                Ext.getCmp("i_product_typeID").show(); // ของที่ได้มา
                                                                Ext.getCmp("i_product_type0").show();
                                                                Ext.getCmp("i_is_invGID").show();
                                                                Ext.getCmp("i_type_contract3").hide();
                                                            } else if (Ext.getCmp("i_purchaseID").getValue().inputValue == 3) {
                                                                Ext.getCmp("i_type_contract2").hide();
                                                                Ext.getCmp("i_type_contract3").hide();
                                                                Ext.getCmp("i_product_typeID").hide();
                                                                Ext.getCmp("i_is_invGID").hide();
                                                                Ext.getCmp("i_type_contract1").setValue(true);
                                                            }
                                                        };
                                                    },
                                                    afterrender: function () {
                                                        Ext.getCmp("i_type_fix_rateGb").fn();
                                                    },
                                                    change: function () {
                                                        Ext.getCmp("i_type_fix_rateGb").fn();
                                                    },
                                                },

                                            },
                                            {
                                                xtype: "radiogroup",
                                                columns: [98, 98, 98],
                                                fieldLabel: "การดำเนินงาน",
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
                                                        Ext.getCmp("i_type_fix_rateGb").fn();
                                                    },

                                                },
                                            },
                                            {
                                                xtype: "radiogroup",
                                                columns: [98, 98, 98],
                                                fieldLabel: "ประเภทสัญญา",
                                                id: "i_type_contractID",
                                                name: "i_type_contract",
                                                items: [
                                                    {
                                                        checked: true,
                                                        name: "i_type_contract",
                                                        id: "i_type_contract1",
                                                        inputValue: 1,
                                                        boxLabel: "สัญญา",
                                                    },
                                                    {
                                                        inputValue: 2,
                                                        name: "i_type_contract",
                                                        id: "i_type_contract2",
                                                        //  hidden: true,
                                                        boxLabel: "ใบสั่ง",
                                                    },
                                                    {
                                                        name: "i_type_contract",
                                                        id: "i_type_contract3",
                                                        inputValue: 3,
                                                        //      hidden: true,
                                                        boxLabel: "จะซื้อจะขาย",
                                                    },
                                                ], //radiogroup
                                            },
                                            {
                                                xtype: "radiogroup",
                                                columns: [98, 110],
                                                fieldLabel: "ลักษณะการจ้าง",
                                                id: "i_hire_typeID",
                                                name: "i_hire_type",
                                                hidden: true,
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
                                                listeners: {
                                                    change: function () {
                                                        //                                                             console.log(this.getValue().inputValue);
                                                        //                                                             if (this.getValue().inputValue == 0) {
                                                        //                                                                 Ext.getCmp('i_product_typeID').hide();
                                                        //                                                             } else {
                                                        //                                                                 Ext.getCmp('i_product_typeID').show();
                                                        //                                                             }
                                                    },
                                                    afterrender: function () {
                                                        this.fn = function (i) {
                                                            if (i == 2)
                                                                this.show();
                                                            else
                                                                this.hide();
                                                        };
                                                        this.fn(Ext.getCmp("i_purchaseID").getValue().inputValue);
                                                    },
                                                },
                                            },
                                            {
                                                xtype: "radiogroup",
                                                columns: [98, 98, 98, 98],
                                                fieldLabel: "ของที่ได้มา",
                                                id: "i_product_typeID",
                                                name: "i_product_type",
                                                hidden: true,
                                                items: [
                                                    {
                                                        checked: true,
                                                        hidden: true,
                                                        name: "i_product_type",
                                                        id: "i_product_type0",
                                                        inputValue: 0,
                                                        boxLabel: "ไม่มีของ",
                                                    },
                                                    {
                                                        checked: true,
                                                        name: "i_product_type",
                                                        inputValue: 1,
                                                        boxLabel: "วัสดุ",
                                                        id: "i_product_type1",
                                                    },
                                                    {
                                                        inputValue: 2,
                                                        name: "i_product_type",
                                                        id: "i_product_type2",
                                                        boxLabel: "ครุภันฑ์",
                                                    },
                                                    {
                                                        inputValue: 3,
                                                        name: "i_product_type",
                                                        id: "i_product_type3",
                                                        boxLabel: "วัสดุการแพทย์",
                                                    },
                                                ], //radiogroup
                                                listeners: {
                                                    change: function () {
                                                        //  Ext.getCmp('i_is_invGID').fn(this.getValue().inputValue);
                                                    },
                                                    afterrender: function () {
                                                        this.fn = function (i) {
                                                            if (i == 3)
                                                                this.hide();
                                                            else
                                                                this.show();
                                                        };
                                                        this.fn(Ext.getCmp("i_purchaseID").getValue().inputValue);
                                                    },
                                                },
                                            },

                                            {
                                                xtype: "checkboxgroup",
                                                fieldLabel: "การจัดเก็บ",
                                                name: "i_is_inv",
                                                id: "i_is_invGID",
                                                columns: 1,
                                                items: [
                                                    {
                                                        id: "i_is_invID",
                                                        boxLabel: "เข้าคลัง",
                                                        name: "i_is_inv",
                                                        inputValue: 1,
                                                    },
                                                            // {id: 'cbxDescription', boxLabel: 'Description', name: 'mycbxgrp', inputValue: 2}
                                                ],
                                                listeners: {
                                                    afterrender: function () {
                                                        // this.fn = function (i) {
                                                        //   if (i != 1) this.hide();
                                                        //   else this.show();
                                                        // };
                                                        // this.fn(Ext.getCmp("i_product_typeID").getValue().inputValue);
                                                    },
                                                },
                                            },

                                            {
                                                xtype: "checkboxgroup",
                                                fieldLabel: "การตั้งค่าใช้จ่าย",
                                                name: "i_type_fix_rate",
                                                id: "i_type_fix_rateGb",
                                                columns: 1,
                                                items: [
                                                    {
                                                        id: "i_type_fix_rateID",
                                                        boxLabel: "รายเดือน(บันทึกบัญชี)",
                                                        name: "i_type_fix_rate",
                                                        inputValue: 1,
                                                    },
                                                ],
                                                listeners: {
                                                    beforerender: function () {
                                                        this.fn = function () {
                                                            if (Ext.getCmp("i_purchaseID").getValue().inputValue == 1) {
                                                                Ext.getCmp("i_type_contract2").show(); //
                                                                Ext.getCmp("i_type_contract3").show(); //
                                                                Ext.getCmp("i_product_typeID").show(); // ของที่ได้มา
                                                                Ext.getCmp("i_product_type0").hide();

                                                                Ext.getCmp("i_is_invGID").show();
                                                            } else if (Ext.getCmp("i_purchaseID").getValue().inputValue == 2) {
                                                                Ext.getCmp("i_type_contract2").show();
                                                                Ext.getCmp("i_product_typeID").show(); // ของที่ได้มา
                                                                Ext.getCmp("i_product_type0").show();
                                                                Ext.getCmp("i_type_contract3").hide();
                                                                Ext.getCmp("i_is_invGID").show();
                                                            } else if (Ext.getCmp("i_purchaseID").getValue().inputValue == 3) {
                                                                Ext.getCmp("i_type_contract2").hide();
                                                                Ext.getCmp("i_type_contract3").hide();
                                                                Ext.getCmp("i_product_typeID").hide();
                                                                Ext.getCmp("i_is_invGID").hide();
                                                            }
                                                            // alert(Ext.getCmp('i_purchaseID').getValue().inputValue);
                                                        };
                                                    },
                                                    afterrender: function () {
                                                        Ext.getCmp("i_type_fix_rateGb").fn();
                                                    },
                                                    change: function () {
                                                        Ext.getCmp("i_type_fix_rateGb").fn();
                                                        /* 
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
                                                         },*/
                                                    },
                                                },
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
                                                xtype: "hidden",
                                                name: "c_date",
                                                id: "c_dateID",
                                            },
                                            {
                                                fieldLabel: "วันที่บันทึก",
                                                xtype: "datefield",
                                                name: "d_tor_status_date",
                                                liesteners: {
                                                    blur: function () {
                                                        alert(this.getValue());
                                                        Ext.getCmp("c_dateID").setValue(this.getValue());
                                                    },
                                                },
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
                                            Ext.getBodyMultiBudget(Ext.selectRow, 'st0008'),
                                            {
                                                xtype: "hidden",
                                                name: "c_menu",
                                                value: "signContract",
                                            },
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
                                        columnWidth: 0.55, 
                                        layout: "form",
                                        autoScroll: true, // เพิ่ม Scrollbar ทั้งแนวนอนและแนวตั้ง  
                                        items:[{
                                            xtype: "grid",
                                            id: "gridSub1ID", 
                                            title:"เลขที่สัญญา",
                                            stripeRows: true,
                                            frame: true,
                                            loadMask: true, 
                                            autoScroll: true, 
                                            border: false,  
                                            height:200,  
                                            autoExpandColumn: 'company',
                                            stateful: true,
                                            store: Ext.store2,
                                            viewConfig: {
                                                forceFit: true, 
                                                enableTextSelection: true  ,
                                                showGroupName: false,
                                                enableNoGroups:false,
                                                enableGroupingMenu:false,
                                                hideGroupedColumn: true
                                            },
                                            columns: [
                                                    new Ext.grid.RowNumberer({width:25, header: "", dataIndex: "no"}), 
                                                    {
                                                        header: "-",
                                                        sortable: false,
                                                        hideable: false,
                                                        draggable: false,
                                                        align: "center",
                                                        id: "edit21",
                                                        width:30,
                                                        dataIndex: "c_code",
                                                        renderer: function (value, metaData, record, row, col, store, gridView) {
                                                             metaData.attr = 'ext:qtip="' + value + ' แก้ไข/ออกเลข"';
                                                            if (record.get("c_code") == "") {
                                                                return '<img src="../images/icons/document_edit.gif"); style="cursor:pointer"/>';
                                                            } else {
                                                                return '<img src="../images/icons/application_view_list.png"); style="cursor:pointer"/>';
                                                            }
                                                        },
                                                    },
                                                    {
                                                        header: "-", align: "left", dataIndex: "id", width:18,id:'i_monthlyID'
                                                        ,renderer: function (value, metadata, record) {
                                                                if(record.get('i_is_expense_monthly')){
                                                                    metadata.attr = 'ext:qtip="' + value + ' ตั้งค่าใช้จ่ายรายเดือน"'; 
                                                                return '<img src="../images/icons/calendar_edit.png"); style="cursor:pointer"/>';
                                                            }else{
                                                                metadata.attr = 'ext:qtip="' + value + ' ตั้งค่าใช้จ่ายรายเดือน"'; 
                                                                return '-'; 
                                                            }
                                                        } 
                                                    }, 
                                                    {
                                                        header: "เลขสัญญา",
                                                        align: "left",
                                                        dataIndex: "c_code",
                                                        width: 90,
                                                        renderer: function (value, metaData, record, row, col, store, gridView) {
                                                            return "<b>" + value + "</b>";
                                                        },
                                                    },
                                                    {
                                                        header: "ชื่อคู่สัญญา",
                                                        align: "left",
                                                        dataIndex: "creditor_name",
                                                        id: "company", 
                                                    },
                                                    {
                                                        header: "เลขอ้างอิง",
                                                        align: "left",
                                                        dataIndex: "c_doc_ref",
                                                        width:70,
                                                    },
                                                    {
                                                        header: "วันที่สัญญา",
                                                        dataIndex: "d_doc_date",
                                                        width:100,
                                                        align: "right",
                                                    },
                                                    {header: "รวม", dataIndex: "f_total_amt", align: "right", width:80},
                                                    {header: "",dataIndex: "", width:8},
                                                    
                                                ] ,
                                            tbar: [
                                                {
                                                    xtype: "button",
                                                    iconCls: "icon-add",
                                                    text: "เพิ่มรายการสัญญา",
                                                    handler: function () {
                                                        /*if (Ext.selectRow.data.contract_no == 1) {
                                                         Ext.Msg.alert("แจ้งเตือน", "รายการนี้มีเลขที่สัญญาแล้ว");
                                                         return false;
                                                         } else */
                                                        if (Ext.selectRow.data.i_purchase != Ext.getCmp("i_purchaseID").getValue().inputValue) {
                                                            Ext.Msg.alert("แจ้งเตือน", "รายการนี้มีการเปลี่ยนแปลงข้อมูล กรุณากดบันทึกรายการก่อนออกเลขสัญญา");
                                                            return false;
                                                        } else if (Ext.selectRow.data.i_type_contract == null) {
                                                            Ext.example.msg("แจ้งเตือน", "กรุณาเลือกประเภทสัญญาก่อนเพิ่มรายการ", 1);
                                                            $(this).next("text copied");
                                                            setTimeout(function () {
                                                                $(this).next().remove();
                                                            }, 8000);
                                                            return;
                                                        } else {
                                                            Ext.SelectStore = null;
                                                            Ext.cntContract();
                                                            var i_edit_type = document.getElementsByName("i_edit_type");
                                                            i_edit_type[0].checked = true;
                                                            // if(Ext.selectRow.data.i_purchase != 1 ){
                                                            // var dBillingDate = new Date('2023-10-02').add(Date.YEAR, 543);
                                                            // Ext.getCmp('d_contract_dateID').setValue(dBillingDate.format('d-m-Y'));
                                                            // }
                                                        }
                                                    },
                                                },
                                            ],
                                            listeners: {
                                                beforerender: function () {
                                                    Ext.cntContract = function (evt, rec) {
                                                        var win = new Ext.Window({
                                                            labelWidth: 175,
                                                            collapsible: true,
                                                            maximizable: true,
                                                            modal: true,
                                                            title: "รายละเอียดสัญญา",
                                                            id: "win-frm-contractID",
                                                            layout: "fit",
                                                            border: false,
                                                            height:Ext.getBody().getViewSize().height,
                                                            widht:Ext.getBody().getViewSize().width,
                                                            listeners: {
                                                                close: function () {
                                                                    Ext.getCmp("win-frm-contractID").destroy();
                                                                    Ext.getCmp(Ext.poFormID).destroy();
                                                                    Ext.storeDtl.reload();
                                                                },
                                                                afterrender: function () {
//                                                                    Ext.getCmp("buSaveSubID").hide();
                                                                    if (Ext.SelectStore != null) {
                                                                        if (Ext.SelectStore.data.c_code != "") {
                                                                            // console.log(Ext.getCmp('win-frm-contractID'));
                                                                            Ext.getCmp('d_contract_dateID').setValue(Ext.SelectStore.data.d_contract_date);
                                                                            Ext.getCmp("btn_save_Contract").hide();
                                                                            Ext.getCmp("i_edit_typeID").hide();
                                                                            Ext.getCmp("i_cont_dis_idID_pop").hide();
                                                                            // Ext.getCmp("c_contract_noID").setReadOnly(true);
                                                                            // Ext.getCmp("d_contract_dateID").setReadOnly(true);
                                                                            Ext.getCmp("d_due_dateID").setReadOnly(true);
                                                                            Ext.getCmp("c_name_ContractID").setReadOnly(true);
                                                                            Ext.getCmp("Budc_creditor_idID").disable(true);
                                                                            Ext.getCmp("dc_creditor_idID_pop").setReadOnly(true);
                                                                            Ext.getCmp("i_cont_dis_idID_pop").setReadOnly(true);
                                                                            Ext.getCmp("f_totalID").setReadOnly(true);
                                                                            Ext.getCmp("i_is_poID").disable(true);
                                                                            Ext.getCmp("fieldsetID").disable(true);

                                                                            //                                                                    console.log(Ext.getCmp("i_is_periodID"));
                                                                            //                                                                    Ext.getCmp("i_is_periodID").disable(true);
                                                                        }
                                                                    } else {
                                                                        var d = new Date().format("d-m-Y");
                                                                        Ext.getCmp('d_contract_dateID').setValue(d);
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
                                                                            name: "sp_tor_id2",
                                                                            id: "sp_tor_id2ID",
                                                                        },
                                                                        {
                                                                            xtype: "hidden",
                                                                            name: "sp_tor_contract_id2",
                                                                            id: "sp_tor_contract_id2ID",
                                                                        },
                                                                        {
                                                                            xtype: "hidden",
                                                                            id: "sp_tor_contract_id",
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
                                                                                    boxLabel: "เลขสัญญา",
                                                                                    name: "i_edit_type",
                                                                                    inputValue: "3",
                                                                                },
                                                                            ],
                                                                        },
                                                                        {
                                                                            xtype: "displayfield",
                                                                            fieldLabel: "ประเภทสัญญา",
                                                                            id: "i_type_contract_nameID",
                                                                            listeners: {
                                                                                beforerender: function () {
                                                                                    this.fn = function () {
                                                                                        this.setValue(Ext.getCmp("i_type_contractID").getValue().boxLabel);
                                                                                    };
                                                                                },
                                                                                afterrender: function () {
                                                                                    this.fn();
                                                                                },
                                                                            },
                                                                        },
                                                                        {
                                                                            xtype: "displayfield",
                                                                            fieldLabel: "ของที่ได้มา",
                                                                            id: "i_product_type_nameID",
                                                                            listeners: {
                                                                                beforerender: function () {
                                                                                    this.fn = function () {
                                                                                        this.setValue(Ext.getCmp("i_product_typeID").getValue().boxLabel);
                                                                                    };
                                                                                },
                                                                                afterrender: function () {
                                                                                    this.fn();
                                                                                },
                                                                            },
                                                                        },
                                                                        {
                                                                            xtype: "checkbox",
                                                                            id: "i_contract_checkboxID",
                                                                            name: "i_contract_checkbox",
                                                                            height: 20,
                                                                            boxLabel: "มีเลขสัญญาอยู่แล้ว",
                                                                            inputValue: "3",
                                                                            listeners: {
                                                                                check: function (checkbox, checked) {
                                                                                    /* if (checked) {
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
                                                                                     }*/
                                                                                },
                                                                            },
                                                                        },
                                                                        {
                                                                            xtype: "compositefield",
                                                                            id: "i_cont_dis_idID_pop",
                                                                            fieldLabel: "เลือกสัญญา",
                                                                            msgTarget: "side",
                                                                            anchor: "-20",
                                                                            defaults: {flex: 1},
                                                                            listeners: {
                                                                                afterrender: function (obj, eOpts) {},
                                                                            },
                                                                            items: [PopContForm2.mini],
                                                                        },
                                                                        {
                                                                            xtype: "textfield",
                                                                            width: 170,
                                                                            fieldLabel: "เลขสัญญา ",
                                                                            id: "codeCTS",
                                                                            style: "text-align: center;font-weight:bold;background:#eee;",
                                                                            // readOnly: true,
                                                                            name: "c_code",
                                                                        },
                                                                        /*   {
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
                                                                         },*/
                                                                        {
                                                                            xtype: "datefield",
                                                                            fieldLabel: "วันที่เซ็นสัญญา",
                                                                            id: "d_contract_dateID",
                                                                            name: "d_contract_date",
                                                                            width: 100,
                                                                            // value :new Date().format("d-m-Y")  ,
                                                                            // readOnly:   true , 
                                                                            validator: function (val) {
                                                                                if (Ext.isEmpty(val)) {
                                                                                    return "กรุณากรอก วันที่เซ็นสัญญา ";
                                                                                } else {
                                                                                    return true;
                                                                                }
                                                                            },
                                                                            listeners: {
                                                                                change: function () {
                                                                                    // d_doc_dateID_Change();
                                                                                },
                                                                            },
                                                                        },
                                                                        {
                                                                            xtype: "datefield",
                                                                            fieldLabel: "วันเริ่มทำงาน",
                                                                            id: "d_start_dateID",
                                                                            name: "d_start_date",
                                                                            width: 100,
                                                                            // value :new Date().format("d-m-Y")  ,
                                                                            // readOnly:   true , 
                                                                            validator: function (val) {
                                                                                if (Ext.isEmpty(val)) {
                                                                                    return "กรุณากรอก วันเริ่มทำงาน ";
                                                                                } else {
                                                                                    return true;
                                                                                }
                                                                            },
                                                                            listeners: {
                                                                                change: function () {
                                                                                    d_doc_dateID_Change();
                                                                                },
                                                                            },
                                                                        },
                                                                        {
                                                                            xtype: "radiogroup",
                                                                            columns: [150, 200],
                                                                            fieldLabel: "ลักษณะบันทึกวันสิ้นสุด",
                                                                            id: "i_day_useID",
                                                                            name: "i_day_use",
                                                                            items: [
                                                                                {
                                                                                    checked: true,
                                                                                    inputValue: 1,
                                                                                    name: "i_day_use_l",
                                                                                    boxLabel: "วันที่สิ้นสุดสัญญา",
                                                                                },
                                                                                {
                                                                                    inputValue: 0,
                                                                                    name: "i_day_use_l",
                                                                                    boxLabel: "จำนวนวันที่สิ้นสุดสัญญา",
                                                                                },
                                                                            ], //radiogroup
                                                                            listeners: {
                                                                                change: function () {
                                                                                    if (this.getValue().inputValue == 0) {
                                                                                        Ext.getCmp("group_period_date").hide();
                                                                                        Ext.getCmp("group_i_day").show();
                                                                                    } else {
                                                                                        Ext.getCmp("group_period_date").show();
                                                                                        Ext.getCmp("group_i_day").hide();
                                                                                    }
                                                                                }
                                                                            }
                                                                        },
                                                                        {
                                                                            xtype: "buttongroup",
                                                                            fieldLabel: "วันที่สิ้นสุดสัญญา  ",
                                                                            id: "group_period_date",
                                                                            width: 500,
                                                                            frame: false,
                                                                            border: false,
                                                                            items: [
                                                                                {
                                                                                    xtype: "datefield",
                                                                                    id: "d_due_dateID",
                                                                                    name: "d_due_date",
                                                                                    width: 100,
                                                                                    validator: function (val) {
                                                                                        if (Ext.isEmpty(val)) {
                                                                                            return "กรุณากรอก วันที่สิ้นสุดสัญญา  ";
                                                                                        } else {
                                                                                            return true;
                                                                                        }
                                                                                    },
                                                                                    listeners: {
                                                                                        change: function () {
                                                                                            d_period_dateID_change();
                                                                                        },
                                                                                    },
                                                                                },
                                                                                {
                                                                                    xtype: "tbspacer",
                                                                                    width: 18,
                                                                                },
                                                                                {
                                                                                    xtype: "displayfield",
                                                                                    id: "txt_d_period_dateID",
                                                                                    value: "",
                                                                                    width: 400,
                                                                                    style: {
                                                                                        color: "red",
                                                                                    },
                                                                                },
                                                                            ],
                                                                        },
                                                                        {
                                                                            xtype: "buttongroup",
                                                                            fieldLabel: "จำนวนวันที่สิ้นสุดสัญญา  ",
                                                                            id: "group_i_day",
                                                                            hidden: true,
                                                                            hideMode: "offsets",
                                                                            width: 500,
                                                                            frame: false,
                                                                            border: false,
                                                                            items: [
                                                                                {
                                                                                    xtype: "textfield",
                                                                                    id: "i_dayID",
                                                                                    style: "text-align: center", //d_due_dateID
                                                                                    name: "i_day", //d_due_date
                                                                                    width: 50,
                                                                                    validator: function (val) {
                                                                                        var regex = /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\.)?$/;
                                                                                        if (!regex.test(val)) {
                                                                                            return "กรุณากรอก ตัวเลข";
                                                                                            return true;
                                                                                        } else {
                                                                                            return true;
                                                                                        }
                                                                                    },
                                                                                    listeners: {
                                                                                        change: function () {
                                                                                            i_dayID_Change();
                                                                                        },
                                                                                    },
                                                                                },
                                                                                {
                                                                                    xtype: "displayfield",
                                                                                    value: "วัน",
                                                                                },
                                                                                {
                                                                                    xtype: "tbspacer",
                                                                                    width: 18,
                                                                                },
                                                                                {
                                                                                    xtype: "displayfield",
                                                                                    id: "txt_i_dayID",
                                                                                    value: "",
                                                                                    width: 400,
                                                                                },
                                                                            ],
                                                                        },
                                                                        {
                                                                            xtype: "displayfield",
                                                                            id: "th_date",
                                                                            value: "",
                                                                            width: 400,
                                                                            style: {
                                                                                color: "green",
                                                                            },
                                                                        },
                                                                        {
                                                                            fieldLabel: "เรื่อง ",
                                                                            xtype: "textarea",
                                                                            width: 300,
                                                                            id: "c_name_ContractID",
                                                                            name: "c_name",
                                                                            value: Ext.selectRow.get("c_name"),
                                                                            cls: "my-label-style",
                                                                            listeners: {
                                                                                afterrender: function () {
                                                                                },
                                                                            },
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
                                                                            id: "i_is_join_ventureID",
                                                                            name: "i_is_join_venture",
                                                                            height: 20,
                                                                            fieldLabel: "ประเภทผู้ขายผู้รับจ้าง",
                                                                            boxLabel: "กิจการร่วมค้า",
                                                                            inputValue: "1",
                                                                            // style: "pointer-events: none;",
                                                                            listeners: {
                                                                                check: function (checkbox, checked) {
                                                                                    if (checked) {
                                                                                    }
                                                                                },
                                                                                afterrender: function () {
                                                                                },
                                                                            },
                                                                        },
                                                                        {
                                                                            xtype: "checkbox",
                                                                            id: "i_is_poID",
                                                                            name: "i_is_po",
                                                                            height: 20,
                                                                            fieldLabel: "ประเภทสัญญา",
                                                                            boxLabel: "จะซื้อ จะขาย",
                                                                            inputValue: "1",
                                                                            // style: "pointer-events: none;",
                                                                            listeners: {
                                                                                check: function (checkbox, checked) {
                                                                                    Ext.getCmp("i_is_poID").setValue(Ext.selectRow.data.i_type_fix_rate == 1 ? true : false);
                                                                                    if (checked) {
                                                                                    }
                                                                                },
                                                                                afterrender: function () {
                                                                                    Ext.getCmp("i_is_poID").setValue(Ext.selectRow.data.i_type_fix_rate == 1 ? true : false);
                                                                                },
                                                                            },
                                                                        },
                                                                        {
                                                                            xtype: "checkbox",
                                                                            id: "i_is_expense_monthlyID",
                                                                            name: "i_is_expense_monthly",
                                                                            height: 20,
                                                                            fieldLabel: "ตั้งหนี้ค่าใช้จ่าย ",
                                                                            boxLabel: "รายเดือน(บันทึกบัญชี)",
                                                                            inputValue: "1",
                                                                            listeners: {
                                                                                check: function (checkbox, checked) {
                                                                                    if (checked) {
                                                                                        Ext.getCmp("bnt_SetDebt").show();
                                                                                    } else {
                                                                                        Ext.getCmp("bnt_SetDebt").hide();
                                                                                    }
                                                                                },
                                                                                afterrender: function () {
                                                                                    if (Ext.getCmp("i_is_poID").getValue()) {
                                                                                        Ext.getCmp("i_is_expense_monthlyID").hide();
                                                                                    } else {
                                                                                        Ext.getCmp("i_is_expense_monthlyID").show();
                                                                                    }
                                                                                    // if (evt == "edit21") {
                                                                                    //   Ext.getCmp("i_is_expense_monthlyID").show();
                                                                                    // } else {
                                                                                    //   Ext.getCmp("i_is_expense_monthlyID").hide();
                                                                                    // }
                                                                                },
                                                                            },
                                                                        },
                                                                        {
                                                                            xtype: "button",
                                                                            id: "bnt_SetDebt",
                                                                            fieldLabel: "กำหนดตั้งหนี้ค่าใช้จ่าย",
                                                                            text: "กำหนดตั้งหนี้ค่าใช้จ่าย",
                                                                            hidden: true,
                                                                            handler: function () {
                                                                                Ext.fnMonthly();
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
                                                                                                    Ext.getCmp("i_is_cashiercheque_warrantyID").setValue(null);
                                                                                                }
                                                                                            },
                                                                                        },
                                                                                    },
                                                                                    {
                                                                                        xtype: "checkbox",
                                                                                        id: "i_is_bank_warrantyID",
                                                                                        name: "i_is_bank_warranty",
                                                                                        height: 20,
                                                                                        boxLabel: "เงินสด ",
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
                                                                                                id: "fpBt31",
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
                                                                                        id: "i_is_cashiercheque_warrantyID",
                                                                                        name: "i_is_cashiercheque_warranty",
                                                                                        height: 20,
                                                                                        boxLabel: "แคชเชียร์เช็ค ",
                                                                                        inputValue: "1",
                                                                                        listeners: {
                                                                                            check: function (checkbox, checked) {
                                                                                                if (checked) {
                                                                                                    Ext.getCmp("i_cashiercheque_typeID").show();
                                                                                                    Ext.getCmp("c_books_cashierchequeID").show();
                                                                                                    Ext.getCmp("c_receipt_cashierchequeID").show();
                                                                                                    Ext.getCmp("d_cashiercheque_dateID").show();
                                                                                                    Ext.getCmp("c_commentID2").show();
                                                                                                    // Ext.getCmp("i_is_bank_warranty5ID").setValue(null);
                                                                                                    Ext.getCmp("i_is_bank_warranty0ID").setValue(null);
                                                                                                    /* console.log(Ext.getCmp('i_cashiercheque_typeID'));
                                                                                                     console.log(Ext.getCmp('i_is_bank_warranty5ID')); */
                                                                                                } else {
                                                                                                    Ext.getCmp("i_cashiercheque_typeID").hide();
                                                                                                    Ext.getCmp("c_books_cashierchequeID").hide();
                                                                                                    Ext.getCmp("c_receipt_cashierchequeID").hide();
                                                                                                    Ext.getCmp("d_cashiercheque_dateID").hide();
                                                                                                    Ext.getCmp("c_commentID2").hide();
                                                                                                }
                                                                                            },
                                                                                        },
                                                                                    },
                                                                                    {
                                                                                        fieldLabel: "ใบเสร็จลำดับที่",
                                                                                        id: "c_books_cashierchequeID",
                                                                                        name: "c_books_cashiercheque",
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
                                                                                        id: "c_receipt_cashierchequeID",
                                                                                        name: "c_receipt_cashiercheque",
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
                                                                                        id: "d_cashiercheque_dateID",
                                                                                        name: "d_cashiercheque_date",
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
                                                                                        id: "i_cashiercheque_typeID",
                                                                                        items: [
                                                                                            {
                                                                                                fieldLabel: "วงเงินในสัญญา ",
                                                                                                id: "f_warranty_amtID2",
                                                                                                name: "f_cashiercheque_warranty_amt2",
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
                                                                                        id: "c_commentID2",
                                                                                        hidden: true,
                                                                                        name: "c_comment2",
                                                                                        xtype: "textarea",
                                                                                        height: 60,
                                                                                        width: 430,
                                                                                        listeners: {
                                                                                            render: function (p) {
                                                                                                // this.hide();
                                                                                            },
                                                                                        },
                                                                                    },
                                                                                    {
                                                                                        xtype: "checkbox",
                                                                                        id: "i_is_bank_warranty1ID",
                                                                                        name: "i_is_bank_warranty1",
                                                                                        height: 20,
                                                                                        boxLabel: "หนังสือค้ำประกัน",
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
                                                                    iconCls: "icon-save",
                                                                    listeners: {
                                                                        afterrender: function () {
                                                                            //alert(Ext.selectRow.get('bg_check_id'));
                                                                            if (Ext.selectRow.get("bg_check_id") > 0 || Ext.selectRow.get("i_type_bg") === 4 || Ext.selectRow.get("i_type_bg") === 8 || Ext.selectRow.get("i_type_bg") === 2)
                                                                                this.show();
                                                                            else
                                                                                this.hide();
                                                                        },
                                                                    },
                                                                    handler: function () {
                                                                        var msg = "";

                                                                        if (Ext.selectRow.get("bg_reserve_overlap_id") > 0) {
                                                                            msg += "- กรุณาเลือกแหล่งเงินจ่ายก่อนบันทึก" + "\n"
                                                                        }
                                                                        if (Ext.getCmp('dc_creditor_idID').getValue() == '') {
                                                                            msg += "- กรุณาเลือกหมวดค่าใช้จ่ายก่อนบันทึก" + "\n"
                                                                        }
                                                                        // if (Ext.getCmp('sp_contract_year').getValue() ==''){
                                                                        if ([null, 0, ""].includes(Ext.selectRow.get("sp_contract_year"))) {
                                                                            msg += "- ปีงบประมาณถูกปรับเป็นไม่ใช้งานอยู่" + "\n"
                                                                        }
                                                                        if (msg != "") {
                                                                            Ext.example.msg("แจ้งเตือน", msg, 1);
                                                                            $(this).next("text copied");
                                                                            setTimeout(function () {
                                                                                $(this).next().remove();
                                                                            }, 6000);
                                                                            return;
                                                                        }
                                                                        // }
                                                                        if (Ext.getCmp("i_edit_typeID").getValue().inputValue == 3) {
                                                                            GenCode_CTS();
                                                                            return;
                                                                        } else if (msg == "") {
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
                                                                        }
                                                                        // } else {
                                                                        //                                  Ext.Msg.alert("แจ้งเตือน", '' + 'form-widgets');
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
                                                                        // Ext.getCmp("form-widgets2").destroy();
                                                                        // Ext.getCmp(Ext.poFormID).destroy();
                                                                        Ext.getCmp("win-frm-contractID").destroy();
                                                                        Ext.storeDtl.reload();
                                                                        Ext.store1.reload();
                                                                        Ext.store2.reload();
                                                                    },
                                                                },
                                                            ],
                                                        });

                                                        if (!Ext.isEmpty(rec)) {
                                                            rec.set("sp_tor_id", Ext.SelectStore.data.sp_tor_id);
                                                            rec.set("sp_tor_contract_id", Ext.SelectStore.data.sp_tor_contract_id);
                                                            // rec.set("c_contract_no", Ext.SelectStore.data.c_doc_ref);
                                                            rec.set("i_is_period", Ext.SelectStore.data.i_is_period);
                                                            rec.set("d_contract_date", Ext.SelectStore.data.d_doc_date);
                                                            rec.set("d_due_date", Ext.SelectStore.data.d_due_date);
                                                            rec.set("dc_creditor_id", Ext.SelectStore.data.dc_creditor_id);
                                                            rec.set("c_name", Ext.SelectStore.data.c_name);
                                                            rec.set("f_total", Ext.SelectStore.data.f_total_amt);
                                                            rec.set("c_code", Ext.SelectStore.data.c_code);
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
                                                            if (Ext.SelectStore.data.i_is_cashiercheque_warranty == 1) {
                                                                Ext.getCmp("i_is_bank_warranty0ID").setValue(null);
                                                                Ext.getCmp("i_is_cashiercheque_warrantyID").setValue(true);

                                                                Ext.getCmp("f_warranty_amtID2").show();
                                                                Ext.getCmp("c_books_cashierchequeID").show();
                                                                Ext.getCmp("c_receipt_cashierchequeID").show();
                                                                Ext.getCmp("d_cashiercheque_dateID").show();
                                                                Ext.getCmp("f_warranty_amtID2").show();
                                                                Ext.getCmp("c_commentID2").show();
                                                            } else {
                                                                Ext.getCmp("i_is_bank_warranty0ID").setValue(true);
                                                                Ext.getCmp("i_is_cashiercheque_warrantyID").setValue(null);

                                                                Ext.getCmp("i_cashiercheque_typeID").hide();
                                                                Ext.getCmp("c_books_cashierchequeID").hide();
                                                                Ext.getCmp("c_receipt_cashierchequeID").hide();
                                                                Ext.getCmp("d_cashiercheque_dateID").hide();
                                                                Ext.getCmp("c_commentID2").hide();
                                                            }
                                                            rec.set("c_books_receipt", Ext.SelectStore.data.book_no);
                                                            rec.set("c_receipt_no", Ext.SelectStore.data.book_seq);
                                                            rec.set("d_doc_date", Ext.SelectStore.data.d_book_date);
                                                            rec.set("f_warranty_amt", Ext.SelectStore.data.f_warranty_amt);
                                                            rec.set("c_comment", Ext.SelectStore.data.c_remark);

                                                            rec.set("c_books_cashiercheque", Ext.SelectStore.data.cashiercheque_on);
                                                            rec.set("c_receipt_cashiercheque", Ext.SelectStore.data.cashiercheque_seq);
                                                            rec.set("d_cashiercheque_date", Ext.SelectStore.data.d_cashiercheque_data);
                                                            rec.set("f_cashiercheque_warranty_amt2", Ext.SelectStore.data.f_warranty_cashiercheque);
                                                            rec.set("c_comment2", Ext.SelectStore.data.c_remark_cashiercheque);

                                                            rec.set("i_is_period", Ext.SelectStore.data.i_is_period);

                                                            rec.set("c_doc_no", Ext.SelectStore.data.book_warranty_no);
                                                            rec.set("d_doc_date1", Ext.SelectStore.data.d_book_warranty_date);

                                                            rec.set("dc_bank_id", Ext.SelectStore.data.dc_bank_id);
                                                            rec.set("txtdc_bank_idID", Ext.SelectStore.data.dc_bank_idID_Name);

                                                            rec.set("f_warranty_amt1", Ext.SelectStore.data.f_book_warranty_amt);
                                                            rec.set("d_expire_warranty", Ext.SelectStore.data.d_book_warranty_end);
                                                            rec.set("c_comment1", Ext.SelectStore.data.c_remark1);

                                                            win.items.items[0].getForm().loadRecord(rec);
                                                            win.setTitle("แก้ไขรายการสัญญา ");
                                                            Ext.getCmp("i_edit_typeID").show();
                                                            Ext.getCmp("i_cont_dis_idID_pop").hide();
                                                            Ext.getCmp("i_contract_checkboxID").hide();
                                                            Ext.getCmp("sp_tor_id2ID").hide();
                                                            Ext.getCmp("sp_tor_contract_id2ID").hide();
                                                        } else {
                                                            win.setTitle("เพิ่มรายการสัญญา");
                                                            Ext.getCmp("i_edit_typeID").hide();
                                                            Ext.getCmp("i_edit_typeID").hide();
                                                            Ext.getCmp("i_cont_dis_idID_pop").show();
                                                            Ext.getCmp("i_contract_checkboxID").hide();
                                                            Ext.getCmp("sp_tor_id2ID").hide();
                                                            Ext.getCmp("sp_tor_contract_id2ID").hide();
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
                                                            var day = Ext.SelectStore.data.i_day;
                                                            var oneDay = 24 * 60 * 60 * 1000;
                                                            var firstDate = new Date(Ext.util.Format.date(Ext.getCmp("d_contract_dateID").getValue(), "Y/m/d"));
                                                            var date = new Date(firstDate.getTime() + oneDay * day);
                                                            var FullDay = date.toLocaleDateString("th-TH", {
                                                                year: "numeric",
                                                                month: "short",
                                                                day: "numeric",
                                                                weekday: "long",
                                                            });
                                                            // Ext.f_total_contract = record.data.f_total.replace(",", "");;
                                                            Ext.getCmp("dc_creditor_idID_Name").setValue(Ext.SelectStore.data.c_tax_number_imp + " : " + Ext.SelectStore.data.creditor_name);
                                                            Ext.getCmp("dc_creditor_idID").setValue(Ext.SelectStore.data.dc_creditor_id);
                                                            Ext.getCmp("dc_bank_idID_Name").setValue(Ext.SelectStore.data.dc_bank_idID_Name);
                                                            Ext.getCmp("dc_bank_idID").setValue(Ext.SelectStore.data.dc_bank_id);
                                                            Ext.getCmp("txt_d_period_dateID").setValue("<font color='green'>จำนวน " + day + " วัน</font>");
                                                            Ext.getCmp("txt_i_dayID").setValue(new Date(firstDate.getTime() + oneDay * day));
                                                            Ext.getCmp("txt_i_dayID").setValue("<font color='green'>" + FullDay + "</font>");
                                                            var i_edit_type = document.getElementsByName("i_edit_type");
                                                            i_edit_type[1].checked = true;
                                                            if (Ext.SelectStore.get("i_is_warranty") == 1) {
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

                                                            if (Ext.SelectStore.get("c_books_cashiercheque") != null) {
                                                                Ext.getCmp("i_is_cashiercheque_warrantyID").setValue(true);
                                                                Ext.getCmp("i_cashiercheque_typeID").show();
                                                                Ext.getCmp("c_books_cashierchequeID").show();
                                                                Ext.getCmp("c_receipt_cashierchequeID").show();
                                                                Ext.getCmp("d_cashiercheque_dateID").show();
                                                                Ext.getCmp("c_commentID2").show();
                                                                Ext.getCmp("i_is_bank_warranty0ID").setValue(null);
                                                            } else {
                                                                Ext.getCmp("i_is_cashiercheque_warrantyID").setValue(false);
                                                                Ext.getCmp("i_cashiercheque_typeID").hide();
                                                                Ext.getCmp("c_books_cashierchequeID").hide();
                                                                Ext.getCmp("c_receipt_cashierchequeID").hide();
                                                                Ext.getCmp("d_cashiercheque_dateID").hide();
                                                                Ext.getCmp("c_commentID2").hide();
                                                            }

                                                            if (Ext.SelectStore.get("i_is_warranty_book") == 1) {
                                                                Ext.getCmp("i_is_bank_warranty1ID").setValue(true);
                                                                Ext.getCmp("i_warranty_type1ID").show();
                                                                Ext.getCmp("c_doc_noID").show();
                                                                Ext.getCmp("d_doc_date1ID").show();
                                                                Ext.getCmp("c_comment1ID").show();
                                                                Ext.getCmp("d_expire_warrantyID").show();
                                                                Ext.getCmp("frmPopBankID").show();
                                                                Ext.getCmp("dc_bank_idID_Name").setValue(Ext.SelectStore.get("dc_bank_idID_Name"));
                                                                Ext.getCmp("dc_bank_idID").setValue(Ext.SelectStore.get("dc_bank_id"));
                                                            } else {
                                                                Ext.getCmp("i_is_bank_warranty1ID").setValue(null);
                                                                Ext.getCmp("i_warranty_type1ID").hide();
                                                                Ext.getCmp("c_doc_noID").hide();
                                                                Ext.getCmp("d_doc_date1ID").hide();
                                                                Ext.getCmp("c_comment1ID").hide();
                                                                Ext.getCmp("d_expire_warrantyID").hide();
                                                                Ext.getCmp("frmPopBankID").hide();
                                                            }
                                                        }
                                                    };
                                                },
                                                afterrender: function () {
                                                    Ext.getCmp("gridSub1ID").on("cellclick", this.thisCick, this);
                                                },
                                            },
                                            
                                        }]
                                    }
                                ]
                            }, 
                        ], 
                        //buttons
                                        buttonAlign: "center",
                                        buttons: [
                                            /*
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
                                                    if (Ext.getCmp("i_type_contract1").checked == false && Ext.getCmp("i_type_contract2").checked == false && Ext.getCmp("i_type_contract3").checked == false) {
                                                        msg += "<span style='white-space: nowrap;'>- กรุณาเลือกประเภทสัญญา</span><br>";
                                                    }

                                                    if (msg == "") {
                                                        var formSubmit = function () {
                                                            form.submit({
                                                                waitMsg: "Saving Data...",
                                                                success: function (form, action) {
                                                                    Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                                                        Ext.getCmp("tabpanel1").getStore().reload();
                                                                        Ext.selectRow = null;
                                                                        Ext.getCmp(Ext.poFormID).destroy();
                                                                        Ext.getCmp("winChequeID").destroy();
                                                                        Ext.getCmp("tabpanelMain2ID").destroy();
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
                                                                            Ext.Msg.alert("Failure");
                                                                    }
                                                                },
                                                            });
                                                        }; //END
                                                        var form = Ext.getCmp("form-main").getForm();
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
                                                        Ext.MessageBox.alert("แจ้งเตือน", msg);
                                                    }
                                                },
                                                //haddler
                                            },*/
                                            {
                                                text: Ext.GLOBAL_BU_BACK_TH, iconCls: "icon-back",
                                                handler: function () {
                                                    Ext.MessageBox.show({
                                                        title: "Icon Support",
                                                        msg: "คุณต้องการ Reload ข้อมูลใช่ไหม?",
                                                        buttons: Ext.MessageBox.OKCANCEL,
                                                        icon: Ext.MessageBox.WARNING,
                                                        fn: function (btn) {
                                                            if (btn == "ok") {
                                                                Ext.getCmp(Ext.poFormID).destroy();
                                                                Ext.storeDtl.reload();
                                                            } else {
                                                                // Ext.getCmp(Ext.poFormID).destroy();
                                                                return;
                                                            }
                                                        },
                                                    });
                                                },
                                            },
                                        ],
                    }),
                ],
            },
        ], 
        listeners:{ 
            afterrender:function(){ 
                Ext.getCmp('tabpanel1').getEl().unmask(); Ext.application.setHideName('buDarf',Ext.selectRow.get('i_is_register')?1:0);Ext.application.afterRender(this); 
            }, close: function () {
                Ext.storeDtl.reload();
            },
        }
    });
}; 


//**********END*/


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
        header: "่ชื่อ",
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
function gridDetail() {
    return {
        title: "เลือกรายการ จาก PR",
        xtype: "grid",
        border: false,
        stripeRows: true,
        loadMask: true,
        store: Ext.store5,
        width: 1000,
        height: 500,
        columns: [
            //            new Ext.grid.RowNumberer({
            //                width: 35,
            //                header: " No ",
            //                renderer: function (value, metaData, record, row, col, store, gridView) {
            //                    return record.get('no');
            //                }
            //            }),
            {header: "ID System", sortable: true, hidden: true, dataIndex: "id"},
            {
                header: "แจ้งหนี้",
                sortable: false,
                align: "center",
                id: "Edit2",
                width: 50,
                dataIndex: "i_qty2",
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    metaData.attr = "align='center'";
                    if (record.get("i_used") == 1) {
                        //ออ
                        return "";
                    } else {
                        var inp =
                                '<label><div><input name="items[]" value="' +
                                record.get("id") +
                                '" type="checkbox" ' +
                                (value ? "checked" : "") +
                                ">" +
                                '<input type="hidden" name="i_seq[]" value="' +
                                record.get("i_seq") +
                                '"/>' +
                                '<input type="hidden" name="f_amt[]" value="' +
                                record.get("f_amt") +
                                '"/>' +
                                '<input type="hidden" name="f_vat_amt[]" value="' +
                                record.get("f_vat_amt") +
                                '"/>' +
                                '<input type="hidden" name="f_net_cost[]" value="' +
                                record.get("f_net_cost") +
                                '"/>' +
                                '<input type="hidden" name="f_tax_amt[]" value="' +
                                record.get("f_tax_amt") +
                                '"/>' +
                                '<input type="hidden" name="dc_wht_tax_id[]" value="' +
                                record.get("dc_wht_tax_id") +
                                '"/>' +
                                '<input type="hidden" name="f_net_diff_tax[]" value="' +
                                record.get("f_net_diff_tax") +
                                '"/>' +
                                '<input type="hidden" name="i_is_status[]" value="' +
                                record.get("i_is_status") +
                                '"/>' +
                                "";
                        return inp;
                    }
                },
            }, //
            {header: "รายการ", sortable: true, dataIndex: "c_name"},
            {
                header: "ราคา/ต่อหน่วย",
                sortable: true,
                align: "right",
                dataIndex: "f_unit_price",
            },
            {
                header: "จำนวนรวม",
                sortable: true,
                align: "right",
                dataIndex: "i_qty",
            },
            {
                header: "จำนวนที่ใช้",
                sortable: true,
                align: "right",
                dataIndex: "i_qty2",
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    var out = value + record.get("i_qty");
                    return out;
                },
            },
            {
                header: "จำนวนคงเหลือ",
                align: "right",
                sortable: true,
                dataIndex: "i_balance",
            },
        ],
    };
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

                                                                                    Ext.f_total_amt = Ext.selectRow.data.f_total_amt.replace(/\,/g, '');

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
                                                                                    if (!Ext.selectRow.get("i_yyyy"))
                                                                                        Ext.selectRow.set("i_yyyy", null);
                                                                                    Ext.bgYear = Ext.selectRow.get("i_yyyy");
                                                                                    var winApp = AppPoStore(statusx);
                                                                                    Ext.getCmp("winChequeID").items.items[0].getForm().loadRecord(Ext.selectRow);
                                                                                    winApp.show();
                                                                                    Ext.store2.setBaseParam("tor_id", Ext.HDR_ID);
                                                                                    Ext.store2.load();
                                                                                    Ext.storeVictories.setBaseParam("id", Ext.HDR_ID);
                                                                                    Ext.storeVictories.load();
                                                                                    Ext.storeCreditor.setBaseParam("id", Ext.HDR_ID);
                                                                                    function sendAjax(value, multiline) {
                                                                                        if (value === "cancel") {
                                                                                            return alert(value + "\n" + multiline);
                                                                                        } else {
                                                                                            Ext.Ajax.request({
                                                                                                url: "tor/api/mnBgControllerRequest.php",
                                                                                                params: {
                                                                                                    mode: "CONTRACT_REQUEST",
                                                                                                    sp_tor_id: Ext.selectRow.get("id"),
                                                                                                },
                                                                                                method: "POST", //POST
                                                                                                success: function (result, request) {
                                                                                                    Ext.storeDtl.reload({
                                                                                                        callback: function (record, operation, success) {
                                                                                                            if (success) {
                                                                                                                //บันทึกแล้ว
                                                                                                                record.forEach(function (v) {
                                                                                                                    if (Ext.selectRow.get("id") === v.get("id")) {
                                                                                                                        // Override record
                                                                                                                        Ext.selectRow = v;
                                                                                                                        Ext.getCmp(Ext.poFormID).destroy();
                                                                                                                        // Override window items
                                                                                                                        Ext.buAct = "update";
                                                                                                                        Ext.loadStore("edit", true); // app,data.load
                                                                                                                        // END
                                                                                                                        // SENT TO MSG
                                                                                                                        var textSent =
                                                                                                                                '<font color="#000">' +
                                                                                                                                Ext.selectRow.get("c_code") +
                                                                                                                                " " +
                                                                                                                                Ext.selectRow.get("c_name") +
                                                                                                                                "\r" +
                                                                                                                                Ext.selectRow.get("f_total_amt") +
                                                                                                                                "\r" +
                                                                                                                                " คำของจองเงินอุดหนุน/เงินงวด คุณ " +
                                                                                                                                Ext.session.user_name +
                                                                                                                                "</font>";

                                                                                                                        Ext.realTimeSentMsg(60104, textSent);
                                                                                                                        // torUi
                                                                                                                    }
                                                                                                                    // var headerId = window.parent.Ext.get('header'); //Ext.get('header')
                                                                                                                });
                                                                                                            }
                                                                                                        },
                                                                                                    });
                                                                                                    return true;
                                                                                                },
                                                                                                failure: function (result, request) {
                                                                                                    Ext.MessageBox.alert("Failed", result.responseText); // connect error
                                                                                                },
                                                                                            });
                                                                                        }
                                                                                    }

                                                                                    var customPrompt = function (title, msg, fn, scope, multiline, value) {
                                                                                        Ext.MessageBox.show({
                                                                                            title: title,
                                                                                            msg: msg,
                                                                                            buttons: {ok: true, cancel: true},
                                                                                            fn: fn,
                                                                                            minWidth: 400,
                                                                                            scope: scope,
                                                                                            prompt: true,
                                                                                            multiline: multiline,
                                                                                            value: value,
                                                                                            icon: Ext.MessageBox.QUESTION,
                                                                                        });
                                                                                        return Ext.MessageBox;
                                                                                    };
                                                                                    if ([0, 3].includes(Ext.selectRow.get("i_is_request"))// == 0 || Ext.selectRow.get("i_is_request") == 3 
                                                                                            && Ext.selectRow.get("i_type_bg") != 4
                                                                                            && Ext.selectRow.get("i_type_bg") != 2
                                                                                            && Ext.selectRow.get("i_bg_type") == 1
                                                                                            && Ext.selectRow.get("bg_check_id") == 0) {
                                                                                        //  console.log(Ext.selectRow);
                                                                                        var textSent = Ext.selectRow.get("c_code") + " " + Ext.selectRow.get("c_name") + "\r" + Ext.selectRow.get("f_total_amt") + "\r" + "จะไม่สามารถออกเลขสัญญาได้ หากไม่ได้รับการอนุมัติเงินจากฝ่ายจัดสรรเงิน";
                                                                                        //                                               console.log(Ext.MessageBox.OKCANCEL);
                                                                                        customPrompt("คำขอจองประเภทเงินอุดหนุน/งวด", "การทำสัญญาเงินงวด/อุดหนุน ส่งคำขอฝ่ายจัดสรรเงิน", sendAjax, this, true, textSent);
                                                                                    } else if (
                                                                                            Ext.selectRow.get("i_is_request") == 1 &&
                                                                                            Ext.selectRow.get("i_type_bg") != 4 &&
                                                                                            Ext.selectRow.get("i_type_bg") != 2 &&
                                                                                            Ext.selectRow.get("i_bg_type") == 1 &&
                                                                                            Ext.selectRow.get("bg_check_id") == 0
                                                                                            ) {
                                                                                        Ext.MessageBox.alert("แจ้งเตือน", "ระบบได้ส่งคำขอไปยังฝ่ายจัดสรรเงินเรียบแล้ว  <br> กรุณาติดต่อฝ่ายจัดสรรเงิน");
                                                                                    }
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
  