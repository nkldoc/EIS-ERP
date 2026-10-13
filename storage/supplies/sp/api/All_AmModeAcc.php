<?php

include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db = new DatabaseServer();
$util = new apiUtil();

$root = "data";
$data = array();
$con = null;

if ($_REQUEST["type"] == "am_mode_acc") {

    $sqlMain = "SELECT am_mode_id,c_code ,c_acc_name, c_name  FROM dbo.am_mode_acc WHERE i_enabled = ? ORDER BY c_code";
    $arrParam = array(STATUS_ENABLE);
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {

        if (@$_REQUEST["all"] == "all") {
            ${$root}[] = array(
                "id" => "0",
                "c_name" => "- เลือกทั้งหมด -"
            );
        }

        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => intVal($row["am_mode_id"]),
                "c_code" => $row["c_code"],
                "c_name" => $row["c_code"] . "-" . $row["c_name"]
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "inv_mode_acc") {
    $sqlMain = "SELECT inv_mode_id,c_code ,c_acc_name, c_name  FROM " . DB_CENTER . "inv_mode_acc WHERE i_enabled = ? ORDER BY c_code";
    $arrParam = array(STATUS_ENABLE);
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {

        if (@$_REQUEST["all"] == "all") {
            ${$root}[] = array(
                "id" => "0",
                "c_name" => "- เลือกทั้งหมด -"
            );
        }

        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => intVal($row["inv_mode_id"]),
                "c_code" => $row["c_code"],
                "c_name" => $row["c_code"] . "-" . $row["c_name"]
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "product") {
    $wh = "";
    $act = $_REQUEST['act'] ?? NULL;
    $prounder = $_REQUEST['pro_type'] ?? NULL;
    $pro_type = ($prounder == "inv") ? "inv" : "asset";

    if ($act == "SEARCH") {
        $val = $_REQUEST['value'] ?? NULL;
        $wh = " and c_name like '%{$val}%'";
    }

    if ($prounder == "inv") {
        $sqlMain = "SELECT sp_product_id"
                . ", am_mode_id"
                . ", inv_mode_id "
                . ", (c_name+' | '+(select top 1 c_name from " . DB_CENTER . "inv_mode_acc where " . DB_CENTER . "inv_mode_acc.inv_mode_id=dbo.sp_product.inv_mode_id)) as c_nameTxt "
                . ", c_name  FROM dbo.sp_product WHERE inv_mode_id is not null and i_enabled = ? {$wh} ORDER BY sp_product_id desc";
    } else {
        $sqlMain = "SELECT sp_product_id"
                . ", am_mode_id"
                . ", inv_mode_id "
                . ", (c_name+' | '+(select top 1 c_name from dbo.am_mode_acc where dbo.am_mode_acc.am_mode_id=dbo.sp_product.am_mode_id)) as c_nameTxt "
                . ", c_name  FROM dbo.sp_product WHERE am_mode_id is not null and  i_enabled = ? {$wh} ORDER BY sp_product_id desc";
    }




    $arrParam = array(STATUS_ENABLE);
//    echo $sqlMain;exit();
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {
        $i = 1;
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "no" => $i++,
                "id" => intVal($row["sp_product_id"]),
                "inv_mode_id" => intVal($row["inv_mode_id"]),
                "am_mode_id" => intVal($row["am_mode_id"]),
                "c_name" => $row["c_name"],
                "c_nameTxt" => $row["c_nameTxt"]
            );
            ${$root}[] = $temp;
        }
    }
}

echo json_encode(array("debug" => true, $root => ${$root}));
exit;
