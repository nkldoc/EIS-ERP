<?php

include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db = new DatabaseServer();
$util = new apiUtil();

$root = "data";
$data = array();
$con = null;
if ($_REQUEST["type"] == "sp_emp") {

    $sqlMain = "select a.* from NMU_DATACENTER.dbo.dc_user a "
            . "left join sp_emp b on b.dc_emp_id = a.dc_emp_id "
            . "where a.dc_emp_id > 1  "
            . "order by a.c_full_name";
    $arrParam = array(STATUS_ENABLE);
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {

        ${$root}[] = array(
            "id" => "01",
            "c_name" => " รายการสวมสิทธิ์ "
        );

        while ($row = $db->Fetch($stmt)) {
            ${$root}[] = array(
                "id" => "{$row["dc_user_id"]}",
                "dc_user_id" => "{$row["dc_user_id"]}",
                "c_user_name" => "{$row["c_user_name"]}",
                "c_password" => "{$row["c_password"]}",
                "dc_emp_id" => "{$row["dc_emp_id"]}",
                "c_name" => "{$row["c_full_name"]} "
            );
        }
    }
}
echo json_encode(array("debug" => true, $root => ${$root}));
exit;
