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
function groupPayload(array $input): array
{
    // --- ถ้าต้องการแปลง "1,2" -> [1,2] ใช้ฟังก์ชันนี้ แล้วเรียกใช้แทนค่าตรง header ---
    
    // header หลักของชนิด 1
    $header1 = [
        'sp_sign_type_id' => $input['sp_sign_type_id'] ?? 1,
        'document_id'     => $input['document_id']     ?? null,
        'sp_tor_id'       => $input['sp_tor_id']       ?? null,
        'dc_emp_id'       => $input['dc_emp_id']       ?? null,
        'Url'             => $input['url']            ?? '',   // หรือใช้ $toPageList($input['page'] ?? '')
        'pr_code'             => $input['pr_code']            ?? '',   // หรือใช้ $toPageList($input['page'] ?? '')
        'page'            => $input['page']            ?? '',   // หรือใช้ $toPageList($input['page'] ?? '')
        'position_y'      => $input['position_y']      ?? null,
        'c_approve'       => $input['c_approve']       ?? '',
    ];

    // คัดกรองรายละเอียดชนิด 1 จาก record[]
    $records = isset($input['record']) && is_array($input['record']) ? $input['record'] : [];
    $dtl1 = array_values(array_filter($records, function($r) use ($input) {
        // กรณีใน record ไม่มี sp_sign_type_id ให้ fallback เป็นค่าหลักของ payload
        $stype = isset($r['sp_sign_type_id']) && $r['sp_sign_type_id'] !== '' ? (string)$r['sp_sign_type_id'] : (string)($input['sp_sign_type_id'] ?? '');
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

//// ตัวอย่างใช้งาน:
// $grouped = groupPayload($input);
// echo '<pre>'.print_r($grouped, true).'</pre>';  
// exit();
function toThaiDate($date) {
    if (!$date instanceof DateTime) {
        $date = new DateTime($date);
    }
    $year = (int) $date->format('Y') + 543;
    return $date->format('d-m-') . $year;
}

function normalizeSignDate($sign_date) {
    global $date;
    // ถ้ามีตัว T แสดงว่าเป็นรูปแบบ datetime ISO
    if (strpos($sign_date, 'T') !== false) {
        $sign_date = str_replace('T', ' ', $sign_date);
        $dt = new DateTime($sign_date);
        return $dt->format('Y-m-d');
    } elseif (preg_match('/^\d{2}-\d{2}-\d{4}$/', $sign_date)) {
        list($d, $m, $y) = explode('-', $sign_date);

        return $date->bc_to_ad(sprintf('%02d-%02d-%04d', $d, $m, $y));
    }
    // ถ้าไม่เข้าเงื่อนไข
    return null;
}


 
switch ($mode) {
    case "add":
        $sql = null;
        $rs = 0;

        $db->BeginTran();
        $data = array();
        $addField = null;
        $addValue = null;
        $arrValue = array();
   
        $f0 = $db->GetDataBySQL("SELECT document_id FROM dbo.sp_sign_document WHERE i_enabled =? and document_type_id = ? and sp_tor_id = ?;", array(1, $rec[$rs]["document_type_id"], $rec[0]["sp_tor_id"]));

        if ($f0) {
            echo json_encode(array("success" => false, "msg" => "รายการ PR และ ประเภทเอกสารนี้ได้มีการทำรายการแล้ว"));
            exit();
        }
        if (!$rec[$rs]["dc_emp_id"]) {
            echo json_encode(array("success" => false, "msg" => "error:PHP Notice:  Undefined index dc_emp_id "));
            exit();
        }
        foreach ($rec as $fld1 => $value1) {


            $po = $db->GetDataBySQL("SELECT "
                    . "dc_position_id,"
                    . "(select c_name from NMU_DATACENTER..dc_position where dc_position_id=dc_emp.dc_position_id) as c_position_name "
                    . "FROM NMU_DATACENTER.dbo.dc_emp WHERE i_enable = ? and dc_emp_id=?;", array(1, $rec[$rs]["dc_emp_id"]));

            $data["dc_emp_id"] = $rec[$rs]["dc_emp_id"];
            $data["dc_user_id"] = $rec[$rs]["dc_user_id"];
            $data["c_full_name"] = $rec[$rs]["c_full_name"];
            $data["c_name"] = $rec[$rs]["c_name"];
            $data["c_postion"] = $rec[$rs]["c_postion"];
            $data["c_position_name"] = $po["c_position_name"];
            $data["c_email"] = $rec[$rs]["c_email"];
            $data["c_sub_name_eng"] = $rec[$rs]["c_sub_name_eng"];
            $data["postion_id"] = $rec[$rs]["postion_id"];
            $data["sp_tor_id"] = $rec[$rs]["sp_tor_id"];
            $data["document_type_id"] = $rec[$rs]["document_type_id"];

            $addField = null;
            $arrValue = null;
            $addValue = null;

            foreach ($data as $fld => $value) {
                $arrValue[] = ($value != "") ? $value : NULL;
                $addField .= ", {$fld}";
                $addValue .= ", ?";
            }


            $sql = "SET NOCOUNT ON INSERT INTO dbo.sp_sign_position (" . substr($addField, 2) . ") VALUES (" . substr($addValue, 2) . ");
                                   SELECT SCOPE_IDENTITY() AS id{$i};";

            $stmt = $db->QueryParam($sql, $arrValue);
            $rs++;
        }

        $f1 = $db->GetDataBySQL("SELECT c_code,c_name FROM dbo.sp_tor WHERE i_enabled=? and tor_id = ?;", array(1, $rec[0]["sp_tor_id"]));
        $arrValue2[] = $rec[0]["document_type_id"];
        $arrValue2[] = $rec[0]["sp_tor_id"];
        $arrValue2[] = $f1["c_code"];
        $arrValue2[] = $rec[0]["c_name"];
        ;
        $arrValue2[] = $_SESSION['user_id'];
        $arrValue2[] = $_SESSION['dc_cost_id'];

        $sql2 = "SET NOCOUNT ON INSERT INTO dbo.sp_sign_document (document_type_id,sp_tor_id,c_code,c_name, dc_user_create_id , dc_user_create_cost_id, d_create) "
                . "VALUES (?,?,?,?,?,?, getdate());
                     SELECT SCOPE_IDENTITY() AS id;";

        $stmt2 = $db->QueryParam($sql2, $arrValue2);

        $ss_id = $db->Fetch($stmt2);
        $re_id = $ss_id["id"];

        if ($stmt && $stmt2) {
            $db->CommitTran();
            $re = array("success" => "success", "msg" => "success", "id" => $re_id);
        } else {
            $db->RollBackTran();
            $re = array("msg" => "error");
        }


        echo json_encode($re);
        exit();

        break;

    case "edit":
        $db->BeginTran();
        $paramDel[] = $datas['sp_sign_type_id']; // $rec[0].sp_sign_type_id  
        $paramDel[] = $datas['document_id']; // $rec[0].document_id;
        $paramDel[] = $datas['sp_tor_id']; // $rec[0].sp_tor_id;
        //
        //
    print_R($datas); exit();

        $stmt = $db->QueryParam("select * FROM dbo.sp_sign_type_document WHERE sp_sign_type_id=? and document_id=? and sp_tor_id = ?", $paramDel);
        $i0 = 0;
        while ($rows = $db->Fetch($stmt)) {
            // แปลงวันที่ถ้าเป็น DateTime
            if ($rows['sign_date'] instanceof DateTime) {
//            $rows['sign_date'] = toThaiDate($rows['sign_date']->format('d-m-Y')); 
                $rows['sign_date'] = $rows['sign_date']->format('Y-m-d H:i:s');
            }


            if ($rows['id'] == $rec[$i0]['id']) {
//                echo "\n\r update " . $rec[$i0]['row'].",". $rec[$i0]['col'];
//                echo "\n\r update " ;

                $data = [
                    "id" => intVal($rec[$i0]['id']),
                    "sp_sign_type_id" => intVal($rec[$i0]['sp_sign_type_id']),
                    "line" => intVal($rec[$i0]['line']),
                    "dc_user_id" => intVal($rec[$i0]['dc_user_id']),
                    "full_name" => $rec[$i0]['full_name'],
                    "position_name" => $rec[$i0]['position_name'],
                    "action" => $rec[$i0]['action'],
                    "c_approved" => $rec[$i0]['c_approved'],
                    "org_name" => $rec[$i0]['org_name'],
                    "sign_date" => (($rec[$i0]['sign_date'] !== "") ? normalizeSignDate($rec[$i0]['sign_date']) : NULL),
                    "row" => intVal($rec[$i0]['row']),
                    "col" => intVal($rec[$i0]['col']),
                    "step_sign" => $rec[$i0]['step_sign'],
                    "sp_tor_id" => intVal($rec[$i0]['sp_tor_id']),
                    "document_id" => intVal($rec[$i0]['document_id'])
  
                ];
//                print_r($data);
                $id = $data['id']; // ไว้ใช้ใน WHERE
// ลบ id ออกจากการ update
                unset($data['id']);
// สร้าง SQL dynamic
                $setParts = [];
                $params = [];
                foreach ($data as $field => $value) {
                    $setParts[] = "{$field} = ?";
                    $params[] = ($value !== "") ? $value : null; // ถ้าว่างให้เป็น NULL
                }

// เพิ่ม id ไว้ท้าย params สำหรับ WHERE
                $params[] = $id;
                $sql = "UPDATE dbo.sp_sign_type_document 
                    SET " . implode(", ", $setParts) . " 
                    WHERE id = ?";
//                echo $db->debugSql($sql, $params);

                $para = $db->QueryParam($sql, $params);
            } else {
                echo "\n\r delete " . $rows['id'];
//                    $sql = "DELETE FROM dbo.sp_sign_type_document WHERE sp_sign_type_id=? and document_id=? and sp_tor_id = ?"; 
//                    $para = $db->QueryParam($sql, $paramDel);
            }
            $userSignDoc[] = $rows;
            $i0++;
        }

        if ($para) {
            $db->CommitTran();
            $re = array("success" => "success", "msg" => "success");
        } else {
            $db->RollBackTran();
            $re = array("msg" => "error");
        }

        echo json_encode($re);
        exit();

        $i = 1; // เผื่อคุณต้องใช้ $i ใน SELECT SCOPE_IDENTITY()  
        foreach ($rec as $data) { // $data คือ Array ข้างบน
            $addField = '';
            $addValue = '';
            $arrValue = [];
            //document_id step_sign line

            foreach ($data as $fld => $value) {
                if ($fld == 'id' || $fld == 'page' || $fld == 'position_y' || $fld == 'c_postion') {
                    // sp_sign_type
                } else {
                    // sp_sign_type_document

                    $addField .= ", {$fld}";
                    $addValue .= ", ?";
                    if ($fld == 'sign_date') { //วันที่ convert
                        $arrValue[] = ($value !== "") ? $date->bc_to_ad($value) : NULL;
                    } else {
                        $arrValue[] = ($value !== "") ? $value : NULL;
                    }
                }
            }

            $sql = "SET NOCOUNT ON;
            INSERT INTO dbo.sp_sign_type_document (" . substr($addField, 2) . ")
            VALUES (" . substr($addValue, 2) . ");
           ";
//             echo $db->debugSql($sql, $arrValue); 
            // รันคำสั่ง SQL พร้อม bind ค่าพารามิเตอร์
            $para = $db->QueryParam($sql, $arrValue);
            $i++;
        }

        break;

    case "delete":
        $sql = "DELETE FROM sp_sign_position WHERE id = ?";
        $arrValue[] = $id;
        $para = $db->QueryParam($sql, $arrValue);
        break;

    default:
        break;
}

$db->BeginTran();
if ($para) {
    $db->CommitTran();
    $re = array("success" => "success", "msg" => "success");
} else {
    $db->RollBackTran();
    $re = array("msg" => "error");
}

echo json_encode($re);

