<?php

include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db = new DatabaseServer();
$util = new apiUtil();

$root = "data";
$data = array();
$con = null;
if ($_REQUEST["type"] == "sp_emp") {

    $sqlMain = "select * from sp_emp a inner join dc_user b on b.dc_emp_id = a.dc_emp_id   where a.dc_emp_id>1  ";
    $arrParam = array(STATUS_ENABLE);
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {
 
        ${$root}[] = array(
            "id" => "01",
            "c_name" => " แจ้งพนักงานเลือกทั้งหมด "
        );
         
        while ($row = $db->Fetch($stmt)) {
            ${$root}[] = array(
                "id" => "{$row["sp_emp_id"]}",
                "dc_user_id" => "{$row["dc_user_id"]}",
                "c_name" => "{$row["c_name"]}"
            );
 
        }
    }
}
echo json_encode(array("debug" => true, $root => ${$root}));
exit;
