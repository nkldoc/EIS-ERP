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

if ($_REQUEST["type"] == "dc_creditor") {

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

        if ($_REQUEST["value"] != "") {

            if ($_REQUEST["filter"] == 'c_tax') {
                $con .= " AND a.c_tax_number_imp LIKE '%" . $_REQUEST["value"] . "%' ";
            } elseif ($_REQUEST["filter"] == 'c_name') {
                $con .= " AND a.c_name LIKE '%" . $_REQUEST["value"] . "%' ";
            }
        }
    }
    $i_enable = $_REQUEST["i_enable"] ?? 1;
    $sqlMain = "
		SET NOCOUNT ON
		SELECT ROW_NUMBER() OVER (ORDER BY a.c_name) AS numrow ,a.dc_creditor_id
		INTO #TemData
		FROM NMU.dbo.dc_creditor a
		WHERE a.i_enable = {$i_enable}  AND a.i_delete = 2
			{$con}; 
		SELECT
			a.numrow
			, b.dc_creditor_id 
			, b.c_name
			, ISNULL(b.c_comment,'') AS c_comment
			, b.i_enable
			,(SELECT bb.c_name FROM NMU.dbo.dc_user aa LEFT JOIN NMU.dbo.dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = b.dc_user_update_id) AS dc_user_update
			,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = b.dc_user_update_cost_id) AS dc_user_update_cost
			, CONVERT(VARCHAR, b.d_update, 120) AS d_update

			, b.c_map_vsn
			, b.c_map_ephis
			, b.inv_name
			, b.c_tax_number_imp
            , b.c_map_vsn
            , b.c_map_ephis
            , b.c_tax_number_imp
            , b.dc_tax_customer_id
            , b.tax_c_title
            , b.tax_c_name
            , b.tax_c_last_name
            , b.tax_c_branch
            , b.tax_c_room_no
            , b.tax_c_floor
            , b.tax_c_village
            , b.tax_c_house_no
            , b.tax_c_village_no
            , b.tax_c_lane
            , b.tax_c_road
            , b.tax_c_province
            , b.tax_c_district
            , b.tax_c_tambon
            , b.tax_c_post_code
            , b.dc_tambon_id
            , b.c_tele_imp
            , b.c_email
            , b.tax_c_bldg
            , (SELECT TOP 1 c_name FROM NMU.dbo.dc_tax_income WHERE dc_tax_income_id = (SELECT TOP 1  dc_tax_income_id FROM NMU.dbo.dc_tax_customer WHERE dc_tax_customer_id =b.dc_tax_customer_id)) as c_name_tax_income
			,ISNULL(b.i_key,9) as i_key
		FROM #TemData a
			INNER JOIN NMU.dbo.dc_creditor b ON a.dc_creditor_id = b.dc_creditor_id 
		WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow; 
		SELECT COUNT(*) AS rowCounts FROM #TemData;";

    $arrParam[] = $start;
    $arrParam[] = $limit;

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if (sqlsrv_has_rows($stmt)) {
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "no" => $row["numrow"],
                "id" => $row["dc_creditor_id"],
                "c_tax_number_imp" => $row["c_tax_number_imp"],
                "inv_name" => $row["inv_name"],
                "c_name" => $row["c_name"],
                "c_comment" => $row["c_comment"],
                "i_enable" => $row["i_enable"],
                "dc_user_update_id" => $row["dc_user_update"],
                "dc_user_update_cost_id" => $row["dc_user_update_cost"],
                "d_update" => ($row["d_update"] != "") ? $date->extDateBuddha($row["d_update"]) : "",
                "c_map_vsn" => $row["c_map_vsn"],
                "c_map_ephis" => $row["c_map_ephis"],
                "i_key" => $row["i_key"],
                "c_map_vsn" => $row["c_map_vsn"],
                "c_map_ephis" => $row["c_map_ephis"],
                "c_tax_number_imp" => $row["c_tax_number_imp"],
                "dc_tax_customer_id" => $row["dc_tax_customer_id"],
                "tax_c_name" => $row["tax_c_name"],
                "tax_c_title" => $row["tax_c_title"],
                "tax_c_last_name" => $row["tax_c_last_name"],
                "tax_c_branch" => $row["tax_c_branch"],
                "tax_c_room_no" => $row["tax_c_room_no"],
                "tax_c_floor" => $row["tax_c_floor"],
                "tax_c_village" => $row["tax_c_village"],
                "tax_c_house_no" => $row["tax_c_house_no"],
                "tax_c_village_no" => $row["tax_c_village_no"],
                "tax_c_lane" => $row["tax_c_lane"],
                "tax_c_road" => $row["tax_c_road"],
                "tax_c_province" => $row["tax_c_province"],
                "tax_c_district" => $row["tax_c_district"],
                "tax_c_tambon" => $row["tax_c_tambon"],
                "tax_c_post_code" => $row["tax_c_post_code"],
                "dc_tambon_id" => $row["dc_tambon_id"],
                "c_tele_imp" => $row["c_tele_imp"],
                "c_email" => $row["c_email"],
                "tax_c_bldg" => $row["tax_c_bldg"],
                "c_name_tax_income" => $row["c_name_tax_income"],
                // "i_key" => $row["i_key"],
                // "i_key" => $row["i_key"]
                
            );

            ${$root}[] = $temp;
        }
    }

    $db->NextResult($stmt);
    $rowCounts = $db->Fetch($stmt);

    echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
    exit;
}
