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
