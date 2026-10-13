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
	DECLARE @a1_year AS int =?;
	DECLARE @s1_year AS int = @a1_year -1;
	DECLARE @d1_start AS  date = CONVERT (date, CAST (@s1_year AS VARCHAR(4))+'-10-01');
	DECLARE @d1_end   AS  date = CONVERT (date, CAST (@a1_year AS VARCHAR(4))+'-09-30');
	/*หาวันเดือนปี ของ ปี 2 */
	DECLARE @a2_year AS int =?;
	DECLARE @s2_year AS int = @a2_year -1;
	DECLARE @d2_start AS  date = CONVERT (date, CAST (@s2_year AS VARCHAR(4))+'-10-01');
	DECLARE @d2_end   AS  date = CONVERT (date, CAST (@a2_year AS VARCHAR(4))+'-09-30');
	/*ปีที่ 1*/
	select isnull(a.acc_code,b.acc_code) as acc_code
	,isnull(a.acc_name,b.acc_name) as acc_name
	,isnull(a.all_asset,0) as y1
	,isnull(b.all_asset,0) as y2
	 from (
	SELECT 
	acc_code
	,acc_name
	,COUNT(am_asset_hdr_id) as all_asset
	--into #a
	FROM NMU_ERP..am_asset_hdr
	WHERE (d_cutoff_date > @d1_end OR i_cutoff = 0) AND d_receive_date between @d1_start AND @d1_end
	GROUP BY acc_name,acc_code
	
	) a full join ( 
	/*ปีที่ 2*/
	SELECT 
	acc_code
	,acc_name
	,COUNT(am_asset_hdr_id) as all_asset
	FROM NMU_ERP..am_asset_hdr
	WHERE (d_cutoff_date > @d2_end OR i_cutoff = 0) AND d_receive_date between @d2_start AND @d2_end
	GROUP BY acc_name,acc_code
	) b on a.acc_code = b.acc_code
	ORDER BY a.acc_name,a.acc_code
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
				

				 $sumy1  += $row["y1"];
				 $sumy2  += $row["y2"];

				
				$temp = array(
					"no"                =>	++$no,
					"i_type"            =>	'1',
					"acc_code"			=>  $row["acc_code"],
					"acc_name"			=>	$row["acc_name"],
					"y1"				=>	$row["y1"],
					"y2"	            =>	$row["y2"],
					
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
					"acc_code"			=>  $row["acc_code"],
					"acc_name"			=>	$row["acc_name"],
					"y1"			=>	$row["y1"],
					"y2"	=>	$row["y2"],


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
