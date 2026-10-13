<?php

$logDir = __DIR__ . '/logs/json/';
$perPage = 50;

$file = isset($_GET['file']) ? basename($_GET['file']) : date('Y-m-d') . '.log';
$typeFilter = isset($_GET['type']) ? trim($_GET['type']) : '';
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;

$fullPath = $logDir . $file;

$logs = [];
$total = 0;

if (file_exists($fullPath) && is_file($fullPath)) {

    // โหลดไฟล์ทั้งหมดแล้ว reverse เพื่อให้ล่าสุดขึ้นก่อน
    $lines = file($fullPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $lines = array_reverse($lines);

    foreach ($lines as $line) {

        $decoded = json_decode($line, true);
        if (!$decoded) continue;

        if ($typeFilter && (!isset($decoded['type']) || $decoded['type'] !== $typeFilter)) {
            continue;
        }

        if ($search && stripos($line, $search) === false) {
            continue;
        }

        $logs[] = $decoded;
    }

    $total = count($logs);
    $logs = array_slice($logs, ($page-1)*$perPage, $perPage);
}

/* โหลดรายชื่อไฟล์ */
$files = [];
if (is_dir($logDir)) {
    foreach (scandir($logDir) as $f) {
        if ($f === '.' || $f === '..') continue;
        if (is_file($logDir.$f) && substr($f, -4) === '.log') {
            $files[] = $f;
        }
    }
    rsort($files); // เรียงไฟล์ล่าสุดก่อน
}

$totalPages = $total > 0 ? ceil($total / $perPage) : 1;

?>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Log Viewer</title>
<style>
body { font-family: Arial; background:#f4f6f9; margin:20px; }
h2 { margin-bottom:10px; }
table { width:100%; border-collapse: collapse; background:#fff; }
th, td { border:1px solid #ccc; padding:6px; font-size:12px; vertical-align: top; }
th { background:#343a40; color:#fff; }
pre { margin:0; white-space:pre-wrap; word-wrap:break-word; }
.filter-box { background:#fff; padding:10px; margin-bottom:15px; border:1px solid #ddd; }
button { padding:5px 10px; }
.pagination a {
    padding:4px 8px;
    border:1px solid #333;
    margin-right:3px;
    text-decoration:none;
    font-size:12px;
}
.pagination strong {
    padding:4px 8px;
    background:#333;
    color:#fff;
}
</style>
</head>
<body>

<h2>📄 JSON Log Viewer (Latest First)</h2>

<div class="filter-box">
<form method="GET">

    File:
    <select name="file">
        <?php foreach($files as $f): ?>
            <option value="<?= htmlspecialchars($f) ?>" <?= $f==$file?'selected':'' ?>>
                <?= htmlspecialchars($f) ?>
            </option>
        <?php endforeach; ?>
    </select>

    Type:
    <input type="text" name="type" value="<?= htmlspecialchars($typeFilter) ?>" placeholder="INFO / ERROR">

    Search:
    <input type="text" name="search" value="<?= htmlspecialchars($search) ?>" placeholder="keyword">

    <button type="submit">Filter</button>

</form>
</div>

<div>
Total: <?= $total ?> records | Page <?= $page ?> / <?= $totalPages ?>
</div>

<br>

<table>
<tr>
    <th>DateTime</th>
    <th>Transaction</th>
    <th>IP</th>
    <th>Method</th>
    <th>Type</th>
    <th>Data</th>
</tr>

<?php foreach($logs as $log): ?>
<tr>
    <td><?= isset($log['datetime']) ? htmlspecialchars($log['datetime']) : '' ?></td>
    <td><?= isset($log['transaction_id']) ? htmlspecialchars($log['transaction_id']) : '' ?></td>
    <td><?= isset($log['ip']) ? htmlspecialchars($log['ip']) : '' ?></td>
    <td><?= isset($log['method']) ? htmlspecialchars($log['method']) : '' ?></td>
    <td><?= isset($log['type']) ? htmlspecialchars($log['type']) : '' ?></td>
    <td>
        <pre><?= htmlspecialchars(json_encode($log['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) ?></pre>
    </td>
</tr>
<?php endforeach; ?>

</table>

<br>

<div class="pagination">
<?php for($i=1;$i<=$totalPages;$i++): ?>
    <?php if($i==$page): ?>
        <strong><?= $i ?></strong>
    <?php else: ?>
        <a href="?file=<?= urlencode($file) ?>&type=<?= urlencode($typeFilter) ?>&search=<?= urlencode($search) ?>&page=<?= $i ?>">
            <?= $i ?>
        </a>
    <?php endif; ?>
<?php endfor; ?>
</div>

</body>
</html>