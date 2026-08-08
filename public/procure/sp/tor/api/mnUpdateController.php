<?php

 include("../../../conf/config.php");
 include("../../../lib/database/DatabaseServer.php");
 include("../../../lib/database/apiUtil.php");
 include("../../../lib/date/i_date.class.php");



 $db = new DatabaseServer();
 $date = new i_date();
 $util = new apiUtil();



 $mode = $_REQUEST["mode"] ?? NULL;
 //{mode: "EDIT", fldName: "i_is_upload", fldVal: 1, tblName: "sp_tor_hdr_period", keyName: "sp_tor_hdr_period_id", idVal: id},
 $table = "EIS_PROCURE.dbo." . $_REQUEST["tblName"];
$fldName = $_REQUEST["fldName"] ?? null;
$fldUpName = $_REQUEST["fldUpName"] ?? null;
$fldVal = $_REQUEST["fldVal"] ?? null;
$keyName = $_REQUEST["keyName"] ?? null;
$idVal = $_REQUEST["idVal"] ?? null;

$stmt2 = false;
$stmt3 = false;
 $db->BeginTran();

 //   print("UPDATE {$table} SET {$fldName}={$fldVal} WHERE {$keyName} = {$idVal}");
//  exit();
switch ($mode) {
    case "EDIT" :
        sleep(5);
        $stmt2 = true;
         $stmt3 = true;
         $arrParam = array();
         $upField = "";
        $sql = "UPDATE {$table} SET {$fldName} = ? , upload_name = ? WHERE {$keyName} = ?";
        $arrParam[] = $fldVal;
        $arrParam[] = $fldUpName;
        $arrParam[] = $idVal;

        $stmt = $db->QueryParam($sql, $arrParam);

         break;
     case "REMOVE" :
 //         $stmt2 = true;
//         $stmt3 = true;
//         $sql = "UPDATE {$table} SET {$fld} = ? WHERE {$keyName} = ?";
//        $arrParam = array(DELETE_TRUE, $data["id"]);
//         $stmt = $db->QueryParam($sql, $arrParam);
        break;


 }
 if ($stmt) {
     $db->CommitTran();
     $re = array("reval" => 0, "success" => "Success", "msg" => "commit", "id" => $idVal);
} else {
     $db->RollBackTran();
     $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sql}");
 }
 echo json_encode($re);
 exit;
 
