<?php

include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

###################
$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();
############################################################################################################
$mode = @$_REQUEST["mode"];
$filter = @$_REQUEST["filter"];
$value = @$_REQUEST["value"];
$i_read = @$_REQUEST["i_read"];
###################
$root = "data";
$data = array();
###################
$limit = @$_REQUEST["limit"];
$dir = @$_REQUEST["dir"];
$sort = @$_REQUEST["sort"];
$start = @$_REQUEST["start"];

function get($a) {
    return $a ?? 0;
}

if (!get($start)) {
    $start = 0;
}
if (!get($limit)) {
    $limit = 20;
} else {
    $limit = ($limit + $start);
}
if (!get($dir)) {
    $dir = "DESC";
}
if (!get($sort)) {
    $sort = " s.c_code";
}

#################################
$arrParam = array();
$arrCountParam = array();
$con = null;
$conDtl = null;
if ($_REQUEST["type"] == "lasperiodNotification") {


    $arrParam = array();
    $arrCountParam = array();

    $sqlTempTable = "select sp_check_period_hdr_id,sp_mn_contract_hdr_id,sp_tor_hdr_period_id,sp_tor_contract_id 
	, d_warranty_date
	, DATENAME(dw,DATEADD(month, -1, CAST(d_warranty_date AS DATE))) as strDay
	, DATEPART(dw,DATEADD(month, -1, CAST(d_warranty_date AS DATE))) as intDayWaranty
	, DATEPART(dw,getDate()) as intToDay
	, DATEADD(month, -1, CAST(d_warranty_date AS DATE)) as beforMonth
	, CONVERT(char(10), GetDate(),120) as strToDay
	, DATEADD(day, -7, CAST(d_warranty_date AS DATE)) as lastWeek
	, DATEDIFF(day, DATEADD(month, -1, CAST(d_warranty_date AS DATE)), d_warranty_date) AS day_diff_month
	, DATEDIFF(day, getDate(), d_warranty_date) AS day_bal
	, row_number() over (order by d_warranty_date DESC) as row
	from NMU_ERP.dbo.sp_check_period_hdr  
	where GETDATE() >= DATEADD(month, -1, CAST(d_warranty_date AS DATE)) 
		AND EXISTS (SELECT i_is_close FROM NMU_ERP.dbo.sp_tor_contract WHERE sp_tor_contract.sp_tor_contract_id = sp_check_period_hdr.sp_tor_contract_id AND i_enabled = 1)
	"; //
    $arrParam[] = $start;
    $arrParam[] = $limit;
    $sqlMain = "select a.*"
            . ", (select top 1 c_name from NMU_ERP.dbo.sp_type_bg where c.i_type_bg = i_value) as c_type_bg"
            . ", (select top 1 c_code from NMU_ERP.dbo.sp_check_period_hdr where a.sp_check_period_hdr_id = sp_check_period_hdr_id) as c_code"
            . ", (select top 1 c_name from NMU_ERP.dbo.sp_emp where c.sp_emp_id = sp_emp_id) as emp_name"
            . ", c.c_name as c_name"
            . ", c.c_code as pr_code"
            . ", b.c_code as contract_code"
            . ", isnull(CONVERT(VARCHAR, a.d_warranty_date, 120),null) as d_warranty_date" 
            . ", isnull(CONVERT(VARCHAR, a.beforMonth, 120),null) as beforMonth" 
            . " from ({$sqlTempTable}) a "
            . " inner join NMU_ERP.dbo.sp_tor_contract b on a.sp_tor_contract_id = b.sp_tor_contract_id "
            . " inner join NMU_ERP.dbo.sp_tor c on b.sp_tor_id = c.tor_id"
            . " WHERE a.row > ? and a.row <= ?";
//             echo $sqlMain;
//    exit;
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    $cIsClose = array(0 => "<font color='blue'>ปกติ</font>", 1 => "<font color='green'>ปิดสัญญา</font>", 2 => "<font color='red'>ยกเลิกสัญญา</font>");
    /* sp_check_period_hdr_id
     * ,sp_mn_contract_hdr_id
     * ,sp_tor_hdr_period_id
     * ,sp_tor_contract_id
     * ,d_warranty_date
     * ,strDay
     * ,intDayWaranty
     * ,intToDay
     * ,beforMonth,strToDay
     * ,lastWeek,day_diff_month,day_bal,row 
     */
    $thai_day_arr = array("อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์","เสาร์");
    while ($row = $db->Fetch($stmt)) {
        $temp = array(
            "no" => $row["row"],
            "id" => intval($row["sp_check_period_hdr_id"]),
            "sp_mn_contract_hdr_id" => intval($row["sp_mn_contract_hdr_id"]),
            "sp_tor_hdr_period_id" => intval($row["sp_tor_hdr_period_id"]),
            "i_type_bgName" => $row["c_type_bg"],
            "pr_code" => $row["pr_code"],
            "contract_code" => $row["contract_code"],
            "strDay" => $row["strDay"],
            "intDayWaranty" => intval($row["intDayWaranty"]),
            "strDayNotif" => $thai_day_arr[(intval($row["intDayWaranty"])-1)],
            "intToDay" => intval($row["intToDay"]),
            "d_warranty_date" => $date->extDateBuddha($row["d_warranty_date"]),
            "beforMonth" => $date->extDateBuddha($row["beforMonth"]),
            "strToDay" => $row["strToDay"], 
            "lastWeek" => $row["lastWeek"],
            "day_diff_month" => $row["day_diff_month"],
            "c_name" => $row["c_name"],
            "emp_name" => $row["emp_name"],
            "day_bal" => ($row["day_bal"]<8?"<span style='color:red;font-weight:bold;'>".$row["day_bal"]."</span>":$row["day_bal"]),
            "c_code" => $row["c_code"],
            
 
//            "ref_id" => intval($row["ref_id"]),
//            "c_name" => $row["c_name"], 
//            "i_is_close" => intval($row["i_is_close"]),
//            "txti_is_close" => $cIsClose[intval($row["i_is_close"])],
//            "i_before" => intval($row["i_before"]),
//            "due_date" => $date->extDateBuddha($row["due_date"]),
//            "notif_date" => $row["notif_date"] != null ? $date->extDateBuddha($row["notif_date"]) : null, 
//            "c_doc_ref" => $row["c_doc_ref"],
//            "c_contract_ref" => $row["c_contract_ref"], 
//            "c_contract_code" => $row["c_contract_code"],
//            "c_checking_code" => $row["c_checking_code"],
//            "c_arrive_code" => $row["c_arrive_code"],
//            "c_code" => $row["c_code"],
//            "i_close" => intval(@$row["i_close"]),
//            "i_is_complete" => $row["i_is_complete"],
//            "d_warranty_date" => $row["d_checking_date1"] == null ? $date->extDateBuddha($row["d_checking_date1"]) : null,
//            "d_warranty_date" => $row["d_warranty_date"] == null ? $date->extDateBuddha($row["d_warranty_date"]) : null,
 
        );
        ${$root}[] = $temp;
    }

    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
