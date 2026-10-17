/* Read-only overview for the selected contract. */
(function () {
    function encode(value) {
        return Ext.util.Format.htmlEncode(value === null || value === undefined || value === '' ? '-' : String(value));
    }
    function table(rows, columns) {
        if (!rows.length) return '<p style="padding:10px;color:#666">ยังไม่มีข้อมูล</p>';
        var html = '<table style="border-collapse:collapse;width:100%;background:white"><thead><tr>';
        Ext.each(columns, function (c) {
            html += '<th style="border:1px solid #c5d4e5;padding:8px;text-align:left;background:#eaf1f9">' + encode(c[1]) + '</th>';
        });
        html += '</tr></thead><tbody>';
        Ext.each(rows, function (row) {
            html += '<tr>';
            Ext.each(columns, function (c) {
                var value = row[c[0]];
                if (c[2] === 'money' && value !== null && value !== undefined && value !== '') {
                    value = Ext.util.Format.number(Number(value), '0,000.00');
                }
                if (c[2] === 'winner') value = Number(value) === 1 ? 'ผู้ชนะ' : 'ผู้เสนอราคา';
                html += '<td style="border:1px solid #c5d4e5;padding:8px;vertical-align:top;white-space:pre-wrap;word-break:break-word">' + encode(value) + '</td>';
            });
            html += '</tr>';
        });
        return html + '</tbody></table>';
    }
    function section(title, content) {
        return '<fieldset style="border:1px solid #bacce0;padding:12px;margin:12px 0"><legend style="font-weight:bold;color:#15428b;padding:0 6px">' + encode(title) + '</legend>' + content + '</fieldset>';
    }
    function children(rows, field, id) {
        var result = [];
        Ext.each(rows, function (row) { if (String(row[field]) === String(id)) result.push(row); });
        return result;
    }
    function display(value, type) {
        if (value === null || value === undefined || value === '') return '-';
        if (type === 'money') return Ext.util.Format.number(Number(value), '0,000.00');
        if (type === 'yesno') return Number(value) === 1 ? 'ใช่' : 'ไม่ใช่';
        if (type === 'year') return Number(value) > 0 ? String(Number(value) < 2400 ? Number(value) + 543 : Number(value)) : '-';
        if (type === 'date') {
            var match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
            if (match) return match[3] + '-' + match[2] + '-' + (Number(match[1]) < 2400 ? Number(match[1]) + 543 : match[1]);
        }
        return value;
    }
    function details(rows) {
        var html = '<table style="border-collapse:collapse;width:100%;background:white">';
        Ext.each(rows, function (row) {
            html += '<tr><th style="width:44%;text-align:left;vertical-align:top;background:#eaf1f9;border:1px solid #c5d4e5;padding:8px">' + encode(row[0]) +
                '</th><td style="border:1px solid #c5d4e5;padding:8px;white-space:pre-wrap;overflow-wrap:anywhere">' + encode(display(row[1], row[2])) + '</td></tr>';
        });
        return html + '</table>';
    }
    function bookingType(value) {
        return Number(value) === 1 ? '1 - เงินแผน' : (Number(value) === 2 ? '2 - เงินงวด' : '-');
    }
    function prYearDetails(pr) {
        var type = Number(pr.i_type_year);
        var timing = type === 1 ? 'ภายในปีงบประมาณ' : (type === 2 ? 'ก่อนปีงบประมาณ' : null);
        var month = Number(pr.mm_start);
        var monthText = null;
        if (type === 2 && month >= 1 && month <= 12) {
            var names = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
            var year = Number(pr.i_yyyy);
            monthText = names[month - 1];
            if (year > 0) {
                year = year < 2400 ? year + 543 : year;
                monthText += ' ' + (month >= 10 ? year - 1 : year);
            }
        }
        return details([['ประเภท PR', pr.pr_type_name], ['ปีงบประมาณ', pr.i_yyyy, 'year'],
            ['ช่วงปีงบประมาณ', timing], ['เดือน (ก่อนปีงบประมาณ)', monthText]]);
    }
    function guaranteeDetails(rows) {
        var items = [];
        Ext.each(rows, function (row) {
            items.push({creditor_name: row.creditor_name,
                guarantee_type: row.i_is_guarantee !== null && row.i_is_guarantee !== undefined && Number(row.i_is_guarantee) === 0
                    ? 'ไม่มีการค้ำประกัน' : row.guarantee_type,
                document_number: row.d_doc_guarantee_ref,
                document_date: display(row.d_guarantee_date, 'date'), bank_name: row.bank_name,
                amount: row.f_total_guarantee});
        });
        return section('หลักประกันซอง', table(items, [['creditor_name', 'ผู้เสนอราคา'], ['guarantee_type', 'ประเภทหลักค้ำ'],
            ['document_number', 'เลขที่แคชเชียร์ / เอกสาร'], ['document_date', 'วันที่แคชเชียร์ / เอกสาร'],
            ['bank_name', 'ธนาคาร'], ['amount', 'จำนวนเงินหลักประกัน', 'money']]));
    }
    function contractBookingDetails(rows) {
        var items = [];
        Ext.each(rows, function (row) {
            items.push({contract_code: row.contract_code, source_no: row.source_no, source_name: row.source_name, amount: row.amount,
                booking_type: Number(row.booking_type) === 1 ? 'จองแบบแผน' : (Number(row.booking_type) === 2 ? 'จองแบบงวด' : null),
                reservation_id: row.reservation_id, booking_status: row.booking_status});
        });
        return section('รายละเอียดการจองเงินตามสัญญา', table(items, [['contract_code', 'เลขสัญญา'], ['source_no', 'แหล่งเงินที่'], ['source_name', 'แหล่งเงิน'],
            ['amount', 'จำนวนเงินจากแหล่งเงิน', 'money'], ['booking_type', 'ขอดำเนินการ'],
            ['reservation_id', 'รหัสการจองเงิน'], ['booking_status', 'สถานะการจองเงิน']]));
    }
    function contractTerms(contract) {
        var fineType = null;
        if (contract.i_type_fine !== null && contract.i_type_fine !== undefined && contract.i_type_fine !== '') {
            fineType = Number(contract.i_type_fine) === 0 ? 'ปรับตามความสำเร็จของงานพร้อมกันทั้งหมด' :
                (Number(contract.i_type_fine) === 1 ? 'ปรับแยกตามรายงวด' : null);
        }
        var dates = details([
            ['วันที่ออกเลขสัญญา', contract.d_doc_date, 'date'],
            ['วันที่มารับสัญญา', contract.d_contract_receiving_date, 'date'],
            ['วันที่สัญญามีผล / วันที่เข้าพื้นที่', contract.d_contract_start_date, 'date'],
            ['กำหนดส่งภายใน (วัน)', contract.i_delivery],
            ['นับตามวันทำการ', contract.i_working_day, 'yesno'],
            ['วันที่สิ้นสุดสัญญา', contract.d_due_date, 'date']
        ]);
        var terms = details([
            ['การคิดค่าปรับแบบ', fineType],
            ['ค่าปรับจากวงเงินในสัญญา (บาท/วัน)', contract.f_fine, 'money'],
            ['กิจการค้าร่วม — มีผู้ขาย/ผู้รับจ้างในสัญญามากกว่า 1', contract.i_is_join_venture, 'yesno'],
            ['จำนวนเงินในสัญญา', contract.f_total_amt, 'money']
        ]);
        return '<div style="display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start">' +
            '<div style="flex:1 1 360px;min-width:0">' + dates + '</div>' +
            '<div style="flex:1 1 360px;min-width:0">' + terms + '</div></div>';
    }
    function periodDetails(period, rows) {
        var expenses = [], products = [], hasItem = null;
        var productNames = {0: 'ไม่มีของ', 1: 'วัสดุทั่วไป', 2: 'ครุภัณฑ์', 3: 'เช่า', 4: 'จ้างออกแบบ',
            5: 'ที่ดิน', 6: 'ปรับปรุงอาคาร - ได้ของ', 7: 'ปรับปรุงอาคาร - ไม่ได้ของ', 8: 'สิ่งก่อสร้าง'};
        Ext.each(rows, function (row) {
            var expense = [row.expense_code, row.expense_name].filter(function (v) { return !!v; }).join(' : ');
            if (expense && expenses.indexOf(expense) === -1) expenses.push(expense);
            var product = row.i_product_type === null || row.i_product_type === undefined || row.i_product_type === '' ? null : productNames[Number(row.i_product_type)];
            if (product && products.indexOf(product) === -1) products.push(product);
            if (row.i_is_item !== null && row.i_is_item !== undefined && row.i_is_item !== '') {
                if (Number(row.i_is_item) === 1) hasItem = 1;
                else if (hasItem === null) hasItem = 0;
            }
        });
        var department = [period.receiving_department_code, period.receiving_department_name].filter(function (v) { return !!v; }).join(' : ');
        var left = details([
            ['งวดตามสัญญา', period.i_period_contract], ['งวดเงิน', period.i_period],
            ['ได้ของ', hasItem, 'yesno'], ['งวดสุดท้าย', period.i_is_last, 'yesno'],
            ['แหล่งเงิน', period.budget_name], ['รายการย่อย', expenses.join('\n')],
            ['หน่วยงานที่รับของ', department], ['ของที่ได้มา', products.join('\n')]
        ]);
        var right = details([
            ['วันที่เริ่มนับการส่งของในงวด', period.d_doc_date, 'date'],
            ['วันที่กำหนดส่งในงวดงาน', period.d_period_date, 'date'],
            ['จำนวนวันที่กำหนดส่งในงวดงาน', period.i_day],
            ['จำนวนวันที่แจ้งเตือน', period.i_alert],
            ['จำนวนเงินในงวด', period.f_total_amt, 'money'],
            ['ประเภทการจองเงิน', bookingType(period.i_pr_type1)],
            ['รหัสการจองเงิน', Number(period.bg_reserve_money_id) > 0 ? period.bg_reserve_money_id : null],
            ['รายละเอียด', period.c_discription]
        ]);
        return '<div style="display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start">' +
            '<div style="flex:1 1 360px;min-width:0">' + left + '</div>' +
            '<div style="flex:1 1 360px;min-width:0">' + right + '</div></div>';
    }
    function periodStatus(value) {
        return Number(value) === 1 ? 'ใช้งาน' : (Number(value) === 2 ? 'ไม่ใช้งาน' : 'ไม่ระบุ');
    }
    function renderPeriods(data, filter) {
        var html = '<style>.contract-period-detail .period-hide-label{display:none}.contract-period-detail[open] .period-show-label{display:none}.contract-period-detail[open] .period-hide-label{display:inline}</style>' +
            '<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin:12px 0">' +
            '<label>แสดงงวด: <select class="contract-period-filter" aria-label="สถานะงวด" style="padding:5px">';
        Ext.each([['1', 'ใช้งาน'], ['2', 'ไม่ใช้งาน'], ['all', 'ทั้งหมด']], function (option) {
            html += '<option value="' + option[0] + '"' + (filter === option[0] ? ' selected' : '') + '>' + option[1] + '</option>';
        });
        html += '</select></label><button type="button" class="contract-period-toggle" data-expand="true">แสดงรายละเอียดทุกงวด</button>' +
            '<button type="button" class="contract-period-toggle" data-expand="false">ซ่อนรายละเอียดทุกงวด</button></div>';
        var count = 0;
        Ext.each(data.periods, function (period) {
            if (filter !== 'all' && Number(period.i_enabled) !== Number(filter)) return;
            count++;
            var rows = children(data.periodItems, 'sp_tor_hdr_period_id', period.sp_tor_hdr_period_id);
            // Active view omits retired detail rows; historical views retain their status.
            if (filter === '1') rows = rows.filter(function (row) { return Number(row.i_enabled) === 1; });
            var items = [];
            Ext.each(rows, function (row) {
                items.push({c_name: row.c_name, i_qty: row.i_qty, f_net_unit_price: row.f_net_unit_price,
                    f_net_total_price: row.f_net_total_price, status_name: periodStatus(row.i_enabled)});
            });
            var isLast = Number(period.i_is_last) === 1;
            html += '<details class="contract-period-detail" style="border:1px solid ' + (isLast ? '#b9770e' : '#bacce0') + ';margin:12px 0;background:#fff">' +
                '<summary style="cursor:pointer;padding:12px;background:' + (isLast ? '#fff3cd' : '#eaf1f9') + ';color:' + (isLast ? '#744600' : '#15428b') + ';font-weight:bold">' +
                (data.contracts.length > 1 ? 'สัญญา ' + encode(period.contract_code) + ' / ' : '') + 'งวดที่ ' + encode(period.i_period) + (isLast ? ' <span style="display:inline-block;background:#8a5100;color:#fff;border-radius:3px;padding:2px 7px">งวดสุดท้าย</span>' : '') +
                ' — ' + encode(period.c_contract_code) + ' | ' + encode(periodStatus(period.i_enabled)) +
                ' | ' + encode(display(period.f_total_amt, 'money')) + ' บาท <span class="period-show-label">(แสดงรายละเอียด)</span>' +
                '<span class="period-hide-label">(ซ่อนรายละเอียด)</span></summary><div style="padding:12px">' +
                details([['เลขอ้างอิงงวด', period.c_contract_code], ['สถานะงวด', periodStatus(period.i_enabled)]]) + periodDetails(period, rows) +
                section('รายการในงวด', table(items, [['c_name', 'ชื่อรายการ'], ['i_qty', 'จำนวน'], ['f_net_unit_price', 'ราคาต่อหน่วย', 'money'],
                    ['f_net_total_price', 'จำนวนเงิน', 'money'], ['status_name', 'สถานะ']])) + '</div></details>';
        });
        return section('งวดสัญญา', html + (!count ? '<p style="padding:10px;color:#666">ไม่มีงวดตามสถานะที่เลือก</p>' : ''));
    }
    function debtDetails(check, rows) {
        if (!rows.length) return section('รายการตั้งหนี้', '<p style="padding:10px;color:#666">ยังไม่มีรายการตั้งหนี้</p>');
        var total = 0, vatTotal = 0, items = [];
        Ext.each(rows, function (row) {
            total += Math.round(Number(row.total_amount || 0) * 100);
            vatTotal += Math.round(Number(row.vat_amount || 0) * 100);
            items.push({
                description: row.c_name,
                category: [row.asset_category, row.inventory_category].filter(function (v) { return !!v; }).join(' / '),
                account: [row.account_code, row.account_name].filter(function (v) { return !!v; }).join(' : '),
                work_type: Number(row.i_workin_process) > 0 ? 'งานระหว่างดำเนินการ' : (Number(row.i_is_under) === 1 ? 'ต่ำกว่าเกณฑ์' : 'ปกติ'),
                vat_amount: row.vat_amount,
                total_amount: row.total_amount
            });
        });
        return section('รายการตั้งหนี้', details([['เลขที่ตั้งหนี้ / เลขตรวจรับ', check.c_code_debt || check.c_code]]) +
            table(items, [['description', 'รายละเอียด ซื้อ/จ้าง'], ['category', 'หมวดย่อย'], ['account', 'ผังบัญชี'],
                ['work_type', 'ประเภทรายการ'], ['vat_amount', 'มูลค่าภาษี (+/-)', 'money'], ['total_amount', 'จำนวนเงินรวม', 'money']]) +
            details([['รวมมูลค่าภาษีที่บันทึก', vatTotal / 100, 'money'], ['รวมเงินตั้งหนี้', total / 100, 'money']]));
    }
    function warrantyDetails(check) {
        var type = check.i_is_warranty === null || check.i_is_warranty === undefined || check.i_is_warranty === '' ? null : Number(check.i_is_warranty);
        var names = {0: 'ไม่มีการรับประกัน', 1: 'มีการรับประกัน (จำนวนเดือน)', 2: 'แยกการรับประกันในงวด', 3: 'มีการรับประกัน (จำนวนวัน)'};
        var rows = [['ประกันของ', type === null ? null : names[type]]];
        if (type === 1 || type === 3) {
            rows.push([type === 1 ? 'ระยะเวลารับประกัน (เดือน)' : 'ระยะเวลารับประกัน (วัน)', type === 1 ? check.i_warranty_age : check.i_warranty_day]);
            rows.push(['วันที่หมดรับประกัน', check.d_warranty_date, 'date']);
            rows.push(['แจ้งเตือนก่อน (วัน)', check.i_before]);
            rows.push(['วันที่แจ้งเตือนก่อนหมดรับประกัน', check.warranty_notification_date, 'date']);
        }
        return section('รายละเอียดการรับประกัน', details(rows));
    }
    function checkDetails(check, rows) {
        var names = [], funds = [], expenses = [], bookings = [];
        function unique(list, value) { if (value && list.indexOf(value) === -1) list.push(value); }
        Ext.each(rows, function (row) {
            unique(names, row.c_name);
            unique(funds, row.budget_name);
            unique(expenses, [row.expense_code, row.expense_name].filter(function (v) { return !!v; }).join(' : '));
            var type = bookingType(row.period_booking_type);
            if (type !== '-') unique(bookings, type);
        });
        var bank = [check.bank_account_number, check.bank_account_name, check.bank_name].filter(function (v) { return !!v; }).join(' | ');
        var document = details([
            ['วันที่รับของเอกสารสมบูรณ์', check.d_arrive_date, 'date'],
            ['วันที่บันทึกการตรวจรับ', check.d_checking_date, 'date'],
            ['เลขที่ EGP', check.c_egp_no],
            ['รายการส่งเบิก', names.join('\n')],
            ['การใช้เงิน', check.fund_usage],
            ['ออกเลขตรวจรับโดยไม่เช็คเงิน', check.i_skip_bg_check, 'yesno'],
            ['ปีงบประมาณ', check.i_yyyy, 'year'],
            ['ใช้เงินปีงบประมาณ', check.resolved_overlap_year !== null && check.resolved_overlap_year !== undefined ? check.resolved_overlap_year : check.i_yyyy_overlap, 'year'],
            ['ใช้ใบกันใบที่ 2 ของสัญญา', check.uses_second_overlap, 'yesno'],
            ['เลขที่ใบกันเงินเหลื่อมปี', check.resolved_overlap_code || check.c_overlap || 'ไม่ระบุ'],
            ['ใบเบิกแบบคู่', check.i_doc_duo, 'yesno'],
            ['โอนสิทธิ์', check.i_transfer_of_rights, 'yesno'],
            ['ผู้ทดรองจ่าย', check.i_reserve_pay, 'yesno'],
            ['จ่ายให้', check.payee_name],
            ['รูปแบบการจ่าย', Number(check.i_type_transfer) === 1 ? 'โอนจ่าย' : (Number(check.i_type_transfer) === 2 ? 'เช็คจ่าย' : null)],
            ['โดยมอบให้', check.transfer_name],
            ['บัญชีธนาคาร', bank],
            ['แหล่งเงิน', funds.join('\n')],
            ['ประเภทการจองเงิน', bookingType(check.i_pr_type1) !== '-' ? bookingType(check.i_pr_type1) : bookings.join('\n')],
            ['รายการย่อย', expenses.join('\n')]
        ]);
        var money = details([
            ['จำนวนเงินรวม VAT', check.f_total, 'money'],
            ['จำนวนเงินก่อน VAT', check.f_total_add_vat_amt, 'money'],
            ['คิดภาษีมูลค่าเพิ่ม', check.i_vat_amt, 'yesno'],
            ['ภาษีมูลค่าเพิ่ม', check.f_vat_amt, 'money'],
            ['อัตรา VAT (%)', check.f_rate_vat, 'money'],
            ['จำนวนเงินขอเบิก', check.f_inv_vat, 'money'],
            ['หักภาษี ณ ที่จ่าย', check.i_tax_personal, 'yesno'],
            ['ภาษีหัก ณ ที่จ่าย', check.f_tax_personal, 'money'],
            ['อัตราภาษีหัก ณ ที่จ่าย (%)', check.f_tax_personal_rate, 'money'],
            ['ค่าปรับ', check.f_fine_amt, 'money'],
            ['หักค่าประกันผลงาน', check.i_rate, 'yesno'],
            ['ค่าประกันผลงาน', check.f_warranty, 'money'],
            ['อัตราค่าประกันผลงาน (%)', check.f_tax_warranty_rate, 'money'],
            ['อื่นๆ', check.f_other, 'money'],
            ['จำนวนเงินที่จ่าย', check.f_pay, 'money']
        ]);
        return '<div style="display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start">' +
            '<div style="flex:1 1 480px;min-width:0">' + section('รายละเอียดเอกสาร / การเบิกจ่าย', document) + '</div>' +
            '<div style="flex:1 1 330px;min-width:0">' + section('รายละเอียดเงิน', money) + '</div></div>' + warrantyDetails(check);
    }
    var itemColumns = [['c_name', 'ชื่อรายการ'], ['i_qty', 'จำนวน'], ['f_unit_price', 'ราคาต่อหน่วย', 'money'], ['f_net_total_price', 'จำนวนเงิน', 'money']];
    Ext.showContractDetails = function (record, options) {
        options = options || {};
        var id = options.sp_tor_id ? 0 : Number(record.get('sp_tor_contract_id') || 0);
        var torId = Number(options.sp_tor_id || record.get('sp_tor_id') || 0);
        if (!id && !torId) return Ext.Msg.alert('ดูรายละเอียดทั้งหมด', 'กรุณาเลือก PR หรือสัญญา');
        var requestParams = id ? {sp_tor_contract_id: id} : {sp_tor_id: torId};
        var tabs = new Ext.TabPanel({activeTab: options.initialTab || 0, border: false, deferredRender: false, items: [
            {title: 'PR / แหล่งเงิน / รายการ', autoScroll: true, bodyStyle: 'padding:12px', html: 'กำลังโหลดข้อมูล...'},
            {title: 'ผู้เสนอราคา / ผู้ชนะ', autoScroll: true, bodyStyle: 'padding:12px'},
            {title: 'สัญญา / งวด', autoScroll: true, bodyStyle: 'padding:12px'},
            {title: 'ตรวจรับ / เลขเบิก', autoScroll: true, bodyStyle: 'padding:12px'}
        ]});
        var prCode = '';
        var copyButton = new Ext.Button({text: 'คัดลอกเลข PR', disabled: true, handler: function () { copyToClipboard(prCode); }});
        var win = new Ext.Window({title: 'ดูรายละเอียดทั้งหมด — ' + encode(record.get('c_code')), width: Math.min(1150, Ext.getBody().getViewSize().width - 30),
            height: Math.min(740, Ext.getBody().getViewSize().height - 30), layout: 'fit', modal: true, maximizable: true,
            items: tabs, buttons: [copyButton, {text: 'ปิด', handler: function () { win.close(); }}]});
        win.show();
        Ext.Ajax.request({url: 'tor/api/contractDetails.php', method: 'GET', params: requestParams,
            callback: function (options, success, response) {
                if (win.isDestroyed) return;
                var data;
                try { data = Ext.decode(response.responseText); } catch (ignore) { data = null; }
                if (!success || !data || !data.success) {
                    tabs.items.get(0).update('<p>' + encode(data && data.msg ? data.msg : 'โหลดข้อมูลไม่สำเร็จ กรุณาลองอีกครั้ง') + '</p>');
                    tabs.setActiveTab(0);
                    return;
                }
                prCode = data.pr.length ? data.pr[0].c_code : '';
                copyButton.setDisabled(!prCode);
                tabs.items.get(0).update(section('PR master', table(data.pr, [['c_code', 'เลข PR'], ['c_name', 'ชื่อรายการ'], ['expense_name', 'ค่าใช้จ่าย'], ['f_total_amt', 'วงเงิน PR', 'money']]) + prYearDetails(data.pr[0] || {})) +
                    section('แหล่งเงินที่ใช้ทั้งหมด', table(data.funds, [['source', 'แหล่งเงิน'], ['amount', 'จำนวนเงิน', 'money']])) + section('PR detail — รายการ', table(data.items, itemColumns)));
                var winners = [];
                Ext.each(data.bidders, function (row) { if (Number(row.is_winner) === 1) winners.push(row); });
                var bidderColumns = [['item_name', 'ชื่อรายการ'], ['creditor_name', 'ผู้เสนอราคา'], ['f_unit_price', 'ราคาที่เสนอ/หน่วย', 'money'], ['f_total_add_vat_amt', 'รวมภาษี', 'money'], ['is_winner', 'ผลการพิจารณา', 'winner']];
                tabs.items.get(1).update(section('ผู้เสนอราคา', table(data.bidders, bidderColumns)) +
                    guaranteeDetails(data.bidderGuarantees || []) + section('ผู้ชนะการเสนอราคา', table(winners, bidderColumns)));
                var contractHtml = '';
                Ext.each(data.contracts, function (contract) {
                    contractHtml += section('รายละเอียดสัญญา', table([contract], [['c_code', 'เลขสัญญา'], ['creditor_name', 'คู่สัญญา']]) + contractTerms(contract));
                });
                if (!data.contracts.length) contractHtml = section('รายละเอียดสัญญา', '<p style="padding:10px;color:#666">PR นี้ยังไม่มีสัญญา</p>');
                contractHtml += contractBookingDetails(data.contractFunds || []);
                var contractPanel = tabs.items.get(2);
                contractPanel.update(contractHtml + renderPeriods(data, '1'));
                contractPanel.body.on('change', function (event, select) {
                    contractPanel.update(contractHtml + renderPeriods(data, select.value));
                }, null, {delegate: '.contract-period-filter'});
                contractPanel.body.on('click', function (event, button) {
                    var expand = button.getAttribute('data-expand') === 'true';
                    var nodes = contractPanel.body.dom.querySelectorAll('.contract-period-detail');
                    for (var i = 0; i < nodes.length; i++) nodes[i].open = expand;
                }, null, {delegate: '.contract-period-toggle'});
                var checkHtml = '';
                Ext.each(data.checks, function (check) {
                    var rows = children(data.checkItems, 'sp_check_period_hdr_id', check.sp_check_period_hdr_id);
                    var summary = {ir_code: check.ir_code, c_code: check.c_code, payment_code: check.payment_code,
                        checking_date: display(check.d_checking_date, 'date'), request_amount: check.f_inv_vat};
                    var checkTitle = (data.contracts.length > 1 ? 'สัญญา ' + check.contract_code + ' / ' : '') +
                        (check.payment_period !== null && check.payment_period !== undefined ? 'งวดเงินที่ ' + check.payment_period + ' / ' : '') + 'ตรวจรับ ' + (check.c_code || '');
                    checkHtml += section(checkTitle, details([['งวดตามสัญญา', check.contract_period], ['งวดเงิน', check.payment_period], ['เลขอ้างอิงงวด', check.period_reference]]) +
                        table([summary], [['ir_code', 'เลข IR'], ['c_code', 'เลขตรวจรับ'], ['payment_code', 'เลขเบิก'], ['checking_date', 'วันที่ตรวจรับ'], ['request_amount', 'จำนวนเงินขอเบิก', 'money']]) +
                        section('รายการตรวจรับ', table(rows, [['c_name', 'ชื่อรายการ'], ['i_qty', 'จำนวน'], ['f_net_total_price', 'จำนวนเงิน', 'money']])) +
                        debtDetails(check, children(data.debtItems || [], 'sp_check_period_hdr_id', check.sp_check_period_hdr_id)) +
                        checkDetails(check, rows));
                });
                tabs.items.get(3).update(checkHtml || section('ตรวจรับ', table([], [])));
            }
        });
    };
}());
