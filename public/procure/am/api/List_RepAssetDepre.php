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
	$DB_NAME = "";//'NMU_ASSET..';

	$mm_start = ($_REQUEST['mm_start'] > '09' ? $_REQUEST['i_year'] - 1 : $_REQUEST['i_year']) . $_REQUEST['mm_start'];
	$sqlMain = "
		SET NOCOUNT ON
		DECLARE @c_yyyy_mm AS VARCHAR(6) = '{$mm_start}'; /*เปลี่ยนปีเดือนที่คิดค่าเสื่อม*/
		DECLARE @am_mode_id AS BIGINT = {$_REQUEST['am_mode_id']}; /*ID หมวดบัญชีสินทรัพย์*/
		DECLARE @in_year AS tinyint = {$_REQUEST['in_year']}; /*1=สินทรัพย์ในปี, 2=สินทรัพย์ก่อนปี*/
		
		
		/*หายอดยกมา*/
		SELECT a.am_asset_hdr_id
		, CASE WHEN b.max_ym = @c_yyyy_mm THEN a.f_depre_begin ELSE a.f_depre_after END AS f_depre_after
		INTO #temp_begin
		FROM {$DB_NAME} am_tran_depre a
		INNER JOIN
		(SELECT 
		am_asset_hdr_id, MAX(c_yyyy_mm) AS max_ym
		FROM {$DB_NAME} am_tran_depre WHERE c_yyyy_mm <= @c_yyyy_mm
		GROUP BY am_asset_hdr_id) b ON a.am_asset_hdr_id = b.am_asset_hdr_id AND a.c_yyyy_mm = b.max_ym;
		
		/*ค่าเสื่อมแต่หละเดือน*/
		SELECT am_asset_hdr_id
			, SUM(td.f_depre) AS f_depre
		INTO #temp_depre
		FROM {$DB_NAME} am_tran_depre td
		WHERE c_yyyy_mm = @c_yyyy_mm
		GROUP BY am_asset_hdr_id;
		
		
		select d.c_ref_doc, d.gx_code
			,b.c_code
			,b.c_name
			,c.c_code +' : '+ c.c_name as am_mode_name
			,b.acc_code + ' : ' + b.acc_name as acc_name
			,(SELECT c_name FROM NMU..dc_expense_budget_type aa WHERE aa.dc_expense_budget_type_id = b.dc_expense_budget_type_id) AS budget_source
			,b.i_period_year
			,convert(varchar(10),b.d_receive_date,120) as d_receive_date
			, b.f_unit_cost AS f_unit_cost
			, ISNULL(ISNULL(tb.f_depre_after, b.f_depre_begin),0.00) AS f_depre_begin
			, ISNULL (td.f_depre,0) AS f_depre
			, ISNULL(ISNULL(tb.f_depre_after, b.f_depre_begin),0.00) + ISNULL(td.f_depre, 0.00) AS f_mm_sum
		from {$DB_NAME} am_asset_hdr b 
			inner join {$DB_NAME} am_mode_acc c  on b.am_mode_id = c.am_mode_id
			inner join (select a.am_mode_id
						, cast(a.c_yyyy_cal as varchar(4))+cast(a.c_mm_cal as varchar(2)) as c_yyyy_mm
						, a.i_type_cal
						, b.c_ref_doc
						, b.c_code as gx_code
						from NMU..am_gl_depre_hdr a
							inner join NMU..gl_tran_hdr b on a.gl_tran_hdr_id = b.gl_tran_hdr_id) d on @in_year = d.i_type_cal 
				and c.am_mode_id = d.am_mode_id 
				and d.c_yyyy_mm = @c_yyyy_mm
			LEFT JOIN #temp_begin tb ON b.am_asset_hdr_id = tb.am_asset_hdr_id
			LEFT JOIN #temp_depre td ON b.am_asset_hdr_id = td.am_asset_hdr_id 
		where CAST(YEAR(b.d_receive_date) AS VARCHAR(4))+RIGHT('0'+CAST(MONTH(b.d_receive_date) AS VARCHAR(2)) , 2) <= @c_yyyy_mm
			AND b.am_mode_id = @am_mode_id
			AND CASE WHEN b.i_budget_year - 543 = '2022' THEN 1 ELSE 2 END = @in_year
		
		drop table #temp_depre;
		drop table #temp_begin;
	";

	$arrParam[]	= null;
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

	if ($_REQUEST["type"] != "excel2007") {
		if ($stmt) {
			$on = 0;
			$f_unit_cost = 0;
			$f_depre_begin = 0;
			$f_depre = 0;
			$f_mm_sum = 0;


			while ($row = $db->Fetch($stmt)) {

				$f_unit_cost += $row["f_unit_cost"];
				$f_depre_begin += $row["f_depre_begin"];
				$f_depre += $row["f_depre"];
				$f_mm_sum += $row["f_mm_sum"];

				$temp = array(
					"no"                =>	++$on,
					"i_type"            =>	'1',
					"c_ref_doc"			=>	$row["c_ref_doc"],
					"gx_code"			=>	$row["gx_code"],
					"c_code"			=>	$row["c_code"],
					"c_name"			=>	$row["c_name"],
					"am_mode_name"		=>	$row["am_mode_name"],
					"acc_name"			=>	$row["acc_name"],
					"budget_source"		=>	$row["budget_source"],
					"i_period_year"		=>	$row["i_period_year"],
					"d_receive_date"    => ($row["d_receive_date"] != "") ? $date->shot_date_from_db($row["d_receive_date"]) : "",
					"f_unit_cost"		=>	$row["f_unit_cost"],
					"f_depre_begin"		=>	$row["f_depre_begin"],
					"f_depre"			=>	$row["f_depre"],
					"f_mm_sum"			=>	$row["f_mm_sum"],
				);
				${$root}[]	= $temp;
			}
			$temp = array(
				"i_type"            => '2',
				"d_receive_date"    => 'รวมทั้งสิ้น :',
				"f_unit_cost"		=>	$f_unit_cost,
				"f_depre_begin"		=>	$f_depre_begin,
				"f_depre"			=>	$f_depre,
				"f_mm_sum"			=>	$f_depre_begin,
			);
			${$root}[]	= $temp;
		}
		return json_encode(array("debug" => true,  $root => ${$root}));
	} else {
		if ($stmt) {


			$columns[] = "ลำดับ";
			$columns[] = "เลขเอกสารอ้างอิง";
			$columns[] = "เลขที่ GX";
			$columns[] = "รหัสสินทรัพย์";
			$columns[] = "ชื่อสินทรัพย์";
			$columns[] = "หมวดบัญชีสินทรัพย์";
			$columns[] = "ชื่อบัญชี";
			$columns[] = "แหล่งเงิน";
			$columns[] = "อายุการใช้งาน";
			$columns[] = "วันที่รับ";
			$columns[] = "ราคาทุน";
			$columns[] = "ค่าเสื่อมสะสมยกมา";
			$columns[] = "ค่าเสื่อมประจำเดือน";
			$columns[] = "ค่าเสื่อมสะสมยกไป";
			${$root}[] = $columns;
			$on = 0;
			$f_unit_cost = 0;
			$f_depre_begin = 0;
			$f_depre = 0;
			$f_mm_sum = 0;
			while ($row = $db->Fetch($stmt)) {
				$f_unit_cost += $row['f_unit_cost'];
				$f_depre += $row['f_depre'];
				$f_depre_begin += $row['f_depre_begin'];
				$f_mm_sum += $row['f_mm_sum'];

				$temp = array(
					"no"                =>	++$on,
					"c_ref_doc"			=>	$row["c_ref_doc"],
					"gx_code"			=>	$row["gx_code"],
					"c_code"			=>	$row["c_code"],
					"c_name"			=>	$row["c_name"],
					"am_mode_name"		=>	$row["am_mode_name"],
					"acc_name"			=>	$row["acc_name"],
					"budget_source"		=>	$row["budget_source"],
					"i_period_year"		=>	$row["i_period_year"],
					"d_receive_date"    => ($row["d_receive_date"] != "") ? $date->shot_date_from_db($row["d_receive_date"]) : "",
					"f_unit_cost"     =>	$row["f_unit_cost"]  == '' ? '0.00' : $row["f_unit_cost"],
					"f_depre_begin"     =>	$row["f_depre_begin"]  == '' ? '0.00' : $row["f_depre_begin"],
					"f_depre"     =>	$row["f_depre"]  == '' ? '0.00' : $row["f_depre"],
					"f_mm_sum"     =>	$row["f_mm_sum"]  == '' ? '0.00' : $row["f_mm_sum"],
				);
				// foreach ($mm_arr as $value) {
				// 	$temp[$value] = $row[$value] == '' ? '0.00' : $row[$value];
				// }
				// $temp["f_mm_sum"] = $row["f_mm_sum"] == '' ? '0.00' : $row["f_mm_sum"];

				${$root}[]	= $temp;
			}
			$temp = array(
				"no"                => "รวมทั้งสิ้น",
				"c_ref_doc"			=>	'',
				"gx_code"			=>	'',
				"c_code"			=>  '',
				"c_name"			=>  '',
				"am_mode_name"		=>	'',
				"acc_name"			=>	'',
				"budget_source"		=>	'',
				"i_period_year"		=>	'',
				"d_receive_date"    => 	'',
				"f_unit_cost"       =>  $f_unit_cost == '' ? '0.00' : $f_unit_cost,
				"f_depre_begin"     =>  $f_depre_begin == '' ? '0.00' : $f_depre_begin,
				"f_depre"     =>  $f_depre == '' ? '0.00' : $f_depre,
				"f_mm_sum"     =>  $f_mm_sum == '' ? '0.00' : $f_mm_sum,

			);
			// ${$root}[]	= $temp;
		}
		$xlsx = new ArrToXlsx();
		$xlsx->ArrToXlsx(${$root}, "รายงานครุภัณฑ์");
	}
}
