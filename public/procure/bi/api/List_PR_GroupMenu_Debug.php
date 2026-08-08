<?php
// ===== DEBUG: หา columns ที่ถูกต้องของ sp_tor และตารางที่เกี่ยวข้อง =====
// https://dev.vajira.ac.th:8443/procure/bi/api/List_PR_TOR2_Debug.php?year=2569

header('Content-Type: application/json; charset=utf-8');

@include_once("../../conf/config.php");
@include_once("../../lib/database/DatabaseServer.php");

$yearTh = isset($_GET['year']) ? intval($_GET['year']) : intval(date('Y') + 543);
$yearEn = $yearTh > 2400 ? ($yearTh - 543) : $yearTh;
$fiscalStartYear = $yearEn - 1;
$fiscalEndYear   = $yearEn;

$result = [
    'year_th'            => $yearTh,
    // columns ของตารางต่างๆ
    'sp_tor_columns'     => [],
    'dc_cost_columns'    => [],
    // sample rows ของ sp_tor
    'sp_tor_sample'      => [],
    // sp_montyly_resulte: ค่า sp_tor_id ที่มีจริง (top 5)
    'montyly_tor_ids'    => [],
    // ตาราง dc_cost sample
    'dc_cost_sample'     => [],
    // ค้นหาตารางที่มีชื่อใกล้เคียง sp_tor
    'tables_like_sp_tor' => [],
    // ค้นหาตารางที่มี column dc_cost_id (น่าจะ join ได้)
    'tables_with_dc_cost_id' => [],
];

$db = null;
try { $db = new DatabaseServer(); } catch (Throwable $e) {
    echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    exit;
}

// ── 1. columns ของ sp_tor ─────────────────────────────────────────────
$stmt = $db->QueryParam(
    "SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'sp_tor' ORDER BY ORDINAL_POSITION", []);
if ($stmt) { while ($r = $db->Fetch($stmt)) $result['sp_tor_columns'][] = $r['COLUMN_NAME'].' ('.$r['DATA_TYPE'].')'; }

// ── 2. columns ของ dc_cost ────────────────────────────────────────────
$stmt = $db->QueryParam(
    "SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'dc_cost' ORDER BY ORDINAL_POSITION", []);
if ($stmt) { while ($r = $db->Fetch($stmt)) $result['dc_cost_columns'][] = $r['COLUMN_NAME'].' ('.$r['DATA_TYPE'].')'; }

// ── 3. sp_tor sample 3 rows ───────────────────────────────────────────
$stmt = $db->QueryParam("SELECT TOP 3 * FROM dbo.sp_tor", []);
if ($stmt) { while ($r = $db->Fetch($stmt)) $result['sp_tor_sample'][] = $r; }

// ── 4. ค่า sp_tor_id ใน sp_montyly_resulte (top 5, not null) ─────────
$stmt = $db->QueryParam(
    "SELECT TOP 5 sp_tor_id FROM dbo.sp_montyly_resulte WHERE sp_tor_id IS NOT NULL AND i_product_type = 2 AND ((yyyy = ? AND mm >= 10) OR (yyyy = ? AND mm <= 9))",
    [$fiscalStartYear, $fiscalEndYear]);
if ($stmt) { while ($r = $db->Fetch($stmt)) $result['montyly_tor_ids'][] = $r; }

// ── 5. dc_cost sample ─────────────────────────────────────────────────
$stmt = $db->QueryParam("SELECT TOP 10 * FROM dbo.dc_cost ORDER BY dc_cost_id", []);
if ($stmt) { while ($r = $db->Fetch($stmt)) $result['dc_cost_sample'][] = $r; }

// ── 6. ตารางที่มีชื่อขึ้นต้นด้วย sp_ ─────────────────────────────────
$stmt = $db->QueryParam(
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE' AND TABLE_NAME LIKE 'sp_%' ORDER BY TABLE_NAME", []);
if ($stmt) { while ($r = $db->Fetch($stmt)) $result['tables_like_sp_tor'][] = $r['TABLE_NAME']; }

// ── 7. ตารางที่มี column dc_cost_id ──────────────────────────────────
$stmt = $db->QueryParam(
    "SELECT DISTINCT TABLE_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE COLUMN_NAME = 'dc_cost_id' ORDER BY TABLE_NAME", []);
if ($stmt) { while ($r = $db->Fetch($stmt)) $result['tables_with_dc_cost_id'][] = $r['TABLE_NAME']; }

echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);