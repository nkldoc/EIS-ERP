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
	$DB_NAME = 'NMU_ERP';

    if ($_REQUEST['mm_start'] >= 10 && $_REQUEST['mm_end'] >= 10) {
		for ($i = $_REQUEST['mm_start']; $i <= $_REQUEST['mm_end']; ++$i) {
			$mm_arr[] = 'mm_' . $i;
		}
	} else if ($_REQUEST['mm_start'] >= 10 && $_REQUEST['mm_end'] < 10) {
		for ($i = $_REQUEST['mm_start']; $i <= 12; ++$i) {
			$mm_arr[] = 'mm_' . $i;
		}
		for ($i = 1; $i <= $_REQUEST['mm_end']; ++$i) {
			$mm_arr[] = 'mm_0' . intval($i);
		}
	} else {
		for ($i = $_REQUEST['mm_start']; $i <= $_REQUEST['mm_end']; ++$i) {
			$mm_arr[] = 'mm_0' . intval($i);
		}
	}

	$month_name['mm_10'] = 'ต.ค. ' . ($_REQUEST['i_year'] + 543 - 1);
	$month_name['mm_11'] = 'พ.ย. ' . ($_REQUEST['i_year'] + 543 - 1);
	$month_name['mm_12'] = 'ธ.ค. ' . ($_REQUEST['i_year'] + 543 - 1);
	$month_name['mm_01'] = 'ม.ค. ' . ($_REQUEST['i_year'] + 543);
	$month_name['mm_02'] = 'ก.พ. ' . ($_REQUEST['i_year'] + 543);
	$month_name['mm_03'] = 'มี.ค. ' . ($_REQUEST['i_year'] + 543);
	$month_name['mm_04'] = 'เม.ย. ' . ($_REQUEST['i_year'] + 543);
	$month_name['mm_05'] = 'พ.ค. ' . ($_REQUEST['i_year'] + 543);
	$month_name['mm_06'] = 'มิ.ย. ' . ($_REQUEST['i_year'] + 543);
	$month_name['mm_07'] = 'ก.ค. ' . ($_REQUEST['i_year'] + 543);
	$month_name['mm_08'] = 'ส.ค. ' . ($_REQUEST['i_year'] + 543);
	$month_name['mm_09'] = 'ก.ย. ' . ($_REQUEST['i_year'] + 543);

	$mm_start = ($_REQUEST['mm_start'] > '09' ? $_REQUEST['i_year'] - 1 : $_REQUEST['i_year']) . $_REQUEST['mm_start'];
	$mm_end = ($_REQUEST['mm_end'] > '09' ? $_REQUEST['i_year'] - 1 : $_REQUEST['i_year']) . $_REQUEST['mm_end'];

	if ($_REQUEST['dc_expense_budget_type_id'] > '0') {
		$con .= ' AND a.dc_expense_budget_type_id = ' . $_REQUEST['dc_expense_budget_type_id'];
	}
	if ($_REQUEST['am_mode_id'] > '0') {
		$con .= ' AND a.am_mode_id = ' . $_REQUEST['am_mode_id'];
	}
	if ($_REQUEST['i_qualify'] > '0') {
		$con .= ' AND isnull(a.i_cal,0) = ' . ($_REQUEST['i_qualify'] == 2 ? '0' : '1');
	}

	$sqlMain = "
		SET NOCOUNT ON
		DECLARE @c_yyyy AS VARCHAR(4) = ?;
		DECLARE @c_yyyy_mm_min AS VARCHAR(6) = ?;
		DECLARE @c_yyyy_mm_max AS VARCHAR(6) = ?;

		/*หายอดยกมา*/
		SELECT a.am_asset_hdr_id
		, CASE WHEN b.max_ym = @c_yyyy_mm_min THEN a.f_depre_begin ELSE a.f_depre_after END AS f_depre_after
		INTO #temp_begin
		FROM {$DB_NAME}..am_tran_depre a
		INNER JOIN
		(SELECT
		am_asset_hdr_id, MAX(c_yyyy_mm) AS max_ym
		FROM {$DB_NAME}..am_tran_depre WHERE c_yyyy_mm <= @c_yyyy_mm_min
		GROUP BY am_asset_hdr_id) b ON a.am_asset_hdr_id = b.am_asset_hdr_id AND a.c_yyyy_mm = b.max_ym;

		/*ค่าเสื่อมแต่หละเดือน*/
		SELECT am_asset_hdr_id
			, SUM(CASE WHEN td.c_yyyy_mm = CONVERT(VARCHAR,@c_yyyy-1)+'10' THEN td.f_depre ELSE 0.00 END) AS mm_10
			, SUM(CASE WHEN td.c_yyyy_mm = CONVERT(VARCHAR,@c_yyyy-1)+'11' THEN td.f_depre ELSE 0.00 END) AS mm_11
			, SUM(CASE WHEN td.c_yyyy_mm = CONVERT(VARCHAR,@c_yyyy-1)+'12' THEN td.f_depre ELSE 0.00 END) AS mm_12
			, SUM(CASE WHEN td.c_yyyy_mm = @c_yyyy+'01' THEN td.f_depre ELSE 0.00 END) AS mm_01
			, SUM(CASE WHEN td.c_yyyy_mm = @c_yyyy+'02' THEN td.f_depre ELSE 0.00 END) AS mm_02
			, SUM(CASE WHEN td.c_yyyy_mm = @c_yyyy+'03' THEN td.f_depre ELSE 0.00 END) AS mm_03
			, SUM(CASE WHEN td.c_yyyy_mm = @c_yyyy+'04' THEN td.f_depre ELSE 0.00 END) AS mm_04
			, SUM(CASE WHEN td.c_yyyy_mm = @c_yyyy+'05' THEN td.f_depre ELSE 0.00 END) AS mm_05
			, SUM(CASE WHEN td.c_yyyy_mm = @c_yyyy+'06' THEN td.f_depre ELSE 0.00 END) AS mm_06
			, SUM(CASE WHEN td.c_yyyy_mm = @c_yyyy+'07' THEN td.f_depre ELSE 0.00 END) AS mm_07
			, SUM(CASE WHEN td.c_yyyy_mm = @c_yyyy+'08' THEN td.f_depre ELSE 0.00 END) AS mm_08
			, SUM(CASE WHEN td.c_yyyy_mm = @c_yyyy+'09' THEN td.f_depre ELSE 0.00 END) AS mm_09
		INTO #temp_depre
		FROM {$DB_NAME}..am_tran_depre td
		WHERE c_yyyy_mm BETWEEN @c_yyyy_mm_min AND @c_yyyy_mm_max
		GROUP BY am_asset_hdr_id;

		SELECT
			a.c_code
			,a.c_name
			,b.c_code +' : '+ b.c_name as am_mode_name
			,a.acc_code + ' : ' + a.acc_name as acc_name
			,(SELECT c_name FROM NMU..dc_expense_budget_type aa WHERE aa.dc_expense_budget_type_id = a.dc_expense_budget_type_id) AS budget_source
			,a.i_period_year
			,convert(varchar,a.d_receive_date,120) as d_receive_date
			, a.f_unit_cost AS f_unit_cost
			, ISNULL(ISNULL(tb.f_depre_after, a.f_depre_begin),0.00) AS f_depre_begin
			, td.mm_10 AS mm_10
			, td.mm_11 AS mm_11
			, td.mm_12 AS mm_12
			, td.mm_01 AS mm_01
			, td.mm_02 AS mm_02
			, td.mm_03 AS mm_03
			, td.mm_04 AS mm_04
			, td.mm_05 AS mm_05
			, td.mm_06 AS mm_06
			, td.mm_07 AS mm_07
			, td.mm_08 AS mm_08
			, td.mm_09 AS mm_09
			, ISNULL(ISNULL(tb.f_depre_after, a.f_depre_begin),0.00) + td.mm_10+td.mm_11+td.mm_12+td.mm_01+td.mm_02+td.mm_03+td.mm_04+td.mm_05+td.mm_06+td.mm_07+td.mm_08+td.mm_09 AS f_mm_sum
		FROM {$DB_NAME}..am_asset_hdr a
		INNER JOIN {$DB_NAME}..am_mode_acc b ON a.am_mode_id = b.am_mode_id
		LEFT JOIN #temp_begin tb ON a.am_asset_hdr_id = tb.am_asset_hdr_id
		LEFT JOIN #temp_depre td ON a.am_asset_hdr_id = td.am_asset_hdr_id
		WHERE
		/*ยังขาดการกรองตัดจำหน่าย ยังไม่มี process*/
			CAST(YEAR(a.d_receive_date) AS VARCHAR(4))+RIGHT('0'+CAST(MONTH(a.d_receive_date) AS VARCHAR(2)) , 2) <= @c_yyyy_mm_max
			--AND a.i_budget_year - 543 = @c_yyyy
			{$con}
		ORDER BY a.c_code;
	";
	$arrParam[]	= $_REQUEST['i_year'];
	$arrParam[]	= $mm_start;
	$arrParam[]	= $mm_end;

	$stmt = $db->QueryParam($sqlMain, $arrParam);

	if ($_REQUEST["type"] != "excel2007") {
		if ($stmt) {
			$on = 0;
			$f_unit_cost = 0;
			$f_depre_begin = 0;
			$mm_10 = 0;
			$mm_11 = 0;
			$mm_12 = 0;
			$mm_01 = 0;
			$mm_02 = 0;
			$mm_03 = 0;
			$mm_04 = 0;
			$mm_05 = 0;
			$mm_06 = 0;
			$mm_07 = 0;
			$mm_08 = 0;
			$mm_09 = 0;
			$f_mm_sum = 0;

			while ($row = $db->Fetch($stmt)) {

				$f_unit_cost += $row['f_unit_cost'];
				$f_depre_begin += $row['f_depre_begin'];
				$mm_10 += $row['mm_10'];
				$mm_11 += $row['mm_11'];
				$mm_12 += $row['mm_12'];
				$mm_01 += $row['mm_01'];
				$mm_02 += $row['mm_02'];
				$mm_03 += $row['mm_03'];
				$mm_04 += $row['mm_04'];
				$mm_05 += $row['mm_05'];
				$mm_06 += $row['mm_06'];
				$mm_07 += $row['mm_07'];
				$mm_08 += $row['mm_08'];
				$mm_09 += $row['mm_09'];
				$f_mm_sum += $row['f_mm_sum'];

				$temp = array(
					"no"                =>	++$on,
					"i_type"            =>	'1',
					"c_code"            =>	$row["c_code"],
					"c_name"            =>	$row["c_name"],
					"am_mode_name"      =>	$row["am_mode_name"],
					"acc_name"          =>	$row["acc_name"],
					"budget_source"     =>	$row["budget_source"],
					"i_period_year"     =>	$row["i_period_year"],
					"d_receive_date"    => ($row["d_receive_date"] != "") ? $date->shot_date_from_db($row["d_receive_date"]) : "",
					"f_unit_cost"       =>	$row["f_unit_cost"],
					"f_depre_begin"     =>	$row["f_depre_begin"],
					"mm_10"             =>	$row["mm_10"],
					"mm_11"             =>	$row["mm_11"],
					"mm_12"             =>	$row["mm_12"],
					"mm_01"             =>	$row["mm_01"],
					"mm_02"             =>	$row["mm_02"],
					"mm_03"             =>	$row["mm_03"],
					"mm_04"             =>	$row["mm_04"],
					"mm_05"             =>	$row["mm_05"],
					"mm_06"             =>	$row["mm_06"],
					"mm_07"             =>	$row["mm_07"],
					"mm_08"             =>	$row["mm_08"],
					"mm_09"             =>	$row["mm_09"],
					"f_mm_sum"          =>	$row["f_mm_sum"],




				);
				${$root}[]	= $temp;
			}
			$temp = array(
				"i_type"                	=> '2',
				"c_name"                	=> "รวมทั้งสิ้น",
				"f_unit_cost"       		=> $f_unit_cost,
				"f_depre_begin"       		=> $f_depre_begin,
				"mm_10"                 	=> $mm_10,
				"mm_11"                 	=> $mm_11,
				"mm_12"                 	=> $mm_12,
				"mm_01"                 	=> $mm_01,
				"mm_02"                 	=> $mm_02,
				"mm_03"                 	=> $mm_03,
				"mm_04"                 	=> $mm_04,
				"mm_05"                 	=> $mm_05,
				"mm_06"                 	=> $mm_06,
				"mm_07"                 	=> $mm_07,
				"mm_08"                 	=> $mm_08,
				"mm_09"                 	=> $mm_09,
				"f_mm_sum"              	=> $f_mm_sum,
			);
			${$root}[]	= $temp;
		}
		return json_encode(array("debug" => true,  $root => ${$root}));
	} else {
		if ($stmt) {


			$columns[] = "ลำดับ";
			$columns[] = "รหัส";
			$columns[] = "ชื่อรายการ";
			$columns[] = "หมวดครุภัณฑ์";
			$columns[] = "แหล่งเงิน";
			$columns[] = "อายุ (ปี)";
			$columns[] = "วันที่รับของ";
			$columns[] = "ราคาทุน";
			$columns[] = "ยอดยกมา";
			foreach ($mm_arr as $value) {
				$columns[] = $month_name[$value];
			}
			$columns[] = "เงินรวมค่าเสื่อม";
			${$root}[] = $columns;
			$on = 0;
			$f_unit_cost = 0;
			$f_depre_begin = 0;
			$f_mm_sum = 0;

			foreach ($mm_arr as $value) {
				$mm[$value] = 0;
			}

			while ($row = $db->Fetch($stmt)) {
				$f_unit_cost += $row['f_unit_cost'];
				$f_depre_begin += $row['f_depre_begin'];
				foreach ($mm_arr as $value) {
					$mm[$value] += $row[$value];
				}
				$f_mm_sum += $row['f_mm_sum'];

				$temp = array(
					"no"                =>	++$on,
					"c_code"            =>	$row["c_code"],
					"c_name"            =>	$row["c_name"],
					"am_mode_name"      =>	$row["am_mode_name"],
					// "acc_name"          =>	$row["acc_name"],
					"budget_source"     =>	$row["budget_source"],
					"i_period_year"     =>	$row["i_period_year"],
					"d_receive_date"    => ($row["d_receive_date"] != "") ? $date->shot_date_from_db($row["d_receive_date"]) : "",
					"f_unit_cost"     =>	$row["f_unit_cost"]  == '' ? '0.00' : $row["f_unit_cost"],
					"f_depre_begin"     =>	$row["f_depre_begin"]  == '' ? '0.00' : $row["f_depre_begin"],
				);
				foreach ($mm_arr as $value) {
					$temp[$value] = $row[$value] == '' ? '0.00' : $row[$value];
				}
				$temp["f_mm_sum"] = $row["f_mm_sum"] == '' ? '0.00' : $row["f_mm_sum"];

				${$root}[]	= $temp;
			}
			$temp = array(
				"no"                => "รวมทั้งสิ้น",
				"c_code"            =>	'',
				"c_name"            => '',
				"am_mode_name"      => '',
				"budget_source"     => '',
				"i_period_year"     => '',
				"d_receive_date"    => '',
				"f_unit_cost"       =>  $f_unit_cost == '' ? '0.00' : $f_unit_cost,
				"f_depre_begin"     =>  $f_depre_begin == '' ? '0.00' : $f_depre_begin,

			);
			foreach ($mm_arr as $value) {
				$temp[$value] = $mm[$value]  == '' ? '0.00' : $mm[$value];
			}
			$temp["f_mm_sum"] = $f_mm_sum  == '' ? '0.00' : $f_mm_sum;
			${$root}[]	= $temp;
		}
		$xlsx = new ArrToXlsx();
		$xlsx->ArrToXlsx(${$root}, "รายงานครุภัณฑ์");
	}
}
