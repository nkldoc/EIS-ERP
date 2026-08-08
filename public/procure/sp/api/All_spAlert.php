<?php

include_once("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

$root = "data";
$data = array();
$con = null;
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
} else if ($_REQUEST["type"] == "sp_tor_work_hdr") { //[sp_type_status_id]
    $sqlMain = "SELECT sp_type_status_id as id ,c_name FROM dbo.sp_tor_work_hdr WHERE i_enabled = ? ORDER BY sp_type_status_id";
    $arrParam = array(STATUS_ENABLE);
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {


        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => "{$row["id"]}",
                "c_name" => "{$row["c_name"]}"
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "sp_tor_work") { //[sp_type_status_id]
    $sp_type_status_id = $_REQUEST["sp_type_status_id"] ?? NULL;
    $sqlMain = "SELECT sp_tor_work_id as id ,c_name,score,i_group,sp_cate_id FROM dbo.sp_tor_work WHERE i_enabled = ? and sp_type_status_id = ? ORDER BY sp_type_status_id";
    $arrParam = array(STATUS_ENABLE, $sp_type_status_id);
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {

        $max_sp_type_status_id = 24;

//            ${$root}[] = array(
//                "id" => "0",
//                "c_name" => "- เลือกทั้งหมด -"
//            );

        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => "{$row["id"]}",
                "c_name" => "{$row["c_name"]}",
                "score" => "{$row["score"]}",
                "sp_cate_id" => "{$row["sp_cate_id"]}",
                "i_group" => "{$row["i_group"]}"
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
} else if ($_REQUEST["type"] == "sp_tor_scores") { //[sp_type_status_id]
    $sp_tor_id = $_REQUEST["id"] ?? NULL;

    $sqlMain = "SELECT * from dbo.view_sp_tor_work_socore where i_enabled=? and sp_tor_id=?";
    $arrParam = array(STATUS_ENABLE, $sp_tor_id);
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {

        /* sp_tor_id	dc_department_id	sp_emp_id	sp_cate_id	sp_type_id	i_enabled	id	c_name	score
         */
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "sp_tor_id" => "{$row["sp_tor_id"]}",
                "dc_department_id" => "{$row["dc_department_id"]}",
                "sp_emp_id" => "{$row["sp_emp_id"]}",
                "sp_cate_id" => "{$row["sp_cate_id"]}",
                "sp_type_id" => "{$row["sp_type_id"]}",
                "c_type_id" => "{$row["c_type_id"]}", //	,
                "sp_tor_work_id" => "{$row["sp_tor_work_id"]}",
                "c_sp_tor_work_id" => "{$row["c_sp_tor_work_id"]}",
                "sp_tor_hdr_period_id" => "{$row["sp_tor_hdr_period_id"]}",
                "id" => "{$row["id"]}",
                "c_name" => "{$row["c_name"]}",
                "i_enabled" => "{$row["i_enabled"]}",
                "score" => "{$row["score"]}"
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "sp_tor_score_emp") { //[sp_type_status_id]
    $sqlMain = " SELECT  e.c_name
		    , a.[dc_department_id]
                    , a.[dc_department_type_id]
                    , a.[c_name] as c_department
                    , a.[i_seq]
                    , a.[i_show]
                        , isnull((select count(sp_tor_id) from [NMU_ERP].[dbo].sp_tor_work_score where sp_emp_id=e.sp_emp_id),0) as c_tor_id
                        , sum(b.score) as score
                FROM dbo.sp_emp e
		inner join [NMU_ERP].[dbo].[sp_department] a on a.dc_department_id = e.dc_department_id
                left join [NMU_ERP].[dbo].[view_sp_tor_work_socore] b on b.sp_emp_id=e.sp_emp_id
               -- where [dc_department_type_id]=?
                group by  e.sp_emp_id
                    , e.c_name
                    , a.[dc_department_id]
                    , a.[dc_department_type_id]
                    , a.[c_name]
                    , a.[i_seq]
                    , a.[i_show]";

    $arrParam = array(2);
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => "{$row["dc_department_id"]}",
                "c_department" => "{$row["c_department"]}",
                "dc_department_id" => "{$row["dc_department_id"]}",
                "c_name" => "{$row["c_name"]}",
                "c_tor_id" => "{$row["c_tor_id"]}",
                "score" => floatVal($row["score"])
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "sp_tor_department") { //[sp_type_status_id]
    $sqlMain = "SELECT a.[dc_department_id]
                    ,a.[dc_department_type_id]
                    ,a.[c_name]
                    ,a.[i_seq]
                    ,a.[i_show]
                        , isnull((select count(sp_tor_id) from [NMU_ERP].[dbo].sp_tor_work_score where dc_department_id=a.dc_department_id),0) as c_tor_id
                        , sum(b.score) as score
                FROM [NMU_ERP].[dbo].[sp_department] a
                left join [NMU_ERP].[dbo].[view_sp_tor_work_socore] b on a.[dc_department_id]=b.[dc_department_id]
                where [dc_department_type_id]=?
                group by a.[dc_department_id]
                    ,a.[dc_department_type_id]
                    ,a.[c_name]
                    ,a.[i_seq]
                    ,a.[i_show]";

    $arrParam = array(2);
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => "{$row["dc_department_id"]}",
                "dc_department_id" => "{$row["dc_department_id"]}",
                "c_name" => "{$row["c_name"]}",
                "c_tor_id" => "{$row["c_tor_id"]}",
                "score" => floatVal($row["score"])
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "sp_type_bg") {
    $i_type = $_REQUEST["i_type"] ?? 0;
    $wh = null;
    if ($i_type == 1) {
        $wh = " and i_type = 1";
    }
    $i_type_bg = $_REQUEST["i_type_bg"] ?? NULL;
// $stm = ($i_is_type_tor === NULL) ? "" : " and i_is_type_tor=1";  i_is_type_tor
// $sqlMain = "SELECT sp_type_status_id as id ,c_name FROM dbo.sp_type_status WHERE i_enabled = ? $stm ORDER BY c_name";
    $sqlMain = "SELECT sp_type_bg_id as id ,c_name FROM dbo.sp_type_bg WHERE i_enabled = ? and i_show = 1 {$wh}  ORDER BY sp_type_bg_id";
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
} else if ($_REQUEST["type"] == "sp_tor_emp") { //[sp_type_status_id]
    // print_r($_SESSION["sp_emp_id"]);
    $sp_emp_id = $_SESSION["sp_emp_id"];
    $sqlMain = "SELECT a.[dc_department_id]
                    ,a.[dc_department_type_id]
                    ,a.[c_name]
                    ,a.[sp_emp_id]
                    , isnull((select count(sp_tor_id) from [NMU_ERP].[dbo].sp_tor_work_score where sp_emp_id=a.sp_emp_id),0) as c_tor_id
                    , sum(b.score) as score
                FROM [NMU_ERP].[dbo].[sp_emp] a
                left join [NMU_ERP].[dbo].[view_sp_tor_work_socore] b on a.[sp_emp_id]=b.[sp_emp_id]
                where a.[i_enable] = ? and   a.[sp_emp_id]= ?
                group by a.[dc_department_id]
                    ,a.[dc_department_type_id]
                    ,a.[c_name]
                    ,a.[sp_emp_id] ";

    // $arrParam = array(2);
    $arrParam = array(STATUS_ENABLE, $sp_emp_id);
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => "{$row["dc_department_id"]}",
                "dc_department_id" => "{$row["dc_department_id"]}",
                "c_name" => "{$row["c_name"]}",
                "sp_emp_id" => "{$row["sp_emp_id"]}",
                "c_tor_id" => "{$row["c_tor_id"]}",
                "score" => floatVal($row["score"])
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "sp_type_bg") {
    $i_type = $_REQUEST["i_type"] ?? 0;
    $wh = null;
    if ($i_type == 1) {
        $wh = " and i_type = 1";
    }
    $i_type_bg = $_REQUEST["i_type_bg"] ?? NULL;
// $stm = ($i_is_type_tor === NULL) ? "" : " and i_is_type_tor=1";  i_is_type_tor
// $sqlMain = "SELECT sp_type_status_id as id ,c_name FROM dbo.sp_type_status WHERE i_enabled = ? $stm ORDER BY c_name";
    $sqlMain = "SELECT sp_type_bg_id as id ,c_name FROM dbo.sp_type_bg WHERE i_enabled = ? and i_show = 1 {$wh}  ORDER BY sp_type_bg_id";
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
