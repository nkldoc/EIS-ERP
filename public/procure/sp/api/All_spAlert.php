<?php

include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

$root = "data";
$data = array();
$con = null;
$wh = '';
if ($_REQUEST["type"] == "checkBilling") { //[sp_type_status_id]
    $d_doc_arrive_dt = $_REQUEST['d_doc_arrive_dt'] ?? null;

    $sqlMain = "SELECT "
            . " sp_bg_billing_dtl_id as id"
            . ", sp_bg_billing_id as hdr_id"
            . ", i_yyyy"
            . ", convert(varchar,d_post_date,120) as d_post_date"
            . ", i_time"
            . ", convert(varchar,d_start_date,120) as d_start_date"
            . ", convert(varchar,d_end_date,120) as d_end_date"
            . ", convert(varchar,d_billing_date,120) as d_billing_date"
            . " ,i_confirm"
            . " ,(
                + 'ปีงบประมาณ '
                + CAST((i_yyyy+543) AS VARCHAR(4))
                + ' รอบส่งของ '
                + CAST(i_time AS VARCHAR(1))
                +' วันที่ '
                + convert(varchar, DATEADD(year, 543, d_start_date), 105)  --convert(varchar, d_start_date, 120)
                +' ถึง '
                + convert(varchar, DATEADD(year, 543, d_end_date), 105) -- CAST(d_end_date AS VARCHAR(10))
                +' | วันวางบิล '
                + convert(varchar, DATEADD(year, 543, d_billing_date), 105) -- CAST(d_end_date AS VARCHAR(10))
                ) as c_name"
            . " FROM dbo.sp_bg_billing_dtl"
            . " WHERE i_enabled = ?"
            . " and '{$d_doc_arrive_dt}' between d_start_date and d_end_date"
            . " ORDER BY c_name";
    $arrParam = array(STATUS_ENABLE);
// echo $sqlMain;
// exit();

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {


        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => "{$row["id"]}",
                "c_name" => "{$row["c_name"]}", // d_post_date d_start_date d_end_date d_billing_date
                "d_post_date" => "{$row["d_post_date"]}",
                "d_start_date" => "{$row["d_start_date"]}",
                "d_end_date" => "{$row["d_end_date"]}",
                "d_billing_date" => "{$row["d_billing_date"]}"
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "sp_type_guarantee") { //[sp_type_status_id]
    $sp_type_status_id = $_REQUEST["sp_type_status_id"] ?? NULL;
    $sqlMain = "SELECT cm_receive_type_id as id ,c_name FROM " . DB_CENTER . "cm_receive_type WHERE i_enable = ? and i_type_sp = 1 ORDER BY cm_receive_type_id";
    $arrParam = array(STATUS_ENABLE, $sp_type_status_id);
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {

        // $max_sp_type_status_id = 24;

        ${$root}[] = array(
            "id" => "0",
            "c_name" => "- ไม่มีการค้ำประกัน -"
        );

        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => "{$row["id"]}",
                "c_name" => "{$row["c_name"]}",
                    // "score" => "{$row["score"]}",
                    // "sp_cate_id" => "{$row["sp_cate_id"]}",
                    // "i_group" => "{$row["i_group"]}"
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "sp_type_status") { //[sp_type_status_id]
    $i_is_type_tor = $_REQUEST["i_is_type_tor"] ?? NULL;
    $stm = ($i_is_type_tor === NULL) ? "" : " and i_is_type_tor=1";
    $sqlMain = "SELECT sp_type_status_id as id ,c_name FROM dbo.sp_type_status WHERE i_enabled = ? $stm ORDER BY c_name";
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
                "id" => "{$row["id"]}",
                "c_name" => "{$row["c_name"]}"
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "sp_type_mapping_code") { //[sp_type_status_id]
//   print_r($_SESSION); exit();
    $cndi = ($_SESSION['user_id'] == 1) ? "" : " and dc_user_create_id = " . $_SESSION['user_id'];
    $sqlMain = " SELECT "
            . " format(d_create,'yyyymmddhhmmss') AS id"
            . " ,c_gen as c_code"
            . " ,dc_doc_id ,ref_id ,c_yyyy ,i_value ,dc_user_create_id ,dc_user_create_cost_id , d_create ,c_gen ,c_date ,d_gen_date"
            . " ,(select c_full_name from dc_user where dc_user.dc_user_id=sp_doc_gen.dc_user_create_id) as sp_emp_idTxt"
            . " FROM dbo.sp_doc_gen "
            . " WHERE 1=? and i_enabled=1"
            . " {$cndi}"
            . " AND not exists (select 1 from dbo.sp_tor_contract where sp_tor_contract.c_code = c_gen and i_enabled=1)"
            . " ORDER BY d_create desc";
// echo $sqlMain; exit();
    $arrParam = array(1);
    $wh = '';
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {


        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => "{$row["id"]}",
//                "c_code" => ($_SESSION['user_id']==1)?"{$row["c_code"]}-{$row["sp_emp_idTxt"]}":"{$row["c_code"]}",
                "c_code" => "{$row["c_code"]}",
                "c_gen" => "{$row["c_gen"]}",
                "dc_user_create_id" => "{$row["dc_user_create_id"]}"
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "sp_type_bg") {

    $i_type_bg = $_REQUEST["i_type_bg"] ?? NULL;
    $i_type = $_REQUEST["i_type"] ?? NULL;

    if ($i_type) {
        $wh = 'and sp_type_bg_id in (2,4,13)';
    } else if ($i_type = 2) {
        // $wh = 'and sp_type_bg_id not in  (1)' ;
    } else {
        $wh = 'and i_type in(1,2,4,7)';
    }
    // $stm = ($i_is_type_tor === NULL) ? "" : " and i_is_type_tor=1";  i_is_type_tor
    // $sqlMain = "SELECT sp_type_status_id as id ,c_name FROM dbo.sp_type_status WHERE i_enabled = ? $stm ORDER BY c_name";
    $sqlMain = "SELECT sp_type_bg_id as id ,c_name FROM dbo.sp_type_bg WHERE i_enabled = ? {$wh}    ORDER BY sp_type_bg_id";
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
                "id" => "{$row["id"]}",
                "c_name" => "{$row["c_name"]}"
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "sp_type_id") {


    $sqlMain = "select * from sp_type_item where i_enabled=? and active=? order by parent_id,i_seq";
    $arrParam = array(STATUS_ENABLE, 1);
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {

//        if (@$_REQUEST["all"] == "all") {
//            ${$root}[] = array(
//                "id" => "0",
//                "c_name" => "- เลือกทั้งหมด -"
//            );
//        }

        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => "{$row["sp_type_id"]}",
                "c_name" => "{$row["c_name"]}"
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "sub_cost_id") {




    $sqlMain = "select * from NMU_ERP.dbo.dc_cost where i_last=? and i_enable = ? order by c_name";
    $arrParam = array(STATUS_ENABLE, 1);
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {

        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => "{$row["dc_cost_id"]}",
                "c_name" => "{$row["c_name"]}"
            );
            ${$root}[] = $temp;
        }
    }
}

echo json_encode(array("debug" => true, $root => ${$root}));
exit;
