<?php

include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db = new DatabaseServer();
$util = new apiUtil();

$root = "data";
$data = array();
$con = null;

$limit = $_REQUEST["limit"] ?? null;
$dir = $_REQUEST["dir"] ?? null;
$sort = $_REQUEST["sort"] ?? null;
$start = $_REQUEST["start"] ?? null;

function get($a)
{
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
$totalCount = null;
if ($_REQUEST['type'] == 'storeSpEmp') {

    $TEAM_TOR = " 2,3 "; // จัดหาหนึ่ง จัดหาสอง
    $department_id = $_SESSION['dc_department_id'] ?? null;
    $department_id = $_REQUEST['dc_department_id'] ?? $department_id;
    ###################
    $table = "dbo.sp_emp";

    $sqlTempTable = "select b.c_name as c_department
                    , a.c_name
                    , a.sp_emp_id
                    , a.dc_emp_id
                    , b.dc_department_id
                   , b.dc_department_type_id
                   , b.i_seq
                    , a.i_level
		 , ROW_NUMBER() OVER (ORDER BY a.dc_department_id asc) as row
                from dbo.sp_emp a
                  inner join sp_department b on b.dc_department_id = a.dc_department_id
                where b.dc_department_id in (8,?) and  i_enable = 1"; //  and a.i_level=3 and b.dc_department_id = " . $_SESSION['dc_department_id'];


    if (@$mode == "SEARCH") {
        if (isset($value) && $value != "") {
            $sqlTempTable .= " and " . $filter . " like ?";
        }
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = array($department_id, "%{$value}%", $start, $limit);
        $arrCountParam = array($department_id, "%{$value}%");
    } else {
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = array($department_id, $start, $limit);
        $arrCountParam = array($department_id);
    }

    //     echo $sqlMain;
    //     print_r($arrParam);
    //     exit();

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;

    while ($row = $db->Fetch($stmt)) {
        $temp = array(
            "no" => ($i++),
            "no" => intval($row["row"]),
            "id" => intval($row["sp_emp_id"]),
            "c_code" => $row["c_department"],
            "i_level" => intval(@$row["i_level"]),
            "i_parent" => intval(@$row["i_parent"]),
            "dc_dempartment_type_id" => intval(@$row["dc_dempartment_type_id"]),
            "dc_dempartment_id" => intval(@$row["dc_dempartment_id"]),
            "c_department" => $row["c_department"],
            "TextShow" => $row["c_name"] . " | " . $row["c_department"],
            "c_name" => $row["c_name"]
        );
        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug = 'storeDepartment >>>';
} else if ($_REQUEST['type'] == 'PRLISTSTEP02') {
    $TEAM_TOR = " 2,3 "; //dc_department_type_id 23
    $docType = $_REQUEST['docType'] ?? null;
    $ss = $_SESSION['user_id'] == 1 ? '' : ' and t.sp_emp_id=' . $_SESSION['sp_emp_id'];

    $type_menu = "";
    ###################
    $table = "dbo.sp_tor";
    //    $dc_department_type_id = $_REQUEST['dc_department_type_id'] ?? null;
    //SELECT sp_type_status_id as id ,c_name FROM dbo.sp_type_status WHERE i_enabled = ?
    $sqlTempTable = "select t.f_total_amt, t.tor_type_id,(select top 1 c_name from dbo. sp_type_status where sp_type_status_id= t.tor_type_id and i_enabled = 1) as tor_typeTxt 
        ,t.d_doc_ref, t.tor_id, t.c_code , t.c_name , ROW_NUMBER() OVER (ORDER BY t.tor_id asc) as row
                    from dbo.sp_tor t 
                    where 1=1 {$type_menu} and isnull(t.tor_type_id,0) <> 0 and t.i_enabled=? $ss";



    if (@$mode == "SEARCH") {
        if (isset($value) && $value != "") {
            $sqlTempTable .= " and " . $filter . " like ?";
        }
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = array(1, "%{$value}%", $start, $limit);
        $arrCountParam = array(1, "%{$value}%");
    } else {
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = array(1, $start, $limit);
        $arrCountParam = array(1);
    }


    //echo $db->debugSql($sqlTempTable, $arrParam); exit;




    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;

    while ($row = $db->Fetch($stmt)) {
        $temp = array(
            "no" => ($i++),
            "id" => intval($row["tor_id"]),
            "c_code" => $row["c_code"],
            "d_doc_ref" => $row["d_doc_ref"],
            "tor_typeTxt" => $row["tor_typeTxt"],
            "f_total_amt" => number_format($row["f_total_amt"], 2),
            "c_name" => $row["c_name"]
        );
        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
} else if ($_REQUEST['type'] == 'storeDepartment') {
    $TEAM_TOR = " 2,3 "; //dc_department_type_id 23
    ###################
    $table = "dbo.sp_emp";
    $dc_department_type_id = $_REQUEST['dc_department_type_id'] ?? null;
    $sqlTempTable = "select b.c_name as c_department
                    , a.c_name
                    , a.sp_emp_id
                    , a.dc_emp_id
                    , a.dc_department_id
                    , b.dc_department_type_id
                    , b.i_seq
                        , a.i_level
            , ROW_NUMBER() OVER (ORDER BY a.dc_department_id asc) as row
                    from dbo.sp_emp a
                    inner join sp_department b on b.dc_department_id = a.dc_department_id
                    where a.i_level in (1,2)  
                    and b.i_show = 1 
                and a.i_enable=?  ";


    if (@$mode == "SEARCH") {
        if (isset($value) && $value != "") {
            $sqlTempTable .= " and " . $filter . " like ?";
        }
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = array(1, "%{$value}%", $start, $limit);
        $arrCountParam = array(1, "%{$value}%");
    } else {
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = array(1, $start, $limit);
        $arrCountParam = array(1);
    }

    //     echo $sqlMain;
    //     print_r($arrParam);
    //     exit();

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;

    while ($row = $db->Fetch($stmt)) {
        $temp = array(
            "no" => ($i++),
            "id" => intval($row["dc_department_id"]),
            "c_department" => $row["c_department"],
            "c_name" => $row["c_name"]
        );
        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug = 'storeDepartment >>>';
} else if ($_REQUEST['type'] == 'storeOverlap') {
    ############################################################################################################
    $mode   = $_REQUEST["mode"] ?? null;
    $filter = $_REQUEST["filter"] ?? null;
    $value  = $_REQUEST["value"] ?? null;
    ###################
    $root   = "data";
    $data   = array();
    ###################
    $limit  = $_REQUEST["limit"] ?? null;
    $dir    = $_REQUEST["dir"] ?? null;
    $sort   = $_REQUEST["sort"] ?? null;
    $start  = $_REQUEST["start"] ?? null;
    // function get($a)
    // {
    //     return $a ?? 0;
    // }

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
        $sort = " bg_budget_dtl_overlap_id";
    }
    //    print_r($_SESSION);
    if ($_SESSION['user_id'] === 1) {
        $dc_cost_id = '38';
    } else {
        $dc_cost_id = $_SESSION['dc_cost_id'] ?? null;
    }

    // $sqlTempTable = "select "
    //         . "bg_budget_dtl_overlap_id"
    //         . ", i_year"
    //         . ", c_code_ref"
    //         . ", dc_expense_budget_type_id "
    //         . ", dc_cost_id"
    //         . ",(select c_name from dc_cost where dc_cost_id = NMU.dbo.vw_bg_budget_overlap.dc_cost_id) as dc_costTxt"
    //         . ", bg_expense_id"
    //         . ", d_end_date "
    //         . ", ROW_NUMBER() OVER (ORDER BY bg_budget_dtl_overlap_id desc) as row"
    //         . " from NMU.dbo.vw_bg_budget_overlap "
    //         . " where dc_cost_id=?  and d_end_date  >= '" . date('Y-m-d') ."'"  ;

    $sqlTempTable = "select 
        ROW_NUMBER() OVER (ORDER BY i_year DESC, bg_budget_dtl_overlap_id DESC) AS row 
        ,* from (
        SELECT 
         a.bg_budget_dtl_overlap_id
         ,a.c_code_ref
         ,a.bg_expense_id
         ,a.dc_expense_budget_type_id
         ,a.dc_cost_id
         ,(SELECT TOP 1 c_name FROM " . DB_CENTER . "dc_cost aa WHERE aa.dc_cost_id = a.dc_cost_id) AS dc_costTxt
         ,b.c_code
         ,b.c_name
         ,a.f_total AS f_overlap
         ,i_year
         ,(SELECT TOP 1  ISNULL(SUM(ISNULL(f_amt,0.00)),0.00)FROM " . DB_NMU_EIS . "vw_bg_reserve_overlap aa WHERE aa.i_reserve = 2 AND a.c_code_ref = aa.c_code_overlap) AS f_overlap_reserve
         ,(SELECT TOP 1  ISNULL(SUM(ISNULL(f_amt,0.00)),0.00)FROM " . DB_NMU_EIS . "vw_bg_reserve_overlap aa WHERE aa.i_reserve = 3 AND ISNULL(aa.i_finish,0) = 0 AND a.c_code_ref = aa.c_code_overlap) AS f_overlap_reserve_income
         ,(SELECT TOP 1  ISNULL(SUM(ISNULL(f_amt,0.00)),0.00)FROM " . DB_NMU_EIS . "vw_bg_reserve_overlap aa WHERE aa.i_reserve = 3 AND ISNULL(aa.i_finish,0) = 1 AND a.c_code_ref = aa.c_code_overlap) AS f_overlap_reserve_finish
         ,ISNULL((SELECT TOP 1 aa.f_total FROM #tmp_working aa WHERE aa.c_booking = a.c_code_ref),0) AS f_working
         ,a.d_end_date
        FROM " . DB_NMU_EIS . "vw_bg_budget_overlap a
        LEFT JOIN " . DB_NMU_EIS . "bg_expense b ON a.bg_expense_id = b.bg_expense_id
        where dc_cost_id=? and d_end_date  >= '" . date('Y-m-d') . "' ) a
            
        where  f_overlap - f_overlap_reserve_income - f_overlap_reserve - f_working > 0 ";
    if ($mode == "SEARCH") {
        if (isset($value) && $value != "") {
            $sqlTempTable .= " and c_code_ref like ?";
        }
        $sqlMain = "SET NOCOUNT ON 
        SELECT 
            b.c_booking 
            ,SUM((ISNULL(b.f_total,0) - ISNULL(ret.f_return, 0))) AS f_total
        INTO #tmp_working
        FROM " . DB_NMU_EIS . "po_working_hdr a
        INNER JOIN " . DB_NMU_EIS . "po_working_dtl b ON a.po_working_hdr_id = b.po_working_hdr_id 
        LEFT JOIN (SELECT po_working_hdr_id ,SUM(f_return) AS f_return FROM " . DB_NMU_EIS . "po_return WHERE i_enable = 1 
        GROUP BY po_working_hdr_id) ret ON a.po_working_hdr_id = ret.po_working_hdr_id
        WHERE a.i_enable = 1 AND b.c_booking IS NOT NULL
        GROUP BY b.c_booking;
        select  bg_budget_dtl_overlap_id
        ,i_year
        ,c_code_ref
        ,dc_expense_budget_type_id
        ,dc_cost_id
        ,f_overlap - f_overlap_reserve - f_overlap_reserve_income - f_working AS f_total
        ,dc_costTxt
        ,bg_expense_id
        ,d_end_date from ({$sqlTempTable}
        ) a WHERE a.row > ? and a.row <= ?
        drop table #tmp_working
        ";
        $arrParam = array($dc_cost_id, "%{$value}%", $start, $limit);
        $arrCountParam = array($dc_cost_id, "%{$value}%");
    } else {
        $sqlMain = "SET NOCOUNT ON 
        SELECT 
            b.c_booking 
            ,SUM((ISNULL(b.f_total,0) - ISNULL(ret.f_return, 0))) AS f_total
        INTO #tmp_working
        FROM " . DB_NMU_EIS . "po_working_hdr a
        INNER JOIN " . DB_NMU_EIS . "po_working_dtl b ON a.po_working_hdr_id = b.po_working_hdr_id 
        LEFT JOIN (SELECT po_working_hdr_id ,SUM(f_return) AS f_return FROM " . DB_NMU_EIS . "po_return WHERE i_enable = 1 
        GROUP BY po_working_hdr_id) ret ON a.po_working_hdr_id = ret.po_working_hdr_id
        WHERE a.i_enable = 1 AND b.c_booking IS NOT NULL
        GROUP BY b.c_booking;
        select  bg_budget_dtl_overlap_id
        ,i_year
        ,c_code_ref
        ,dc_expense_budget_type_id
        ,dc_cost_id
        ,f_overlap - f_overlap_reserve - f_overlap_reserve_income - f_working AS f_total
        ,dc_costTxt
        ,bg_expense_id
        ,d_end_date from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?
        drop table #tmp_working
        ";
        $arrParam = array($dc_cost_id, $start, $limit);
        $arrCountParam = array($dc_cost_id);
    }
    // /******echo sql******/
    // $sql = (@$sqlMain) ? $sqlMain : $sql;
    // $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());

    // $sql = str_replace('?', '#-#', $sql);
    // foreach ($arr as $fld => $value) {
    //  $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
    // }
    // echo $sql; exit;
    // /********************/
  //  $db->debugSql($sqlMain,$sqlMain);  
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    
    $i = $start + 1;

    while ($row = $db->Fetch($stmt)) {
        $temp = array(
            "no" => ($i++),
            "id" => intval($row["bg_budget_dtl_overlap_id"]),
            "i_year" => $row["i_year"] + 543,
            "dc_costTxt" => $row["dc_costTxt"],
            "c_name" => $row["c_code_ref"],
            "c_code_ref" => $row["c_code_ref"],
            "dc_expense_budget_type_id" => $row["dc_expense_budget_type_id"],
            "dc_cost_id" => $row["dc_cost_id"],
            "bg_expense_id" => $row["bg_expense_id"],
            "d_end_date" => $row["d_end_date"],
            "f_total" => number_format($row["f_total"], 2)
        );
        ${$root}[] = $temp;
    }
    $sqlCount = "SET NOCOUNT ON 
        SELECT 
            b.c_booking 
            ,SUM((ISNULL(b.f_total,0) - ISNULL(ret.f_return, 0))) AS f_total
        INTO #tmp_working
        FROM " . DB_NMU_EIS . "po_working_hdr a
        INNER JOIN " . DB_NMU_EIS . "po_working_dtl b ON a.po_working_hdr_id = b.po_working_hdr_id 
        LEFT JOIN (SELECT po_working_hdr_id ,SUM(f_return) AS f_return FROM " . DB_NMU_EIS . "po_return WHERE i_enable = 1 
        GROUP BY po_working_hdr_id) ret ON a.po_working_hdr_id = ret.po_working_hdr_id
        WHERE a.i_enable = 1 AND b.c_booking IS NOT NULL
        GROUP BY b.c_booking;
    select count(*) as totalCount from ({$sqlTempTable}) a";
 $db->debugSql($sqlMain,$arrCountParam);  
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug = 'storeOverlap >>>';

    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
    exit();
} else if ($_REQUEST["type"] == "storeSpNoTor") {

    $sqlMain = "SELECT tor_id
                , c_name
                , c_code
                ,dc_expense_budget_type_id
                --, (select top 1 c_name from dbo.dc_expense_budget_type where dc_expense_budget_type_id = sp_tor.dc_expense_budget_type) as dc_expense_budget_type_idTxt
                FROM dbo.sp_tor
		WHERE i_type_bg = 3 AND i_enabled = 1  and sp_emp_id = {$_SESSION['sp_emp_id']}
		ORDER BY c_code desc";
    //                echo $sqlMain; exit();
    $arrParam = array(STATUS_ENABLE, 1);
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {


        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => "{$row["tor_id"]}",
                "c_code" => $row["c_code"],
                "c_name" => $row["c_name"],
                "dc_expense_budget_type_id" => $row["dc_expense_budget_type_id"],
                // "dc_expense_budget_type_idTxt" => $row["dc_expense_budget_type_idTxt"],

            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "storeSpMainPR") {

    $sqlMain = "SELECT tor_id
                , c_name
                , c_code
                , dc_expense_budget_type_id
                , po_expense_id
                , dc_cost_id
                ,dc_cost2_id
                , i_purchase
                , tor_type_id
                , i_hire_type
                , i_product_type 
                , d_doc_ref
                --, (select top 1 c_name from dbo.dc_expense_budget_type where dc_expense_budget_type_id = sp_tor.dc_expense_budget_type) as dc_expense_budget_type_idTxt
                FROM dbo.sp_tor
		WHERE i_type_bg = 2 AND i_enabled = 1
		ORDER BY c_code";
    //                echo $sqlMain; exit();
    $arrParam = array(STATUS_ENABLE, 1);
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {


        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => "{$row["tor_id"]}",
                "c_code" => $row["c_code"],
                "c_name" => $row["c_name"],
                "dc_expense_budget_type_id" => $row["dc_expense_budget_type_id"],
                "po_expense_id" => $row["po_expense_id"],
                "dc_cost_id" => $row["dc_cost_id"],
                "dc_cost2_id" => $row["dc_cost2_id"],
                "i_purchase" => $row["i_purchase"],
                "tor_type_id" => $row["tor_type_id"],
                "i_hire_type" => $row["i_hire_type"],
                "i_product_type" => $row["i_product_type"],
                "d_doc_ref" => $row["d_doc_ref"],
                // "dc_expense_budget_type_idTxt" => $row["dc_expense_budget_type_idTxt"],

            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "dc_cost") {

    $sqlMain = "
		SELECT * FROM dbo.dc_cost
		WHERE i_last = 1 AND i_enable = 1 AND i_delete = 2
			AND c_code_tree LIKE '0104%'
		ORDER BY c_code";
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

        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => "{$row["dc_cost_id"]}",
                "c_name" => $row["c_code"] . " : " . $row["c_name"]
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST['type'] == 'storeDepartment') {
    $TEAM_TOR = " 2,3 "; //dc_department_type_id 23
    ###################
    $table = "dbo.sp_emp";
    $dc_department_type_id = $_REQUEST['dc_department_type_id'] ?? null;
    $sqlTempTable = "select b.c_name as c_department
                    , a.c_name
                    , a.sp_emp_id
                    , a.dc_emp_id
                    , a.dc_department_id
                   , b.dc_department_type_id
                   , b.i_seq
                    , a.i_level
		 , ROW_NUMBER() OVER (ORDER BY a.dc_department_id asc) as row
                from dbo.sp_emp a
                  inner join sp_department b on b.dc_department_id = a.dc_department_id
                where a.i_level=2 and a.i_enable=?";


    if (@$mode == "SEARCH") {
        if (isset($value) && $value != "") {
            $sqlTempTable .= " and " . $filter . " like ?";
        }
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = array(1, "%{$value}%", $start, $limit);
        $arrCountParam = array(1, "%{$value}%");
    } else {
        $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $arrParam = array(1, $start, $limit);
        $arrCountParam = array(1);
    }

    //     echo $sqlMain;
    //     print_r($arrParam);
    //     exit();

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;

    while ($row = $db->Fetch($stmt)) {
        $temp = array(
            "no" => ($i++),
            "id" => intval($row["dc_department_id"]),
            "c_department" => $row["c_department"],
            "c_name" => $row["c_name"]
        );
        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $debug = 'storeDepartment >>>';
} else if ($_REQUEST["type"] == "sp_emp") {

    $sqlMain = "
		SELECT b.c_code,a.* FROM dbo.sp_emp a
                inner join dc_emp b on b.dc_emp_id=a.dc_emp_id
		WHERE a.i_enable = 1 AND a.i_delete = 2 AND a.i_level <> 1
		ORDER BY a.sp_emp_id";
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
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => "{$row["sp_emp_id"]}",
                "dc_emp_id" => "{$row["dc_emp_id"]}",
                "c_name" => $row["c_code"] . " : " . $row["c_name"]
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "bg_project") {
    $sqlMain = "select bg_budget_item_project_id  as id
	,c_name
	,f_project
	FROM dbo.bg_budget_item_project WHERE 1=?";
    $arrParam = array(STATUS_ENABLE);
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {
        $all = true;
        // if ($all == "all") {
        // 	${$root}[] = array(
        // 		"id"		=> 0,
        // 		"c_name"	=> "- เลือกโครงการ-"
        // 	);
        // }

        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => $row["id"],
                "c_name" => $row["c_name"] . " วงเงิน(" . number_format($row["f_project"], 2) . ") บาท ",
                "f_project" => $row["f_project"]
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "po_user") {
    $sqlMain = "select a.dc_user_id,a.c_full_name from dbo.dc_user a
	inner join dbo.dc_user_menu b on b.dc_user_id=a.dc_user_id
	where b.dc_menu_id =(SELECT dc_menu_id FROM dc_menu where c_filelocation='po-RegPo')
	AND a.i_enable = ?
	group by a.dc_user_id,a.c_full_name
	ORDER BY a.c_full_name";
    $arrParam = array(STATUS_ENABLE);
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {
        $all = true;
        if ($all == "all") {
            ${$root}[] = array(
                "id" => 0,
                "c_name" => "- เลือกผู้ทำรายการ-"
            );
        }

        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => "{$row["dc_user_id"]}",
                "c_name" => "{$row["c_full_name"]}"
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "po_creditor_transfer") {
    $sqlMain = "SELECT * FROM dbo.po_creditor WHERE i_enable = ? ORDER BY c_name";
    $arrParam = array(STATUS_ENABLE);
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {
        $all = false;
        if ($all == "all") {
            ${$root}[] = array(
                "id" => 0,
                "c_name" => "- กรุณาเลือก -"
            );
        }

        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => "{$row["po_creditor_id"]}",
                "c_name" => "{$row["c_name"]}"
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "po_creditor") {
    $sqlMain = "SELECT * FROM dbo.po_creditor WHERE i_enable = ? ORDER BY c_name";
    $arrParam = array(STATUS_ENABLE);
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {
        $all = false;
        if ($all == "all") {
            ${$root}[] = array(
                "id" => 0,
                "c_name" => "- กรุณาเลือก -"
            );
        }

        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => "{$row["po_creditor_id"]}",
                "c_name" => "{$row["c_name"]}"
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "dc_expense_budget_type") {

    $sqlMain = "SELECT * FROM dbo.dc_expense_budget_type WHERE i_enable = ? AND i_delete = 2 ORDER BY c_name";
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
                "id" => "{$row["dc_expense_budget_type_id"]}",
                "c_name" => "{$row["c_name"]}"
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "po_expense") {

    $sqlMain = "SELECT * FROM dbo.po_expense WHERE i_last = 1 and i_enable = ? ORDER BY c_code_tree";
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
                "id" => "{$row["po_expense_id"]}",
                "c_name" => $row["c_code"] . " : " . $row["c_name"],
                "c_name_excel" => $row["c_name"]
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "po_emp") {

    $sqlMain = "SELECT * FROM dbo.po_emp WHERE i_enable = ? AND i_delete = 2 ORDER BY c_name";
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
                "id" => "{$row["po_emp_id"]}",
                "c_name" => $row["c_name"],
            );
            ${$root}[] = $temp;
        }
    }

    //sp_emp_level2
} else if ($_REQUEST["type"] == "sp_emp_level2") {

    $sqlMain = "select a.c_name as 'c_emp'
                    , c.c_name as 'c_department_type'
                    , 'สายงาน '+b.c_name+' '+ CAST(b.i_seq AS varchar) as 'c_department'
                    , CASE
                        WHEN a.i_level = 1 THEN 'หัวหน้าหน่วยงาน'
                        WHEN a.i_level = 2 THEN 'หัวหน้าสายงาน'
                        ELSE 'ผู้ปฎิบัติงาน' END AS 'c_position'
                    , a.sp_emp_id
                    , a.dc_emp_id
                    , a.dc_department_id
                    , b.dc_department_type_id
                    , b.i_seq
                    , a.i_level
                    from dbo.sp_emp a
                    left join sp_department b on b.dc_department_id = a.dc_department_id
                    left join sp_department_type c on c.dc_department_type_id = b.dc_department_type_id
                    where a.i_level=2 and c.i_last=1
order by b.dc_department_type_id";
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
                "id" => "{$row["dc_emp_id"]}",
                "c_name" => $row["c_emp"] . " | " . $row["c_department"],
            );
            ${$root}[] = $temp;
        }
    }
    //sp_emp_level23
} else if ($_REQUEST["type"] == "sp_emp_level23") {
    $w = null;
    $w1 = null;
    $is_choosed_self = 1;

    if ($_SESSION['i_type_user'] == 2) {
        $w = "where a.i_enable= ? and a.i_level != 1";
    } else {
        if ($is_choosed_self) {
            $w = "where a.dc_department_id=" . $_SESSION['dc_department_id'] . " and a.i_level != 1";
        } else {
            $w = "where a.dc_department_id=" . $_SESSION['dc_department_id'] . " and a.i_level = 3";
        }
    }

    $sqlMain = "select aa.* from (select a.sp_emp_id
         , a.c_name
         , a.dc_department_id
         , a.c_department
         , a.i_parent
         , a.i_level
         , a.i_last
         from sp_emp a " . $w . ") aa ";

    $arrParam = array();

    $arrParam[] = STATUS_ENABLE;
    $arrParam[] = STATUS_ENABLE;


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
                "id" => "{$row["sp_emp_id"]}",
                "c_name" => $row["c_name"] . " | " . $row["c_department"],
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "po_user_permission") {

    $sqlMain = "
		SELECT * FROM dbo.dc_user a
			INNER JOIN dbo.po_user_permission b ON a.dc_user_id = b.dc_user_id AND b.i_approve = 1
		WHERE a.i_enable = ? AND a.i_delete = 2 ORDER BY a.c_full_name";
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
                "id" => "{$row["dc_user_id"]}",
                "c_name" => $row["c_full_name"],
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "List_spHoliday") {

    $sqlMain = " select c_name
                        , sp_holiday_dtl_id
                        , CONVERT(VARCHAR,d_holiday, 120) as d_holiday  
                        , CONVERT(date,d_holiday) as d_holiday2  
                from sp_holiday_dtl a";
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
                "id"                => "{$row["sp_holiday_dtl_id"]}",
                "c_name"            => $row["c_name"],
                "d_holiday"         => $row["d_holiday"],
                "d_holiday2"        => $row["d_holiday2"],
            );
            ${$root}[] = $temp;
        }
    }
}
//echo json_encode(array("debug" => true, $root => ${$root}));
echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
exit;
