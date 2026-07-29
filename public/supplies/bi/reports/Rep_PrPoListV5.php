<?php
define('INCLUDED_AS_LIB', true);
include("../api/List_DetailBgV5.php");
include("../../lib/export/exportUtil.php");

$year_en = isset($_REQUEST["year_en"]) ? intval($_REQUEST["year_en"]) : intval(date('Y'));
$year_th = $year_en + 543;
$col     = in_array($_REQUEST["col"] ?? "", ["pr", "po"]) ? $_REQUEST["col"] : "pr";
$dc_cost_id = isset($_REQUEST["dc_cost_id"]) ? intval($_REQUEST["dc_cost_id"]) : 38;

// [FIX] รองรับเลือกได้หลายแหล่งเงินพร้อมกัน (ค่าที่ส่งมาอาจเป็น "5,4")
// เดิมใช้ intval() ตรงๆ ซึ่งจะตัดเหลือแค่ id แรก ("5,4" -> 5) ทำให้ข้อมูล
// แหล่งเงินที่ 2 หายไปจากรายงาน
$dc_expense_budget_type_id_raw = trim((string)($_REQUEST["dc_expense_budget_type_id"] ?? ""));
$dc_expense_budget_type_ids = array_values(array_filter(
    array_map('intval', explode(',', $dc_expense_budget_type_id_raw)),
    function ($v) { return $v > 0; }
));

// inject กลับเข้า $_REQUEST เพื่อให้ List_QueryParam() รับค่าถูกต้อง
$_REQUEST["dc_cost_id"] = $dc_cost_id;
$_REQUEST["year_en"]    = $year_en;
// [FIX] ไม่ส่ง dc_expense_budget_type_id (ตัวเดียว) ไปกรองที่ List_QueryParam อีกต่อไป
// เพราะรองรับกรองได้แค่ id เดียว — ดึงข้อมูลทั้งหมดของปี/dc_cost_id มาก่อน
// แล้วค่อยกรองเองด้านล่าง เพื่อรองรับกรณีเลือกหลายแหล่งเงินพร้อมกัน
unset($_REQUEST["dc_expense_budget_type_id"]);

// ดึงข้อมูล
$data_json = List_QueryParam();
$data_arr  = json_decode($data_json, true);
$pr_rows   = $data_arr["data"]     ?? [];
$po_rows   = $data_arr["contract"] ?? [];

// [FIX] กรองตามแหล่งเงินที่เลือกไว้ทั้งหมด (ถ้าไม่ได้เลือกเลย = แสดงทั้งหมด)
if (!empty($dc_expense_budget_type_ids)) {
    $pr_rows = array_values(array_filter($pr_rows, function ($r) use ($dc_expense_budget_type_ids) {
        return in_array(intval($r['dc_expense_budget_type_id'] ?? 0), $dc_expense_budget_type_ids, true);
    }));
    $po_rows = array_values(array_filter($po_rows, function ($r) use ($dc_expense_budget_type_ids) {
        return in_array(intval($r['dc_expense_budget_type_id'] ?? 0), $dc_expense_budget_type_ids, true);
    }));
}

// กรองเฉพาะ PR ที่ยังไม่มี PO
$pr_only = array_filter($pr_rows, function($r) { 
    return intval($r['has_po'] ?? 0) === 0; 
});
$pr_only = array_values($pr_only);

$f_pr_total       = array_sum(array_column($pr_only, 'f_amt'));
// [FIX] คำนวณจาก po_rows ที่กรองแล้ว แทนการใช้ f_contract_total รวมทั้งหมดแบบไม่กรอง
$f_contract_total = array_sum(array_column($po_rows, 'f_amt_contract'));

$is_pr = ($col === "pr");
$rows  = $is_pr ? $pr_only : $po_rows;
$title_page = $is_pr ? "รายการจอง PR (ยังไม่มี PO)" : "รายการจองสัญญา (PO)";
$total_amt  = $is_pr ? $f_pr_total : $f_contract_total;
$total_count = count($rows);

function thaiDate($d) {
    if (!$d || $d === '0000-00-00') return '-';
    $months = ["","ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
    $dt = new DateTime($d);
    return (int)$dt->format("j")." ".$months[(int)$dt->format("n")]." ".((int)$dt->format("Y")+543);
}
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title><?= $title_page ?> - ปี <?= $year_th ?></title>
    <?php include("../lib/loadJs.php"); ?>
    <script src="../../ws_user/js/jquery.min.js"></script>
    <script src="../../lib/xlsx-js-style.min.js"></script>
    <link rel="stylesheet" href="../../css/report_css.css"/>
    <link rel="stylesheet" href="../css/report-style.css"/>
    <link rel="stylesheet" href="../bootstrap/bootstrap-4.6.2-dist/css/bootstrap.min.css"/>
    <link rel="stylesheet" href="../css/report-style-table.css"/>
    <style>
        body { background: #f8f9fc; font-family: 'Sarabun', sans-serif; }
        .page-header { background: #fff; border-bottom: 1px solid #e3e6f0; padding: 1rem 1.5rem; margin-bottom: 1.5rem; }
        .page-header h4 { margin: 0; font-weight: 700; color: <?= $is_pr ? '#f6c23e' : '#e74a3b' ?>; }
        .stat-card { background: #fff; border-left: 4px solid <?= $is_pr ? '#f6c23e' : '#e74a3b' ?>; border-radius: 6px; padding: 1rem 1.5rem; box-shadow: 0 1px 4px rgba(0,0,0,.06); }
        .stat-card .stat-title { font-size: .8rem; color: #858796; text-transform: uppercase; letter-spacing: .05em; margin-bottom: .25rem; }
        .stat-card .stat-value { font-size: 1.5rem; font-weight: 700; }
        .card-custom { background: #fff; border-radius: 8px; box-shadow: 0 1px 6px rgba(0,0,0,.07); overflow: hidden; margin-bottom: 1.5rem; }
        .toolbar { display: flex; justify-content: space-between; align-items: center; padding: .75rem 1rem; border-bottom: 1px solid #e3e6f0; flex-wrap: wrap; gap: .5rem; }
        .search-box { position: relative; }
        .search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); font-style: normal; font-size: .9rem; }
        .search-box input { padding-left: 32px; border-radius: 20px; font-size: .85rem; border: 1px solid #d1d3e2; width: 280px; height: 34px; }
        .table-modern { width: 100%; border-collapse: collapse; font-size: .875rem; }
        .table-modern thead th { background: <?= $is_pr ? '#f6c23e' : '#e74a3b' ?>; color: <?= $is_pr ? '#000' : '#fff' ?>; padding: .6rem .75rem; font-weight: 600; white-space: nowrap; position: sticky; top: 0; z-index: 1; }
        .table-modern tbody tr:nth-child(even) { background: #f8f9fc; }
        .table-modern tbody tr:hover { background: #eaecf4; }
        .table-modern td { padding: .5rem .75rem; border-bottom: 1px solid #e3e6f0; vertical-align: middle; }
        .badge-custom { display: inline-block; padding: .2rem .5rem; border-radius: 4px; font-size: .75rem; font-weight: 600; white-space: nowrap; }
        .bg-status-blue   { background: #cce5ff; color: #004085; }
        .bg-status-green  { background: #d4edda; color: #155724; }
        .bg-status-orange { background: #fff3cd; color: #856404; }
        .bg-status-gray   { background: #e2e3e5; color: #383d41; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .footer-note { padding: .75rem 1rem; text-align: right; font-size: .8rem; color: #858796; border-top: 1px solid #e3e6f0; }
        @media print { .toolbar { display: none; } }
    </style>
</head>
<body>

<div class="page-header">
    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
            <h4><?= $is_pr ? '📋' : '📑' ?> <?= $title_page ?></h4>
            <small class="text-muted">ปีงบประมาณ <?= $year_th ?> &nbsp;|&nbsp; ข้อมูล ณ วันที่ <?= date("d/m/Y H:i") ?></small>
        </div>
        <button class="btn btn-outline-secondary btn-sm" onclick="window.close()">✕ ปิดหน้านี้</button>
    </div>
</div>

<div class="container-fluid pb-5">

    <!-- Stat Card: show only for the selected view -->
    <div class="row mb-4">
        <div class="col-12 mb-3">
            <div class="stat-card">
                <div class="stat-title"><?= $title_page ?></div>
                <div class="stat-value <?= $is_pr ? 'text-warning' : 'text-danger' ?>"><?= number_format($total_amt, 2) ?> บาท</div>
                <div class="small text-muted"><?= number_format($total_count) ?> รายการ</div>
            </div>
        </div>
    </div>

    <!-- ตาราง -->
    <div class="card-custom">
        <div class="toolbar">
            <div class="d-flex align-items-center gap-2">
                <span class="<?= $is_pr ? 'text-warning' : 'text-danger' ?> font-weight-bold">
                    ยอดรวม: <?= number_format($total_amt, 2) ?> บาท (<?= $total_count ?> รายการ)
                </span>
            </div>
            <div class="d-flex align-items-center gap-2">
                <div class="search-box">
                    <i class="search-icon">🔍</i>
                    <input type="text" id="searchInput" class="form-control"
                           placeholder="ค้นหา<?= $is_pr ? ' เลขที่ PR' : ' เลขที่ PO' ?>, รายการ, ผู้รับผิดชอบ...">
                </div>
                <button class="btn <?= $is_pr ? 'btn-warning' : 'btn-danger' ?> btn-sm rounded-pill px-3 ml-2"
                        onclick="exportToExcel()">
                    📊 Export Excel
                </button>
            </div>
        </div>

        <div class="table-responsive">
            <?php if ($is_pr): ?>
            <table class="table-modern" id="mainTable">
                <thead>
                    <tr>
                        <th class="text-center" width="45">#</th>
                        <th>เลขที่ PR</th>
                        <th>ชื่อรายการ</th>
                        <th>ประเภทความก้าวหน้า</th>
                        <th>หน่วยงาน</th>
                        <th>สถานะ</th>
                        <th>แหล่งเงิน</th>
                        <th>ผู้รับผิดชอบ</th>
                        <th>สายงาน</th>
                        <th class="text-right">เงินจอง PR (บาท)</th>
                    </tr>
                </thead>
                <tbody id="mainTableBody">
                    <?php if ($total_count > 0): ?>
                        <?php foreach ($rows as $i => $row):
                            $status = $row['sp_status_hdr'] ?? '-';
                            $badgeClass = 'bg-status-gray';
                            if (strpos($status, 'e-GP') !== false) $badgeClass = 'bg-status-blue';
                            elseif (strpos($status, 'อนุมัติ') !== false) $badgeClass = 'bg-status-green';
                            elseif (strpos($status, 'รอ') !== false) $badgeClass = 'bg-status-orange';
                            $f_amt = floatval($row['f_amt'] ?? 0);
                        ?>
                        <tr>
                            <td class="text-center text-muted"><?= $i+1 ?></td>
                            <td class="font-weight-bold text-primary"><?= htmlspecialchars($row['c_code'] ?? '-') ?></td>
                            <td><div style="min-width:300px;white-space:normal;word-wrap:break-word;line-height:1.4;"><?= htmlspecialchars($row['c_name'] ?? '-') ?></div></td>
                            <td>
                                <small class="d-block text-muted"><?= htmlspecialchars($row['event_type'] ?? '-') ?></small>
                                <?= htmlspecialchars($row['sp_event_detail'] ?? '') ?>
                            </td>
                            <td>
                                <div><?= htmlspecialchars($row['dc_cost_id2'] ?? '-') ?></div>
                                <small class="text-muted"><?= htmlspecialchars($row['dc_sub_cost'] ?? '') ?></small>
                            </td>
                            <td><span class="badge-custom <?= $badgeClass ?>"><?= htmlspecialchars($status) ?></span></td>
                            <td>
                                <div><?= htmlspecialchars($row['dc_expense_budget_type'] ?? '-') ?></div>
                                <small class="text-muted"><?= htmlspecialchars($row['bg_expense'] ?? '') ?></small>
                            </td>
                            <td><?= htmlspecialchars($row['sp_emp'] ?? '-') ?></td>
                            <td><?= htmlspecialchars($row['dc_department'] ?? '-') ?></td>
                            <td class="text-right font-weight-bold"><?= number_format($f_amt, 2) ?></td>
                        </tr>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <tr><td colspan="10" class="text-center py-5 text-muted">ไม่พบข้อมูล</td></tr>
                    <?php endif; ?>
                </tbody>
            </table>
            <?php else: ?>
            <table class="table-modern" id="mainTable">
                <thead>
                    <tr>
                        <th class="text-center" width="45">#</th>
                        <th>เลขที่ PO</th>
                        <th>ชื่อรายการ</th>
                        <th>หน่วยงาน</th>
                        <th>สถานะ</th>
                        <th>แหล่งเงิน</th>
                        <th>ผู้รับผิดชอบ</th>
                        <th>สายงาน</th>
                        <th class="text-right">เงินจองสัญญา (บาท)</th>
                    </tr>
                </thead>
                <tbody id="mainTableBody">
                    <?php if ($total_count > 0): ?>
                        <?php foreach ($rows as $i => $row):
                            $status = $row['sp_status_hdr'] ?? '-';
                            $badgeClass = 'bg-status-gray';
                            if (strpos($status, 'e-GP') !== false) $badgeClass = 'bg-status-blue';
                            elseif (strpos($status, 'อนุมัติ') !== false) $badgeClass = 'bg-status-green';
                            elseif (strpos($status, 'รอ') !== false) $badgeClass = 'bg-status-orange';
                            $f_amt = floatval($row['f_amt_contract'] ?? 0);
                        ?>
                        <tr>
                            <td class="text-center text-muted"><?= $i+1 ?></td>
                            <td class="font-weight-bold text-danger"><?= htmlspecialchars($row['po_code'] ?? '-') ?></td>
                            <td><div style="min-width:300px;white-space:normal;word-wrap:break-word;line-height:1.4;"><?= htmlspecialchars($row['po_name'] ?? '-') ?></div></td>
                            <td>
                                <div><?= htmlspecialchars($row['dc_cost_id2'] ?? '-') ?></div>
                                <small class="text-muted"><?= htmlspecialchars($row['dc_sub_cost'] ?? '') ?></small>
                            </td>
                            <td><span class="badge-custom <?= $badgeClass ?>"><?= htmlspecialchars($status) ?></span></td>
                            <td>
                                <div><?= htmlspecialchars($row['dc_expense_budget_type'] ?? '-') ?></div>
                                <small class="text-muted"><?= htmlspecialchars($row['bg_expense'] ?? '') ?></small>
                            </td>
                            <td><?= htmlspecialchars($row['sp_emp'] ?? '-') ?></td>
                            <td><?= htmlspecialchars($row['dc_department'] ?? '-') ?></td>
                            <td class="text-right font-weight-bold text-danger"><?= number_format($f_amt, 2) ?></td>
                        </tr>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <tr><td colspan="9" class="text-center py-5 text-muted">ไม่พบข้อมูล</td></tr>
                    <?php endif; ?>
                </tbody>
            </table>
            <?php endif; ?>
        </div>
        <div class="footer-note">ข้อมูล ณ วันที่ <?= date("d/m/Y H:i") ?></div>
    </div>

</div>

<script>
// ===== Search =====
document.getElementById("searchInput").addEventListener("input", function() {
    var q = this.value.toLowerCase();
    document.querySelectorAll("#mainTableBody tr").forEach(function(tr) {
        tr.style.display = tr.textContent.toLowerCase().includes(q) ? "" : "none";
    });
});

// ===== Export Excel =====
function exportToExcel() {
    var X = XLSX;
    var isPr  = <?= $is_pr ? 'true' : 'false' ?>;
    var yearTh = <?= $year_th ?>;
    var totalAmt = <?= $total_amt ?>;
    var numFmt = '#,##0.00';

    var headers = isPr
        ? ["#","เลขที่ PR","ชื่อรายการ","ประเภทความก้าวหน้า","หน่วยงาน","สถานะ","แหล่งเงิน","ผู้รับผิดชอบ","สายงาน","เงินจอง PR (บาท)"]
        : ["#","เลขที่ PO","ชื่อรายการ","หน่วยงาน","สถานะ","แหล่งเงิน","ผู้รับผิดชอบ","สายงาน","เงินจองสัญญา (บาท)"];

    var colCount = headers.length;
    var amtCol   = colCount - 1;

    function cs(bgHex, fontHex, bold, numFmtCode, h) {
        var s = {
            fill: { patternType: 'solid', fgColor: { rgb: bgHex || 'FFFFFFFF' } },
            font: { bold: !!bold, sz: 10, name: 'Calibri' },
            alignment: { vertical: 'center', horizontal: h || 'left', wrapText: false },
            border: {
                top:    { style: 'thin', color: { rgb: 'FFD1D5DB' } },
                bottom: { style: 'thin', color: { rgb: 'FFD1D5DB' } },
                left:   { style: 'thin', color: { rgb: 'FFD1D5DB' } },
                right:  { style: 'thin', color: { rgb: 'FFD1D5DB' } },
            }
        };
        if (fontHex) s.font.color = { rgb: fontHex };
        if (numFmtCode) { s.numFmt = numFmtCode; s.alignment.horizontal = 'right'; }
        if (h) s.alignment.horizontal = h;
        return s;
    }
    function cell(v, bgHex, fontHex, bold, numFmtCode, h) {
        return { v: v, t: typeof v === 'number' ? 'n' : 's', s: cs(bgHex, fontHex, bold, numFmtCode, h) };
    }

    var hdrBg  = isPr ? 'F6C23E' : 'E74A3B';
    var hdrFc  = isPr ? '000000' : 'FFFFFF';
    var sumBg  = isPr ? 'FFF3CD' : 'FADBD8';
    var sumFc  = isPr ? '856404' : '922B21';
    var stripe = isPr ? 'FFFDE7' : 'FFF5F5';
    var titleLabel = isPr ? 'รายการจอง PR (ยังไม่มี PO)' : 'รายการจองสัญญา (PO)';

    var aoa = [];

    // Row 1: title
    aoa.push([cell("ปีงบประมาณ " + yearTh + "  |  " + titleLabel, 'D9E1F2', '1F3864', true)]);
    // Row 2: summary
    aoa.push([
        cell("ยอดรวม", hdrBg, hdrFc, true),
        cell(totalAmt, 'F2F2F2', null, true, numFmt),
        cell("จำนวน", hdrBg, hdrFc, true),
        cell(<?= $total_count ?>, 'F2F2F2', null, true, null, 'right'),
        cell("รายการ", hdrBg, hdrFc, true)
    ]);
    // Row 3: empty
    aoa.push([cell('', 'FFFFFFFF')]);

    // Header row
    aoa.push(headers.map(function(h, i) {
        return cell(h, hdrBg, hdrFc, true, null, i === amtCol ? 'right' : 'center');
    }));

    // Data rows
    var rows = [];
    $("#mainTableBody tr:visible").each(function() {
        var row = [];
        $(this).find("td").each(function(i) {
            var txt = $(this).text().trim().replace(/\s+/g, " ");
            if (i === amtCol) row.push(parseFloat(txt.replace(/,/g, "")) || 0);
            else row.push(txt);
        });
        rows.push(row);
    });

    rows.forEach(function(r, ri) {
        var bg = ri % 2 === 0 ? stripe : 'FFFFFFFF';
        aoa.push(r.map(function(v, ci) {
            if (ci === amtCol) return cell(v, bg, sumFc, true, numFmt);
            if (ci === 1) return cell(String(v), bg, isPr ? '0000AA' : 'AA0000', true, null, 'center');
            return cell(String(v), bg, null, false);
        }));
    });

    // Sum row
    aoa.push(headers.map(function(h, i) {
        if (i === amtCol - 1) return cell("ยอดรวม", sumBg, sumFc, true);
        if (i === amtCol)     return cell(totalAmt, sumBg, sumFc, true, numFmt);
        return cell('', sumBg, null, false);
    }));

    // Build sheet
    var ws = {};
    var maxC = 0;
    aoa.forEach(function(row, ri) {
        if (row.length > maxC) maxC = row.length;
        row.forEach(function(c, ci) {
            if (c == null) return;
            ws[X.utils.encode_cell({r: ri, c: ci})] = c;
        });
    });
    ws["!ref"] = X.utils.encode_range({s:{r:0,c:0}, e:{r:aoa.length-1,c:maxC-1}});

    // Column widths
    var wch = isPr
        ? [{wch:5},{wch:18},{wch:55},{wch:35},{wch:22},{wch:20},{wch:32},{wch:18},{wch:18},{wch:18}]
        : [{wch:5},{wch:18},{wch:55},{wch:22},{wch:20},{wch:32},{wch:18},{wch:18},{wch:18}];
    ws['!cols'] = wch;
    ws['!freeze'] = {xSplit:0, ySplit:4};

    var wb = X.utils.book_new();
    X.utils.book_append_sheet(wb, ws, titleLabel.substring(0, 30));
    X.writeFile(wb, (isPr ? "PR_List_" : "PO_List_") + "<?= date('Ymd_Hi') ?>.xlsx");
}
</script>
</body>
</html>