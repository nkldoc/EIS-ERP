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
	SET NOCOUNT ON;
DECLARE @c_yyyy_mm AS VARCHAR(6) = ?;
DECLARE @f_depre_all AS DECIMAL(18, 2);

SELECT @f_depre_all = SUM(f_depre)
FROM am_tran_depre a
	INNER JOIN am_mode_acc b ON a.am_mode_id = b.am_mode_id
WHERE a.c_yyyy_mm = @c_yyyy_mm;

SELECT b.c_acc_code, b.c_acc_name
, (SUM(f_depre)*100.00)/@f_depre_all AS f_per
, SUM(f_depre) AS f_depre
FROM am_tran_depre a
	INNER JOIN am_mode_acc b ON a.am_mode_id = b.am_mode_id
WHERE a.c_yyyy_mm = @c_yyyy_mm
GROUP BY b.c_acc_code, b.c_acc_name
ORDER BY b.c_acc_code, b.c_acc_name;
 
	";

	$arrParam[]	= $_REQUEST['i_year'].$_REQUEST['mm_start'];
	$f_per = 0;
	$f_depre = 0;

	


	$stmt = $db->QueryParam($sqlMain, $arrParam);

	if ($_REQUEST["type"] != "excel2007") {
		if ($stmt) {
			
			$no=0;

			while ($row = $db->Fetch($stmt)) {
				
				$f_per += $row["f_per"];
				$f_depre += $row["f_depre"];
				

				$temp = array(
					"no"                =>	++$no,
					"i_type"            =>	'1',
					"c_acc_code"			=>  $row["c_acc_code"],
					"c_acc_name"			=>	$row["c_acc_name"],
					"f_per"			=>	number_format($row["f_per"],2),
					"f_depre"			=>	$row["f_depre"],
					
				);
				${$root}[]	= $temp;
			}
			$temp = array(
				"i_type"            => '2',
				"c_acc_code"			=>  "",
				"c_acc_name"			=>	"",
				"f_per"			=>	$f_per,
				"f_depre"			=>	$f_depre,
				
				
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
			$columns[] = "ค่าเสื่อมราคา";


			${$root}[] = $columns;
			$on = 0;
			while ($row = $db->Fetch($stmt)) {


				$temp = array(
					"no"                =>	++$on,
					"i_type"            =>	'1',
					"c_acc_code"			=>  $row["c_acc_code"],
					"c_acc_name"			=>	$row["c_acc_name"],
					"f_pre"			=>	number_format($row["f_pre"],2),
					"f_depre"			=>	$row["f_depre"],

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
				"all_mode"			=>	'',


			);
			// ${$root}[]	= $temp;
		}
		$xlsx = new ArrToXlsx();
		$xlsx->ArrToXlsx(${$root}, "รายงานตัดจำหน่าย");
	}
}
