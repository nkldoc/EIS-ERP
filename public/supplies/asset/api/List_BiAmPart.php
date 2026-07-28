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
$DB_NAME = ""; //"NMU_ASSET..";

function List_QueryParam()
{
	global $db, $date, $root, $data, $con, $arr_status;
	$DB_NAME = 'NMU_ERP..';

	$sqlMain = "
	SET NOCOUNT ON;
	DECLARE @i_budget AS INT = ?;
	DECLARE @c_yyyy_mm_s AS VARCHAR(6) = CAST((@i_budget-1) AS VARCHAR(4))+'10';
	DECLARE @c_yyyy_mm_e AS VARCHAR(6) = CAST(@i_budget AS VARCHAR(4))+'09';
	DECLARE @max_yyyy_mm AS VARCHAR(6);
	
	SELECT @max_yyyy_mm = MAX(c_yyyy_mm) 
	FROM am_tran_depre 
	WHERE c_yyyy_mm BETWEEN @c_yyyy_mm_s AND @c_yyyy_mm_e;
	
	SELECT b.c_acc_code, b.c_acc_name
	, SUM(f_unit_cost) AS f_unit_cost
	, SUM(f_depre_after) AS f_depre
	, (SUM(f_depre_after)*100.00)/SUM(f_unit_cost) AS f_per
	FROM am_tran_depre a
		INNER JOIN am_mode_acc b ON a.am_mode_id = b.am_mode_id
	WHERE a.c_yyyy_mm = @max_yyyy_mm
	GROUP BY b.c_acc_code, b.c_acc_name
	ORDER BY b.c_acc_code, b.c_acc_name;
	";

	$arrParam[]	= $_REQUEST['i_year'];
	$f_unit_cost = 0;
	$f_depre = 0;
	$f_per = 0;




	$stmt = $db->QueryParam($sqlMain, $arrParam);

	if ($_REQUEST["type"] != "excel2007") {
		if ($stmt) {

			$no = 0;

			while ($row = $db->Fetch($stmt)) {

				$f_unit_cost += $row["f_unit_cost"];
				$f_depre += $row["f_depre"];
				$f_per += $row["f_per"];



				$temp = array(
					"no"                =>	++$no,
					"i_type"            =>	'1',
					"c_acc_code"			=>  $row["c_acc_code"],
					"c_acc_name"			=>	$row["c_acc_name"],
					"f_unit_cost"	=>	$row["f_unit_cost"],
					"f_depre"	=>	$row["f_depre"],
					"f_per"			=>	number_format($row["f_per"], 2),


				);
				${$root}[]	= $temp;
			}
			$temp = array(
				"i_type"            => '2',
				"c_acc_code"			=>  "",
				"c_acc_name"			=>	"",
				"f_unit_cost"	=>	$f_unit_cost,
				"f_depre"	=>	$f_depre,
				"f_per"			=>	number_format($f_per, 2),

			);
			${$root}[]	= $temp;
		}

		return json_encode(array("debug" => true,  $root => ${$root}));
	} else {
		if ($stmt) {


			$columns[] = "ลำดับ";
			$columns[] = "หมวดทรัพย์สิน";
			$columns[] = "จำนวนสินทรัพย์ทั้งหมด";
			$columns[] = "เปอร์เซอร์";
			$columns[] = "สินทรัพย์ที่ได้มาในปี";


			${$root}[] = $columns;
			$on = 0;
			while ($row = $db->Fetch($stmt)) {


				$temp = array(
					"no"                =>	++$on,
					"acc_name"			=>  $row["acc_name"],
					"all_asset"			=>	$row["all_asset"],
					"ass_per"			=>	$row["f_depre"],
					"all_asset_year"	=>	$row["all_asset_year"],


				);
				// foreach ($mm_arr as $value) {
				// 	$temp[$value] = $row[$value] == '' ? '0.00' : $row[$value];
				// }
				// $temp["f_mm_sum"] = $row["f_mm_sum"] == '' ? '0.00' : $row["f_mm_sum"];

				${$root}[]	= $temp;
			}
			$temp = array(

				"no"                =>	"รวมทั้งสิ้น",
				"acc_name"			=>  '',
				"all_asset"			=>	'',
				"ass_per"			=>	'',
				"all_asset_year"	=>	'',


			);
			// ${$root}[]	= $temp;
		}
		$xlsx = new ArrToXlsx();
		$xlsx->ArrToXlsx(${$root}, "รายงานตัดจำหน่าย");
	}
}
