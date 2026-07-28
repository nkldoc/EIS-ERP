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
        'url' => $input['url'] ?? '', // หรือใช้ $toPageList($input['page'] ?? '')
        'docType' => $input['docType'] ?? '', // หรือใช้ $toPageList($input['page'] ?? '')
        'dateType' => $input['dateType'] ?? '', // หรือใช้ $toPageList($input['page'] ?? '')
        'pr_code' => $input['pr_code'] ?? '', // หรือใช้ $toPageList($input['page'] ?? '')
        'page' => $input['page'] ?? '', // หรือใช้ $toPageList($input['page'] ?? '')
        'c_approve' => $input['c_approve'] ?? '', // หรือใช้ $toPageList($input['page'] ?? '')
        'position_y' => $input['position_y'] ?? null 
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

function transformSignData($records) {
    $result = [];
    $i = 1;
    foreach ($records as $r) {
        // แสดงค่าบาง field
//        echo "ID: {$r['id']} | Name: {$r['full_name']} | Row: {$r['row']} | Col: {$r['col']}<br>";

        $result[] = [
            'signer_id' => $r['dc_user_id'],
            'line' => $i++,
            'name' => trim($r['full_name'], '() '),
            'position' => $r['c_postion'],
            'organization' => $r['org_name'],
            'signed_date' => $r['sign_date'],
            'page' => $r['page'] ?? 1,
            'row' => $r['row'],
            'col' => $r['col'],
            'i_signer' => $r['i_signer'],
            'i_audit' => $r['i_audit'],
            'sp_tor_id' => $r['sp_tor_id'],
            'type_id' => $r['sp_sign_type_id'],
            // เพิ่มตัวแปรใหม่ เช่น ตำแหน่งแนวตั้ง
            'position_x' => isset($r['position_x']) ? $r['position_x'] : 100,
            'position_y' => isset($r['position_y']) ? $r['position_y'] : 50,
            // ตัวอย่าง text รวมสำหรับใช้ใน PDF annotation
            'full_name' => "{$r['c_postion']} {$r['full_name']}"
        ];
    }
    return $result;
}

 function insertMaster($row = [], $i = 1) {
    global $grouped, $db , $date;

    $info = parsePrPath($row['url']); 
    $hdr = $grouped["mainRec{$i}"];
    $master = $row;
    $master['i_yyyy']= $info['path_parts'][0] ?? null;
    $master['PR']= $info['path_parts'][1] ?? null;
    $master['folder'] = $info['path_parts'][2] ?? null;
    $master['pdf'] = $info['path_parts'][3] ?? null;  

    $detailRows = []; // ป้องกัน undefined
    if (is_array($hdr)) {
       foreach ($hdr as $k => $v) { 
            // ตรวจว่าเป็น array และชื่อ key ตรงกับ dtl{i}
            if (is_array($v) && $k == "dtl{$i}") {
                foreach ($v as $kk => $vv) {
                      $detailRows[$kk] = $vv; 
                }
            }
        }
    } 

    $cnInfo = [
        "Database"     => DB_NAME,
        "UID"          => DB_USER,
        "PWD"          => DB_PASS,
        "CharacterSet" => "UTF-8"
    ];
    $conn = sqlsrv_connect(DB_SERVER, $cnInfo);
    if (!$conn) {
        http_response_code(500);
        echo json_encode(['ok'=>false,'message'=>'DB connect error','errors'=>sqlsrv_errors()], JSON_UNESCAPED_UNICODE);
        exit;
    }

    sqlsrv_begin_transaction($conn); 

    try {
        $type_id     = intval($master['type_id']);
        $sp_tor_id   = intval($master['sp_tor_id']);
        $pr_code     = trim($master['pr_code']);
        $document_id = intval($master['document_id']);

        // 1) ลบของเดิม (upsert แบบ replace)
        $sqlDelDtl = "
            DELETE d
            FROM dbo.sp_sign_doc_dtl d
            JOIN dbo.sp_sign_doc_hdr h
              ON h.sp_sign_doc_hdr_id = d.sp_sign_doc_hdr_id
             AND h.sp_tor_id=? AND h.document_id=? AND h.type_id=?";
        $ok = sqlsrv_query($conn, $sqlDelDtl, [$sp_tor_id, $document_id, $type_id]);
        if ($ok === false) throw new Exception('delete detail failed');

        $sqlDelHdr = "DELETE FROM dbo.sp_sign_doc_hdr WHERE sp_tor_id=? AND document_id=? AND type_id=?";
        $ok = sqlsrv_query($conn, $sqlDelHdr, [$sp_tor_id, $document_id, $type_id]);
        if ($ok === false) throw new Exception('delete header failed');

        // 2) Insert Header
        $sqlHdr = "
          INSERT INTO dbo.sp_sign_doc_hdr
          (type_id, sp_tor_id, pr_code, document_id, url,
           i_yyyy, folder, pdf,
           date_type, doc_type, page,
           c_approve, position_x, position_y)
          OUTPUT INSERTED.sp_sign_doc_hdr_id
          VALUES (?,?,?,?,?,
                  ?,?,?, ?,?,?, ?,?,?)";
        $paramsHdr = [
            $type_id, $sp_tor_id, $pr_code, $document_id, $master['url'] ?? null,
            $master['i_yyyy'] ?? null, $master['folder'] ?? null, $master['pdf'] ?? null,
            $master['dateType'] ?? null, $master['docType'] ?? null, $master['page'] ?? null,
            $master['c_approve'] ?? null, $master['position_x'] ?? null, $master['position_y'] ?? null,
        ];

        $stmtHdr = sqlsrv_query($conn, $sqlHdr, $paramsHdr);
        if ($stmtHdr === false) throw new Exception('insert header failed');
        $hdrRow = sqlsrv_fetch_array($stmtHdr, SQLSRV_FETCH_NUMERIC);
        $hdrId  = intval($hdrRow[0]);

        // helper: ดึงเลขา
        function getSecretary($conn, $dc_user_id) {
            $sql = "SELECT s.user_id, s.secretary_user_id, s.secretary_emp_id , u.dc_user_id, u.c_full_name as full_name ,'หน้าห้อง' as position_name
                    FROM [NMU_ERP].[dbo].[sp_users_secretary] s
                    LEFT JOIN  NMU_DATACENTER.dbo.dc_user u ON u.dc_user_id = s.secretary_user_id
                    WHERE s.user_id  = ?";   
            $stmt = sqlsrv_query($conn, $sql, [$dc_user_id]);
            if ($stmt === false) return null;
            $row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);
            if (!$row) return null;
            return [
                'dc_user_id' => isset($row['secretary_user_id']) ? intval($row['secretary_user_id']) : null,
                'dc_emp_id'  => isset($row['secretary_emp_id'])  ? intval($row['secretary_emp_id'])  : null,
                'position_name' => $row['position_name'] ?? 'เลขา',
                'full_name' => $row['full_name'] ?? null
            ];
        }

        $sqlDtl = "  INSERT INTO dbo.sp_sign_doc_dtl
            (sp_sign_doc_hdr_id, row_id_input, dc_user_id, dc_emp_id,
             c_position, position_name, full_name,
             action_text, org_name,
             sign_date, c_approved,
             [row], [col], [i_signer], [i_audit], [line], rc, step_sign,
             [document_id], [page],
             position_x, position_y,
             sp_sign_type_id, sp_tor_id)
          VALUES (?,?, ?,?, ?,?,?, ?,?, ?,?, ?,?, ?,?,?, ?,?, ?,?, ?,?, ?,?)";

        // row counter: จะเริ่มจาก 1 และเพิ่มทีละ 1 สำหรับแต่ละแถวที่ INSERT จริง (รวมเลขา)
        $rowNumber = 0;

        foreach ($detailRows as $r) {
            // แปลงวันที่
            $signDate = null;
            if (!empty($r['sign_date'])) {
                $d = $date->bc_to_ad($r['sign_date']);
                if ($d) $signDate = $d;
            }

            // ถ้าแถวไม่มี position_x ให้ตกทอดจาก header
            $posX = isset($r['position_x']) && $r['position_x'] !== '' ? intval($r['position_x']) : ($master['position_x'] ?? null);
            $posY = isset($r['position_y']) && $r['position_y'] !== '' ? intval($r['position_y']) : ($master['position_y'] ?? null);

            // --- ถ้ามี dc_user_id และมีเลขา ให้ insert แถวเลขาก่อน ---
            if (!empty($r['dc_user_id'])) {
                $sec = getSecretary($conn, intval($r['dc_user_id']));
                if ($sec) {
                    // ป้องกันกรณีเลขาเป็นตัวเดียวกับ user เดิม (ซ้ำ) — ข้ามถ้า same id
                    if ($sec['dc_user_id'] !== intval($r['dc_user_id'])) {
                        $rowNumber++; // เพิ่มลำดับสำหรับแถวเลขา
                        $i = $rowNumber; // ตั้ง $i ให้ตรงกับลำดับ (ตามที่ร้องขอ)

                        $paramsDtlSecret = [
                            $hdrId,                 // sp_sign_doc_hdr_id
                            $rowNumber,             // row_id_input -> เรากำหนดลำดับเอง
                            $sec['dc_user_id'],     // dc_user_id (เลขา)
                            $sec['dc_emp_id'],      // dc_emp_id
                            'เลขา',                 // c_position
                            $sec['position_name'] ?? 'เลขา', // position_name
                            $sec['full_name'] ?? null,       // full_name
                            null,                   // action_text
                            null,                   // org_name
                            $signDate,              // sign_date (ใช้วันที่เดียวกับแถวหลัก)
                            null,                   // c_approved
                            $rowNumber,             // [row] -> ใช้ลำดับเดียวกัน
                            isset($r['col']) ? intval($r['col']) : null, // [col]
                            null,                   // [i_signer]
                            isset($r['i_audit']) ? intval($r['i_audit']) : null,
                            $rowNumber,             // [line] -> ใช้ลำดับเดียวกัน
                            $r['rc'] ?? null,
                            $r['step_sign'] ?? null,
                            $r['document_id'] ?? null,
                            $r['page'] ?? null,
                            $posX !== null ? intval($posX) : null,
                            $posY !== null ? intval($posY) : null,
                            isset($r['sp_sign_type_id']) ? intval($r['sp_sign_type_id']) : null,
                            isset($r['sp_tor_id'])       ? intval($r['sp_tor_id'])       : null,
                        ];

                        $oksec = sqlsrv_query($conn, $sqlDtl, $paramsDtlSecret);
                        if ($oksec === false) {
                            throw new Exception('insert secretary detail failed for parent row_id_input=' . ($r['id'] ?? '?'));
                        }
                    }
                }
            }

            // --- insert แถวหลัก (เดิม) ---
            $rowNumber++; // เพิ่มลำดับสำหรับแถวหลัก
            $i = $rowNumber; // ตั้ง $i ให้ตรงกับลำดับ (ตามที่ร้องขอ)

            $paramsDtl = [
                $hdrId,
                $rowNumber, // row_id_input -> กำหนดเป็นลำดับที่ต่อเนื่อง
                isset($r['dc_user_id']) ? intval($r['dc_user_id']) : null,
                isset($r['dc_emp_id'])  ? intval($r['dc_emp_id'])  : null,
                $r['c_position'] ?? ($r['c_postion'] ?? null), // รองรับทั้งชื่อผิด/ถูก
                $r['position_name'] ?? null,
                $r['full_name'] ?? null,
                $r['action_text'] ?? ($r['action'] ?? null), // รองรับทั้งชื่อฟิลด์
                $r['org_name'] ?? null,
                $signDate,
                $r['c_approved'] ?? null,
                $rowNumber, // [row] -> กำหนดเป็นลำดับเดียวกัน
                isset($r['col']) ? intval($r['col']) : null,
                isset($r['i_signer']) ? intval($r['i_signer']) : null,
                isset($r['i_audit']) ? intval($r['i_audit']) : null,
                $rowNumber, // [line] -> กำหนดเป็นลำดับเดียวกัน
                $r['rc'] ?? null,
                $r['step_sign'] ?? null,
                $r['document_id'] ?? null,
                $r['page'] ?? null,
                $posX !== null ? intval($posX) : null,
                $posY !== null ? intval($posY) : null,
                isset($r['sp_sign_type_id']) ? intval($r['sp_sign_type_id']) : null,
                isset($r['sp_tor_id'])       ? intval($r['sp_tor_id'])       : null,
            ];

            $ok = sqlsrv_query($conn, $sqlDtl, $paramsDtl);
            if ($ok === false) {
                throw new Exception('insert detail failed: original_row_id=' . ($r['id'] ?? '?'));
            } 
        }

        // ตีตราเวลา update
        sqlsrv_query($conn, "UPDATE dbo.sp_sign_doc_hdr SET d_update=SYSDATETIME() WHERE sp_sign_doc_hdr_id=?", [$hdrId]);

        sqlsrv_commit($conn);

        return ['ok'=>true,'hdr_id'=>$hdrId,'message'=>'Saved'];

    } catch (Throwable $e) {
        sqlsrv_rollback($conn);
        echo json_encode([
            'ok'=>false,
            'message'=>$e->getMessage(),
            'errors'=>sqlsrv_errors()
        ], JSON_UNESCAPED_UNICODE);
    } finally {
        if ($conn) sqlsrv_close($conn);
    }
}


//// ตัวอย่างใช้งาน:
$grouped = groupPayload($input);
//print_R($grouped);
//
if (count($grouped['mainRec1']['dtl1']) > 0) {

    $row = [];
    $row['type_id'] = $grouped['mainRec1']['sp_sign_type_id'];
    $row['sp_tor_id'] = $grouped['mainRec1']['sp_tor_id'];
    $row['pr_code'] = $grouped['mainRec1']['pr_code'];
    $row['document_id'] = $grouped['mainRec1']['document_id'];
    $row['url'] = $grouped['mainRec1']['url']; //sensive
    $row['dateType'] = $grouped['mainRec1']['dateType']; //sensive dateType docType
    $row['docType'] = $grouped['mainRec1']['docType']; //sensive
    $row['page'] = $grouped['mainRec1']['page'];
    $row['c_approve'] = $grouped['mainRec1']['c_approve'];
    $row['position_y'] = $grouped['mainRec1']['position_y'] ?? 50;
    $row['position_x'] = $grouped['mainRec1']['position_x'] ?? 100;

    $res[] = insertMaster($row, 1); //insert 1 row 
}

 
if (count($grouped['mainRec2']['dtl2']) > 0) {
    $row2 = [];
    $row2['type_id'] = $grouped['mainRec2']['sp_sign_type_id'];
    $row2['sp_tor_id'] = $grouped['mainRec2']['sp_tor_id'];
    $row2['pr_code'] = $grouped['mainRec2']['pr_code'];
    $row2['document_id'] = $grouped['mainRec2']['document_id'];
    $row2['url'] = $grouped['mainRec2']['url']; //sensive
    $row2['docType'] = $grouped['mainRec2']['docType']; //sensive
    $row2['dateType'] = $grouped['mainRec2']['dateType']; //sensive dateType docType
    $row2['page'] = $grouped['mainRec2']['page'];
    $row2['c_approve'] = $grouped['mainRec2']['c_approve'];
    $row2['position_y'] = $grouped['mainRec2']['position_y'] ?? 50;
    $row2['position_x'] = $grouped['mainRec2']['position_x'] ?? 100;
    $row2['c_approved'] = $grouped['mainRec2']['c_approved'] ?? 100;
  $res[] =  insertMaster($row2, 2);  //insert 1 row 
}
if (count($grouped['mainRec3']['dtl3']) > 0) {
    $row3 = [];
    $row3['type_id'] = $grouped['mainRec3']['sp_sign_type_id'];
    $row3['sp_tor_id'] = $grouped['mainRec3']['sp_tor_id'];
    $row3['pr_code'] = $grouped['mainRec3']['pr_code'];
    $row3['document_id'] = $grouped['mainRec3']['document_id'];
    $row3['url'] = $grouped['mainRec3']['url']; //sensive
    $row3['docType'] = $grouped['mainRec3']['docType']; //sensive
    $row3['dateType'] = $grouped['mainRec3']['dateType']; //sensive
    $row3['page'] = $grouped['mainRec3']['page'];
    $row3['c_approve'] = $grouped['mainRec3']['c_approve'];
    $row3['position_y'] = $grouped['mainRec3']['position_y'] ?? 50;
    $row3['position_x'] = $grouped['mainRec3']['position_x'] ?? 100;
    $row3['c_approved'] = $grouped['mainRec3']['c_approved'] ?? 100;
  $res[] = insertMaster($row3, 3); // insert 1 row  
}
 

 echo json_encode(['success'=>'success', 'message'=>'บันทีกข้อมูลเรียบร้อย','data'=>$res], JSON_UNESCAPED_UNICODE);