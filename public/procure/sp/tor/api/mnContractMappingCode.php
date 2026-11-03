<?php

//-- mnContractCode
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");



$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

$mode = $_REQUEST["mode"];
$table = "dbo.sp_tor_contract";
$keyName = "sp_tor_contract_id";
$data = $util->mnUser($_REQUEST);
$data["i_delete"] = DELETE_FALSE;

$re_id = null;
$stmt2 = true;
$stmt3 = true;
    
//End fn updateStaus

$db->BeginTran();
    
switch ($mode) {
    
    case "MAPPINGCODECST":
        $c_code = trim((string)($_POST['c_code'] ?? ''));
        $torId = intval($_POST['id'] ?? 0);
        $contractId = intval($_POST['sp_tor_contract_id'] ?? 0);
        $reservation = $c_code !== '' ? $db->GetDataBySQL(
            "SELECT TOP 1 g.c_gen FROM dbo.sp_doc_gen g WITH (UPDLOCK, HOLDLOCK)
             WHERE g.c_gen = ? AND g.i_enabled = 1
               AND NOT EXISTS (SELECT 1 FROM dbo.sp_tor_contract c WHERE c.c_code = g.c_gen)",
            array($c_code)) : null;
        if (!$reservation || !$torId || !$contractId) {
            $stmt = false;
            $sql = "ไม่พบเลขสัญญาที่จองไว้ หรือเลขนี้ถูกนำไปใช้แล้ว";
            break;
        }

        $sql = "UPDATE {$table}
                SET c_code = ?, dc_user_update_id = ?, dc_user_update_cost_id = ?, d_update = ?
                WHERE {$keyName} = ? AND sp_tor_id = ? AND ISNULL(c_code, '') = ''";
        $arr = array($c_code, $data['dc_user_update_id'], $data['dc_user_update_cost_id'],
            $data['d_update'], $contractId, $torId);
        $stmt = $db->QueryParam($sql, $arr);
        if ($stmt && sqlsrv_rows_affected($stmt) < 1) {
            $stmt = false;
            $sql = "ไม่พบรายการสัญญาที่รอออกเลข หรือรายการนี้มีเลขสัญญาแล้ว";
            break;
        }

        // Mark the reserved number as assigned to this TOR for the numbering history.
        $sql2 = "UPDATE dbo.sp_doc_gen SET ref_id = CASE WHEN ISNULL(ref_id, 0) = 0 THEN ? ELSE ref_id END
                 WHERE c_gen = ? AND i_enabled = 1";
        $stmt2 = $db->QueryParam($sql2, array($torId, $c_code));
        break;
    
}

if ($stmt && $stmt2 && $stmt3) {
    $db->CommitTran();
    $re = array("reval" => 0, "success" => "Success", "msg" => "บันทึกเรียบร้อยแล้ว", "id" => intVal($re_id));
} else {
    $db->RollBackTran();
    $re = array("reval" => 1, "success" => "Error", "msg" => $sql ?: "จับคู่เลขสัญญาไม่สำเร็จ");
}

echo json_encode($re);
exit;
