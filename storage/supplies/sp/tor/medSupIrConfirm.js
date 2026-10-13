/* global Ext, user_right_add, user_right_edit, user_right_delete */

Ext.url_process = './tor/api/mnMedSupIrConfirmController.php';

function amtFieldIr(id, name, label) {
    return {
        xtype: "textfield",
        id: id,
        name: name,
        anchor: "90%",
        fieldLabel: label,
        style: "text-align: right",
        listeners: {
            beforerender: function () {
                this.fn = function () {
                    var val = this.getValue();
                    var f_total = parseFloat(String(val).replace(/,/g, "") / 1);
                    this.setValue(isNaN(f_total) ? "" : Ext.floatRenderer(f_total));
                };
            },
            change: function () { this.fn(); },
            blur: function () { this.fn(); },
            afterrender: function () { this.fn(); }
        }
    };
}

// combo ค้นหาผู้ขาย/ผู้รับโอนเงิน (ใช้ตารางกลาง NMU.dbo.dc_creditor ตัวเดียวกัน
// กับที่เมนูอื่นในระบบนี้ใช้) - creditorIdName/creditorNameName/creditorTaxName
// คือชื่อฟิลด์จริงที่จะ submit (hidden) ส่วน displayName เป็นแค่กล่องค้นหา
function creditorComboIr(idPrefix, label, creditorIdName, creditorNameName, creditorTaxName) {
    return new Ext.form.ComboBox({
        id: idPrefix + "ComboID",
        fieldLabel: label,
        anchor: "90%",
        store: new Ext.data.JsonStore({
            autoDestroy: false,
            autoLoad: false,
            url: "tor/api/List_MedSupIrConfirm.php",
            baseParams: {type: "lookup_creditor"},
            root: "data",
            idProperty: "dc_creditor_id",
            fields: ["dc_creditor_id", "c_name", "c_tax_number_imp"],
        }),
        valueField: "dc_creditor_id",
        displayField: "c_name",
        hiddenName: creditorIdName,
        name: idPrefix + "_display",
        mode: "remote",
        minChars: 1,
        queryParam: "query",
        triggerAction: "all",
        forceSelection: true,
        typeAhead: false,
        emptyText: "พิมพ์เพื่อค้นหาผู้ขาย/ผู้รับโอนเงิน...",
        listeners: {
            select: function (combo, record) {
                Ext.getCmp(creditorNameName + "ID").setValue(record.get("c_name"));
                Ext.getCmp(creditorTaxName + "ID").setValue(record.get("c_tax_number_imp"));
            },
            beforequery: function (q) {
                q.query = q.query || '';
                q.forceAll = true;
            }
        }
    });
}

// ================= repeater ของ "line_ids" (รายการย่อยที่จะยิงพร้อมกัน) ================= //
Ext.irConfirmLineCount = 0;

Ext.fnAddIrConfirmLine = function (values) {
    values = values || {};
    var line = ++Ext.irConfirmLineCount;
    var win = Ext.getCmp('win-frm-irconfirmID');
    var fs = Ext.getCmp("irConfirmLinesFieldsetID");
    if (!win || !fs) {
        return;
    }

    fs.add(new Ext.Panel({
        id: "irConfirmLineRowID[" + line + "]",
        layout: "column",
        border: false,
        bodyStyle: "padding-bottom:4px;",
        items: [
            {
                columnWidth: 0.18, layout: "form", border: false, labelWidth: 90,
                items: [{xtype: "numberfield", id: "chk_line_idID[" + line + "]", name: "chk_line_id[]", fieldLabel: "chk_line_id", anchor: "95%", value: values.chk_line_id || null}]
            },
            {
                columnWidth: 0.22, layout: "form", border: false, labelWidth: 90,
                items: [{xtype: "textfield", id: "c_doc_refLineID[" + line + "]", name: "c_doc_ref[]", fieldLabel: "เลขที่เอกสาร", anchor: "95%", value: values.c_doc_ref || ""}]
            },
            {
                columnWidth: 0.2, layout: "form", border: false, labelWidth: 80,
                items: [{xtype: "datefield", id: "d_doc_dateSubID[" + line + "]", name: "d_doc_dateSub[]", fieldLabel: "วันที่เอกสาร", anchor: "95%", value: values.d_doc_dateSub || ""}]
            },
            {
                columnWidth: 0.25, layout: "form", border: false, labelWidth: 90,
                items: [amtFieldIr("f_period_amtLineID[" + line + "]", "f_period_amt[]", "จำนวนเงิน")]
            },
            {
                columnWidth: 0.15, layout: "form", border: false,
                items: [{
                    xtype: "button",
                    text: "- ลบแถวนี้",
                    handler: function () {
                        fs.remove(Ext.getCmp("irConfirmLineRowID[" + line + "]"));
                        fs.doLayout();
                        win.doLayout();
                    }
                }]
            }
        ]
    }));
    fs.doLayout();
    win.doLayout();
    if (values.f_period_amt) {
        Ext.getCmp("f_period_amtLineID[" + line + "]").setValue(values.f_period_amt);
    }
};

// ================= หน้าต่างรายการที่ "รอยืนยัน" (โหลดสดจาก log ของ ERP) ================= //
// ข้อมูลบันทึกด้วยมือไม่มีอีกต่อไป (ไม่ต้องแอด) - ที่มาของข้อมูลต้องเป็น log การเรียก
// POST /procure/ir จริงจาก ERP (username = erpsendapi) ที่ D:\EIS-ERP\storage\jsonERP\
// เท่านั้น ผู้ใช้แค่ตรวจสอบแล้วกด "ยืนยัน" รับข้อมูลเข้ามาบันทึก
Ext.storePendingErpLog = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "tor/api/List_MedSupIrConfirm.php",
    baseParams: {type: "pending_erp_log"},
    root: "data",
    totalProperty: "totalCount",
    idProperty: "row_key",
    fields: [
        "no", "row_key", "transaction_id", "datetime", "source_file",
        "pr_id", "po_id", "period_id", "chk_id", "c_contract_code",
        "c_creditor_name", "dc_expense_budget_type_name", "f_period_amt",
        "c_arrive_code", "d_checking_date", "i_budget_year", "i_line_count",
        "i_confirmed", "j_data",
    ],
});

function winPendingErpFromLog() {
    var winPending = new Ext.Window({
        id: "win-pendingerpID",
        title: "รายการที่ ERP ยิงเข้ามา (Api จัดซื้อ) - รอยืนยัน",
        modal: true,
        plain: true,
        collapsible: true,
        maximizable: true,
        layout: "fit",
        width: Ext.getCmp("contenterCenter").getWidth() - 60,
        height: Ext.getCmp("contenterCenter").getHeight() - 40,
        items: new Ext.grid.GridPanel({
            id: "gridPendingErpID",
            store: Ext.storePendingErpLog,
            border: true,
            stripeRows: true,
            loadMask: true,
            viewConfig: {emptyText: "ไม่พบรายการที่ ERP ยิงเข้ามา..", deferEmptyText: true},
            columns: [
                new Ext.grid.RowNumberer({header: "ที่", dataIndex: "no", width: 40}),
                {
                    header: "สถานะ", dataIndex: "i_confirmed", width: 90, align: "center",
                    renderer: function (v) {
                        return v ? "<span style='color:#888'>ยืนยันแล้ว</span>" : "<b style='color:#c00'>รอยืนยัน</b>";
                    }
                },
                {header: "วันที่/เวลาที่ ERP ส่งมา", dataIndex: "datetime", width: 140, align: "center"},
                {header: "เลขที่สัญญา", dataIndex: "c_contract_code", width: 110},
                {header: "pr_id", dataIndex: "pr_id", width: 60, align: "center"},
                {header: "po_id", dataIndex: "po_id", width: 60, align: "center"},
                {header: "chk_id", dataIndex: "chk_id", width: 60, align: "center"},
                {header: "ผู้ขาย", dataIndex: "c_creditor_name", width: 160},
                {header: "แหล่งเงิน", dataIndex: "dc_expense_budget_type_name", width: 150},
                {header: "จำนวนเงินรวม", dataIndex: "f_period_amt", width: 100, align: "right"},
                {header: "เลขที่ใบรับของ", dataIndex: "c_arrive_code", width: 120},
                {header: "วันที่ตรวจรับ", dataIndex: "d_checking_date", width: 100, align: "center"},
                {header: "จำนวนรายการย่อย", dataIndex: "i_line_count", width: 90, align: "center"},
                {
                    header: "ยืนยัน", sortable: false, hideable: false, draggable: false, align: "center",
                    id: "confirmPendingErpID", width: 70, dataIndex: "i_confirmed",
                    renderer: function (v) {
                        return v ? "" : '<img src="../images/icons/accept.png" style="cursor:pointer" title="ยืนยันรับข้อมูลรายการนี้"/>';
                    }
                },
            ],
            listeners: {
                afterrender: function (g) {
                    this.on("cellclick", function (grid, rowIndex, columnIndex, e) {
                        if (columnIndex !== grid.getColumnModel().getIndexById("confirmPendingErpID")) {
                            return;
                        }
                        var record = grid.getStore().getAt(rowIndex);
                        if (record.get("i_confirmed")) {
                            return;
                        }
                        Ext.Msg.confirm(
                            "ยืนยัน",
                            "ยืนยันรับข้อมูลรายการนี้จาก ERP เข้าบันทึกใช่หรือไม่? (ระบบจะยังไม่ส่งข้อมูลใดๆ กลับไปยัง API ภายนอก)",
                            function (btn) {
                                if (btn !== "yes") {
                                    return;
                                }
                                Ext.Ajax.request({
                                    url: Ext.url_process,
                                    method: "POST",
                                    params: {
                                        mode: "CONFIRM_FROM_LOG",
                                        transaction_id: record.get("transaction_id"),
                                        datetime: record.get("datetime"),
                                        source_file: record.get("source_file"),
                                        j_data: record.get("j_data"),
                                    },
                                    success: function (response) {
                                        var res = Ext.decode(response.responseText);
                                        if (res.reval === 0) {
                                            Ext.Msg.alert("Success", res.msg, function () {
                                                Ext.storePendingErpLog.reload();
                                                if (Ext.getCmp("tabpanel1")) {
                                                    Ext.getCmp("tabpanel1").getStore().reload();
                                                }
                                            });
                                        } else {
                                            Ext.Msg.alert("Failure", res.msg);
                                        }
                                    },
                                    failure: function () {
                                        Ext.Msg.alert("Failure", "พบข้อผิดพลาดในการเชื่อมต่อเครือข่าย");
                                    }
                                });
                            }
                        );
                    }, this);
                }
            },
            tbar: [
                {
                    text: "โหลดข้อมูลใหม่",
                    iconCls: "icon-refresh",
                    handler: function () {
                        Ext.storePendingErpLog.reload();
                    }
                }
            ],
        })
    });
    winPending.show();
    Ext.storePendingErpLog.load();
}

function winMedSupIrConfirm(rec) {
    Ext.ev = rec;
    Ext.irConfirmLineCount = 0;

    var winIr = new Ext.Window({
        id: "win-irconfirmID",
        title: "แก้ไขรายการยืนยัน Api จัดซื้อจาก ERP",
        modal: true,
        plain: true,
        collapsible: true,
        maximizable: true,
        layout: "fit",
        items: new Ext.FormPanel({
            id: "win-frm-irconfirmID",
            url: Ext.url_process,
            autoScroll: true,
            width: Ext.getCmp("contenterCenter").getWidth() - 60,
            height: Ext.getCmp("contenterCenter").getHeight() - 40,
            labelWidth: 170,
            bodyStyle: "padding:5px;",
            items: [
                {xtype: "hidden", name: "mode", id: "modeID", value: "UPDATE"},
                {xtype: "hidden", name: "sp_medsup_ir_confirm_hdr_id", id: "sp_medsup_ir_confirm_hdr_idID"},
                {
                    xtype: "fieldset",
                    title: "อ้างอิงเอกสาร (PR / PO / งวด / ตรวจรับ)",
                    collapsible: true,
                    autoHeight: true,
                    defaults: {anchor: "90%"},
                    items: [
                        {xtype: "numberfield", id: "pr_idID", name: "pr_id", fieldLabel: "pr_id (เลขที่ใบขอซื้อ)"},
                        {xtype: "numberfield", id: "po_idID", name: "po_id", fieldLabel: "po_id (เลขที่ใบสั่งซื้อ)"},
                        {xtype: "numberfield", id: "period_idID", name: "period_id", fieldLabel: "period_id (เลขที่งวดอ้างอิง)"},
                        {xtype: "numberfield", id: "chk_idID", name: "chk_id", fieldLabel: "chk_id (เลขที่ตรวจรับ)"},
                        {xtype: "textfield", id: "c_contract_codeID", name: "c_contract_code", fieldLabel: "เลขที่สัญญา", validator: function (val) { return Ext.isEmpty(val) ? "กรุณากรอกเลขที่สัญญา" : true; }},
                    ]
                },
                {
                    xtype: "fieldset",
                    title: "วันที่/งวด/จำนวนเงินรวม",
                    collapsible: true,
                    autoHeight: true,
                    defaults: {anchor: "90%"},
                    items: [
                        {xtype: "datefield", id: "d_start_dateID", name: "d_start_date", fieldLabel: "วันที่เริ่มสัญญา"},
                        {xtype: "datefield", id: "d_contract_start_dateID", name: "d_contract_start_date", fieldLabel: "วันที่สัญญามีผล"},
                        {xtype: "datefield", id: "d_end_dateID", name: "d_end_date", fieldLabel: "วันที่สิ้นสุดสัญญา"},
                        {xtype: "numberfield", id: "i_periodID", name: "i_period", fieldLabel: "งวดที่ (0 = ไม่ผูกงวด)", value: 0},
                        amtFieldIr("f_period_amt_hdrID", "f_period_amt_hdr", "จำนวนเงินรวม (f_period_amt)"),
                        {xtype: "textfield", id: "c_doc_ref_hdrID", name: "c_doc_ref_hdr", fieldLabel: "เลขที่เอกสารอ้างอิง (ระดับหัว)"},
                    ]
                },
                {
                    xtype: "fieldset",
                    title: "แหล่งเงิน/งบประมาณ",
                    collapsible: true,
                    autoHeight: true,
                    defaults: {anchor: "90%"},
                    items: [
                        {xtype: "numberfield", id: "bg_expense_idID", name: "bg_expense_id", fieldLabel: "รหัสรายการย่อย (bg_expense_id)"},
                        {xtype: "textfield", id: "bg_expense_nameID", name: "bg_expense_name", fieldLabel: "ชื่อรายการย่อย"},
                        {xtype: "numberfield", id: "dc_expense_budget_type_idID", name: "dc_expense_budget_type_id", fieldLabel: "รหัสแหล่งเงิน"},
                        {xtype: "textfield", id: "dc_expense_budget_type_nameID", name: "dc_expense_budget_type_name", fieldLabel: "ชื่อแหล่งเงิน"},
                        {
                            xtype: "combo", id: "i_is_lastCombo", fieldLabel: "ปิดยอด/ไม่คืนเงินคงเหลือ (i_is_last)",
                            hiddenName: "i_is_last", store: new Ext.data.ArrayStore({fields: ["v", "t"], data: [[1, "ใช่ (ปิดยอด)"], [0, "ไม่ (จองครั้งเดียวครบยอด)"]]}),
                            valueField: "v", displayField: "t", mode: "local", triggerAction: "all", forceSelection: true, value: 1
                        },
                        {xtype: "numberfield", id: "i_product_typeID", name: "i_product_type", fieldLabel: "ประเภทสินค้า (i_product_type)", value: 1},
                        {xtype: "textfield", id: "i_budget_yearID", name: "i_budget_year", fieldLabel: "ปีงบประมาณ"},
                        {xtype: "textfield", id: "i_budget_year_overlapID", name: "i_budget_year_overlap", fieldLabel: "ปีงบประมาณกันเหลื่อมปี"},
                    ]
                },
                {
                    xtype: "fieldset",
                    title: "ผู้ขาย/ผู้รับโอนเงิน",
                    collapsible: true,
                    autoHeight: true,
                    defaults: {anchor: "90%"},
                    items: [
                        creditorComboIr("dc_creditor_id", "ผู้ขาย (dc_creditor_id)", "dc_creditor_id", "c_creditor_name", "c_tax_number_imp"),
                        {xtype: "hidden", id: "c_creditor_nameID", name: "c_creditor_name"},
                        {xtype: "hidden", id: "c_tax_number_impID", name: "c_tax_number_imp"},
                        creditorComboIr("dc_creditor_transfer_id", "ผู้รับโอนเงิน (dc_creditor_transfer_id)", "dc_creditor_transfer_id", "c_creditor_transfer_name", "c_creditor_transfer_code"),
                        {xtype: "hidden", id: "c_creditor_transfer_nameID", name: "c_creditor_transfer_name"},
                        {xtype: "hidden", id: "c_creditor_transfer_codeID", name: "c_creditor_transfer_code"},
                        {xtype: "textfield", id: "c_bank_acc_creditorID", name: "c_bank_acc_creditor", fieldLabel: "ธนาคารผู้รับโอนเงิน"},
                    ]
                },
                {
                    xtype: "fieldset",
                    title: "การรับของ/ตรวจรับ",
                    collapsible: true,
                    autoHeight: true,
                    defaults: {anchor: "90%"},
                    items: [
                        {xtype: "textfield", id: "c_arrive_codeID", name: "c_arrive_code", fieldLabel: "เลขที่ใบรับของ"},
                        {xtype: "datefield", id: "d_arrive_dateID", name: "d_arrive_date", fieldLabel: "วันที่รับของ"},
                        {xtype: "datefield", id: "d_checking_dateID", name: "d_checking_date", fieldLabel: "วันที่ตรวจรับ"},
                        {xtype: "textfield", id: "c_reserve_payID", name: "c_reserve_pay", fieldLabel: "i_reserve_pay"},
                        {xtype: "textfield", id: "c_doc_duoID", name: "c_doc_duo", fieldLabel: "i_doc_duo"},
                        {xtype: "textfield", id: "c_overlapID", name: "c_overlap", fieldLabel: "หมายเหตุ/กันเหลื่อมปี (c_overlap)"},
                    ]
                },
                {
                    xtype: "fieldset",
                    id: "irConfirmLinesFieldsetID",
                    title: "รายการย่อย (line_ids) ที่จะส่งพร้อมกัน",
                    collapsible: true,
                    autoHeight: true,
                    items: [],
                },
                {
                    xtype: "button",
                    text: "+ เพิ่มรายการย่อย",
                    iconCls: "icon-add",
                    style: "margin: 5px 0 10px 0;",
                    handler: function () {
                        Ext.fnAddIrConfirmLine();
                    }
                },
            ],
            buttonAlign: "left",
            buttons: [
                {
                    text: "บันทึกการแก้ไข",
                    iconCls: "icon-save",
                    handler: function () {
                        var form = Ext.getCmp('win-frm-irconfirmID').getForm();
                        if (form.isValid()) {
                            Ext.Msg.confirm(
                                "ยืนยัน",
                                "ยืนยันบันทึกการแก้ไขรายการนี้ใช่หรือไม่?",
                                function (btn) {
                                    if (btn !== "yes") {
                                        return;
                                    }
                                    form.submit({
                                        waitMsg: 'Saving Data...',
                                        success: function (form, action) {
                                            Ext.Msg.alert("Success", "<span style='white-space: nowrap;'>" + action.result.msg + "</span>", function () {
                                                Ext.getCmp("tabpanel1").getStore().reload();
                                                Ext.selectRow = null;
                                                Ext.getCmp('win-irconfirmID').destroy();
                                            });
                                        },
                                        failure: function (form, action) {
                                            switch (action.failureType) {
                                                case Ext.form.Action.CLIENT_INVALID:
                                                    Ext.Msg.alert('Failure', 'ข้อมูลใน fields ไม่ถูกต้อง');
                                                    break;
                                                case Ext.form.Action.CONNECT_FAILURE:
                                                    Ext.Msg.alert('Failure', 'พบข้อผิดพลาดในการเชื่อมต่อเครือข่าย');
                                                    break;
                                                case Ext.form.Action.SERVER_INVALID:
                                                    Ext.Msg.alert('Failure', action.result.msg);
                                            }
                                        }
                                    });
                                }
                            );
                        }
                    }
                },
                {
                    text: Ext.GLOBAL_BU_BACK_TH,
                    iconCls: "icon-clear",
                    handler: function () {
                        Ext.getCmp("win-irconfirmID").destroy();
                    }
                }
            ],
            listeners: {
                afterrender: function () {
                    var r = Ext.selectRow;
                    if (!r) {
                        return;
                    }
                    Ext.getCmp("sp_medsup_ir_confirm_hdr_idID").setValue(r.get("sp_medsup_ir_confirm_hdr_id"));
                    Ext.getCmp("pr_idID").setValue(r.get("pr_id"));
                    Ext.getCmp("po_idID").setValue(r.get("po_id"));
                    Ext.getCmp("period_idID").setValue(r.get("period_id"));
                    Ext.getCmp("chk_idID").setValue(r.get("chk_id"));
                    Ext.getCmp("c_contract_codeID").setValue(r.get("c_contract_code"));
                    Ext.getCmp("d_start_dateID").setValue(r.get("d_start_date"));
                    Ext.getCmp("d_contract_start_dateID").setValue(r.get("d_contract_start_date"));
                    Ext.getCmp("d_end_dateID").setValue(r.get("d_end_date"));
                    Ext.getCmp("i_periodID").setValue(r.get("i_period"));
                    Ext.getCmp("f_period_amt_hdrID").setValue(r.get("f_period_amt"));
                    Ext.getCmp("c_doc_ref_hdrID").setValue(r.get("c_doc_ref"));
                    Ext.getCmp("bg_expense_idID").setValue(r.get("bg_expense_id"));
                    Ext.getCmp("bg_expense_nameID").setValue(r.get("bg_expense_name"));
                    Ext.getCmp("dc_expense_budget_type_idID").setValue(r.get("dc_expense_budget_type_id"));
                    Ext.getCmp("dc_expense_budget_type_nameID").setValue(r.get("dc_expense_budget_type_name"));
                    Ext.getCmp("i_is_lastCombo").setValue(r.get("i_is_last"));
                    Ext.getCmp("i_product_typeID").setValue(r.get("i_product_type"));
                    Ext.getCmp("i_budget_yearID").setValue(r.get("i_budget_year"));
                    Ext.getCmp("i_budget_year_overlapID").setValue(r.get("i_budget_year_overlap"));
                    if (r.get("dc_creditor_id")) {
                        Ext.getCmp("dc_creditor_idComboID").setValue(r.get("dc_creditor_id"));
                        Ext.getCmp("dc_creditor_idComboID").setRawValue(r.get("c_creditor_name"));
                    }
                    Ext.getCmp("c_creditor_nameID").setValue(r.get("c_creditor_name"));
                    Ext.getCmp("c_tax_number_impID").setValue(r.get("c_tax_number_imp"));
                    if (r.get("dc_creditor_transfer_id")) {
                        Ext.getCmp("dc_creditor_transfer_idComboID").setValue(r.get("dc_creditor_transfer_id"));
                        Ext.getCmp("dc_creditor_transfer_idComboID").setRawValue(r.get("c_creditor_transfer_name"));
                    }
                    Ext.getCmp("c_creditor_transfer_nameID").setValue(r.get("c_creditor_transfer_name"));
                    Ext.getCmp("c_creditor_transfer_codeID").setValue(r.get("c_creditor_transfer_code"));
                    Ext.getCmp("c_bank_acc_creditorID").setValue(r.get("c_bank_acc_creditor"));
                    Ext.getCmp("c_arrive_codeID").setValue(r.get("c_arrive_code"));
                    Ext.getCmp("d_arrive_dateID").setValue(r.get("d_arrive_date"));
                    Ext.getCmp("d_checking_dateID").setValue(r.get("d_checking_date"));
                    Ext.getCmp("c_reserve_payID").setValue(r.get("c_reserve_pay"));
                    Ext.getCmp("c_doc_duoID").setValue(r.get("c_doc_duo"));
                    Ext.getCmp("c_overlapID").setValue(r.get("c_overlap"));

                    Ext.Ajax.request({
                        url: "tor/api/List_MedSupIrConfirm.php",
                        method: "GET",
                        params: {type: "medsup_ir_confirm_dtl", sp_medsup_ir_confirm_hdr_id: r.get("sp_medsup_ir_confirm_hdr_id")},
                        success: function (response) {
                            var res = Ext.decode(response.responseText);
                            var lines = res.data || [];
                            if (lines.length === 0) {
                                Ext.fnAddIrConfirmLine();
                            } else {
                                lines.forEach(function (ln) {
                                    Ext.fnAddIrConfirmLine(ln);
                                });
                            }
                        }
                    });
                }
            }
        })
    }).show();
}

Ext.AppUx = function (app, menu) {
    Ext.user_right_add = user_right_add;
    Ext.user_right_edit = user_right_edit;
    Ext.user_right_delete = user_right_delete;
    Ext.title = Ext.menu_name + " " + Ext.menu_code;
    Ext.selectRow = [];

    Ext.storeMedSupIrConfirmList = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "tor/api/List_MedSupIrConfirm.php",
        baseParams: {type: "medsup_ir_confirm"},
        root: "data",
        idProperty: "id",
        totalProperty: "totalCount",
        fields: [
            "no", "id", "sp_medsup_ir_confirm_hdr_id", "pr_id", "po_id", "period_id", "chk_id",
            "c_contract_code", "d_start_date", "d_contract_start_date", "d_end_date", "i_period", "f_period_amt",
            "bg_expense_id", "bg_expense_name", "dc_expense_budget_type_id", "dc_expense_budget_type_name",
            "i_is_last", "i_product_type", "dc_cost_id", "c_tax_number_imp",
            "dc_creditor_id", "c_creditor_name", "c_creditor_transfer_code", "dc_creditor_transfer_id", "c_creditor_transfer_name",
            "c_bank_acc_creditor", "i_budget_year", "i_budget_year_overlap",
            "c_arrive_code", "d_arrive_date", "d_checking_date", "c_reserve_pay", "c_doc_duo", "c_doc_ref", "c_overlap",
            "c_ap_send_status", "d_create", "c_create_name",
        ],
    });

    Ext.loadStore = function () {};

    function cellClick(grid, rowIndex, columnIndex, e) {
        var record = grid.getStore().getAt(rowIndex);
        Ext.selectRow = record;
        if (columnIndex === grid.getColumnModel().getIndexById("editIrConfirmID")) {
            winMedSupIrConfirm("edit");
        } else if (columnIndex === grid.getColumnModel().getIndexById("delIrConfirmID")) {
            Ext.MessageBox.show({
                title: "ยืนยัน",
                msg: "คุณต้องการที่จะลบรายการที่เลือกนี้ใช่หรือไม่ ?",
                buttons: Ext.MessageBox.OKCANCEL,
                icon: Ext.MessageBox.WARNING,
                id: 'row-del-irconfirm',
                fn: function (btn) {
                    if (btn === "ok") {
                        Ext.Ajax.request({
                            url: Ext.url_process,
                            method: "POST",
                            params: {mode: "DELETE", sp_medsup_ir_confirm_hdr_id: record.get('sp_medsup_ir_confirm_hdr_id')},
                            success: function () {
                                Ext.getCmp("tabpanel1").getStore().reload();
                                Ext.selectRow = null;
                                Ext.getCmp('row-del-irconfirm').destroy();
                            }
                        });
                    }
                }
            });
        }
    }

    var MenuButton = function () {
        var menuList = new Ext.menu.Menu({id: "mainMenu", border: false});
        var tb = new Ext.Toolbar({text: " รายการเมนู ", border: false, iconCls: "menu", menu: menuList});
        tb.add({text: " รายการเมนู ", iconCls: "bmenu", border: false, menu: menuList});
        menuList.addSeparator();
        menuList.add({text: "ค้นหาข้อมูล", icon: "../images/icons/book_magnify.png"})
            .on("click", function () {
                Ext.Msg.prompt("ค้นหา", "เลขที่สัญญา", function (btn, text) {
                    if (btn === "ok") {
                        Ext.storeMedSupIrConfirmList.setBaseParam("act", "SEARCH");
                        Ext.storeMedSupIrConfirmList.setBaseParam("c_contract_code", text);
                        Ext.storeMedSupIrConfirmList.load();
                    }
                });
            });
        menuList.add({text: "โหลดรายการรอยืนยันจาก ERP", icon: "../images/icons/book_go.png"})
            .on("click", function () {
                winPendingErpFromLog();
            });
        tb.doLayout();
        return tb;
    };

    Ext.extend(
        (gridMain = function () {
            var colmnn = [
                new Ext.grid.RowNumberer({header: "ที่", dataIndex: "no", width: 40}),
                {header: "รหัส", dataIndex: "id", hidden: true},
                {header: "เลขที่สัญญา", dataIndex: "c_contract_code", width: 130},
                {header: "pr_id", dataIndex: "pr_id", width: 70, align: "center"},
                {header: "po_id", dataIndex: "po_id", width: 70, align: "center"},
                {header: "chk_id", dataIndex: "chk_id", width: 70, align: "center"},
                {header: "ผู้ขาย", dataIndex: "c_creditor_name", width: 180},
                {header: "แหล่งเงิน", dataIndex: "dc_expense_budget_type_name", width: 160},
                {header: "จำนวนเงินรวม", dataIndex: "f_period_amt", width: 110, align: "right"},
                {header: "เลขที่ใบรับของ", dataIndex: "c_arrive_code", width: 120},
                {header: "วันที่ตรวจรับ", dataIndex: "d_checking_date", width: 100, align: "center"},
                {header: "ปีงบประมาณ", dataIndex: "i_budget_year", width: 90, align: "center"},
                {header: "สถานะ", dataIndex: "c_ap_send_status", width: 100, align: "center"},
                {header: "ผู้บันทึก", dataIndex: "c_create_name", width: 140},
                {header: "วันที่บันทึก", dataIndex: "d_create", width: 100, align: "center"},
                {
                    header: "แก้ไข", sortable: false, hideable: false, draggable: false, align: "center",
                    id: "editIrConfirmID", width: 40, dataIndex: "id",
                    renderer: function () {
                        return '<img src="../images/icons/document_edit.gif" style="cursor:pointer"/>';
                    }
                },
                {
                    header: "ลบ", sortable: false, hideable: false, draggable: false, align: "center",
                    id: "delIrConfirmID", width: 35, dataIndex: "id",
                    renderer: function () {
                        return '<img src="../images/icons/table_delete.png" style="cursor:pointer"/>';
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
                layout: "fit",
                viewConfig: {emptyText: "ไม่มีข้อมูล..", deferEmptyText: true},
                listeners: {
                    afterrender: function (g) {
                        this.on("cellclick", cellClick, this);
                    },
                },
                store: Ext.storeMedSupIrConfirmList,
                tbar: MenuButton(),
                columns: colmnn,
                bbar: new Ext.PagingToolbar({
                    pageSize: 20,
                    store: Ext.storeMedSupIrConfirmList,
                    displayInfo: true,
                    displayMsg: "Displaying topics {0} - {1} of {2}",
                }),
            });
        }),
        Ext.grid.GridPanel,
        {}
    );
};
