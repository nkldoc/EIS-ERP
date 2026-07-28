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
	DECLARE @b_year AS int = ?
	DECLARE @s_year AS int =@b_year-1 ;
	DECLARE @d_star AS date = CONVERT(date,CAST(@s_year AS VARCHAR (4))+'-10-1');
	DECLARE @d_end  AS date = CONVERT(date,CAST(@b_year AS VARCHAR (4))+'-09-30');
	/*หายอดรวมครุภัณฑ์ทั้งหมด*/
	SELECT 
	@asssum = COUNT(am_asset_hdr_id) 
	FROM NMU_ERP..am_asset_hdr
	WHERE i_cutoff = 0  AND d_receive_date between @d_star AND @d_end
	/*หายอดรวมครุภัณฑ์แต่ละประเภทและครุภัณฑ์*/
	SELECT 
	acc_name
	,@asssum AS all_asset
	,COUNT(am_asset_hdr_id)*100.00/@asssum as ass_per
	,COUNT(am_asset_hdr_id) as all_asset_year
	FROM NMU_ERP..am_asset_hdr
	WHERE i_cutoff = 0  AND d_receive_date between @d_star AND @d_end
	GROUP BY acc_name,acc_code
	ORDER BY acc_name,acc_code
	";

	$arrParam[]	= $_REQUEST['i_year'];
	$sum_asset_year = 0;
	$ass_per = 0;
	


	$stmt = $db->QueryParam($sqlMain, $arrParam);

	if ($_REQUEST["type"] != "excel2007") {
		if ($stmt) {
			
			$no=0;

			while ($row = $db->Fetch($stmt)) {
				
				$ass_per += $row["ass_per"];
				$sum_asset_year += $row["all_asset_year"];
				

				
				$temp = array(
					"no"                =>	++$no,
					"i_type"            =>	'1',
					"acc_name"			=>  $row["acc_name"],
					"all_asset"			=>	$row["all_asset"],
					"ass_per"			=>	number_format($row["ass_per"],2),
					"all_asset_year"	=>	$row["all_asset_year"],
					
				);
				${$root}[]	= $temp;
			}
			$temp = array(
				"i_type"            => '2',
				"acc_name"			=>  "",
				"all_asset"			=>	"",
				"ass_per"			=>	$ass_per,
				"all_asset_year"	=>	$sum_asset_year,
				
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
