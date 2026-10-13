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
DECLARE @i_budget1 AS INT = ?;
DECLARE @c_yyyy_mm_s1 AS VARCHAR(6) = CAST((@i_budget1-1) AS VARCHAR(4))+'10';
DECLARE @c_yyyy_mm_e1 AS VARCHAR(6) = CAST(@i_budget1 AS VARCHAR(4))+'09';
DECLARE @max_yyyy_mm1 AS VARCHAR(6);

SELECT @max_yyyy_mm1 = MAX(c_yyyy_mm) 
FROM am_tran_depre 
WHERE c_yyyy_mm BETWEEN @c_yyyy_mm_s1 AND @c_yyyy_mm_e1;

DECLARE @i_budget2 AS INT = ?;
DECLARE @c_yyyy_mm_s2 AS VARCHAR(6) = CAST((@i_budget2-1) AS VARCHAR(4))+'10';
DECLARE @c_yyyy_mm_e2 AS VARCHAR(6) = CAST(@i_budget2 AS VARCHAR(4))+'09';
DECLARE @max_yyyy_mm2 AS VARCHAR(6);

SELECT @max_yyyy_mm2 = MAX(c_yyyy_mm) 
FROM am_tran_depre 
WHERE c_yyyy_mm BETWEEN @c_yyyy_mm_s2 AND @c_yyyy_mm_e2;

SELECT b.c_acc_code, b.c_acc_name
, SUM(CASE WHEN c_yyyy_mm = @max_yyyy_mm1 THEN f_depre_after ELSE 0.00 END) AS f_depre1
, SUM(CASE WHEN c_yyyy_mm = @max_yyyy_mm2 THEN f_depre_after ELSE 0.00 END) AS f_depre2
FROM am_tran_depre a
	INNER JOIN am_mode_acc b ON a.am_mode_id = b.am_mode_id
WHERE a.c_yyyy_mm IN (@max_yyyy_mm1, @max_yyyy_mm2)
GROUP BY b.c_acc_code, b.c_acc_name
ORDER BY b.c_acc_code, b.c_acc_name;
	";

	$arrParam[]	= $_REQUEST['i_year1'];
	$arrParam[]	= $_REQUEST['i_year2'];
	$sumy1 	= 0 ;
	$sumy2 	= 0 ;
	


	$stmt = $db->QueryParam($sqlMain, $arrParam);

	if ($_REQUEST["type"] != "excel2007") {
		if ($stmt) {
			
			$no=0;

			while ($row = $db->Fetch($stmt)) {
				

				 $sumy1  += $row["f_depre1"];
				 $sumy2  += $row["f_depre2"];

				
				$temp = array(
					"no"                =>	++$no,
					"i_type"            =>	'1',
					"acc_code"			=>  $row["c_acc_code"],
					"acc_name"			=>	$row["c_acc_name"],
					"y1"				=>	$row["f_depre1"],
					"y2"	            =>	$row["f_depre2"],
					
				);
				${$root}[]	= $temp;
			}
			$temp = array(
				"i_type"            => '2',
				"acc_code"			=>  "",
				"acc_name"			=>	"",
				"y1"				=>	$sumy1,
				"y2"	            =>	$sumy2,
				
			);
			${$root}[]	= $temp;
		}
		return json_encode(array("debug" => true,  $root => ${$root}));
	} else {
		if ($stmt) {


			$columns[] = "ลำดับ";
			$columns[] = "รหัสหมวดทรัพย์สิน";
			$columns[] = "หมวดทรัพย์สิน";
			$columns[] = "ปี1";
			$columns[] = "ปี2";


			${$root}[] = $columns;
			$on = 0;
			while ($row = $db->Fetch($stmt)) {


				$temp = array(
					"no"                =>	++$on,
					"acc_code"			=>  $row["c_acc_code"],
					"acc_name"			=>	$row["c_acc_name"],
					"y1"				=>	$row["f_depre1"],
					"y2"	            =>	$row["f_depre2"],


				);
				// foreach ($mm_arr as $value) {
				// 	$temp[$value] = $row[$value] == '' ? '0.00' : $row[$value];
				// }
				// $temp["f_mm_sum"] = $row["f_mm_sum"] == '' ? '0.00' : $row["f_mm_sum"];

				${$root}[]	= $temp;
			}
			$temp = array(

				"no"                =>	"รวมทั้งสิ้น",
				"acc_code"			=>  '',
				"acc_name"			=>	'',
				"y1"			=>	'',
				"y2"	=>	'',


			);
			// ${$root}[]	= $temp;
		}
		$xlsx = new ArrToXlsx();
		$xlsx->ArrToXlsx(${$root}, "รายงานตัดจำหน่าย");
	}
}
