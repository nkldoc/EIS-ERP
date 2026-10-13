(function () {
    'use strict';
    var page = 1, total = 0, selected = null, loading = false, generation = 0;
    var el = function (id) { return document.getElementById(id); };
    function display(value) { return value === false || value === null || value === undefined || value === '' ? '—' : String(value); }
    function time(value) {
        if (!value) return '—';
        var date = new Date(value.replace(' ', 'T') + 'Z');
        return isNaN(date.getTime()) ? value : date.toLocaleString('th-TH', {timeZone: 'Asia/Bangkok'});
    }
    async function request(query, options) {
        var response = await fetch('api/erpConfirmation' + query, Object.assign({credentials: 'same-origin'}, options || {}));
        var data;
        try { data = await response.json(); } catch (_) {
            throw new Error('ระบบไม่ได้ส่งข้อมูล JSON กลับมา (HTTP ' + response.status + ') กรุณาแจ้งผู้ดูแลตรวจ PHP error log และการติดตั้งไฟล์ ERP');
        }
        if (!response.ok || !data.success) throw new Error(data.message || 'ไม่สามารถทำรายการได้');
        return data;
    }
    function cell(row, value) { var td = document.createElement('td'); td.textContent = display(value); row.appendChild(td); return td; }
    function refCell(row, fields) {
        var td = document.createElement('td'); var group = document.createElement('div'); group.className = 'ref-group';
        fields.forEach(function (f) {
            var wrap = document.createElement('div'); wrap.className = 'ref-field';
            var l = document.createElement('label'); l.textContent = f[0];
            var v = document.createElement('div'); v.className = 'ref-value'; v.textContent = display(f[1]);
            wrap.appendChild(l); wrap.appendChild(v); group.appendChild(wrap);
        });
        td.appendChild(group); row.appendChild(td); return td;
    }
    function paging() {
        el('prev').disabled = loading || page <= 1;
        el('next').disabled = loading || page * 25 >= total;
        el('reload').disabled = loading;
        el('page').textContent = 'หน้า ' + page + ' / ' + Math.max(1, Math.ceil(total / 25));
    }
    async function load() {
        var version = ++generation;
        loading = true; paging(); el('message').textContent = 'กำลังโหลดข้อมูล…'; el('rows').textContent = '';
        try {
            var data = await request('?state=' + encodeURIComponent(el('state').value) + '&page=' + page);
            if (version !== generation) return;
            total = data.total;
            if (page > 1 && (page - 1) * 25 >= total) { page--; return load(); }
            data.data.forEach(function (item) {
                var tr = document.createElement('tr');
                cell(tr, time(item.received_at));
                refCell(tr, [['รหัส PR', item.pr_id], ['รหัส PO', item.po_id], ['รหัสงวด', item.period_id], ['รหัสตรวจรับ', item.chk_id]]);
                cell(tr, item.c_doc_ref);
                cell(tr, Number(item.item_index) + 1); cell(tr, item.username);
                cell(tr, item.confirmed_at ? 'ยืนยันแล้ว' : 'รอยืนยัน').className = item.confirmed_at ? 'status confirmed' : 'status';
                var td = cell(tr, ''); td.textContent = '';
                var button = document.createElement('button'); button.textContent = 'ดูรายละเอียด';
                button.onclick = function () { openDetail(item.id); }; td.appendChild(button); el('rows').appendChild(tr);
            });
            el('count').textContent = total + ' รายการ';
            el('message').textContent = total ? '' : 'ไม่พบรายการในสถานะที่เลือก';
        } catch (error) { if (version === generation) { total = 0; el('count').textContent = ''; el('message').textContent = error.message; } }
        finally { if (version === generation) { loading = false; paging(); } }
    }
    async function openDetail(id) {
        el('message').textContent = '';
        try {
            var data = await request('?id=' + encodeURIComponent(id)); selected = data.data;
            el('payload').textContent = JSON.stringify(selected.item, null, 2);
            renderForm(selected.item);
            showTab('form');
            el('detail-meta').textContent = 'รหัสรับเข้า ' + selected.request_id + ' • รายการที่ ' + (Number(selected.item_index) + 1) + ' • รับเมื่อ ' + time(selected.received_at) + (selected.confirmed_at ? ' • ยืนยันโดย ' + display(selected.confirmed_name) + ' เมื่อ ' + time(selected.confirmed_at) : ' • รอยืนยัน');
            var valid = selected.item && !Array.isArray(selected.item) && typeof selected.item === 'object' && Object.keys(selected.item).length > 0;
            el('confirm').hidden = !!selected.confirmed_at;
            el('confirm').disabled = !valid;
            el('detail-message').textContent = valid ? '' : 'ข้อมูลรายการไม่ถูกต้อง ไม่สามารถยืนยันได้';
            el('detail').showModal();
        } catch (error) { el('message').textContent = error.message; }
    }

    /* ---------- แถบ ฟอร์ม / JSON ---------- */
    var LABELS = {
        pr_id: 'รหัส PR', po_id: 'รหัส PO', period_id: 'รหัสงวด', chk_id: 'รหัสตรวจรับ',
        c_contract_code: 'เลขที่สัญญา', d_start_date: 'วันที่เริ่มต้น', d_contract_start_date: 'วันที่เริ่มสัญญา',
        d_end_date: 'วันที่สิ้นสุด', i_period: 'งวดที่', f_period_amt: 'จำนวนเงินงวด (บาท)', i_is_last: 'งวดสุดท้าย',
        c_overlap: 'คาบเกี่ยว', i_budget_year: 'ปีงบประมาณ', i_budget_year_overlap: 'ปีงบประมาณคาบเกี่ยว',
        bg_expense_id: 'รหัสหมวดค่าใช้จ่าย', bg_expense_name: 'หมวดค่าใช้จ่าย',
        dc_expense_budget_type_id: 'รหัสประเภทงบ', dc_expense_budget_type_name: 'ประเภทงบประมาณ',
        dc_cost_id: 'รหัสศูนย์ต้นทุน', i_product_type: 'ประเภทสินค้า',
        c_tax_number_imp: 'เลขประจำตัวผู้เสียภาษี', dc_creditor_id: 'รหัสเจ้าหนี้', dc_creditor_idTxt: 'เจ้าหนี้',
        dc_creditor_transfer_code: 'รหัสผู้รับโอน', dc_creditor_transfer_id: 'รหัสเจ้าหนี้ผู้รับโอน',
        dc_creditor_transfer_idTxt: 'ผู้รับโอน', dc_bank_acc_creditor_id: 'ธนาคาร',
        c_arrive_code: 'เลขที่ใบตรวจรับ', d_arrive_date: 'วันที่รับของ', d_checking_date: 'วันที่ตรวจรับ',
        i_reserve_pay: 'สำรองจ่าย', i_doc_duo: 'เอกสารคู่', c_doc_ref: 'เอกสารอ้างอิง',
        user_id: 'รหัสผู้ใช้', user_name: 'ผู้ทำรายการ'
    };
    var GROUPS = [
        ['เอกสารและสัญญา', ['pr_id', 'po_id', 'period_id', 'chk_id', 'c_contract_code', 'd_contract_start_date', 'd_start_date', 'd_end_date', 'i_period', 'f_period_amt', 'i_is_last']],
        ['งบประมาณ', ['i_budget_year', 'i_budget_year_overlap', 'c_overlap', 'bg_expense_id', 'bg_expense_name', 'dc_expense_budget_type_id', 'dc_expense_budget_type_name', 'dc_cost_id', 'i_product_type']],
        ['เจ้าหนี้', ['dc_creditor_id', 'dc_creditor_idTxt', 'c_tax_number_imp', 'dc_creditor_transfer_id', 'dc_creditor_transfer_code', 'dc_creditor_transfer_idTxt', 'dc_bank_acc_creditor_id']],
        ['การตรวจรับ', ['c_arrive_code', 'd_arrive_date', 'd_checking_date', 'i_reserve_pay', 'i_doc_duo', 'c_doc_ref']],
        ['ผู้ทำรายการ', ['user_id', 'user_name']]
    ];
    var LINE_LABELS = {chk_line_id: 'รหัสรายการตรวจรับ', d_doc_dateSub: 'วันที่เอกสาร'};
    var formView, tabButtons = {};

    function fmt(key, value) {
        if (typeof value === 'number' && /amt|amount/i.test(key)) {
            return value.toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2});
        }
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
            var d = new Date(value + 'T00:00:00');
            if (!isNaN(d.getTime())) return d.toLocaleDateString('th-TH', {year: 'numeric', month: 'long', day: 'numeric'});
        }
        if (typeof value === 'object' && value !== null) return JSON.stringify(value);
        return display(value);
    }
    function group(title) {
        var section = document.createElement('section'); section.className = 'erp-group';
        var h = document.createElement('h4'); h.textContent = title; section.appendChild(h);
        return section;
    }
    function renderForm(item) {
        formView.textContent = '';
        if (!item || Array.isArray(item) || typeof item !== 'object') {
            formView.textContent = 'ไม่มีข้อมูลสำหรับแสดงเป็นฟอร์ม'; return;
        }
        var used = {line_ids: true};
        function fields(title, keys) {
            var list = keys.filter(function (k) { return Object.prototype.hasOwnProperty.call(item, k); });
            if (!list.length) return;
            var section = group(title), grid = document.createElement('div'); grid.className = 'erp-grid';
            list.forEach(function (k) {
                used[k] = true;
                var f = document.createElement('div'); f.className = 'erp-field';
                var l = document.createElement('label'); l.textContent = LABELS[k] || k;
                var v = document.createElement('div'); v.className = 'erp-value'; v.textContent = fmt(k, item[k]);
                f.appendChild(l); f.appendChild(v); grid.appendChild(f);
            });
            section.appendChild(grid); formView.appendChild(section);
        }
        GROUPS.forEach(function (g) { fields(g[0], g[1]); });
        fields('อื่น ๆ', Object.keys(item).filter(function (k) { return !used[k]; }));

        if (Array.isArray(item.line_ids) && item.line_ids.length) {
            var section = group('รายการย่อย (' + item.line_ids.length + ')');
            var wrap = document.createElement('div'); wrap.className = 'erp-table-wrap';
            var table = document.createElement('table'); table.className = 'erp-lines';
            var cols = [];
            item.line_ids.forEach(function (r) { Object.keys(r || {}).forEach(function (k) { if (cols.indexOf(k) < 0) cols.push(k); }); });
            var head = table.createTHead().insertRow();
            cols.forEach(function (k) { var th = document.createElement('th'); th.textContent = LABELS[k] || LINE_LABELS[k] || k; head.appendChild(th); });
            var body = table.createTBody();
            item.line_ids.forEach(function (r) {
                var tr = body.insertRow();
                cols.forEach(function (k) { tr.insertCell().textContent = fmt(k, (r || {})[k]); });
            });
            wrap.appendChild(table); section.appendChild(wrap); formView.appendChild(section);
        }
    }
    function showTab(name) {
        formView.hidden = name !== 'form';
        el('payload').hidden = name !== 'json';
        Object.keys(tabButtons).forEach(function (k) {
            tabButtons[k].classList.toggle('active', k === name);
            tabButtons[k].setAttribute('aria-selected', k === name ? 'true' : 'false');
        });
    }
    (function initTabs() {
        var style = document.createElement('style');
        style.textContent =
            '.erp-tabs{display:flex;gap:4px;border-bottom:1px solid #dce4eb;margin:0 0 12px}' +
            '.erp-tabs button{border:0;border-radius:0;background:none;padding:8px 16px;cursor:pointer;font:inherit;color:#536477;border-bottom:2px solid transparent;margin-bottom:-1px}' +
            '.erp-tabs button.active{color:#17639a;border-bottom-color:#17639a;font-weight:bold}' +
            '#form-view{max-height:50vh;overflow:auto;padding-right:4px}' +
            '.erp-group{margin-bottom:16px}.erp-group h4{margin:0 0 8px;font-size:14px;color:#243649}' +
            '.erp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px 16px}' +
            '.erp-field label{display:block;font-size:12px;color:#536477;margin-bottom:2px}' +
            '.erp-value{background:#f2f5f8;border-radius:6px;padding:6px 10px;min-height:20px;overflow-wrap:anywhere}' +
            '.erp-table-wrap{overflow:auto}.erp-lines{border-collapse:collapse;width:100%;font-size:13px}' +
            '.erp-lines th,.erp-lines td{border:1px solid #e5ebef;padding:6px 8px;text-align:left}.erp-lines th{background:#edf3f7}';
        document.head.appendChild(style);

        var pre = el('payload');
        var tabs = document.createElement('div'); tabs.className = 'erp-tabs'; tabs.setAttribute('role', 'tablist');
        [['form', 'ฟอร์ม'], ['json', 'JSON']].forEach(function (t) {
            var b = document.createElement('button'); b.type = 'button'; b.textContent = t[1];
            b.setAttribute('role', 'tab'); b.onclick = function () { showTab(t[0]); };
            tabButtons[t[0]] = b; tabs.appendChild(b);
        });
        formView = document.createElement('div'); formView.id = 'form-view';
        pre.parentNode.insertBefore(tabs, pre);
        pre.parentNode.insertBefore(formView, pre);
    }());

    el('confirm').onclick = async function () {
        if (!selected || !window.confirm('ยืนยันว่าตรวจสอบข้อมูลรายการนี้แล้ว?')) return;
        el('confirm').disabled = true; el('close').disabled = true;
        try {
            await request('', {method: 'POST', headers: {'Content-Type': 'application/json', 'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content}, body: JSON.stringify({id: selected.id})});
            el('detail').close(); selected = null; await load();
        } catch (error) { el('detail-message').textContent = error.message; }
        finally { el('confirm').disabled = false; el('close').disabled = false; }
    };
    el('close').onclick = function () { el('detail').close(); };
    el('detail').addEventListener('cancel', function (event) { if (el('close').disabled) event.preventDefault(); });
    el('state').onchange = function () { page = 1; load(); };
    el('reload').onclick = load;
    el('prev').onclick = function () { if (page > 1) { page--; load(); } };
    el('next').onclick = function () { if (page * 25 < total) { page++; load(); } };
    load();
}());
