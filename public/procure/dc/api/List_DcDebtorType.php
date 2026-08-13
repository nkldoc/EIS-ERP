<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

$db         = new DatabaseServer();
$date       = new i_date();
$util       = new apiUtil();

$root        = "data";
$data        = array();
$con        = null;

if ($_REQUEST["type"] == "dc_debtor_type") {

    $mode                = @$_REQUEST["mode"];
    // 	$i_read				= @$_REQUEST["i_read"];

    $limit     = @$_REQUEST["limit"];
    $start     = @$_REQUEST["start"];

    if (!$util->get($start)) {
        $start     = 0;
    }
    if (!$util->get($limit)) {
        $limit     = 20;
    } else {
        $limit = ($limit + $start);
    }

    // 	switch($i_read) {
    // 		case 1:		$con = " AND a.dc_user_create_id=".$_SESSION["user_id"]; break;
    // 		case 2:		$con = " AND a.dc_user_create_cost_id=".$_SESSION["dc_cost_id"]; break;
    // 		default:	$con = "";
    // 	}

    if ($mode == "SEARCH") {
        if ($_REQUEST["filter"] != "") {
            $con    .= " AND a." . $_REQUEST["filter"] . " LIKE '%" . @$_REQUEST["value"] . "%' ";
        }
    }

    $sqlMain = "
    	SET NOCOUNT ON
        SELECT
            ROW_NUMBER() OVER (ORDER BY a.i_enable, a.c_code DESC) AS numrow
            ,a.dc_debtor_type_id
        INTO #TemData
        FROM dbo.dc_debtor_type a
        WHERE a.i_delete = 2
            {$con};

        SELECT
            a.numrow
            ,b.dc_debtor_type_id
            ,b.c_code
            ,b.c_name
            ,ISNULL(b.c_comment,'') AS c_comment
            ,b.i_enable
            ,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = b.dc_user_update_id) AS dc_user_update
            ,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = b.dc_user_update_cost_id) AS dc_user_update_cost
            ,CONVERT(VARCHAR, b.d_update, 120) AS d_update
        FROM #TemData a
            INNER JOIN dbo.dc_debtor_type b ON a.dc_debtor_type_id = b.dc_debtor_type_id
        WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow;

        SELECT COUNT(*) AS rowCounts FROM #TemData;";

    $arrParam[]    = $start;
    $arrParam[]    = $limit;

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if (sqlsrv_has_rows($stmt)) {
        while ($row = $db->Fetch($stmt)) {

            $temp = array(
                "no"                                => $row["numrow"],
                "id"                                => $row["dc_debtor_type_id"],
                "c_code"                            => $row["c_code"],
                "c_name"                            => $row["c_name"],
                "c_comment"                         => $row["c_comment"],
                "i_enable"                          => $row["i_enable"],
                "c_update_name"                     => $row["dc_user_update"],
                "c_cost_update_name"                => $row["dc_user_update_cost"],
                "d_update"                          => ($row["d_update"] != "") ? $date->extDateBuddha($row["d_update"]) : ""
            );

            ${$root}[] = $temp;
        }
    }

    $db->NextResult($stmt);
    $rowCounts = $db->Fetch($stmt);

    echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
    exit;
}
