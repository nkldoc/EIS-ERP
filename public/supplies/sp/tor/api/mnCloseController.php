<?php

//-- mnContractCode
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

$mode = $_REQUEST["mode"] ?? null;
$table = "dbo.sp_check_period_hdr";
$keyName = "sp_check_period_hdr_id";
$data = $util->mnUser($_REQUEST);
$data["i_delete"] = DELETE_FALSE;

$re_id = null;
$stmt2 = true;
$stmt3 = true;
$stmt4 = true;
$stmt5 = true;

$db->BeginTran();

print_r($_REQUEST);
exit();

switch ($mode) {
    case "GENCODECHECKING":
        $data['dc_user_create_cost_id'] = $_SESSION['dc_cost_id'];
        $data['dc_user_create_id'] = $_SESSION['user_id'];
        $ret_id = $_REQUEST["sp_check_period_hdr_id"] ?? null;

//        $code_dc = (string) $c_code_gen;
//        $sql = "EXEC dbo.SP_GEN_CODE ?,?,?,?,?;";
//        $arrParam = array($code_dc, date("Ym"), $data['dc_user_create_id'], $data['dc_user_create_cost_id'], $ret_id);
//        $stmt = $db->QueryParam($sql, $arrParam); 
//        $arr_gen_code = $db->Fetch($stmt);
//        $c_code = $arr_gen_code["c_code_gen"];
//        $ref_id = $arr_gen_code["reference_id"];
//        if ($ret_id == $ref_id) {
//            //อัพเดท
//            $sql2 = "UPDATE {$table} SET c_code= '{$c_code}' WHERE {$keyName} = ?;";
//            $stmt2 = $db->QueryParam($sql2, array($data["sp_check_period_hdr_id"]));
//            $f1 = $db->GetDataBySQL("select a.c_arrive_code
//                                        , (select c_code from sp_tor_contract where sp_tor_contract_id=a.sp_tor_contract_id) as c_contract_code
//                                        , a.i_before
//                                        , convert(varchar, a.d_warranty_date,120) as d_warranty_date
//                                        from sp_check_period_hdr a
//                                        where a.sp_check_period_hdr_id= ? ", array($ret_id));
//            $ref_id = $ret_id;
//            $c_name = $c_code;
//            $c_detail = $f1['c_arrive_code'] . "/" . $f1['c_contract_code'] . " วันที่ " . $f1['d_warranty_date'];
//            $sqlInsert = "INSERT INTO dbo.sp_alert_queque (ref_id ,c_name ,c_detail ,i_is_start ,due_date ,i_before ,user_id ,sp_emp_id)
//                                        VALUES ($ref_id, '$c_name', '$c_detail', 0, '{$f1['d_warranty_date']}', {$f1['i_before']}, " . ($_SESSION['user_id']) . ", " . ($_SESSION['sp_emp_id']) . " );";
//
//            $stmt4 = $db->QueryParam($sqlInsert, array());
//        }

        break;
}


if ($stmt && $stmt2 && $stmt3 && $stmt4) {
    $db->CommitTran();
    $re = array("reval" => 0, "success" => "Success", "msg" => "บันทึกเรียบร้อยแล้ว", "id" => $data["sp_check_period_hdr_id"]);
} else {
    $db->RollBackTran();
    $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sql}");
}

echo json_encode($re);
exit;
