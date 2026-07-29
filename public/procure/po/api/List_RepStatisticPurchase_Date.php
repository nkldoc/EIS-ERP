<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();

$root = "data";
$data = array();
$con = null;

function List_QueryParam()
{
	global $db, $date, $root, $data, $con, $arr_status;

	$totalCount = 0;

	$sqlMain = "
		SET NOCOUNT ON
		DECLARE @TABLE TABLE (row INT,d_date DATETIME,c_name VARCHAR(255), i_stop INT);
		INSERT INTO @TABLE
		EXEC SP_PO_WORKING_COUNT_DATE {$_REQUEST["po_working_hdr_id"]};

		SELECT
			row
			,CONVERT(VARCHAR, d_date, 120) AS d_date
			,c_name
			,i_stop
		FROM @TABLE;";

	$arrParam = array();

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		$arrDay = array("1" => "จันทร์", "2" => "อังคาร", "3" => "พุธ", "4" => "พฤหัส", "5" => "ศุกร์", "6" => "เสาร์", "7" => "อาทิตย์");
		while ($row = $db->Fetch($stmt)) {
			$d_date = strtotime($row["d_date"]);
			$temp = array(
				"no"										=> ($row["i_stop"] == 0) ? ++$totalCount : "",
				"day"										=> ($row["d_date"] != "") ? $arrDay[date("N", $d_date)] : "",
				"d_date"									=> ($row["d_date"] != "") ? $date->shot_date_from_db($row["d_date"]) : "",
				"i_stop"									=> $row["i_stop"],
				"c_name"									=> $row["c_name"],
			);
			${$root}[] = $temp;
		}
	}
	return json_encode(array("debug" => true, $root => ${$root},));
}
