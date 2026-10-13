<?php

include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();
// สร้าง PDO object
// รับข้อมูล JSON
$datas = json_decode(file_get_contents("php://input"), true);

$mode = $datas['mode'] ?? null;
$rec = $datas['record'] ?? []; // เป็น array
$para = true;
$stmt2 = true;
$stmt3 = true;
//print_r($datas); 
// สมมติ $input คืออาเรย์ตามที่คุณส่งมา (Array(...))
$input = $datas;

function groupPayload(array $input): array {
    // --- ถ้าต้องการแปลง "1,2" -> [1,2] ใช้ฟังก์ชันนี้ แล้วเรียกใช้แทนค่าตรง header ---
    // header หลักของชนิด 1
    $header1 = [
        'sp_sign_type_id' => $input['sp_sign_type_id'] ?? 1,
        'document_id' => $input['document_id'] ?? null,
        'sp_tor_id' => $input['sp_tor_id'] ?? null,
        'i_audit' => $input['i_audit'] ?? null,
        'dc_user_id' => $input['dc_user_id'] ?? null,
        'urlfile' => $input['urlfile'] ?? '', // หรือใช้ $toPageList($input['page'] ?? '')
        'url' => $input['url'] ?? '', // หรือใช้ $toPageList($input['page'] ?? '')
        'docType' => $input['docType'] ?? '', // หรือใช้ $toPageList($input['page'] ?? '')
        'dateType' => $input['dateType'] ?? '', // หรือใช้ $toPageList($input['page'] ?? '')
        'pr_code' => $input['pr_code'] ?? '', // หรือใช้ $toPageList($input['page'] ?? '')
        'page' => $input['page'] ?? '', // หรือใช้ $toPageList($input['page'] ?? '')
        'c_approve' => $input['c_approve'] ?? '', // หรือใช้ $toPageList($input['page'] ?? '')
        'position_y' => $input['position_y'] ?? null,
        'c_approved' => $input['c_approve'] ?? '',
        'c_name' => $input['c_name'] ?? '',
    ];

    // คัดกรองรายละเอียดชนิด 1 จาก record[]
    $records = isset($input['record']) && is_array($input['record']) ? $input['record'] : [];
    $dtl1 = array_values(array_filter($records, function ($r) use ($input) {
                // กรณีใน record ไม่มี sp_sign_type_id ให้ fallback เป็นค่าหลักของ payload
                $stype = isset($r['sp_sign_type_id']) && $r['sp_sign_type_id'] !== '' ? (string) $r['sp_sign_type_id'] : (string) ($input['sp_sign_type_id'] ?? '');
                return $stype === '1';
            }));
    $mainRec1 = $header1 + ['dtl1' => $dtl1];
    // mainRec2 / mainRec3 จากอินพุต + แนบ dtl2/dtl3
    $mainRec2 = isset($input['mainRec2']) && is_array($input['mainRec2']) ? $input['mainRec2'] : [];
    $mainRec3 = isset($input['mainRec3']) && is_array($input['mainRec3']) ? $input['mainRec3'] : [];
    $dtl2 = isset($input['recordDtl2']) && is_array($input['recordDtl2']) ? array_values($input['recordDtl2']) : [];
    $dtl3 = isset($input['recordDtl3']) && is_array($input['recordDtl3']) ? array_values($input['recordDtl3']) : [];
    // แนบรายละเอียดเข้าไปใน mainRec2/3
    $mainRec2['dtl2'] = $dtl2;
    $mainRec3['dtl3'] = $dtl3;
    // คืนค่าแบบ group เรียบร้อย
    return [
        'mainRec1' => $mainRec1,
        'mainRec2' => $mainRec2,
        'mainRec3' => $mainRec3,
    ];
}

function parsePrPath($path) {
    // 1) ทำให้เป็น / เดียวกัน และตัดช่องว่าง
    $norm = str_replace('\\', '/', trim($path));
    $parts = array_values(array_filter(explode('/', $norm), 'strlen'));

    // 2) map ส่วนหลัก (ป้องกัน index ไม่ครบ)
    list($adYear, $prCode, $folder, $file) = $parts + [null, null, null, null];

    // 3) ข้อมูลไฟล์
    $pi = pathinfo($file ?? '');
    $fname = $pi['filename'] ?? '';
    $ext = $pi['extension'] ?? '';
    // 4) แยกข้อมูลจากรหัส PR เช่น PR25680700005
    $beYear = $month = $seq = null;
    if (preg_match('/^PR(\d{4})(\d{2})(\d{5})$/', $prCode ?? '', $m)) {
        $beYear = (int) $m[1];            // 2568
        $month = $m[2];                 // 07
        $seq = $m[3];                 // 00005
    }
    $adFromBE = $beYear ? $beYear - 543 : null; // แปลง พ.ศ. → ค.ศ. 
    // 5) แยกข้อมูลจากชื่อไฟล์ เช่น PR25680700005_1_11.pdf
    $version = $page = null;
    if (preg_match('/^PR(\d{4})(\d{2})(\d{5})_(\d+)_(\d+)$/', $fname, $f)) {
        $version = (int) $f[4];
        $page = (int) $f[5];
    }
    // 6) คืนค่าข้อมูลเป็น array
    return [
        'path_parts' => $parts,
        'adYear_from_path' => $adYear,
        'pr' => [
            'raw' => $prCode,
            'beYear' => $beYear,
            'adYear' => $adFromBE,
            'month' => $month,
            'seq' => $seq,
        ],
        'file' => [
            'folder' => $folder,
            'name' => $fname,
            'ext' => $ext,
            'version' => $version,
            'page' => $page,
        ],
    ];
}

function insertMaster(array $row = [], $conn = null) {
    global $db;
    $conn = $db;
    $ownConn = false;

    if ($conn === null) {
        $cnInfo = [
            "Database" => DB_NAME,
            "UID" => DB_USER,
            "PWD" => DB_PASS,
            "CharacterSet" => "UTF-8", // รองรับ UTF-8 สำหรับ NVARCHAR
        ];
        $conn = sqlsrv_connect(DB_SERVER, $cnInfo);
        if (!$conn) {
            return ['ok' => false, 'message' => 'DB connect error', 'errors' => sqlsrv_errors()];
        }
        $ownConn = true;
    }

    if ($ownConn && !sqlsrv_begin_transaction($conn)) {
        return ['ok' => false, 'message' => 'Begin transaction failed', 'errors' => sqlsrv_errors()];
    }
//print_r($_SESSION);exit();
    try {
        // map ค่า



        $sp_tor_id = isset($row['sp_tor_id']) ? (int) $row['sp_tor_id'] : 0;
        $document_id = isset($row['document_id']) ? (int) $row['document_id'] : 0;
        $c_name = (string) ($row['c_name'] ?? '');
        $urlfile = (string) ($row['urlfile'] ?? '');
        $dateType = (string) ($row['dateType'] ?? 0);
        $url = (string) ($row['url'] ?? '');
        $i_audit = isset($row['i_audit']) ? (int) $row['i_audit'] : 1;
        $i_status = isset($row['i_status']) ? (int) $row['i_status'] : 0;
        $c_comment = (string) ($row['c_comment'] ?? '');
        $json_audit = (string) ($row['json_audit'] ?? '');
        $dc_user_id = isset($_SESSION['user_id']) ? (int) $_SESSION['user_id'] : 0;
     
        
        $stmt0 = $db->QueryParam(" SELECT top 1 a.line, a.i_signer, a.i_audit ,a.dc_user_id FROM dbo.sp_sign_doc_dtl a 
                                      INNER JOIN dbo.sp_sign_doc_hdr h ON h.sp_sign_doc_hdr_id = a.sp_sign_doc_hdr_id  
                                      WHERE h.sp_tor_id = ? AND h.document_id = ? AND h.type_id = ? and a.line=1 ", [
                            [$sp_tor_id, SQLSRV_PARAM_IN],
                            [$document_id, SQLSRV_PARAM_IN],
                            [1, SQLSRV_PARAM_IN]
                        ]);

        $rs = $db->NextResult($stmt0);
     
        $signer_id = (int) ($rs['dc_user_id']);
        $audit_id = (int) ($rs['dc_user_id']);
        
        if ($sp_tor_id <= 0 || $document_id <= 0) {
            if ($ownConn)
                sqlsrv_rollback($conn);
            if ($ownConn)
                sqlsrv_close($conn);
            return ['ok' => false, 'message' => 'Invalid sp_tor_id or document_id'];
        }

        // ใช้ GETDATE() แทนพารามิเตอร์วันที่ เพื่อตัดปัญหา type mismatch
        $sql = "
            INSERT INTO [dbo].[sp_sign_audit_document]
            (
                c_name, sp_tor_id, document_id, urlfile,
                audit_id,signer_id,
                url, date_type,i_audit, i_status, json_audit, c_comment,
                i_enabled, i_delete,
                dc_user_create_id, dc_user_create_cost_id, d_create,
                dc_user_update_id, dc_user_update_cost_id, d_update
            ) 
            VALUES
            (
                ?, ?, ?, ?, ?,
                ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?,
                ?, ?, GETDATE(),
                ?, ?, GETDATE()
            );
        ";
        $sql .= "SELECT @@IDENTITY as ret_id";
        // แนะนำให้ cast ชนิด NVARCHAR ให้ชัดเมื่อจำเป็น (โดยเฉพาะ json_audit/c_name/c_comment/url)
        $params = [
            [$c_name, SQLSRV_PARAM_IN],
            [$sp_tor_id, SQLSRV_PARAM_IN],
            [$document_id, SQLSRV_PARAM_IN],
            [$urlfile, SQLSRV_PARAM_IN],
           
            [$audit_id, SQLSRV_PARAM_IN],
            [$signer_id, SQLSRV_PARAM_IN],
            
            [$url, SQLSRV_PARAM_IN],
            [$dateType, SQLSRV_PARAM_IN],
            [$i_audit, SQLSRV_PARAM_IN],
            [$i_status, SQLSRV_PARAM_IN],
            [$json_audit, SQLSRV_PARAM_IN],
            [$c_comment, SQLSRV_PARAM_IN],
            [1, SQLSRV_PARAM_IN],
            [2, SQLSRV_PARAM_IN],
            [$dc_user_id, SQLSRV_PARAM_IN],
            [$dc_user_id, SQLSRV_PARAM_IN],
            [$dc_user_id, SQLSRV_PARAM_IN],
            [$dc_user_id, SQLSRV_PARAM_IN],
        ];

        // ใช้ prepare/execute แทน query
//        $stmt = sqlsrv_prepare($conn, $sql, $params);
        $stmt = $db->QueryParam($sql, $params);
        $insertedId = null;
        if ($stmt) {
            $next_result = $db->NextResult($stmt);
            if ($next_result) {
                $ff = $db->Fetch($stmt);
                $insertedId = (int) $ff["ret_id"];
                $stmt0 = $db->QueryParam("update dbo.sp_sign_audit_document set i_enabled = 2 WHERE sp_tor_id = ? AND document_id = ? and sp_sign_document_id<>?", [
                            [$sp_tor_id, SQLSRV_PARAM_IN],
                            [$document_id, SQLSRV_PARAM_IN],
                            [$insertedId, SQLSRV_PARAM_IN]
                        ]);
            }
        }
        sqlsrv_free_stmt($stmt0);
        sqlsrv_free_stmt($stmt);
        return ['ok' => true, 'id' => $insertedId, 'message' => 'insert success'];
    } catch (Throwable $e) {
        if ($ownConn) {
            sqlsrv_rollback($conn);
            sqlsrv_close($conn);
        }
        return ['ok' => false, 'message' => $e->getMessage(), 'errors' => sqlsrv_errors()];
    }
}

//// ตัวอย่างใช้งาน:
$grouped = groupPayload($input);

$result = insertMaster($grouped['mainRec1'], $db);

if ($result['ok']) {
    echo json_encode(['ok' => true, 'success' => 'success', 'message' => 'บันทีกข้อมูลเรียบร้อย', 'data' => $result], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(['ok' => false, 'success' => 'unsuccess', 'message' => ' Error ', 'data' => $result], JSON_UNESCAPED_UNICODE);
}
// echo json_encode(['ok'=>true,'success'=>'success', 'message'=>'บันทีกข้อมูลเรียบร้อย','data'=>$grouped['mainRec1']], JSON_UNESCAPED_UNICODE);