<?php
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

###################
$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

$root		= "data";
$data		= array();
$con		= null;
if ($_REQUEST["type"] == "dc_user_cost_sys_hdr") {

	$mode				= @$_REQUEST["mode"];
	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];

	if (!$util->get($start)) {
		$start 	= 0;
	}
	if (!$util->get($limit)) {
		$limit 	= 20;
	} else {
		$limit = ($limit + $start);
	}


	if ($mode == "SEARCH") {
		if ($_REQUEST["value"] != "") {
			$con	.= " AND a." . $_REQUEST["filter"] . " LIKE '%" . $_REQUEST["value"] . "%' ";
		}
	}


	$sqlMain = "
		SET NOCOUNT ON
		select 
			ROW_NUMBER() OVER (ORDER BY a.c_user_name) AS numrow
			,a.dc_user_id
		into #TemData
		from " . DB_CENTER . "dc_user a 
		inner join (
			select dc_user_id
			from " . DB_CENTER . "dc_user_cost_sys a 
			where a.c_code_sys = '" . $_REQUEST["c_code_sys"] . "' 
			group by dc_user_id
		) b on a.dc_user_id = b.dc_user_id 
		where 
			a.i_enable = 1 
			and a.i_delete = 2 
			{$con};
	
        SELECT
			temp.numrow
			,a.dc_user_id
			,a.c_user_name
			,a.c_full_name
			,b.i_type_view
			,case b.i_type_view
				when 1 then '(' + cast(b.count as varchar) + ') หน่วยงาน/ฝ่าย'
				when 2 then '(' + cast(b.count as varchar) + ') ส่วนงาน/คณะ'
			end as c_type_view_name
        FROM #TemData temp
		INNER JOIN " . DB_CENTER . "dc_user a ON a.dc_user_id = temp.dc_user_id
		inner join (
			select dc_user_id, i_type_view, count(*) as count
			from " . DB_CENTER . "dc_user_cost_sys a 
			where a.c_code_sys = '" . $_REQUEST["c_code_sys"] . "' 
			group by dc_user_id,i_type_view
		) b on a.dc_user_id = b.dc_user_id 
        WHERE temp.numrow > ? AND temp.numrow <= ? ORDER BY temp.numrow;

        SELECT COUNT(*) AS rowCounts FROM #TemData;
		DROP TABLE #TemData";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;

	$stmt = $db->QueryParam($sqlMain, $arrParam);

	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"                    => $row["numrow"],
				"id"                    =>	$row["dc_user_id"],
				"c_user_name"           =>	$row["c_user_name"],
				"c_full_name"           =>	$row["c_full_name"],
				"i_type_view"           =>	$row["i_type_view"],
				"c_type_view_name"      =>	$row["c_type_view_name"],
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
} else if ($_REQUEST["type"] == "dc_user_cost_sys_dtl") {

	$mode				= @$_REQUEST["mode"];

	if ($_REQUEST["i_type_view"] == 2) $con .= "  AND a.i_last != 1";

	$sqlMain = "
		SET NOCOUNT ON
		SELECT 
			ROW_NUMBER() OVER (ORDER BY a.c_code_mis) AS numrow
			,a.dc_cost_id
			,CASE WHEN a.i_last = 1 THEN 1 ELSE 0 END AS i_last
			,a.c_code
			,a.c_code_mis
			,a.c_name
			,CASE WHEN
				ISNULL(b.dc_cost_id,0) > 0 THEN 1
				ELSE 0
			END AS i_status_use
		FROM " . DB_CENTER . "dc_cost a
		LEFT JOIN " . DB_CENTER . "dc_user_cost_sys b ON b.dc_cost_id = a.dc_cost_id AND b.dc_user_id = ? AND b.i_type_view = ? AND  b.c_code_sys = ?
		WHERE 
			a.i_enable = 1
			AND a.i_delete = 2  
			AND (
				a.i_level = 2
				or a.i_last = 1
			)
			{$con};";

	$arrParam[]	= $_REQUEST["dc_user_id"];
	$arrParam[]	= $_REQUEST["i_type_view"];
	$arrParam[]	= $_REQUEST["c_code_sys"];

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	while ($row = $db->Fetch($stmt)) {
		$temp = array(
			"no"                                => $row["numrow"],
			"id"                                =>	$row["dc_cost_id"],
			"i_last"                            =>	$row["i_last"],
			"c_code"                            =>	$row["c_code"],
			"c_code_mis"                        =>	$row["c_code_mis"],
			"c_name"                            =>	$row["c_name"],
			"i_status_use"                      =>	$row["i_status_use"],
		);

		${$root}[] = $temp;
	}

	echo json_encode(array("debug" => true, $root => ${$root}));
	exit;
}
