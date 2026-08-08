<?php
// Suppress all PHP errors/warnings to prevent FastCGI header corruption on Tomcat
error_reporting(0);
@ini_set('display_errors', '0');
@ini_set('display_startup_errors', '0');
ob_start();

$type = isset($_GET['type']) ? trim($_GET['type']) : '';
$name = isset($_GET['name']) ? trim($_GET['name']) : '';   // c_name (แหล่งเงิน) หรือ bg_expense เต็ม
$code = isset($_GET['code']) ? trim($_GET['code']) : '';   // bg_expense_id (รหัส 12 หลัก)
$fund = isset($_GET['fund']) ? trim($_GET['fund']) : '';   // c_name กรองเพิ่มเติมใน multi-fund
$year_param = isset($_GET['year']) ? intval($_GET['year']) : 0; // ปีที่เลือก (พ.ศ.) 0 = ทุกปี

function h($s) { return htmlspecialchars($s, ENT_QUOTES, 'UTF-8'); }

date_default_timezone_set('Asia/Bangkok');

$proto = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$scriptDir = dirname($_SERVER['SCRIPT_NAME']);
$apiDir = str_replace('/reports', '/api', $scriptDir);
$apiBase = $proto . '://' . $host . $apiDir . '/List_Rep_Budget_Monitoring_Dashboard.php';

// ถ้าส่ง year มา → โหลดเฉพาะปีนั้น, ไม่ส่ง → โหลดทุกปี
if ($year_param > 0) {
    $years_th = [$year_param];
} else {
    $years_th = [2568, 2569];  // default: แสดงเฉพาะ 2568-2569
}
$years_en = array_map(function($y){ return $y - 543; }, $years_th);

function fetchApi($url) {
    // แทนที่ hostname ด้วย 127.0.0.1 เพื่อหลีกเลี่ยง Tomcat HTTPS layer
    // ที่ทำให้เกิด "response object recycled" error
    $urlInternal = preg_replace('#^(https?://)([^/]+)#', '$1127.0.0.1', $url);

    // ดึง port จาก original host มาใส่ด้วย
    $parsedHost = parse_url($url, PHP_URL_HOST);
    $parsedPort = parse_url($url, PHP_URL_PORT);
    if ($parsedPort) {
        $urlInternal = preg_replace('#^(https?://)127\.0\.0\.1#', '$1127.0.0.1:' . $parsedPort, $urlInternal);
    }

    // ใส่ Host header เพื่อให้ server รู้ว่าเป็น virtual host เดิม
    $hostHeader = $parsedHost . ($parsedPort ? ':' . $parsedPort : '');

    $ch = curl_init($urlInternal);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
    curl_setopt($ch, CURLOPT_TIMEOUT, 20);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Host: ' . $hostHeader,
        'Connection: close',   // ปิด keep-alive เพื่อป้องกัน Tomcat recycle response
        'Accept: application/json',
    ]);
    $out = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError || $httpCode !== 200 || !$out) {
        // fallback: ลอง original URL ถ้า 127.0.0.1 ไม่ work
        $ch2 = curl_init($url);
        curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch2, CURLOPT_CONNECTTIMEOUT, 8);
        curl_setopt($ch2, CURLOPT_TIMEOUT, 25);
        curl_setopt($ch2, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch2, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch2, CURLOPT_FOLLOWLOCATION, false);
        curl_setopt($ch2, CURLOPT_HTTPHEADER, ['Connection: close', 'Accept: application/json']);
        $out = curl_exec($ch2);
        $httpCode = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
        curl_close($ch2);
        if (!$out || $httpCode !== 200) return ['data' => []];
    }

    // ตัด BOM / whitespace / PHP notice นำหน้า JSON
    $out = ltrim($out, "\xEF\xBB\xBF \t\n\r");
    $start = strpos($out, '{');
    if ($start === false) return ['data' => []];
    $out = substr($out, $start);
    return json_decode($out, true) ?? ['data' => []];
}

// Label แสดงใน header
$displayLabel = $code ?: $name ?: '- ทั้งหมด -';

// ===== DEBUG: แสดง API URL และ row count (ลบออกหลัง debug) =====
$_debug = [];
foreach ($years_en as $idx => $yen) {
    $yth = $years_th[$idx];
    $q = $apiBase . '?fn=List_QueryParam&year_en=' . intval($yen) . '&year_th=' . intval($yth);
    $_debug[] = ['url' => $q, 'year_th' => $yth];
}
// ===== END DEBUG =====

$rows = [];
foreach ($years_en as $idx => $yen) {
    $yth = $years_th[$idx];
    $q = $apiBase . '?fn=List_QueryParam&year_en=' . intval($yen) . '&year_th=' . intval($yth);
    $resp = fetchApi($q);
    $data = $resp['data'] ?? [];

    foreach ($data as $d) {
        $match = false;

        if ($type === 'dataview' && $code !== '') {
            // กรองด้วย bg_expense_id (รหัส 12 หลัก) — exact prefix match
            $bgId = trim($d['bg_expense_id'] ?? '');
            if ($bgId === $code) $match = true;
            // กรอง fund เพิ่มเติมถ้ามี
            if ($match && $fund !== '' && ($d['c_name'] ?? '') !== $fund) $match = false;

        } elseif ($type === 'fund' && $name !== '') {
            // กรองด้วย c_name ตรงๆ — มาจากคลิกกราฟ
            if (($d['c_name'] ?? '') === $name) $match = true;

        } else {
            // fallback
            if ($code !== '' && mb_stripos($d['bg_expense_id'] ?? '', $code) !== false) $match = true;
            elseif ($name !== '' && mb_stripos($d['bg_expense'] ?? '', $name) !== false) $match = true;
            elseif ($code === '' && $name === '') $match = true;
        }

        if ($match) {
            $d['budget_year_th'] = $yth;
            $rows[] = $d;
        }
    }
}

$summary = [];
foreach ($rows as $r) {
    $key = $r['budget_year_th'] . '||' . ($r['bg_expense'] ?? '') . '||' . ($r['c_name'] ?? '');
    if (!isset($summary[$key])) {
        $summary[$key] = [
            'year'              => $r['budget_year_th'],
            'bg_expense'        => $r['bg_expense'] ?? '',
            'c_name'            => $r['c_name'] ?? '',
            'f_plan_begin'      => 0,
            'f_reserve_budget'  => 0
        ];
    }
    $summary[$key]['f_plan_begin']     += floatval($r['f_plan_begin'] ?? 0);
    $summary[$key]['f_reserve_budget'] += floatval($r['f_reserve_budget'] ?? 0);
}

$summary = array_values($summary);
usort($summary, function($a, $b){ return $b['year'] - $a['year']; });
?>
<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>รายละเอียดแหล่งเงิน</title>

<link rel="stylesheet" href="../bootstrap/bootstrap-4.6.2-dist/css/bootstrap.min.css">
<script src="../../ws_user/js/jquery.min.js"></script>
<script src="../bootstrap/bootstrap-4.6.2-dist/js/bootstrap.bundle.min.js"></script>

<style>
body {
    background: #f4f7fb;
    font-family: "Sarabun", sans-serif;
}

.card-custom {
    border-radius: 14px;
    border: none;
    box-shadow: 0 8px 24px rgba(18,58,125,0.08);
    overflow: hidden;
}

.card-header {
    background: #123a7d !important;
    border-bottom: none;
    padding: 18px 24px;
}

.card-header h5 {
    font-weight: 600;
    letter-spacing: 0.3px;
}

.badge-count {
    background: #ffffff;
    color: #123a7d;
    font-weight: 600;
    padding: 6px 14px;
    border-radius: 50px;
    font-size: 14px;
}

.btn-outline-secondary {
    border-radius: 50px;
}

.btn-outline-secondary:hover {
    background: #123a7d;
    color: #fff;
    border-color: #123a7d;
}

#tableSearch {
    border-radius: 50px;
    padding-left: 15px;
    border: 1px solid #d1d9e6;
}

#tableSearch:focus {
    border-color: #123a7d;
    box-shadow: 0 0 0 0.2rem rgba(18,58,125,0.15);
}

.table {
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
}

.table thead th {
    background: #123a7d;
    color: #fff;
    font-weight: 500;
    font-size: 14px;
}

.table tbody tr {
    transition: 0.2s ease;
}

.table tbody tr:hover {
    background-color: rgba(18,58,125,0.06);
}

.table tbody tr:nth-child(even) {
    background: #f9fbff;
}

.text-primary {
    color: #123a7d !important;
}

.footer-info {
    font-size: 13px;
    color: #6c757d;
}
</style>
</head>

<body>

<div class="container-fluid mt-4">

<div class="card card-custom">
<div class="card-header text-white d-flex justify-content-between align-items-center">
    <div>
        <h5 class="mb-0">
            รายละเอียดแหล่งเงิน :
            <strong><?php echo h($displayLabel); ?></strong>
        </h5>
        <small><?php echo ($year_param > 0) ? 'ปีงบประมาณ พ.ศ. ' . $year_param : 'ปีงบประมาณ พ.ศ. ' . implode(', ', $years_th); ?></small>
    </div>

    <span class="badge badge-count">
        <?php echo count($summary); ?> รายการ
    </span>
</div>

<div class="card-body">

<div class="row mb-3">
    <div class="col-md-6">
        <a class="btn btn-outline-secondary btn-sm"
           href="Budget_Monitoring_Dashboard_New.php">
           ← กลับ
        </a>
    </div>
    <?php if (count($summary) === 0): ?>
    <div class="col-12 mt-2">
        <div class="alert alert-warning small">
            <strong>Debug:</strong> พบ <?php echo count($rows); ?> raw rows | ปีที่โหลด: <?php echo implode(', ', $years_th); ?><br>
            <?php foreach ($_debug as $d): ?>
                API: <code><?php echo htmlspecialchars($d['url']); ?></code><br>
            <?php endforeach; ?>
        </div>
    </div>
    <?php endif; ?>

    <div class="col-md-6 text-right">
        <input id="tableSearch"
               class="form-control form-control-sm d-inline-block"
               style="width:250px"
               placeholder="🔍 ค้นหา...">
    </div>
</div>

<div class="table-responsive">
<table class="table table-bordered table-hover table-sm">
<thead class="text-center">
<tr>
    <th width="8%">ปี</th>
    <th width="25%">รายละเอียดงบประมาณ</th>
    <th width="20%">แหล่งเงิน</th>
    <th class="text-right">งบรวม</th>
    <th class="text-right">จอง/ใช้ไปแล้ว</th>
    <th class="text-right">คงเหลือ</th>
</tr>
</thead>
<tbody>
<?php foreach ($summary as $row):
    $remain = $row['f_plan_begin'] - $row['f_reserve_budget'];
?>
<tr>
    <td class="text-center"><?php echo h($row['year']); ?></td>
    <td><?php echo h($row['bg_expense']); ?></td>
    <td><?php echo h($row['c_name']); ?></td>
    <td class="text-right text-primary font-weight-bold">
        <?php echo number_format($row['f_plan_begin'],2); ?>
    </td>
    <td class="text-right text-danger">
        <?php echo number_format($row['f_reserve_budget'],2); ?>
    </td>
    <td class="text-right text-success font-weight-bold">
        <?php echo number_format($remain,2); ?>
    </td>
</tr>
<?php endforeach; ?>
</tbody>
</table>
</div>

<div class="text-right mt-2 footer-info text-muted">
    ข้อมูล ณ วันที่ <?php echo date('d/m/Y H:i'); ?>
</div>

</div>
</div>

</div>

<script>
$(function(){
    $("#tableSearch").on("keyup", function() {
        let value = $(this).val().toLowerCase();
        $("table tbody tr").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });
});
</script>

</body>
</html>
<?php ob_end_flush(); ?>