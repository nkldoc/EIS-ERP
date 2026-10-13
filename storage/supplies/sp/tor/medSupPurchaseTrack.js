/* global Ext, user_right_add, user_right_edit, user_right_delete */

Ext.url_process = './tor/api/mnMedSupPurchaseTrackController.php';

Ext.storeContractLookupTrack = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "tor/api/List_MedSupPurchaseTrack.php",
    baseParams: {type: "lookup_contract"},
    root: "data",
    idProperty: "sp_tor_contract_id",
    fields: ["sp_tor_contract_id", "c_contract_code", "c_name", "i_yyyy", "c_po_no", "d_po_date", "d_start_date", "d_end_date", "dc_creditor_id", "c_creditor_name", "c_creditor_tax_no"],
});

Ext.storePeriodLookupTrack = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "tor/api/List_MedSupPurchaseTrack.php",
    baseParams: {type: "lookup_period"},
    root: "data",
    idProperty: "sp_tor_hdr_period_id",
    fields: ["sp_tor_hdr_period_id", "i_period", "sp_tor_contract_id"],
});

// รายการบิล (จากเมนู ST00092) ของสัญญา/งวดที่เลือก ไว้ให้ติ๊กเลือกผูกกับ
// รายการติดตามจัดซื้อนี้ - นี่คือจุดที่เชื่อม ST00093 เข้ากับ ST00092 ตามไฟล์ออกแบบ
Ext.storeBillPicker = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: false,
    url: "tor/api/List_MedSupPurchaseTrack.php",
    baseParams: {type: "lookup_bills"},
    root: "data",
    idProperty: "sp_tor_period_bill_id",
    fields: ["sp_tor_period_bill_id", "c_doc_ref", "d_doc_date", "f_amt", "c_detail"],
});

Ext.fnLoadBillPicker = function (contractId, periodId, selectedIds) {
    selectedIds = selectedIds || [];
    var fs = Ext.getCmp("billPickerFieldsetID");
    if (!fs) {
        return;
    }
    if (!contractId || !periodId) {
        fs.removeAll();
        fs.add({xtype: "displayfield", value: "กรุณาเลือกเลขที่สัญญาและงวดที่ด้านบนก่อน"});
        fs.doLayout();
        return;
    }
    Ext.storeBillPicker.setBaseParam("sp_tor_contract_id", contractId);
    Ext.storeBillPicker.setBaseParam("sp_tor_hdr_period_id", periodId);
    Ext.storeBillPicker.load({
        callback: function (records, operation, success) {
            fs.removeAll();
            if (!success || records.length === 0) {
                fs.add({xtype: "displayfield", value: "ไม่พบรายการบิลของสัญญา/งวดนี้ (ต้องบันทึกที่เมนู \"บันทึกรายละเอียดในสัญญา (เวชภัณฑ์)\" ก่อน)"});
            } else {
                records.forEach(function (r) {
                    fs.add({
                        xtype: "checkbox",
                        name: "bill_ids[]",
                        inputValue: r.get("sp_tor_period_bill_id"),
                        checked: selectedIds.indexOf(r.get("sp_tor_period_bill_id")) !== -1,
                        boxLabel: r.get("c_doc_ref") + " | " + r.get("d_doc_date") + " | " + r.get("f_amt") + " บาท | " + r.get("c_detail"),
                    });
                });
            }
            fs.doLayout();
            if (Ext.getCmp("win-frm-medsuptrackID")) {
                Ext.getCmp("win-frm-medsuptrackID").doLayout();
            }
        }
    });
};

function amtField(id, name, label) {
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
            change: function () {
                this.fn();
            },
            blur: function () {
                this.fn();
            },
            afterrender: function () {
                this.fn();
            }
        }
    };
}

function winMedSupPurchaseTrack(rec) {
    Ext.ev = rec;

    var comboContractTrack = new Ext.form.ComboBox({
        id: "sp_tor_contract_idComboID",
        fieldLabel: "เลขที่สัญญา",
        anchor: "90%",
        store: Ext.storeContractLookupTrack,
        valueField: "sp_tor_contract_id",
        displayField: "c_contract_code",
        hiddenName: "sp_tor_contract_id",
        name: "c_contract_code_display",
        mode: "remote",
        minChars: 1,
        queryParam: "query",
        triggerAction: "all",
        forceSelection: true,
        typeAhead: false,
        emptyText: "พิมพ์เพื่อค้นหาเลขที่สัญญา...",
        validator: function (val) {
            return Ext.isEmpty(val) ? "กรุณาเลือกสัญญา" : true;
        },
        listeners: {
            select: function (combo, record) {
                Ext.getCmp("c_contract_codeID").setValue(record.get("c_contract_code"));
                Ext.getCmp("sp_tor_hdr_period_idComboID").clearValue();
                Ext.getCmp("i_periodID").setValue(null);
                Ext.storePeriodLookupTrack.setBaseParam("sp_tor_contract_id", record.get("sp_tor_contract_id"));
                Ext.storePeriodLookupTrack.load();
                Ext.fnLoadBillPicker(null, null);

                // ดึง PO/ผู้ขาย/วันที่เริ่ม-สิ้นสุดสัญญามาแสดง (ย้ายมาจากส่วน "3)
                // ใบสั่งซื้อและผู้ขาย" เดิม ให้ดึงจากสัญญาโดยตรง ไม่ต้องคีย์ซ้ำ) -
                // ต้อง set ทั้ง displayfield (โชว์ผู้ใช้เห็น) และ hidden field (ค่าที่จะ submit จริง)
                Ext.getCmp("d_start_dateID").setValue(record.get("d_start_date"));
                Ext.getCmp("d_end_dateID").setValue(record.get("d_end_date"));
                Ext.getCmp("c_po_noID").setValue(record.get("c_po_no"));
                Ext.getCmp("c_creditor_nameID").setValue(record.get("c_creditor_name"));
                Ext.getCmp("c_creditor_tax_noID").setValue(record.get("c_creditor_tax_no"));
                Ext.getCmp("dc_creditor_idID").setValue(record.get("dc_creditor_id"));
                Ext.getCmp("c_po_no_hiddenID").setValue(record.get("c_po_no"));
                Ext.getCmp("c_creditor_name_hiddenID").setValue(record.get("c_creditor_name"));
                Ext.getCmp("c_creditor_tax_no_hiddenID").setValue(record.get("c_creditor_tax_no"));
            },
            beforequery: function (q) {
                q.query = q.query || '';
                q.forceAll = true;
            }
        }
    });

    var comboPeriodTrack = new Ext.form.ComboBox({
        id: "sp_tor_hdr_period_idComboID",
        fieldLabel: "งวดที่ของสัญญา",
        anchor: "90%",
        store: Ext.storePeriodLookupTrack,
        valueField: "sp_tor_hdr_period_id",
        displayField: "i_period",
        hiddenName: "sp_tor_hdr_period_id",
        name: "i_period_display",
        mode: "local",
        triggerAction: "all",
        forceSelection: true,
        typeAhead: false,
        emptyText: "เลือกงวดที่...",
        validator: function (val) {
            return Ext.isEmpty(val) ? "กรุณาเลือกงวดที่ของสัญญา" : true;
        },
        listeners: {
            select: function (combo, record) {
                Ext.getCmp("i_periodID").setValue(record.get("i_period"));
                Ext.fnLoadBillPicker(record.get("sp_tor_contract_id"), record.get("sp_tor_hdr_period_id"), []);
            }
        }
    });

    var winTrack = new Ext.Window({
        id: "win-medsuptrackID",
        title: "บันทึกติดตามการจัดซื้อ (เวชภัณฑ์)",
        modal: true,
        plain: true,
        collapsible: true,
        maximizable: true,
        layout: "fit",
        items: new Ext.FormPanel({
            id: "win-frm-medsuptrackID",
            url: Ext.url_process,
            autoScroll: true,
            width: Ext.getCmp("contenterCenter").getWidth() - 60,
            height: Ext.getCmp("contenterCenter").getHeight() - 40,
            labelWidth: 170,
            bodyStyle: "padding:5px;",
            items: [
                {
                    xtype: "hidden",
                    name: "mode",
                    id: "modeID",
                    value: (Ext.ev == 'add' ? "ADD" : "UPDATE"),
                },
                {
                    xtype: "hidden",
                    name: "sp_medsup_purchase_track_id",
                    id: "sp_medsup_purchase_track_idID",
                },
                {
                    xtype: "hidden",
                    name: "c_contract_code",
                    id: "c_contract_codeID",
                },
                {
                    xtype: "hidden",
                    name: "i_period",
                    id: "i_periodID",
                },
                {
                    xtype: "fieldset",
                    title: "สัญญา/งวดที่เกี่ยวข้อง (ผูกกับเมนูบันทึกรายละเอียดในสัญญา เวชภัณฑ์)",
                    collapsible: true,
                    autoHeight: true,
                    defaults: {anchor: "90%"},
                    items: [
                        comboContractTrack,
                        comboPeriodTrack,
                        {xtype: "displayfield", id: "d_start_dateID", fieldLabel: "วันที่เริ่มสัญญา"},
                        {xtype: "displayfield", id: "d_end_dateID", fieldLabel: "วันที่สิ้นสุดสัญญา"},
                        {xtype: "displayfield", id: "c_po_noID", fieldLabel: "เลข PO"},
                        {xtype: "displayfield", id: "c_creditor_nameID", fieldLabel: "ผู้ขาย/ผู้รับจ้าง"},
                        {xtype: "displayfield", id: "c_creditor_tax_noID", fieldLabel: "เลขประจำตัวผู้เสียภาษี"},
                        {xtype: "hidden", id: "dc_creditor_idID", name: "dc_creditor_id"},
                        {xtype: "hidden", id: "c_po_no_hiddenID", name: "c_po_no"},
                        {xtype: "hidden", id: "c_creditor_name_hiddenID", name: "c_creditor_name"},
                        {xtype: "hidden", id: "c_creditor_tax_no_hiddenID", name: "c_creditor_tax_no"},
                    ]
                },
                {
                    xtype: "fieldset",
                    title: "1) ใบขอซื้อ",
                    collapsible: true,
                    autoHeight: true,
                    defaults: {anchor: "90%"},
                    items: [
                        {xtype: "textfield", id: "c_user_nameID", name: "c_user_name", fieldLabel: "ผู้ใช้"},
                        {xtype: "textfield", id: "c_pr_noID", name: "c_pr_no", fieldLabel: "เลขรายงานขอซื้อ"},
                        {xtype: "datefield", id: "d_pr_dateID", name: "d_pr_date", fieldLabel: "วันที่"},
                        amtField("f_pr_amtID", "f_pr_amt", "วงเงินขอใช้"),
                        amtField("f_remain_allID", "f_remain_all", "คงเหลือทั้งหมด"),
                    ]
                },
                {
                    xtype: "fieldset",
                    title: "2) การอนุมัติ",
                    collapsible: true,
                    autoHeight: true,
                    defaults: {anchor: "90%"},
                    items: [
                        {xtype: "textfield", id: "c_approve_noID", name: "c_approve_no", fieldLabel: "เลขที่อนุมัติ"},
                        {xtype: "datefield", id: "d_approve_dateID", name: "d_approve_date", fieldLabel: "วันที่อนุมัติ"},
                    ]
                },
                {
                    xtype: "fieldset",
                    title: "3) รับของ/ตรวจรับ (PO/ผู้ขาย/เลขประจำตัวผู้เสียภาษี ดูได้ที่กล่อง \"สัญญา/งวดที่เกี่ยวข้อง\" ด้านบน)",
                    collapsible: true,
                    autoHeight: true,
                    defaults: {anchor: "90%"},
                    items: [
                        {xtype: "datefield", id: "d_due_dateID", name: "d_due_date", fieldLabel: "วันครบกำหนดส่งของ"},
                        {xtype: "datefield", id: "d_receive_dateID", name: "d_receive_date", fieldLabel: "วันที่ตรวจรับ"},
                    ]
                },
                {
                    xtype: "fieldset",
                    title: "4) การเบิกจ่าย",
                    collapsible: true,
                    autoHeight: true,
                    defaults: {anchor: "90%"},
                    items: [
                        {xtype: "datefield", id: "d_withdraw_send_dateID", name: "d_withdraw_send_date", fieldLabel: "วันที่ส่งเบิก"},
                        {xtype: "textfield", id: "c_withdraw_noID", name: "c_withdraw_no", fieldLabel: "เลขที่ขอเบิก", emptyText: "คั่นหลายเลขด้วย / เช่น D001/D002"},
                        amtField("f_withdraw_amtID", "f_withdraw_amt", "วงเงินขอเบิก"),
                        amtField("f_remain_after_withdrawID", "f_remain_after_withdraw", "เงินเหลือจากขอใช้"),
                    ]
                },
                {
                    xtype: "fieldset",
                    title: "5) ข้อมูลอ้างอิงเพิ่มเติม",
                    collapsible: true,
                    autoHeight: true,
                    defaults: {anchor: "90%"},
                    items: [
                        {xtype: "textfield", id: "c_reserve_noID", name: "c_reserve_no", fieldLabel: "เลขกันเงิน"},
                        {xtype: "numberfield", id: "i_working_dayID", name: "i_working_day", fieldLabel: "ระยะเวลาดำเนินการ (วันทำการ)"},
                        {xtype: "textfield", id: "c_project_noID", name: "c_project_no", fieldLabel: "เลขโครงการ"},
                        {xtype: "textfield", id: "c_item_nameID", name: "c_item_name", fieldLabel: "ชื่อรายการ"},
                    ]
                },
                {
                    xtype: "fieldset",
                    id: "billPickerFieldsetID",
                    title: "เลขที่บิล (ติ๊กเลือกจากรายการที่บันทึกไว้ในเมนู \"บันทึกรายละเอียดในสัญญา (เวชภัณฑ์)\")",
                    collapsible: true,
                    autoHeight: true,
                    items: [
                        {xtype: "displayfield", value: "กรุณาเลือกเลขที่สัญญาและงวดที่ด้านบนก่อน"}
                    ]
                },
            ],
            buttonAlign: "left",
            buttons: [
                {
                    text: "บันทึกรายการ",
                    iconCls: "icon-save",
                    handler: function () {
                        var form = Ext.getCmp('win-frm-medsuptrackID').getForm();
                        if (form.isValid()) {
                            form.submit({
                                waitMsg: 'Saving Data...',
                                success: function (form, action) {
                                    Ext.Msg.alert("Success", "<span style='white-space: nowrap;'>" + action.result.msg + "</span>", function () {
                                        Ext.getCmp("tabpanel1").getStore().reload();
                                        Ext.selectRow = null;
                                        Ext.getCmp('win-medsuptrackID').destroy();
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
                    }
                },
                {
                    text: Ext.GLOBAL_BU_BACK_TH,
                    iconCls: "icon-clear",
                    handler: function () {
                        Ext.getCmp("win-medsuptrackID").destroy();
                    }
                }
            ],
            listeners: {
                afterrender: function () {
                    if (Ext.ev == "add") {
                        Ext.fnLoadBillPicker(null, null);
                    } else if (Ext.selectRow) {
                        var r = Ext.selectRow;
                        Ext.getCmp("sp_medsup_purchase_track_idID").setValue(r.get("sp_medsup_purchase_track_id"));
                        if (r.get("sp_tor_contract_id")) {
                            Ext.getCmp("sp_tor_contract_idComboID").setValue(r.get("sp_tor_contract_id"));
                            Ext.getCmp("sp_tor_contract_idComboID").setRawValue(r.get("c_contract_code"));
                        }
                        Ext.getCmp("c_contract_codeID").setValue(r.get("c_contract_code"));
                        if (r.get("i_period")) {
                            Ext.getCmp("sp_tor_hdr_period_idComboID").setValue(r.get("i_period"));
                        }
                        Ext.getCmp("i_periodID").setValue(r.get("i_period"));

                        if (r.get("sp_tor_contract_id") && r.get("sp_tor_hdr_period_id")) {
                            Ext.storeSelectedBillsTrack = new Ext.data.JsonStore({
                                autoDestroy: false,
                                url: "tor/api/List_MedSupPurchaseTrack.php",
                                baseParams: {type: "medsup_purchase_track_bills_dtl", sp_medsup_purchase_track_id: r.get("sp_medsup_purchase_track_id")},
                                root: "data",
                                fields: ["sp_tor_period_bill_id"],
                            });
                            Ext.storeSelectedBillsTrack.load({
                                callback: function (records) {
                                    var selectedIds = records.map(function (rec) {
                                        return rec.get("sp_tor_period_bill_id");
                                    });
                                    Ext.fnLoadBillPicker(r.get("sp_tor_contract_id"), r.get("sp_tor_hdr_period_id"), selectedIds);
                                }
                            });
                        }

                        Ext.getCmp("c_user_nameID").setValue(r.get("c_user_name"));
                        Ext.getCmp("c_pr_noID").setValue(r.get("c_pr_no"));
                        Ext.getCmp("d_pr_dateID").setValue(r.get("d_pr_date"));
                        Ext.getCmp("f_pr_amtID").setValue(r.get("f_pr_amt"));
                        Ext.getCmp("f_remain_allID").setValue(r.get("f_remain_all"));
                        Ext.getCmp("c_approve_noID").setValue(r.get("c_approve_no"));
                        Ext.getCmp("d_approve_dateID").setValue(r.get("d_approve_date"));
                        // PO/ผู้ขาย/เลขประจำตัวผู้เสียภาษี/วันที่เริ่ม-สิ้นสุดสัญญา ดึงจากข้อมูล
                        // สัญญาปัจจุบันเสมอ (ไม่ใช่ค่าที่เคยบันทึกไว้ตอนนั้น) เหมือน ST00092
                        Ext.getCmp("c_po_noID").setValue(r.get("c_po_no"));
                        Ext.getCmp("c_creditor_nameID").setValue(r.get("c_creditor_name"));
                        Ext.getCmp("c_creditor_tax_noID").setValue(r.get("c_creditor_tax_no"));
                        Ext.getCmp("dc_creditor_idID").setValue(r.get("dc_creditor_id"));
                        Ext.getCmp("c_po_no_hiddenID").setValue(r.get("c_po_no"));
                        Ext.getCmp("c_creditor_name_hiddenID").setValue(r.get("c_creditor_name"));
                        Ext.getCmp("c_creditor_tax_no_hiddenID").setValue(r.get("c_creditor_tax_no"));
                        if (r.get("c_contract_code")) {
                            Ext.Ajax.request({
                                url: "tor/api/List_MedSupPurchaseTrack.php",
                                method: "GET",
                                params: {type: "lookup_contract", query: r.get("c_contract_code")},
                                success: function (response) {
                                    var res = Ext.decode(response.responseText);
                                    var rec = (res.data && res.data.length) ? res.data[0] : null;
                                    if (rec) {
                                        Ext.getCmp("d_start_dateID").setValue(rec.d_start_date);
                                        Ext.getCmp("d_end_dateID").setValue(rec.d_end_date);
                                    }
                                }
                            });
                        }
                        Ext.getCmp("d_due_dateID").setValue(r.get("d_due_date"));
                        Ext.getCmp("d_receive_dateID").setValue(r.get("d_receive_date"));
                        Ext.getCmp("d_withdraw_send_dateID").setValue(r.get("d_withdraw_send_date"));
                        Ext.getCmp("c_withdraw_noID").setValue(r.get("c_withdraw_no"));
                        Ext.getCmp("f_withdraw_amtID").setValue(r.get("f_withdraw_amt"));
                        Ext.getCmp("f_remain_after_withdrawID").setValue(r.get("f_remain_after_withdraw"));
                        Ext.getCmp("c_reserve_noID").setValue(r.get("c_reserve_no"));
                        Ext.getCmp("i_working_dayID").setValue(r.get("i_working_day"));
                        Ext.getCmp("c_project_noID").setValue(r.get("c_project_no"));
                        Ext.getCmp("c_item_nameID").setValue(r.get("c_item_name"));
                    }
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

    Ext.storeMedSupTrackList = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "tor/api/List_MedSupPurchaseTrack.php",
        baseParams: {type: "medsup_purchase_track"},
        root: "data",
        idProperty: "id",
        totalProperty: "totalCount",
        fields: [
            "no", "id", "sp_medsup_purchase_track_id", "sp_tor_contract_id", "sp_tor_hdr_period_id", "c_contract_code", "i_period",
            "c_user_name", "c_pr_no", "d_pr_date", "f_pr_amt", "f_remain_all",
            "c_approve_no", "d_approve_date", "c_po_no", "d_po_date", "dc_creditor_id", "c_creditor_name", "c_creditor_tax_no",
            "d_due_date", "d_receive_date", "d_withdraw_send_date", "c_withdraw_no", "f_withdraw_amt", "f_remain_after_withdraw",
            "c_reserve_no", "i_working_day", "c_project_no", "c_bill_no", "c_item_name", "d_create", "c_create_name",
        ],
    });

    Ext.loadStore = function () {};

    function cellClick(grid, rowIndex, columnIndex, e) {
        var record = grid.getStore().getAt(rowIndex);
        Ext.selectRow = record;
        if (columnIndex === grid.getColumnModel().getIndexById("editTrackID")) {
            winMedSupPurchaseTrack("edit");
        } else if (columnIndex === grid.getColumnModel().getIndexById("delTrackID")) {
            Ext.MessageBox.show({
                title: "ยืนยัน",
                msg: "คุณต้องการที่จะลบรายการที่เลือกนี้ใช่หรือไม่ ?",
                buttons: Ext.MessageBox.OKCANCEL,
                icon: Ext.MessageBox.WARNING,
                id: 'row-del-track',
                fn: function (btn) {
                    if (btn === "ok") {
                        Ext.Ajax.request({
                            url: Ext.url_process,
                            method: "POST",
                            params: {mode: "DELETE", sp_medsup_purchase_track_id: record.get('sp_medsup_purchase_track_id')},
                            success: function () {
                                Ext.getCmp("tabpanel1").getStore().reload();
                                Ext.selectRow = null;
                                Ext.getCmp('row-del-track').destroy();
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
                Ext.Msg.prompt("ค้นหา", "เลขรายงานขอซื้อ", function (btn, text) {
                    if (btn === "ok") {
                        Ext.storeMedSupTrackList.setBaseParam("act", "SEARCH");
                        Ext.storeMedSupTrackList.setBaseParam("c_pr_no", text);
                        Ext.storeMedSupTrackList.load();
                    }
                });
            });
        menuList.add({text: "เพิ่มรายการบันทึกติดตามการจัดซื้อ (เวชภัณฑ์)", icon: "../images/icons/add.png"})
            .on("click", function () {
                winMedSupPurchaseTrack("add");
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
                {header: "งวดที่", dataIndex: "i_period", width: 55, align: "center"},
                {header: "เลขรายงานขอซื้อ", dataIndex: "c_pr_no", width: 110},
                {header: "วันที่", dataIndex: "d_pr_date", width: 90, align: "center"},
                {header: "เลขที่อนุมัติ", dataIndex: "c_approve_no", width: 100},
                {header: "PO", dataIndex: "c_po_no", width: 100},
                {header: "ผู้ขาย", dataIndex: "c_creditor_name", width: 180},
                {header: "วันครบกำหนดส่งของ", dataIndex: "d_due_date", width: 110, align: "center"},
                {header: "เลขที่บิล", dataIndex: "c_bill_no", width: 140},
                {header: "เลขที่ขอเบิก", dataIndex: "c_withdraw_no", width: 140},
                {header: "วงเงินขอเบิก", dataIndex: "f_withdraw_amt", width: 110, align: "right"},
                {header: "ชื่อรายการ", dataIndex: "c_item_name", width: 200},
                {header: "ผู้บันทึก", dataIndex: "c_create_name", width: 140},
                {header: "วันที่บันทึก", dataIndex: "d_create", width: 100, align: "center"},
                {
                    header: "แก้ไข", sortable: false, hideable: false, draggable: false, align: "center",
                    id: "editTrackID", width: 40, dataIndex: "id",
                    renderer: function () {
                        return '<img src="../images/icons/document_edit.gif" style="cursor:pointer"/>';
                    }
                },
                {
                    header: "ลบ", sortable: false, hideable: false, draggable: false, align: "center",
                    id: "delTrackID", width: 35, dataIndex: "id",
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
                store: Ext.storeMedSupTrackList,
                tbar: MenuButton(),
                columns: colmnn,
                bbar: new Ext.PagingToolbar({
                    pageSize: 20,
                    store: Ext.storeMedSupTrackList,
                    displayInfo: true,
                    displayMsg: "Displaying topics {0} - {1} of {2}",
                }),
            });
        }),
        Ext.grid.GridPanel,
        {}
    );
};
