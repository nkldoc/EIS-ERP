/* global Ext */
Ext.ns('Ext.receiveValidation');

Ext.receiveValidation.openWindow = function (context, onContinue) {
    var api = 'tor/receive-validation/api/', encoded = Ext.encode(context || {});
    Ext.currentExpenseBudgetTypeId = context ? context.dc_expense_budget_type_id : null;
    var validationFailureHandled = false;
    var store = new Ext.data.JsonStore({url: api + 'validateReceive.php', root: 'rows', idProperty: 'sp_check_fix_case_id',
        baseParams: {context: encoded}, fields: ['sp_check_fix_case_id', 'c_case_code', 'c_case_name', 'c_case_description', 'data',
            {name: 'i_severity', type: 'int'}, {name: 'i_require_confirm', type: 'bool'}, {name: 'i_allow_update', type: 'bool'}],
        listeners: {loadexception: function (proxy, options, response) {
                handleValidationFailure(response);
            }}});
    function handleValidationFailure(response) {
        if (validationFailureHandled)
            return;
        validationFailureHandled = true;
        var message = 'ไม่สามารถตรวจสอบข้อมูลก่อนตรวจรับได้';
        try {
            var result = Ext.decode(response && response.responseText ? response.responseText : '{}');
            if (result.message || result.msg)
                message += '<br>' + Ext.util.Format.htmlEncode(result.message || result.msg);
        } catch (e) {
        }
        Ext.Msg.alert('ตรวจสอบข้อมูลไม่สำเร็จ', message + '<br><br>ระบบจะข้ามขั้นตอนตรวจสอบและบันทึกรายการต่อ', function () {
            win.close();
            if (typeof onContinue === 'function')
                onContinue();
        });
    }
    function syncFixedValueToUi(caseCode) {
        if (caseCode !== 'RV-CURRENT-YEAR-EXPENSE-FUND-49')
            return;
        var field = Ext.getCmp('dc_expense_budget_type_idTxtID');
        if (field)
            field.setValue(49);
        Ext.currentExpenseBudgetTypeId = 49;
        if (Ext.selectRow && Ext.selectRow.set)
            Ext.selectRow.set('dc_expense_budget_type_id', 49);
        if (Ext.selectRow && Ext.selectRow.data)
            Ext.selectRow.data.dc_expense_budget_type_id = 49;
        if (Ext.perioidHdr && Ext.perioidHdr.set)
            Ext.perioidHdr.set('dc_expense_budget_type_id', 49);
        if (Ext.perioidHdr && Ext.perioidHdr.data)
            Ext.perioidHdr.data.dc_expense_budget_type_id = 49;
        context.dc_expense_budget_type_id = 49;
        encoded = Ext.encode(context);
        store.setBaseParam('context', encoded);
        var transfTotalField = Ext.getCmp('f_sum_Transf');
        var transfTotal = transfTotalField
            ? parseFloat((transfTotalField.getValue() || '0').toString().replace(/,/g, '')) || 0
            : 0;
        if (transfTotal === 0 && Ext.storeTransf) {
            Ext.storeTransf.setBaseParam('sp_check_period_hdr_id', context.sp_check_period_hdr_id);
            Ext.storeTransf.reload({callback: function (records, options, success) {
                if (success && Ext.resetTransfTotal) {
                    Ext.resetTransfTotal(true);
                }
            }});
        }
    }
    function severity(v) {
        return ['', 'ข้อมูล', 'แจ้งเตือน', 'ยืนยันการแก้ไข', 'ต้องแก้ไขข้อมูล'][v] || v;
    }
    function safe(v) {
        return Ext.util.Format.htmlEncode(v === null || v === undefined || v === '' ? '-' : String(v));
    }
    function money(v) {
        var n = parseFloat(v);
        return isNaN(n) ? safe(v) : Ext.util.Format.number(n, '0,000.00');
    }
    function renderDetails(value, meta, caseRec) {
        var rows = Ext.isArray(value) ? value : (value ? [value] : []), html = [];
        var labels = {c_name: 'ชื่อรายการ', f_net_total_price: 'จำนวนเงิน', f_vat_amt: 'ภาษีมูลค่าเพิ่ม',
            f_sum_Transf: 'ยอดเงินตั้งหนี้', f_totalID: 'ยอดเงินตรวจรับ', difference_amount: 'ผลต่าง',
            old_dc_bg_budget_type_id: 'แหล่งเงินเดิม', new_dc_bg_budget_type_id: 'เปลี่ยนเป็นแหล่งเงิน',
            old_dc_expense_budget_type_id: 'แหล่งเงินเดิม', new_dc_expense_budget_type_id: 'เปลี่ยนเป็นแหล่งเงิน',
            i_yyyy_overlap: 'ใช้เงินปีงบประมาณ', current_budget_year: 'ปีงบประมาณปัจจุบัน',
            new_budget_type_name: 'ชื่อแหล่งเงินใหม่', old_i_enabled: 'สถานะเดิม', new_i_enabled: 'สถานะใหม่',
            receive_complete_date: 'วันที่รับของ/เอกสารสมบูรณ์', checking_date: 'วันที่บันทึกการตรวจรับ',
            closed_period: 'งวดบัญชีที่ปิดแล้ว', checking_month: 'เดือนของวันที่ตรวจรับ',
            warning_message: 'สิ่งที่ต้องตรวจสอบ', result: 'ผลลัพธ์'};
        var technical = {sp_tranf_item_id: 1, sp_tranf_hdr_id: 1, sp_check_period_dtl_id: 1,
            sp_check_period_hdr_id: 1, sp_tor_hdr_period_id: 1};
        if (!rows.length)
            return '<div style="padding:8px;color:#777">ไม่พบรายละเอียดเพิ่มเติม</div>';
        Ext.each(rows, function (row, index) {
            html.push('<div style="padding:8px 10px;margin:3px 0;border-left:4px solid #f0ad4e;background:#fffaf0">');
            if (rows.length > 1)
                html.push('<div style="font-weight:bold;margin-bottom:5px">รายการที่ ' + (index + 1) + '</div>');
            Ext.iterate(row, function (key, val) {
                if (technical[key] || !labels[key])
                    return;
                var display = (key.indexOf('f_') === 0 || key === 'difference_amount') ? money(val) : safe(val);
                if (key === 'old_i_enabled')
                    display = String(val) === '2' ? '2 — ถูกยกเลิก' : display;
                if (key === 'new_i_enabled')
                    display = String(val) === '1' ? '1 — เปิดใช้งาน' : display;
                if (key === 'old_dc_bg_budget_type_id' && String(val) === '2')
                    display = '2 — แหล่งเงินไม่ถูกต้อง';
                if (key === 'new_dc_bg_budget_type_id' && String(val) === '49')
                    display = '49 — เงินรายได้ส่วนงาน';
                if (key === 'new_dc_expense_budget_type_id' && String(val) === '49')
                    display = '49 — เงินรายได้ส่วนงาน';
                html.push('<div style="margin:2px 0"><span style="display:inline-block;width:145px;color:#666">' + safe(labels[key]) + '</span><b>' + display + '</b></div>');
            });
            var refs = [];
            Ext.iterate(technical, function (key) {
                if (row[key] !== undefined && row[key] !== null)
                    refs.push(key.replace(/_/g, ' ') + ' = ' + safe(row[key]));
            });
            if (refs.length)
                html.push('<div style="margin-top:5px;color:#999;font-size:10px">อ้างอิง: ' + refs.join(' | ') + '</div>');
            html.push('</div>');
        });
        return '<div><div style="font-weight:bold;color:#8a4b08;margin-bottom:4px">' + safe(caseRec.get('c_case_description') || caseRec.get('c_case_name')) + '</div>' + html.join('') + '</div>';
    }
    function detailText(caseRec) {
        var rows = caseRec.get('data') || [], lines = [caseRec.get('c_case_name'), caseRec.get('c_case_description') || ''];
        var labels = {c_name: 'ชื่อรายการ', f_net_total_price: 'จำนวนเงิน', f_vat_amt: 'ภาษีมูลค่าเพิ่ม',
            f_sum_Transf: 'ยอดเงินตั้งหนี้', f_totalID: 'ยอดเงินตรวจรับ', difference_amount: 'ผลต่าง',
            old_dc_bg_budget_type_id: 'แหล่งเงินเดิม', new_dc_bg_budget_type_id: 'เปลี่ยนเป็นแหล่งเงิน',
            new_budget_type_name: 'ชื่อแหล่งเงินใหม่', old_i_enabled: 'สถานะเดิม', new_i_enabled: 'สถานะใหม่',
            receive_complete_date: 'วันที่รับของ/เอกสารสมบูรณ์', checking_date: 'วันที่บันทึกการตรวจรับ',
            closed_period: 'งวดบัญชีที่ปิดแล้ว', checking_month: 'เดือนของวันที่ตรวจรับ',
            warning_message: 'สิ่งที่ต้องตรวจสอบ', result: 'ผลลัพธ์', sp_tranf_item_id: 'รหัสรายการ',
            sp_check_period_dtl_id: 'รหัสรายละเอียด', sp_check_period_hdr_id: 'รหัสตรวจรับ', sp_tor_hdr_period_id: 'รหัสงวด'};
        if (!Ext.isArray(rows))
            rows = [rows];
        Ext.each(rows, function (row, index) {
            if (rows.length > 1)
                lines.push('', 'รายการที่ ' + (index + 1));
            Ext.iterate(row, function (key, val) {
                if (labels[key])
                    lines.push(labels[key] + ': ' + (val === null || val === undefined || val === '' ? '-' : val));
            });
        });
        return lines.join('\r\n');
    }
    function copyText(text) {
        var area = document.createElement('textarea'), copied = false;
        area.value = text;
        area.setAttribute('readonly', 'readonly');
        area.style.position = 'fixed';
        area.style.left = '-9999px';
        document.body.appendChild(area);
        area.select();
        try {
            copied = document.execCommand('copy');
        } catch (e) {
        }
        document.body.removeChild(area);
        Ext.Msg.alert(copied ? 'คัดลอกแล้ว' : 'คัดลอกไม่สำเร็จ', copied ? 'คัดลอกรายละเอียดของแถวที่เลือกแล้ว' : 'เบราว์เซอร์ไม่อนุญาตให้คัดลอกอัตโนมัติ');
    }
    var grid = new Ext.grid.GridPanel({store: store, stripeRows: true, columns: [new Ext.grid.RowNumberer(),
            {header: 'ระดับ', dataIndex: 'i_severity', width: 70, renderer: severity}, {header: 'รหัส', hidden: true, dataIndex: 'c_case_code', width: 90},
            {header: 'รายการที่พบ', dataIndex: 'c_case_name', width: 220}, {header: 'รายละเอียดก่อนแก้ไข', dataIndex: 'data', width: 600, renderer: renderDetails}
        ], viewConfig: {getRowClass: function () {
                return 'receive-validation-row';
            }}, tbar: [{text: 'ตรวจสอบใหม่', iconCls: 'icon-refresh', handler: function () {
                    store.reload();
                }},
            {text: 'คัดลอกรายละเอียด', iconCls: 'icon-page-copy', handler: function () {
                    var r = grid.getSelectionModel().getSelected();
                    if (!r)
                        return Ext.Msg.alert('แจ้งเตือน', 'กรุณาเลือกแถวที่ต้องการคัดลอก');
                    copyText(detailText(r));
                }},
            {text: 'ดำเนินการแก้ไข', icon: "../images/icons/table_save.png", handler: function () {
                    var r = grid.getSelectionModel().getSelected();
                    if (!r)
                        return Ext.Msg.alert('แจ้งเตือน', 'กรุณาเลือกเคส');
                    if (!r.get('i_allow_update'))
                        return Ext.Msg.alert('แจ้งเตือน', 'เคสนี้ไม่อนุญาตให้แก้ไข');
                    var run = function () {
                        Ext.Ajax.request({url: api + 'executeFixCase.php', method: 'POST', params: {sp_check_fix_case_id: r.id, context: encoded, confirmed: 1}, success: function (x) {
                            var d = Ext.decode(x.responseText);
                                syncFixedValueToUi(r.get('c_case_code'));
                                Ext.Msg.alert('สำเร็จ', 'แก้ไขแล้ว เวอร์ชัน ' + d.result.version);
                                store.reload();
                            }, failure: function (x) {
                                var d = Ext.decode(x.responseText);
                                Ext.Msg.alert('ผิดพลาด', d.message || 'แก้ไขไม่สำเร็จ');
                            }});
                    };
                    if (r.get('i_require_confirm'))
                        Ext.Msg.confirm('ยืนยันการแก้ไข', 'ระบบจะบันทึกข้อมูลก่อนแก้ไขเก็บไว้ คุณต้องการดำเนินการเปลี่ยนแปลงข้อมูล?', function (b) {
                            if (b === 'yes')
                                run();
                        });
                    else
                        run();
                }}]});
    var win = new Ext.Window({collapsible: true, maximizable: true, width: Ext.getCmp("contenterCenter").getWidth() - 5, height: Ext.getCmp("contenterCenter").getHeight() - 5, layout: "fit", title: 'ตรวจสอบข้อมูลก่อนทำรายการตรวจรับ', width: 1050, height: 600, modal: true, layout: 'fit', items: grid, buttons: [
            {text: 'ยืนยันแก้ไขและบันทึกต่อ', icon: "../images/icons/save.png", handler: function () {
                    var proceed = function () {
                        win.close();
                        if (typeof onContinue === 'function')
                            onContinue();
                    };
                    var fixable = [];
                    store.each(function (rec) {
                        if (rec.get('i_allow_update'))
                            fixable.push(rec);
                    });
                    if (fixable.length === 0) {
                        if (store.getCount() > 0)
                            Ext.Msg.confirm('ยืนยัน', 'มีรายการแจ้งเตือนที่แก้ไขอัตโนมัติไม่ได้ ต้องการบันทึกต่อหรือไม่?', function (b) {
                                if (b === 'yes')
                                    proceed();
                            });
                        else
                            proceed();
                        return;
                    }
                    Ext.Msg.confirm('ยืนยันการแก้ไข', 'ระบบจะบันทึกข้อมูลเดิมเป็น JSON และ Update จำนวน ' + fixable.length + ' เคส ก่อนบันทึกรายการหลัก ต้องการดำเนินการหรือไม่?', function (b) {
                        if (b !== 'yes')
                            return;
                        win.getEl().mask('กำลังแก้ไขข้อมูล...', 'x-mask-loading');
                        var runAt = function (index) {
                            if (index >= fixable.length) {
                                win.getEl().unmask();
                                proceed();
                                return;
                            }
                            Ext.Ajax.request({url: api + 'executeFixCase.php', method: 'POST', params: {sp_check_fix_case_id: fixable[index].id, context: encoded, confirmed: 1},
                                success: function () {
                                    syncFixedValueToUi(fixable[index].get('c_case_code'));
                                    runAt(index + 1);
                                },
                                failure: function (x) {
                                    win.getEl().unmask();
                                    var d = {};
                                    try {
                                        d = Ext.decode(x.responseText);
                                    } catch (e) {
                                    }
                                    Ext.Msg.alert('แก้ไขไม่สำเร็จ', d.message || 'ไม่สามารถ Update ข้อมูลได้ ระบบยังไม่บันทึกรายการหลัก');
                                }
                            });
                        };
                        runAt(0);
                    });
                }},
            {text: 'ปิด', icon: "../images/icons/cross.png", handler: function () {
                    win.close();
                }}
        ]});
    win.show();
    store.load({callback: function (records, options, success) {
            var responseData = store.reader && store.reader.jsonData ? store.reader.jsonData : null;
            if (success === false || (responseData && responseData.success === false)) {
                handleValidationFailure(options && options.response ? options.response : {
                    responseText: responseData ? Ext.encode(responseData) : ''
                });
                return;
            }
            if (store.getCount() === 0) {
                win.close();
                Ext.Msg.alert('ผลตรวจสอบ', 'ไม่พบเงื่อนไขผิดปกติ', function () {
                    if (typeof onContinue === 'function')
                        onContinue();
                });
            }
        }});
};
