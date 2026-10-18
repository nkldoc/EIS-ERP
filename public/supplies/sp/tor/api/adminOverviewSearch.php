<?php
require_once '../../../conf/config.php';
require_once '../../../lib/database/DatabaseServer.php';
header('Content-Type: application/json; charset=utf-8');
if (empty($_SESSION['user_id']) || intval($_SESSION['dc_center_user'] ?? 0) !== 1) {
    http_response_code(403);
    echo json_encode(array('success' => false, 'msg' => 'ไม่มีสิทธิ์ค้นหาข้อมูล ADMIN', 'data' => array()));
    exit;
}
$type = $_POST['type'] ?? $_GET['type'] ?? 'pr';
$keyword = trim((string)($_POST['keyword'] ?? $_GET['keyword'] ?? ''));
if (!in_array($type, array('pr', 'contract', 'ir', 'ap', 'd'), true) || $keyword === '') {
    echo json_encode(array('success' => false, 'msg' => 'กรุณาเลือกประเภทและระบุเลขเอกสาร', 'data' => array()));
    exit;
}
$like = '%' . str_replace(array('[', '%', '_'), array('[[]', '[%]', '[_]'), $keyword) . '%';
$params = array($like);
if ($type === 'pr') {
    $sql = 'SELECT TOP 200 t.tor_id AS sp_tor_id, NULL AS sp_tor_contract_id,
        NULL AS sp_check_period_hdr_id, t.c_code, t.c_name, t.c_code AS pr_code,
        NULL AS contract_code, t.i_enabled FROM dbo.sp_tor t
        WHERE t.c_code LIKE ? ORDER BY t.tor_id DESC';
} elseif ($type === 'contract') {
    $sql = 'SELECT TOP 200 c.sp_tor_id, c.sp_tor_contract_id, NULL AS sp_check_period_hdr_id,
        c.c_code, c.c_name, t.c_code AS pr_code, c.c_code AS contract_code, c.i_enabled
        FROM dbo.sp_tor_contract c INNER JOIN dbo.sp_tor t ON t.tor_id=c.sp_tor_id
        WHERE c.c_code LIKE ? OR EXISTS (SELECT 1 FROM dbo.sp_tor_hdr_period p
            WHERE p.sp_tor_contract_id=c.sp_tor_contract_id AND p.c_contract_code LIKE ?)
        ORDER BY c.sp_tor_contract_id DESC';
    $params[] = $like;
} else {
    $code = $type === 'ir' ? 'COALESCE(h.c_arrive_code,m.c_arrive_code)' : 'h.c_code';
    $paymentJoin = '';
    $condition = $code . ' LIKE ?';
    if ($type === 'd') {
        $code = 'payment.c_code';
        $paymentJoin = ' OUTER APPLY (SELECT TOP 1 w.c_code FROM NMU_EIS..po_working_dtl w
            WHERE w.po_working_hdr_id=h.po_working_hdr_id AND w.c_code LIKE ? ORDER BY w.c_code) payment ';
        $condition = 'payment.c_code IS NOT NULL';
    }
    $sql = 'SELECT TOP 200 c.sp_tor_id, c.sp_tor_contract_id, h.sp_check_period_hdr_id,
        ' . $code . ' AS c_code, c.c_name, t.c_code AS pr_code, c.c_code AS contract_code, h.i_enabled
        FROM dbo.sp_check_period_hdr h
        LEFT JOIN dbo.sp_mn_contract_hdr m ON m.sp_mn_contract_hdr_id=h.sp_mn_contract_hdr_id
        INNER JOIN dbo.sp_tor_contract c ON c.sp_tor_contract_id=COALESCE(NULLIF(h.sp_tor_contract_id,0),m.sp_contract_id)
        INNER JOIN dbo.sp_tor t ON t.tor_id=c.sp_tor_id ' . $paymentJoin . '
        WHERE ' . $condition . ' ORDER BY h.sp_check_period_hdr_id DESC';
}
$db = new DatabaseServer();
$stmt = $db->QueryParam($sql, $params);
$rows = array();
while ($row = $db->Fetch($stmt)) $rows[] = $row;
echo json_encode(array('success' => true, 'data' => $rows), JSON_UNESCAPED_UNICODE);
