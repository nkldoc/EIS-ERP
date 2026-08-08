// Key_Performance_Indicator.js
// ===== KPI Dashboard Logic (Eis_procure) =====
// [แก้ไข] เพิ่ม filter_emp (ผู้รับผิดชอบ) เข้า getParams() และ loadData()

const API_URL = '../api/List_Key_Performance_Indicator.php';

// Fiscal months: Oct=1 ... Sep=12 (map to JS month index)
const FISCAL_MONTHS = [10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const MONTH_LABELS  = ['ต.ค.', 'พ.ย.', 'ธ.ค.', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.'];

let kpiChartInstance = null;
let rawData = [];  // เก็บข้อมูลดิบจาก API

// ==================== INIT ====================
$(document).ready(function () {
    loadEmployees();
    loadData();

    // Events
    $('#btnReset').on('click', function () {
        // [แก้ไข] reset filter_emp ด้วย
        $('#filter_emp').selectpicker('deselectAll');
        $('#filter_method').selectpicker('deselectAll');
        $('#filter_contract_type').selectpicker('deselectAll');
        $('#useRepKPI2').prop('checked', true);
        $('#kpiTargetInput').val(80);
        loadData();
    });

    // Auto-load on year change
    $('#filter_year').on('change', function () {
        loadEmployees(); // โหลดบุคลากรใหม่ตามปีที่เลือก
        loadData();
    });

    // Auto-load on employee selection change
    $('#filter_emp').on('changed.bs.select', function () {
        loadData();
    });

    // Auto-load on method selection change
    $('#filter_method').on('changed.bs.select', function () {
        loadData();
    });

    // Auto-load on contract type selection change
    $('#filter_contract_type').on('changed.bs.select', function () {
        loadData();
    });

    // Auto-load on KPI criteria toggle change
    $('#useRepKPI2').on('change', function () {
        loadData();
    });

    // Auto-load on target value change
    $('#kpiTargetInput').on('change', function () {
        loadData();
    });
});

// ==================== LOAD EMPLOYEES ====================
function loadEmployees() {
    const year = $('#filter_year').val();
    const $sel = $('#filter_emp');

    $.getJSON(API_URL, { fn: 'List_Emp', year_en: year })
        .done(function (res) {
            $sel.empty();

            if (!res.success) {
                $sel.selectpicker('refresh');
                return;
            }

            if (!res.data || res.data.length === 0) {
                $sel.selectpicker('refresh');
                return;
            }

            $.each(res.data, function (i, emp) {
                $sel.append('<option value="' + emp.id + '">' + emp.name + '</option>');
            });

            $sel.selectpicker('refresh');
        })
        .fail(function () {
            $sel.empty();
            $sel.selectpicker('refresh');
        });
}

// ==================== BUILD PARAMS ====================
function getParams() {
    const year    = $('#filter_year').val();
    const ctVals  = $('#filter_contract_type').val() || [];
    const ctStr   = ctVals.join(',');
    const useKpi2 = $('#useRepKPI2').is(':checked') ? 1 : 0;

    const empVals = $('#filter_emp').val() || [];
    const empId   = empVals.length > 0 ? empVals.join(',') : '0';

    return {
        fn:            'List_QueryParam',
        year_en:       year,
        sp_emp_id:     empId,       // [เพิ่ม] ส่ง emp id ไปกรองที่ API
        contract_type: ctStr,
        use_kpi2:      useKpi2
    };
}

// ==================== LOAD MAIN DATA ====================
function loadData() {
    showLoader(true);
    $.getJSON(API_URL, getParams(), function (res) {
        showLoader(false);
        if (!res.success) {
            alert('เกิดข้อผิดพลาด: ' + (res.message || 'ไม่ทราบสาเหตุ'));
            return;
        }

        rawData = res.data || [];

        // Build method filter options
        buildMethodFilter(rawData);

        renderTable(rawData);
        renderChart(rawData);
    }).fail(function () {
        showLoader(false);
        alert('ไม่สามารถเชื่อมต่อ API ได้');
    });
}


// ==================== BUILD METHOD FILTER ====================
function buildMethodFilter(data) {
    const methods = [...new Set(data.map(d => d.method_name))].sort();
    const $sel = $('#filter_method');
    const prevSelected = $sel.val() || [];

    $sel.empty();
    methods.forEach(m => {
        const isSelected = prevSelected.includes(m) ? 'selected' : '';
        $sel.append(`<option value="${m}" ${isSelected}>${m}</option>`);
    });
    $sel.selectpicker('refresh');

    // Re-render on method filter change
    $sel.off('changed.bs.select').on('changed.bs.select', function () {
        renderTable(rawData);
        renderChart(rawData);
    });
}

// ==================== FILTER BY METHOD ====================
function getFilteredData(data) {
    const selectedMethods = $('#filter_method').val() || [];
    if (selectedMethods.length === 0) return data;
    return data.filter(d => selectedMethods.includes(d.method_name));
}

// ==================== AGGREGATE ====================
/**
 * Aggregate rawData into structure:
 * { [method]: { [fiscalMonthIndex 0-11]: { total, ontime } } }
 */
function aggregateData(data) {
    const agg = {};
    data.forEach(row => {
        const method = row.method_name || 'อื่นๆ';
        const monthNo = parseInt(row.month_no); // 1-12 (calendar month)
        const fiscalIdx = FISCAL_MONTHS.indexOf(monthNo); // 0-11
        if (fiscalIdx === -1) return;

        if (!agg[method]) {
            agg[method] = {};
            for (let i = 0; i < 12; i++) {
                agg[method][i] = { total: 0, ontime: 0 };
            }
        }
        agg[method][fiscalIdx].total  += parseInt(row.cnt_total)  || 0;
        agg[method][fiscalIdx].ontime += parseInt(row.cnt_ontime) || 0;
    });
    return agg;
}

// ==================== RENDER TABLE ====================
function renderTable(data) {
    const target   = parseFloat($('#kpiTargetInput').val()) || 80;
    const filtered = getFilteredData(data);
    const agg      = aggregateData(filtered);
    const methods  = Object.keys(agg).sort();
    const $tbody   = $('#kpiTableBody');
    $tbody.empty();

    if (methods.length === 0) {
        $tbody.append('<tr><td colspan="14" class="text-center py-4 text-muted">ไม่พบข้อมูล</td></tr>');
        return;
    }

    // Grand total tracker
    const grandTotal  = new Array(12).fill(0);
    const grandOntime = new Array(12).fill(0);

    methods.forEach(method => {
        const mData = agg[method];

        // --- Row: จำนวนทั้งหมด (Clickable) ---
        let rowTotal = '<tr>';
        rowTotal += `<td>${method} (ทั้งหมด)</td>`;
        let sumTotal = 0;
        for (let i = 0; i < 12; i++) {
            const val = mData[i].total;
            const monthNo = FISCAL_MONTHS[i];
            if (val > 0) {
                rowTotal += `<td style="cursor:pointer;" onclick="openDetail('${method}', ${monthNo}, 'all')" title="คลิกดูรายละเอียด">${val}</td>`;
            } else {
                rowTotal += `<td>-</td>`;
            }
            sumTotal += val;
            grandTotal[i] += val;
        }
        if (sumTotal > 0) {
            rowTotal += `<td class="col-total" style="cursor:pointer;" onclick="openDetail('${method}', '', 'all')" title="คลิกดูรายละเอียด">${sumTotal}</td></tr>`;
        } else {
            rowTotal += `<td class="col-total">${sumTotal}</td></tr>`;
        }

        // --- Row: ผ่านเกณฑ์ (Clickable) ---
        let rowOntime = '<tr>';
        rowOntime += `<td>${method} (ผ่านเกณฑ์)</td>`;
        let sumOntime = 0;
        for (let i = 0; i < 12; i++) {
            const val = mData[i].ontime;
            const monthNo = FISCAL_MONTHS[i];
            if (val > 0) {
                rowOntime += `<td style="cursor:pointer;" onclick="openDetail('${method}', ${monthNo}, 'pass')" title="คลิกดูรายละเอียด">${val}</td>`;
            } else {
                rowOntime += `<td>-</td>`;
            }
            sumOntime += val;
            grandOntime[i] += val;
        }
        if (sumOntime > 0) {
            rowOntime += `<td class="col-total" style="cursor:pointer;" onclick="openDetail('${method}', '', 'pass')" title="คลิกดูรายละเอียด">${sumOntime}</td></tr>`;
        } else {
            rowOntime += `<td class="col-total">${sumOntime}</td></tr>`;
        }

        // --- Row: % ผ่าน ---
        let rowPct = '<tr class="row-result">';
        rowPct += `<td>${method} (% ผ่าน)</td>`;
        for (let i = 0; i < 12; i++) {
            const t = mData[i].total;
            const o = mData[i].ontime;
            if (t === 0) {
                rowPct += `<td>-</td>`;
            } else {
                const pct = ((o / t) * 100).toFixed(1);
                const cls = parseFloat(pct) >= target ? 'status-pass' : 'status-fail';
                rowPct += `<td class="${cls}">${pct}%</td>`;
            }
        }
        const totalPct = sumTotal > 0 ? ((sumOntime / sumTotal) * 100).toFixed(1) : '-';
        const totalCls = totalPct !== '-' && parseFloat(totalPct) >= target ? 'status-pass' : 'status-fail';
        rowPct += `<td class="col-total ${totalCls}">${totalPct !== '-' ? totalPct + '%' : '-'}</td></tr>`;

        $tbody.append(rowTotal + rowOntime + rowPct);
    });

    // ===== Grand Total Rows =====
    $tbody.append('<tr><td colspan="14" style="background:#dee2e6; height:4px;"></td></tr>');

    let rowGrandTotal = '<tr style="background:#e9f5ff;">';
    rowGrandTotal += `<td><strong>รวมทั้งหมด (ทั้งหมด)</strong></td>`;
    let gTotal = 0;
    for (let i = 0; i < 12; i++) {
        const monthNo = FISCAL_MONTHS[i];
        if (grandTotal[i] > 0) {
            rowGrandTotal += `<td style="cursor:pointer;" onclick="openDetail('', ${monthNo}, 'all')" title="คลิกดูรายละเอียดทั้งหมด"><strong>${grandTotal[i]}</strong></td>`;
        } else {
            rowGrandTotal += `<td><strong>-</strong></td>`;
        }
        gTotal += grandTotal[i];
    }
    if (gTotal > 0) {
        rowGrandTotal += `<td class="col-total" style="cursor:pointer;" onclick="openDetail('', '', 'all')" title="คลิกดูรายละเอียดทั้งหมด"><strong>${gTotal}</strong></td></tr>`;
    } else {
        rowGrandTotal += `<td class="col-total"><strong>${gTotal}</strong></td></tr>`;
    }

    let rowGrandOntime = '<tr style="background:#e9f5ff;">';
    rowGrandOntime += `<td><strong>รวมทั้งหมด (ผ่านเกณฑ์)</strong></td>`;
    let gOntime = 0;
    for (let i = 0; i < 12; i++) {
        const monthNo = FISCAL_MONTHS[i];
        if (grandOntime[i] > 0) {
            rowGrandOntime += `<td style="cursor:pointer;" onclick="openDetail('', ${monthNo}, 'pass')" title="คลิกดูรายละเอียดทั้งหมด"><strong>${grandOntime[i]}</strong></td>`;
        } else {
            rowGrandOntime += `<td><strong>-</strong></td>`;
        }
        gOntime += grandOntime[i];
    }
    if (gOntime > 0) {
        rowGrandOntime += `<td class="col-total" style="cursor:pointer;" onclick="openDetail('', '', 'pass')" title="คลิกดูรายละเอียดทั้งหมด"><strong>${gOntime}</strong></td></tr>`;
    } else {
        rowGrandOntime += `<td class="col-total"><strong>${gOntime}</strong></td></tr>`;
    }

    let rowGrandPct = '<tr class="row-result" style="font-size:1.05em;">';
    rowGrandPct += `<td><strong>รวมทั้งหมด (% ผ่าน)</strong></td>`;
    for (let i = 0; i < 12; i++) {
        const t = grandTotal[i];
        const o = grandOntime[i];
        if (t === 0) {
            rowGrandPct += `<td>-</td>`;
        } else {
            const pct = ((o / t) * 100).toFixed(1);
            const cls = parseFloat(pct) >= target ? 'status-pass' : 'status-fail';
            rowGrandPct += `<td class="${cls}">${pct}%</td>`;
        }
    }
    const gPct = gTotal > 0 ? ((gOntime / gTotal) * 100).toFixed(1) : '-';
    const gCls = gPct !== '-' && parseFloat(gPct) >= target ? 'status-pass' : 'status-fail';
    rowGrandPct += `<td class="col-total ${gCls}"><strong>${gPct !== '-' ? gPct + '%' : '-'}</strong></td></tr>`;

    $tbody.append(rowGrandTotal + rowGrandOntime + rowGrandPct);
}

// ==================== RENDER CHART ====================
function renderChart(data) {
    const target   = parseFloat($('#kpiTargetInput').val()) || 80;
    const filtered = getFilteredData(data);
    const agg      = aggregateData(filtered);
    const methods  = Object.keys(agg).sort();

    const chartDom = document.getElementById('kpiChart');
    if (!chartDom) return;

    if (kpiChartInstance) {
        kpiChartInstance.dispose();
    }
    kpiChartInstance = echarts.init(chartDom);

    // Build series: one line per method (% ผ่าน) + target line
    const seriesList = [];
    const colors = [
        '#58a6ff','#3fb950','#e3b341','#f85149','#79c0ff',
        '#56d364','#ffa657','#d2a8ff','#ff7b72','#39d353'
    ];

    methods.forEach((method, idx) => {
        const mData = agg[method];
        const pctData = FISCAL_MONTHS.map((_, i) => {
            const t = mData[i].total;
            const o = mData[i].ontime;
            return t > 0 ? parseFloat(((o / t) * 100).toFixed(1)) : null;
        });

        seriesList.push({
            name: method,
            type: 'line',
            smooth: true,
            connectNulls: false,
            symbol: 'circle',
            symbolSize: 7,
            color: colors[idx % colors.length],
            data: pctData,
            markPoint: {
                data: [
                    { type: 'max', name: 'สูงสุด' },
                    { type: 'min', name: 'ต่ำสุด' }
                ]
            }
        });
    });

    // Target line
    seriesList.push({
        name: `เป้าหมาย (${target}%)`,
        type: 'line',
        smooth: false,
        symbol: 'none',
        lineStyle: { type: 'dashed', color: '#f85149', width: 2 },
        itemStyle: { color: '#f85149' },
        data: new Array(12).fill(target)
    });

    const option = {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis',
            backgroundColor: '#1c2333',
            borderColor: '#30363d',
            textStyle: { color: '#e6edf3', fontSize: 12 },
            formatter: function (params) {
                let str = `<b style="color:#e6edf3">${params[0].name}</b><br/>`;
                params.forEach(p => {
                    if (p.value !== null && p.value !== undefined) {
                        str += `${p.marker} <span style="color:#8b949e">${p.seriesName}</span>: <b style="color:#e6edf3">${p.value}%</b><br/>`;
                    }
                });
                return str;
            }
        },
        legend: {
            data: [...methods, `เป้าหมาย (${target}%)`],
            bottom: 0,
            type: 'scroll',
            textStyle: { color: '#8b949e', fontSize: 11 },
            pageTextStyle: { color: '#8b949e' },
            pageIconColor: '#58a6ff',
            pageIconInactiveColor: '#484f58'
        },
        grid: { top: 40, left: 60, right: 30, bottom: 80 },
        xAxis: {
            type: 'category',
            data: MONTH_LABELS,
            axisLabel: { fontSize: 12, color: '#8b949e' },
            axisLine: { lineStyle: { color: '#30363d' } },
            axisTick: { lineStyle: { color: '#30363d' } },
            splitLine: { lineStyle: { color: '#21262d' } }
        },
        yAxis: {
            type: 'value',
            min: 0,
            max: 100,
            axisLabel: { formatter: '{value}%', color: '#8b949e', fontSize: 11 },
            axisLine: { lineStyle: { color: '#30363d' } },
            splitLine: { lineStyle: { color: '#21262d' } }
        },
        series: seriesList
    };

    kpiChartInstance.setOption(option);

    // Responsive
    window.addEventListener('resize', function () {
        kpiChartInstance && kpiChartInstance.resize();
    });
}

// ==================== DRILL DOWN DETAIL ====================
function openDetail(methodName, monthNo, statusFilter) {
    // [แก้ไข] ส่ง sp_emp_id ไปด้วยเพื่อ drill-down ตามผู้รับผิดชอบที่กรองไว้
    const params = Object.assign(getParams(), {
        fn:          'List_Detail',
        method_name: methodName,
        month_no:    monthNo,
        status_filter: statusFilter || 'all'
    });

    // Update modal title
    let mLabel = '';
    let titleSuffix = '';
    let statusText = '';
    if (monthNo && monthNo !== '') {
        mLabel = MONTH_LABELS[FISCAL_MONTHS.indexOf(monthNo)] || '';
        titleSuffix = ` เดือน ${mLabel}`;
    } else {
        titleSuffix = ' (ทั้งปี)';
    }
    if (statusFilter === 'pass') {
        statusText = ' [ผ่านเกณฑ์]';
    }
    $('#modalDetailLabel').text(`รายละเอียด${methodName ? ' - ' + methodName : ' ทั้งหมด'}${titleSuffix}${statusText}`);
    $('#detailTableBody').html('<tr><td colspan="12" class="text-center">กำลังโหลด...</td></tr>');
    $('#modalDetail').modal('show');

    $.getJSON(API_URL, params, function (res) {
        const $tbody = $('#detailTableBody');
        $tbody.empty();
        if (!res.success || res.data.length === 0) {
            $tbody.append('<tr><td colspan="12" class="text-center text-muted">ไม่พบข้อมูล</td></tr>');
            return;
        }
        
        // Filter by status if needed (client-side filter as backup)
        const rawRows = res.data;
        let rows = rawRows;
        if (statusFilter === 'pass') {
            rows = rawRows.filter(r => r.status === 'ผ่านเกณฑ์');
        } else if (statusFilter === 'fail') {
            rows = rawRows.filter(r => r.status !== 'ผ่านเกณฑ์');
        }

        if (rows.length === 0) {
            $tbody.append('<tr><td colspan="12" class="text-center text-muted">ไม่พบข้อมูล</td></tr>');
            return;
        }

        let totalCount = rawRows.length;
        let passCount = rawRows.filter(r => r.status === 'ผ่านเกณฑ์').length;
        let failCount = totalCount - passCount;
        let totalAmount = rawRows.reduce((sum, r) => sum + (parseFloat((r.amount || '').toString().replace(/,/g, '')) || 0), 0);
        let passAmount = rawRows.filter(r => r.status === 'ผ่านเกณฑ์').reduce((sum, r) => sum + (parseFloat((r.amount || '').toString().replace(/,/g, '')) || 0), 0);
        let failAmount = totalAmount - passAmount;

        rows.forEach(function (row) {
            const statusCls = row.status === 'ผ่านเกณฑ์' ? 'text-success font-weight-bold' : 'text-danger font-weight-bold';
            $tbody.append(`<tr>
                <td>${row.no}</td>
                <td>${row.c_code || ''}</td>
                <td style="text-align:left; min-width:200px;">${row.c_name || ''}</td>
                <td>${row.emp_name || ''}</td>
                <td>${row.d_create || ''}</td>
                <td>${row.d_egp_date || ''}</td>
                <td>${row.d_doc_date || ''}</td>
                <td>${row.method_name || ''}</td>
                <td>${row.i_type_contract || ''}</td>
                <td>${row.diff_days}</td>
                <td>${row.amount}</td>
                <td class="${statusCls}">${row.status}</td>
            </tr>`);
        });

        const formatCur = new Intl.NumberFormat('th-TH', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 });
        $tbody.append(`<tr style="background:#e9f7ff; font-weight:700;"><td colspan="12">รวมทั้งหมด: ${totalCount} รายการ | ผ่านเกณฑ์: ${passCount} รายการ | ไม่ผ่านเกณฑ์: ${failCount} รายการ | วงเงินรวม: ${formatCur.format(totalAmount)}</td></tr>`);
    }).fail(function () {
        $('#detailTableBody').html('<tr><td colspan="12" class="text-center text-danger">เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>');
    });
}

// ==================== SUMMARY CARD DRILL DOWN ====================
function openSummaryDetail(type) {
    // ใช้ getParams() เพื่อรักษาตัวกรองปัจจุบันทั้งหมด
    const params = Object.assign({}, getParams(), {
        fn:          'List_Detail',
        method_name: '',
        month_no:    ''
    });

    const titles = { 
        all:  'รายการทั้งหมด', 
        pass: 'รายการที่ผ่านเกณฑ์', 
        fail: 'รายการที่ไม่ผ่านเกณฑ์' 
    };
    document.getElementById('modalDetailLabel').textContent = titles[type] || 'รายละเอียด';
    document.getElementById('detailTableBody').innerHTML = '<tr><td colspan="12" class="text-center">กำลังโหลด...</td></tr>';
    $('#modalDetail').modal('show');

    $.getJSON(API_URL, params, function (res) {
        const $tbody = $('#detailTableBody');
        $tbody.empty();
        if (!res.success || res.data.length === 0) {
            $tbody.append('<tr><td colspan="12" class="text-center text-muted">ไม่พบข้อมูล</td></tr>');
            return;
        }
        let rows = res.data;
        
        // Filter client-side ตามประเภท all/pass/fail
        if (type === 'pass') {
            rows = rows.filter(r => r.status === 'ผ่านเกณฑ์');
        } else if (type === 'fail') {
            rows = rows.filter(r => r.status !== 'ผ่านเกณฑ์');
        }
        
        if (rows.length === 0) {
            $tbody.append('<tr><td colspan="12" class="text-center text-muted">ไม่พบข้อมูล</td></tr>');
            return;
        }

        let totalCount = rows.length;
        let passCount = rows.filter(r => r.status === 'ผ่านเกณฑ์').length;
        let failCount = totalCount - passCount;

        let totalAmount = 0;
        let passAmount = 0;
        let failAmount = 0;

        rows.forEach(function (row) {
            const statusCls = row.status === 'ผ่านเกณฑ์' ? 'text-success font-weight-bold' : 'text-danger font-weight-bold';
            const amountValue = parseFloat((row.amount || '').toString().replace(/,/g, '')) || 0;
            totalAmount += amountValue;
            if (row.status === 'ผ่านเกณฑ์') passAmount += amountValue;
            else failAmount += amountValue;

            $tbody.append(`<tr>
                <td>${row.no}</td>
                <td>${row.c_code || ''}</td>
                <td style="text-align:left; min-width:200px;">${row.c_name || ''}</td>
                <td>${row.emp_name || ''}</td>
                <td>${row.d_create || ''}</td>
                <td>${row.d_egp_date || ''}</td>
                <td>${row.d_doc_date || ''}</td>
                <td>${row.method_name || ''}</td>
                <td>${row.i_type_contract || ''}</td>
                <td>${row.diff_days}</td>
                <td>${row.amount}</td>
                <td class="${statusCls}">${row.status}</td>
            </tr>`);
        });

        const formatCur = new Intl.NumberFormat('th-TH', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 });
        $tbody.append(`<tr style="background:#e9f7ff; font-weight:700;"><td colspan="12">รวมทั้งหมด: ${totalCount} รายการ | ผ่านเกณฑ์: ${passCount} รายการ | ไม่ผ่านเกณฑ์: ${failCount} รายการ | วงเงินรวม: ${formatCur.format(totalAmount)} | วงเงินผ่าน: ${formatCur.format(passAmount)} | วงเงินไม่ผ่าน: ${formatCur.format(failAmount)}</td></tr>`);
    }).fail(function () {
        $('#detailTableBody').html('<tr><td colspan="12" class="text-center text-danger">เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>');
    });
}

// ==================== UTILITIES ====================
function showLoader(show) {
    $('#pageLoader').css('display', show ? 'flex' : 'none');
}