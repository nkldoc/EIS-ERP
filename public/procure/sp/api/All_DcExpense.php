<?php

include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
include("../../lib/mon/mon.class.php");
include("../conf/configDc.php");
include("../../gl/conf/configGl.php");

$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();
$mon = new mon(); // convert floatval
############################################################################################################
$mode = @$_REQUEST["mode"];
$filter = @$_REQUEST["filter"];
$value = @$_REQUEST["value"];
$i_read = @$_REQUEST["i_read"];

###################
$limit = @$_REQUEST["limit"];
$dir = @$_REQUEST["dir"];
$sort = @$_REQUEST["sort"];
$start = @$_REQUEST["start"];
###################
if (!$util->get($start)) {
    $start = 0;
}
if (!$util->get($limit)) {
    $limit = 15;
} else {
    $limit = ($limit + $start);
}
if (!$util->get($dir)) {
    $dir = "ASC";
}
if (!$util->get($sort)) {
    $sort = "c_code";
}
###################
$root = "data";
$debug = '';
$totalCount = 0;

function get($a) {
    return isset($a) && !empty($a) ? $a : null;
}

if ($_REQUEST['type'] == 'storeAccExpense') {
    $table = "".DB_CENTER."vw_dc_acc";
    $root = "data";
    $c_code = $_REQUEST['c_code'];
    $data = array();
    $sqlTempTable = "SELECT
                        ROW_NUMBER() OVER (ORDER BY a.c_code) AS row
                        ,a.dc_acc_id
                        ,a.c_code
                        ,a.c_name
                    FROM ".DB_CENTER."dc_acc  a
                    WHERE a.i_delete=2 AND a.i_enable=1 AND a.i_last = 1 AND i_level=6 AND i_group = {$c_code}";

    if ($mode == "SEARCH") {
        if (isset($value) && $value != "") {
            $sqlTempTable .= " and " . $filter . " like ?";
        }
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = array("%{$value}%", $start, $limit);
        $arrCountParam = array("%{$value}%");
    } else {
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = array($start, $limit);
        $arrCountParam = array();
    }

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    ${$root}[] = array(
        "id" => "0",
        "c_code" => "000000000",
        "c_name" => "- ว่างไว้ก่อน -"
    );
    while ($row = $db->Fetch($stmt)) {
        $temp = array(
            "no" => ($i++),
            "id" => $row["dc_acc_id"],
            "c_code" => $row["c_code"],
            "c_name" => $row["c_name"]
        );
        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug = 'storeAccExpense >>>';
    //storeCoppyPeriod
    echo json_encode(array("success" => true, "debug" => $debug, "totalCount" => $totalCount, $root => (isset(${$root}) && ${$root} != null) ? ${$root} : ''));
    exit;
} else if ($_REQUEST['type'] == 'storeAccSpAccInv') {


    $sqlMain = "SELECT [sp_acc_inv_id]
                    ,[dc_acc_id]
                    ,[dc_acc_inv_id]
                    ,(select c_code+' '+c_name from ".DB_CENTER."dc_acc where ".DB_CENTER."dc_acc.dc_acc_id=NMU_ERP.dbo.sp_acc_inv.dc_acc_id) as c_codeTxt
                    ,(select c_code+' '+c_name from ".DB_CENTER."dc_acc where ".DB_CENTER."dc_acc.dc_acc_id=NMU_ERP.dbo.sp_acc_inv.dc_acc_inv_id) as c_code1Txt
                    ,[c_comment]
                    ,[i_seq]
                    ,[i_enabled]
                    ,[dc_user_create_id]
                    ,[dc_user_create_cost_id]
                    ,[dc_user_create_department_id]
                    ,[d_create]
                    ,[dc_user_update_id]
                    ,[dc_user_update_cost_id]
                    ,[dc_user_update_department_id]
                    ,[d_update]
                FROM [NMU_ERP].[dbo].[sp_acc_inv] WHERE i_enabled=1 ";
    $arrParam = array(STATUS_ENABLE, 1);
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {

        if (@$_REQUEST["all"] == "all") {
            ${$root}[] = array(
                "id" => "0",
                "c_code" => "",
                "c_name" => "- เลือกทั้งหมด -"
            );
        }
        /* txtdc_acc_idID  txtdc_acc_id1ID */
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => "{$row["sp_acc_inv_id"]}",
                "dc_acc_inv_id" => "{$row["dc_acc_inv_id"]}",
                "dc_acc_id" => "{$row["dc_acc_id"]}",
                "txtdc_acc_idID" => $row["c_codeTxt"],
                "txtdc_acc_inv_idID" => $row["c_code1Txt"]
            );
            ${$root}[] = $temp;
        }
    }
    echo json_encode(array("debug" => true, $root => ${$root}));
    exit;
} else if ($_REQUEST['type'] == 'NMU_dc_acc') {


    $sqlMain = "SELECT
        ROW_NUMBER() OVER (ORDER BY a.c_code) AS row
        ,a.dc_acc_id
        ,a.c_code+' '+a.c_name as c_name
    FROM ".DB_CENTER."dc_acc  a
    WHERE a.i_delete=2 AND a.i_enable=1 AND a.i_last = 1 AND i_level=6";
    $arrParam = array();
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {

        if (@$_REQUEST["all"] == "all") {
            ${$root}[] = array(
                "id" => "0",
                "c_code" => "",
                "c_name" => "- เลือกทั้งหมด -"
            );
        }
        ${$root}[] = array(
            "id" => "0",
            "c_code" => "000000000",
            "c_name" => "- ว่างไว้ก่อน -"
        );
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => $row["dc_acc_id"],
                "c_name" => $row["c_name"],
            );
            ${$root}[] = $temp;
        }
    }
    echo json_encode(array("debug" => true, $root => ${$root}));
    exit;
} else if ($_REQUEST['type'] == 'dc_expense_id') {
    $sqlMain = "SELECT  ROW_NUMBER() over (order by c_code ) as row
	,bg_expense_id
	,c_code
	,c_name
	from nmu..bg_expense 
	where i_enable = 1 and i_level = 4 and i_delete = 2";
    $arrParam = array();
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {

        if (@$_REQUEST["all"] == "all") {
            ${$root}[] = array(
                "id" => "0",
                "c_code" => "",
                "c_name" => "- เลือกทั้งหมด -"
            );
        }
        ${$root}[] = array(
            "id" => "0",
            "c_code" => "000000000",
            "c_name" => "- ว่างไว้ก่อน -"
        );
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => $row["bg_expense_id"],
                "c_name" => $row["c_name"],
            );
            ${$root}[] = $temp;
        }
    }
    echo json_encode(array("debug" => true, $root => ${$root}));
    exit;
} 
//------------------------------------------------------------
else if ($_REQUEST['type'] == 'GlSpHdr') {
     $bg_expense =  $_REQUEST["bg_expense_id"] ??null;
     $po_expense_id = $_REQUEST["po_expense_id"] ??null;
     $where  = null ;
    if ($bg_expense ) {
        $where  = " and bg_expense_id =  " .$bg_expense ;
    }   
    if ($po_expense_id ) {
        $where  = " and bg_expense_id =  " .$po_expense_id ;
    }  
    $sqlMain = "SELECT
        ROW_NUMBER() OVER (ORDER BY a.c_name) AS row
        ,a.gl_sp_bg_hdr_id
        ,(select c_code+' : '+c_name from nmu..bg_expense aa where aa.bg_expense_id = a.bg_expense_id )+' (' +b.c_name  +') 'as c_name 
		,(select c_code from nmu..bg_expense aa where aa.bg_expense_id = a.bg_expense_id ) as c_code 
        ,a.bg_expense_id
        ,a.gl_sp_dc_hdr_id
    FROM NMU..gl_sp_bg_hdr  a
    inner join nmu..gl_sp_dc_hdr b on b.gl_sp_dc_hdr_id = a.gl_sp_dc_hdr_id 
    WHERE a.i_delete=2 AND a.i_enable=1 {$where} ";
    $arrParam = array();
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {
//gl_sp_dc_hdr_id  gl_sp_bg_hdr_id
        if (@$_REQUEST["all"] == "all") {
            ${$root}[] = array(
                "id" => "0",
                "c_name" => "- เลือกทั้งหมด -"
            );
        }
        ${$root}[] = array(
            "id" => "0",
            "c_name" => "- ว่างไว้ก่อน -"
        ); 
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => $row["gl_sp_bg_hdr_id"],
                "c_name" => $row["c_name"],
                "bg_expense_id" => $row["bg_expense_id"],
                "gl_sp_dc_hdr_id" => $row["gl_sp_dc_hdr_id"],
            );
            ${$root}[] = $temp;
        }
    }
    echo json_encode(array("debug" => true, $root => ${$root}));
    exit;
} else if ($_REQUEST['type'] == 'group') {
    // $bg_expense =  $_REQUEST["bg_expense_id"] ??null;
    $po_expense_id = $_REQUEST["po_expense_id"] ??null;
    $where  = null ;

    if ($po_expense_id ) {
        $where  = " and bg_expense_id =  " .$po_expense_id ;
    }  
    $sqlMain = "SELECT
                    count(a.bg_expense_id) as bg_expense_group
                    FROM NMU..gl_sp_bg_hdr  a
                    inner join nmu..gl_sp_dc_hdr b on b.gl_sp_dc_hdr_id = a.gl_sp_dc_hdr_id 
                    WHERE a.i_delete=2 AND a.i_enable=1  {$where}
                    group by a.bg_expense_id    ";
    $arrParam = array();
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {
//gl_sp_dc_hdr_id  gl_sp_bg_hdr_id
        if (@$_REQUEST["all"] == "all") {
            ${$root}[] = array(
                "id" => "0",
                "c_name" => "- เลือกทั้งหมด -"
            );
        }
        ${$root}[] = array(
            "id" => "0",
            "c_name" => "- ว่างไว้ก่อน -"
        ); 
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "bg_expense_group" => $row["bg_expense_group"],
            );
            ${$root}[] = $temp;
        }
    }
    echo json_encode(array("debug" => true, $root => ${$root}));
    exit;
} else if ($_REQUEST['type'] == 'NMU_gl_sp_hdr_tor') {
    $bg_expense =  $_REQUEST["bg_expense_id"] ??null;
    $sp_tor_id =  $_REQUEST["sp_tor_id"] ??null;
    $where  = null ;
   if ($bg_expense) {
       $where  = " and bg_expense_id =  " .$bg_expense ;

   } 
   $sqlMain = "	SELECT
   ROW_NUMBER() OVER (ORDER BY a.c_name) AS row
   ,a.gl_sp_bg_hdr_id
   ,(select c_code+' : '+c_name from nmu..bg_expense aa where aa.bg_expense_id = a.bg_expense_id )+' (' +b.c_name  +') 'as c_name 
   ,(select c_code from nmu..bg_expense aa where aa.bg_expense_id = a.bg_expense_id ) as c_code 
   ,a.bg_expense_id
   ,a.gl_sp_dc_hdr_id
FROM NMU..gl_sp_bg_hdr  a
inner join nmu..gl_sp_dc_hdr b on b.gl_sp_dc_hdr_id = a.gl_sp_dc_hdr_id 
inner join sp_gl_monthly_dtl c on a.gl_sp_dc_hdr_id = c.gl_sp_dc_hdr_id
inner join sp_gl_monthly_hdr d on c.sp_gl_monthly_hdr_id = d.sp_gl_monthly_hdr_id 
WHERE a.i_delete=2 AND a.i_enable=1  and d.sp_tor_id =  {$sp_tor_id} ";


    $arrParam = array();
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {
    //gl_sp_dc_hdr_id  gl_sp_bg_hdr_id
        if (@$_REQUEST["all"] == "all") {
            ${$root}[] = array(
                "id" => "0",
                "c_name" => "- เลือกทั้งหมด -"
            );
        }
        ${$root}[] = array(
            "id" => "0",
            "c_name" => "- ว่างไว้ก่อน -"
        ); 
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => $row["gl_sp_bg_hdr_id"],
                "c_name" => $row["c_name"],
                "bg_expense_id" => $row["bg_expense_id"],
                "gl_sp_dc_hdr_id" => $row["gl_sp_dc_hdr_id"],
            );
            ${$root}[] = $temp;
        }
    }
    echo json_encode(array("debug" => true, $root => ${$root}));
    exit;
} else if ($_REQUEST['type'] == 'bgExpense') {


    $sqlMain = "SELECT ROW_NUMBER() OVER (ORDER BY c_name) AS row , bg_expense_id , c_name
    FROM NMU.dbo.bg_expense
    WHERE i_level = 4 and i_enable=1 and i_delete = 2";
    $arrParam = array();
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {

        if (@$_REQUEST["all"] == "all") {
            ${$root}[] = array(
                "id" => "0",
                "c_name" => "- เลือกทั้งหมด -"
            );
        }
        ${$root}[] = array(
            "id" => "0",
            "c_name" => "- ว่างไว้ก่อน -"
        );
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => $row["bg_expense_id"],
                "c_name" => $row["c_name"],
            );
            ${$root}[] = $temp;
        }
    }
    echo json_encode(array("debug" => true, $root => ${$root}));
    exit;
}
