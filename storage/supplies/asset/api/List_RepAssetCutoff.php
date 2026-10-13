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
$DB_NAME = "";//"NMU_ASSET..";

function List_QueryParam()
{
	global $db, $date, $root, $data, $con, $arr_status;
	$DB_NAME = 'NMU_ERP..';

	$sqlMain = "
		SET NOCOUNT ON
		select a.c_code,CONVERT(varchar(10),d_cutoff_date,120) as d_cutoff_date,b.c_code as asset_code,asset_name,i_period_year,f_unit_cost,f_depre,f_acc_cost  from am_cutoff_hdr a
		inner join am_cutoff_dtl b on b.am_cutoff_hdr_id = a.am_cutoff_hdr_id
		where i_success = 1 AND d_cutoff_date between ? AND ?
		order by  a.c_code,b.c_code 
 
	";

	$arrParam[]	= $_REQUEST['d_date_start'];
	$arrParam[]	= $_REQUEST['d_date_end'];
	


	$stmt = $db->QueryParam($sqlMain, $arrParam);

	if ($_REQUEST["type"] != "excel2007") {
		if ($stmt) {
			
			$no=0;

			while ($row = $db->Fetch($stmt)) {
				

				// $f_unit_cost += $row["f_unit_cost"];
				// $f_depre_begin += $row["f_depre_begin"];
				// $f_depre += $row["f_depre"];
				// $f_mm_sum += $row["f_mm_sum"];
				
				$temp = array(
					"no"                =>	++$no,
					"i_type"            =>	'1',
					"c_code"			=>  $row["c_code"],
					"d_cutoff_date"     => ($row["d_cutoff_date"] != "") ? $date->shot_date_from_db($row["d_cutoff_date"]) : "",
					"asset_code"		=>	$row["asset_code"],
					"asset_name"		=>	$row["asset_name"],
					"i_period_year"		=>	$row["i_period_year"],
					"f_unit_cost"		=>	$row["f_unit_cost"],
					"f_depre"			=>	$row["f_depre"],
					"f_acc_cost"		=>	$row["f_acc_cost"],
					
				);
				${$root}[]	= $temp;
			}
			// $temp = array(
			// 	"i_type"            => '2',
			// 	"c_code"			=>  $row["c_code"],
			// 	"d_cutoff_date"		=>	$row["d_cutoff_date"],
			// 	"asset_code"		=>	$row["asset_code"],
			// 	"asset_name"		=>	$row["asset_name"],
			// 	"i_period_year"		=>	$row["i_period_year"],
			// 	"f_unit_cost"		=>	$row["f_unit_cost"],
			// 	"f_depre"			=>	$row["f_depre"],
			// 	"f_acc_cost"		=>	$row["f_acc_cost"],
				
			// );
			// ${$root}[]	= $temp;
		}
		return json_encode(array("debug" => true,  $root => ${$root}));
	} else {
		if ($stmt) {


			$columns[] = "ลำดับ";
			$columns[] = "เลขที่ตัดจำหน่าย";
			$columns[] = "วันที่ตัดจำหน่าย";
			$columns[] = "รหัสครุภัณฑ์";
			$columns[] = "ชื่อครุภัณฑ์";
			$columns[] = "อายุการใช้งาน";
			$columns[] = "มูลค่าที่ได้มา";
			$columns[] = "ค่าเสื่อมสะสม";
			$columns[] = "อายุการใช้งาน";
			$columns[] = "มูลค่าสุทธิ";

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
					"c_code"			=>  $row["c_code"],
					"d_cutoff_date"		=> ($row["d_cutoff_date"] != "") ? $date->shot_date_from_db($row["d_cutoff_date"]) : "",
					"asset_code"		=>	$row["asset_code"],
					"asset_name"		=>	$row["asset_name"],
					"i_period_year"		=>	$row["i_period_year"],
					"f_unit_cost"		 =>	$row["f_unit_cost"]  == '' ? '0.00' : $row["f_unit_cost"],
					"f_depre"			=>	$row["f_depre"]  == '' ? '0.00' : $row["f_depre"],
					"f_acc_cost"		=>	$row["f_acc_cost"]  == '' ? '0.00' : $row["f_acc_cost"],


				);
				// foreach ($mm_arr as $value) {
				// 	$temp[$value] = $row[$value] == '' ? '0.00' : $row[$value];
				// }
				// $temp["f_mm_sum"] = $row["f_mm_sum"] == '' ? '0.00' : $row["f_mm_sum"];

				${$root}[]	= $temp;
			}
			$temp = array(
				"no"                => "รวมทั้งสิ้น",
				"c_code"			=>	'',
				"d_cutoff_date"			=>	'',
				"asset_code"			=>  '',
				"asset_name"			=>  '',
				"am_mode_name"		=>	'',
				"i_period_year"			=>	'',
				"f_unit_cost"       =>  $f_unit_cost == '' ? '0.00' : $f_unit_cost,
				"f_depre"     =>  $f_depre == '' ? '0.00' : $f_depre,
				"f_acc_cost"     =>  $f_acc_cost == '' ? '0.00' : $f_acc_cost,

			);
			// ${$root}[]	= $temp;
		}
		$xlsx = new ArrToXlsx();
		$xlsx->ArrToXlsx(${$root}, "รายงานตัดจำหน่าย");
	}
}
