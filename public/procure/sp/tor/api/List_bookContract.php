<?php

include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

###################
$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();
#################################################################
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
    $sort = " a.d_create";
}

#################################
$arrParam = array();
$arrCountParam = array();
$con = null;
$conDtl = null;
$act = $_REQUEST["act"] ?? null;
$type = $_REQUEST["type"] ?? null;
if ($type == "lasperiodNotification") {

    if ($act == "SEARCH") {
        $c_code = trim((string)($_REQUEST['c_code'] ?? ''));
        $d_start_raw = trim((string)($_REQUEST['d_start'] ?? ''));
        $d_end_raw = trim((string)($_REQUEST['d_end'] ?? ''));
        $condi = '';
        $searchParams = array();

        // Search the visible contract code as a substring, and apply either
        // date bound independently so a one-sided range still works.
        if ($c_code !== '') {
            $condi .= " AND c_gen LIKE ?";
            $searchParams[] = '%' . $c_code . '%';
        }
        foreach (array('d_create' => $d_start_raw, 'd_create_end' => $d_end_raw) as $field => $rawDate) {
            if ($rawDate === '') {
                continue;
            }
            try {
                $dateValue = (new DateTime($rawDate))->format('Y-m-d');
            } catch (Exception $e) {
                continue;
            }
            if ($field === 'd_create') {
                $condi .= " AND d_create >= ?";
                $searchParams[] = $dateValue . ' 00:00:00.000';
            } else {
                $condi .= " AND d_create <= ?";
                $searchParams[] = $dateValue . ' 23:59:59.997';
            }
        }

//	   echo $condi;
    } else {
        $condi = "";
    }

    $arrParam = array();
    $arrCountParam = array();

    $sqlTempTable = "select dc_doc_id	,ref_id	"
            . " ,c_yyyy	,i_value	"
            . " , FORMAT(CAST(d_create AS DATETIME), 'yyyyMMddHH')+i_value AS id"
            . " ,dc_user_create_id	,dc_user_create_cost_id	,d_create	"
            . " ,c_gen	,c_date	,d_gen_date "
            . " , row_number() over (order by d_create desc) as row"
            . " FROM dbo.sp_doc_gen"
            . " where 1=1 {$condi} and not exists (select 1 from dbo.sp_tor_contract where sp_tor_contract.c_code = c_gen)"
            . " and i_enabled=1 and c_gen <>'' "
            . ""; //
//		  echo $sqlTempTable;
//		  exit();
    $arrParam = array_merge($searchParams ?? array(), array($start, $limit));
    $sqlMain = "select a.c_gen as c_code "
            . " , CONVERT(VARCHAR(10), a.d_create, 120) AS d_create_dt"
            . " ,a.*"
            . ",(select c_full_name from dc_user where dc_user_id=a.dc_user_create_id) as sp_emp_idTxt"
            . " from ({$sqlTempTable}) a "
            . " WHERE a.row > ? and a.row <= ?";
//		 echo $db->debugSql($sqlMain, $arrParam);
//    exit;
//             echo $sqlMain; exit;


    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;

    while ($row = $db->Fetch($stmt)) {
        $temp = array(
            "no" => $i++,
            "id" => intval($row["id"]),
            "i_value" => intval($row["i_value"]),
            "dc_doc_id" => intval($row["dc_doc_id"]),
            "c_name" => $row["sp_emp_idTxt"],
            "c_code" => $row["c_code"],
            "d_create" => $row["d_create_dt"] ? $date->extDateBuddha($row["d_create_dt"]) : null
        );
        ${$root}[] = $temp;
    }

    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $searchParams ?? array());
    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
