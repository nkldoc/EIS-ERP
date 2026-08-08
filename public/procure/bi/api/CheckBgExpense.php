<?php
// ===========================================================================
// Query เพื่อดู bg_expense ที่มีข้อมูลในฐานข้อมูล
// ===========================================================================
if (ob_get_level() === 0) ob_start();
error_reporting(E_ALL);
ini_set('display_errors', '1');

header('Content-Type: text/html; charset=utf-8');

// Load database config
@include("../../conf/config.php");
@include("../../lib/database/DatabaseServer.php");

// Initialize database
$db = null;
if (class_exists('DatabaseServer') && function_exists('sqlsrv_connect') && defined('DB_SERVER') && defined('DB_USER')) {
	try {
		$db = new DatabaseServer();
	} catch (\Throwable $e) {
		echo "Error connecting to database: " . $e->getMessage();
		exit;
	}
}

if ($db === null) {
	echo "Database not initialized";
	exit;
}

// Query ทั้งหมด bg_expense
$sql = "SELECT TOP 500 bg_expense_id, c_code, c_name FROM NMU_EIS..bg_expense ORDER BY c_code";

$stmt = $db->QueryParam($sql, []);
if (!$stmt) {
	echo "Query failed";
	exit;
}

echo "<h2>ทั้งหมด bg_expense ในฐานข้อมูล (500 รายการแรก)</h2>";
echo "<table border='1' cellpadding='10' style='border-collapse: collapse; font-size: 12px;'>";
echo "<tr><th>ID</th><th>c_code (รหัส)</th><th>c_name (ชื่อ)</th></tr>";

$count = 0;
while ($row = $db->Fetch($stmt)) {
	$count++;
	$code = htmlspecialchars($row['c_code'] ?? '');
	$name = htmlspecialchars($row['c_name'] ?? '');
	echo "<tr><td>{$row['bg_expense_id']}</td><td><strong>$code</strong></td><td>$name</td></tr>";
}

echo "</table>";
echo "<p>รวม: $count รายการ</p>";

// Query ค้นหาเฉพาะ 4 รหัสที่ผู้ใช้ถาม
echo "<hr>";
echo "<h2>ค้นหา 4 รหัสที่ผู้ใช้ถาม</h2>";

$targetCodes = [
	'050100040001',
	'050100050001',
	'10010002033',
	'030200660001'
];

foreach ($targetCodes as $code) {
	$sql = "SELECT bg_expense_id, c_code, c_name FROM NMU_EIS..bg_expense WHERE c_code LIKE '%' + ? + '%'";
	$stmt = $db->QueryParam($sql, [$code]);
	
	echo "<h3>ค้นหา: <strong>$code</strong></h3>";
	if (!$stmt) {
		echo "Query failed<br>";
		continue;
	}
	
	$found = false;
	echo "<table border='1' cellpadding='10' style='border-collapse: collapse;'>";
	echo "<tr><th>ID</th><th>c_code</th><th>c_name</th></tr>";
	
	while ($row = $db->Fetch($stmt)) {
		$found = true;
		$rowCode = htmlspecialchars($row['c_code'] ?? '');
		$rowName = htmlspecialchars($row['c_name'] ?? '');
		echo "<tr><td>{$row['bg_expense_id']}</td><td><strong>$rowCode</strong></td><td>$rowName</td></tr>";
	}
	
	if (!$found) {
		echo "<tr><td colspan='3' style='color: red;'>ไม่พบข้อมูล</td></tr>";
	}
	
	echo "</table><br>";
}

// Query ค้นหาคำถัดไป
echo "<hr>";
echo "<h2>ค้นหาตามชื่อ (ควรตรงกว่า)</h2>";

$searchTerms = [
	'ครุภัณฑ์โรงงาน',
	'ครุภัณฑ์สำนักงาน',
	'คอมพิวเตอร์',
	'ลิฟท์'
];

foreach ($searchTerms as $term) {
	$sql = "SELECT bg_expense_id, c_code, c_name FROM NMU_EIS..bg_expense WHERE c_name LIKE '%' + ? + '%'";
	$stmt = $db->QueryParam($sql, [$term]);
	
	echo "<h3>ค้นหาชื่อ: <strong>$term</strong></h3>";
	if (!$stmt) {
		echo "Query failed<br>";
		continue;
	}
	
	$found = false;
	echo "<table border='1' cellpadding='10' style='border-collapse: collapse;'>";
	echo "<tr><th>ID</th><th>c_code</th><th>c_name</th></tr>";
	
	while ($row = $db->Fetch($stmt)) {
		$found = true;
		$rowCode = htmlspecialchars($row['c_code'] ?? '');
		$rowName = htmlspecialchars($row['c_name'] ?? '');
		echo "<tr><td>{$row['bg_expense_id']}</td><td><strong>$rowCode</strong></td><td>$rowName</td></tr>";
	}
	
	if (!$found) {
		echo "<tr><td colspan='3' style='color: red;'>ไม่พบข้อมูล</td></tr>";
	}
	
	echo "</table><br>";
}

?>
