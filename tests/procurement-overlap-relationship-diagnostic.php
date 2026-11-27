<?php
// Read-only diagnosis of the example supplied for the procurement dashboard.
$_SERVER['SERVER_NAME'] = 'localhost';
ob_start();
require 'C:/xampp/htdocs/api-nmu/conf/config.php';
ob_end_clean();
$conn = @sqlsrv_connect(DB_SERVER, array('Database'=>'NMU_ERP','UID'=>DB_USER,'PWD'=>DB_PASS,'CharacterSet'=>'UTF-8','LoginTimeout'=>5));
if (!$conn) { fwrite(STDERR, "Database connection unavailable\n"); exit(1); }
$sql = "SELECT h.c_code, h.tor_id, h.po_id, h.i_year, h.i_status,
    c.sp_tor_contract_id, c.sp_tor_id, c.c_code AS contract_code, c.c_overlap, c.c_overlap2,
    CASE WHEN h.c_code=c.c_overlap OR h.c_code=c.c_overlap2 THEN 1 ELSE 0 END AS recorded_in_supplies
    FROM NMU_EIS.dbo.bg_overlap_hdr h
    LEFT JOIN dbo.sp_tor_contract c ON c.sp_tor_contract_id=h.po_id AND c.i_enabled=1
    WHERE h.c_code=?";
$stmt = @sqlsrv_query($conn, $sql, array('69-101-03-2-0010'), array('QueryTimeout'=>10));
if (!$stmt) { fwrite(STDERR, "Relationship query failed\n"); exit(1); }
$rows=array(); while ($row=sqlsrv_fetch_array($stmt,SQLSRV_FETCH_ASSOC)) $rows[]=$row;
echo json_encode($rows, JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT), "\n";
require __DIR__ . '/../public/supplies/bi/api/ProcurementOverlap.php';
$fetch = function ($sql, $params) use ($conn) {
    $stmt = @sqlsrv_query($conn, $sql, $params, array('QueryTimeout'=>15));
    if (!$stmt) throw new RuntimeException('Diagnostic SELECT failed');
    $result = array();
    while ($row=sqlsrv_fetch_array($stmt,SQLSRV_FETCH_ASSOC)) $result[]=$row;
    return $result;
};
$prs=$fetch('SELECT tor_id,c_code AS pr_code,i_type_bg,c_overlap AS pr_overlap_code,i_overlap AS pr_overlap_flag,i_yyyy_overlap AS pr_overlap_year FROM dbo.sp_tor WHERE tor_id=?',array(4062));
echo json_encode(procurementOverlapEnrich($prs,$fetch), JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT), "\n";
