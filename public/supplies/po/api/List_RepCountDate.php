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
		DECLARE @ID AS INT = {$_REQUEST["po_working_hdr_id"]};
		DECLARE @ISTATUS AS INT = {$_REQUEST["i_status"]};
		DECLARE @d_start AS DATE = DATEADD(DAY, 1, '{$_REQUEST["d_start"]}');
		DECLARE @d_end AS DATE = '{$_REQUEST["d_end"]}';
		DECLARE @i_holiday AS INT;
		DECLARE @c_name AS VARCHAR(255);
		DECLARE @TABLE TABLE (d_date DATETIME, c_name VARCHAR(255), i_holiday INT);

		WHILE (@d_start <= @d_end)
		BEGIN
			DECLARE @c_name1 AS VARCHAR(255) = NULL;
			DECLARE @c_name2 AS VARCHAR(255) = NULL;

			/* ทักท้วง */
/*
			IF @ISTATUS = 3
				SELECT
					@c_name1 = 'ทักท้วง'
				FROM dbo.po_working_hdr aa
					INNER JOIN dbo.po_working_dtl bb ON aa.po_working_hdr_id = bb.po_working_hdr_id
					INNER JOIN dbo.po_working_item cc ON aa.po_working_hdr_id = cc.po_working_hdr_id AND cc.i_status = 3
				WHERE aa.po_working_hdr_id = @ID AND @d_start BETWEEN cc.d_doc_date AND cc.d_receive_date;
*/
			/* วันหยุดจ่ายเช็ค */
			IF @ISTATUS = 11
				SELECT
					@c_name1 = bb.c_name
				FROM dbo.po_close_receive_hdr aa
					INNER JOIN dbo.po_close_receive_dtl bb ON aa.po_close_receive_hdr_id = bb.po_close_receive_hdr_id
				WHERE aa.i_enable = 1 AND bb.d_holiday = @d_start;

			/* วันหยุด */
			SELECT
				@c_name1 = bb.c_name
			FROM dbo.po_holiday_hdr aa
				INNER JOIN dbo.po_holiday_dtl bb ON aa.po_holiday_hdr_id = bb.po_holiday_hdr_id
			WHERE aa.i_enable = 1 AND bb.d_holiday = @d_start;

			IF(@c_name1 IS NOT NULL)
				BEGIN
					SET @c_name = @c_name1;
					SET @i_holiday = 1;
				END
			ELSE
				BEGIN 
					SET @c_name = '';
					SET @i_holiday = 0;
				END
			
			INSERT @TABLE (d_date, c_name, i_holiday) VALUES (@d_start, @c_name1, @i_holiday);
			SET @d_start = DATEADD(DAY, 1, @d_start);
		END

		SELECT
			CONVERT(VARCHAR, d_date, 120) AS d_date
			,i_holiday
			,CASE
				WHEN i_holiday = 1 THEN c_name
				ELSE ''
			END AS c_name
		FROM @TABLE ORDER BY d_date;;";

	$arrParam = array();

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		$arrDay = array("1" => "จันทร์", "2" => "อังคาร", "3" => "พุธ", "4" => "พฤหัส", "5" => "ศุกร์", "6" => "เสาร์", "7" => "อาทิตย์");
		while ($row = $db->Fetch($stmt)) {
			$d_date = strtotime($row["d_date"]);
			$temp = array(
				"no"										=> ($row["i_holiday"] == 0) ? ++$totalCount : "",
				"day"										=> ($row["d_date"] != "") ? $arrDay[date("N", $d_date)] : "",
				"d_date"									=> ($row["d_date"] != "") ? $date->shot_date_from_db($row["d_date"]) : "",
				"i_holiday"									=> $row["i_holiday"],
				"c_name"									=> $row["c_name"],
			);
			${$root}[] = $temp;
		}
	}
	return json_encode(array("debug" => true, $root => ${$root},));
}
