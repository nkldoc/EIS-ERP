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
$contractToday = (new DateTime('now', new DateTimeZone('Asia/Bangkok')))->format('Y-m-d');
// Unlocking the field alone must not switch normal numbering to a dotted number.
if ($mode === 'SAVE_BACKDATE' && isset($_REQUEST['contract_date'])
        && $_REQUEST['contract_date'] >= $contractToday) {
    $mode = 'GENCODECST';
    $_REQUEST['mode'] = $mode;
}
if ($mode === 'PREVIEW_BACKDATE' || $mode === 'SAVE_BACKDATE') {
    header('Content-Type: application/json; charset=utf-8');
    if (empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(array('success' => false, 'msg' => 'กรุณาเข้าสู่ระบบ'));
        exit;
    }
    $docId = isset($_REQUEST['dc_doc_id']) ? intval($_REQUEST['dc_doc_id']) : 0;
    $year = isset($_REQUEST['c_yyyy']) ? intval($_REQUEST['c_yyyy']) : 0;
    $day = isset($_REQUEST['contract_date']) ? $_REQUEST['contract_date'] : '';
    $saving = $mode === 'SAVE_BACKDATE';
    $contractId = intval($_REQUEST['sp_tor_contract_id'] ?? 0);
    if ($saving) {
        $db->BeginTran();
        // Serialize numbering, including simultaneous requests for the same contract.
        $lock = sqlsrv_query($db->conn, "SET NOCOUNT ON; DECLARE @r int;
            EXEC @r = sys.sp_getapplock @Resource = 'sp_doc_gen_backdate',
                @LockMode = 'Exclusive', @LockOwner = 'Transaction', @LockTimeout = 10000;
            SET NOCOUNT OFF;
            SELECT @r AS lock_result;");
        $locked = $lock ? $db->Fetch($lock) : false;
        if (!$locked || $locked['lock_result'] < 0) {
            $db->RollBackTran();
            echo json_encode(array('success' => false, 'msg' => 'ระบบกำลังออกเลขสัญญา กรุณาลองใหม่'));
            exit;
        }
        $stmt = sqlsrv_query($db->conn, 'SELECT c.c_code, t.i_purchase, t.i_type_contract, t.i_yyyy
            FROM dbo.sp_tor_contract c WITH (UPDLOCK, HOLDLOCK)
            INNER JOIN dbo.sp_tor t ON t.tor_id = c.sp_tor_id
            WHERE c.sp_tor_contract_id = ? AND c.sp_tor_id = ?',
            array($contractId, intval($_REQUEST['id'] ?? 0)));
        $contract = $stmt ? $db->Fetch($stmt) : false;
        if (!$contract || trim((string)$contract['c_code']) !== '') {
            $db->RollBackTran();
            echo json_encode(array('success' => false, 'msg' => 'ไม่พบสัญญาหรือสัญญานี้มีเลขแล้ว กรุณาโหลดข้อมูลใหม่'));
            exit;
        }
        $docId = intval($contract['i_purchase']) + (intval($contract['i_type_contract']) === 2 ? 0 : 3);
        $year = intval($contract['i_yyyy']);
        if ($year < 2400) $year += 543;
    }
    $parsed = DateTime::createFromFormat('!Y-m-d', $day);
    $result = array('success' => false, 'msg' => 'กรุณาตรวจสอบประเภทสัญญา ปี และวันที่เริ่มสัญญา');
    if ($docId >= 1 && $docId <= 6 && $year >= 2400 && $year <= 3000
            && $parsed && $parsed->format('Y-m-d') === $day) {
        if (!$saving && $day >= $contractToday) {
            // Match SP_GEN_CODE_CONTRACT without inserting or reserving a number.
            $stmt = $db->QueryParam('SELECT TOP 1 i_year_be FROM dbo.sp_contract_year WHERE i_enabled = 1', array());
            $activeYear = $stmt ? $db->Fetch($stmt) : false;
            $stmt = $db->QueryParam('SELECT emp_code FROM dbo.sp_emp WHERE sp_emp_id = ?',
                array(intval($_REQUEST['sp_emp_id'] ?? 0)));
            $employee = $stmt ? $db->Fetch($stmt) : false;
            $stmt = $db->QueryParam('SELECT d.c_code, d.i_digit,
                (SELECT ISNULL(MAX(g.i_value), 0) + 1 FROM dbo.sp_doc_gen g
                 WHERE g.dc_doc_id = d.dc_doc_id AND g.c_yyyy = ?) AS next_value
                FROM dbo.sp_doc d WHERE d.dc_doc_id = ?',
                array($activeYear ? $activeYear['i_year_be'] : 0, $docId));
            $doc = $stmt ? $db->Fetch($stmt) : false;
            $preview = array('success' => false, 'msg' => 'ไม่พบการตั้งค่าเลขสัญญา ปีที่ใช้งาน หรือรหัสสายงาน');
            if ($activeYear && $employee && $doc && intval($doc['i_digit']) > 0) {
                $preview = array('success' => true, 'normal' => true, 'issue_date' => $day,
                    'code' => $doc['c_code'] . $employee['emp_code']
                        . substr(str_repeat('0', 20) . $doc['next_value'], -intval($doc['i_digit']))
                        . '/' . $activeYear['i_year_be'], 'numbering_type' => 'ปกติ');
            }
            echo json_encode($preview);
            exit;
        }
        $stmt = $db->QueryParam(
            'SELECT TOP 1 i_value, c_gen FROM dbo.sp_doc_gen
             WHERE dc_doc_id = ? AND c_yyyy = ? AND d_create >= ? AND d_create < ?
             ORDER BY i_value DESC, d_create DESC, c_gen DESC',
            array($docId, $year, $day, $parsed->modify('+1 day')->format('Y-m-d'))
        );
        $last = $stmt ? $db->Fetch($stmt) : false;
        // No number on the selected day: use the nearest preceding contract.
        if ($stmt && !$last) {
            $stmt = $db->QueryParam(
                'SELECT TOP 1 i_value, c_gen FROM dbo.sp_doc_gen
                 WHERE dc_doc_id = ? AND c_yyyy = ? AND d_create < ?
                 ORDER BY d_create DESC, i_value DESC, c_gen DESC',
                array($docId, $year, $day)
            );
            $last = $stmt ? $db->Fetch($stmt) : false;
        }
        if (!$stmt) {
            $result['msg'] = 'ไม่สามารถค้นหาเลขสัญญาได้';
        } elseif (!$last) {
            $result['msg'] = 'ไม่พบเลขสัญญาในวันที่เลือกหรือก่อนหน้าในประเภทและปีที่ระบุ';
        } elseif (preg_match('~^(.+?\d+)(?:\.(\d+))?/([0-9]{4})$~u', trim($last['c_gen']), $parts)) {
            $base = $parts[1];
            $suffix = 0;
            $stmt = $db->QueryParam(
                'SELECT c_gen FROM dbo.sp_doc_gen WHERE dc_doc_id = ? AND c_yyyy = ? AND i_value = ?',
                array($docId, $year, $last['i_value'])
            );
            if ($stmt) {
                while ($row = $db->Fetch($stmt)) {
                    if (preg_match('~^' . preg_quote($base, '~') . '\.(\d+)/' . $parts[3] . '$~u', trim($row['c_gen']), $match)) {
                        $suffix = max($suffix, intval($match[1]));
                    }
                }
                $result = array('success' => true, 'last_code' => $last['c_gen'],
                    'code' => $base . '.' . ($suffix + 1) . '/' . $parts[3],
                    'issue_date' => $day, 'numbering_type' => 'ย้อนหลัง');
                if ($saving) {
                    $duplicate = sqlsrv_query($db->conn,
                        'SELECT c_gen FROM dbo.sp_doc_gen WITH (UPDLOCK, HOLDLOCK) WHERE c_gen = ?',
                        array($result['code']));
                    $exists = $duplicate ? $db->Fetch($duplicate) : true;
                    $insert = false;
                    $update = false;
                    if ($duplicate && !$exists) {
                        $purchaseNames = array(1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');
                        $contractNames = array(1 => 'สัญญา', 2 => 'ใบสั่ง', 3 => 'จะซื้อจะขาย');
                        $detail = 'วันที่ออกเลข: ' . substr($day, 8, 2) . '-' . substr($day, 5, 2)
                            . '-' . (intval(substr($day, 0, 4)) + 543) . "\r\n"
                            . 'เลขสัญญา: ' . $result['code'] . "\r\n"
                            . 'ประเภท: ย้อนหลัง (' . $contractNames[intval($contract['i_type_contract'])]
                            . $purchaseNames[intval($contract['i_purchase'])] . ')';
                        $insert = sqlsrv_query($db->conn,
                            'INSERT INTO dbo.sp_doc_gen
                             (dc_doc_id, ref_id, c_yyyy, i_value, dc_user_create_id,
                              dc_user_create_cost_id, d_create, c_gen, c_date, d_gen_date, c_detail)
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, GETDATE(), ?)',
                            array($docId, intval($_REQUEST['id']), $year, $last['i_value'],
                                $_SESSION['user_id'], $_SESSION['dc_cost_id'], $day, $result['code'], $detail));
                        if ($insert) {
                            $update = sqlsrv_query($db->conn,
                                "UPDATE dbo.sp_tor_contract SET c_code = ?, d_doc_date = ?,
                                 dc_user_update_id = ?, dc_user_update_cost_id = ?, d_update = GETDATE()
                                 WHERE sp_tor_contract_id = ? AND ISNULL(c_code, '') = ''",
                                array($result['code'], $day, $_SESSION['user_id'], $_SESSION['dc_cost_id'], $contractId));
                        }
                    }
                    if (!$insert || !$update || sqlsrv_rows_affected($update) !== 1) {
                        $result = array('success' => false, 'msg' => 'ไม่สามารถบันทึกเลขสัญญาได้ กรุณาโหลดตัวอย่างใหม่แล้วลองอีกครั้ง');
                    } else {
                        $result['msg'] = 'ออกเลขสัญญาเรียบร้อยแล้ว: ' . $result['code'];
                    }
                }
            } else {
                $result['msg'] = 'ไม่สามารถค้นหาเลขย่อยสัญญาได้';
            }
        } else {
            $result['msg'] = 'รูปแบบเลขสัญญาล่าสุดไม่รองรับการเติมเลขหลังจุด';
        }
    }
    if ($saving) {
        if ($result['success']) {
            if (!$db->CommitTran()) {
                $db->RollBackTran();
                $result = array('success' => false, 'msg' => 'ไม่สามารถบันทึกเลขสัญญาได้');
            }
        } else {
            $db->RollBackTran();
        }
    }
    echo json_encode($result);
    exit;
}
$table = "dbo.sp_tor_contract";
$keyName = "sp_tor_contract_id";
$data = $util->mnUser($_REQUEST);
$data["i_delete"] = DELETE_FALSE;

$re_id = null;
$stmt2 = true;
$stmt3 = true;

$type = array(1 => "ซ.", 2 => "จ.", 3 => "ช.");

//End fn updateStaus

$db->BeginTran();
if($data['mode']=="RETURNWARANTY"){
//null

} else if ($data['mode'] == "GENCODECST") {
    //$data["c_code_gen"] = "พวช.จ."; // พวช contract sign
    $sp_contract_year = $db->GetDataBySQL("SELECT a.i_year_be FROM dbo.sp_contract_year a WHERE  a.i_enabled = 1 ", array($_REQUEST["i_enabled"]));
    $data['ym'] = $sp_contract_year ; //$_REQUEST['ym_0']; //วันที่เซนสัญญา 21 10 01 :: 20211001 2
    $data['dd'] = $_REQUEST['dd_0']; //วันที่เซนสัญญา 21 10 01 :: 20211001 3
    $data['dc_user_create_id'] = $data['dc_user_update_id'];
    $data['dc_user_create_cost_id'] = $data['dc_user_update_cost_id'];
    $bg_type_id = $_REQUEST['bg_type_id_0']; //แหล่งเงิน 5
    $sp_typ_id = $_REQUEST['sp_typ_id_0']; //ประเภท 4
    $i_type = $_REQUEST['i_type_0']; //สัญญาซื้อ 1
    $data['contract_type'] = $_REQUEST['contract_type_0']; //สัญญา หลัก/ย่อย
    $data['bg_type'] = str_pad($db->GetDataBySQL("select dc_expense_budget_type_id from dbo.dc_expense_budget_type where dc_expense_budget_type_id=? and i_enable=?", array($bg_type_id, 1)), 2, '0', STR_PAD_LEFT); //STR_PAD_LEFT แหล่งเงิน
    $data['sp_type_status'] = str_pad($db->GetDataBySQL("select sp_type_status_id from dbo.sp_type_status where sp_type_status_id=? and i_enabled=?", array($sp_typ_id, 1)), 2, '0', STR_PAD_LEFT); //STR_PAD_LEFT วิธีดำงาน
    $departID = $db->GetDataBySQL("select emp_code from dbo.sp_emp where sp_emp_id =?", array($_REQUEST['sp_emp_id'])); //สายงาน id
    $arrDe = array(2 => "01", 3 => "02", 6 => "03", 1 => "04", 4 => "05");
    $data["digitText"] = $departID;
//ประเภทสัญญา: 1=> สัญญา, 2 => ใบสั่ง, 3 => จะซื้อจะขาย 
    $arrCon = array(1 => "พวช.", 2 => "", 3 => "พวช.");
    $arrPe = array(1 => "ซ.", 2 => "จ.", 3 => "ช.");
    $data["c_type_contract"] = $arrCon[$data['i_type_contract']];
    $data["c_purchase"] = $arrPe[$data['i_type_0']]; 
    $data["c_code_gen"] = $data["c_type_contract"] . "" . $data["c_purchase"];
//    print_r($data);
//    exit();
} else if ($data['mode'] == "GENCODECTSNO") {

    /* 	update dbo.dc_doc set c_code='พวช.จ.', c_name = 'สัญญาหลักจ้าง' ,c_comment ='สัญญาหลักจ้าง' ,i_digit = 4 where dc_doc_id = 10216
      update dbo.dc_doc set c_code='พวช.ซ.', c_name = 'สัญญาหลักซื้อ' ,c_comment ='สัญญาหลักซื้' ,i_digit = 4 where dc_doc_id = 10217
      update dbo.dc_doc set c_code='พวช.ช.', c_name = 'สัญญาหลักเช่า' ,c_comment ='สัญญาหลักเช่า' ,i_digit = 4 where dc_doc_id = 10218
      update dbo.dc_doc set c_code='จ.', c_name = 'สัญญาย่อยจ้าง' ,c_comment ='' ,i_digit = 4 where dc_doc_id = 10220
      update dbo.dc_doc set c_code='ซ.', c_name = 'สัญญาย่อยซื้อ' ,c_comment ='' ,i_digit = 4 where dc_doc_id = 10221
      update dbo.dc_doc set c_code='ช.', c_name = 'สัญญาย่อยเช่า' ,c_comment ='' ,i_digit = 4 where dc_doc_id = 10222 */
    $sp_contract_year = $db->GetDataBySQL("SELECT a.i_year_be FROM dbo.sp_contract_year a WHERE  a.i_enabled = ? ", array($_REQUEST["i_enabled"]));
    $data['ym'] = $sp_contract_year ; // $data['ym'] = $_REQUEST['ym_0']; //วันที่เซนสัญญา 21 10 01 :: 20211001 2
    $data['dd'] = $_REQUEST['dd_0']; //วันที่เซนสัญญา 21 10 01 :: 20211001 3
    $data['dc_user_create_id'] = $data['dc_user_update_id'];
    $data['dc_user_create_cost_id'] = $data['dc_user_update_cost_id'];
    $bg_type_id = $_REQUEST['bg_type_id_0']; //แหล่งเงิน 5
    $sp_typ_id = $_REQUEST['sp_typ_id_0']; //ประเภท 4
    $i_type = $_REQUEST['i_type_0']; //สัญญาซื้อ 1
    $data['contract_type'] = $_REQUEST['contract_type_0']; //สัญญา หลัก/ย่อย
   // $data['bg_type'] = str_pad($db->GetDataBySQL("select dc_expense_budget_type_id from dbo.dc_expense_budget_type where dc_expense_budget_type_id=? and i_enable=?", array($bg_type_id, 1)), 2, '0', STR_PAD_LEFT); //STR_PAD_LEFT แหล่งเงิน
    $data['sp_type_status'] = str_pad($db->GetDataBySQL("select sp_type_status_id from dbo.sp_type_status where sp_type_status_id=? and i_enabled=?", array($sp_typ_id, 1)), 2, '0', STR_PAD_LEFT); //STR_PAD_LEFT วิธีดำงาน
    $departID = $db->GetDataBySQL("select emp_code from dbo.sp_emp where sp_emp_id =?", array($_REQUEST['sp_emp_id'])); //สายงาน id
    $data["digitText"] = $departID;
    $arrCon = array(1 => "พวช.", 2 => "", 3 => "พวช.");
    $arrPe = array(1 => "ซ.", 2 => "จ.", 3 => "ช.");
    $data["c_type_contract"] = $arrCon[$data['i_type_contract']];
    $data["c_purchase"] = $arrPe[$data['i_type_0']]; 
    $data["c_code_gen"] = $data["c_type_contract"] . "" . $data["c_purchase"];
    
//    print_r($data);
//    exit();
} else if ($data['mode'] == "GENCODECTSNOTOR") { 
    
    $data['ym'] = $_REQUEST['ym_0']; //วันที่เซนสัญญา 21 10 01 :: 20211001 2
    $data['dd'] = $_REQUEST['dd_0']; //วันที่เซนสัญญา 21 10 01 :: 20211001 3
    $data['dc_user_create_id'] = $data['dc_user_update_id'];
    $data['dc_user_create_cost_id'] = $data['dc_user_update_cost_id'];
    $bg_type_id = $_REQUEST['bg_type_id_0']; //แหล่งเงิน 5
    $sp_typ_id = $_REQUEST['sp_typ_id_0']; //ประเภท 4
    $i_type = $_REQUEST['i_type_0']; //สัญญาซื้อ 1
    $data['contract_type'] = $_REQUEST['contract_type_0']; //สัญญา หลัก/ย่อย
   // $data['bg_type'] = str_pad($db->GetDataBySQL("select dc_expense_budget_type_id from dbo.dc_expense_budget_type where dc_expense_budget_type_id=? and i_enable=?", array($bg_type_id, 1)), 2, '0', STR_PAD_LEFT); //STR_PAD_LEFT แหล่งเงิน
    $data['sp_type_status'] = str_pad($db->GetDataBySQL("select sp_type_status_id from dbo.sp_type_status where sp_type_status_id=? and i_enabled=?", array($sp_typ_id, 1)), 2, '0', STR_PAD_LEFT); //STR_PAD_LEFT วิธีดำงาน
    $departID = $db->GetDataBySQL("select dc_department_id from dbo.sp_tor_no where tor_id=?", array($data["id"])); //สายงาน id
    $arrDe = array(2 => "01", 3 => "02", 6 => "03");
    $data["digitText"] = $arrDe[$departID]; 
    $arrCon = array(1 => "พวช.", 2 => "", 3 => "พวช.");
    $arrPe = array(1 => "ซ.", 2 => "จ.", 3 => "ช.");
    $data["c_type_contract"] = $arrCon[$data['i_type_contract']];
    $data["c_purchase"] = $arrPe[$data['i_type_0']]; 
    $data["c_code_gen"] = $data["c_type_contract"] . "" . $data["c_purchase"];
    
//    print_r($data);
//    exit();

} else if ($data['mode'] == "GENCODESUB") {
    $data["c_code_gen"] = ""; //contract sign
    $data['ym'] = $_REQUEST['ym_0']; //วันที่เซนสัญญา 21 10 01 :: 20211001 2
    $data['dd'] = $_REQUEST['dd_0']; //วันที่เซนสัญญา 21 10 01 :: 20211001 3
    $data['dc_user_create_id'] = $data['dc_user_update_id'];
    $data['dc_user_create_cost_id'] = $data['dc_user_update_cost_id'];
    $bg_type_id = $_REQUEST['bg_type_id_0']; //แหล่งเงิน 5
    $sp_typ_id = $_REQUEST['sp_typ_id_0']; //ประเภท 4
    $i_type = $_REQUEST['i_type_0']; //สัญญาซื้อ 1
    $data['contract_type'] = $_REQUEST['contract_type_0']; //สัญญา หลัก/ย่อย
    $data['bg_type'] = str_pad($db->GetDataBySQL("select dc_expense_budget_type_id from dbo.dc_expense_budget_type where dc_expense_budget_type_id=? and i_enable=?", array($bg_type_id, 1)), 2, '0', STR_PAD_LEFT); //STR_PAD_LEFT แหล่งเงิน
    $data['sp_type_status'] = str_pad($db->GetDataBySQL("select sp_type_status_id from dbo.sp_type_status where sp_type_status_id=? and i_enabled=?", array($sp_typ_id, 1)), 2, '0', STR_PAD_LEFT); //STR_PAD_LEFT วิธีดำงาน
    $departID = $db->GetDataBySQL("select dc_department_id from dbo.sp_tor where tor_id=?", array($data["id"])); //สายงาน id
    $arrDe = array(2 => "01", 3 => "02", 6 => "03");
    $data["digitText"] = $arrDe[$departID];


}
switch ($mode) {
    case "RETURNWARANTY":
        $sql3 = "UPDATE dbo.sp_tor_contract
        SET i_is_return = 1 ,
            d_return_warranty = '{$data['d_return_warranty']}',
            c_return_warranty = '{$data['c_return_warranty']}',
            c_return_comment = '{$data['c_return_comment']}',
            dc_user_update_id = {$data['dc_user_update_id']},
            dc_user_update_cost_id = {$data['dc_user_update_cost_id']},
            d_update = '{$data['d_update']}'
        WHERE sp_tor_contract_id = {$data['id']}"; 
        // $sql3; exit();
        $stmt = $db->QueryParam($sql3, array());
        if($stmt){ $re_id = $data['id'];}
        break;
    case "GENCODECST":
        $ret_id = $data["id"];
        $data["code"] = (string) $data["c_code_gen"];
        $arrParam2 = array($data["code"], $data['ym'], $data["digitText"], $data['dc_user_create_id'], $data['dc_user_create_cost_id'], $ret_id);
        $sql2 = "EXEC dbo.SP_GEN_CODE_CONTRACT ?, ?, ?, ?, ?, ?;";
//        echo $sql2;
//        print_r($arrParam2);
//        exit;
        $stmt = $db->QueryParam($sql2, $arrParam2);
        $arr_gen_code = $db->Fetch($stmt);
        $c_code = $arr_gen_code["c_code_gen"];//$data["code"]. substr($arr_gen_code["c_code_gen"], 1);
        $ref_id = $arr_gen_code["reference_id"];
//        echo $c_code;
//        echo "\n";
//        echo $ref_id;
//        exit;
        if ($ret_id == $ref_id) {
            $sql3 = "UPDATE {$table} SET c_code= '{$c_code}' WHERE {$keyName} = {$_REQUEST['sp_tor_contract_id']}";
            $stmt3 = $db->QueryParam($sql3, array());
        }
        break;
//        echo $sql3;
//        print_r($data);
//        exit();
    case "GENCODECTSNO":

        $ret_id = $data["id"];
        $data["code"] = (string) $data["c_code_gen"];
        $arrParam2 = array($data["code"], $data['ym'], $data["digitText"], $data['dc_user_create_id'], $data['dc_user_create_cost_id'], $ret_id);
        $sql2 = "EXEC dbo.SP_GEN_CODE_CONTRACT ?, ?, ?, ?, ?, ?;";
//        echo $sql2;
//        print_r($arrParam2);
//        exit;
        $stmt = $db->QueryParam($sql2, $arrParam2);
        $arr_gen_code = $db->Fetch($stmt);
        $c_code = $arr_gen_code["c_code_gen"];//$data["code"]. substr($arr_gen_code["c_code_gen"], 1);
        $ref_id = $arr_gen_code["reference_id"];
//        echo $c_code;
//        echo "\n";
//        echo $ref_id;
//        exit;
        if ($ret_id == $ref_id) {
            $sql3 = "UPDATE {$table} SET c_code= '{$c_code}' WHERE {$keyName} = {$_REQUEST['sp_tor_contract_id']}";
            $stmt3 = $db->QueryParam($sql3, array());
        }
        break;
//        echo $sql3;
//        print_r($data);
//        exit();
    case "GENCODECTSNOTOR":

        $ret_id = $data["id"];
        $data["code"] = (string) $data["c_code_gen"];
        $arrParam2 = array($data["code"], $data['ym'], $data["digitText"], $data['dc_user_create_id'], $data['dc_user_create_cost_id'], $ret_id);
        $sql2 = "EXEC dbo.SP_GEN_CODE_CONTRACT ?, ?, ?, ?, ?, ?;";
//        echo $sql2;
//        print_r($arrParam2);
//        exit;
        $stmt = $db->QueryParam($sql2, $arrParam2);
        $arr_gen_code = $db->Fetch($stmt);
        $c_code = $arr_gen_code["c_code_gen"];//$data["code"]. substr($arr_gen_code["c_code_gen"], 1);
        $ref_id = $arr_gen_code["reference_id"];
//        echo $c_code;
//        echo "\n";
//        echo $ref_id;
//        exit;
        if ($ret_id == $ref_id) {
            $sql3 = "UPDATE dbo.sp_tor_contract_no SET c_code= '{$c_code}' WHERE {$keyName} = {$_REQUEST['sp_tor_contract_id']}";
            $stmt3 = $db->QueryParam($sql3, array());
        }
        break;
//        echo $sql3;
//        print_r($data);
//        exit();
    case "GENCODESUB":

//        $ret_id = $data["id"];
//        $data["code"] = (string) $data["c_code_gen"] . $type[$i_type];
//        $arrParam2 = array($data["code"], $data['ym'], $data["digitText"], $data['dc_user_create_id'], $data['dc_user_create_cost_id'], $ret_id);
//        $sql2 = "EXEC dbo.SP_GEN_CODE_CONTRACT ?, ?, ?, ?, ?, ?;";
//        $stmt = $db->QueryParam($sql2, $arrParam2);
//        $arr_gen_code = $db->Fetch($stmt);
//        $c_code = $arr_gen_code["c_code_gen"];
//        $ref_id = $arr_gen_code["reference_id"];

//        if ($ret_id == $ref_id) { }
        $row = $db->GetDataBySQL("select left(c_code,len(c_code)-5) as front,right(c_code,5) as back from dbo.sp_tor_contract where sp_tor_id=?", array($data["id"]));
        $c_code = $row['front'] . '/' . '0' . $row['back'];
        echo $c_code;
        exit();
        $sql3 = "UPDATE sp_po_hdr SET c_code= '{$c_code}' WHERE sp_po_id = {$_REQUEST['sp_po_id']}";
        $stmt3 = $db->QueryParam($sql3, array());

        break;
}

if ($stmt && $stmt2 && $stmt3) {
    $db->CommitTran();
    $re = array("reval" => 0, "success" => "Success", "msg" => "บันทึกเรียบร้อยแล้ว", "id" => intVal($re_id));
} else {
    $db->RollBackTran();
    $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sql}");
}

echo json_encode($re);
exit;
