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
	DECLARE @asssum AS int 
	DECLARE @yyyy_mm AS VARChar (6) = ?
	/*หายอดรวมครุภัณฑ์ทั้งหมด*/
	SELECT 
	@asssum = COUNT(am_asset_hdr_id) 
	FROM NMU_ERP..am_asset_hdr
	WHERE i_cutoff = 0  AND CAST(year (d_receive_date) as varchar (4))+Right('0'+CAST(Month (d_receive_date) as varchar (2)),2) = @yyyy_mm
	/*หายอดรวมครุภัณฑ์แต่ละประเภทและครุภัณฑ์*/
	SELECT 
	acc_name
	,@asssum as all_asset
	,COUNT(am_asset_hdr_id)*100.00/@asssum as ass_per
	,COUNT(am_asset_hdr_id) as all_mode
	FROM NMU_ERP..am_asset_hdr
	WHERE i_cutoff = 0  AND CAST(year (d_receive_date) as varchar (4))+Right('0'+CAST(Month (d_receive_date) as varchar (2)),2) = @yyyy_mm
	GROUP BY acc_name,acc_code
	ORDER BY acc_name,acc_code
 
	";

	$arrParam[]	= $_REQUEST['i_year'].$_REQUEST['mm_start'];
	$sum_mode = 0;
	$ass_per = 0;
	


	$stmt = $db->QueryParam($sqlMain, $arrParam);

	if ($_REQUEST["type"] != "excel2007") {
		if ($stmt) {
			
			$no=0;

			while ($row = $db->Fetch($stmt)) {
				

				$sum_mode += $row["all_mode"];
				$ass_per += $row["ass_per"];

				$temp = array(
					"no"                =>	++$no,
					"i_type"            =>	'1',
					"acc_name"			=>  $row["acc_name"],
					"all_asset"			=>	$row["all_asset"],
					"ass_per"			=>	number_format($row["ass_per"],2),
					"all_mode"			=>	$row["all_mode"],
					
				);
				${$root}[]	= $temp;
			}
			$temp = array(
				"i_type"            => '2',
				"acc_name"			=>  "",
				"all_asset"			=>	"",
				"ass_per"			=>	$ass_per,
				"all_mode"			=>	$sum_mode,
				
				
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
			$columns[] = "สินทรัพย์ที่ได้มาในเดือน";


			${$root}[] = $columns;
			$on = 0;
			while ($row = $db->Fetch($stmt)) {


				$temp = array(
					"no"                =>	++$on,
					"acc_name"			=>  $row["acc_name"],
					"all_asset"			=>	$row["all_asset"],
					"ass_per"			=>	$row["f_depre"],
					"all_mode"			=>	$row["all_mode"],


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
