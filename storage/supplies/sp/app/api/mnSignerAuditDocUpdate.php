<?php

include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();
// รับข้อมูล JSON
$datas = $_REQUEST??null;// json_decode(file_get_contents("php://input"), true);




$mode = $datas['mode'] ?? null;
$rec = $datas['record'] ?? []; // เป็น array
$para = true;
$stmt2 = true;
$stmt3 = true;
 
 function updateMaster(array $row = [], $db = null) {
    $ownConn = false;
    if ($db === null) {
        $cnInfo = [
            "Database"      => DB_NAME,
            "UID"           => DB_USER,
            "PWD"           => DB_PASS,
            "CharacterSet"  => "UTF-8",
        ];
        $db = sqlsrv_connect(DB_SERVER, $cnInfo);
        if (!$db) {
            return ['ok' => false, 'message' => 'DB connect error', 'errors' => sqlsrv_errors()];
        }
        $ownConn = true;
    }

    if ($ownConn && !sqlsrv_begin_transaction($db)) {
        return ['ok' => false, 'message' => 'Begin transaction failed', 'errors' => sqlsrv_errors()];
    }

    try {
        // -------- Input --------
        $sp_sign_document_id = isset($row['sp_sign_document_id']) ? (int)$row['sp_sign_document_id'] : 0;
        if ($sp_sign_document_id <= 0) {
            throw new InvalidArgumentException('Invalid sp_sign_document_id');
        }

        $sp_tor_id  = isset($row['sp_tor_id'])  ? (int)$row['sp_tor_id']  :0;
        $document_id  = isset($row['document_id'])  ? (int)$row['document_id']  :0;
        $audit_id  = isset($row['audit_id'])  ? (int)$row['audit_id']  : 0;
        $i_audit  = isset($row['i_audit'])  ? (int)$row['i_audit']  : 1;
        $i_status = isset($row['i_status']) ? (int)$row['i_status'] : 1;
        $direction = strtolower(trim($row['status'] ?? 'none'));
        $c_comment = isset($row['c_comment']) ? (string)$row['c_comment'] : $direction;

         
        //check 
        if($i_audit !=$i_status){
            $i_status = $i_audit;
        }
        if ($direction === 'forward') {
            $i_audit++;
            $i_status = 1;
        } elseif ($direction === 'back') {
//            ให้กลับไปยังเจ้าของเรื่อง step 1    
            $i_audit  = 1;
            $i_status = 2;
//            $i_audit  = max(0, $i_audit - 1);
//            $i_status = max(0, $i_status - 1);
        }
        
//echo "{$i_audit} {$i_status}"; exit();
 
 $rs = $db->GetDataBySQL("SELECT 
    MIN(a.row_id_input) AS min_row,
    MAX(a.row_id_input) AS max_row
            FROM dbo.sp_sign_doc_dtl a
            inner join dbo.sp_sign_doc_hdr h on h.sp_sign_doc_hdr_id=a.sp_sign_doc_hdr_id 
    WHERE h.sp_tor_id = ? and h.document_id=?", array($sp_tor_id,$document_id));
 
 if($i_audit>$rs['max_row']){ // ให้กลับไปเริ่มใหม่
     $i_audit = $rs['min_row'];
     $i_status = 9;
 }
 
//     print_r($rs);   
//        exit();

        $dc_user_id = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : 0;
        $dc_user_update_cost_id = $_SESSION['dc_cost_id'] ?? null;

        // -------- SQL --------
    //    doc_next_user_id,doc_active_id,doc_prev_user_id,
        $sql = "
            UPDATE [dbo].[sp_sign_audit_document]
            SET 
                doc_next_user_id = ?,
                doc_active_user_id = ?,
                doc_prev_user_id = ?,
                audit_id = ?,
                i_audit = ?,
                i_status = ?,
                c_comment = ?,
                dc_user_update_id = ?,
                dc_user_update_cost_id = ?,
                d_update = GETDATE()
            WHERE sp_sign_document_id = ? AND i_enabled = 1
        ";
        
        $doc_next_user_id=isset($row['nextUsersId'])  ? (int)$row['nextUsersId']  : 0;
        $doc_active_user_id = isset($row['doc_active_user_id'])  ? (int)$row['doc_active_user_id']  : 0;
        $doc_prev_user_id = isset($row['doc_prev_user_id'])  ? (int)$row['doc_prev_user_id']  : 0;
        
        // -------- Params --------
        $params = array(); 
        $params[] = $doc_next_user_id;
        $params[] = $doc_active_user_id;
        $params[] = $doc_prev_user_id;
        $params[] = $audit_id;
        $params[] = $i_audit;
        $params[]  = $i_status;
        $params[]  = $c_comment;
        $params[]  = $dc_user_id;
        $params[]  = $dc_user_update_cost_id;
        $params[]  = $sp_sign_document_id;
 
//  echo $db->debugSql($sql, $params);
//        exit;
//
        $stmt = $db->QueryParam($sql, $params); 
        if (!$stmt) {
            throw new RuntimeException('Prepare failed: ' . print_r(sqlsrv_errors(), true));
        }

      

        return [
            'ok' => true,
            'message' => 'update success',
            'rows' => $params,
            'data' => [
                'sp_sign_document_id' => $sp_sign_document_id,
                'i_audit' => $i_audit,
                'i_status' => $i_status,
                'direction' => $direction
            ]
        ];
    } catch (Throwable $e) { 
        return ['ok' => false, 'message' => $e->getMessage(), 'errors' => sqlsrv_errors()];
    }
}

// เลือก mode: insert (default) หรือ update
if (isset($mode) && strtolower($mode) === 'edit') {
    $result = updateMaster($datas, $db);
} 

if ($result['ok']) {
    echo json_encode(['ok' => true, 'success' => 'success', 'message' => ($mode === 'update' ? 'แก้ไขข้อมูลเรียบร้อย' : 'บันทึกข้อมูลเรียบร้อย'), 'data' => $result], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(['ok' => false, 'success' => 'unsuccess', 'message' => ' Error ', 'data' => $result], JSON_UNESCAPED_UNICODE);
}
