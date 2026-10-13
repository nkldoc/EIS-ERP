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

if ($_REQUEST["type"] == "sp_holiday_hdr") {

    $mode = @$_REQUEST["mode"];
    $i_read = @$_REQUEST["i_read"];

    $limit = @$_REQUEST["limit"];
    $start = @$_REQUEST["start"];

    if (!$util->get($start)) {
        $start = 0;
    }
    if (!$util->get($limit)) {
        $limit = 20;
    } else {
        $limit = ($limit + $start);
    }

    // 	switch($i_read) {
    // 		case 1:		$con = " AND a.dc_user_create_id=".$_SESSION["user_id"]; break;
    // 		case 2:		$con = " AND a.dc_user_create_cost_id=".$_SESSION["dc_cost_id"]; break;
    // 		default:	$con = "";
    // 	} 

    if ($mode == "SEARCH") {

        // 		if ($_REQUEST["value"] != "") {
        // 			$con	.= " AND a." . $_REQUEST["filter"] . " LIKE '%" . $_REQUEST["value"] . "%' ";
        // 		}
        // 		if ($_REQUEST["d_doc_date1"] != "" && $_REQUEST["d_doc_date2"] != "") {
        // 			$con	.= " AND a.d_doc_date BETWEEN CONVERT(DATETIME,'{$_REQUEST["d_doc_date1"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["d_doc_date2"]}'+' 23:59:59',102)";
        // 		}
        // 		if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
        // 			$con .= " AND a.dc_expense_budget_type_id=" . $_REQUEST["dc_expense_budget_type_id"];
        // 		}
        // 		if ($_REQUEST["i_post"] > 0) {
        // 			$con .= " AND a.i_post=" . $_REQUEST["i_post"];
        // 		}
        // 		if ($_REQUEST["i_enable"] > 0) {
        // 			$con .= " AND a.i_enable=" . $_REQUEST["i_enable"];
        // 		}
    }

    $sqlMain = "SET NOCOUNT ON
                SELECT ROW_NUMBER() OVER (ORDER BY i_yyyy DESC) AS numrow 
                , sp_bg_billing_id
                INTO #TemData
                FROM dbo.sp_bg_billing
                WHERE 1 = 1 {$con};  
                SELECT a.numrow
                    , b.sp_bg_billing_id
                    , b.i_yyyy 
                    , b.c_code 
                    , b.c_name 
                    , b.i_enabled
                    , (SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = b.dc_user_update_id) AS dc_user_update
                    , (SELECT c_name FROM dc_cost aa WHERE dc_cost_id = b.dc_user_update_cost_id) AS dc_user_update_cost
                    , CONVERT(VARCHAR, b.d_update, 120) AS d_update
                FROM #TemData a
                INNER JOIN dbo.sp_bg_billing b ON a.sp_bg_billing_id = b.sp_bg_billing_id
                WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow; 
                SELECT COUNT(*) AS rowCounts FROM #TemData;";

    $arrParam[] = $start;
    $arrParam[] = $limit;

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if (sqlsrv_has_rows($stmt)) {
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "no" => $row["numrow"],
                "id" => $row["sp_bg_billing_id"],
                "i_yyyy" => $row["i_yyyy"],
                "c_name" => $row["c_name"],
                "c_code" => $row["c_code"],
                "i_enabled" => $row["i_enabled"],
                "dc_user_update_id" => $row["dc_user_update"],
                "dc_user_update_cost_id" => $row["dc_user_update_cost"],
                "d_update" => ($row["d_update"] != "") ? $date->extDateBuddha($row["d_update"]) : "",
            );

            ${$root}[] = $temp;
        }
    }

    $db->NextResult($stmt);
    $rowCounts = $db->Fetch($stmt);

    echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
    exit;
} else if ($_REQUEST["type"] == "sp_holiday_dtl") {

    $sqlMain = "
		SET NOCOUNT ON
		SELECT ROW_NUMBER() OVER (ORDER BY d_post_date,i_time) AS numrow
                    , sp_bg_billing_dtl_id , sp_bg_billing_id
                    , (select c_name from dbo.sp_bg_billing where sp_bg_billing_id=a.sp_bg_billing_id) as c_name
                    , (select c_code from dbo.sp_bg_billing where sp_bg_billing_id=a.sp_bg_billing_id) as c_code
                    , i_yyyy ,CONVERT(VARCHAR, d_post_date, 120) AS d_post_date	
                    , FORMAT(DATEADD(year, 543, d_post_date), 'MM-yyyy') as i_mmyyyy
                    , i_time ,CONVERT(VARCHAR, d_start_date, 120) AS d_start_date	
                    , CONVERT(VARCHAR, d_billing_date, 120) AS d_billing_date	
                    , DATEPART(WEEKDAY, d_billing_date) as c_day_name
                    , CONVERT(VARCHAR, d_end_date, 120) AS d_end_date
                    , i_confirm ,i_enabled	
                    , dc_user_create_id ,dc_user_create_cost_id ,CONVERT(VARCHAR, d_create, 120) AS d_create	
                    , dc_user_update_id ,dc_user_update_cost_id ,CONVERT(VARCHAR, d_update, 120) AS d_update 
		INTO #TemData
		FROM dbo.sp_bg_billing_dtl a 
		WHERE a.sp_bg_billing_id = ?; 
		SELECT * FROM #TemData a ORDER BY a.numrow;
		SELECT COUNT(*) AS rowCounts FROM #TemData;";

    $arrParam[] = $_REQUEST["hdr_id"];

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if (sqlsrv_has_rows($stmt)) {
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "no" => $row["numrow"],
                "id" => $row["sp_bg_billing_dtl_id"],
                "sp_bg_billing_id" => $row["sp_bg_billing_id"],
                "c_name" => $row["c_name"],
                "c_code" => $row["c_code"],
                "c_day_name" => $row["c_day_name"],
                "i_yyyy" => $row["i_yyyy"],
                "d_start_date" => ($row["d_start_date"] != "") ? $date->extDateBuddha($row["d_start_date"]) : "",
                "d_end_date" => ($row["d_end_date"] != "") ? $date->extDateBuddha($row["d_end_date"]) : "",
                "d_post_date" => ($row["d_post_date"] != "") ? $date->extDateBuddha($row["d_post_date"]) : "",
                "d_billing_date" => ($row["d_billing_date"] != "") ? $date->extDateBuddha($row["d_billing_date"]) : "",
                "i_mmyyyy" => $row["i_mmyyyy"],
                "i_time" => $row["i_time"],
                "i_confirm" => $row["i_confirm"]
            );

            ${$root}[] = $temp;
        }
    }

    $db->NextResult($stmt);
    $rowCounts = $db->Fetch($stmt);

    echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
    exit;
}
