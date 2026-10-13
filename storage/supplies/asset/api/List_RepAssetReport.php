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

	$sqlMain = "
		SET NOCOUNT ON
		DECLARE @c_yyyy_mm_start BIGINT = '202110';
		DECLARE @c_yyyy_mm_end BIGINT = '202209';
		SET NOCOUNT ON

		/******* ราคาทุน *******/
		SELECT 
			'11' AS i_type
			,'ยอดยกมา ณ วันที่' AS c_name
			,SUM(CASE WHEN b.c_code IN ('0601') THEN ISNULL(a.f_unit_cost,0.00) ELSE 0.00 end) AS f_total_0601 /* ที่ดิน */
			,SUM(CASE WHEN b.c_code IN ('0501','0502','0503','0504','0509') THEN ISNULL(a.f_unit_cost,0.00) ELSE 0.00 end) AS f_total_0500 /* อาคารและสิ่งปลุกสร้าง */
			,SUM(CASE WHEN b.c_code IN ('0201') THEN ISNULL(a.f_unit_cost,0.00) ELSE 0.00 end) AS f_total_0201 /* ครุภัณฑ์สำนักงาน */
			,SUM(CASE WHEN b.c_code IN ('0212') THEN ISNULL(a.f_unit_cost,0.00) ELSE 0.00 end) AS f_total_0212 /* ครุภัณฑ์วิทยาศาสตร์และการแพทย์ */
			,SUM(CASE WHEN b.c_code IN ('0213') THEN ISNULL(a.f_unit_cost,0.00) ELSE 0.00 end) AS f_total_0213 /* ครุภัณฑ์คอมพิวเตอร์ */
			,SUM(CASE WHEN b.c_code not IN ('0601','0501','0502','0503','0504','0509','0201','0212','0213') THEN ISNULL(a.f_unit_cost,0.00) ELSE 0.00 end) AS f_total_0000 /* ครุภัณฑ์อื่นๆ */
			,SUM(ISNULL(a.f_unit_cost,0.00)) AS f_total /* รวม */
			--,COUNT(*)
		FROM am_asset_hdr a
		INNER JOIN am_mode_acc b ON a.am_mode_id = b.am_mode_id
		WHERE
			cast(year(d_receive_date)as varchar(4)) + right('0'+ cast(month(d_receive_date)as varchar(2)),2) < @c_yyyy_mm_start
			and (d_cutoff_date is null or cast(year(d_cutoff_date)as varchar(4)) + right('0'+ cast(month(d_cutoff_date)as varchar(2)),2) >= @c_yyyy_mm_start)
		UNION all
		SELECT 
			'12' AS i_type
			,'เพิ่มขี้นระหว่างปี' AS c_name
			,SUM(CASE WHEN b.c_code IN ('0601') THEN ISNULL(a.f_unit_cost,0.00) ELSE 0.00 end) AS f_total_0601 /* ที่ดิน */
			,SUM(CASE WHEN b.c_code IN ('0501','0502','0503','0504','0509') THEN ISNULL(a.f_unit_cost,0.00) ELSE 0.00 end) AS f_total_0500 /* อาคารและสิ่งปลุกสร้าง */
			,SUM(CASE WHEN b.c_code IN ('0201') THEN ISNULL(a.f_unit_cost,0.00) ELSE 0.00 end) AS f_total_0201 /* ครุภัณฑ์สำนักงาน */
			,SUM(CASE WHEN b.c_code IN ('0212') THEN ISNULL(a.f_unit_cost,0.00) ELSE 0.00 end) AS f_total_0212 /* ครุภัณฑ์วิทยาศาสตร์และการแพทย์ */
			,SUM(CASE WHEN b.c_code IN ('0213') THEN ISNULL(a.f_unit_cost,0.00) ELSE 0.00 end) AS f_total_0213 /* ครุภัณฑ์คอมพิวเตอร์ */
			,SUM(CASE WHEN b.c_code not IN ('0601','0501','0502','0503','0504','0509','0201','0212','0213') THEN ISNULL(a.f_unit_cost,0.00) ELSE 0.00 end) AS f_total_0000 /* ครุภัณฑ์อื่นๆ */
			,SUM(ISNULL(a.f_unit_cost,0.00)) AS f_total /* รวม */
			--,COUNT(*)
		FROM am_asset_hdr a
		INNER JOIN am_mode_acc b ON a.am_mode_id = b.am_mode_id
		WHERE
			cast(year(d_receive_date)as varchar(4)) + right('0'+ cast(month(d_receive_date)as varchar(2)),2) between @c_yyyy_mm_start and  @c_yyyy_mm_end
			and (d_cutoff_date is null or cast(year(d_cutoff_date)as varchar(4)) + right('0'+ cast(month(d_cutoff_date)as varchar(2)),2) >  @c_yyyy_mm_end)
		UNION all
		SELECT 
			'13' AS i_type
			,'ตำจำหน่ายระหว่างปี' AS c_name
			,SUM(CASE WHEN b.c_code IN ('0601') THEN ISNULL(a.f_unit_cost,0.00) ELSE 0.00 end) * -1 AS f_total_0601 /* ที่ดิน */
			,SUM(CASE WHEN b.c_code IN ('0501','0502','0503','0504','0509') THEN ISNULL(a.f_unit_cost,0.00) ELSE 0.00 end) * -1  AS f_total_0500 /* อาคารและสิ่งปลุกสร้าง */
			,SUM(CASE WHEN b.c_code IN ('0201') THEN ISNULL(a.f_unit_cost,0.00) ELSE 0.00 end) * -1  AS f_total_0201 /* ครุภัณฑ์สำนักงาน */
			,SUM(CASE WHEN b.c_code IN ('0212') THEN ISNULL(a.f_unit_cost,0.00) ELSE 0.00 end) * -1  AS f_total_0212 /* ครุภัณฑ์วิทยาศาสตร์และการแพทย์ */
			,SUM(CASE WHEN b.c_code IN ('0213') THEN ISNULL(a.f_unit_cost,0.00) ELSE 0.00 end) * -1  AS f_total_0213 /* ครุภัณฑ์คอมพิวเตอร์ */
			,SUM(CASE WHEN b.c_code not IN ('0601','0501','0502','0503','0504','0509','0201','0212','0213') THEN ISNULL(a.f_unit_cost,0.00) ELSE 0.00 end) * -1  AS f_total_0000 /* ครุภัณฑ์อื่นๆ */
			,SUM(ISNULL(a.f_unit_cost,0.00)) * -1  AS f_total /* รวม */
			--,COUNT(*)
		FROM am_asset_hdr a
		INNER JOIN am_mode_acc b ON a.am_mode_id = b.am_mode_id
		WHERE
			cast(year(d_receive_date)as varchar(4)) + right('0'+ cast(month(d_receive_date)as varchar(2)),2) < @c_yyyy_mm_end
			and  cast(year(d_cutoff_date)as varchar(4)) + right('0'+ cast(month(d_cutoff_date)as varchar(2)),2)  between @c_yyyy_mm_start and @c_yyyy_mm_end
		UNION all
		SELECT 
			'10' AS i_type
			,'ยอดคงเหลือ ณ วันที่' AS c_name
			,SUM(CASE WHEN b.c_code IN ('0601') THEN ISNULL(a.f_unit_cost,0.00) ELSE 0.00 end) AS f_total_0601 /* ที่ดิน */
			,SUM(CASE WHEN b.c_code IN ('0501','0502','0503','0504','0509') THEN ISNULL(a.f_unit_cost,0.00) ELSE 0.00 end) AS f_total_0500 /* อาคารและสิ่งปลุกสร้าง */
			,SUM(CASE WHEN b.c_code IN ('0201') THEN ISNULL(a.f_unit_cost,0.00) ELSE 0.00 end) AS f_total_0201 /* ครุภัณฑ์สำนักงาน */
			,SUM(CASE WHEN b.c_code IN ('0212') THEN ISNULL(a.f_unit_cost,0.00) ELSE 0.00 end) AS f_total_0212 /* ครุภัณฑ์วิทยาศาสตร์และการแพทย์ */
			,SUM(CASE WHEN b.c_code IN ('0213') THEN ISNULL(a.f_unit_cost,0.00) ELSE 0.00 end) AS f_total_0213 /* ครุภัณฑ์คอมพิวเตอร์ */
			,SUM(CASE WHEN b.c_code not IN ('0601','0501','0502','0503','0504','0509','0201','0212','0213') THEN ISNULL(a.f_unit_cost,0.00) ELSE 0.00 end) AS f_total_0000 /* ครุภัณฑ์อื่นๆ */
			,SUM(ISNULL(a.f_unit_cost,0.00)) AS f_total /* รวม */
			--,COUNT(*)
		FROM am_asset_hdr a
		INNER JOIN am_mode_acc b ON a.am_mode_id = b.am_mode_id
		WHERE
			cast(year(d_receive_date)as varchar(4)) + right('0'+ cast(month(d_receive_date)as varchar(2)),2) <= @c_yyyy_mm_end
			and (d_cutoff_date is null or cast(year(d_cutoff_date)as varchar(4)) + right('0'+ cast(month(d_cutoff_date)as varchar(2)),2) > @c_yyyy_mm_end)
		
		/******* ค่าเสื่อมราคาสะสม *******/
		UNION all
		SELECT 
			'21' AS i_type
			,'ยอดยกมา ณ วันที่' AS c_name
			,SUM(CASE WHEN b.c_code IN ('0601') THEN CASE WHEN a.i_in_year = 1 THEN 0.00 ELSE ISNULL(a.f_depre_begin,0.00) END ELSE 0.00 end) AS f_total_0601 /* ที่ดิน */
			,SUM(CASE WHEN b.c_code IN ('0501','0502','0503','0504','0509') THEN CASE WHEN a.i_in_year = 1 THEN 0.00 ELSE ISNULL(a.f_depre_begin,0.00) END ELSE 0.00 end) AS f_total_0500 /* อาคารและสิ่งปลุกสร้าง */
			,SUM(CASE WHEN b.c_code IN ('0201') THEN CASE WHEN a.i_in_year = 1 THEN 0.00 ELSE ISNULL(a.f_depre_begin,0.00) END ELSE 0.00 end) AS f_total_0201 /* ครุภัณฑ์สำนักงาน */
			,SUM(CASE WHEN b.c_code IN ('0212') THEN CASE WHEN a.i_in_year = 1 THEN 0.00 ELSE ISNULL(a.f_depre_begin,0.00) END ELSE 0.00 end) AS f_total_0212 /* ครุภัณฑ์วิทยาศาสตร์และการแพทย์ */
			,SUM(CASE WHEN b.c_code IN ('0213') THEN CASE WHEN a.i_in_year = 1 THEN 0.00 ELSE ISNULL(a.f_depre_begin,0.00) END ELSE 0.00 end) AS f_total_0213 /* ครุภัณฑ์คอมพิวเตอร์ */
			,SUM(CASE WHEN b.c_code not IN ('0601','0501','0502','0503','0504','0509','0201','0212','0213') THEN CASE WHEN a.i_in_year = 1 THEN 0.00 ELSE ISNULL(a.f_depre_begin,0.00) END ELSE 0.00 end) AS f_total_0000 /* ครุภัณฑ์อื่นๆ */
			
			,SUM(CASE WHEN a.i_in_year = 1 THEN 0.00 ELSE ISNULL(a.f_depre_begin,0.00) END) AS f_total /* รวม */
			--,count(*)
		FROM am_tran_depre a
		INNER JOIN am_mode_acc b ON a.am_mode_id = b.am_mode_id
		WHERE
			c_yyyy_mm = @c_yyyy_mm_start
		UNION all
		SELECT 
			'22' AS i_type
			,'เพิ่มขี้นระหว่างปี' AS c_name
			,SUM(CASE WHEN b.c_code IN ('0601') THEN ISNULL(a.f_depre,0.00) ELSE 0.00 end)
				+ MIN(CASE WHEN b.c_code IN ('0601') AND i_in_year = 1 THEN ISNULL(a.f_depre_begin,0.00) ELSE 0.00 end) AS f_total_0601 /* ที่ดิน */
			,SUM(CASE WHEN b.c_code IN ('0501','0502','0503','0504','0509') THEN ISNULL(a.f_depre,0.00) ELSE 0.00 end)
				+ MIN(CASE WHEN b.c_code IN ('0501','0502','0503','0504','0509') AND i_in_year = 1 THEN ISNULL(a.f_depre_begin,0.00) ELSE 0.00 end) AS f_total_0500 /* อาคารและสิ่งปลุกสร้าง */
			,SUM(CASE WHEN b.c_code IN ('0201') THEN ISNULL(a.f_depre,0.00) ELSE 0.00 end)
				+ MIN(CASE WHEN b.c_code IN ('0201') AND i_in_year = 1 THEN ISNULL(a.f_depre_begin,0.00) ELSE 0.00 end) AS f_total_0201 /* ครุภัณฑ์สำนักงาน */
			,SUM(CASE WHEN b.c_code IN ('0212') THEN ISNULL(a.f_depre,0.00) ELSE 0.00 end)
				+ MIN(CASE WHEN b.c_code IN ('0212') AND i_in_year = 1 THEN ISNULL(a.f_depre_begin,0.00) ELSE 0.00 end) AS f_total_0212 /* ครุภัณฑ์วิทยาศาสตร์และการแพทย์ */
			,SUM(CASE WHEN b.c_code IN ('0213') THEN ISNULL(a.f_depre,0.00) ELSE 0.00 end)
				+ MIN(CASE WHEN b.c_code IN ('0213') AND i_in_year = 1 THEN ISNULL(a.f_depre_begin,0.00) ELSE 0.00 end) AS f_total_0213 /* ครุภัณฑ์คอมพิวเตอร์ */
			,SUM(CASE WHEN b.c_code not IN ('0601','0501','0502','0503','0504','0509','0201','0212','0213') THEN ISNULL(a.f_depre,0.00) ELSE 0.00 end)
				+ MIN(CASE WHEN b.c_code IN ('0601','0501','0502','0503','0504','0509','0201','0212','0213') AND i_in_year = 1 THEN ISNULL(a.f_depre_begin,0.00) ELSE 0.00 end) AS f_total_0000 /* ครุภัณฑ์อื่นๆ */
			,SUM(ISNULL(a.f_depre,0.00))
				+ MIN(CASE WHEN i_in_year = 1 THEN ISNULL(a.f_depre_begin,0.00) ELSE 0.00 end) AS f_total /* รวม */
			--,count(*)
		FROM am_tran_depre a
		INNER JOIN am_mode_acc b ON a.am_mode_id = b.am_mode_id
		WHERE
			c_yyyy_mm BETWEEN @c_yyyy_mm_start AND @c_yyyy_mm_end
		UNION all
		SELECT 
			'20' AS i_type
			,'ยอดคงเหลือ ณ วันที่' AS c_name
			,SUM(CASE WHEN b.c_code IN ('0601') THEN ISNULL(a.f_depre_after,0.00) ELSE 0.00 end) AS f_total_0601 /* ที่ดิน */
			,SUM(CASE WHEN b.c_code IN ('0501','0502','0503','0504','0509') THEN ISNULL(a.f_depre_after,0.00) ELSE 0.00 end) AS f_total_0500 /* อาคารและสิ่งปลุกสร้าง */
			,SUM(CASE WHEN b.c_code IN ('0201') THEN ISNULL(a.f_depre_after,0.00) ELSE 0.00 end) AS f_total_0201 /* ครุภัณฑ์สำนักงาน */
			,SUM(CASE WHEN b.c_code IN ('0212') THEN ISNULL(a.f_depre_after,0.00) ELSE 0.00 end) AS f_total_0212 /* ครุภัณฑ์วิทยาศาสตร์และการแพทย์ */
			,SUM(CASE WHEN b.c_code IN ('0213') THEN ISNULL(a.f_depre_after,0.00) ELSE 0.00 end) AS f_total_0213 /* ครุภัณฑ์คอมพิวเตอร์ */
			,SUM(CASE WHEN b.c_code not IN ('0601','0501','0502','0503','0504','0509','0201','0212','0213') THEN ISNULL(a.f_depre_after,0.00) ELSE 0.00 end) AS f_total_0000 /* ครุภัณฑ์อื่นๆ */
			,SUM(ISNULL(a.f_depre_after,0.00)) AS f_total /* รวม */
			--,count(*)
		FROM am_tran_depre a
		INNER JOIN am_mode_acc b ON a.am_mode_id = b.am_mode_id
		WHERE
			c_yyyy_mm = @c_yyyy_mm_end

	";
	$arrParam[]	= $_REQUEST['i_year'] - 1 . "10";
	$arrParam[]	= $_REQUEST['i_year'] . "09";
	// /******echo sql******/
	// $sql = (@$sqlMain) ? $sqlMain : $sql;
	// $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());

	// $sql = str_replace('?', '#-#', $sql);
	// foreach ($arr as $fld => $value) {
	// 	$sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
	// }
	// echo $sql; exit;
	// /********************/
	$stmt = $db->QueryParam($sqlMain, $arrParam);

	if ($stmt) {
		$on = 0;
		$f_total_0601_sum_1 = 0;
		$f_total_0500_sum_1 = 0;
		$f_total_0201_sum_1 = 0;
		$f_total_0212_sum_1 = 0;
		$f_total_0213_sum_1 = 0;
		$f_total_0000_sum_1 = 0;
		$f_total_sum_1 = 0;

		$f_total_0601_sum_2 = 0;
		$f_total_0500_sum_2 = 0;
		$f_total_0201_sum_2 = 0;
		$f_total_0212_sum_2 = 0;
		$f_total_0213_sum_2 = 0;
		$f_total_0000_sum_2 = 0;
		$f_total_sum_2 = 0;

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"                =>	  ++$on,
				"i_type"            =>    $row["i_type"],
				"c_name"            =>    $row["c_name"],
				"f_total_0601"      =>    $row["f_total_0601"],
				"f_total_0500"      =>    $row["f_total_0500"],
				"f_total_0201"      =>    $row["f_total_0201"],
				"f_total_0212"      =>    $row["f_total_0212"],
				"f_total_0213"      =>    $row["f_total_0213"],
				"f_total_0000"      =>    $row["f_total_0000"],
				"f_total"           =>    $row["f_total"],

			);
			${$root}[]	= $temp;
			if ($row["i_type"][1] == '1') {
				$f_total_0601_sum_1 = round($f_total_0601_sum_1, 2) + $row['f_total_0601'];
				$f_total_0500_sum_1 = round($f_total_0500_sum_1, 2) + $row['f_total_0500'];
				$f_total_0201_sum_1 = round($f_total_0201_sum_1, 2) + $row['f_total_0201'];
				$f_total_0212_sum_1 = round($f_total_0212_sum_1, 2) + $row['f_total_0212'];
				$f_total_0213_sum_1 = round($f_total_0213_sum_1, 2) + $row['f_total_0213'];
				$f_total_0000_sum_1 = round($f_total_0000_sum_1, 2) + $row['f_total_0000'];
				$f_total_sum_1 += (round($f_total_sum_1, 2) + $row['f_total']);
			}
			if ($row["i_type"][1] == '0') {
				$f_total_0601_sum_2 = round($f_total_0601_sum_2, 2) + $row['f_total_0601'];
				$f_total_0500_sum_2 = round($f_total_0500_sum_2, 2) + $row['f_total_0500'];
				$f_total_0201_sum_2 = round($f_total_0201_sum_2, 2) + $row['f_total_0201'];
				$f_total_0212_sum_2 = round($f_total_0212_sum_2, 2) + $row['f_total_0212'];
				$f_total_0213_sum_2 = round($f_total_0213_sum_2, 2) + $row['f_total_0213'];
				$f_total_0000_sum_2 = round($f_total_0000_sum_2, 2) + $row['f_total_0000'];
				$f_total_sum_2 = round($f_total_sum_2, 2) + $row['f_total'];
			}
		}

		$temp = array(
			"no"                =>	  ++$on,
			"i_type"            =>    '01',
			"c_name"            =>    "มูลค่าสุทธิตามบัญชี - สุทธิต้นปี",
			"f_total_0601"      =>    round($f_total_0601_sum_1, 2),
			"f_total_0500"      =>    round($f_total_0500_sum_1, 2),
			"f_total_0201"      =>    round($f_total_0201_sum_1, 2),
			"f_total_0212"      =>    round($f_total_0212_sum_1, 2),
			"f_total_0213"      =>    round($f_total_0213_sum_1, 2),
			"f_total_0000"      =>    round($f_total_0000_sum_1, 2),
			"f_total"           =>    round($f_total_sum_1, 2),
		);
		${$root}[]	= $temp;

		$temp = array(
			"no"                =>	  ++$on,
			"i_type"            =>    '02',
			"c_name"            =>    "มูลค่าสุทธิตามบัญชี - สุทธิปลายปี",
			"f_total_0601"      =>    round($f_total_0601_sum_2, 2),
			"f_total_0500"      =>    round($f_total_0500_sum_2, 2),
			"f_total_0201"      =>    round($f_total_0201_sum_2, 2),
			"f_total_0212"      =>    round($f_total_0212_sum_2, 2),
			"f_total_0213"      =>    round($f_total_0213_sum_2, 2),
			"f_total_0000"      =>    round($f_total_0000_sum_2, 2),
			"f_total"           =>    round($f_total_sum_2, 2),
		);
		${$root}[]	= $temp;
	}
	return json_encode(array("debug" => true,  $root => ${$root}));
}
