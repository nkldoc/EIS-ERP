<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");
include("../../lib/export/ArrayToXlsx.php");


$db = new DatabaseServer();
$date = new i_date();

$root = "data";
$data = array();
$con = null;

function List_QueryParam()
{
	global $db, $date, $root, $data, $con, $arr_status;
	$DB_NAME = '';
	$for_id = explode(";", $_REQUEST["dc_acc_id"]);
	if (!in_array("0", $for_id)) {
		$in = "";
		if (is_array($for_id)) {
			foreach ($for_id as $val) {
				$in .= ($in == "") ? $val : ", " . $val;
			}
			$con .= ($in != "") ? " AND b.dc_acc_id IN (" . $in . ")" : "";
		}
	}

	$sqlMain = "
		DECLARE @c_yyyy_mm_start VARCHAR(10) = ?;
		DECLARE @c_yyyy_mm_end VARCHAR(10) = ?;
		SET NOCOUNT ON
		SELECT 
			b.c_acc_code
			,b.c_acc_name
			,COUNT(*) AS count_bging
			,sum (CASE WHEN d_cutoff_date BETWEEN @c_yyyy_mm_start AND  @c_yyyy_mm_end THEN 1 ELSE 0 end) count_cut
		FROM am_asset_hdr a
		INNER JOIN am_mode_acc b ON a.am_mode_id = b.am_mode_id
		WHERE 
			d_receive_date <= @c_yyyy_mm_end
			AND (d_cutoff_date IS NULL OR d_cutoff_date > @c_yyyy_mm_start)
			{$con}
		GROUP BY 
			b.c_acc_code
			,b.c_acc_name
		ORDER BY b.c_acc_code
			
	
	";
	$arrParam[]	= $_REQUEST['i_year'] - 1 . "-10-01";
	$arrParam[]	= $_REQUEST['i_year'] . "-09-30";

	$stmt = $db->QueryParam($sqlMain, $arrParam);

	if ($stmt) {
		$on = 0;
		$count_bging = 0;
		$count_cut = 0;
		while ($row = $db->Fetch($stmt)) {

			$temp = array(
				"no"                =>	++$on,
				"i_type"            =>  1,
				"c_acc_code"		=>	$row["c_acc_code"],
				"c_acc_name"		=>	$row["c_acc_name"],
				"count_bging"		=>	$row["count_bging"],
				"count_cut"			=>	$row["count_cut"],
			);
			${$root}[]	= $temp;
			$count_bging += $row["count_bging"];
			$count_cut += $row["count_cut"];
		}
		$temp = array(
			"i_type"        =>  99,
			"count_bging"    =>	$count_bging,
			"count_cut"    =>	$count_cut,
		);
		${$root}[]	= $temp;
	}
	return json_encode(array("debug" => true,  $root => ${$root}));
	// echo json_encode(array("debug" => true,  $root => ${$root}));

	exit;
}
